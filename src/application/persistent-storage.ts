/**
 * Xin trình duyệt GIỮ kho của trang lâu dài — `navigator.storage.persist()` (16/10/2026).
 *
 * Danh mục và các phép tính đã lưu chỉ sống trong `localStorage` của máy khách: không tài khoản, không
 * máy chủ. Mặc định kho của một trang là loại "cố gắng giữ" (best-effort): Chrome được phép dọn cả kho
 * của trang khi đĩa sắp đầy, chọn trang ít dùng nhất trước. Xin `persist()` thì kho thành loại "giữ" và
 * chỉ người dùng xoá được. Chủ dự án hỏi dữ liệu của khách có mất khi thoát web không; đây là một trong
 * các việc sửa của lượt ấy (`TASK.md`).
 *
 * ── Chỉ gọi lúc người dùng VỪA LƯU một thứ, không gọi lúc mở trang ────────────────────────────────
 *
 * Chrome tự quyết không hỏi ai (trang đã cài, đã đánh dấu, hay dùng nhiều thì được). Firefox thì HIỆN
 * MỘT HỘP HỎI. Gọi lúc mở trang là bắt mọi người đọc công thức trả lời một câu về kho mà họ chưa dùng;
 * gọi ngay sau cú Lưu đầu tiên thì câu hỏi đến đúng lúc nó có nghĩa. Đã được giữ rồi thì không xin lại
 * (`persisted()`), nên hộp hỏi không lặp mỗi lần lưu.
 *
 * Safari: có `persist()` từ bản 17, nhưng KHÔNG gỡ được luật xoá kho của trang không được mở trong bảy
 * ngày dùng Safari (ITP). Trên iPhone, web thêm ra màn hình chính mới thoát luật ấy.
 *
 * Không bao giờ ném, không bao giờ chờ: trình duyệt không có API, từ chối, hay lỗi — đều chỉ là kho
 * vẫn ở loại cũ, và cú Lưu vừa rồi đã nằm trên đĩa từ trước khi hàm này chạy.
 */
export function requestPersistentStorage(): void {
  try {
    const storage = typeof navigator === 'undefined' ? undefined : navigator.storage;
    if (storage === undefined || typeof storage.persist !== 'function') return;

    const daGiu =
      typeof storage.persisted === 'function' ? storage.persisted() : Promise.resolve(false);
    void daGiu
      .then((giu) => (giu ? true : storage.persist()))
      .catch(() => {
        // Từ chối hay lỗi: kho vẫn là loại "cố gắng giữ", như trước khi có hàm này.
      });
  } catch {
    // Truy cập `navigator.storage` ném (trang nhúng bị chặn) — bỏ qua, không làm hỏng cú Lưu.
  }
}
