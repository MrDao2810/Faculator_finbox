/**
 * Tầng DOMAIN — đọc chuỗi giá dán từ Excel / CSV (gói WBS 2.5.2).
 *
 * FR-11 · SW-03: "Dán từ Excel/CSV qua clipboard, gán cột, kiểm tra hợp lệ trước khi nạp."
 * FR-12: chính cơ chế này giữ được Beta, Sharpe, Sortino, MaxDD và VaR trong bản đầu — những
 * công thức cần chuỗi giá dài mà chưa có nguồn dữ liệu thời gian thực.
 *
 * WF-11 chốt ba thứ giao diện phải hiện, và cả ba đều tính ở đây chứ không ở component:
 *   · số dòng hợp lệ — "✓ 62 dòng hợp lệ, sẵn sàng nạp";
 *   · số dòng bỏ qua KÈM LÝ DO VÀ SỐ DÒNG — "! 2 dòng bỏ qua: thiếu cột giá đóng cửa
 *     (dòng 41, 58)". Số dòng đếm theo đúng vị trí trong chuỗi người dùng dán, để họ mở
 *     Excel ra là tìm thấy ngay;
 *   · gán cột Ngày · Mở · Cao · Thấp · Đóng.
 *
 * Toàn bộ file là hàm thuần nên test được bằng Node và không cần thư viện CSV nào.
 */

import { parseViNumber } from './format';
import { normalizeVi } from './registry/search';

/** Vai trò của một cột trong bảng dán vào. */
export type ColumnKind = 'date' | 'open' | 'high' | 'low' | 'close' | 'volume' | 'ignore';

/** Nhãn tiếng Việt của từng cột, đúng chữ WF-11 dùng trong ô "Gán cột". */
export const COLUMN_LABELS: Readonly<Record<ColumnKind, string>> = {
  date: 'Ngày',
  open: 'Mở',
  high: 'Cao',
  low: 'Thấp',
  close: 'Đóng',
  volume: 'KL',
  ignore: 'Bỏ qua',
};

/** Thứ tự cột mặc định khi đoán theo vị trí — đúng thứ tự Excel của các sàn Việt Nam. */
const POSITIONAL_ORDER: ReadonlyArray<ColumnKind> = [
  'date',
  'open',
  'high',
  'low',
  'close',
  'volume',
];

/** Từ khoá nhận diện tiêu đề cột, đã bỏ dấu. Cả tiếng Việt lẫn tiếng Anh vì file tải về hay lẫn. */
const HEADER_WORDS: ReadonlyArray<{ kind: ColumnKind; words: ReadonlyArray<string> }> = [
  { kind: 'date', words: ['ngay', 'date', 'thoi gian', 'time', 'phien'] },
  { kind: 'open', words: ['mo', 'mo cua', 'open', 'gia mo cua'] },
  { kind: 'high', words: ['cao', 'cao nhat', 'high'] },
  { kind: 'low', words: ['thap', 'thap nhat', 'low'] },
  { kind: 'close', words: ['dong', 'dong cua', 'close', 'gia dong cua', 'gia'] },
  { kind: 'volume', words: ['kl', 'khoi luong', 'volume', 'vol', 'kl khop lenh'] },
];

/** Một phiên giá đã đọc được. */
export interface PriceBar {
  /**
   * Ngày dạng thô đúng như người dùng dán — '15/07', '2025-07-15'…
   * KHÔNG tự suy ra năm còn thiếu: tầng Domain không được lấy ngày hệ thống (NFR-REL-03),
   * và đoán sai năm còn tệ hơn là để nguyên.
   */
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  /** Giá đóng cửa — trường bắt buộc, thiếu là dòng bị bỏ qua. */
  close: number;
  volume: number | null;
  /** Vị trí dòng trong chuỗi đã dán, đếm từ 1. */
  line: number;
}

/** Một dòng bị bỏ qua, kèm lý do đọc được và số dòng để người dùng dò lại (WF-11). */
export interface SkippedRow {
  line: number;
  reason: string;
  /** Nội dung thô của dòng, cắt ngắn để hiện trong danh sách. */
  raw: string;
}

export interface PasteResult {
  /** Cột đã gán, theo đúng thứ tự cột trong dữ liệu dán. */
  columns: ReadonlyArray<ColumnKind>;
  /** Ký tự ngăn cột đã nhận ra. */
  delimiter: string;
  /** Có bỏ qua dòng tiêu đề ở đầu không. */
  hasHeader: boolean;
  rows: ReadonlyArray<PriceBar>;
  skipped: ReadonlyArray<SkippedRow>;
  /** Số dòng đã cắt bỏ vì vượt trần. 0 là bình thường. */
  truncated: number;
}

/**
 * Trần số dòng xử lý một lần.
 * 5.000 phiên là hơn 19 năm giao dịch — thừa cho mọi công thức trong sản phẩm, mà vẫn chặn
 * được trường hợp dán nhầm cả file trăm nghìn dòng làm treo trình duyệt (NFR-PER-02).
 */
export const MAX_PASTE_LINES = 5_000;

