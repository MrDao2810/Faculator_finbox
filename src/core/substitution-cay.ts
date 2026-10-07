import { formatNumber } from './format';
import type { FormulaSpec } from './registry/types';
import type { Bilingual } from './types';
import type { Nut } from './quiz/nut';
import { datSoVaoCay, tinhCay } from './quiz/nut';

/**
 * Dòng "thay số" của màn tính, ở dạng VẼ ĐƯỢC — module nhẹ, trình duyệt nhập được (05/10/2026).
 *
 * ## Vì sao có file này
 *
 * Tới 05/10/2026 dòng ấy in ra chữ trơn:
 *
 * ```text
 * 800.000.000 × 9,5 ÷ 100 ÷ 12 × (1 + 9,5 ÷ 100 ÷ 12)^(20 × 12) ÷ ((1 + 9,5 ÷ 100 ÷ 12)^(20 × 12) − 1)
 * ```
 *
 * Chủ dự án chụp màn và nói *"đang hiển thị quá loạn khiến tôi là người code cũng khó hiểu"*, rồi
 * chốt: *"bên trên công thức đang biểu thị như nào thì ở chỗ này cũng cần hiển thị như vậy và chỉ
 * là thay số liệu vào thôi"*.
 *
 * Đây là lần THỨ BA cùng một lỗi. Ngày 29/09/2026 chủ dự án đã chụp dòng "Áp vào công thức" của bài
 * tập với cùng lời phê — in ra chữ thì căn thức mất vạch trên, số mũ thành `^(...)`, phân số thành
 * một dãy `÷` — và lời giải khi ấy là VẼ bằng `CongThucDien`. Khối Ví dụ thực tế theo sau. Dòng ở
 * màn tính là chỗ cuối cùng còn in chữ.
 *
 * ## Vì sao cây dựng lúc build mà số đặt lúc chạy
 *
 * Dòng này khác hai chỗ kia ở một điểm quyết định cả thiết kế: số của nó ĐỔI THEO TỪNG PHÍM GÕ, còn
 * hai chỗ kia có số cố định nên cây dựng sẵn lúc build là xong.
 *
 * Nhưng hình dạng cây thì không đổi — gõ lại một ô không làm phép nhân thành phép chia. Nên mẫu
 * được phân tích MỘT LẦN lúc build (`substitutionShape`, nhập bộ phân tích thoải mái vì nó chỉ chạy
 * ở `page.tsx`), còn trình duyệt chỉ đi cây đặt số. Nhờ vậy `worked-line.ts` (24 kB) không phải có
 * mặt trong First Load JS của cả 111 trang chi tiết — đúng ràng buộc đã ghi ở `@/application/quiz-cay`.
 *
 * ## Ký hiệu dẫn xuất
 *
 * Chủ dự án chốt thay số ở mức KÝ HIỆU, không khai triển. Hình `tra-gop-nien-kim` viết
 * `EMI = P·i(1+i)ⁿ / ((1+i)ⁿ − 1)`, nên dòng thay số phải đọc là
 * `800.000.000 × 0,00791667 × (1 + 0,00791667)²⁴⁰ ÷ (…)`, chứ không phải `9,5 ÷ 100 ÷ 12` dán vào
 * chỗ của `i`.
 *
 * Mà `i` và `n` không phải ô nhập — ô nhập là "Lãi suất / năm" và "Kỳ hạn". Nên mẫu khai thêm
 * `spec.substitutionDerived`, và chúng được tính lúc chạy bằng `tinhCay`. Thứ tự khai là thứ tự
 * tính: một đại lượng chỉ được nhắc tới ô nhập và các đại lượng khai TRƯỚC nó.
 */

/** Một đại lượng dẫn xuất đã dựng cây: tính xong thì nó thành đầu vào cho những cái sau. */
export interface DanXuatCay {
  /** Khoá mà giá trị tính ra sẽ mang, để mẫu chính và các đại lượng sau nhắc tới. */
  khoaDat: string;
  cay: Nut;
  /** Ô trống thứ `i` của `cay` lấy giá trị của khoá `khoa[i]`. */
  khoa: ReadonlyArray<string>;
}

