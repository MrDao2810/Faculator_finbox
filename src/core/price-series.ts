/**
 * Tầng DOMAIN — chuỗi giá OHLCV sửa được tay (màn WF-05, gói WBS 3.3.1).
 *
 * Đây là nguồn dữ liệu cho cả nhóm rủi ro: Beta, Sharpe, độ biến động và VaR đều cần nhiều
 * phiên giá (FR-12), mà `CalcContext.series` thì chỉ nhận một mảng số — nên phải có chỗ để
 * người dùng nhập, sửa và kiểm chuỗi đó trước khi đưa vào công thức.
 *
 * Nguyên tắc giống hệt `paste-import.ts`: **không hàm nào ném lỗi**. Một dòng sai không được
 * làm hỏng cả bảng — nó được đánh dấu kèm lý do đọc được, còn các dòng còn lại vẫn dùng được.
 * Đây là FR-06 áp cho dữ liệu đầu vào: thà nói rõ "dòng 18/07 có giá cao nhỏ hơn giá thấp"
 * còn hơn im lặng tính ra một con số sai.
 */

import { formatNumber } from './format';

/**
 * Một phiên trong bảng sửa tay.
 *
 * Mọi trường số đều `number | null` — kể cả giá đóng cửa, khác với `PriceBar` của bộ dán.
 * Lý do: bảng này sửa **inline**, người dùng bấm "Thêm dòng" là có ngay một dòng trống rồi
 * điền dần. Ô chưa điền là `null` chứ không phải 0 — cùng lý do `runFormula()` không cho ô
 * trống rơi về `defaultValue`.
 */
