/**
 * Tầng DOMAIN — nhóm "Chỉ số doanh nghiệp" (gói WBS 5.2.x, categoryId 'fundamentals').
 *
 * Mười một công thức, cộng với P/E và P/B đã có ở `multiples.ts` là đủ 13 theo
 * `expectedCount` của SRS 3.8.
 *
 * Bộ số kiểm chứng dựng quanh preset FPT của `src/data/samples.ts` (EPS 6.050 ₫,
 * BVPS 24.800 ₫, 1,47 tỷ cổ phiếu): suy ngược ra LNST ≈ 8.894 tỷ ₫ và vốn chủ sở hữu
 * 36.456 tỷ ₫, các số còn lại (doanh thu, tổng tài sản…) đặt ở mức hợp lý cùng cỡ.
 * Mọi số kỳ vọng trong `tests[]` đều tính trước bằng script dạng đóng độc lập,
 * theo đúng luật của README thư mục này.
 *
 * Quy ước đơn vị: các khoản trên báo cáo tài chính nhập bằng **tỷ ₫** cho dễ gõ;
 * số cổ phiếu nhập bằng **CP**. Hai công thức ra kết quả ₫/CP (EPS, BVPS) nhân 1e9
 * trong thân hàm — đó là đổi đơn vị tỷ ₫ → ₫, không phải hằng số thị trường.
 *
 * Các biến `sharesOutstanding`, `dividendPerShare`, `eps` đặt key trùng đúng trường
 * của `Fundamentals` trong tầng Data, để nút "Nạp mẫu" của WF-10 tự điền được.
 *
 * Ca lỗi kinh điển của nhóm: vốn chủ sở hữu âm (ROE, D/E, BVPS vô nghĩa), doanh thu
 * bằng 0, nợ ngắn hạn bằng 0 — cùng mã cảnh báo ở mọi công thức theo WF-15.
 */

