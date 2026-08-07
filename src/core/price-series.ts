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
        message: `Giá cao nhất (${high}) nhỏ hơn giá thấp nhất (${low}) — vui lòng kiểm tra lại.`,
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
        message: `Giá cao nhất (${high}) đang nhỏ hơn giá mở hoặc giá đóng cửa của chính phiên đó.`,
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
        message: `Giá thấp nhất (${low}) đang lớn hơn giá mở hoặc giá đóng cửa của chính phiên đó.`,
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
        issues.push({
          code: 'DUPLICATE_DATE',
          message: `Ngày ${key} đã có ở dòng ${first + 1} — mỗi phiên chỉ được xuất hiện một lần.`,
        });
      }
    }

    if (issues.length === 0) usable += 1;
    else checks.push({ index, issues });
  });

  return { rows: checks, usableCount: usable, total: rows.length };
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
