/**
 * Tầng DOMAIN — luật của một DÒNG CÔNG THỨC VIẾT BẰNG CHỮ.
 *
 * Hai nơi hiện loại dòng này: `FormulaSpec.expression` ngay dưới hình công thức, và dòng chữ của
 * từng bước trong khung "cách tính" (`src/core/how-to/`). Cả hai là một hình KaTeX đọc thành lời,
 * nên chịu cùng một bộ luật — và bộ luật ấy sống ở đây, không chép vào hai file test.
 *
 * Mỗi luật đều sinh ra từ một lỗi thật, ghi ở ca kiểm tương ứng trong `formulas.test.ts`:
 *
 * 1. Không sót ký hiệu LaTeX (`\`, `{`, `}`): bốn công thức từng hiện LaTeX thô ra màn.
 * 2. Có dấu bằng: dòng chữ là một công thức, không phải một mẩu biểu thức rời.
 * 3. Không gạch ngang (`—`, `–`): đứng cạnh dấu trừ `−` thì chủ dự án đọc thành phép trừ.
 * 4. Hằng số (số khác 0, 1, 2) của dòng chữ và của hình phải là MỘT tập: "tại sao trên công thức
 *    không có nhân với 100 mà bên dưới lại nhân với 100?" (17/09/2026).
 * 5. Số VẾ của dòng chữ và của hình phải bằng nhau: hình của `ty-so-sortino` vẽ hai vế (tỷ số, rồi
 *    độ lệch chuẩn phần giảm) mà dòng chữ chỉ đọc vế đầu — "tại sao lại có 2 công thức mà bên dưới
 *    chỉ có giải thích cho 1 công thức?" (18/09/2026). Luật 4 không thấy được lỗi này: vế bị bỏ
 *    quên chẳng mang con số lạ nào.
 * 6. Hình ngắt ở đâu thì dòng chữ xuống dòng ở đó, và MỖI DÒNG đúng một vế: bản vá đầu của luật 5
 *    nối hai vế bằng ", với …", chủ dự án bác tiếp — "cần xuống dòng giải thích công thức thứ 2
 *    thay vì dùng dấu phẩy khó nhìn như này. cần xử lý khoa học hơn" (18/09/2026). Chỗ ngắt của
 *    hình là `\quad`, `\qquad` hay `\\`; chỗ ngắt của chữ là ký tự xuống dòng.
 * 7. Hình có bao nhiêu PHÉP TOÁN thì dòng chữ đọc ra bấy nhiêu, trừ phần đã có tên trong bảng ký
 *    hiệu: `gia-hoa-von` vẽ `Q · P_mua` mà dòng chữ ghi "Tiền mua" — một danh từ không có hàng nào
 *    trong bảng bên phải. "Q.P mua bên trên ký hiệu ra sao thì bên dưới giải thích y nguyên. tôi có
 *    cần bạn ăn bớt vậy đâu?" (06/10/2026). Xem `thieuPhepToan()` để biết vì sao "trừ phần đã có
 *    tên" mới là chỗ phân biệt đúng và sai.
 *
 * Luật 5 và luật 6 đo hai thứ khác nhau, nên giữ cả hai: `don-bay-tong-hop` là đẳng thức DÂY
 * CHUYỀN `DTL = DOL × DFL = …`, hai dấu bằng trong MỘT khối, nên luật 5 đòi hai dấu bằng còn luật 6
 * đòi một dòng. Cắt nó ra là đẻ một dòng mở đầu bằng dấu bằng.
 *
 * Không import gì ngoài bộ tách ký hiệu — chạy được ở Node lẫn trình duyệt.
 */

import { latexSymbolTokens } from './latex-symbols';

export type TextLocale = 'vi' | 'en';

/** Luật 1: dấu gạch chéo ngược của LaTeX sót lại. */
export const LATEX_BACKSLASH = /\\/;
/** Luật 1: ngoặc nhọn của LaTeX sót lại. */
export const LATEX_BRACES = /[{}]/;
/** Luật 3: gạch ngang dài hoặc vừa — loại gạch duy nhất được đứng cạnh công thức là dấu trừ `−`. */
export const DASHES = /[–—]/;

