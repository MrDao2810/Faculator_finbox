import type { ReactNode } from 'react';

import styles from './KhungCho.module.css';

/**
 * Vệt chờ phủ lên một con số đang được tải lại — màn Danh mục, lúc tra thị giá (14/10/2026).
 *
 * Chủ dự án bấm "Làm mới" và không thấy gì đổi ngoài dòng ngày phiên: _"chức năng làm mới đang không làm
 * cho tôi cảm thấy dữ liệu đang được tải lại … thêm loading cho bảng dữ liệu bên dưới sao cho hợp lý khi
 * tải lại"_. Nên mọi con số SỐNG THEO THỊ GIÁ (thị giá, lãi/lỗ, %, tỷ trọng, tổng giá trị) thành một vệt
 * xám chạy sáng trong lúc tra; con số không phụ thuộc giá (số CP, giá vốn, ngày mua, vốn đã bỏ ra) đứng
 * yên — đúng thứ đang được tải lại, không hơn.
 *
 * Chữ cũ vẫn nằm NGUYÊN trong vệt, chỉ trong suốt: ô giữ đúng bề ngang của nó, bảng khổ điện thoại (cột
 * theo nội dung) không giật cột lúc vệt hiện và lúc số trở lại. Hết chờ thì trả lại đúng con nguyên bản,
 * không bọc gì — DOM lúc thường y như trước khi có vệt.
 *
 * `vua`: vệt ôm đúng con số, bỏ bề ngang tối thiểu. Cho chỗ con số LUÔN có (số đếm phép tính đã lưu ở
 * tab Công thức) — bề ngang tối thiểu chỉ để lần tải đầu của ô thị giá, khi ô mới có `_ _`; đặt lên một
 * chữ số "2" thì vệt rộng gấp năm lần nó và đẩy chữ "phép tính" bên cạnh nhảy sang phải rồi nhảy về.
 */
export function KhungCho({
  cho,
  vua = false,
  children,
}: {
  cho: boolean;
  vua?: boolean;
  children: ReactNode;
}) {
  if (!cho) return <>{children}</>;
  return (
    <span className={vua ? `${styles.khungCho} ${styles.vua}` : styles.khungCho}>{children}</span>
  );
}
