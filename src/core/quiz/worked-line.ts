/**
 * Dòng công thức của câu ĐIỀN SỐ — luật cấu trúc, bộ tính lại, và cây cú pháp để giao diện vẽ.
 *
 * ## Bài tập là ĐẶT SỐ LIỆU VÀO ĐÚNG CHỖ, không phải bấm ra đáp số
 *
 * Chủ dự án 24/09/2026, sau ba vòng sửa hình: "đoạn mô tả ví dụ sẽ có những thông số nào sẽ được
 * áp dụng trong công thức thì để trống trong công thức ra để người dùng điền vào ấy. điền đúng chỗ
 * số liệu vào công thức thì kiểm tra xem đúng chưa chứ không phải hỏi xem kết quả là như nào."
 *
 * Nên chỗ trống nằm ở **các số liệu đầu vào**, và chấm là chấm VỊ TRÍ:
 *
 *     Beta điều chỉnh = [0,67] × [1,50] + [0,33] × 1
 *
 * hiện lên màn thành `Beta điều chỉnh = ▢ × ▢ + ▢ × 1`, người học lấy số từ bảng "Số liệu" của đề
 * bài đặt vào từng ô. Bản cũ làm ngược — in sẵn cả phép tính rồi bỏ trống ĐÁP SỐ — nên nó kiểm kỹ
 * năng bấm máy tính, thứ không phải việc của một thư viện công thức. Cái người học cần biết là
 * con số nào đi vào chỗ nào; bảng "Số liệu" cố ý có cả số gây nhiễu (lợi suất và độ lệch chuẩn của
 * CẢ HAI tài sản, chẳng hạn) nên đặt đúng chỗ là một phép kiểm thật.
 *
 * ## Một chuỗi, ba việc
 *
 * `worked.vi` là nguồn sự thật DUY NHẤT. Cùng một chuỗi ấy:
 *
 * 1. **vẽ ra màn** — ô trống mọc đúng chỗ dấu ngoặc vuông,
 * 2. **chấm từng ô** — đáp án của mỗi ô nằm ngay trong ngoặc vuông của chính nó,
 * 3. **bị `quiz.test.ts` tính lại** — bóc ngoặc ra là còn một phép tính đủ số, phải ra đúng
 *    `expected` trong khoảng sai số của câu.
 *
 * Không có trường `latex` hay trường `answers` song song, và đó là quyết định có chủ đích: hai
 * trường song song thì đến lúc nào đó hình vẽ, đáp án được chấm và con số được kiểm sẽ lệch nhau,
 * mà lệch kiểu ấy thì không cửa gác nào thấy được.
 *
 * ## Vì sao vẫn phải tính lại bằng máy
 *
 * Dòng này in ra các con số của phép tính, nên nó là một lời hứa: đặt đúng số vào đúng ô thì ra
 * đúng đáp số. Người soạn thay nhầm một chữ số thì ô ấy chấm sai vị trí đúng — và người học sẽ tin
 * là mình sai chứ không tin dòng công thức sai. Không cửa gác nào khác thấy được: `expected` vẫn
 * đúng, lời giải vẫn trôi chảy, chỉ dòng công thức là lệch. Cùng lý do với `QuizVerify` của câu
 * tính toán trắc nghiệm.
 *
 * ## Vì sao KHÔNG còn MathML, và cũng không phải KaTeX
 *
 * Trước đây dòng này sinh thẳng MathML. Không dùng được nữa: ô nhập phải nằm TRONG tử số của phân
 * số, mà MathML không cho nhúng `<input>` vào bất kỳ đâu trong cây của nó. Nên file này dừng ở cây
 * cú pháp, còn việc vẽ giao cho `CongThucDien.tsx` dựng bằng React + CSS (`font-family: math` giữ
 * đúng phông toán). KaTeX thì vẫn nằm ngoài tầm với như cũ — nó chỉ chạy lúc build (~280 kB, đưa
 * vào gói trình duyệt là vượt cửa dung lượng ngay).
 *
 * ## ĐỪNG rút gọn đại số — dòng phải giữ hình dạng của công thức
 *
 * Bộ tính ở dưới chỉ hỏi "ra đúng số chưa", nên một dòng rút gọn vẫn xanh trọn mà vẫn dạy sai.
 * Q231 (độ rộng dải Bollinger) từng viết `BandWidth = 2 × 2 × 800 ÷ 26.000 × 100`: đúng số, vì
 * `(Dải trên − Dải dưới)` rút lại thành `2kσ`. Nhưng dòng ấy hỏng ba đường cùng lúc — nó không
 * còn hình dạng công thức mà màn hình đang vẽ ở ngay phía trên, nó không đi theo các bước mà
 * `explain` mô tả (dựng dải trên, dựng dải dưới, lấy hiệu, chia đường giữa), và số `2` đứng đầu
 * KHÔNG ứng với ô nào trong bảng số liệu, nên người học nhìn hai số 2 cạnh nhau mà không biết số
 * nào là hệ số k. Bản sửa `((26.000 + 2 × 800) − (26.000 − 2 × 800)) ÷ 26.000 × 100` dài hơn
 * nhưng mọi con số đều trỏ về được một ô trong đề bài.
 *
 * Quy tắc: **mỗi con số trong dòng phải là một ô của `facts`, một hằng nêu trong `prompt`, hoặc
 * một hệ số đổi đơn vị thấy được** (`× 1.000.000.000` khi đổi tỷ đồng sang đồng). Cái này KHÔNG
 * gate được bằng máy mà không dựng một danh sách miễn trừ dài hơn chính luật, nên nó là việc của
 * người soạn và người rà.
 *
 * ## Chọn ô nào để bỏ trống
 *
 * Hai luật, cả hai đều vì người đọc chứ không vì máy:
 *
 * - **Bỏ trống SỐ LIỆU, giữ nguyên hằng số cấu trúc.** `× 100` đổi ra phần trăm, `(n − 1)` của
 *   phương sai mẫu, `22,5` của số Graham, `√252`, hệ số đổi đơn vị — những thứ ấy thuộc về công
 *   thức chứ không thuộc về đề bài, bỏ trống chúng là hỏi một câu khác.
 * - **Một đại lượng xuất hiện mấy lần thì bỏ trống HẾT, hoặc không bỏ trống lần nào.** Bỏ trống
 *   một trong hai chỗ của cùng một con số làm người học tưởng hai chỗ ấy là hai đại lượng khác
 *   nhau.
 *
 * Không có ca kiểm nào gác được hai luật này — chúng là việc của người soạn.
 *
 * ## Không còn dòng gợi ý "bằng lời"
 *
 * Bản cũ chừa ba câu viết gợi ý bằng lời (`DONG_GOI_Y_BANG_LOI`) vì thay số vào là xoá mất chính
 * bước đang kiểm — chọn quan sát xếp hạng thứ mấy (Q248), làm tròn tỷ lệ free-float lên bậc 5%
 * (Q329), chọn cặp đỉnh–đáy cuốn chiếu (Q244). Hình mới nuốt gọn cả ba: bước ấy giờ CHÍNH LÀ ô
 * trống, nên chúng thành câu hỏi đặt-số-vào-chỗ như mọi câu khác. Danh sách ghim bị bỏ, và luật
 * cấu trúc siết lại thành "mọi dòng đều phải vẽ được" — chặt hơn bản cũ.
 */

