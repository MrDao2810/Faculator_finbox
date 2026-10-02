'use client';

import styles from './SourceMark.module.css';

/**
 * Con số trong ô nhỏ đến từ NƠI KHÁC — và chỉ khi nó đến từ nơi khác.
 *
 * Hai nguồn: số của một mã vừa nạp, hay kết quả của một công thức khác trong chuỗi (FR-15). Dựng
 * từ trạng thái ô có sẵn (`resolveInputState()`, `resolveLinked()`) chứ không đoán lại bằng cách
 * soi chuỗi.
 *
 * Từng có nhánh thứ ba, `manual` — ngòi bút kèm chữ "Tự nhập" — BỎ 02/10/2026 theo chủ dự án. Nó
 * in trên gần như mọi ô, mà "tự nhập" đúng là trạng thái mặc định của một ô nhập, nên nó không
 * phân biệt được gì; thứ đáng đánh dấu là ngoại lệ. Bỏ nó đi thì hai con dấu còn lại mới nổi lên,
 * và góc trên bên phải ô trống ra cho đơn vị. Mộ chí đầy đủ ở khoá `tile.manual` trong `vi.ts`.
 *
 * ĐỪNG thêm lại một nhánh "mặc định" vào đây. Con dấu này tồn tại để nói "con số NÀY không phải
 * bạn gõ"; một nhánh đúng với mọi ô là một nhánh không nói gì.
 */
export type MarkSource = { kind: 'ticker'; code: string } | { kind: 'formula'; name: string };

/** Mắt xích nghiêng — cùng hình với nút Chia sẻ của màn chi tiết, thu nhỏ còn 12px. */
function LinkGlyph() {
  return (
    <svg
      className={styles.glyph}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13.5a4 4 0 0 0 5.7.4l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7" />
      <path d="M14 10.5a4 4 0 0 0-5.7-.4l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7" />
    </svg>
  );
}

export interface SourceMarkProps {
  source: MarkSource;
}

/**
 * Con dấu nguồn ở góc trên bên phải một ô nhỏ của khối gộp — CHỈ hiện từ 1280px.
 *
 * Phần đặt chỗ và phần ẩn ở khổ hẹp nằm ở `.sourceMark` trong `Input.module.css` /
 * `SliderInput.module.css`, vì chính ô nhập là thứ bao nó; ở đây chỉ có hình của con dấu.
 *
 * KHÔNG phải primitive `Badge`, và không được đặt tên theo nó: `Badge` là con dấu CHIP có nền, ba
 * tone dùng chung với thẻ công thức và danh sách dựng phía máy chủ, còn đây là một dòng chữ mờ
 * 12px nằm trong góc ô nhập. `Badge.test.ts` gác đúng ranh giới ấy — chỉ `Badge.module.css` được
 * khai lớp `.badge`.
 */
export function SourceMark({ source }: SourceMarkProps) {
  return (
    <>
      <LinkGlyph />
      <span className={styles.source}>{source.kind === 'ticker' ? source.code : source.name}</span>
    </>
  );
}
