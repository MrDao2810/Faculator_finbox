/**
 * Tầng DOMAIN — tìm đoạn khớp để giao diện tô sáng (gói WBS 3.1.3, màn WF-09).
 *
 * Vì sao việc này nằm ở đây chứ không ở component: nó là một phép suy luận về chuỗi, và là
 * phép khó nhất trong cả tính năng tìm kiếm. Người dùng gõ "dinh gia" mà chữ trên màn là
 * "Định giá" — muốn tô đúng bốn ký tự "Định" thì phải biết ký tự thứ mấy của chuỗi ĐÃ BỎ DẤU
 * ứng với ký tự thứ mấy của chuỗi GỐC. Viết trong JSX thì chỉ kiểm được bằng mắt; ở đây kiểm
 * được bằng Node.
 *
 * Luật tô phải khớp đúng luật chấm điểm của `scoreFormula`: khớp theo TIỀN TỐ của một từ.
 * Tô kiểu khác thì người dùng thấy một dòng kết quả không có chữ nào được tô, và tưởng máy
 * trả sai.
 */

import { normalizeVi, tokenize } from './search';

/** Một đoạn khớp, tính bằng chỉ số trong chuỗi GỐC. `end` là vị trí sau ký tự cuối. */
export interface HighlightRange {
  start: number;
  end: number;
}

/** Một mẩu chuỗi đã cắt sẵn cho giao diện: `hit` là phần cần tô. */
export interface HighlightPart {
  text: string;
  hit: boolean;
}

interface NormalizedText {
  /** Chuỗi đã bỏ dấu, hạ chữ thường. */
  normalized: string;
  /** `starts[i]` là vị trí trong chuỗi gốc của ký tự thứ i trong `normalized`. */
  starts: number[];
  /** `ends[i]` là vị trí ngay sau ký tự gốc ấy. */
  ends: number[];
}

/**
 * Bỏ dấu nhưng GIỮ được đường về chuỗi gốc.
 *
 * Không dùng thẳng `normalizeVi(cả chuỗi)` rồi lấy chỉ số: `String.normalize('NFD')` tách một
 * ký tự thành nhiều ký tự nên chỉ số lệch ngay từ chữ có dấu đầu tiên. Chuẩn hoá từng ký tự
 * một thì mỗi ký tự gốc cho ra 0 hoặc 1 ký tự đã bỏ dấu, và ta ghi lại được cặp chỉ số.
 *
 * Duyệt theo ĐIỂM MÃ (`for...of`) chứ không theo đơn vị UTF-16, để ký tự ngoài mặt phẳng cơ
 * bản — emoji chẳng hạn — không bị cắt đôi.
 */
function normalizeWithMap(text: string): NormalizedText {
  let normalized = '';
  const starts: number[] = [];
  const ends: number[] = [];

  let offset = 0;
  for (const char of text) {
    const piece = normalizeVi(char);
    for (let i = 0; i < piece.length; i += 1) {
      starts.push(offset);
      ends.push(offset + char.length);
    }
    normalized += piece;
    offset += char.length;
  }

  return { normalized, starts, ends };
}

/** Ký tự có được tính là một phần của từ hay không — cùng luật cắt từ với `tokenize`. */
function isWordChar(char: string | undefined): boolean {
  return char !== undefined && /[a-z0-9]/.test(char);
}

/**
 * Vị trí các đoạn cần tô trong `text`, theo chỉ số của chính chuỗi gốc.
 *
 * Trả về mảng đã sắp xếp và đã gộp các đoạn chồng nhau, nên nơi gọi cắt chuỗi tuần tự được
 * mà không phải lo hai đoạn đè lên nhau (gõ "di dinh" là ra đúng ca đó).
 * Chuỗi rỗng hoặc không khớp gì thì trả mảng rỗng — không bao giờ ném lỗi.
 */
export function highlightRanges(text: string, query: string): HighlightRange[] {
  const tokens = tokenize(query);
  if (text === '' || tokens.length === 0) return [];

  const { normalized, starts, ends } = normalizeWithMap(text);
  const found: HighlightRange[] = [];

  // Quét từng từ trong chuỗi đích, đúng cách `tokenize` cắt từ.
  let index = 0;
  while (index < normalized.length) {
    if (!isWordChar(normalized[index])) {
      index += 1;
      continue;
    }

    let wordEnd = index;
    while (wordEnd < normalized.length && isWordChar(normalized[wordEnd])) wordEnd += 1;

    const word = normalized.slice(index, wordEnd);

    // Từ khoá nào là tiền tố của từ này thì tô đúng phần tiền tố ấy. Lấy đoạn DÀI NHẤT: gõ
    // "d dinh" thì hai từ khoá cùng khớp "định", tô đoạn dài hơn mới đúng ý người dùng.
    let longest = 0;
    for (const token of tokens) {
      if (word.startsWith(token) && token.length > longest) longest = token.length;
    }

    if (longest > 0) {
      const start = starts[index];
      const end = ends[index + longest - 1];
      if (start !== undefined && end !== undefined) found.push({ start, end });
    }

    index = wordEnd;
  }

  return mergeRanges(found);
}

/** Gộp các đoạn chồng hoặc dính nhau. Đầu vào đã theo thứ tự tăng dần vì quét từ trái sang. */
function mergeRanges(ranges: ReadonlyArray<HighlightRange>): HighlightRange[] {
  const merged: HighlightRange[] = [];

  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last !== undefined && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
      continue;
    }
    merged.push({ ...range });
  }

  return merged;
}

/**
 * Cắt chuỗi thành các mẩu tô / không tô, sẵn sàng cho JSX.
 *
 * Luôn trả về ít nhất một mẩu khi `text` khác rỗng, và ghép mọi `part.text` lại phải ra đúng
 * `text` ban đầu — có ca kiểm chặn điều đó, vì mất chữ ở đây là mất chữ ngay trên màn.
 */
export function highlightParts(text: string, query: string): HighlightPart[] {
  const ranges = highlightRanges(text, query);
  if (ranges.length === 0) return text === '' ? [] : [{ text, hit: false }];

  const parts: HighlightPart[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start > cursor) parts.push({ text: text.slice(cursor, range.start), hit: false });
    parts.push({ text: text.slice(range.start, range.end), hit: true });
    cursor = range.end;
  }

  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false });

  return parts;
}
