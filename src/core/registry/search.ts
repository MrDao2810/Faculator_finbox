/**
 * Tầng DOMAIN — tìm kiếm, lọc và sắp xếp công thức (gói WBS 2.2, FR-19).
 *
 * Yêu cầu cốt lõi: **gõ không dấu vẫn ra đúng kết quả** (NFR-USA-03).
 * Gõ "dinh gia" ra "Định giá", gõ "p e" ra "P/E" — người dùng điện thoại hiếm khi bật bộ gõ
 * tiếng Việt chỉ để tra một công thức.
 *
 * Toàn bộ file là hàm thuần, không đụng React, nên test được bằng Node và tái dùng được
 * cho SearchBox, màn danh sách lẫn bố cục desktop.
 *
 * Nhận `FormulaSummary` chứ không phải `FormulaSpec`: ở đây chỉ đụng tới id, tên, mô tả, thẻ
 * và cờ nổi bật. Khai kiểu hẹp đúng thứ mình dùng khiến màn danh sách không có cớ để kéo theo
 * diễn giải và hàm tính của cả Registry (NFR-PER-04). `FormulaSpec` vẫn truyền vào được.
 */

import { CATEGORIES } from './categories';
import type { Category, FormulaQuery, FormulaSummary } from './types';
import type { Level } from '../types';

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

function fieldsOf(formula: FormulaSummary): Field[] {
  return [
    { tokens: tokenize(formula.id), weight: 12 },
    { tokens: tokenize(formula.name.vi), weight: 10 },
    { tokens: tokenize(formula.name.en), weight: 6 },
    { tokens: formula.tags.flatMap(tokenize), weight: 5 },
    { tokens: tokenize(formula.description.vi), weight: 2 },
    { tokens: tokenize(formula.description.en), weight: 2 },
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
export function scoreFormula(formula: FormulaSummary, queryTokens: ReadonlyArray<string>): number {
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
function compareName(a: FormulaSummary, b: FormulaSummary): number {
  return a.name.vi.localeCompare(b.name.vi, 'vi');
}

/**
 * Tìm công thức theo chuỗi người dùng gõ, sắp theo độ liên quan.
 * Chuỗi rỗng thì trả về mảng rỗng — nơi gọi tự quyết hiện gì khi chưa gõ gì.
 */
export function searchFormulas(
  formulas: ReadonlyArray<FormulaSummary>,
  query: string,
): FormulaSummary[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  return formulas
    .map((formula) => ({ formula, score: scoreFormula(formula, tokens) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || compareName(a.formula, b.formula))
    .map((hit) => hit.formula);
}

function segmentOf(
  formula: FormulaSummary,
  categories: ReadonlyArray<Category>,
): Category['segment'] | null {
  return categories.find((c) => c.id === formula.categoryId)?.segment ?? null;
}

/**
 * Lọc theo mảng và nhóm, KHÔNG áp chuỗi tìm kiếm.
 * Tách riêng để số đếm của từng nhóm tính được mà không bị chính bộ lọc nhóm ảnh hưởng.
 */
function applyFacets(
  formulas: ReadonlyArray<FormulaSummary>,
  query: Pick<FormulaQuery, 'segment' | 'categoryId'>,
  categories: ReadonlyArray<Category>,
  ignoreCategory = false,
): FormulaSummary[] {
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
  formulas: ReadonlyArray<FormulaSummary>,
  query: FormulaQuery,
  categories: ReadonlyArray<Category> = CATEGORIES,
): FormulaSummary[] {
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
 * Bộ công thức nhìn thấy được ở một chế độ hiển thị — vế THỨ HAI của FR-09.
 *
 * Wireframe chốt FR-09 bằng hai câu: "Nhãn Cơ bản / Nâng cao hiển thị trên mỗi công thức" (đã
 * có, là badge trên thẻ) và "Chế độ Nâng cao mở toàn bộ tham số **và công thức phức tạp**".
 * Hàm này là vế sau: chế độ Cơ bản chỉ giữ công thức mức `basic`, Nâng cao trả nguyên bộ.
 *
 * Trước đợt này chỉ vế "tham số" được nối, mà `level: 'advanced'` ở biến chỉ có ở 10 / 111 công
 * thức — nên nút chuyển chế độ nằm ở thanh trên của mọi màn mà bấm vào gần như không đổi gì.
 *
 * Generic để `FormulaSpec` truyền vào vẫn ra `FormulaSpec`, không bị hạ kiểu xuống summary.
 */
export function formulasForLevel<T extends Pick<FormulaSummary, 'level'>>(
  formulas: ReadonlyArray<T>,
  mode: Level,
): ReadonlyArray<T> {
  if (mode === 'advanced') return formulas;
  return formulas.filter((formula) => formula.level === 'basic');
}

/**
 * Bao nhiêu công thức KHỚP bộ lọc hiện tại nhưng đang bị chế độ Cơ bản giấu đi.
 *
 * Đây là con số nói ra thành lời trên màn ("N công thức nâng cao đang ẩn"), nên nó phải đếm
 * đúng thứ người dùng sẽ thấy thêm khi bật Nâng cao — không phải tổng số công thức nâng cao.
 * Vì vậy nó đi qua chính `selectFormulas()` chứ không tự lọc lại: một bộ lọc thứ hai viết tay
 * là chỗ để con số và danh sách lệch nhau.
 */
export function countHiddenByLevel(
  formulas: ReadonlyArray<FormulaSummary>,
  query: FormulaQuery,
  mode: Level,
  categories: ReadonlyArray<Category> = CATEGORIES,
): number {
  if (mode === 'advanced') return 0;
  return selectFormulas(formulas, query, categories).filter((f) => f.level === 'advanced').length;
}

/**
 * Số đếm hiện cạnh từng nhóm trong danh sách chọn của WF-02.
 *
 * Có áp mảng và chuỗi tìm kiếm nhưng KHÔNG áp nhóm đang chọn — để người dùng thấy được
 * chọn nhóm khác thì còn bao nhiêu kết quả, thay vì thấy toàn số 0.
 */
export function countByCategoryFor(
  formulas: ReadonlyArray<FormulaSummary>,
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
  formulas: ReadonlyArray<FormulaSummary>,
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
