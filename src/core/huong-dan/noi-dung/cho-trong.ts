import { formatNumber } from '../../format';

/**
 * Chỗ trống trong câu hướng dẫn — số minh hoạ ĐI THEO ô nhập thay vì đứng chết (14/10/2026).
 *
 * ── Lỗi nó sinh ra để sửa ────────────────────────────────────────────────────────────────────
 *
 * Chủ dự án chụp khung "?" của khối Số liệu ở `bien-do-dao-dong-lon-nhat`: thanh trượt "Số phiên
 * trong kỳ" đang ở 55, còn khung ghi "60 phiên là khoảng ba tháng." Câu ấy viết quanh giá trị MẶC
 * ĐỊNH của ô (60), còn ô thì đã sang 55 vì nút "Xem ví dụ minh hoạ" nạp bộ số của ví dụ. Rồi chốt:
 * *"khi người dùng sửa đổi thông số hoặc nạp mẫu gì đó từ ticker vào thì 60 phiên đổi thành 55
 * phiên, 10 triệu đổi thành 10000 tỷ chẳng hạn, thì trong phần hướng dẫn sử dụng cũng cần thay đổi
 * tương ứng theo"*.
 *
 * ── Số nào đi theo ô, số nào KHÔNG ───────────────────────────────────────────────────────────
 *
 * Chỉ số MINH HOẠ CHO CHÍNH GIÁ TRỊ CỦA Ô đi theo ô: "60 phiên là khoảng ba tháng" là một phép đổi
 * con số người dùng đang nhìn ra thời gian; "Nếu có 1,47 tỷ cổ phiếu thì nhập 1470" là cách điền
 * đúng đơn vị của ô. Còn quy ước và sự thật về thị trường thì KHÔNG: "12 là mặc định phổ biến" dưới
 * ô chu kỳ nhanh của MACD mà đổi theo ô thì thành "10 là mặc định phổ biến" — một câu sai.
 * `noi-dung.test.ts` ghim cả hai danh sách.
 *
 * ── Cú pháp ──────────────────────────────────────────────────────────────────────────────────
 *
 * `{khoa}` hoặc `{khoa|kieu}`, `khoa` là `VariableSpec.key` của chính công thức ấy:
 *
 * | Mẫu                  | Ra gì (với 55 phiên · 1.470 triệu CP · min 60) | Đọc từ đâu             |
 * | -------------------- | ---------------------------------------------- | ---------------------- |
 * | `{sessions}`         | `55`                                           | giá trị đang có trong ô |
 * | `{sessions|thoiGian}`| `2,5 tháng`                                    | giá trị đang có trong ô |
 * | `{shares|coPhieu}`   | `1,47 tỷ`                                      | giá trị đang có trong ô |
 * | `{sessions|min}`     | `60`                                           | `VariableSpec.min`     |
 * | `{periods|max}`      | `12`                                           | `VariableSpec.max`     |
 *
 * `min`/`max` không đi theo ô mà theo MÃ: "Tối thiểu 60 phiên" phải đổi khi ai đó đổi trần của ô.
 *
 * ── Không có số thì lấy số mặc định ──────────────────────────────────────────────────────────
 *
 * Trang hướng dẫn đầy đủ không có ô nào để đọc, nên nó điền bằng `defaultValue` — đúng con số màn
 * tính bày ra lúc mở. Khung "?" thì đọc ô; ô trống, bằng 0 hay không phải số hữu hạn cũng rơi về
 * mặc định, vì "0 phiên là khoảng 0 tuần" hay "nhập 0" không dạy được gì.
 */

/** Thông số của một ô mà câu hướng dẫn được phép nhắc tới — rút từ `VariableSpec` ở `bai.ts`. */
export interface ThongSoO {
  macDinh: number;
  min?: number;
  max?: number;
}

export type KieuChoTrong = 'so' | 'thoiGian' | 'coPhieu' | 'min' | 'max';

const KIEU: ReadonlyArray<KieuChoTrong> = ['so', 'thoiGian', 'coPhieu', 'min', 'max'];

const MAU = /\{([A-Za-z][A-Za-z0-9]*)(?:\|([A-Za-z]+))?\}/g;

