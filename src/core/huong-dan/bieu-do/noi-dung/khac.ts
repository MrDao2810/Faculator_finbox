import type { BieuDoRieng } from '../types';
import { d } from './tao';

/**
 * Sáu nhóm còn lại — phái sinh (6), vay (3), tiết kiệm (5), đầu tư định kỳ (2), thuế cá nhân (1) và
 * tài chính doanh nghiệp (2): 19 công thức. Không công thức nào ở đây cần chuỗi giá để vẽ.
 */
export const BIEU_DO_KHAC: Readonly<Record<string, BieuDoRieng>> = {
  // ── Phái sinh ──────────────────────────────────────────────────────────────────────────────
  'gia-ly-thuyet-vn30f': {
    truc: {
      indexValue: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chỉ số VN30 hiện tại (S), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu chỉ số cơ sở ở mức khác thì giá hợp lý của hợp đồng là bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều và nằm sát chính chỉ số: nó nằm phía trên khi lãi suất cao hơn tỷ suất cổ tức, phía dưới khi cổ tức cao hơn. Phần chênh là chi phí giữ vị thế tới ngày đáo hạn, tức lãi suất trừ đi cổ tức.',
          'The line runs left to right along the Current VN30 index (S) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the fair contract price at another index level, not market history. The line rises steadily and hugs the index itself: it sits above when the interest rate exceeds the dividend yield, below when dividends are higher. The gap is the cost of carrying the position to expiry, interest less dividends.',
        ),
        cot: d(
          'Mỗi cột là giá lý thuyết ở một mức chỉ số, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Đem giá hợp đồng đang khớp so với đỉnh cột tô đặc: cao hơn là hợp đồng đang đắt so với lý thuyết, thấp hơn là đang rẻ.',
          'Each bar is the theoretical price at one index level; bars grow taller to the right and the solid one is the level you have entered. Set the traded contract price against the top of the solid bar: above it the contract is dear versus theory, below it cheap.',
        ),
      },
      riskFreeRate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất phi rủi ro / năm (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất đổi thì giá lý thuyết của hợp đồng ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: giữ hợp đồng thay vì giữ rổ cổ phiếu là tiết kiệm được tiền lãi của quãng thời gian tới đáo hạn, nên lãi suất càng cao thì hợp đồng càng đáng giá hơn chỉ số. Trục dọc đã phóng to sát quanh đường; mức đổi thật nhỏ so với chính chỉ số.',
          'The line runs left to right along the Risk-free rate / year (r) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the interest rate, not market history. The line rises steadily: holding the contract instead of the basket of shares saves the interest for the time left to expiry, so the higher the rate, the more the contract is worth above the index. The vertical axis is zoomed in tight around the line; the real change is small next to the index itself.',
        ),
        cot: d(
          'Mỗi cột là giá lý thuyết ở một mức lãi suất, cột tô đặc là mức bạn đang nhập. Các cột trông gần như bằng nhau vì phần chi phí nắm giữ chỉ là một lớp mỏng phủ trên chỉ số cơ sở; lớp ấy dày lên khi còn nhiều ngày tới đáo hạn.',
          'Each bar is the theoretical price at one interest rate, and the solid one is the rate you have entered. The bars look almost equal because the cost of carry is only a thin layer on top of the underlying index; that layer thickens when more days remain to expiry.',
        ),
      },
      dividendYield: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tỷ suất cổ tức rổ VN30 / năm (q), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tỷ suất cổ tức của rổ đổi thì giá lý thuyết ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: người giữ hợp đồng không nhận cổ tức mà rổ cổ phiếu chia ra, nên cổ tức càng cao thì hợp đồng càng kém giá trị so với chỉ số.',
          'The line runs left to right along the VN30 basket dividend yield / year (q) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the basket’s dividend yield, not market history. The line falls steadily: the holder of the contract does not receive the dividends the basket pays, so the higher the yield, the less the contract is worth relative to the index.',
        ),
        cot: d(
          'Mỗi cột là giá lý thuyết ở một mức tỷ suất cổ tức, cột tô đặc là mức bạn đang nhập. Các cột trông gần như bằng nhau; vào mùa chia cổ tức phần chênh này vẫn đủ để hợp đồng giao dịch thấp hơn chỉ số mà không hề bị định giá sai.',
          'Each bar is the theoretical price at one dividend yield, and the solid one is the yield you have entered. The bars look almost equal; in dividend season this difference is still enough for the contract to trade below the index without being mispriced at all.',
        ),
      },
      days: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số ngày đến đáo hạn (d), từ một nửa đến gấp rưỡi số ngày bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số ngày bạn nhập. Đây là phép thử nếu còn nhiều hay ít ngày hơn tới đáo hạn thì giá lý thuyết ra bao nhiêu, không phải diễn biến thị trường. Khi lãi suất cao hơn tỷ suất cổ tức, đường đi lên đều: càng xa đáo hạn thì chi phí nắm giữ cộng dồn càng nhiều. Khi cổ tức cao hơn lãi suất thì đường đi xuống.',
          'The line runs left to right along the Days to expiry (d) field, from half to one and a half times the number of days you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on more or fewer days left to expiry, not market history. When the interest rate is above the dividend yield the line rises steadily: the further from expiry, the more cost of carry builds up. When dividends exceed interest the line falls.',
        ),
        cot: d(
          'Mỗi cột là giá lý thuyết ứng với một số ngày còn lại, cột tô đặc là số ngày bạn đang nhập. Đọc từ phải sang trái là đọc theo thời gian trôi: càng gần đáo hạn cột càng tiến về sát chỉ số cơ sở.',
          'Each bar is the theoretical price for one number of days remaining, and the solid one is the number you have entered. Reading right to left is reading time passing: the closer to expiry, the nearer the bar settles to the underlying index.',
        ),
      },
    },
  },

  'lai-lo-vi-the-long': {
    truc: {
      entryPoints: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Điểm mở vị thế (Pmo), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu đã mua ở mức điểm khác thì lãi lỗ ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: điểm đóng giữ nguyên, mua vào càng cao thì phần chênh còn lại càng ít. Chỗ đường cắt mức 0 là lúc điểm mở bằng đúng điểm đóng.',
          'The line runs left to right along the Opening points (Pmo) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the profit or loss had you bought at another level, not market history. The line falls steadily: with the closing level held still, the higher you bought, the less of the spread is left. Where the line crosses 0 the opening level equals the closing level.',
        ),
        cot: d(
          'Mỗi cột là lãi lỗ ở một mức điểm mở, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là mua thấp hơn điểm đóng nên có lãi, cột quay xuống dưới vạch 0 là mua cao hơn nên lỗ; mỗi điểm chênh nhân với hệ số nhân và số hợp đồng thành số tiền.',
          'Each bar is the profit or loss at one opening level, and the solid one is the level you have entered. A bar standing above the zero line means buying below the close, a gain; one hanging below the zero line means buying above it, a loss; every point of difference is multiplied by the contract multiplier and the number of contracts into money.',
        ),
      },
      exitPoints: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Điểm đóng vị thế (Pdong), từ một nửa đến gấp rưỡi mức điểm bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức điểm bạn nhập. Đây là phép thử nếu đóng vị thế ở một mức điểm khác thì lãi lỗ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: vị thế mua kiếm tiền khi chỉ số tăng, mỗi điểm thêm vào đem về cùng một số tiền; đường cắt qua 0 đúng tại điểm mở vị thế.',
          'The line runs left to right along the Closing points (Pdong) field, from half to one and a half times the level you have entered; the dashed vertical line with a dot marks your own level. It is a what-if on closing the position at a different level, not market history. The line rises steadily: a long position earns when the index goes up, and every extra point brings in the same amount of money; the line crosses 0 exactly at the opening level.',
        ),
        cot: d(
          'Mỗi cột là lãi lỗ ở một mức điểm đóng, cột tô đặc là mức bạn đang nhập. Cột quay xuống dưới vạch 0 là đóng thấp hơn điểm mở, tức lỗ; cột mọc lên trên vạch 0 là lãi. Dải vẽ rộng hơn nhiều so với biến động một phiên, nên hãy nhìn các cột sát quanh cột tô đặc.',
          'Each bar is the profit or loss at one closing level, and the solid one is the level you have entered. Bars below the zero line are closes under the opening level, that is losses; bars above the zero line are gains. The range drawn is far wider than one session’s move, so look at the bars close around the solid one.',
        ),
      },
      contracts: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số hợp đồng (N), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mở nhiều hay ít hợp đồng hơn với cùng điểm mở và điểm đóng thì lãi lỗ ra bao nhiêu, không phải diễn biến thị trường. Khi vị thế đang có lãi, đường đi lên đều: số hợp đồng nhân kết quả của một hợp đồng lên. Vị thế đang lỗ thì đường đi xuống: cũng chính số hợp đồng nhân khoản lỗ lên.',
          'The line runs left to right along the Number of contracts (N) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on opening more or fewer contracts at the same opening and closing levels, not market history. On a position in profit the line rises steadily: the number of contracts multiplies the result of one contract. On a losing position the line falls: the same number multiplies the loss.',
        ),
        cot: d(
          'Mỗi cột là lãi lỗ ở một số hợp đồng, cột tô đặc là mức bạn đang nhập. Khi vị thế đang có lãi, cột cao dần về bên phải; đang lỗ thì cột quay xuống dưới và dài dần. Trục vẽ cả các mức lẻ để thành đường liền, nhưng ngoài thực tế chỉ mở được số hợp đồng nguyên.',
          'Each bar is the profit or loss at one number of contracts, and the solid one is the number you have entered. On a position in profit the bars grow taller to the right; on a losing position they hang down and grow longer. The axis draws fractional levels to make a continuous line, but in practice only whole contracts can be opened.',
        ),
      },
    },
  },

  'lai-lo-vi-the-short': {
    truc: {
      entryPoints: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Điểm mở vị thế (Pmo), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu đã bán ở mức điểm khác thì lãi lỗ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều, ngược với vị thế mua: điểm đóng giữ nguyên, bán ra càng cao thì khoảng rơi xuống điểm đóng càng lớn và lãi càng nhiều. Chỗ đường cắt mức 0 là lúc điểm mở bằng đúng điểm đóng.',
          'The line runs left to right along the Opening points (Pmo) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the profit or loss had you sold at another level, not market history. The line rises steadily, the mirror of a long position: with the closing level held still, the higher you sold, the bigger the drop down to the close and the larger the gain. Where the line crosses 0 the opening level equals the closing level.',
        ),
        cot: d(
          'Mỗi cột là lãi lỗ ở một mức điểm mở, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là bán cao hơn điểm đóng nên có lãi, cột quay xuống dưới vạch 0 là bán thấp hơn điểm đóng nên lỗ.',
          'Each bar is the profit or loss at one opening level, and the solid one is the level you have entered. A bar standing above the zero line means selling above the close, a gain; one hanging below the zero line means selling below the close, a loss.',
        ),
      },
      exitPoints: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Điểm đóng vị thế (Pdong), từ một nửa đến gấp rưỡi mức điểm bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức điểm bạn nhập. Đây là phép thử nếu đóng vị thế ở một mức điểm khác thì lãi lỗ ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều, ngược với vị thế mua: vị thế bán kiếm tiền khi chỉ số giảm, nên đóng càng cao thì càng mất; đường cắt qua 0 đúng tại điểm mở vị thế.',
          'The line runs left to right along the Closing points (Pdong) field, from half to one and a half times the level you have entered; the dashed vertical line with a dot marks your own level. It is a what-if on closing the position at a different level, not market history. The line falls steadily, the mirror image of a long position: a short earns when the index goes down, so the higher you close, the more you lose; the line crosses 0 exactly at the opening level.',
        ),
        cot: d(
          'Mỗi cột là lãi lỗ của vị thế bán ở một mức điểm đóng, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 ở bên trái là đóng thấp hơn điểm mở, tức lãi; cột quay xuống dưới vạch 0 ở bên phải là lỗ, và phía ấy không có giới hạn vì chỉ số có thể tăng mãi.',
          'Each bar is the short position’s profit or loss at one closing level, and the solid one is the level you have entered. Bars above the zero line on the left are closes under the opening level, that is gains; bars below the zero line on the right are losses, and that side has no limit because the index can keep climbing.',
        ),
      },
      contracts: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số hợp đồng (N), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu bán nhiều hay ít hợp đồng hơn với cùng điểm mở và điểm đóng thì lãi lỗ ra bao nhiêu, không phải diễn biến thị trường. Khi vị thế bán đang có lãi, đường đi lên đều: mỗi hợp đồng thêm vào đem về cùng một khoản. Nếu chỉ số đi ngược dự tính thì đường đi xuống: từng hợp đồng thêm vào cũng lỗ thêm đúng khoản ấy.',
          'The line runs left to right along the Number of contracts (N) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on selling more or fewer contracts at the same opening and closing levels, not market history. On a short position in profit the line rises steadily: each extra contract brings in the same amount. If the index moves against you the line falls: each extra contract loses that same amount too.',
        ),
        cot: d(
          'Mỗi cột là lãi lỗ của vị thế bán ở một số hợp đồng, cột tô đặc là mức bạn đang nhập. Khi vị thế đang có lãi, cột cao dần về bên phải; đang lỗ thì cột quay xuống dưới và dài dần. Chiều dài cột chia cho số hợp đồng luôn ra cùng một con số: lãi lỗ của một hợp đồng.',
          'Each bar is the short position’s profit or loss at one number of contracts, and the solid one is the number you have entered. On a position in profit the bars grow taller to the right; on a losing position they hang down and grow longer. Bar length divided by the number of contracts always gives the same figure: the result of one contract.',
        ),
      },
    },
  },

  'so-hop-dong-toi-da': {
    truc: {
      capital: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn ký quỹ (V), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu có số tiền ký quỹ khác thì mở được tối đa bao nhiêu hợp đồng, không phải diễn biến thị trường. Đường đi lên thành từng bậc chứ không trơn: không mở được một phần hợp đồng, nên phải thêm đủ tiền ký quỹ cho cả một hợp đồng thì đường mới nhảy lên một nấc.',
          'The line runs left to right along the Margin capital (V) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the most contracts you could open with another amount of margin, not market history. The line rises in steps instead of a smooth slope: a fraction of a contract cannot be opened, so it jumps one notch only once the margin for a whole contract has been added.',
        ),
        cot: d(
          'Mỗi cột là số hợp đồng tối đa ở một mức vốn ký quỹ, cột tô đặc là mức bạn đang nhập. Nhiều cột liền nhau cao bằng nhau là quãng vốn tăng mà chưa đủ thêm một hợp đồng; phần vốn dôi ra trong quãng ấy không mở thêm được gì, nó chỉ làm dày phần đệm ký quỹ.',
          'Each bar is the maximum number of contracts at one level of margin, and the solid one is the level you have entered. Several neighboring bars of equal height are a stretch where capital grew without yet covering one more contract; the surplus in that stretch opens nothing more, it only thickens the margin cushion.',
        ),
      },
      futuresPoints: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Điểm hợp đồng tương lai (F), từ một nửa đến gấp rưỡi mức điểm bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức điểm bạn nhập. Đây là phép thử nếu hợp đồng giao dịch ở một mức điểm khác thì số hợp đồng tối đa ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống theo từng bậc thang: điểm càng cao thì mỗi hợp đồng càng đắt và ký quỹ cho nó càng lớn, còn bậc thang là do số hợp đồng phải làm tròn xuống số nguyên.',
          'The line runs left to right along the Futures contract points (F) field, from half to one and a half times the level you have entered; the dashed vertical line with a dot marks your own level. It is a what-if on the contract trading at a different level, not market history. The line falls in steps: the higher the level, the more each contract is worth and the more margin it needs, and the steps come from rounding the count down to a whole contract.',
        ),
        cot: d(
          'Mỗi cột là số hợp đồng tối đa ở một mức điểm, cột tô đặc là mức bạn đang nhập. Nhiều cột liền nhau cao bằng nhau rồi mới tụt một bậc: trong quãng ấy điểm tăng chưa đủ để lấy mất trọn một hợp đồng.',
          'Each bar is the maximum number of contracts at one level, and the solid one is the level you have entered. Several neighboring bars stay level and then drop one step: across that stretch the level has not risen enough to cost you a whole contract.',
        ),
      },
      marginRatio: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tỷ lệ ký quỹ ban đầu (k), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tỷ lệ ký quỹ đổi thì số hợp đồng tối đa ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống theo từng bậc thang: tỷ lệ ký quỹ càng cao thì mỗi hợp đồng giữ lại càng nhiều tiền, nên cùng số vốn ấy mở được ít hợp đồng hơn.',
          'The line runs left to right along the Initial margin ratio (k) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the margin ratio, not market history. The line falls in steps: the higher the margin ratio, the more money each contract ties up, so the same capital opens fewer contracts.',
        ),
        cot: d(
          'Mỗi cột là số hợp đồng tối đa ở một tỷ lệ ký quỹ, cột tô đặc là tỷ lệ bạn đang nhập. Công ty chứng khoán nâng tỷ lệ ký quỹ là bạn bị đẩy sang các cột thấp bên phải ngay cả khi vốn không đổi.',
          'Each bar is the maximum number of contracts at one margin ratio, and the solid one is the ratio you have entered. When the broker raises the margin ratio you are pushed to the lower bars on the right even though your capital has not changed.',
        ),
      },
    },
  },

  'co-vi-the-phai-sinh': {
    truc: {
      capital: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn tài khoản phái sinh (V), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu vốn tài khoản khác đi thì được mở bao nhiêu hợp đồng cho cùng mức rủi ro mỗi lệnh, không phải diễn biến thị trường. Đường đi lên thành từng bậc: số hợp đồng phải là số nguyên và luôn làm tròn xuống, nên vốn tăng một quãng thì đường mới nhảy một nấc.',
          'The line runs left to right along the Derivatives account capital (V) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on how many contracts another account size allows for the same risk per trade, not market history. The line rises in steps: the number of contracts must be whole and is always rounded down, so capital has to grow a stretch before the line jumps one notch.',
        ),
        cot: d(
          'Mỗi cột là số hợp đồng được phép mở ở một mức vốn, cột tô đặc là mức bạn đang nhập. Các cột liền nhau cao bằng nhau là quãng vốn chưa đủ cho thêm một hợp đồng; trong quãng ấy lệnh thật ra đang chịu rủi ro thấp hơn mức bạn đặt.',
          'Each bar is the number of contracts allowed at one capital level, and the solid one is the level you have entered. Neighboring bars of equal height are a stretch where capital does not yet cover one more contract; within it the trade actually carries less risk than the limit you set.',
        ),
      },
      riskPercent: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Rủi ro mỗi lệnh (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu chấp nhận mất nhiều hay ít hơn cho một lệnh thì số hợp đồng ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên theo từng bậc thang: phần vốn cho phép mất càng lớn thì càng mở được nhiều hợp đồng, còn bậc thang là do số hợp đồng làm tròn xuống số nguyên.',
          'The line runs left to right along the Risk per trade (r) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on accepting a larger or smaller loss per trade, not market history. The line rises in steps: the more of your capital you allow one trade to lose, the more contracts you can open, and the steps come from rounding down to a whole contract.',
        ),
        cot: d(
          'Mỗi cột là số hợp đồng ở một mức rủi ro mỗi lệnh, cột tô đặc là mức bạn đang nhập. Cột cao hơn không phải cơ hội lớn hơn: nó chỉ nói rằng nếu lệnh chạm cắt lỗ thì bạn mất phần vốn lớn hơn.',
          'Each bar is the number of contracts at one risk per trade, and the solid one is the level you have entered. A taller bar is not a bigger opportunity: it only says that if the stop is hit you lose a larger part of your capital.',
        ),
      },
      stopPoints: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Khoảng cách cắt lỗ (ΔP), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu đặt cắt lỗ xa hay gần hơn thì số hợp đồng ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống theo từng bậc thang và thoải dần: cắt lỗ càng xa thì mỗi hợp đồng có thể mất càng nhiều, nên phải mở ít hợp đồng hơn để tổng mức mất không đổi.',
          'The line runs left to right along the Stop-loss distance (ΔP) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on placing the stop further away or closer, not market history. The line falls in steps and flattens: the wider the stop, the more each contract can lose, so fewer contracts keep the total loss the same.',
        ),
        cot: d(
          'Mỗi cột là số hợp đồng ở một khoảng cách cắt lỗ, cột tô đặc là khoảng cách bạn đang nhập. Các cột cao bên trái trông hấp dẫn, nhưng cắt lỗ đặt quá sát dễ bị chạm bởi dao động thường ngày trước khi xu hướng kịp chạy.',
          'Each bar is the number of contracts at one stop distance, and the solid one is the distance you have entered. The tall bars on the left look attractive, but a stop set too tight is easily hit by ordinary noise before the trend has room to run.',
        ),
      },
    },
  },

  'don-bay-hieu-dung': {
    truc: {
      futuresPoints: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Điểm hợp đồng tương lai (F), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu hợp đồng ở mức điểm khác thì đòn bẩy ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: số hợp đồng và vốn thực có giữ nguyên, điểm hợp đồng càng cao thì giá trị vị thế càng lớn so với số tiền bạn thật sự có.',
          'The line runs left to right along the Futures contract points (F) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on leverage at another contract level, not market history. The line rises steadily: with the number of contracts and your own capital held still, a higher contract level makes the position larger against the money you really have.',
        ),
        cot: d(
          'Mỗi cột là đòn bẩy hiệu dụng ở một mức điểm, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột cũng là số lần mà mỗi phần trăm biến động của chỉ số được khuếch đại lên tài khoản.',
          'Each bar is the effective leverage at one contract level; bars grow taller to the right and the solid one is the level you have entered. Bar height is also how many times each percent the index moves is magnified onto your account.',
        ),
      },
      contracts: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số hợp đồng (N), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu giữ nhiều hay ít hợp đồng hơn với cùng số vốn thì đòn bẩy ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: mỗi hợp đồng thêm vào cộng thêm một khối giá trị danh nghĩa như nhau lên cùng một số vốn.',
          'The line runs left to right along the Number of contracts (N) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on holding more or fewer contracts on the same capital, not market history. The line rises steadily: every extra contract stacks the same block of notional value onto the same capital.',
        ),
        cot: d(
          'Mỗi cột là đòn bẩy ở một số hợp đồng, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột cũng là số lần biến động của chỉ số được nhân lên trên vốn của bạn, theo cả chiều lãi lẫn chiều lỗ.',
          'Each bar is the leverage at one number of contracts; bars grow taller to the right and the solid one is the number you have entered. Bar height is also how many times a move in the index is multiplied on your capital, for gains and losses alike.',
        ),
      },
      equity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn thực có trong tài khoản (E), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu vốn trong tài khoản nhiều hay ít hơn mà vị thế giữ nguyên thì đòn bẩy ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: vốn càng dày thì cùng một vị thế càng nhẹ so với nó. Đọc từ phải sang trái là cảnh thua lỗ ăn dần vào vốn: đòn bẩy tự phình ra dù bạn không mở thêm hợp đồng nào.',
          'The line runs left to right along the Actual equity in the account (E) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on more or less capital in the account with the position unchanged, not market history. The line falls and flattens: the thicker the capital, the lighter the same position weighs on it. Read right to left it is losses eating into your capital: leverage swells by itself though you open no new contract.',
        ),
        cot: d(
          'Mỗi cột là đòn bẩy ở một mức vốn, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Các cột bên trái cao lên rất nhanh: mất một nửa vốn là đòn bẩy gấp đôi.',
          'Each bar is the leverage at one capital level; bars shrink to the right and the solid one is the level you have entered. The bars on the left climb very fast: losing half the capital doubles the leverage.',
        ),
      },
    },
  },

  // ── Vay ────────────────────────────────────────────────────────────────────────────────────
  'tra-gop-nien-kim': {
    truc: {
      amount: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số tiền vay (P), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu vay nhiều hơn hay ít hơn thì mỗi tháng phải trả bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: lãi suất và kỳ hạn giữ nguyên, vay thêm bao nhiêu phần thì khoản trả hằng tháng nặng thêm đúng bấy nhiêu phần.',
          'The line runs left to right along the Loan amount (P) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the monthly payment for a larger or smaller loan, not market history. The line rises steadily: with the rate and term held still, the monthly payment grows in exact proportion to the amount borrowed.',
        ),
        cot: d(
          'Mỗi cột là khoản trả hằng tháng ở một mức tiền vay, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Đem đỉnh cột so với phần thu nhập bạn dành được mỗi tháng để tìm mức vay cao nhất còn kham nổi.',
          'Each bar is the monthly payment at one loan amount; bars grow taller to the right and the solid one is the amount you have entered. Set the top of a bar against what you can spare each month to find the largest loan you can still carry.',
        ),
      },
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất vay đổi thì khoản trả hằng tháng ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và hơi dốc dần: lãi suất càng cao thì phần lãi trong mỗi kỳ trả càng lớn. Với khoản vay lãi thả nổi, đây là hình cho thấy khoản trả hằng tháng sẽ đổi ra sao khi ngân hàng điều chỉnh lãi suất.',
          'The line runs left to right along the Interest rate / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the loan rate, not market history. The line rises and steepens slightly: the higher the rate, the larger the interest part of every payment. For a floating-rate loan this is the picture of how the monthly payment moves when the bank resets the rate.',
        ),
        cot: d(
          'Mỗi cột là khoản trả hằng tháng ở một mức lãi suất, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. So cột tô đặc với một cột bên phải nó là biết mỗi tháng phải xoay thêm bao nhiêu tiền nếu lãi suất lên tới mức ấy.',
          'Each bar is the monthly payment at one interest rate; bars grow taller to the right and the solid one is the rate you have entered. Comparing the solid bar with one on its right tells you how much more you must find each month if the rate climbs that far.',
        ),
      },
      years: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Kỳ hạn, từ một nửa đến gấp rưỡi số năm bạn đang nhập, mỗi điểm cách nhau một năm; vạch đứt dọc có chấm tròn là đúng số năm bạn nhập. Đây là phép thử nếu vay dài hay ngắn hơn thì khoản trả hằng tháng ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: kéo dài kỳ hạn thì gốc chia mỏng ra nên mỗi tháng nhẹ đi, nhưng càng kéo dài càng nhẹ thêm ít, vì tiền lãi chiếm phần ngày càng lớn trong khoản trả.',
          'The line runs left to right along the Term field, from half to one and a half times the number of years you have entered, one point per year; the dashed vertical line with a dot marks your own figure. It is a what-if on borrowing for longer or shorter, not market history. The line falls and flattens: a longer term spreads the principal thinner so each month is lighter, but every further year lightens it less, because interest takes a growing part of the payment.',
        ),
        cot: d(
          'Mỗi cột là khoản trả hằng tháng ứng với một kỳ hạn, cột thấp dần về bên phải và cột tô đặc là kỳ hạn bạn đang nhập. Cột thấp bên phải dễ thở hơn mỗi tháng nhưng tổng tiền lãi cả đời khoản vay lại lớn hơn; hình này không cho thấy cái giá ấy.',
          'Each bar is the monthly payment for one term; bars shrink to the right and the solid one is the term you have entered. A short bar on the right is easier each month, but the total interest over the life of the loan is larger; this chart does not show that cost.',
        ),
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. Gốc kỳ đầu và Lãi kỳ đầu là hai thanh tô màu cộng lại với nhau; thanh sẫm cuối cùng là Trả kỳ đầu và bằng đúng con số ở khối Kết quả. Ở kỳ đầu thanh lãi thường dài hơn thanh gốc: khoản trả tháng nào cũng như nhau, nhưng những tháng đầu phần lớn số tiền ấy đi trả lãi, về sau mới chuyển dần sang trả gốc.',
      'This chart has a single form: horizontal bars, read from top to bottom. First-period principal and First-period interest are two filled bars that add together; the dark bar at the end is First-period payment and matches the figure in the Result block exactly. In the first period the interest bar is usually longer than the principal bar: the payment is the same every month, but early on most of it goes to interest and only later shifts toward principal.',
    ),
  },

  'tra-gop-goc-deu': {
    truc: {
      amount: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số tiền vay (P), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu vay nhiều hơn hay ít hơn thì kỳ đầu phải trả bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cả phần gốc chia đều lẫn phần lãi kỳ đầu đều tính trên số tiền vay, nên vay thêm bao nhiêu phần thì kỳ đầu nặng thêm bấy nhiêu phần.',
          'The line runs left to right along the Loan amount (P) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the first payment for a larger or smaller loan, not market history. The line rises steadily: both the even principal slice and the first interest are worked out on the amount borrowed, so the first payment grows in exact proportion to it.',
        ),
        cot: d(
          'Mỗi cột là khoản trả kỳ đầu ở một mức tiền vay, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Với lãi suất giữ nguyên, đây là kỳ NẶNG NHẤT của cả khoản vay: các kỳ sau lãi giảm dần theo dư nợ, nên kham được đỉnh cột này là kham được mọi kỳ còn lại.',
          'Each bar is the first payment at one loan amount; bars grow taller to the right and the solid one is the amount you have entered. As long as the rate stays the same, this is the HEAVIEST payment of the whole loan: later ones carry less interest as the balance falls, so being able to afford the top of this bar means affording all the rest.',
        ),
      },
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất vay đổi thì khoản trả kỳ đầu ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: kỳ đầu gồm một phần gốc cố định cộng tiền lãi tính trên toàn bộ số tiền vay, nên lãi suất tăng một điểm thì kỳ đầu nặng thêm đúng một khoản như nhau.',
          'The line runs left to right along the Interest rate / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the loan rate, not market history. The line rises steadily: the first payment is a fixed slice of principal plus interest on the whole amount borrowed, so each extra point of rate adds the same amount to it.',
        ),
        cot: d(
          'Mỗi cột là khoản trả kỳ đầu ở một mức lãi suất, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Lãi suất giữ nguyên thì kỳ đầu là kỳ nặng nhất của cách trả gốc đều; các kỳ sau nhẹ dần vì dư nợ giảm, nên chiều cao cột là mức đỉnh bạn phải lo được.',
          'Each bar is the first payment at one interest rate; bars grow taller to the right and the solid one is the rate you have entered. At an unchanged rate the first payment is the heaviest under equal principal; later ones get lighter as the balance falls, so bar height is the peak you must be able to meet.',
        ),
      },
      years: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Kỳ hạn, từ một nửa đến gấp rưỡi số năm bạn đang nhập, mỗi điểm cách nhau một năm; vạch đứt dọc có chấm tròn là đúng số năm bạn nhập. Đây là phép thử nếu vay dài hay ngắn hơn thì khoản trả kỳ đầu ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: kỳ hạn dài hơn chỉ làm phần gốc mỗi tháng nhỏ lại, còn tiền lãi kỳ đầu vẫn tính trên toàn bộ số vay nên không đổi; đường vì thế không bao giờ xuống dưới mức tiền lãi ấy.',
          'The line runs left to right along the Term field, from half to one and a half times the number of years you have entered, one point per year; the dashed vertical line with a dot marks your own figure. It is a what-if on borrowing for longer or shorter, not market history. The line falls and flattens: a longer term only shrinks the monthly slice of principal, while the first month’s interest is still charged on the whole loan and does not change; the line therefore never drops below that interest.',
        ),
        cot: d(
          'Mỗi cột là khoản trả kỳ đầu ứng với một kỳ hạn, cột thấp dần về bên phải và cột tô đặc là kỳ hạn bạn đang nhập. Phần cột không co lại được dù kéo dài kỳ hạn tới đâu chính là tiền lãi của tháng đầu tiên.',
          'Each bar is the first payment for one term; bars shrink to the right and the solid one is the term you have entered. The part of a bar that will not shrink however long the term is stretched is the first month’s interest.',
        ),
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. Gốc mỗi kỳ và Lãi kỳ đầu là hai thanh tô màu cộng lại với nhau; thanh sẫm cuối cùng là Trả kỳ đầu và bằng đúng con số ở khối Kết quả. Thanh gốc giữ nguyên chiều dài ở mọi kỳ, còn thanh lãi chỉ đúng cho kỳ đầu: từ kỳ thứ hai nó ngắn dần vì lãi tính trên dư nợ đã giảm.',
      'This chart has a single form: horizontal bars, read from top to bottom. Principal per period and First-period interest are two filled bars that add together; the dark bar at the end is First-period payment and matches the figure in the Result block exactly. The principal bar keeps its length in every period, while the interest bar holds for the first one only: from the second period on it shortens because interest is charged on a shrinking balance.',
    ),
  },

  'lich-tra-no': {
    truc: {
      amount: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số tiền vay, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu vay nhiều hay ít hơn với cùng lãi suất và kỳ hạn thì tổng tiền lãi ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: lãi tính trên dư nợ, nên vay gấp đôi thì cả đời khoản vay trả lãi gấp đôi.',
          'The line runs left to right along the Loan amount field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on borrowing more or less at the same rate and term, not market history. The line rises steadily: interest is charged on the balance, so borrowing twice as much means paying twice the interest over the life of the loan.',
        ),
        cot: d(
          'Mỗi cột là tổng tiền lãi ở một mức tiền vay, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Đặt chiều cao cột cạnh chính số tiền vay của nó là thấy tiền lãi cả kỳ hạn lớn cỡ nào so với gốc.',
          'Each bar is the total interest at one loan amount; bars grow taller to the right and the solid one is the amount you have entered. Set a bar’s height beside its own loan amount to see how large the lifetime interest is next to the principal.',
        ),
      },
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Trục dọc là TỔNG TIỀN LÃI của cả khoản vay. Đây là phép thử nếu lãi suất khác đi thì cả kỳ hạn phải trả bao nhiêu tiền lãi, không phải diễn biến thị trường. Đường đi lên, và với cách trả niên kim thì càng lúc càng dốc: lãi suất cao hơn làm dư nợ giảm chậm hơn, nên mỗi điểm lãi suất thêm vào tốn nhiều hơn điểm trước đó. Với cách trả gốc đều thì đường thẳng, vì dư nợ giảm theo một nhịp cố định.',
          'The line runs left to right along the Interest rate / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. The vertical axis is the TOTAL INTEREST of the whole loan. It is a what-if on the interest paid over the full term at another rate, not market history. The line rises, and under the annuity method it keeps steepening: a higher rate makes the balance fall more slowly, so each extra point of rate costs more than the one before. Under equal principal the line is straight, as the balance falls at a fixed pace.',
        ),
        cot: d(
          'Mỗi cột là tổng tiền lãi ở một mức lãi suất, cột cao dần về bên phải, và với cách trả niên kim thì mỗi cột thêm nhiều hơn cột trước; cột tô đặc là mức bạn đang nhập. Chênh lệch giữa cột tô đặc và cột ngay bên trái nó là số tiền tiết kiệm được nếu thương lượng lãi suất xuống một nấc.',
          'Each bar is the total interest at one rate; bars grow taller to the right, and under the annuity method each adds more than the one before; the solid one is the rate you have entered. The gap between the solid bar and the one just left of it is the money saved by bargaining the rate down one notch.',
        ),
      },
      years: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Kỳ hạn, từ một nửa đến gấp rưỡi số năm bạn đang nhập, mỗi điểm cách nhau một năm; vạch đứt dọc có chấm tròn là đúng số năm bạn nhập. Đây là phép thử nếu vay dài hay ngắn hơn thì tổng tiền lãi ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên: vay càng lâu thì lãi cộng dồn qua càng nhiều kỳ. Với cách trả niên kim đường còn dốc dần, vì dư nợ càng chậm giảm nên mỗi năm kéo dài thêm tốn nhiều lãi hơn năm trước đó; với cách trả gốc đều thì mỗi năm thêm tốn một khoản lãi như nhau.',
          'The line runs left to right along the Term field, from half to one and a half times the number of years you have entered, one point per year; the dashed vertical line with a dot marks your own figure. It is a what-if on borrowing for longer or shorter, not market history. The line rises: the longer the loan, the more periods interest builds over. Under the annuity method it also steepens, because the balance falls more slowly and each extra year costs more interest than the year before; under equal principal each extra year costs the same amount of interest.',
        ),
        cot: d(
          'Mỗi cột là tổng tiền lãi ứng với một kỳ hạn, cột cao dần về bên phải và cột tô đặc là kỳ hạn bạn đang nhập. Đây là mặt còn lại của khoản trả hằng tháng nhẹ đi: kéo dài kỳ hạn là đổi sự dễ thở mỗi tháng lấy cột cao hơn ở đây.',
          'Each bar is the total interest for one term; bars grow taller to the right and the solid one is the term you have entered. This is the other side of a lighter monthly payment: stretching the term trades monthly comfort for a taller bar here.',
        ),
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. Tổng phải trả là thanh tô màu, toàn bộ số tiền bạn đưa cho bên cho vay trong cả kỳ hạn; Trừ gốc vay là thanh viền nét đứt, số tiền bạn đã nhận lúc đầu; thanh sẫm cuối cùng là Tổng lãi và bằng đúng con số ở khối Kết quả. Thanh cuối so với thanh giữa cho biết tiền lãi đang bằng bao nhiêu phần của chính khoản vay.',
      'This chart has a single form: horizontal bars, read from top to bottom. Total repaid is the filled bar, everything you hand the lender over the full term; Less loan principal is the bar with a dashed outline, the money you received at the start; the dark bar at the end is Total interest and matches the figure in the Result block exactly. The last bar against the middle one shows how large the interest is as a part of the loan itself.',
    ),
  },

  // ── Tiết kiệm ──────────────────────────────────────────────────────────────────────────────
  'lai-kep': {
    truc: {
      principal: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số tiền gốc (P), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu gửi số tiền khác thì cuối kỳ có bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: lãi suất và thời gian giữ nguyên, gốc lớn hơn bao nhiêu phần thì số tiền cuối lớn hơn bấy nhiêu phần. Muốn thấy đường cong của lãi kép thì chọn Thời gian ở ô Xem theo.',
          'The line runs left to right along the Principal amount (P) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the ending amount for a different deposit, not market history. The line rises steadily: with the rate and the time held still, the ending amount grows in exact proportion to the principal. To see the curve of compounding itself, pick Time in the row that sets the horizontal axis.',
        ),
        cot: d(
          'Mỗi cột là số tiền cuối kỳ ở một mức tiền gốc, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Mọi cột đều cao hơn số gốc nó đại diện; phần cao thêm ấy là toàn bộ tiền lãi, kể cả lãi sinh trên lãi.',
          'Each bar is the ending amount at one principal; bars grow taller to the right and the solid one is the amount you have entered. Every bar is taller than the principal it stands for; that extra height is all the interest, interest on interest included.',
        ),
      },
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất / năm (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất đổi thì số tiền cuối kỳ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc dần: lãi nhập gốc rồi lại sinh lãi, nên mỗi điểm lãi suất thêm vào đem lại nhiều hơn điểm trước đó.',
          'The line runs left to right along the Interest rate / year (r) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the interest rate, not market history. The line rises and steepens: interest joins the principal and earns interest in turn, so each extra point of rate brings more than the point before.',
        ),
        cot: d(
          'Mỗi cột là số tiền cuối kỳ ở một mức lãi suất, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chênh lệch giữa hai cột trông nhỏ ở lãi suất nhưng là tiền thật sau nhiều năm, và càng gửi lâu khoảng chênh ấy càng giãn ra.',
          'Each bar is the final amount at one interest rate; bars grow taller to the right and the solid one is the rate you have entered. The difference between two bars looks small in rate terms but is real money after many years, and the longer the money stays, the wider that gap opens.',
        ),
      },
      years: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thời gian (t), từ một nửa đến gấp rưỡi số năm bạn đang nhập, mỗi điểm cách nhau một năm; vạch đứt dọc có chấm tròn là đúng số năm bạn nhập. Đây là phép thử nếu để tiền lâu hay chóng hơn thì số tiền cuối kỳ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc dần: mỗi năm sau tính lãi trên một số gốc đã lớn hơn năm trước, nên những năm cuối đóng góp nhiều nhất.',
          'The line runs left to right along the Time (t) field, from half to one and a half times the number of years you have entered, one point per year; the dashed vertical line with a dot marks your own figure. It is a what-if on leaving the money for longer or shorter, not market history. The line rises and steepens: each later year earns interest on a principal already larger than the year before, so the final years contribute the most.',
        ),
        cot: d(
          'Mỗi cột là số tiền cuối kỳ ứng với một số năm, cột cao dần về bên phải và cột tô đặc là số năm bạn đang nhập. Rút sớm vài năm là bỏ đúng những cột cao nhất, tức bỏ phần lãi kép lớn nhất.',
          'Each bar is the final amount for one number of years; bars grow taller to the right and the solid one is the number you have entered. Withdrawing a few years early gives up exactly the tallest bars, that is the largest part of the compounding.',
        ),
      },
    },
  },

  'lai-tien-gui': {
    truc: {
      principal: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số tiền gửi (P), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu gửi số tiền khác thì nhận bao nhiêu tiền lãi, không phải diễn biến thị trường. Đường đi lên đều và là một đường thẳng: tiền lãi là một tỷ lệ cố định của số tiền gửi, nên gửi gấp đôi thì tiền lãi đúng gấp đôi.',
          'The line runs left to right along the Deposit amount (P) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the interest earned by a different deposit, not market history. The line rises steadily and is perfectly straight: the interest is a fixed share of the deposit, so twice the deposit earns exactly twice the interest.',
        ),
        cot: d(
          'Mỗi cột là tiền lãi ở một mức tiền gửi, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột chỉ là phần lãi, chưa gồm tiền gốc bạn nhận lại khi đáo hạn.',
          'Each bar is the interest at one deposit amount; bars grow taller to the right and the solid one is the amount you have entered. Bar height is the interest alone, without the principal you get back at maturity.',
        ),
      },
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất / năm (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất tiền gửi đổi thì tiền lãi ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: đây là lãi đơn, nên lãi suất tăng bao nhiêu phần thì tiền lãi tăng đúng bấy nhiêu phần.',
          'The line runs left to right along the Interest rate / year (r) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the deposit rate, not market history. The line rises steadily: this is simple interest, so the interest earned grows in exact proportion to the rate.',
        ),
        cot: d(
          'Mỗi cột là tiền lãi ở một mức lãi suất, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Khoảng cách giữa hai cột là số tiền chênh nếu gửi ở ngân hàng trả cao hơn hay thấp hơn một bậc.',
          'Each bar is the interest at one deposit rate; bars grow taller to the right and the solid one is the rate you have entered. The gap between two bars is the money gained or lost by depositing with a bank that pays one step more or less.',
        ),
      },
      months: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Kỳ hạn (T), từ một nửa đến gấp rưỡi số tháng bạn đang nhập, mỗi điểm cách nhau một tháng; vạch đứt dọc có chấm tròn là đúng số tháng bạn nhập. Đây là phép thử nếu gửi dài hay ngắn hơn với cùng lãi suất thì tiền lãi ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: lãi đơn cộng thêm một khoản bằng nhau cho mỗi tháng gửi. Ngoài thực tế kỳ hạn dài thường có lãi suất khác, điều phép tính này không tự đổi theo.',
          'The line runs left to right along the Term (T) field, from half to one and a half times the number of months you have entered, one point per month; the dashed vertical line with a dot marks your own figure. It is a what-if on a longer or shorter deposit at the same rate, not market history. The line rises steadily: simple interest adds the same amount for every month deposited. In practice longer terms usually carry a different rate, which this calculation does not change by itself.',
        ),
        cot: d(
          'Mỗi cột là tiền lãi ứng với một kỳ hạn, cột cao dần về bên phải và cột tô đặc là kỳ hạn bạn đang nhập. Các cột cách đều nhau, mỗi bước là tiền lãi của đúng một tháng.',
          'Each bar is the interest for one term; bars grow taller to the right and the solid one is the term you have entered. The bars are evenly spaced, each step being exactly one month of interest.',
        ),
      },
    },
  },

  'tiet-kiem-muc-tieu': {
    truc: {
      target: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số tiền mục tiêu (FV), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mục tiêu lớn hay nhỏ hơn thì mỗi tháng phải gửi bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cùng thời gian và lãi suất, mục tiêu gấp đôi thì mỗi tháng phải gửi gấp đôi.',
          'The line runs left to right along the Target amount (FV) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a larger or smaller goal, not market history. The line rises steadily: over the same time and at the same rate, twice the goal needs twice the monthly deposit.',
        ),
        cot: d(
          'Mỗi cột là số tiền phải gửi mỗi tháng ở một mức mục tiêu, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Tìm cột cao ngang số tiền bạn thật sự để dành được mỗi tháng, rồi nhìn xuống trục ngang là thấy mục tiêu vừa sức.',
          'Each bar is the monthly deposit needed at one target; bars grow taller to the right and the solid one is the target you have entered. Find the bar level with what you can really set aside each month, then look down at the horizontal axis to see the goal within reach.',
        ),
      },
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất kỳ vọng / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất kỳ vọng đổi thì mỗi tháng phải gửi bao nhiêu, không phải diễn biến thị trường. Đường đi xuống: lãi suất càng cao thì tiền lãi gánh hộ càng nhiều, nên phần bạn tự bỏ ra mỗi tháng càng nhẹ.',
          'The line runs left to right along the Expected interest rate / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the expected rate, not market history. The line falls: the higher the rate, the more of the goal interest carries for you, so the lighter your own monthly deposit.',
        ),
        cot: d(
          'Mỗi cột là số tiền phải gửi mỗi tháng ở một mức lãi suất, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Lãi suất là thứ bạn không quyết được, nên lập kế hoạch theo một cột lệch về bên trái thì an toàn hơn.',
          'Each bar is the monthly deposit needed at one interest rate; bars shrink to the right and the solid one is the rate you have entered. The rate is not yours to decide, so planning on a bar somewhat to the left is the safer choice.',
        ),
      },
      months: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thời gian (n), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu cho mình nhiều hay ít thời gian hơn thì mỗi tháng phải gửi bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: thời gian càng dài thì mỗi tháng phải gửi càng ít, vừa vì chia cho nhiều tháng hơn vừa vì tiền lãi gánh hộ một phần; càng về sau mỗi tháng thêm vào giảm được càng ít.',
          'The line runs left to right along the Time (n) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the monthly deposit if you gave yourself more or less time, not market history. The line falls and flattens: the longer the time, the smaller each monthly deposit, both because it is spread over more months and because interest carries part of the load; each extra month saves less than the one before.',
        ),
        cot: d(
          'Mỗi cột là số tiền phải gửi mỗi tháng ứng với một quãng thời gian, cột thấp dần về bên phải và cột tô đặc là quãng bạn đang nhập. Tìm cột có đỉnh vừa với số tiền bạn để dành được mỗi tháng: chân cột ấy là thời gian thực tế để tới mục tiêu.',
          'Each bar is the monthly deposit for one length of time; bars shrink to the right and the solid one is the length you have entered. Find the bar whose top matches what you can set aside each month: its position is the realistic time to reach the goal.',
        ),
      },
    },
  },

  'rut-truoc-han': {
    truc: {
      principal: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số tiền gửi (P), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số tiền gửi khác đi thì tiền lãi thực nhận khi rút trước hạn ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: lãi không kỳ hạn tính thẳng trên số tiền gửi, nên gửi gấp đôi thì nhận gấp đôi.',
          'The line runs left to right along the Deposit amount (P) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different deposit, not market history. The line rises steadily: demand-deposit interest is worked out straight on the amount deposited, so twice the deposit earns twice as much.',
        ),
        cot: d(
          'Mỗi cột là tiền lãi thực nhận ở một mức tiền gửi, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột nào cũng rất thấp so với chính số tiền gửi của nó: rút trước hạn thì gần như chỉ lấy lại gốc.',
          'Each bar is the interest actually received at one deposit amount; bars grow taller to the right and the solid one is the amount you have entered. Every bar is very short next to its own deposit: withdrawing early returns little more than the principal.',
        ),
      },
      contractRate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất hợp đồng / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất ghi trên sổ khác đi thì tiền lãi thực nhận ra bao nhiêu, không phải diễn biến thị trường. Đường nằm ngang: rút trước hạn thì ngân hàng trả theo lãi suất không kỳ hạn, nên lãi suất hợp đồng cao hay thấp không làm đổi số tiền bạn nhận. Ô này chỉ quyết định phần lãi bị mất, xem ở hình bóc tách.',
          'The line runs left to right along the Contract rate / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different rate written in the passbook, not market history. The line is flat: on early withdrawal the bank pays the demand-deposit rate, so a higher or lower contract rate does not change what you receive. This field only decides the interest you lose, which the breakdown chart shows.',
        ),
        cot: d(
          'Mỗi cột là tiền lãi thực nhận ở một mức lãi suất hợp đồng, và các cột cao bằng nhau; cột tô đặc là mức bạn đang nhập. Dãy cột bằng phẳng nói đúng điều khoản rút trước hạn: lãi suất đã thoả thuận không còn được áp dụng.',
          'Each bar is the interest actually received at one contract rate, and all the bars are the same height; the solid one is the rate you have entered. The level row states the early-withdrawal clause exactly: the agreed rate no longer applies.',
        ),
      },
      termMonths: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Kỳ hạn hợp đồng, từ một nửa đến gấp rưỡi số tháng bạn đang nhập, mỗi điểm cách nhau một tháng; vạch đứt dọc có chấm tròn là đúng số tháng bạn nhập. Đây là phép thử nếu sổ có kỳ hạn dài hay ngắn hơn thì tiền lãi thực nhận ra bao nhiêu, không phải diễn biến thị trường. Đường nằm ngang: tiền lãi khi rút trước hạn chỉ tính theo số tháng đã gửi, không theo kỳ hạn ghi trên sổ. Kỳ hạn chỉ dùng để kiểm tra rằng bạn thật sự đang rút trước hạn.',
          'The line runs left to right along the Contract term field, from half to one and a half times the number of months you have entered, one point per month; the dashed vertical line with a dot marks your own figure. It is a what-if on a longer or shorter passbook term, not market history. The line is flat: interest on early withdrawal depends only on the months already held, not on the term written in the passbook. The term is used only to check that you are in fact withdrawing early.',
        ),
        cot: d(
          'Mỗi cột là tiền lãi thực nhận ứng với một kỳ hạn hợp đồng, và các cột cao bằng nhau; cột tô đặc là kỳ hạn bạn đang nhập. Sổ sáu tháng hay sổ một năm, rút ở cùng một thời điểm thì nhận cùng một khoản lãi không kỳ hạn.',
          'Each bar is the interest actually received for one contract term, and all the bars are the same height; the solid one is the term you have entered. A six-month passbook or a one-year one, withdrawn at the same moment, pays the same demand-deposit interest.',
        ),
      },
      monthsHeld: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thời gian đã gửi (t), từ khoảng một nửa đến khoảng gấp rưỡi số tháng bạn đang nhập, mỗi điểm cách nhau một tháng; vạch đứt dọc có chấm tròn là đúng số tháng bạn nhập. Đây là phép thử nếu rút sớm hay muộn hơn thì tiền lãi thực nhận ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: mỗi tháng gửi thêm được cộng một khoản lãi không kỳ hạn bằng nhau, và khoản ấy rất nhỏ.',
          'The line runs left to right along the Time held (t) field, from about half to about one and a half times the number of months you have entered, one point per month; the dashed vertical line with a dot marks your own figure. It is a what-if on withdrawing sooner or later, not market history. The line rises steadily: each extra month held adds the same amount of demand-deposit interest, and that amount is very small.',
        ),
        cot: d(
          'Mỗi cột là tiền lãi thực nhận ứng với một số tháng đã gửi, cột cao dần về bên phải và cột tô đặc là số tháng bạn đang nhập. Chỉ có vài cột vì ô này nhận số tháng tròn; chờ thêm tới đúng ngày đáo hạn thì bạn nhảy khỏi dãy cột này sang mức lãi hợp đồng, cao hơn nhiều lần.',
          'Each bar is the interest actually received for one number of months held; bars grow taller to the right and the solid one is the number you have entered. There are only a few bars because the field takes whole months; waiting until the maturity date takes you off this row altogether, onto contract interest many times higher.',
        ),
      },
      demandRate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất không kỳ hạn / năm (rkkh), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu ngân hàng áp một mức lãi không kỳ hạn khác thì tiền lãi thực nhận ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: đây chính là lãi suất dùng để tính khoản bạn nhận, nên nó tăng bao nhiêu phần thì tiền lãi tăng bấy nhiêu phần.',
          'The line runs left to right along the Demand-deposit rate / year (rkkh) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the bank applying a different demand-deposit rate, not market history. The line rises steadily: this is the very rate used to work out what you receive, so the interest grows in exact proportion to it.',
        ),
        cot: d(
          'Mỗi cột là tiền lãi thực nhận ở một mức lãi không kỳ hạn, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Mỗi ngân hàng công bố mức này một khác, nên hãy thay bằng con số của chính ngân hàng bạn gửi rồi xem cột tô đặc.',
          'Each bar is the interest actually received at one demand-deposit rate; bars grow taller to the right and the solid one is the rate you have entered. Each bank publishes its own figure, so replace it with your own bank’s rate and read the solid bar.',
        ),
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. Lãi theo lãi suất hợp đồng là thanh tô màu, số lãi lẽ ra có cho quãng đã gửi nếu giữ tới hạn; Lãi mất do rút sớm là thanh viền nét đứt, phần bị cắt vì chỉ được trả theo lãi suất không kỳ hạn; thanh sẫm cuối cùng là Lãi thực nhận khi rút trước hạn và bằng đúng con số ở khối Kết quả. Thanh trừ dài gần bằng thanh đầu là rút sớm gần như mất trắng tiền lãi.',
      'This chart has a single form: horizontal bars, read from top to bottom. Interest at the contract rate is the filled bar, what the time already deposited would have earned if held to maturity; Interest lost by withdrawing early is the bar with a dashed outline, the part cut because only the demand rate is paid; the dark bar at the end is Early withdrawal interest and matches the figure in the Result block exactly. A minus bar nearly as long as the first one means withdrawing early forfeits almost all the interest.',
    ),
  },

  'gui-quay-vong': {
    truc: {
      principal: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số tiền gửi (P), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số tiền gửi khác đi thì khoản chênh giữa hai cách gửi ra bao nhiêu, không phải diễn biến thị trường. Khi gửi kỳ dài lợi hơn, đường nằm dưới 0 và đi xuống đều: tiền gửi càng nhiều thì khoản thua thiệt của cách quay vòng càng lớn. Khi quay vòng lợi hơn thì đường nằm trên 0 và đi lên. Số tiền chỉ phóng to khoản chênh, nó không quyết định cách nào thắng.',
          'The line runs left to right along the Deposit amount (P) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different deposit, not market history. When the long deposit is ahead the line stays below 0 and falls steadily: the more money deposited, the larger the shortfall from rolling over. When rolling over is ahead the line sits above 0 and rises. The amount only scales the difference, it does not decide which way wins.',
        ),
        cot: d(
          'Mỗi cột là khoản chênh giữa gửi quay vòng và gửi kỳ dài ở một mức tiền gửi, cột tô đặc là mức bạn đang nhập. Khi gửi kỳ dài lợi hơn, mọi cột đều quay xuống dưới và cột càng dài thì gửi quay vòng càng thiệt; khi quay vòng lợi hơn thì mọi cột mọc lên trên.',
          'Each bar is the difference between rolling over and one long deposit at one deposit amount, and the solid one is the amount you have entered. When the long deposit is ahead every bar hangs downward, and the longer the bar, the more rolling over costs you; when rolling over is ahead every bar stands upward.',
        ),
      },
      shortRate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất kỳ ngắn / năm (rn), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất kỳ ngắn đổi mà lãi suất kỳ dài đứng yên thì khoản chênh ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên: lãi kỳ ngắn càng cao thì quay vòng càng có lợi. Chỗ đường cắt qua 0 là mức lãi kỳ ngắn vừa đủ để lãi nhập gốc qua từng vòng đuổi kịp lãi suất kỳ dài.',
          'The line runs left to right along the Short-term rate / year (rn) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the short-term rate with the long-term rate held still, not market history. The line rises: the higher the short rate, the better rolling over does. Where the line crosses 0 is the short rate at which interest compounded round after round just catches up with the long rate.',
        ),
        cot: d(
          'Mỗi cột là khoản chênh ở một mức lãi kỳ ngắn, cột tô đặc là mức bạn đang nhập. Cột quay xuống dưới vạch 0 là gửi kỳ dài lợi hơn, cột mọc lên trên vạch 0 là quay vòng lợi hơn; chỗ đổi chiều là mức lãi hoà nhau giữa hai cách.',
          'Each bar is the difference at one short-term rate, and the solid one is the rate you have entered. Bars below the zero line mean the long deposit is ahead, bars above the zero line mean rolling over is ahead; the switch-over is the rate at which the two ways tie.',
        ),
      },
      shortMonths: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Kỳ hạn ngắn (m). Ô này nhận số tháng tròn nên trục chỉ có vài điểm, cách nhau một tháng, quanh con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mỗi vòng gửi dài hay ngắn hơn thì khoản chênh ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống: cùng một lãi suất, mỗi vòng càng dài thì số lần lãi được nhập gốc trong cả quãng gửi càng ít, nên cách quay vòng càng thiệt.',
          'The line runs left to right along the Short term (m) field. The field takes whole months, so the axis has only a few points, one month apart, around the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on each round being longer or shorter, not market history. The line falls: at the same rate, the longer each round, the fewer times interest joins the principal over the whole period, so rolling over does worse.',
        ),
        cot: d(
          'Mỗi cột là khoản chênh ứng với một độ dài của vòng gửi ngắn, cột tô đặc là số tháng bạn đang nhập. Chỉ có vài cột và chúng gần bằng nhau: độ dài mỗi vòng ảnh hưởng ít hơn nhiều so với chênh lệch giữa hai mức lãi suất.',
          'Each bar is the difference for one length of the short round, and the solid one is the number of months you have entered. There are only a few bars and they are nearly equal: the length of each round matters far less than the gap between the two rates.',
        ),
      },
      longRate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất kỳ dài / năm (rd), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Trục dọc là số tiền gửi quay vòng kỳ ngắn hơn gửi một sổ kỳ dài. Đây là phép thử nếu lãi suất kỳ dài khác đi thì bên nào lợi hơn, không phải diễn biến thị trường. Đường đi xuống đều: lãi suất kỳ dài càng cao thì lợi thế của việc quay vòng càng mất dần. Chỗ đường cắt mức 0 là mức lãi suất kỳ dài mà hai cách gửi cho về bằng nhau.',
          'The line runs left to right along the Long-term rate / year (rd) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. The vertical axis is how much more rolling short terms pays than one long deposit. It is a what-if on which side wins at another long-term rate, not market history. The line falls steadily: the higher the long-term rate, the more the edge of rolling over fades. Where the line crosses 0 is the long-term rate at which both ways return the same.',
        ),
        cot: d(
          'Mỗi cột là chênh lệch tiền cuối kỳ ở một mức lãi suất kỳ dài, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là gửi quay vòng lợi hơn, cột quay xuống dưới vạch 0 là gửi một sổ kỳ dài lợi hơn.',
          'Each bar is the gap in ending money at one long-term rate, and the solid one is the rate you have entered. A bar standing above the zero line means rolling short terms wins; one hanging below the zero line means the single long deposit wins.',
        ),
      },
      totalMonths: {
        duong: d(
          'Trục ngang chạy theo ô Tổng thời gian (T), từ một nửa đến gấp rưỡi số tháng bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số tháng bạn nhập. Đây là phép thử nếu gửi tổng cộng lâu hay chóng hơn thì khoản chênh ra bao nhiêu, không phải diễn biến thị trường. Chỉ những mức chia hết cho kỳ hạn ngắn mới tính được; khi kỳ hạn ngắn dài hơn một tháng, các mức ấy đứng rời nhau nên dạng Đường không nối thành nét, trên hình chỉ còn vùng gạch chéo và chấm tròn. Hãy xem dạng Cột: khi lãi kỳ dài cao hơn, khoản chênh đi xuống trong những năm đầu; gửi đủ lâu hoặc lãi kỳ ngắn cao hơn thì nó đi lên.',
          'The horizontal axis follows the Total time (T) field, from half to one and a half times the months you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a longer or shorter total deposit, not market history. Only totals that are a whole multiple of the short term can be calculated; when the short term is longer than one month they stand apart, so this form joins no stroke and shows only a hatched area and the dot. Switch to Bars: with a higher long rate the difference falls in the early years; given enough time, or a higher short rate, it rises.',
        ),
        cot: d(
          'Mỗi cột là khoản chênh ứng với một tổng thời gian gửi, cột tô đặc là số tháng bạn đang nhập. Chỉ những mức chia hết cho kỳ hạn ngắn mới có cột; các quãng gạch chéo giữa chúng là mức không xếp được trọn số vòng.',
          'Each bar is the difference for one total deposit time, and the solid one is the number of months you have entered. Only totals that divide evenly by the short term get a bar; the hatched stretches between them are totals that do not fit a whole number of rounds.',
        ),
      },
    },
  },

  // ── Đầu tư định kỳ ─────────────────────────────────────────────────────────────────────────
  'gia-von-trung-binh-dca': {
    truc: {
      amount1: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tiền mua đợt 1 (C1), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu đợt này bỏ nhiều hay ít tiền hơn thì giá vốn trung bình ra bao nhiêu, không phải diễn biến thị trường. Khi giá của đợt này cao hơn giá vốn trung bình, đường đi lên: dồn thêm tiền vào nó là kéo giá vốn lên. Khi giá của đợt này thấp hơn giá vốn trung bình thì đường đi xuống.',
          'The line runs left to right along the Amount invested, round 1 (C1) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on putting more or less money into this round, not market history. When this round’s price is above the average cost the line rises: putting more money into it pulls the average up. When this round’s price is below the average cost the line falls.',
        ),
        cot: d(
          'Mỗi cột là giá vốn trung bình ứng với một mức tiền của đợt mua thứ nhất, cột tô đặc là mức bạn đang nhập. Các cột chỉ chênh nhau ít: một đợt mua không kéo nổi mức trung bình đi xa, và nó luôn nằm giữa giá đợt rẻ nhất và giá đợt đắt nhất.',
          'Each bar is the average cost for one amount put into the first round, and the solid one is the amount you have entered. The bars differ only a little: one round cannot drag the average far, and it always stays between the cheapest and the dearest round’s price.',
        ),
      },
      price1: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua đợt 1 (P1), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu đợt này khớp ở một giá khác thì giá vốn trung bình ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: giá càng cao thì cùng số tiền ấy mua được càng ít cổ phiếu, nên đợt này càng nhẹ cân trong mức trung bình.',
          'The line runs left to right along the Purchase price, round 1 (P1) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on this round filling at a different price, not market history. The line rises but flattens: the higher the price, the fewer shares the same money buys, so this round weighs less in the average.',
        ),
        cot: d(
          'Mỗi cột là giá vốn trung bình ứng với một mức giá của đợt mua thứ nhất, cột cao dần về bên phải và cột tô đặc là mức giá bạn đang nhập. Với số tiền mỗi đợt bằng nhau, cột nào cũng thấp hơn trung bình cộng thông thường của các mức giá: tiền đều nhau tự gom nhiều cổ phiếu hơn ở giá thấp.',
          'Each bar is the average cost for one price of the first round; bars grow taller to the right and the solid one is the price you have entered. With equal money in every round, each bar sits below the plain average of the prices: equal amounts gather more shares when the price is low.',
        ),
      },
      amount2: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tiền mua đợt 2 (C2), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu đợt này bỏ nhiều hay ít tiền hơn thì giá vốn trung bình ra bao nhiêu, không phải diễn biến thị trường. Khi giá của đợt này cao hơn giá vốn trung bình, đường đi lên, và hai mức giá càng sát nhau thì thêm tiền vào đợt này càng ít làm mức trung bình nhúc nhích. Khi giá của đợt này thấp hơn giá vốn trung bình thì đường đi xuống.',
          'The line runs left to right along the Amount invested, round 2 (C2) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on putting more or less money into this round, not market history. When this round’s price is above the average cost the line rises, and the closer the two prices are, the less extra money in this round moves the average. When this round’s price is below the average cost the line falls.',
        ),
        cot: d(
          'Mỗi cột là giá vốn trung bình ứng với một mức tiền của đợt mua thứ hai, cột tô đặc là mức bạn đang nhập. Khi giá của đợt này sát giá vốn trung bình, dãy cột gần như phẳng: bỏ nhiều hay ít tiền vào một đợt như thế cũng gần như không đổi kết quả.',
          'Each bar is the average cost for one amount put into the second round, and the solid one is the amount you have entered. When this round is priced close to the average cost the row is nearly level: however much money goes into such a round, the result barely changes.',
        ),
      },
      price2: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua đợt 2 (P2), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu đợt này khớp ở một giá khác thì giá vốn trung bình ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: đợt này rẻ đi thì số cổ phiếu mua được tăng nhanh và kéo mức trung bình xuống mạnh, còn đắt lên thì nó mua được ít nên tác động yếu dần.',
          'The line runs left to right along the Purchase price, round 2 (P2) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on this round filling at a different price, not market history. The line rises but flattens: when this round gets cheaper the shares it buys multiply and pull the average down hard, and when it gets dearer it buys few, so its pull fades.',
        ),
        cot: d(
          'Mỗi cột là giá vốn trung bình ứng với một mức giá của đợt mua thứ hai, cột cao dần về bên phải và cột tô đặc là mức giá bạn đang nhập. Bước giữa các cột bên trái lớn hơn bước giữa các cột bên phải: một đợt mua được giá thấp có sức nặng hơn một đợt mua phải giá cao.',
          'Each bar is the average cost for one price of the second round; bars grow taller to the right and the solid one is the price you have entered. The steps between bars on the left are larger than those on the right: a round bought cheaply carries more weight than one bought dear.',
        ),
      },
      amount3: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tiền mua đợt 3 (C3), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu đợt này bỏ nhiều hay ít tiền hơn thì giá vốn trung bình ra bao nhiêu, không phải diễn biến thị trường. Khi giá của đợt này thấp hơn giá vốn trung bình, đường đi xuống: càng dồn tiền vào nó thì giá vốn trung bình càng được kéo về phía mức giá rẻ ấy. Khi giá của đợt này cao hơn giá vốn trung bình thì đường đi lên.',
          'The line runs left to right along the Amount invested, round 3 (C3) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on putting more or less money into this round, not market history. When this round’s price is below the average cost the line falls: the more money goes into it, the further the average cost is pulled toward that cheap price. When this round’s price is above the average cost the line rises.',
        ),
        cot: d(
          'Mỗi cột là giá vốn trung bình ứng với một mức tiền của đợt mua thứ ba, cột tô đặc là mức bạn đang nhập. Khi đợt này rẻ hơn giá vốn trung bình, cột thấp dần về bên phải: đó là hình của việc mua thêm khi giá giảm, bỏ càng nhiều tiền ở đợt rẻ thì giá phải chờ để hoà vốn càng thấp. Đợt này đắt hơn giá vốn trung bình thì cột cao dần.',
          'Each bar is the average cost for one amount put into the third round, and the solid one is the amount you have entered. When this round is cheaper than the average cost the bars shrink to the right: that is the picture of buying more as the price drops, the more money goes in at the cheap round, the lower the price you need to wait for to break even. When this round is dearer than the average cost the bars grow taller.',
        ),
      },
      price3: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua đợt 3 (P3), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu đợt mua cuối khớp ở giá khác thì giá vốn bình quân ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: giá đợt ấy càng cao thì cùng số tiền mua được càng ít cổ phiếu, nên đợt mua đắt kéo giá vốn lên yếu hơn mức đợt mua rẻ kéo nó xuống.',
          'The line runs left to right along the Purchase price, round 3 (P3) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on the average cost had the last round filled at another price, not market history. The line rises but flattens: the higher that round’s price, the fewer shares the same money buys, so a dear round pulls the average cost up less than a cheap round pulls it down.',
        ),
        cot: d(
          'Mỗi cột là giá vốn trung bình ứng với một mức giá của đợt mua cuối, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Các cột bên trái chênh nhau nhiều hơn các cột bên phải: khi đợt cuối mua rẻ, nó gom được nhiều cổ phiếu nên kéo giá vốn rất mạnh; khi nó mua đắt, hai đợt trước giữ giá vốn lại nên cột nhích lên chậm hẳn.',
          'Each bar is the average cost for one price of the last round; bars grow taller to the right and the solid one is the price you have entered. The bars on the left differ more than those on the right: when the last round is cheap it gathers many shares and pulls the average very hard; when it is dear, the two earlier rounds hold the average back and the bars creep up far more slowly.',
        ),
      },
    },
    // Đợt thứ tư trở đi, do người dùng thêm — một đoạn mẫu cho mọi đợt thêm, xem `BieuDoRieng.trucLap`.
    trucLap: {
      amount: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tiền mua đợt {n} (C{n}); vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Khi ô đã có số, trục chạy từ một nửa đến gấp rưỡi con số ấy; khi ô còn là 0, trục trải từ 0 tới mức lớn nhất ô cho nhập. Đây là phép thử nếu đợt này bỏ nhiều hay ít tiền hơn thì giá vốn trung bình ra bao nhiêu, không phải diễn biến thị trường. Khi giá của đợt này cao hơn giá vốn trung bình, đường đi lên; thấp hơn thì đường đi xuống. Đợt có tiền mà ô giá còn là 0 thì chưa tính được, và hình hiện vùng gạch chéo.',
          'The line runs left to right along the Amount invested, round {n} (C{n}) field; the dashed vertical line with a dot marks your own figure. Once the field holds a number the axis runs from half to one and a half times it; while the field is still 0 the axis spans from 0 to the largest amount the field accepts. It is a what-if on putting more or less money into this round, not market history. When this round’s price is above the average cost the line rises; below it, the line falls. A round with money but a price still at 0 cannot be computed, and the chart shows a hatched area.',
        ),
        cot: d(
          'Mỗi cột là giá vốn trung bình ứng với một mức tiền của đợt mua thứ {n}, cột tô đặc là mức bạn đang nhập. Đợt này đắt hơn giá vốn trung bình thì cột cao dần về bên phải, rẻ hơn thì cột thấp dần: dồn tiền vào đợt nào là kéo giá vốn về phía giá của đợt ấy.',
          'Each bar is the average cost for one amount put into round {n}, and the solid one is the amount you have entered. When this round is dearer than the average cost the bars grow taller to the right, and when it is cheaper they shrink: money put into a round pulls the average cost toward that round’s price.',
        ),
      },
      price: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua đợt {n} (P{n}); vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Khi ô đã có số, trục chạy từ một nửa đến gấp rưỡi mức giá ấy; khi ô còn là 0, trục trải từ 0 tới mức lớn nhất ô cho nhập. Đây là phép thử nếu đợt này khớp ở một giá khác thì giá vốn trung bình ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: giá càng cao thì cùng số tiền ấy mua được càng ít cổ phiếu, nên đợt này càng nhẹ cân trong mức trung bình. Ô tiền của đợt còn là 0 thì đợt bị bỏ qua và đường nằm ngang.',
          'The line runs left to right along the Purchase price, round {n} (P{n}) field; the dashed vertical line with a dot marks your own price. Once the field holds a number the axis runs from half to one and a half times it; while the field is still 0 the axis spans from 0 to the highest price the field accepts. It is a what-if on this round filling at a different price, not market history. The line rises but levels off: the higher the price, the fewer shares the same money buys, so this round weighs less in the average. While this round’s amount is still 0 the round is skipped and the line is flat.',
        ),
        cot: d(
          'Mỗi cột là giá vốn trung bình ứng với một mức giá của đợt mua thứ {n}, cột tô đặc là mức giá bạn đang nhập. Khi đợt này đã có tiền, cột cao dần về bên phải và bước giữa các cột bên trái lớn hơn bên phải: mua được giá thấp thì gom nhiều cổ phiếu nên kéo mức trung bình mạnh hơn. Đợt chưa có tiền thì các cột bằng nhau.',
          'Each bar is the average cost for one price of round {n}, and the solid one is the price you have entered. Once this round has money in it the bars grow taller to the right, with larger steps on the left than on the right: a cheap fill gathers more shares and so pulls the average harder. While the round has no money the bars are all level.',
        ),
      },
    },
  },

  'so-ky-dca': {
    truc: {
      target: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số tiền mục tiêu (FV), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu đặt mục tiêu khác thì phải góp bao nhiêu tháng, không phải diễn biến thị trường. Đường đi lên thành từng bậc nhỏ vì số tháng luôn làm tròn lên: mục tiêu càng lớn thì góp càng lâu, nhưng không lâu lên theo đúng tỷ lệ, vì càng về sau tiền lãi càng gánh hộ nhiều hơn.',
          'The line runs left to right along the Target amount (FV) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the months of contributions another goal would need, not market history. The line rises in small steps because the months are always rounded up: a bigger goal takes longer, yet not in full proportion, since returns carry more of the load the longer you go.',
        ),
        cot: d(
          'Mỗi cột là số tháng phải góp ứng với một mức mục tiêu, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột là số tháng nguyên, nên đếm được thẳng trên trục.',
          'Each bar is the months of contributions for one goal; bars grow taller to the right and the solid one is the goal you have entered. Bar height is a whole number of months, so it can be read straight off the axis.',
        ),
      },
      contribution: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Mức góp mỗi tháng (C), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mỗi tháng góp nhiều hay ít hơn thì cần bao nhiêu tháng để đạt mục tiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần, có chỗ đi ngang một quãng ngắn vì số tháng làm tròn lên: góp càng nhiều thì càng nhanh tới đích, nhưng mỗi đồng góp thêm rút ngắn được ít hơn đồng trước đó.',
          'The line runs left to right along the Monthly contribution (C) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on contributing more or less each month, not market history. The line falls and flattens, with short level stretches because the months are rounded up: the more you contribute, the sooner you arrive, yet each extra unit shortens the wait less than the one before.',
        ),
        cot: d(
          'Mỗi cột là số tháng cần góp ở một mức góp, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Các cột bên trái cao lên nhanh hơn các cột bên phải thấp đi: bớt một phần mức góp kéo dài thời gian nhiều hơn mức mà thêm đúng phần ấy rút ngắn được.',
          'Each bar is the number of months needed at one contribution level; bars shrink to the right and the solid one is the level you have entered. The bars on the left rise faster than those on the right fall: cutting the contribution by some amount stretches the time by more than adding the same amount shortens it.',
        ),
      },
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất kỳ vọng / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lợi suất kỳ vọng đổi thì cần bao nhiêu tháng để đạt mục tiêu, không phải diễn biến thị trường. Đường đi xuống theo từng bậc thang: lợi suất càng cao thì tiền lãi gánh hộ càng nhiều nên càng sớm tới đích, còn bậc thang là do số tháng làm tròn lên số nguyên.',
          'The line runs left to right along the Expected rate of return / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the expected return, not market history. The line falls in steps: the higher the return, the more of the goal the gains carry and the sooner you arrive, and the steps come from rounding the months up to a whole number.',
        ),
        cot: d(
          'Mỗi cột là số tháng cần góp ở một mức lợi suất, cột tô đặc là mức bạn đang nhập. Kế hoạch còn ngắn thì các cột chỉ chênh nhau vài tháng, vì số tiền góp mỗi tháng quyết định thời gian nhiều hơn hẳn lợi suất. Kế hoạch càng dài thì lợi suất càng nặng ký, vì tiền lãi có nhiều năm để cộng dồn.',
          'Each bar is the number of months needed at one rate of return, and the solid one is the rate you have entered. Over a short plan the bars differ by only a few months, because how much you put in each month decides the time far more than the return does. The longer the plan, the more the return weighs, because gains have more years to build up.',
        ),
      },
    },
  },

  // ── Thuế thu nhập cá nhân ──────────────────────────────────────────────────────────────────
  'thue-tncn-dau-tu': {
    truc: {
      quantity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Khối lượng (Q), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu giao dịch số cổ phiếu khác thì tổng thuế trong năm là bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cả thuế chuyển nhượng lẫn thuế cổ tức đều tính trên từng cổ phiếu, nên khối lượng gấp đôi thì thuế đúng gấp đôi.',
          'The line runs left to right along the Quantity (Q) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the year’s total tax for another number of shares, not market history. The line rises steadily: both the transfer tax and the dividend tax are charged per share, so twice the quantity means exactly twice the tax.',
        ),
        cot: d(
          'Mỗi cột là tổng thuế ở một mức khối lượng, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột là số tiền phải nộp dù lệnh bán có lãi hay lỗ: thuế chuyển nhượng tính trên giá bán chứ không trên phần lãi.',
          'Each bar is the total tax at one quantity; bars grow taller to the right and the solid one is the quantity you have entered. Bar height is owed whether the sale made or lost money: the transfer tax is charged on the selling price, not on the gain.',
        ),
      },
      sellPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá bán (Pban), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu bán ở một giá khác thì tổng thuế ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: thuế chuyển nhượng tính trên giá trị bán, không tính trên tiền lãi, nên bán giá càng cao thì thuế càng nhiều kể cả khi thương vụ ấy lỗ.',
          'The line runs left to right along the Sale price (Pban) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on selling at a different price, not market history. The line rises steadily: transfer tax is charged on the value sold, not on the gain, so a higher sale price means more tax even when the trade itself loses money.',
        ),
        cot: d(
          'Mỗi cột là tổng thuế ở một mức giá bán, cột cao dần về bên phải và cột tô đặc là mức giá bạn đang nhập. Dãy cột không bao giờ về tới đáy: phần thuế cổ tức không phụ thuộc giá bán nên luôn nằm sẵn trong mọi cột.',
          'Each bar is the total tax at one sale price; bars grow taller to the right and the solid one is the price you have entered. The row never comes down to the base: the dividend tax does not depend on the sale price, so it sits inside every bar.',
        ),
      },
      dividendPerShare: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Cổ tức tiền mặt (D), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu cổ tức nhận được khác đi thì tổng thuế ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: thuế cổ tức khấu trừ theo một tỷ lệ cố định trên số tiền nhận, nên cổ tức thêm bao nhiêu thì thuế thêm theo đúng tỷ lệ ấy.',
          'The line runs left to right along the Cash dividend (D) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different dividend, not market history. The line rises steadily: dividend tax is withheld at a fixed rate on what is received, so the tax grows with the dividend at exactly that rate.',
        ),
        cot: d(
          'Mỗi cột là tổng thuế ở một mức cổ tức, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột nào cũng chứa sẵn cùng một khoản thuế chuyển nhượng khi bán; phần còn lại của cột là thuế cổ tức, và chỉ phần này lớn dần về bên phải.',
          'Each bar is the total tax at one dividend level; bars grow taller to the right and the solid one is the level you have entered. Every bar holds the same transfer tax on the sale; the rest of the bar is tax on the dividend, and only that part grows toward the right.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là tổng thuế nếu bạn bán ở giá đóng cửa của phiên đó, còn khối lượng và cổ tức vẫn là con số bạn nhập. Hình này đi theo đúng chuỗi giá bạn đã nạp, và đường đi cùng chiều với giá. Đường đi lên là giá bán cao hơn nên thuế chuyển nhượng nhiều hơn; đi xuống là giá thấp hơn nên thuế ít đi. Phần thuế cổ tức không đổi theo phiên.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the total tax had you sold at that session’s closing price, with quantity and dividend kept as entered. It follows the price series you loaded, and the line moves with the price. When it rises the selling price is higher, so the transfer tax is larger; when it falls the price is lower and the tax smaller. The dividend tax part does not change from session to session.',
      ),
      cot: d(
        'Mỗi cột là tổng thuế nếu bán ở một phiên, cột cuối bên phải là phiên gần nhất. Phần thuế chuyển nhượng trong cột lên xuống theo đúng tỷ lệ của giá đóng cửa, còn phần thuế cổ tức đứng yên qua mọi phiên; vì thế khi có cổ tức, các cột chênh nhau theo tỷ lệ ít hơn mức chênh của giá.',
        'Each bar is the total tax from selling in one session, the last one on the right being the latest. The transfer tax inside a bar moves in exact proportion to the closing price, while the dividend tax stays put in every session; so when there is a dividend, the bars differ proportionally less than the price does.',
      ),
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. Thuế chuyển nhượng và Thuế cổ tức là hai thanh tô màu cộng lại với nhau; thanh sẫm cuối cùng là Tổng thuế và bằng đúng con số ở khối Kết quả. So chiều dài hai thanh đầu để biết khoản nào đang chiếm phần lớn: bán với giá trị lớn thì thanh chuyển nhượng dài, nhận nhiều cổ tức tiền mặt thì thanh cổ tức dài.',
      'This chart has a single form: horizontal bars, read from top to bottom. Transfer tax and Dividend tax are two filled bars that add together; the dark bar at the end is Total tax and matches the figure in the Result block exactly. Compare the first two bars to see which one dominates: a large sale lengthens the transfer bar, a large cash dividend lengthens the dividend bar.',
    ),
  },

  // ── Tài chính doanh nghiệp ─────────────────────────────────────────────────────────────────
  'diem-hoa-von': {
    truc: {
      fixedCost: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Định phí (FC), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu định phí đổi thì sản lượng hoà vốn ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: mỗi sản phẩm bán ra đóng góp một khoản không đổi để trả định phí, nên định phí thêm bao nhiêu phần thì phải bán thêm bấy nhiêu phần mới hoà.',
          'The line runs left to right along the Fixed cost (FC) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on fixed cost, not market history. The line rises steadily: each unit sold contributes a fixed amount toward fixed cost, so the break-even volume grows in exact proportion to that cost.',
        ),
        cot: d(
          'Mỗi cột là sản lượng hoà vốn ở một mức định phí, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Thuê thêm mặt bằng hay mua thêm máy là nhảy sang một cột bên phải: phải bán được ngần ấy sản phẩm rồi mới bắt đầu có lãi.',
          'Each bar is the break-even volume at one level of fixed cost; bars grow taller to the right and the solid one is the level you have entered. Renting more space or buying another machine moves you to a bar on the right: that many units must be sold before any profit starts.',
        ),
      },
      unitPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá bán một sản phẩm (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu bán ở giá khác thì phải bán bao nhiêu sản phẩm mới hoà vốn, không phải diễn biến thị trường. Đường đi xuống và thoải dần: giá bán càng cao thì mỗi sản phẩm góp càng nhiều vào việc bù định phí, nên cần bán càng ít. Vùng gạch chéo bên trái là chỗ giá bán không cao hơn biến phí, bán bao nhiêu cũng không hoà vốn được.',
          'The line runs left to right along the Selling price per unit (P) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on the units needed to break even at another price, not market history. The line falls and flattens: the higher the price, the more each unit contributes toward the fixed cost, so the fewer you need to sell. The hatched zone on the left is where the price is not above the variable cost, and no volume can ever break even.',
        ),
        cot: d(
          'Mỗi cột là sản lượng hoà vốn ở một mức giá bán, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Mấy cột cao vọt ngay sát vùng không tính được là lúc giá bán chỉ nhỉnh hơn biến phí một chút: mỗi sản phẩm lãi quá mỏng nên phải bán rất nhiều.',
          'Each bar is the break-even volume at one selling price; bars shrink to the right and the solid one is the price you have entered. The towering bars right beside the zone that cannot be calculated are prices barely above the variable cost: each unit earns so little that a great many must be sold.',
        ),
      },
      variableCost: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Biến phí một sản phẩm (VC), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu chi phí làm ra một sản phẩm đổi thì sản lượng hoà vốn ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc rất nhanh về bên phải: biến phí càng sát giá bán thì phần mỗi sản phẩm góp để trả định phí càng mỏng, nên số sản phẩm cần bán vọt lên.',
          'The line runs left to right along the Variable cost per unit (VC) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the cost of making one unit, not market history. The line rises and steepens very fast toward the right: the closer variable cost gets to the selling price, the thinner the contribution of each unit toward fixed cost, so the volume needed shoots up.',
        ),
        cot: d(
          'Mỗi cột là sản lượng hoà vốn ở một mức biến phí, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Vài cột cuối bên phải cao áp đảo: đó là vùng nguyên liệu tăng giá thêm một chút cũng đủ đẩy điểm hoà vốn ra ngoài tầm bán được.',
          'Each bar is the break-even volume at one variable cost; bars grow taller to the right and the solid one is the level you have entered. The last few bars on the right dwarf the rest: that is the zone where a slightly dearer input is enough to push break-even beyond what can be sold.',
        ),
      },
    },
  },

  'don-bay-tong-hop': {
    truc: {
      revenue: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Doanh thu (DT), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu doanh thu đổi mà các khoản chi phí đứng yên thì đòn bẩy tổng hợp ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống rất dốc rồi thoải dần: doanh thu càng vượt xa điểm hoà vốn thì lợi nhuận càng bớt chao đảo theo doanh thu. Vùng gạch chéo bên trái là những mức doanh thu chưa đủ trả biến phí, định phí và lãi vay, ở đó hệ số không có nghĩa nên không tính.',
          'The line runs left to right along the Revenue (DT) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on revenue with all the costs held still, not market history. The line falls very steeply and then flattens: the further revenue rises above break-even, the less profit swings with it. The hatched area on the left is revenue too low to cover variable cost, fixed cost and interest, where the ratio has no meaning and is not calculated.',
        ),
        cot: d(
          'Mỗi cột là đòn bẩy tổng hợp ở một mức doanh thu, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Các cột đầu tiên sát vùng gạch chéo cao vọt: ngay trên điểm hoà vốn, doanh thu chỉ xê dịch một chút là lợi nhuận đã đổi gấp nhiều lần.',
          'Each bar is total leverage at one revenue level; bars shrink to the right and the solid one is the level you have entered. The first bars next to the hatched zone tower: just above break-even, a small shift in revenue changes profit many times over.',
        ),
      },
      variableCost: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tổng biến phí (BP), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu biến phí đổi mà doanh thu đứng yên thì đòn bẩy tổng hợp ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc dần: biến phí càng lớn thì phần còn lại sau định phí và lãi vay càng mỏng, nên lợi nhuận càng dễ chao đảo. Vùng gạch chéo bên phải là những mức biến phí đã ăn hết phần ấy, ở đó hệ số không có nghĩa nên không tính.',
          'The line runs left to right along the Total variable cost (BP) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on variable cost with revenue held still, not market history. The line rises and steepens: the larger the variable cost, the thinner what remains after fixed cost and interest, so the more easily profit swings. The hatched area on the right is variable cost that has consumed that remainder, where the ratio has no meaning and is not calculated.',
        ),
        cot: d(
          'Mỗi cột là đòn bẩy tổng hợp ở một mức biến phí, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Dãy cột dừng lại trước vùng gạch chéo: cột cuối cùng cao nhất là mức biến phí mà doanh nghiệp chỉ còn cách hoà vốn một bước.',
          'Each bar is total leverage at one level of variable cost; bars grow taller to the right and the solid one is the level you have entered. The row stops short of the hatched zone: the last and tallest bar is the cost level at which the company is one step from break-even.',
        ),
      },
      fixedCost: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Định phí hoạt động, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu định phí khác đi thì đòn bẩy tổng hợp ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và càng lúc càng dốc: định phí càng nặng thì lợi nhuận còn lại càng mỏng, và doanh thu chỉ cần nhúc nhích là EPS đã đổi rất mạnh. Vùng gạch chéo bên phải là chỗ định phí đã ăn hết lợi nhuận sau lãi vay, không tính được.',
          'The line runs left to right along the Operating fixed cost field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on total leverage at another fixed cost, not market history. The line rises and keeps steepening: the heavier the fixed cost, the thinner the profit left over, and the slightest move in revenue swings EPS hard. The hatched zone on the right is where fixed cost has consumed all the profit after interest, and nothing can be calculated.',
        ),
        cot: d(
          'Mỗi cột là đòn bẩy tổng hợp ở một mức định phí, cột cao dần về bên phải và mỗi cột thêm nhiều hơn cột trước; cột tô đặc là mức bạn đang nhập. Chiều cao cột là số lần mà mỗi phần trăm thay đổi của doanh thu được khuếch đại lên EPS, theo cả chiều tăng lẫn chiều giảm.',
          'Each bar is the total leverage at one fixed cost; bars grow taller to the right, each adding more than the one before, and the solid one is the level you have entered. Bar height is how many times each percent change in revenue is magnified onto EPS, on the way up and on the way down alike.',
        ),
      },
      interest: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi vay (I), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi vay đổi thì đòn bẩy tổng hợp ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc dần: lãi vay là khoản phải trả dù bán được nhiều hay ít, nên nó càng lớn thì phần lợi nhuận còn lại cho cổ đông càng mỏng và càng nhảy mạnh theo doanh thu.',
          'The line runs left to right along the Interest expense (I) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on interest, not market history. The line rises and steepens: interest must be paid whether sales are good or bad, so the larger it is, the thinner the profit left for shareholders and the harder that profit jumps with revenue.',
        ),
        cot: d(
          'Mỗi cột là đòn bẩy tổng hợp ở một mức lãi vay, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Phần cột tăng thêm khi lãi vay tăng là do đòn bẩy tài chính; mức cột khi không vay đồng nào là riêng đòn bẩy hoạt động.',
          'Each bar is total leverage at one level of interest; bars grow taller to the right and the solid one is the level you have entered. The extra height that comes with more interest is the work of financial leverage; the height a bar would have with no borrowing at all is operating leverage alone.',
        ),
      },
    },
  },
};
