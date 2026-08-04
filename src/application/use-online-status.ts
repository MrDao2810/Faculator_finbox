'use client';

/**
 * Tầng APPLICATION — theo dõi kết nối mạng (gói WBS 1.4.1).
 *
 * Dùng cho banner "Hoạt động ngoại tuyến" ở WF-01. Sản phẩm chạy được offline (FR-23,
 * COM-02) nên mất mạng là chuyện bình thường, không phải lỗi — banner chỉ để người dùng
 * biết vì sao dữ liệu mẫu chưa tải được.
 */

import { useEffect, useState } from 'react';

export function useOnlineStatus(): boolean {
  // Mặc định coi như đang có mạng: bản build là HTML tĩnh, nếu khởi tạo bằng false thì
  // banner sẽ loé lên một nhịp trước khi hydrate xong.
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => {
      setOnline(window.navigator.onLine);
    };

    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return online;
}
