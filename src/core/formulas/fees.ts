/**
 * Tầng DOMAIN — nhóm phí & thuế thị trường Việt Nam, 8 công thức (gói WBS 5.1.2).
 *
 * Đây là phép tính bán hàng của sản phẩm: nhà đầu tư cá nhân hay quên rằng lãi trên bảng giá
 * không phải lãi vào túi. Màn WF-08 dựng trên đúng tám công thức dưới đây.
 *
 * Mọi mức phí và thuế đọc từ MarketConfig qua `rateOf()`, KHÔNG viết số vào thân hàm
 * (LDR-03, CON-10). Nhờ vậy khi biểu phí đổi thì sửa một bản ghi, tám công thức tự đúng theo.
 *
 * Bộ số kiểm chứng lấy đúng ví dụ WF-08: 1.000 CP, giữ 5 tháng, mua 92.000 ₫, bán 97.000 ₫,
 * biểu phí "Mặc định HOSE 2026".
 *
 * ## Vì sao năm công thức ở nhóm này khai `chartType: 'none'`
 *
 * Lý do viết MỘT LẦN ở đây thay vì chép năm lần xuống dưới, vì cả năm cùng đúng một lẽ:
 * `phi-giao-dich-mua`, `phi-giao-dich-ban`, `thue-chuyen-nhuong`, `thue-co-tuc`, `phi-luu-ky` đều
 * có dạng **tích của các đầu vào với một tỉ lệ hằng** (`Q × P × r`, `Q × M × c`). Quét bất kỳ biến
 * nào trong đó cũng ra một ĐOẠN THẲNG đi qua gốc — hình mà người đọc đoán trước được trọn vẹn từ
 * chính dòng `expression` ngay trên nó, nên vẽ ra là thêm một khối chiếm nửa màn mà không thêm
 * một thông tin nào.
 *
 * Đây là ranh giới cần đọc kỹ trước khi mở thêm cái nào: điều kiện KHÔNG phải "công thức đơn
 * giản" mà là "đường quét thẳng". Đợt kiểm kê đã mở `so-hop-dong-toi-da` (có hàm làm tròn xuống →
 * bậc thang) và `gia-von-trung-binh-dca` (ẩn số nằm ở mẫu → đường cong) đúng theo ranh giới đó.
 * Ba công thức còn lại của nhóm — `gia-hoa-von`, `loi-nhuan-rong`, `roi-rong` — đều khai
 * `'sensitivity'`, và đúng theo cùng ranh giới ấy: cả ba cộng/trừ nhiều khoản phí rồi mới chia,
 * nên đường quét không còn đi qua gốc (`gia-hoa-von` có tổng phí ở tử và một hiệu ở mẫu,
 * `roi-rong` có ẩn số ở cả tử lẫn mẫu).
 */

import { ok } from '../calc-output';
import { runFormula } from '../calc/run';
import type { CalcContext, CalcValues, FormulaModule } from '../calc/types';
import { formatNumber } from '../format';
import type { Bilingual, CalcOutput } from '../types';
import { divideByZero, meaningless } from '../warnings';
import {
  SOURCE_FEE_CIRCULAR,
  SOURCE_PIT_LAW,
  SOURCE_VSD,
  constantOf,
  missingConstant,
  numberVar,
  rateOf,
} from './shared';

/*
 * ── Biến dùng chung cho cả nhóm ────────────────────────────────────────────────────────
 * Cùng một key mang cùng một ý nghĩa ở cả tám công thức, để màn WF-08 lấy một bộ bốn ô nhập
 * mà chạy được hết.
 */

const quantity = numberVar('quantity', { vi: 'Khối lượng', en: 'Quantity' }, 'CP', 1_000, {
  min: 0,
  max: 50_000_000,
  description: {
    vi: 'Số cổ phiếu mua vào rồi bán ra.',
    en: 'Number of shares bought and then sold.',
  },
});

const months = numberVar('months', { vi: 'Thời gian nắm giữ', en: 'Holding period' }, 'tháng', 5, {
  min: 0,
  max: 600,
  description: {
    vi: 'Số tháng cổ phiếu nằm trong tài khoản lưu ký.',
    en: 'Number of months the shares sit in the custody account.',
  },
});

const buyPrice = numberVar('buyPrice', { vi: 'Giá mua', en: 'Buy price' }, '₫', 92_000, {
  min: 0,
  max: 10_000_000,
  description: {
    vi: 'Giá khớp lệnh mua, tính cho một cổ phiếu.',
    en: 'The matched buy price, per share.',
  },
});

const sellPrice = numberVar('sellPrice', { vi: 'Giá bán', en: 'Sell price' }, '₫', 97_000, {
  min: 0,
  max: 10_000_000,
  description: {
    vi: 'Giá khớp lệnh bán, tính cho một cổ phiếu.',
    en: 'The matched sell price, per share.',
  },
});

const dividendPerShare = numberVar(
  'dividendPerShare',
  { vi: 'Cổ tức tiền mặt', en: 'Cash dividend' },
  '₫/CP',
  2_000,
  {
    min: 0,
    max: 1_000_000,
    description: {
      vi: 'Số tiền cổ tức nhận được trên mỗi cổ phiếu, trước thuế.',
      en: 'The dividend amount received per share, before tax.',
    },
  },
);

/** Ví dụ WF-08 dùng lại cho `example` và `tests` của cả nhóm. */
const WF08 = { quantity: 1_000, months: 5, buyPrice: 92_000, sellPrice: 97_000 } as const;

/*
 * ── 1. Phí giao dịch mua ───────────────────────────────────────────────────────────────
 */

