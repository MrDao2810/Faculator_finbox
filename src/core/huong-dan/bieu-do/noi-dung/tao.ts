import type { Bilingual } from '../../../types';

/**
 * Ghép hai vế của một đoạn — chỉ để kho chữ đọc được thành từng cặp vi/en đứng sát nhau.
 *
 * Bản tiếng Anh là BẮT BUỘC ở kho này, khác `noi-dung/` của bốn mục kia (nơi `en` tuỳ chọn và rơi
 * về tiếng Việt): chủ dự án giao rõ "làm thêm cả bản tiếng Anh chuẩn" khi duyệt mục này
 * (13/10/2026), nên kiểu trả về là `Bilingual` đủ hai vế và `kiem.ts` chặn vế rỗng.
 */
export function d(vi: string, en: string): Bilingual {
  return { vi, en };
}
