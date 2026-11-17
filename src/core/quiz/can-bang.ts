/**
 * Tầng DOMAIN — luật "bốn phương án không tự lộ đáp án" của câu lý thuyết (16/11/2026).
 *
 * Chủ dự án: _"tất cả các câu hỏi lý thuyết đang quá dễ chọn đáp án đúng, cứ chọn đáp án dài là
 * đúng"_. Đo lúc ấy trên 305 câu một đáp án: 246 câu (81%) có đáp án đúng dài nhất hẳn, trong khi
 * chia ngẫu nhiên thì chỉ khoảng 25%; tính trung bình đáp án đúng dài gấp 2,6 lần phương án sai, và
 * 95 câu chỉ riêng đáp án đúng có thêm lời giải sau " - " (ROI: "Thời gian nắm giữ - ROI không chứa
 * yếu tố thời gian" đứng cạnh "Ngành nghề"). Ở 10 trong 18 câu chọn nhiều, mọi đáp án đúng đều dài
 * hơn mọi phương án sai. Người làm bài không cần hiểu công thức, chỉ cần chọn câu dài nhất.
 *
 * Cách chữa: lời giải về hộp giải thích (vốn đã có), đáp án đúng gọn lại; phương án sai viết thành
 * một ngộ nhận có thật, cùng dạng câu và độ dài xấp xỉ. Hàm dưới là luật máy thấy được, chạy cho
 * từng câu (`canBangProblems`) và cho cả ngân hàng (`tyLeDaiNhat`); `quiz.test.ts` gác cả hai. Luật
 * không thấy được chuyện phương án sai có còn SAI theo nguồn hay không: phải đọc tay.
 */

import type { QuizChoiceKey, QuizItem } from './types';
import { QUIZ_CHOICE_KEYS } from './types';

/** Đáp án đúng dài tối đa bấy nhiêu lần phương án sai DÀI NHẤT. */
export const TRAN_SO_VOI_DAI_NHAT = 1.15;
/** … và bấy nhiêu lần độ dài TRUNG BÌNH của ba phương án sai. */
export const TRAN_SO_VOI_TRUNG_BINH = 1.35;
/** Phương án ngắn nhất không được ngắn hơn bấy nhiêu phần đáp án đúng ("Phải" cạnh một câu dài). */
export const SAN_NGAN_NHAT = 0.5;
/** Câu chọn nhiều: trung bình đáp án đúng tối đa bấy nhiêu lần trung bình phương án sai. */
export const TRAN_CHON_NHIEU = 1.3;

/** Có lời giải kèm theo sau " - " hoặc ": " — dạng "Chờ - trên 80 vừa là quá mua…". */
const CO_LOI_GIAI = / - |: /;

function doDai(s: string): number {
  return [...s.trim()].length;
}

function trungBinh(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function dapAnDung(item: QuizItem): ReadonlyArray<QuizChoiceKey> {
  if (item.format === 'trac-nghiem') return [item.answer];
  if (item.format === 'chon-nhieu') return item.answers;
  return [];
}

function loiMotNgonNgu(
  item: QuizItem & { choices: Readonly<Record<QuizChoiceKey, { vi: string; en?: string }>> },
  lang: 'vi' | 'en',
): string[] {
  const chu = (k: QuizChoiceKey) => item.choices[k][lang];
  if (QUIZ_CHOICE_KEYS.some((k) => chu(k) === undefined)) return [];
  const dung = dapAnDung(item);
  const sai = QUIZ_CHOICE_KEYS.filter((k) => !dung.includes(k));
  const L = (k: QuizChoiceKey) => doDai(chu(k)!);
  const loi: string[] = [];

  if (item.format === 'trac-nghiem') {
    const a = L(item.answer);
    const maxSai = Math.max(...sai.map(L));
    const tbSai = trungBinh(sai.map(L));
    if (a > maxSai * TRAN_SO_VOI_DAI_NHAT) {
      loi.push(
        `${lang}: đáp án đúng ${a} ký tự, dài hơn phương án sai dài nhất (${maxSai}) quá ${TRAN_SO_VOI_DAI_NHAT} lần`,
      );
    }
    if (a > tbSai * TRAN_SO_VOI_TRUNG_BINH) {
      loi.push(
        `${lang}: đáp án đúng ${a} ký tự, gấp hơn ${TRAN_SO_VOI_TRUNG_BINH} lần trung bình phương án sai (${tbSai.toFixed(0)})`,
      );
    }
    const ngan = Math.min(...sai.map(L));
    if (ngan < a * SAN_NGAN_NHAT) {
      loi.push(
        `${lang}: có phương án sai chỉ ${ngan} ký tự, chưa bằng ${SAN_NGAN_NHAT} lần đáp án đúng (${a})`,
      );
    }
    if (
      CO_LOI_GIAI.test(chu(item.answer)!) &&
      sai.filter((k) => CO_LOI_GIAI.test(chu(k)!)).length < 2
    ) {
      loi.push(
        `${lang}: đáp án đúng kèm lời giải sau " - " hoặc ": " mà ít hơn hai phương án sai có dạng ấy`,
      );
    }
  } else if (item.format === 'chon-nhieu') {
    const lDung = dung.map(L);
    const lSai = sai.map(L);
    if (Math.min(...lDung) > Math.max(...lSai)) {
      loi.push(`${lang}: mọi đáp án đúng đều dài hơn mọi phương án sai`);
    }
    if (trungBinh(lDung) > trungBinh(lSai) * TRAN_CHON_NHIEU) {
      loi.push(
        `${lang}: trung bình đáp án đúng gấp hơn ${TRAN_CHON_NHIEU} lần trung bình phương án sai`,
      );
    }
    const coGiaiDung = dung.filter((k) => CO_LOI_GIAI.test(chu(k)!)).length;
    const coGiaiSai = sai.filter((k) => CO_LOI_GIAI.test(chu(k)!)).length;
    if (coGiaiDung === dung.length && coGiaiSai === 0) {
      loi.push(`${lang}: chỉ đáp án đúng kèm lời giải sau " - " hoặc ": "`);
    }
  }
  return loi;
}

/** Các lỗi "độ dài lộ đáp án" của một câu; rỗng là đạt. Câu điền số không có phương án nên luôn rỗng. */
export function canBangProblems(item: QuizItem): string[] {
  if (item.format === 'dien-so') return [];
  return [...loiMotNgonNgu(item, 'vi'), ...loiMotNgonNgu(item, 'en')];
}

/**
 * Tỷ lệ câu một đáp án mà đáp án đúng dài nhất HẲN (vi) — và ngắn nhất hẳn, để không chữa lệch
 * thành lệch ngược (đáp án đúng luôn ngắn nhất cũng là một mẹo đoán).
 */
export function tyLeDaiNhat(items: ReadonlyArray<QuizItem>): { daiNhat: number; nganNhat: number } {
  const tn = items.filter((i) => i.format === 'trac-nghiem');
  let dai = 0;
  let ngan = 0;
  for (const item of tn) {
    const a = doDai(item.choices[item.answer].vi);
    const sai = QUIZ_CHOICE_KEYS.filter((k) => k !== item.answer).map((k) =>
      doDai(item.choices[k].vi),
    );
    if (a > Math.max(...sai)) dai++;
    if (a < Math.min(...sai)) ngan++;
  }
  return { daiNhat: dai / tn.length, nganNhat: ngan / tn.length };
}
