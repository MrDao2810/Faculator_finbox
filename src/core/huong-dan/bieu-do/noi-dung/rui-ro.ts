import type { BieuDoRieng } from '../types';
import { d } from './tao';

/**
 * Nhóm rủi ro (`risk`) — 18 công thức, 17 trong số đó chỉ vẽ sau khi nạp chuỗi giá.
 *
 * Với 17 công thức ấy, mỗi điểm của đường là chính chỉ số tính trên các phiên TÍNH TỚI phiên đó
 * (`historyPoints()` cắt chuỗi giá theo tiền tố rồi gọi lại `calc`). Nên đường không phải đường giá:
 * nó là số đo rủi ro của cổ phiếu thay đổi ra sao khi thêm dần từng phiên.
 */
export const BIEU_DO_RUI_RO: Readonly<Record<string, BieuDoRieng>> = {
  'co-lenh-rui-ro': {
    truc: {
      capital: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn tài khoản (V), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu vốn tài khoản lớn hay nhỏ hơn thì cỡ lệnh ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: mức rủi ro tính bằng phần trăm của vốn, nên vốn gấp đôi thì số tiền cho phép mất gấp đôi và mua được gấp đôi số cổ phiếu.',
          'The line runs left to right along the Account capital (V) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a larger or smaller account, not market history. The line rises steadily: risk is set as a percentage of capital, so twice the capital allows twice the loss and buys twice as many shares.',
        ),
        cot: d(
          'Mỗi cột là số cổ phiếu được mua ở một mức vốn, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Tài khoản hao đi sau vài lệnh thua thì cỡ lệnh tự lùi về các cột bên trái, đó chính là cách quy tắc này giữ cho tài khoản không cháy.',
          'Each bar is the number of shares to buy at one capital level; bars grow taller to the right and the solid one is the level you have entered. After a few losing trades the account is smaller and the position size steps back to the bars on the left, which is how this rule keeps an account from blowing up.',
        ),
        diem: d(
          'Mỗi chấm là cỡ lệnh tính ở một mức của ô Vốn tài khoản (V), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tài khoản lớn hay nhỏ hơn thì được mua bao nhiêu cổ phiếu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, chấm sau cao hơn chấm trước đúng một khoảng như nhau: giá vào và giá cắt lỗ giữ nguyên, nên mỗi phần vốn thêm vào cho mua thêm cùng một số cổ phiếu.',
          'Each dot is the position size at one level of the Account capital (V) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on a larger or smaller account, not market history. The row of dots rises in a straight line, each dot the same distance above the one before: with the entry and stop prices held still, every extra slice of capital buys the same number of extra shares.',
        ),
      },
      riskPercent: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Rủi ro mỗi lệnh (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu chấp nhận mất nhiều hay ít hơn cho một lệnh thì cỡ lệnh ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: phần vốn cho phép mất tăng bao nhiêu phần thì số cổ phiếu được mua tăng bấy nhiêu phần, vì khoảng cách tới giá cắt lỗ không đổi.',
          'The line runs left to right along the Risk per trade (r) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on accepting a larger or smaller loss per trade, not market history. The line rises steadily: the share count grows in exact proportion to the part of capital you allow one trade to lose, because the distance to the stop does not change.',
        ),
        cot: d(
          'Mỗi cột là số cổ phiếu được mua ở một mức rủi ro mỗi lệnh, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột cao gấp đôi là lệnh thua sẽ lấy đi phần vốn gấp đôi; chuỗi vài lệnh thua liên tiếp ở các cột bên phải bào tài khoản rất nhanh.',
          'Each bar is the number of shares to buy at one risk per trade; bars grow taller to the right and the solid one is the level you have entered. A bar twice as tall means a losing trade takes twice the share of capital; a run of losers on the bars to the right wears an account down very fast.',
        ),
        diem: d(
          'Mỗi chấm là số cổ phiếu được mua ở một mức của ô Rủi ro mỗi lệnh (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu chấp nhận mất nhiều hay ít hơn cho một lệnh thì cỡ lệnh ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều: hai chấm cạnh nhau ở chỗ nào trên trục cũng chênh nhau cùng một số cổ phiếu, vì khoảng cách từ giá vào tới giá cắt lỗ không đổi.',
          'Each dot is the number of shares you may buy at one level of the Risk per trade (r) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own level. It is a what-if on accepting a larger or smaller loss per trade, not market history. The row of dots rises evenly: any two neighboring dots differ by the same number of shares wherever they sit on the axis, because the distance from entry to stop does not change.',
        ),
      },
      entryPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá vào lệnh (Pvao), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu vào lệnh ở giá khác thì được mua bao nhiêu cổ phiếu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: giá vào càng xa giá cắt lỗ thì mỗi cổ phiếu càng có thể mất nhiều, nên số cổ phiếu được phép mua càng ít. Vùng gạch chéo bên trái là chỗ giá vào không cao hơn giá cắt lỗ, không tính được.',
          'The line runs left to right along the Entry price (Pvao) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on how many shares you may buy at another entry, not market history. The line falls and flattens: the further the entry sits from the stop, the more each share can lose, so the fewer shares you are allowed. The hatched zone on the left is where the entry is not above the stop price and nothing can be calculated.',
        ),
        cot: d(
          'Mỗi cột là cỡ lệnh ở một mức giá vào, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Mấy cột cao vọt ngay sát vùng không tính được là lúc giá vào gần chạm giá cắt lỗ: khoảng cắt lỗ quá hẹp nên công thức cho mua rất nhiều, và đó là chỗ nên dè chừng nhất.',
          'Each bar is the position size at one entry price; bars shrink to the right and the solid one is the price you have entered. The towering bars right beside the zone that cannot be calculated are entries almost touching the stop: the stop distance is so narrow that the formula allows a very large position, and that is where to be most careful.',
        ),
        diem: d(
          'Mỗi chấm là cỡ lệnh ở một mức của ô Giá vào lệnh (Pvao), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu vào lệnh ở giá khác thì được mua bao nhiêu cổ phiếu, không phải diễn biến thị trường. Dãy chấm đi xuống: mấy chấm ngay sau vùng gạch chéo đứng rất cao rồi tụt mạnh, càng sang phải mỗi chấm chỉ còn thấp hơn chấm trước một chút, vì giá vào càng xa giá cắt lỗ thì mỗi cổ phiếu càng có thể mất nhiều. Vùng gạch chéo bên trái là những giá vào không cao hơn giá cắt lỗ, không tính được.',
          'Each dot is the position size at one level of the Entry price (Pvao) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on buying at another entry, not market history. The row of dots falls: the first dots after the hatched zone sit very high and drop steeply, then each dot is only a little below the one before, because the further the entry sits from the stop, the more each share can lose. The hatched zone on the left is entries not above the stop, where nothing is calculated.',
        ),
      },
      stopPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá cắt lỗ (Pcat), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu đặt giá cắt lỗ ở mức khác thì cỡ lệnh ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc đứng dần về phía giá vào lệnh: cắt lỗ càng sát thì mỗi cổ phiếu có thể mất càng ít, nên được mua càng nhiều. Vùng gạch chéo bên phải là những mức cắt lỗ bằng hoặc cao hơn giá vào lệnh, ở đó lệnh mua không có nghĩa nên không tính.',
          'The line runs left to right along the Stop-loss price (Pcat) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on placing the stop at a different price, not market history. The line rises and turns almost vertical as it nears the entry price: the tighter the stop, the less each share can lose, so the more shares you may buy. The hatched area on the right is stops at or above the entry price, where a buy order makes no sense and nothing is calculated.',
        ),
        cot: d(
          'Mỗi cột là số cổ phiếu được mua ở một mức giá cắt lỗ, cột cao dần về bên phải và cột tô đặc là mức giá bạn đang nhập. Vài cột cuối sát vùng gạch chéo cao áp đảo: cắt lỗ chỉ cách giá vào một chút thì con số cổ phiếu rất lớn, nhưng lệnh cũng rất dễ bị dừng.',
          'Each bar is the number of shares to buy at one stop price; bars grow taller to the right and the solid one is the price you have entered. The last few bars before the hatched zone dwarf the rest: a stop only a little under the entry gives a very large share count, but the trade is also very easily stopped out.',
        ),
        diem: d(
          'Mỗi chấm là số cổ phiếu được mua ở một mức của ô Giá cắt lỗ (Pcat), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu đặt cắt lỗ ở mức khác thì cỡ lệnh ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên, thoạt đầu mỗi chấm chỉ nhích hơn chấm trước một chút, càng gần giá vào lệnh thì khoảng nhảy giữa hai chấm càng lớn: cắt lỗ càng sát thì mỗi cổ phiếu mất càng ít nên được mua càng nhiều. Vùng gạch chéo bên phải là những mức cắt lỗ bằng hoặc cao hơn giá vào, không tính được.',
          'Each dot is the number of shares you may buy at one level of the Stop-loss price (Pcat) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on placing the stop elsewhere, not market history. The row of dots rises, each dot at first only slightly above the last, and the jump between two dots grows as the stop nears the entry price: the tighter the stop, the less each share can lose, so the more shares you may buy. The hatched zone on the right is stops at or above the entry, where nothing is calculated.',
        ),
      },
    },
  },

  'sut-giam-sau-nhat': {
    truc: {
      lookback: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên gần nhất đưa vào tính (N), từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, nhìn lùi xa hay gần hơn thì mức sụt giảm sâu nhất ra bao nhiêu, không phải diễn biến thị trường. Đường chỉ có thể đi lên hoặc giữ nguyên: nhìn lùi xa hơn là gom thêm phiên cũ, nên cú rơi sâu nhất chỉ sâu thêm hoặc như cũ. Chuỗi đã nạp ngắn hơn số phiên trên trục thì đường phẳng, vì không còn phiên nào để thêm.',
          'The line runs left to right along the Number of recent sessions to include (N) field, from about half to about one and a half times the number you have entered. It is calculated on the price series you loaded: on that same series, how deep the worst drawdown is when you look further or less far back, not market history. The line only ever rises or stays level: looking further back adds older sessions, so the worst drop can only deepen or stay as it was. If the loaded series is shorter than the sessions on the axis the line is level, because there are no more sessions to add.',
        ),
        cot: d(
          'Mỗi cột là mức sụt giảm sâu nhất khi nhìn lùi một số phiên, cột tô đặc là số phiên bạn đang nhập. Chỗ cột nhảy vọt lên một bậc là lúc cửa sổ vừa chạm tới một cú rơi cũ sâu hơn mọi cú rơi gần đây.',
          'Each bar is the worst drawdown when looking back a given number of sessions, and the solid one is the number you have entered. Where the bars jump up a step is where the window has just reached an older drop deeper than any recent one.',
        ),
        diem: d(
          'Mỗi chấm là mức sụt giảm sâu nhất khi nhìn lùi một số phiên theo ô Số phiên gần nhất đưa vào tính (N), từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập. Hình tính trên chuỗi giá bạn đã nạp, là phép thử nhìn lùi xa hay gần hơn, không phải diễn biến thị trường. Dãy chấm chỉ đi lên hoặc đứng nguyên: các chấm thường xếp thành từng hàng cao bằng nhau, rồi chấm kế tiếp nhảy lên khi cửa sổ vừa gom tới một cú rơi cũ sâu hơn. Mọi chấm ở phần trục dài hơn chuỗi đã nạp đều cao bằng nhau, vì không còn phiên nào để thêm.',
          'Each dot is the worst drawdown when looking back a given number of sessions along the Number of recent sessions to include (N) field, from about half to about one and a half times the number you have entered. It is calculated on the price series you loaded, a what-if on how far back you look, not market history. The row of dots only ever rises or holds: dots often line up in runs of equal height, then the next one jumps up where the window has just reached an older, deeper drop. Every dot past the length of the loaded series sits at the same height, because there are no more sessions to add.',
        ),
        bac: d(
          'Mỗi bậc là mức sụt giảm sâu nhất ở một mức của ô Số phiên gần nhất đưa vào tính (N), từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập. Thanh trượt của ô nhích theo từng nấc, giữa hai nấc không chọn được số phiên nào khác, nên bậc giữ nguyên tới mức kế tiếp rồi mới nhảy. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Bậc chỉ đi lên hoặc đứng yên, và thường đứng yên qua nhiều mức: cú rơi sâu nhất chỉ đổi khi cửa sổ gom tới một cú rơi cũ sâu hơn, bậc nhảy càng cao thì cú rơi ấy càng sâu hơn những cú gần đây.',
          'Each step is the maximum drawdown at one level of the Number of recent sessions to include (N) field, from about half to about one and a half times the number you have entered. The slider moves notch by notch and no session count between two notches can be chosen, so a step holds until the next level, then jumps. It is calculated on the price series you loaded, not market history. The staircase only ever rises or holds, often across many levels: the worst drop only changes when the window reaches an older, deeper one, and the taller the step, the deeper that drop is than the recent ones.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là cú rơi sâu nhất từ một đỉnh xuống đáy sau đó, tính trong cửa sổ kết thúc ở phiên ấy. Đây là số đo trên chính chuỗi giá bạn nạp, và nó không phải đường giá. Đường đi lên là cổ phiếu vừa rơi một cú sâu hơn mọi cú còn trong cửa sổ; đi ngang là chưa có cú nào sâu hơn; đi xuống là cú rơi cũ đã trôi ra khỏi cửa sổ.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the deepest drop from a peak to the trough after it, within the window ending at that session. It is measured on the very price series you loaded, and it is not the price line. When it rises the share has just suffered a drop deeper than any still inside the window; when it runs flat no deeper one has come; when it falls the old drop has slid out of the window.',
      ),
      cot: d(
        'Mỗi cột là mức sụt giảm sâu nhất tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột cao là quãng mà người giữ cổ phiếu từng phải chịu một cú mất giá lớn; một dãy cột bằng nhau là quãng cú rơi ấy vẫn chưa bị vượt qua.',
        'Each bar is the maximum drawdown up to one session, the last one on the right being the latest. A tall bar marks a stretch when holders had to sit through a large loss; a run of equal bars is a stretch in which that drop has not been exceeded.',
      ),
      diem: d(
        'Mỗi chấm là cú rơi sâu nhất trong cửa sổ kết thúc ở một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; đoạn đầu chưa có chấm vì chưa đủ phiên để tính. Đây là số đo trên chuỗi giá bạn đã nạp, không phải đường giá. Dãy chấm đi lên ở phiên giá vừa tụt sâu hơn mọi cú rơi còn trong cửa sổ, đi xuống khi một cú rơi cũ trôi ra khỏi cửa sổ; những hàng chấm dài cao bằng nhau là quãng chưa có cú rơi nào sâu hơn.',
        'Each dot is the deepest drop within the window ending at one session, running from the oldest session on the left to the most recent session on the right; the first stretch has no dots because there are not yet enough sessions. It is measured on the price series you loaded, not the price line. The row of dots rises at a session where the price has just fallen further than any drop still in the window, and falls when an old drop slides out of the window; long runs of dots at one height are stretches with no deeper drop.',
      ),
      bac: d(
        'Mỗi bậc là mức sụt giảm sâu nhất tính tới một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào. Hình hay có những bậc dài, vì con số chỉ đổi khi có một cú rơi sâu hơn hoặc một cú rơi cũ rời cửa sổ. Bậc đi lên là phiên giá vừa tụt sâu hơn mọi cú rơi còn trong cửa sổ, bậc nhảy càng cao thì cú rơi mới càng sâu hơn cú cũ; bậc đi xuống là cú rơi cũ đã trôi ra khỏi cửa sổ.',
        'Each step is the maximum drawdown up to one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and then moves to the next one, because there is no closing price between two sessions. Long steps are common, since the figure only changes when a deeper drop arrives or an old one leaves the window. When the staircase rises the price has just fallen further than any drop still in the window, and the taller the step, the deeper the new drop; when it falls an old drop has slid out of the window.',
      ),
    },
  },

  'sut-giam-hien-tai': {
    truc: {
      lookback: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên gần nhất đưa vào tính, từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, tìm đỉnh trong cửa sổ dài hay ngắn hơn thì mức sụt giảm hiện tại ra bao nhiêu, không phải diễn biến thị trường. Đường chỉ có thể đi lên hoặc giữ nguyên: cửa sổ rộng hơn chỉ có thể tìm ra một đỉnh cao hơn, và đỉnh càng cao thì giá phiên gần nhất càng cách xa nó. Chuỗi đã nạp ngắn hơn số phiên trên trục thì đoạn bên phải phẳng, vì không còn phiên nào để thêm.',
          'The line runs left to right along the Number of recent sessions to include field, from about half to about one and a half times the number you have entered. It is calculated on the price series you loaded: on that same series, how far below the peak the latest price sits when the peak is searched over a longer or shorter window, not market history. The line only ever rises or stays level: a wider window can only find a higher peak, and the higher the peak, the further the latest price sits below it. A level stretch on the right means the loaded series is shorter than the axis.',
        ),
        cot: d(
          'Mỗi cột là mức sụt giảm hiện tại ứng với một độ dài cửa sổ, cột tô đặc là số phiên bạn đang nhập. Dãy cột bằng nhau nghĩa là nới cửa sổ không tìm thêm được đỉnh nào cao hơn: hoặc đỉnh cao nhất nằm ngay trong những phiên gần đây, hoặc chuỗi đã nạp ngắn hơn số phiên trên trục nên không còn phiên nào để thêm.',
          'Each bar is the current drawdown for one window length, and the solid one is the number you have entered. A row of equal bars means widening the window finds no higher peak: either the highest peak lies within the recent sessions, or the loaded series is shorter than the sessions on the axis and there is nothing left to add.',
        ),
        diem: d(
          'Mỗi chấm là giá phiên gần nhất đang thấp hơn đỉnh bao nhiêu phần trăm, khi đỉnh được tìm trong một độ dài cửa sổ của ô Số phiên gần nhất đưa vào tính, từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Dãy chấm chỉ đi lên hoặc đứng nguyên, vì nới cửa sổ chỉ có thể tìm ra một đỉnh cao hơn. Cả dãy chấm cao bằng nhau là đỉnh cao nhất đã nằm sẵn trong cửa sổ ngắn nhất trên trục; chấm nhảy lên là cửa sổ vừa lùi tới một đỉnh cũ cao hơn.',
          'Each dot is how far, in percent, the latest price sits below the peak found within one window length of the Number of recent sessions to include field, from about half to about one and a half times the number you have entered. It is calculated on the price series you loaded, not market history. The row of dots only ever rises or holds, because a wider window can only find a higher peak. A whole row at one height means the highest peak already lies inside the shortest window on the axis; a dot that jumps up is a window that has just reached an older, higher peak.',
        ),
        bac: d(
          'Mỗi bậc là mức sụt giảm hiện tại ở một mức của ô Số phiên gần nhất đưa vào tính, từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập. Thanh trượt của ô chỉ dừng ở từng nấc, nên bậc giữ nguyên tới mức sau; hình hay có bậc dài, vì nới cửa sổ mà không gặp đỉnh nào cao hơn thì con số không đổi. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Bậc chỉ đi lên hoặc đứng yên: bậc nhảy lên là cửa sổ vừa gặp một đỉnh cũ cao hơn, đỉnh ấy càng cao hơn đỉnh trước thì bậc nhảy càng cao.',
          'Each step is the current drawdown at one level of the Number of recent sessions to include field, from about half to about one and a half times the number you have entered. The slider stops only at notches, so a step holds until the next level; long steps are common, since a wider window that meets no higher peak leaves the figure unchanged. It is calculated on the price series you loaded, not market history. The staircase only ever rises or holds: a step up is a window that has just met an older, higher peak, and the more that peak tops the previous one, the taller the step.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là giá của phiên ấy đang thấp hơn đỉnh cao nhất trong cửa sổ bao nhiêu phần trăm. Đây là số đo trên chính chuỗi giá bạn nạp, và nó đi NGƯỢC chiều giá. Đường đi lên là giá đang tụt xa dần khỏi đỉnh; đi xuống là giá đang hồi về phía đỉnh; chạm mức 0 là phiên giá lập đỉnh mới của cửa sổ.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is how far, in percent, that session’s price stood below the highest peak in the window. It is measured on the very price series you loaded, and it moves AGAINST the price. When it rises the price is slipping further from its peak; when it falls the price is recovering toward the peak; touching 0 is a session that set a new high for the window.',
      ),
      cot: d(
        'Mỗi cột là mức sụt giảm so với đỉnh ở một phiên, cột cuối bên phải là phiên gần nhất. Cột chỉ còn là một vệt mỏng sát vạch 0 là phiên giá đứng đúng đỉnh; cột càng cao thì phiên ấy càng xa đỉnh. Cột cuối cho biết phiên gần nhất còn thấp hơn đỉnh bao nhiêu phần trăm; muốn về lại đỉnh thì giá phải tăng một tỷ lệ lớn hơn chiều cao cột ấy, vì mức tăng tính trên mức giá đã thấp đi.',
        'Each bar is the drawdown from the peak at one session, the last one on the right being the latest. A bar reduced to a thin sliver on the zero line is a session right at the peak; the taller the bar, the further that session sat from it. The last bar tells how far below the peak the latest price sits; getting back takes a larger percentage rise than the bar’s height, because the rise is counted from the lower price.',
      ),
      diem: d(
        'Mỗi chấm là giá của một phiên đang thấp hơn đỉnh cao nhất trong cửa sổ bao nhiêu phần trăm, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải. Đây là số đo trên chuỗi giá bạn đã nạp và nó đi ngược chiều giá: dãy chấm đi lên là giá đang tụt xa dần khỏi đỉnh, đi xuống là giá đang hồi về phía đỉnh. Chấm chạm mức 0 là phiên giá lập đỉnh mới của cửa sổ; một chấm tách hẳn khỏi các chấm quanh nó là phiên giá đổi mạnh.',
        'Each dot is how far, in percent, one session’s price stood below the highest peak in the window, running from the oldest session on the left to the most recent session on the right. It is measured on the price series you loaded and moves against the price: when the row of dots rises the price is slipping further from its peak, and when it falls the price is recovering toward it. A dot touching 0 is a session that set a new high for the window; a dot standing apart from its neighbors is a session where the price moved sharply.',
      ),
      bac: d(
        'Mỗi bậc là mức sụt giảm so với đỉnh ở một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào. Bậc đi lên là giá vừa tụt thêm khỏi đỉnh, đi xuống là giá hồi lại; bậc rơi hẳn về mức 0 là phiên giá lập đỉnh mới. Độ cao một bậc nhảy cho thấy giá phiên ấy đổi mạnh hay nhẹ so với phiên trước, tính trên giá đỉnh.',
        'Each step is the drawdown from the peak at one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and then moves to the next one, because there is no closing price between two sessions. When the staircase rises the price has slipped further from its peak, and when it falls the price is recovering; a step dropping all the way to 0 is a session that set a new high. The height of a step shows how sharply that session’s price moved from the one before, measured against the peak price.',
      ),
    },
  },

  'var-lich-su': {
    truc: {
      lookback: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên gần nhất đưa vào tính (N), từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập. Hình tính trên chuỗi giá bạn đã nạp: lấy nhiều hay ít phiên hơn thì VaR ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: đi lên là các phiên cũ vừa thêm vào xấu hơn những phiên gần đây, đi xuống là chúng êm hơn. Đoạn phẳng hẳn ở bên phải thường chỉ có nghĩa là chuỗi đã nạp ngắn hơn số phiên trên trục; chuỗi đủ dài mà đường vẫn gần như phẳng thì mới là rủi ro ổn định qua nhiều giai đoạn.',
          'The line runs left to right along the Number of recent sessions to include (N) field, from about half to about one and a half times the number you have entered. It is calculated on the price series you loaded: what VaR comes out at with more or fewer sessions, not market history. The line has no fixed direction: where it rises, the older sessions just added were worse than the recent ones; where it falls, they were calmer. A perfectly level stretch on the right usually just means the loaded series is shorter than the axis; only a long enough series with a nearly level line shows stable risk.',
        ),
        cot: d(
          'Mỗi cột là VaR khi dùng một số phiên gần nhất, cột tô đặc là số phiên bạn đang nhập. So cột tô đặc với các cột quanh nó: nếu đổi số phiên một chút mà cột đổi nhiều thì con số VaR đang phụ thuộc vào vài phiên cá biệt.',
          'Each bar is VaR using a given number of recent sessions, and the solid one is the number you have entered. Compare the solid bar with its neighbors: if a small change in the number of sessions moves the bar a lot, the VaR figure hangs on a few unusual sessions.',
        ),
        diem: d(
          'Mỗi chấm là VaR tính với một độ dài cửa sổ của ô Số phiên gần nhất đưa vào tính (N), từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, lấy nhiều hay ít phiên hơn thì mức lỗ của một phiên xấu ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm không có chiều cố định: đi lên là các phiên cũ vừa thêm vào xấu hơn giai đoạn gần đây, đi xuống là chúng êm hơn. Hai chấm cạnh nhau chênh nhiều là con số VaR đang tựa vào vài phiên cá biệt; các chấm cuối cao bằng nhau thường chỉ vì chuỗi đã nạp ngắn hơn trục.',
          'Each dot is VaR for one window length of the Number of recent sessions to include (N) field, from about half to about one and a half times the number you have entered. It is calculated on the price series you loaded, a what-if on using more or fewer sessions, not market history. The row has no fixed direction: where it rises, the older sessions just added were worse than the recent stretch; where it falls, they were calmer. Two neighboring dots far apart mean VaR leans on a few unusual sessions; equal dots at the end usually just mean the loaded series is shorter than the axis.',
        ),
        bac: d(
          'Mỗi bậc là VaR ở một mức của ô Số phiên gần nhất đưa vào tính (N), từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập; thanh trượt nhích theo từng nấc, giữa hai nấc không chọn được số phiên nào khác, nên bậc giữ nguyên tới mức kế tiếp. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Bậc đi lên là những phiên cũ vừa gom thêm có cú giảm mạnh hơn, đi xuống là chúng êm hơn và làm phần đuôi xấu loãng ra; bậc nhảy cao là lúc một phiên giảm sâu vừa lọt vào nhóm phiên tệ nhất.',
          'Each step is VaR at one level of the Number of recent sessions to include (N) field, from about half to about one and a half times the number you have entered; the slider moves notch by notch and no session count between two notches can be chosen, so the step holds until the next level. It is calculated on the price series you loaded, not market history. When the staircase rises, the older sessions just taken in held sharper drops; when it falls, they were calmer and thin out the bad tail. A tall step is where a deep loss has just joined the group of worst sessions.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là mức lỗ một phiên mà chỉ một phần nhỏ số phiên trong cửa sổ tính tới đó từng vượt qua. Đây là số đo trên chính chuỗi giá bạn nạp, không phải đường giá. Đường đi lên là những phiên xấu trong cửa sổ đang xấu hơn, tức rủi ro một phiên lớn dần; đi xuống là các phiên giảm mạnh đã lùi ra khỏi cửa sổ và cổ phiếu đang êm lại.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the one-session loss that only a small share of the sessions in the window up to then ever exceeded. It is measured on the very price series you loaded, not the price line. When it rises the bad sessions in the window are getting worse, so one-session risk is growing; when it falls the sharp down days have left the window and the share is calming down.',
      ),
      cot: d(
        'Mỗi cột là VaR tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột cao là quãng mà một phiên xấu có thể lấy đi nhiều hơn; cột chỉ đổi khi một phiên giảm mạnh bước vào hoặc rời khỏi cửa sổ, nên nó hay đi thành từng bậc.',
        'Each bar is the VaR up to one session, the last one on the right being the latest. A tall bar is a stretch in which a bad session could take more; a bar changes only when a sharp down day enters or leaves the window, so the row tends to move in steps.',
      ),
      diem: d(
        'Mỗi chấm là VaR tính trên cửa sổ kết thúc ở một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; đoạn đầu chưa có chấm vì chưa đủ phiên để dựng phân vị. Đây là số đo trên chuỗi giá bạn đã nạp, không phải đường giá. Dãy chấm đi lên là những phiên xấu trong cửa sổ đang xấu hơn; đi xuống là các phiên giảm mạnh đã lùi ra khỏi cửa sổ hoặc bị loãng giữa nhiều phiên êm. Một chấm nhảy hẳn lên khỏi các chấm trước nó là phiên vừa có một cú giảm sâu.',
        'Each dot is VaR over the window ending at one session, running from the oldest session on the left to the most recent session on the right; the first stretch has no dots because there are not yet enough sessions to build the percentile. It is measured on the price series you loaded, not the price line. When the row of dots rises the bad sessions in the window are getting worse; when it falls the sharp down days have left the window or are diluted among many calm ones. A dot that leaps above the ones before it is a session that has just had a deep loss.',
      ),
      bac: d(
        'Mỗi bậc là VaR của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào. Hình hay có vài bậc nhảy hẳn lên giữa một dãy bậc chỉ nhích nhẹ. Bậc nhảy đi lên là phiên vừa có một cú giảm sâu lọt vào nhóm phiên tệ nhất; bậc đi xuống là một phiên giảm mạnh cũ đã rời cửa sổ, hoặc nhóm phiên tệ nhất đang loãng dần giữa nhiều phiên êm.',
        'Each step is the VaR of one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and then moves to the next one, because there is no closing price between two sessions. Expect a few tall jumps among steps that barely move. When the staircase rises with a jump, a session has just added a deep loss to the group of worst sessions; when it falls an old sharp drop has left the window, or the worst group is slowly being diluted among calm sessions.',
      ),
    },
  },

  'cvar-lich-su': {
    truc: {
      lookback: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên gần nhất đưa vào tính (N), từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, lấy nhiều hay ít phiên hơn thì mức lỗ trung bình của những phiên tệ nhất ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: đi lên là cửa sổ vừa gom thêm những phiên rơi mạnh, đi xuống là các phiên thêm vào làm loãng phần đuôi xấu. Chuỗi đã nạp ngắn hơn số phiên trên trục thì đoạn bên phải phẳng, vì không còn phiên nào để thêm.',
          'The line runs left to right along the Number of recent sessions to include (N) field, from about half to about one and a half times the number you have entered. It is calculated on the price series you loaded: on that same series, the average loss of the worst sessions when more or fewer sessions are used, not market history. The line has no fixed direction: where it rises, the window has just taken in sessions with heavy drops; where it falls, the added sessions dilute the bad tail. A level stretch on the right means the loaded series is shorter than the axis.',
        ),
        cot: d(
          'Mỗi cột là CVaR khi dùng một số phiên gần nhất, cột tô đặc là số phiên bạn đang nhập. CVaR chỉ dựa vào một nhúm phiên xấu nhất, nên cột có thể nhảy hẳn một bậc khi một phiên rơi mạnh lọt vào hoặc ra khỏi cửa sổ.',
          'Each bar is CVaR using a given number of recent sessions, and the solid one is the number you have entered. CVaR rests on a handful of the worst sessions, so a bar can jump a whole step when one heavy drop enters or leaves the window.',
        ),
        diem: d(
          'Mỗi chấm là CVaR, tức mức lỗ trung bình của riêng những phiên tệ nhất, tính với một độ dài cửa sổ của ô Số phiên gần nhất đưa vào tính (N), từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Dãy chấm không có chiều cố định: đi lên là cửa sổ vừa gom thêm những phiên rơi mạnh, đi xuống là các phiên thêm vào làm loãng phần đuôi xấu. Vài chấm liền nhau cao bằng nhau là những phiên thêm vào không làm đổi nhóm phiên tệ nhất, hoặc chuỗi đã nạp đã hết phiên để thêm.',
          'Each dot is CVaR, the average loss of only the worst sessions, for one window length of the Number of recent sessions to include (N) field, from about half to about one and a half times the number you have entered. It is calculated on the price series you loaded, not market history. The row has no fixed direction: where it rises, the window has just taken in sessions with heavy drops; where it falls, the added sessions dilute the bad tail. Neighboring dots at one height mean the added sessions left the worst group unchanged, or the loaded series ran out of sessions.',
        ),
        bac: d(
          'Mỗi bậc là CVaR ở một mức của ô Số phiên gần nhất đưa vào tính (N), từ khoảng một nửa đến khoảng gấp rưỡi số phiên bạn đang nhập; thanh trượt chỉ dừng ở từng nấc nên giữa hai nấc không có số phiên nào để chọn, và bậc giữ nguyên tới mức sau. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. CVaR chỉ dựa vào một nhúm phiên xấu nhất nên hay có bậc dài: bậc đi lên là nhóm ấy vừa nhận thêm một phiên rơi mạnh, bậc đi xuống là nhóm ấy nhận thêm những phiên nhẹ hơn nên mức lỗ trung bình giảm.',
          'Each step is CVaR at one level of the Number of recent sessions to include (N) field, from about half to about one and a half times the number you have entered; the slider stops only at notches, so there is no session count between two of them to choose and the step holds until the next level. It is calculated on the price series you loaded, not market history. CVaR rests on a handful of the worst sessions, so long steps are common: the staircase rises when that group takes in a heavy drop, and falls when it takes in milder sessions that pull the average loss down.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là mức lỗ trung bình của riêng những phiên tệ nhất trong cửa sổ tính tới đó. Đây là số đo trên chính chuỗi giá bạn nạp, không phải đường giá. Đường đi lên là khi ngày xấu xảy ra thì nó đang xấu hơn trước; đi xuống là các phiên tệ nhất đã nhẹ đi hoặc đã trôi ra khỏi cửa sổ.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the average loss of only the worst sessions in the window up to then. It is measured on the very price series you loaded, not the price line. When it rises a bad day, when it comes, is worse than before; when it falls the worst sessions have softened or slid out of the window.',
      ),
      cot: d(
        'Mỗi cột là CVaR tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột luôn cao hơn hoặc bằng cột VaR cùng phiên, vì nó lấy trung bình của phần nằm ngoài ngưỡng VaR; khoảng chênh ấy càng lớn thì phần đuôi rủi ro càng nặng.',
        'Each bar is the CVaR up to one session, the last one on the right being the latest. It is always at least as tall as the VaR bar of the same session, because it averages what lies beyond the VaR threshold; the wider that gap, the heavier the tail risk.',
      ),
      diem: d(
        'Mỗi chấm là mức lỗ trung bình của những phiên tệ nhất trong cửa sổ kết thúc ở một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; đoạn đầu chưa có chấm vì chưa đủ phiên. Đây là số đo trên chuỗi giá bạn đã nạp, không phải đường giá. Các chấm hay xếp thành những hàng dài cao bằng nhau vì nhóm phiên tệ nhất ít khi đổi; dãy chấm đi lên là ngày xấu vừa xảy ra tệ hơn trước, đi xuống là các phiên tệ nhất đã nhẹ đi hoặc trôi ra khỏi cửa sổ.',
        'Each dot is the average loss of the worst sessions in the window ending at one session, running from the oldest session on the left to the most recent session on the right; the first stretch has no dots because there are not yet enough sessions. It is measured on the price series you loaded, not the price line. Dots often line up in long runs at one height, because the group of worst sessions rarely changes; the row rises when a new bad day is worse than before, and falls when the worst sessions have softened or slid out of the window.',
      ),
      bac: d(
        'Mỗi bậc là CVaR của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào. Bậc thường kéo dài nhiều phiên vì CVaR chỉ đổi khi nhóm phiên tệ nhất đổi thành phần. Bậc đi lên là một phiên rơi mạnh vừa vào nhóm ấy, bậc nhảy càng cao thì phiên mới vào càng tệ; bậc đi xuống là một phiên tệ cũ đã rời cửa sổ.',
        'Each step is the CVaR of one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and then moves to the next one, because there is no closing price between two sessions. Steps often last many sessions, since CVaR only changes when the group of worst sessions changes members. The staircase rises when a heavy drop joins that group, and the taller the step, the worse the newcomer; it falls when an old bad session leaves the window.',
      ),
    },
  },

  'do-lech-chuan-loi-suat-phien': {
    truc: {
      sessions: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên lấy để tính, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, lấy nhiều hay ít phiên hơn thì độ lệch chuẩn ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: đi lên là những phiên cũ vừa thêm vào dao động mạnh hơn giai đoạn gần đây, đi xuống là chúng êm hơn.',
          'The line runs left to right along the Number of sessions used field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the standard deviation comes out at when more or fewer sessions are used, not market history. The line has no fixed direction: where it rises, the older sessions just added swung harder than the recent stretch; where it falls, they were calmer.',
        ),
        cot: d(
          'Mỗi cột là độ lệch chuẩn lợi suất phiên khi lấy một số phiên, cột tô đặc là số phiên bạn đang nhập. Cột bên trái dựa trên ít phiên nên dễ lệch vì vài phiên bất thường; càng sang phải con số càng ổn định nhưng cũng càng cũ.',
          'Each bar is the daily standard deviation using a given number of sessions, and the solid one is the number you have entered. Bars on the left rest on few sessions and are easily skewed by a few odd days; moving right the figure steadies but also ages.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là mức dao động bình quân của lợi suất mỗi phiên, tính trên các phiên tới đó. Đây là số đo trên chính chuỗi giá bạn nạp, và nó không cho biết giá lên hay xuống. Đường đi lên là các phiên gần đây biến động mạnh hơn, theo cả hai chiều; đi xuống là cổ phiếu đang đi êm lại.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the average swing of the per-session return, computed on the sessions up to then. It is measured on the very price series you loaded, and it says nothing about whether the price went up or down. When it rises recent sessions are moving harder, in both directions; when it falls the share is settling.',
      ),
      cot: d(
        'Mỗi cột là độ lệch chuẩn lợi suất phiên tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột cao là quãng giá giật mạnh, cột thấp là quãng yên; không cột nào nói được hướng đi của giá.',
        'Each bar is the per-session return deviation up to one session, the last one on the right being the latest. A tall bar is a jumpy stretch, a short one a quiet stretch; no bar can tell you which way the price went.',
      ),
    },
  },

  'do-bien-dong-nam-hoa': {
    truc: {
      sessions: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên lấy để tính, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, lấy nhiều hay ít phiên hơn thì độ biến động năm hoá ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: đi lên là giai đoạn cũ hơn biến động mạnh hơn hiện tại, đi xuống là giai đoạn cũ ấy êm hơn hiện tại.',
          'The line runs left to right along the Number of sessions used field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what annualized volatility comes out at when more or fewer sessions are used, not market history. The line has no fixed direction: where it rises, the older stretch was more volatile than the present; where it falls, that older stretch was calmer.',
        ),
        cot: d(
          'Mỗi cột là độ biến động năm hoá khi lấy một số phiên, cột tô đặc là số phiên bạn đang nhập. Các cột chênh nhau nhiều là dấu hiệu độ biến động của mã thay đổi theo thời kỳ, nên một con số duy nhất chưa đủ để nói về rủi ro.',
          'Each bar is annualized volatility using a given number of sessions, and the solid one is the number you have entered. Bars that differ a lot signal that the ticker’s volatility changes from period to period, so one figure alone does not describe its risk.',
        ),
      },
      tradingDays: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên giao dịch trong một năm (D), từ một nửa đến gần gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, nhưng trục ngang chỉ đổi hệ số quy đổi từ phiên sang năm, nên nó không phải diễn biến thị trường. Đường đi lên và thoải dần: độ biến động một phiên được nhân với căn bậc hai của số phiên trong năm, nên quy ước một năm càng nhiều phiên thì con số năm hoá càng lớn.',
          'The line runs left to right along the Trading sessions per year (D) field, from half to nearly one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded, but the horizontal axis only changes the factor that converts a session into a year, so it is not market history. The line rises ever more gently: one session’s volatility is multiplied by the square root of the sessions in a year, so the more sessions a year is taken to have, the larger the annualized figure.',
        ),
        cot: d(
          'Mỗi cột là độ biến động năm hoá theo một quy ước số phiên trong năm, cột cao dần về bên phải và cột tô đặc là quy ước bạn đang nhập. Rủi ro của mã không đổi từ cột này sang cột khác; chỉ thước đo đổi, nên khi so hai mã phải dùng cùng một quy ước.',
          'Each bar is annualized volatility under one convention for the sessions in a year; bars grow taller to the right and the solid one is the convention you have entered. The ticker’s risk does not change from bar to bar; only the yardstick does, so compare two tickers under the same convention.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là độ biến động quy ra cả năm, tính trên các phiên tới đó. Đây là số đo trên chính chuỗi giá bạn nạp, không phải đường giá. Đường đi lên là cổ phiếu đang dao động mạnh dần nên khoảng lãi lỗ có thể gặp trong một năm rộng ra; đi xuống là dao động đang lắng.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is volatility scaled to a full year, computed on the sessions up to then. It is measured on the very price series you loaded, not the price line. When it rises the share is swinging harder, so the range of gain or loss you might meet in a year widens; when it falls the swings are dying down.',
      ),
      cot: d(
        'Mỗi cột là độ biến động năm hoá tính tới một phiên, cột cuối bên phải là phiên gần nhất. Vì đã quy về một năm nên chiều cao cột so được với độ biến động của mã khác hay của chỉ số, dù hai bên có số phiên khác nhau.',
        'Each bar is the annualized volatility up to one session, the last one on the right being the latest. Because it is scaled to a year, bar height compares with the volatility of another ticker or of an index even when the two cover different numbers of sessions.',
      ),
    },
  },

  'do-lech-chuan-ban-phan': {
    truc: {
      sessions: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên lấy để tính, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, lấy nhiều hay ít phiên hơn thì độ lệch chuẩn bán phần ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: đi lên là những phiên cũ vừa thêm vào có nhiều cú giảm mạnh hơn, đi xuống là chúng ít giảm hoặc giảm nhẹ hơn giai đoạn gần đây.',
          'The line runs left to right along the Number of sessions used field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the downside deviation comes out at when more or fewer sessions are used, not market history. The line has no fixed direction: where it rises, the older sessions just added held harder drops; where it falls, they dropped less often or less far than the recent stretch.',
        ),
        cot: d(
          'Mỗi cột là độ lệch chuẩn bán phần khi lấy một số phiên, cột tô đặc là số phiên bạn đang nhập. Chỉ các phiên dưới ngưỡng mới góp vào chiều cao cột, nên thêm vào một giai đoạn toàn phiên tăng sẽ làm cột thấp đi.',
          'Each bar is the downside deviation using a given number of sessions, and the solid one is the number you have entered. Only sessions below the threshold add to a bar’s height, so taking in a stretch of rising sessions makes the bar shorter.',
        ),
      },
      threshold: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Ngưỡng lợi suất mỗi phiên (B). Con số mặc định của ô là 0 nên trục không chạy quanh nó mà chạy hết dải cho phép của ô, từ ngưỡng âm sâu nhất đến ngưỡng dương cao nhất; chấm tròn nằm ở giữa. Hình tính trên chuỗi giá bạn đã nạp và không phải diễn biến thị trường. Đường đi lên: ngưỡng càng cao thì càng nhiều phiên bị tính là hụt, và mỗi phiên hụt một khoảng càng lớn. Ở đầu bên trái đường nằm sát đáy vì gần như không phiên nào rơi sâu tới ngưỡng ấy.',
          'The line runs left to right along the Per-session return threshold (B) field. The field’s default is 0, so the axis does not surround it but spans the whole range the field allows, from the deepest negative threshold to the highest positive one; the dot sits in the middle. It is calculated on the price series you loaded and is not market history. The line rises: the higher the threshold, the more sessions come in under it and the wider the margin each one misses by. At the far left the line hugs the bottom because hardly any session drops as deep as that threshold.',
        ),
        cot: d(
          'Mỗi cột là độ lệch chuẩn bán phần ứng với một ngưỡng, cột cao dần về bên phải và cột tô đặc là ngưỡng bạn đang nhập. Đặt ngưỡng bằng 0 là chỉ đếm các phiên lỗ; đặt ngưỡng dương là coi cả những phiên lãi ít hơn mức mong muốn cũng là rủi ro.',
          'Each bar is the downside deviation for one threshold; bars grow taller to the right and the solid one is the threshold you have entered. A threshold of 0 counts losing sessions only; a positive threshold also treats sessions that earned less than you wanted as risk.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là mức dao động của riêng những phiên nằm dưới ngưỡng lợi suất, tính trên các phiên tới đó. Đây là số đo trên chính chuỗi giá bạn nạp, và một phiên nằm trên ngưỡng không góp gì vào nó: ở phiên như thế đường chỉ đi ngang, hoặc nhích xuống khi một phiên hụt cũ rời khỏi cửa sổ. Đường đi lên là các phiên giảm đang giảm sâu hơn; đi xuống là phần rủi ro phía dưới đang nhẹ đi.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the swing of only those sessions below the return threshold, computed on the sessions up to then. It is measured on the very price series you loaded, and a session above the threshold adds nothing to it: on such a session the line can only run level, or step down when an old shortfall session leaves the window. When it rises the down days are cutting deeper; when it falls the downside risk is easing.',
      ),
      cot: d(
        'Mỗi cột là độ lệch chuẩn bán phần tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột cao là quãng mà cổ phiếu hay có phiên giảm mạnh; nếu cột thấp trong khi độ lệch chuẩn thường vẫn cao thì dao động chủ yếu đến từ các phiên tăng.',
        'Each bar is the downside deviation up to one session, the last one on the right being the latest. A tall bar is a stretch with frequent hard down days; if it stays short while the ordinary deviation is high, the swings come mostly from up days.',
      ),
    },
  },

  'he-so-bien-thien': {
    truc: {
      sessions: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên lấy để tính, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: lấy nhiều hay ít phiên hơn thì hệ số biến thiên ra bao nhiêu, không phải diễn biến thị trường. Đường không có chiều cố định: đi lên là thêm phiên vào làm rủi ro tăng nhanh hơn lợi suất bình quân, đi xuống là ngược lại. Vùng gạch chéo là những cửa sổ có lợi suất bình quân bằng 0 hoặc âm, ở đó hệ số không tính; điểm cao vọt sát vùng ấy là cửa sổ có lợi suất bình quân dương nhưng rất nhỏ.',
          'The line runs left to right along the Number of sessions used field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded, for more or fewer sessions, and is not market history. No fixed direction: it rises where the added sessions raised risk faster than the average return, and falls where the reverse held. A hatched area marks windows with an average return of 0 or below, where nothing is calculated; a towering point beside it is a window with a tiny positive average return.',
        ),
        cot: d(
          'Mỗi cột là hệ số biến thiên khi lấy một số phiên, cột tô đặc là số phiên bạn đang nhập. Cột thấp là mỗi phần lợi suất phải trả bằng ít rủi ro hơn; cột cao vọt cạnh một vùng gạch chéo là cửa sổ có lợi suất bình quân dương nhưng sắp chạm 0.',
          'Each bar is the coefficient of variation using a given number of sessions, and the solid one is the number you have entered. A short bar means each unit of return costs less risk; a towering bar next to a hatched area is a window whose average return is positive but about to touch 0.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là độ lệch chuẩn lợi suất chia cho lợi suất bình quân, tính trên các phiên tới đó. Đây là số đo trên chính chuỗi giá bạn nạp, không phải đường giá. Đường đi lên là phải chịu nhiều dao động hơn cho mỗi phần lợi suất kiếm được; đi xuống là dao động đang rẻ đi so với lợi suất. Chỗ đường vọt lên rồi đứt thành một vùng gạch chéo là lúc lợi suất bình quân tụt về 0 rồi xuống âm; suốt quãng ấy hệ số không được tính, và đường chỉ nối lại khi lợi suất bình quân dương trở lại.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the return deviation divided by the average return, computed on the sessions up to then. It is measured on the very price series you loaded, not the price line. When it rises you are bearing more swing for each unit of return earned; when it falls swing is getting cheaper against return. Where the line spikes and breaks into a hatched area the average return has slipped to 0 or below; nothing is calculated there, and the line resumes once the average return is positive again.',
      ),
      cot: d(
        'Mỗi cột là hệ số biến thiên tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột thấp là tốt: ít rủi ro cho mỗi phần lợi suất. Không cột nào quay xuống dưới vạch 0: quãng lợi suất bình quân âm thì công thức không tính, trên hình là một vùng gạch chéo không có cột, và đừng đọc chỗ ấy là rủi ro thấp.',
        'Each bar is the coefficient of variation up to one session, the last one on the right being the latest. A short bar is good: little risk per unit of return. No bar ever hangs below the zero line: over a stretch with a negative average return the formula is not calculated, the chart shows a hatched area with no bars, and that stretch must not be read as low risk.',
      ),
    },
  },

  'bien-do-dao-dong-lon-nhat': {
    truc: {
      sessions: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên trong kỳ, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, kỳ quan sát dài hay ngắn hơn thì biên độ dao động ra bao nhiêu, không phải diễn biến thị trường. Đường chỉ có thể đi lên hoặc giữ nguyên: kỳ dài hơn chỉ có thể gặp một đỉnh cao hơn hoặc một đáy thấp hơn, nên khoảng cách giữa hai mức ấy không bao giờ hẹp lại.',
          'The line runs left to right along the Number of sessions in the period field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, how wide the price range is over a longer or shorter period, not market history. The line only ever rises or stays level: a longer period can only meet a higher high or a lower low, so the distance between the two never narrows.',
        ),
        cot: d(
          'Mỗi cột là biên độ dao động của một độ dài kỳ, cột tô đặc là số phiên bạn đang nhập. Nhiều cột liền nhau bằng nhau rồi nhảy một bậc: bậc nhảy là lúc kỳ quan sát vừa lùi tới một đỉnh hoặc đáy mới.',
          'Each bar is the price range for one period length, and the solid one is the number you have entered. Several equal bars and then a jump: the jump is where the period has just reached back to a new high or low.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là giá đóng cửa cao nhất trong kỳ tính tới phiên ấy cao hơn giá đóng cửa thấp nhất bao nhiêu phần trăm. Đây là số đo trên chính chuỗi giá bạn nạp, không phải đường giá. Đường đi lên là kỳ vừa có thêm một đỉnh cao hơn hoặc một đáy thấp hơn, tức biên độ nới ra; đi xuống là đỉnh hoặc đáy cũ đã trôi ra khỏi kỳ.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is how far, in percent, the highest close in the period up to that session stood above the lowest close. It is measured on the very price series you loaded, not the price line. When it rises the period has gained a higher high or a lower low, so the range has widened; when it falls an old high or low has slid out of the period.',
      ),
      cot: d(
        'Mỗi cột là biên độ dao động của kỳ kết thúc ở một phiên, cột cuối bên phải là phiên gần nhất. Cột cao là kỳ giá đi một quãng dài giữa đáy và đỉnh; nó không nói quãng ấy đi lên hay đi xuống, chỉ nói rộng bao nhiêu.',
        'Each bar is the range of the period ending at one session, the last one on the right being the latest. A tall bar is a period in which the price traveled a long way between low and high; it does not say whether that travel was up or down, only how wide.',
      ),
    },
  },

  'chuoi-phien-giam-dai-nhat': {
    truc: {
      sessions: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên trong kỳ, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, kỳ quan sát dài hay ngắn hơn thì chuỗi giảm dài nhất là bao nhiêu phiên, không phải diễn biến thị trường. Đường chỉ có thể đi lên hoặc giữ nguyên, và đi theo bậc thang vì kết quả là số phiên nguyên: kỳ dài hơn chỉ có thể gặp thêm một chuỗi giảm dài hơn, không thể làm chuỗi dài nhất ngắn lại.',
          'The line runs left to right along the Number of sessions in the period field, from half to one and a half times the number you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, how long the longest losing streak is over a longer or shorter period, not market history. The line only ever rises or stays level, and it moves in steps because the result is a whole number of sessions: a longer period can only meet a longer streak, it cannot shorten the longest one.',
        ),
        cot: d(
          'Mỗi cột là chuỗi phiên giảm dài nhất của một độ dài kỳ, cột tô đặc là số phiên bạn đang nhập. Dãy cột bằng nhau suốt một quãng nghĩa là chuỗi giảm dài nhất nằm gọn trong những phiên gần đây.',
          'Each bar is the longest losing streak for one period length, and the solid one is the number you have entered. A row of equal bars across a stretch means the longest streak lies entirely within the recent sessions.',
        ),
        diem: d(
          'Mỗi chấm là chuỗi phiên giảm dài nhất khi kỳ quan sát dài bằng một mức của ô Số phiên trong kỳ, từ một nửa đến gấp rưỡi số phiên bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp và không phải diễn biến thị trường. Kết quả là số phiên đếm được nên các chấm đứng thành từng tầng ở những mức nguyên, và dãy chấm chỉ đi lên hoặc đứng yên: kỳ dài hơn chỉ thêm phiên cũ, không làm chuỗi dài nhất ngắn lại. Mức nào dài hơn chuỗi đã nạp thì không có chấm, chỉ có vùng gạch chéo.',
          'Each dot is the longest losing streak when the period spans one level of the Number of sessions in the period field, from half to one and a half times the number you have entered; the dot on the dashed vertical line is your own figure. It is calculated on the price series you loaded and is not market history. The result is a count of sessions, so the dots sit in tiers at whole numbers, and the row only ever rises or holds level: a longer period only adds older sessions and cannot shorten the longest streak. Levels longer than the loaded series get no dot, only a hatched area.',
        ),
        bac: d(
          'Mỗi bậc là chuỗi phiên giảm dài nhất ứng với một mức của ô Số phiên trong kỳ, từ một nửa đến gấp rưỡi số phiên bạn đang nhập. Hình tính trên chuỗi giá bạn đã nạp và không phải diễn biến thị trường. Kết quả là số phiên đếm được, luôn là số nguyên, nên bậc giữ nguyên qua nhiều mức liền nhau rồi mới nhảy lên khi kỳ lùi vào một chuỗi giảm cũ dài hơn mọi chuỗi đã gặp. Bậc chỉ đi lên hoặc đứng yên, không bao giờ hạ thấp. Mức nào dài hơn chuỗi đã nạp thì phủ gạch chéo.',
          'Each step is the longest losing streak at one level of the Number of sessions in the period field, from half to one and a half times the number you have entered. It is calculated on the price series you loaded and is not market history. The result is a count of sessions, always a whole number, so a step holds level across several neighboring levels and only jumps when the period reaches back into an older losing streak longer than any met so far. The staircase only ever rises or stays put and never steps down. Levels longer than the loaded series are hatched.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là số phiên giảm liên tiếp nhiều nhất trong kỳ tính tới phiên ấy. Đây là số đếm trên chính chuỗi giá bạn nạp, nên đường đi thành từng bậc nguyên chứ không trơn. Đường đi lên một bậc là cổ phiếu vừa nối dài chuỗi giảm thành chuỗi dài nhất của kỳ; đi ngang là chưa chuỗi nào dài hơn; đi xuống là chuỗi giảm dài cũ đã trôi ra khỏi kỳ.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the largest number of consecutive down sessions in the period up to that session. It is a count on the very price series you loaded, so the line moves in whole steps instead of a smooth curve. When it rises a step the share has just stretched a losing run into the longest of the period; when it runs flat no longer run has come; when it falls the old long run has slid out of the period.',
      ),
      cot: d(
        'Mỗi cột là chuỗi giảm dài nhất tính tới một phiên, cột cuối bên phải là phiên gần nhất. Dạng này hợp với công thức hơn dạng Đường vì kết quả là số nguyên: đếm được chiều cao cột thành số phiên.',
        'Each bar is the longest losing run up to one session, the last one on the right being the latest. This form suits the formula better than the line because the result is a whole number: you can count a bar’s height in sessions.',
      ),
      diem: d(
        'Mỗi chấm là số phiên giảm liên tiếp nhiều nhất trong kỳ kết thúc ở một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; những phiên đầu chưa đủ một kỳ thì để trống, phủ gạch chéo. Kết quả là số nguyên nên các chấm đứng thành từng tầng, và từ phiên này sang phiên sau chấm đứng yên hoặc chỉ lên, xuống đúng một tầng. Dãy chấm đi lên là cổ phiếu vừa nối dài chuỗi giảm thành chuỗi dài nhất của kỳ; đi xuống là chuỗi giảm dài cũ đang trôi dần ra khỏi kỳ.',
        'Each dot is the largest number of consecutive down sessions in the period ending at one session, running from the oldest session on the left to the most recent session on the right; the first sessions, before a full period exists, are left empty and hatched. The result is a whole number, so the dots sit in tiers, and from one session to the next a dot moves up or down one tier at most. When the row rises the share has just stretched a losing run into the longest of the period; when it falls the old long run is sliding out of the period.',
      ),
      bac: d(
        'Mỗi bậc là số phiên giảm liên tiếp nhiều nhất trong kỳ tính tới một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào. Mỗi phiên mới thêm một phiên vào cuối kỳ và bỏ một phiên ở đầu kỳ, nên mỗi lần nhảy bậc chỉ cao đúng một phiên: đi lên một nấc là chuỗi giảm mới vừa dài thêm, đi xuống một nấc là chuỗi giảm cũ vừa mất một phiên ra khỏi kỳ.',
        'Each step is the largest number of consecutive down sessions in the period up to one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and then jumps to the next, because there is no closing price between two sessions. Each new session adds one session to the end of the period and drops one from the start, so every jump is exactly one session high: when the staircase rises a notch a new losing run has just grown, and when it falls a notch the old run has just lost a session.',
      ),
    },
  },

  beta: {
    truc: {
      sessions: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên lấy để hồi quy. Con số mặc định của ô cũng là mức thấp nhất ô cho phép, nên trục chỉ chạy về một phía, từ con số bạn đang nhập đến gấp rưỡi nó; chấm tròn nằm ở mép trái. Hình tính trên chuỗi giá bạn đã nạp và không phải diễn biến thị trường. Đường không có chiều cố định: đi lên là thêm các phiên cũ vào thì cổ phiếu tỏ ra bám thị trường mạnh hơn, đi xuống là ở giai đoạn cũ hơn ấy cổ phiếu ít chạy theo thị trường hơn.',
          'The line runs left to right along the Sessions used for the regression field. The field’s default is also the lowest value it allows, so the axis runs one way only, from the number you have entered up to fifty percent more; the dot sits at the left edge. It is calculated on the price series you loaded and is not market history. The line has no fixed direction: where it rises, adding older sessions shows the share tracking the market more strongly; where it falls, the share followed the market less in that older stretch.',
        ),
        cot: d(
          'Mỗi cột là beta khi hồi quy trên một số phiên, cột tô đặc là số phiên bạn đang nhập. Các cột chênh nhau nhiều là dấu hiệu beta của mã này không ổn định, nên đừng dựa vào một con số duy nhất.',
          'Each bar is beta from a regression over a given number of sessions, and the solid one is the number you have entered. Bars that differ a lot signal that this ticker’s beta is not stable, so do not lean on a single figure.',
        ),
        diem: d(
          'Mỗi chấm là beta hồi quy trên một số phiên gần nhất, theo từng mức của ô Số phiên lấy để hồi quy. Ô mặc định đứng đúng mức thấp nhất được phép, nên các chấm chạy từ con số bạn đang nhập tới gấp rưỡi nó và chấm đầu bên trái là số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp cùng chuỗi VN-Index, không phải diễn biến thị trường. Dãy chấm không có chiều cố định: đi lên là các phiên cũ thêm vào cho thấy cổ phiếu bám thị trường mạnh hơn, đi xuống là yếu hơn. Một chấm tách hẳn khỏi các chấm kế bên thường là phiên vừa thêm vào có VN-Index biến động mạnh mà cổ phiếu đi lệch nhịp.',
          'Each dot is beta regressed over one level of the Sessions used for the regression field. At the default, which is also the field’s lowest allowed value, the dots run from your figure, the leftmost dot, up to fifty percent more. It is calculated on the price series you loaded and the VN-Index, not market history. The row has no fixed direction: it rises where the older sessions added show the share tracking the market more closely, and falls where less. A dot standing apart from its neighbors usually marks an added session in which the VN-Index moved sharply and the share moved out of step.',
        ),
        bac: d(
          'Mỗi bậc là beta hồi quy trên một số phiên nguyên của ô Số phiên lấy để hồi quy, từ con số bạn đang nhập tới gấp rưỡi nó: bậc giữ nguyên tới số phiên kế tiếp rồi mới nhảy, vì không có phép hồi quy nào trên nửa phiên. Hình tính trên chuỗi giá bạn đã nạp cùng chuỗi VN-Index, không phải diễn biến thị trường. Bậc đi lên là thêm phiên cũ làm cổ phiếu tỏ ra bám thị trường mạnh hơn, đi xuống là yếu hơn; bậc nhảy cao thường là một phiên VN-Index biến động mạnh vừa lọt vào phép hồi quy. Số phiên vượt quá chuỗi đã nạp thì không tính được, phủ gạch chéo.',
          'Each step is beta regressed over a whole number of sessions in the Sessions used for the regression field, from your figure up to fifty percent more: a step holds level until the next count and then jumps, since no regression runs on half a session. It is calculated on the price series you loaded and the VN-Index, not market history. The staircase rises where adding older sessions makes the share look more tied to the market and falls where less; a tall jump usually comes from a session of sharp VN-Index movement entering the regression. Counts beyond the loaded series are hatched.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là beta hồi quy trên các phiên tính tới đó, giữa lợi suất cổ phiếu và lợi suất VN-Index. Đây là số đo quan hệ giữa cổ phiếu với thị trường, không phải đường giá của bên nào. Đường đi lên là cổ phiếu đang phản ứng mạnh dần theo nhịp của thị trường; đi xuống là nó đang bớt đi theo thị trường. Mức một lần là dao động ngang với VN-Index.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the beta regressed on the sessions up to then, between the share’s returns and the VN-Index’s. It measures how the share relates to the market, not either one’s price line. When it rises the share is reacting more and more to the market’s moves; when it falls it is following the market less. One time means swinging level with the VN-Index.',
      ),
      cot: d(
        'Mỗi cột là beta tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột cao hơn mức một lần là quãng cổ phiếu dao động mạnh hơn thị trường, thấp hơn là êm hơn; dãy cột bằng nhau cho thấy tính cách ấy ổn định.',
        'Each bar is the beta up to one session, the last one on the right being the latest. A bar above one time is a stretch when the share swung harder than the market, below it gentler; a row of equal bars shows that character is stable.',
      ),
      diem: d(
        'Mỗi chấm là beta của một phiên: lợi suất cổ phiếu hồi quy theo lợi suất VN-Index trên cửa sổ các phiên gần nhất tính tới phiên ấy, cửa sổ dài bằng số ở ô Số phiên lấy để hồi quy. Dãy chấm đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; những phiên đầu chưa đủ một cửa sổ thì để trống, phủ gạch chéo. Dãy chấm đi lên là cổ phiếu đang phản ứng mạnh dần theo nhịp thị trường, đi xuống là đang bớt theo. Chấm nằm trên mức một lần là quãng cổ phiếu khuếch đại mỗi nhịp của VN-Index, dưới mức ấy là làm dịu nhịp ấy.',
        'Each dot is the beta of one session: the share’s returns regressed on the VN-Index’s over the recent sessions ending there, as many as the Sessions used for the regression field says. The dots run from the oldest session on the left to the most recent session on the right; the first sessions, before a full window exists, are left empty and hatched. When the row rises the share is reacting more and more to the market’s moves; when it falls it is following the market less. Dots above a beta of one mark stretches when the share amplified the VN-Index’s moves, below it when it damped them.',
      ),
      bac: d(
        'Mỗi bậc là beta của cửa sổ kết thúc ở một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có cặp lợi suất nào để hồi quy. Mỗi phiên mới vào cửa sổ đẩy một phiên cũ ra, nên bậc nhảy cao thường là lúc một phiên VN-Index biến động mạnh vừa vào hoặc vừa rời cửa sổ. Bậc đi lên là cổ phiếu đang bám nhịp thị trường chặt dần, đi xuống là đang tách khỏi nhịp ấy.',
        'Each step is the beta of the window ending at one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and then jumps to the next, because there is no pair of returns between two sessions to regress. Each new session entering the window pushes an old one out, so a tall jump usually marks a session of sharp VN-Index movement entering or leaving the window. When the staircase rises the share is tracking the market more tightly; when it falls it is drifting away from the market’s rhythm.',
      ),
    },
  },

  'ty-so-sharpe': {
    truc: {
      riskFree: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất phi rủi ro / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, nếu mốc phi rủi ro cao hay thấp hơn thì tỷ số Sharpe ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều với mọi chuỗi giá: mốc phi rủi ro càng cao thì phần lợi suất vượt trên nó càng mỏng, trong khi độ biến động không đổi.',
          'The line runs left to right along the Risk-free rate / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the Sharpe ratio comes out at if the risk-free hurdle is higher or lower, not market history. The line falls steadily on any price series: the higher the risk-free hurdle, the thinner the return above it, while volatility does not change.',
        ),
        cot: d(
          'Mỗi cột là tỷ số Sharpe ở một mức lãi suất phi rủi ro, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột quay xuống dưới vạch 0 là mức lãi suất mà giữ mã này còn thua gửi tiền không rủi ro.',
          'Each bar is the Sharpe ratio at one risk-free rate; bars step lower to the right and the solid one is the rate you have entered. A bar that hangs below the zero line is a rate at which holding this ticker did worse than a risk-free deposit.',
        ),
        diem: d(
          'Mỗi chấm là tỷ số Sharpe tính ở một mức của ô Lãi suất phi rủi ro / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Hình tính trên chuỗi giá bạn đã nạp và không phải diễn biến thị trường. Dãy chấm đi xuống với mọi chuỗi giá, các chấm cách nhau gần như đều: mỗi nấc lãi suất cao hơn trừ đi gần như cùng một phần lợi suất vượt mốc. Chuỗi càng ít dao động thì các chấm càng giãn xa nhau, vì phần bị trừ ấy được chia cho một độ lệch chuẩn nhỏ hơn.',
          'Each dot is the Sharpe ratio at one level of the Risk-free rate / year field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own rate. It is calculated on the price series you loaded and is not market history. The row of dots falls on any price series, almost evenly spaced: each notch of a higher rate takes nearly the same slice off the return above the hurdle. The calmer the series, the further apart the dots, because that slice is divided by a smaller standard deviation.',
        ),
      },
      sessionsPerYear: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên trong một năm (m), từ một nửa đến gần gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, nhưng trục ngang chỉ đổi hệ số quy đổi từ phiên sang năm, nên nó không phải diễn biến thị trường. Đường đi lên khi chuỗi giá bạn nạp có lợi suất bình quân dương, đi xuống khi chuỗi ấy lỗ rõ: phép quy năm nhân kết quả của một phiên với căn bậc hai của số phiên trong năm.',
          'The line runs left to right along the Sessions per year (m) field, from half to nearly one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded, but the horizontal axis only changes the factor that converts a session into a year, so it is not market history. The line rises when the loaded series has a positive average return and falls when the series is clearly losing: annualizing multiplies one session’s result by the square root of the sessions in a year.',
        ),
        cot: d(
          'Mỗi cột là tỷ số Sharpe theo một quy ước số phiên trong năm, cột tô đặc là quy ước bạn đang nhập. Chất lượng của mã không đổi từ cột này sang cột khác; chỉ thước đo đổi, nên khi so hai mã phải dùng cùng một quy ước.',
          'Each bar is the Sharpe ratio under one convention for the sessions in a year, and the solid one is the convention you have entered. The ticker’s quality does not change from bar to bar; only the yardstick does, so compare two tickers under the same convention.',
        ),
        diem: d(
          'Mỗi chấm là tỷ số Sharpe theo một quy ước ở ô Số phiên trong một năm (m), từ một nửa đến gần gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là quy ước bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, nhưng chuỗi ấy giữ nguyên ở mọi chấm, chỉ cách quy ra năm đổi, nên đây không phải diễn biến thị trường. Dãy chấm đi lên khi chuỗi có lợi suất bình quân dương, đi xuống khi chuỗi lỗ rõ. Khoảng cách dọc giữa chấm đầu và chấm cuối là mức mà riêng việc chọn quy ước đã đẩy tỷ số lệch đi.',
          'Each dot is the Sharpe ratio under one convention in the Sessions per year (m) field, from half to nearly one and a half times the figure you have entered; the dot on the dashed vertical line is your own convention. It is calculated on the price series you loaded, but the series stays the same at every dot and only its scaling to a year changes, so this is not market history. The row of dots rises when the series has a positive average return and falls when it is clearly losing. The vertical gap between the first and last dot is how far the choice of convention alone moves the ratio.',
        ),
        bac: d(
          'Mỗi bậc là tỷ số Sharpe theo một quy ước ở ô Số phiên trong một năm (m), từ một nửa đến gấp rưỡi con số bạn đang nhập, đầu trái không xuống dưới mức nhỏ nhất ô cho phép. Bậc thang chỉ hiện khi con số ấy đủ nhỏ để các mức trên trục cách nhau đúng một phiên, như chuỗi theo tháng; số phiên trong năm là số nguyên nên bậc giữ nguyên tới quy ước kế tiếp rồi mới nhảy. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Bậc đi lên, trừ khi chuỗi lỗ bình quân mỗi phiên nhiều hơn phần lãi suất phi rủi ro của một phiên; khi ấy bậc đi xuống.',
          'Each step is the Sharpe ratio under one convention in the Sessions per year (m) field, from half (never below the field’s minimum) to one and a half times your figure. Steps appear only when that figure is small enough for the levels to sit one session apart, as with a monthly series; sessions per year is a whole number, so a step holds level until the next one. It is calculated on the price series you loaded, not market history. The staircase rises unless the series loses more per session, on average, than one session’s share of the risk-free rate; then it falls.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là tỷ số Sharpe tính trên các phiên tới đó. Đây là số đo trên chính chuỗi giá bạn nạp, không phải đường giá. Đường đi lên là mỗi phần dao động phải chịu đang đổi lại được nhiều lợi suất vượt lãi suất phi rủi ro hơn; đi xuống là phần thưởng ấy đang mỏng đi. Nằm dưới mức 0 là quãng cổ phiếu thua cả khoản gửi không rủi ro.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the Sharpe ratio computed on the sessions up to then. It is measured on the very price series you loaded, not the price line. When it rises each unit of swing endured is buying more return above the risk-free rate; when it falls that reward is thinning. Below 0 is a stretch when the share lost even to a riskless deposit.',
      ),
      cot: d(
        'Mỗi cột là tỷ số Sharpe tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột mọc lên trên vạch 0 là quãng rủi ro được đền bù, cột quay xuống dưới vạch 0 là quãng chịu rủi ro mà còn thua lãi suất phi rủi ro.',
        'Each bar is the Sharpe ratio up to one session, the last one on the right being the latest. A bar standing above the zero line is a stretch in which risk was rewarded; one hanging below the zero line is a stretch of taking risk and still trailing the risk-free rate.',
      ),
      diem: d(
        'Mỗi chấm là tỷ số Sharpe của cả đoạn chuỗi từ đầu tới một phiên; dãy chấm đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải, những phiên đầu chưa đủ số phiên tối thiểu thì để trống, phủ gạch chéo. Các chấm đầu nhảy mạnh vì mới có ít phiên, càng về phải mỗi phiên mới càng ít làm chấm xê dịch. Dãy chấm đi lên là mỗi phần dao động đang đổi được nhiều lợi suất vượt lãi suất phi rủi ro hơn, đi xuống là phần thưởng ấy mỏng đi; chấm nằm dưới mức 0 là quãng thua cả khoản gửi không rủi ro.',
        'Each dot is the Sharpe ratio of the whole stretch from the start of the series to one session; the dots run from the oldest session on the left to the most recent session on the right, and the first sessions, short of the minimum, are left empty and hatched. Early dots jump around because few sessions are in yet; further right, each new session moves the dot less. When the row rises each unit of swing is buying more return above the risk-free rate; when it falls that reward is thinning. Dots below 0 mark a stretch that lost even to a riskless deposit.',
      ),
      bac: d(
        'Mỗi bậc là tỷ số Sharpe của đoạn chuỗi từ đầu tới một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có lợi suất mới nào. Bậc nhìn chung nhảy cao ở những phiên đầu rồi thấp dần, vì mỗi phiên mới chỉ là một phần ngày càng nhỏ của cả đoạn. Bậc đi lên là phần lợi suất vượt lãi suất phi rủi ro đang dày lên so với dao động; đi xuống là đang mỏng đi.',
        'Each step is the Sharpe ratio of the stretch from the start of the series to one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and then jumps to the next, because no new return arrives between two sessions. Jumps are generally tall in the early sessions and shrink later, since each new session is an ever smaller part of the stretch. When the staircase rises the return above the risk-free rate is thickening against the swings; when it falls it is thinning.',
      ),
      laiLo: d(
        'Dạng này chỉ hiện khi đường tỷ số Sharpe có cả đoạn trên lẫn đoạn dưới vạch 0, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải. Phần trên vạch 0 tô xanh là những phiên mà lợi suất bình quân tính từ đầu chuỗi đang vượt lãi suất phi rủi ro; phần dưới tô đỏ là lúc cổ phiếu còn thua khoản gửi không rủi ro. Đường đi lên qua vạch 0 là phiên cổ phiếu vừa bắt kịp lãi suất ấy, đi xuống qua vạch 0 là phiên vừa tụt lại sau nó.',
        'This form appears only when the Sharpe ratio line has stretches both above and below the zero line, running from the oldest session on the left to the most recent session on the right. The part above the zero line is shaded green: sessions where the average return since the start of the series beats the risk-free rate. The part below is shaded red: the share is still trailing a riskless deposit. Where the line rises through the zero line the share has just caught up with that rate; where it falls through it, the share has just slipped behind.',
      ),
    },
  },

  'ty-so-sortino': {
    truc: {
      riskFree: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất phi rủi ro / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, nếu mốc phi rủi ro cao hay thấp hơn thì tỷ số Sortino ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống với mọi chuỗi giá: nâng mốc lên vừa làm phần lợi suất vượt mốc mỏng đi, vừa khiến nhiều phiên hơn bị tính là hụt dưới mốc.',
          'The line runs left to right along the Risk-free rate / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the Sortino ratio comes out at if the risk-free hurdle is higher or lower, not market history. The line falls on any price series: raising the hurdle both thins the return above it and makes more sessions count as coming in under it.',
        ),
        cot: d(
          'Mỗi cột là tỷ số Sortino ở một mức lãi suất phi rủi ro, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Mốc này vừa là thứ phải vượt qua vừa là ranh giới định nghĩa phiên xấu, nên đổi nó là đổi cả hai vế của tỷ số.',
          'Each bar is the Sortino ratio at one risk-free rate; bars step lower to the right and the solid one is the rate you have entered. This rate is both the hurdle to beat and the line that defines a bad session, so changing it changes both halves of the ratio.',
        ),
        diem: d(
          'Mỗi chấm là tỷ số Sortino tính ở một mức của ô Lãi suất phi rủi ro / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Hình tính trên chuỗi giá bạn đã nạp và không phải diễn biến thị trường. Dãy chấm đi xuống với mọi chuỗi giá, chấm nào cũng thấp hơn chấm bên trái nó: mốc cao hơn vừa trừ bớt phần lợi suất vượt mốc, vừa làm phần hụt của các phiên dưới mốc sâu thêm, vì ở Sortino lãi suất này còn là ranh giới phân định phiên xấu.',
          'Each dot is the Sortino ratio at one level of the Risk-free rate / year field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own rate. It is calculated on the price series you loaded and is not market history. The row of dots falls on any price series, every dot below the one to its left: a higher hurdle both trims the return above it and deepens the shortfall of the sessions under it, because in Sortino this rate also draws the line between good and bad sessions.',
        ),
      },
      sessionsPerYear: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên trong một năm (m), từ một nửa đến gần gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, nhưng trục ngang chỉ đổi hệ số quy đổi từ phiên sang năm, nên nó không phải diễn biến thị trường. Đường đi lên khi chuỗi giá bạn nạp sinh lời trên mốc phi rủi ro, đi xuống khi chuỗi ấy lỗ rõ: phép quy năm phóng to phần hơn hay kém ấy theo căn bậc hai của số phiên trong năm.',
          'The line runs left to right along the Sessions per year (m) field, from half to nearly one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded, but the horizontal axis only changes the factor that converts a session into a year, so it is not market history. The line rises when the loaded series earns more than the risk-free hurdle and falls when the series is clearly losing: annualizing magnifies that excess or deficit by the square root of the sessions in a year.',
        ),
        cot: d(
          'Mỗi cột là tỷ số Sortino theo một quy ước số phiên trong năm, cột tô đặc là quy ước bạn đang nhập. Dùng quy ước nào cũng được miễn là giữ nguyên khi so sánh: Sortino của hai mã tính theo hai quy ước khác nhau thì không đặt cạnh nhau được.',
          'Each bar is the Sortino ratio under one convention for the sessions in a year, and the solid one is the convention you have entered. Any convention will do as long as it is kept the same when comparing: Sortino ratios of two tickers worked out under different conventions cannot be set side by side.',
        ),
        diem: d(
          'Mỗi chấm là tỷ số Sortino theo một quy ước ở ô Số phiên trong một năm (m), từ một nửa đến gần gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là quy ước bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường: chuỗi giữ nguyên ở mọi chấm, chỉ cách quy ra năm đổi. Dãy chấm đi lên khi chuỗi sinh lời trên mốc phi rủi ro, đi xuống khi chuỗi lỗ rõ. Quy ước còn dời cả ranh giới phiên xấu: một năm nhiều phiên hơn thì lãi suất chia cho mỗi phiên nhỏ đi, nên ít phiên bị tính là hụt hơn.',
          'Each dot is the Sortino ratio under one convention in the Sessions per year (m) field, from half to nearly one and a half times the figure you have entered; the dot on the dashed vertical line is your own convention. It is calculated on the price series you loaded, not market history: the series is the same at every dot, only its scaling to a year changes. The row rises when the series earns more than the risk-free hurdle and falls when it is clearly losing. The convention also moves the bad-session line: more sessions in a year leave a smaller hurdle for each, so fewer sessions fall short.',
        ),
        bac: d(
          'Mỗi bậc là tỷ số Sortino của chuỗi giá bạn đã nạp theo một quy ước ở ô Số phiên trong một năm (m), từ một nửa đến gấp rưỡi con số bạn đang nhập (đầu trái không dưới mức nhỏ nhất của ô); đây không phải diễn biến thị trường. Ô Loại biểu đồ chỉ mời dạng này với con số nhỏ, chẳng hạn chuỗi theo tháng, khi các mức là những số phiên nguyên liền nhau; một năm không có nửa phiên, nên bậc đứng yên cho tới số phiên kế tiếp. Mỗi bậc sang phải hạ ranh giới phiên xấu: bậc đi lên khi chuỗi sinh lời trên mốc, thường cả khi chỉ lỗ nhẹ, và đi xuống khi chuỗi lỗ rõ.',
          'Each step is the Sortino ratio under one convention in the Sessions per year (m) field, from half (never below the field’s minimum) to one and a half times your figure. This form shows up only for a small figure, such as a monthly series, where levels are consecutive whole sessions; a year has no half session, so a step stays put until the next. It is calculated on the price series you loaded, not market history. Each step right lowers the bad-session line: the staircase rises when the series beats the hurdle, usually even on a slight loss, and falls when it is clearly losing.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là tỷ số Sortino tính trên các phiên tới đó. Đây là số đo trên chính chuỗi giá bạn nạp, không phải đường giá. Đường đi lên là lợi suất vượt ngưỡng đang lớn dần so với phần dao động đi xuống; đi xuống là các phiên giảm đang nặng lên so với phần lãi. Các phiên tăng mạnh không bị tính là rủi ro, đó là chỗ nó khác Sharpe.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the Sortino ratio computed on the sessions up to then. It is measured on the very price series you loaded, not the price line. When it rises the return above the threshold is growing against the downward swings; when it falls the down days are weighing more against the gains. Strong up days are not counted as risk, which is where it differs from Sharpe.',
      ),
      cot: d(
        'Mỗi cột là tỷ số Sortino tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột trên vạch 0 là quãng lợi suất bình quân vượt ngưỡng, và càng cao thì phần vượt ấy càng lớn so với rủi ro phía dưới; cột dưới vạch 0 là quãng lợi suất bình quân còn thấp hơn ngưỡng.',
        'Each bar is the Sortino ratio up to one session, the last one on the right being the latest. A bar above the zero line is a stretch with the average return over the threshold, and the taller it is the larger that excess against the downside risk; one below the zero line is a stretch with the average return still under the threshold.',
      ),
      diem: d(
        'Mỗi chấm là tỷ số Sortino của đoạn chuỗi từ đầu tới một phiên; dãy chấm đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải, những phiên đầu chưa đủ số phiên tối thiểu thì phủ gạch chéo. Chỉ phiên có lợi suất dưới mốc mới bị tính là rủi ro, nên một phiên tăng mạnh không bao giờ làm phần rủi ro lớn thêm. Dãy chấm đi lên là lợi suất vượt mốc đang lớn dần so với phần giảm, đi xuống là các phiên giảm đang nặng lên; các chấm đầu nhảy mạnh vì mới có ít phiên.',
        'Each dot is the Sortino ratio of the stretch from the start of the series to one session; the dots run from the oldest session on the left to the most recent session on the right, and the first sessions, short of the minimum, are hatched. Only sessions below the hurdle count as risk, so a strong up session never adds to the risk side. When the row rises the return above the hurdle is growing against the downside; when it falls the down sessions are weighing more. Early dots jump around because few sessions are in yet.',
      ),
      bac: d(
        'Mỗi bậc là tỷ số Sortino của đoạn chuỗi từ đầu tới một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có lợi suất mới nào. Một phiên giảm sâu dưới mốc thường làm bậc tụt mạnh, vì nó vừa kéo lợi suất bình quân xuống vừa làm phần rủi ro phía dưới lớn thêm. Bậc đi lên là lợi suất vượt mốc đang dày lên so với phần giảm, đi xuống là phần giảm đang lấn.',
        'Each step is the Sortino ratio of the stretch from the start of the series to one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and then jumps to the next, because no new return arrives between two sessions. A session that drops far below the hurdle usually makes a big step down, since it both pulls the average return lower and enlarges the downside risk. When the staircase rises the return above the hurdle is thickening against the downside; when it falls the downside is gaining ground.',
      ),
      laiLo: d(
        'Dạng này chỉ hiện khi đường tỷ số Sortino có cả đoạn trên lẫn đoạn dưới vạch 0, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải. Phần rủi ro phía dưới luôn là số dương, nên dấu của đường do phần lợi suất vượt mốc quyết định: phần trên vạch 0 tô xanh là quãng lợi suất bình quân từ đầu chuỗi đang vượt lãi suất phi rủi ro, phần dưới tô đỏ là quãng còn thua mốc ấy. Đường đi lên qua vạch 0 là cổ phiếu vừa vượt mốc, đi xuống qua vạch 0 là vừa tụt xuống dưới mốc.',
        'This form appears only when the Sortino ratio line sits both above and below the zero line, running from the oldest session on the left to the most recent session on the right. Its downside risk is always positive, so the sign comes from the return above the hurdle: the part above the zero line is shaded green, stretches where the average return since the start beats the risk-free rate, and the part below is shaded red, stretches still short of it. Where the line rises through the zero line the share has just cleared the hurdle; where it falls through, it has just dropped below.',
      ),
    },
  },

  'ty-so-treynor': {
    truc: {
      riskFree: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất phi rủi ro / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, nếu mốc phi rủi ro cao hay thấp hơn thì tỷ số Treynor ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều khi beta dương: mốc phi rủi ro càng cao thì phần lợi suất vượt trên nó càng mỏng, còn hệ số beta mà phần ấy đem chia cho thì không đổi.',
          'The line runs left to right along the Risk-free rate / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the Treynor ratio comes out at if the risk-free hurdle is higher or lower, not market history. With a positive beta the line falls steadily: the higher the risk-free hurdle, the thinner the return above it, while the beta it is divided by does not change.',
        ),
        cot: d(
          'Mỗi cột là tỷ số Treynor ở một mức lãi suất phi rủi ro, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột quay xuống dưới vạch 0 là mức lãi suất mà danh mục không còn bù nổi rủi ro thị trường nó đang gánh.',
          'Each bar is the Treynor ratio at one risk-free rate; bars step lower to the right and the solid one is the rate you have entered. A bar that hangs below the zero line is a rate at which the portfolio no longer pays for the market risk it carries.',
        ),
        diem: d(
          'Mỗi chấm là tỷ số Treynor tính ở một mức của ô Lãi suất phi rủi ro / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Hình tính trên chuỗi giá bạn đã nạp và không phải diễn biến thị trường. Dãy chấm đi xuống, các chấm cách nhau gần như đều, và khoảng cách ấy không tùy chuỗi giá: phần lãi suất bị trừ thêm chỉ đem chia cho beta bạn nhập. Beta càng nhỏ thì các chấm càng giãn xa nhau.',
          'Each dot is the Treynor ratio at one level of the Risk-free rate / year field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own rate. It is calculated on the price series you loaded and is not market history. The row of dots falls, almost evenly spaced, and the spacing does not depend on the price series: the extra rate taken off is simply divided by the beta you entered. The smaller that beta, the further apart the dots.',
        ),
      },
      sessionsPerYear: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên trong một năm (m), từ một nửa đến gần gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, nhưng trục ngang chỉ đổi hệ số quy đổi từ phiên sang năm, nên nó không phải diễn biến thị trường. Đường đi lên khi chuỗi giá bạn nạp có lợi suất bình quân dương, đi xuống khi chuỗi ấy lỗ rõ: lợi suất một phiên được nhân thẳng với số phiên trong năm, nên ở đây đường gần như thẳng.',
          'The line runs left to right along the Sessions per year (m) field, from half to nearly one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded, but the horizontal axis only changes the factor that converts a session into a year, so it is not market history. The line rises when the loaded series has a positive average return and falls when the series is clearly losing: one session’s return is multiplied directly by the sessions in a year, so here the line is nearly straight.',
        ),
        cot: d(
          'Mỗi cột là tỷ số Treynor theo một quy ước số phiên trong năm, cột tô đặc là quy ước bạn đang nhập. Kết quả tính bằng phần trăm một năm: phần lợi suất của chuỗi lớn lên theo đúng số phiên quy ước, còn lãi suất phi rủi ro bị trừ đi thì giữ nguyên, nên chiều cao cột không đổi theo cùng tỷ lệ với số phiên và có thể đổi cả dấu.',
          'Each bar is the Treynor ratio under one convention for the sessions in a year, and the solid one is the convention you have entered. The result is in percent per year: the series’ own return grows in step with the sessions in a year while the risk-free rate taken off stays the same, so bar height does not move in the same proportion as the convention and can even change sign.',
        ),
        diem: d(
          'Mỗi chấm là tỷ số Treynor theo một quy ước ở ô Số phiên trong một năm (m), từ một nửa đến gần gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là quy ước bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, nhưng chuỗi giữ nguyên ở mọi chấm nên đây không phải diễn biến thị trường. Lợi suất một phiên được nhân thẳng với số phiên chứ không qua căn bậc hai, nên các chấm gần như thẳng hàng: dãy chấm đi lên khi chuỗi có lợi suất bình quân dương, đi xuống khi chuỗi lỗ rõ.',
          'Each dot is the Treynor ratio under one convention in the Sessions per year (m) field, from half to nearly one and a half times the figure you have entered; the dot on the dashed vertical line is your own convention. It is calculated on the price series you loaded, but the series stays the same at every dot, so this is not market history. One session’s return is multiplied directly by the sessions in a year, with no square root, so the dots sit almost on a straight line: the row rises when the series has a positive average return and falls when it is clearly losing.',
        ),
        bac: d(
          'Mỗi bậc là tỷ số Treynor theo một quy ước ở ô Số phiên trong một năm (m), từ một nửa đến gấp rưỡi con số bạn đang nhập, đầu trái không xuống dưới mức nhỏ nhất ô cho phép. Bạn chỉ thấy bậc thang khi con số nhập nhỏ, như với dữ liệu theo tháng, để hai mức kề nhau hơn kém đúng một phiên; giữa hai số phiên nguyên không có quy ước nào khác, nên bậc nằm yên chờ mức sau. Hình tính trên chuỗi giá bạn đã nạp, không phải diễn biến thị trường. Mỗi phiên thêm vào năm cộng gần như cùng một phần lợi suất bình quân, nên các bậc cao gần bằng nhau: bậc đi lên khi lợi suất ấy dương, đi xuống khi nó âm.',
          'Each step is the Treynor ratio under one convention in the Sessions per year (m) field, from half (never below the field’s minimum) to one and a half times your figure. You see steps only for a small figure, as with monthly data, where neighboring levels differ by one session; a year holds no part of a session, so the step waits for the next whole one. It is calculated on the price series you loaded, not market history. Each extra session adds nearly the same slice of average return, so the steps are almost equal: the staircase rises when that return is positive and falls when it is negative.',
        ),
      },
      beta: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Hệ số beta của danh mục (βp), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng phần lợi suất vượt mốc ấy, nếu beta lớn hay nhỏ hơn thì tỷ số Treynor ra bao nhiêu, không phải diễn biến thị trường. Chiều của đường do phần lợi suất vượt mốc quyết định: phần ấy dương thì đường đi xuống và thoải dần, vì cùng một phần thưởng chia cho càng nhiều rủi ro thị trường thì càng mỏng; phần ấy âm thì đường đi lên về phía 0.',
          'The line runs left to right along the Portfolio beta coefficient (βp) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: for the same return above the hurdle, what the Treynor ratio comes out at if beta is larger or smaller, not market history. The direction depends on that excess return: if it is positive the line falls and flattens, because the same reward spread over more market risk gets thinner; if it is negative the line rises toward 0.',
        ),
        cot: d(
          'Mỗi cột là tỷ số Treynor ở một mức beta, cột tô đặc là mức bạn đang nhập. Beta ở đây là con số bạn tự nhập chứ không được tính từ chuỗi giá, nên hãy lấy nó từ một phép hồi quy đáng tin trước khi đọc cột tô đặc.',
          'Each bar is the Treynor ratio at one beta, and the solid one is the beta you have entered. Beta here is a figure you type in, not one computed from the price series, so take it from a regression you trust before reading the solid bar.',
        ),
        diem: d(
          'Mỗi chấm là tỷ số Treynor tính ở một mức của ô Hệ số beta của danh mục (βp), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng beta bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng một phần lợi suất vượt mốc ấy, nếu beta lớn hay nhỏ hơn thì tỷ số Treynor ra bao nhiêu, không phải diễn biến thị trường. Phần ấy dương thì dãy chấm đi xuống, phần ấy âm thì dãy chấm đi lên về phía 0; ở cả hai ca, các chấm bên trái cách nhau xa và sít dần về bên phải, vì chia cho số càng lớn thì kết quả càng ít đổi.',
          'Each dot is the Treynor ratio at one level of the Portfolio beta coefficient (βp) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own beta. It is calculated on the price series you loaded: the same return above the hurdle divided by a larger or smaller beta, not market history. If that excess is positive the row of dots falls; if it is negative the row rises toward 0. Either way the dots on the left are far apart and close up to the right, because dividing by a larger number changes the result less.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là phần lợi suất vượt lãi suất phi rủi ro, quy ra cả năm và chia cho hệ số beta bạn nhập, tính trên các phiên tới đó. Đây là số đo trên chính chuỗi giá bạn nạp, không phải đường giá. Đường đi lên là mỗi đơn vị rủi ro thị trường đang được trả công cao hơn; đi xuống là mức trả công ấy đang giảm. Beta là con số cố định ở ô nhập, nên hình dạng đường đi theo lợi suất bình quân.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the return above the risk-free rate, scaled to a year and divided by the beta you entered, computed on the sessions up to then. It is measured on the very price series you loaded, not the price line. When it rises each unit of market risk is being paid more; when it falls that pay is shrinking. Beta is a fixed figure in its field, so the shape of the line follows the average return.',
      ),
      cot: d(
        'Mỗi cột là tỷ số Treynor tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột trên vạch 0 là quãng lợi suất bình quân vượt lãi suất phi rủi ro, cột dưới vạch 0 là quãng thua lãi suất ấy.',
        'Each bar is the Treynor ratio up to one session, the last one on the right being the latest. A bar above the zero line is a stretch with the average return over the risk-free rate; one below the zero line is a stretch that trailed it.',
      ),
      diem: d(
        'Mỗi chấm là tỷ số Treynor của đoạn chuỗi từ đầu tới một phiên: phần lợi suất bình quân vượt lãi suất phi rủi ro, quy ra năm rồi chia cho beta bạn nhập. Dãy chấm đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải, những phiên đầu chưa đủ số phiên tối thiểu thì phủ gạch chéo. Beta là con số cố định nên dãy chấm vẽ đúng dáng của lợi suất bình quân: đi lên là lợi suất ấy đang tăng, đi xuống là đang giảm. Các chấm đầu nhảy mạnh vì mới có ít phiên.',
        'Each dot is the Treynor ratio of the stretch from the start of the series to one session: the average return above the risk-free rate, scaled to a year and divided by the beta you entered. The dots run from the oldest session on the left to the most recent session on the right, and the first sessions, short of the minimum, are hatched. Beta is a fixed figure, so the dots trace the exact shape of the average return: when the row rises that return is climbing, when it falls it is sinking. Early dots jump around because few sessions are in yet.',
      ),
      bac: d(
        'Mỗi bậc là tỷ số Treynor của đoạn chuỗi từ đầu tới một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nguyên suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có lợi suất mới nào. Bậc đi lên là phiên vừa qua lãi hơn mức bình quân trước đó nên kéo bình quân lên, đi xuống là phiên vừa qua kém hơn; các bậc nhìn chung thấp dần về bên phải vì mỗi phiên mới chỉ là một phần ngày càng nhỏ của cả đoạn.',
        'Each step is the Treynor ratio of the stretch from the start of the series to one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and then jumps to the next, because no new return arrives between two sessions. When the staircase rises the latest session beat the average so far and pulled it up; when it falls the session came in below. Jumps generally shrink to the right, since each new session is an ever smaller part of the stretch.',
      ),
      laiLo: d(
        'Dạng này chỉ hiện khi đường tỷ số Treynor có cả đoạn trên lẫn đoạn dưới vạch 0, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải. Tỷ số chỉ tính được khi beta dương, nên dấu của nó là dấu của phần lợi suất vượt mốc: phần trên vạch 0 tô xanh là quãng lợi suất bình quân từ đầu chuỗi đang vượt lãi suất phi rủi ro, phần dưới tô đỏ là quãng còn thua. Đường đi lên qua vạch 0 là danh mục vừa bắt đầu được trả công cho rủi ro thị trường, đi xuống qua vạch 0 là vừa mất phần trả công ấy.',
        'This form appears only when the Treynor ratio line sits both above and below the zero line, running from the oldest session on the left to the most recent session on the right. The ratio exists only for a positive beta, so its sign is that of the return above the hurdle: the part above the zero line is shaded green, stretches where the average return since the start beats the risk-free rate, and the part below is shaded red, stretches still trailing it. Where it rises through the zero line the portfolio has just started being paid for its market risk; where it falls through, that pay is gone.',
      ),
    },
  },

  'ty-so-thong-tin': {
    truc: {
      benchmarkReturn: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất chuẩn so sánh / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp: cùng chuỗi ấy, nếu chuẩn so sánh khó hay dễ hơn thì tỷ số thông tin ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều với mọi chuỗi giá: chuẩn càng cao thì phần thắng được chuẩn càng mỏng, còn độ lệch khỏi chuẩn thì không đổi vì chuẩn ở đây là một mức cố định.',
          'The line runs left to right along the Benchmark return / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded: on that same series, what the information ratio comes out at against a harder or easier benchmark, not market history. The line falls steadily on any price series: the higher the benchmark, the thinner the margin over it, while the deviation from it does not change because the benchmark here is a fixed rate.',
        ),
        cot: d(
          'Mỗi cột là tỷ số thông tin ở một mức lợi suất chuẩn, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Chỗ cột đổi sang quay xuống dưới vạch 0 là mức chuẩn mà mã này không còn thắng nổi.',
          'Each bar is the information ratio at one benchmark return; bars step lower to the right and the solid one is the return you have entered. Where the bars flip below the zero line is the benchmark this ticker can no longer beat.',
        ),
        diem: d(
          'Mỗi chấm là tỷ số thông tin tính ở một mức của ô Lợi suất chuẩn so sánh / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Hình tính trên chuỗi giá bạn đã nạp và không phải diễn biến thị trường. Dãy chấm đi xuống với mọi chuỗi giá, cách nhau gần như đều và hơi sít lại về bên phải: chuẩn cao thêm một nấc thì phần thắng chuẩn mỏng đi gần đúng một lượng như nhau. Mã càng ít dao động thì các chấm càng giãn xa nhau.',
          'Each dot is the information ratio at one level of the Benchmark return / year field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own rate. It is calculated on the price series you loaded and is not market history. The row of dots falls on any price series, almost evenly and closing up slightly to the right: each extra notch of benchmark shaves nearly the same amount off the margin over it. The less a ticker swings, the further apart its dots.',
        ),
        laiLo: d(
          'Dạng này chỉ hiện khi dải của ô Lợi suất chuẩn so sánh / năm chứa đúng mức lợi suất mà chuỗi bạn đã nạp đạt được, tức lợi suất bình quân một phiên của chuỗi quy ra cả năm theo lãi kép. Phần đường trên vạch 0 tô xanh là những mức chuẩn mà mã này thắng; phần dưới vạch 0 tô đỏ là những mức chuẩn nó thua. Đây là phép thử cùng một chuỗi với các mức chuẩn khác nhau, không phải diễn biến thị trường. Đường đi xuống với mọi chuỗi và cắt vạch 0 đúng ở mức chuẩn bằng lợi suất ấy.',
          'This form appears only when the range of the Benchmark return / year field contains the return your loaded series actually achieved, that is its average per-session return compounded over a year. The part of the line above the zero line is shaded green: benchmarks this ticker beats. The part below is shaded red: benchmarks it trails. It is a what-if on one series against different benchmarks, not market history. The line falls on any series and crosses the zero line exactly at the benchmark equal to that return.',
        ),
      },
      sessionsPerYear: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên trong một năm (m), từ một nửa đến gần gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, nhưng trục ngang chỉ đổi hệ số quy đổi từ phiên sang năm, nên nó không phải diễn biến thị trường. Đường đi lên khi chuỗi giá bạn nạp có lợi suất bình quân dương, đi xuống khi chuỗi ấy lỗ rõ: quy ước một năm nhiều phiên hơn vừa phóng to kết quả một phiên, vừa hạ phần chuẩn phải vượt trong mỗi phiên.',
          'The line runs left to right along the Sessions per year (m) field, from half to nearly one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded, but the horizontal axis only changes the factor that converts a session into a year, so it is not market history. The line rises when the loaded series has a positive average return and falls when the series is clearly losing: a convention with more sessions in a year both scales up one session’s result and lowers the benchmark each session has to beat.',
        ),
        cot: d(
          'Mỗi cột là tỷ số thông tin theo một quy ước số phiên trong năm, cột tô đặc là quy ước bạn đang nhập. Hai báo cáo dùng hai quy ước khác nhau sẽ cho hai tỷ số khác nhau cho cùng một mã, nên hãy xem quy ước trước khi so.',
          'Each bar is the information ratio under one convention for the sessions in a year, and the solid one is the convention you have entered. Two reports using two conventions give two different ratios for the same ticker, so check the convention before comparing.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là tỷ số thông tin tính trên các phiên tới đó, so lợi suất của cổ phiếu với mức lợi suất chuẩn bạn nhập. Đây là số đo trên chính chuỗi giá bạn nạp, không phải đường giá. Đường đi lên là cổ phiếu đang thắng chuẩn so sánh một cách đều đặn hơn; đi xuống là phần thắng ấy đang nhỏ lại hoặc thất thường hơn. Nằm dưới mức 0 là đang thua chuẩn.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the information ratio computed on the sessions up to then, setting the share’s return against the benchmark return you entered. It is measured on the very price series you loaded, not the price line. When it rises the share is beating the benchmark more consistently; when it falls that edge is shrinking or growing erratic. Below 0 means trailing the benchmark.',
      ),
      cot: d(
        'Mỗi cột là tỷ số thông tin tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột trên vạch 0 là quãng thắng chuẩn so sánh, cột dưới vạch 0 là quãng thua; cột càng dài thì phần chênh so với chuẩn càng rõ so với độ thất thường của nó.',
        'Each bar is the information ratio up to one session, the last one on the right being the latest. A bar above the zero line is a stretch that beat the benchmark, one below the zero line a stretch that trailed it; the longer the bar, the clearer the gap against how erratic it is.',
      ),
    },
  },

  'ty-so-calmar': {
    truc: {
      sessionsPerYear: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số phiên trong một năm, từ một nửa đến gần gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Hình tính trên chuỗi giá bạn đã nạp, nhưng trục ngang chỉ đổi hệ số quy đổi từ phiên sang năm, nên nó không phải diễn biến thị trường. Đường đi lên khi chuỗi giá bạn nạp có lãi, đi xuống khi chuỗi ấy lỗ: phép quy năm chỉ chạm vào tử số là lợi suất, còn mức sụt giảm sâu nhất ở mẫu số thì không đổi theo quy ước này.',
          'The line runs left to right along the Sessions per year field, from half to nearly one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is calculated on the price series you loaded, but the horizontal axis only changes the factor that converts a session into a year, so it is not market history. The line rises when the loaded series made money and falls when it lost: annualizing touches only the return on top, while the maximum drawdown underneath does not change with this convention.',
        ),
        cot: d(
          'Mỗi cột là tỷ số Calmar theo một quy ước số phiên trong năm, cột tô đặc là quy ước bạn đang nhập. Mọi cột đều chia cho cùng một cú rơi sâu nhất của chuỗi, nên cả dãy chỉ là một con số được đo bằng những cây thước dài ngắn khác nhau.',
          'Each bar is the Calmar ratio under one convention for the sessions in a year, and the solid one is the convention you have entered. Every bar is divided by the same worst drop of the series, so the whole row is one number measured with yardsticks of different lengths.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là lợi suất năm hoá chia cho mức sụt giảm sâu nhất, cả hai tính trên các phiên tới đó. Đây là số đo trên chính chuỗi giá bạn nạp, không phải đường giá. Đường đi lên là phần lãi đang lớn dần so với cú rơi tệ nhất từng phải chịu; đi xuống là lãi đang mòn đi, hoặc cổ phiếu vừa rơi một cú sâu hơn làm mẫu số lớn lên.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the annualized return divided by the maximum drawdown, both computed on the sessions up to then. It is measured on the very price series you loaded, not the price line. When it rises the gain is growing against the worst drop endured so far; when it falls the gain is wearing away, or the share has just dropped deeper and enlarged the denominator.',
      ),
      cot: d(
        'Mỗi cột là tỷ số Calmar tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột trên vạch 0 là quãng có lãi tính theo năm, và càng cao thì lãi càng xứng với cú rơi đã chịu; cột dưới vạch 0 là quãng lợi suất năm hoá âm.',
        'Each bar is the Calmar ratio up to one session, the last one on the right being the latest. A bar above the zero line is a stretch with a positive yearly return, and the taller it is the better that return repays the drop endured; one below the zero line is a stretch with a negative annualized return.',
      ),
    },
  },

  'ty-so-thang-thua': {
    truc: {
      threshold: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Ngưỡng bỏ qua phiên đi ngang (h). Con số mặc định của ô là 0 nên trục không chạy quanh nó mà chạy từ 0 lên một quãng ngắn; chấm tròn nằm ở mép trái. Hình tính trên chuỗi giá bạn đã nạp và không phải diễn biến thị trường. Đường không có chiều cố định: nâng ngưỡng là bỏ dần các phiên nhúc nhích ít ở cả hai phía, đường đi lên nếu mức tăng trung bình nhờ đó lớn lên nhiều hơn mức giảm trung bình, đi xuống nếu ngược lại. Vùng gạch chéo là ngưỡng đã loại hết phiên giảm hoặc hết phiên tăng.',
          'The line runs left to right along the Threshold to ignore flat sessions (h) field. The field’s default is 0, so the axis does not surround it but runs from 0 up a short way; the dot sits at the left edge. It is calculated on the price series you loaded and is not market history. The line has no fixed direction: raising the threshold drops the barely moving sessions on both sides, and the line rises if that lifts the average gain by more than the average loss, and falls if not. A hatched area is a threshold that has removed every losing session or every winning one.',
        ),
        cot: d(
          'Mỗi cột là tỷ số thắng thua ứng với một ngưỡng, cột tô đặc là ngưỡng bạn đang nhập. Cột cao hơn mức một lần là phiên tăng trung bình lớn hơn phiên giảm trung bình; vùng gạch chéo ở bên phải là ngưỡng đã loại hết các phiên giảm hoặc hết các phiên tăng.',
          'Each bar is the win/loss ratio for one threshold, and the solid one is the threshold you have entered. A bar above one time means the average gain is larger than the average loss; a hatched area on the right is a threshold that has removed every losing session or every winning one.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là mức tăng trung bình của các phiên tăng chia cho mức giảm trung bình của các phiên giảm, tính trên các phiên tới đó. Đây là số đo trên chính chuỗi giá bạn nạp, không phải đường giá. Đường đi lên là mỗi phiên tăng đang lấy về nhiều hơn so với mỗi phiên giảm lấy đi; đi xuống là các phiên giảm đang nặng tay hơn. Mức một lần là hai bên ngang nhau.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the average gain of the up sessions divided by the average loss of the down sessions, computed on the sessions up to then. It is measured on the very price series you loaded, not the price line. When it rises each up session is winning back more than each down session takes; when it falls the down sessions are hitting harder. One time means the two sides are level.',
      ),
      cot: d(
        'Mỗi cột là tỷ số thắng/thua tính tới một phiên, cột cuối bên phải là phiên gần nhất. Cột cao hơn mức một lần là quãng phiên tăng lớn hơn phiên giảm; tỷ số này không đếm số phiên, nên cột cao vẫn có thể đi cùng một cổ phiếu giảm nhiều phiên hơn tăng.',
        'Each bar is the win/loss ratio up to one session, the last one on the right being the latest. A bar above one time is a stretch in which up sessions were bigger than down sessions; the ratio does not count sessions, so a tall bar can still go with a share that fell on more days than it rose.',
      ),
    },
  },
};
