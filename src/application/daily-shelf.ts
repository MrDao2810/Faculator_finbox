/**
 * Tầng APPLICATION — mười sáu ô của khối "Công thức dùng hằng ngày" (FR-20) trên màn Công thức.
 *
 * ── Vì sao có danh sách riêng, không lấy thẳng cờ `isFeatured` ────────────────────────────────
 *
 * Trước ngày 15/09/2026 khối này nằm ở trang chủ và bày ĐỦ 19 công thức gắn cờ `isFeatured`. Khi
 * trang chủ gộp vào màn Công thức, bản vẽ chủ dự án đưa ra đặt khối lên đầu màn với đúng 8 ô (4 × 2
 * ở khổ PC). Cùng ngày chủ dự án chốt thêm: kệ có 16 ô, lúc đầu chỉ bày `DAILY_SHELF_PREVIEW` ô đầu,
 * bấm "Xem tất cả" mới bày đủ. Mười chín ô bày hết ở vị trí ấy đẩy danh sách xuống dưới năm hàng thẻ
 * — đúng thứ bản vẽ bỏ đi.
 *
 * Tám ô đầu có THỨ TỰ riêng theo bản vẽ, không trùng thứ tự của 19 ghim trong Registry, nên cả mảng
 * là một danh sách đặt tên chứ không phải "16 cái đầu của `isFeatured`". Mọi ô vẫn phải mang cờ ấy —
 * `daily-shelf.test.ts` gác — vì kệ này là một lát cắt của bộ ghim tay, không phải bộ thứ hai.
 *
 * Tám ô sau phủ đủ bảy nhóm có ghim tay mà CHƯA có mặt ở tám ô đầu (Định giá lấy hai ô, sáu nhóm kia
 * mỗi nhóm một), để "Xem tất cả" mở ra chiều rộng của thư viện chứ không thêm một P/E thứ hai. Ba
 * ghim bị bỏ ra đều trùng nhóm với một ô đã có: `ev-ebitda` (Định giá, mức Nâng cao),
 * `co-vi-the-phai-sinh` (Phái sinh) và `lich-tra-no` (Vay). Cờ `isFeatured` của chúng KHÔNG mất
 * việc: nó vẫn quyết cách sắp mặc định "Thiết thực trước" của danh sách, điểm cộng khi tìm kiếm, và
 * priority 0,8 trong sitemap.
 *
 * ── Ba điều đáng ghi về các id ────────────────────────────────────────────────────────────────
 *
 *   - `loi-nhuan-rong` là ô "Phí & thuế giao dịch" của bản vẽ. Registry không có công thức "tổng chi
 *     phí một lệnh"; màn tính phí WF-08 gắn vào đúng công thức này từ đợt 8.
 *   - `xirr` là công thức mức Nâng cao. Kệ KHÔNG lọc theo chế độ — quyết định cũ của FR-20 giữ
 *     nguyên: kệ ghim tay mà đổi số ô theo nút chế độ thì không còn là kệ ghim tay.
 *   - Mảng này viết bằng chuỗi nháy đơn, mỗi id một dòng. `scripts/verify-static.mjs` và
 *     `scripts/chrome-check.mjs` đọc nó bằng biểu thức chính quy để đếm và đối chiếu thứ tự ô trong
 *     bản build — đổi hình dạng mảng là hai script ấy trượt.
 */

import type { FormulaSummary } from '@/core/registry';

export const DAILY_SHELF_IDS = [
  'loi-nhuan-rong',
  'gia-hoa-von',
  'roi',
  'cagr',
  'xirr',
  'pe',
  'pb',
  'ty-suat-co-tuc',
  'von-hoa-thi-truong',
  'bien-an-toan',
  'co-lenh-rui-ro',
  'rsi-wilder',
  'lai-lo-vi-the-long',
  'tra-gop-nien-kim',
  'lai-kep',
  'gia-von-trung-binh-dca',
] as const;

/**
 * Số ô kệ bày ra trước khi người dùng bấm "Xem tất cả": hai hàng ở khổ PC (lưới 4 cột), bốn hàng ở
 * 360px (lưới 2 cột).
 *
 * Cắt theo VỊ TRÍ sau khi đã sắp theo lịch sử, không theo id: công thức hay mở được đưa lên đầu
 * (`rankFeaturedIds`) thì phải nằm trong phần nhìn thấy ngay. `PERSONAL_SLOTS` nhỏ hơn số này, nên
 * phần nhìn thấy luôn còn ô ghim tay.
 */
export const DAILY_SHELF_PREVIEW = 8;

/**
 * Cờ "kệ đang mở đủ" trong `sessionStorage` — `'1'` là mở, không có khoá là thu gọn.
 *
 * Không nhớ thì nút quay lại hỏng: `OriginTracker` khôi phục vị trí cuộn bằng một con số `scrollY`,
 * mà kệ mở đủ cao hơn kệ thu gọn 2 hàng thẻ ở PC, 4 hàng ở 360px. Mở kệ, cuộn xuống danh sách, mở
 * một thẻ rồi quay lại thì kệ đã thu về và người dùng rơi xuống dưới chỗ cũ chừng ấy.
 *
 * `sessionStorage` chứ không `localStorage`: đây là trạng thái của một lượt xem trong tab, cùng loại
 * với `ffb.origin.v1`, không phải tuỳ chọn cần sống qua lần mở trình duyệt sau — và nhờ vậy không
 * phải thêm một dòng vào khối "Dữ liệu của bạn" ở màn Cài đặt.
 */
export const DAILY_SHELF_OPEN_KEY = 'ffb.shelf.open.v1';

/**
 * Các công thức của kệ, đúng thứ tự `DAILY_SHELF_IDS`.
 *
 * Id không tra ra thì bỏ qua chứ không ném lỗi — kệ thiếu một ô vẫn hơn màn Công thức gãy ngay lúc
 * build. Ca kiểm đã chặn chuyện đó từ trước, nên nhánh ấy chỉ là lưới an toàn.
 *
 * Trả đúng các object được truyền vào, KHÔNG sao chép: chỉ mục từ khoá của phép tìm là `WeakMap`
 * khoá theo danh tính object (xem `core/registry/search.ts`), chép ra là mất nó trong im lặng.
 */
export function dailyShelfFormulas<T extends Pick<FormulaSummary, 'id'>>(
  formulas: ReadonlyArray<T>,
): T[] {
  const byId = new Map(formulas.map((formula) => [formula.id, formula]));
  return DAILY_SHELF_IDS.flatMap((id) => {
    const formula = byId.get(id);
    return formula === undefined ? [] : [formula];
  });
}
