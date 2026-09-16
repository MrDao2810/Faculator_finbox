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
    description: {
      vi: 'Nhà đầu tư trả bao nhiêu đồng cho mỗi đồng lợi nhuận của doanh nghiệp.',
      en: "How many dong an investor pays for each dong of the company's profit.",
    },
    latex: 'P/E = \\frac{P}{EPS}',
    expression: {
      vi: 'P/E = Giá thị trường ÷ EPS',
      en: 'P/E = Market price ÷ EPS',
    },
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['pe', 'p e', 'gia tren loi nhuan', 'boi so', 'dinh gia'],
    resultUnit: 'lần',
    variables: [
      numberVar('price', { vi: 'Giá thị trường', en: 'Market price' }, '₫', 92_000, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Giá đóng cửa gần nhất của một cổ phiếu.',
          en: 'The most recent closing price of a share.',
        },
      }),
      numberVar(
        'eps',
        { vi: 'EPS — lợi nhuận trên mỗi cổ phiếu', en: 'EPS — earnings per share' },
        '₫',
        6_050,
        {
          min: -1_000_000,
          max: 1_000_000,
          description: {
            vi: 'Lợi nhuận sau thuế chia cho số cổ phiếu đang lưu hành.',
            en: 'Profit after tax divided by the number of shares outstanding.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Số năm lợi nhuận cần có để hoàn lại đúng số tiền đang bỏ ra mua cổ phiếu, nếu lợi nhuận giữ nguyên.',
        en: 'The number of years of profit needed to recoup the money spent buying the share, if profit stays unchanged.',
      },
      whenToUse: {
        vi: 'So sánh nhanh định giá giữa các doanh nghiệp cùng ngành, cùng giai đoạn.',
        en: 'For a quick valuation comparison between companies in the same industry and the same period.',
      },
      howToRead: {
        vi: 'P/E cao nghĩa là thị trường kỳ vọng tăng trưởng lớn, hoặc cổ phiếu đang đắt. Thấp thì rẻ, hoặc đang có rủi ro.',
        en: 'A high P/E means the market expects strong growth, or the share is expensive. A low P/E means it is cheap, or carries risk.',
      },
      commonMistakes: {
        vi: 'So P/E giữa hai ngành khác nhau, hoặc dùng P/E cho doanh nghiệp có lợi nhuận bất thường hay đang lỗ.',
        en: 'Comparing P/E across two different industries, or using P/E for a company with unusual profit or one that is posting a loss.',
      },
    },
    example: {
      title: {
        vi: 'FPT — giá 72.700 ₫ phiên 11/09/2026, EPS bốn quý gần nhất 5.867 ₫',
        en: 'FPT — price 72,700 ₫ at the 2026-09-11 close, trailing four-quarter EPS 5,867 ₫',
      },
      inputs: { price: 72_700, eps: 5_867 },
      expected: 12.3913,
      note: {
        vi: 'Thị trường đang trả khoảng 12,4 đồng cho mỗi đồng lợi nhuận một năm của FPT, thấp hơn hẳn vùng 20–25 lần giai đoạn 2023–2024. Lưu ý về nền so sánh: EPS bốn quý gần nhất vẫn còn phần FPT Telecom của các quý 2025, trong khi từ 2026 khoản này không còn hợp nhất.',
        en: 'The market is paying about 12.4 dong for each dong of FPT’s annual profit, well below the 20–25x band of 2023–2024. A caveat on the comparison base: trailing four-quarter EPS still carries FPT Telecom for the 2025 quarters, while from 2026 that unit is no longer consolidated.',
      },
      source: {
        vi: 'Giá FPT (mã FPT) phiên 11/09/2026; EPS bốn quý gần nhất theo báo cáo tài chính quý 2/2026.',
        en: 'FPT (ticker FPT) price at the 2026-09-11 close; trailing four-quarter EPS from the Q2/2026 financial statements.',
      },
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
          { vi: 'P/E', en: 'P/E' },
          { vi: 'EPS', en: 'EPS' },
          {
            vi: 'Nhập EPS khác 0 hoặc chọn kỳ khác. Doanh nghiệp không có lợi nhuận trên mỗi cổ phiếu ở kỳ này.',
            en: 'Enter a non-zero EPS or choose another period. The company has no earnings per share for this period.',
          },
        ),
      };
    }

    if (eps < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          {
            vi: 'P/E không có ý nghĩa khi doanh nghiệp đang lỗ.',
            en: 'P/E is not meaningful when the company is posting a loss.',
          },
          {
            vi: 'Dùng P/B hoặc P/S để thay thế.',
            en: 'Use P/B or P/S instead.',
          },
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
    description: {
      vi: 'Thị giá đang gấp bao nhiêu lần giá trị sổ sách của một cổ phiếu.',
      en: 'How many times the market price is above the book value of a share.',
    },
    latex: 'P/B = \\frac{P}{BVPS}',
    expression: {
      vi: 'P/B = Giá thị trường ÷ Giá trị sổ sách mỗi cổ phiếu',
      en: 'P/B = Market price ÷ Book value per share',
    },
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['pb', 'p b', 'gia tren gia tri so sach', 'boi so'],
    resultUnit: 'lần',
    variables: [
      numberVar('price', { vi: 'Giá thị trường', en: 'Market price' }, '₫', 92_000, {
        min: 0,
        max: 10_000_000,
      }),
      numberVar(
        'bookValuePerShare',
        { vi: 'Giá trị sổ sách / CP', en: 'Book value / share' },
        '₫',
        24_800,
        {
          min: -1_000_000,
          max: 10_000_000,
          description: {
            vi: 'Vốn chủ sở hữu chia cho số cổ phiếu đang lưu hành.',
            en: "Shareholders' equity divided by the number of shares outstanding.",
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Mỗi đồng vốn chủ sở hữu ghi trên sổ sách đang được thị trường trả giá bao nhiêu đồng.',
        en: 'How many dong the market pays for each dong of equity recorded on the books.',
      },
      whenToUse: {
        vi: 'Khi doanh nghiệp đang lỗ nên P/E không dùng được, hoặc với ngân hàng và công ty nhiều tài sản.',
        en: 'When the company is posting a loss so P/E cannot be used, or for banks and asset-heavy companies.',
      },
      howToRead: {
        vi: 'Dưới 1 nghĩa là thị giá thấp hơn giá trị sổ sách — có thể rẻ, cũng có thể do thị trường nghi ngờ chất lượng tài sản.',
        en: 'Below 1 means the market price is lower than book value — it may be cheap, or the market may doubt the quality of the assets.',
      },
      commonMistakes: {
        vi: 'Áp dụng cho doanh nghiệp công nghệ hay dịch vụ, nơi giá trị nằm ở thương hiệu và con người chứ không ở sổ sách.',
        en: 'Applying it to technology or service companies, where value lies in the brand and people rather than on the books.',
      },
    },
    example: {
      title: {
        vi: 'FPT — giá 72.700 ₫ phiên 11/09/2026, giá trị sổ sách 23.246 ₫/CP',
        en: 'FPT — price 72,700 ₫ at the 2026-09-11 close, book value 23,246 ₫/share',
      },
      inputs: { price: 72_700, bookValuePerShare: 23_246 },
      expected: 3.1274,
      note: {
        vi: 'Giá trị của một doanh nghiệp công nghệ nằm ở con người và hợp đồng chứ không ở tài sản ghi trên sổ, nên P/B của FPT luôn cao hơn nhóm sản xuất và không đặt cạnh HPG hay VNM để so được. Phần vốn chủ sở hữu thực sự đứng sau mỗi cổ phiếu chỉ bằng chưa tới một phần ba thị giá.',
        en: 'A technology company’s value sits in its people and contracts rather than in assets on the books, so FPT’s P/B is structurally above manufacturers and cannot be read against HPG or VNM. The equity actually standing behind each share is under a third of the market price.',
      },
      source: {
        vi: 'Giá FPT (mã FPT) phiên 11/09/2026; vốn chủ sở hữu 39.851,5 tỷ ₫ trên 1.714.326.422 CP theo báo cáo tài chính quý 2/2026.',
        en: 'FPT (ticker FPT) price at the 2026-09-11 close; equity of 39,851.5 billion ₫ over 1,714,326,422 shares from the Q2/2026 financial statements.',
      },
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
        warning: divideByZero(
          { vi: 'P/B', en: 'P/B' },
          { vi: 'Giá trị sổ sách / CP', en: 'Book value / share' },
          { vi: 'Nhập giá trị sổ sách khác 0.', en: 'Enter a non-zero book value.' },
        ),
      };
    }

    if (bvps < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          {
            vi: 'P/B không có ý nghĩa khi vốn chủ sở hữu đang âm.',
            en: "P/B is not meaningful when shareholders' equity is negative.",
          },
          {
            vi: 'Doanh nghiệp đang lỗ luỹ kế vượt vốn góp. Xem lại báo cáo tài chính trước khi định giá.',
            en: 'The company has accumulated losses exceeding contributed capital. Review the financial statements before valuing it.',
          },
        ),
      };
    }

    return ok(v('price') / bvps, 'lần');
  },
};

export const MULTIPLE_FORMULAS: ReadonlyArray<FormulaModule> = [PE, PB];
