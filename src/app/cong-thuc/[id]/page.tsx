import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FORMULAS, findCategory } from '@/application';

import { FormulaDetail } from './FormulaDetail';

/**
 * Màn WF-03 Chi tiết công thức — gói WBS 3.2.1.
 *
 * Route động này từng phải gỡ ra ở đợt 2: với `output: 'export'`, Next từ chối build một
 * route động mà `generateStaticParams()` trả về mảng rỗng, mà lúc đó Registry chưa có công
 * thức nào. Giờ Registry đã có 21 công thức nên route dựng được — đây là việc chặn số 1
 * của đợt 2 được gỡ.
 *
 * Mỗi công thức một trang tĩnh riêng với tiêu đề và mô tả riêng, đúng FR-25.
 */

/** Ngày tra hằng số thuế & phí, chốt lúc build. Domain không tự lấy ngày hệ thống (NFR-REL-03). */
const AS_OF = '2026-08-04';

export function generateStaticParams(): Array<{ id: string }> {
  return FORMULAS.map((formula) => ({ id: formula.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const formula = FORMULAS.find((f) => f.id === id);
  if (formula === undefined) return { title: 'Không tìm thấy công thức' };

  const category = findCategory(formula.categoryId);

  return {
    title: formula.name.vi,
    description: formula.description,
    keywords: [...formula.tags, formula.name.vi, formula.name.en, category?.name ?? ''].filter(
      (k) => k !== '',
    ),
  };
}

export default async function FormulaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formula = FORMULAS.find((f) => f.id === id);

  // Chỉ xảy ra nếu ai đó gõ tay một id lạ; generateStaticParams đã sinh sẵn đúng 21 trang.
  if (formula === undefined) notFound();

  return <FormulaDetail spec={formula} asOf={AS_OF} />;
}
