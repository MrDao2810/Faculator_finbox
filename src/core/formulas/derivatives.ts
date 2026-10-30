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
import { lamTronXuong } from '../lam-tron';
import type { FormulaSource } from '../registry/types';
import { divideByZero, meaningless } from '../warnings';
import { constantOf, missingConstant, numberVar, sliderVar, withSymbol } from './shared';

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
      vi: 'Giá lý thuyết = Chỉ số cơ sở × [1 + (Lãi suất phi rủi ro − Tỷ suất cổ tức) × Số ngày đến đáo hạn ÷ 365]',
      en: 'Theoretical price = Underlying index × [1 + (Risk-free rate − Dividend yield) × Days to expiry ÷ 365]',
    },
    substitutionDerived: { r: '{riskFreeRate} ÷ 100', q: '{dividendYield} ÷ 100' },
    substitution: '{indexValue} × (1 + ({r} − {q}) × {days} ÷ 365)',
    symbols: [
      {
        latex: 'F',
        meaning: {
          vi: 'giá lý thuyết của hợp đồng tương lai, điểm',
          en: 'theoretical futures price, in index points',
        },
      },
      {
        latex: 'S',
        meaning: {
          vi: 'chỉ số VN30 hiện tại, là chỉ số cơ sở, điểm',
          en: 'current VN30 index, the underlying, in points',
        },
      },
      {
        latex: 'r',
        meaning: {
          vi: 'lãi suất phi rủi ro một năm, dạng thập phân, tức 1% là 0,01',
          en: 'risk-free rate per year, as a decimal, so 1% is 0.01',
        },
      },
      {
        latex: 'q',
        meaning: {
          vi: 'tỷ suất cổ tức của rổ VN30 một năm, dạng thập phân, tức 1% là 0,01',
          en: 'dividend yield of the VN30 basket per year, as a decimal, so 1% is 0.01',
        },
      },
      {
        latex: 'd',
        meaning: { vi: 'số ngày từ hôm nay tới ngày đáo hạn', en: 'days from today to expiry' },
      },
      {
        latex: '365',
        meaning: {
          vi: 'số ngày một năm, quy lãi suất năm về d ngày nắm giữ',
          en: 'days in a year, scaling the annual rate to d days of holding',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['vn30f', 'gia ly thuyet', 'hop dong tuong lai', 'cost of carry', 'futures', 'phai sinh'],
    resultUnit: 'điểm',
    variables: [
      withSymbol(indexValue, 'S'),
      sliderVar(
        'riskFreeRate',
        { vi: 'Lãi suất phi rủi ro / năm (r)', en: 'Risk-free rate / year (r)' },
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
        { vi: 'Tỷ suất cổ tức rổ VN30 / năm (q)', en: 'VN30 basket dividend yield / year (q)' },
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
      numberVar('days', { vi: 'Số ngày đến đáo hạn (d)', en: 'Days to expiry (d)' }, 'ngày', 30, {
        min: 0,
        max: 365,
        description: {
          vi: 'Đếm từ hôm nay tới ngày đáo hạn của hợp đồng — thứ Năm thứ ba trong tháng đáo hạn.',
          en: 'Counted from today to the contract expiry date — the third Thursday of the expiry month.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Nếu vay tiền mua cả rổ VN30 rồi giữ tới ngày đáo hạn, chi phí vốn trừ đi cổ tức nhận được chính là phần chênh hợp lý giữa giá hợp đồng và chỉ số.',
        en: 'If you borrowed money to buy the entire VN30 basket and held it to expiry, the cost of capital minus the dividends received is exactly the fair gap between the contract price and the index.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn sắp giao dịch VN30F và muốn biết giá hợp đồng lẽ ra nên ở quanh mức nào khi tính cả lãi suất, cổ tức và số ngày còn tới đáo hạn, để đặt cạnh giá đang khớp.',
        en: 'Use it when you are about to trade VN30F and want to know what price, in points, the contract ought to sit near once interest rates, dividends and the days left to expiry are counted, to set beside the matched price.',
      },
      howToRead: {
        vi: 'So với giá VN30F đang khớp trên bảng điện: giá khớp cao hơn con số này nghĩa là người giao dịch đang trả thêm vì kỳ vọng chỉ số tăng, thấp hơn là thị trường đang bi quan hơn mức hợp lý.',
        en: 'Compared with the VN30F price currently matched on the board: a matched price above this figure means traders are paying extra because they expect the index to rise, and one below it means the market is gloomier than the fair level.',
      },
      commonMistakes: {
        vi: 'So giá hợp đồng với chỉ số hiện tại rồi kết luận đắt rẻ ngay — phần chênh do lãi suất và cổ tức là bình thường, không phải định giá sai.',
        en: 'Comparing the contract price to the current index and immediately calling it overpriced or underpriced — the gap from interest rates and dividends is normal, not mispricing.',
      },
    },
    example: {
      title: {
        vi: 'VN30F1M phiên 14/09/2026, ba ngày trước khi hợp đồng tháng 9 đáo hạn',
        en: 'VN30F1M in the 2026-09-14 session, three days before the September contract expires',
      },
      inputs: { indexValue: 1_928.57, riskFreeRate: 4.57, dividendYield: 1.8, days: 3 },
      expected: 1_929.01,
      note: {
        vi: 'So với giá VN30F1M khớp cuối phiên cùng ngày là 1.930,9 điểm: giá lý thuyết 1.929,01 điểm thấp hơn 1,89 điểm, tức người mua hôm ấy đã trả thêm ngần ấy vì kỳ vọng chỉ số tăng. Còn 3 ngày là đáo hạn nên tỷ suất cổ tức, vốn là số ước lượng, về 0 hay gấp đôi cũng chỉ đổi kết quả 0,29 điểm.',
        en: 'Compared with the VN30F1M closing trade of 1,930.9 points that same session: the theoretical price of 1,929.01 points is 1.89 points lower, so buyers that day paid that much extra because they expected the index to rise. With 3 days left to expiry, setting the dividend yield, which is only an estimate, to 0 or doubling it moves the result by only 0.29 points.',
      },
      source: {
        vi: 'Vietstock, bản tin chứng khoán phái sinh ngày 15/09/2026; VN30 đóng cửa phiên 14/09/2026. Tỷ suất cổ tức rổ VN30 là ước lượng.',
        en: 'Vietstock, derivatives market bulletin dated 2026-09-15; VN30 close of the 2026-09-14 session. The VN30 basket dividend yield is an estimate.',
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
    substitution: '{futuresPoints} − {indexValue}',
    symbols: [
      {
        latex: 'Basis',
        meaning: {
          vi: 'chênh giá hợp đồng so với chỉ số cơ sở, điểm',
          en: 'gap between the contract price and the underlying index, in points',
        },
      },
      {
        latex: 'F',
        meaning: {
          vi: 'giá hợp đồng tương lai đang khớp, điểm',
          en: 'current matched futures contract price, in points',
        },
      },
      {
        latex: 'S',
        meaning: { vi: 'chỉ số VN30 hiện tại, điểm', en: 'current VN30 index, in points' },
      },
    ],
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
        { vi: 'Giá hợp đồng tương lai (F)', en: 'Futures contract price (F)' },
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
      withSymbol(indexValue, 'S'),
    ],
    explanation: {
      meaning: {
        vi: 'Chênh lệch giữa giá hợp đồng tương lai và chỉ số cơ sở: basis dương là hợp đồng đang được trả giá cao hơn chỉ số, basis âm là thấp hơn.',
        en: 'The difference between the futures price and the underlying index: a positive basis means the contract is priced above the index, a negative basis means below.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn nhìn bảng giá thấy VN30F đang khớp cao hơn hoặc thấp hơn chỉ số VN30 và muốn biết chính xác đang chênh bao nhiêu điểm, trước khi vào lệnh.',
        en: 'Use it when you see VN30F trading above or below the VN30 index on the board and want to know exactly how many points apart they are before you place an order.',
      },
      howToRead: {
        vi: 'So với khoảng chênh hợp lý, tức giá lý thuyết hợp đồng tương lai trừ chỉ số VN30 cùng lúc: basis lớn hơn nghĩa là hợp đồng đang được trả thêm vì lạc quan, nhỏ hơn hoặc âm sâu nghĩa là thị trường đang bi quan về chỉ số.',
        en: 'Compared with the fair gap, the theoretical futures price minus the VN30 index at the same moment: a larger basis means buyers are paying extra out of optimism, and a smaller or deeply negative one means the market is pessimistic about the index.',
      },
      commonMistakes: {
        vi: 'Quên rằng một phần basis là chi phí nắm giữ hợp lý (lãi suất trừ cổ tức) — không phải cứ basis dương là thị trường hưng phấn.',
        en: 'Forgetting that part of the basis is the fair cost of carry (interest minus dividends) — a positive basis does not automatically mean the market is euphoric.',
      },
    },
    example: {
      title: {
        vi: 'VN30F1M so với chỉ số VN30, phiên 14/09/2026',
        en: 'VN30F1M against the VN30 index, the 2026-09-14 session',
      },
      inputs: { futuresPoints: 1_930.9, indexValue: 1_928.57 },
      expected: 2.33,
      note: {
        vi: 'So với khoảng chênh hợp lý chỉ 0,44 điểm, tức giá lý thuyết 1.929,01 điểm của hợp đồng trừ chỉ số VN30 1.928,57 điểm: basis 2,33 điểm cao hơn 1,89 điểm, tức người mua VN30F1M phiên ấy trả thêm vì lạc quan về chỉ số. Chênh hợp lý nhỏ vì hợp đồng chỉ còn 3 ngày là đáo hạn.',
        en: "Compared with a fair gap of only 0.44 points, the contract's theoretical price of 1,929.01 points minus the VN30 index at 1,928.57 points: the basis of 2.33 points is 1.89 points higher, so VN30F1M buyers that session paid extra out of optimism about the index. The fair gap is small because the contract had only 3 days left to expiry.",
      },
      source: {
        vi: 'Entrade, bản tin phái sinh ngày 15/09/2026, nơi mức basis 2,33 điểm được công bố độc lập; VN30 đóng cửa phiên 14/09/2026.',
        en: 'Entrade, derivatives bulletin dated 2026-09-15, which reports the 2.33-point basis independently; VN30 close of the 2026-09-14 session.',
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
    /*
     * `{derivative.vn30f.multiplier}` là KHOÁ hằng số chứ không phải một ô nhập: màn tra hệ số nhân
     * theo biểu phí đang chọn rồi đặt vào hình. Năm mẫu của file này đều viết theo lối ấy, và không
     * mẫu nào được chép con số 100.000 vào — lý do ở `FormulaSpec.substitution`.
     */
    substitution: '({exitPoints} − {entryPoints}) × {derivative.vn30f.multiplier} × {contracts}',
    symbols: [
      {
        latex: 'PnL_{long}',
        meaning: {
          vi: 'lãi/lỗ của vị thế Long (vị thế mua), ₫',
          en: 'profit or loss of the long position, ₫',
        },
      },
      {
        latex: 'P_{dong}',
        meaning: {
          vi: 'điểm đóng vị thế, hoặc giá hiện tại nếu chưa đóng, điểm',
          en: 'closing points, or the current price if still open',
        },
      },
      {
        latex: 'P_{mo}',
        meaning: { vi: 'điểm mở vị thế, điểm', en: 'opening points' },
      },
      {
        latex: 'm',
        meaning: {
          vi: 'hệ số nhân của hợp đồng VN30F, ₫ mỗi điểm',
          en: 'VN30F contract multiplier, ₫ per point',
        },
      },
      {
        latex: 'N',
        meaning: { vi: 'số hợp đồng đang giữ, HĐ', en: 'number of contracts held' },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['lai lo', 'vi the long', 'vn30f', 'mua', 'pnl', 'long', 'phai sinh'],
    resultUnit: '₫',
    variables: [
      numberVar(
        'entryPoints',
        { vi: 'Điểm mở vị thế (Pmo)', en: 'Opening points (Pmo)' },
        'điểm',
        1_280,
        {
          min: 0,
          max: 10_000,
          description: {
            vi: 'Giá VN30F lúc mở vị thế mua.',
            en: 'VN30F price when the long position was opened.',
          },
        },
      ),
      numberVar(
        'exitPoints',
        { vi: 'Điểm đóng vị thế (Pdong)', en: 'Closing points (Pdong)' },
        'điểm',
        1_288,
        {
          min: 0,
          max: 10_000,
          description: {
            vi: 'Giá VN30F lúc đóng vị thế, hoặc giá hiện tại nếu chưa đóng.',
            en: 'VN30F price when the position was closed, or the current price if still open.',
          },
        },
      ),
      withSymbol(contracts, 'N'),
    ],
    explanation: {
      meaning: {
        vi: 'Mỗi điểm giá hợp đồng tăng lên đem về cho vị thế mua một khoản bằng hệ số nhân, nhân với số hợp đồng đang giữ.',
        en: 'Each point the contract price rises earns the long position an amount equal to the multiplier, times the number of contracts held.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn đã mở vị thế mua hợp đồng VN30F chờ thị trường tăng và muốn biết nếu giá hợp đồng chạy tới một mức điểm nào đó rồi đóng lệnh thì lãi hay lỗ bao nhiêu tiền.',
        en: 'Use it when you have opened a long VN30F position expecting the market to rise and want to know how much money you make or lose if you close it once the contract reaches a given level.',
      },
      howToRead: {
        vi: 'So với số tiền lãi bạn nhắm tới khi mở vị thế: lớn hơn nghĩa là đóng ở mức điểm ấy đã vượt mục tiêu, nhỏ hơn là chưa tới. Số âm là khoản lỗ, xảy ra khi điểm đóng thấp hơn điểm mở.',
        en: 'Compared with the profit you were aiming for when you opened the position: larger means closing at that level already beats your target, smaller means it falls short. A negative figure is a loss, which happens when the closing level is below the opening level.',
      },
      commonMistakes: {
        vi: 'Quên rằng con số này chưa trừ phí giao dịch và thuế, và quên rằng lỗ chạm mức cảnh báo sẽ bị gọi ký quỹ bổ sung giữa chừng.',
        en: 'Forgetting that this figure has not deducted trading fees and taxes, and forgetting that a loss reaching the warning level triggers a margin call along the way.',
      },
    },
    example: {
      title: {
        vi: 'VN30F2005 — vị thế Long mở trong đợt ATC phiên đáo hạn bất thường 21/05/2020',
        en: 'VN30F2005 — a long opened in the ATC auction of the unusual 2020-05-21 expiry session',
      },
      inputs: { entryPoints: 864, exitPoints: 815.55, contracts: 1 },
      expected: -4_845_000,
      note: {
        vi: 'So với mốc 0 đồng: kết quả âm là lỗ, ở đây lỗ 4.845.000 ₫ trên một hợp đồng mua ở 864 điểm rồi thanh toán ở 815,55 điểm. Khoản lỗ không do chỉ số giảm mà do giá khớp 864 điểm cao hơn chỉ số VN30 cùng lúc 48,45 điểm, còn ngày đáo hạn hợp đồng thanh toán đúng bằng chỉ số.',
        en: 'Compared with the 0 ₫ mark: a negative result is a loss, here 4,845,000 ₫ on one contract bought at 864 points and settled at 815.55 points. The loss did not come from the index falling but from the 864-point fill sitting 48.45 points above the VN30 index at the same moment, while on expiry day the contract settles at exactly the index.',
      },
      source: {
        vi: 'VnExpress, bài tường thuật phiên giao dịch phái sinh bất thường ngày 21/05/2020.',
        en: 'VnExpress, its report on the unusual derivatives session of 2020-05-21.',
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
    substitution: '({entryPoints} − {exitPoints}) × {derivative.vn30f.multiplier} × {contracts}',
    symbols: [
      {
        latex: 'PnL_{short}',
        meaning: {
          vi: 'lãi/lỗ của vị thế Short (vị thế bán), ₫',
          en: 'profit or loss of the short position, ₫',
        },
      },
      {
        latex: 'P_{mo}',
        meaning: { vi: 'điểm mở vị thế, điểm', en: 'opening points' },
      },
      {
        latex: 'P_{dong}',
        meaning: {
          vi: 'điểm đóng vị thế, hoặc giá hiện tại nếu chưa đóng, điểm',
          en: 'closing points, or the current price if still open',
        },
      },
      {
        latex: 'm',
        meaning: {
          vi: 'hệ số nhân của hợp đồng VN30F, ₫ mỗi điểm',
          en: 'VN30F contract multiplier, ₫ per point',
        },
      },
      {
        latex: 'N',
        meaning: { vi: 'số hợp đồng đang giữ, HĐ', en: 'number of contracts held' },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['lai lo', 'vi the short', 'vn30f', 'ban', 'pnl', 'short', 'phai sinh'],
    resultUnit: '₫',
    variables: [
      numberVar(
        'entryPoints',
        { vi: 'Điểm mở vị thế (Pmo)', en: 'Opening points (Pmo)' },
        'điểm',
        1_280,
        {
          min: 0,
          max: 10_000,
          description: {
            vi: 'Giá VN30F lúc mở vị thế bán.',
            en: 'VN30F price when the short position was opened.',
          },
        },
      ),
      numberVar(
        'exitPoints',
        { vi: 'Điểm đóng vị thế (Pdong)', en: 'Closing points (Pdong)' },
        'điểm',
        1_272,
        {
          min: 0,
          max: 10_000,
          description: {
            vi: 'Giá VN30F lúc đóng vị thế, hoặc giá hiện tại nếu chưa đóng.',
            en: 'VN30F price when the position was closed, or the current price if still open.',
          },
        },
      ),
      withSymbol(contracts, 'N'),
    ],
    explanation: {
      meaning: {
        vi: 'Vị thế bán kiếm lời khi giá hợp đồng giảm: mỗi điểm giảm đem về một khoản bằng hệ số nhân, nhân với số hợp đồng.',
        en: 'A short position profits when the contract price falls: each point of decline earns an amount equal to the multiplier, times the number of contracts.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn đã mở vị thế bán hợp đồng VN30F chờ thị trường giảm và muốn biết nếu đóng lệnh ở một mức điểm nào đó, cao hay thấp hơn lúc mở, thì lãi hay lỗ bao nhiêu tiền.',
        en: 'Use it when you have opened a short VN30F position expecting the market to fall and want to know how much money you make or lose if you close it at a given level, whether above or below where you opened.',
      },
      howToRead: {
        vi: 'So với số tiền bạn chấp nhận mất cho vị thế này: khoản lỗ lớn hơn nghĩa là đóng ở mức điểm ấy bạn đã mất quá sức chịu, nhỏ hơn là còn trong mức đã định. Kết quả dương là lãi, có được khi điểm đóng thấp hơn điểm mở.',
        en: 'Compared with the amount you accept losing on this position: a loss larger than that means closing at that level costs more than you can bear, a smaller one keeps it within your limit. A positive result is a profit, earned when the closing level is below the opening level.',
      },
      commonMistakes: {
        vi: 'Nghĩ rằng lỗ của vị thế bán có giới hạn. Chỉ số tăng không có trần, nên lỗ của Short về lý thuyết không có đáy.',
        en: 'Assuming a short position has limited downside. The index has no ceiling on how high it can rise, so a Short position’s loss is theoretically unbounded.',
      },
    },
    example: {
      title: {
        vi: 'VN30F2005 — mặt còn lại của phiên đáo hạn 21/05/2020, vị thế Short',
        en: 'VN30F2005 — the other side of the 2020-05-21 expiry session, a short position',
      },
      inputs: { entryPoints: 864, exitPoints: 815.55, contracts: 1 },
      expected: 4_845_000,
      note: {
        vi: 'So với mốc 0 đồng: kết quả dương là lãi, ở đây lãi 4.845.000 ₫ trên một hợp đồng bán ở 864 điểm rồi thanh toán ở 815,55 điểm, đúng bằng khoản bên mua lỗ. Bên bán lãi mà chỉ số không cần giảm, vì giá khớp 864 điểm cao hơn chỉ số VN30 cùng lúc 48,45 điểm, còn ngày đáo hạn hợp đồng thanh toán đúng bằng chỉ số.',
        en: 'Compared with the 0 ₫ mark: a positive result is a profit, here 4,845,000 ₫ on one contract sold at 864 points and settled at 815.55 points, exactly what the buyer lost. The short profits without the index having to fall, because the 864-point fill sat 48.45 points above the VN30 index at the same moment, and on expiry day the contract settles at exactly the index.',
      },
      source: {
        vi: 'VnExpress và Tin nhanh Chứng khoán, tường thuật phiên đáo hạn phái sinh ngày 21/05/2020.',
        en: 'VnExpress and Tin nhanh Chung khoan, reports on the derivatives expiry session of 2020-05-21.',
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
      vi: 'Số hợp đồng tối đa = Vốn ký quỹ ÷ (Điểm hợp đồng × Hệ số nhân × Tỷ lệ ký quỹ), làm tròn xuống',
      en: 'Maximum contracts = Margin capital ÷ (Contract points × Multiplier × Margin ratio), rounded down',
    },
    substitutionDerived: { k: '{marginRatio} ÷ 100' },
    substitution: '⌊{capital} ÷ ({futuresPoints} × {derivative.vn30f.multiplier} × {k})⌋',
    symbols: [
      {
        latex: 'N_{max}',
        meaning: {
          vi: 'số hợp đồng nhiều nhất mở được với vốn ký quỹ hiện có, HĐ',
          en: 'maximum number of contracts the available margin can open',
        },
      },
      {
        latex: '\\lfloor',
        meaning: {
          vi: 'dấu ngoặc sàn, làm tròn xuống số nguyên',
          en: 'floor brackets, rounding down to a whole number',
        },
      },
      {
        latex: 'V',
        meaning: {
          vi: 'vốn ký quỹ đã nộp vào tài khoản phái sinh, ₫',
          en: 'margin capital deposited in the derivatives account, ₫',
        },
      },
      {
        latex: 'F',
        meaning: { vi: 'điểm hợp đồng tương lai, điểm', en: 'futures contract points' },
      },
      {
        latex: 'm',
        meaning: {
          vi: 'hệ số nhân của hợp đồng VN30F, ₫ mỗi điểm',
          en: 'VN30F contract multiplier, ₫ per point',
        },
      },
      {
        latex: 'k',
        meaning: {
          vi: 'tỷ lệ ký quỹ ban đầu do công ty chứng khoán quy định, dạng thập phân, tức 1% là 0,01',
          en: 'initial margin ratio set by the securities company, as a decimal, so 1% is 0.01',
        },
      },
    ],
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
      numberVar('capital', { vi: 'Vốn ký quỹ (V)', en: 'Margin capital (V)' }, '₫', 200_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: {
          vi: 'Số tiền đã nộp vào tài khoản ký quỹ phái sinh.',
          en: 'Amount of money deposited into the derivatives margin account.',
        },
      }),
      withSymbol(futuresPoints, 'F'),
      numberVar(
        'marginRatio',
        { vi: 'Tỷ lệ ký quỹ ban đầu (k)', en: 'Initial margin ratio (k)' },
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
        vi: 'Mỗi hợp đồng đòi một khoản ký quỹ ban đầu bằng giá trị danh nghĩa (điểm hợp đồng nhân hệ số nhân) nhân tỷ lệ ký quỹ; vốn chia cho khoản đó là số hợp đồng mở được.',
        en: 'Each contract requires initial margin equal to its notional value (contract points times the multiplier) times the margin ratio; capital divided by that amount gives the number of contracts you can open.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn vừa nộp tiền vào tài khoản phái sinh và muốn biết số tiền đó đủ ký quỹ để mở nhiều nhất bao nhiêu hợp đồng VN30F.',
        en: 'Use it when you have just deposited money into a derivatives account and want to know the largest number of VN30F contracts that deposit can cover in margin.',
      },
      howToRead: {
        vi: 'So với số hợp đồng bạn định mở: định mở nhiều hơn con số này thì tài khoản không đủ tiền ký quỹ ban đầu, ít hơn thì còn tiền dư ngoài phần ký quỹ. Kết quả đã làm tròn xuống, 0 nghĩa là vốn chưa đủ ký quỹ cho dù chỉ một hợp đồng.',
        en: 'Compared with the number of contracts you plan to open: planning more than this means the account lacks the initial margin for them, planning fewer leaves spare cash beyond the margin. The result is rounded down, so 0 means the capital does not cover the margin for even one contract.',
      },
      commonMistakes: {
        vi: 'Coi số tối đa là số nên mở. Trần này chỉ nói tài khoản đủ tiền ký quỹ, không nói gì về mức rủi ro hợp lý — cỡ vị thế nên tính theo % rủi ro.',
        en: 'Treating the maximum as the number you should open. This ceiling only says the account has enough margin — it says nothing about a sensible risk level; position size should be based on % risk instead.',
      },
    },
    example: {
      title: {
        vi: 'Tài khoản 200 triệu ₫ mở VN30F1M theo giá phiên 14/09/2026, ký quỹ 17%',
        en: 'A 200 million ₫ account trading VN30F1M at the 2026-09-14 price, 17% margin',
      },
      inputs: { capital: 200_000_000, futuresPoints: 1_930.9, marginRatio: 17 },
      expected: 6,
      note: {
        vi: 'So với vốn 200 triệu ₫ trong tài khoản: mỗi hợp đồng đòi 32.825.300 ₫ ký quỹ ban đầu, nên mở được 6 hợp đồng và còn dư 3.048.200 ₫, chưa đủ cho hợp đồng thứ bảy. Nếu công ty chứng khoán đòi ký quỹ 20% thay vì 17% thì chỉ còn mở được 5 hợp đồng.',
        en: 'Compared with the 200 million ₫ in the account: each contract needs 32,825,300 ₫ of initial margin, so 6 contracts fit with 3,048,200 ₫ left over, not enough for a seventh. If the broker asks for 20% margin instead of 17%, only 5 contracts fit.',
      },
      source: {
        vi: 'Thông báo tỷ lệ ký quỹ ban đầu của VSDC, hiệu lực 20/12/2024; giá VN30F1M phiên 14/09/2026.',
        en: 'VSDC’s initial margin ratio notice, effective 2024-12-20; the VN30F1M price of the 2026-09-14 session.',
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
            vi: 'Nhập tỷ lệ ký quỹ theo quy định của công ty chứng khoán, thường từ 17% trở lên.',
            en: 'Enter the margin ratio set by your securities company, typically 17% or more.',
          },
        ),
      };
    }

    const marginPerContract = points * multiplier.value * (ratio / 100);
    return ok(lamTronXuong(v('capital') / marginPerContract), 'HĐ', {
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
      vi: 'Số hợp đồng = Vốn × Rủi ro mỗi lệnh ÷ (Khoảng cách cắt lỗ × Hệ số nhân), làm tròn xuống',
      en: 'Number of contracts = Capital × Risk per trade ÷ (Stop-loss distance × Multiplier), rounded down',
    },
    substitutionDerived: { r: '{riskPercent} ÷ 100' },
    substitution: '⌊{capital} × {r} ÷ ({stopPoints} × {derivative.vn30f.multiplier})⌋',
    symbols: [
      {
        latex: 'N',
        meaning: {
          vi: 'số hợp đồng được phép mở cho lệnh này, HĐ',
          en: 'number of contracts allowed for this trade',
        },
      },
      {
        latex: '\\lfloor',
        meaning: {
          vi: 'dấu ngoặc sàn, làm tròn xuống số nguyên',
          en: 'floor brackets, rounding down to a whole number',
        },
      },
      {
        latex: 'V',
        meaning: {
          vi: 'vốn tài khoản phái sinh, ₫',
          en: 'derivatives account capital, ₫',
        },
      },
      {
        latex: 'r',
        meaning: {
          vi: 'rủi ro chấp nhận mỗi lệnh, phần vốn dạng thập phân, tức 1% là 0,01',
          en: 'risk accepted per trade as a share of capital, as a decimal, so 1% is 0.01',
        },
      },
      {
        latex: '\\Delta P',
        meaning: {
          vi: 'khoảng cách cắt lỗ, tức số điểm chênh giữa điểm vào lệnh và điểm cắt lỗ',
          en: 'stop-loss distance, the points between the entry level and the stop level',
        },
      },
      {
        latex: 'm',
        meaning: {
          vi: 'hệ số nhân của hợp đồng VN30F, ₫ mỗi điểm',
          en: 'VN30F contract multiplier, ₫ per point',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['co vi the', 'position size', 'quan tri rui ro', 'cat lo', 'vn30f', 'phai sinh'],
    /*
     * Hình tròn của số tiền chấp nhận mất (V × r, tử số của hình): phần N hợp đồng thật sự mất nếu
     * chạm cắt lỗ, và phần còn dư do làm tròn xuống (22/10/2026). Khối Kết quả chỉ in N, nên khoản
     * mất thật — câu công thức trả lời — chưa hiện ở đâu khác.
     */
    composition: {
      title: { vi: 'Cơ cấu số tiền chấp nhận mất', en: 'Risk budget breakdown' },
      /*
       * Không kèm "(V × r)": dài hơn thì không vừa hai dòng trong lỗ vòng điện thoại. Ba nhãn rút
       * ngắn 26/10/2026 (chủ dự án: _"tại sao phần này nội dung chú thích lại dài vậy. rút gọn ngắn
       * đi"_): "Khoản mất nếu chạm cắt lỗ", "Phần còn dư trong mức rủi ro" và "Số tiền chấp nhận mất"
       * bị cắt đầu chữ trên hình thanh ngang — xem `NHAN_THANH_TOI_DA` ở `composition.test.ts`.
       */
      total: { vi: 'Tiền chấp nhận mất', en: 'Risk budget' },
      unit: '₫',
      parts: [
        { key: 'lossAtStop', label: { vi: 'Lỗ khi chạm cắt lỗ', en: 'Loss at the stop' } },
        { key: 'unusedRisk', label: { vi: 'Rủi ro còn dư', en: 'Unused risk' } },
      ],
    },
    resultUnit: 'HĐ',
    variables: [
      numberVar(
        'capital',
        { vi: 'Vốn tài khoản phái sinh (V)', en: 'Derivatives account capital (V)' },
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
        { vi: 'Rủi ro mỗi lệnh (r)', en: 'Risk per trade (r)' },
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
      numberVar(
        'stopPoints',
        { vi: 'Khoảng cách cắt lỗ (ΔP)', en: 'Stop-loss distance (ΔP)' },
        'điểm',
        15,
        {
          min: 0,
          max: 200,
          description: {
            vi: 'Số điểm chênh giữa điểm vào lệnh và điểm cắt lỗ — dùng được cho cả vị thế Long và Short.',
            en: 'The point gap between the entry level and the stop-loss level — applies to both Long and Short positions.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Khối lượng lớn nhất được phép mở sao cho nếu giá chạm cắt lỗ, khoản mất không vượt mức rủi ro đã định trước.',
        en: 'The largest position size you can open such that, if price hits the stop-loss, the loss does not exceed the predefined risk level.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn sắp mở một lệnh VN30F, đã định sẵn cắt lỗ cách giá vào mấy điểm, và muốn biết được mở mấy hợp đồng để lỡ chạm cắt lỗ cũng không mất quá số tiền đã định.',
        en: 'Use it when you are about to open a VN30F trade with your stop-loss distance in points already set, and want to know how many contracts to open so hitting the stop costs no more than the amount you set aside.',
      },
      howToRead: {
        vi: 'So với số hợp đồng bạn định mở cho lệnh này: mở nhiều hơn con số này thì lỡ chạm cắt lỗ sẽ mất quá số tiền rủi ro đã đặt, ít hơn hoặc bằng thì khoản mất nằm trong mức ấy. Kết quả 0 nghĩa là với khoảng cắt lỗ này, một hợp đồng thôi cũng đã vượt mức rủi ro.',
        en: 'Compared with the number of contracts you plan to open on this trade: opening more than this means a hit on the stop-loss would cost more than the risk amount you set, and this many or fewer keeps the loss within it. A result of 0 means that with this stop distance even one contract exceeds your risk.',
      },
      commonMistakes: {
        vi: 'Mở theo số hợp đồng tối đa mà ký quỹ cho phép rồi mới nghĩ tới cắt lỗ. Thứ tự đúng là chọn điểm cắt lỗ trước, số hợp đồng suy ra sau.',
        en: 'Opening the maximum number of contracts margin allows and only then thinking about a stop-loss. The correct order is to choose the stop-loss level first and derive the position size afterward.',
      },
    },
    example: {
      title: {
        vi: 'Tài khoản 500 triệu ₫ vào lệnh VN30F1M tháng 9/2026, rủi ro 2% mỗi lệnh',
        en: 'A 500 million ₫ account entering VN30F1M in September 2026, risking 2% per trade',
      },
      inputs: { capital: 500_000_000, riskPercent: 2, stopPoints: 15 },
      expected: 6,
      note: {
        vi: 'So với số tiền chấp nhận mất là 10 triệu ₫, tức 2% của 500 triệu ₫: mỗi hợp đồng chạm cắt lỗ 15 điểm mất 1,5 triệu ₫, nên 6 hợp đồng mất 9 triệu ₫, vẫn trong mức, thêm hợp đồng thứ bảy là thành 10,5 triệu ₫. Khoản 9 triệu ₫ chỉ đúng khi lệnh cắt lỗ khớp đúng điểm đặt, giá nhảy qua điểm ấy thì lỗ thật lớn hơn.',
        en: 'Compared with the 10 million ₫ you accept losing, 2% of 500 million ₫: each contract that hits the 15-point stop loses 1.5 million ₫, so 6 contracts lose 9 million ₫, within the limit, while a seventh would make it 10.5 million ₫. That 9 million ₫ holds only if the stop fills exactly where it was set, and if the price jumps past it the real loss is larger.',
      },
      source: {
        vi: 'Bản quy định giao dịch hợp đồng tương lai chỉ số VN30 của MBS, hệ số nhân 100.000 ₫/điểm; biên độ dao động ngày của VN30 tháng 9/2026.',
        en: 'MBS’s VN30 index futures trading rules, 100,000 ₫ per point multiplier; the VN30 daily trading range in September 2026.',
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
    const contractsAllowed = lamTronXuong(riskAmount / riskPerContract);
    const lossAtStop = contractsAllowed * riskPerContract;
    return ok(contractsAllowed, 'HĐ', {
      extras: {
        riskAmount,
        riskPerContract,
        /*
         * Hai múi của hình "Cơ cấu số tiền chấp nhận mất". `Math.max`: `lamTronXuong` nới 1e−9 về số
         * nguyên gần nhất (450.000.000 × 1,8 % ÷ 1.350.000 ra 6), nên `lossAtStop` có thể vượt
         * `riskAmount` một phần tỷ đồng, và một phần âm làm mục cơ cấu biến mất.
         */
        lossAtStop,
        unusedRisk: Math.max(0, riskAmount - lossAtStop),
      },
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
    substitution: '{futuresPoints} × {derivative.vn30f.multiplier} × {contracts} ÷ {equity}',
    symbols: [
      {
        latex: 'L',
        meaning: {
          vi: 'tỷ lệ đòn bẩy hiệu dụng, tức giá trị danh nghĩa gấp mấy lần vốn thực, lần',
          en: 'effective leverage, notional value as a multiple of actual equity, times',
        },
      },
      {
        latex: 'F',
        meaning: { vi: 'điểm hợp đồng tương lai, điểm', en: 'futures contract points' },
      },
      {
        latex: 'm',
        meaning: {
          vi: 'hệ số nhân của hợp đồng VN30F, ₫ mỗi điểm',
          en: 'VN30F contract multiplier, ₫ per point',
        },
      },
      {
        latex: 'N',
        meaning: { vi: 'số hợp đồng đang giữ, HĐ', en: 'number of contracts held' },
      },
      {
        latex: 'E',
        meaning: {
          vi: 'vốn thực có trong tài khoản, gồm tiền ký quỹ cộng lãi lỗ đã bù trừ, ₫',
          en: 'actual equity in the account, margin deposit plus settled P&L, ₫',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['don bay', 'leverage', 'vn30f', 'gia tri danh nghia', 'notional', 'phai sinh'],
    /*
     * Hình tròn của giá trị danh nghĩa: vốn thực có và phần vượt vốn ấy (22/10/2026). Múi vốn thực
     * chiếm đúng 1 ÷ L, cũng là mức giá đi ngược bao nhiêu phần trăm thì mất hết vốn. Hai múi chỉ là
     * một phép trừ: phần vượt KHÔNG phải một khoản vay, và nhãn nói đúng như vậy.
     */
    composition: {
      title: { vi: 'Cơ cấu giá trị danh nghĩa', en: 'Notional value breakdown' },
      /* Tên ngắn, không kèm "của vị thế (F × m × N)": dài hơn thì không vừa hai dòng trong lỗ. */
      total: { vi: 'Giá trị danh nghĩa', en: 'Notional value' },
      unit: '₫',
      /*
       * Nhãn riêng cho múi vốn chứ không mượn nhãn ô nhập "Vốn thực có trong tài khoản (E)" (31 ký tự),
       * và nhãn múi vượt rút ngắn — cả hai bị cắt trên hình thanh ngang (26/10/2026, xem
       * `NHAN_THANH_TOI_DA` ở `composition.test.ts`).
       */
      parts: [
        { key: 'equity', label: { vi: 'Vốn thực có (E)', en: 'Equity (E)' } },
        { key: 'exposureAboveEquity', label: { vi: 'Phần vượt vốn', en: 'Above equity' } },
      ],
    },
    resultUnit: 'lần',
    variables: [
      withSymbol(futuresPoints, 'F'),
      withSymbol(contracts, 'N'),
      numberVar(
        'equity',
        { vi: 'Vốn thực có trong tài khoản (E)', en: 'Actual equity in the account (E)' },
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
        vi: 'Mức khuếch đại thực tế của tài khoản: giá trị danh nghĩa của vị thế đang gấp bao nhiêu lần vốn thực có, nên tài khoản chịu lãi lỗ của một lượng tài sản lớn gấp chừng ấy lần so với số tiền thực tế đang có.',
        en: 'The true amplification of the account: the notional value of the position is that many times actual equity, so the account carries the gains and losses of a holding that many times larger than the money actually in it.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn đang giữ hợp đồng VN30F qua vài phiên lãi lỗ và muốn biết tổng giá trị hợp đồng lúc này đang gấp bao nhiêu lần số tiền thật còn lại trong tài khoản.',
        en: 'Use it when you have held VN30F contracts through a few sessions of gains and losses and want to know how many times larger their total value now is than the real money left in your account.',
      },
      howToRead: {
        vi: 'So với mức trần, tức 100 chia cho tỷ lệ ký quỹ ban đầu tính theo %: thấp hơn nhiều nghĩa là tài khoản còn dư tiền làm đệm, sát hoặc vượt trần nghĩa là tiền thật chỉ còn vừa đủ hoặc đã hụt so với mức ký quỹ ban đầu đòi hỏi.',
        en: 'Compared with the ceiling, 100 divided by the initial margin ratio in percent: well below it means the account still has spare cash as a cushion, and at or above it means the real money left only just covers, or already falls short of, the initial margin required.',
      },
      commonMistakes: {
        vi: 'Nghĩ nghịch đảo tỷ lệ ký quỹ là đòn bẩy cố định của mọi lệnh. Đó chỉ là mức TRẦN — mức cao nhất được phép khi nộp đúng ký quỹ tối thiểu; nộp ký quỹ dày hơn thì đòn bẩy thực đã thấp hơn ngay từ lúc vào lệnh, còn thua lỗ theo thời gian lại tự đẩy đòn bẩy thực lên cao hơn con số ban đầu.',
        en: 'Assuming the inverse of the margin ratio is the fixed leverage for every trade. That is only the CEILING — the maximum allowed when depositing exactly the minimum margin; depositing more margin means the actual leverage is already lower from the start, while losses over time push actual leverage above the initial figure on their own.',
      },
    },
    example: {
      title: {
        vi: 'Sáu hợp đồng VN30F1M giá phiên 14/09/2026 trên vốn thực có 200 triệu ₫',
        en: 'Six VN30F1M contracts at the 2026-09-14 price against 200 million ₫ of equity',
      },
      inputs: { futuresPoints: 1_930.9, contracts: 6, equity: 200_000_000 },
      expected: 5.7927,
      note: {
        vi: 'So với mức trần 5,88 lần mà ký quỹ ban đầu 17% của VSDC cho phép: 5,79 lần là đã sát trần, sáu hợp đồng dùng 196.951.800 ₫ trong 200 triệu ₫ vốn làm ký quỹ, và giá hợp đồng giảm 1% là tài khoản mất 5,79%, tức 11.585.400 ₫.',
        en: 'Compared with the ceiling of 5.88 times that the 17% VSDC initial margin allows: 5.79 times is already close to that ceiling, the six contracts tie up 196,951,800 ₫ of the 200 million ₫ as margin, and a 1% drop in the contract price costs the account 5.79%, or 11,585,400 ₫.',
      },
      source: {
        vi: 'Bản quy định giao dịch hợp đồng tương lai chỉ số VN30 của MBS; giá VN30F1M phiên 14/09/2026.',
        en: 'MBS’s VN30 index futures trading rules; the VN30F1M price of the 2026-09-14 session.',
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
    /* Múi thứ hai của hình "Cơ cấu giá trị danh nghĩa"; âm khi L < 1, và mục vắng. */
    return ok(notional / equity, 'lần', {
      extras: { notionalValue: notional, exposureAboveEquity: notional - equity },
    });
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
