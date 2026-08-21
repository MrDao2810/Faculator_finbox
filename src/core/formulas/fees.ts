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
        vi: 'Phí tính trên giá trị giao dịch chứ không trên khoản lãi, nên mua rồi bán ngay vẫn mất phí.',
        en: 'The fee is charged on the transaction value, not on any profit, so even an immediate buy-and-sell still incurs it.',
      },
      commonMistakes: {
        vi: 'Tưởng phí đã nằm trong giá khớp lệnh. Phí được trừ riêng khỏi tiền trong tài khoản.',
        en: 'Assuming the fee is already baked into the matched price. It is deducted separately from the account balance.',
      },
    },
    example: {
      title: {
        vi: 'Mua 1.000 CP giá 92.000 ₫, biểu phí HOSE 2026',
        en: 'Buy 1,000 shares at 92,000 ₫, HOSE 2026 fee schedule',
      },
      inputs: { quantity: WF08.quantity, buyPrice: WF08.buyPrice },
      expected: 138_000,
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
        vi: 'Một vòng mua – bán chịu phí hai lần, nên chi phí gấp đôi mức của một lệnh.',
        en: 'One buy-sell round trip pays the fee twice, so the cost is double a single order.',
      },
      commonMistakes: {
        vi: 'Chỉ trừ phí mua mà quên phí bán khi ước tính lãi.',
        en: 'Deducting only the buy fee and forgetting the sell fee when estimating profit.',
      },
    },
    example: {
      title: {
        vi: 'Bán 1.000 CP giá 97.000 ₫, biểu phí HOSE 2026',
        en: 'Sell 1,000 shares at 97,000 ₫, HOSE 2026 fee schedule',
      },
      inputs: { quantity: WF08.quantity, sellPrice: WF08.sellPrice },
      expected: 145_500,
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
        vi: 'Thuế tính trên giá trị bán chứ không trên phần lãi — bán lỗ vẫn phải nộp khoản này.',
        en: 'The tax is charged on the sell value, not on any profit — even a loss-making sale still owes it.',
      },
      commonMistakes: {
        vi: 'Tưởng lỗ thì được miễn thuế. Cách tính hiện hành thu theo giá trị bán, không theo lãi.',
        en: 'Assuming a loss means the tax is waived. The current rule charges it on the sell value, not on profit.',
      },
    },
    example: {
      title: { vi: 'Bán 1.000 CP giá 97.000 ₫', en: 'Sell 1,000 shares at 97,000 ₫' },
      inputs: { quantity: WF08.quantity, sellPrice: WF08.sellPrice },
      expected: 97_000,
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
        vi: 'Công ty chứng khoán khấu trừ sẵn, nên số tiền về tài khoản đã là số sau thuế.',
        en: 'The brokerage withholds it automatically, so the amount that lands in the account is already net of tax.',
      },
      commonMistakes: {
        vi: 'Lấy nguyên mức cổ tức công bố để tính tỷ suất cổ tức thực nhận, thành ra cao hơn thực tế.',
        en: 'Using the announced dividend amount as-is to compute the actual dividend yield, which overstates it.',
      },
    },
    example: {
      title: { vi: '1.000 CP, cổ tức 2.000 ₫/CP', en: '1,000 shares, dividend 2,000 ₫/share' },
      inputs: { quantity: 1_000, dividendPerShare: 2_000 },
      expected: 100_000,
    },
    note: {
      vi: 'Công thức tính cho cổ tức tiền mặt của cổ phiếu. Lợi tức được chia từ quỹ đầu tư chứng khoán hoặc quỹ bất động sản được giảm 50% thuế theo luật thuế mới — trường hợp đó nằm ngoài phạm vi ở đây.',
      en: 'This formula covers cash dividends from stocks. Income distributed from securities investment funds or real estate funds gets a 50% tax reduction under the new tax law — that case is out of scope here.',
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
        vi: 'Rất nhỏ với lệnh ngắn hạn, nhưng cộng dồn đáng kể khi giữ nhiều cổ phiếu trong nhiều năm.',
        en: 'Negligible for a short-term trade, but it adds up meaningfully when holding a large position for years.',
      },
      commonMistakes: {
        vi: 'Bỏ qua hoàn toàn khi tính giá hoà vốn của khoản nắm giữ dài hạn.',
        en: 'Ignoring it entirely when computing the break-even price of a long-held position.',
      },
    },
    example: {
      title: { vi: '1.000 CP giữ 5 tháng', en: '1,000 shares held for 5 months' },
      inputs: { quantity: WF08.quantity, months: WF08.months },
      expected: 1_350,
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
        vi: 'Mua 1.000 CP giá 92.000 ₫, giữ 5 tháng',
        en: 'Buy 1,000 shares at 92,000 ₫, held for 5 months',
      },
      inputs: { quantity: WF08.quantity, months: WF08.months, buyPrice: WF08.buyPrice },
      expected: 92_370.28,
      note: {
        vi: 'Bán đúng 92.000 ₫ là lỗ, dù không giảm giá đồng nào.',
        en: 'Selling at exactly 92,000 ₫ is a loss, even though the price did not drop at all.',
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
        vi: 'Mua 1.000 CP giá 92.000 ₫, bán 97.000 ₫ sau 5 tháng',
        en: 'Buy 1,000 shares at 92,000 ₫, sell at 97,000 ₫ after 5 months',
      },
      inputs: { ...WF08 },
      expected: 4_618_150,
      note: {
        vi: 'Lãi gộp 5.000.000 ₫, tổng chi phí 381.850 ₫.',
        en: 'Gross profit 5,000,000 ₫, total costs 381,850 ₫.',
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
        vi: 'Lãi ròng chia cho vốn thực bỏ ra, gồm cả phí mua và phí lưu ký.',
        en: 'Net profit divided by the actual capital deployed, including the buy fee and custody fee.',
      },
      whenToUse: {
        vi: 'Khi so sánh hiệu quả giữa các giao dịch có quy mô vốn khác nhau.',
        en: 'When comparing the efficiency of trades with different capital sizes.',
      },
      howToRead: {
        vi: 'Luôn thấp hơn tỷ suất tính theo giá thuần. Chênh lệch càng rõ khi giao dịch ngắn và dày.',
        en: 'Always lower than a return rate computed on raw prices. The gap widens for short, frequent trades.',
      },
      commonMistakes: {
        vi: 'Chia lãi ròng cho giá trị mua thuần thay vì cho tổng vốn bỏ ra, làm tỷ suất đẹp hơn thực tế.',
        en: 'Dividing net profit by the raw buy value instead of the total capital deployed, which flatters the rate beyond reality.',
      },
    },
    example: {
      title: {
        vi: 'Mua 1.000 CP giá 92.000 ₫, bán 97.000 ₫ sau 5 tháng',
        en: 'Buy 1,000 shares at 92,000 ₫, sell at 97,000 ₫ after 5 months',
      },
      inputs: { ...WF08 },
      expected: 5.01,
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
