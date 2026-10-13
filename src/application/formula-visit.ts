/**
 * Tầng APPLICATION — dấu "đang xem công thức nào", ranh giới của MỘT lượt xem.
 *
 * ## Lỗi nó sinh ra để sửa
 *
 * Chủ dự án báo (13/10/2026): thêm mã vào Danh mục rồi mở công thức, hoặc lưu một công thức có mã,
 * hoặc chỉ nạp mã mà chưa lưu gì — rồi _"vào lại hoặc search lại công thức đó thì lại đang lưu lại
 * mã cũ trong công thức đó … phải reset lại công thức về mặc định"_.
 *
 * Gốc nằm ở màn chi tiết: nó cất trạng thái vào ba kho (`ffb.activeTicker.v1`, `ffb.draft.v1`,
 * `ffb.workingSeries.v1`) rồi nạp lại ở MỌI lần gắn, bất kể người dùng vào từ đâu. Ba kho ấy dựng
 * ra cho một việc có thật — bấm "Mở bảng dữ liệu →" rồi quay lại mà không mất số — nhưng không kho
 * nào biết phân biệt "quay lại" với "vào lại từ đầu".
 *
 * ## Luật
 *
 * Một lượt xem công thức X còn tiếp diễn chừng nào người dùng chỉ đứng ở ba chỗ: màn chi tiết của
 * X, bảng dữ liệu `/du-lieu/`, và bài hướng dẫn của chính X. Sang bất kỳ màn nào khác — danh sách,
 * tìm kiếm, Danh mục, Cài đặt, một công thức KHÁC — là hết lượt, và lần mở kế tiếp bắt đầu sạch.
 *
 * Chủ dự án chốt "về mặc định hết", cả mã lẫn số tự gõ. Việc này ĐẢO hai quyết định cũ, ghi ra để
 * không ai dựng lại: mã không còn dính theo lượt duyệt sang công thức khác (`active-ticker.ts`), và
 * bản nháp ô nhập không còn sống qua lần đóng tab (`input-draft-store.ts`).
 *
 * ## Vì sao kiểm ở CỬA VÀO chứ không dọn lúc rời màn
 *
 * Dọn trong cleanup của component thì đóng tab, F5 và điều hướng cứng đều không chạy tới, và bản
 * nháp nằm ở `localStorage` sẽ quay về ở tab mới. Nên màn chi tiết so dấu lúc GẮN: dấu khác id của
 * nó thì đây là lượt mới và ba kho bị xoá trước khi bất kỳ effect khôi phục nào kịp đọc.
 *
 * Dấu bị xoá bởi `FormulaVisitTracker` (lá client trong `AppShell`) ngay khi đường dẫn ra khỏi ba
 * chỗ trên. Thiếu nó thì đi X → danh sách → X vẫn thấy dấu X và lỗi còn nguyên.
 *
 * ## Vì sao `sessionStorage`
 *
 * Lượt xem là chuyện của MỘT tab, cùng lẽ với `origin-screen.ts`. Và nó phải sống qua F5: tải lại
 * trang giữa chừng là vẫn đang xem công thức ấy, không phải vào lại.
 *
 * Phần thuần nằm ở đây, không import React — nơi gọi chạm `sessionStorage` trong `useEffect`.
 */

import { originPath } from './origin-screen';
import { ROUTES, formulaPath, guidePath } from './routes';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const FORMULA_VISIT_KEY = 'ffb.visit.v1';

/** Id công thức là slug — cùng luật với `input-draft-store.ts`. */
const ID_PATTERN = /^[a-z0-9-]{1,40}$/;

/**
 * Đọc dấu đã cất. `null` khi chưa có hoặc khi nội dung không phải một slug.
 *
 * Kho là thứ người dùng sửa được bằng tay, và giá trị này được ghép vào đường dẫn để so — một
 * chuỗi lạ phải rớt ở đây chứ không được đi tiếp.
 */
export function parseFormulaVisit(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const id = raw.trim();
  return ID_PATTERN.test(id) ? id : null;
}

/**
 * Lượt xem công thức `id` có còn tiếp diễn khi người dùng đứng ở `pathname` không?
 *
 * So ĐƯỜNG DẪN tuyệt đối, không so tiền tố: `/cong-thuc/` trơn là màn danh sách và phải ra `false`,
 * `/cong-thuc/pb/` là công thức khác và cũng `false`. Bảng dữ liệu thì không mang id trên đường dẫn
 * (`?from=` nằm ở truy vấn), và không cần: nó chỉ vào được từ một màn chi tiết, mà màn chi tiết
 * nào mở ra cũng tự so dấu với id của chính nó.
 */
export function visitContinuesAt(id: string, pathname: string): boolean {
  if (!ID_PATTERN.test(id)) return false;

  const path = originPath(pathname);
  return path === formulaPath(id) || path === ROUTES.data || path === guidePath(id);
}
