import { formatNumber } from './format';
import type { Nut } from './quiz/nut';
import { themNgoac, tinhCay } from './quiz/nut';
import { laKhoaKetQua } from './substitution';

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
 * Ngoại lệ duy nhất là phần LẶP (`spec.substitutionRepeat`, 16/10/2026): số số hạng của tổng đổi theo
 * số đợt người dùng thêm, nên cây của MỘT số hạng dựng lúc build, còn việc nhân nó lên n lần và nối
 * bằng dấu cộng (hay dấu nhân) làm lúc chạy — đi cây thuần, vẫn không cần bộ phân tích.
 *
 * ## Ký hiệu dẫn xuất
 *
 * Chủ dự án chốt thay số ở mức KÝ HIỆU, không khai triển. Hình `tra-gop-nien-kim` viết
 * `EMI = P·i(1+i)ⁿ / ((1+i)ⁿ − 1)`, nên dòng thay số phải đọc là
 * `800.000.000 × 0,0079166667 × (1 + 0,0079166667)²⁴⁰ ÷ (…)`, chứ không phải `9,5 ÷ 100 ÷ 12` dán vào
 * chỗ của `i`.
 *
 * Mà `i` và `n` không phải ô nhập — ô nhập là "Lãi suất / năm" và "Kỳ hạn". Nên mẫu khai thêm
 * `spec.substitutionDerived`, và chúng được tính lúc chạy bằng `tinhCay`. Thứ tự khai là thứ tự
 * tính: một đại lượng chỉ được nhắc tới ô nhập và các đại lượng khai TRƯỚC nó.
 *
 * Đại lượng mà chỉ `calc` biết — lợi suất bình quân một phiên của chuỗi giá, nghiệm IRR dò ra —
 * vào mẫu bằng khoá `{@ten}`, đọc từ `extras` của chính kết quả đang in (xem `laKhoaKetQua`).
 */

/** Một đại lượng dẫn xuất đã dựng cây: tính xong thì nó thành đầu vào cho những cái sau. */
export interface DanXuatCay {
  /** Khoá mà giá trị tính ra sẽ mang, để mẫu chính và các đại lượng sau nhắc tới. */
  khoaDat: string;
  cay: Nut;
  /** Ô trống thứ `i` của `cay` lấy giá trị của khoá `khoa[i]`. */
  khoa: ReadonlyArray<string>;
}

/**
 * Một phần LẶP đã dựng cây: cây của MỘT số hạng, nhân lên theo số đợt lúc chạy (16/10/2026).
 *
 * Trong `khoa`, dấu `#` là chỗ của chỉ số: `amount#` ở số hạng thứ 3 đọc khoá `amount3`, còn khoá
 * đúng bằng `#` là chính con số 3 (số mũ `t` của DDM hai giai đoạn).
 */
export interface LapCay {
  /** Khoá mà mẫu chính nhường chỗ cho cả tổng (hay cả tích) này. */
  khoaDat: string;
  /** Khoá cho biết có bao nhiêu số hạng — ô nhập (`lots`) hay số `calc` trả (`@n`). */
  dem: string;
  /** Chỉ số của số hạng đầu. */
  tu: number;
  /** Nối các số hạng bằng dấu cộng, dấu nhân, hay gom vào một `max(…)`. */
  noi: 'cong' | 'nhan' | 'max';
  cay: Nut;
  khoa: ReadonlyArray<string>;
  /** Khoá (có `#`) mà bằng 0 thì bỏ số hạng ấy — đúng những đợt `calc` cũng bỏ qua. */
  boQuaKhiKhong?: string;
}

