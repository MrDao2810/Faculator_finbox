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

/**
 * Đặt số vào công thức của MỘT đại lượng khối "Từ các ô trên, công thức tính ra" bày (05/10/2026).
 *
 * Sinh ra từ bốn câu hỏi chủ dự án đặt khi nhìn `tra-gop-nien-kim`: *"Gốc kỳ đầu là gì? tại sao lại
 * có gốc kỳ đầu? Lãi kỳ đầu là gì và tại sao lại có ở đây? nếu được tính ra thì công thức để tính
 * đâu? tại sao chưa cho vào."* Khối ấy bày nhãn và trị số, không gì khác — hai con số có tên mà
 * không tra được ở đâu ra, đúng lớp lỗ hổng mà chính khối này sinh ra để bịt cho `fcfe`, nay lặp
 * lại ở một tầng sâu hơn.
 *
 * `values` phải gồm CẢ `extras` của kết quả và `__ketQua`: `firstPrincipal` của một khoản vay niên
 * kim là "khoản trả hằng tháng trừ đi lãi kỳ đầu", tức nó nhắc tới chính kết quả và một đại lượng
 * dẫn xuất khác. Lấy thẳng từ `extras` — thứ `calc` vừa tính — nên không có bản sao phép tính nào ở
 * đây, và cũng không có thứ tự nào phải sắp.
 */
/**
 * Mọi giá trị mà một mẫu `derivedSubstitution` được phép nhắc tới, gom về một bảng.
 *
 * Ở Domain chứ không ở màn, và đó là có chủ ý: cửa gác ở `formulas.test.ts` phải gom ĐÚNG bảng mà
 * màn gom, nếu không nó gác một thứ khác với thứ người dùng nhìn thấy — đúng loại trôi mà cả dự án
 * này chữa bằng cấu trúc.
 *
 * Bốn nguồn, không chồng lấn: ô nhập · ký hiệu dẫn xuất của mẫu chính (`i`, `n`) · `extras` do
 * `calc` tính · và `__ketQua` là chính con số khối Kết quả in.
 */
export function giaTriChoDanXuat(
  hinh: ThaySoCay | null,
  values: Readonly<Record<string, number>>,
  extras: Readonly<Record<string, number>> | undefined,
  ketQua: number | null,
): Record<string, number> {
  const bang: Record<string, number> = {};
  for (const [k, v] of Object.entries(values)) if (Number.isFinite(v)) bang[k] = v;

  for (const dx of hinh?.danXuat ?? []) {
    const so = dx.khoa.map((k) => bang[k]);
    if (so.some((v) => v === undefined)) continue;
    const v = tinhCay(dx.cay, so as number[]);
    if (v !== null) bang[dx.khoaDat] = v;
  }

  for (const [k, v] of Object.entries(extras ?? {})) if (Number.isFinite(v)) bang[k] = v;
  if (ketQua !== null && Number.isFinite(ketQua)) bang['__ketQua'] = ketQua;

  return bang;
}

/**
 * Tên đọc được của một khoá trong mẫu dẫn xuất — KHÔNG viết mới một chữ nào (05/10/2026).
 *
 * Chủ dự án nhìn dòng `Gốc kỳ đầu = 7.457.049,5027 − 6.333.333,3333` và hỏi *"tại sao lại sử dụng
 * công thức trừ như kia? nguồn để tạo ra công thức đó là gì?"*. Câu hỏi đúng: một dòng toàn số
 * không nói nó đang TRỪ CÁI GÌ CHO CÁI GÌ, nên không ai phán được nó đúng hay sai.
 *
 * Lời đáp là một dòng thứ hai bằng TÊN: `Gốc kỳ đầu = Trả hằng tháng − Lãi kỳ đầu`. Đọc ra là
 * hiểu ngay vì sao có phép trừ, và không cần tin ai cả.
 *
 * Bốn nguồn tên, cả bốn đã có sẵn trong `spec` — nên dòng này không thêm một câu prose nào, không
 * nợ một bản dịch nào, và không thể trôi khỏi mẫu vì nó DỰNG TỪ CHÍNH MẪU ẤY:
 *
 *   · ô nhập          → `variables[].label`
 *   · khoá `extras`   → `breakdown[].shortLabel`, tức đúng cái tên đang in ở hàng trên
 *   · ký hiệu dẫn xuất→ `tenKyHieu`, tức ĐÚNG CỤM CHỮ dòng biểu thức trên hình đang dùng
 *   · `__ketQua`      → vế trái dòng biểu thức ("Trả hằng tháng"), tức tên của chính con số to
 *
 * ## Vì sao ký hiệu dẫn xuất phải lấy tên từ dòng biểu thức, không từ bảng ký hiệu
 *
 * Bản đầu cắt MỆNH ĐỀ ĐẦU trong nghĩa ở bảng ký hiệu. Chủ dự án chụp màn ngày 05/10/2026: hình vẽ
 * và dòng chữ dưới hình gọi `i` là **"Lãi suất kỳ"**, còn hàng dẫn xuất ngay dưới lại ghi
 * *"lãi suất một kỳ tháng"* — *"đây là lãi suất kỳ mà. tại sao bên dưới lại ghi là lãi suất kỳ
 * tháng?"*.
 *
 * Hai lỗi chồng nhau, và cái thứ hai mới là gốc:
 *
 * 1. Chuỗi `'lãi suất một kỳ tháng'` sai ngữ pháp — đo cả 57 ký hiệu lãi suất/lợi suất của thư
 *    viện thì chỉ có 3 chỗ mang dạng ấy, mọi chỗ khác viết "mỗi kỳ", "một kỳ ngắn", "mỗi tháng".
 *    Đã sửa tại chỗ.
 * 2. **Nghĩa không phải tên.** Bảng ký hiệu cố ý viết định nghĩa dài hơn tên — đo được 85 trên 101
 *    dòng có cụm chữ khác với nghĩa, và đó là THIẾT KẾ (`pe` in "EPS" trên dòng chữ, bảng ký hiệu
 *    giải "lợi nhuận sau thuế trên mỗi cổ phiếu"). Nên cắt mệnh đề đầu của một định nghĩa là lấy
 *    một thứ KHÔNG BAO GIỜ hứa sẽ trùng tên, rồi đặt nó cạnh ba nguồn kia vốn đều là tên thật —
 *    ra `Số tiền vay × lãi suất một kỳ tháng`, hoa cạnh thường, hai giọng trong một phép nhân.
 *
 * Mà tên đúng thì màn đã có sẵn: `notation.expression` đã gắn mỗi cụm chữ với ký hiệu của nó
 * (`HowToEntry.phrases`, khai nguyên văn chứ không đoán), và `segmentExpressionLines` ném lỗi lúc
 * build nếu cụm ấy không có thật trong dòng chữ. Nơi gọi tra bảng đó rồi truyền xuống qua
 * `tenKyHieu`, nên hai dòng trên màn dùng CHUNG MỘT CHUỖI chứ không phải hai chuỗi giống nhau.
 *
 * Giữ lại nhánh cắt nghĩa làm lưới an toàn cho ký hiệu chưa khai cụm chữ — hiện không ký hiệu nào
 * rơi vào đó, và một ca kiểm ở `FormulaDetail.test.tsx` giữ cho vẫn vậy.
 */