/** Cắt ngắn nội dung dòng để hiện trong danh sách lỗi. */
const RAW_PREVIEW = 40;

/**
 * Nhận ra ký tự ngăn cột.
 * Dán thẳng từ Excel là Tab; tải file về thường là phẩy hoặc chấm phẩy. Chọn ký tự xuất hiện
 * đều đặn nhất, không phải nhiều nhất — số tiền có dấu chấm và dấu phẩy nên đếm thô sẽ sai.
 */
export function detectDelimiter(text: string): string {
  const lines = nonEmptyLines(text).slice(0, 20);
  if (lines.length === 0) return '\t';

  const candidates = ['\t', ';', ',', '|'];
  let best = '\t';
  let bestScore = -1;

  for (const candidate of candidates) {
    const counts = lines.map((line) => line.text.split(candidate).length - 1);
    const min = Math.min(...counts);
    if (min < 1) continue;

    // Đều đặn = mọi dòng cùng số lần xuất hiện. Ưu tiên đều trước, rồi mới tới nhiều cột.
    const consistent = counts.every((c) => c === min);
    const score = (consistent ? 1000 : 0) + min;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  // Không có ký tự nào ra hồn thì thử khoảng trắng liên tiếp — vài nơi xuất kiểu cột căn lề.
  if (bestScore < 0 && lines.some((line) => /\S\s{2,}\S/.test(line.text))) return '  ';

  return best;
}

/**
 * Dòng có nội dung, kèm số dòng gốc.
 *
 * KHÔNG trim cả dòng — chỉ bỏ dòng toàn khoảng trắng. Trim cả dòng sẽ xoá mất ô rỗng đứng
 * đầu, và dòng `⇥25.4` (thiếu ngày) sẽ tụt hết cột sang trái thành ra đọc nhầm giá thành
 * ngày. Ô nào thừa khoảng trắng thì `splitLine()` trim riêng từng ô.
 */
function nonEmptyLines(text: string): Array<{ line: number; text: string }> {
  return text
    .split(/\r\n|\r|\n/)
    .map((raw, index) => ({ line: index + 1, text: raw }))
    .filter((row) => row.text.trim() !== '');
}

/** Tách một dòng thành các ô. Ký tự ngăn '  ' nghĩa là cắt theo khoảng trắng liên tiếp. */
function splitLine(text: string, delimiter: string): string[] {
  const cells = delimiter === '  ' ? text.split(/\s{2,}/) : text.split(delimiter);
  return cells.map((cell) => cell.trim());
}

/**
 * Dòng này có phải tiêu đề không.
 *
 * Đòi HAI điều cùng lúc, và cả hai đều cần thiết:
 *   · không ô nào đọc ra số;
 *   · ít nhất một ô khớp từ khoá tiêu đề đã biết.
 *
 * Chỉ xét "ít ô số" là không đủ: dòng dữ liệu hai cột `15/07⇥25.4` có đúng một ô số (vì
 * '15/07' không phải số) nên sẽ bị nuốt mất như thể là tiêu đề. Đòi thêm từ khoá thì dòng
 * dữ liệu không bao giờ lọt.
 */
function looksLikeHeader(cells: ReadonlyArray<string>): boolean {
  if (cells.length < 2) return false;
  if (cells.some((cell) => parseViNumber(cell) !== null)) return false;
  return cells.some((cell) => headerKindOf(cell) !== undefined);
}

/** Vai trò cột suy từ một ô tiêu đề, hoặc undefined nếu không nhận ra. */
function headerKindOf(cell: string): ColumnKind | undefined {
  const text = normalizeVi(cell)
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return HEADER_WORDS.find((entry) => entry.words.includes(text))?.kind;
}

/**
 * Gán cột từ dòng tiêu đề, hoặc đoán theo vị trí nếu không có tiêu đề.
 *
 * Người dùng sửa lại được ở giao diện — đây chỉ là phỏng đoán ban đầu để đỡ phải bấm.
 */
export function guessColumns(cells: ReadonlyArray<string>, isHeader: boolean): ColumnKind[] {
  if (isHeader) {
    const used = new Set<ColumnKind>();
    return cells.map((cell) => {
      const kind = headerKindOf(cell);
      // Tiêu đề trùng nhau thì chỉ cột đầu được nhận — hai cột 'Đóng' không thể cùng là giá đóng.
      if (kind === undefined || used.has(kind)) return 'ignore';
      used.add(kind);
      return kind;
    });
  }

  // Không có tiêu đề: cột đầu là ngày nếu nó không đọc ra số.
  const firstIsDate = cells.length > 0 && parseViNumber(cells[0] ?? '') === null;
  const valueCount = cells.length - (firstIsDate ? 1 : 0);
  const values = positionalValues(valueCount);

  return cells.map((_, index) => {
    if (firstIsDate && index === 0) return 'date';
    return values[index - (firstIsDate ? 1 : 0)] ?? 'ignore';
  });
}

/**
 * Vai trò của các cột SỐ khi bảng không có tiêu đề.
 *
 * Từ 4 cột trở lên thì theo đúng thứ tự OHLCV quen thuộc. Dưới 4 cột thì cột CUỐI luôn là giá
 * đóng cửa — bảng "Ngày · Giá" hai cột là kiểu dán phổ biến nhất, mà nếu máy móc gán cột thứ
 * hai thành 'Mở' thì bảng không có giá đóng cửa và MỌI dòng bị loại. Thà đoán cột cuối là giá
 * đóng cửa: sai thì người dùng gán lại một lần, còn đúng thì họ không phải làm gì.
 */
function positionalValues(count: number): ColumnKind[] {
  if (count <= 0) return [];
  if (count >= 4) return [...POSITIONAL_ORDER.slice(1)].slice(0, count);

  const head: ColumnKind[] = ['open', 'high', 'low'];
  return [...head.slice(0, count - 1), 'close'];
}

/**
 * Đọc chuỗi người dùng dán thành danh sách phiên giá.
 *
 * Không ném lỗi bao giờ: dòng nào đọc không được thì rơi vào `skipped` kèm lý do và số dòng,
 * phần còn lại vẫn nạp được. Người dán 500 dòng mà hỏng 2 dòng thì không có lý gì bắt họ
 * sửa file rồi dán lại từ đầu.
 *
 * @param columns gán cột do người dùng chỉnh; bỏ trống thì tự đoán
 */
export function parsePaste(text: string, columns?: ReadonlyArray<ColumnKind>): PasteResult {
  const delimiter = detectDelimiter(text);
  const all = nonEmptyLines(text);

  const truncated = Math.max(0, all.length - MAX_PASTE_LINES);
  const lines = all.slice(0, MAX_PASTE_LINES);

  if (lines.length === 0) {
    return { columns: [], delimiter, hasHeader: false, rows: [], skipped: [], truncated };
  }

  const table = lines.map((row) => ({ ...row, cells: splitLine(row.text, delimiter) }));
  const first = table[0];
  const hasHeader = first !== undefined && looksLikeHeader(first.cells);

  const resolved = columns ?? guessColumns(first?.cells ?? [], hasHeader && first !== undefined);

  const rows: PriceBar[] = [];
  const skipped: SkippedRow[] = [];

  for (const row of hasHeader ? table.slice(1) : table) {
    const shown = row.text.trim();
    const preview = shown.length > RAW_PREVIEW ? `${shown.slice(0, RAW_PREVIEW)}…` : shown;
    const pick = (kind: ColumnKind): string | undefined => {
      const index = resolved.indexOf(kind);
      return index === -1 ? undefined : row.cells[index];
    };

    const closeText = pick('close');
    if (closeText === undefined || closeText === '') {
      skipped.push({ line: row.line, reason: 'thiếu cột giá đóng cửa', raw: preview });
      continue;
    }

    const close = parseViNumber(closeText);
    if (close === null) {
      skipped.push({
        line: row.line,
        reason: `giá đóng cửa không đọc được: '${closeText}'`,
        raw: preview,
      });
      continue;
    }
    if (close <= 0) {
      skipped.push({ line: row.line, reason: 'giá đóng cửa phải lớn hơn 0', raw: preview });
      continue;
    }

    const date = (pick('date') ?? '').trim();
    if (resolved.includes('date') && date === '') {
      skipped.push({ line: row.line, reason: 'thiếu ngày', raw: preview });
      continue;
    }

    rows.push({
      date,
      open: optionalNumber(pick('open')),
      high: optionalNumber(pick('high')),
      low: optionalNumber(pick('low')),
      close,
      volume: optionalNumber(pick('volume')),
      line: row.line,
    });
  }

  return { columns: resolved, delimiter, hasHeader, rows, skipped, truncated };
}

function optionalNumber(text: string | undefined): number | null {
  if (text === undefined || text.trim() === '') return null;
  return parseViNumber(text);
}

/**
 * Câu tóm tắt hiện dưới vùng dán, đúng khuôn WF-11:
 * '2 dòng bỏ qua: thiếu cột giá đóng cửa (dòng 41, 58)'.
 *
 * Gộp các dòng cùng lý do lại để không đổ ra một danh sách dài dằng dặc; quá `maxLines` số
 * dòng thì ghi '… và N dòng nữa' chứ không cắt im lặng.
 */
export function summarizeSkipped(
  skipped: ReadonlyArray<SkippedRow>,
  maxLines = 6,
): ReadonlyArray<string> {
  const byReason = new Map<string, number[]>();
  for (const row of skipped) {
    const bucket = byReason.get(row.reason);
    if (bucket === undefined) byReason.set(row.reason, [row.line]);
    else bucket.push(row.line);
  }

  return [...byReason].map(([reason, lines]) => {
    const shown = lines.slice(0, maxLines).join(', ');
    const rest = lines.length - maxLines;
    const tail = rest > 0 ? `, … và ${rest} dòng nữa` : '';
    return `${reason} (dòng ${shown}${tail})`;
  });
}

/** Chuỗi giá đóng cửa để đưa vào công thức cần chuỗi dài — Beta, Sharpe, MaxDD… (FR-12). */
export function closeSeries(result: PasteResult): number[] {
  return result.rows.map((row) => row.close);
}
