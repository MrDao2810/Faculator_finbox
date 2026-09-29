import { VI_DU_MUC } from './items';
import type { ViDuGiai } from './types';

export type { ViDuGiai, ViDuNguon } from './types';

/**
 * Lời giải có cấu trúc của khối "Ví dụ thực tế", theo id công thức — xem docblock `ViDuGiai`.
 *
 * CHỈ đọc lúc build (`page.tsx` qua `@/application/vi-du`), không bao giờ từ client component:
 * đây là chữ của cả 111 ví dụ, mỗi trang chỉ cần phần của chính nó.
 */
export const VI_DU_GIAI: Readonly<Record<string, ViDuGiai>> = VI_DU_MUC;

/** Lời giải của một công thức; `undefined` nghĩa là khối Ví dụ lùi về hình chưa có lời giải. */
export function viDuGiaiFor(formulaId: string): ViDuGiai | undefined {
  return VI_DU_GIAI[formulaId];
}
