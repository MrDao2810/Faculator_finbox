/**
 * Bottom sheet — gói WBS 2.5.
 *
 * Ba sheet của WF-10, WF-11 và WF-12, đều dựng trên primitive `BottomSheet`.
 *
 * Bất biến của nhánh này: **file xuất ra luôn mang câu miễn trừ** (FR-24). Nội dung file dựng
 * bằng `buildExportDocument()` ở tầng Domain — hàm đó không nhận tham số nào để tắt miễn trừ,
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
export { beNgangTenCot } from './ten-cot';

// Sheet "Xuất kết quả" đã bỏ (17/11/2026): nút Export của màn chi tiết xuất PDF ngay.
export { exportPdf } from './export-pdf';
export type { ExportPdfArgs } from './export-pdf';

export { SaveCalcSheet } from './SaveCalcSheet';
export type { SaveCalcSheetProps } from './SaveCalcSheet';

/*
 * Bộ dựng PDF (`./pdf/`) KHÔNG re-export ở đây có chủ đích.
 *
 * `exportPdf()` nạp nó bằng `import()` trong lúc bấm nút, để pdf-lib, fontkit và bộ dựng nội dung
 * rời khỏi gói cơ sở của 111 trang chi tiết. Một dòng `export … from './pdf/…'` ở barrel này kéo
 * chúng về ngay, vì mọi màn chi tiết đều import từ `@/ui/sheets`.
 */
