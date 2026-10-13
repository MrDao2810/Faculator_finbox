/**
 * Tầng DOMAIN — mục "Đọc biểu đồ" viết riêng cho từng công thức. Xem `./types.ts`.
 *
 * CHỈ đọc lúc build, qua `@/application/huong-dan` (cùng cửa với phần còn lại của bài).
 */

export type {
  BieuDoRieng,
  HaiDang,
  HinhDangXem,
  KeHoachBieuDo,
  KeHoachTruc,
  KhoiBieuDoBai,
  MucBieuDoBai,
} from './types';
export { doHinh, keHoachBieuDo } from './ke-hoach';
export { bieuDoProblems, chieuDuyNhat } from './kiem';
export { mucBieuDo } from './muc';
export { BIEU_DO_RIENG } from './noi-dung';
