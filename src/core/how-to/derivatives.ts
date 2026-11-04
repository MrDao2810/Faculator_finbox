/**
 * Khung "cách tính" của nhóm `src/core/formulas/derivatives.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * Cả bảy công thức đều KHÔNG có khung. Bảng ký hiệu của nhóm chỉ gồm kết quả, số đọc trên bảng điện
 * hay tự đặt (điểm, chỉ số, vốn, số hợp đồng, tỷ lệ ký quỹ, rủi ro mỗi lệnh…), hằng số 365, dấu làm
 * tròn và hệ số nhân. Mọi phép tính trung gian của `calc` (chi phí nắm giữ, ký quỹ một hợp đồng, số
 * tiền chịu rủi ro, mức lỗ mỗi hợp đồng, giá trị danh nghĩa) đều đã viết trọn trên hình.
 *
 * Hệ số nhân `m` đọc qua `constantOf(ctx, 'derivative.vn30f.multiplier')` nên là `hang-so-bieu-phi`:
 * nó không phải phí hay thuế, nhưng cùng đường tra, và khối hằng số cuối khối Số liệu đã in nó.
 *
 * Ba ô gõ tay đã cân nhắc cho `defined`/`linked` rồi để `nhap-tho`, vì bảng ký hiệu đã nói đủ:
 * - `E` (vốn thực có) là tiền ký quỹ cộng lãi lỗ đã bù trừ, màn tài khoản phái sinh hiện sẵn số này.
 * - `\Delta P` (khoảng cách cắt lỗ) là chênh giữa điểm vào lệnh và điểm cắt lỗ, cả hai do người dùng
 *   tự đặt.
 * - `q` (tỷ suất cổ tức rổ VN30) là số ước của cả rổ, không phải kết quả của `ty-suat-co-tuc` vốn
 *   tính cho MỘT cổ phiếu.
 */

import type { FormulaHowTo } from './types';

export const HOW_TO_DERIVATIVES: Readonly<Record<string, FormulaHowTo>> = {
  'gia-ly-thuyet-vn30f': {
    entries: [],
    skipped: {
      F: 'ket-qua',
      S: 'nhap-tho',
      r: 'nhap-tho',
      q: 'nhap-tho',
      d: 'nhap-tho',
      '365': 'hang-so',
    },
    whyNone:
      'Chỉ số cơ sở, lãi suất, tỷ suất cổ tức rổ VN30 và số ngày đến đáo hạn đều là số gõ tay, còn phần chi phí nắm giữ đã hiện trọn trong hình.',
  },

  'basis-vn30f': {
    entries: [],
    skipped: {
      Basis: 'ket-qua',
      F: 'nhap-tho',
      S: 'nhap-tho',
    },
    whyNone:
      'Basis là hiệu của hai số đọc thẳng trên bảng điện, giá hợp đồng và chỉ số cơ sở, nên không có đại lượng nào phải tính trước.',
  },

  'lai-lo-vi-the-long': {
    entries: [],
    skipped: {
      'PnL_{long}': 'ket-qua',
      'P_{dong}': 'nhap-tho',
      'P_{mo}': 'nhap-tho',
      m: 'hang-so-bieu-phi',
      N: 'nhap-tho',
    },
    whyNone:
      'Hình nhân thẳng chênh lệch hai mức điểm gõ tay với số hợp đồng gõ tay và hệ số nhân tra từ biểu phí, không có đại lượng nào phải tính trước.',
  },

  'lai-lo-vi-the-short': {
    entries: [],
    skipped: {
      'PnL_{short}': 'ket-qua',
      'P_{mo}': 'nhap-tho',
      'P_{dong}': 'nhap-tho',
      m: 'hang-so-bieu-phi',
      N: 'nhap-tho',
    },
    whyNone:
      'Hình nhân thẳng chênh lệch hai mức điểm gõ tay với số hợp đồng gõ tay và hệ số nhân tra từ biểu phí, không có đại lượng nào phải tính trước.',
  },

  'so-hop-dong-toi-da': {
    entries: [],
    skipped: {
      'N_{max}': 'ket-qua',
      '\\lfloor': 'phep-toan',
      V: 'nhap-tho',
      F: 'nhap-tho',
      m: 'hang-so-bieu-phi',
      k: 'nhap-tho',
    },
    whyNone:
      'Vốn ký quỹ, điểm hợp đồng và tỷ lệ ký quỹ đều gõ tay, hệ số nhân tra từ biểu phí, còn ký quỹ một hợp đồng và phép làm tròn xuống đã hiện trọn trong hình.',
  },

  'co-vi-the-phai-sinh': {
    entries: [],
    skipped: {
      N: 'ket-qua',
      '\\lfloor': 'phep-toan',
      V: 'nhap-tho',
      r: 'nhap-tho',
      '\\Delta P': 'nhap-tho',
      m: 'hang-so-bieu-phi',
    },
    whyNone:
      'Vốn, rủi ro mỗi lệnh và khoảng cách cắt lỗ đều gõ tay, hệ số nhân tra từ biểu phí, còn số tiền chịu rủi ro, mức lỗ mỗi hợp đồng và phép làm tròn xuống đã hiện trọn trong hình.',
  },

  'don-bay-hieu-dung': {
    entries: [],
    skipped: {
      L: 'ket-qua',
      F: 'nhap-tho',
      m: 'hang-so-bieu-phi',
      N: 'nhap-tho',
      E: 'nhap-tho',
    },
    whyNone:
      'Điểm hợp đồng, số hợp đồng và vốn thực có đều gõ tay, hệ số nhân tra từ biểu phí, còn giá trị danh nghĩa của vị thế đã hiện trọn trong hình.',
  },
};
