/**
 * Tầng DOMAIN — nhóm Định giá, nửa chiết khấu dòng tiền (một phần gói WBS 5.2.3).
 *
 * Mười công thức: Gordon (DDM một giai đoạn) · DDM hai giai đoạn · CAPM · WACC ·
 * FCFF từ EBIT · FCFE từ FCFF · giá trị nội tại từ FCFF · PV · FV · biên an toàn. Đây là các mắt xích vô hướng
 * của chuỗi định giá CAPM → WACC → DCF → biên an toàn; phần cần chuỗi giá (Beta hồi quy)
 * chờ gói 3.3.2, nên beta ở CAPM là ô nhập tay.
 *
 * ── Bốn cạnh `dependsOn` của cả Registry đều nằm trong file này (FR-15, gói 5.2.3) ──────────
 *
 *   capm ──► mo-hinh-gordon.requiredReturn ──► bien-an-toan.intrinsic
 *   capm ──► wacc.costEquity ──► gia-tri-noi-tai-fcff.wacc ◄── fcff.fcff  ·  fcff ──► fcfe.fcff
 *
 * Hai nhánh, `runChain()` chạy thật cả hai. Nhánh dưới hội tụ: `gia-tri-noi-tai-fcff` nhận từ
 * HAI công thức khác nhau vào HAI biến khác nhau — đó là hình thoi, không phải hai nguồn cho
 * cùng một ô (trường hợp ấy `runChain()` cũng xử được, xem docblock của nó).
 *
 * Đơn vị hai đầu mỗi cạnh phải khớp nhau; `formulas.test.ts` gác điều đó cho cả bốn cạnh.
 *
 * Thuế suất TNDN trong WACC và FCFF là Ô NHẬP chứ không tra MarketConfig: biểu phí
 * hiện hành (`market/schedules.ts`) chưa có key thuế TNDN, và mức thuế thực nộp của
 * từng doanh nghiệp vốn khác mức phổ thông (ưu đãi, chuyển lỗ). Giá trị mặc định chỉ
 * là số khởi tạo người dùng sửa được, không phải hằng số viết vào thân hàm (LDR-03).
 *
 * Nhánh lỗi kinh điển của DDM: r < g thì mẫu số r − g âm, giá tính ra âm — đó là kết quả
 * VÔ NGHĨA (meaningless) chứ không phải chia cho 0; chỉ khi r đúng bằng g mới là chia cho 0.
 *
 * Số kiểm chứng tính độc lập bằng script dạng đóng (node -e) trước khi chép vào tests[],
 * theo đúng luật của README thư viện công thức.
 */

