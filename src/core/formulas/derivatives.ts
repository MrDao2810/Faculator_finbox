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
  label:
    'John C. Hull — Options, Futures, and Other Derivatives, ấn bản thứ 11 (Pearson), chương 5: Determination of Forward and Futures Prices',
};

const SOURCE_HNX_VN30F: FormulaSource = {
  label:
    'Quy chế giao dịch hợp đồng tương lai chỉ số VN30 của Sở Giao dịch Chứng khoán Hà Nội (HNX)',
};

/*
 * ── Biến dùng chung cho cả nhóm ────────────────────────────────────────────────────────
 * Cùng key mang cùng nghĩa ở mọi công thức, để một bộ ô nhập chạy được nhiều công thức.
 */

const indexValue = numberVar('indexValue', 'Chỉ số VN30 hiện tại', 'điểm', 1_280, {
  min: 0,
  max: 10_000,
  description: 'Giá trị chỉ số cơ sở VN30 tại thời điểm tính.',
});

const futuresPoints = numberVar('futuresPoints', 'Điểm hợp đồng tương lai', 'điểm', 1_280, {
  min: 0,
  max: 10_000,
  description: 'Giá hợp đồng VN30F đang giao dịch, tính bằng điểm chỉ số.',
});

const contracts = numberVar('contracts', 'Số hợp đồng', 'HĐ', 1, {
  min: 0,
  max: 5_000,
  description: 'Số hợp đồng VN30F đang nắm giữ trong vị thế.',
});

/*
 * ── 1. Giá lý thuyết hợp đồng tương lai ────────────────────────────────────────────────
 */

