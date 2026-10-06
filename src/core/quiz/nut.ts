/**
 * Cây công thức của dòng điền số / dòng "Áp vào công thức" — module LÁ, không import gì (29/09/2026).
 *
 * Tách khỏi `worked-line.ts` để bộ VẼ (`CongThucDien.tsx`) dùng được mà không kéo theo bộ phân tích
 * cú pháp: khối Ví dụ thực tế nằm trong First Load JS của cả 111 trang chi tiết và vẽ cây dựng sẵn
 * lúc build, còn bộ phân tích chỉ khối Bài tập (gói tải muộn) cần. `worked-line.ts` xuất lại cả hai
 * thứ ở đây, nên mọi chỗ đang nhập từ đó không phải đổi.
 */

/**
 * Một nút của cây công thức.
 *
 * Xuất ra ngoài vì tầng giao diện phải tự đi hết cây để vẽ: ô nhập nằm TRONG tử số của phân số,
 * nên không thể giao cho Domain sinh sẵn một chuỗi HTML rồi nhét vào. CON-02 vẫn nguyên vẹn —
 * đây là dữ liệu thuần, `src/core` không biết gì về React.
 */
export type Nut =
  | { t: 'so'; raw: string }
  /** Ô trống: `thuTu` là chỗ của nó trong mảng người dùng gõ, `dap` là đáp án đúng. */
  | { t: 'o'; thuTu: number; dap: string }
  | { t: 'cong' | 'tru' | 'nhan' | 'chia' | 'luythua'; a: Nut; b: Nut }
  /**
   * Phép chia vẽ trên MỘT dòng, bằng dấu "÷" — chỉ `themNgoac` sinh ra, cho phép chia nằm bên
   * trong tử hoặc mẫu của một phân số khác. Bộ phân tích không bao giờ tạo nút này.
   */
  | { t: 'chiaDong'; a: Nut; b: Nut }
  /**
   * `san` = ⌊…⌋ làm tròn xuống, `tran` = ⌈…⌉ làm tròn lên (29/09/2026) — cho các công thức mà hình
   * của trang có bước làm tròn: số hợp đồng tối đa, số kỳ DCA. Thiếu chúng thì dòng "Áp vào công
   * thức" của khối Ví dụ ra 6,09 trong khi kết quả là 6.
   */
  | { t: 'can' | 'ln' | 'am' | 'tri' | 'san' | 'tran'; a: Nut }
  /** Dấu ngoặc tròn, do `themNgoac` cài sẵn trước khi trao cho giao diện. */
  | { t: 'ngoac'; a: Nut };

/**
 * Chiều cao của một nhánh, tính theo số tầng phân số.
 *
 * Giao diện dùng con số này để kéo dãn dấu ngoặc và dấu căn cho vừa thứ chúng bọc: CSS không tự
 * biết một `<span>` cao bao nhiêu dòng, mà đo lúc chạy thì lượt dựng đầu tiên trên trình duyệt sẽ
 * khác HTML tĩnh — đúng lớp lỗi hydration mà cả thư mục `src/ui/quiz/` phải tránh. Đếm trên cây là
 * hàm thuần nên máy chủ và trình duyệt luôn ra cùng một con số.
 */
export function chieuCao(nut: Nut): number {
  switch (nut.t) {
    case 'so':
    case 'o':
      return 1;
    case 'chia':
      return chieuCao(nut.a) + chieuCao(nut.b);
    case 'chiaDong':
      return Math.max(chieuCao(nut.a), chieuCao(nut.b));
    case 'am':
    case 'tri':
    case 'san':
    case 'tran':
    case 'can':
    case 'ln':
    case 'ngoac':
      return chieuCao(nut.a);
    case 'luythua':
      return chieuCao(nut.a);
    default:
      return Math.max(chieuCao(nut.a), chieuCao(nut.b));
  }
}

/*
 * ── Dòng "thay số" của màn tính: cây dựng LÚC BUILD, số đặt vào LÚC CHẠY (05/10/2026) ─────────
 *
 * Hai hàm dưới đây tồn tại để bộ phân tích cú pháp (`worked-line.ts`, 24 kB) KHÔNG phải có mặt
 * trong gói của 111 trang chi tiết.
 *
 * Lý do làm được: hình dạng cây của một mẫu `spec.substitution` chỉ phụ thuộc các phép toán trong
 * mẫu, không phụ thuộc con số. Người dùng gõ lại ô nhập thì mọi phép toán giữ nguyên, chỉ lá đổi.
 * Nên `page.tsx` phân tích mẫu MỘT LẦN lúc build (chỗ ấy được phép nhập bộ phân tích), chừa mỗi
 * `{khoá}` thành một ô trống, rồi trình duyệt chỉ việc đi cây đặt số vào.
 *
 * Khác dòng "Áp vào công thức" của khối Ví dụ ở đúng một điểm, và điểm ấy là cả lý do: dòng kia có
 * số CỐ ĐỊNH nên cây dựng sẵn lúc build là xong, còn dòng này đổi theo từng phím gõ.
 */

