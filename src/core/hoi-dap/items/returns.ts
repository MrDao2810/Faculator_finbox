import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `returns` (`src/core/formulas/returns.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_RETURNS: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  cagr: [
    {
      hoi: {
        vi: 'CAGR nghĩa là gì khi nói về cổ phiếu của một công ty?',
        en: 'What does CAGR mean when used for a company stock?',
      },
      nguyenVan: 'What does CAGR mean when it is used in relation to a company stock?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/1030/what-does-cagr-mean-when-it-is-used-in-relation-to-a-company-stock',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Theo câu trả lời được chấp nhận, CAGR mô tả mức tăng trưởng bình quân mỗi năm trong một giai đoạn, tính bằng (giá trị cuối ÷ giá trị đầu) mũ (1 ÷ số năm) trừ 1.',
        en: 'The accepted answer says CAGR describes the average yearly growth over a period, computed as (ending value / beginning value) to the power of (1 / years) minus 1.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/1030/what-does-cagr-mean-when-it-is-used-in-relation-to-a-company-stock',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Lợi suất năm hoá khác gì CAGR?',
        en: 'How does annualized return differ from CAGR?',
      },
      nguyenVan: 'Annualized Return vs CAGR of Investment',
      nguon: {
        url: 'https://money.stackexchange.com/questions/78132/annualized-return-vs-cagr-of-investment',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời được chấp nhận cho rằng hai cách tính này tương đương: cả hai đều là (1 + lợi suất đơn) mũ (1 ÷ số năm) trừ 1.',
        en: 'The accepted answer says the two formulas are equivalent: both are (1 + simple return) to the power of (1 / years) minus 1.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/78132/annualized-return-vs-cagr-of-investment',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'CAGR có tính được cho khoảng thời gian dưới 1 năm không?',
        en: 'Can CAGR be calculated for a period shorter than one year?',
      },
      nguyenVan: 'Can CAGR be calculated for a time periods less than 1 year?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/158298/can-cagr-be-calculated-for-a-time-periods-less-than-1-year',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Có. Câu trả lời được chấp nhận suy từ nguyên lý: nếu mức tăng của nửa năm lặp lại ở nửa năm sau thì ra con số cả năm, nhưng đó chỉ là giả định lặp lại, chưa phải dự báo.',
        en: 'Yes. The accepted answer reasons from first principles: if the half-year growth repeats in the next half-year you get the yearly figure, but that is only an assumption of repetition, not a forecast.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/158298/can-cagr-be-calculated-for-a-time-periods-less-than-1-year',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Có thuật ngữ nào mô tả CAGR khi nó âm không?',
        en: 'Is there a term that better describes CAGR when it is negative?',
      },
      nguyenVan:
        'Is there a term that better describes a compound annual growth rate (CAGR) when it is negative?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/22326/is-there-a-term-that-better-describes-a-compound-annual-growth-rate-cagr-when',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
  'ty-suat-co-tuc': [
    {
      hoi: {
        vi: 'Tỷ suất cổ tức quan trọng thế nào khi đánh giá một cổ phiếu?',
        en: 'How important is dividend yield when evaluating a stock?',
      },
      nguyenVan: 'Importance of dividend yield when evaluating a stock?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/9192/importance-of-dividend-yield-when-evaluating-a-stock',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời được chấp nhận lấy ví dụ hai cổ phiếu trả cổ tức 1 và 2 đô một năm: giá mua mới quyết định khoản nào đáng giá hơn, nên phải xét cổ tức trên giá chứ không chỉ số tiền cổ tức.',
        en: 'The accepted answer uses two stocks paying 1 and 2 dollars a year in dividends: the price paid decides which is the better deal, so dividend must be judged against price, not as a flat amount.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/9192/importance-of-dividend-yield-when-evaluating-a-stock',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Cùng một cổ phiếu mà các trang tài chính ghi tỷ suất cổ tức khác nhau, làm sao biết con số nào đúng?',
        en: 'The same stock shows different dividend yields on different financial sites. How do I know which is correct?',
      },
      nguyenVan:
        'The dividend yield of AMC is reported differently on different financial info websites. How do I know which is correct?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/135355/the-dividend-yield-of-amc-is-reported-differently-on-different-financial-info-we',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời được chấp nhận chỉ ra các trang lấy mức cổ tức khác nhau: một trang lấy cổ tức bốn quý đã trả, trang khác lấy mức cổ tức mới sau khi cắt, nên cùng giá cổ phiếu vẫn ra tỷ suất khác nhau.',
        en: 'The accepted answer shows the sites use different dividend amounts: one uses the dividends already paid over four quarters, another the new reduced dividend, so the same price gives different yields.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/135355/the-dividend-yield-of-amc-is-reported-differently-on-different-financial-info-we',
          ten: 'Money StackExchange',
        },
      ],
    },
  ],
  xirr: [
    {
      hoi: {
        vi: 'Tôi tính XIRR trong Google Sheets theo hướng dẫn nhưng bị sai, sai ở đâu?',
        en: 'I followed a tutorial to compute XIRR in Google Sheets but it goes wrong. What is wrong?',
      },
      nguyenVan: "What's wrong with the XIRR calculation here?",
      nguon: {
        url: 'https://money.stackexchange.com/questions/142223/whats-wrong-with-the-xirr-calculation-here',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời được chấp nhận nói dòng tiền dương chưa đủ bù các khoản âm: các lần gửi ghi âm phải được cân bằng bởi số dư cuối hoặc khoản rút dương.',
        en: 'The accepted answer says there is no large enough positive cash flow to balance the negative ones: deposits recorded as negative need a final balance or a positive withdrawal.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/142223/whats-wrong-with-the-xirr-calculation-here',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Vì sao XIRR tôi tính ra 50,90% mà bài tham khảo ra 6,96%, tôi bỏ sót gì?',
        en: 'Why does my XIRR come out at 50.90% when the reference article gets 6.96%? What am I missing?',
      },
      nguyenVan: 'What am I missing with this XIRR calculation?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/141415/what-am-i-missing-with-this-xirr-calculation',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời được chấp nhận chỉ ra lỗi đếm đôi: lãi chưa thực hiện bị coi là dòng tiền. Chỉ nên đưa các khoản tiền thật vào và ghi giá trị còn lại ở dòng cuối.',
        en: 'The accepted answer points out double counting: unrealized gains were treated as cash flows. Use only actual cash flows and put the remaining value in the last row.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/141415/what-am-i-missing-with-this-xirr-calculation',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Vì sao XIRR trong Google Sheets ra giá trị khó hiểu?',
        en: 'Why does XIRR in Google Sheets return a non-obvious value?',
      },
      nguyenVan: 'Getting non-obvious value for XIRR returns in Google sheets',
      nguon: {
        url: 'https://money.stackexchange.com/questions/164458/getting-non-obvious-value-for-xirr-returns-in-google-sheets',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời được chấp nhận giải thích XIRR dùng số ngày thực tế của từng tháng rồi quy năm, nên kết quả không đúng tròn 12%. Muốn dùng tháng lý tưởng thì dùng IRR rồi tự quy năm.',
        en: 'The accepted answer explains XIRR uses the actual days of each month and then annualizes, so the result is not exactly 12%. For idealized months use IRR and annualize yourself.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/164458/getting-non-obvious-value-for-xirr-returns-in-google-sheets',
          ten: 'Money StackExchange',
        },
      ],
    },
  ],
  roi: [
    {
      hoi: {
        vi: 'Có thể so sánh trực tiếp mọi con số ROI giữa các doanh nghiệp không?',
        en: 'Can ROI figures be compared directly across all companies?',
      },
      nguyenVan: 'Có thể so sánh trực tiếp mọi con số ROI giữa các doanh nghiệp không?',
      nguon: {
        url: 'https://www.finhay.com.vn/roi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Cần thận trọng, vì mỗi doanh nghiệp có thể tính ROI theo cách khác nhau. Nên kiểm tra cách tính trước khi so sánh các con số với nhau.',
        en: 'Be careful, because companies may calculate ROI differently. Check how each figure was computed before comparing them.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/roi',
          ten: 'Finhay FAQs',
        },
      ],
    },
    {
      hoi: {
        vi: 'ROI có giải thích vì sao một khoản đầu tư hiệu quả hay kém hiệu quả không?',
        en: 'Does ROI explain why an investment performed well or poorly?',
      },
      nguyenVan: 'ROI có giải thích vì sao một khoản đầu tư hiệu quả hay kém hiệu quả không?',
      nguon: {
        url: 'https://www.finhay.com.vn/roi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Không. ROI cho biết tỷ lệ sinh lời nhưng không tự chỉ ra nguyên nhân khiến chỉ số cao hay thấp; cần xem thêm dự án hoặc doanh nghiệp đứng sau con số.',
        en: 'No. ROI shows the rate of gain but does not by itself show why it is high or low; you need to look at the project or business behind the number.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/roi',
          ten: 'Finhay FAQs',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tôi cần công thức tính ROI tổng thể cho toàn bộ thời gian, làm thế nào?',
        en: 'How do I calculate overall ROI for all time?',
      },
      nguyenVan: "I'm a programmer and need a formula for calculating overal ROI",
      nguon: {
        url: 'https://money.stackexchange.com/questions/26951/im-a-programmer-and-need-a-formula-for-calculating-overal-roi',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
  hpr: [
    {
      hoi: {
        vi: 'Ô cổ tức trong HPR nhập tổng hay mỗi cổ phiếu, đơn vị nào?',
        en: 'Is the dividend in HPR a total or per share, and in what unit?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Nhập tổng cổ tức tiền mặt nhận được trên mỗi cổ phiếu trong kỳ nắm giữ, tính bằng ₫, không phải phần trăm.',
        en: 'Enter the total cash dividend received per share during the holding period, in ₫, not in percent.',
      },
    },
    {
      hoi: {
        vi: 'Nếu kỳ nắm giữ không có cổ tức thì HPR ra gì?',
        en: 'If there is no dividend in the holding period, what is HPR?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Bằng lợi suất giá thuần: (giá cuối − giá đầu) ÷ giá đầu × 100. Ví dụ mua 50.000, bán 55.000, không cổ tức cho 10%.',
        en: 'It equals the plain price return: (ending price − starting price) ÷ starting price × 100. For example buying at 50,000 and selling at 55,000 with no dividend gives 10%.',
      },
    },
    {
      hoi: {
        vi: 'HPR có được quy ra theo năm không?',
        en: 'Is HPR annualized?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. HPR là mức lời của đúng kỳ bạn giữ, dù ngắn hay dài, không chia theo năm. Muốn so các kỳ giữ khác độ dài, hãy dùng CAGR.',
        en: 'No. HPR is the gain over exactly the period you held, short or long, with no yearly scaling. To compare periods of different length, use CAGR.',
      },
    },
    {
      hoi: {
        vi: 'Vì sao nhập giá đầu kỳ bằng 0 thì không tính được HPR?',
        en: "Why can't HPR be computed with a starting price of 0?",
      },
      tuSoan: true,
      traLoi: {
        vi: 'Giá đầu kỳ là mẫu số nên bằng 0 báo lỗi chia cho 0. Hãy nhập giá mua vào lớn hơn 0.',
        en: 'The starting price is the denominator, so 0 gives a divide-by-zero error. Enter a buy price greater than 0.',
      },
    },
    {
      hoi: {
        vi: 'HPR khác ROI ở điểm nào?',
        en: 'How does HPR differ from ROI?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'ROI chỉ nhìn chênh lệch giá trị, còn HPR cộng thêm dòng tiền cổ tức nhận trong kỳ vào tử số. Nhầm hai công thức này là lỗi thường gặp.',
        en: 'ROI looks only at the change in value, while HPR adds the dividends received during the period to the numerator. Mixing the two up is a common mistake.',
      },
    },
  ],
};