export const GIA_LY_THUYET_VN30F: FormulaModule = {
  spec: {
    id: 'gia-ly-thuyet-vn30f',
    categoryId: 'derivatives',
    name: { vi: 'Giá lý thuyết hợp đồng tương lai', en: 'Theoretical futures price' },
    description:
      'Mức giá hợp lý của hợp đồng VN30F suy từ chỉ số cơ sở, lãi suất và cổ tức (cost of carry).',
    latex: 'F = S \\left[ 1 + (r - q) \\cdot \\frac{d}{365} \\right]',
    expression:
      'Giá lý thuyết = Chỉ số cơ sở × [1 + (Lãi suất phi rủi ro − Tỷ suất cổ tức) ÷ 100 × Số ngày đến đáo hạn ÷ 365]',
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['vn30f', 'gia ly thuyet', 'hop dong tuong lai', 'cost of carry', 'futures', 'phai sinh'],
    resultUnit: 'điểm',
    variables: [
      indexValue,
      sliderVar('riskFreeRate', 'Lãi suất phi rủi ro / năm', '%', 4.5, 0, 15, 0.1, {
        description: 'Thường lấy theo lợi suất trái phiếu Chính phủ kỳ hạn ngắn.',
      }),
      sliderVar('dividendYield', 'Tỷ suất cổ tức rổ VN30 / năm', '%', 1.8, 0, 15, 0.1, {
        level: 'advanced',
        description: 'Cổ tức tiền mặt bình quân của rổ VN30, tính theo năm.',
      }),
      numberVar('days', 'Số ngày đến đáo hạn', 'ngày', 30, {
        min: 0,
        max: 365,
        description:
          'Đếm từ hôm nay tới ngày đáo hạn của hợp đồng — thứ Năm tuần thứ ba của tháng.',
      }),
    ],
    explanation: {
      meaning:
        'Nếu vay tiền mua cả rổ VN30 rồi giữ tới ngày đáo hạn, chi phí vốn trừ đi cổ tức nhận được chính là phần chênh hợp lý giữa giá hợp đồng và chỉ số.',
      whenToUse:
        'Khi muốn biết giá VN30F trên bảng điện đang đắt hay rẻ so với mức mà lãi suất và cổ tức biện minh được.',
      howToRead:
        'Giá thị trường cao hơn giá lý thuyết đáng kể là thị trường đang hưng phấn; thấp hơn nhiều là đang bi quan về chỉ số.',
      commonMistakes:
        'So giá hợp đồng với chỉ số hiện tại rồi kết luận đắt rẻ ngay — phần chênh do lãi suất và cổ tức là bình thường, không phải định giá sai.',
    },
    example: {
      title: 'VN30 ở 1.280 điểm, lãi suất 4,5%, cổ tức 1,8%, còn 30 ngày',
      inputs: { indexValue: 1_280, riskFreeRate: 4.5, dividendYield: 1.8, days: 30 },
      expected: 1_282.84,
      note: 'Phần chênh 2,84 điểm là chi phí nắm giữ, chưa nói gì về hướng đi của chỉ số.',
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
          'Chỉ số cơ sở phải lớn hơn 0 thì mới có giá lý thuyết để tính.',
          'Nhập giá trị chỉ số VN30 hiện tại trên bảng điện.',
        ),
      };
    }

    if (days < 0) {
      return {
        value: null,
        unit: 'điểm',
        warning: meaningless(
          'Số ngày đến đáo hạn đang âm — hợp đồng này đã qua ngày đáo hạn.',
          'Nhập số ngày từ 0 trở lên, hoặc chọn hợp đồng kỳ hạn xa hơn.',
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
    description: 'Khoảng chênh giữa giá hợp đồng VN30F và chỉ số VN30 cơ sở, tính bằng điểm.',
    latex: 'Basis = F - S',
    expression: 'Basis = Giá hợp đồng tương lai − Chỉ số cơ sở',
    chartType: 'none',
    level: 'basic',
    tags: ['basis', 'vn30f', 'chenh gia', 'premium', 'discount', 'phai sinh'],
    resultUnit: 'điểm',
    variables: [
      numberVar('futuresPoints', 'Giá hợp đồng tương lai', 'điểm', 1_285.5, {
        min: 0,
        max: 10_000,
        description: 'Giá VN30F đang khớp trên bảng điện.',
      }),
      indexValue,
    ],
    explanation: {
      meaning:
        'Thước đo tâm lý thị trường phái sinh: basis dương là hợp đồng đang được trả giá cao hơn chỉ số, basis âm là thấp hơn.',
      whenToUse:
        'Theo dõi trước khi vào lệnh — basis đang rộng bất thường hay hẹp dần về ngày đáo hạn đều là thông tin.',
      howToRead:
        'Basis dương lớn thường đi với kỳ vọng tăng, basis âm sâu đi với tâm lý bi quan. Càng gần đáo hạn basis càng co về 0.',
      commonMistakes:
        'Quên rằng một phần basis là chi phí nắm giữ hợp lý (lãi suất trừ cổ tức) — không phải cứ basis dương là thị trường hưng phấn.',
    },
    example: {
      title: 'VN30F ở 1.285,5 điểm, VN30 ở 1.280 điểm',
      inputs: { futuresPoints: 1_285.5, indexValue: 1_280 },
      expected: 5.5,
      note: 'Basis +5,5 điểm, tương đương khoảng 0,43% chỉ số.',
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
          'Chỉ số cơ sở phải lớn hơn 0 thì basis mới có mốc để so sánh.',
          'Nhập giá trị chỉ số VN30 hiện tại trên bảng điện.',
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
    description: 'Số tiền lãi hoặc lỗ của vị thế mua hợp đồng VN30F, quy ra đồng.',
    latex: 'PnL_{long} = (P_{dong} - P_{mo}) \\times m \\times N',
    expression: 'Lãi/lỗ Long = (Điểm đóng vị thế − Điểm mở vị thế) × Hệ số nhân × Số hợp đồng',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['lai lo', 'vi the long', 'vn30f', 'mua', 'pnl', 'long', 'phai sinh'],
    resultUnit: '₫',
    variables: [
      numberVar('entryPoints', 'Điểm mở vị thế', 'điểm', 1_280, {
        min: 0,
        max: 10_000,
        description: 'Giá VN30F lúc mở vị thế mua.',
      }),
      numberVar('exitPoints', 'Điểm đóng vị thế', 'điểm', 1_288, {
        min: 0,
        max: 10_000,
        description: 'Giá VN30F lúc đóng vị thế, hoặc giá hiện tại nếu chưa đóng.',
      }),
      contracts,
    ],
    explanation: {
      meaning:
        'Mỗi điểm chỉ số tăng lên đem về cho vị thế mua một khoản bằng hệ số nhân, nhân với số hợp đồng đang giữ.',
      whenToUse:
        'Khi ước tính nhanh lãi lỗ một vị thế mua đang mở, hoặc thử kịch bản chỉ số chạy tới một mốc điểm.',
      howToRead:
        'Điểm đóng cao hơn điểm mở là lãi, thấp hơn là lỗ. Lãi lỗ được thanh toán bù trừ hằng ngày chứ không đợi tới lúc đóng vị thế.',
      commonMistakes:
        'Quên rằng con số này chưa trừ phí giao dịch và thuế, và quên rằng lỗ chạm mức cảnh báo sẽ bị gọi ký quỹ bổ sung giữa chừng.',
    },
    example: {
      title: 'Mua 2 hợp đồng ở 1.280, đóng ở 1.288 điểm',
      inputs: { entryPoints: 1_280, exitPoints: 1_288, contracts: 2 },
      expected: 1_600_000,
      note: '8 điểm × 100.000 ₫/điểm × 2 hợp đồng, chưa trừ phí và thuế.',
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
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v, ctx) => {
    const multiplier = constantOf(ctx, 'derivative.vn30f.multiplier');
    if (multiplier === undefined) return missingConstant('₫', 'hệ số nhân hợp đồng VN30F');

    const n = v('contracts');
    if (n < 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          'Số hợp đồng đang âm — vị thế mua không có số lượng âm.',
          'Nhập số hợp đồng từ 0 trở lên; muốn tính chiều bán thì dùng công thức vị thế Short.',
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
    description: 'Số tiền lãi hoặc lỗ của vị thế bán hợp đồng VN30F, quy ra đồng.',
    latex: 'PnL_{short} = (P_{mo} - P_{dong}) \\times m \\times N',
    expression: 'Lãi/lỗ Short = (Điểm mở vị thế − Điểm đóng vị thế) × Hệ số nhân × Số hợp đồng',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['lai lo', 'vi the short', 'vn30f', 'ban', 'pnl', 'short', 'phai sinh'],
    resultUnit: '₫',
    variables: [
      numberVar('entryPoints', 'Điểm mở vị thế', 'điểm', 1_280, {
        min: 0,
        max: 10_000,
        description: 'Giá VN30F lúc mở vị thế bán.',
      }),
      numberVar('exitPoints', 'Điểm đóng vị thế', 'điểm', 1_272, {
        min: 0,
        max: 10_000,
        description: 'Giá VN30F lúc đóng vị thế, hoặc giá hiện tại nếu chưa đóng.',
      }),
      contracts,
    ],
    explanation: {
      meaning:
        'Vị thế bán kiếm lời khi chỉ số giảm: mỗi điểm giảm đem về một khoản bằng hệ số nhân, nhân với số hợp đồng.',
      whenToUse:
        'Khi ước tính lãi lỗ một vị thế bán đang mở — cách kiếm lời lúc thị trường giảm mà chứng khoán cơ sở không làm được.',
      howToRead:
        'Điểm đóng thấp hơn điểm mở là lãi, cao hơn là lỗ — ngược chiều hoàn toàn với vị thế Long.',
      commonMistakes:
        'Nghĩ rằng lỗ của vị thế bán có giới hạn. Chỉ số tăng không có trần, nên lỗ của Short về lý thuyết không có đáy.',
    },
    example: {
      title: 'Bán 2 hợp đồng ở 1.280, đóng ở 1.272 điểm',
      inputs: { entryPoints: 1_280, exitPoints: 1_272, contracts: 2 },
      expected: 1_600_000,
      note: '8 điểm giảm × 100.000 ₫/điểm × 2 hợp đồng, chưa trừ phí và thuế.',
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
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v, ctx) => {
    const multiplier = constantOf(ctx, 'derivative.vn30f.multiplier');
    if (multiplier === undefined) return missingConstant('₫', 'hệ số nhân hợp đồng VN30F');

    const n = v('contracts');
    if (n < 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          'Số hợp đồng đang âm — vị thế bán không có số lượng âm.',
          'Nhập số hợp đồng từ 0 trở lên; muốn tính chiều mua thì dùng công thức vị thế Long.',
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
    description: 'Số hợp đồng VN30F nhiều nhất mở được với số tiền ký quỹ hiện có.',
    latex: 'N_{max} = \\left\\lfloor \\frac{V}{F \\times m \\times k} \\right\\rfloor',
    expression:
      'Số hợp đồng tối đa = Vốn ký quỹ ÷ (Điểm hợp đồng × Hệ số nhân × Tỷ lệ ký quỹ ÷ 100), làm tròn xuống',
    chartType: 'none',
    level: 'basic',
    tags: ['ky quy', 'so hop dong', 'margin', 'vn30f', 'ky quy ban dau', 'phai sinh'],
    resultUnit: 'HĐ',
    variables: [
      numberVar('capital', 'Vốn ký quỹ', '₫', 200_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Số tiền đã nộp vào tài khoản ký quỹ phái sinh.',
      }),
      futuresPoints,
      numberVar('marginRatio', 'Tỷ lệ ký quỹ ban đầu', '%', 17, {
        min: 0,
        max: 100,
        description:
          'Do từng công ty chứng khoán quy định, thường quanh 17–25%. Kiểm tra mức áp dụng của công ty bạn.',
      }),
    ],
    explanation: {
      meaning:
        'Mỗi hợp đồng đòi một khoản ký quỹ ban đầu bằng giá trị danh nghĩa nhân tỷ lệ ký quỹ; vốn chia cho khoản đó là số hợp đồng mở được.',
      whenToUse:
        'Trước khi đặt lệnh, để biết trần khối lượng mà tài khoản chịu được — rồi mới cân nhắc có nên đi tới trần hay không.',
      howToRead:
        'Kết quả làm tròn xuống số nguyên; ra 0 nghĩa là vốn chưa đủ ký quỹ cho dù chỉ một hợp đồng. Mở kín trần thì một nhịp ngược nhỏ đã bị gọi ký quỹ.',
      commonMistakes:
        'Coi số tối đa là số nên mở. Trần này chỉ nói tài khoản đủ tiền ký quỹ, không nói gì về mức rủi ro hợp lý — cỡ vị thế nên tính theo % rủi ro.',
    },
    example: {
      title: 'Vốn 200 triệu ₫, VN30F ở 1.280 điểm, ký quỹ 17%',
      inputs: { capital: 200_000_000, futuresPoints: 1_280, marginRatio: 17 },
      expected: 9,
      note: 'Mỗi hợp đồng cần ký quỹ 21,76 triệu ₫; 200 ÷ 21,76 = 9,19 → làm tròn xuống 9.',
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
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v, ctx) => {
    const multiplier = constantOf(ctx, 'derivative.vn30f.multiplier');
    if (multiplier === undefined) return missingConstant('HĐ', 'hệ số nhân hợp đồng VN30F');

    const points = v('futuresPoints');
    if (points === 0) {
      return {
        value: null,
        unit: 'HĐ',
        warning: divideByZero(
          'số hợp đồng tối đa',
          'Điểm hợp đồng',
          'Nhập giá VN30F đang giao dịch trên bảng điện.',
        ),
      };
    }

    const ratio = v('marginRatio');
    if (ratio === 0) {
      return {
        value: null,
        unit: 'HĐ',
        warning: divideByZero(
          'số hợp đồng tối đa',
          'Tỷ lệ ký quỹ ban đầu',
          'Nhập tỷ lệ ký quỹ theo quy định của công ty chứng khoán, thường quanh 17%.',
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
    description:
      'Số hợp đồng được phép mở để một lệnh chạm cắt lỗ không mất quá mức rủi ro đã định.',
    latex: 'N = \\left\\lfloor \\frac{V \\times r}{\\Delta P \\times m} \\right\\rfloor',
    expression:
      'Số hợp đồng = Vốn × Rủi ro mỗi lệnh ÷ 100 ÷ (Khoảng cách cắt lỗ × Hệ số nhân), làm tròn xuống',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['co vi the', 'position size', 'quan tri rui ro', 'cat lo', 'vn30f', 'phai sinh'],
    resultUnit: 'HĐ',
    variables: [
      numberVar('capital', 'Vốn tài khoản phái sinh', '₫', 500_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Tổng vốn đang dành cho giao dịch phái sinh.',
      }),
      sliderVar('riskPercent', 'Rủi ro mỗi lệnh', '%', 2, 0.1, 10, 0.1, {
        description: 'Phần trăm vốn chấp nhận mất nếu lệnh này chạm cắt lỗ.',
      }),
      numberVar('stopPoints', 'Khoảng cách cắt lỗ', 'điểm', 15, {
        min: 0,
        max: 200,
        description:
          'Số điểm chênh giữa điểm vào lệnh và điểm cắt lỗ — dùng được cho cả vị thế Long và Short.',
      }),
    ],
    explanation: {
      meaning:
        'Khối lượng lớn nhất được phép mở sao cho nếu giá chạm cắt lỗ, khoản mất không vượt mức rủi ro đã định trước.',
      whenToUse:
        'Trước mỗi lệnh phái sinh — đòn bẩy cao khiến vào lệnh quá tay là lỗi đắt nhất của người mới.',
      howToRead:
        'Kết quả làm tròn xuống số nguyên hợp đồng, nên rủi ro thực luôn nhỏ hơn hoặc bằng mức đã định. Ra 0 nghĩa là mức cắt lỗ này quá rộng cho số vốn hiện có.',
      commonMistakes:
        'Mở theo số hợp đồng tối đa mà ký quỹ cho phép rồi mới nghĩ tới cắt lỗ. Thứ tự đúng là chọn điểm cắt lỗ trước, số hợp đồng suy ra sau.',
    },
    example: {
      title: 'Vốn 500 triệu ₫, rủi ro 2%, cắt lỗ cách 15 điểm',
      inputs: { capital: 500_000_000, riskPercent: 2, stopPoints: 15 },
      expected: 6,
      note: 'Mức chịu lỗ 10 triệu ₫; mỗi hợp đồng rủi ro 1,5 triệu ₫ → 6 hợp đồng.',
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
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v, ctx) => {
    const multiplier = constantOf(ctx, 'derivative.vn30f.multiplier');
    if (multiplier === undefined) return missingConstant('HĐ', 'hệ số nhân hợp đồng VN30F');

    const stopPoints = v('stopPoints');
    if (stopPoints === 0) {
      return {
        value: null,
        unit: 'HĐ',
        warning: divideByZero(
          'cỡ vị thế',
          'Khoảng cách cắt lỗ',
          'Đặt điểm cắt lỗ cách điểm vào lệnh ít nhất 1 điểm.',
        ),
      };
    }

    if (stopPoints < 0) {
      return {
        value: null,
        unit: 'HĐ',
        warning: meaningless(
          'Khoảng cách cắt lỗ đang âm — khoảng cách là số điểm chênh nên luôn dương.',
          'Nhập số điểm chênh giữa điểm vào lệnh và điểm cắt lỗ, không phân biệt chiều Long hay Short.',
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
    description:
      'Giá trị danh nghĩa của vị thế đang gấp bao nhiêu lần vốn thực có trong tài khoản.',
    latex: 'L = \\frac{F \\times m \\times N}{E}',
    expression: 'Đòn bẩy hiệu dụng = Điểm hợp đồng × Hệ số nhân × Số hợp đồng ÷ Vốn thực có',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['don bay', 'leverage', 'vn30f', 'gia tri danh nghia', 'notional', 'phai sinh'],
    resultUnit: 'lần',
    variables: [
      futuresPoints,
      contracts,
      numberVar('equity', 'Vốn thực có trong tài khoản', '₫', 30_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Tiền ký quỹ cộng lãi lỗ đã bù trừ — giá trị ròng của tài khoản phái sinh.',
      }),
    ],
    explanation: {
      meaning:
        'Mức khuếch đại thật của tài khoản: đòn bẩy 5 lần nghĩa là chỉ số nhúc nhích 1% thì vốn của bạn biến động khoảng 5%.',
      whenToUse:
        'Sau khi mở vị thế, hoặc khi lãi lỗ bù trừ hằng ngày làm vốn thực co giãn — đòn bẩy trượt theo từng phiên chứ không đứng yên.',
      howToRead:
        'Con số càng cao thì biên an toàn trước một lệnh gọi ký quỹ càng mỏng. Vốn thực giảm vì thua lỗ sẽ tự đẩy đòn bẩy lên mà không cần mở thêm hợp đồng nào.',
      commonMistakes:
        'Nghĩ đòn bẩy cố định bằng nghịch đảo tỷ lệ ký quỹ. Đó chỉ là mức lúc vào lệnh — thua lỗ làm vốn mỏng đi thì đòn bẩy thực đã cao hơn con số ban đầu.',
    },
    example: {
      title: '1 hợp đồng ở 1.280 điểm, vốn thực có 30 triệu ₫',
      inputs: { futuresPoints: 1_280, contracts: 1, equity: 30_000_000 },
      expected: 4.27,
      note: 'Giá trị danh nghĩa 128 triệu ₫ trên 30 triệu ₫ vốn — chỉ số giảm 1% là vốn hụt hơn 4%.',
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
    source: [SOURCE_HULL, SOURCE_HNX_VN30F],
  },
  calc: (v, ctx) => {
    const multiplier = constantOf(ctx, 'derivative.vn30f.multiplier');
    if (multiplier === undefined) return missingConstant('lần', 'hệ số nhân hợp đồng VN30F');

    const n = v('contracts');
    if (n <= 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          'Chưa có hợp đồng nào đang mở nên chưa có đòn bẩy để đo.',
          'Nhập số hợp đồng từ 1 trở lên.',
        ),
      };
    }

    const equity = v('equity');
    if (equity === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          'đòn bẩy hiệu dụng',
          'Vốn thực có',
          'Nhập giá trị ròng hiện tại của tài khoản phái sinh.',
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
