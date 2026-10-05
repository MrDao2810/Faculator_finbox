'use client';

import type { MessageKey } from '@/application';
import { useT } from '@/application/preferences-context';

/**
 * Lá chữ CÓ CHỖ TRỐNG theo locale, dành cho SERVER component — anh em với `<T k="…">`.
 *
 * Client component thay chỗ trống bằng `t(key).replace(…)` ngay tại chỗ (xem `quiz.step` trong
 * `QuizBody`). Server component không gọi hook được, nên trước đợt này một câu như "cần ít nhất 20
 * phiên" chỉ có hai đường: tách làm ba mảnh JSX (vỡ ngay khi tiếng Anh đảo trật tự từ), hoặc đóng
 * băng chữ bằng `t()` tĩnh (mất luôn chế độ tiếng Anh). Lá này mở đường thứ ba.
 *
 * Chỗ trống viết `{tên}` trong từ điển; thay TẤT CẢ lần xuất hiện, nên một câu nhắc lại cùng một
 * con số hai lần vẫn đúng. Tên không khớp thì chuỗi giữ nguyên `{tên}` — hiện ra ngay trên màn,
 * đúng ý đồ: một chỗ trống quên truyền phải thấy được, không được im lặng thành chuỗi rỗng.
 *
 * Chỉ dùng cho chữ đứng giữa JSX, không dùng được cho chữ nằm trong thuộc tính — cùng giới hạn
 * với `<T>` và `<Pick>`.
 */
export function TFill({ k, vars }: { k: MessageKey; vars: Readonly<Record<string, string>> }) {
  const t = useT();

  return Object.entries(vars).reduce((chu, [ten, gia]) => chu.split(`{${ten}}`).join(gia), t(k));
}
