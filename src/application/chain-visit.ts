/**
 * Tầng APPLICATION — chuỗi công thức và lượt xem (FR-15).
 *
 * ## Vì sao có file này
 *
 * `formula-visit.ts` chốt "sang công thức KHÁC là hết lượt, vào lại là về mặc định" (13/10/2026). Với
 * chuỗi móc nối, luật ấy làm hỏng đúng thứ chuỗi sinh ra để làm: bấm "Mở màn riêng của bước này" từ
 * Biên an toàn sang Mô hình Gordon, sửa số, quay lại — số vừa sửa mất, và Biên an toàn cũng về mặc
 * định, nên không thấy móc nối.
 *
 * Chủ dự án chọn (25/11/2026): giữ số **trong cùng một chuỗi**. Ra khỏi chuỗi (danh sách, Danh mục,
 * một công thức ngoài chuỗi) vẫn về mặc định như cũ. Luật 13/10 chỉ bị đảo đúng ở phạm vi chuỗi.
 *
 * ## Vì sao là danh sách ghim, không tính từ Registry
 *
 * `FormulaVisitTracker` nằm ở `AppShell`, mà client không được import Registry (cả 111 công thức sẽ
 * nằm trong JS của mọi trang). Nên đây là dữ liệu ghim, và `chain-visit.test.ts` tính lại từ
 * `dependsOn` của Registry rồi so từng dòng — lệch là đỏ.
 *
 * Cả 7 công thức có cạnh móc nối nằm chung MỘT thành phần liên thông (qua `capm`), nên chỉ cần một
 * danh sách. Nếu sau này Registry có hai chuỗi tách rời thì `chain-visit.test.ts` sẽ đỏ, và lúc đó
 * `sameChain()` phải đổi sang so khoá nhóm.
 *
 * Phần thuần, không import React.
 */

/** Mọi công thức đứng trong một chuỗi móc nối, bất kể đầu nguồn hay đầu nhận. */
export const CHAIN_FORMULA_IDS: ReadonlyArray<string> = [
  'capm',
  'mo-hinh-gordon',
  'bien-an-toan',
  'wacc',
  'fcff',
  'fcfe',
  'gia-tri-noi-tai-fcff',
];

/** Kho `sessionStorage` giữ các ô Ghi đè của chuỗi đang xem. Đổi khoá khi cấu trúc đổi. */
export const CHAIN_OVERRIDES_KEY = 'ffb.chain.v1';

/** Công thức `id` có đứng trong chuỗi móc nối không. */
export function isChainFormula(id: string): boolean {
  return CHAIN_FORMULA_IDS.includes(id);
}

/** Hai công thức có cùng một chuỗi không. Một công thức ngoài chuỗi không cùng chuỗi với ai, kể cả chính nó. */
export function sameChain(a: string, b: string): boolean {
  return isChainFormula(a) && isChainFormula(b);
}

/**
 * Các ô Ghi đè: `{ idCongThuc: { khoaBien: soGhiDe } }`. Cùng dạng `ChainOverrides` của Domain nhưng
 * khai báo lại ở đây để file này không phải import `@/core`.
 */
export type StoredOverrides = Record<string, Record<string, number>>;

/**
 * Đọc kho Ghi đè. Kho là thứ người dùng sửa được bằng tay nên mọi thứ không phải
 * `{ slug: { slug: số hữu hạn } }` bị bỏ chứ không đi tiếp.
 */
export function parseStoredOverrides(raw: string | null | undefined): StoredOverrides {
  if (raw === null || raw === undefined) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};

  const result: StoredOverrides = {};
  for (const [id, fields] of Object.entries(parsed)) {
    if (!isChainFormula(id)) continue;
    if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) continue;

    const clean: Record<string, number> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (/^[A-Za-z0-9_]{1,40}$/.test(key) && typeof value === 'number' && Number.isFinite(value)) {
        clean[key] = value;
      }
    }
    if (Object.keys(clean).length > 0) result[id] = clean;
  }
  return result;
}

/** Chuỗi JSON để ghi vào `sessionStorage`. */
export function serializeStoredOverrides(overrides: StoredOverrides): string {
  return JSON.stringify(parseStoredOverrides(JSON.stringify(overrides)));
}
