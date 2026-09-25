/**
 * Tách lời giải thích thành đoạn thường và đoạn TRÍCH NGUYÊN VĂN (giữa cặp “…”).
 *
 * Câu trích của nguồn nằm ngay trong `explain` chứ không phải một trường riêng — lý do đầy đủ ở
 * docblock `QuizSource`. Giao diện vẫn phải tô riêng nó ra, nếu không thì trích dẫn chìm vào lời
 * người viết và khối nguồn của WF-19D · S14 mất đúng tác dụng của nó.
 *
 * Hàm thuần, không đụng DOM, nên ca kiểm chạy trong Node.
 */

export interface QuotePart {
  text: string;
  /** Đoạn này có nằm trong ngoặc kép ở nguồn không. */
  quoted: boolean;
}

const MO = '“';
const DONG = '”';

export function quoteParts(text: string): ReadonlyArray<QuotePart> {
  const parts: QuotePart[] = [];
  let i = 0;

  while (i < text.length) {
    const mo = text.indexOf(MO, i);
    // Không còn ngoặc mở, hoặc mở mà không có đóng: phần còn lại là chữ thường.
    const dong = mo === -1 ? -1 : text.indexOf(DONG, mo + 1);
    if (mo === -1 || dong === -1) {
      if (i < text.length) parts.push({ text: text.slice(i), quoted: false });
      break;
    }

    if (mo > i) parts.push({ text: text.slice(i, mo), quoted: false });
    parts.push({ text: text.slice(mo + 1, dong), quoted: true });
    i = dong + 1;
  }

  return parts.filter((part) => part.text !== '');
}
