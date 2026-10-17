import { lamTronLen, lamTronXuong } from '../lam-tron';

/**
 * Cây công thức của dòng điền số / dòng "Áp vào công thức" — module LÁ (29/09/2026). Thứ duy nhất nó
 * nhập là `../lam-tron`, cũng là một module lá không nhập gì (16/10/2026).
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
  | { t: 'ngoac'; a: Nut }
  /**
   * `max(a; b; c)` — số lớn nhất của một danh sách (16/10/2026). Sinh ra cho dải thay số của
   * `chuoi-phien-giam-dai-nhat`, hình `L = max{k : …}`: dải liệt kê độ dài mọi chuỗi phiên giảm rồi
   * lấy lớn nhất. Ngăn bằng dấu chấm phẩy vì dấu phẩy đã là dấu thập phân.
   */
  | { t: 'max'; ds: ReadonlyArray<Nut> };

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
    case 'max':
      return Math.max(1, ...nut.ds.map(chieuCao));
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
    case 'max':
      return { t: 'max', ds: cay.ds.map((d) => datSoVaoCay(d, so)) };
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
    case 'max':
      return `max(${cay.ds.map(con).join('; ')})`;
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
      return v === null ? null : ket(lamTronXuong(v));
    }
    case 'tran': {
      const v = giaTri(cay.a);
      return v === null ? null : ket(lamTronLen(v));
    }
    case 'can': {
      const v = giaTri(cay.a);
      return v === null || v < 0 ? null : ket(Math.sqrt(v));
    }
    case 'ln': {
      const v = giaTri(cay.a);
      return v === null || v <= 0 ? null : ket(Math.log(v));
    }
    case 'max': {
      const cacSo = cay.ds.map(giaTri);
      if (cacSo.length === 0 || cacSo.some((v) => v === null)) return null;
      return ket(Math.max(...(cacSo as number[])));
    }
    default:
      return giaTri(cay.a);
  }
}

/* ── Luật ngoặc — chuyển từ `worked-line.ts` sang đây ngày 16/10/2026, để dải thay số lúc chạy
 * (`substitution-cay.ts`) cài ngoặc bằng ĐÚNG luật của bộ phân tích mà không phải nhập bộ phân tích. */

/** Độ ưu tiên của từng phép, để biết khi nào phải thêm ngoặc. */
const UU_TIEN: Readonly<Record<Nut['t'], number>> = {
  cong: 1,
  tru: 1,
  nhan: 2,
  am: 2,
  chia: 3,
  /* Chia một dòng đứng ngang hàng nhân, như trong dòng chữ: `a × b ÷ c` đọc từ trái sang phải. */
  chiaDong: 2,
  luythua: 4,
  can: 5,
  ln: 5,
  tri: 5,
  san: 5,
  tran: 5,
  so: 5,
  o: 5,
  ngoac: 5,
  max: 5,
};

/**
 * Cài dấu ngoặc tròn vào cây, để giao diện chỉ việc vẽ chứ không phải biết luật ưu tiên.
 *
 * `canToiThieu` là độ ưu tiên mà ngữ cảnh cha đòi hỏi: thấp hơn thì phải bọc ngoặc. Nhờ vậy
 * `(a + b) × c` giữ ngoặc còn `a + b × c` thì không — ngoặc chỉ xuất hiện khi nó mang nghĩa, đúng
 * như cách sách toán viết.
 *
 * `chia` KHÔNG bọc ngoặc quanh hai vế vì gạch phân số đã tách chúng rồi — đây chính là chỗ hình vẽ
 * hơn hẳn dòng chữ: `(a + b) ÷ c` viết ra phải có ngoặc, vẽ thành phân số thì không. Cùng lý do
 * với `can` và `tri`: vạch căn và hai vạch đứng tự làm việc của dấu ngoặc.
 *
 * Để ở Domain chứ không ở giao diện vì đây là luật TOÁN, không phải luật bày biện; và vì có nó thì
 * `CongThucDien.tsx` không cần giữ một bản sao bảng ưu tiên, thứ chắc chắn sẽ lệch sau vài lần sửa.
 *
 * ── Chỉ MỘT tầng gạch phân số (25/09/2026) ──────────────────────────────────────────────────
 *
 * `trongPhanSo` bật khi đã đi vào tử hoặc mẫu của một phân số (hoặc vào số mũ). Từ đó mọi phép
 * chia vẽ trên một dòng (`chiaDong`, dấu "÷") thay vì chồng thêm một gạch phân số nữa. Chủ dự án
 * nhìn câu giá vốn DCA — ba phân số `12.000.000 / giá` chồng trong mẫu của một phân số lớn — và nói
 * "quá khó nhìn … đổi thiết kế sao cho vừa dễ hiểu vừa gọn". Sách toán cũng viết đúng như vậy:
 * phân số trong phân số thì tầng trong viết ngang.
 *
 * Chia một dòng thì CẦN ngoặc, khác phân số: `(12 − 4) ÷ 100`. Nên nó theo đúng luật ưu tiên như
 * phép nhân — vế trái cần ít nhất bậc nhân, vế phải cần cao hơn bậc nhân (`a ÷ (b × c)` giữ ngoặc).
 */
