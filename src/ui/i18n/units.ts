'use client';

import { useCallback } from 'react';

import { formatCalcOutput, formatValueWithUnit, labelInEnglish, unitLabel } from '@/application';
import type { CalcOutput, FormatNumberOptions } from '@/application';
import { usePick, usePreferences } from '@/application/preferences-context';

/**
 * Hai hook đọc ĐƠN VỊ theo locale — gói WBS 3.6.3, đợt "vài chỗ chưa đổi ngôn ngữ".
 *
 * ── Vì sao cần ──────────────────────────────────────────────────────────────────────────────
 *
 * `FormulaSpec.resultUnit` và `VariableSpec.unit` là chuỗi tiếng Việt trần (`'lần'`, `'tỷ ₫'`,
 * `'phiên'`). Đo trên Chrome thật ở chế độ EN: gần như mọi chỗ còn tiếng Việt trên màn đều là
 * đơn vị — chip cạnh ô nhập, đơn vị kết quả, ô Danh mục ("0 mã", "— %/năm"), thẻ bước của
 * chuỗi định giá. Bản dịch nằm ở `unitLabel()` (Domain); hai hook này là đường đưa nó ra màn.
 *
 * ── Vì sao KHÔNG sửa `formatCalcOutput()` để nó tự dịch ─────────────────────────────────────
 *
 * Vì `formatCalcOutput()` còn phục vụ **bản in và file xuất**, mà theo quyết định đã chốt thì
 * tài liệu xuất ra luôn là văn bản tiếng Việt trọn vẹn — kể cả khi giao diện đang chạy tiếng Anh
 * (xem `draw-card.ts`, `export-content.ts`). Nếu hàm Domain tự dịch theo locale thì file xuất
 * cũng đổi theo, tức phá đúng lời hứa ấy. Nên chỗ dịch phải là tầng UI, và chỉ những nơi vẽ ra
 * MÀN HÌNH mới gọi hai hook này. Domain giữ nguyên mặc định tiếng Việt.
 */

/** Nhãn đơn vị theo locale: `'lần'` → `'times'` khi đang ở EN. */
export function useUnitText(): (unit: string) => string {
  const pick = usePick();
  return useCallback((unit: string) => pick(unitLabel(unit)), [pick]);
}

/**
 * `formatCalcOutput()` nhưng đơn vị theo locale.
 *
 * Giữ nguyên mọi hành vi FR-06 của bản gốc: không tính được thì ra `_ _` kèm đơn vị, không bao
 * giờ ra NaN hay 0.
 */
export function useCalcText(): (out: CalcOutput, options?: FormatNumberOptions) => string {
  const pick = usePick();
  return useCallback(
    (out: CalcOutput, options?: FormatNumberOptions) =>
      formatCalcOutput(out, options, pick(unitLabel(out.unit))),
    [pick],
  );
}

/**
 * Nhãn số ĐÃ ĐỊNH DẠNG SẴN ở Domain (`'15,21 lần'`, `'300 tỷ ₫'`) theo locale — dành cho biểu đồ,
 * nơi Domain trao chuỗi chứ không trao cặp số + đơn vị. Không dịch ở Domain, cùng lý do hai hook
 * trên: phần chữ của file xuất đọc chuỗi gốc và phải giữ tiếng Việt. Xem `labelInEnglish()`.
 *
 * Biết trước, không đổi: hình biểu đồ trong file xuất là BẢN CHÉP `<svg>` đang hiện
 * (`chart-snapshot.ts`), nên xuất lúc đang ở EN thì hình mang chữ tiếng Anh — tiêu đề trục đã như
 * thế từ khi trục song ngữ, nay đơn vị trên hình đi cùng.
 */
export function useLabelText(): (label: string) => string {
  const { locale } = usePreferences();
  return useCallback(
    (label: string) => (locale === 'en' ? labelInEnglish(label) : label),
    [locale],
  );
}

/** `formatValueWithUnit()` nhưng đơn vị theo locale. */
export function useValueText(): (
  value: number,
  unit: string,
  options?: FormatNumberOptions,
) => string {
  const pick = usePick();
  return useCallback(
    (value: number, unit: string, options?: FormatNumberOptions) =>
      formatValueWithUnit(value, pick(unitLabel(unit)), options),
    [pick],
  );
}
