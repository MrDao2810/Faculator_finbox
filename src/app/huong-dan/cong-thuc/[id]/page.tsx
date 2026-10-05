import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FORMULA_SUMMARIES } from '@/application';
import { baiHuongDanFor } from '@/application/huong-dan';

import { GuideScreen } from './GuideScreen';

/**
 * Bài "Hướng dẫn sử dụng" của một công thức — WF-21, gói 02/10/2026.
 *
 * Mỗi công thức một trang tĩnh riêng, dựng sẵn toàn bộ chữ (FR-25). Server component, không
 * `'use client'`, nên nội dung bài KHÔNG đi vào gói JS của bất kỳ trang nào — cùng ranh giới mà
 * `page.tsx` của màn chi tiết giữ cho khung "cách tính", ngân hàng câu hỏi và lời giải ví dụ.
 * `build-only-imports.test.ts` gác, `verify-static.mjs` kiểm lại trên bản build thật.
 *
 * `generateStaticParams()` đọc chỉ mục NHẸ `FORMULA_SUMMARIES`, không phải `FORMULAS`: ở đây chỉ
 * cần danh sách id, mà `FORMULAS` kéo theo diễn giải, ví dụ và hàm tính của cả 111 công thức.
 */

/**
 * Ngày tra hằng số thuế & phí — đọc MỘT LẦN lúc build, giống hệt màn chi tiết.
 *
 * Lý do đầy đủ (vì sao không ghim cứng một ngày, vì sao đọc ở tầng PRESENTATION, vì sao lấy giờ
 * Việt Nam chứ không `toISOString()`) nằm ở `src/app/cong-thuc/[id]/page.tsx`. Chép sang đây chứ
 * không tách ra dùng chung: gom vào một module dùng chung là mở đường cho nó lọt vào một client
 * component, và lúc ấy mỗi trình duyệt tự lấy ngày của mình.
 */
const AS_OF = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

export function generateStaticParams(): Array<{ id: string }> {
  return FORMULA_SUMMARIES.map((formula) => ({ id: formula.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const formula = FORMULA_SUMMARIES.find((f) => f.id === id);
  if (formula === undefined) return { title: 'Không tìm thấy công thức' };

  return {
    title: `Hướng dẫn: ${formula.name.vi}`,
    description: `Cần số gì, nạp số thế nào, đọc kết quả ra sao và vì sao ô kết quả có lúc để trống — hướng dẫn dùng ${formula.name.vi}.`,
  };
}

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bai = baiHuongDanFor(id, AS_OF);
  if (bai === undefined) notFound();

  return <GuideScreen bai={bai} />;
}
