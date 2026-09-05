/**
 * Tầng DOMAIN — nhóm phái sinh: hợp đồng tương lai chỉ số VN30F (một phần nhánh 5).
 *
 * Bảy công thức, đúng `expectedCount` của SRS 3.8. Thị trường Việt Nam mới có hợp đồng
 * tương lai chỉ số niêm yết, chưa có quyền chọn, nên cả nhóm xoay quanh VN30F — không có
 * Black-Scholes ở đây.
 *
 * Hệ số nhân 100.000 ₫/điểm đọc từ MarketConfig qua khoá 'derivative.vn30f.multiplier',
 * KHÔNG viết vào thân hàm (LDR-03, CON-10). Tỷ lệ ký quỹ ban đầu thì chưa có trong
 * MarketConfig vì mỗi công ty chứng khoán quy định một mức — để người dùng nhập, mặc định 17%.
 *
 * Con số trong `tests[]` tính độc lập trước bằng script node dạng đóng, không chạy lại
 * chính hàm tính để tự đối chiếu với nó.
 */

import { ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import type { FormulaSource } from '../registry/types';
import { divideByZero, meaningless } from '../warnings';
import { constantOf, missingConstant, numberVar, sliderVar } from './shared';

/*
 * ── Nguồn tham khảo của nhóm (FR-04) ───────────────────────────────────────────────────
 */

const SOURCE_HULL: FormulaSource = {
  label: {
    vi: 'John C. Hull — Options, Futures, and Other Derivatives, ấn bản thứ 11 (Pearson), chương 5: Determination of Forward and Futures Prices',
    en: 'John C. Hull — Options, Futures, and Other Derivatives, 11th edition (Pearson), chapter 5: Determination of Forward and Futures Prices',
  },
};

const SOURCE_HNX_VN30F: FormulaSource = {
  label: {
    vi: 'Quy chế giao dịch hợp đồng tương lai chỉ số VN30 của Sở Giao dịch Chứng khoán Hà Nội (HNX)',
    en: 'VN30 index futures trading regulations of the Hanoi Stock Exchange (HNX)',
  },
};

/*
 * ── Biến dùng chung cho cả nhóm ────────────────────────────────────────────────────────
 * Cùng key mang cùng nghĩa ở mọi công thức, để một bộ ô nhập chạy được nhiều công thức.
 */

const indexValue = numberVar(
  'indexValue',
  { vi: 'Chỉ số VN30 hiện tại', en: 'Current VN30 index' },
  'điểm',
  1_280,
  {
    min: 0,
    max: 10_000,
    description: {
      vi: 'Giá trị chỉ số cơ sở VN30 tại thời điểm tính.',
      en: 'Value of the underlying VN30 index at the time of calculation.',
    },
  },
);

const futuresPoints = numberVar(
  'futuresPoints',
  { vi: 'Điểm hợp đồng tương lai', en: 'Futures contract points' },
  'điểm',
  1_280,
  {
    min: 0,
    max: 10_000,
    description: {
      vi: 'Giá hợp đồng VN30F đang giao dịch, tính bằng điểm chỉ số.',
      en: 'Trading price of the VN30F contract, expressed in index points.',
    },
  },
);

const contracts = numberVar(
  'contracts',
  { vi: 'Số hợp đồng', en: 'Number of contracts' },
  'HĐ',
  1,
  {
    min: 0,
    max: 5_000,
    description: {
      vi: 'Số hợp đồng VN30F đang nắm giữ trong vị thế.',
      en: 'Number of VN30F contracts held in the position.',
    },
  },
);

/*
 * ── 1. Giá lý thuyết hợp đồng tương lai ────────────────────────────────────────────────
 */

export const GIA_LY_THUYET_VN30F: FormulaModule = {
  spec: {
    id: 'gia-ly-thuyet-vn30f',
    categoryId: 'derivatives',
    name: { vi: 'Giá lý thuyết hợp đồng tương lai', en: 'Theoretical futures price' },
    description: {
      vi: 'Mức giá hợp lý của hợp đồng VN30F suy từ chỉ số cơ sở, lãi suất và cổ tức (cost of carry).',
      en: 'The fair price of the VN30F contract derived from the underlying index, interest rate, and dividends (cost of carry).',
    },
    latex: 'F = S \\left[ 1 + (r - q) \\cdot \\frac{d}{365} \\right]',
    expression: {
      vi: 'Giá lý thuyết = Chỉ số cơ sở × [1 + (Lãi suất phi rủi ro − Tỷ suất cổ tức) ÷ 100 × Số ngày đến đáo hạn ÷ 365]',
      en: 'Theoretical price = Underlying index × [1 + (Risk-free rate − Dividend yield) ÷ 100 × Days to expiry ÷ 365]',
    },
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['vn30f', 'gia ly thuyet', 'hop dong tuong lai', 'cost of carry', 'futures', 'phai sinh'],
    resultUnit: 'điểm',
    variables: [
      indexValue,
      sliderVar(
        'riskFreeRate',
        { vi: 'Lãi suất phi rủi ro / năm', en: 'Risk-free rate / year' },
        '%',
        4.5,
        0,
        15,
        0.1,
        {
          description: {
            vi: 'Thường lấy theo lợi suất trái phiếu Chính phủ kỳ hạn ngắn.',
            en: 'Usually taken from the yield on short-term government bonds.',
          },
        },
      ),
      sliderVar(
        'dividendYield',
        { vi: 'Tỷ suất cổ tức rổ VN30 / năm', en: 'VN30 basket dividend yield / year' },
        '%',
        1.8,
        0,
        15,
        0.1,
        {
          level: 'advanced',
          description: {
            vi: 'Cổ tức tiền mặt bình quân của rổ VN30, tính theo năm.',
            en: 'Average annualized cash dividend of the VN30 basket.',
          },
        },
      ),
      numberVar('days', { vi: 'Số ngày đến đáo hạn', en: 'Days to expiry' }, 'ngày', 30, {
        min: 0,
        max: 365,
        description: {
          vi: 'Đếm từ hôm nay tới ngày đáo hạn của hợp đồng — thứ Năm tuần thứ ba của tháng.',
          en: 'Counted from today to the contract expiry date — the third Thursday of the month.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Nếu vay tiền mua cả rổ VN30 rồi giữ tới ngày đáo hạn, chi phí vốn trừ đi cổ tức nhận được chính là phần chênh hợp lý giữa giá hợp đồng và chỉ số.',
        en: 'If you borrowed money to buy the entire VN30 basket and held it to expiry, the cost of capital minus the dividends received is exactly the fair gap between the contract price and the index.',
      },
      whenToUse: {
        vi: 'Khi muốn biết giá VN30F trên bảng điện đang đắt hay rẻ so với mức mà lãi suất và cổ tức biện minh được.',
        en: 'When you want to know whether the VN30F price on the board is expensive or cheap relative to what interest rates and dividends justify.',
      },
      howToRead: {
        vi: 'Giá thị trường cao hơn giá lý thuyết đáng kể là thị trường đang hưng phấn; thấp hơn nhiều là đang bi quan về chỉ số.',
        en: 'A market price significantly above the theoretical price signals bullish exuberance; well below it signals pessimism about the index.',
      },
      commonMistakes: {
        vi: 'So giá hợp đồng với chỉ số hiện tại rồi kết luận đắt rẻ ngay — phần chênh do lãi suất và cổ tức là bình thường, không phải định giá sai.',
        en: 'Comparing the contract price to the current index and immediately calling it overpriced or underpriced — the gap from interest rates and dividends is normal, not mispricing.',
      },
    },
    example: {
      title: {
        vi: 'VN30 ở 1.280 điểm, lãi suất 4,5%, cổ tức 1,8%, còn 30 ngày',
        en: 'VN30 at 1,280 points, 4.5% interest rate, 1.8% dividend yield, 30 days left',
      },
      inputs: { indexValue: 1_280, riskFreeRate: 4.5, dividendYield: 1.8, days: 30 },
      expected: 1_282.84,
      note: {
        vi: 'Phần chênh 2,84 điểm là chi phí nắm giữ, chưa nói gì về hướng đi của chỉ số.',
        en: 'The 2.84-point gap is the cost of carry — it says nothing about where the index is headed.',
      },
    },
    tests: [
      {
        name: 'lãi suất cao hơn cổ tức thì giá lý thuyết cao hơn chỉ số',
        inputs: { indexValue: 1_280, riskFreeRate: 4.5, dividendYield: 1.8, days: 30 },
        expected: 1_282.84,
      },
      {
        name: 'cổ tức cao hơn lãi suất thì giá lý thuyết thấp hơn chỉ số',
        inputs: { indexValue: 1_280, riskFreeRate: 4.5, dividendYield: 6, days: 90 },
        expected: 1_275.27,
      },
      {
        name: 'ngày đáo hạn thì giá lý thuyết hội tụ về đúng chỉ số',
        inputs: { indexValue: 1_280, riskFreeRate: 4.5, dividendYield: 1.8, days: 0 },
        expected: 1_280,
      },
      {
        name: 'số ngày âm nghĩa là hợp đồng đã đáo hạn',
        inputs: { indexValue: 1_280, riskFreeRate: 4.5, dividendYield: 1.8, days: -5 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chỉ số cơ sở bằng 0 thì không có gì để định giá',
        inputs: { indexValue: 0, riskFreeRate: 4.5, dividendYield: 1.8, days: 30 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v) => {
    const spot = v('indexValue');
    const days = v('days');

    if (spot <= 0) {
      return {
        value: null,
        unit: 'điểm',
        warning: meaningless(
          {
            vi: 'Chỉ số cơ sở phải lớn hơn 0 thì mới có giá lý thuyết để tính.',
            en: 'The underlying index must be greater than 0 for a theoretical price to exist.',
          },
          {
            vi: 'Nhập giá trị chỉ số VN30 hiện tại trên bảng điện.',
            en: 'Enter the current VN30 index value from the board.',
          },
        ),
      };
    }

    if (days < 0) {
      return {
        value: null,
        unit: 'điểm',
        warning: meaningless(
          {
            vi: 'Số ngày đến đáo hạn đang âm — hợp đồng này đã qua ngày đáo hạn.',
            en: 'Days to expiry is negative — this contract has already passed its expiry date.',
          },
          {
            vi: 'Nhập số ngày từ 0 trở lên, hoặc chọn hợp đồng kỳ hạn xa hơn.',
            en: 'Enter a number of days of 0 or more, or choose a contract with a later expiry.',
          },
        ),
      };
    }

    const carry = spot * ((v('riskFreeRate') - v('dividendYield')) / 100) * (days / 365);
    return ok(spot + carry, 'điểm', { extras: { carryPoints: carry } });
  },
};

/*
 * ── 2. Basis — chênh giá hợp đồng so với chỉ số cơ sở ──────────────────────────────────
 */

export const BASIS_VN30F: FormulaModule = {
  spec: {
    id: 'basis-vn30f',
    categoryId: 'derivatives',
    name: { vi: 'Basis — chênh giá so với chỉ số', en: 'Futures basis' },
    description: {
      vi: 'Khoảng chênh giữa giá hợp đồng VN30F và chỉ số VN30 cơ sở, tính bằng điểm.',
      en: 'The gap between the VN30F contract price and the underlying VN30 index, in points.',
    },
    latex: 'Basis = F - S',
    expression: {
      vi: 'Basis = Giá hợp đồng tương lai − Chỉ số cơ sở',
      en: 'Basis = Futures contract price − Underlying index',
    },
    /*
     * Hiệu của đúng hai đầu vào — đường quét là đoạn thẳng hệ số góc ±1. Cùng luật với nhóm phí &
     * thuế (xem docblock đầu `fees.ts`). So với `so-hop-dong-toi-da` ngay dưới trong cùng file:
     * cái kia có hàm làm tròn xuống nên thành bậc thang và ĐÃ được mở biểu đồ.
     */
    chartType: 'none',
    level: 'basic',
    tags: ['basis', 'vn30f', 'chenh gia', 'premium', 'discount', 'phai sinh'],
    resultUnit: 'điểm',
    variables: [
      numberVar(
        'futuresPoints',
        { vi: 'Giá hợp đồng tương lai', en: 'Futures contract price' },
        'điểm',
        1_285.5,
        {
          min: 0,
          max: 10_000,
          description: {
            vi: 'Giá VN30F đang khớp trên bảng điện.',
            en: 'Current matched VN30F price on the board.',
          },
        },
      ),
      indexValue,
    ],
    explanation: {
      meaning: {
        vi: 'Chênh lệch giữa giá hợp đồng tương lai và chỉ số cơ sở: basis dương là hợp đồng đang được trả giá cao hơn chỉ số, basis âm là thấp hơn.',
        en: 'The difference between the futures price and the underlying index: a positive basis means the contract is priced above the index, a negative basis means below.',
      },
      whenToUse: {
        vi: 'Theo dõi trước khi vào lệnh — basis đang rộng bất thường hay hẹp dần về ngày đáo hạn đều là thông tin.',
        en: 'Watch it before placing an order — an unusually wide basis, or one narrowing toward expiry, both carry information.',
      },
      howToRead: {
        vi: 'Không đọc thẳng mọi basis dương là kỳ vọng tăng — quá nửa mức đó thường chỉ là chi phí nắm giữ hợp lý (xem mục Lỗi hay gặp). Basis vượt hẳn mức chi phí đó, hoặc basis âm sâu bất thường, mới đáng đọc là tâm lý thị trường. Càng gần đáo hạn basis càng co về 0.',
        en: "Don't read every positive basis as a bullish signal — much of it is usually just the fair cost of carry (see Common mistakes). Only a basis that clearly exceeds that cost, or an unusually deep negative basis, is worth reading as market sentiment. The basis converges to 0 as expiry approaches.",
      },
      commonMistakes: {
        vi: 'Quên rằng một phần basis là chi phí nắm giữ hợp lý (lãi suất trừ cổ tức) — không phải cứ basis dương là thị trường hưng phấn.',
        en: 'Forgetting that part of the basis is the fair cost of carry (interest minus dividends) — a positive basis does not automatically mean the market is euphoric.',
      },
    },
    example: {
      title: {
        vi: 'VN30F ở 1.285,5 điểm, VN30 ở 1.280 điểm',
        en: 'VN30F at 1,285.5 points, VN30 at 1,280 points',
      },
      inputs: { futuresPoints: 1_285.5, indexValue: 1_280 },
      expected: 5.5,
      note: {
        vi: 'Basis +5,5 điểm, tương đương khoảng 0,43% chỉ số.',
        en: 'Basis of +5.5 points, roughly 0.43% of the index.',
      },
    },
    tests: [
      {
        name: 'hợp đồng cao hơn chỉ số thì basis dương',
        inputs: { futuresPoints: 1_285.5, indexValue: 1_280 },
        expected: 5.5,
      },
      {
        name: 'hợp đồng thấp hơn chỉ số thì basis âm',
        inputs: { futuresPoints: 1_275, indexValue: 1_280 },
        expected: -5,
      },
      {
        name: 'chỉ số cơ sở bằng 0 thì không có mốc so sánh',
        inputs: { futuresPoints: 1_285.5, indexValue: 0 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v) => {
    const spot = v('indexValue');

    if (spot <= 0) {
      return {
        value: null,
        unit: 'điểm',
        warning: meaningless(
          {
            vi: 'Chỉ số cơ sở phải lớn hơn 0 thì basis mới có mốc để so sánh.',
            en: 'The underlying index must be greater than 0 for the basis to have a reference point.',
          },
          {
            vi: 'Nhập giá trị chỉ số VN30 hiện tại trên bảng điện.',
            en: 'Enter the current VN30 index value from the board.',
          },
        ),
      };
    }

    const basis = v('futuresPoints') - spot;
    return ok(basis, 'điểm', { extras: { basisPercent: (basis / spot) * 100 } });
  },
};

/*
 * ── 3. Lãi/lỗ vị thế Long ──────────────────────────────────────────────────────────────
 */

export const LAI_LO_VI_THE_LONG: FormulaModule = {
  spec: {
    id: 'lai-lo-vi-the-long',
    categoryId: 'derivatives',
    name: { vi: 'Lãi/lỗ vị thế Long', en: 'Long futures position P&L' },
    description: {
      vi: 'Số tiền lãi hoặc lỗ của vị thế mua hợp đồng VN30F, quy ra đồng.',
      en: 'The profit or loss, in VND, of a long VN30F futures position.',
    },
    latex: 'PnL_{long} = (P_{dong} - P_{mo}) \\times m \\times N',
    expression: {
      vi: 'Lãi/lỗ Long = (Điểm đóng vị thế − Điểm mở vị thế) × Hệ số nhân × Số hợp đồng',
      en: 'Long P&L = (Closing points − Opening points) × Multiplier × Number of contracts',
    },
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['lai lo', 'vi the long', 'vn30f', 'mua', 'pnl', 'long', 'phai sinh'],
    resultUnit: '₫',
    variables: [
      numberVar('entryPoints', { vi: 'Điểm mở vị thế', en: 'Opening points' }, 'điểm', 1_280, {
        min: 0,
        max: 10_000,
        description: {
          vi: 'Giá VN30F lúc mở vị thế mua.',
          en: 'VN30F price when the long position was opened.',
        },
      }),
      numberVar('exitPoints', { vi: 'Điểm đóng vị thế', en: 'Closing points' }, 'điểm', 1_288, {
        min: 0,
        max: 10_000,
        description: {
          vi: 'Giá VN30F lúc đóng vị thế, hoặc giá hiện tại nếu chưa đóng.',
          en: 'VN30F price when the position was closed, or the current price if still open.',
        },
      }),
      contracts,
    ],
    explanation: {
      meaning: {
        vi: 'Mỗi điểm chỉ số tăng lên đem về cho vị thế mua một khoản bằng hệ số nhân, nhân với số hợp đồng đang giữ.',
        en: 'Each point the index rises earns the long position an amount equal to the multiplier, times the number of contracts held.',
      },
      whenToUse: {
        vi: 'Khi ước tính nhanh lãi lỗ một vị thế mua đang mở, hoặc thử kịch bản chỉ số chạy tới một mốc điểm.',
        en: 'When quickly estimating the P&L of an open long position, or testing a scenario where the index reaches a given level.',
      },
      howToRead: {
        vi: 'Điểm đóng cao hơn điểm mở là lãi, thấp hơn là lỗ. Lãi lỗ được thanh toán bù trừ hằng ngày chứ không đợi tới lúc đóng vị thế.',
        en: 'Closing points above opening points means a profit, below means a loss. P&L is settled daily through mark-to-market, not just when the position is closed.',
      },
      commonMistakes: {
        vi: 'Quên rằng con số này chưa trừ phí giao dịch và thuế, và quên rằng lỗ chạm mức cảnh báo sẽ bị gọi ký quỹ bổ sung giữa chừng.',
        en: 'Forgetting that this figure has not deducted trading fees and taxes, and forgetting that a loss reaching the warning level triggers a margin call along the way.',
      },
    },
    example: {
      title: {
        vi: 'Mua 2 hợp đồng ở 1.280, đóng ở 1.288 điểm',
        en: 'Buy 2 contracts at 1,280, close at 1,288 points',
      },
      inputs: { entryPoints: 1_280, exitPoints: 1_288, contracts: 2 },
      expected: 1_600_000,
      note: {
        vi: '8 điểm × 100.000 ₫/điểm × 2 hợp đồng, chưa trừ phí và thuế.',
        en: '8 points × 100,000 VND/point × 2 contracts, before fees and taxes.',
      },
    },
    tests: [
      {
        name: 'chỉ số tăng 8 điểm thì Long lãi',
        inputs: { entryPoints: 1_280, exitPoints: 1_288, contracts: 2 },
        expected: 1_600_000,
      },
      {
        name: 'chỉ số giảm 8 điểm thì Long lỗ đúng bằng chừng đó',
        inputs: { entryPoints: 1_280, exitPoints: 1_272, contracts: 2 },
        expected: -1_600_000,
      },
      {
        name: 'không giữ hợp đồng nào thì không có lãi lỗ',
        inputs: { entryPoints: 1_280, exitPoints: 1_288, contracts: 0 },
        expected: 0,
      },
      {
        name: 'số hợp đồng âm không phải một vị thế mua',
        inputs: { entryPoints: 1_280, exitPoints: 1_288, contracts: -1 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    usesConstants: ['derivative.vn30f.multiplier'],
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v, ctx) => {
    const multiplier = constantOf(ctx, 'derivative.vn30f.multiplier');
    if (multiplier === undefined)
      return missingConstant('₫', {
        vi: 'hệ số nhân hợp đồng VN30F',
        en: 'the VN30F contract multiplier',
      });

    const n = v('contracts');
    if (n < 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          {
            vi: 'Số hợp đồng đang âm — vị thế mua không có số lượng âm.',
            en: 'Number of contracts is negative — a long position cannot have a negative quantity.',
          },
          {
            vi: 'Nhập số hợp đồng từ 0 trở lên; muốn tính chiều bán thì dùng công thức vị thế Short.',
            en: 'Enter a number of contracts of 0 or more; to calculate a sell position, use the Short position formula.',
          },
        ),
      };
    }

    const points = v('exitPoints') - v('entryPoints');
    return ok(points * multiplier.value * n, '₫', { extras: { pointsGained: points } });
  },
};

/*
 * ── 4. Lãi/lỗ vị thế Short ─────────────────────────────────────────────────────────────
 */

export const LAI_LO_VI_THE_SHORT: FormulaModule = {
  spec: {
    id: 'lai-lo-vi-the-short',
    categoryId: 'derivatives',
    name: { vi: 'Lãi/lỗ vị thế Short', en: 'Short futures position P&L' },
    description: {
      vi: 'Số tiền lãi hoặc lỗ của vị thế bán hợp đồng VN30F, quy ra đồng.',
      en: 'The profit or loss, in VND, of a short VN30F futures position.',
    },
    latex: 'PnL_{short} = (P_{mo} - P_{dong}) \\times m \\times N',
    expression: {
      vi: 'Lãi/lỗ Short = (Điểm mở vị thế − Điểm đóng vị thế) × Hệ số nhân × Số hợp đồng',
      en: 'Short P&L = (Opening points − Closing points) × Multiplier × Number of contracts',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['lai lo', 'vi the short', 'vn30f', 'ban', 'pnl', 'short', 'phai sinh'],
    resultUnit: '₫',
    variables: [
      numberVar('entryPoints', { vi: 'Điểm mở vị thế', en: 'Opening points' }, 'điểm', 1_280, {
        min: 0,
        max: 10_000,
        description: {
          vi: 'Giá VN30F lúc mở vị thế bán.',
          en: 'VN30F price when the short position was opened.',
        },
      }),
      numberVar('exitPoints', { vi: 'Điểm đóng vị thế', en: 'Closing points' }, 'điểm', 1_272, {
        min: 0,
        max: 10_000,
        description: {
          vi: 'Giá VN30F lúc đóng vị thế, hoặc giá hiện tại nếu chưa đóng.',
          en: 'VN30F price when the position was closed, or the current price if still open.',
        },
      }),
      contracts,
    ],
    explanation: {
      meaning: {
        vi: 'Vị thế bán kiếm lời khi chỉ số giảm: mỗi điểm giảm đem về một khoản bằng hệ số nhân, nhân với số hợp đồng.',
        en: 'A short position profits when the index falls: each point of decline earns an amount equal to the multiplier, times the number of contracts.',
      },
      whenToUse: {
        vi: 'Khi ước tính lãi lỗ một vị thế bán đang mở — cách kiếm lời lúc thị trường giảm mà chứng khoán cơ sở không làm được.',
        en: 'When estimating the P&L of an open short position — a way to profit from a falling market that owning the underlying stocks cannot do.',
      },
      howToRead: {
        vi: 'Điểm đóng thấp hơn điểm mở là lãi, cao hơn là lỗ — ngược chiều hoàn toàn với vị thế Long.',
        en: 'Closing points below opening points means a profit, above means a loss — exactly the opposite of a long position.',
      },
      commonMistakes: {
        vi: 'Nghĩ rằng lỗ của vị thế bán có giới hạn. Chỉ số tăng không có trần, nên lỗ của Short về lý thuyết không có đáy.',
        en: 'Assuming a short position has limited downside. The index has no ceiling on how high it can rise, so a Short position’s loss is theoretically unbounded.',
      },
    },
    example: {
      title: {
        vi: 'Bán 2 hợp đồng ở 1.280, đóng ở 1.272 điểm',
        en: 'Sell 2 contracts at 1,280, close at 1,272 points',
      },
      inputs: { entryPoints: 1_280, exitPoints: 1_272, contracts: 2 },
      expected: 1_600_000,
      note: {
        vi: '8 điểm giảm × 100.000 ₫/điểm × 2 hợp đồng, chưa trừ phí và thuế.',
        en: '8-point decline × 100,000 VND/point × 2 contracts, before fees and taxes.',
      },
    },
    tests: [
      {
        name: 'chỉ số giảm 8 điểm thì Short lãi',
        inputs: { entryPoints: 1_280, exitPoints: 1_272, contracts: 2 },
        expected: 1_600_000,
      },
      {
        name: 'chỉ số tăng 8 điểm thì Short lỗ đúng bằng chừng đó',
        inputs: { entryPoints: 1_280, exitPoints: 1_288, contracts: 2 },
        expected: -1_600_000,
      },
      {
        name: 'số hợp đồng âm không phải một vị thế bán',
        inputs: { entryPoints: 1_280, exitPoints: 1_272, contracts: -1 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    usesConstants: ['derivative.vn30f.multiplier'],
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v, ctx) => {
    const multiplier = constantOf(ctx, 'derivative.vn30f.multiplier');
    if (multiplier === undefined)
      return missingConstant('₫', {
        vi: 'hệ số nhân hợp đồng VN30F',
        en: 'the VN30F contract multiplier',
      });

    const n = v('contracts');
    if (n < 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          {
            vi: 'Số hợp đồng đang âm — vị thế bán không có số lượng âm.',
            en: 'Number of contracts is negative — a short position cannot have a negative quantity.',
          },
          {
            vi: 'Nhập số hợp đồng từ 0 trở lên; muốn tính chiều mua thì dùng công thức vị thế Long.',
            en: 'Enter a number of contracts of 0 or more; to calculate a buy position, use the Long position formula.',
          },
        ),
      };
    }

    const points = v('entryPoints') - v('exitPoints');
    return ok(points * multiplier.value * n, '₫', { extras: { pointsGained: points } });
  },
};

/*
 * ── 5. Số hợp đồng tối đa theo ký quỹ ban đầu ──────────────────────────────────────────
 */

export const SO_HOP_DONG_TOI_DA: FormulaModule = {
  spec: {
    id: 'so-hop-dong-toi-da',
    categoryId: 'derivatives',
    name: { vi: 'Số hợp đồng tối đa theo ký quỹ', en: 'Maximum contracts by initial margin' },
    description: {
      vi: 'Số hợp đồng VN30F nhiều nhất mở được với số tiền ký quỹ hiện có.',
      en: 'The maximum number of VN30F contracts that can be opened with the available margin.',
    },
    latex: 'N_{max} = \\left\\lfloor \\frac{V}{F \\times m \\times k} \\right\\rfloor',
    expression: {
      vi: 'Số hợp đồng tối đa = Vốn ký quỹ ÷ (Điểm hợp đồng × Hệ số nhân × Tỷ lệ ký quỹ ÷ 100), làm tròn xuống',
      en: 'Maximum contracts = Margin capital ÷ (Contract points × Multiplier × Margin ratio ÷ 100), rounded down',
    },
    /*
     * MỞ biểu đồ ở đợt kiểm kê — trước đó khai `'none'` theo luật chung "kết quả là hàm bậc nhất
     * của một đầu vào thì hình không nói gì". Luật ấy KHÔNG áp được ở đây: hàm làm tròn xuống của
     * `latex` biến đường quét thành BẬC THANG, không phải đoạn thẳng. Đo trên chính Registry: quét
     * vốn ký quỹ qua 41 mức cho y chạy 4→13 HĐ với bước chỉ nhận hai giá trị 0 và 1.
     *
     * Và bậc thang ấy nói đúng thứ người dùng cần: còn thiếu bao nhiêu tiền nữa thì lên được thêm
     * một hợp đồng — thông tin mà con số đơn lẻ ở khối Kết quả không mang được.
     */
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['ky quy', 'so hop dong', 'margin', 'vn30f', 'ky quy ban dau', 'phai sinh'],
    resultUnit: 'HĐ',
    variables: [
      numberVar('capital', { vi: 'Vốn ký quỹ', en: 'Margin capital' }, '₫', 200_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: {
          vi: 'Số tiền đã nộp vào tài khoản ký quỹ phái sinh.',
          en: 'Amount of money deposited into the derivatives margin account.',
        },
      }),
      futuresPoints,
      numberVar(
        'marginRatio',
        { vi: 'Tỷ lệ ký quỹ ban đầu', en: 'Initial margin ratio' },
        '%',
        17,
        {
          min: 0,
          max: 100,
          description: {
            vi: 'Do từng công ty chứng khoán quy định, thường quanh 17–25%. Kiểm tra mức áp dụng của công ty bạn.',
            en: 'Set by each securities company, typically around 17–25%. Check the rate that applies to your broker.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Mỗi hợp đồng đòi một khoản ký quỹ ban đầu bằng giá trị danh nghĩa nhân tỷ lệ ký quỹ; vốn chia cho khoản đó là số hợp đồng mở được.',
        en: 'Each contract requires initial margin equal to its notional value times the margin ratio; capital divided by that amount gives the number of contracts you can open.',
      },
      whenToUse: {
        vi: 'Trước khi đặt lệnh, để biết trần khối lượng mà tài khoản chịu được — rồi mới cân nhắc có nên đi tới trần hay không.',
        en: 'Before placing an order, to know the maximum size your account can support — then decide whether to actually trade up to that ceiling.',
      },
      howToRead: {
        vi: 'Kết quả làm tròn xuống số nguyên; ra 0 nghĩa là vốn chưa đủ ký quỹ cho dù chỉ một hợp đồng. Mở kín trần thì một nhịp ngược nhỏ đã bị gọi ký quỹ.',
        en: 'The result is rounded down to a whole number; a result of 0 means the capital is not even enough to margin a single contract. Opening right up to the ceiling means even a small adverse move triggers a margin call.',
      },
      commonMistakes: {
        vi: 'Coi số tối đa là số nên mở. Trần này chỉ nói tài khoản đủ tiền ký quỹ, không nói gì về mức rủi ro hợp lý — cỡ vị thế nên tính theo % rủi ro.',
        en: 'Treating the maximum as the number you should open. This ceiling only says the account has enough margin — it says nothing about a sensible risk level; position size should be based on % risk instead.',
      },
    },
    example: {
      title: {
        vi: 'Vốn 200 triệu ₫, VN30F ở 1.280 điểm, ký quỹ 17%',
        en: '200 million VND capital, VN30F at 1,280 points, 17% margin',
      },
      inputs: { capital: 200_000_000, futuresPoints: 1_280, marginRatio: 17 },
      expected: 9,
      note: {
        vi: 'Mỗi hợp đồng cần ký quỹ 21,76 triệu ₫; 200 ÷ 21,76 = 9,19 → làm tròn xuống 9.',
        en: 'Each contract requires 21.76 million VND in margin; 200 ÷ 21.76 = 9.19 → rounded down to 9.',
      },
    },
    tests: [
      {
        name: 'vốn 200 triệu mở được 9 hợp đồng ở mức ký quỹ 17%',
        inputs: { capital: 200_000_000, futuresPoints: 1_280, marginRatio: 17 },
        expected: 9,
      },
      {
        name: 'vốn chưa đủ ký quỹ một hợp đồng thì kết quả là 0',
        inputs: { capital: 20_000_000, futuresPoints: 1_280, marginRatio: 17 },
        expected: 0,
      },
      {
        name: 'điểm hợp đồng bằng 0 thì không chia được',
        inputs: { capital: 200_000_000, futuresPoints: 0, marginRatio: 17 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'tỷ lệ ký quỹ bằng 0 thì không chia được',
        inputs: { capital: 200_000_000, futuresPoints: 1_280, marginRatio: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    usesConstants: ['derivative.vn30f.multiplier'],
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v, ctx) => {
    const multiplier = constantOf(ctx, 'derivative.vn30f.multiplier');
    if (multiplier === undefined)
      return missingConstant('HĐ', {
        vi: 'hệ số nhân hợp đồng VN30F',
        en: 'the VN30F contract multiplier',
      });

    const points = v('futuresPoints');
    if (points === 0) {
      return {
        value: null,
        unit: 'HĐ',
        warning: divideByZero(
          { vi: 'số hợp đồng tối đa', en: 'the maximum number of contracts' },
          { vi: 'Điểm hợp đồng', en: 'Contract points' },
          {
            vi: 'Nhập giá VN30F đang giao dịch trên bảng điện.',
            en: 'Enter the current VN30F trading price from the board.',
          },
        ),
      };
    }

    const ratio = v('marginRatio');
    if (ratio === 0) {
      return {
        value: null,
        unit: 'HĐ',
        warning: divideByZero(
          { vi: 'số hợp đồng tối đa', en: 'the maximum number of contracts' },
          { vi: 'Tỷ lệ ký quỹ ban đầu', en: 'Initial margin ratio' },
          {
            vi: 'Nhập tỷ lệ ký quỹ theo quy định của công ty chứng khoán, thường quanh 17%.',
            en: 'Enter the margin ratio set by your securities company, typically around 17%.',
          },
        ),
      };
    }

    const marginPerContract = points * multiplier.value * (ratio / 100);
    return ok(Math.floor(v('capital') / marginPerContract), 'HĐ', {
      extras: { marginPerContract },
    });
  },
};

/*
 * ── 6. Cỡ vị thế phái sinh theo % rủi ro ───────────────────────────────────────────────
 * Anh em với 'co-lenh-rui-ro' bên nhóm cổ phiếu, nhưng khoảng cách cắt lỗ tính bằng điểm
 * chỉ số và mỗi điểm quy ra tiền qua hệ số nhân.
 */

export const CO_VI_THE_PHAI_SINH: FormulaModule = {
  spec: {
    id: 'co-vi-the-phai-sinh',
    categoryId: 'derivatives',
    name: { vi: 'Cỡ vị thế phái sinh theo % rủi ro', en: 'Risk-based futures position size' },
    description: {
      vi: 'Số hợp đồng được phép mở để một lệnh chạm cắt lỗ không mất quá mức rủi ro đã định.',
      en: 'The number of contracts that can be opened so that a stop-loss hit does not lose more than the defined risk.',
    },
    latex: 'N = \\left\\lfloor \\frac{V \\times r}{\\Delta P \\times m} \\right\\rfloor',
    expression: {
      vi: 'Số hợp đồng = Vốn × Rủi ro mỗi lệnh ÷ 100 ÷ (Khoảng cách cắt lỗ × Hệ số nhân), làm tròn xuống',
      en: 'Number of contracts = Capital × Risk per trade ÷ 100 ÷ (Stop-loss distance × Multiplier), rounded down',
    },
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['co vi the', 'position size', 'quan tri rui ro', 'cat lo', 'vn30f', 'phai sinh'],
    resultUnit: 'HĐ',
    variables: [
      numberVar(
        'capital',
        { vi: 'Vốn tài khoản phái sinh', en: 'Derivatives account capital' },
        '₫',
        500_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Tổng vốn đang dành cho giao dịch phái sinh.',
            en: 'Total capital allocated for derivatives trading.',
          },
        },
      ),
      sliderVar(
        'riskPercent',
        { vi: 'Rủi ro mỗi lệnh', en: 'Risk per trade' },
        '%',
        2,
        0.1,
        10,
        0.1,
        {
          description: {
            vi: 'Phần trăm vốn chấp nhận mất nếu lệnh này chạm cắt lỗ.',
            en: 'Percentage of capital you are willing to lose if this trade hits its stop-loss.',
          },
        },
      ),
      numberVar('stopPoints', { vi: 'Khoảng cách cắt lỗ', en: 'Stop-loss distance' }, 'điểm', 15, {
        min: 0,
        max: 200,
        description: {
          vi: 'Số điểm chênh giữa điểm vào lệnh và điểm cắt lỗ — dùng được cho cả vị thế Long và Short.',
          en: 'The point gap between the entry level and the stop-loss level — applies to both Long and Short positions.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Khối lượng lớn nhất được phép mở sao cho nếu giá chạm cắt lỗ, khoản mất không vượt mức rủi ro đã định trước.',
        en: 'The largest position size you can open such that, if price hits the stop-loss, the loss does not exceed the predefined risk level.',
      },
      whenToUse: {
        vi: 'Trước mỗi lệnh phái sinh — đòn bẩy cao khiến vào lệnh quá tay là lỗi đắt nhất của người mới.',
        en: 'Before every derivatives trade — high leverage makes oversizing a position the most costly mistake beginners make.',
      },
      howToRead: {
        vi: 'Kết quả làm tròn xuống số nguyên hợp đồng, nên rủi ro thực luôn nhỏ hơn hoặc bằng mức đã định. Ra 0 nghĩa là mức cắt lỗ này quá rộng cho số vốn hiện có.',
        en: 'The result is rounded down to a whole number of contracts, so the actual risk is always less than or equal to the defined level. A result of 0 means this stop-loss distance is too wide for the available capital.',
      },
      commonMistakes: {
        vi: 'Mở theo số hợp đồng tối đa mà ký quỹ cho phép rồi mới nghĩ tới cắt lỗ. Thứ tự đúng là chọn điểm cắt lỗ trước, số hợp đồng suy ra sau.',
        en: 'Opening the maximum number of contracts margin allows and only then thinking about a stop-loss. The correct order is to choose the stop-loss level first and derive the position size afterward.',
      },
    },
    example: {
      title: {
        vi: 'Vốn 500 triệu ₫, rủi ro 2%, cắt lỗ cách 15 điểm',
        en: '500 million VND capital, 2% risk, 15-point stop-loss distance',
      },
      inputs: { capital: 500_000_000, riskPercent: 2, stopPoints: 15 },
      expected: 6,
      note: {
        vi: 'Mức chịu lỗ 10 triệu ₫; mỗi hợp đồng rủi ro 1,5 triệu ₫ → 6 hợp đồng.',
        en: 'Acceptable loss of 10 million VND; each contract risks 1.5 million VND → 6 contracts.',
      },
    },
    tests: [
      {
        name: 'rủi ro 2% với cắt lỗ 15 điểm cho 6 hợp đồng',
        inputs: { capital: 500_000_000, riskPercent: 2, stopPoints: 15 },
        expected: 6,
      },
      {
        name: 'rủi ro chặt hơn và cắt lỗ rộng hơn thì được mở ít hơn',
        inputs: { capital: 500_000_000, riskPercent: 1, stopPoints: 20 },
        expected: 2,
      },
      {
        name: 'cắt lỗ đặt trùng điểm vào thì không có cỡ vị thế nào an toàn',
        inputs: { capital: 500_000_000, riskPercent: 2, stopPoints: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'khoảng cách cắt lỗ âm là nhập sai',
        inputs: { capital: 500_000_000, riskPercent: 2, stopPoints: -5 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    usesConstants: ['derivative.vn30f.multiplier'],
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v, ctx) => {
    const multiplier = constantOf(ctx, 'derivative.vn30f.multiplier');
    if (multiplier === undefined)
      return missingConstant('HĐ', {
        vi: 'hệ số nhân hợp đồng VN30F',
        en: 'the VN30F contract multiplier',
      });

    const stopPoints = v('stopPoints');
    if (stopPoints === 0) {
      return {
        value: null,
        unit: 'HĐ',
        warning: divideByZero(
          { vi: 'cỡ vị thế', en: 'the position size' },
          { vi: 'Khoảng cách cắt lỗ', en: 'Stop-loss distance' },
          {
            vi: 'Đặt điểm cắt lỗ cách điểm vào lệnh ít nhất 1 điểm.',
            en: 'Set the stop-loss at least 1 point away from the entry level.',
          },
        ),
      };
    }

    if (stopPoints < 0) {
      return {
        value: null,
        unit: 'HĐ',
        warning: meaningless(
          {
            vi: 'Khoảng cách cắt lỗ đang âm — khoảng cách là số điểm chênh nên luôn dương.',
            en: 'Stop-loss distance is negative — a distance is a point gap, so it must always be positive.',
          },
          {
            vi: 'Nhập số điểm chênh giữa điểm vào lệnh và điểm cắt lỗ, không phân biệt chiều Long hay Short.',
            en: 'Enter the point gap between the entry level and the stop-loss level, regardless of Long or Short direction.',
          },
        ),
      };
    }

    const riskAmount = v('capital') * (v('riskPercent') / 100);
    const riskPerContract = stopPoints * multiplier.value;
    return ok(Math.floor(riskAmount / riskPerContract), 'HĐ', {
      extras: { riskAmount, riskPerContract },
    });
  },
};

/*
 * ── 7. Tỷ lệ đòn bẩy hiệu dụng ─────────────────────────────────────────────────────────
 */

export const DON_BAY_HIEU_DUNG: FormulaModule = {
  spec: {
    id: 'don-bay-hieu-dung',
    categoryId: 'derivatives',
    name: { vi: 'Tỷ lệ đòn bẩy hiệu dụng', en: 'Effective leverage ratio' },
    description: {
      vi: 'Giá trị danh nghĩa của vị thế đang gấp bao nhiêu lần vốn thực có trong tài khoản.',
      en: 'How many times the notional value of the position is relative to the actual equity in the account.',
    },
    latex: 'L = \\frac{F \\times m \\times N}{E}',
    expression: {
      vi: 'Đòn bẩy hiệu dụng = Điểm hợp đồng × Hệ số nhân × Số hợp đồng ÷ Vốn thực có',
      en: 'Effective leverage = Contract points × Multiplier × Number of contracts ÷ Actual equity',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['don bay', 'leverage', 'vn30f', 'gia tri danh nghia', 'notional', 'phai sinh'],
    resultUnit: 'lần',
    variables: [
      futuresPoints,
      contracts,
      numberVar(
        'equity',
        { vi: 'Vốn thực có trong tài khoản', en: 'Actual equity in the account' },
        '₫',
        30_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Tiền ký quỹ cộng lãi lỗ đã bù trừ — giá trị ròng của tài khoản phái sinh.',
            en: 'Margin deposit plus settled P&L — the net value of the derivatives account.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Mức khuếch đại thật của tài khoản: đòn bẩy 5 lần nghĩa là chỉ số nhúc nhích 1% thì vốn của bạn biến động khoảng 5%.',
        en: 'The true amplification of the account: 5x leverage means a 1% move in the index moves your equity by roughly 5%.',
      },
      whenToUse: {
        vi: 'Sau khi mở vị thế, hoặc khi lãi lỗ bù trừ hằng ngày làm vốn thực co giãn — đòn bẩy trượt theo từng phiên chứ không đứng yên.',
        en: 'After opening a position, or whenever daily mark-to-market P&L changes the actual equity — leverage shifts session by session, it does not stay fixed.',
      },
      howToRead: {
        vi: 'Con số càng cao thì biên an toàn trước một lệnh gọi ký quỹ càng mỏng. Vốn thực giảm vì thua lỗ sẽ tự đẩy đòn bẩy lên mà không cần mở thêm hợp đồng nào.',
        en: 'The higher the number, the thinner the safety margin before a margin call. Equity shrinking from losses pushes leverage up on its own, without opening any new contracts.',
      },
      commonMistakes: {
        vi: 'Nghĩ nghịch đảo tỷ lệ ký quỹ là đòn bẩy cố định của mọi lệnh. Đó chỉ là mức TRẦN — mức cao nhất được phép khi nộp đúng ký quỹ tối thiểu; nộp ký quỹ dày hơn thì đòn bẩy thực đã thấp hơn ngay từ lúc vào lệnh, còn thua lỗ theo thời gian lại tự đẩy đòn bẩy thực lên cao hơn con số ban đầu.',
        en: 'Assuming the inverse of the margin ratio is the fixed leverage for every trade. That is only the CEILING — the maximum allowed when depositing exactly the minimum margin; depositing more margin means the actual leverage is already lower from the start, while losses over time push actual leverage above the initial figure on their own.',
      },
    },
    example: {
      title: {
        vi: '1 hợp đồng ở 1.280 điểm, vốn thực có 30 triệu ₫',
        en: '1 contract at 1,280 points, 30 million VND actual equity',
      },
      inputs: { futuresPoints: 1_280, contracts: 1, equity: 30_000_000 },
      expected: 4.27,
      note: {
        vi: 'Giá trị danh nghĩa 128 triệu ₫ trên 30 triệu ₫ vốn — chỉ số giảm 1% là vốn hụt hơn 4%.',
        en: 'Notional value of 128 million VND against 30 million VND equity — a 1% drop in the index shaves off more than 4% of equity.',
      },
    },
    tests: [
      {
        name: '1 hợp đồng trên 30 triệu ₫ vốn cho đòn bẩy khoảng 4,27 lần',
        inputs: { futuresPoints: 1_280, contracts: 1, equity: 30_000_000 },
        expected: 4.27,
      },
      {
        name: 'vốn mỏng đi thì đòn bẩy tự cao lên',
        inputs: { futuresPoints: 1_280, contracts: 1, equity: 25_600_000 },
        expected: 5,
      },
      {
        name: 'vốn thực bằng 0 thì không có gì để đo đòn bẩy',
        inputs: { futuresPoints: 1_280, contracts: 1, equity: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'chưa mở hợp đồng nào thì chưa có đòn bẩy',
        inputs: { futuresPoints: 1_280, contracts: 0, equity: 30_000_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    usesConstants: ['derivative.vn30f.multiplier'],
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v, ctx) => {
    const multiplier = constantOf(ctx, 'derivative.vn30f.multiplier');
    if (multiplier === undefined)
      return missingConstant('lần', {
        vi: 'hệ số nhân hợp đồng VN30F',
        en: 'the VN30F contract multiplier',
      });

    const n = v('contracts');
    if (n <= 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          {
            vi: 'Chưa có hợp đồng nào đang mở nên chưa có đòn bẩy để đo.',
            en: 'No contracts are open yet, so there is no leverage to measure.',
          },
          {
            vi: 'Nhập số hợp đồng từ 1 trở lên.',
            en: 'Enter a number of contracts of 1 or more.',
          },
        ),
      };
    }

    const equity = v('equity');
    if (equity === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          { vi: 'đòn bẩy hiệu dụng', en: 'effective leverage' },
          { vi: 'Vốn thực có', en: 'Actual equity' },
          {
            vi: 'Nhập giá trị ròng hiện tại của tài khoản phái sinh.',
            en: 'Enter the current net value of the derivatives account.',
          },
        ),
      };
    }

    const notional = v('futuresPoints') * multiplier.value * n;
    return ok(notional / equity, 'lần', { extras: { notionalValue: notional } });
  },
};

/** Bảy công thức phái sinh quanh hợp đồng tương lai VN30F. */
export const DERIVATIVE_FORMULAS: ReadonlyArray<FormulaModule> = [
  GIA_LY_THUYET_VN30F,
  BASIS_VN30F,
  LAI_LO_VI_THE_LONG,
  LAI_LO_VI_THE_SHORT,
  SO_HOP_DONG_TOI_DA,
  CO_VI_THE_PHAI_SINH,
  DON_BAY_HIEU_DUNG,
];
