/**
 * Barrel của khối hướng dẫn.
 *
 * Chỉ xuất `GuideHint` — nút "?" tròn. `GuideBody`/`GuideMuc` cố ý đứng ngoài: xuất chúng ra đây
 * là mang thân bài vào gói của mọi trang nhập barrel này. Trang `/huong-dan/cong-thuc/<id>/` và
 * khung bật tại nút đều import THẲNG `@/ui/guide/GuideBody`.
 *
 * ── Mộ chí: `GuidePanel` / `GuidePanelBody` (02/10 → 03/10/2026) ──────────────────────────────
 *
 * Đợt 2 dựng một ngăn kéo trượt từ mép phải (`BottomSheet placement="right"`) mang CẢ bài. Nó
 * sống đúng một ngày: chủ dự án xem rồi chốt *"bấm vào '?' thì có một popup xổ ra ở chỗ trỏ chuột
 * ấy chứ không phải là ở slide"*. Lý do đọc được ngay trên màn — một tấm dán mép phải không nói
 * được nó trả lời cho CHỖ NÀO, nên người bấm dấu hỏi cạnh khối Số liệu phải đưa mắt sang đầu kia
 * màn hình để tìm câu trả lời. Thay bằng `GuideHintPanel` ở `src/app/cong-thuc/[id]/`, bật ra
 * ngay tại nút và chỉ mang ĐÚNG MỘT mục.
 *
 * Đừng dựng lại ngăn kéo cho "đọc cả bài": chỗ đọc cả bài là trang đầy đủ, nó đã có URL thật.
 */

export { GuideHint } from './GuideHint';
export type { GuideHintProps } from './GuideHint';