/**
 * Các lỗi của một dòng công thức viết bằng chữ, theo luật 1–3. Mảng rỗng nghĩa là đạt.
 *
 * Trả về mô tả ngắn chứ không ném: nơi gọi (ca kiểm) tự ghép tên công thức vào để người sửa biết
 * chỗ nào hỏng.
 */
export function expressionLineProblems(text: string): string[] {
  const problems: string[] = [];
  if (LATEX_BACKSLASH.test(text)) problems.push('còn dấu gạch chéo ngược của LaTeX');
  if (LATEX_BRACES.test(text)) problems.push('còn ngoặc nhọn của LaTeX');
  if (!text.includes('=')) problems.push('thiếu dấu bằng');
  if (DASHES.test(text)) problems.push('có gạch ngang, dễ đọc nhầm thành dấu trừ');
  return problems;
}

/**
 * Tập hằng số (khác 0, 1, 2) của một dòng chữ, đã quy về dấu chấm thập phân và sắp xếp.
 *
 * Tiếng Việt viết `1.000` là một nghìn và `22,5` là thập phân; tiếng Anh ngược lại. Phân cách
 * nghìn bị bỏ trước khi tách số, nên `1.000` và `1000` cùng ra `1000`.
 */
export function numbersInText(text: string, locale: TextLocale): string[] {
  const thousands = locale === 'vi' ? /(\d)\.(?=\d{3}\b)/g : /(\d),(?=\d{3}\b)/g;
  const decimal = locale === 'vi' ? ',' : '.';
  const found = text.replace(thousands, '$1').match(/\d+(?:[.,]\d+)?/g) ?? [];
  const normalized = found
    .map((s) => (decimal === ',' ? s.replace(',', '.') : s))
    .filter((s) => !['0', '1', '2'].includes(s));
  return [...new Set(normalized)].sort();
}

/**
 * Số vế của một DÒNG CHỮ: đếm dấu bằng, vì mỗi vế mở ra bằng đúng một dấu bằng.
 *
 * Dòng chữ không có chỉ số trên dưới hay `\text{}` nên không phải dọn gì trước khi đếm.
 */
export function equationsInText(text: string): number {
  return (text.match(/=/gu) ?? []).length;
}

/**
 * Luật 6: các DÒNG của một khối chữ. Một dòng là một vế; `text.split` để ở đây một mình, để ngày
 * nào `expression` đổi sang mảng thì chỉ hàm này đổi, các ca kiểm gọi nó thì không.
 */
export function expressionLines(text: string): string[] {
  return text.split('\n');
}

/**
 * Luật 6: số KHỐI của một hình công thức — `\quad`, `\qquad` và `\\` là chỗ hình tự ngắt.
 *
 * Không nhận `\ ` (gạch chéo rồi dấu cách, một khoảng trắng mỏng — `atr-dao-dong-thuc` dùng hai lần
 * bên trong `\max`, và là chỗ duy nhất trong repo) và không nhận `\quadrature` tưởng tượng nào:
 * sau `quad` phải hết chữ cái.
 */
export function blocksInLatex(latex: string): number {
  return (latex.match(/\\(?:qquad|quad)(?![a-zA-Z])|\\\\/gu) ?? []).length + 1;
}

/**
 * Luật 6 ở tầng một KHỐI CHỮ: mỗi dòng phải là một công thức đọc được — không dòng rỗng, không
 * khoảng trắng thừa hai đầu, và vẫn đủ luật 1 tới 3 (không sót LaTeX, có dấu bằng, không gạch
 * ngang). Nơi gọi vì thế chỉ cần một hàm. Trả mô tả ngắn, không ném.
 *
 * KHÔNG cấm một dòng có hai dấu bằng: `don-bay-tong-hop` viết `Đòn bẩy tổng hợp = Đòn bẩy hoạt động
 * × Đòn bẩy tài chính = (Doanh thu − Tổng biến phí) ÷ (EBIT − Lãi vay)`, đúng một khối của hình.
 * Chuyện "hai vế nhồi một dòng" do ca đếm DÒNG bắt: hình hai khối mà chữ một dòng là đỏ.
 */
