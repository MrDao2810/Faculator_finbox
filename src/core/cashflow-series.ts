/**
 * Tầng DOMAIN — bảng dòng tiền có ngày, sửa được tay (màn thân riêng của XIRR, gói WBS 3.3.1).
 *
 * Cùng nguyên tắc với `price-series.ts`: **không hàm nào ném lỗi**. Một dòng sai không được
 * làm hỏng cả bảng — nó được đánh dấu kèm lý do đọc được, các dòng còn lại vẫn dùng được.
 *
 * Khác `price-series.ts` ở chỗ bảng này KHÔNG dùng chung cho cả nhóm Rủi ro: XIRR là công thức
 * duy nhất cần dòng tiền có ngày (khác với chuỗi giá đóng cửa mà Beta, Sharpe, VaR… cùng đọc),
 * nên bảng này sống trong thân riêng của chính XIRR (`ui/screens/XirrBody.tsx`) chứ không phải
 * một màn dùng chung như `/du-lieu/`.
 */

/**
 * Một dòng tiền đã đủ để tính — cả hai trường đều bắt buộc, `amount` khác 0.
 * Đây là hình dạng `CalcContext.cashflows` và `spec.tests[].cashflows` đọc.
 */
export interface Cashflow {
  /** Ngày dạng ISO 'YYYY-MM-DD'. */
  date: string;
  /** Số âm là tiền chi ra, số dương là tiền thu về. */
  amount: number;
}

/**
 * Một dòng trong bảng sửa tay. `amount` là `number | null` — ô chưa điền là `null` chứ không
 * phải 0, cùng lý do `SeriesRow.close` của `price-series.ts` không phải 0.
 */
export interface CashflowRow {
  date: string;
  amount: number | null;
}

export type CashflowIssueCode =
  | 'MISSING_DATE'
  | 'MISSING_AMOUNT'
  | 'ZERO_AMOUNT'
  | 'DUPLICATE_DATE';

export interface CashflowRowIssue {
  code: CashflowIssueCode;
  /** Câu tiếng Việt nêu đúng nguyên nhân, viết như nói với người mới (NFR-USA-04). */
  message: string;
}

/** Kết quả kiểm một dòng: chỉ số dòng trong bảng (đếm từ 0) kèm các vấn đề tìm thấy. */
export interface CashflowRowCheck {
  index: number;
  issues: ReadonlyArray<CashflowRowIssue>;
}

export interface CashflowSeriesCheck {
  /** Chỉ những dòng CÓ vấn đề, giữ nguyên thứ tự bảng. */
  rows: ReadonlyArray<CashflowRowCheck>;
  /** Số dòng dùng được để tính XIRR — đủ ngày, đủ số tiền, không có lỗi nào. */
  usableCount: number;
  total: number;
}

/** Dòng trống hoàn toàn, dùng khi bấm "Thêm dòng". */
export function emptyCashflowRow(): CashflowRow {
  return { date: '', amount: null };
}

/** Kiểm một dòng. Thiếu dữ liệu trước, giá trị vô nghĩa (bằng 0) sau. */
export function checkCashflowRow(row: CashflowRow): ReadonlyArray<CashflowRowIssue> {
  const issues: CashflowRowIssue[] = [];

  if (row.date.trim() === '') {
    issues.push({ code: 'MISSING_DATE', message: 'Thiếu ngày của dòng tiền này.' });
  }

  if (row.amount === null) {
    issues.push({
      code: 'MISSING_AMOUNT',
      message: 'Thiếu số tiền — âm là chi ra, dương là thu về.',
    });
  } else if (row.amount === 0) {
    issues.push({
      code: 'ZERO_AMOUNT',
      message: 'Số tiền bằng 0 không phải một dòng tiền — xoá dòng này nếu không có giao dịch.',
    });
  }

  return issues;
}

/**
 * Kiểm cả bảng. Ngày trùng nhau chỉ phát hiện được ở mức bảng nên nằm ở đây, cùng lý do với
 * `checkSeries()` của `price-series.ts`.
 */
export function checkCashflowSeries(rows: ReadonlyArray<CashflowRow>): CashflowSeriesCheck {
  const seen = new Map<string, number>();
  const checks: CashflowRowCheck[] = [];
  let usable = 0;

  rows.forEach((row, index) => {
    const issues = [...checkCashflowRow(row)];

    const key = row.date.trim();
    if (key !== '') {
      const first = seen.get(key);
      if (first === undefined) {
        seen.set(key, index);
      } else {
        issues.push({
          code: 'DUPLICATE_DATE',
          message: `Ngày ${key} đã có ở dòng ${String(first + 1)} — gộp hai dòng tiền cùng ngày lại thành một.`,
        });
      }
    }

    if (issues.length === 0) usable += 1;
    else checks.push({ index, issues });
  });

  return { rows: checks, usableCount: usable, total: rows.length };
}

/**
 * Dòng tiền đưa vào `CalcContext.cashflows`. CHỈ lấy dòng không có vấn đề gì — cùng lý do
 * `closesOf()` của `price-series.ts` lọc trước khi đưa vào công thức.
 */
export function cashflowsOf(rows: ReadonlyArray<CashflowRow>): Cashflow[] {
  const check = checkCashflowSeries(rows);
  const bad = new Set(check.rows.map((row) => row.index));

  const flows: Cashflow[] = [];
  rows.forEach((row, index) => {
    if (bad.has(index)) return;
    if (row.amount !== null && row.amount !== 0)
      flows.push({ date: row.date.trim(), amount: row.amount });
  });
  return flows;
}
