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
    {
      hoi: {
        vi: 'Tại sao lỗ 2% mỗi tháng quy ra năm chỉ lỗ 21,53% chứ không phải 24%?',
        en: 'Why does a 2% loss every month annualize to a 21.53% loss rather than 24%?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Vì mỗi tháng lỗ trên số vốn đã nhỏ đi sau tháng trước: (1 − 2%) nhân với nhau 12 lần còn 0,7847, tức lỗ 21,53%. Chiều lãi thì ngược lại, 2% mỗi tháng quy năm ra 26,82%, nhiều hơn 24%, vì tháng sau lãi trên cả phần lãi trước. Phép nhân 12 chỉ gần đúng khi lợi suất một kỳ rất nhỏ.',
        en: 'Because each month loses on capital already shrunk by the month before: (1 − 2%) multiplied 12 times leaves 0.7847, a 21.53% loss. Gains work the other way: 2% a month annualizes to 26.82%, more than 24%, because each month also earns on the earlier gains. Multiplying by 12 is only close when the per-period return is very small.',
      },
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
    {
      hoi: {
        vi: 'Số ngày nắm giữ tính theo ngày lịch hay theo số phiên giao dịch?',
        en: 'Are days held counted as calendar days or as trading sessions?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Ngày lịch, từ ngày mua tới ngày bán, vì số mũ là 365 chia số ngày và 365 là số ngày lịch của một năm. Nhập số phiên giao dịch, vốn ít hơn số ngày lịch, thì số mũ lớn lên và kết quả bị phóng đại. Ví dụ FPT mua ngày 24/07/2026, bán ngày 11/09/2026 là 49 ngày lịch, quy năm ra 194,05%.',
        en: 'Calendar days, from the buy date to the sell date, because the exponent is 365 divided by the days and 365 is the number of calendar days in a year. Entering trading sessions, which are fewer than calendar days, makes the exponent larger and inflates the result. FPT bought on 2026-07-24 and sold on 2026-09-11 is 49 calendar days, which annualizes to 194.05%.',
      },
    },
    {
      hoi: {
        vi: 'Kết quả đã trừ phí giao dịch và thuế chuyển nhượng chưa?',
        en: 'Does the result already deduct trading fees and the transfer tax?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chưa, công thức chỉ dùng giá mua, giá bán và số ngày. Muốn tính sau phí, nhập giá mua đã cộng phí mua và phí lưu ký, giá bán đã trừ phí bán và thuế chuyển nhượng 0,1%, đều tính cho một cổ phiếu. Với phí môi giới mặc định 0,15% mỗi chiều và phí lưu ký 0,54 ₫ mỗi cổ phiếu cho 2 tháng, ví dụ FPT thành giá mua 62.994,89 ₫ và giá bán 72.518,25 ₫, quy năm còn 185,39% thay vì 194,05%.',
        en: "No, the formula uses only the buy price, the sell price and the days held. To see it after costs, enter a buy price with the buy fee and the custody fee added and a sell price net of the sell fee and the 0.1% transfer tax, all per share. With the default 0.15% brokerage fee each way and a custody fee of 0.54 ₫ per share for 2 months, FPT's example becomes a 62,994.89 ₫ buy and a 72,518.25 ₫ sell, which annualizes to 185.39% instead of 194.05%.",
      },
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
    {
      hoi: {
        vi: 'Tại sao ghép lãi mỗi ngày cũng không làm lãi suất hiệu dụng cao hơn ghép mỗi tháng là bao?',
        en: 'Why does daily compounding barely raise the effective rate above monthly compounding?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Vì mỗi lần ghép thêm, phần lãi trên lãi càng nhỏ, nên EAR tiến dần tới một trần chứ không tăng mãi. Với lãi 12%/năm: ghép mỗi năm ra 12%, mỗi tháng 12,68%, mỗi ngày 12,75%; ghép liên tục, tức e mũ 0,12 trừ 1, cũng chỉ ra 12,75%.',
        en: 'Because each extra compounding adds a smaller bit of interest on interest, so EAR approaches a ceiling instead of rising forever. At 12% a year: annual compounding gives 12%, monthly 12.68% and daily 12.75%; even continuous compounding, e to the power 0.12 minus 1, gives only 12.75%.',
      },
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
      traLoi: {
        vi: 'Đáp án được chấp nhận: tuỳ cách con số ấy xử lý cổ tức, vì có nơi giữ cổ tức thành tiền mặt, có nơi đem tái đầu tư ngay; tổng lợi suất (total return) thì gồm cả phần tăng giá lẫn cổ tức, giả định cổ tức được tái đầu tư. Trang này tính tổng lợi suất ấy, và nhân chứ không cộng: nếu 7,31% chỉ là phần tăng giá thì thêm cổ tức 1,9%, giữ 1 năm, ra 9,35% chứ không phải 9,21%.',
        en: 'The accepted answer: it depends on how the figure handles dividends, since some keep them as cash and others reinvest them at once; a total return includes both price gains and dividends, assuming the dividends are reinvested. This page computes that total return, and it multiplies rather than adds: if 7.31% is price growth alone, a 1.9% dividend held for 1 year gives 9.35%, not 9.21%.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/58127/is-dividend-factored-into-annualized-return',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tỷ suất cổ tức nhập theo số trước hay sau thuế cổ tức?',
        en: 'Should the dividend yield be entered before or after dividend tax?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Công thức dùng đúng con số bạn nhập, không tự trừ thuế. Cổ tức tiền mặt bị khấu trừ thuế 5%, nên muốn ra số tiền thật về tay thì nhập tỷ suất sau thuế, tức tỷ suất nhân 0,95: ở ví dụ, 2,75% thành 2,6125% và tổng lợi suất 5 năm giảm từ 176,65% xuống 174,8%.',
        en: 'The formula uses exactly the figure you enter and deducts no tax. Cash dividends are taxed at 5%, so to see what actually reaches you, enter the after-tax yield, the yield times 0.95: in the example 2.75% becomes 2.6125% and the five-year total return drops from 176.65% to 174.8%.',
      },
    },
    {
      hoi: {
        vi: 'Nếu tôi rút cổ tức ra tiêu, không mua thêm cổ phiếu, thì kết quả còn đúng không?',
        en: 'Is the result still right if I spend the dividends instead of buying more shares?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không hẳn. Công thức luôn giả định toàn bộ cổ tức mua thêm chính cổ phiếu ấy mỗi năm, nên không mô tả trường hợp rút ra tiêu, khi cổ tức chỉ đến từ số cổ phiếu ban đầu. Đặt ô Tỷ suất cổ tức / năm (y) bằng 0 để xem riêng phần do giá tăng: giá tăng 8%/năm trong 5 năm cho 46,93%, so với 70,34% khi thêm cổ tức 3% tái đầu tư.',
        en: 'Not quite. The formula always assumes every dividend buys more of the same stock each year, so it does not describe spending them, where dividends come only from the original shares. Set Dividend yield / year (y) to 0 to see the price part alone: 8% price growth a year over 5 years gives 46.93%, against 70.34% with a 3% dividend reinvested.',
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
    {
      hoi: {
        vi: 'Kết quả là lãi mỗi kỳ, muốn đổi ra lãi một năm thì làm thế nào?',
        en: 'The result is a rate per period, so how do I turn it into a yearly rate?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Kỳ là tháng thì nhân 12 ra lãi danh nghĩa năm, chưa tính lãi chồng lãi: ví dụ vay 3 tỷ ₫ trả 28 triệu ₫ mỗi tháng trong 240 tháng cho 0,79% mỗi tháng (đủ số là 0,7932%), nhân 12 ra 9,52% một năm. Lãi hiệu dụng năm, có tính lãi chồng lãi, thì lấy (1 + lãi tháng) mũ 12 trừ 1, ra 9,94%.',
        en: 'If the period is a month, multiply by 12 for the nominal yearly rate, without interest on interest: the 3 billion ₫ loan repaid at 28 million ₫ a month for 240 months gives 0.79% a month (0.7932% in full), which times 12 is 9.52% a year. For the effective yearly rate with interest on interest, take (1 + monthly rate) to the power 12 minus 1, which gives 9.94%.',
      },
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
    {
      hoi: {
        vi: 'Tại sao nhập lợi suất 0% thì màn báo lỗi?',
        en: 'Why does the screen show an error when the return is 0%?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Vì ở 0% vốn không bao giờ tăng nên không có thời gian nhân đôi: mẫu số ln(1 + r) bằng 0, phép chia không làm được, và màn nhắc lợi suất phải lớn hơn 0. Lợi suất càng sát 0 thì càng lâu: ở 1%/năm phải mất 69,66 năm vốn mới gấp đôi.',
        en: 'Because at 0% the capital never grows, so there is no doubling time: the denominator ln(1 + r) is 0, the division cannot be done, and the screen notes that the return must be greater than 0. The closer the return is to 0, the longer it takes: at 1% a year doubling takes 69.66 years.',
      },
    },
    {
      hoi: {
        vi: 'Tôi chỉ có lãi suất theo tháng thì nhập vào đây thế nào?',
        en: 'I only have a monthly rate, so how should I enter it here?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Ô này nhận lợi suất kép theo năm. Hãy quy lãi tháng ra năm trước bằng công thức Lợi suất năm hoá: 0,5% mỗi tháng thành 6,17% mỗi năm, và vốn gấp đôi sau 11,58 năm. Nhập thẳng 0,5 vào đây sẽ ra số năm sai, vì công thức hiểu đó là 0,5% một năm.',
        en: 'This field takes a yearly compound return. Convert the monthly rate first with the Annualized return formula: 0.5% a month becomes 6.17% a year, and the money doubles after 11.58 years. Entering 0.5 here directly gives the wrong number of years, because the formula reads it as 0.5% a year.',
      },
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
      traLoi: {
        vi: 'Trang trả lời: lạm phát làm giảm sức mua của đồng tiền, nên lãi tiết kiệm thấp hơn lạm phát thì tiền gửi mất giá trị thực. Ví dụ của trang, lãi 5%/năm với lạm phát 4%/năm, trừ thẳng ra 1%/năm; công thức này cho lợi suất thực 0,96%/năm, thấp hơn một chút vì chính phần dư cũng bị lạm phát làm mất giá.',
        en: "The page's answer: inflation erodes the purchasing power of money, so savings that earn less than inflation lose real value. Its example, 5% interest a year against 4% inflation, subtracts to 1% a year; this formula gives a real return of 0.96% a year, slightly lower, because the surplus itself is eroded by inflation.",
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/hoi-dap-dau-tu',
          ten: 'Finhay hỏi đáp đầu tư',
        },
      ],
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
      traLoi: {
        vi: 'Trang này chỉ trừ lạm phát, bằng phép chia (1 + lợi suất danh nghĩa) ÷ (1 + lạm phát) − 1, không tính thuế. Hãy trừ thuế trước rồi nhập lợi suất sau thuế: nếu thuế 3% đánh trên phần lãi thì lãi 10% còn 9,7%, với lạm phát 5% ra 4,48%, không phải 10 − 5 − 3 = 2%. Riêng cổ phiếu ở Việt Nam, thuế chuyển nhượng 0,1% tính trên giá bán, kể cả khi lỗ.',
        en: 'This page only removes inflation, as (1 + nominal return) ÷ (1 + inflation) − 1, and does not handle tax. Deduct tax first and enter the after-tax return: if a 3% tax applies to the gain, a 10% return becomes 9.7%, and with 5% inflation the result is 4.48%, not 10 − 5 − 3 = 2%. For Vietnamese stocks, the 0.1% transfer tax is charged on the sale value, even at a loss.',
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
      traLoi: {
        vi: 'Đáp án được chấp nhận cho rằng cụm từ ấy nhiều khả năng chỉ trung bình cộng, nhưng đồng ý rằng chỉ lợi suất hình học mới cho phép đi từ con số đầu tới đúng con số cuối. Trang này tính kiểu hình học: ở ví dụ VN-Index ba kỳ, tăng đều 17,48% mỗi kỳ ra đúng mức tăng gộp 62,13%, còn trung bình cộng 18,55% thì vượt mức ấy.',
        en: 'The accepted answer believes the phrase most likely means the arithmetic average, but agrees that only the geometric rate lets you get from the first figure to the last one exactly. This page computes the geometric kind: in the three-period VN-Index example, a steady 17.48% per period reproduces the combined 62.13% rise, while the 18.55% arithmetic average overshoots it.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/10408/what-does-average-revenue-growth-over-multiple-periods-of-time-mean',
          ten: 'Money StackExchange',
        },
      ],
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
      traLoi: {
        vi: 'Câu trả lời cao điểm nhất khuyên dùng lợi suất đơn giản, tức phần trăm thay đổi, và lấy trung bình hình học, vì trung bình cộng cho kết quả sai khi lãi cộng dồn. Trang này làm đúng như vậy. Nếu dùng lợi suất log thì trung bình cộng của chúng cho cùng tốc độ: e mũ trung bình ấy trừ 1 bằng đúng kết quả trang này, 17,48% ở ví dụ VN-Index.',
        en: 'The top-voted answer recommends simple returns, i.e. percentage changes, averaged geometrically, because an arithmetic average gives wrong results under compounding. This page does exactly that. With log returns, their arithmetic average gives the same growth rate: e to the power of that average minus 1 equals the result on this page, 17.48% in the VN-Index example.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/21449/risk-adjusted-performance-measurement-log-returns-vs-simple-returns-and-geomet',
          ten: 'Quant StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tại sao bấm Thêm kỳ, để kỳ mới ở 0%, mà kết quả lại giảm?',
        en: 'Why does the result drop when I press Add a period and leave the new period at 0%?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Vì kỳ 0% là một kỳ đi ngang có thật: tích các ngoặc (1 + lợi suất kỳ) giữ nguyên nhưng số kỳ tăng thêm một, nên mức đều mỗi kỳ bị kéo về phía 0, tức giảm khi các kỳ gộp lại đang lãi. Ba kỳ +10%, −5%, +20% cho 7,84% mỗi kỳ; thêm kỳ thứ tư 0% thì còn 5,82%. Nếu không có kỳ ấy, bấm Bỏ kỳ 4.',
        en: 'Because a 0% period is a real flat period: the product of the (1 + period return) terms stays the same while the period count goes up by one, so the steady per-period rate is pulled toward 0, which means it drops when the periods together show a gain. Three periods of +10%, −5% and +20% give 7.84% per period; adding a fourth at 0% gives 5.82%. If that period did not happen, press Remove period 4.',
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