/** Khoảng trắng mọi loại, gồm cả khoảng hẹp và khoảng không ngắt dòng. */
const TRANG = /[\s   ]+/g;

/** Mở và đóng một ô trống. Đáp án của ô nằm ngay giữa hai dấu này. */
export const O_MO = '[';
export const O_DONG = ']';

/** Một con số viết theo quy ước Việt, có thể mang dấu âm: `−1.234,56`. */
const SO_VIET = /^[-−]?[0-9][0-9.]*(?:,[0-9]+)?$/;

/**
 * Lỗi cấu trúc của một dòng công thức — mảng rỗng là đạt.
 *
 * Ba điều kiện, và điều kiện thứ ba là cái mới: dòng phải VẼ ĐƯỢC. Bản cũ cho phép dòng viết bằng
 * lời rồi ghim danh sách ngoại lệ; hình mới không cần ngoại lệ nào nữa (xem docblock trên), nên
 * một dòng không phân tích được giờ là lỗi chứ không phải một nhánh khác.
 */
export function workedProblems(line: string): string[] {
  const loi: string[] = [];

  const mo = line.split(O_MO).length - 1;
  const dong = line.split(O_DONG).length - 1;
  if (mo !== dong) loi.push(`ngoặc vuông lệch: ${mo} dấu mở, ${dong} dấu đóng`);
  if (mo === 0) loi.push('không có ô trống nào');

  const viTri = line.indexOf('=');
  if (viTri === -1) loi.push('thiếu dấu =');
  else if (line.indexOf('=', viTri + 1) !== -1) loi.push('có nhiều hơn một dấu =');
  else if (line.slice(0, viTri).trim() === '') loi.push('thiếu tên đại lượng trước dấu =');

  /* Ngoặc vuông phải bọc đúng một con số: đáp án của ô chính là chữ nằm trong ngoặc. */
  for (const dap of quetOTrong(line)) {
    if (!SO_VIET.test(dap.trim())) loi.push(`ô trống '${dap}' không phải một con số`);
  }

  if (loi.length === 0 && parseWorked(bieuThucCua(line) ?? '') === null) {
    loi.push('không phân tích được thành phép tính');
  }
  return loi;
}

