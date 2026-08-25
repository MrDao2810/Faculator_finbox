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
import type { Preset } from '@/data';

export type LivePresetResult =
  | { status: 'ok'; preset: Preset }
  /** Nơi gọi đã huỷ (rời trang, đổi mã) — không phải lỗi, đừng bày gì lên màn. */
  | { status: 'cancelled' }
  /** Không tra được: mất mạng, mã không có, hoặc số liệu không qua được đối chiếu. */
  | { status: 'failed' };

/**
 * Tra một mã rồi dựng `Preset` để `applyPreset()` nạp vào ô nhập.
 *
 * KHÔNG ném: mọi ngả hỏng đều quy về `'failed'`, vì nơi gọi là một effect trong React và FR-06
 * đòi màn phải nói rõ nguyên nhân chứ không được chết lặng.
 */
export async function loadLivePreset(
  code: string,
  asOf: string,
  signal?: AbortSignal,
): Promise<LivePresetResult> {
  try {
    const snapshots = await MARKET_FEED.snapshots([code], signal);
    if (signal?.aborted === true) return { status: 'cancelled' };

    const snapshot = snapshots.get(code.trim().toUpperCase());
    if (snapshot === undefined) return { status: 'failed' };

    const preset = presetFromSnapshot(snapshot, asOf);
    return preset === undefined ? { status: 'failed' } : { status: 'ok', preset };
  } catch (error) {
    return isAbortError(error) ? { status: 'cancelled' } : { status: 'failed' };
  }
}
