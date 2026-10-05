/**
 * Chữ hướng dẫn riêng của từng công thức — xem docblock `./types.ts`.
 *
 * Nằm trong `src/core/huong-dan/`, nên nó đã sẵn ở sau cửa chỉ-lúc-build `@/application/huong-dan`
 * mà `build-only-imports.test.ts` đang gác: không cần luật mới, và không đường nào để 766 câu này
 * lọt vào gói JS của một trang không ai mở hướng dẫn.
 */

export type { BaiRieng, ONhapRieng, SongNgu } from './types';
export { songNgu } from './types';
export { BAI_RIENG } from './items';