/** Quét phần chữ nằm trong từng cặp ngoặc vuông, theo đúng thứ tự xuất hiện. */
function quetOTrong(line: string): string[] {
  const ra: string[] = [];
  let i = 0;
  for (;;) {
    const mo = line.indexOf(O_MO, i);
    if (mo === -1) return ra;
    const dong = line.indexOf(O_DONG, mo + 1);
    if (dong === -1) return ra;
    ra.push(line.slice(mo + 1, dong));
    i = dong + 1;
  }
}

/** Đáp án của từng ô trống, theo thứ tự trái sang phải. */
export function blanksOf(line: string): ReadonlyArray<string> {
  return quetOTrong(line).map((dap) => dap.trim());
}

/** Tên đại lượng đứng trước dấu `=`, ví dụ `Beta điều chỉnh`. */
export function labelOf(line: string): string | null {
  const viTri = line.indexOf('=');
  return viTri === -1 ? null : line.slice(0, viTri).trim();
}

/** Vế phải dấu `=`, giữ nguyên ngoặc vuông. */
function bieuThucCua(line: string): string | null {
  const viTri = line.indexOf('=');
  if (viTri === -1) return null;
  const con = line.slice(viTri + 1).trim();
  return con === '' ? null : con;
}

/**
 * Đoạn số học của dòng, đã BÓC ngoặc vuông — thứ `quiz.test.ts` tính lại.
 *
 * Bóc ngoặc xong thì dòng lại là một phép tính đủ số, nên phép kiểm "tính lại ra đúng `expected`"
 * vẫn chạy y như trước khi có ô trống. Đó chính là chỗ ba việc gặp nhau ở một chuỗi.
 */
export function arithmeticOf(line: string): string | null {
  const con = bieuThucCua(line);
  return con === null ? null : con.split(O_MO).join('').split(O_DONG).join('');
}

/* ── Cây cú pháp ──────────────────────────────────────────────────────────────────────────── */

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
  | { t: 'can' | 'ln' | 'am' | 'tri'; a: Nut }
  /** Dấu ngoặc tròn, do `themNgoac` cài sẵn trước khi trao cho giao diện. */
  | { t: 'ngoac'; a: Nut };

/** Đọc một con số viết theo quy ước Việt: `1.234,56` → 1234.56, `−21` → -21. */
function docSo(raw: string): number {
  const am = raw.startsWith('-') || raw.startsWith('−');
  const than = am ? raw.slice(1) : raw;
  const v = Number(than.replace(/\./g, '').replace(',', '.'));
  return am ? -v : v;
}

/**
 * Phân tích một đoạn số học viết bằng ký hiệu của màn hình thành cây cú pháp.
 *
 * Trả `null` khi gặp bất kỳ thứ gì không phải số học thuần — chữ, ký hiệu lạ, ngoặc lệch. `null`
 * nghĩa là "không đọc được", KHÔNG phải "sai": ca kiểm phân biệt hai chuyện đó.
 *
 * Chấp nhận: `+`, `−` (cả dấu trừ thật lẫn gạch nối), `×`, `÷`, `^`, ngoặc tròn, `√`, `ln(...)`,
 * `|...|` (trị tuyệt đối), ô trống `[...]`, và số viết theo quy ước Việt. Không chấp nhận `%`: một
 * dòng công thức phải viết ra tỷ lệ đã quy đổi chứ không bắt người đọc tự hiểu `%` nhân hay chia
 * 100.
 */
