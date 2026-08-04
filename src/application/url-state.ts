/**
 * Tầng APPLICATION — trạng thái tìm kiếm và lọc nằm trên URL (gói WBS 1.4.1).
 *
 * FR-19: "trạng thái tìm kiếm/lọc phản ánh trên URL để chia sẻ được".
 * Nghĩa là URL, chứ không phải state trong bộ nhớ, mới là nguồn sự thật của màn danh sách.
 *
 * Đường dẫn để tiếng Việt cho SEO (`/cong-thuc/wacc/`), còn tên tham số truy vấn để tiếng Anh
 * vì đó là phần kỹ thuật và `q` đã là quy ước chung.
 *
 * File này KHÔNG import React để test được bằng Node. Hook nằm ở use-list-params.ts.
 */

import { CATEGORIES } from '@/core/registry';
import type { FormulaQuery, ListSort, SegmentFilter } from '@/core/registry';

export type { ListSort, SegmentFilter };

/**
 * Trạng thái màn danh sách. Cùng một kiểu với `FormulaQuery` của tầng Domain — tầng này
 * chỉ lo đọc/ghi nó lên URL, còn logic lọc và tìm nằm ở `@/core/registry/search`.
 */
export type ListParams = FormulaQuery;

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

const SORTS: ReadonlyArray<ListSort> = ['featured', 'az', 'za'];

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

/** Đang ở trạng thái mặc định hay không — dùng để quyết định có hiện nút “Xoá bộ lọc”. */
export function isDefaultListParams(state: ListParams): boolean {
  return (
    state.q.trim() === '' &&
    state.segment === DEFAULT_LIST_PARAMS.segment &&
    state.categoryId === null &&
    state.sort === DEFAULT_LIST_PARAMS.sort
  );
}
