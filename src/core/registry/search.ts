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

/**
 * Chỉ mục từ khoá đã cắt sẵn, nhớ theo từng công thức.
 *
 * Vì sao cần: một phím gõ ở màn danh sách kéo theo **bốn** lượt chấm điểm cả thư viện
 * (`selectFormulas` + hai bộ đếm + `countHiddenByLevel`), mà mỗi lượt lại gọi `fieldsOf()` cho
 * từng công thức. Sáu trường × 111 công thức × 4 lượt = 2.664 lần `normalize('NFD')` + regex +
 * split cho MỖI ký tự người dùng gõ — trong khi bộ từ ấy không hề đổi giữa các lượt.
 * Đo được: 1,41 ms → 0,11 ms mỗi lượt chấm 111 công thức, và lượt dựng chỉ mục 1,78 ms chỉ chạy
 * đúng một lần.
 *
 * `WeakMap` chứ không phải `Map`: khoá là chính object công thức, nên bộ nhớ tự đi theo Registry
 * và không có chỗ nào phải dọn tay. Điều kiện để nó đúng — và đang đúng — là **không ai sao chép
 * `FormulaSummary`**: `selectFormulas`/`applyFacets`/`formulasForLevel` đều trả mảng mới chứa
 * cùng object (`[...formulas]` sao chép MẢNG, không sao chép phần tử). Ngày nào có ai viết
 * `.map(f => ({ ...f }))` thì chỉ mục trượt 100% và chỗ này lặng lẽ thành vô nghĩa — không sai
 * kết quả, chỉ mất hết phần nhanh.
 */
const FIELD_INDEX = new WeakMap<FormulaSummary, Field[]>();

