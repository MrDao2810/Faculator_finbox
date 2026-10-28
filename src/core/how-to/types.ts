/**
 * Tầng DOMAIN — kiểu dữ liệu của khung "cách tính" trên thẻ Công thức (17/09/2026).
 *
 * Chủ dự án chỉ vào thẻ của Tỷ số Sharpe: người dùng không biết "Lợi suất bình quân một phiên" hay
 * "Độ lệch chuẩn lợi suất phiên" tính thế nào. Rê chuột (PC) hoặc chạm (điện thoại) vào ký hiệu
 * trong hình, cụm chữ ở dòng chữ, hay dòng của bảng ký hiệu thì hiện cách tính phần ấy.
 *
 * ── Vì sao dữ liệu này KHÔNG nằm trong `FormulaSpec` ───────────────────────────────────────────
 *
 * `FormulaDetail` là client component import trọn `FORMULA_MODULES`, nên mọi byte trong spec đi vào
 * gói JS của CẢ 111 trang chi tiết — thêm `spec.symbols` từng đẩy route chi tiết từ 185 lên 198 kB.
 * Khung cách tính chỉ cần đúng trang của nó, và chỉ cần lúc build: `page.tsx` (server component)
 * đọc nó qua `@/application/how-to`, dựng sẵn MathML rồi truyền xuống bằng prop. Không file nào
 * trong gói máy khách được import thư mục này — `build-only-imports.test.ts` gác điều đó.
 *
 * ── Ba loại khung, và dòng nào KHÔNG có khung ──────────────────────────────────────────────────
 *
 * Mỗi dòng bảng ký hiệu thuộc đúng MỘT chỗ: một khung trong `entries`, hoặc một lý do trong
 * `skipped`. Phân loại theo việc `calc` làm, không theo chữ cái — `i` là lãi năm ÷ 12 ở trả góp,
 * `n` là số năm × 12, nên cả hai là đại lượng phải tính dù trông như chỉ số chạy.
 */

import type { Bilingual } from '../types';

/**
 * Một bước của khung: một hình KaTeX nhỏ và dòng chữ đọc hình ấy thành lời.
 *
 * `expression` chịu đúng luật của `FormulaSpec.expression` (`expression-rules.ts`): có dấu bằng,
 * không sót LaTeX, không gạch ngang, cùng tập hằng số với `latex`.
 */
export interface HowToStep {
  latex: string;
  expression: Bilingual;
}

/**
 * Cụm chữ trong `FormulaSpec.expression` ứng với ký hiệu — chép NGUYÊN VĂN, từng ngôn ngữ.
 *
 * Mỗi cụm thành một điểm chạm ở dòng chữ. Có ở ngôn ngữ này thì phải có ở ngôn ngữ kia: người
 * dùng đổi ngôn ngữ không được mất điểm chạm.
 */
export interface HowToPhrases {
  vi: ReadonlyArray<string>;
  en: ReadonlyArray<string>;
}

interface HowToBase {
  /** Chép nguyên văn `SymbolNote.latex` của dòng bảng ký hiệu mà khung này thuộc về. */
  symbol: string;
  phrases?: HowToPhrases;
}

/**
 * Đại lượng `calc` TỰ TÍNH trước khi thay vào hình: lợi suất, trung bình, độ lệch chuẩn, SMA/EMA,
 * lãi một phiên hay một tháng, số kỳ.
 */
export interface DerivedHowTo extends HowToBase {
  kind: 'derived';
  /** 1–3 bước, bước cuối bắt đầu bằng chính `symbol` rồi dấu bằng. */
  steps: ReadonlyArray<HowToStep>;
  /**
   * Mẩu mã PHẢI có trong khối `FormulaModule` của công thức (hoặc trong hàm cục bộ khối ấy gọi):
   * tên hàm phụ (`'sampleStdDev('`) hay phép tính viết tại chỗ (`'/ 12'`).
   *
   * Đây là sợi dây buộc chữ vào mã: sách viết độ lệch chuẩn phần giảm chia cho số phiên lỗ, còn
   * `downsideDeviation()` chia cho TỔNG số phiên — khung viết theo sách mà mã không đổi thì cửa
   * gác không thấy, nhưng khung khai `'downsideDeviation('` thì ít nhất đã có người mở mã ra đọc.
   */
  calcEvidence: ReadonlyArray<string>;
  /** Công thức trong thư viện tính đúng đại lượng này — khung thêm liên kết tới nó. */
  formulaId?: string;
  /**
   * Câu hỏi còn mở trong `src/core/formulas/REVIEW-2.md` mà quyết xong có thể đổi `calc` — khung này
   * phải sửa theo. Ví dụ `'Q2'` cho chuẩn so sánh của tỷ số thông tin. (`'Q1'`, độ lệch chuẩn của dải
   * Bollinger, đã chốt chia n ngày 16/10/2026.)
   */
  pendingReview?: string;
}