import { fail, ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import type { FormulaSource } from '../registry/types';
import { divideByZero, meaningless } from '../warnings';
import { SOURCE_CFA, SOURCE_VAS, numberVar } from './shared';

/*
 * ── Nguồn riêng của nhóm (FR-04) ───────────────────────────────────────────────────────
 */

const SOURCE_PHAN_TICH_BCTC: FormulaSource = {
  label: 'Giáo trình Phân tích báo cáo tài chính — Nguyễn Năng Phúc (NXB Đại học Kinh tế Quốc dân)',
};

/*
 * ── Biến dùng chung ────────────────────────────────────────────────────────────────────
 * Mỗi biến khai một lần rồi các công thức dùng lại, để cùng một khái niệm luôn cùng
 * nhãn, cùng đơn vị và cùng miền giá trị ở mọi màn hình.
 */

const netIncome = numberVar('netIncome', 'Lợi nhuận sau thuế', 'tỷ ₫', 8_894, {
  min: -1_000_000,
  max: 1_000_000,
  description: 'Lợi nhuận sau thuế của cổ đông công ty mẹ trong kỳ. Đang lỗ thì nhập số âm.',
});

const equity = numberVar('equity', 'Vốn chủ sở hữu', 'tỷ ₫', 36_456, {
  min: -1_000_000,
  max: 10_000_000,
  description: 'Vốn chủ sở hữu trên bảng cân đối kế toán cuối kỳ.',
});

const totalAssets = numberVar('totalAssets', 'Tổng tài sản', 'tỷ ₫', 68_000, {
  min: 0,
  max: 10_000_000,
  description: 'Tổng tài sản trên bảng cân đối kế toán cuối kỳ.',
});

const revenue = numberVar('revenue', 'Doanh thu thuần', 'tỷ ₫', 62_850, {
  min: 0,
  max: 10_000_000,
  description: 'Doanh thu bán hàng và cung cấp dịch vụ sau khi trừ các khoản giảm trừ.',
});

const sharesOutstanding = numberVar(
  'sharesOutstanding',
  'Số cổ phiếu lưu hành',
  'CP',
  1_470_000_000,
  {
    min: 0,
    max: 50_000_000_000,
    description: 'Số cổ phiếu phổ thông đang lưu hành, không tính cổ phiếu quỹ.',
  },
);

const currentLiabilities = numberVar('currentLiabilities', 'Nợ ngắn hạn', 'tỷ ₫', 28_000, {
  min: 0,
  max: 10_000_000,
  description: 'Các khoản phải trả trong vòng 12 tháng tới.',
});

/*
 * ── 1. EPS cơ bản ──────────────────────────────────────────────────────────────────────
 */

export const EPS_CO_BAN: FormulaModule = {
  spec: {
    id: 'eps-co-ban',
    categoryId: 'fundamentals',
    name: { vi: 'EPS cơ bản', en: 'Basic earnings per share' },
    description: 'Mỗi cổ phiếu phổ thông làm ra bao nhiêu đồng lợi nhuận trong kỳ.',
    latex: 'EPS = \\frac{\\text{LNST} - \\text{Cổ tức ưu đãi}}{\\text{Số CP lưu hành}}',
    expression: 'EPS = (Lợi nhuận sau thuế − Cổ tức ưu đãi) ÷ Số cổ phiếu lưu hành',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['eps', 'loi nhuan tren co phieu', 'earnings per share', 'chi so dn'],
    resultUnit: '₫',
    variables: [
      netIncome,
      numberVar('preferredDividend', 'Cổ tức ưu đãi', 'tỷ ₫', 0, {
        min: 0,
        max: 100_000,
        level: 'advanced',
        description: 'Cổ tức trả cho cổ phiếu ưu đãi trong kỳ. Không có thì để 0.',
      }),
      sharesOutstanding,
    ],
    explanation: {
      meaning:
        'Phần lợi nhuận thuộc về một cổ phiếu phổ thông sau khi trừ phần của cổ đông ưu đãi.',
      whenToUse: 'Là đầu vào của P/E và của hầu hết phép so sánh lợi nhuận giữa các doanh nghiệp.',
      howToRead:
        'EPS tăng đều qua các năm là dấu hiệu tốt; EPS âm nghĩa là doanh nghiệp đang lỗ trên mỗi cổ phiếu.',
      commonMistakes:
        'So EPS tuyệt đối giữa hai doanh nghiệp có số cổ phiếu khác nhau — EPS 1.000 ₫ không tệ hơn EPS 6.000 ₫ nếu thị giá cũng thấp tương ứng.',
    },
    example: {
      title: 'LNST 8.894 tỷ ₫, 1,47 tỷ cổ phiếu — bộ số FPT của WF-10',
      inputs: { netIncome: 8_894, preferredDividend: 0, sharesOutstanding: 1_470_000_000 },
      expected: 6_050.34,
      note: 'Khớp EPS 6.050 ₫ trong bộ số liệu mẫu.',
    },
    tests: [
      {
        name: 'bộ số FPT của WF-10',
        inputs: { netIncome: 8_894, preferredDividend: 0, sharesOutstanding: 1_470_000_000 },
        expected: 6_050.34,
      },
      {
        name: 'có cổ tức ưu đãi thì trừ ra trước khi chia',
        inputs: { netIncome: 8_894, preferredDividend: 894, sharesOutstanding: 1_470_000_000 },
        expected: 5_442.18,
      },
      {
        name: 'doanh nghiệp lỗ thì EPS âm — vẫn là con số có nghĩa',
        inputs: { netIncome: -1_200, preferredDividend: 0, sharesOutstanding: 1_000_000_000 },
        expected: -1_200,
      },
      {
        name: 'số cổ phiếu bằng 0 thì không chia được',
        inputs: { netIncome: 8_894, preferredDividend: 0, sharesOutstanding: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const shares = v('sharesOutstanding');
    if (shares === 0) {
      return fail(
        '₫',
        divideByZero(
          'EPS',
          'Số cổ phiếu lưu hành',
          'Nhập số cổ phiếu đang lưu hành của doanh nghiệp.',
        ),
      );
    }
    // × 1e9: đổi tỷ ₫ → ₫ vì kết quả tính trên từng cổ phiếu.
    return ok(((v('netIncome') - v('preferredDividend')) * 1e9) / shares, '₫');
  },
};

/*
 * ── 2. BVPS ────────────────────────────────────────────────────────────────────────────
 */

export const BVPS: FormulaModule = {
  spec: {
    id: 'bvps',
    categoryId: 'fundamentals',
    name: { vi: 'BVPS — giá trị sổ sách mỗi cổ phiếu', en: 'Book value per share' },
    description: 'Mỗi cổ phiếu đang nắm giữ bao nhiêu đồng vốn chủ sở hữu trên sổ sách.',
    latex: 'BVPS = \\frac{\\text{Vốn chủ sở hữu}}{\\text{Số CP lưu hành}}',
    expression: 'BVPS = Vốn chủ sở hữu ÷ Số cổ phiếu lưu hành',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['bvps', 'gia tri so sach', 'book value', 'chi so dn'],
    resultUnit: '₫',
    variables: [equity, sharesOutstanding],
    explanation: {
      meaning:
        'Số tiền lý thuyết mỗi cổ phiếu nhận được nếu doanh nghiệp giải thể và bán tài sản đúng giá sổ sách.',
      whenToUse: 'Là mẫu số của P/B, và là mốc so sánh khi thị giá rơi sâu.',
      howToRead:
        'Thị giá thấp hơn BVPS nghĩa là thị trường định giá doanh nghiệp dưới giá trị sổ sách — cần tìm hiểu vì sao trước khi kết luận là rẻ.',
      commonMistakes:
        'Coi BVPS là giá trị thanh lý thật. Sổ sách ghi theo giá gốc, tài sản thực tế có thể bán được cao hơn hoặc thấp hơn nhiều.',
    },
    example: {
      title: 'Vốn chủ 36.456 tỷ ₫, 1,47 tỷ cổ phiếu — bộ số FPT của WF-10',
      inputs: { equity: 36_456, sharesOutstanding: 1_470_000_000 },
      expected: 24_800,
      note: 'Khớp BVPS 24.800 ₫ trong bộ số liệu mẫu.',
    },
    tests: [
      {
        name: 'bộ số FPT của WF-10',
        inputs: { equity: 36_456, sharesOutstanding: 1_470_000_000 },
        expected: 24_800,
      },
      {
        name: 'số cổ phiếu bằng 0 thì không chia được',
        inputs: { equity: 36_456, sharesOutstanding: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'vốn chủ sở hữu âm thì giá trị sổ sách không còn ý nghĩa',
        inputs: { equity: -5_000, sharesOutstanding: 1_000_000_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const shares = v('sharesOutstanding');
    if (shares === 0) {
      return fail(
        '₫',
        divideByZero(
          'BVPS',
          'Số cổ phiếu lưu hành',
          'Nhập số cổ phiếu đang lưu hành của doanh nghiệp.',
        ),
      );
    }
    const eq = v('equity');
    if (eq < 0) {
      return fail(
        '₫',
        meaningless(
          'BVPS không có ý nghĩa khi vốn chủ sở hữu đang âm.',
          'Doanh nghiệp lỗ luỹ kế vượt vốn góp. Xem lại báo cáo tài chính trước khi định giá.',
        ),
      );
    }
    return ok((eq * 1e9) / shares, '₫');
  },
};

/*
 * ── 3. ROE ─────────────────────────────────────────────────────────────────────────────
 */

export const ROE: FormulaModule = {
  spec: {
    id: 'roe',
    categoryId: 'fundamentals',
    name: { vi: 'ROE — tỷ suất sinh lời trên vốn chủ', en: 'Return on equity' },
    description: 'Một đồng vốn của cổ đông làm ra bao nhiêu đồng lợi nhuận trong một năm.',
    latex: 'ROE = \\frac{\\text{LNST}}{\\text{Vốn chủ sở hữu}} \\times 100\\%',
    expression: 'ROE = Lợi nhuận sau thuế ÷ Vốn chủ sở hữu × 100',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['roe', 'ty suat sinh loi', 'von chu so huu', 'return on equity', 'chi so dn'],
    resultUnit: '%',
    variables: [netIncome, equity],
    explanation: {
      meaning:
        'Hiệu quả sử dụng vốn của cổ đông: bỏ 100 đồng vốn thì mỗi năm sinh ra bao nhiêu đồng lãi.',
      whenToUse:
        'Là chỉ số đầu tiên để sàng lọc doanh nghiệp làm ăn hiệu quả, và để so sánh trong cùng ngành.',
      howToRead:
        'ROE giữ được trên 15% nhiều năm liền thường là doanh nghiệp tốt. ROE cao đột biến một năm thì phải xem có phải nhờ lợi nhuận bất thường hay vay nợ nhiều.',
      commonMistakes:
        'Chỉ nhìn ROE mà quên đòn bẩy: vay nợ nhiều làm vốn chủ nhỏ đi và thổi ROE lên cao, kèm theo rủi ro lớn hơn.',
    },
    example: {
      title: 'LNST 8.894 tỷ ₫, vốn chủ 36.456 tỷ ₫',
      inputs: { netIncome: 8_894, equity: 36_456 },
      expected: 24.4,
      note: 'Trên 15% nhiều năm liền là mức các nhà đầu tư giá trị hay tìm kiếm.',
    },
    tests: [
      { name: 'bộ số FPT của WF-10', inputs: { netIncome: 8_894, equity: 36_456 }, expected: 24.4 },
      {
        name: 'doanh nghiệp lỗ thì ROE âm — vẫn là con số có nghĩa',
        inputs: { netIncome: -1_200, equity: 10_000 },
        expected: -12,
      },
      {
        name: 'vốn chủ bằng 0 thì không chia được',
        inputs: { netIncome: 8_894, equity: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'vốn chủ âm thì ROE vô nghĩa — ca kinh điển của nhóm',
        inputs: { netIncome: 500, equity: -2_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const eq = v('equity');
    if (eq === 0) {
      return fail('%', divideByZero('ROE', 'Vốn chủ sở hữu', 'Nhập vốn chủ sở hữu khác 0.'));
    }
    if (eq < 0) {
      return fail(
        '%',
        meaningless(
          'ROE không có ý nghĩa khi vốn chủ sở hữu đang âm: lãi chia cho vốn âm cho ra một con số gây hiểu lầm.',
          'Xem lỗ luỹ kế trên báo cáo tài chính, hoặc dùng ROA để thay thế.',
        ),
      );
    }
    return ok((v('netIncome') / eq) * 100, '%');
  },
};

/*
 * ── 4. ROA ─────────────────────────────────────────────────────────────────────────────
 */

export const ROA: FormulaModule = {
  spec: {
    id: 'roa',
    categoryId: 'fundamentals',
    name: { vi: 'ROA — tỷ suất sinh lời trên tài sản', en: 'Return on assets' },
    description: 'Một đồng tài sản của doanh nghiệp tạo ra bao nhiêu đồng lợi nhuận.',
    latex: 'ROA = \\frac{\\text{LNST}}{\\text{Tổng tài sản}} \\times 100\\%',
    expression: 'ROA = Lợi nhuận sau thuế ÷ Tổng tài sản × 100',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['roa', 'ty suat sinh loi', 'tong tai san', 'return on assets', 'chi so dn'],
    resultUnit: '%',
    variables: [netIncome, totalAssets],
    explanation: {
      meaning: 'Hiệu quả dùng toàn bộ tài sản — cả vốn tự có lẫn vốn vay — để tạo ra lợi nhuận.',
      whenToUse:
        'Khi so sánh doanh nghiệp có mức vay nợ khác nhau, hoặc khi ROE bị đòn bẩy làm méo.',
      howToRead:
        'ROA thấp hơn ROE là bình thường vì tài sản luôn lớn hơn vốn chủ; khoảng cách càng rộng thì doanh nghiệp vay nợ càng nhiều.',
      commonMistakes:
        'So ROA giữa hai ngành khác cấu trúc tài sản — ngân hàng và bán lẻ có mặt bằng ROA hoàn toàn khác nhau.',
    },
    example: {
      title: 'LNST 8.894 tỷ ₫, tổng tài sản 68.000 tỷ ₫',
      inputs: { netIncome: 8_894, totalAssets: 68_000 },
      expected: 13.08,
    },
    tests: [
      {
        name: 'ca thường',
        inputs: { netIncome: 8_894, totalAssets: 68_000 },
        expected: 13.08,
      },
      {
        name: 'doanh nghiệp lỗ thì ROA âm — vẫn là con số có nghĩa',
        inputs: { netIncome: -1_200, totalAssets: 50_000 },
        expected: -2.4,
      },
      {
        name: 'tổng tài sản bằng 0 thì không chia được',
        inputs: { netIncome: 8_894, totalAssets: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const assets = v('totalAssets');
    if (assets === 0) {
      return fail('%', divideByZero('ROA', 'Tổng tài sản', 'Nhập tổng tài sản khác 0.'));
    }
    return ok((v('netIncome') / assets) * 100, '%');
  },
};

/*
 * ── 5. ROS — biên lợi nhuận ròng ───────────────────────────────────────────────────────
 */

export const BIEN_LOI_NHUAN_RONG: FormulaModule = {
  spec: {
    id: 'bien-loi-nhuan-rong',
    categoryId: 'fundamentals',
    name: { vi: 'ROS — biên lợi nhuận ròng', en: 'Net profit margin' },
    description: 'Cứ 100 đồng doanh thu thì doanh nghiệp giữ lại được bao nhiêu đồng lãi ròng.',
    latex: 'ROS = \\frac{\\text{LNST}}{\\text{Doanh thu thuần}} \\times 100\\%',
    expression: 'ROS = Lợi nhuận sau thuế ÷ Doanh thu thuần × 100',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['ros', 'bien loi nhuan rong', 'net margin', 'profit margin', 'chi so dn'],
    resultUnit: '%',
    variables: [netIncome, revenue],
    explanation: {
      meaning: 'Phần trăm doanh thu còn lại sau khi trừ mọi chi phí, thuế và lãi vay.',
      whenToUse: 'Khi so sánh khả năng kiểm soát chi phí giữa các doanh nghiệp cùng ngành.',
      howToRead:
        'Biên ròng mỏng nghĩa là chỉ cần chi phí nhích nhẹ là lợi nhuận bốc hơi; biên dày cho doanh nghiệp sức chịu đựng tốt hơn khi thị trường xấu.',
      commonMistakes:
        'So biên ròng giữa bán lẻ (thường vài phần trăm) với phần mềm (vài chục phần trăm) rồi kết luận bán lẻ kém.',
    },
    example: {
      title: 'LNST 8.894 tỷ ₫, doanh thu 62.850 tỷ ₫',
      inputs: { netIncome: 8_894, revenue: 62_850 },
      expected: 14.15,
    },
    tests: [
      { name: 'ca thường', inputs: { netIncome: 8_894, revenue: 62_850 }, expected: 14.15 },
      {
        name: 'doanh nghiệp lỗ thì biên ròng âm — vẫn là con số có nghĩa',
        inputs: { netIncome: -1_200, revenue: 30_000 },
        expected: -4,
      },
      {
        name: 'doanh thu bằng 0 — ca kinh điển của nhóm',
        inputs: { netIncome: 8_894, revenue: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const rev = v('revenue');
    if (rev === 0) {
      return fail(
        '%',
        divideByZero(
          'ROS',
          'Doanh thu thuần',
          'Nhập doanh thu thuần khác 0, hoặc chọn kỳ có doanh thu.',
        ),
      );
    }
    return ok((v('netIncome') / rev) * 100, '%');
  },
};

/*
 * ── 6. Biên lợi nhuận gộp ──────────────────────────────────────────────────────────────
 */

export const BIEN_LOI_NHUAN_GOP: FormulaModule = {
  spec: {
    id: 'bien-loi-nhuan-gop',
    categoryId: 'fundamentals',
    name: { vi: 'Biên lợi nhuận gộp', en: 'Gross profit margin' },
    description: 'Phần trăm doanh thu còn lại sau khi trừ giá vốn hàng bán.',
    latex:
      '\\text{Biên gộp} = \\frac{\\text{Doanh thu} - \\text{Giá vốn}}{\\text{Doanh thu}} \\times 100\\%',
    expression: 'Biên gộp = (Doanh thu thuần − Giá vốn hàng bán) ÷ Doanh thu thuần × 100',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['bien loi nhuan gop', 'gross margin', 'gia von', 'chi so dn'],
    resultUnit: '%',
    variables: [
      revenue,
      numberVar('cogs', 'Giá vốn hàng bán', 'tỷ ₫', 38_400, {
        min: 0,
        max: 10_000_000,
        description: 'Chi phí trực tiếp tạo ra hàng hoá, dịch vụ đã bán trong kỳ.',
      }),
    ],
    explanation: {
      meaning:
        'Sức mạnh giá bán so với chi phí trực tiếp — chưa tính chi phí bán hàng, quản lý hay lãi vay.',
      whenToUse:
        'Khi đánh giá lợi thế cạnh tranh: doanh nghiệp có thương hiệu hay công nghệ riêng thường giữ được biên gộp cao.',
      howToRead:
        'Biên gộp ổn định hoặc tăng dần là dấu hiệu doanh nghiệp giữ được giá bán; biên gộp co lại thường do cạnh tranh ép giá hoặc chi phí đầu vào tăng.',
      commonMistakes:
        'Nhầm biên gộp với biên ròng — biên gộp cao vẫn có thể lỗ ròng nếu chi phí vận hành và lãi vay quá lớn.',
    },
    example: {
      title: 'Doanh thu 62.850 tỷ ₫, giá vốn 38.400 tỷ ₫',
      inputs: { revenue: 62_850, cogs: 38_400 },
      expected: 38.9,
    },
    tests: [
      { name: 'ca thường', inputs: { revenue: 62_850, cogs: 38_400 }, expected: 38.9 },
      {
        name: 'giá vốn cao hơn doanh thu thì biên gộp âm — bán dưới giá vốn',
        inputs: { revenue: 30_000, cogs: 33_000 },
        expected: -10,
      },
      {
        name: 'doanh thu bằng 0 — ca kinh điển của nhóm',
        inputs: { revenue: 0, cogs: 38_400 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const rev = v('revenue');
    if (rev === 0) {
      return fail(
        '%',
        divideByZero('biên lợi nhuận gộp', 'Doanh thu thuần', 'Nhập doanh thu thuần khác 0.'),
      );
    }
    return ok(((rev - v('cogs')) / rev) * 100, '%');
  },
};

/*
 * ── 7. D/E — nợ trên vốn chủ ───────────────────────────────────────────────────────────
 */

export const NO_TREN_VON_CHU: FormulaModule = {
  spec: {
    id: 'no-tren-von-chu',
    categoryId: 'fundamentals',
    name: { vi: 'D/E — hệ số nợ trên vốn chủ', en: 'Debt to equity ratio' },
    description: 'Doanh nghiệp đang vay bao nhiêu đồng nợ trên mỗi đồng vốn của cổ đông.',
    latex: 'D/E = \\frac{\\text{Tổng nợ phải trả}}{\\text{Vốn chủ sở hữu}}',
    expression: 'D/E = Tổng nợ phải trả ÷ Vốn chủ sở hữu',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['de', 'd e', 'no tren von chu', 'don bay', 'debt to equity', 'chi so dn'],
    resultUnit: 'lần',
    variables: [
      numberVar('totalDebt', 'Tổng nợ phải trả', 'tỷ ₫', 22_500, {
        min: 0,
        max: 10_000_000,
        description: 'Toàn bộ nợ ngắn hạn và dài hạn trên bảng cân đối kế toán.',
      }),
      equity,
    ],
    explanation: {
      meaning:
        'Mức độ dùng đòn bẩy tài chính: doanh nghiệp dựa vào tiền vay nhiều hay ít so với vốn tự có.',
      whenToUse: 'Khi đánh giá rủi ro tài chính trước lúc mua, nhất là giai đoạn lãi suất tăng.',
      howToRead:
        'D/E trên 2 lần là mức đòn bẩy cao với phần lớn ngành sản xuất; riêng ngân hàng và bất động sản có mặt bằng nợ khác hẳn.',
      commonMistakes:
        'Coi mọi khoản nợ như nhau — nợ chiếm dụng nhà cung cấp không tốn lãi, khác hẳn nợ vay ngân hàng.',
    },
    example: {
      title: 'Nợ phải trả 22.500 tỷ ₫, vốn chủ 36.456 tỷ ₫',
      inputs: { totalDebt: 22_500, equity: 36_456 },
      expected: 0.6172,
    },
    tests: [
      { name: 'ca thường', inputs: { totalDebt: 22_500, equity: 36_456 }, expected: 0.6172 },
      {
        name: 'đòn bẩy cao — nợ gấp hơn 3 lần vốn chủ',
        inputs: { totalDebt: 80_000, equity: 25_000 },
        expected: 3.2,
      },
      {
        name: 'vốn chủ bằng 0 thì không chia được',
        inputs: { totalDebt: 22_500, equity: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'vốn chủ âm thì hệ số nợ vô nghĩa — ca kinh điển của nhóm',
        inputs: { totalDebt: 22_500, equity: -3_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const eq = v('equity');
    if (eq === 0) {
      return fail('lần', divideByZero('D/E', 'Vốn chủ sở hữu', 'Nhập vốn chủ sở hữu khác 0.'));
    }
    if (eq < 0) {
      return fail(
        'lần',
        meaningless(
          'D/E không có ý nghĩa khi vốn chủ sở hữu đang âm: hệ số ra âm dù doanh nghiệp ngập trong nợ.',
          'Vốn chủ âm tự nó đã là tín hiệu rủi ro nặng. Xem lỗ luỹ kế trên báo cáo tài chính.',
        ),
      );
    }
    return ok(v('totalDebt') / eq, 'lần');
  },
};

/*
 * ── 8. Hệ số thanh toán hiện hành ──────────────────────────────────────────────────────
 */

export const THANH_TOAN_HIEN_HANH: FormulaModule = {
  spec: {
    id: 'thanh-toan-hien-hanh',
    categoryId: 'fundamentals',
    name: { vi: 'Hệ số thanh toán hiện hành', en: 'Current ratio' },
    description: 'Tài sản ngắn hạn gấp bao nhiêu lần nợ phải trả trong 12 tháng tới.',
    latex: '\\text{Current ratio} = \\frac{\\text{Tài sản ngắn hạn}}{\\text{Nợ ngắn hạn}}',
    expression: 'Hệ số hiện hành = Tài sản ngắn hạn ÷ Nợ ngắn hạn',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['thanh toan hien hanh', 'current ratio', 'thanh khoan', 'chi so dn'],
    resultUnit: 'lần',
    variables: [
      numberVar('currentAssets', 'Tài sản ngắn hạn', 'tỷ ₫', 42_000, {
        min: 0,
        max: 10_000_000,
        description: 'Tiền, đầu tư ngắn hạn, phải thu và hàng tồn kho.',
      }),
      currentLiabilities,
    ],
    explanation: {
      meaning: 'Khả năng dùng tài sản ngắn hạn để trả các khoản nợ sắp đến hạn.',
      whenToUse:
        'Khi kiểm tra sức khoẻ thanh khoản trước lúc đầu tư, nhất là với doanh nghiệp vay nợ nhiều.',
      howToRead:
        'Dưới 1 lần nghĩa là nợ đến hạn nhiều hơn tài sản có thể xoay — dấu hiệu căng thẳng thanh khoản; quá cao lại có thể là ứ đọng vốn.',
      commonMistakes:
        'Yên tâm với hệ số cao mà không nhìn cơ cấu: tài sản ngắn hạn toàn hàng tồn kho khó bán thì hệ số cao cũng không cứu được.',
    },
    example: {
      title: 'Tài sản ngắn hạn 42.000 tỷ ₫, nợ ngắn hạn 28.000 tỷ ₫',
      inputs: { currentAssets: 42_000, currentLiabilities: 28_000 },
      expected: 1.5,
    },
    tests: [
      {
        name: 'ca thường',
        inputs: { currentAssets: 42_000, currentLiabilities: 28_000 },
        expected: 1.5,
      },
      {
        name: 'dưới 1 lần — nợ đến hạn vượt tài sản ngắn hạn',
        inputs: { currentAssets: 18_000, currentLiabilities: 24_000 },
        expected: 0.75,
      },
      {
        name: 'nợ ngắn hạn bằng 0 — ca kinh điển của nhóm',
        inputs: { currentAssets: 42_000, currentLiabilities: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const liabilities = v('currentLiabilities');
    if (liabilities === 0) {
      return fail(
        'lần',
        divideByZero(
          'hệ số thanh toán hiện hành',
          'Nợ ngắn hạn',
          'Doanh nghiệp không có nợ ngắn hạn thì không cần hệ số này — thanh khoản đã an toàn.',
        ),
      );
    }
    return ok(v('currentAssets') / liabilities, 'lần');
  },
};

/*
 * ── 9. Hệ số thanh toán nhanh ──────────────────────────────────────────────────────────
 */

export const THANH_TOAN_NHANH: FormulaModule = {
  spec: {
    id: 'thanh-toan-nhanh',
    categoryId: 'fundamentals',
    name: { vi: 'Hệ số thanh toán nhanh', en: 'Quick ratio' },
    description: 'Khả năng trả nợ ngắn hạn khi không kịp bán hàng tồn kho.',
    latex:
      '\\text{Quick ratio} = \\frac{\\text{Tài sản ngắn hạn} - \\text{Hàng tồn kho}}{\\text{Nợ ngắn hạn}}',
    expression: 'Hệ số nhanh = (Tài sản ngắn hạn − Hàng tồn kho) ÷ Nợ ngắn hạn',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['thanh toan nhanh', 'quick ratio', 'acid test', 'thanh khoan', 'chi so dn'],
    resultUnit: 'lần',
    variables: [
      numberVar('currentAssets', 'Tài sản ngắn hạn', 'tỷ ₫', 42_000, {
        min: 0,
        max: 10_000_000,
        description: 'Tiền, đầu tư ngắn hạn, phải thu và hàng tồn kho.',
      }),
      numberVar('inventory', 'Hàng tồn kho', 'tỷ ₫', 9_500, {
        min: 0,
        max: 10_000_000,
        description: 'Giá trị hàng tồn kho — phần tài sản ngắn hạn khó đổi thành tiền nhanh nhất.',
      }),
      currentLiabilities,
    ],
    explanation: {
      meaning:
        'Phép thử khắt khe hơn hệ số hiện hành: loại hàng tồn kho ra vì bán được hàng cần thời gian.',
      whenToUse:
        'Với doanh nghiệp có tồn kho lớn hoặc quay vòng chậm — bất động sản, thép, bán lẻ — nơi hệ số hiện hành dễ gây ảo giác an toàn.',
      howToRead:
        'Quanh 1 lần trở lên là an toàn; thấp hơn hẳn hệ số hiện hành nghĩa là thanh khoản đang phụ thuộc nặng vào việc bán được hàng tồn.',
      commonMistakes:
        'Quên rằng khoản phải thu trong tử số cũng có thể khó đòi — hệ số nhanh cao chưa chắc tiền đã về kịp.',
    },
    example: {
      title: 'Tài sản ngắn hạn 42.000 tỷ ₫, tồn kho 9.500 tỷ ₫, nợ ngắn hạn 28.000 tỷ ₫',
      inputs: { currentAssets: 42_000, inventory: 9_500, currentLiabilities: 28_000 },
      expected: 1.1607,
    },
    tests: [
      {
        name: 'ca thường',
        inputs: { currentAssets: 42_000, inventory: 9_500, currentLiabilities: 28_000 },
        expected: 1.1607,
      },
      {
        name: 'nợ ngắn hạn bằng 0 — ca kinh điển của nhóm',
        inputs: { currentAssets: 42_000, inventory: 9_500, currentLiabilities: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'tồn kho lớn hơn tài sản ngắn hạn thì số liệu chưa nhất quán',
        inputs: { currentAssets: 8_000, inventory: 9_500, currentLiabilities: 5_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const liabilities = v('currentLiabilities');
    if (liabilities === 0) {
      return fail(
        'lần',
        divideByZero(
          'hệ số thanh toán nhanh',
          'Nợ ngắn hạn',
          'Doanh nghiệp không có nợ ngắn hạn thì không cần hệ số này — thanh khoản đã an toàn.',
        ),
      );
    }
    const assets = v('currentAssets');
    const inventory = v('inventory');
    if (inventory > assets) {
      return fail(
        'lần',
        meaningless(
          'Hàng tồn kho đang lớn hơn tài sản ngắn hạn — hai số liệu này mâu thuẫn vì tồn kho là một phần của tài sản ngắn hạn.',
          'Kiểm tra lại hai ô trên bảng cân đối kế toán, cùng một kỳ báo cáo.',
        ),
      );
    }
    return ok((assets - inventory) / liabilities, 'lần');
  },
};

/*
 * ── 10. Vòng quay tổng tài sản ─────────────────────────────────────────────────────────
 */

export const VONG_QUAY_TONG_TAI_SAN: FormulaModule = {
  spec: {
    id: 'vong-quay-tong-tai-san',
    categoryId: 'fundamentals',
    name: { vi: 'Vòng quay tổng tài sản', en: 'Total asset turnover' },
    description: 'Một đồng tài sản tạo ra bao nhiêu đồng doanh thu trong một năm.',
    latex: '\\text{Vòng quay} = \\frac{\\text{Doanh thu thuần}}{\\text{Tổng tài sản}}',
    expression: 'Vòng quay tài sản = Doanh thu thuần ÷ Tổng tài sản',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['vong quay tai san', 'asset turnover', 'hieu suat', 'chi so dn'],
    resultUnit: 'vòng',
    variables: [revenue, totalAssets],
    explanation: {
      meaning:
        'Tốc độ "quay" tài sản thành doanh thu — thước đo hiệu suất vận hành của doanh nghiệp.',
      whenToUse:
        'Khi phân tích vì sao ROA cao hay thấp: ROA chính là biên lợi nhuận ròng nhân với vòng quay này.',
      howToRead:
        'Bán lẻ quay nhanh (trên 2 vòng) nhưng biên mỏng; điện nước hay bất động sản quay chậm (dưới 0,5 vòng) nhưng biên dày. So sánh phải trong cùng ngành.',
      commonMistakes:
        'Kết luận vòng quay thấp là kém mà không nhìn mô hình kinh doanh — doanh nghiệp thâm dụng tài sản vốn dĩ quay chậm.',
    },
    example: {
      title: 'Doanh thu 62.850 tỷ ₫, tổng tài sản 68.000 tỷ ₫',
      inputs: { revenue: 62_850, totalAssets: 68_000 },
      expected: 0.9243,
    },
    tests: [
      {
        name: 'ca thường',
        inputs: { revenue: 62_850, totalAssets: 68_000 },
        expected: 0.9243,
      },
      {
        name: 'doanh nghiệp thâm dụng tài sản quay chậm',
        inputs: { revenue: 20_000, totalAssets: 80_000 },
        expected: 0.25,
      },
      {
        name: 'tổng tài sản bằng 0 thì không chia được',
        inputs: { revenue: 62_850, totalAssets: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const assets = v('totalAssets');
    if (assets === 0) {
      return fail(
        'vòng',
        divideByZero('vòng quay tổng tài sản', 'Tổng tài sản', 'Nhập tổng tài sản khác 0.'),
      );
    }
    return ok(v('revenue') / assets, 'vòng');
  },
};

/*
 * ── 11. Hệ số chi trả cổ tức ───────────────────────────────────────────────────────────
 */

export const TY_LE_CHI_TRA_CO_TUC: FormulaModule = {
  spec: {
    id: 'ty-le-chi-tra-co-tuc',
    categoryId: 'fundamentals',
    name: { vi: 'Hệ số chi trả cổ tức', en: 'Dividend payout ratio' },
    description: 'Doanh nghiệp đem bao nhiêu phần trăm lợi nhuận ra trả cổ tức tiền mặt.',
    latex: '\\text{Payout} = \\frac{DPS}{EPS} \\times 100\\%',
    expression: 'Hệ số chi trả = Cổ tức tiền mặt mỗi cổ phiếu ÷ EPS × 100',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['chi tra co tuc', 'payout ratio', 'co tuc', 'dps', 'chi so dn'],
    resultUnit: '%',
    variables: [
      numberVar('dividendPerShare', 'Cổ tức tiền mặt / CP', '₫', 2_000, {
        min: 0,
        max: 100_000,
        description: 'Tổng cổ tức tiền mặt trả cho một cổ phiếu trong năm.',
      }),
      numberVar('eps', 'EPS — lợi nhuận trên mỗi cổ phiếu', '₫', 6_050, {
        min: -1_000_000,
        max: 1_000_000,
        description: 'Lợi nhuận sau thuế chia cho số cổ phiếu đang lưu hành.',
      }),
    ],
    explanation: {
      meaning:
        'Cách doanh nghiệp chia lợi nhuận: phần trả ngay cho cổ đông và phần giữ lại để tái đầu tư.',
      whenToUse:
        'Khi chọn cổ phiếu cổ tức, hoặc khi đánh giá mức cổ tức hiện tại có duy trì được lâu dài không.',
      howToRead:
        'Trên 100% nghĩa là trả nhiều hơn số lãi làm ra — phải lấy từ tiền tích luỹ, khó bền. Doanh nghiệp tăng trưởng nhanh thường giữ hệ số thấp để tái đầu tư.',
      commonMistakes:
        'Chỉ nhìn tỷ suất cổ tức cao mà không xem hệ số chi trả — cổ tức cao nhờ trả vượt khả năng lợi nhuận là cổ tức sắp bị cắt.',
    },
    example: {
      title: 'Cổ tức 2.000 ₫/CP, EPS 6.050 ₫ — bộ số FPT của WF-10',
      inputs: { dividendPerShare: 2_000, eps: 6_050 },
      expected: 33.06,
      note: 'Giữ lại khoảng hai phần ba lợi nhuận để tái đầu tư.',
    },
    tests: [
      {
        name: 'bộ số FPT của WF-10',
        inputs: { dividendPerShare: 2_000, eps: 6_050 },
        expected: 33.06,
      },
      {
        name: 'bộ số VNM — trả gần hết lợi nhuận làm ra',
        inputs: { dividendPerShare: 3_850, eps: 4_310 },
        expected: 89.33,
      },
      {
        name: 'EPS bằng 0 thì không chia được',
        inputs: { dividendPerShare: 2_000, eps: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'doanh nghiệp lỗ mà vẫn trả cổ tức thì hệ số vô nghĩa',
        inputs: { dividendPerShare: 2_000, eps: -1_500 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const eps = v('eps');
    if (eps === 0) {
      return fail(
        '%',
        divideByZero('hệ số chi trả cổ tức', 'EPS', 'Nhập EPS khác 0 hoặc chọn kỳ có lợi nhuận.'),
      );
    }
    if (eps < 0) {
      return fail(
        '%',
        meaningless(
          'Hệ số chi trả không có ý nghĩa khi doanh nghiệp đang lỗ: cổ tức lúc này lấy từ tiền tích luỹ, không phải từ lợi nhuận trong kỳ.',
          'Xem nguồn tiền trả cổ tức trên báo cáo lưu chuyển tiền tệ.',
        ),
      );
    }
    return ok((v('dividendPerShare') / eps) * 100, '%');
  },
};

/** Mười một chỉ số doanh nghiệp của đợt này — cộng P/E, P/B ở multiples.ts là đủ nhóm 13. */
export const FUNDAMENTAL_FORMULAS: ReadonlyArray<FormulaModule> = [
  EPS_CO_BAN,
  BVPS,
  ROE,
  ROA,
  BIEN_LOI_NHUAN_RONG,
  BIEN_LOI_NHUAN_GOP,
  NO_TREN_VON_CHU,
  THANH_TOAN_HIEN_HANH,
  THANH_TOAN_NHANH,
  VONG_QUAY_TONG_TAI_SAN,
  TY_LE_CHI_TRA_CO_TUC,
];
