/**
 * Khung "cách tính" của nhóm `src/core/formulas/fees.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * Ba lằn ranh của nhóm này:
 *
 * - Mức phí và thuế tra từ biểu phí (`rateOf`/`constantOf`) là `hang-so-bieu-phi`, không có khung:
 *   khối hằng số cuối khối Số liệu đã in nhãn, trị số và căn cứ của chúng.
 * - Khoản TIỀN mà `calc` nhân ra từ các mức ấy (phí mua, phí bán, thuế chuyển nhượng, phí lưu ký) là
 *   `derived`, và trỏ tới công thức riêng của đúng khoản đó.
 * - Dòng bảng mà chính nó là một phép tính viết sẵn trên hình (tổng chi phí, vốn thực bỏ ra,
 *   `1 - r_{ban} - r_{thue}`) là `da-hien-trong-hinh`: từng số hạng đã có khung riêng, khung của cả
 *   tổng chỉ chép lại phép cộng đang nằm trên hình.
 */

import type { FormulaHowTo, HowToStep } from './types';

/*
 * ── Bốn khoản tiền dùng chung ──────────────────────────────────────────────────────────────────────
 * Hình và dòng chữ chép từ chính bốn công thức phí, thuế cùng nhóm, để ba công thức gộp phí bên dưới
 * không tả cùng một khoản theo hai cách. Đổi `totalCostOf()` hay `breakEvenPrice()` thì đọc lại bốn
 * bước này.
 */

/** Phí mua — `phi-giao-dich-mua`. */
const PHI_MUA: HowToStep = {
  latex: 'F_{mua} = Q \\times P_{mua} \\times r_{mua}',
  expression: {
    vi: 'Phí mua = Khối lượng × Giá mua × Tỷ lệ phí mua',
    en: 'Buy fee = Quantity × Buy price × Buy fee rate',
  },
};

/** Phí bán — `phi-giao-dich-ban`. */
const PHI_BAN: HowToStep = {
  latex: 'F_{ban} = Q \\times P_{ban} \\times r_{ban}',
  expression: {
    vi: 'Phí bán = Khối lượng × Giá bán × Tỷ lệ phí bán',
    en: 'Sell fee = Quantity × Sell price × Sell fee rate',
  },
};

/** Thuế chuyển nhượng khi bán — `thue-chuyen-nhuong`. */
const THUE_BAN: HowToStep = {
  latex: 'T = Q \\times P_{ban} \\times r_{thue}',
  expression: {
    vi: 'Thuế chuyển nhượng = Khối lượng × Giá bán × Thuế suất chuyển nhượng',
    en: 'Transfer tax = Quantity × Sell price × Transfer tax rate',
  },
};

/** Phí lưu ký cả kỳ nắm giữ — `phi-luu-ky`. */
const PHI_LUU_KY: HowToStep = {
  latex: 'F_{lk} = Q \\times M \\times c',
  expression: {
    vi: 'Phí lưu ký = Khối lượng × Số tháng nắm giữ × Mức phí mỗi cổ phiếu mỗi tháng',
    en: 'Custody fee = Quantity × Holding period × Rate per share per month',
  },
};

