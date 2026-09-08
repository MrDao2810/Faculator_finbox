'use client';

import { useEffect, useState } from 'react';

/**
 * Khổ khung vẽ của biểu đồ — `'compact'` cho điện thoại/máy tính bảng, `'wide'` cho màn rộng.
 *
 * VÌ SAO PHẢI CÓ HAI KHỔ, thay vì một `viewBox` rồi để CSS phóng to.
 *
 * Chữ trong SVG đo bằng ĐƠN VỊ VIEWBOX, nên nó phóng y hệt hình. Với khung 320×240 và chữ trục 10
 * đơn vị, chữ chiếm 3,1% bề ngang — tỉ lệ ấy cố định, không CSS nào gỡ được. Hệ quả đo được trước
 * đây: khung rộng 1200px làm chữ trục hiện ra to bằng tiêu đề (hệ số phóng 2,5×–3,65×), và cách chữa
 * cũ là chặn `.plot` không rộng quá 480px — tức hy sinh luôn kích thước biểu đồ trên PC để cứu cỡ chữ.
 *
 * Đổi cỡ chữ bằng media query trong CSS KHÔNG thay được chỗ này: mọi khoảng cách quanh chữ (lề trái
 * 36, nhãn trục X tại `y1 + 13`, khe `x0 - 5`, hai mốc lật nhãn 9/11 trong `labelYFor`) đều tính
 * theo chữ 10 đơn vị. Thu chữ mà không thu chúng là chữ trôi khỏi chỗ nó phải đứng.
 *
 * Lối đi đúng là NỚI KHUNG chứ không thu chữ: khổ `wide` nhân đôi `viewBox` lên 640×400 và GIỮ
 * NGUYÊN mọi hằng số tính theo chữ. Chữ nhờ đó chỉ còn chiếm nửa tỉ lệ cũ, nên hình vẽ được phép
 * rộng gấp đôi mà chữ hiện ra vẫn đúng cỡ đọc — thêm chỗ cho vùng vẽ, không thêm chỗ cho chữ.
 *
 * VÌ SAO KHỞI TẠO LUÔN LÀ `'compact'`, kể cả trên PC.
 *
 * Thư mục này nằm sau ranh giới `next/dynamic`, và trang được dựng sẵn lúc build. Lần render đầu ở
 * máy khách phải khớp HỆT HTML tĩnh, mà HTML tĩnh không biết màn hình rộng bao nhiêu. Đọc
 * `matchMedia` ngay trong thân component là một đường lệch hydration — đúng loại lỗi mà docblock
 * `LineChart` (quyết định 2) và `FeaturedFormulas` đã chốt cách tránh. Nên: hằng số trước, đo sau,
 * trong `useEffect`. Cùng một nếp với `ThemeSwitch` (render đầu luôn là sáng).
 *
 * `matchMedia` được canh `typeof` chứ không gọi thẳng: jsdom không cài nó, mà `charts.test.tsx`
 * dựng `LineChart` trực tiếp. Thiếu lớp canh này thì mọi ca kiểm biểu đồ ném lỗi ngay ở lần mount.
 * Vắng `matchMedia` thì ở lại `'compact'` — đúng khổ mà `CHART_GEOMETRY` đang xuất ra cho test.
 */
export type ChartSize = 'compact' | 'wide';

/**
 * Mốc đổi khổ, khớp `@media (min-width: 768px)` trong `chart.module.css`.
 *
 * Một con số ở hai nơi là một nguy cơ lệch, nhưng CSS không đọc được hằng số TS và ngược lại. Đổi
 * mốc này thì PHẢI đổi cả bên kia: CSS đặt tỉ lệ khung theo khổ, mà tỉ lệ khớp sai `viewBox` là hình
 * bị letterbox rồi phóng to theo chiều dư — chính lỗi mà bản trước mắc ở mốc 640px.
 */
const WIDE_QUERY = '(min-width: 768px)';

export function useChartSize(): ChartSize {
  const [size, setSize] = useState<ChartSize>('compact');

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const mq = window.matchMedia(WIDE_QUERY);
    const apply = () => {
      setSize(mq.matches ? 'wide' : 'compact');
    };

    apply();
    mq.addEventListener('change', apply);
    return () => {
      mq.removeEventListener('change', apply);
    };
  }, []);

  return size;
}
