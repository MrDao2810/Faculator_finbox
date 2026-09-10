/**
 * Tầng APPLICATION — nhớ TÊN của công thức vừa mở bảng dữ liệu, để nút quay lại gọi đúng tên nó.
 *
 * ## Vì sao không nhét vào `origin-screen.ts`
 *
 * Nghe thì giống: cả hai đều là bản ghi `sessionStorage` phục vụ nút quay lại. Nhưng `ORIGINS` là
 * một danh sách ĐÓNG bốn màn, và trang chi tiết công thức CỐ Ý không có mặt trong đó — từ công thức
 * này mở sang công thức khác thì nút quay lại vẫn phải về màn gốc ban đầu, không đi ngược từng
 * bước. Thêm trang chi tiết vào `ORIGINS` để lấy cái tên là phá đúng luật ấy.
 *
 * Bản ghi ở đây làm việc khác hẳn: nó KHÔNG quyết định đi đâu. Đích đã do `?from=` trên URL quyết
 * định rồi (xem `backLinkFor()`); bản ghi này chỉ cung cấp CHỮ để nút khỏi phải nói trống không
 * "Quay lại công thức". Mất bản ghi thì nhãn lùi về câu chung, đường đi không xê dịch một ly.
 *
 * ## Vì sao phải qua `sessionStorage` mà không tra thẳng Registry
 *
 * Nút quay lại nằm ở `HeaderIdentity`, tức layout GỐC. Mọi thứ nó import rơi vào gói của MỌI trang,
 * và `FORMULA_SUMMARIES` thì đã đo được: `/du-lieu/` nhảy 131 → 217 kB, vượt hẳn cửa 180 kB. Cùng
 * lý do đã ghi ở `backLinkFor()` về việc chỉ kiểm DẠNG slug chứ không kiểm sự tồn tại.
 *
 * Trang chi tiết thì ngược lại: nó đang cầm sẵn `spec.name` trong tay, không tốn thêm byte nào.
 * Nên bên biết thì ghi, bên cần thì đọc — 0 kB cho 110 trang còn lại.
 *
 * `sessionStorage` chứ không `localStorage`, cùng lý lẽ với `origin-screen.ts`: đây là ngữ cảnh của
 * MỘT lượt duyệt. Mở lại trình duyệt hôm sau mà nút vẫn nhớ tên công thức của hôm qua thì mới lạ.
 *
 * Phần thuần nằm ở đây, không import React — nơi gọi chạm `sessionStorage` trong `useEffect` hoặc
 * trong `onClick`, đúng khuôn `origin-screen.ts`.
 */

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const FORMULA_ORIGIN_KEY = 'ffb.formulaOrigin.v1';

/**
 * Trần độ dài tên. Tên dài nhất trong Registry là 47 ký tự ("XIRR — suất sinh lợi nội tại theo
 * ngày thực"); 120 để rộng cửa cho bản dịch mà vẫn chặn được một chuỗi rác nhét tay vào kho.
 */
const MAX_NAME_LENGTH = 120;

/** Đúng dạng slug mà `backLinkFor()` chấp nhận cho `?from=` — hai chỗ phải cùng một luật. */
const SLUG = /^[a-z0-9-]+$/;

/** Công thức vừa được mở bảng dữ liệu từ đó. */
export interface FormulaOrigin {
  /** Slug của công thức, đối chiếu với `?from=` trước khi dùng tên. */
  id: string;
  /** Tên hiển thị, đã chọn theo ngôn ngữ đang dùng ở màn chi tiết. */
  name: string;
}

/**
 * Bản ghi để đưa vào `sessionStorage`, hoặc `null` nếu không đáng ghi.
 *
 * Lọc ngay ở đây chứ không ở chỗ đọc, để một bản ghi hỏng không bao giờ vào được kho — nhưng chỗ
 * đọc VẪN lọc lại, vì kho là thứ người dùng sửa được bằng tay.
 */
export function formulaOriginToStore(id: string, name: string): FormulaOrigin | null {
  const cleanName = name.trim();
  if (!SLUG.test(id) || cleanName === '' || cleanName.length > MAX_NAME_LENGTH) return null;

  return { id, name: cleanName };
}

/**
 * Đọc bản ghi đã nhớ. `null` khi chưa có, khi chuỗi hỏng, hoặc khi nội dung không đạt.
 *
 * `JSON.parse` bọc trong `try` vì đây là dữ liệu người dùng sửa được: một chuỗi méo phải ra `null`
 * chứ không được ném lỗi lên tận thanh trên — và thanh trên thì có mặt ở mọi màn.
 *
 * Tên đi vào phần CHỮ của một thẻ `<a>`, không đi vào `href`, nên nó không mở ra đường dẫn lạ như
 * bản ghi màn gốc. Vẫn chặn độ dài: một chuỗi vài nghìn ký tự sẽ đẩy vỡ cả hàng dính trên.
 */
export function parseFormulaOrigin(raw: string | null): FormulaOrigin | null {
  if (raw === null || raw.length > MAX_NAME_LENGTH * 4) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== 'object' || data === null) return null;
  const { id, name } = data as { id?: unknown; name?: unknown };

  if (typeof id !== 'string' || typeof name !== 'string') return null;

  return formulaOriginToStore(id, name);
}