/**
 * Đọc một số viết theo quy ước Việt Nam: "." ngăn nghìn, "," ngăn thập phân.
 *
 * Bản rút gọn của `docSo()` trong `worked-line.ts` — cố ý CHÉP chứ không nhập, vì nhập là kéo cả
 * bộ phân tích vào module lá này. Chỉ đọc chữ số thuần, đúng thứ mẫu `substitution` chứa ("100",
 * "12", "22,5", "1.000"); không có dấu âm, không có khoảng trắng, nên không cần phần còn lại.
 */
function docSoViet(raw: string): number {
  return Number(raw.replace(/\./g, '').replace(',', '.'));
}

/**
 * Đặt số thật vào các ô trống của một cây dựng sẵn — ô thứ `i` nhận `so[i]`.
 *
 * Chuỗi chứ số: lá `so` giữ nguyên văn chuỗi đã định dạng (`formatNumber`), nên con số trong hình
 * và con số ở khối Kết quả luôn cùng một quy ước. Thiếu giá trị thì giữ `dap` — chuỗi dựng lúc
 * build — thay vì in chỗ trống ra màn.
 */
export function datSoVaoCay(cay: Nut, so: ReadonlyArray<string>): Nut {
  switch (cay.t) {
    case 'so':
      return cay;
    case 'o':
      return { t: 'so', raw: so[cay.thuTu] ?? cay.dap };
    case 'cong':
    case 'tru':
    case 'nhan':
    case 'chia':
    case 'chiaDong':
    case 'luythua':
      return { t: cay.t, a: datSoVaoCay(cay.a, so), b: datSoVaoCay(cay.b, so) };
    default:
      return { t: cay.t, a: datSoVaoCay(cay.a, so) };
  }
}

/**
 * Viết một cây ra thành MỘT DÒNG chữ — dùng cho `aria-label`, không dùng để bày ra màn.
 *
 * Hình vẽ là các `<span>` xếp tầng, nên trình đọc màn hình đọc nó thành một dãy số rời: mất phép
 * chia, mất dấu căn, mất số mũ. Nhãn này là thứ người dùng bàn phím nghe được.
 *
 * ## Vì sao PHẢI tự thêm ngoặc, dù `themNgoac` đã chạy
 *
 * `themNgoac` chỉ cài nút `ngoac` ở những chỗ HÌNH VẼ cần. Ba chỗ nó cố ý không cài, vì hình gom
 * bằng hình học chứ không bằng dấu:
 *
 *   · phân số — gạch ngang đã tách tử khỏi mẫu;
 *   · dấu căn — vạch trên đã trùm hết thứ nằm dưới;
 *   · số mũ — chữ nhỏ nâng lên đã tách khỏi cơ số.
 *
 * Viết ra chữ thì cả ba chỗ ấy mất phương tiện gom, và dòng đọc ra thành một phép tính KHÁC. Đo
 * thật trên `tra-gop-nien-kim` ngày 05/10/2026: thiếu luật này, nhãn đọc ra
 * `… ÷ (1 + 0,00791667)^240 − 1`, tức mẫu số chỉ còn `(1+i)^240` rồi mới trừ 1 — sai hẳn con số.
 * Trên `gui-quay-vong` thì `^(12 ÷ 3)` thành `^12 ÷ 3`.
 *
 * Nên hàm này tự bọc theo đúng luật ưu tiên của VĂN BẢN, độc lập với luật của hình.
 */
