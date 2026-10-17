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
import type { CalcOutput } from '../types';
import { divideByZero, meaningless } from '../warnings';
import { SOURCE_CFA, SOURCE_VAS, numberVar } from './shared';

/**
 * Giá thị trường bằng 0 thì bội số giá ra "0 lần" — một con số trông hợp lệ nhưng không nói gì về
 * doanh nghiệp nào (FR-06). Ô giá cho gõ 0 (`min: 0`), nên P/E, P/B và P/S phải tự chặn, như
 * `von-hoa-thi-truong` và E/P đã chặn. Thêm 16/10/2026, lượt rà công thức. Trả `null` khi giá dùng được.
 */
export function chanGiaKhongDuong(price: number, boiSo: string): CalcOutput | null {
  if (price > 0) return null;
  return {
    value: null,
    unit: 'lần',
    warning: meaningless(
      {
        vi: `Giá thị trường bằng 0 thì ${boiSo} không phản ánh giá trị nào.`,
        en: `A market price of zero means ${boiSo} does not reflect any real value.`,
      },
      {
        vi: 'Nhập giá đóng cửa gần nhất của cổ phiếu.',
        en: 'Enter the most recent closing price of the share.',
      },
    ),
  };
}

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
    substitution: '{price} ÷ {eps}',
    symbols: [
      {
        latex: 'P/E',
        meaning: { vi: 'hệ số giá trên lợi nhuận, lần', en: 'price to earnings ratio, times' },
      },
      {
        latex: 'P',
        meaning: { vi: 'giá thị trường của một cổ phiếu, ₫', en: 'market price of one share, ₫' },
      },
      {
        latex: 'EPS',
        meaning: { vi: 'lợi nhuận sau thuế trên mỗi cổ phiếu, ₫', en: 'earnings per share, ₫' },
      },
    ],
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
        vi: 'Dùng khi bạn đang xem một cổ phiếu và muốn biết giá của nó đắt hay rẻ so với lợi nhuận công ty làm ra, nhất là khi so hai công ty cùng ngành.',
        en: 'Use it when you are looking at a stock and want to know whether its price is expensive or cheap relative to the profit the company makes, especially when comparing two companies in the same industry.',
      },
      howToRead: {
        vi: 'So với P/E của các công ty cùng ngành ở cùng thời điểm: cao hơn nghĩa là thị trường đang trả đắt hơn cho mỗi đồng lợi nhuận, thường vì kỳ vọng công ty lớn nhanh, thấp hơn là rẻ hơn hoặc thị trường đang lo lợi nhuận sắp giảm.',
        en: 'Compared with the P/E of companies in the same industry at the same time: higher means the market is paying more for each dong of profit, usually because it expects fast growth, and lower means cheaper, or the market fears profit is about to fall.',
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
        vi: 'So với thị giá 72.700 ₫ của FPT: lãi bốn quý gần nhất của mỗi cổ phiếu là 5.867 ₫, nên P/E 12,39 lần nghĩa là bạn đang trả 12,39 đồng cho mỗi đồng lãi một năm, và nếu lãi giữ nguyên thì cần khoảng 12,4 năm lãi như thế mới bằng số tiền bỏ ra mua.',
        en: "Compared with FPT's price of 72,700 ₫: each share earned 5,867 ₫ over the last four quarters, so a P/E of 12.39 times means you are paying 12.39 dong for each dong of annual profit, and if profit holds steady it would take about 12.4 years of that profit to add up to the purchase price.",
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
      {
        name: 'giá 0 thì báo lỗi chứ không in "0 lần"',
        inputs: { price: 0, eps: 6_050 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const eps = v('eps');

    const giaKhongDuong = chanGiaKhongDuong(v('price'), 'P/E');
    if (giaKhongDuong !== null) return giaKhongDuong;

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
    substitution: '{price} ÷ {bookValuePerShare}',
    symbols: [
      {
        latex: 'P/B',
        meaning: { vi: 'hệ số giá trên giá trị sổ sách, lần', en: 'price to book ratio, times' },
      },
      {
        latex: 'P',
        meaning: { vi: 'giá thị trường của một cổ phiếu, ₫', en: 'market price of one share, ₫' },
      },
      {
        latex: 'BVPS',
        meaning: {
          vi: 'giá trị sổ sách mỗi cổ phiếu, bằng vốn chủ sở hữu chia số cổ phiếu, ₫',
          en: 'book value per share, equity divided by shares outstanding, ₫',
        },
      },
    ],
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
        vi: 'Dùng khi bạn xem cổ phiếu ngân hàng hay công ty nắm nhiều nhà xưởng, đất đai, kể cả khi lỗ, và muốn biết giá cổ phiếu đắt hay rẻ so với vốn cổ đông ghi trên sổ sách.',
        en: "Use it when you are looking at a bank, or a company that owns lots of factories and land, even one posting a loss, and want to know whether its share price is expensive or cheap relative to the shareholders' equity on its books.",
      },
      howToRead: {
        vi: 'So với mốc 1 lần: cao hơn 1 nghĩa là thị trường trả cho mỗi cổ phiếu nhiều hơn phần vốn cổ đông ghi trên sổ, thấp hơn 1 là trả ít hơn cả phần ấy, có thể vì đang rẻ, cũng có thể vì thị trường nghi tài sản trên sổ không đáng như ghi.',
        en: "Compared with the 1 mark: higher than 1 means the market pays more for each share than the shareholders' equity recorded on the books behind it, and lower than 1 means it pays less than even that, either because the stock is cheap or because the market doubts the assets are worth their book value.",
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
        vi: 'So với mốc 1 lần: P/B 3,13 lần nghĩa là thị trường trả 72.700 ₫ cho một cổ phiếu FPT chỉ có 23.246 ₫ vốn của cổ đông ghi trên sổ, gấp hơn ba lần. Giá trị của công ty công nghệ như FPT nằm nhiều ở con người và thương hiệu, thứ sổ sách không ghi, nên vượt mốc 1 lần chưa hẳn là đắt.',
        en: "Compared with the 1 times mark: a P/B of 3.13 times means the market pays 72,700 ₫ for an FPT share backed by only 23,246 ₫ of shareholders' equity on the books, more than three times as much. A technology company like FPT holds much of its value in people and brand, which the books do not record, so being above the 1 times mark does not by itself mean expensive.",
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
      {
        name: 'giá 0 thì báo lỗi chứ không in "0 lần"',
        inputs: { price: 0, bookValuePerShare: 25_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const bvps = v('bookValuePerShare');

    const giaKhongDuong = chanGiaKhongDuong(v('price'), 'P/B');
    if (giaKhongDuong !== null) return giaKhongDuong;

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
