import type { ReactNode } from 'react';

/**
 * Con số với một chỗ ngắt dòng sau mỗi dấu chấm phân nhóm.
 *
 * Số khổng lồ co tới cỡ sàn mà vẫn không vừa chỗ chứa thì phải xuống dòng. Không có chỗ ngắt nào thì
 * `overflow-wrap: anywhere` cắt ngay giữa một nhóm ("…713.00" / "0 ₫"). `<wbr>` không thêm ký tự,
 * nên `textContent` giữ nguyên. Dấu chấm luôn là dấu phân nhóm: `format.ts` khoá cứng 'vi-VN'.
 *
 * Tách khỏi `StatTile.tsx` ngày 12/10/2026 khi thẻ tóm tắt của màn Danh mục cần đúng quy tắc ấy
 * (bài học số dài tràn ô, 29/09/2026): hai nơi in tiền thì dùng MỘT hàm, không chép hai bản.
 */
export function coChoNgat(text: string): ReactNode[] {
  return text.split('.').flatMap((nhom, i) => (i === 0 ? [nhom] : ['.', <wbr key={i} />, nhom]));
}
