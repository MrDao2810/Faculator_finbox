/**
 * Khung "cách tính" của nhóm `src/core/formulas/valuation-dcf.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * Không có khung `derived` nào: `calc` của cả mười công thức chỉ làm đúng phép tính của hình, cộng
 * việc đổi ô gõ theo % ra tỷ lệ (hình đã viết dạng tỷ lệ) và làm tròn số năm của thanh trượt vốn đã
 * đi từng bước 1. Những gì `calc` tính riêng (tổng nguồn vốn E + D, hệ số (1 − t), (1 + r)^n, giá
 * trị doanh nghiệp) đều là một dòng bảng ký hiệu đã hiện trọn trong hình.
 *
 * Khung `linked` gồm đủ sáu cạnh `dependsOn` của Registry, cộng ba ô gõ tay mà thư viện có công thức
 * ra cùng đơn vị: r của DDM hai giai đoạn (CAPM), β của CAPM (Beta) và E của WACC (Vốn hoá).
 *
 * Khung `defined` là năm chỉ số không nằm sẵn trên một dòng báo cáo nào: ERP, EBIT, ΔNWC, vay ròng
 * mới ΔB và nợ vay ròng.
 */

import type { FormulaHowTo } from './types';

export const HOW_TO_VALUATION_DCF: Readonly<Record<string, FormulaHowTo>> = {
  /*
   * `r` nhận thẳng kết quả CAPM (cạnh `dependsOn`). Cổ tức vừa trả đọc trên thông báo chia cổ tức,
   * còn g là tăng trưởng người dùng tự ước.
   */
  'mo-hinh-gordon': {
    entries: [
      {
        kind: 'linked',
        symbol: 'r',
        phrases: { vi: ['r'], en: ['r'] },
        formulaId: 'capm',
        variableKey: 'requiredReturn',
      },
    ],
    skipped: { V_0: 'ket-qua', D_0: 'nhap-tho', g: 'nhap-tho' },
  },

  /*
   * Registry không có cạnh `dependsOn` cho `r` ở đây, nhưng ô ấy cùng nghĩa, cùng đơn vị % và cùng
   * lời dặn "thường lấy từ CAPM" với `r` của Gordon, nên cũng trỏ về CAPM. `calc` làm tròn số năm,
   * mà thanh trượt đã đi từng bước 1, nên `n` vẫn là số gõ thẳng.
   */
  'ddm-hai-giai-doan': {
    entries: [{ kind: 'linked', symbol: 'r', formulaId: 'capm', variableKey: 'requiredReturn' }],
    skipped: {
      V_0: 'ket-qua',
      t: 'chi-so-chay',
      n: 'nhap-tho',
      D_0: 'nhap-tho',
      g_1: 'nhap-tho',
      g_2: 'nhap-tho',
    },
  },

  /*
   * ERP theo định nghĩa là lợi suất kỳ vọng của thị trường trừ lãi suất phi rủi ro. Người dùng
   * thường chép một con số công bố sẵn (bảng phần bù rủi ro quốc gia của Damodaran), nhưng con số ấy
   * không đọc được trên bảng giá hay báo cáo nào, nên `defined`. Lãi suất phi rủi ro là lợi suất trái
   * phiếu Chính phủ đọc thẳng.
   */
  capm: {
    entries: [
      {
        kind: 'linked',
        symbol: '\\beta',
        phrases: { vi: ['Beta'], en: ['Beta'] },
        formulaId: 'beta',
        variableKey: 'beta',
      },
      {
        kind: 'defined',
        symbol: 'ERP',
        phrases: { vi: ['Phần bù rủi ro thị trường'], en: ['Equity risk premium'] },
        steps: [
          {
            latex: 'ERP = E(R_m) - r_f',
            expression: {
              vi: 'Phần bù rủi ro thị trường = Lợi suất kỳ vọng của thị trường cổ phiếu − Lãi suất phi rủi ro',
              en: 'Equity risk premium = Expected return of the stock market − Risk-free rate',
            },
          },
        ],
      },
    ],
    skipped: { r_e: 'ket-qua', r_f: 'nhap-tho' },
  },

  /*
   * E là vốn chủ THEO GIÁ THỊ TRƯỜNG, tức vốn hoá (mô tả ô và lỗi thường gặp của chính công thức đều
   * nói vậy), và `von-hoa-thi-truong` ra cùng đơn vị tỷ ₫, nên `linked`.
   *
   * D là tổng hai dòng vay ngắn hạn và dài hạn trên bảng cân đối, đúng cách ô `totalDebt` của `ev`
   * coi là số đọc thẳng. r_d để `nhap-tho`: "lãi suất vay bình quân" không có một định nghĩa chuẩn
   * duy nhất (lợi suất trái phiếu, hay chi phí lãi vay chia nợ vay bình quân), nên không viết bước.
   */
  wacc: {
    entries: [
      { kind: 'linked', symbol: 'E', formulaId: 'von-hoa-thi-truong', variableKey: 'equity' },
      {
        kind: 'linked',
        symbol: 'r_e',
        phrases: { vi: ['Chi phí vốn chủ'], en: ['Cost of equity'] },
        formulaId: 'capm',
        variableKey: 'costEquity',
      },
    ],
    skipped: {
      WACC: 'ket-qua',
      D: 'nhap-tho',
      'E+D': 'da-hien-trong-hinh',
      r_d: 'nhap-tho',
      t: 'nhap-tho',
      '(1 - t)': 'da-hien-trong-hinh',
    },
  },

  /*
   * EBIT không có dòng riêng trên báo cáo kết quả kinh doanh theo VAS, nên cộng chi phí lãi vay lại
   * vào lợi nhuận trước thuế. Khấu hao và chi đầu tư TSCĐ thì có dòng sẵn trên báo cáo lưu chuyển
   * tiền tệ.
   *
   * Vốn lưu động ở đây KHÔNG gồm tiền và vay ngắn hạn, theo Damodaran và CFA: tiền đã được trừ trong
   * nợ vay ròng khi `gia-tri-noi-tai-fcff` đi từ giá trị doanh nghiệp xuống vốn chủ, còn vay ngắn hạn
   * là nguồn vốn chứ không phải vốn lưu động hoạt động. Để tiền nằm trong vốn lưu động thì mỗi đồng
   * tiền mặt để dành lại làm FCFF giảm, rồi bị trừ thêm lần nữa ở nợ vay ròng.
   */
  fcff: {
    entries: [
      {
        kind: 'defined',
        symbol: 'EBIT',
        phrases: { vi: ['EBIT'], en: ['EBIT'] },
        steps: [
          {
            latex: 'EBIT = \\text{LNTT} + \\text{Lãi vay}',
            expression: {
              vi: 'EBIT = Lợi nhuận trước thuế + Chi phí lãi vay',
              en: 'EBIT = Profit before tax + Interest expense',
            },
          },
        ],
      },
      {
        kind: 'defined',
        symbol: '\\Delta NWC',
        phrases: { vi: ['Tăng vốn lưu động ròng'], en: ['Increase in net working capital'] },
        steps: [
          {
            latex:
              'NWC = (\\text{TSNH} - \\text{Tiền mặt}) - (\\text{Nợ ngắn hạn} - \\text{Vay ngắn hạn})',
            expression: {
              vi: 'Vốn lưu động ròng = (Tài sản ngắn hạn − Tiền và tương đương tiền) − (Nợ ngắn hạn − Vay ngắn hạn)',
              en: 'Net working capital = (Current assets − Cash and cash equivalents) − (Current liabilities − Short-term debt)',
            },
          },
          {
            latex: '\\Delta NWC = NWC_{\\text{cuối}} - NWC_{\\text{đầu}}',
            expression: {
              vi: 'Tăng vốn lưu động ròng = Vốn lưu động ròng cuối kỳ − Vốn lưu động ròng đầu kỳ',
              en: 'Increase in net working capital = Net working capital at period end − Net working capital at period start',
            },
          },
        ],
      },
    ],
    skipped: {
      FCFF: 'ket-qua',
      t: 'nhap-tho',
      '(1 - t)': 'da-hien-trong-hinh',
      Dep: 'nhap-tho',
      CapEx: 'nhap-tho',
      '\\Delta': 'phep-toan',
    },
  },

  /*
   * FCFF nhận thẳng kết quả công thức FCFF (cạnh `dependsOn`). Vay ròng mới là hiệu hai dòng ở phần
   * lưu chuyển tiền từ hoạt động tài chính, không có dòng riêng; chi phí lãi vay thì có dòng sẵn trên
   * báo cáo kết quả kinh doanh.
   */
  fcfe: {
    entries: [
      {
        kind: 'linked',
        symbol: 'FCFF',
        phrases: { vi: ['FCFF'], en: ['FCFF'] },
        formulaId: 'fcff',
        variableKey: 'fcff',
      },
      {
        kind: 'defined',
        symbol: '\\Delta B',
        phrases: { vi: ['Vay ròng mới'], en: ['New net borrowing'] },
        steps: [
          {
            latex: '\\Delta B = \\text{Vay mới} - \\text{Trả nợ gốc}',
            expression: {
              vi: 'Vay ròng mới = Tiền thu từ đi vay − Tiền trả nợ gốc vay',
              en: 'New net borrowing = Proceeds from borrowings − Repayments of borrowings',
            },
          },
        ],
      },
    ],
    skipped: {
      FCFE: 'ket-qua',
      I: 'nhap-tho',
      t: 'nhap-tho',
      '(1 - t)': 'da-hien-trong-hinh',
      '\\Delta': 'phep-toan',
    },
  },

  /*
   * Hai cạnh `dependsOn`, hai khung `linked`. Giá trị doanh nghiệp là phân số con đã hiện trọn trong
   * hình. Nợ vay ròng không có dòng riêng trên bảng cân đối, nên `defined`, dựng từ đúng hai dòng mà
   * `ev` nhận làm ô nhập (nợ vay, tiền và tương đương tiền).
   */
  'gia-tri-noi-tai-fcff': {
    entries: [
      {
        kind: 'linked',
        symbol: 'FCFF',
        phrases: { vi: ['FCFF'], en: ['FCFF'] },
        formulaId: 'fcff',
        variableKey: 'fcff',
      },
      {
        kind: 'linked',
        symbol: 'WACC',
        phrases: { vi: ['WACC'], en: ['WACC'] },
        formulaId: 'wacc',
        variableKey: 'wacc',
      },
      {
        kind: 'defined',
        symbol: 'D_{\\text{ròng}}',
        phrases: { vi: ['Nợ vay ròng'], en: ['Net debt'] },
        steps: [
          {
            latex: 'D_{\\text{ròng}} = \\text{Nợ vay} - \\text{Tiền mặt}',
            expression: {
              vi: 'Nợ vay ròng = Nợ vay chịu lãi − Tiền và tương đương tiền',
              en: 'Net debt = Interest-bearing debt − Cash and cash equivalents',
            },
          },
        ],
      },
    ],
    skipped: {
      V_0: 'ket-qua',
      g: 'nhap-tho',
      '\\dfrac{FCFF \\, (1+g)}{WACC - g}': 'da-hien-trong-hinh',
      '\\text{Số CP}': 'nhap-tho',
      '1000': 'hang-so',
    },
  },

  /*
   * FV ở đây là số tiền người dùng đặt ra (mục tiêu, khoản sẽ nhận), không phải kết quả của công thức
   * Giá trị tương lai: trỏ sang đó thì hai công thức trỏ vòng vào nhau. Cùng lý do cho PV ở dưới.
   */
  'gia-tri-hien-tai': {
    entries: [],
    skipped: {
      PV: 'ket-qua',
      FV: 'nhap-tho',
      r: 'nhap-tho',
      n: 'nhap-tho',
      '(1 + r)^n': 'da-hien-trong-hinh',
    },
    whyNone:
      'Số tiền tương lai, tỷ lệ chiết khấu và số năm đều do người dùng tự gõ, còn hệ số lãi kép (1 + r)^n và phép chia đã hiện trọn trong hình.',
  },

  'gia-tri-tuong-lai': {
    entries: [],
    skipped: {
      FV: 'ket-qua',
      PV: 'nhap-tho',
      r: 'nhap-tho',
      n: 'nhap-tho',
      '(1 + r)^n': 'da-hien-trong-hinh',
    },
    whyNone:
      'Số tiền hiện tại, tỷ suất sinh lợi và số năm đều do người dùng tự gõ, còn hệ số lãi kép (1 + r)^n và phép nhân đã hiện trọn trong hình.',
  },

  /* V nhận thẳng kết quả mô hình Gordon (cạnh `dependsOn`); thị giá đọc trên bảng giá. */
  'bien-an-toan': {
    entries: [
      {
        kind: 'linked',
        symbol: 'V',
        phrases: { vi: ['Giá trị nội tại'], en: ['Intrinsic value'] },
        formulaId: 'mo-hinh-gordon',
        variableKey: 'intrinsic',
      },
    ],
    skipped: { MOS: 'ket-qua', P: 'nhap-tho', '100\\%': 'hang-so' },
  },
};
