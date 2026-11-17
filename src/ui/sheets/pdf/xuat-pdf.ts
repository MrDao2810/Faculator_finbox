/**
 * Xuất file PDF ngay trong trình duyệt (17/11/2026) — thay `window.print()` và thẻ PNG.
 *
 * Bốn bước: dựng nội dung (`buildExportDocument`, tầng Domain) → chụp hình công thức và biểu đồ
 * đang hiện trên trang → tải font → vẽ bằng pdf-lib (`ve-pdf.ts`) → lưu file.
 *
 * Cả module nạp bằng `import()` trần từ `ExportSheet` lúc bấm nút, nên pdf-lib, fontkit và bộ dựng
 * nội dung không vào First Load JS của trang nào (NFR-PER-04). Font tải cùng nguồn (`/fonts/`), đúng
 * `font-src 'self'` sẵn có của `public/_headers` — không thêm nguồn ngoài nào.
 */

import type { CalcOutput, ExportData, ExportOptions, FormulaSpec } from '@/application';
import { buildExportDocument, exportFileName } from '@/application/export-document';

import { canFontToan, vePdf, type PdfImage } from './ve-pdf';

/** Hệ số phóng khi chụp, cho nét đủ sắc khi in và phóng to trên điện thoại. */
const PHONG = 3;

export interface XuatPdfArgs {
  formula: FormulaSpec;
  output: CalcOutput;
  inputs: Readonly<Record<string, number>>;
  options: ExportOptions;
  data: ExportData;
  interpretation?: string;
  /** MathML của hình công thức (bản tiếng Việt), dựng sẵn lúc build. */
  formulaMathml?: string;
}

export async function xuatPdf(args: XuatPdfArgs): Promise<void> {
  const doc = buildExportDocument(
    args.formula,
    args.output,
    args.inputs,
    args.options,
    args.data,
    args.interpretation,
  );

  const [regular, bold, hinhCongThuc, hinhBieuDo] = await Promise.all([
    taiFont('NotoSans-Regular.ttf'),
    taiFont('NotoSans-Bold.ttf'),
    args.formulaMathml === undefined ? null : chupMathml(args.formulaMathml).catch(() => null),
    args.options.includeChart ? chupBieuDo(args.formula.id).catch(() => null) : null,
  ]);
  const math = canFontToan(doc, regular) ? await taiFont('NotoSansMath-Regular.ttf') : undefined;

  const bytes = await vePdf(
    doc,
    { regular, bold, ...(math === undefined ? {} : { math }) },
    { formula: hinhCongThuc, chart: hinhBieuDo },
  );
  await luuFile(bytes, exportFileName(args.formula), doc.title);
}

async function taiFont(name: string): Promise<Uint8Array> {
  const res = await fetch(`/fonts/${name}`);
  if (!res.ok) throw new Error(`Không tải được font ${name}`);
  return new Uint8Array(await res.arrayBuffer());
}

/** Vẽ một ảnh (SVG data URL) lên canvas rồi lấy PNG. Ném khi canvas bị khoá (Safari với `foreignObject`). */
async function veLenCanvas(img: HTMLImageElement, w: number, h: number): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('Không có canvas 2D');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
  if (blob === null) throw new Error('Canvas không xuất được PNG');
  return new Uint8Array(await blob.arrayBuffer());
}

function napAnh(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error('Không nạp được ảnh'));
    };
    img.src = url;
  });
}

/**
 * Chụp hình công thức: đặt MathML vào một khung ngoài màn để đo, gói vào SVG `foreignObject`, vẽ
 * lên canvas. Hình dùng font toán của hệ thống như trên trang. Trình duyệt nào khoá canvas (Safari
 * có thể) thì ném, và file in dòng chữ thay thế (`ExportBlock.formula.fallback`).
 */
async function chupMathml(mathml: string): Promise<PdfImage> {
  const XHTML = 'http://www.w3.org/1999/xhtml';
  const khung = document.createElementNS(XHTML, 'div') as HTMLDivElement;
  khung.setAttribute(
    'style',
    'position:fixed;left:-10000px;top:0;display:inline-block;padding:6px 10px;' +
      'font-size:22px;line-height:1.2;color:#111827;background:#ffffff;white-space:nowrap',
  );
  khung.innerHTML = mathml;
  document.body.appendChild(khung);
  try {
    const rect = khung.getBoundingClientRect();
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);
    if (w <= 0 || h <= 0) throw new Error('Hình công thức không có kích thước');
    // Chép rồi mới bỏ định vị ngoài màn: sửa thẳng `khung` thì nó hiện ra cuối trang trong lúc chờ ảnh.
    const ban = khung.cloneNode(true) as HTMLDivElement;
    ban.style.position = 'static';
    ban.style.left = '0';
    const xml = new XMLSerializer().serializeToString(ban);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w * PHONG}" height="${h * PHONG}" ` +
      `viewBox="0 0 ${w} ${h}"><foreignObject x="0" y="0" width="${w}" height="${h}">${xml}` +
      `</foreignObject></svg>`;
    const img = await napAnh(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    const png = await veLenCanvas(img, w * PHONG, h * PHONG);
    return { png, width: w, height: h };
  } finally {
    khung.remove();
  }
}

/** Chụp biểu đồ đang hiện trên trang — dùng lại `chart-snapshot.ts`, luôn bảng màu sáng. */
async function chupBieuDo(formulaId: string): Promise<PdfImage | null> {
  const { chartImage, chartSvgUrl, cloneChartSvg } = await import('../chart-snapshot');
  const svg = cloneChartSvg(formulaId);
  if (svg === null) return null;
  const url = chartSvgUrl(svg);
  if (url === null) return null;
  const img = await chartImage(url);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (w <= 0 || h <= 0) return null;
  const png = await veLenCanvas(img, w, h);
  return { png, width: w / PHONG, height: h / PHONG };
}

/**
 * Lưu file. Mặc định là liên kết `download` — chạy trên trình duyệt PC, Android và Safari iOS. Ứng
 * dụng đã cài lên màn hình chính của iOS (chế độ standalone) bỏ qua `download` với blob, nên ở đó
 * mở bảng chia sẻ của máy với chính file ấy (có mục "Lưu vào Tệp").
 */
async function luuFile(bytes: Uint8Array, name: string, title: string): Promise<void> {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });

  if (laUngDungIos() && typeof File !== 'undefined') {
    const file = new File([blob], name, { type: 'application/pdf' });
    if (navigator.canShare?.({ files: [file] }) === true) {
      try {
        await navigator.share({ files: [file], title });
        return;
      } catch (error) {
        // Người dùng tự đóng bảng chia sẻ: không phải lỗi, không rơi xuống tải tiếp.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Safari cần URL sống thêm một lúc sau khi bấm; thu hồi ngay là tải về file rỗng.
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
}

function laUngDungIos(): boolean {
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    (typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches);
  return standalone && /iP(hone|ad|od)/.test(navigator.userAgent);
}
