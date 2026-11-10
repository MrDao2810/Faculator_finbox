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
