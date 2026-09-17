/**
 * Gắn dấu KÝ HIỆU vào chuỗi MathML của KaTeX — lúc build, cho khung "cách tính" (17/09/2026).
 *
 * Rê chuột hay chạm vào `σ_p` trong hình công thức thì phải biết đó là dòng thứ mấy của bảng ký
 * hiệu. KaTeX không cho gắn gì: ở `output: 'mathml'`, `\htmlData`/`\htmlClass` bị bỏ qua (bộ dựng
 * MathML của chúng chỉ trả phần thân). Nên việc này làm SAU KaTeX, trên chính chuỗi MathML nó ra:
 * dựng từng ký hiệu của bảng thành MathML, rồi tìm cây con giống hệt trong hình công thức.
 *
 * ## Luật khớp — đo trên cả 111 công thức, 541/549 dòng bảng tìm được chỗ
 *
 * 1. So CẤU TRÚC, bỏ qua thuộc tính: `<mo stretchy="false">(</mo>` trong hình và `<mo>(</mo>` của
 *    ký hiệu dựng riêng là một. Một `mrow` chỉ có một con thì coi như chính con ấy.
 * 2. Ký hiệu dựng ở CẢ hai chế độ (khối và dòng) — `\prod_{k=1}^{n}` ra `munderover` ở chế độ khối
 *    nhưng `msubsup` ở chế độ dòng, mà hình công thức dựng ở chế độ khối.
 * 3. Một ký hiệu là một phần tử, hoặc một DÃY phần tử kề nhau (`ERP` là ba `<mi>`).
 * 4. Không khớp phần GỐC của một cụm có chỉ số khi cả cụm là một ký hiệu khác: `r` không phải `r_f`.
 * 5. Không khớp vào bên trong một TÊN nhiều chữ đã là dòng riêng của bảng: `P` không phải chữ P của
 *    `EPS` hay của `P/E`. "Tên" là dãy toàn `<mi>`/`<mn>`; dãy có toán tử thì không tính, vì `t`
 *    trong dòng `(1 - t)` đúng là thuế suất `t`. Không đoán theo chữ đứng kề: `365/d` hay `1/t` là
 *    phép chia, không phải một tên — cửa gác bảng ký hiệu đã buộc mọi tên nhiều chữ phải có dòng riêng.
 * 6. Con của `mfrac`, `msub`… là các ĐỐI SỐ riêng, nên không khớp một dãy vắt qua chúng.
 *
 * Tám dòng không tìm được chỗ đều không đứng riêng trong hình: `D` và `E` chỉ nằm trong tên `D/E`,
 * `\Delta` trong `\Delta NWC`, `t` trong `n t`, `r` của hệ số biến thiên dưới gạch của `\bar{r}`…
 * Dòng như vậy không được có khung cách tính — `buildNotationView()` ném lỗi nếu có.
 *
 * ## Cách gắn dấu — không được đổi hình
 *
 * - Khớp một phần tử: thêm `data-sym="k"` (k là số thứ tự dòng bảng ký hiệu).
 * - Khớp một dãy: bọc bằng `<mrow data-sym="k" data-sym-wrap="">`. Chỉ bọc được khi hai đầu dãy
 *   không phải toán tử có khoảng cách: dạng (tiền tố/trung tố/hậu tố) của `<mo>` tính theo VỊ TRÍ
 *   của nó trong `mrow` cha, nên bọc lại là đổi khoảng cách hai bên nó. Ngoặc và ký hiệu kiểu ngoặc
 *   thì khoảng cách bằng 0 ở mọi dạng, nên bọc an toàn. Hai đầu là toán tử khác thì gắn
 *   `data-sym` lên TỪNG phần tử của dãy, không bọc.
 * - Ký hiệu có nhiều chỗ trong hình thì mọi chỗ đều được gắn. Ký hiệu nằm trong ký hiệu khác
 *   (`m` trong `\sqrt{m}`) thì cả hai cùng mang dấu; bên nhận sự kiện lấy dấu trong cùng.
 *
 * `unmarkSymbols()` gỡ đúng những gì hàm này thêm — ca kiểm dùng nó để chứng minh gắn dấu không
 * đổi một byte nào khác của hình.
 *
 * Không import `katex`: nhận chuỗi đã dựng, nên chạy và kiểm được như hàm thuần.
 */

/** Một dòng bảng ký hiệu: số thứ tự và MathML của nó ở các chế độ dựng. */
export interface LegendRendering {
  index: number;
  renderings: ReadonlyArray<string>;
}

export interface MarkResult {
  html: string;
  /** Số chỗ đã gắn dấu, theo số thứ tự dòng bảng — chỉ có dòng nằm trong `targets`. */
  hits: ReadonlyMap<number, number>;
}

