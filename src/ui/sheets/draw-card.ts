/**
 * Tầng PRESENTATION — vẽ thẻ chia sẻ PNG bằng Canvas (gói WBS 2.5.3).
 *
 * Vì sao tự vẽ thay vì chụp màn hình DOM: chụp DOM cần html2canvas (~200 kB) và vẫn hay sai
 * font với hỏng bố cục. Ở đây vẽ một tấm thẻ có chủ đích — đúng tinh thần "PNG chia sẻ nhanh"
 * mà WF-12 mô tả, và không thêm dependency nào (NFR-PER-04).
 *
 * Câu miễn trừ lấy từ `ExportContent.disclaimer`, mà `buildExportContent()` luôn điền — không
 * có đường nào vẽ ra tấm thẻ thiếu miễn trừ (FR-24).
 *
 * CỐ Ý dùng `t()` build-time (tiếng Việt) chứ không theo locale: tấm PNG là file xuất, và
 * file xuất là tài liệu tiếng Việt trọn vẹn — nội dung từ `buildExportContent` (tầng Domain,
 * không đọc được i18n) lẫn câu miễn trừ đều tiếng Việt. Xem chú thích cùng lý do ở vùng in
 * của `ExportSheet.tsx`.
 */

import { t } from '@/application';
import type { ExportContent } from '@/application';

const WIDTH = 1080;
const PADDING = 72;
const LINE = 44;

/**
 * Bảng màu của tấm thẻ — GHIM ở bảng sáng, không đọc token đang áp dụng.
 *
 * Bản trước đọc `getComputedStyle(document.documentElement)` để "thẻ PNG cùng bảng màu với giao
 * diện". Từ khi có giao diện tối thì điều đó nghĩa là ai bật Tối sẽ xuất ra một tấm thẻ nền tối
 * — kể cả ô miễn trừ FR-24.
 *
 * Chốt: file xuất luôn nền sáng, cùng lẽ với việc file xuất luôn là tài liệu tiếng Việt dù giao
 * diện đang tiếng Anh (xem docblock đầu file). Tấm PNG rời khỏi màn hình và sống tiếp một mình —
 * dán vào báo cáo, gửi qua chat, đem đi in — nên nó theo quy ước của TÀI LIỆU, không theo tuỳ
 * chọn hiển thị của người vừa bấm nút. Bản in `@media print` vốn đã ghim `#000`/`#fff`, nay hai
 * đường xuất file nói cùng một thứ.
 *
 * Sáu giá trị này chép từ `:root` của globals.css. Không đọc token được nữa thì đây là bản chép,
 * và `draw-card.test.ts` đối chiếu từng mã màu với globals.css để bản chép không lệch âm thầm.
 */
const CARD_COLORS = {
  paper: '#ffffff', // --color-surface
  ink: '#1a2233', // --color-ink
  inkSoft: '#46536b', // --color-ink-soft
  muted: '#58657a', // --color-muted
  accent: '#1d4ed8', // --color-accent
  border: '#d7dee9', // --color-border
  warnBg: '#f8e7b4', // --color-warning-soft
  warnInk: '#7a5f14', // --color-warning
} as const;

/** Cắt chuỗi thành nhiều dòng vừa bề ngang cho trước. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter((word) => word !== '');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current === '' ? word : `${current} ${word}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current !== '') lines.push(current);
    current = word;
  }
  if (current !== '') lines.push(current);
  return lines;
}

/**
 * Chiều cao tối đa của hình biểu đồ trên thẻ.
 *
 * Thác nước bốn chặng cao hơn đường quét khá nhiều, và tấm thẻ vốn đã dài (tiêu đề, kết quả, bảng
 * đầu vào, khung miễn trừ). Trần này giữ hình không nuốt cả thẻ; hình cao hơn thì thu nhỏ theo tỉ
 * lệ chứ không cắt.
 */
const CHART_MAX_HEIGHT = 420;

/** Khổ hình sau khi thu vừa bề ngang trong lề, giữ nguyên tỉ lệ. */
function fitChart(chart: HTMLImageElement, maxWidth: number): { w: number; h: number } {
  const w0 = chart.naturalWidth;
  const h0 = chart.naturalHeight;
  if (w0 <= 0 || h0 <= 0) return { w: maxWidth, h: 260 };

  const scale = Math.min(maxWidth / w0, CHART_MAX_HEIGHT / h0);
  return { w: Math.round(w0 * scale), h: Math.round(h0 * scale) };
}

/**
 * Vẽ thẻ chia sẻ và trả về canvas.
 * Đo trước rồi mới vẽ nên chiều cao vừa khít nội dung, không thừa khoảng trắng ở đáy.
 *
 * `chart` là hình biểu đồ ĐÃ NẠP XONG — hàm này đồng bộ nên không tự nạp được, và người gọi
 * (`downloadCardPng`) là chỗ duy nhất biết chờ. Vắng nó thì chỗ ấy là khung nét đứt kèm câu nói
 * rõ vì sao trống, chứ không phải một mảng trắng không giải thích.
 */
