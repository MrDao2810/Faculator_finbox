import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `risk-volatility` (`src/core/formulas/risk-volatility.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_RISK_VOLATILITY: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'do-bien-dong-nam-hoa': [
    {
      hoi: {
        vi: 'Công thức nhân độ lệch chuẩn ngày với căn bậc hai của số phiên để quy năm có chỉ là xấp xỉ không?',
        en: 'Is the annualized volatility formula only an approximation?',
      },
      nguyenVan: 'annualized volatility formula is an approximation?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/48641',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án được chấp nhận: công thức đúng tuyệt đối với lợi suất log, vì log của thay đổi cả năm bằng tổng log từng phiên; với lợi suất đơn (phần trăm thay đổi) nó chỉ là xấp xỉ. Điều kiện là lợi suất log các phiên không tương quan và độ lệch chuẩn không đổi. Trang này dùng lợi suất đơn nên con số là xấp xỉ; công thức Độ biến động lịch sử năm hoá của thư viện dùng lợi suất log.',
        en: 'The accepted answer: the formula is exact for log returns, because the log of the yearly change is the sum of the per-session logs; for simple (percentage) returns it is only an approximation. It also requires the log returns to be uncorrelated and the standard deviation constant. This page uses simple returns, so its figure is an approximation; the library’s Annualized historical volatility formula uses log returns.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/48641',
          ten: 'Quant StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Chuỗi giá theo tuần hoặc theo tháng thì nhập Số phiên giao dịch trong một năm là bao nhiêu?',
        en: 'For a weekly or monthly price series, what should I enter for Trading sessions per year?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Nhập số kỳ của chuỗi trong một năm: chuỗi tuần là 52, chuỗi tháng là 12, chuỗi ngày giao dịch khoảng 250. Khi đó ô Số phiên lấy để tính cũng đếm theo tuần hay theo tháng, và vẫn cần ít nhất 30 kỳ.',
        en: 'Enter how many periods of the series fit in a year: 52 for weekly, 12 for monthly, about 250 for daily trading sessions. The Number of sessions used then counts weeks or months too, and still needs at least 30 periods.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao đặt Số phiên lấy để tính lớn hơn chuỗi đã nạp thì báo thiếu chuỗi giá?',
        en: 'Why does setting the Number of sessions used above the loaded series report a missing series?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Công thức đòi đủ đúng số phiên bạn chọn, không tự thu lại cho vừa chuỗi: chuỗi FPT 250 phiên mà chọn 300 thì sản phẩm báo cần ít nhất 300 phiên giá. Hãy hạ ô này xuống bằng hoặc dưới số phiên đã nạp, và không dưới 30; với 250 phiên FPT tới 15/09/2026 kết quả là 32,33%/năm.',
        en: 'The formula requires exactly the number of sessions you chose and does not shrink it to fit the series: with 250 FPT sessions, choosing 300 makes the product ask for at least 300 price sessions. Lower the field to at most the number loaded, and no less than 30; with the 250 FPT sessions to 2026-09-15 the result is 32.33%/year.',
      },
    },
  ],
  'do-lech-chuan-ban-phan': [
    {
      hoi: {
        vi: 'Cách tính bán phương sai (độ lệch chuẩn phần giảm) như thế nào?',
        en: 'How is semivariance (downside deviation) calculated?',
      },
      nguyenVan: 'Semivariance calculation (downside deviation)',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/38958',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án được chấp nhận: tính trên toàn bộ dữ liệu, phiên không dưới ngưỡng tính là 0 chứ không bị bỏ, vì bỏ đi thì thước đo mất độ nhạy với tần suất phiên xấu: một chuỗi có một phiên −10 và một chuỗi bốn phiên −10 sẽ ra như nhau. Trang này cũng giữ mọi phiên ở mẫu số, nhưng chia cho tổng số lợi suất trừ 1 (độ lệch chuẩn mẫu) chứ không chia cho N như công thức trong đáp án.',
        en: 'The accepted answer: compute over all the data, counting sessions not below the threshold as 0 rather than dropping them, since dropping them makes the measure blind to how often bad sessions occur: a series with one −10 session and a series of four −10 sessions would come out the same. This page also keeps every session in the denominator, but divides by the total number of returns minus 1 (a sample standard deviation) rather than by N as in the answer.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/38958',
          ten: 'Quant StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Muốn đặt ngưỡng là 10% một năm thì nhập ô Ngưỡng lợi suất mỗi phiên bao nhiêu?',
        en: 'If I want a threshold of 10% a year, what should I enter in the Per-session return threshold?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Ô này là ngưỡng cho một phiên, đơn vị %. Đổi từ năm về phiên theo lãi kép: (1 + 10%)^(1/250) − 1 ≈ 0,0381% mỗi phiên với chuỗi ngày, nên nhập 0,0381. Với 55 phiên FPT của ví dụ, ngưỡng ấy cho 1,22%/phiên, so với 1,2% ở ngưỡng 0.',
        en: 'This field is a threshold for one session, in %. Convert from a year to a session by compounding: (1 + 10%)^(1/250) − 1 ≈ 0.0381% per session for a daily series, so enter 0.0381. For the 55 FPT sessions of the example, that threshold gives 1.22%/session, against 1.2% at a threshold of 0.',
      },
    },
    {
      hoi: {
        vi: 'Đặt ngưỡng âm, ví dụ −1%, thì độ lệch chuẩn bán phần đo gì?',
        en: 'What does downside deviation measure if I set a negative threshold, such as −1%?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Khi đó chỉ phiên giảm quá 1% mới được cộng vào, và phần hụt tính từ mốc −1% chứ không từ 0, nên con số nhỏ đi: 55 phiên FPT của ví dụ ra 0,76%/phiên, so với 1,2% ở ngưỡng 0. Mẫu số vẫn là tổng số lợi suất trừ 1, kể cả các phiên không bị tính.',
        en: 'Then only sessions falling more than 1% are added, and the shortfall is measured from −1% rather than from 0, so the figure gets smaller: the 55 FPT sessions of the example give 0.76%/session, against 1.2% at a threshold of 0. The denominator is still the total number of returns minus 1, including sessions that are not counted.',
      },
    },
  ],
  'he-so-bien-thien': [
    {
      hoi: {
        vi: 'Hệ số biến thiên âm tính từ lợi suất ngày trong một kỳ nghĩa là gì?',
        en: 'What does a negative coefficient of variation mean when calculated from daily returns over a period?',
      },
      nguyenVan:
        'What does a negative coefficient of variation mean when calculated from daily returns during a period?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/32298',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án chấp nhận: hệ số biến thiên là độ lệch chuẩn chia trung bình nên âm khi lợi suất trung bình âm. Người trả lời cho rằng thước đo này chỉ nên dùng với dữ liệu không âm, nên không phù hợp để diễn giải trên chuỗi lợi suất.',
        en: 'The accepted answer: the coefficient of variation is the standard deviation divided by the mean, so it is negative when the average return is negative. The answerer says it should only be used with non-negative data, so it is not suited to interpreting a return series.',
      },
      nguonTraLoi: [
        {
          url: 'https://quant.stackexchange.com/questions/32298',
          ten: 'Quant StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tại sao hệ số biến thiên báo chia cho 0 khi giá đứng yên?',
        en: 'Why does the coefficient of variation report a divide-by-zero error when the price is flat?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Hệ số lấy độ lệch chuẩn chia cho lợi suất bình quân mỗi phiên. Giá đứng yên suốt các phiên đã chọn thì lợi suất bình quân bằng 0, nên sản phẩm báo chia cho 0 thay vì in một số vô hạn. Muốn đo riêng mức dao động thì xem Độ lệch chuẩn lợi suất theo phiên.',
        en: 'The coefficient divides the standard deviation by the average return per session. If the price is flat over the chosen sessions, that average is 0, so the product reports a divide-by-zero error rather than printing an infinite number. To measure the swings on their own, use the Per-session return standard deviation.',
      },
    },
    {
      hoi: {
        vi: 'Hệ số biến thiên 33,68 lần có phải là 33,68% không?',
        en: 'Is a coefficient of variation of 33.68 times the same as 33.68%?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Đây là tỷ số giữa hai đại lượng cùng đơn vị %/phiên nên kết quả tính bằng lần, không mang dấu %. Ở ví dụ STB 90 phiên tới 15/09/2026, độ lệch chuẩn 1,7944%/phiên chia lợi suất bình quân 0,05328%/phiên ra 33,68 lần.',
        en: 'No. It is a ratio of two quantities in the same %/session unit, so the result is in times and carries no % sign. In the STB example of 90 sessions to 2026-09-15, a standard deviation of 1.7944%/session divided by an average return of 0.05328%/session gives 33.68 times.',
      },
    },
  ],
  'do-lech-chuan-loi-suat-phien': [
    {
      hoi: {
        vi: 'Làm sao tính độ biến động (độ lệch chuẩn) và ROI của một cổ phiếu?',
        en: 'How can I calculate the volatility (standard deviation) and ROI of a stock?',
      },
      nguyenVan:
        'How can I calculate the volatility(standard deviation) of a stock price? and/or ROI (return on investment) of a stock?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/86847/how-can-i-calculate-the-volatilitystandard-deviation-of-a-stock-price-and-or',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Trang này tính độ biến động như sau: lấy số giá đóng cửa gần nhất theo ô Số phiên lấy để tính, đổi ra lợi suất từng phiên (giá phiên này chia giá phiên trước, trừ 1), rồi lấy độ lệch chuẩn mẫu, chia cho số lợi suất trừ 1. Kết quả theo %/phiên: 55 phiên FPT của ví dụ ra 1,93%. ROI không tính ở đây mà ở công thức ROI của thư viện.',
        en: 'This page computes volatility this way: take the latest closes set by the Number of sessions used, turn them into per-session returns (this close divided by the previous close, minus 1), then take the sample standard deviation, dividing by the number of returns minus 1. The result is in %/session: the 55 FPT sessions of the example give 1.93%. ROI is not computed here but in the library’s ROI formula.',
      },
    },
    {
      hoi: {
        vi: 'Có nên dùng độ lệch chuẩn hình học để tính biến động của lợi suất tài chính không?',
        en: 'Should the geometric standard deviation be used to compute the volatility of financial returns?',
      },
      nguyenVan:
        'Should the geometric standard deviation be used to compute the volatility of financial returns?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/37558/should-the-geometric-standard-deviation-be-used-to-compute-the-volatility-of-fin',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Trang này không dùng độ lệch chuẩn hình học mà lấy độ lệch chuẩn thông thường (chia n − 1) của lợi suất đơn từng phiên. Ở khoảng một phiên, lợi suất đơn và lợi suất log gần như bằng nhau nên độ lệch chuẩn chênh rất ít; công thức Độ biến động lịch sử năm hoá của thư viện dùng lợi suất log. Chỉ so độ biến động của hai mã khi chúng tính cùng một cách.',
        en: 'This page does not use a geometric standard deviation; it takes the ordinary standard deviation (dividing by n − 1) of simple per-session returns. Over a single session, simple and log returns are nearly equal, so the standard deviations differ very little; the library’s Annualized historical volatility formula uses log returns. Only compare the volatility of two stocks computed the same way.',
      },
    },
    {
      hoi: {
        vi: 'Kết quả theo %/phiên, muốn so với độ biến động theo năm trong báo cáo quỹ thì đổi thế nào?',
        en: 'The result is per session, so how do I convert it to compare with the yearly volatility in a fund report?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Nhân với căn bậc hai của số phiên giao dịch một năm, không nhân thẳng với số phiên. Đó là việc công thức Độ biến động năm hoá làm: 1,925%/phiên của 55 phiên FPT nhân căn 250 ra 30,44%/năm.',
        en: 'Multiply by the square root of the number of trading sessions in a year, not by the number itself. That is what the Annualized volatility formula does: 1.925%/session over 55 FPT sessions times the square root of 250 gives 30.44%/year.',
      },
    },
  ],
  'bien-do-dao-dong-lon-nhat': [
    {
      hoi: {
        vi: 'Cần bao nhiêu phiên giá thì tính được biên độ, và vì sao tôi bị báo thiếu chuỗi giá?',
        en: 'How many price sessions are needed, and why am I told the price series is too short?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chuỗi giá phải có ít nhất bằng số phiên bạn chọn ở ô Số phiên trong kỳ, và không dưới 10 phiên. Mặc định là 60. Chọn kỳ dài hơn chuỗi đã nạp thì sản phẩm báo thiếu chuỗi giá.',
        en: 'The series needs at least as many sessions as the Number of sessions in the period you chose, and never fewer than 10. The default is 60. Choosing a period longer than the loaded series reports a missing series.',
      },
    },
    {
      hoi: {
        vi: 'Biên độ dao động tính trên giá đóng cửa hay giá cao nhất thấp nhất trong phiên?',
        en: 'Is the range based on closing prices or on intraday highs and lows?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chỉ trên giá đóng cửa. Sản phẩm lấy N giá đóng cửa gần nhất, tìm đỉnh và đáy trong đó rồi tính (đỉnh trừ đáy) chia đáy, nhân 100. Bóng nến trong phiên không được tính.',
        en: 'Closing prices only. The product takes the latest N closes, finds the highest and lowest, then computes (high minus low) divided by low, times 100. Intraday wicks are not counted.',
      },
    },
    {
      hoi: {
        vi: 'Vì sao phần trăm lấy đáy làm gốc mà không phải đỉnh?',
        en: 'Why is the percentage measured from the low rather than from the high?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Công thức hỏi đỉnh cao hơn đáy bao nhiêu phần trăm, nên mẫu số là đáy. Vì thế kết quả có thể vượt 100% nếu đỉnh gấp hơn hai lần đáy. Muốn đo mức tụt từ đỉnh, hãy dùng mức sụt giảm sâu nhất.',
        en: 'The formula asks how many percent the high is above the low, so the low is the denominator. The result can therefore exceed 100% if the high is more than double the low. To measure the fall from a peak, use maximum drawdown instead.',
      },
    },
    {
      hoi: {
        vi: 'Đỉnh nằm trước hay sau đáy thì kết quả có khác nhau không?',
        en: 'Does the result change depending on whether the high comes before or after the low?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Công thức chỉ lấy giá đóng cửa cao nhất và thấp nhất trong kỳ, không xét thứ tự. Nên 19,77% ở ví dụ FPT là quãng giá đã đi lên, không phải mức lỗ ai từng chịu.',
        en: 'No. It takes only the highest and lowest close in the period, regardless of order. So the 19.77% in the FPT example is a climb the price made, not a loss anyone had to sit through.',
      },
    },
  ],
  'chuoi-phien-giam-dai-nhat': [
    {
      hoi: {
        vi: 'Phiên đứng giá, đóng cửa bằng phiên trước, có làm chuỗi giảm bị cắt không?',
        en: 'Does a flat session, closing equal to the previous one, break the losing streak?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Có. Sản phẩm chỉ đếm phiên có lợi suất nhỏ hơn 0. Phiên đóng cửa bằng phiên trước không phải phiên giảm nên đưa bộ đếm chuỗi về 0 và đợt giảm sau đó đếm lại từ đầu.',
        en: 'Yes. Only sessions with a return below 0 are counted. A session closing equal to the previous one is not a down session, so it resets the streak counter to 0 and a later decline starts counting again.',
      },
    },
    {
      hoi: {
        vi: 'Kết quả 0 phiên nghĩa là sao, có phải lỗi không?',
        en: 'What does a result of 0 sessions mean, is it an error?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không phải lỗi. Đó là kết quả thật: trong kỳ đã chọn không có phiên nào đóng cửa thấp hơn phiên liền trước. Chuỗi giá không đủ phiên thì mới báo thiếu chuỗi giá.',
        en: 'It is not an error. It is a real result: no session in the chosen period closed below the one before it. A series that is too short reports a missing series instead.',
      },
    },
    {
      hoi: {
        vi: 'Chọn 60 phiên trong kỳ thì chuỗi giảm dài nhất có thể tối đa là bao nhiêu phiên?',
        en: 'If I pick 60 sessions in the period, what is the longest streak the result can show?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Tối đa 59. Sản phẩm lấy 60 giá đóng cửa gần nhất, từ đó chỉ có 59 lợi suất giữa các phiên, nên một chuỗi giảm liền không thể dài hơn 59.',
        en: 'At most 59. The product takes the latest 60 closes, which give only 59 returns between sessions, so an unbroken decline cannot be longer than 59.',
      },
    },
    {
      hoi: {
        vi: 'Chuỗi phiên giảm dài nhất khác gì mức sụt giảm sâu nhất?',
        en: 'How is the longest losing streak different from maximum drawdown?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chuỗi giảm chỉ đếm số phiên giảm liền, không đo mất bao nhiêu phần trăm. Một chuỗi 4 phiên có thể mất ít hơn một chuỗi 3 phiên giảm mạnh. Muốn biết mức lỗ hãy xem mức sụt giảm sâu nhất.',
        en: 'The streak only counts consecutive down sessions and does not measure how many percent was lost. A 4-session streak can lose less than a 3-session streak of sharp falls. For the size of the loss, look at maximum drawdown.',
      },
    },
  ],
};
