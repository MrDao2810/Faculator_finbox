/**
 * Khung "cách tính" của nhóm `src/core/formulas/valuation-multiples.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * Mười công thức này chỉ nhân, chia, cộng trừ các ô gõ tay, nên `calc` không tự tính đại lượng nào
 * trước khi thay vào hình: không có khung `derived`. Phần lớn khung là `linked`, vì EV, vốn hoá,
 * P/E, EPS và BVPS đều là kết quả của một công thức khác trong thư viện. Hai khung `defined` là
 * doanh thu trên mỗi cổ phiếu và EBITDA: người mới không đọc thẳng được trên báo cáo, và thư viện
 * chưa có công thức riêng cho chúng.
 */

import type { FormulaHowTo } from './types';

export const HOW_TO_VALUATION_MULTIPLES: Readonly<Record<string, FormulaHowTo>> = {
  /*
   * Bước viết theo đơn vị gốc (₫ chia cho số cổ phiếu), không kèm hệ số đổi đơn vị: không có ô nhập
   * nào ấn định doanh thu tính bằng tỷ ₫ hay số cổ phiếu tính bằng triệu.
   */
  ps: {
    entries: [
      {
        kind: 'defined',
        symbol: 'S_{ps}',
        phrases: { vi: ['Doanh thu trên mỗi cổ phiếu'], en: ['Revenue per share'] },
        steps: [
          {
            latex: 'S_{ps} = \\frac{\\text{Doanh thu}}{\\text{Số CP lưu hành}}',
            expression: {
              vi: 'Doanh thu trên mỗi cổ phiếu = Doanh thu thuần bốn quý gần nhất ÷ Số cổ phiếu lưu hành',
              en: 'Revenue per share = Net revenue over the last four quarters ÷ Shares outstanding',
            },
          },
        ],
      },
    ],
    skipped: { 'P/S': 'ket-qua', P: 'nhap-tho' },
  },

  ev: {
    entries: [
      {
        kind: 'linked',
        symbol: '\\text{Vốn hoá}',
        phrases: { vi: ['Vốn hoá thị trường'], en: ['Market capitalization'] },
        formulaId: 'von-hoa-thi-truong',
        variableKey: 'marketCap',
      },
    ],
    skipped: { EV: 'ket-qua', '\\text{Nợ vay}': 'nhap-tho', '\\text{Tiền mặt}': 'nhap-tho' },
  },

  'ev-ebitda': {
    entries: [
      {
        kind: 'linked',
        symbol: 'EV',
        phrases: { vi: ['Giá trị doanh nghiệp'], en: ['Enterprise value'] },
        formulaId: 'ev',
        variableKey: 'ev',
      },
      /*
       * Không khai cụm "EBITDA": dòng chữ có hai chỗ, và chỗ đầu nằm trong tên kết quả "EV/EBITDA".
       * Khai thì chạm vào tên kết quả cũng bật khung EBITDA, trong khi hình cố ý không gắn dấu vào
       * giữa một tên đã có dòng riêng (luật 5 của `mathml-marks.ts`).
       *
       * Hai bước đi từ những dòng đọc thẳng được trên báo cáo: lợi nhuận trước thuế và chi phí lãi vay
       * ở báo cáo kết quả kinh doanh, khấu hao ở báo cáo lưu chuyển tiền tệ.
       */
      {
        kind: 'defined',
        symbol: 'EBITDA',
        steps: [
          {
            latex: 'EBIT = \\text{LNTT} + \\text{Lãi vay}',
            expression: {
              vi: 'Lợi nhuận trước lãi vay và thuế EBIT = Lợi nhuận trước thuế + Chi phí lãi vay',
              en: 'Earnings before interest and tax EBIT = Profit before tax + Interest expense',
            },
          },
          {
            latex: 'EBITDA = EBIT + \\text{Khấu hao}',
            expression: {
              vi: 'EBITDA = EBIT + Khấu hao',
              en: 'EBITDA = EBIT + Depreciation and amortization',
            },
          },
        ],
      },
    ],
    skipped: { 'EV/EBITDA': 'ket-qua' },
  },

  'ev-sales': {
    entries: [
      {
        kind: 'linked',
        symbol: 'EV',
        phrases: { vi: ['Giá trị doanh nghiệp'], en: ['Enterprise value'] },
        formulaId: 'ev',
        variableKey: 'ev',
      },
    ],
    skipped: { 'EV/Sales': 'ket-qua', '\\text{Doanh thu}': 'nhap-tho' },
  },

  peg: {
    entries: [
      {
        kind: 'linked',
        symbol: 'P/E',
        phrases: { vi: ['P/E'], en: ['P/E'] },
        formulaId: 'pe',
        variableKey: 'pe',
      },
    ],
    skipped: { PEG: 'ket-qua', g: 'nhap-tho' },
  },

  'von-hoa-thi-truong': {
    entries: [],
    skipped: { '\\text{Vốn hoá}': 'ket-qua', P: 'nhap-tho', N: 'nhap-tho', '1000': 'hang-so' },
    whyNone:
      'Giá và số cổ phiếu lưu hành là số đọc thẳng trên bảng giá hay báo cáo, còn 1.000 chỉ là hệ số đổi triệu ₫ ra tỷ ₫.',
  },

  'so-graham': {
    entries: [
      {
        kind: 'linked',
        symbol: 'EPS',
        phrases: { vi: ['EPS'], en: ['EPS'] },
        formulaId: 'eps-co-ban',
        variableKey: 'eps',
      },
      {
        kind: 'linked',
        symbol: 'BVPS',
        phrases: { vi: ['Giá trị sổ sách mỗi cổ phiếu'], en: ['Book value per share'] },
        formulaId: 'bvps',
        variableKey: 'bvps',
      },
    ],
    skipped: { '\\text{Graham}': 'ket-qua', '22{,}5': 'hang-so' },
  },

  /*
   * `calc` có chia sẵn tài sản và nợ cho từng cổ phiếu, nhưng chỉ để vẽ thác nước (`extras`); hai số
   * ấy không phải dòng nào của bảng ký hiệu, và phép chia đã hiện trọn trong hình.
   */
  'ncav-tren-co-phieu': {
    entries: [],
    skipped: {
      NCAV: 'ket-qua',
      '\\text{TSNH}': 'nhap-tho',
      '\\text{Tổng nợ}': 'nhap-tho',
      N: 'nhap-tho',
      '1000': 'hang-so',
    },
    whyNone:
      'Tài sản ngắn hạn, tổng nợ phải trả và số cổ phiếu lưu hành đều đọc thẳng trên báo cáo tài chính, còn 1.000 chỉ là hệ số đổi đơn vị.',
  },

  'ty-suat-loi-nhuan-tren-gia': {
    entries: [
      {
        kind: 'linked',
        symbol: 'EPS',
        phrases: { vi: ['EPS'], en: ['EPS'] },
        formulaId: 'eps-co-ban',
        variableKey: 'eps',
      },
    ],
    skipped: { 'E/P': 'ket-qua', P: 'nhap-tho', '100\\%': 'hang-so' },
  },

  /*
   * P/E mục tiêu KHÔNG nối tới `pe`: đó là bội số người dùng tự chọn, không phải P/E hiện tại, và
   * docblock của công thức đã cố ý không dựng cạnh `pe → targetPe` vì đúng lý do ấy.
   */
  'gia-muc-tieu': {
    entries: [
      {
        kind: 'linked',
        symbol: 'EPS',
        phrases: { vi: ['EPS'], en: ['EPS'] },
        formulaId: 'eps-co-ban',
        variableKey: 'eps',
      },
    ],
    skipped: { 'P_{\\text{mục tiêu}}': 'ket-qua', 'P/E_{\\text{mục tiêu}}': 'nhap-tho' },
  },
};
