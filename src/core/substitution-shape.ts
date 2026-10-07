import { expressionShape } from './quiz/worked-line';
import type { FormulaSpec } from './registry/types';
import type { DanXuatCay, ThaySoCay } from './substitution-cay';

/**
 * Phân tích mẫu `spec.substitution` thành cây vẽ được — CHỈ CHẠY LÚC BUILD (05/10/2026).
 *
 * File này nhập `worked-line.ts`, tức bộ phân tích cú pháp 24 kB, nên nó KHÔNG ĐƯỢC đi vào gói của
 * trình duyệt. Cửa gác ở `build-only-imports.test.ts` khoá đúng một nơi được nhập nó.
 *
 * Phần còn lại của câu chuyện — vì sao tách cây dựng lúc build khỏi số đặt lúc chạy — ở docblock
 * `./substitution-cay.ts`.
 *
 * ## Mẹo dùng Ô TRỐNG làm chỗ chờ
 *
 * Mẫu viết `{khoa}`, mà bộ phân tích chỉ biết số. Thay vì thêm một loại nút mới vào `Nut` (kéo theo
 * `chieuCao`, `CongThucDien` và bộ tính đều phải biết nó), chỗ chờ dùng luôn **ô trống `[0]`** — thứ
 * `Nut` đã có sẵn cho câu điền số, `CongThucDien` đã vẽ được, `chieuCao` đã đếm được. Ô trống thứ `i`
 * ứng với khoá thứ `i`, theo đúng thứ tự trái sang phải, và `datSoThaySo` lúc chạy đổi nó thành lá số.
 */

/** Một mẫu đã phân tích: cây, cộng danh sách khoá theo thứ tự ô trống trái sang phải. */
function cayCua(mau: string): { cay: ThaySoCay['cay']; khoa: string[] } | null {
  const khoa: string[] = [];
  const voiOTrong = mau.replace(/\{([A-Za-z0-9_]+)\}/g, (_, key: string) => {
    khoa.push(key);
    return '[0]';
  });

  const cay = expressionShape(voiOTrong);
  return cay === null ? null : { cay, khoa };
}

/**
 * Cây của dòng thay số, hoặc `null` nếu mẫu không đọc được.
 *
 * `null` là lưới an toàn chứ không phải nhánh sống: cửa gác ở `formulas.test.ts` quét cả 48 mẫu, nên
 * một mẫu hỏng đỏ từ lúc chạy ca kiểm. Nơi gọi vẫn phải xử `null` vì nó là server component dựng
 * tĩnh — ném ra ở đó là làm hỏng cả trang.
 */
export function substitutionShape(spec: FormulaSpec): ThaySoCay | null {
  if (spec.substitution === undefined) return null;

  const chinh = cayCua(spec.substitution);
  if (chinh === null) return null;

  const danXuat: DanXuatCay[] = [];
  for (const [khoaDat, mau] of Object.entries(spec.substitutionDerived ?? {})) {
    const phan = cayCua(mau);
    if (phan === null) return null;
    danXuat.push({ khoaDat, cay: phan.cay, khoa: phan.khoa });
  }

  return { cay: chinh.cay, khoa: chinh.khoa, danXuat };
}
