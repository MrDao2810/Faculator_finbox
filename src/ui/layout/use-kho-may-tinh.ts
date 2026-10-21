'use client';

import { useLayoutEffect, useState } from 'react';

/** Mốc "màn máy tính" của sản phẩm — bảng bậc màn ở `globals.css`: từ đây nav lên thanh trên. */
export const KHO_MAY_TINH = '(min-width: 1024px)';

/**
 * `true` khi khung nhìn đang từ 1024px trở lên, và đổi theo khi cửa sổ co giãn qua mốc ấy.
 *
 * Lượt dựng đầu luôn là `false` — bản HTML tĩnh không biết bề ngang màn, nên chỉ dùng cho phần
 * KHÔNG nằm trong HTML tĩnh (một bảng chỉ có dòng sau khi đọc kho, một lưới chỉ có khi popup mở).
 * Đọc trong `useLayoutEffect` chứ không `useEffect`: chạy trước lúc vẽ, nên phần mới gắn vào không
 * kịp hiện một khung hình theo khổ điện thoại rồi mới đổi. Không có `matchMedia` (jsdom) thì giữ
 * `false`, tức khổ điện thoại; ca kiểm nào cần khổ máy tính thì tự giả `matchMedia`.
 *
 * Dùng chung cho hai bảng giá theo khuôn "Bảng dữ liệu" (popup và màn `/du-lieu/`): tên cột NGẮN
 * ("Mở", "KL") chỉ ở điện thoại, máy tính in tên đầy đủ (21/10/2026).
 */
export function useKhoMayTinh(): boolean {
  const [laMayTinh, setLaMayTinh] = useState(false);

  useLayoutEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia(KHO_MAY_TINH);
    const dongBo = (): void => {
      setLaMayTinh(media.matches);
    };
    dongBo();
    media.addEventListener('change', dongBo);
    return () => {
      media.removeEventListener('change', dongBo);
    };
  }, []);

  return laMayTinh;
}
