import type { BieuDoRieng } from '../types';
import { d } from './tao';

/**
 * Nhóm phân tích kỹ thuật (`technical`) — 18 công thức, tất cả chỉ vẽ sau khi nạp chuỗi giá.
 *
 * Mỗi điểm của đường là chỉ báo tính trên các phiên TÍNH TỚI phiên đó. Đây là nhóm mà câu hỏi của
 * chủ dự án ("xu thế của thị trường hay xu thế của biểu đồ đang ám chỉ cái gì") có hai câu trả lời
 * khác hẳn nhau: đường của SMA, EMA, VWAP và hai dải Bollinger đi CÙNG giá nên xu thế của nó là xu
 * thế giá; đường của RSI, MACD, ROC, ATR… đo một thứ khác (đà, độ rộng, khối lượng) nên đường đi lên
 * không có nghĩa là giá đi lên. Mỗi đoạn dưới đây nói rõ nó thuộc bên nào.
 */
export const BIEU_DO_KY_THUAT: Readonly<Record<string, BieuDoRieng>> = {
  'sma-n-phien': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi số phiên thì SMA của phiên gần nhất ra bao nhiêu, nên trục ngang là số phiên chứ không phải ngày và hình không phải diễn biến thị trường. Đường đi xuống là giá gần đây đang cao hơn giá cũ, tức xu hướng tăng: đường trung bình càng dài càng bị các phiên cũ giá thấp kéo xuống. Đường đi lên là ngược lại, giá gần đây đang thấp hơn giá cũ.',
          'The line runs left to right along the Number of periods (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: what the latest SMA comes out at for a different number of periods, so the horizontal axis counts sessions, not dates, and the chart is not market history. Where the line falls, recent prices are above older ones, that is an uptrend: the longer the average, the more the cheap older sessions drag it down. Where it rises, recent prices are below older ones.',
        ),
        cot: d(
          'Mỗi cột là SMA ứng với một số phiên, cột tô đặc là số phiên bạn đang nhập. Đặt giá phiên gần nhất cạnh dãy cột: giá nằm trên mọi cột là đang đứng trên cả đường trung bình ngắn lẫn dài.',
          'Each bar is the SMA for one number of periods, and the solid one is the number you have entered. Hold the latest price against the row: a price above every bar is standing over both the short and the long averages.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Hình có hai đường cùng đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: đường đậm có tô nền là SMA, đường mảnh màu nhạt là Giá đóng cửa. Hình này đi theo đúng chuỗi giá bạn đã nạp, và đường SMA chính là xu thế của giá đã làm mượt. SMA đi lên là giá bình quân của các phiên gần đây đang tăng; đi xuống là đang giảm. Giá đóng cửa nằm trên SMA là giá đang mạnh hơn mức bình quân của chính nó, và chỗ hai đường cắt nhau là lúc xu thế ngắn hạn đổi chiều.',
        'Two lines run together from the oldest session on the left to the most recent session on the right: the bold shaded one is the SMA, the thin pale one is the Closing price. It follows the price series you loaded, and the SMA line is the price trend itself, smoothed. When the SMA rises the average price of recent sessions is going up; when it falls it is going down. A closing price above the SMA is a price stronger than its own average, and where the two lines cross the short-term trend is turning.',
      ),
    },
  },

  'ema-n-phien': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi số phiên thì EMA của phiên gần nhất ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống là giá gần đây đang cao hơn giá cũ: EMA càng dài thì càng chậm theo kịp giá mới nên càng nằm thấp. Đường đi lên là giá gần đây đang thấp hơn giá cũ, và EMA dài còn giữ lại mức giá cao của trước đó.',
          'The line runs left to right along the Number of periods (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the latest EMA is for a different number of periods, not market history. Where the line falls, recent prices are above older ones: the longer the EMA, the slower it catches up with new prices and the lower it sits. Where it rises, recent prices are below older ones, and a long EMA still holds on to the higher prices from before.',
        ),
        cot: d(
          'Mỗi cột là EMA ứng với một số phiên, cột tô đặc là số phiên bạn đang nhập. Cột bên trái bám sát giá hiện tại nhất; khoảng chênh giữa cột trái cùng và cột phải cùng cho thấy giá vừa chạy nhanh tới mức nào.',
          'Each bar is the EMA for one number of periods, and the solid one is the number you have entered. The bars on the left hug the current price most closely; the gap between the leftmost and the rightmost bar shows how fast the price has just been moving.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là EMA tính tới phiên đó, tức giá bình quân có đặt nặng các phiên gần đây. Hình này đi theo đúng chuỗi giá bạn đã nạp, và đường này chính là xu thế của giá đã làm mượt. Đường đi lên là giá gần đây đang kéo mức bình quân lên; đi xuống là đang kéo xuống. Nó bẻ lái sớm hơn SMA cùng số phiên vì phiên mới nhất được tính nặng nhất.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the EMA up to that session, an average price that leans on the latest sessions. It follows the price series you loaded, and the line is the price trend itself, smoothed. When it rises recent prices are pulling the average up; when it falls they are pulling it down. It turns sooner than an SMA of the same length because the newest session counts most.',
      ),
      cot: d(
        'Mỗi cột là EMA tính tới một phiên, cột cuối bên phải là phiên gần nhất. Đỉnh các cột nối lại chính là đường EMA; dạng này cho thấy rõ mức giá bình quân đang đứng ở đâu so với mốc 0, còn độ dốc thì nhìn ở dạng Đường dễ hơn.',
        'Each bar is the EMA up to one session, the last one on the right being the latest. Joining the tops of the bars gives the EMA line; this form shows plainly where the average price stands above 0, while the slope is easier to read in the line form.',
      ),
    },
  },

  'macd-duong-chinh': {
    truc: {
      fastPeriod: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ EMA nhanh, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi chu kỳ của đường nhanh thì MACD của phiên gần nhất ra bao nhiêu, không phải diễn biến thị trường. Chu kỳ nhanh càng tiến gần chu kỳ chậm thì hai đường EMA càng giống nhau, nên đường thường tiến về phía 0 khi sang phải: đi lên nếu MACD đang âm, đi xuống nếu MACD đang dương.',
          'The line runs left to right along the Fast EMA period field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the latest MACD comes out at for a different fast period, not market history. The closer the fast period gets to the slow one, the more alike the two EMAs become, so the line usually heads toward 0 as it moves right: it rises if MACD is negative and falls if MACD is positive.',
        ),
        cot: d(
          'Mỗi cột là MACD ứng với một chu kỳ nhanh, cột tô đặc là chu kỳ bạn đang nhập. Cột mọc lên trên vạch 0 là đường nhanh đang nằm trên đường chậm, cột quay xuống dưới vạch 0 là nằm dưới; dấu của cột quan trọng hơn chiều cao của nó.',
          'Each bar is MACD for one fast period, and the solid one is the period you have entered. A bar above the zero line means the fast average is over the slow one, a bar below the zero line means under; the sign of a bar matters more than its height.',
        ),
      },
      slowPeriod: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ EMA chậm, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi chu kỳ của đường chậm thì MACD của phiên gần nhất ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: chu kỳ chậm càng dài thì đường chậm càng nhớ giá cũ, nên đường đi lên khi giá cũ thấp hơn giá gần đây và đi xuống khi giá cũ cao hơn.',
          'The line runs left to right along the Slow EMA period field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the latest MACD comes out at for a different slow period, not market history. The line has no fixed direction: the longer the slow period, the more the slow average remembers old prices, so the line rises when older prices are below recent ones and falls when they are above.',
        ),
        cot: d(
          'Mỗi cột là MACD ứng với một chu kỳ chậm, cột tô đặc là chu kỳ bạn đang nhập. Nếu các cột đổi dấu khi chu kỳ chỉ nhích vài phiên thì tín hiệu của MACD ở mã này đang mong manh, đừng coi một lần cắt là chắc chắn.',
          'Each bar is MACD for one slow period, and the solid one is the period you have entered. If the bars change sign when the period shifts by only a few sessions, the MACD signal on this ticker is fragile and one crossing should not be taken as settled.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là EMA nhanh trừ EMA chậm tính tới phiên đó. Đây là số đo ĐÀ của giá trên chuỗi bạn nạp, không phải đường giá. Đường đi lên là xu thế ngắn hạn đang mạnh lên so với xu thế dài hạn; đi xuống là đang yếu đi. Nằm trên mức 0 là EMA nhanh đứng trên EMA chậm, và chỗ đường cắt qua mức 0 là lúc hai xu thế đổi vị trí cho nhau.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the fast EMA minus the slow EMA up to that session. It measures the MOMENTUM of price on the series you loaded, not the price line. When it rises the short-term trend is strengthening against the long-term one; when it falls it is weakening. Above 0 the fast EMA sits over the slow EMA, and where the line crosses 0 the two trends are swapping places.',
      ),
      cot: d(
        'Mỗi cột là giá trị MACD của một phiên, cột cuối bên phải là phiên gần nhất. Cột mọc lên trên vạch 0 là phiên xu thế ngắn hạn đứng trên xu thế dài hạn, cột quay xuống dưới là ngược lại; cột đang dài ra là đà đang tăng, đang ngắn lại là đà đang cạn.',
        'Each bar is the MACD value of one session, the last one on the right being the latest. A bar standing above the zero line is a session with the short-term trend over the long-term one, one hanging below is the reverse; lengthening bars mean momentum is building, shortening ones that it is running out.',
      ),
    },
  },

  'macd-duong-tin-hieu': {
    truc: {
      fastPeriod: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ EMA nhanh, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi chu kỳ của đường nhanh thì đường tín hiệu của phiên gần nhất ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: đường tín hiệu là trung bình của chính MACD, nên nó đi lên hay đi xuống theo việc chu kỳ nhanh mới làm MACD của những phiên vừa qua lớn lên hay nhỏ đi.',
          'The line runs left to right along the Fast EMA period field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the latest signal line comes out at for a different fast period, not market history. The line has no fixed direction: the signal line is an average of MACD itself, so it rises or falls according to whether the new fast period makes MACD over the last sessions larger or smaller.',
        ),
        cot: d(
          'Mỗi cột là đường tín hiệu ứng với một chu kỳ nhanh, cột tô đặc là chu kỳ bạn đang nhập. Đường tín hiệu chỉ có nghĩa khi đặt cạnh MACD cùng bộ chu kỳ: MACD nằm trên nó là đà tăng đang mạnh lên.',
          'Each bar is the signal line for one fast period, and the solid one is the period you have entered. The signal line only means something beside the MACD of the same periods: MACD above it means upward momentum is strengthening.',
        ),
      },
      slowPeriod: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ EMA chậm, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi chu kỳ của đường chậm thì đường tín hiệu của phiên gần nhất ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: chu kỳ chậm dài hơn kéo đường chậm về phía giá cũ, nên đường tín hiệu đi lên khi giá cũ thấp hơn giá gần đây và đi xuống khi giá cũ cao hơn.',
          'The line runs left to right along the Slow EMA period field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the latest signal line comes out at for a different slow period, not market history. The line has no fixed direction: a longer slow period pulls the slow average toward old prices, so the signal line rises when older prices are below recent ones and falls when they are above.',
        ),
        cot: d(
          'Mỗi cột là đường tín hiệu ứng với một chu kỳ chậm, cột tô đặc là chu kỳ bạn đang nhập. Cột mọc lên trên vạch 0 là trong những phiên vừa qua đường nhanh chủ yếu nằm trên đường chậm; cột quay xuống dưới vạch 0 là ngược lại.',
          'Each bar is the signal line for one slow period, and the solid one is the period you have entered. A bar above the zero line means that over the last sessions the fast average sat mostly over the slow one; a bar below the zero line means the opposite.',
        ),
      },
      signalPeriod: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ đường tín hiệu, từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi MACD ấy, làm mượt trên nhiều hay ít phiên hơn thì đường tín hiệu ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: chu kỳ dài hơn kéo đường tín hiệu về phía MACD của những phiên cũ, nên nó đi lên khi MACD cũ cao hơn MACD hiện tại và đi xuống khi MACD cũ thấp hơn.',
          'The line runs left to right along the Signal line period field, from about half to about one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same MACD series, what the signal line comes out at when it is smoothed over more or fewer sessions, not market history. The line has no fixed direction: a longer period pulls the signal line toward the MACD of older sessions, so it rises when older MACD was above the current one and falls when it was below.',
        ),
        cot: d(
          'Mỗi cột là đường tín hiệu ứng với một chu kỳ làm mượt, cột tô đặc là chu kỳ bạn đang nhập. Chu kỳ ngắn cho tín hiệu cắt sớm nhưng hay nhiễu, chu kỳ dài cho tín hiệu chậm mà chắc hơn; dãy cột cho thấy hai lựa chọn ấy cách nhau bao xa.',
          'Each bar is the signal line for one smoothing period, and the solid one is the period you have entered. A short period crosses early but noisily, a long one crosses late but more reliably; the row shows how far apart those two choices sit.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là trung bình động luỹ thừa của chính chuỗi MACD tính tới phiên đó. Đây là bản làm mượt của một số đo đà, không phải đường giá. Đường đi lên đúng vào những phiên MACD nằm trên nó, và đi xuống khi MACD nằm dưới nó. Nó luôn đi sau MACD một nhịp, và chính độ trễ ấy làm nó thành mốc so sánh: MACD vượt lên trên nó là tín hiệu đà tăng.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the exponential moving average of the MACD series itself up to that session. It is the smoothed version of a momentum measure, not the price line. It rises on exactly the sessions when MACD sits above it, and falls when MACD sits below it. It always trails MACD by a beat, and that lag is what makes it a yardstick: MACD moving above it signals rising momentum.',
      ),
      cot: d(
        'Mỗi cột là giá trị đường tín hiệu của một phiên, cột cuối bên phải là phiên gần nhất. Cột trên vạch 0 là quãng đà tăng đã kéo dài đủ lâu để mức bình quân của MACD cũng dương; cột dưới vạch 0 là quãng đà giảm kéo dài.',
        'Each bar is the signal line value of one session, the last one on the right being the latest. A bar above the zero line is a stretch in which upward momentum lasted long enough to turn the MACD average positive; one below the zero line is a stretch of lasting downward momentum.',
      ),
    },
  },

  'rsi-wilder': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi số phiên thì RSI của phiên gần nhất ra bao nhiêu, không phải diễn biến thị trường. Số phiên càng dài thì RSI càng lì và càng bị kéo về giữa thang điểm, nên đường thường đi lên khi RSI ngắn hạn đang thấp và đi xuống khi RSI ngắn hạn đang cao.',
          'The line runs left to right along the Number of periods (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the latest RSI comes out at for a different number of periods, not market history. The longer the period, the more sluggish RSI gets and the more it is pulled toward the middle of the scale, so the line usually rises when short-period RSI is low and falls when it is high.',
        ),
        cot: d(
          'Mỗi cột là RSI ứng với một số phiên, cột tô đặc là số phiên bạn đang nhập. Cùng một chuỗi giá mà cột bên trái có thể đã báo quá bán trong khi cột bên phải thì chưa: số phiên ngắn cho tín hiệu sớm và nhiều hơn, số phiên dài cho tín hiệu hiếm mà chậm.',
          'Each bar is RSI for one number of periods, and the solid one is the number you have entered. On the same price series a bar on the left may say oversold while one on the right does not yet: a short period signals early and often, a long one rarely and late.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là RSI tính tới phiên đó, luôn nằm giữa 0 và mức tối đa của thang. Đây là số đo sức mạnh của các phiên tăng so với các phiên giảm trên chuỗi bạn nạp, không phải đường giá. Đường đi lên sau mỗi phiên tăng và đi xuống sau mỗi phiên giảm; chỉ khi nó nằm ở nửa trên của thang thì phiên tăng mới đang lấn át phiên giảm. Hai vạch ngang 70 và 30, khi nằm trong khung hình, là mốc quá mua và quá bán: vượt 70 là giá đã tăng dồn dập, xuống dưới 30 là đã giảm dồn dập.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the RSI up to that session, always between 0 and the top of the scale. It measures the strength of up sessions against down sessions on the series you loaded, not the price line. It rises after each up session and falls after each down one; only in the upper half of the scale are up sessions overpowering down sessions. The horizontal lines at 70 and 30, when inside the frame, mark overbought and oversold: above 70 the price has risen in a rush, below 30 it has dropped in a rush.',
      ),
      cot: d(
        'Mỗi cột là RSI của một phiên, cột cuối bên phải là phiên gần nhất. Cột vượt vạch 70 là phiên ở vùng quá mua, cột chưa tới vạch 30 là phiên ở vùng quá bán; phần lớn các cột nằm giữa hai vạch ấy.',
        'Each bar is the RSI of one session, the last one on the right being the latest. A bar passing the 70 line is a session in overbought territory, one short of the 30 line a session in oversold territory; most bars sit between the two.',
      ),
    },
  },

  'roc-toc-do-thay-doi': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên nhìn lại (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: mỗi điểm so giá phiên gần nhất với giá của một phiên lùi xa hơn về quá khứ, nên đọc từ trái sang phải là đi ngược thời gian và hình không phải diễn biến thị trường. Đường đi xuống là càng lùi xa thì giá ngày ấy càng cao so với hôm nay, tức giá đã giảm suốt quãng đó; đường đi lên là giá ngày ấy thấp hơn, tức giá đã tăng.',
          'The line runs left to right along the Lookback periods (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: each point compares the latest price with the price of a session further back, so left to right goes back in time and the chart is not market history. Where the line falls, the further back you go the higher that day’s price was against today’s, so the price has been dropping; where it rises, that day’s price was lower, so the price has been climbing.',
        ),
        cot: d(
          'Mỗi cột là ROC ứng với một số phiên nhìn lại, cột tô đặc là số phiên bạn đang nhập. Cột mọc lên trên vạch 0 là hôm nay cao hơn ngày ấy, cột quay xuống dưới vạch 0 là thấp hơn; mọi cột cùng một phía là xu hướng nhất quán ở mọi tầm nhìn.',
          'Each bar is ROC for one lookback, and the solid one is the lookback you have entered. A bar above the zero line means today is higher than that day, a bar below the zero line means lower; all bars on one side means the trend agrees at every horizon.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là giá của phiên đó cao hơn hay thấp hơn giá của số phiên nhìn lại trước đó bao nhiêu phần trăm. Đây là số đo TỐC ĐỘ của giá trên chuỗi bạn nạp, không phải đường giá. Đường đi lên là giá đang tăng nhanh dần, hoặc giảm chậm lại; đi xuống là ngược lại. Nằm trên mức 0 là giá hôm ấy cao hơn giá của kỳ nhìn lại, dưới mức 0 là thấp hơn.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is how far, in percent, that session’s price stood above or below the price the look-back number of sessions earlier. It measures the SPEED of price on the series you loaded, not the price line. When it rises the price is gaining faster, or losing more slowly; when it falls the reverse holds. Above 0 that day’s price is higher than the look-back price, below 0 it is lower.',
      ),
      cot: d(
        'Mỗi cột là ROC của một phiên, cột cuối bên phải là phiên gần nhất. Cột mọc lên trên vạch 0 là phiên giá cao hơn kỳ nhìn lại, cột quay xuống dưới là thấp hơn; cột càng dài thì quãng giá đã đi trong kỳ ấy càng lớn.',
        'Each bar is the ROC of one session, the last one on the right being the latest. A bar standing above the zero line is a session priced over the look-back session, one hanging below is priced under it; the longer the bar, the further the price traveled in that span.',
      ),
    },
  },

  'dong-luong-momentum': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên nhìn lại (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: mỗi điểm là giá phiên gần nhất trừ giá của một phiên lùi xa hơn về quá khứ, nên đọc từ trái sang phải là đi ngược thời gian và hình không phải diễn biến thị trường. Đường đi xuống là càng lùi xa thì giá ngày ấy càng cao hơn hôm nay, tức giá đã mất dần suốt quãng đó; đường đi lên là giá đã được thêm.',
          'The line runs left to right along the Lookback periods (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: each point is the latest price minus the price of a session further back in the past, so left to right goes back in time and the chart is not market history. Where the line falls, the further back you go the more that day’s price exceeds today’s, that is the price has been losing ground over that stretch; where it rises, it has been gaining.',
        ),
        cot: d(
          'Mỗi cột là động lượng ứng với một số phiên nhìn lại, tính bằng đồng, cột tô đặc là số phiên bạn đang nhập. Vì là số đồng chứ không phải phần trăm, cùng một mức tăng giảm tính theo phần trăm thì mã giá cao cho cột dài hơn mã giá thấp; chỉ nên so các cột của cùng một mã.',
          'Each bar is momentum for one lookback, in money terms, and the solid one is the lookback you have entered. Being an amount and not a percentage, the same percentage move gives a high-priced ticker longer bars than a cheap one; compare bars of the same ticker only.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là giá của phiên đó trừ đi giá của số phiên nhìn lại trước đó, tính bằng đồng. Đây là số đo đà của giá trên chuỗi bạn nạp, không phải đường giá. Đường đi lên là quãng chênh so với kỳ nhìn lại đang rộng thêm về phía tăng, hoặc đang thu hẹp lại ở phía giảm; đi xuống là ngược lại. Chỗ đường cắt mức 0 là phiên giá quay về đúng mức của kỳ nhìn lại.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is that session’s price minus the price the look-back number of sessions earlier, in dong. It measures the momentum of price on the series you loaded, not the price line. When it rises the gap to the look-back price is widening on the up side, or narrowing on the down side; when it falls the reverse holds. Where the line crosses 0 the price is back at the look-back level.',
      ),
      cot: d(
        'Mỗi cột là động lượng của một phiên, cột cuối bên phải là phiên gần nhất. Cột trên vạch 0 là phiên giá cao hơn kỳ nhìn lại bấy nhiêu đồng, cột dưới vạch 0 là thấp hơn bấy nhiêu đồng; vì tính bằng đồng nên không so được giữa hai mã có mặt bằng giá khác nhau.',
        'Each bar is the momentum of one session, the last one on the right being the latest. A bar above the zero line is a session priced that many dong over the look-back session, one below the zero line that many dong under it; being in dong, it cannot be compared across two tickers trading at different price levels.',
      ),
    },
  },

  'khoang-cach-gia-so-sma': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên của đường trung bình (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng giá phiên gần nhất ấy, so với đường trung bình dài hay ngắn hơn thì khoảng cách ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên là đường trung bình càng dài càng nằm thấp, tức giá cũ thấp hơn giá gần đây; đường đi xuống là đường trung bình dài còn giữ mức giá cao của trước đó.',
          'The line runs left to right along the Moving average period (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: for that same latest price, how far it sits from a longer or shorter moving average, not market history. Where the line rises, the longer the average the lower it lies, that is older prices were below recent ones; where it falls, the long average still holds the higher prices from before.',
        ),
        cot: d(
          'Mỗi cột là khoảng cách giữa giá và một đường trung bình, cột tô đặc là số phiên bạn đang nhập. Cột mọc lên trên vạch 0 là giá đang đứng trên đường trung bình ấy, cột quay xuống dưới vạch 0 là đứng dưới; cột càng dài thì giá càng đi xa khỏi mức quen thuộc.',
          'Each bar is the distance between the price and one moving average, and the solid one is the number of periods you have entered. A bar above the zero line means the price stands over that average, a bar below the zero line means under it; the longer the bar, the further the price has strayed from its usual level.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là giá của phiên đó cao hơn hay thấp hơn đường SMA bao nhiêu phần trăm. Đây là số đo độ căng của giá so với xu thế của chính nó, không phải đường giá. Đường đi lên là giá đang tăng nhanh hơn đường trung bình: giãn xa hơn nếu đang nằm trên, hồi về phía nó nếu đang nằm dưới; đi xuống là ngược lại. Càng xa mức 0 về bên nào thì giá càng bị kéo căng về bên ấy.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is how far, in percent, that session’s price stood above or below the SMA. It measures how stretched the price is against its own trend, not the price line. When it rises the price is gaining on the average: stretching further if it is above, recovering toward it if it is below; when it falls the reverse holds. The further from 0 on either side, the more the price is stretched that way.',
      ),
      cot: d(
        'Mỗi cột là khoảng cách tới SMA ở một phiên, cột cuối bên phải là phiên gần nhất. Cột trên vạch 0 là phiên giá nằm trên đường trung bình, cột dưới vạch 0 là nằm dưới; mấy cột dài nhất của cả dãy cho biết cổ phiếu này thường căng tới đâu thì quay lại.',
        'Each bar is the distance to the SMA at one session, the last one on the right being the latest. A bar above the zero line is a session priced over the average, one below the zero line under it; the longest bars in the whole row show how far this share usually stretches before turning back.',
      ),
    },
  },

  'giao-cat-hai-duong-ma': {
    truc: {
      shortPeriod: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ đường ngắn, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi chu kỳ của đường ngắn thì khoảng chênh giữa hai đường trung bình ra bao nhiêu, không phải diễn biến thị trường. Chu kỳ ngắn càng tiến gần chu kỳ dài thì hai đường càng trùng nhau, nên đường thường tiến về phía 0 khi sang phải: đi lên nếu khoảng chênh đang âm, đi xuống nếu đang dương.',
          'The line runs left to right along the Short period field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, how the gap between the two averages changes with a different short period, not market history. The closer the short period gets to the long one, the more the two averages coincide, so the line usually heads toward 0 as it moves right: it rises if the gap is negative and falls if it is positive.',
        ),
        cot: d(
          'Mỗi cột là khoảng chênh giữa đường ngắn và đường dài ứng với một chu kỳ ngắn, cột tô đặc là chu kỳ bạn đang nhập. Cột mọc lên trên vạch 0 là đường ngắn nằm trên đường dài, tức trạng thái sau một lần cắt lên; cột quay xuống dưới vạch 0 là sau một lần cắt xuống.',
          'Each bar is the gap between the short and the long average for one short period, and the solid one is the period you have entered. A bar above the zero line means the short average is over the long one, the state after an upward cross; a bar below the zero line is the state after a cross down.',
        ),
      },
      longPeriod: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ đường dài, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp và không phải diễn biến thị trường. Đường không có chiều cố định: đường dài càng dài càng nhớ giá cũ, nên đường đi lên khi giá cũ thấp hơn giá gần đây và đi xuống khi giá cũ cao hơn. Vùng gạch chéo ở đầu bên trái là chỗ chu kỳ dài không còn lớn hơn chu kỳ ngắn, ở đó không có hai đường để so.',
          'The line runs left to right along the Long period field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded and is not market history. The line has no fixed direction: the longer the long average, the more it remembers old prices, so the line rises when older prices are below recent ones and falls when they are above. The hatched area at the far left is where the long period is no longer greater than the short one, so there are not two averages to compare.',
        ),
        cot: d(
          'Mỗi cột là khoảng chênh giữa đường ngắn và đường dài ứng với một chu kỳ dài, cột tô đặc là chu kỳ bạn đang nhập. Nếu dấu của cột giữ nguyên trên cả dãy thì kết luận cắt lên hay cắt xuống không phụ thuộc vào việc bạn chọn chu kỳ dài nào.',
          'Each bar is the gap between the short and the long average for one long period, and the solid one is the period you have entered. If the sign of the bars holds across the whole row, the verdict of a cross up or down does not depend on which long period you choose.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là SMA chu kỳ ngắn trừ SMA chu kỳ dài tính tới phiên đó. Đây là số đo quan hệ giữa hai xu thế của giá, không phải đường giá. Đường đi lên là đường ngắn đang nhích lên so với đường dài: bứt xa hơn nếu đang nằm trên, thu hẹp khoảng cách nếu đang nằm dưới; đi xuống là ngược lại. Chỗ đường vượt từ dưới lên qua mức 0 là điểm cắt lên, từ trên xuống qua mức 0 là điểm cắt xuống.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the short SMA minus the long SMA up to that session. It measures how two price trends relate, not the price line. When it rises the short average is gaining on the long one: pulling further away if it is above, closing the gap if it is below; when it falls the reverse holds. Where the line passes up through 0 is the bullish crossover, down through 0 the bearish one.',
      ),
      cot: d(
        'Mỗi cột là chênh lệch giữa hai đường trung bình ở một phiên, cột cuối bên phải là phiên gần nhất. Cột trên vạch 0 là phiên đường ngắn đứng trên đường dài, cột dưới vạch 0 là đứng dưới; chỗ dãy cột đổi phía chính là phiên hai đường cắt nhau.',
        'Each bar is the gap between the two averages at one session, the last one on the right being the latest. A bar above the zero line is a session with the short average over the long one, one below the zero line under it; where the row switches sides is the very session the two averages crossed.',
      ),
    },
  },

  'dai-bollinger-tren': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ dải Bollinger (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi chu kỳ thì dải trên của phiên gần nhất nằm ở mức giá nào, không phải diễn biến thị trường. Đường không có chiều cố định vì chu kỳ đổi cả hai thứ làm nên dải: đường đi lên khi cửa sổ dài hơn gặp giá cũ cao hơn hoặc dao động mạnh hơn, đi xuống khi giá cũ thấp hơn và êm hơn.',
          'The line runs left to right along the Bollinger band period (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, at what price the latest upper band sits for a different period, not market history. The line has no fixed direction because the period changes both things the band is built from: it rises when the longer window meets higher or more volatile old prices, and falls when old prices were lower and calmer.',
        ),
        cot: d(
          'Mỗi cột là mức giá của dải trên ứng với một chu kỳ, cột tô đặc là chu kỳ bạn đang nhập. Giá phiên gần nhất vượt lên trên đỉnh cột là đã ra ngoài dải của chu kỳ ấy; với chu kỳ khác thì có thể vẫn còn nằm trong.',
          'Each bar is the price level of the upper band for one period, and the solid one is the period you have entered. A latest price above the top of a bar has left the band of that period; under another period it may still be inside.',
        ),
      },
      k: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Hệ số nhân độ lệch chuẩn (k), từ một nửa đến gấp rưỡi hệ số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng hệ số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng đường trung bình và cùng độ lệch chuẩn ấy, đổi hệ số thì dải trên nằm ở mức giá nào, không phải diễn biến thị trường. Đường đi lên đều với mọi chuỗi giá: dải trên bằng đường trung bình cộng hệ số nhân độ lệch chuẩn, nên hệ số lớn hơn là đẩy dải ra xa hơn.',
          'The line runs left to right along the Standard deviation multiplier (k) field, from half to one and a half times the multiplier you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: with the same average and the same standard deviation, at what price the upper band sits for a different multiplier, not market history. The line rises steadily on any price series: the upper band is the average plus the multiplier times the standard deviation, so a larger multiplier pushes the band further out.',
        ),
        cot: d(
          'Mỗi cột là mức giá của dải trên ứng với một hệ số, cột cao dần về bên phải và cột tô đặc là hệ số bạn đang nhập. Chỉ có vài cột vì ô này đi từng nấc nửa đơn vị; hệ số càng lớn thì giá càng hiếm khi chạm dải, nên mỗi lần chạm càng đáng chú ý.',
          'Each bar is the price level of the upper band for one multiplier; bars grow taller to the right and the solid one is the multiplier you have entered. There are only a few bars because the field moves in half-unit notches; the larger the multiplier, the more rarely price touches the band, so each touch counts for more.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là dải trên tính tới phiên đó, tức giá bình quân cộng thêm một số lần độ lệch chuẩn. Hình này đi theo đúng chuỗi giá bạn đã nạp: đường đi theo giá và luôn nằm trên mức giá bình quân; phần lớn các phiên giá đóng cửa nằm dưới nó, phiên nào đóng cửa vượt lên trên là giá đã ra ngoài dải. Đường đi lên là giá bình quân đang tăng, hoặc giá đang dao động rộng ra nên dải bị đẩy lên; đi xuống là giá bình quân giảm hoặc dao động co lại.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the upper band up to that session, the average price plus a number of standard deviations. It follows the price series you loaded: the line tracks the price and always sits above the average price; on most sessions the close stays under it, and a session that closes above it has left the band. When it rises the average price is going up, or the price is swinging wider and pushing the band up; when it falls the average is dropping or the swings are tightening.',
      ),
      cot: d(
        'Mỗi cột là mức dải trên của một phiên, cột cuối bên phải là phiên gần nhất. Đỉnh cột là mức giá mà phần lớn các phiên không vượt qua; giá đóng cửa chạm tới đỉnh ấy là giá đang ở mép cao của khoảng dao động thường gặp.',
        'Each bar is the upper band of one session, the last one on the right being the latest. The top of a bar is a price most sessions do not exceed; a close that reaches it is a price at the high edge of its usual range.',
      ),
    },
  },

  'dai-bollinger-duoi': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ dải Bollinger (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi chu kỳ thì dải dưới của phiên gần nhất nằm ở mức giá nào, không phải diễn biến thị trường. Đường không có chiều cố định: đường đi xuống khi cửa sổ dài hơn gặp giá cũ thấp hơn hoặc dao động mạnh hơn, vì dải dưới bị kéo ra xa đường trung bình; đường đi lên khi giá cũ cao hơn và êm hơn.',
          'The line runs left to right along the Bollinger band period (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, at what price the latest lower band sits for a different period, not market history. The line has no fixed direction: it falls when the longer window meets lower or more volatile old prices, because the lower band is pushed further from the average; it rises when old prices were higher and calmer.',
        ),
        cot: d(
          'Mỗi cột là mức giá của dải dưới ứng với một chu kỳ, cột tô đặc là chu kỳ bạn đang nhập. Giá phiên gần nhất thấp hơn đỉnh cột là đã thủng dải dưới của chu kỳ ấy, một dấu hiệu giá đang yếu bất thường so với chính nó.',
          'Each bar is the price level of the lower band for one period, and the solid one is the period you have entered. A latest price under the top of a bar has broken the lower band of that period, a sign the price is unusually weak against its own record.',
        ),
      },
      k: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Hệ số nhân độ lệch chuẩn (k), từ một nửa đến gấp rưỡi hệ số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng hệ số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng đường trung bình và cùng độ lệch chuẩn ấy, đổi hệ số thì dải dưới nằm ở mức giá nào, không phải diễn biến thị trường. Đường đi xuống đều với mọi chuỗi giá: dải dưới bằng đường trung bình trừ hệ số nhân độ lệch chuẩn, nên hệ số lớn hơn là hạ dải xuống thấp hơn.',
          'The line runs left to right along the Standard deviation multiplier (k) field, from half to one and a half times the multiplier you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: with the same average and the same standard deviation, at what price the lower band sits for a different multiplier, not market history. The line falls steadily on any price series: the lower band is the average minus the multiplier times the standard deviation, so a larger multiplier sets the band lower.',
        ),
        cot: d(
          'Mỗi cột là mức giá của dải dưới ứng với một hệ số, cột thấp dần về bên phải và cột tô đặc là hệ số bạn đang nhập. Bước giữa hai cột cạnh nhau bằng đúng một nửa độ lệch chuẩn của chuỗi giá, vì ô này đi từng nấc nửa đơn vị.',
          'Each bar is the price level of the lower band for one multiplier; bars shrink to the right and the solid one is the multiplier you have entered. The step between two neighboring bars is exactly half a standard deviation of the price series, because the field moves in half-unit notches.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là dải dưới tính tới phiên đó, tức giá bình quân trừ đi một số lần độ lệch chuẩn. Hình này đi theo đúng chuỗi giá bạn đã nạp: đường đi theo giá và luôn nằm dưới mức giá bình quân; phần lớn các phiên giá đóng cửa nằm trên nó, phiên nào đóng cửa thấp hơn là giá đã thủng dải. Đường đi lên là giá bình quân đang tăng, hoặc dao động đang co lại nên dải nhích lên gần giá; đi xuống là giá bình quân giảm hoặc giá đang dao động rộng ra.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the lower band up to that session, the average price minus a number of standard deviations. It follows the price series you loaded: the line tracks the price and always sits below the average price; on most sessions the close stays over it, and a session that closes under it has broken the band. When it rises the average price is going up, or the swings are tightening so the band edges closer to the price; when it falls the average is dropping or the price is swinging wider.',
      ),
      cot: d(
        'Mỗi cột là mức dải dưới của một phiên, cột cuối bên phải là phiên gần nhất. Đỉnh cột là mức giá mà phần lớn các phiên không xuống thấp hơn; giá đóng cửa rơi về đỉnh ấy là giá đang ở mép thấp của khoảng dao động thường gặp.',
        'Each bar is the lower band of one session, the last one on the right being the latest. The top of a bar is a price most sessions do not go under; a close that drops to it is a price at the low edge of its usual range.',
      ),
    },
  },

  'do-rong-dai-bollinger': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ dải Bollinger (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: đổi chu kỳ thì độ rộng dải của phiên gần nhất ra bao nhiêu, không phải diễn biến thị trường. Đường thường đi lên: cửa sổ càng dài thì giá càng có nhiều phiên để đi xa khỏi mức bình quân, nên dải rộng ra dù mỗi phiên vẫn dao động như cũ. Đoạn đường đi xuống mới đáng chú ý: quãng giá đi xa nhất nằm ngay trong những phiên gần đây.',
          'The line runs left to right along the Bollinger band period (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: how wide the latest band is for a different period, not market history. The line usually rises: a longer window gives the price more sessions to travel from its average, so the band widens even when each session swings no harder. A stretch where the line falls is the one worth noting: the widest travel sits in the most recent sessions.',
        ),
        cot: d(
          'Mỗi cột là độ rộng dải ứng với một chu kỳ, cột tô đặc là chu kỳ bạn đang nhập. Cột thấp là dải đang bó hẹp; dải bó hẹp ở cả chu kỳ ngắn lẫn dài thường đi trước một nhịp biến động mạnh, dù không nói trước chiều nào.',
          'Each bar is the bandwidth for one period, and the solid one is the period you have entered. A short bar is a squeezed band; a band squeezed at both short and long periods often comes before a strong move, though it does not say in which direction.',
        ),
      },
      k: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Hệ số nhân độ lệch chuẩn, từ một nửa đến gấp rưỡi hệ số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng hệ số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng độ lệch chuẩn ấy, đổi hệ số thì độ rộng dải ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều với mọi chuỗi giá: hai dải cách đường giữa đúng hệ số lần độ lệch chuẩn, nên hệ số gấp đôi thì dải rộng gấp đôi.',
          'The line runs left to right along the Standard deviation multiplier field, from half to one and a half times the multiplier you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: with the same standard deviation, how wide the band is for a different multiplier, not market history. The line rises steadily on any price series: each band sits the multiplier times the standard deviation away from the middle line, so twice the multiplier gives a band twice as wide.',
        ),
        cot: d(
          'Mỗi cột là độ rộng dải ứng với một hệ số, cột cao dần về bên phải và cột tô đặc là hệ số bạn đang nhập. Dãy cột không nói gì thêm về mã: nó chỉ cho thấy con số độ rộng phụ thuộc vào quy ước, nên so hai mã phải cùng một hệ số.',
          'Each bar is the bandwidth for one multiplier; bars grow taller to the right and the solid one is the multiplier you have entered. The row says nothing new about the ticker: it only shows that the bandwidth figure depends on a convention, so compare two tickers under the same multiplier.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là khoảng cách giữa dải trên và dải dưới, tính ra phần trăm của đường giữa. Đây là số đo độ rộng dao động trên chuỗi bạn nạp, và nó không cho biết giá lên hay xuống. Đường đi lên là hai dải đang bung ra, tức giá đang biến động mạnh dần; đi xuống là hai dải đang bóp lại. Quãng đường nằm thấp kéo dài thường đi trước một nhịp biến động lớn.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the gap between the upper and lower bands as a percentage of the middle line. It measures how wide the swings are on the series you loaded, and it says nothing about whether the price went up or down. When it rises the bands are spreading, so the price is moving harder; when it falls they are squeezing. A long low stretch often comes before a large move.',
      ),
      cot: d(
        'Mỗi cột là độ rộng dải của một phiên, cột cuối bên phải là phiên gần nhất. Cột thấp là quãng giá bị nén trong khoảng hẹp, cột cao là quãng giá bung rộng; so cột cuối với cả dãy để biết hôm nay đang nén hay đang bung.',
        'Each bar is the bandwidth of one session, the last one on the right being the latest. A short bar is a stretch with the price pressed into a narrow range, a tall one a stretch of wide moves; compare the last bar with the whole row to see whether today is squeezed or stretched.',
      ),
    },
  },

  'atr-dao-dong-thuc': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ ATR (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, làm mượt trên nhiều hay ít phiên hơn thì ATR của phiên gần nhất ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên là chu kỳ dài hơn còn nhớ những phiên biên độ rộng trước đây, tức gần đây giá đi lại hẹp hơn; đường đi xuống là các phiên gần đây mới là lúc biên độ nới ra.',
          'The line runs left to right along the ATR period (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the latest ATR comes out at when it is smoothed over more or fewer sessions, not market history. Where the line rises, the longer period still remembers wide-ranging sessions from before, that is the price has been moving in a narrower range lately; where it falls, the recent sessions are the ones whose range has widened.',
        ),
        cot: d(
          'Mỗi cột là ATR ứng với một chu kỳ, tính bằng đồng, cột tô đặc là chu kỳ bạn đang nhập. Chiều cao cột là quãng giá thường đi trong một phiên; nhiều người đặt cắt lỗ cách giá vào một hoặc hai lần chiều cao ấy.',
          'Each bar is ATR for one period, in money terms, and the solid one is the period you have entered. Bar height is how far the price usually travels in a session; many traders place a stop one or two of those heights away from the entry.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là quãng giá một phiên thường đi được, tính bằng đồng và đã kể cả khoảng nhảy giá so với phiên trước. Đây là số đo biên độ trên chuỗi bạn nạp, và nó không cho biết giá lên hay xuống. Đường đi lên là mỗi phiên đang đi một quãng dài hơn; đi xuống là thị trường của mã này đang lặng lại.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is how far a session usually travels, in dong, including any gap from the previous close. It measures range on the series you loaded, and it says nothing about whether the price went up or down. When it rises each session is covering more ground; when it falls trading in this ticker is quieting down.',
      ),
      cot: d(
        'Mỗi cột là ATR tính tới một phiên, cột cuối bên phải là phiên gần nhất. Chiều cao cột là số đồng một phiên bình thường có thể đi ngược bạn, nên nó hay được dùng để đặt khoảng cắt lỗ đủ rộng cho mã ấy.',
        'Each bar is the ATR up to one session, the last one on the right being the latest. Bar height is the dong an ordinary session might move against you, which is why it is often used to set a stop wide enough for that ticker.',
      ),
    },
  },

  'phan-tram-b-bollinger': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ dải Bollinger, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng giá phiên gần nhất ấy, đặt trong dải của chu kỳ dài hay ngắn hơn thì %B ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: đi lên là với cửa sổ dài hơn thì giá hôm nay nằm cao hơn trong dải, đi xuống là nằm thấp hơn, tuỳ giá cũ cao hay thấp và dao động nhiều hay ít.',
          'The line runs left to right along the Bollinger band period field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: where %B comes out when the same latest price is placed inside the band of a longer or shorter period, not market history. The line has no fixed direction: where it rises, the longer window puts today’s price higher in the band; where it falls, lower, depending on whether old prices were higher or lower and more or less volatile.',
        ),
        cot: d(
          'Mỗi cột là %B ứng với một chu kỳ, cột tô đặc là chu kỳ bạn đang nhập. Cột thấp sát đáy là giá nằm gần dải dưới, cột cao là gần dải trên; nếu các cột cùng thấp hoặc cùng cao thì vị trí của giá không phụ thuộc chu kỳ bạn chọn.',
          'Each bar is %B for one period, and the solid one is the period you have entered. A bar close to the base means the price is near the lower band, a tall one near the upper band; if the bars are all low or all high, the price’s position does not depend on the period you pick.',
        ),
      },
      k: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Hệ số nhân độ lệch chuẩn, từ một nửa đến gấp rưỡi hệ số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng hệ số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng giá và cùng đường giữa ấy, nới dải ra hay bó dải lại thì %B ra bao nhiêu, không phải diễn biến thị trường. Hệ số càng lớn thì dải càng rộng và giá càng bị kéo về giữa dải: đường đi lên nếu giá đang nằm dưới đường giữa, đi xuống nếu giá đang nằm trên.',
          'The line runs left to right along the Standard deviation multiplier field, from half to one and a half times the multiplier you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: what %B comes out at when the band is widened or tightened around the same price and the same middle line, not market history. The larger the multiplier, the wider the band and the closer the price is pulled to its middle: the line rises if the price is under the middle line and falls if it is over.',
        ),
        cot: d(
          'Mỗi cột là %B ứng với một hệ số, cột tô đặc là hệ số bạn đang nhập. Cột quay xuống dưới vạch 0 là giá đã thủng dải dưới của hệ số ấy; nới hệ số ra thì cùng mức giá đó lại nằm trong dải.',
          'Each bar is %B for one multiplier, and the solid one is the multiplier you have entered. A bar below the zero line means the price has broken the lower band at that multiplier; widen the multiplier and the same price is back inside the band.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là vị trí của giá đóng cửa phiên đó giữa hai dải Bollinger. Đây là số đo vị trí của giá trong khoảng dao động của chính nó, không phải đường giá. Đường đi lên là giá đang tiến về phía dải trên; đi xuống là đang lùi về phía dải dưới. Hai vạch ngang 0 và 100, khi nằm trong khung hình, là chính hai dải: vượt 100 là giá đóng cửa ngoài dải trên, xuống dưới 0 là ngoài dải dưới.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is where that session’s close sat between the two Bollinger bands. It measures the position of price within its own range, not the price line. When it rises the price is heading for the upper band; when it falls it is retreating toward the lower band. The two horizontal lines at 0 and 100, when they fall inside the frame, are the bands themselves: above 100 the close is outside the upper band, below 0 outside the lower one.',
      ),
      cot: d(
        'Mỗi cột là %B của một phiên, cột cuối bên phải là phiên gần nhất. Cột cao quá vạch 100 là phiên đóng cửa trên dải trên, cột quay xuống dưới vạch 0 là phiên đóng cửa dưới dải dưới; cột cao lưng chừng là giá ở quanh đường giữa.',
        'Each bar is the %B of one session, the last one on the right being the latest. A bar rising past the 100 line is a close above the upper band, one hanging below the 0 line a close under the lower band; a bar about halfway up is a price near the middle line.',
      ),
    },
  },

  'stochastic-k': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ stochastic (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng giá phiên gần nhất ấy, đặt trong khoảng cao thấp của nhiều hay ít phiên hơn thì %K ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: đi xuống là cửa sổ dài hơn vừa gặp một đỉnh cũ cao hơn, khiến giá hôm nay nằm thấp hơn trong khoảng; đi lên là nó vừa gặp một đáy cũ thấp hơn.',
          'The line runs left to right along the Stochastic period (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: where %K comes out when the same latest price is placed inside the high-low range of more or fewer sessions, not market history. The line has no fixed direction: where it falls, the longer window has just met a higher old peak, leaving today’s price lower in the range; where it rises, it has just met a lower old trough.',
        ),
        cot: d(
          'Mỗi cột là %K ứng với một chu kỳ, cột tô đặc là chu kỳ bạn đang nhập. Nhiều cột liền nhau bằng nhau là quãng nới thêm phiên mà không gặp đỉnh hay đáy mới; cột thấp sát đáy là giá đang ở gần mức thấp nhất của cả cửa sổ ấy.',
          'Each bar is %K for one period, and the solid one is the period you have entered. Several equal neighboring bars mark a stretch where adding sessions met no new high or low; a bar close to the base means the price is near the lowest level of that whole window.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là vị trí của giá đóng cửa phiên đó trong khoảng từ giá thấp nhất tới giá cao nhất của chu kỳ. Đây là số đo vị trí của giá trong biên độ gần đây, không phải đường giá. Đường đi lên là giá đang đóng cửa gần đỉnh của chu kỳ hơn; đi xuống là gần đáy hơn. Hai vạch ngang 80 và 20, khi nằm trong khung hình, là mốc sát đỉnh và sát đáy.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is where that session’s close sat in the span from the lowest to the highest price of the period. It measures the position of price within its recent range, not the price line. When it rises the price is closing nearer the top of the period; when it falls nearer the bottom. The two horizontal lines at 80 and 20, when they fall inside the frame, mark near the high and near the low.',
      ),
      cot: d(
        'Mỗi cột là %K của một phiên, cột cuối bên phải là phiên gần nhất. Cột vượt vạch 80 là phiên đóng cửa sát đỉnh chu kỳ, cột chưa tới vạch 20 là sát đáy; chỉ báo này đảo chiều rất nhanh nên hai cột cạnh nhau có thể chênh nhau nhiều.',
        'Each bar is the %K of one session, the last one on the right being the latest. A bar passing the 80 line is a close near the top of the period, one short of the 20 line near the bottom; this indicator turns very quickly, so two neighboring bars can differ a great deal.',
      ),
    },
  },

  vwap: {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên gộp (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá và khối lượng bạn đã nạp: cùng chuỗi ấy, gộp nhiều hay ít phiên hơn thì VWAP ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống là giá gần đây đang cao hơn giá cũ, nên gộp thêm phiên cũ kéo mức bình quân xuống; đường đi lên là giá cũ cao hơn, nhất là khi những phiên cũ ấy khớp khối lượng lớn.',
          'The line runs left to right along the Sessions to pool (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price and volume series you loaded: on that same series, what VWAP comes out at when more or fewer sessions are pooled, not market history. Where the line falls, recent prices are above older ones, so pooling in older sessions pulls the average down; where it rises, older prices were higher, all the more so when those sessions traded heavy volume.',
        ),
        cot: d(
          'Mỗi cột là VWAP khi gộp một số phiên, cột tô đặc là số phiên bạn đang nhập. Chiều cao cột là giá vốn bình quân của người mua trong quãng ấy; giá hôm nay nằm trên đỉnh cột là phần đông người mua trong quãng ấy đang có lãi.',
          'Each bar is VWAP over a given number of pooled sessions, and the solid one is the number you have entered. Bar height is the average cost of those who bought over that stretch; today’s price above the top of a bar means most buyers of that stretch are in profit.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là giá bình quân của các phiên gộp tính tới đó, trong đó phiên khớp nhiều cổ phiếu được tính nặng hơn. Hình này đi theo đúng chuỗi giá và khối lượng bạn đã nạp, và đường này là mức giá bình quân đã được trả, tính theo khối lượng. Đường đi lên là các phiên nhiều khối lượng đang khớp ở giá cao dần; đi xuống là ở giá thấp dần.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the average price of the pooled sessions up to then, with heavier-volume sessions counting more. It follows the price and volume series you loaded, and the line is the average price paid, weighted by volume. When it rises the heavy-volume sessions are trading at higher and higher prices; when it falls at lower and lower ones.',
      ),
      cot: d(
        'Mỗi cột là VWAP tính tới một phiên, cột cuối bên phải là phiên gần nhất. Đỉnh cột là giá vốn bình quân của người đã mua trong quãng ấy: giá hiện tại nằm trên đỉnh cột là phần đông đang có lãi, nằm dưới là phần đông đang lỗ.',
        'Each bar is the VWAP up to one session, the last one on the right being the latest. The top of a bar is the average cost of those who bought in that span: a current price above it means most of them are in profit, below it most are at a loss.',
      ),
    },
  },

  'do-bien-dong-lich-su': {
    truc: {
      sample: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên giá lấy mẫu (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, lấy mẫu dài hay ngắn hơn thì độ biến động ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: đi lên là những phiên cũ vừa thêm vào mẫu dao động mạnh hơn giai đoạn gần đây, đi xuống là chúng êm hơn.',
          'The line runs left to right along the Sample sessions (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what volatility comes out at with a longer or shorter sample, not market history. The line has no fixed direction: where it rises, the older sessions just added to the sample swung harder than the recent stretch; where it falls, they were calmer.',
        ),
        cot: d(
          'Mỗi cột là độ biến động năm hoá của một cỡ mẫu, cột tô đặc là số phiên bạn đang nhập. Mẫu ngắn phản ứng nhanh với tin mới nhưng dễ bị vài phiên bất thường bóp méo; mẫu dài ổn định hơn nhưng chậm nhận ra thị trường đã đổi.',
          'Each bar is annualized volatility for one sample size, and the solid one is the number you have entered. A short sample reacts fast to news but is easily distorted by a few odd sessions; a long one is steadier but slow to notice the market has changed.',
        ),
      },
      tradingDays: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên giao dịch một năm (N), chạy hết dải cho phép của ô chứ không quanh con số bạn nhập, vì ô chỉ nhận những quy ước hợp lý về số phiên trong một năm; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, nhưng trục ngang chỉ đổi hệ số quy đổi từ phiên sang năm, nên nó không phải diễn biến thị trường. Đường đi lên và thoải dần: độ biến động một phiên được nhân với căn bậc hai của số phiên trong năm.',
          'The line runs left to right along the Trading sessions per year (N) field, spanning the whole range the field allows instead of surrounding your figure, because the field only accepts sensible conventions for the sessions in a year; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded, but the horizontal axis only changes the factor that converts a session into a year, so it is not market history. The line rises ever more gently: one session’s volatility is multiplied by the square root of the sessions in a year.',
        ),
        cot: d(
          'Mỗi cột là độ biến động năm hoá theo một quy ước số phiên trong năm, cột cao dần về bên phải và cột tô đặc là quy ước bạn đang nhập. Chênh lệch giữa các quy ước thường dùng chỉ là một phần nhỏ của chính con số, ít hơn nhiều so với chênh lệch do chọn cỡ mẫu.',
          'Each bar is annualized volatility under one convention for the sessions in a year; bars grow taller to the right and the solid one is the convention you have entered. The difference between the usual conventions is only a small fraction of the figure itself, far less than the difference made by the sample size.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là độ biến động năm hoá tính trên các phiên lấy mẫu tới đó. Đây là số đo độ rộng dao động của chuỗi bạn nạp, và nó không cho biết giá lên hay xuống. Đường đi lên là lợi suất các phiên đang phân tán rộng hơn, tức cổ phiếu khó đoán hơn; đi xuống là các phiên đang đều tay hơn.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the annualized volatility computed on the sampled sessions up to then. It measures how wide the swings are on the series you loaded, and it says nothing about whether the price went up or down. When it rises session returns are scattering wider, so the share is harder to predict; when it falls the sessions are getting more even.',
      ),
      cot: d(
        'Mỗi cột là độ biến động lịch sử tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột cao là quãng cổ phiếu khó giữ vì lên xuống mạnh; so cột cuối với mức quen thuộc của cả dãy để biết hôm nay đang biến động hơn hay kém thường lệ.',
        'Each bar is the historical volatility up to one session, the last one on the right being the latest. A tall bar is a stretch when the share was hard to hold because it moved so much; compare the last bar with the usual level of the row to see whether today is more or less volatile than normal.',
      ),
    },
  },

  'ty-le-khoi-luong': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên lấy trung bình (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi khối lượng bạn đã nạp: cùng khối lượng phiên gần nhất ấy, so với mức trung bình của nhiều hay ít phiên hơn thì tỷ lệ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên là những phiên cũ vừa thêm vào giao dịch thưa hơn gần đây, nên mức trung bình hạ xuống và phiên gần nhất trông sôi động hơn; đường đi xuống là trước đây thanh khoản từng cao hơn.',
          'The line runs left to right along the Sessions to average (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the volume series you loaded: for that same latest volume, what the ratio comes out at against the average of more or fewer sessions, not market history. Where the line rises, the older sessions just added traded more thinly than recently, so the average drops and the latest session looks busier; where it falls, liquidity used to be higher.',
        ),
        cot: d(
          'Mỗi cột là tỷ lệ khối lượng ứng với một số phiên lấy trung bình, cột tô đặc là số phiên bạn đang nhập. Cột cao hơn mức một lần là phiên gần nhất khớp nhiều hơn thường lệ; nếu mọi cột đều trên mức ấy thì kết luận này không phụ thuộc cách chọn số phiên.',
          'Each bar is relative volume for one averaging length, and the solid one is the number you have entered. A bar above one time means the latest session traded more than usual; if every bar is above that level, the conclusion does not depend on the length you choose.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là khối lượng của phiên đó gấp bao nhiêu lần khối lượng trung bình các phiên liền trước. Đây là số đo mức sôi động của giao dịch, không phải đường giá, và nó không cho biết giá lên hay xuống. Đường đi lên là tỷ lệ của phiên ấy cao hơn phiên liền trước, đi xuống là thấp hơn; chỉ khi nằm trên mức một lần thì phiên ấy mới khớp nhiều hơn thường lệ. Mức một lần là khối lượng bằng đúng trung bình.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is how many times that session’s volume was the average volume of the sessions just before it. It measures how busy trading is, not the price line, and it says nothing about whether the price went up or down. When it rises that session’s ratio is higher than the previous session’s, when it falls lower; only above one time did the session trade more than usual. One time means volume exactly at its average.',
      ),
      cot: d(
        'Mỗi cột là tỷ lệ khối lượng của một phiên, cột cuối bên phải là phiên gần nhất. Cột nhô hẳn lên so với cả dãy là phiên có khối lượng đột biến; một cú tăng hay giảm giá đi kèm cột như thế đáng tin hơn một cú đi kèm cột thấp.',
        'Each bar is the relative volume of one session, the last one on the right being the latest. A bar standing far above the row is a session with a volume spike; a price jump or drop that comes with such a bar is more trustworthy than one that comes with a short bar.',
      ),
    },
  },
};
