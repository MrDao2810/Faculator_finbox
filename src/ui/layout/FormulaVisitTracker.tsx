'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { FORMULA_VISIT_KEY, parseFormulaVisit, visitContinuesAt } from '@/application';

/**
 * Kết thúc lượt xem một công thức ngay khi người dùng sang màn khác.
 *
 * Không dựng ra gì, chỉ chạy effect — cùng khuôn `OriginTracker` và đứng cạnh nó trong `AppShell`
 * để phủ mọi màn. Luật và lý do nằm ở `formula-visit.ts`; ở đây chỉ có đúng một việc: đường dẫn ra
 * khỏi lượt xem thì xoá dấu, để lần mở công thức kế tiếp bắt đầu sạch.
 *
 * ## Vì sao việc này không nằm trong màn chi tiết
 *
 * Màn chi tiết chỉ biết lúc nó GẮN, không biết người dùng vừa đi qua những màn nào. Đi `pe` → danh
 * sách → `pe` thì lần gắn thứ hai vẫn thấy dấu `pe` và tưởng mình đang tiếp tục. Thứ duy nhất nhìn
 * thấy màn ở giữa là một component có mặt ở MỌI màn.
 *
 * ## Thứ tự với effect của màn chi tiết không quyết định gì
 *
 * Lá này đứng sau `<main>` nên effect của màn chạy trước. Đi thẳng từ công thức X sang công thức Y
 * thì Y so dấu trước (thấy X, dọn kho, ghi Y), rồi lá này nhìn tới và thấy dấu Y khớp đường dẫn. Nếu
 * thứ tự đảo lại thì lá này xoá dấu X trước, Y thấy không có dấu và vẫn dọn kho rồi ghi Y — cùng một
 * kết cục. Hai bên không phụ thuộc nhau, và đó là chủ ý: màn chi tiết tự quyết bằng phép so id của
 * chính nó, lá này chỉ lo những màn KHÔNG phải màn chi tiết.
 *
 * `usePathname()` chứ không `useSearchParams()`, cùng lý do đã ghi ở `OriginTracker`.
 */
export function FormulaVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const id = parseFormulaVisit(window.sessionStorage.getItem(FORMULA_VISIT_KEY));
      if (id !== null && !visitContinuesAt(id, pathname)) {
        window.sessionStorage.removeItem(FORMULA_VISIT_KEY);
      }
    } catch {
      // Trình duyệt chặn sessionStorage — dấu chưa từng ghi được, nên cũng không có gì để xoá.
    }
  }, [pathname]);

  return null;
}