import { fail, ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import type { FormulaSource } from '../registry/types';
import { divideByZero, meaningless } from '../warnings';
import { SOURCE_CFA, SOURCE_CORPORATE_FINANCE, numberVar, sliderVar } from './shared';

/*
 * ── Nguồn dùng riêng cho nhóm này (FR-04) ──────────────────────────────────────────────
 */

const SOURCE_DAMODARAN_DDM: FormulaSource = {
  label:
    'Aswath Damodaran — Investment Valuation, ấn bản 3 (Wiley, 2012), chương 13: Dividend Discount Models',
};

const SOURCE_DAMODARAN_FCF: FormulaSource = {
  label:
    'Aswath Damodaran — Investment Valuation, ấn bản 3 (Wiley, 2012), chương 14–15: các mô hình dòng tiền tự do',
};

const SOURCE_DAMODARAN_COC: FormulaSource = {
  label:
    'Aswath Damodaran — Investment Valuation, ấn bản 3 (Wiley, 2012), chương 7–8: lãi suất phi rủi ro, phần bù rủi ro và chi phí vốn',
};

const SOURCE_GRAHAM: FormulaSource = {
  label:
    'Benjamin Graham — The Intelligent Investor, bản hiệu đính 2003 (HarperBusiness), chương 20: Margin of Safety',
};

/*
 * ── 1. Mô hình Gordon — DDM một giai đoạn ──────────────────────────────────────────────
 */

export const MO_HINH_GORDON: FormulaModule = {
  spec: {
    id: 'mo-hinh-gordon',
    categoryId: 'valuation',
    name: { vi: 'Mô hình Gordon (DDM một giai đoạn)', en: 'Gordon growth model' },
    description: 'Giá trị cổ phiếu từ dòng cổ tức tăng trưởng đều mãi mãi, chiết khấu về hiện tại.',
    latex: 'V_0 = \\frac{D_0 (1 + g)}{r - g}',
    expression: 'Giá trị cổ phiếu = Cổ tức vừa trả × (1 + g) ÷ (r − g)',
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['gordon', 'ddm', 'chiet khau co tuc', 'dinh gia co tuc', 'dividend discount'],
    resultUnit: '₫',
    variables: [
      numberVar('dividend', 'Cổ tức vừa trả (D0)', '₫', 2_000, {
        min: 0,
        max: 100_000,
        description: 'Cổ tức tiền mặt trên mỗi cổ phiếu trong 12 tháng gần nhất.',
      }),
      sliderVar('growth', 'Tăng trưởng cổ tức dài hạn (g)', '%', 5, -5, 15, 0.1, {
        description: 'Tốc độ tăng cổ tức đều đặn mãi mãi — nên thấp hơn tăng trưởng GDP dài hạn.',
      }),
      sliderVar('requiredReturn', 'Suất sinh lợi yêu cầu (r)', '%', 12, 0, 30, 0.1, {
        description: 'Mức sinh lợi tối thiểu để chấp nhận nắm giữ — thường lấy từ CAPM.',
      }),
    ],
    explanation: {
      meaning:
        'Toàn bộ cổ tức tương lai, giả định tăng đều mãi mãi, đáng giá bao nhiêu tiền ở hôm nay.',
      whenToUse:
        'Với doanh nghiệp trả cổ tức ổn định và tăng trưởng chậm, đều — điện, nước, hàng tiêu dùng thiết yếu.',
      howToRead:
        'Giá trị tính ra cao hơn thị giá nghĩa là cổ phiếu đang rẻ theo mô hình. Kết quả rất nhạy với hiệu r − g nên hãy thử vài kịch bản.',
      commonMistakes:
        'Chọn g cao gần bằng r làm giá trị phóng đại vô lý — không doanh nghiệp nào tăng cổ tức nhanh hơn nền kinh tế mãi mãi.',
    },
    example: {
      title: 'Cổ tức 2.000 ₫/CP, tăng 5%/năm, suất sinh lợi yêu cầu 12%',
      inputs: { dividend: 2_000, growth: 5, requiredReturn: 12 },
      expected: 30_000,
      note: 'Thị giá thấp hơn 30.000 ₫ thì cổ phiếu đang rẻ theo mô hình này.',
    },
    tests: [
      {
        name: 'ca thường — 2.000 ₫, g 5%, r 12%',
        inputs: { dividend: 2_000, growth: 5, requiredReturn: 12 },
        expected: 30_000,
      },
      {
        name: 'r đúng bằng g thì mẫu số r − g bằng 0',
        inputs: { dividend: 2_000, growth: 10, requiredReturn: 10 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'r nhỏ hơn g thì giá trị âm vô nghĩa, không phải chia cho 0',
        inputs: { dividend: 2_000, growth: 10, requiredReturn: 8 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_DAMODARAN_DDM, SOURCE_CFA],
    /*
     * Mắt xích giữa của chuỗi định giá (gói 5.2.3).
     *
     * Suất sinh lợi yêu cầu r CHÍNH LÀ chi phí vốn chủ sở hữu — cùng một đại lượng, hai cái tên
     * theo hai giáo trình; chính mô tả của ô cũng ghi "thường lấy từ CAPM". Cạnh này biến câu ấy
     * từ lời khuyên đọc bằng mắt thành đường dẫn số liệu chạy thật.
     *
     * Đơn vị hai đầu đều là '%', và mặc định của CAPM (3,5 + 1,2 × 8 = 13,1%) nằm gọn trong miền
     * [0…30] của thanh trượt này — có ca kiểm chốt cả hai điều đó.
     */
    dependsOn: [{ formulaId: 'capm', variableKey: 'requiredReturn' }],
  },
  calc: (v) => {
    const r = v('requiredReturn');
    const g = v('growth');

    if (r === g) {
      return fail(
        '₫',
        divideByZero(
          'giá trị cổ phiếu',
          'hiệu r − g',
          'Nhập suất sinh lợi yêu cầu r lớn hơn tăng trưởng g.',
        ),
      );
    }

    if (r < g) {
      return fail(
        '₫',
        meaningless(
          'Mô hình Gordon chỉ dùng được khi suất sinh lợi yêu cầu r lớn hơn tăng trưởng g — r nhỏ hơn g cho ra giá trị âm vô nghĩa.',
          'Giảm g về mức bền vững dài hạn, hoặc dùng DDM hai giai đoạn cho thời kỳ tăng trưởng nhanh.',
        ),
      );
    }

    return ok((v('dividend') * (1 + g / 100)) / ((r - g) / 100), '₫');
  },
};

/*
 * ── 2. DDM hai giai đoạn ───────────────────────────────────────────────────────────────
 */

export const DDM_HAI_GIAI_DOAN: FormulaModule = {
  spec: {
    id: 'ddm-hai-giai-doan',
    categoryId: 'valuation',
    name: { vi: 'DDM hai giai đoạn', en: 'Two-stage dividend discount model' },
    description:
      'Giá trị cổ phiếu khi cổ tức tăng nhanh vài năm đầu rồi chuyển về tăng trưởng đều dài hạn.',
    latex:
      'V_0 = \\sum_{t=1}^{n} \\frac{D_0 (1+g_1)^t}{(1+r)^t} + \\frac{D_0 (1+g_1)^n (1+g_2)}{(r - g_2)(1+r)^n}',
    expression:
      'Giá trị cổ phiếu = Tổng cổ tức giai đoạn đầu chiết khấu về hiện tại + Giá trị cuối kỳ chiết khấu về hiện tại',
    chartType: 'stackedBar',
    breakdown: [
      { key: 'pvStage1', sign: 1, shortLabel: 'Cổ tức giai đoạn đầu' },
      { key: 'pvTerminal', sign: 1, shortLabel: 'Giá trị cuối kỳ' },
    ],
    breakdownTotal: 'Giá trị cổ phiếu',
    level: 'advanced',
    tags: ['ddm hai giai doan', 'two stage ddm', 'chiet khau co tuc', 'tang truong hai giai doan'],
    resultUnit: '₫',
    variables: [
      numberVar('dividend', 'Cổ tức vừa trả (D0)', '₫', 2_000, {
        min: 0,
        max: 100_000,
        description: 'Cổ tức tiền mặt trên mỗi cổ phiếu trong 12 tháng gần nhất.',
      }),
      sliderVar('growthStage1', 'Tăng trưởng giai đoạn đầu (g1)', '%', 15, 0, 30, 0.5, {
        description: 'Tốc độ tăng cổ tức trong những năm tăng trưởng nhanh.',
      }),
      sliderVar('years', 'Số năm giai đoạn đầu', 'năm', 5, 1, 20, 1, {
        description: 'Doanh nghiệp giữ được tăng trưởng nhanh trong bao nhiêu năm.',
      }),
      sliderVar('growthTerminal', 'Tăng trưởng dài hạn (g2)', '%', 4, 0, 10, 0.1, {
        description: 'Tốc độ tăng đều mãi mãi sau giai đoạn đầu — nên quanh tăng trưởng GDP.',
      }),
      sliderVar('requiredReturn', 'Suất sinh lợi yêu cầu (r)', '%', 12, 0, 30, 0.1, {
        description: 'Mức sinh lợi tối thiểu để chấp nhận nắm giữ — thường lấy từ CAPM.',
      }),
    ],
    explanation: {
      meaning:
        'Tách đời doanh nghiệp làm hai khúc — tăng nhanh rồi ổn định — và cộng giá trị hiện tại của cổ tức cả hai khúc.',
      whenToUse:
        'Với doanh nghiệp đang tăng trưởng nhanh hơn mức bền vững, điều mô hình Gordon một giai đoạn không tả được.',
      howToRead:
        'Phần lớn giá trị thường nằm ở giá trị cuối kỳ, nên g2 và r mới là hai con số đáng soi kỹ nhất.',
      commonMistakes:
        'Để g2 cao gần bằng r khiến giá trị cuối kỳ phồng lên vô lý, hoặc kéo giai đoạn tăng nhanh dài quá mức doanh nghiệp giữ được.',
    },
    example: {
      title: 'Cổ tức 2.000 ₫, tăng 15% trong 5 năm rồi 4% mãi mãi, r 12%',
      inputs: {
        dividend: 2_000,
        growthStage1: 15,
        years: 5,
        growthTerminal: 4,
        requiredReturn: 12,
      },
      expected: 40_506.6,
      note: 'Riêng giá trị cuối kỳ chiết khấu đã chiếm khoảng 29.674 ₫ trong tổng số.',
    },
    tests: [
      {
        // Tính tay từng dòng chiết khấu: 2.053,57 + 2.108,58 + 2.165,06 + 2.223,05
        // + 2.282,60 + 29.673,75 = 40.506,60.
        name: 'ca thường — tăng 15% trong 5 năm rồi 4% mãi mãi',
        inputs: {
          dividend: 2_000,
          growthStage1: 15,
          years: 5,
          growthTerminal: 4,
          requiredReturn: 12,
        },
        expected: 40_506.6,
      },
      {
        name: 'g1 bằng g2 thì trùng kết quả mô hình Gordon một giai đoạn',
        inputs: {
          dividend: 3_000,
          growthStage1: 4,
          years: 3,
          growthTerminal: 4,
          requiredReturn: 12,
        },
        expected: 39_000,
      },
      {
        name: 'r nhỏ hơn g2 thì giá trị cuối kỳ âm vô nghĩa',
        inputs: {
          dividend: 2_000,
          growthStage1: 15,
          years: 5,
          growthTerminal: 10,
          requiredReturn: 8,
        },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'r đúng bằng g2 thì mẫu số r − g2 bằng 0',
        inputs: {
          dividend: 2_000,
          growthStage1: 15,
          years: 5,
          growthTerminal: 12,
          requiredReturn: 12,
        },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_DAMODARAN_DDM, SOURCE_CFA],
  },
  calc: (v) => {
    const r = v('requiredReturn');
    const g2 = v('growthTerminal');

    if (r === g2) {
      return fail(
        '₫',
        divideByZero(
          'giá trị cổ phiếu',
          'hiệu r − g2',
          'Nhập suất sinh lợi yêu cầu r lớn hơn tăng trưởng dài hạn g2.',
        ),
      );
    }

    if (r < g2) {
      return fail(
        '₫',
        meaningless(
          'Giá trị cuối kỳ chỉ có nghĩa khi suất sinh lợi yêu cầu r lớn hơn tăng trưởng dài hạn g2 — r nhỏ hơn g2 cho ra giá trị âm.',
          'Giảm g2 về mức bền vững dài hạn (thường quanh tăng trưởng GDP) hoặc nâng r.',
        ),
      );
    }

    const i = r / 100;
    const g1 = v('growthStage1') / 100;
    const n = Math.round(v('years'));

    let dividend = v('dividend');
    let pvStage1 = 0;
    for (let t = 1; t <= n; t += 1) {
      dividend *= 1 + g1;
      pvStage1 += dividend / Math.pow(1 + i, t);
    }

    const terminal = (dividend * (1 + g2 / 100)) / ((r - g2) / 100);
    const pvTerminal = terminal / Math.pow(1 + i, n);

    /*
     * Hai cấu phần tách riêng cho biểu đồ bóc tách. Đây là con số đáng nói nhất của mô hình: ở bộ
     * số mặc định, giá trị cuối kỳ chiếm khoảng bốn phần năm giá trị cổ phiếu — tức phần lớn định
     * giá nằm ở giả định tăng trưởng dài hạn chứ không nằm ở mấy năm tăng nhanh mà người dùng vừa
     * ngồi ước lượng kỹ.
     */
    return ok(pvStage1 + pvTerminal, '₫', { extras: { pvStage1, pvTerminal } });
  },
};

/*
 * ── 3. CAPM — chi phí vốn chủ sở hữu ───────────────────────────────────────────────────
 * Chỉ biến vô hướng: beta nhập tay, KHÔNG đọc chuỗi giá (beta hồi quy chờ gói 3.3.2).
 */

export const CAPM: FormulaModule = {
  spec: {
    id: 'capm',
    categoryId: 'valuation',
    name: { vi: 'CAPM — chi phí vốn chủ sở hữu', en: 'Capital asset pricing model' },
    description: 'Suất sinh lợi yêu cầu của cổ đông, tính từ lãi suất phi rủi ro và hệ số beta.',
    latex: 'r_e = r_f + \\beta \\times ERP',
    expression: 'Chi phí vốn chủ = Lãi suất phi rủi ro + Beta × Phần bù rủi ro thị trường',
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['capm', 'chi phi von chu', 'beta', 'phan bu rui ro', 'cost of equity'],
    resultUnit: '%',
    variables: [
      sliderVar('riskFree', 'Lãi suất phi rủi ro (Rf)', '%', 3.5, 0, 10, 0.1, {
        description: 'Thường lấy lợi suất trái phiếu Chính phủ kỳ hạn 10 năm.',
      }),
      numberVar('beta', 'Hệ số beta (β)', 'lần', 1.2, {
        min: -3,
        max: 4,
        description: 'Độ nhạy của cổ phiếu so với thị trường, nhập tay từ nguồn dữ liệu bên ngoài.',
      }),
      sliderVar('erp', 'Phần bù rủi ro thị trường (ERP)', '%', 8, 0, 15, 0.1, {
        description: 'Mức sinh lợi kỳ vọng của thị trường cổ phiếu vượt trên lãi suất phi rủi ro.',
      }),
    ],
    explanation: {
      meaning:
        'Nắm cổ phiếu rủi ro hơn gửi tiết kiệm thì phải đòi hỏi mức sinh lợi cao hơn bấy nhiêu — CAPM lượng hoá con số đó qua beta.',
      whenToUse:
        'Khi cần suất chiết khấu cho các mô hình định giá (Gordon, DDM, DCF) hoặc phần vốn chủ trong WACC.',
      howToRead:
        'Beta 1 cho ra đúng mức sinh lợi kỳ vọng của thị trường; beta càng cao thì suất sinh lợi yêu cầu càng lớn — tức chiết khấu càng mạnh.',
      commonMistakes:
        'Lấy beta của thị trường khác áp cho cổ phiếu Việt Nam, hoặc quên rằng beta quá khứ không chắc lặp lại trong tương lai.',
    },
    example: {
      title: 'Rf 3,5%, beta 1,2, phần bù rủi ro 8%',
      inputs: { riskFree: 3.5, beta: 1.2, erp: 8 },
      expected: 13.1,
      note: 'Đây chính là chi phí vốn chủ đưa vào WACC hoặc làm r cho mô hình cổ tức.',
    },
    tests: [
      {
        name: 'ca thường — 3,5 + 1,2 × 8',
        inputs: { riskFree: 3.5, beta: 1.2, erp: 8 },
        expected: 13.1,
      },
      {
        name: 'beta 0 thì chi phí vốn chủ đúng bằng lãi suất phi rủi ro',
        inputs: { riskFree: 3.5, beta: 0, erp: 8 },
        expected: 3.5,
      },
      {
        name: 'beta âm sâu kéo suất sinh lợi yêu cầu xuống dưới 0 — vô nghĩa',
        inputs: { riskFree: 2, beta: -1.5, erp: 8 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_DAMODARAN_COC, SOURCE_CFA],
  },
  calc: (v) => {
    const costOfEquity = v('riskFree') + v('beta') * v('erp');

    if (costOfEquity < 0) {
      return fail(
        '%',
        meaningless(
          'Chi phí vốn chủ tính ra âm — beta âm sâu kéo suất sinh lợi yêu cầu xuống dưới 0, không dùng làm suất chiết khấu được.',
          'Kiểm tra lại hệ số beta; cổ phiếu thường có beta trong khoảng 0,5–1,5.',
        ),
      );
    }

    return ok(costOfEquity, '%');
  },
};

/*
 * ── 4. WACC — chi phí vốn bình quân gia quyền ──────────────────────────────────────────
 */

export const WACC: FormulaModule = {
  spec: {
    id: 'wacc',
    categoryId: 'valuation',
    name: { vi: 'WACC — chi phí vốn bình quân gia quyền', en: 'Weighted average cost of capital' },
    description:
      'Chi phí huy động một đồng vốn của doanh nghiệp, trộn giữa vốn chủ và nợ vay sau lá chắn thuế.',
    latex: 'WACC = \\frac{E}{E+D} \\, r_e + \\frac{D}{E+D} \\, r_d \\, (1 - t)',
    expression:
      'WACC = Tỷ trọng vốn chủ × Chi phí vốn chủ + Tỷ trọng nợ × Chi phí nợ × (1 − Thuế suất)',
    chartType: 'stackedBar',
    /* Đúng hai vế của chính công thức, nên cộng lại ra đúng WACC — không cần xử lý gì thêm. */
    breakdown: [
      { key: 'equityPart', sign: 1, shortLabel: 'Phần vốn chủ' },
      { key: 'debtPart', sign: 1, shortLabel: 'Phần nợ vay' },
    ],
    level: 'advanced',
    tags: ['wacc', 'chi phi von binh quan', 'co cau von', 'la chan thue', 'cost of capital'],
    resultUnit: '%',
    variables: [
      numberVar('equity', 'Vốn chủ sở hữu (E)', 'tỷ ₫', 600, {
        min: 0,
        max: 10_000_000,
        description: 'Giá trị thị trường của vốn chủ — với công ty niêm yết là vốn hoá.',
      }),
      numberVar('debt', 'Nợ vay (D)', 'tỷ ₫', 400, {
        min: 0,
        max: 10_000_000,
        description: 'Tổng nợ vay ngắn hạn và dài hạn chịu lãi.',
      }),
      sliderVar('costEquity', 'Chi phí vốn chủ (Re)', '%', 13.1, 0, 30, 0.1, {
        description: 'Suất sinh lợi cổ đông yêu cầu — thường lấy từ CAPM.',
      }),
      sliderVar('costDebt', 'Chi phí nợ vay (Rd)', '%', 9, 0, 25, 0.1, {
        description: 'Lãi suất vay bình quân doanh nghiệp đang chịu.',
      }),
      sliderVar('taxRate', 'Thuế suất thuế TNDN', '%', 20, 0, 50, 0.5, {
        description: 'Thuế suất thực nộp của doanh nghiệp; lãi vay được khấu trừ thuế.',
      }),
    ],
    explanation: {
      meaning:
        'Mỗi đồng vốn doanh nghiệp dùng có giá bao nhiêu, khi trộn vốn cổ đông đắt hơn với nợ vay rẻ hơn nhờ được khấu trừ thuế.',
      whenToUse:
        'Làm suất chiết khấu cho FCFF trong định giá DCF toàn doanh nghiệp, hoặc làm ngưỡng sàng lọc dự án đầu tư.',
      howToRead:
        'Dự án chỉ tạo giá trị khi sinh lợi vượt WACC. Nợ vay nhiều làm WACC thấp đi nhưng rủi ro tài chính tăng lên — con số này không phản ánh vế rủi ro đó.',
      commonMistakes:
        'Lấy giá trị sổ sách của vốn chủ thay vì vốn hoá thị trường, hoặc quên nhân chi phí nợ với (1 − thuế suất).',
    },
    example: {
      title: 'Vốn chủ 600 tỷ, nợ 400 tỷ, Re 13,1%, Rd 9%, thuế 20%',
      inputs: { equity: 600, debt: 400, costEquity: 13.1, costDebt: 9, taxRate: 20 },
      expected: 10.74,
      note: '0,6 × 13,1% + 0,4 × 9% × 0,8 = 10,74%.',
    },
    tests: [
      {
        name: 'ca thường — 60% vốn chủ, 40% nợ',
        inputs: { equity: 600, debt: 400, costEquity: 13.1, costDebt: 9, taxRate: 20 },
        expected: 10.74,
      },
      {
        name: 'toàn vốn chủ thì WACC đúng bằng chi phí vốn chủ',
        inputs: { equity: 100, debt: 0, costEquity: 13.1, costDebt: 9, taxRate: 20 },
        expected: 13.1,
      },
      {
        name: 'không có đồng vốn nào thì mẫu số E + D bằng 0',
        inputs: { equity: 0, debt: 0, costEquity: 13.1, costDebt: 9, taxRate: 20 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE, SOURCE_CFA],
    dependsOn: [{ formulaId: 'capm', variableKey: 'costEquity' }],
  },
  calc: (v) => {
    const equity = v('equity');
    const debt = v('debt');
    const total = equity + debt;

    if (total === 0) {
      return fail(
        '%',
        divideByZero('WACC', 'tổng nguồn vốn E + D', 'Nhập vốn chủ sở hữu hoặc nợ vay lớn hơn 0.'),
      );
    }

    if (equity < 0 || debt < 0) {
      return fail(
        '%',
        meaningless(
          'Vốn chủ sở hữu hoặc nợ vay âm làm tỷ trọng vốn mất ý nghĩa.',
          'Nhập cả hai cấu phần vốn từ 0 trở lên.',
        ),
      );
    }

    const equityPart = (equity / total) * v('costEquity');
    const debtPart = (debt / total) * v('costDebt') * (1 - v('taxRate') / 100);

    return ok(equityPart + debtPart, '%', { extras: { equityPart, debtPart } });
  },
};

/*
 * ── 5. FCFF từ EBIT ────────────────────────────────────────────────────────────────────
 */

export const FCFF: FormulaModule = {
  spec: {
    id: 'fcff',
    categoryId: 'valuation',
    name: { vi: 'FCFF — dòng tiền tự do của doanh nghiệp', en: 'Free cash flow to firm' },
    description:
      'Tiền còn lại cho cả chủ nợ lẫn cổ đông sau thuế và sau khi tái đầu tư, tính từ EBIT.',
    latex: 'FCFF = EBIT \\, (1 - t) + Dep - CapEx - \\Delta NWC',
    expression: 'FCFF = EBIT × (1 − Thuế suất) + Khấu hao − Chi đầu tư − Tăng vốn lưu động ròng',
    /*
     * Bốn chặng đúng bằng bốn số hạng của công thức. `nwcChange` âm (vốn lưu động GIẢM, tức giải
     * phóng tiền) thì dấu `-1` biến nó thành cột cộng — đúng về toán và đúng về nghĩa, tiền quay
     * về doanh nghiệp thật.
     */
    breakdown: [
      { key: 'ebitAfterTax', sign: 1, shortLabel: 'EBIT sau thuế' },
      { key: 'depreciation', sign: 1, shortLabel: 'Khấu hao' },
      { key: 'capex', sign: -1, shortLabel: 'Chi đầu tư' },
      { key: 'nwcChange', sign: -1, shortLabel: 'Tăng VLĐ ròng' },
    ],
    chartType: 'waterfall',
    level: 'advanced',
    tags: ['fcff', 'dong tien tu do', 'ebit', 'dcf', 'free cash flow'],
    resultUnit: 'tỷ ₫',
    variables: [
      numberVar('ebit', 'Lợi nhuận trước lãi vay và thuế (EBIT)', 'tỷ ₫', 500, {
        min: -1_000_000,
        max: 10_000_000,
        description: 'Lợi nhuận từ hoạt động kinh doanh, chưa trừ chi phí lãi vay và thuế.',
      }),
      sliderVar('taxRate', 'Thuế suất thuế TNDN', '%', 20, 0, 50, 0.5, {
        description: 'Thuế suất thực nộp của doanh nghiệp.',
      }),
      numberVar('depreciation', 'Khấu hao', 'tỷ ₫', 120, {
        min: 0,
        max: 10_000_000,
        description: 'Chi phí không bằng tiền, cộng ngược lại vào dòng tiền.',
      }),
      numberVar('capex', 'Chi đầu tư tài sản cố định (CapEx)', 'tỷ ₫', 180, {
        min: 0,
        max: 10_000_000,
        description: 'Tiền chi mua sắm, xây dựng tài sản cố định trong kỳ.',
      }),
      numberVar('nwcChange', 'Tăng vốn lưu động ròng (ΔNWC)', 'tỷ ₫', 40, {
        min: -1_000_000,
        max: 1_000_000,
        description: 'Âm nghĩa là vốn lưu động giảm, dòng tiền được cộng thêm.',
      }),
    ],
    explanation: {
      meaning:
        'Số tiền doanh nghiệp thực sự tạo ra trong kỳ cho tất cả người góp vốn, sau khi đã nộp thuế và tái đầu tư để duy trì hoạt động.',
      whenToUse:
        'Làm dòng tiền gốc cho định giá DCF toàn doanh nghiệp, chiết khấu bằng WACC ra giá trị doanh nghiệp.',
      howToRead:
        'FCFF âm không hẳn là xấu — doanh nghiệp đang tăng trưởng có thể chi đầu tư lớn hơn dòng tiền tạo ra; điều cần xem là nó âm vì đầu tư hay vì kinh doanh yếu.',
      commonMistakes:
        'Lấy lợi nhuận sau thuế thay cho EBIT × (1 − t) — làm vậy đã trừ lãi vay một lần rồi lại chiết khấu bằng WACC vốn đã chứa chi phí nợ, thành trừ hai lần.',
    },
    example: {
      title: 'EBIT 500 tỷ, thuế 20%, khấu hao 120 tỷ, CapEx 180 tỷ, ΔNWC 40 tỷ',
      inputs: { ebit: 500, taxRate: 20, depreciation: 120, capex: 180, nwcChange: 40 },
      expected: 300,
      note: '500 × 0,8 + 120 − 180 − 40 = 300 tỷ ₫.',
    },
    tests: [
      {
        name: 'ca thường — 500 × 0,8 + 120 − 180 − 40',
        inputs: { ebit: 500, taxRate: 20, depreciation: 120, capex: 180, nwcChange: 40 },
        expected: 300,
      },
      {
        name: 'tái đầu tư đúng bằng khấu hao thì FCFF bằng EBIT sau thuế',
        inputs: { ebit: 200, taxRate: 20, depreciation: 50, capex: 50, nwcChange: 0 },
        expected: 160,
      },
      {
        name: 'EBIT âm thì phần thuế trong công thức mất ý nghĩa',
        inputs: { ebit: -100, taxRate: 20, depreciation: 120, capex: 180, nwcChange: 40 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_DAMODARAN_FCF, SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => {
    const ebit = v('ebit');

    if (ebit < 0) {
      return fail(
        'tỷ ₫',
        meaningless(
          'EBIT âm làm khoản EBIT × (1 − thuế suất) hàm ý một khoản hoàn thuế không có thật, kết quả mất ý nghĩa.',
          'Dùng kỳ có EBIT dương, hoặc ước tính FCFF từ dòng tiền hoạt động trên báo cáo lưu chuyển tiền tệ.',
        ),
      );
    }

    const ebitAfterTax = ebit * (1 - v('taxRate') / 100);
    const value = ebitAfterTax + v('depreciation') - v('capex') - v('nwcChange');
    return ok(value, 'tỷ ₫', { extras: { ebitAfterTax } });
  },
};

/*
 * ── 6. FCFE từ FCFF ────────────────────────────────────────────────────────────────────
 */

export const FCFE: FormulaModule = {
  spec: {
    id: 'fcfe',
    categoryId: 'valuation',
    name: { vi: 'FCFE — dòng tiền tự do của cổ đông', en: 'Free cash flow to equity' },
    description:
      'Tiền còn lại riêng cho cổ đông sau khi trả lãi vay sau thuế và điều chỉnh vay nợ ròng.',
    latex: 'FCFE = FCFF - I \\, (1 - t) + \\Delta B',
    expression: 'FCFE = FCFF − Chi phí lãi vay × (1 − Thuế suất) + Vay ròng mới',
    chartType: 'waterfall',
    breakdown: [
      { key: 'fcff', sign: 1, shortLabel: 'FCFF' },
      { key: 'interestAfterTax', sign: -1, shortLabel: 'Lãi vay sau thuế' },
      { key: 'netBorrowing', sign: 1, shortLabel: 'Vay ròng mới' },
    ],
    level: 'advanced',
    tags: ['fcfe', 'dong tien tu do co dong', 'dcf', 'free cash flow to equity'],
    resultUnit: 'tỷ ₫',
    variables: [
      numberVar('fcff', 'Dòng tiền tự do của doanh nghiệp (FCFF)', 'tỷ ₫', 300, {
        min: -1_000_000,
        max: 10_000_000,
        description: 'Kết quả từ công thức FCFF, hoặc nhập tay nếu đã có sẵn.',
      }),
      numberVar('interest', 'Chi phí lãi vay', 'tỷ ₫', 60, {
        min: 0,
        max: 1_000_000,
        description: 'Tiền lãi phải trả cho chủ nợ trong kỳ.',
      }),
      sliderVar('taxRate', 'Thuế suất thuế TNDN', '%', 20, 0, 50, 0.5, {
        description: 'Lãi vay được khấu trừ thuế nên chỉ trừ phần sau thuế.',
      }),
      numberVar('netBorrowing', 'Vay ròng mới', 'tỷ ₫', 30, {
        min: -1_000_000,
        max: 1_000_000,
        description: 'Tiền vay mới trừ nợ gốc đã trả trong kỳ; âm nghĩa là trả nợ nhiều hơn vay.',
      }),
    ],
    explanation: {
      meaning:
        'Phần tiền cuối cùng thuộc về cổ đông sau khi chủ nợ đã nhận lãi và các khoản vay được vay thêm hay trả bớt.',
      whenToUse:
        'Làm dòng tiền gốc cho định giá DCF phần vốn chủ, chiết khấu bằng chi phí vốn chủ từ CAPM — thay cho DDM khi doanh nghiệp trả cổ tức ít hơn khả năng.',
      howToRead:
        'FCFE cao hơn cổ tức thực trả nghĩa là doanh nghiệp còn dư địa tăng cổ tức hoặc mua lại cổ phiếu; thấp hơn kéo dài thì mức cổ tức hiện tại khó giữ.',
      commonMistakes:
        'Chiết khấu FCFE bằng WACC — FCFE là dòng tiền của riêng cổ đông nên phải chiết khấu bằng chi phí vốn chủ.',
    },
    example: {
      title: 'FCFF 300 tỷ, lãi vay 60 tỷ, thuế 20%, vay ròng thêm 30 tỷ',
      inputs: { fcff: 300, interest: 60, taxRate: 20, netBorrowing: 30 },
      expected: 282,
      note: '300 − 60 × 0,8 + 30 = 282 tỷ ₫.',
    },
    tests: [
      {
        name: 'ca thường — 300 − 48 + 30',
        inputs: { fcff: 300, interest: 60, taxRate: 20, netBorrowing: 30 },
        expected: 282,
      },
      {
        name: 'kỳ trả bớt nợ thì vay ròng âm kéo FCFE xuống',
        inputs: { fcff: 300, interest: 60, taxRate: 20, netBorrowing: -50 },
        expected: 202,
      },
      {
        name: 'chi phí lãi vay âm không có ý nghĩa',
        inputs: { fcff: 300, interest: -10, taxRate: 20, netBorrowing: 30 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_DAMODARAN_FCF, SOURCE_CORPORATE_FINANCE],
    dependsOn: [{ formulaId: 'fcff', variableKey: 'fcff' }],
  },
  calc: (v) => {
    const interest = v('interest');

    if (interest < 0) {
      return fail(
        'tỷ ₫',
        meaningless(
          'Chi phí lãi vay âm không có ý nghĩa — doanh nghiệp không được chủ nợ trả lãi.',
          'Nhập chi phí lãi vay từ 0 trở lên; thu nhập lãi ghi ở dòng khác của báo cáo.',
        ),
      );
    }

    const interestAfterTax = interest * (1 - v('taxRate') / 100);
    return ok(v('fcff') - interestAfterTax + v('netBorrowing'), 'tỷ ₫', {
      extras: { interestAfterTax },
    });
  },
};

/*
 * ── 7. Giá trị nội tại từ FCFF ─────────────────────────────────────────────────────────
 *
 * Mắt xích khép nhánh FCFF của chuỗi định giá (gói 5.2.3). Trước khi có nó, `wacc`, `fcff` và
 * `fcfe` là ba công thức KHÔNG AI tiêu thụ kết quả — chuỗi có đầu mà không có chỗ đi tới.
 *
 * Ba phép nối tiếp nhau, và chỗ dễ sai nhất là phép thứ ba:
 *   EV = FCFF × (1 + g) ÷ (WACC − g)   → tỷ ₫  (Gordon áp lên dòng tiền doanh nghiệp)
 *   Vốn chủ = EV − Nợ vay ròng          → tỷ ₫
 *   Giá trị nội tại = Vốn chủ ÷ Số CP   → ₫/CP, nhân 1.000 vì tỷ ÷ triệu
 *
 * Hệ số 1.000 ấy đúng theo tiền lệ của `ncav-tren-co-phieu`: `tỷ ₫ ÷ triệu CP` ra `nghìn ₫/CP`.
 * Quên nó là sai đúng ba chữ số mà con số vẫn trông hợp lý.
 *
 * **Cố ý KHÔNG khai cạnh sang `bien-an-toan`**, dù ô "Giá trị nội tại ước tính" bên đó nhận đúng
 * đơn vị này. Ô ấy đã nhận từ mô hình Gordon; thêm nguồn thứ hai thì `runChain()` xử được (nó ưu
 * tiên nguồn đầu tiên cấp được số), nhưng trên màn hình người dùng chỉ thấy MỘT nhãn nguồn và
 * không có cách nào chọn nguồn kia — tức bày ra một lựa chọn không bấm được. Chọn nguồn nào là
 * việc của người định giá, và cho tới khi giao diện hỏi được câu đó thì ô kia để nhập tay.
 */

export const GIA_TRI_NOI_TAI_FCFF: FormulaModule = {
  spec: {
    id: 'gia-tri-noi-tai-fcff',
    categoryId: 'valuation',
    name: { vi: 'Giá trị nội tại từ FCFF (DCF)', en: 'Intrinsic value from FCFF' },
    description:
      'Chiết khấu dòng tiền tự do của doanh nghiệp bằng WACC, trừ nợ ròng, chia cho số cổ phiếu.',
    latex:
      'V_0 = \\frac{\\dfrac{FCFF \\, (1+g)}{WACC - g} - D_{\\text{ròng}}}{\\text{Số CP}} \\times 1000',
    expression:
      'Giá trị nội tại = (FCFF × (1 + g) ÷ (WACC − g) − Nợ vay ròng) ÷ Số cổ phiếu lưu hành × 1.000',
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['dcf', 'gia tri noi tai', 'chiet khau dong tien', 'fcff', 'intrinsic value'],
    resultUnit: '₫',
    variables: [
      numberVar('fcff', 'Dòng tiền tự do của doanh nghiệp (FCFF)', 'tỷ ₫', 300, {
        min: -1_000_000,
        max: 10_000_000,
        description: 'Kết quả từ công thức FCFF, hoặc nhập tay nếu đã có sẵn.',
      }),
      sliderVar('growth', 'Tăng trưởng FCFF dài hạn (g)', '%', 4, 0, 10, 0.1, {
        description: 'Tốc độ tăng dòng tiền đều mãi mãi — nên quanh tăng trưởng GDP dài hạn.',
      }),
      sliderVar('wacc', 'Chi phí vốn bình quân (WACC)', '%', 10.7, 0, 30, 0.1, {
        description: 'Suất chiết khấu cho dòng tiền của cả doanh nghiệp — thường lấy từ WACC.',
      }),
      numberVar('netDebt', 'Nợ vay ròng', 'tỷ ₫', 300, {
        min: -1_000_000,
        max: 10_000_000,
        description: 'Nợ vay chịu lãi trừ tiền và tương đương tiền; âm nghĩa là tiền nhiều hơn nợ.',
      }),
      numberVar('shares', 'Số cổ phiếu lưu hành', 'triệu CP', 118, {
        min: 0,
        max: 100_000,
        description: 'Số cổ phiếu đang lưu hành, tính bằng triệu.',
      }),
    ],
    explanation: {
      meaning:
        'Toàn bộ dòng tiền doanh nghiệp tạo ra trong tương lai, quy về hôm nay, trả nợ xong rồi chia đều cho từng cổ phiếu.',
      whenToUse:
        'Khi doanh nghiệp có dòng tiền dương và ổn định nhưng trả cổ tức ít hơn khả năng — lúc đó mô hình cổ tức định giá thấp hơn thực chất.',
      howToRead:
        'So con số này với thị giá: cao hơn nhiều là cổ phiếu đang rẻ theo mô hình. Kết quả cực nhạy với hiệu WACC − g, nên hãy thử vài kịch bản thay vì tin một con số.',
      commonMistakes:
        'Chọn g gần bằng WACC làm giá trị phồng lên vô lý; và quên trừ nợ vay ròng — đó là phần thuộc về chủ nợ, không phải cổ đông.',
    },
    example: {
      title: 'FCFF 300 tỷ, tăng 4%/năm, WACC 10,7%, nợ ròng 300 tỷ, 118 triệu CP',
      inputs: { fcff: 300, growth: 4, wacc: 10.7, netDebt: 300, shares: 118 },
      expected: 36_921.33,
      note: 'Giá trị doanh nghiệp 4.657 tỷ ₫, trừ nợ ròng còn 4.357 tỷ ₫ cho cổ đông.',
    },
    tests: [
      {
        // Tính độc lập dạng đóng: 300 × 1,04 ÷ 0,067 = 4.656,7164 tỷ; − 300 = 4.356,7164;
        // ÷ 118 × 1.000 = 36.921,3256 ₫.
        name: 'ca thường — FCFF 300, g 4%, WACC 10,7%, nợ ròng 300, 118 triệu CP',
        inputs: { fcff: 300, growth: 4, wacc: 10.7, netDebt: 300, shares: 118 },
        expected: 36_921.33,
        tolerance: 1,
      },
      {
        name: 'không nợ ròng thì toàn bộ giá trị doanh nghiệp thuộc về cổ đông',
        inputs: { fcff: 300, growth: 4, wacc: 10.7, netDebt: 0, shares: 118 },
        expected: 39_463.7,
        tolerance: 1,
      },
      {
        name: 'WACC đúng bằng g thì mẫu số WACC − g bằng 0',
        inputs: { fcff: 300, growth: 4, wacc: 4, netDebt: 300, shares: 118 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'WACC nhỏ hơn g thì giá trị âm vô nghĩa, không phải chia cho 0',
        inputs: { fcff: 300, growth: 6, wacc: 4, netDebt: 300, shares: 118 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'số cổ phiếu bằng 0 thì chia cho 0',
        inputs: { fcff: 300, growth: 4, wacc: 10.7, netDebt: 300, shares: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'FCFF âm thì mô hình tăng trưởng đều mất ý nghĩa',
        inputs: { fcff: -100, growth: 4, wacc: 10.7, netDebt: 300, shares: 118 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'nợ ròng vượt cả giá trị doanh nghiệp thì phần cổ đông âm',
        inputs: { fcff: 300, growth: 4, wacc: 10.7, netDebt: 6_000, shares: 118 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_DAMODARAN_FCF, SOURCE_CORPORATE_FINANCE],
    /*
     * Hai cạnh, hai biến khác nhau — không phải hai nguồn cho cùng một ô. Đơn vị khớp cả hai đầu:
     * `fcff` ra 'tỷ ₫', `wacc` ra '%'; ca kiểm đơn vị ở `formulas.test.ts` gác điều đó.
     */
    dependsOn: [
      { formulaId: 'fcff', variableKey: 'fcff' },
      { formulaId: 'wacc', variableKey: 'wacc' },
    ],
  },
  calc: (v) => {
    const fcff = v('fcff');
    const growth = v('growth');
    const wacc = v('wacc');
    const shares = v('shares');

    if (shares <= 0) {
      return fail(
        '₫',
        divideByZero(
          'giá trị nội tại',
          'Số cổ phiếu lưu hành',
          'Nhập số cổ phiếu đang lưu hành lớn hơn 0.',
        ),
      );
    }

    if (fcff <= 0) {
      return fail(
        '₫',
        meaningless(
          'FCFF âm hoặc bằng 0 thì mô hình tăng trưởng đều cho ra giá trị doanh nghiệp âm — không định giá được bằng cách này.',
          'Dùng kỳ có dòng tiền dương, hoặc ước tính FCFF bình thường hoá của vài năm gần nhất.',
        ),
      );
    }

    if (wacc === growth) {
      return fail(
        '₫',
        divideByZero(
          'giá trị doanh nghiệp',
          'hiệu WACC − g',
          'Nhập WACC lớn hơn tăng trưởng dài hạn g.',
        ),
      );
    }

    if (wacc < growth) {
      return fail(
        '₫',
        meaningless(
          'Mô hình chỉ dùng được khi WACC lớn hơn tăng trưởng g — g vượt WACC cho ra giá trị âm vô nghĩa.',
          'Giảm g về mức bền vững dài hạn (thường quanh tăng trưởng GDP) hoặc xem lại WACC.',
        ),
      );
    }

    const enterpriseValue = (fcff * (1 + growth / 100)) / ((wacc - growth) / 100);
    const equityValue = enterpriseValue - v('netDebt');

    if (equityValue <= 0) {
      return fail(
        '₫',
        meaningless(
          'Nợ vay ròng lớn hơn cả giá trị doanh nghiệp, nên phần còn lại cho cổ đông là số âm.',
          'Kiểm tra lại nợ vay ròng, hoặc xem lại giả định tăng trưởng và WACC.',
        ),
      );
    }

    // tỷ ₫ chia cho triệu CP ra nghìn ₫ mỗi cổ phiếu — nhân 1.000 để về đơn vị đồng.
    return ok((equityValue / shares) * 1_000, '₫', {
      extras: { enterpriseValue, equityValue },
    });
  },
};

/*
 * ── 8. Giá trị hiện tại (PV) ───────────────────────────────────────────────────────────
 */

export const GIA_TRI_HIEN_TAI: FormulaModule = {
  spec: {
    id: 'gia-tri-hien-tai',
    categoryId: 'valuation',
    name: { vi: 'Giá trị hiện tại (PV)', en: 'Present value' },
    description: 'Một khoản tiền trong tương lai đáng giá bao nhiêu ở hôm nay.',
    latex: 'PV = \\frac{FV}{(1 + r)^n}',
    expression: 'Giá trị hiện tại = Số tiền tương lai ÷ (1 + Tỷ lệ chiết khấu)^Số năm',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['pv', 'gia tri hien tai', 'chiet khau', 'present value'],
    resultUnit: '₫',
    variables: [
      numberVar('futureValue', 'Số tiền trong tương lai (FV)', '₫', 1_000_000_000, {
        min: 0,
        max: 1_000_000_000_000,
        description: 'Khoản tiền sẽ nhận được vào cuối kỳ.',
      }),
      sliderVar('rate', 'Tỷ lệ chiết khấu / năm', '%', 8, 0, 30, 0.1, {
        description: 'Mức sinh lợi lẽ ra kiếm được nếu có tiền ngay hôm nay.',
      }),
      sliderVar('years', 'Số năm', 'năm', 10, 1, 50, 1, {
        description: 'Khoảng cách từ hôm nay tới lúc nhận tiền.',
      }),
    ],
    explanation: {
      meaning:
        'Tiền nhận sau mới rẻ hơn tiền nhận ngay, vì tiền có ngay còn sinh lợi được — PV quy mọi khoản tương lai về cùng thước đo hôm nay.',
      whenToUse:
        'Khi so sánh các khoản tiền nhận ở thời điểm khác nhau, hoặc làm viên gạch cho DDM, DCF, NPV.',
      howToRead:
        'Tỷ lệ chiết khấu càng cao hoặc thời gian càng dài thì giá trị hôm nay càng teo nhỏ — 1 tỷ sau 10 năm với chiết khấu 8% chỉ còn khoảng 463 triệu.',
      commonMistakes:
        'Chọn tỷ lệ chiết khấu tuỳ hứng — nó phải phản ánh mức rủi ro của chính khoản tiền đó, tiền chắc chắn chiết khấu thấp, tiền bấp bênh chiết khấu cao.',
    },
    example: {
      title: 'Nhận 1 tỷ ₫ sau 10 năm, chiết khấu 8%/năm',
      inputs: { futureValue: 1_000_000_000, rate: 8, years: 10 },
      expected: 463_193_488.08,
      note: 'Hơn nửa giá trị đã bay hơi chỉ vì phải chờ 10 năm.',
    },
    tests: [
      {
        name: 'ca thường — 1 tỷ sau 10 năm, chiết khấu 8%',
        inputs: { futureValue: 1_000_000_000, rate: 8, years: 10 },
        expected: 463_193_488.08,
        tolerance: 1,
      },
      {
        name: 'chiết khấu 0% thì tiền tương lai bằng đúng tiền hôm nay',
        inputs: { futureValue: 1_000_000_000, rate: 0, years: 10 },
        expected: 1_000_000_000,
      },
      {
        name: 'tỷ lệ −100% làm mẫu số (1 + r)^n bằng 0',
        inputs: { futureValue: 1_000_000_000, rate: -100, years: 10 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE, SOURCE_CFA],
  },
  calc: (v) => {
    const base = 1 + v('rate') / 100;

    if (base === 0) {
      return fail(
        '₫',
        divideByZero(
          'giá trị hiện tại',
          'mẫu số (1 + r) lũy thừa n',
          'Nhập tỷ lệ chiết khấu lớn hơn −100%.',
        ),
      );
    }

    if (base < 0) {
      return fail(
        '₫',
        meaningless(
          'Tỷ lệ chiết khấu dưới −100% mỗi năm không có ý nghĩa kinh tế.',
          'Nhập tỷ lệ chiết khấu lớn hơn −100%.',
        ),
      );
    }

    return ok(v('futureValue') / Math.pow(base, Math.round(v('years'))), '₫');
  },
};

/*
 * ── 9. Giá trị tương lai (FV) ──────────────────────────────────────────────────────────
 */

export const GIA_TRI_TUONG_LAI: FormulaModule = {
  spec: {
    id: 'gia-tri-tuong-lai',
    categoryId: 'valuation',
    name: { vi: 'Giá trị tương lai (FV)', en: 'Future value' },
    description: 'Một khoản tiền hôm nay lớn thành bao nhiêu sau nhiều năm sinh lợi kép.',
    latex: 'FV = PV \\, (1 + r)^n',
    expression: 'Giá trị tương lai = Số tiền hiện tại × (1 + Tỷ suất sinh lợi)^Số năm',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['fv', 'gia tri tuong lai', 'lai gop', 'future value'],
    resultUnit: '₫',
    variables: [
      numberVar('presentValue', 'Số tiền hiện tại (PV)', '₫', 100_000_000, {
        min: 0,
        max: 1_000_000_000_000,
        description: 'Khoản tiền đang có ở hôm nay.',
      }),
      sliderVar('rate', 'Tỷ suất sinh lợi / năm', '%', 10, -10, 30, 0.1, {
        description: 'Mức sinh lợi kép mỗi năm; âm nếu tài sản mất giá.',
      }),
      sliderVar('years', 'Số năm', 'năm', 15, 1, 50, 1, {
        description: 'Thời gian để khoản tiền sinh lợi.',
      }),
    ],
    explanation: {
      meaning:
        'Chiều ngược của giá trị hiện tại: tiền hôm nay cộng dồn sinh lợi kép sẽ thành bao nhiêu vào một mốc tương lai.',
      whenToUse:
        'Khi ước tính một khoản đầu tư một lần sẽ lớn tới đâu, hoặc đặt mục tiêu tài sản cho ngày nghỉ hưu.',
      howToRead:
        'Thời gian là biến mạnh nhất — 100 triệu ở mức 10%/năm thành gần 418 triệu sau 15 năm, và hơn 670 triệu nếu chờ thêm 5 năm nữa.',
      commonMistakes:
        'Quên trừ lạm phát: con số tương lai là tiền danh nghĩa, sức mua thực của nó thấp hơn con số hiện ra.',
    },
    example: {
      title: 'Đầu tư 100 triệu ₫, sinh lợi 10%/năm, giữ 15 năm',
      inputs: { presentValue: 100_000_000, rate: 10, years: 15 },
      expected: 417_724_816.94,
      note: 'Gấp hơn 4 lần vốn gốc nhờ lãi kép.',
    },
    tests: [
      {
        name: 'ca thường — 100 triệu, 10%/năm, 15 năm',
        inputs: { presentValue: 100_000_000, rate: 10, years: 15 },
        expected: 417_724_816.94,
        tolerance: 1,
      },
      {
        name: 'sinh lợi 0% thì tiền giữ nguyên',
        inputs: { presentValue: 100_000_000, rate: 0, years: 15 },
        expected: 100_000_000,
      },
      {
        name: 'mất quá 100% mỗi năm là vô nghĩa',
        inputs: { presentValue: 100_000_000, rate: -150, years: 15 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE, SOURCE_CFA],
  },
  calc: (v) => {
    const base = 1 + v('rate') / 100;

    if (base < 0) {
      return fail(
        '₫',
        meaningless(
          'Tỷ suất sinh lợi dưới −100% mỗi năm không có ý nghĩa — không thể mất nhiều hơn toàn bộ số tiền.',
          'Nhập tỷ suất sinh lợi từ −100% trở lên.',
        ),
      );
    }

    return ok(v('presentValue') * Math.pow(base, Math.round(v('years'))), '₫');
  },
};

/*
 * ── 10. Biên an toàn ───────────────────────────────────────────────────────────────────
 */

export const BIEN_AN_TOAN: FormulaModule = {
  spec: {
    id: 'bien-an-toan',
    categoryId: 'valuation',
    name: { vi: 'Biên an toàn', en: 'Margin of safety' },
    description: 'Thị giá đang thấp hơn giá trị nội tại ước tính bao nhiêu phần trăm.',
    latex: 'MOS = \\frac{V - P}{V} \\times 100\\%',
    expression: 'Biên an toàn = (Giá trị nội tại − Thị giá) ÷ Giá trị nội tại × 100%',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['bien an toan', 'margin of safety', 'gia tri noi tai', 'graham', 'dinh gia'],
    resultUnit: '%',
    variables: [
      numberVar('intrinsic', 'Giá trị nội tại ước tính', '₫', 40_000, {
        min: 0,
        max: 10_000_000,
        description: 'Kết quả từ một mô hình định giá: Gordon, DDM hai giai đoạn, DCF…',
      }),
      numberVar('price', 'Thị giá hiện tại', '₫', 30_000, {
        min: 0,
        max: 10_000_000,
        description: 'Giá đóng cửa gần nhất của cổ phiếu.',
      }),
    ],
    explanation: {
      meaning:
        'Khoảng đệm giữa giá mua và giá trị ước tính — chỗ dựa khi chính ước tính của mình sai lệch.',
      whenToUse:
        'Bước cuối của mọi chuỗi định giá: có giá trị nội tại rồi, so với thị giá để quyết định mua hay chờ.',
      howToRead:
        'Biên 25% nghĩa là mua rẻ hơn ước tính một phần tư; biên âm nghĩa là đang trả giá cao hơn giá trị tính ra. Trường phái đầu tư giá trị thường đòi biên 20–50%.',
      commonMistakes:
        'Tin con số tuyệt đối của biên trong khi giá trị nội tại chỉ là ước tính — biên an toàn lớn không cứu được một mô hình định giá sai đầu vào.',
    },
    example: {
      title: 'Giá trị nội tại 40.000 ₫, thị giá 30.000 ₫',
      inputs: { intrinsic: 40_000, price: 30_000 },
      expected: 25,
      note: 'Đang mua rẻ hơn ước tính 25% — khoảng đệm cho sai số của mô hình.',
    },
    tests: [
      {
        name: 'ca thường — mua rẻ hơn ước tính 25%',
        inputs: { intrinsic: 40_000, price: 30_000 },
        expected: 25,
      },
      {
        name: 'thị giá cao hơn giá trị nội tại thì biên âm',
        inputs: { intrinsic: 30_000, price: 36_000 },
        expected: -20,
      },
      {
        name: 'giá trị nội tại bằng 0 thì chia cho 0',
        inputs: { intrinsic: 0, price: 30_000 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'giá trị nội tại âm thì biên không có ý nghĩa',
        inputs: { intrinsic: -5_000, price: 30_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_GRAHAM, SOURCE_CFA],
    /*
     * Mắt xích cuối của chuỗi định giá (gói 5.2.3): giá trị nội tại đến từ mô hình Gordon.
     *
     * Chọn Gordon chứ không phải DDM hai giai đoạn vì Gordon là mô hình định giá **cơ bản nhất**
     * ra đơn vị '₫' cho mỗi cổ phiếu, và cả hai mắt xích trước nó đều đã có sẵn — chuỗi chạy được
     * ngay mà không phải thêm công thức nào vào nhóm Định giá vốn đã đủ 18/18.
     *
     * Ô này vẫn nhập tay được: ai định giá bằng DDM hai giai đoạn hay bằng bội số thì bấm Ghi đè.
     * Đó là lối thoát mà WF-15 hứa, và `resolveLinked()` cho ghi đè thắng cả khi Gordon đang lỗi.
     */
    dependsOn: [{ formulaId: 'mo-hinh-gordon', variableKey: 'intrinsic' }],
  },
  calc: (v) => {
    const intrinsic = v('intrinsic');

    if (intrinsic === 0) {
      return fail(
        '%',
        divideByZero(
          'biên an toàn',
          'giá trị nội tại',
          'Ước tính giá trị nội tại bằng một mô hình định giá trước.',
        ),
      );
    }

    if (intrinsic < 0) {
      return fail(
        '%',
        meaningless(
          'Giá trị nội tại âm làm biên an toàn mất ý nghĩa.',
          'Xem lại mô hình định giá — bộ giả định đầu vào đang cho ra giá trị âm.',
        ),
      );
    }

    return ok(((intrinsic - v('price')) / intrinsic) * 100, '%');
  },
};

/** Mười công thức chiết khấu dòng tiền của nhóm Định giá. */
export const VALUATION_DCF_FORMULAS: ReadonlyArray<FormulaModule> = [
  MO_HINH_GORDON,
  DDM_HAI_GIAI_DOAN,
  CAPM,
  WACC,
  FCFF,
  FCFE,
  GIA_TRI_NOI_TAI_FCFF,
  GIA_TRI_HIEN_TAI,
  GIA_TRI_TUONG_LAI,
  BIEN_AN_TOAN,
];