/** Mẫu thay số đã phân tích xong lúc build — thứ `page.tsx` truyền xuống như một prop. */
export interface ThaySoCay {
  cay: Nut;
  /** Ô trống thứ `i` của `cay` lấy giá trị của khoá `khoa[i]`. */
  khoa: ReadonlyArray<string>;
  /** Theo đúng thứ tự khai trong `spec.substitutionDerived`; rỗng với mẫu không có ký hiệu dẫn xuất. */
  danXuat: ReadonlyArray<DanXuatCay>;
  /** Các phần lặp của `spec.substitutionRepeat`; vắng với mẫu có số số hạng cố định. */
  lap?: ReadonlyArray<LapCay>;
  /**
   * Vế phải của một PHƯƠNG TRÌNH (`spec.substitutionRhs`) — có mặt thì dòng in "≈ vế phải" thay cho
   * "= kết quả": IRR và XIRR là nghiệm dò ra, hình của chúng là một đẳng thức chứ không phải một
   * phép tính ra kết quả.
   */
  vePhai?: { cay: Nut; khoa: ReadonlyArray<string> };
  /**
   * Mẫu riêng theo giá trị của một ô lựa chọn (`spec.substitutionCases`) — vắng giá trị nào thì dùng
   * `cay`/`khoa` mặc định.
   */
  theoLuaChon?: {
    khoa: string;
    cay: Readonly<Record<string, { cay: Nut; khoa: ReadonlyArray<string> }>>;
  };
}

/** Mẫu chính đang dùng: mẫu riêng của lựa chọn đang chọn, hoặc mẫu mặc định. */
function mauChinh(
  hinh: ThaySoCay,
  values: Readonly<Record<string, number>>,
): { cay: Nut; khoa: ReadonlyArray<string> } {
  const chon = hinh.theoLuaChon;
  if (chon === undefined) return hinh;
  const v = values[chon.khoa];
  return (v === undefined ? undefined : chon.cay[String(v)]) ?? hinh;
}

/** Thứ màn in ra: hình đã đặt số, dấu nối và con số đứng sau dấu ấy. */
export interface DongThaySo {
  cay: Nut;
  dau: '=' | '≈';
  /** Con số sau dấu — kết quả của `calc`, hay vế phải của phương trình. Màn tự định dạng. */
  vePhai: number;
}

/**
 * Bậc chữ số lẻ, tăng dần cho tới khi dòng in ra bấm lại đúng con số (16/10/2026).
 *
 * Bậc đầu là mức cũ: 4 chữ số lẻ cho ô nhập, 8 cho ký hiệu dẫn xuất và mọi số nhỏ hơn 1. Mức ấy
 * KHÔNG đủ, và đo được: dải của `tra-gop-nien-kim` in `i = 0,00791667` rồi `= 7.457.049,5`, nhưng bấm
 * lại đúng các số trên dải ra 7.457.051,59 — sai số làm tròn của `i` bị luỹ thừa 240 lần. Cửa gác cũ
 * cho lệch 0,5% nên nó xanh. Chủ dự án đòi "chuẩn xác tuyệt đối vì đây là tính toán chi tiết mà người
 * dùng sử dụng", nên luật nay là: tăng chữ số lẻ tới khi bấm lại ra ĐÚNG chuỗi con số khối Kết quả
 * in, hết bậc mà vẫn lệch thì không in dòng nào (`datSoThaySo` trả `null`).
 *
 * Ô nhập người dùng gõ có ít chữ số lẻ nên tăng bậc không đổi gì ở nó (`formatNumber` không viết số
 * 0 thừa); bậc chỉ dài ra ở chỗ con số thật sự cần.
 */
const BAC_LE: ReadonlyArray<readonly [nho: number, lon: number]> = [
  [8, 4],
  [10, 6],
  [12, 8],
  [14, 10],
  [16, 12],
];

/** Số chữ số lẻ của một giá trị ở bậc `bac`: số tính ra và số nhỏ hơn 1 cần nhiều hơn ô nhập. */
function soLe(khoa: string, v: number, danXuat: ReadonlySet<string>, bac: number): number {
  const [nho, lon] = BAC_LE[bac] ?? [20, 20];
  if (danXuat.has(khoa) || laKhoaKetQua(khoa)) return nho;
  return v !== 0 && Math.abs(v) < 1 ? nho : lon;
}

