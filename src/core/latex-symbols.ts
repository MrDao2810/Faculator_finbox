/**
 * Tầng DOMAIN — tách các KÝ HIỆU có nghĩa ra khỏi một chuỗi LaTeX, để cửa gác đối chiếu bảng ký hiệu
 * (`FormulaSpec.symbols`) với hình công thức: mọi chữ trong hình phải có trong bảng.
 *
 * ## Đây là bộ tách THEO LUẬT, không phải bộ phân tích LaTeX
 *
 * 111 chuỗi `latex` của Registry đều ngắn và cùng một kiểu (phân số, tổng, luỹ thừa, chỉ số dưới),
 * nên vài luật là đủ và đọc được. Kết quả là một TẬP token đã chuẩn hoá, so bằng phép bao hàm — cả
 * hình lẫn từng mục của bảng đều đi qua cùng hàm này, nên hai bên lệch nhau kiểu gì cũng lộ.
 *
 * Luật:
 *
 * 1. `\text{…}` — chữ thường tiếng Việt ("Vốn chủ sở hữu") tự giải thích, bỏ. Riêng VIẾT TẮT ngắn
 *    không dấu cách (`LNST`, `TSNH`, `Cov`, `Payout`) là token, vì người mới không tự đọc ra được.
 * 2. Lệnh trình bày và toán tử (`\frac`, `\sum`, `\max`, `\ln`, `\times`, `\left`…) bỏ. Chữ Hy Lạp
 *    (`\beta`, `\sigma`, `\Delta`…) giữ làm token, vì chúng là ký hiệu.
 * 3. `\bar{X}`, `\overline{X}`, `\hat{X}` là ký hiệu RIÊNG (trung bình của X) → token cả cụm, kèm
 *    token của X bên trong.
 * 4. Tên có chỉ số dưới: chỉ số là MỘT TỪ (`P_{mua}`, `\sigma_{nam}`, `BB_{tren}`) thì cả cụm là một
 *    ký hiệu riêng; chỉ số là CHỈ SỐ CHẠY (`P_{t-i}`, `r_{t+1}`, `\beta_i`) thì tên gốc là token và
 *    từng chữ cái trong chỉ số cũng là token (t, i — chúng cũng cần được gọi tên).
 * 5. Số: token, trừ 0, 1, 2 và 100 — quá thường gặp để bắt buộc, nhưng `365`, `12`, `72`, `22,5`
 *    thì phải có lời giải.
 *
 * Không import gì — chạy được ở Node lẫn trình duyệt, nhưng chỉ cửa gác dùng tới.
 */

/** Lệnh giữ lại làm ký hiệu: chữ Hy Lạp và vài chữ cái toán học. */
const IDENTIFIER_COMMANDS = new Set([
  'alpha',
  'beta',
  'gamma',
  'delta',
  'Delta',
  'epsilon',
  'theta',
  'lambda',
  'mu',
  'pi',
  'rho',
  'sigma',
  'Sigma',
  'tau',
  'phi',
  'omega',
]);

/** Lệnh "trang trí" biến một ký hiệu thành ký hiệu khác (trung bình, mũ…). */
const DECORATOR_COMMANDS = ['bar', 'overline', 'hat', 'tilde', 'vec'];

/** Toán tử có chỉ số dưới/trên chứa chỉ số chạy: `\sum_{t=1}^{n}`, `\max_{s \le t}`. */
const OPERATOR_COMMANDS = ['sum', 'prod', 'max', 'min', 'lim'];

/** Số không bị đòi giải thích. */
const OBVIOUS_NUMBERS = new Set(['0', '1', '2', '100']);

/** Viết tắt trong `\text{}`: 2–8 chữ cái, không dấu cách, không dấu tiếng Việt, bắt đầu bằng chữ hoa. */
const ABBREVIATION = /^[A-Z][A-Za-z]{1,7}$/;

/**
 * Chữ cái làm CHỈ SỐ CHẠY trong Registry: phiên t, đếm i/j/k, phiên s ≤ t, số phiên n. Chữ cái khác
 * đứng ở chỉ số dưới là NHÃN của một ký hiệu riêng — `r_f` (phi rủi ro), `r_e` (vốn chủ), `\sigma_p`
 * (danh mục), `R_m` (thị trường) — nên cả cụm mới là ký hiệu.
 */
const RUNNING_INDEX = new Set(['t', 'i', 'j', 'k', 's', 'n']);

/** Chỉ số dưới là chỉ số chạy khi mọi chữ trong đó đều là chỉ số chạy (`t`, `t+1`, `s \le t`, `1-\alpha`). */
function isRunningIndex(subscript: string): boolean {
  // Chữ Hy Lạp trong chỉ số (`1-\alpha`) tách ra làm ký hiệu riêng, nên coi như một chỉ số chạy.
  const words = subscript.replace(/[A-Za-z]+/g, 't').match(/[A-Za-z]+/g) ?? [];
  return words.every((w) => RUNNING_INDEX.has(w));
}

