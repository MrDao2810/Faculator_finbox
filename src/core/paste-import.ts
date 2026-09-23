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
 * ── Đợt 22/09/2026: ba chỗ từng cho ra SỐ SAI mà không báo gì ──────────────────────────
 *
 * Một lượt rà soát có tái hiện bằng mã thật tìm ra bốn lỗi cùng một họ: dữ liệu đọc ra một
 * con số hoàn toàn hợp lý, không dòng nào bị bỏ qua, không cảnh báo nào nổ, và con số ấy sai.
 * Đó đúng là thứ FR-06 tồn tại để chặn, nên ba cơ chế dưới đây sinh ra để chặn nó:
 *
 * 1. **Quy ước số quyết theo CẢ BẢNG, không theo từng ô** (`detectNumberStyle`). Ở Việt Nam
 *    dấu chấm ngăn nghìn còn dấu phẩy là thập phân; Excel tiếng Anh và investing.com thì
 *    ngược lại. Đọc từng ô rời rạc là không thể phân biệt: '25,100' vừa có thể là 25,1 vừa
 *    có thể là 25.100 — lệch nhau đúng 1000 lần, mà cả hai đều là giá có thật của cổ phiếu
 *    Việt Nam nên không ai nhìn ra. Gom cả bảng lại thì gần như luôn có bằng chứng dứt điểm.
 * 2. **Dấu phẩy chỉ được làm ký tự ngăn cột khi nó không phải dấu thập phân**
 *    (`commaSplitsColumns`). '15/07,25,40' từng bị cắt thành bốn ô, ô cuối '40' thành giá
 *    đóng cửa, và bảng báo "✓ 1 dòng hợp lệ".
 * 3. **Chuỗi xếp mới → cũ được lật lại theo thời gian** (`orderOf`). CafeF, Vietstock và
 *    investing.com đều xuất phiên mới nhất trước. `CalcContext.series` khai rõ "phiên CŨ
 *    trước phiên MỚI", và dán ngược làm Sharpe đổi dấu, RSI từ 95,8 xuống 0,0001, MaxDD từ
 *    24,8% lên 37,9% — không cảnh báo nào nổ. Chỉ lật khi ngày đọc được VÀ giảm đều tuyệt
 *    đối: không có bằng chứng thì `order` trả 'unknown' để giao diện nói ra, chứ không đoán.
 *
 * ── Đợt 22/09/2026, lượt hai: hai lối vào, một bộ đọc ─────────────────────────────────
 *
 * Giao diện bỏ ô văn bản tự do và thay bằng lưới ô, nên `parsePaste()` không còn là lối vào
 * duy nhất. File tách làm hai nửa dùng chung phần lõi:
 *   · `splitPasteTable()` — cắt chuỗi dán thành bảng ô thô để đổ vào lưới, chưa đọc số nào;
 *   · `parseCells()` — đọc thẳng từ lưới, kể cả khi người dùng gõ tay từng ô.
 * `parsePaste()` giờ chỉ là hai nửa ấy nối lại. Ba cơ chế chặn số sai ở trên vì thế chạy y hệt
 * cho cả lối gõ tay lẫn lối dán — điều mà hai bộ đọc song song không bao giờ giữ nổi.
 *
 * Toàn bộ file là hàm thuần nên test được bằng Node và không cần thư viện CSV nào.
 */

import { parseSeriesDate } from './price-series';
import { normalizeVi } from './registry/search';

/** Vai trò của một cột trong bảng dán vào. */
export type ColumnKind = 'date' | 'open' | 'high' | 'low' | 'close' | 'volume' | 'ignore';

/**
 * Nhãn tiếng Việt của từng cột.
 *
 * WF-11 viết tắt là "Mở · Cao · Thấp · Đóng · KL". Đợt 22/09/2026 viết đủ chữ ra, vì chủ dự án
 * chốt sản phẩm nhắm người dùng thường: "Đóng" chỉ có nghĩa với người đã biết OHLC, còn người
 * mới thì không có cách nào đoán ra nó là giá đóng cửa.
 */
export const COLUMN_LABELS: Readonly<Record<ColumnKind, string>> = {
  date: 'Ngày',
  open: 'Giá mở cửa',
  high: 'Giá cao nhất',
  low: 'Giá thấp nhất',
  close: 'Giá đóng cửa',
  volume: 'Khối lượng',
  ignore: 'Không dùng',
};

