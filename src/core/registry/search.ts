/**
 * Tầng DOMAIN — tìm kiếm, lọc và sắp xếp công thức (gói WBS 2.2, FR-19).
 *
 * Yêu cầu cốt lõi: **gõ không dấu vẫn ra đúng kết quả** (NFR-USA-03).
 * Gõ "dinh gia" ra "Định giá", gõ "p e" ra "P/E" — người dùng điện thoại hiếm khi bật bộ gõ
 * tiếng Việt chỉ để tra một công thức.
 *
 * Toàn bộ file là hàm thuần, không đụng React, nên test được bằng Node và tái dùng được
 * cho SearchBox, màn danh sách lẫn bố cục desktop.
 */

import { CATEGORIES } from './categories';
import type { Category, FormulaQuery, FormulaSpec } from './types';

/**
 * Bỏ dấu tiếng Việt và hạ chữ thường.
 *
 * NFD tách nguyên âm khỏi dấu thanh rồi xoá phần dấu; riêng chữ 'đ' không tách được bằng NFD
 * nên phải đổi tay.
 */
export function normalizeVi(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Cắt chuỗi thành các từ khoá.
 * Mọi ký tự không phải chữ hay số đều là dấu ngăn — nhờ vậy "P/E" và "p e" ra cùng một bộ từ.
 */
export function tokenize(text: string): string[] {
  return normalizeVi(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token !== '');
}

/** Các trường được đem ra so khớp, kèm trọng số. Trường càng đúng ý người tìm thì điểm càng cao. */
interface Field {
  tokens: ReadonlyArray<string>;
  weight: number;
}

function fieldsOf(formula: FormulaSpec): Field[] {
  return [
    { tokens: tokenize(formula.id), weight: 12 },
    { tokens: tokenize(formula.name.vi), weight: 10 },
    { tokens: tokenize(formula.name.en), weight: 6 },
    { tokens: formula.tags.flatMap(tokenize), weight: 5 },
    { tokens: tokenize(formula.description), weight: 2 },
  ];
}

/**
 * Chấm điểm một công thức với bộ từ khoá đã cắt sẵn.
 *
 * Quy tắc: MỌI từ khoá đều phải khớp ít nhất một từ trong công thức, nếu không thì 0 điểm.
 * Khớp tính theo tiền tố, để gõ dở chừng đã có gợi ý ("dinh" ra "định giá").
 *
 * @returns 0 nghĩa là không khớp
 */
export function scoreFormula(formula: FormulaSpec, queryTokens: ReadonlyArray<string>): number {
  if (queryTokens.length === 0) return 0;

  const fields = fieldsOf(formula);
  let total = 0;

  for (const queryToken of queryTokens) {
    let best = 0;

    for (const field of fields) {
      for (const token of field.tokens) {
        if (!token.startsWith(queryToken)) continue;
        // Khớp trọn cả từ đáng giá hơn khớp mỗi phần đầu.
        const points = token === queryToken ? field.weight * 2 : field.weight;
        if (points > best) best = points;
      }
    }

    // Thiếu một từ khoá là loại — người tìm "dinh gia dcf" không muốn thấy mọi công thức định giá.
    if (best === 0) return 0;
    total += best;
  }

  // Công thức thiết thực hằng ngày được nhỉnh hơn khi điểm ngang nhau (FR-20).
  if (formula.isFeatured === true) total += 3;

  return total;
}

/** So sánh tên theo thứ tự chữ cái tiếng Việt. */
function compareName(a: FormulaSpec, b: FormulaSpec): number {
  return a.name.vi.localeCompare(b.name.vi, 'vi');
}

/**
 * Tìm công thức theo chuỗi người dùng gõ, sắp theo độ liên quan.
 * Chuỗi rỗng thì trả về mảng rỗng — nơi gọi tự quyết hiện gì khi chưa gõ gì.
 */
export function searchFormulas(formulas: ReadonlyArray<FormulaSpec>, query: string): FormulaSpec[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  return formulas
    .map((formula) => ({ formula, score: scoreFormula(formula, tokens) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || compareName(a.formula, b.formula))
    .map((hit) => hit.formula);
}

function segmentOf(
  formula: FormulaSpec,
  categories: ReadonlyArray<Category>,
): Category['segment'] | null {
  return categories.find((c) => c.id === formula.categoryId)?.segment ?? null;
}

/**
 * Lọc theo mảng và nhóm, KHÔNG áp chuỗi tìm kiếm.
 * Tách riêng để số đếm của từng nhóm tính được mà không bị chính bộ lọc nhóm ảnh hưởng.
 */
function applyFacets(
  formulas: ReadonlyArray<FormulaSpec>,
  query: Pick<FormulaQuery, 'segment' | 'categoryId'>,
  categories: ReadonlyArray<Category>,
  ignoreCategory = false,
): FormulaSpec[] {
  return formulas.filter((formula) => {
    if (query.segment !== 'all' && segmentOf(formula, categories) !== query.segment) return false;
    if (!ignoreCategory && query.categoryId !== null && formula.categoryId !== query.categoryId) {
      return false;
    }
    return true;
  });
}

/**
 * Danh sách cuối cùng của màn WF-02: lọc mảng → lọc nhóm → tìm → sắp xếp.
 *
 * Khi có chuỗi tìm kiếm và người dùng chưa đổi cách sắp xếp, thứ tự là theo độ liên quan.
 * Chọn A–Z hay Z–A thì thứ tự chữ cái được ưu tiên, vì đó là lựa chọn có chủ đích của người dùng.
 */
export function selectFormulas(
  formulas: ReadonlyArray<FormulaSpec>,
  query: FormulaQuery,
  categories: ReadonlyArray<Category> = CATEGORIES,
): FormulaSpec[] {
  const faceted = applyFacets(formulas, query, categories);
  const hasQuery = tokenize(query.q).length > 0;

  const matched = hasQuery ? searchFormulas(faceted, query.q) : [...faceted];

  if (query.sort === 'az') return matched.sort(compareName);
  if (query.sort === 'za') return matched.sort((a, b) => compareName(b, a));

  // 'featured': đang tìm thì giữ thứ tự độ liên quan; chưa tìm thì công thức nổi bật lên trước.
  if (hasQuery) return matched;
  return matched.sort((a, b) => {
    const featured = Number(b.isFeatured ?? false) - Number(a.isFeatured ?? false);
    return featured !== 0 ? featured : compareName(a, b);
  });
}

/**
 * Số đếm hiện cạnh từng nhóm trong danh sách chọn của WF-02.
 *
 * Có áp mảng và chuỗi tìm kiếm nhưng KHÔNG áp nhóm đang chọn — để người dùng thấy được
 * chọn nhóm khác thì còn bao nhiêu kết quả, thay vì thấy toàn số 0.
 */
export function countByCategoryFor(
  formulas: ReadonlyArray<FormulaSpec>,
  query: FormulaQuery,
  categories: ReadonlyArray<Category> = CATEGORIES,
): ReadonlyMap<string, number> {
  const pool = applyFacets(formulas, query, categories, true);
  const matched = tokenize(query.q).length > 0 ? searchFormulas(pool, query.q) : pool;

  const counts = new Map<string, number>();
  for (const category of categories) counts.set(category.id, 0);
  for (const formula of matched) {
    counts.set(formula.categoryId, (counts.get(formula.categoryId) ?? 0) + 1);
  }
  return counts;
}

/** Số công thức của từng mảng, cho ba chip Tất cả · Chứng khoán · Cá nhân. */
export function countBySegmentFor(
  formulas: ReadonlyArray<FormulaSpec>,
  query: FormulaQuery,
  categories: ReadonlyArray<Category> = CATEGORIES,
): Readonly<Record<'all' | 'stock' | 'personal', number>> {
  const matched = tokenize(query.q).length > 0 ? searchFormulas(formulas, query.q) : [...formulas];

  let stock = 0;
  let personal = 0;
  for (const formula of matched) {
    const segment = segmentOf(formula, categories);
    if (segment === 'stock') stock += 1;
    else if (segment === 'personal') personal += 1;
  }

  return { all: matched.length, stock, personal };
}
