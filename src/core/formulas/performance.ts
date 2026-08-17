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
import type { CalcWarning, VariableSpec } from '../types';
import { divideByZero, meaningless } from '../warnings';
import type { FormulaSource } from '../registry/types';
import { SOURCE_CFA, numberVar, sliderVar } from './shared';

/** Nguồn dùng chung của cả nhóm — giáo trình đầu tư kinh điển, chương về lợi suất. */
const SOURCE_INVESTMENTS: FormulaSource = {
  label:
    'Bodie, Kane & Marcus — Investments, ấn bản 12 (McGraw-Hill), chương 5: Risk, Return, and the Historical Record',
};

/** Cảnh báo chung khi một ô lợi suất nhập dưới −100%. */
function belowTotalLoss(label: string): CalcWarning {
  return meaningless(
    `${label} dưới −100% nghĩa là mất nhiều hơn số vốn bỏ ra — không xảy ra với vị thế mua thông thường.`,
    `Kiểm tra lại ô ${label}: mất sạch vốn thì nhập đúng −100.`,
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
    description: 'Quy một lợi suất kỳ ngắn (tháng, tuần…) về mức tương đương cả năm theo lãi kép.',
    latex: 'r_{nam} = (1 + r_{ky})^{m} - 1',
    expression: 'Lợi suất năm = (1 + Lợi suất một kỳ)^Số kỳ trong năm − 1',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['nam hoa', 'annualized', 'quy nam', 'loi suat ky'],
    resultUnit: '%',
    variables: [
      numberVar('periodReturn', 'Lợi suất một kỳ', '%', 2, {
        min: -100,
        max: 100,
        description: 'Lợi suất của một kỳ ngắn, ví dụ 2 nghĩa là 2%/tháng.',
      }),
      sliderVar('periodsPerYear', 'Số kỳ trong một năm', 'kỳ', 12, 1, 365, 1, {
        description: 'Tháng là 12, tuần là 52, ngày giao dịch khoảng 250.',
      }),
    ],
    explanation: {
      meaning: 'Nếu lặp lại đúng lợi suất kỳ ngắn đó suốt một năm thì cả năm lãi bao nhiêu.',
      whenToUse: 'Khi so một khoản lãi vài tuần, vài tháng với lãi suất tiết kiệm tính theo năm.',
      howToRead:
        'Vì tính theo lãi kép nên kết quả cao hơn phép nhân đơn thuần: 2%/tháng ra 26,8%/năm chứ không phải 24%.',
      commonMistakes:
        'Coi con số năm hoá là mức chắc chắn đạt được — nó chỉ đúng nếu kỳ nào cũng lặp lại y hệt, điều hiếm khi xảy ra.',
    },
    example: {
      title: 'Lãi 2%/tháng, quy về năm',
      inputs: { periodReturn: 2, periodsPerYear: 12 },
      expected: 26.82,
      note: 'Cao hơn 24% của phép nhân đơn vì lãi kỳ trước tiếp tục sinh lãi.',
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
          'lợi suất năm hoá',
          'Số kỳ trong một năm',
          'Nhập ít nhất 1 kỳ mỗi năm.',
        ),
      };
    }
    const r = v('periodReturn');
    if (r < -100) return { value: null, unit: '%', warning: belowTotalLoss('Lợi suất một kỳ') };

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
    description: 'Sức mua thật sự tăng bao nhiêu sau khi trừ lạm phát khỏi lợi suất danh nghĩa.',
    latex: 'r_{thuc} = \\frac{1 + r_{danh\\,nghia}}{1 + \\pi} - 1',
    expression: 'Lợi suất thực = (1 + Lợi suất danh nghĩa) ÷ (1 + Lạm phát) − 1',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['loi suat thuc', 'lam phat', 'fisher', 'real return', 'suc mua'],
    resultUnit: '%',
    variables: [
      numberVar('nominal', 'Lợi suất danh nghĩa / năm', '%', 10, {
        min: -100,
        max: 100,
        description: 'Mức lãi nhìn thấy trên sao kê, chưa trừ lạm phát.',
      }),
      numberVar('inflation', 'Lạm phát / năm', '%', 4, {
        min: -50,
        max: 100,
        description: 'Mức tăng giá chung của hàng hoá trong cùng kỳ.',
      }),
    ],
    explanation: {
      meaning: 'Phần lợi suất còn lại sau khi trừ đúng phần chỉ để bù trượt giá.',
      whenToUse:
        'Khi đánh giá gửi tiết kiệm hay trái phiếu dài hạn — kênh có lợi suất danh nghĩa cố định.',
      howToRead:
        'Kết quả âm nghĩa là tiền vẫn tăng trên sổ nhưng sức mua đang giảm. Lấy lợi suất trừ thẳng lạm phát chỉ là xấp xỉ; phép chia ở trên mới cho con số đúng.',
      commonMistakes:
        'Lấy lợi suất trừ thẳng lạm phát: 10% − 4% = 6%, trong khi con số đúng là 5,77% — lệch càng lớn khi lạm phát càng cao.',
    },
    example: {
      title: 'Lãi danh nghĩa 10%/năm, lạm phát 4%/năm',
      inputs: { nominal: 10, inflation: 4 },
      expected: 5.77,
      note: 'Thấp hơn phép trừ thẳng 6% một chút — đó chính là điểm của phép chia này.',
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
        warning: divideByZero('lợi suất thực', 'tổng (1 + Lạm phát)', 'Nhập lạm phát khác −100%.'),
      };
    }
    if (inflation < -100) return { value: null, unit: '%', warning: belowTotalLoss('Lạm phát') };
    if (nominal < -100) {
      return { value: null, unit: '%', warning: belowTotalLoss('Lợi suất danh nghĩa') };
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
    description: 'Mức lãi thật sự nhận được cả năm khi lãi được ghép nhiều lần trong năm.',
    latex: 'EAR = \\left(1 + \\frac{r}{m}\\right)^{m} - 1',
    expression: 'EAR = (1 + Lãi suất danh nghĩa ÷ Số lần ghép lãi)^Số lần ghép lãi − 1',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['ear', 'lai suat hieu dung', 'ghep lai', 'effective annual rate', 'apr'],
    resultUnit: '%',
    variables: [
      sliderVar('rate', 'Lãi suất danh nghĩa / năm', '%', 12, 0, 30, 0.1, {
        description: 'Con số ngân hàng quảng cáo, chưa tính hiệu ứng ghép lãi.',
      }),
      {
        key: 'perYear',
        label: 'Số lần ghép lãi / năm',
        unit: 'lần',
        type: 'select',
        defaultValue: 12,
        level: 'basic',
        description: 'Ghép càng dày thì lãi thực nhận càng cao hơn lãi danh nghĩa.',
        options: [
          { value: 1, label: 'Mỗi năm' },
          { value: 2, label: 'Mỗi nửa năm' },
          { value: 4, label: 'Mỗi quý' },
          { value: 12, label: 'Mỗi tháng' },
          { value: 365, label: 'Mỗi ngày' },
        ],
      } satisfies VariableSpec,
    ],
    explanation: {
      meaning: 'Hai mức lãi cùng ghi 12%/năm có thể khác nhau — EAR quy tất cả về một thước đo.',
      whenToUse:
        'Khi so hai khoản vay hay hai sổ tiết kiệm có tần suất ghép lãi khác nhau, ví dụ ghép quý với ghép tháng.',
      howToRead:
        'EAR luôn lớn hơn hoặc bằng lãi danh nghĩa; chênh lệch càng rõ khi lãi suất cao và ghép dày.',
      commonMistakes:
        'So thẳng lãi danh nghĩa của hai sản phẩm mà bỏ qua tần suất ghép — bên ghép dày hơn thực chất trả nhiều lãi hơn.',
    },
    example: {
      title: 'Lãi danh nghĩa 12%/năm, ghép hằng tháng',
      inputs: { rate: 12, perYear: 12 },
      expected: 12.68,
      note: 'Ghép tháng làm 12% danh nghĩa thành 12,68% thực nhận.',
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
          'lãi suất hiệu dụng',
          'Số lần ghép lãi',
          'Chọn ít nhất 1 lần ghép lãi mỗi năm.',
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
    description: 'Lợi suất tích luỹ nhiều năm khi cổ tức nhận được đem mua lại chính cổ phiếu đó.',
    latex: 'TR = \\left[(1 + g)(1 + y)\\right]^{n} - 1',
    expression: 'Tổng lợi suất = [(1 + Tăng giá mỗi năm) × (1 + Tỷ suất cổ tức)]^Số năm − 1',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['tong loi suat', 'tai dau tu co tuc', 'total return', 'reinvest', 'co tuc'],
    resultUnit: '%',
    variables: [
      numberVar('priceGrowth', 'Tăng giá bình quân / năm', '%', 8, {
        min: -100,
        max: 100,
        description: 'Tốc độ tăng của thị giá cổ phiếu, bình quân mỗi năm.',
      }),
      numberVar('dividendYield', 'Tỷ suất cổ tức / năm', '%', 3, {
        min: 0,
        max: 50,
        description: 'Cổ tức tiền mặt cả năm chia cho thị giá, đem tái đầu tư toàn bộ.',
      }),
      sliderVar('years', 'Số năm nắm giữ', 'năm', 5, 1, 50, 1),
    ],
    explanation: {
      meaning:
        'Mỗi năm nhà đầu tư hưởng hai tầng lãi: giá tăng và cổ tức mua thêm cổ phiếu, hai tầng đó nhân vào nhau rồi luỹ kế theo năm.',
      whenToUse:
        'Khi ước tính kết quả nắm giữ dài hạn một cổ phiếu trả cổ tức đều, thay vì chỉ nhìn mức tăng giá.',
      howToRead:
        'Phần chênh so với chỉ tính tăng giá chính là công của cổ tức tái đầu tư — nắm càng lâu phần này càng lớn.',
      commonMistakes:
        'Bỏ quên cổ tức khi tính lợi suất dài hạn, hoặc quên rằng cổ tức thực nhận đã bị khấu trừ thuế nên con số thực tế thấp hơn.',
    },
    example: {
      title: 'Giá tăng 8%/năm, cổ tức 3%/năm tái đầu tư, giữ 5 năm',
      inputs: { priceGrowth: 8, dividendYield: 3, years: 5 },
      expected: 70.34,
      note: 'Chỉ tính tăng giá thì 5 năm được 46,93% — cổ tức tái đầu tư góp thêm hơn 23 điểm phần trăm.',
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
        warning: divideByZero('tổng lợi suất', 'Số năm nắm giữ', 'Nhập ít nhất 1 năm.'),
      };
    }

    const g = v('priceGrowth');
    if (g < -100) {
      return { value: null, unit: '%', warning: belowTotalLoss('Tăng giá bình quân / năm') };
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
  label: 'Số kỳ nhập liệu',
  unit: '',
  type: 'buttonGroup',
  defaultValue: 3,
  level: 'basic',
  description: 'Chọn 2 kỳ thì ô lợi suất kỳ 3 được bỏ qua.',
  options: [
    { value: 2, label: '2 kỳ' },
    { value: 3, label: '3 kỳ' },
  ],
};

export const LOI_SUAT_TRUNG_BINH_HINH_HOC: FormulaModule = {
  spec: {
    id: 'loi-suat-trung-binh-hinh-hoc',
    categoryId: 'returns',
    name: { vi: 'Lợi suất trung bình hình học', en: 'Geometric mean return' },
    description: 'Mức lợi suất đều mỗi kỳ tương đương với một chuỗi 2–3 kỳ lên xuống thất thường.',
    latex: 'r_{G} = \\left[\\prod_{k=1}^{n} (1 + r_k)\\right]^{1/n} - 1',
    expression: 'Lợi suất hình học = [(1 + r kỳ 1) × (1 + r kỳ 2) × …]^(1 ÷ Số kỳ) − 1',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['trung binh hinh hoc', 'geometric mean', 'loi suat nhieu ky', 'binh quan'],
    resultUnit: '%',
    variables: [
      geoPeriodCount,
      numberVar('r1', 'Lợi suất kỳ 1', '%', 10, { min: -100, max: 200 }),
      numberVar('r2', 'Lợi suất kỳ 2', '%', -5, { min: -100, max: 200 }),
      numberVar('r3', 'Lợi suất kỳ 3', '%', 20, {
        min: -100,
        max: 200,
        description: 'Chỉ dùng khi chọn 3 kỳ.',
      }),
    ],
    explanation: {
      meaning:
        'Trung bình có tính tới lãi kép: chuỗi lên xuống thất thường được quy về một mức đều mỗi kỳ cho cùng kết quả cuối.',
      whenToUse:
        'Khi tổng kết thành tích vài năm liền của một danh mục hay một quỹ, mỗi năm một con số.',
      howToRead:
        'Luôn thấp hơn trung bình cộng khi lợi suất có biến động — biến động càng mạnh thì khoảng cách càng lớn.',
      commonMistakes:
        'Lấy trung bình cộng: lãi 50% rồi lỗ 50% ra trung bình cộng 0%, trong khi thực tế đã mất 25% vốn.',
    },
    example: {
      title: 'Ba năm liền: +10%, −5%, +20%',
      inputs: { periods: 3, r1: 10, r2: -5, r3: 20 },
      expected: 7.84,
      note: 'Trung bình cộng là 8,33% — cao hơn con số thật vì bỏ qua biến động.',
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
        return { value: null, unit: '%', warning: belowTotalLoss(`Lợi suất kỳ ${index + 1}`) };
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
    description:
      'Suất sinh lợi nội tại mỗi kỳ khi bỏ vốn một lần rồi nhận về một khoản đều đặn nhiều kỳ.',
    latex: 'P = C \\cdot \\frac{1 - (1 + IRR)^{-n}}{IRR}',
    expression: 'Tìm IRR sao cho: Vốn bỏ ra = Dòng thu mỗi kỳ × [1 − (1 + IRR)^(−Số kỳ)] ÷ IRR',
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['irr', 'nien kim', 'suat sinh loi noi tai', 'annuity', 'dong tien deu'],
    resultUnit: '%/kỳ',
    variables: [
      numberVar('investment', 'Vốn bỏ ra ban đầu', '₫', 100_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Khoản chi một lần ở đầu kỳ 0.',
      }),
      numberVar('payment', 'Dòng thu đều mỗi kỳ', '₫', 25_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Khoản nhận về như nhau ở cuối mỗi kỳ.',
      }),
      sliderVar('periods', 'Số kỳ nhận tiền', 'kỳ', 5, 1, 120, 1),
    ],
    explanation: {
      meaning:
        'Mức lãi suất chiết khấu làm tổng giá trị hiện tại của các khoản thu về đúng bằng số vốn đã bỏ ra.',
      whenToUse:
        'Khi thẩm định một khoản cho vay trả đều, mua trái phiếu coupon đều, hay một dự án thu tiền đều đặn.',
      howToRead:
        'IRR tính theo KỲ — dòng tiền theo tháng thì đây là %/tháng, muốn so với lãi suất năm phải năm hoá thêm một bước.',
      commonMistakes:
        'Cộng thô các khoản thu rồi chia cho vốn: cách đó bỏ qua chuyện tiền nhận sớm giá trị hơn tiền nhận muộn.',
    },
    example: {
      title: 'Bỏ 100 triệu ₫, nhận về 25 triệu ₫/kỳ trong 5 kỳ',
      inputs: { investment: 100_000_000, payment: 25_000_000, periods: 5 },
      expected: 7.93,
      note: 'Tổng thu 125 triệu ₫ nhưng IRR chỉ 7,93%/kỳ vì các khoản về rải rác theo thời gian.',
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
        warning: divideByZero('IRR', 'Số kỳ nhận tiền', 'Nhập ít nhất 1 kỳ.'),
      };
    }

    const investment = v('investment');
    const payment = v('payment');
    if (investment <= 0) {
      return {
        value: null,
        unit,
        warning: meaningless(
          'Chưa bỏ đồng vốn nào thì không có suất sinh lợi nội tại để tìm.',
          'Nhập vốn bỏ ra ban đầu lớn hơn 0.',
        ),
      };
    }
    if (payment <= 0) {
      return {
        value: null,
        unit,
        warning: meaningless(
          'Không có dòng thu nào về thì khoản đầu tư chỉ mất vốn, IRR không tồn tại.',
          'Nhập dòng thu mỗi kỳ lớn hơn 0.',
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
          'Không tìm được IRR trong khoảng −99% tới 1.000% mỗi kỳ với bộ số này.',
          'Kiểm tra lại vốn bỏ ra và dòng thu mỗi kỳ.',
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
    description: 'Cần bao nhiêu năm để vốn tăng gấp đôi ở một mức lợi suất kép cho trước.',
    latex: 't = \\frac{\\ln 2}{\\ln(1 + r)} \\approx \\frac{72}{r}',
    expression: 'Số năm nhân đôi = ln(2) ÷ ln(1 + Lợi suất năm) — xấp xỉ nhanh bằng 72 ÷ Lợi suất',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['nhan doi von', 'quy tac 72', 'rule of 72', 'doubling time'],
    resultUnit: 'năm',
    variables: [
      sliderVar('rate', 'Lợi suất kép / năm', '%', 8, 0, 30, 0.1, {
        description: 'Mức sinh lời đều mỗi năm, lãi nhập gốc.',
      }),
    ],
    explanation: {
      meaning: 'Đổi một con số phần trăm trừu tượng thành mốc thời gian dễ hình dung.',
      whenToUse:
        'Khi cần nhẩm nhanh sức mạnh của lãi kép — 8%/năm nghĩa là khoảng 9 năm tiền gấp đôi.',
      howToRead:
        'Kết quả chính là công thức chính xác ln(2) ÷ ln(1 + r); số phụ kèm theo là ước lượng 72 chia lợi suất — hai con số gần nhau ở mức lãi 5–12%.',
      commonMistakes:
        'Dùng quy tắc 72 cho lợi suất rất cao hoặc rất thấp — ngoài vùng 5–12% ước lượng lệch rõ so với công thức chính xác.',
    },
    example: {
      title: 'Lợi suất kép 8%/năm',
      inputs: { rate: 8 },
      expected: 9.01,
      note: 'Quy tắc 72 nhẩm ra 9 năm — sát với con số chính xác 9,01 năm.',
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
          'thời gian nhân đôi',
          'Lợi suất kép / năm',
          'Nhập lợi suất lớn hơn 0.',
        ),
      };
    }
    if (r < 0) {
      return {
        value: null,
        unit: 'năm',
        warning: meaningless(
          'Lợi suất âm làm vốn co lại theo thời gian nên không bao giờ nhân đôi.',
          'Nhập lợi suất dương, hoặc dùng công thức Lãi kép để xem vốn còn lại bao nhiêu.',
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
    description: 'Quy lợi suất của một lần mua bán ngắn ngày về mức tương đương cả năm.',
    latex: 'r_{nam} = \\left(\\frac{P_{ban}}{P_{mua}}\\right)^{365/d} - 1',
    expression: 'Lợi suất quy năm = (Giá bán ÷ Giá mua)^(365 ÷ Số ngày nắm giữ) − 1',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['quy nam', 'so ngay nam giu', 'annualized', 'hpr', 'luot song'],
    resultUnit: '%',
    variables: [
      numberVar('buyPrice', 'Giá mua', '₫', 80_000, { min: 0, max: 10_000_000 }),
      numberVar('sellPrice', 'Giá bán', '₫', 86_000, { min: 0, max: 10_000_000 }),
      sliderVar('days', 'Số ngày nắm giữ', 'ngày', 90, 1, 1095, 1, {
        description: 'Tính theo ngày lịch, từ ngày mua tới ngày bán.',
      }),
    ],
    explanation: {
      meaning:
        'Nếu lặp lại thương vụ này liên tục suốt 365 ngày thì cả năm được bao nhiêu — một thước đo chung cho các lần mua bán dài ngắn khác nhau.',
      whenToUse:
        'Khi so một thương vụ lướt sóng vài tuần với gửi tiết kiệm hay một khoản nắm giữ cả năm.',
      howToRead:
        'Nắm giữ càng ngắn thì phép quy năm phóng đại càng mạnh — lãi 7,5% trong 90 ngày quy năm thành hơn 34%.',
      commonMistakes:
        'Coi con số quy năm là thành tích chắc chắn lặp lại được, và quên trừ phí với thuế vốn chiếm phần lớn ở các lệnh ngắn ngày.',
    },
    example: {
      title: 'Mua 80.000 ₫, bán 86.000 ₫ sau 90 ngày',
      inputs: { buyPrice: 80_000, sellPrice: 86_000, days: 90 },
      expected: 34.08,
      note: 'Lãi thực tế của thương vụ là 7,5%; con số 34% chỉ là mức quy đổi cả năm.',
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
        warning: divideByZero('lợi suất quy năm', 'Số ngày nắm giữ', 'Nhập ít nhất 1 ngày.'),
      };
    }

    const buy = v('buyPrice');
    if (buy === 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero('lợi suất quy năm', 'Giá mua', 'Nhập giá mua lớn hơn 0.'),
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
    description: 'Danh mục làm tốt hơn hay kém hơn mốc so sánh bao nhiêu điểm phần trăm.',
    latex: 'ER = r_{p} - r_{b}',
    expression: 'Lợi suất vượt chuẩn = Lợi suất danh mục − Lợi suất chuẩn so sánh',
    chartType: 'none',
    level: 'basic',
    tags: ['vuot chuan', 'excess return', 'benchmark', 'so voi vn index', 'chenh lech'],
    resultUnit: '%',
    variables: [
      numberVar('portfolioReturn', 'Lợi suất danh mục', '%', 18.5, {
        min: -100,
        max: 500,
        description: 'Kết quả của danh mục trong kỳ đang xét.',
      }),
      numberVar('benchmarkReturn', 'Lợi suất chuẩn so sánh', '%', 12.2, {
        min: -100,
        max: 500,
        description: 'Mốc so sánh cùng kỳ, ví dụ VN-Index hoặc lãi suất tiết kiệm.',
      }),
    ],
    explanation: {
      meaning: 'Phần thành tích thật sự do lựa chọn đầu tư tạo ra, sau khi trừ đi mặt bằng chung.',
      whenToUse:
        'Khi tổng kết một kỳ đầu tư: lãi 18% chưa chắc giỏi nếu cả thị trường cùng kỳ tăng 25%.',
      howToRead:
        'Dương nghĩa là thắng chuẩn, âm là thua chuẩn — thua chuẩn kéo dài là dấu hiệu nên cân nhắc đầu tư theo chỉ số.',
      commonMistakes:
        'So với chuẩn không cùng mức rủi ro, hoặc lệch kỳ tính — hai lợi suất phải đo trên cùng một khoảng thời gian.',
    },
    example: {
      title: 'Danh mục lãi 18,5%, VN-Index cùng kỳ tăng 12,2%',
      inputs: { portfolioReturn: 18.5, benchmarkReturn: 12.2 },
      expected: 6.3,
      note: 'Danh mục thắng chuẩn 6,3 điểm phần trăm.',
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

    if (rp < -100) return { value: null, unit: '%', warning: belowTotalLoss('Lợi suất danh mục') };
    if (rb < -100) {
      return { value: null, unit: '%', warning: belowTotalLoss('Lợi suất chuẩn so sánh') };
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
