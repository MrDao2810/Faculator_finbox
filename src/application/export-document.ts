/**
 * Cửa riêng tới bộ dựng nội dung file PDF (17/11/2026).
 *
 * Không đi qua barrel `@/application`: `buildExportDocument()` kéo theo `formulas/personal.ts`,
 * `formulas/fees.ts` và bộ đọc dòng điền số. Chỉ `src/ui/sheets/pdf/` — chunk nạp bằng `import()` trần
 * lúc bấm "Xuất PDF" — được nhập file này, nên chừng ấy mã không vào First Load JS của trang nào.
 */
export { buildExportDocument, dongDeBai, exportFileName, O_TRONG_IN } from '@/core/export-content';
export { latexThanhChu } from '@/core/latex-chu';