/** Mọi chỗ trống trong một câu, theo thứ tự xuất hiện. Kiểu lạ vẫn trả ra để cửa kiểm thấy. */
export function choTrongCua(cau: string): ReadonlyArray<{ khoa: string; kieu: string }> {
  return [...cau.matchAll(MAU)].map((m) => ({ khoa: m[1] ?? '', kieu: m[2] ?? 'so' }));
}

export function laKieuChoTrong(kieu: string): kieu is KieuChoTrong {
  return (KIEU as ReadonlyArray<string>).includes(kieu);
}

/**
 * Số phiên giao dịch ra thời gian lịch, làm tròn tới nửa đơn vị: "2,5 tháng", "1 năm", "2 tuần".
 *
 * Gốc quy đổi là 250 phiên một năm — đúng con số kho chữ này nói ở năm chỗ ("Việt Nam khoảng 250
 * phiên"), nên một tháng là 250 ÷ 12 ≈ 20,8 phiên và một tuần là 5 phiên. Với gốc ấy ba câu gốc
 * của chủ dự án ra lại đúng nghĩa cũ: 60 phiên → 3 tháng, 250 → 1 năm, 20 → 1 tháng.
 *
 * Dưới ba tuần thì đếm tuần (0,6 tháng đọc khó hơn 3 tuần); từ khoảng một năm thì đếm năm.
 */
export function thoiGianPhien(phien: number): string {
  const thang = (phien * 12) / 250;
  if (thang < 0.75) return `${formatNumber(Math.max(1, Math.round(phien / 5)))} tuần`;
  const thangTron = Math.round(thang * 2) / 2;
  if (thangTron < 12) return `${formatNumber(thangTron, { maxDecimals: 1 })} tháng`;
  const nam = Math.round((phien / 250) * 2) / 2;
  return `${formatNumber(nam, { maxDecimals: 1 })} năm`;
}

/**
 * Số cổ phiếu tính bằng TRIỆU ra cách người ta nói: "1,47 tỷ", "118 triệu".
 *
 * Đây đúng là phép đổi câu "Nếu có 1,47 tỷ cổ phiếu thì nhập 1470" dạy: báo cáo ghi theo tỷ, ô nhận
 * theo triệu. Từ 1.000 triệu trở lên mới nói tỷ — nói "0,118 tỷ" là đổi ngược chiều cái câu ấy dạy.
 */
export function soCoPhieuTrieu(trieu: number): string {
  if (trieu >= 1000) return `${formatNumber(trieu / 1000, { maxDecimals: 3 })} tỷ`;
  return `${formatNumber(trieu, { maxDecimals: 3 })} triệu`;
}

/**
 * Điền mọi chỗ trống của một câu.
 *
 * `giaTri` là bộ số đang có trên màn tính; vắng (trang đầy đủ) thì điền bằng mặc định. Chỗ trống
 * trỏ vào một ô không có trong `thongSo`, hoặc mang kiểu lạ, thì để NGUYÊN — `noi-dung.test.ts`
 * bắt nó trước khi lên màn, và để nguyên thì người đọc ít ra còn thấy có chỗ hỏng thay vì một con
 * số bịa.
 */
export function dienCau(
  cau: string,
  thongSo: Readonly<Record<string, ThongSoO>>,
  giaTri?: Readonly<Record<string, number | null | undefined>>,
): string {
  if (!cau.includes('{')) return cau;

  return cau.replace(MAU, (nguyen, khoa: string, kieuGoc: string | undefined) => {
    const o = thongSo[khoa];
    const kieu = kieuGoc ?? 'so';
    if (o === undefined || !laKieuChoTrong(kieu)) return nguyen;

    if (kieu === 'min' || kieu === 'max') {
      const bien = o[kieu];
      return bien === undefined ? nguyen : formatNumber(bien);
    }

    const dangCo = giaTri?.[khoa];
    const so =
      typeof dangCo === 'number' && Number.isFinite(dangCo) && dangCo > 0 ? dangCo : o.macDinh;

    if (kieu === 'thoiGian') return thoiGianPhien(so);
    if (kieu === 'coPhieu') return soCoPhieuTrieu(so);
    return formatNumber(so);
  });
}
