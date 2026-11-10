import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thật cho hai bội số định giá cơ bản trong `formulas/multiples.ts`.
 *
 * Nguồn Việt Nam đứng trước ngay trong dữ liệu để người đọc file cũng thấy đúng thứ tự sản phẩm;
 * `hoiDapFor()` vẫn là lớp bảo đảm thứ tự cuối cùng. Mỗi câu nằm trong mục "Câu hỏi thường gặp" của trang nguồn, đã mở lại và đối chiếu nguyên văn
 * ngày 10/11/2026. Ba câu Money StackExchange bị gỡ vì WebFetch không mở được trang để kiểm.
 */
export const HOI_DAP_MULTIPLES: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  pe: [
    {
      hoi: { vi: 'P/E âm có nghĩa là gì?', en: 'What does a negative P/E mean?' },
      nguyenVan: 'P/E âm có nghĩa là gì?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/p-e-la-gi/',
        ten: 'Thư Viện Chứng Khoán',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'P/E âm xuất hiện khi EPS âm, tức doanh nghiệp đang lỗ. Theo cách tính của công cụ, kết quả này không có ý nghĩa để so sánh nên không trả về một bội số âm; có thể xem P/B hoặc P/S nếu các chỉ số đó phù hợp.',
        en: 'A negative P/E occurs when EPS is negative, meaning the company is making a loss. This calculator treats that result as not meaningful for comparison and does not return a negative multiple; P/B or P/S may be considered when appropriate.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao P/E trên CafeF và SSI đôi khi khác nhau?',
        en: 'Why do CafeF and SSI sometimes show different P/E ratios?',
      },
      nguyenVan: 'Tại sao P/E trên CafeF và trên SSI đôi khi khác nhau?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/p-e-la-gi/',
        ten: 'Thư Viện Chứng Khoán',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Các nền tảng có thể dùng EPS của kỳ khác nhau, dùng EPS cơ bản hoặc pha loãng, và cập nhật giá ở thời điểm khác nhau. Muốn so sánh, cần xác nhận đó là P/E quá khứ hay dự phóng và kỳ dữ liệu nào đang được dùng.',
        en: 'Platforms may use EPS from different periods, basic or diluted EPS, and prices updated at different times. A valid comparison requires checking whether the figure is trailing or forward P/E and which data period it uses.',
      },
    },
    {
      hoi: { vi: 'P/E 20 có phải là cao không?', en: 'Is a P/E of 20 high?' },
      nguyenVan: 'P/E 20 có phải là cao không?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/p-e-la-gi/',
        ten: 'Thư Viện Chứng Khoán',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Không có một ngưỡng đúng cho mọi doanh nghiệp. P/E 20 cần được đặt cạnh doanh nghiệp cùng ngành, giai đoạn tăng trưởng, chất lượng lợi nhuận và bối cảnh lãi suất; chỉ riêng con số 20 chưa cho biết cổ phiếu đắt hay rẻ.',
        en: 'There is no single threshold for every company. A P/E of 20 needs context from industry peers, growth stage, earnings quality, and interest rates; the number alone does not show whether a stock is expensive or cheap.',
      },
    },
  ],

  pb: [
    {
      hoi: {
        vi: 'Tại sao tỷ lệ giá trên giá trị sổ sách P/B lại quan trọng?',
        en: 'Why is the price-to-book ratio important?',
      },
      nguyenVan: 'Tại sao tỷ lệ giá trên giá trị sổ sách (P/B) lại quan trọng?',
      nguon: {
        url: 'https://taca.com.vn/chi-so-p-b/',
        ten: 'Taca',
        noi: 'faq',
        vietnam: true,
      },
    },
    {
      hoi: { vi: 'Khi nào nên sử dụng chỉ số P/B?', en: 'When should the P/B ratio be used?' },
      nguyenVan: 'Khi nào thì bạn nên sử dụng chỉ số P/B?',
      nguon: {
        url: 'https://taca.com.vn/chi-so-p-b/',
        ten: 'Taca',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'P/B hữu ích hơn với ngân hàng và doanh nghiệp trưởng thành có nhiều tài sản hữu hình, nơi giá trị sổ sách có cơ sở so sánh rõ. Nó kém phù hợp với công ty công nghệ hoặc dịch vụ có phần lớn giá trị nằm ở thương hiệu, con người và tài sản vô hình.',
        en: 'P/B is more useful for banks and mature asset-heavy businesses whose book value offers a meaningful comparison. It is less suitable for technology or service companies whose value largely comes from brands, people, and intangible assets.',
      },
    },
    {
      hoi: {
        vi: 'Chỉ số P/B bao nhiêu được xem là hấp dẫn?',
        en: 'What P/B ratio is considered attractive?',
      },
      nguyenVan: 'Chỉ số P/B bao nhiêu được xem là “hấp dẫn”?',
      nguon: {
        url: 'https://taca.com.vn/chi-so-p-b/',
        ten: 'Taca',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Không có một mức P/B hấp dẫn cho mọi doanh nghiệp. Cần so với các doanh nghiệp cùng ngành và lịch sử của chính công ty, đồng thời xem ROE và chất lượng tài sản; P/B thấp có thể phản ánh rủi ro chứ không chỉ mức định giá thấp.',
        en: "There is no universally attractive P/B level. It needs comparison with industry peers and the company's own history, together with ROE and asset quality; a low P/B can reflect risk rather than only a low valuation.",
      },
    },
  ],
};
