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

/**
 * Ngày tra hằng số thuế & phí — đọc MỘT LẦN lúc build, rồi đi vào HTML tĩnh của cả 107 trang.
 *
 * Vì sao không viết cứng một ngày. Bản trước ghim `'2026-08-04'`, nên một hằng số khai
 * `effectiveFrom` sau ngày đó sẽ **không bao giờ có hiệu lực**, dựng lại bao nhiêu lần cũng vậy
 * — mà `resolveConstant()` chỉ lấy bản ghi có `effectiveFrom <= asOf`. Biểu thuế thu nhập cá
 * nhân đang có mốc 2026-07-01; mốc kế tiếp sẽ lặng lẽ không vào, và không phép kiểm nào bắt
 * được vì mọi thứ vẫn ra số.
 *
 * Vì sao đọc ở ĐÂY chứ không ở tầng Domain. NFR-REL-03 cấm Domain tự lấy ngày hệ thống, và lệnh
 * cấm đó vẫn nguyên: `resolveConstant()` vẫn bắt buộc nhận `asOf`. Chỗ này là tầng
 * PRESENTATION, và với `output: 'export'` thì nó chạy đúng một lần trên máy build — giá trị
 * được nướng vào HTML, nên mọi người dùng thấy cùng một ngày và không có chuyện lệch hydration.
 *
 * `page.tsx` là server component, không có `'use client'`, nên phạm vi module này KHÔNG đi vào
 * gói JS máy khách. Nếu có ngày chuyển hằng số này sang một file dùng chung, phải giữ nguyên
 * tính chất đó — để nó lọt vào một client component là mỗi trình duyệt tự lấy ngày của mình.
 */
const AS_OF = new Date().toISOString().slice(0, 10);

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
