/**
 * Tầng APPLICATION — trạng thái tìm kiếm và lọc nằm trên URL (gói WBS 1.4.1).
 *
 * FR-19: "trạng thái tìm kiếm/lọc phản ánh trên URL để chia sẻ được".
 * Nghĩa là URL, chứ không phải state trong bộ nhớ, mới là nguồn sự thật của màn danh sách.
 *
 * Đường dẫn để tiếng Việt cho SEO (`/cong-thuc/wacc/`), còn tên tham số truy vấn để tiếng Anh
 * vì đó là phần kỹ thuật và `q` đã là quy ước chung.
 *
 * File này KHÔNG import React để test được bằng Node. Hai hook nằm ở `use-list-params.ts` (màn tìm
 * WF-09) và `use-list-url-state.ts` (màn Công thức) — vì sao hai hook, xem docblock bản thứ hai.
 */

import { CATEGORIES } from '@/core/registry';
import type { FormulaQuery, ListSort, SegmentFilter } from '@/core/registry';

export type { ListSort, SegmentFilter };

/**
 * Trạng thái màn danh sách. Cùng một kiểu với `FormulaQuery` của tầng Domain — tầng này
 * chỉ lo đọc/ghi nó lên URL, còn logic lọc và tìm nằm ở `@/core/registry/search`.
 */
export type ListParams = FormulaQuery;

/**
 * `sort` mặc định phải là một cách sắp tính được LÚC BUILD.
 *
 * Màn Công thức dựng bản tĩnh của `out/cong-thuc/index.html` bằng chính hằng số này, còn
 * `recent`/`used` thì chấm điểm từ `localStorage` — đặt một trong hai làm mặc định là HTML tĩnh
 * và lượt render đầu ở máy khách lệch nhau ngay.
 */
export const DEFAULT_LIST_PARAMS: ListParams = {
  q: '',
  segment: 'all',
  categoryId: null,
  sort: 'featured',
};

/** Chặn URL rác: chuỗi tìm kiếm dài hơn mức này bị cắt. */
export const MAX_QUERY_LENGTH = 100;

const PARAM_QUERY = 'q';
const PARAM_SEGMENT = 'segment';
const PARAM_CATEGORY = 'category';
const PARAM_SORT = 'sort';

const SORTS: ReadonlyArray<ListSort> = ['featured', 'az', 'za', 'recent', 'used', 'basic'];

function isSegmentFilter(value: string | null): value is SegmentFilter {
  return value === 'all' || value === 'stock' || value === 'personal';
}

function isSort(value: string | null): value is ListSort {
  return value !== null && (SORTS as ReadonlyArray<string>).includes(value);
}

/**
 * Đọc trạng thái từ URL. Giá trị lạ bị bỏ qua chứ không làm hỏng màn —
 * người dùng sửa tay URL hay link cũ trỏ vào nhóm đã đổi tên đều phải mở được trang.
 */
export function parseListParams(params: URLSearchParams | null | undefined): ListParams {
  if (params === null || params === undefined) return { ...DEFAULT_LIST_PARAMS };

  const rawQuery = params.get(PARAM_QUERY) ?? '';
  const rawSegment = params.get(PARAM_SEGMENT);
  const rawCategory = params.get(PARAM_CATEGORY);
  const rawSort = params.get(PARAM_SORT);

  return {
    // KHÔNG trim: URL là nguồn sự thật của ô tìm kiếm, trim ở đây thì gõ "dinh " xong
    // dấu cách bị nuốt ngay và người dùng không gõ được từ thứ hai.
    // Khoảng trắng thừa không ảnh hưởng kết quả vì tokenize() ở tầng Domain đã bỏ qua.
    q: rawQuery.slice(0, MAX_QUERY_LENGTH),
    segment: isSegmentFilter(rawSegment) ? rawSegment : DEFAULT_LIST_PARAMS.segment,
    categoryId:
      rawCategory !== null && CATEGORIES.some((c) => c.id === rawCategory) ? rawCategory : null,
    sort: isSort(rawSort) ? rawSort : DEFAULT_LIST_PARAMS.sort,
  };
}

/**
 * Đọc trạng thái cho MÀN CÔNG THỨC từ chuỗi truy vấn — `parseListParams()` trừ tham số `segment`.
 *
 * Màn Công thức đã bỏ ba tab mảng (15/09/2026): bản vẽ chỉ còn một hàng chip nhóm. Một link cũ mang
 * `?segment=personal` mà vẫn được áp thì danh sách bị lọc theo một tiêu chí KHÔNG còn điều khiển nào
 * trên màn nói ra, cũng không nút nào gỡ được — một bộ lọc vô hình. Nên ở đây nó bị bỏ qua; link
 * cũ vẫn mở được, chỉ ra danh sách rộng hơn.
 *
 * `FormulaQuery.segment` ở tầng Domain và `parseListParams()` GIỮ NGUYÊN: màn tìm WF-09 vẫn đọc
 * chúng, và việc bỏ tab là quyết định của một màn chứ không phải của mô hình dữ liệu.
 *
 * @param search Chuỗi truy vấn, có hoặc không có dấu `?` ở đầu.
 */
