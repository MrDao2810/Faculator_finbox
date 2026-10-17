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
import { doDai, normalizeVi, phraseHits, terms, type Term } from './phrase';
import type { Category, FormulaQuery, FormulaSummary } from './types';
import type { Bilingual, Level } from '../types';

export { normalizeVi } from './phrase';

/** Ngôn ngữ của phần mô tả đang hiện trên màn — khớp phụ chỉ dò mô tả người dùng đang đọc. */
export type SearchLang = keyof Bilingual;

/**
 * Cắt chuỗi thành các từ khoá, bỏ mọi ký hiệu.
 *
 * Phép tìm KHÔNG còn dùng hàm này (nó vứt "%" của "%b" — xem `phrase.ts`). Còn giữ cho nơi chỉ cần
 * hỏi "chuỗi có chữ nào không", như `url-state.ts`.
 */
export function tokenize(text: string): string[] {
  return normalizeVi(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token !== '');
}

/**
 * Hai tầng kết quả (16/10/2026).
 *
 * - **Khớp chính** (`tier: 1`): cụm đã gõ có trong mã, tên (Việt hoặc Anh) hay một từ khoá của
 *   công thức.
 * - **Khớp phụ** (`tier: 2`): không khớp chính, nhưng MÔ TẢ đang hiện trên màn có nguyên cụm ấy.
 *   Màn tô vàng cụm đó (`descriptionHitParts`) để người đọc thấy vì sao thẻ có mặt.
 *
 * Chủ dự án chốt thứ tự: công thức khớp tên lên đầu, rồi tới công thức có cụm liên quan trong mô
 * tả. Mọi cách sắp chỉ sắp TRONG từng tầng, không trộn hai tầng (xem `selectFormulas`).
 */
export interface SearchMatch {
  tier: 0 | 1 | 2;
  /** Điểm để xếp trong cùng một tầng, cao lên trước. 0 khi `tier` là 0. */
  score: number;
}

const KHONG_KHOP: SearchMatch = { tier: 0, score: 0 };

/**
 * Ở mô tả, từ cuối phải gõ từ ngần này ký tự mới được khớp theo tiền tố. Ngắn hơn thì phải khớp
 * trọn từ: "b" khớp tiền tố của nửa số từ tiếng Việt, đúng thứ đã làm "%b" ra 96 kết quả.
 */
export const TIEN_TO_MO_TA = 3;

/** Chuỗi gõ ngắn hơn ngần này ký tự (tính cả ký hiệu) thì không dò mô tả: một chữ cái không phải cụm. */
const DO_DAI_MO_TA = 2;

/** Một trường để dò khớp chính, kèm trọng số. Trường càng đúng ý người tìm thì điểm càng cao. */
interface Field {
  terms: ReadonlyArray<Term>;
  weight: number;
  /** Từ khoá: không hiện trên màn, nên chuỗi gõ ngắn không được khớp dở ở đây. */
  an?: true;
}

interface Indexed {
  /** Mã, tên Việt, tên Anh, rồi TỪNG từ khoá một — cụm không được vắt qua hai từ khoá. */
  strong: ReadonlyArray<Field>;
  desc: Readonly<Record<SearchLang, ReadonlyArray<Term>>>;
}

/**
 * Mô tả đúng như màn hiện: tiếng Anh rỗng thì màn in tiếng Việt (`pick()` ở tầng Application), nên
 * khớp phụ cũng dò tiếng Việt. Lệch chỗ này là thẻ khớp phụ không có chữ nào được tô.
 */
export function descriptionText(formula: FormulaSummary, lang: SearchLang): string {
  if (lang === 'en') {
    return formula.description.en.trim() === '' ? formula.description.vi : formula.description.en;
  }
  return formula.description.vi;
}

/**
 * Chỉ mục mảnh đã cắt sẵn, nhớ theo từng công thức.
 *
 * Vì sao cần: một phím gõ ở màn danh sách kéo theo **bốn** lượt chấm điểm cả thư viện
 * (`selectFormulas` + hai bộ đếm + `countHiddenByLevel`), mà bộ mảnh của một công thức không hề đổi
 * giữa các lượt. Đo trên bản cắt từ cũ: 1,41 ms → 0,11 ms mỗi lượt chấm 111 công thức.
 *
 * `WeakMap` chứ không phải `Map`: khoá là chính object công thức, nên bộ nhớ tự đi theo Registry
 * và không có chỗ nào phải dọn tay. Điều kiện để nó đúng — và đang đúng — là **không ai sao chép
 * `FormulaSummary`**: `selectFormulas`/`applyFacets`/`formulasForLevel` đều trả mảng mới chứa
 * cùng object (`[...formulas]` sao chép MẢNG, không sao chép phần tử). Ngày nào có ai viết
 * `.map(f => ({ ...f }))` thì chỉ mục trượt 100% và chỗ này lặng lẽ thành vô nghĩa — không sai
 * kết quả, chỉ mất hết phần nhanh.
 */
