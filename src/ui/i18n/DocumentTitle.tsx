'use client';

import { useEffect } from 'react';

import type { Bilingual } from '@/application';
import { usePick, usePreferences, useT } from '@/application/preferences-context';

/**
 * Tiêu đề tab trình duyệt theo ngôn ngữ đang chọn (15/10/2026).
 *
 * `metadata.title` của Next dựng lúc build nên luôn là tiếng Việt. Đo trên Chrome ở chế độ EN: cả
 * 17 màn đã thử vẫn ghi "P/E — hệ số giá trên lợi nhuận · Faculator Finbox" trên tab, dù thân trang
 * đã sang tiếng Anh. Lá này ghi đè `document.title` sau hydrate, theo đúng khuôn `%s · Tên sản phẩm`
 * của `layout.tsx`.
 *
 * Chỉ ghi khi đã đọc xong `localStorage` (`hydrated`), cùng lý do cửa ấy ở `PreferencesProvider`:
 * lượt mount còn là mặc định tiếng Việt, ghi lúc ấy là thừa. Metadata SEO (mô tả, từ khoá) vẫn tiếng
 * Việt — máy tìm kiếm đọc HTML tĩnh, không chạy được lựa chọn nằm trong máy người dùng.
 *
 * Đặt trong CÂY TRANG, không trong layout: tiêu đề là của từng màn.
 *
 * ── Vì sao phải CANH chứ không ghi một lần ──────────────────────────────────────────────────
 *
 * Ghi một lần là không đủ, đo được trên Chrome (dev server, tải cứng `/cong-thuc/pe/` ở EN): ngay
 * sau hydrate tab đọc "Price to earnings ratio · …", một giây sau Next đổ metadata của trang về và
 * dựng lại thẻ `<title>` tiếng Việt, đè lên. Điều hướng phía khách thì không thấy vì metadata tới
 * trước lượt mount. Nên ở EN lá canh mọi thay đổi trên cây và ghi lại khi tab lệch chữ mong muốn —
 * phép so chuỗi rẻ, và lượt ghi của chính nó dừng ngay ở lượt so kế tiếp. Ở VI metadata đã đúng
 * chữ, không cần canh.
 */
export function DocumentTitle({ title }: { title: Bilingual }) {
  const { hydrated, locale } = usePreferences();
  const pick = usePick();
  const t = useT();
  const text = `${pick(title)} · ${t('app.name')}`;

  useEffect(() => {
    if (!hydrated) return;
    document.title = text;
    if (locale !== 'en') return;

    const canh = new MutationObserver(() => {
      if (document.title !== text) document.title = text;
    });
    canh.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return () => {
      canh.disconnect();
    };
  }, [hydrated, locale, text]);

  return null;
}
