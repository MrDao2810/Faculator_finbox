/**
 * Kho chữ "Đọc biểu đồ" — một mục cho mỗi công thức CÓ khối biểu đồ (103/111).
 *
 * Chia file theo nhóm công thức chỉ để mỗi file còn đọc được; không file nào biết file nào. Thứ tự
 * ở đây không mang nghĩa: bài tra theo `spec.id`.
 */

import type { BieuDoRieng } from '../types';
import { BIEU_DO_CO_BAN } from './co-ban';
import { BIEU_DO_DINH_GIA } from './dinh-gia';
import { BIEU_DO_KHAC } from './khac';
import { BIEU_DO_KY_THUAT } from './ky-thuat';
import { BIEU_DO_LOI_SUAT } from './loi-suat';
import { BIEU_DO_RUI_RO } from './rui-ro';

export const BIEU_DO_RIENG: Readonly<Record<string, BieuDoRieng>> = {
  ...BIEU_DO_CO_BAN,
  ...BIEU_DO_DINH_GIA,
  ...BIEU_DO_LOI_SUAT,
  ...BIEU_DO_RUI_RO,
  ...BIEU_DO_KY_THUAT,
  ...BIEU_DO_KHAC,
};
