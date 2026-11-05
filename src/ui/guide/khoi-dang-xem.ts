import { fillRepeat, repeatIndexIn } from '@/application';
import type { Bilingual, DangDoc, HinhDangXem, KhoiBieuDoBai, KhoiLapBai } from '@/application';

/**
 * Phép CHỌN khối và dạng cho khung "?" của khối Biểu đồ — hàm thuần, không đụng tới DOM.
 *
 * Tách khỏi `GuideBody.tsx` ngày 03/11/2026 vì màn chi tiết cũng cần nó: nút "?" ẩn khi dạng đang vẽ
 * chưa có đoạn chữ (xem `khoiDangXem`). Nhập `GuideBody` vào màn chi tiết là mang cả thân bài vào gói
 * của 111 trang — đúng điều barrel `@/ui/guide` dặn tránh — còn module này chỉ có vài hàm.
 */

/** Đoạn chữ của MỘT dạng trong một khối — `undefined` khi kho không có đoạn ấy. */
export function doanCuaDang(khoi: KhoiBieuDoBai, dang: DangDoc): Bilingual | undefined {
  return khoi[dang];
}

/** Dạng màn mở ra của một khối: hình bóc tách mở bằng thanh ngang, hình đường mở bằng Đường. */
function dangMacDinh(khoi: KhoiBieuDoBai): DangDoc {
  return khoi.thanh !== undefined ? 'thanh' : 'duong';
}

/** Khối chữ của một ô do người dùng thêm, dựng từ khối mẫu bằng cách điền số thứ tự nhóm. */
function khoiTuMau(khoiLap: ReadonlyArray<KhoiLapBai>, khoa: string): KhoiBieuDoBai | undefined {
  for (const mau of khoiLap) {
    const n = repeatIndexIn(mau.tienTo, khoa);
    if (n === null) continue;
    return {
      khoa,
      ten: fillRepeat(mau.ten, n),
      duong: fillRepeat(mau.duong, n),
      ...(mau.cot === undefined ? {} : { cot: fillRepeat(mau.cot, n) }),
      ...(mau.diem === undefined ? {} : { diem: fillRepeat(mau.diem, n) }),
      ...(mau.bac === undefined ? {} : { bac: fillRepeat(mau.bac, n) }),
      ...(mau.laiLo === undefined ? {} : { laiLo: fillRepeat(mau.laiLo, n) }),
      // Ô của nhóm thêm là ô số thường: hình của nó vẽ được ngay, không chờ chuỗi giá.
      canChuoi: false,
    };
  }
  return undefined;
}

/**
 * Khối của hình ĐANG HIỆN trên màn tính và dạng đang vẽ — thứ khung "?" in.
 *
 * Tra bằng `KhoiBieuDoBai.khoa`, tức chính `ChartModel.sweepKey` mà khối Biểu đồ báo lên. Ba ca rơi
 * về khối ĐẦU (hình màn mở ra): khối Biểu đồ chưa kịp báo (`hinh === null` — chunk biểu đồ nạp trễ),
 * màn chưa vẽ gì và người dùng chưa chọn mục nào (`khoa === null`), và một khoá không có khối chữ.
 * Ca cuối không xảy ra trong thư viện hiện tại — `bieu-do.test.ts` đòi mọi mục của ô chọn đều có khối
 * — nên nó chỉ là lưới an toàn: thà nói về hình mặc định còn hơn để khung trống.
 *
 * `chuaVe` quyết định dòng "Chỉ vẽ sau khi đã nạp…": nó chỉ đáng in khi hình đang được tả CHƯA có
 * trên màn. Hình đã vẽ rồi mà còn in dòng ấy là nói một điều người đọc đang thấy là sai.
 *
 * ── Hình của một ô do người dùng THÊM (13/10/2026) ───────────────────────────────────────────
 *
 * Hai công thức cho thêm đợt mua / thêm kỳ, và ô chọn trục có ngay mục "Giá mua đợt 4". Ô ấy không
 * có khối riêng (lúc build chưa ai biết sẽ có mấy đợt), nên trước khi rơi về khối đầu, phép chọn
 * thử các khối MẪU (`khoiLap`): khoá là tiền tố của mẫu cộng một số thì lấy mẫu ấy và điền số vào
 * `{n}`. Không có bước này thì khung nói về "…theo Giá mua đợt 3" cạnh một hình của đợt 4.
 *
 * ── Mỗi dạng một đoạn, và KHÔNG BAO GIỜ in đoạn của dạng khác (03/11/2026) ─────────────────────
 *
 * Trước ngày ấy mọi dạng không phải Cột đều in đoạn Đường, và chủ dự án bắt được ngay: *"khi chuyển
 * dạng thì phần hướng dẫn sau đang chưa chuyển dạng hướng dẫn tương tự"*. Nay khối mang một đoạn cho
 * mỗi dạng ô "Loại biểu đồ" mời (`kiem.ts` đòi đủ), và phép chọn lấy đúng đoạn của dạng đang hiện.
 *
 * Hình ĐANG VẼ ở một dạng mà kho không có đoạn (phép dò ở `ke-hoach.ts` sót một bộ số) thì trả
 * `undefined`: khung im và nút "?" ẩn, cùng lối với `hinhChuoi`. Chỉ khi hình chưa vẽ (đang chờ chuỗi
 * giá, hoặc khung đang tả hình mặc định thay cho một khoá lạ) mới rơi về dạng mặc định của khối.
 */
export function khoiDangXem(
  khoi: ReadonlyArray<KhoiBieuDoBai>,
  hinh: HinhDangXem | null,
  khoiLap: ReadonlyArray<KhoiLapBai> = [],
): { khoi: KhoiBieuDoBai; dang: DangDoc; chuaVe: boolean } | undefined {
  const dau = khoi[0];
  if (dau === undefined) return undefined;
  /* Hình theo chuỗi giá chưa có chữ: im lặng chứ không in đoạn của hình khác (xem `HinhDangXem.hinhChuoi`). */
  if (hinh?.hinhChuoi === true) return undefined;

  const khoa = hinh?.khoa ?? null;
  const dangHien =
    khoa === null ? undefined : (khoi.find((mot) => mot.khoa === khoa) ?? khoiTuMau(khoiLap, khoa));
  const chon = dangHien ?? dau;
  const chuaVe = hinh === null || !hinh.daVe;

  const xin = hinh === null ? dangMacDinh(chon) : hinh.dang;
  if (doanCuaDang(chon, xin) !== undefined) return { khoi: chon, dang: xin, chuaVe };

  /* Hình đang vẽ đúng ở dạng ấy mà kho không có đoạn: im, không in đoạn của một dạng khác. */
  if (!chuaVe && dangHien !== undefined) return undefined;

  const macDinh = dangMacDinh(chon);
  return doanCuaDang(chon, macDinh) === undefined
    ? undefined
    : { khoi: chon, dang: macDinh, chuaVe };
}