/** Hai con số in ra giống hệt nhau ở khối Kết quả — "-0" và "0" coi như một. */
function cungChu(a: number, b: number): boolean {
  const chu = (v: number): string => formatNumber(v).replace(/^-0$/, '0');
  return chu(a) === chu(b);
}

/** Một lá số; số âm thành dấu trừ đơn đứng trước trị tuyệt đối, để bộ vẽ và nhãn chữ đọc đúng. */
function la(v: number, le: number): Nut {
  const so: Nut = { t: 'so', raw: formatNumber(Math.abs(v), { maxDecimals: le }) };
  return v < 0 ? { t: 'am', a: so } : so;
}

/** Gỡ mọi nút ngoặc — chúng đều do `themNgoac` cài, nên cài lại trên cây đã lắp là đủ. */
function boNgoac(cay: Nut): Nut {
  switch (cay.t) {
    case 'so':
    case 'o':
      return cay;
    case 'ngoac':
      return boNgoac(cay.a);
    case 'cong':
    case 'tru':
    case 'nhan':
    case 'chia':
    case 'chiaDong':
    case 'luythua':
      return { t: cay.t, a: boNgoac(cay.a), b: boNgoac(cay.b) };
    case 'max':
      return { t: 'max', ds: cay.ds.map(boNgoac) };
    default:
      return { t: cay.t, a: boNgoac(cay.a) };
  }
}

/**
 * Đi cây, đặt giá trị vào từng chỗ trống — chỗ trống của phần lặp nhận cả một tổng.
 *
 * Cây trả ra CHƯA có ngoặc đúng chỗ: chỗ trống từng là một con số, giờ có thể là một số âm hay cả
 * một tổng. Nơi gọi gỡ ngoặc cũ rồi chạy lại `themNgoac` trên cây đã lắp — cùng một luật với bộ
 * phân tích, không phải một bản sao.
 *
 * `a + (−x)` đổi thành `a − x`: cùng một giá trị, đọc tự nhiên hơn. Đổi trên cây chứ không để bộ
 * vẽ lo, vì nhãn chữ `aria-label` cũng đi qua cây này.
 */
function dat(cay: Nut, cho: (thuTu: number) => Nut | null): Nut | null {
  switch (cay.t) {
    case 'so':
      return cay;
    case 'o':
      return cho(cay.thuTu);
    case 'cong':
    case 'tru':
    case 'nhan':
    case 'chia':
    case 'chiaDong':
    case 'luythua': {
      const a = dat(cay.a, cho);
      const b = dat(cay.b, cho);
      if (a === null || b === null) return null;
      if (cay.t === 'cong' && b.t === 'am') return { t: 'tru', a, b: b.a };
      return { t: cay.t, a, b };
    }
    case 'max': {
      const ds = cay.ds.map((d) => dat(d, cho));
      return ds.some((d) => d === null) ? null : { t: 'max', ds: ds as Nut[] };
    }
    default: {
      const a = dat(cay.a, cho);
      return a === null ? null : { t: cay.t, a };
    }
  }
}

/**
 * Đưa dấu âm ở đầu tử số (hay ở thừa số đầu) ra trước cả số hạng: `(−a) ÷ b` thành `−(a ÷ b)`. Cùng
 * một giá trị; nhờ vậy số hạng âm của một tổng đọc thành phép trừ — dòng tiền chi ra của XIRR in
 * `… − 6.290.000 ÷ (…)` chứ không phải `… + (−6.290.000) ÷ (…)`.
 */
function dauAmRaNgoai(h: Nut): Nut {
  if ((h.t === 'chia' || h.t === 'chiaDong' || h.t === 'nhan') && h.a.t !== 'so') {
    const trai = dauAmRaNgoai(h.a);
    if (trai.t === 'am') return { t: 'am', a: { t: h.t, a: trai.a, b: h.b } };
  }
  return h;
}

