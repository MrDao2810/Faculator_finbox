import { parseViNumber } from '@/application';
import type { QuizChoiceKey, QuizItem } from '@/application';
import { blankAccepts, blanksOf } from '@/application/quiz-math';

/**
 * Luật chấm một câu, tách khỏi phần dựng hình.
 *
 * Tách ra vì từ 24/09/2026 câu đã trả lời còn hiện LẠI ở dải lịch sử phía trên câu đang hỏi: hai
 * chỗ cùng phải biết "câu này đúng chưa" để tô màu, và hai bản sao của cùng một luật chấm là chỗ
 * chắc chắn sẽ lệch. Hàm thuần, không chạm React, nên `cham.test.ts` gọi thẳng được.
 */

/**
 * Đáp án đúng của từng ô trống trong câu điền số, theo thứ tự trái sang phải.
 *
 * Luôn đọc bản `vi`, kể cả khi màn đang hiện bản `en`. Bản `en` viết số theo quy ước Anh (dấu chấm
 * thập phân), mà người học gõ vào ô thì `parseViNumber` đọc theo quy ước Việt — nên chấm theo bản
 * đang hiện sẽ lệch ngay ở con số đầu tiên có phần thập phân. Hai bản buộc phải có cùng số ô theo
 * đúng thứ tự, và `quiz.test.ts` gác điều đó.
 */
export function dapAnCacO(item: QuizItem | undefined): ReadonlyArray<string> {
  return item !== undefined && item.format === 'dien-so' ? blanksOf(item.worked.vi) : [];
}

/**
 * Số người dùng gõ vào một ô, hoặc `null` khi ô trống / gõ dở / gõ rác.
 *
 * `parseViNumber` đọc được cả hai lối viết ('12,5' và '12.5', '92.000' và '92000') và TUYỆT ĐỐI
 * không trả NaN — đúng điều kiện chặn "quy ước dấu thập phân của người Việt" mà WF-19C nêu ra.
 */
export function soDaGoCua(typed: ReadonlyArray<string>, thuTu: number): number | null {
  const chu = typed[thuTu];
  return chu === undefined ? null : parseViNumber(chu);
}

/** Đã trả lời đủ để bấm Kiểm tra chưa. */
export function traLoiDuoc(
  item: QuizItem | undefined,
  picked: ReadonlyArray<QuizChoiceKey>,
  typed: ReadonlyArray<string>,
): boolean {
  if (item === undefined) return false;
  if (item.format !== 'dien-so') return picked.length > 0;

  /* Mọi ô phải có số — điền dở nửa công thức thì chưa có gì để chấm. */
  const dapAn = dapAnCacO(item);
  return dapAn.length > 0 && dapAn.every((_, i) => soDaGoCua(typed, i) !== null);
}

/** Một ô cụ thể đã đặt đúng số liệu chưa. `null` nghĩa là ô chưa có số hợp lệ. */
export function oDungChua(
  item: QuizItem | undefined,
  typed: ReadonlyArray<string>,
  thuTu: number,
): boolean | null {
  const dap = dapAnCacO(item)[thuTu];
  if (dap === undefined) return null;
  const so = soDaGoCua(typed, thuTu);
  return so === null ? null : blankAccepts(dap, so);
}

/**
 * Câu này trả lời đúng chưa.
 *
 * `chon-nhieu` và `dien-so` đều chấm TRỌN GÓI. Với `chon-nhieu` lý do nằm ở docblock Domain. Với
 * `dien-so`, đặt đúng ba trên bốn số liệu nghĩa là vẫn dùng sai công thức ở lần thứ tư — và con số
 * ra được sẽ sai, nên cho điểm từng ô là nói với người học rằng họ "gần đúng" trong khi kết quả
 * thì không gần gì cả.
 */
export function laDungCua(
  item: QuizItem | undefined,
  picked: ReadonlyArray<QuizChoiceKey>,
  typed: ReadonlyArray<string>,
): boolean {
  if (item === undefined || !traLoiDuoc(item, picked, typed)) return false;
  if (item.format === 'dien-so') {
    return dapAnCacO(item).every((_, i) => oDungChua(item, typed, i) === true);
  }
  if (item.format === 'trac-nghiem') return picked[0] === item.answer;
  return picked.length === item.answers.length && item.answers.every((key) => picked.includes(key));
}
