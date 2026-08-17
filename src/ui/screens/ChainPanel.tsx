'use client';

import dynamic from 'next/dynamic';

import type { ChainBodyProps } from './ChainBody';

/**
 * Ranh giới nạp trễ của khối chuỗi công thức — gói WBS 3.2.2 (WF-04).
 *
 * **Bất biến của file này: KHÔNG import gì ngoài `next/dynamic` và kiểu** (kiểu bị xoá lúc biên
 * dịch). Một dòng import thật vào `./ChainBody` là kéo `LinkedInput`, `FlowChainStrip` và cả
 * `InlineWarning` vào chunk chung của **cả 108 trang chi tiết**, trong khi đúng **7 công thức**
 * dùng tới nó (`capm`, `wacc`, `mo-hinh-gordon`, `bien-an-toan`, `fcff`, `fcfe`,
 * `gia-tri-noi-tai-fcff`) và chỉ khi người dùng bật chế độ Nâng cao.
 *
 * Khuôn bám đúng `FormulaChart.tsx` và `DetailBody.tsx` — hai tiền lệ đã đo trên bản build thật.
 * Cũng như ở đó: `next/dynamic` không giấu chi phí khỏi trang THẬT SỰ dựng nó, nó chỉ giữ chi phí
 * khỏi những trang không dùng. Dư địa của cửa kiểm 170 kB đo ở mốc 108 công thức là **13,1 kB**
 * (trang nặng nhất 156,9 kB), nên khoản đó đáng giữ.
 */

const ChainBody = dynamic(async () => (await import('./ChainBody')).ChainBody);

export type ChainPanelProps = ChainBodyProps;

export function ChainPanel(props: ChainPanelProps) {
  return <ChainBody {...props} />;
}
