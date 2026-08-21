/**
 * Tầng DOMAIN — nhóm lợi nhuận & cổ tức, phần bổ sung (gói WBS 5.1.3).
 *
 * Chín công thức vô hướng đưa nhóm 'returns' từ 4 lên đủ 13 theo SRS 3.8. Tất cả chỉ dùng
 * ô nhập số — XIRR cần bảng dòng tiền có ngày nên vẫn chờ gói 3.3.1, xem ghi chú ở
 * `returns.ts`.
 *
 * Con số trong `tests[]` được tính độc lập bằng công thức dạng đóng (script Node chạy trước
 * khi viết hàm), theo đúng luật của README thư viện công thức.
 *
 * Quy ước lợi suất: mọi biến `%` nhập theo con số người đọc quen nhìn (8 nghĩa là 8%),
 * đổi sang hệ số nhân trong thân hàm — cùng quy ước CON-05 với các nhóm khác.
 * Lợi suất DƯỚI −100% nghĩa là mất nhiều hơn vốn bỏ ra, không xảy ra với vị thế mua
 * thông thường — mọi công thức trong file coi đó là `MEANINGLESS`, cùng một giọng.
 */

import { ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import type { Bilingual, CalcWarning, VariableSpec } from '../types';
import { divideByZero, meaningless } from '../warnings';
import type { FormulaSource } from '../registry/types';
import { SOURCE_CFA, numberVar, sliderVar } from './shared';

/** Nguồn dùng chung của cả nhóm — giáo trình đầu tư kinh điển, chương về lợi suất. */
const SOURCE_INVESTMENTS: FormulaSource = {
  label: {
    vi: 'Bodie, Kane & Marcus — Investments, ấn bản 12 (McGraw-Hill), chương 5: Risk, Return, and the Historical Record',
    en: 'Bodie, Kane & Marcus — Investments, 12th edition (McGraw-Hill), chapter 5: Risk, Return, and the Historical Record',
  },
};

/** Cảnh báo chung khi một ô lợi suất nhập dưới −100%. */
function belowTotalLoss(label: Bilingual): CalcWarning {
  return meaningless(
    {
      vi: `${label.vi} dưới −100% nghĩa là mất nhiều hơn số vốn bỏ ra — không xảy ra với vị thế mua thông thường.`,
      en: `${label.en} below −100% would mean losing more than the capital put in — this cannot happen with an ordinary long position.`,
    },
    {
      vi: `Kiểm tra lại ô ${label.vi}: mất sạch vốn thì nhập đúng −100.`,
      en: `Check the ${label.en} field again: if the capital is wiped out entirely, enter exactly −100.`,
    },
  );
}

/*
 * ── 1. Lợi suất năm hoá từ lợi suất kỳ ngắn ────────────────────────────────────────────
 */

export const LOI_SUAT_NAM_HOA: FormulaModule = {
  spec: {
    id: 'loi-suat-nam-hoa',
    categoryId: 'returns',
    name: { vi: 'Lợi suất năm hoá', en: 'Annualized return' },
    description: {
      vi: 'Quy một lợi suất kỳ ngắn (tháng, tuần…) về mức tương đương cả năm theo lãi kép.',
      en: 'Converts a short-period return (monthly, weekly…) into its compound-interest equivalent for a full year.',
    },
    latex: 'r_{nam} = (1 + r_{ky})^{m} - 1',
    expression: {
      vi: 'Lợi suất năm = (1 + Lợi suất một kỳ)^Số kỳ trong năm − 1',
      en: 'Annual return = (1 + Return per period)^Number of periods per year − 1',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['nam hoa', 'annualized', 'quy nam', 'loi suat ky'],
    resultUnit: '%',
    variables: [
      numberVar('periodReturn', { vi: 'Lợi suất một kỳ', en: 'Return per period' }, '%', 2, {
        min: -100,
        max: 100,
        description: {
          vi: 'Lợi suất của một kỳ ngắn, ví dụ 2 nghĩa là 2%/tháng.',
          en: 'The return for one short period, e.g. 2 means 2% per month.',
        },
      }),
      sliderVar(
        'periodsPerYear',
        { vi: 'Số kỳ trong một năm', en: 'Number of periods per year' },
        'kỳ',
        12,
        1,
        365,
        1,
        {
          description: {
            vi: 'Tháng là 12, tuần là 52, ngày giao dịch khoảng 250.',
            en: 'Monthly is 12, weekly is 52, trading days are roughly 250.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Nếu lặp lại đúng lợi suất kỳ ngắn đó suốt một năm thì cả năm lãi bao nhiêu.',
        en: 'How much the whole year would gain if that same short-period return repeated every period.',
      },
      whenToUse: {
        vi: 'Khi so một khoản lãi vài tuần, vài tháng với lãi suất tiết kiệm tính theo năm.',
        en: 'When comparing a gain earned over a few weeks or months against a savings rate quoted per year.',
      },
      howToRead: {
        vi: 'Vì tính theo lãi kép nên kết quả cao hơn phép nhân đơn thuần: 2%/tháng ra 26,8%/năm chứ không phải 24%.',
        en: 'Because it compounds, the result is higher than simple multiplication: 2%/month becomes 26.8%/year, not 24%.',
      },
      commonMistakes: {
        vi: 'Coi con số năm hoá là mức chắc chắn đạt được — nó chỉ đúng nếu kỳ nào cũng lặp lại y hệt, điều hiếm khi xảy ra.',
        en: 'Treating the annualized figure as a guaranteed outcome — it only holds if every period repeats identically, which rarely happens.',
      },
    },
    example: {
      title: { vi: 'Lãi 2%/tháng, quy về năm', en: 'A 2%/month gain, annualized' },
      inputs: { periodReturn: 2, periodsPerYear: 12 },
      expected: 26.82,
      note: {
        vi: 'Cao hơn 24% của phép nhân đơn vì lãi kỳ trước tiếp tục sinh lãi.',
        en: 'Higher than the 24% from simple multiplication because each period keeps earning on prior gains.',
      },
    },
    tests: [
      {
        name: '2%/tháng thành 26,82%/năm',
        inputs: { periodReturn: 2, periodsPerYear: 12 },
        expected: 26.8242,
      },
      {
        name: '0,5%/tuần thành 29,61%/năm',
        inputs: { periodReturn: 0.5, periodsPerYear: 52 },
        expected: 29.609,
      },
      {
        name: 'số kỳ bằng 0 thì không quy năm được',
        inputs: { periodReturn: 2, periodsPerYear: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'lợi suất dưới −100% là vô nghĩa',
        inputs: { periodReturn: -120, periodsPerYear: 12 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v) => {
    const m = Math.round(v('periodsPerYear'));
    if (m <= 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'lợi suất năm hoá', en: 'the annualized return' },
          { vi: 'Số kỳ trong một năm', en: 'Number of periods per year' },
          { vi: 'Nhập ít nhất 1 kỳ mỗi năm.', en: 'Enter at least 1 period per year.' },
        ),
      };
    }
    const r = v('periodReturn');
    if (r < -100) {
      return {
        value: null,
        unit: '%',
        warning: belowTotalLoss({ vi: 'Lợi suất một kỳ', en: 'Return per period' }),
      };
    }

    return ok((Math.pow(1 + r / 100, m) - 1) * 100, '%');
  },
};

/*
 * ── 2. Lợi suất thực sau lạm phát (Fisher) ─────────────────────────────────────────────
 */

export const LOI_SUAT_THUC: FormulaModule = {
  spec: {
    id: 'loi-suat-thuc',
    categoryId: 'returns',
    name: { vi: 'Lợi suất thực sau lạm phát', en: 'Real return (Fisher equation)' },
    description: {
      vi: 'Sức mua thật sự tăng bao nhiêu sau khi trừ lạm phát khỏi lợi suất danh nghĩa.',
      en: 'How much purchasing power actually grows once inflation is stripped out of the nominal return.',
    },
    latex: 'r_{thuc} = \\frac{1 + r_{danh\\,nghia}}{1 + \\pi} - 1',
    expression: {
      vi: 'Lợi suất thực = (1 + Lợi suất danh nghĩa) ÷ (1 + Lạm phát) − 1',
      en: 'Real return = (1 + Nominal return) ÷ (1 + Inflation) − 1',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['loi suat thuc', 'lam phat', 'fisher', 'real return', 'suc mua'],
    resultUnit: '%',
    variables: [
      numberVar(
        'nominal',
        { vi: 'Lợi suất danh nghĩa / năm', en: 'Nominal return / year' },
        '%',
        10,
        {
          min: -100,
          max: 100,
          description: {
            vi: 'Mức lãi nhìn thấy trên sao kê, chưa trừ lạm phát.',
            en: 'The rate shown on the statement, before subtracting inflation.',
          },
        },
      ),
      numberVar('inflation', { vi: 'Lạm phát / năm', en: 'Inflation / year' }, '%', 4, {
        min: -50,
        max: 100,
        description: {
          vi: 'Mức tăng giá chung của hàng hoá trong cùng kỳ.',
          en: 'The general rise in prices of goods over the same period.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Phần lợi suất còn lại sau khi trừ đúng phần chỉ để bù trượt giá.',
        en: 'The return that remains once the portion that merely offsets rising prices is removed.',
      },
      whenToUse: {
        vi: 'Khi đánh giá gửi tiết kiệm hay trái phiếu dài hạn — kênh có lợi suất danh nghĩa cố định.',
        en: 'When evaluating savings deposits or long-term bonds — instruments with a fixed nominal return.',
      },
      howToRead: {
        vi: 'Kết quả âm nghĩa là tiền vẫn tăng trên sổ nhưng sức mua đang giảm. Lấy lợi suất trừ thẳng lạm phát chỉ là xấp xỉ; phép chia ở trên mới cho con số đúng.',
        en: 'A negative result means the balance still grows on paper while purchasing power is shrinking. Simply subtracting inflation from the return is only an approximation; the division above gives the correct figure.',
      },
      commonMistakes: {
        vi: 'Lấy lợi suất trừ thẳng lạm phát: 10% − 4% = 6%, trong khi con số đúng là 5,77% — lệch càng lớn khi lạm phát càng cao.',
        en: 'Subtracting inflation directly from the return: 10% − 4% = 6%, when the correct figure is 5.77% — the gap widens as inflation rises.',
      },
    },
    example: {
      title: {
        vi: 'Lãi danh nghĩa 10%/năm, lạm phát 4%/năm',
        en: 'A 10%/year nominal return with 4%/year inflation',
      },
      inputs: { nominal: 10, inflation: 4 },
      expected: 5.77,
      note: {
        vi: 'Thấp hơn phép trừ thẳng 6% một chút — đó chính là điểm của phép chia này.',
        en: 'Slightly lower than the straight subtraction of 6% — that gap is exactly the point of this division.',
      },
    },
    tests: [
      {
        name: 'lãi 10%, lạm phát 4% thì thực còn 5,77%',
        inputs: { nominal: 10, inflation: 4 },
        expected: 5.7692,
      },
      {
        name: 'lạm phát cao hơn lãi thì lợi suất thực âm',
        inputs: { nominal: 6, inflation: 8 },
        expected: -1.8519,
      },
      {
        name: 'lạm phát −100% làm mẫu số bằng 0',
        inputs: { nominal: 10, inflation: -100 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'lợi suất danh nghĩa dưới −100% là vô nghĩa',
        inputs: { nominal: -120, inflation: 4 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v) => {
    const nominal = v('nominal');
    const inflation = v('inflation');

    if (inflation === -100) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'lợi suất thực', en: 'the real return' },
          { vi: 'tổng (1 + Lạm phát)', en: 'the total (1 + Inflation)' },
          { vi: 'Nhập lạm phát khác −100%.', en: 'Enter an inflation value other than −100%.' },
        ),
      };
    }
    if (inflation < -100) {
      return {
        value: null,
        unit: '%',
        warning: belowTotalLoss({ vi: 'Lạm phát', en: 'Inflation' }),
      };
    }
    if (nominal < -100) {
      return {
        value: null,
        unit: '%',
        warning: belowTotalLoss({ vi: 'Lợi suất danh nghĩa', en: 'Nominal return' }),
      };
    }

    return ok(((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100, '%');
  },
};

/*
 * ── 3. Lãi suất hiệu dụng năm (EAR) ────────────────────────────────────────────────────
 */

export const LAI_SUAT_HIEU_DUNG: FormulaModule = {
  spec: {
    id: 'lai-suat-hieu-dung',
    categoryId: 'returns',
    name: { vi: 'Lãi suất hiệu dụng năm (EAR)', en: 'Effective annual rate' },
    description: {
      vi: 'Mức lãi thật sự nhận được cả năm khi lãi được ghép nhiều lần trong năm.',
      en: 'The interest actually earned over a full year when interest compounds several times a year.',
    },
    latex: 'EAR = \\left(1 + \\frac{r}{m}\\right)^{m} - 1',
    expression: {
      vi: 'EAR = (1 + Lãi suất danh nghĩa ÷ Số lần ghép lãi)^Số lần ghép lãi − 1',
      en: 'EAR = (1 + Nominal rate ÷ Compounding frequency)^Compounding frequency − 1',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['ear', 'lai suat hieu dung', 'ghep lai', 'effective annual rate', 'apr'],
    resultUnit: '%',
    variables: [
      sliderVar(
        'rate',
        { vi: 'Lãi suất danh nghĩa / năm', en: 'Nominal rate / year' },
        '%',
        12,
        0,
        30,
        0.1,
        {
          description: {
            vi: 'Con số ngân hàng quảng cáo, chưa tính hiệu ứng ghép lãi.',
            en: 'The figure banks advertise, before accounting for the compounding effect.',
          },
        },
      ),
      {
        key: 'perYear',
        label: { vi: 'Số lần ghép lãi / năm', en: 'Compounding frequency / year' },
        unit: 'lần',
        type: 'select',
        defaultValue: 12,
        level: 'basic',
        description: {
          vi: 'Ghép càng dày thì lãi thực nhận càng cao hơn lãi danh nghĩa.',
          en: 'The more often interest compounds, the higher the actual return climbs above the nominal rate.',
        },
        options: [
          { value: 1, label: { vi: 'Mỗi năm', en: 'Annually' } },
          { value: 2, label: { vi: 'Mỗi nửa năm', en: 'Semi-annually' } },
          { value: 4, label: { vi: 'Mỗi quý', en: 'Quarterly' } },
          { value: 12, label: { vi: 'Mỗi tháng', en: 'Monthly' } },
          { value: 365, label: { vi: 'Mỗi ngày', en: 'Daily' } },
        ],
      } satisfies VariableSpec,
    ],
    explanation: {
      meaning: {
        vi: 'Hai mức lãi cùng ghi 12%/năm có thể khác nhau — EAR quy tất cả về một thước đo.',
        en: 'Two rates both labeled 12%/year can differ in practice — EAR converts them all to one common measure.',
      },
      whenToUse: {
        vi: 'Khi so hai khoản vay hay hai sổ tiết kiệm có tần suất ghép lãi khác nhau, ví dụ ghép quý với ghép tháng.',
        en: 'When comparing two loans or two savings accounts with different compounding frequencies, e.g. quarterly versus monthly.',
      },
      howToRead: {
        vi: 'EAR luôn lớn hơn hoặc bằng lãi danh nghĩa; chênh lệch càng rõ khi lãi suất cao và ghép dày.',
        en: 'EAR is always greater than or equal to the nominal rate; the gap widens as the rate rises and compounding gets more frequent.',
      },
      commonMistakes: {
        vi: 'So thẳng lãi danh nghĩa của hai sản phẩm mà bỏ qua tần suất ghép — bên ghép dày hơn thực chất trả nhiều lãi hơn.',
        en: 'Comparing two products by their nominal rate alone while ignoring compounding frequency — the one that compounds more often actually pays more interest.',
      },
    },
    example: {
      title: {
        vi: 'Lãi danh nghĩa 12%/năm, ghép hằng tháng',
        en: 'A 12%/year nominal rate, compounded monthly',
      },
      inputs: { rate: 12, perYear: 12 },
      expected: 12.68,
      note: {
        vi: 'Ghép tháng làm 12% danh nghĩa thành 12,68% thực nhận.',
        en: 'Monthly compounding turns the nominal 12% into an actual 12.68%.',
      },
    },
    tests: [
      {
        name: '12% ghép tháng thành 12,68%',
        inputs: { rate: 12, perYear: 12 },
        expected: 12.6825,
      },
      {
        name: '12% ghép quý thành 12,55%',
        inputs: { rate: 12, perYear: 4 },
        expected: 12.5509,
      },
      {
        name: 'ghép một lần mỗi năm thì EAR trùng lãi danh nghĩa',
        inputs: { rate: 12, perYear: 1 },
        expected: 12,
      },
      {
        name: 'số lần ghép bằng 0 thì chia cho 0',
        inputs: { rate: 12, perYear: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v) => {
    const m = v('perYear');
    if (m <= 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'lãi suất hiệu dụng', en: 'the effective annual rate' },
          { vi: 'Số lần ghép lãi', en: 'Compounding frequency' },
          {
            vi: 'Chọn ít nhất 1 lần ghép lãi mỗi năm.',
            en: 'Choose at least 1 compounding period per year.',
          },
        ),
      };
    }
    return ok((Math.pow(1 + v('rate') / 100 / m, m) - 1) * 100, '%');
  },
};

/*
 * ── 4. Tổng lợi suất gồm cổ tức tái đầu tư ─────────────────────────────────────────────
 */

export const TONG_LOI_SUAT_TAI_DAU_TU: FormulaModule = {
  spec: {
    id: 'tong-loi-suat-tai-dau-tu',
    categoryId: 'returns',
    name: {
      vi: 'Tổng lợi suất có tái đầu tư cổ tức',
      en: 'Total return with reinvested dividends',
    },
    description: {
      vi: 'Lợi suất tích luỹ nhiều năm khi cổ tức nhận được đem mua lại chính cổ phiếu đó.',
      en: 'The cumulative multi-year return when dividends received are used to buy more of the same stock.',
    },
    latex: 'TR = \\left[(1 + g)(1 + y)\\right]^{n} - 1',
    expression: {
      vi: 'Tổng lợi suất = [(1 + Tăng giá mỗi năm) × (1 + Tỷ suất cổ tức)]^Số năm − 1',
      en: 'Total return = [(1 + Annual price growth) × (1 + Dividend yield)]^Years − 1',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['tong loi suat', 'tai dau tu co tuc', 'total return', 'reinvest', 'co tuc'],
    resultUnit: '%',
    variables: [
      numberVar(
        'priceGrowth',
        { vi: 'Tăng giá bình quân / năm', en: 'Average price growth / year' },
        '%',
        8,
        {
          min: -100,
          max: 100,
          description: {
            vi: 'Tốc độ tăng của thị giá cổ phiếu, bình quân mỗi năm.',
            en: 'The average annual rate at which the stock price rises.',
          },
        },
      ),
      numberVar(
        'dividendYield',
        { vi: 'Tỷ suất cổ tức / năm', en: 'Dividend yield / year' },
        '%',
        3,
        {
          min: 0,
          max: 50,
          description: {
            vi: 'Cổ tức tiền mặt cả năm chia cho thị giá, đem tái đầu tư toàn bộ.',
            en: 'Annual cash dividend divided by the share price, fully reinvested.',
          },
        },
      ),
      sliderVar('years', { vi: 'Số năm nắm giữ', en: 'Years held' }, 'năm', 5, 1, 50, 1),
    ],
    explanation: {
      meaning: {
        vi: 'Mỗi năm nhà đầu tư hưởng hai tầng lãi: giá tăng và cổ tức mua thêm cổ phiếu, hai tầng đó nhân vào nhau rồi luỹ kế theo năm.',
        en: 'Each year the investor earns two layers of gain — price appreciation and dividends buying more shares — the two multiply together and compound over the years.',
      },
      whenToUse: {
        vi: 'Khi ước tính kết quả nắm giữ dài hạn một cổ phiếu trả cổ tức đều, thay vì chỉ nhìn mức tăng giá.',
        en: 'When estimating the long-term result of holding a steady dividend payer, rather than looking at price appreciation alone.',
      },
      howToRead: {
        vi: 'Phần chênh so với chỉ tính tăng giá chính là công của cổ tức tái đầu tư — nắm càng lâu phần này càng lớn.',
        en: 'The gap versus price growth alone is the contribution of reinvested dividends — the longer the holding period, the larger that gap grows.',
      },
      commonMistakes: {
        vi: 'Bỏ quên cổ tức khi tính lợi suất dài hạn, hoặc quên rằng cổ tức thực nhận đã bị khấu trừ thuế nên con số thực tế thấp hơn.',
        en: 'Ignoring dividends when computing a long-term return, or forgetting that the dividend actually received has already been taxed, so the real figure is lower.',
      },
    },
    example: {
      title: {
        vi: 'Giá tăng 8%/năm, cổ tức 3%/năm tái đầu tư, giữ 5 năm',
        en: '8%/year price growth, 3%/year dividends reinvested, held 5 years',
      },
      inputs: { priceGrowth: 8, dividendYield: 3, years: 5 },
      expected: 70.34,
      note: {
        vi: 'Chỉ tính tăng giá thì 5 năm được 46,93% — cổ tức tái đầu tư góp thêm hơn 23 điểm phần trăm.',
        en: 'Price growth alone over 5 years gives 46.93% — reinvested dividends add more than 23 percentage points on top.',
      },
    },
    tests: [
      {
        name: 'giá 8%, cổ tức 3%, 5 năm thành 70,34%',
        inputs: { priceGrowth: 8, dividendYield: 3, years: 5 },
        expected: 70.3354,
      },
      {
        name: 'không cổ tức thì trùng lãi kép theo giá',
        inputs: { priceGrowth: 8, dividendYield: 0, years: 5 },
        expected: 46.9328,
      },
      {
        name: 'số năm bằng 0 thì không có kỳ tích luỹ nào',
        inputs: { priceGrowth: 8, dividendYield: 3, years: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'tăng giá dưới −100% là vô nghĩa',
        inputs: { priceGrowth: -120, dividendYield: 3, years: 5 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v) => {
    const years = Math.round(v('years'));
    if (years <= 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'tổng lợi suất', en: 'the total return' },
          { vi: 'Số năm nắm giữ', en: 'Years held' },
          { vi: 'Nhập ít nhất 1 năm.', en: 'Enter at least 1 year.' },
        ),
      };
    }

    const g = v('priceGrowth');
    if (g < -100) {
      return {
        value: null,
        unit: '%',
        warning: belowTotalLoss({
          vi: 'Tăng giá bình quân / năm',
          en: 'Average price growth / year',
        }),
      };
    }

    const perYear = (1 + g / 100) * (1 + v('dividendYield') / 100);
    return ok((Math.pow(perYear, years) - 1) * 100, '%');
  },
};

/*
 * ── 5. Lợi suất trung bình hình học nhiều kỳ ───────────────────────────────────────────
 */

const geoPeriodCount: VariableSpec = {
  key: 'periods',
  label: { vi: 'Số kỳ nhập liệu', en: 'Number of periods entered' },
  unit: '',
  type: 'buttonGroup',
  defaultValue: 3,
  level: 'basic',
  description: {
    vi: 'Chọn 2 kỳ thì ô lợi suất kỳ 3 được bỏ qua.',
    en: 'Choosing 2 periods makes the period-3 return field ignored.',
  },
  options: [
    { value: 2, label: { vi: '2 kỳ', en: '2 periods' } },
    { value: 3, label: { vi: '3 kỳ', en: '3 periods' } },
  ],
};

export const LOI_SUAT_TRUNG_BINH_HINH_HOC: FormulaModule = {
  spec: {
    id: 'loi-suat-trung-binh-hinh-hoc',
    categoryId: 'returns',
    name: { vi: 'Lợi suất trung bình hình học', en: 'Geometric mean return' },
    description: {
      vi: 'Mức lợi suất đều mỗi kỳ tương đương với một chuỗi 2–3 kỳ lên xuống thất thường.',
      en: 'The steady per-period return equivalent to an erratic 2–3 period sequence of ups and downs.',
    },
    latex: 'r_{G} = \\left[\\prod_{k=1}^{n} (1 + r_k)\\right]^{1/n} - 1',
    expression: {
      vi: 'Lợi suất hình học = [(1 + r kỳ 1) × (1 + r kỳ 2) × …]^(1 ÷ Số kỳ) − 1',
      en: 'Geometric return = [(1 + period-1 return) × (1 + period-2 return) × …]^(1 ÷ Number of periods) − 1',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['trung binh hinh hoc', 'geometric mean', 'loi suat nhieu ky', 'binh quan'],
    resultUnit: '%',
    variables: [
      geoPeriodCount,
      numberVar('r1', { vi: 'Lợi suất kỳ 1', en: 'Return in period 1' }, '%', 10, {
        min: -100,
        max: 200,
      }),
      numberVar('r2', { vi: 'Lợi suất kỳ 2', en: 'Return in period 2' }, '%', -5, {
        min: -100,
        max: 200,
      }),
      numberVar('r3', { vi: 'Lợi suất kỳ 3', en: 'Return in period 3' }, '%', 20, {
        min: -100,
        max: 200,
        description: {
          vi: 'Chỉ dùng khi chọn 3 kỳ.',
          en: 'Only used when 3 periods is selected.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Trung bình có tính tới lãi kép: chuỗi lên xuống thất thường được quy về một mức đều mỗi kỳ cho cùng kết quả cuối.',
        en: 'A compounding-aware average: an erratic up-and-down sequence is converted to one steady per-period rate that yields the same end result.',
      },
      whenToUse: {
        vi: 'Khi tổng kết thành tích vài năm liền của một danh mục hay một quỹ, mỗi năm một con số.',
        en: "When summarizing a portfolio or fund's track record across several consecutive years, one figure per year.",
      },
      howToRead: {
        vi: 'Luôn thấp hơn trung bình cộng khi lợi suất có biến động — biến động càng mạnh thì khoảng cách càng lớn.',
        en: 'Always lower than the arithmetic average whenever returns fluctuate — the more volatile the returns, the larger the gap.',
      },
      commonMistakes: {
        vi: 'Lấy trung bình cộng: lãi 50% rồi lỗ 50% ra trung bình cộng 0%, trong khi thực tế đã mất 25% vốn.',
        en: 'Using the arithmetic average: a 50% gain followed by a 50% loss averages to 0%, while in reality 25% of the capital was lost.',
      },
    },
    example: {
      title: { vi: 'Ba năm liền: +10%, −5%, +20%', en: 'Three straight years: +10%, −5%, +20%' },
      inputs: { periods: 3, r1: 10, r2: -5, r3: 20 },
      expected: 7.84,
      note: {
        vi: 'Trung bình cộng là 8,33% — cao hơn con số thật vì bỏ qua biến động.',
        en: 'The arithmetic average is 8.33% — higher than the true figure because it ignores volatility.',
      },
    },
    tests: [
      {
        name: 'ba kỳ +10%, −5%, +20% thành 7,84%/kỳ',
        inputs: { periods: 3, r1: 10, r2: -5, r3: 20 },
        expected: 7.8365,
      },
      {
        name: 'chọn 2 kỳ thì ô kỳ 3 được bỏ qua',
        inputs: { periods: 2, r1: 10, r2: -5, r3: 999 },
        expected: 2.2252,
      },
      {
        name: 'một kỳ dưới −100% là vô nghĩa',
        inputs: { periods: 3, r1: 10, r2: -120, r3: 20 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v) => {
    // Giá trị lạ của nút chọn rơi về 3 kỳ — cùng cách xử lý với `methodOf` bên personal.ts.
    const n = v('periods') === 2 ? 2 : 3;
    const rates = [v('r1'), v('r2'), v('r3')].slice(0, n);

    for (const [index, r] of rates.entries()) {
      if (r < -100) {
        return {
          value: null,
          unit: '%',
          warning: belowTotalLoss({
            vi: `Lợi suất kỳ ${index + 1}`,
            en: `Return in period ${index + 1}`,
          }),
        };
      }
    }

    const product = rates.reduce((acc, r) => acc * (1 + r / 100), 1);
    return ok((Math.pow(product, 1 / n) - 1) * 100, '%');
  },
};

/*
 * ── 6. IRR của niên kim ────────────────────────────────────────────────────────────────
 */

export const IRR_NIEN_KIM: FormulaModule = {
  spec: {
    id: 'irr-nien-kim',
    categoryId: 'returns',
    name: { vi: 'IRR của dòng tiền đều (niên kim)', en: 'IRR of an ordinary annuity' },
    description: {
      vi: 'Suất sinh lợi nội tại mỗi kỳ khi bỏ vốn một lần rồi nhận về một khoản đều đặn nhiều kỳ.',
      en: 'The internal rate of return per period when capital is committed once and an equal amount is received back each period.',
    },
    latex: 'P = C \\cdot \\frac{1 - (1 + IRR)^{-n}}{IRR}',
    expression: {
      vi: 'Tìm IRR sao cho: Vốn bỏ ra = Dòng thu mỗi kỳ × [1 − (1 + IRR)^(−Số kỳ)] ÷ IRR',
      en: 'Find the IRR such that: Capital invested = Payment per period × [1 − (1 + IRR)^(−Number of periods)] ÷ IRR',
    },
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['irr', 'nien kim', 'suat sinh loi noi tai', 'annuity', 'dong tien deu'],
    resultUnit: '%/kỳ',
    variables: [
      numberVar(
        'investment',
        { vi: 'Vốn bỏ ra ban đầu', en: 'Initial capital invested' },
        '₫',
        100_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Khoản chi một lần ở đầu kỳ 0.',
            en: 'A single lump sum paid out at the start, period 0.',
          },
        },
      ),
      numberVar(
        'payment',
        { vi: 'Dòng thu đều mỗi kỳ', en: 'Equal payment received per period' },
        '₫',
        25_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Khoản nhận về như nhau ở cuối mỗi kỳ.',
            en: 'The same amount received at the end of every period.',
          },
        },
      ),
      sliderVar(
        'periods',
        { vi: 'Số kỳ nhận tiền', en: 'Number of periods receiving payments' },
        'kỳ',
        5,
        1,
        120,
        1,
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Mức lãi suất chiết khấu làm tổng giá trị hiện tại của các khoản thu về đúng bằng số vốn đã bỏ ra.',
        en: 'The discount rate at which the present value of all payments received exactly equals the capital invested.',
      },
      whenToUse: {
        vi: 'Khi thẩm định một khoản cho vay trả đều, một hợp đồng trả góp, hay một dự án thu tiền đều đặn mỗi kỳ mà không có khoản hoàn vốn nào ở kỳ cuối — trái phiếu coupon trả lại mệnh giá khi đáo hạn thì mô hình này KHÔNG tính đúng.',
        en: 'When appraising an even-installment loan, an installment purchase contract, or a project with equal periodic receipts and no lump-sum payback at the end — a coupon bond that returns face value at maturity is NOT correctly modeled by this formula.',
      },
      howToRead: {
        vi: 'IRR tính theo KỲ — dòng tiền theo tháng thì đây là %/tháng, muốn so với lãi suất năm phải năm hoá thêm một bước.',
        en: 'IRR is expressed PER PERIOD — for monthly cash flows this is %/month; comparing it to an annual rate requires an extra annualizing step.',
      },
      commonMistakes: {
        vi: 'Cộng thô các khoản thu rồi chia cho vốn: cách đó bỏ qua chuyện tiền nhận sớm giá trị hơn tiền nhận muộn.',
        en: 'Simply adding up the payments and dividing by the capital: that approach ignores that money received sooner is worth more than money received later.',
      },
    },
    example: {
      title: {
        vi: 'Bỏ 100 triệu ₫, nhận về 25 triệu ₫/kỳ trong 5 kỳ',
        en: 'Invest 100 million VND, receive 25 million VND/period for 5 periods',
      },
      inputs: { investment: 100_000_000, payment: 25_000_000, periods: 5 },
      expected: 7.93,
      note: {
        vi: 'Tổng thu 125 triệu ₫ nhưng IRR chỉ 7,93%/kỳ vì các khoản về rải rác theo thời gian.',
        en: 'Total receipts are 125 million VND, but the IRR is only 7.93%/period because the payments are spread out over time.',
      },
    },
    tests: [
      {
        name: '100 triệu đổi 25 triệu × 5 kỳ ra IRR 7,93%/kỳ',
        inputs: { investment: 100_000_000, payment: 25_000_000, periods: 5 },
        expected: 7.9308,
      },
      {
        name: 'tổng thu đúng bằng vốn thì IRR bằng 0',
        inputs: { investment: 100_000_000, payment: 20_000_000, periods: 5 },
        expected: 0,
      },
      {
        name: 'số kỳ bằng 0 thì không có dòng thu nào',
        inputs: { investment: 100_000_000, payment: 25_000_000, periods: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'dòng thu bằng 0 thì IRR không tồn tại',
        inputs: { investment: 100_000_000, payment: 0, periods: 5 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v) => {
    const unit = '%/kỳ';
    const n = Math.round(v('periods'));
    if (n <= 0) {
      return {
        value: null,
        unit,
        warning: divideByZero(
          { vi: 'IRR', en: 'the IRR' },
          { vi: 'Số kỳ nhận tiền', en: 'Number of periods receiving payments' },
          { vi: 'Nhập ít nhất 1 kỳ.', en: 'Enter at least 1 period.' },
        ),
      };
    }

    const investment = v('investment');
    const payment = v('payment');
    if (investment <= 0) {
      return {
        value: null,
        unit,
        warning: meaningless(
          {
            vi: 'Chưa bỏ đồng vốn nào thì không có suất sinh lợi nội tại để tìm.',
            en: 'With no capital invested at all, there is no internal rate of return to find.',
          },
          {
            vi: 'Nhập vốn bỏ ra ban đầu lớn hơn 0.',
            en: 'Enter an initial capital amount greater than 0.',
          },
        ),
      };
    }
    if (payment <= 0) {
      return {
        value: null,
        unit,
        warning: meaningless(
          {
            vi: 'Không có dòng thu nào về thì khoản đầu tư chỉ mất vốn, IRR không tồn tại.',
            en: 'With no payments received at all, the investment is a pure loss, so no IRR exists.',
          },
          {
            vi: 'Nhập dòng thu mỗi kỳ lớn hơn 0.',
            en: 'Enter a payment per period greater than 0.',
          },
        ),
      };
    }

    // NPV tại suất chiết khấu r; tại r = 0 dùng giới hạn C·n − P để không chia cho 0.
    const npv = (r: number): number =>
      r === 0 ? payment * n - investment : (payment * (1 - Math.pow(1 + r, -n))) / r - investment;

    if (npv(0) === 0) return ok(0, unit);

    // Chia đôi trong [−99%, 1.000%]: npv giảm đơn điệu theo r nên có nghiệm là tìm được.
    let low = -0.99;
    let high = 10;
    if (npv(low) * npv(high) > 0) {
      return {
        value: null,
        unit,
        warning: meaningless(
          {
            vi: 'Không tìm được IRR trong khoảng −99% tới 1.000% mỗi kỳ với bộ số này.',
            en: 'No IRR could be found in the range −99% to 1,000% per period for this set of numbers.',
          },
          {
            vi: 'Kiểm tra lại vốn bỏ ra và dòng thu mỗi kỳ.',
            en: 'Double-check the capital invested and the payment per period.',
          },
        ),
      };
    }

    for (let i = 0; i < 200; i += 1) {
      const mid = (low + high) / 2;
      if (npv(low) * npv(mid) <= 0) {
        high = mid;
      } else {
        low = mid;
      }
      if (high - low < 1e-12) break;
    }

    return ok(((low + high) / 2) * 100, unit);
  },
};

/*
 * ── 7. Thời gian nhân đôi vốn ──────────────────────────────────────────────────────────
 */

export const THOI_GIAN_NHAN_DOI: FormulaModule = {
  spec: {
    id: 'thoi-gian-nhan-doi',
    categoryId: 'returns',
    name: { vi: 'Thời gian nhân đôi vốn', en: 'Doubling time (rule of 72)' },
    description: {
      vi: 'Cần bao nhiêu năm để vốn tăng gấp đôi ở một mức lợi suất kép cho trước.',
      en: 'How many years it takes for capital to double at a given compound rate of return.',
    },
    latex: 't = \\frac{\\ln 2}{\\ln(1 + r)} \\approx \\frac{72}{r}',
    expression: {
      vi: 'Số năm nhân đôi = ln(2) ÷ ln(1 + Lợi suất năm) — xấp xỉ nhanh bằng 72 ÷ Lợi suất',
      en: 'Years to double = ln(2) ÷ ln(1 + Annual return) — quick approximation: 72 ÷ Return',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['nhan doi von', 'quy tac 72', 'rule of 72', 'doubling time'],
    resultUnit: 'năm',
    variables: [
      sliderVar(
        'rate',
        { vi: 'Lợi suất kép / năm', en: 'Compound return / year' },
        '%',
        8,
        0,
        30,
        0.1,
        {
          description: {
            vi: 'Mức sinh lời đều mỗi năm, lãi nhập gốc.',
            en: 'The steady annual return, with interest rolled back into the principal.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Đổi một con số phần trăm trừu tượng thành mốc thời gian dễ hình dung.',
        en: 'Converts an abstract percentage into an easy-to-picture time horizon.',
      },
      whenToUse: {
        vi: 'Khi cần nhẩm nhanh sức mạnh của lãi kép — 8%/năm nghĩa là khoảng 9 năm tiền gấp đôi.',
        en: 'When you need a quick mental estimate of compounding power — 8%/year means money roughly doubles in 9 years.',
      },
      howToRead: {
        vi: 'Kết quả chính là công thức chính xác ln(2) ÷ ln(1 + r); số phụ kèm theo là ước lượng 72 chia lợi suất — hai con số gần nhau ở mức lãi 5–12%.',
        en: 'The result is the exact formula ln(2) ÷ ln(1 + r); the extra figure shown alongside is the 72-divided-by-rate approximation — the two are close in the 5–12% range.',
      },
      commonMistakes: {
        vi: 'Dùng quy tắc 72 cho lợi suất rất cao hoặc rất thấp — ngoài vùng 5–12% ước lượng lệch rõ so với công thức chính xác.',
        en: 'Applying the rule of 72 to very high or very low returns — outside the 5–12% range the approximation diverges noticeably from the exact formula.',
      },
    },
    example: {
      title: { vi: 'Lợi suất kép 8%/năm', en: 'An 8%/year compound return' },
      inputs: { rate: 8 },
      expected: 9.01,
      note: {
        vi: 'Quy tắc 72 nhẩm ra 9 năm — sát với con số chính xác 9,01 năm.',
        en: 'The rule of 72 gives a quick 9 years — close to the exact figure of 9.01 years.',
      },
    },
    tests: [
      { name: '8%/năm thì 9,01 năm gấp đôi', inputs: { rate: 8 }, expected: 9.0065 },
      { name: '6%/năm thì 11,9 năm gấp đôi', inputs: { rate: 6 }, expected: 11.8957 },
      {
        name: 'lợi suất 0% thì không bao giờ nhân đôi — chia cho 0',
        inputs: { rate: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'lợi suất âm thì vốn co lại, không có thời gian nhân đôi',
        inputs: { rate: -5 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v) => {
    const r = v('rate');
    if (r === 0) {
      return {
        value: null,
        unit: 'năm',
        warning: divideByZero(
          { vi: 'thời gian nhân đôi', en: 'the doubling time' },
          { vi: 'Lợi suất kép / năm', en: 'Compound return / year' },
          { vi: 'Nhập lợi suất lớn hơn 0.', en: 'Enter a return greater than 0.' },
        ),
      };
    }
    if (r < 0) {
      return {
        value: null,
        unit: 'năm',
        warning: meaningless(
          {
            vi: 'Lợi suất âm làm vốn co lại theo thời gian nên không bao giờ nhân đôi.',
            en: 'A negative return makes capital shrink over time, so it never doubles.',
          },
          {
            vi: 'Nhập lợi suất dương, hoặc dùng công thức Lãi kép để xem vốn còn lại bao nhiêu.',
            en: 'Enter a positive return, or use the Compound Interest formula to see how much capital remains.',
          },
        ),
      };
    }

    const exact = Math.log(2) / Math.log(1 + r / 100);
    return ok(exact, 'năm', { extras: { rule72: 72 / r } });
  },
};

/*
 * ── 8. Lợi suất quy năm theo số ngày nắm giữ ───────────────────────────────────────────
 */

export const LOI_SUAT_QUY_NAM_THEO_NGAY: FormulaModule = {
  spec: {
    id: 'loi-suat-quy-nam-theo-ngay',
    categoryId: 'returns',
    name: { vi: 'Lợi suất quy năm theo số ngày', en: 'Annualized holding period return' },
    description: {
      vi: 'Quy lợi suất của một lần mua bán ngắn ngày về mức tương đương cả năm.',
      en: 'Converts the return of a short-holding trade into its full-year equivalent.',
    },
    latex: 'r_{nam} = \\left(\\frac{P_{ban}}{P_{mua}}\\right)^{365/d} - 1',
    expression: {
      vi: 'Lợi suất quy năm = (Giá bán ÷ Giá mua)^(365 ÷ Số ngày nắm giữ) − 1',
      en: 'Annualized return = (Sell price ÷ Buy price)^(365 ÷ Days held) − 1',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['quy nam', 'so ngay nam giu', 'annualized', 'hpr', 'luot song'],
    resultUnit: '%',
    variables: [
      numberVar('buyPrice', { vi: 'Giá mua', en: 'Buy price' }, '₫', 80_000, {
        min: 0,
        max: 10_000_000,
      }),
      numberVar('sellPrice', { vi: 'Giá bán', en: 'Sell price' }, '₫', 86_000, {
        min: 0,
        max: 10_000_000,
      }),
      sliderVar('days', { vi: 'Số ngày nắm giữ', en: 'Days held' }, 'ngày', 90, 1, 1095, 1, {
        description: {
          vi: 'Tính theo ngày lịch, từ ngày mua tới ngày bán.',
          en: 'Counted in calendar days, from the buy date to the sell date.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Nếu lặp lại thương vụ này liên tục suốt 365 ngày thì cả năm được bao nhiêu — một thước đo chung cho các lần mua bán dài ngắn khác nhau.',
        en: 'How much a full year would return if this trade repeated continuously for 365 days — a common yardstick for trades of different lengths.',
      },
      whenToUse: {
        vi: 'Khi so một thương vụ lướt sóng vài tuần với gửi tiết kiệm hay một khoản nắm giữ cả năm.',
        en: 'When comparing a few-week swing trade against a savings deposit or a full-year holding.',
      },
      howToRead: {
        vi: 'Nắm giữ càng ngắn thì phép quy năm phóng đại càng mạnh — lãi 7,5% trong 90 ngày quy năm thành hơn 34%.',
        en: 'The shorter the holding period, the more the annualization magnifies it — a 7.5% gain in 90 days annualizes to more than 34%.',
      },
      commonMistakes: {
        vi: 'Coi con số quy năm là thành tích chắc chắn lặp lại được, và quên trừ phí với thuế vốn chiếm phần lớn ở các lệnh ngắn ngày.',
        en: 'Treating the annualized figure as a guaranteed repeatable result, and forgetting to subtract fees and taxes, which eat up a large share of short-holding trades.',
      },
    },
    example: {
      title: {
        vi: 'Mua 80.000 ₫, bán 86.000 ₫ sau 90 ngày',
        en: 'Bought at 80,000 VND, sold at 86,000 VND after 90 days',
      },
      inputs: { buyPrice: 80_000, sellPrice: 86_000, days: 90 },
      expected: 34.08,
      note: {
        vi: 'Lãi thực tế của thương vụ là 7,5%; con số 34% chỉ là mức quy đổi cả năm.',
        en: "The trade's actual gain is 7.5%; the 34% figure is only its annualized equivalent.",
      },
    },
    tests: [
      {
        name: 'lãi 7,5% trong 90 ngày quy năm thành 34,08%',
        inputs: { buyPrice: 80_000, sellPrice: 86_000, days: 90 },
        expected: 34.0846,
      },
      {
        name: 'nắm giữ tròn 365 ngày thì quy năm trùng lợi suất gốc',
        inputs: { buyPrice: 80_000, sellPrice: 86_000, days: 365 },
        expected: 7.5,
      },
      {
        name: 'số ngày bằng 0 thì không quy năm được',
        inputs: { buyPrice: 80_000, sellPrice: 86_000, days: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'giá mua bằng 0 thì không có lợi suất',
        inputs: { buyPrice: 0, sellPrice: 86_000, days: 90 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v) => {
    const days = Math.round(v('days'));
    if (days <= 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'lợi suất quy năm', en: 'the annualized return' },
          { vi: 'Số ngày nắm giữ', en: 'Days held' },
          { vi: 'Nhập ít nhất 1 ngày.', en: 'Enter at least 1 day.' },
        ),
      };
    }

    const buy = v('buyPrice');
    if (buy === 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'lợi suất quy năm', en: 'the annualized return' },
          { vi: 'Giá mua', en: 'Buy price' },
          { vi: 'Nhập giá mua lớn hơn 0.', en: 'Enter a buy price greater than 0.' },
        ),
      };
    }

    return ok((Math.pow(v('sellPrice') / buy, 365 / days) - 1) * 100, '%');
  },
};

/*
 * ── 9. Lợi suất vượt chuẩn ─────────────────────────────────────────────────────────────
 */

export const LOI_SUAT_VUOT_CHUAN: FormulaModule = {
  spec: {
    id: 'loi-suat-vuot-chuan',
    categoryId: 'returns',
    name: { vi: 'Lợi suất vượt chuẩn', en: 'Excess return' },
    description: {
      vi: 'Danh mục làm tốt hơn hay kém hơn mốc so sánh bao nhiêu điểm phần trăm.',
      en: 'How many percentage points the portfolio outperformed or underperformed its benchmark.',
    },
    latex: 'ER = r_{p} - r_{b}',
    expression: {
      vi: 'Lợi suất vượt chuẩn = Lợi suất danh mục − Lợi suất chuẩn so sánh',
      en: 'Excess return = Portfolio return − Benchmark return',
    },
    chartType: 'none',
    level: 'basic',
    tags: ['vuot chuan', 'excess return', 'benchmark', 'so voi vn index', 'chenh lech'],
    resultUnit: '%',
    variables: [
      numberVar('portfolioReturn', { vi: 'Lợi suất danh mục', en: 'Portfolio return' }, '%', 18.5, {
        min: -100,
        max: 500,
        description: {
          vi: 'Kết quả của danh mục trong kỳ đang xét.',
          en: "The portfolio's result over the period under review.",
        },
      }),
      numberVar(
        'benchmarkReturn',
        { vi: 'Lợi suất chuẩn so sánh', en: 'Benchmark return' },
        '%',
        12.2,
        {
          min: -100,
          max: 500,
          description: {
            vi: 'Mốc so sánh cùng kỳ, ví dụ VN-Index hoặc lãi suất tiết kiệm.',
            en: 'The comparison benchmark over the same period, e.g. the VN-Index or a savings rate.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Phần thành tích thật sự do lựa chọn đầu tư tạo ra, sau khi trừ đi mặt bằng chung.',
        en: 'The share of performance genuinely created by the investment choices, after subtracting the general market backdrop.',
      },
      whenToUse: {
        vi: 'Khi tổng kết một kỳ đầu tư: lãi 18% chưa chắc giỏi nếu cả thị trường cùng kỳ tăng 25%.',
        en: "When wrapping up an investment period: an 18% gain isn't necessarily impressive if the whole market rose 25% over the same period.",
      },
      howToRead: {
        vi: 'Dương nghĩa là thắng chuẩn, âm là thua chuẩn — thua chuẩn kéo dài là dấu hiệu nên cân nhắc đầu tư theo chỉ số.',
        en: 'Positive means beating the benchmark, negative means trailing it — a prolonged losing streak against the benchmark is a sign to consider index investing instead.',
      },
      commonMistakes: {
        vi: 'So với chuẩn không cùng mức rủi ro, hoặc lệch kỳ tính — hai lợi suất phải đo trên cùng một khoảng thời gian.',
        en: 'Comparing against a benchmark with a different risk level, or mismatched periods — both returns must be measured over the exact same time span.',
      },
    },
    example: {
      title: {
        vi: 'Danh mục lãi 18,5%, VN-Index cùng kỳ tăng 12,2%',
        en: 'Portfolio gained 18.5%, VN-Index rose 12.2% over the same period',
      },
      inputs: { portfolioReturn: 18.5, benchmarkReturn: 12.2 },
      expected: 6.3,
      note: {
        vi: 'Danh mục thắng chuẩn 6,3 điểm phần trăm.',
        en: 'The portfolio beat the benchmark by 6.3 percentage points.',
      },
    },
    tests: [
      {
        name: 'thắng chuẩn 6,3 điểm phần trăm',
        inputs: { portfolioReturn: 18.5, benchmarkReturn: 12.2 },
        expected: 6.3,
      },
      {
        name: 'thua chuẩn thì kết quả âm',
        inputs: { portfolioReturn: 5, benchmarkReturn: 12 },
        expected: -7,
      },
      {
        name: 'lợi suất danh mục dưới −100% là vô nghĩa',
        inputs: { portfolioReturn: -150, benchmarkReturn: 12 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v) => {
    const rp = v('portfolioReturn');
    const rb = v('benchmarkReturn');

    if (rp < -100) {
      return {
        value: null,
        unit: '%',
        warning: belowTotalLoss({ vi: 'Lợi suất danh mục', en: 'Portfolio return' }),
      };
    }
    if (rb < -100) {
      return {
        value: null,
        unit: '%',
        warning: belowTotalLoss({ vi: 'Lợi suất chuẩn so sánh', en: 'Benchmark return' }),
      };
    }

    return ok(rp - rb, '%');
  },
};

/** Chín công thức bổ sung cho nhóm 'returns' — cùng bốn công thức ở returns.ts là đủ 13. */
export const PERFORMANCE_FORMULAS: ReadonlyArray<FormulaModule> = [
  LOI_SUAT_NAM_HOA,
  LOI_SUAT_THUC,
  LAI_SUAT_HIEU_DUNG,
  TONG_LOI_SUAT_TAI_DAU_TU,
  LOI_SUAT_TRUNG_BINH_HINH_HOC,
  IRR_NIEN_KIM,
  THOI_GIAN_NHAN_DOI,
  LOI_SUAT_QUY_NAM_THEO_NGAY,
  LOI_SUAT_VUOT_CHUAN,
];
