/**
 * Tầng DATA — cài đặt DataProvider đọc bộ số liệu tĩnh (gói WBS 2.5.1).
 *
 * FR-17: khi có nguồn dữ liệu thật thì viết một cài đặt khác của cùng interface này và đổi
 * chỗ khởi tạo, giao diện không phải sửa dòng nào.
 */

import { normalizeVi } from '@/core/registry';

import { SAMPLE_PRESETS, VN_INDEX_BARS } from './samples';
import type { DailyBar, DataProvider, Preset } from './types';

/** Dựng một provider từ danh sách preset cho sẵn — nhờ vậy test truyền được bộ giả. */
export function createStaticProvider(
  presets: ReadonlyArray<Preset> = SAMPLE_PRESETS,
  vnIndexBars: ReadonlyArray<DailyBar> = VN_INDEX_BARS,
): DataProvider {
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
  };
}

/** Provider dùng trong sản phẩm. Đang trỏ vào bộ số liệu bản thảo tự dựng. */
export const SAMPLE_DATA: DataProvider = createStaticProvider();

/** Bộ mẫu hiện có còn là bản thảo hay không — giao diện đọc cờ này để hiện cảnh báo. */
export function hasDraftData(provider: DataProvider = SAMPLE_DATA): boolean {
  return provider.list().some((item) => item.isDraft);
}
