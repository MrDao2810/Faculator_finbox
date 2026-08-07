/**
 * Tầng DOMAIN — danh mục cá nhân của màn WF-06 (gói WBS 3.4.1).
 *
 * Bốn con số ở đầu màn (tổng giá trị · beta danh mục · XIRR toàn danh mục · số mã) đều là
 * KẾT QUẢ TÍNH, nên tất cả đi qua `CalcOutput` chứ không trả số trần — FR-06 áp cho màn này
 * y như cho mọi công thức. Thiếu dữ liệu thì hiện "— , —" kèm lý do, không hiện 0.
 *
 * Danh mục nằm trên máy người dùng (NFR-SEC-01, COM-03); phần cất giữ do tầng Application lo,
 * ở đây chỉ có phép tính thuần.
 */

import { fail, ok } from './calc-output';
import { xirr } from './formulas/returns';
import type { CalcOutput } from './types';

/** Một mã đang nắm giữ. */
export interface Holding {
  /** Mã cổ phiếu viết hoa, ví dụ 'FPT'. */
  code: string;
  /** Số cổ phiếu. */
  quantity: number;
  /** Giá vốn bình quân một cổ phiếu, đơn vị ₫. */
  costPrice: number;
  /**
   * Ngày mua dạng ISO 'YYYY-MM-DD'. Cần cho XIRR — không có ngày thì không có dòng tiền,
   * và Domain không được tự lấy ngày hệ thống (NFR-REL-03).
   */
  buyDate: string;
  /**
   * Beta của mã, người dùng nhập tay.
   *
   * Chưa tính tự động được: beta cần chuỗi lợi suất của mã **và** của chỉ số thị trường, mà
   * bộ số liệu hiện tại chỉ có chuỗi giá từng mã. Thiếu beta ở bất kỳ mã nào thì beta danh
   * mục báo thiếu chứ không lặng lẽ coi mã đó bằng 1.
   */
  beta?: number | null;
}

export interface HoldingValue {
  holding: Holding;
  /** Thị giá dùng để định giá, đơn vị ₫. `null` khi không tra được giá. */
  marketPrice: number | null;
  /** Giá trị thị trường = số lượng × thị giá. `null` khi thiếu giá. */
  value: number | null;
  /** Tỷ trọng trên tổng danh mục, đơn vị %. `null` khi thiếu giá. */
  weight: number | null;
}

export interface PortfolioSummary {
  rows: ReadonlyArray<HoldingValue>;
  /** Tổng giá trị thị trường, đơn vị ₫. */
  totalValue: CalcOutput;
  /** Beta bình quân gia quyền theo giá trị. */
  beta: CalcOutput;
  /** Suất sinh lợi theo dòng tiền thực của cả danh mục, đơn vị %/năm. */
  xirr: CalcOutput;
  /** Số mã đang nắm giữ. */
  count: CalcOutput;
}

/** Ngày ISO hợp lệ hay không. Chuỗi rác thì XIRR không tính được, phải nói rõ thay vì bỏ qua. */
function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/**
 * Định giá từng mã theo bảng thị giá tra được.
 *
 * `prices` là bảng tra mã → thị giá. Mã không có trong bảng thì `value` là `null` chứ không
 * rơi về giá vốn: giá vốn không phải giá thị trường, thay thế như thế là bịa số.
 */
export function valueHoldings(
  holdings: ReadonlyArray<Holding>,
  prices: ReadonlyMap<string, number>,
): HoldingValue[] {
  const priced = holdings.map((holding) => {
    const marketPrice = prices.get(holding.code) ?? null;
    const usable =
      marketPrice !== null &&
      Number.isFinite(marketPrice) &&
      marketPrice > 0 &&
      Number.isFinite(holding.quantity) &&
      holding.quantity > 0;

    return {
      holding,
      marketPrice: usable ? marketPrice : null,
      value: usable ? holding.quantity * marketPrice : null,
      weight: null as number | null,
    };
  });

  const total = priced.reduce((sum, row) => sum + (row.value ?? 0), 0);
  if (total <= 0) return priced;

  return priced.map((row) => ({
    ...row,
    weight: row.value === null ? null : (row.value / total) * 100,
  }));
}

/**
 * Bốn con số đầu màn WF-06.
 *
 * `asOf` bắt buộc: XIRR cần một mốc "hôm nay" để quy giá trị hiện tại thành dòng tiền dương,
 * và Domain không được tự lấy ngày hệ thống — cùng lý do `resolveConstant()` bắt buộc nhận
 * `asOf` (NFR-REL-03).
 */
