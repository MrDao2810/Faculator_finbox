import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FORMULAS, findCategory } from '@/application';

import { FormulaDetail } from './FormulaDetail';
import { latexToMathml } from './latex-html';

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
 * Ngày tra hằng số thuế & phí — đọc MỘT LẦN lúc build, rồi đi vào HTML tĩnh của cả 108 trang.
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
 *
 * Vì sao lấy ngày theo múi giờ Việt Nam chứ không `toISOString()`. Bản trước dùng
 * `new Date().toISOString().slice(0, 10)`, mà `toISOString()` LUÔN trả giờ UTC — chậm 7 tiếng
 * so với giờ Việt Nam. Build rơi vào khung 00:00–06:59 sáng đúng ngày một hằng số có hiệu lực
 * thì `AS_OF` còn là ngày hôm trước, `resolveConstant()` loại bản ghi vừa hiệu lực, và cả đợt
 * deploy chạy bằng luật cũ cho tới lần build sau. Đúng kiểu hỏng im lặng mà đoạn trên nói
 * chuyện bỏ ngày ghim cứng để tránh — chỉ là cửa sổ hẹp hơn nên khó thấy hơn. Hằng số của sản
 * phẩm là văn bản pháp luật Việt Nam, nên ngày tra phải là ngày ở Việt Nam.
 */
const AS_OF = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

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
    description: formula.description.vi,
    keywords: [...formula.tags, formula.name.vi, formula.name.en, category?.name.vi ?? ''].filter(
      (k) => k !== '',
    ),
  };
}

export default async function FormulaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formula = FORMULAS.find((f) => f.id === id);

  // Chỉ xảy ra nếu ai đó gõ tay một id lạ; generateStaticParams đã sinh sẵn đúng 108 trang.
  if (formula === undefined) notFound();

  /*
   * Dựng ký hiệu toán học ở ĐÂY, cùng lý do với `AS_OF` phía trên: file này là server component
   * nên `katex` chỉ chạy trên máy build và không đi vào gói JS của trình duyệt. Xem `latex-html.ts`
   * để biết vì sao chọn nhánh MathML.
   */
  return <FormulaDetail spec={formula} asOf={AS_OF} latexHtml={latexToMathml(formula.latex)} />;
}