/** Nối các số hạng thành một tổng (hay một tích), số hạng âm của tổng đọc thành phép trừ. */
function noiSoHang(soHangTho: ReadonlyArray<Nut>, noi: 'cong' | 'nhan' | 'max'): Nut | null {
  if (noi === 'max') return soHangTho.length === 0 ? null : { t: 'max', ds: soHangTho };
  const soHang = noi === 'cong' ? soHangTho.map(dauAmRaNgoai) : soHangTho;
  let tich: Nut | null = null;
  for (const h of soHang) {
    if (tich === null) tich = h;
    else if (noi === 'cong' && h.t === 'am') tich = { t: 'tru', a: tich, b: h.a };
    else tich = { t: noi, a: tich, b: h };
  }
  return tich;
}

/**
 * Đặt số đang có vào cây, trả về thứ màn in — hoặc `null` nếu không in được một dòng ĐÚNG.
 *
 * `null` ở ba ca: thiếu một giá trị nào đó (một dòng cụt còn khó hiểu hơn không có dòng nào); số
 * đợt của phần lặp không hợp lệ; hoặc đã tăng hết bậc chữ số lẻ mà bấm lại các số in ra vẫn không
 * ra đúng con số sau dấu "=" — một dòng như thế là một lời hứa sai, nên thà không in.
 *
 * `ketQua` là con số khối Kết quả đang in. Vắng nó thì không có gì để đối chiếu, hàm in ở bậc đầu.
 */
export function datSoThaySo(
  hinh: ThaySoCay,
  values: Readonly<Record<string, number>>,
  ketQua?: number,
): DongThaySo | null {
  const dung = boLap(hinh, values);
  if (dung === null) return null;
  const chinh = mauChinh(hinh, values);

  for (let bac = 0; bac < BAC_LE.length; bac += 1) {
    const cay = dung(chinh.cay, chinh.khoa, bac);
    if (cay === null) return null;

    if (hinh.vePhai !== undefined) {
      const vePhaiCay = dung(hinh.vePhai.cay, hinh.vePhai.khoa, BAC_DAY_DU);
      const vePhai = vePhaiCay === null ? null : tinhCay(vePhaiCay);
      if (vePhai === null) return null;
      const veTrai = tinhCay(cay);
      if (veTrai !== null && cungChu(veTrai, vePhai)) return { cay, dau: '≈', vePhai };
      continue;
    }

    if (ketQua === undefined) return { cay, dau: '=', vePhai: tinhCay(cay) ?? Number.NaN };
    const lai = tinhCay(cay);
    if (lai !== null && cungChu(lai, ketQua)) return { cay, dau: '=', vePhai: ketQua };
  }

  return null;
}

/**
 * Giá trị của mẫu ở độ chính xác ĐẦY ĐỦ — vế trái, và vế phải nếu là phương trình. Chỉ cho cửa gác:
 * nó chứng minh mẫu là CÙNG MỘT phép tính với `calc` (lệch không quá một hạt bụi dấu phẩy động), tách
 * khỏi chuyện in ra bao nhiêu chữ số lẻ.
 */
export function giaTriMauDayDu(
  hinh: ThaySoCay,
  values: Readonly<Record<string, number>>,
): { veTrai: number; vePhai?: number } | null {
  const dung = boLap(hinh, values);
  if (dung === null) return null;
  const chinh = mauChinh(hinh, values);
  const trai = dung(chinh.cay, chinh.khoa, BAC_DAY_DU);
  const veTrai = trai === null ? null : tinhCay(trai);
  if (veTrai === null) return null;
  if (hinh.vePhai === undefined) return { veTrai };
  const phai = dung(hinh.vePhai.cay, hinh.vePhai.khoa, BAC_DAY_DU);
  const vePhai = phai === null ? null : tinhCay(phai);
  return vePhai === null ? null : { veTrai, vePhai };
}

/** Bậc "không làm tròn": 20 chữ số lẻ, quá độ chính xác của một số dấu phẩy động. */
const BAC_DAY_DU = BAC_LE.length;

/** Chỉ số lớn nhất mà một ký hiệu theo chỉ số được tính tới — trên cả 12 đợt DCA và 50 dòng XIRR. */
const TRAN_CHI_SO = 64;

