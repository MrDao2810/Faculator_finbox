/**
 * Tầng DOMAIN — danh mục cá nhân của màn WF-06 (gói WBS 3.4.1).
 *
 * Các con số ở đầu màn (tổng giá trị · vốn đã bỏ ra · lãi/lỗ ₫ và % · beta danh mục · XIRR toàn
 * danh mục · số mã) đều là KẾT QUẢ TÍNH, nên tất cả đi qua `CalcOutput` chứ không trả số trần —
 * FR-06 áp cho màn này y như cho mọi công thức. Thiếu dữ liệu thì hiện "— , —" kèm lý do,
 * không hiện 0.
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
  /**
   * Tên doanh nghiệp, ví dụ 'FPT Corp'. Không bắt buộc.
   *
   * Thuần để HIỆN, không phép tính nào đọc tới. Có mặt vì ô chọn mã cho tìm theo tên công ty:
   * người dùng gõ "hoà phát" để tìm ra HPG, rồi danh sách nắm giữ chỉ hiện mỗi 'HPG' thì công
   * sức tìm ấy mất trắng. Danh mục cũ trong máy chưa có trường này nên nó là tuỳ chọn.
   */
  name?: string;
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
  /**
   * Vốn đã bỏ ra = số lượng × giá vốn, đơn vị ₫.
   *
   * KHÔNG phụ thuộc thị giá — đây là tiền người dùng đã trả, tra được hay không tra được giá thì
   * nó vẫn thế. Nhờ vậy màn còn một con số thật để hiện cả lúc mất mạng.
   */
  cost: number | null;
  /** Lãi/lỗ chưa thực hiện = giá trị thị trường − vốn, đơn vị ₫. `null` khi thiếu giá. */
  gain: number | null;
  /** Lãi/lỗ trên vốn, đơn vị %. `null` khi thiếu giá hoặc vốn không dương. */
  gainPercent: number | null;
}

/**
 * Bảng thị giá đang ở tình trạng nào.
 *
 * `'ready'` — tra được nguồn, mã nào vắng là vì nguồn không có mã đó.
 * `'failed'` — không hỏi được nguồn và cũng không có gì để thay (mất mạng, hết hạn chờ, lỗi máy chủ).
 * `'stale'` — không hỏi được nguồn, nhưng đang dùng giá của một phiên đã lưu trước đó.
 *
 * Ba ca cần **ba lời khuyên khác nhau**: ca đầu bảo người dùng bỏ mã đi, hai ca sau bảo họ thử
 * lại. Trước khi có tham số này, màn khuyên "bỏ mã khỏi danh mục" ngay cả lúc chỉ là rớt wifi —
 * tức xui người dùng xoá dữ liệu thật của họ vì một sự cố tạm thời.
 *
 * `'stale'` KHÔNG làm phép tính hỏng: giá của một phiên đã đóng cửa vẫn là giá thật, chỉ là cũ.
 * Điều kiện để nó lương thiện nằm ở tầng giao diện — màn phải nói rõ đang dùng giá phiên nào
 * (`TickerSnapshot.asOfDate`). Hiện một cái giá cũ mà im lặng mới là thứ FR-06 cấm.
 */
export type PriceState = 'ready' | 'failed' | 'stale';

export interface PortfolioSummary {
  rows: ReadonlyArray<HoldingValue>;
  /** Tổng giá trị thị trường, đơn vị ₫. */
  totalValue: CalcOutput;
  /** Tổng vốn đã bỏ ra, đơn vị ₫. Không cần thị giá nên gần như luôn tính được. */
  totalCost: CalcOutput;
  /** Lãi/lỗ chưa thực hiện của cả danh mục, đơn vị ₫. */
  gain: CalcOutput;
  /** Lãi/lỗ trên vốn của cả danh mục, đơn vị %. */
  gainPercent: CalcOutput;
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
    const quantityOk = Number.isFinite(holding.quantity) && holding.quantity > 0;
    const usable =
      marketPrice !== null && Number.isFinite(marketPrice) && marketPrice > 0 && quantityOk;

