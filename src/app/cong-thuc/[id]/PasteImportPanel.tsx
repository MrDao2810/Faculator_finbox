'use client';

import dynamic from 'next/dynamic';

import type { PasteImportSheetProps } from '@/ui/sheets/PasteImportSheet';

/**
 * Ranh giới nạp trễ của hộp "Bảng dữ liệu" (dán chuỗi giá) ở màn chi tiết công thức — 28/10/2026.
 *
 * **Bất biến của file này: KHÔNG import gì ngoài `next/dynamic` và kiểu** — cùng khuôn
 * `TickerPickerPanel`, `ChainPanel`, `FormulaChart`, `DetailBody`.
 *
 * Hộp ấy chỉ dựng từ lần mở đầu (`mountedSheets`), nhưng trước đây mã của nó vẫn nạp tĩnh vào MỌI
 * trang chi tiết: `PasteImportSheet` 5,5 kB gzip, bộ đọc dán `paste-import.ts` 3,2 kB, CSS 2 kB
 * chặn render — cho một nút chỉ 35 công thức theo chuỗi giá có, và phần lớn lượt xem không bấm.
 * `/du-lieu/` vẫn nhập tĩnh: ở đó `<dialog>` nằm sẵn trong HTML tĩnh.
 *
 * Import THẲNG file `@/ui/sheets/PasteImportSheet`, không qua barrel `@/ui/sheets`: `FormulaDetail`
 * nhập tĩnh barrel ấy cho ba hộp khác.
 */

const PasteImportSheet = dynamic(
  async () => (await import('@/ui/sheets/PasteImportSheet')).PasteImportSheet,
);

export function PasteImportPanel(props: PasteImportSheetProps) {
  return <PasteImportSheet {...props} />;
}
