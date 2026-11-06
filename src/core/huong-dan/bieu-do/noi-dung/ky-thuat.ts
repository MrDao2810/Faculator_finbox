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
          'The line runs left to right along the Number of sessions (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: what the latest SMA comes out at for a different number of sessions, so the horizontal axis counts sessions, not dates, and the chart is not market history. Where the line falls, recent prices are above older ones, that is an uptrend: the longer the average, the more the cheap older sessions drag it down. Where it rises, recent prices are below older ones.',
        ),
        cot: d(
          'Mỗi cột là SMA ứng với một số phiên, cột tô đặc là số phiên bạn đang nhập. Đặt giá phiên gần nhất cạnh dãy cột: giá nằm trên mọi cột là đang đứng trên cả đường trung bình ngắn lẫn dài.',
          'Each bar is the SMA for one number of sessions, and the solid one is the number you have entered. Hold the latest price against the row: a price above every bar is standing over both the short and the long averages.',
        ),
        diem: d(
          'Mỗi chấm là SMA của phiên gần nhất tính với một mức của ô Số phiên (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. Mọi chấm tính trên cùng chuỗi giá bạn đã nạp, nên đây không phải diễn biến thị trường. Sang phải, mỗi chấm gộp thêm những phiên cũ hơn: chấm cao hơn chấm bên trái nó là các phiên vừa gộp có giá bình quân cao hơn SMA của chấm ấy, chấm thấp hơn là ngược lại. Vì thế dãy chấm đi xuống là giá cũ thấp hơn giá gần đây, đi lên là giá cũ cao hơn.',
          'Each dot is the latest SMA at one level of the Number of sessions (n) field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own figure. Every dot uses the same price series you loaded, so this is not market history. Moving right, each dot folds in older sessions: a dot above its left neighbor means the sessions just added average more than that neighbor’s SMA, a lower dot the opposite. So a row that falls means older prices were below recent ones; a row that rises means they were above.',
        ),
        bac: d(
          'Mỗi bậc là SMA của phiên gần nhất với một số phiên nguyên của ô Số phiên (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Giữa hai số phiên liền nhau không có SMA nào để tính, nên bậc nằm ngang tới số kế tiếp rồi mới nhảy. Mỗi lần nhảy là gộp thêm đúng một phiên cũ: bậc đi lên khi giá phiên ấy cao hơn SMA đang có, đi xuống khi thấp hơn, và cùng một khoảng chênh thì càng sang phải bước nhảy càng nhỏ, vì nó được chia cho nhiều phiên hơn. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường.',
          'Each step is the latest SMA for one whole number of sessions in the Number of sessions (n) field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. There is no SMA between two neighboring numbers, so each step stays level, then jumps. Each jump folds in one older session: the staircase rises when its price is above the current SMA and falls when it is below, and the same gap gives smaller jumps further right, shared among more sessions. It is computed on the price series you loaded, not market history.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Hình có hai đường cùng đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: đường đậm có tô nền là SMA, đường mảnh màu nhạt là Giá đóng cửa. Hình này đi theo đúng chuỗi giá bạn đã nạp, và đường SMA chính là xu thế của giá đã làm mượt. SMA đi lên là giá bình quân của các phiên gần đây đang tăng; đi xuống là đang giảm. Giá đóng cửa nằm trên SMA là giá đang mạnh hơn mức bình quân của chính nó, và chỗ hai đường cắt nhau là lúc xu thế ngắn hạn đổi chiều.',
        'Two lines run together from the oldest session on the left to the most recent session on the right: the bold shaded one is the SMA, the thin pale one is the Closing price. It follows the price series you loaded, and the SMA line is the price trend itself, smoothed. When the SMA rises the average price of recent sessions is going up; when it falls it is going down. A closing price above the SMA is a price stronger than its own average, and where the two lines cross the short-term trend is turning.',
      ),
      diem: d(
        'Mỗi chấm là SMA tính tới một phiên, xếp từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; chỉ SMA thành chấm, còn Giá đóng cửa vẫn là đường mảnh màu nhạt nối liền. Hình đi theo đúng chuỗi giá bạn đã nạp. Dãy chấm đi lên là giá bình quân của các phiên gần đây đang tăng, đi xuống là đang giảm. Những phiên đầu chưa đủ số phiên để tính nên không có chấm. Chỗ đường giá xuyên qua dãy chấm là lúc giá cắt qua mức bình quân của chính nó.',
        'Each dot is the SMA up to one session, laid out from the oldest session on the left to the most recent session on the right; only the SMA turns into dots, while the Closing price stays a thin pale unbroken line. It follows the price series you loaded. When the row of dots rises the average price of recent sessions is going up; when it falls it is going down. The first sessions have no dot, as there are not yet enough sessions to average. Where the price line passes through the row of dots, the price is crossing its own average.',
      ),
      bac: d(
        'Mỗi bậc là SMA của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy, vì SMA chỉ tính lại khi có thêm một giá đóng cửa; Giá đóng cửa vẽ kèm vẫn là đường nối liền. Mỗi bước nhảy bằng giá phiên mới vào trừ giá phiên vừa rời khỏi cửa sổ, chia cho số phiên: bậc đi lên khi phiên mới đắt hơn phiên vừa rời đi, đi xuống khi rẻ hơn, và bậc nhảy cao là hai giá ấy cách xa nhau. Hình theo đúng chuỗi giá bạn đã nạp.',
        'Each step is the SMA of one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and then jumps, because the SMA is only recalculated when another close arrives; the Closing price drawn alongside stays an unbroken line. Each jump is the new session’s price minus the price of the session leaving the window, divided by the number of sessions: the staircase rises when the newcomer is priced above the one leaving and falls when it is priced below, and a tall jump means those two prices are far apart.',
      ),
      nen: d(
        'Mỗi phiên một cây nến, từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: thân đi từ giá mở cửa tới giá đóng cửa, bấc từ giá thấp nhất tới cao nhất; thân xanh là phiên tăng, đóng cửa không thấp hơn mở cửa, thân đỏ là phiên giảm. Đường SMA vẽ đè lên nến, còn đường giá đóng cửa thì không vẽ vì thân nến đã mang giá ấy. Nến nằm trên đường SMA là giá đang đứng trên mức bình quân của nó, nằm dưới là đứng dưới; đường SMA đi lên là mặt bằng giá đang tăng, đi xuống là đang giảm.',
        'One candle per session, from the oldest session on the left to the most recent session on the right: the body spans the opening and closing prices, the wick the low and the high; a green body is an up session, closing no lower than it opened, a red one a down session. The SMA line is drawn over the candles, and the closing price line is dropped because the bodies already carry that price. Candles above the SMA line mean the price stands over its own average, candles below it under; when the SMA rises the price level is climbing, when it falls it is sliding.',
      ),
    },
  },

  'ema-n-phien': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi số phiên thì EMA của phiên gần nhất ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống là giá gần đây đang cao hơn giá cũ: EMA càng dài thì càng chậm theo kịp giá mới nên càng nằm thấp. Đường đi lên là giá gần đây đang thấp hơn giá cũ, và EMA dài còn giữ lại mức giá cao của trước đó.',
          'The line runs left to right along the Number of sessions (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the latest EMA is for a different number of sessions, not market history. Where the line falls, recent prices are above older ones: the longer the EMA, the slower it catches up with new prices and the lower it sits. Where it rises, recent prices are below older ones, and a long EMA still holds on to the higher prices from before.',
        ),
        cot: d(
          'Mỗi cột là EMA ứng với một số phiên, cột tô đặc là số phiên bạn đang nhập. Cột bên trái bám sát giá hiện tại nhất; khoảng chênh giữa cột trái cùng và cột phải cùng cho thấy giá vừa chạy nhanh tới mức nào.',
          'Each bar is the EMA for one number of sessions, and the solid one is the number you have entered. The bars on the left hug the current price most closely; the gap between the leftmost and the rightmost bar shows how fast the price has just been moving.',
        ),
        diem: d(
          'Mỗi chấm là EMA của phiên gần nhất tính với một mức của ô Số phiên (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. Khác SMA, chấm nào cũng dùng cả chuỗi giá bạn đã nạp; số phiên chỉ quyết định phiên mới được tính nặng tới đâu, nên chấm bên trái nghiêng về giá mới, chấm bên phải giữ nhiều dấu vết của giá cũ. Đây là phép thử trên cùng một chuỗi, không phải diễn biến thị trường. Dãy chấm đi xuống là giá gần đây cao hơn giá cũ, đi lên là thấp hơn.',
          'Each dot is the latest EMA at one level of the Number of sessions (n) field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own figure. Unlike an SMA, every dot uses the whole price series you loaded; the number of sessions only sets how heavily the newest sessions count, so dots on the left lean on fresh prices and dots on the right keep more of the old ones. This is not market history. A row that falls means recent prices are above older ones; one that rises means they are below.',
        ),
        bac: d(
          'Mỗi bậc là EMA của phiên gần nhất với một số phiên nguyên của ô Số phiên (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Không có EMA cho số phiên lẻ, nên bậc nằm ngang tới số kế tiếp rồi mới nhảy; mỗi lần nhảy, hệ số làm mượt nhỏ đi một nấc và phiên mới nhẹ cân hơn một chút. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Các bậc đi xuống là giá gần đây đang cao hơn giá cũ, đi lên là đang thấp hơn.',
          'Each step is the latest EMA for one whole number of sessions in the Number of sessions (n) field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. There is no EMA for a fractional number of sessions, so each step stays level until the next whole number, then jumps; at each jump the smoothing factor shrinks a notch and the newest session weighs a little less. It is computed on the price series you loaded, not market history. A staircase that falls means recent prices are above older ones; one that rises means they are below.',
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
      diem: d(
        'Mỗi chấm là EMA tính tới một phiên, xếp từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; chấm đầu tiên ở phiên thứ n, nơi EMA được mồi bằng trung bình đơn của n phiên đầu. Hình đi theo đúng chuỗi giá bạn đã nạp. Chấm cao hơn chấm trước nó là phiên ấy đóng cửa trên mức EMA cũ, thấp hơn là đóng cửa dưới, và hai chấm cách xa nhau là giá phiên ấy nằm xa EMA. Dãy chấm đi lên là xu thế giá đang tăng, đi xuống là đang giảm.',
        'Each dot is the EMA up to one session, laid out from the oldest session on the left to the most recent session on the right; the first dot sits at session n, where the EMA is seeded with the simple average of the first n sessions. It follows the price series you loaded. A dot above the one before it is a session that closed over the old EMA, a lower dot one that closed under it, and a wide gap between two dots means that close sat far from the EMA. When the row rises the price trend is climbing; when it falls it is sliding.',
      ),
      bac: d(
        'Mỗi bậc là EMA của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy, vì EMA chỉ tính lại khi có giá đóng cửa mới. Mỗi bước nhảy là một phần cố định của khoảng chênh giữa giá đóng cửa mới với EMA phiên trước, phần ấy càng nhỏ khi số phiên càng lớn: bậc đi lên khi phiên đóng cửa trên EMA cũ, đi xuống khi đóng cửa dưới, và bậc nhảy cao là giá phiên ấy bứt xa khỏi mức bình quân. Hình theo đúng chuỗi giá bạn đã nạp.',
        'Each step is the EMA of one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and then jumps, because the EMA only moves when a new close arrives. Each jump is a fixed share of the gap between the new close and the previous EMA, a share that shrinks as the number of sessions grows: the staircase rises when a session closes above the old EMA and falls when it closes below, and a tall jump means that close broke well away from the average.',
      ),
      nen: d(
        'Nến của từng phiên xếp từ phiên cũ nhất bên trái tới phiên gần nhất bên phải, đường EMA vẽ đè lên trên: thân nến nối giá mở cửa với giá đóng cửa, bấc nối giá thấp nhất với cao nhất; thân xanh là phiên tăng, đóng cửa không thấp hơn mở cửa, thân đỏ là phiên giảm. Phiên có giá đóng cửa nằm trên đường EMA đúng là phiên EMA đi lên, đóng cửa dưới đường là phiên EMA đi xuống; nến càng xa đường thì giá càng chạy xa mức bình quân của nó.',
        'The candles run from the oldest session on the left to the most recent session on the right, one per session, with the EMA line drawn on top: the body joins the opening and closing prices, the wick the low and the high; a green body is an up session, closing no lower than it opened, a red one a down session. A session whose close lies above the EMA line is exactly a session in which the EMA rises, a close below the line one in which it falls; the further a candle sits from the line, the further the price has run from its average.',
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
        diem: d(
          'Mỗi chấm là MACD của phiên gần nhất tính với một mức của ô Chu kỳ EMA nhanh, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. EMA chậm giống nhau ở mọi chấm, nên chấm này khác chấm kia chỉ vì đường nhanh. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Chấm nằm trên mức 0 là đường nhanh đang ở trên đường chậm; dãy chấm thường đi lên khi MACD đang âm và đi xuống khi đang dương, vì chu kỳ nhanh càng dài thì đường nhanh càng giống đường chậm.',
          'Each dot is the latest MACD at one level of the Fast EMA period field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own figure. The slow EMA is the same for every dot, so dots differ only through the fast average. It is computed on the price series you loaded, not market history. A dot above 0 means the fast average is over the slow one; the row usually rises while MACD is negative and falls while it is positive, because a longer fast period makes the fast line look more like the slow one.',
        ),
        bac: d(
          'Mỗi bậc là MACD của phiên gần nhất với một chu kỳ nguyên của ô Chu kỳ EMA nhanh, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Không có chu kỳ lẻ nào giữa hai số liền nhau, nên bậc nằm ngang rồi mới nhảy. EMA chậm đứng yên trên cả trục, nên mỗi bước nhảy đúng bằng phần EMA nhanh đổi khi chậm đi một phiên: bậc đi lên là EMA nhanh vừa nhích lên, đi xuống là vừa hạ xuống. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường.',
          'Each step is the latest MACD for one whole period in the Fast EMA period field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. There is no fractional period between two neighboring numbers, so each step stays level and then jumps. The slow EMA holds still across the axis, so every jump is exactly how much the fast EMA moves when it is stretched by one session: the staircase rises when the fast EMA edges up and falls when it drops. It is computed on the price series you loaded, not market history.',
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
        diem: d(
          'Mỗi chấm là MACD của phiên gần nhất tính với một mức của ô Chu kỳ EMA chậm, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. EMA nhanh giống nhau ở mọi chấm, nên chấm càng cao là EMA chậm phía sau nó càng thấp. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Dãy chấm đi lên khi giá cũ thấp hơn giá gần đây, vì đường chậm càng dài càng bị giá cũ kéo xuống; đi xuống khi giá cũ cao hơn.',
          'Each dot is the latest MACD at one level of the Slow EMA period field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own figure. The fast EMA is the same for every dot, so the higher a dot, the lower the slow EMA behind it. It is computed on the price series you loaded, not market history. The row rises when older prices are below recent ones, since a longer slow line is dragged down by them, and falls when older prices are above.',
        ),
        bac: d(
          'Mỗi bậc là MACD của phiên gần nhất với một chu kỳ nguyên của ô Chu kỳ EMA chậm, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Chu kỳ chỉ là số phiên nguyên, nên bậc nằm ngang tới số kế tiếp rồi mới nhảy. EMA nhanh đứng yên trên cả trục, nên mỗi bước nhảy là phần EMA chậm đổi khi dài thêm một phiên, theo chiều ngược lại: bậc đi lên là EMA chậm vừa hạ xuống, đi xuống là nó vừa nhích lên. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường.',
          'Each step is the latest MACD for one whole period in the Slow EMA period field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. A period is a whole number of sessions, so each step stays level until the next one and then jumps. The fast EMA holds still across the axis, so every jump mirrors how the slow EMA moves when it grows by one session: the staircase rises when the slow EMA has just dropped and falls when it has edged up. It is computed on the price series you loaded, not market history.',
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
      diem: d(
        'Mỗi chấm là MACD tính tới một phiên, tức EMA nhanh trừ EMA chậm, xếp từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; những phiên đầu chưa đủ chu kỳ chậm nên chưa có chấm. Đây là số đo đà trên chuỗi giá bạn đã nạp, không phải đường giá. Dãy chấm đi lên là xu thế ngắn hạn đang mạnh lên so với xu thế dài hạn, đi xuống là đang yếu đi. Chấm nằm trên mức 0 là phiên EMA nhanh đứng trên EMA chậm; chỗ dãy chấm đổi phía qua mức 0 là phiên hai đường vừa cắt nhau.',
        'Each dot is the MACD up to one session, the fast EMA minus the slow EMA, laid out from the oldest session on the left to the most recent session on the right; the first sessions have no dot until the slow period is filled. It measures momentum on the price series you loaded, not the price itself. When the row rises the short-term trend is gaining on the long-term one; when it falls it is fading. A dot above 0 is a session with the fast EMA over the slow one, and where the row switches sides of 0 the two averages have just crossed.',
      ),
      bac: d(
        'Mỗi bậc là MACD của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy, vì hai đường EMA chỉ tính lại khi có giá đóng cửa mới. Mỗi bước nhảy là phần EMA nhanh đổi trừ phần EMA chậm đổi trong phiên ấy: bậc đi lên khi đường nhanh tăng nhiều hơn, hoặc giảm ít hơn, đường chậm, tức đà ngắn hạn đang mạnh lên; bậc đi xuống là ngược lại. Hình theo chuỗi giá bạn đã nạp, không phải đường giá.',
        'Each step is the MACD of one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and then jumps, because both EMAs only move on a new close. Each jump is the fast EMA’s move minus the slow EMA’s move in that session: the staircase rises when the fast line gains more, or loses less, than the slow one, so short-term momentum is building, and falls in the opposite case. It follows the price series you loaded, not the price line.',
      ),
      laiLo: d(
        'Đường MACD đi từ phiên cũ nhất nằm bên trái tới phiên gần nhất nằm bên phải, phần giữa đường với vạch 0 được tô hai màu: nằm trên vạch 0 tô xanh là những phiên EMA nhanh đứng trên EMA chậm, xu thế ngắn hạn mạnh hơn dài hạn; nằm dưới vạch 0 tô đỏ là ngược lại. Màu nói dấu của MACD, không nói giá đang lãi hay lỗ. Dạng biểu đồ này hiện khi MACD có đổi dấu trên chuỗi bạn đã nạp. Chỗ đường cắt vạch 0 là phiên hai đường EMA cắt nhau; đường đi lên là đà ngắn hạn đang mạnh lên, đi xuống là đang yếu đi.',
        'The MACD line runs from the oldest session on the left to the most recent session on the right, with the space between it and the zero line shaded: green above the zero line for sessions with the fast EMA over the slow one, red below it for the reverse. The colors show the sign of MACD, not a profit or loss on the price. This form appears when MACD changes sign on the series you loaded. Where the line crosses the zero line the two EMAs cross; the line rises as short-term momentum builds and falls as it fades.',
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
        diem: d(
          'Mỗi chấm là đường tín hiệu của phiên gần nhất tính với một mức của ô Chu kỳ EMA nhanh, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. Đổi chu kỳ nhanh là đổi cả chuỗi MACD, nên mỗi chấm là một bản làm mượt khác của đà giá trên chuỗi bạn đã nạp, không phải diễn biến thị trường. Chấm nằm trên mức 0 là MACD những phiên vừa qua bình quân dương. Dãy chấm đi lên hay đi xuống tuỳ chu kỳ mới làm MACD gần đây lớn lên hay nhỏ đi.',
          'Each dot is the latest signal line at one level of the Fast EMA period field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own figure. Changing the fast period changes the whole MACD series, so each dot is a different smoothing of price momentum on the series you loaded, not market history. A dot above 0 means MACD has averaged positive over the last sessions. Whether the row rises or falls depends on whether the new period makes recent MACD larger or smaller.',
        ),
        bac: d(
          'Mỗi bậc là đường tín hiệu của phiên gần nhất với một chu kỳ nguyên của ô Chu kỳ EMA nhanh, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Không có chu kỳ lẻ nào giữa hai số liền nhau, nên bậc nằm ngang rồi mới nhảy sang chu kỳ kế tiếp. Mỗi lần nhảy, đường nhanh chậm đi một phiên và cả chuỗi MACD đổi theo: bậc đi lên là MACD gần đây, tính bình quân, vừa lớn lên, đi xuống là vừa nhỏ đi. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường.',
          'Each step is the latest signal line for one whole period in the Fast EMA period field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. There is no fractional period between two neighboring numbers, so each step stays level before jumping to the next period. At each jump the fast line slows by one session and the whole MACD series shifts: the staircase rises when recent MACD, on average, has just grown and falls when it has shrunk. It is computed on the price series you loaded, not market history.',
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
        diem: d(
          'Mỗi chấm là đường tín hiệu của phiên gần nhất tính với một mức của ô Chu kỳ EMA chậm, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. Mỗi chấm là MACD đã làm mượt với một đường chậm khác, trên cùng chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Dãy chấm thường đi lên khi giá cũ thấp hơn giá gần đây, vì đường chậm càng dài càng bị giá cũ kéo xuống, và đi xuống khi giá cũ cao hơn. Chấm nằm dưới mức 0 là MACD gần đây bình quân âm.',
          'Each dot is the latest signal line at one level of the Slow EMA period field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own figure. Each dot is MACD smoothed against a different slow line, on the same price series you loaded, not market history. The row usually rises when older prices are below recent ones, since a longer slow line is pulled down by them, and falls when older prices are above. A dot below 0 means recent MACD has averaged negative.',
        ),
        bac: d(
          'Mỗi bậc là đường tín hiệu của phiên gần nhất với một chu kỳ nguyên của ô Chu kỳ EMA chậm, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Chu kỳ là số phiên nguyên, nên bậc nằm ngang tới số kế tiếp rồi mới nhảy: mỗi lần nhảy, đường chậm dài thêm một phiên và cả chuỗi MACD dịch theo. Bậc đi lên thường là đường chậm vừa bị giá cũ kéo xuống, đi xuống là vừa bị kéo lên. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường.',
          'Each step is the latest signal line for one whole period in the Slow EMA period field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. Periods are whole sessions, so each step stays level until the next one, then jumps: at each jump the slow line grows by one session and the whole MACD series shifts. A staircase that rises usually means older prices have pulled the slow line down; one that falls, that they pulled it up. It is computed on the price series you loaded, not market history.',
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
        diem: d(
          'Mỗi chấm là đường tín hiệu của phiên gần nhất tính với một mức của ô Chu kỳ đường tín hiệu, từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. Chuỗi MACD giữ nguyên ở mọi chấm, chỉ đổi số phiên làm mượt: chấm bên trái đặt nặng MACD mới, chấm bên phải nhớ nhiều MACD cũ hơn. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Dãy chấm đi lên khi MACD cũ cao hơn MACD hiện tại, đi xuống khi thấp hơn.',
          'Each dot is the latest signal line at one level of the Signal line period field, from about half to about one and a half times the number you have entered; the dot on the dashed vertical line is your own figure. The MACD series is the same for every dot and only the smoothing length changes: dots on the left lean on the latest MACD, dots on the right remember more of the older readings. It is computed on the price series you loaded, not market history. The row rises when older MACD was above the current one and falls when it was below.',
        ),
        bac: d(
          'Mỗi bậc là đường tín hiệu của phiên gần nhất với một chu kỳ nguyên của ô Chu kỳ đường tín hiệu, từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Không có số phiên làm mượt lẻ, nên bậc nằm ngang tới số kế tiếp rồi mới nhảy; mỗi lần nhảy, MACD mới nhất nhẹ cân đi một nấc. Bậc đi lên là MACD cũ đang cao hơn MACD hiện tại, đi xuống là thấp hơn. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường.',
          'Each step is the latest signal line for one whole period in the Signal line period field, from about half to about one and a half times your number; the step starting at the dashed vertical line is your own figure. There is no fractional smoothing length, so each step stays level until the next number and then jumps, each jump giving the newest MACD reading a little less weight. A staircase that rises means older MACD sat above the current reading; one that falls means it sat below. It is computed on the price series you loaded, not market history.',
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
      diem: d(
        'Mỗi chấm là đường tín hiệu tính tới một phiên, xếp từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; những phiên đầu chưa có chấm vì chuỗi MACD chưa đủ dài để làm mượt. Đây là bản làm mượt của đà giá trên chuỗi bạn đã nạp, không phải đường giá. Chấm nào cao hơn chấm trước là phiên ấy MACD nằm trên đường tín hiệu, thấp hơn là nằm dưới; nên dãy chấm đi lên khi MACD cứ đứng trên nó, đi xuống khi MACD cứ đứng dưới. Chấm trên mức 0 là MACD gần đây bình quân dương.',
        'Each dot is the signal line up to one session, laid out from the oldest session on the left to the most recent session on the right; the first sessions have no dot because the MACD series is not yet long enough to smooth. It is a smoothed momentum reading on the series you loaded, not the price line. A dot above the one before it marks a session with MACD over the signal line, a lower dot one with MACD under it, so the row rises while MACD stays on top and falls while it stays below. A dot above 0 means recent MACD has averaged positive.',
      ),
      bac: d(
        'Mỗi bậc là đường tín hiệu của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy, vì nó chỉ tính lại khi có một giá trị MACD mới. Mỗi bước nhảy là một phần cố định của khoảng cách giữa MACD phiên ấy với đường tín hiệu phiên trước: bậc đi lên khi MACD nằm trên, đi xuống khi MACD nằm dưới, và bậc nhảy cao là MACD vừa bứt xa khỏi đường tín hiệu. Hình theo chuỗi giá bạn đã nạp, không phải đường giá.',
        'Each step is the signal line of one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and then jumps, because it is only recalculated when a new MACD value arrives. Each jump is a fixed share of the distance between that session’s MACD and the previous signal line: the staircase rises when MACD is above and falls when MACD is below, and a tall jump means MACD has just broken far from the signal line. It follows the price series you loaded, not the price line.',
      ),
      laiLo: d(
        'Đường tín hiệu đi từ phiên cũ nhất nằm bên trái tới phiên gần nhất nằm bên phải, phần giữa đường với vạch 0 tô hai màu: nằm trên vạch 0 tô xanh là những phiên MACD gần đây bình quân dương, tức tính bình quân thì đường nhanh nằm trên đường chậm; nằm dưới vạch 0 tô đỏ là bình quân âm. Màu nói dấu, không nói giá lãi hay lỗ. Dạng biểu đồ này hiện khi đường tín hiệu có đổi dấu trên chuỗi bạn đã nạp. Là trung bình của MACD nên nó không bao giờ cắt vạch 0 sớm hơn MACD; đường đi lên khi MACD đứng trên nó, đi xuống khi MACD đứng dưới.',
        'The signal line runs from the oldest session on the left to the most recent session on the right, the space between it and the zero line shaded: green above the zero line where recent MACD averaged positive, the fast line over the slow one on average, red below it where that average was negative. The colors show a sign, not a profit or loss. This form appears when the signal line changes sign on the series you loaded. Being an average of MACD, it never crosses the zero line before MACD does; it rises while MACD sits above it and falls while MACD sits below.',
      ),
    },
  },

  'rsi-wilder': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi số phiên thì RSI của phiên gần nhất ra bao nhiêu, không phải diễn biến thị trường. Số phiên càng dài thì RSI càng lì và càng bị kéo về giữa thang điểm, nên đường thường đi lên khi RSI ngắn hạn đang thấp và đi xuống khi RSI ngắn hạn đang cao.',
          'The line runs left to right along the Number of sessions (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the latest RSI comes out at for a different number of sessions, not market history. The longer the period, the more sluggish RSI gets and the more it is pulled toward the middle of the scale, so the line usually rises when short-period RSI is low and falls when it is high.',
        ),
        cot: d(
          'Mỗi cột là RSI ứng với một số phiên, cột tô đặc là số phiên bạn đang nhập. Cùng một chuỗi giá mà cột bên trái có thể đã báo quá bán trong khi cột bên phải thì chưa: số phiên ngắn cho tín hiệu sớm và nhiều hơn, số phiên dài cho tín hiệu hiếm mà chậm.',
          'Each bar is RSI for one number of sessions, and the solid one is the number you have entered. On the same price series a bar on the left may say oversold while one on the right does not yet: a short period signals early and often, a long one rarely and late.',
        ),
        diem: d(
          'Mỗi chấm là RSI của phiên gần nhất tính với một mức của ô Số phiên (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. Mọi chấm dùng cùng chuỗi giá bạn đã nạp, nên đây là phép thử chu kỳ chứ không phải diễn biến thị trường. Số phiên càng dài thì trung bình tăng và trung bình giảm càng chậm đổi, nên các chấm bên phải thường dồn về giữa thang: dãy chấm đi lên khi RSI ngắn hạn đang thấp, đi xuống khi nó đang cao.',
          'Each dot is the latest RSI at one level of the Number of sessions (n) field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own figure. Every dot uses the same price series you loaded, so this is a test of the period, not market history. The longer the period, the more slowly the average gain and average loss change, so dots on the right tend to bunch toward the middle of the scale: the row rises when short-period RSI is low and falls when it is high.',
        ),
        bac: d(
          'Mỗi bậc là RSI của phiên gần nhất với một số phiên nguyên của ô Số phiên (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. RSI không có chu kỳ lẻ, nên bậc nằm ngang tới số kế tiếp rồi mới nhảy; mỗi lần nhảy, một phiên mới chỉ còn chiếm phần nhỏ hơn trong hai trung bình làm mượt. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Bậc đi lên dần là RSI ngắn hạn đang thấp và bị kéo về giữa thang, đi xuống dần là nó đang cao.',
          'Each step is the latest RSI for one whole number of sessions in the Number of sessions (n) field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. RSI has no fractional period, so each step stays level until the next whole number, then jumps; at each jump a new session carries a slightly smaller share of the two smoothed averages. It is computed on the price series you loaded, not market history. A staircase that rises means short-period RSI is low and being pulled toward the middle; one that falls means it is high.',
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
      diem: d(
        'Mỗi chấm là RSI tính tới một phiên, xếp từ phiên cũ nhất bên trái tới phiên gần nhất bên phải, trên thang từ 0 tới mức tối đa. Đây là sức mạnh của phiên tăng so với phiên giảm trên chuỗi bạn đã nạp, không phải đường giá. Trừ lúc đã chạm đỉnh hay đáy thang, chấm sau cao hơn chấm trước ở phiên giá đóng cửa tăng, thấp hơn ở phiên giảm, ngang bằng ở phiên giá đứng yên; nên dãy chấm đi lên khi tăng lấn át, đi xuống khi giảm lấn át. Chấm vượt vạch 70 là vùng quá mua, chấm dưới vạch 30 là vùng quá bán, khi hai vạch nằm trong khung.',
        'Each dot is the RSI up to one session, running from the oldest session on the left to the most recent session on the right, on a scale from 0 to its top. It weighs up sessions against down sessions on the series you loaded, not the price line. Short of the scale’s ends, a dot sits above the previous one after a session that closed higher, below it after one that closed lower, and level with it after an unchanged close; so the row rises while gains dominate and falls while losses do. Dots past the 70 line are overbought, dots under the 30 line oversold, when those lines are in the frame.',
      ),
      bac: d(
        'Mỗi bậc là RSI của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy, vì RSI chỉ tính lại khi có giá đóng cửa mới. Phiên giá tăng làm bậc đi lên, phiên giảm làm bậc đi xuống, phiên giá đứng yên thì bậc kéo dài không nhảy; cùng một chỗ, phiên biến động càng mạnh thì bậc nhảy càng cao. Bậc vượt vạch 70 là phiên ở vùng quá mua, xuống dưới vạch 30 là quá bán. Hình theo chuỗi giá bạn đã nạp, không phải đường giá.',
        'Each step is the RSI of one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and then jumps, because RSI is only recalculated on a new close. After a session that closes higher the staircase rises, after one that closes lower it falls, and an unchanged close just extends the step; from the same point, a bigger move gives a taller jump. Steps above the 70 line are sessions in overbought territory, steps below the 30 line oversold. It follows the price series you loaded, not the price line.',
      ),
    },
  },

  'roc-toc-do-thay-doi': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên nhìn lại (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: mỗi điểm so giá phiên gần nhất với giá của một phiên lùi xa hơn về quá khứ, nên đọc từ trái sang phải là đi ngược thời gian và hình không phải diễn biến thị trường. Đường đi xuống là càng lùi xa thì giá ngày ấy càng cao so với hôm nay, tức giá đã giảm suốt quãng đó; đường đi lên là giá ngày ấy thấp hơn, tức giá đã tăng.',
          'The line runs left to right along the Number of sessions to look back (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: each point compares the latest price with that of a session further back, so left to right goes back in time and the chart is not market history. Where the line falls, the further back you go the higher that day’s price was than today’s, so the price has been dropping; where it rises, that day’s price was lower, so the price has been climbing.',
        ),
        cot: d(
          'Mỗi cột là ROC ứng với một số phiên nhìn lại, cột tô đặc là số phiên bạn đang nhập. Cột mọc lên trên vạch 0 là hôm nay cao hơn ngày ấy, cột quay xuống dưới vạch 0 là thấp hơn; mọi cột cùng một phía là xu hướng nhất quán ở mọi tầm nhìn.',
          'Each bar is ROC for one lookback, and the solid one is the lookback you have entered. A bar above the zero line means today is higher than that day, a bar below the zero line means lower; all bars on one side means the trend agrees at every horizon.',
        ),
        diem: d(
          'Mỗi chấm so giá phiên gần nhất với giá của đúng một phiên cũ, lùi lại bằng một mức của ô Số phiên nhìn lại (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là số bạn nhập. Đọc từ trái sang phải là đi ngược thời gian, và chấm càng cao thì giá phiên cũ ấy càng thấp. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Dãy chấm đi xuống là càng lùi xa giá càng cao, tức giá đã giảm suốt quãng đó; đi lên là giá đã tăng.',
          'Each dot compares the latest price with the price of exactly one earlier session, going back by one level of the Number of sessions to look back (n) field, from half to one and a half times your number; the dot on the dashed vertical line is your own figure. Reading left to right goes back in time, and the higher a dot, the lower that old session’s price was. It is computed on the price series you loaded, not market history. A row that falls means prices were higher the further back you look, so the price has dropped over that stretch; a row that rises means it has climbed.',
        ),
        bac: d(
          'Mỗi bậc là ROC với một số phiên nhìn lại nguyên của ô Số phiên nhìn lại (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Không có nửa phiên để lùi về, nên bậc nằm ngang rồi mới nhảy sang phiên cũ kế tiếp. Mỗi bước nhảy là biến động của đúng một phiên trong quá khứ: bậc đi lên khi phiên ấy đóng cửa cao hơn phiên trước nó, đi xuống khi thấp hơn, và phiên ấy biến động càng mạnh thì bậc nhảy càng cao. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường.',
          'Each step is ROC for one whole lookback in the Number of sessions to look back (n) field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. There is no half session to look back to, so each step stays level before jumping to the next earlier session. Each jump is the move of exactly one past session: the staircase rises when that session closed above the one before it and falls when it closed below, and the bigger that move, the taller the jump. It is computed on the price series you loaded, not market history.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi, trên chuỗi giá bạn đã nạp, dải của ô Số phiên nhìn lại (n) đang vẽ có cả ROC dương lẫn ROC âm. Phần nằm trên vạch 0 tô xanh là những tầm nhìn lại mà giá hôm nay cao hơn giá ngày ấy, phần nằm dưới vạch 0 tô đỏ là thấp hơn. Đường cắt vạch 0 quanh tầm nhìn lại có giá ngang giá hôm nay. Đây là phép thử trên cùng một chuỗi, không phải diễn biến thị trường; sang phải là lùi xa hơn, đường đi xuống là giá ngày cũ cao dần, đi lên là thấp dần.',
          'This form appears when, on the price series you loaded, the range of the Number of sessions to look back (n) field being drawn holds both positive and negative ROC. The part above the zero line is shaded green for lookbacks where today’s price is above that day’s, the part below it red where it is lower. The line crosses the zero line around the lookback whose price matches today’s. It is a test on one series, not market history; moving right looks further back, and the line falls where older prices get higher and rises where they get lower.',
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
      diem: d(
        'Mỗi chấm là ROC của một phiên, tức giá phiên ấy cao hơn hay thấp hơn giá của số phiên nhìn lại trước nó bao nhiêu phần trăm, xếp từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; những phiên đầu chưa có đủ quãng nhìn lại nên chưa có chấm. Đây là tốc độ của giá trên chuỗi bạn đã nạp, không phải đường giá. Chấm sau cao hơn chấm trước khi phiên mới tăng mạnh hơn, hoặc giảm ít hơn, phiên đứng trước nó đúng số phiên nhìn lại; dãy chấm đi lên là giá tăng nhanh dần, đi xuống là ngược lại. Chấm trên mức 0 là giá cao hơn kỳ nhìn lại.',
        'Each dot is the ROC of one session, how many percent its price stood above or below the price the lookback number of sessions earlier, running from the oldest session on the left to the most recent session on the right; the first sessions have no dot until a full lookback exists. It measures the speed of price on the series you loaded, not the price line. A dot sits above the previous one when the new session gained more, or lost less, than the session one lookback before it; the row rises as gains speed up and falls the other way. A dot above 0 is a price over the lookback price.',
      ),
      bac: d(
        'Mỗi bậc là ROC của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy, vì ROC chỉ tính lại khi có giá đóng cửa mới. Mỗi lần nhảy, quãng nhìn lại trượt thêm một phiên: bậc đi lên khi phiên mới vào tăng nhiều hơn, hoặc giảm ít hơn, phiên đứng trước nó đúng số phiên nhìn lại, đi xuống khi kém hơn. Bậc nằm trên mức 0 là giá cao hơn kỳ nhìn lại. Hình theo chuỗi giá bạn đã nạp, không phải đường giá.',
        'Each step is the ROC of one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and then jumps, because ROC is only recalculated on a new close. At each jump the lookback window slides on by one session: the staircase rises when the new session gains more, or loses less, than the session one lookback before it, and falls when it does worse. A step above 0 is a price over the lookback price. It follows the price series you loaded, not the price line.',
      ),
      laiLo: d(
        'Đường ROC đi từ phiên cũ nhất nằm bên trái tới phiên gần nhất nằm bên phải, phần giữa đường với vạch 0 tô hai màu: nằm trên vạch 0 tô xanh là những phiên giá cao hơn giá của kỳ nhìn lại, nằm dưới vạch 0 tô đỏ là thấp hơn. Màu là dấu của tốc độ, không phải lãi lỗ của một lệnh nào. Dạng biểu đồ này hiện khi ROC có đổi dấu trên chuỗi bạn đã nạp. Chỗ đường cắt vạch 0 là lúc giá vượt qua mức của kỳ nhìn lại; đường đi lên là giá tăng nhanh dần hoặc giảm chậm lại, đi xuống là ngược lại.',
        'The ROC line runs from the oldest session on the left to the most recent session on the right, the space between it and the zero line shaded: green above the zero line for sessions priced over the lookback price, red below it for sessions priced under it. The color is the sign of the speed, not the profit or loss of any trade. This form appears when ROC changes sign on the series you loaded. Where the line crosses the zero line the price passes the lookback level; the line rises as gains speed up or losses slow down, and falls the other way.',
      ),
    },
  },

  'dong-luong-momentum': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên nhìn lại (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: mỗi điểm là giá phiên gần nhất trừ giá của một phiên lùi xa hơn về quá khứ, nên đọc từ trái sang phải là đi ngược thời gian và hình không phải diễn biến thị trường. Đường đi xuống là càng lùi xa thì giá ngày ấy càng cao hơn hôm nay, tức giá đã mất dần suốt quãng đó; đường đi lên là giá đã được thêm.',
          'The line runs left to right along the Number of sessions to look back (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: each point is the latest price minus the price of a session further back in the past, so left to right goes back in time and the chart is not market history. Where the line falls, the further back you go the more that day’s price exceeds today’s, that is the price has been losing ground over that stretch; where it rises, it has been gaining.',
        ),
        cot: d(
          'Mỗi cột là động lượng ứng với một số phiên nhìn lại, tính bằng đồng, cột tô đặc là số phiên bạn đang nhập. Vì là số đồng chứ không phải phần trăm, cùng một mức tăng giảm tính theo phần trăm thì mã giá cao cho cột dài hơn mã giá thấp; chỉ nên so các cột của cùng một mã.',
          'Each bar is momentum for one lookback, in money terms, and the solid one is the lookback you have entered. Being an amount and not a percentage, the same percentage move gives a high-priced ticker longer bars than a cheap one; compare bars of the same ticker only.',
        ),
        diem: d(
          'Mỗi chấm là giá phiên gần nhất trừ giá của đúng một phiên cũ, lùi lại bằng một mức của ô Số phiên nhìn lại (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là số bạn nhập. Giá hôm nay giữ nguyên ở mọi chấm, nên dãy chấm chính là giá của các phiên cũ lật úp: phiên cũ đắt hơn bao nhiêu đồng thì chấm thấp hơn bấy nhiêu đồng. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Dãy chấm đi xuống là càng lùi xa giá càng cao, đi lên là giá cũ rẻ dần.',
          'Each dot is the latest price minus the price of exactly one earlier session, going back by one level of the Number of sessions to look back (n) field, from half to one and a half times your number; the dot on the dashed vertical line is your own figure. Today’s price is the same for every dot, so the row is the old prices turned upside down: an old session that cost so many dong more puts its dot that many dong lower. It is computed on the price series you loaded, not market history. A row that falls means prices were higher the further back you look; one that rises means they were lower.',
        ),
        bac: d(
          'Mỗi bậc là động lượng với một số phiên nhìn lại nguyên của ô Số phiên nhìn lại (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Không có nửa phiên để lùi về, nên bậc nằm ngang rồi mới nhảy sang phiên cũ kế tiếp. Mỗi bước nhảy đúng bằng số đồng mà một phiên trong quá khứ đã tăng hay giảm so với phiên trước nó: bậc đi lên khi phiên ấy tăng giá, đi xuống khi phiên ấy giảm, cao đúng bằng mức đổi của nó. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường.',
          'Each step is momentum for one whole lookback in the Number of sessions to look back (n) field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. There is no half session to look back to, so each step stays level before it jumps to the next earlier session. Each jump equals exactly the dong one past session gained or lost against the session before it: the staircase rises when that session closed higher and falls when it closed lower, by exactly its move. It is computed on the price series you loaded, not market history.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi, trên chuỗi giá bạn đã nạp, dải của ô Số phiên nhìn lại (n) đang vẽ có cả động lượng dương lẫn âm. Phần nằm trên vạch 0 tô xanh là những tầm nhìn lại mà giá hôm nay cao hơn giá ngày ấy, phần nằm dưới vạch 0 tô đỏ là thấp hơn, và vì tính bằng đồng nên bề cao mảng tô đọc thẳng ra số đồng chênh. Đường cắt vạch 0 quanh ngày cũ có giá ngang giá hôm nay. Đây là phép thử trên một chuỗi, không phải diễn biến thị trường; đường đi xuống là ngày cũ đắt dần, đi lên là rẻ dần.',
          'This form appears when, on the price series you loaded, the range of the Number of sessions to look back (n) field being drawn holds both positive and negative momentum. The part above the zero line is shaded green for lookbacks where today’s price beats that day’s, the part below it red where it trails, and since momentum is in dong the depth of the shading reads straight as a dong gap. The line crosses the zero line near the old day priced like today. It is a test on one series, not market history; the line falls where older days get pricier and rises where they get cheaper.',
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
      diem: d(
        'Mỗi chấm là động lượng của một phiên, tức giá phiên ấy trừ giá của số phiên nhìn lại trước nó, tính bằng đồng, xếp từ phiên cũ nhất bên trái tới phiên gần nhất bên phải. Đây là đà của giá trên chuỗi bạn đã nạp, không phải đường giá. Chấm sau cao hơn chấm trước bao nhiêu đồng thì phiên mới đã tăng nhiều hơn, hoặc giảm ít hơn, phiên đứng trước nó một quãng nhìn lại bấy nhiêu đồng; dãy chấm đi lên là đà đang mạnh lên, đi xuống là đang yếu đi. Chấm trên mức 0 là giá cao hơn kỳ nhìn lại.',
        'Each dot is the momentum of one session, its price minus the price the lookback number of sessions earlier, in dong, running from the oldest session on the left to the most recent session on the right. It measures the drive of price on the series you loaded, not the price line. A dot sitting so many dong above the previous one means the new session gained that many dong more, or lost that many less, than the session one lookback before it; the row rises as momentum builds and falls as it fades. A dot above 0 is a price over the lookback price.',
      ),
      bac: d(
        'Mỗi bậc là động lượng của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy, vì nó chỉ tính lại khi có giá đóng cửa mới. Mỗi bước nhảy là số đồng phiên mới vào đã đổi trừ số đồng của phiên đứng trước nó một quãng nhìn lại, nên bậc đi lên khi phiên mới đổi nhiều hơn về phía tăng, đi xuống khi ngược lại. Bậc trên mức 0 là giá cao hơn kỳ nhìn lại đúng bấy nhiêu đồng. Hình theo chuỗi giá bạn đã nạp, không phải đường giá.',
        'Each step is the momentum of one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and then jumps, because it is only recalculated on a new close. Each jump is the dong change of the new session minus that of the session one lookback before it, so the staircase rises when the newcomer’s change is the larger one and falls when it is the smaller. A step above 0 is a price exactly that many dong over the lookback price. It follows the price series you loaded, not the price line.',
      ),
      laiLo: d(
        'Đường động lượng đi từ phiên cũ nhất nằm bên trái tới phiên gần nhất nằm bên phải, phần giữa đường với vạch 0 tô hai màu: nằm trên vạch 0 tô xanh là những phiên giá cao hơn giá của kỳ nhìn lại, nằm dưới vạch 0 tô đỏ là thấp hơn, và bề cao mảng tô đọc thẳng ra số đồng chênh. Dạng biểu đồ này hiện khi động lượng có đổi dấu trên chuỗi bạn đã nạp. Chỗ đường cắt vạch 0 là lúc giá về đúng mức của kỳ nhìn lại; đường đi lên là chênh lệch đang dịch về phía tăng, đi xuống là dịch về phía giảm.',
        'The momentum line runs from the oldest session on the left to the most recent session on the right, the space between it and the zero line shaded: green above the zero line for sessions priced over the lookback price, red below it for sessions priced under it, and the depth of the shading reads straight as the dong gap. This form appears when momentum changes sign on the series you loaded. Where the line crosses the zero line the price is back at the lookback level; the line rises as the gap shifts toward the up side and falls as it shifts toward the down side.',
      ),
    },
  },

  'khoang-cach-gia-so-sma': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên của đường trung bình (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng giá phiên gần nhất ấy, so với đường trung bình dài hay ngắn hơn thì khoảng cách ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên là đường trung bình càng dài càng nằm thấp, tức giá cũ thấp hơn giá gần đây; đường đi xuống là đường trung bình dài còn giữ mức giá cao của trước đó.',
          'The line runs left to right along the Number of sessions in the moving average (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: for that same latest price, how far it sits from a longer or shorter moving average, not market history. Where the line rises, the longer the average the lower it lies, that is older prices were below recent ones; where it falls, the long average still holds the higher prices from before.',
        ),
        cot: d(
          'Mỗi cột là khoảng cách giữa giá và một đường trung bình, cột tô đặc là số phiên bạn đang nhập. Cột mọc lên trên vạch 0 là giá đang đứng trên đường trung bình ấy, cột quay xuống dưới vạch 0 là đứng dưới; cột càng dài thì giá càng đi xa khỏi mức quen thuộc.',
          'Each bar is the distance between the price and one moving average, and the solid one is the number of sessions you have entered. A bar above the zero line means the price stands over that average, a bar below the zero line means under it; the longer the bar, the further the price has strayed from its usual level.',
        ),
        diem: d(
          'Mỗi chấm là giá phiên gần nhất cao hơn hay thấp hơn một đường SMA bao nhiêu phần trăm, với số phiên lấy từ một mức của ô Số phiên của đường trung bình (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là số bạn nhập. Giá giữ nguyên ở mọi chấm, nên chấm càng cao là đường trung bình ấy càng thấp. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Dãy chấm đi lên là các phiên cũ gộp thêm rẻ hơn mức trung bình, kéo đường dài xuống; đi xuống là giá cũ đắt hơn.',
          'Each dot is how many percent the latest price sits above or below one SMA, its length taken from one level of the Number of sessions in the moving average (n) field, from half to one and a half times your number; the dot on the dashed vertical line is your own figure. The price is the same for every dot, so the higher a dot, the lower that average. It is computed on the price series you loaded, not market history. A row that rises means the older sessions being added are cheaper than the average and pull the longer lines down; one that falls means older prices were higher.',
        ),
        bac: d(
          'Mỗi bậc là khoảng cách giữa giá và SMA với một số phiên nguyên của ô Số phiên của đường trung bình (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Không có đường trung bình nào cho số phiên lẻ, nên bậc nằm ngang tới số kế tiếp rồi mới nhảy; mỗi lần nhảy, trung bình gộp thêm đúng một phiên cũ. Bậc đi lên khi phiên ấy rẻ hơn mức trung bình đang có, đi xuống khi đắt hơn. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường.',
          'Each step is the gap between price and the SMA for one whole number of sessions in the Number of sessions in the moving average (n) field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. There is no average for a fractional number of sessions, so each step stays level until the next number, and each jump folds exactly one older session into the average. The staircase rises when that session was cheaper than the current average and falls when it was more expensive. It is computed on the price series you loaded, not market history.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi, trên chuỗi giá bạn đã nạp, giá phiên gần nhất nằm trên một số đường trung bình trong dải của ô Số phiên của đường trung bình (n) mà lại nằm dưới những đường khác. Phần nằm trên vạch 0 tô xanh là những độ dài mà giá đứng trên SMA, phần nằm dưới vạch 0 tô đỏ là đứng dưới. Đường cắt vạch 0 quanh độ dài có SMA đúng bằng giá hôm nay. Đây là phép thử trên một chuỗi, không phải diễn biến thị trường; đường đi lên là đường dài nằm thấp dần, đi xuống là cao dần.',
          'This form appears when, on the price series you loaded, the latest price sits above some of the averages in the range of the Number of sessions in the moving average (n) field and below others. The part above the zero line is shaded green for lengths where the price stands over its SMA, the part below it red where it stands under. The line crosses the zero line around the length whose SMA equals today’s price. It is a test on one series, not market history; the line rises where longer averages sit lower and falls where they sit higher.',
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
      diem: d(
        'Mỗi chấm là giá đóng cửa của một phiên cao hơn hay thấp hơn đường SMA của chính phiên ấy bao nhiêu phần trăm, xếp từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; những phiên đầu chưa đủ số phiên nên chưa có chấm. Đây là độ căng của giá so với xu thế của nó trên chuỗi bạn đã nạp, không phải đường giá. Chấm trên mức 0 là giá nằm trên đường trung bình; dãy chấm đi lên là giá đang giãn xa phía trên hay hồi lên từ phía dưới, đi xuống là ngược lại. Các chấm xa mức 0 nhất cho thấy giá từng căng tới đâu.',
        'Each dot is how many percent a session’s close stood above or below its own SMA, running from the oldest session on the left to the most recent session on the right; the first sessions have no dot until the average has enough sessions. It measures how stretched the price is against its own trend on the series you loaded, not the price line. A dot above 0 is a close over the average; the row rises as the price pulls further above or climbs back from below, and falls the other way. The dots furthest from 0 show how far the price has stretched.',
      ),
      bac: d(
        'Mỗi bậc là khoảng cách giữa giá và SMA của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy, vì cả giá lẫn SMA chỉ đổi khi có giá đóng cửa mới. Bậc đi lên là phiên giá tăng nhanh hơn, hoặc giảm chậm hơn, đường trung bình; đi xuống là ngược lại. Một bậc nhảy vọt qua mức 0 là phiên giá cắt qua đường SMA. Hình theo chuỗi giá bạn đã nạp, không phải đường giá.',
        'Each step is the gap between price and SMA at one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and then jumps, because both the price and the SMA only change on a new close. The staircase rises when the price grows faster than its average, or falls more slowly, and falls the other way; a jump straight across 0 is a session in which the price crossed its SMA. It follows the price series you loaded, not the price line.',
      ),
      laiLo: d(
        'Đường khoảng cách đi từ phiên cũ nhất nằm bên trái tới phiên gần nhất nằm bên phải, phần giữa đường với vạch 0 tô hai màu: nằm trên vạch 0 tô xanh là những phiên giá đóng cửa nằm trên đường SMA, nằm dưới vạch 0 tô đỏ là nằm dưới. Màu nói giá đứng phía nào của xu thế, không nói lãi hay lỗ. Dạng biểu đồ này hiện khi giá có lúc trên lúc dưới đường trung bình trong chuỗi bạn đã nạp. Chỗ đường cắt vạch 0 là lúc giá cắt qua SMA; đường đi lên là giá tăng nhanh hơn đường trung bình, đi xuống là chậm hơn.',
        'The distance line runs from the oldest session on the left to the most recent session on the right, the space between it and the zero line shaded: green above the zero line for sessions that closed over their SMA, red below it for sessions that closed under it. The color says which side of the trend the price is on, not a profit or loss. This form appears when the price spends time both above and below its average on the series you loaded. Where the line crosses the zero line the price crosses its SMA; the line rises as the price outpaces the average and falls as it lags.',
      ),
    },
  },

  'giao-cat-hai-duong-ma': {
    truc: {
      shortPeriod: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ đường ngắn, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, đổi chu kỳ của đường ngắn thì khoảng chênh giữa hai đường trung bình ra bao nhiêu, không phải diễn biến thị trường. Chu kỳ ngắn càng tiến gần chu kỳ dài thì hai đường càng trùng nhau, nên đường thường tiến về phía 0 khi sang phải: đi lên nếu khoảng chênh đang âm, đi xuống nếu đang dương.',
          'The line runs left to right along the Short SMA period field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, how the gap between the two averages changes with a different short period, not market history. The closer the short period gets to the long one, the more the two averages coincide, so the line usually heads toward 0 as it moves right: it rises if the gap is negative and falls if it is positive.',
        ),
        cot: d(
          'Mỗi cột là khoảng chênh giữa đường ngắn và đường dài ứng với một chu kỳ ngắn, cột tô đặc là chu kỳ bạn đang nhập. Cột mọc lên trên vạch 0 là đường ngắn nằm trên đường dài, tức trạng thái sau một lần cắt lên; cột quay xuống dưới vạch 0 là sau một lần cắt xuống.',
          'Each bar is the gap between the short and the long average for one short period, and the solid one is the period you have entered. A bar above the zero line means the short average is over the long one, the state after an upward cross; a bar below the zero line is the state after a cross down.',
        ),
        diem: d(
          'Mỗi chấm là khoảng chênh giữa đường ngắn và đường dài ở phiên gần nhất, với độ dài đường ngắn lấy từ một mức của ô Chu kỳ đường ngắn, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là số bạn nhập. Đường dài giữ nguyên ở mọi chấm, nên chấm này khác chấm kia chỉ vì đường ngắn gộp thêm hay bớt phiên cũ. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Đường ngắn càng dài càng giống đường dài, nên dãy chấm thường đi lên khi khoảng chênh đang âm, đi xuống khi đang dương.',
          'Each dot is the gap between the short and the long average at the latest session, the short one’s length taken from one level of the Short SMA period field, from half to one and a half times your number; the dot on the dashed vertical line is your own figure. The long average is the same for every dot, so dots differ only as the short one takes in or drops older sessions. It is computed on the price series you loaded, not market history. A longer short average resembles the long one more, so the row usually rises while the gap is negative and falls while it is positive.',
        ),
        bac: d(
          'Mỗi bậc là khoảng chênh giữa hai đường trung bình với một số phiên nguyên của ô Chu kỳ đường ngắn, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Không có chu kỳ lẻ, nên bậc nằm ngang tới số kế tiếp rồi mới nhảy. Đường dài đứng yên trên cả trục, mỗi lần nhảy là đường ngắn gộp thêm đúng một phiên cũ: bậc đi lên khi phiên ấy đắt hơn đường ngắn đang có, đi xuống khi rẻ hơn. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường.',
          'Each step is the gap between the two averages for one whole number of sessions in the Short SMA period field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. There is no fractional period, so each step stays level until the next number, then jumps. The long average holds still across the axis, and each jump folds exactly one older session into the short one: the staircase rises when that session cost more than the current short average and falls when it cost less. It is computed on the price series you loaded, not market history.',
        ),
      },
      longPeriod: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chu kỳ đường dài, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp và không phải diễn biến thị trường. Đường không có chiều cố định: đường dài càng dài càng nhớ giá cũ, nên đường đi lên khi giá cũ thấp hơn giá gần đây và đi xuống khi giá cũ cao hơn. Vùng gạch chéo ở đầu bên trái là chỗ chu kỳ dài không còn lớn hơn chu kỳ ngắn, ở đó không có hai đường để so.',
          'The line runs left to right along the Long SMA period field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded and is not market history. The line has no fixed direction: the longer the long average, the more it remembers old prices, so the line rises when older prices are below recent ones and falls when they are above. The hatched area at the far left is where the long period is no longer greater than the short one, so there are not two averages to compare.',
        ),
        cot: d(
          'Mỗi cột là khoảng chênh giữa đường ngắn và đường dài ứng với một chu kỳ dài, cột tô đặc là chu kỳ bạn đang nhập. Nếu dấu của cột giữ nguyên trên cả dãy thì kết luận cắt lên hay cắt xuống không phụ thuộc vào việc bạn chọn chu kỳ dài nào.',
          'Each bar is the gap between the short and the long average for one long period, and the solid one is the period you have entered. If the sign of the bars holds across the whole row, the verdict of a cross up or down does not depend on which long period you choose.',
        ),
        diem: d(
          'Mỗi chấm là khoảng chênh giữa đường ngắn và đường dài ở phiên gần nhất, với độ dài đường dài lấy từ một mức của ô Chu kỳ đường dài, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là số bạn nhập. Đường ngắn giữ nguyên, nên chấm càng cao là đường dài càng thấp; mức nào chu kỳ dài không lớn hơn chu kỳ ngắn thì không có chấm. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Dãy chấm đi lên khi các phiên cũ gộp thêm rẻ hơn đường dài đang có, đi xuống khi đắt hơn.',
          'Each dot is the gap between the short and the long average at the latest session, the long one’s length set by one level of the Long SMA period field, from half to one and a half times your number; the dot on the dashed vertical line is your own figure. The short average stays the same, so the higher a dot, the lower the long average; wherever the long period is not greater than the short one there is no dot. It is computed on the price series you loaded, not market history. The row rises when the older sessions being added are cheaper than the long average and falls when they cost more.',
        ),
        bac: d(
          'Mỗi bậc là khoảng chênh giữa hai đường trung bình với một số phiên nguyên của ô Chu kỳ đường dài, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; bậc mở ra từ vạch đứt dọc là số bạn nhập. Không có chu kỳ lẻ, nên bậc nằm ngang tới số kế tiếp rồi mới nhảy; mức nào chu kỳ dài chưa vượt chu kỳ ngắn thì không có bậc. Mỗi lần nhảy, đường dài gộp thêm đúng một phiên cũ: bậc đi lên khi phiên ấy rẻ hơn đường dài đang có, đi xuống khi đắt hơn. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường.',
          'Each step is the gap between the two averages for one whole number of sessions in the Long SMA period field, from half to one and a half times your number; the step starting at the dashed vertical line is your own figure. There is no fractional period, so each step holds until the next number, then jumps; where the long period is not above the short one there is no step. Each jump adds one older session to the long average: the staircase rises when that session was cheaper than the current long average and falls when it cost more. It is computed on the series you loaded, not market history.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi, trên chuỗi giá bạn đã nạp, đường ngắn nằm trên một số đường dài trong dải của ô Chu kỳ đường dài mà lại nằm dưới những đường khác. Phần nằm trên vạch 0 tô xanh là những chu kỳ dài mà đường ngắn đang đứng trên, tức trạng thái sau một lần cắt lên; phần nằm dưới vạch 0 tô đỏ là sau một lần cắt xuống. Đường cắt vạch 0 quanh chu kỳ dài làm hai đường bằng nhau, nên kết luận cắt lên hay cắt xuống ở đây đổi theo chu kỳ bạn chọn. Đây không phải diễn biến thị trường; đường đi lên là đường dài thấp dần, đi xuống là cao dần.',
          'This form appears when, on the series you loaded, the short average sits above some of the long averages in the range of the Long SMA period field and below others. The part above the zero line is shaded green for long periods the short average stands over, the state after an upward cross; the part below it is red, the state after a cross down. The line crosses the zero line around the long period that makes the two averages equal, so here the verdict depends on the period you choose. It is not market history; the line rises where longer averages sit lower and falls where they sit higher.',
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
      diem: d(
        'Mỗi chấm là SMA ngắn trừ SMA dài tính tới một phiên, xếp từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; những phiên đầu chưa đủ chu kỳ dài nên chưa có chấm. Đây là quan hệ giữa hai xu thế của giá trên chuỗi bạn đã nạp, không phải đường giá. Chấm trên mức 0 là đường ngắn đứng trên đường dài; dãy chấm đi lên là đường ngắn đang nhích lên so với đường dài, đi xuống là ngược lại. Chỗ dãy chấm đổi phía qua mức 0 là phiên hai đường cắt nhau.',
        'Each dot is the short SMA minus the long SMA up to one session, running from the oldest session on the left to the most recent session on the right; the first sessions have no dot until the long period is filled. It measures how two price trends relate on the series you loaded, not the price line. A dot above 0 is a session with the short average over the long one; the row rises as the short average gains on the long one and falls the other way. Where the row switches sides of 0 is a session in which the two averages crossed.',
      ),
      bac: d(
        'Mỗi bậc là khoảng chênh giữa hai đường trung bình ở một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy, vì hai đường SMA chỉ tính lại khi có giá đóng cửa mới. Bậc đi lên là phiên đường ngắn tăng nhiều hơn, hoặc giảm ít hơn, đường dài; đi xuống là ngược lại. Một bậc nhảy hẳn từ dưới mức 0 lên trên là phiên cắt lên, từ trên xuống dưới là phiên cắt xuống. Hình theo chuỗi giá bạn đã nạp, không phải đường giá.',
        'Each step is the gap between the two averages at one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and then jumps, because both SMAs are only recalculated on a new close. The staircase rises in a session when the short average gains more, or loses less, than the long one, and falls in the opposite case. A jump from below 0 to above it is the session of an upward cross, from above to below a cross down. It follows the price series you loaded, not the price line.',
      ),
      laiLo: d(
        'Đường chênh lệch đi từ phiên cũ nhất nằm bên trái tới phiên gần nhất nằm bên phải, phần giữa đường với vạch 0 tô hai màu: nằm trên vạch 0 tô xanh là những phiên đường ngắn nằm trên đường dài, nằm dưới vạch 0 tô đỏ là nằm dưới. Màu là thứ tự của hai đường, không phải lãi lỗ của giá. Dạng biểu đồ này hiện khi hai đường có đổi chỗ cho nhau trên chuỗi bạn đã nạp. Chỗ đường đi lên qua vạch 0 là điểm cắt lên, đi xuống qua vạch 0 là điểm cắt xuống; mỗi đoạn liền một màu là một quãng hai đường giữ nguyên thứ tự.',
        'The gap line runs from the oldest session on the left to the most recent session on the right, the space between it and the zero line shaded: green above the zero line for sessions with the short average over the long one, red below it for the reverse. The color shows the order of the two averages, not a profit or loss. This form appears when the two averages swap places on the series you loaded. Where the line rises through the zero line is the upward cross, where it falls through it the cross down; each unbroken stretch of one color is a spell in which the averages kept their order.',
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
        diem: d(
          'Mỗi chấm là dải trên của phiên gần nhất tính ở một mức của ô Chu kỳ dải Bollinger (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là đúng chu kỳ bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, chỉ cửa sổ dài ngắn khác nhau, không phải diễn biến thị trường. Sang phải một chấm là gộp thêm đúng một phiên cũ: dãy chấm đi lên khi phiên ấy có giá cao hơn hoặc làm giá dao động rộng ra, đi xuống khi nó thấp hơn và êm hơn. Hai chấm cạnh nhau cách xa là phiên vừa gộp có giá xa mức bình quân.',
          'Each dot is the latest upper band at one level of the Bollinger band period (n) field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own period. It is calculated on the price series you loaded: the same series with a longer or shorter window, not market history. One dot to the right adds exactly one older session: the row rises where that session was higher or widened the swings, and falls where it was lower and calmer. Two neighboring dots far apart mean the session just added sat far from the average.',
        ),
        bac: d(
          'Mỗi bậc là dải trên của phiên gần nhất ứng với một số phiên nguyên của ô Chu kỳ dải Bollinger (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập. Chu kỳ đếm trọn từng phiên, không có nửa phiên, nên mỗi bậc giữ nguyên độ cao tới số phiên kế tiếp rồi mới nhảy. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Bậc đi lên là phiên cũ vừa vào cửa sổ có giá cao hơn hoặc làm giá dao động rộng ra; bậc đi xuống là phiên ấy thấp hơn và êm hơn. Bậc nhảy cao là một phiên có giá xa hẳn mức bình quân.',
          'Each step is the latest upper band for one whole number of sessions on the Bollinger band period (n) field, from half to one and a half times the number you have entered. A period counts whole sessions, with no half session in between, so each step holds its height until the next count and then jumps. It is calculated on the price series you loaded, not market history. The staircase rises where the older session just let into the window was higher or widened the swings, and falls where it was lower and calmer. A tall jump is one session priced far from the average.',
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
        diem: d(
          'Mỗi chấm là dải trên tính với một mức của ô Hệ số nhân độ lệch chuẩn (k), từ một nửa đến gấp rưỡi hệ số bạn đang nhập; chấm trên vạch đứt dọc là đúng hệ số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: đường trung bình và độ lệch chuẩn giữ nguyên, chỉ hệ số đổi, nên đây không phải diễn biến thị trường. Chỉ có vài chấm vì ô đi từng nấc nửa đơn vị. Dãy chấm đi lên thẳng hàng: mỗi nấc nâng dải trên thêm đúng nửa độ lệch chuẩn của chu kỳ ấy, nên các chấm cách đều nhau.',
          'Each dot is the upper band at one level of the Standard deviation multiplier (k) field, from half to one and a half times the multiplier you have entered; the dot on the dashed vertical line is your own multiplier. It is calculated on the price series you loaded: the average and the standard deviation stay put and only the multiplier changes, so this is not market history. There are only a few dots because the field moves in half-unit notches. The row rises in a straight line: each notch lifts the upper band by exactly half a standard deviation of that period, so the dots are evenly spaced.',
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
      diem: d(
        'Mỗi chấm là dải trên tính tới một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; những phiên đầu chuỗi chưa đủ một chu kỳ nên chưa có chấm. Hình đi theo đúng chuỗi giá bạn đã nạp. Dãy chấm đi lên là giá bình quân đang tăng hoặc giá dao động rộng ra đẩy dải lên; đi xuống là bình quân giảm hoặc dao động co lại. Dải trên đổi dần nên các chấm thường nối nhau thành một vệt liền; chỗ vệt bỗng nhảy vọt là có một phiên giá xa mức bình quân vừa vào, hoặc vừa rời, cửa sổ n phiên.',
        'Each dot is the upper band up to one session, running from the oldest session on the left to the most recent session on the right; the first sessions, too few to fill a period, have no dot. It follows the price series you loaded. When the row rises the average price is going up or wider swings are pushing the band up; when it falls the average is dropping or the swings are tightening. The band shifts gradually, so the dots usually join into an unbroken trail; where the trail suddenly leaps, a session far from the average has just entered or left the window of n sessions.',
      ),
      bac: d(
        'Mỗi bậc là dải trên của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên độ cao suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào để tính lại dải. Các bậc đi theo chuỗi giá bạn đã nạp. Bậc đi lên là giá bình quân tăng hoặc giá dao động rộng ra; bậc đi xuống là bình quân giảm hoặc dao động co lại. Bậc nhảy cao là ngày cửa sổ n phiên nhận vào, hoặc đẩy ra, một phiên giá xa mức bình quân.',
        'Each step is the upper band of one session, running from the oldest session on the left to the most recent session on the right: the step holds its height through that session and then jumps to the next one, because there is no close between two sessions to recompute the band. The steps follow the price series you loaded. The staircase rises when the average price is going up or the swings are widening, and falls when the average is dropping or the swings are tightening. A tall jump is the day the window of n sessions takes in, or drops, a session priced far from the average.',
      ),
      nen: d(
        'Mỗi cây nến là một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: thân từ giá mở cửa tới giá đóng cửa, bấc từ giá thấp nhất tới cao nhất; thân xanh là “Phiên tăng”, thân đỏ là “Phiên giảm”. Đường dải trên vẽ đè lên nến, và phần lớn thân nến nằm dưới nó. Phiên tăng có đỉnh thân, tức giá đóng cửa, vượt qua đường là phiên đóng cửa ngoài dải trên; chỉ có bấc chạm qua là trong phiên giá từng vượt dải nhưng đã quay về lúc đóng cửa. Đường đi lên là bình quân tăng hoặc dao động rộng ra, đi xuống là ngược lại.',
        'Each candle is one session, from the oldest session on the left to the most recent session on the right: the body spans the open to the close, the wick the low to the high, a green body marking an “Up session” and a red one a “Down session”. The upper band is drawn over the candles, and most bodies sit below it. An up session whose body top, its close, pokes above the line closed outside the upper band; a wick alone crossing it means the price broke out during the session but came back by the close. The line rises with a rising average or wider swings and falls with the reverse.',
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
        diem: d(
          'Mỗi chấm là dải dưới của phiên gần nhất tính ở một mức của ô Chu kỳ dải Bollinger (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là đúng chu kỳ bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Mỗi chấm sang phải là thêm một phiên cũ: dãy chấm đi xuống khi phiên ấy thấp hơn hoặc làm giá dao động rộng ra, đi lên khi nó cao hơn và êm hơn. Đặt giá phiên gần nhất cạnh dãy chấm: chấm nào cao hơn giá ấy là chu kỳ mà giá đã thủng dải dưới.',
          'Each dot is the latest lower band at one level of the Bollinger band period (n) field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own period. It is calculated on the price series you loaded, not market history. Each move to the right adds one older session: the row falls where that session was lower or widened the swings, and rises where it was higher and calmer. Hold the latest price against the row: any dot above it is a period whose lower band the price has broken.',
        ),
        bac: d(
          'Mỗi bậc là dải dưới của phiên gần nhất ứng với một số phiên nguyên của ô Chu kỳ dải Bollinger (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập. Cửa sổ chỉ dài thêm từng phiên trọn vẹn, nên bậc giữ nguyên độ cao tới chu kỳ kế tiếp rồi mới nhảy. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Bậc đi xuống là phiên cũ vừa vào cửa sổ thấp hơn hoặc làm giá dao động rộng ra; bậc đi lên là phiên ấy cao hơn và êm hơn. Một bậc hụt sâu là một phiên có giá xa hẳn mức bình quân.',
          'Each step is the latest lower band for one whole number of sessions on the Bollinger band period (n) field, from half to one and a half times the number you have entered. The window only grows by whole sessions, so each step holds its height until the next period and then jumps. It is calculated on the price series you loaded, not market history. The staircase falls where the older session just let in was lower or widened the swings, and rises where it was higher and calmer. A deep drop in one step is a single session priced far from the average.',
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
        diem: d(
          'Mỗi chấm là dải dưới tính với một mức của ô Hệ số nhân độ lệch chuẩn (k), từ một nửa đến gấp rưỡi hệ số bạn đang nhập; chấm trên vạch đứt dọc là đúng hệ số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp với đường trung bình và độ lệch chuẩn đứng yên, nên đây không phải diễn biến thị trường. Ô đi từng nấc nửa đơn vị nên chỉ có vài chấm. Dãy chấm đi xuống thẳng hàng: mỗi nấc hạ dải dưới thêm đúng nửa độ lệch chuẩn, nên các chấm cách đều nhau và chấm cuối bên phải là mức giá xa đường trung bình nhất.',
          'Each dot is the lower band at one level of the Standard deviation multiplier (k) field, from half to one and a half times the multiplier you have entered; the dot on the dashed vertical line is your own multiplier. It is calculated on the price series you loaded with the average and standard deviation held still, so this is not market history. The field moves in half-unit notches, hence only a few dots. The row falls in a straight line: each notch lowers the band by exactly half a standard deviation, so the dots are evenly spaced and the rightmost sits furthest below the average.',
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
      diem: d(
        'Mỗi chấm là dải dưới tính tới một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; những phiên đầu chuỗi chưa đủ một chu kỳ nên chưa có chấm. Hình đi theo đúng chuỗi giá bạn đã nạp. Dãy chấm đi lên là giá bình quân đang tăng hoặc dao động co lại nên dải nhích gần giá; đi xuống là bình quân giảm hoặc giá dao động rộng ra. Chấm tụt hẳn so với chấm trước thường là một phiên giá lao xa khỏi mức bình quân vừa vào cửa sổ n phiên, và dải dưới hay chỉ nhích lại khi phiên ấy rời cửa sổ.',
        'Each dot is the lower band up to one session, running from the oldest session on the left to the most recent session on the right; the first sessions, too few to fill a period, have no dot. It follows the price series you loaded. When the row rises the average price is going up or the swings are tightening, so the band edges toward the price; when it falls the average is dropping or the price is swinging wider. A dot well below the one before usually marks a session far from the average entering the window of n sessions, and the band tends to recover only once that session leaves.',
      ),
      bac: d(
        'Mỗi bậc là dải dưới của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy, vì dải chỉ tính lại khi có thêm một giá đóng cửa. Các bậc đi theo chuỗi giá bạn đã nạp. Bậc đi lên là giá bình quân tăng hoặc dao động co lại; bậc đi xuống là bình quân giảm hoặc giá dao động rộng ra. Một bậc hụt sâu thường là phiên có giá xa hẳn mức bình quân vừa vào cửa sổ, kéo độ lệch chuẩn lên.',
        'Each step is the lower band of one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and only jumps when the next close arrives to recompute the band. The steps follow the price series you loaded. The staircase rises when the average price is going up or the swings are tightening, and falls when the average is dropping or the price is swinging wider. A deep drop in one step is usually a session priced far from the average entering the window and lifting the standard deviation.',
      ),
      nen: d(
        'Mỗi cây nến là một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: thân từ giá mở cửa tới giá đóng cửa, bấc từ giá thấp nhất tới cao nhất; thân xanh là “Phiên tăng”, thân đỏ là “Phiên giảm”. Đường dải dưới vẽ đè lên nến, và phần lớn thân nến nằm trên nó. Phiên giảm có đáy thân, tức giá đóng cửa, rơi xuống dưới đường là phiên đóng cửa thủng dải dưới; chỉ bấc thò xuống là trong phiên giá có lúc thủng dải nhưng đã kéo lên lại trước giờ đóng cửa. Đường đi lên là bình quân tăng hoặc dao động co lại, đi xuống là bình quân giảm hoặc dao động rộng ra.',
        'Each candle is one session, from the oldest session on the left to the most recent session on the right: the body spans the open to the close, the wick the low to the high, a green body marking an “Up session” and a red one a “Down session”. The lower band is drawn over the candles, most bodies sitting above it. A down session whose body bottom, its close, sinks below the line closed under the band; a wick alone dipping through means the price broke the band intraday but recovered by the close. The line rises as the average climbs or the swings tighten and falls as it drops or they widen.',
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
        diem: d(
          'Mỗi chấm là độ rộng dải của phiên gần nhất tính ở một mức của ô Chu kỳ dải Bollinger (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là đúng chu kỳ bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Sang phải một chấm là gộp thêm một phiên cũ: chấm cao hơn chấm bên trái là phiên ấy nằm xa mức bình quân nên độ lệch chuẩn lớn ra, chấm thấp hơn là nó nằm sát mức bình quân. Giá càng có nhiều phiên để đi xa thì dải càng rộng, nên dãy chấm thường đi lên; quãng chấm đi xuống cho biết những phiên đi xa nhất nằm ngay gần đây.',
          'Each dot is the latest bandwidth at one level of the Bollinger band period (n) field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own period. It is calculated on the price series you loaded, not market history. One dot to the right pools one more older session: a dot above its left neighbor means that session sat far from the average and widened the deviation, a lower one that it sat near it. More sessions give the price more room to travel, so the row usually rises; a stretch where it falls says the widest moves are recent.',
        ),
        bac: d(
          'Mỗi bậc là độ rộng dải của phiên gần nhất ứng với một số phiên nguyên của ô Chu kỳ dải Bollinger (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; cửa sổ không gộp được nửa phiên nên bậc giữ nguyên tới chu kỳ kế tiếp rồi mới nhảy. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Bậc đi lên là phiên cũ vừa gộp nằm xa mức bình quân, bậc đi xuống là nó nằm sát mức ấy. Một bậc nhảy vọt là cửa sổ vừa gộp vào một phiên giá đi rất xa; các bậc sau đó thường hạ dần vì phiên ấy chiếm phần nhỏ hơn trong cửa sổ dài hơn.',
          'Each step is the latest bandwidth for one whole number of sessions on the Bollinger band period (n) field, from half to one and a half times the number you have entered; the window cannot take half a session, so each step holds until the next period and then jumps. It is calculated on the price series you loaded, not market history. The staircase rises where the older session just pooled sat far from the average and falls where it sat close to it. A sudden tall step is the window taking in a session that traveled far; the steps after it usually ease down as it weighs less in a longer window.',
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
        diem: d(
          'Mỗi chấm là độ rộng dải tính với một mức của ô Hệ số nhân độ lệch chuẩn, từ một nửa đến gấp rưỡi hệ số bạn đang nhập; chấm trên vạch đứt dọc là đúng hệ số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp với cùng một độ lệch chuẩn, chỉ quy ước hệ số đổi, nên đây không phải diễn biến thị trường. Ô đi từng nấc nửa đơn vị nên chỉ có vài chấm. Dãy chấm đi lên đều và các chấm cách nhau đúng một khoảng, vì độ rộng tỉ lệ thuận với hệ số: mỗi nấc cộng thêm một phần như nhau.',
          'Each dot is the bandwidth at one level of the Standard deviation multiplier field, from half to one and a half times the multiplier you have entered; the dot on the dashed vertical line is your own multiplier. It is calculated on the price series you loaded with one fixed standard deviation, only the convention changing, so this is not market history. The field moves in half-unit notches, so there are only a few dots. The row rises steadily with the dots exactly evenly spaced, because the bandwidth is proportional to the multiplier: each notch adds the same slice.',
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
      diem: d(
        'Mỗi chấm là độ rộng dải tính tới một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: khoảng cách hai dải ra phần trăm của đường giữa; những phiên đầu chuỗi chưa đủ một chu kỳ nên chưa có chấm. Đây là số đo độ rộng dao động trên chuỗi bạn đã nạp, không cho biết giá lên hay xuống. Dãy chấm đi lên là hai dải đang bung ra, đi xuống là đang bóp lại. Dạng chấm cho đếm được quãng nén dài bao nhiêu phiên: một dãy chấm nằm thấp kéo dài thường đi trước một nhịp biến động lớn, còn một chấm vọt hẳn lên là phiên giá chạy mạnh vừa vào cửa sổ.',
        'Each dot is the bandwidth up to one session, running from the oldest session on the left to the most recent session on the right: the gap between the bands as a percentage of the middle line; the first sessions, too few to fill a period, have no dot. It measures how wide the swings are on the series you loaded, not whether the price went up or down. When the row rises the bands are spreading; when it falls they are squeezing. Dots let you count how many sessions a squeeze lasts: a long low run often comes before a big move, and a dot shooting up is a sharp session entering the window.',
      ),
      bac: d(
        'Mỗi bậc là độ rộng dải của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa mới. Đây là số đo độ rộng dao động trên chuỗi bạn đã nạp, không phải chiều của giá. Bậc đi lên là hai dải bung ra, bậc đi xuống là hai dải bóp lại. Bậc nhảy vọt là ngày một phiên giá chạy mạnh vào cửa sổ n phiên; đúng n phiên sau, khi nó rời cửa sổ, thường có một bậc hụt xuống tương ứng.',
        'Each step is the bandwidth of one session, running from the oldest session on the left to the most recent session on the right: the step holds through that session and then jumps to the next, because no new close arrives in between. It measures how wide the swings are on the series you loaded, not which way the price went. The staircase rises when the bands spread and falls when they squeeze. A tall jump is the day a sharp session enters the window of n sessions; n sessions later, as it leaves, a matching drop usually follows.',
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
        diem: d(
          'Mỗi chấm là ATR của phiên gần nhất tính ở một mức của ô Chu kỳ ATR (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là đúng chu kỳ bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Chu kỳ dài hơn thì ATR nhớ lâu hơn: dãy chấm đi lên là các phiên trước đây đi biên độ rộng hơn gần đây, đi xuống là gần đây biên độ mới nới ra. Các chấm sát nhau là chọn chu kỳ nào cũng ra quãng giá gần như nhau; chúng toả xa nhau là biên độ gần đây khác hẳn trước đó.',
          'Each dot is the latest ATR at one level of the ATR period (n) field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own period. It is calculated on the price series you loaded, not market history. A longer period gives ATR a longer memory: the row rises when earlier sessions ranged wider than recent ones, and falls when the range has only widened lately. Dots bunched together mean any period gives nearly the same range; dots spread far apart mean recent ranges differ sharply from earlier ones.',
        ),
        bac: d(
          'Mỗi bậc là ATR của phiên gần nhất ứng với một số phiên nguyên của ô Chu kỳ ATR (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập. Chu kỳ chỉ nhận số phiên trọn vẹn, nên bậc giữ nguyên tới chu kỳ kế tiếp rồi mới nhảy. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Bậc đi lên là chu kỳ dài thêm một phiên làm ATR giữ lại nhiều hơn những phiên biên độ rộng của trước đây; bậc đi xuống là các phiên gần đây mới là lúc biên độ nới ra. Các bậc nhảy thấp và đều là ATR ít phụ thuộc cách chọn chu kỳ.',
          'Each step is the latest ATR for one whole number of sessions on the ATR period (n) field, from half to one and a half times the number you have entered. A period only takes whole sessions, so the step holds until the next period and then jumps. It is calculated on the price series you loaded, not market history. The staircase rises where one more session of memory keeps more of the wide-ranging sessions from before, and falls where recent sessions are the ones whose range has widened. Small, even jumps mean ATR hardly depends on the period you choose.',
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
      diem: d(
        'Mỗi chấm là ATR tính tới một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải, tức quãng giá một phiên thường đi được, tính bằng đồng; những phiên đầu chuỗi chưa đủ dao động thực nên chưa có chấm. Đây là số đo biên độ trên chuỗi bạn đã nạp, không cho biết giá lên hay xuống. Dãy chấm đi lên là các phiên đang đi quãng dài hơn, đi xuống là đang lặng lại. ATR được làm mượt nên các chấm nối nhau đều đặn: một phiên biên độ rất rộng chỉ nhích chấm của nó lên một chút, vì phiên ấy chỉ góp một phần trong n.',
        'Each dot is the ATR up to one session, running from the oldest session on the left to the most recent session on the right: how far a session usually travels, in dong; the first sessions, without enough true ranges yet, have no dot. It measures range on the series you loaded, not whether the price went up or down. When the row rises sessions are covering more ground; when it falls trading is quieting down. ATR is smoothed, so the dots follow on evenly: even a very wide session lifts its own dot only a little, since it counts for one part in n.',
      ),
      bac: d(
        'Mỗi bậc là ATR của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy, vì ATR chỉ tính lại khi có thêm một dao động thực. Đây là số đo biên độ, tính bằng đồng, trên chuỗi bạn đã nạp. Bậc đi lên đúng khi phiên ấy có dao động thực rộng hơn ATR trước nó, đi xuống khi hẹp hơn. Các bậc thường thấp vì mỗi phiên chỉ kéo ATR đi một phần trong n quãng chênh; một bậc cao hiếm hoi là phiên giá chạy rất mạnh hoặc nhảy cách xa giá đóng cửa phiên trước.',
        'Each step is the ATR of one session, running from the oldest session on the left to the most recent session on the right: the step holds through that session and then jumps, because ATR only updates when a new true range arrives. It measures range in dong on the series you loaded. The staircase rises exactly when a session’s true range is wider than the ATR before it, and falls when it is narrower. Steps are usually low, since each session moves ATR by one part in n of the gap; a rare tall step is a session that swung hard or jumped far from the previous close.',
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
        diem: d(
          'Mỗi chấm là %B của giá phiên gần nhất đặt trong dải của một chu kỳ, theo ô Chu kỳ dải Bollinger, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là đúng chu kỳ bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng một giá, chỉ dải đổi, nên không phải diễn biến thị trường. Dãy chấm đi lên khi phiên cũ vừa gộp có giá dưới mức bình quân của cửa sổ, đi xuống khi nó ở trên; phiên cũ nằm xa mức bình quân còn nới dải ra, kéo chấm về phía giữa dải. Chấm mang số âm là chu kỳ mà giá đã thủng dải dưới.',
          'Each dot is the %B of the latest price in the band of one period on the Bollinger band period field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own period. It is calculated on the price series you loaded: one price, only the band changes, so this is not market history. The row rises where the older session just pooled sat below the average and falls where it sat above; one far from the average also widens the band and pulls the dot toward mid-band. A negative dot is a period whose lower band the price has broken.',
        ),
        bac: d(
          'Mỗi bậc là %B của giá phiên gần nhất trong dải của một số phiên nguyên, theo ô Chu kỳ dải Bollinger, từ một nửa đến gấp rưỡi số phiên bạn đang nhập. Dải chỉ đổi khi cửa sổ nhận thêm trọn một phiên, nên bậc giữ nguyên tới chu kỳ kế tiếp rồi mới nhảy. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Bậc đi lên là phiên cũ vừa gộp có giá dưới mức bình quân, bậc đi xuống là trên mức ấy. Bậc nhảy cao là một phiên cũ giá rất xa, làm vị trí của giá hôm nay trong dải đổi hẳn chỉ vì chọn chu kỳ.',
          'Each step is the %B of the latest price in the band of one whole number of sessions on the Bollinger band period field, from half to one and a half times the number you have entered. The band only changes when the window takes in a whole session, so the step holds until the next period and then jumps. It is calculated on the price series you loaded, not market history. The staircase rises where the older session just pooled was priced below the average and falls where it was above. A tall jump is one far-off older session, moving today’s place in the band through the choice of period alone.',
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
        diem: d(
          'Mỗi chấm là %B tính với một mức của ô Hệ số nhân độ lệch chuẩn, từ một nửa đến gấp rưỡi hệ số bạn đang nhập; chấm trên vạch đứt dọc là đúng hệ số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng giá, cùng đường giữa, chỉ dải nới ra hay bó lại, nên không phải diễn biến thị trường. Ô đi từng nấc nửa đơn vị nên chỉ có vài chấm. Hệ số lớn dần thì chấm dồn về giữa dải: dãy chấm đi xuống nếu giá đang trên đường giữa, đi lên nếu giá đang dưới, và mỗi nấc kéo chấm đi một quãng ngắn hơn nấc trước.',
          'Each dot is the %B at one level of the Standard deviation multiplier field, from half to one and a half times the multiplier you have entered; the dot on the dashed vertical line is your own multiplier. It is calculated on the price series you loaded: the same price and middle line, only the band widened or narrowed, so this is not market history. The field moves in half-unit notches, hence only a few dots. As the multiplier grows the dots close in on mid-band: the row falls if the price is above the middle line and rises if it is below, each notch moving it less than the last.',
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
      diem: d(
        'Mỗi chấm là %B của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: vị trí giá đóng cửa phiên ấy giữa hai dải Bollinger, trên chuỗi bạn đã nạp. Đây là vị trí của giá trong khoảng dao động của chính nó, không phải đường giá. Dãy chấm đi lên là giá đang tiến về phía dải trên, đi xuống là lùi về phía dải dưới. Hai vạch ngang 0 và 100, khi nằm trong khung hình, là chính hai dải; dạng chấm cho đếm từng phiên đóng cửa ngoài dải: chấm trên vạch 100 là ngoài dải trên, chấm dưới vạch 0 là ngoài dải dưới.',
        'Each dot is the %B of one session, running from the oldest session on the left to the most recent session on the right: where that session’s close sat between the two Bollinger bands on the series you loaded. It is the position of price within its own range, not the price line. When the row rises the price is heading for the upper band; when it falls it is retreating toward the lower one. The lines at 0 and 100, when inside the frame, are the bands themselves, and the dots let you count each close outside them: above the 100 line outside the upper band, below the 0 line outside the lower.',
      ),
      bac: d(
        'Mỗi bậc là %B của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy, vì giữa hai phiên không có giá đóng cửa nào để đặt vào dải. Bậc đi lên là giá đang tiến về dải trên, bậc đi xuống là lùi về dải dưới. Hai vạch ngang 0 và 100, khi nằm trong khung hình, là hai dải: bậc trên vạch 100 là phiên đóng cửa ngoài dải trên, dưới vạch 0 là ngoài dải dưới. %B đổi nhanh nên bậc nhảy cao là chuyện thường: một phiên chạy mạnh đủ đưa giá từ giữa dải ra tới mép.',
        'Each step is the %B of one session, running from the oldest session on the left to the most recent session on the right: the step holds through that session and then jumps, because there is no close between two sessions to place in the band. The staircase rises as the price heads for the upper band and falls as it retreats toward the lower one. The lines at 0 and 100, when inside the frame, are the two bands: a step above the 100 line is a close outside the upper band, one below the 0 line outside the lower. %B moves fast, so tall jumps are normal.',
      ),
      laiLo: d(
        'Dạng biểu đồ này chỉ hiện khi chuỗi bạn đã nạp có phiên đóng cửa dưới dải dưới, tức %B có lúc dưới 0. Đường đi từ phiên cũ nhất nằm bên trái tới phiên gần nhất nằm bên phải; phần nằm trên vạch 0 tô xanh là phiên giá đóng cửa còn ở trên dải dưới, phần nằm dưới vạch 0 tô đỏ là phiên đóng cửa thủng dải dưới. Chỗ đường cắt vạch 0 là lúc giá đóng cửa đi qua dải dưới, ra ngoài hay quay vào. Màu xanh không tách trong dải với ngoài dải trên: vạch 100 làm việc ấy. Đường đi lên là giá tiến về dải trên, đi xuống là lùi về dải dưới.',
        'This form only appears when the series you loaded has a session that closed under the lower band, so %B dips below 0 at times. The line runs from the oldest session on the left to the most recent session on the right; above the zero line it is shaded green, closes still above the lower band, and below it red, closes that broke the lower band. Where the line crosses the zero line the close passes through the lower band, outward or back in. Green does not separate inside the band from above the upper band; the 100 line does. The line rises toward the upper band and falls toward the lower.',
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
        diem: d(
          'Mỗi chấm là %K của giá phiên gần nhất trong khoảng cao thấp của một chu kỳ, theo ô Chu kỳ stochastic (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là đúng chu kỳ bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Dãy chấm hay đứng thành từng hàng cùng độ cao: thêm phiên mà không gặp đỉnh hay đáy mới thì %K không đổi. Dãy chấm chỉ đi xuống khi cửa sổ gặp một đỉnh cũ cao hơn, và chỉ đi lên khi gặp một đáy cũ thấp hơn.',
          'Each dot is the %K of the latest price within the high-low range of one period on the Stochastic period (n) field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own period. It is calculated on the price series you loaded, not market history. The dots often stand in level runs: adding sessions that bring no new high or low leaves %K unchanged. The row only falls when the window meets a higher old peak, and only rises when it meets a lower old trough.',
        ),
        bac: d(
          'Mỗi bậc là %K của giá phiên gần nhất ứng với một số phiên nguyên của ô Chu kỳ stochastic (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; cửa sổ không có nửa phiên nên bậc giữ nguyên tới chu kỳ kế tiếp. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Các bậc ở đây thường dài và bằng phẳng, vì đỉnh và đáy của cửa sổ chỉ đổi khi gặp một phiên cũ vượt khỏi chúng. Bậc đi xuống là vừa gặp đỉnh cũ cao hơn, bậc đi lên là vừa gặp đáy cũ thấp hơn; bậc dài nhất là quãng chọn chu kỳ nào cũng ra cùng một %K.',
          'Each step is the latest %K for one whole number of sessions on the Stochastic period (n) field, from half to one and a half times the number you have entered; the window has no half session, so each step holds until the next period. It is calculated on the price series you loaded, not market history. Steps here are often long and level, because the window’s high and low only change when it meets an older session beyond them. The staircase falls on meeting a higher old peak and rises on meeting a lower old trough; the longest step is a span where every period gives the same %K.',
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
      diem: d(
        'Mỗi chấm là %K của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: vị trí giá đóng cửa phiên ấy trong khoảng từ giá thấp nhất tới giá cao nhất của chu kỳ. Đây là vị trí của giá trong biên độ gần đây, không phải đường giá. Dãy chấm đi lên là giá đóng cửa gần đỉnh chu kỳ hơn, đi xuống là gần đáy hơn. %K đổi rất nhanh nên hai chấm cạnh nhau hay cách xa; đếm chấm trên vạch 80 hay dưới vạch 20 là biết bao nhiêu phiên đóng cửa sát đỉnh hay sát đáy.',
        'Each dot is the %K of one session, running from the oldest session on the left to the most recent session on the right: where that session’s close sat between the lowest and highest price of the period. It measures the position of price within its recent range, not the price line. When the row rises closes are nearer the top of the period; when it falls nearer the bottom. %K moves very fast, so neighboring dots are often far apart; count the dots above the 80 line or below the 20 line to see how many sessions closed near the high or the low.',
      ),
      bac: d(
        'Mỗi bậc là %K của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào. Bậc đi lên là giá đóng cửa đang nhích về đỉnh của chu kỳ, bậc đi xuống là về đáy. Hai vạch ngang 80 và 20, khi nằm trong khung hình, là mốc sát đỉnh và sát đáy; một dãy bậc dài trên vạch 80 là giá cứ đóng cửa sát đỉnh trong một xu hướng tăng mạnh, tự nó không báo giá sắp quay đầu.',
        'Each step is the %K of one session, running from the oldest session on the left to the most recent session on the right: the step holds through that session and then jumps to the next, because there is no close between two sessions. The staircase rises as closes move toward the period’s top and falls as they move toward its bottom. The lines at 80 and 20, when inside the frame, mark near the high and near the low; a long run of steps above the 80 line is a strong uptrend that keeps closing near the top, which by itself says nothing about a turn.',
      ),
    },
  },

  vwap: {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên gộp (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá và khối lượng bạn đã nạp: cùng chuỗi ấy, gộp nhiều hay ít phiên hơn thì VWAP ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống là giá gần đây đang cao hơn giá cũ, nên gộp thêm phiên cũ kéo mức bình quân xuống; đường đi lên là giá cũ cao hơn, nhất là khi những phiên cũ ấy khớp khối lượng lớn.',
          'The line runs left to right along the Number of sessions (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price and volume series you loaded: on that same series, what VWAP comes out at when more or fewer sessions are pooled, not market history. Where the line falls, recent prices are above older ones, so pooling in older sessions pulls the average down; where it rises, older prices were higher, all the more so when those sessions traded heavy volume.',
        ),
        cot: d(
          'Mỗi cột là VWAP khi gộp một số phiên, cột tô đặc là số phiên bạn đang nhập. Chiều cao cột là giá vốn bình quân của người mua trong quãng ấy; giá hôm nay nằm trên đỉnh cột là phần đông người mua trong quãng ấy đang có lãi.',
          'Each bar is VWAP over a given number of recent sessions, and the solid one is the number you have entered. Bar height is the average cost of those who bought over that stretch; today’s price above the top of a bar means most buyers of that stretch are in profit.',
        ),
        diem: d(
          'Mỗi chấm là VWAP khi gộp một số phiên, theo ô Số phiên gộp (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là đúng số phiên bạn nhập. Hình tính trên chuỗi giá và khối lượng bạn đã nạp, không phải diễn biến thị trường. Dãy chấm đi xuống là giá gần đây cao hơn giá cũ, gộp thêm phiên cũ kéo bình quân xuống; đi lên là giá cũ cao hơn. Khoảng cách hai chấm cạnh nhau là sức nặng của những phiên vừa gộp thêm: khớp nhiều cổ phiếu ở giá xa mức bình quân thì kéo chấm đi xa, khớp lèo tèo thì chấm gần như không nhúc nhích.',
          'Each dot is VWAP over a given number of recent sessions on the Number of sessions (n) field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own number. It is calculated on the price and volume series you loaded, not market history. The row falls where recent prices are above older ones, so pooling older sessions drags the average down, and rises where older prices were higher. The gap between neighboring dots is the weight of what was just pooled: heavy volume far from the average moves the dot a long way, thin trading barely at all.',
        ),
        bac: d(
          'Mỗi bậc là VWAP ứng với một số phiên gộp nguyên, theo ô Số phiên gộp (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập. Không gộp được nửa phiên, nên bậc giữ nguyên tới số phiên kế tiếp rồi mới nhảy; dạng này có khi các mức trên trục cách nhau đúng một phiên. Hình tính trên chuỗi giá và khối lượng bạn đã nạp, không phải diễn biến thị trường. Bậc đi xuống là phiên cũ vừa gộp đóng cửa dưới mức bình quân, bậc đi lên là trên mức ấy; phiên ấy khớp càng nhiều cổ phiếu thì bậc nhảy càng cao.',
          'Each step is VWAP for one whole number of sessions on the Number of sessions (n) field, from half to one and a half times the number you have entered. Half a session cannot be pooled, so the step holds until the next count and then jumps; this form appears when the levels on the axis are exactly one session apart. It is calculated on the price and volume series you loaded, not market history. The staircase falls where the older session just pooled closed below the average and rises where it closed above; the heavier its volume, the taller the jump.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là giá bình quân của các phiên gộp tính tới đó, trong đó phiên khớp nhiều cổ phiếu được tính nặng hơn. Hình này đi theo đúng chuỗi giá và khối lượng bạn đã nạp, và đường này là mức giá bình quân đã được trả, tính theo khối lượng. Đường đi lên là các phiên nhiều khối lượng đang khớp ở giá cao dần; đi xuống là ở giá thấp dần.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the average price of the last n sessions up to then, with heavier-volume sessions counting more. It follows the price and volume series you loaded, and the line is the average price paid, weighted by volume. When it rises the heavy-volume sessions are trading at higher and higher prices; when it falls at lower and lower ones.',
      ),
      cot: d(
        'Mỗi cột là VWAP tính tới một phiên, cột cuối bên phải là phiên gần nhất. Đỉnh cột là giá vốn bình quân của người đã mua trong quãng ấy: giá hiện tại nằm trên đỉnh cột là phần đông đang có lãi, nằm dưới là phần đông đang lỗ.',
        'Each bar is the VWAP up to one session, the last one on the right being the latest. The top of a bar is the average cost of those who bought in that span: a current price above it means most of them are in profit, below it most are at a loss.',
      ),
      diem: d(
        'Mỗi chấm là VWAP tính tới một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: giá bình quân của n phiên gộp gần nhất, phiên khớp nhiều được tính nặng hơn; những phiên đầu chuỗi chưa đủ số phiên gộp nên chưa có chấm. Hình đi theo đúng chuỗi giá và khối lượng bạn đã nạp. Dãy chấm đi lên là những phiên khớp nhiều cổ phiếu nhất đang chốt ở giá ngày càng cao, đi xuống là ngày càng thấp. Chấm bị kéo lệch hẳn khỏi dãy là ngày một phiên khối lượng đột biến vào, hoặc rời, nhóm phiên được gộp.',
        'Each dot is the VWAP up to one session, running from the oldest session on the left to the most recent session on the right: the average price of the last n sessions, heavier-volume ones counting more; the first sessions, too few to fill the pool, have no dot. It follows the price and volume series you loaded. When the row rises the sessions with the most shares matched are closing ever higher; when it falls, ever lower. A dot pulled clearly off the row is the day a volume spike joins, or drops out of, the pool.',
      ),
      bac: d(
        'Mỗi bậc là VWAP của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy, vì nhóm phiên gộp chỉ đổi khi có một phiên mới vào và phiên cũ nhất ra. Bậc đi lên là giá bình quân người mua đã trả đang tăng, bậc đi xuống là đang giảm. Bậc nhảy cao là một phiên khối lượng lớn ở giá xa mức bình quân vừa vào hoặc vừa rời nhóm; những ngày khối lượng đều đặn thì các bậc thấp và sát nhau.',
        'Each step is the VWAP of one session, running from the oldest session on the left to the most recent session on the right: the step holds through that session and then jumps, because the pool only changes when a new session joins and the oldest one leaves. The staircase rises while the average price buyers paid is climbing and falls while it is sinking. A tall jump is a heavy-volume session priced far from the average joining or leaving the pool; on days of steady volume the steps stay low and close together.',
      ),
      nen: d(
        'Mỗi cây nến là một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: thân từ giá mở cửa tới giá đóng cửa, bấc từ giá thấp nhất tới cao nhất, thân xanh là “Phiên tăng”, thân đỏ là “Phiên giảm”. Đường VWAP vẽ đè lên nến là giá bình quân người mua đã trả trong n phiên gộp gần nhất. Nến đóng cửa trên đường là ngày giá đứng trên giá vốn bình quân ấy, tức tính bình quân người mua trong quãng đó đang lãi; dưới đường là đang lỗ. Đường đi lên là giá được trả bình quân tăng dần, đi xuống là giảm dần.',
        'Each candle is one session, from the oldest session on the left to the most recent session on the right: the body spans the open to the close, the wick the low to the high, a green body marking an “Up session” and a red one a “Down session”. The VWAP line drawn over them is the average price buyers paid across the last n sessions. A candle closing above the line is a day the price stood above that average cost, so on average buyers of that stretch were in profit; below it, at a loss. The line rises as the average paid climbs and falls as it sinks.',
      ),
    },
  },

  'do-bien-dong-lich-su': {
    truc: {
      sample: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên giá lấy mẫu (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, lấy mẫu dài hay ngắn hơn thì độ biến động ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: đi lên là những phiên cũ vừa thêm vào mẫu dao động mạnh hơn giai đoạn gần đây, đi xuống là chúng êm hơn.',
          'The line runs left to right along the Number of price sessions in the sample (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what volatility comes out at with a longer or shorter sample, not market history. The line has no fixed direction: where it rises, the older sessions just added to the sample swung harder than the recent stretch; where it falls, they were calmer.',
        ),
        cot: d(
          'Mỗi cột là độ biến động năm hoá của một cỡ mẫu, cột tô đặc là số phiên bạn đang nhập. Mẫu ngắn phản ứng nhanh với tin mới nhưng dễ bị vài phiên bất thường bóp méo; mẫu dài ổn định hơn nhưng chậm nhận ra thị trường đã đổi.',
          'Each bar is annualized volatility for one sample size, and the solid one is the number you have entered. A short sample reacts fast to news but is easily distorted by a few odd sessions; a long one is steadier but slow to notice the market has changed.',
        ),
        diem: d(
          'Mỗi chấm là độ biến động năm hoá tính ở một mức của ô Số phiên giá lấy mẫu (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là đúng cỡ mẫu bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Dãy chấm đi lên là những phiên cũ vừa thêm vào mẫu lên xuống mạnh hơn giai đoạn gần đây, đi xuống là chúng êm hơn. Ở phía mẫu ngắn mỗi phiên thêm vào chiếm phần lớn hơn trong mẫu nên hai chấm cạnh nhau dễ chênh nhau; về phía mẫu dài các chấm thường bám sát nhau.',
          'Each dot is the annualized volatility at one level of the Number of price sessions in the sample (n) field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own sample. It is calculated on the price series you loaded, not market history. The row rises where the older sessions just added to the sample swung harder than the recent stretch, and falls where they were calmer. In a short sample each added session is a bigger share, so neighboring dots differ more on the left; toward long samples the dots usually sit close together.',
        ),
        bac: d(
          'Mỗi bậc là độ biến động năm hoá ứng với một số phiên nguyên của ô Số phiên giá lấy mẫu (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập. Dạng này chỉ có khi cỡ mẫu đủ nhỏ để các mức trên trục cách nhau đúng một phiên; mẫu đếm trọn từng phiên nên bậc giữ nguyên tới cỡ mẫu kế tiếp rồi mới nhảy. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Bậc đi lên là phiên cũ vừa vào mẫu mang theo một lợi suất lệch xa mức bình quân, bậc đi xuống là lợi suất ấy nằm sát mức bình quân.',
          'Each step is the annualized volatility for one whole number of sessions on the Number of price sessions in the sample (n) field, from half to one and a half times the number you have entered. This form only appears when the sample is small enough for the levels on the axis to be exactly one session apart; a sample counts whole sessions, so each step holds until the next size and then jumps. It is calculated on the price series you loaded, not market history. The staircase rises where the older session just added brings a return far from the average, and falls where its return sits close to it.',
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
        diem: d(
          'Mỗi chấm là độ biến động năm hoá ứng với một quy ước của ô Số phiên giao dịch một năm (N); với các quy ước thường dùng, các chấm trải hết dải ô cho phép chứ không quanh con số bạn nhập, và chấm trên vạch đứt dọc là đúng quy ước bạn nhập. Hình tính trên chuỗi giá bạn đã nạp nhưng chỉ đổi cách quy từ phiên ra năm, nên không phải diễn biến thị trường. Dãy chấm đi lên theo một đường cong thoải dần: con số theo căn bậc hai của số phiên chứ không theo chính số phiên, nên cùng một khoảng trên trục ngang, bên phải nhích ít hơn bên trái.',
          'Each dot is the annualized volatility under one convention of the Trading sessions per year (N) field; for the usual conventions the dots span the whole range the field allows instead of surrounding your figure, and the dot on the dashed vertical line is your own convention. It is calculated on the price series you loaded but only changes how a session is scaled up to a year, so it is not market history. The row rises along a curve that levels off: the figure follows the square root of the session count, so the same distance along the axis lifts it less on the right than on the left.',
        ),
        bac: d(
          'Mỗi bậc là độ biến động năm hoá ứng với một số phiên nguyên trong năm, theo ô Số phiên giao dịch một năm (N); với các quy ước thường dùng, trục trải hết dải ô cho phép chứ không quanh con số bạn nhập. Số phiên trong năm đếm trọn từng phiên, nên bậc giữ nguyên tới số phiên kế tiếp rồi mới nhích. Hình tính trên chuỗi giá bạn đã nạp nhưng chỉ đổi hệ số quy năm, nên không phải diễn biến thị trường. Các bậc đi lên và mỗi lần nhảy ngắn hơn lần trước một chút, vì con số tăng theo căn bậc hai của số phiên.',
          'Each step is the annualized volatility for one whole number of sessions a year on the Trading sessions per year (N) field; for the usual conventions the axis spans the whole range the field allows instead of surrounding your figure. Sessions are counted whole, so each step holds until the next count and then edges up. It is calculated on the price series you loaded but only changes the factor that scales a session to a year, so it is not market history. The staircase rises with each jump a little shorter than the last, because the figure grows with the square root of the session count.',
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
      diem: d(
        'Mỗi chấm là độ biến động năm hoá tính tới một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải, trên mẫu n phiên giá kết thúc ở phiên ấy; những phiên đầu chuỗi chưa đủ một mẫu nên chưa có chấm. Đây là số đo độ rộng dao động trên chuỗi bạn đã nạp, không cho biết giá lên hay xuống. Dãy chấm đi lên là lợi suất các phiên đang phân tán rộng hơn, đi xuống là đều tay hơn. Dãy chấm vọt lên một nấc, giữ ở đó chừng n phiên rồi tụt xuống thường là một phiên biến động mạnh vào mẫu rồi rời mẫu.',
        'Each dot is the annualized volatility up to one session, running from the oldest session on the left to the most recent session on the right, on the sample of n prices ending there; the first sessions, too few to fill a sample, have no dot. It measures how wide the swings are on the series you loaded, not whether the price went up or down. When the row rises session returns are scattering wider; when it falls they are evening out. A row that jumps a notch, holds for about n sessions and drops back is usually one violent session entering the sample and later leaving it.',
      ),
      bac: d(
        'Mỗi bậc là độ biến động năm hoá của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy, vì mẫu chỉ đổi khi có thêm một giá đóng cửa mới và bỏ giá cũ nhất. Đây là số đo độ rộng dao động, không phải chiều của giá. Bậc đi lên là lợi suất vừa vào mẫu lệch xa mức bình quân hơn lợi suất vừa rời, bậc đi xuống là ngược lại. Một bậc cao vọt lên rồi đứng đó chừng n phiên là dấu của một phiên giá chạy rất mạnh còn nằm trong mẫu.',
        'Each step is the annualized volatility of one session, running from the oldest session on the left to the most recent session on the right: the step holds through that session and then jumps, because the sample only changes when a new close comes in and the oldest one drops out. It measures how wide the swings are, not which way the price went. The staircase rises when the return entering the sample lies further from the average than the one leaving, and falls in the opposite case. A tall step that stays up for about n sessions marks a sharp session still inside the sample.',
      ),
    },
  },

  'ty-le-khoi-luong': {
    truc: {
      period: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên lấy trung bình (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi khối lượng bạn đã nạp: cùng khối lượng phiên gần nhất ấy, so với mức trung bình của nhiều hay ít phiên hơn thì tỷ lệ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên là những phiên cũ vừa thêm vào giao dịch thưa hơn gần đây, nên mức trung bình hạ xuống và phiên gần nhất trông sôi động hơn; đường đi xuống là trước đây thanh khoản từng cao hơn.',
          'The line runs left to right along the Number of sessions to average (n) field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the volume series you loaded: for that same latest volume, what the ratio comes out at against the average of more or fewer sessions, not market history. Where the line rises, the older sessions just added traded more thinly than recently, so the average drops and the latest session looks busier; where it falls, liquidity used to be higher.',
        ),
        cot: d(
          'Mỗi cột là tỷ lệ khối lượng ứng với một số phiên lấy trung bình, cột tô đặc là số phiên bạn đang nhập. Cột cao hơn mức một lần là phiên gần nhất khớp nhiều hơn thường lệ; nếu mọi cột đều trên mức ấy thì kết luận này không phụ thuộc cách chọn số phiên.',
          'Each bar is relative volume for one averaging length, and the solid one is the number you have entered. A bar above one time means the latest session traded more than usual; if every bar is above that level, the conclusion does not depend on the length you choose.',
        ),
        diem: d(
          'Mỗi chấm là tỷ lệ khối lượng của phiên gần nhất khi đem so với trung bình của một số phiên liền trước, theo ô Số phiên lấy trung bình (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm trên vạch đứt dọc là đúng số phiên bạn nhập. Hình tính trên chuỗi khối lượng bạn đã nạp, không phải diễn biến thị trường. Khối lượng phiên gần nhất giữ nguyên, chỉ mốc so đổi: dãy chấm đi lên là những phiên cũ vừa vào mốc khớp ít hơn mức trung bình, đi xuống là khớp nhiều hơn. Mốc càng dài thì mỗi phiên thêm vào càng nhẹ, nên các chấm bên phải thường sít nhau hơn.',
          'Each dot is the latest session’s relative volume against the average of the preceding sessions on the Number of sessions to average (n) field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own number. It is calculated on the volume series you loaded, not market history. The latest volume stays put, only the baseline changes: the row rises where the older sessions just added traded below the average and falls where they traded above. A longer baseline weighs each addition less, so the dots on the right usually sit closer together.',
        ),
        bac: d(
          'Mỗi bậc là tỷ lệ khối lượng của phiên gần nhất ứng với một số phiên nguyên của ô Số phiên lấy trung bình (n), từ một nửa đến gấp rưỡi số phiên bạn đang nhập. Mốc so chỉ nhận trọn từng phiên, nên bậc giữ nguyên tới số phiên kế tiếp rồi mới nhảy; dạng này có khi các mức trên trục cách nhau đúng một phiên. Hình tính trên chuỗi khối lượng bạn đã nạp, không phải diễn biến thị trường. Bậc đi lên là phiên cũ vừa vào mốc khớp ít hơn mức trung bình, bậc đi xuống là khớp nhiều hơn; một bậc hụt sâu là phiên khối lượng đột biến vừa lọt vào mốc, kéo mức trung bình lên.',
          'Each step is the latest relative volume for one whole number of sessions on the Number of sessions to average (n) field, from half to one and a half times the number you have entered. The baseline only takes whole sessions, so the step holds until the next count, then jumps; this form appears when the axis levels are exactly one session apart. It is calculated on the volume series you loaded, not market history. The staircase rises where the older session just let into the baseline traded below the average and falls where it traded above; a deep drop is a volume spike entering the baseline.',
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
      diem: d(
        'Mỗi chấm là tỷ lệ khối lượng của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: khối lượng phiên ấy gấp bao nhiêu lần trung bình các phiên liền trước; những phiên đầu chuỗi chưa đủ phiên làm mốc nên chưa có chấm. Đây là số đo độ sôi động của giao dịch, không phải đường giá. Dãy chấm đi lên là phiên sau khớp sôi động hơn phiên trước so với mốc của nó, đi xuống là thưa hơn. Phần lớn chấm thường nằm thành một dải quanh mức một lần; chấm vọt hẳn lên khỏi dải là phiên khối lượng đột biến.',
        'Each dot is the relative volume of one session, running from the oldest session on the left to the most recent session on the right: how many times that session’s volume was the average of the sessions just before it; the first sessions, without a full baseline yet, have no dot. It measures how busy trading is, not the price line. When the row rises a session traded busier against its baseline than the one before; when it falls, thinner. Most dots usually form a band around one time; a dot shooting well clear of that band is a volume spike.',
      ),
      bac: d(
        'Mỗi bậc là tỷ lệ khối lượng của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy sang tỷ lệ của phiên sau, vì khối lượng chỉ đếm theo từng phiên. Đây là số đo độ sôi động, không cho biết giá lên hay xuống. Bậc đi lên là phiên sau khớp sôi động hơn so với mốc của nó, bậc đi xuống là thưa hơn. Tỷ lệ này nhảy mạnh từ phiên này sang phiên khác nên các bậc cao thấp so le; một bậc vọt cao rồi rơi ngay là một phiên khối lượng đột biến đơn lẻ.',
        'Each step is the relative volume of one session, running from the oldest session on the left to the most recent session on the right: the step holds through that session and then jumps to the next ratio, because volume is only counted session by session. It measures how busy trading is, not whether the price went up or down. The staircase rises when a session traded busier against its baseline than the one before, and falls when thinner. The ratio jumps around, so the steps are ragged; one tall step that drops straight back is a single volume spike.',
      ),
    },
  },
};