/** Mẫu thay số đã phân tích xong lúc build — thứ `page.tsx` truyền xuống như một prop. */
export interface ThaySoCay {
  cay: Nut;
  /** Ô trống thứ `i` của `cay` lấy giá trị của khoá `khoa[i]`. */
  khoa: ReadonlyArray<string>;
  /** Theo đúng thứ tự khai trong `spec.substitutionDerived`; rỗng với mẫu không có ký hiệu dẫn xuất. */
  danXuat: ReadonlyArray<DanXuatCay>;
}

/**
 * Số chữ số lẻ của một ký hiệu DẪN XUẤT — nhiều hơn hẳn ô nhập, và đó là một phép đo chứ không
 * phải sở thích.
 *
 * Lãi suất một kỳ của `tra-gop-nien-kim` là `9,5 ÷ 100 ÷ 12 = 0,00791666…`. Làm tròn 4 chữ số lẻ
 * như ô nhập thì ra `0,0079`, lệch 0,21%; nhưng nó nằm trong `(1 + i)²⁴⁰` nên sai số bị luỹ thừa
 * lên, và dòng vẽ ra tính lại lệch khoảng 0,6% so với con số khối Kết quả đang in — vượt ngưỡng
 * 0,5% mà cửa gác đòi, và tệ hơn: người tính tay theo đúng dòng trên màn sẽ ra một số khác.
 */
const LE_DAN_XUAT = 8;

/** Số chữ số lẻ của một Ô NHẬP. Giữ đúng mức `fillSubstitution` đã dùng từ đầu. */
const LE_O_NHAP = 4;

/**
 * Chọn số chữ số lẻ cho MỘT giá trị.
 *
 * Hai luật, và luật thứ hai là lưới an toàn sinh ra từ một lỗi thật đo được ngày 05/10/2026: khối
 * "Từ các ô trên" in `Lãi kỳ đầu = 800.000.000 × 0,0079` cạnh con số `6.333.333,33` — bấm lại đúng
 * dòng ấy ra 6.320.000. Lãi suất một kỳ lọt qua vì nó tới từ bảng giá trị chung, nơi không ai nhớ
 * nó vốn là một ký hiệu dẫn xuất.
 *
 * Nên ngoài luật theo KHOÁ còn một luật theo ĐỘ LỚN: cái gì nhỏ hơn 1 thì bốn chữ số lẻ không đủ —
 * một tỷ lệ 0,0079 đã mất 0,2% ngay ở chữ số cuối, và 0,2% ấy còn bị luỹ thừa lên khi nằm trong
 * `(1 + i)ⁿ`. Tiền và số đếm thì bốn chữ số lẻ là thừa đủ.
 */
function soLe(khoa: string, v: number, danXuat: ReadonlyArray<DanXuatCay>): number {
  if (danXuat.some((dx) => dx.khoaDat === khoa)) return LE_DAN_XUAT;
  return v !== 0 && Math.abs(v) < 1 ? LE_DAN_XUAT : LE_O_NHAP;
}

/**
 * Đặt số đang gõ vào cây, trả về cây vẽ được — hoặc `null` nếu thiếu một giá trị nào đó.
 *
 * `null` chứ không phải một cây có chỗ trống: một dòng thay số cụt còn khó hiểu hơn không có dòng
 * nào, và nơi gọi đã có sẵn nhánh bỏ hẳn dòng (cùng lẽ với `fillSubstitution`).
 */
export function datSoThaySo(hinh: ThaySoCay, values: Readonly<Record<string, number>>): Nut | null {
  const giaTri: Record<string, number> = {};
  for (const [key, value] of Object.entries(values)) {
    if (Number.isFinite(value)) giaTri[key] = value;
  }

  /* Tính lần lượt theo thứ tự khai — mỗi đại lượng tính xong thành đầu vào của những cái sau. */
  for (const dx of hinh.danXuat) {
    const so = dx.khoa.map((k) => giaTri[k]);
    if (so.some((v) => v === undefined)) return null;
    const v = tinhCay(dx.cay, so as number[]);
    if (v === null) return null;
    giaTri[dx.khoaDat] = v;
  }

  const chu: string[] = [];
  for (const k of hinh.khoa) {
    const v = giaTri[k];
    if (v === undefined) return null;
    chu.push(formatNumber(v, { maxDecimals: soLe(k, v, hinh.danXuat) }));
  }

  return datSoVaoCay(hinh.cay, chu);
}
