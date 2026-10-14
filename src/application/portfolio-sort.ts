/**
 * Tầng APPLICATION — sắp xếp bảng Mã của màn Danh mục, và chỗ nhớ cách sắp trên máy (14/10/2026).
 *
 * Chủ dự án: *"thêm tính năng sort cả ở màn web lẫn màn mobile cho bảng Mã ở danh mục"*, rồi chọn ba
 * điều: bấm TIÊU ĐỀ CỘT để sắp (không có ô chọn riêng), máy NHỚ cách sắp lần sau mở màn, và chỉ bảng
 * Mã. Chiều cùng ngày chủ dự án xin sắp cả bảng Công thức; luật của bảng ấy ở `saved-calc-sort.ts`.
 *
 * Ba luật, đều nằm ở đây để màn không tự quyết:
 *
 *   · **Vòng bấm của một cột**: lần đầu theo chiều "hay cần nhất" của cột ấy (Mã từ A tới Z, cột số
 *     từ LỚN tới nhỏ, Ngày mua từ MỚI tới cũ), lần hai đảo chiều, lần ba trả về thứ tự đã thêm vào.
 *     Không có lần ba thì người dùng không còn đường nào về thứ tự cũ, vì thứ tự ấy không là cột nào.
 *   · **Ô `_ _` luôn đứng CUỐI**, chiều nào cũng vậy. Mã chưa tra được giá không có lãi/lỗ; xếp nó
 *     như số 0 là bịa ra một con số (FR-06), còn đưa nó lên đầu khi đảo chiều thì dòng có số bị đẩy
 *     xuống dưới những dòng không có gì để so.
 *   · **Dòng chờ số liệu luôn đứng sau dòng nắm giữ**, như trước giờ. Chúng chỉ có mã và thị giá, nên
 *     chỉ xếp theo hai cột ấy; cột khác thì giữ thứ tự nhập.
 *
 * Hai dòng bằng nhau giữ thứ tự gốc: `Array.prototype.sort` ổn định từ ES2019.
 *
 * Cùng khuôn với `portfolio-store.ts`: phần thuần, không import React, không ném lỗi.
 */

import type { HoldingValue } from '@/core/portfolio';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const PORTFOLIO_SORT_KEY = 'ffb.portfolio.sort.v1';

/** Tám cột của bảng Mã, theo thứ tự từ trái sang phải trên PC. */
export const HOLDING_SORT_KEYS = [
  'code',
  'quantity',
  'costPrice',
  'marketPrice',
  'gain',
  'gainPercent',
  'weight',
  'buyDate',
] as const;

export type HoldingSortKey = (typeof HOLDING_SORT_KEYS)[number];

export type SortDirection = 'asc' | 'desc';

export interface HoldingSort {
  key: HoldingSortKey;
  dir: SortDirection;
}

/**
 * Ba cột dưới 1024px nằm trong dòng chi tiết chứ không trên hàng tiêu đề (bản vẽ khổ điện thoại
 * 14/10/2026), nên ở khổ ấy không có tiêu đề nào để bấm hay để mang mũi tên.
 */
export const HOLDING_SORT_KEYS_HIDDEN_ON_PHONE: ReadonlySet<HoldingSortKey> = new Set([
  'gain',
  'gainPercent',
  'weight',
]);

/** Cùng luật với ô Ngày mua của bảng: chuỗi không đúng dạng thì ô in `_ _`, nên xếp như ô trống. */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function firstDirection(key: HoldingSortKey): SortDirection {
  return key === 'code' ? 'asc' : 'desc';
}

/** Cách sắp sau khi bấm tiêu đề cột `key`. `null` là thứ tự đã thêm vào. */
export function nextHoldingSort(
  current: HoldingSort | null,
  key: HoldingSortKey,
): HoldingSort | null {
  const first = firstDirection(key);
  if (current === null || current.key !== key) return { key, dir: first };
  if (current.dir === first) return { key, dir: first === 'asc' ? 'desc' : 'asc' };
  return null;
}

