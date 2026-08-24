'use client';

import dynamic from 'next/dynamic';

import type { ChainBodyProps } from './ChainBody';

/**
 * Ranh giới nạp trễ của khối chuỗi công thức — gói WBS 3.2.2 (WF-04).
 *
 * **Bất biến của file này: KHÔNG import gì ngoài `next/dynamic` và kiểu** (kiểu bị xoá lúc biên
 * dịch). Một dòng import thật vào `./ChainBody` là kéo `LinkedInput`, `FlowChainStrip` và cả
 * `InlineWarning` vào chunk chung của **cả 111 trang chi tiết**, trong khi đúng **7 công thức**
 * dùng tới nó (`capm`, `wacc`, `mo-hinh-gordon`, `bien-an-toan`, `fcff`, `fcfe`,
 * `gia-tri-noi-tai-fcff`) và chỉ khi người dùng bật chế độ Nâng cao.
 *
 * Khuôn bám đúng `FormulaChart.tsx` và `DetailBody.tsx` — hai tiền lệ đã đo trên bản build thật.
 * Cũng như ở đó: `next/dynamic` không giấu chi phí khỏi trang THẬT SỰ dựng nó, nó chỉ giữ chi phí
 * khỏi những trang không dùng. `scripts/size-report.mjs` từng đo sai (bug đối chiếu `%5Bid%5D`
 * với `[id]`, đã vá — xem `TASK.md`): số liệu "170 kB / dư 13,1 kB" từng ghi ở đây đã lỗi thời và
 * không còn đáng tin — số đo thật hiện tại là mọi trang chi tiết đều vượt xa cả cửa kiểm CI lẫn
 * ngân sách NFR-PER-04. Dù vậy khoản lazy-load này vẫn đáng giữ: gánh thêm `LinkedInput` +
 * `FlowChainStrip` + `InlineWarning` vào TOÀN BỘ 111 trang thay vì chỉ 7 trang cần chúng chỉ làm
 * vấn đề đã có thêm nặng, không giúp gì.
 */

const ChainBody = dynamic(async () => (await import('./ChainBody')).ChainBody);

export type ChainPanelProps = ChainBodyProps;

export function ChainPanel(props: ChainPanelProps) {
  return <ChainBody {...props} />;
}
