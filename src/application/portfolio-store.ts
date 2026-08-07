/**
 * Tầng APPLICATION — chỗ cất danh mục của màn WF-06 (gói WBS 3.4.1).
 *
 * Cùng khuôn với `recent-searches.ts` và `price-series-store.ts`: phần thuần nằm ở đây, không
 * import React, nên test được bằng Node; phần chạm `localStorage` do màn gọi trong `useEffect`.
 *
 * NFR-SEC-01 · COM-03: danh mục là thứ riêng tư nhất trong sản phẩm này — nó nói người dùng
 * đang giữ mã gì, bao nhiêu tiền. Không có tài khoản, không có backend, không gửi đi đâu.
 */

import type { Holding } from '@/core/portfolio';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const PORTFOLIO_KEY = 'ffb.portfolio.v1';

/** Trần số mã. Danh mục cá nhân dài hơn thế thì màn một cột không còn đọc nổi. */
export const MAX_HOLDINGS = 50;

/** Số hữu hạn hay `null`. Thứ gì khác đều thành `null` chứ không thành 0. */
function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Đọc danh mục từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném lỗi, và **bỏ hẳn** mã nào thiếu thứ bắt buộc (mã, số lượng, giá vốn)
 * thay vì điền 0 vào chỗ trống: một mã có số lượng 0 sẽ lặng lẽ kéo tỷ trọng của cả danh mục
 * lệch đi, còn một mã bị bỏ thì người dùng nhìn thấy ngay là thiếu.
 */
export function parseHoldings(raw: string | null | undefined): Holding[] {
  if (raw === null || raw === undefined || raw.trim() === '') return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const clean: Holding[] = [];
  for (const item of parsed) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;

    const code =
      typeof record.code === 'string' ? record.code.trim().toUpperCase().slice(0, 12) : '';
    const quantity = numberOrNull(record.quantity);
    const costPrice = numberOrNull(record.costPrice);

    if (code === '' || quantity === null || quantity <= 0 || costPrice === null || costPrice <= 0) {
      continue;
    }

    clean.push({
      code,
      quantity,
      costPrice,
      buyDate: typeof record.buyDate === 'string' ? record.buyDate.trim().slice(0, 10) : '',
      beta: numberOrNull(record.beta),
    });

    if (clean.length >= MAX_HOLDINGS) break;
  }

  return clean;
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializeHoldings(holdings: ReadonlyArray<Holding>): string {
  return JSON.stringify(holdings.slice(0, MAX_HOLDINGS));
}

/**
 * Thêm một mã.
 *
 * Mã đã có thì **cộng dồn số lượng và tính lại giá vốn bình quân** chứ không tạo dòng thứ hai:
 * mua thêm FPT là vẫn một khoản nắm giữ FPT, và hai dòng cùng mã sẽ làm tỷ trọng khó đọc.
 * Ngày mua giữ ngày sớm nhất — đó là lúc khoản đầu tư này bắt đầu, và XIRR cần đúng mốc đó.
 */
export function addHolding(list: ReadonlyArray<Holding>, holding: Holding): Holding[] {
  const code = holding.code.trim().toUpperCase();
  if (code === '' || holding.quantity <= 0 || holding.costPrice <= 0) return [...list];

  const existing = list.find((item) => item.code === code);
  if (existing === undefined) {
    if (list.length >= MAX_HOLDINGS) return [...list];
    return [...list, { ...holding, code }];
  }

  const quantity = existing.quantity + holding.quantity;
  const cost = existing.quantity * existing.costPrice + holding.quantity * holding.costPrice;

  return list.map((item) =>
    item.code === code
      ? {
          ...item,
          quantity,
          costPrice: cost / quantity,
          buyDate:
            existing.buyDate !== '' &&
            (holding.buyDate === '' || existing.buyDate < holding.buyDate)
              ? existing.buyDate
              : holding.buyDate,
          // Beta mới ghi đè beta cũ nếu có; không có thì giữ nguyên cái đang dùng.
          beta: holding.beta ?? item.beta ?? null,
        }
      : item,
  );
}

/** Bỏ một mã khỏi danh mục. */
export function removeHolding(list: ReadonlyArray<Holding>, code: string): Holding[] {
  const target = code.trim().toUpperCase();
  return list.filter((item) => item.code !== target);
}
