/**
 * Tầng DOMAIN — nhóm kế hoạch tài chính cá nhân còn thiếu (nhánh 5).
 *
 * Năm công thức khép lại ba nhóm cá nhân: hai của Tiết kiệm (rút trước hạn và so sánh
 * quay vòng kỳ ngắn với kỳ dài — nhóm 'savings' đã có 3 trong personal.ts), hai của
 * Đầu tư (giá vốn trung bình DCA và số kỳ DCA để đạt mục tiêu), một của Thuế TNCN
 * (tổng thuế một giao dịch đầu tư trong năm, cùng khuôn tra biểu phí với fees.ts).
 *
 * Con số kiểm chứng tính độc lập bằng dạng đóng trước khi viết hàm, theo đúng cách
 * tài liệu "FORMULAS & UNIT TEST" của bộ FINANCE CALC đã làm với nhóm tiết kiệm.
 *
 * Quy ước lãi suất giữ nguyên như personal.ts (CON-05): biến `%` nhập theo mức người
 * đọc thấy trên hợp đồng — 5,5 nghĩa là 5,5%/năm — đổi sang lãi suất kỳ trong thân hàm.
 */

import { ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import type { FormulaSource } from '../registry/types';
import { divideByZero, meaningless } from '../warnings';
import {
  SOURCE_CORPORATE_FINANCE,
  SOURCE_PIT_LAW,
  missingConstant,
  numberVar,
  rateOf,
  sliderVar,
} from './shared';

/**
 * Văn bản quy định cách trả lãi khi rút tiền gửi trước hạn: nhận theo mức lãi suất
 * tiền gửi không kỳ hạn thấp nhất của chính tổ chức tín dụng đó.
 */
const SOURCE_EARLY_WITHDRAWAL: FormulaSource = {
  label: 'Thông tư 04/2022/TT-NHNN về việc áp dụng lãi suất rút trước hạn tiền gửi',
};

/*
 * ── 1. Lãi thực nhận khi rút trước hạn ─────────────────────────────────────────────────
 * Nhóm 'savings'. Rút trước hạn thì toàn bộ thời gian đã gửi chỉ được trả lãi không
 * kỳ hạn — con số nhỏ đến bất ngờ so với mức ghi trên hợp đồng.
 */

export const RUT_TRUOC_HAN: FormulaModule = {
  spec: {
    id: 'rut-truoc-han',
    categoryId: 'savings',
    name: { vi: 'Lãi thực nhận khi rút trước hạn', en: 'Early withdrawal interest' },
    description:
      'Tiền lãi thực nhận khi rút sổ tiết kiệm trước hạn — chỉ được trả theo lãi suất không kỳ hạn, mức cụ thể tuỳ từng ngân hàng.',
    latex: 'I = P \\times \\frac{r_{kkh}}{100} \\times \\frac{t}{12}',
    expression: 'Lãi thực nhận = Số tiền gửi × Lãi suất không kỳ hạn năm × Số tháng đã gửi ÷ 12',
    chartType: 'none',
    level: 'basic',
    tags: ['rut truoc han', 'lai khong ky han', 'tiet kiem', 'early withdrawal'],
    resultUnit: '₫',
    variables: [
      numberVar('principal', 'Số tiền gửi', '₫', 100_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Số tiền gốc trên sổ tiết kiệm.',
      }),
      sliderVar('contractRate', 'Lãi suất hợp đồng / năm', '%', 5.5, 0, 15, 0.1, {
        description: 'Mức lãi ghi trên sổ — chỉ được hưởng nếu gửi đủ kỳ hạn.',
      }),
      sliderVar('termMonths', 'Kỳ hạn hợp đồng', 'tháng', 12, 1, 36, 1, {
        description: 'Kỳ hạn ghi trên sổ tiết kiệm.',
      }),
      sliderVar('monthsHeld', 'Thời gian đã gửi', 'tháng', 5, 0, 36, 1, {
        description: 'Số tháng đã gửi tính tới ngày rút.',
      }),
      numberVar('demandRate', 'Lãi suất không kỳ hạn / năm', '%', 0.1, {
        min: 0,
        max: 5,
        level: 'advanced',
        description:
          'Mỗi ngân hàng một mức, thường quanh 0,1%/năm — xem biểu lãi suất không kỳ hạn của ngân hàng bạn rồi nhập vào đây.',
      }),
    ],
    explanation: {
      meaning:
        'Số tiền lãi ít ỏi còn nhận được khi phá vỡ kỳ hạn: toàn bộ thời gian đã gửi bị tính lại theo lãi suất không kỳ hạn.',
      whenToUse:
        'Trước khi quyết định rút sổ sớm để tiêu việc gấp, hoặc khi cân nhắc chia tiền thành nhiều sổ nhỏ.',
      howToRead:
        'So con số này với phần lãi hợp đồng lẽ ra được hưởng (hiện ở phần số phụ) — chênh lệch chính là cái giá của việc rút sớm.',
      commonMistakes:
        'Tưởng gửi được gần hết kỳ hạn thì lãi mất ít. Rút trước hạn dù chỉ một ngày, cả quãng đã gửi vẫn chỉ được trả lãi không kỳ hạn; ngân hàng còn tính theo số ngày thực gửi nên con số thực tế có thể lệch nhẹ so với ước tính theo tháng.',
    },
    example: {
      title: 'Sổ 100 triệu ₫ kỳ hạn 12 tháng, rút sau 5 tháng, lãi không kỳ hạn 0,1%/năm',
      inputs: {
        principal: 100_000_000,
        contractRate: 5.5,
        termMonths: 12,
        monthsHeld: 5,
        demandRate: 0.1,
      },
      expected: 41_666.67,
      note: 'Lẽ ra được khoảng 2,29 triệu ₫ nếu tính theo lãi hợp đồng cho 5 tháng — rút sớm mất khoảng 2,25 triệu ₫.',
    },
    tests: [
      {
        name: 'rút sau 5 tháng chỉ nhận lãi không kỳ hạn',
        inputs: {
          principal: 100_000_000,
          contractRate: 5.5,
          termMonths: 12,
          monthsHeld: 5,
          demandRate: 0.1,
        },
        expected: 41_666.67,
        tolerance: 1,
      },
      {
        name: 'rút ngay khi vừa gửi thì không có đồng lãi nào',
        inputs: {
          principal: 100_000_000,
          contractRate: 5.5,
          termMonths: 12,
          monthsHeld: 0,
          demandRate: 0.1,
        },
        expected: 0,
      },
      {
        name: 'đã gửi đủ kỳ hạn thì không còn là rút trước hạn',
        inputs: {
          principal: 100_000_000,
          contractRate: 5.5,
          termMonths: 12,
          monthsHeld: 12,
          demandRate: 0.1,
        },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_EARLY_WITHDRAWAL, SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => {
    if (v('monthsHeld') >= v('termMonths')) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          'Thời gian đã gửi bằng hoặc vượt kỳ hạn nên đây không còn là rút trước hạn.',
          'Dùng công thức Lãi tiền gửi có kỳ hạn để tính lãi khi gửi đủ kỳ.',
        ),
      };
    }

    const principal = v('principal');
    const received = ((principal * v('demandRate')) / 100 / 12) * v('monthsHeld');
    const atContractRate = ((principal * v('contractRate')) / 100 / 12) * v('monthsHeld');

    return ok(received, '₫', {
      extras: {
        interestAtContractRate: atContractRate,
        lostInterest: atContractRate - received,
      },
    });
  },
};

