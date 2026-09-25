/**
 * Câu hỏi kiểm tra hiểu bài — nhóm Phân tích kỹ thuật.
 *
 * Mỗi câu gắn một nguồn thật; xem bất biến ở `../types.ts`. Không thêm câu nào vào đây mà
 * không có `source.url` trỏ tới chỗ đọc được điều câu hỏi đang kiểm tra.
 */

import type { QuizItem } from '../types';

export const KY_THUAT: ReadonlyArray<QuizItem> = [
  {
    id: 'Q098',
    formulaId: 'rsi-wilder',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'RSI vượt 70 trong một xu hướng tăng mạnh. Cách đọc đúng?' },
    choices: {
      a: { vi: 'Tín hiệu bán, chốt lời ngay' },
      b: { vi: 'Quá mua cũng là dấu hiệu SỨC MẠNH, RSI có thể ở trên 70 rất lâu' },
      c: { vi: 'Cổ phiếu đang đắt' },
      d: { vi: 'Sắp đảo chiều trong 3 phiên' },
    },
    answer: 'b',
    explain: {
      vi: 'Trong một xu hướng tăng mạnh, RSI trên 70 là dấu hiệu SỨC MẠNH của xu hướng chứ không phải tín hiệu bán: chỉ báo động lượng có thể nằm lì trong vùng quá mua suốt cả nhịp tăng. StockCharts: “Momentum oscillators can become overbought (oversold) and remain so in a strong up (down) trend” và “overbought can also be a sign of strength”. Một bài khác nói gọn hơn: “RSI above 70 is not a red flag, but a green light for momentum”.',
      en: 'Inside a strong uptrend, RSI above 70 is a mark of STRENGTH in the trend rather than a sell signal: a momentum oscillator can sit in overbought territory for the whole advance. StockCharts: “Momentum oscillators can become overbought (oversold) and remain so in a strong up (down) trend” and “overbought can also be a sign of strength”. Another piece puts it more bluntly: “RSI above 70 is not a red flag, but a green light for momentum”.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/relative-strength-index-rsi',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q099',
    formulaId: 'rsi-wilder',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Welles Wilder thiết kế RSI năm 1978 cho trạng thái thị trường nào?' },
    choices: {
      a: { vi: 'Thị trường xu hướng mạnh' },
      b: { vi: 'Thị trường đi ngang' },
      c: { vi: 'Mọi trạng thái' },
      d: { vi: 'Thị trường phái sinh' },
    },
    answer: 'b',
    explain: {
      vi: "Wilder thiết kế RSI năm 1978 cho thị trường ĐI NGANG, để bắt các cực trị trong một biên dao động, chứ không phải cho thị trường có xu hướng mạnh. Đó cũng là lý do ngưỡng 30/70 hay hỏng khi giá đang chạy theo xu hướng. Nguyên văn: “Welles Wilder, who created RSI in 1978, intended it to spot extremes in sideways markets. But there's an obvious twist (or trap): in trending markets, those rules of thumb don't always hold up”.",
      en: "Wilder built RSI in 1978 for SIDEWAYS markets, to catch extremes inside a range, not for strongly trending ones. That is also why the 30/70 thresholds keep failing while price is running with a trend. Verbatim: “Welles Wilder, who created RSI in 1978, intended it to spot extremes in sideways markets. But there's an obvious twist (or trap): in trending markets, those rules of thumb don't always hold up”.",
    },
    source: {
      url: 'https://articles.stockcharts.com/article/stockcharts-insider-how-an-overbought-rsi-can-be-your-best-buy-signal/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q100',
    formulaId: 'rsi-wilder',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Bạn tự tính RSI 14 bằng trung bình cộng đơn giản và ra số lệch bảng điện 5–10 điểm. Vì sao?',
    },
    choices: {
      a: { vi: 'Do thiếu dữ liệu' },
      b: {
        vi: 'RSI chuẩn Wilder dùng làm mượt hệ số 1/n, không phải SMA cũng không phải EMA 2/(n+1)',
      },
      c: { vi: 'Do múi giờ' },
      d: { vi: 'Do bảng điện làm tròn' },
    },
    answer: 'b',
    explain: {
      vi: 'Vì Wilder không dùng trung bình cộng đơn giản mà dùng một lối làm mượt riêng, cộng dồn giá trị kỳ trước với trọng số 13/14. Nguyên văn công thức: “Average Gain = [(previous Average Gain) x 13 + current Gain] / 14”. Thay nó bằng trung bình cộng hay bằng EMA là ra một chỉ số khác hẳn: nguồn đo được “EMA RSI overshoots Wilder RSI by 5–10 points”, và “The same 14-period RSI can display materially different values across platforms purely because of the smoothing method”.',
      en: 'Because Wilder does not use a simple average but his own smoothing, carrying the previous value forward with a weight of 13/14. The formula verbatim: “Average Gain = [(previous Average Gain) x 13 + current Gain] / 14”. Swap it for a simple average or an EMA and you get a different indicator: the source measures that “EMA RSI overshoots Wilder RSI by 5–10 points”, and “The same 14-period RSI can display materially different values across platforms purely because of the smoothing method”.',
    },
    source: {
      url: 'https://rsimonitor.com/articles/wilder-smoothing',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q101',
    formulaId: 'rsi-wilder',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Cùng mã, cùng chu kỳ 14 nhưng hai phần mềm ra RSI khác nhau. Nguyên nhân kỹ thuật?',
    },
    choices: {
      a: { vi: 'Một bên tính sai' },
      b: { vi: 'Làm mượt đệ quy nên giá trị phụ thuộc lượng dữ liệu nạp vào (điểm khởi đầu)' },
      c: { vi: 'Do giá điều chỉnh cổ tức' },
      d: { vi: 'Do chu kỳ 14 không chuẩn' },
    },
    answer: 'b',
    explain: {
      vi: 'Vì làm mượt kiểu Wilder cộng dồn từ phiên đầu tiên có dữ liệu, nên điểm bắt đầu và độ dài chuỗi quyết định kết quả: hai phần mềm nạp số phiên lịch sử khác nhau sẽ ra hai con số khác nhau dù cùng chu kỳ 14. Một trader mô tả: “RSI value depends on starting point and if you do not have enough data the calculations will not match”. StockCharts xác nhận: “RSI values may differ based on the total calculation period”.',
      en: 'Because Wilder smoothing accumulates from the first session with data, so the starting point and the length of the series decide the result: two platforms loading different amounts of history return different numbers even on the same 14-period setting. One trader describes it: “RSI value depends on starting point and if you do not have enough data the calculations will not match”. StockCharts confirms: “RSI values may differ based on the total calculation period”.',
    },
    source: {
      url: 'https://www.elitetrader.com/et/threads/rsi-vs-wilders-rsi-calculation.301359/',
      kind: 'trai-nghiem',
      vietnam: false,
    },
  },
  {
    id: 'Q102',
    formulaId: 'rsi-wilder',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Phân kỳ giảm của RSI xuất hiện trong xu hướng tăng mạnh. Độ tin cậy?' },
    choices: {
      a: { vi: 'Rất cao, nên bán' },
      b: {
        vi: 'Thấp — xu hướng tăng mạnh sinh hàng loạt phân kỳ giảm trước khi đỉnh thật xuất hiện',
      },
      c: { vi: 'Chỉ tin nếu kèm khối lượng' },
      d: { vi: 'Luôn đúng sau 5 phiên' },
    },
    answer: 'b',
    explain: {
      vi: 'Độ tin cậy thấp: trong xu hướng tăng mạnh, phân kỳ giảm xuất hiện liên tục mà giá vẫn đi lên, nên bán theo nó là bán sớm nhiều lần trước khi đỉnh thật xuất hiện. StockCharts: “divergences are misleading in a strong trend. A strong uptrend can show numerous bearish divergences before a top materializes”. Nguồn trong nước (DSC) nói cùng ý: RSI “có thể bị kẹt trong vùng quá mua hoặc quá bán trong thời gian dài, dẫn đến việc đưa ra các tín hiệu đảo chiều sớm và không chính xác”.',
      en: 'Low. Inside a strong uptrend bearish divergences appear again and again while price keeps rising, so trading them means selling early, repeatedly, before the real top arrives. StockCharts: “divergences are misleading in a strong trend. A strong uptrend can show numerous bearish divergences before a top materializes”. A Vietnamese source (DSC) makes the same point: RSI “có thể bị kẹt trong vùng quá mua hoặc quá bán trong thời gian dài, dẫn đến việc đưa ra các tín hiệu đảo chiều sớm và không chính xác” (it can stay stuck in overbought or oversold territory for a long time, producing early and inaccurate reversal signals).',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/relative-strength-index-rsi',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q103',
    formulaId: 'dai-bollinger-tren',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Giá chạm dải Bollinger trên. Theo chính John Bollinger, đây là gì?' },
    choices: {
      a: { vi: 'Tín hiệu bán' },
      b: { vi: 'Chỉ là một lần chạm (tag), tự nó không phải tín hiệu bán' },
      c: { vi: 'Tín hiệu mua' },
      d: { vi: 'Tín hiệu đảo chiều nếu kèm RSI trên 70' },
    },
    answer: 'b',
    explain: {
      vi: 'Theo chính John Bollinger, chạm dải trên chỉ là CHẠM, không phải tín hiệu: trong xu hướng mạnh giá có thể bám dải trên suốt nhịp tăng, nên bán chỉ vì chạm dải là bán sớm. Quy tắc số 6 trong bộ 22 quy tắc chính thức của ông: “Tags of the bands are just that, tags not signals. A tag of the upper Bollinger Band is NOT in-and-of-itself a sell signal”. Quy tắc 22 nói thêm rằng dải băng “do not provide continuous advice”.',
      en: 'According to John Bollinger himself, touching the upper band is just a TAG, not a signal: in a strong trend price can ride the upper band for the whole advance, so selling on the touch means selling early. Rule 6 of his 22 official rules: “Tags of the bands are just that, tags not signals. A tag of the upper Bollinger Band is NOT in-and-of-itself a sell signal”. Rule 22 adds that the bands “do not provide continuous advice”.',
    },
    source: {
      url: 'https://www.bollingerbands.com/bollinger-band-rules',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q215',
    formulaId: 'dai-bollinger-tren',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Dải Bollinger trên = SMA 20 phiên + 2 × độ lệch chuẩn. Với đúng bộ tham số mặc định đó, thực tế bao nhiêu phần trăm dữ liệu giá nằm lọt trong hai dải?',
      en: 'The upper Bollinger Band is the 20-period SMA plus 2 standard deviations. With exactly those default settings, what share of the price data actually falls inside the bands?',
    },
    choices: {
      a: {
        vi: 'Khoảng 95%, vì 2 độ lệch chuẩn của phân phối chuẩn bao phủ 95%',
        en: 'About 95%, because 2 standard deviations of a normal distribution cover 95%',
      },
      b: {
        vi: 'Khoảng 90%, và không được suy ra bất kỳ tỷ lệ thống kê nào từ con số 2 độ lệch chuẩn',
        en: 'About 90%, and no statistical claim at all should be read into the 2-standard-deviation setting',
      },
      c: {
        vi: 'Đúng 68%, vì mỗi dải chỉ cách đường trung bình 1 độ lệch chuẩn',
        en: 'Exactly 68%, because each band sits 1 standard deviation from the average',
      },
      d: {
        vi: '100%, giá không bao giờ đóng cửa ra ngoài dải',
        en: '100%, price never closes outside the bands',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Quy tắc 14 trong bộ 22 quy tắc chính thức của John Bollinger nói thẳng là đừng gắn giả thiết thống kê nào vào con số 2 độ lệch chuẩn: “In practice we typically find 90%, not 95%, of the data inside Bollinger Bands with the default parameters”. Lý do quy tắc này nêu là phân phối giá chứng khoán không phải phân phối chuẩn, và mẫu 20 phiên quá nhỏ để có ý nghĩa thống kê. Con số 2 là một lựa chọn thực nghiệm để dải bao được phần lớn giá, không phải một ngưỡng xác suất.',
      en: "Rule 14 of John Bollinger's own 22 rules says outright that no statistical assumption belongs on the 2-standard-deviation setting: “In practice we typically find 90%, not 95%, of the data inside Bollinger Bands with the default parameters”. The rule gives the reason: security prices are not normally distributed, and a 20-period sample is far too small for statistical significance. The 2 is an empirical choice that contains most of the price action, not a probability threshold.",
    },
    source: {
      url: 'https://www.bollingerbands.com/bollinger-band-rules',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q216',
    formulaId: 'dai-bollinger-tren',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một phiên đóng cửa vượt hẳn lên trên dải Bollinger trên, nhưng khối lượng khớp lệnh lại thấp hơn bình quân. Chứng khoán DSC xếp việc mua đuổi theo phiên đó vào đâu?',
      en: 'A session closes clearly above the upper Bollinger Band, but on below-average volume. Where does Vietnamese broker DSC file the decision to chase that breakout?',
    },
    choices: {
      a: {
        vi: 'Tín hiệu mua mạnh, vì đóng cửa trên dải trên nghĩa là lực mua áp đảo',
        en: 'A strong buy signal, since closing above the upper band means buyers are in control',
      },
      b: {
        vi: 'Một trong ba lỗi cốt lõi: phá vỡ thiếu xác nhận khối lượng thường là phá vỡ giả, giá quay ngược vào trong dải',
        en: 'One of three core errors: a break with no volume confirmation is usually a false break and price turns back inside the bands',
      },
      c: {
        vi: 'Tín hiệu bán, vì ra ngoài dải trên là đã quá mua',
        en: 'A sell signal, because trading outside the upper band means overbought',
      },
      d: {
        vi: 'Không nói lên điều gì, phải chờ giá chạm dải dưới mới có tín hiệu',
        en: 'It says nothing; you must wait for price to reach the lower band before acting',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Công ty chứng khoán DSC xếp việc vào lệnh breakout mà thiếu xác nhận khối lượng vào đúng ba lỗi cốt lõi khi dùng Bollinger Bands: “Một phiên phá vỡ dải biên nhưng khối lượng giao dịch thấp thường là phá vỡ giả.” Bản thân dải trên chỉ là trung bình cộng với độ lệch chuẩn của giá, nó không nhìn thấy khối lượng, nên phần xác nhận buộc phải lấy từ chỗ khác. Đây là giới hạn của công thức chứ không phải lỗi cài đặt tham số.',
      en: 'Vietnamese broker DSC files chasing a breakout without volume confirmation among exactly three core errors in using Bollinger Bands: “Một phiên phá vỡ dải biên nhưng khối lượng giao dịch thấp thường là phá vỡ giả.” (a session that breaks the band on low volume is usually a false break). The upper band is only a moving average plus the standard deviation of price; it cannot see volume, so the confirmation has to come from somewhere else. That is a limit of the formula itself, not a settings problem.',
    },
    source: {
      url: 'https://www.dsc.com.vn/kien-thuc/bollinger-bands-la-gi-cach-su-dung-trong-giao-dich-chung-khoan',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q217',
    formulaId: 'dai-bollinger-tren',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Bạn đổi đường trung bình ở giữa từ 20 phiên lên 50 phiên. Theo John Bollinger, hệ số độ lệch chuẩn dùng cho dải trên phải xử lý thế nào?',
      en: 'You change the middle moving average from 20 periods to 50. According to John Bollinger, what must happen to the standard-deviation multiplier used for the upper band?',
    },
    choices: {
      a: {
        vi: 'Giữ nguyên 2, vì hệ số nhân không liên quan đến độ dài chu kỳ',
        en: 'Leave it at 2, since the multiplier has nothing to do with the length of the average',
      },
      b: {
        vi: 'Nâng lên 2,1; ngược lại nếu rút chu kỳ xuống 10 phiên thì hạ còn 1,9',
        en: 'Raise it to 2.1; conversely, shortening the average to 10 periods means lowering it to 1.9',
      },
      c: {
        vi: 'Hạ xuống 1,9, vì chu kỳ dài đã làm dải rộng sẵn rồi',
        en: 'Lower it to 1.9, because a longer average already makes the bands wider',
      },
      d: {
        vi: 'Đổi trung bình sang EMA rồi giữ nguyên hệ số 2',
        en: 'Switch the average to an EMA and keep the multiplier at 2',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Quy tắc 11 của John Bollinger ghi rõ, và nêu luôn mục đích là giữ mức bao phủ giá ổn định: “If the average is lengthened the number of standard deviations needs to be increased; from 2 at 20 periods, to 2.1 at 50 periods”. Chu kỳ càng dài thì giá càng có thời gian đi xa khỏi đường trung bình, tỷ lệ phiên lọt ra ngoài dải tăng lên, nên hệ số phải nới ra; rút chu kỳ xuống 10 phiên thì làm ngược lại, hạ về 1,9. Bê nguyên hệ số 2 sang mọi chu kỳ là chỗ sai hay gặp nhất khi tự chỉnh tham số.',
      en: "Bollinger's rule 11 states it, and names the purpose as consistent price containment: “If the average is lengthened the number of standard deviations needs to be increased; from 2 at 20 periods, to 2.1 at 50 periods”. A longer average gives price more room to wander away from it, so more sessions fall outside the bands and the multiplier has to widen; shortening the average to 10 periods works the other way, down to 1.9. Carrying the multiplier of 2 over to every period length is the usual mistake when people retune the settings themselves.",
    },
    source: {
      url: 'https://www.bollingerbands.com/bollinger-band-rules',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q218',
    formulaId: 'dai-bollinger-tren',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Bạn tự dựng lại dải trên bằng Excel. Độ lệch chuẩn của 20 phiên phải tính theo kiểu nào mới ra đúng con số của Bollinger?',
      en: "You are rebuilding the upper band in Excel. Which standard deviation of the 20 sessions reproduces Bollinger's own numbers?",
    },
    choices: {
      a: {
        vi: 'Độ lệch chuẩn tổng thể, mẫu số là n (Excel: STDEV.P)',
        en: 'Population standard deviation, divided by n (Excel: STDEV.P)',
      },
      b: {
        vi: 'Độ lệch chuẩn mẫu, mẫu số là n − 1 (Excel: STDEV.S)',
        en: 'Sample standard deviation, divided by n − 1 (Excel: STDEV.S)',
      },
      c: {
        vi: 'Sai số chuẩn của trung bình, tức độ lệch chuẩn chia cho căn bậc hai của n',
        en: 'Standard error of the mean, the standard deviation divided by the square root of n',
      },
      d: {
        vi: 'Độ lệch tuyệt đối bình quân so với đường trung bình',
        en: 'Mean absolute deviation from the moving average',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Chính John Bollinger ghi trong phần kể lại cách ông dựng chỉ báo: “We use the population calculation for standard deviation”, tức chia cho n chứ không phải n − 1. Nhiều người quen tay dùng STDEV.S vì đó là hàm độ lệch chuẩn mặc định trong đầu, nhưng nó cho kết quả lớn hơn, với 20 phiên là lớn hơn khoảng 2,6%, nên dải trên vẽ ra cao hơn dải trên trên phần mềm biểu đồ. Cùng một mã, cùng một ngày, hai người sẽ đọc ra hai mức giá khác nhau chỉ vì mẫu số.',
      en: 'John Bollinger himself, recounting how he settled on the indicator, writes: “We use the population calculation for standard deviation” — the divisor is n, not n − 1. Many people reach for STDEV.S out of habit, but it returns a larger figure, about 2.6% larger over 20 sessions, so the upper band is drawn higher than the one their charting software shows. Same ticker, same day, two different readings, purely because of the divisor.',
    },
    source: {
      url: 'https://www.bollingerbands.com/bollinger-bands',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q104',
    formulaId: 'dai-bollinger-duoi',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Trong xu hướng tăng mạnh, giá gần như không chạm dải dưới. Ý nghĩa?' },
    choices: {
      a: { vi: 'Chỉ báo bị lỗi' },
      b: {
        vi: 'Bình thường — giá đi bộ dọc dải trên, và “thấp tương đối” không có nghĩa là nên mua',
      },
      c: { vi: 'Phải đổi chu kỳ sang 50' },
      d: { vi: 'Sắp có điều chỉnh' },
    },
    answer: 'b',
    explain: {
      vi: 'Nghĩa là xu hướng đang mạnh, không phải là mất cơ hội mua: trong một nhịp tăng, giá thường xuyên không chạm dải dưới suốt cả nhịp, và bản thân việc giá ở vùng thấp hay cao của dải cũng không phải tín hiệu mua bán. StockCharts: “Relatively low should not be considered bullish or a buy signal. Prices are high or low for a reason”, và “It is also common for prices to never reach the lower band during an uptrend”.',
      en: 'It means the trend is strong, not that a buying chance was missed: through an advance, price commonly never touches the lower band, and sitting low or high inside the bands is not in itself a trading signal. StockCharts: “Relatively low should not be considered bullish or a buy signal. Prices are high or low for a reason”, and “It is also common for prices to never reach the lower band during an uptrend”.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/bollinger-bands',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q296',
    formulaId: 'dai-bollinger-duoi',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một cổ phiếu đang trong xu hướng giảm mạnh: giá đóng cửa dưới dải Bollinger dưới liên tiếp ít nhất 5 phiên trong vài tháng (như trường hợp cổ phiếu Monsanto mà StockCharts dẫn ra). Nên hiểu hiện tượng lặp lại này thế nào?',
      en: 'A stock is in a strong downtrend and closes below the lower Bollinger band at least five times over a few months (the Monsanto example StockCharts cites). How should this repeated pattern be read?',
    },
    choices: {
      a: {
        vi: 'Là tín hiệu quá bán đáng tin cậy, nên mua ngay ở lần chạm dải dưới tiếp theo',
        en: 'A reliable oversold signal, so buy as soon as price next touches the lower band',
      },
      b: {
        vi: 'Bình thường trong xu hướng giảm mạnh — giá "đi bộ" dọc dải dưới, mỗi lần đóng cửa dưới dải không tự nó là tín hiệu đảo chiều tăng',
        en: 'Normal during a strong downtrend — price "walks" the lower band, and each close below it is not itself a bullish reversal signal',
      },
      c: {
        vi: 'Dải Bollinger tính sai, cần rút ngắn chu kỳ xuống dưới 20 phiên',
        en: 'The bands are miscalculated; the period should be shortened below 20 sessions',
      },
      d: {
        vi: 'Chắc chắn sắp có một đợt hồi phục mạnh ngay phiên kế tiếp',
        en: 'A strong rebound is certain on the very next session',
      },
    },
    answer: 'b',
    explain: {
      vi: 'StockCharts dẫn ví dụ Monsanto (MON): “Chart 7 shows Monsanto (MON) with a walk down the lower band. The stock broke down in January with a support break and closed below the lower band. From mid-January until early May, Monsanto closed below the lower band at least five times.” Cùng bài viết này cũng nói rõ ở chỗ khác: "relatively low" should not be considered bullish or a buy signal — giá thấp so với dải chỉ phản ánh một xu hướng giảm đang mạnh, không nói gì về việc đáy đã hình thành. Đây là chỗ nhiều người quen đọc dải Bollinger như chỉ báo quá mua/quá bán kiểu RSI hay nhầm nhất: thấy giá "rớt khỏi biên" là vội bắt đáy, trong khi dải Bollinger chỉ đo độ phân tán giá, không phân biệt được một nhịp điều chỉnh với một xu hướng giảm còn tiếp diễn.',
      en: 'StockCharts cites the Monsanto (MON) example: “Chart 7 shows Monsanto (MON) with a walk down the lower band. The stock broke down in January with a support break and closed below the lower band. From mid-January until early May, Monsanto closed below the lower band at least five times.” The same article states elsewhere: "relatively low" should not be considered bullish or a buy signal — a price sitting below the band only reflects a strong downtrend, not that a bottom has formed. This is where people often misread Bollinger Bands as an overbought/oversold oscillator like RSI: seeing price "fall outside the edge" and rushing to buy the dip, when the bands only measure price dispersion and cannot tell a pullback from a downtrend that is still running.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/bollinger-bands',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q297',
    formulaId: 'dai-bollinger-duoi',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Với hệ số mặc định k = 2, nếu giả định giá biến động theo phân phối chuẩn thì khoảng ± 2 độ lệch chuẩn phải chứa khoảng 95% dữ liệu. Nhưng theo chính John Bollinger, dải Bollinger mặc định thực tế chứa khoảng bao nhiêu phần trăm hành vi giá?',
      en: 'With the default multiplier k = 2, if price moves followed a normal distribution, ±2 standard deviations would contain about 95% of the data. But according to John Bollinger himself, what share of price action does the default band actually contain?',
    },
    choices: {
      a: {
        vi: 'Khoảng 95%, đúng như phân phối chuẩn dự đoán',
        en: 'About 95%, matching what a normal distribution predicts',
      },
      b: {
        vi: 'Khoảng 88–89%, thấp hơn mức phân phối chuẩn dự đoán',
        en: 'About 88-89%, lower than what a normal distribution predicts',
      },
      c: {
        vi: 'Khoảng 99%, cao hơn mức phân phối chuẩn dự đoán',
        en: 'About 99%, higher than what a normal distribution predicts',
      },
      d: {
        vi: 'Không cố định, vì Bollinger chưa bao giờ đưa ra con số cụ thể',
        en: 'No fixed figure — Bollinger never gave a specific number',
      },
    },
    answer: 'b',
    explain: {
      vi: 'StockCharts ghi rõ: “According to Bollinger, the bands should contain 88-89% of price action, which makes a move outside the bands significant.” Con số này THẤP hơn mức ~95% mà phân phối chuẩn dự đoán cho khoảng ± 2 độ lệch chuẩn — chỗ hay bị hiểu lầm là đem thẳng quy tắc thống kê "2 sigma ≈ 95%" áp vào giá cổ phiếu, trong khi lợi suất giá thực tế có đuôi phân phối dày hơn phân phối chuẩn, nên tỷ lệ nằm trong dải thấp hơn con số lý thuyết. Chính vì tỷ lệ chỉ 88–89%, không phải 95% hay cao hơn, mà một cú phá dải mới được Bollinger xem là đáng chú ý.',
      en: 'StockCharts states it plainly: “According to Bollinger, the bands should contain 88-89% of price action, which makes a move outside the bands significant.” That figure is lower than the ~95% a normal distribution would predict for ±2 standard deviations — the common slip is carrying the textbook "2 sigma is about 95%" rule straight over to stock prices, when actual returns have fatter tails than a normal distribution, so less of the data falls inside the bands than theory would suggest. It is precisely because the share is only 88-89%, not 95% or higher, that Bollinger treats a move outside the bands as significant.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/bollinger-bands',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q298',
    formulaId: 'dai-bollinger-duoi',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Trong mẫu hình đáy đôi kiểu W-Bottom mà Bollinger dùng dải Bollinger để nhận diện: đáy thứ nhất thường phá xuống dưới dải dưới, còn đáy thứ hai — dù là một đáy giá mới thấp hơn — lại giữ được ở TRÊN dải dưới. Việc đáy sau không phá dải dưới nói lên điều gì?',
      en: 'In the W-Bottom pattern that Bollinger uses the bands to identify: the first low usually breaks below the lower band, while the second low — even though it is a new, lower price low — holds ABOVE the lower band. What does the second low not breaking the band tell you?',
    },
    choices: {
      a: {
        vi: 'Mẫu hình bị vô hiệu, vì đáy sau phải phá dải sâu hơn đáy trước mới được xem là xác nhận',
        en: 'The pattern is invalidated, since the second low must break the band more deeply than the first to count as confirmation',
      },
      b: {
        vi: 'Đà giảm ở đáy sau đã yếu hơn đáy trước, nên đây là tín hiệu có lợi cho khả năng đảo chiều tăng',
        en: 'Downside momentum has weakened compared with the first low, which favors a bullish reversal',
      },
      c: {
        vi: 'Không có ý nghĩa gì — dải Bollinger tự dịch chuyển theo giá nên phép so sánh này vô nghĩa',
        en: 'It means nothing — the bands move with price, so this comparison is meaningless',
      },
      d: {
        vi: 'Đáy thứ hai bắt buộc phải chạm đúng dải dưới thì W-Bottom mới hợp lệ',
        en: 'The second low must touch the lower band exactly for the W-Bottom to be valid',
      },
    },
    answer: 'b',
    explain: {
      vi: 'StockCharts mô tả bốn bước của W-Bottom, bước ba là: “there is a new price low in the security. This low holds above the lower band.” Rồi trang giải thích thẳng ý nghĩa: “The ability to hold above the lower band on the test shows less weakness on the last decline.” Trực giác thông thường dễ nghĩ ngược lại — đáy sau phải phá dải sâu hơn mới là "xác nhận mạnh hơn" — nhưng đọc theo dải Bollinger thì ngược lại: giữ được trên dải ở lần test thứ hai mới là dấu hiệu đà bán đã cạn.',
      en: 'StockCharts describes the W-Bottom in four steps, the third being: “there is a new price low in the security. This low holds above the lower band.” The page then states the reading directly: “The ability to hold above the lower band on the test shows less weakness on the last decline.” The intuitive guess runs the other way — that the second low should break the band even more deeply to count as "stronger confirmation" — but reading it through the bands works in reverse: holding above the band on the second test is what shows selling pressure has faded.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/bollinger-bands',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q105',
    formulaId: 'do-rong-dai-bollinger',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Dải Bollinger thắt lại (squeeze). Thông tin nào bạn KHÔNG có được?' },
    choices: {
      a: { vi: 'Biến động đang co lại' },
      b: { vi: 'Hướng của cú phá vỡ sắp tới' },
      c: { vi: 'Độ rộng dải đang ở mức thấp' },
      d: { vi: 'Có thể sắp có biến động mạnh' },
    },
    answer: 'b',
    explain: {
      vi: 'Bạn KHÔNG có được hướng đi sắp tới. Dải thắt lại chỉ nói biến động đang co lại, còn nổ ra theo chiều nào thì nó không nói. StockCharts: “Narrowing bands do not provide any directional clues. They simply infer that volatility is contracting”. John Bollinger còn mô tả cú “head fake”, phá giả một chiều rồi đảo hẳn sang chiều kia: “Unconfirmed band breaks are subject to failure”.',
      en: 'What you do NOT get is direction. A squeeze only says volatility is contracting; which way it breaks is not in the signal. StockCharts: “Narrowing bands do not provide any directional clues. They simply infer that volatility is contracting”. John Bollinger also describes the “head fake”, a false break one way before the real move the other: “Unconfirmed band breaks are subject to failure”.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models/trading-strategies/bollinger-band-squeeze',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q106',
    formulaId: 'do-rong-dai-bollinger',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Mã A có BandWidth 4%, mã B có 12%. So sánh trực tiếp được không?' },
    choices: {
      a: { vi: 'Được, A yên tĩnh hơn' },
      b: {
        vi: 'Không nên — mã vốn ít biến động luôn có BandWidth thấp, phải chuẩn hoá theo hồ sơ riêng',
      },
      c: { vi: 'Được nếu cùng ngành' },
      d: { vi: 'Được nếu cùng chu kỳ 20' },
    },
    answer: 'b',
    explain: {
      vi: 'Không so trực tiếp được: BandWidth là độ rộng dải tính theo biến động của chính mã đó, nên một mã ít biến động luôn có BandWidth thấp hơn mà không hề nghĩa là đang bị nén mạnh hơn. Phải so BandWidth của một mã với chính lịch sử của nó. Tài liệu nêu rõ: “securities with lower volatility inherently have lower BandWidth values, making direct comparisons problematic”.',
      en: 'Not directly: BandWidth measures band width against the security own volatility, so a calm stock always shows a lower BandWidth without being any more compressed. The comparison has to be against that same stock history. The material states it: “securities with lower volatility inherently have lower BandWidth values, making direct comparisons problematic”.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/bollinger-bandwidth',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q230',
    formulaId: 'do-rong-dai-bollinger',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'BandWidth vừa xuống đáy 6 tháng, giá đang đi ngang chờ phá vỡ. Theo StockCharts, những công cụ nào giúp đoán trước hoặc xác nhận HƯỚNG của cú phá vỡ? Chọn tất cả ý đúng.',
      en: 'BandWidth has just hit a 6-month low and price is moving sideways ahead of a breakout. According to StockCharts, which tools help anticipate or confirm the DIRECTION of the break? Select all that apply.',
    },
    choices: {
      a: {
        vi: 'Chỉ báo dựa trên khối lượng: OBV, Chaikin Money Flow, MFI, đường Tích luỹ/Phân phối',
        en: 'Volume-based indicators: OBV, Chaikin Money Flow, MFI, the Accumulation/Distribution Line',
      },
      b: {
        vi: 'Phá kháng cự hay thủng hỗ trợ trên đồ thị giá',
        en: 'A break above resistance or below support on the price chart',
      },
      c: {
        vi: 'Dao động động lượng như RSI, Stochastic và các đường trung bình động',
        en: 'Momentum oscillators such as RSI and Stochastic, and moving averages',
      },
      d: {
        vi: 'Chính mức độ bóp của dải: bóp càng chặt thì xác suất phá lên càng cao',
        en: 'The tightness of the squeeze itself: the tighter the bands, the likelier an upside break',
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: 'Trong vùng đi ngang, giá phẳng thì động lượng và trung bình động cũng phẳng theo, nên StockCharts loại chúng ra và chỉ sang nhóm khối lượng: “Momentum oscillators and moving averages are of little value during a consolidation because these indicators simply flatten along with price action. Instead, chartists should consider using volume-based indicators, such as the Accumulation Distribution Line, Chaikin Money Flow, the Money Flow Index (MFI) or On Balance Volume (OBV).” Còn để xác nhận cú phá, trang dùng chính đồ thị giá: “a break above resistance can be used to confirm a break above the upper band. Similarly, a break below support can be used to confirm a break below the lower band.” Bản thân dải bóp không nói hướng nào: “Because the Bollinger Band Squeeze does not provide any directional clues, chartists must use other aspects of technical analysis to anticipate or confirm a directional break.”',
      en: 'During a consolidation price is flat, so momentum and moving averages flatten with it; StockCharts rules them out and points to volume instead: “Momentum oscillators and moving averages are of little value during a consolidation because these indicators simply flatten along with price action. Instead, chartists should consider using volume-based indicators, such as the Accumulation Distribution Line, Chaikin Money Flow, the Money Flow Index (MFI) or On Balance Volume (OBV).” To confirm the break, the page uses the price chart itself: “a break above resistance can be used to confirm a break above the upper band. Similarly, a break below support can be used to confirm a break below the lower band.” The squeeze itself says nothing about direction: “Because the Bollinger Band Squeeze does not provide any directional clues, chartists must use other aspects of technical analysis to anticipate or confirm a directional break.”',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models/trading-strategies/bollinger-band-squeeze',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q231',
    formulaId: 'do-rong-dai-bollinger',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một cổ phiếu có đường giữa (SMA 20 phiên) 26.000 ₫, độ lệch chuẩn 20 phiên 800 ₫, hệ số nhân k = 2. Công thức độ rộng dải Bollinger (BandWidth) theo quy ước StockCharts đã dựng sẵn dưới đây, nhưng còn trống chỗ độ lệch chuẩn ở cả dải trên lẫn dải dưới. Điền đúng số liệu vào từng ô.',
      en: 'A stock has a 20-session SMA (middle line) of 26,000 VND, a 20-session standard deviation of 800 VND and a multiplier k = 2. The Bollinger BandWidth formula follows the StockCharts convention and is laid out below, with the standard deviation missing from both the upper and the lower band. Put the right figure in each slot.',
    },
    facts: [
      {
        label: { vi: 'Đường giữa (SMA 20 phiên)', en: 'Middle line (20-session SMA)' },
        value: { vi: '26.000 ₫', en: '26,000 VND' },
      },
      {
        label: { vi: 'Độ lệch chuẩn 20 phiên', en: '20-session standard deviation' },
        value: { vi: '800 ₫', en: '800 VND' },
      },
      { label: { vi: 'Hệ số nhân k', en: 'Multiplier k' }, value: { vi: '2', en: '2' } },
    ],
    expected: 12.31,
    tolerance: { kind: 'tuyet-doi', value: 0.1 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'BandWidth = ((26.000 + 2 × [800]) − (26.000 − 2 × [800])) ÷ 26.000 × 100',
      en: 'BandWidth = ((26000 + 2 × [800]) − (26000 − 2 × [800])) ÷ 26000 × 100',
    },
    explain: {
      vi: 'Dải trên = 26.000 + 2 × 800 = 27.600 ₫; dải dưới = 26.000 − 1.600 = 24.400 ₫; hiệu số 3.200 ₫. StockCharts quy ước chia hiệu số ấy cho đường giữa rồi nhân 100: “When calculating BandWidth, the first step is to subtract the value of the lower band from the value of the upper band. This shows the absolute difference. This difference is then divided by the middle band, which normalizes the value.” Công thức trang ghi là “( (Upper Band - Lower Band) / Middle Band) * 100”, nên BandWidth = 3.200 ÷ 26.000 × 100 ≈ 12,31 %. Ba chỗ hay sai: dừng ở 3.200 ₫ (mới là hiệu số tuyệt đối, không so được giữa các mã), quên nhân 100 (ra 0,123), hoặc chia cho dải dưới thay vì đường giữa (ra 13,1 %).',
      en: 'Upper band = 26,000 + 2 × 800 = 27,600 VND; lower band = 26,000 − 1,600 = 24,400 VND; the gap is 3,200 VND. StockCharts divides that gap by the middle band and multiplies by 100: “When calculating BandWidth, the first step is to subtract the value of the lower band from the value of the upper band. This shows the absolute difference. This difference is then divided by the middle band, which normalizes the value.” The page writes the formula as “( (Upper Band - Lower Band) / Middle Band) * 100”, so BandWidth = 3,200 ÷ 26,000 × 100 ≈ 12.31%. Three common slips: stopping at 3,200 VND (the absolute gap, not comparable across stocks), forgetting the × 100 (0.123), or dividing by the lower band instead of the middle line (13.1%).',
    },
    giai: {
      tinh: { vi: 'Độ rộng dải Bollinger', en: 'Bollinger bandwidth' },
      thaySo: {
        vi: '((26.000 + 2 × 800) − (26.000 − 2 × 800)) ÷ 26.000 × 100',
        en: '((26000 + 2 × 800) − (26000 − 2 × 800)) ÷ 26000 × 100',
      },
      ketQua: { vi: '12,31 %', en: '12.31 %' },
      gan: [
        {
          kyHieu: 'BB_{tren}',
          moTa: {
            vi: 'bằng đường giữa 26.000 cộng 2 lần độ lệch chuẩn 800 ₫',
            en: 'is the 26000 middle band plus 2 times the 800 ₫ standard deviation',
          },
        },
        {
          kyHieu: 'BB_{duoi}',
          moTa: {
            vi: 'bằng đường giữa 26.000 trừ 2 lần độ lệch chuẩn 800 ₫',
            en: 'is the 26000 middle band minus 2 times the 800 ₫ standard deviation',
          },
        },
        {
          kyHieu: 'SMA_{n}',
          moTa: {
            vi: 'là đường giữa, trung bình 20 phiên: 26.000 ₫',
            en: 'is the middle band, the 20-session average: 26000 ₫',
          },
        },
      ],
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/bollinger-bandwidth',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q232',
    formulaId: 'do-rong-dai-bollinger',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Bộ lọc báo một mã có BandWidth 5 %. Theo định nghĩa trên trang của John Bollinger, như thế đã đủ gọi là Squeeze (thắt nút) chưa?',
      en: "A screener flags a stock with a BandWidth of 5%. By the definition on John Bollinger's own site, is that enough to call it a Squeeze?",
    },
    choices: {
      a: {
        vi: 'Đủ, vì BandWidth dưới 10 % đã là dải hẹp',
        en: 'Yes, any BandWidth under 10% is a tight band',
      },
      b: {
        vi: 'Chưa chắc: Squeeze là khi BandWidth xuống thấp nhất trong 6 tháng của chính mã đó, 5 % mới chỉ là dải đang hẹp',
        en: "Not necessarily: a Squeeze is when BandWidth is at its lowest in that stock's own last 6 months; 5% only says the bands are tight",
      },
      c: {
        vi: 'Đủ, miễn là dùng đúng tham số mặc định (20, 2)',
        en: 'Yes, as long as the default (20, 2) parameters are used',
      },
      d: { vi: 'Không, Squeeze phải dưới 2 %', en: 'No, a Squeeze needs BandWidth under 2%' },
    },
    answer: 'b',
    explain: {
      vi: "Trang sàng lọc của John Bollinger định nghĩa Squeeze theo lịch sử của chính mã đó, không theo một con số tuyệt đối: “Squeeze means a stock's BandWidth is at its narrowest (lowest %) in 6 months.” Và nói thẳng về những con số như 5 %: “BandWidth of 5% and 10% are examples of tightened BandWidth, but do not necessarily constitute a Squeeze.” Muốn biết 5 % có phải Squeeze không, phải kéo lịch sử BandWidth 6 tháng của mã đó ra xem nó có đang ở đáy hay không; không có ngưỡng 10 % hay 2 % nào thay được việc đó.",
      en: "John Bollinger's screening page defines a Squeeze against the stock's own history, not against an absolute number: “Squeeze means a stock's BandWidth is at its narrowest (lowest %) in 6 months.” And it says outright about numbers like 5%: “BandWidth of 5% and 10% are examples of tightened BandWidth, but do not necessarily constitute a Squeeze.” To know whether 5% is a Squeeze you have to pull up that stock's BandWidth over the last 6 months and see whether it sits at the bottom; no 10% or 2% threshold replaces that check.",
    },
    source: {
      url: 'https://bollingerbands.us/help-screening.php',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q107',
    formulaId: 'phan-tram-b-bollinger',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: '%B vượt 1 nhiều lần trên biểu đồ Apple. Các tín hiệu “quá mua” đó ra sao?' },
    choices: {
      a: { vi: 'Đều chính xác' },
      b: { vi: 'Đều thất bại — nên chỉ tìm quá mua khi xu hướng trung hạn đang giảm' },
      c: { vi: 'Chỉ đúng nửa số lần' },
      d: { vi: 'Không kiểm chứng được' },
    },
    answer: 'b',
    explain: {
      vi: 'Chúng là tín hiệu bán hỏng: %B vượt 1 nhiều lần trên đồ thị Apple mà giá vẫn đi tiếp, nên đọc riêng ngưỡng quá mua là bán sớm. Phải xác định xu hướng lớn trước rồi mới đọc quá mua hay quá bán trong khuôn xu hướng ấy. StockCharts: “%B moved above 1 several times, but these overbought readings still failed to produce good sell signals”, và khuyên “identify the bigger trend before looking for overbought or oversold readings”.',
      en: 'They were failed sell signals: %B rose above 1 several times on the Apple chart while price carried on, so reading the overbought threshold on its own means selling early. Establish the larger trend first, then read overbought or oversold inside it. StockCharts: “%B moved above 1 several times, but these overbought readings still failed to produce good sell signals”, advising to “identify the bigger trend before looking for overbought or oversold readings”.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/b-indicator',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q302',
    formulaId: 'phan-tram-b-bollinger',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Trên ETF QQQQ, trong một xu hướng tăng bắt đầu từ tháng 3/2009, %B tụt xuống dưới 0 tới ba lần. Nên đọc những lần %B âm đó thế nào?',
      en: 'On the QQQQ ETF, during an uptrend that began in March 2009, %B dropped below zero three separate times. How should those negative %B readings be read?',
    },
    choices: {
      a: {
        vi: 'Xu hướng tăng đã kết thúc, nên thoát toàn bộ vị thế',
        en: 'The uptrend is over, so the whole position should be closed',
      },
      b: {
        vi: 'Đó là những điểm mua tốt để tham gia lại xu hướng tăng lớn hơn, vì xu hướng chính vẫn đang đi lên',
        en: 'They were good entry points to rejoin the larger uptrend, since the main trend was still rising',
      },
      c: {
        vi: '%B không thể ra số âm, đây chắc chắn là lỗi tính toán',
        en: '%B cannot go negative, so this must be a calculation error',
      },
      d: {
        vi: 'Không có ý nghĩa gì, vì %B chỉ đáng tin khi dương',
        en: 'They mean nothing, since %B is only reliable when positive',
      },
    },
    answer: 'b',
    explain: {
      vi: '%B hoàn toàn có thể ra số âm khi giá thủng dải dưới — không phải lỗi. StockCharts thuật lại đúng ca này: “Chart 2 shows the Nasdaq 100 ETF (QQQQ) within an uptrend that began in March 2009. %B moved below zero three times during this uptrend. The oversold readings in early July and early November provided good entry points to partake in the bigger uptrend (green arrows).” Tức là %B âm trong một xu hướng tăng không báo hiệu xu hướng đã hết, mà là nhịp điều chỉnh ngắn để mua thêm theo xu hướng chính — ngược hẳn với việc %B trên 1 trong cùng xu hướng đó lại không phải tín hiệu bán đáng tin.',
      en: '%B can genuinely go negative when price breaks below the lower band — that is not an error. StockCharts describes exactly this case: “Chart 2 shows the Nasdaq 100 ETF (QQQQ) within an uptrend that began in March 2009. %B moved below zero three times during this uptrend. The oversold readings in early July and early November provided good entry points to partake in the bigger uptrend (green arrows).” In other words, a negative %B inside an uptrend does not signal that the trend is over; it is a short pullback that offers a buying opportunity in line with the main trend — the mirror image of %B above 1 in that same trend NOT being a reliable sell signal.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/b-indicator',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q303',
    formulaId: 'phan-tram-b-bollinger',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một cổ phiếu đang đóng cửa ở 27.200 ₫. Với chu kỳ và hệ số nhân đang dùng, dải trên Bollinger là 27.600 ₫ và dải dưới là 24.400 ₫. Công thức %B theo quy ước Fidelity (thang phần trăm 0 đến 100) đã dựng sẵn — điền giá đóng cửa và hai dải vào đúng ô trống, chú ý dải dưới xuất hiện hai lần.',
      en: "A stock closes at 27,200 VND. With the period and multiplier in use, the Bollinger upper band is 27,600 VND and the lower band is 24,400 VND. The %B formula follows Fidelity's convention (a 0-to-100 percent scale) and is laid out below — put the close and the two bands into the right slots, noting the lower band appears twice.",
    },
    facts: [
      {
        label: { vi: 'Giá đóng cửa', en: 'Closing price' },
        value: { vi: '27.200 ₫', en: '27,200 VND' },
      },
      {
        label: { vi: 'Dải trên Bollinger', en: 'Upper Bollinger band' },
        value: { vi: '27.600 ₫', en: '27,600 VND' },
      },
      {
        label: { vi: 'Dải dưới Bollinger', en: 'Lower Bollinger band' },
        value: { vi: '24.400 ₫', en: '24,400 VND' },
      },
    ],
    expected: 87.5,
    tolerance: { kind: 'tuyet-doi', value: 0.1 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: '%B = ([27.200] − [24.400]) ÷ ([27.600] − [24.400]) × 100',
      en: '%B = ([27200] − [24400]) ÷ ([27600] − [24400]) × 100',
    },
    explain: {
      vi: 'Fidelity định nghĩa %B theo thang phần trăm chứ không phải số thập phân 0–1: “If the closing price is equal to the upper Bollinger Band value, Percent B would be 100 (percent).” Và ở đầu kia của dải: “If the closing price is equal to the lower Bollinger Band, Percent B would be zero.” Nghĩa là 0 ứng đúng dải dưới, 100 ứng đúng dải trên — đúng thang mà công cụ này đang hiển thị. Với số liệu trên: %B = (27.200 − 24.400) ÷ (27.600 − 24.400) × 100 = 2.800 ÷ 3.200 × 100 = 87,5%. Sai hay gặp: quên nhân 100 nên gõ 0,875 thay vì 87,5, hoặc lấy nhầm tử số thành (Dải trên − Giá) rồi ra 12,5%.',
      en: 'Fidelity defines %B on a percent scale, not a 0-to-1 decimal: “If the closing price is equal to the upper Bollinger Band value, Percent B would be 100 (percent).” And at the other end: “If the closing price is equal to the lower Bollinger Band, Percent B would be zero.” So 0 marks the lower band exactly and 100 marks the upper band exactly — the same scale this tool displays. With the figures above: %B = (27,200 − 24,400) ÷ (27,600 − 24,400) × 100 = 2,800 ÷ 3,200 × 100 = 87.5%. Common slips: forgetting the × 100 and entering 0.875 instead of 87.5, or swapping the numerator to (Upper band − Price), which gives 12.5%.',
    },
    giai: {
      tinh: { vi: 'vị trí giá trong dải Bollinger', en: 'Bollinger %B' },
      thaySo: {
        vi: '(27.200 − 24.400) ÷ (27.600 − 24.400) × 100',
        en: '(27200 − 24400) ÷ (27600 − 24400) × 100',
      },
      ketQua: { vi: '87,5 %', en: '87.5 %' },
      gan: [
        { kyHieu: 'C', giaTri: { vi: '27.200', en: '27200' } },
        {
          kyHieu: 'BB_{duoi}',
          moTa: {
            vi: 'là dải dưới Bollinger: 24.400 ₫',
            en: 'is the lower Bollinger band: 24400 ₫',
          },
        },
        {
          kyHieu: 'BB_{tren}',
          moTa: {
            vi: 'là dải trên Bollinger: 27.600 ₫',
            en: 'is the upper Bollinger band: 27600 ₫',
          },
        },
      ],
    },
    source: {
      url: 'https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/percent-b',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q108',
    formulaId: 'macd-duong-chinh',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'MACD lên mức cao nhất 2 năm. Đây có phải tín hiệu quá mua không?' },
    choices: {
      a: { vi: 'Phải' },
      b: { vi: 'Không — MACD không có biên trên/dưới nên không xác định quá mua/quá bán' },
      c: { vi: 'Phải nếu kèm RSI trên 70' },
      d: { vi: 'Chỉ đúng với cổ phiếu vốn hoá lớn' },
    },
    answer: 'b',
    explain: {
      vi: 'Không. MACD là hiệu của hai đường trung bình nên không có trần và không có sàn: trong một nhịp chạy mạnh nó có thể vượt xa mọi mức cực trị trong lịch sử của chính nó mà vẫn đi tiếp. Giá trị MACD lại tính bằng đơn vị giá nên cũng không so được giữa hai mã khác thị giá. StockCharts: “the MACD does not have any upper or lower limits to bind its movement. During sharp moves, the MACD can continue to over-extend beyond its historical extremes”.',
      en: 'No. MACD is the difference between two moving averages, so it has neither a ceiling nor a floor: in a sharp run it can push past every historical extreme of its own and keep going. Its value is also denominated in price units, so it cannot be compared across stocks at different price levels. StockCharts: “the MACD does not have any upper or lower limits to bind its movement. During sharp moves, the MACD can continue to over-extend beyond its historical extremes”.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/macd-moving-average-convergence-divergence-oscillator',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q109',
    formulaId: 'macd-duong-tin-hieu',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'MACD cắt xuống đường tín hiệu ở vùng cực trị dương. Nên hiểu thế nào?' },
    choices: {
      a: { vi: 'Tín hiệu bán đáng tin' },
      b: {
        vi: 'Thận trọng — ở vùng cực trị, động lượng chậm lại một cách cơ học sẽ tự sinh giao cắt',
      },
      c: { vi: 'Tín hiệu mua ngược' },
      d: { vi: 'Bỏ qua hoàn toàn' },
    },
    answer: 'b',
    explain: {
      vi: 'Nên đọc thận trọng: ở vùng cực trị, động lượng chậm lại là chuyện gần như chắc chắn xảy ra, nên giao cắt đường tín hiệu ở đó thường chỉ phản ánh việc đà tăng bớt gấp chứ chưa nói giá sẽ đảo chiều. StockCharts: “Signal line crossovers at positive or negative extremes should be viewed with caution... momentum is likely to slow and this will usually produce a signal line crossover at the extremities”. Giao cắt đường 0 trong thị trường không xu hướng còn gây whipsaw hàng loạt.',
      en: 'Read it cautiously: at an extreme, momentum slowing is close to inevitable, so a signal-line cross there usually just reflects the advance losing urgency rather than price about to turn. StockCharts: “Signal line crossovers at positive or negative extremes should be viewed with caution... momentum is likely to slow and this will usually produce a signal line crossover at the extremities”. Zero-line crosses in a trendless market also produce whipsaws in bulk.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/macd-moving-average-convergence-divergence-oscillator',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q287',
    formulaId: 'macd-duong-tin-hieu',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Trên biểu đồ MACD (12,26,9) của IBM, StockCharts ghi nhận đường tín hiệu và đường MACD cắt nhau 8 lần trong 6 tháng (4 lần lên, 4 lần xuống). Nên hiểu tần suất này thế nào?',
      en: "On IBM's 12,26,9 MACD chart, StockCharts recorded eight signal line crossovers in six months (four up, four down). How should this frequency be read?",
    },
    choices: {
      a: {
        vi: 'Cắt nhau càng nhiều thì xu hướng giá càng chắc chắn',
        en: 'The more crossovers, the more certain the price trend',
      },
      b: {
        vi: 'Tần suất dày cho thấy một lần cắt đơn lẻ không đảm bảo đúng — thực tế có cả tín hiệu tốt lẫn tín hiệu xấu trong 8 lần đó',
        en: 'Such a high frequency shows a single crossover is no guarantee — the eight crossovers included both good and bad signals',
      },
      c: {
        vi: 'Đây là bằng chứng bộ tham số 12,26,9 tính sai cho IBM',
        en: 'It proves the 12,26,9 parameter set is miscalculated for IBM',
      },
      d: {
        vi: 'Chỉ nên tin những lần cắt xảy ra vào đầu tháng',
        en: 'Only crossovers happening at the start of a month should be trusted',
      },
    },
    answer: 'b',
    explain: {
      vi: 'StockCharts nêu ví dụ IBM: “There were eight signal line crossovers in six months: four up and four down. There were some good signals and some bad signals.” Một lần cắt riêng lẻ không đủ để khẳng định đúng hay sai, phải đọc kèm bối cảnh xu hướng nền.',
      en: 'StockCharts notes on IBM: “There were eight signal line crossovers in six months: four up and four down. There were some good signals and some bad signals.” A single crossover by itself cannot be called right or wrong — it has to be read alongside the broader trend.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/macd-moving-average-convergence-divergence-oscillator',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q288',
    formulaId: 'macd-duong-tin-hieu',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Thomas Aspray tạo thêm cột histogram (MACD trừ đường tín hiệu) dù MACD đã có sẵn tín hiệu cắt hai đường. Ông làm vậy để khắc phục nhược điểm nào của chính đường tín hiệu?',
      en: 'Thomas Aspray added the histogram bar (MACD minus the signal line) even though MACD already had a two-line crossover signal. What weakness of the signal line itself was he trying to fix?',
    },
    choices: {
      a: {
        vi: 'Đường tín hiệu dùng sai chu kỳ EMA',
        en: 'The signal line used the wrong EMA period',
      },
      b: {
        vi: 'Tín hiệu cắt hai đường vốn bị trễ vì dựa trên trung bình động, nên cần một cách để đoán trước lúc nó sắp xảy ra',
        en: 'The two-line crossover is inherently late because it is built from moving averages, so a way to anticipate it in advance was needed',
      },
      c: {
        vi: 'Đường tín hiệu không thể vẽ chung biểu đồ với MACD',
        en: 'The signal line could not be plotted on the same chart as MACD',
      },
      d: {
        vi: 'Đường tín hiệu chỉ đúng với chỉ số, không đúng với cổ phiếu lẻ',
        en: 'The signal line is only valid for indices, not individual stocks',
      },
    },
    answer: 'b',
    explain: {
      vi: 'StockCharts: “Thomas Aspray developed the MACD-Histogram to anticipate signal line crossovers in MACD.” Lý do nêu thêm trên cùng trang: “Because MACD uses moving averages and moving averages lag price, signal line crossovers can come late and affect the reward-to-risk ratio of a trade.” Cột histogram tiến sát 0 (thường trong khoảng -0,20 đến +0,20 với bộ 12,26,9) là dấu hiệu giao cắt sắp xảy ra, trước khi nó thật sự xảy ra.',
      en: 'StockCharts: “Thomas Aspray developed the MACD-Histogram to anticipate signal line crossovers in MACD.” The reason given on the same page: “Because MACD uses moving averages and moving averages lag price, signal line crossovers can come late and affect the reward-to-risk ratio of a trade.” A histogram bar nearing zero (typically between -.20 and +.20 for a 12,26,9 set) hints a crossover is about to happen, ahead of the actual cross.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/macd-histogram',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q289',
    formulaId: 'macd-duong-tin-hieu',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Đường tín hiệu MACD là EMA của chính chuỗi MACD, không phải trung bình cộng đơn giản của vài phiên gần nhất. Hệ số làm mượt chuẩn là K = 2/(N+1). Điền MACD hôm nay, đường tín hiệu phiên trước và chu kỳ N vào đúng ô trống — chú ý đường tín hiệu phiên trước xuất hiện hai lần.',
      en: "The MACD signal line is an EMA of the MACD series itself, not a plain average of a few recent values. The standard smoothing factor is K = 2/(N+1). Put today's MACD, yesterday's signal line and the period N into the right slots — note yesterday's signal line appears twice.",
    },
    facts: [
      {
        label: { vi: 'MACD phiên hôm nay', en: "Today's MACD" },
        value: { vi: '0,7187753 điểm', en: '0.7187753 points' },
      },
      {
        label: {
          vi: 'Đường tín hiệu phiên trước (EMA9)',
          en: 'Previous signal line (9-period EMA)',
        },
        value: { vi: '0,661607209 điểm', en: '0.661607209 points' },
      },
      {
        label: { vi: 'Chu kỳ tín hiệu N', en: 'Signal period N' },
        value: { vi: '9 phiên', en: '9 periods' },
      },
    ],
    expected: 0.673041,
    tolerance: { kind: 'tuyet-doi', value: 0.0005 },
    unit: { vi: 'điểm', en: 'points' },
    worked: {
      vi: 'Đường tín hiệu = ([0,7187753] − [0,661607209]) × 2 ÷ ([9] + 1) + [0,661607209]',
      en: 'Signal line = ([0.7187753] − [0.661607209]) × 2 ÷ ([9] + 1) + [0.661607209]',
    },
    explain: {
      vi: "Fairmont Equities nêu công thức: “EMA = (today's closing price *K) + (Previous EMA * (1 – K))”, với hệ số làm mượt “K (Smoothing Factor) = 2/(N+1)”. Thay số: 0,7187753 × 0,2 + 0,661607209 × 0,8 = 0,673041 điểm. Sai lầm hay gặp là lấy trung bình cộng đơn giản của các giá trị MACD gần nhất thay vì cập nhật đệ quy từ EMA phiên trước.",
      en: "Fairmont Equities gives the formula: “EMA = (today's closing price *K) + (Previous EMA * (1 – K))”, with the smoothing factor “K (Smoothing Factor) = 2/(N+1)”. Plugging in: 0.7187753 × 0.2 + 0.661607209 × 0.8 = 0.673041 points. A common mistake is taking a plain average of the recent MACD values instead of recursively updating from the prior EMA.",
    },
    giai: {
      tinh: { vi: 'Đường tín hiệu MACD', en: 'MACD signal line' },
      thaySo: {
        vi: '(0,7187753 − 0,661607209) × 2 ÷ (9 + 1) + 0,661607209',
        en: '(0.7187753 − 0.661607209) × 2 ÷ (9 + 1) + 0.661607209',
      },
      ketQua: { vi: '0,673 điểm', en: '0.673 points' },
      gan: [
        {
          kyHieu: 'MACD',
          moTa: {
            vi: 'của phiên hôm nay là 0,7187753 điểm',
            en: 'for today’s session is 0.7187753 points',
          },
        },
        {
          kyHieu: 'Signal',
          moTa: {
            vi: 'của phiên trước là 0,661607209 điểm',
            en: 'for the previous session is 0.661607209 points',
          },
        },
        {
          kyHieu: 'EMA_{tin hieu}',
          moTa: {
            vi: 'lấy chu kỳ 9 phiên, nên hệ số làm mượt là 2 chia cho 9 cộng 1',
            en: 'uses a 9-session period, so the smoothing factor is 2 divided by 9 plus 1',
          },
        },
      ],
    },
    source: {
      url: 'https://fairmontequities.com/how-to-calculate-the-macd/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q290',
    formulaId: 'macd-duong-tin-hieu',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Khi chuỗi MACD vừa đủ 9 phiên để bắt đầu vẽ đường tín hiệu, GIÁ TRỊ ĐẦU TIÊN của đường tín hiệu (EMA9) được tính thế nào theo quy ước phổ biến?',
      en: 'The moment the MACD series first has 9 sessions to start plotting the signal line, how is the FIRST value of that 9-period EMA computed, by common convention?',
    },
    choices: {
      a: {
        vi: 'Bằng giá trị MACD của chính phiên đó nhân với hệ số K',
        en: "That session's own MACD value multiplied by K",
      },
      b: {
        vi: 'Bằng trung bình cộng đơn giản của 9 giá trị MACD đầu tiên; từ phiên sau mới chuyển sang công thức EMA đệ quy',
        en: 'The simple average of the first 9 MACD values; only from the next session does the recursive EMA formula take over',
      },
      c: {
        vi: 'Bằng 0, vì chưa có EMA phiên trước để tính',
        en: 'Zero, since there is no prior EMA to build on yet',
      },
      d: {
        vi: 'Bằng trung bình cộng giữa MACD và đường giá đóng cửa',
        en: 'The average of MACD and the closing price',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Fairmont Equities: “The first value of the 9 Day EMA of the MACD will be the averages of the first 9 MACD values.” Từ phiên thứ 10 trở đi mới dùng công thức EMA đệ quy dựa trên EMA phiên trước. Đối chiếu với hàm lastEma trong src/core/formulas/series-utils.ts của chính sản phẩm: công thức cũng mồi bằng SMA của N phiên đầu rồi mới đệ quy — đúng quy ước này, nên số ra khớp được với các bảng giá phổ thông.',
      en: "Fairmont Equities: “The first value of the 9 Day EMA of the MACD will be the averages of the first 9 MACD values.” Only from the 10th session onward does the recursive EMA formula, built on the prior EMA, take over. This matches the product's own lastEma function in src/core/formulas/series-utils.ts, which also seeds with the SMA of the first N periods before recursing — the same convention that lets the figures line up with common price platforms.",
    },
    source: {
      url: 'https://fairmontequities.com/how-to-calculate-the-macd/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q110',
    formulaId: 'giao-cat-hai-duong-ma',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'MA50 vừa cắt lên MA200 (Golden Cross). Điểm yếu của tín hiệu này?' },
    choices: {
      a: { vi: 'Chỉ đúng với chỉ số' },
      b: { vi: 'Là chỉ báo trễ — khi tín hiệu xuất hiện thị trường có thể đã chạy 10–20% từ đáy' },
      c: { vi: 'Cần khối lượng xác nhận mới đúng' },
      d: { vi: 'Chỉ dùng được khung tuần' },
    },
    answer: 'b',
    explain: {
      vi: 'Nó là tín hiệu ĐI SAU: hai đường trung bình đều tính từ giá quá khứ, nên lúc giao cắt xuất hiện thì phần lớn nhịp hồi đã đi qua. Backtest 20 năm trên S&P 500: “The golden cross is a lagging indicator” và “by the time the signal fires, the market may have moved 10-20% off the bottom”. Môi giới trong nước (DSC) nói thêm: “việc mua ngay khi MA50 vừa cắt lên MA200 đôi khi có thể khiến bạn mua đúng nhịp điều chỉnh ngắn hạn”.',
      en: 'It is a LAGGING signal: both averages are built from past prices, so by the time the cross prints, much of the recovery has already happened. A 20-year backtest on the S&P 500: “The golden cross is a lagging indicator” and “by the time the signal fires, the market may have moved 10-20% off the bottom”. A Vietnamese broker (DSC) adds: “việc mua ngay khi MA50 vừa cắt lên MA200 đôi khi có thể khiến bạn mua đúng nhịp điều chỉnh ngắn hạn” (buying the moment MA50 crosses above MA200 can land you right in a short-term pullback).',
    },
    source: {
      url: 'https://tosindicators.com/research/golden-cross-trading-strategy-20-year-backtest-results',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q111',
    formulaId: 'giao-cat-hai-duong-ma',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Hệ thống giao cắt MA hoạt động kém nhất trong điều kiện nào?' },
    choices: {
      a: { vi: 'Xu hướng tăng mạnh' },
      b: { vi: 'Thị trường đi ngang — sinh nhiều whipsaw' },
      c: { vi: 'Xu hướng giảm mạnh' },
      d: { vi: 'Phiên có khối lượng lớn' },
    },
    answer: 'b',
    explain: {
      vi: "Kém nhất khi thị trường đi ngang trong một biên hẹp: không có xu hướng thì hai đường trung bình cắt qua cắt lại, mỗi lần cắt là một lệnh lỗ nhỏ. StockCharts: “Securities spend much time in trading ranges, which renders moving averages ineffective” và “When there's no strong trend, a moving average crossover system will produce many whipsaws”, ví dụ Home Depot phải chịu “three whipsaws before catching a good trade”.",
      en: "Worst inside a narrow sideways range: with no trend the two averages cross back and forth, and each cross is another small losing trade. StockCharts: “Securities spend much time in trading ranges, which renders moving averages ineffective” and “When there's no strong trend, a moving average crossover system will produce many whipsaws”, with Home Depot taking “three whipsaws before catching a good trade”.",
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q293',
    formulaId: 'giao-cat-hai-duong-ma',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một bài phân tích định lượng thống kê toàn bộ 49 lần Death Cross của S&P 500 trong 97 năm (1928–2025): có 36 lần (73,5%) chỉ số vẫn TĂNG điểm trong lúc tín hiệu Death Cross đang có hiệu lực. Vì sao tác giả vẫn kết luận đây không phải một tín hiệu đáng tin cậy?',
      en: 'A quantitative analysis tallied all 49 Death Cross occurrences on the S&P 500 over 97 years (1928-2025): in 36 of them (73.5%), the index still GAINED while the Death Cross was in effect. Why does the author still conclude this is not a reliable signal?',
    },
    choices: {
      a: {
        vi: 'Vì tỷ lệ 73,5% quá thấp so với chuẩn thống kê để coi là đáng tin',
        en: 'Because a 73.5% rate is too low to count as statistically reliable',
      },
      b: {
        vi: 'Vì mức sụt giảm trung bình của 49 lần lên tới 13,2%, trong đó 5 lần sụt tối thiểu 45% — thắng nhiều lần nhỏ nhưng vài lần thua rất nặng khiến tổng lỗ có thể vượt xa tổng lãi',
        en: 'Because the average drawdown across the 49 trades reached 13.2%, with five instances of at least 45% — many small wins can be wiped out by a few very large losses',
      },
      c: {
        vi: 'Vì mẫu 97 năm là quá ngắn để rút ra kết luận có ý nghĩa thống kê',
        en: 'Because a 97-year sample is too short to draw a statistically meaningful conclusion',
      },
      d: {
        vi: 'Vì thống kê này chỉ tính cho chỉ số, hoàn toàn không liên quan tới cổ phiếu riêng lẻ',
        en: 'Because the statistic only applies to the index and has no bearing on individual stocks',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Bài phân tích định lượng của Rob Hanna cho thấy tỷ lệ thắng 73,5% dễ gây hiểu lầm vì nó bỏ qua độ lớn của khoản lỗ: “The average drawdown for these 49 trades would have been 13.2%, and there were five separate instances with drawdowns of at least 45%.” Tác giả đánh giá đây không phải một tín hiệu đáng tin cậy đứng một mình: riêng lần Death Cross đầu tiên (1929–1933), danh mục ví dụ đã tăng lên 120.000 rồi rơi về khoảng 20.000, kết thúc thương vụ quanh 34.000 và chưa từng hồi phục về vốn ban đầu trong suốt 97 năm sau đó — một vài lần thua nặng như vậy đủ xoá sạch nhiều lần thắng nhỏ, nên chỉ nhìn tỷ lệ thắng/thua là chưa đủ.',
      en: "Rob Hanna's quantitative analysis shows the 73.5% win rate is misleading because it ignores how large the losses were: “The average drawdown for these 49 trades would have been 13.2%, and there were five separate instances with drawdowns of at least 45%.” He judges the pattern unreliable as a standalone signal: in just the first death cross (1929-1933), the example portfolio rose to 120,000, fell to about 20,000, ended that trade around 34,000, and never returned to breakeven over the following 97 years — a few losses that severe are enough to erase many small wins, so the win rate alone is not sufficient evidence.",
    },
    source: {
      url: 'https://proactiveadvisormagazine.com/what-weve-learned-from-97-years-of-death-crosses/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q294',
    formulaId: 'giao-cat-hai-duong-ma',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Theo khuyến nghị của một công ty chứng khoán trong nước, những cách nào giúp tín hiệu giao cắt hai đường MA (Golden Cross/Death Cross) đáng tin hơn?',
      en: "According to a domestic securities firm's recommendation, which of the following make a moving-average crossover signal (Golden Cross/Death Cross) more reliable?",
    },
    choices: {
      a: {
        vi: 'Xác nhận thêm bằng khối lượng giao dịch tại thời điểm xảy ra giao cắt',
        en: 'Confirm with trading volume at the moment the crossover happens',
      },
      b: {
        vi: 'Kết hợp thêm chỉ báo RSI hoặc MACD để kiểm tra trạng thái quá mua/quá bán trước khi ra quyết định',
        en: 'Add RSI or MACD to check for overbought/oversold conditions before deciding',
      },
      c: {
        vi: 'Không mua đuổi ngay khi vừa xuất hiện giao cắt, nên chờ giá kiểm định lại đường MA',
        en: 'Do not chase the cross the moment it appears — wait for price to retest the moving average',
      },
      d: {
        vi: 'Bỏ qua khối lượng giao dịch vì bản thân giao cắt hai đường MA đã đủ để tự xác nhận tín hiệu',
        en: 'Ignore trading volume, since the MA crossover itself is already enough confirmation',
      },
    },
    answers: ['a', 'b', 'c'],
    explain: {
      vi: 'Bài viết của DSC liệt kê các cách làm tín hiệu giao cắt MA đáng tin hơn. Về khối lượng: “Khối lượng giao dịch là yếu tố then chốt. Một điểm cắt vàng đi kèm với thanh khoản tăng đột biến cho thấy dòng tiền lớn đang tham gia mua vào. Ngược lại, điểm cắt tử thần xuất hiện cùng khối lượng bán lớn chứng tỏ áp lực thoát hàng mạnh mẽ.” Về chỉ báo động lượng, bài khuyến nghị dùng thêm RSI hoặc MACD để kiểm tra vùng quá mua/quá bán trước khi vào lệnh. Và vì đường MA có độ trễ, DSC cảnh báo mua ngay khi vừa giao cắt đôi khi khiến nhà đầu tư mua đúng nhịp điều chỉnh ngắn hạn — nên chờ retest thay vì vào lệnh ngay. Phương án d ngược hoàn toàn với các khuyến nghị này.',
      en: "DSC's article lists ways to make the crossover signal more reliable. On volume, it states: “Khối lượng giao dịch là yếu tố then chốt. Một điểm cắt vàng đi kèm với thanh khoản tăng đột biến cho thấy dòng tiền lớn đang tham gia mua vào. Ngược lại, điểm cắt tử thần xuất hiện cùng khối lượng bán lớn chứng tỏ áp lực thoát hàng mạnh mẽ.” (trading volume is the key factor — a spike in volume on a golden cross shows large capital flowing in, while heavy selling volume on a death cross shows strong distribution pressure). It also recommends adding RSI or MACD to check for overbought/oversold zones before entering, and warns that because a moving average lags, buying right when the cross appears can mean buying right into a short-term pullback — better to wait for a retest first. Option d is the exact opposite of this advice.",
    },
    source: {
      url: 'https://www.dsc.com.vn/kien-thuc/golden-cross-va-death-cross-la-gi',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q295',
    formulaId: 'giao-cat-hai-duong-ma',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một trader backtest thấy cặp MA 47 phiên / 183 phiên cho lợi nhuận cao hơn cặp kinh điển MA50/MA200, nhưng chỉ đúng trên một cổ phiếu và đúng giai đoạn đã thử. Theo khuyến nghị chọn tham số cho chiến lược giao cắt MA, nên hiểu kết quả này thế nào?',
      en: "A trader's backtest shows a 47-day / 183-day MA pair outperforming the classic 50/200 pair, but only on one stock over the one period tested. According to guidance on choosing MA crossover parameters, how should this result be interpreted?",
    },
    choices: {
      a: {
        vi: 'Nên chuyển hẳn sang dùng 47/183 vì đã có dữ liệu thực chứng minh nó vượt trội',
        en: 'Switch entirely to 47/183 since real data now proves it is superior',
      },
      b: {
        vi: 'Con số chu kỳ cụ thể ít quan trọng hơn TỶ LỆ giữa chu kỳ nhanh và chậm (khoảng 1:3 đến 1:4); một cặp chỉ thắng đúng một cổ phiếu, một giai đoạn gần như chắc chắn đã bị làm khớp quá mức (overfit) với dữ liệu quá khứ',
        en: 'The specific period numbers matter less than the RATIO between the fast and slow periods (roughly 1:3 to 1:4); a pair that only wins on one stock over one tested period is almost certainly overfitted to historical data',
      },
      c: {
        vi: 'Nên rút ngắn cả hai chu kỳ xuống còn một nửa để tín hiệu phản ứng nhanh hơn',
        en: 'Shorten both periods by half so the signal reacts faster',
      },
      d: {
        vi: 'Kết quả này chứng minh SMA luôn kém chính xác hơn EMA',
        en: 'This result proves SMA is always less accurate than EMA',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Tài liệu hướng dẫn của Quantt viết rõ: “In practice, the specific numbers matter less than the ratio between the fast and slow periods. A ratio of roughly 1:3 to 1:4 (fast to slow) tends to produce a good balance between responsiveness and noise filtering. Avoid optimising the exact periods to fit historical data - a strategy that works only with a 47-day and 183-day average is almost certainly overfitted.” Một cặp chu kỳ chỉ thắng đúng dữ liệu đã test là dấu hiệu overfitting, không phải một quy luật thị trường thật; điều đáng giữ là tỷ lệ nhanh/chậm hợp lý, không phải hai con số cụ thể — đúng như cặp 50/200 kinh điển đang tuân theo (~1:4).',
      en: 'The Quantt guide states: “In practice, the specific numbers matter less than the ratio between the fast and slow periods. A ratio of roughly 1:3 to 1:4 (fast to slow) tends to produce a good balance between responsiveness and noise filtering. Avoid optimising the exact periods to fit historical data - a strategy that works only with a 47-day and 183-day average is almost certainly overfitted.” A period pair that only wins on the exact data it was tested against is a sign of overfitting, not a real market regularity — what is worth keeping is a sensible fast/slow ratio, not the two specific numbers, which is exactly what the classic 50/200 pair already follows (~1:4).',
    },
    source: {
      url: 'https://www.quantt.co.uk/resources/moving-average-crossover-guide',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q112',
    formulaId: 'ema-n-phien',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: '“EMA tốt hơn SMA vì nhạy hơn”. Đánh giá?' },
    choices: {
      a: { vi: 'Đúng hoàn toàn' },
      b: {
        vi: 'Không cái nào tốt hơn — EMA ít trễ nhưng nhạy với nhiễu, SMA hợp hơn để xác định hỗ trợ/kháng cự',
      },
      c: { vi: 'SMA luôn tốt hơn' },
      d: { vi: 'Phụ thuộc vốn hoá cổ phiếu' },
    },
    answer: 'b',
    explain: {
      vi: 'Không có cái nào tốt hơn, chỉ có cái hợp việc hơn: EMA ít trễ hơn nên bám giá gần đây sát hơn, còn SMA là trung bình thật của cả kỳ nên hợp để xác định vùng hỗ trợ và kháng cự. StockCharts: “One is not necessarily better”; EMA “have less lag and are, therefore, more sensitive to recent prices”, còn SMA “represent a true average of prices for the entire period” và “may be better suited to identify support or resistance levels”.',
      en: 'Neither is better, they suit different jobs: an EMA lags less and so tracks recent prices more closely, while an SMA is a true average of the whole period and suits marking support and resistance. StockCharts: “One is not necessarily better”; EMAs “have less lag and are, therefore, more sensitive to recent prices”, while SMAs “represent a true average of prices for the entire period” and “may be better suited to identify support or resistance levels”.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q283',
    formulaId: 'ema-n-phien',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'EMA 10 phiên tính đúng theo ba bước StockCharts mô tả, với hệ số nhân (multiplier) = 2 ÷ (n + 1) và công thức EMA = (Giá đóng cửa − EMA phiên trước) × hệ số nhân + EMA phiên trước. Điền giá đóng cửa, EMA phiên trước và chu kỳ vào đúng ô trống — chú ý EMA phiên trước xuất hiện hai lần.',
      en: "A 10-period EMA follows StockCharts' own three-step method, with multiplier = 2 ÷ (n + 1) and EMA = (Close − Previous EMA) × multiplier + Previous EMA. Put the close, the previous EMA and the period into the right slots — note the previous EMA appears twice.",
    },
    facts: [
      {
        label: { vi: 'Chu kỳ EMA (n)', en: 'EMA period (n)' },
        value: { vi: '10 phiên', en: '10 periods' },
      },
      {
        label: { vi: 'EMA phiên trước', en: "Previous period's EMA" },
        value: { vi: '50.000 ₫', en: '50,000 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên này', en: "This period's closing price" },
        value: { vi: '60.000 ₫', en: '60,000 ₫' },
      },
    ],
    expected: 51818.18,
    tolerance: { kind: 'tuong-doi', value: 0.001 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'EMA = ([60.000] − [50.000]) × 2 ÷ ([10] + 1) + [50.000]',
      en: 'EMA = ([60000] − [50000]) × 2 ÷ ([10] + 1) + [50000]',
    },
    explain: {
      vi: 'StockCharts mô tả đúng ba bước: dùng SMA làm giá trị mồi, tính hệ số nhân, rồi áp công thức “EMA: {Close - EMA(previous day)} x multiplier + EMA(previous day)”, với hệ số nhân “(2 / (Time periods + 1) ) = (2 / (10 + 1) ) = 0.1818 (18.18%)”. Với n = 10, hệ số = 2/11 ≈ 0,1818; EMA mới = 50.000 + (60.000 − 50.000) × 2/11 ≈ 51.818,18 ₫. Sai lầm thường gặp là nhân hệ số trực tiếp vào giá đóng cửa rồi cộng thẳng nguyên EMA phiên trước, quên rằng EMA cũ cũng phải co lại theo đúng hệ số đó — làm mức tăng bị đội lên gần gấp đôi.',
      en: 'StockCharts describes three steps: seed the line with an SMA, compute the multiplier, then apply “EMA: {Close - EMA(previous day)} x multiplier + EMA(previous day)”, with the multiplier “(2 / (Time periods + 1) ) = (2 / (10 + 1) ) = 0.1818 (18.18%)”. With n = 10, the multiplier = 2/11 ≈ 0.1818; the new EMA = 50,000 + (60,000 − 50,000) × 2/11 ≈ 51,818.18 ₫. A common mistake is multiplying the multiplier straight into the closing price and adding the full previous EMA back on top, forgetting that the previous EMA must shrink by that same factor — which roughly doubles the apparent move.',
    },
    giai: {
      tinh: { vi: 'Trung bình động luỹ thừa (EMA)', en: 'Exponential moving average' },
      thaySo: {
        vi: '(60.000 − 50.000) × 2 ÷ (10 + 1) + 50.000',
        en: '(60000 − 50000) × 2 ÷ (10 + 1) + 50000',
      },
      ketQua: { vi: '51.818,18 ₫', en: '51818.18 ₫' },
      gan: [
        {
          kyHieu: 'P_t',
          moTa: {
            vi: 'là giá đóng cửa phiên này: 60.000 ₫',
            en: 'is this session’s close: 60000 ₫',
          },
        },
        {
          kyHieu: 'EMA_{t-1}',
          moTa: {
            vi: 'là EMA của phiên trước: 50.000 ₫',
            en: 'is the previous session’s EMA: 50000 ₫',
          },
        },
        { kyHieu: 'n', moTa: { vi: 'là chu kỳ 10 phiên', en: 'is the 10-session period' } },
      ],
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q284',
    formulaId: 'ema-n-phien',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'StockCharts viết rằng để một EMA chính xác 100% thì phải dùng mọi phiên giá mà cổ phiếu từng có, tính từ phiên niêm yết đầu tiên. Vậy một EMA 12 phiên chỉ tính trên đúng 12 phiên giá (không có phiên nào trước đó) thì như thế nào so với một EMA "chuẩn"?',
      en: 'StockCharts states that a 100% accurate EMA requires every price data point a stock has ever had, starting from its first trading day. So how does a 12-period EMA computed on exactly 12 sessions (with nothing before that) compare to the "true" EMA?',
    },
    choices: {
      a: {
        vi: 'Chính xác tuyệt đối, vì công thức chỉ cần đúng n phiên gần nhất',
        en: 'Perfectly accurate, since the formula only needs the most recent n sessions',
      },
      b: {
        vi: 'Chỉ là một xấp xỉ — càng ít dữ liệu mồi phía trước thì càng lệch, vì mỗi EMA quá khứ vẫn góp một phần nhỏ vào EMA hiện tại mãi mãi',
        en: "Only an approximation — the less seed history it has, the more it deviates, because every past EMA value still contributes a small, shrinking share to today's EMA forever",
      },
      c: {
        vi: 'Sai hoàn toàn, không thể tính được nếu chưa đủ đúng 3×12 = 36 phiên',
        en: 'Completely wrong — it cannot even be computed until exactly 3×12 = 36 sessions are available',
      },
      d: {
        vi: 'Không liên quan gì đến số phiên, chỉ phụ thuộc việc tính theo ngày hay theo tuần',
        en: 'Unrelated to the number of sessions — it only depends on whether the period is measured in days or weeks',
      },
    },
    answer: 'b',
    explain: {
      vi: 'StockCharts nói rõ: “Ideally, for a 100% accurate EMA, you should use every data point the stock has ever had in calculating the EMA, starting your calculations from the first day the stock existed... the more data points you use, the more accurate your EMA will be”, và “Each previous EMA value accounts for a small portion of the current value.” Nghĩa là EMA 12 phiên tính đúng trên 12 phiên vẫn TÍNH ĐƯỢC bình thường (đáp án c sai — không có ngưỡng cứng 3×n để "tính được"), nhưng chỉ là một xấp xỉ vì bỏ qua lịch sử trước phiên đầu tiên; càng nạp thêm dữ liệu cũ, đường càng gần EMA lý tưởng.',
      en: "StockCharts states: “Ideally, for a 100% accurate EMA, you should use every data point the stock has ever had in calculating the EMA, starting your calculations from the first day the stock existed... the more data points you use, the more accurate your EMA will be,” and “Each previous EMA value accounts for a small portion of the current value.” A 12-period EMA computed on exactly 12 sessions still computes fine (option c's hard 3×n threshold to compute it at all does not exist) — it is just an approximation, because the history before the first session is left out. The more prior data fed in, the closer the line gets to the ideal EMA.",
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q285',
    formulaId: 'ema-n-phien',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Theo Macroption, một chỉ báo làm mượt kiểu Wilder (hệ số làm mượt = 1/n, cách RSI và ATR trong thư viện này đang dùng) với n = 14 phiên có độ trễ gần tương đương với một EMA chuẩn (hệ số làm mượt = 2/(n+1)) bao nhiêu phiên, tính theo công thức chính xác 2n − 1?',
      en: "According to Macroption, a Wilder-style smoothed indicator (smoothing factor = 1/n, the convention this library's RSI and ATR use) with n = 14 periods has a lag roughly equivalent to a standard EMA (smoothing factor = 2/(n+1)) of how many periods, using the precise formula 2n − 1?",
    },
    facts: [
      {
        label: { vi: 'Chu kỳ làm mượt kiểu Wilder (n)', en: "Wilder's smoothing period (n)" },
        value: { vi: '14 phiên', en: '14 periods' },
      },
    ],
    choices: {
      a: { vi: '14 phiên', en: '14 periods' },
      b: { vi: '27 phiên', en: '27 periods' },
      c: { vi: '28 phiên', en: '28 periods' },
      d: { vi: '7 phiên', en: '7 periods' },
    },
    answer: 'b',
    explain: {
      vi: 'Macroption chỉ rõ hệ số làm mượt khác nhau giữa hai phương pháp — “The numerator in the formula for a is 2” (EMA) “but 1 under Wilder\'s method” — rồi kết luận: “Wilder ATR with a particular period (n) is approximately the same as EMA ATR with double the period (2n, or 2n - 1 to be precise).” Với n = 14, EMA tương đương là 2×14 − 1 = 27 phiên. Nhầm hai hệ số này với nhau (dùng 2/(n+1) khi lẽ ra là 1/n hoặc ngược lại) là lỗi khiến hai chỉ báo cùng "n phiên" nhưng phản ứng nhanh chậm khác hẳn nhau. Ba đáp án còn lại là ba lỗi hay gặp: 14 là tưởng hai lối làm mượt cùng chu kỳ thì cùng độ trễ; 28 là lấy 2n mà quên trừ 1; 7 là chia đôi, tức làm ngược chiều quy đổi.',
      en: 'Macroption spells out the different smoothing factor between the two methods — “The numerator in the formula for a is 2” for EMA “but 1 under Wilder\'s method” — and concludes: “Wilder ATR with a particular period (n) is approximately the same as EMA ATR with double the period (2n, or 2n - 1 to be precise).” With n = 14, the equivalent EMA period is 2×14 − 1 = 27. Confusing the two smoothing factors (using 2/(n+1) where the convention calls for 1/n, or vice versa) is what makes two indicators with the same "n periods" respond at very different speeds. The other three are common slips: 14 assumes the two smoothing conventions have the same lag at the same period; 28 takes 2n and forgets the −1; 7 halves the period, converting in the wrong direction.',
    },
    source: {
      url: 'https://www.macroption.com/atr-calculation/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q113',
    formulaId: 'sma-n-phien',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Đường trung bình động làm được việc gì?' },
    choices: {
      a: { vi: 'Dự báo hướng giá sắp tới' },
      b: { vi: 'Xác định hướng hiện tại, không dự báo' },
      c: { vi: 'Đo động lượng' },
      d: { vi: 'Đo khối lượng' },
    },
    answer: 'b',
    explain: {
      vi: "Nó XÁC ĐỊNH hướng hiện tại chứ không dự báo hướng sắp tới: đường trung bình là số đã xảy ra được làm mượt, nên nó theo sau giá. Vì vậy đừng kỳ vọng bán được đỉnh và mua được đáy bằng nó. StockCharts: “A moving average doesn't predict price direction. Instead, it defines the current direction”, và “Don't expect to sell at the top and buy at the bottom using moving averages”.",
      en: "It DEFINES the current direction rather than predicting the next one: a moving average is smoothed history, so it follows price. Do not expect it to sell you the top and buy you the bottom. StockCharts: “A moving average doesn't predict price direction. Instead, it defines the current direction”, and “Don't expect to sell at the top and buy at the bottom using moving averages”.",
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q219',
    formulaId: 'sma-n-phien',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một mã đang trong xu hướng tăng, mỗi nhịp chỉnh đều bật lên từ đường SMA 50 phiên. Rồi giá đóng cửa xuống dưới đường. Từ lúc đó SMA 50 đóng vai gì?',
      en: 'A stock is in an uptrend and every pullback has bounced off its 50-period SMA. Then price closes below the line. What role does the 50-period SMA play from that point on?',
    },
    choices: {
      a: {
        vi: 'Vẫn là hỗ trợ, thủng xuống chỉ là nhiễu trong phiên',
        en: 'Still support — the break below is just intraday noise',
      },
      b: {
        vi: 'Đảo vai thành kháng cự — mỗi lần giá hồi lên chạm đường là gặp áp lực bán',
        en: 'It flips to resistance: each rally back up to the line meets selling pressure',
      },
      c: {
        vi: 'Mất hết ý nghĩa, phải bỏ đường này và đổi sang đường khác',
        en: 'It loses all meaning and has to be swapped for a different line',
      },
      d: {
        vi: 'Thành đường trung bình của xu hướng giảm, không còn đóng vai hỗ trợ lẫn kháng cự',
        en: 'It becomes the average of a downtrend and acts as neither support nor resistance',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Cùng một đường, vai trò đổi theo phía mà giá đang đứng: nằm trên thì là hỗ trợ, thủng xuống thì thành kháng cự. DSC minh hoạ bằng chính cổ phiếu ACB: “Trường hợp ACB thủng MA50 bước vào xu hướng điều chỉnh thì đường MA50 này trở thành kháng cự gây áp lực bán.” Đường không mất tác dụng khi bị thủng, nó chỉ đổi phía.',
      en: 'The same line changes role depending on which side price sits on: above it, the line is support; once price breaks below, it turns into resistance. Vietnamese broker DSC illustrates this with ACB itself: “Trường hợp ACB thủng MA50 bước vào xu hướng điều chỉnh thì đường MA50 này trở thành kháng cự gây áp lực bán.” The line does not stop working when it is broken — it simply switches sides.',
    },
    source: {
      url: 'https://www.dsc.com.vn/kien-thuc/cach-su-dung-4-duong-ma-pho-bien-trong-phan-tich-ky-thuat',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q220',
    formulaId: 'sma-n-phien',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Đường SMA 20 phiên của một mã đang nằm ngang, giá liên tục cắt lên rồi lại cắt xuống nó. Nên hiểu tình huống này thế nào?',
      en: "A stock's 20-period SMA is flat and price keeps crossing above it and back below it. How should this be read?",
    },
    choices: {
      a: {
        vi: 'Mỗi lần cắt là một tín hiệu mua hoặc bán, cứ theo đó mà giao dịch',
        en: 'Every cross is a buy or sell signal — just trade them',
      },
      b: {
        vi: 'SMA nằm ngang nghĩa là không có xu hướng — đúng lúc tín hiệu cắt đường kém tin cậy nhất',
        en: 'A flat SMA means there is no trend, which is exactly when crossover signals are least reliable',
      },
      c: {
        vi: 'Rút số phiên xuống 5 để bắt tín hiệu sớm hơn là xử lý được',
        en: 'Shortening the window to 5 periods to catch signals earlier fixes it',
      },
      d: {
        vi: 'Đổi sang EMA thì hết tín hiệu giả',
        en: 'Switching to an EMA gets rid of the false signals',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Cắt đường chỉ đáng theo khi thị trường có xu hướng. StockCharts viết thẳng: “Markets can be noisy, and not every crossover indicates a bullish or bearish trajectory. This is especially true in sideways markets, where you’ll likely get whipsawed.” Rút ngắn số phiên hay đổi sang EMA chỉ làm đường bám giá sát hơn, tức là cắt nhiều lần hơn nữa, chứ không chạm tới nguyên nhân là giá đang không có xu hướng.',
      en: 'Crossovers are only worth acting on when the market is trending. StockCharts puts it bluntly: “Markets can be noisy, and not every crossover indicates a bullish or bearish trajectory. This is especially true in sideways markets, where you’ll likely get whipsawed.” A shorter window or an EMA only hugs price more closely, producing even more crossings, and neither touches the real cause, which is that price has no trend.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models/trading-strategies/moving-average-trading-strategies/how-to-trade-price-to-moving-average-crossovers',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q221',
    formulaId: 'sma-n-phien',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Đổi ô Số phiên từ 20 lên 200 thì đường SMA được gì và mất gì?',
      en: 'You change the Number of periods field from 20 to 200. What does the SMA gain, and what does it give up?',
    },
    choices: {
      a: {
        vi: 'Được cả hai: nhiều dữ liệu hơn nên vừa mượt hơn vừa nhạy hơn',
        en: 'Both: more data makes it smoother and more responsive at the same time',
      },
      b: {
        vi: 'Mượt hơn, ít tín hiệu nhiễu hơn, nhưng đổi hướng chậm hơn — độ trễ lớn hơn',
        en: 'It gets smoother and gives fewer noisy signals, but turns later — the lag grows',
      },
      c: {
        vi: 'Nhạy hơn, vì cửa sổ lớn hơn thì đường phản ứng nhanh hơn',
        en: 'It becomes more responsive, because a larger window reacts faster',
      },
      d: {
        vi: 'Chỉ đổi độ cao của đường trên đồ thị, độ trễ không đổi',
        en: 'Only the height of the line on the chart changes; the lag stays the same',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Cửa sổ dài hơn kéo thêm giá cũ vào trung bình, nên đường phẳng hơn nhưng cũng chậm đổi hướng hơn. Chứng khoán Finhay (FHSC) viết: “Đường SMA càng dài thì tín hiệu càng trễ và càng ít bám đường giá của thị trường hơn.” Mượt và nhạy là hai đầu của cùng một cần gạt, không có số phiên nào cho cả hai cùng lúc.',
      en: 'A longer window pulls older prices into the average, so the line flattens but also turns later. Finhay Securities (FHSC) writes: “Đường SMA càng dài thì tín hiệu càng trễ và càng ít bám đường giá của thị trường hơn.” Smoothness and responsiveness are two ends of the same lever; no window length gives you both at once.',
    },
    source: {
      url: 'https://fhsc.com.vn/cac-duong-ma-trong-chung-khoan',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q222',
    formulaId: 'sma-n-phien',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Trong SMA 200 phiên, giá đóng cửa của phiên cách đây 200 phiên có sức nặng thế nào so với giá đóng cửa phiên hôm qua?',
      en: "In a 200-period SMA, how much weight does the closing price from 200 sessions ago carry compared with yesterday's close?",
    },
    choices: {
      a: {
        vi: 'Nhẹ hơn nhiều, càng lùi xa thì càng ít quan trọng',
        en: 'Much less — the further back a session is, the less it matters',
      },
      b: {
        vi: 'Bằng nhau — mọi phiên trong cửa sổ đều mang trọng số 1/n như nhau',
        en: 'Exactly the same: every session inside the window carries the same 1/n weight',
      },
      c: {
        vi: 'Nặng hơn, vì nó là phiên đặt nền cho cả cửa sổ',
        en: 'More, because it sets the starting point for the whole window',
      },
      d: {
        vi: 'Tuỳ biên độ phiên đó — phiên biến động mạnh thì trọng số lớn hơn',
        en: "It depends on that session's range — a volatile session weighs more",
      },
    },
    answer: 'b',
    explain: {
      vi: 'SMA là trung bình cộng thuần: tổng n giá đóng cửa chia cho n, nên phiên xa nhất trong cửa sổ nặng đúng bằng phiên gần nhất, và phiên thứ n+1 thì rơi hẳn ra ngoài. CFI: “The difference is that EMA places greater emphasis on recent prices, while SMA places equal weight on all data points.” Muốn phiên gần nặng hơn thì phải đổi sang EMA, chứ không phải nới số phiên của SMA.',
      en: 'An SMA is a plain arithmetic mean: n closing prices divided by n, so the oldest session in the window weighs exactly as much as the most recent one, while session n+1 drops out entirely. CFI: “The difference is that EMA places greater emphasis on recent prices, while SMA places equal weight on all data points.” If you want recent sessions to count for more, you need an EMA, not a longer SMA window.',
    },
    source: {
      url: 'https://corporatefinanceinstitute.com/resources/capital-markets/simple-moving-average-sma/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q114',
    formulaId: 'atr-dao-dong-thuc',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'ATR của cổ phiếu tăng gấp đôi trong một tuần. Thông tin này cho biết gì?' },
    choices: {
      a: { vi: 'Giá sắp tăng' },
      b: { vi: 'Biến động tăng — ATR không chứa thông tin về hướng' },
      c: { vi: 'Xu hướng tăng đang mạnh lên' },
      d: { vi: 'Khối lượng đang tăng' },
    },
    answer: 'b',
    explain: {
      vi: "StockCharts: “It is important to remember that ATR doesn't indicate price direction, just volatility”. Nguồn khác liệt kê 5 lỗi phổ biến của trader với ATR, gồm dùng ATR xác định hướng vào lệnh và đi tìm “phân kỳ ATR” — “ATR indicator isn't an oscillator”.",
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/average-true-range-atr',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q115',
    formulaId: 'atr-dao-dong-thuc',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Mã A có ATR 1.200 đồng, mã B có ATR 3.500 đồng. So sánh được không?' },
    choices: {
      a: { vi: 'Được, B biến động hơn' },
      b: { vi: 'Không — ATR dựa trên thay đổi giá tuyệt đối nên phụ thuộc thị giá' },
      c: { vi: 'Được nếu cùng sàn' },
      d: { vi: 'Được nếu cùng chu kỳ 14' },
    },
    answer: 'b',
    explain: {
      vi: 'Không so trực tiếp được: ATR tính bằng ĐƠN VỊ GIÁ tuyệt đối, nên một cổ phiếu thị giá cao luôn có ATR lớn hơn mà không hề biến động mạnh hơn. Muốn so giữa hai mã thì phải quy về phần trăm, chia ATR cho giá. StockCharts: “ATR is based on the True Range, which uses absolute price changes... ATR values are not comparable”. Một tài liệu về năm sai lầm thường gặp với ATR cũng xếp việc so sánh chéo mã vào danh sách ấy.',
      en: 'Not directly: ATR is expressed in absolute PRICE UNITS, so a high-priced stock always shows a larger ATR without being any more volatile. Comparing two names requires converting to a percentage, ATR divided by price. StockCharts: “ATR is based on the True Range, which uses absolute price changes... ATR values are not comparable”. A piece on the five common ATR mistakes lists cross-instrument comparison among them.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/average-true-range-atr',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q299',
    formulaId: 'atr-dao-dong-thuc',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'True Range (TR) được tính bằng giá trị lớn nhất trong 3 khoảng cách, gồm cả so với giá đóng cửa phiên trước — không chỉ đơn giản là High trừ Low trong phiên. Nếu chỉ dùng High − Low thay cho TR, ATR sẽ bị TÍNH THIẾU (đánh giá thấp biến động thật) trong (những) trường hợp nào?',
      en: "True Range (TR) is defined as the largest of three distances, including the comparison with the prior close — not simply the session's High minus Low. If you use High − Low instead of TR, in which case(s) would ATR UNDERSTATE the true volatility?",
    },
    choices: {
      a: {
        vi: 'Phiên mở cửa nhảy vọt lên cao hẳn so với giá đóng cửa phiên trước (gap tăng)',
        en: 'A session that opens with a sharp gap up from the prior close',
      },
      b: {
        vi: 'Phiên mở cửa rơi sâu xuống dưới giá đóng cửa phiên trước (gap giảm)',
        en: 'A session that opens with a sharp gap down from the prior close',
      },
      c: {
        vi: 'Phiên giá đi ngang, mở cửa gần sát đóng cửa hôm trước, dao động trong phiên hẹp',
        en: 'A flat session that opens near the prior close with a narrow intraday range',
      },
      d: {
        vi: 'Phiên khối lượng giao dịch tăng đột biến nhưng giá mở cửa không gap',
        en: 'A session with a volume spike but no opening gap',
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: 'DNSE giải thích vì sao TR lấy giá trị lớn nhất trong 3 khoảng cách thay vì chỉ High − Low: “Việc tính toán này vô cùng quan trọng vì nó bao quát toàn bộ biên độ thực tế của giá, giúp nhà đầu tư không bị đánh lừa bởi những phiên mở cửa vọt tăng hoặc giảm sâu tạo Gap.” Ở phiên gap tăng, giá đã nhảy vọt trước khi phiên mở nên phần biến động đó nằm ngoài khoảng High − Low trong phiên; TR bắt lại phần đó bằng cách so |High − Close hôm trước|. Tương tự với gap giảm, TR dùng |Low − Close hôm trước|. Phiên đi ngang không gap hoặc phiên chỉ tăng khối lượng thì High − Low trong phiên đã bao trùm đủ biến động, TR trùng với Range thông thường nên không bị tính thiếu.',
      en: "DNSE explains why TR takes the largest of three distances rather than just High − Low: “Việc tính toán này vô cùng quan trọng vì nó bao quát toàn bộ biên độ thực tế của giá, giúp nhà đầu tư không bị đánh lừa bởi những phiên mở cửa vọt tăng hoặc giảm sâu tạo Gap.” (this calculation matters because it captures the price's full actual range, keeping investors from being fooled by sessions that gap sharply up or down at the open.) On a gap-up session, the price has already jumped before the open, so that move falls outside the intraday High − Low; TR recovers it by comparing |High − prior close|. A gap-down session works the same way through |Low − prior close|. A flat session with no gap, or one with only a volume spike, already has its full move captured by the intraday High − Low, so TR equals the ordinary range and nothing is understated.",
    },
    source: {
      url: 'https://www.dnse.com.vn/hoc/chi-bao-atr',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q300',
    formulaId: 'atr-dao-dong-thuc',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'ATR(14) tính theo công thức làm mịn Wilder mà StockCharts mô tả, không phải trung bình cộng đơn giản của 14 giá trị TR. Điền ATR phiên trước, True Range hôm nay và chu kỳ vào đúng ô trống — chú ý chu kỳ xuất hiện hai lần.',
      en: "ATR(14) follows Wilder's smoothing formula as StockCharts describes it, not a simple average of the last 14 TR values. Put yesterday's ATR, today's True Range and the period into the right slots — note the period appears twice.",
    },
    facts: [
      {
        label: { vi: 'ATR(14) phiên trước', en: 'Prior ATR(14)' },
        value: { vi: '1.000 ₫', en: '1,000 ₫' },
      },
      {
        label: { vi: 'True Range (TR) phiên hôm nay', en: "Today's True Range (TR)" },
        value: { vi: '1.700 ₫', en: '1,700 ₫' },
      },
      {
        label: { vi: 'Chu kỳ làm mịn (n)', en: 'Smoothing period (n)' },
        value: { vi: '14 phiên', en: '14 sessions' },
      },
    ],
    expected: 1050,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'ATR(14) = ([1.000] × ([14] − 1) + [1.700]) ÷ [14]',
      en: 'ATR(14) = ([1000] × ([14] − 1) + [1700]) ÷ [14]',
    },
    explain: {
      vi: 'StockCharts nêu rõ: sau lần tính đầu tiên, ATR(14) không phải trung bình cộng 14 TR gần nhất mà dùng công thức làm mịn của Wilder — “Current ATR = [(Prior ATR x 13) + Current TR] / 14”. Thay số: (1.000 × 13 + 1.700) / 14 = 14.700 / 14 = 1.050 ₫. Hệ số 13/14 và 1/14 này là quy ước làm mượt (giống cách xây EMA), khác hẳn cách lấy trung bình cộng đơn giản mà nhiều người mặc định khi dựng lại chỉ báo từ đầu.',
      en: "StockCharts spells out that after the first calculation, ATR(14) is not a plain average of the last 14 TR values — it uses Wilder's smoothing formula: “Current ATR = [(Prior ATR x 13) + Current TR] / 14”. Plugging in the numbers: (1,000 × 13 + 1,700) / 14 = 14,700 / 14 = 1,050 ₫. That 13/14-and-1/14 weighting is the smoothing convention (similar to building an EMA), which differs from the plain average many people assume when reimplementing the indicator from scratch.",
    },
    giai: {
      tinh: { vi: 'dao động thực trung bình', en: 'Average true range (Wilder)' },
      thaySo: { vi: '(1.000 × (14 − 1) + 1.700) ÷ 14', en: '(1000 × (14 − 1) + 1700) ÷ 14' },
      ketQua: { vi: '1.050 ₫', en: '1050 ₫' },
      gan: [
        {
          kyHieu: 'ATR_{t-1}',
          moTa: {
            vi: 'là ATR 14 phiên của phiên trước: 1.000 ₫',
            en: 'is the previous session’s 14-session ATR: 1000 ₫',
          },
        },
        {
          kyHieu: 'TR_t',
          moTa: {
            vi: 'là dao động thực của phiên hôm nay: 1.700 ₫',
            en: 'is today’s true range: 1700 ₫',
          },
        },
        {
          kyHieu: 'n',
          moTa: { vi: 'là chu kỳ làm mịn 14 phiên', en: 'is the 14-session smoothing period' },
        },
      ],
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/average-true-range-atr',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q301',
    formulaId: 'atr-dao-dong-thuc',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Nhà đầu tư mua cổ phiếu tại giá 45.000 ₫; ATR(14) hiện tại của mã này là 1.200 ₫. Theo công thức đặt điểm dừng lỗ động bằng ATR mà DNSE hướng dẫn cho lệnh mua (bội số 2 lần ATR), điểm dừng lỗ nên đặt ở mức giá nào?',
      en: "An investor buys a stock at 45,000 ₫; the stock's current ATR(14) is 1,200 ₫. Using DNSE's ATR-based dynamic stop-loss formula for a long position (a 2x ATR multiple), where should the stop-loss be set?",
    },
    facts: [
      {
        label: { vi: 'Giá vào lệnh (mua)', en: 'Entry price (long)' },
        value: { vi: '45.000 ₫', en: '45,000 ₫' },
      },
      {
        label: { vi: 'ATR(14) hiện tại', en: 'Current ATR(14)' },
        value: { vi: '1.200 ₫', en: '1,200 ₫' },
      },
      {
        label: { vi: 'Bội số ATR dùng để đặt dừng lỗ', en: 'ATR multiplier for the stop-loss' },
        value: { vi: '2 lần', en: '2x' },
      },
    ],
    choices: {
      a: { vi: '43.800 ₫', en: '43,800 ₫' },
      b: { vi: '42.600 ₫', en: '42,600 ₫' },
      c: { vi: '47.400 ₫', en: '47,400 ₫' },
      d: { vi: '40.200 ₫', en: '40,200 ₫' },
    },
    answer: 'b',
    explain: {
      vi: 'DNSE hướng dẫn đặt điểm dừng lỗ động theo ATR cho lệnh mua: “Điểm dừng lỗ = Giá vào lệnh – (2 x Giá trị ATR).” Thay số: 45.000 − (2 × 1.200) = 45.000 − 2.400 = 42.600 ₫. Quy ước dùng bội số 2×ATR — không phải cộng/trừ thẳng một lần giá trị ATR, cũng không phải một tỷ lệ % cố định trên giá — nên nhầm hệ số nhân sẽ ra điểm dừng lỗ sai. Ba đáp án còn lại là ba lỗi hay gặp: 43.800 là chỉ trừ một lần ATR, bỏ mất bội số 2; 47.400 là CỘNG thay vì trừ, tức đặt dừng lỗ của lệnh bán khống lên một lệnh mua; 40.200 là trừ bốn lần ATR.',
      en: "DNSE's guide sets a volatility-based stop-loss for a buy order: “Điểm dừng lỗ = Giá vào lệnh – (2 x Giá trị ATR).” (stop-loss = entry price − (2 × ATR value)). Plugging in the numbers: 45,000 − (2 × 1,200) = 45,000 − 2,400 = 42,600 ₫. The convention uses a 2x ATR multiple — not a single raw ATR value added or subtracted, and not a fixed percentage of price — so mixing up the multiplier produces the wrong stop level. The other three are common slips: 43,800 subtracts only one ATR and drops the 2x multiple; 47,400 ADDS instead of subtracting, placing a short position’s stop on a long one; 40,200 subtracts four ATRs.",
    },
    source: {
      url: 'https://www.dnse.com.vn/hoc/chi-bao-atr',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q116',
    formulaId: 'stochastic-k',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Stochastic %K vượt 80. Theo tài liệu gốc, nên làm gì?' },
    choices: {
      a: { vi: 'Bán ngay' },
      b: {
        vi: 'Chờ — trên 80 vừa là quá mua vừa là dấu hiệu mạnh; cần %K rơi xuống dưới 80 mới là tín hiệu đảo chiều',
      },
      c: { vi: 'Mua thêm' },
      d: { vi: 'Đổi sang chu kỳ 5' },
    },
    answer: 'b',
    explain: {
      vi: 'Theo tài liệu gốc thì chưa làm gì cả: trên 80 nghĩa là chỉ báo đang ở vùng quá mua VÀ đang mạnh, phải chờ nó quay xuống dưới 80 mới có tín hiệu đảo chiều. StockCharts: “The indicator is overbought and strong when above 80. A subsequent move below 80 is needed to signal a reversal”. Chính George Lane, người tạo ra chỉ báo, nói “A %D divergence is the only signal which will cause you to buy or sell”. KIS Việt Nam cũng xếp việc bán máy móc ở mốc 80 vào nhóm lỗi phổ biến.',
      en: 'By the original material, nothing yet: above 80 means the indicator is overbought AND strong, and a reversal signal requires it to come back below 80. StockCharts: “The indicator is overbought and strong when above 80. A subsequent move below 80 is needed to signal a reversal”. George Lane, who created the indicator, said “A %D divergence is the only signal which will cause you to buy or sell”. KIS Vietnam likewise lists mechanically selling at the 80 mark among the common mistakes.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/stochastic-oscillator-fast-slow-and-full',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q223',
    formulaId: 'stochastic-k',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một cổ phiếu giảm giá suốt một năm, hồi vài phiên thì %K (chu kỳ 14) lên 95. Con số 95 đó nói lên điều gì?',
      en: 'A stock has fallen all year; after a few sessions of rebound its 14-period %K reads 95. What does that 95 actually tell you?',
    },
    choices: {
      a: {
        vi: 'Cổ phiếu đang ở vùng giá cao nhất kể từ khi niêm yết',
        en: 'The stock is at its highest price since listing',
      },
      b: {
        vi: 'Giá đóng cửa đang nằm sát đỉnh của riêng 14 phiên gần nhất — không nói gì về mặt bằng giá dài hạn hay khối lượng',
        en: "The close sits near the top of the last 14 sessions' range only — it says nothing about the long-term price level or about volume",
      },
      c: {
        vi: 'Lực mua rất lớn, khối lượng khớp đang ở mức cao',
        en: 'Buying pressure is very strong and traded volume is high',
      },
      d: {
        vi: 'Giá đã tăng 95% so với đáy của 14 phiên',
        en: 'The price is 95% above the 14-session low',
      },
    },
    answer: 'b',
    explain: {
      vi: "StockCharts viết: “High readings (above 80) indicate that price is near its high for the given time period.” Đỉnh ở đây là đỉnh của đúng n phiên được lấy ra, nên một cổ phiếu đang dò đáy dài hạn vẫn có thể cho %K bằng 95 sau vài phiên hồi. Chính George Lane mô tả chỉ báo của mình: “It doesn't follow price, it doesn't follow volume or anything like that.”",
      en: "StockCharts puts it this way: “High readings (above 80) indicate that price is near its high for the given time period.” The high in question is the high of those n sessions only, so a stock grinding out long-term lows can still print %K = 95 after a few sessions of rebound. George Lane himself described his indicator as follows: “It doesn't follow price, it doesn't follow volume or anything like that.”",
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/stochastic-oscillator-fast-slow-and-full',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q224',
    formulaId: 'stochastic-k',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một cổ phiếu đang trong xu hướng tăng rõ, %K nằm trên 80 gần ba tuần; lần nào bạn bán theo tín hiệu quá mua thì giá cũng tăng tiếp. Nên xử lý thế nào?',
      en: 'A stock is in a clear uptrend and %K has stayed above 80 for nearly three weeks; every time you sell on the overbought signal, the price keeps rising. What should you do?',
    },
    choices: {
      a: {
        vi: 'Chỉ báo đang hỏng, rút chu kỳ xuống 5 phiên cho nhạy hơn',
        en: 'The indicator is broken; shorten the period to 5 sessions to make it more responsive',
      },
      b: {
        vi: 'Đây là hạn chế đã biết: trong xu hướng rõ, %K bám vùng quá mua rất lâu và sinh nhiều tín hiệu sai; nên giao dịch thuận xu hướng lớn, chỉ lấy những lần %K rơi xuống vùng quá bán',
        en: 'This is a known limitation: in a clear trend %K stays pinned in the overbought zone and produces many false signals, so trade with the larger trend and take only the occasional drop into oversold',
      },
      c: {
        vi: 'Nâng ngưỡng quá mua từ 80 lên 90 để lọc bớt tín hiệu',
        en: 'Raise the overbought threshold from 80 to 90 to filter the signals',
      },
      d: {
        vi: 'Cứ bán như cũ, trước sau gì giá cũng phải đảo chiều về vùng cân bằng',
        en: 'Keep selling — sooner or later the price has to revert',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Chứng khoán KIS Việt Nam xếp đúng tình huống này vào phần hạn chế của chỉ báo: “Trong thị trường có xu hướng tăng hoặc giảm rõ ràng, Stochastic có thể tạo ra nhiều tín hiệu sai khi giá duy trì ở vùng quá mua hoặc quá bán trong thời gian dài.” StockCharts nói thẳng cách xử lý: “Look for occasional oversold readings in an uptrend and ignore frequent overbought readings.” Chỉ báo không hỏng và đổi tham số cũng không chữa được; cái sai là lấy tín hiệu ngược với xu hướng lớn.',
      en: "KIS Securities Vietnam lists exactly this case among the indicator's limitations: “Trong thị trường có xu hướng tăng hoặc giảm rõ ràng, Stochastic có thể tạo ra nhiều tín hiệu sai khi giá duy trì ở vùng quá mua hoặc quá bán trong thời gian dài.” StockCharts states the remedy plainly: “Look for occasional oversold readings in an uptrend and ignore frequent overbought readings.” The indicator is not broken and changing the period does not fix it; the mistake is taking signals against the larger trend.",
    },
    source: {
      url: 'https://kisvn.vn/hoc-dau-tu/cam-nang-dau-tu/chi-bao-stochastic-la-gi',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q225',
    formulaId: 'stochastic-k',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Bạn tự tính %K chu kỳ 14 ra 76, nhưng biểu đồ của phần mềm, cùng mã, cùng phiên, cùng chu kỳ 14, lại hiện %K là 68. Nguyên nhân thường gặp nhất là gì?',
      en: 'You compute 14-period %K by hand and get 76, but your charting platform shows %K = 68 for the same stock, the same session and the same 14-period setting. What is the usual cause?',
    },
    choices: {
      a: {
        vi: 'Phần mềm lấy nguồn giá khác nên dữ liệu lệch',
        en: 'The platform uses a different price feed, so the data differs',
      },
      b: {
        vi: 'Phần mềm còn làm mượt %K thêm một lần bằng trung bình 3 phiên (ô Smooth mặc định là 3); đặt Smooth = 1 mới ra đúng công thức gốc',
        en: 'The platform smooths %K once more with a 3-period average (the Smooth input defaults to 3); set Smooth = 1 to get the raw formula',
      },
      c: {
        vi: 'Cái đang hiện là đường %D chứ không phải %K',
        en: 'What you are looking at is the %D line, not %K',
      },
      d: { vi: 'Chênh lệch do làm tròn số thập phân', en: 'It is just a rounding difference' },
    },
    answer: 'b',
    explain: {
      vi: 'Tài liệu chỉ báo STOCH của TradingView mô tả ô Smooth: “The time period to be used in additional smoothing of the %K. 3 is the default. Value of 1 disables the additional smoothing.” Nghĩa là %K vẽ trên biểu đồ mặc định đã qua một lần trung bình 3 phiên — đúng thứ StockCharts gọi là “Slow %K = Fast %K smoothed with 3-period SMA”. Công thức trong thư viện này là %K gốc (fast), nên muốn hai số trùng nhau thì phải đặt Smooth = 1 trên phần mềm.',
      en: "TradingView's STOCH documentation describes the Smooth input: “The time period to be used in additional smoothing of the %K. 3 is the default. Value of 1 disables the additional smoothing.” So the %K drawn on the chart has by default been averaged once over 3 sessions — exactly what StockCharts calls “Slow %K = Fast %K smoothed with 3-period SMA”. The formula in this library is the raw (fast) %K, so to make the two numbers agree you must set Smooth = 1 on the platform.",
    },
    source: {
      url: 'https://www.tradingview.com/support/solutions/43000502332-stochastic-stoch/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q304',
    formulaId: 'stochastic-k',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Trên công cụ này, ô "Chu kỳ stochastic" đang để mặc định 14 phiên. Nếu bạn kéo xuống còn 5 phiên với kỳ vọng %K phản ứng nhanh hơn, hệ quả trực tiếp là gì?',
      en: 'On this tool, the "Stochastic period" field defaults to 14 sessions. If you drag it down to 5 sessions expecting %K to react faster, what is the direct consequence?',
    },
    choices: {
      a: {
        vi: '%K trở nên mượt hơn và ít khi chạm vùng quá mua/quá bán hơn',
        en: '%K becomes smoother and touches the overbought/oversold zones less often',
      },
      b: {
        vi: '%K dao động mạnh hơn (nhiễu hơn) và chạm vùng quá mua/quá bán thường xuyên hơn',
        en: '%K swings harder (gets choppier) and touches the overbought/oversold zones more often',
      },
      c: {
        vi: '%K không đổi, vì công thức chỉ phụ thuộc giá đóng cửa chứ không phụ thuộc chu kỳ',
        en: '%K stays unchanged, since the formula depends only on the closing price, not on the period',
      },
      d: {
        vi: '%K sẽ tự động được làm mượt lại bằng đường %D trước khi hiển thị',
        en: '%K gets automatically re-smoothed by the %D line before it is displayed',
      },
    },
    answer: 'b',
    explain: {
      vi: 'StockCharts nói thẳng hệ quả của việc rút ngắn chu kỳ nhìn lại: “A shorter look-back period will produce a choppy oscillator with many overbought and oversold readings.” Chu kỳ dài hơn cho hiệu ứng ngược lại: đường mượt hơn, ít lần chạm quá mua/quá bán hơn. Phản ứng nhanh hơn không đồng nghĩa với chính xác hơn — cái phải đánh đổi là nhiễu tăng lên, đúng như phần "Cách đọc kết quả" của công thức này cảnh báo về việc bị nhiễu tín hiệu.',
      en: "StockCharts states the consequence directly: “A shorter look-back period will produce a choppy oscillator with many overbought and oversold readings.” A longer period does the opposite — a smoother line with fewer overbought/oversold touches. Reacting faster does not mean being more accurate; the trade-off is more noise, which is exactly the kind of false signal this formula's own reading guide warns about.",
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/stochastic-oscillator-fast-slow-and-full',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q117',
    formulaId: 'vwap',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Bạn muốn vẽ VWAP trên biểu đồ tuần để tìm “giá trị hợp lý” dài hạn. Vấn đề?' },
    choices: {
      a: { vi: 'Không có vấn đề' },
      b: {
        vi: 'VWAP tính lũy kế từ mở cửa tới đóng cửa rồi reset — không định nghĩa cho khung ngày/tuần/tháng',
      },
      c: { vi: 'Phải đổi sang VWAP có trọng số' },
      d: { vi: 'Chỉ thiếu dữ liệu khối lượng' },
    },
    answer: 'b',
    explain: {
      vi: 'VWAP là chỉ báo TRONG PHIÊN, cộng dồn từ đầu phiên và làm mới mỗi ngày, nên không có VWAP tuần hay tháng đúng nghĩa. Vẽ xuyên nhiều phiên thì đường bị nhảy bậc ở mỗi lần mở cửa. StockCharts: “VWAP is not defined for daily, weekly, or monthly periods due to the nature of the calculation”, và khi kéo qua nhiều phiên “the overlay will jump from its prior closing value to the typical price for the next open”. DSC xác nhận VWAP “thường được làm mới vào đầu mỗi ngày giao dịch”.',
      en: 'VWAP is an INTRADAY indicator, accumulated from the session open and reset each day, so there is no meaningful weekly or monthly VWAP. Drawn across several sessions the line steps at every open. StockCharts: “VWAP is not defined for daily, weekly, or monthly periods due to the nature of the calculation”, and across sessions “the overlay will jump from its prior closing value to the typical price for the next open”. DSC confirms VWAP “thường được làm mới vào đầu mỗi ngày giao dịch” (it is normally reset at the start of each trading day).',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/volume-weighted-average-price-vwap',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q118',
    formulaId: 'vwap',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Vì sao VWAP phản ứng chậm dần về cuối phiên?' },
    choices: {
      a: { vi: 'Do khối lượng giảm' },
      b: {
        vi: 'Vì là chỉ báo lũy kế — số điểm dữ liệu tăng dần, cuối phiên hành xử như một đường trung bình dài',
      },
      c: { vi: 'Do lệnh ATC' },
      d: { vi: 'Do biên độ thu hẹp' },
    },
    answer: 'b',
    explain: {
      vi: "Vì nó cộng dồn: càng về cuối phiên thì số điểm dữ liệu đã gộp càng nhiều, nên mỗi lệnh mới chỉ chiếm một phần rất nhỏ trong trung bình và đường gần như đứng yên. StockCharts: “VWAP is a cumulative indicator, which means the number of data points progressively increases throughout the day”. Nguồn khác mô tả: “Late in the session: The line starts to act like a long moving average”, và nhắc thêm “It isn't a crystal ball”.",
      en: "Because it accumulates: the later in the session, the more data points are already in the average, so each new trade is a tiny share of it and the line barely moves. StockCharts: “VWAP is a cumulative indicator, which means the number of data points progressively increases throughout the day”. Another source describes it as: “Late in the session: The line starts to act like a long moving average”, adding that “It isn't a crystal ball”.",
    },
    source: {
      url: 'https://deepvue.com/indicators/how-vwap-actually-works/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q305',
    formulaId: 'vwap',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Trong một phiên thị trường biến động giằng co với biên độ hẹp, một trader liên tục vào/thoát lệnh mỗi khi giá cắt qua đường VWAP. Theo cảnh báo của nguồn, vì sao cách làm này rủi ro?',
      en: "During a session where the market is chopping sideways in a narrow range, a trader keeps entering and exiting every time price crosses the VWAP line. According to the source's warning, why is this risky?",
    },
    choices: {
      a: {
        vi: 'Vì lúc đó VWAP bị tính sai công thức',
        en: 'Because VWAP is computed with the wrong formula under that condition',
      },
      b: {
        vi: 'Vì trong điều kiện này giá có thể liên tục cắt qua lại đường VWAP, tạo ra hàng loạt tín hiệu giả',
        en: 'Because under this condition price can repeatedly cross back and forth over the VWAP line, creating a stream of false signals',
      },
      c: {
        vi: 'Vì khối lượng khớp lúc đó luôn bằng 0',
        en: 'Because matched volume is always zero under that condition',
      },
      d: {
        vi: 'Vì VWAP chỉ được cập nhật vào cuối phiên trong điều kiện này',
        en: 'Because VWAP is only updated at the end of the session under that condition',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn cảnh báo: “Khi thị trường biến động giằng co với biên độ hẹp, giá có thể liên tục cắt qua lại đường VWAP, tạo ra các tín hiệu giả.” Vào/thoát lệnh theo mỗi lần cắt trong điều kiện này là giao dịch theo nhiễu chứ không theo xu hướng thật, đúng kiểu hiểu sai phổ biến khi coi mọi lần cắt VWAP là một tín hiệu.',
      en: 'The source warns: “Khi thị trường biến động giằng co với biên độ hẹp, giá có thể liên tục cắt qua lại đường VWAP, tạo ra các tín hiệu giả” (when the market chops sideways in a narrow range, price can repeatedly cross back and forth over the VWAP line, creating false signals). Entering and exiting on every such crossing under this condition means trading on noise rather than a real trend, exactly the common mistake of treating every VWAP crossing as a signal.',
    },
    source: {
      url: 'https://www.dsc.com.vn/kien-thuc/vwap-la-gi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q306',
    formulaId: 'vwap',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một phiên giao dịch được chia làm 2 đợt khớp lệnh (ví dụ theo một khung thời gian ngắn trong phiên). Số liệu mỗi đợt cho ở bảng dưới. Tính VWAP của phiên ĐÚNG theo quy ước dùng GIÁ ĐIỂN HÌNH — Typical Price = (Cao + Thấp + Đóng) / 3 — nhân khối lượng rồi chia tổng khối lượng, KHÔNG phải trung bình cộng hai giá đóng cửa và cũng KHÔNG phải chỉ lấy giá đóng cửa của đợt cuối.',
      en: "A trading session is split into 2 matching intervals (for example, by some short intraday timeframe). Each interval's data is given in the table below. Calculate the session's VWAP correctly using the TYPICAL PRICE convention — Typical Price = (High + Low + Close) / 3 — multiplied by volume and divided by total volume, NOT a plain average of the two closing prices, and NOT just the last interval's closing price.",
    },
    facts: [
      {
        label: { vi: 'Đợt 1 — giá cao nhất', en: 'Interval 1 — high' },
        value: { vi: '51.000 ₫', en: '51,000 VND' },
      },
      {
        label: { vi: 'Đợt 1 — giá thấp nhất', en: 'Interval 1 — low' },
        value: { vi: '45.000 ₫', en: '45,000 VND' },
      },
      {
        label: { vi: 'Đợt 1 — giá khớp cuối đợt (đóng)', en: 'Interval 1 — close' },
        value: { vi: '48.000 ₫', en: '48,000 VND' },
      },
      {
        label: { vi: 'Đợt 1 — khối lượng khớp', en: 'Interval 1 — matched volume' },
        value: { vi: '200.000 cổ phiếu', en: '200,000 shares' },
      },
      {
        label: { vi: 'Đợt 2 — giá cao nhất', en: 'Interval 2 — high' },
        value: { vi: '57.000 ₫', en: '57,000 VND' },
      },
      {
        label: { vi: 'Đợt 2 — giá thấp nhất', en: 'Interval 2 — low' },
        value: { vi: '51.000 ₫', en: '51,000 VND' },
      },
      {
        label: { vi: 'Đợt 2 — giá khớp cuối đợt (đóng)', en: 'Interval 2 — close' },
        value: { vi: '54.000 ₫', en: '54,000 VND' },
      },
      {
        label: { vi: 'Đợt 2 — khối lượng khớp', en: 'Interval 2 — matched volume' },
        value: { vi: '100.000 cổ phiếu', en: '100,000 shares' },
      },
    ],
    choices: {
      a: { vi: '50.000 ₫', en: '50,000 ₫' },
      b: { vi: '51.000 ₫', en: '51,000 ₫' },
      c: { vi: '52.000 ₫', en: '52,000 ₫' },
      d: { vi: '54.000 ₫', en: '54,000 ₫' },
    },
    answer: 'a',
    explain: {
      vi: 'Giá điển hình đợt 1 = (51.000+45.000+48.000)/3 = 48.000 ₫; đợt 2 = (57.000+51.000+54.000)/3 = 54.000 ₫. VWAP = (48.000×200.000 + 54.000×100.000) / (200.000+100.000) = 15.000.000.000/300.000 = 50.000 ₫. Nguồn nêu đúng quy ước này: “VWAP = Tổng (Giá Điển Hình x Khối Lượng) / Tổng Khối Lượng”, với “Typical Price = (High + Low + Close) / 3” — không phải trung bình cộng hai giá đóng cửa (sẽ ra (48.000+54.000)/2 = 51.000 ₫, sai) và cũng không phải chỉ lấy giá đóng cửa đợt cuối (54.000 ₫, càng sai). Ba đáp án còn lại là ba lỗi hay gặp: 51.000 là trung bình cộng hai giá của hai đợt, bỏ qua hẳn khối lượng; 52.000 là gán nhầm khối lượng cho đợt kia; 54.000 là chỉ lấy giá đợt cuối, tức coi VWAP như giá đóng cửa.',
      en: "Typical price for interval 1 = (51,000+45,000+48,000)/3 = 48,000 VND; interval 2 = (57,000+51,000+54,000)/3 = 54,000 VND. VWAP = (48,000×200,000 + 54,000×100,000) / (200,000+100,000) = 15,000,000,000/300,000 = 50,000 VND. The source states exactly this convention: “VWAP = Tổng (Giá Điển Hình x Khối Lượng) / Tổng Khối Lượng” (VWAP = sum of (typical price × volume) divided by total volume), with “Typical Price = (High + Low + Close) / 3” — not a plain average of the two closing prices (which would give (48,000+54,000)/2 = 51,000 VND, wrong), and not just the last interval's closing price (54,000 VND, even more wrong). The other three are common slips: 51,000 is the plain average of the two intervals’ prices, ignoring volume entirely; 52,000 swaps the two volumes; 54,000 takes only the last interval’s price, treating VWAP as a closing price.",
    },
    source: {
      url: 'https://www.dsc.com.vn/kien-thuc/vwap-la-gi',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q307',
    formulaId: 'vwap',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một quỹ đầu tư đặt lệnh MUA một lượng lớn cổ phiếu trong phiên, và lệnh khớp ở mức giá THẤP HƠN đường VWAP của phiên đó. Theo cách các quỹ lớn dùng VWAP để đánh giá chất lượng khớp lệnh, kết quả này nên hiểu thế nào?',
      en: "A fund places a large BUY order during a session, and the order fills at a price BELOW that session's VWAP line. Given how large funds use VWAP to judge execution quality, how should this result be read?",
    },
    choices: {
      a: {
        vi: 'Đây là dấu hiệu quỹ sắp lỗ, vì giá dưới VWAP nghĩa là giá đang giảm',
        en: 'This is a sign the fund is about to lose money, because a price below VWAP means the price is falling',
      },
      b: {
        vi: 'Lệnh mua khớp dưới VWAP được xem là mức giá tối ưu, quỹ đã mua rẻ hơn mặt bằng bình quân theo khối lượng của phiên',
        en: "A buy order filled below VWAP is considered the optimal price, the fund bought cheaper than the session's volume-weighted average level",
      },
      c: {
        vi: 'Kết quả này không có ý nghĩa gì vì VWAP chỉ dùng để vẽ đường xu hướng',
        en: 'This result means nothing, because VWAP is only used to draw a trend line',
      },
      d: {
        vi: 'Chỉ có ý nghĩa nếu quỹ đặt lệnh bán, không áp dụng cho lệnh mua',
        en: 'It only matters for sell orders, not for buy orders',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn nói thẳng: “Lệnh mua được khớp dưới đường VWAP được xem là mức giá tối ưu.” Các quỹ lớn dùng VWAP làm thước đo hiệu quả khớp lệnh bằng cách so sánh giá khớp thực tế với VWAP của phiên; mua dưới đường này nghĩa là mua rẻ hơn mặt bằng bình quân theo khối lượng, không liên quan gì tới việc giá "đang giảm" hay dự báo xu hướng.',
      en: 'The source states plainly: “Lệnh mua được khớp dưới đường VWAP được xem là mức giá tối ưu” (a buy order filled below the VWAP line is considered the optimal price). Large funds use VWAP as an execution-quality benchmark by comparing the actual fill price against the session\'s VWAP; buying below it means buying cheaper than the volume-weighted average level, and says nothing about price "falling" or forecasting a trend.',
    },
    source: {
      url: 'https://www.dsc.com.vn/kien-thuc/vwap-la-gi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q119',
    formulaId: 'roc-toc-do-thay-doi',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Phân kỳ ROC có báo trước đảo chiều không?' },
    choices: {
      a: { vi: 'Có, rất đáng tin' },
      b: { vi: 'Nguồn nói thẳng: thất bại nhiều hơn thành công' },
      c: { vi: 'Chỉ đúng khung tuần' },
      d: { vi: 'Chỉ đúng khi ROC âm' },
    },
    answer: 'b',
    explain: {
      vi: 'Phần lớn là không: phân kỳ ROC trượt nhiều hơn trúng, và cắt qua đường 0 cũng hay tạo tín hiệu giả, nhất là ở khung ngắn. Nên dùng nó để mô tả động lượng đang giảm dần chứ không dùng làm tín hiệu đảo chiều đứng một mình. StockCharts: “Divergences fail to foreshadow reversals more often than not”, và “Centerline crossovers are prone to whipsaw, especially short-term”.',
      en: 'Mostly no: ROC divergences miss more often than they hit, and centerline crosses produce plenty of false signals, especially on short timeframes. Use it to describe fading momentum, not as a standalone reversal signal. StockCharts: “Divergences fail to foreshadow reversals more often than not”, and “Centerline crossovers are prone to whipsaw, especially short-term”.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/rate-of-change-roc',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q120',
    formulaId: 'roc-toc-do-thay-doi',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Dùng chung ngưỡng ROC ±10% cho mọi cổ phiếu. Đúng hay sai?' },
    choices: {
      a: { vi: 'Đúng, đó là chuẩn' },
      b: { vi: 'Sai — ngưỡng phụ thuộc mức biến động riêng của từng mã' },
      c: { vi: 'Đúng với cổ phiếu VN30' },
      d: { vi: 'Đúng nếu dùng chu kỳ 12' },
    },
    answer: 'b',
    explain: {
      vi: 'Sai: ngưỡng quá mua và quá bán của ROC phải đặt theo mức biến động của chính mã đó. Một mã biến động mạnh có thể cần mốc quá bán ở âm 15%, mã êm hơn thì âm 5% đã là quá bán, nên một ngưỡng chung cho mọi mã sẽ vừa bỏ sót vừa báo thừa. StockCharts: “Overbought and oversold settings depend on the volatility of the underlying security. A more volatile stock may use -15% for oversold, while a less volatile stock may use -5%”.',
      en: 'Wrong: ROC overbought and oversold levels have to be set from the volatility of the specific security. A volatile stock may need minus 15% to count as oversold while a calmer one is already oversold at minus 5%, so one shared threshold both misses signals and invents them. StockCharts: “Overbought and oversold settings depend on the volatility of the underlying security. A more volatile stock may use -15% for oversold, while a less volatile stock may use -5%”.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/rate-of-change-roc',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q291',
    formulaId: 'roc-toc-do-thay-doi',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'ROC(12) của một mã giảm liên tục từ +30% xuống +5% qua vài phiên gần đây, nhưng vẫn còn dương. Nên đọc diễn biến giá của mã này thế nào?',
      en: "A stock's ROC(12) has fallen steadily from +30% to +5% over the last few sessions but is still positive. How should the stock's price action be read?",
    },
    choices: {
      a: {
        vi: 'Giá đang giảm, vì ROC đang giảm dần',
        en: 'The price is falling, because ROC keeps falling',
      },
      b: {
        vi: 'Giá vẫn đang tăng, chỉ là tốc độ tăng đang chậm lại — ROC dương nghĩa là giá hiện tại vẫn cao hơn giá n phiên trước',
        en: 'The price is still rising, just at a slower pace — a positive ROC means the current price is still above its level n sessions ago',
      },
      c: { vi: 'Giá đã đi ngang suốt giai đoạn này', en: 'The price has been flat throughout' },
      d: {
        vi: 'Không thể kết luận nếu chưa có dữ liệu khối lượng',
        en: 'Nothing can be concluded without volume data',
      },
    },
    answer: 'b',
    explain: {
      vi: 'DSC (dịch từ StockCharts): “giá liên tục tăng miễn là ROC vẫn tích cực. Các chỉ số tích cực có thể ít hơn trước, nhưng ROC tích cực vẫn phản ánh sự tăng giá chứ không phải sự giảm giá.” ROC giảm từ +30% xuống +5% chỉ cho thấy đà tăng đang yếu đi, không phải giá đang giảm; nhầm “ROC giảm” với “giá giảm” là lỗi đọc kết quả phổ biến với chỉ báo này.',
      en: 'DSC (translating StockCharts) writes: “giá liên tục tăng miễn là ROC vẫn tích cực. Các chỉ số tích cực có thể ít hơn trước, nhưng ROC tích cực vẫn phản ánh sự tăng giá chứ không phải sự giảm giá.” ["the price keeps rising as long as ROC stays positive. The positive readings may be smaller than before, but a positive ROC still reflects a price increase, not a decrease."] A drop from +30% to +5% only signals fading upward momentum, not a falling price; confusing "ROC is falling" with "the price is falling" is a common misreading of this indicator.',
    },
    source: {
      url: 'https://www.dsc.com.vn/kien-thuc/chi-bao-rate-of-change-roc-la-gi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q292',
    formulaId: 'roc-toc-do-thay-doi',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'DSC (dịch từ StockCharts) đưa ra quy ước chọn chu kỳ ROC theo khung thời gian dài hạn: một quý có khoảng 63 phiên giao dịch. Nếu chia đều số phiên của một quý (3 tháng) để suy ra chu kỳ ROC dùng cho khung một tháng, kết quả là bao nhiêu phiên?',
      en: "DSC (translating StockCharts) gives a convention for picking ROC's period by timeframe: a quarter has about 63 trading sessions. If that quarter's sessions (3 months) are split evenly to derive the ROC period for a one-month window, what is the result, in sessions?",
    },
    facts: [
      {
        label: {
          vi: 'Số phiên giao dịch mỗi quý (theo quy ước)',
          en: 'Trading sessions per quarter (by convention)',
        },
        value: { vi: '63 phiên', en: '63 sessions' },
      },
      {
        label: { vi: 'Số tháng trong một quý', en: 'Months per quarter' },
        value: { vi: '3 tháng', en: '3 months' },
      },
    ],
    choices: {
      a: { vi: '63 phiên', en: '63 sessions' },
      b: { vi: '21 phiên', en: '21 sessions' },
      c: { vi: '12 phiên', en: '12 sessions' },
      d: { vi: '5 phiên', en: '5 sessions' },
    },
    answer: 'b',
    explain: {
      vi: 'DSC (dịch StockCharts): "Có khoảng 250 ngày giao dịch trong một năm. Điều này có thể được chia thành 125 ngày mỗi nửa năm, 63 ngày mỗi quý và 21 ngày mỗi tháng." Chia đều 63 phiên của một quý cho 3 tháng: 63 / 3 = 21 phiên — đúng bằng chu kỳ tháng mà nguồn nêu, dùng khi muốn ROC bắt biến động theo khung tháng thay vì mặc định 12 phiên. Ba đáp án còn lại là ba lỗi hay gặp: 63 là giữ nguyên chu kỳ quý mà không chia; 12 là lấy số THÁNG trong năm chứ không phải số phiên trong tháng; 5 là số phiên một tuần.',
      en: 'DSC (translating StockCharts) states: "Có khoảng 250 ngày giao dịch trong một năm. Điều này có thể được chia thành 125 ngày mỗi nửa năm, 63 ngày mỗi quý và 21 ngày mỗi tháng." ["There are roughly 250 trading days in a year. This can be split into 125 days per half-year, 63 days per quarter and 21 days per month."] Dividing a quarter\'s 63 sessions evenly across 3 months: 63 / 3 = 21 sessions — exactly the monthly period the source gives, used when ROC should track monthly moves instead of the default 12-session window. The other three are common slips: 63 keeps the quarterly period without dividing; 12 takes the number of MONTHS in a year rather than sessions in a month; 5 is the number of sessions in a week.',
    },
    source: {
      url: 'https://www.dsc.com.vn/kien-thuc/chi-bao-rate-of-change-roc-la-gi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q121',
    formulaId: 'dong-luong-momentum',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Mã A có Momentum = 3.000, mã B có Momentum = 800. Kết luận?' },
    choices: {
      a: { vi: 'A khoẻ hơn B' },
      b: {
        vi: 'Không so được — Momentum là chênh lệch tuyệt đối theo đơn vị tiền, không chia cho giá cũ',
      },
      c: { vi: 'B sắp tăng' },
      d: { vi: 'Phải cộng thêm khối lượng' },
    },
    answer: 'b',
    explain: {
      vi: 'Không kết luận được gì: Momentum là hiệu giá tuyệt đối nên phụ thuộc thị giá, mã giá cao đương nhiên có số lớn hơn. Muốn so chéo mã phải dùng ROC, vốn chia cho giá cũ nên ra phần trăm. “Rate of change scales by the old close, so as to represent the increase as a fraction”, minh hoạ rằng momentum cho thấy “a $3 rise over 20 days” trong khi ROC thể hiện “that as 0.25 for a 25% rise”.',
      en: 'Nothing can be concluded: Momentum is an absolute price difference and therefore depends on price level, so a higher-priced stock naturally shows a bigger number. Cross-stock comparison needs ROC, which divides by the old close and so returns a percentage. The source: “Rate of change scales by the old close, so as to represent the increase as a fraction”, illustrating that momentum shows “a $3 rise over 20 days” while ROC expresses “that as 0.25 for a 25% rise”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Momentum_(technical_analysis)',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q233',
    formulaId: 'dong-luong-momentum',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Giá cổ phiếu lập đỉnh mới cao hơn đỉnh trước, nhưng Momentum lại lập đỉnh thấp hơn (phân kỳ giảm). Nên đọc tín hiệu này thế nào?',
      en: 'A stock prints a higher high than its previous peak, but Momentum prints a lower high (bearish divergence). How should this be read?',
    },
    choices: {
      a: {
        vi: 'Bán ngay, vì phân kỳ là tín hiệu bán',
        en: 'Sell at once, because divergence is a sell signal',
      },
      b: {
        vi: 'Chỉ là cảnh báo đà tăng đang yếu đi, chưa phải tín hiệu mua/bán; theo dõi thêm, và không biết trước mức hay thời gian điều chỉnh',
        en: 'Only a warning that upward momentum is fading, not a buy/sell signal; keep watching, and neither the size nor the timing of any correction is known in advance',
      },
      c: {
        vi: 'Giá sẽ điều chỉnh đúng bằng mức của lần phân kỳ trước',
        en: 'Price will correct by exactly as much as after the previous divergence',
      },
      d: {
        vi: 'Phân kỳ chỉ có giá trị khi Momentum đang nằm trên mốc 100',
        en: 'Divergence only counts while Momentum sits above the 100 line',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Vietstock nói thẳng đây là chỗ nhà đầu tư mới hay nhầm giữa hai loại tín hiệu: “tín hiệu phân kỳ của nhóm chỉ báo Momentum chỉ mang tính chất cảnh báo (Warning Signal) không phải là tín hiệu mua/bán (Signal)”. Bài còn nêu “Phân kỳ chỉ mang tính cảnh báo về sự đảo chiều trong xu hướng và không cho người sử dụng biết mức độ điều chỉnh cũng như thời gian điều chỉnh”, với ví dụ PVD: hai lần phân kỳ liên tiếp cho mức giảm 13,3% và 25,3% khác hẳn nhau, nên không suy được mức điều chỉnh từ lần trước.',
      en: 'Vietstock says outright that newcomers confuse the two kinds of signal: “tín hiệu phân kỳ của nhóm chỉ báo Momentum chỉ mang tính chất cảnh báo (Warning Signal) không phải là tín hiệu mua/bán (Signal)”. The article adds “Phân kỳ chỉ mang tính cảnh báo về sự đảo chiều trong xu hướng và không cho người sử dụng biết mức độ điều chỉnh cũng như thời gian điều chỉnh”, with a PVD example in which two consecutive divergences were followed by corrections of 13.3% and 25.3%, so the last one tells you nothing about the size of the next.',
    },
    source: {
      url: 'https://vietstock.vn/2017/11/kinh-nghiem-dau-tu-nhom-chi-bao-momentum-phan-1-585-566930.htm',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q234',
    formulaId: 'dong-luong-momentum',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Momentum(10) của một cổ phiếu vừa lên mức cao nhất trong nhiều tháng. Có thể kết luận cổ phiếu đã quá mua và sắp giảm, như cách nhiều người đọc RSI vượt 70 không?',
      en: "A stock's Momentum(10) has just hit its highest level in months. Can you conclude it is overbought and due to fall, the way RSI above 70 is often read?",
    },
    choices: {
      a: {
        vi: 'Có, Momentum cao kỷ lục là quá mua, nên bán',
        en: 'Yes, record-high Momentum means overbought, so sell',
      },
      b: {
        vi: 'Không, Momentum không có biên trên hay biên dưới nên không có ngưỡng quá mua cố định; đọc quá mua là chủ quan và giá vẫn có thể tăng tiếp',
        en: 'No, Momentum has no upper or lower bound, so there is no fixed overbought threshold; calling it overbought is subjective and price can keep rising',
      },
      c: {
        vi: 'Có, với điều kiện Momentum đang trên mốc 100',
        en: 'Yes, provided Momentum is above the 100 line',
      },
      d: {
        vi: 'Không, vì Momentum chỉ dùng để xác nhận xu hướng giảm',
        en: 'No, because Momentum only confirms downtrends',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Fidelity lưu ý: “Momentum is an unbound oscillator, meaning there is no upside or downside limits. This makes interpreting an overbought or oversold condition subjective. When the Momentum indicator is overbought the security can continue to move higher.” Khác RSI có biên 0 đến 100 và ngưỡng quen thuộc 70/30, Momentum là hiệu số giá nên không có trần; muốn đọc quá mua hay quá bán phải kết hợp chỉ báo khác hoặc phân tích giá.',
      en: 'Fidelity notes: “Momentum is an unbound oscillator, meaning there is no upside or downside limits. This makes interpreting an overbought or oversold condition subjective. When the Momentum indicator is overbought the security can continue to move higher.” Unlike RSI, which is bounded between 0 and 100 with the familiar 70/30 levels, Momentum is a price difference with no ceiling; reading overbought or oversold needs other indicators or price analysis alongside it.',
    },
    source: {
      url: 'https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/momentum',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q235',
    formulaId: 'dong-luong-momentum',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Trên bảng giá DNSE (và trong MetaStock/MT4), Momentum được tính theo quy ước tỷ lệ: Momentum = (Close hôm nay / Close n phiên trước) × 100, dao động quanh mốc 100, chứ không phải hiệu số quanh mốc 0 như công thức của trang này. Với số liệu dưới đây, Momentum(10) theo quy ước tỷ lệ bằng bao nhiêu?',
      en: "On DNSE's chart (and in MetaStock/MT4) Momentum follows the ratio convention: Momentum = (today's close / close n sessions ago) × 100, oscillating around 100, not the difference around 0 that this page's formula uses. From the figures below, what is Momentum(10) under the ratio convention?",
    },
    facts: [
      {
        label: { vi: 'Giá đóng cửa hôm nay', en: "Today's close" },
        value: { vi: '52.000 ₫', en: '52,000 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa 10 phiên trước', en: 'Close 10 sessions ago' },
        value: { vi: '50.000 ₫', en: '50,000 ₫' },
      },
      { label: { vi: 'Chu kỳ n', en: 'Period n' }, value: { vi: '10 phiên', en: '10 sessions' } },
      {
        label: { vi: 'Quy ước tính', en: 'Convention' },
        value: {
          vi: 'Tỷ lệ Close hôm nay chia Close n phiên trước, nhân 100',
          en: "Ratio of today's close to the close n sessions ago, times 100",
        },
      },
    ],
    choices: {
      a: { vi: '2.000 điểm', en: '2,000 points' },
      b: { vi: '104 điểm', en: '104 points' },
      c: { vi: '96,15 điểm', en: '96.15 points' },
      d: { vi: '4 điểm', en: '4 points' },
    },
    answer: 'b',
    explain: {
      vi: 'DNSE ghi rõ quy ước: “Momentum = (Closei / Closei-n ) x 100”, tức 52.000 / 50.000 × 100 = 104. Cùng số liệu, công thức hiệu số của trang này cho 52.000 − 50.000 = 2.000 ₫ và mốc cân bằng là 0; còn theo quy ước tỷ lệ, mốc cân bằng là 100: “Chỉ báo MOM lớn hơn 100: Mức giá hiện tại cao hơn giá của "n" phiên giao dịch trước đó.” Gõ 4 (phần trăm thay đổi, tức ROC) hay 2.000 (hiệu số) đều là đọc nhầm quy ước của bảng giá đang xem. Ba đáp án còn lại là ba lỗi hay gặp: 2.000 là hiệu số 52.000 − 50.000, tức quy ước của chính trang này chứ không phải quy ước tỷ lệ; 96,15 là đảo ngược tử và mẫu; 4 là phần trăm thay đổi, quên mất rằng quy ước tỷ lệ dao động quanh mốc 100 chứ không quanh 0.',
      en: 'DNSE states the convention: “Momentum = (Closei / Closei-n ) x 100”, i.e. 52,000 / 50,000 × 100 = 104. On the same data, this page\'s difference formula gives 52,000 − 50,000 = 2,000 ₫ with 0 as the balance line; under the ratio convention the balance line is 100: “Chỉ báo MOM lớn hơn 100: Mức giá hiện tại cao hơn giá của "n" phiên giao dịch trước đó.” Typing 4 (the percent change, i.e. ROC) or 2,000 (the difference) means misreading which convention the chart in front of you uses. The other three are common slips: 2,000 is the difference 52,000 − 50,000, which is this page’s own convention rather than the ratio one; 96.15 inverts numerator and denominator; 4 is the percentage change, forgetting that the ratio convention oscillates around 100, not around 0.',
    },
    source: {
      url: 'https://www.dnse.com.vn/hoc/momentum-la-gi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q236',
    formulaId: 'dong-luong-momentum',
    format: 'chon-nhieu',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Theo một danh sách sai lầm thường gặp khi dùng chỉ báo Momentum (MOM), những cách dùng nào dưới đây là sai lầm? Chọn đủ.',
      en: 'According to a list of common mistakes with the Momentum indicator (MOM), which of the following are mistakes? Select all that apply.',
    },
    choices: {
      a: {
        vi: 'Dùng cả MOM lẫn RSI cho cùng một quyết định rồi coi đó là hai xác nhận độc lập',
        en: 'Using both MOM and RSI for the same decision and treating them as two independent confirmations',
      },
      b: {
        vi: 'Đổi chu kỳ n sau mỗi lệnh thua để tìm chu kỳ mà lẽ ra đã thắng',
        en: 'Changing the lookback period n after each losing trade to find the one that would have worked',
      },
      c: {
        vi: 'Coi mọi lần MOM cắt qua đường 0 là một tín hiệu vào lệnh',
        en: 'Treating every MOM cross of the zero line as an entry signal',
      },
      d: {
        vi: 'Đọc MOM dương là giá hiện tại cao hơn giá n phiên trước',
        en: "Reading a positive MOM as today's price being above the price n sessions ago",
      },
    },
    answers: ['a', 'b', 'c'],
    explain: {
      vi: 'Ba lựa chọn đầu là ba mục riêng trong danh sách sai lầm của nguồn. Về RSI: “If you use both MOM and RSI for the same decision, you may think you have two independent confirmations when you actually have two views of the same underlying data.” Về đổi chu kỳ: “It is tempting to change your lookback period after a losing trade to find one that would have worked. This is curve fitting.” Về cắt đường 0: “In sideways markets, MOM will cross zero repeatedly without leading to any sustained move.” Còn (d) là cách đọc đúng của công thức hiệu số: MOM > 0 nghĩa là giá hôm nay cao hơn giá n phiên trước.',
      en: "The first three are separate items on the source's list of mistakes. On RSI: “If you use both MOM and RSI for the same decision, you may think you have two independent confirmations when you actually have two views of the same underlying data.” On changing the period: “It is tempting to change your lookback period after a losing trade to find one that would have worked. This is curve fitting.” On zero-line crosses: “In sideways markets, MOM will cross zero repeatedly without leading to any sustained move.” Option (d) is simply the correct reading of the difference formula: MOM > 0 means today's close is above the close n sessions ago.",
    },
    source: {
      url: 'https://trendsandbreakouts.com/momentum-indicator',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q122',
    formulaId: 'khoang-cach-gia-so-sma',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Giá đã lệch rất xa xuống dưới SMA200. Suy luận “thế nào cũng hồi về trung bình” sai ở đâu?',
    },
    choices: {
      a: { vi: 'SMA200 quá dài' },
      b: {
        vi: 'Thị trường không có nghĩa vụ quay lại mức giá cũ — trong xu hướng giảm mạnh giá vẫn giảm tiếp dù đã rẻ',
      },
      c: { vi: 'Phải dùng EMA thay SMA' },
      d: { vi: 'Cần chờ đủ 200 phiên' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn tiếng Việt: “thị trường không có nghĩa vụ phải quay lại mức giá cũ chỉ vì nhà đầu tư đang lỗ”, và “nếu không có điểm dừng lỗ, một giao dịch Mean Reversion sai có thể biến thành khoản kẹt hàng dài hạn”.',
    },
    source: {
      url: 'https://trading.com.vn/blog/mean-reversion-la-gi-va-vi-sao-nhieu-nguoi-dung-sai',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q237',
    formulaId: 'khoang-cach-gia-so-sma',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một nghiên cứu trên cổ phiếu S&P 1500 giai đoạn 1999–2017 xếp cổ phiếu theo khoảng cách phần trăm giữa giá và SMA rồi đo lợi suất của các kỳ nắm giữ sau đó. Với SMA 20 và SMA 50, vùng khoảng cách nào cho lợi suất cao nhất?',
      en: 'A study of S&P 1500 stocks over 1999–2017 sorted stocks by the percentage distance between price and the SMA, then measured returns over subsequent holding periods. For the 20-day and 50-day SMA, which distance band produced the highest returns?',
    },
    choices: {
      a: {
        vi: 'Từ 0 đến 5 % dưới đường trung bình',
        en: 'Between 0 and 5 % below the moving average',
      },
      b: {
        vi: 'Xa nhất dưới đường, dưới −10 %, vì càng rẻ càng tốt',
        en: 'Furthest below the line, under −10 %, because cheaper is better',
      },
      c: {
        vi: 'Trên 10 % phía trên đường, vì giá đang có đà',
        en: 'More than 10 % above the line, because price has momentum',
      },
      d: {
        vi: 'Đúng bằng đường trung bình, khoảng cách 0 %',
        en: 'Exactly on the moving average, distance 0 %',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Kết luận của nghiên cứu: “the range of 0-5% below shorter term MA of 20 and 50 comes up as the winner; and somewhat less convincingly, the range of 0-10% below the intermediate and long-term MA of 100 and 200. But, perhaps more interestingly and unexpectedly, buying very far below almost all MA in almost all holding periods turns out to be the worst possible option.” Nhóm nằm sâu dưới đường (dưới −10 % so với SMA 20/50) không hồi về mà tiếp tục giảm nên là nhóm tệ nhất; nhóm nằm trên đường nói chung kém nhóm nằm dưới. Lưu ý nghiên cứu chưa tính phí giao dịch và chỉ trên thị trường Mỹ, nên đây là bằng chứng về cách đọc con số, không phải quy tắc mua.',
      en: "The study's conclusion: “the range of 0-5% below shorter term MA of 20 and 50 comes up as the winner; and somewhat less convincingly, the range of 0-10% below the intermediate and long-term MA of 100 and 200. But, perhaps more interestingly and unexpectedly, buying very far below almost all MA in almost all holding periods turns out to be the worst possible option.” Stocks deep below the line (under −10 % versus the 20/50 SMA) did not revert but kept falling, making them the worst group; stocks above the line generally trailed those below. Note the study ignores transaction costs and covers only the US market, so it is evidence about how to read the number, not a buy rule.",
    },
    source: {
      url: 'https://ijecm.co.uk/wp-content/uploads/2017/12/5123.pdf',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q238',
    formulaId: 'khoang-cach-gia-so-sma',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Mã A: giá 100.000 ₫, SMA 20 = 95.000 ₫. Mã B: giá 20.000 ₫, SMA 20 = 18.500 ₫. Mã nào đang giãn xa đường trung bình hơn?',
      en: 'Stock A: price 100,000 ₫, 20-session SMA = 95,000 ₫. Stock B: price 20,000 ₫, 20-session SMA = 18,500 ₫. Which stock is stretched further from its moving average?',
    },
    choices: {
      a: {
        vi: 'Mã A, vì cách đường 5.000 ₫ so với 1.500 ₫ của B',
        en: 'Stock A, because it sits 5,000 ₫ above the line versus 1,500 ₫ for B',
      },
      b: {
        vi: 'Mã B, vì khoảng cách quy ra phần trăm là 8,1 % so với 5,3 % của A',
        en: 'Stock B, because the distance in percent is 8.1 % versus 5.3 % for A',
      },
      c: {
        vi: 'Hai mã như nhau, vì cùng nằm trên SMA 20',
        en: 'Both the same, since both are above their 20-session SMA',
      },
      d: {
        vi: 'Không so được vì thị giá hai mã khác nhau',
        en: 'They cannot be compared because the two stocks trade at different price levels',
      },
    },
    answer: 'b',
    explain: {
      vi: 'A: (100.000 ÷ 95.000 − 1) × 100 ≈ 5,26 %. B: (20.000 ÷ 18.500 − 1) × 100 ≈ 8,11 %. Hiệu số bằng đồng bị thị giá kéo lệch: 5.000 ₫ trên nền giá 100.000 ₫ là ít hơn 1.500 ₫ trên nền 20.000 ₫. Công thức chia cho SMA rồi nhân 100 chính là để so được giữa các mã: “Because the distance is a percentage rather than points, readings are comparable across instruments and across price levels in a way raw price-minus-average measures are not.”',
      en: 'A: (100,000 ÷ 95,000 − 1) × 100 ≈ 5.26 %. B: (20,000 ÷ 18,500 − 1) × 100 ≈ 8.11 %. The gap in currency is distorted by the price level: 5,000 ₫ on a 100,000 ₫ base is less than 1,500 ₫ on a 20,000 ₫ base. Dividing by the SMA and multiplying by 100 is exactly what makes stocks comparable: “Because the distance is a percentage rather than points, readings are comparable across instruments and across price levels in a way raw price-minus-average measures are not.”',
    },
    source: {
      url: 'https://www.luxalgo.com/library/concept/disparity-index/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q239',
    formulaId: 'khoang-cach-gia-so-sma',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Khoảng cách giá so với SMA đang dương và vượt ngưỡng “quá mua” bạn tự đặt. Theo StockCharts (bài Moving Average Envelopes), những trường hợp nào khiến số đọc này KHÔNG đáng tin cậy để bán?',
      en: 'The price distance from the SMA is positive and above the “overbought” threshold you set. According to StockCharts (Moving Average Envelopes), in which cases is this reading NOT a reliable sell signal?',
    },
    choices: {
      a: {
        vi: 'Xu hướng tăng đang mạnh: giá có thể vượt ngưỡng trên rồi tiếp tục nằm trên đó nhiều phiên',
        en: 'A strong uptrend is under way: price can move above the upper threshold and stay there for many sessions',
      },
      b: {
        vi: 'Mã biến động mạnh mà ngưỡng lại đặt hẹp: mã như vậy cần dải rộng hơn mới bao được phần lớn dao động giá',
        en: 'A highly volatile stock with a narrow threshold: such a stock needs wider bands to encompass most of its price action',
      },
      c: {
        vi: 'SMA được tính từ giá đóng cửa thay vì giá trung bình trong phiên',
        en: "The SMA is computed from closing prices rather than the session's average price",
      },
      d: {
        vi: 'Khoảng cách được đo bằng phần trăm thay vì bằng đồng',
        en: 'The distance is measured in percent rather than in currency',
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: 'StockCharts: “In a strong uptrend, prices often move above the upper envelope and continue above this line.” và số đọc quá mua khi đó có thể là dấu hiệu sức mạnh, vì thế “overbought and oversold readings are best used when the trend flattens”. Về ngưỡng: “Securities with high volatility will require wider bands to encompass most price action.”, tức một ngưỡng hẹp áp lên mã biến động mạnh sẽ báo quá mua liên tục mà không có gì bất thường. Giá đóng cửa là đầu vào chuẩn của SMA, còn đo bằng phần trăm chính là điều làm con số so sánh được; hai chi tiết đó không làm số đọc kém tin cậy.',
      en: 'StockCharts: “In a strong uptrend, prices often move above the upper envelope and continue above this line.”, and an overbought reading there can be a sign of strength, which is why “overbought and oversold readings are best used when the trend flattens”. On thresholds: “Securities with high volatility will require wider bands to encompass most price action.”, so a narrow threshold applied to a volatile stock keeps flagging overbought with nothing unusual going on. Closing prices are the standard SMA input, and measuring in percent is exactly what makes the number comparable; neither detail weakens the reading.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-average-envelopes',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q240',
    formulaId: 'khoang-cach-gia-so-sma',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Năm giá đóng cửa gần nhất của một mã, từ cũ đến mới, là 19.500, 20.000, 20.500, 21.000 và 22.000 ₫. Công thức tính khoảng cách của giá phiên cuối so với SMA 5 phiên đã dựng sẵn dưới đây, viết dưới dạng nhân chéo: giá phiên cuối nhân số phiên, chia cho tổng năm giá. Điền giá phiên cuối và số phiên của đường trung bình vào đúng ô trống.',
      en: "A stock's last five closing prices, oldest to newest, are 19,500, 20,000, 20,500, 21,000 and 22,000 ₫. The formula for the distance of the last close from the 5-session SMA is laid out below as a cross-multiplication: the last close times the period, over the sum of the five prices. Put the last close and the moving average's period into the right slots.",
    },
    facts: [
      {
        label: {
          vi: 'Giá đóng cửa 5 phiên gần nhất (cũ → mới)',
          en: 'Last five closing prices (oldest → newest)',
        },
        value: {
          vi: '19.500 · 20.000 · 20.500 · 21.000 · 22.000 ₫',
          en: '19,500 · 20,000 · 20,500 · 21,000 · 22,000 ₫',
        },
      },
      {
        label: { vi: 'Số phiên của đường trung bình (n)', en: 'Moving average period (n)' },
        value: { vi: '5 phiên', en: '5 sessions' },
      },
      {
        label: { vi: 'Giá phiên cuối (P_t)', en: 'Last close (P_t)' },
        value: { vi: '22.000 ₫', en: '22,000 ₫' },
      },
    ],
    expected: 6.796,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Khoảng cách = ([22.000] × [5] ÷ (19.500 + 20.000 + 20.500 + 21.000 + 22.000) − 1) × 100',
      en: 'Gap = ([22000] × [5] ÷ (19500 + 20000 + 20500 + 21000 + 22000) − 1) × 100',
    },
    explain: {
      vi: 'SMA 5 = (19.500 + 20.000 + 20.500 + 21.000 + 22.000) ÷ 5 = 103.000 ÷ 5 = 20.600 ₫. Khoảng cách = (22.000 ÷ 20.600 − 1) × 100 ≈ 6,80 %. Mẫu số là đường trung bình chứ không phải giá hiện tại: chia cho 22.000 sẽ ra 6,36 %, còn tính SMA bỏ sót phiên cuối sẽ ra 8,64 %, cả hai đều sai quy ước. Titan FX nêu rõ: “BIAS is calculated by dividing the difference between the current price and the Moving Average Price of a specific interval by the Moving Average Price, usually expressed as a percentage.”',
      en: '5-session SMA = (19,500 + 20,000 + 20,500 + 21,000 + 22,000) ÷ 5 = 103,000 ÷ 5 = 20,600 ₫. Distance = (22,000 ÷ 20,600 − 1) × 100 ≈ 6.80 %. The denominator is the moving average, not the current price: dividing by 22,000 gives 6.36 %, and an SMA that leaves out the last session gives 8.64 %, both against the convention. Titan FX states it plainly: “BIAS is calculated by dividing the difference between the current price and the Moving Average Price of a specific interval by the Moving Average Price, usually expressed as a percentage.”',
    },
    giai: {
      tinh: { vi: 'Khoảng cách giá so với SMA', en: 'Price distance from SMA' },
      thaySo: {
        vi: '(22.000 × 5 ÷ (19.500 + 20.000 + 20.500 + 21.000 + 22.000) − 1) × 100',
        en: '(22000 × 5 ÷ (19500 + 20000 + 20500 + 21000 + 22000) − 1) × 100',
      },
      ketQua: { vi: '6,8 %', en: '6.8 %' },
      gan: [
        {
          kyHieu: 'P_t',
          moTa: { vi: 'là giá phiên cuối: 22.000 ₫', en: 'is the last session’s close: 22000 ₫' },
        },
        { kyHieu: 'n', moTa: { vi: 'là 5 phiên', en: 'is 5 sessions' } },
        {
          kyHieu: 'SMA_n',
          moTa: {
            vi: 'là trung bình 5 giá đóng cửa 19.500, 20.000, 20.500, 21.000 và 22.000 ₫',
            en: 'is the average of the 5 closes 19500, 20000, 20500, 21000 and 22000 ₫',
          },
        },
      ],
    },
    source: {
      url: 'https://research.titanfx.com/technical-analysis/ma/bias',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q123',
    formulaId: 'do-bien-dong-lich-su',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Biến động lịch sử của cổ phiếu tăng mạnh. Điều này nói gì về hướng giá?' },
    choices: {
      a: { vi: 'Giá sắp giảm' },
      b: { vi: 'Không gì cả — HV chỉ đo mức lệch khỏi trung bình, tức bất định tăng' },
      c: { vi: 'Giá sắp tăng' },
      d: { vi: 'Xu hướng sắp đảo chiều' },
    },
    answer: 'b',
    explain: {
      vi: 'Không nói gì về hướng giá. Biến động lịch sử chỉ đo biên độ dao động quanh mức trung bình, nên biến động tăng mạnh nghĩa là giá đang dao động rộng hơn bình thường, có thể rộng lên hoặc rộng xuống. Fidelity: “Historical Volatility does not measure direction; it measures how much the securities price is deviating from its average”.',
      en: 'Nothing about direction. Historical volatility measures only the size of the swings around the average, so a jump in it means price is ranging more widely than usual, upward or downward alike. Fidelity: “Historical Volatility does not measure direction; it measures how much the securities price is deviating from its average”.',
    },
    source: {
      url: 'https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/historical-volatility',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q124',
    formulaId: 'do-bien-dong-lich-su',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Cùng mã, cùng tham số nhưng hai phần mềm cho biến động lịch sử khác nhau. Điều quan trọng nhất là gì?',
    },
    choices: {
      a: { vi: 'Tìm ra số đúng duy nhất' },
      b: {
        vi: 'Dùng NHẤT QUÁN một bộ quy ước — mẫu chia n−1 hay n, quy năm 252 hay 262, cửa sổ 20 hay 21',
      },
      c: { vi: 'Lấy trung bình hai số' },
      d: { vi: 'Dùng số cao hơn cho an toàn' },
    },
    answer: 'b',
    explain: {
      vi: 'Điều quan trọng nhất là dùng NHẤT QUÁN một bộ tham số, chứ không phải tìm ra con số nào đúng: mỗi nơi có thể dùng một biến thể công thức khác nhau, nên cùng mã và cùng cài đặt vẫn ra số khác. “different sources may use slightly different historical volatility formulas, so you can get different values for the same asset with the same settings”, và “It is not that important whether you use 20 or 21 days, or 252 or 262 days. It is much more important to use the same parameters consistently”.',
      en: 'What matters is using one set of parameters CONSISTENTLY, not hunting for the single correct number: different providers use slightly different variants of the formula, so the same asset on the same settings still prints different values. The source: “different sources may use slightly different historical volatility formulas, so you can get different values for the same asset with the same settings”, and “It is not that important whether you use 20 or 21 days, or 252 or 262 days. It is much more important to use the same parameters consistently”.',
    },
    source: {
      url: 'https://www.macroption.com/historical-volatility-calculation/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q308',
    formulaId: 'do-bien-dong-lich-su',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một mã cho 5 lợi suất log liên tiếp (đã tính sẵn, đơn vị %) ở bảng dưới. Công thức độ biến động lịch sử năm hoá đã dựng sẵn — chia cho n−1 khi tính ĐỘ LỆCH CHUẨN MẪU, rồi nhân với căn bậc hai của số phiên một năm (N = 252). Điền năm lợi suất vào đúng thứ tự các ô trống.',
      en: "A stock's five consecutive log returns (already computed, in %) are in the table below. The annualized historical volatility formula is laid out — dividing by n−1 for the SAMPLE standard deviation, then multiplying by the square root of the number of trading sessions per year (N = 252). Put the five returns into the slots in the right order.",
    },
    facts: [
      {
        label: {
          vi: '5 lợi suất log liên tiếp (phiên cũ → mới)',
          en: 'Five consecutive log returns (oldest → newest)',
        },
        value: { vi: '1,5%; −2,0%; 0,5%; −1,0%; 1,0%', en: '1.5%; −2.0%; 0.5%; −1.0%; 1.0%' },
      },
      {
        label: { vi: 'Số phiên giao dịch một năm (N)', en: 'Trading sessions per year (N)' },
        value: { vi: '252 phiên', en: '252 sessions' },
      },
    ],
    expected: 23.14,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%/năm', en: '%/year' },
    worked: {
      vi: 'σ năm = √((([1,5] − 0)^2 + ([−2,0] − 0)^2 + ([0,5] − 0)^2 + ([−1,0] − 0)^2 + ([1,0] − 0)^2) ÷ (5 − 1)) × √252',
      en: 'Annual σ = √((([1.5] − 0)^2 + ([−2.0] − 0)^2 + ([0.5] − 0)^2 + ([−1.0] − 0)^2 + ([1.0] − 0)^2) ÷ (5 − 1)) × √252',
    },
    explain: {
      vi: 'Trung bình 5 lợi suất bằng 0, nên tổng bình phương độ lệch = tổng bình phương lợi suất = 1,5² + 2,0² + 0,5² + 1,0² + 1,0² = 8,5 (%²). Vì đây là ĐỘ LỆCH CHUẨN MẪU nên chia cho n−1 = 4, không phải n = 5: phương sai mẫu = 8,5 ÷ 4 = 2,125 (%²) → độ lệch chuẩn mẫu ≈ 1,4577%/phiên. Quy năm: 1,4577% × √252 ≈ 1,4577 × 15,8745 ≈ 23,14%/năm. Nếu lỡ chia cho n (coi như tổng thể) sẽ ra phương sai 1,70 (%²), độ lệch chuẩn 1,3038%, quy năm chỉ còn 20,70%/năm — sai quy ước. Macroption nêu rõ: “We are dividing by n - 1 rather than n, as we are calculating sample standard deviation”.',
      en: 'The mean of the five returns is 0, so the sum of squared deviations equals the sum of squared returns: 1.5² + 2.0² + 0.5² + 1.0² + 1.0² = 8.5 (%²). Because this is the SAMPLE standard deviation, divide by n−1 = 4, not n = 5: sample variance = 8.5 ÷ 4 = 2.125 (%²) → sample standard deviation ≈ 1.4577%/session. Annualizing: 1.4577% × √252 ≈ 1.4577 × 15.8745 ≈ 23.14%/year. Dividing by n instead (as if it were a population) gives a variance of 1.70 (%²), a standard deviation of 1.3038%, and only 20.70%/year once annualized — against the convention. Macroption states it plainly: “We are dividing by n - 1 rather than n, as we are calculating sample standard deviation”.',
    },
    giai: {
      tinh: { vi: 'Độ biến động lịch sử năm hoá', en: 'Annualized historical volatility' },
      thaySo: {
        vi: '√(((1,5 − 0)^2 + (−2,0 − 0)^2 + (0,5 − 0)^2 + (−1,0 − 0)^2 + (1,0 − 0)^2) ÷ (5 − 1)) × √252',
        en: '√(((1.5 − 0)^2 + (−2.0 − 0)^2 + (0.5 − 0)^2 + (−1.0 − 0)^2 + (1.0 − 0)^2) ÷ (5 − 1)) × √252',
      },
      ketQua: { vi: '23,14 %/năm', en: '23.14 %/year' },
      gan: [
        {
          kyHieu: '\\ln \\frac{P_t}{P_{t-1}}',
          moTa: {
            vi: 'là lợi suất log của 5 phiên liên tiếp, từ cũ tới mới: 1,5%, −2,0%, 0,5%, −1,0% và 1,0%',
            en: 'is the log return of 5 consecutive sessions, oldest first: 1.5%, −2.0%, 0.5%, −1.0% and 1.0%',
          },
        },
        { kyHieu: 'N', giaTri: { vi: '252', en: '252' } },
      ],
    },
    source: {
      url: 'https://www.macroption.com/historical-volatility-calculation/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q309',
    formulaId: 'do-bien-dong-lich-su',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Giá một cổ phiếu tăng từ 100.000 ₫ lên 150.000 ₫ trong một phiên biến động mạnh (lợi suất đơn giản = 50%). Công thức Độ biến động lịch sử năm hoá lấy đầu vào là lợi suất LOG, tức ln(P_t ÷ P_{t-1}). Lợi suất log của phiên này, tính theo %, là bao nhiêu?',
      en: "A stock's price rises from 100,000 ₫ to 150,000 ₫ in one sharply volatile session (simple return = 50%). The Annualized historical volatility formula takes the LOG return as its input, i.e. ln(P_t ÷ P_{t-1}). What is this session's log return, in %?",
    },
    facts: [
      {
        label: {
          vi: 'Giá đóng cửa phiên trước (P_{t-1})',
          en: "Previous session's closing price (P_{t-1})",
        },
        value: { vi: '100.000 ₫', en: '100,000 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên này (P_t)', en: "This session's closing price (P_t)" },
        value: { vi: '150.000 ₫', en: '150,000 ₫' },
      },
    ],
    choices: {
      a: { vi: '50,00%', en: '50.00%' },
      b: { vi: '40,55%', en: '40.55%' },
      c: { vi: '33,33%', en: '33.33%' },
      d: { vi: '0,41%', en: '0.41%' },
    },
    answer: 'b',
    explain: {
      vi: 'Lợi suất đơn giản = 150.000 ÷ 100.000 − 1 = 50%. Nhưng công thức Độ biến động lịch sử lấy lợi suất LOG: ln(150.000 ÷ 100.000) = ln(1,5) ≈ 0,405465, tức 40,55% — KHÔNG phải 50%. Đây đúng là ví dụ nguồn đưa ra: “a 50% simple return is a 40.5% log return”. Với biến động nhỏ, hai loại lợi suất gần bằng nhau, nhưng ở một phiên biến động mạnh như thế này khoảng cách trở nên đáng kể; nguồn cảnh báo thêm: “Mixing conventions in a single calculation is one of the more common sources of error in performance analysis” — nếu lỡ đưa lợi suất đơn giản 50% vào thay vì 40,55%, độ lệch chuẩn và độ biến động năm hoá sẽ bị thổi phồng. Ba đáp án còn lại là ba lỗi hay gặp: 50,00% là lợi suất ĐƠN GIẢN, đúng thứ công thức này không nhận; 33,33% là tính ngược, lấy phần tăng chia cho giá sau thay vì giá trước; 0,41% là quên nhân 100 để đổi ra phần trăm.',
      en: "The simple return is 150,000 ÷ 100,000 − 1 = 50%. But the Annualized historical volatility formula takes the LOG return: ln(150,000 ÷ 100,000) = ln(1.5) ≈ 0.405465, i.e. 40.55% — NOT 50%. This is exactly the source's own example: “a 50% simple return is a 40.5% log return.” For small moves the two conventions are nearly identical, but for a sharply volatile session like this one the gap becomes meaningful; the source further warns that “Mixing conventions in a single calculation is one of the more common sources of error in performance analysis” — feeding the simple 50% return in by mistake, instead of 40.55%, would inflate the standard deviation and, with it, the annualized volatility. The other three are common slips: 50.00% is the SIMPLE return, exactly what this formula does not take; 33.33% works backwards, dividing the gain by the ending price instead of the starting one; 0.41% forgets the ×100 that turns the figure into a percentage.",
    },
    source: {
      url: 'https://www.pfolio.io/academy/log-vs-simple-returns',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q125',
    formulaId: 'ty-le-khoi-luong',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Phiên có khối lượng gấp 4 lần trung bình nhưng giá không tiến, đóng cửa đỏ. Thường là dấu hiệu gì?',
    },
    choices: {
      a: { vi: 'Dòng tiền vào mạnh, nên mua' },
      b: { vi: 'Thường đánh dấu vùng đỉnh' },
      c: { vi: 'Không có ý nghĩa' },
      d: { vi: 'Sắp có tin tốt' },
    },
    answer: 'b',
    explain: {
      vi: "Thường là dấu hiệu phân phối ở vùng đỉnh: lực mua rất lớn nhưng giá không tiến được, tức có bên bán đủ mạnh hấp thụ hết. Khối lượng đo mức độ quan tâm chứ không đo chiều, nên một mình nó không báo hướng. “high volume alone doesn't predict direction”; khối lượng là “intensity of interest, not sentiment”; và “a day with 4x normal volume but no price progress—or worse, a reversal day with volume spike and red candle—often marks a top”. Vẫn phải loại trừ trường hợp khối lượng vọt chỉ vì quỹ chỉ số cơ cấu danh mục.",
      en: "Usually distribution near a top: buying interest is heavy yet price cannot advance, meaning sellers are absorbing all of it. Volume measures intensity of interest, not direction, so on its own it forecasts nothing. The source: “high volume alone doesn't predict direction”; volume is “intensity of interest, not sentiment”; and “a day with 4x normal volume but no price progress—or worse, a reversal day with volume spike and red candle—often marks a top”. One case still has to be ruled out: a spike caused purely by index funds rebalancing.",
    },
    source: {
      url: 'https://www.investing.com/academy/trading/volume-spike-stock-move-definition/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q310',
    formulaId: 'ty-le-khoi-luong',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một trader trong ngày đang lọc cổ phiếu theo RVOL trước khi vào lệnh. Theo ChartSchool của StockCharts, RVOL vượt mức nào thường được nhiều day trader dùng làm ngưỡng đáng chú ý?',
      en: "A day trader is screening stocks by RVOL before entering a position. According to StockCharts' ChartSchool, what RVOL level do many day traders commonly use as a threshold worth watching?",
    },
    choices: {
      a: { vi: 'Khoảng 0,5 lần', en: 'About 0.5x' },
      b: { vi: 'Đúng bằng 1,0 lần', en: 'Exactly 1.0x' },
      c: { vi: 'Trên khoảng 2,0 lần', en: 'Above about 2.0x' },
      d: { vi: 'Chỉ khi vượt 10 lần', en: 'Only above 10x' },
    },
    answer: 'c',
    explain: {
      vi: '“Many day traders look for an RVOL over 2.0 before investing.” — 2,0 lần là ngưỡng nhiều trader trong ngày dùng làm bộ lọc trước khi vào lệnh, không phải một con số tuỳ ý, và không cần chờ tới mức cực đoan (4 lần trở lên) mới đáng để ý.',
      en: '“Many day traders look for an RVOL over 2.0 before investing.” — 2.0x is the threshold many day traders use as a screening filter before entering, not an arbitrary figure, and one need not wait for an extreme reading (4x or above) to start watching.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/relative-volume-rvol',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q311',
    formulaId: 'ty-le-khoi-luong',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Phiên giao dịch ngay trước một kỳ nghỉ lễ dài thường có khối lượng khớp lệnh giảm hẳn dù thị trường không có gì bất thường. Đọc RVOL của đúng phiên áp lễ đó cần lưu ý điều gì?',
      en: 'The session right before a long holiday typically sees matched volume drop sharply even though nothing unusual is happening in the market. What should you keep in mind when reading RVOL for that pre-holiday session?',
    },
    choices: {
      a: {
        vi: 'RVOL thấp bất thường hôm đó chắc chắn phản ánh dòng tiền đang rút khỏi thị trường',
        en: 'The unusually low RVOL that day certainly reflects money flowing out of the market',
      },
      b: {
        vi: 'Cần thận trọng — mức trung bình dùng để so sánh vẫn gồm các phiên bình thường trước đó, nên chỉ số dễ đọc sai lệch vào những phiên bất thường như vậy',
        en: 'Be cautious — the average used for comparison still consists of normal sessions, so the ratio can be misread on such atypical days',
      },
      c: {
        vi: 'Không có vấn đề gì, vì RVOL tự động loại phiên áp lễ ra khỏi phép tính',
        en: 'No issue at all, since RVOL automatically excludes the pre-holiday session from the calculation',
      },
      d: {
        vi: 'Hiện tượng này chỉ xảy ra với cổ phiếu vốn hoá lớn',
        en: 'This only happens with large-cap stocks',
      },
    },
    answer: 'b',
    explain: {
      vi: '“On low-volume days (such as the day before a holiday), RVOL can be misleading because the average it compares against includes normal-volume days.” — bản thân phép chia không sai, nhưng vì mẫu số (mức trung bình) vẫn là các phiên bình thường, tỷ lệ tính ra đúng vào phiên bất thường (áp lễ) dễ bị đọc nhầm thành tín hiệu thực.',
      en: '“On low-volume days (such as the day before a holiday), RVOL can be misleading because the average it compares against includes normal-volume days.” — the division itself is not wrong, but because the denominator (the average) still reflects normal sessions, the ratio computed on an atypical (pre-holiday) session can easily be misread as a real signal.',
    },
    source: {
      url: 'https://finwiz.io/technical-analysis/relative-volume',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q312',
    formulaId: 'ty-le-khoi-luong',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Máy quét khối lượng báo hai mã cùng đạt RVOL 5:1: mã A có khối lượng trung bình 60 phiên chỉ 100.000 cổ phiếu/ngày, mã B có khối lượng trung bình 60 phiên là 1.000.000 cổ phiếu/ngày. Theo bài viết của Timothy Sykes, những phát biểu nào dưới đây đúng?',
      en: "A volume scanner flags two tickers both hitting a 5:1 RVOL: ticker A averages only 100,000 shares/day over the last 60 sessions, ticker B averages 1,000,000 shares/day over the last 60 sessions. According to Timothy Sykes' article, which of the following statements are correct?",
    },
    choices: {
      a: {
        vi: 'Mã A quy đổi ra chỉ khoảng 500.000 cổ phiếu phiên đó — theo tác giả vẫn chưa đủ khối lượng để giao dịch nghiêm túc',
        en: 'Ticker A converts to only about 500,000 shares that session — per the author, still not enough volume for serious trading',
      },
      b: {
        vi: 'Mã B quy đổi ra khoảng 5 triệu cổ phiếu phiên đó — tác giả cho đây là mức đáng quan tâm hơn hẳn',
        en: 'Ticker B converts to about 5 million shares that session — the author calls this level far more interesting',
      },
      c: {
        vi: 'Vì cùng tỷ lệ RVOL 5:1 nên hai mã đáng tin như nhau khi đánh giá thanh khoản',
        en: 'Because both tickers share the same 5:1 RVOL, they are equally trustworthy for judging liquidity',
      },
      d: {
        vi: 'RVOL chỉ có ý nghĩa khi tính đúng trên 60 phiên như trong hai ví dụ',
        en: 'RVOL is only meaningful when computed over exactly 60 sessions, as in both examples',
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: "Trích nguyên văn: “Say a stock has traded an average volume of 100,000 shares a day over the last 60 days. Then it pops up on your relative volume scanner with an RVOL of 5:1. Sounds like high relative volume, right? Not really. That ratio means it only traded 500,000 shares that day. That's not enough volume for me.”; và “Say a stock traded an average of a million shares daily over the last 60 days. If it shows up on your relative volume scanner with an RVOL of 5:1, that's 5 million shares in volume. Now, that's a stock I'm more interested in.” Cùng một tỷ lệ RVOL nhưng quy đổi ra khối lượng tuyệt đối khác xa nhau, nên tỷ lệ không thể đứng một mình để đánh giá thanh khoản thực — phải nhân ngược lại ra số cổ phiếu.",
      en: "Verbatim: “Say a stock has traded an average volume of 100,000 shares a day over the last 60 days. Then it pops up on your relative volume scanner with an RVOL of 5:1. Sounds like high relative volume, right? Not really. That ratio means it only traded 500,000 shares that day. That's not enough volume for me.”; and “Say a stock traded an average of a million shares daily over the last 60 days. If it shows up on your relative volume scanner with an RVOL of 5:1, that's 5 million shares in volume. Now, that's a stock I'm more interested in.” The same RVOL ratio converts into very different absolute volumes, so the ratio alone cannot judge real liquidity — it has to be multiplied back into a share count.",
    },
    source: {
      url: 'https://www.timothysykes.com/blog/relative-volume/',
      kind: 'trai-nghiem',
      vietnam: false,
    },
  },
  {
    id: 'Q313',
    formulaId: 'ty-le-khoi-luong',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Theo TradingSim, một cổ phiếu thường giao dịch trung bình 300.000 cổ phiếu mỗi ngày. Vào một phiên, khối lượng khớp lệnh vọt lên 1.000.000 cổ phiếu. Điền hai con số ấy vào đúng ô trống của công thức tỷ lệ khối lượng (RVOL) dưới đây.',
      en: 'According to TradingSim, a stock typically trades an average of 300,000 shares per day. In one session, matched volume jumps to 1,000,000 shares. Put those two figures into the right slots of the relative volume (RVOL) formula below.',
    },
    facts: [
      {
        label: { vi: 'Khối lượng trung bình mỗi ngày', en: 'Average daily volume' },
        value: { vi: '300.000 cổ phiếu', en: '300,000 shares' },
      },
      {
        label: {
          vi: 'Khối lượng khớp của phiên đang xét',
          en: 'Matched volume of the session in question',
        },
        value: { vi: '1.000.000 cổ phiếu', en: '1,000,000 shares' },
      },
    ],
    expected: 3.33,
    tolerance: { kind: 'tuyet-doi', value: 0.03 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'RVOL = [1.000.000] ÷ [300.000]',
      en: 'RVOL = [1000000] ÷ [300000]',
    },
    explain: {
      vi: 'RVOL = khối lượng phiên ÷ khối lượng trung bình = 1.000.000 ÷ 300.000 ≈ 3,33 lần — một phép chia trực tiếp, không phải công thức phần trăm thay đổi kiểu (V − trung bình) ÷ trung bình. “if a stock typically sees an average of 300,000 shares traded per day but suddenly sees 1,000,000 shares traded in a single day, that would be considered high relative volume”.',
      en: 'RVOL = session volume ÷ average volume = 1,000,000 ÷ 300,000 ≈ 3.33x — a plain division, not a percentage-change formula like (V − average) ÷ average. “if a stock typically sees an average of 300,000 shares traded per day but suddenly sees 1,000,000 shares traded in a single day, that would be considered high relative volume”.',
    },
    giai: {
      tinh: { vi: 'Tỷ lệ khối lượng so với trung bình', en: 'Relative volume' },
      thaySo: { vi: '1.000.000 ÷ 300.000', en: '1000000 ÷ 300000' },
      ketQua: { vi: '3,33 lần', en: '3.33 x' },
      gan: [
        { kyHieu: 'V_t', giaTri: { vi: '1.000.000', en: '1000000' } },
        {
          kyHieu: '\\frac{1}{n}\\sum_{i=1}^{n} V_{t-i}',
          moTa: {
            vi: 'là khối lượng trung bình mỗi phiên: 300.000 cổ phiếu',
            en: 'is the average volume per session: 300000 shares',
          },
        },
      ],
    },
    source: {
      url: 'https://www.tradingsim.com/blog/relative-volume-rvol',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q126',
    formulaId: 'macd-duong-chinh',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Bạn bật RSI, MACD và Stochastic, cả ba cùng báo mua. Đây có phải xác nhận không?',
    },
    choices: {
      a: { vi: 'Có, ba chỉ báo đồng thuận' },
      b: { vi: 'Không — cả ba đo cùng một thuộc tính là động lượng, chỉ củng cố thiên kiến' },
      c: { vi: 'Có nếu thêm khối lượng' },
      d: { vi: 'Có trên khung tuần' },
    },
    answer: 'b',
    explain: {
      vi: 'Bài về tư duy John Bollinger trên TraderViet gọi đây là “multicollinearity”. Bài “10 sai lầm phân tích kỹ thuật” nêu dùng quá nhiều chỉ báo tạo ra “analysis paralysis” và tín hiệu xung đột. Xác nhận thật phải đến từ các LOẠI chỉ báo khác nhau: biến động, động lượng, khối lượng.',
    },
    source: {
      url: 'https://traderviet.tv/t/phan-tich-ky-thuat-khong-co-loi-loi-la-do-ban-van-co-thu-voi-10-sai-lam-nay-phan-1.99488/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q286',
    formulaId: 'macd-duong-chinh',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Đường MACD vừa cắt LÊN trên đường tín hiệu, nhưng bản thân đường MACD vẫn đang âm (dưới mốc 0). Theo StockCharts, nên đọc trạng thái này thế nào?',
      en: 'The MACD line has just crossed ABOVE its signal line, but the MACD line itself is still negative (below the zero line). According to StockCharts, how should this state be read?',
    },
    choices: {
      a: {
        vi: 'Đó là một bullish centerline crossover — đà tăng dài hạn đã được xác lập',
        en: 'It is a bullish centerline crossover — the long-term uptrend has already been established',
      },
      b: {
        vi: 'Đó là một bullish signal line crossover — khác với centerline crossover, MACD còn phải tự vượt mốc 0 mới tính là centerline crossover',
        en: 'It is a bullish signal line crossover — different from a centerline crossover; MACD still has to cross above zero itself for that to count',
      },
      c: {
        vi: 'Đó là cả hai loại giao cắt cùng lúc, vì StockCharts coi hai khái niệm là một',
        en: 'It is both crossovers at once, since StockCharts treats the two terms as the same thing',
      },
      d: {
        vi: 'Đó không phải tín hiệu gì, vì MACD còn âm nên chưa có ý nghĩa',
        en: 'It is not a signal at all, since MACD is still negative and therefore meaningless',
      },
    },
    answer: 'b',
    explain: {
      vi: 'StockCharts định nghĩa hai loại giao cắt riêng biệt: “A bullish crossover occurs when the MACD turns up and crosses above the signal line” là tín hiệu signal line, còn “A bullish centerline crossover occurs when the MACD line moves above the zero line to turn positive” là tín hiệu centerline — khác điều kiện, khác ý nghĩa. MACD cắt lên signal line trong khi còn âm mới chỉ thoả điều kiện thứ nhất; đà tăng dài hạn, đo bằng việc vượt mốc 0, vẫn chưa xác lập.',
      en: 'StockCharts defines the two crossovers separately: “A bullish crossover occurs when the MACD turns up and crosses above the signal line” describes the signal line signal, while “A bullish centerline crossover occurs when the MACD line moves above the zero line to turn positive” describes the centerline signal — different conditions, different meanings. MACD crossing above its signal line while still negative satisfies only the first condition; the long-term uptrend, measured by crossing zero, has not yet been established.',
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/macd-moving-average-convergence-divergence-oscillator',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
];
