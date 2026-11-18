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
      traLoi: {
        vi: 'Câu trả lời điểm cao nhất, viết năm 2014, trích trang trợ giúp của Yahoo lúc ấy: beta tính từ thay đổi giá hằng tháng của cổ phiếu so với S&P 500 trong 3 năm (36 tháng) khi đủ dữ liệu; cách Yahoo tính hiện nay có thể đã khác. Trang này dùng lợi suất từng phiên của cổ phiếu và VN-Index, số phiên theo ô Số phiên lấy để hồi quy (mặc định 60), nên không so thẳng được với beta tính từ dữ liệu tháng.',
        en: 'The top-voted answer, written in 2014, quotes the Yahoo help page of that time: beta is computed from the monthly price change of the stock relative to the S&P 500 over 3 years (36 months) when available; Yahoo may compute it differently today. This page uses per-session returns of the stock and the VN-Index over the Number of sessions used for the regression (60 by default), so its beta cannot be compared directly with one computed on monthly data.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/15797',
          ten: 'Quant StackExchange',
        },
      ],
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
      traLoi: {
        vi: 'Các câu trả lời ở nguồn: beta cho biết cổ phiếu hay danh mục thường đi theo thị trường ra sao. Bằng 1 là đi cùng nhịp, trên 1 là lên xuống mạnh hơn, từ 0 tới 1 là nhẹ hơn, bằng 0 là không theo thị trường, âm là đi ngược chiều; beta của cả danh mục là trung bình các beta theo tỷ trọng, dùng để chọn mức rủi ro mình chịu được. Trên trang này thị trường là VN-Index.',
        en: 'The answers there: beta shows how a stock or a portfolio tends to move with the market. 1 means in step, above 1 means bigger swings, between 0 and 1 smaller ones, 0 means it ignores the market, and negative means it moves the other way; a portfolio beta is the weighted average of the betas of its holdings and helps set a risk level you can live with. On this page the market is the VN-Index.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/7135',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tại sao Beta báo kết quả không có ý nghĩa khi bảng dữ liệu có một phiên trống giá đóng cửa?',
        en: 'Why does Beta report a meaningless result when the data table has a session with no closing price?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Sản phẩm ghép từng phiên của cổ phiếu với VN-Index theo thứ tự tính từ phiên cuối. Nếu lặng lẽ bỏ một phiên trống ở giữa thì mọi cặp phía trước lệch nhau một phiên và beta sai mà không có cảnh báo nào, nên sản phẩm báo ngay thay vì tính. Hãy điền hoặc xoá phiên ấy ở màn Bảng dữ liệu; phiên hỏng nằm ngoài số phiên lấy để hồi quy thì không ảnh hưởng.',
        en: 'The product pairs each session of the stock with the VN-Index by position, counting back from the last session. Silently skipping an empty session in the middle would shift every earlier pair by one session and give a wrong beta with no warning, so the product reports it instead of computing. Fill in or delete that session on the Data table screen; a faulty session outside the Number of sessions used for the regression has no effect.',
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
      traLoi: {
        vi: 'Câu trả lời điểm cao nhất lưu ý cách nhân căn không phải lúc nào cũng đúng (bài “The Statistics of Sharpe Ratios” của Andrew Lo). Các câu kế giải thích gốc của nó: nếu lợi suất các phiên độc lập và cùng phân phối thì phần lãi cả năm gấp m lần, độ lệch chuẩn gấp căn m lần, nên tỷ số gấp căn m. Trang này làm đúng vậy: tỷ số một phiên nhân căn bậc hai của ô Số phiên trong một năm (250 với chuỗi ngày).',
        en: 'The top-voted answer warns that scaling by the square root is not always valid (Andrew Lo, “The Statistics of Sharpe Ratios”). The next answers explain where it comes from: if session returns are independent and identically distributed, the yearly mean grows m times and the standard deviation the square root of m times, so the ratio grows by the square root of m. This page does exactly that: the per-session ratio times the square root of Sessions per year (250 for a daily series).',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/2260',
          ten: 'Quant StackExchange',
        },
      ],
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
      traLoi: {
        vi: 'Trang này dùng lợi suất đơn: giá phiên này chia giá phiên trước rồi trừ 1, sau đó lấy trung bình cộng và độ lệch chuẩn mẫu (chia n − 1). Trung bình của lợi suất log thấp hơn khoảng nửa phương sai một phiên, nên khi phần lãi vượt lãi suất phi rủi ro nhỏ thì Sharpe tính bằng lợi suất log có thể thấp hơn rõ rệt. Chỉ so những tỷ số Sharpe tính cùng một cách.',
        en: 'This page uses simple returns: this session’s close divided by the previous close, minus 1, then their arithmetic mean and sample standard deviation (dividing by n − 1). The mean of log returns is lower by about half the per-session variance, so when the return above the risk-free rate is small, a Sharpe ratio on log returns can come out clearly lower. Only compare Sharpe ratios computed the same way.',
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
      traLoi: {
        vi: 'Trang này dùng trung bình cộng của lợi suất đơn từng phiên, đúng định nghĩa Sharpe công bố năm 1994. Trung bình nhân không bao giờ lớn hơn trung bình cộng và càng thấp hơn khi giá càng biến động, nên tỷ số tính bằng trung bình nhân thường nhỏ hơn. Hai cách cho hai con số khác nhau, chỉ so những tỷ số tính cùng một cách.',
        en: 'This page uses the arithmetic mean of simple per-session returns, as in the definition Sharpe published in 1994. The geometric mean is never above the arithmetic mean and falls further below it the more the price swings, so a ratio built on the geometric mean usually comes out lower. The two methods give different numbers, so only compare ratios computed the same way.',
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
      traLoi: {
        vi: 'Trên trang này ngưỡng là ô Lãi suất phi rủi ro / năm quy về một phiên theo lãi kép, (1 + lãi năm)^(1/m) − 1, với m là Số phiên trong một năm. Mẫu số cộng bình phương phần hụt dưới ngưỡng của từng phiên, phiên trên ngưỡng tính là 0, chia cho tổng số lợi suất rồi lấy căn. Không phiên nào dưới ngưỡng thì mẫu số bằng 0 và sản phẩm báo chia cho 0.',
        en: 'On this page the threshold is the Risk-free rate / year converted to one session by compounding, (1 + annual rate)^(1/m) − 1, where m is Sessions per year. The denominator adds up the squared shortfall below the threshold for each session, counting sessions above it as 0, divides by the total number of returns and takes the square root. If no session falls below the threshold, the denominator is 0 and the product reports a divide-by-zero error.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao chuỗi giá đứng yên cho Sortino âm mà không báo lỗi như Sharpe?',
        en: 'Why does a flat price series give a negative Sortino instead of an error like Sharpe?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Giá đứng yên thì mọi lợi suất bằng 0, thấp hơn ngưỡng phi rủi ro một phiên, nên phiên nào cũng hụt đúng bằng ngưỡng. Tử số là âm của ngưỡng, mẫu số bằng ngưỡng, kết quả là −√m: với 250 phiên một năm là −15,81 lần. Sharpe thì báo chia cho 0 vì độ lệch chuẩn bằng 0; đặt lãi suất phi rủi ro bằng 0 thì Sortino cũng báo chia cho 0.',
        en: 'With a flat price every return is 0, below the per-session risk-free threshold, so every session falls short by exactly the threshold. The numerator is minus the threshold and the denominator equals it, so the result is −√m: −15.81 times at 250 sessions a year. Sharpe reports a divide-by-zero error because the standard deviation is 0; set the risk-free rate to 0 and Sortino reports one too.',
      },
    },
    {
      hoi: {
        vi: 'Tỷ số Sortino dùng bao nhiêu phiên của chuỗi giá đã nạp?',
        en: 'How many sessions of the loaded price series does the Sortino ratio use?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Cả chuỗi, không cắt một cửa sổ gần đây: chuỗi VN-Index 250 phiên của ví dụ cho 249 lợi suất. Cần ít nhất 60 phiên giá, dưới mức đó sản phẩm báo thiếu chuỗi giá. Muốn đo một quãng ngắn hơn thì nạp đúng quãng ấy.',
        en: 'The whole series, with no recent window cut out: the 250-session VN-Index series in the example gives 249 returns. At least 60 price sessions are needed, and below that the product reports a missing series. To measure a shorter stretch, load just that stretch.',
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
    {
      hoi: {
        vi: 'Tại sao nhập beta bằng 0 hoặc beta âm thì tỷ số Treynor không ra số?',
        en: 'Why does the Treynor ratio give no number when I enter a beta of 0 or a negative beta?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Beta là mẫu số. Bằng 0 thì sản phẩm báo chia cho 0. Âm thì báo kết quả không có ý nghĩa vì dấu bị đảo: danh mục lãi hơn lãi suất phi rủi ro lại ra số âm, danh mục lỗ ra số dương. Với hai trường hợp ấy, tỷ số Sharpe không cần beta nên vẫn dùng được.',
        en: 'Beta is the denominator. At 0 the product reports a divide-by-zero error. If it is negative, the product reports a meaningless result because the sign flips: a portfolio beating the risk-free rate would show a negative number and a losing one a positive number. In both cases the Sharpe ratio, which needs no beta, still works.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao tỷ số Treynor ra %/năm chứ không ra “lần” như Sharpe?',
        en: 'Why is the Treynor ratio in %/year rather than “times” like Sharpe?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Tử số là phần lãi vượt lãi suất phi rủi ro tính theo năm: chênh lệch bình quân một phiên nhân thẳng với Số phiên trong một năm. Beta là hệ số không đơn vị nên kết quả giữ đơn vị %/năm. Ví dụ VN-Index 250 phiên với lãi suất 4,57% có phần vượt 5,98%/năm, chia beta 0,9043 ra 6,61%/năm.',
        en: 'The numerator is the yearly return above the risk-free rate: the average per-session gap multiplied straight by Sessions per year. Beta is a unitless coefficient, so the result keeps the %/year unit. In the VN-Index example of 250 sessions at a 4.57% rate, the excess is 5.98%/year, and dividing by a beta of 0.9043 gives 6.61%/year.',
      },
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
    {
      hoi: {
        vi: 'Tại sao tỷ số thông tin ra đúng bằng tỷ số Sharpe khi nhập cùng một mức lợi suất?',
        en: 'Why does the information ratio equal the Sharpe ratio when I enter the same rate?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Trang này là bản rút gọn: chuẩn so sánh là một con số %/năm, quy về một phiên theo lãi kép rồi trừ đúng một lượng như nhau ở mọi phiên. Vì thế độ lệch chuẩn phần chênh lệch bằng độ lệch chuẩn lợi suất của danh mục, và tỷ số trùng Sharpe khi lãi suất phi rủi ro bằng mức chuẩn: VN-Index 250 phiên với chuẩn 6,8% và Sharpe với lãi suất 6,8% đều ra 0,19 lần.',
        en: 'This page is a simplified version: the benchmark is a single %/year figure, converted to one session by compounding and subtracted by the same amount every session. So the standard deviation of the difference equals that of the portfolio returns, and the ratio matches Sharpe when the risk-free rate equals the benchmark: the 250-session VN-Index with a 6.8% benchmark and Sharpe at a 6.8% rate both give 0.19 times.',
      },
    },
    {
      hoi: {
        vi: 'Lợi suất chuẩn so sánh nhập theo năm hay theo phiên, và nhập số âm được không?',
        en: 'Is the benchmark return entered per year or per session, and can it be negative?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Nhập một con số theo năm, đơn vị %: chuẩn tăng 12% cả năm thì nhập 12. Được nhập số âm, từ −100 tới 200: chuẩn giảm 10% cả năm thì nhập −10, và với chuỗi VN-Index 250 phiên của ví dụ tỷ số lên 1,02 lần. Sản phẩm tự quy con số năm về một phiên theo lãi kép trước khi trừ.',
        en: 'Enter one yearly figure in %: for a benchmark up 12% over the year, enter 12. Negative values are allowed, from −100 to 200: for a benchmark down 10% over the year enter −10, and on the 250-session VN-Index series of the example the ratio rises to 1.02 times. The product converts the yearly figure to one session by compounding before subtracting it.',
      },
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
