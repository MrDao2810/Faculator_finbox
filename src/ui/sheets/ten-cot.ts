/**
 * Bề ngang tối thiểu của một ô đầu cột, tính bằng `ch` (bề ngang chữ "0" 14px chữ thường) — dùng chung
 * cho hai bảng giá theo khuôn "Bảng dữ liệu": lưới popup (`PasteImportSheet`) và bảng của `/du-lieu/`.
 *
 * Tên cột in đậm 12px, nên mỗi ký tự không đúng một `ch`, và tỷ lệ tuỳ loại tên:
 *
 * - **Tên ngắn** ("Ngày", "Mở", "KL" — tối đa 4 ký tự): chữ hoa đậm như "Đ", "M" chiếm phần lớn, rộng
 *   hơn một `ch`, nên nhân 1,2. Đo ở 390px khi tên còn 13px: thiếu phần ấy thì "Ngày" bị cắt "Ng…".
 * - **Tên dài** ("Giá thấp nhất", "Khối lượng" — tên đầy đủ in từ 1024px, 21/10/2026): phần lớn là chữ
 *   thường, đo trên Chrome ra 0,77–0,85 `ch` mỗi ký tự ("Giá thấp nhất" 76px, 1ch 7,55px). Nhân 0,9 vẫn
 *   dư; giữ 1,2 thì mỗi cột thừa ~30px, và bảng của `/du-lieu/` ở 1440 phải giãn cột tên tới 164px.
 *
 * Cộng hai `ch` cho dấu ˅ và khe trước nó. Tên dài hơn 12 ký tự (cột thừa mang tên của file dán) tính
 * như 12 — phần còn lại cắt bằng "…", rê chuột vào là đọc đủ.
 */
export function beNgangTenCot(ten: string): number {
  const soKyTu = Math.min(ten.length, 12);
  return Math.ceil(soKyTu * (soKyTu <= 4 ? 1.2 : 0.9)) + 2;
}