export function summarisePortfolio(
  holdings: ReadonlyArray<Holding>,
  prices: ReadonlyMap<string, number>,
  asOf: string,
): PortfolioSummary {
  const rows = valueHoldings(holdings, prices);
  const count = ok(holdings.length, 'mã');

  if (holdings.length === 0) {
    const empty = (unit: string): CalcOutput =>
      fail(unit, {
        code: 'INCOMPLETE_INPUT',
        message: 'Danh mục chưa có mã nào.',
        fix: 'Bấm “Thêm mã cổ phiếu” để bắt đầu.',
      });

    return {
      rows,
      totalValue: empty('₫'),
      beta: empty('lần'),
      xirr: empty('%/năm'),
      count,
    };
  }

  // ── Tổng giá trị ──────────────────────────────────────────────────────────
  const missingPrice = rows.filter((row) => row.value === null).map((row) => row.holding.code);
  const total = rows.reduce((sum, row) => sum + (row.value ?? 0), 0);

  const totalValue =
    missingPrice.length > 0
      ? fail('₫', {
          code: 'MISSING_SERIES',
          message: `Chưa tra được thị giá của ${missingPrice.join(', ')} nên không tính được tổng giá trị.`,
          fix: 'Nạp bộ số liệu mẫu có mã này, hoặc bỏ mã khỏi danh mục.',
        })
      : ok(total, '₫');

  // ── Beta danh mục — bình quân gia quyền theo giá trị ───────────────────────
  const missingBeta = holdings
    .filter((holding) => holding.beta === undefined || holding.beta === null)
    .map((holding) => holding.code);

  let beta: CalcOutput;
  if (missingBeta.length > 0) {
    beta = fail('lần', {
      code: 'MISSING_SERIES',
      message: `Chưa có beta của ${missingBeta.join(', ')}. Beta danh mục là bình quân gia quyền nên thiếu một mã là chưa tính được.`,
      fix: 'Nhập beta cho mã còn thiếu khi sửa mã đó.',
    });
  } else if (totalValue.value === null || totalValue.value <= 0) {
    beta = fail('lần', {
      code: 'INHERITED',
      message: 'Chưa tính được beta danh mục vì tổng giá trị danh mục đang lỗi.',
      fix: 'Sửa phần thị giá ở trên trước.',
    });
  } else {
    const weighted = rows.reduce((sum, row) => sum + (row.value ?? 0) * (row.holding.beta ?? 0), 0);
    beta = ok(weighted / totalValue.value, 'lần');
  }

  // ── XIRR toàn danh mục ────────────────────────────────────────────────────
  const badDates = holdings.filter((holding) => !isIsoDate(holding.buyDate)).map((h) => h.code);

  /*
   * Ngày mua nằm SAU ngày định giá là dữ liệu vô lý, nhưng XIRR vẫn ra một con số: dòng tiền
   * đảo chiều nên phương trình vẫn có nghiệm (đo được −22 %/năm trong một ca kiểm). Con số đó
   * đọc như một khoản lỗ, trong khi thật ra là người dùng gõ nhầm năm. Chặn ở đây thay vì để
   * nó trôi ra màn — đúng loại "số sai mà trông có lý" mà FR-06 muốn tránh.
   */
  const futureBuys = holdings
    .filter((holding) => isIsoDate(holding.buyDate) && isIsoDate(asOf) && holding.buyDate > asOf)
    .map((holding) => holding.code);

  let rate: CalcOutput;
  if (badDates.length > 0) {
    rate = fail('%/năm', {
      code: 'INCOMPLETE_INPUT',
      message: `Thiếu hoặc sai ngày mua của ${badDates.join(', ')} — không có ngày thì không dựng được dòng tiền.`,
      fix: 'Nhập ngày mua dạng ngày-tháng-năm cho mã còn thiếu.',
    });
  } else if (!isIsoDate(asOf)) {
    rate = fail('%/năm', {
      code: 'INCOMPLETE_INPUT',
      message: 'Thiếu ngày định giá nên chưa quy được giá trị hiện tại thành dòng tiền.',
    });
  } else if (futureBuys.length > 0) {
    rate = fail('%/năm', {
      code: 'MODEL_VIOLATION',
      message: `Ngày mua của ${futureBuys.join(', ')} nằm sau ngày định giá — chưa mua thì chưa có lợi suất để tính.`,
      fix: 'Kiểm tra lại năm trong ngày mua.',
    });
  } else if (totalValue.value === null || totalValue.value <= 0) {
    rate = fail('%/năm', {
      code: 'INHERITED',
      message: 'Chưa tính được XIRR vì tổng giá trị danh mục đang lỗi.',
      fix: 'Sửa phần thị giá ở trên trước.',
    });
  } else {
    /*
     * Dòng tiền: mỗi lần mua là một khoản chi (âm) đúng ngày mua, và toàn bộ giá trị đang
     * nắm giữ là một khoản thu (dương) tại ngày định giá — tức coi như bán sạch hôm nay.
     * Đây là cách đọc chuẩn của "lợi suất theo dòng tiền thực" trên một danh mục còn mở.
     */
    const cashflows = [
      ...holdings.map((holding) => ({
        date: holding.buyDate,
        amount: -(holding.quantity * holding.costPrice),
      })),
      { date: asOf, amount: totalValue.value },
    ];

    const result = xirr(cashflows);
    rate =
      result === null
        ? fail('%/năm', {
            code: 'MEANINGLESS',
            message:
              'Dòng tiền của danh mục này không có suất sinh lợi nào làm giá trị hiện tại về 0.',
            fix: 'Kiểm tra lại ngày mua và giá vốn.',
          })
        : ok(result * 100, '%/năm');
  }

  return { rows, totalValue, beta, xirr: rate, count };
}
