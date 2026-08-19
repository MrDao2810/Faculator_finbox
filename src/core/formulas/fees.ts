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
import type { CalcOutput } from '../types';
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

const quantity = numberVar('quantity', 'Khối lượng', 'CP', 1_000, {
  min: 0,
  max: 50_000_000,
  description: 'Số cổ phiếu mua vào rồi bán ra.',
});

const months = numberVar('months', 'Thời gian nắm giữ', 'tháng', 5, {
  min: 0,
  max: 600,
  description: 'Số tháng cổ phiếu nằm trong tài khoản lưu ký.',
});

const buyPrice = numberVar('buyPrice', 'Giá mua', '₫', 92_000, {
  min: 0,
  max: 10_000_000,
  description: 'Giá khớp lệnh mua, tính cho một cổ phiếu.',
});

const sellPrice = numberVar('sellPrice', 'Giá bán', '₫', 97_000, {
  min: 0,
  max: 10_000_000,
  description: 'Giá khớp lệnh bán, tính cho một cổ phiếu.',
});

const dividendPerShare = numberVar('dividendPerShare', 'Cổ tức tiền mặt', '₫/CP', 2_000, {
  min: 0,
  max: 1_000_000,
  description: 'Số tiền cổ tức nhận được trên mỗi cổ phiếu, trước thuế.',
});

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
    description: 'Phí công ty chứng khoán thu khi lệnh mua khớp.',
    latex: 'F_{mua} = Q \\times P_{mua} \\times r_{mua}',
    expression: 'Phí mua = Khối lượng × Giá mua × Tỷ lệ phí mua',
    chartType: 'none',
    level: 'basic',
    tags: ['phi mua', 'phi moi gioi', 'phi giao dich'],
    resultUnit: '₫',
    variables: [quantity, buyPrice],
    explanation: {
      meaning: 'Số tiền công ty chứng khoán thu trên giá trị lệnh mua đã khớp.',
      whenToUse: 'Khi muốn biết giá vốn thật của một lệnh mua, không chỉ là giá khớp lệnh.',
      howToRead:
        'Phí tính trên giá trị giao dịch chứ không trên khoản lãi, nên mua rồi bán ngay vẫn mất phí.',
      commonMistakes:
        'Tưởng phí đã nằm trong giá khớp lệnh. Phí được trừ riêng khỏi tiền trong tài khoản.',
    },
    example: {
      title: 'Mua 1.000 CP giá 92.000 ₫, biểu phí HOSE 2026',
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
    if (rate === null) return missingConstant('₫', 'phí môi giới lệnh mua');
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
    description: 'Phí công ty chứng khoán thu khi lệnh bán khớp.',
    latex: 'F_{ban} = Q \\times P_{ban} \\times r_{ban}',
    expression: 'Phí bán = Khối lượng × Giá bán × Tỷ lệ phí bán',
    chartType: 'none',
    level: 'basic',
    tags: ['phi ban', 'phi moi gioi', 'phi giao dich'],
    resultUnit: '₫',
    variables: [quantity, sellPrice],
    explanation: {
      meaning: 'Số tiền công ty chứng khoán thu trên giá trị lệnh bán đã khớp.',
      whenToUse:
        'Khi ước tính chi phí của lệnh bán, hoặc khi so mức phí giữa các công ty chứng khoán — đây là khoản thương lượng được, khác thuế và phí lưu ký.',
      howToRead: 'Một vòng mua – bán chịu phí hai lần, nên chi phí gấp đôi mức của một lệnh.',
      commonMistakes: 'Chỉ trừ phí mua mà quên phí bán khi ước tính lãi.',
    },
    example: {
      title: 'Bán 1.000 CP giá 97.000 ₫, biểu phí HOSE 2026',
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
    if (rate === null) return missingConstant('₫', 'phí môi giới lệnh bán');
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
    description: 'Thuế thu nhập cá nhân tính trên giá trị bán, thu cả khi giao dịch lỗ.',
    latex: 'T = Q \\times P_{ban} \\times r_{thue}',
    expression: 'Thuế = Khối lượng × Giá bán × Thuế suất chuyển nhượng',
    chartType: 'none',
    level: 'basic',
    tags: ['thue', 'thue cnck', 'chuyen nhuong'],
    resultUnit: '₫',
    variables: [quantity, sellPrice],
    explanation: {
      meaning: 'Khoản thuế Nhà nước thu khi bán chứng khoán, tính trên giá trị bán.',
      whenToUse: 'Mỗi lần bán, để biết số tiền thực về tài khoản.',
      howToRead:
        'Thuế tính trên giá trị bán chứ không trên phần lãi — bán lỗ vẫn phải nộp khoản này.',
      commonMistakes:
        'Tưởng lỗ thì được miễn thuế. Cách tính hiện hành thu theo giá trị bán, không theo lãi.',
    },
    example: {
      title: 'Bán 1.000 CP giá 97.000 ₫',
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
    if (rate === null) return missingConstant('₫', 'thuế chuyển nhượng chứng khoán');
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
    description: 'Thuế khấu trừ trên cổ tức tiền mặt trước khi tiền về tài khoản.',
    latex: 'T_{ct} = Q \\times D \\times r_{ct}',
    expression: 'Thuế cổ tức = Khối lượng × Cổ tức mỗi cổ phiếu × Thuế suất cổ tức',
    chartType: 'none',
    level: 'basic',
    tags: ['thue co tuc', 'co tuc', 'dividend'],
    resultUnit: '₫',
    variables: [quantity, dividendPerShare],
    explanation: {
      meaning: 'Phần cổ tức bị khấu trừ thuế trước khi chuyển về tài khoản nhà đầu tư.',
      whenToUse: 'Khi ước tính dòng tiền cổ tức thực nhận trong năm.',
      howToRead: 'Công ty chứng khoán khấu trừ sẵn, nên số tiền về tài khoản đã là số sau thuế.',
      commonMistakes:
        'Lấy nguyên mức cổ tức công bố để tính tỷ suất cổ tức thực nhận, thành ra cao hơn thực tế.',
    },
    example: {
      title: '1.000 CP, cổ tức 2.000 ₫/CP',
      inputs: { quantity: 1_000, dividendPerShare: 2_000 },
      expected: 100_000,
    },
    note: 'Công thức tính cho cổ tức tiền mặt của cổ phiếu. Lợi tức được chia từ quỹ đầu tư chứng khoán hoặc quỹ bất động sản được giảm 50% thuế theo luật thuế mới — trường hợp đó nằm ngoài phạm vi ở đây.',
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
    if (rate === null) return missingConstant('₫', 'thuế cổ tức tiền mặt');
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
    description: 'Phí giữ hộ cổ phiếu, tính theo số cổ phiếu và số tháng nắm giữ.',
    latex: 'F_{lk} = Q \\times M \\times c',
    expression: 'Phí lưu ký = Khối lượng × Số tháng nắm giữ × Mức phí mỗi cổ phiếu mỗi tháng',
    chartType: 'none',
    level: 'basic',
    tags: ['phi luu ky', 'vsd', 'custody'],
    resultUnit: '₫',
    variables: [quantity, months],
    explanation: {
      meaning: 'Khoản phí nhỏ thu hằng tháng cho việc lưu giữ cổ phiếu trên tài khoản.',
      whenToUse: 'Khi tính chi phí của một khoản đầu tư nắm giữ dài.',
      howToRead:
        'Rất nhỏ với lệnh ngắn hạn, nhưng cộng dồn đáng kể khi giữ nhiều cổ phiếu trong nhiều năm.',
      commonMistakes: 'Bỏ qua hoàn toàn khi tính giá hoà vốn của khoản nắm giữ dài hạn.',
    },
    example: {
      title: '1.000 CP giữ 5 tháng',
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
    if (constant === undefined) return missingConstant('₫', 'phí lưu ký');
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
    description: 'Giá bán tối thiểu để không lỗ sau khi trừ hết phí và thuế.',
    latex: 'P_{hv} = \\frac{Q \\cdot P_{mua} + F_{mua} + F_{lk}}{Q\\,(1 - r_{ban} - r_{thue})}',
    expression:
      'Giá hoà vốn = (Tiền mua + Phí mua + Phí lưu ký) ÷ [Khối lượng × (1 − Tỷ lệ phí bán − Thuế suất bán)]',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['gia hoa von', 'hoa von', 'break even'],
    resultUnit: '₫',
    variables: [quantity, months, buyPrice],
    explanation: {
      meaning: 'Mức giá bán mà tại đó tiền thu về vừa đúng bằng tiền đã bỏ ra, không lãi không lỗ.',
      whenToUse: 'Trước khi đặt lệnh bán, để biết bán dưới mức nào là thực sự lỗ.',
      howToRead: 'Luôn cao hơn giá mua, vì phải gánh cả phí mua, phí bán, thuế bán và phí lưu ký.',
      commonMistakes:
        'Lấy đúng giá mua làm mốc hoà vốn. Bán bằng giá mua là đã lỗ đúng bằng tổng chi phí.',
    },
    example: {
      title: 'Mua 1.000 CP giá 92.000 ₫, giữ 5 tháng',
      inputs: { quantity: WF08.quantity, months: WF08.months, buyPrice: WF08.buyPrice },
      expected: 92_370.28,
      note: 'Bán đúng 92.000 ₫ là lỗ, dù không giảm giá đồng nào.',
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
      warning: divideByZero('giá hoà vốn', 'Khối lượng', 'Nhập số cổ phiếu lớn hơn 0.'),
    };
  }

  const rBuy = rateOf(ctx, 'fee.brokerage.buy');
  const rSell = rateOf(ctx, 'fee.brokerage.sell');
  const rTax = rateOf(ctx, 'tax.transfer.sell');
  const custody = constantOf(ctx, 'fee.custody');
  if (rBuy === null || rSell === null || rTax === null || custody === undefined) {
    return missingConstant('₫', 'phí và thuế giao dịch');
  }

  const netRatio = 1 - rSell - rTax;
  if (netRatio <= 0) {
    return {
      value: null,
      unit: '₫',
      warning: meaningless(
        'Tổng phí bán và thuế bán từ 100% trở lên nên không có giá bán nào hoà vốn được.',
        'Kiểm tra lại biểu phí đang chọn.',
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
    description: 'Số tiền lãi thực sự còn lại sau khi trừ hết phí giao dịch và thuế.',
    latex: 'L_{rong} = Q\\,(P_{ban} - P_{mua}) - (F_{mua} + F_{ban} + T + F_{lk})',
    expression: 'Lợi nhuận ròng = Khối lượng × (Giá bán − Giá mua) − Tổng chi phí',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['loi nhuan rong', 'lai rong', 'phi va thue'],
    resultUnit: '₫',
    variables: [quantity, months, buyPrice, sellPrice],
    explanation: {
      meaning: 'Phần tiền thật sự vào túi sau một vòng mua – bán, đã trừ mọi khoản phải nộp.',
      whenToUse: 'Khi đánh giá một giao dịch đã thực hiện, hoặc thử một kịch bản giá bán.',
      howToRead:
        'Luôn nhỏ hơn lãi gộp trên bảng giá. Khoảng cách giữa hai con số chính là tổng chi phí.',
      commonMistakes:
        'Lấy chênh lệch giá nhân khối lượng rồi coi đó là lãi. Với biên lãi mỏng, chi phí có thể nuốt hết.',
    },
    example: {
      title: 'Mua 1.000 CP giá 92.000 ₫, bán 97.000 ₫ sau 5 tháng',
      inputs: { ...WF08 },
      expected: 4_618_150,
      note: 'Lãi gộp 5.000.000 ₫, tổng chi phí 381.850 ₫.',
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
    if (costs === null) return missingConstant('₫', 'phí và thuế giao dịch');

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
    description: 'Tỷ suất lợi nhuận thực trên số vốn đã thực sự bỏ ra.',
    latex: 'ROI_{rong} = \\frac{L_{rong}}{Q \\cdot P_{mua} + F_{mua} + F_{lk}} \\times 100',
    expression: 'ROI ròng = Lợi nhuận ròng ÷ Vốn thực bỏ ra × 100',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['roi rong', 'ty suat loi nhuan', 'hieu qua'],
    resultUnit: '%',
    variables: [quantity, months, buyPrice, sellPrice],
    explanation: {
      meaning: 'Lãi ròng chia cho vốn thực bỏ ra, gồm cả phí mua và phí lưu ký.',
      whenToUse: 'Khi so sánh hiệu quả giữa các giao dịch có quy mô vốn khác nhau.',
      howToRead:
        'Luôn thấp hơn tỷ suất tính theo giá thuần. Chênh lệch càng rõ khi giao dịch ngắn và dày.',
      commonMistakes:
        'Chia lãi ròng cho giá trị mua thuần thay vì cho tổng vốn bỏ ra, làm tỷ suất đẹp hơn thực tế.',
    },
    example: {
      title: 'Mua 1.000 CP giá 92.000 ₫, bán 97.000 ₫ sau 5 tháng',
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
    if (costs === null) return missingConstant('%', 'phí và thuế giao dịch');

    if (costs.costBasis === 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero('ROI ròng', 'Vốn bỏ ra', 'Nhập khối lượng và giá mua lớn hơn 0.'),
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
  label: string;
  /** Công thức hiện ngay dưới nhãn, ví dụ '0,15% × 92.000.000 ₫' — WF-08 đòi hiện trong dòng. */
  formula: string;
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
  const rows: FeeBreakdownRow[] = [
    {
      key: 'fee.brokerage.buy',
      label: 'Phí giao dịch mua',
      formula: percentTimes(rBuy, buyValue),
      output: runFormula(PHI_GIAO_DICH_MUA, inputs, ctx),
    },
    {
      key: 'fee.brokerage.sell',
      label: 'Phí giao dịch bán',
      formula: percentTimes(rSell, sellValue),
      output: runFormula(PHI_GIAO_DICH_BAN, inputs, ctx),
    },
    {
      key: 'tax.transfer.sell',
      label: 'Thuế CNCK (khi bán)',
      formula: percentTimes(rTax, sellValue),
      output: runFormula(THUE_CHUYEN_NHUONG, inputs, ctx),
    },
    {
      key: 'fee.custody',
      label: 'Phí lưu ký',
      formula:
        custody === undefined
          ? '—'
          : `${formatNumber(custody.value, { maxDecimals: 2 })} ₫/CP/tháng × ${formatNumber(v('quantity'))} × ${formatNumber(v('months'))}`,
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
function percentTimes(rate: number | null, base: number): string {
  if (rate === null || !Number.isFinite(base)) return '—';
  // minDecimals 2 để thuế 0,1% hiện thành '0,10%' đúng như wireframe, không thành '0,1%'.
  return `${formatNumber(rate * 100, { minDecimals: 2, maxDecimals: 3 })}% × ${formatNumber(base)} ₫`;
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
