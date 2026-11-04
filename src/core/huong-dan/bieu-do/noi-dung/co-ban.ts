import type { BieuDoRieng } from '../types';
import { d } from './tao';

/** Nhóm chỉ số cơ bản (`fundamentals`) — 13 công thức. */
export const BIEU_DO_CO_BAN: Readonly<Record<string, BieuDoRieng>> = {
  pe: {
    truc: {
      price: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá thị trường (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu giá đổi thì P/E ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: EPS giữ nguyên, giá càng cao thì P/E càng cao, tức cổ phiếu càng đắt so với lợi nhuận nó làm ra.',
          'The line runs left to right along the Market price (P) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on price, not market history. The line rises steadily: with EPS held still, a higher price means a higher P/E, so the share costs more for each unit of profit it earns.',
        ),
        cot: d(
          'Mỗi cột là P/E ở một mức giá, cột cao dần về bên phải và cột tô đặc là mức giá bạn đang nhập. So chiều cao hai cột là so P/E ở hai mức giá: cột cao gấp đôi là trả gấp đôi cho cùng một đồng lợi nhuận.',
          'Each bar is the P/E at one price level; bars grow taller to the right and the solid one is the price you have entered. Comparing two bars compares P/E at two prices: a bar twice as tall means paying twice as much for the same unit of profit.',
        ),
        diem: d(
          'Mỗi chấm là P/E tính ở một mức của ô Giá thị trường (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu giá đổi thì P/E ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều về bên phải: EPS giữ nguyên, giá càng cao thì P/E càng cao. Giữa hai chấm không có mức nào được tính, nên mỗi chấm là một phép thử riêng.',
          'Each dot is the P/E at one level of the Market price (P) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on price, not market history. The row of dots rises steadily to the right: with EPS held still, a higher price means a higher P/E. Nothing is computed between two dots, so each dot is a separate what-if.',
        ),
      },
      eps: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô EPS, từ một nửa đến gấp rưỡi mức EPS bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu lợi nhuận mỗi cổ phiếu đổi mà giá đứng yên thì P/E ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: EPS càng cao thì cùng mức giá ấy càng rẻ so với lợi nhuận, nhưng mỗi đồng EPS thêm vào kéo P/E xuống ít hơn đồng trước đó.',
          'The line runs left to right along the EPS field, from half to one and a half times the EPS you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on earnings per share with the price held still, not market history. The line falls and flattens: the higher the EPS, the cheaper that same price is relative to profit, yet each extra unit of EPS pulls P/E down less than the one before.',
        ),
        cot: d(
          'Mỗi cột là P/E ở một mức EPS, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Các cột bên trái cao vọt lên là vùng lợi nhuận mỏng: cùng một mức giá mà EPS chỉ còn một nửa thì P/E gấp đôi.',
          'Each bar is the P/E at one EPS level; bars shrink to the right and the solid one is the level you have entered. The tall bars on the left mark thin profit: at the same price, halving EPS doubles the P/E.',
        ),
        diem: d(
          'Mỗi chấm là P/E tính ở một mức của ô EPS, từ một nửa đến gấp rưỡi mức EPS bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu lợi nhuận mỗi cổ phiếu đổi mà giá đứng yên thì P/E ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống về bên phải, các chấm bên trái cách nhau xa hơn các chấm bên phải: EPS càng cao thì cùng mức giá càng rẻ so với lợi nhuận, nhưng mỗi đồng EPS thêm vào kéo P/E xuống ít hơn đồng trước.',
          'Each dot is the P/E at one level of the EPS field, from half to one and a half times the EPS you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on earnings per share with the price held still, not market history. The row of dots falls to the right, with the dots on the left further apart than those on the right: a higher EPS makes the same price cheaper relative to profit, yet each extra unit of EPS pulls P/E down less than the one before.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là P/E tính với giá đóng cửa của phiên đó, còn EPS vẫn là con số bạn nhập. Hình này đi theo đúng chuỗi giá bạn đã nạp, không còn là phép thử, nên đường lên xuống theo đúng giá cổ phiếu. Đường đi lên là cổ phiếu đang đắt dần so với lợi nhuận, đi xuống là rẻ dần.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the P/E at that session’s closing price, with EPS kept at the figure you entered. It follows the price series you loaded and is no longer a what-if, so the line moves with the share price. When it rises the share is getting more expensive relative to profit; when it falls it is getting cheaper.',
      ),
      cot: d(
        'Mỗi cột là P/E của một phiên, cột cuối bên phải là phiên gần nhất. Cột nhô hẳn lên so với các cột quanh nó là phiên giá bị đẩy lên so với lợi nhuận; dãy cột thấp dần là giá đang lùi.',
        'Each bar is the P/E of one session, the last one on the right being the latest. A bar standing well above its neighbors is a session where price ran ahead of profit; a run of shrinking bars means the price is retreating.',
      ),
      diem: d(
        'Mỗi chấm là P/E của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; P/E tính với giá đóng cửa của phiên ấy, còn EPS vẫn là con số bạn nhập. Hình đi theo đúng chuỗi giá bạn đã nạp, không còn là phép thử. Dãy chấm đi lên là cổ phiếu đang đắt dần so với lợi nhuận, đi xuống là rẻ dần; một chấm tách hẳn khỏi các chấm quanh nó là phiên giá nhảy mạnh.',
        'Each dot is the P/E of one session, running from the oldest session on the left to the most recent session on the right; it uses that session’s closing price, with EPS kept at the figure you entered. The chart follows the price series you loaded and is no longer a what-if. When the row of dots rises the share is getting more expensive relative to profit; when it falls it is getting cheaper. A dot standing apart from its neighbors is a session where the price jumped.',
      ),
      bac: d(
        'Mỗi bậc là P/E của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào. EPS vẫn là con số bạn nhập, nên các bậc theo đúng giá cổ phiếu trong chuỗi bạn đã nạp. Bậc đi lên là cổ phiếu đang đắt dần so với lợi nhuận, đi xuống là rẻ dần; bậc nhảy cao là phiên giá đổi mạnh.',
        'Each step is the P/E of one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and then jumps to the next one, because there is no closing price between two sessions. EPS stays at the figure you entered, so the steps follow the share price in the series you loaded. When the staircase rises the share is getting more expensive relative to profit; when it falls it is getting cheaper. A tall jump is a session where the price moved sharply.',
      ),
    },
  },

  pb: {
    truc: {
      price: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá thị trường (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu giá đổi thì P/B ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: giá trị sổ sách giữ nguyên, giá càng cao thì P/B càng cao, tức bạn trả càng nhiều cho mỗi đồng vốn chủ ghi trên sổ.',
          'The line runs left to right along the Market price (P) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on price, not market history. The line rises steadily: with book value held still, a higher price means a higher P/B, so you pay more for each unit of equity on the books.',
        ),
        cot: d(
          'Mỗi cột là P/B ở một mức giá, cột cao dần về bên phải và cột tô đặc là mức giá bạn đang nhập. Cột nào cao ngang mức một lần là chỗ giá bằng đúng giá trị sổ sách; cột thấp hơn thế là đang mua dưới sổ sách.',
          'Each bar is the P/B at one price level; bars grow taller to the right and the solid one is the price you have entered. A bar level with one time is where price equals book value exactly; anything shorter means buying below book.',
        ),
        diem: d(
          'Mỗi chấm là P/B tính ở một mức của ô Giá thị trường (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu giá đổi mà giá trị sổ sách đứng yên thì P/B ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, các chấm cách đều nhau: mọi chấm chia cho cùng một giá trị sổ sách, nên mỗi bước giá bằng nhau cộng vào P/B đúng một phần như nhau.',
          'Each dot is the P/B at one level of the Market price (P) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on price with book value held still, not market history. The row of dots rises in a straight, evenly spaced line: every dot divides by the same book value, so each equal step in price adds exactly the same amount to P/B.',
        ),
      },
      bookValuePerShare: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá trị sổ sách / CP (BVPS), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu giá trị sổ sách đổi mà giá đứng yên thì P/B ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: sổ sách càng dày thì cùng mức giá ấy càng gần với phần vốn chủ đứng sau cổ phiếu.',
          'The line runs left to right along the Book value / share (BVPS) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on book value with the price held still, not market history. The line falls and flattens: the thicker the book value, the closer that same price sits to the equity standing behind the share.',
        ),
        cot: d(
          'Mỗi cột là P/B ở một mức giá trị sổ sách, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột cao bên trái là vùng sổ sách mỏng, nơi giá gấp nhiều lần vốn chủ; càng sang phải khoảng chênh ấy càng thu lại.',
          'Each bar is the P/B at one level of book value; bars shrink to the right and the solid one is the level you have entered. The tall bars on the left mark thin book value, where the price is many times the equity; moving right, that gap narrows.',
        ),
        diem: d(
          'Mỗi chấm là P/B tính ở một mức của ô Giá trị sổ sách / CP (BVPS), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu giá trị sổ sách đổi mà giá đứng yên thì P/B ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, thưa ở bên trái và dày dần về bên phải: khi sổ sách còn mỏng, thêm một chút vốn chủ đã kéo P/B xuống mạnh; khi sổ sách đã dày, cũng phần vốn chủ ấy chỉ kéo xuống chút ít.',
          'Each dot is the P/B at one level of the Book value / share (BVPS) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on book value with the price held still, not market history. The row of dots falls, sparse on the left and denser toward the right: where book value is thin, a little more equity pulls P/B down sharply; where it is already thick, the same addition only nudges it down.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là P/B tính với giá đóng cửa của phiên đó, còn giá trị sổ sách vẫn là con số bạn nhập. Hình này đi theo đúng chuỗi giá bạn đã nạp, không còn là phép thử. Đường đi lên là giá đang cao dần so với sổ sách, đi xuống là giá đang thấp dần so với sổ sách, dù P/B đang ở trên hay dưới mức một lần.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the P/B at that session’s closing price, with book value kept at the figure you entered. It follows the price series you loaded and is no longer a what-if. When it rises the price is climbing relative to book value; when it falls the price is slipping relative to book value, whether P/B sits above or below one.',
      ),
      cot: d(
        'Mỗi cột là P/B của một phiên, cột cuối bên phải là phiên gần nhất. Nhìn cả dãy để thấy mức P/B mà chuỗi đã nạp hay quay về: cột cuối cao hơn hẳn mức ấy là giá đang đứng trên mức quen thuộc của chính nó.',
        'Each bar is the P/B of one session, the last one on the right being the latest. Read the whole row to see the P/B level the loaded series tends to return to: a last bar well above that level means the price sits above its own usual range.',
      ),
      diem: d(
        'Mỗi chấm là P/B của một phiên, xếp từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; P/B tính với giá đóng cửa của phiên ấy, còn giá trị sổ sách vẫn là con số bạn nhập. Hình đi theo đúng chuỗi giá bạn đã nạp, không còn là phép thử. Sổ sách đứng yên nên dãy chấm mang đúng dáng của giá đóng cửa, chỉ khác thang đo: dãy chấm đi lên là giá đang cao dần so với sổ sách, đi xuống là thấp dần, và chấm nào nằm ngang mức một lần là phiên thị giá bằng đúng giá trị sổ sách.',
        'Each dot is the P/B of one session, placed from the oldest session on the left to the most recent session on the right; it uses that session’s closing price, with book value kept at the figure you entered. The chart follows the price series you loaded and is no longer a what-if. With book value fixed, the dots trace the exact shape of the closing price on another scale: when the trail rises the price is climbing relative to book, when it falls it is slipping back, and a dot level with one time is a session where the price equaled book value.',
      ),
      bac: d(
        'Mỗi bậc là P/B của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nằm ngang suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào để tính. Hình đi theo chuỗi giá bạn đã nạp, không còn là phép thử. Cầu thang đi lên là giá đang cao dần so với sổ sách, đi xuống là thấp dần. Giá trị sổ sách cố định, nên độ cao mỗi bậc nhảy đúng bằng phần giá đóng cửa đổi so với phiên trước, chia cho giá trị sổ sách.',
        'Each step is the P/B of one session, running from the oldest session on the left to the most recent session on the right: a step holds level through its session and only then jumps to the next, as there is no closing price to work with between two sessions. It follows the price series you loaded and is no longer a what-if. When the staircase rises the price is climbing relative to book; when it falls it is slipping back. With book value fixed, each jump is exactly that session’s change in closing price divided by book value.',
      ),
    },
  },

  'eps-co-ban': {
    truc: {
      netIncome: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi nhuận sau thuế (LNST), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lợi nhuận đổi thì EPS ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: số cổ phiếu giữ nguyên, lợi nhuận tăng bao nhiêu phần thì EPS tăng bấy nhiêu phần.',
          'The line runs left to right along the Net income after tax (LNST) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on profit, not market history. The line rises steadily: with the share count held still, EPS grows in exact proportion to profit.',
        ),
        cot: d(
          'Mỗi cột là EPS ở một mức lợi nhuận, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột là số đồng lợi nhuận chia cho mỗi cổ phiếu: cột cao gấp rưỡi là mỗi cổ phiếu làm ra nhiều hơn một nửa.',
          'Each bar is EPS at one profit level; bars grow taller to the right and the solid one is the level you have entered. Bar height is the profit earned per share: a bar half again as tall means each share earns half as much more.',
        ),
        diem: d(
          'Mỗi chấm là EPS tính ở một mức của ô Lợi nhuận sau thuế (LNST), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lợi nhuận đổi mà số cổ phiếu đứng yên thì EPS ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, hai chấm kề nhau cách nhau đúng một khoảng: mỗi bước lợi nhuận bằng nhau chia cho cùng một số cổ phiếu, nên cộng vào EPS cùng một khoản.',
          'Each dot is EPS at one level of the Net income after tax (LNST) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on profit with the share count held still, not market history. The row of dots rises in even steps: each equal slice of extra profit, split over the same number of shares, adds the same amount to EPS.',
        ),
        laiLo: d(
          'Dạng này hiện khi trục ngang đi qua mức lợi nhuận vừa đủ trả cổ tức ưu đãi; không có cổ phiếu ưu đãi thì mức ấy là 0, nên dạng này hiện khi ô Lợi nhuận sau thuế (LNST) đang là 0, lúc trục trải hai phía quanh 0. Phần giữa đường và vạch 0 tô đỏ ở bên trái là EPS âm, tính trên mỗi cổ phiếu phổ thông là lỗ; phần tô xanh bên phải là EPS dương, mỗi cổ phiếu phổ thông có lãi. Đây là phép thử nếu lợi nhuận đổi thì EPS ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều và cắt vạch 0 đúng ở mức lợi nhuận bằng cổ tức ưu đãi.',
          'This form appears when the axis passes the profit that just covers preferred dividends; with no preferred shares that point is 0, so the form appears when the Net income after tax (LNST) field is 0 and the axis spreads on both sides of 0. Between the line and the zero line, the red part on the left is a negative EPS, a loss on each common share, and the green part on the right a positive one, a profit on each share. It is a what-if on profit, not market history. The line rises steadily and crosses the zero line exactly where profit equals preferred dividends.',
        ),
      },
      preferredDividend: {
        duong: d(
          'Ở chế độ này trục ngang là ô Cổ tức ưu đãi, và vì con số mặc định của ô là 0 nên đường chạy hết dải cho phép của ô chứ không quanh một con số; chấm tròn nằm ở mép trái. Đây là phép thử nếu phải trả cổ tức ưu đãi thì cổ đông phổ thông còn lại bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: mỗi đồng trả cho cổ phiếu ưu đãi là một đồng rút khỏi phần của cổ phiếu phổ thông, và khi khoản ấy vượt lợi nhuận thì EPS xuống dưới 0.',
          'In this mode the horizontal axis is the Preferred dividends field, and because its default figure is 0 the line spans the whole range the field allows instead of surrounding one figure; the dot sits at the left edge. It is a what-if on what common shareholders keep once preferred dividends are paid, not market history. The line falls steadily: every unit paid to preferred shares leaves the common shares’ portion, and once that payout exceeds profit, EPS drops below 0.',
        ),
        cot: d(
          'Mỗi cột là EPS ở một mức cổ tức ưu đãi. Cột còn mọc trên vạch 0 là mức cổ tức ưu đãi chưa ăn hết lợi nhuận, và các cột ấy thấp dần về bên phải; từ mức ăn hết lợi nhuận trở đi, cột quay xuống dưới vạch 0 và càng sang phải càng dài, tức cổ đông phổ thông không còn gì.',
          'Each bar is EPS at one level of preferred dividends. Bars still standing above the zero line are payouts that have not yet consumed the profit, and they get shorter to the right; from the payout that consumes all the profit onward, bars hang below the zero line and grow longer to the right, meaning common shareholders are left with nothing.',
        ),
        diem: d(
          'Mỗi chấm là EPS tính ở một mức của ô Cổ tức ưu đãi. Ô này mặc định là 0, nên lúc mới mở các chấm trải hết dải cho phép của ô và chấm trên vạch đứt dọc nằm ở mép trái; gõ một số khác 0 thì các chấm dồn quanh số ấy. Đây là phép thử nếu phải trả cổ tức ưu đãi thì cổ đông phổ thông còn lại bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống đều, các chấm cách nhau như nhau: mỗi bậc cổ tức ưu đãi bằng nhau lấy đi của mỗi cổ phiếu phổ thông cùng một khoản EPS. Chấm nằm dưới 0 là mức cổ tức ưu đãi đã vượt lợi nhuận.',
          'Each dot is EPS at one level of the Preferred dividends field. The field defaults to 0, so when the page opens the dots span the whole range the field allows and the dot on the dashed vertical line sits at the left edge; type a figure other than 0 and the dots gather around it. It is a what-if on what common shareholders keep once preferred dividends are paid, not market history. The row of dots falls in even steps: each equal increase in preferred payout takes the same amount of EPS from every common share. Dots below 0 are payouts larger than the profit.',
        ),
        laiLo: d(
          'Dạng này hiện khi dải của ô Cổ tức ưu đãi đang vẽ vượt qua mức lợi nhuận sau thuế, như lúc mới mở: ô còn là 0 nên trục trải hết dải cho phép của ô. Phần giữa đường và vạch 0 tô xanh ở bên trái là những mức cổ tức ưu đãi chưa ăn hết lợi nhuận, cổ phiếu phổ thông vẫn có lãi; phần tô đỏ bên phải là những mức đã vượt lợi nhuận, EPS âm. Đây là phép thử nếu phải trả cổ tức ưu đãi thì cổ đông phổ thông còn bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều và cắt vạch 0 đúng ở mức cổ tức ưu đãi bằng lợi nhuận sau thuế.',
          'This form appears when the drawn range of the Preferred dividends field passes the net income, as it does when the page opens: the field is still 0, so the axis spans the whole range the field allows. Between the line and the zero line, green on the left marks payouts that leave common shares a profit, and red on the right marks payouts above the profit, where EPS turns negative. It is a what-if on what common shareholders keep after preferred dividends, not market history. The line falls steadily and crosses the zero line exactly where preferred dividends equal net income.',
        ),
      },
      sharesOutstanding: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số cổ phiếu lưu hành, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số cổ phiếu đổi mà lợi nhuận đứng yên thì EPS ra bao nhiêu, không phải diễn biến thị trường. Khi doanh nghiệp có lãi, đường đi xuống và thoải dần: cùng một khoản lợi nhuận chia cho càng nhiều cổ phiếu thì phần của mỗi cổ phiếu càng mỏng, đó là hiệu ứng pha loãng khi phát hành thêm. Doanh nghiệp đang lỗ thì đường đi lên: khoản lỗ chia cho càng nhiều cổ phiếu thì mức lỗ của mỗi cổ phiếu càng nhẹ.',
          'The line runs left to right along the Shares outstanding field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the share count with profit held still, not market history. For a company in profit the line falls and flattens: the same profit split across more shares leaves less for each one, which is the dilution effect of issuing new shares. For a loss-making company the line rises: the same loss split across more shares is a milder loss for each one.',
        ),
        cot: d(
          'Mỗi cột là EPS ở một mức số cổ phiếu, cột tô đặc là mức bạn đang nhập. Khi doanh nghiệp có lãi, cột thấp dần về bên phải, và khoảng hụt giữa cột tô đặc với một cột bên phải nó là phần EPS mất đi nếu phát hành thêm tới mức ấy. Doanh nghiệp đang lỗ thì cột quay xuống dưới và ngắn dần.',
          'Each bar is EPS at one share count, and the solid one is the count you have entered. For a company in profit the bars shrink to the right, and the drop from the solid bar to one on its right is the EPS given up if shares are issued up to that count. For a loss-making company the bars hang down and get shorter.',
        ),
        diem: d(
          'Mỗi chấm là EPS tính ở một mức của ô Số cổ phiếu lưu hành, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu số cổ phiếu đổi mà lợi nhuận đứng yên thì EPS ra bao nhiêu, không phải diễn biến thị trường. Khi doanh nghiệp có lãi, dãy chấm đi xuống, thưa ở bên trái và dày dần về bên phải: phát hành thêm khi cổ phiếu còn ít làm EPS hụt nhiều, khi đã nhiều thì cùng lượng ấy làm hụt ít. Doanh nghiệp đang lỗ thì dãy chấm đi lên dưới mức 0, khoản lỗ được chia mỏng dần cho mỗi cổ phiếu.',
          'Each dot is EPS at one level of the Shares outstanding field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the share count with profit held still, not market history. For a company in profit the row of dots falls, sparse on the left and denser to the right: issuing shares when there are few cuts EPS hard, while the same batch cuts it less once there are many. For a loss-making company the row rises below 0, the loss spread ever thinner over each share.',
        ),
      },
    },
  },

  bvps: {
    truc: {
      equity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn chủ sở hữu, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu vốn chủ đổi thì BVPS ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: số cổ phiếu giữ nguyên, vốn chủ càng dày thì phần sổ sách đứng sau mỗi cổ phiếu càng lớn.',
          'The line runs left to right along the Equity field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on equity, not market history. The line rises steadily: with the share count held still, more equity means more book value behind every share.',
        ),
        cot: d(
          'Mỗi cột là BVPS ở một mức vốn chủ, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột là số đồng sổ sách của một cổ phiếu, nên đặt nó cạnh thị giá là biết đang mua trên hay dưới sổ sách.',
          'Each bar is BVPS at one equity level; bars grow taller to the right and the solid one is the level you have entered. Bar height is the book value of one share, so setting it beside the market price tells you whether you buy above or below book.',
        ),
        diem: d(
          'Mỗi chấm là BVPS tính ở một mức của ô Vốn chủ sở hữu, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu vốn chủ đổi mà số cổ phiếu đứng yên thì BVPS ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, cách đều nhau: mỗi phần vốn chủ thêm vào được chia cho cùng một số cổ phiếu, nên vốn chủ gấp đôi thì phần sổ sách đứng sau mỗi cổ phiếu cũng gấp đôi.',
          'Each dot is BVPS at one level of the Equity field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on equity with the share count held still, not market history. The row of dots rises in a straight, evenly spaced line: every added slice of equity is shared over the same number of shares, so doubling equity doubles the book value behind each share.',
        ),
      },
      sharesOutstanding: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số cổ phiếu lưu hành, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số cổ phiếu đổi mà vốn chủ đứng yên thì BVPS ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: cùng một khối vốn chủ chia cho càng nhiều cổ phiếu thì phần sổ sách đứng sau mỗi cổ phiếu càng nhỏ.',
          'The line runs left to right along the Shares outstanding field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the share count with equity held still, not market history. The line falls and flattens: the same equity spread over more shares leaves less book value behind each one.',
        ),
        cot: d(
          'Mỗi cột là BVPS ở một mức số cổ phiếu, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Phát hành thêm mà không thu về đủ vốn mới thì doanh nghiệp trượt sang các cột bên phải: sổ sách mỗi cổ phiếu bị pha loãng.',
          'Each bar is BVPS at one share count; bars shrink to the right and the solid one is the count you have entered. Issuing shares without bringing in matching new capital slides the company toward the bars on the right: book value per share gets diluted.',
        ),
        diem: d(
          'Mỗi chấm là BVPS tính ở một mức của ô Số cổ phiếu lưu hành, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu số cổ phiếu đổi mà vốn chủ đứng yên thì BVPS ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, các chấm bên trái cách nhau xa, sang phải sát lại dần: khi cổ phiếu còn ít, thêm một đợt cổ phiếu mà vốn chủ không đổi, như chia cổ tức bằng cổ phiếu, làm sổ sách mỗi cổ phiếu hụt rõ; khi đã nhiều, cùng đợt ấy chỉ làm hụt chút ít.',
          'Each dot is BVPS at one level of the Shares outstanding field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the share count with equity held still, not market history. The row of dots falls, wide apart on the left and closing up to the right: with few shares out, adding a batch while equity stays the same, as with a stock dividend, cuts book value per share visibly; with many already out, the same batch dents it far less.',
        ),
      },
    },
  },

  roe: {
    truc: {
      netIncome: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi nhuận sau thuế (LNST), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lợi nhuận đổi thì ROE ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cùng một lượng vốn chủ, lợi nhuận càng cao thì mỗi đồng vốn của cổ đông sinh lời càng nhiều.',
          'The line runs left to right along the Net income after tax (LNST) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on profit, not market history. The line rises steadily: on the same equity, more profit means every unit of shareholders’ capital earns more.',
        ),
        cot: d(
          'Mỗi cột là ROE ở một mức lợi nhuận, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Khoảng cách giữa hai cột cho biết lợi nhuận phải thêm bao nhiêu thì ROE mới nhích lên một bậc.',
          'Each bar is ROE at one profit level; bars grow taller to the right and the solid one is the level you have entered. The gap between two bars shows how much extra profit it takes to lift ROE by one step.',
        ),
        diem: d(
          'Mỗi chấm là ROE tính ở một mức của ô Lợi nhuận sau thuế (LNST), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lợi nhuận đổi thì ROE ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, các chấm cách nhau đúng một khoảng: cùng một lượng vốn chủ, mỗi phần lợi nhuận thêm vào nâng ROE lên như nhau.',
          'Each dot is ROE at one level of the Net income after tax (LNST) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on profit, not market history. The row of dots rises steadily in even steps: on the same equity, each extra slice of profit lifts ROE by the same amount.',
        ),
        laiLo: d(
          'Dạng này hiện khi ô Lợi nhuận sau thuế (LNST) đang là 0: trục ngang khi ấy trải đều hai phía quanh 0, bên trái là lỗ, bên phải là lãi. Phần đường nằm trên vạch 0 tô xanh là ROE dương, doanh nghiệp có lãi; phần dưới vạch 0 tô đỏ là ROE âm, doanh nghiệp đang lỗ. Đây là phép thử nếu lợi nhuận đổi thì ROE ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều và cắt vạch 0 đúng ở mức lợi nhuận bằng 0.',
          'This form appears when the Net income after tax (LNST) field is 0: the horizontal axis then spreads evenly on both sides of 0, losses on the left and profits on the right. The part of the line above the zero line is shaded green, a positive ROE from a profitable company; the part below is shaded red, a negative ROE from a loss. It is a what-if on profit, not market history. The line rises steadily and crosses the zero line exactly where profit is 0.',
        ),
      },
      equity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn chủ sở hữu, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu vốn chủ đổi mà lợi nhuận đứng yên thì ROE ra bao nhiêu, không phải diễn biến thị trường. Khi doanh nghiệp có lãi, đường đi xuống và thoải dần: cùng một khoản lợi nhuận mà vốn chủ càng dày thì mỗi đồng vốn của cổ đông sinh lời càng ít, nên ROE cao nhờ vốn chủ mỏng không giống ROE cao nhờ lợi nhuận lớn. Doanh nghiệp đang lỗ thì đường đi lên: vốn chủ càng dày thì mức lỗ trên mỗi đồng vốn càng nhẹ.',
          'The line runs left to right along the Equity field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on equity with profit held still, not market history. For a company in profit the line falls and flattens: on the same profit, thicker equity means each unit of shareholders’ capital earns less, so a high ROE built on thin equity is not the same as one built on large profit. For a loss-making company the line rises: thicker equity means a milder loss on each unit of capital.',
        ),
        cot: d(
          'Mỗi cột là ROE ở một mức vốn chủ, cột tô đặc là mức bạn đang nhập. Khi doanh nghiệp có lãi, cột thấp dần về bên phải; cột cao bên trái không phải doanh nghiệp giỏi hơn mà là ít vốn chủ hơn, nên hãy đọc nó cùng với hệ số nợ. Doanh nghiệp đang lỗ thì cột quay xuống dưới và ngắn dần.',
          'Each bar is ROE at one equity level, and the solid one is the level you have entered. For a company in profit the bars shrink to the right; a tall bar on the left does not mean a better business, only less equity, so read it together with the debt ratio. For a loss-making company the bars hang down and get shorter.',
        ),
        diem: d(
          'Mỗi chấm là ROE tính ở một mức của ô Vốn chủ sở hữu, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu vốn chủ đổi mà lợi nhuận đứng yên thì ROE ra bao nhiêu, không phải diễn biến thị trường. Khi doanh nghiệp có lãi, dãy chấm đi xuống, bên trái các chấm cách nhau xa, bên phải sát nhau: vốn chủ càng mỏng thì mỗi phần vốn thêm hay bớt càng làm ROE nhảy mạnh. Doanh nghiệp đang lỗ thì dãy chấm đi lên, nằm dưới 0 và nhích dần về 0, vì cùng khoản lỗ trải trên nhiều vốn hơn.',
          'Each dot is ROE at one level of the Equity field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on equity with profit held still, not market history. For a company in profit the row of dots falls, far apart on the left and close together on the right: the thinner the equity, the harder ROE jumps when equity changes. For a loss-making company the row rises below 0, creeping toward it as the same loss is spread over more capital.',
        ),
      },
    },
  },

  roa: {
    truc: {
      netIncome: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi nhuận sau thuế (LNST), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lợi nhuận đổi thì ROA ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cùng một khối tài sản, lợi nhuận càng cao thì mỗi đồng tài sản làm việc càng hiệu quả.',
          'The line runs left to right along the Net income after tax (LNST) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on profit, not market history. The line rises steadily: on the same asset base, more profit means every unit of assets works harder.',
        ),
        cot: d(
          'Mỗi cột là ROA ở một mức lợi nhuận, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột thấp không hẳn là xấu: ngành cần nhiều tài sản như ngân hàng hay điện có ROA thấp tự nhiên, nên hãy so với doanh nghiệp cùng ngành.',
          'Each bar is ROA at one profit level; bars grow taller to the right and the solid one is the level you have entered. A short bar is not bad in itself: asset-heavy sectors such as banking or power run a naturally low ROA, so compare with peers in the same sector.',
        ),
        diem: d(
          'Mỗi chấm là ROA tính ở một mức của ô Lợi nhuận sau thuế (LNST), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lợi nhuận đổi mà tổng tài sản đứng yên thì ROA ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, hai chấm kề nhau cách nhau một khoảng như nhau: mỗi phần lợi nhuận thêm vào đều được đem so với cùng một khối tài sản, nên ROA nhích lên từng nấc bằng nhau.',
          'Each dot is ROA at one level of the Net income after tax (LNST) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on profit with total assets held still, not market history. The row of dots rises in equal steps: every extra slice of profit is measured against the same asset base, so ROA climbs by the same notch each time.',
        ),
        laiLo: d(
          'Dạng này hiện khi ô Lợi nhuận sau thuế (LNST) đang là 0: trục ngang khi ấy trải đều hai phía quanh 0, nửa trái là các mức lỗ, nửa phải là các mức lãi. Phần giữa đường và vạch 0 tô xanh là ROA dương, khối tài sản đang làm ra lãi; phần tô đỏ là ROA âm, cùng khối tài sản ấy đang làm ra lỗ. Đây là phép thử nếu lợi nhuận đổi thì ROA ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều và cắt vạch 0 ngay giữa trục, đúng chỗ vạch đứt dọc đánh dấu con số 0 bạn đang nhập.',
          'This form appears when the Net income after tax (LNST) field is 0: the horizontal axis then spreads evenly on both sides of 0, losses on the left half and profits on the right. The part between the line and the zero line is shaded green where ROA is positive, the assets earning a profit, and red where it is negative, the same assets producing a loss. It is a what-if on profit, not market history. The line rises steadily and crosses the zero line in the middle of the axis, right at the dashed vertical line marking the 0 you entered.',
        ),
      },
      totalAssets: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tổng tài sản, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tổng tài sản đổi mà lợi nhuận đứng yên thì ROA ra bao nhiêu, không phải diễn biến thị trường. Khi doanh nghiệp có lãi, đường đi xuống và thoải dần: cùng một khoản lợi nhuận mà phải dùng càng nhiều tài sản thì mỗi đồng tài sản làm việc càng kém hiệu quả. Doanh nghiệp đang lỗ thì đường đi lên: tài sản càng lớn thì mức lỗ trên mỗi đồng tài sản càng nhẹ.',
          'The line runs left to right along the Total assets field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on total assets with profit held still, not market history. For a company in profit the line falls and flattens: earning the same profit on a larger asset base means every unit of assets works less hard. For a loss-making company the line rises: a larger asset base means a milder loss on each unit of assets.',
        ),
        cot: d(
          'Mỗi cột là ROA ở một mức tổng tài sản, cột tô đặc là mức bạn đang nhập. Khi doanh nghiệp có lãi, cột thấp dần về bên phải: mở rộng tài sản mà lợi nhuận chưa kịp theo thì trượt dần sang các cột thấp ấy. Doanh nghiệp đang lỗ thì cột quay xuống dưới và ngắn dần.',
          'Each bar is ROA at one level of total assets, and the solid one is the level you have entered. For a company in profit the bars shrink to the right: growing assets before profit catches up slides the company toward those short bars. For a loss-making company the bars hang down and get shorter.',
        ),
        diem: d(
          'Mỗi chấm là ROA tính ở một mức của ô Tổng tài sản, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tổng tài sản đổi mà lợi nhuận đứng yên thì ROA ra bao nhiêu, không phải diễn biến thị trường. Khi doanh nghiệp có lãi, dãy chấm đi xuống và dày dần về bên phải: với khối tài sản nhỏ, mỗi phần tài sản thêm vào kéo ROA xuống rõ, với khối tài sản lớn thì chỉ kéo xuống chút ít. Doanh nghiệp đang lỗ thì dãy chấm đi lên, nằm dưới 0 và tiến dần về 0.',
          'Each dot is ROA at one level of the Total assets field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on total assets with profit held still, not market history. For a company in profit the row of dots falls and grows denser to the right: on a small asset base each added slice of assets pulls ROA down clearly, on a large one it pulls it down far less. For a loss-making company the row rises, staying below 0 and creeping toward it.',
        ),
      },
    },
  },

  'bien-loi-nhuan-rong': {
    truc: {
      netIncome: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi nhuận sau thuế (LNST), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lợi nhuận đổi thì ROS ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: doanh thu giữ nguyên, lợi nhuận càng cao thì phần doanh nghiệp giữ lại được trên mỗi đồng bán ra càng dày.',
          'The line runs left to right along the Net income after tax (LNST) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on profit, not market history. The line rises steadily: with revenue held still, more profit means the company keeps a thicker slice of every unit it sells.',
        ),
        cot: d(
          'Mỗi cột là ROS ở một mức lợi nhuận, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột là phần của doanh thu còn lại thành lãi ròng, nên cột càng thấp thì doanh nghiệp càng ít chỗ đỡ khi chi phí tăng.',
          'Each bar is the net margin at one profit level; bars grow taller to the right and the solid one is the level you have entered. Bar height is the share of revenue left as net profit, so the shorter it is, the less cushion the company has when costs go up.',
        ),
        diem: d(
          'Mỗi chấm là ROS tính ở một mức của ô Lợi nhuận sau thuế (LNST), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lợi nhuận đổi mà doanh thu đứng yên thì ROS ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, các chấm cách nhau từng khoảng bằng nhau: cùng một doanh thu, mỗi phần lãi ròng thêm vào nâng biên lợi nhuận ròng lên một nấc như nhau, tức mỗi đồng bán ra giữ lại thêm một phần như nhau.',
          'Each dot is ROS, the net margin, at one level of the Net income after tax (LNST) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on profit with revenue held still, not market history. The row of dots rises in evenly spaced steps: against the same revenue, each extra slice of net profit lifts the margin by the same notch, so every unit sold keeps the same extra share.',
        ),
        laiLo: d(
          'Dạng này hiện khi ô Lợi nhuận sau thuế (LNST) đang là 0: trục ngang khi ấy trải đều hai phía quanh 0, bên trái là lỗ ròng, bên phải là lãi ròng. Phần giữa đường và vạch 0 tô xanh là ROS dương, mỗi đồng doanh thu còn để lại lãi; phần tô đỏ là ROS âm, bán ra mà vẫn lỗ sau khi trừ hết chi phí và thuế. Đây là phép thử nếu lợi nhuận đổi thì ROS ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều và cắt vạch 0 ngay tại vạch đứt dọc, nơi lãi ròng bằng 0.',
          'This form appears when the Net income after tax (LNST) field is 0: the horizontal axis then spreads evenly on both sides of 0, net losses on the left and net profits on the right. Between the line and the zero line, green marks a positive ROS, each unit of revenue leaving some profit behind, and red a negative one, sales that still end in a loss once every cost and tax is paid. It is a what-if on profit, not market history. The line rises steadily and crosses the zero line right at the dashed vertical line, where net profit is 0.',
        ),
      },
      revenue: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Doanh thu thuần, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu doanh thu đổi mà lợi nhuận đứng yên thì ROS ra bao nhiêu, không phải diễn biến thị trường. Khi doanh nghiệp có lãi, đường đi xuống và thoải dần: bán được nhiều hơn mà lãi ròng không tăng theo thì phần giữ lại trên mỗi đồng doanh thu mỏng đi. Doanh nghiệp đang lỗ thì đường đi lên: doanh thu càng lớn thì mức lỗ trên mỗi đồng doanh thu càng nhẹ.',
          'The line runs left to right along the Net revenue field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on revenue with profit held still, not market history. For a company in profit the line falls and flattens: selling more without earning more leaves a thinner slice of every unit of revenue. For a loss-making company the line rises: larger revenue means a milder loss on each unit of revenue.',
        ),
        cot: d(
          'Mỗi cột là ROS ở một mức doanh thu, cột tô đặc là mức bạn đang nhập. Khi doanh nghiệp có lãi, cột thấp dần về bên phải; đọc chiều ngược lại cũng được: cột cao bên trái là cùng khoản lãi ấy kiếm được từ doanh thu nhỏ hơn, tức doanh nghiệp gọn chi phí hơn. Doanh nghiệp đang lỗ thì cột quay xuống dưới và ngắn dần.',
          'Each bar is the net margin at one revenue level, and the solid one is the level you have entered. For a company in profit the bars shrink to the right; it reads the other way too: a tall bar on the left is the same profit earned on smaller revenue, that is a leaner cost base. For a loss-making company the bars hang down and get shorter.',
        ),
        diem: d(
          'Mỗi chấm là ROS tính ở một mức của ô Doanh thu thuần, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu doanh thu đổi mà lợi nhuận đứng yên thì ROS ra bao nhiêu, không phải diễn biến thị trường. Khi doanh nghiệp có lãi, dãy chấm đi xuống và sát lại dần về bên phải: cùng một khoản lãi ròng, lúc doanh thu còn nhỏ thì biên lợi nhuận đổi mạnh theo từng bước doanh thu, lúc đã lớn thì mỗi bước chỉ làm nó nhích chút ít. Doanh nghiệp đang lỗ thì dãy chấm đi lên dưới 0, nhích dần về 0.',
          'Each dot is ROS at one level of the Net revenue field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on revenue with profit held still, not market history. For a company in profit the row of dots falls and draws closer together to the right: on the same net profit, the margin swings hard with each step of revenue while revenue is small, and shifts only a little once it is large. For a loss-making company the row rises below 0, edging toward 0.',
        ),
      },
    },
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Lãi ròng (LNST) rồi Doanh thu còn lại cộng lại thành thanh sẫm cuối cùng, Doanh thu thuần, một số tiền khác với biên lợi nhuận ròng ở khối Kết quả vì khối ấy in tỷ lệ giữa thanh Lãi ròng (LNST) và thanh Doanh thu thuần, không phải tổng của hai thanh trên. Thanh Lãi ròng (LNST) càng dài thì phần doanh nghiệp giữ lại thành lãi trên mỗi đồng bán ra càng dày.',
        'Each horizontal bar is one part, read from top to bottom: Net income (LNST) then Remaining revenue add up to the dark bar at the end, Net revenue, a money figure different from the net margin in the Result block, because that block prints the ratio between the Net income (LNST) bar and the Net revenue bar, not the sum of the two bars above. The longer the Net income (LNST) bar, the thicker the slice of each unit sold that ends up as profit.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Doanh thu thuần thành hai múi, Lãi ròng (LNST) và Doanh thu còn lại, mỗi múi to theo phần nó chiếm trong doanh thu. Lỗ giữa in Doanh thu thuần cùng giá trị của nó; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Lãi ròng (LNST) càng lớn thì biên lợi nhuận ròng càng dày.',
        'The ring splits Net revenue into two slices, Net income (LNST) and Remaining revenue, each sized by its share of revenue. The hole shows Net revenue and its value; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The bigger the Net income (LNST) slice, the thicker the net margin.',
      ),
    },
  },

  'bien-loi-nhuan-gop': {
    truc: {
      revenue: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Doanh thu thuần, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu doanh thu đổi mà giá vốn đứng yên thì biên gộp ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: doanh thu càng lớn thì giá vốn chiếm phần càng nhỏ, và mỗi đồng doanh thu thêm vào nâng biên gộp ít hơn đồng trước đó.',
          'The line runs left to right along the Net revenue field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on revenue with cost of goods held still, not market history. The line rises but flattens: the larger the revenue, the smaller the slice taken by cost of goods, and each extra unit of revenue lifts the margin less than the one before.',
        ),
        cot: d(
          'Mỗi cột là biên gộp ở một mức doanh thu, cột tô đặc là mức bạn đang nhập. Các cột bên trái quay xuống dưới vạch 0 là vùng doanh thu chưa đủ bù giá vốn, tức bán ra dưới giá vốn; chỗ cột đổi sang mọc lên trên vạch 0 là mức doanh thu vừa đủ hoà giá vốn.',
          'Each bar is the gross margin at one revenue level, and the solid one is the level you have entered. Bars on the left that hang below the zero line mark revenue too small to cover cost of goods, that is selling below cost; the point where bars switch to standing above the zero line is the revenue that just covers it.',
        ),
        diem: d(
          'Mỗi chấm là biên gộp tính ở một mức của ô Doanh thu thuần, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu doanh thu đổi mà giá vốn đứng yên thì biên gộp ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên, cách xa nhau ở bên trái rồi sát lại về bên phải: lúc doanh thu còn sát với giá vốn, mỗi bước doanh thu thêm làm biên gộp nhảy mạnh; khi doanh thu đã vượt xa giá vốn, cùng bước ấy chỉ nhích nó lên chút ít. Chấm nào nằm dưới 0 là mức doanh thu chưa đủ bù giá vốn, tức bán ra dưới giá vốn.',
          'Each dot is the gross margin at one level of the Net revenue field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on revenue with cost of goods held still, not market history. The row of dots rises, wide apart on the left and closing up to the right: while revenue is close to cost of goods, each step of extra revenue lifts the margin sharply; once revenue is well above cost, the same step only nudges it. Any dot below 0 is revenue too small to cover cost of goods, that is selling below cost.',
        ),
        laiLo: d(
          'Dạng này hiện khi giá vốn hàng bán nằm trong dải của ô Doanh thu thuần đang vẽ, tức có những mức doanh thu chưa đủ bù giá vốn. Phần giữa đường và vạch 0 tô đỏ ở bên trái là bán ra dưới giá vốn, biên gộp âm; phần tô xanh bên phải là doanh thu đã vượt giá vốn, còn lãi gộp để trả các chi phí khác. Đây là phép thử nếu doanh thu đổi mà giá vốn đứng yên thì biên gộp ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 đúng ở mức doanh thu bằng giá vốn, chỗ bán ra vừa đủ bù giá vốn.',
          'This form appears when cost of goods sold lies inside the range of the Net revenue field being drawn, so that some revenue levels do not cover it. Between the line and the zero line, the red part on the left is selling below cost, a negative gross margin; the green part on the right is revenue above cost, leaving gross profit to pay the other expenses. It is a what-if on revenue with cost of goods held still, not market history. The line rises and crosses the zero line exactly where revenue equals cost of goods, the point where sales just cover it.',
        ),
      },
      cogs: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá vốn hàng bán, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu giá vốn đổi mà doanh thu đứng yên thì biên gộp ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: mỗi đồng giá vốn tăng thêm ăn đúng một đồng vào lãi gộp, nên biên gộp lùi theo một đường thẳng.',
          'The line runs left to right along the Cost of goods sold field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on cost of goods with revenue held still, not market history. The line falls steadily: every extra unit of cost takes exactly one unit out of gross profit, so the margin retreats along a straight line.',
        ),
        cot: d(
          'Mỗi cột là biên gộp ở một mức giá vốn, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao còn lại của cột là phần doanh thu dùng để trả chi phí bán hàng, quản lý, lãi vay và thuế; cột càng thấp thì phần ấy càng chật.',
          'Each bar is the gross margin at one cost level; bars shrink to the right and the solid one is the level you have entered. Whatever height a bar has left is the part of revenue that must pay for selling, administration, interest and tax; the shorter the bar, the tighter that room.',
        ),
        diem: d(
          'Mỗi chấm là biên gộp tính ở một mức của ô Giá vốn hàng bán, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu giá vốn đổi mà doanh thu đứng yên thì biên gộp ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống thành một hàng thẳng, cách đều nhau: mỗi bước giá vốn bằng nhau lấy đi của lãi gộp một phần bằng nhau, nên biên gộp lùi từng nấc đều đặn. Khi giá vốn vượt doanh thu, các chấm rơi xuống dưới 0.',
          'Each dot is the gross margin at one level of the Cost of goods sold field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on cost of goods with revenue held still, not market history. The row of dots falls in a straight, evenly spaced line: each equal step of cost takes an equal bite out of gross profit, so the margin retreats notch by notch. Once cost of goods passes revenue, the dots drop below 0.',
        ),
        laiLo: d(
          'Dạng này hiện khi doanh thu thuần nằm trong dải của ô Giá vốn hàng bán đang vẽ, tức trục đi qua mức giá vốn ngang bằng doanh thu. Phần giữa đường và vạch 0 tô xanh ở bên trái là giá vốn còn thấp hơn doanh thu, mỗi đồng bán ra vẫn để lại lãi gộp; phần tô đỏ bên phải là giá vốn đã vượt doanh thu, bán ra dưới giá vốn. Đây là phép thử nếu giá vốn đổi mà doanh thu đứng yên thì biên gộp ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều và cắt vạch 0 đúng ở mức giá vốn bằng doanh thu.',
          'This form appears when net revenue lies inside the range of the Cost of goods sold field being drawn, that is when the axis passes the cost level equal to revenue. Between the line and the zero line, green on the left is cost still below revenue, so every unit sold leaves some gross profit; red on the right is cost above revenue, selling below cost. It is a what-if on cost of goods with revenue held still, not market history. The line falls steadily and crosses the zero line exactly where cost of goods equals revenue.',
        ),
      },
    },
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Lợi nhuận gộp rồi Giá vốn hàng bán cộng lại thành thanh sẫm cuối cùng, Doanh thu thuần, một số tiền khác với biên lợi nhuận gộp ở khối Kết quả vì khối ấy in tỷ lệ giữa thanh Lợi nhuận gộp và thanh Doanh thu thuần, không phải tổng của hai thanh trên. Thanh Giá vốn hàng bán càng dài thì phần doanh nghiệp giữ lại trên mỗi đồng bán ra càng mỏng.',
        'Each horizontal bar is one part, read from top to bottom: Gross profit then Cost of goods sold add up to the dark bar at the end, Net revenue, a money figure different from the gross margin in the Result block, because that block prints the ratio between the Gross profit bar and the Net revenue bar, not the sum of the two bars above. The longer the Cost of goods sold bar, the thinner the slice the company keeps on each unit it sells.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Doanh thu thuần thành hai múi, Lợi nhuận gộp và Giá vốn hàng bán, mỗi múi to theo phần nó chiếm trong doanh thu. Lỗ giữa in Doanh thu thuần cùng giá trị của nó; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Giá vốn hàng bán càng lớn thì biên lợi nhuận gộp càng mỏng.',
        'The ring splits Net revenue into two slices, Gross profit and Cost of goods sold, each sized by its share of revenue. The hole shows Net revenue and its value; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The bigger the Cost of goods sold slice, the thinner the gross margin.',
      ),
    },
  },

  'no-tren-von-chu': {
    truc: {
      totalLiabilities: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tổng nợ phải trả (D), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu nợ đổi thì D/E ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: vốn chủ giữ nguyên, vay thêm bao nhiêu thì gánh nợ đè lên mỗi đồng vốn của cổ đông nặng thêm bấy nhiêu.',
          'The line runs left to right along the Total liabilities (D) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on debt, not market history. The line rises steadily: with equity held still, every extra unit borrowed adds the same weight of debt onto each unit of shareholders’ capital.',
        ),
        cot: d(
          'Mỗi cột là D/E ở một mức nợ, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột nào chạm mức một lần là chỗ nợ bằng đúng vốn chủ; cao hơn thế là doanh nghiệp đang dùng tiền đi vay nhiều hơn tiền của cổ đông.',
          'Each bar is D/E at one debt level; bars grow taller to the right and the solid one is the level you have entered. A bar reaching one time is where debt equals equity exactly; taller than that and the company runs on more borrowed money than shareholders’ money.',
        ),
        diem: d(
          'Mỗi chấm là D/E tính ở một mức của ô Tổng nợ phải trả (D), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu nợ đổi mà vốn chủ đứng yên thì D/E ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, cách đều nhau: mỗi khoản vay thêm bằng nhau đè thêm lên vốn của cổ đông một nấc bằng nhau. Chấm nằm ngang mức một lần là chỗ nợ bằng đúng vốn chủ.',
          'Each dot is D/E at one level of the Total liabilities (D) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on debt with equity held still, not market history. The row of dots rises in a straight, evenly spaced line: each equal amount of extra borrowing piles the same extra weight onto shareholders’ capital. A dot level with one time marks debt exactly equal to equity.',
        ),
      },
      equity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn chủ sở hữu (E), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu vốn chủ đổi mà nợ đứng yên thì D/E ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: cùng một khối nợ mà vốn chủ càng dày thì gánh nợ trên mỗi đồng vốn của cổ đông càng nhẹ.',
          'The line runs left to right along the Equity (E) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on equity with debt held still, not market history. The line falls and flattens: against the same debt, thicker equity means a lighter load on each unit of shareholders’ capital.',
        ),
        cot: d(
          'Mỗi cột là D/E ở một mức vốn chủ, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Thua lỗ ăn vào vốn chủ đẩy doanh nghiệp về các cột cao bên trái dù không vay thêm đồng nào.',
          'Each bar is D/E at one equity level; bars shrink to the right and the solid one is the level you have entered. Losses that eat into equity push the company toward the tall bars on the left even if it borrows nothing more.',
        ),
        diem: d(
          'Mỗi chấm là D/E tính ở một mức của ô Vốn chủ sở hữu (E), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu vốn chủ đổi mà nợ đứng yên thì D/E ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, thưa ở bên trái và dày ở bên phải: khi vốn chủ đã mỏng, mất thêm một phần vốn chủ làm D/E vọt lên rất nhanh, nên các chấm bên trái cho thấy rủi ro dồn lên nhanh thế nào ở doanh nghiệp đang để lỗ ăn dần vào vốn.',
          'Each dot is D/E at one level of the Equity (E) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on equity with debt held still, not market history. The row of dots falls, sparse on the left and dense on the right: once equity is thin, losing a little more of it sends D/E up very quickly, so the left-hand dots show how fast the risk builds for a company whose losses eat into its capital.',
        ),
      },
    },
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Nợ phải trả (D) rồi Vốn chủ sở hữu (E) cộng lại thành thanh sẫm cuối cùng, Tổng nguồn vốn, một số tiền khác với D/E ở khối Kết quả vì khối ấy in tỷ số giữa thanh Nợ phải trả (D) và thanh Vốn chủ sở hữu (E), không phải tổng của hai thanh trên. Thanh nào dài hơn là nguồn vốn ấy đang chiếm phần lớn hơn trong tổng tài sản doanh nghiệp đang dùng.',
        'Each horizontal bar is one part, read from top to bottom: Liabilities (D) then Equity (E) add up to the dark bar at the end, Total capital, a money figure different from the D/E ratio in the Result block, because that block prints the ratio between the Liabilities (D) bar and the Equity (E) bar, not the sum of the two bars above. The longer bar is the funding source making up the larger share of the company’s total assets.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Tổng nguồn vốn thành hai múi, Nợ phải trả (D) và Vốn chủ sở hữu (E), mỗi múi to theo phần nó chiếm trong tổng nguồn vốn. Lỗ giữa in Tổng nguồn vốn cùng giá trị của nó; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Nợ phải trả (D) càng lớn thì doanh nghiệp càng dựa nhiều vào vốn của người khác thay vì vốn tự có.',
        'The ring splits Total capital into two slices, Liabilities (D) and Equity (E), each sized by its share of total capital. The hole shows Total capital and its value; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The bigger the Liabilities (D) slice, the more the company relies on other people’s money rather than its own capital.',
      ),
    },
  },

  'thanh-toan-hien-hanh': {
    truc: {
      currentAssets: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tài sản ngắn hạn, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tài sản ngắn hạn đổi thì hệ số thanh toán ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: nợ ngắn hạn giữ nguyên, tài sản ngắn hạn càng nhiều thì doanh nghiệp càng dư sức trả các khoản đến hạn trong năm.',
          'The line runs left to right along the Current assets field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on current assets, not market history. The line rises steadily: with current liabilities held still, more current assets leave the company more room to meet what falls due within the year.',
        ),
        cot: d(
          'Mỗi cột là hệ số thanh toán hiện hành ở một mức tài sản ngắn hạn, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột thấp hơn mức một lần là vùng tài sản ngắn hạn không đủ phủ nợ ngắn hạn.',
          'Each bar is the current ratio at one level of current assets; bars grow taller to the right and the solid one is the level you have entered. Bars shorter than one time mark the zone where current assets do not cover current liabilities.',
        ),
        diem: d(
          'Mỗi chấm là hệ số thanh toán hiện hành tính ở một mức của ô Tài sản ngắn hạn, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tài sản ngắn hạn đổi mà nợ ngắn hạn đứng yên thì hệ số ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, cách đều nhau: mỗi phần tài sản ngắn hạn thêm vào đều đặt cạnh cùng một khối nợ ngắn hạn, nên hệ số tăng từng nấc bằng nhau.',
          'Each dot is the current ratio at one level of the Current assets field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on current assets with current liabilities held still, not market history. The row of dots rises in a straight, evenly spaced line: every added slice of current assets is set against the same short-term debt, so the ratio climbs in equal notches.',
        ),
      },
      currentLiabilities: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Nợ ngắn hạn, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu nợ ngắn hạn đổi mà tài sản ngắn hạn đứng yên thì hệ số thanh toán ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: các khoản đến hạn trong năm càng lớn thì phần tài sản ngắn hạn dư ra để trả chúng càng mỏng.',
          'The line runs left to right along the Current liabilities field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on current liabilities with current assets held still, not market history. The line falls and flattens: the more that falls due within the year, the thinner the cushion of current assets left to pay it.',
        ),
        cot: d(
          'Mỗi cột là hệ số thanh toán hiện hành ở một mức nợ ngắn hạn, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột hạ về gần mức một lần là chỗ nợ ngắn hạn sắp bằng tài sản ngắn hạn; thấp hơn nữa là không đủ tài sản để phủ nợ.',
          'Each bar is the current ratio at one level of current liabilities; bars shrink to the right and the solid one is the level you have entered. A bar sinking toward one time is where short-term debt is about to match current assets; any lower and the assets no longer cover it.',
        ),
        diem: d(
          'Mỗi chấm là hệ số thanh toán hiện hành tính ở một mức của ô Nợ ngắn hạn, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu nợ ngắn hạn đổi mà tài sản ngắn hạn đứng yên thì hệ số ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, các chấm bên trái cách nhau xa hơn các chấm bên phải: lúc nợ đến hạn còn ít, mỗi khoản nợ mới làm hệ số tụt mạnh; nợ đã nhiều thì mỗi khoản thêm chỉ làm tụt chút ít.',
          'Each dot is the current ratio at one level of the Current liabilities field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on current liabilities with current assets held still, not market history. The row of dots falls, with the dots on the left further apart than those on the right: while little is coming due, each new debt drags the ratio down hard; once a lot is due, each extra one only trims it.',
        ),
      },
    },
  },

  'thanh-toan-nhanh': {
    truc: {
      currentAssets: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tài sản ngắn hạn, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tài sản ngắn hạn đổi mà hàng tồn kho đứng yên thì hệ số thanh toán nhanh ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: phần tài sản dễ đổi ra tiền càng lớn thì doanh nghiệp càng trả được nợ đến hạn mà không phải chờ bán hàng.',
          'The line runs left to right along the Current assets field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on current assets with inventory held still, not market history. The line rises steadily: the larger the easily cashed part of the assets, the better the company can meet what falls due without waiting to sell stock.',
        ),
        cot: d(
          'Mỗi cột là hệ số thanh toán nhanh ở một mức tài sản ngắn hạn, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Hàng tồn kho đã bị trừ ra trước khi vẽ, nên cột ở đây luôn thấp hơn cột cùng mức của hệ số thanh toán hiện hành.',
          'Each bar is the quick ratio at one level of current assets; bars grow taller to the right and the solid one is the level you have entered. Inventory is taken out before anything is drawn, so a bar here is always shorter than the current ratio’s bar at the same level.',
        ),
        diem: d(
          'Mỗi chấm là hệ số thanh toán nhanh tính ở một mức của ô Tài sản ngắn hạn, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tài sản ngắn hạn đổi mà hàng tồn kho và nợ ngắn hạn đứng yên thì hệ số ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên, cách đều nhau: hàng tồn kho bị trừ ra như một khoản cố định, nên ở đây mọi phần tài sản thêm vào đều tính là phần dễ đổi ra tiền và nâng hệ số những nấc bằng nhau.',
          'Each dot is the quick ratio at one level of the Current assets field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on current assets with inventory and current liabilities held still, not market history. The row of dots rises in even steps: inventory is subtracted as a fixed amount, so every extra slice of current assets here counts as easily cashed and lifts the ratio by the same notch.',
        ),
      },
      inventory: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Hàng tồn kho, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu hàng tồn kho đổi mà tài sản ngắn hạn đứng yên thì hệ số thanh toán nhanh ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: trong cùng một khối tài sản ngắn hạn, phần nằm ở hàng tồn kho càng lớn thì phần đổi ngay ra tiền được càng nhỏ.',
          'The line runs left to right along the Inventory field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on inventory with current assets held still, not market history. The line falls steadily: within the same current assets, the more that sits in inventory, the less can be turned into cash at once.',
        ),
        cot: d(
          'Mỗi cột là hệ số thanh toán nhanh ở một mức hàng tồn kho, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Hai doanh nghiệp cùng hệ số thanh toán hiện hành có thể đứng ở hai cột rất khác nhau ở đây, tuỳ họ ôm bao nhiêu hàng.',
          'Each bar is the quick ratio at one inventory level; bars shrink to the right and the solid one is the level you have entered. Two companies with the same current ratio can stand on very different bars here, depending on how much stock they carry.',
        ),
        diem: d(
          'Mỗi chấm là hệ số thanh toán nhanh tính ở một mức của ô Hàng tồn kho, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu hàng tồn kho đổi mà tài sản ngắn hạn đứng yên thì hệ số ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống thành một hàng thẳng, cách đều nhau: trong cùng một khối tài sản ngắn hạn, mỗi phần nằm lại trong kho bớt đúng phần ấy khỏi số tiền dễ huy động để trả nợ đến hạn.',
          'Each dot is the quick ratio at one level of the Inventory field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on inventory with current assets held still, not market history. The row of dots falls in a straight, evenly spaced line: within the same current assets, every slice sitting in the warehouse comes one for one out of the money that could quickly be raised to pay debts coming due.',
        ),
      },
      currentLiabilities: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Nợ ngắn hạn, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu nợ ngắn hạn đổi mà tài sản và hàng tồn kho đứng yên thì hệ số thanh toán nhanh ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: nợ đến hạn càng lớn thì phần tài sản dễ đổi ra tiền càng không đủ che.',
          'The line runs left to right along the Current liabilities field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on current liabilities with assets and inventory held still, not market history. The line falls and flattens: the more that falls due, the less the easily cashed assets are able to cover.',
        ),
        cot: d(
          'Mỗi cột là hệ số thanh toán nhanh ở một mức nợ ngắn hạn, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột thấp hơn mức một lần là vùng doanh nghiệp phải bán được hàng tồn kho thì mới trả hết nợ đến hạn.',
          'Each bar is the quick ratio at one level of current liabilities; bars shrink to the right and the solid one is the level you have entered. Bars shorter than one time mark the zone where the company must sell inventory to clear what falls due.',
        ),
        diem: d(
          'Mỗi chấm là hệ số thanh toán nhanh tính ở một mức của ô Nợ ngắn hạn, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu nợ ngắn hạn đổi mà tài sản và hàng tồn kho đứng yên thì hệ số ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống và sát lại dần về bên phải: nợ còn nhẹ thì mỗi khoản nợ thêm làm hệ số tụt rõ, nợ đã nặng thì cùng khoản ấy chỉ làm tụt chút ít, vì nó chỉ còn là một phần nhỏ trong cả khối nợ.',
          'Each dot is the quick ratio at one level of the Current liabilities field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on current liabilities with assets and inventory held still, not market history. The row of dots falls and closes up toward the right: while debt is light, each extra amount owed knocks the ratio down visibly; once debt is heavy, the same amount only shaves it, being a small part of a large total.',
        ),
      },
    },
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Tài sản trừ tồn kho rồi Hàng tồn kho cộng lại thành thanh sẫm cuối cùng, Tài sản ngắn hạn, một số tiền khác với hệ số thanh toán nhanh ở khối Kết quả, vì khối ấy chia thanh Tài sản trừ tồn kho cho Nợ ngắn hạn, một ô không có trong vòng này. Thanh Hàng tồn kho càng dài thì hệ số thanh toán nhanh càng thấp so với hệ số thanh toán hiện hành.',
        'Each horizontal bar is one part, read from top to bottom: Quick assets then Inventory add up to the dark bar at the end, Current assets, a money figure different from the quick ratio in the Result block, because that block divides the Quick assets bar by Current liabilities, a field this chart does not show. The longer the Inventory bar, the lower the quick ratio sits below the current ratio.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Tài sản ngắn hạn thành hai múi, Tài sản trừ tồn kho và Hàng tồn kho, mỗi múi to theo phần nó chiếm trong tài sản ngắn hạn. Lỗ giữa in Tài sản ngắn hạn cùng giá trị của nó; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Hàng tồn kho càng lớn thì càng nhiều tài sản ngắn hạn đang nằm ở hàng khó bán gấp.',
        'The ring splits Current assets into two slices, Quick assets and Inventory, each sized by its share of current assets. The hole shows Current assets and its value; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The bigger the Inventory slice, the more of current assets sits in stock that cannot be sold quickly.',
      ),
    },
  },

  'vong-quay-tong-tai-san': {
    truc: {
      revenue: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Doanh thu thuần, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu doanh thu đổi thì vòng quay tài sản ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cùng một khối tài sản, bán được càng nhiều thì mỗi đồng tài sản quay ra doanh thu càng nhanh.',
          'The line runs left to right along the Net revenue field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on revenue, not market history. The line rises steadily: on the same asset base, the more the company sells, the faster each unit of assets turns into revenue.',
        ),
        cot: d(
          'Mỗi cột là số vòng quay ở một mức doanh thu, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột chạm mức một vòng là chỗ doanh thu một năm bằng đúng tổng tài sản.',
          'Each bar is the turnover at one revenue level; bars grow taller to the right and the solid one is the level you have entered. A bar reaching one turn is where a year of revenue equals total assets exactly.',
        ),
        diem: d(
          'Mỗi chấm là số vòng quay tính ở một mức của ô Doanh thu thuần, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu doanh thu đổi mà tổng tài sản đứng yên thì vòng quay ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, cách đều nhau: cùng một khối tài sản, mỗi bước doanh thu bằng nhau thêm vào số vòng quay một phần vòng như nhau.',
          'Each dot is the turnover at one level of the Net revenue field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on revenue with total assets held still, not market history. The row of dots rises in a straight, evenly spaced line: on the same asset base, each equal step of sales adds the same fraction of a turn.',
        ),
      },
      totalAssets: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tổng tài sản, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tổng tài sản đổi mà doanh thu đứng yên thì vòng quay tài sản ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: cùng một mức doanh thu mà phải dùng càng nhiều tài sản thì mỗi đồng tài sản quay ra doanh thu càng chậm.',
          'The line runs left to right along the Total assets field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on total assets with revenue held still, not market history. The line falls and flattens: producing the same revenue from a larger asset base means each unit of assets turns into sales more slowly.',
        ),
        cot: d(
          'Mỗi cột là số vòng quay ở một mức tổng tài sản, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Doanh nghiệp vừa đầu tư lớn thường trượt sang cột thấp bên phải trong vài năm đầu, trước khi tài sản mới kịp tạo doanh thu.',
          'Each bar is the turnover at one level of total assets; bars shrink to the right and the solid one is the level you have entered. A company that has just invested heavily usually slides to a short bar on the right for its first years, before the new assets start to produce revenue.',
        ),
        diem: d(
          'Mỗi chấm là số vòng quay tính ở một mức của ô Tổng tài sản, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tổng tài sản đổi mà doanh thu đứng yên thì vòng quay ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, thưa ở bên trái và dày ở bên phải: khối tài sản còn gọn thì mỗi phần tài sản mua thêm mà chưa tạo doanh thu làm vòng quay chậm đi rõ rệt; khối tài sản đã lớn thì cùng phần ấy chỉ làm chậm chút ít.',
          'Each dot is the turnover at one level of the Total assets field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on total assets with revenue held still, not market history. The row of dots falls, sparse on the left and dense on the right: on a lean asset base, each extra slice of assets that brings in no new sales slows the turnover noticeably; on a large base the same slice slows it only slightly.',
        ),
      },
    },
  },

  'ty-le-chi-tra-co-tuc': {
    truc: {
      dividendPerShare: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Cổ tức tiền mặt / CP (DPS), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mức cổ tức đổi thì hệ số chi trả ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: EPS giữ nguyên, trả cổ tức càng cao thì phần lợi nhuận giữ lại để tái đầu tư càng mỏng.',
          'The line runs left to right along the Cash dividend / share (DPS) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the dividend, not market history. The line rises steadily: with EPS held still, a larger dividend leaves a thinner slice of profit to reinvest.',
        ),
        cot: d(
          'Mỗi cột là hệ số chi trả ở một mức cổ tức, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột là phần lợi nhuận đem chia; phần còn thiếu để chạm mức toàn bộ lợi nhuận là phần doanh nghiệp giữ lại.',
          'Each bar is the payout ratio at one dividend level; bars grow taller to the right and the solid one is the level you have entered. Bar height is the part of profit paid out; whatever is missing to reach the whole profit is the part the company retains.',
        ),
        diem: d(
          'Mỗi chấm là hệ số chi trả tính ở một mức của ô Cổ tức tiền mặt / CP (DPS), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu mức cổ tức đổi mà EPS đứng yên thì hệ số chi trả ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, cách đều nhau: mỗi đồng cổ tức thêm là một đồng lấy từ phần lãi giữ lại, nên phần đem chia nhích lên những nấc bằng nhau.',
          'Each dot is the payout ratio at one level of the Cash dividend / share (DPS) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the dividend with EPS held still, not market history. The row of dots rises in a straight, evenly spaced line: every extra unit of dividend comes out of retained profit, so the share paid out climbs in equal notches.',
        ),
      },
      eps: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô EPS, từ một nửa đến gấp rưỡi mức EPS bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu EPS đổi mà mức cổ tức đứng yên thì hệ số chi trả ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: lợi nhuận mỗi cổ phiếu càng cao thì cùng mức cổ tức ấy chiếm phần càng nhỏ, tức doanh nghiệp càng dư sức giữ mức trả.',
          'The line runs left to right along the EPS field, from half to one and a half times the EPS you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on EPS with the dividend held still, not market history. The line falls and flattens: the higher the earnings per share, the smaller the slice that same dividend takes, so the payout is easier to sustain.',
        ),
        cot: d(
          'Mỗi cột là hệ số chi trả ở một mức EPS, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột cao bên trái là cảnh lợi nhuận sụt mà cổ tức vẫn giữ: cột càng gần mức toàn bộ lợi nhuận thì mức cổ tức ấy càng khó giữ lâu.',
          'Each bar is the payout ratio at one EPS level; bars shrink to the right and the solid one is the level you have entered. A tall bar on the left is profit dropping while the dividend stays: the closer a bar gets to the whole profit, the harder that dividend is to keep.',
        ),
        diem: d(
          'Mỗi chấm là hệ số chi trả tính ở một mức của ô EPS, từ một nửa đến gấp rưỡi mức EPS bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu EPS đổi mà mức cổ tức đứng yên thì hệ số chi trả ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, các chấm bên trái cách nhau xa: lãi đã mỏng mà EPS hụt thêm một chút là phần đem chia vọt lên, dấu hiệu mức cổ tức ấy khó giữ. Sang phải các chấm sát lại, vì lãi càng dày thì mỗi đồng EPS thêm càng ít làm đổi phần đem chia.',
          'Each dot is the payout ratio at one level of the EPS field, from half to one and a half times the EPS you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on EPS with the dividend held still, not market history. The row of dots falls, far apart on the left: when profit is already thin, a small further drop in EPS sends the payout share up sharply, a sign the dividend is hard to keep. Further right the dots close up, since each extra unit of EPS shifts the payout share less once profit is thick.',
        ),
      },
    },
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Cổ tức/CP (DPS) rồi Lợi nhuận giữ lại cộng lại thành thanh sẫm cuối cùng, Lợi nhuận/CP (EPS), một số tiền khác với hệ số chi trả ở khối Kết quả vì khối ấy in tỷ lệ giữa thanh Cổ tức/CP (DPS) và thanh Lợi nhuận/CP (EPS), không phải tổng của hai thanh trên. Thanh Cổ tức/CP (DPS) càng dài thì doanh nghiệp đem phần lớn hơn trong lợi nhuận mỗi cổ phiếu ra chia, càng ít giữ lại để tái đầu tư.',
        'Each horizontal bar is one part, read from top to bottom: Dividend (DPS) then Retained earnings add up to the dark bar at the end, Earnings (EPS), a money figure different from the payout ratio in the Result block, because that block prints the ratio between the Dividend (DPS) bar and the Earnings (EPS) bar, not the sum of the two bars above. The longer the Dividend (DPS) bar, the larger the share of per-share profit the company pays out, leaving less to reinvest.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Lợi nhuận/CP (EPS) thành hai múi, Cổ tức/CP (DPS) và Lợi nhuận giữ lại, mỗi múi to theo phần nó chiếm trong lợi nhuận mỗi cổ phiếu. Lỗ giữa in Lợi nhuận/CP (EPS) cùng giá trị của nó; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Cổ tức/CP (DPS) càng lớn thì hệ số chi trả cổ tức càng cao.',
        'The ring splits Earnings (EPS) into two slices, Dividend (DPS) and Retained earnings, each sized by its share of earnings per share. The hole shows Earnings (EPS) and its value; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The bigger the Dividend (DPS) slice, the higher the dividend payout ratio.',
      ),
    },
  },
};
