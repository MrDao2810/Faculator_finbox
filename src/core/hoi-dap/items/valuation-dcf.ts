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
