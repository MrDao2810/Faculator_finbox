/**
 * Tầng DOMAIN — nhóm Tài chính doanh nghiệp (categoryId 'corporate-finance').
 *
 * Hai công thức đúng theo `expectedCount` của SRS 3.8: điểm hoà vốn doanh nghiệp và
 * đòn bẩy tổng hợp DOL × DFL. Cả hai đều cần người dùng hiểu cấu trúc chi phí
 * (định phí / biến phí) và báo cáo kết quả kinh doanh, nên xếp level 'advanced'.
 *
 * Số kiểm chứng tính độc lập bằng dạng đóng trước khi viết hàm:
 *   · hoà vốn: Q = FC ÷ (P − VC) → 500 triệu ÷ (50.000 − 30.000) = 25.000 sản phẩm;
 *   · đòn bẩy: DTL = (DT − BP) ÷ (EBIT − I) → 800 triệu ÷ (300 triệu − 100 triệu) = 4.
 *
 * Ca lỗi WF-15 cho nhóm này, tách theo đúng quy ước README (cùng cách P/E xử lý EPS):
 *   · mẫu số đúng bằng 0 (giá bán = biến phí đơn vị; EBIT = lãi vay) → DIVIDE_BY_ZERO;
 *   · mẫu số âm (giá bán < biến phí — bán càng nhiều càng lỗ; EBIT < lãi vay hoặc
 *     EBIT ≤ 0 — lợi nhuận hoạt động không đủ trả lãi) → MEANINGLESS.
 */

import { ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import { divideByZero, meaningless } from '../warnings';
import { SOURCE_CFA, SOURCE_CORPORATE_FINANCE, numberVar } from './shared';

/*
 * ── 1. Điểm hoà vốn doanh nghiệp ───────────────────────────────────────────────────────
 */

export const DIEM_HOA_VON: FormulaModule = {
  spec: {
    id: 'diem-hoa-von',
    categoryId: 'corporate-finance',
    name: { vi: 'Điểm hoà vốn doanh nghiệp', en: 'Break-even point' },
    description: {
      vi: 'Cần bán bao nhiêu sản phẩm để doanh thu vừa đủ bù toàn bộ chi phí, kèm mức doanh thu hoà vốn tương ứng.',
      en: 'How many units must be sold for revenue to just cover total costs, along with the matching break-even revenue.',
    },
    latex: 'Q_{hv} = \\frac{FC}{P - VC} \\qquad DT_{hv} = Q_{hv} \\times P',
    expression: {
      vi: 'Sản lượng hoà vốn = Định phí ÷ (Giá bán − Biến phí đơn vị)',
      en: 'Break-even output = Fixed cost ÷ (Selling price − Variable cost per unit)',
    },
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['diem hoa von', 'hoa von', 'break even', 'bep', 'dinh phi', 'bien phi', 'so du dam phi'],
    resultUnit: 'sản phẩm',
    variables: [
      numberVar('fixedCost', { vi: 'Định phí', en: 'Fixed cost' }, '₫', 500_000_000, {
        min: 0,
        max: 1_000_000_000_000,
        description: {
          vi: 'Chi phí không đổi theo sản lượng: thuê mặt bằng, khấu hao, lương cố định.',
          en: 'Cost that does not change with output volume: rent, depreciation, fixed salaries.',
        },
      }),
      numberVar(
        'price',
        { vi: 'Giá bán một sản phẩm', en: 'Selling price per unit' },
        '₫',
        50_000,
        {
          min: 0,
          max: 1_000_000_000,
          description: {
            vi: 'Giá bán bình quân của một đơn vị sản phẩm.',
            en: 'Average selling price of one unit of the product.',
          },
        },
      ),
      numberVar(
        'variableCost',
        { vi: 'Biến phí một sản phẩm', en: 'Variable cost per unit' },
        '₫',
        30_000,
        {
          min: 0,
          max: 1_000_000_000,
          description: {
            vi: 'Chi phí tăng theo từng sản phẩm bán ra: nguyên liệu, hoa hồng, vận chuyển.',
            en: 'Cost that rises with each unit sold: raw materials, commissions, shipping.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Mốc sản lượng mà tại đó doanh nghiệp không lãi cũng không lỗ; bán vượt mốc này thì mỗi sản phẩm thêm mới bắt đầu sinh lời.',
        en: 'The output level at which the company neither profits nor loses; every unit sold beyond this point starts generating profit.',
      },
      whenToUse: {
        vi: 'Khi lập kế hoạch kinh doanh, định giá sản phẩm mới, hoặc đánh giá một doanh nghiệp có cấu trúc định phí nặng.',
        en: 'When drafting a business plan, pricing a new product, or assessing a company with a heavy fixed-cost structure.',
      },
      howToRead: {
        vi: 'Điểm hoà vốn càng thấp so với sản lượng thực tế thì biên an toàn càng dày. Doanh thu hoà vốn ở dòng phụ giúp so thẳng với doanh thu trên báo cáo.',
        en: 'The lower the break-even point is relative to actual output, the thicker the margin of safety. The break-even revenue shown alongside lets you compare directly against reported revenue.',
      },
      commonMistakes: {
        vi: 'Xếp nhầm chi phí nửa cố định nửa biến đổi (điện, lương có thưởng doanh số) vào một cột duy nhất, làm điểm hoà vốn lệch xa thực tế.',
        en: 'Misclassifying semi-fixed, semi-variable costs (electricity, salary plus sales bonus) into a single column, which pushes the break-even point far from reality.',
      },
    },
    example: {
      title: {
        vi: 'Định phí 500 triệu ₫, giá bán 50.000 ₫, biến phí 30.000 ₫/sản phẩm',
        en: 'Fixed cost 500 million VND, selling price 50,000 VND, variable cost 30,000 VND per unit',
      },
      inputs: { fixedCost: 500_000_000, price: 50_000, variableCost: 30_000 },
      expected: 25_000,
      note: {
        vi: 'Doanh thu hoà vốn tương ứng 1,25 tỷ ₫.',
        en: 'The corresponding break-even revenue is 1.25 billion VND.',
      },
    },
    tests: [
      {
        name: 'ca thường — mỗi sản phẩm dư 20.000 ₫ đảm phí',
        inputs: { fixedCost: 500_000_000, price: 50_000, variableCost: 30_000 },
        expected: 25_000,
      },
      {
        name: 'định phí 200 triệu, đảm phí 40.000 ₫ thì hoà vốn ở 5.000 sản phẩm',
        inputs: { fixedCost: 200_000_000, price: 120_000, variableCost: 80_000 },
        expected: 5_000,
      },
      {
        name: 'không có định phí thì hoà vốn ngay từ sản phẩm đầu tiên',
        inputs: { fixedCost: 0, price: 50_000, variableCost: 30_000 },
        expected: 0,
      },
      {
        name: 'giá bán bằng biến phí — mẫu số bằng 0, ca chia cho 0 của WF-15',
        inputs: { fixedCost: 500_000_000, price: 30_000, variableCost: 30_000 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'giá bán thấp hơn biến phí — bán càng nhiều càng lỗ',
        inputs: { fixedCost: 500_000_000, price: 25_000, variableCost: 30_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE, SOURCE_CFA],
  },
  calc: (v) => {
    const price = v('price');
    const variableCost = v('variableCost');
    const margin = price - variableCost;

    if (margin === 0) {
      return {
        value: null,
        unit: 'sản phẩm',
        warning: divideByZero(
          { vi: 'điểm hoà vốn', en: 'break-even point' },
          { vi: 'số dư đảm phí đơn vị', en: 'unit contribution margin' },
          {
            vi: 'Nâng giá bán trên mức biến phí đơn vị, hoặc tìm cách giảm biến phí.',
            en: 'Raise the selling price above the variable cost per unit, or find a way to reduce variable cost.',
          },
        ),
      };
    }

    if (margin < 0) {
      return {
        value: null,
        unit: 'sản phẩm',
        warning: meaningless(
          {
            vi: 'Giá bán thấp hơn biến phí đơn vị nên mỗi sản phẩm bán ra càng làm lỗ thêm — doanh nghiệp không bao giờ hoà vốn.',
            en: 'The selling price is below the variable cost per unit, so every unit sold adds to the loss — the company will never break even.',
          },
          {
            vi: 'Nâng giá bán trên mức biến phí đơn vị, hoặc tìm cách giảm biến phí.',
            en: 'Raise the selling price above the variable cost per unit, or find a way to reduce variable cost.',
          },
        ),
      };
    }

    const quantity = v('fixedCost') / margin;
    return ok(quantity, 'sản phẩm', {
      extras: {
        breakEvenRevenue: quantity * price,
        unitMargin: margin,
      },
    });
  },
};

/*
 * ── 2. Đòn bẩy tổng hợp DOL × DFL ──────────────────────────────────────────────────────
 */

export const DON_BAY_TONG_HOP: FormulaModule = {
  spec: {
    id: 'don-bay-tong-hop',
    categoryId: 'corporate-finance',
    name: { vi: 'Đòn bẩy tổng hợp (DOL × DFL)', en: 'Degree of total leverage' },
    description: {
      vi: 'Doanh thu thay đổi 1% thì EPS thay đổi bao nhiêu phần trăm, gộp cả đòn bẩy hoạt động và đòn bẩy tài chính.',
      en: 'How many percent EPS changes for a 1% change in revenue, combining both operating leverage and financial leverage.',
    },
    latex: 'DTL = DOL \\times DFL = \\frac{DT - BP}{EBIT - I}',
    expression: {
      vi: 'Đòn bẩy tổng hợp = (Doanh thu − Tổng biến phí) ÷ (EBIT − Lãi vay)',
      en: 'Degree of total leverage = (Revenue − Total variable cost) ÷ (EBIT − Interest expense)',
    },
    chartType: 'sensitivity',
    level: 'advanced',
    tags: [
      'don bay tong hop',
      'dtl',
      'dol',
      'dfl',
      'don bay hoat dong',
      'don bay tai chinh',
      'leverage',
      'eps',
    ],
    resultUnit: 'lần',
    variables: [
      numberVar('revenue', { vi: 'Doanh thu', en: 'Revenue' }, '₫', 2_000_000_000, {
        min: 0,
        max: 1_000_000_000_000,
        description: { vi: 'Doanh thu thuần trong kỳ.', en: 'Net revenue for the period.' },
      }),
      numberVar(
        'variableCost',
        { vi: 'Tổng biến phí', en: 'Total variable cost' },
        '₫',
        1_200_000_000,
        {
          min: 0,
          max: 1_000_000_000_000,
          description: {
            vi: 'Toàn bộ chi phí biến đổi theo doanh thu trong kỳ.',
            en: 'All costs that vary with revenue during the period.',
          },
        },
      ),
      numberVar(
        'fixedCost',
        { vi: 'Định phí hoạt động', en: 'Operating fixed cost' },
        '₫',
        500_000_000,
        {
          min: 0,
          max: 1_000_000_000_000,
          description: {
            vi: 'Chi phí hoạt động cố định, chưa gồm lãi vay.',
            en: 'Fixed operating cost, not including interest expense.',
          },
        },
      ),
      numberVar('interest', { vi: 'Lãi vay', en: 'Interest expense' }, '₫', 100_000_000, {
        min: 0,
        max: 1_000_000_000_000,
        level: 'advanced',
        description: {
          vi: 'Chi phí lãi vay phải trả trong kỳ.',
          en: 'Interest expense payable during the period.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Hệ số khuếch đại từ doanh thu tới EPS: DOL đo phần khuếch đại do định phí hoạt động, DFL đo phần do lãi vay, nhân lại thành đòn bẩy tổng hợp.',
        en: 'The amplification factor from revenue to EPS: DOL measures the amplification from operating fixed cost, DFL measures the part from interest expense, and multiplying them gives the degree of total leverage.',
      },
      whenToUse: {
        vi: 'Khi đánh giá độ nhạy lợi nhuận của doanh nghiệp nhiều định phí hoặc vay nợ lớn, nhất là lúc dự phóng kịch bản doanh thu tăng giảm.',
        en: 'When assessing the profit sensitivity of a company with heavy fixed costs or large debt, especially when projecting revenue-increase or revenue-decrease scenarios.',
      },
      howToRead: {
        vi: 'Đòn bẩy 4 lần nghĩa là doanh thu tăng 1% thì EPS tăng khoảng 4%, nhưng giảm 1% thì EPS cũng giảm 4% — con số càng lớn, lợi nhuận càng dễ vỡ khi doanh thu hụt.',
        en: 'A leverage of 4 times means a 1% increase in revenue drives roughly a 4% increase in EPS, but a 1% decrease in revenue also drives a 4% drop in EPS — the larger the number, the more fragile profit becomes when revenue falls short.',
      },
      commonMistakes: {
        vi: 'Coi đòn bẩy cao là điểm cộng vô điều kiện; nó chỉ có lợi khi doanh thu đi lên, và hệ số này chỉ đúng cho thay đổi nhỏ quanh mức doanh thu hiện tại.',
        en: 'Treating high leverage as an unconditional plus; it only helps when revenue is rising, and the coefficient is only accurate for small changes around the current revenue level.',
      },
    },
    example: {
      title: {
        vi: 'Doanh thu 2 tỷ ₫, biến phí 1,2 tỷ ₫, định phí 500 triệu ₫, lãi vay 100 triệu ₫',
        en: 'Revenue 2 billion VND, variable cost 1.2 billion VND, fixed cost 500 million VND, interest expense 100 million VND',
      },
      inputs: {
        revenue: 2_000_000_000,
        variableCost: 1_200_000_000,
        fixedCost: 500_000_000,
        interest: 100_000_000,
      },
      expected: 4,
      note: {
        vi: 'DOL 2,67 × DFL 1,5 = 4: doanh thu giảm 10% thì EPS giảm khoảng 40%.',
        en: 'DOL 2.67 × DFL 1.5 = 4: a 10% drop in revenue drives roughly a 40% drop in EPS.',
      },
    },
    tests: [
      {
        name: 'ca thường — DOL 2,67 nhân DFL 1,5 bằng 4',
        inputs: {
          revenue: 2_000_000_000,
          variableCost: 1_200_000_000,
          fixedCost: 500_000_000,
          interest: 100_000_000,
        },
        expected: 4,
      },
      {
        name: 'không vay nợ thì DFL bằng 1, đòn bẩy tổng hợp bằng DOL',
        inputs: {
          revenue: 2_000_000_000,
          variableCost: 1_200_000_000,
          fixedCost: 500_000_000,
          interest: 0,
        },
        expected: 2.6667,
      },
      {
        name: 'EBIT vừa đủ trả lãi vay — mẫu số bằng 0, ca chia cho 0 của WF-15',
        inputs: {
          revenue: 2_000_000_000,
          variableCost: 1_200_000_000,
          fixedCost: 500_000_000,
          interest: 300_000_000,
        },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'EBIT âm — doanh nghiệp đang lỗ hoạt động, đòn bẩy không có ý nghĩa',
        inputs: {
          revenue: 2_000_000_000,
          variableCost: 1_200_000_000,
          fixedCost: 900_000_000,
          interest: 100_000_000,
        },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE, SOURCE_CFA],
  },
  calc: (v) => {
    const contributionMargin = v('revenue') - v('variableCost');
    const ebit = contributionMargin - v('fixedCost');
    const interest = v('interest');

    if (ebit <= 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          {
            vi: 'EBIT không dương — doanh nghiệp đang lỗ từ hoạt động kinh doanh nên hệ số đòn bẩy không còn ý nghĩa.',
            en: 'EBIT is not positive — the company is posting an operating loss, so the leverage coefficient is no longer meaningful.',
          },
          {
            vi: 'Xem lại doanh thu và cấu trúc chi phí; dùng điểm hoà vốn để biết cần bán thêm bao nhiêu.',
            en: 'Review revenue and the cost structure; use the break-even point to see how much more needs to be sold.',
          },
        ),
      };
    }

    if (ebit === interest) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          { vi: 'đòn bẩy tổng hợp', en: 'degree of total leverage' },
          { vi: 'EBIT trừ lãi vay', en: 'EBIT minus interest expense' },
          {
            vi: 'Giảm nợ vay hoặc chờ EBIT vượt hẳn lãi vay rồi mới đo đòn bẩy.',
            en: 'Reduce debt or wait until EBIT clearly exceeds interest expense before measuring leverage.',
          },
        ),
      };
    }

    if (ebit < interest) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          {
            vi: 'EBIT thấp hơn lãi vay — lợi nhuận hoạt động không đủ trả lãi, nên DFL và đòn bẩy tổng hợp vô nghĩa.',
            en: 'EBIT is lower than interest expense — operating profit is not enough to cover interest, so DFL and the degree of total leverage are meaningless.',
          },
          {
            vi: 'Giảm nợ vay hoặc chờ EBIT vượt hẳn lãi vay rồi mới đo đòn bẩy.',
            en: 'Reduce debt or wait until EBIT clearly exceeds interest expense before measuring leverage.',
          },
        ),
      };
    }

    return ok(contributionMargin / (ebit - interest), 'lần', {
      extras: {
        dol: contributionMargin / ebit,
        dfl: ebit / (ebit - interest),
        ebit,
        contributionMargin,
      },
    });
  },
};

/** Hai công thức tài chính doanh nghiệp của nhóm 'corporate-finance'. */
export const CORPORATE_FORMULAS: ReadonlyArray<FormulaModule> = [DIEM_HOA_VON, DON_BAY_TONG_HOP];