/**
 * Quy ước viết số của cả bảng vừa dán.
 *
 * - `vi` — dấu chấm ngăn nghìn, dấu phẩy thập phân: '25.100' là hai mươi lăm nghìn một trăm,
 *   '25,10' là hai mươi lăm phẩy một.
 * - `en` — ngược lại: '25,100' là hai mươi lăm nghìn một trăm, '25.10' là hai mươi lăm phẩy một.
 * - `plain` — cả bảng không có dấu ngăn nào, đọc kiểu gì cũng ra một số.
 */
export type NumberStyle = 'vi' | 'en' | 'plain';

/** Chiều thời gian của các dòng đúng như người dùng dán. */
export type RowOrder = 'oldest-first' | 'newest-first' | 'unknown';

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
  /**
   * Lý do viết CỰC ngắn, để đứng ngay sau một con số: '3 dòng sai ngày'.
   * `reason` đầy đủ còn kèm cả nội dung ô hỏng nên quá dài cho thanh trạng thái.
   */
  short: string;
  /**
   * Cột gây ra lỗi, khi chỉ ra được đúng một cột.
   *
   * Giao diện tô đỏ CHÍNH ô ấy trong lưới. Nói "dòng 7 hỏng" thì người dùng còn phải dò sáu ô;
   * tô đúng ô thì họ nhìn một cái là thấy, và sửa tại chỗ.
   */
  column?: ColumnKind;
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
  /**
   * Các dòng đầu file bị bỏ vì không phải dữ liệu: dòng ghi chú '#' của chính bản xuất CSV
   * sản phẩm này, hay một dòng tiêu đề bảng lạc vào. Đếm để giao diện nói ra.
   */
  preamble: number;
  /** Quy ước viết số đã suy ra cho cả bảng. */
  numberStyle: NumberStyle;
  /**
   * Quy ước số phải đoán vì bằng chứng không dứt điểm — mọi nhóm chữ số sau dấu ngăn đều
   * đúng ba chữ số nên '25,100' vừa đọc được là 25,1 vừa đọc được là 25.100. Giao diện phải
   * hỏi lại người dùng, không được im lặng.
   */
  numberStyleGuessed: boolean;
  /** Chiều thời gian đọc được từ cột ngày. */
  order: RowOrder;
  /** Đã lật thứ tự các dòng để chuỗi chạy cũ → mới. */
  reordered: boolean;
  /**
   * Vài dòng dữ liệu ĐẦU TIÊN ở dạng ô thô, đúng như người dùng dán.
   *
   * Giao diện bày nguyên văn phần này kèm một ô chọn vai trò trên mỗi cột: chỉ khi nhìn thấy
   * số của CHÍNH MÌNH nằm dưới chữ "Giá đóng cửa" thì người dùng mới kiểm được máy có gán
   * đúng cột không. Bảng kết quả đã đọc xong thì không nói được điều đó.
   */
  cells: ReadonlyArray<ReadonlyArray<string>>;
  /** Các phiên, LUÔN theo chiều cũ → mới khi `order` khác 'unknown'. */
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

/** Số dòng thô trả về cho khung "cột nào là gì". Đủ nhận ra cột lệch, không thành bảng thứ hai. */
const PREVIEW_CELL_ROWS = 4;

/** Thứ tự cột mặc định khi đoán theo vị trí — đúng thứ tự Excel của các sàn Việt Nam. */
const POSITIONAL_ORDER: ReadonlyArray<ColumnKind> = [
  'date',
  'open',
  'high',
  'low',
  'close',
  'volume',
];

/**
 * Từ khoá nhận diện tiêu đề cột, đã bỏ dấu. Cả tiếng Việt lẫn tiếng Anh vì file tải về hay lẫn.
 *
 * Danh sách này PHẢI phủ hết `COLUMN_LABELS` ngay trên — tức chính những cái tên sản phẩm tự in
 * ra. Ngày 22/09/2026 nó không phủ: nhãn hiển thị đổi sang viết đủ chữ ("Giá cao nhất") mà từ
 * vựng ở đây vẫn chỉ có "cao nhat", nên dán lại đúng bảng do sản phẩm xuất ra thì hai cột Cao
 * và Thấp rơi vào "Không dùng" — im lặng, và mọi công thức cần nến mất dữ liệu.
 */
const HEADER_WORDS: ReadonlyArray<{ kind: ColumnKind; words: ReadonlyArray<string> }> = [
  { kind: 'date', words: ['ngay', 'date', 'thoi gian', 'time', 'phien'] },
  { kind: 'open', words: ['mo', 'mo cua', 'open', 'gia mo cua'] },
  { kind: 'high', words: ['cao', 'cao nhat', 'high', 'gia cao nhat'] },
  { kind: 'low', words: ['thap', 'thap nhat', 'low', 'gia thap nhat'] },
  { kind: 'close', words: ['dong', 'dong cua', 'close', 'gia dong cua', 'gia'] },
  { kind: 'volume', words: ['kl', 'khoi luong', 'volume', 'vol', 'kl khop lenh'] },
];

