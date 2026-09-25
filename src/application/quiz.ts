/**
 * Tầng APPLICATION — lối vào ngân hàng câu hỏi, CHỈ dành cho lúc build (23/09/2026).
 *
 * Cùng khuôn và cùng lý do với `how-to.ts`: 206 câu hỏi là khoảng 150 kB chữ, mà mỗi trang chi
 * tiết chỉ cần 1–5 câu của chính nó. Xuất qua barrel `@/application` là đẩy cả ngân hàng vào gói
 * JS của 111 trang. `page.tsx` (server component) đọc ở đây, cắt phần của công thức đang dựng,
 * rồi truyền xuống bằng prop.
 *
 * Nơi được import file này: `src/app/cong-thuc/[id]/quiz-view.ts` và ca kiểm.
 * `build-only-imports.test.ts` gác danh sách đó.
 */

export type {
  QuizChoiceKey,
  QuizEvidence,
  QuizItem,
  QuizKind,
  QuizSource,
  QuizSourceKind,
  QuizText,
} from '@/core/quiz';
export { QUIZ_CHOICE_KEYS, QUIZ_ITEMS, quizCoverage, quizFor } from '@/core/quiz';
