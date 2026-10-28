import { textWidth } from './ticks';

/**
 * Chú giải ĐÁY HÌNH của hình cột theo kỳ và hình phân tán (28/10/2026).
 *
 * Hai hình ấy vẽ chú giải TRONG `<svg>` (file xuất PDF / PNG chép đúng thẻ `<svg>`, nên chú giải phải
 * đi theo), và đến hôm ấy nó nằm ở đầu hình, sát trên tên trục đứng. Chủ dự án khoanh nó trên hình Beta:
 * _"đang có đoạn chú thích không ổn lắm. nó nằm ở vị trí rất khó nhìn, cần chuyển xuống cuối dưới chart
 * và padding chuẩn 1 chút. áp dụng cho toàn bộ công thức, màn web pc và web mobile"_.
 *
 * Nay chú giải đứng DƯỚI tên trục ngang, mỗi hàng canh giữa vùng vẽ như chính tên trục ấy, hàng cuối
 * cách đáy khung `CHAN`. Hàm này xếp hàng và trả về phần chiều cao nó chiếm, để nơi gọi đẩy đáy vùng vẽ
 * lên đúng bấy nhiêu — chiều cao khung (`viewBox`) giữ nguyên, nên tỉ lệ khung CSS vẫn khớp.
 *
 * Thuần số học, không đo DOM: cả thư mục nằm sau ranh giới `next/dynamic` (xem `ticks.ts`).
 */

/** Nhịp giữa hai hàng chú giải. */
export const HANG_CHU_GIAI = 16;

/**
 * Từ chân chữ tên trục ngang tới chân chữ hàng chú giải đầu — rộng hơn nhịp hàng, để tên trục và chú
 * giải đọc ra hai khối, không dính thành hai dòng của một câu. Đo trong Chrome (28/10/2026): 24 cho
 * khe chữ 10–14px ở 390 và 1440, bằng khe giữa tên trục và legend HTML của hình đường (`.legend`);
 * 20 chỉ cho 6px ở 390.
 */
export const CACH_TEN_TRUC = 24;

/** Chân chữ hàng chú giải cuối cách đáy khung — bằng chỗ tên trục ngang đứng khi không có chú giải. */
export const CHAN = 6;

/** Cỡ chữ chú giải (`.columnLegendText`). */
const CO_CHU = 10;

/** Mẫu (ô màu, chấm, vạch) rộng 10 đơn vị, cách chữ 4 → chữ bắt đầu ở +14. */
const LECH_CHU = 14;

/** Khoảng hở giữa hai mục cùng hàng. */
const KHE_MUC = 12;

/** Lề tối thiểu tới mép khung khi một mục dài hơn cả vùng vẽ. */
const LE_KHUNG = 2;

export interface MucCanXep {
  readonly key: string;
  readonly text: string;
}

export type MucDaXep<T extends MucCanXep> = T & { readonly x: number; readonly y: number };

/**
 * Xếp các mục thành hàng (xuống hàng khi tràn bề ngang vùng vẽ), canh giữa từng hàng tại tâm vùng vẽ,
 * hàng cuối có chân chữ ở `H - CHAN`.
 *
 * `x` là mép trái của mẫu, `y` là chân chữ của hàng. `cao` là phần chiều cao khối chú giải lấy thêm so
 * với khi không có nó: nơi gọi trừ `cao` khỏi đáy vùng vẽ và khỏi chỗ đứng của tên trục ngang. Không
 * có mục nào thì `cao = 0` và hình y như cũ.
 */
export function xepChuGiaiDuoi<T extends MucCanXep>(
  items: ReadonlyArray<T>,
  x0: number,
  x1: number,
  W: number,
  H: number,
): { muc: Array<MucDaXep<T>>; cao: number } {
  if (items.length === 0) return { muc: [], cao: 0 };

  const rongVung = x1 - x0;
  const hang: Array<Array<{ item: T; rong: number }>> = [];
  let hienTai: Array<{ item: T; rong: number }> = [];
  let rongHang = 0;
  for (const item of items) {
    /* Bề ngang ước như mọi nhãn của hình (× 1,1, xem `ticks.ts`). */
    const rong = LECH_CHU + textWidth(item.text, CO_CHU) * 1.1;
    const can = hienTai.length === 0 ? rong : rongHang + KHE_MUC + rong;
    if (hienTai.length > 0 && can > rongVung) {
      hang.push(hienTai);
      hienTai = [];
      rongHang = 0;
    }
    rongHang = hienTai.length === 0 ? rong : rongHang + KHE_MUC + rong;
    hienTai.push({ item, rong });
  }
  hang.push(hienTai);

  const tam = (x0 + x1) / 2;
  const chanCuoi = H - CHAN;
  const muc: Array<MucDaXep<T>> = [];
  hang.forEach((dong, index) => {
    const tong = dong.reduce((sum, o) => sum + o.rong, 0) + KHE_MUC * (dong.length - 1);
    const batDau = Math.max(LE_KHUNG, Math.min(tam - tong / 2, W - LE_KHUNG - tong));
    const y = chanCuoi - (hang.length - 1 - index) * HANG_CHU_GIAI;
    let x = batDau;
    for (const o of dong) {
      muc.push({ ...o.item, x, y });
      x += o.rong + KHE_MUC;
    }
  });

  return { muc, cao: CACH_TEN_TRUC + (hang.length - 1) * HANG_CHU_GIAI };
}