interface TextNode {
  type: 'text';
  raw: string;
}

interface ElementNode {
  type: 'element';
  name: string;
  /** Thẻ mở NGUYÊN VĂN, để dựng lại đúng từng byte. */
  startTag: string;
  selfClosing: boolean;
  children: MathNode[];
}

type MathNode = TextNode | ElementNode;

/** Phần tử mà các con là ĐỐI SỐ theo vị trí, không phải một dãy đọc liền. */
const ARGUMENT_ELEMENTS = new Set([
  'mfrac',
  'mroot',
  'msub',
  'msup',
  'msubsup',
  'munder',
  'mover',
  'munderover',
]);

/** Cụm có chỉ số: con đầu là phần gốc. */
const SCRIPT_ELEMENTS = new Set(['msub', 'msup', 'msubsup', 'munder', 'mover', 'munderover']);

/** Phần tử một "chữ" — kề nhau thì thành một tên nhiều chữ (`EPS`, `P/E`). */
const IDENTIFIER_ELEMENTS = new Set(['mi', 'mn']);

/**
 * Toán tử kiểu ngoặc — đứng ở ĐẦU hay CUỐI một dãy thì khoảng cách bằng 0, nên bọc dãy vẫn an toàn.
 * `∣` (U+2223) và `‖` (U+2225) là thứ KaTeX in ra cho `\left| … \right|` và `\left\| … \right\|`;
 * U+2061 là dấu "áp dụng hàm" vô hình KaTeX chèn sau `\ln`, `\max` — viết bằng mã cho khỏi lẫn.
 */
const ZERO_SPACING_OPERATORS = new Set([
  '(',
  ')',
  '[',
  ']',
  '|',
  '∣',
  '‖',
  '⌊',
  '⌋',
  '⌈',
  '⌉',
  String.fromCharCode(0x2061),
]);

const TOKEN =
  /<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/g;

/** Đọc chuỗi MathML thành cây. Ném lỗi nếu có đoạn không đọc được — thà đỏ build còn hơn gắn sai. */
function parse(html: string): ElementNode {
  const root: ElementNode = {
    type: 'element',
    name: '#root',
    startTag: '',
    selfClosing: false,
    children: [],
  };
  const stack: ElementNode[] = [root];
  let expected = 0;

  for (const match of html.matchAll(TOKEN)) {
    if (match.index !== expected) {
      throw new Error(`mathml-marks: không đọc được đoạn MathML tại vị trí ${String(expected)}`);
    }
    expected = match.index + match[0].length;
    const top = stack[stack.length - 1] as ElementNode;

    if (match[5] !== undefined) {
      top.children.push({ type: 'text', raw: match[5] });
    } else if (match[1] !== undefined) {
      if (top.name !== match[1]) {
        throw new Error(`mathml-marks: thẻ đóng </${match[1]}> không khớp <${top.name}>`);
      }
      stack.pop();
    } else {
      const node: ElementNode = {
        type: 'element',
        name: match[2] as string,
        startTag: match[0],
        selfClosing: match[4] === '/',
        children: [],
      };
      top.children.push(node);
      if (!node.selfClosing) stack.push(node);
    }
  }

  if (expected !== html.length || stack.length !== 1) {
    throw new Error('mathml-marks: chuỗi MathML không trọn vẹn');
  }
  return root;
}

function serialize(node: MathNode): string {
  if (node.type === 'text') return node.raw;
  const inner = node.children.map(serialize).join('');
  if (node.name === '#root') return inner;
  return node.selfClosing ? node.startTag : `${node.startTag}${inner}</${node.name}>`;
}

/** Khoá so sánh cấu trúc — luật khớp 1. */
function structureKey(node: MathNode): string {
  if (node.type === 'text') return node.raw;
  if (node.name === 'mrow' && node.children.length === 1) {
    return structureKey(node.children[0] as MathNode);
  }
  return `<${node.name}>${node.children.map(structureKey).join('')}</${node.name}>`;
}

