import type { QuizGan } from '../quiz/types';
import type { Bilingual } from '../types';

/**
 * Lời giải có cấu trúc của khối "Ví dụ thực tế" — cùng hình với lời giải của khối Bài tập.
 *
 * Chủ dự án 29/09/2026, đặt hai ảnh chụp cạnh nhau (khối Ví dụ viết thành đoạn văn, khối Bài tập
 * viết thành từng dòng): "điều chỉnh lại cách giải thích cho phần Ví dụ thực tế cho giống với cách
 * giải thích trong phần bài tập. thêm nữa nguồn của phần ví dụ thực tế nên đưa về kiểu link để người
 * dùng click vào về trang nguồn". Nên khối Ví dụ in đúng các dòng của lời giải bài tập:
 *
 *   Công thức áp dụng   <hình công thức của trang>  để tính <tinh>
 *   Thay số             P  là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫     ← `gan`
 *   Áp vào công thức    72.700 ÷ 5.867                                        ← `thaySo`
 *   Kết quả             12,39 lần                                             ← `spec.example.expected`
 *   Đọc kết quả         <spec.example.note>
 *   Nguồn               cafef.vn/… · fpt.com.vn/…                             ← `nguon`
 *
 * ── Vì sao KHÔNG nằm trong `FormulaSpec.example` ────────────────────────────────────────────────
 *
 * `FormulaDetail` import cả Registry, nên mọi thứ trong `spec` đi vào gói JS của CẢ 111 trang —
 * `spec.symbols` từng đẩy 185 lên 198 kB. Lời giải này là chữ mà mỗi trang chỉ cần phần của chính
 * nó, nên nó theo đúng khuôn khung "cách tính" (`src/core/how-to/`) và bộ câu hỏi: chỉ `page.tsx`
 * đọc lúc build qua `@/application/vi-du`, rồi truyền xuống bằng prop. `build-only-imports.test.ts`
 * gác danh sách nơi được import.
 *
 * Số liệu thì KHÔNG chép sang đây: bộ số, kết quả, câu diễn giải và tên nguồn vẫn ở
 * `spec.example` — đó là nguồn sự thật mà `formulas.test.ts` đối chiếu với `calc`. File này chỉ
 * thêm phần TRÌNH BÀY số ấy: ký hiệu nào nhận số nào, phép tính trông ra sao, link nguồn ở đâu.
 */
export interface ViDuGiai {
  /** Đuôi "để tính …" của dòng công thức. Cụm danh từ, không gạch ngang dài. */
  tinh: Bilingual;
  /**
   * Dòng "Thay số": ký hiệu nào của hình nhận con số nào — cùng kiểu, cùng luật với
   * `QuizGiai.gan` (xem docblock `QuizGan`): mỗi ký hiệu MỘT dòng, đúng một trong `giaTri`/`moTa`,
   * câu `moTa` viết cụ thể cho chính ví dụ này ("là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫"),
   * không lặp lại nghĩa tổng quát của bảng ký hiệu. Ở đây bản `en` là BẮT BUỘC.
   */
  gan: ReadonlyArray<QuizGan>;
  /**
   * Dòng "Áp vào công thức": các con số của ví dụ đặt vào đúng hình công thức, viết kiểu Việt
   * (`72.700 ÷ 5.867`); bản `en` viết liền không dấu ngăn nghìn (`72700 ÷ 5867`). Tính lại phải ra
   * đúng kết quả `calc` trả cho bộ số của ví dụ — `viDuProblems()` kiểm bằng `evaluateWorked`.
   *
   * Công thức ăn chuỗi giá không dàn hết 20–57 giá ra đây: dòng `gan` tả cửa sổ phiên bằng lời, còn
   * dòng này dùng các đại lượng tổng (tổng giá, trung bình tăng/giảm…) mà `calc` tính ra.
   *
   * VẮNG chỉ khi hình công thức không có phép tính nào để đặt số vào — đúng một công thức,
   * `chuoi-phien-giam-dai-nhat` (đếm rồi lấy lớn nhất), ghim trong `KHONG_CO_PHEP_TINH` ở `kiem.ts`.
   * Viết "4" vào đây chỉ lặp lại dòng Kết quả ngay bên dưới.
   */
  thaySo?: Bilingual;
  /**
   * Con số dòng "Áp vào công thức" phải ra khi hình là PHƯƠNG TRÌNH ẨN — kết quả của ví dụ là nghiệm
   * phải dò, không phải vế được tính thẳng. XIRR: đặt nghiệm vào tổng các dòng tiền quy về hôm nay thì
   * ra ≈ 0 ₫. IRR niên kim: đặt IRR vào vế phải của `P = C × (1 − (1 + IRR)^−n) ÷ IRR` thì ra đúng khoản
   * vay P. Giữ đúng hình của trang thay vì chuyển vế — chuyển vế là vẽ một công thức khác.
   *
   * Giao diện in "… ≈ <con số này> <donVi>" cuối dòng. Chỉ các id trong `PHUONG_TRINH_AN` ở `kiem.ts`
   * được khai: cửa này mở cho một dòng tính KHÔNG ra kết quả, nên không được dùng tuỳ tiện.
   */
  thaySoRa?: { giaTri: number; donVi: string };
  /**
   * Link tới trang nguồn chứa ĐÚNG con số của ví dụ — thứ người đọc bấm vào để đối chiếu. Ví dụ ghép
   * hai nguồn (giá phiên lấy ở một nơi, EPS lấy ở báo cáo tài chính) thì hai link, mỗi link một
   * `nhan` nói nó cho con số nào. Giá phiên trỏ tới trang có ghim ngày (lịch sử giá CafeF theo khoảng
   * ngày), không trỏ trang "mới nhất" — trang ấy trôi mất phiên của ví dụ sau vài tuần.
   *
   * Mảng RỖNG được phép nhưng bị đếm và ghim trong ca kiểm: không tìm được trang nào chứa đúng con
   * số thì để trống và dòng Nguồn chỉ in tên nguồn — bịa một link là tệ hơn không có link.
   */
  nguon: ReadonlyArray<ViDuNguon>;
}

export interface ViDuNguon {
  /** Đường dẫn đầy đủ, https. */
  url: string;
  /** Link này cho con số nào — bắt buộc khi có từ hai link trở lên. */
  nhan?: Bilingual;
}