export const PHI_GIAO_DICH_MUA: FormulaModule = {
  spec: {
    id: 'phi-giao-dich-mua',
    categoryId: 'fees-tax',
    name: { vi: 'Phí giao dịch mua', en: 'Buy-side brokerage fee' },
    description: {
      vi: 'Phí công ty chứng khoán thu khi lệnh mua khớp.',
      en: 'The fee the brokerage charges when a buy order is matched.',
    },
    latex: 'F_{mua} = Q \\times P_{mua} \\times r_{mua}',
    expression: {
      vi: 'Phí mua = Khối lượng × Giá mua × Tỷ lệ phí mua',
      en: 'Buy fee = Quantity × Buy price × Buy fee rate',
    },
    // Đường quét là đoạn thẳng qua gốc — lý do đầy đủ ở docblock đầu file.
    chartType: 'none',
    level: 'basic',
    tags: ['phi mua', 'phi moi gioi', 'phi giao dich'],
    resultUnit: '₫',
    variables: [quantity, buyPrice],
    explanation: {
      meaning: {
        vi: 'Số tiền công ty chứng khoán thu trên giá trị lệnh mua đã khớp.',
        en: 'The amount the brokerage collects on the value of a matched buy order.',
      },
      whenToUse: {
        vi: 'Khi muốn biết giá vốn thật của một lệnh mua, không chỉ là giá khớp lệnh.',
        en: 'When you want the true cost basis of a buy order, not just the matched price.',
      },
      howToRead: {
        vi: 'Kết quả là số tiền bị trừ thêm ngoài tiền mua: ví dụ trên màn, lệnh 92.000.000 ₫ mất 138.000 ₫, tức mỗi cổ phiếu đắt thêm 138 ₫ so với giá khớp. Cộng số này vào giá vốn trước khi tính lãi.',
        en: 'The result is the amount deducted on top of the purchase money: on the example above, a 92,000,000 ₫ order costs 138,000 ₫, meaning each share is 138 ₫ more expensive than the matched price. Add it to your cost basis before computing any profit.',
      },
      commonMistakes: {
        vi: 'Tưởng phí đã nằm trong giá khớp lệnh — phí được trừ riêng khỏi tiền trong tài khoản. Và vì phí tính trên giá trị giao dịch chứ không trên khoản lãi, mua rồi bán ngay vẫn mất phí.',
        en: 'Assuming the fee is already baked into the matched price — it is deducted separately from the account balance. And because the fee is charged on the transaction value rather than on any profit, even an immediate buy-and-sell still incurs it.',
      },
    },
    example: {
      title: {
        vi: 'FPT — mua 1.000 CP giá 62.900 ₫ phiên 24/07/2026',
        en: 'FPT — buying 1,000 shares at 62,900 ₫ at the 2026-07-24 close',
      },
      inputs: { quantity: 1_000, buyPrice: 62_900 },
      expected: 94_350,
      note: {
        vi: 'Mức 0,15% ở đây là bậc phí trực tuyến phổ biến chứ không phải mức luật định: cùng một lệnh, nơi thu 0,03% nơi thu 0,35%, chênh nhau cả chục lần. Đổi biểu phí ở màn Cài đặt rồi tính lại nếu tài khoản của bạn dùng mức khác.',
        en: 'The 0.15% here is a common online tier, not a statutory rate: the same order costs 0.03% at one broker and 0.35% at another, more than a tenfold spread. Switch the fee schedule in Settings and recompute if your own account uses a different rate.',
      },
      source: {
        vi: 'Biểu phí giao dịch trực tuyến SSI; giá FPT (mã FPT) phiên 24/07/2026.',
        en: 'SSI’s online trading fee schedule; FPT (ticker FPT) price at the 2026-07-24 close.',
      },
    },
    tests: [
      {
        name: 'ví dụ WF-08',
        inputs: { quantity: WF08.quantity, buyPrice: WF08.buyPrice },
        expected: 138_000,
      },
      {
        name: 'không mua gì thì không mất phí',
        inputs: { quantity: 0, buyPrice: 92_000 },
        expected: 0,
      },
    ],
    usesConstants: ['fee.brokerage.buy'],
    source: [SOURCE_FEE_CIRCULAR],
  },
  calc: (v, ctx) => {
    const rate = rateOf(ctx, 'fee.brokerage.buy');
    if (rate === null)
      return missingConstant('₫', { vi: 'phí môi giới lệnh mua', en: 'buy order brokerage fee' });
    return ok(v('quantity') * v('buyPrice') * rate, '₫');
  },
};

/*
 * ── 2. Phí giao dịch bán ───────────────────────────────────────────────────────────────
 */

export const PHI_GIAO_DICH_BAN: FormulaModule = {
  spec: {
    id: 'phi-giao-dich-ban',
    categoryId: 'fees-tax',
    name: { vi: 'Phí giao dịch bán', en: 'Sell-side brokerage fee' },
    description: {
      vi: 'Phí công ty chứng khoán thu khi lệnh bán khớp.',
      en: 'The fee the brokerage charges when a sell order is matched.',
    },
    latex: 'F_{ban} = Q \\times P_{ban} \\times r_{ban}',
    expression: {
      vi: 'Phí bán = Khối lượng × Giá bán × Tỷ lệ phí bán',
      en: 'Sell fee = Quantity × Sell price × Sell fee rate',
    },
    // Đường quét là đoạn thẳng qua gốc — lý do đầy đủ ở docblock đầu file.
    chartType: 'none',
    level: 'basic',
    tags: ['phi ban', 'phi moi gioi', 'phi giao dich'],
    resultUnit: '₫',
    variables: [quantity, sellPrice],
    explanation: {
      meaning: {
        vi: 'Số tiền công ty chứng khoán thu trên giá trị lệnh bán đã khớp.',
        en: 'The amount the brokerage collects on the value of a matched sell order.',
      },
      whenToUse: {
        vi: 'Khi ước tính chi phí của lệnh bán, hoặc khi so mức phí giữa các công ty chứng khoán — đây là khoản thương lượng được, khác thuế và phí lưu ký.',
        en: 'When estimating the cost of a sell order, or comparing fee rates across brokerages — this is a negotiable cost, unlike tax and custody fees.',
      },
      howToRead: {
        vi: 'Kết quả là số tiền bị trừ khỏi tiền bán: bán 1.000 CP giá 97.000 ₫ mất 145.500 ₫, tức 145,5 ₫ mỗi cổ phiếu. Đây mới là một chiều — cả vòng mua rồi bán còn cõng thêm thuế bán và phí lưu ký.',
        en: 'The result is the amount deducted from the sale proceeds: selling 1,000 shares at 97,000 ₫ costs 145,500 ₫, or 145.5 ₫ per share. That is only one leg — a full buy-sell round trip also carries the sell tax and the custody fee.',
      },
      commonMistakes: {
        vi: 'Chỉ trừ phí mua mà quên phí bán khi ước tính lãi.',
        en: 'Deducting only the buy fee and forgetting the sell fee when estimating profit.',
      },
    },
    example: {
      title: {
        vi: 'FPT — bán 1.000 CP giá 72.700 ₫ phiên 11/09/2026',
        en: 'FPT — selling 1,000 shares at 72,700 ₫ at the 2026-09-11 close',
      },
      inputs: { quantity: 1_000, sellPrice: 72_700 },
      expected: 109_050,
      note: {
        vi: 'Phí bán tính trên giá trị bán chứ không trên giá vốn, nên cùng một lượng cổ phiếu mà giá đã tăng thì phí bán cao hơn phí mua. Cộng cả hai chiều, riêng phí môi giới của vòng mua – bán này là 203.400 ₫.',
        en: 'The sell fee is charged on the sale value rather than the cost basis, so with the same share count a risen price means a bigger fee than on the buy leg. Across both legs, brokerage alone comes to 203,400 ₫ on this round trip.',
      },
      source: {
        vi: 'Biểu phí giao dịch trực tuyến SSI; giá FPT (mã FPT) phiên 11/09/2026.',
        en: 'SSI’s online trading fee schedule; FPT (ticker FPT) price at the 2026-09-11 close.',
      },
    },
    tests: [
      {
        name: 'ví dụ WF-08',
        inputs: { quantity: WF08.quantity, sellPrice: WF08.sellPrice },
        expected: 145_500,
      },
    ],
    usesConstants: ['fee.brokerage.sell'],
    source: [SOURCE_FEE_CIRCULAR],
  },
  calc: (v, ctx) => {
    const rate = rateOf(ctx, 'fee.brokerage.sell');
    if (rate === null)
      return missingConstant('₫', { vi: 'phí môi giới lệnh bán', en: 'sell order brokerage fee' });
    return ok(v('quantity') * v('sellPrice') * rate, '₫');
  },
};