function findElement(node: ElementNode, name: string): ElementNode | undefined {
  if (node.name === name) return node;
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    const found = findElement(child, name);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** Phần trình bày của một công thức: con đầu của `<semantics>`, bỏ `<annotation>`. */
function presentationOf(root: ElementNode): ElementNode {
  const semantics = findElement(root, 'semantics');
  const first = semantics?.children.find(
    (child): child is ElementNode => child.type === 'element' && child.name !== 'annotation',
  );
  if (first === undefined) throw new Error('mathml-marks: không thấy phần trình bày của MathML');
  return first;
}

/** Dãy khoá cấu trúc của một ký hiệu dựng riêng — bóc các `mrow` bọc ngoài một-con. */
function patternOf(rendering: string): string[] {
  let nodes: MathNode[] = [presentationOf(parse(rendering))];
  while (
    nodes.length === 1 &&
    nodes[0]?.type === 'element' &&
    nodes[0].name === 'mrow' &&
    nodes[0].children.length > 0
  ) {
    nodes = nodes[0].children;
  }
  return nodes.map(structureKey);
}

function textOf(node: MathNode): string {
  return node.type === 'text' ? node.raw : node.children.map(textOf).join('');
}

function isWrapSafeEdge(node: MathNode | undefined): boolean {
  if (node === undefined || node.type !== 'element') return true;
  return node.name !== 'mo' || ZERO_SPACING_OPERATORS.has(textOf(node));
}

interface Candidate {
  index: number;
  /** Một phần tử, hoặc một dãy phần tử kề nhau cùng cha. */
  nodes: ElementNode[];
}

/**
 * Thêm một thuộc tính vào thẻ mở. Một phần tử chỉ mang được MỘT `data-sym`: hai dòng bảng cùng
 * đòi một phần tử (một dòng khớp riêng nó, dòng kia khớp một dãy chứa nó mà không bọc được) thì
 * ném lỗi, vì HTML lặp thuộc tính giữ cái đầu và lặng lẽ bỏ cái sau.
 */
function withAttribute(startTag: string, attribute: string): string {
  if (startTag.includes('data-sym=')) {
    throw new Error(`mathml-marks: phần tử ${startTag} bị hai dòng bảng ký hiệu cùng gắn dấu`);
  }
  return startTag.endsWith('/>')
    ? `${startTag.slice(0, -2)} ${attribute}/>`
    : `${startTag.slice(0, -1)} ${attribute}>`;
}

/**
 * Gắn `data-sym` vào hình công thức cho các dòng bảng ký hiệu nằm trong `targets`.
 *
 * Mọi dòng của bảng đều được đưa vào (không chỉ `targets`) vì luật 4 cần biết cụm nào là một ký
 * hiệu riêng. Ném lỗi khi hai dòng trong `targets` đòi cùng một chỗ.
 */
export function markSymbols(
  formulaHtml: string,
  legend: ReadonlyArray<LegendRendering>,
  targets: ReadonlySet<number>,
): MarkResult {
  const root = parse(formulaHtml);
  const presentation = presentationOf(root);

  const patterns = legend.map((row) => ({
    index: row.index,
    keys: [...new Set(row.renderings.map((html) => JSON.stringify(patternOf(html))))].map(
      (json) => JSON.parse(json) as string[],
    ),
  }));

  /** Khoá của mọi ký hiệu MỘT phần tử trong bảng — cho luật 4. */
  const singleNodeSymbols = new Set(
    patterns.flatMap((p) => p.keys.filter((k) => k.length === 1).map((k) => k[0] as string)),
  );

  /** Chỗ bắt đầu của mọi lần `keySeq` khớp một dãy con của `children`. */
  const matchStarts = (children: ReadonlyArray<MathNode>, keySeq: ReadonlyArray<string>) => {
    const keys = children.map(structureKey);
    const starts: number[] = [];
    for (let start = 0; start + keySeq.length <= children.length; start += 1) {
      if (keySeq.every((key, offset) => keys[start + offset] === key)) starts.push(start);
    }
    return starts;
  };

  const candidates: Candidate[] = [];

  const visit = (parent: ElementNode): void => {
    const children = parent.children;
    const isArgumentList = ARGUMENT_ELEMENTS.has(parent.name);

    /*
     * Luật 5 — các TÊN nhiều chữ của bảng nằm trong `parent`, của MỌI dòng chứ không chỉ `targets`:
     * `EPS` không có khung vẫn phải chặn được `P` có khung khớp vào giữa nó.
     */
    const names: Array<{ index: number; start: number; length: number }> = [];
    if (!isArgumentList) {
      for (const pattern of patterns) {
        for (const keySeq of pattern.keys) {
          if (keySeq.length < 2) continue;
          for (const start of matchStarts(children, keySeq)) {
            const run = children.slice(start, start + keySeq.length);
            const isName = run.every(
              (node) => node.type === 'element' && IDENTIFIER_ELEMENTS.has(node.name),
            );
            if (isName) names.push({ index: pattern.index, start, length: keySeq.length });
          }
        }
      }
    }

    for (const pattern of patterns) {
      if (!targets.has(pattern.index)) continue;

      for (const keySeq of pattern.keys) {
        const length = keySeq.length;
        if (isArgumentList && length > 1) continue; // luật 6

        for (const start of matchStarts(children, keySeq)) {
          const nodes = children.slice(start, start + length);
          if (!nodes.every((node): node is ElementNode => node.type === 'element')) continue;

          // Luật 4: gốc của `r_f` không phải ký hiệu `r`.
          if (
            SCRIPT_ELEMENTS.has(parent.name) &&
            start === 0 &&
            length === 1 &&
            singleNodeSymbols.has(structureKey(parent))
          ) {
            continue;
          }

          // Luật 5: nằm lọt trong một tên dài hơn của dòng khác.
          const insideName = names.some(
            (name) =>
              name.index !== pattern.index &&
              name.length > length &&
              name.start <= start &&
              start + length <= name.start + name.length,
          );
          if (insideName) continue;

          /*
           * Dãy phủ TRỌN một `mrow` (không phải phần trình bày gốc): gắn dấu lên chính `mrow` ấy thay
           * vì bọc thêm một lớp. `\left| \overline{r^{-}} \right|` là trường hợp này — KaTeX đã bọc
           * sẵn cặp ngoặc trong một `mrow` riêng.
           */
          const target: ElementNode[] =
            length > 1 &&
            length === children.length &&
            parent.name === 'mrow' &&
            parent !== presentation
              ? [parent]
              : nodes;

          // Cùng một chỗ đã được nhận: cùng dòng (khớp ở cả hai chế độ dựng) thì bỏ qua, khác dòng
          // thì bảng ký hiệu đang có hai dòng dựng ra y hệt nhau — không đoán được dòng nào đúng.
          const owner = candidates.find(
            (c) =>
              c.nodes.length === target.length && c.nodes.every((node, i) => node === target[i]),
          );
          if (owner !== undefined) {
            if (owner.index !== pattern.index) {
              throw new Error(
                `mathml-marks: dòng ${String(owner.index)} và dòng ${String(pattern.index)} của bảng ký hiệu cùng khớp một chỗ`,
              );
            }
            continue;
          }

          candidates.push({ index: pattern.index, nodes: target });
        }
      }
    }

    for (const child of children) {
      if (child.type === 'element' && child.name !== 'annotation') visit(child);
    }
  };

  visit(presentation);

  const hits = new Map<number, number>();
  for (const candidate of candidates) {
    hits.set(candidate.index, (hits.get(candidate.index) ?? 0) + 1);
  }

  // Gắn thuộc tính trước (không đổi cấu trúc), rồi mới bọc — dãy dài bọc trước dãy ngắn.
  const wraps: Candidate[] = [];
  for (const candidate of candidates) {
    const attribute = `data-sym="${String(candidate.index)}"`;
    if (candidate.nodes.length === 1) {
      const node = candidate.nodes[0] as ElementNode;
      node.startTag = withAttribute(node.startTag, attribute);
      continue;
    }
    const first = candidate.nodes[0];
    const last = candidate.nodes[candidate.nodes.length - 1];
    if (isWrapSafeEdge(first) && isWrapSafeEdge(last)) {
      wraps.push(candidate);
    } else {
      for (const node of candidate.nodes) node.startTag = withAttribute(node.startTag, attribute);
    }
  }

  wraps.sort((a, b) => b.nodes.length - a.nodes.length);
  for (const wrap of wraps) {
    const owner = findParentOf(root, wrap.nodes[0] as ElementNode);
    if (owner === undefined) throw new Error('mathml-marks: mất dấu phần tử cần bọc');
    const at = owner.children.indexOf(wrap.nodes[0] as ElementNode);
    const contiguous = wrap.nodes.every((node, i) => owner.children[at + i] === node);
    if (!contiguous) {
      throw new Error(`mathml-marks: dòng ${String(wrap.index)} chồng lấn một dãy đã bọc khác`);
    }
    const wrapper: ElementNode = {
      type: 'element',
      name: 'mrow',
      startTag: `<mrow data-sym="${String(wrap.index)}" data-sym-wrap="">`,
      selfClosing: false,
      children: [...wrap.nodes],
    };
    owner.children.splice(at, wrap.nodes.length, wrapper);
  }

  return { html: serialize(root), hits };
}

function findParentOf(node: ElementNode, target: ElementNode): ElementNode | undefined {
  for (const child of node.children) {
    if (child === target) return node;
    if (child.type === 'element') {
      const found = findParentOf(child, target);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

/** Gỡ mọi dấu `markSymbols()` đã gắn — trả về đúng chuỗi KaTeX ban đầu. */
export function unmarkSymbols(html: string): string {
  const strip = (node: ElementNode): ElementNode => {
    const children: MathNode[] = [];
    for (const child of node.children) {
      if (child.type === 'text') {
        children.push(child);
      } else if (child.name === 'mrow' && child.startTag.includes('data-sym-wrap=""')) {
        children.push(...strip(child).children);
      } else {
        children.push(strip(child));
      }
    }
    return {
      ...node,
      startTag: node.startTag.replace(/ data-sym="\d+"/g, ''),
      children,
    };
  };
  return serialize(strip(parse(html)));
}
