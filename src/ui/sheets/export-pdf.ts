/**
 * Xuất file PDF của màn chi tiết — một cú bấm, không qua sheet nào (17/11/2026).
 *
 * Sheet "Xuất kết quả" (hai công tắc "Kèm biểu đồ", "Kèm bảng biến & giải thích" và nút "Xuất PDF")
 * bị chủ dự án bỏ ngay sau khi PDF thành file thật: _"phần tải về bây giờ ko cần cái này nữa. bấm
 * tải về thì tự động trả về pdf luôn"_. File nay luôn mang đủ: biểu đồ khi màn đang vẽ một hình, bảng
 * biến và giải thích cho người mới luôn có.
 *
 * Hàm này chỉ là cửa nạp trễ: bộ dựng thật (`./pdf/xuat-pdf`, kéo theo pdf-lib, fontkit và bộ dựng nội
 * dung) đi bằng `import()` trần, nên không vào First Load JS của trang nào dù barrel `@/ui/sheets` xuất
 * hàm này (NFR-PER-04). `import type` bị xoá lúc biên dịch, không kéo gì theo.
 */
import type { XuatPdfArgs } from './pdf/xuat-pdf';

export type ExportPdfArgs = XuatPdfArgs;

export async function exportPdf(args: ExportPdfArgs): Promise<void> {
  const { xuatPdf } = await import('./pdf/xuat-pdf');
  await xuatPdf(args);
}