/*
 * ── 3. Thuế chuyển nhượng chứng khoán ──────────────────────────────────────────────────
 */

export const THUE_CHUYEN_NHUONG: FormulaModule = {
  spec: {
    id: 'thue-chuyen-nhuong',
    categoryId: 'fees-tax',
    name: { vi: 'Thuế chuyển nhượng chứng khoán', en: 'Securities transfer tax' },
    description: {
      vi: 'Thuế thu nhập cá nhân tính trên giá trị bán, thu cả khi giao dịch lỗ.',
      en: 'Personal income tax charged on the sell value, collected even on a loss-making trade.',
    },
    latex: 'T = Q \\times P_{ban} \\times r_{thue}',
    expression: {
      vi: 'Thuế = Khối lượng × Giá bán × Thuế suất chuyển nhượng',
      en: 'Tax = Quantity × Sell price × Transfer tax rate',
    },
    // Đường quét là đoạn thẳng qua gốc — lý do đầy đủ ở docblock đầu file.
    chartType: 'none',
    level: 'basic',
    tags: ['thue', 'thue cnck', 'chuyen nhuong'],
    resultUnit: '₫',
    variables: [quantity, sellPrice],
    explanation: {
      meaning: {
        vi: 'Khoản thuế Nhà nước thu khi bán chứng khoán, tính trên giá trị bán.',
        en: 'The tax the State collects when securities are sold, charged on the sell value.',
      },
      whenToUse: {
        vi: 'Mỗi lần bán, để biết số tiền thực về tài khoản.',
        en: 'Every time you sell, to know the actual amount that lands in your account.',
      },
      howToRead: {
        vi: 'Kết quả là khoản trừ thẳng vào tiền bán: bán 1.000 CP giá 97.000 ₫ nộp 97.000 ₫, tức 97 ₫ mỗi cổ phiếu. Cộng nó vào giá hoà vốn, vì số này chỉ đổi theo giá bán và khối lượng.',
        en: 'The result is a direct deduction from the sale proceeds: selling 1,000 shares at 97,000 ₫ owes 97,000 ₫, or 97 ₫ per share. Add it into your break-even price, since the amount moves only with the sale price and the quantity.',
      },
      commonMistakes: {
        vi: 'Tưởng lỗ thì được miễn thuế. Cách tính hiện hành thu theo giá trị bán, không theo lãi.',
        en: 'Assuming a loss means the tax is waived. The current rule charges it on the sell value, not on profit.',
      },
    },
    example: {
      title: {
        vi: 'FPT — thuế trên lệnh bán 1.000 CP giá 72.700 ₫ phiên 11/09/2026',
        en: 'FPT — tax on a sale of 1,000 shares at 72,700 ₫, 2026-09-11 close',
      },
      inputs: { quantity: 1_000, sellPrice: 72_700 },
      expected: 72_700,
      note: {
        vi: 'Thuế thu trên giá trị bán chứ không trên khoản lãi: cùng lô này mà cắt lỗ ở 55.000 ₫ thì vẫn nộp 55.000 ₫ tiền thuế. Mức 0,1% được giữ nguyên khi Luật Thuế thu nhập cá nhân 109/2025/QH15 có hiệu lực, không phân biệt cổ phiếu niêm yết hay chưa niêm yết.',
        en: 'The tax falls on the sale value, not on the gain: cutting this same lot at a loss at 55,000 ₫ still owes 55,000 ₫ in tax. The 0.1% rate carried over unchanged when Personal Income Tax Law 109/2025/QH15 took effect, with no distinction between listed and unlisted shares.',
      },
      source: {
        vi: 'Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 13 khoản 2, hiệu lực 01/07/2026; giá FPT (mã FPT) phiên 11/09/2026.',
        en: 'Personal Income Tax Law 109/2025/QH15, Article 13 clause 2, in force 2026-07-01; FPT (ticker FPT) price at the 2026-09-11 close.',
      },
    },
    tests: [
      {
        name: 'ví dụ WF-08',
        inputs: { quantity: WF08.quantity, sellPrice: WF08.sellPrice },
        expected: 97_000,
      },
    ],
    usesConstants: ['tax.transfer.sell'],
    source: [SOURCE_PIT_LAW],
  },
  calc: (v, ctx) => {
    const rate = rateOf(ctx, 'tax.transfer.sell');
    if (rate === null)
      return missingConstant('₫', {
        vi: 'thuế chuyển nhượng chứng khoán',
        en: 'securities transfer tax',
      });
    return ok(v('quantity') * v('sellPrice') * rate, '₫');
  },
};

/*
 * ── 4. Thuế cổ tức tiền mặt ────────────────────────────────────────────────────────────
 */

