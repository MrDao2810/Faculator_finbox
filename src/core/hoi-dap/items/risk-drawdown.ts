import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `risk-drawdown` (`src/core/formulas/risk-drawdown.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_RISK_DRAWDOWN: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'sut-giam-sau-nhat': [
    {
      hoi: {
        vi: 'Mức sụt giảm sâu nhất được tính trên vốn đầu tư hay trên lãi lỗ tuyệt đối?',
        en: 'Is maximum drawdown calculated on invested capital or on raw P&L?',
      },
      nguyenVan: 'Drawdown calculation for strategies',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/3970',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án được chấp nhận: sụt giảm thường đo trên vốn đầu tư chứ không trên lãi lỗ thô, ví dụ vốn 1 triệu đơn vị tiền mà lệnh đầu lỗ 100.000 là sụt 10%; đỉnh thường lấy trong một cửa sổ quan sát. Trang này đo trên giá đóng cửa, tức giá trị một khoản mua rồi giữ cổ phiếu, và đỉnh lấy trong số phiên ở ô Số phiên gần nhất đưa vào tính.',
        en: 'The accepted answer: drawdown is usually measured on invested capital rather than raw P&L, so starting with 1 million currency units and losing 100,000 on the first trade is a 10% drawdown; the peak is usually taken within an observation window. This page measures on closing prices, that is the value of buying the stock and holding it, with the peak taken within the Number of recent sessions to include.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/3970',
          ten: 'Quant StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Đặt Số phiên gần nhất đưa vào tính lớn hơn số phiên đã nạp thì sao?',
        en: 'What happens if the Number of recent sessions to include is larger than the series I loaded?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Sản phẩm dùng toàn bộ chuỗi đã nạp và không báo lỗi. Chuỗi FPT 250 phiên tới 15/09/2026 mà đặt 5.000 phiên thì ra đúng như đặt 250, là 41,38%, từ đỉnh 106.100 ₫ xuống đáy 62.200 ₫. Chỉ khi cả chuỗi dưới 30 phiên giá thì mới báo thiếu chuỗi giá.',
        en: 'The product uses the whole loaded series and reports no error. With the 250 FPT sessions to 2026-09-15, entering 5,000 gives the same result as 250: 41.38%, from a 106,100 ₫ peak down to a 62,200 ₫ trough. Only when the whole series has fewer than 30 price sessions does it report a missing series.',
      },
    },
    {
      hoi: {
        vi: 'Cổ phiếu chia tách hoặc trả cổ tức bằng cổ phiếu trong kỳ thì mức sụt giảm có bị sai không?',
        en: 'If the stock split or paid a stock dividend during the period, is the drawdown wrong?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Có, nếu chuỗi giá chưa điều chỉnh. Công thức đọc đúng giá đóng cửa đã nạp và không tự điều chỉnh, nên cú giảm giá kỹ thuật ở ngày giao dịch không hưởng quyền bị tính như một cú rơi thật và có thể thành mức sụt sâu nhất. Hãy nạp chuỗi giá đã điều chỉnh cho các sự kiện ấy.',
        en: 'Yes, if the price series is not adjusted. The formula reads the loaded closes as they are and adjusts nothing, so the technical price drop on the ex-rights date counts as a real fall and can become the deepest drawdown. Load a price series adjusted for those events.',
      },
    },
  ],
  'var-lich-su': [
    {
      hoi: {
        vi: 'Tính VaR lịch sử khi chuỗi dữ liệu ngắn thì làm thế nào?',
        en: 'How do I calculate historical VaR with a short time series?',
      },
      nguyenVan: 'Calculating HIstorical VaR with short time series',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/30039',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Trang này không ngoại suy phần đuôi: VaR đọc thẳng phân vị của lợi suất trong số phiên đã chọn, nội suy tuyến tính giữa hai quan sát liền kề. Cần ít nhất 60 phiên giá, ít hơn thì sản phẩm báo thiếu chuỗi giá. Ngay ở 60 phiên, mức 95% nằm giữa phiên xấu thứ ba và thứ tư, mức 99% nằm giữa hai phiên xấu nhất, nên chỉ vài phiên quyết định con số.',
        en: 'This page does not extrapolate the tail: VaR reads the percentile straight from the returns of the sessions chosen, interpolating linearly between two adjacent observations. It needs at least 60 price sessions, and with fewer the product reports a missing series. Even at 60 sessions the 95% level sits between the third and fourth worst sessions and the 99% level between the two worst, so just a few sessions decide the figure.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao VaR báo kết quả không có ý nghĩa trong khi CVaR của cùng chuỗi vẫn ra số?',
        en: 'Why does VaR report a meaningless result while CVaR on the same series still gives a number?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'VaR đọc chính ngưỡng phân vị: nếu ở mức tin cậy đã chọn ngưỡng ấy vẫn là một mức tăng thì không có ngưỡng lỗ để đọc, dù chuỗi có vài phiên giảm. CVaR lấy trung bình cả nhóm phiên không tốt hơn ngưỡng nên vẫn ra số. Chuỗi gồm 57 phiên +0,5%, hai phiên −0,05% và một phiên −7% có ngưỡng 95% là +0,47%: VaR báo không có ý nghĩa, CVaR ra 2,37%.',
        en: 'VaR reads the percentile threshold itself: if at the chosen confidence level that threshold is still a gain, there is no loss threshold to read, even if the series has a few down sessions. CVaR averages the whole group of sessions no better than the threshold, so it can still give a number. A series of 57 sessions at +0.5%, two at −0.05% and one at −7% has a 95% threshold of +0.47%: VaR reports a meaningless result while CVaR gives 2.37%.',
      },
    },
    {
      hoi: {
        vi: 'VaR ra phần trăm, muốn biết có thể mất bao nhiêu tiền trong một phiên thì tính thế nào?',
        en: 'VaR comes out as a percentage, so how do I turn it into an amount of money for one session?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Nhân VaR với giá trị khoản đang nắm. Ví dụ VN-Index 71 phiên tới 15/09/2026 ở mức 95% cho 1,98%, nên danh mục 100 triệu ₫ bám chỉ số có ngưỡng lỗ một phiên khoảng 1,98 triệu ₫. Con số áp cho một phiên; muốn biết các phiên tệ hơn ngưỡng ấy mất trung bình bao nhiêu thì xem CVaR.',
        en: 'Multiply VaR by the value of the position. The VN-Index example over 71 sessions to 2026-09-15 at 95% gives 1.98%, so a 100 million ₫ portfolio tracking the index has a one-session loss threshold of about 1.98 million ₫. The figure applies to one session; to see how much the sessions worse than that threshold lose on average, look at CVaR.',
      },
    },
  ],
  'cvar-lich-su': [
    {
      hoi: {
        vi: 'Quy đổi tổn thất kỳ vọng (CVaR) sang năm như thế nào?',
        en: 'How do I annualize Expected Shortfall?',
      },
      nguyenVan: 'How to annualize Expected Shortfall?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/928',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Trang này không quy năm: CVaR là mức lỗ bình quân của một phiên, lấy trung bình các lợi suất đơn không cao hơn ngưỡng VaR. Đáp án được chấp nhận: nếu chấp nhận giả định lợi suất phân phối chuẩn thì nhân với căn bậc hai của số kỳ; còn nếu khớp phần đuôi bằng phân phối đuôi dày như Student-t hay Pareto thì phải chập phân phối của các kỳ với nhau, không có công thức gọn.',
        en: 'This page does not annualize: CVaR is the average loss of a single session, the mean of the simple returns no higher than the VaR threshold. The accepted answer: if you are willing to assume normally distributed returns, you scale by the square root of the number of periods; but if the tail is fitted with a fat-tailed distribution such as Student-t or Pareto, the per-period distributions must be convolved together, and there is no simple formula.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/928',
          ten: 'Quant StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Có khi nào CVaR nhỏ hơn VaR của cùng chuỗi không?',
        en: 'Can CVaR ever be smaller than VaR on the same series?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không, khi cùng độ tin cậy và cùng số phiên. CVaR là trung bình của các lợi suất không cao hơn ngưỡng VaR, nên mức lỗ bình quân ấy không thể nhẹ hơn chính ngưỡng. Ở ví dụ VN-Index 71 phiên mức 95%, VaR là 1,98% còn CVaR là 2,69%; hai số chỉ bằng nhau khi mọi phiên trong nhóm ấy lỗ đúng bằng ngưỡng.',
        en: 'No, at the same confidence level and number of sessions. CVaR is the average of the returns no higher than the VaR threshold, so that average loss cannot be milder than the threshold itself. In the VN-Index example of 71 sessions at 95%, VaR is 1.98% and CVaR is 2.69%; the two are equal only when every session in that group loses exactly the threshold.',
      },
    },
    {
      hoi: {
        vi: 'Khi nào CVaR báo thiếu chuỗi giá hoặc báo kết quả không có ý nghĩa?',
        en: 'When does CVaR report a missing series or a meaningless result?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chuỗi đã nạp dưới 60 phiên giá thì báo thiếu chuỗi giá. Đủ phiên mà ngay cả nhóm phiên tệ nhất cũng không lỗ bình quân, chẳng hạn chuỗi chỉ đi lên hoặc đứng yên, thì không có mức lỗ để đo và sản phẩm báo kết quả không có ý nghĩa thay vì in số âm hay số 0.',
        en: 'A loaded series of fewer than 60 price sessions reports a missing series. With enough sessions, if even the worst group of sessions shows no average loss, as in a series that only rises or stays flat, there is no loss to measure and the product reports a meaningless result instead of printing a negative number or 0.',
      },
    },
  ],
  'sut-giam-hien-tai': [
    {
      hoi: {
        vi: 'Mức sụt giảm (drawdown) tính thế nào khi đỉnh đầu tiên của chiến lược có giá trị 0 và phép chia bị chia cho 0?',
        en: 'How should drawdown be calculated when the first peak of a strategy is 0 and the formula divides by zero?',
      },
      nguyenVan: 'The problem arises when the first "peak" of the trading strategy is of value 0.',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/3970/drawdown-calculation-for-strategies',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án được chấp nhận: sụt giảm đo trên vốn đầu tư chứ không trên lãi lỗ thô, nên mốc đầu là số vốn bỏ vào chứ không phải 0. Trang này đo trên giá đóng cửa và bỏ mọi phiên có giá bằng 0 hoặc âm trước khi tính, nên đỉnh luôn là một giá dương; bỏ xong mà còn dưới 30 phiên thì sản phẩm báo thiếu chuỗi giá chứ không chia cho 0.',
        en: 'The accepted answer: drawdown is measured on invested capital rather than raw P&L, so the starting point is the capital put in, not 0. This page measures on closing prices and drops every session priced at 0 or below before computing, so the peak is always a positive price; if fewer than 30 sessions remain, the product reports a missing series instead of dividing by 0.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/3970/drawdown-calculation-for-strategies',
          ten: 'Quant StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Đỉnh dùng để tính mức sụt giảm hiện tại là đỉnh của bao nhiêu phiên?',
        en: 'The peak used for the current drawdown is the peak of how many sessions?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Của số phiên ở ô Số phiên gần nhất đưa vào tính, không phải đỉnh mọi thời. Với FPT tới 15/09/2026, xét 55 phiên thì đỉnh là 74.500 ₫ và mức sụt là 2,42%; xét 250 phiên thì đỉnh là 106.100 ₫ và mức sụt là 31,48%. So hai mã thì phải đặt cùng số phiên.',
        en: 'Of the Number of recent sessions to include, not an all-time peak. For FPT to 2026-09-15, over 55 sessions the peak is 74,500 ₫ and the drawdown 2.42%; over 250 sessions the peak is 106,100 ₫ and the drawdown 31.48%. To compare two stocks, use the same number of sessions.',
      },
    },
    {
      hoi: {
        vi: 'Đang sụt 2,42% so với đỉnh thì giá phải tăng bao nhiêu để về lại đỉnh?',
        en: 'If the price is 2.42% below the peak, how much must it rise to get back there?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Nhiều hơn 2,42%: lấy đỉnh chia giá phiên cuối rồi trừ 1, ở ví dụ FPT là 74.500 ÷ 72.700 − 1 = 2,48%. Mức sụt càng sâu thì hai con số càng xa nhau: sụt 50% thì phải tăng 100% mới về lại đỉnh.',
        en: 'More than 2.42%: divide the peak by the last close and subtract 1, which for the FPT example is 74,500 ÷ 72,700 − 1 = 2.48%. The deeper the drawdown, the wider the gap between the two: after a 50% drawdown the price must rise 100% to regain the peak.',
      },
    },
  ],
};
