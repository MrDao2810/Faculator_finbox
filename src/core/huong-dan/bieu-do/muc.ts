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
import { COLUMNS_KEY } from '../../chart/columns';
import { COMPOSITION_KEY } from '../../chart/composition';
import { GAUGE_KEY } from '../../chart/gauge';
import { COMPONENTS_KEY, HISTORY_KEY } from '../../chart/history';
import { DISTRIBUTION_KEY, DRAWDOWN_KEY, SCATTER_KEY } from '../../chart/series-view';
import type {
  BieuDoRieng,
  HaiDang,
  KeHoachBieuDo,
  KhoiBieuDoBai,
  KhoiLapBai,
  MucBieuDoBai,
} from './types';

/** Các dạng có chữ của một hình đường, chép sang khối — trường vắng thì không mang theo. */
function cacDang(
  chu: HaiDang,
): Pick<KhoiBieuDoBai, 'duong' | 'cot' | 'diem' | 'bac' | 'laiLo' | 'nen'> {
  return {
    duong: chu.duong,
    ...(chu.cot === undefined ? {} : { cot: chu.cot }),
    ...(chu.diem === undefined ? {} : { diem: chu.diem }),
    ...(chu.bac === undefined ? {} : { bac: chu.bac }),
    ...(chu.laiLo === undefined ? {} : { laiLo: chu.laiLo }),
    ...(chu.nen === undefined ? {} : { nen: chu.nen }),
  };
}

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
      ...(rieng.vanhKhuyen === undefined ? {} : { vanhKhuyen: rieng.vanhKhuyen }),
      canChuoi: false,
    });
  }

  if (thoiGian !== undefined && rieng.thoiGian !== undefined) {
    khoi.push({
      khoa: HISTORY_KEY,
      ten: thoiGian.ten,
      ...cacDang(rieng.thoiGian),
      canChuoi: true,
    });
  }

  /*
   * Sáu mục riêng (10/11/2026), đúng thứ tự `mucOChon()` của `build.ts` bày chúng: mục theo chuỗi
   * (phân phối, sụt giảm, phân tán) và các đường thành phần trước Cơ cấu; cột theo kỳ và thang đo
   * sau nó. Mục nào cũng chỉ vẽ được khi đã có chuỗi giá, trừ cột theo kỳ (theo kế hoạch).
   */
  if (keHoach.phanPhoi !== undefined && rieng.phanPhoi !== undefined) {
    khoi.push({
      khoa: DISTRIBUTION_KEY,
      ten: keHoach.phanPhoi.ten,
      cot: rieng.phanPhoi,
      canChuoi: true,
    });
  }
  if (keHoach.sutGiam !== undefined && rieng.sutGiam !== undefined) {
    khoi.push({
      khoa: DRAWDOWN_KEY,
      ten: keHoach.sutGiam.ten,
      ...cacDang(rieng.sutGiam),
      canChuoi: true,
    });
  }
  if (keHoach.phanTan !== undefined && rieng.phanTan !== undefined) {
    khoi.push({ khoa: SCATTER_KEY, ten: keHoach.phanTan.ten, diem: rieng.phanTan, canChuoi: true });
  }
  if (keHoach.thanhPhan !== undefined && rieng.thanhPhan !== undefined) {
    khoi.push({
      khoa: COMPONENTS_KEY,
      ten: keHoach.thanhPhan.ten,
      duong: rieng.thanhPhan,
      canChuoi: true,
    });
  }

  // Hình cơ cấu: ngay sau Bóc tách và Theo thời gian trong ô "Xem theo" thật (`build.ts`), trước
  // mọi ô nhập. Không bao giờ là `moRa` nên khỏi lo bước sắp cuối hàm đụng tới nó.
  if (keHoach.coCau !== undefined && rieng.coCau !== undefined) {
    khoi.push({
      khoa: COMPOSITION_KEY,
      ten: keHoach.coCau.ten,
      thanh: rieng.coCau.thanh,
      vanhKhuyen: rieng.coCau.vanhKhuyen,
      canChuoi: false,
    });
  }

  if (keHoach.cotTheoKy !== undefined && rieng.cotTheoKy !== undefined) {
    khoi.push({
      khoa: COLUMNS_KEY,
      ten: keHoach.cotTheoKy.ten,
      cot: rieng.cotTheoKy,
      canChuoi: keHoach.cotTheoKy.canChuoi,
    });
  }
  if (keHoach.thangDo !== undefined && rieng.thangDo !== undefined) {
    khoi.push({
      khoa: GAUGE_KEY,
      ten: keHoach.thangDo.ten,
      thangDo: rieng.thangDo,
      canChuoi: keHoach.thangDo.canChuoi,
    });
  }

  for (const mot of truc) {
    const chu = rieng.truc?.[mot.khoa];
    if (chu === undefined) continue;
    khoi.push({
      khoa: mot.khoa,
      ten: mot.ten,
      ...cacDang(chu),
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
      ...(chu.diem === undefined ? {} : { diem: chu.diem }),
      ...(chu.bac === undefined ? {} : { bac: chu.bac }),
      ...(chu.laiLo === undefined ? {} : { laiLo: chu.laiLo }),
    });
  }

  return khoiLap.length === 0 ? { khoi } : { khoi, khoiLap };
}