/** Lấy nội dung trong cặp ngoặc nhọn bắt đầu tại `open` (vị trí của `{`), có lồng nhau. */
function braced(source: string, open: number): { inner: string; end: number } | null {
  if (source[open] !== '{') return null;
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return { inner: source.slice(open + 1, i), end: i + 1 };
    }
  }
  return null;
}

/** Chuẩn hoá một mẩu LaTeX để so sánh: bỏ mọi khoảng trắng và lệnh cách, trả chữ Hy Lạp về dạng `\tên`. */
function normalize(fragment: string): string {
  return fragment
    .replace(/\\[,;!:\s]/g, '')
    .replace(/\s+/g, '')
    .replace(//g, '\\');
}

/**
 * Tập ký hiệu của một chuỗi LaTeX, đã chuẩn hoá và sắp xếp — xem docblock đầu file.
 */
export function latexSymbolTokens(latex: string): ReadonlyArray<string> {
  const tokens = new Set<string>();
  let rest = latex.replace(/\{,\}/g, ',');

  // 1. \text{…}
  rest = rest.replace(/\\text\{([^{}]*)\}/g, (_m, inner: string) => {
    const word = inner.trim();
    if (ABBREVIATION.test(word)) tokens.add(word);
    return ' ';
  });

  // 3. Ký hiệu trang trí — lấy cả cụm rồi tách tiếp phần trong.
  for (const cmd of DECORATOR_COMMANDS) {
    const re = new RegExp(`\\\\${cmd}\\{`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(rest)) !== null) {
      const box = braced(rest, m.index + m[0].length - 1);
      if (box === null) break;
      let whole = rest.slice(m.index, box.end);
      // Chỉ số dưới/trên dính ngay sau: `\bar{r}_p`, `\overline{r^{+}}` đã nằm trong ngoặc.
      let tail = box.end;
      while (rest[tail] === '_' || rest[tail] === '^') {
        const sub = braced(rest, tail + 1);
        if (sub !== null) tail = sub.end;
        else tail += 2;
      }
      whole = rest.slice(m.index, tail);
      tokens.add(normalize(whole));
      for (const inner of latexSymbolTokens(box.inner)) tokens.add(inner);
      rest = `${rest.slice(0, m.index)} ${rest.slice(tail)}`;
      re.lastIndex = m.index;
    }
  }

  // 2 + 4a. Toán tử có chỉ số: nội dung chỉ số là chỉ số chạy → tách tiếp, rồi bỏ lệnh.
  for (const cmd of OPERATOR_COMMANDS) {
    const re = new RegExp(`\\\\${cmd}(?![A-Za-z])`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(rest)) !== null) {
      let tail = m.index + m[0].length;
      const parts: string[] = [];
      while (rest[tail] === '_' || rest[tail] === '^') {
        const box = braced(rest, tail + 1);
        if (box !== null) {
          parts.push(box.inner);
          tail = box.end;
        } else {
          parts.push(rest.slice(tail + 1, tail + 2));
          tail += 2;
        }
      }
      for (const part of parts) for (const inner of latexSymbolTokens(part)) tokens.add(inner);
      rest = `${rest.slice(0, m.index)} ${rest.slice(tail)}`;
      re.lastIndex = m.index;
    }
  }

  // 2b. Chữ Hy Lạp → token (giữ chỉ số dưới theo luật 4), lệnh khác → bỏ.
  rest = rest.replace(/\\([A-Za-z]+)/g, (_m, name: string) =>
    IDENTIFIER_COMMANDS.has(name) ? ` ${name}` : ' ',
  );
  rest = rest.replace(/\\[^A-Za-z]/g, ' ');

  // 4. Tên + chỉ số dưới/trên.
  const ident = /(?[A-Za-z]+)((?:[_^](?:\{[^{}]*\}|[A-Za-z0-9]))*)/g;
  let m: RegExpExecArray | null;
  while ((m = ident.exec(rest)) !== null) {
    const base = (m[1] ?? '').replace('', '\\');
    const scripts = m[2] ?? '';
    const subscript = /_(?:\{([^{}]*)\}|([A-Za-z0-9]))/.exec(scripts);
    const sub = subscript === null ? null : (subscript[1] ?? subscript[2] ?? '');
    const superscripts = [...scripts.matchAll(/\^(?:\{([^{}]*)\}|([A-Za-z0-9]))/g)].map(
      (s) => s[1] ?? s[2] ?? '',
    );

    if (sub !== null && sub.trim() !== '' && !isRunningIndex(sub)) {
      tokens.add(normalize(`${base}_{${sub}}`));
    } else {
      tokens.add(base);
      if (sub !== null) for (const inner of latexSymbolTokens(sub)) tokens.add(inner);
    }
    for (const sup of superscripts) for (const inner of latexSymbolTokens(sup)) tokens.add(inner);
  }

  // 5. Số.
  for (const num of rest.replace(ident, ' ').matchAll(/\d+(?:[.,]\d+)*/g)) {
    if (!OBVIOUS_NUMBERS.has(num[0])) tokens.add(num[0]);
  }

  return [...tokens].sort();
}
