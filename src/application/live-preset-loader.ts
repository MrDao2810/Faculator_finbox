/**
 * Tầng APPLICATION — nạp số liệu thật của MỘT mã cho màn chi tiết công thức (`?ma=`).
 *
 * ── Vì sao đứng riêng một file thay vì gọi thẳng `MARKET_FEED` trong `FormulaDetail` ────────
 *
 * Đây là **ranh giới nạp trễ**, cùng vai trò với `ChainPanel`, `FormulaChart` và `DetailBody`:
 * `FormulaDetail` chỉ `await import()` file này khi URL thật sự mang `?ma=`. Bản đầu import thẳng
 * và đo được cái giá: 111 trang chi tiết nặng thêm ~4 kB cho một tính năng mà hầu hết lượt mở
 * trang không chạm tới — trong khi chính những trang ấy đang là nhóm vượt cửa kiểm dung lượng xa
 * nhất (xem mục "Audit toàn dự án" trong TASK.md).
 *
 * ⚠ Đừng re-export hàm này từ `src/application/index.ts`. Barrel đó được import tĩnh ở khắp nơi,
 * nên một dòng re-export sẽ kéo `finbox/client.ts` + `finbox/map.ts` + `live-preset.ts` về lại gói
 * chung ngay lập tức — đúng thứ file này sinh ra để tránh. Cùng lý do `draw-card` không nằm trong
 * barrel `@/ui/sheets`.
 */

import { MARKET_FEED, isAbortError, presetFromSnapshot } from '@/data';
import type { DailyBar, Preset } from '@/data';

export type LivePresetResult =
  | { status: 'ok'; preset: Preset }
  /** Nơi gọi đã huỷ (rời trang, đổi mã) — không phải lỗi, đừng bày gì lên màn. */
  | { status: 'cancelled' }
  /**
   * Gọi được, máy chủ có trả lời, nhưng mã này KHÔNG có số liệu cơ bản dùng được — báo cáo chưa đủ
   * bốn quý liền nhau, hoặc bộ số không tự khớp (xem `finbox/map.ts`). **Thử lại là vô ích.**
   */
  | { status: 'no-data' }
  /** Mất mạng, HTTP lỗi, hình dạng phản hồi lạ. **Thử lại thì có thể được.** */
  | { status: 'failed' };

/**
 * Tra một mã rồi dựng `Preset` để `applyPreset()` nạp vào ô nhập.
 *
 * KHÔNG ném: mọi ngả hỏng đều quy về một `status`, vì nơi gọi là một effect trong React và FR-06
 * đòi màn phải nói rõ nguyên nhân chứ không được chết lặng.
 *
 * ── Vì sao `'no-data'` phải tách khỏi `'failed'` ────────────────────────────────────────────
 *
 * Trước đợt này ba nguyên nhân khác hẳn nhau cùng quy về `'failed'`, nên màn chỉ nói được một câu
 * "không lấy được số liệu của mã" cho cả ba. Người dùng chọn nhầm một chứng chỉ quỹ trong bảng
 * 1.649 mã nhận đúng câu mà họ nhận khi rớt wifi — và họ sẽ bấm thử lại, mãi mãi, vì câu ấy nghe
 * như một trục trặc tạm thời. Chỉ khoảng 903 trên 1.005 mã qua được `toFundamentals()`; số còn lại
 * sẽ KHÔNG BAO GIỜ nạp được, và màn phải nói ra điều đó thay vì mời họ thử lại.
 *
 * Phân biệt được vì `snapshots.get(code)` **có** trả về ảnh chụp — máy chủ đã trả lời, chỉ
 * `snapshot.fundamentals` là `null`. Hai ca ấy trước đây bị gộp ở cùng một dòng.
 */
export async function loadLivePreset(
  code: string,
  asOf: string,
  signal?: AbortSignal,
): Promise<LivePresetResult> {
  try {
    const [snapshots, history] = await Promise.all([
      MARKET_FEED.snapshots([code], signal),
      priceHistoryOrEmpty(code, signal),
    ]);
    if (signal?.aborted === true) return { status: 'cancelled' };

    const snapshot = snapshots.get(code.trim().toUpperCase());
    // Máy chủ trả lời mà không có mã này trong phản hồi — bất thường về phía nguồn, không phải
    // "mã thiếu số liệu". Thử lại có thể được, nên vẫn là `'failed'`.
    if (snapshot === undefined) return { status: 'failed' };

    const preset = presetFromSnapshot(snapshot, asOf, history);
    return preset === undefined ? { status: 'no-data' } : { status: 'ok', preset };
  } catch (error) {
    return isAbortError(error) ? { status: 'cancelled' } : { status: 'failed' };
  }
}

/**
 * Mười phiên giá gần nhất — **hỏng thì trả rỗng, không lan sang việc chính**.
 *
 * Chuỗi phiên là phần THÊM: có nó thì biểu đồ vẽ được đường thời gian bằng giá thật, mất nó thì
 * màn quay về đúng hành vi cũ (một phiên, đường quét giả định ±50%). Để một lời gọi phụ hỏng kéo
 * theo cả preset là đánh đổi ngược: người dùng mất luôn số liệu cơ bản — thứ họ thật sự đến vì nó
 * — chỉ vì không lấy được thứ trang trí.
 *
 * `Promise.all` ở trên nên hai lời gọi đi song song; nuốt lỗi PHẢI nằm trong hàm này chứ không ở
 * `catch` ngoài, kẻo một lỗi mạng của lời gọi phụ cũng thành `'failed'`.
 *
 * Lỗi HUỶ thì ném tiếp: `catch` ngoài đọc nó ra `'cancelled'`, và người dùng đã rời màn thì không
 * có gì để bày.
 */
async function priceHistoryOrEmpty(
  code: string,
  signal?: AbortSignal,
): Promise<ReadonlyArray<DailyBar>> {
  try {
    return await MARKET_FEED.priceHistory(code, signal);
  } catch (error) {
    if (isAbortError(error)) throw error;
    return [];
  }
}