    const value = usable ? holding.quantity * marketPrice : null;
    /*
     * Vốn tính riêng, KHÔNG kèm điều kiện có thị giá: đây là tiền đã trả, không liên quan gì tới
     * việc hôm nay tra được giá hay không. Tách như thế thì lúc mất mạng màn vẫn còn một con số
     * thật để hiện thay vì trống trơn cả khối.
     */
    const cost =
      quantityOk && Number.isFinite(holding.costPrice) && holding.costPrice > 0
        ? holding.quantity * holding.costPrice
        : null;

    return {
      holding,
      marketPrice: usable ? marketPrice : null,
      value,
      weight: null as number | null,
      cost,
      gain: value === null || cost === null ? null : value - cost,
      gainPercent:
        value === null || cost === null || cost <= 0 ? null : ((value - cost) / cost) * 100,
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
 * Bảy con số đầu màn WF-06.
 *
 * `asOf` bắt buộc: XIRR cần một mốc "hôm nay" để quy giá trị hiện tại thành dòng tiền dương,
 * và Domain không được tự lấy ngày hệ thống — cùng lý do `resolveConstant()` bắt buộc nhận
 * `asOf` (NFR-REL-03).
 */
export function summarisePortfolio(
  holdings: ReadonlyArray<Holding>,
  prices: ReadonlyMap<string, number>,
  asOf: string,
  priceState: PriceState = 'ready',
): PortfolioSummary {
  const rows = valueHoldings(holdings, prices);
  const count = ok(holdings.length, 'mã');

  if (holdings.length === 0) {
    const empty = (unit: string): CalcOutput =>
      fail(unit, {
        code: 'INCOMPLETE_INPUT',
        message: {
          vi: 'Danh mục chưa có mã nào.',
          en: 'The portfolio has no holdings yet.',
        },
        fix: {
          vi: 'Bấm “Thêm mã cổ phiếu” để bắt đầu.',
          en: 'Tap "Add a stock" to get started.',
        },
      });

    return {
      rows,
      totalValue: empty('₫'),
      totalCost: empty('₫'),
      gain: empty('₫'),
      gainPercent: empty('%'),
      beta: empty('lần'),
      xirr: empty('%/năm'),
      count,
    };
  }

  // ── Tổng giá trị ──────────────────────────────────────────────────────────
  const missingPrice = rows.filter((row) => row.value === null).map((row) => row.holding.code);
  const total = rows.reduce((sum, row) => sum + (row.value ?? 0), 0);

  const missingList = missingPrice.join(', ');
  const totalValue =
    missingPrice.length > 0
      ? fail(
          '₫',
          /*
           * `'stale'` đi chung nhánh với `'failed'`: cả hai đều là "không hỏi được nguồn". Khác
           * biệt duy nhất là ca `'stale'` còn giá cũ để dùng, nên phần lớn mã vẫn có giá và
           * nhánh này chỉ chạy khi có mã VẮNG MẶT cả trong bản cache — mà lúc ấy nguyên nhân
           * đúng vẫn là mất mạng, không phải "nguồn không có mã này".
           */
          priceState !== 'ready'
            ? {
                code: 'MISSING_SERIES',
                message: {
                  vi: 'Chưa lấy được thị giá từ nguồn dữ liệu nên không tính được tổng giá trị.',
                  en: 'Could not fetch market prices from the data source, so the total value cannot be calculated.',
                },
                fix: {
                  vi: 'Kiểm tra kết nối mạng rồi bấm “Thử lại”.',
                  en: 'Check your network connection, then tap "Try again".',
                },
              }
            : {
                code: 'MISSING_SERIES',
                message: {
                  vi: `Chưa tra được thị giá của ${missingList} nên không tính được tổng giá trị.`,
                  en: `Could not look up the market price of ${missingList}, so the total value cannot be calculated.`,
                },
                fix: {
                  vi: 'Nguồn dữ liệu chưa có mã này — kiểm tra lại mã, hoặc bỏ mã khỏi danh mục.',
                  en: 'The data source has no such ticker — check the code, or remove it from the portfolio.',
                },
              },
        )
      : ok(total, '₫');

  // ── Vốn đã bỏ ra và lãi/lỗ chưa thực hiện ─────────────────────────────────
  /*
   * Vốn KHÔNG phụ thuộc thị giá, nên nó vẫn ra số ngay cả lúc mất mạng — đó là chủ ý. Chỉ hỏng
   * khi chính dữ liệu người dùng nhập hỏng (số lượng hoặc giá vốn không dương), mà `parseHoldings`
   * đã loại từ đầu; nhánh này là lưới an toàn cho đường gọi trực tiếp từ test hoặc mã khác.
   */
  const missingCost = rows.filter((row) => row.cost === null).map((row) => row.holding.code);
  const totalCost =
    missingCost.length > 0
      ? fail('₫', {
          code: 'INCOMPLETE_INPUT',
          message: {
            vi: `Thiếu số lượng hoặc giá vốn của ${missingCost.join(', ')} nên chưa cộng được vốn đã bỏ ra.`,
            en: `Missing the quantity or cost price of ${missingCost.join(', ')}, so the invested amount cannot be totalled.`,
          },
          fix: {
            vi: 'Bấm vào mã đó để sửa lại số lượng và giá vốn.',
            en: 'Tap that ticker to correct its quantity and cost price.',
          },
        })
      : ok(
          rows.reduce((sum, row) => sum + (row.cost ?? 0), 0),
          '₫',
        );

  /*
   * Lãi/lỗ là HIỆU của hai con số trên, nên hỏng ở đâu thì thừa hưởng ở đó (FR-15). Không được
   * lấy `total` trần: `total` cộng bằng `row.value ?? 0`, tức coi mã thiếu giá như bằng 0 — đem
   * trừ vốn của chính mã ấy sẽ ra một khoản "lỗ" bịa đúng bằng số tiền đã bỏ ra.
   */
  const brokenSide = totalValue.value === null ? 'value' : totalCost.value === null ? 'cost' : null;

  const gain =
    brokenSide === null
      ? ok((totalValue.value ?? 0) - (totalCost.value ?? 0), '₫')
      : fail('₫', {
          code: 'INHERITED',
          message: {
            vi:
              brokenSide === 'value'
                ? 'Chưa tính được lãi/lỗ vì tổng giá trị danh mục đang lỗi.'
                : 'Chưa tính được lãi/lỗ vì tổng vốn đã bỏ ra đang lỗi.',
            en:
              brokenSide === 'value'
                ? 'Cannot calculate the gain or loss because the total portfolio value is broken.'
                : 'Cannot calculate the gain or loss because the total invested amount is broken.',
          },
          fix: {
            vi:
              brokenSide === 'value'
                ? 'Sửa phần thị giá ở trên trước.'
                : 'Sửa lại số lượng và giá vốn của mã còn thiếu.',
            en:
              brokenSide === 'value'
                ? 'Fix the market price section above first.'
                : 'Correct the quantity and cost price of the incomplete ticker.',
          },
        });

  let gainPercent: CalcOutput;
  if (gain.value === null || totalCost.value === null) {
    gainPercent = fail('%', {
      code: 'INHERITED',
      message: {
        vi: 'Chưa tính được lãi/lỗ theo phần trăm vì số lãi/lỗ tuyệt đối đang lỗi.',
        en: 'Cannot calculate the percentage gain because the absolute gain is broken.',
      },
      fix: {
        vi: 'Sửa nguyên nhân của ô Lãi/lỗ ở trên.',
        en: 'Fix the cause shown on the gain tile above.',
      },
    });
  } else if (totalCost.value <= 0) {
    gainPercent = fail('%', {
      code: 'DIVIDE_BY_ZERO',
      message: {
        vi: 'Vốn đã bỏ ra bằng 0 nên không có mẫu số để tính phần trăm lãi/lỗ.',
        en: 'The invested amount is zero, so there is no denominator for a percentage gain.',
      },
      fix: {
        vi: 'Nhập giá vốn lớn hơn 0 cho các mã trong danh mục.',
        en: 'Enter a cost price above 0 for the holdings in the portfolio.',
      },
    });
  } else {
    gainPercent = ok((gain.value / totalCost.value) * 100, '%');
  }

  // ── Beta danh mục — bình quân gia quyền theo giá trị ───────────────────────
  const missingBeta = holdings
    .filter((holding) => holding.beta === undefined || holding.beta === null)
    .map((holding) => holding.code);

  let beta: CalcOutput;
  if (missingBeta.length > 0) {
    beta = fail('lần', {
      code: 'MISSING_SERIES',
      message: {
        vi: `Chưa có beta của ${missingBeta.join(', ')}. Beta danh mục là bình quân gia quyền nên thiếu một mã là chưa tính được.`,
        en: `Missing beta for ${missingBeta.join(', ')}. Portfolio beta is a weighted average, so a missing ticker means it cannot be calculated.`,
      },
      fix: {
        vi: 'Bấm vào mã còn thiếu trong danh sách dưới đây để sửa và nhập beta.',
        en: 'Tap the ticker below that is missing a beta to edit it and enter one.',
      },
    });
  } else if (totalValue.value === null || totalValue.value <= 0) {
    beta = fail('lần', {
      code: 'INHERITED',
      message: {
        vi: 'Chưa tính được beta danh mục vì tổng giá trị danh mục đang lỗi.',
        en: 'Cannot calculate portfolio beta because the total portfolio value is broken.',
      },
      fix: {
        vi: 'Sửa phần thị giá ở trên trước.',
        en: 'Fix the market price section above first.',
      },
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
      message: {
        vi: `Thiếu hoặc sai ngày mua của ${badDates.join(', ')} — không có ngày thì không dựng được dòng tiền.`,
        en: `Missing or invalid buy date for ${badDates.join(', ')} — without a date, no cash flow can be built.`,
      },
      fix: {
        vi: 'Nhập ngày mua dạng ngày-tháng-năm cho mã còn thiếu.',
        en: 'Enter a day-month-year buy date for the missing ticker.',
      },
    });
  } else if (!isIsoDate(asOf)) {
    rate = fail('%/năm', {
      code: 'INCOMPLETE_INPUT',
      message: {
        vi: 'Thiếu ngày định giá nên chưa quy được giá trị hiện tại thành dòng tiền.',
        en: 'Missing the valuation date, so the current value cannot be turned into a cash flow.',
      },
    });
  } else if (futureBuys.length > 0) {
    rate = fail('%/năm', {
      code: 'MODEL_VIOLATION',
      message: {
        vi: `Ngày mua của ${futureBuys.join(', ')} nằm sau ngày định giá — chưa mua thì chưa có lợi suất để tính.`,
        en: `The buy date of ${futureBuys.join(', ')} is after the valuation date — there's no return to calculate before a purchase happens.`,
      },
      fix: {
        vi: 'Kiểm tra lại năm trong ngày mua.',
        en: 'Double-check the year in the buy date.',
      },
    });
  } else if (totalValue.value === null || totalValue.value <= 0) {
    rate = fail('%/năm', {
      code: 'INHERITED',
      message: {
        vi: 'Chưa tính được XIRR vì tổng giá trị danh mục đang lỗi.',
        en: 'Cannot calculate XIRR because the total portfolio value is broken.',
      },
      fix: {
        vi: 'Sửa phần thị giá ở trên trước.',
        en: 'Fix the market price section above first.',
      },
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
            message: {
              vi: 'Dòng tiền của danh mục này không có suất sinh lợi nào làm giá trị hiện tại về 0.',
              en: 'This portfolio’s cash flows have no rate of return that brings the present value to 0.',
            },
            fix: {
              vi: 'Kiểm tra lại ngày mua và giá vốn.',
              en: 'Double-check the buy dates and cost prices.',
            },
          })
        : ok(result * 100, '%/năm');
  }

  return { rows, totalValue, totalCost, gain, gainPercent, beta, xirr: rate, count };
}