export function expressionBlockProblems(text: string): string[] {
  const problems: string[] = [];
  const lines = expressionLines(text);

  for (const [i, line] of lines.entries()) {
    const where = lines.length === 1 ? '' : `dòng ${String(i + 1)}: `;
    if (line.trim() === '') {
      problems.push(`${where}dòng rỗng`);
      continue;
    }
    if (line !== line.trim()) problems.push(`${where}thừa khoảng trắng ở đầu hoặc cuối dòng`);
    for (const problem of expressionLineProblems(line)) problems.push(`${where}${problem}`);
  }

  return problems;
}

/**
 * Số vế của một HÌNH công thức LaTeX.
 *
 * Hai chỗ có dấu bằng mà không mở vế mới, phải dọn trước khi đếm:
 *
 * - chỉ số trên dưới — `\sum_{t=1}^{n}`, `\prod_{k=1}^{n}`, `\max_{s \le t}`;
 * - chữ trong `\text{…}` — đó là tên gọi, không phải phép tính.
 *
 * `\le`, `\ge`, `\ne`, `\approx`, `\equiv` cũng không mở vế: chúng SO SÁNH hai bên chứ không đặt
 * tên cho một đại lượng mới.
 */
export function equationsInLatex(latex: string): number {
  const sach = boChiSoVaChu(latex).replace(/\\(leq|geq|le|ge|neq|ne|approx|equiv)\b/gu, '§');
  return (sach.match(/=/gu) ?? []).length;
}

/**
 * Thay mỗi chỉ số trên dưới (`_{…}`, `^{…}`) và mỗi `\text{…}` bằng một ký tự `§`.
 *
 * Luật 5 và luật 7 cùng cần: dấu `=` trong `\sum_{t=1}^{n}` không mở vế mới, và dấu `-` trong
 * `P_{t-1}` hay `r_{danh\,nghia}` không phải phép trừ — cả hai chỉ là NHÃN của một ký hiệu.
 */
