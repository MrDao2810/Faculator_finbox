'use client';

import { useEffect } from 'react';

/**
 * Đăng ký service worker — gói WBS 3.6.2 (PWA).
 *
 * Không dựng ra gì cả, chỉ chạy một effect. Đặt trong `AppShell` để có mặt ở mọi màn mà
 * không màn nào phải nhớ thêm.
 *
 * Ba điều cố ý:
 *
 * 1. **Đăng ký sau khi trang tải xong** (`load`), không phải ngay lúc gắn. Đăng ký sớm thì
 *    lượt tải đầu phải chia băng thông với việc tải service worker và những thứ nó cache —
 *    đúng lúc người dùng đang chờ nội dung (NFR-PER-01).
 * 2. **Chỉ đăng ký ở bản dựng thật.** Ở `npm run dev` không có `out/sw.js`, và một service
 *    worker cache lại chunk của dev server là cách chắc chắn nhất để gặp lỗi
 *    "Cannot find module './124.js'" sau mỗi lần build.
 * 3. **Hỏng thì im lặng.** Trình duyệt chặn service worker (chế độ riêng tư, http không phải
 *    localhost) là chuyện bình thường; app vẫn chạy đủ, chỉ mất phần ngoại tuyến.
 * 4. **Ở dev thì DỌN service worker cũ**, xem `unregisterStale()` bên dưới.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      unregisterStale();
      return;
    }

    function register(): void {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Không đăng ký được thì thôi — không có gì để nói với người dùng ở đây.
      });
    }

    if (document.readyState === 'complete') {
      register();
      return;
    }

    window.addEventListener('load', register);
    return () => {
      window.removeEventListener('load', register);
    };
  }, []);

  return null;
}

/**
 * Gỡ service worker còn sót và xoá kho của nó — CHỈ chạy lúc dev.
 *
 * Vì sao cần: `npm run preview` phục vụ bản dựng thật, và bản dựng thật đăng ký service worker
 * cho đúng origin nó chạy. Trước đợt này `preview` không chỉ định cổng nên `serve` lấy 3000 —
 * cùng cổng với `next dev`. Xem một lần bản preview là từ đó service worker nằm lại ở
 * `localhost:3000` và chặn mọi điều hướng của dev server: nó trả HTML bản dựng cũ trong kho,
 * mà HTML ấy xin những chunk băm của bản dựng — dev server không có, nên React không gắn được
 * và cả màn hình đứng chết, bấm gì cũng không ăn.
 *
 * Đổi `preview` sang cổng 4173 chặn được lần sau, nhưng KHÔNG cứu được máy đã lỡ đăng ký —
 * service worker sống dai qua cả việc tắt server. Nên phải tự gỡ ở đây.
 *
 * Xoá luôn kho `ffb-*`: gỡ đăng ký chỉ ngăn nó điều khiển lần tải sau, còn kho vẫn nằm đó và
 * bản đăng ký kế tiếp sẽ ăn lại đúng đống cũ.
 */
function unregisterStale(): void {
  void navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
    .then(() => (typeof caches === 'undefined' ? [] : caches.keys()))
    .then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('ffb-')).map((k) => caches.delete(k))),
    )
    // Trình duyệt chặn service worker thì mọi lời gọi trên đều ném — không có gì để nói ở đây.
    .catch(() => undefined);
}