/**
 * Ô gõ tay mà thư viện đã có công thức riêng (EPS, beta, WACC…). Khung bày hình và dòng chữ của
 * CHÍNH công thức ấy — không chép lại, nên không thể lệch.
 */
export interface LinkedHowTo extends HowToBase {
  kind: 'linked';
  formulaId: string;
  /** Ô nhập nhận đại lượng này — cửa gác so đơn vị của ô với đơn vị kết quả của công thức đích. */
  variableKey: string;
}

/**
 * Ô gõ tay là một chỉ số có định nghĩa chuẩn nhưng thư viện chưa có công thức (EBITDA, ERP, ΔNWC…).
 * Không có mã nào để đối chiếu, nên danh sách này được ghim trong ca kiểm để chủ dự án soi.
 */
export interface DefinedHowTo extends HowToBase {
  kind: 'defined';
  /** 1–2 bước, bước cuối bắt đầu bằng chính `symbol` rồi dấu bằng. */
  steps: ReadonlyArray<HowToStep>;
}

export type HowToEntry = DerivedHowTo | LinkedHowTo | DefinedHowTo;

/**
 * Vì sao một dòng bảng ký hiệu KHÔNG có khung.
 *
 * - `ket-qua` — chính kết quả của công thức (vế trái).
 * - `nhap-tho` — số người dùng gõ thẳng, hoặc đọc thẳng trên bảng giá / báo cáo tài chính.
 * - `hang-so` — hằng số trong hình (100, 250, 365, 12).
 * - `hang-so-bieu-phi` — mức phí/thuế tra từ biểu phí; khối hằng số cuối khối Số liệu đã in nó.
 * - `chi-so-chay` — chỉ số hay bộ đếm (t, i, k, n) không phải tính gì.
 * - `phep-toan` — ký hiệu phép toán (`\lfloor`, `\Delta`, `\ln`, `\max`).
 * - `da-hien-trong-hinh` — phép tính đã hiện trọn trong hình (`(1 - t)`, `\sqrt{m}`).
 * - `nam-trong-ky-hieu-khac` — đã là một bước trong khung của ký hiệu khác cùng công thức.
 */
export type HowToSkipReason =
  | 'ket-qua'
  | 'nhap-tho'
  | 'hang-so'
  | 'hang-so-bieu-phi'
  | 'chi-so-chay'
  | 'phep-toan'
  | 'da-hien-trong-hinh'
  | 'nam-trong-ky-hieu-khac';

/** Khung cách tính của MỘT công thức. */
export interface FormulaHowTo {
  entries: ReadonlyArray<HowToEntry>;
  /** Mọi dòng bảng ký hiệu không có khung, khoá là `SymbolNote.latex`. */
  skipped: Readonly<Record<string, HowToSkipReason>>;
  /**
   * Cụm chữ ở dòng chữ dưới hình của những dòng KHÔNG có khung, khoá là `SymbolNote.latex` của một
   * dòng trong `skipped` (28/10/2026). Cụm của dòng CÓ khung vẫn khai ở `HowToEntry.phrases`.
   *
   * Từ 26/10/2026 mọi ký hiệu trong hình mở khung, nhưng ở dòng chữ chỉ cụm của dòng có khung là điểm
   * chạm: "Giá trị nội tại" của Biên an toàn mở khung, "Thị giá" và "100%" ngay cạnh thì không. Chủ
   * dự án khoanh đúng hai chỗ ấy: _"đang chưa hover vào để bật popup lên được như những phần khác,
   * sửa toàn bộ công thức liên quan"_. Dòng không có ở dòng chữ (chỉ số chạy `t`, ký hiệu chỉ nằm
   * trong tên dài hơn như `D` của `D/E`, phép tính gộp như `(1 - t)` mà tên các phần đã là cụm riêng)
   * thì không khai, và không mất gì: rê vào hình hay bảng vẫn mở khung của nó.
   *
   * Luật như `HowToEntry.phrases`: chép nguyên văn, có ở cả hai ngôn ngữ hoặc không ở ngôn ngữ nào.
   */
  skippedPhrases?: Readonly<Record<string, HowToPhrases>>;
  /** Bắt buộc khi `entries` rỗng: vì sao công thức này không có phần nào phải tính. */
  whyNone?: string;
}
