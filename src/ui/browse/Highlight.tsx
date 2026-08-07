import { highlightParts } from '@/application';

import styles from './Highlight.module.css';

export interface HighlightProps {
  text: string;
  /** Chuỗi người dùng đang gõ. Rỗng thì chữ hiện nguyên, không mẩu nào được tô. */
  query: string;
}

/**
 * Tô sáng đoạn khớp trong một chuỗi — WF-09 (gói WBS 3.1.3).
 *
 * Toàn bộ phần khó — dò đoạn nào khớp khi người dùng gõ không dấu — nằm ở `highlightParts()`
 * tầng Domain, đã test 15 ca bằng Node. Ở đây chỉ là vòng lặp dựng thẻ.
 *
 * Dùng `<mark>` gốc chứ không phải `<span>` tô nền: trình đọc màn hình hiểu đây là phần được
 * đánh dấu, và người tắt CSS vẫn thấy dấu vết. Nền vàng nhạt cộng chữ đậm là hai dấu hiệu,
 * không riêng màu (NFR-USA-06).
 */
export function Highlight({ text, query }: HighlightProps) {
  const parts = highlightParts(text, query);

  return (
    <>
      {parts.map((part, index) =>
        part.hit ? (
          // Chỉ số làm khoá là đúng ở đây: danh sách được dựng lại trọn vẹn mỗi lần gõ, và
          // thứ tự các mẩu chính là danh tính của chúng.
          <mark key={index} className={styles.hit}>
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