export function drawExportCard(
  content: ExportContent,
  chart?: HTMLImageElement | null,
): HTMLCanvasElement {
  const { paper, ink, inkSoft, muted, accent, border, warnBg, warnInk } = CARD_COLORS;

  const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
  const inner = WIDTH - PADDING * 2;

  // Lượt một: đo. Dùng canvas tạm vì phải đặt font mới đo được chữ.
  const probe = document.createElement('canvas').getContext('2d');
  if (probe === null) throw new Error('Trình duyệt không cho dùng canvas 2D.');

  probe.font = `700 56px ${sans}`;
  const titleLines = wrap(probe, content.title, inner);

  probe.font = `400 28px ${sans}`;
  const interpretationLines =
    content.interpretation === undefined ? [] : wrap(probe, content.interpretation, inner);
  const disclaimerLines = wrap(probe, content.disclaimer, inner - 48);
  // Câu "đầu vào là bản thảo" chỉ có khi người dùng nạp bộ mẫu — tấm PNG được chia sẻ ra
  // ngoài, người nhận không còn cách nào khác để biết nguồn số liệu.
  const draftLines =
    content.draftNote === undefined ? [] : wrap(probe, content.draftNote, inner - 48);

  const rows = content.inputs.length;
  const chartFit =
    content.includeChart && chart !== undefined && chart !== null ? fitChart(chart, inner) : null;
  const chartBox = content.includeChart ? (chartFit?.h ?? 260) : 0;

  const height =
    PADDING +
    titleLines.length * 64 +
    32 +
    96 + // dòng kết quả
    (interpretationLines.length > 0 ? interpretationLines.length * 38 + 16 : 0) +
    (chartBox > 0 ? chartBox + 32 : 0) +
    (rows > 0 ? rows * LINE + 32 : 0) +
    (draftLines.length > 0 ? draftLines.length * 34 + 24 : 0) +
    disclaimerLines.length * 38 +
    48 +
    PADDING;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = Math.round(height);

  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('Trình duyệt không cho dùng canvas 2D.');

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let y = PADDING;

  ctx.fillStyle = ink;
  ctx.font = `700 56px ${sans}`;
  ctx.textBaseline = 'top';
  for (const line of titleLines) {
    ctx.fillText(line, PADDING, y);
    y += 64;
  }
  y += 32;

  ctx.fillStyle = accent;
  ctx.font = `700 80px ${sans}`;
  ctx.fillText(content.result, PADDING, y);
  y += 96;

  if (interpretationLines.length > 0) {
    ctx.fillStyle = inkSoft;
    ctx.font = `400 28px ${sans}`;
    for (const line of interpretationLines) {
      ctx.fillText(line, PADDING, y);
      y += 38;
    }
    y += 16;
  }

  if (chartBox > 0) {
    if (chartFit !== null && chart !== undefined && chart !== null) {
      // Căn giữa: hình chạm trần chiều cao sẽ hẹp hơn bề ngang trong lề, và lệch trái trông như lỗi.
      ctx.drawImage(chart, PADDING + (inner - chartFit.w) / 2, y, chartFit.w, chartFit.h);
    } else {
      ctx.strokeStyle = border;
      ctx.setLineDash([10, 8]);
      ctx.strokeRect(PADDING, y, inner, chartBox);
      ctx.setLineDash([]);

      ctx.fillStyle = muted;
      ctx.font = `400 26px ${sans}`;
      /*
       * Cùng câu với vùng in PDF, lấy từ i18n chứ không viết thẳng.
       *
       * Trước đợt này chỗ này in "Biểu đồ — gói WBS 3.3" — sổ sách kế hoạch nội bộ đi thẳng vào
       * tấm PNG người dùng chia sẻ ra ngoài. Đợt 14 đã dọn đường PDF nhưng bỏ sót đường PNG, và
       * ca kiểm chặn /WBS|nhánh \d|gói \d/ chỉ soi màn chi tiết nên không với tới Canvas.
       */
      ctx.fillText(t('export.chartNone'), PADDING + 24, y + 24);
    }
    y += chartBox + 32;
  }

  if (rows > 0) {
    ctx.font = `400 30px ${sans}`;
    for (const input of content.inputs) {
      ctx.fillStyle = muted;
      ctx.fillText(input.label, PADDING, y);

      ctx.fillStyle = ink;
      const width = ctx.measureText(input.value).width;
      ctx.fillText(input.value, WIDTH - PADDING - width, y);

      ctx.strokeStyle = border;
      ctx.beginPath();
      ctx.moveTo(PADDING, y + LINE - 10);
      ctx.lineTo(WIDTH - PADDING, y + LINE - 10);
      ctx.stroke();

      y += LINE;
    }
    y += 32;
  }

  // Nguồn số liệu đầu vào — chữ nghiêng nhạt hơn, đặt ngay trên khung miễn trừ.
  if (draftLines.length > 0) {
    ctx.fillStyle = muted;
    ctx.font = `italic 400 24px ${sans}`;
    for (const line of draftLines) {
      ctx.fillText(line, PADDING, y + 20);
      y += 34;
    }
    y += 24;
  }

  // Miễn trừ — FR-24. Nằm trong khung riêng để không lẫn với phần nội dung.
  const boxHeight = disclaimerLines.length * 38 + 32;
  ctx.fillStyle = warnBg;
  ctx.fillRect(PADDING, y, inner, boxHeight);

  ctx.fillStyle = warnInk;
  ctx.font = `500 26px ${sans}`;
  let dy = y + 16;
  for (const line of disclaimerLines) {
    ctx.fillText(line, PADDING + 24, dy);
    dy += 38;
  }

  return canvas;
}

/** Tải tấm thẻ về máy. Không có backend nên mọi thứ nằm trọn trên trình duyệt (NFR-SEC-01). */
export async function downloadCardPng(
  content: ExportContent,
  fileName: string,
  chart?: HTMLImageElement | null,
): Promise<void> {
  const canvas = drawExportCard(content, chart);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
  if (blob === null) throw new Error('Không tạo được ảnh PNG.');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