export function nhanCuaKhoa(
  spec: FormulaSpec,
  khoa: string,
  tenKyHieu?: Readonly<Record<string, Bilingual>>,
): Bilingual {
  if (khoa === '__ketQua') {
    const cat = (s: string): string => (s.split('=')[0] ?? s).trim();
    const vi = cat(spec.expression?.vi ?? spec.name.vi);
    const en = cat(spec.expression?.en ?? spec.name.en);
    return { vi: vi === '' ? spec.name.vi : vi, en: en === '' ? spec.name.en : en };
  }

  const bien = spec.variables.find((v) => v.key === khoa);
  if (bien !== undefined) return bien.label;

  const chang = spec.breakdown?.find((s) => s.key === khoa);
  if (chang?.shortLabel !== undefined) return chang.shortLabel;

  /*
   * Ký hiệu dẫn xuất (`i`, `n`): lấy ĐÚNG cụm chữ dòng biểu thức đang dùng. `Lãi kỳ đầu = Số tiền
   * vay × i` bắt người đọc ngước lên tra bảng mới hiểu, mà cả dòng này sinh ra để khỏi phải tra.
   */
  const ten = tenKyHieu?.[khoa];
  if (ten !== undefined) return ten;

  /*
   * Lưới an toàn: ký hiệu chưa khai cụm chữ thì cắt mệnh đề đầu trong nghĩa ở bảng ký hiệu. Cắt ở
   * dấu phẩy đầu vì phần sau là chú thích nguồn ("bằng ô Lãi suất / năm chia 12") — đúng và cần,
   * nhưng đặt giữa một phép nhân thì thành một câu chen ngang. Xem docblock trên về giới hạn của
   * nhánh này.
   */
  const kyHieu = spec.symbols?.find((s) => s.latex === khoa);
  if (kyHieu !== undefined) {
    const dau = (s: string): string => (s.split(',')[0] ?? s).trim();
    return { vi: dau(kyHieu.meaning.vi), en: dau(kyHieu.meaning.en) };
  }

  return { vi: khoa, en: khoa };
}

/**
 * Cây của dòng ký hiệu: cùng một mẫu, nhưng lá là TÊN chứ không phải số.
 *
 * Dựng từ chính `hinh` mà `datSoDanXuat` dùng, nên hai dòng không bao giờ nói hai phép tính khác
 * nhau — đó là cả lý do nó không nhận một mẫu riêng.
 */
export function datNhanDanXuat(
  hinh: DanXuatCay,
  spec: FormulaSpec,
  ngonNgu: 'vi' | 'en',
  tenKyHieu?: Readonly<Record<string, Bilingual>>,
): Nut {
  return datSoVaoCay(
    hinh.cay,
    hinh.khoa.map((k) => nhanCuaKhoa(spec, k, tenKyHieu)[ngonNgu]),
  );
}

export function datSoDanXuat(
  hinh: DanXuatCay,
  values: Readonly<Record<string, number>>,
  danXuat: ReadonlyArray<DanXuatCay> = [],
): Nut | null {
  const chu: string[] = [];
  for (const k of hinh.khoa) {
    const v = values[k];
    if (v === undefined || !Number.isFinite(v)) return null;
    chu.push(formatNumber(v, { maxDecimals: soLe(k, v, danXuat) }));
  }
  return datSoVaoCay(hinh.cay, chu);
}
