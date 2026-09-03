/**
 * Tầng DATA — cài đặt DataProvider đọc bộ số liệu tĩnh (gói WBS 2.5.1).
 *
 * FR-17: khi có nguồn dữ liệu thật thì viết một cài đặt khác của cùng interface này và đổi
 * chỗ khởi tạo, giao diện không phải sửa dòng nào.
 */

import { normalizeVi } from '@/core/registry';

import { SAMPLE_PRESETS, VN_INDEX_BARS } from './samples';
import { PRESET_CONTRACT_VERSION } from './types';
import type { DailyBar, DataProvider, Preset } from './types';

/**
 * Kiểm phiên bản hợp đồng dữ liệu trước khi bộ số liệu đi tiếp (SW-05 · LDR-05).
 *
 * NÉM lỗi chứ không lặng lẽ lọc bỏ bộ sai phiên bản: provider dựng ở phạm vi module, tức lúc
 * build và lúc chạy test, nên lỗi lộ ra ở CI chứ không bao giờ tới tay người dùng. Lọc im lặng
 * thì triệu chứng duy nhất là sheet "Nạp mẫu" thiếu vài mã — không ai lần ra được vì sao.
 *
 * Câu lỗi nói cả hai con số vì ca hay gặp nhất là nhận một bộ số liệu do bên khác sinh.
 */
function assertContract(presets: ReadonlyArray<Preset>): void {
  const lech = presets.filter((item) => item.version !== PRESET_CONTRACT_VERSION);
  if (lech.length === 0) return;

  const chiTiet = lech.map((item) => `${item.code} (v${String(item.version)})`).join(', ');
  throw new Error(
    `Bộ số liệu mẫu sai phiên bản hợp đồng: ${chiTiet} — bản này đọc v${String(
      PRESET_CONTRACT_VERSION,
    )}. Sinh lại bộ số liệu, hoặc nâng PRESET_CONTRACT_VERSION nếu hình dạng dữ liệu đã đổi.`,
  );
}

/** Dựng một provider từ danh sách preset cho sẵn — nhờ vậy test truyền được bộ giả. */
export function createStaticProvider(
  presets: ReadonlyArray<Preset> = SAMPLE_PRESETS,
  vnIndexBars: ReadonlyArray<DailyBar> = VN_INDEX_BARS,
  /*
   * Mặc định `true` vì `VN_INDEX_BARS` đang là PRNG (xem docblock của nó ở `samples.ts`). Đây là
   * tham số chứ không phải hằng số trong thân hàm để test truyền được chuỗi thật kèm `false`, và
   * để ngày có nguồn thật thì chỉ sửa đúng chỗ khởi tạo `SAMPLE_DATA` bên dưới.
   */
  vnIndexIsDraft = true,
): DataProvider {
  assertContract(presets);

  const byCode = new Map(presets.map((item) => [item.code.toUpperCase(), item]));

  return {
    list: () => presets,

    byCode: (code) => byCode.get(code.trim().toUpperCase()),

    search: (query) => {
      const needle = normalizeVi(query).trim();
      if (needle === '') return presets;

      return presets.filter((item) => {
        const haystack = `${normalizeVi(item.code)} ${normalizeVi(item.name)}`;
        return haystack.includes(needle);
      });
    },

    vnIndex: () => vnIndexBars,

    vnIndexIsDraft: () => vnIndexIsDraft,
  };
}

/** Provider dùng trong sản phẩm. Đang trỏ vào bộ số liệu bản thảo tự dựng. */
export const SAMPLE_DATA: DataProvider = createStaticProvider();

/** Bộ mẫu hiện có còn là bản thảo hay không — giao diện đọc cờ này để hiện cảnh báo. */
export function hasDraftData(provider: DataProvider = SAMPLE_DATA): boolean {
  return provider.list().some((item) => item.isDraft);
}

/**
 * Chuỗi VN-Index đang dùng có phải số tự dựng hay không.
 *
 * Tách khỏi `hasDraftData()` chứ không gộp: hai chuỗi có đường đi khác hẳn nhau. Bộ mẫu của bốn
 * mã chỉ vào `ctx` khi người dùng bấm "Nạp mẫu" và màn đã nói rõ điều đó ở bốn chỗ; chuỗi chỉ số
 * thì LUÔN nằm trong `ctx.marketSeries` mà không ai bấm gì cả.
 */
export function hasDraftMarketSeries(provider: DataProvider = SAMPLE_DATA): boolean {
  return provider.vnIndexIsDraft();
}
