import type { BieuDoRieng } from '../types';
import { d } from './tao';

/** Nhóm phí & thuế (`fees-tax`, 3 công thức có hình) và nhóm lợi suất (`returns`, 12 công thức). */
export const BIEU_DO_LOI_SUAT: Readonly<Record<string, BieuDoRieng>> = {
  'gia-hoa-von': {
    truc: {
      quantity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Khối lượng, từ một nửa đến gấp rưỡi số cổ phiếu bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Đây là phép thử nếu mua nhiều hay ít hơn thì giá hoà vốn ra bao nhiêu, không phải diễn biến thị trường. Đường nằm ngang: tiền mua, phí mua, phí lưu ký và phần phí với thuế lúc bán đều lớn lên theo đúng số cổ phiếu, nên khối lượng rút gọn hết và giá hoà vốn của một cổ phiếu không đổi.',
          'The line runs left to right along the Quantity field, from half to one and a half times the number of shares you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on buying more or fewer shares, not market history. The line is flat: the purchase cost, the buying fee, the custody fee and the selling fee and tax all scale with the number of shares, so quantity cancels out and the break-even price of one share does not move.',
        ),
        cot: d(
          'Mỗi cột là giá hoà vốn ở một mức khối lượng, và các cột cao bằng nhau; cột tô đặc là mức bạn đang nhập. Dãy cột bằng phẳng ấy là câu trả lời: mua nhiều hay ít không làm giá phải bán để hoà vốn đổi đi, chỉ giá mua và thời gian nắm giữ mới làm được.',
          'Each bar is the break-even price at one quantity, and all the bars are the same height; the solid one is the quantity you have entered. That level row is the answer: buying more or fewer shares does not change the price you must sell at to break even, only the buy price and the holding time do.',
        ),
      },
      months: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thời gian nắm giữ, từ một nửa đến gấp rưỡi số tháng bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số tháng bạn nhập. Đây là phép thử nếu giữ cổ phiếu lâu hay chóng hơn thì giá hoà vốn ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: mỗi tháng giữ thêm là thêm một tháng phí lưu ký phải bù lại. Trục dọc đã phóng to sát quanh đường nên trông dốc, chứ thật ra khoản phí này rất nhỏ so với giá mua.',
          'The line runs left to right along the Holding period field, from half to one and a half times the number of months you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on holding the shares for longer or shorter, not market history. The line rises steadily: every extra month held is one more month of custody fee to earn back. The vertical axis is zoomed in tight around the line, so it looks steep, while in fact this fee is tiny next to the buy price.',
        ),
        cot: d(
          'Mỗi cột là giá hoà vốn ở một thời gian nắm giữ, cột tô đặc là số tháng bạn đang nhập. Ở dạng Cột, cột được vẽ trọn chiều cao tính từ gốc trục nên các cột trông gần như bằng nhau, và đó mới là tỷ lệ thật: phí lưu ký chỉ nhích giá hoà vốn lên từng chút một.',
          'Each bar is the break-even price at one holding period, and the solid one is the number of months you have entered. As bars the full height from the base of the axis is drawn, so the bars look almost equal, and that is the true proportion: the custody fee nudges the break-even price up only a little at a time.',
        ),
      },
      buyPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua, từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu mua ở giá khác thì phải bán từ giá nào mới không lỗ, không phải diễn biến thị trường. Đường đi lên đều và luôn nằm cao hơn chính giá mua một chút: phần nhô lên ấy là phí mua, phí bán, thuế và phí lưu ký cộng lại.',
          'The line runs left to right along the Buy price field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on the price you must sell at to avoid a loss if you had bought at a different price, not market history. The line rises steadily and always sits a little above the buy price itself: that extra height is the buy fee, sell fee, tax and custody fee added together.',
        ),
        cot: d(
          'Mỗi cột là giá hoà vốn ở một mức giá mua, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Đỉnh cột là giá bán thấp nhất để về đúng vốn: bán dưới đỉnh ấy là lỗ dù giá đã cao hơn giá mua.',
          'Each bar is the break-even price at one buy price; bars grow taller to the right and the solid one is the price you have entered. The top of a bar is the lowest selling price that returns your money: selling under it is a loss even when the price is already above what you paid.',
        ),
      },
    },
  },

  'loi-nhuan-rong': {
    truc: {
      quantity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Khối lượng, từ một nửa đến gấp rưỡi số cổ phiếu bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Đây là phép thử nếu mua bán nhiều hay ít hơn ở đúng hai mức giá ấy thì lợi nhuận ròng ra bao nhiêu, không phải diễn biến thị trường. Khi mỗi cổ phiếu đang có lãi sau phí và thuế, đường đi lên đều: lãi của một cổ phiếu không đổi, nên khối lượng nhân lên bao nhiêu thì tiền lãi nhân lên bấy nhiêu. Khi giá bán chưa đủ bù giá mua và phí thì đường đi xuống: cũng chính khối lượng nhân khoản lỗ lên.',
          'The line runs left to right along the Quantity field, from half to one and a half times the number of shares you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on trading more or fewer shares at those same two prices, not market history. When each share is in profit after fees and tax the line rises steadily: the gain per share is fixed, so the total grows in step with the quantity. When the sell price does not cover the buy price and the costs the line falls: quantity multiplies the loss in the same way.',
        ),
        cot: d(
          'Mỗi cột là lợi nhuận ròng ở một mức khối lượng, cột tô đặc là mức bạn đang nhập. Khi mỗi cổ phiếu đang có lãi, cột cao dần về bên phải; đang lỗ thì cột quay xuống dưới và dài dần. Chia chiều dài một cột cho khối lượng của nó thì cột nào cũng ra cùng một con số: lãi hay lỗ ròng trên mỗi cổ phiếu.',
          'Each bar is the net profit at one quantity, and the solid one is the quantity you have entered. When each share is in profit the bars grow taller to the right; at a loss they hang down and grow longer. Divide any bar’s length by its own quantity and you get the same figure every time: the net gain or loss per share.',
        ),
      },
      months: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thời gian nắm giữ, từ một nửa đến gấp rưỡi số tháng bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số tháng bạn nhập. Đây là phép thử nếu giữ cổ phiếu lâu hay chóng hơn thì lợi nhuận ròng ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: giá mua và giá bán đứng yên, nên thứ duy nhất đổi theo thời gian là phí lưu ký, mỗi tháng trừ thêm một khoản bằng nhau. Trục dọc đã phóng to sát quanh đường nên trông dốc, còn khoản phí ấy rất nhỏ so với tiền lãi.',
          'The line runs left to right along the Holding period field, from half to one and a half times the number of months you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on holding the shares for longer or shorter, not market history. The line falls steadily: with both prices held still the only thing that changes over time is the custody fee, which takes the same small amount every month. The vertical axis is zoomed in tight around the line, so it looks steep, while that fee is tiny next to the profit.',
        ),
        cot: d(
          'Mỗi cột là lợi nhuận ròng ở một thời gian nắm giữ, cột tô đặc là số tháng bạn đang nhập. Ở dạng Cột, cột được vẽ trọn chiều cao tính từ gốc trục nên các cột trông gần như bằng nhau: giữ lâu hơn vài tháng gần như không ăn vào lãi qua đường phí lưu ký.',
          'Each bar is the net profit at one holding period, and the solid one is the number of months you have entered. As bars the full height from the base of the axis is drawn, so the bars look almost equal: holding a few months longer barely eats into the profit through the custody fee.',
        ),
      },
      buyPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua, từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu ngày ấy bạn mua ở một giá khác mà giá bán đứng yên thì lợi nhuận ròng ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: mua càng đắt thì khoảng chênh với giá bán càng hẹp, và từ chỗ đường cắt xuống dưới 0 trở đi là lỗ.',
          'The line runs left to right along the Buy price field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on having bought at a different price with the sell price held still, not market history. The line falls steadily: the more you paid, the narrower the gap to the sell price, and from where the line crosses below 0 onward it is a loss.',
        ),
        cot: d(
          'Mỗi cột là lợi nhuận ròng ở một mức giá mua, cột tô đặc là mức giá bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 là lỗ; chỗ đổi chiều nằm thấp hơn giá bán một chút, vì phí và thuế đã lấy đi phần chênh ấy.',
          'Each bar is the net profit at one buy price, and the solid one is the price you have entered. Bars above the zero line are gains, bars below the zero line are losses; the turning point sits a little under the sell price, because fees and tax take that difference.',
        ),
      },
      sellPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá bán, từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu bán ở giá khác thì còn lại bao nhiêu tiền lãi, không phải diễn biến thị trường. Đường đi lên đều: giá bán cao thêm bao nhiêu thì lãi thêm bấy nhiêu nhân với khối lượng, trừ đi phần phí bán và thuế tính trên chính giá ấy. Chỗ đường cắt mức 0 là giá hoà vốn.',
          'The line runs left to right along the Sell price field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on what you keep if you sold at another price, not market history. The line rises steadily: each step up in selling price adds that step times the quantity, less the sell fee and tax charged on that same price. Where the line crosses 0 is the break-even price.',
        ),
        cot: d(
          'Mỗi cột là lợi nhuận ròng ở một mức giá bán, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 là lỗ; cột càng dài về phía nào thì khoản lãi hay lỗ ấy càng lớn.',
          'Each bar is the net profit at one selling price, and the solid one is the price you have entered. A bar standing above the zero line is a gain, one hanging below the zero line is a loss; the longer it reaches either way, the bigger that gain or loss.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là số tiền lãi ròng nếu bạn bán ở giá đóng cửa của phiên đó, còn giá mua và khối lượng vẫn là con số bạn nhập. Hình này đi theo đúng chuỗi giá bạn đã nạp, áp vào chính lệnh mua của bạn. Đường đi lên là khoản lãi đang lớn dần theo giá, đi xuống là lãi đang bị ăn mòn hoặc lỗ đang sâu thêm.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the net profit had you sold at that session’s closing price, with your buy price and quantity kept as entered. It follows the price series you loaded, applied to your own purchase. When it rises your gain is growing with the price; when it falls the gain is being eaten away or the loss is deepening.',
      ),
      cot: d(
        'Mỗi cột là lợi nhuận ròng nếu bán ở một phiên, cột cuối bên phải là phiên gần nhất. Cột cao nhất trong dãy là phiên lẽ ra bán được giá tốt nhất; mọi cột nằm dưới vạch 0 là những phiên bán ra sẽ lỗ.',
        'Each bar is the net profit from selling in one session, the last one on the right being the latest. The tallest bar in the row is the session that would have been the best exit; every bar below the zero line is a session where selling meant a loss.',
      ),
    },
  },

  'roi-rong': {
    truc: {
      quantity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Khối lượng, từ một nửa đến gấp rưỡi số cổ phiếu bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Đây là phép thử nếu mua bán nhiều hay ít hơn thì ROI ròng ra bao nhiêu, không phải diễn biến thị trường. Đường nằm ngang: cả tiền lãi lẫn số vốn bỏ ra đều lớn lên theo đúng số cổ phiếu, nên tỷ suất giữa chúng không đổi. Khối lượng quyết định bạn lãi bao nhiêu đồng, không quyết định bạn lãi bao nhiêu phần trăm.',
          'The line runs left to right along the Quantity field, from half to one and a half times the number of shares you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on trading more or fewer shares, not market history. The line is flat: both the profit and the capital put in scale with the number of shares, so the ratio between them stays the same. Quantity decides how much money you make, not what percentage you make.',
        ),
        cot: d(
          'Mỗi cột là ROI ròng ở một mức khối lượng, và các cột cao bằng nhau; cột tô đặc là mức bạn đang nhập. Muốn thấy khối lượng tác động tới đâu thì xem lợi nhuận ròng tính bằng đồng, ở đó cột lớn dần theo khối lượng.',
          'Each bar is the net ROI at one quantity, and all the bars are the same height; the solid one is the quantity you have entered. To see what quantity does change, look at net profit in money terms, where the bars grow with quantity.',
        ),
      },
      months: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thời gian nắm giữ, từ một nửa đến gấp rưỡi số tháng bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số tháng bạn nhập. Đây là phép thử nếu giữ cổ phiếu lâu hay chóng hơn thì ROI ròng ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: phí lưu ký cộng dồn theo tháng vừa bớt tiền lãi vừa thêm vào vốn bỏ ra. Trục dọc đã phóng to sát quanh đường nên trông dốc, còn mức đổi thật thì nhỏ hơn nhiều so với một bước giá.',
          'The line runs left to right along the Holding period field, from half to one and a half times the number of months you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on holding the shares for longer or shorter, not market history. The line falls steadily: the custody fee builds up month by month, trimming the profit and adding to the capital put in. The vertical axis is zoomed in tight around the line, so it looks steep, while the real change is far smaller than a single price tick.',
        ),
        cot: d(
          'Mỗi cột là ROI ròng ở một thời gian nắm giữ, cột tô đặc là số tháng bạn đang nhập. Các cột trông gần như bằng nhau vì phí lưu ký rất nhỏ; nhưng nhớ rằng con số này không quy về năm, nên cùng một chiều cao cột mà giữ lâu gấp đôi là vốn làm việc kém hiệu quả bằng một nửa.',
          'Each bar is the net ROI at one holding period, and the solid one is the number of months you have entered. The bars look almost equal because the custody fee is so small; but remember this figure is not annualized, so the same bar height earned over twice the time means the capital worked half as hard.',
        ),
      },
      buyPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua, từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu ngày ấy bạn mua ở một giá khác mà giá bán đứng yên thì ROI ròng ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: mua càng đắt thì vừa lãi ít đi vừa phải bỏ nhiều vốn hơn, nên tỷ suất tụt nhanh ở đầu bên trái rồi chậm lại; từ chỗ đường cắt xuống dưới 0 trở đi là lỗ.',
          'The line runs left to right along the Buy price field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on having bought at a different price with the sell price held still, not market history. The line falls and flattens: a higher buy price both shrinks the gain and enlarges the capital put in, so the return drops fast on the left and then more slowly; from where the line crosses below 0 onward it is a loss.',
        ),
        cot: d(
          'Mỗi cột là ROI ròng ở một mức giá mua, cột tô đặc là mức giá bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 là lỗ; các cột bên trái cao vọt vì mua rẻ một nửa thì lãi gấp nhiều lần chứ không chỉ gấp đôi.',
          'Each bar is the net ROI at one buy price, and the solid one is the price you have entered. Bars above the zero line are gains, bars below the zero line are losses; the bars on the left tower because buying at half the price multiplies the return many times over, not just twice.',
        ),
      },
      sellPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá bán, từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu bán ở giá khác thì tỷ suất lãi trên vốn thực bỏ ra là bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: vốn bỏ ra đã cố định từ lúc mua, nên giá bán càng cao thì phần trăm lãi càng lớn. Chỗ đường cắt mức 0 là giá hoà vốn.',
          'The line runs left to right along the Sell price field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on the return on the money you actually put in if you sold at another price, not market history. The line rises steadily: the outlay was fixed the day you bought, so a higher selling price means a bigger percentage gain. Where the line crosses 0 is the break-even price.',
        ),
        cot: d(
          'Mỗi cột là ROI ròng ở một mức giá bán, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là lãi tính theo phần trăm vốn, cột quay xuống dưới vạch 0 là lỗ; nhờ là phần trăm nên so được hai lệnh có số vốn khác nhau.',
          'Each bar is the net ROI at one selling price, and the solid one is the price you have entered. A bar standing above the zero line is a gain as a percentage of capital, one hanging below the zero line is a loss; being a percentage, it lets you compare two trades of different sizes.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là ROI ròng nếu bạn bán ở giá đóng cửa của phiên đó, còn giá mua và khối lượng vẫn là con số bạn nhập. Hình này đi theo đúng chuỗi giá bạn đã nạp, áp vào chính lệnh mua của bạn. Đường đi lên là tỷ suất lãi trên vốn đang cải thiện, đi xuống là nó đang xấu đi.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the net ROI had you sold at that session’s closing price, with your buy price and quantity kept as entered. It follows the price series you loaded, applied to your own purchase. When it rises your return on capital is improving; when it falls it is getting worse.',
      ),
      cot: d(
        'Mỗi cột là ROI ròng nếu bán ở một phiên, cột cuối bên phải là phiên gần nhất. Cột nằm trên vạch 0 là phiên bán ra có lãi sau phí và thuế; cột dưới vạch 0 là phiên bán ra vẫn lỗ.',
        'Each bar is the net ROI from selling in one session, the last one on the right being the latest. A bar above the zero line is a session where selling paid after fees and tax; one below the zero line is a session where selling still lost money.',
      ),
    },
  },

  roi: {
    truc: {
      cost: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn bỏ ra, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số vốn ban đầu khác đi mà giá trị hiện tại đứng yên thì ROI ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: cùng một giá trị hôm nay mà phải bỏ ra càng nhiều vốn thì tỷ suất càng thấp, và khi vốn vượt giá trị hiện tại thì đường xuống dưới 0, tức đang lỗ.',
          'The line runs left to right along the Capital invested field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different starting outlay with the current value held still, not market history. The line falls and flattens: reaching the same value today from a larger outlay means a lower return, and once the outlay exceeds the current value the line drops below 0, which is a loss.',
        ),
        cot: d(
          'Mỗi cột là ROI ở một mức vốn bỏ ra, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 ở bên phải là lỗ; chỗ đổi chiều là mức vốn bằng đúng giá trị hiện tại.',
          'Each bar is ROI at one outlay, and the solid one is the outlay you have entered. Bars above the zero line are gains, bars below the zero line on the right are losses; they switch over where the outlay equals the current value exactly.',
        ),
      },
      current: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá trị hiện tại, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu khoản đầu tư đang đáng giá khác đi thì ROI ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: vốn bỏ ra giữ nguyên, giá trị hiện tại cao thêm bao nhiêu thì phần trăm lãi cao thêm bấy nhiêu. Chỗ đường cắt mức 0 là lúc giá trị hiện tại vừa bằng vốn.',
          'The line runs left to right along the Current value field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on what the investment is worth now, not market history. The line rises steadily: with the outlay held still, every step up in current value adds the same step to the percentage gain. Where the line crosses 0 the current value just equals the money put in.',
        ),
        cot: d(
          'Mỗi cột là ROI ở một mức giá trị hiện tại, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 là lỗ; chiều dài cột là phần trăm so với vốn ban đầu.',
          'Each bar is ROI at one current value, and the solid one is the level you have entered. A bar standing above the zero line is a gain, one hanging below the zero line is a loss; its length is the percentage of the original outlay.',
        ),
      },
    },
  },

  hpr: {
    truc: {
      startPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá đầu kỳ, từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu giá lúc bắt đầu nắm giữ khác đi mà giá cuối kỳ và cổ tức đứng yên thì HPR ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: vào giá càng cao thì phần tăng giá càng mỏng mà vốn gốc càng lớn; đường xuống dưới 0 khi giá đầu kỳ vượt giá cuối kỳ cộng cổ tức.',
          'The line runs left to right along the Starting price field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on a different price at the start of the holding period with the ending price and the dividend held still, not market history. The line falls and flattens: the higher the entry price, the thinner the price gain and the larger the base it is measured on; the line drops below 0 once the starting price exceeds the ending price plus the dividend.',
        ),
        cot: d(
          'Mỗi cột là HPR ở một mức giá đầu kỳ, cột tô đặc là mức giá bạn đang nhập. Cột mọc lên trên vạch 0 là kỳ nắm giữ có lãi, cột quay xuống dưới vạch 0 ở bên phải là lỗ dù đã cộng cổ tức.',
          'Each bar is HPR at one starting price, and the solid one is the price you have entered. Bars above the zero line are holding periods that made money; bars below the zero line on the right lost money even after the dividend.',
        ),
      },
      endPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá cuối kỳ, từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu giá cuối kỳ khác đi thì lợi suất cả kỳ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: giá đầu kỳ và cổ tức giữ nguyên, giá cuối kỳ càng cao thì lợi suất càng lớn. Chỗ đường cắt mức 0 nằm thấp hơn giá đầu kỳ một chút, vì cổ tức đã bù một phần.',
          'The line runs left to right along the Ending price field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on where the price ends the period, not market history. The line rises steadily: with the starting price and dividend held still, a higher ending price means a larger return. It crosses 0 slightly below the starting price, because the dividend makes up part of the gap.',
        ),
        cot: d(
          'Mỗi cột là HPR ở một mức giá cuối kỳ, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là kỳ nắm giữ có lãi, cột quay xuống dưới vạch 0 là lỗ dù đã cộng cổ tức.',
          'Each bar is the HPR at one ending price, and the solid one is the price you have entered. A bar standing above the zero line is a holding period that paid, one hanging below the zero line is a loss even after the dividend.',
        ),
      },
      dividend: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Cổ tức nhận trong kỳ, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu cổ tức nhận được khác đi mà hai mức giá đứng yên thì HPR ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: mỗi đồng cổ tức cộng thẳng vào phần lãi, tính trên cùng một giá đầu kỳ.',
          'The line runs left to right along the Dividends received during the period field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different dividend with both prices held still, not market history. The line rises steadily: every unit of dividend adds straight to the gain, measured on the same starting price.',
        ),
        cot: d(
          'Mỗi cột là HPR ở một mức cổ tức, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Phần chênh giữa cột thấp nhất và cột cao nhất cho thấy cổ tức góp bao nhiêu vào lợi suất so với phần tăng giá.',
          'Each bar is HPR at one dividend level; bars grow taller to the right and the solid one is the level you have entered. The spread between the shortest and the tallest bar shows how much the dividend contributes to the return next to the price gain.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là lợi suất kỳ nắm giữ nếu kỳ kết thúc ở giá đóng cửa của phiên đó, còn giá đầu kỳ và cổ tức vẫn là con số bạn nhập. Hình này đi theo đúng chuỗi giá bạn đã nạp, tính từ giá đầu kỳ của bạn. Đường đi lên là lợi suất đang tích luỹ thêm, đi xuống là phần lãi đang bị trả lại.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the holding period return had the period ended at that session’s closing price, with your starting price and dividend kept as entered. It follows the price series you loaded, measured from your starting price. When it rises the return is still building; when it falls gains are being handed back.',
      ),
      cot: d(
        'Mỗi cột là HPR nếu kỳ nắm giữ kết thúc ở một phiên, cột cuối bên phải là phiên gần nhất. Cột trên vạch 0 là phiên mà tính từ giá đầu kỳ và cộng cả cổ tức thì bạn đang lãi; cột dưới vạch 0 là phiên đang lỗ.',
        'Each bar is the HPR had the holding period ended in one session, the last one on the right being the latest. A bar above the zero line is a session at which, dividend included, you were in profit against your starting price; one below the zero line is a session at which you were at a loss.',
      ),
    },
  },

  cagr: {
    truc: {
      start: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá trị ban đầu, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu điểm xuất phát khác đi mà giá trị cuối kỳ và số năm đứng yên thì CAGR ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: xuất phát càng cao thì quãng đường tới giá trị cuối càng ngắn, nên tốc độ tăng mỗi năm cần có càng thấp.',
          'The line runs left to right along the Starting value field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different starting point with the ending value and the number of years held still, not market history. The line falls and flattens: the higher the start, the shorter the climb to the ending value, so the yearly growth needed is lower.',
        ),
        cot: d(
          'Mỗi cột là CAGR ở một mức giá trị ban đầu, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Chọn năm gốc rơi vào đáy thị trường là tự đặt mình ở cột cao bên trái: CAGR đẹp lên mà khoản đầu tư không tốt hơn.',
          'Each bar is CAGR at one starting value; bars shrink to the right and the solid one is the value you have entered. Picking a base year at a market bottom puts you on a tall bar to the left: the CAGR looks better while the investment is no better.',
        ),
      },
      end: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá trị cuối kỳ, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu khoản đầu tư kết thúc ở mức khác thì tốc độ tăng mỗi năm là bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: số năm giữ nguyên, giá trị cuối càng lớn thì tốc độ tăng bình quân càng cao, song mỗi phần giá trị thêm vào nâng tốc độ ấy ít hơn phần trước.',
          'The line runs left to right along the Ending value field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on where the investment ends up, not market history. The line rises but flattens: with the years held still, a larger ending value means a higher average yearly growth, yet each extra slice of value lifts that rate less than the slice before.',
        ),
        cot: d(
          'Mỗi cột là CAGR ở một mức giá trị cuối kỳ, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột là mức tăng đều mỗi năm cần có để đi từ giá trị đầu tới giá trị cuối ấy.',
          'Each bar is the CAGR at one ending value; bars grow taller to the right and the solid one is the level you have entered. Bar height is the even yearly growth needed to get from the starting value to that ending value.',
        ),
      },
      years: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số năm, từ khoảng một nửa đến khoảng gấp rưỡi số năm bạn đang nhập, mỗi điểm cách nhau một năm; vạch đứt dọc có chấm tròn là đúng số năm bạn nhập. Đây là phép thử nếu cùng mức tăng ấy trải ra nhiều hay ít năm hơn thì CAGR ra bao nhiêu, không phải diễn biến thị trường. Khi giá trị cuối cao hơn giá trị đầu, đường đi xuống và thoải dần: cùng một tổng mức tăng mà mất càng nhiều năm thì tốc độ mỗi năm càng thấp. Khoản đầu tư đang lỗ thì đường đi lên: trải càng nhiều năm thì mức lỗ mỗi năm càng nhẹ.',
          'The line runs left to right along the Number of years field, from about half to about one and a half times the number of years you have entered, one point per year; the dashed vertical line with a dot marks your own figure. It is a what-if on spreading the same gain over more or fewer years, not market history. When the ending value is above the starting value the line falls and flattens: the same total gain taking more years means a lower rate per year. For an investment that lost value the line rises: the more years it spans, the milder the yearly loss.',
        ),
        cot: d(
          'Mỗi cột là CAGR ứng với một số năm, cột tô đặc là số năm bạn đang nhập. Khi giá trị cuối cao hơn giá trị đầu, cột thấp dần về bên phải; khoản đầu tư đang lỗ thì cột quay xuống dưới và ngắn dần. Chỉ có vài cột vì ô này nhận số năm tròn; đếm thừa hay thiếu một năm là nhảy sang cột bên cạnh, và khoảng nhảy ấy không nhỏ.',
          'Each bar is CAGR for one number of years, and the solid one is the number you have entered. When the ending value is above the starting value the bars shrink to the right; for an investment that lost value they hang down and get shorter. There are only a few bars because the field takes whole years; miscounting by one year jumps you to the next bar, and that jump is not small.',
        ),
      },
    },
  },

  'ty-suat-co-tuc': {
    truc: {
      price: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thị giá, từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu mua ở giá khác thì tỷ suất cổ tức ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: cổ tức mỗi năm giữ nguyên, mua càng đắt thì số tiền cổ tức ấy càng nhỏ so với tiền bỏ ra.',
          'The line runs left to right along the Market price field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on the yield you get by buying at another price, not market history. The line falls and flattens: with the yearly dividend held still, the more you pay, the smaller that dividend is against your outlay.',
        ),
        cot: d(
          'Mỗi cột là tỷ suất cổ tức ở một mức giá, cột thấp dần về bên phải và cột tô đặc là mức giá bạn đang nhập. Chiều cao cột so được thẳng với lãi suất tiết kiệm cùng kỳ hạn.',
          'Each bar is the dividend yield at one price level; bars shrink to the right and the solid one is the price you have entered. Bar height compares directly with a savings rate for the same term.',
        ),
      },
      dividendPerShare: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Cổ tức cả năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mức cổ tức đổi mà thị giá đứng yên thì tỷ suất cổ tức ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cùng một giá mua, doanh nghiệp chia thêm bao nhiêu phần thì tỷ suất tăng bấy nhiêu phần.',
          'The line runs left to right along the Annual dividend field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the dividend with the market price held still, not market history. The line rises steadily: at the same purchase price, the yield grows in exact proportion to what the company pays out.',
        ),
        cot: d(
          'Mỗi cột là tỷ suất cổ tức ở một mức cổ tức, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Các cột bên trái cho thấy tỷ suất còn lại bao nhiêu nếu doanh nghiệp cắt cổ tức, điều bảng giá hôm nay không báo trước.',
          'Each bar is the dividend yield at one dividend level; bars grow taller to the right and the solid one is the level you have entered. The bars on the left show what yield is left if the company cuts its dividend, something today’s price board does not warn about.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là tỷ suất cổ tức tính với giá đóng cửa của phiên đó, còn cổ tức cả năm vẫn là con số bạn nhập. Hình này đi theo chuỗi giá bạn đã nạp, nhưng đi NGƯỢC chiều giá. Đường đi lên là giá đang giảm nên cùng số cổ tức ấy thành tỷ suất cao hơn, đi xuống là giá đang tăng.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the dividend yield at that session’s closing price, with the yearly dividend kept at the figure you entered. It follows the price series you loaded, but moves AGAINST the price. When it rises the price is dropping, so the same dividend makes a higher yield; when it falls the price is climbing.',
      ),
      cot: d(
        'Mỗi cột là tỷ suất cổ tức của một phiên, cột cuối bên phải là phiên gần nhất. Cột cao nhất trong dãy là phiên mua vào được tỷ suất tốt nhất, và đó cũng là phiên giá thấp nhất.',
        'Each bar is the dividend yield of one session, the last one on the right being the latest. The tallest bar in the row is the session that offered the best yield to a buyer, which is also the session with the lowest price.',
      ),
    },
  },

  'loi-suat-nam-hoa': {
    truc: {
      periodReturn: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất một kỳ, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lợi suất của một kỳ khác đi mà số kỳ trong năm đứng yên thì lợi suất năm ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc dần: lãi của kỳ sau tính trên cả lãi của kỳ trước, nên lợi suất một kỳ tăng gấp đôi thì lợi suất năm tăng hơn gấp đôi.',
          'The line runs left to right along the Return per period field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different return per period with the number of periods per year held still, not market history. The line rises and steepens: each period’s return is earned on the earlier ones as well, so doubling the return per period more than doubles the annual figure.',
        ),
        cot: d(
          'Mỗi cột là lợi suất năm hoá ở một mức lợi suất kỳ, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột cao không phải lời hứa: nó giả định kỳ nào trong năm cũng lặp lại đúng mức lợi suất ấy.',
          'Each bar is the annualized return at one per-period return; bars grow taller to the right and the solid one is the level you have entered. A tall bar is not a promise: it assumes every period of the year repeats exactly that return.',
        ),
      },
      periodsPerYear: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số kỳ trong một năm, từ một nửa đến gấp rưỡi con số bạn đang nhập, mỗi điểm là một số kỳ tròn; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu một năm có số kỳ khác thì lợi suất quy năm ra bao nhiêu, không phải diễn biến thị trường. Khi lợi suất một kỳ dương, đường đi lên: cùng một lợi suất mỗi kỳ, một năm chứa càng nhiều kỳ thì lợi suất ấy được ghép lãi càng nhiều lần. Lợi suất một kỳ âm thì đường đi xuống: càng nhiều kỳ thì khoản lỗ cả năm càng sâu.',
          'The line runs left to right along the Number of periods per year field, from half to one and a half times the figure you have entered, one whole number of periods per point; the dashed vertical line with a dot marks your own figure. It is a what-if on how many periods a year holds, not market history. With a positive return per period the line rises: at the same return per period, the more periods a year contains, the more times that return compounds. With a negative return per period the line falls: more periods mean a deeper loss for the year.',
        ),
        cot: d(
          'Mỗi cột là lợi suất quy năm ứng với một số kỳ, cột tô đặc là số kỳ bạn đang nhập. Khi lợi suất một kỳ dương, cột cao dần về bên phải; âm thì cột quay xuống dưới và dài dần. Chọn sai số kỳ là đọc nhầm cả cột: lợi suất tháng phải đi với số kỳ của tháng, lợi suất tuần đi với số kỳ của tuần.',
          'Each bar is the annualized return for one number of periods, and the solid one is the count you have entered. With a positive return per period the bars grow taller to the right; with a negative one they hang down and grow longer. Picking the wrong count means reading the wrong bar: a monthly return goes with the monthly count, a weekly return with the weekly count.',
        ),
      },
    },
  },

  'loi-suat-thuc': {
    truc: {
      nominal: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất danh nghĩa / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lợi suất danh nghĩa đổi thì sức mua thật tăng bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều, và khi lạm phát dương thì nó nằm thấp hơn chính lợi suất danh nghĩa: khoảng hụt ấy là phần lạm phát đã lấy đi.',
          'The line runs left to right along the Nominal return / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the nominal return, not market history. The line rises steadily, and while inflation is positive it sits below the nominal return itself: that shortfall is what inflation has taken.',
        ),
        cot: d(
          'Mỗi cột là lợi suất thực ở một mức lợi suất danh nghĩa, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột càng thấp thì khoản đầu tư càng chỉ vừa đủ chạy theo giá cả.',
          'Each bar is the real return at one nominal return; bars grow taller to the right and the solid one is the level you have entered. The shorter the bar, the closer the investment comes to merely keeping pace with prices.',
        ),
      },
      inflation: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lạm phát / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lạm phát đổi mà lợi suất danh nghĩa đứng yên thì lợi suất thực ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống gần như đều: giá cả leo thang càng nhanh thì cùng một mức lãi trên giấy mua được càng ít hàng hoá hơn.',
          'The line runs left to right along the Inflation / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on inflation with the nominal return held still, not market history. The line falls almost steadily: the faster prices climb, the less the same paper return can actually buy.',
        ),
        cot: d(
          'Mỗi cột là lợi suất thực ở một mức lạm phát, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Khi lạm phát lên bằng đúng lợi suất danh nghĩa thì cột không còn chiều cao: tiền nhiều lên nhưng sức mua đứng yên.',
          'Each bar is the real return at one inflation rate; bars shrink to the right and the solid one is the rate you have entered. When inflation matches the nominal return exactly the bar has no height left: you hold more money but it buys the same.',
        ),
      },
    },
  },

  'lai-suat-hieu-dung': {
    truc: {
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất danh nghĩa / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất niêm yết đổi thì lãi thật cả năm ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên, và khi lãi được ghép từ hai lần một năm trở lên thì nó nằm cao hơn chính lãi suất danh nghĩa: phần nhô lên là lãi sinh trên lãi, và nó dày dần khi lãi suất tăng. Ghép mỗi năm một lần thì đường trùng đúng lãi suất danh nghĩa.',
          'The line runs left to right along the Nominal rate / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the quoted rate, not market history. The line rises, and whenever interest compounds twice a year or more it sits above the nominal rate itself: the extra height is interest earned on interest, and it thickens as the rate goes up. With compounding once a year the line matches the nominal rate exactly.',
        ),
        cot: d(
          'Mỗi cột là lãi suất hiệu dụng ở một mức lãi suất danh nghĩa, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Đỉnh cột là mức lãi nên đem so giữa hai sản phẩm có số lần ghép lãi khác nhau.',
          'Each bar is the effective rate at one nominal rate; bars grow taller to the right and the solid one is the level you have entered. The top of a bar is the rate to compare between two products that compound a different number of times.',
        ),
      },
    },
  },

  'tong-loi-suat-tai-dau-tu': {
    truc: {
      priceGrowth: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tăng giá bình quân / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mỗi năm giá tăng nhanh hay chậm hơn thì tổng lợi suất cả giai đoạn ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc dần: mức tăng giá được ghép qua từng năm, nên mỗi điểm phần trăm thêm vào đem lại nhiều hơn điểm trước đó.',
          'The line runs left to right along the Average price growth / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on prices growing faster or slower each year, not market history. The line rises and steepens: price growth compounds year after year, so each extra percentage point adds more than the one before.',
        ),
        cot: d(
          'Mỗi cột là tổng lợi suất ở một mức tăng giá mỗi năm, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Đây là lợi suất của cả giai đoạn chứ không phải của một năm, nên đừng so chiều cao cột với lãi suất tiết kiệm.',
          'Each bar is the total return at one yearly price growth; bars grow taller to the right and the solid one is the rate you have entered. This is the return over the whole period, not for one year, so do not compare bar height with a savings rate.',
        ),
      },
      dividendYield: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tỷ suất cổ tức / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tỷ suất cổ tức đổi mà mức tăng giá đứng yên thì tổng lợi suất ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên gần như đều: cổ tức nhận về được đem mua thêm cổ phiếu, nên nó cũng sinh lãi kép như phần tăng giá.',
          'The line runs left to right along the Dividend yield / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the dividend yield with price growth held still, not market history. The line rises almost steadily: dividends received buy more shares, so they compound just as the price gain does.',
        ),
        cot: d(
          'Mỗi cột là tổng lợi suất ở một mức tỷ suất cổ tức, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Khoảng chênh giữa hai cột là phần lợi suất mà mức cổ tức cao hơn đem lại khi toàn bộ cổ tức được đem mua thêm cổ phiếu, và nó lớn dần theo số năm nắm giữ. Hình này không so tái đầu tư với tiêu cổ tức: cột nào cũng đã giả định tái đầu tư hết.',
          'Each bar is the total return at one dividend yield; bars grow taller to the right and the solid one is the yield you have entered. The gap between two bars is the extra return a higher yield brings when every dividend buys more shares, and it widens with the years held. The chart does not compare reinvesting with spending: every bar already assumes full reinvestment.',
        ),
      },
      years: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số năm nắm giữ, từ khoảng một nửa đến gấp rưỡi con số bạn đang nhập, mỗi điểm là một số năm tròn; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu giữ lâu hơn hay ngắn hơn thì tổng lợi suất ra bao nhiêu, không phải diễn biến thị trường. Khi tăng giá và cổ tức cộng lại mỗi năm vẫn dương, đường đi lên và càng lúc càng dốc: mức tăng giá được ghép qua từng năm, cổ tức lại đem mua thêm cổ phiếu và số cổ phiếu ấy cũng nhận cổ tức. Khi giá giảm mỗi năm nhiều hơn mức cổ tức bù lại thì đường đi xuống.',
          'The line runs left to right along the Years held field, from about half to one and a half times the figure you have entered, one whole year per point; the dashed vertical line with a dot marks your own figure. It is a what-if on holding longer or shorter, not market history. While price growth and dividends together stay positive each year, the line rises and keeps steepening: price growth compounds year after year, and dividends buy more shares that earn dividends too. When the price falls each year by more than the dividends make up, the line falls.',
        ),
        cot: d(
          'Mỗi cột là tổng lợi suất sau một số năm, cột tô đặc là số năm bạn đang nhập. Khi tăng giá và cổ tức cộng lại mỗi năm vẫn dương, cột cao dần về bên phải và bậc giữa hai cột cạnh nhau cũng lớn dần: đó là lãi kép, năm sau sinh lời trên số vốn đã lớn lên nhờ cả giá tăng lẫn cổ tức tái đầu tư. Giá giảm nhiều hơn mức cổ tức bù lại thì cột quay xuống dưới và dài dần.',
          'Each bar is the total return after one number of years, and the solid one is the count you have entered. While price growth and dividends together stay positive each year the bars grow taller to the right and the step between neighbors widens too: that is compounding, each later year earning on capital already enlarged by price gains and reinvested dividends. When the price falls by more than the dividends make up, the bars hang down and grow longer.',
        ),
      },
    },
  },

  'loi-suat-trung-binh-hinh-hoc': {
    truc: {
      r1: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất kỳ 1, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu riêng kỳ đầu khác đi còn các kỳ kia đứng yên thì lợi suất trung bình hình học ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên: một kỳ tốt hơn kéo mức trung bình lên, nhưng chỉ kéo được một phần, vì nó bị chia đều cho mọi kỳ.',
          'The line runs left to right along the Return in period 1 field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the first period alone with the other periods held still, not market history. The line rises: one better period lifts the average, but only by a fraction, because it is shared out across all the periods.',
        ),
        cot: d(
          'Mỗi cột là lợi suất trung bình hình học ứng với một mức của kỳ đầu, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Bước giữa hai cột nhỏ hơn hẳn bước của riêng kỳ ấy: một kỳ không quyết định được mức trung bình.',
          'Each bar is the geometric mean return for one level of the first period; bars grow taller to the right and the solid one is the level you have entered. The step between two bars is much smaller than the step in that period itself: one period alone does not decide the average.',
        ),
      },
      r2: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất kỳ 2. Con số mặc định của ô là một mức lỗ, nên trục chạy từ gấp rưỡi mức lỗ ấy ở bên trái đến một nửa mức lỗ ấy ở bên phải; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu riêng kỳ thứ hai khác đi thì lợi suất trung bình hình học ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên: kỳ lỗ càng nhẹ thì mức trung bình càng cao, và một kỳ lỗ kéo trung bình xuống mạnh hơn một kỳ lãi cùng cỡ kéo nó lên.',
          'The line runs left to right along the Return in period 2 field. The field’s default is a loss, so the axis runs from one and a half times that loss on the left to half of it on the right; the dashed vertical line with a dot marks your own figure. It is a what-if on the second period alone, not market history. The line rises: the lighter the losing period, the higher the average, and a losing period drags the average down harder than a winning one of the same size lifts it.',
        ),
        cot: d(
          'Mỗi cột là lợi suất trung bình hình học ứng với một mức của kỳ thứ hai, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Dãy cột cho thấy cái giá của một kỳ lỗ: bớt lỗ đi một nửa nâng mức trung bình của cả chuỗi lên thấy rõ.',
          'Each bar is the geometric mean return for one level of the second period; bars grow taller to the right and the solid one is the level you have entered. The row shows what a losing period costs: halving that loss lifts the average of the whole run visibly.',
        ),
      },
      r3: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất kỳ 3, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu riêng kỳ cuối khác đi thì lợi suất đều mỗi kỳ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên, nhưng mức bình quân nhích lên ít hơn hẳn chính lợi suất kỳ ấy: một kỳ tốt lên chỉ kéo mức bình quân của cả chuỗi lên một phần.',
          'The line runs left to right along the Return in period 3 field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the last period alone, not market history. The line rises, but the average moves up far less than that period’s own return: one better period lifts the average of the whole run only in part.',
        ),
        cot: d(
          'Mỗi cột là lợi suất trung bình hình học ứng với một mức lợi suất kỳ cuối, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Các cột chênh nhau thấy rõ, nhưng quãng chênh ấy nhỏ hơn hẳn quãng đổi của riêng kỳ cuối: mức bình quân của nhiều kỳ chỉ nhận một phần cú đổi của một kỳ.',
          'Each bar is the geometric mean return for one level of the last period’s return; bars grow taller to the right and the solid one is the level you have entered. The bars do differ visibly, yet far less than the last period’s own return changes: an average over several periods takes on only part of one period’s move.',
        ),
      },
    },
    // Kỳ thứ tư trở đi, do người dùng thêm — một đoạn mẫu cho mọi kỳ thêm, xem `BieuDoRieng.trucLap`.
    trucLap: {
      r: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất kỳ {n}; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Khi ô đã có số, trục chạy từ một nửa đến gấp rưỡi con số ấy; khi ô còn là 0, trục trải suốt miền của ô, từ mức mất trắng tới mức lãi lớn nhất ô cho nhập. Đây là phép thử nếu riêng kỳ này khác đi còn các kỳ kia đứng yên thì lợi suất trung bình hình học ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên: một kỳ tốt hơn kéo mức trung bình lên, nhưng chỉ kéo được một phần, vì nó bị chia đều cho mọi kỳ.',
          'The line runs left to right along the Return in period {n} field; the dashed vertical line with a dot marks your own figure. Once the field holds a number the axis runs from half to one and a half times it; while the field is still 0 the axis spans the field’s whole range, from a total loss to the largest gain the field accepts. It is a what-if on this period alone with the other periods held still, not market history. The line rises: one better period lifts the average, but only by a fraction, because it is shared out across all the periods.',
        ),
        cot: d(
          'Mỗi cột là lợi suất trung bình hình học ứng với một mức của kỳ thứ {n}, cột tô đặc là mức bạn đang nhập. Càng về bên phải kết quả càng lớn: cột mọc lên thì cao dần, còn cột đang treo dưới vạch 0 thì ngắn dần. Bước giữa hai cột nhỏ hơn hẳn bước của riêng kỳ ấy: một kỳ không quyết định được mức trung bình.',
          'Each bar is the geometric mean return for one level of period {n}, and the solid one is the level you have entered. The result grows toward the right: bars standing up grow taller, and bars hanging below the zero line get shorter. The step between two bars is much smaller than the step in that period itself: one period alone does not decide the average.',
        ),
      },
    },
  },

  'irr-nien-kim': {
    truc: {
      investment: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn bỏ ra ban đầu, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số vốn bỏ ra khác đi mà dòng thu mỗi kỳ và số kỳ đứng yên thì IRR ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: cùng một chuỗi tiền thu về mà phải bỏ ra càng nhiều thì suất sinh lợi càng thấp; đường xuống dưới 0 khi tổng tiền thu về không còn đủ hoàn vốn.',
          'The line runs left to right along the Initial capital invested field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different outlay with the payment per period and the number of periods held still, not market history. The line falls and flattens: paying more for the same stream of receipts means a lower rate of return; the line drops below 0 once the receipts no longer add up to the outlay.',
        ),
        cot: d(
          'Mỗi cột là IRR mỗi kỳ ở một mức vốn bỏ ra, cột tô đặc là mức bạn đang nhập. Cột quay xuống dưới vạch 0 ở bên phải là vùng trả giá quá cao: cộng hết các kỳ thu về vẫn chưa bằng số vốn.',
          'Each bar is the IRR per period at one outlay, and the solid one is the outlay you have entered. Bars hanging below the zero line on the right mark overpaying: all the receipts added together still fall short of the outlay.',
        ),
      },
      payment: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Dòng thu đều mỗi kỳ, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu khoản thu mỗi kỳ khác đi mà vốn bỏ ra và số kỳ đứng yên thì IRR ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên: mỗi kỳ thu về càng nhiều thì suất sinh lợi càng cao; ở đầu bên trái đường nằm dưới 0 vì khoản thu nhỏ quá, cộng hết các kỳ vẫn chưa hoàn vốn.',
          'The line runs left to right along the Equal payment received per period field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different payment per period with the outlay and the number of periods held still, not market history. The line rises: the more each period pays, the higher the rate of return; at the far left it sits below 0 because the payment is too small for all the periods together to return the outlay.',
        ),
        cot: d(
          'Mỗi cột là IRR mỗi kỳ ở một mức dòng thu, cột tô đặc là mức bạn đang nhập. Cột quay xuống dưới vạch 0 ở bên trái là lỗ; chỗ cột đổi sang mọc lên trên vạch 0 là mức thu vừa đủ hoàn vốn, chưa sinh lời đồng nào.',
          'Each bar is the IRR per period at one payment level, and the solid one is the level you have entered. Bars below the zero line on the left are losses; where they flip to stand above the zero line is the payment that just returns the outlay, with no gain at all.',
        ),
      },
      periods: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số kỳ nhận tiền, từ khoảng một nửa đến gấp rưỡi con số bạn đang nhập, mỗi điểm là một số kỳ tròn; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu nhận tiền thêm hay bớt vài kỳ thì IRR ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: nhận càng nhiều kỳ thì càng lãi, và mấy kỳ đầu quyết định nhiều nhất vì chúng đưa tổng tiền thu về vượt qua số vốn đã bỏ ra.',
          'The line runs left to right along the Number of periods receiving payments field, from about half to one and a half times the figure you have entered, one whole period per point; the dashed vertical line with a dot marks your own figure. It is a what-if on receiving a few more or fewer payments, not market history. The line rises but flattens: more payments mean more profit, and the early ones matter most because they carry total receipts past the money you put in.',
        ),
        cot: d(
          'Mỗi cột là IRR ứng với một số kỳ nhận tiền, cột tô đặc là số kỳ bạn đang nhập. Cột quay xuống dưới vạch 0 là số kỳ chưa đủ để thu hồi vốn; chỗ cột đổi sang mọc lên trên vạch 0 là số kỳ vừa hoàn vốn.',
          'Each bar is the IRR for one number of payments, and the solid one is the count you have entered. A bar hanging below the zero line is too few payments to recover the outlay; where bars switch to standing above the zero line, the outlay has just been recovered.',
        ),
      },
    },
  },

  'thoi-gian-nhan-doi': {
    truc: {
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất kép / năm, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lợi suất mỗi năm đổi thì mất bao lâu để vốn gấp đôi, không phải diễn biến thị trường. Đường đi xuống và thoải dần: lợi suất càng cao thì chờ càng ngắn, nhưng một điểm lợi suất thêm vào ở mức thấp rút ngắn được nhiều năm hơn hẳn một điểm thêm vào ở mức cao.',
          'The line runs left to right along the Compound return / year field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the yearly return, not market history. The line falls and flattens: a higher return means a shorter wait, but one extra point at a low return saves far more years than one extra point at a high return.',
        ),
        cot: d(
          'Mỗi cột là số năm để vốn gấp đôi ở một mức lợi suất, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột thấp là tốt ở biểu đồ này: nó là thời gian phải chờ.',
          'Each bar is the years needed to double the money at one rate of return; bars shrink to the right and the solid one is the level you have entered. A short bar is the good one on this chart: it is time spent waiting.',
        ),
      },
    },
  },

  'loi-suat-quy-nam-theo-ngay': {
    truc: {
      buyPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua, từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu ngày ấy bạn mua ở một giá khác mà giá bán và số ngày đứng yên thì lợi suất quy năm ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống rất dốc ở đầu bên trái rồi thoải dần: phép quy năm nhân mức lãi của một quãng ngắn lên nhiều lần, nên chênh lệch nhỏ ở giá mua bị phóng thành chênh lệch rất lớn; đường xuống dưới 0 khi giá mua vượt giá bán.',
          'The line runs left to right along the Buy price field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on having bought at a different price with the sell price and the number of days held still, not market history. The line falls very steeply on the left and then flattens: annualizing multiplies the gain of a short stretch many times over, so a small difference in the buy price is blown up into a very large one; the line drops below 0 once the buy price exceeds the sell price.',
        ),
        cot: d(
          'Mỗi cột là lợi suất quy năm ở một mức giá mua, cột tô đặc là mức giá bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 là lỗ; vài cột ngoài cùng bên trái cao áp đảo, nên các cột quanh mức đang nhập trông thấp hẳn dù vẫn là lợi suất cao.',
          'Each bar is the annualized return at one buy price, and the solid one is the price you have entered. Bars above the zero line are gains, bars below the zero line are losses; the few bars at the far left dwarf the rest, so the ones around your own price look short even when they are high returns.',
        ),
      },
      sellPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá bán, từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu bán ở giá khác thì lợi suất quy ra cả năm là bao nhiêu, không phải diễn biến thị trường. Đường đi lên, và khi số ngày nắm giữ ngắn hơn một năm thì càng lúc càng dốc: mức lãi của một lần mua bán ngắn ngày bị nhân lặp lại cho cả năm, nên chênh lệch giá nhỏ cũng thổi thành con số rất lớn ở bên phải. Giữ lâu hơn một năm thì ngược lại, đường thoải dần.',
          'The line runs left to right along the Sell price field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on the yearly equivalent of selling at another price, not market history. The line rises, and with a holding period shorter than a year it keeps steepening: the gain of one short trade is compounded across a whole year, so even a small price gap is blown up into a very large figure on the right. Held for longer than a year it does the opposite and levels off.',
        ),
        cot: d(
          'Mỗi cột là lợi suất quy năm ở một mức giá bán, cột tô đặc là mức bạn đang nhập. Cột quay xuống dưới vạch 0 là bán dưới giá mua; cột bên phải cao vọt là kết quả của phép quy năm chứ không phải mức lãi bạn sẽ thật sự lặp lại được.',
          'Each bar is the annualized return at one selling price, and the solid one is the price you have entered. A bar hanging below the zero line means selling under the buy price; the towering bars on the right come from the annualizing itself, not from a gain you could really repeat.',
        ),
      },
      days: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số ngày nắm giữ, từ một nửa đến gấp rưỡi số ngày bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số ngày bạn nhập. Đây là phép thử nếu cùng mức lãi ấy đạt được trong nhiều hay ít ngày hơn thì lợi suất quy năm ra bao nhiêu, không phải diễn biến thị trường. Khi thương vụ có lãi, đường đi xuống và thoải dần: cùng một mức lãi mà mất càng nhiều ngày thì quy ra cả năm càng thấp. Thương vụ đang lỗ thì đường đi lên: giữ càng lâu mức lỗ quy năm càng nhẹ.',
          'The line runs left to right along the Days held field, from half to one and a half times the number of days you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on earning the same gain in more or fewer days, not market history. For a trade in profit the line falls and flattens: the same gain taking more days works out to less per year. For a losing trade the line rises: the longer it is held, the milder the annualized loss.',
        ),
        cot: d(
          'Mỗi cột là lợi suất quy năm ứng với một số ngày nắm giữ, cột tô đặc là số ngày bạn đang nhập. Khi thương vụ có lãi, cột thấp dần về bên phải, và các cột bên trái cao vọt là cái bẫy của phép quy năm: lãi nhanh trong vài tuần không có nghĩa sẽ lặp lại được suốt năm. Thương vụ đang lỗ thì cột quay xuống dưới và ngắn dần.',
          'Each bar is the annualized return for one number of days held, and the solid one is the number you have entered. For a trade in profit the bars shrink to the right, and the towering bars on the left are the trap of annualizing: a quick gain in a few weeks does not mean it can be repeated all year. For a losing trade the bars hang down and get shorter.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là lợi suất quy năm nếu bạn bán ở giá đóng cửa của phiên đó, còn giá mua và số ngày nắm giữ vẫn là con số bạn nhập. Hình này đi theo đúng chuỗi giá bạn đã nạp, áp vào chính lệnh mua của bạn. Đường đi lên là giá đang rời xa giá mua theo hướng có lãi, đi xuống là ngược lại; khi số ngày nắm giữ ngắn hơn một năm, phép quy năm làm đường dao động mạnh hơn chính đường giá, càng ít ngày càng mạnh.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the annualized return had you sold at that session’s closing price, with your buy price and holding days kept as entered. It follows the price series you loaded, applied to your own purchase. When it rises the price is pulling away from your buy price on the winning side; when it falls the opposite is happening, and when the holding days are fewer than a year, annualizing makes the line swing harder than the price line itself, the fewer the days the harder.',
      ),
      cot: d(
        'Mỗi cột là lợi suất quy năm nếu bán ở một phiên, cột cuối bên phải là phiên gần nhất. Cột trên vạch 0 là phiên giá cao hơn giá mua, cột dưới vạch 0 là phiên giá thấp hơn giá mua.',
        'Each bar is the annualized return from selling in one session, the last one on the right being the latest. A bar above the zero line is a session priced over your buy price; one below the zero line is a session priced under it.',
      ),
    },
  },
};