/*
 * ── Đọc số ─────────────────────────────────────────────────────────────────────────────
 */

/** Dấu trừ kiểu Unicode mà bảng tính hay chèn. */
const MINUS_SIGNS = /[−‒–—﹣－]/g;

/** Ô chỉ còn chữ số và dấu ngăn sau khi đã gột nhiễu. */
const NUMERIC_SHAPE = /^-?\d+([.,]\d+)*$/;

/**
 * Gột một ô về phần số: bỏ tiền tệ, phần trăm, khoảng trắng (kể cả khoảng trắng hẹp của
 * Excel), và đổi ngoặc đơn kiểu kế toán '(1,25)' thành số âm.
 *
 * KHÔNG quyết dấu nào là thập phân ở đây — đó là việc của `detectNumberStyle()`, vốn nhìn
 * cả bảng. Tách hai việc ra là lý do đợt 22/09 không còn đọc '25,100' theo hai nghĩa khác
 * nhau ở hai ô cạnh nhau.
 */
function stripNoise(text: string): { body: string; negative: boolean } {
  let raw = text.replace(MINUS_SIGNS, '-').trim();
  let negative = false;

  const accounting = /^\((.*)\)$/.exec(raw);
  if (accounting !== null) {
    negative = true;
    raw = accounting[1] ?? '';
  }

  raw = raw.replace(/[\s  ]/g, '').replace(/[₫đ%]/gi, '');
  if (raw.startsWith('-')) {
    negative = !negative;
    raw = raw.slice(1);
  }
  if (raw.startsWith('+')) raw = raw.slice(1);

  return { body: raw, negative };
}

/** Ô này có hình dạng một con số không, bất kể quy ước nào. */
function looksNumeric(text: string): boolean {
  const { body } = stripNoise(text);
  return body !== '' && NUMERIC_SHAPE.test(body);
}

/**
 * Suy quy ước viết số cho CẢ BẢNG.
 *
 * Bằng chứng xếp theo độ chắc chắn:
 *  1. Ô nào có cả chấm lẫn phẩy thì dấu ĐỨNG SAU là dấu thập phân. Đây là luật đúng ở mọi
 *     nơi trên thế giới, không cần biết file từ đâu ra: '1,234.56' và '1.234,56'.
 *  2. Chỉ một loại dấu xuất hiện: nhóm chữ số sau nó có 1 hoặc 2 chữ số thì nó là dấu thập
 *     phân — không ai ngăn nghìn thành nhóm hai chữ số.
 *  3. Mọi nhóm đều đúng ba chữ số: coi là ngăn nghìn, và ĐÁNH DẤU là phỏng đoán. '25,100'
 *     rơi vào đây; giá cổ phiếu Việt Nam niêm yết tới hai chữ số thập phân nên ba chữ số
 *     gần như luôn là nhóm nghìn, nhưng "gần như" thì phải nói ra chứ không nuốt.
 */
export function detectNumberStyle(cells: ReadonlyArray<string>): {
  style: NumberStyle;
  guessed: boolean;
} {
  const bodies = cells
    .map((cell) => stripNoise(cell).body)
    .filter((body) => body !== '' && NUMERIC_SHAPE.test(body));

  for (const body of bodies) {
    const dot = body.lastIndexOf('.');
    const comma = body.lastIndexOf(',');
    if (dot !== -1 && comma !== -1) return { style: dot > comma ? 'en' : 'vi', guessed: false };
  }

  const groupsAfter = (body: string, sep: string): string[] =>
    body
      .split(sep)
      .slice(1)
      .map((part) => part);

  let sawComma = false;
  let sawDot = false;
  let commaDecimal = false;
  let dotDecimal = false;

  for (const body of bodies) {
    for (const group of groupsAfter(body, ',')) {
      sawComma = true;
      if (group.length !== 3) commaDecimal = true;
    }
    for (const group of groupsAfter(body, '.')) {
      sawDot = true;
      if (group.length !== 3) dotDecimal = true;
    }
  }

  if (commaDecimal) return { style: 'vi', guessed: false };
  if (dotDecimal) return { style: 'en', guessed: false };
  if (sawComma) return { style: 'en', guessed: true };
  if (sawDot) return { style: 'vi', guessed: true };
  return { style: 'plain', guessed: false };
}