export function listParamsFromSearch(search: string): ListParams {
  return {
    ...parseListParams(new URLSearchParams(search)),
    segment: DEFAULT_LIST_PARAMS.segment,
  };
}

/** Hai trạng thái có trùng khít không — so từng tiêu chí, không so danh tính object. */
export function sameListParams(a: ListParams, b: ListParams): boolean {
  return (
    a.q === b.q && a.segment === b.segment && a.categoryId === b.categoryId && a.sort === b.sort
  );
}

/**
 * Ghi trạng thái ra URL. Giá trị nào đang là mặc định thì bỏ hẳn khỏi URL,
 * để link chia sẻ ngắn và trang chủ không có đuôi `?segment=all&sort=featured` vô nghĩa.
 */
export function serializeListParams(state: ListParams): URLSearchParams {
  const params = new URLSearchParams();

  // Chỉ toàn khoảng trắng thì coi như chưa tìm gì; còn lại giữ nguyên đúng thứ người dùng gõ.
  const q = state.q.slice(0, MAX_QUERY_LENGTH);
  if (q.trim() !== '') params.set(PARAM_QUERY, q);
  if (state.segment !== DEFAULT_LIST_PARAMS.segment) params.set(PARAM_SEGMENT, state.segment);
  if (state.categoryId !== null) params.set(PARAM_CATEGORY, state.categoryId);
  if (state.sort !== DEFAULT_LIST_PARAMS.sort) params.set(PARAM_SORT, state.sort);

  return params;
}

/** Chuỗi nối vào sau đường dẫn: '' khi mọi thứ đang mặc định, ngược lại là '?…'. */
export function listParamsToQuery(state: ListParams): string {
  const text = serializeListParams(state).toString();
  return text === '' ? '' : `?${text}`;
}

/** Đang ở trạng thái mặc định hay không — mọi tiêu chí, kể cả chuỗi tìm và mảng. */
export function isDefaultListParams(state: ListParams): boolean {
  return (
    state.q.trim() === '' &&
    state.segment === DEFAULT_LIST_PARAMS.segment &&
    state.categoryId === null &&
    state.sort === DEFAULT_LIST_PARAMS.sort
  );
}

/*
 * ── Phần trạng thái của BỘ LỌC (nhóm + cách sắp), tách khỏi chuỗi tìm ──────────────────────────
 *
 * Nút "Xoá bộ lọc" đứng cạnh hàng chip nhóm và ô "Sắp xếp", và nó chỉ phụ trách hai thứ ấy. Chuỗi
 * tìm có nút × của riêng nó ngay trong ô tìm; một nút "xoá bộ lọc" mà xoá luôn chữ người dùng vừa
 * gõ là nút xoá nhiều hơn thứ nó đứng cạnh.
 *
 * (Tên cũ "hai ô chọn" có từ khi nhóm còn là một `<select>`; nay nhóm là hàng chip nhưng vẫn là
 * đúng hai tiêu chí ấy.)
 *
 * Hai thứ dưới đây đi THÀNH CẶP và phải ở cùng một chỗ: cái thứ nhất nói "xoá thì đặt lại thành
 * gì", cái thứ hai nói "có gì để xoá không". Tách chúng ra hai file là có ngày nút hiện lên trong
 * khi bấm vào không đổi gì — đúng loại lỗi im lặng mà `showReset` sinh ra nếu hai bên lệch nhau.
 *
 * Nút "Xoá bộ lọc" ở khối rỗng (khi không công thức nào khớp) thì vẫn xoá SẠCH, vì ở đó chuỗi tìm
 * mới thường là thứ đang giữ danh sách trống — xoá mỗi bộ lọc là để người dùng lại đúng chỗ cũ, một
 * lối thoát không dẫn đi đâu.
 */

/** Giá trị bộ lọc sau khi xoá — dùng làm patch cho `setParams`. */
export const CLEARED_SELECT_FILTERS: Pick<ListParams, 'categoryId' | 'sort'> = {
  categoryId: DEFAULT_LIST_PARAMS.categoryId,
  sort: DEFAULT_LIST_PARAMS.sort,
};

/** Bộ lọc có đang lọc gì không — quyết định hiện nút "Xoá bộ lọc" đứng cạnh nó. */
export function hasSelectFilters(state: ListParams): boolean {
  return (
    state.categoryId !== CLEARED_SELECT_FILTERS.categoryId ||
    state.sort !== CLEARED_SELECT_FILTERS.sort
  );
}
