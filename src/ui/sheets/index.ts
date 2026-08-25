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

export { TickerPickerSheet } from './TickerPickerSheet';
export type { TickerPickerSheetProps } from './TickerPickerSheet';

export { FormulaForTickerSheet } from './FormulaForTickerSheet';
export type { FormulaForTickerSheetProps } from './FormulaForTickerSheet';

export { PasteImportSheet } from './PasteImportSheet';
export type { PasteImportSheetProps } from './PasteImportSheet';

export { ExportSheet } from './ExportSheet';
export type { ExportSheetProps } from './ExportSheet';

export { SaveCalcSheet } from './SaveCalcSheet';
export type { SaveCalcSheetProps } from './SaveCalcSheet';

/*
 * `draw-card` KHÔNG re-export ở đây có chủ đích.
 *
 * `ExportSheet` nạp nó bằng `import()` trong lúc bấm nút, để mã vẽ Canvas rời khỏi gói cơ sở của
 * 111 trang chi tiết. Một dòng `export … from './draw-card'` ở barrel này kéo nó về chỗ cũ ngay,
 * vì mọi màn chi tiết đều `import { ExportSheet } from '@/ui/sheets'`. Không ai ngoài `ExportSheet`
 * cần tới nó.
 */