/**
 * Đọc một ô thành số theo quy ước đã chốt cho cả bảng.
 *
 * TUYỆT ĐỐI không trả NaN (FR-06): ô rỗng, ô chữ, ô '-' hay 'N/A' đều trả null để nơi gọi
 * phải xử lý "chưa có số" thay vì lỡ tay đưa NaN vào công thức.
 */
export function parseCellNumber(text: string, style: NumberStyle): number | null {
  const { body, negative } = stripNoise(text);
  if (body === '' || !NUMERIC_SHAPE.test(body)) return null;

  const normalized =
    style === 'en'
      ? body.replace(/,/g, '')
      : style === 'vi'
        ? body.replace(/\./g, '').replace(',', '.')
        : body.replace(/,/g, '.');

  if (!/^\d*\.?\d*$/.test(normalized) || normalized === '' || normalized === '.') return null;

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return negative ? -value : value;
}

/*
 * ── Cắt cột ────────────────────────────────────────────────────────────────────────────
 */

/**
 * Nhận ra ký tự ngăn cột.
 *
 * Tab, chấm phẩy và sổ dọc không bao giờ nằm trong một con số nên được xét trước và tin ngay.
 * Dấu phẩy là chỗ duy nhất nguy hiểm: ở Việt Nam nó là dấu thập phân, nên '25,40' mà cắt theo
 * phẩy sẽ ra hai ô và giá 25,40 thành 40. Vì vậy dấu phẩy chỉ được nhận khi
 * `commaSplitsColumns()` tìm được bằng chứng nó đang ngăn cột thật.
 */
export function detectDelimiter(text: string): string {
  const lines = nonEmptyLines(text).slice(0, 20);
  if (lines.length === 0) return '\t';

  for (const candidate of ['\t', ';', '|']) {
    const counts = lines.map((line) => line.text.split(candidate).length - 1);
    if (Math.min(...counts) >= 1) return candidate;
  }

  if (commaSplitsColumns(lines.map((line) => line.text))) return ',';

  // Vài nơi xuất kiểu cột căn lề bằng khoảng trắng liên tiếp.
  if (lines.some((line) => /\S\s{2,}\S/.test(line.text))) return '  ';

  // Một cột duy nhất: trả Tab cho gọn, `split('\t')` sẽ cho đúng một ô.
  return '\t';
}

/**
 * Dấu phẩy ở đây đang ngăn cột hay đang làm dấu thập phân.
 *
 * Bằng chứng nó là dấu THẬP PHÂN: cắt ra có ô chỉ gồm 1–3 chữ số đứng ngay sau một ô kết
 * thúc bằng chữ số. '15/07,25,40' cắt ra ['15/07','25','40'] — ô '40' đứng sau ô '25' đúng
 * hình dạng ấy. Gặp hình dạng này trên đa số dòng thì từ chối dấu phẩy.
 *
 * Bằng chứng nó NGĂN CỘT: có ô không phải số (ngày, tên, tiêu đề) ở nhiều hơn một vị trí,
 * hoặc số ô lớn hơn hẳn số cặp thập phân có thể có.
 */
function commaSplitsColumns(lines: ReadonlyArray<string>): boolean {
  const rows = lines.map((line) => line.split(',').map((cell) => cell.trim()));
  if (rows.every((cells) => cells.length < 2)) return false;

  let decimalShaped = 0;
  for (const cells of rows) {
    const suspicious = cells.some(
      (cell, index) =>
        index > 0 && /^\d{1,3}$/.test(cell) && /\d$/.test(cells[index - 1] ?? '') === true,
    );
    if (suspicious) decimalShaped += 1;
  }

  return decimalShaped <= rows.length / 2;
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
    .replace(/^﻿/, '')
    .split(/\r\n|\r|\n/)
    .map((raw, index) => ({ line: index + 1, text: raw }))
    .filter((row) => row.text.trim() !== '');
}

/** Tách một dòng thành các ô. Ký tự ngăn '  ' nghĩa là cắt theo khoảng trắng liên tiếp. */
function splitLine(text: string, delimiter: string): string[] {
  const cells = delimiter === '  ' ? text.split(/\s{2,}/) : text.split(delimiter);
  return cells.map((cell) => cell.trim().replace(/^"(.*)"$/s, '$1'));
}

/**
 * Cứu lấy dòng mà dấu phẩy vừa ngăn cột vừa làm dấu thập phân: '15/07,25,40'.
 *
 * `detectDelimiter()` đã từ chối dấu phẩy nên cả dòng còn là MỘT ô, tức mất trắng dữ liệu.
 * Ở đây cắt theo phẩy rồi ghép lại: ô toàn chữ số đi liền một ô 1–3 chữ số thì hai ô ấy vốn
 * là một con số bị cắt đôi. '15/07' không toàn chữ số nên không bị dính vào ô sau nó, và
 * đó chính là chỗ giữ cho cột ngày không bị nuốt.
 *
 * Trả về `null` khi không ghép ra được bảng nhiều cột — để nơi gọi giữ nguyên cách cũ.
 */