/*
 * ── 2. Gửi quay vòng kỳ ngắn hay gửi kỳ dài ────────────────────────────────────────────
 * Nhóm 'savings'. Quay vòng kỳ ngắn được lãi kép hoá theo số lần quay vòng, đổi lại
 * lãi suất kỳ ngắn thường thấp hơn kỳ dài — công thức này cho biết bên nào thắng.
 */

export const GUI_QUAY_VONG: FormulaModule = {
  spec: {
    id: 'gui-quay-vong',
    categoryId: 'savings',
    name: {
      vi: 'Gửi quay vòng kỳ ngắn hay gửi kỳ dài',
      en: 'Rolling short-term vs long-term deposit',
    },
    description:
      'Chênh lệch tiền cuối kỳ giữa gửi kỳ ngắn quay vòng liên tục và gửi một sổ kỳ dài.',
    latex:
      '\\Delta = P\\left(1 + \\frac{r_n \\, m}{1200}\\right)^{k} - P\\left(1 + \\frac{r_d \\, T}{1200}\\right)',
    expression: 'Chênh lệch = Tiền cuối kỳ khi quay vòng kỳ ngắn − Tiền cuối kỳ khi gửi kỳ dài',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['quay vong', 'ky ngan', 'ky dai', 'tiet kiem', 'rollover', 'lai kep'],
    resultUnit: '₫',
    variables: [
      numberVar('principal', 'Số tiền gửi', '₫', 100_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Số tiền gửi ban đầu, giữ nguyên suốt thời gian so sánh.',
      }),
      sliderVar('shortRate', 'Lãi suất kỳ ngắn / năm', '%', 4.7, 0, 15, 0.1, {
        description: 'Lãi suất của kỳ hạn ngắn định quay vòng.',
      }),
      sliderVar('shortMonths', 'Kỳ hạn ngắn', 'tháng', 3, 1, 12, 1, {
        description: 'Hết mỗi kỳ, cả gốc lẫn lãi được gửi tiếp kỳ mới.',
      }),
      sliderVar('longRate', 'Lãi suất kỳ dài / năm', '%', 5.5, 0, 15, 0.1, {
        description: 'Lãi suất của sổ kỳ dài gửi một lần tới đáo hạn.',
      }),
      sliderVar('totalMonths', 'Tổng thời gian', 'tháng', 12, 1, 60, 1, {
        description: 'Tổng thời gian so sánh — cũng là kỳ hạn của sổ dài.',
      }),
    ],
    explanation: {
      meaning:
        'Quay vòng kỳ ngắn thì tiền lãi mỗi vòng được nhập gốc gửi tiếp, nên dù lãi suất thấp hơn vẫn có thể đuổi kịp sổ kỳ dài.',
      whenToUse:
        'Khi phân vân giữa chốt một sổ dài lãi cao và giữ sự linh hoạt của các kỳ ngắn nối nhau.',
      howToRead:
        'Kết quả dương là quay vòng kỳ ngắn được nhiều tiền hơn; âm là sổ kỳ dài thắng. Chênh lệch lãi suất giữa hai kỳ hạn càng lớn thì kỳ dài càng khó bị đuổi kịp.',
      commonMistakes:
        'Quên rằng khi quay vòng, lãi suất kỳ ngắn của các vòng sau có thể đã đổi — công thức giả định mức lãi giữ nguyên suốt các vòng.',
    },
    example: {
      title: '100 triệu ₫: quay vòng kỳ 3 tháng 4,7%/năm so với sổ 12 tháng 5,5%/năm',
      inputs: {
        principal: 100_000_000,
        shortRate: 4.7,
        shortMonths: 3,
        longRate: 5.5,
        totalMonths: 12,
      },
      expected: -716_511.7,
      note: 'Sổ 12 tháng thắng khoảng 717 nghìn ₫ — bốn vòng lãi kép chưa bù nổi 0,8 điểm % chênh lãi suất.',
    },
    tests: [
      {
        name: 'kỳ 3 tháng 4,7% quay 4 vòng thua sổ 12 tháng 5,5%',
        inputs: {
          principal: 100_000_000,
          shortRate: 4.7,
          shortMonths: 3,
          longRate: 5.5,
          totalMonths: 12,
        },
        expected: -716_511.7,
        tolerance: 1,
      },
      {
        name: 'cùng lãi suất thì quay vòng thắng nhờ lãi kép',
        inputs: {
          principal: 100_000_000,
          shortRate: 5,
          shortMonths: 6,
          longRate: 5,
          totalMonths: 12,
        },
        expected: 62_500,
        tolerance: 1,
      },
      {
        name: 'kỳ ngắn bằng 0 thì không chia được số vòng',
        inputs: {
          principal: 100_000_000,
          shortRate: 4.7,
          shortMonths: 0,
          longRate: 5.5,
          totalMonths: 12,
        },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'tổng thời gian không chia hết cho kỳ ngắn thì không so sánh được',
        inputs: {
          principal: 100_000_000,
          shortRate: 4.7,
          shortMonths: 5,
          longRate: 5.5,
          totalMonths: 12,
        },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => {
    const shortMonths = Math.round(v('shortMonths'));
    if (shortMonths <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: divideByZero(
          'số vòng quay',
          'Kỳ hạn ngắn',
          'Nhập kỳ hạn ngắn từ 1 tháng trở lên.',
        ),
      };
    }

    const totalMonths = Math.round(v('totalMonths'));
    if (totalMonths % shortMonths !== 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          'Tổng thời gian không chia hết cho kỳ hạn ngắn nên vòng cuối bị dở dang, hai phương án không so sánh được.',
          'Chọn tổng thời gian là bội số của kỳ hạn ngắn, ví dụ kỳ 3 tháng thì so ở mốc 6, 9 hay 12 tháng.',
        ),
      };
    }

    const principal = v('principal');
    const cycles = totalMonths / shortMonths;
    const finalShort =
      principal * Math.pow(1 + ((v('shortRate') / 100) * shortMonths) / 12, cycles);
    const finalLong = principal * (1 + ((v('longRate') / 100) * totalMonths) / 12);

    return ok(finalShort - finalLong, '₫', {
      extras: { finalShort, finalLong, cycles },
    });
  },
};

