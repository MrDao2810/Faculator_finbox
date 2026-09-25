/**
 * Barrel của khối Kiểm tra hiểu bài.
 *
 * Chỉ xuất `QuizPanel` — ranh giới nạp trễ. KHÔNG xuất `QuizBody` ở đây: xuất thẳng là mọi trang
 * chi tiết gánh chi phí của nó ngay lượt tải đầu, đúng cái bẫy mà `ChainPanel` đã ghi lại.
 */

export type { QuizPanelProps } from './QuizPanel';
export { QuizPanel } from './QuizPanel';
