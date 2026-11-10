import type { Bilingual } from '../types';

/**
 * Tầng DOMAIN — khối "Câu hỏi thường gặp" của màn chi tiết công thức (10/11/2026).
 *
 * Chủ dự án: _"hiển thị câu hỏi thường gặp của từng công thức, câu hỏi phải là câu hỏi thật của công
 * thức đó. hãy tìm cả ở việt nam lẫn nước ngoài, ưu tiên Việt Nam trước"_. Khi được hỏi, chốt bốn
 * điều, và mỗi điều là một bất biến của thư mục này:
 *
 * - **Câu hỏi thật**: câu NGƯỜI THẬT đã hỏi trên diễn đàn / trang hỏi đáp (ưu tiên), hoặc nằm trong
 *   một mục ghi rõ "Câu hỏi thường gặp" / "FAQ" của một trang tài chính. Tiêu đề phụ dạng câu hỏi
 *   của một bài định nghĩa ("P/E là gì?") KHÔNG tính: đó là đề mục, không ai hỏi cả. Mỗi câu mang
 *   link tới đúng chỗ nó được hỏi và NGUYÊN VĂN câu ở đó, để ai cũng mở lại kiểm được.
 * - **Việt Nam trước**: `hoiDapFor()` xếp câu `vietnam: true` lên đầu.
 * - **Câu trả lời có thể vắng**: _"câu nào chưa có câu trả lời thì tạm thời để trống để tôi quyết
 *   định sau"_. Câu ấy nằm trong dữ liệu nhưng **không hiện trên màn**: chủ dự án đã chọn hiện kèm
 *   "Chưa có trả lời", rồi đổi lại khi thấy nó trên màn (_"ko có câu trả lời thì tạm thời ẩn đi"_).
 *   `hoiDapFor()` chỉ trả câu có `traLoi`; điền `traLoi` là câu tự hiện.
 * - **Càng nhiều càng tốt, không độn**: không có trần số câu; màn hiện 5 câu đầu và nút "Xem thêm".
 *
 * Cùng khuôn `src/core/vi-du/` và ngân hàng câu hỏi: chữ của cả 111 công thức chỉ đọc lúc build
 * (`page.tsx` qua `@/application/hoi-dap`) rồi truyền xuống bằng prop, mỗi trang mang đúng phần của
 * mình. `build-only-imports.test.ts` gác chỗ import, `verify:static` gác bản dựng.
 */

/** Câu hỏi được đặt ở đâu. */
export type NoiHoi =
  /** Một chủ đề trên diễn đàn (F319, Voz, Reddit, Bogleheads…). */
  | 'dien-dan'
  /** Một trang hỏi đáp có người đặt câu hỏi (Money StackExchange, Quora, mục hỏi đáp của báo…). */
  | 'hoi-dap'
  /** Một mục ghi rõ "Câu hỏi thường gặp" / "FAQ" của trang tài chính, công ty chứng khoán. */
  | 'faq';

/** Chỗ câu hỏi được hỏi. */
export interface NoiHoiNguon {
  /** Đường dẫn `https` tới đúng chủ đề / câu hỏi / mục FAQ, không phải trang chủ. */
  url: string;
  /** Tên ngắn in trên màn: "F319", "Reddit r/investing", "Investopedia FAQ". */
  ten: string;
  noi: NoiHoi;
  /** Nơi hỏi là của Việt Nam (người Việt hỏi, bằng tiếng Việt). Quyết định thứ tự trên màn. */
  vietnam: boolean;
}

/** Link ủng hộ câu trả lời. */
export interface NguonTraLoi {
  url: string;
  ten: string;
}

export interface CauHoiThuongGap {
  /**
   * Câu hiển thị: giữ đúng ý người hỏi, đã sửa chính tả và bỏ tiếng lóng, kết thúc bằng "?". Câu gốc
   * tiếng Anh thì `vi` là bản dịch sát nghĩa. Cả hai vế bắt buộc: chế độ EN không được còn chữ Việt.
   */
  hoi: Bilingual;
  /**
   * NGUYÊN VĂN câu hỏi ở nguồn, đúng ngôn ngữ và chính tả gốc. Không in trên màn; có để người kiểm mở
   * `nguon.url` rồi tìm đúng chuỗi này.
   */
  nguyenVan?: string;
  /** VẮNG chỉ khi `tuSoan`: câu do đội sản phẩm soạn, không có nơi nào để link tới. */
  nguon?: NoiHoiNguon;
  /**
   * Câu do ĐỘI SẢN PHẨM tự soạn từ chính công thức (chủ dự án, 10/11/2026, cho 29 công thức không tìm
   * được câu hỏi thật nào: _"bạn tự đọc công thức rồi nghĩ xem sẽ có các loại câu hỏi nào sẽ gặp"_).
   * Đây KHÔNG phải câu người thật hỏi, nên không có `nguon` / `nguyenVan` và màn không in dòng
   * "Nguồn:"; `traLoi` bắt buộc, viết từ `calc` và phần giải thích của sản phẩm. Thay bằng câu thật
   * khi tìm được: câu thật đứng trước, câu tự soạn đứng sau.
   */
  tuSoan?: true;
  /**
   * Câu trả lời, tóm từ câu trả lời ở nguồn, đúng với `calc` của trang. VẮNG nghĩa là CHƯA CÓ: nguồn
   * không trả lời, trả lời sai, hay chỉ là ý kiến. Chủ dự án quyết sau; màn in "Chưa có trả lời".
   */
  traLoi?: Bilingual;
  nguonTraLoi?: ReadonlyArray<NguonTraLoi>;
}