/**
 * Chuẩn bị bảng giá trị (ô nhập, hằng số, `@` của `calc`, ký hiệu dẫn xuất) rồi trả hàm lắp cây ở một
 * bậc chữ số lẻ. `null` khi một ký hiệu dẫn xuất không tính được.
 */
function boLap(
  hinh: ThaySoCay,
  values: Readonly<Record<string, number>>,
): ((cay: Nut, khoa: ReadonlyArray<string>, bac: number) => Nut | null) | null {
  const giaTri: Record<string, number> = {};
  for (const [key, value] of Object.entries(values)) {
    if (Number.isFinite(value)) giaTri[key] = value;
  }

  /* Tính lần lượt theo thứ tự khai — mỗi đại lượng tính xong thành đầu vào của những cái sau. */
  const danXuat = new Set<string>();
  for (const dx of hinh.danXuat) {
    /*
     * Khoá có `#` là một ký hiệu THEO CHỈ SỐ (16/10/2026): `rTl#: '{r#} ÷ 100'` cho ra `rTl1`, `rTl2`…
     * — mỗi kỳ một lợi suất dạng tỷ lệ, để số hạng của phần lặp in `1 + 0,121` như mọi tỷ lệ khác của
     * dải. Chỉ số nào thiếu ô nhập thì bỏ qua; phần lặp tự trả `null` nếu nó cần đúng chỉ số ấy.
     */
    if (dx.khoaDat.includes('#')) {
      for (let i = 1; i <= TRAN_CHI_SO; i += 1) {
        const so = dx.khoa.map((k) => giaTri[k.replace('#', String(i))]);
        if (so.some((v) => v === undefined)) continue;
        const v = tinhCay(dx.cay, so as number[]);
        if (v === null) continue;
        const khoaDat = dx.khoaDat.replace('#', String(i));
        giaTri[khoaDat] = v;
        danXuat.add(khoaDat);
      }
      continue;
    }
    const so = dx.khoa.map((k) => giaTri[k]);
    if (so.some((v) => v === undefined)) return null;
    const v = tinhCay(dx.cay, so as number[]);
    if (v === null) return null;
    giaTri[dx.khoaDat] = v;
    danXuat.add(dx.khoaDat);
  }
  const lapTheoKhoa = new Map((hinh.lap ?? []).map((lap) => [lap.khoaDat, lap]));

  const laCuaKhoa = (khoa: string, bac: number): Nut | null => {
    const v = giaTri[khoa];
    return v === undefined ? null : la(v, soLe(khoa, v, danXuat, bac));
  };

  const moRong = (lap: LapCay, bac: number): Nut | null => {
    const dem = giaTri[lap.dem];
    if (dem === undefined || !Number.isInteger(dem) || dem < lap.tu) return null;
    const soHang: Nut[] = [];
    for (let i = lap.tu; i <= dem; i += 1) {
      if (lap.boQuaKhiKhong !== undefined) {
        if (giaTri[lap.boQuaKhiKhong.replace('#', String(i))] === 0) continue;
      }
      const h = dat(boNgoac(lap.cay), (thuTu) => {
        const khoa = lap.khoa[thuTu];
        if (khoa === undefined) return null;
        if (khoa === '#') return la(i, 0);
        return laCuaKhoa(khoa.replace('#', String(i)), bac);
      });
      if (h === null) return null;
      soHang.push(h);
    }
    return noiSoHang(soHang, lap.noi);
  };

  return (cay: Nut, khoa: ReadonlyArray<string>, bac: number): Nut | null => {
    const lap = dat(boNgoac(cay), (thuTu) => {
      const k = khoa[thuTu];
      if (k === undefined) return null;
      const phanLap = lapTheoKhoa.get(k);
      return phanLap === undefined ? laCuaKhoa(k, bac) : moRong(phanLap, bac);
    });
    return lap === null ? null : themNgoac(lap, 0);
  };
}
