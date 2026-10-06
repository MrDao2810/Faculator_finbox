import type { FormulaSpec } from './registry/types';

/*
 * ── Mộ chí: `fillSubstitution()` — bỏ ngày 05/10/2026 ───────────────────────────────────────
 *
 * Nó thay con số vào mẫu rồi trả về MỘT DÒNG CHỮ, và màn in thẳng dòng ấy ra. Trên
 * `tra-gop-nien-kim` dòng ấy đọc ra thế này:
 *
 *   800.000.000 × 9,5 ÷ 100 ÷ 12 × (1 + 9,5 ÷ 100 ÷ 12)^(20 × 12) ÷ ((1 + 9,5 ÷ 100 ÷ 12)^(20 × 12) − 1)
 *
 * Chủ dự án chụp màn: *"đang hiển thị quá loạn khiến tôi là người code cũng khó hiểu"*. Dòng ấy nay
 * là một HÌNH VẼ — `substitutionShape` dựng cây lúc build, `datSoThaySo` đặt số lúc chạy.
 *
 * ĐỪNG DỰNG LẠI. In một công thức thành chữ một dòng là lỗi đã bị chụp màn BA LẦN: dòng "Áp vào
 * công thức" của bài tập, của khối Ví dụ thực tế (cả hai ngày 29/09/2026), rồi dòng này.
 *
 * `substitutionKeys` ở lại — cửa gác ở `formulas.test.ts` dùng nó để soát khoá của cả mẫu chính
 * lẫn từng biểu thức `substitutionDerived`.
 */

/** Khoá biến mà một mẫu thay số nhắc tới — dùng cho cửa gác ở `formulas.test.ts`. */
export function substitutionKeys(template: string): ReadonlyArray<string> {
  return [...template.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((match) => match[1] ?? '');
}
