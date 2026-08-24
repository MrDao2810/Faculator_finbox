/**
 * Tầng APPLICATION — nhớ màn danh sách người dùng vừa rời đi, để nút quay lại đưa họ về ĐÚNG
 * chỗ đó chứ không về một danh sách trắng trơn.
 *
 * ## Vì sao cần nhớ
 *
 * Trạng thái lọc của WF-02 nằm trên URL (`/cong-thuc/?q=rui+ro&category=risk`). Nếu nút quay
 * lại luôn trỏ cứng về `/cong-thuc/` thì người dùng lọc xong, mở một công thức, quay ra là mất
 * sạch bộ lọc và phải lọc lại từ đầu. Với 111 công thức thì đó là một hình phạt thật.
 *
 * ## Vì sao KHÔNG dùng `history.back()`
 *
 * `history.back()` giữ được bộ lọc, nhưng hỏng ở đúng những chỗ hay gặp nhất:
 * mở thẳng `/cong-thuc/pe/` từ Google hay từ link ai đó gửi thì lịch sử không có mục nào của
 * site này, và `back()` ném người dùng RA KHỎI sản phẩm. Trang chi tiết là trang được lập chỉ
 * mục (FR-25) nên vào thẳng là đường vào thường xuyên, không phải ngoại lệ.
 *
 * Nhớ URL rồi dựng một thẻ `<a>` thật thì luôn đi tới một chỗ có thật, chạy được cả khi
 * JavaScript chưa tải xong, và người dùng vẫn bấm chuột phải "mở tab mới" được.
 *
 * ## Vì sao `sessionStorage` chứ không `localStorage`
 *
 * Đây là ngữ cảnh của MỘT lượt duyệt, không phải tuỳ chọn của người dùng. Mở lại trình duyệt
 * ngày hôm sau mà nút quay lại vẫn nhớ bộ lọc của hôm qua thì mới là lạ.
 *
 * Phần thuần nằm ở đây, không import React — test được bằng Node. Phần chạm `sessionStorage`
 * do màn gọi trong `useEffect`, cùng khuôn với `price-series-store.ts`.
 */

import { ROUTES } from './routes';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const LAST_LIST_URL_KEY = 'ffb.lastList.v1';

/**
 * Trần độ dài. URL dài hơn mức này là dấu hiệu có người nhét rác vào `sessionStorage`;
 * `parseListUrl()` sẽ bỏ qua thay vì dựng một link khổng lồ lên màn.
 */
const MAX_URL_LENGTH = 300;

/**
 * Đọc URL đã nhớ, và **chỉ chấp nhận đường dẫn nội bộ trỏ đúng vào màn danh sách**.
 *
 * Đây là ranh giới an toàn của module này. `sessionStorage` người dùng sửa được, và nội dung
 * của nó đi thẳng vào thuộc tính `href` — nên phải soi thật kỹ:
 *
 * - phải bắt đầu bằng `/cong-thuc/` — chặn `javascript:`, `data:`, `http://…` và mọi thứ
 *   dẫn ra ngoài;
 * - **không được** bắt đầu bằng `//` — trình duyệt hiểu đó là URL tuyệt đối theo giao thức
 *   hiện tại, tức vẫn dẫn sang tên miền khác dù nhìn như đường dẫn nội bộ;
 * - phần sau dấu `?` không được chứa thêm `/` — chặn kiểu `/cong-thuc/pe/` lọt qua thành
 *   "danh sách".
 *
 * Không hợp lệ thì trả `null`, nơi gọi tự dùng `/cong-thuc/` trơn.
 */
export function parseListUrl(raw: string | null): string | null {
  if (raw === null) return null;

  const value = raw.trim();
  if (value === '' || value.length > MAX_URL_LENGTH) return null;
  if (value.startsWith('//')) return null;
  if (!value.startsWith(ROUTES.formulas)) return null;

  const rest = value.slice(ROUTES.formulas.length);
  const [path, ...queryParts] = rest.split('?');

  // Sau '/cong-thuc/' mà còn đoạn đường dẫn nữa thì đó là trang chi tiết, không phải danh sách.
  if (path !== '') return null;
  // Chỉ cho đúng một dấu '?'; nhiều hơn là chuỗi méo.
  if (queryParts.length > 1) return null;

  return value;
}

/** Đường dẫn để nút quay lại dùng: URL đã nhớ nếu hợp lệ, không thì màn danh sách trơn. */
export function backToListHref(remembered: string | null): string {
  return parseListUrl(remembered) ?? ROUTES.formulas;
}

/**
 * Chuỗi để ghi vào `sessionStorage` khi đang đứng ở màn danh sách.
 * Trả `null` nghĩa là không đáng nhớ — nơi gọi đừng ghi gì cả.
 */
export function listUrlToStore(pathname: string, search: string): string | null {
  if (pathname !== ROUTES.formulas) return null;

  // `search` gồm cả dấu '?' khi có tham số, và là chuỗi rỗng khi không.
  const url = `${pathname}${search}`;
  return parseListUrl(url);
}
