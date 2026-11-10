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
