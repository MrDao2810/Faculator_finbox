/**
 * Tầng DOMAIN — viết một chuỗi LaTeX của hình công thức thành CHỮ THƯỜNG, cho file PDF xuất ra.
 *
 * File PDF (17/11/2026) dựng bằng pdf-lib với font nhúng, không có KaTeX. Hình công thức đầy đủ được
 * chụp từ MathML đang hiện trên trang; khi trình duyệt không cho chụp (Safari có thể khoá canvas vẽ
 * `foreignObject`) thì file in dòng chữ này thay. Cột "Ký hiệu" của bảng chú thích luôn dùng dòng
 * chữ này.
 *
 * Quy ước, cùng nếp nhãn ô nhập (`o-ky-hieu.ts`): chỉ số dưới một cụm viết LIỀN ('P_{mua}' thành
 * 'Pmua', '\beta_p' thành 'βp'); chỉ số có phép tính thì giữ dấu gạch dưới và ngoặc ('r_{t+1}' thành
 * 'r_(t+1)'), vì 'rt+1' đọc thành r·t + 1. Phân số thành 'a/b', ngoặc quanh vế có phép tính.
 */

const LENH: Readonly<Record<string, string>> = {
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  Delta: 'Δ',
  epsilon: 'ε',
  mu: 'μ',
  pi: 'π',
  rho: 'ρ',
  sigma: 'σ',
  Sigma: 'Σ',
  theta: 'θ',
  lambda: 'λ',
  times: ' × ',
  cdot: ' · ',
  div: ' ÷ ',
  le: ' ≤ ',
  leq: ' ≤ ',
  ge: ' ≥ ',
  geq: ' ≥ ',
  ne: ' ≠ ',
  neq: ' ≠ ',
  approx: ' ≈ ',
  pm: ' ± ',
  sum: 'Σ',
  prod: 'Π',
  ln: 'ln',
  log: 'log',
  max: 'max',
  min: 'min',
  exp: 'exp',
  mid: ' | ',
  ldots: '…',
  cdots: '…',
  lfloor: '⌊',
  rfloor: '⌋',
  lceil: '⌈',
  rceil: '⌉',
  infty: '∞',
  quad: '   ',
  qquad: '      ',
  left: '',
  right: '',
};

const MU: Readonly<Record<string, string>> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '−': '⁻',
  n: 'ⁿ',
  i: 'ⁱ',
};

/** Có phép tính hay khoảng trắng — cần ngoặc khi đứng làm một vế. */
function laCum(text: string): boolean {
  return /[\s+\-−×÷·/=<>≤≥,]/.test(text.trim());
}

function boc(text: string): string {
  const t = text.trim();
  return laCum(t) ? `(${t})` : t;
}

class BoDoc {
  private i = 0;

  constructor(private readonly s: string) {}

  /** Đọc tới hết chuỗi hoặc tới `}` đóng nhóm hiện tại. */
  doc(): string {
    let out = '';
    while (this.i < this.s.length) {
      const c = this.s[this.i];
      if (c === '}') return out;
      out += this.mot();
    }
    return out;
  }

  /** Một nhóm `{…}` hoặc một ký tự / một lệnh trơn. */
  private nhom(): string {
    while (this.s[this.i] === ' ') this.i += 1;
    if (this.s[this.i] === '{') {
      this.i += 1;
      const ben = this.doc();
      this.i += 1; // `}`
      return ben;
    }
    return this.mot();
  }

  private mot(): string {
    const c = this.s[this.i] ?? '';
    if (c === '\\') return this.lenh();
    if (c === '{') {
      this.i += 1;
      const ben = this.doc();
      this.i += 1;
      return ben;
    }
    if (c === '_') {
      this.i += 1;
      const ben = this.nhom().trim();
      return laCum(ben) ? `_(${ben})` : ben.replace(/\s+/g, '');
    }
    if (c === '^') {
      this.i += 1;
      const ben = this.nhom().trim();
      const mu = [...ben].map((k) => MU[k]);
      return mu.every((k) => k !== undefined) && mu.length > 0 ? mu.join('') : `^(${ben})`;
    }
    this.i += 1;
    if (c === '-') return '−';
    if (c === '*') return '×';
    return c;
  }

  private lenh(): string {
    this.i += 1;
    const dau = this.s[this.i] ?? '';
    if (!/[a-zA-Z]/.test(dau)) {
      this.i += 1;
      if (dau === ',' || dau === ';' || dau === ':') return ' ';
      if (dau === '!') return '';
      if (dau === '\\') return '\n';
      return dau; // \% \{ \} \_ …
    }
    let ten = '';
    while (/[a-zA-Z]/.test(this.s[this.i] ?? '')) {
      ten += this.s[this.i];
      this.i += 1;
    }
    // Như TeX: dấu cách ngay sau tên lệnh chữ là dấu kết thúc tên, không phải khoảng trắng ('\Delta B' là 'ΔB').
    while (this.s[this.i] === ' ') this.i += 1;
    switch (ten) {
      case 'text':
      case 'mathrm':
      case 'operatorname':
        return this.nhom();
      case 'frac':
      case 'dfrac':
      case 'tfrac': {
        const tu = this.nhom();
        const mau = this.nhom();
        return `${boc(tu)}/${boc(mau)}`;
      }
      case 'sqrt':
        return `√${boc(this.nhom())}`;
      case 'bar':
      case 'overline': {
        const ben = this.nhom().trim();
        return [...ben].length === 1 ? `${ben}̄` : `(${ben})̄`;
      }
      case 'begin':
      case 'end':
        this.nhom();
        if (ten === 'begin' && this.s[this.i] === '{') this.nhom(); // {l} của array
        return '';
      default:
        return LENH[ten] ?? ten;
    }
  }
}

/** Chuỗi LaTeX thành chữ thường. Nhiều dòng (`\\`) thì tách bằng '\n'. */
export function latexThanhChu(latex: string): string {
  return new BoDoc(latex)
    .doc()
    .split('\n')
    .map((dong) =>
      dong
        .replace(/[ \t]+/g, ' ')
        // Khoảng trắng sát mặt trong ngoặc là dấu cách của mã LaTeX, không phải của công thức.
        .replace(/([⌊⌈([{]) /g, '$1')
        .replace(/ ([⌋⌉)\]}])/g, '$1')
        .trim(),
    )
    .filter((dong) => dong.length > 0)
    .join('\n');
}
