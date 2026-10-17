'use client';

import { descriptionHitParts } from '@/application';
import type { FormulaSummary } from '@/application';
import { usePick, usePreferences } from '@/application/preferences-context';

import { HighlightMarks } from './Highlight';

export interface DescriptionHitProps {
  formula: FormulaSummary;
  /** Chuỗi đang tìm. Rỗng thì mô tả hiện nguyên. */
  query: string;
}

/**
 * Mô tả của một thẻ trong kết quả tìm: KHỚP PHỤ thì tô vàng cụm đã khớp, còn lại hiện nguyên.
 *
 * Chủ dự án (16/10/2026): công thức khớp tên lên đầu, sau đó những công thức có cụm liên quan
 * trong mô tả, và cụm ấy "phải bôi màu vàng nhạt thể hiện đây là câu phụ có liên quan". Màu vàng
 * chỉ ở khớp phụ: khớp chính không tô gì, nên nhìn là biết thẻ nào có mặt nhờ mô tả.
 *
 * Là lá client vì phải biết ngôn ngữ đang hiện: khớp phụ dò đúng mô tả người dùng đang đọc. Thẻ
 * công thức (`FormulaCard`) được dựng cả ở server, nên nó chỉ gắn lá này khi có chuỗi tìm.
 */
export function DescriptionHit({ formula, query }: DescriptionHitProps) {
  const { locale } = usePreferences();
  const pick = usePick();
  const parts = query.trim() === '' ? null : descriptionHitParts(formula, query, locale);
  return parts === null ? pick(formula.description) : <HighlightMarks parts={parts} />;
}