export const THUE_CO_TUC: FormulaModule = {
  spec: {
    id: 'thue-co-tuc',
    categoryId: 'fees-tax',
    name: { vi: 'Thuế cổ tức tiền mặt', en: 'Cash dividend tax' },
    description: {
      vi: 'Thuế khấu trừ trên cổ tức tiền mặt trước khi tiền về tài khoản.',
      en: 'The tax withheld on a cash dividend before the money reaches the account.',
    },
    latex: 'T_{ct} = Q \\times D \\times r_{ct}',
    expression: {
      vi: 'Thuế cổ tức = Khối lượng × Cổ tức mỗi cổ phiếu × Thuế suất cổ tức',
      en: 'Dividend tax = Quantity × Dividend per share × Dividend tax rate',
    },
    // Đường quét là đoạn thẳng qua gốc — lý do đầy đủ ở docblock đầu file.
    chartType: 'none',
    level: 'basic',
    tags: ['thue co tuc', 'co tuc', 'dividend'],
    resultUnit: '₫',
    variables: [quantity, dividendPerShare],
    explanation: {
      meaning: {
        vi: 'Phần cổ tức bị khấu trừ thuế trước khi chuyển về tài khoản nhà đầu tư.',
        en: 'The portion of the dividend withheld as tax before it is transferred to the investor account.',
      },
      whenToUse: {
        vi: 'Khi ước tính dòng tiền cổ tức thực nhận trong năm.',
        en: 'When estimating the actual dividend cash flow received during the year.',
      },
      howToRead: {
        vi: 'Kết quả là phần cổ tức bị giữ lại: 1.000 CP × 2.000 ₫ là 2.000.000 ₫ công bố, nộp 100.000 ₫, còn 1.900.000 ₫ về tài khoản. Lấy số thực nhận này mới ra đúng tỷ suất cổ tức.',
        en: 'The result is the slice of the dividend held back: 1,000 shares × 2,000 ₫ is 2,000,000 ₫ announced, 100,000 ₫ withheld, 1,900,000 ₫ reaching the account. Use that net figure to get the dividend yield right.',
      },
      commonMistakes: {
        vi: 'Lấy nguyên mức cổ tức công bố để tính tỷ suất cổ tức thực nhận, thành ra cao hơn thực tế.',
        en: 'Using the announced dividend amount as-is to compute the actual dividend yield, which overstates it.',
      },
    },
    example: {
      title: {
        vi: 'FPT — 1.000 CP, cổ tức tiền mặt 1.000 ₫/CP chốt quyền 02/12/2025',
        en: 'FPT — 1,000 shares, a 1,000 ₫/share cash dividend with a 2025-12-02 record date',
      },
      inputs: { quantity: 1_000, dividendPerShare: 1_000 },
      expected: 50_000,
      note: {
        vi: 'Công ty chứng khoán khấu trừ ngay tại nguồn, nhà đầu tư nhận về 950.000 ₫ mà không phải tự kê khai. Đáng lưu ý khi so với gửi tiết kiệm: lãi tiền gửi được miễn thuế thu nhập cá nhân, còn cổ tức tiền mặt chịu 5%.',
        en: 'The brokerage withholds it at source, so 950,000 ₫ reaches the investor with nothing to file. Worth noting against a savings deposit: interest income is exempt from personal income tax, while a cash dividend bears 5%.',
      },
      source: {
        vi: 'Cổ tức tiền mặt CTCP FPT (mã FPT) đợt chốt quyền 02/12/2025; thuế suất theo Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 12.',
        en: 'FPT Corp’s (ticker FPT) cash dividend with a 2025-12-02 record date; rate per Personal Income Tax Law 109/2025/QH15, Article 12.',
      },
    },
    note: {
      vi: 'Áp dụng cho cổ tức tiền mặt của cổ phiếu. Lợi tức chia từ quỹ đầu tư chứng khoán hoặc quỹ bất động sản có mức riêng, không tính bằng công thức này.',
      en: 'This covers cash dividends on stocks. Distributions from securities investment funds or real estate funds are taxed at their own rate and are not computed by this formula.',
    },
    tests: [
      {
        name: 'cổ tức 2.000 ₫/CP trên 1.000 CP',
        inputs: { quantity: 1_000, dividendPerShare: 2_000 },
        expected: 100_000,
      },
      {
        name: 'không chia cổ tức thì không có thuế',
        inputs: { quantity: 1_000, dividendPerShare: 0 },
        expected: 0,
      },
    ],
    usesConstants: ['tax.dividend.cash'],
    source: [SOURCE_PIT_LAW],
  },
  calc: (v, ctx) => {
    const rate = rateOf(ctx, 'tax.dividend.cash');
    if (rate === null)
      return missingConstant('₫', { vi: 'thuế cổ tức tiền mặt', en: 'cash dividend tax' });
    return ok(v('quantity') * v('dividendPerShare') * rate, '₫');
  },
};

/*
 * ── 5. Phí lưu ký ──────────────────────────────────────────────────────────────────────
 */

