'use client';

import dynamic from 'next/dynamic';

import type { TickerPickerSheetProps } from '@/ui/sheets/TickerPickerSheet';

/**
 * Ranh giới nạp trễ của sheet chọn mã ở màn chi tiết công thức.
 *
 * **Bất biến của file này: KHÔNG import gì ngoài `next/dynamic` và kiểu** (kiểu bị xoá lúc biên
 * dịch) — cùng khuôn `ChainPanel`, `FormulaChart`, `DetailBody`.
 *
 * Vì sao cần một lớp bọc thay vì `import { TickerPickerSheet } from '@/ui/sheets'`: sheet ấy kéo
 * theo `useTickerList` và cả đường gọi `MARKET_FEED.listTickers()` (~1.649 mã). Đưa nó vào gói
 * chung là bắt **cả 111 trang chi tiết** gánh phần gọi mạng để phục vụ một nút mà phần lớn lượt
 * mở trang không bấm — đúng cái giá đã đo ở `live-preset-loader.ts` (+4 kB cho toàn bộ 111
 * trang), trong khi nhóm trang này đang vượt cửa kiểm dung lượng xa nhất.
 *
 * Import THẲNG file `@/ui/sheets/TickerPickerSheet`, không qua barrel `@/ui/sheets`: barrel đó
 * đã bị `FormulaDetail` import tĩnh cho ba sheet khác, nên đi vòng qua nó là mở đường cho gói
 * chung nuốt luôn phần vừa tách ra.
 */

const TickerPickerSheet = dynamic(
  async () => (await import('@/ui/sheets/TickerPickerSheet')).TickerPickerSheet,
);

export type TickerPickerPanelProps = TickerPickerSheetProps;

export function TickerPickerPanel(props: TickerPickerPanelProps) {
  return <TickerPickerSheet {...props} />;
}