const FIELD_INDEX = new WeakMap<FormulaSummary, Indexed>();

function indexOf(formula: FormulaSummary): Indexed {
  const cached = FIELD_INDEX.get(formula);
  if (cached !== undefined) return cached;

  const indexed: Indexed = {
    strong: [
      { terms: terms(formula.id), weight: 12 },
      { terms: terms(formula.name.vi), weight: 10 },
      { terms: terms(formula.name.en), weight: 6 },
      ...formula.tags.map((tag) => ({ terms: terms(tag), weight: 5, an: true as const })),
    ],
    desc: {
      vi: terms(descriptionText(formula, 'vi')),
      en: terms(descriptionText(formula, 'en')),
    },
  };
  FIELD_INDEX.set(formula, indexed);
  return indexed;
}

/**
 * Chuỗi gõ đã cắt, nhớ một bản: một lượt chấm gọi hàm này 111 lần với CÙNG một chuỗi. Mảng trả về
 * dùng chung, nơi gọi không được sửa.
 */
let chuoiTruoc = '';
let manhTruoc: ReadonlyArray<Term> = [];
function queryTerms(query: string): ReadonlyArray<Term> {
  if (query !== chuoiTruoc) {
    chuoiTruoc = query;
    manhTruoc = terms(query);
  }
  return manhTruoc;
}

/** Chuỗi gõ có mảnh nào để tìm không — "%" là có, "   " và "--" là không. */
export function hasSearchTerms(query: string): boolean {
  return queryTerms(query).length > 0;
}

/**
 * Xếp một công thức vào tầng khớp chính, khớp phụ, hoặc không khớp.
 *
 * Khớp chính: cụm đã gõ đứng liền nhau, đúng thứ tự, trong mã, tên hoặc một từ khoá; từ cuối được
 * khớp theo tiền tố để gõ dở đã có gợi ý ("dinh" ra "Định giá"), nhưng chuỗi dưới
 * `TIEN_TO_MO_TA` ký tự chỉ khớp dở ở đầu trường. Khớp trọn từ cuối được điểm gấp đôi, cụm đứng
 * ngay đầu trường thêm 3. Công thức nổi bật thêm 3 (FR-20).
 *
 * Khớp phụ: mô tả bằng `lang` có nguyên cụm, các từ khớp trọn trừ từ cuối dài từ `TIEN_TO_MO_TA`
 * ký tự; chuỗi gõ dưới `DO_DAI_MO_TA` ký tự không bao giờ khớp phụ.
 */