export const HOW_TO_FEES: Readonly<Record<string, FormulaHowTo>> = {
  'phi-giao-dich-mua': {
    entries: [],
    skipped: {
      'F_{mua}': 'ket-qua',
      Q: 'nhap-tho',
      'P_{mua}': 'nhap-tho',
      'r_{mua}': 'hang-so-bieu-phi',
    },
    whyNone:
      'Hình nhân thẳng hai số gõ tay (khối lượng, giá mua) với tỷ lệ phí tra từ biểu phí, không có đại lượng nào phải tính trước.',
  },

  'phi-giao-dich-ban': {
    entries: [],
    skipped: {
      'F_{ban}': 'ket-qua',
      Q: 'nhap-tho',
      'P_{ban}': 'nhap-tho',
      'r_{ban}': 'hang-so-bieu-phi',
    },
    whyNone:
      'Hình nhân thẳng hai số gõ tay (khối lượng, giá bán) với tỷ lệ phí tra từ biểu phí, không có đại lượng nào phải tính trước.',
  },

  'thue-chuyen-nhuong': {
    entries: [],
    skipped: {
      T: 'ket-qua',
      Q: 'nhap-tho',
      'P_{ban}': 'nhap-tho',
      'r_{thue}': 'hang-so-bieu-phi',
    },
    whyNone:
      'Hình nhân thẳng hai số gõ tay (khối lượng, giá bán) với thuế suất tra từ biểu phí, không có đại lượng nào phải tính trước.',
  },

  'thue-co-tuc': {
    entries: [],
    skipped: {
      'T_{ct}': 'ket-qua',
      Q: 'nhap-tho',
      D: 'nhap-tho',
      'r_{ct}': 'hang-so-bieu-phi',
    },
    whyNone:
      'Hình nhân thẳng hai số gõ tay (khối lượng, cổ tức mỗi cổ phiếu) với thuế suất tra từ biểu phí, không có đại lượng nào phải tính trước.',
  },

  'phi-luu-ky': {
    entries: [],
    skipped: {
      'F_{lk}': 'ket-qua',
      Q: 'nhap-tho',
      M: 'nhap-tho',
      c: 'hang-so-bieu-phi',
    },
    whyNone:
      'Hình nhân thẳng hai số gõ tay (khối lượng, số tháng nắm giữ) với mức phí tra từ biểu phí, không có đại lượng nào phải tính trước.',
  },

  'gia-hoa-von': {
    entries: [
      {
        kind: 'derived',
        symbol: 'F_{mua}',
        phrases: { vi: ['Phí mua'], en: ['Buy fee'] },
        // `breakEvenPrice()` gộp phí mua vào tiền mua thành Q × P_mua × (1 + r_mua); tách riêng phí
        // mua ra vẫn đúng con số ấy.
        steps: [PHI_MUA],
        calcEvidence: ["q * v('buyPrice') * (1 + rBuy)"],
        formulaId: 'phi-giao-dich-mua',
      },
      {
        kind: 'derived',
        symbol: 'F_{lk}',
        phrases: { vi: ['Phí lưu ký'], en: ['Custody fee'] },
        steps: [PHI_LUU_KY],
        calcEvidence: ["q * v('months') * custody.value"],
        formulaId: 'phi-luu-ky',
      },
    ],
    skipped: {
      'P_{hv}': 'ket-qua',
      Q: 'nhap-tho',
      'P_{mua}': 'nhap-tho',
      M: 'nhap-tho',
      'r_{ban}': 'hang-so-bieu-phi',
      'r_{thue}': 'hang-so-bieu-phi',
      '1 - r_{ban} - r_{thue}': 'da-hien-trong-hinh',
    },
  },

  'loi-nhuan-rong': {
    entries: [
      {
        kind: 'derived',
        symbol: 'F_{mua}',
        steps: [PHI_MUA],
        calcEvidence: ["const feeBuy = q * v('buyPrice') * rBuy"],
        formulaId: 'phi-giao-dich-mua',
      },
      {
        kind: 'derived',
        symbol: 'F_{ban}',
        steps: [PHI_BAN],
        calcEvidence: ["const feeSell = q * v('sellPrice') * rSell"],
        formulaId: 'phi-giao-dich-ban',
      },
      {
        kind: 'derived',
        symbol: 'T',
        steps: [THUE_BAN],
        calcEvidence: ["const tax = q * v('sellPrice') * rTax"],
        formulaId: 'thue-chuyen-nhuong',
      },
      {
        kind: 'derived',
        symbol: 'F_{lk}',
        steps: [PHI_LUU_KY],
        calcEvidence: ["const feeCustody = q * v('months') * custody.value"],
        formulaId: 'phi-luu-ky',
      },
    ],
    skipped: {
      'L_{rong}': 'ket-qua',
      Q: 'nhap-tho',
      'P_{ban}': 'nhap-tho',
      'P_{mua}': 'nhap-tho',
      M: 'nhap-tho',
      'F_{mua} + F_{ban} + T + F_{lk}': 'da-hien-trong-hinh',
    },
  },

  'roi-rong': {
    entries: [
      {
        kind: 'derived',
        symbol: 'L_{rong}',
        phrases: { vi: ['Lợi nhuận ròng'], en: ['Net profit'] },
        // Phí bán và thuế không có dòng trong bảng ký hiệu của ROI ròng, nên hai bước đầu tả chúng;
        // phí mua và phí lưu ký đã có khung riêng ngay trên hình.
        steps: [
          PHI_BAN,
          THUE_BAN,
          {
            latex: 'L_{rong} = Q\\,(P_{ban} - P_{mua}) - (F_{mua} + F_{ban} + T + F_{lk}(M))',
            expression: {
              vi: 'Lợi nhuận ròng = Khối lượng × (Giá bán − Giá mua) − (Phí mua + Phí bán + Thuế chuyển nhượng + Phí lưu ký)',
              en: 'Net profit = Quantity × (Sell price − Buy price) − (Buy fee + Sell fee + Transfer tax + Custody fee)',
            },
          },
        ],
        calcEvidence: [
          "const gross = v('quantity') * (v('sellPrice') - v('buyPrice'))",
          'const net = gross - costs.total',
          'total: feeBuy + feeSell + tax + feeCustody',
        ],
        formulaId: 'loi-nhuan-rong',
      },
      {
        kind: 'derived',
        symbol: 'F_{mua}',
        steps: [PHI_MUA],
        calcEvidence: ["const feeBuy = q * v('buyPrice') * rBuy"],
        formulaId: 'phi-giao-dich-mua',
      },
      {
        kind: 'derived',
        symbol: 'F_{lk}',
        steps: [PHI_LUU_KY],
        calcEvidence: ["const feeCustody = q * v('months') * custody.value"],
        formulaId: 'phi-luu-ky',
      },
    ],
    skipped: {
      'ROI_{rong}': 'ket-qua',
      Q: 'nhap-tho',
      'P_{mua}': 'nhap-tho',
      M: 'nhap-tho',
      'Q \\cdot P_{mua} + F_{mua} + F_{lk}': 'da-hien-trong-hinh',
      '100': 'hang-so',
    },
  },
};