export function chuCuaCay(cay: Nut): string {
  /** Bọc ngoặc nếu nút con là một phép cộng/trừ/nhân/chia trần — nút đã có `ngoac` thì thôi. */
  const boc = (n: Nut, loai: ReadonlyArray<Nut['t']>): string =>
    loai.includes(n.t) ? `(${chuCuaCay(n)})` : chuCuaCay(n);

  /** Thứ KHÔNG phải một khối liền: viết sau `^` hay dưới `√` đều phải bọc. */
  const ROI = ['cong', 'tru', 'nhan', 'chia', 'chiaDong', 'luythua', 'am'] as const;

  const con = (n: Nut): string => chuCuaCay(n);
  switch (cay.t) {
    case 'so':
      return cay.raw;
    case 'o':
      return cay.dap;
    case 'cong':
      return `${con(cay.a)} + ${con(cay.b)}`;
    case 'tru':
      /* `a − (b − c)` khác `a − b − c`, nên vế phải phải bọc. */
      return `${con(cay.a)} − ${boc(cay.b, ['cong', 'tru'])}`;
    case 'nhan':
      return `${boc(cay.a, ['cong', 'tru'])} × ${boc(cay.b, ['cong', 'tru'])}`;
    case 'chia':
    case 'chiaDong':
      /* Mẫu số mất gạch ngang thì phải bọc cả phép nhân chia, không chỉ cộng trừ. */
      return `${boc(cay.a, ['cong', 'tru'])} ÷ ${boc(cay.b, ['cong', 'tru', 'nhan', 'chia', 'chiaDong'])}`;
    case 'luythua':
      return `${boc(cay.a, ROI)}^${boc(cay.b, ROI)}`;
    case 'ngoac':
      return `(${con(cay.a)})`;
    case 'can':
      return `√${boc(cay.a, ROI)}`;
    case 'ln':
      return `ln(${con(cay.a)})`;
    case 'am':
      return `−${boc(cay.a, ['cong', 'tru'])}`;
    case 'tri':
      return `|${con(cay.a)}|`;
    case 'san':
      return `⌊${con(cay.a)}⌋`;
    default:
      return `⌈${con(cay.a)}⌉`;
  }
}

/**
 * Tính giá trị của một cây, ô trống thứ `i` lấy `so[i]`.
 *
 * Dùng cho các ĐẠI LƯỢNG DẪN XUẤT (`spec.substitutionDerived`): hình công thức viết `i` và `n`,
 * còn ô nhập trên màn là "Lãi suất / năm" và "Kỳ hạn", nên phải tính `i = r ÷ 100 ÷ 12` lúc chạy
 * mới có con số đặt vào hình.
 *
 * Trả `null` chứ không trả `NaN` hay `Infinity` ở mọi nhánh hỏng — chia cho 0, `ln` của số không
 * dương, căn của số âm. Đây là module Domain nên nó theo đúng FR-06: không bao giờ để một giá trị
 * vô nghĩa đi tiếp, vì đi tiếp nghĩa là nó sẽ được in ra màn.
 */
export function tinhCay(cay: Nut, so: ReadonlyArray<number> = []): number | null {
  const giaTri = (n: Nut): number | null => tinhCay(n, so);
  const hai = (a: Nut, b: Nut): [number, number] | null => {
    const x = giaTri(a);
    const y = giaTri(b);
    return x === null || y === null ? null : [x, y];
  };
  const ket = (v: number): number | null => (Number.isFinite(v) ? v : null);

  switch (cay.t) {
    case 'so':
      return ket(docSoViet(cay.raw));
    case 'o': {
      const v = so[cay.thuTu];
      return v === undefined ? null : ket(v);
    }
    case 'cong': {
      const p = hai(cay.a, cay.b);
      return p === null ? null : ket(p[0] + p[1]);
    }
    case 'tru': {
      const p = hai(cay.a, cay.b);
      return p === null ? null : ket(p[0] - p[1]);
    }
    case 'nhan': {
      const p = hai(cay.a, cay.b);
      return p === null ? null : ket(p[0] * p[1]);
    }
    case 'chia':
    case 'chiaDong': {
      const p = hai(cay.a, cay.b);
      return p === null || p[1] === 0 ? null : ket(p[0] / p[1]);
    }
    case 'luythua': {
      const p = hai(cay.a, cay.b);
      return p === null ? null : ket(p[0] ** p[1]);
    }
    case 'am': {
      const v = giaTri(cay.a);
      return v === null ? null : ket(-v);
    }
    case 'tri': {
      const v = giaTri(cay.a);
      return v === null ? null : ket(Math.abs(v));
    }
    case 'san': {
      const v = giaTri(cay.a);
      return v === null ? null : ket(Math.floor(v));
    }
    case 'tran': {
      const v = giaTri(cay.a);
      return v === null ? null : ket(Math.ceil(v));
    }
    case 'can': {
      const v = giaTri(cay.a);
      return v === null || v < 0 ? null : ket(Math.sqrt(v));
    }
    case 'ln': {
      const v = giaTri(cay.a);
      return v === null || v <= 0 ? null : ket(Math.log(v));
    }
    default:
      return giaTri(cay.a);
  }
}
