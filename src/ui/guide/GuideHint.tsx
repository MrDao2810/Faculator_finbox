'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';

import styles from './GuideHint.module.css';

/**
 * Nút "?" tròn — lối vào hướng dẫn, đặt ngay tại chỗ gây khó hiểu (WF-21 đợt 3, 02/10/2026).
 *
 * ── Vì sao là `<a href>` chứ không `<button>` ────────────────────────────────────────────────
 *
 * Ba thứ một nút thuần sẽ làm mất, và cả ba đều đang có:
 *
 *   1. JavaScript chưa tải xong thì bấm vẫn sang trang hướng dẫn thật. Một `<button>` lúc ấy là
 *      một vòng tròn không làm gì — tệ hơn không có.
 *   2. Ctrl/⌘-bấm và chuột giữa vẫn mở tab mới; chuột phải vẫn copy được địa chỉ.
 *   3. `verify-static.mjs` đọc được lối vào ấy ngay trong HTML tĩnh. Phép kiểm đó chính là lời
 *      hứa "bấm vào là xem được" ở dạng đo được.
 *
 * Vì nó mở một `<dialog>` chứ không điều hướng (khi có JS), nó khai `aria-haspopup="dialog"`.
 * KHÔNG khai `aria-expanded`: panel không phải phần tử do nút này bao, và trạng thái mở của một
 * `<dialog>` modal đã được trình duyệt báo cho cây trợ năng.
 *
 * ── Nhãn phải nói CHỖ NÀO, không phải "dấu hỏi" ──────────────────────────────────────────────
 *
 * Trình đọc màn hình gặp một vòng tròn không chữ. `nhan` là câu đầy đủ ("Hướng dẫn: cần số gì và
 * lấy ở đâu") chứ không phải "?" — nơi gọi truyền vào, vì chỉ nơi gọi mới biết nút đứng cạnh cái
 * gì. Ký tự "?" nhìn thấy được mang `aria-hidden`.
 *
 * ── Chỗ này KHÔNG được rải ────────────────────────────────────────────────────────────────────
 *
 * Chủ dự án chốt: *"cần làm rõ là những chỗ khó hiểu và quan trọng thì mới cần ?"*. Luật rút ra:
 * một "?" chỉ xuất hiện ở chỗ màn TỰ NÓ không trả lời được câu hỏi nó vừa gây ra. Danh sách chỗ
 * được phép, kèm lý do từng chỗ và lý do những chỗ bị loại, ghim ở `FormulaDetail.test.tsx`.
 */

export interface GuideHintProps {
  /** Đích thật khi không có JS — trang hướng dẫn, kèm neo của mục nếu có. */
  href: string;
  /** Câu đầy đủ cho trình đọc màn hình. Không phải "?" . */
  nhan: string;
  /**
   * Mở khung hướng dẫn ngay tại nút. Nhận cả sự kiện vì khung phải biết nó bám vào phần tử nào
   * và điểm chạm ở đâu — đó là toàn bộ khác biệt giữa "bật ra ở đây" và "trượt ra ở mép màn".
   *
   * Thiếu nó thì nút về đúng vai trò một link.
   */
  onMo?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Chỗ đứng do nơi gọi quyết định; component chỉ lo hình dáng. */
  className?: string;
}

export function GuideHint({ href, nhan, onMo, className }: GuideHintProps) {
  return (
    <Link
      className={[styles.hint, className].filter(Boolean).join(' ')}
      href={href}
      aria-label={nhan}
      aria-haspopup="dialog"
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (onMo === undefined) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onMo(event);
      }}
    >
      <span aria-hidden="true">?</span>
    </Link>
  );
}