function boChiSoVaChu(latex: string): string {
  let out = '';
  for (let i = 0; i < latex.length; i += 1) {
    const laText = latex.startsWith('\\text{', i);
    const moNhom = laText ? i + 5 : i + 1;
    const ky = latex[i] ?? '';
    if ((laText || ky === '_' || ky === '^') && latex[moNhom] === '{') {
      let depth = 0;
      let j = moNhom;
      for (; j < latex.length; j += 1) {
        if (latex[j] === '{') depth += 1;
        else if (latex[j] === '}') {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      out += '§';
      i = j;
      continue;
    }
    out += ky;
  }
  return out;
}

/** Luật 7: bốn phép toán của một công thức, đếm riêng từng loại. */
export interface PhepToan {
  nhan: number;
  chia: number;
  cong: number;
  tru: number;
}

/** Tên hiển thị của từng phép, để câu báo lỗi nói bằng ký hiệu người đọc thấy trên màn. */
const DAU_PHEP: Record<keyof PhepToan, string> = { nhan: '×', chia: '÷', cong: '+', tru: '−' };

/**
 * Luật 7: phép toán của một HÌNH.
 *
 * `\,` và `\;` tính là phép NHÂN: `Q\,(1 - r)` là một khoảng trắng mỏng trong hình, nhưng đọc thành
 * lời thì bắt buộc phải có dấu `×` — và chính chỗ này là chỗ `gia-hoa-von` lọt lưới nếu không đếm.
 * Dòng chữ của nó có đúng một dấu `×`, vừa đủ cho `\cdot` ở tử, nên nếu bỏ qua `\,` ở mẫu thì cửa
 * gác xanh trong khi `Q · P_mua` đã bị nuốt mất.
 */
export function phepToanTrongLatex(latex: string): PhepToan {
  const s = boChiSoVaChu(latex);
  return {
    nhan: (s.match(/\\cdot|\\times|\\,|\\;/gu) ?? []).length,
    chia: (s.match(/\\frac|\\dfrac|\\div/gu) ?? []).length,
    cong: (s.match(/\+/gu) ?? []).length,
    tru: (s.match(/-/gu) ?? []).length,
  };
}

/** Luật 7: phép toán của một DÒNG CHỮ. Dấu trừ là `−` (U+2212), không phải gạch nối. */
export function phepToanTrongChu(text: string): PhepToan {
  return {
    nhan: (text.match(/×/gu) ?? []).length,
    chia: (text.match(/÷/gu) ?? []).length,
    cong: (text.match(/\+/gu) ?? []).length,
    tru: (text.match(/−/gu) ?? []).length,
  };
}

/**
 * Luật 7: phép toán hình vẽ ra mà dòng chữ không đọc. Mảng rỗng nghĩa là đạt.
 *
 * ## Vì sao phải trừ đi phần nằm trong một hàng GỘP của bảng ký hiệu
 *
 * Gộp mấy ký hiệu thành một danh từ không phải lúc nào cũng sai — nó sai khi danh từ ấy KHÔNG được
 * trang nào gọi tên. `roi-rong` viết "Vốn thực bỏ ra" thay cho `Q · P_mua + F_mua + F_lk`, và đó là
 * hàng thứ bảy của bảng ký hiệu ngay cạnh hình ("vốn thực bỏ ra: tiền mua cộng phí mua và phí lưu
 * ký"); `loi-nhuan-rong` viết "Tổng chi phí" thay cho `F_mua + F_ban + T + F_lk`, cũng là một hàng.
 * Người đọc rê vào cụm trong hình là thấy đúng cái tên ấy. `gia-hoa-von` viết "Tiền mua" thay cho
 * `Q · P_mua` mà bảng không có hàng nào như thế — chữ ấy không dẫn đi đâu cả.
 *
 * Nên thước đo là: phép toán của hình, TRỪ phép toán nằm trong các hàng gộp (mỗi hàng trừ đúng số
 * lần nó xuất hiện trong hình), phải không nhiều hơn phép toán của dòng chữ. Chiều ngược lại để
 * ngỏ: dòng chữ được phép có THÊM dấu, vì phép nhân viết liền của hình phải thành `×` khi đọc ra
 * lời, và vì một hàng gộp vẫn được viết bung ra nếu người viết muốn.
 *
 * Đo trên cả 111 công thức (06/10/2026): ba công thức hỏng, không công thức nào bị oan. Những chỗ
 * tưởng là gộp mà thực ra đọc đủ đều xanh — `√` đọc thành "căn bậc hai của" (không phải một trong
 * bốn phép này), `\frac{1}{n}\sum` đọc thành "Trung bình" (là một hàng gộp của `ty-le-khoi-luong`).
 *
 * Luật 4 (hằng số) và luật 5 (số vế) đều không thấy được lỗi này: cụm bị nuốt chẳng mang con số lạ
 * nào, và nuốt bao nhiêu ký hiệu thì dấu bằng vẫn đúng một cái.
 */
export function thieuPhepToan(
  latex: string,
  text: string,
  kyHieuTrongBang: ReadonlyArray<string>,
): string[] {
  const hinh = phepToanTrongLatex(latex);
  const chu = phepToanTrongChu(text);

  const daCoTen: PhepToan = { nhan: 0, chia: 0, cong: 0, tru: 0 };
  for (const kyHieu of kyHieuTrongBang) {
    const soLan = latex.split(kyHieu).length - 1;
    if (soLan === 0) continue;
    const trongHang = phepToanTrongLatex(kyHieu);
    for (const phep of Object.keys(DAU_PHEP) as (keyof PhepToan)[]) {
      daCoTen[phep] += trongHang[phep] * soLan;
    }
  }

  return (Object.keys(DAU_PHEP) as (keyof PhepToan)[])
    .filter((phep) => chu[phep] < hinh[phep] - daCoTen[phep])
    .map(
      (phep) =>
        `${DAU_PHEP[phep]}: hình có ${String(hinh[phep])}, bảng ký hiệu đặt tên cho ${String(daCoTen[phep])}, dòng chữ chỉ đọc ${String(chu[phep])}`,
    );
}

/**
 * Tập hằng số (khác 0, 1, 2) của một chuỗi LaTeX — theo đúng luật số của `latexSymbolTokens()`,
 * đã quy về dấu chấm thập phân và sắp xếp.
 */
export function numbersInLatex(latex: string): string[] {
  return [
    ...new Set(
      latexSymbolTokens(latex)
        .filter((token) => /^\d/.test(token))
        .map((token) => token.replace(',', '.')),
    ),
  ].sort();
}
