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
 * `chain-visit.test.ts` tính lại bảng tổ tiên từ `dependsOn` của Registry và so từng dòng.
 *
 * Phần thuần, không import React.
 */

/**
 * Với mỗi công thức NHẬN số: mọi công thức ở thượng nguồn của nó (trực tiếp và gián tiếp, đúng tập mà
 * `chainFor()` bày thành thẻ bước). Hai công thức "cùng chuỗi" khi cái này đứng ở thượng nguồn cái kia,
 * KHÔNG phải khi chúng chỉ cùng thuộc một đồ thị liên thông: P/E và P/B đều dính EPS/BVPS nhưng đi từ
 * P/E sang P/B thì không có số nào để mang theo, và mã đang nạp vẫn không được dính sang công thức lạ
 * (luật 13/10/2026).
 */
export const CHAIN_ANCESTORS: Readonly<Record<string, ReadonlyArray<string>>> = {
  pe: ['eps-co-ban'],
  pb: ['bvps'],
  'ty-le-chi-tra-co-tuc': ['eps-co-ban'],
  ev: ['von-hoa-thi-truong'],
  'ev-ebitda': ['ev', 'von-hoa-thi-truong'],
  'ev-sales': ['ev', 'von-hoa-thi-truong'],
  peg: ['eps-co-ban', 'pe'],
  'so-graham': ['bvps', 'eps-co-ban'],
  'ty-suat-loi-nhuan-tren-gia': ['eps-co-ban'],
  'gia-muc-tieu': ['eps-co-ban'],
  'mo-hinh-gordon': ['capm'],
  'ddm-hai-giai-doan': ['capm'],
  wacc: ['capm', 'von-hoa-thi-truong'],
  fcfe: ['fcff'],
  'gia-tri-noi-tai-fcff': ['capm', 'fcff', 'von-hoa-thi-truong', 'wacc'],
  'bien-an-toan': ['capm', 'mo-hinh-gordon'],
  'tong-loi-suat-tai-dau-tu': ['cagr', 'ty-suat-co-tuc'],
};

/** Mọi công thức đứng trong một chuỗi móc nối, bất kể đầu nguồn hay đầu nhận. */
export const CHAIN_FORMULA_IDS: ReadonlyArray<string> = [
  ...new Set(Object.entries(CHAIN_ANCESTORS).flatMap(([id, ancestors]) => [id, ...ancestors])),
];

/**
 * Các công thức "cùng chuỗi" với `id`: chính nó, thượng nguồn của nó và những công thức nhận số từ
 * nó. Ngoài chuỗi thì rỗng.
 */
export function chainMembersOf(id: string): ReadonlyArray<string> {
  const up = CHAIN_ANCESTORS[id] ?? [];
  const down = Object.entries(CHAIN_ANCESTORS)
    .filter(([, ancestors]) => ancestors.includes(id))
    .map(([receiver]) => receiver);
  return up.length === 0 && down.length === 0 ? [] : [id, ...up, ...down];
}

/** Kho `sessionStorage` giữ các ô Ghi đè của chuỗi đang xem. Đổi khoá khi cấu trúc đổi. */
export const CHAIN_OVERRIDES_KEY = 'ffb.chain.v1';

/** Công thức `id` có đứng trong chuỗi móc nối không. */
export function isChainFormula(id: string): boolean {
  return CHAIN_FORMULA_IDS.includes(id);
}

/** Hai công thức có cùng chuỗi không: cái này đứng ở thượng nguồn cái kia (hoặc là chính nó, nếu nó trong chuỗi). */
export function sameChain(a: string, b: string): boolean {
  return chainMembersOf(a).includes(b);
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