/*
 * ── 3. Giá vốn trung bình DCA ──────────────────────────────────────────────────────────
 * Nhóm 'investing'. Ba cặp tiền/giá cho ba đợt mua; đợt nào chưa có thì để 0 ở cả hai ô.
 */

export const GIA_VON_TRUNG_BINH_DCA: FormulaModule = {
  spec: {
    id: 'gia-von-trung-binh-dca',
    categoryId: 'investing',
    name: { vi: 'Giá vốn trung bình khi mua DCA', en: 'DCA average cost per share' },
    description:
      'Giá vốn bình quân sau nhiều đợt mua với số tiền và giá khác nhau. Đợt nào không có thì nhập 0 vào cả ô tiền lẫn ô giá — đợt đó được bỏ qua.',
    latex: '\\bar{P} = \\frac{\\sum_i C_i}{\\sum_i C_i / P_i}',
    expression: 'Giá vốn trung bình = Tổng tiền đã mua ÷ Tổng số cổ phiếu mua được',
    chartType: 'none',
    level: 'basic',
    isFeatured: true,
    tags: ['dca', 'gia von trung binh', 'trung binh gia', 'average cost', 'dau tu dinh ky'],
    resultUnit: '₫',
    variables: [
      numberVar('amount1', 'Tiền mua đợt 1', '₫', 10_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Số tiền bỏ ra ở đợt mua thứ nhất.',
      }),
      numberVar('price1', 'Giá mua đợt 1', '₫', 50_000, {
        min: 0,
        max: 10_000_000,
        description: 'Giá khớp lệnh của đợt thứ nhất.',
      }),
      numberVar('amount2', 'Tiền mua đợt 2', '₫', 10_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Nhập 0 nếu không có đợt này.',
      }),
      numberVar('price2', 'Giá mua đợt 2', '₫', 40_000, {
        min: 0,
        max: 10_000_000,
        description: 'Nhập 0 nếu không có đợt này.',
      }),
      numberVar('amount3', 'Tiền mua đợt 3', '₫', 10_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Nhập 0 nếu không có đợt này.',
      }),
      numberVar('price3', 'Giá mua đợt 3', '₫', 25_000, {
        min: 0,
        max: 10_000_000,
        description: 'Nhập 0 nếu không có đợt này.',
      }),
    ],
    explanation: {
      meaning:
        'Mức giá bình quân thực sự đã trả cho mỗi cổ phiếu sau khi gom các đợt mua giá cao lẫn giá thấp.',
      whenToUse:
        'Sau vài đợt mua rải, để biết cổ phiếu phải về giá nào thì hoà vốn và đợt mua tiếp theo nên chờ vùng giá nào.',
      howToRead:
        'Mua cùng một số tiền mỗi đợt thì đợt giá thấp mua được nhiều cổ phiếu hơn, nên giá vốn trung bình luôn thấp hơn trung bình cộng các mức giá.',
      commonMistakes:
        'Cộng các mức giá rồi chia ba. Cách đó bỏ qua việc mỗi đợt mua được số cổ phiếu khác nhau, cho ra giá vốn cao hơn thực tế.',
    },
    example: {
      title: 'Ba đợt, mỗi đợt 10 triệu ₫ ở giá 50.000 · 40.000 · 25.000 ₫',
      inputs: {
        amount1: 10_000_000,
        price1: 50_000,
        amount2: 10_000_000,
        price2: 40_000,
        amount3: 10_000_000,
        price3: 25_000,
      },
      expected: 35_294.12,
      note: 'Thấp hơn hẳn trung bình cộng ba mức giá (38.333 ₫) vì đợt giá rẻ mua được nhiều cổ phiếu nhất.',
    },
    tests: [
      {
        name: 'ba đợt cùng số tiền, giá khác nhau',
        inputs: {
          amount1: 10_000_000,
          price1: 50_000,
          amount2: 10_000_000,
          price2: 40_000,
          amount3: 10_000_000,
          price3: 25_000,
        },
        expected: 35_294.12,
        tolerance: 1,
      },
      {
        name: 'đợt 3 nhập 0 thì chỉ tính hai đợt đầu',
        inputs: {
          amount1: 10_000_000,
          price1: 50_000,
          amount2: 10_000_000,
          price2: 40_000,
          amount3: 0,
          price3: 0,
        },
        expected: 44_444.44,
        tolerance: 1,
      },
      {
        name: 'có tiền mua nhưng giá đợt đó bằng 0 thì không chia được',
        inputs: {
          amount1: 10_000_000,
          price1: 0,
          amount2: 0,
          price2: 0,
          amount3: 0,
          price3: 0,
        },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'cả ba đợt đều 0 thì chưa có đợt mua nào',
        inputs: { amount1: 0, price1: 0, amount2: 0, price2: 0, amount3: 0, price3: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => {
    let totalInvested = 0;
    let totalShares = 0;

    for (const lot of [1, 2, 3]) {
      const amount = v(`amount${lot}`);
      if (amount === 0) continue; // Đợt bỏ trống — nhập 0 nghĩa là không có đợt này.

      const price = v(`price${lot}`);
      if (price === 0) {
        return {
          value: null,
          unit: '₫',
          warning: divideByZero(
            'số cổ phiếu mua được',
            `Giá mua đợt ${lot}`,
            `Nhập giá mua đợt ${lot} lớn hơn 0, hoặc đưa cả tiền mua đợt ${lot} về 0 nếu không có đợt này.`,
          ),
        };
      }

      totalInvested += amount;
      totalShares += amount / price;
    }

    if (totalShares === 0) {
      return {
        value: null,
        unit: '₫',
        warning: divideByZero(
          'giá vốn trung bình',
          'Tổng số cổ phiếu',
          'Nhập ít nhất một đợt mua với số tiền và giá lớn hơn 0.',
        ),
      };
    }

    return ok(totalInvested / totalShares, '₫', {
      extras: { totalInvested, totalShares },
    });
  },
};

/*
 * ── 4. Số kỳ DCA để đạt mục tiêu ───────────────────────────────────────────────────────
 * Nhóm 'investing'. Giải ngược công thức giá trị tương lai của dòng tiền đều theo n,
 * rồi làm tròn lên vì không góp được nửa kỳ.
 */

export const SO_KY_DCA: FormulaModule = {
  spec: {
    id: 'so-ky-dca',
    categoryId: 'investing',
    name: { vi: 'Số kỳ DCA để đạt mục tiêu', en: 'DCA periods to reach a goal' },
    description:
      'Cần góp đều bao nhiêu tháng để khoản đầu tư định kỳ đạt số tiền mục tiêu, với lợi suất kỳ vọng cho trước.',
    latex: 'n = \\left\\lceil \\frac{\\ln(1 + FV \\cdot i / C)}{\\ln(1 + i)} \\right\\rceil',
    expression:
      'Số kỳ = ln(1 + Mục tiêu × Lợi suất kỳ ÷ Mức góp mỗi kỳ) ÷ ln(1 + Lợi suất kỳ), làm tròn lên',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['dca', 'so ky', 'muc tieu', 'gop deu', 'dau tu dinh ky', 'periods to goal'],
    resultUnit: 'tháng',
    variables: [
      numberVar('target', 'Số tiền mục tiêu', '₫', 500_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Giá trị danh mục muốn đạt được.',
      }),
      numberVar('contribution', 'Mức góp mỗi tháng', '₫', 10_000_000, {
        min: 0,
        max: 10_000_000_000,
        description: 'Số tiền bỏ vào đều đặn cuối mỗi tháng.',
      }),
      sliderVar('rate', 'Lợi suất kỳ vọng / năm', '%', 8, 0, 20, 0.1, {
        description: 'Lợi suất bình quân năm kỳ vọng của kênh đầu tư.',
      }),
    ],
    explanation: {
      meaning:
        'Số tháng góp đều tối thiểu để tổng tiền góp cộng lợi nhuận tích luỹ chạm mức mục tiêu.',
      whenToUse:
        'Khi lập kế hoạch tích sản dài hạn và muốn biết đích đến còn cách bao nhiêu tháng với sức góp hiện tại.',
      howToRead:
        'Kết quả đã làm tròn lên kỳ trọn vẹn gần nhất. Tăng mức góp rút ngắn thời gian chắc chắn hơn nhiều so với kỳ vọng lợi suất cao — lợi suất là thứ không hứa trước được.',
      commonMistakes:
        'Lấy mục tiêu chia cho mức góp rồi coi đó là số tháng — cách đó bỏ qua lợi nhuận tích luỹ nên ra thời gian dài hơn thực tế, nhất là ở kế hoạch nhiều năm.',
    },
    example: {
      title: 'Mục tiêu 500 triệu ₫, góp 10 triệu ₫/tháng, kỳ vọng 8%/năm',
      inputs: { target: 500_000_000, contribution: 10_000_000, rate: 8 },
      expected: 44,
      note: 'Nếu không có lợi nhuận thì phải góp đủ 50 tháng — lợi suất 8%/năm rút ngắn được 6 tháng.',
    },
    tests: [
      {
        name: '500 triệu với mức góp 10 triệu, kỳ vọng 8%/năm',
        inputs: { target: 500_000_000, contribution: 10_000_000, rate: 8 },
        expected: 44,
      },
      {
        name: 'lợi suất 0% thì đúng bằng mục tiêu chia mức góp',
        inputs: { target: 120_000_000, contribution: 10_000_000, rate: 0 },
        expected: 12,
      },
      {
        name: 'mục tiêu xa với mức góp nhỏ, kỳ vọng 10%/năm',
        inputs: { target: 100_000_000, contribution: 5_000_000, rate: 10 },
        expected: 19,
      },
      {
        name: 'không góp đồng nào thì không bao giờ tới đích',
        inputs: { target: 500_000_000, contribution: 0, rate: 8 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => {
    const contribution = v('contribution');
    if (contribution <= 0) {
      return {
        value: null,
        unit: 'tháng',
        warning: divideByZero(
          'số kỳ cần góp',
          'Mức góp mỗi tháng',
          'Nhập mức góp lớn hơn 0 — không góp thì không có kế hoạch nào tới đích.',
        ),
      };
    }

    const target = v('target');
    if (target <= 0) return ok(0, 'tháng');

    const i = v('rate') / 100 / 12;
    if (i === 0) return ok(Math.ceil(target / contribution), 'tháng');

    const exact = Math.log(1 + (target * i) / contribution) / Math.log(1 + i);
    return ok(Math.ceil(exact), 'tháng', {
      extras: { withoutReturn: Math.ceil(target / contribution) },
    });
  },
};

/*
 * ── 5. Thuế TNCN một giao dịch đầu tư trong năm ────────────────────────────────────────
 * Nhóm 'personal-tax'. Cùng khuôn với fees.ts: hai thuế suất đọc từ MarketConfig qua
 * rateOf(), tra không ra thì báo lỗi chứ không coi là 0 (LDR-03, CON-10).
 */

export const THUE_TNCN_DAU_TU: FormulaModule = {
  spec: {
    id: 'thue-tncn-dau-tu',
    categoryId: 'personal-tax',
    name: {
      vi: 'Thuế TNCN một giao dịch đầu tư trong năm',
      en: 'Personal income tax on an investment in a year',
    },
    description:
      'Tổng thuế thu nhập cá nhân phải nộp trong năm cho một khoản đầu tư: thuế chuyển nhượng khi bán cộng thuế cổ tức tiền mặt.',
    latex: 'T = Q \\cdot P_{ban} \\cdot r_{cn} + Q \\cdot D \\cdot r_{ct}',
    expression:
      'Tổng thuế = Khối lượng × Giá bán × Thuế suất chuyển nhượng + Khối lượng × Cổ tức mỗi cổ phiếu × Thuế suất cổ tức',
    chartType: 'stackedBar',
    /*
     * Hai khoản bị khấu trừ ở hai thời điểm khác nhau, và đó chính là điều `howToRead` muốn nói.
     * `extras` đã có sẵn từ trước, không phải sửa `calc`.
     */
    breakdown: [
      { key: 'transferTax', sign: 1, shortLabel: 'Thuế chuyển nhượng' },
      { key: 'dividendTax', sign: 1, shortLabel: 'Thuế cổ tức' },
    ],
    breakdownTotal: 'Tổng thuế',
    level: 'basic',
    tags: ['thue tncn', 'thue dau tu', 'chuyen nhuong', 'co tuc', 'personal income tax'],
    resultUnit: '₫',
    variables: [
      numberVar('quantity', 'Khối lượng', 'CP', 1_000, {
        min: 0,
        max: 50_000_000,
        description: 'Số cổ phiếu nắm giữ, nhận cổ tức rồi bán ra trong năm.',
      }),
      numberVar('sellPrice', 'Giá bán', '₫', 97_000, {
        min: 0,
        max: 10_000_000,
        description: 'Giá khớp lệnh bán, tính cho một cổ phiếu. Nhập 0 nếu năm nay chưa bán.',
      }),
      numberVar('dividendPerShare', 'Cổ tức tiền mặt', '₫/CP', 2_000, {
        min: 0,
        max: 1_000_000,
        description: 'Cổ tức tiền mặt trên mỗi cổ phiếu, trước thuế. Nhập 0 nếu không có.',
      }),
    ],
    explanation: {
      meaning:
        'Toàn bộ thuế thu nhập cá nhân Nhà nước thu từ một khoản đầu tư trong năm, gom hai khoản bị khấu trừ ở hai thời điểm khác nhau.',
      whenToUse:
        'Khi quyết toán lại một khoản đầu tư cả năm, hoặc ước tính trước phần thuế của một kế hoạch vừa nhận cổ tức vừa chốt lời.',
      howToRead:
        'Hai khoản có bản chất khác nhau: thuế chuyển nhượng tính trên giá trị bán nên lỗ vẫn phải nộp, còn thuế cổ tức khấu trừ trước khi tiền về tài khoản.',
      commonMistakes:
        'Tưởng bán lỗ thì cả năm không mất đồng thuế nào — thuế chuyển nhượng thu theo giá trị bán, không theo lãi.',
    },
    example: {
      title: '1.000 CP: nhận cổ tức 2.000 ₫/CP rồi bán giá 97.000 ₫, biểu phí HOSE 2026',
      inputs: { quantity: 1_000, sellPrice: 97_000, dividendPerShare: 2_000 },
      expected: 197_000,
      note: 'Gồm 97.000 ₫ thuế chuyển nhượng và 100.000 ₫ thuế cổ tức.',
    },
    note: 'Công thức tính cho cổ phiếu niêm yết. Luật thuế mới có hai ưu đãi nằm ngoài phạm vi: giảm 50% thuế với lợi tức từ quỹ đầu tư chứng khoán/BĐS, và miễn thuế chuyển nhượng chứng chỉ quỹ mở nắm giữ từ 2 năm.',
    tests: [
      {
        name: 'vừa bán vừa nhận cổ tức trong năm',
        inputs: { quantity: 1_000, sellPrice: 97_000, dividendPerShare: 2_000 },
        expected: 197_000,
      },
      {
        name: 'năm nay chưa bán thì chỉ còn thuế cổ tức',
        inputs: { quantity: 1_000, sellPrice: 0, dividendPerShare: 2_000 },
        expected: 100_000,
      },
      {
        name: 'không bán cũng không có cổ tức thì chưa có căn cứ tính thuế',
        inputs: { quantity: 1_000, sellPrice: 0, dividendPerShare: 0 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    usesConstants: ['tax.transfer.sell', 'tax.dividend.cash'],
    source: [SOURCE_PIT_LAW],
  },
  calc: (v, ctx) => {
    const transferRate = rateOf(ctx, 'tax.transfer.sell');
    const dividendRate = rateOf(ctx, 'tax.dividend.cash');
    if (transferRate === null || dividendRate === null) {
      return missingConstant('₫', 'thuế chuyển nhượng và thuế cổ tức');
    }

    const q = v('quantity');
    const sellValue = q * v('sellPrice');
    const dividendValue = q * v('dividendPerShare');

    if (sellValue === 0 && dividendValue === 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          'Chưa có giá trị bán hay cổ tức nào trong năm nên không có căn cứ tính thuế.',
          'Nhập giá bán hoặc cổ tức lớn hơn 0.',
        ),
      };
    }

    const transferTax = sellValue * transferRate;
    const dividendTax = dividendValue * dividendRate;

    return ok(transferTax + dividendTax, '₫', {
      extras: { transferTax, dividendTax },
    });
  },
};

/** Năm công thức khép lại ba nhóm cá nhân còn thiếu. */
export const PLANNING_FORMULAS: ReadonlyArray<FormulaModule> = [
  RUT_TRUOC_HAN,
  GUI_QUAY_VONG,
  GIA_VON_TRUNG_BINH_DCA,
  SO_KY_DCA,
  THUE_TNCN_DAU_TU,
];
