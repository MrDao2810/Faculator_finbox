/**
 * Tách DÒNG CHỮ dưới hình công thức thành các đoạn, đánh dấu đoạn nào là điểm chạm của ký hiệu nào
 * — cho khung "cách tính" (17/09/2026).
 *
 * "Tỷ số Sharpe = (Lợi suất bình quân một phiên − …" có cụm "Lợi suất bình quân một phiên" ứng với
 * `\bar{r}_p`. Cụm ấy khai NGUYÊN VĂN trong dữ liệu (`HowToEntry.phrases`), không đoán từ chữ: dòng
 * chữ và bảng ký hiệu gọi cùng một thứ bằng hai cách viết khác nhau, và đoán sai là tô sáng nhầm.
 *
 * Luật:
 * - Khớp theo RANH GIỚI TỪ: trước và sau cụm không được là chữ hay số, để "Số phiên" không khớp vào
 *   giữa "Số phiên trong một năm" của một cụm khác mà người viết không định.
 * - Mọi chỗ xuất hiện của cụm đều thành điểm chạm.
 * - Cụm không có trong dòng chữ, hay cụm của HAI ký hiệu khác nhau chồng lên nhau: ném lỗi. Hàm này
 *   chạy lúc build, nên lỗi làm đỏ `next build` thay vì in ra một dòng chữ tô sáng sai.
 *
 * Hàm thuần, không import gì — ghép các đoạn lại luôn ra đúng dòng chữ ban đầu.
 */

export interface ExpressionSegment {
  text: string;
  /** Số thứ tự dòng bảng ký hiệu mà đoạn này là điểm chạm. Không có nghĩa là chữ thường. */
  sym?: number;
}

export interface ExpressionPhrase {
  sym: number;
  phrase: string;
}

const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;

function isBoundary(text: string, at: number): boolean {
  const char = text[at];
  return char === undefined || !LETTER_OR_DIGIT.test(char);
}

/**
 * Tách dòng chữ NHIỀU DÒNG thành từng dòng, mỗi dòng là một dãy đoạn (18/09/2026).
 *
 * Hình nhiều vế thì dòng chữ nhiều dòng, ngăn bằng `\n` — luật 6 ở `src/core/expression-rules.ts`.
 * Cắt dòng TRƯỚC rồi mới tìm cụm trong từng dòng, nên một cụm không bao giờ vắt qua chỗ ngắt.
 *
 * Phép kiểm "không thấy cụm" phải làm trên TOÀN BỘ các dòng, không phải từng dòng: cụm của Sortino
 * nằm ở dòng một, cụm của RSI nằm ở dòng hai, nên đòi đủ cụm ở mỗi dòng là công thức nào cũng đỏ.
 */
export function segmentExpressionLines(
  text: string,
  phrases: ReadonlyArray<ExpressionPhrase>,
): ExpressionSegment[][] {
  const lines = text.split('\n');
  const thay = new Set<string>();
  const out = lines.map((line) =>
    segmentOne(line, phrases, (phrase) => {
      thay.add(phrase);
    }),
  );

  for (const { phrase } of phrases) {
    if (!thay.has(phrase)) {
      throw new Error(`expression-segments: không thấy cụm "${phrase}" trong dòng chữ "${text}"`);
    }
  }

  return out;
}

export function segmentExpression(
  text: string,
  phrases: ReadonlyArray<ExpressionPhrase>,
): ExpressionSegment[] {
  const thay = new Set<string>();
  const segments = segmentOne(text, phrases, (phrase) => {
    thay.add(phrase);
  });
  for (const { phrase } of phrases) {
    if (!thay.has(phrase)) {
      throw new Error(`expression-segments: không thấy cụm "${phrase}" trong dòng chữ "${text}"`);
    }
  }
  return segments;
}

/** Thân chung: cắt một dòng, báo về cụm nào tìm thấy; KHÔNG ném khi thiếu cụm. */
function segmentOne(
  text: string,
  phrases: ReadonlyArray<ExpressionPhrase>,
  onFound: (phrase: string) => void,
): ExpressionSegment[] {
  const claimed: Array<{ start: number; end: number; sym: number }> = [];

  // Cụm dài trước: một cụm nằm trọn trong cụm dài hơn của CÙNG ký hiệu thì bỏ qua chỗ ấy.
  const ordered = [...phrases].sort((a, b) => b.phrase.length - a.phrase.length);

  for (const { sym, phrase } of ordered) {
    if (phrase.trim() === '')
      throw new Error(`expression-segments: cụm rỗng của dòng ${String(sym)}`);

    let found = 0;
    for (let from = text.indexOf(phrase); from !== -1; from = text.indexOf(phrase, from + 1)) {
      const end = from + phrase.length;
      if (!isBoundary(text, from - 1) || !isBoundary(text, end)) continue;

      const overlap = claimed.find((range) => from < range.end && end > range.start);
      if (overlap !== undefined) {
        if (overlap.sym !== sym) {
          throw new Error(
            `expression-segments: cụm "${phrase}" của dòng ${String(sym)} chồng lên cụm của dòng ${String(overlap.sym)}`,
          );
        }
        found += 1;
        continue;
      }

      claimed.push({ start: from, end, sym });
      found += 1;
    }

    if (found > 0) onFound(phrase);
  }

  claimed.sort((a, b) => a.start - b.start);

  const segments: ExpressionSegment[] = [];
  let cursor = 0;
  for (const range of claimed) {
    if (range.start > cursor) segments.push({ text: text.slice(cursor, range.start) });
    segments.push({ text: text.slice(range.start, range.end), sym: range.sym });
    cursor = range.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });

  return segments;
}
