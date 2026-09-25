'use client';

import dynamic from 'next/dynamic';

import type { QuizBodyProps } from './QuizBody';

/**
 * Ranh giới nạp trễ của khối Kiểm tra hiểu bài.
 *
 * **Bất biến: KHÔNG import gì ngoài `next/dynamic` và kiểu** (kiểu bị xoá lúc biên dịch). Khuôn
 * bám đúng `ChainPanel.tsx` và `FormulaChart.tsx`.
 *
 * Bản thân 206 câu hỏi KHÔNG đi qua đây — `page.tsx` cắt sẵn phần của từng công thức lúc build
 * rồi truyền xuống bằng prop, nên mỗi trang chỉ mang 1–5 câu của chính nó. Thứ nạp trễ ở đây là
 * phần giao diện: khối chỉ dựng khi người dùng cuộn tới cuối trang và bấm bắt đầu, mà `npm run
 * size` thì vốn đã đỏ sẵn — không việc gì gánh thêm cho lượt tải đầu.
 */

const QuizBody = dynamic(async () => (await import('./QuizBody')).QuizBody);

export type QuizPanelProps = QuizBodyProps;

export function QuizPanel(props: QuizPanelProps) {
  return <QuizBody {...props} />;
}