function splitCommaDecimals(text: string): string[] | null {
  const parts = text.split(',').map((part) => part.trim());
  if (parts.length < 2) return null;

  const cells: string[] = [];
  for (const part of parts) {
    const previous = cells[cells.length - 1];
    if (previous !== undefined && /^-?\d+$/.test(previous) && /^\d{1,3}$/.test(part)) {
      cells[cells.length - 1] = `${previous},${part}`;
      continue;
    }
    cells.push(part);
  }

  return cells.length >= 2 ? cells : null;
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
  if (cells.some((cell) => looksNumeric(cell))) return false;
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
 *
 * @param sample toàn bộ các dòng dữ liệu, để đoán được cột khối lượng (xem `positionalValues`)
 */
export function guessColumns(
  cells: ReadonlyArray<string>,
  isHeader: boolean,
  sample: ReadonlyArray<ReadonlyArray<string>> = [],
): ColumnKind[] {
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
  const firstIsDate = cells.length > 0 && !looksNumeric(cells[0] ?? '');
  const offset = firstIsDate ? 1 : 0;
  const values = positionalValues(cells.length - offset, sample, offset);

  return cells.map((_, index) => {
    if (firstIsDate && index === 0) return 'date';
    return values[index - offset] ?? 'ignore';
  });
}

/**
 * Vai trò của các cột SỐ khi bảng không có tiêu đề.
 *
 * Từ 4 cột trở lên thì theo đúng thứ tự OHLCV quen thuộc. Dưới 4 cột thì cột CUỐI thường là
 * giá đóng cửa — bảng "Ngày · Giá" hai cột là kiểu dán phổ biến nhất, mà nếu máy móc gán cột
 * thứ hai thành 'Mở' thì bảng không có giá đóng cửa và MỌI dòng bị loại.
 *
 * Ngoại lệ đã thấy: bảng ba cột "Ngày · Giá · Khối lượng". Cột cuối ở đó là khối lượng, và
 * gán nó thành giá đóng cửa thì công thức chạy trên hàng triệu đơn vị khối lượng mà vẫn ra
 * số. `looksLikeVolume()` nhận ra nó bằng hình dạng dữ liệu chứ không bằng tên cột.
 */
function positionalValues(
  count: number,
  sample: ReadonlyArray<ReadonlyArray<string>>,
  offset: number,
): ColumnKind[] {
  if (count <= 0) return [];
  if (count >= 4) return [...POSITIONAL_ORDER.slice(1)].slice(0, count);

  if (count === 2 && looksLikeVolume(sample, offset + 1, offset)) return ['close', 'volume'];

  const head: ColumnKind[] = ['open', 'high', 'low'];
  return [...head.slice(0, count - 1), 'close'];
}

/**
 * Cột `index` có phải khối lượng khớp lệnh không, đoán bằng hình dạng số.
 *
 * Khối lượng là số nguyên và lớn hơn giá nhiều bậc. Đòi CẢ HAI dấu hiệu, trên đa số dòng:
 * không ô nào có phần lẻ, và trung vị lớn hơn cột giá kề trước ít nhất 1.000 lần. Một cổ
 * phiếu giá 25 nghìn thì khối lượng phiên thường là hàng trăm nghìn tới hàng triệu, nên
 * khoảng cách này rất rộng và không đụng vào bảng giá hai cột bình thường.
 */
function looksLikeVolume(
  sample: ReadonlyArray<ReadonlyArray<string>>,
  index: number,
  priceIndex: number,
): boolean {
  const { style } = detectNumberStyle(sample.flatMap((cells) => [...cells]));

  const volumes: number[] = [];
  const prices: number[] = [];
  for (const cells of sample) {
    const volume = parseCellNumber(cells[index] ?? '', style);
    const price = parseCellNumber(cells[priceIndex] ?? '', style);
    if (volume === null || price === null || price <= 0) continue;
    if (!Number.isInteger(volume)) return false;
    volumes.push(volume);
    prices.push(price);
  }

  if (volumes.length === 0) return false;
  return median(volumes) >= median(prices) * 1_000;
}

function median(values: ReadonlyArray<number>): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? 0;
  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

/*
 * ── Chiều thời gian ────────────────────────────────────────────────────────────────────
 */

/** Khoá so sánh của một ngày; null khi ngày không đọc được hoặc thiếu năm giữa các năm. */
function dateKey(raw: string): number | null {
  const date = parseSeriesDate(raw);
  if (date === null) return null;
  return (date.year ?? 0) * 10_000 + date.month * 100 + date.day;
}

/**
 * Chiều thời gian của các dòng.
 *
 * Chỉ kết luận khi MỌI dòng đọc được ngày và dãy khoá đơn điệu NGHIÊM NGẶT. Bất kỳ chỗ nào
 * bằng nhau hay đổi chiều đều trả 'unknown' — giao diện sẽ nói "không đọc được thứ tự" chứ
 * không được tự sắp. Ngày thiếu năm ('15/07') vắt qua giao thừa cũng rơi vào đây, và đó là
 * kết cục đúng: thà nói không biết còn hơn sắp sai.
 */
export function orderOf(rows: ReadonlyArray<{ date: string }>): RowOrder {
  if (rows.length < 2) return 'oldest-first';

  const keys = rows.map((row) => dateKey(row.date));
  if (keys.some((key) => key === null)) return 'unknown';

  let up = true;
  let down = true;
  for (let i = 1; i < keys.length; i += 1) {
    const previous = keys[i - 1] as number;
    const current = keys[i] as number;
    if (current <= previous) up = false;
    if (current >= previous) down = false;
  }

  if (up) return 'oldest-first';
  if (down) return 'newest-first';
  return 'unknown';
}

/*
 * ── Đọc cả bảng ────────────────────────────────────────────────────────────────────────
 */

/**
 * Bỏ phần đầu file không phải dữ liệu.
 *
 * Hai thứ đã thấy thật: dòng ghi chú '#' do chính `toCsv()` của sản phẩm chèn vào bản xuất
 * — nạp lại file mình vừa xuất mà lệch hết cột là lỗi khó tha — và một dòng tiêu đề bảng
 * lạc vào trước dòng tiêu đề cột. Cả hai đều có số ô khác hẳn phần thân, nên lấy số ô phổ
 * biến nhất làm chuẩn rồi cắt phần đầu lệch chuẩn.
 */
function dropPreamble<T extends { cells: string[] }>(table: ReadonlyArray<T>): T[] {
  const body = table.filter((row) => !(row.cells[0] ?? '').startsWith('#'));
  if (body.length === 0) return [];

  const counts = new Map<number, number>();
  for (const row of body.slice(0, 20)) {
    counts.set(row.cells.length, (counts.get(row.cells.length) ?? 0) + 1);
  }
  let modal = body[0]?.cells.length ?? 0;
  let best = -1;
  for (const [size, times] of counts) {
    if (times > best || (times === best && size > modal)) {
      best = times;
      modal = size;
    }
  }

  let start = 0;
  while (start < body.length && body[start]?.cells.length !== modal) start += 1;
  return body.slice(start);
}

/** Một dòng thô kèm số dòng mà người dùng nhìn thấy — dòng thứ mấy trong chuỗi dán, hoặc trong lưới. */
interface TableRow {
  line: number;
  /** Nội dung thô, chỉ dùng để hiện lại trong danh sách dòng bỏ qua. */
  text: string;
  cells: ReadonlyArray<string>;
}

/**
 * Bảng ô thô đã cắt xong từ chuỗi dán: bỏ phần đầu không phải dữ liệu, bỏ dòng tiêu đề, và
 * phỏng đoán vai trò từng cột. CHƯA đọc ra số nào.
 *
 * Tách riêng khỏi `parsePaste()` vì lưới nhập của WF-11 cần đúng nửa này: nó đổ các ô vào lưới
 * rồi từ đó LƯỚI là nguồn sự thật, không giữ lại chuỗi văn bản nào nữa. Nửa còn lại —
 * `parseCells()` — đọc thẳng từ lưới, nên hai lối vào (gõ tay và dán) dùng chung một bộ đọc
 * số, một bộ suy quy ước số và một bộ xét chiều thời gian.
 */
export interface PasteTable {
  /** Các dòng thân, mỗi dòng là một mảng ô đúng như người dùng dán. */
  cells: string[][];
  columns: ColumnKind[];
  hasHeader: boolean;
  delimiter: string;
  preamble: number;
  truncated: number;
}

/** Cắt chuỗi dán thành bảng ô + phỏng đoán cột. Dùng chung cho `parsePaste` và lưới nhập. */
function cutTable(text: string): {
  rows: TableRow[];
  columns: ColumnKind[];
  hasHeader: boolean;
  delimiter: string;
  preamble: number;
  truncated: number;
} {
  const delimiter = detectDelimiter(text);
  const all = nonEmptyLines(text);

  const truncated = Math.max(0, all.length - MAX_PASTE_LINES);
  const lines = all.slice(0, MAX_PASTE_LINES);
  const nothing = { rows: [], columns: [], hasHeader: false, delimiter, preamble: 0, truncated };
  if (lines.length === 0) return nothing;

  /*
   * Dấu phẩy bị từ chối làm ký tự ngăn cột mà cả bảng lại không có ký tự ngăn nào khác:
   * đây đúng là bảng CSV kiểu Việt Nam, phẩy vừa ngăn cột vừa là dấu thập phân.
   */
  const commaDecimals =
    delimiter === '\t' && !text.includes('\t') && lines.some((row) => row.text.includes(','));

  const raw = lines.map((row) => ({
    ...row,
    cells: (commaDecimals ? splitCommaDecimals(row.text) : null) ?? splitLine(row.text, delimiter),
  }));
  const table = dropPreamble(raw);
  const preamble = raw.length - table.length;
  if (table.length === 0) return { ...nothing, preamble };

  const first = table[0];
  const hasHeader = first !== undefined && looksLikeHeader(first.cells);
  const body = hasHeader ? table.slice(1) : table;

  const columns = guessColumns(
    first?.cells ?? [],
    hasHeader && first !== undefined,
    body.slice(0, 20).map((row) => row.cells),
  );

  return { rows: body, columns, hasHeader, delimiter, preamble, truncated };
}

/**
 * Cắt chuỗi dán thành bảng ô thô để đổ vào lưới nhập.
 *
 * Không đọc số, không bỏ dòng nào vì lý do nội dung: mọi dòng thân đều ra lưới, kể cả dòng
 * hỏng, vì người dùng phải nhìn thấy nó mới sửa được. Việc đọc số là của `parseCells()`.
 */
export function splitPasteTable(text: string): PasteTable {
  const cut = cutTable(text);
  return {
    cells: cut.rows.map((row) => [...row.cells]),
    columns: cut.columns,
    hasHeader: cut.hasHeader,
    delimiter: cut.delimiter,
    preamble: cut.preamble,
    truncated: cut.truncated,
  };
}

/** Đọc từng dòng thô thành phiên giá. Dòng nào hỏng thì rơi vào `skipped`, không ném lỗi. */
function readRows(
  body: ReadonlyArray<TableRow>,
  columns: ReadonlyArray<ColumnKind>,
  numberStyle: NumberStyle,
): { rows: PriceBar[]; skipped: SkippedRow[] } {
  const rows: PriceBar[] = [];
  const skipped: SkippedRow[] = [];

  for (const row of body) {
    const shown = row.text.trim();
    const preview = shown.length > RAW_PREVIEW ? `${shown.slice(0, RAW_PREVIEW)}…` : shown;
    const pick = (kind: ColumnKind): string | undefined => {
      const index = columns.indexOf(kind);
      return index === -1 ? undefined : row.cells[index];
    };

    const closeText = (pick('close') ?? '').trim();
    if (closeText === '') {
      skipped.push({
        line: row.line,
        reason: 'thiếu cột giá đóng cửa',
        short: 'thiếu giá đóng cửa',
        column: 'close',
        raw: preview,
      });
      continue;
    }

    const close = parseCellNumber(closeText, numberStyle);
    if (close === null) {
      skipped.push({
        line: row.line,
        reason: `giá đóng cửa không đọc được: '${closeText}'`,
        short: 'sai giá đóng cửa',
        column: 'close',
        raw: preview,
      });
      continue;
    }
    if (close <= 0) {
      skipped.push({
        line: row.line,
        reason: 'giá đóng cửa phải lớn hơn 0',
        short: 'giá không lớn hơn 0',
        column: 'close',
        raw: preview,
      });
      continue;
    }

    const date = (pick('date') ?? '').trim();
    if (columns.includes('date') && date === '') {
      skipped.push({
        line: row.line,
        reason: 'thiếu ngày',
        short: 'thiếu ngày',
        column: 'date',
        raw: preview,
      });
      continue;
    }

    /*
     * Ngày có chữ nhưng không đọc ra ngày thật — '28/13/2026', '31/02', 'n/a'.
     *
     * Trước 22/09/2026 dòng này vẫn lọt: `date` được giữ nguyên dạng thô nên nó chỉ làm
     * `orderOf()` trả 'unknown', và người dùng chỉ thấy một câu chung chung "không đọc được thứ
     * tự phiên" cho cả bảng. Một ô gõ nhầm tháng 13 không được phép hạ cả chuỗi xuống mức
     * "không biết thứ tự" — nó phải bị chỉ đúng tên và đúng ô.
     */
    if (date !== '' && parseSeriesDate(date) === null) {
      skipped.push({
        line: row.line,
        reason: `ngày không đọc được: '${date}'`,
        short: 'sai ngày',
        column: 'date',
        raw: preview,
      });
      continue;
    }

    rows.push({
      date,
      open: optionalNumber(pick('open'), numberStyle),
      high: optionalNumber(pick('high'), numberStyle),
      low: optionalNumber(pick('low'), numberStyle),
      close,
      volume: optionalNumber(pick('volume'), numberStyle),
      line: row.line,
    });
  }

  return { rows, skipped };
}

/** Ghép nốt phần chung của hai lối vào: quy ước số, chiều thời gian, rồi đóng gói kết quả. */
function finish(
  body: ReadonlyArray<TableRow>,
  columns: ReadonlyArray<ColumnKind>,
  style: NumberStyle | undefined,
  rest: Pick<PasteResult, 'delimiter' | 'hasHeader' | 'preamble' | 'truncated'>,
): PasteResult {
  const detected = detectNumberStyle(body.flatMap((row) => [...row.cells]));
  const numberStyle = style ?? detected.style;

  const { rows, skipped } = readRows(body, columns, numberStyle);
  const order = columns.includes('date') ? orderOf(rows) : 'unknown';
  const reordered = order === 'newest-first';

  return {
    ...rest,
    columns,
    numberStyle,
    numberStyleGuessed: style === undefined && detected.guessed,
    order,
    reordered,
    cells: body.slice(0, PREVIEW_CELL_ROWS).map((row) => [...row.cells]),
    rows: reordered ? [...rows].reverse() : rows,
    skipped,
  };
}

/**
 * Đọc chuỗi người dùng dán thành danh sách phiên giá.
 *
 * Không ném lỗi bao giờ: dòng nào đọc không được thì rơi vào `skipped` kèm lý do và số dòng,
 * phần còn lại vẫn nạp được. Người dán 500 dòng mà hỏng 2 dòng thì không có lý gì bắt họ
 * sửa file rồi dán lại từ đầu.
 *
 * @param columns gán cột do người dùng chỉnh; bỏ trống thì tự đoán
 * @param style quy ước số do người dùng chốt khi máy phải đoán; bỏ trống thì tự suy
 */
export function parsePaste(
  text: string,
  columns?: ReadonlyArray<ColumnKind>,
  style?: NumberStyle,
): PasteResult {
  const cut = cutTable(text);
  const rest = {
    delimiter: cut.delimiter,
    hasHeader: cut.hasHeader,
    preamble: cut.preamble,
    truncated: cut.truncated,
  };

  if (cut.rows.length === 0) {
    return {
      ...rest,
      columns: [],
      numberStyle: 'plain',
      numberStyleGuessed: false,
      order: 'oldest-first',
      reordered: false,
      cells: [],
      rows: [],
      skipped: [],
    };
  }

  return finish(cut.rows, columns ?? cut.columns, style, rest);
}

/**
 * Đọc thẳng một lưới ô do người dùng gõ hoặc dán vào, không đi qua chuỗi văn bản nào.
 *
 * Đây là lối vào của WF-11 từ 22/09/2026: giao diện không còn ô văn bản tự do, nên không còn
 * chuyện người dùng phải tự gõ dấu ngăn cột cho đúng. Ô trống hoàn toàn của lưới KHÔNG tính là
 * dòng hỏng — lưới luôn chừa sẵn dòng trống ở cuối để gõ tiếp, báo nó là lỗi thì sai.
 *
 * Số dòng trong `skipped` đếm theo đúng dòng thứ mấy trên lưới, để người dùng nhìn xuống là
 * thấy ô cần sửa.
 */
export function parseCells(
  cells: ReadonlyArray<ReadonlyArray<string>>,
  columns: ReadonlyArray<ColumnKind>,
  style?: NumberStyle,
): PasteResult {
  const body: TableRow[] = [];
  cells.forEach((row, index) => {
    if (row.every((cell) => cell.trim() === '')) return;
    body.push({ line: index + 1, text: row.join(' ').trim(), cells: row });
  });

  return finish(body, columns, style, {
    // Lưới không có ký tự ngăn cột và không có dòng tiêu đề: các cột đã là cột thật.
    delimiter: '',
    hasHeader: false,
    preamble: 0,
    truncated: 0,
  });
}

function optionalNumber(text: string | undefined, style: NumberStyle): number | null {
  if (text === undefined || text.trim() === '') return null;
  return parseCellNumber(text, style);
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
