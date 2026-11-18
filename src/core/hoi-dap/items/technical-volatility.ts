import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `technical-volatility` (`src/core/formulas/technical-volatility.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_TECHNICAL_VOLATILITY: Readonly<
  Record<string, ReadonlyArray<CauHoiThuongGap>>
> = {
  'dai-bollinger-duoi': [
    {
      hoi: {
        vi: 'Tại sao dải Bollinger thường dùng độ lệch chuẩn 2 chứ không phải số khác như 2,8 hay 1,2?',
        en: 'Why do Bollinger Bands typically use a standard deviation multiplier of 2 rather than another number such as 2.8 or 1.2?',
      },
      nguyenVan: 'Why do Bollinger Bands typically use a standard deviation of 2?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/132966/why-do-bollinger-bands-typically-use-a-standard-deviation-of-2',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án được chấp nhận, dẫn sách Bollinger on Bollinger Bands: Bollinger thử nhiều cặp chu kỳ và hệ số, thấy với đường trung bình 20 ngày thì 2 độ lệch chuẩn bao được khoảng 90% dữ liệu. Rút ngắn chu kỳ thì phải giảm hệ số để giữ tỷ lệ ấy, kéo dài thì tăng lên; 20 và 2 là điểm xuất phát chứ không phải con số bắt buộc. Trên trang này cả hai đổi được ở ô Chu kỳ dải Bollinger và ô Hệ số nhân độ lệch chuẩn.',
        en: 'The accepted answer, citing the book Bollinger on Bollinger Bands: Bollinger tested many pairs of period and multiplier and found that with a 20-day moving average, 2 standard deviations covered about 90% of the data. A shorter period needs a smaller multiplier to keep that share and a longer one a larger multiplier; 20 and 2 are a starting point, not a requirement. On this page both can be changed in the Bollinger band period and Standard deviation multiplier fields.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/132966/why-do-bollinger-bands-typically-use-a-standard-deviation-of-2',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tại sao giá tăng mà dải dưới lại đi xuống?',
        en: 'Why does the lower band move down while the price is rising?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Dải dưới bằng đường giữa trừ k lần độ lệch chuẩn. Một phiên giá bật mạnh chỉ kéo đường giữa lên một chút, nhưng nếu nó làm độ lệch chuẩn nở ra và k lần phần nở ấy lớn hơn phần đường giữa nhích lên, dải dưới sẽ hạ xuống trong khi dải trên đi lên. Với FPT ví dụ, phiên 10/09/2026 giá đóng cửa tăng từ 72.400 ₫ lên 74.500 ₫, đường giữa 20 phiên nhích từ 71.095 ₫ lên 71.230 ₫, còn dải dưới hạ từ 68.065,5 ₫ xuống 67.864,83 ₫.',
        en: 'The lower band is the middle line minus k times the standard deviation. A sharp up session lifts the middle line only a little, but if it widens the standard deviation and k times that widening exceeds the rise in the middle line, the lower band drops while the upper band rises. For the FPT example, in the 2026-09-10 session the close rose from 72,400 ₫ to 74,500 ₫ and the 20-session middle line edged up from 71,095 ₫ to 71,230 ₫, while the lower band fell from 68,065.5 ₫ to 67,864.83 ₫.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao dải dưới ở đây cao hơn một chút so với một số bảng giá?',
        en: 'Why is the lower band here slightly higher than on some price boards?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Một nguyên nhân là cách tính độ lệch chuẩn. Sản phẩm chia cho n, đúng cách Bollinger tính; nơi nào chia cho n − 1 sẽ ra độ lệch chuẩn lớn hơn căn bậc hai của n ÷ (n − 1) lần, với 20 phiên là khoảng 1,026 lần, nên dải dưới của họ thấp hơn một chút. Với FPT ví dụ, dải dưới ở đây là 68.218,5 ₫, chia cho n − 1 thì ra 68.131,7 ₫.',
        en: 'One cause is how the standard deviation is computed. The tool divides by n, the way Bollinger does; a platform that divides by n − 1 gets a standard deviation larger by the square root of n ÷ (n − 1), about 1.026 times for 20 sessions, so its lower band sits slightly lower. For the FPT example, the lower band here is 68,218.5 ₫, while dividing by n − 1 gives 68,131.7 ₫.',
      },
    },
  ],
  'atr-dao-dong-thuc': [
    {
      hoi: {
        vi: 'Đường ATR trên biểu đồ đang cho thấy điều gì, có phải trung bình biên độ cao thấp của 14 ngày gần nhất không?',
        en: 'What does the ATR line on the chart show; is it the average high-low range over the last 14 days?',
      },
      nguyenVan: 'How does the Average True Range indicator get calculated?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/141992/how-does-the-average-true-range-indicator-get-calculated',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Không hẳn. Mỗi điểm trên đường là ATR tại phiên đó. Dao động thực của một phiên là số lớn nhất trong (cao − thấp) và khoảng cách từ giá cao, giá thấp tới giá đóng cửa phiên trước; ATR làm mượt chúng theo Wilder nên vẫn mang một phần các phiên cũ hơn. Với FPT ví dụ, ATR 14 phiên là 1.502,87 ₫, còn trung bình cộng (cao − thấp) của 14 phiên cuối chỉ 1.321,43 ₫.',
        en: 'Not quite. Each point on the line is the ATR at that session. The true range of a session is the largest of (high − low) and the distances from the high and the low to the previous close, and ATR smooths these the Wilder way, so it still carries part of older sessions. For the FPT example, the 14-session ATR is 1,502.87 ₫, while the plain average of (high − low) over the last 14 sessions is only 1,321.43 ₫.',
      },
    },
    {
      hoi: {
        vi: 'ATR có đo biến động tốt hơn độ biến động lịch sử (chỉ dùng giá đóng cửa) không?',
        en: 'Is the average true range a better measure of volatility than historical volatility?',
      },
      nguyenVan:
        'Is the average true range a better measure of volatility than historical volatility',
      nguon: {
        url: 'https://money.stackexchange.com/questions/30440/is-the-average-true-range-a-better-measure-of-volatility-than-historical-volatil',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án được chấp nhận: ATR nhìn vào biên độ trong từng phiên nên thấy được cổ phiếu đang biến động mạnh lên hay yếu đi trong giao dịch hằng ngày, còn độ biến động lịch sử theo giá đóng cửa cho cái nhìn về biến động dài hạn; thước đo nào tốt hơn tùy bạn dùng để làm gì. Trên trang này ATR tính bằng đồng mỗi phiên, gồm cả khoảng nhảy so với giá đóng cửa phiên trước, còn Độ biến động lịch sử năm hoá tính bằng %/năm từ lợi suất log của giá đóng cửa.',
        en: 'The accepted answer: ATR looks at the range within each day, so it shows whether the stock is becoming more or less volatile in daily trading, while historical volatility from closing prices gives a view of longer-term volatility; which measure is better depends on what you use it for. On this page ATR is in dong per session and includes gaps from the previous close, while Annualized historical volatility is in % per year from log returns of closing prices.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/30440/is-the-average-true-range-a-better-measure-of-volatility-than-historical-volatil',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tại sao ATR báo thiếu chuỗi giá dù chuỗi đã có giá đóng cửa?',
        en: 'Why does ATR report a missing price series when the series already has closing prices?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Dao động thực cần giá cao, giá thấp của phiên và giá đóng cửa phiên trước. Phiên thiếu giá cao hoặc giá thấp, hay có giá cao nhỏ hơn giá thấp, bị bỏ qua; còn dưới chu kỳ + 1 phiên đủ ba giá (15 phiên với chu kỳ 14) thì màn báo thiếu chuỗi giá. Chuỗi chỉ có cột giá đóng cửa không tính được ATR.',
        en: 'A true range needs the session high, the session low and the previous close. Sessions missing a high or low, or with a high below the low, are skipped, and with fewer than period + 1 complete sessions (15 for a period of 14) the screen reports a missing price series. A closes-only series cannot produce an ATR.',
      },
    },
  ],
  vwap: [
    {
      hoi: {
        vi: 'Tại sao VWAP tính theo công thức phổ biến lại khác giá trị VWAP hiển thị trên investing.com?',
        en: 'Why does the VWAP from the common formula differ from the VWAP shown on investing.com?',
      },
      nguyenVan: 'VWAP calulation on investing.com is different than what the formula gives',
      nguon: {
        url: 'https://money.stackexchange.com/questions/129479/vwap-calulation-on-investing-com-is-different-than-what-the-formula-gives',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'VWAP có nhiều cách tính, nên hai nơi ra số khác nhau là chuyện thường. Đoạn mã của người hỏi lấy giá điển hình là (mở + cao + thấp) ÷ 3, trong khi định nghĩa quen dùng là (cao + thấp + đóng cửa) ÷ 3; VWAP lại cộng dồn, nên cộng từ thời điểm nào và trên khung dữ liệu nào cũng làm số khác đi. Trang này là một cách khác nữa: gộp n phiên gần nhất, mỗi phiên lấy giá đóng cửa nhân khối lượng khớp.',
        en: 'VWAP is computed in several ways, so two places giving different numbers is normal. The code in the question takes the typical price as (open + high + low) ÷ 3, while the usual definition is (high + low + close) ÷ 3; VWAP is also cumulative, so where the sum starts and which data interval it runs on change the figure too. This page uses yet another way: it pools the last n sessions, each taking the closing price times matched volume.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao VWAP báo chia cho 0 hoặc báo thiếu chuỗi giá?',
        en: 'Why does VWAP report a divide-by-zero or a missing price series?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Báo chia cho 0 khi mọi phiên trong n phiên gộp đều có khối lượng bằng 0, vì phép tính chia cho tổng khối lượng. Báo thiếu chuỗi giá khi không đủ n phiên có cả giá đóng cửa và khối lượng: phiên để trống ô khối lượng bị bỏ hẳn, và chuỗi chỉ có giá đóng cửa không tính được VWAP.',
        en: 'Divide-by-zero appears when every session among the n pooled has zero volume, because the calculation divides by total volume. A missing price series appears when fewer than n sessions have both a close and a volume: a session with a blank volume cell is dropped entirely, and a closes-only series cannot produce a VWAP.',
      },
    },
    {
      hoi: {
        vi: 'Phiên không khớp lệnh, khối lượng bằng 0, có kéo VWAP về giá của phiên đó không?',
        en: 'Does a session with no matched trades, volume 0, pull the VWAP toward its price?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Giá của phiên ấy nhân với khối lượng 0 nên không góp gì vào tổng, nhưng phiên vẫn chiếm một chỗ trong n phiên gộp. Vì vậy nếu một trong 20 phiên có khối lượng 0, VWAP 20 phiên thực chất là VWAP của 19 phiên còn lại.',
        en: 'No. Its price is multiplied by a volume of 0, so it adds nothing to the totals, but the session still takes one of the n pooled slots. So if one of the 20 sessions has zero volume, the 20-session VWAP is in effect the VWAP of the other 19 sessions.',
      },
    },
  ],
  'dai-bollinger-tren': [
    {
      hoi: {
        vi: 'Có nên đổi thông số mặc định (20, 2) của dải Bollinger không?',
        en: 'Should the default Bollinger band settings (20, 2) be changed?',
      },
      nguyenVan: 'Có nên đổi thông số mặc định (20, 2) của Bollinger Bands không?',
      nguon: {
        url: 'https://www.dsc.com.vn/kien-thuc/bollinger-bands-la-gi-cach-su-dung-trong-giao-dich-chung-khoan',
        ten: 'DSC mục Các câu hỏi thường gặp về chỉ báo Bollinger Bands',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Không bắt buộc: 20 phiên và k = 2 là bộ Bollinger dùng, còn sản phẩm để bạn đổi cả hai ô, chu kỳ từ 5 đến 500 phiên, hệ số k từ 0,1 đến 10. Chu kỳ ngắn thì dải bám các phiên gần hơn; k nhỏ thì dải hẹp lại và nhiều phiên đóng cửa ra ngoài dải hơn. Trên chuỗi FPT ví dụ, chu kỳ 20 phiên với k = 2 cho dải trên 74.901,5 ₫, còn 10 phiên với k = 1,9 cho 73.987,92 ₫.',
        en: 'Not necessarily: 20 sessions and k = 2 are what Bollinger uses, and the tool lets you change both fields, the period from 5 to 500 sessions and k from 0.1 to 10. A shorter period makes the band follow more recent sessions; a smaller k narrows the band, so more closes fall outside it. On the FPT example series, 20 sessions with k = 2 give an upper band of 74,901.5 ₫, while 10 sessions with k = 1.9 give 73,987.92 ₫.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao giá vượt ra ngoài dải trên mà cổ phiếu vẫn không giảm, còn tăng liên tục?',
        en: 'Why does the price go above the upper band yet the stock keeps rising instead of falling?',
      },
      nguyenVan:
        'Tại sao giá vượt ra ngoài dải trên nhưng cổ phiếu vẫn không giảm mà tăng trần liên tục?',
      nguon: {
        url: 'https://www.dsc.com.vn/kien-thuc/bollinger-bands-la-gi-cach-su-dung-trong-giao-dich-chung-khoan',
        ten: 'DSC mục Các câu hỏi thường gặp về chỉ báo Bollinger Bands',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Dải trên là trung bình n phiên cộng k lần độ lệch chuẩn của chính n giá đóng cửa ấy, không phải trần giá hay mức giá phải quay về. Khi giá tăng mạnh nhiều phiên liền, mỗi giá mới kéo đường giữa lên và giá chạy xa khỏi trung bình thường làm độ lệch chuẩn nở ra, nên dải trên đi lên theo và giá có thể đóng cửa trên hoặc sát dải nhiều phiên. Dải mô tả độ phân tán của giá, không báo trước lúc nào giá giảm.',
        en: 'The upper band is the n-session average plus k times the standard deviation of those same n closes, not a price ceiling or a level the price must return to. When the price rises hard for many sessions, each new close lifts the middle line, and a price running away from the average usually widens the standard deviation, so the band climbs too and the price can close above or near it for many sessions. The band describes price dispersion; it does not tell when the price will fall.',
      },
    },
    {
      hoi: {
        vi: 'Dải trên cao hơn đường giữa bao nhiêu, và con số ấy tính thế nào?',
        en: 'How far above the middle line is the upper band, and how is that gap worked out?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Đúng k lần độ lệch chuẩn của n giá đóng cửa. Với FPT ví dụ, đường giữa là 71.560 ₫, độ lệch chuẩn của 20 giá đóng cửa là 1.670,75 ₫, nên dải trên là 71.560 + 2 × 1.670,75 = 74.901,5 ₫, cao hơn đường giữa 3.341,5 ₫. Dải dưới nằm cách đường giữa đúng chừng ấy về phía dưới.',
        en: 'Exactly k times the standard deviation of the n closes. For the FPT example, the middle line is 71,560 ₫ and the standard deviation of the 20 closes is 1,670.75 ₫, so the upper band is 71,560 + 2 × 1,670.75 = 74,901.5 ₫, 3,341.5 ₫ above the middle line. The lower band sits the same distance below it.',
      },
    },
  ],
  'do-rong-dai-bollinger': [
    {
      hoi: {
        vi: 'Độ rộng dải Bollinger khác gì độ lệch chuẩn hay dải trên trừ dải dưới?',
        en: 'How is Bollinger bandwidth different from the standard deviation or from upper band minus lower band?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Dải trên trừ dải dưới là khoảng cách tính bằng đồng, phụ thuộc mức giá. Độ rộng chia khoảng đó cho đường giữa rồi nhân 100 nên ra phần trăm, so được giữa mã giá thấp và mã giá cao.',
        en: 'Upper minus lower band is a gap in price units and depends on the price level. Bandwidth divides it by the middle line and multiplies by 100, so it is a percentage that compares low-priced and high-priced stocks.',
      },
    },
    {
      hoi: {
        vi: 'Đổi hệ số nhân từ 2 lên 4 thì độ rộng dải thay đổi thế nào?',
        en: 'What happens to the bandwidth if I change the multiplier from 2 to 4?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Tăng gấp đôi. Độ rộng bằng 2 × k × độ lệch chuẩn ÷ đường giữa × 100, tỉ lệ thẳng với k, còn chu kỳ không đổi thì độ lệch chuẩn và đường giữa không đổi.',
        en: 'It doubles. Bandwidth equals 2 × k × standard deviation ÷ middle line × 100, directly proportional to k, while the standard deviation and middle line stay the same for a fixed period.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao độ rộng dải ra đúng 0 và đó có phải lỗi không?',
        en: 'Why does the bandwidth come out as exactly 0, and is that an error?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không phải lỗi. Giá đóng cửa không đổi suốt n phiên nên độ lệch chuẩn bằng 0, hai dải trùng đường giữa và độ rộng bằng 0.',
        en: 'It is not an error. The close did not change over the n sessions, so the standard deviation is 0, both bands coincide with the middle line and the width is 0.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao sản phẩm báo thiếu chuỗi giá hoặc chu kỳ phải từ 2 phiên trở lên?',
        en: 'Why does the tool report a missing series, or say the period must be at least 2 sessions?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Cần ít nhất bằng chu kỳ n phiên giá đóng cửa hợp lệ để tính đường giữa và độ lệch chuẩn. Chu kỳ dưới 2 thì một phiên không có độ phân tán nào để đo.',
        en: 'It needs at least n valid closes, where n is the period, to compute the middle line and standard deviation. With a period below 2, a single session has no dispersion to measure.',
      },
    },
  ],
  'phan-tram-b-bollinger': [
    {
      hoi: {
        vi: '%B có thể lớn hơn 100% hoặc nhỏ hơn 0% không, vì sao?',
        en: 'Can %B be above 100% or below 0%, and why?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Có. Sản phẩm không chặn kết quả trong khoảng 0 đến 100. Giá đóng cửa phiên cuối nằm trên dải trên thì %B lớn hơn 100, nằm dưới dải dưới thì âm.',
        en: 'Yes. The tool does not clamp the result between 0 and 100. A last close above the upper band gives %B above 100, and below the lower band gives a negative value.',
      },
    },
    {
      hoi: {
        vi: '%B bằng 50% có nghĩa là giá đang đúng ở đường giữa không?',
        en: 'Does a %B of 50% mean the price is exactly on the middle line?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Đúng. %B = 50 + (giá − đường giữa) ÷ (2 × k × độ lệch chuẩn) × 100, nên bằng 50 khi giá đóng cửa trùng đường giữa, tức trung bình n phiên.',
        en: 'Yes. %B = 50 + (price − middle line) ÷ (2 × k × standard deviation) × 100, so it is 50 when the close equals the middle line, the n-session average.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao %B báo lỗi chia cho 0?',
        en: 'Why does %B report a divide-by-zero?',
      },
      tuSoan: true,
      traLoi: {
        vi: '%B chia cho bề rộng dải. Giá đóng cửa không đổi suốt n phiên thì độ lệch chuẩn bằng 0, hai dải trùng nhau và bề rộng bằng 0, nên sản phẩm báo chia cho 0 thay vì in một số vô hạn. Ô Hệ số nhân nhận từ 0,1 trở lên, nên chỉ chuỗi giá đi ngang mới gây ra trường hợp này.',
        en: '%B divides by the band width. If the close did not change over n sessions the standard deviation is 0, the bands coincide and the width is 0, so the tool reports a divide by zero instead of printing an infinite number. The multiplier field starts at 0.1, so only a flat price series causes this.',
      },
    },
    {
      hoi: {
        vi: 'Dải Bollinger của sản phẩm chia độ lệch chuẩn cho n hay n − 1, và có ảnh hưởng tới %B không?',
        en: "Does the tool's Bollinger band divide the standard deviation by n or n − 1, and does it affect %B?",
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chia cho n, đúng cách Bollinger tính. Nền tảng nào chia cho n − 1 sẽ ra dải rộng hơn chút nên %B cùng một giá sẽ ra số khác chút.',
        en: 'It divides by n, as Bollinger does. A platform that divides by n − 1 gets slightly wider bands, so the same price gives a slightly different %B.',
      },
    },
  ],
  'stochastic-k': [
    {
      hoi: {
        vi: 'Vì sao Stochastic %K cần chuỗi có đủ giá cao, thấp và đóng cửa, chỉ có giá đóng cửa thì không tính được?',
        en: 'Why does Stochastic %K need high, low and close prices, and not work with closes only?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Vì %K lấy giá cao nhất và thấp nhất trong n phiên làm hai đầu thang, rồi xem giá đóng cửa phiên cuối nằm ở đâu. Phiên thiếu giá cao, thấp hoặc có giá cao nhỏ hơn giá thấp bị loại, không đủ n phiên thì báo thiếu chuỗi.',
        en: 'Because %K uses the highest high and lowest low over n sessions as the two ends of the scale, then locates the last close on it. Sessions missing a high or low, or with a high below the low, are dropped, and fewer than n left gives a missing-series message.',
      },
    },
    {
      hoi: {
        vi: '%K của sản phẩm là %K thô hay đã làm mượt bằng trung bình ba phiên?',
        en: "Is the tool's %K the raw value or smoothed with a 3-session average?",
      },
      tuSoan: true,
      traLoi: {
        vi: 'Là %K thô: (đóng cửa − thấp nhất n phiên) ÷ (cao nhất − thấp nhất n phiên) × 100, không làm mượt và không có đường %D.',
        en: 'It is the raw %K: (close − n-session lowest) ÷ (highest − lowest) × 100, with no smoothing and no %D line.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao %K báo lỗi chia cho 0?',
        en: 'Why does %K show a divide-by-zero error?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Khi giá cao nhất bằng giá thấp nhất trong n phiên, tức giá đứng yên (mã ngừng giao dịch hoặc đứng giá), mẫu số bằng 0. Chọn chu kỳ dài hơn hoặc chuỗi khác.',
        en: 'When the highest price equals the lowest over the n sessions, meaning the price did not move (a halted or flat stock), the denominator is 0. Choose a longer period or another series.',
      },
    },
    {
      hoi: {
        vi: 'Đổi chu kỳ từ 14 sang 5 phiên thì %K khác đi thế nào?',
        en: 'How does %K change if I switch the period from 14 to 5 sessions?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chu kỳ ngắn hơn thì thang cao thấp chỉ gồm 5 phiên gần nhất nên hẹp hơn, %K đổi nhanh theo giá hơn. Chu kỳ dài thì thang rộng hơn và %K đổi chậm hơn. Giá đóng cửa vẫn là phiên cuối.',
        en: 'A shorter period makes the scale cover only the last 5 sessions, so it is narrower and %K reacts faster to price. A longer period gives a wider scale and a slower %K. The close is still the last session.',
      },
    },
  ],
  'do-bien-dong-lich-su': [
    {
      hoi: {
        vi: 'Số phiên giá lấy mẫu là 60 thì độ biến động tính trên bao nhiêu lợi suất?',
        en: 'If the sample is 60 price sessions, how many returns is the volatility computed on?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Trên 59 lợi suất: n phiên giá cho n − 1 lợi suất log, và độ lệch chuẩn mẫu chia cho số lợi suất trừ 1. Tối thiểu 3 phiên giá để có hai lợi suất.',
        en: 'On 59 returns: n price sessions give n − 1 log returns, and the sample standard deviation divides by the number of returns minus 1. At least 3 price sessions are needed to get two returns.',
      },
    },
    {
      hoi: {
        vi: 'Đổi số phiên giao dịch một năm từ 252 sang 250 thì kết quả đổi bao nhiêu?',
        en: 'How much does the result change if I use 250 trading sessions a year instead of 252?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Nhân với căn bậc hai của 250 ÷ 252, khoảng 0,996, tức giảm chừng 0,4%. Quy năm nhân với căn bậc hai của số phiên chứ không nhân thẳng số phiên.',
        en: 'It is multiplied by the square root of 250 ÷ 252, about 0.996, a drop of roughly 0.4%. Annualizing multiplies by the square root of the sessions, not the sessions themselves.',
      },
    },
    {
      hoi: {
        vi: 'Độ biến động lịch sử này tính từ lợi suất đơn hay lợi suất log?',
        en: 'Is this historical volatility computed from simple returns or log returns?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Từ lợi suất log (ln của giá phiên sau chia giá phiên trước). Lợi suất log cộng dồn được qua các phiên nên nhân với căn bậc hai của số phiên mới đúng nghĩa quy năm. Kết quả in theo %/năm.',
        en: "From log returns (ln of today's price over the previous price). Log returns add across sessions, so scaling by the square root of the sessions is a proper annualization. The result is shown as % per year.",
      },
    },
    {
      hoi: {
        vi: 'Vì sao chuỗi có ít phiên thì báo thiếu chuỗi giá, và số phiên lấy mẫu có nên quá ít không?',
        en: 'Why is a short series reported as missing, and should the sample be very small?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chuỗi phải có ít nhất bằng số phiên lấy mẫu, nếu thiếu sản phẩm báo thiếu chuỗi giá chứ không tính trên số phiên ít hơn. Mô tả của ô nói dưới 20 phiên thì con số nhảy rất mạnh theo vài phiên cá biệt.',
        en: 'The series must hold at least the chosen sample size; otherwise the tool reports a missing series instead of computing on fewer sessions. The field note says below 20 sessions the number swings wildly on a few outlier sessions.',
      },
    },
  ],
  'ty-le-khoi-luong': [
    {
      hoi: {
        vi: 'Phiên gần nhất có nằm trong trung bình n phiên làm mốc không?',
        en: 'Is the most recent session included in the n-session baseline average?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Mốc là trung bình khối lượng n phiên liền trước phiên gần nhất, rồi lấy khối lượng phiên gần nhất chia cho mốc đó. Vì vậy cần ít nhất n + 1 phiên.',
        en: 'No. The baseline is the average volume of the n sessions just before the latest one, and the latest volume is divided by it. That is why at least n + 1 sessions are needed.',
      },
    },
    {
      hoi: {
        vi: 'Kết quả 2,5 lần nghĩa là gì, ví dụ mốc 1.000 và phiên gần nhất 2.500?',
        en: 'What does a result of 2.5 times mean, for example a baseline of 1,000 and a latest volume of 2,500?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Khối lượng phiên gần nhất bằng 2,5 lần khối lượng trung bình n phiên trước. Nếu mốc 1.000 và phiên gần nhất 2.500 thì 2.500 ÷ 1.000 = 2,5 lần. Kết quả 1 lần nghĩa là bằng đúng mốc.',
        en: "The latest session's volume is 2.5 times the average of the previous n sessions. With a baseline of 1,000 and a latest volume of 2,500, 2,500 ÷ 1,000 = 2.5 times. A result of 1 means exactly equal to the baseline.",
      },
    },
    {
      hoi: {
        vi: 'Vì sao báo lỗi chia cho 0 hoặc thiếu chuỗi khi tính tỷ lệ khối lượng?',
        en: 'Why does relative volume show a divide-by-zero or a missing-series message?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chia cho 0 khi mọi phiên làm mốc đều có khối lượng 0, hãy kiểm tra cột khối lượng. Thiếu chuỗi khi không đủ n + 1 phiên có cả giá đóng cửa và khối lượng hợp lệ. Chuỗi chỉ có giá đóng cửa, không có cột khối lượng, không dùng được.',
        en: 'Divide-by-zero happens when every baseline session has zero volume, so check the volume column. Missing series happens when fewer than n + 1 sessions have both a valid close and volume. A closes-only series with no volume column cannot be used.',
      },
    },
  ],
};
