import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `technical-trend` (`src/core/formulas/technical-trend.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_TECHNICAL_TREND: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'roc-toc-do-thay-doi': [
    {
      hoi: {
        vi: 'Biểu đồ Bloomberg tính chỉ báo Rate of Change (ROC) như thế nào, vì số hiển thị không khớp định nghĩa thông thường?',
        en: 'How does the Bloomberg website chart calculate the Rate of Change, given that the values do not match the usual definition?',
      },
      nguyenVan: 'How does the Bloomberg website chart calculate the "Rate of Change"?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/88330/how-does-the-bloomberg-website-chart-calculate-the-rate-of-change',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Đáp án được chấp nhận: người hỏi tự dò ra rằng đường "Rate of Change" trên trang Bloomberg chỉ là giá đóng cửa trừ giá đóng cửa 5 ngày trước, không phải tỷ lệ, và bỏ qua ngày không giao dịch. Trên trang này ROC là phần trăm: (giá phiên cuối ÷ giá n phiên trước − 1) × 100; phép trừ thuần là công thức Động lượng (Momentum).',
        en: 'The accepted answer: the asker worked out that the "Rate of Change" on the Bloomberg website is simply the close minus the close 5 days earlier, not a ratio, and that it skips non-trading days. On this page ROC is a percentage: (last close ÷ close n sessions earlier − 1) × 100; the plain difference is the Momentum formula.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/88330/how-does-the-bloomberg-website-chart-calculate-the-rate-of-change',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tại sao ROC 12 phiên cần tới 13 phiên giá?',
        en: 'Why does a 12-session ROC need 13 price sessions?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'ROC so giá phiên cuối với giá cách đó đúng n phiên, nên cần n + 1 giá đóng cửa: 13 giá cho ROC 12 phiên. Chuỗi chỉ có 12 phiên thì màn báo thiếu chuỗi giá. Phiên có ô giá trống hoặc bằng 0 bị bỏ qua, không được đếm.',
        en: 'ROC compares the last close with the close exactly n sessions earlier, so it needs n + 1 closes: 13 for a 12-session ROC. A series of only 12 sessions gets a missing price series message. A session whose close is blank or 0 is skipped and not counted.',
      },
    },
    {
      hoi: {
        vi: 'ROC 2,83% trong ví dụ có phải giá tăng 2,83% mỗi phiên không?',
        en: 'Does the 2.83% ROC in the example mean the price rose 2.83% every session?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. 2,83% là mức thay đổi gộp của cả 12 phiên: giá FPT đi từ 70.700 ₫ lên 72.700 ₫, còn các phiên ở giữa không vào phép tính. Vì vậy hai con số ROC chỉ so được với nhau khi cùng số phiên nhìn lại.',
        en: 'No. 2.83% is the total change over all 12 sessions: FPT went from 70,700 ₫ to 72,700 ₫, and the sessions in between do not enter the calculation. That is why two ROC figures are only comparable when they use the same number of sessions to look back.',
      },
    },
  ],
  'dong-luong-momentum': [
    {
      hoi: {
        vi: 'Động lượng (momentum) được định nghĩa bằng công thức nào, vì có nhiều cách tính khác nhau?',
        en: 'What is the definition of momentum, given that there are many different formulas?',
      },
      nguyenVan: 'The Definition(s) of Momentum',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/12950/the-definitions-of-momentum',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Không có một định nghĩa duy nhất: người hỏi tự nêu hai cách (giá cuối kỳ trừ giá đầu kỳ, hoặc hiệu của hai giá bình quân), còn các câu trả lời chỉ tới các bài nghiên cứu. Trên trang này động lượng theo Murphy: giá đóng cửa phiên cuối trừ giá đóng cửa n phiên trước, tính bằng đồng; bản quy ra phần trăm là ROC.',
        en: 'There is no single definition: the asker lists two (the last price minus the first price of the period, or the difference of two averages), and the answers point to research papers. On this page momentum follows Murphy: the last close minus the close n sessions earlier, in dong; the percentage version is ROC.',
      },
    },
    {
      hoi: {
        vi: 'Động lượng bằng 0 có nghĩa là giá đứng yên suốt n phiên không?',
        en: 'Does a momentum of 0 mean the price stood still for all n sessions?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Động lượng chỉ so hai giá: phiên cuối và phiên cách đó n phiên, các phiên ở giữa không vào phép tính. Với chuỗi FPT ví dụ, nhìn lại 2 phiên ra 72.700 − 72.700 = 0 ₫, dù phiên ở giữa giá xuống 72.400 ₫.',
        en: 'No. Momentum compares only two prices, the last session and the one n sessions earlier, and the sessions in between are left out. On the FPT example series, looking back 2 sessions gives 72,700 − 72,700 = 0 ₫, even though the price dipped to 72,400 ₫ in the session between.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao chuỗi 10 phiên chưa đủ để tính động lượng 10 phiên?',
        en: 'Why is a 10-session series not enough for a 10-session momentum?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Vì cần cả giá phiên cuối lẫn giá cách đó đúng n phiên, tức n + 1 giá đóng cửa: 11 giá cho động lượng 10 phiên. Thiếu thì màn báo thiếu chuỗi giá chứ không trả 0. Phiên có ô giá trống hoặc bằng 0 bị bỏ qua, không được đếm.',
        en: 'Because it needs both the last close and the close exactly n sessions earlier, i.e. n + 1 closes: 11 for a 10-session momentum. With fewer, the screen reports a missing price series instead of returning 0. A session whose close is blank or 0 is skipped and not counted.',
      },
    },
  ],
  'khoang-cach-gia-so-sma': [
    {
      hoi: {
        vi: 'Nếu có ngày không có giao dịch thì đường trung bình động đơn giản (SMA) được tính thế nào?',
        en: 'How is the Simple Moving Average (SMA) calculated if some days have no trades?',
      },
      nguyenVan: 'How is the Simple Moving Average (SMA) calculated if some days have no trades?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/153053/how-is-the-simple-moving-average-sma-calculated-if-some-days-have-no-trades',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời điểm cao nhất: ngày không có giao dịch bị bỏ qua như ngày nghỉ, không lấy giá bằng 0. Trang này không xét khối lượng mà xét ô giá đóng cửa: phiên có ô ấy trống hoặc bằng 0 bị bỏ, SMA lấy n phiên gần nhất còn giá. Phiên không khớp lệnh mà bảng dữ liệu vẫn ghi giá đóng cửa thì vẫn được đếm là một phiên.',
        en: 'The top-voted answer: a day with no trading is skipped like a holiday, never priced at 0. This page looks at the close cell, not at volume: a session whose close is blank or 0 is dropped, and the SMA uses the latest n sessions that have a price. A session with no matched trades whose close is still recorded in the data table is counted as a session.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/153053/how-is-the-simple-moving-average-sma-calculated-if-some-days-have-no-trades',
          ten: 'Money StackExchange',
        },
      ],
    },
    {
      hoi: {
        vi: 'SMA đem ra so có tính cả giá phiên cuối không?',
        en: 'Does the SMA being compared include the last close?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Có. SMA n phiên lấy n giá đóng cửa gần nhất, kể cả phiên cuối, nên chuỗi chỉ cần đúng n phiên. Vì giá phiên cuối nằm trong chính đường trung bình, chu kỳ rất ngắn cho khoảng cách sát 0: với FPT ví dụ, so với SMA 2 phiên chỉ còn 0,21%, so với SMA 20 phiên là 1,59%.',
        en: 'Yes. An n-session SMA takes the latest n closes, the last one included, so the series needs exactly n sessions. Because the last close sits inside the average itself, a very short period gives a distance close to 0: for the FPT example it is only 0.21% against a 2-session SMA and 1.59% against a 20-session SMA.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao đổi số phiên từ 20 sang 200 thì khoảng cách có thể đổi từ dương sang âm?',
        en: 'Why can the distance turn from positive to negative when I change the period from 20 to 200 sessions?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Mỗi chu kỳ là một mặt bằng giá khác. Với FPT ví dụ, giá 72.700 ₫ cao hơn SMA 20 phiên (71.560 ₫) 1,59% nhưng thấp hơn SMA 200 phiên (81.013 ₫) 10,26%: giá đã nhích lên trên mặt bằng 20 phiên gần đây mà vẫn dưới mặt bằng 200 phiên. Hai con số không mâu thuẫn, chúng so với hai mốc khác nhau.',
        en: 'Each period is a different price level. For the FPT example, the 72,700 ₫ price is 1.59% above the 20-session SMA (71,560 ₫) but 10.26% below the 200-session SMA (81,013 ₫): the price has moved above the level of the last 20 sessions while staying under the 200-session level. The two figures do not contradict each other; they compare against two different marks.',
      },
    },
  ],
  'sma-n-phien': [
    {
      hoi: {
        vi: 'Đường MA khác gì EMA?',
        en: 'How does an SMA differ from an EMA?',
      },
      nguyenVan: 'Đường MA khác gì EMA?',
      nguon: {
        url: 'https://www.dsc.com.vn/kien-thuc/duong-ma-la-gi',
        ten: 'DSC Câu hỏi thường gặp',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'SMA tính trung bình đều cho mọi phiên trong kỳ, còn EMA gán trọng số lớn hơn cho các phiên gần nhất nên phản ứng nhanh hơn với biến động ngắn hạn.',
        en: 'An SMA gives every session in the window equal weight, while an EMA gives more weight to the most recent sessions, so it reacts faster to short-term moves.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.dsc.com.vn/kien-thuc/duong-ma-la-gi',
          ten: 'DSC',
        },
      ],
    },
    {
      hoi: {
        vi: 'Đường MA20 và MA50 là gì?',
        en: 'What are the MA20 and MA50 lines?',
      },
      nguyenVan: 'Đường MA20 và MA50 là gì?',
      nguon: {
        url: 'https://www.dsc.com.vn/kien-thuc/duong-ma-la-gi',
        ten: 'DSC Câu hỏi thường gặp',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'MA20 là đường trung bình của 20 phiên gần nhất, MA50 là của 50 phiên gần nhất; nguồn xếp MA20 vào xu hướng ngắn hạn (khoảng một tháng giao dịch) và MA50 vào trung hạn (khoảng một quý).',
        en: 'MA20 is the average of the latest 20 sessions and MA50 of the latest 50; the source treats MA20 as short-term (about one trading month) and MA50 as medium-term (about one quarter).',
      },
      nguonTraLoi: [
        {
          url: 'https://www.dsc.com.vn/kien-thuc/duong-ma-la-gi',
          ten: 'DSC',
        },
      ],
    },
    {
      hoi: {
        vi: 'SMA có tính cả phiên cuối của chuỗi không, và cần bao nhiêu phiên?',
        en: 'Does the SMA include the last session of the series, and how many sessions does it need?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Có. SMA lấy n giá đóng cửa gần nhất của chuỗi đã nạp, phiên cuối nằm trong đó, nên chuỗi chỉ cần n phiên có giá. Với FPT ví dụ, tổng 20 giá đóng cửa đến phiên 15/09/2026 là 1.431.200 ₫, chia 20 ra 71.560 ₫. Chuỗi ít hơn n phiên có giá thì màn báo thiếu chuỗi giá.',
        en: 'Yes. The SMA takes the latest n closes of the loaded series, the last session included, so the series only needs n sessions with a price. For the FPT example, the 20 closes up to the 2026-09-15 session add up to 1,431,200 ₫, and dividing by 20 gives 71,560 ₫. A series with fewer than n priced sessions gets a missing price series message.',
      },
    },
  ],
  'ema-n-phien': [
    {
      hoi: {
        vi: 'SMA và EMA, đường nào dự báo tốt hơn?',
        en: 'Which predicts better, SMA or EMA?',
      },
      nguyenVan: 'Vậy thì SMA vs EMA cái nào dự báo tốt hơn v bạn?',
      nguon: {
        url: 'https://tinhte.vn/thread/duong-trung-binh-dong-ma-trong-phan-tich-ky-thuat-la-gi.3246368/',
        ten: 'Tinhte',
        noi: 'dien-dan',
        vietnam: true,
      },
      traLoi: {
        vi: 'Không đường nào dự báo: cả hai đều là giá bình quân của các phiên đã qua. EMA dồn trọng số cho phiên mới (hệ số k = 2 ÷ (n + 1)) nên bám giá gần đây sát hơn và đổi hướng sớm hơn, SMA chia đều cho mọi phiên nên phẳng hơn. Với FPT ví dụ, cùng 20 phiên, EMA là 71.824,93 ₫ và SMA là 71.560 ₫, trong khi giá cuối là 72.700 ₫.',
        en: 'Neither one forecasts: both are averages of past sessions. The EMA puts more weight on new sessions (factor k = 2 ÷ (n + 1)), so it follows recent prices more closely and turns sooner, while the SMA weights every session equally and is smoother. For the FPT example, over the same 20 sessions, the EMA is 71,824.93 ₫ and the SMA is 71,560 ₫, against a last close of 72,700 ₫.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao EMA 12 phiên ở đây khác ứng dụng khác dù cùng mã, cùng chu kỳ?',
        en: 'Why does the 12-session EMA here differ from another app for the same stock and period?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Một nguyên nhân là phần mồi: EMA được mồi bằng trung bình đơn của n phiên đầu chuỗi rồi làm mượt nối tiếp, nên con số phụ thuộc chuỗi bắt đầu từ đâu. Với FPT ví dụ, EMA 12 phiên tính trên 36 phiên cuối ra 72.361,31 ₫, trên 60 phiên cuối ra 72.388,85 ₫, trên cả 250 phiên ra 72.389,04 ₫. Hai nơi nạp chuỗi dài ngắn khác nhau sẽ lệch nhau như vậy.',
        en: 'One cause is the seed: the EMA is seeded with the simple average of the first n sessions of the series and then smoothed onward, so the figure depends on where the series starts. For the FPT example, the 12-session EMA on the last 36 sessions is 72,361.31 ₫, on the last 60 it is 72,388.85 ₫, and on all 250 it is 72,389.04 ₫. Two places that load series of different lengths will differ the same way.',
      },
    },
    {
      hoi: {
        vi: 'Với EMA 12 phiên, giá phiên mới nhất chiếm bao nhiêu trọng số?',
        en: 'In a 12-session EMA, how much weight does the newest price carry?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Hệ số k = 2 ÷ (12 + 1), tức 2 ÷ 13: giá phiên mới nhất chiếm 15,38%, EMA phiên trước chiếm 84,62% còn lại. Với FPT ví dụ, giá 72.700 ₫ của phiên 15/09/2026 chỉ kéo EMA từ 72.332,51 ₫ lên 72.389,04 ₫.',
        en: 'The factor k = 2 ÷ (12 + 1), i.e. 2 ÷ 13: the newest price carries 15.38% and the previous EMA the remaining 84.62%. For the FPT example, the 72,700 ₫ close of the 2026-09-15 session only moves the EMA from 72,332.51 ₫ up to 72,389.04 ₫.',
      },
    },
  ],
  'macd-duong-chinh': [
    {
      hoi: {
        vi: 'MACD dương có nghĩa là hai đường EMA đang ở vị trí nào?',
        en: 'What does a positive MACD say about the positions of the two EMAs?',
      },
      nguyenVan: 'MACD dương có nghĩa là hai đường EMA đang ở vị trí nào?',
      nguon: {
        url: 'https://www.finhay.com.vn/duong-macd',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'MACD bằng EMA nhanh trừ EMA chậm (thường là 12 và 26 phiên), nên giá trị dương nghĩa là EMA ngắn đang nằm trên EMA dài; giá trị âm thì ngược lại.',
        en: 'MACD is the fast EMA minus the slow EMA (usually 12 and 26 sessions), so a positive value means the short EMA is above the long EMA; a negative value means the reverse.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/duong-macd',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Histogram và đường MACD có dùng cùng một phép tính không?',
        en: 'Do the histogram and the MACD line use the same calculation?',
      },
      nguyenVan: 'Histogram và đường MACD có dùng cùng một phép tính không?',
      nguon: {
        url: 'https://www.finhay.com.vn/duong-macd',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Không. Đường MACD là chênh lệch giữa EMA 12 và EMA 26, còn Histogram là chênh lệch giữa MACD và đường tín hiệu.',
        en: 'No. The MACD line is the difference between EMA 12 and EMA 26, while the histogram is the difference between MACD and the signal line.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/duong-macd',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tại sao đặt Chu kỳ EMA nhanh bằng hoặc dài hơn Chu kỳ EMA chậm thì báo kết quả không có ý nghĩa?',
        en: 'Why is the result reported as meaningless when the Fast EMA period is equal to or longer than the Slow EMA period?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'MACD lấy EMA nhanh trừ EMA chậm để xem mặt bằng giá gần đây cao hay thấp hơn mặt bằng dài hơn. Hai chu kỳ bằng nhau thì hiệu luôn bằng 0, đặt ngược thì dấu dương và âm đổi nghĩa cho nhau, nên sản phẩm không tính mà báo kết quả không có ý nghĩa. Đặt chu kỳ nhanh ngắn hơn, ví dụ 12 và 26 phiên.',
        en: 'MACD subtracts the slow EMA from the fast EMA to see whether the recent price level is above or below a longer one. Equal periods always give 0, and reversed periods swap the meaning of positive and negative, so the tool does not compute and reports the result as meaningless. Set the fast period shorter, for example 12 and 26 sessions.',
      },
    },
  ],
  'macd-duong-tin-hieu': [
    {
      hoi: {
        vi: 'Vì sao tín hiệu MACD cần được kiểm tra thêm?',
        en: 'Why should MACD signals be checked against something else?',
      },
      nguyenVan: 'Vì sao tín hiệu MACD cần được kiểm tra thêm?',
      nguon: {
        url: 'https://www.finhay.com.vn/duong-macd',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Theo nguồn, MACD có ba hạn chế: có thể xuất hiện phân kỳ hoặc hội tụ giả, kết quả phụ thuộc thiết lập của người dùng và tín hiệu có độ trễ.',
        en: "According to the source, MACD has three limits: it can show false divergence or convergence, results depend on the user's settings, and signals lag.",
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/duong-macd',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tại sao đường tín hiệu cần 34 phiên giá với bộ 12/26/9?',
        en: 'Why does the signal line need 34 price sessions with the 12/26/9 set?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'MACD chỉ có từ phiên thứ 26, khi EMA 26 phiên đã đủ phần mồi. Đường tín hiệu là EMA 9 phiên của chính chuỗi MACD nên cần thêm 8 phiên: 26 + 9 − 1 = 34. Chuỗi 33 phiên thì màn báo thiếu chuỗi giá.',
        en: 'MACD only exists from the 26th session, once the 26-session EMA has its seed. The signal line is a 9-session EMA of the MACD series itself, so it needs 8 more sessions: 26 + 9 − 1 = 34. A 33-session series gets a missing price series message.',
      },
    },
    {
      hoi: {
        vi: 'Đổi Chu kỳ đường tín hiệu từ 9 sang 5 phiên thì kết quả thay đổi thế nào?',
        en: 'How does the result change if I set the Signal line period to 5 sessions instead of 9?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chu kỳ ngắn dồn trọng số cho vài giá trị MACD gần nhất, chu kỳ dài trải ra nhiều phiên hơn, nên vị trí của MACD so với đường tín hiệu có thể đổi theo chu kỳ bạn chọn. Với FPT ví dụ, MACD là 893,41 ₫: đường tín hiệu 9 phiên là 879,03 ₫, nằm dưới MACD, còn 5 phiên là 929,38 ₫, nằm trên MACD.',
        en: 'A short period weights the last few MACD values heavily and a long one spreads over more sessions, so where MACD sits against the signal line can change with the period you pick. For the FPT example, MACD is 893.41 ₫: the 9-session signal line is 879.03 ₫, below MACD, while the 5-session one is 929.38 ₫, above it.',
      },
    },
  ],
  'rsi-wilder': [
    {
      hoi: {
        vi: 'RSI dưới 30 có bảo đảm giá sẽ tăng trở lại ngay không?',
        en: 'Does an RSI below 30 guarantee the price will rebound right away?',
      },
      nguyenVan: 'RSI dưới 30 có bảo đảm giá sẽ tăng trở lại ngay không?',
      nguon: {
        url: 'https://www.finhay.com.vn/en/chi-so-rsi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Không. RSI có thể ở vùng quá bán khá lâu trong khi giá vẫn giảm hoặc phải một thời gian sau mới phục hồi.',
        en: 'No. RSI can stay in oversold territory for a long time while the price keeps falling, or recover only some time later.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/en/chi-so-rsi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Có thể điều chỉnh khoảng thời gian theo dõi RSI không?',
        en: 'Can the RSI look-back period be changed?',
      },
      nguyenVan: 'Có thể điều chỉnh khoảng thời gian theo dõi RSI không?',
      nguon: {
        url: 'https://www.finhay.com.vn/en/chi-so-rsi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Có. Ô Số phiên nhận từ 2 đến 1.000 phiên, mặc định 14 như Wilder, và chuỗi cần thêm một giá (15 giá cho RSI 14). Mỗi dòng của chuỗi là một phiên nên chu kỳ ở đây đếm bằng phiên giao dịch. Với FPT ví dụ, RSI 7 phiên là 53,92 điểm, RSI 14 phiên là 55,59 điểm, RSI 28 phiên là 52,95 điểm.',
        en: 'Yes. The Number of sessions field accepts 2 to 1,000, defaulting to 14 as Wilder used, and the series needs one more price (15 prices for RSI 14). Each row of the series is one session, so the period here counts trading sessions. For the FPT example, the 7-session RSI is 53.92 points, the 14-session RSI is 55.59 points and the 28-session RSI is 52.95 points.',
      },
    },
    {
      hoi: {
        vi: 'Phân kỳ giữa giá và RSI có ý nghĩa gì?',
        en: 'What does a divergence between price and RSI mean?',
      },
      nguyenVan: 'Phân kỳ giữa giá và RSI có ý nghĩa gì?',
      nguon: {
        url: 'https://www.finhay.com.vn/en/chi-so-rsi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Phân kỳ xuất hiện khi giá và chỉ báo đi ngược hướng nhau. Nguồn coi đó là dấu hiệu xu hướng hiện tại có thể suy yếu, và cần đọc cùng bối cảnh diễn biến giá.',
        en: 'A divergence appears when price and the indicator move in opposite directions. The source reads it as a sign the current trend may be weakening, to be read alongside price action.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/en/chi-so-rsi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Phân kỳ giả của RSI là như thế nào?',
        en: 'What is a false RSI divergence?',
      },
      nguyenVan: 'phân kỳ giả là như thế nào v bạn?',
      nguon: {
        url: 'https://voz.vn/t/rsi-la-gi-va-su-dung-nhu-the-nao-trong-phan-tich-ky-thuat.204393/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
      traLoi: {
        vi: 'Phân kỳ là khi giá đóng cửa lập đỉnh mới mà RSI không lập đỉnh mới theo (hoặc ngược lại ở đáy); gọi là giả khi sau đó giá vẫn đi tiếp theo chiều cũ. Chuyện này xảy ra được vì RSI chỉ đo trung bình tăng so với trung bình giảm đã làm mượt: một nhịp tăng nhỏ hơn nhịp trước vẫn đưa giá lên đỉnh mới trong khi RSI thấp hơn. Sản phẩm không tự đánh dấu phân kỳ.',
        en: 'A divergence is when the close makes a new high but RSI does not (or the reverse at a low); it is called false when the price then keeps going the same way. This can happen because RSI only measures the smoothed average gain against the smoothed average loss: a rally smaller than the previous one can still lift the price to a new high while RSI comes out lower. The tool does not flag divergences itself.',
      },
    },
  ],
  'giao-cat-hai-duong-ma': [
    {
      hoi: {
        vi: 'Vì sao đặt chu kỳ đường ngắn bằng hoặc dài hơn đường dài thì báo vô nghĩa?',
        en: 'Why is the result meaningless when the short period is equal to or longer than the long period?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Hiệu hai đường chỉ nói lên chiều xu hướng khi đường ngắn thực sự ngắn hơn. Nếu chu kỳ ngắn lớn hơn hoặc bằng chu kỳ dài, sản phẩm báo vô nghĩa. Ví dụ đặt 10 và 20 phiên.',
        en: 'The difference only reflects trend direction when the short line is genuinely shorter. If the short period is equal to or longer than the long one, the product reports a meaningless result. For example use 10 and 20 sessions.',
      },
    },
    {
      hoi: {
        vi: 'Cần bao nhiêu phiên giá để tính, và vì sao báo thiếu chuỗi giá?',
        en: 'How many price sessions are needed, and why does it say the series is missing?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chuỗi giá phải có ít nhất bằng chu kỳ đường dài. Mặc định đường dài 20 phiên nên cần 20 phiên. Tăng chu kỳ dài lên 200 mà chỉ nạp 60 phiên thì sản phẩm báo thiếu chuỗi giá.',
        en: 'The series needs at least as many sessions as the long period. With the default long line of 20 sessions you need 20. Raising the long period to 200 while loading only 60 sessions reports a missing series.',
      },
    },
    {
      hoi: {
        vi: 'Kết quả là số tiền ₫ chứ không phải phần trăm, đọc dấu dương và âm thế nào?',
        en: 'The result is an amount in ₫, not a percentage, so how do I read positive and negative?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Kết quả bằng SMA ngắn trừ SMA dài tại phiên cuối. Dương nghĩa là đường ngắn đang nằm trên đường dài, âm là đường ngắn nằm dưới, gần 0 là hai đường đang sát nhau.',
        en: 'The result is the short SMA minus the long SMA at the last session. Positive means the short line is above the long line, negative means below, and near 0 means the two lines are close together.',
      },
    },
    {
      hoi: {
        vi: 'Con số này có cho biết hai đường vừa cắt nhau không?',
        en: 'Does this figure tell me the two lines have just crossed?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chưa đủ. Sản phẩm chỉ tính hiệu ở phiên cuối, nên một con số không nói được lần cắt. Phải so với hiệu ở phiên trước: đổi dấu mới là vừa cắt, hoặc xem hai đường trên biểu đồ.',
        en: 'Not by itself. The product computes the difference only at the last session, so one figure cannot show a crossing. Compare it with the previous session: a sign change means a cross, or look at both lines on the chart.',
      },
    },
  ],
};