export const PHI_LUU_KY: FormulaModule = {
  spec: {
    id: 'phi-luu-ky',
    categoryId: 'fees-tax',
    name: { vi: 'Phí lưu ký', en: 'Custody fee' },
    description: {
      vi: 'Phí giữ hộ cổ phiếu, tính theo số cổ phiếu và số tháng nắm giữ.',
      en: 'The fee for holding shares in custody, charged by share count and months held.',
    },
    latex: 'F_{lk} = Q \\times M \\times c',
    expression: {
      vi: 'Phí lưu ký = Khối lượng × Số tháng nắm giữ × Mức phí mỗi cổ phiếu mỗi tháng',
      en: 'Custody fee = Quantity × Holding period × Rate per share per month',
    },
    // Đường quét là đoạn thẳng qua gốc — lý do đầy đủ ở docblock đầu file.
    chartType: 'none',
    level: 'basic',
    tags: ['phi luu ky', 'vsd', 'custody'],
    resultUnit: '₫',
    variables: [quantity, months],
    explanation: {
      meaning: {
        vi: 'Khoản phí nhỏ thu hằng tháng cho việc lưu giữ cổ phiếu trên tài khoản.',
        en: 'A small fee charged monthly for holding shares in the account.',
      },
      whenToUse: {
        vi: 'Khi tính chi phí của một khoản đầu tư nắm giữ dài.',
        en: 'When computing the cost of a long-held investment.',
      },
      howToRead: {
        vi: 'Kết quả là tổng phí cho cả kỳ nắm giữ chứ không phải mỗi tháng: 1.000 CP giữ 5 tháng hết 1.350 ₫, tức 1,35 ₫ mỗi cổ phiếu. Chia cho khối lượng rồi cộng vào giá mua để thấy khoản này đẩy giá hoà vốn lên bao nhiêu.',
        en: 'The result is the total for the whole holding period, not a monthly amount: 1,000 shares held for 5 months costs 1,350 ₫, or 1.35 ₫ per share. Divide it by the quantity and add it to the buy price to see how far it pushes the break-even price up.',
      },
      commonMistakes: {
        vi: 'Bỏ hẳn phí lưu ký khỏi giá hoà vốn vì thấy nó nhỏ. Khoản này đã bị trừ khỏi tài khoản trước khi bạn bán, nên không cộng vào thì giá hoà vốn tính ra thấp hơn thực tế.',
        en: 'Dropping the custody fee out of the break-even price because it looks small. It has already left the account before you sell, so leaving it out makes the break-even price come out lower than it really is.',
      },
    },
    example: {
      title: {
        vi: 'FPT — 1.000 CP nằm trong tài khoản 2 tháng, 24/07 đến 11/09/2026',
        en: 'FPT — 1,000 shares sitting in the account for 2 months, 2026-07-24 to 2026-09-11',
      },
      inputs: { quantity: 1_000, months: 2 },
      expected: 540,
      note: {
        vi: 'Phí tính theo số cổ phiếu chứ không theo giá trị: cùng 2,5 tỷ ₫, tài khoản nắm cổ phiếu giá 5.000 ₫ trả 135.000 ₫ mỗi tháng, còn nắm FPT chỉ khoảng 9.300 ₫. Khoản này nhỏ nhưng đã rời tài khoản trước khi bán nên vẫn phải cộng vào giá hoà vốn.',
        en: 'The fee follows the share count, not the value: on the same 2.5 billion ₫, an account holding 5,000 ₫ shares pays 135,000 ₫ a month while one holding FPT pays about 9,300 ₫. Small as it is, it has already left the account before you sell, so it still belongs in the break-even price.',
      },
      source: {
        vi: 'Quyết định 1541/QĐ-BTC về giá dịch vụ lưu ký, hiệu lực 07/05/2025; thời gian nắm giữ 24/07 đến 11/09/2026.',
        en: 'Decision 1541/QĐ-BTC on custody service pricing, in force 2025-05-07; holding period 2026-07-24 to 2026-09-11.',
      },
    },
    tests: [
      {
        name: 'ví dụ WF-08',
        inputs: { quantity: WF08.quantity, months: WF08.months },
        expected: 1_350,
      },
      {
        name: 'bán ngay trong tháng đầu vẫn tính một tháng',
        inputs: { quantity: 1_000, months: 1 },
        expected: 270,
      },
    ],
    usesConstants: ['fee.custody'],
    source: [SOURCE_VSD],
  },
  calc: (v, ctx) => {
    const constant = constantOf(ctx, 'fee.custody');
    if (constant === undefined)
      return missingConstant('₫', { vi: 'phí lưu ký', en: 'custody fee' });
    return ok(v('quantity') * v('months') * constant.value, '₫');
  },
};

/*
 * ── 6. Giá hoà vốn thực ────────────────────────────────────────────────────────────────
 */