export function themNgoac(nut: Nut, canToiThieu: number, trongPhanSo = false): Nut {
  const boc = (con: Nut): Nut => (UU_TIEN[nut.t] < canToiThieu ? { t: 'ngoac', a: con } : con);
  const trong = trongPhanSo;
  /*
   * Số âm đứng SAU một dấu phép tính thì luôn có ngoặc (16/10/2026). Bảng ưu tiên xếp dấu trừ đơn
   * ngang phép nhân, nên trước ngày này `a − (−b)` vẽ ra `a − −b` và `a × (−b)` ra `a × −b` — đo
   * được trên khối Ví dụ của VaR lịch sử: `(−0,018598 − −0,020701)`. Hai dấu trừ liền nhau đọc như
   * một lỗi in, và người chép tay dễ bỏ mất một dấu.
   */
  const vePhai = (con: Nut): Nut => (con.t === 'am' ? { t: 'ngoac', a: con } : con);

  switch (nut.t) {
    case 'so':
    case 'o':
      return nut;
    case 'am':
      /* `−(−0,0358)`, không phải `−−0,0358` — cùng luật với số âm đứng sau một dấu phép tính. */
      return boc({ t: 'am', a: vePhai(themNgoac(nut.a, UU_TIEN.am, trong)) });
    case 'cong':
      return boc({
        t: 'cong',
        a: themNgoac(nut.a, UU_TIEN.cong, trong),
        b: vePhai(themNgoac(nut.b, UU_TIEN.cong, trong)),
      });
    case 'tru':
      /* Vế phải cần độ ưu tiên CAO hơn: `a − (b − c)` khác hẳn `a − b − c`. */
      return boc({
        t: 'tru',
        a: themNgoac(nut.a, UU_TIEN.tru, trong),
        b: vePhai(themNgoac(nut.b, UU_TIEN.tru + 1, trong)),
      });
    case 'nhan':
      return boc({
        t: 'nhan',
        a: themNgoac(nut.a, UU_TIEN.nhan, trong),
        b: vePhai(themNgoac(nut.b, UU_TIEN.nhan, trong)),
      });
    case 'chia':
    case 'chiaDong': {
      if (!trong) {
        return { t: 'chia', a: themNgoac(nut.a, 0, true), b: themNgoac(nut.b, 0, true) };
      }
      const dong: Nut = {
        t: 'chiaDong',
        a: themNgoac(nut.a, UU_TIEN.chiaDong, true),
        b: themNgoac(nut.b, UU_TIEN.chiaDong + 1, true),
      };
      return UU_TIEN.chiaDong < canToiThieu ? { t: 'ngoac', a: dong } : dong;
    }
    case 'luythua':
      /* Số mũ viết nhỏ trên cao — phân số trong đó cũng viết một dòng: `^(1 ÷ 3)`. */
      return boc({
        t: 'luythua',
        a: themNgoac(nut.a, UU_TIEN.luythua + 1, trong),
        b: themNgoac(nut.b, 0, true),
      });
    case 'can':
      return { t: 'can', a: themNgoac(nut.a, 0, trong) };
    case 'tri':
    case 'san':
    case 'tran':
      return { t: nut.t, a: themNgoac(nut.a, 0, trong) };
    case 'ln':
      return { t: 'ln', a: themNgoac(nut.a, 0, trong) };
    case 'ngoac':
      return { t: 'ngoac', a: themNgoac(nut.a, 0, trong) };
    case 'max':
      /* Như `ln(…)`: cặp ngoặc của hàm đã gom từng đối số, không cần thêm. */
      return { t: 'max', ds: nut.ds.map((d) => themNgoac(d, 0, trong)) };
  }
}
