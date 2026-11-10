import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `performance` (`src/core/formulas/performance.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_PERFORMANCE: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'loi-suat-nam-hoa': [
    {
      hoi: {
        vi: 'Lợi suất 9% trong 3 tháng thì lợi suất năm hoá có phải là 4 nhân 9% bằng 36% không?',
        en: 'If I earn 9% in 3 months, is the annualized return 4 x 9% = 36%?',
      },
      nguyenVan: 'Is this how to calculate annualized return?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/96315/is-this-how-to-calculate-annualized-return',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Theo câu trả lời được chấp nhận, năm hoá là quy về mức lợi suất năm tương đương của một khoản đầu tư không tròn năm, không phải dự báo năm sau. Nếu lãi cộng dồn thì lấy 1,09 nhân bốn lần chứ không cộng 9% bốn lần.',
        en: 'The accepted answer says annualizing means finding the equivalent yearly return of a non-annual investment, not predicting next year. With compounding you multiply 1.09 four times rather than adding 9% four times.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/96315/is-this-how-to-calculate-annualized-return',
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
        vi: 'Câu trả lời được chấp nhận cho rằng không có khác biệt: lợi suất năm hoá và CAGR đều là (1 + lợi suất đơn) mũ (1 ÷ số năm) trừ 1. Ở sản phẩm này công thức viết (1 + lợi suất một kỳ) mũ số kỳ trong năm trừ 1, cùng ý, với số kỳ trong năm là 1 ÷ số năm của một kỳ.',
        en: 'The accepted answer says there is no difference: annualized return and CAGR are both (1 + simple return) to the power of (1 / years) minus 1. Here the formula is written (1 + return per period) to the power of periods per year minus 1, the same idea, with periods per year equal to 1 / years of one period.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/78132/annualized-return-vs-cagr-of-investment',
          ten: 'Money StackExchange',
        },
      ],
    },
  ],
  'loi-suat-quy-nam-theo-ngay': [
    {
      hoi: {
        vi: 'Cách đúng để tính ROI mỗi năm từ ROI của một khoảng thời gian là gì?',
        en: 'What is the proper way to calculate ROI per year given the ROI for a period of time?',
      },
      nguyenVan:
        "What's the proper way to calculate ROI per year given the ROI for a period of time?",
      nguon: {
        url: 'https://money.stackexchange.com/questions/35897/whats-the-proper-way-to-calculate-roi-per-year-given-the-roi-for-a-period-of-ti',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Theo câu trả lời được chấp nhận, lãi là hàm mũ chứ không phải phép nhân đơn: hệ số tăng 1,0578 trong 97 ngày thì quy năm là 1,0578 mũ (365 ÷ 97), ra khoảng 23,5% một năm.',
        en: 'The accepted answer says interest compounds as a power, not simple multiplication: a growth factor of 1.0578 over 97 days annualizes to 1.0578 to the power of (365 / 97), about 23.5% a year.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/35897/whats-the-proper-way-to-calculate-roi-per-year-given-the-roi-for-a-period-of-ti',
          ten: 'Money StackExchange',
        },
      ],
    },
  ],
  'lai-suat-hieu-dung': [
    {
      hoi: {
        vi: 'Khác nhau giữa lãi suất danh nghĩa và APY là gì?',
        en: 'What is the difference between interest rate and APY?',
      },
      nguyenVan: 'What is the difference between Interest Rate and APY?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/1528/what-is-the-difference-between-interest-rate-and-apy',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời được chấp nhận: APY tính cả hiệu ứng lãi kép còn APR thì không; chênh lệch chỉ có khi trả lãi nhiều hơn một lần mỗi năm. APY bằng (1 + r ÷ n) mũ n trừ 1.',
        en: 'The accepted answer: APY includes the effect of compounding while APR does not; the gap only matters when interest is paid more than once a year. APY is (1 + r / n) to the power n minus 1.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/1528/what-is-the-difference-between-interest-rate-and-apy',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Lãi suất 7% một năm ghép lãi theo quý trong 5 năm thì EAR và tổng lợi suất là bao nhiêu?',
        en: 'With an APR of 7% for 5 years compounded quarterly, what are the EAR and total return?',
      },
      nguyenVan:
        'Suppose earning an APR of 7% for 5 years, with interest compounded quarterly. What is the EAR? What is the Total Return?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/28267/suppose-earning-an-apr-of-7-for-5-years-with-interest-compounded-quarterly-wh',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời được chấp nhận chia 7% cho 4 được 1,75% mỗi quý, rồi lấy (1,0175) mũ 4 trừ 1 ra EAR khoảng 7,19% một năm.',
        en: 'The accepted answer divides 7% by 4 to get 1.75% per quarter, then (1.0175)^4 minus 1 gives an EAR of about 7.19% a year.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/28267/suppose-earning-an-apr-of-7-for-5-years-with-interest-compounded-quarterly-wh',
          ten: 'Money StackExchange',
        },
      ],
    },
  ],
  'tong-loi-suat-tai-dau-tu': [
    {
      hoi: {
        vi: 'Cổ tức có được tính vào lợi suất năm hoá không?',
        en: 'Is dividend factored into annualized return?',
      },
      nguyenVan: 'Is dividend factored into Annualized return?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/58127/is-dividend-factored-into-annualized-return',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
  'irr-nien-kim': [
    {
      hoi: {
        vi: 'Trực giác đằng sau tỷ suất hoàn vốn nội bộ (IRR) là gì?',
        en: 'What is the intuition behind the internal rate of return (IRR)?',
      },
      nguyenVan: 'Intuition behind Internal Rate of Return (IRR)',
      nguon: {
        url: 'https://money.stackexchange.com/questions/102611/intuition-behind-internal-rate-of-return-irr',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời được chấp nhận: IRR chỉ có ích khi so với lợi suất yêu cầu hay lợi suất của khoản đầu tư rủi ro tương đương. IRR cao hơn mức yêu cầu thì NPV tại mức yêu cầu là dương.',
        en: 'The accepted answer: IRR is only useful compared with your required return or the return of equally risky investments. If IRR exceeds the required return, NPV at the required rate is positive.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/102611/intuition-behind-internal-rate-of-return-irr',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Chứng minh toán học cho cách diễn giải IRR âm là gì?',
        en: 'What is the mathematical proof for the interpretation of negative IRR?',
      },
      nguyenVan: 'Mathematical proof for justification of interpretation of negative IRR',
      nguon: {
        url: 'https://money.stackexchange.com/questions/87348/mathematical-proof-for-justification-of-interpretation-of-negative-irr',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời được chấp nhận: IRR là mức chiết khấu làm tổng giá trị hiện tại các dòng tiền bằng 0. Nếu tổng các khoản nhận về, chưa chiết khấu, nhỏ hơn vốn bỏ ra thì phương trình có nghiệm âm, tức khoản đầu tư mất giá trị.',
        en: 'The accepted answer: IRR is the discount rate that sets the present value of all cash flows to zero. If the undiscounted amounts received add up to less than the amount invested, the equation has a negative solution, meaning the investment lost value.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/87348/mathematical-proof-for-justification-of-interpretation-of-negative-irr',
          ten: 'Money StackExchange',
        },
      ],
    },
  ],
  'thoi-gian-nhan-doi': [
    {
      hoi: {
        vi: 'Quy tắc 70 hay quy tắc 72 trong đầu tư là gì và áp dụng thế nào?',
        en: 'What is the rule of 70 or rule of 72 in investing, and how do I apply it?',
      },
      nguyenVan:
        'What is the "rule of 70" or "rule of 72" with regards to investment, and how do I apply it?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/28542/what-is-the-rule-of-70-or-rule-of-72-with-regards-to-investment-and-how-do',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời cao điểm nhất cho biết số năm để vốn nhân đôi xấp xỉ bằng 72 chia cho lợi suất năm tính bằng phần trăm, ví dụ 6% một năm thì khoảng 12 năm, giả định lãi được tái đầu tư. Một câu khác trong chủ đề cho công thức chính xác ln 2 ÷ ln(1 + r).',
        en: 'The top-voted answer says years to double is roughly 72 divided by the yearly return in percent, for example about 12 years at 6% a year, assuming returns are reinvested. Another answer in the thread gives the exact formula ln 2 / ln(1 + r).',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/28542/what-is-the-rule-of-70-or-rule-of-72-with-regards-to-investment-and-how-do',
          ten: 'Money StackExchange',
        },
      ],
    },
  ],
  'loi-suat-thuc': [
    {
      hoi: {
        vi: 'Lạm phát ảnh hưởng đến tiền tiết kiệm như thế nào?',
        en: 'How does inflation affect savings?',
      },
      nguyenVan: 'Lạm phát ảnh hưởng tiết kiệm thế nào?',
      nguon: {
        url: 'https://www.finhay.com.vn/hoi-dap-dau-tu',
        ten: 'Finhay hỏi đáp đầu tư',
        noi: 'faq',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'Tại sao phải trừ lạm phát mỗi năm thay vì chỉ trừ một lần khi bán?',
        en: 'Why adjust returns for inflation every year instead of once at the end of the holding period?',
      },
      nguyenVan:
        'Why adjust for inflation annually, as opposed to realising it after the holding period?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/56838/why-adjust-for-inflation-annually-as-opposed-to-realising-it-after-the-holding',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Mỗi năm giá trị tăng (1 + lãi suất) lần và sức mua giảm (1 + lạm phát) lần, nên kết quả sau n năm bằng (1 + lãi suất)^n chia (1 + lạm phát)^n. Điều chỉnh từng năm hay một lần cuối kỳ đều cho cùng số.',
        en: 'Each year value grows by (1 + rate) and purchasing power shrinks by (1 + inflation), so after n years the result is (1 + rate)^n divided by (1 + inflation)^n. Adjusting yearly or once at the end gives the same number.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/56838/why-adjust-for-inflation-annually-as-opposed-to-realising-it-after-the-holding',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tính lợi suất thực sau lạm phát và thuế như thế nào?',
        en: 'How do I calculate my real return after inflation and tax?',
      },
      nguyenVan: 'How should I calculate how much my money is _grown_?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/106290/how-should-i-calculate-how-much-my-money-is-grown',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
  'loi-suat-trung-binh-hinh-hoc': [
    {
      hoi: {
        vi: '"Tăng trưởng doanh thu bình quân" nhiều kỳ nghĩa là trung bình cộng hay lợi suất hình học?',
        en: 'Does "average growth" over several periods mean the arithmetic average or the geometric rate of return?',
      },
      nguyenVan: 'What does "average revenue growth" over multiple periods of time mean?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/10408/what-does-average-revenue-growth-over-multiple-periods-of-time-mean',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
    {
      hoi: {
        vi: 'Khi đánh giá rủi ro, nên dùng lợi suất log hay đơn giản, trung bình hình học hay trung bình cộng?',
        en: 'For risk-adjusted measures, should I use log or simple returns, and geometric or arithmetic mean?',
      },
      nguyenVan:
        'Risk-adjusted performance measurement: Log returns vs. simple returns and geometric vs. arithmetic mean return',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/21449/risk-adjusted-performance-measurement-log-returns-vs-simple-returns-and-geomet',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
  'loi-suat-vuot-chuan': [
    {
      hoi: {
        vi: 'Kết quả hiện đơn vị % thì có phải là phần trăm của lợi suất chuẩn không?',
        en: 'The result is shown in %. Is it a percentage of the benchmark return?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Nó là hiệu hai lợi suất (rp − rb), tính bằng điểm phần trăm dù màn hình ghi %. Ví dụ danh mục 12% và chuẩn 8% cho 4, không phải hơn 50%.',
        en: 'No. It is the difference of two returns (rp − rb), measured in percentage points although the screen shows %. For example a 12% portfolio against an 8% benchmark gives 4, not 50% more.',
      },
    },
    {
      hoi: {
        vi: 'Kết quả âm hoặc bằng 0 nghĩa là gì?',
        en: 'What does a negative or zero result mean?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Âm nghĩa là danh mục kém chuẩn so sánh trong cùng kỳ, bằng 0 là ngang bằng. Con số này là hiệu thuần, chưa điều chỉnh theo rủi ro đã chịu.',
        en: 'Negative means the portfolio trailed the benchmark over the same period, zero means level. It is a plain difference, not adjusted for the risk taken.',
      },
    },
    {
      hoi: {
        vi: 'Lợi suất danh mục hay chuẩn dưới −100% thì sao?',
        en: 'What if the portfolio or benchmark return is below -100%?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Ô nào có lợi suất dưới −100% thì bị báo lỗi, vì không thể mất nhiều hơn toàn bộ vốn. Nếu cả hai cùng dưới −100%, lỗi báo ở lợi suất danh mục trước. Mức −100% là mất sạch vốn.',
        en: 'Whichever field is below −100% is flagged, because you cannot lose more than all your capital. If both are below −100%, the portfolio return is flagged first. −100% means the whole capital is lost.',
      },
    },
    {
      hoi: {
        vi: 'Lợi suất chuẩn nên lấy của kỳ nào?',
        en: 'Which period should the benchmark return cover?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Đúng cùng khoảng thời gian với lợi suất danh mục, ví dụ VN-Index trong cùng kỳ. Hai lợi suất lệch kỳ tính thì hiệu số không còn ý nghĩa; đây là lỗi thường gặp.',
        en: 'Exactly the same span as the portfolio return, for example the VN-Index over the same period. If the two returns cover different periods the difference means nothing; this is a common mistake.',
      },
    },
  ],
};