export const GIA_HOA_VON: FormulaModule = {
  spec: {
    id: 'gia-hoa-von',
    categoryId: 'fees-tax',
    name: { vi: 'Giá hoà vốn thực', en: 'True break-even price' },
    description: {
      vi: 'Giá bán tối thiểu để không lỗ sau khi trừ hết phí và thuế.',
      en: 'The minimum sell price to avoid a loss after all fees and taxes.',
    },
    latex: 'P_{hv} = \\frac{Q \\cdot P_{mua} + F_{mua} + F_{lk}}{Q\\,(1 - r_{ban} - r_{thue})}',
    expression: {
      vi: 'Giá hoà vốn = (Tiền mua + Phí mua + Phí lưu ký) ÷ [Khối lượng × (1 − Tỷ lệ phí bán − Thuế suất bán)]',
      en: 'Break-even price = (Buy value + Buy fee + Custody fee) ÷ [Quantity × (1 − Sell fee rate − Sell tax rate)]',
    },
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['gia hoa von', 'hoa von', 'break even'],
    resultUnit: '₫',
    variables: [quantity, months, buyPrice],
    explanation: {
      meaning: {
        vi: 'Mức giá bán mà tại đó tiền thu về vừa đúng bằng tiền đã bỏ ra, không lãi không lỗ.',
        en: 'The sell price at which the proceeds exactly equal the money put in — no profit, no loss.',
      },
      whenToUse: {
        vi: 'Trước khi đặt lệnh bán, để biết bán dưới mức nào là thực sự lỗ.',
        en: 'Before placing a sell order, to know below which price you are actually at a loss.',
      },
      howToRead: {
        vi: 'Luôn cao hơn giá mua, vì phải gánh cả phí mua, phí bán, thuế bán và phí lưu ký.',
        en: 'Always higher than the buy price, since it must cover the buy fee, sell fee, sell tax, and custody fee.',
      },
      commonMistakes: {
        vi: 'Lấy đúng giá mua làm mốc hoà vốn. Bán bằng giá mua là đã lỗ đúng bằng tổng chi phí.',
        en: 'Treating the buy price itself as the break-even mark. Selling at the buy price is already a loss equal to the total costs.',
      },
    },
    example: {
      title: {
        vi: 'FPT — mua 1.000 CP giá 62.900 ₫ ngày 24/07/2026, giữ 2 tháng',
        en: 'FPT — buy 1,000 shares at 62,900 ₫ on 2026-07-24 and hold for 2 months',
      },
      inputs: { quantity: 1_000, months: 2, buyPrice: 62_900 },
      expected: 63_153,
      note: {
        vi: 'Ngay khi lệnh mua khớp, khoản đầu tư đã âm 0,40%: giá hoà vốn cao hơn giá mua 253 ₫, đúng bằng tổng ma sát của 0,15% phí mua, 0,15% phí bán, 0,1% thuế bán và phí lưu ký. Quay vòng 12 lần một năm thì riêng ma sát đó ngốn khoảng 4,8% vốn.',
        en: 'The moment the buy order matches, the position is already 0.40% under water: the break-even price sits 253 ₫ above the buy price, exactly the friction of a 0.15% buy fee, a 0.15% sell fee, a 0.1% sell tax and the custody fee. Turn the capital over 12 times a year and that friction alone eats about 4.8% of it.',
      },
      source: {
        vi: 'Biểu phí giao dịch trực tuyến SSI; giá mua FPT (mã FPT) phiên 24/07/2026.',
        en: 'SSI’s online trading fee schedule; FPT (ticker FPT) buy price at the 2026-07-24 close.',
      },
    },
    tests: [
      {
        name: 'ví dụ WF-08',
        inputs: { quantity: WF08.quantity, months: WF08.months, buyPrice: WF08.buyPrice },
        expected: 92_370.28,
      },
      {
        name: 'không có cổ phiếu nào thì không có giá hoà vốn',
        inputs: { quantity: 0, months: 5, buyPrice: 92_000 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    usesConstants: ['fee.brokerage.buy', 'fee.brokerage.sell', 'tax.transfer.sell', 'fee.custody'],
    source: [SOURCE_FEE_CIRCULAR, SOURCE_PIT_LAW],
  },
  calc: (v, ctx) => breakEvenPrice(v, ctx),
};

function breakEvenPrice(v: CalcValues, ctx: CalcContext): CalcOutput {
  const q = v('quantity');
  if (q === 0) {
    return {
      value: null,
      unit: '₫',
      warning: divideByZero(
        { vi: 'giá hoà vốn', en: 'break-even price' },
        { vi: 'Khối lượng', en: 'Quantity' },
        { vi: 'Nhập số cổ phiếu lớn hơn 0.', en: 'Enter a share quantity greater than 0.' },
      ),
    };
  }

  const rBuy = rateOf(ctx, 'fee.brokerage.buy');
  const rSell = rateOf(ctx, 'fee.brokerage.sell');
  const rTax = rateOf(ctx, 'tax.transfer.sell');
  const custody = constantOf(ctx, 'fee.custody');
  if (rBuy === null || rSell === null || rTax === null || custody === undefined) {
    return missingConstant('₫', { vi: 'phí và thuế giao dịch', en: 'transaction fees and taxes' });
  }

  const netRatio = 1 - rSell - rTax;
  if (netRatio <= 0) {
    return {
      value: null,
      unit: '₫',
      warning: meaningless(
        {
          vi: 'Tổng phí bán và thuế bán từ 100% trở lên nên không có giá bán nào hoà vốn được.',
          en: 'The combined sell fee and sell tax total 100% or more, so no sell price can break even.',
        },
        {
          vi: 'Kiểm tra lại biểu phí đang chọn.',
          en: 'Check the fee schedule currently selected.',
        },
      ),
    };
  }

  const costBasis = q * v('buyPrice') * (1 + rBuy) + q * v('months') * custody.value;
  return ok(costBasis / (q * netRatio), '₫');
}

/*
 * ── 7. Lợi nhuận ròng sau phí & thuế ───────────────────────────────────────────────────
 * Đây là công thức mà màn WF-08 dựng quanh nó.
 */

export const LOI_NHUAN_RONG: FormulaModule = {
  spec: {
    id: 'loi-nhuan-rong',
    categoryId: 'fees-tax',
    name: { vi: 'Lợi nhuận ròng sau phí & thuế', en: 'Net profit after fees and taxes' },
    description: {
      vi: 'Số tiền lãi thực sự còn lại sau khi trừ hết phí giao dịch và thuế.',
      en: 'The actual profit left over after deducting all transaction fees and taxes.',
    },
    latex: 'L_{rong} = Q\\,(P_{ban} - P_{mua}) - (F_{mua} + F_{ban} + T + F_{lk})',
    expression: {
      vi: 'Lợi nhuận ròng = Khối lượng × (Giá bán − Giá mua) − Tổng chi phí',
      en: 'Net profit = Quantity × (Sell price − Buy price) − Total costs',
    },
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['loi nhuan rong', 'lai rong', 'phi va thue'],
    resultUnit: '₫',
    variables: [quantity, months, buyPrice, sellPrice],
    explanation: {
      meaning: {
        vi: 'Phần tiền thật sự vào túi sau một vòng mua – bán, đã trừ mọi khoản phải nộp.',
        en: 'The money that actually ends up in your pocket after a buy-sell round trip, net of everything owed.',
      },
      whenToUse: {
        vi: 'Khi đánh giá một giao dịch đã thực hiện, hoặc thử một kịch bản giá bán.',
        en: 'When evaluating a completed trade, or testing a hypothetical sell-price scenario.',
      },
      howToRead: {
        vi: 'Luôn nhỏ hơn lãi gộp trên bảng giá. Khoảng cách giữa hai con số chính là tổng chi phí.',
        en: 'Always smaller than the gross profit shown on the price board. The gap between the two figures is the total cost.',
      },
      commonMistakes: {
        vi: 'Lấy chênh lệch giá nhân khối lượng rồi coi đó là lãi. Với biên lãi mỏng, chi phí có thể nuốt hết.',
        en: 'Taking the price difference times the quantity as the profit. With a thin margin, costs can eat it all.',
      },
    },
    example: {
      title: {
        vi: 'FPT — mua 1.000 CP giá 62.900 ₫ ngày 24/07/2026, bán 72.700 ₫ ngày 11/09/2026',
        en: 'FPT — buy 1,000 shares at 62,900 ₫ on 2026-07-24, sell at 72,700 ₫ on 2026-09-11',
      },
      inputs: { quantity: 1_000, months: 2, buyPrice: 62_900, sellPrice: 72_700 },
      expected: 9_523_360,
      note: {
        vi: 'Lãi gộp 9.800.000 ₫ nhưng tổng phí và thuế 276.640 ₫ lấy đi 2,8% khoản lãi. Tỷ lệ đó nghe nhỏ vì thương vụ lãi đậm: nếu giá chỉ nhích 1% thì chính khoản chi phí ấy ngốn hơn 40% lợi nhuận, còn giá đi ngang thì lỗ đúng bằng chi phí.',
        en: 'Gross profit is 9,800,000 ₫, but 276,640 ₫ of fees and tax take 2.8% of it. That share looks small only because the trade ran well: had the price risen just 1%, the same costs would eat over 40% of the profit, and a flat price leaves a loss exactly the size of the costs.',
      },
      source: {
        vi: 'Biểu phí giao dịch trực tuyến SSI; giá FPT (mã FPT) phiên 24/07/2026 và 11/09/2026.',
        en: 'SSI’s online trading fee schedule; FPT (ticker FPT) prices at the 2026-07-24 and 2026-09-11 closes.',
      },
    },
    tests: [
      { name: 'ví dụ WF-08', inputs: { ...WF08 }, expected: 4_618_150 },
      {
        // 138.000 phí mua + 138.000 phí bán + 92.000 thuế + 1.350 lưu ký = 369.350.
        name: 'bán đúng giá mua thì lỗ đúng bằng tổng chi phí',
        inputs: { quantity: 1_000, months: 5, buyPrice: 92_000, sellPrice: 92_000 },
        expected: -369_350,
      },
    ],
    // Bốn khoá `totalCostOf()` tra tới. Khai thiếu thì khối hằng số trên màn chi tiết không in
    // mức nào, dù con số kết quả tính theo đúng bốn mức ấy — `roi-rong` ngay dưới khai đủ từ đầu.
    usesConstants: ['fee.brokerage.buy', 'fee.brokerage.sell', 'tax.transfer.sell', 'fee.custody'],
    source: [SOURCE_FEE_CIRCULAR, SOURCE_PIT_LAW, SOURCE_VSD],
  },
  calc: (v, ctx) => {
    const costs = totalCostOf(v, ctx);
    if (costs === null)
      return missingConstant('₫', {
        vi: 'phí và thuế giao dịch',
        en: 'transaction fees and taxes',
      });

    const gross = v('quantity') * (v('sellPrice') - v('buyPrice'));
    return ok(gross - costs.total, '₫', {
      extras: {
        grossProfit: gross,
        totalCost: costs.total,
        costBasis: costs.costBasis,
      },
    });
  },
};

/*
 * ── 8. ROI ròng ────────────────────────────────────────────────────────────────────────
 */

export const ROI_RONG: FormulaModule = {
  spec: {
    id: 'roi-rong',
    categoryId: 'fees-tax',
    name: { vi: 'ROI ròng sau phí & thuế', en: 'Net ROI after fees and taxes' },
    description: {
      vi: 'Tỷ suất lợi nhuận thực trên số vốn đã thực sự bỏ ra.',
      en: 'The actual return rate on the capital actually put in.',
    },
    latex: 'ROI_{rong} = \\frac{L_{rong}}{Q \\cdot P_{mua} + F_{mua} + F_{lk}} \\times 100',
    expression: {
      vi: 'ROI ròng = Lợi nhuận ròng ÷ Vốn thực bỏ ra × 100',
      en: 'Net ROI = Net profit ÷ Actual capital deployed × 100',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['roi rong', 'ty suat loi nhuan', 'hieu qua'],
    resultUnit: '%',
    variables: [quantity, months, buyPrice, sellPrice],
    explanation: {
      meaning: {
        vi: 'Sau khi trừ hết phí và thuế, mỗi trăm đồng vốn thật sự bỏ ra mang về bao nhiêu đồng lãi.',
        en: 'After every fee and tax, how many đồng of profit each hundred đồng of capital actually deployed brings back.',
      },
      whenToUse: {
        vi: 'Khi so sánh hiệu quả giữa các giao dịch có quy mô vốn khác nhau.',
        en: 'When comparing the efficiency of trades with different capital sizes.',
      },
      howToRead: {
        vi: 'Luôn thấp hơn tỷ suất tính trên giá thuần, tức (Giá bán − Giá mua) ÷ Giá mua. Giữ càng lâu khoảng cách càng rộng, vì phí lưu ký cộng dồn thêm mỗi tháng.',
        en: 'Always lower than the rate computed on the raw prices alone — (Sell price − Buy price) ÷ Buy price. The longer you hold, the wider the gap, because the custody fee keeps adding up month after month.',
      },
      commonMistakes: {
        vi: 'Chia lãi ròng cho giá trị mua thuần thay vì cho tổng vốn bỏ ra, làm tỷ suất đẹp hơn thực tế.',
        en: 'Dividing net profit by the raw buy value instead of the total capital deployed, which flatters the rate beyond reality.',
      },
    },
    example: {
      title: {
        vi: 'FPT — vòng mua 62.900 ₫ ngày 24/07/2026, bán 72.700 ₫ ngày 11/09/2026',
        en: 'FPT — a round trip bought at 62,900 ₫ on 2026-07-24 and sold at 72,700 ₫ on 2026-09-11',
      },
      inputs: { quantity: 1_000, months: 2, buyPrice: 62_900, sellPrice: 72_700 },
      expected: 15.1177,
      note: {
        vi: 'Tỷ suất tính trên giá thuần là 15,58%; phần chênh 0,46 điểm phần trăm chính là phí và thuế. Mẫu số ở đây là vốn thực bỏ ra, đã gồm phí mua và phí lưu ký, nên kết quả thấp hơn cách chia cho riêng tiền mua.',
        en: 'The rate on the raw prices alone is 15.58%; the 0.46 percentage-point gap is exactly the fees and tax. The denominator here is the capital actually deployed, buy fee and custody fee included, so the result lands below one divided by the purchase money alone.',
      },
      source: {
        vi: 'Biểu phí giao dịch trực tuyến SSI; giá FPT (mã FPT) phiên 24/07/2026 và 11/09/2026.',
        en: 'SSI’s online trading fee schedule; FPT (ticker FPT) prices at the 2026-07-24 and 2026-09-11 closes.',
      },
    },
    tests: [
      { name: 'ví dụ WF-08', inputs: { ...WF08 }, expected: 5.01, tolerance: 0.01 },
      {
        name: 'chưa bỏ vốn nào thì không có tỷ suất',
        inputs: { quantity: 0, months: 5, buyPrice: 92_000, sellPrice: 97_000 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    usesConstants: ['fee.brokerage.buy', 'fee.brokerage.sell', 'tax.transfer.sell', 'fee.custody'],
    source: [SOURCE_FEE_CIRCULAR],
  },
  calc: (v, ctx) => {
    const costs = totalCostOf(v, ctx);
    if (costs === null)
      return missingConstant('%', {
        vi: 'phí và thuế giao dịch',
        en: 'transaction fees and taxes',
      });

    if (costs.costBasis === 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'ROI ròng', en: 'Net ROI' },
          { vi: 'Vốn bỏ ra', en: 'Capital deployed' },
          {
            vi: 'Nhập khối lượng và giá mua lớn hơn 0.',
            en: 'Enter a quantity and buy price greater than 0.',
          },
        ),
      };
    }

    const gross = v('quantity') * (v('sellPrice') - v('buyPrice'));
    const net = gross - costs.total;
    return ok((net / costs.costBasis) * 100, '%', {
      extras: { netProfit: net, costBasis: costs.costBasis },
    });
  },
};

/*
 * ── Bảng bóc tách chi phí — khối chính của WF-08 ───────────────────────────────────────
 */

export interface FeeBreakdownRow {
  key: string;
  /** Nhãn hiện ở cột trái, ví dụ 'Phí giao dịch mua'. */
  label: Bilingual;
  /** Công thức hiện ngay dưới nhãn, ví dụ '0,15% × 92.000.000 ₫' — WF-08 đòi hiện trong dòng. */
  formula: Bilingual;
  /** Số tiền. Là CalcOutput chứ không phải number, để một dòng lỗi không kéo sập cả bảng. */
  output: CalcOutput;
}

export interface FeeBreakdown {
  rows: ReadonlyArray<FeeBreakdownRow>;
  totalCost: CalcOutput;
  grossProfit: CalcOutput;
  netProfit: CalcOutput;
  netRoi: CalcOutput;
  breakEven: CalcOutput;
}

/**
 * Dựng trọn khối kết quả của WF-08 từ một bộ bốn ô nhập.
 *
 * Gom ở tầng Domain chứ không ở component: chuỗi công thức trong dòng phải khớp đúng con số
 * bên cạnh nó, mà việc đó test bằng Node dễ hơn nhiều so với soi DOM.
 */
export function buildFeeBreakdown(
  inputs: Readonly<Record<string, number>>,
  ctx: CalcContext,
): FeeBreakdown {
  const v: CalcValues = (key) => inputs[key] ?? Number.NaN;

  const rBuy = rateOf(ctx, 'fee.brokerage.buy');
  const rSell = rateOf(ctx, 'fee.brokerage.sell');
  const rTax = rateOf(ctx, 'tax.transfer.sell');
  const custody = constantOf(ctx, 'fee.custody');

  const buyValue = v('quantity') * v('buyPrice');
  const sellValue = v('quantity') * v('sellPrice');

  // Đi qua runFormula chứ không gọi thẳng `calc`: nhờ vậy ô để trống ra đúng cảnh báo
  // "Chưa nhập đủ" của WF-15, và chỉ dòng nào thiếu mới hỏng — đúng câu wireframe ghi
  // "Nhập giá bán để xem lợi nhuận ròng. Các ô còn lại đã đủ."
  const custodyFormula: Bilingual =
    custody === undefined
      ? { vi: '—', en: '—' }
      : {
          vi: `${formatNumber(custody.value, { maxDecimals: 2 })} ₫/CP/tháng × ${formatNumber(v('quantity'))} × ${formatNumber(v('months'))}`,
          en: `${formatNumber(custody.value, { maxDecimals: 2 })} ₫/share/month × ${formatNumber(v('quantity'))} × ${formatNumber(v('months'))}`,
        };

  const rows: FeeBreakdownRow[] = [
    {
      key: 'fee.brokerage.buy',
      label: { vi: 'Phí giao dịch mua', en: 'Buy transaction fee' },
      formula: percentTimes(rBuy, buyValue),
      output: runFormula(PHI_GIAO_DICH_MUA, inputs, ctx),
    },
    {
      key: 'fee.brokerage.sell',
      label: { vi: 'Phí giao dịch bán', en: 'Sell transaction fee' },
      formula: percentTimes(rSell, sellValue),
      output: runFormula(PHI_GIAO_DICH_BAN, inputs, ctx),
    },
    {
      key: 'tax.transfer.sell',
      label: { vi: 'Thuế CNCK (khi bán)', en: 'Securities transfer tax (on sell)' },
      formula: percentTimes(rTax, sellValue),
      output: runFormula(THUE_CHUYEN_NHUONG, inputs, ctx),
    },
    {
      key: 'fee.custody',
      label: { vi: 'Phí lưu ký', en: 'Custody fee' },
      formula: custodyFormula,
      output: runFormula(PHI_LUU_KY, inputs, ctx),
    },
  ];

  // Tổng chi phí cộng từ chính bốn dòng trên, không tính lại bằng đường khác — nếu một dòng
  // chưa tính được thì tổng cũng phải chịu, chứ không được âm thầm bỏ qua dòng đó.
  const totalCost = sumRows(rows);
  const gross = v('quantity') * (v('sellPrice') - v('buyPrice'));

  return {
    rows,
    totalCost,
    grossProfit: ok(gross, '₫'),
    netProfit: runFormula(LOI_NHUAN_RONG, inputs, ctx),
    netRoi: runFormula(ROI_RONG, inputs, ctx),
    breakEven: runFormula(GIA_HOA_VON, inputs, ctx),
  };
}

/** Cộng bốn dòng bóc tách. Một dòng lỗi thì tổng kế thừa đúng cảnh báo của dòng đó (FR-15). */
function sumRows(rows: ReadonlyArray<FeeBreakdownRow>): CalcOutput {
  let total = 0;
  for (const row of rows) {
    if (row.output.value === null) {
      return { value: null, unit: '₫', warning: row.output.warning };
    }
    total += row.output.value;
  }
  return ok(total, '₫');
}

/** '0,15% × 92.000.000 ₫'. Không tra được mức thì trả dấu gạch, không trả '0% × …'. */
function percentTimes(rate: number | null, base: number): Bilingual {
  if (rate === null || !Number.isFinite(base)) return { vi: '—', en: '—' };
  // minDecimals 2 để thuế 0,1% hiện thành '0,10%' đúng như wireframe, không thành '0,1%'.
  const text = `${formatNumber(rate * 100, { minDecimals: 2, maxDecimals: 3 })}% × ${formatNumber(base)} ₫`;
  return { vi: text, en: text };
}

/**
 * Tổng chi phí một vòng mua – bán, và vốn thực bỏ ra.
 * Trả null khi biểu phí thiếu khoản mục — nơi gọi đổi thành cảnh báo, không coi là 0.
 */
function totalCostOf(v: CalcValues, ctx: CalcContext): { total: number; costBasis: number } | null {
  const rBuy = rateOf(ctx, 'fee.brokerage.buy');
  const rSell = rateOf(ctx, 'fee.brokerage.sell');
  const rTax = rateOf(ctx, 'tax.transfer.sell');
  const custody = constantOf(ctx, 'fee.custody');
  if (rBuy === null || rSell === null || rTax === null || custody === undefined) return null;

  const q = v('quantity');
  const feeBuy = q * v('buyPrice') * rBuy;
  const feeSell = q * v('sellPrice') * rSell;
  const tax = q * v('sellPrice') * rTax;
  const feeCustody = q * v('months') * custody.value;

  return {
    total: feeBuy + feeSell + tax + feeCustody,
    // Vốn thực bỏ ra: tiền mua cộng những khoản đã chi trước khi bán.
    costBasis: q * v('buyPrice') + feeBuy + feeCustody,
  };
}

/** Tám công thức của nhóm, đúng thứ tự hiện trong bảng bóc tách WF-08. */
export const FEE_FORMULAS: ReadonlyArray<FormulaModule> = [
  PHI_GIAO_DICH_MUA,
  PHI_GIAO_DICH_BAN,
  THUE_CHUYEN_NHUONG,
  THUE_CO_TUC,
  PHI_LUU_KY,
  GIA_HOA_VON,
  LOI_NHUAN_RONG,
  ROI_RONG,
];
