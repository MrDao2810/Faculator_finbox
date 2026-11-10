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
        vi: 'Tại sao %B báo lỗi chia cho 0 hoặc hệ số nhân bằng 0 không dùng được?',
        en: 'Why does %B report a divide-by-zero, or reject a multiplier of 0?',
      },
      tuSoan: true,
      traLoi: {
        vi: '%B chia cho bề rộng dải. Giá đóng cửa không đổi suốt n phiên thì hai dải trùng nhau, bề rộng bằng 0. Hệ số nhân bằng 0 hoặc âm cũng làm hai dải trùng đường giữa nên sản phẩm báo vô nghĩa.',
        en: '%B divides by the band width. If the close did not change over n sessions the bands coincide and the width is 0. A multiplier of 0 or below also collapses the bands onto the middle line, so the tool reports it as meaningless.',
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