export function parseWorked(expr: string): Nut | null {
  const s = expr.replace(TRANG, '');
  let i = 0;
  let soO = 0;

  const xem = (): string | undefined => s[i];

  /** expr := term (('+' | '−') term)* */
  function doc(): Nut | null {
    let trai = docTerm();
    if (trai === null) return null;
    for (;;) {
      const c = xem();
      if (c === '+' || c === '-' || c === '−') {
        i += 1;
        const phai = docTerm();
        if (phai === null) return null;
        trai = { t: c === '+' ? 'cong' : 'tru', a: trai, b: phai };
      } else return trai;
    }
  }

  /** term := luyThua (('×' | '÷') luyThua)* */
  function docTerm(): Nut | null {
    let trai = docLuyThua();
    if (trai === null) return null;
    for (;;) {
      const c = xem();
      if (c === '×' || c === '*') {
        i += 1;
        const phai = docLuyThua();
        if (phai === null) return null;
        trai = { t: 'nhan', a: trai, b: phai };
      } else if (c === '÷' || c === '/') {
        i += 1;
        const phai = docLuyThua();
        if (phai === null) return null;
        trai = { t: 'chia', a: trai, b: phai };
      } else return trai;
    }
  }

  /** luyThua := donVi ('^' luyThua)? — kết hợp phải, như quy ước toán học. */
  function docLuyThua(): Nut | null {
    const co = docDonVi();
    if (co === null) return null;
    if (xem() === '^') {
      i += 1;
      const mu = docLuyThua();
      if (mu === null) return null;
      return { t: 'luythua', a: co, b: mu };
    }
    return co;
  }

  /** donVi := '−'? (số | ô trống | '(' expr ')' | '|' expr '|' | '√' luyThua | 'ln(' expr ')') */
  function docDonVi(): Nut | null {
    const c = xem();
    if (c === undefined) return null;

    if (c === '-' || c === '−') {
      i += 1;
      const v = docDonVi();
      return v === null ? null : { t: 'am', a: v };
    }
    if (c === '+') {
      i += 1;
      return docDonVi();
    }
    if (c === '[') {
      const dong = s.indexOf(O_DONG, i + 1);
      if (dong === -1) return null;
      const dap = s.slice(i + 1, dong);
      if (!SO_VIET.test(dap)) return null;
      i = dong + 1;
      soO += 1;
      return { t: 'o', thuTu: soO - 1, dap };
    }
    if (c === '(') {
      i += 1;
      const v = doc();
      if (v === null || xem() !== ')') return null;
      i += 1;
      return v;
    }
    if (c === '|') {
      i += 1;
      const v = doc();
      if (v === null || xem() !== '|') return null;
      i += 1;
      return { t: 'tri', a: v };
    }
    if (c === '√') {
      i += 1;
      const v = docLuyThua();
      return v === null ? null : { t: 'can', a: v };
    }
    if (s.startsWith('ln(', i)) {
      i += 2;
      const v = docDonVi();
      return v === null ? null : { t: 'ln', a: v };
    }
    const khop = /^[0-9][0-9.]*(?:,[0-9]+)?/.exec(s.slice(i));
    if (khop === null) return null;
    i += khop[0].length;
    return Number.isFinite(docSo(khop[0])) ? { t: 'so', raw: khop[0] } : null;
  }

  const cay = doc();
  return cay !== null && i === s.length ? cay : null;
}

/** Tính giá trị của một cây. `null` khi gặp phép toán vô nghĩa — chia 0, căn số âm, ln số ≤ 0. */
function tinh(nut: Nut): number | null {
  switch (nut.t) {
    case 'so':
      return docSo(nut.raw);
    case 'o':
      return docSo(nut.dap);
    case 'am': {
      const v = tinh(nut.a);
      return v === null ? null : -v;
    }
    case 'ngoac':
      return tinh(nut.a);
    case 'tri': {
      const v = tinh(nut.a);
      return v === null ? null : Math.abs(v);
    }
    case 'can': {
      const v = tinh(nut.a);
      return v === null || v < 0 ? null : Math.sqrt(v);
    }
    case 'ln': {
      const v = tinh(nut.a);
      return v === null || v <= 0 ? null : Math.log(v);
    }
    default: {
      const a = tinh(nut.a);
      const b = tinh(nut.b);
      if (a === null || b === null) return null;
      if (nut.t === 'cong') return a + b;
      if (nut.t === 'tru') return a - b;
      if (nut.t === 'nhan') return a * b;
      if (nut.t === 'luythua') return a ** b;
      return b === 0 ? null : a / b;
    }
  }
}

/**
 * Tính lại một đoạn số học. Trả `null` khi không đọc được hoặc kết quả không hữu hạn.
 *
 * FR-06 áp cả ở đây: chia cho 0 trả `null` chứ không trả `Infinity`.
 */
export function evaluateWorked(expr: string): number | null {
  const cay = parseWorked(expr);
  if (cay === null) return null;
  const v = tinh(cay);
  return v !== null && Number.isFinite(v) ? v : null;
}