/**
 * Cách sắp hữu hiệu ở khổ đang hiện.
 *
 * Cách sắp đã nhớ vẫn GIỮ NGUYÊN trong kho; chỉ là dưới 1024px, khi cột của nó không có trên hàng tiêu
 * đề, bảng về thứ tự đã thêm vào. Không thế thì xoay một chiếc máy tính bảng từ ngang sang dọc là được
 * một bảng xếp theo một cột không ai nhìn thấy, không mũi tên nào nói vì sao.
 */
export function effectiveHoldingSort(sort: HoldingSort | null, wide: boolean): HoldingSort | null {
  if (sort === null || wide) return sort;
  return HOLDING_SORT_KEYS_HIDDEN_ON_PHONE.has(sort.key) ? null : sort;
}

function valueOf(row: HoldingValue, key: HoldingSortKey): string | number | null {
  switch (key) {
    case 'code':
      return row.holding.code;
    case 'quantity':
      return row.holding.quantity;
    case 'costPrice':
      return row.holding.costPrice;
    case 'marketPrice':
      return row.marketPrice;
    case 'gain':
      return row.gain;
    case 'gainPercent':
      return row.gainPercent;
    case 'weight':
      return row.weight;
    case 'buyDate':
      return ISO_DAY.test(row.holding.buyDate) ? row.holding.buyDate : null;
  }
}

/**
 * So hai giá trị cùng cột. Ô trống đứng cuối ở CẢ HAI chiều — chiều chỉ lật phần so có số.
 *
 * Số không hữu hạn coi như trống: `HoldingValue` không bao giờ mang NaN, nhưng nếu có thì `NaN < x` và
 * `NaN > x` cùng sai, và một bộ so như thế làm `sort` trả về thứ tự tuỳ trình duyệt.
 */
function compare(a: string | number | null, b: string | number | null, dir: SortDirection): number {
  const trongA = a === null || (typeof a === 'number' && !Number.isFinite(a));
  const trongB = b === null || (typeof b === 'number' && !Number.isFinite(b));
  if (trongA || trongB) return trongA === trongB ? 0 : trongA ? 1 : -1;

  // Mã chỉ có chữ Latin hoa và chữ số, nên so theo mã ký tự là đủ và giống nhau ở mọi máy.
  const raw = a < b ? -1 : a > b ? 1 : 0;
  return dir === 'asc' ? raw : -raw;
}

/** Dòng nắm giữ theo cách sắp. `null` trả về đúng thứ tự gốc (một bản sao). */
export function sortHoldingRows(
  rows: ReadonlyArray<HoldingValue>,
  sort: HoldingSort | null,
): HoldingValue[] {
  if (sort === null) return [...rows];
  return [...rows].sort((a, b) => compare(valueOf(a, sort.key), valueOf(b, sort.key), sort.dir));
}

/**
 * Dòng chờ số liệu theo cách sắp. Chỉ hai cột có dữ liệu ở dòng chờ: Mã, và Thị giá (`priceOf`, từ
 * cùng gói giá màn đã tải). Cột khác ở dòng chờ đều `_ _`, nên giữ thứ tự nhập.
 */
export function sortPendingCodes(
  codes: ReadonlyArray<string>,
  sort: HoldingSort | null,
  priceOf: (code: string) => number | null,
): string[] {
  if (sort === null) return [...codes];
  if (sort.key === 'code') return [...codes].sort((a, b) => compare(a, b, sort.dir));
  if (sort.key === 'marketPrice') {
    return [...codes].sort((a, b) => compare(priceOf(a), priceOf(b), sort.dir));
  }
  return [...codes];
}

/**
 * Đọc cách sắp đã nhớ từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném lỗi. Kho hỏng, cột lạ hay chiều lạ thì về thứ tự đã thêm vào.
 */
export function parseHoldingSort(raw: string | null | undefined): HoldingSort | null {
  if (raw === null || raw === undefined || raw.trim() === '') return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;
  const { key, dir } = parsed as { key?: unknown; dir?: unknown };
  if (!HOLDING_SORT_KEYS.some((known) => known === key)) return null;
  if (dir !== 'asc' && dir !== 'desc') return null;
  return { key: key as HoldingSortKey, dir };
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializeHoldingSort(sort: HoldingSort): string {
  return JSON.stringify({ key: sort.key, dir: sort.dir });
}
