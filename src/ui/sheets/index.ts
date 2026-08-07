/**
 * Bottom sheet — gói WBS 2.5.
 *
 * Ba sheet của WF-10, WF-11 và WF-12, đều dựng trên primitive `BottomSheet`.
 *
 * Bất biến của nhánh này: **file xuất ra luôn mang câu miễn trừ** (FR-24). Nội dung file dựng
 * bằng `buildExportContent()` ở tầng Domain — hàm đó không nhận tham số nào để tắt miễn trừ,
 * nên không có đường nào lách. Cùng cách nghĩ với `ok()` giữ FR-06.
 */

export { PresetSheet } from './PresetSheet';
export type { PresetSheetProps } from './PresetSheet';

export { PasteImportSheet } from './PasteImportSheet';
export type { PasteImportSheetProps } from './PasteImportSheet';

export { ExportSheet } from './ExportSheet';
export type { ExportSheetProps } from './ExportSheet';

export { drawExportCard, downloadCardPng } from './draw-card';