/* ── Hình dạng dòng, cho tầng giao diện ───────────────────────────────────────────────────── */

/** Độ ưu tiên của từng phép, để biết khi nào phải thêm ngoặc. */
const UU_TIEN: Readonly<Record<Nut['t'], number>> = {
  cong: 1,
  tru: 1,
  nhan: 2,
  am: 2,
  chia: 3,
  luythua: 4,
  can: 5,
  ln: 5,
  tri: 5,
  so: 5,
  o: 5,
  ngoac: 5,
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
 */
function themNgoac(nut: Nut, canToiThieu: number): Nut {
  const boc = (con: Nut): Nut => (UU_TIEN[nut.t] < canToiThieu ? { t: 'ngoac', a: con } : con);

  switch (nut.t) {
    case 'so':
    case 'o':
      return nut;
    case 'am':
      return boc({ t: 'am', a: themNgoac(nut.a, UU_TIEN.am) });
    case 'cong':
      return boc({
        t: 'cong',
        a: themNgoac(nut.a, UU_TIEN.cong),
        b: themNgoac(nut.b, UU_TIEN.cong),
      });
    case 'tru':
      /* Vế phải cần độ ưu tiên CAO hơn: `a − (b − c)` khác hẳn `a − b − c`. */
      return boc({
        t: 'tru',
        a: themNgoac(nut.a, UU_TIEN.tru),
        b: themNgoac(nut.b, UU_TIEN.tru + 1),
      });
    case 'nhan':
      return boc({
        t: 'nhan',
        a: themNgoac(nut.a, UU_TIEN.nhan),
        b: themNgoac(nut.b, UU_TIEN.nhan),
      });
    case 'chia':
      return { t: 'chia', a: themNgoac(nut.a, 0), b: themNgoac(nut.b, 0) };
    case 'luythua':
      return boc({
        t: 'luythua',
        a: themNgoac(nut.a, UU_TIEN.luythua + 1),
        b: themNgoac(nut.b, 0),
      });
    case 'can':
      return { t: 'can', a: themNgoac(nut.a, 0) };
    case 'tri':
      return { t: 'tri', a: themNgoac(nut.a, 0) };
    case 'ln':
      return { t: 'ln', a: themNgoac(nut.a, 0) };
    case 'ngoac':
      return { t: 'ngoac', a: themNgoac(nut.a, 0) };
  }
}

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
    case 'am':
    case 'tri':
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

/** Dòng công thức đã sẵn sàng để vẽ. */
export interface WorkedShape {
  /** Tên đại lượng, in bên trái dấu `=`. */
  ten: string;
  /** Cây của vế phải. */
  cay: Nut;
  /** Đáp án đúng của từng ô trống, theo thứ tự trái sang phải. */
  dapAn: ReadonlyArray<string>;
}

/**
 * Cắt dòng công thức thành thứ giao diện vẽ được, hoặc `null` nếu dòng hỏng.
 *
 * `null` chỉ còn là lưới an toàn: `workedProblems` đã chặn mọi dòng không vẽ được từ lúc chạy ca
 * kiểm, nên giao diện không bao giờ thật sự rơi vào nhánh ấy.
 */
export function workedShape(line: string): WorkedShape | null {
  const ten = labelOf(line);
  const con = bieuThucCua(line);
  if (ten === null || ten === '' || con === null) return null;

  const cay = parseWorked(con);
  if (cay === null) return null;

  return { ten, cay: themNgoac(cay, 0), dapAn: blanksOf(line) };
}

/**
 * Số người học gõ vào một ô có khớp đáp án của ô ấy không.
 *
 * So bằng GIÁ TRỊ chứ không bằng chữ: đáp án viết `1,50` thì gõ `1,5` phải được tính đúng, và
 * `parseViNumber` ở tầng trên đọc được cả `1.5` lẫn `1,5`. Đây là phép so số liệu chép từ bảng đề
 * bài nên không có dung sai — `tolerance` của câu chỉ còn dùng cho cửa gác tính lại dòng.
 */
export function blankAccepts(dap: string, value: number): boolean {
  if (!Number.isFinite(value)) return false;
  const dung = docSo(dap);
  if (!Number.isFinite(dung)) return false;
  /* Nới đúng một hạt bụi dấu phẩy động: 0,1 + 0,2 kiểu nào cũng phải khớp 0,3. */
  return Math.abs(value - dung) <= Math.max(Math.abs(dung), 1) * 1e-9;
}
