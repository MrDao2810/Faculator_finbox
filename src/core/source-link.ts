/**
 * Link nguồn người đọc BẤM VÀO phải mở ra một trang đọc được, không phải dữ liệu thô của một API.
 *
 * 21/10/2026, chủ dự án bấm link nguồn của một ví dụ và nhận về một khối JSON
 * (`cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?…`), coi đó là link hỏng. Đếm lúc ấy:
 * 100 link trong `src/core/vi-du/` (80 của CafeF, 20 của `api-finfo.vndirect.com.vn`) và 12 trong
 * ngân hàng câu hỏi. Chúng được chọn vì ghim được đúng phiên, nhưng người đọc chỉ thấy chữ và ngoặc.
 *
 * Nay giá phiên dẫn tới trang lịch sử giá của CafeF, ô ngày điền sẵn
 * (`cafef.vn/du-lieu/lich-su-giao-dich-fpt-1.chn?start%44ate=11/09/2026&end%44ate=11/09/2026`). Không
 * trang đọc được nào mở thẳng ra đúng phiên: CafeF tự chuyển URL sang chữ thường (301), nên tham số
 * `startDate` thành `startdate` mà script của trang chỉ đọc `startDate`; viết chữ D thành `%44` thì
 * không còn chữ hoa để đổi, và `URLSearchParams` giải mã lại thành `startDate`. Bảng có thể hiện tháng
 * gần nhất trước, vì trang gọi dữ liệu trước khi đọc ô ngày; bấm "Xem" một lần là ra đúng phiên.
 * Khoảng ngày không được dài quá một năm: trang bật hộp "Vui lòng chọn tối đa 1 năm…" và giữ nguyên
 * bảng tháng gần nhất.
 */

/** Dạng URL của dữ liệu thô: endpoint `.ashx`, thư mục `/Ajax/`, máy chủ API của VNDirect. */
const DU_LIEU_THO = /\.ashx(?:[?#]|$)|\/Ajax\/|\/\/api-finfo\.|\/\/dchart-api\./i;

/** `true` khi link trả JSON/dữ liệu thô thay vì một trang người đọc xem được. */
export function laLinkDuLieuTho(url: string): boolean {
  return DU_LIEU_THO.test(url);
}

const LICH_SU_GIA_CAFEF =
  /cafef\.vn\/du-lieu\/lich-su-giao-dich-[a-z0-9]+-1\.chn\?start%44ate=(\d\d)\/(\d\d)\/(\d{4})&end%44ate=(\d\d)\/(\d\d)\/(\d{4})$/;

/**
 * `true` khi link lịch sử giá CafeF xin một khoảng dài hơn một năm, đúng phép kiểm của trang:
 * `moment(den).diff(moment(tu), 'years', true) > 1`, tức ngày đầu sớm hơn ngày cuối lùi một năm.
 * Ngày cuối trước ngày đầu cũng tính là hỏng (trang tự đổi khoảng, không ra phiên được dẫn).
 */
export function laKhoangCafefQuaDai(url: string): boolean {
  const m = LICH_SU_GIA_CAFEF.exec(url);
  if (m === null) return false;
  const [, d1, m1, y1, d2, m2, y2] = m.map(Number);
  const tu = Date.UTC(y1!, m1! - 1, d1!);
  const den = Date.UTC(y2!, m2! - 1, d2!);
  return den < tu || tu < Date.UTC(y2! - 1, m2! - 1, d2!);
}
