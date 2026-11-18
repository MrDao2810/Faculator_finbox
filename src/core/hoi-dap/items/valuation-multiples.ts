import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `valuation-multiples` (`src/core/formulas/valuation-multiples.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_VALUATION_MULTIPLES: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> =
  {
    ev: [
      {
        hoi: {
          vi: 'Vì sao lợi ích cổ đông thiểu số được tính vào giá trị doanh nghiệp (EV)?',
          en: 'Why is minority interest included in enterprise value?',
        },
        nguyenVan: 'why is minority interest included in enterprise value?',
        nguon: {
          url: 'https://money.stackexchange.com/questions/78110/why-is-minority-interest-included-in-enterprise-value',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'Đáp án được chấp nhận: theo quy tắc kế toán Mỹ, công ty mẹ sở hữu trên 50% công ty con phải hợp nhất công ty con vào báo cáo của mình, và phần công ty con không thuộc công ty mẹ ghi thành lợi ích cổ đông thiểu số. Phần này không nằm trong vốn hoá của công ty mẹ nên được cộng vào EV. Công thức ở đây chỉ có vốn hoá, nợ vay và tiền mặt, không cộng khoản này.',
          en: "The accepted answer: under US accounting rules, a parent owning more than 50% of a subsidiary must consolidate it, and the part of the subsidiary the parent does not own is recorded as minority interest. That part is not in the parent's market cap, so it is added to EV. The formula here has only market cap, debt and cash, and does not add it.",
        },
        nguonTraLoi: [
          {
            url: 'https://money.stackexchange.com/questions/78110/why-is-minority-interest-included-in-enterprise-value',
            ten: 'Money StackExchange',
          },
        ],
      },
      {
        hoi: {
          vi: 'Giá trị doanh nghiệp (EV) có phải là toàn bộ số tiền công ty đã vay không?',
          en: "Is Enterprise Value basically all the money that's been borrowed?",
        },
        nguyenVan: "Is Enterprise Value basically all the money that's been borrowed?",
        nguon: {
          url: 'https://money.stackexchange.com/questions/114822/is-enterprise-value-basically-all-the-money-thats-been-borrowed',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'Không. EV là vốn hoá cộng nợ rồi trừ tiền mặt. Tiền mặt được trừ vì đã nằm trong vốn hoá và có thể rút ra khỏi công ty mà không ảnh hưởng giá trị hoạt động; EV có thể hiểu là chi phí dựng lại doanh nghiệp.',
          en: 'No. EV is market cap plus debt minus cash. Cash is removed because it is already in market cap and can be taken out without affecting operating value; EV can be read as the cost of recreating the business.',
        },
        nguonTraLoi: [
          {
            url: 'https://money.stackexchange.com/questions/114822/is-enterprise-value-basically-all-the-money-thats-been-borrowed',
            ten: 'Money StackExchange',
          },
        ],
      },
      {
        hoi: {
          vi: 'Vì sao các khoản nợ khác (phải trả người bán, chi phí phải trả) không có trong công thức EV?',
          en: 'Why are other liabilities not included in the Enterprise Value formula?',
        },
        nguyenVan: 'Why other liabilities are not included in the Enterprise Value formula?',
        nguon: {
          url: 'https://money.stackexchange.com/questions/166761/why-other-liabilities-are-not-included-in-the-enterprise-value-formula',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'Nguồn trả lời rằng các khoản phải trả đó đã được phản ánh trong vốn hoá, vì giá trị vốn chủ được ước tính từ dòng tiền đã trừ chi phí hoạt động và vốn lưu động; chúng được trả từ thu nhập hoạt động. Công thức EV ở đây chỉ cộng nợ vay.',
          en: 'The source answers that those payables are already reflected in market cap, since equity value is estimated from cash flows after operating expenses and working capital; they are paid out of operating income. The EV formula here adds borrowings only.',
        },
        nguonTraLoi: [
          {
            url: 'https://money.stackexchange.com/questions/166761/why-other-liabilities-are-not-included-in-the-enterprise-value-formula',
            ten: 'Money StackExchange',
          },
        ],
      },
      {
        hoi: {
          vi: 'Làm sao xác định "tiền thừa" khi tính giá trị doanh nghiệp (EV) từ bảng cân đối kế toán?',
          en: 'How do you determine "excess cash" for enterprise value calculations from a balance sheet?',
        },
        nguyenVan:
          'How do you determine "excess cash" for Enterprise Value calculations from a balance sheet?',
        nguon: {
          url: 'https://money.stackexchange.com/questions/10544/how-do-you-determine-excess-cash-for-enterprise-value-calculations-from-a-bala',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'Đáp án được chấp nhận nói "tiền thừa" không có định nghĩa chung: tuỳ từng doanh nghiệp, công ty cần nhiều vốn lưu động thì phải giữ nhiều tiền hơn. Chỉ trừ phần tiền thừa (luôn nhỏ hơn tổng tiền) làm EV cao hơn, nên đó là cách tính thận trọng. Công thức ở đây trừ toàn bộ tiền mặt, tiền gửi và đầu tư ngắn hạn bạn nhập.',
          en: 'The accepted answer says "excess cash" has no single definition: it depends on the business, and a company that needs a lot of working capital must hold more cash. Subtracting only excess cash (always less than total cash) makes EV higher, so it is the conservative choice. The formula here subtracts all the cash, deposits and short-term investments you enter.',
        },
        nguonTraLoi: [
          {
            url: 'https://money.stackexchange.com/questions/10544/how-do-you-determine-excess-cash-for-enterprise-value-calculations-from-a-bala',
            ten: 'Money StackExchange',
          },
        ],
      },
    ],
    ps: [
      {
        hoi: {
          vi: 'Làm sao tính P/E và P/S cho một tập dữ liệu cho trước?',
          en: 'How do I calculate the price to earnings and price to sales values for a given dataset?',
        },
        nguyenVan: 'Calculate price to earning and price to sale value for given dataset',
        nguon: {
          url: 'https://money.stackexchange.com/questions/55878/calculate-price-to-earning-and-price-to-sale-value-for-given-dataset',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'Lấy doanh thu thuần bốn quý gần nhất (tỷ ₫) nhân 1 tỷ rồi chia số cổ phiếu lưu hành để ra doanh thu trên mỗi cổ phiếu, sau đó lấy giá thị trường chia cho số đó. P/E làm tương tự, chỉ thay doanh thu bằng lợi nhuận sau thuế để ra EPS. Ví dụ FPT: 72.700 ÷ 37.157 = 1,96 lần.',
          en: 'Take net revenue for the last four quarters (in billion ₫), multiply by 1 billion and divide by shares outstanding to get revenue per share, then divide the market price by that figure. P/E works the same way with net income in place of revenue, giving EPS. For FPT: 72,700 ÷ 37,157 = 1.96 times.',
        },
      },
      {
        hoi: {
          vi: 'Chỉ số P/S tốt là bao nhiêu?',
          en: 'What is a good P/S ratio?',
        },
        nguyenVan: 'Chỉ số P/S (Tỷ lệ giá trên doanh thu) tốt là bao nhiêu?',
        nguon: {
          url: 'https://taca.com.vn/chi-so-p-s/',
          ten: 'TACA mục Câu hỏi thường gặp',
          noi: 'faq',
          vietnam: true,
        },
        traLoi: {
          vi: 'Không có một mức tốt chung, nên hãy so P/S với các công ty cùng ngành ở cùng thời điểm: thấp hơn là mỗi đồng doanh thu đang được trả rẻ hơn, cao hơn là đắt hơn. P/S thấp chưa chắc là rẻ, vì doanh thu chưa phải lợi nhuận: công ty biên lãi mỏng hay đang lỗ vẫn có thể có P/S thấp.',
          en: 'There is no universal good level, so compare P/S with companies in the same industry at the same time: lower means each dong of revenue is priced more cheaply, higher means more expensively. A low P/S is not necessarily cheap, because revenue is not profit: a thin-margin or loss-making company can still have a low P/S.',
        },
      },
      {
        hoi: {
          vi: 'P/S khác P/E ở điểm nào?',
          en: 'How does P/S differ from P/E?',
        },
        nguyenVan:
          'Sự khác biệt giữa tỷ lệ giá trên doanh thu (P/S) và tỷ lệ giá trên thu nhập (P/E) là gì?',
        nguon: {
          url: 'https://taca.com.vn/chi-so-p-s/',
          ten: 'TACA mục Câu hỏi thường gặp',
          noi: 'faq',
          vietnam: true,
        },
        traLoi: {
          vi: 'P/S so giá cổ phiếu với doanh thu mỗi cổ phiếu, còn P/E so giá cổ phiếu với lợi nhuận mỗi cổ phiếu.',
          en: 'P/S compares the share price with revenue per share, while P/E compares the share price with earnings per share.',
        },
        nguonTraLoi: [
          {
            url: 'https://taca.com.vn/chi-so-p-s/',
            ten: 'TACA',
          },
        ],
      },
    ],
    'ev-ebitda': [
      {
        hoi: {
          vi: 'Khi nào nên dùng các hệ số định giá khác nhau như P/E, EV/EBITDA, EV/Sales?',
          en: 'When should different valuation multiples such as P/E, EV/EBITDA and EV/Sales be used?',
        },
        nguyenVan: 'When to use different valuation multiples',
        nguon: {
          url: 'https://money.stackexchange.com/questions/156194/when-to-use-different-valuation-multiples',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'EV/EBITDA hợp khi so hai công ty cùng ngành mà mức vay nợ rất khác nhau: EV đã cộng nợ, trừ tiền mặt, còn EBITDA là lãi trước lãi vay, nên mức vay khác nhau ít làm lệch phép so. P/E so giá với lãi của cổ đông sau lãi vay và không tính được khi công ty lỗ. Khi EBITDA âm, màn này báo không có ý nghĩa và gợi ý dùng EV/Sales hoặc P/B.',
          en: "EV/EBITDA suits comparing two companies in the same industry with very different debt levels: EV already adds debt and takes off cash, and EBITDA is profit before interest, so borrowing distorts the comparison less. P/E compares the price with shareholders' profit after interest and cannot be computed for a loss-maker. When EBITDA is negative, this screen reports a meaningless result and suggests EV/Sales or P/B instead.",
        },
      },
      {
        hoi: {
          vi: 'Có hợp lệ khi tính EV năm thứ hai bằng hệ số EV/EBITDA năm thứ nhất rồi chiết khấu về năm đầu không?',
          en: 'Is it valid to calculate year 2 EV with a year 1 EV/EBITDA multiple and then discount back to year 1?',
        },
        nguyenVan:
          'Is it valid / appropriate to calculate FY2 EV with a Y1 EV/EBITDA multiple so long as we then discount back to Y1?',
        nguon: {
          url: 'https://money.stackexchange.com/questions/121057/is-it-valid-appropriate-to-calculate-fy2-ev-with-a-y1-ev-ebitda-multiple-so-lo',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'Công thức trên trang này không làm việc đó: nó chỉ chia EV cho EBITDA bốn quý gần nhất bạn nhập, không dự phóng năm sau và không chiết khấu. Cách làm ấy chỉ hợp lệ khi chấp nhận giả định năm sau thị trường vẫn trả đúng bội số hôm nay, trong khi bội số còn đổi theo kỳ vọng tăng trưởng và mặt bằng định giá chung của thị trường.',
          en: "The formula on this page does not do that: it only divides EV by the last-four-quarter EBITDA you enter, with no projection and no discounting. That approach only holds if you accept that next year the market will still pay exactly today's multiple, while multiples shift with growth expectations and with how the market as a whole is valued.",
        },
      },
      {
        hoi: {
          vi: 'Tại sao EBITDA âm thì màn báo kết quả không có ý nghĩa, còn EV âm vẫn ra một con số?',
          en: 'Why does a negative EBITDA give a meaningless result while a negative EV still gives a number?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'EBITDA âm nghĩa là kinh doanh lỗ trước cả khấu hao, chia EV cho khoản lỗ không cho bội số nào đọc được, nên màn báo kết quả không có ý nghĩa; EBITDA bằng 0 thì báo chia cho 0. EV âm lại là số thật: tiền mặt vượt cả vốn hoá cộng nợ vay, nên EV −500 tỷ ₫ trên EBITDA 1.450 tỷ ₫ cho −0,34 lần.',
          en: 'A negative EBITDA means the business loses money even before depreciation, and dividing EV by a loss gives no readable multiple, so the screen reports a meaningless result; an EBITDA of 0 is reported as a divide-by-zero error. A negative EV is a real figure: cash exceeds market cap plus debt, so an EV of −500 billion ₫ on EBITDA of 1,450 billion ₫ gives −0.34 times.',
        },
      },
    ],
    peg: [
      {
        hoi: {
          vi: 'PEG là gì, tính thế nào và dùng ra sao khi đầu tư cổ phiếu?',
          en: 'What is the PEG ratio, how is it calculated and how is it useful for stock investing?',
        },
        nguyenVan:
          'What is the PEG ratio? How is the PEG ratio calculated? How is the PEG ratio useful for stock investing?',
        nguon: {
          url: 'https://money.stackexchange.com/questions/831/what-is-the-peg-ratio-how-is-the-peg-ratio-calculated-how-is-the-peg-ratio-use',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'Đáp án được chấp nhận nói PEG là P/E chia cho tốc độ tăng trưởng EPS hằng năm, nên khác P/E ở chỗ có tính đến tăng trưởng.',
          en: 'The accepted answer says PEG is P/E divided by annual EPS growth, so unlike P/E it takes growth into account.',
        },
        nguonTraLoi: [
          {
            url: 'https://money.stackexchange.com/questions/831/what-is-the-peg-ratio-how-is-the-peg-ratio-calculated-how-is-the-peg-ratio-use',
            ten: 'Money StackExchange',
          },
        ],
      },
      {
        hoi: {
          vi: 'PEG hữu ích đến đâu với cổ phiếu vốn hoá lớn?',
          en: 'How useful is the PEG ratio for large cap stocks?',
        },
        nguyenVan: 'How useful is the PEG Ratio for large cap stocks?',
        nguon: {
          url: 'https://money.stackexchange.com/questions/48437/how-useful-is-the-peg-ratio-for-large-cap-stocks',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'Công thức không xét vốn hoá: nó chỉ chia P/E cho mức tăng lợi nhuận bạn kỳ vọng. Công ty lớn mà lợi nhuận tăng chậm thì g nhỏ, nên PEG dễ vượt mốc 1 lần dù P/E không cao: P/E 15,2 với g 5 cho 3,04 lần. Khi g bằng 0 hoặc âm, màn báo lỗi và gợi ý so thẳng P/E với công ty cùng ngành.',
          en: 'The formula does not look at company size: it only divides P/E by the profit growth you expect. A large company whose profit grows slowly has a small g, so PEG easily passes the 1 mark even when P/E is not high: a P/E of 15.2 with g of 5 gives 3.04 times. When g is 0 or negative, the screen reports an error and suggests comparing P/E directly with peers in the same industry.',
        },
      },
      {
        hoi: {
          vi: 'Tỷ lệ PEG tốt được coi là bao nhiêu?',
          en: 'What PEG ratio is considered good?',
        },
        nguyenVan: 'Tỷ lệ PEG tốt được coi là bao nhiêu?',
        nguon: {
          url: 'https://taca.com.vn/chi-so-peg/',
          ten: 'TACA mục Câu hỏi thường gặp',
          noi: 'faq',
          vietnam: true,
        },
        traLoi: {
          vi: 'Nguồn lấy mốc 1,0: dưới 1 được xem là cổ phiếu định giá tương đối thấp so với tăng trưởng, trên 1 thường bị coi là định giá cao. Màn này cũng đọc theo mốc 1 lần, nhưng g là mức tăng bạn dự phóng, nên lệch vài điểm phần trăm ở g có thể đẩy PEG qua mốc ấy: P/E 12,39 với g 14,1 cho 0,88 lần, còn g dương mà dưới 12,39 là PEG vượt 1.',
          en: 'The source uses the 1.0 mark: below 1 is seen as a stock valued relatively low for its growth, above 1 is usually seen as overvalued. This screen reads it against the same 1 mark, but g is your forecast, so being off by a few percentage points in g can push PEG across it: a P/E of 12.39 with g of 14.1 gives 0.88 times, while any positive g below 12.39 puts PEG above 1.',
        },
        nguonTraLoi: [
          {
            url: 'https://taca.com.vn/chi-so-peg/',
            ten: 'TACA',
          },
        ],
      },
      {
        hoi: {
          vi: 'PEG âm cho biết điều gì?',
          en: 'What does a negative PEG indicate?',
        },
        nguyenVan: 'Tỷ lệ PEG âm chỉ ra điều gì?',
        nguon: {
          url: 'https://taca.com.vn/chi-so-peg/',
          ten: 'TACA mục Câu hỏi thường gặp',
          noi: 'faq',
          vietnam: true,
        },
        traLoi: {
          vi: 'Theo nguồn, PEG âm đến từ lợi nhuận âm hoặc tăng trưởng ước tính âm. Ở đây công thức không in số âm: tăng trưởng âm hay P/E bằng 0 đều báo không có ý nghĩa, tăng trưởng bằng 0 báo chia cho 0; ô P/E không nhận số âm.',
          en: 'According to the source, a negative PEG comes from negative earnings or negative estimated growth. Here the formula never prints a negative number: negative growth or a P/E of 0 is reported as meaningless, zero growth as a divide by zero, and the P/E field does not accept negative numbers.',
        },
        nguonTraLoi: [
          {
            url: 'https://taca.com.vn/chi-so-peg/',
            ten: 'TACA',
          },
        ],
      },
      {
        hoi: {
          vi: 'PEG có những hạn chế gì?',
          en: 'What are the limitations of the PEG ratio?',
        },
        nguyenVan: 'Một số hạn chế của tỷ lệ PEG là gì?',
        nguon: {
          url: 'https://taca.com.vn/chi-so-peg/',
          ten: 'TACA mục Câu hỏi thường gặp',
          noi: 'faq',
          vietnam: true,
        },
        traLoi: {
          vi: 'Kết quả phụ thuộc nhiều vào mức tăng trưởng đưa vào; dùng tăng trưởng quá khứ có thể kém chính xác nếu tương lai khác quá khứ.',
          en: 'The result depends heavily on the growth figure used; using historical growth can be inaccurate if future growth differs from the past.',
        },
        nguonTraLoi: [
          {
            url: 'https://taca.com.vn/chi-so-peg/',
            ten: 'TACA',
          },
        ],
      },
    ],
    'von-hoa-thi-truong': [
      {
        hoi: {
          vi: 'Vì sao vốn hoá thị trường lại thấp hơn số cổ phiếu lưu hành nhân với giá cổ phiếu?',
          en: 'Why is market cap lower than shares outstanding times share price?',
        },
        nguyenVan: 'Market Cap lower than Shares Outstanding x Share Price?',
        nguon: {
          url: 'https://money.stackexchange.com/questions/47385/market-cap-lower-than-shares-outstanding-x-share-price',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'Vốn hoá đúng bằng số cổ phiếu lưu hành nhân giá cổ phiếu; chênh lệch ở ví dụ đó do giá niêm yết bằng pence (GBp) chứ không phải bảng Anh, nên một con số bị lệch 100 lần.',
          en: 'Market cap is exactly shares outstanding times share price; the gap in that example came from the price being quoted in pence (GBp) rather than pounds, so one figure was off by a factor of 100.',
        },
        nguonTraLoi: [
          {
            url: 'https://money.stackexchange.com/questions/47385/market-cap-lower-than-shares-outstanding-x-share-price',
            ten: 'Money StackExchange',
          },
        ],
      },
      {
        hoi: {
          vi: 'Vốn hoá thị trường và vốn điều lệ khác nhau như thế nào?',
          en: 'How does market capitalization differ from charter capital?',
        },
        nguyenVan: 'Vốn hóa thị trường và vốn điều lệ khác nhau như thế nào?',
        nguon: {
          url: 'https://thuvienchungkhoan.vn/von-hoa-thi-truong-bluechip-midcap-penny/',
          ten: 'Thư viện chứng khoán mục Câu hỏi thường gặp',
          noi: 'faq',
          vietnam: true,
        },
        traLoi: {
          vi: 'Vốn điều lệ bằng mệnh giá nhân tổng số cổ phiếu; vốn hoá thị trường tính theo giá giao dịch thực tế nên thường cao hơn vốn điều lệ nhiều lần với doanh nghiệp kinh doanh tốt.',
          en: 'Charter capital is par value times total shares; market capitalization uses the actual trading price, so it is often many times higher for well-run companies.',
        },
        nguonTraLoi: [
          {
            url: 'https://thuvienchungkhoan.vn/von-hoa-thi-truong-bluechip-midcap-penny/',
            ten: 'Thư viện chứng khoán',
          },
        ],
      },
      {
        hoi: {
          vi: 'Tại sao có doanh nghiệp lợi nhuận cao nhưng vốn hoá thấp?',
          en: 'Why do some companies have high profit but low market capitalization?',
        },
        nguyenVan: 'Tại sao có doanh nghiệp lợi nhuận cao nhưng vốn hóa thấp?',
        nguon: {
          url: 'https://thuvienchungkhoan.vn/von-hoa-thi-truong-bluechip-midcap-penny/',
          ten: 'Thư viện chứng khoán mục Câu hỏi thường gặp',
          noi: 'faq',
          vietnam: true,
        },
        traLoi: {
          vi: 'Vốn hoá phản ánh kỳ vọng của thị trường về tương lai, không chỉ lợi nhuận hiện tại; ngành đi xuống, quản trị yếu hoặc ít được biết đến có thể khiến giá thấp.',
          en: "Market capitalization reflects the market's expectations of the future, not just current profit; a declining sector, weak governance or low visibility can keep the price low.",
        },
        nguonTraLoi: [
          {
            url: 'https://thuvienchungkhoan.vn/von-hoa-thi-truong-bluechip-midcap-penny/',
            ten: 'Thư viện chứng khoán',
          },
        ],
      },
      {
        hoi: {
          vi: 'Vốn hoá giảm có nghĩa là doanh nghiệp đang thua lỗ không?',
          en: 'Does a falling market capitalization mean the company is losing money?',
        },
        nguyenVan: 'Vốn hóa giảm có nghĩa là doanh nghiệp đang thua lỗ không?',
        nguon: {
          url: 'https://thuvienchungkhoan.vn/von-hoa-thi-truong-bluechip-midcap-penny/',
          ten: 'Thư viện chứng khoán mục Câu hỏi thường gặp',
          noi: 'faq',
          vietnam: true,
        },
        traLoi: {
          vi: 'Không nhất thiết. Vốn hoá giảm khi giá cổ phiếu giảm, có thể do tâm lý thị trường, dòng tiền rút ra hoặc kết quả kinh doanh xấu đi; cần đọc báo cáo tài chính để phân biệt.',
          en: 'Not necessarily. Market capitalization falls when the share price falls, which can come from market sentiment, outflows or weaker results; read the financial statements to tell which.',
        },
        nguonTraLoi: [
          {
            url: 'https://thuvienchungkhoan.vn/von-hoa-thi-truong-bluechip-midcap-penny/',
            ten: 'Thư viện chứng khoán',
          },
        ],
      },
    ],
    'gia-muc-tieu': [
      {
        hoi: {
          vi: 'Giá mục tiêu của nhà phân tích có mặc định là cho 12 tháng tới không?',
          en: "Is an analyst's price target assumed to be for 12 months out?",
        },
        nguyenVan: 'Is an analyst\'s "price target" assumed to be for 12 months out?',
        nguon: {
          url: 'https://money.stackexchange.com/questions/5930/is-an-analysts-price-target-assumed-to-be-for-12-months-out',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'Các câu trả lời ở nguồn không thống nhất: một câu nói báo cáo phân tích luôn ghi kỳ hạn ở phần miễn trừ trách nhiệm, thường là 12 tháng, có nơi 6 tháng; câu khác nói khi không ghi kỳ hạn thì đó là mức giá hợp lý, không ai biết bao lâu mới tới. Công thức ở đây không có kỳ hạn: nó chỉ nhân P/E mục tiêu với EPS hiện tại, không nói khi nào giá chạm mức ấy.',
          en: 'The answers at the source disagree: one says a research report always states the horizon in its disclaimer, usually 12 months though some firms use 6; another says that without a stated horizon the target is a fair price, and nobody knows how long it takes to get there. The formula here has no time horizon: it only multiplies the target P/E by current EPS and says nothing about when the price might reach that level.',
        },
        nguonTraLoi: [
          {
            url: 'https://money.stackexchange.com/questions/5930/is-an-analysts-price-target-assumed-to-be-for-12-months-out',
            ten: 'Money StackExchange',
          },
        ],
      },
      {
        hoi: {
          vi: 'Giá mục tiêu của cổ phiếu dựa trên cơ sở nào?',
          en: 'What are price targets of stocks based on?',
        },
        nguyenVan: 'What are price targets of stocks based on?',
        nguon: {
          url: 'https://money.stackexchange.com/questions/98094/what-are-price-targets-of-stocks-based-on',
          ten: 'Money StackExchange',
          noi: 'hoi-dap',
          vietnam: false,
        },
        traLoi: {
          vi: 'Theo một đáp án, giá mục tiêu là dự phóng dựa trên thông tin hiện có: nhà phân tích xem tài chính doanh nghiệp và kỳ vọng thay đổi rồi dùng mô hình dự phóng lợi nhuận. Mỗi tổ chức dùng mô hình khác nhau nên con số khác nhau, và có thêm ước tính đồng thuận.',
          en: 'According to one answer, a price target is a projection from current information: analysts review company financials and expected changes and use an earnings forecast model. Each firm uses different models, so figures differ, and a consensus estimate also exists.',
        },
        nguonTraLoi: [
          {
            url: 'https://money.stackexchange.com/questions/98094/what-are-price-targets-of-stocks-based-on',
            ten: 'Money StackExchange',
          },
        ],
      },
      {
        hoi: {
          vi: 'Tại sao công ty đang lỗ thì màn không tính được giá mục tiêu?',
          en: "Why can't the screen compute a target price for a loss-making company?",
        },
        tuSoan: true,
        traLoi: {
          vi: 'Giá mục tiêu là P/E mục tiêu nhân EPS, nên EPS bằng 0 hoặc âm cho ra mức giá bằng 0 hoặc âm, không có nghĩa; màn báo kết quả không có ý nghĩa và gợi ý dùng NCAV trên cổ phiếu hoặc P/B. P/E mục tiêu bằng 0 cũng bị báo như vậy.',
          en: 'The target price is the target P/E times EPS, so an EPS of 0 or below gives a zero or negative price that means nothing; the screen reports a meaningless result and suggests NCAV per share or P/B instead. A target P/E of 0 is reported the same way.',
        },
      },
    ],
    'ev-sales': [
      {
        hoi: {
          vi: 'EV/Sales khác P/S ở chỗ nào?',
          en: 'How does EV/Sales differ from P/S?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Cả hai đều chia cho doanh thu, nhưng EV/Sales lấy giá trị doanh nghiệp (đã cộng nợ, trừ tiền mặt) ở tử số, còn P/S lấy vốn hoá. Hai công ty cùng doanh thu mà nợ khác nhau sẽ cho EV/Sales khác nhau.',
          en: 'Both divide by revenue, but EV/Sales puts enterprise value (debt added, cash taken off) on top, while P/S uses market cap. Two companies with the same revenue but different debt get different EV/Sales.',
        },
      },
      {
        hoi: {
          vi: 'Doanh thu nhập vào là doanh thu kỳ nào, đơn vị gì?',
          en: 'Which period and unit should the revenue be in?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Doanh thu thuần bốn quý gần nhất trên báo cáo kết quả kinh doanh, tính bằng tỷ ₫, cùng đơn vị với EV.',
          en: 'Net revenue over the last four quarters from the income statement, in billion ₫, the same unit as EV.',
        },
      },
      {
        hoi: {
          vi: 'Vì sao nhập doanh thu bằng 0 hoặc số âm thì không ra kết quả?',
          en: 'Why do I get an error when revenue is 0 or negative?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Doanh thu bằng 0 làm phép chia cho 0 nên báo chia cho 0. Doanh thu âm bị coi là số liệu sai (báo vô nghĩa) vì doanh thu thuần luôn từ 0 trở lên; hãy kiểm tra lại báo cáo kết quả kinh doanh.',
          en: 'A revenue of 0 means dividing by zero, so you get a divide-by-zero error. A negative revenue is flagged as invalid and reported as meaningless, because net revenue is always zero or positive; recheck the income statement.',
        },
      },
      {
        hoi: {
          vi: 'EV âm thì EV/Sales ra âm, có đúng không?',
          en: 'If EV is negative, is a negative EV/Sales correct?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Đúng theo cách sản phẩm tính: chỉ chặn doanh thu, còn EV được nhập từ âm tới dương, nên EV âm (tiền mặt lớn hơn vốn hoá cộng nợ) cho kết quả âm. Hãy kiểm tra lại cách tính EV trước khi dùng con số.',
          en: 'Yes, as the product computes it: only revenue is guarded, EV may be entered from negative upward, so a negative EV (cash above market cap plus debt) gives a negative result. Recheck how EV was built before using the figure.',
        },
      },
    ],
    'so-graham': [
      {
        hoi: {
          vi: 'Con số 22,5 trong số Graham từ đâu ra?',
          en: 'Where does the 22.5 in the Graham number come from?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Là tích của hai trần Graham đặt ra: P/E tối đa 15 và P/B tối đa 1,5 (15 × 1,5 = 22,5). Hằng số này cố định trong công thức, không có ô nhập để sửa.',
          en: "It is the product of Graham's two caps: maximum P/E of 15 and maximum P/B of 1.5 (15 × 1.5 = 22.5). It is fixed in the formula and has no input field.",
        },
      },
      {
        hoi: {
          vi: 'EPS và BVPS nhập theo đơn vị nào, kết quả ra đơn vị gì?',
          en: 'What units do EPS and BVPS use, and what unit is the result in?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Cả EPS và BVPS tính bằng ₫ mỗi cổ phiếu, nên số Graham cũng là ₫ mỗi cổ phiếu. Ví dụ EPS 6.000 và BVPS 24.000 cho khoảng 56.921 ₫.',
          en: 'Both EPS and BVPS are in ₫ per share, so the Graham number is also ₫ per share. For example EPS 6,000 and BVPS 24,000 give about 56,921 ₫.',
        },
      },
      {
        hoi: {
          vi: 'Vì sao công ty đang lỗ thì không tính được số Graham?',
          en: "Why can't the Graham number be computed for a loss-making company?",
        },
        tuSoan: true,
        traLoi: {
          vi: 'Công thức lấy căn bậc hai nên cần EPS dương; EPS bằng 0 hoặc âm báo vô nghĩa. Với công ty lỗ, sản phẩm gợi ý dùng NCAV trên cổ phiếu hoặc P/B.',
          en: 'The formula takes a square root, so it needs a positive EPS; an EPS of 0 or below is reported as meaningless. For a loss-maker the product suggests NCAV per share or P/B.',
        },
      },
      {
        hoi: {
          vi: 'Vốn chủ sở hữu âm thì số Graham ra sao?',
          en: 'What happens to the Graham number if equity is negative?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'BVPS bằng 0 hoặc âm thì không tính được và báo vô nghĩa. Hãy xem lại bảng cân đối kế toán trước khi định giá theo cách này.',
          en: 'A BVPS of 0 or below cannot be computed and is reported as meaningless. Recheck the balance sheet before valuing this way.',
        },
      },
      {
        hoi: {
          vi: 'Vì sao số Graham thường thấp với công ty công nghệ?',
          en: 'Why is the Graham number often low for technology companies?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Công thức chỉ dùng EPS và BVPS cùng hai trần 15 và 1,5, vốn được đặt ra cho doanh nghiệp truyền thống ổn định. Công ty ít tài sản hữu hình có BVPS nhỏ nên kết quả thấp so với giá thị trường.',
          en: 'The formula uses only EPS and BVPS with the two caps 15 and 1.5, which were set for stable traditional businesses. A company with few tangible assets has a small BVPS, so the result comes out low relative to the market price.',
        },
      },
    ],
    'ncav-tren-co-phieu': [
      {
        hoi: {
          vi: 'Nhập tài sản ngắn hạn, nợ và số cổ phiếu theo đơn vị nào?',
          en: 'What units do current assets, liabilities and share count use?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Tài sản ngắn hạn và tổng nợ phải trả tính bằng tỷ ₫, số cổ phiếu lưu hành bằng triệu CP; công thức tự nhân 1.000 để ra ₫ mỗi cổ phiếu. Ví dụ 4.800, 2.600 và 118 cho khoảng 18.644 ₫.',
          en: 'Current assets and total liabilities are in billion ₫, shares outstanding in million shares; the formula multiplies by 1,000 to get ₫ per share. For example 4,800, 2,600 and 118 give about 18,644 ₫.',
        },
      },
      {
        hoi: {
          vi: 'Tổng nợ phải trả gồm những khoản nào?',
          en: 'Which liabilities count in total liabilities?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Toàn bộ nợ ngắn hạn và dài hạn trên bảng cân đối kế toán, không chỉ nợ vay. Nếu chỉ nhập nợ vay, NCAV sẽ bị tính cao hơn thực tế.',
          en: 'All short-term and long-term liabilities on the balance sheet, not just borrowings. Entering only borrowings makes NCAV come out higher than it should.',
        },
      },
      {
        hoi: {
          vi: 'NCAV ra số âm là sao, có phải lỗi không?',
          en: 'What does a negative NCAV mean, is it an error?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Không phải lỗi: nợ phải trả lớn hơn tài sản ngắn hạn thì phép trừ ra âm và sản phẩm vẫn hiển thị con số thật đó, không chặn.',
          en: 'Not an error: when liabilities exceed current assets the subtraction is negative and the product still shows that real figure, without blocking it.',
        },
      },
      {
        hoi: {
          vi: 'Số cổ phiếu bằng 0 thì sao?',
          en: 'What if the share count is 0?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Báo lỗi chia cho 0. Hãy nhập số cổ phiếu đang lưu hành lớn hơn 0, tính bằng triệu CP.',
          en: 'You get a divide-by-zero error. Enter shares outstanding greater than 0, in million shares.',
        },
      },
      {
        hoi: {
          vi: 'Vì sao NCAV có thể cao hơn số tiền thật thu hồi được?',
          en: 'Why can NCAV be higher than what is actually recoverable?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Phải thu và hàng tồn kho có thể không thu hồi đủ giá trị sổ sách, trong khi công thức tính chúng theo đúng số trên bảng cân đối kế toán.',
          en: 'Receivables and inventory may not be recovered at book value, while the formula counts them at the balance-sheet figure.',
        },
      },
    ],
    'ty-suat-loi-nhuan-tren-gia': [
      {
        hoi: {
          vi: 'Tỷ suất lợi nhuận trên giá khác gì P/E?',
          en: 'How is earnings yield different from P/E?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Nó là EPS chia giá, tức nghịch đảo của P/E, tính bằng %. Ví dụ P/E 20 lần tương ứng 5%. Khác P/E, nó giữ nguyên dấu nên công ty lỗ cho ra số âm đọc được.',
          en: 'It is EPS divided by price, the inverse of P/E, in %. For example a P/E of 20 corresponds to 5%. Unlike P/E it keeps its sign, so a loss-maker gives a readable negative number.',
        },
      },
      {
        hoi: {
          vi: 'Công ty lỗ thì tỷ suất ra âm, sản phẩm có báo lỗi không?',
          en: 'If the company loses money the yield is negative, does the product show an error?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Không báo lỗi. Sản phẩm không chặn EPS âm hay bằng 0, nên EPS âm cho tỷ suất âm và EPS bằng 0 cho 0%.',
          en: 'No error. The product does not block a negative or zero EPS, so a negative EPS gives a negative yield and a zero EPS gives 0%.',
        },
      },
      {
        hoi: {
          vi: 'Vì sao nhập giá thị trường bằng 0 thì không ra kết quả?',
          en: 'Why do I get no result when the market price is 0?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Giá nằm ở mẫu số nên giá bằng 0 báo lỗi chia cho 0. Hãy nhập giá đóng cửa gần nhất của cổ phiếu, tính bằng ₫.',
          en: 'Price is the denominator, so a price of 0 gives a divide-by-zero error. Enter the most recent closing price of the share, in ₫.',
        },
      },
      {
        hoi: {
          vi: 'EPS và giá phải cùng đơn vị nào?',
          en: 'What unit must EPS and price share?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Cả hai tính bằng ₫ mỗi cổ phiếu. EPS lấy từ lợi nhuận sau thuế chia số cổ phiếu lưu hành. Ví dụ EPS 5.000 và giá 40.000 cho 12,5%.',
          en: 'Both are in ₫ per share. EPS is after-tax profit divided by shares outstanding. For example EPS 5,000 and price 40,000 give 12.5%.',
        },
      },
      {
        hoi: {
          vi: 'Tỷ suất này có phải là tiền về túi cổ đông mỗi năm không?',
          en: 'Is this yield the cash a shareholder receives each year?',
        },
        tuSoan: true,
        traLoi: {
          vi: 'Không. Đó là lợi nhuận công ty làm ra trên giá, còn doanh nghiệp thường chỉ chia một phần thành cổ tức và giữ phần còn lại để tái đầu tư. Đây là lỗi thường gặp.',
          en: 'No. It is the profit the company earns relative to price, while firms usually pay out only part as dividends and reinvest the rest. This is a common mistake.',
        },
      },
    ],
  };
