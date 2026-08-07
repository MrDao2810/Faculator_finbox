/**
 * Tầng DOMAIN — bội số định giá: P/E và P/B (một phần gói WBS 5.2.2).
 *
 * Hai công thức này kéo về sớm vì màn WF-03 dựng nguyên ví dụ trên P/E: giá 92.000 ₫,
 * EPS 6.050 ₫ → 15,2 lần. Không có chúng thì gói 3.2.1 không có gì để lắp.
 *
 * Đặt ở nhóm 'fundamentals' chứ không phải 'valuation': wireframe WF-02 và WF-03 đều ghi
 * P/E và P/B thuộc "Chỉ số DN". Chỗ nào wireframe và bảng WBS lệch nhau thì theo wireframe,
 * vì đó là thứ người dùng nhìn thấy.
 *
 * P/E khi doanh nghiệp lỗ là ca WF-15 nêu đích danh: không trả số âm vô nghĩa mà báo lỗi
 * kèm gợi ý chuyển sang P/B.
 */

import { ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import { divideByZero, meaningless } from '../warnings';
import { SOURCE_CFA, SOURCE_VAS, numberVar } from './shared';

/*
 * ── P/E ────────────────────────────────────────────────────────────────────────────────
 */

export const PE: FormulaModule = {
  spec: {
    id: 'pe',
    categoryId: 'fundamentals',
    name: { vi: 'P/E — hệ số giá trên lợi nhuận', en: 'Price to earnings ratio' },
    description: 'Nhà đầu tư trả bao nhiêu đồng cho mỗi đồng lợi nhuận của doanh nghiệp.',
    latex: 'P/E = \\frac{P}{EPS}',
    expression: 'P/E = Giá thị trường ÷ EPS',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['pe', 'p e', 'gia tren loi nhuan', 'boi so', 'dinh gia'],
    resultUnit: 'lần',
    variables: [
      numberVar('price', 'Giá thị trường', '₫', 92_000, {
        min: 0,
        max: 10_000_000,
        description: 'Giá đóng cửa gần nhất của một cổ phiếu.',
      }),
      numberVar('eps', 'EPS — lợi nhuận trên mỗi cổ phiếu', '₫', 6_050, {
        min: -1_000_000,
        max: 1_000_000,
        description: 'Lợi nhuận sau thuế chia cho số cổ phiếu đang lưu hành.',
      }),
    ],
    explanation: {
      meaning:
        'Số năm lợi nhuận cần có để hoàn lại đúng số tiền đang bỏ ra mua cổ phiếu, nếu lợi nhuận giữ nguyên.',
      whenToUse: 'So sánh nhanh định giá giữa các doanh nghiệp cùng ngành, cùng giai đoạn.',
      howToRead:
        'P/E cao nghĩa là thị trường kỳ vọng tăng trưởng lớn, hoặc cổ phiếu đang đắt. Thấp thì rẻ, hoặc đang có rủi ro.',
      commonMistakes:
        'So P/E giữa hai ngành khác nhau, hoặc dùng P/E cho doanh nghiệp có lợi nhuận bất thường hay đang lỗ.',
    },
    example: {
      title: 'Giá 92.000 ₫, EPS 6.050 ₫',
      inputs: { price: 92_000, eps: 6_050 },
      expected: 15.21,
      note: 'Cao hơn trung bình ngành thì thị trường đang kỳ vọng tăng trưởng.',
    },
    tests: [
      { name: 'ví dụ WF-03', inputs: { price: 92_000, eps: 6_050 }, expected: 15.21 },
      {
        name: 'EPS bằng 0 — ca chia cho 0 của WF-15',
        inputs: { price: 92_000, eps: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'EPS âm — không trả số âm vô nghĩa (WF-15)',
        inputs: { price: 92_000, eps: -1_200 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const eps = v('eps');

    if (eps === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          'P/E',
          'EPS',
          'Nhập EPS khác 0 hoặc chọn kỳ khác. Doanh nghiệp không có lợi nhuận trên mỗi cổ phiếu ở kỳ này.',
        ),
      };
    }

    if (eps < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          'P/E không có ý nghĩa khi doanh nghiệp đang lỗ.',
          'Dùng P/B hoặc P/S để thay thế.',
        ),
      };
    }

    return ok(v('price') / eps, 'lần');
  },
};

/*
 * ── P/B ────────────────────────────────────────────────────────────────────────────────
 */

export const PB: FormulaModule = {
  spec: {
    id: 'pb',
    categoryId: 'fundamentals',
    name: { vi: 'P/B — hệ số giá trên giá trị sổ sách', en: 'Price to book ratio' },
    description: 'Thị giá đang gấp bao nhiêu lần giá trị sổ sách của một cổ phiếu.',
    latex: 'P/B = \\frac{P}{BVPS}',
    expression: 'P/B = Giá thị trường ÷ Giá trị sổ sách mỗi cổ phiếu',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['pb', 'p b', 'gia tren gia tri so sach', 'boi so'],
    resultUnit: 'lần',
    variables: [
      numberVar('price', 'Giá thị trường', '₫', 92_000, { min: 0, max: 10_000_000 }),
      numberVar('bookValuePerShare', 'Giá trị sổ sách / CP', '₫', 24_800, {
        min: -1_000_000,
        max: 10_000_000,
        description: 'Vốn chủ sở hữu chia cho số cổ phiếu đang lưu hành.',
      }),
    ],
    explanation: {
      meaning:
        'Mỗi đồng vốn chủ sở hữu ghi trên sổ sách đang được thị trường trả giá bao nhiêu đồng.',
      whenToUse:
        'Khi doanh nghiệp đang lỗ nên P/E không dùng được, hoặc với ngân hàng và công ty nhiều tài sản.',
      howToRead:
        'Dưới 1 nghĩa là thị giá thấp hơn giá trị sổ sách — có thể rẻ, cũng có thể do thị trường nghi ngờ chất lượng tài sản.',
      commonMistakes:
        'Áp dụng cho doanh nghiệp công nghệ hay dịch vụ, nơi giá trị nằm ở thương hiệu và con người chứ không ở sổ sách.',
    },
    example: {
      title: 'Giá 92.000 ₫, giá trị sổ sách 24.800 ₫/CP',
      inputs: { price: 92_000, bookValuePerShare: 24_800 },
      expected: 3.71,
    },
    tests: [
      {
        name: 'ca thường',
        inputs: { price: 92_000, bookValuePerShare: 24_800 },
        expected: 3.71,
      },
      {
        name: 'giá trị sổ sách bằng 0',
        inputs: { price: 92_000, bookValuePerShare: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'vốn chủ sở hữu âm thì bội số không có ý nghĩa',
        inputs: { price: 92_000, bookValuePerShare: -5_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const bvps = v('bookValuePerShare');

    if (bvps === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero('P/B', 'Giá trị sổ sách / CP', 'Nhập giá trị sổ sách khác 0.'),
      };
    }

    if (bvps < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          'P/B không có ý nghĩa khi vốn chủ sở hữu đang âm.',
          'Doanh nghiệp đang lỗ luỹ kế vượt vốn góp. Xem lại báo cáo tài chính trước khi định giá.',
        ),
      };
    }

    return ok(v('price') / bvps, 'lần');
  },
};

export const MULTIPLE_FORMULAS: ReadonlyArray<FormulaModule> = [PE, PB];