export function matchFormula(
  formula: FormulaSummary,
  query: string,
  lang: SearchLang = 'vi',
): SearchMatch {
  const q = queryTerms(query);
  if (q.length === 0) return KHONG_KHOP;

  const indexed = indexOf(formula);
  const noiBat = formula.isFeatured === true ? 3 : 0;

  // Chuỗi ngắn ("b", "pe") khớp dở chỉ ở ĐẦU mã hoặc tên: "pe" là phần đầu của "PEG", không phải
  // của "period" giữa tên tiếng Anh một công thức đo biên độ, cũng không phải của từ khoá ẩn
  // "binh quan nam" làm "b" ra CAGR. Khớp trọn từ thì ở đâu cũng được ("pe" trong "pe muc tieu").
  const ngan = doDai(q) < TIEN_TO_MO_TA;

  let best = 0;
  for (const field of indexed.strong) {
    for (const hit of phraseHits(field.terms, q, 1)) {
      if (ngan && !hit.tron && (hit.from !== 0 || field.an === true)) continue;
      let points = hit.tron ? field.weight * 2 : field.weight;
      // Cụm đứng đầu trường thêm 3; trùng trọn cả trường ("ev" với mã `ev`) thêm 6 nữa.
      if (hit.from === 0) points += hit.tron && hit.to === field.terms.length ? 9 : 3;
      if (points > best) best = points;
    }
  }
  if (best > 0) return { tier: 1, score: best + noiBat };

  if (doDai(q) < DO_DAI_MO_TA) return KHONG_KHOP;
  const hits = phraseHits(indexed.desc[lang], q, TIEN_TO_MO_TA);
  if (hits.length === 0) return KHONG_KHOP;
  return { tier: 2, score: (hits.some((hit) => hit.tron) ? 2 : 1) + noiBat };
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
 * localStorage và mọi bộ máy tìm kiếm không bao giờ thấy một danh sách lạ, và bản HTML tĩnh của
 * màn Công thức không cần biết gì về lịch sử dùng.
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

/** Một kết quả tìm kèm tầng và điểm. Bọc tạm để sắp, không sao chép công thức (xem `FIELD_INDEX`). */
interface Hit {
  formula: FormulaSummary;
  tier: 1 | 2;
  score: number;
}

/** Khớp chính trước, khớp phụ sau; trong một tầng thì điểm cao trước, rồi tới chữ cái. */
function searchHits(
  formulas: ReadonlyArray<FormulaSummary>,
  query: string,
  lang: SearchLang,
): Hit[] {
  const hits: Hit[] = [];
  for (const formula of formulas) {
    const { tier, score } = matchFormula(formula, query, lang);
    if (tier !== 0) hits.push({ formula, tier, score });
  }
  return hits.sort(
    (a, b) => a.tier - b.tier || b.score - a.score || compareName(a.formula, b.formula),
  );
}

/**
 * Tìm công thức theo chuỗi người dùng gõ: khớp chính trước, khớp phụ sau, trong mỗi tầng theo độ
 * liên quan. Chuỗi rỗng thì trả về mảng rỗng — nơi gọi tự quyết hiện gì khi chưa gõ gì.
 */
export function searchFormulas(
  formulas: ReadonlyArray<FormulaSummary>,
  query: string,
  lang: SearchLang = 'vi',
): FormulaSummary[] {
  if (!hasSearchTerms(query)) return [];
  return searchHits(formulas, query, lang).map((hit) => hit.formula);
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
  /**
   * Ngôn ngữ của mô tả đang hiện — khớp phụ chỉ dò mô tả ấy, để thẻ khớp phụ nào cũng có chữ được
   * tô. Mặc định `'vi'`. Nơi gọi trên màn truyền `locale` của người dùng.
   */
  lang?: SearchLang;
}

/** Phép so của một cách sắp mà người dùng tự chọn; `null` cho `'featured'` (theo độ liên quan). */
function comparatorFor(
  sort: FormulaQuery['sort'],
  usageOrder: ReadonlyMap<string, number> | undefined,
): ((a: FormulaSummary, b: FormulaSummary) => number) | null {
  if (sort === 'az') return compareName;
  if (sort === 'za') return (a, b) => compareName(b, a);
  if (sort === 'basic') return compareByLevel;
  if (sort === 'recent' || sort === 'used') return compareByUsage(usageOrder ?? EMPTY_ORDER);
  return null;
}

/**
 * Danh sách cuối cùng của màn WF-02: lọc mảng → lọc nhóm → tìm → sắp xếp.
 *
 * Khi có chuỗi tìm kiếm và người dùng chưa đổi cách sắp xếp, thứ tự là theo độ liên quan.
 * MỌI cách sắp khác `'featured'` đều ĐÈ độ liên quan, vì đó là lựa chọn có chủ đích của người
 * dùng — họ vừa tự tay chọn nó sau khi đã gõ xong từ khoá. Nhưng nó chỉ sắp TRONG từng tầng: khớp
 * chính vẫn đứng trên khớp phụ (16/10/2026), vì thẻ khớp phụ là thẻ tô vàng, xếp lẫn vào giữa thì
 * người đọc không còn biết đâu là thứ mình tìm.
 */
export function selectFormulas(
  formulas: ReadonlyArray<FormulaSummary>,
  query: FormulaQuery,
  options: SelectOptions = {},
): FormulaSummary[] {
  const categories = options.categories ?? CATEGORIES;
  const faceted = applyFacets(formulas, query, categories);
  const compare = comparatorFor(query.sort, options.usageOrder);

  if (!hasSearchTerms(query.q)) {
    // Chưa tìm gì: 'featured' là công thức nổi bật lên trước.
    return faceted.sort(compare ?? compareDefault);
  }

  const hits = searchHits(faceted, query.q, options.lang ?? 'vi');
  if (compare === null) return hits.map((hit) => hit.formula);

  const chinh = hits.filter((hit) => hit.tier === 1).map((hit) => hit.formula);
  const phu = hits.filter((hit) => hit.tier === 2).map((hit) => hit.formula);
  return [...chinh.sort(compare), ...phu.sort(compare)];
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
  lang: SearchLang = 'vi',
): number {
  if (mode === 'advanced') return 0;
  // Không truyền `usageOrder`: hàm này ĐẾM, mà thứ tự không đổi được số lượng.
  return selectFormulas(formulas, query, { categories, lang }).filter((f) => f.level === 'advanced')
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
  lang: SearchLang = 'vi',
): ReadonlyMap<string, number> {
  const pool = applyFacets(formulas, query, categories, true);
  const matched = hasSearchTerms(query.q) ? searchFormulas(pool, query.q, lang) : pool;

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
  lang: SearchLang = 'vi',
): Readonly<Record<'all' | 'stock' | 'personal', number>> {
  const matched = hasSearchTerms(query.q) ? searchFormulas(formulas, query.q, lang) : formulas;

  let stock = 0;
  let personal = 0;
  for (const formula of matched) {
    const segment = segmentOf(formula, categories);
    if (segment === 'stock') stock += 1;
    else if (segment === 'personal') personal += 1;
  }

  return { all: matched.length, stock, personal };
}
