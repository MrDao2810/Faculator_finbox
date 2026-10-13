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

/**
 * Chỗ trống `{khoá}` của một mẫu thay số — MỘT biểu thức cho cả nơi phân tích mẫu lúc build
 * (`substitution-shape.ts`) lẫn cửa gác (`formulas.test.ts`), để hai bên không đọc mẫu theo hai kiểu.
 *
 * Dấu chấm vào bộ ký tự ngày 13/10/2026: khoá hằng số thị trường có dấu chấm
 * (`fee.brokerage.buy`), và mẫu nay nhắc tới hằng số bằng CHÍNH khoá ấy — xem `laKhoaHangSo`.
 *
 * Là HÀM chứ không phải một hằng: biểu thức mang cờ `g` giữ `lastIndex` giữa các lượt gọi, nên một
 * bản dùng chung sẽ đọc sai ngay lần đầu ai đó gọi `.test()` trên nó.
 */
export function choTrong(): RegExp {
  return /\{([A-Za-z0-9_.]+)\}/g;
}

/** Khoá biến mà một mẫu thay số nhắc tới — dùng cho cửa gác ở `formulas.test.ts`. */
export function substitutionKeys(template: string): ReadonlyArray<string> {
  return [...template.matchAll(choTrong())].map((match) => match[1] ?? '');
}

/**
 * Khoá này trỏ tới một HẰNG SỐ THỊ TRƯỜNG chứ không phải một ô nhập hay một ký hiệu dẫn xuất.
 *
 * Phân biệt bằng dấu chấm, và phép phân biệt ấy không thể nhập nhằng: mọi `MarketConstantKey` đều
 * có dấu chấm, còn khoá ô nhập (`VariableSpec.key`) và khoá dẫn xuất thì không bao giờ có. Nhờ vậy
 * mẫu không cần một trường bí danh riêng — nó khai KHOÁ, đúng như `usesConstants` và
 * `ConstantsNote` đã làm, còn giá trị thì chảy từ biểu phí đang chọn lúc chạy.
 */
export function laKhoaHangSo(key: string): boolean {
  return key.includes('.');
}
