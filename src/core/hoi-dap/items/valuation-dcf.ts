import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `valuation-dcf` (`src/core/formulas/valuation-dcf.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_VALUATION_DCF: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'mo-hinh-gordon': [
    {
      hoi: {
        vi: 'Công thức giá trị cuối kỳ (terminal value) bắt nguồn từ đâu?',
        en: 'Where does the terminal value formula come from?',
      },
      nguyenVan: 'Where does the formula for terminal value come from?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/148546/where-does-the-formula-for-terminal-value-come-from',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đó là giá trị hiện tại của một dòng tiền vĩnh viễn tăng đều: dòng tiền kỳ tới chia cho (suất chiết khấu trừ tốc độ tăng trưởng). Dòng tiền kỳ tới là dòng tiền hiện tại nhân (1 + g), và công thức đóng gói gọn toàn bộ dòng tiền về sau nên không bỏ sót kỳ nào.',
        en: "It is the present value of a perpetuity that grows at a constant rate: next period's cash flow divided by (discount rate minus growth rate). Next period's flow is the current one times (1 + g), and the closed form already sums every later cash flow, so none is lost.",
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/148546/where-does-the-formula-for-terminal-value-come-from',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Logic đằng sau mô hình tăng trưởng Gordon trong phân tích DCF là gì?',
        en: 'What is the logic behind the Gordon growth model in a DCF analysis?',
      },
      nguyenVan: 'Logic behind Gordon Growth Model in a DCF analysis?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/14050/logic-behind-gordon-growth-model-in-a-dcf-analysis',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời cao điểm nhất: giá trị cuối kỳ tính ở năm 5 chỉ gồm dòng tiền từ năm 6 trở đi và phải chiết khấu tiếp về hôm nay, nên các năm đầu không bị đếm hai lần. Nếu dòng tiền tăng đều g ngay từ năm đầu, tổng mọi khoản đã chiết khấu thu gọn đúng thành D0 × (1 + g) ÷ (r − g), chính công thức trang này dùng cho cổ tức.',
        en: 'The top-voted answer: the terminal value at year 5 covers only the cash flows from year 6 on and must itself be discounted back to today, so the early years are not counted twice. If cash flows grow at g from the first year, the sum of every discounted flow collapses exactly to D0 × (1 + g) ÷ (r − g), the formula this page applies to dividends.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/14050/logic-behind-gordon-growth-model-in-a-dcf-analysis',
          ten: 'Quant StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tại sao đặt tăng trưởng g bằng hoặc cao hơn suất sinh lợi yêu cầu r thì màn báo lỗi thay vì ra một mức giá?',
        en: 'Why does the screen show an error instead of a price when growth g is equal to or above the required return r?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Mẫu số là r − g. Khi r bằng g, mẫu số bằng 0 nên màn báo chia cho 0; khi r nhỏ hơn g, giá trị ra số âm nên màn báo kết quả không có ý nghĩa. Ví dụ FPT với r = 11,92% và g = 5% cho 30.346,82 ₫, đẩy g lên 11,92% là hết tính được. Hãy hạ g về mức tăng bền vững dài hạn, hoặc dùng DDM hai giai đoạn cho những năm tăng nhanh.',
        en: "The denominator is r − g. When r equals g it is 0, so the screen reports a divide-by-zero; when r is below g the value turns negative, so it reports a meaningless result. FPT's example with r = 11.92% and g = 5% gives 30,346.82 ₫, and raising g to 11.92% stops the calculation. Lower g to a sustainable long-term rate, or use the two-stage DDM for the fast-growth years.",
      },
    },
  ],
  'ddm-hai-giai-doan': [
    {
      hoi: {
        vi: 'Công thức giá trị cuối kỳ (terminal value) bắt nguồn từ đâu?',
        en: 'Where does the terminal value formula come from?',
      },
      nguyenVan: 'Where does the formula for terminal value come from?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/148546/where-does-the-formula-for-terminal-value-come-from',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đó là giá trị hiện tại của một dòng tiền vĩnh viễn tăng đều: dòng tiền kỳ tới chia cho (suất chiết khấu trừ tốc độ tăng trưởng). Dòng tiền kỳ tới là dòng tiền hiện tại nhân (1 + g), và công thức đóng gói gọn toàn bộ dòng tiền về sau nên không bỏ sót kỳ nào.',
        en: "It is the present value of a perpetuity that grows at a constant rate: next period's cash flow divided by (discount rate minus growth rate). Next period's flow is the current one times (1 + g), and the closed form already sums every later cash flow, so none is lost.",
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/148546/where-does-the-formula-for-terminal-value-come-from',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Logic đằng sau mô hình tăng trưởng Gordon trong phân tích DCF là gì?',
        en: 'What is the logic behind the Gordon growth model in a DCF analysis?',
      },
      nguyenVan: 'Logic behind Gordon Growth Model in a DCF analysis?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/14050/logic-behind-gordon-growth-model-in-a-dcf-analysis',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời cao điểm nhất: giá trị cuối kỳ tính ở năm n chỉ gồm dòng tiền từ năm n + 1 trở đi và phải chiết khấu về hôm nay, nên các năm đầu không bị đếm hai lần. Trang này làm đúng như vậy: số hạng thứ hai lấy cổ tức năm n nhân (1 + g2), chia (r − g2), rồi chia tiếp (1 + r)^n. Khi g1 bằng g2, kết quả trùng Mô hình Gordon: cổ tức 3.000 ₫, g 4%, r 12% đều ra 39.000 ₫.',
        en: 'The top-voted answer: the terminal value at year n covers only the cash flows from year n + 1 on and must be discounted back to today, so the early years are not counted twice. This page does exactly that: the second term takes the year-n dividend times (1 + g2), divides by (r − g2), then by (1 + r)^n. When g1 equals g2 the result matches the Gordon model: a 3,000 ₫ dividend, g 4% and r 12% give 39,000 ₫ either way.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/14050/logic-behind-gordon-growth-model-in-a-dcf-analysis',
          ten: 'Quant StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tăng trưởng giai đoạn đầu g1 cao hơn suất sinh lợi yêu cầu r thì có tính được không?',
        en: 'Can first-stage growth g1 be higher than the required return r?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Được. Giai đoạn đầu chỉ kéo dài n năm nên tổng của nó luôn hữu hạn; về tăng trưởng, màn chỉ đòi r lớn hơn tăng trưởng dài hạn g2. Ví dụ FPT dùng g1 = 14% với r = 11,92% vẫn ra 43.845,09 ₫. Nếu g2 bằng r thì màn báo chia cho 0, g2 lớn hơn r thì báo kết quả không có ý nghĩa.',
        en: "Yes. The first stage lasts only n years, so its sum is always finite; as for growth, the screen only requires r to exceed the long-term growth g2. FPT's example uses g1 = 14% with r = 11.92% and still gives 43,845.09 ₫. If g2 equals r the screen reports a divide-by-zero, and if g2 is above r it reports a meaningless result.",
      },
    },
  ],
  capm: [
    {
      hoi: {
        vi: 'Nhà đầu tư cá nhân có nên học và dùng mô hình CAPM không?',
        en: 'Should retail investors learn and use the capital asset pricing model (CAPM)?',
      },
      nguyenVan: 'Should retail investors learn and use the capital asset pricing model (CAPM)?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/131560/should-retail-investors-learn-and-use-the-capital-asset-pricing-model-capm',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Ở mức cơ bản thì có ích: beta mà các trang tài chính đưa ra là hệ số hồi quy của lợi suất cổ phiếu theo lợi suất thị trường, đo độ nhạy với thị trường. Beta gần 0 chỉ nghĩa là ít tương quan với thị trường, chứ không phải không có rủi ro.',
        en: "At a basic level it helps: the beta shown on finance sites is the regression coefficient of a stock's returns on market returns, a measure of sensitivity to the market. A beta near zero only means little correlation with the market, not that the asset is risk-free.",
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/131560/should-retail-investors-learn-and-use-the-capital-asset-pricing-model-capm',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tại sao nhập beta âm có lúc vẫn ra kết quả, có lúc màn lại báo kết quả không có ý nghĩa?',
        en: 'Why does a negative beta sometimes give a result and sometimes a meaningless-result warning?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Beta âm làm phần bù β × ERP thành số âm, kéo chi phí vốn chủ xuống dưới lãi suất phi rủi ro. Kết quả còn từ 0 trở lên thì vẫn tính: với rf 4,57% và ERP 8,13%, beta −0,3 cho 2,13%. Xuống dưới 0 thì màn báo kết quả không có ý nghĩa, như beta −0,6 với cùng bộ số, vì suất chiết khấu âm không dùng được.',
        en: 'A negative beta makes the β × ERP premium negative and pulls the cost of equity below the risk-free rate. As long as the result stays at 0 or above it is computed: with rf 4.57% and ERP 8.13%, a beta of −0.3 gives 2.13%. Below 0 the screen reports a meaningless result, as with a beta of −0.6 on the same inputs, because a negative discount rate cannot be used.',
      },
    },
    {
      hoi: {
        vi: 'Kết quả CAPM được dùng tiếp ở những công thức nào?',
        en: 'Which formulas use the CAPM result next?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Ở chế độ Nâng cao, ô Suất sinh lợi yêu cầu (r) của Mô hình Gordon và ô Chi phí vốn chủ (re) của WACC có thể lấy sẵn kết quả này; WACC lại chuyển số sang Giá trị nội tại từ FCFF. Hai ô nhận số vẫn sửa được nếu bạn có chi phí vốn chủ từ nguồn khác. Ở các ví dụ, 11,92% của FPT chính là r của Mô hình Gordon và re của WACC.',
        en: "In Advanced mode, the Required rate of return (r) field of the Gordon model and the Cost of equity (re) field of WACC can take this result directly, and WACC in turn feeds Intrinsic value from FCFF. Both receiving fields can still be edited if you have a cost of equity from another source. In the examples, FPT's 11.92% is the r of the Gordon model and the re of WACC.",
      },
    },
  ],
  wacc: [
    {
      hoi: {
        vi: 'Vì sao khi chiết khấu dòng tiền người ta dùng WACC thay vì chi phí cơ hội?',
        en: 'Why do we discount cash flows with WACC instead of the opportunity cost?',
      },
      nguyenVan: 'Why do we discount cash flows with WACC instead of the opportunity cost?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/140803/why-do-we-discount-cash-flows-with-wacc-instead-of-the-opportunity-cost',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án được chấp nhận: WACC chính là chi phí cơ hội của những người góp vốn vào công ty, cổ đông và chủ nợ, đã tính theo tỷ trọng và rủi ro của từng bên. Công ty làm ra dưới mức ấy thì người góp vốn thà tự đem tiền đi nơi khác. Chi phí cơ hội riêng của bạn vẫn đáng cân nhắc, nhưng không đổi mức sinh lời mà chính công ty phải đạt.',
        en: "The accepted answer: WACC is the opportunity cost of the people who fund the company, shareholders and lenders, weighted by each one's share and risk. If the company earns less than that, its investors would do better taking the money elsewhere. Your own opportunity cost still matters to your decision, but it does not change the return the company itself must earn.",
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/140803/why-do-we-discount-cash-flows-with-wacc-instead-of-the-opportunity-cost',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Dùng WACC để đầu tư như thế nào?',
        en: 'How to use WACC for investment?',
      },
      nguyenVan: 'How to use WACC for investment?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/15939/how-to-use-wacc-for-investment',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'WACC là mức sinh lời tối thiểu công ty phải làm ra trên toàn bộ vốn để trả đủ cho chủ nợ lẫn cổ đông. Cách dùng thứ nhất là so với mức sinh lời trên vốn của công ty hay dự án: cao hơn WACC là trả đủ cả hai bên mà còn dư. Cách thứ hai là làm suất chiết khấu dòng tiền ở công thức Giá trị nội tại từ FCFF. WACC thấp hơn nghĩa là vốn rẻ hơn, cùng dòng tiền thì định giá ra cao hơn, nhưng tự nó không nói cổ phiếu rẻ hay đắt.',
        en: 'WACC is the minimum return a company must earn on all its capital to pay both lenders and shareholders what they ask. One use is to compare it with the return the company or a project earns on capital: above WACC means both are paid with something left over. The other is as the discount rate for cash flow in the Intrinsic value from FCFF formula. A lower WACC means cheaper capital, so the same cash flow is valued higher, but on its own it does not say whether a stock is cheap or expensive.',
      },
    },
    {
      hoi: {
        vi: 'Công ty không vay nợ thì WACC ra bao nhiêu?',
        en: 'What is WACC for a company with no debt?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Bằng đúng chi phí vốn chủ, vì tỷ trọng nợ D ÷ (E + D) bằng 0: vốn hoá FPT 124.631,5 tỷ ₫, nợ vay 0 và chi phí vốn chủ 11,92% cho WACC 11,92%. Chỉ khi cả vốn hoá lẫn nợ vay cùng bằng 0 thì mẫu số E + D bằng 0 và màn báo chia cho 0.',
        en: "Exactly the cost of equity, because the debt weight D ÷ (E + D) is 0: FPT's market cap of 124,631.5 billion ₫, zero debt and an 11.92% cost of equity give a WACC of 11.92%. Only when market cap and debt are both 0 does the E + D denominator become 0, and the screen reports a divide-by-zero.",
      },
    },
  ],
  fcff: [
    {
      hoi: {
        vi: 'Vì sao DCF bỏ qua khấu hao và phân bổ (D&A)?',
        en: 'Why does DCF ignore depreciation and amortization?',
      },
      nguyenVan: 'Why does DCF ignore depreciation & amortization?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/127261/why-does-dcf-ignore-depreciation-amortization',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Một câu trả lời trong chủ đề: khấu hao không làm tiền rời tài khoản, tiền đã ra lúc mua tài sản. Trên trang này khấu hao không bị bỏ: nó đã được trừ trong EBIT như một chi phí, nên làm giảm thuế, rồi được cộng lại vì không phải tiền chi ra; còn tiền mua tài sản bị trừ ở ô CapEx đúng kỳ chi. Ví dụ FPT năm 2025 cộng lại 2.795,9 tỷ ₫ khấu hao và trừ 5.097,9 tỷ ₫ CapEx.',
        en: "One answer in the thread: depreciation does not take cash out of the account; the cash left when the asset was bought. This page does not drop D&A: it is already deducted inside EBIT as an expense, which lowers tax, then added back because no cash is paid out, while the cash spent on assets is subtracted in the CapEx field in the period it is spent. FPT's 2025 example adds back 2,795.9 billion ₫ of D&A and subtracts 5,097.9 billion ₫ of CapEx.",
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/127261/why-does-dcf-ignore-depreciation-amortization',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tại sao EBIT âm thì màn báo kết quả không có ý nghĩa, còn đặt thuế suất 0% thì lại tính được?',
        en: 'Why does a negative EBIT give a meaningless-result warning, yet the formula works when the tax rate is 0%?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Với thuế suất dương, EBIT × (1 − t) của một EBIT âm ngầm cộng lại một khoản hoàn thuế không có thật, nên màn báo kết quả không có ý nghĩa. Ở thuế suất 0%, số hạng ấy chỉ là chính EBIT nên năm lỗ vẫn tính được: EBIT −100, khấu hao 120, CapEx 180, tăng vốn lưu động ròng 40 cho FCFF −200 tỷ ₫.',
        en: 'At a positive tax rate, EBIT × (1 − t) on a negative EBIT quietly adds back a tax refund that does not exist, so the screen reports a meaningless result. At 0% that term is just EBIT, so a loss year still computes: EBIT −100, D&A 120, CapEx 180 and a net working capital increase of 40 give an FCFF of −200 billion ₫.',
      },
    },
    {
      hoi: {
        vi: 'Ô Tăng vốn lưu động ròng (ΔNWC) nhập số âm được không?',
        en: 'Can I enter a negative number in the Increase in net working capital (ΔNWC) field?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Được. Số âm nghĩa là vốn lưu động giảm trong kỳ, như hàng tồn kho bán bớt hay khách trả nợ nhanh hơn, tiền được giải phóng nên FCFF tăng lên. Với bộ số mặc định, tăng vốn lưu động 40 tỷ ₫ cho FCFF 300 tỷ ₫, còn nhập −40 thì FCFF thành 380 tỷ ₫.',
        en: 'Yes. A negative figure means working capital fell during the period, for instance inventory was run down or customers paid faster, which frees cash and raises FCFF. With the default inputs a 40 billion ₫ increase gives an FCFF of 300 billion ₫, while entering −40 gives 380 billion ₫.',
      },
    },
  ],
  'gia-tri-noi-tai-fcff': [
    {
      hoi: {
        vi: 'Công thức giá trị cuối kỳ (terminal value) bắt nguồn từ đâu?',
        en: 'Where does the terminal value formula come from?',
      },
      nguyenVan: 'Where does the formula for terminal value come from?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/148546/where-does-the-formula-for-terminal-value-come-from',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đó là giá trị hiện tại của một dòng tiền vĩnh viễn tăng đều: dòng tiền kỳ tới chia cho (suất chiết khấu trừ tốc độ tăng trưởng). Dòng tiền kỳ tới là dòng tiền hiện tại nhân (1 + g), và công thức đóng gói gọn toàn bộ dòng tiền về sau nên không bỏ sót kỳ nào.',
        en: "It is the present value of a perpetuity that grows at a constant rate: next period's cash flow divided by (discount rate minus growth rate). Next period's flow is the current one times (1 + g), and the closed form already sums every later cash flow, so none is lost.",
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/148546/where-does-the-formula-for-terminal-value-come-from',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Vì sao DCF bỏ qua khấu hao và phân bổ (D&A)?',
        en: 'Why does DCF ignore depreciation and amortization?',
      },
      nguyenVan: 'Why does DCF ignore depreciation & amortization?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/127261/why-does-dcf-ignore-depreciation-amortization',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Một câu trả lời trong chủ đề: khấu hao không làm tiền rời tài khoản, tiền đã ra lúc mua tài sản. Trang này không bỏ khấu hao: nó đã nằm trong ô FCFF, vì công thức FCFF trừ khấu hao trong EBIT rồi cộng lại, còn tiền mua tài sản thì trừ ở CapEx. Vì vậy hãy nhập FCFF đã trừ CapEx và tăng vốn lưu động, đừng nhập EBITDA, nếu không giá trị nội tại bị thổi phồng.',
        en: 'One answer in the thread: depreciation does not take cash out of the account; the cash left when the asset was bought. This page does not drop D&A: it is already inside the FCFF field, since the FCFF formula deducts it within EBIT and adds it back, while the cash spent on assets is subtracted as CapEx. So enter an FCFF net of CapEx and the working capital increase, not EBITDA, or the intrinsic value will be inflated.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/127261/why-does-dcf-ignore-depreciation-amortization',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Số cổ phiếu lưu hành nhập theo đơn vị nào, và tại sao công thức nhân thêm 1.000?',
        en: 'What unit is the share count entered in, and why does the formula multiply by 1,000?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Số cổ phiếu tính bằng triệu cổ phiếu (FPT là 1.714,33), còn các ô tiền tính bằng tỷ ₫. Tỷ ₫ chia triệu cổ phiếu ra nghìn ₫ mỗi cổ phiếu, nên nhân 1.000 để kết quả về đồng: ví dụ FPT ra 60.651,46 ₫. Ô này nhận tối đa 100.000 triệu cổ phiếu, nên gõ đủ số như 1.714.330.000 thì ô báo vượt mức, rời ô sẽ bị kéo về 100.000.',
        en: "The share count is in millions of shares (1,714.33 for FPT), while the money fields are in billion ₫. Billion ₫ divided by million shares gives thousand ₫ per share, so the result is multiplied by 1,000 to come out in dong: FPT's example gives 60,651.46 ₫. The field accepts at most 100,000 million shares, so typing the full count such as 1,714,330,000 is flagged as too large, and leaving the field pulls it back to 100,000.",
      },
    },
  ],
  'bien-an-toan': [
    {
      hoi: {
        vi: 'Làm sao tính biên an toàn theo Graham?',
        en: "How do I calculate Graham's margin of safety?",
      },
      nguyenVan: "How to calculate Graham's margin of safety?",
      nguon: {
        url: 'https://money.stackexchange.com/questions/142454/how-to-calculate-grahams-margin-of-safety',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời trong chủ đề: ước một giá trị nội tại rồi so với giá đang giao dịch; giá trị 100 mà giá 80 thì biên an toàn 20%, đúng phép (V − P) ÷ V × 100% trên trang này. Phần khó là ước giá trị nội tại, vì nó dựa vào giả định về tăng trưởng và lợi nhuận tương lai; biên càng lớn thì càng chừa chỗ cho ước tính sai.',
        en: 'The answer in the thread: estimate an intrinsic value and compare it with the trading price; a value of 100 against a price of 80 is a 20% margin of safety, exactly the (V − P) ÷ V × 100% on this page. The hard part is the intrinsic value, which rests on assumptions about future growth and earnings; a larger margin leaves more room for that estimate to be wrong.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/142454/how-to-calculate-grahams-margin-of-safety',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Nếu mua cổ phiếu đúng bằng giá trị nội tại thì tỷ suất sinh lời có bằng suất chiết khấu không?',
        en: 'If I buy a stock at its intrinsic value, is my return equal to the discount rate?',
      },
      nguyenVan:
        'Is the return rate equal to the discount rate if I buy a stock at its intrinsic value?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/149731/is-the-return-rate-equal-to-the-discount-rate-if-i-buy-a-stock-at-its-intrinsic',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời cao điểm nhất: có, nếu ước tính đúng và suất chiết khấu, tăng trưởng không đổi, lợi suất danh nghĩa mỗi năm bằng đúng suất chiết khấu. Kiểm bằng Mô hình Gordon: mua đúng 30.346,82 ₫ thì cổ tức năm tới 2.100 ₫ bằng 6,92% giá mua, cộng tăng trưởng 5% ra đúng r 11,92%. Trên trang này, mua đúng giá trị nội tại là biên an toàn 0%, tức không có khoảng đệm nếu ước tính sai.',
        en: "The top-voted answer: yes, if the estimate is right and the discount and growth rates do not change, the nominal yearly return equals the discount rate. Check it with the Gordon model: buying at exactly 30,346.82 ₫, next year's 2,100 ₫ dividend is 6.92% of the price, and adding 5% growth gives exactly the 11.92% r. On this page, buying at the intrinsic value is a 0% margin of safety, with no cushion if the estimate is wrong.",
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/149731/is-the-return-rate-equal-to-the-discount-rate-if-i-buy-a-stock-at-its-intrinsic',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Ô Giá trị nội tại ước tính (V) lấy số từ đâu, có sửa được không?',
        en: 'Where does the Estimated intrinsic value (V) field get its number, and can I change it?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Đó là số bạn nhập, lấy từ một mô hình định giá như Gordon, DDM hai giai đoạn hay Giá trị nội tại từ FCFF: nhập 60.651,46 ₫ từ Giá trị nội tại từ FCFF với thị giá 72.700 ₫ thì biên an toàn ra âm 19,87%. Ở chế độ Nâng cao, ô này có thể lấy sẵn kết quả của Mô hình Gordon (DDM một giai đoạn) và vẫn sửa đè được. Ô bằng 0 thì màn báo chia cho 0.',
        en: 'It is a number you enter, taken from a valuation model such as Gordon, the two-stage DDM or Intrinsic value from FCFF: entering 60,651.46 ₫ from Intrinsic value from FCFF against a 72,700 ₫ market price gives a margin of safety of minus 19.87%. In Advanced mode this field can take the result of the Gordon growth model (single-stage DDM), and you can still overwrite it. If the field is 0 the screen reports a divide-by-zero.',
      },
    },
  ],
  fcfe: [
    {
      hoi: {
        vi: 'Vì sao ước tính giá trị cổ phiếu bằng FCFF và FCFE có thể cho kết quả khác nhau?',
        en: "Why can estimating a stock's intrinsic value with FCFF and FCFE give different results?",
      },
      nguyenVan:
        'Theoretical justification for why estimating intrinsic value of a stock price can be different under FCFF and FCFE approaches?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/45320/theoretical-justification-for-why-estimating-intrinsic-value-of-a-stock-price-ca',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Theo công thức trang này, FCFE = FCFF − lãi vay sau thuế + vay ròng mới, nên hai cách chỉ ra cùng giá trị cổ phiếu khi giả định nợ vay nhất quán: tỷ lệ nợ giữ nguyên, vay ròng mỗi năm khớp tỷ lệ ấy, FCFF chiết khấu bằng WACC còn FCFE bằng chi phí vốn chủ. Một nguồn lệch dễ gặp là lấy khoản vay ròng không lặp lại của một năm làm mức đều về sau: ở ví dụ FPT năm 2025, 58,05% FCFE là tiền đi vay.',
        en: "By this page's formula, FCFE = FCFF − after-tax interest + net borrowing, so the two approaches give the same share value only when the debt assumptions are consistent: a stable debt ratio, yearly net borrowing in line with it, FCFF discounted at WACC and FCFE at the cost of equity. One common source of a gap is treating one year's non-recurring borrowing as the level for later years: in FPT's 2025 example, 58.05% of FCFE is borrowed money.",
      },
    },
    {
      hoi: {
        vi: 'FCFE lớn hơn FCFF thì có phải nhập sai không?',
        en: 'If FCFE comes out larger than FCFF, did I enter something wrong?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không nhất thiết. Khi vay ròng mới lớn hơn lãi vay sau thuế, FCFE vượt FCFF: ví dụ FPT năm 2025 có FCFF 5.168,34 tỷ ₫ nhưng FCFE 10.777,2 tỷ ₫ nhờ vay ròng thêm 6.256,7 tỷ ₫. Phần vượt là tiền đi vay chứ không do kinh doanh làm ra; đặt vay ròng bằng 0 thì chỉ còn 4.520,5 tỷ ₫.',
        en: "Not necessarily. When net borrowing exceeds after-tax interest, FCFE is larger than FCFF: FPT's 2025 example has an FCFF of 5,168.34 billion ₫ but an FCFE of 10,777.2 billion ₫ thanks to 6,256.7 billion ₫ of net borrowing. The excess is borrowed money, not cash the business earned; with net borrowing at 0 only 4,520.5 billion ₫ would remain.",
      },
    },
    {
      hoi: {
        vi: 'Ô FCFF lấy số từ đâu, và nhập số của một quý được không?',
        en: 'Where does the FCFF field get its number, and can I enter a quarterly figure?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Ở chế độ Nâng cao, ô này có thể lấy sẵn kết quả của công thức FCFF; bạn vẫn sửa được nếu đã có số từ nguồn khác. Hãy nhập số cả năm 12 tháng, và các ô Chi phí lãi vay (I), Vay ròng mới (ΔB) cũng của đúng năm ấy; ghép FCFF một quý với lãi vay cả năm thì kết quả sai.',
        en: 'In Advanced mode this field can take the result of the FCFF formula; you can still change it if you have a figure from elsewhere. Enter a full 12-month figure, with Interest expense (I) and Net borrowing (ΔB) for that same year; mixing one quarter of FCFF with a full year of interest gives a wrong result.',
      },
    },
  ],
  'gia-tri-tuong-lai': [
    {
      hoi: {
        vi: 'Bạn có thể giải thích "giá trị thời gian của tiền" và lãi kép, kèm ví dụ không?',
        en: 'Can you explain "time value of money" and "compound interest" and provide examples of each?',
      },
      nguyenVan:
        'Can you explain "time value of money" and "compound interest" and provide examples of each?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/1470/can-you-explain-time-value-of-money-and-compound-interest-and-provide-exampl',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Một đáp án nêu FV = PV × (1 + r)^N: giá trị tương lai bằng giá trị hiện tại nhân (1 + lãi suất) luỹ thừa số kỳ; lãi kép tính cả lãi trên lãi đã tích luỹ nên cao hơn lãi đơn.',
        en: 'One answer gives FV = PV * (1 + r)^N: future value is present value times (1 + rate) raised to the number of periods; compounding includes interest on interest, so it exceeds simple interest.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/1470/can-you-explain-time-value-of-money-and-compound-interest-and-provide-exampl',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Số năm nhập số lẻ, như 2,5 năm, được không?',
        en: 'Can I enter a fractional number of years, such as 2.5?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Ô Số năm (n) chỉ nhận số nguyên, vì công thức giả định phần sinh lợi được nhập vào gốc sau trọn từng năm; gõ 2,5 thì ô báo số năm phải là số nguyên, rời ô thì số được làm tròn thành 3. Với 100 triệu ₫ ở 6,8%/năm, 2 năm cho 114.062.400 ₫, 3 năm cho 121.818.643,2 ₫.',
        en: 'No. The Years (n) field takes whole numbers only, because the formula assumes returns are added to the principal after each full year; typing 2.5 shows a whole-number warning, and leaving the field rounds it to 3. With 100 million ₫ at 6.8% a year, 2 years give 114,062,400 ₫ and 3 years give 121,818,643.2 ₫.',
      },
    },
    {
      hoi: {
        vi: 'Công thức có tính khoản tiền góp thêm mỗi tháng không?',
        en: 'Does the formula account for money added every month?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Giá trị tương lai chỉ tính một khoản bỏ vào một lần rồi để yên: 100 triệu ₫ ở 6,8%/năm sau 10 năm thành 193.068.991 ₫. Nếu bạn góp thêm đều đặn, mỗi khoản góp sinh lợi trong số năm riêng của nó; muốn biết mỗi tháng phải gửi bao nhiêu để đạt một số tiền, dùng công thức Tiết kiệm theo mục tiêu.',
        en: 'No. Future value covers a single lump sum left to grow: 100 million ₫ at 6.8% a year becomes 193,068,991 ₫ after 10 years. If you add money regularly, each deposit grows for its own number of years; to find how much to deposit each month to reach a target, use the Goal-based savings formula.',
      },
    },
  ],
  'gia-tri-hien-tai': [
    {
      hoi: {
        vi: 'Giá trị hiện tại khác giá trị tương lai ở điểm nào?',
        en: 'How does present value differ from future value?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Hai phép tính ngược nhau. Giá trị tương lai đưa tiền hôm nay tới mai sau, còn PV chiết khấu một khoản tương lai về hôm nay. Ví dụ nhận 1.000 sau 5 năm với r = 8%/năm thì PV khoảng 680,58.',
        en: 'They are inverse calculations. Future value carries money from today forward, while PV discounts a future amount back to today. For example receiving 1,000 in 5 years at r = 8% a year gives a PV of about 680.58.',
      },
    },
    {
      hoi: {
        vi: 'Tỷ lệ chiết khấu nhập theo kỳ nào?',
        en: 'What period should the discount rate be for?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Tính bằng %/năm, ghép với số năm n. Nếu bạn chỉ có lãi theo tháng thì quy ra năm trước khi nhập.',
        en: 'It is in % per year, paired with n in years. If you only have a monthly rate, convert it to a yearly one before entering it.',
      },
    },
    {
      hoi: {
        vi: 'Nếu tỷ lệ chiết khấu bằng 0% thì PV ra bao nhiêu?',
        en: 'What is PV if the discount rate is 0%?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Bằng đúng số tiền tương lai, vì hệ số (1 + r)^n bằng 1: tiền không được coi là sinh lợi nên nhận sau hay ngay đều như nhau.',
        en: 'Exactly the future amount, because the (1 + r)^n factor equals 1: money is assumed to earn nothing, so receiving it later or now is the same.',
      },
    },
  ],
};
