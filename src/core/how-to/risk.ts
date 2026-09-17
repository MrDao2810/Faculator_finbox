/**
 * Khung "cách tính" của nhóm `src/core/formulas/risk.ts` — kiểu dữ liệu và luật ở `types.ts`.
 */

import type { FormulaHowTo } from './types';

export const HOW_TO_RISK: Readonly<Record<string, FormulaHowTo>> = {
  /*
   * Hai dòng ghép `V \times r` và `P_{vao} - P_{cat}` là đúng hai phép tính của `calc`
   * (`capital * riskPercent / 100` và `gap`), và cả hai đã hiện trọn trong hình. Ô rủi ro gõ theo %
   * nên hình viết `r` dạng tỷ lệ, không `÷ 100`, cùng quy ước với mọi hình công thức.
   */
  'co-lenh-rui-ro': {
    entries: [],
    skipped: {
      Q: 'ket-qua',
      V: 'nhap-tho',
      r: 'nhap-tho',
      'V \\times r': 'da-hien-trong-hinh',
      'P_{vao}': 'nhap-tho',
      'P_{cat}': 'nhap-tho',
      'P_{vao} - P_{cat}': 'da-hien-trong-hinh',
    },
    whyNone:
      'Vốn tài khoản, mức rủi ro mỗi lệnh, giá vào và giá cắt lỗ đều do người dùng tự gõ, còn số tiền chấp nhận mất và khoản lỗ mỗi cổ phiếu là hai phép tính đã hiện trọn trong hình.',
  },
};
