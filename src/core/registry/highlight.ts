/**
 * Tầng DOMAIN — tìm đoạn khớp để giao diện tô sáng (gói WBS 3.1.3, màn WF-09).
 *
 * Vì sao việc này nằm ở đây chứ không ở component: nó là một phép suy luận về chuỗi, và là
 * phép khó nhất trong cả tính năng tìm kiếm. Người dùng gõ "dinh gia" mà chữ trên màn là
 * "Định giá" — muốn tô đúng bốn ký tự "Định" thì phải biết ký tự thứ mấy của chuỗi ĐÃ BỎ DẤU
 * ứng với ký tự thứ mấy của chuỗi GỐC. Viết trong JSX thì chỉ kiểm được bằng mắt; ở đây kiểm
 * được bằng Node.
 *
 * Luật tô LÀ luật khớp: cả hai đi qua `phraseHits()` của `phrase.ts`, với cùng ngưỡng tiền tố
 * `TIEN_TO_MO_TA` mà `matchFormula` dùng cho mô tả. Tô theo một luật khác thì người dùng thấy một
 * thẻ khớp phụ không có chữ nào được tô, và tưởng máy trả sai (16/10/2026: chủ dự án gặp đúng
 * cảnh ấy với 41 thẻ của "%b", nhưng ở màn Công thức khi đó chưa tô gì cả).
 */

import { normalizeVi, phraseHits, terms } from './phrase';
import { descriptionText, matchFormula, TIEN_TO_MO_TA, type SearchLang } from './search';
import type { FormulaSummary } from './types';

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

/**
 * Vị trí trong chuỗi gốc ngay sau `n` ký tự đã bỏ dấu, đếm từ `start`.
 *
 * Dùng khi từ cuối chỉ khớp phần đầu ("bolli" của "Bollinger"): tô đúng phần đã gõ, như bản cũ.
 */
function sauNKyTu(text: string, start: number, n: number): number {
  let dem = 0;
  let viTri = start;
  for (const char of text.slice(start)) {
    if (dem >= n) break;
    dem += normalizeVi(char).length;
    viTri += char.length;
  }
  return viTri;
}

/**
 * Vị trí các đoạn cần tô trong `text`, theo chỉ số của chính chuỗi gốc.
 *
 * Mỗi đoạn là một lần cụm đã gõ xuất hiện — tô cả cụm, kể cả ký hiệu nằm giữa ("p e" tô trọn
 * "P/E"). Trả về mảng đã sắp, các đoạn không chồng nhau. Chuỗi rỗng hoặc không khớp gì thì trả
 * mảng rỗng — không bao giờ ném lỗi.
 */
export function highlightRanges(text: string, query: string): HighlightRange[] {
  const q = terms(query);
  if (text === '' || q.length === 0) return [];

  const f = terms(text);
  const cuoiQ = q[q.length - 1];
  const ranges: HighlightRange[] = [];

  for (const hit of phraseHits(f, q, TIEN_TO_MO_TA)) {
    const dau = f[hit.from];
    const cuoi = f[hit.to - 1];
    if (dau === undefined || cuoi === undefined || cuoiQ === undefined) continue;
    const end = hit.tron ? cuoi.end : sauNKyTu(text, cuoi.start, cuoiQ.text.length);
    ranges.push({ start: dau.start, end });
  }

  return ranges;
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

/**
 * Mô tả của một KHỚP PHỤ, đã cắt sẵn để tô vàng cụm khớp — `null` khi công thức không phải khớp
 * phụ (khớp chính, hoặc không khớp).
 *
 * Chủ dự án (16/10/2026): công thức khớp tên lên đầu, những thẻ chỉ có cụm liên quan trong mô tả
 * xếp sau và "phải bôi màu vàng nhạt thể hiện đây là câu phụ có liên quan". Vì vậy màu vàng chỉ
 * xuất hiện ở khớp phụ: tô cả thẻ khớp chính thì màu vàng không còn nói được "đây là kết quả phụ".
 */
export function descriptionHitParts(
  formula: FormulaSummary,
  query: string,
  lang: SearchLang,
): HighlightPart[] | null {
  if (matchFormula(formula, query, lang).tier !== 2) return null;
  return highlightParts(descriptionText(formula, lang), query);
}