export interface SeriesRow {
  /** Ngày dạng thô đúng như người dùng gõ: '15/07', '2025-07-15'. Không tự suy ra năm. */
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

/** Mã lỗi của một dòng. Dùng mã chứ không dùng câu chữ để giao diện tự chọn cách hiện. */
export type RowIssueCode =
  | 'MISSING_DATE'
  | 'MISSING_CLOSE'
  | 'NON_POSITIVE_PRICE'
  | 'HIGH_BELOW_LOW'
  | 'HIGH_NOT_HIGHEST'
  | 'LOW_NOT_LOWEST'
  | 'NEGATIVE_VOLUME'
  | 'DUPLICATE_DATE';

export interface RowIssue {
  code: RowIssueCode;
  /** Câu tiếng Việt nêu đúng nguyên nhân, viết như nói với người mới (NFR-USA-04). */
  message: string;
}

/** Kết quả kiểm một dòng: chỉ số dòng trong bảng (đếm từ 0) kèm các vấn đề tìm thấy. */
export interface RowCheck {
  index: number;
  issues: ReadonlyArray<RowIssue>;
}

export interface SeriesCheck {
  /** Chỉ những dòng CÓ vấn đề, giữ nguyên thứ tự bảng. */
  rows: ReadonlyArray<RowCheck>;
  /** Số dòng dùng được cho công thức — đủ ngày, đủ giá đóng cửa, không có lỗi nào. */
  usableCount: number;
  /** Tổng số dòng trong bảng. */
  total: number;
}

/** Dòng trống hoàn toàn, dùng khi bấm "Thêm dòng". */
export function emptyRow(): SeriesRow {
  return { date: '', open: null, high: null, low: null, close: null, volume: null };
}

/** Giá phải dương; 0 hoặc âm không phải giá. `null` là "chưa nhập", không phải lỗi giá. */
function isBadPrice(value: number | null): boolean {
  return value !== null && (!Number.isFinite(value) || value <= 0);
}

/**
 * Giá trong câu cảnh báo, viết theo quy ước Việt Nam (CON-05).
 *
 * Trước đây nội suy thẳng con số, nên câu hiện ra là "Giá cao nhất (97) nhỏ hơn giá thấp nhất
 * (99.5)" ngay bên cạnh ô nhập viết "99,5" — hai lối viết cho cùng một con số, trong cùng một
 * dòng. Người đọc phải tự đoán dấu chấm ấy là thập phân hay ngăn nghìn, đúng thứ mà cả
 * `parseViNumber()` lẫn `rawViNumber()` sinh ra để khỏi phải đoán.
 */
function gia(value: number): string {
  return formatNumber(value, { maxDecimals: 4 });
}

/**
 * Kiểm một dòng.
 *
 * Thứ tự kiểm có chủ ý: thiếu dữ liệu trước, mâu thuẫn giữa các cột sau. Dòng thiếu giá cao
 * thì không thể mâu thuẫn với giá thấp, nên không nêu hai lỗi cùng lúc cho cùng một nguyên nhân.
 */
export function checkRow(row: SeriesRow): ReadonlyArray<RowIssue> {
  const issues: RowIssue[] = [];

  if (row.date.trim() === '') {
    issues.push({ code: 'MISSING_DATE', message: 'Thiếu ngày của phiên này.' });
  }

  if (row.close === null) {
    issues.push({
      code: 'MISSING_CLOSE',
      message: 'Thiếu giá đóng cửa — đây là cột bắt buộc để tính Beta, Sharpe và VaR.',
    });
  }

  if ([row.open, row.high, row.low, row.close].some(isBadPrice)) {
    issues.push({ code: 'NON_POSITIVE_PRICE', message: 'Giá phải là số lớn hơn 0.' });
  }

  if (row.volume !== null && (!Number.isFinite(row.volume) || row.volume < 0)) {
    issues.push({ code: 'NEGATIVE_VOLUME', message: 'Khối lượng không thể là số âm.' });
  }

  const { high, low, open, close } = row;

  if (high !== null && low !== null && Number.isFinite(high) && Number.isFinite(low)) {
    if (high < low) {
      issues.push({
        code: 'HIGH_BELOW_LOW',
        message: `Giá cao nhất (${gia(high)}) nhỏ hơn giá thấp nhất (${gia(low)}) — vui lòng kiểm tra lại.`,
      });
    }
  }

  /*
   * Giá cao nhất phải ≥ giá mở và giá đóng, giá thấp nhất phải ≤ cả hai. Đây là bất biến của
   * một phiên giao dịch chứ không phải quy ước: giá mở và giá đóng đều là giá đã khớp trong
   * phiên nên chúng nằm trong khoảng cao–thấp.
   */
  if (high !== null && Number.isFinite(high)) {
    const higher = [open, close].filter(
      (value): value is number => value !== null && Number.isFinite(value) && value > high,
    );
    if (higher.length > 0) {
      issues.push({
        code: 'HIGH_NOT_HIGHEST',
        message: `Giá cao nhất (${gia(high)}) đang nhỏ hơn giá mở hoặc giá đóng cửa của chính phiên đó.`,
      });
    }
  }

  if (low !== null && Number.isFinite(low)) {
    const lower = [open, close].filter(
      (value): value is number => value !== null && Number.isFinite(value) && value < low,
    );
    if (lower.length > 0) {
      issues.push({
        code: 'LOW_NOT_LOWEST',
        message: `Giá thấp nhất (${gia(low)}) đang lớn hơn giá mở hoặc giá đóng cửa của chính phiên đó.`,
      });
    }
  }

  return issues;
}

/**
 * Kiểm cả bảng.
 *
 * Ngày trùng nhau chỉ phát hiện được ở mức bảng nên nó nằm ở đây chứ không ở `checkRow()`.
 * Dán hai lần cùng một đoạn là cách dễ nhất để có ngày trùng, và chuỗi có phiên lặp sẽ làm
 * độ biến động tụt xuống một cách vô hình — đúng loại sai lặng lẽ mà FR-06 muốn chặn.
 */
export function checkSeries(rows: ReadonlyArray<SeriesRow>): SeriesCheck {
  const seen = new Map<string, number>();
  const checks: RowCheck[] = [];
  let usable = 0;

  rows.forEach((row, index) => {
    const issues = [...checkRow(row)];

    const key = row.date.trim();
    if (key !== '') {
      const first = seen.get(key);
      if (first === undefined) {
        seen.set(key, index);
      } else {
        /*
         * Câu này KHÔNG còn nêu số dòng, và đó là một thay đổi có lý do.
         *
         * Bảng nay hiện NGÀY MỚI NHẤT LÊN ĐẦU (`sortRowsByDate()` ngay dưới, cộng phép lật ở màn
         * WF-05), nên "dòng 1" trong mảng không còn là "dòng 1" mà người dùng đếm bằng mắt. Một
         * con số chỉ sai chỗ thì tệ hơn không có con số nào — họ sẽ đi sửa nhầm dòng.
         *
         * Nêu chính NGÀY thì đúng ở mọi thứ tự hiển thị, và sau khi sắp xếp thì hai dòng trùng
         * nhau nằm sát nhau nên tìm cũng không khó hơn. `first` vẫn giữ để bảng tra biết dòng nào
         * là dòng đầu tiên dùng ngày đó — chỉ là nó thôi đi vào câu chữ.
         */
        issues.push({
          code: 'DUPLICATE_DATE',
          message: `Ngày ${key} xuất hiện ở hơn một dòng — mỗi phiên chỉ được ghi một lần.`,
        });
      }
    }

    if (issues.length === 0) usable += 1;
    else checks.push({ index, issues });
  });

  return { rows: checks, usableCount: usable, total: rows.length };
}

/**
 * Ngày của một phiên, đã tách thành ba phần. `year === null` là dạng viết KHÔNG có năm ('15/07').
 *
 * Không tự suy ra năm — cùng lời hứa mà `SeriesRow.date` đã ghi. Suy ra năm là đoán, và đoán sai
 * thì cả chuỗi bị xếp lộn mà không có gì trên màn nói là đã lộn.
 */
export interface SeriesDate {
  year: number | null;
  month: number;
  day: number;
}

/* Ba lối viết ngày mà bảng này thật sự gặp: bộ mẫu ghi ISO, người dùng dán từ Excel ghi kiểu Việt. */
const ISO = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/;
const DMY = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
const DM = /^(\d{1,2})[-/.](\d{1,2})$/;

function hopLe(month: number, day: number): boolean {
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

/**
 * Đọc ô ngày thành ba phần, hoặc `null` nếu không đọc được.
 *
 * `null` là chuyện BÌNH THƯỜNG ở đây, không phải lỗi: ô ngày nhận bất cứ thứ gì người dùng gõ, và
 * chuỗi minh hoạ của trang Beta còn ghi số thứ tự phiên ('1', '2', …). Nơi gọi phải xử được `null`
 * chứ không được coi nó là 0 — cùng luật FR-06 áp cho phần dữ liệu vào.
 *
 * Dạng ngày/tháng đọc theo lối Việt Nam (CON-05): '15/07' là 15 tháng 7, không phải 7 tháng 15.
 */
export function parseSeriesDate(raw: string): SeriesDate | null {
  const text = raw.trim();
  if (text === '') return null;

  const iso = ISO.exec(text);
  if (iso !== null) {
    const [, y, m, d] = iso;
    const month = Number(m);
    const day = Number(d);
    return hopLe(month, day) ? { year: Number(y), month, day } : null;
  }

  const dmy = DMY.exec(text);
  if (dmy !== null) {
    const [, d, m, y] = dmy;
    const month = Number(m);
    const day = Number(d);
    return hopLe(month, day) ? { year: Number(y), month, day } : null;
  }

  const dm = DM.exec(text);
  if (dm !== null) {
    const [, d, m] = dm;
    const month = Number(m);
    const day = Number(d);
    return hopLe(month, day) ? { year: null, month, day } : null;
  }

  return null;
}

/** Khoá so sánh của một ngày đã đọc được. Không năm thì khoá chỉ gồm tháng và ngày. */
function khoaNgay(date: SeriesDate): number {
  return date.year === null
    ? date.month * 100 + date.day
    : date.year * 10_000 + date.month * 100 + date.day;
}

/**
 * Sắp xếp chuỗi theo ngày, CŨ → MỚI.
 *
 * Thứ tự trong mảng là thứ tự thời gian thật, và phải giữ nguyên như vậy: `closesOf()` trả mảng
 * theo đúng thứ tự này, còn Beta, độ biến động và VaR đều đọc nó như một chuỗi thời gian. Màn hình
 * muốn bày ngày mới nhất lên đầu thì LẬT LÚC HIỂN THỊ, tuyệt đối không lật mảng đã lưu.
 *
 * ── Hai luật giữ cho phép sắp không bao giờ đoán ───────────────────────────────────────────────
 *
 * 1. **Dòng không đọc được ngày thì ĐỨNG YÊN.** Ô trống, số thứ tự phiên, hay chữ tự do đều rơi
 *    vào nhóm này. Chúng không bị đẩy về một đầu nào cả: hàm chỉ xáo lại những dòng ĐỌC ĐƯỢC, và
 *    xếp chúng vào đúng những vị trí mà chính chúng đang chiếm. Nhờ vậy dòng vừa thêm (ngày còn
 *    trống) nằm im tại chỗ trong lúc người dùng gõ, và không dòng nào biến mất khỏi bảng.
 *
 * 2. **Trộn hai lối viết thì lối THIẾU NĂM nhường chỗ.** '15/07' và '2025-01-20' không so sánh
 *    được với nhau — không có năm thì không biết '15/07' thuộc năm nào. Khi trong bảng có ít nhất
 *    một ngày CÓ năm, những ngày thiếu năm được xếp vào nhóm "đứng yên" của luật 1. Bảng toàn ngày
 *    thiếu năm thì so theo tháng–ngày như thường, vì lúc đó cả bảng cùng một hệ quy chiếu.
 *
 * Sắp ỔN ĐỊNH: hai dòng cùng ngày giữ nguyên thứ tự tương đối, nên phiên trùng ngày (`DUPLICATE_DATE`)
 * không nhảy qua lại mỗi lần sắp.
 */
export function sortRowsByDate(rows: ReadonlyArray<SeriesRow>): SeriesRow[] {
  const parsed = rows.map((row) => parseSeriesDate(row.date));
  const coNam = parsed.some((date) => date !== null && date.year !== null);

  const movable = parsed
    .map((date, index) => ({
      index,
      key: date === null || (coNam && date.year === null) ? null : khoaNgay(date),
    }))
    .filter((entry): entry is { index: number; key: number } => entry.key !== null);

  const sorted = [...movable].sort((a, b) => a.key - b.key || a.index - b.index);

  const out = [...rows];
  movable.forEach((slot, position) => {
    const source = sorted[position];
    if (source === undefined) return;
    const row = rows[source.index];
    if (row !== undefined) out[slot.index] = row;
  });

  return out;
}

/**
 * Chuỗi giá đóng cửa để đưa vào `CalcContext.series`.
 *
 * CHỈ lấy dòng không có vấn đề gì. Lọc bớt còn hơn tính trên dữ liệu mâu thuẫn: một phiên có
 * giá cao nhỏ hơn giá thấp thì giá đóng cửa của nó cũng đáng ngờ.
 */
export function closesOf(rows: ReadonlyArray<SeriesRow>): number[] {
  const check = checkSeries(rows);
  const bad = new Set(check.rows.map((row) => row.index));

  const closes: number[] = [];
  rows.forEach((row, index) => {
    if (bad.has(index)) return;
    if (row.close !== null && Number.isFinite(row.close)) closes.push(row.close);
  });
  return closes;
}

const CSV_HEADER = 'Ngày,Mở,Cao,Thấp,Đóng,Khối lượng';

/** Một ô CSV. Ô rỗng cho giá trị chưa nhập — không ghi 0, vì 0 là một con số có nghĩa khác. */
function cell(value: number | null): string {
  return value === null || !Number.isFinite(value) ? '' : String(value);
}

/**
 * Xuất CSV để mở lại bằng Excel.
 *
 * Ngăn cột bằng dấu phẩy và ô nào chứa dấu phẩy thì bọc trong ngoặc kép — ngày kiểu
 * '15/07' thì không sao, nhưng người dùng gõ tay được bất cứ thứ gì vào ô ngày.
 */
export function toCsv(rows: ReadonlyArray<SeriesRow>, note?: string): string {
  const lines = rows.map((row) => {
    const date =
      row.date.includes(',') || row.date.includes('"')
        ? `"${row.date.replace(/"/g, '""')}"`
        : row.date;
    return [
      date,
      cell(row.open),
      cell(row.high),
      cell(row.low),
      cell(row.close),
      cell(row.volume),
    ].join(',');
  });

  /*
   * `note` đi thành một dòng bình luận '#' TRÊN header, dùng để ghi rằng chuỗi này dựng từ bộ
   * số liệu mẫu bản thảo. File CSV rời khỏi ứng dụng và được mở lại sau nhiều tháng — không
   * ghi vào chính file thì không còn chỗ nào nói được điều đó.
   *
   * Excel hiện dòng '#' như một ô chữ ở hàng đầu; đó là cái giá chấp nhận được để đổi lấy
   * việc dấu vết đi cùng dữ liệu. Bộ đọc của chính sản phẩm (`parsePaste`) bỏ qua dòng không
   * có đủ số hợp lệ, nên nạp lại vẫn chạy.
   */
  const header =
    note === undefined ? [CSV_HEADER] : [`# ${note.replace(/[\r\n]+/g, ' ')}`, CSV_HEADER];
  return [...header, ...lines].join('\n');
}
