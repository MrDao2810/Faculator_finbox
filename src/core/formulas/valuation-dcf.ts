/**
 * Tầng DOMAIN — nhóm Định giá, nửa chiết khấu dòng tiền (một phần gói WBS 5.2.3).
 *
 * Mười công thức: Gordon (DDM một giai đoạn) · DDM hai giai đoạn · CAPM · WACC ·
 * FCFF từ EBIT · FCFE từ FCFF · giá trị nội tại từ FCFF · PV · FV · biên an toàn. Đây là các mắt xích vô hướng
 * của chuỗi định giá CAPM → WACC → DCF → biên an toàn; beta ở CAPM vẫn là ô NHẬP TAY dù công
 * thức Beta hồi quy (nhóm Rủi ro) đã đăng ký — CAPM không đọc chuỗi giá nào, và người dùng có
 * thể có beta từ một nguồn khác (công ty chứng khoán, báo cáo quỹ) chứ không bắt buộc phải
 * tính lại bằng công thức trong thư viện này.
 *
 * ── Sáu cạnh `dependsOn` của cả Registry đều nằm trong file này (FR-15, gói 5.2.3) ──────────
 *
 *   capm ──► mo-hinh-gordon.requiredReturn ──► bien-an-toan.intrinsic
 *   capm ──► wacc.costEquity ──► gia-tri-noi-tai-fcff.wacc ◄── fcff.fcff  ·  fcff ──► fcfe.fcff
 *
 * Hai nhánh, `runChain()` chạy thật cả hai. Nhánh dưới hội tụ: `gia-tri-noi-tai-fcff` nhận từ
 * HAI công thức khác nhau vào HAI biến khác nhau — đó là hình thoi, không phải hai nguồn cho
 * cùng một ô (trường hợp ấy `runChain()` cũng xử được, xem docblock của nó).
 *
 * Đơn vị hai đầu mỗi cạnh phải khớp nhau; `formulas.test.ts` gác điều đó cho cả sáu cạnh.
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
  label: {
    vi: 'Aswath Damodaran — Investment Valuation, ấn bản 3 (Wiley, 2012), chương 13: Dividend Discount Models',
    en: 'Aswath Damodaran — Investment Valuation, 3rd edition (Wiley, 2012), chapter 13: Dividend Discount Models',
  },
};

const SOURCE_DAMODARAN_FCF: FormulaSource = {
  label: {
    vi: 'Aswath Damodaran — Investment Valuation, ấn bản 3 (Wiley, 2012), chương 14–15: các mô hình dòng tiền tự do',
    en: 'Aswath Damodaran — Investment Valuation, 3rd edition (Wiley, 2012), chapters 14–15: free cash flow models',
  },
};

const SOURCE_DAMODARAN_COC: FormulaSource = {
  label: {
    vi: 'Aswath Damodaran — Investment Valuation, ấn bản 3 (Wiley, 2012), chương 7–8: lãi suất phi rủi ro, phần bù rủi ro và chi phí vốn',
    en: 'Aswath Damodaran — Investment Valuation, 3rd edition (Wiley, 2012), chapters 7–8: risk-free rates, risk premiums and the cost of capital',
  },
};

const SOURCE_GRAHAM: FormulaSource = {
  label: {
    vi: 'Benjamin Graham — The Intelligent Investor, bản hiệu đính 2003 (HarperBusiness), chương 20: Margin of Safety',
    en: 'Benjamin Graham — The Intelligent Investor, revised edition 2003 (HarperBusiness), chapter 20: Margin of Safety',
  },
};

/*
 * ── 1. Mô hình Gordon — DDM một giai đoạn ──────────────────────────────────────────────
 */