function fieldsOf(formula: FormulaSummary): Field[] {
  const cached = FIELD_INDEX.get(formula);
  if (cached !== undefined) return cached;

  const fields: Field[] = [
    { tokens: tokenize(formula.id), weight: 12 },
    { tokens: tokenize(formula.name.vi), weight: 10 },
    { tokens: tokenize(formula.name.en), weight: 6 },
    { tokens: formula.tags.flatMap(tokenize), weight: 5 },
    { tokens: tokenize(formula.description.vi), weight: 2 },
    { tokens: tokenize(formula.description.en), weight: 2 },
  ];
  FIELD_INDEX.set(formula, fields);
  return fields;
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
 * Thứ tự MẶC ĐỊNH của màn danh sách: công thức nổi bật lên trước, rồi tới chữ cái (FR-20).
 *
 * Tách riêng vì nó còn là mốc phá hoà của những cách sắp chỉ xếp hạng được MỘT PHẦN thư viện:
 * `recent`/`used` chỉ chấm điểm được tối đa 24 công thức có trong lịch sử, 87 công thức còn lại
 * phải rơi xuống dưới theo một thứ tự có nghĩa chứ không phải theo thứ tự Registry.
 */
function compareDefault(a: FormulaSummary, b: FormulaSummary): number {
  const featured = Number(b.isFeatured ?? false) - Number(a.isFeatured ?? false);
  return featured !== 0 ? featured : compareName(a, b);
}

/**
 * Mức cơ bản lên trước, trong mỗi mức thì theo chữ cái.
 *
 * Phá hoà bằng `compareName` chứ KHÔNG phải `compareDefault`: người chọn cách sắp này đang muốn
 * đọc từ dễ tới khó, và trong một mức thì danh sách chữ cái liền mạch dễ quét hơn là để 18 công
 * thức nổi bật chen lên trên rồi mới quay lại bảng chữ cái.
 *
 * Ở chế độ Cơ bản, `formulasForLevel()` đã cắt hết mức nâng cao trước khi tới đây nên cách sắp
 * này không đổi gì — nó chỉ có tác dụng ở chế độ Nâng cao. Cố ý không ẩn lựa chọn: ẩn/hiện mục
 * trong `<select>` theo trạng thái là link `?sort=basic` chia sẻ đi mở ra một màn khác.
 */
function compareByLevel(a: FormulaSummary, b: FormulaSummary): number {
  const byLevel = Number(a.level === 'advanced') - Number(b.level === 'advanced');
  return byLevel !== 0 ? byLevel : compareName(a, b);
}

/** Không có lịch sử thì mọi công thức đều vô hạng — dùng chung một map rỗng, khỏi cấp phát. */
const EMPTY_ORDER: ReadonlyMap<string, number> = new Map();

/**
 * Sắp theo ĐIỂM NGOÀI do tầng trên đưa xuống, cao lên trước.
 *
 * Công thức không có điểm xếp xuống dưới theo `compareDefault` chứ không bị loại — danh sách
 * vẫn phải đủ 111 mục, "chưa từng mở" không phải là điều kiện lọc.
 *
 * Hệ quả cố ý: map RỖNG cho ra đúng thứ tự mặc định. Nhờ vậy khách mới, trình duyệt chặn
 * localStorage và mọi bộ máy tìm kiếm không bao giờ thấy một danh sách lạ, và bản tĩnh
 * `StaticFormulaList` không cần biết gì về lịch sử dùng.
 *
 * KHÔNG bọc `{ formula, score }` rồi sắp: `FIELD_INDEX` khoá theo chính object công thức, sao
 * chép là chỉ mục từ khoá trượt 100% (xem docblock của nó ở trên).
 */
function compareByUsage(order: ReadonlyMap<string, number>) {
  return (a: FormulaSummary, b: FormulaSummary): number => {
    const scoreA = order.get(a.id);
    const scoreB = order.get(b.id);

    if (scoreA === undefined) return scoreB === undefined ? compareDefault(a, b) : 1;
    if (scoreB === undefined) return -1;

    return scoreB - scoreA || compareDefault(a, b);
  };
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

/** Tham số phụ của `selectFormulas` — cả hai đều tuỳ chọn, xem từng trường. */
export interface SelectOptions {
  /** Danh sách nhóm; mặc định `CATEGORIES`. Chỗ tiêm cho test, sản phẩm không truyền. */
  categories?: ReadonlyArray<Category>;
  /**
   * Điểm sắp xếp theo lịch sử dùng: id → điểm, CAO lên trước. Chỉ có nghĩa với `sort` là
   * `'recent'` hoặc `'used'`.
   *
   * Vì sao là map điểm chứ không phải chính lịch sử dùng: `FormulaUsage` và `usageScore()` nằm
   * ở tầng Application, mà CON-02 cấm tầng này import lên trên. Tầng Application chấm điểm rồi
   * đưa xuống một cấu trúc trung tính — nó cũng là chỗ quyết định điểm ấy là "lần mở gần nhất"
   * hay "số lượt có suy giảm", nên tầng này không cần phân biệt hai cách sắp.
   *
   * Thiếu hoặc rỗng thì hai cách sắp ấy suy biến về đúng thứ tự mặc định — cố ý, xem
   * `compareByUsage`.
   */
  usageOrder?: ReadonlyMap<string, number>;
}

/**
 * Danh sách cuối cùng của màn WF-02: lọc mảng → lọc nhóm → tìm → sắp xếp.
 *
 * Khi có chuỗi tìm kiếm và người dùng chưa đổi cách sắp xếp, thứ tự là theo độ liên quan.
 * MỌI cách sắp khác `'featured'` đều ĐÈ độ liên quan, vì đó là lựa chọn có chủ đích của người
 * dùng — họ vừa tự tay chọn nó sau khi đã gõ xong từ khoá.
 */
export function selectFormulas(
  formulas: ReadonlyArray<FormulaSummary>,
  query: FormulaQuery,
  options: SelectOptions = {},
): FormulaSummary[] {
  const categories = options.categories ?? CATEGORIES;
  const faceted = applyFacets(formulas, query, categories);
  const hasQuery = tokenize(query.q).length > 0;

  const matched = hasQuery ? searchFormulas(faceted, query.q) : [...faceted];

  if (query.sort === 'az') return matched.sort(compareName);
  if (query.sort === 'za') return matched.sort((a, b) => compareName(b, a));
  if (query.sort === 'basic') return matched.sort(compareByLevel);
  if (query.sort === 'recent' || query.sort === 'used') {
    return matched.sort(compareByUsage(options.usageOrder ?? EMPTY_ORDER));
  }

  // 'featured': đang tìm thì giữ thứ tự độ liên quan; chưa tìm thì công thức nổi bật lên trước.
  if (hasQuery) return matched;
  return matched.sort(compareDefault);
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
  // Không truyền `usageOrder`: hàm này ĐẾM, mà thứ tự không đổi được số lượng.
  return selectFormulas(formulas, query, { categories }).filter((f) => f.level === 'advanced')
    .length;
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
