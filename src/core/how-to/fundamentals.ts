/**
 * Khung "cách tính" của nhóm `src/core/formulas/fundamentals.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * Cả mười một chỉ số là một phép chia (có khi kèm một phép trừ, × 100 hay × 10^9) giữa các số đọc
 * thẳng trên báo cáo tài chính hay thông báo chia cổ tức, và `calc` không tính thêm gì ngoài đúng phép
 * ấy. Nên gần như mọi dòng bảng ký hiệu là `nhap-tho`, và khung duy nhất của nhóm là EPS của hệ số chi
 * trả cổ tức: ô gõ tay ấy chính là kết quả của `eps-co-ban`.
 */

import type { FormulaHowTo } from './types';

export const HOW_TO_FUNDAMENTALS: Readonly<Record<string, FormulaHowTo>> = {
  'eps-co-ban': {
    entries: [],
    skipped: {
      EPS: 'ket-qua',
      '\\text{LNST}': 'nhap-tho',
      '\\text{Số CP lưu hành}': 'nhap-tho',
      '10^9': 'hang-so',
    },
    whyNone:
      'Lợi nhuận sau thuế, cổ tức ưu đãi và số cổ phiếu lưu hành đều đọc thẳng trên báo cáo tài chính, còn phép trừ, phép chia và hệ số 10^9 đổi tỷ ₫ ra ₫ đã hiện trọn trong hình.',
  },

  bvps: {
    entries: [],
    skipped: {
      BVPS: 'ket-qua',
      '\\text{Vốn chủ sở hữu}': 'nhap-tho',
      '\\text{Số CP lưu hành}': 'nhap-tho',
      '10^9': 'hang-so',
    },
    whyNone:
      'Vốn chủ sở hữu và số cổ phiếu lưu hành đều đọc thẳng trên báo cáo tài chính, còn phép chia và hệ số 10^9 đổi tỷ ₫ ra ₫ đã hiện trọn trong hình.',
  },

  roe: {
    entries: [],
    skipped: { ROE: 'ket-qua', '\\text{LNST}': 'nhap-tho', '100': 'hang-so' },
    whyNone:
      'Lợi nhuận sau thuế và vốn chủ sở hữu đều đọc thẳng trên báo cáo tài chính, và calc chỉ chia hai số ấy rồi nhân 100 đúng như hình.',
  },

  roa: {
    entries: [],
    skipped: { ROA: 'ket-qua', '\\text{LNST}': 'nhap-tho', '100': 'hang-so' },
    whyNone:
      'Lợi nhuận sau thuế và tổng tài sản đều đọc thẳng trên báo cáo tài chính, và calc chỉ chia hai số ấy rồi nhân 100 đúng như hình.',
  },

  'bien-loi-nhuan-rong': {
    entries: [],
    skipped: { ROS: 'ket-qua', '\\text{LNST}': 'nhap-tho', '100': 'hang-so' },
    whyNone:
      'Lợi nhuận sau thuế và doanh thu thuần đều đọc thẳng trên báo cáo kết quả kinh doanh, và calc chỉ chia hai số ấy rồi nhân 100 đúng như hình.',
  },

  'bien-loi-nhuan-gop': {
    entries: [],
    skipped: {
      '\\text{Biên gộp}': 'ket-qua',
      '\\text{Doanh thu}': 'nhap-tho',
      '\\text{Giá vốn}': 'nhap-tho',
      '100': 'hang-so',
    },
    whyNone:
      'Doanh thu thuần và giá vốn hàng bán đều đọc thẳng trên báo cáo kết quả kinh doanh, còn phép trừ ra lợi nhuận gộp và phép chia nhân 100 đã hiện trọn trong hình.',
  },

  /*
   * `D` là TỔNG nợ phải trả, một dòng có sẵn trên bảng cân đối kế toán, không phải riêng nợ vay có
   * lãi (docblock ô `totalLiabilities` ở file công thức). Đọc thẳng được, nên `nhap-tho`.
   */
  'no-tren-von-chu': {
    entries: [],
    skipped: { 'D/E': 'ket-qua', D: 'nhap-tho', E: 'nhap-tho' },
    whyNone:
      'Tổng nợ phải trả và vốn chủ sở hữu đều đọc thẳng trên bảng cân đối kế toán, và calc chỉ chia hai số ấy đúng như hình.',
  },

  'thanh-toan-hien-hanh': {
    entries: [],
    skipped: { '\\text{Current ratio}': 'ket-qua' },
    whyNone:
      'Tài sản ngắn hạn và nợ ngắn hạn đều đọc thẳng trên bảng cân đối kế toán, và calc chỉ chia hai số ấy đúng như hình.',
  },

  'thanh-toan-nhanh': {
    entries: [],
    skipped: { '\\text{Quick ratio}': 'ket-qua' },
    whyNone:
      'Tài sản ngắn hạn, hàng tồn kho và nợ ngắn hạn đều đọc thẳng trên bảng cân đối kế toán, còn phép trừ tồn kho và phép chia đã hiện trọn trong hình.',
  },

  'vong-quay-tong-tai-san': {
    entries: [],
    skipped: { '\\text{Vòng quay}': 'ket-qua' },
    whyNone:
      'Doanh thu thuần và tổng tài sản đều đọc thẳng trên báo cáo tài chính, và calc chỉ chia hai số ấy đúng như hình.',
  },

  /*
   * EPS là ô gõ tay (₫) mà thư viện có công thức riêng cùng đơn vị kết quả, nên `linked`.
   *
   * DPS thì `nhap-tho`, không phải `defined`: thông báo chia cổ tức ghi sẵn số đồng mỗi cổ phiếu
   * nhận, và thư viện không có công thức nào ra con số ấy.
   */
  'ty-le-chi-tra-co-tuc': {
    entries: [
      {
        kind: 'linked',
        symbol: 'EPS',
        phrases: { vi: ['EPS'], en: ['EPS'] },
        formulaId: 'eps-co-ban',
        variableKey: 'eps',
      },
    ],
    skipped: { '\\text{Payout}': 'ket-qua', DPS: 'nhap-tho', '100': 'hang-so' },
  },
};
