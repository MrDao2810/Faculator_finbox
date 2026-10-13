/**
 * Tầng DOMAIN — ghép KẾ HOẠCH (hình nào, tên gì) với CHỮ (kho) thành mục "Đọc biểu đồ" của một bài.
 *
 * Mỗi mục của ô chọn "Xem kết quả đổi theo" thành MỘT khối, mang đúng khoá của mục ấy
 * (`KhoiBieuDoBai.khoa`) để khung "?" tìm ra khối của hình đang hiện. Thứ tự: hình màn mở ra đứng
 * đầu, rồi tới các mục còn lại theo đúng thứ tự ô chọn bày chúng — Bóc tách, Theo thời gian, rồi
 * từng ô nhập. Khối đầu cũng là khối khung "?" rơi về khi màn chưa vẽ hình nào.
 *
 * Một khối chỉ dựng khi CẢ hình lẫn chữ cùng có — `kiem.ts` bảo đảm hai bên khớp nhau trên cả thư
 * viện, nên nhánh "thiếu một bên" ở đây chỉ là lưới an toàn cho công thức thứ 112.
 */

import { BREAKDOWN_KEY } from '../../chart/breakdown';
import { HISTORY_KEY } from '../../chart/history';
import type { BieuDoRieng, KeHoachBieuDo, KhoiBieuDoBai, KhoiLapBai, MucBieuDoBai } from './types';

export function mucBieuDo(
  keHoach: KeHoachBieuDo | undefined,
  rieng: BieuDoRieng | undefined,
): MucBieuDoBai | undefined {
  if (keHoach === undefined || rieng === undefined) return undefined;

  const khoi: KhoiBieuDoBai[] = [];
  const { truc, thoiGian, bocTach } = keHoach;

  if (bocTach !== undefined && rieng.bocTach !== undefined) {
    khoi.push({
      khoa: BREAKDOWN_KEY,
      ten: bocTach.ten,
      thanh: rieng.bocTach,
      nangCao: false,
      canChuoi: false,
    });
  }

  if (thoiGian !== undefined && rieng.thoiGian !== undefined) {
    khoi.push({
      khoa: HISTORY_KEY,
      ten: thoiGian.ten,
      duong: rieng.thoiGian.duong,
      ...(rieng.thoiGian.cot === undefined ? {} : { cot: rieng.thoiGian.cot }),
      nangCao: false,
      canChuoi: true,
    });
  }

  for (const mot of truc) {
    const chu = rieng.truc?.[mot.khoa];
    if (chu === undefined) continue;
    khoi.push({
      khoa: mot.khoa,
      ten: mot.ten,
      duong: chu.duong,
      ...(chu.cot === undefined ? {} : { cot: chu.cot }),
      nangCao: mot.nangCao,
      canChuoi: mot.hinh === undefined,
    });
  }

  if (khoi.length === 0) return undefined;

  // Hình màn mở ra lên đầu; phần còn lại giữ nguyên thứ tự ô chọn (`sort` của JS ổn định).
  khoi.sort((a, b) => Number(b.khoa === keHoach.moRa) - Number(a.khoa === keHoach.moRa));

  // Khối mẫu cho trục của nhóm do người dùng thêm — chỉ hai công thức có, xem `MucBieuDoBai.khoiLap`.
  const khoiLap: KhoiLapBai[] = [];
  for (const mot of keHoach.trucLap) {
    const chu = rieng.trucLap?.[mot.tienTo];
    if (chu === undefined) continue;
    khoiLap.push({
      tienTo: mot.tienTo,
      ten: mot.ten,
      duong: chu.duong,
      ...(chu.cot === undefined ? {} : { cot: chu.cot }),
      nangCao: mot.nangCao,
    });
  }

  return khoiLap.length === 0 ? { khoi } : { khoi, khoiLap };
}
