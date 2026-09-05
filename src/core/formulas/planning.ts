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
  label: {
    vi: 'Thông tư 04/2022/TT-NHNN về việc áp dụng lãi suất rút trước hạn tiền gửi',
    en: 'Circular 04/2022/TT-NHNN on applying early-withdrawal interest rates to deposits',
  },
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
    description: {
      vi: 'Tiền lãi thực nhận khi rút sổ tiết kiệm trước hạn — chỉ được trả theo lãi suất không kỳ hạn, mức cụ thể tuỳ từng ngân hàng.',
      en: 'The interest actually received when withdrawing a savings book early — paid only at the demand-deposit rate, with the exact rate varying by bank.',
    },
    latex: 'I = P \\times \\frac{r_{kkh}}{100} \\times \\frac{t}{12}',
    expression: {
      vi: 'Lãi thực nhận = Số tiền gửi × Lãi suất không kỳ hạn năm × Số tháng đã gửi ÷ 12',
      en: 'Interest received = Deposit amount × Annual demand-deposit rate × Months held ÷ 12',
    },
    /*
     * Tích của ba đầu vào với một hằng — quét biến nào cũng ra đoạn thẳng qua gốc. Cùng luật với
     * nhóm phí & thuế (xem docblock đầu `fees.ts`).
     *
     * Điều đáng nói của công thức này KHÔNG nằm ở hình mà ở chỗ so sánh: rút trước hạn thì lãi
     * tính theo lãi suất KHÔNG KỲ HẠN chứ không theo lãi suất đã cam kết. Việc ấy do `explanation`
     * và `commonMistakes` lo, một đường thẳng không nói thêm được gì.
     */
    chartType: 'none',
    level: 'basic',
    tags: ['rut truoc han', 'lai khong ky han', 'tiet kiem', 'early withdrawal'],
    resultUnit: '₫',
    variables: [
      numberVar('principal', { vi: 'Số tiền gửi', en: 'Deposit amount' }, '₫', 100_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: {
          vi: 'Số tiền gốc trên sổ tiết kiệm.',
          en: 'The principal amount on the savings book.',
        },
      }),
      sliderVar(
        'contractRate',
        { vi: 'Lãi suất hợp đồng / năm', en: 'Contract rate / year' },
        '%',
        5.5,
        0,
        15,
        0.1,
        {
          description: {
            vi: 'Mức lãi ghi trên sổ — chỉ được hưởng nếu gửi đủ kỳ hạn.',
            en: 'The rate stated on the book — only earned if held for the full term.',
          },
        },
      ),
      sliderVar(
        'termMonths',
        { vi: 'Kỳ hạn hợp đồng', en: 'Contract term' },
        'tháng',
        12,
        1,
        36,
        1,
        {
          description: {
            vi: 'Kỳ hạn ghi trên sổ tiết kiệm.',
            en: 'The term stated on the savings book.',
          },
        },
      ),
      sliderVar('monthsHeld', { vi: 'Thời gian đã gửi', en: 'Time held' }, 'tháng', 5, 0, 36, 1, {
        description: {
          vi: 'Số tháng đã gửi tính tới ngày rút.',
          en: 'The number of months held up to the withdrawal date.',
        },
      }),
      numberVar(
        'demandRate',
        { vi: 'Lãi suất không kỳ hạn / năm', en: 'Demand-deposit rate / year' },
        '%',
        0.1,
        {
          min: 0,
          max: 5,
          level: 'advanced',
          description: {
            vi: 'Mỗi ngân hàng một mức, thường quanh 0,1%/năm — xem biểu lãi suất không kỳ hạn của ngân hàng bạn rồi nhập vào đây.',
            en: "Each bank sets its own rate, usually around 0.1%/year — check your bank's demand-deposit rate table and enter it here.",
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Số tiền lãi ít ỏi còn nhận được khi phá vỡ kỳ hạn: toàn bộ thời gian đã gửi bị tính lại theo lãi suất không kỳ hạn.',
        en: 'The meager interest still received when breaking the term early: the entire holding period is recalculated at the demand-deposit rate.',
      },
      whenToUse: {
        vi: 'Trước khi quyết định rút sổ sớm để tiêu việc gấp, hoặc khi cân nhắc chia tiền thành nhiều sổ nhỏ.',
        en: 'Before deciding to withdraw early for an urgent need, or when considering splitting the money into several smaller books.',
      },
      howToRead: {
        vi: 'So con số này với phần lãi hợp đồng lẽ ra được hưởng (hiện ở phần số phụ) — chênh lệch chính là cái giá của việc rút sớm.',
        en: 'Compare this figure with the contract interest that would otherwise have been earned (shown in the secondary figures) — the difference is the price of withdrawing early.',
      },
      commonMistakes: {
        vi: 'Tưởng gửi được gần hết kỳ hạn thì lãi mất ít. Rút trước hạn dù chỉ một ngày, cả quãng đã gửi vẫn chỉ được trả lãi không kỳ hạn; ngân hàng còn tính theo số ngày thực gửi nên con số thực tế có thể lệch nhẹ so với ước tính theo tháng.',
        en: 'Assuming that holding almost the full term means losing little interest. Withdraw early by even one day and the entire holding period is still paid only at the demand-deposit rate; banks also calculate by actual days held, so the real figure may differ slightly from a month-based estimate.',
      },
    },
    example: {
      title: {
        vi: 'Sổ 100 triệu ₫ kỳ hạn 12 tháng, rút sau 5 tháng, lãi không kỳ hạn 0,1%/năm',
        en: 'A 100 million VND book with a 12-month term, withdrawn after 5 months, demand-deposit rate 0.1%/year',
      },
      inputs: {
        principal: 100_000_000,
        contractRate: 5.5,
        termMonths: 12,
        monthsHeld: 5,
        demandRate: 0.1,
      },
      expected: 41_666.67,
      note: {
        vi: 'Lẽ ra được khoảng 2,29 triệu ₫ nếu tính theo lãi hợp đồng cho 5 tháng — rút sớm mất khoảng 2,25 triệu ₫.',
        en: 'Would have earned about 2.29 million VND at the contract rate for 5 months — withdrawing early forfeits about 2.25 million VND.',
      },
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
          {
            vi: 'Thời gian đã gửi bằng hoặc vượt kỳ hạn nên đây không còn là rút trước hạn.',
            en: 'The holding period equals or exceeds the term, so this is no longer an early withdrawal.',
          },
          {
            vi: 'Dùng công thức Lãi tiền gửi có kỳ hạn để tính lãi khi gửi đủ kỳ.',
            en: 'Use the Term deposit interest formula to calculate interest for a full term.',
          },
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
    description: {
      vi: 'Chênh lệch tiền cuối kỳ giữa gửi kỳ ngắn quay vòng liên tục và gửi một sổ kỳ dài.',
      en: 'The difference in ending balance between continuously rolling over short-term deposits and holding a single long-term book.',
    },
    latex:
      '\\Delta = P\\left(1 + \\frac{r_n \\, m}{1200}\\right)^{k} - P\\left(1 + \\frac{r_d \\, T}{1200}\\right)',
    expression: {
      vi: 'Chênh lệch = Tiền cuối kỳ khi quay vòng kỳ ngắn − Tiền cuối kỳ khi gửi kỳ dài',
      en: 'Difference = Ending balance from rolling short-term deposits − Ending balance from a long-term deposit',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['quay vong', 'ky ngan', 'ky dai', 'tiet kiem', 'rollover', 'lai kep'],
    resultUnit: '₫',
    variables: [
      numberVar('principal', { vi: 'Số tiền gửi', en: 'Deposit amount' }, '₫', 100_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: {
          vi: 'Số tiền gửi ban đầu, giữ nguyên suốt thời gian so sánh.',
          en: 'The initial deposit amount, held constant throughout the comparison period.',
        },
      }),
      sliderVar(
        'shortRate',
        { vi: 'Lãi suất kỳ ngắn / năm', en: 'Short-term rate / year' },
        '%',
        4.7,
        0,
        15,
        0.1,
        {
          description: {
            vi: 'Lãi suất của kỳ hạn ngắn định quay vòng.',
            en: 'The rate of the short term intended to be rolled over.',
          },
        },
      ),
      sliderVar('shortMonths', { vi: 'Kỳ hạn ngắn', en: 'Short term' }, 'tháng', 3, 1, 12, 1, {
        description: {
          vi: 'Hết mỗi kỳ, cả gốc lẫn lãi được gửi tiếp kỳ mới.',
          en: 'At the end of each period, both principal and interest are rolled into the next period.',
        },
      }),
      sliderVar(
        'longRate',
        { vi: 'Lãi suất kỳ dài / năm', en: 'Long-term rate / year' },
        '%',
        5.5,
        0,
        15,
        0.1,
        {
          description: {
            vi: 'Lãi suất của sổ kỳ dài gửi một lần tới đáo hạn.',
            en: 'The rate of the long-term book, deposited once until maturity.',
          },
        },
      ),
      sliderVar('totalMonths', { vi: 'Tổng thời gian', en: 'Total time' }, 'tháng', 12, 1, 60, 1, {
        description: {
          vi: 'Tổng thời gian so sánh — cũng là kỳ hạn của sổ dài.',
          en: 'The total comparison period — also the term of the long-term book.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Quay vòng kỳ ngắn thì tiền lãi mỗi vòng được nhập gốc gửi tiếp, nên dù lãi suất thấp hơn vẫn có thể đuổi kịp sổ kỳ dài.',
        en: "When rolling over short terms, each round's interest is folded back into the principal for the next round, so even a lower rate can catch up with a long-term book.",
      },
      whenToUse: {
        vi: 'Khi phân vân giữa chốt một sổ dài lãi cao và giữ sự linh hoạt của các kỳ ngắn nối nhau.',
        en: 'When torn between locking in a single high-rate long-term book and keeping the flexibility of successive short terms.',
      },
      howToRead: {
        vi: 'Kết quả dương là quay vòng kỳ ngắn được nhiều tiền hơn; âm là sổ kỳ dài thắng. Chênh lệch lãi suất giữa hai kỳ hạn càng lớn thì kỳ dài càng khó bị đuổi kịp.',
        en: 'A positive result means rolling over short terms yields more money; a negative one means the long-term book wins. The larger the rate gap between the two terms, the harder it is for the long term to be caught up.',
      },
      commonMistakes: {
        vi: 'Quên rằng khi quay vòng, lãi suất kỳ ngắn của các vòng sau có thể đã đổi — công thức giả định mức lãi giữ nguyên suốt các vòng.',
        en: 'Forgetting that when rolling over, the short-term rate of later rounds may have changed — the formula assumes the rate stays constant across all rounds.',
      },
    },
    example: {
      title: {
        vi: '100 triệu ₫: quay vòng kỳ 3 tháng 4,7%/năm so với sổ 12 tháng 5,5%/năm',
        en: '100 million VND: rolling over a 3-month term at 4.7%/year versus a 12-month book at 5.5%/year',
      },
      inputs: {
        principal: 100_000_000,
        shortRate: 4.7,
        shortMonths: 3,
        longRate: 5.5,
        totalMonths: 12,
      },
      expected: -716_511.7,
      note: {
        vi: 'Sổ 12 tháng thắng khoảng 717 nghìn ₫ — bốn vòng lãi kép chưa bù nổi 0,8 điểm % chênh lãi suất.',
        en: 'The 12-month book wins by about 717 thousand VND — four rounds of compounding are not enough to offset a 0.8 percentage-point rate gap.',
      },
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
          { vi: 'số vòng quay', en: 'number of rollover rounds' },
          { vi: 'Kỳ hạn ngắn', en: 'Short term' },
          {
            vi: 'Nhập kỳ hạn ngắn từ 1 tháng trở lên.',
            en: 'Enter a short term of 1 month or more.',
          },
        ),
      };
    }

    const totalMonths = Math.round(v('totalMonths'));
    if (totalMonths % shortMonths !== 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          {
            vi: 'Tổng thời gian không chia hết cho kỳ hạn ngắn nên vòng cuối bị dở dang, hai phương án không so sánh được.',
            en: 'The total time is not evenly divisible by the short term, so the final round is incomplete and the two options cannot be compared.',
          },
          {
            vi: 'Chọn tổng thời gian là bội số của kỳ hạn ngắn, ví dụ kỳ 3 tháng thì so ở mốc 6, 9 hay 12 tháng.',
            en: 'Choose a total time that is a multiple of the short term — for a 3-month term, compare at 6, 9, or 12 months.',
          },
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
    description: {
      vi: 'Giá vốn bình quân sau nhiều đợt mua với số tiền và giá khác nhau. Đợt nào không có thì nhập 0 vào cả ô tiền lẫn ô giá — đợt đó được bỏ qua.',
      en: 'The average cost basis after several purchase rounds at different amounts and prices. For any round that did not happen, enter 0 in both the amount and price fields — that round is skipped.',
    },
    latex: '\\bar{P} = \\frac{\\sum_i C_i}{\\sum_i C_i / P_i}',
    expression: {
      vi: 'Giá vốn trung bình = Tổng tiền đã mua ÷ Tổng số cổ phiếu mua được',
      en: 'Average cost = Total amount invested ÷ Total shares acquired',
    },
    /*
     * MỞ biểu đồ ở đợt kiểm kê — trước đó khai `'none'`. Luật chung "hàm bậc nhất thì đừng vẽ"
     * không áp được: giá vốn bình quân có ẩn số ở MẪU (`Σ Cᵢ/Pᵢ`), nên quét giá một đợt mua ra
     * ĐƯỜNG CONG chứ không phải đường thẳng. Đo trên Registry: 41 điểm cho 40 bước khác nhau, giảm
     * dần 754 → 728 → 703 → 679…
     *
     * Đường cong ấy chính là điều khó thấy nhất của DCA: mua thêm ở giá cao thì giá vốn nhích lên
     * NGÀY CÀNG CHẬM, chứ không tăng đều theo giá.
     */
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['dca', 'gia von trung binh', 'trung binh gia', 'average cost', 'dau tu dinh ky'],
    resultUnit: '₫',
    variables: [
      numberVar(
        'amount1',
        { vi: 'Tiền mua đợt 1', en: 'Amount invested, round 1' },
        '₫',
        10_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Số tiền bỏ ra ở đợt mua thứ nhất.',
            en: 'The amount spent in the first purchase round.',
          },
        },
      ),
      numberVar('price1', { vi: 'Giá mua đợt 1', en: 'Purchase price, round 1' }, '₫', 50_000, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Giá khớp lệnh của đợt thứ nhất.',
          en: 'The matched price of the first round.',
        },
      }),
      numberVar(
        'amount2',
        { vi: 'Tiền mua đợt 2', en: 'Amount invested, round 2' },
        '₫',
        10_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Nhập 0 nếu không có đợt này.',
            en: 'Enter 0 if this round did not happen.',
          },
        },
      ),
      numberVar('price2', { vi: 'Giá mua đợt 2', en: 'Purchase price, round 2' }, '₫', 40_000, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Nhập 0 nếu không có đợt này.',
          en: 'Enter 0 if this round did not happen.',
        },
      }),
      numberVar(
        'amount3',
        { vi: 'Tiền mua đợt 3', en: 'Amount invested, round 3' },
        '₫',
        10_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Nhập 0 nếu không có đợt này.',
            en: 'Enter 0 if this round did not happen.',
          },
        },
      ),
      numberVar('price3', { vi: 'Giá mua đợt 3', en: 'Purchase price, round 3' }, '₫', 25_000, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Nhập 0 nếu không có đợt này.',
          en: 'Enter 0 if this round did not happen.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Mức giá bình quân thực sự đã trả cho mỗi cổ phiếu sau khi gom các đợt mua giá cao lẫn giá thấp.',
        en: 'The average price actually paid per share after combining purchase rounds at both high and low prices.',
      },
      whenToUse: {
        vi: 'Sau vài đợt mua rải, để biết cổ phiếu phải về giá nào thì hoà vốn và đợt mua tiếp theo nên chờ vùng giá nào.',
        en: 'After several staggered purchases, to know what price the stock must reach to break even and what price range to wait for on the next purchase.',
      },
      howToRead: {
        vi: 'Mua cùng một số tiền mỗi đợt thì đợt giá thấp mua được nhiều cổ phiếu hơn, nên giá vốn trung bình luôn thấp hơn trung bình cộng các mức giá.',
        en: 'Investing the same amount each round means the lower-priced round buys more shares, so the average cost is always lower than the simple average of the prices.',
      },
      commonMistakes: {
        vi: 'Cộng các mức giá rồi chia ba. Cách đó bỏ qua việc mỗi đợt mua được số cổ phiếu khác nhau, cho ra giá vốn cao hơn thực tế.',
        en: 'Adding up the prices and dividing by three. That approach ignores that each round buys a different number of shares, producing a cost basis higher than the real one.',
      },
    },
    example: {
      title: {
        vi: 'Ba đợt, mỗi đợt 10 triệu ₫ ở giá 50.000 · 40.000 · 25.000 ₫',
        en: 'Three rounds, 10 million VND each, at prices of 50,000 · 40,000 · 25,000 VND',
      },
      inputs: {
        amount1: 10_000_000,
        price1: 50_000,
        amount2: 10_000_000,
        price2: 40_000,
        amount3: 10_000_000,
        price3: 25_000,
      },
      expected: 35_294.12,
      note: {
        vi: 'Thấp hơn hẳn trung bình cộng ba mức giá (38.333 ₫) vì đợt giá rẻ mua được nhiều cổ phiếu nhất.',
        en: 'Well below the simple average of the three prices (38,333 VND) because the cheapest round bought the most shares.',
      },
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
            { vi: 'số cổ phiếu mua được', en: 'shares acquired' },
            { vi: `Giá mua đợt ${lot}`, en: `Purchase price, round ${lot}` },
            {
              vi: `Nhập giá mua đợt ${lot} lớn hơn 0, hoặc đưa cả tiền mua đợt ${lot} về 0 nếu không có đợt này.`,
              en: `Enter a purchase price greater than 0 for round ${lot}, or set the amount for round ${lot} to 0 if this round did not happen.`,
            },
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
          { vi: 'giá vốn trung bình', en: 'average cost' },
          { vi: 'Tổng số cổ phiếu', en: 'Total shares' },
          {
            vi: 'Nhập ít nhất một đợt mua với số tiền và giá lớn hơn 0.',
            en: 'Enter at least one purchase round with an amount and price greater than 0.',
          },
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
    description: {
      vi: 'Cần góp đều bao nhiêu tháng để khoản đầu tư định kỳ đạt số tiền mục tiêu, với lợi suất kỳ vọng cho trước.',
      en: 'How many months of equal contributions are needed for a periodic investment to reach a target amount, given an expected rate of return.',
    },
    latex: 'n = \\left\\lceil \\frac{\\ln(1 + FV \\cdot i / C)}{\\ln(1 + i)} \\right\\rceil',
    expression: {
      vi: 'Số kỳ = ln(1 + Mục tiêu × Lợi suất kỳ ÷ Mức góp mỗi kỳ) ÷ ln(1 + Lợi suất kỳ), làm tròn lên',
      en: 'Number of periods = ln(1 + Target × Period rate ÷ Contribution per period) ÷ ln(1 + Period rate), rounded up',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['dca', 'so ky', 'muc tieu', 'gop deu', 'dau tu dinh ky', 'periods to goal'],
    resultUnit: 'tháng',
    variables: [
      numberVar('target', { vi: 'Số tiền mục tiêu', en: 'Target amount' }, '₫', 500_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: {
          vi: 'Giá trị danh mục muốn đạt được.',
          en: 'The portfolio value you want to reach.',
        },
      }),
      numberVar(
        'contribution',
        { vi: 'Mức góp mỗi tháng', en: 'Monthly contribution' },
        '₫',
        10_000_000,
        {
          min: 0,
          max: 10_000_000_000,
          description: {
            vi: 'Số tiền bỏ vào đều đặn cuối mỗi tháng.',
            en: 'The amount contributed regularly at the end of each month.',
          },
        },
      ),
      sliderVar(
        'rate',
        { vi: 'Lợi suất kỳ vọng / năm', en: 'Expected rate of return / year' },
        '%',
        8,
        0,
        20,
        0.1,
        {
          description: {
            vi: 'Lợi suất bình quân năm kỳ vọng của kênh đầu tư.',
            en: 'The expected average annual return of the investment channel.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Số tháng góp đều tối thiểu để tổng tiền góp cộng lợi nhuận tích luỹ chạm mức mục tiêu.',
        en: 'The minimum number of months of equal contributions for total contributions plus accumulated returns to reach the target.',
      },
      whenToUse: {
        vi: 'Khi lập kế hoạch tích sản dài hạn và muốn biết đích đến còn cách bao nhiêu tháng với sức góp hiện tại.',
        en: 'When planning long-term wealth accumulation and wanting to know how many months away the goal is at the current contribution rate.',
      },
      howToRead: {
        vi: 'Kết quả đã làm tròn lên kỳ trọn vẹn gần nhất. Tăng mức góp rút ngắn thời gian chắc chắn hơn nhiều so với kỳ vọng lợi suất cao — lợi suất là thứ không hứa trước được.',
        en: 'The result is rounded up to the nearest whole period. Increasing the contribution shortens the timeline far more reliably than counting on a high expected return — returns are never guaranteed in advance.',
      },
      commonMistakes: {
        vi: 'Lấy mục tiêu chia cho mức góp rồi coi đó là số tháng — cách đó bỏ qua lợi nhuận tích luỹ nên ra thời gian dài hơn thực tế, nhất là ở kế hoạch nhiều năm.',
        en: 'Dividing the target by the contribution and treating that as the number of months — this ignores accumulated returns and overstates the time needed, especially for multi-year plans.',
      },
    },
    example: {
      title: {
        vi: 'Mục tiêu 500 triệu ₫, góp 10 triệu ₫/tháng, kỳ vọng 8%/năm',
        en: 'Target 500 million VND, contributing 10 million VND/month, expected return 8%/year',
      },
      inputs: { target: 500_000_000, contribution: 10_000_000, rate: 8 },
      expected: 44,
      note: {
        vi: 'Nếu không có lợi nhuận thì phải góp đủ 50 tháng — lợi suất 8%/năm rút ngắn được 6 tháng.',
        en: 'Without any returns it would take a full 50 months — an 8%/year return shortens that by 6 months.',
      },
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
          { vi: 'số kỳ cần góp', en: 'number of periods needed' },
          { vi: 'Mức góp mỗi tháng', en: 'Monthly contribution' },
          {
            vi: 'Nhập mức góp lớn hơn 0 — không góp thì không có kế hoạch nào tới đích.',
            en: 'Enter a contribution greater than 0 — with no contribution, no plan ever reaches the goal.',
          },
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
    description: {
      vi: 'Tổng thuế thu nhập cá nhân phải nộp trong năm cho một khoản đầu tư: thuế chuyển nhượng khi bán cộng thuế cổ tức tiền mặt.',
      en: 'The total personal income tax payable in a year on an investment: transfer tax on the sale plus tax on cash dividends.',
    },
    latex: 'T = Q \\cdot P_{ban} \\cdot r_{cn} + Q \\cdot D \\cdot r_{ct}',
    expression: {
      vi: 'Tổng thuế = Khối lượng × Giá bán × Thuế suất chuyển nhượng + Khối lượng × Cổ tức mỗi cổ phiếu × Thuế suất cổ tức',
      en: 'Total tax = Quantity × Sale price × Transfer tax rate + Quantity × Dividend per share × Dividend tax rate',
    },
    chartType: 'stackedBar',
    /*
     * Hai khoản bị khấu trừ ở hai thời điểm khác nhau, và đó chính là điều `howToRead` muốn nói.
     * `extras` đã có sẵn từ trước, không phải sửa `calc`.
     */
    breakdown: [
      {
        key: 'transferTax',
        sign: 1,
        shortLabel: { vi: 'Thuế chuyển nhượng', en: 'Transfer tax' },
      },
      { key: 'dividendTax', sign: 1, shortLabel: { vi: 'Thuế cổ tức', en: 'Dividend tax' } },
    ],
    breakdownTotal: { vi: 'Tổng thuế', en: 'Total tax' },
    level: 'basic',
    tags: ['thue tncn', 'thue dau tu', 'chuyen nhuong', 'co tuc', 'personal income tax'],
    resultUnit: '₫',
    variables: [
      numberVar('quantity', { vi: 'Khối lượng', en: 'Quantity' }, 'CP', 1_000, {
        min: 0,
        max: 50_000_000,
        description: {
          vi: 'Số cổ phiếu nắm giữ, nhận cổ tức rồi bán ra trong năm.',
          en: 'The number of shares held, receiving dividends and then sold during the year.',
        },
      }),
      numberVar('sellPrice', { vi: 'Giá bán', en: 'Sale price' }, '₫', 97_000, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Giá khớp lệnh bán, tính cho một cổ phiếu. Nhập 0 nếu năm nay chưa bán.',
          en: 'The matched sale price, per share. Enter 0 if no sale has happened this year.',
        },
      }),
      numberVar('dividendPerShare', { vi: 'Cổ tức tiền mặt', en: 'Cash dividend' }, '₫/CP', 2_000, {
        min: 0,
        max: 1_000_000,
        description: {
          vi: 'Cổ tức tiền mặt trên mỗi cổ phiếu, trước thuế. Nhập 0 nếu không có.',
          en: 'The cash dividend per share, before tax. Enter 0 if there is none.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Toàn bộ thuế thu nhập cá nhân Nhà nước thu từ một khoản đầu tư trong năm, gom hai khoản bị khấu trừ ở hai thời điểm khác nhau.',
        en: 'The total personal income tax the state collects on an investment during the year, combining two amounts withheld at two different points in time.',
      },
      whenToUse: {
        vi: 'Khi quyết toán lại một khoản đầu tư cả năm, hoặc ước tính trước phần thuế của một kế hoạch vừa nhận cổ tức vừa chốt lời.',
        en: 'When finalizing a year of investment activity, or estimating in advance the tax on a plan that both receives dividends and takes profit.',
      },
      howToRead: {
        vi: 'Hai khoản có bản chất khác nhau: thuế chuyển nhượng tính trên giá trị bán nên lỗ vẫn phải nộp, còn thuế cổ tức khấu trừ trước khi tiền về tài khoản.',
        en: 'The two amounts differ in nature: transfer tax is charged on the sale value, so it is due even on a loss, while dividend tax is withheld before the money reaches the account.',
      },
      commonMistakes: {
        vi: 'Tưởng bán lỗ thì cả năm không mất đồng thuế nào — thuế chuyển nhượng thu theo giá trị bán, không theo lãi.',
        en: 'Assuming that selling at a loss means no tax is owed for the year — transfer tax is charged on the sale value, not on the profit.',
      },
    },
    example: {
      title: {
        vi: '1.000 CP: nhận cổ tức 2.000 ₫/CP rồi bán giá 97.000 ₫, biểu phí HOSE 2026',
        en: '1,000 shares: receiving a 2,000 VND/share dividend then selling at 97,000 VND, HOSE 2026 fee schedule',
      },
      inputs: { quantity: 1_000, sellPrice: 97_000, dividendPerShare: 2_000 },
      expected: 197_000,
      note: {
        vi: 'Gồm 97.000 ₫ thuế chuyển nhượng và 100.000 ₫ thuế cổ tức.',
        en: 'Comprising 97,000 VND transfer tax and 100,000 VND dividend tax.',
      },
    },
    note: {
      vi: 'Công thức tính cho cổ phiếu niêm yết. Luật thuế mới có hai ưu đãi nằm ngoài phạm vi: giảm 50% thuế với lợi tức từ quỹ đầu tư chứng khoán/BĐS, và miễn thuế chuyển nhượng chứng chỉ quỹ mở nắm giữ từ 2 năm.',
      en: 'This formula applies to listed shares. The new tax law has two incentives outside its scope: a 50% tax reduction on income from securities/real-estate investment funds, and a transfer-tax exemption for open-end fund certificates held for 2 years or more.',
    },
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
      return missingConstant('₫', {
        vi: 'thuế chuyển nhượng và thuế cổ tức',
        en: 'transfer tax and dividend tax',
      });
    }

    const q = v('quantity');
    const sellValue = q * v('sellPrice');
    const dividendValue = q * v('dividendPerShare');

    if (sellValue === 0 && dividendValue === 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          {
            vi: 'Chưa có giá trị bán hay cổ tức nào trong năm nên không có căn cứ tính thuế.',
            en: 'There is no sale value or dividend for the year yet, so there is no basis for calculating tax.',
          },
          {
            vi: 'Nhập giá bán hoặc cổ tức lớn hơn 0.',
            en: 'Enter a sale price or dividend greater than 0.',
          },
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
