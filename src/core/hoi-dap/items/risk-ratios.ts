import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `risk-ratios` (`src/core/formulas/risk-ratios.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_RISK_RATIOS: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  beta: [
    {
      hoi: {
        vi: 'Yahoo Finance tính beta như thế nào?',
        en: 'How does Yahoo Finance calculate beta?',
      },
      nguyenVan: 'How does Yahoo finance calculate Beta?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/15797',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
    {
      hoi: {
        vi: 'Beta của một khoản đầu tư hay danh mục là gì và dùng như thế nào?',
        en: 'What is beta for an investment or a portfolio, and how do I use it?',
      },
      nguyenVan: 'What is "beta" for an investment or a portfolio, and how do I use it?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/7135',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
  'ty-so-sharpe': [
    {
      hoi: {
        vi: 'Quy đổi tỷ số Sharpe sang năm như thế nào?',
        en: 'How do I annualize the Sharpe ratio?',
      },
      nguyenVan: 'How to annualize Sharpe Ratio?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/2260',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
    {
      hoi: {
        vi: 'Khi tính Sharpe, nên dùng lợi suất tuyệt đối hay lợi suất vượt lãi suất phi rủi ro?',
        en: 'When computing Sharpe, should I use absolute returns or excess returns over the risk-free rate?',
      },
      nguyenVan: 'Sharpe Ratio and Sortino Question: Standard practice',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/49332',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án chấp nhận: về lý thuyết Sharpe là trung bình lợi suất vượt lãi suất phi rủi ro chia độ biến động của chính chuỗi đó. Khi lãi suất thấp, chênh lệch giữa hai cách tính nhỏ đi nhiều.',
        en: 'The accepted answer: in theory Sharpe is the average excess return over the risk-free rate divided by the volatility of the same series. When rates are low, the gap between the two methods becomes much smaller.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/49332',
          ten: 'Quant StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tính Sharpe nên dùng lợi suất logarit hay lợi suất tương đối?',
        en: 'Should the Sharpe ratio use log returns or relative returns?',
      },
      nguyenVan: 'Should Sharpe ratio be computed using log returns or relative returns?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/1102',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
    {
      hoi: {
        vi: 'Tính Sharpe nên dùng trung bình cộng hay trung bình nhân?',
        en: 'Should the Sharpe ratio use an arithmetic or a geometric mean?',
      },
      nguyenVan: 'Should I use an arithmetic or a geometric calculation for the Sharpe Ratio?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/3607',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
  'ty-so-sortino': [
    {
      hoi: {
        vi: 'Cách tính tỷ số Sortino và đặt ngưỡng lợi suất mục tiêu thế nào?',
        en: 'How do I calculate the Sortino ratio and set the target return?',
      },
      nguyenVan: 'Sortino Ratio calculation',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/17414',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
  'ty-so-treynor': [
    {
      hoi: {
        vi: 'Tỷ số Treynor khác phần bù rủi ro thị trường ở điểm nào?',
        en: 'How does the Treynor ratio differ from the market risk premium?',
      },
      nguyenVan: 'Difference between Treynor ratio and market premium',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/71769',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án chấp nhận: nếu mọi chứng khoán trong danh mục thoả CAPM với alpha bằng 0 thì tỷ số Treynor bằng phần bù rủi ro thị trường; phần bù này là mốc để so tỷ số Treynor quan sát được.',
        en: 'The accepted answer: if every security in the portfolio satisfies CAPM with zero alpha, the Treynor ratio equals the market risk premium; that premium serves as the reference for an observed Treynor ratio.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/71769',
          ten: 'Quant StackExchange',
        },
      ],
    },
  ],
  'ty-so-thong-tin': [
    {
      hoi: {
        vi: 'Tỷ số thông tin khác tỷ số Sharpe ở điểm nào?',
        en: 'How does the information ratio differ from the Sharpe ratio?',
      },
      nguyenVan: 'Difference between Sharpe Ratio and Information Ratio',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/19588',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án chấp nhận: Sharpe so lợi suất với lãi suất phi rủi ro, còn tỷ số thông tin so lợi suất với một chuẩn tham chiếu, rồi chia cho độ biến động của phần chênh lệch đó.',
        en: 'The accepted answer: Sharpe compares return with the risk-free rate, while the information ratio compares return with a reference benchmark and divides by the volatility of that difference.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/19588',
          ten: 'Quant StackExchange',
        },
      ],
    },
  ],
  'ty-so-calmar': [
    {
      hoi: {
        vi: 'Vì sao Calmar báo lỗi chia cho 0 khi chuỗi giá của tôi chỉ tăng?',
        en: 'Why does Calmar report a divide-by-zero error when my price series only rises?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Mẫu số là mức sụt giảm sâu nhất. Chuỗi chưa có phiên nào thấp hơn đỉnh trước đó thì mức này bằng 0, và sản phẩm báo lỗi rõ ràng thay vì in một số sai. Hãy kéo chuỗi qua một nhịp điều chỉnh.',
        en: 'The denominator is maximum drawdown. If no session is ever below the previous peak it equals 0, and the product reports a clear error instead of printing a wrong number. Extend the series through a correction.',
      },
    },
    {
      hoi: {
        vi: 'Cần bao nhiêu phiên giá để tính Calmar, và có dùng được chuỗi tuần hay tháng không?',
        en: 'How many price sessions does Calmar need, and can I use a weekly or monthly series?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Cần ít nhất 60 phiên giá. Chuỗi tuần thì đặt Số phiên trong một năm là 52, chuỗi tháng là 12, chuỗi ngày giao dịch là 250. Đặt sai số này thì lợi suất năm hoá lệch theo.',
        en: 'At least 60 price sessions. For a weekly series set Sessions per year to 52, for monthly 12, for daily trading 250. A wrong value skews the annualized return.',
      },
    },
    {
      hoi: {
        vi: 'Calmar ra số âm thì đọc thế nào?',
        en: 'How do I read a negative Calmar ratio?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Sản phẩm tính lợi suất năm hoá từ giá đầu và giá cuối chuỗi, nên Calmar âm nghĩa là giá cuối thấp hơn giá đầu. Mức sụt giảm sâu nhất luôn dương nên dấu của tỷ số do lợi suất năm quyết định.',
        en: 'The product annualizes from the first and last close, so a negative Calmar means the last close is below the first. Maximum drawdown is never negative here, so the sign of the ratio comes from the annual return.',
      },
    },
    {
      hoi: {
        vi: 'Mức sụt giảm sâu nhất trong Calmar lấy từ cả chuỗi hay chỉ một đoạn gần đây?',
        en: 'Is the maximum drawdown in Calmar taken from the whole series or only a recent stretch?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Từ cả chuỗi đã nạp, và lợi suất năm hoá cũng tính từ phiên đầu đến phiên cuối của chính chuỗi đó. Công thức này không có ô cửa sổ nhìn lại, muốn đổi kỳ thì phải đổi chuỗi giá nạp vào.',
        en: 'From the whole loaded series, and the annualized return also runs from its first to its last session. This formula has no lookback field, so to change the period you change the series you load.',
      },
    },
    {
      hoi: {
        vi: 'Vì sao Calmar của chuỗi ngắn có thể lên tới hàng chục lần?',
        en: 'Why can Calmar of a short series reach tens of times?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chuỗi ngắn ít nhịp điều chỉnh nên mức sụt giảm sâu nhất nhỏ, mẫu số bé. Thêm nữa lợi suất của một quãng ngắn bị quy ra cả năm: chuỗi zigzag 60 phiên dùng để kiểm thử công thức này lãi 10%, quy năm thành 48,75%, chia cho mức sụt 2,91% ra 16,74 lần.',
        en: 'A short series has few corrections, so maximum drawdown is small and the denominator tiny. Also the return of a short stretch is scaled up to a full year: the 60-session zigzag series used to test this formula gains 10%, which annualizes to 48.75%, divided by a 2.91% drawdown gives 16.74 times.',
      },
    },
  ],
  'ty-so-thang-thua': [
    {
      hoi: {
        vi: 'Tỷ số thắng/thua khác gì tỷ lệ thắng, và trên 1 có phải chắc chắn có lãi?',
        en: 'How is the win/loss ratio different from the win rate, and does above 1 guarantee a profit?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Tỷ số này chỉ so mức tăng bình quân của phiên tăng với mức giảm bình quân của phiên giảm, không đếm số phiên thắng. Trên 1 chưa đủ kết luận lãi, phải cân với tỷ lệ thắng.',
        en: 'It only compares the average gain of rising sessions with the average loss of falling sessions and does not count how often you win. Above 1 is not enough to conclude a profit, it must be weighed against the win rate.',
      },
    },
    {
      hoi: {
        vi: 'Ngưỡng bỏ qua phiên đi ngang là gì, và để 0 thì sao?',
        en: 'What is the threshold to ignore flat sessions, and what happens at 0?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Phiên có lợi suất trong khoảng cộng trừ ngưỡng (đơn vị %) bị bỏ khỏi cả hai vế. Để 0 thì tính mọi phiên tăng hoặc giảm thật sự, phiên đóng cửa đúng bằng phiên trước vẫn bị bỏ vì không tăng cũng không giảm.',
        en: 'A session whose return is within plus or minus the threshold (in %) is dropped from both sides. At 0 every genuinely rising or falling session counts, and a session closing exactly equal to the previous one is still dropped because it neither rose nor fell.',
      },
    },
    {
      hoi: {
        vi: 'Vì sao tôi bị báo chia cho 0 khi tăng ngưỡng lên?',
        en: 'Why do I get a divide-by-zero error when I raise the threshold?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Ngưỡng cao có thể loại hết các phiên giảm, khi đó mẫu số không còn phiên nào. Sản phẩm báo chia cho 0 và gợi ý hạ ngưỡng hoặc kéo dài chuỗi. Với chuỗi mẫu dùng để kiểm thử công thức, ngưỡng 3% làm mất sạch phiên giảm.',
        en: 'A high threshold can filter out every falling session, leaving nothing in the denominator. The product reports divide-by-zero and suggests lowering the threshold or extending the series. With the sample series used to test the formula, a 3% threshold removes every falling session.',
      },
    },
    {
      hoi: {
        vi: 'Khi nào kết quả báo vô nghĩa thay vì chia cho 0?',
        en: 'When does the result report meaningless instead of divide-by-zero?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Khi chuỗi có phiên giảm nhưng không có phiên tăng nào vượt ngưỡng, chẳng hạn chuỗi giảm đều. Khi đó không có vế thắng để đem so, nên sản phẩm báo vô nghĩa chứ không in tỷ số 0.',
        en: 'When the series has falling sessions but no rising session past the threshold, such as a steadily falling series. There is no winning side to compare, so the product reports a meaningless result rather than printing a ratio of 0.',
      },
    },
    {
      hoi: {
        vi: 'Cần bao nhiêu phiên giá để tính tỷ số thắng/thua?',
        en: 'How many price sessions are needed for the win/loss ratio?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Cần ít nhất 60 phiên giá trong chuỗi đã nạp, và công thức dùng cả chuỗi chứ không cắt một cửa sổ gần đây. Dưới 60 phiên sản phẩm báo thiếu chuỗi giá.',
        en: 'At least 60 price sessions in the loaded series, and the formula uses the whole series rather than a recent window. Below 60 sessions the product reports a missing series.',
      },
    },
  ],
};
