/**
 * Tầng DOMAIN — nhóm Định giá, nửa BỘI SỐ & SO SÁNH (gói WBS 5.2.x).
 *
 * Mười công thức: P/S, giá trị doanh nghiệp (EV), EV/EBITDA, EV/Sales, PEG,
 * vốn hoá thị trường, số Graham, NCAV trên cổ phiếu, tỷ suất lợi nhuận trên giá và giá mục tiêu.
 * Nửa còn lại của nhóm (chiết khấu dòng tiền, cổ tức) do đợt khác đảm nhận.
 *
 * P/E và P/B đã nằm ở nhóm 'fundamentals' theo wireframe WF-02/WF-03, nên không lặp lại
 * ở đây — nhóm này chỉ nhận các bội số chưa có.
 *
 * Quy ước đơn vị: các khoản mục báo cáo tài chính (vốn hoá, nợ, tiền mặt, doanh thu,
 * EBITDA, tài sản, nợ phải trả) nhập theo tỷ ₫; số cổ phiếu lưu hành theo triệu CP;
 * các con số trên mỗi cổ phiếu (giá, EPS, BVPS) theo ₫ — khớp thói quen đọc báo cáo
 * của nhà đầu tư Việt Nam và tránh ô nhập mười ba chữ số.
 *
 * Ca lỗi WF-15 của nhóm này: doanh thu bằng 0 (chia cho 0), EBITDA âm (bội số vô nghĩa),
 * tăng trưởng bằng 0 hoặc âm với PEG.
 */

import { ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import type { FormulaSource } from '../registry/types';
import { divideByZero, meaningless } from '../warnings';
import { SOURCE_CFA, numberVar } from './shared';

/*
 * ── Nguồn riêng của các công thức Graham (FR-04) ───────────────────────────────────────
 */

const SOURCE_INTELLIGENT_INVESTOR: FormulaSource = {
  label:
    'Benjamin Graham — The Intelligent Investor (bản hiệu đính 2006, chú giải của Jason Zweig), chương 14–15',
};

const SOURCE_SECURITY_ANALYSIS: FormulaSource = {
  label: 'Benjamin Graham & David Dodd — Security Analysis (ấn bản 6, McGraw-Hill, 2008)',
};

/*
 * ── Biến dùng lại trong nhóm ───────────────────────────────────────────────────────────
 */

const sharePrice = numberVar('price', 'Giá thị trường', '₫', 92_000, {
  min: 0,
  max: 10_000_000,
  description: 'Giá đóng cửa gần nhất của một cổ phiếu.',
});

const sharesOutstanding = numberVar('shares', 'Số cổ phiếu lưu hành', 'triệu CP', 118, {
  min: 0,
  max: 100_000,
  description: 'Số cổ phiếu đang lưu hành, tính bằng triệu.',
});

const enterpriseValueInput = numberVar('ev', 'Giá trị doanh nghiệp (EV)', 'tỷ ₫', 11_500, {
  min: -1_000_000,
  max: 10_000_000,
  description: 'Vốn hoá cộng nợ vay trừ tiền mặt — tính bằng công thức EV của nhóm này.',
});

/*
 * ── 1. P/S — giá trên doanh thu ────────────────────────────────────────────────────────
 */

export const PS: FormulaModule = {
  spec: {
    id: 'ps',
    categoryId: 'valuation',
    name: { vi: 'P/S — hệ số giá trên doanh thu', en: 'Price to sales ratio' },
    description: 'Nhà đầu tư trả bao nhiêu đồng cho mỗi đồng doanh thu của doanh nghiệp.',
    latex: 'P/S = \\frac{P}{S_{ps}}',
    expression: 'P/S = Giá thị trường ÷ Doanh thu trên mỗi cổ phiếu',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['ps', 'p s', 'gia tren doanh thu', 'boi so', 'dinh gia', 'price to sales'],
    resultUnit: 'lần',
    variables: [
      sharePrice,
      numberVar('salesPerShare', 'Doanh thu trên mỗi cổ phiếu', '₫', 45_000, {
        min: -1_000_000,
        max: 10_000_000,
        description: 'Doanh thu thuần bốn quý gần nhất chia cho số cổ phiếu đang lưu hành.',
      }),
    ],
    explanation: {
      meaning:
        'Thị trường đang định giá mỗi đồng doanh thu của doanh nghiệp bằng bao nhiêu đồng vốn.',
      whenToUse:
        'Khi doanh nghiệp chưa có lãi nên P/E không dùng được — công ty tăng trưởng, công ty mới niêm yết.',
      howToRead:
        'P/S thấp hơn các doanh nghiệp cùng ngành gợi ý cổ phiếu đang rẻ so với quy mô doanh thu. So khác ngành thì vô nghĩa vì biên lợi nhuận mỗi ngành một khác.',
      commonMistakes:
        'Quên rằng doanh thu lớn không đồng nghĩa có lãi — P/S thấp ở doanh nghiệp biên lợi nhuận mỏng không phải là món hời.',
    },
    example: {
      title: 'Giá 92.000 ₫, doanh thu 45.000 ₫/CP',
      inputs: { price: 92_000, salesPerShare: 45_000 },
      expected: 2.04,
      note: 'Mỗi đồng doanh thu đang được trả giá hơn hai đồng.',
    },
    tests: [
      {
        name: 'ca thường — giá 92.000 ₫, doanh thu 45.000 ₫/CP',
        inputs: { price: 92_000, salesPerShare: 45_000 },
        expected: 2.04,
      },
      {
        name: 'doanh thu bằng 0 — ca chia cho 0 của nhóm định giá',
        inputs: { price: 92_000, salesPerShare: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'doanh thu âm là số liệu sai, không trả bội số âm',
        inputs: { price: 92_000, salesPerShare: -5_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const sales = v('salesPerShare');

    if (sales === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          'P/S',
          'Doanh thu trên mỗi cổ phiếu',
          'Nhập doanh thu khác 0 hoặc chọn kỳ báo cáo khác.',
        ),
      };
    }

    if (sales < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          'Doanh thu trên mỗi cổ phiếu không thể âm — số liệu đang nhập sai.',
          'Kiểm tra lại báo cáo kết quả kinh doanh, doanh thu thuần luôn từ 0 trở lên.',
        ),
      };
    }

    return ok(v('price') / sales, 'lần');
  },
};

/*
 * ── 2. EV — giá trị doanh nghiệp ───────────────────────────────────────────────────────
 */

export const EV: FormulaModule = {
  spec: {
    id: 'ev',
    categoryId: 'valuation',
    name: { vi: 'EV — giá trị doanh nghiệp', en: 'Enterprise value' },
    description: 'Số tiền cần bỏ ra để mua trọn doanh nghiệp, gồm cả nợ và trừ đi tiền mặt.',
    latex: 'EV = \\text{Vốn hoá} + \\text{Nợ vay} - \\text{Tiền mặt}',
    expression: 'EV = Vốn hoá thị trường + Nợ vay − Tiền và tương đương tiền',
    chartType: 'waterfall',
    level: 'basic',
    tags: ['ev', 'gia tri doanh nghiep', 'enterprise value', 'von hoa', 'no vay'],
    resultUnit: 'tỷ ₫',
    variables: [
      numberVar('marketCap', 'Vốn hoá thị trường', 'tỷ ₫', 9_200, {
        min: 0,
        max: 10_000_000,
        description: 'Giá thị trường nhân với số cổ phiếu đang lưu hành.',
      }),
      numberVar('totalDebt', 'Nợ vay', 'tỷ ₫', 3_500, {
        min: 0,
        max: 10_000_000,
        description: 'Tổng nợ vay ngắn hạn và dài hạn trên bảng cân đối kế toán.',
      }),
      numberVar('cash', 'Tiền và tương đương tiền', 'tỷ ₫', 1_200, {
        min: 0,
        max: 10_000_000,
        description: 'Tiền mặt, tiền gửi và các khoản tương đương tiền.',
      }),
    ],
    explanation: {
      meaning:
        'Giá mua trọn doanh nghiệp theo góc nhìn người thâu tóm: trả vốn hoá cho cổ đông, gánh thay nợ vay, rồi được cầm luôn tiền mặt trong két.',
      whenToUse:
        'Khi so sánh các doanh nghiệp có cơ cấu nợ khác nhau — vốn hoá bỏ qua nợ nên dễ đánh lừa.',
      howToRead:
        'EV lớn hơn vốn hoá nghĩa là doanh nghiệp vay nhiều hơn tiền mặt đang giữ. EV âm là hiếm — tiền mặt vượt cả vốn hoá cộng nợ.',
      commonMistakes:
        'Lấy vốn hoá làm giá mua doanh nghiệp mà quên khoản nợ người mua phải gánh — hai công ty cùng vốn hoá có thể đắt rẻ rất khác nhau.',
    },
    example: {
      title: 'Vốn hoá 9.200 tỷ ₫, nợ vay 3.500 tỷ ₫, tiền mặt 1.200 tỷ ₫',
      inputs: { marketCap: 9_200, totalDebt: 3_500, cash: 1_200 },
      expected: 11_500,
      note: 'Muốn mua trọn doanh nghiệp này thực chất phải bỏ ra 11.500 tỷ ₫.',
    },
    tests: [
      {
        name: 'ca thường — vốn hoá 9.200, nợ 3.500, tiền mặt 1.200',
        inputs: { marketCap: 9_200, totalDebt: 3_500, cash: 1_200 },
        expected: 11_500,
      },
      {
        name: 'doanh nghiệp nhiều tiền mặt thì EV thấp hơn vốn hoá',
        inputs: { marketCap: 5_000, totalDebt: 200, cash: 1_500 },
        expected: 3_700,
      },
      {
        name: 'vốn hoá bằng 0 thì không có doanh nghiệp để định giá',
        inputs: { marketCap: 0, totalDebt: 3_500, cash: 1_200 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
    /*
     * Ba chặng của thác nước chính là ba ô nhập — không cần `extras`, không sửa `calc`.
     * Đây cũng là lý do `ev` được chọn làm công thức chứng minh cho renderer bóc tách.
     */
    breakdown: [
      { key: 'marketCap', sign: 1, shortLabel: 'Vốn hoá' },
      { key: 'totalDebt', sign: 1, shortLabel: 'Nợ vay' },
      { key: 'cash', sign: -1, shortLabel: 'Tiền mặt' },
    ],
  },
  calc: (v) => {
    const marketCap = v('marketCap');

    if (marketCap <= 0) {
      return {
        value: null,
        unit: 'tỷ ₫',
        warning: meaningless(
          'Vốn hoá bằng 0 nghĩa là chưa có giá thị trường để tính giá trị doanh nghiệp.',
          'Tính vốn hoá trước bằng công thức Vốn hoá thị trường trong nhóm này.',
        ),
      };
    }

    return ok(marketCap + v('totalDebt') - v('cash'), 'tỷ ₫');
  },
};

/*
 * ── 3. EV/EBITDA ───────────────────────────────────────────────────────────────────────
 */

export const EV_EBITDA: FormulaModule = {
  spec: {
    id: 'ev-ebitda',
    categoryId: 'valuation',
    name: { vi: 'EV/EBITDA', en: 'EV to EBITDA ratio' },
    description:
      'Giá mua trọn doanh nghiệp gấp bao nhiêu lần lợi nhuận trước lãi vay, thuế và khấu hao.',
    latex: 'EV/EBITDA = \\frac{EV}{EBITDA}',
    expression: 'EV/EBITDA = Giá trị doanh nghiệp ÷ EBITDA',
    chartType: 'sensitivity',
    level: 'advanced',
    isFeatured: true,
    tags: ['ev ebitda', 'boi so', 'dinh gia', 'khau hao', 'enterprise multiple'],
    resultUnit: 'lần',
    variables: [
      enterpriseValueInput,
      numberVar('ebitda', 'EBITDA', 'tỷ ₫', 1_450, {
        min: -1_000_000,
        max: 10_000_000,
        description: 'Lợi nhuận trước lãi vay, thuế và khấu hao, bốn quý gần nhất.',
      }),
    ],
    explanation: {
      meaning:
        'Số năm dòng lợi nhuận hoạt động cần có để hoàn lại toàn bộ giá mua doanh nghiệp, nếu EBITDA giữ nguyên.',
      whenToUse:
        'So sánh định giá giữa các doanh nghiệp có mức nợ và chính sách khấu hao khác nhau — chỗ mà P/E dễ méo.',
      howToRead:
        'Thấp hơn trung bình ngành gợi ý đang rẻ. Nhưng EBITDA chưa trừ chi đầu tư, nên ngành thâm dụng vốn thường có bội số thấp một cách tự nhiên.',
      commonMistakes:
        'Coi EBITDA là dòng tiền thật — nó bỏ qua chi đầu tư và thay đổi vốn lưu động, dùng cho ngành nặng tài sản dễ lạc quan quá mức.',
    },
    example: {
      title: 'EV 11.500 tỷ ₫, EBITDA 1.450 tỷ ₫',
      inputs: { ev: 11_500, ebitda: 1_450 },
      expected: 7.93,
      note: 'Khoảng 8 năm EBITDA để hoàn lại giá mua trọn doanh nghiệp.',
    },
    tests: [
      {
        name: 'ca thường — EV 11.500, EBITDA 1.450',
        inputs: { ev: 11_500, ebitda: 1_450 },
        expected: 7.93,
      },
      {
        name: 'EBITDA bằng 0 — chia cho 0',
        inputs: { ev: 11_500, ebitda: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'EBITDA âm thì bội số vô nghĩa — ca WF-15 của nhóm',
        inputs: { ev: 11_500, ebitda: -300 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const ebitda = v('ebitda');

    if (ebitda === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          'EV/EBITDA',
          'EBITDA',
          'Nhập EBITDA khác 0 hoặc chọn kỳ báo cáo khác.',
        ),
      };
    }

    if (ebitda < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          'EV/EBITDA không có ý nghĩa khi EBITDA âm — hoạt động kinh doanh đang lỗ trước cả khấu hao.',
          'Dùng EV/Sales hoặc P/B để thay thế.',
        ),
      };
    }

    return ok(v('ev') / ebitda, 'lần');
  },
};

/*
 * ── 4. EV/Sales ────────────────────────────────────────────────────────────────────────
 */

export const EV_SALES: FormulaModule = {
  spec: {
    id: 'ev-sales',
    categoryId: 'valuation',
    name: { vi: 'EV/Sales — EV trên doanh thu', en: 'EV to sales ratio' },
    description: 'Giá mua trọn doanh nghiệp gấp bao nhiêu lần doanh thu một năm.',
    latex: 'EV/Sales = \\frac{EV}{\\text{Doanh thu}}',
    expression: 'EV/Sales = Giá trị doanh nghiệp ÷ Doanh thu thuần',
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['ev sales', 'ev doanh thu', 'boi so', 'dinh gia', 'ev to sales'],
    resultUnit: 'lần',
    variables: [
      enterpriseValueInput,
      numberVar('revenue', 'Doanh thu thuần', 'tỷ ₫', 9_800, {
        min: -1_000_000,
        max: 10_000_000,
        description: 'Doanh thu thuần bốn quý gần nhất trên báo cáo kết quả kinh doanh.',
      }),
    ],
    explanation: {
      meaning:
        'Mỗi đồng doanh thu đang được định giá bằng bao nhiêu đồng, đã tính cả phần nợ người mua phải gánh.',
      whenToUse:
        'Khi cả lợi nhuận lẫn EBITDA đều âm nên các bội số lợi nhuận không dùng được, hoặc khi so doanh nghiệp có cơ cấu nợ khác nhau.',
      howToRead:
        'So trong cùng ngành: thấp hơn trung bình gợi ý đang rẻ so với quy mô kinh doanh. Ngành biên lợi nhuận cao thì EV/Sales cao là bình thường.',
      commonMistakes:
        'Dùng vốn hoá thay cho EV ở tử số — như vậy hai doanh nghiệp cùng doanh thu nhưng nợ khác hẳn nhau lại trông giống nhau.',
    },
    example: {
      title: 'EV 11.500 tỷ ₫, doanh thu 9.800 tỷ ₫',
      inputs: { ev: 11_500, revenue: 9_800 },
      expected: 1.17,
    },
    tests: [
      {
        name: 'ca thường — EV 11.500, doanh thu 9.800',
        inputs: { ev: 11_500, revenue: 9_800 },
        expected: 1.17,
      },
      {
        name: 'doanh thu bằng 0 — chia cho 0, ca WF-15 của nhóm',
        inputs: { ev: 11_500, revenue: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'doanh thu âm là số liệu sai',
        inputs: { ev: 11_500, revenue: -100 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const revenue = v('revenue');

    if (revenue === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          'EV/Sales',
          'Doanh thu thuần',
          'Nhập doanh thu khác 0 hoặc chọn kỳ báo cáo khác.',
        ),
      };
    }

    if (revenue < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          'Doanh thu thuần không thể âm — số liệu đang nhập sai.',
          'Kiểm tra lại báo cáo kết quả kinh doanh, doanh thu thuần luôn từ 0 trở lên.',
        ),
      };
    }

    return ok(v('ev') / revenue, 'lần');
  },
};

/*
 * ── 5. PEG ─────────────────────────────────────────────────────────────────────────────
 */

export const PEG: FormulaModule = {
  spec: {
    id: 'peg',
    categoryId: 'valuation',
    name: { vi: 'PEG — P/E trên tăng trưởng', en: 'Price/earnings to growth ratio' },
    description:
      'P/E đã chia cho tốc độ tăng trưởng lợi nhuận, để so cổ phiếu tăng trưởng với nhau.',
    latex: 'PEG = \\frac{P/E}{g}',
    expression: 'PEG = P/E ÷ Tăng trưởng lợi nhuận kỳ vọng (%/năm)',
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['peg', 'tang truong', 'boi so', 'dinh gia', 'growth'],
    resultUnit: 'lần',
    variables: [
      numberVar('pe', 'P/E hiện tại', 'lần', 15.2, {
        min: 0,
        max: 1_000,
        description: 'Hệ số giá trên lợi nhuận — tính bằng công thức P/E của nhóm Chỉ số DN.',
      }),
      numberVar('growth', 'Tăng trưởng lợi nhuận kỳ vọng', '%/năm', 12, {
        min: -100,
        max: 200,
        description: 'Tốc độ tăng EPS dự kiến vài năm tới, nhập 12 nghĩa là 12%/năm.',
      }),
    ],
    explanation: {
      meaning:
        'P/E cao có xứng đáng hay không tuỳ vào tốc độ tăng lợi nhuận — PEG đưa hai thứ đó về một con số.',
      whenToUse:
        'So sánh các cổ phiếu tăng trưởng có P/E chênh nhau nhiều, khi P/E đứng một mình dễ kết luận nhầm là đắt.',
      howToRead:
        'Quanh 1 thường coi là hợp lý: P/E tương xứng tốc độ tăng trưởng. Dưới 1 gợi ý rẻ so với tăng trưởng, trên 2 là đắt trừ khi tăng trưởng rất chắc chắn.',
      commonMistakes:
        'Dùng con số tăng trưởng quá lạc quan — PEG nhạy với g hơn với P/E, dự phóng sai vài điểm phần trăm là kết luận đảo chiều.',
    },
    example: {
      title: 'P/E 15,2 lần, tăng trưởng kỳ vọng 12%/năm',
      inputs: { pe: 15.2, growth: 12 },
      expected: 1.27,
      note: 'Trên 1 một chút — định giá tương xứng với tốc độ tăng trưởng.',
    },
    tests: [
      {
        name: 'ca thường — P/E 15,2 và tăng trưởng 12%',
        inputs: { pe: 15.2, growth: 12 },
        expected: 1.27,
      },
      {
        name: 'tăng trưởng bằng 0 — chia cho 0, ca WF-15 của nhóm',
        inputs: { pe: 15.2, growth: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'tăng trưởng âm thì PEG vô nghĩa',
        inputs: { pe: 15.2, growth: -5 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'P/E bằng 0 thì không có gì để so với tăng trưởng',
        inputs: { pe: 0, growth: 12 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const pe = v('pe');
    const growth = v('growth');

    if (pe <= 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          'PEG cần một P/E dương — P/E bằng 0 hoặc âm nghĩa là chính P/E đang không dùng được.',
          'Tính lại P/E trước; doanh nghiệp đang lỗ thì dùng P/B hoặc P/S.',
        ),
      };
    }

    if (growth === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          'PEG',
          'Tăng trưởng lợi nhuận kỳ vọng',
          'PEG chỉ dành cho doanh nghiệp có tăng trưởng. Không tăng trưởng thì so thẳng P/E với ngành.',
        ),
      };
    }

    if (growth < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          'PEG không có ý nghĩa khi lợi nhuận dự kiến đi lùi — chia cho tăng trưởng âm cho ra số âm không diễn giải được.',
          'Với doanh nghiệp suy giảm, so thẳng P/E với ngành hoặc dùng P/B.',
        ),
      };
    }

    return ok(pe / growth, 'lần');
  },
};

/*
 * ── 6. Vốn hoá thị trường ──────────────────────────────────────────────────────────────
 */

export const VON_HOA: FormulaModule = {
  spec: {
    id: 'von-hoa-thi-truong',
    categoryId: 'valuation',
    name: { vi: 'Vốn hoá thị trường', en: 'Market capitalisation' },
    description: 'Tổng giá trị thị trường của toàn bộ cổ phiếu đang lưu hành.',
    latex: '\\text{Vốn hoá} = P \\times N',
    expression: 'Vốn hoá = Giá thị trường × Số cổ phiếu lưu hành',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['von hoa', 'market cap', 'quy mo', 'gia tri thi truong'],
    resultUnit: 'tỷ ₫',
    variables: [sharePrice, sharesOutstanding],
    explanation: {
      meaning: 'Số tiền cần có để mua hết cổ phiếu của doanh nghiệp theo giá thị trường hiện tại.',
      whenToUse:
        'Xếp cỡ doanh nghiệp — vốn hoá lớn, vừa, nhỏ — và làm đầu vào cho EV cùng các bội số so sánh.',
      howToRead:
        'Vốn hoá là giá thị trường gán cho phần vốn cổ đông, chưa tính nợ. Doanh nghiệp lớn thường biến động giá êm hơn doanh nghiệp vốn hoá nhỏ.',
      commonMistakes:
        'Nhầm vốn hoá với giá mua trọn doanh nghiệp — người mua còn phải gánh nợ vay, con số đó là EV.',
    },
    example: {
      title: 'Giá 92.000 ₫, 118 triệu cổ phiếu lưu hành',
      inputs: { price: 92_000, shares: 118 },
      expected: 10_856,
      note: 'Thuộc nhóm vốn hoá lớn trên sàn HOSE.',
    },
    tests: [
      {
        name: 'ca thường — giá 92.000 ₫ nhân 118 triệu CP',
        inputs: { price: 92_000, shares: 118 },
        expected: 10_856,
      },
      {
        name: 'giá 25.000 ₫ với 500 triệu CP',
        inputs: { price: 25_000, shares: 500 },
        expected: 12_500,
      },
      {
        name: 'số cổ phiếu bằng 0 thì không có gì để định giá, không trả 0',
        inputs: { price: 92_000, shares: 0 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const price = v('price');
    const shares = v('shares');

    if (shares <= 0) {
      return {
        value: null,
        unit: 'tỷ ₫',
        warning: meaningless(
          'Số cổ phiếu lưu hành bằng 0 nghĩa là chưa có doanh nghiệp để tính vốn hoá.',
          'Nhập số cổ phiếu đang lưu hành, xem ở báo cáo thường niên hoặc trang công bố thông tin.',
        ),
      };
    }

    if (price <= 0) {
      return {
        value: null,
        unit: 'tỷ ₫',
        warning: meaningless(
          'Giá thị trường bằng 0 thì vốn hoá không phản ánh giá trị nào.',
          'Nhập giá đóng cửa gần nhất của cổ phiếu.',
        ),
      };
    }

    // Giá (₫) × số CP (triệu) ra triệu ₫; chia 1.000 để về tỷ ₫.
    return ok((price * shares) / 1_000, 'tỷ ₫');
  },
};

/*
 * ── 7. Số Graham ───────────────────────────────────────────────────────────────────────
 */

export const SO_GRAHAM: FormulaModule = {
  spec: {
    id: 'so-graham',
    categoryId: 'valuation',
    name: { vi: 'Số Graham', en: 'Graham number' },
    description: 'Mức giá tối đa Benjamin Graham cho là hợp lý, dựa trên EPS và giá trị sổ sách.',
    latex: '\\text{Graham} = \\sqrt{22{,}5 \\times EPS \\times BVPS}',
    expression: 'Số Graham = Căn bậc hai của (22,5 × EPS × Giá trị sổ sách mỗi cổ phiếu)',
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['so graham', 'graham number', 'gia tri noi tai', 'dau tu gia tri', 'value investing'],
    resultUnit: '₫',
    variables: [
      numberVar('eps', 'EPS — lợi nhuận trên mỗi cổ phiếu', '₫', 6_050, {
        min: -1_000_000,
        max: 1_000_000,
        description: 'Lợi nhuận sau thuế chia cho số cổ phiếu đang lưu hành.',
      }),
      numberVar('bvps', 'Giá trị sổ sách / CP', '₫', 24_800, {
        min: -1_000_000,
        max: 10_000_000,
        description: 'Vốn chủ sở hữu chia cho số cổ phiếu đang lưu hành.',
      }),
    ],
    explanation: {
      meaning:
        'Trần giá gộp hai giới hạn Graham đặt ra — P/E không quá 15 và P/B không quá 1,5 (15 × 1,5 = 22,5).',
      whenToUse:
        'Sàng lọc nhanh cổ phiếu theo trường phái đầu tư giá trị cổ điển: giá dưới số Graham mới xem tiếp.',
      howToRead:
        'Giá thị trường thấp hơn số Graham gợi ý cổ phiếu chưa đắt theo chuẩn Graham. Đây là bộ lọc bảo thủ, dễ bỏ sót doanh nghiệp tăng trưởng nhanh.',
      commonMistakes:
        'Áp cho doanh nghiệp tăng trưởng hoặc công ty công nghệ ít tài sản hữu hình — chuẩn 22,5 sinh ra cho doanh nghiệp truyền thống ổn định.',
    },
    example: {
      title: 'EPS 6.050 ₫, giá trị sổ sách 24.800 ₫/CP',
      inputs: { eps: 6_050, bvps: 24_800 },
      expected: 58_102.5,
      note: 'Giá thị trường 92.000 ₫ đang cao hơn hẳn mức trần theo chuẩn Graham.',
    },
    tests: [
      {
        name: 'ca thường — EPS 6.050 ₫ và BVPS 24.800 ₫',
        inputs: { eps: 6_050, bvps: 24_800 },
        expected: 58_102.5,
        tolerance: 1,
      },
      {
        name: 'EPS 3.000 ₫ và BVPS 15.000 ₫',
        inputs: { eps: 3_000, bvps: 15_000 },
        expected: 31_819.81,
        tolerance: 1,
      },
      {
        name: 'doanh nghiệp lỗ thì không có số Graham',
        inputs: { eps: -1_200, bvps: 24_800 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'vốn chủ sở hữu âm cũng không tính được',
        inputs: { eps: 6_050, bvps: -5_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_INTELLIGENT_INVESTOR, SOURCE_SECURITY_ANALYSIS],
  },
  calc: (v) => {
    const eps = v('eps');
    const bvps = v('bvps');

    if (eps <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          'Số Graham cần EPS dương — doanh nghiệp đang lỗ hoặc không có lợi nhuận thì căn bậc hai không có nghĩa.',
          'Dùng NCAV trên cổ phiếu hoặc P/B để đánh giá doanh nghiệp đang lỗ.',
        ),
      };
    }

    if (bvps <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          'Số Graham cần giá trị sổ sách dương — vốn chủ sở hữu đang âm hoặc bằng 0.',
          'Xem lại bảng cân đối kế toán trước khi định giá theo trường phái giá trị.',
        ),
      };
    }

    return ok(Math.sqrt(22.5 * eps * bvps), '₫');
  },
};

/*
 * ── 8. NCAV trên cổ phiếu ──────────────────────────────────────────────────────────────
 */

export const NCAV: FormulaModule = {
  spec: {
    id: 'ncav-tren-co-phieu',
    categoryId: 'valuation',
    name: { vi: 'NCAV trên cổ phiếu', en: 'Net current asset value per share' },
    description: 'Giá trị tài sản ngắn hạn còn lại cho mỗi cổ phiếu sau khi trả hết mọi khoản nợ.',
    latex: 'NCAV = \\frac{\\text{TSNH} - \\text{Tổng nợ}}{N}',
    expression: 'NCAV mỗi cổ phiếu = (Tài sản ngắn hạn − Tổng nợ phải trả) ÷ Số cổ phiếu lưu hành',
    chartType: 'waterfall',
    /*
     * Chặng phải là số TRÊN MỖI CỔ PHIẾU, không phải tài sản và nợ thô.
     *
     * Công thức này có phép CHIA sau phép trừ, nên khai thẳng `currentAssets` và `totalLiabilities`
     * là hai cột đơn vị `tỷ ₫` cộng lại ra 2.200 trong khi kết quả là 18.644 `₫/CP` — lệch bốn chữ
     * số và lệch cả đơn vị. Bất biến "tổng các chặng bằng kết quả" bắt đúng ca này, nên hai số dưới
     * đây được chia sẵn ở `calc` rồi mới đưa lên hình.
     */
    breakdown: [
      { key: 'assetsPerShare', sign: 1, shortLabel: 'TSNH mỗi CP' },
      { key: 'liabilitiesPerShare', sign: -1, shortLabel: 'Trừ nợ mỗi CP' },
    ],
    breakdownTotal: 'NCAV',
    level: 'advanced',
    tags: ['ncav', 'net net', 'graham', 'tai san ngan han', 'dau tu gia tri'],
    resultUnit: '₫',
    variables: [
      numberVar('currentAssets', 'Tài sản ngắn hạn', 'tỷ ₫', 4_800, {
        min: 0,
        max: 10_000_000,
        description: 'Tiền, phải thu, hàng tồn kho — mục A trên bảng cân đối kế toán.',
      }),
      numberVar('totalLiabilities', 'Tổng nợ phải trả', 'tỷ ₫', 2_600, {
        min: 0,
        max: 10_000_000,
        description: 'Toàn bộ nợ ngắn hạn và dài hạn, không riêng nợ vay.',
      }),
      sharesOutstanding,
    ],
    explanation: {
      meaning:
        'Phép định giá bi quan nhất của Graham: coi tài sản dài hạn bằng 0, chỉ tính tài sản ngắn hạn trừ hết nợ.',
      whenToUse:
        'Săn cổ phiếu net-net — giá thị trường thấp hơn cả NCAV, tức mua rẻ hơn giá trị thanh lý dè dặt nhất.',
      howToRead:
        'Giá dưới NCAV là tín hiệu rẻ hiếm gặp, thường chỉ xuất hiện lúc thị trường hoảng loạn. NCAV âm là chuyện bình thường — chỉ nghĩa là doanh nghiệp không thuộc dạng net-net.',
      commonMistakes:
        'Quên rằng phải thu và hàng tồn kho có thể không thu hồi đủ giá trị sổ sách — Graham còn khuyên chỉ mua dưới hai phần ba NCAV.',
    },
    example: {
      title: 'Tài sản ngắn hạn 4.800 tỷ ₫, tổng nợ 2.600 tỷ ₫, 118 triệu CP',
      inputs: { currentAssets: 4_800, totalLiabilities: 2_600, shares: 118 },
      expected: 18_644.07,
      note: 'Giá thị trường dưới mức này mới được coi là cổ phiếu net-net.',
    },
    tests: [
      {
        name: 'ca thường — TSNH 4.800, nợ 2.600, 118 triệu CP',
        inputs: { currentAssets: 4_800, totalLiabilities: 2_600, shares: 118 },
        expected: 18_644.07,
        tolerance: 1,
      },
      {
        name: 'nợ vượt tài sản ngắn hạn thì NCAV âm — không phải net-net, vẫn là con số thật',
        inputs: { currentAssets: 1_000, totalLiabilities: 1_500, shares: 100 },
        expected: -5_000,
        tolerance: 1,
      },
      {
        name: 'số cổ phiếu bằng 0 — chia cho 0',
        inputs: { currentAssets: 4_800, totalLiabilities: 2_600, shares: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_SECURITY_ANALYSIS, SOURCE_INTELLIGENT_INVESTOR],
  },
  calc: (v) => {
    const shares = v('shares');

    if (shares <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: divideByZero(
          'NCAV trên cổ phiếu',
          'Số cổ phiếu lưu hành',
          'Nhập số cổ phiếu đang lưu hành lớn hơn 0.',
        ),
      };
    }

    // (tỷ ₫) ÷ (triệu CP) ra nghìn ₫/CP; nhân 1.000 để về ₫/CP.
    const assetsPerShare = (v('currentAssets') / shares) * 1_000;
    const liabilitiesPerShare = (v('totalLiabilities') / shares) * 1_000;

    return ok(assetsPerShare - liabilitiesPerShare, '₫', {
      extras: { assetsPerShare, liabilitiesPerShare },
    });
  },
};

/*
 * ── 9. Tỷ suất lợi nhuận trên giá ──────────────────────────────────────────────────────
 */

export const TY_SUAT_LOI_NHUAN_TREN_GIA: FormulaModule = {
  spec: {
    id: 'ty-suat-loi-nhuan-tren-gia',
    categoryId: 'valuation',
    name: { vi: 'Tỷ suất lợi nhuận trên giá', en: 'Earnings yield' },
    description:
      'Mỗi 100 đồng bỏ ra mua cổ phiếu đang tạo ra bao nhiêu đồng lợi nhuận — nghịch đảo của P/E.',
    latex: 'E/P = \\frac{EPS}{P} \\times 100\\%',
    expression: 'Tỷ suất lợi nhuận = EPS ÷ Giá thị trường × 100',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['earnings yield', 'ty suat loi nhuan', 'nghich dao pe', 'e p', 'so voi lai suat'],
    resultUnit: '%',
    variables: [
      numberVar('eps', 'EPS — lợi nhuận trên mỗi cổ phiếu', '₫', 6_050, {
        min: -1_000_000,
        max: 1_000_000,
        description: 'Lợi nhuận sau thuế chia cho số cổ phiếu đang lưu hành.',
      }),
      sharePrice,
    ],
    explanation: {
      meaning:
        'Đảo ngược P/E thành một tỷ suất phần trăm, để so trực tiếp cổ phiếu với lãi suất tiền gửi hay trái phiếu.',
      whenToUse:
        'Khi cân nhắc bỏ tiền vào cổ phiếu hay kênh lãi suất cố định — hai bên cùng một đơn vị phần trăm nên so được ngay.',
      howToRead:
        'Cao hơn lãi suất tiết kiệm đáng kể thì cổ phiếu đang cho suất sinh lời lợi nhuận hấp dẫn hơn gửi tiền — đổi lại rủi ro cao hơn hẳn.',
      commonMistakes:
        'Coi tỷ suất này là tiền thật về túi — doanh nghiệp thường chỉ chia một phần lợi nhuận làm cổ tức, phần còn lại giữ lại tái đầu tư.',
    },
    example: {
      title: 'EPS 6.050 ₫, giá 92.000 ₫',
      inputs: { eps: 6_050, price: 92_000 },
      expected: 6.58,
      note: 'Đúng bằng 1 chia cho P/E 15,2 lần của ví dụ WF-03.',
    },
    tests: [
      {
        name: 'ca thường — nghịch đảo ví dụ P/E của WF-03',
        inputs: { eps: 6_050, price: 92_000 },
        expected: 6.58,
      },
      {
        name: 'EPS 5.000 ₫ với giá 40.000 ₫ cho tỷ suất 12,5%',
        inputs: { eps: 5_000, price: 40_000 },
        expected: 12.5,
      },
      {
        name: 'giá bằng 0 — chia cho 0',
        inputs: { eps: 6_050, price: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'doanh nghiệp không có lãi thì tỷ suất vô nghĩa',
        inputs: { eps: -1_200, price: 92_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const price = v('price');
    const eps = v('eps');

    if (price === 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          'tỷ suất lợi nhuận trên giá',
          'Giá thị trường',
          'Nhập giá đóng cửa gần nhất của cổ phiếu.',
        ),
      };
    }

    if (eps <= 0) {
      return {
        value: null,
        unit: '%',
        warning: meaningless(
          'Tỷ suất lợi nhuận trên giá không có ý nghĩa khi doanh nghiệp không có lãi.',
          'Dùng P/B hoặc P/S để đánh giá doanh nghiệp đang lỗ.',
        ),
      };
    }

    return ok((eps / price) * 100, '%');
  },
};

/*
 * ── 10. Giá mục tiêu ───────────────────────────────────────────────────────────────────
 *
 * Cố ý ĐỘC LẬP, không phải một mắt xích của chuỗi FR-15: ứng viên cạnh duy nhất là
 * `pe → targetPe`, nhưng P/E hiện tại khác hẳn P/E mục tiêu về ý nghĩa — nối chúng bằng
 * `dependsOn` là dạy sai người dùng rằng hai con số đó là một. Xem `formulas/README.md`
 * mục "Còn thiếu".
 */

export const GIA_MUC_TIEU: FormulaModule = {
  spec: {
    id: 'gia-muc-tieu',
    categoryId: 'valuation',
    name: { vi: 'Giá mục tiêu', en: 'Target price' },
    description: 'Mức giá kỳ vọng nếu thị trường định giá cổ phiếu theo đúng P/E mục tiêu đã chọn.',
    latex: 'P_{\\text{mục tiêu}} = P/E_{\\text{mục tiêu}} \\times EPS',
    expression: 'Giá mục tiêu = P/E mục tiêu × EPS',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['gia muc tieu', 'target price', 'dinh gia', 'pe muc tieu'],
    resultUnit: '₫',
    variables: [
      numberVar('targetPe', 'P/E mục tiêu', 'lần', 15, {
        min: 0,
        max: 1_000,
        description: 'Bội số P/E kỳ vọng thị trường sẽ trả, ví dụ P/E trung bình ngành.',
      }),
      numberVar('eps', 'EPS — lợi nhuận trên mỗi cổ phiếu', '₫', 6_050, {
        min: -1_000_000,
        max: 1_000_000,
        description: 'Lợi nhuận sau thuế chia cho số cổ phiếu đang lưu hành.',
      }),
    ],
    explanation: {
      meaning:
        'Mức giá cổ phiếu sẽ có nếu thị trường định giá đúng theo một P/E mục tiêu do người dùng chọn, giữ nguyên EPS hiện tại.',
      whenToUse:
        'Khi ước tính điểm chốt lời hoặc so dư địa tăng giá với thị giá đang có, dựa trên kỳ vọng P/E sẽ đi về đâu.',
      howToRead:
        'Giá mục tiêu cao hơn thị giá hiện tại nghĩa là còn dư địa tăng NẾU P/E mục tiêu thành hiện thực — đây là một kịch bản, không phải một lời hứa.',
      commonMistakes:
        'Lấy P/E mục tiêu từ một doanh nghiệp khác ngành, hoặc quên rằng giá mục tiêu tính trên EPS HIỆN TẠI — EPS có thể đổi trước khi P/E kịp đạt mức mục tiêu.',
    },
    example: {
      title: 'EPS 6.050 ₫, P/E mục tiêu 18 lần',
      inputs: { eps: 6_050, targetPe: 18 },
      expected: 108_900,
      note: 'Cao hơn thị giá 92.000 ₫ của ví dụ WF-03 — dư địa tăng nếu P/E đạt đúng mức mục tiêu.',
    },
    tests: [
      {
        name: 'ca thường — EPS 6.050 ₫ với P/E mục tiêu 18 lần',
        inputs: { eps: 6_050, targetPe: 18 },
        expected: 108_900,
      },
      {
        name: 'P/E mục tiêu thấp hơn P/E hiện tại thì giá mục tiêu thấp hơn thị giá',
        inputs: { eps: 6_050, targetPe: 10 },
        expected: 60_500,
      },
      {
        name: 'doanh nghiệp đang lỗ thì không có giá mục tiêu theo P/E',
        inputs: { eps: -1_200, targetPe: 15 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'P/E mục tiêu bằng 0 hoặc âm không phải một kỳ vọng hợp lý',
        inputs: { eps: 6_050, targetPe: 0 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const eps = v('eps');
    const targetPe = v('targetPe');

    if (eps <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          'Giá mục tiêu cần EPS dương — nhân P/E mục tiêu với lợi nhuận âm hoặc bằng 0 không cho ra một mức giá có nghĩa.',
          'Dùng Số Graham hoặc NCAV trên cổ phiếu để định giá doanh nghiệp đang lỗ.',
        ),
      };
    }

    if (targetPe <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          'P/E mục tiêu phải dương — một mức bội số bằng 0 hoặc âm không phải là kỳ vọng định giá hợp lý.',
          'Nhập một P/E mục tiêu dương, ví dụ P/E trung bình ngành hoặc P/E lịch sử của chính cổ phiếu.',
        ),
      };
    }

    return ok(targetPe * eps, '₫');
  },
};

/** Mười công thức bội số & so sánh của nhóm Định giá. */
export const VALUATION_MULTIPLE_FORMULAS: ReadonlyArray<FormulaModule> = [
  PS,
  EV,
  EV_EBITDA,
  EV_SALES,
  PEG,
  VON_HOA,
  SO_GRAHAM,
  NCAV,
  TY_SUAT_LOI_NHUAN_TREN_GIA,
  GIA_MUC_TIEU,
];