export const MO_HINH_GORDON: FormulaModule = {
  spec: {
    id: 'mo-hinh-gordon',
    categoryId: 'valuation',
    name: { vi: 'Mô hình Gordon (DDM một giai đoạn)', en: 'Gordon growth model' },
    description: {
      vi: 'Giá trị cổ phiếu từ dòng cổ tức tăng trưởng đều mãi mãi, chiết khấu về hiện tại.',
      en: 'Share value from a dividend stream growing at a constant rate forever, discounted back to the present.',
    },
    latex: 'V_0 = \\frac{D_0 (1 + g)}{r - g}',
    expression: {
      vi: 'Giá trị cổ phiếu = Cổ tức vừa trả × (1 + g) ÷ (r − g)',
      en: 'Share value = Most recent dividend × (1 + g) ÷ (r − g)',
    },
    symbols: [
      {
        latex: 'V_0',
        meaning: { vi: 'giá trị cổ phiếu ở hôm nay, ₫', en: 'share value today, ₫' },
      },
      {
        latex: 'D_0',
        meaning: {
          vi: 'cổ tức vừa trả trên mỗi cổ phiếu, ₫',
          en: 'most recent dividend per share, ₫',
        },
      },
      {
        latex: 'g',
        meaning: {
          vi: 'tăng trưởng cổ tức dài hạn, %/năm',
          en: 'long-term dividend growth, %/year',
        },
      },
      {
        latex: 'r',
        meaning: { vi: 'suất sinh lợi yêu cầu, %/năm', en: 'required rate of return, %/year' },
      },
    ],
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['gordon', 'ddm', 'chiet khau co tuc', 'dinh gia co tuc', 'dividend discount'],
    resultUnit: '₫',
    variables: [
      numberVar(
        'dividend',
        { vi: 'Cổ tức vừa trả (D0)', en: 'Most recent dividend (D0)' },
        '₫',
        2_000,
        {
          min: 0,
          max: 100_000,
          description: {
            vi: 'Cổ tức tiền mặt trên mỗi cổ phiếu trong 12 tháng gần nhất.',
            en: 'Cash dividend per share over the most recent 12 months.',
          },
        },
      ),
      sliderVar(
        'growth',
        { vi: 'Tăng trưởng cổ tức dài hạn (g)', en: 'Long-term dividend growth (g)' },
        '%',
        5,
        -5,
        15,
        0.1,
        {
          description: {
            vi: 'Tốc độ tăng cổ tức đều đặn mãi mãi — nên thấp hơn tăng trưởng GDP dài hạn.',
            en: 'The rate at which dividends grow steadily forever — should be lower than long-term GDP growth.',
          },
        },
      ),
      sliderVar(
        'requiredReturn',
        { vi: 'Suất sinh lợi yêu cầu (r)', en: 'Required rate of return (r)' },
        '%',
        12,
        0,
        30,
        0.1,
        {
          description: {
            vi: 'Mức sinh lợi tối thiểu để chấp nhận nắm giữ — thường lấy từ CAPM.',
            en: 'The minimum return needed to justify holding the stock — usually taken from CAPM.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Toàn bộ cổ tức tương lai, giả định tăng đều mãi mãi, đáng giá bao nhiêu tiền ở hôm nay.',
        en: 'How much all future dividends are worth today, assuming they grow at a steady rate forever.',
      },
      whenToUse: {
        vi: 'Với doanh nghiệp trả cổ tức ổn định và tăng trưởng chậm, đều — điện, nước, hàng tiêu dùng thiết yếu.',
        en: 'For companies that pay stable, slow and steady-growing dividends — utilities, water, essential consumer goods.',
      },
      howToRead: {
        vi: 'Giá trị tính ra cao hơn thị giá nghĩa là cổ phiếu đang rẻ theo mô hình. Kết quả rất nhạy với hiệu r − g nên hãy thử vài kịch bản.',
        en: 'A computed value higher than the market price means the stock looks cheap under this model. The result is highly sensitive to the r − g spread, so try a few scenarios.',
      },
      commonMistakes: {
        vi: 'Chọn g cao gần bằng r làm giá trị phóng đại vô lý — không doanh nghiệp nào tăng cổ tức nhanh hơn nền kinh tế mãi mãi.',
        en: 'Picking a g close to r inflates the value absurdly — no company can grow its dividend faster than the economy forever.',
      },
    },
    example: {
      title: {
        vi: 'FPT — cổ tức 2.000 ₫/CP, tăng trưởng dài hạn 5%/năm, suất sinh lợi yêu cầu 11,92% từ CAPM',
        en: 'FPT — dividend 2,000 ₫/share, long-term growth 5%/year, required return 11.92% from CAPM',
      },
      inputs: { dividend: 2_000, growth: 5, requiredReturn: 11.92 },
      expected: 30_347,
      note: {
        vi: 'Mô hình chỉ định giá phần cổ tức, trong khi FPT giữ lại phần lớn lợi nhuận để tái đầu tư — nên kết quả thấp hơn hẳn thị giá 72.700 ₫. Gordon hợp với doanh nghiệp trưởng thành chia gần hết lợi nhuận, và rất nhạy với hiệu r − g.',
        en: 'The model values only the dividend stream, while FPT retains most of its profit to reinvest — so the figure lands well below the 72,700 ₫ market price. Gordon suits mature companies that pay out nearly all their earnings, and it is highly sensitive to the r − g spread.',
      },
      source: {
        vi: 'cotuc.vn, lịch sử cổ tức tiền mặt FPT Corp (mã FPT), chốt 15/09/2026.',
        en: 'cotuc.vn, FPT Corp’s (ticker FPT) cash dividend history, locked in 2026-09-15.',
      },
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
      {
        // Doanh nghiệp chưa trả cổ tức: phép nhân ra đúng 0 và `ok()` sẽ bày nó như một mức giá
        // cổ phiếu nếu không có chốt chặn này.
        name: 'cổ tức vừa trả bằng 0 thì mô hình cổ tức không định giá được',
        inputs: { dividend: 0, growth: 5, requiredReturn: 12 },
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

    /*
     * D0 = 0 là giá trị hợp lệ của ô nhập (min 0) và rất thường gặp — cổ phiếu tăng trưởng chưa
     * trả cổ tức bao giờ. Không chặn thì phép nhân cho ra đúng 0 và `ok()` bày nó như một MỨC GIÁ
     * cổ phiếu, tức con số sai trình bày như số đúng — đúng thứ FR-06 sinh ra để chặn. Hạ nguồn
     * còn nặng hơn: `bien-an-toan` nhận giá trị nội tại 0 rồi báo "chia cho 0", chỉ người dùng đi
     * sửa nhầm ô.
     */
    if (v('dividend') === 0) {
      return fail(
        '₫',
        meaningless(
          {
            vi: 'Cổ tức vừa trả bằng 0 thì không có dòng cổ tức nào để chiết khấu — cách này không định giá được doanh nghiệp chưa trả cổ tức.',
            en: 'A most recent dividend of 0 leaves no dividend stream to discount — this method cannot value a company that pays no dividend.',
          },
          {
            vi: 'Nhập cổ tức tiền mặt 12 tháng gần nhất, hoặc dùng một cách định giá dựa trên dòng tiền nếu doanh nghiệp chưa trả cổ tức.',
            en: 'Enter the cash dividend of the last 12 months, or use a cash-flow based method if the company pays no dividend.',
          },
        ),
      );
    }

    if (r === g) {
      return fail(
        '₫',
        divideByZero(
          { vi: 'giá trị cổ phiếu', en: 'share value' },
          { vi: 'hiệu r − g', en: 'the r − g spread' },
          {
            vi: 'Nhập suất sinh lợi yêu cầu r lớn hơn tăng trưởng g.',
            en: 'Enter a required return r greater than the growth rate g.',
          },
        ),
      );
    }

    if (r < g) {
      return fail(
        '₫',
        meaningless(
          {
            vi: 'Mô hình Gordon chỉ dùng được khi suất sinh lợi yêu cầu r lớn hơn tăng trưởng g — r nhỏ hơn g cho ra giá trị âm vô nghĩa.',
            en: 'The Gordon model only works when the required return r is greater than the growth rate g — r below g produces a meaningless negative value.',
          },
          {
            vi: 'Giảm g về mức bền vững dài hạn, hoặc dùng DDM hai giai đoạn cho thời kỳ tăng trưởng nhanh.',
            en: 'Lower g to a sustainable long-term level, or use the two-stage DDM for a period of fast growth.',
          },
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
    description: {
      vi: 'Giá trị cổ phiếu khi cổ tức tăng nhanh vài năm đầu rồi chuyển về tăng trưởng đều dài hạn.',
      en: 'Share value when dividends grow fast for the first few years, then settle into steady long-term growth.',
    },
    latex:
      'V_0 = \\sum_{t=1}^{n} \\frac{D_0 (1+g_1)^t}{(1+r)^t} + \\frac{D_0 (1+g_1)^n (1+g_2)}{(r - g_2)(1+r)^n}',
    expression: {
      vi: 'Giá trị cổ phiếu = Tổng cổ tức giai đoạn đầu chiết khấu về hiện tại + Giá trị cuối kỳ chiết khấu về hiện tại',
      en: 'Share value = Sum of first-stage dividends discounted to present + Terminal value discounted to present',
    },
    symbols: [
      {
        latex: 'V_0',
        meaning: { vi: 'giá trị cổ phiếu ở hôm nay, ₫', en: 'share value today, ₫' },
      },
      {
        latex: 't',
        meaning: {
          vi: 'năm đang cộng trong giai đoạn đầu, chạy từ 1 tới n',
          en: 'year being summed in the first stage, running from 1 to n',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'số năm của giai đoạn tăng trưởng nhanh',
          en: 'number of years in the fast-growth stage',
        },
      },
      {
        latex: 'D_0',
        meaning: {
          vi: 'cổ tức vừa trả trên mỗi cổ phiếu, ₫',
          en: 'most recent dividend per share, ₫',
        },
      },
      {
        latex: 'g_1',
        meaning: {
          vi: 'tăng trưởng cổ tức giai đoạn đầu, %/năm',
          en: 'first-stage dividend growth, %/year',
        },
      },
      {
        latex: 'r',
        meaning: { vi: 'suất sinh lợi yêu cầu, %/năm', en: 'required rate of return, %/year' },
      },
      {
        latex: 'g_2',
        meaning: {
          vi: 'tăng trưởng dài hạn sau giai đoạn đầu, %/năm',
          en: 'long-term growth after the first stage, %/year',
        },
      },
    ],
    chartType: 'stackedBar',
    breakdown: [
      {
        key: 'pvStage1',
        sign: 1,
        shortLabel: { vi: 'Cổ tức giai đoạn đầu', en: 'First-stage dividends' },
      },
      { key: 'pvTerminal', sign: 1, shortLabel: { vi: 'Giá trị cuối kỳ', en: 'Terminal value' } },
    ],
    breakdownTotal: { vi: 'Giá trị cổ phiếu', en: 'Share value' },
    level: 'advanced',
    tags: ['ddm hai giai doan', 'two stage ddm', 'chiet khau co tuc', 'tang truong hai giai doan'],
    resultUnit: '₫',
    variables: [
      numberVar(
        'dividend',
        { vi: 'Cổ tức vừa trả (D0)', en: 'Most recent dividend (D0)' },
        '₫',
        2_000,
        {
          min: 0,
          max: 100_000,
          description: {
            vi: 'Cổ tức tiền mặt trên mỗi cổ phiếu trong 12 tháng gần nhất.',
            en: 'Cash dividend per share over the most recent 12 months.',
          },
        },
      ),
      sliderVar(
        'growthStage1',
        { vi: 'Tăng trưởng giai đoạn đầu (g1)', en: 'First-stage growth (g1)' },
        '%',
        15,
        0,
        30,
        0.5,
        {
          description: {
            vi: 'Tốc độ tăng cổ tức trong những năm tăng trưởng nhanh.',
            en: 'The rate at which dividends grow during the fast-growth years.',
          },
        },
      ),
      sliderVar(
        'years',
        { vi: 'Số năm giai đoạn đầu', en: 'Length of the first stage (years)' },
        'năm',
        5,
        1,
        20,
        1,
        {
          description: {
            vi: 'Doanh nghiệp giữ được tăng trưởng nhanh trong bao nhiêu năm.',
            en: 'How many years the company can sustain fast growth.',
          },
        },
      ),
      sliderVar(
        'growthTerminal',
        { vi: 'Tăng trưởng dài hạn (g2)', en: 'Long-term growth (g2)' },
        '%',
        4,
        0,
        10,
        0.1,
        {
          description: {
            vi: 'Tốc độ tăng đều mãi mãi sau giai đoạn đầu — nên quanh tăng trưởng GDP.',
            en: 'The steady growth rate forever after the first stage — should be close to GDP growth.',
          },
        },
      ),
      sliderVar(
        'requiredReturn',
        { vi: 'Suất sinh lợi yêu cầu (r)', en: 'Required rate of return (r)' },
        '%',
        12,
        0,
        30,
        0.1,
        {
          description: {
            vi: 'Mức sinh lợi tối thiểu để chấp nhận nắm giữ — thường lấy từ CAPM.',
            en: 'The minimum return needed to justify holding the stock — usually taken from CAPM.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Một cổ phiếu đáng giá bao nhiêu tiền hôm nay, khi cổ tức được cho là tăng nhanh vài năm đầu rồi mới về mức đều đặn mãi mãi — thay vì đều ngay từ năm đầu.',
        en: 'How much one share is worth today when dividends are assumed to grow fast for the first few years before settling into a steady rate forever — instead of growing steadily from year one.',
      },
      whenToUse: {
        vi: 'Với doanh nghiệp đang tăng trưởng nhanh hơn mức bền vững, điều mô hình Gordon một giai đoạn không tả được.',
        en: 'For companies growing faster than a sustainable rate — something the single-stage Gordon model cannot capture.',
      },
      howToRead: {
        vi: "Con số là giá trị một cổ phiếu theo mô hình — ví dụ trên cho 40.506,6 ₫; cao hơn thị giá là cổ phiếu đang rẻ theo cách tính này, thấp hơn là đang đắt. Nhìn thêm cột 'Giá trị cuối kỳ' trên biểu đồ: ở ví dụ nó chiếm khoảng ba phần tư tổng số, nên con số bạn đọc dựa vào giả định dài hạn nhiều hơn vào mấy năm tăng nhanh.",
        en: "The figure is the value of one share under this model — the example gives 40,506.6 ₫; above the market price the stock looks cheap by this calculation, below it looks expensive. Also look at the 'Terminal value' bar on the chart: in the example it accounts for about three quarters of the total, so the number you read leans more on the long-term assumption than on the fast-growth years.",
      },
      commonMistakes: {
        vi: 'Để g2 cao gần bằng r khiến giá trị cuối kỳ phồng lên vô lý, hoặc kéo giai đoạn tăng nhanh dài quá mức doanh nghiệp giữ được.',
        en: 'Setting g2 close to r inflates the terminal value absurdly, or stretching the fast-growth stage longer than the company can realistically sustain.',
      },
    },
    example: {
      title: {
        vi: 'FPT — cổ tức 2.000 ₫, tăng 14%/năm trong 5 năm rồi 5% mãi mãi, r 11,92%',
        en: 'FPT — dividend 2,000 ₫, growing 14%/year for 5 years then 5% forever, r 11.92%',
      },
      inputs: {
        dividend: 2_000,
        growthStage1: 14,
        years: 5,
        growthTerminal: 5,
        requiredReturn: 11.92,
      },
      expected: 43_845,
      note: {
        vi: 'Giai đoạn tăng nhanh lấy theo mức tăng lợi nhuận sau thuế nửa đầu 2026 của FPT. Phần lớn giá trị vẫn nằm ở giá trị cuối kỳ chứ không ở năm năm cổ tức đầu — sai một điểm phần trăm ở g vĩnh viễn làm kết quả xê dịch mạnh hơn sai năm điểm ở g giai đoạn đầu.',
        en: 'The fast-growth stage follows FPT’s net-profit growth in the first half of 2026. Most of the value still sits in the terminal value rather than in the first five years of dividends — being one percentage point off on the perpetual g moves the result more than being five points off on the early-stage g.',
      },
      source: {
        vi: 'CafeF, kết quả kinh doanh 6 tháng đầu 2026 của FPT Corp (mã FPT), chốt 15/09/2026.',
        en: 'CafeF, FPT Corp’s (ticker FPT) first-half 2026 results, locked in 2026-09-15.',
      },
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
          { vi: 'giá trị cổ phiếu', en: 'share value' },
          { vi: 'hiệu r − g2', en: 'the r − g2 spread' },
          {
            vi: 'Nhập suất sinh lợi yêu cầu r lớn hơn tăng trưởng dài hạn g2.',
            en: 'Enter a required return r greater than the long-term growth rate g2.',
          },
        ),
      );
    }

    if (r < g2) {
      return fail(
        '₫',
        meaningless(
          {
            vi: 'Giá trị cuối kỳ chỉ có nghĩa khi suất sinh lợi yêu cầu r lớn hơn tăng trưởng dài hạn g2 — r nhỏ hơn g2 cho ra giá trị âm.',
            en: 'The terminal value is only meaningful when the required return r is greater than the long-term growth rate g2 — r below g2 produces a negative value.',
          },
          {
            vi: 'Giảm g2 về mức bền vững dài hạn (thường quanh tăng trưởng GDP) hoặc nâng r.',
            en: 'Lower g2 to a sustainable long-term level (usually near GDP growth) or raise r.',
          },
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
    description: {
      vi: 'Suất sinh lợi yêu cầu của cổ đông, tính từ lãi suất phi rủi ro và hệ số beta.',
      en: "Shareholders' required rate of return, computed from the risk-free rate and the beta coefficient.",
    },
    latex: 'r_e = r_f + \\beta \\times ERP',
    expression: {
      vi: 'Chi phí vốn chủ = Lãi suất phi rủi ro + Beta × Phần bù rủi ro thị trường',
      en: 'Cost of equity = Risk-free rate + Beta × Equity risk premium',
    },
    symbols: [
      {
        latex: 'r_e',
        meaning: {
          vi: 'chi phí vốn chủ sở hữu, tức suất sinh lợi cổ đông yêu cầu, %/năm',
          en: 'cost of equity, the return shareholders require, %/year',
        },
      },
      {
        latex: 'r_f',
        meaning: {
          vi: 'lãi suất phi rủi ro, thường là lợi suất trái phiếu Chính phủ, %/năm',
          en: 'risk-free rate, usually the government bond yield, %/year',
        },
      },
      {
        latex: '\\beta',
        meaning: {
          vi: 'hệ số beta, độ nhạy của cổ phiếu so với thị trường, lần',
          en: 'beta coefficient, how much the stock moves relative to the market',
        },
      },
      {
        latex: 'ERP',
        meaning: { vi: 'phần bù rủi ro thị trường, %/năm', en: 'equity risk premium, %/year' },
      },
    ],
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['capm', 'chi phi von chu', 'beta', 'phan bu rui ro', 'cost of equity'],
    resultUnit: '%',
    variables: [
      sliderVar(
        'riskFree',
        { vi: 'Lãi suất phi rủi ro (Rf)', en: 'Risk-free rate (Rf)' },
        '%',
        3.5,
        0,
        10,
        0.1,
        {
          description: {
            vi: 'Thường lấy lợi suất trái phiếu Chính phủ kỳ hạn 10 năm.',
            en: 'Usually taken as the yield on 10-year government bonds.',
          },
        },
      ),
      numberVar('beta', { vi: 'Hệ số beta (β)', en: 'Beta coefficient (β)' }, 'lần', 1.2, {
        min: -3,
        max: 4,
        description: {
          vi: 'Độ nhạy của cổ phiếu so với thị trường. Nhập tay — tính bằng công thức Beta của thư viện này (nhóm Rủi ro), hoặc lấy từ nguồn dữ liệu bên ngoài.',
          en: "The stock's sensitivity relative to the market. Entered manually — compute it with this library's Beta formula (Risk group), or take it from an external data source.",
        },
      }),
      sliderVar(
        'erp',
        { vi: 'Phần bù rủi ro thị trường (ERP)', en: 'Equity risk premium (ERP)' },
        '%',
        8,
        0,
        15,
        0.1,
        {
          description: {
            vi: 'Mức sinh lợi kỳ vọng của thị trường cổ phiếu vượt trên lãi suất phi rủi ro.',
            en: 'The expected return of the equity market above the risk-free rate.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Nắm cổ phiếu rủi ro hơn gửi tiết kiệm thì phải đòi hỏi mức sinh lợi cao hơn bấy nhiêu — CAPM lượng hoá con số đó qua beta.',
        en: 'Holding a stock is riskier than a savings deposit, so it must demand a correspondingly higher return — CAPM quantifies that through beta.',
      },
      whenToUse: {
        vi: 'Khi cần suất chiết khấu cho các mô hình định giá (Gordon, DDM, DCF) hoặc phần vốn chủ trong WACC.',
        en: 'When you need a discount rate for valuation models (Gordon, DDM, DCF) or the equity component of WACC.',
      },
      howToRead: {
        vi: 'Con số là mức sinh lợi tối thiểu mỗi năm cổ đông nên đòi ở cổ phiếu này: ví dụ trên ra 13,1%/năm, cao hơn lãi suất phi rủi ro 3,5% gần mười điểm phần trăm — đó là phần bù cho rủi ro. Lấy nó so với lãi gửi tiết kiệm hoặc lợi suất trái phiếu Chính phủ; mốc dễ nhớ là beta bằng 1, khi ấy con số ra đúng bằng mức sinh lợi kỳ vọng của cả thị trường.',
        en: 'The figure is the minimum annual return a shareholder should demand from this stock: the example gives 13.1%/year, nearly ten percentage points above the 3.5% risk-free rate — that gap is the compensation for risk. Compare it with deposit rates or government bond yields; a handy landmark is a beta of 1, where the figure equals the expected return of the market as a whole.',
      },
      commonMistakes: {
        vi: 'Lấy beta của thị trường khác áp cho cổ phiếu Việt Nam, hoặc quên rằng beta quá khứ không chắc lặp lại trong tương lai.',
        en: 'Applying a beta from a different market to a Vietnamese stock, or forgetting that past beta is not guaranteed to repeat in the future.',
      },
    },
    example: {
      title: {
        vi: 'FPT — lợi suất TPCP 10 năm 4,57%, beta 0,9043, phần bù rủi ro Việt Nam 8,13%',
        en: 'FPT — 10-year government bond yield 4.57%, beta 0.9043, Vietnam risk premium 8.13%',
      },
      inputs: { riskFree: 4.57, beta: 0.9043, erp: 8.13 },
      expected: 11.922,
      note: {
        vi: 'Beta dưới 1 nghĩa là FPT biến động nhẹ hơn thị trường — trái với cảm nhận rằng cổ phiếu công nghệ luôn bốc; riêng beta này hồi quy trên 55 phiên, ngắn hơn nhiều so với chuẩn hành nghề 2–5 năm. Kết quả chính là chi phí vốn chủ đưa vào WACC và làm r cho mô hình cổ tức.',
        en: 'A beta below 1 means FPT swings slightly less than the market — the opposite of the usual hunch about tech stocks; this particular beta is regressed over 55 sessions, far shorter than the 2–5 years standard practice uses. The figure is exactly the cost of equity fed into WACC, and the r used in a dividend model.',
      },
      source: {
        vi: 'Trading Economics (lợi suất TPCP 10 năm) và Damodaran (phần bù rủi ro quốc gia), chốt 15/09/2026.',
        en: 'Trading Economics (10-year government bond yield) and Damodaran (country risk premium), locked in 2026-09-15.',
      },
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
          {
            vi: 'Chi phí vốn chủ tính ra âm — beta âm sâu kéo suất sinh lợi yêu cầu xuống dưới 0, không dùng làm suất chiết khấu được.',
            en: 'The cost of equity comes out negative — a deeply negative beta pulls the required return below 0, which cannot be used as a discount rate.',
          },
          {
            vi: 'Kiểm tra lại hệ số beta; cổ phiếu thường có beta trong khoảng 0,5–1,5.',
            en: 'Double-check the beta coefficient; stocks typically have a beta between 0.5 and 1.5.',
          },
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
    description: {
      vi: 'Chi phí huy động một đồng vốn của doanh nghiệp, trộn giữa vốn chủ và nợ vay sau lá chắn thuế.',
      en: 'The cost of raising one unit of capital for a company, blending equity and after-tax debt.',
    },
    latex: 'WACC = \\frac{E}{E+D} \\, r_e + \\frac{D}{E+D} \\, r_d \\, (1 - t)',
    expression: {
      vi: 'WACC = Tỷ trọng vốn chủ × Chi phí vốn chủ + Tỷ trọng nợ × Chi phí nợ × (1 − Thuế suất)',
      en: 'WACC = Equity weight × Cost of equity + Debt weight × Cost of debt × (1 − Tax rate)',
    },
    symbols: [
      {
        latex: 'WACC',
        meaning: {
          vi: 'chi phí vốn bình quân gia quyền, %/năm',
          en: 'weighted average cost of capital, %/year',
        },
      },
      {
        latex: 'E',
        meaning: {
          vi: 'vốn chủ sở hữu theo giá thị trường, tỷ ₫',
          en: 'equity at market value, billion ₫',
        },
      },
      {
        latex: 'D',
        meaning: { vi: 'nợ vay chịu lãi, tỷ ₫', en: 'interest-bearing debt, billion ₫' },
      },
      { latex: 'E+D', meaning: { vi: 'tổng nguồn vốn, tỷ ₫', en: 'total capital, billion ₫' } },
      { latex: 'r_e', meaning: { vi: 'chi phí vốn chủ, %/năm', en: 'cost of equity, %/year' } },
      {
        latex: 'r_d',
        meaning: {
          vi: 'chi phí nợ vay, lãi suất vay bình quân, %/năm',
          en: 'cost of debt, the average borrowing rate, %/year',
        },
      },
      {
        latex: 't',
        meaning: { vi: 'thuế suất thuế TNDN, %', en: 'corporate income tax rate, %' },
      },
      {
        latex: '(1 - t)',
        meaning: {
          vi: 'hệ số sau thuế, vì lãi vay được khấu trừ thuế',
          en: 'after-tax factor, since interest is tax-deductible',
        },
      },
    ],
    chartType: 'stackedBar',
    /* Đúng hai vế của chính công thức, nên cộng lại ra đúng WACC — không cần xử lý gì thêm. */
    breakdown: [
      { key: 'equityPart', sign: 1, shortLabel: { vi: 'Phần vốn chủ', en: 'Equity portion' } },
      { key: 'debtPart', sign: 1, shortLabel: { vi: 'Phần nợ vay', en: 'Debt portion' } },
    ],
    level: 'advanced',
    tags: ['wacc', 'chi phi von binh quan', 'co cau von', 'la chan thue', 'cost of capital'],
    resultUnit: '%',
    variables: [
      numberVar('equity', { vi: 'Vốn chủ sở hữu (E)', en: 'Equity (E)' }, 'tỷ ₫', 600, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Giá trị thị trường của vốn chủ — với công ty niêm yết là vốn hoá.',
          en: 'The market value of equity — for a listed company, its market capitalization.',
        },
      }),
      numberVar('debt', { vi: 'Nợ vay (D)', en: 'Debt (D)' }, 'tỷ ₫', 400, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Tổng nợ vay ngắn hạn và dài hạn chịu lãi.',
          en: 'Total interest-bearing short-term and long-term debt.',
        },
      }),
      sliderVar(
        'costEquity',
        { vi: 'Chi phí vốn chủ (Re)', en: 'Cost of equity (Re)' },
        '%',
        13.1,
        0,
        30,
        0.1,
        {
          description: {
            vi: 'Suất sinh lợi cổ đông yêu cầu — thường lấy từ CAPM.',
            en: "Shareholders' required return — usually taken from CAPM.",
          },
        },
      ),
      sliderVar(
        'costDebt',
        { vi: 'Chi phí nợ vay (Rd)', en: 'Cost of debt (Rd)' },
        '%',
        9,
        0,
        25,
        0.1,
        {
          description: {
            vi: 'Lãi suất vay bình quân doanh nghiệp đang chịu.',
            en: 'The average borrowing rate the company currently pays.',
          },
        },
      ),
      sliderVar(
        'taxRate',
        { vi: 'Thuế suất thuế TNDN', en: 'Corporate income tax rate' },
        '%',
        20,
        0,
        50,
        0.5,
        {
          description: {
            vi: 'Thuế suất thực nộp của doanh nghiệp; lãi vay được khấu trừ thuế.',
            en: "The company's effective tax rate; interest expense is tax-deductible.",
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Mỗi đồng vốn doanh nghiệp dùng có giá bao nhiêu, khi trộn vốn cổ đông đắt hơn với nợ vay rẻ hơn nhờ được khấu trừ thuế.',
        en: 'How much each unit of capital a company uses actually costs, blending more expensive equity with cheaper debt made cheaper still by the tax deduction.',
      },
      whenToUse: {
        vi: 'Làm suất chiết khấu cho FCFF trong định giá DCF toàn doanh nghiệp, hoặc làm ngưỡng sàng lọc dự án đầu tư.',
        en: 'As the discount rate for FCFF in whole-firm DCF valuation, or as a hurdle rate for screening investment projects.',
      },
      howToRead: {
        vi: 'Dự án chỉ tạo giá trị khi sinh lợi vượt WACC. Thêm nợ chỉ kéo WACC xuống chừng nào lãi vay sau thuế còn rẻ hơn chi phí vốn chủ — và ngay cả khi rẻ hơn thì rủi ro tài chính vẫn tăng, phần rủi ro ấy con số này không phản ánh.',
        en: 'A project only creates value when its return exceeds WACC. Adding debt pulls WACC down only for as long as after-tax interest stays cheaper than the cost of equity — and even when it is cheaper, financial risk still rises, a side this figure does not capture.',
      },
      commonMistakes: {
        vi: 'Lấy giá trị sổ sách của vốn chủ thay vì vốn hoá thị trường, hoặc quên nhân chi phí nợ với (1 − thuế suất).',
        en: 'Using the book value of equity instead of market capitalization, or forgetting to multiply the cost of debt by (1 − tax rate).',
      },
    },
    example: {
      title: {
        vi: 'FPT — vốn chủ 40.995,7 tỷ ₫ ngày 30/06/2026, nợ vay 17.444 tỷ, Re 11,92%, Rd 4,2%, thuế 20%',
        en: 'FPT — equity 40,995.7 billion ₫ at 2026-06-30, debt 17,444 billion, Re 11.92%, Rd 4.2%, tax 20%',
      },
      inputs: { equity: 40_995.7, debt: 17_444, costEquity: 11.92, costDebt: 4.2, taxRate: 20 },
      expected: 9.3649,
      note: {
        vi: 'Vốn chủ chiếm khoảng 70% cơ cấu và đắt hơn nợ nhiều lần nên gánh phần lớn kết quả. Chi phí nợ thấp vì FPT vay chủ yếu ngắn hạn bằng ngoại tệ lãi suất thấp, lại được khấu trừ thuế nên sau thuế chỉ còn 3,36%.',
        en: 'Equity is about 70% of the structure and costs several times more than debt, so it carries most of the figure. The cost of debt is low because FPT borrows mostly short-term in low-rate foreign currencies, and interest is tax-deductible, leaving 3.36% after tax.',
      },
      source: {
        vi: 'CafeF, báo cáo tài chính hợp nhất quý 2/2026 của FPT Corp (mã FPT), chốt 15/09/2026.',
        en: 'CafeF, FPT Corp’s (ticker FPT) consolidated Q2 2026 financial statements, locked in 2026-09-15.',
      },
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
        divideByZero(
          { vi: 'WACC', en: 'WACC' },
          { vi: 'tổng nguồn vốn E + D', en: 'total capital E + D' },
          {
            vi: 'Nhập vốn chủ sở hữu hoặc nợ vay lớn hơn 0.',
            en: 'Enter equity or debt greater than 0.',
          },
        ),
      );
    }

    if (equity < 0 || debt < 0) {
      return fail(
        '%',
        meaningless(
          {
            vi: 'Vốn chủ sở hữu hoặc nợ vay âm làm tỷ trọng vốn mất ý nghĩa.',
            en: 'Negative equity or debt makes the capital weights meaningless.',
          },
          {
            vi: 'Nhập cả hai cấu phần vốn từ 0 trở lên.',
            en: 'Enter both capital components as 0 or greater.',
          },
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
    description: {
      vi: 'Tiền còn lại cho cả chủ nợ lẫn cổ đông sau thuế và sau khi tái đầu tư, tính từ EBIT.',
      en: 'The cash left for both creditors and shareholders after tax and reinvestment, computed from EBIT.',
    },
    latex: 'FCFF = EBIT \\, (1 - t) + Dep - CapEx - \\Delta NWC',
    expression: {
      vi: 'FCFF = EBIT × (1 − Thuế suất) + Khấu hao − Chi đầu tư − Tăng vốn lưu động ròng',
      en: 'FCFF = EBIT × (1 − Tax rate) + Depreciation − CapEx − Increase in net working capital',
    },
    symbols: [
      {
        latex: 'FCFF',
        meaning: {
          vi: 'dòng tiền tự do của doanh nghiệp trong kỳ, tỷ ₫',
          en: 'free cash flow to the firm for the period, billion ₫',
        },
      },
      {
        latex: 'EBIT',
        meaning: {
          vi: 'lợi nhuận trước lãi vay và thuế, tỷ ₫',
          en: 'earnings before interest and tax, billion ₫',
        },
      },
      {
        latex: 't',
        meaning: { vi: 'thuế suất thuế TNDN, %', en: 'corporate income tax rate, %' },
      },
      {
        latex: '(1 - t)',
        meaning: {
          vi: 'hệ số sau thuế, phần còn lại của mỗi đồng EBIT sau khi nộp thuế',
          en: 'after-tax factor, what is left of each unit of EBIT after tax',
        },
      },
      {
        latex: 'Dep',
        meaning: {
          vi: 'khấu hao trong kỳ, chi phí không bằng tiền nên cộng lại, tỷ ₫',
          en: 'depreciation for the period, a non-cash expense added back, billion ₫',
        },
      },
      {
        latex: 'CapEx',
        meaning: {
          vi: 'chi đầu tư tài sản cố định trong kỳ, tỷ ₫',
          en: 'capital expenditure for the period, billion ₫',
        },
      },
      {
        latex: '\\Delta NWC',
        meaning: {
          vi: 'tăng vốn lưu động ròng trong kỳ, tỷ ₫',
          en: 'increase in net working capital for the period, billion ₫',
        },
      },
      {
        latex: '\\Delta',
        meaning: {
          vi: 'mức thay đổi trong kỳ, cuối kỳ trừ đầu kỳ',
          en: 'change over the period, end minus start',
        },
      },
    ],
    /*
     * Bốn chặng đúng bằng bốn số hạng của công thức. `nwcChange` âm (vốn lưu động GIẢM, tức giải
     * phóng tiền) thì dấu `-1` biến nó thành cột cộng — đúng về toán và đúng về nghĩa, tiền quay
     * về doanh nghiệp thật.
     */
    breakdown: [
      { key: 'ebitAfterTax', sign: 1, shortLabel: { vi: 'EBIT sau thuế', en: 'After-tax EBIT' } },
      { key: 'depreciation', sign: 1, shortLabel: { vi: 'Khấu hao', en: 'Depreciation' } },
      { key: 'capex', sign: -1, shortLabel: { vi: 'Chi đầu tư', en: 'CapEx' } },
      { key: 'nwcChange', sign: -1, shortLabel: { vi: 'Tăng VLĐ ròng', en: 'Increase in net WC' } },
    ],
    chartType: 'waterfall',
    level: 'advanced',
    tags: ['fcff', 'dong tien tu do', 'ebit', 'dcf', 'free cash flow'],
    resultUnit: 'tỷ ₫',
    variables: [
      numberVar(
        'ebit',
        {
          vi: 'Lợi nhuận trước lãi vay và thuế (EBIT)',
          en: 'Earnings before interest and tax (EBIT)',
        },
        'tỷ ₫',
        500,
        {
          min: -1_000_000,
          max: 10_000_000,
          description: {
            vi: 'Lợi nhuận từ hoạt động kinh doanh, chưa trừ chi phí lãi vay và thuế.',
            en: 'Operating profit before deducting interest expense and tax.',
          },
        },
      ),
      sliderVar(
        'taxRate',
        { vi: 'Thuế suất thuế TNDN', en: 'Corporate income tax rate' },
        '%',
        20,
        0,
        50,
        0.5,
        {
          description: {
            vi: 'Thuế suất thực nộp của doanh nghiệp.',
            en: "The company's effective tax rate.",
          },
        },
      ),
      numberVar('depreciation', { vi: 'Khấu hao', en: 'Depreciation' }, 'tỷ ₫', 120, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Chi phí không bằng tiền, cộng ngược lại vào dòng tiền.',
          en: 'A non-cash expense, added back into cash flow.',
        },
      }),
      numberVar(
        'capex',
        { vi: 'Chi đầu tư tài sản cố định (CapEx)', en: 'Capital expenditure (CapEx)' },
        'tỷ ₫',
        180,
        {
          min: 0,
          max: 10_000_000,
          description: {
            vi: 'Tiền chi mua sắm, xây dựng tài sản cố định trong kỳ.',
            en: 'Cash spent purchasing or building fixed assets during the period.',
          },
        },
      ),
      numberVar(
        'nwcChange',
        { vi: 'Tăng vốn lưu động ròng (ΔNWC)', en: 'Increase in net working capital (ΔNWC)' },
        'tỷ ₫',
        40,
        {
          min: -1_000_000,
          max: 1_000_000,
          description: {
            vi: 'Âm nghĩa là vốn lưu động giảm, dòng tiền được cộng thêm.',
            en: 'Negative means working capital decreased, freeing up cash.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Số tiền doanh nghiệp thực sự tạo ra trong kỳ cho tất cả người góp vốn, sau khi đã nộp thuế và tái đầu tư để duy trì hoạt động.',
        en: 'The cash a company actually generates in the period for all capital providers, after paying tax and reinvesting to keep operations running.',
      },
      whenToUse: {
        vi: 'Làm dòng tiền gốc cho định giá DCF toàn doanh nghiệp, chiết khấu bằng WACC ra giá trị doanh nghiệp.',
        en: 'As the base cash flow for whole-firm DCF valuation, discounted by WACC to get enterprise value.',
      },
      howToRead: {
        vi: 'FCFF âm không hẳn là xấu — doanh nghiệp đang tăng trưởng có thể chi đầu tư lớn hơn dòng tiền tạo ra; điều cần xem là nó âm vì đầu tư hay vì kinh doanh yếu.',
        en: "A negative FCFF is not necessarily bad — a growing company may spend more on investment than the cash flow it generates; what matters is whether it's negative because of investment or because of weak operations.",
      },
      commonMistakes: {
        vi: 'Lấy lợi nhuận sau thuế thay cho EBIT × (1 − t) — làm vậy đã trừ lãi vay một lần rồi lại chiết khấu bằng WACC vốn đã chứa chi phí nợ, thành trừ hai lần.',
        en: 'Using net income instead of EBIT × (1 − t) — that already deducts interest once, and then discounting by WACC, which already includes the cost of debt, deducts it a second time.',
      },
    },
    example: {
      title: {
        vi: 'FPT năm 2025 — EBIT 13.848,8 tỷ ₫, thuế 20%, khấu hao 2.795,9 tỷ, CapEx 5.097,9 tỷ, ΔNWC 3.608,7 tỷ',
        en: 'FPT in 2025 — EBIT 13,848.8 billion ₫, tax 20%, depreciation 2,795.9 billion, CapEx 5,097.9 billion, ΔNWC 3,608.7 billion',
      },
      inputs: {
        ebit: 13_848.8,
        taxRate: 20,
        depreciation: 2_795.9,
        capex: 5_097.9,
        nwcChange: 3_608.7,
      },
      expected: 5_168,
      note: {
        vi: 'Dòng tiền tự do chỉ bằng khoảng 55% lợi nhuận sau thuế: phần chênh là tiền thật đã ra khỏi doanh nghiệp để xây trung tâm dữ liệu, văn phòng và để chôn vào phải thu, tồn kho khi doanh thu tăng. Lấy năm 2025 chứ không lấy nửa đầu 2026 vì kỳ ấy dòng tiền kinh doanh âm do vốn lưu động phình mạnh.',
        en: 'Free cash flow is only about 55% of net profit: the gap is real money that left the company to build data centers and offices, and to fund receivables and inventory as revenue grew. The 2025 figures are used rather than the first half of 2026, where operating cash flow turned negative as working capital ballooned.',
      },
      source: {
        vi: 'StockAnalysis, báo cáo tài chính năm 2025 của FPT Corp (mã FPT), chốt 15/09/2026.',
        en: 'StockAnalysis, FPT Corp’s (ticker FPT) 2025 financial statements, locked in 2026-09-15.',
      },
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
      {
        // Cùng bộ số trên nhưng thuế suất 0%: không còn khoản hoàn thuế ảo nào, nên phép tính
        // chạy bình thường — −100 + 120 − 180 − 40 = −200.
        name: 'EBIT âm ở thuế suất 0% vẫn tính được, vì không có lá chắn thuế để bịa',
        inputs: { ebit: -100, taxRate: 0, depreciation: 120, capex: 180, nwcChange: 40 },
        expected: -200,
      },
    ],
    source: [SOURCE_DAMODARAN_FCF, SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => {
    const ebit = v('ebit');

    /*
     * Chốt chặn hẹp lại đúng bằng lý do nó nêu: khoản hoàn thuế ảo CHỈ xuất hiện khi thuế suất
     * dương. Ở thuế suất 0% (giá trị hợp lệ của thanh trượt) số hạng EBIT × (1 − t) suy biến về
     * chính EBIT, và FCFF = EBIT + Khấu hao − CapEx − ΔVLĐ là định nghĩa chuẩn cho một năm lỗ —
     * Damodaran bỏ lá chắn thuế chứ không bỏ phép tính. Chặn rộng như trước là từ chối một ca
     * tính được, kèm một câu giải thích không đúng với bộ số người dùng đang nhập.
     */
    if (ebit < 0 && v('taxRate') > 0) {
      return fail(
        'tỷ ₫',
        meaningless(
          {
            vi: 'EBIT âm làm khoản EBIT × (1 − thuế suất) hàm ý một khoản hoàn thuế không có thật, kết quả mất ý nghĩa.',
            en: 'Negative EBIT makes EBIT × (1 − tax rate) imply a tax refund that does not exist, so the result is meaningless.',
          },
          {
            vi: 'Dùng kỳ có EBIT dương, hoặc ước tính FCFF từ dòng tiền hoạt động trên báo cáo lưu chuyển tiền tệ.',
            en: 'Use a period with positive EBIT, or estimate FCFF from operating cash flow on the cash flow statement.',
          },
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
    description: {
      vi: 'Tiền còn lại riêng cho cổ đông sau khi trả lãi vay sau thuế và điều chỉnh vay nợ ròng.',
      en: 'The cash left specifically for shareholders after paying after-tax interest and adjusting for net borrowing.',
    },
    latex: 'FCFE = FCFF - I \\, (1 - t) + \\Delta B',
    expression: {
      vi: 'FCFE = FCFF − Lãi vay sau thuế (Chi phí lãi vay × (1 − Thuế suất)) + Vay ròng mới',
      en: 'FCFE = FCFF − After-tax interest (Interest expense × (1 − Tax rate)) + New net borrowing',
    },
    /*
     * FCFE và FCFF KHÔNG ghi lại tên "dòng tiền tự do của …" (17/09/2026): hai dòng đứng sát nhau từng
     * ghi "dòng tiền tự do của cổ đông" và "dòng tiền tự do của doanh nghiệp", và chủ dự án khoanh cả
     * hai là "trùng nội dung". Công ty vốn là của cổ đông, nên hai cái tên đọc như một; chỗ khác nhau
     * thật là TRƯỚC hay SAU phần trả chủ nợ, nên bảng nói đúng điều đó. Tên đầy đủ vẫn ở tiêu đề trang
     * và nhãn ô FCFF.
     */
    symbols: [
      {
        latex: 'FCFE',
        meaning: {
          vi: 'phần dòng tiền dành riêng cho cổ đông, sau khi đã trả chủ nợ, tỷ ₫',
          en: 'cash flow left for shareholders alone, after creditors are paid, billion ₫',
        },
      },
      {
        latex: 'FCFF',
        meaning: {
          vi: 'dòng tiền kinh doanh sau thuế và tái đầu tư, chưa trả chủ nợ, tỷ ₫',
          en: 'cash flow after taxes and reinvestment, before creditors are paid, billion ₫',
        },
      },
      {
        latex: 'I',
        meaning: {
          vi: 'chi phí lãi vay trong kỳ, tỷ ₫',
          en: 'interest expense for the period, billion ₫',
        },
      },
      {
        latex: 't',
        meaning: { vi: 'thuế suất thuế TNDN, %', en: 'corporate income tax rate, %' },
      },
      {
        latex: '(1 - t)',
        meaning: {
          vi: 'hệ số sau thuế, chỉ phần lãi vay sau thuế mới bị trừ',
          en: 'after-tax factor, only the after-tax interest is subtracted',
        },
      },
      {
        latex: '\\Delta B',
        meaning: {
          vi: 'vay ròng mới, tiền vay thêm trừ nợ gốc đã trả trong kỳ, tỷ ₫',
          en: 'new net borrowing, new debt minus principal repaid in the period, billion ₫',
        },
      },
      {
        latex: '\\Delta',
        meaning: {
          vi: 'mức thay đổi trong kỳ, cuối kỳ trừ đầu kỳ',
          en: 'change over the period, end minus start',
        },
      },
    ],
    chartType: 'waterfall',
    /*
     * Nhãn chặng 'Lãi vay sau thuế' phải khớp chữ với cụm trong `expression` phía trên — chủ dự
     * án báo hình bóc tách hiện một chặng mà khối Công thức và khối Số liệu không nhắc tới ở đâu
     * cả, chỉ có "(1 − Thuế suất)" ẩn trong công thức chứ không đặt tên cho chặng.
     */
    breakdown: [
      { key: 'fcff', sign: 1, shortLabel: { vi: 'FCFF', en: 'FCFF' } },
      {
        key: 'interestAfterTax',
        sign: -1,
        shortLabel: { vi: 'Lãi vay sau thuế', en: 'After-tax interest' },
      },
      { key: 'netBorrowing', sign: 1, shortLabel: { vi: 'Vay ròng mới', en: 'New net borrowing' } },
    ],
    level: 'advanced',
    tags: ['fcfe', 'dong tien tu do co dong', 'dcf', 'free cash flow to equity'],
    resultUnit: 'tỷ ₫',
    variables: [
      numberVar(
        'fcff',
        { vi: 'Dòng tiền tự do của doanh nghiệp (FCFF)', en: 'Free cash flow to firm (FCFF)' },
        'tỷ ₫',
        300,
        {
          min: -1_000_000,
          max: 10_000_000,
          description: {
            vi: 'Kết quả từ công thức FCFF, hoặc nhập tay nếu đã có sẵn.',
            en: 'The result from the FCFF formula, or entered manually if already available.',
          },
        },
      ),
      numberVar('interest', { vi: 'Chi phí lãi vay', en: 'Interest expense' }, 'tỷ ₫', 60, {
        min: 0,
        max: 1_000_000,
        description: {
          vi: 'Tiền lãi phải trả cho chủ nợ trong kỳ.',
          en: 'Interest owed to creditors during the period.',
        },
      }),
      sliderVar(
        'taxRate',
        { vi: 'Thuế suất thuế TNDN', en: 'Corporate income tax rate' },
        '%',
        20,
        0,
        50,
        0.5,
        {
          description: {
            vi: 'Lãi vay được khấu trừ thuế nên chỉ trừ phần sau thuế.',
            en: 'Interest is tax-deductible, so only the after-tax portion is subtracted.',
          },
        },
      ),
      numberVar('netBorrowing', { vi: 'Vay ròng mới', en: 'New net borrowing' }, 'tỷ ₫', 30, {
        min: -1_000_000,
        max: 1_000_000,
        description: {
          vi: 'Tiền vay mới trừ nợ gốc đã trả trong kỳ; âm nghĩa là trả nợ nhiều hơn vay.',
          en: 'New borrowing minus principal repaid during the period; negative means repayments exceeded new borrowing.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Phần tiền cuối cùng thuộc về cổ đông sau khi chủ nợ đã nhận lãi và các khoản vay được vay thêm hay trả bớt.',
        en: 'The cash ultimately belonging to shareholders after creditors have received their interest and debt has been raised or repaid.',
      },
      whenToUse: {
        vi: 'Làm dòng tiền gốc cho định giá DCF phần vốn chủ, chiết khấu bằng chi phí vốn chủ từ CAPM — thay cho DDM khi doanh nghiệp trả cổ tức ít hơn khả năng.',
        en: 'As the base cash flow for equity DCF valuation, discounted by the cost of equity from CAPM — used in place of DDM when a company pays out less in dividends than it could afford.',
      },
      howToRead: {
        vi: 'FCFE cao hơn cổ tức thực trả nghĩa là doanh nghiệp còn dư địa tăng cổ tức hoặc mua lại cổ phiếu; thấp hơn kéo dài thì mức cổ tức hiện tại khó giữ.',
        en: 'FCFE higher than the actual dividend paid means the company has room to raise dividends or buy back shares; if it stays lower for a long time, the current dividend level is hard to sustain.',
      },
      commonMistakes: {
        vi: 'Chiết khấu FCFE bằng WACC — FCFE là dòng tiền của riêng cổ đông nên phải chiết khấu bằng chi phí vốn chủ.',
        en: 'Discounting FCFE with WACC — FCFE is a cash flow belonging solely to shareholders, so it must be discounted with the cost of equity.',
      },
    },
    example: {
      title: {
        vi: 'FPT năm 2025 — FCFF 5.168,3 tỷ ₫, lãi vay 809,8 tỷ, thuế 20%, vay ròng thêm 6.256,7 tỷ',
        en: 'FPT in 2025 — FCFF 5,168.3 billion ₫, interest 809.8 billion, tax 20%, new net borrowing 6,256.7 billion',
      },
      inputs: { fcff: 5_168.3, interest: 809.8, taxRate: 20, netBorrowing: 6_256.7 },
      expected: 10_777,
      note: {
        vi: 'Kết quả cao hơn cả FCFF lẫn lợi nhuận sau thuế chỉ vì khoản vay ròng trong năm — tiền vay là tiền cổ đông được dùng ngay. Đây là bẫy đọc kinh điển: khi vay ròng đảo chiều sang âm, FCFE sụt mạnh dù hoạt động kinh doanh không đổi.',
        en: 'The figure exceeds both FCFF and net profit purely because of the net borrowing during the year — borrowed money is cash shareholders can use straight away. That is the classic reading trap: when net borrowing turns negative, FCFE drops sharply even though the underlying business has not changed.',
      },
      source: {
        vi: 'StockAnalysis, bảng cân đối kế toán và kết quả kinh doanh 2024–2025 của FPT Corp (mã FPT), chốt 15/09/2026.',
        en: 'StockAnalysis, FPT Corp’s (ticker FPT) 2024–2025 balance sheet and income statement, locked in 2026-09-15.',
      },
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
          {
            vi: 'Chi phí lãi vay âm không có ý nghĩa — doanh nghiệp không được chủ nợ trả lãi.',
            en: 'A negative interest expense makes no sense — a company is not paid interest by its creditors.',
          },
          {
            vi: 'Nhập chi phí lãi vay từ 0 trở lên; thu nhập lãi ghi ở dòng khác của báo cáo.',
            en: 'Enter interest expense as 0 or greater; interest income is recorded on a different line of the statement.',
          },
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
    description: {
      vi: 'Chiết khấu dòng tiền tự do của doanh nghiệp bằng WACC, trừ nợ ròng, chia cho số cổ phiếu.',
      en: "Discounting the firm's free cash flow by WACC, subtracting net debt, and dividing by the share count.",
    },
    latex:
      'V_0 = \\frac{\\dfrac{FCFF \\, (1+g)}{WACC - g} - D_{\\text{ròng}}}{\\text{Số CP}} \\times 1000',
    expression: {
      vi: 'Giá trị nội tại = (FCFF × (1 + g) ÷ (WACC − g) − Nợ vay ròng) ÷ Số cổ phiếu lưu hành × 1.000',
      en: 'Intrinsic value = (FCFF × (1 + g) ÷ (WACC − g) − Net debt) ÷ Shares outstanding × 1,000',
    },
    symbols: [
      {
        latex: 'V_0',
        meaning: {
          vi: 'giá trị nội tại của mỗi cổ phiếu ở hôm nay, ₫',
          en: 'intrinsic value per share today, ₫',
        },
      },
      {
        latex: 'FCFF',
        meaning: {
          vi: 'dòng tiền tự do của doanh nghiệp kỳ vừa rồi, tỷ ₫',
          en: 'free cash flow to the firm in the latest period, billion ₫',
        },
      },
      {
        latex: 'g',
        meaning: { vi: 'tăng trưởng FCFF dài hạn, %/năm', en: 'long-term FCFF growth, %/year' },
      },
      {
        latex: 'WACC',
        meaning: {
          vi: 'chi phí vốn bình quân, dùng làm suất chiết khấu, %/năm',
          en: 'weighted average cost of capital, used as the discount rate, %/year',
        },
      },
      {
        latex: '\\dfrac{FCFF \\, (1+g)}{WACC - g}',
        meaning: {
          vi: 'giá trị doanh nghiệp, toàn bộ dòng tiền tương lai quy về hôm nay, tỷ ₫',
          en: 'enterprise value, all future cash flow brought back to today, billion ₫',
        },
      },
      {
        latex: 'D_{\\text{ròng}}',
        meaning: {
          vi: 'nợ vay ròng, nợ vay chịu lãi trừ tiền và tương đương tiền, tỷ ₫',
          en: 'net debt, interest-bearing debt minus cash and equivalents, billion ₫',
        },
      },
      {
        latex: '\\text{Số CP}',
        meaning: { vi: 'số cổ phiếu lưu hành, triệu CP', en: 'shares outstanding, millions' },
      },
      {
        latex: '1000',
        meaning: {
          vi: 'đổi tỷ ₫ chia triệu CP thành ₫ trên mỗi cổ phiếu',
          en: 'converts billion ₫ per million shares into ₫ per share',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['dcf', 'gia tri noi tai', 'chiet khau dong tien', 'fcff', 'intrinsic value'],
    resultUnit: '₫',
    variables: [
      numberVar(
        'fcff',
        { vi: 'Dòng tiền tự do của doanh nghiệp (FCFF)', en: 'Free cash flow to firm (FCFF)' },
        'tỷ ₫',
        300,
        {
          min: -1_000_000,
          max: 10_000_000,
          description: {
            vi: 'Kết quả từ công thức FCFF, hoặc nhập tay nếu đã có sẵn.',
            en: 'The result from the FCFF formula, or entered manually if already available.',
          },
        },
      ),
      sliderVar(
        'growth',
        { vi: 'Tăng trưởng FCFF dài hạn (g)', en: 'Long-term FCFF growth (g)' },
        '%',
        4,
        0,
        10,
        0.1,
        {
          description: {
            vi: 'Tốc độ tăng dòng tiền đều mãi mãi — nên quanh tăng trưởng GDP dài hạn.',
            en: 'The rate at which cash flow grows steadily forever — should be close to long-term GDP growth.',
          },
        },
      ),
      sliderVar(
        'wacc',
        { vi: 'Chi phí vốn bình quân (WACC)', en: 'Weighted average cost of capital (WACC)' },
        '%',
        10.7,
        0,
        30,
        0.1,
        {
          description: {
            vi: 'Suất chiết khấu cho dòng tiền của cả doanh nghiệp — thường lấy từ WACC.',
            en: "The discount rate for the whole firm's cash flow — usually taken from the WACC formula.",
          },
        },
      ),
      numberVar('netDebt', { vi: 'Nợ vay ròng', en: 'Net debt' }, 'tỷ ₫', 300, {
        min: -1_000_000,
        max: 10_000_000,
        description: {
          vi: 'Nợ vay chịu lãi trừ tiền và tương đương tiền; âm nghĩa là tiền nhiều hơn nợ.',
          en: 'Interest-bearing debt minus cash and cash equivalents; negative means cash exceeds debt.',
        },
      }),
      numberVar(
        'shares',
        { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
        'triệu CP',
        118,
        {
          min: 0,
          max: 100_000,
          description: {
            vi: 'Số cổ phiếu đang lưu hành, tính bằng triệu.',
            en: 'The number of shares outstanding, in millions.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Toàn bộ dòng tiền doanh nghiệp tạo ra trong tương lai, quy về hôm nay, trả nợ xong rồi chia đều cho từng cổ phiếu.',
        en: 'All the cash a company will generate in the future, brought back to today, with debt paid off and the remainder split evenly across shares.',
      },
      whenToUse: {
        vi: 'Khi doanh nghiệp có dòng tiền dương và ổn định nhưng trả cổ tức ít hơn khả năng — lúc đó mô hình cổ tức định giá thấp hơn thực chất.',
        en: 'When a company has positive, stable cash flow but pays out less in dividends than it could afford — a dividend model would then undervalue it.',
      },
      howToRead: {
        vi: 'So con số này với thị giá: cao hơn nhiều là cổ phiếu đang rẻ theo mô hình. Kết quả cực nhạy với hiệu WACC − g, nên hãy thử vài kịch bản thay vì tin một con số.',
        en: 'Compare this figure with the market price: much higher means the stock looks cheap under this model. The result is extremely sensitive to the WACC − g spread, so try several scenarios rather than trusting a single number.',
      },
      commonMistakes: {
        vi: 'Chọn g gần bằng WACC làm giá trị phồng lên vô lý; và quên trừ nợ vay ròng — đó là phần thuộc về chủ nợ, không phải cổ đông.',
        en: 'Picking a g close to WACC inflates the value absurdly; and forgetting to subtract net debt — that portion belongs to creditors, not shareholders.',
      },
    },
    example: {
      title: {
        vi: 'FPT — FCFF 5.168,3 tỷ ₫, tăng 5%/năm, WACC 9,37%, nợ vay ròng −11.527,6 tỷ, 1.714,33 triệu CP',
        en: 'FPT — FCFF 5,168.3 billion ₫, growing 5%/year, WACC 9.37%, net debt −11,527.6 billion, 1,714.33 million shares',
      },
      inputs: { fcff: 5_168.3, growth: 5, wacc: 9.37, netDebt: -11_527.6, shares: 1_714.33 },
      expected: 79_161,
      note: {
        vi: 'Nợ vay ròng âm nghĩa là FPT giữ tiền và đầu tư tài chính ngắn hạn nhiều hơn nợ vay, nên phần ấy cộng thêm vào giá trị của cổ đông. Kết quả phụ thuộc nặng vào hiệu WACC − g: hạ g một điểm phần trăm là giá trị rơi hơn 20%, nên bản định giá nghiêm túc luôn kèm bảng độ nhạy hai chiều thay vì một con số duy nhất.',
        en: 'Negative net debt means FPT holds more cash and short-term investments than borrowings, so that balance adds to the shareholders’ share. The result leans heavily on the WACC − g spread: cutting g by one percentage point takes over 20% off the value, which is why a serious valuation always ships a two-way sensitivity table instead of a single figure.',
      },
      source: {
        vi: 'CafeF, bảng cân đối kế toán ngày 30/06/2026 của FPT Corp (mã FPT), chốt 15/09/2026.',
        en: 'CafeF, FPT Corp’s (ticker FPT) balance sheet at 2026-06-30, locked in 2026-09-15.',
      },
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
          { vi: 'giá trị nội tại', en: 'intrinsic value' },
          { vi: 'Số cổ phiếu lưu hành', en: 'shares outstanding' },
          {
            vi: 'Nhập số cổ phiếu đang lưu hành lớn hơn 0.',
            en: 'Enter a share count greater than 0.',
          },
        ),
      );
    }

    if (fcff <= 0) {
      return fail(
        '₫',
        meaningless(
          {
            vi: 'FCFF bằng 0 hoặc âm thì mô hình tăng trưởng đều cho ra giá trị doanh nghiệp bằng 0 hoặc âm — không còn gì để chia cho cổ đông, nên cách này không định giá được.',
            en: 'A zero or negative FCFF makes the steady-growth model produce a negative enterprise value — this method cannot value the company.',
          },
          {
            vi: 'Dùng kỳ có dòng tiền dương, hoặc ước tính FCFF bình thường hoá của vài năm gần nhất.',
            en: 'Use a period with positive cash flow, or estimate a normalized FCFF from recent years.',
          },
        ),
      );
    }

    if (wacc === growth) {
      return fail(
        '₫',
        divideByZero(
          { vi: 'giá trị doanh nghiệp', en: 'enterprise value' },
          { vi: 'hiệu WACC − g', en: 'the WACC − g spread' },
          {
            vi: 'Nhập WACC lớn hơn tăng trưởng dài hạn g.',
            en: 'Enter a WACC greater than the long-term growth rate g.',
          },
        ),
      );
    }

    if (wacc < growth) {
      return fail(
        '₫',
        meaningless(
          {
            vi: 'Mô hình chỉ dùng được khi WACC lớn hơn tăng trưởng g — g vượt WACC cho ra giá trị âm vô nghĩa.',
            en: 'The model only works when WACC is greater than the growth rate g — g exceeding WACC produces a meaningless negative value.',
          },
          {
            vi: 'Giảm g về mức bền vững dài hạn (thường quanh tăng trưởng GDP) hoặc xem lại WACC.',
            en: 'Lower g to a sustainable long-term level (usually near GDP growth) or review WACC.',
          },
        ),
      );
    }

    const enterpriseValue = (fcff * (1 + growth / 100)) / ((wacc - growth) / 100);
    const equityValue = enterpriseValue - v('netDebt');

    if (equityValue <= 0) {
      return fail(
        '₫',
        meaningless(
          {
            vi: 'Nợ vay ròng lớn hơn cả giá trị doanh nghiệp, nên phần còn lại cho cổ đông là số âm.',
            en: 'Net debt exceeds the enterprise value itself, so the remainder for shareholders is negative.',
          },
          {
            vi: 'Kiểm tra lại nợ vay ròng, hoặc xem lại giả định tăng trưởng và WACC.',
            en: 'Double-check net debt, or review the growth and WACC assumptions.',
          },
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
    description: {
      vi: 'Một khoản tiền trong tương lai đáng giá bao nhiêu ở hôm nay.',
      en: 'How much a future sum of money is worth today.',
    },
    latex: 'PV = \\frac{FV}{(1 + r)^n}',
    expression: {
      vi: 'Giá trị hiện tại = Số tiền tương lai ÷ (1 + Tỷ lệ chiết khấu)^Số năm',
      en: 'Present value = Future amount ÷ (1 + Discount rate)^Years',
    },
    symbols: [
      {
        latex: 'PV',
        meaning: {
          vi: 'giá trị hiện tại, số tiền hôm nay tương đương khoản tương lai, ₫',
          en: 'present value, the amount today equivalent to the future sum, ₫',
        },
      },
      {
        latex: 'FV',
        meaning: {
          vi: 'số tiền sẽ nhận trong tương lai, ₫',
          en: 'amount to be received in the future, ₫',
        },
      },
      { latex: 'r', meaning: { vi: 'tỷ lệ chiết khấu, %/năm', en: 'discount rate, %/year' } },
      {
        latex: 'n',
        meaning: {
          vi: 'số năm từ hôm nay tới lúc nhận tiền',
          en: 'number of years from today until the money is received',
        },
      },
      {
        latex: '(1 + r)^n',
        meaning: {
          vi: 'hệ số lãi kép sau n năm, lần',
          en: 'compounding factor after n years, times',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['pv', 'gia tri hien tai', 'chiet khau', 'present value'],
    resultUnit: '₫',
    variables: [
      numberVar(
        'futureValue',
        { vi: 'Số tiền trong tương lai (FV)', en: 'Future amount (FV)' },
        '₫',
        1_000_000_000,
        {
          min: 0,
          max: 1_000_000_000_000,
          description: {
            vi: 'Khoản tiền sẽ nhận được vào cuối kỳ.',
            en: 'The amount to be received at the end of the period.',
          },
        },
      ),
      sliderVar(
        'rate',
        { vi: 'Tỷ lệ chiết khấu / năm', en: 'Discount rate / year' },
        '%',
        8,
        0,
        30,
        0.1,
        {
          description: {
            vi: 'Mức sinh lợi lẽ ra kiếm được nếu có tiền ngay hôm nay.',
            en: 'The return that could otherwise be earned if the money were available today.',
          },
        },
      ),
      sliderVar('years', { vi: 'Số năm', en: 'Years' }, 'năm', 10, 1, 50, 1, {
        description: {
          vi: 'Khoảng cách từ hôm nay tới lúc nhận tiền.',
          en: 'The time from today until the money is received.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Tiền nhận sau mới rẻ hơn tiền nhận ngay, vì tiền có ngay còn sinh lợi được — PV quy mọi khoản tương lai về cùng thước đo hôm nay.',
        en: 'Money received later is worth less than money received now, because money in hand can earn a return — PV converts every future amount to the same measuring stick, today.',
      },
      whenToUse: {
        vi: 'Khi so sánh các khoản tiền nhận ở thời điểm khác nhau, hoặc làm viên gạch cho DDM, DCF, NPV.',
        en: 'When comparing amounts received at different points in time, or as a building block for DDM, DCF, and NPV.',
      },
      howToRead: {
        vi: 'Con số là số tiền hôm nay tương đương với khoản tiền tương lai: 1 tỷ ₫ nhận sau 10 năm, chiết khấu 8%/năm, chỉ đáng khoảng 463 triệu ₫ ở hôm nay. Hãy đem nó so với cái giá phải trả ngay bây giờ để có khoản tiền ấy, hoặc so với một khoản khác đã quy về cùng mốc hôm nay — đó là cách duy nhất để hai khoản tiền ở hai thời điểm so được với nhau.',
        en: 'The figure is the amount today that is equivalent to that future sum: 1 billion ₫ received in 10 years, discounted at 8%/year, is worth only about 463 million ₫ today. Compare it with the price you would have to pay right now to secure that sum, or with another amount already brought back to today — that is the only way two amounts at two different dates can be compared.',
      },
      commonMistakes: {
        vi: 'Chọn tỷ lệ chiết khấu tuỳ hứng — nó phải phản ánh mức rủi ro của chính khoản tiền đó, tiền chắc chắn chiết khấu thấp, tiền bấp bênh chiết khấu cao.',
        en: 'Picking a discount rate arbitrarily — it should reflect the riskiness of that specific cash flow: a sure amount is discounted lightly, an uncertain one heavily.',
      },
    },
    example: {
      title: {
        vi: 'Cần bao nhiêu hôm nay để có 1 tỷ ₫ sau 10 năm, lãi suất gửi 6,8%/năm (tháng 9/2026)',
        en: 'How much is needed today to hold 1 billion ₫ in 10 years at a 6.8%/year deposit rate (September 2026)',
      },
      inputs: { futureValue: 1_000_000_000, rate: 6.8, years: 10 },
      expected: 517_949_565,
      note: {
        vi: 'Hơn một nửa mục tiêu phải có sẵn ngay từ đầu, phần còn lại do lãi kép làm ra trong mười năm. Con số bỏ qua lạm phát: với CPI bình quân 4,45%/năm, mục tiêu ấy sau mười năm chỉ còn sức mua tương đương khoảng 645 triệu ₫ hôm nay.',
        en: 'More than half the target must already be in hand at the start; compounding produces the rest over ten years. The figure ignores inflation: at an average CPI of 4.45%/year, that target ten years out is worth only about 645 million ₫ in today’s purchasing power.',
      },
      source: {
        vi: 'VietNamNet, lãi suất tiết kiệm trực tuyến 12 tháng của Agribank, BIDV, Vietcombank và VietinBank, tháng 9/2026.',
        en: 'VietNamNet, 12-month online deposit rates at Agribank, BIDV, Vietcombank and VietinBank, September 2026.',
      },
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
          { vi: 'giá trị hiện tại', en: 'present value' },
          { vi: 'mẫu số (1 + r) lũy thừa n', en: 'the (1 + r)^n denominator' },
          {
            vi: 'Nhập tỷ lệ chiết khấu lớn hơn −100%.',
            en: 'Enter a discount rate greater than −100%.',
          },
        ),
      );
    }

    if (base < 0) {
      return fail(
        '₫',
        meaningless(
          {
            vi: 'Tỷ lệ chiết khấu dưới −100% mỗi năm không có ý nghĩa kinh tế.',
            en: 'A discount rate below −100% per year has no economic meaning.',
          },
          {
            vi: 'Nhập tỷ lệ chiết khấu lớn hơn −100%.',
            en: 'Enter a discount rate greater than −100%.',
          },
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
    description: {
      vi: 'Một khoản tiền hôm nay lớn thành bao nhiêu sau nhiều năm sinh lợi kép.',
      en: 'How much a sum of money today grows to after years of compounding.',
    },
    latex: 'FV = PV \\, (1 + r)^n',
    expression: {
      vi: 'Giá trị tương lai = Số tiền hiện tại × (1 + Tỷ suất sinh lợi)^Số năm',
      en: 'Future value = Present amount × (1 + Rate of return)^Years',
    },
    symbols: [
      {
        latex: 'FV',
        meaning: {
          vi: 'giá trị tương lai, số tiền có được ở cuối kỳ, ₫',
          en: 'future value, the amount held at the end of the period, ₫',
        },
      },
      {
        latex: 'PV',
        meaning: { vi: 'số tiền đang có ở hôm nay, ₫', en: 'amount of money available today, ₫' },
      },
      {
        latex: 'r',
        meaning: { vi: 'tỷ suất sinh lợi kép, %/năm', en: 'compound rate of return, %/year' },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'số năm khoản tiền sinh lợi',
          en: 'number of years the money is invested',
        },
      },
      {
        latex: '(1 + r)^n',
        meaning: {
          vi: 'hệ số lãi kép sau n năm, lần',
          en: 'compounding factor after n years, times',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['fv', 'gia tri tuong lai', 'lai gop', 'future value'],
    resultUnit: '₫',
    variables: [
      numberVar(
        'presentValue',
        { vi: 'Số tiền hiện tại (PV)', en: 'Present amount (PV)' },
        '₫',
        100_000_000,
        {
          min: 0,
          max: 1_000_000_000_000,
          description: {
            vi: 'Khoản tiền đang có ở hôm nay.',
            en: 'The amount of money available today.',
          },
        },
      ),
      sliderVar(
        'rate',
        { vi: 'Tỷ suất sinh lợi / năm', en: 'Rate of return / year' },
        '%',
        10,
        -10,
        30,
        0.1,
        {
          description: {
            vi: 'Mức sinh lợi kép mỗi năm; âm nếu tài sản mất giá.',
            en: 'The compound return each year; negative if the asset loses value.',
          },
        },
      ),
      sliderVar('years', { vi: 'Số năm', en: 'Years' }, 'năm', 15, 1, 50, 1, {
        description: {
          vi: 'Thời gian để khoản tiền sinh lợi.',
          en: 'The length of time the money is invested.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Chiều ngược của giá trị hiện tại: tiền hôm nay cộng dồn sinh lợi kép sẽ thành bao nhiêu vào một mốc tương lai.',
        en: 'The mirror of present value: how much money today becomes, after accumulating compound returns, at a future point in time.',
      },
      whenToUse: {
        vi: 'Khi ước tính một khoản đầu tư một lần sẽ lớn tới đâu, hoặc đặt mục tiêu tài sản cho ngày nghỉ hưu.',
        en: 'When estimating how large a one-time investment will grow, or setting an asset target for retirement.',
      },
      howToRead: {
        vi: 'Con số là số tiền bạn sẽ có ở cuối kỳ nếu mức sinh lợi giả định giữ nguyên suốt thời gian đó: 100 triệu ₫ để yên 15 năm ở 10%/năm thành gần 418 triệu ₫. Đem nó so với mục tiêu bạn đặt cho mốc thời gian ấy — còn thiếu thì thử lại với vốn ban đầu lớn hơn hoặc thời gian dài hơn, chờ thêm 5 năm nữa con số đã lên hơn 670 triệu ₫.',
        en: 'The figure is what you would hold at the end of the period if the assumed return holds throughout: 100 million ₫ left alone for 15 years at 10%/year becomes nearly 418 million ₫. Compare it with the target you set for that date — if it falls short, try again with a larger starting amount or a longer horizon; waiting another 5 years already takes the figure past 670 million ₫.',
      },
      commonMistakes: {
        vi: 'Quên trừ lạm phát: con số tương lai là tiền danh nghĩa, sức mua thực của nó thấp hơn con số hiện ra.',
        en: 'Forgetting to account for inflation: the future figure is nominal money, and its real purchasing power is lower than the number shown.',
      },
    },
    example: {
      title: {
        vi: 'Gửi 100 triệu ₫ kỳ hạn 12 tháng, lãi 6,8%/năm (tháng 9/2026), giữ 10 năm',
        en: 'Depositing 100 million ₫ on a 12-month term at 6.8%/year (September 2026), held for 10 years',
      },
      inputs: { presentValue: 100_000_000, rate: 6.8, years: 10 },
      expected: 193_068_991,
      note: {
        vi: 'Gần gấp đôi sau mười năm, khớp quy tắc 72 (72 ÷ 6,8 ≈ 10,6 năm để nhân đôi). Con số chỉ đúng khi lãi được nhập gốc mỗi kỳ và lãi suất giữ nguyên suốt chặng — thực tế không ngân hàng nào cam kết mức lãi suất mười năm.',
        en: 'Nearly double after ten years, in line with the rule of 72 (72 ÷ 6.8 ≈ 10.6 years to double). The figure only holds if interest is rolled back into the principal each period and the rate stays put the whole way — in practice no bank commits to a rate for ten years.',
      },
      source: {
        vi: 'VietNamNet, lãi suất tiết kiệm trực tuyến kỳ hạn 12 tháng nhóm Big4, tháng 9/2026.',
        en: 'VietNamNet, 12-month online deposit rates across the Big 4 banks, September 2026.',
      },
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
          {
            vi: 'Tỷ suất sinh lợi dưới −100% mỗi năm không có ý nghĩa — không thể mất nhiều hơn toàn bộ số tiền.',
            en: 'A rate of return below −100% per year makes no sense — you cannot lose more than the entire amount.',
          },
          {
            vi: 'Nhập tỷ suất sinh lợi từ −100% trở lên.',
            en: 'Enter a rate of return of −100% or greater.',
          },
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
    description: {
      vi: 'Thị giá đang thấp hơn giá trị nội tại ước tính bao nhiêu phần trăm.',
      en: 'How many percent the market price sits below the estimated intrinsic value.',
    },
    latex: 'MOS = \\frac{V - P}{V} \\times 100\\%',
    expression: {
      vi: 'Biên an toàn = (Giá trị nội tại − Thị giá) ÷ Giá trị nội tại × 100%',
      en: 'Margin of safety = (Intrinsic value − Market price) ÷ Intrinsic value × 100%',
    },
    symbols: [
      { latex: 'MOS', meaning: { vi: 'biên an toàn, %', en: 'margin of safety, %' } },
      {
        latex: 'V',
        meaning: {
          vi: 'giá trị nội tại ước tính từ một mô hình định giá, ₫',
          en: 'estimated intrinsic value from a valuation model, ₫',
        },
      },
      {
        latex: 'P',
        meaning: {
          vi: 'thị giá hiện tại của cổ phiếu, ₫',
          en: 'current market price of the stock, ₫',
        },
      },
      { latex: '100\\%', meaning: { vi: 'đổi ra phần trăm', en: 'converts to a percentage' } },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['bien an toan', 'margin of safety', 'gia tri noi tai', 'graham', 'dinh gia'],
    resultUnit: '%',
    variables: [
      numberVar(
        'intrinsic',
        // `V` và `P` là đúng hai ký hiệu latex của công thức này (MOS = (V − P) ÷ V) — buổi test
        // nội bộ nêu đích danh Biên an toàn là chỗ thiếu ký hiệu ở ô nhập.
        { vi: 'Giá trị nội tại ước tính (V)', en: 'Estimated intrinsic value (V)' },
        '₫',
        40_000,
        {
          min: 0,
          max: 10_000_000,
          description: {
            vi: 'Kết quả từ một mô hình định giá: Gordon, DDM hai giai đoạn, DCF…',
            en: 'The result from a valuation model: Gordon, two-stage DDM, DCF…',
          },
        },
      ),
      numberVar(
        'price',
        { vi: 'Thị giá hiện tại (P)', en: 'Current market price (P)' },
        '₫',
        30_000,
        {
          min: 0,
          max: 10_000_000,
          description: {
            vi: 'Giá đóng cửa gần nhất của cổ phiếu.',
            en: "The stock's most recent closing price.",
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Khoảng đệm giữa giá mua và giá trị ước tính — chỗ dựa khi chính ước tính của mình sai lệch.',
        en: 'The cushion between the purchase price and the estimated value — a buffer for when your own estimate turns out to be wrong.',
      },
      whenToUse: {
        vi: 'Bước cuối của mọi chuỗi định giá: có giá trị nội tại rồi, so với thị giá để quyết định mua hay chờ.',
        en: 'The final step of any valuation chain: once you have an intrinsic value, compare it with the market price to decide whether to buy or wait.',
      },
      howToRead: {
        vi: 'Biên 25% nghĩa là mua rẻ hơn ước tính một phần tư; biên âm nghĩa là đang trả giá cao hơn giá trị tính ra. Trường phái đầu tư giá trị thường đòi biên 20–50%.',
        en: 'A 25% margin means buying a quarter cheaper than the estimate; a negative margin means paying more than the computed value. Value investors typically demand a margin of 20–50%.',
      },
      commonMistakes: {
        vi: 'Tin con số tuyệt đối của biên trong khi giá trị nội tại chỉ là ước tính — biên an toàn lớn không cứu được một mô hình định giá sai đầu vào.',
        en: "Trusting the margin's absolute number when the intrinsic value is only an estimate — a large margin of safety cannot rescue a valuation model built on wrong inputs.",
      },
    },
    example: {
      title: {
        vi: 'FPT — thị giá 72.700 ₫ phiên 11/09/2026 so với giá trị nội tại 79.161 ₫ từ DCF',
        en: 'FPT — market price 72,700 ₫ on 2026-09-11 against an intrinsic value of 79,161 ₫ from DCF',
      },
      inputs: { intrinsic: 79_161, price: 72_700 },
      expected: 8.1618,
      note: {
        vi: 'Giá trị nội tại lấy nguyên từ mô hình DCF ở trên, nên biên này thừa hưởng mọi giả định của mô hình đó. Graham đòi biên tối thiểu 30–50% chính vì lý do ấy: ở mức đệm chưa tới mười điểm phần trăm, chỉ một giả định lệch nhẹ là kết luận đảo chiều.',
        en: 'The intrinsic value is taken straight from the DCF model above, so this margin inherits every assumption that model makes. Graham asked for at least 30–50% for exactly that reason: with a cushion under ten percentage points, a single assumption drifting slightly flips the conclusion.',
      },
      source: {
        vi: 'Investing.com, giá đóng cửa FPT Corp (mã FPT) phiên 11/09/2026.',
        en: 'Investing.com, FPT Corp’s (ticker FPT) closing price on 2026-09-11.',
      },
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
     * Ô này vẫn nhập tay được: ai định giá bằng DDM hai giai đoạn hay bằng bội số thì gõ đè lên.
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
          { vi: 'biên an toàn', en: 'margin of safety' },
          { vi: 'giá trị nội tại', en: 'intrinsic value' },
          {
            vi: 'Ước tính giá trị nội tại bằng một mô hình định giá trước.',
            en: 'Estimate the intrinsic value with a valuation model first.',
          },
        ),
      );
    }

    if (intrinsic < 0) {
      return fail(
        '%',
        meaningless(
          {
            vi: 'Giá trị nội tại âm làm biên an toàn mất ý nghĩa.',
            en: 'A negative intrinsic value makes the margin of safety meaningless.',
          },
          {
            vi: 'Xem lại mô hình định giá — bộ giả định đầu vào đang cho ra giá trị âm.',
            en: 'Review the valuation model — the current input assumptions are producing a negative value.',
          },
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
