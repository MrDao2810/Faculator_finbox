'use client';

import type { Bilingual } from '@/application';
import { usePick } from '@/application/preferences-context';

/**
 * Lá chữ song ngữ theo locale, dành cho SERVER component — cùng nguyên tắc với `<T k="…">`
 * (xem docblock file đó): bọc ĐÚNG PHẦN CHỮ vào lá client này thì cả khối vẫn do server dựng,
 * chỉ mỗi đoạn chữ hydrate và đổi khi người dùng chuyển ngôn ngữ; context xuyên qua cây server
 * children bình thường nên lá vẫn nhận được locale.
 *
 * Khác `<T>` (đọc từ điển giao diện bằng khoá), lá này đọc field `Bilingual` khai ngay ở Domain
 * (tên/mô tả công thức, tên nhóm...) — truyền thẳng giá trị, không qua khoá.
 *
 * Chỉ dùng cho chữ đứng giữa JSX, không dùng được cho chữ nằm trong thuộc tính.
 */
export function Pick({ value }: { value: Bilingual }) {
  const pick = usePick();
  return pick(value);
}
