import type { BieuDoRieng } from '../types';
import { d } from './tao';

/** Nhóm phí & thuế (`fees-tax`, 3 công thức có hình) và nhóm lợi suất (`returns`, 12 công thức). */
export const BIEU_DO_LOI_SUAT: Readonly<Record<string, BieuDoRieng>> = {
  'gia-hoa-von': {
    truc: {
      quantity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Khối lượng (Q), từ một nửa đến gấp rưỡi số cổ phiếu bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Đây là phép thử nếu mua nhiều hay ít hơn thì giá hoà vốn ra bao nhiêu, không phải diễn biến thị trường. Đường nằm ngang: tiền mua, phí mua, phí lưu ký và phần phí với thuế lúc bán đều lớn lên theo đúng số cổ phiếu, nên khối lượng rút gọn hết và giá hoà vốn của một cổ phiếu không đổi.',
          'The line runs left to right along the Quantity (Q) field, from half to one and a half times the number of shares you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on buying more or fewer shares, not market history. The line is flat: the purchase cost, the buying fee, the custody fee and the selling fee and tax all scale with the number of shares, so quantity cancels out and the break-even price of one share does not move.',
        ),
        cot: d(
          'Mỗi cột là giá hoà vốn ở một mức khối lượng, và các cột cao bằng nhau; cột tô đặc là mức bạn đang nhập. Dãy cột bằng phẳng ấy là câu trả lời: mua nhiều hay ít không làm giá phải bán để hoà vốn đổi đi, chỉ giá mua và thời gian nắm giữ mới làm được.',
          'Each bar is the break-even price at one quantity, and all the bars are the same height; the solid one is the quantity you have entered. That level row is the answer: buying more or fewer shares does not change the price you must sell at to break even, only the buy price and the holding time do.',
        ),
        diem: d(
          'Mỗi chấm là giá hoà vốn tính ở một mức của ô Khối lượng (Q), từ một nửa đến gấp rưỡi số cổ phiếu bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. Đây là phép thử nếu mua nhiều hay ít hơn thì giá hoà vốn ra bao nhiêu, không phải diễn biến thị trường. Mọi chấm cùng một độ cao, xếp thành một hàng nằm ngang: mỗi chấm là một lần tính riêng mà lần nào cũng ra cùng một giá, vì tiền mua, phí mua, phí lưu ký lẫn phí bán và thuế đều nhân theo số cổ phiếu, nên khối lượng rút gọn hết.',
          'Each dot is the break-even price at one level of the Quantity (Q) field, from half to one and a half times the number of shares you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on buying more or fewer shares, not market history. Every dot sits at the same height, in one flat row: each is a separate calculation and each lands on the same price, because the purchase cost, the buying fee, the custody fee and the selling fee and tax all scale with the number of shares, so quantity cancels out.',
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
        diem: d(
          'Mỗi chấm là giá hoà vốn tính ở một mức của ô Thời gian nắm giữ, từ một nửa đến gấp rưỡi số tháng bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số tháng bạn nhập. Đây là phép thử nếu giữ cổ phiếu lâu hay chóng hơn thì giá hoà vốn ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, các chấm cách nhau đều: mỗi quãng giữ thêm bằng nhau cộng vào giá hoà vốn một khoản phí lưu ký bằng nhau. Trục dọc phóng sát nên hàng chấm trông dốc, chứ chấm thấp nhất và chấm cao nhất chỉ chênh nhau rất ít so với giá mua.',
          'Each dot is the break-even price at one level of the Holding period field, from half to one and a half times the number of months you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on holding the shares for longer or shorter, not market history. The row of dots rises in a straight line with even gaps: each equal stretch of extra holding time adds the same slice of custody fee to the break-even price. The vertical axis is zoomed in tight, so the row looks steep, while the lowest and highest dots differ very little next to the buy price.',
        ),
        bac: d(
          'Mỗi bậc là giá hoà vốn ở một số tháng tròn của ô Thời gian nắm giữ, từ một nửa đến gấp rưỡi số tháng bạn đang nhập; bậc bắt đầu ở vạch đứt dọc là số tháng bạn nhập. Dạng này chỉ hiện khi các mức trên trục rơi đúng vào những số tháng tròn liền nhau: giữa hai mức không có tháng lẻ nào được tính, nên bậc nằm ngang suốt một tháng rồi mới nhảy lên. Cầu thang đi lên đều, bậc nhảy nào cũng cao như nhau: thêm đúng một tháng phí lưu ký cho mỗi cổ phiếu, nhích thêm một chút để bù phí bán và thuế. Đây là phép thử theo thời gian giữ, không phải diễn biến thị trường.',
          'Each step is the break-even price for one whole number of months in the Holding period field, from half to one and a half times the months you have entered; the step starting at the dashed vertical line is your own figure. This form appears only when the axis levels land on consecutive whole months: no part month is computed between two levels, so each step stays level for a month and then jumps up. The staircase rises evenly, every jump the same height: one more month of custody fee per share, nudged up slightly for the sell fee and tax. It is a what-if on holding time, not market history.',
        ),
      },
      buyPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua (Pmua), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu mua ở giá khác thì phải bán từ giá nào mới không lỗ, không phải diễn biến thị trường. Đường đi lên đều và luôn nằm cao hơn chính giá mua một chút: phần nhô lên ấy là phí mua, phí bán, thuế và phí lưu ký cộng lại.',
          'The line runs left to right along the Buy price (Pbuy) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on the price you must sell at to avoid a loss if you had bought at a different price, not market history. The line rises steadily and always sits a little above the buy price itself: that extra height is the buy fee, sell fee, tax and custody fee added together.',
        ),
        cot: d(
          'Mỗi cột là giá hoà vốn ở một mức giá mua, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Đỉnh cột là giá bán thấp nhất để về đúng vốn: bán dưới đỉnh ấy là lỗ dù giá đã cao hơn giá mua.',
          'Each bar is the break-even price at one buy price; bars grow taller to the right and the solid one is the price you have entered. The top of a bar is the lowest selling price that returns your money: selling under it is a loss even when the price is already above what you paid.',
        ),
        diem: d(
          'Mỗi chấm là giá hoà vốn tính ở một mức của ô Giá mua (Pmua), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu mua ở giá khác thì phải bán từ giá nào mới không lỗ, không phải diễn biến thị trường. Dãy chấm đi lên đều, hai chấm kề nhau luôn cách nhau một khoảng như nhau: mỗi bước giá mua đẩy giá hoà vốn lên nhỉnh hơn chính bước ấy một chút, vì phí mua tăng theo giá mua, còn phí bán và thuế bán lại lấy một phần của giá bán cao hơn.',
          'Each dot is the break-even price at one level of the Buy price (Pbuy) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on the price you must sell at to avoid a loss had you paid a different price, not market history. The row of dots rises at an even pace, with the same gap between any two neighbors: each step in the buy price lifts the break-even price by slightly more than that step, because the buy fee grows with the price and the sell fee and tax take a cut of a bigger sale.',
        ),
      },
    },
  },

  'loi-nhuan-rong': {
    truc: {
      quantity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Khối lượng (Q), từ một nửa đến gấp rưỡi số cổ phiếu bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Đây là phép thử nếu mua bán nhiều hay ít hơn ở đúng hai mức giá ấy thì lợi nhuận ròng ra bao nhiêu, không phải diễn biến thị trường. Khi mỗi cổ phiếu đang có lãi sau phí và thuế, đường đi lên đều: lãi của một cổ phiếu không đổi, nên khối lượng nhân lên bao nhiêu thì tiền lãi nhân lên bấy nhiêu. Khi giá bán chưa đủ bù giá mua và phí thì đường đi xuống: cũng chính khối lượng nhân khoản lỗ lên.',
          'The line runs left to right along the Quantity (Q) field, from half to one and a half times the number of shares you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on trading more or fewer shares at those same two prices, not market history. When each share is in profit after fees and tax the line rises steadily: the gain per share is fixed, so the total grows in step with the quantity. When the sell price does not cover the buy price and the costs the line falls: quantity multiplies the loss in the same way.',
        ),
        cot: d(
          'Mỗi cột là lợi nhuận ròng ở một mức khối lượng, cột tô đặc là mức bạn đang nhập. Khi mỗi cổ phiếu đang có lãi, cột cao dần về bên phải; đang lỗ thì cột quay xuống dưới và dài dần. Chia chiều dài một cột cho khối lượng của nó thì cột nào cũng ra cùng một con số: lãi hay lỗ ròng trên mỗi cổ phiếu.',
          'Each bar is the net profit at one quantity, and the solid one is the quantity you have entered. When each share is in profit the bars grow taller to the right; at a loss they hang down and grow longer. Divide any bar’s length by its own quantity and you get the same figure every time: the net gain or loss per share.',
        ),
        diem: d(
          'Mỗi chấm là lợi nhuận ròng tính ở một mức của ô Khối lượng (Q), từ một nửa đến gấp rưỡi số cổ phiếu bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. Đây là phép thử nếu mua bán nhiều hay ít hơn ở đúng hai mức giá ấy thì lợi nhuận ròng ra bao nhiêu, không phải diễn biến thị trường. Khi mỗi cổ phiếu còn lãi sau phí và thuế, dãy chấm đi lên; khi giá bán chưa bù nổi giá mua cùng phí và thuế thì dãy chấm đi xuống. Trường hợp nào các chấm cũng cách đều nhau, vì mỗi phần khối lượng thêm vào mang theo đúng một phần lãi hay lỗ như nhau.',
          'Each dot is the net profit at one level of the Quantity (Q) field, from half to one and a half times the number of shares you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on trading more or fewer shares at those same two prices, not market history. While each share still earns something after fees and tax, the row of dots rises; when the sell price fails to cover the buy price and the costs, it falls. Either way the dots sit evenly apart, because every extra block of shares brings the same slice of gain or loss.',
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
        diem: d(
          'Mỗi chấm là lợi nhuận ròng tính ở một mức của ô Thời gian nắm giữ, từ một nửa đến gấp rưỡi số tháng bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số tháng bạn nhập. Đây là phép thử nếu giữ cổ phiếu lâu hay chóng hơn thì còn lãi bao nhiêu, không phải diễn biến thị trường. Hai mức giá đứng yên, nên thứ duy nhất đổi giữa các chấm là phí lưu ký: dãy chấm đi xuống với những khoảng cách bằng nhau, mỗi khoảng là phí lưu ký của cùng một quãng thời gian. Trục dọc phóng sát quanh các chấm, nên dãy trông dốc dù khoản trừ ấy rất nhỏ so với tiền lãi.',
          'Each dot is the net profit at one level of the Holding period field, from half to one and a half times the number of months you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on holding the shares for longer or shorter, not market history. With both prices held still, the only thing that differs from dot to dot is the custody fee: the row of dots falls in equal gaps, each gap being the fee for the same stretch of time. The vertical axis hugs the dots, so the row looks steep even though that deduction is tiny next to the profit.',
        ),
        bac: d(
          'Mỗi bậc là lợi nhuận ròng ở một số tháng tròn của ô Thời gian nắm giữ, từ một nửa đến gấp rưỡi số tháng bạn đang nhập; bậc mở đầu ở vạch đứt dọc là số tháng bạn nhập. Ô Loại biểu đồ chỉ mời dạng này khi các mức trên trục là những số tháng tròn liền nhau, nên giữa hai bậc không có tháng lẻ nào được tính và bậc giữ nằm ngang tới tháng sau. Cầu thang đi xuống đều, bậc hạ nào cũng thấp xuống đúng một tháng phí lưu ký của số cổ phiếu bạn nhập. Đây là phép thử theo thời gian giữ, không phải diễn biến thị trường.',
          'Each step is the net profit for one whole number of months in the Holding period field, from half to one and a half times the months you have entered; the step that opens at the dashed vertical line is your own figure. This form is offered only when the axis levels are consecutive whole months, so nothing is computed for a part month between two steps and each step holds level until the next month. The staircase falls evenly, every drop exactly one month of custody fee on the shares you entered. It is a what-if on holding time, not market history.',
        ),
      },
      buyPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua (Pmua), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu ngày ấy bạn mua ở một giá khác mà giá bán đứng yên thì lợi nhuận ròng ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: mua càng đắt thì khoảng chênh với giá bán càng hẹp, và từ chỗ đường cắt xuống dưới 0 trở đi là lỗ.',
          'The line runs left to right along the Buy price (Pbuy) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on having bought at a different price with the sell price held still, not market history. The line falls steadily: the more you paid, the narrower the gap to the sell price, and from where the line crosses below 0 onward it is a loss.',
        ),
        cot: d(
          'Mỗi cột là lợi nhuận ròng ở một mức giá mua, cột tô đặc là mức giá bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 là lỗ; chỗ đổi chiều nằm thấp hơn giá bán một chút, vì phí và thuế đã lấy đi phần chênh ấy.',
          'Each bar is the net profit at one buy price, and the solid one is the price you have entered. Bars above the zero line are gains, bars below the zero line are losses; the turning point sits a little under the sell price, because fees and tax take that difference.',
        ),
        diem: d(
          'Mỗi chấm là lợi nhuận ròng tính ở một mức của ô Giá mua (Pmua), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức giá bạn nhập. Đây là phép thử nếu ngày ấy bạn mua ở một giá khác mà giá bán đứng yên thì lợi nhuận ròng ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống đều, khoảng cách giữa hai chấm kề nhau lúc nào cũng bằng nhau: mỗi bước giá mua lấy đi đúng bước ấy nhân khối lượng, cộng phần phí mua tính trên đó. Chấm nào rơi xuống dưới 0 là một giá mua khiến lần mua bán ấy lỗ.',
          'Each dot is the net profit at one level of the Buy price (Pbuy) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on having paid a different price with the sell price held still, not market history. The row of dots falls at a steady pace, with the same gap between neighbors every time: each step up in the buy price costs that step times the quantity, plus the buy fee charged on it. Any dot below 0 is a buy price that turns this round trip into a loss.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi giá bán bạn nhập đủ gần giá mua để dải của ô Giá mua (Pmua) chứa cả mức còn lãi lẫn mức đã lỗ. Phần nằm trên vạch 0 tô xanh là những giá mua mà bán ở giá đã nhập vẫn còn lãi sau phí và thuế; phần nằm dưới vạch 0 tô đỏ là những giá mua khiến lần mua bán ấy lỗ. Đường đi xuống và cắt vạch 0 ở giá mua cao nhất còn hoà vốn, thấp hơn giá bán một chút vì phí và thuế đã lấy đi phần chênh ấy. Đây là phép thử nếu mua ở giá khác, không phải diễn biến thị trường.',
          'This form appears when the sell price you entered is close enough to the buy price that the Buy price (Pbuy) range holds both profitable and losing levels. Above the zero line the area is shaded green: buy prices at which selling at your price still leaves a profit after fees and tax; below it the area is shaded red, buy prices that turn the round trip into a loss. The line falls and crosses the zero line at the highest buy price that still breaks even, a little under the sell price because fees and tax take that difference. It is a what-if on paying another price, not market history.',
        ),
      },
      sellPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá bán (Pban), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu bán ở giá khác thì còn lại bao nhiêu tiền lãi, không phải diễn biến thị trường. Đường đi lên đều: giá bán cao thêm bao nhiêu thì lãi thêm bấy nhiêu nhân với khối lượng, trừ đi phần phí bán và thuế tính trên chính giá ấy. Chỗ đường cắt mức 0 là giá hoà vốn.',
          'The line runs left to right along the Sell price (Psell) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on what you keep if you sold at another price, not market history. The line rises steadily: each step up in selling price adds that step times the quantity, less the sell fee and tax charged on that same price. Where the line crosses 0 is the break-even price.',
        ),
        cot: d(
          'Mỗi cột là lợi nhuận ròng ở một mức giá bán, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 là lỗ; cột càng dài về phía nào thì khoản lãi hay lỗ ấy càng lớn.',
          'Each bar is the net profit at one selling price, and the solid one is the price you have entered. A bar standing above the zero line is a gain, one hanging below the zero line is a loss; the longer it reaches either way, the bigger that gain or loss.',
        ),
        diem: d(
          'Mỗi chấm là lợi nhuận ròng tính ở một mức của ô Giá bán (Pban), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu bán ở giá khác thì còn lại bao nhiêu tiền lãi, không phải diễn biến thị trường. Dãy chấm đi lên đều, các chấm cách nhau như nhau: mỗi bước giá bán thêm đúng bước ấy nhân khối lượng, trừ phần phí bán và thuế tính trên chính bước giá ấy. Chấm đầu tiên vượt lên trên 0 là chỗ giá bán vừa qua giá hoà vốn.',
          'Each dot is the net profit at one level of the Sell price (Psell) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on what you keep if you sold at another price, not market history. The row of dots rises with equal gaps: each step in the sell price adds that step times the quantity, less the sell fee and tax charged on it. The first dot above 0 marks where the sell price has just passed the break-even price.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi giá hoà vốn rơi vào dải của ô Giá bán (Pban), tức trong dải có cả mức bán lỗ lẫn mức bán lãi. Đường đi lên; phần nằm dưới vạch 0 tô đỏ ở bên trái là những giá bán chưa đủ bù giá mua cùng phí và thuế, phần nằm trên vạch 0 tô xanh ở bên phải là những giá bán để lại tiền lãi thật. Chỗ đường cắt vạch 0 chính là giá hoà vốn thực: bán thấp hơn là lỗ, dù giá lúc ấy có thể đã nhỉnh hơn giá mua. Đây là phép thử nếu bán ở giá khác, không phải diễn biến thị trường.',
          'This form appears when the break-even price lies inside the Sell price (Psell) range, so the range holds both losing and profitable levels. The line rises; the part below the zero line on the left is shaded red, sell prices that do not cover the buy price plus fees and tax, and the part above the zero line on the right is shaded green, sell prices that leave real profit. Where the line crosses the zero line is the true break-even price: selling below it is a loss, even when the price may already be above what you paid. It is a what-if on selling at another price, not market history.',
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
      diem: d(
        'Mỗi chấm là lợi nhuận ròng nếu bạn bán ở giá đóng cửa của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; giá mua, khối lượng và thời gian giữ vẫn là con số bạn nhập. Hình đi theo đúng chuỗi giá bạn đã nạp, áp vào chính lệnh mua của bạn. Dãy chấm đi lên là lệnh của bạn đang lãi thêm theo giá, đi xuống là lãi đang hao hụt hoặc lỗ đang sâu thêm; hai chấm kề nhau cách xa theo chiều dọc là giữa hai phiên ấy giá đóng cửa nhảy mạnh.',
        'Each dot is the net profit had you sold at one session’s closing price, running from the oldest session on the left to the most recent session on the right; your buy price, quantity and holding period stay as entered. The chart follows the price series you loaded, applied to your own purchase. When the row of dots rises your profit is building with the price; when it falls the profit is wearing thin or the loss is deepening. Two neighboring dots far apart in height mean the close jumped between those sessions.',
      ),
      bac: d(
        'Mỗi bậc là lợi nhuận ròng nếu bán ở giá đóng cửa của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào để bán. Bậc đi lên là tiền lãi của lệnh bạn đang tăng theo giá, đi xuống là đang hao đi; độ cao mỗi bậc nhảy là chênh lệch giá đóng cửa giữa hai phiên nhân với khối lượng, đã trừ phần phí bán và thuế trên chênh lệch ấy.',
        'Each step is the net profit from selling at one session’s close, running from the oldest session on the left to the most recent session on the right: a step stays level through its session and then jumps to the next one, because there is no closing price to sell at between two sessions. When the staircase rises the profit on your order is growing with the price; when it falls it is wearing away. The height of each jump is the change in close between two sessions times the quantity, after the sell fee and tax on that change.',
      ),
      laiLo: d(
        'Dạng biểu đồ này hiện khi chuỗi đã nạp có cả phiên bán ra có lãi lẫn phiên bán ra lỗ. Đường đi từ phiên cũ nhất nằm bên trái tới phiên gần nhất nằm bên phải; phần nằm trên vạch 0 tô xanh là những phiên mà bán ở giá đóng cửa vẫn còn lãi sau mọi khoản phí và thuế, phần nằm dưới tô đỏ là những phiên bán ra sẽ lỗ. Đường đi lên là lãi đang lớn dần, đi xuống là lãi đang teo lại hoặc lỗ sâu thêm; chỗ đường cắt vạch 0 là nơi giá đóng cửa đi qua đúng giá hoà vốn thực của lệnh mua bạn nhập.',
        'This form appears when the loaded series has both sessions where selling would profit and sessions where it would lose. The line runs from the oldest session on the left to the most recent session on the right; the part above the zero line is shaded green, sessions where selling at the close leaves a profit after every fee and tax, and the part below is shaded red, sessions where selling means a loss. When the line rises the profit is growing; when it falls it is shrinking or the loss is deepening. Where it crosses the zero line the close passes the true break-even price of your purchase.',
      ),
    },
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Lãi ròng (Lrong) rồi Tổng chi phí cộng lại thành thanh sẫm cuối cùng, Lãi gộp, tức khoản chênh giữa tiền bán và tiền mua trước khi trừ phí và thuế, lớn hơn con số ở khối Kết quả đúng bằng chiều dài thanh Tổng chi phí. Thanh Lãi ròng (Lrong) chính là con số in ở khối Kết quả, nên thanh Tổng chi phí càng dài thì phần lãi thật về túi càng bị phí và thuế ăn mòn nhiều so với khoản chênh giá ban đầu.',
        'Each horizontal bar is one part, read from top to bottom: Net profit then Total cost add up to the dark bar at the end, Gross profit, the gap between the sale proceeds and the purchase cost before fees and tax are taken out, which sits above the figure in the Result block by exactly the length of the Total cost bar. The Net profit bar is itself the figure in the Result block, so the longer the Total cost bar, the more fees and tax have eaten into the profit that actually lands against that same price gap.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Lãi gộp thành hai múi, Lãi ròng (Lrong) và Tổng chi phí, mỗi múi to theo phần nó chiếm trong lãi gộp. Lỗ giữa in Lãi gộp cùng giá trị của nó; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Tổng chi phí càng lớn thì múi Lãi ròng (Lrong), tức phần lãi thật về túi, càng mỏng so với cùng khoản chênh giá ấy.',
        'The ring splits Gross profit into two slices, Net profit and Total cost, each sized by its share of gross profit. The hole shows Gross profit and its value; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The bigger the Total cost slice, the smaller the Net profit slice, the profit that actually lands, against that same price gap.',
      ),
    },
  },

  'roi-rong': {
    truc: {
      quantity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Khối lượng (Q), từ một nửa đến gấp rưỡi số cổ phiếu bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số bạn nhập. Đây là phép thử nếu mua bán nhiều hay ít hơn thì ROI ròng ra bao nhiêu, không phải diễn biến thị trường. Đường nằm ngang: cả tiền lãi lẫn số vốn bỏ ra đều lớn lên theo đúng số cổ phiếu, nên tỷ suất giữa chúng không đổi. Khối lượng quyết định bạn lãi bao nhiêu đồng, không quyết định bạn lãi bao nhiêu phần trăm.',
          'The line runs left to right along the Quantity (Q) field, from half to one and a half times the number of shares you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on trading more or fewer shares, not market history. The line is flat: both the profit and the capital put in scale with the number of shares, so the ratio between them stays the same. Quantity decides how much money you make, not what percentage you make.',
        ),
        cot: d(
          'Mỗi cột là ROI ròng ở một mức khối lượng, và các cột cao bằng nhau; cột tô đặc là mức bạn đang nhập. Muốn thấy khối lượng tác động tới đâu thì xem lợi nhuận ròng tính bằng đồng, ở đó cột lớn dần theo khối lượng.',
          'Each bar is the net ROI at one quantity, and all the bars are the same height; the solid one is the quantity you have entered. To see what quantity does change, look at net profit in money terms, where the bars grow with quantity.',
        ),
        diem: d(
          'Mỗi chấm là ROI ròng tính ở một mức của ô Khối lượng (Q), từ một nửa đến gấp rưỡi số cổ phiếu bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số bạn nhập. Đây là phép thử nếu mua bán nhiều hay ít hơn thì ROI ròng ra bao nhiêu, không phải diễn biến thị trường. Mọi chấm xếp thành một hàng nằm ngang ở cùng một độ cao: tiền lãi và vốn bỏ ra cùng nhân theo số cổ phiếu, nên chia cho nhau thì mức nào cũng ra đúng một tỷ suất. Khối lượng đổi số tiền bạn lãi, không đổi phần trăm.',
          'Each dot is the net ROI at one level of the Quantity (Q) field, from half to one and a half times the number of shares you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on trading more or fewer shares, not market history. All the dots line up flat at one height: profit and capital both scale with the share count, so dividing one by the other gives the same rate at every level. Quantity changes how much money you make, not the percentage.',
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
        diem: d(
          'Mỗi chấm là ROI ròng tính ở một mức của ô Thời gian nắm giữ, từ một nửa đến gấp rưỡi số tháng bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số tháng bạn nhập. Đây là phép thử nếu giữ cổ phiếu lâu hay chóng hơn thì ROI ròng ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống gần như thẳng, các chấm cách nhau gần như đều: phí lưu ký cộng dồn theo tháng vừa bớt tiền lãi vừa thêm vào vốn bỏ ra, mà khoản phí ấy quá nhỏ so với vốn nên mỗi quãng thời gian kéo tỷ suất xuống gần như cùng một mức.',
          'Each dot is the net ROI at one level of the Holding period field, from half to one and a half times the number of months you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on holding the shares for longer or shorter, not market history. The row of dots falls in an almost straight line with almost even gaps: the custody fee piles up month by month, trimming the profit and adding to the capital, but it is so small next to the capital that each stretch of time pulls the rate down by nearly the same amount.',
        ),
        bac: d(
          'Mỗi bậc là ROI ròng ở một số tháng tròn của ô Thời gian nắm giữ, từ một nửa đến gấp rưỡi số tháng bạn đang nhập; bậc bắt đầu ở vạch đứt dọc là số tháng bạn nhập. Dạng này hiện khi các mức trên trục rơi đúng vào những số tháng tròn liền nhau: giữa hai mức không có tháng lẻ nào được tính, nên bậc giữ nằm ngang rồi mới hạ xuống mức của tháng sau. Cầu thang đi xuống với những bậc hạ gần như bằng nhau, mỗi bậc là một tháng phí lưu ký vừa trừ vào tiền lãi vừa cộng vào vốn bỏ ra. Đây là phép thử theo thời gian giữ, không phải diễn biến thị trường.',
          'Each step is the net ROI for one whole number of months in the Holding period field, from half to one and a half times the months you have entered; the step that starts at the dashed vertical line is your own figure. This form shows up when the axis levels land on consecutive whole months: no part month is computed between two levels, so a step holds level and then drops to the next month. The staircase falls in drops of almost equal size, each one a month of custody fee taken from the profit and added to the capital. It is a what-if on holding time, not market history.',
        ),
      },
      buyPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua (Pmua), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu ngày ấy bạn mua ở một giá khác mà giá bán đứng yên thì ROI ròng ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: mua càng đắt thì vừa lãi ít đi vừa phải bỏ nhiều vốn hơn, nên tỷ suất tụt nhanh ở đầu bên trái rồi chậm lại; từ chỗ đường cắt xuống dưới 0 trở đi là lỗ.',
          'The line runs left to right along the Buy price (Pbuy) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on having bought at a different price with the sell price held still, not market history. The line falls and flattens: a higher buy price both shrinks the gain and enlarges the capital put in, so the return drops fast on the left and then more slowly; from where the line crosses below 0 onward it is a loss.',
        ),
        cot: d(
          'Mỗi cột là ROI ròng ở một mức giá mua, cột tô đặc là mức giá bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 là lỗ; các cột bên trái cao vọt vì mua rẻ một nửa thì lãi gấp nhiều lần chứ không chỉ gấp đôi.',
          'Each bar is the net ROI at one buy price, and the solid one is the price you have entered. Bars above the zero line are gains, bars below the zero line are losses; the bars on the left tower because buying at half the price multiplies the return many times over, not just twice.',
        ),
        diem: d(
          'Mỗi chấm là ROI ròng tính ở một mức của ô Giá mua (Pmua), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức giá bạn nhập. Đây là phép thử nếu mua ở một giá khác mà giá bán đứng yên thì ROI ròng ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, bên trái các chấm cách nhau rất xa rồi khít dần về bên phải: mua càng đắt thì vừa lãi ít đi vừa phải bỏ nhiều vốn hơn, mà vốn càng lớn thì cùng một khoản lãi hụt đi chỉ còn là phần trăm nhỏ hơn, nên mỗi bước giá mua kéo tỷ suất xuống ít hơn bước trước.',
          'Each dot is the net ROI at one level of the Buy price (Pbuy) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on having paid a different price with the sell price held still, not market history. The row of dots falls, widely spaced on the left and bunching up toward the right: a higher buy price both shrinks the profit and enlarges the capital, and on a bigger capital the same lost profit is a smaller percentage, so each step pulls the rate down less than the one before.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi giá bán đủ gần giá mua để dải của ô Giá mua (Pmua) chứa cả mức mua còn lãi lẫn mức mua đã lỗ. Đường đi xuống: phần nằm trên vạch 0 tô xanh ở bên trái là những giá mua cho ROI ròng dương, tức đồng vốn bỏ ra còn sinh lãi sau phí và thuế; phần nằm dưới vạch 0 tô đỏ ở bên phải là những giá mua làm mất một phần vốn. Đường cắt vạch 0 ở đúng giá mua mà lợi nhuận ròng bằng 0, thấp hơn giá bán một chút. Đây là phép thử nếu mua ở giá khác, không phải diễn biến thị trường.',
          'This form appears when the sell price sits close enough to the buy price that the Buy price (Pbuy) range holds both profitable and losing purchases. The line falls: the part above the zero line on the left is shaded green, buy prices that give a positive net ROI, the capital still earning after fees and tax; the part below the zero line on the right is shaded red, buy prices that lose part of the capital. The line crosses the zero line at the very buy price where net profit is 0, a little under the sell price. It is a what-if on paying another price, not market history.',
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
        diem: d(
          'Mỗi chấm là ROI ròng tính ở một mức của ô Giá bán, từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu bán ở giá khác thì tỷ suất lãi trên vốn thực bỏ ra là bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, các chấm cách nhau như nhau: vốn bỏ ra đã chốt từ lúc mua và không đổi theo giá bán, nên mỗi bước giá bán thêm vào cùng một số phần trăm. Chấm đầu tiên nằm trên 0 là mức bán vừa vượt giá hoà vốn.',
          'Each dot is the net ROI at one level of the Sell price field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on the return on the money you actually put in if you sold at another price, not market history. The row of dots rises with even gaps: the capital was fixed the day you bought and does not move with the sell price, so each step in the sell price adds the same number of percentage points. The first dot above 0 is the level that just clears the break-even price.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi dải của ô Giá bán trùm qua giá hoà vốn, nên trên trục có cả mức bán làm mất vốn lẫn mức bán sinh lời. Đường đi lên; phần nằm dưới vạch 0 tô đỏ là những giá bán cho ROI ròng âm, tức mất một phần vốn đã bỏ ra; phần nằm trên vạch 0 tô xanh là những giá bán mà sau phí và thuế, vốn còn sinh lãi. Chỗ đường cắt vạch 0 là giá hoà vốn thực, cũng là chỗ lợi nhuận ròng bằng 0. Đây là phép thử nếu bán ở giá khác, không phải diễn biến thị trường.',
          'This form appears when the Sell price range straddles the break-even price, so some sale prices lose capital and others grow it. The line rises; the part below the zero line is shaded red, sell prices that give a negative net ROI and lose part of the capital put in; the part above the zero line is shaded green, sell prices at which the capital still earns after fees and tax. Where the line crosses the zero line is the true break-even price, the same point where net profit is 0. It is a what-if on selling at another price, not market history.',
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
      diem: d(
        'Mỗi chấm là ROI ròng nếu bạn bán ở giá đóng cửa của một phiên, từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; giá mua, khối lượng và thời gian giữ vẫn là con số bạn nhập. Vốn bỏ ra không đổi theo phiên, nên dãy chấm mang đúng dáng của giá đóng cửa trong chuỗi bạn đã nạp. Dãy chấm đi lên là tỷ suất lãi trên vốn đang khá lên, đi xuống là đang xấu đi; chấm nào rơi xuống dưới 0 là phiên mà bán ra sẽ lỗ.',
        'Each dot is the net ROI had you sold at one session’s close, from the oldest session on the left to the most recent session on the right; your buy price, quantity and holding period stay as entered. The capital put in does not change from session to session, so the row of dots takes the exact shape of the closing prices in the series you loaded. When it rises your return on capital is improving; when it falls it is getting worse. A dot below 0 is a session where selling would have lost money.',
      ),
      bac: d(
        'Mỗi bậc là ROI ròng nếu bán ở giá đóng cửa của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải. Giữa hai phiên không có giá khớp nào để tính lại tỷ suất, nên bậc giữ nằm ngang hết phiên ấy rồi mới nhảy sang mức của phiên sau. Vốn bỏ ra đứng yên nên mỗi bậc nhảy tỷ lệ với chênh lệch giá đóng cửa của hai phiên: bậc đi lên là tỷ suất lãi trên vốn đang khá lên, đi xuống là đang xấu đi.',
        'Each step is the net ROI from selling at one session’s close, running from the oldest session on the left to the most recent session on the right. No trade price exists between two sessions to recompute the rate, so a step holds level for its whole session and only then jumps to the next. With the capital held still, each jump is in proportion to the change in close between the two sessions: when the staircase rises your return on capital is improving, and when it falls it is getting worse.',
      ),
      laiLo: d(
        'Dạng biểu đồ này hiện khi chuỗi đã nạp có phiên mà bán ra thì ROI ròng dương lẫn phiên mà bán ra thì ROI ròng âm. Đường đi từ phiên cũ nhất nằm bên trái tới phiên gần nhất nằm bên phải; phần nằm trên vạch 0 tô xanh là những phiên mà bán ở giá đóng cửa thì vốn bỏ ra còn sinh lãi sau phí và thuế, phần nằm dưới tô đỏ là những phiên bán ra sẽ mất một phần vốn. Đường đi lên là tỷ suất đang khá lên, đi xuống là đang xấu đi; đường cắt vạch 0 ở chỗ giá đóng cửa đi qua giá hoà vốn thực, cũng là chỗ lợi nhuận ròng đổi dấu.',
        'This form appears when the loaded series has sessions where selling gives a positive net ROI and sessions where it gives a negative one. The line runs from the oldest session on the left to the most recent session on the right; the part above the zero line is shaded green, sessions where selling at the close leaves the capital earning after fees and tax, and the part below is shaded red, sessions where selling would lose part of the capital. When the line rises the return is improving; when it falls it is worsening. It crosses the zero line where the close passes the true break-even price.',
      ),
    },
  },

  roi: {
    truc: {
      cost: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn bỏ ra (Vdau), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số vốn ban đầu khác đi mà giá trị hiện tại đứng yên thì ROI ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: cùng một giá trị hôm nay mà phải bỏ ra càng nhiều vốn thì tỷ suất càng thấp, và khi vốn vượt giá trị hiện tại thì đường xuống dưới 0, tức đang lỗ.',
          'The line runs left to right along the Capital invested (Vstart) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different starting outlay with the current value held still, not market history. The line falls and flattens: reaching the same value today from a larger outlay means a lower return, and once the outlay exceeds the current value the line drops below 0, which is a loss.',
        ),
        cot: d(
          'Mỗi cột là ROI ở một mức vốn bỏ ra, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 ở bên phải là lỗ; chỗ đổi chiều là mức vốn bằng đúng giá trị hiện tại.',
          'Each bar is ROI at one outlay, and the solid one is the outlay you have entered. Bars above the zero line are gains, bars below the zero line on the right are losses; they switch over where the outlay equals the current value exactly.',
        ),
        diem: d(
          'Mỗi chấm là ROI tính ở một mức của ô Vốn bỏ ra (Vdau), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu số vốn ban đầu khác đi mà giá trị hiện tại đứng yên thì ROI ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, các chấm bên trái cách nhau xa còn bên phải xích lại gần: giá trị hôm nay giữ nguyên, nên lúc vốn còn ít thì mỗi bước vốn thêm vào kéo ROI xuống mạnh, lúc vốn đã nhiều thì cùng bước ấy chỉ kéo xuống một chút. Chấm nào xuống dưới 0 là số vốn đã vượt giá trị hiện tại.',
          'Each dot is ROI at one level of the Capital invested (Vstart) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on a different starting outlay with the current value held still, not market history. The row of dots falls, far apart on the left and drawing closer on the right: with today’s value fixed, each extra slice of outlay drags ROI down hard while the outlay is small and only a little once it is large. Any dot below 0 is an outlay that exceeds the current value.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi giá trị hiện tại nằm trong dải của ô Vốn bỏ ra (Vdau), nên trên trục có cả mức vốn đang lãi lẫn mức vốn đang lỗ. Đường đi xuống; phần nằm trên vạch 0 tô xanh ở bên trái là những mức vốn nhỏ hơn giá trị hiện tại, ROI dương, khoản đầu tư đang lãi; phần nằm dưới vạch 0 tô đỏ ở bên phải là những mức vốn lớn hơn giá trị hiện tại, ROI âm, đang lỗ. Đường cắt vạch 0 đúng ở mức vốn bằng giá trị hiện tại. Đây là phép thử theo số vốn, không phải diễn biến thị trường.',
          'This form appears when the current value lies inside the Capital invested (Vstart) range, so the axis holds outlays that are in profit and outlays that are at a loss. The line falls; the part above the zero line on the left is shaded green, outlays below the current value with a positive ROI, and the part below the zero line on the right is shaded red, outlays above the current value with a negative ROI. The line crosses the zero line exactly where the outlay equals the current value. It is a what-if on the outlay, not market history.',
        ),
      },
      current: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá trị hiện tại (Vcuoi), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu khoản đầu tư đang đáng giá khác đi thì ROI ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: vốn bỏ ra giữ nguyên, giá trị hiện tại cao thêm bao nhiêu thì phần trăm lãi cao thêm bấy nhiêu. Chỗ đường cắt mức 0 là lúc giá trị hiện tại vừa bằng vốn.',
          'The line runs left to right along the Current value (Vend) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on what the investment is worth now, not market history. The line rises steadily: with the outlay held still, every step up in current value adds the same step to the percentage gain. Where the line crosses 0 the current value just equals the money put in.',
        ),
        cot: d(
          'Mỗi cột là ROI ở một mức giá trị hiện tại, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 là lỗ; chiều dài cột là phần trăm so với vốn ban đầu.',
          'Each bar is ROI at one current value, and the solid one is the level you have entered. A bar standing above the zero line is a gain, one hanging below the zero line is a loss; its length is the percentage of the original outlay.',
        ),
        diem: d(
          'Mỗi chấm là ROI tính ở một mức của ô Giá trị hiện tại (Vcuoi), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu khoản đầu tư đang đáng giá khác đi thì ROI ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, hai chấm kề nhau luôn cách một khoảng như nhau: vốn bỏ ra giữ nguyên, nên mỗi bước giá trị hiện tại cộng vào ROI cùng một số phần trăm. Những chấm nằm dưới 0 là những mức giá trị chưa về tới số vốn.',
          'Each dot is ROI at one level of the Current value (Vend) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on what the investment is worth now, not market history. The row of dots rises with the same gap between neighbors throughout: with the outlay held still, each step in current value adds the same number of percentage points to ROI. Dots below 0 are values that have not yet climbed back to the money put in.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi vốn bỏ ra nằm trong dải của ô Giá trị hiện tại (Vcuoi), nên trên trục có cả mức đang lỗ lẫn mức đang lãi. Đường đi lên; phần nằm dưới vạch 0 tô đỏ ở bên trái là những mức giá trị thấp hơn vốn, ROI âm, khoản đầu tư đang lỗ; phần nằm trên vạch 0 tô xanh ở bên phải là những mức cao hơn vốn, ROI dương. Chỗ đường cắt vạch 0 là lúc giá trị hiện tại vừa bằng đúng số vốn đã bỏ ra. Đây là phép thử theo giá trị hiện tại, không phải diễn biến thị trường.',
          'This form appears when the outlay lies inside the Current value (Vend) range, so the axis holds both losing and winning values. The line rises; the part below the zero line on the left is shaded red, values under the outlay with a negative ROI, and the part above the zero line on the right is shaded green, values above the outlay with a positive ROI. Where the line crosses the zero line the current value exactly equals the money put in. It is a what-if on the current value, not market history.',
        ),
      },
    },
  },

  hpr: {
    truc: {
      startPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá đầu kỳ (Pdau), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu giá lúc bắt đầu nắm giữ khác đi mà giá cuối kỳ và cổ tức đứng yên thì HPR ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: vào giá càng cao thì phần tăng giá càng mỏng mà vốn gốc càng lớn; đường xuống dưới 0 khi giá đầu kỳ vượt giá cuối kỳ cộng cổ tức.',
          'The line runs left to right along the Starting price (Pstart) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on a different price at the start of the holding period with the ending price and the dividend held still, not market history. The line falls and flattens: the higher the entry price, the thinner the price gain and the larger the base it is measured on; the line drops below 0 once the starting price exceeds the ending price plus the dividend.',
        ),
        cot: d(
          'Mỗi cột là HPR ở một mức giá đầu kỳ, cột tô đặc là mức giá bạn đang nhập. Cột mọc lên trên vạch 0 là kỳ nắm giữ có lãi, cột quay xuống dưới vạch 0 ở bên phải là lỗ dù đã cộng cổ tức.',
          'Each bar is HPR at one starting price, and the solid one is the price you have entered. Bars above the zero line are holding periods that made money; bars below the zero line on the right lost money even after the dividend.',
        ),
        diem: d(
          'Mỗi chấm là HPR tính ở một mức của ô Giá đầu kỳ (Pdau), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức giá bạn nhập. Đây là phép thử nếu giá lúc bắt đầu nắm giữ khác đi mà giá cuối kỳ và cổ tức đứng yên thì HPR ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, bên trái tụt từng quãng dài, sang phải quãng tụt ngắn dần: giá đầu kỳ vừa bớt phần tăng giá vừa là gốc để chia, nên vào giá rẻ thì mỗi bước giá làm HPR đổi rất nhiều, vào giá đắt thì đổi ít.',
          'Each dot is HPR at one level of the Starting price (Pstart) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on a different price at the start of the holding period with the ending price and dividend held still, not market history. The row of dots falls in long drops on the left that shorten toward the right: the starting price both trims the price gain and is the base the gain is divided by, so a cheap entry makes HPR swing a lot per step while an expensive one moves it little.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi giá cuối kỳ cộng cổ tức rơi vào dải của ô Giá đầu kỳ (Pdau), nên trên trục có cả kỳ nắm giữ lãi lẫn kỳ lỗ. Đường đi xuống; phần nằm trên vạch 0 tô xanh ở bên trái là những giá vào mà tính cả cổ tức vẫn lãi, phần nằm dưới vạch 0 tô đỏ ở bên phải là những giá vào khiến kỳ nắm giữ lỗ dù đã nhận cổ tức. Đường cắt vạch 0 đúng ở giá đầu kỳ bằng giá cuối kỳ cộng cổ tức. Đây là phép thử theo giá vào, không phải diễn biến thị trường.',
          'This form appears when the ending price plus the dividend lies inside the Starting price (Pstart) range, so the axis holds both winning and losing holding periods. The line falls; the part above the zero line on the left is shaded green, entry prices that still make money once the dividend is counted, and the part below the zero line on the right is shaded red, entry prices that lose money even after the dividend. The line crosses the zero line exactly where the starting price equals the ending price plus the dividend. It is a what-if on the entry price, not market history.',
        ),
      },
      endPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá cuối kỳ (Pcuoi), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu giá cuối kỳ khác đi thì lợi suất cả kỳ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: giá đầu kỳ và cổ tức giữ nguyên, giá cuối kỳ càng cao thì lợi suất càng lớn. Chỗ đường cắt mức 0 nằm thấp hơn giá đầu kỳ một chút, vì cổ tức đã bù một phần.',
          'The line runs left to right along the Ending price (Pend) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on where the price ends the period, not market history. The line rises steadily: with the starting price and dividend held still, a higher ending price means a larger return. It crosses 0 slightly below the starting price, because the dividend makes up part of the gap.',
        ),
        cot: d(
          'Mỗi cột là HPR ở một mức giá cuối kỳ, cột tô đặc là mức bạn đang nhập. Cột mọc lên trên vạch 0 là kỳ nắm giữ có lãi, cột quay xuống dưới vạch 0 là lỗ dù đã cộng cổ tức.',
          'Each bar is the HPR at one ending price, and the solid one is the price you have entered. A bar standing above the zero line is a holding period that paid, one hanging below the zero line is a loss even after the dividend.',
        ),
        diem: d(
          'Mỗi chấm là HPR tính ở một mức của ô Giá cuối kỳ (Pcuoi), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu giá kết thúc kỳ ở mức khác thì lợi suất cả kỳ ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thẳng hàng, khoảng cách giữa các chấm đều nhau: giá đầu kỳ và cổ tức đứng yên, nên mỗi bước giá cuối kỳ cộng vào HPR một phần như nhau, đúng bằng bước ấy tính theo phần trăm của giá đầu kỳ.',
          'Each dot is HPR at one level of the Ending price (Pend) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on where the price ends the period, not market history. The row of dots rises in a straight line with even gaps: with the starting price and dividend held still, each step in the ending price adds the same amount to HPR, namely that step as a percentage of the starting price.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi giá đầu kỳ trừ cổ tức nằm trong dải của ô Giá cuối kỳ (Pcuoi), nên trên trục có cả mức kết thúc lỗ lẫn mức kết thúc lãi. Đường đi lên; phần nằm dưới vạch 0 tô đỏ là những giá cuối kỳ khiến kỳ nắm giữ lỗ dù đã cộng cổ tức, phần nằm trên vạch 0 tô xanh là những giá cuối kỳ cho lợi suất dương. Đường cắt vạch 0 thấp hơn giá đầu kỳ đúng bằng phần cổ tức: cổ tức đã bù trước chừng ấy giá giảm. Đây là phép thử theo giá cuối kỳ, không phải diễn biến thị trường.',
          'This form appears when the starting price minus the dividend lies inside the Ending price (Pend) range, so the axis holds both losing and winning endings. The line rises; the part below the zero line is shaded red, ending prices that leave a loss even with the dividend added, and the part above the zero line is shaded green, ending prices with a positive return. The line crosses the zero line below the starting price by exactly the dividend: the dividend has already made up that much of a price drop. It is a what-if on the ending price, not market history.',
        ),
      },
      dividend: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Cổ tức nhận trong kỳ (D), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu cổ tức nhận được khác đi mà hai mức giá đứng yên thì HPR ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: mỗi đồng cổ tức cộng thẳng vào phần lãi, tính trên cùng một giá đầu kỳ.',
          'The line runs left to right along the Dividends received during the period (D) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different dividend with both prices held still, not market history. The line rises steadily: every unit of dividend adds straight to the gain, measured on the same starting price.',
        ),
        cot: d(
          'Mỗi cột là HPR ở một mức cổ tức, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Phần chênh giữa cột thấp nhất và cột cao nhất cho thấy cổ tức góp bao nhiêu vào lợi suất so với phần tăng giá.',
          'Each bar is HPR at one dividend level; bars grow taller to the right and the solid one is the level you have entered. The spread between the shortest and the tallest bar shows how much the dividend contributes to the return next to the price gain.',
        ),
        diem: d(
          'Mỗi chấm là HPR tính ở một mức của ô Cổ tức nhận trong kỳ (D), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu cổ tức nhận được khác đi mà hai mức giá đứng yên thì HPR ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, các chấm cách nhau như nhau: mỗi đồng cổ tức cộng thẳng vào phần lãi rồi chia cho cùng một giá đầu kỳ, nên mỗi bước cổ tức thêm vào HPR đúng một phần như nhau.',
          'Each dot is HPR at one level of the Dividends received during the period (D) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on a different dividend with both prices held still, not market history. The row of dots rises in even steps: every unit of dividend goes straight into the gain and is divided by the same starting price, so each step in the dividend adds the same slice of return.',
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
      diem: d(
        'Mỗi chấm là HPR nếu kỳ nắm giữ kết thúc ở giá đóng cửa của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; giá đầu kỳ và cổ tức vẫn là con số bạn nhập. Hình đi theo đúng chuỗi giá bạn đã nạp, tính từ giá đầu kỳ của bạn, nên dãy chấm có cùng dáng với giá đóng cửa. Dãy chấm đi lên là lợi suất đang tích luỹ thêm, đi xuống là phần lãi đang bị trả lại; hai chấm kề nhau cách xa theo chiều dọc là giữa hai phiên ấy giá đổi mạnh.',
        'Each dot is the HPR had the holding period ended at one session’s close, running from the oldest session on the left to the most recent session on the right; your starting price and dividend stay as entered. The chart follows the price series you loaded, measured from your starting price, so the row of dots has the same shape as the closing prices. When it rises the return is still building; when it falls gains are being handed back. Two neighboring dots far apart in height mean the price moved sharply between those sessions.',
      ),
      bac: d(
        'Mỗi bậc là HPR nếu kỳ nắm giữ kết thúc ở một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang hết phiên ấy rồi mới nhảy, vì kỳ nắm giữ chỉ kết thúc được ở giá đóng cửa của một phiên, giữa hai phiên không có mức nào khác. Giá đầu kỳ và cổ tức đứng yên, nên mỗi bậc nhảy đúng bằng chênh lệch giá đóng cửa giữa hai phiên tính theo phần trăm của giá đầu kỳ. Bậc đi lên là lợi suất đang tích luỹ thêm, đi xuống là phần lãi đang bị trả lại.',
        'Each step is the HPR had the holding period ended in one session, running from the oldest session on the left to the most recent session on the right: a step stays level through its session and then jumps, because the period can only end at some session’s close and nothing lies between two sessions. With the starting price and dividend held still, each jump is exactly the change in close between two sessions as a percentage of your starting price. When the staircase rises the return is building; when it falls gains are being handed back.',
      ),
      laiLo: d(
        'Dạng biểu đồ này hiện khi chuỗi đã nạp có cả phiên bạn đang lãi lẫn phiên đang lỗ so với giá đầu kỳ. Đường đi từ phiên cũ nhất nằm bên trái tới phiên gần nhất nằm bên phải; phần nằm trên vạch 0 tô xanh là những phiên mà kết thúc kỳ ở giá đóng cửa ấy, cộng cả cổ tức, thì có lãi, phần nằm dưới tô đỏ là những phiên vẫn lỗ dù đã tính cổ tức. Đường đi lên là lợi suất đang hồi lại hoặc tích luỹ thêm, đi xuống là lãi đang bị trả lại; đường cắt vạch 0 ở chỗ giá đóng cửa đi qua mức giá đầu kỳ trừ cổ tức.',
        'This form appears when the loaded series holds sessions both in profit and at a loss against your starting price. The line runs from the oldest session on the left to the most recent session on the right; the part above the zero line is shaded green, sessions where ending the period at that close, dividend included, makes money, and the part below is shaded red, sessions still at a loss after the dividend. When the line rises the return is recovering or building; when it falls gains are being handed back. It crosses the zero line where the close passes the starting price minus the dividend.',
      ),
    },
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Lời từ chênh giá rồi Cổ tức (D) cộng lại thành thanh sẫm cuối cùng, Tổng lời mỗi CP, là khoản lời tuyệt đối trên một cổ phiếu trước khi chia cho giá đầu kỳ và đổi ra phần trăm ở khối Kết quả. Thanh Cổ tức (D) dài hơn thanh Lời từ chênh giá là phần cổ tức nhận được đang góp nhiều đồng hơn chính việc giá lên xuống vào khoản lời ấy.',
        'Each horizontal bar is one part, read from top to bottom: Price gain then Dividend (D) add up to the dark bar at the end, Total gain/share, the absolute gain on one share before it is divided by the starting price and turned into the percentage in the Result block. A Dividend (D) bar longer than the Price gain bar means the dividend received is contributing more to that gain than the price move itself.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Tổng lời mỗi CP thành hai múi, Lời từ chênh giá và Cổ tức (D), mỗi múi to theo phần nó chiếm trong khoản lời mỗi cổ phiếu. Lỗ giữa in Tổng lời mỗi CP cùng giá trị của nó; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Cổ tức (D) càng lớn thì phần lời nhờ cổ tức càng áp đảo phần lời nhờ giá lên xuống.',
        'The ring splits Total gain/share into two slices, Price gain and Dividend (D), each sized by its share of the gain per share. The hole shows Total gain/share and its value; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The bigger the Dividend (D) slice, the more the dividend outweighs the price move in that gain.',
      ),
    },
  },

  cagr: {
    truc: {
      start: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá trị ban đầu (Vdau), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu điểm xuất phát khác đi mà giá trị cuối kỳ và số năm đứng yên thì CAGR ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: xuất phát càng cao thì quãng đường tới giá trị cuối càng ngắn, nên tốc độ tăng mỗi năm cần có càng thấp.',
          'The line runs left to right along the Starting value (Vstart) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different starting point with the ending value and the number of years held still, not market history. The line falls and flattens: the higher the start, the shorter the climb to the ending value, so the yearly growth needed is lower.',
        ),
        cot: d(
          'Mỗi cột là CAGR ở một mức giá trị ban đầu, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Chọn năm gốc rơi vào đáy thị trường là tự đặt mình ở cột cao bên trái: CAGR đẹp lên mà khoản đầu tư không tốt hơn.',
          'Each bar is CAGR at one starting value; bars shrink to the right and the solid one is the value you have entered. Picking a base year at a market bottom puts you on a tall bar to the left: the CAGR looks better while the investment is no better.',
        ),
        diem: d(
          'Mỗi chấm là CAGR tính ở một mức của ô Giá trị ban đầu (Vdau), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu điểm xuất phát khác đi mà giá trị cuối kỳ và số năm đứng yên thì CAGR ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, các chấm bên trái cách nhau xa, sang phải xích lại gần: xuất phát càng thấp thì quãng đường tới giá trị cuối càng dài, nên ở vùng thấp chỉ cần nhích điểm xuất phát một chút là tốc độ mỗi năm đổi đi nhiều.',
          'Each dot is CAGR at one level of the Starting value (Vstart) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on a different starting point with the ending value and the number of years held still, not market history. The row of dots falls, spaced far apart on the left and closer together on the right: a low start leaves a long climb to the ending value, so at the low end a small shift in the starting point changes the yearly rate a lot.',
        ),
        laiLo: d(
          'Dạng biểu đồ này chỉ hiện khi giá trị cuối kỳ rơi vào trong dải của ô Giá trị ban đầu (Vdau), tức hai giá trị không cách nhau quá xa. Đường đi xuống; phần nằm trên vạch 0 tô xanh ở bên trái là những điểm xuất phát thấp hơn giá trị cuối kỳ, CAGR dương, khoản đầu tư lớn lên; phần nằm dưới vạch 0 tô đỏ ở bên phải là những điểm xuất phát cao hơn, CAGR âm, khoản đầu tư teo đi mỗi năm. Đường cắt vạch 0 đúng ở mức giá trị ban đầu bằng giá trị cuối kỳ. Đây là phép thử theo điểm xuất phát, không phải diễn biến thị trường.',
          'This form appears only when the ending value lies inside the Starting value (Vstart) range, meaning the two values are not too far apart. The line falls; the part above the zero line on the left is shaded green, starting points below the ending value with a positive CAGR, an investment that grew; the part below the zero line on the right is shaded red, starting points above it with a negative CAGR, an investment that shrank each year. The line crosses the zero line exactly where the starting value equals the ending value. It is a what-if on the starting point, not market history.',
        ),
      },
      end: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá trị cuối kỳ (Vcuoi), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu khoản đầu tư kết thúc ở mức khác thì tốc độ tăng mỗi năm là bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: số năm giữ nguyên, giá trị cuối càng lớn thì tốc độ tăng bình quân càng cao, song mỗi phần giá trị thêm vào nâng tốc độ ấy ít hơn phần trước.',
          'The line runs left to right along the Ending value (Vend) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on where the investment ends up, not market history. The line rises but flattens: with the years held still, a larger ending value means a higher average yearly growth, yet each extra slice of value lifts that rate less than the slice before.',
        ),
        cot: d(
          'Mỗi cột là CAGR ở một mức giá trị cuối kỳ, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột là mức tăng đều mỗi năm cần có để đi từ giá trị đầu tới giá trị cuối ấy.',
          'Each bar is the CAGR at one ending value; bars grow taller to the right and the solid one is the level you have entered. Bar height is the even yearly growth needed to get from the starting value to that ending value.',
        ),
        diem: d(
          'Mỗi chấm là CAGR tính ở một mức của ô Giá trị cuối kỳ (Vcuoi), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu khoản đầu tư kết thúc ở mức khác thì tốc độ tăng mỗi năm là bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên, và khi chặng tính dài hơn một năm thì các chấm xích lại gần nhau dần về bên phải: mức tăng được chia cho từng năm theo lối kép, nên mỗi phần giá trị cuối thêm vào nâng tốc độ mỗi năm ít hơn phần trước.',
          'Each dot is CAGR at one level of the Ending value (Vend) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on where the investment ends up, not market history. The row of dots rises, and once the period spans more than one year the dots draw closer together toward the right: the growth is spread across the years by compounding, so each extra slice of ending value lifts the yearly rate less than the slice before.',
        ),
        laiLo: d(
          'Dạng biểu đồ này chỉ hiện khi giá trị ban đầu nằm trong dải của ô Giá trị cuối kỳ (Vcuoi), nên trên trục có cả mức kết thúc thấp hơn lẫn cao hơn điểm xuất phát. Đường đi lên; phần nằm dưới vạch 0 tô đỏ ở bên trái là những mức kết thúc thấp hơn giá trị ban đầu, CAGR âm, khoản đầu tư teo đi mỗi năm; phần nằm trên vạch 0 tô xanh ở bên phải là những mức kết thúc cao hơn, CAGR dương. Đường cắt vạch 0 đúng ở mức giá trị cuối kỳ bằng giá trị ban đầu. Đây là phép thử theo giá trị cuối kỳ, không phải diễn biến thị trường.',
          'This form appears only when the starting value lies inside the Ending value (Vend) range, so the axis holds endings both below and above the starting point. The line rises; the part below the zero line on the left is shaded red, endings under the starting value with a negative CAGR, an investment that shrank each year; the part above the zero line on the right is shaded green, endings above it with a positive CAGR. The line crosses the zero line exactly where the ending value equals the starting value. It is a what-if on the ending value, not market history.',
        ),
      },
      years: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số năm (t), từ một nửa đến gấp rưỡi số năm bạn đang nhập, kể cả những số năm lẻ ở giữa; vạch đứt dọc có chấm tròn là đúng số năm bạn nhập. Đây là phép thử nếu cùng mức tăng ấy trải ra nhiều hay ít năm hơn thì CAGR ra bao nhiêu, không phải diễn biến thị trường. Khi giá trị cuối cao hơn giá trị đầu, đường đi xuống và thoải dần: cùng một tổng mức tăng mà mất càng nhiều năm thì tốc độ mỗi năm càng thấp. Khoản đầu tư đang lỗ thì đường đi lên: trải càng nhiều năm thì mức lỗ mỗi năm càng nhẹ.',
          'The line runs left to right along the Number of years (t) field, from half to one and a half times the number of years you have entered, fractions of a year included; the dashed vertical line with a dot marks your own figure. It is a what-if on spreading the same gain over more or fewer years, not market history. When the ending value is above the starting value the line falls and flattens: the same total gain taking more years means a lower rate per year. For an investment that lost value the line rises: the more years it spans, the milder the yearly loss.',
        ),
        cot: d(
          'Mỗi cột là CAGR ứng với một số năm, cột tô đặc là số năm bạn đang nhập. Khi giá trị cuối cao hơn giá trị đầu, cột thấp dần về bên phải; khoản đầu tư đang lỗ thì cột quay xuống dưới và ngắn dần. Cột ở chặng ngắn chênh nhau nhiều hơn ở chặng dài: với chặng vài năm, đếm lệch một năm làm CAGR đổi đáng kể, nên tính số năm lẻ từ đúng ngày đầu tới ngày cuối.',
          'Each bar is CAGR for one number of years, and the solid one is the number you have entered. When the ending value is above the starting value the bars shrink to the right; for an investment that lost value they hang down and get shorter. Bars differ more over short spans than over long ones: across a few years, miscounting by a year moves CAGR a lot, so count the fractional years from the exact first day to the last.',
        ),
        diem: d(
          'Mỗi chấm là CAGR ứng với một số năm của ô Số năm (t), từ một nửa đến gấp rưỡi số năm bạn đang nhập, kể cả những số năm lẻ ở giữa; chấm nằm trên vạch đứt dọc là đúng số năm bạn nhập. Đây là phép thử nếu cùng mức thay đổi ấy trải ra nhiều hay ít năm hơn thì CAGR ra bao nhiêu, không phải diễn biến thị trường. Khi giá trị cuối cao hơn giá trị đầu, dãy chấm đi xuống và khoảng tụt giữa hai chấm kề nhau nhỏ dần về bên phải; khoản đầu tư đang lỗ thì dãy chấm đi lên, mức lỗ mỗi năm nhẹ dần khi trải ra nhiều năm hơn.',
          'Each dot is CAGR for one number of years in the Number of years (t) field, from half to one and a half times the years you have entered, fractions of a year included; the dot on the dashed vertical line is your own figure. It is a what-if on spreading the same overall change over more or fewer years, not market history. When the ending value is above the starting value the row of dots falls, and the drop between neighbors shrinks toward the right; for an investment that lost value the row rises, the yearly loss easing as it is spread over more years.',
        ),
      },
    },
  },

  'ty-suat-co-tuc': {
    truc: {
      price: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thị giá (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu mua ở giá khác thì tỷ suất cổ tức ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: cổ tức mỗi năm giữ nguyên, mua càng đắt thì số tiền cổ tức ấy càng nhỏ so với tiền bỏ ra.',
          'The line runs left to right along the Market price (P) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on the yield you get by buying at another price, not market history. The line falls and flattens: with the yearly dividend held still, the more you pay, the smaller that dividend is against your outlay.',
        ),
        cot: d(
          'Mỗi cột là tỷ suất cổ tức ở một mức giá, cột thấp dần về bên phải và cột tô đặc là mức giá bạn đang nhập. Chiều cao cột so được thẳng với lãi suất tiết kiệm cùng kỳ hạn.',
          'Each bar is the dividend yield at one price level; bars shrink to the right and the solid one is the price you have entered. Bar height compares directly with a savings rate for the same term.',
        ),
        diem: d(
          'Mỗi chấm là tỷ suất cổ tức tính ở một mức của ô Thị giá (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu mua ở giá khác thì tỷ suất cổ tức ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, các chấm bên trái cách nhau xa còn bên phải dồn sát lại: cổ tức cả năm giữ nguyên, chỉ có giá đổi, nên ở vùng giá rẻ mỗi bước giá làm tỷ suất đổi rất nhiều, ở vùng giá đắt chỉ đổi chút ít.',
          'Each dot is the dividend yield at one level of the Market price (P) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on the yield you get by buying at another price, not market history. The row of dots falls, spread wide on the left and bunched close on the right: with the yearly dividend held still, each price step moves the yield a lot where the share is cheap and only a little where it is expensive.',
        ),
      },
      dividendPerShare: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Cổ tức cả năm (D), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mức cổ tức đổi mà thị giá đứng yên thì tỷ suất cổ tức ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cùng một giá mua, doanh nghiệp chia thêm bao nhiêu phần thì tỷ suất tăng bấy nhiêu phần.',
          'The line runs left to right along the Annual dividend (D) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the dividend with the market price held still, not market history. The line rises steadily: at the same purchase price, the yield grows in exact proportion to what the company pays out.',
        ),
        cot: d(
          'Mỗi cột là tỷ suất cổ tức ở một mức cổ tức, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Các cột bên trái cho thấy tỷ suất còn lại bao nhiêu nếu doanh nghiệp cắt cổ tức, điều bảng giá hôm nay không báo trước.',
          'Each bar is the dividend yield at one dividend level; bars grow taller to the right and the solid one is the level you have entered. The bars on the left show what yield is left if the company cuts its dividend, something today’s price board does not warn about.',
        ),
        diem: d(
          'Mỗi chấm là tỷ suất cổ tức tính ở một mức của ô Cổ tức cả năm (D), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu mức cổ tức đổi mà thị giá đứng yên thì tỷ suất cổ tức ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thẳng hàng, cách đều nhau: cổ tức gấp đôi thì tỷ suất gấp đôi, nên kéo dài hàng chấm về bên trái sẽ chạm đúng mức 0 ở chỗ không chia đồng cổ tức nào.',
          'Each dot is the dividend yield at one level of the Annual dividend (D) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the dividend with the market price held still, not market history. The row of dots rises in a straight, evenly spaced line: doubling the dividend doubles the yield, so extending the row to the left would meet 0 exactly where no dividend is paid.',
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
      diem: d(
        'Mỗi chấm là tỷ suất cổ tức tính với giá đóng cửa của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; cổ tức cả năm vẫn là con số bạn nhập. Hình đi theo chuỗi giá bạn đã nạp nhưng ngược chiều giá: dãy chấm đi lên là giá đang giảm nên cùng số cổ tức ấy thành tỷ suất cao hơn, đi xuống là giá đang tăng. Ở những đoạn giá thấp, các chấm nhảy xa nhau hơn ở đoạn giá cao dù giá đổi cùng một mức, vì tỷ suất là cổ tức chia cho giá.',
        'Each dot is the dividend yield at one session’s closing price, running from the oldest session on the left to the most recent session on the right; the yearly dividend stays at the figure you entered. The chart follows the price series you loaded but moves against it: when the row of dots rises the price is dropping, so the same dividend makes a higher yield, and when it falls the price is climbing. Where the price is low the dots jump further apart for the same price move, because the yield is the dividend divided by the price.',
      ),
      bac: d(
        'Mỗi bậc là tỷ suất cổ tức của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy, vì tỷ suất chỉ được tính lại khi có giá đóng cửa mới, tức ở phiên kế tiếp. Cổ tức cả năm đứng yên nên mỗi bậc nhảy chỉ do giá: bậc đi lên là giá đóng cửa vừa giảm, đi xuống là giá vừa tăng, và cùng một bước giá thì bậc nhảy cao hơn khi giá đang ở vùng thấp.',
        'Each step is the dividend yield of one session, running from the oldest session on the left to the most recent session on the right: a step stays level through its session and then jumps, as the yield is only recomputed when a new close arrives in the next session. The yearly dividend stays put, so every jump comes from the price alone: when the staircase rises the close has just dropped, when it falls the close has just climbed, and the same price move makes a taller jump when the price is low.',
      ),
    },
  },

  'loi-suat-nam-hoa': {
    truc: {
      periodReturn: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất một kỳ (rky), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lợi suất của một kỳ khác đi mà số kỳ trong năm đứng yên thì lợi suất năm ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc dần: lãi của kỳ sau tính trên cả lãi của kỳ trước, nên lợi suất một kỳ tăng gấp đôi thì lợi suất năm tăng hơn gấp đôi.',
          'The line runs left to right along the Return per period (rperiod) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different return per period with the number of periods per year held still, not market history. The line rises and steepens: each period’s return is earned on the earlier ones as well, so doubling the return per period more than doubles the annual figure.',
        ),
        cot: d(
          'Mỗi cột là lợi suất năm hoá ở một mức lợi suất kỳ, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột cao không phải lời hứa: nó giả định kỳ nào trong năm cũng lặp lại đúng mức lợi suất ấy.',
          'Each bar is the annualized return at one per-period return; bars grow taller to the right and the solid one is the level you have entered. A tall bar is not a promise: it assumes every period of the year repeats exactly that return.',
        ),
        diem: d(
          'Mỗi chấm là lợi suất năm hoá tính ở một mức của ô Lợi suất một kỳ (rky), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu một kỳ lãi nhiều hay ít hơn mà số kỳ trong năm đứng yên thì cả năm ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên, và khi năm có nhiều kỳ thì mỗi chấm cao hơn chấm trước một đoạn nhỉnh dần về bên phải: lãi kỳ sau tính trên cả lãi các kỳ trước, nên lợi suất kỳ càng cao thì mỗi bước thêm càng đẩy con số cả năm đi xa.',
          'Each dot is the annualized return at one level of the Return per period (rperiod) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on earning more or less in one period with the periods per year unchanged, not market history. The row of dots rises, and when the year holds several periods each dot sits a little further above the one before: every period earns on the gains of the periods before it, so the higher the return per period, the further each extra step pushes the annual figure.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi ô Lợi suất một kỳ (rky) đang là 0: trục ngang khi ấy trải suốt miền của ô, từ mức mất trắng nằm bên trái tới mức lãi lớn nhất ô cho nhập nằm bên phải. Đây là phép thử nếu kỳ nào trong năm cũng lặp lại đúng một mức lợi suất, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 đúng ở lợi suất một kỳ bằng 0. Phần nằm trên vạch 0 tô xanh là kỳ lãi, quy ra cả năm vẫn lãi; phần nằm dưới tô đỏ là kỳ lỗ, lặp lại cả năm thì vốn hụt đi. Khi năm có nhiều kỳ, phần xanh vươn cao hơn hẳn phần đỏ: lỗ nhiều nhất là mất trắng, còn lãi được ghép qua từng kỳ.',
          'This form appears when the Return per period (rperiod) field is 0: the axis then spans the field’s whole range, from a total loss to its largest gain. It is a what-if on every period of the year repeating one return, not market history. The line rises and crosses the zero line where the return per period is 0. Above it the area is shaded green, gaining periods that make a gain for the year; below it is shaded red, losing periods that shrink the capital. With many periods a year the green reaches far higher than the red sinks: a loss can at most wipe out the capital, while gains compound.',
        ),
      },
      periodsPerYear: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số kỳ trong một năm (m), từ một nửa đến gấp rưỡi con số bạn đang nhập, mỗi điểm là một số kỳ tròn; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu một năm có số kỳ khác thì lợi suất quy năm ra bao nhiêu, không phải diễn biến thị trường. Khi lợi suất một kỳ dương, đường đi lên: cùng một lợi suất mỗi kỳ, một năm chứa càng nhiều kỳ thì lợi suất ấy được ghép lãi càng nhiều lần. Lợi suất một kỳ âm thì đường đi xuống: càng nhiều kỳ thì khoản lỗ cả năm càng sâu.',
          'The line runs left to right along the Number of periods per year (m) field, from half to one and a half times the figure you have entered, one whole number of periods per point; the dashed vertical line with a dot marks your own figure. It is a what-if on how many periods a year holds, not market history. With a positive return per period the line rises: at the same return per period, the more periods a year contains, the more times that return compounds. With a negative return per period the line falls: more periods mean a deeper loss for the year.',
        ),
        cot: d(
          'Mỗi cột là lợi suất quy năm ứng với một số kỳ, cột tô đặc là số kỳ bạn đang nhập. Khi lợi suất một kỳ dương, cột cao dần về bên phải; âm thì cột quay xuống dưới và dài dần. Chọn sai số kỳ là đọc nhầm cả cột: lợi suất tháng phải đi với số kỳ của tháng, lợi suất tuần đi với số kỳ của tuần.',
          'Each bar is the annualized return for one number of periods, and the solid one is the count you have entered. With a positive return per period the bars grow taller to the right; with a negative one they hang down and grow longer. Picking the wrong count means reading the wrong bar: a monthly return goes with the monthly count, a weekly return with the weekly count.',
        ),
        diem: d(
          'Mỗi chấm là lợi suất quy năm ứng với một số kỳ tròn trong ô Số kỳ trong một năm (m), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số kỳ bạn nhập. Đây là phép thử nếu một năm chia thành nhiều hay ít kỳ hơn, không phải diễn biến thị trường. Khi lợi suất một kỳ dương, dãy chấm đi lên và mỗi chấm cách chấm trước xa dần một chút: thêm một kỳ là ghép thêm một lần lãi lên cả phần đã tích luỹ. Lợi suất một kỳ âm thì dãy chấm đi xuống, mỗi bước hạ ngắn dần.',
          'Each dot is the annualized return for one whole number of periods in the Number of periods per year (m) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own count. It is a what-if on splitting the year into more or fewer periods, not market history. With a positive return per period the row of dots rises, each dot a little further above the last: one more period means compounding once more on everything built up so far. With a negative return per period the row falls, each drop a little shorter than the one before.',
        ),
        bac: d(
          'Mỗi bậc là lợi suất quy năm ứng với một số kỳ trong ô Số kỳ trong một năm (m), từ một nửa đến gấp rưỡi con số bạn đang nhập: bậc giữ nằm ngang tới số kỳ kế tiếp rồi mới nhảy, vì phép tính làm tròn số kỳ và một năm không có nửa kỳ. Đây là phép thử nếu năm chia thành nhiều hay ít kỳ hơn, không phải diễn biến thị trường. Khi lợi suất một kỳ dương, bậc thang đi lên và mỗi bậc nhảy cao hơn bậc trước một chút, vì kỳ thêm vào ghép lãi lên phần đã lớn hơn; lợi suất một kỳ âm thì bậc thang đi xuống, mỗi bậc hạ ít hơn bậc trước.',
          'Each step is the annualized return for one count in the Number of periods per year (m) field, from half to one and a half times the figure you have entered: a step stays level until the next whole count and then jumps, because the formula rounds this field and a year has no half period. It is a what-if on splitting the year into more or fewer periods, not market history. With a positive return per period the staircase rises, each jump a little taller, since every added period compounds on a larger base; with a negative one it falls, each drop a little smaller.',
        ),
      },
    },
  },

  'loi-suat-thuc': {
    truc: {
      nominal: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất danh nghĩa / năm (rdanh nghia), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lợi suất danh nghĩa đổi thì sức mua thật tăng bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều, và khi lạm phát dương thì nó nằm thấp hơn chính lợi suất danh nghĩa: khoảng hụt ấy là phần lạm phát đã lấy đi.',
          'The line runs left to right along the Nominal return / year (rnominal) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the nominal return, not market history. The line rises steadily, and while inflation is positive it sits below the nominal return itself: that shortfall is what inflation has taken.',
        ),
        cot: d(
          'Mỗi cột là lợi suất thực ở một mức lợi suất danh nghĩa, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột càng thấp thì khoản đầu tư càng chỉ vừa đủ chạy theo giá cả.',
          'Each bar is the real return at one nominal return; bars grow taller to the right and the solid one is the level you have entered. The shorter the bar, the closer the investment comes to merely keeping pace with prices.',
        ),
        diem: d(
          'Mỗi chấm là lợi suất thực tính ở một mức của ô Lợi suất danh nghĩa / năm (rdanh nghia), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lãi trên giấy cao hay thấp hơn mà lạm phát đứng yên, không phải diễn biến thị trường. Dãy chấm đi lên thẳng hàng, các chấm cách nhau đúng một khoảng: mỗi bước lãi danh nghĩa thêm vào nâng lợi suất thực lên như nhau, và khi lạm phát dương thì bước nâng ấy ngắn hơn chính bước lãi một chút, vì phần lãi thêm cũng bị lạm phát làm mất giá.',
          'Each dot is the real return at one level of the Nominal return / year (rnominal) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on a higher or lower paper return with inflation held still, not market history. The row of dots rises in a straight line, the dots evenly spaced: each step up in the nominal return lifts the real return by the same amount, and while inflation is positive that lift is a little smaller than the step itself, because the extra return is eroded by inflation too.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi mức lạm phát nằm trong dải của trục, tức ô Lợi suất danh nghĩa / năm (rdanh nghia) trên trục có chỗ thấp hơn lạm phát, có chỗ cao hơn. Đây là phép thử nếu lãi trên giấy đổi mà lạm phát đứng yên, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 đúng ở mức lợi suất danh nghĩa bằng lạm phát. Phần nằm trên vạch 0 tô xanh là những mức lãi thắng lạm phát, cuối năm tiền mua được nhiều hàng hơn; phần nằm dưới tô đỏ là những mức thua lạm phát, sức mua giảm dù số dư trên sổ có thể vẫn tăng.',
          'This form appears when the inflation rate lies inside the range drawn, so the Nominal return / year (rnominal) field on the axis is below inflation in one part and above it in another. It is a what-if on the paper return with inflation held still, not market history. The line rises and crosses the zero line exactly where the nominal return equals inflation. Above the zero line the area is shaded green, returns that beat inflation so your money buys more; below it is shaded red, returns that trail inflation, so purchasing power shrinks even if the balance still grows.',
        ),
      },
      inflation: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lạm phát / năm (π), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lạm phát đổi mà lợi suất danh nghĩa đứng yên thì lợi suất thực ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống gần như đều: giá cả leo thang càng nhanh thì cùng một mức lãi trên giấy mua được càng ít hàng hoá hơn.',
          'The line runs left to right along the Inflation / year (π) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on inflation with the nominal return held still, not market history. The line falls almost steadily: the faster prices climb, the less the same paper return can actually buy.',
        ),
        cot: d(
          'Mỗi cột là lợi suất thực ở một mức lạm phát, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Khi lạm phát lên bằng đúng lợi suất danh nghĩa thì cột không còn chiều cao: tiền nhiều lên nhưng sức mua đứng yên.',
          'Each bar is the real return at one inflation rate; bars shrink to the right and the solid one is the rate you have entered. When inflation matches the nominal return exactly the bar has no height left: you hold more money but it buys the same.',
        ),
        diem: d(
          'Mỗi chấm là lợi suất thực tính ở một mức của ô Lạm phát / năm (π), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu giá cả leo nhanh hay chậm hơn mà lợi suất danh nghĩa đứng yên, không phải diễn biến thị trường. Dãy chấm đi xuống gần như đều, các chấm bên trái cách nhau xa hơn các chấm bên phải một chút: cùng một bước lạm phát thêm vào làm sức mua hụt nhiều hơn một chút khi lạm phát còn thấp.',
          'Each dot is the real return at one level of the Inflation / year (π) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on prices climbing faster or slower with the nominal return held still, not market history. The row of dots falls almost evenly, the dots on the left slightly further apart than those on the right: the same step of extra inflation takes a little more purchasing power while inflation is still low.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi lợi suất danh nghĩa nằm trong dải của trục, tức ô Lạm phát / năm (π) trên trục có chỗ thấp hơn mức lãi ấy, có chỗ cao hơn. Đây là phép thử nếu lạm phát đổi mà lãi trên giấy đứng yên, không phải diễn biến thị trường. Đường đi xuống và cắt vạch 0 đúng ở mức lạm phát bằng lợi suất danh nghĩa. Phần bên trái, nằm trên vạch 0, tô xanh: lạm phát còn thấp hơn lãi nên tiền vẫn mua được nhiều hàng hơn; phần bên phải, nằm dưới vạch 0, tô đỏ: lạm phát vượt lãi, sức mua giảm dù số tiền trên sổ có thể vẫn lớn lên.',
          'This form appears when the nominal return lies inside the range drawn, so the Inflation / year (π) field on the axis is below that return in one part and above it in another. It is a what-if on inflation with the paper return held still, not market history. The line falls and crosses the zero line exactly where inflation equals the nominal return. The left part, above the zero line, is shaded green: inflation trails the return, so the money buys more; the right part, below it, is shaded red: inflation outruns the return, and purchasing power shrinks even if the balance grows.',
        ),
      },
    },
  },

  'lai-suat-hieu-dung': {
    truc: {
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất danh nghĩa / năm (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất niêm yết đổi thì lãi thật cả năm ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên, và khi lãi được ghép từ hai lần một năm trở lên thì nó nằm cao hơn chính lãi suất danh nghĩa: phần nhô lên là lãi sinh trên lãi, và nó dày dần khi lãi suất tăng. Ghép mỗi năm một lần thì đường trùng đúng lãi suất danh nghĩa.',
          'The line runs left to right along the Nominal rate / year (r) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the quoted rate, not market history. The line rises, and whenever interest compounds twice a year or more it sits above the nominal rate itself: the extra height is interest earned on interest, and it thickens as the rate goes up. With compounding once a year the line matches the nominal rate exactly.',
        ),
        cot: d(
          'Mỗi cột là lãi suất hiệu dụng ở một mức lãi suất danh nghĩa, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Đỉnh cột là mức lãi nên đem so giữa hai sản phẩm có số lần ghép lãi khác nhau.',
          'Each bar is the effective rate at one nominal rate; bars grow taller to the right and the solid one is the level you have entered. The top of a bar is the rate to compare between two products that compound a different number of times.',
        ),
        diem: d(
          'Mỗi chấm là lãi suất hiệu dụng tính ở một mức của ô Lãi suất danh nghĩa / năm (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lãi niêm yết cao hay thấp hơn mà số lần ghép lãi giữ nguyên, không phải diễn biến thị trường. Dãy chấm đi lên; khi lãi được ghép từ hai lần một năm trở lên, mỗi chấm nằm cao hơn chính lãi niêm yết của nó và các chấm cách nhau xa dần một chút về bên phải, vì phần lãi sinh trên lãi lớn nhanh hơn chính lãi suất. Ghép mỗi năm một lần thì các chấm cách đều và trùng đúng lãi niêm yết.',
          'Each dot is the effective annual rate at one level of the Nominal rate / year (r) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the quoted rate with the compounding frequency unchanged, not market history. The row of dots rises; when interest compounds twice a year or more, each dot sits above its own quoted rate and the dots drift slightly further apart to the right, as interest on interest grows faster than the rate. Compounded once a year, the dots are evenly spaced and equal the quoted rate.',
        ),
      },
    },
  },

  'tong-loi-suat-tai-dau-tu': {
    truc: {
      priceGrowth: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tăng giá bình quân / năm (g), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mỗi năm giá tăng nhanh hay chậm hơn thì tổng lợi suất cả giai đoạn ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc dần: mức tăng giá được ghép qua từng năm, nên mỗi điểm phần trăm thêm vào đem lại nhiều hơn điểm trước đó.',
          'The line runs left to right along the Average price growth / year (g) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on prices growing faster or slower each year, not market history. The line rises and steepens: price growth compounds year after year, so each extra percentage point adds more than the one before.',
        ),
        cot: d(
          'Mỗi cột là tổng lợi suất ở một mức tăng giá mỗi năm, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Đây là lợi suất của cả giai đoạn chứ không phải của một năm, nên đừng so chiều cao cột với lãi suất tiết kiệm.',
          'Each bar is the total return at one yearly price growth; bars grow taller to the right and the solid one is the rate you have entered. This is the return over the whole period, not for one year, so do not compare bar height with a savings rate.',
        ),
        diem: d(
          'Mỗi chấm là tổng lợi suất cả giai đoạn tính ở một mức của ô Tăng giá bình quân / năm (g), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu mỗi năm giá tăng nhanh hay chậm hơn mà cổ tức và số năm đứng yên, không phải diễn biến thị trường. Dãy chấm đi lên, và khi giữ từ hai năm trở lên thì khoảng cách giữa hai chấm kề nhau nới rộng dần về bên phải: mức tăng giá được ghép qua từng năm, nên cùng một điểm phần trăm thêm vào đem lại nhiều hơn ở mức tăng giá cao hơn.',
          'Each dot is the total return over the whole period at one level of the Average price growth / year (g) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on prices growing faster or slower with the dividend and the years held still, not market history. The row of dots rises, and once the holding lasts two years or more the gap between neighboring dots widens to the right: price growth compounds year after year, so the same extra percentage point is worth more at a higher growth rate.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi ô Tăng giá bình quân / năm (g) đang là 0, lúc trục trải suốt miền của ô, hoặc khi trục đi qua mức giá giảm mỗi năm vừa đúng bằng phần cổ tức bù lại. Đây là phép thử nếu mỗi năm giá đi nhanh hay chậm hơn, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 đúng ở mức ấy: số cổ phiếu mua thêm bằng cổ tức bù vừa đủ phần giá mất, vốn cuối bằng vốn đầu. Phần nằm trên vạch 0 tô xanh là cả giai đoạn có lãi; phần nằm dưới tô đỏ là giá giảm nhanh hơn cổ tức bù được, khoản nắm giữ teo lại dù cổ tức vẫn đều đặn.',
          'This form appears when the Average price growth / year (g) field is 0, which spreads the axis over the field’s whole range, or when the axis passes the yearly price drop that the dividend exactly makes up for. It is a what-if on faster or slower price moves, not market history. The line rises and crosses the zero line at that point, where the shares bought with dividends just offset the lost price. Above it the area is shaded green, a period that made money overall; below it is shaded red, prices dropping faster than dividends make up, so the holding shrinks.',
        ),
      },
      dividendYield: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tỷ suất cổ tức / năm (y), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tỷ suất cổ tức đổi mà mức tăng giá đứng yên thì tổng lợi suất ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên gần như đều: cổ tức nhận về được đem mua thêm cổ phiếu, nên nó cũng sinh lãi kép như phần tăng giá.',
          'The line runs left to right along the Dividend yield / year (y) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the dividend yield with price growth held still, not market history. The line rises almost steadily: dividends received buy more shares, so they compound just as the price gain does.',
        ),
        cot: d(
          'Mỗi cột là tổng lợi suất ở một mức tỷ suất cổ tức, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Khoảng chênh giữa hai cột là phần lợi suất mà mức cổ tức cao hơn đem lại khi toàn bộ cổ tức được đem mua thêm cổ phiếu, và nó lớn dần theo số năm nắm giữ. Hình này không so tái đầu tư với tiêu cổ tức: cột nào cũng đã giả định tái đầu tư hết.',
          'Each bar is the total return at one dividend yield; bars grow taller to the right and the solid one is the yield you have entered. The gap between two bars is the extra return a higher yield brings when every dividend buys more shares, and it widens with the years held. The chart does not compare reinvesting with spending: every bar already assumes full reinvestment.',
        ),
        diem: d(
          'Mỗi chấm là tổng lợi suất cả giai đoạn tính ở một mức của ô Tỷ suất cổ tức / năm (y), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu cổ tức mỗi năm dày hay mỏng hơn mà mức tăng giá đứng yên, không phải diễn biến thị trường. Dãy chấm đi lên gần như đều, và khi giữ nhiều năm thì khoảng cách giữa các chấm chỉ nới ra rất nhẹ về bên phải: cổ tức được đem mua thêm cổ phiếu, số cổ phiếu ấy năm sau lại nhận cổ tức.',
          'Each dot is the total return over the whole period at one level of the Dividend yield / year (y) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on a richer or thinner dividend with price growth held still, not market history. The row of dots rises almost evenly, and over a holding of several years the gaps widen only very slightly to the right: the dividends buy more shares, and those shares earn dividends the following year too.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi giá giảm mỗi năm và trục đi qua đúng mức cổ tức bù vừa đủ phần giảm ấy, tức ô Tỷ suất cổ tức / năm (y) trên trục có chỗ chưa bù nổi, có chỗ bù dư. Đây là phép thử nếu cổ tức đổi mà mức giảm giá đứng yên, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 ở tỷ suất cổ tức vừa bù hết phần giá mất, vốn cuối bằng vốn đầu. Phần bên trái, nằm dưới vạch 0, tô đỏ là cổ tức quá mỏng nên khoản nắm giữ vẫn teo lại; phần bên phải, nằm trên vạch 0, tô xanh là cổ tức đủ dày để cả giai đoạn vẫn có lãi dù giá giảm.',
          'This form appears when the price drops every year and the axis passes the yield that exactly makes up for that drop, so the Dividend yield / year (y) field on the axis is too thin in one part and enough in another. It is a what-if on the dividend with the price decline held still, not market history. The line rises and crosses the zero line at the yield that just covers the lost price. The red part on the left, below the zero line, is a dividend too thin to stop the holding shrinking; the green part on the right is one rich enough for the period to make money.',
        ),
      },
      years: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số năm nắm giữ (n), từ khoảng một nửa đến gấp rưỡi con số bạn đang nhập, mỗi điểm là một số năm tròn; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu giữ lâu hơn hay ngắn hơn thì tổng lợi suất ra bao nhiêu, không phải diễn biến thị trường. Khi tăng giá và cổ tức cộng lại mỗi năm vẫn dương, đường đi lên và càng lúc càng dốc: mức tăng giá được ghép qua từng năm, cổ tức lại đem mua thêm cổ phiếu và số cổ phiếu ấy cũng nhận cổ tức. Khi giá giảm mỗi năm nhiều hơn mức cổ tức bù lại thì đường đi xuống.',
          'The line runs left to right along the Years held (n) field, from about half to one and a half times the figure you have entered, one whole year per point; the dashed vertical line with a dot marks your own figure. It is a what-if on holding longer or shorter, not market history. While price growth and dividends together stay positive each year, the line rises and keeps steepening: price growth compounds year after year, and dividends buy more shares that earn dividends too. When the price falls each year by more than the dividends make up, the line falls.',
        ),
        cot: d(
          'Mỗi cột là tổng lợi suất sau một số năm, cột tô đặc là số năm bạn đang nhập. Khi tăng giá và cổ tức cộng lại mỗi năm vẫn dương, cột cao dần về bên phải và bậc giữa hai cột cạnh nhau cũng lớn dần: đó là lãi kép, năm sau sinh lời trên số vốn đã lớn lên nhờ cả giá tăng lẫn cổ tức tái đầu tư. Giá giảm nhiều hơn mức cổ tức bù lại thì cột quay xuống dưới và dài dần.',
          'Each bar is the total return after one number of years, and the solid one is the count you have entered. While price growth and dividends together stay positive each year the bars grow taller to the right and the step between neighbors widens too: that is compounding, each later year earning on capital already enlarged by price gains and reinvested dividends. When the price falls by more than the dividends make up, the bars hang down and grow longer.',
        ),
        diem: d(
          'Mỗi chấm là tổng lợi suất sau một số năm tròn trong ô Số năm nắm giữ (n), từ khoảng một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số năm bạn nhập. Đây là phép thử nếu giữ lâu hay ngắn hơn, không phải diễn biến thị trường. Khi tăng giá và cổ tức gộp lại mỗi năm vẫn dương, dãy chấm đi lên và mỗi chấm cách chấm trước xa hơn: năm sau sinh lời trên số vốn đã lớn thêm nhờ các năm trước. Giá giảm nhiều hơn cổ tức bù lại thì dãy chấm đi xuống, mỗi bước hạ ngắn dần.',
          'Each dot is the total return after one whole number of years in the Years held (n) field, from about half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own count. It is a what-if on holding longer or shorter, not market history. While price growth and dividends together stay positive each year, the row of dots rises and each dot sits further above the last: every later year earns on capital the earlier years enlarged. When the price drops by more than the dividends make up, the row falls, each drop shorter than the one before.',
        ),
        bac: d(
          'Mỗi bậc là tổng lợi suất sau một số năm trong ô Số năm nắm giữ (n), từ khoảng một nửa đến gấp rưỡi con số bạn đang nhập: bậc giữ nằm ngang suốt năm ấy rồi mới nhảy sang năm sau, vì phép tính chỉ đếm năm tròn, không có nửa năm. Đây là phép thử nếu giữ thêm hay bớt vài năm, không phải diễn biến thị trường. Khi tăng giá và cổ tức gộp lại mỗi năm vẫn dương, bậc thang đi lên và mỗi bậc nhảy cao hơn bậc trước: đó là lãi kép, năm sau ghép lãi lên cả phần đã lớn thêm. Giá giảm nhiều hơn cổ tức bù lại thì bậc thang đi xuống, mỗi bậc hạ ít hơn bậc trước.',
          'Each step is the total return after one number of years in the Years held (n) field, from about half to one and a half times the figure you have entered: a step stays level through that year and then jumps, because the formula counts whole years only. It is a what-if on holding a few years more or less, not market history. While price growth and dividends together stay positive each year, the staircase rises, each jump taller than the last: that is compounding, every year earning on all the gains before it. When the price drops by more than the dividends make up, it falls, each drop smaller.',
        ),
      },
    },
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Phần do giá tăng rồi Phần nhờ cổ tức cộng lại thành thanh sẫm cuối cùng, Tổng lợi suất (TR), bằng đúng con số ở khối Kết quả. Thanh Phần nhờ cổ tức càng dài thì cổ tức, kể cả phần lãi của số cổ phiếu mua thêm bằng cổ tức, càng góp nhiều vào tổng lợi suất so với riêng việc giá cổ phiếu đi lên.',
        'Each horizontal bar is one part, read from top to bottom: From price growth then From dividends add up to the dark bar at the end, Total return (TR), matching the figure in the Result block exactly. The longer the From dividends bar, the more dividends, including the gains on shares bought with them, contribute to the total return next to the price rise alone.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Tổng lợi suất (TR) thành hai múi, Phần do giá tăng và Phần nhờ cổ tức, mỗi múi to theo phần nó chiếm trong tổng lợi suất. Lỗ giữa in Tổng lợi suất (TR) cùng giá trị của nó; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Phần nhờ cổ tức càng lớn thì phần lãi nhờ cổ tức và lãi kép của nó càng vượt trội so với riêng phần giá lên.',
        'The ring splits Total return (TR) into two slices, From price growth and From dividends, each sized by its share of the total return. The hole shows Total return (TR) and its value; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The bigger the From dividends slice, the more the dividends and their compounding outweigh the price rise alone.',
      ),
    },
  },

  'loi-suat-trung-binh-hinh-hoc': {
    truc: {
      r1: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất kỳ 1 (r1), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu riêng kỳ đầu khác đi còn các kỳ kia đứng yên thì lợi suất trung bình hình học ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên: một kỳ tốt hơn kéo mức trung bình lên, nhưng chỉ kéo được một phần, vì nó bị chia đều cho mọi kỳ.',
          'The line runs left to right along the Return in period 1 (r1) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the first period alone with the other periods held still, not market history. The line rises: one better period lifts the average, but only by a fraction, because it is shared out across all the periods.',
        ),
        cot: d(
          'Mỗi cột là lợi suất trung bình hình học ứng với một mức của kỳ đầu, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Bước giữa hai cột nhỏ hơn hẳn bước của riêng kỳ ấy: một kỳ không quyết định được mức trung bình.',
          'Each bar is the geometric mean return for one level of the first period; bars grow taller to the right and the solid one is the level you have entered. The step between two bars is much smaller than the step in that period itself: one period alone does not decide the average.',
        ),
        diem: d(
          'Mỗi chấm là lợi suất trung bình hình học tính ở một mức của ô Lợi suất kỳ 1 (r1), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu riêng kỳ đầu khác đi còn các kỳ kia đứng yên, không phải diễn biến thị trường. Dãy chấm đi lên gần như đều, và mỗi bước giữa hai chấm ngắn hơn hẳn bước của riêng kỳ đầu: mức trung bình trải phần lãi thêm của một kỳ ra cho mọi kỳ. Các bước còn ngắn lại rất nhẹ về bên phải, vì kỳ đầu đã lãi càng nhiều thì mỗi phần lãi thêm càng ít đổi được mức trung bình.',
          'Each dot is the geometric mean return at one level of the Return in period 1 (r1) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the first period alone, not market history. The row of dots rises almost evenly, each step between two dots much smaller than the step in the first period itself: the average spreads that extra gain across every period. The steps also shrink very slightly to the right, since the more the first period has gained, the less each extra bit moves the average.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi trên trục có một mức của ô Lợi suất kỳ 1 (r1) làm vốn cuối cùng bằng đúng vốn ban đầu, tức lãi hay lỗ của kỳ đầu vừa triệt tiêu phần lãi hay lỗ gộp lại của các kỳ còn lại; khi ô đang là 0, trục trải suốt miền của ô nên thường đi qua mức ấy. Đây là phép thử nếu riêng kỳ đầu khác đi, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 đúng ở mức ấy. Phần nằm trên vạch 0 tô xanh là cả chuỗi kỳ gộp lại vẫn sinh lời, vốn cuối cao hơn vốn đầu; phần nằm dưới tô đỏ là cả chuỗi làm mất vốn, kể cả ở những mức kỳ đầu vẫn là một kỳ lãi.',
          'This form appears when the axis holds a level of the Return in period 1 (r1) field at which the money ends exactly where it started, the first period cancelling what the other periods made or lost together; with the field at 0 the axis spans its whole range and usually passes that level. It is a what-if on the first period alone, not market history. The line rises and crosses the zero line right there. Above it the area is shaded green, the whole run ending above the starting money; below it is shaded red, the run losing money even where the first period was a gain.',
        ),
      },
      r2: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất kỳ 2 (r2). Con số mặc định của ô là một mức lỗ, nên trục chạy từ gấp rưỡi mức lỗ ấy ở bên trái đến một nửa mức lỗ ấy ở bên phải; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu riêng kỳ thứ hai khác đi thì lợi suất trung bình hình học ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên: kỳ lỗ càng nhẹ thì mức trung bình càng cao, và một kỳ lỗ kéo trung bình xuống mạnh hơn một kỳ lãi cùng cỡ kéo nó lên.',
          'The line runs left to right along the Return in period 2 (r2) field. The field’s default is a loss, so the axis runs from one and a half times that loss on the left to half of it on the right; the dashed vertical line with a dot marks your own figure. It is a what-if on the second period alone, not market history. The line rises: the lighter the losing period, the higher the average, and a losing period drags the average down harder than a winning one of the same size lifts it.',
        ),
        cot: d(
          'Mỗi cột là lợi suất trung bình hình học ứng với một mức của kỳ thứ hai, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Dãy cột cho thấy cái giá của một kỳ lỗ: bớt lỗ đi một nửa nâng mức trung bình của cả chuỗi lên thấy rõ.',
          'Each bar is the geometric mean return for one level of the second period; bars grow taller to the right and the solid one is the level you have entered. The row shows what a losing period costs: halving that loss lifts the average of the whole run visibly.',
        ),
        diem: d(
          'Mỗi chấm là lợi suất trung bình hình học tính ở một mức của ô Lợi suất kỳ 2 (r2), trải từ một nửa đến gấp rưỡi con số bạn đang nhập; khi ô là một kỳ lỗ như mặc định, chấm bên trái là mức lỗ gấp rưỡi, chấm bên phải lỗ một nửa, và chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu riêng kỳ thứ hai khác đi, không phải diễn biến thị trường. Dãy chấm đi lên, các chấm bên trái cách nhau xa hơn các chấm bên phải một chút: kỳ lỗ càng sâu thì mỗi phần lỗ thêm kéo mức trung bình xuống càng mạnh.',
          'Each dot is the geometric mean return at one level of the Return in period 2 (r2) field, spread from half to one and a half times the figure you have entered; when the field holds a loss, as it does by default, the leftmost dot is one and a half times that loss and the rightmost half of it, and the dot on the dashed vertical line is your own figure. It is a what-if on the second period alone, not market history. The row of dots rises, the dots on the left slightly further apart than those on the right: the deeper the losing period, the harder each extra bit of loss drags the average down.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi trên trục có một mức của ô Lợi suất kỳ 2 (r2) làm vốn cuối cùng bằng đúng vốn ban đầu, tức kỳ thứ hai vừa triệt tiêu phần lãi hay lỗ gộp lại của các kỳ kia, hoặc khi ô đang là 0 và trục trải suốt miền của ô. Đây là phép thử nếu riêng kỳ thứ hai khác đi, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 đúng ở mức ấy. Phần nằm trên vạch 0 tô xanh là những kết quả của kỳ thứ hai mà cả chuỗi vẫn sinh lời; phần nằm dưới tô đỏ là những kết quả kéo cả chuỗi xuống dưới vốn ban đầu.',
          'This form appears when the axis holds a level of the Return in period 2 (r2) field at which the money ends exactly where it started, the second period cancelling what the other periods made or lost together, or when the field is 0 and the axis spans its whole range. It is a what-if on the second period alone, not market history. The line rises and crosses the zero line right at that level. Above it the area is shaded green, second-period results that leave the whole run in profit; below it is shaded red, results that pull the run under the starting money.',
        ),
      },
      r3: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất kỳ 3 (r3), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu riêng kỳ cuối khác đi thì lợi suất đều mỗi kỳ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên, nhưng mức bình quân nhích lên ít hơn hẳn chính lợi suất kỳ ấy: một kỳ tốt lên chỉ kéo mức bình quân của cả chuỗi lên một phần.',
          'The line runs left to right along the Return in period 3 (r3) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the last period alone, not market history. The line rises, but the average moves up far less than that period’s own return: one better period lifts the average of the whole run only in part.',
        ),
        cot: d(
          'Mỗi cột là lợi suất trung bình hình học ứng với một mức lợi suất kỳ cuối, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Các cột chênh nhau thấy rõ, nhưng quãng chênh ấy nhỏ hơn hẳn quãng đổi của riêng kỳ cuối: mức bình quân của nhiều kỳ chỉ nhận một phần cú đổi của một kỳ.',
          'Each bar is the geometric mean return for one level of the last period’s return; bars grow taller to the right and the solid one is the level you have entered. The bars do differ visibly, yet far less than the last period’s own return changes: an average over several periods takes on only part of one period’s move.',
        ),
        diem: d(
          'Mỗi chấm là lợi suất trung bình hình học tính ở một mức của ô Lợi suất kỳ 3 (r3), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu riêng kỳ thứ ba khác đi, không phải diễn biến thị trường. Dãy chấm đi lên, nhưng cả dãy chỉ leo một quãng ngắn hơn hẳn quãng đổi của chính kỳ thứ ba, và mỗi bước leo hơi ngắn lại về bên phải: muốn mức bình quân nhích thêm một bước, kỳ thứ ba phải lãi thêm nhiều bước, và càng sang phải càng phải nhiều hơn.',
          'Each dot is the geometric mean return at one level of the Return in period 3 (r3) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the third period alone, not market history. The row of dots rises, yet the whole row climbs far less than the third period’s own return changes, and each climb gets slightly shorter to the right: lifting the average by one step takes several steps of gain in the third period, and a little more of it the further right you go.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi trên trục có một mức của ô Lợi suất kỳ 3 (r3) làm vốn cuối cùng bằng đúng vốn ban đầu, thường là khi các kỳ còn lại gộp lại đang lỗ và kỳ thứ ba có chỗ gỡ lại đủ, có chỗ chưa; khi ô đang là 0, trục trải suốt miền của ô. Đây là phép thử nếu riêng kỳ thứ ba khác đi, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 đúng ở mức kỳ thứ ba vừa gỡ hoà vốn. Phần nằm trên vạch 0 tô xanh là kỳ thứ ba gỡ đủ để cả chuỗi có lãi; phần nằm dưới tô đỏ là chưa gỡ đủ, cả chuỗi vẫn hụt vốn dù kỳ ấy có thể là một kỳ lãi.',
          'This form appears when the axis holds a level of the Return in period 3 (r3) field at which the money ends exactly where it started, typically when the other periods together are at a loss; with the field at 0 the axis spans its whole range. It is a what-if on the third period alone, not market history. The line rises and crosses the zero line where the third period just brings the run back to break even. Above it the area is shaded green, a third period that recovers enough for the run to profit; below it is shaded red, the run still short of its starting money even if that period gained.',
        ),
      },
    },
    // Kỳ thứ tư trở đi, do người dùng thêm — một đoạn mẫu cho mọi kỳ thêm, xem `BieuDoRieng.trucLap`.
    trucLap: {
      r: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất kỳ {n} (r{n}); vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Khi ô đã có số, trục chạy từ một nửa đến gấp rưỡi con số ấy; khi ô còn là 0, trục trải suốt miền của ô, từ mức mất trắng tới mức lãi lớn nhất ô cho nhập. Đây là phép thử nếu riêng kỳ này khác đi còn các kỳ kia đứng yên thì lợi suất trung bình hình học ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên: một kỳ tốt hơn kéo mức trung bình lên, nhưng chỉ kéo được một phần, vì nó bị chia đều cho mọi kỳ.',
          'The line runs left to right along the Return in period {n} (r{n}) field; the dashed vertical line with a dot marks your own figure. Once the field holds a number the axis runs from half to one and a half times it; while the field is still 0 the axis spans the field’s whole range, from a total loss to the largest gain the field accepts. It is a what-if on this period alone with the other periods held still, not market history. The line rises: one better period lifts the average, but only by a fraction, because it is shared out across all the periods.',
        ),
        cot: d(
          'Mỗi cột là lợi suất trung bình hình học ứng với một mức của kỳ thứ {n}, cột tô đặc là mức bạn đang nhập. Càng về bên phải kết quả càng lớn: cột mọc lên thì cao dần, còn cột đang treo dưới vạch 0 thì ngắn dần. Bước giữa hai cột nhỏ hơn hẳn bước của riêng kỳ ấy: một kỳ không quyết định được mức trung bình.',
          'Each bar is the geometric mean return for one level of period {n}, and the solid one is the level you have entered. The result grows toward the right: bars standing up grow taller, and bars hanging below the zero line get shorter. The step between two bars is much smaller than the step in that period itself: one period alone does not decide the average.',
        ),
        diem: d(
          'Mỗi chấm là lợi suất trung bình hình học tính ở một mức của ô Lợi suất kỳ {n} (r{n}); chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Kỳ vừa thêm mở ra ở 0, lúc ấy các chấm trải suốt miền của ô, từ mức mất trắng tới mức lãi lớn nhất ô cho nhập; khi ô đã có số, các chấm chạy từ một nửa đến gấp rưỡi con số ấy. Đây là phép thử nếu riêng kỳ này khác đi, không phải diễn biến thị trường. Dãy chấm đi lên. Ở miền đầy đủ, chấm ngoài cùng bên trái nằm đúng mức mất trắng của cả chuỗi, chấm kế tiếp vọt lên rất xa rồi các chấm sít dần về bên phải: một kỳ mất sạch vốn là cả chuỗi mất sạch.',
          'Each dot is the geometric mean return at one level of the Return in period {n} (r{n}) field; the dot on the dashed vertical line is your own figure. A newly added period opens at 0, where the dots span the field’s whole range, from a total loss to its largest gain; once the field holds a number they run from half to one and a half times it. It is a what-if on this period alone, not market history. The row of dots rises. Over the full range the leftmost dot is a total loss for the whole run, the next leaps far above it and the dots close up to the right: one wiped-out period wipes out the run.',
        ),
        laiLo: d(
          'Dạng này hiện ngay khi kỳ vừa thêm còn là 0: trục khi ấy trải suốt miền của ô Lợi suất kỳ {n} (r{n}), từ mức mất trắng tới mức lãi lớn nhất ô cho nhập, nên thường đi qua mức làm vốn cuối cùng bằng đúng vốn ban đầu; khi ô đã có số, trục chạy từ một nửa đến gấp rưỡi con số ấy và dạng này chỉ hiện nếu mức ấy nằm trong dải. Đây là phép thử nếu riêng kỳ này khác đi, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 đúng ở mức ấy. Phần nằm trên vạch 0 tô xanh là cả chuỗi vẫn sinh lời; phần nằm dưới tô đỏ là cả chuỗi hụt vốn ban đầu.',
          'This form appears as soon as a period is added and still reads 0: the axis then spans the whole range of the Return in period {n} (r{n}) field, from a total loss to its largest gain, so it usually passes the level where the money ends where it started. Once the field holds a number the axis runs from half to one and a half times it, and the form shows only if that level lies inside. It is a what-if on this period alone, not market history. The line rises and crosses the zero line at that level: green above it, the run still making money; red below it, the run under its starting money.',
        ),
      },
    },
  },

  'irr-nien-kim': {
    truc: {
      investment: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn bỏ ra ban đầu (P), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số vốn bỏ ra khác đi mà dòng thu mỗi kỳ và số kỳ đứng yên thì IRR ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: cùng một chuỗi tiền thu về mà phải bỏ ra càng nhiều thì suất sinh lợi càng thấp; đường xuống dưới 0 khi tổng tiền thu về không còn đủ hoàn vốn.',
          'The line runs left to right along the Initial capital invested (P) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different outlay with the payment per period and the number of periods held still, not market history. The line falls and flattens: paying more for the same stream of receipts means a lower rate of return; the line drops below 0 once the receipts no longer add up to the outlay.',
        ),
        cot: d(
          'Mỗi cột là IRR mỗi kỳ ở một mức vốn bỏ ra, cột tô đặc là mức bạn đang nhập. Cột quay xuống dưới vạch 0 ở bên phải là vùng trả giá quá cao: cộng hết các kỳ thu về vẫn chưa bằng số vốn.',
          'Each bar is the IRR per period at one outlay, and the solid one is the outlay you have entered. Bars hanging below the zero line on the right mark overpaying: all the receipts added together still fall short of the outlay.',
        ),
        diem: d(
          'Mỗi chấm là IRR mỗi kỳ tính ở một mức của ô Vốn bỏ ra ban đầu (P), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu bỏ ra nhiều hay ít vốn hơn cho cùng một chuỗi tiền thu về, không phải diễn biến thị trường. Dãy chấm đi xuống, các chấm bên trái cách nhau xa hơn hẳn các chấm bên phải: khi vốn còn nhỏ so với tổng tiền thu về, bớt hay thêm một chút vốn làm suất sinh lợi đổi rất mạnh, còn khi vốn đã gần bằng tổng tiền thu về thì mỗi bước vốn chỉ làm nó nhích ít.',
          'Each dot is the IRR per period at one level of the Initial capital invested (P) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on paying more or less for the same stream of receipts, not market history. The row of dots falls, the dots on the left much further apart than those on the right: while the outlay is small next to the total receipts, a little more or less capital swings the rate of return hard, whereas once the outlay nears the total receipts each step of capital moves it only slightly.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi tổng tiền thu về, tức dòng thu mỗi kỳ nhân số kỳ, nằm trong dải của ô Vốn bỏ ra ban đầu (P) trên trục. Đây là phép thử nếu bỏ vốn nhiều hay ít hơn cho cùng dòng thu, không phải diễn biến thị trường. Đường đi xuống và cắt vạch 0 đúng ở mức vốn bằng tổng tiền thu về. Phần bên trái, nằm trên vạch 0, tô xanh là vốn đủ nhỏ để các khoản thu vừa hoàn vốn vừa sinh lời; phần bên phải, nằm dưới vạch 0, tô đỏ là trả giá quá cao, cộng hết các kỳ thu vẫn không về đủ vốn.',
          'This form appears when the total receipts, the payment per period times the number of periods, lie inside the range of the Initial capital invested (P) field on the axis. It is a what-if on paying more or less for the same receipts, not market history. The line falls and crosses the zero line exactly where the outlay equals the total receipts. The left part, above the zero line, is shaded green: an outlay small enough for the receipts to pay it back with a gain; the right part, below the zero line, is shaded red: overpaying, where all the receipts added up still come short of the outlay.',
        ),
      },
      payment: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Dòng thu đều mỗi kỳ (C), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu khoản thu mỗi kỳ khác đi mà vốn bỏ ra và số kỳ đứng yên thì IRR ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên: mỗi kỳ thu về càng nhiều thì suất sinh lợi càng cao; ở đầu bên trái đường nằm dưới 0 vì khoản thu nhỏ quá, cộng hết các kỳ vẫn chưa hoàn vốn.',
          'The line runs left to right along the Equal payment received per period (C) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on a different payment per period with the outlay and the number of periods held still, not market history. The line rises: the more each period pays, the higher the rate of return; at the far left it sits below 0 because the payment is too small for all the periods together to return the outlay.',
        ),
        cot: d(
          'Mỗi cột là IRR mỗi kỳ ở một mức dòng thu, cột tô đặc là mức bạn đang nhập. Cột quay xuống dưới vạch 0 ở bên trái là lỗ; chỗ cột đổi sang mọc lên trên vạch 0 là mức thu vừa đủ hoàn vốn, chưa sinh lời đồng nào.',
          'Each bar is the IRR per period at one payment level, and the solid one is the level you have entered. Bars below the zero line on the left are losses; where they flip to stand above the zero line is the payment that just returns the outlay, with no gain at all.',
        ),
        diem: d(
          'Mỗi chấm là IRR mỗi kỳ tính ở một mức của ô Dòng thu đều mỗi kỳ (C), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu mỗi kỳ thu về nhiều hay ít hơn mà vốn và số kỳ đứng yên, không phải diễn biến thị trường. Dãy chấm đi lên, mỗi chấm nhích hơn chấm trước một đoạn hơi ngắn dần về bên phải: lúc khoản thu còn chưa hoàn nổi vốn, mỗi phần thu thêm kéo suất sinh lợi lên nhanh nhất, rồi dịu dần khi khoản đầu tư đã có lãi.',
          'Each dot is the IRR per period at one level of the Equal payment received per period (C) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on receiving more or less each period with the outlay and the number of periods held still, not market history. The row of dots rises, each dot a little closer to the one before as you move right: while the payments cannot yet return the outlay, every extra bit received lifts the rate fastest, and the lift eases once the investment is in profit.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi trên trục có mức thu mà cộng hết các kỳ vừa bằng số vốn, tức ô Dòng thu đều mỗi kỳ (C) trên trục có chỗ chưa hoàn nổi vốn, có chỗ dư. Đây là phép thử nếu mỗi kỳ thu về nhiều hay ít hơn, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 đúng ở mức thu ấy. Phần bên trái, nằm dưới vạch 0, tô đỏ là khoản thu quá nhỏ, cộng hết các kỳ vẫn chưa đủ vốn; phần bên phải, nằm trên vạch 0, tô xanh là khoản thu đủ để vừa hoàn vốn vừa sinh lời.',
          'This form appears when the axis holds the payment at which all the periods together exactly return the outlay, so the Equal payment received per period (C) field on the axis comes up short in one part and pays the capital back in another. It is a what-if on receiving more or less each period, not market history. The line rises and crosses the zero line at that very payment. The left part, below the zero line, is shaded red: payments too small to return the outlay; the right part, above it, is shaded green: payments that return the capital and earn on top.',
        ),
      },
      periods: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số kỳ nhận tiền (n), từ khoảng một nửa đến gấp rưỡi con số bạn đang nhập, mỗi điểm là một số kỳ tròn; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu nhận tiền thêm hay bớt vài kỳ thì IRR ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: nhận càng nhiều kỳ thì càng lãi, và mấy kỳ đầu quyết định nhiều nhất vì chúng đưa tổng tiền thu về vượt qua số vốn đã bỏ ra.',
          'The line runs left to right along the Number of periods receiving payments (n) field, from about half to one and a half times the figure you have entered, one whole period per point; the dashed vertical line with a dot marks your own figure. It is a what-if on receiving a few more or fewer payments, not market history. The line rises but flattens: more payments mean more profit, and the early ones matter most because they carry total receipts past the money you put in.',
        ),
        cot: d(
          'Mỗi cột là IRR ứng với một số kỳ nhận tiền, cột tô đặc là số kỳ bạn đang nhập. Cột quay xuống dưới vạch 0 là số kỳ chưa đủ để thu hồi vốn; chỗ cột đổi sang mọc lên trên vạch 0 là số kỳ vừa hoàn vốn.',
          'Each bar is the IRR for one number of payments, and the solid one is the count you have entered. A bar hanging below the zero line is too few payments to recover the outlay; where bars switch to standing above the zero line, the outlay has just been recovered.',
        ),
        diem: d(
          'Mỗi chấm là IRR ứng với một số kỳ tròn trong ô Số kỳ nhận tiền (n), từ khoảng một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số kỳ bạn nhập. Đây là phép thử nếu nhận tiền thêm hay bớt vài kỳ, không phải diễn biến thị trường. Dãy chấm đi lên, nhưng mỗi chấm nhích hơn chấm trước một đoạn ngắn dần: mấy kỳ đầu kéo tổng tiền thu về vượt qua số vốn nên đổi IRR nhiều nhất, còn những kỳ thu rất xa về sau, quy về hôm nay, góp ít hơn hẳn.',
          'Each dot is the IRR for one whole number of payments in the Number of periods receiving payments (n) field, from about half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own count. It is a what-if on receiving a few more or fewer payments, not market history. The row of dots rises, but each dot climbs less above the last one: the early payments carry the total past the outlay and move the IRR most, while payments far in the future, discounted back to today, add much less.',
        ),
        bac: d(
          'Mỗi bậc là IRR ứng với một số kỳ trong ô Số kỳ nhận tiền (n), từ khoảng một nửa đến gấp rưỡi con số bạn đang nhập: bậc giữ nằm ngang suốt số kỳ ấy rồi mới nhảy sang số kỳ kế tiếp, vì mỗi kỳ là một lần nhận tiền trọn vẹn, phép tính làm tròn số kỳ và không có nửa lần nhận. Đây là phép thử nếu nhận tiền thêm hay bớt vài kỳ, không phải diễn biến thị trường. Bậc thang đi lên, bậc nhảy cao nhất ở bên trái rồi thấp dần về bên phải: khoản thu ở kỳ càng xa, quy về hôm nay càng nhỏ, nên thêm một kỳ ở cuối nâng IRR ít hơn kỳ trước.',
          'Each step is the IRR for one number of payments in the Number of periods receiving payments (n) field, from about half to one and a half times the figure you have entered: a step stays level through that count and then jumps, because each period is one whole payment and the formula rounds the count. It is a what-if on receiving a few more or fewer payments, not market history. The staircase rises, its tallest jumps on the left: a payment further away is worth less today, so each period added at the end lifts the IRR less than the one before.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi trên trục có cả số kỳ chưa đủ để thu hồi vốn lẫn số kỳ đã dư, tức ô Số kỳ nhận tiền (n) đi qua quanh mức mà cộng hết các khoản thu vừa bằng số vốn. Đây là phép thử nếu nhận tiền thêm hay bớt vài kỳ, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 quanh số kỳ thu vừa đủ hoàn vốn. Phần bên trái, nằm dưới vạch 0, tô đỏ là nhận quá ít kỳ, khoản đầu tư còn lỗ; phần bên phải, nằm trên vạch 0, tô xanh là đã thu hồi đủ vốn và mỗi kỳ thêm là thêm lãi.',
          'This form appears when the axis holds both counts too short to recover the outlay and counts that exceed it, so the Number of periods receiving payments (n) field on the axis passes around the count at which the payments add up to the capital. It is a what-if on receiving a few more or fewer payments, not market history. The line rises and crosses the zero line around that count. The left part, below the zero line, is shaded red: too few payments, still at a loss; the right part, above it, is shaded green: the capital recovered, each further payment adding to the gain.',
        ),
      },
    },
  },

  'thoi-gian-nhan-doi': {
    truc: {
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi suất kép / năm (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lợi suất mỗi năm đổi thì mất bao lâu để vốn gấp đôi, không phải diễn biến thị trường. Đường đi xuống và thoải dần: lợi suất càng cao thì chờ càng ngắn, nhưng một điểm lợi suất thêm vào ở mức thấp rút ngắn được nhiều năm hơn hẳn một điểm thêm vào ở mức cao.',
          'The line runs left to right along the Compound return / year (r) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the yearly return, not market history. The line falls and flattens: a higher return means a shorter wait, but one extra point at a low return saves far more years than one extra point at a high return.',
        ),
        cot: d(
          'Mỗi cột là số năm để vốn gấp đôi ở một mức lợi suất, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột thấp là tốt ở biểu đồ này: nó là thời gian phải chờ.',
          'Each bar is the years needed to double the money at one rate of return; bars shrink to the right and the solid one is the level you have entered. A short bar is the good one on this chart: it is time spent waiting.',
        ),
        diem: d(
          'Mỗi chấm là số năm để vốn gấp đôi tính ở một mức của ô Lợi suất kép / năm (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lợi suất mỗi năm cao hay thấp hơn thì phải chờ bao lâu, không phải diễn biến thị trường. Dãy chấm đi xuống, các chấm bên trái cách nhau xa hơn hẳn các chấm bên phải. Khoảng cách dọc giữa hai chấm kề nhau là số năm chờ mà một bước lợi suất thêm vào bớt được: ở lợi suất thấp nó dài, ở lợi suất cao nó chỉ còn ngắn.',
          'Each dot is the number of years needed to double the money at one level of the Compound return / year (r) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on how long you wait at a higher or lower yearly return, not market history. The row of dots falls, the dots on the left much further apart than those on the right. The vertical gap between two neighboring dots is the waiting time one extra step of return saves: long at a low return, short at a high one.',
        ),
      },
    },
  },

  'loi-suat-quy-nam-theo-ngay': {
    truc: {
      buyPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá mua (Pmua), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu ngày ấy bạn mua ở một giá khác mà giá bán và số ngày đứng yên thì lợi suất quy năm ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống rất dốc ở đầu bên trái rồi thoải dần: phép quy năm nhân mức lãi của một quãng ngắn lên nhiều lần, nên chênh lệch nhỏ ở giá mua bị phóng thành chênh lệch rất lớn; đường xuống dưới 0 khi giá mua vượt giá bán.',
          'The line runs left to right along the Buy price (Pbuy) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on having bought at a different price with the sell price and the number of days held still, not market history. The line falls very steeply on the left and then flattens: annualizing multiplies the gain of a short stretch many times over, so a small difference in the buy price is blown up into a very large one; the line drops below 0 once the buy price exceeds the sell price.',
        ),
        cot: d(
          'Mỗi cột là lợi suất quy năm ở một mức giá mua, cột tô đặc là mức giá bạn đang nhập. Cột mọc lên trên vạch 0 là lãi, cột quay xuống dưới vạch 0 là lỗ; vài cột ngoài cùng bên trái cao áp đảo, nên các cột quanh mức đang nhập trông thấp hẳn dù vẫn là lợi suất cao.',
          'Each bar is the annualized return at one buy price, and the solid one is the price you have entered. Bars above the zero line are gains, bars below the zero line are losses; the few bars at the far left dwarf the rest, so the ones around your own price look short even when they are high returns.',
        ),
        diem: d(
          'Mỗi chấm là lợi suất quy năm tính ở một mức của ô Giá mua (Pmua), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức giá bạn nhập. Đây là phép thử nếu ngày ấy bạn mua ở giá khác mà giá bán và số ngày đứng yên, không phải diễn biến thị trường. Dãy chấm đi xuống, mấy chấm ngoài cùng bên trái cách nhau rất xa rồi sít dần về bên phải: phép quy năm nâng tỷ số giá bán trên giá mua lên luỹ thừa, nên mua càng rẻ thì mỗi bước giá mua thấp hơn càng thổi con số cả năm lên mạnh.',
          'Each dot is the annualized return at one level of the Buy price (Pbuy) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on having bought at a different price with the sell price and the days held still, not market history. The row of dots falls, the few dots at the far left very far apart and the rest closing up toward the right: annualizing raises the ratio of sell price to buy price to a power, so the cheaper the buy, the harder each lower step in price blows up the yearly figure.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi giá bán nằm trong dải của trục, tức ô Giá mua (Pmua) trên trục có chỗ thấp hơn giá bán, có chỗ cao hơn. Đây là phép thử nếu ngày ấy bạn mua ở giá khác, không phải diễn biến thị trường. Đường đi xuống và cắt vạch 0 đúng ở giá mua bằng giá bán. Phần bên trái, nằm trên vạch 0, tô xanh là mua rẻ hơn giá bán, lệnh có lãi; phần bên phải, nằm dưới vạch 0, tô đỏ là mua đắt hơn giá bán, lệnh lỗ. Phía đỏ không bao giờ sâu quá mức mất trắng, còn phía xanh thì không có trần.',
          'This form appears when the sell price lies inside the range drawn, so the Buy price (Pbuy) field on the axis is below the sell price in one part and above it in another. It is a what-if on having bought at a different price, not market history. The line falls and crosses the zero line exactly where the buy price equals the sell price. The left part, above the zero line, is shaded green: bought below the sell price, a winning trade; the right part, below it, is shaded red: bought above it, a losing one. The red side never sinks past a total loss; the green side has no ceiling.',
        ),
      },
      sellPrice: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá bán (Pban), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu bán ở giá khác thì lợi suất quy ra cả năm là bao nhiêu, không phải diễn biến thị trường. Đường đi lên, và khi số ngày nắm giữ ngắn hơn một năm thì càng lúc càng dốc: mức lãi của một lần mua bán ngắn ngày bị nhân lặp lại cho cả năm, nên chênh lệch giá nhỏ cũng thổi thành con số rất lớn ở bên phải. Giữ lâu hơn một năm thì ngược lại, đường thoải dần.',
          'The line runs left to right along the Sell price (Psell) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on the yearly equivalent of selling at another price, not market history. The line rises, and with a holding period shorter than a year it keeps steepening: the gain of one short trade is compounded across a whole year, so even a small price gap is blown up into a very large figure on the right. Held for longer than a year it does the opposite and levels off.',
        ),
        cot: d(
          'Mỗi cột là lợi suất quy năm ở một mức giá bán, cột tô đặc là mức bạn đang nhập. Cột quay xuống dưới vạch 0 là bán dưới giá mua; cột bên phải cao vọt là kết quả của phép quy năm chứ không phải mức lãi bạn sẽ thật sự lặp lại được.',
          'Each bar is the annualized return at one selling price, and the solid one is the price you have entered. A bar hanging below the zero line means selling under the buy price; the towering bars on the right come from the annualizing itself, not from a gain you could really repeat.',
        ),
        diem: d(
          'Mỗi chấm là lợi suất quy năm tính ở một mức của ô Giá bán (Pban), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu bán ở giá khác mà giá mua và số ngày đứng yên, không phải diễn biến thị trường. Dãy chấm đi lên; khi số ngày nắm giữ ngắn hơn một năm, các chấm bên phải cách nhau xa dần, vì mức lãi của một lần mua bán ngắn bị ghép lặp lại cho đủ năm. Giữ lâu hơn một năm thì ngược lại, các chấm sít dần về bên phải; giữ đúng một năm thì chúng cách đều.',
          'Each dot is the annualized return at one level of the Sell price (Psell) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on selling at another price with the buy price and days held still, not market history. The row of dots rises; with a holding shorter than a year the dots on the right spread further apart, because the gain of one short trade is compounded again and again to fill the year. Held longer than a year, the dots close up toward the right; held exactly a year, they are evenly spaced.',
        ),
        laiLo: d(
          'Dạng biểu đồ này hiện khi giá mua nằm trong dải của trục, tức ô Giá bán (Pban) trên trục có chỗ thấp hơn giá mua, có chỗ cao hơn. Đây là phép thử nếu bán ở giá khác, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 đúng ở giá bán bằng giá mua. Phần bên trái, nằm dưới vạch 0, tô đỏ là bán thấp hơn giá mua, lệnh lỗ; phần bên phải, nằm trên vạch 0, tô xanh là bán cao hơn giá mua, lệnh lãi. Khi giữ ít ngày, phần đỏ dồn sát mức mất trắng: một khoản lỗ nhỏ lặp lại cho đủ năm là gần mất hết.',
          'This form appears when the buy price lies inside the range drawn, so the Sell price (Psell) field on the axis is below the buy price in one part and above it in another. It is a what-if on selling at another price, not market history. The line rises and crosses the zero line exactly where the sell price equals the buy price. The left part, below the zero line, is shaded red: selling under the buy price, a losing trade; the right part, above it, is shaded green: a winning one. A short holding sends the red part racing toward a total loss, the small loss repeated many times over the year.',
        ),
      },
      days: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số ngày nắm giữ (d), từ một nửa đến gấp rưỡi số ngày bạn đang nhập; vạch đứt dọc có chấm tròn là đúng số ngày bạn nhập. Đây là phép thử nếu cùng mức lãi ấy đạt được trong nhiều hay ít ngày hơn thì lợi suất quy năm ra bao nhiêu, không phải diễn biến thị trường. Khi thương vụ có lãi, đường đi xuống và thoải dần: cùng một mức lãi mà mất càng nhiều ngày thì quy ra cả năm càng thấp. Thương vụ đang lỗ thì đường đi lên: giữ càng lâu mức lỗ quy năm càng nhẹ.',
          'The line runs left to right along the Days held (d) field, from half to one and a half times the number of days you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on earning the same gain in more or fewer days, not market history. For a trade in profit the line falls and flattens: the same gain taking more days works out to less per year. For a losing trade the line rises: the longer it is held, the milder the annualized loss.',
        ),
        cot: d(
          'Mỗi cột là lợi suất quy năm ứng với một số ngày nắm giữ, cột tô đặc là số ngày bạn đang nhập. Khi thương vụ có lãi, cột thấp dần về bên phải, và các cột bên trái cao vọt là cái bẫy của phép quy năm: lãi nhanh trong vài tuần không có nghĩa sẽ lặp lại được suốt năm. Thương vụ đang lỗ thì cột quay xuống dưới và ngắn dần.',
          'Each bar is the annualized return for one number of days held, and the solid one is the number you have entered. For a trade in profit the bars shrink to the right, and the towering bars on the left are the trap of annualizing: a quick gain in a few weeks does not mean it can be repeated all year. For a losing trade the bars hang down and get shorter.',
        ),
        diem: d(
          'Mỗi chấm là lợi suất quy năm tính ở một mức của ô Số ngày nắm giữ (d), từ một nửa đến gấp rưỡi số ngày bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số ngày bạn nhập. Đây là phép thử nếu cùng mức lãi hay lỗ ấy đạt trong nhiều hay ít ngày hơn, không phải diễn biến thị trường. Khi thương vụ có lãi, dãy chấm đi xuống, dốc bên trái rồi thoải dần; thương vụ đang lỗ thì dãy chấm đi lên, vì khoản lỗ trải ra càng nhiều ngày thì quy năm càng nhẹ. Phép tính đếm số ngày tròn, nên khi dải rộng mỗi chấm lấy số ngày tròn gần nó nhất và bước giữa các chấm hơi so le.',
          'Each dot is the annualized return at one level of the Days held (d) field, from half to one and a half times the number of days you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on making the same gain or loss over more or fewer days, not market history. For a trade in profit the row of dots falls, steep on the left and then leveling off; for a losing trade it rises, a loss spread over more days weighing less per year. The formula counts whole days, so over a wide range each dot takes the nearest whole day and the steps come out slightly uneven.',
        ),
        bac: d(
          'Mỗi bậc là lợi suất quy năm ứng với một số ngày tròn trong ô Số ngày nắm giữ (d), từ một nửa đến gấp rưỡi số ngày bạn đang nhập. Dạng này chỉ có khi số ngày đủ ít để các mức trên trục cách nhau đúng một ngày; bậc giữ nằm ngang suốt ngày ấy rồi mới nhảy sang ngày sau, vì phép tính đếm số ngày tròn. Đây là phép thử nếu cùng mức lãi lỗ ấy đạt nhanh hay chậm hơn, không phải diễn biến thị trường. Khi thương vụ có lãi, bậc thang đi xuống, hạ sâu nhất ở bên trái, nơi ít ngày nhất, vì quy năm khoản lãi vài ngày cho con số rất lớn; thương vụ đang lỗ thì bậc thang đi lên, mỗi bậc nhích một chút.',
          'Each step is the annualized return for one whole number of days in the Days held (d) field, from half to one and a half times the days you have entered. It appears only when the days are few enough for the levels to sit one day apart; a step stays level through that day and then jumps, because the formula counts whole days. It is a what-if on the same gain or loss over more or fewer days, not market history. For a trade in profit the staircase falls, dropping deepest on the left, where so few days make annualizing give huge figures; for a losing trade it rises, each step a little higher.',
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
      diem: d(
        'Mỗi chấm là lợi suất quy năm của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: chấm tính như thể bạn bán ở giá đóng cửa phiên ấy, còn giá mua và số ngày nắm giữ vẫn là con số bạn nhập. Hình đi theo đúng chuỗi giá bạn đã nạp. Dãy chấm đi lên là giá đóng cửa đang tăng, lệnh của bạn lãi thêm hoặc bớt lỗ; đi xuống là ngược lại. Khi số ngày nắm giữ ngắn hơn một năm, phép quy năm làm các chấm nảy mạnh hơn chính giá, nên một chấm tách hẳn khỏi các chấm quanh nó là phiên giá đổi mạnh.',
        'Each dot is the annualized return of one session, from the oldest session on the left to the most recent session on the right, worked out as if you sold at that session’s close with your buy price and holding days as entered. The chart follows the price series you loaded. When the row of dots rises the close is climbing, your trade gaining more or losing less; when it falls the opposite is happening. With a holding shorter than a year, annualizing makes the dots jump harder than the price, so a dot standing apart from its neighbors is a session where the price moved sharply.',
      ),
      bac: d(
        'Mỗi bậc là lợi suất quy năm của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nằm ngang suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào. Giá mua và số ngày nắm giữ vẫn là con số bạn nhập, nên các bậc theo đúng giá đóng cửa trong chuỗi bạn đã nạp. Bậc thang đi lên là giá đang tăng so với giá mua, đi xuống là đang giảm; bậc nhảy cao là phiên giá đổi mạnh, và khi giữ chưa tới một năm, phép quy năm phóng to mỗi bậc nhảy so với mức đổi của giá.',
        'Each step is the annualized return of one session, from the oldest session on the left to the most recent session on the right: the step stays level through that session and then jumps, because there is no closing price between two sessions. Your buy price and holding days stay as entered, so the steps follow the closes in the series you loaded. When the staircase rises the price is climbing against your buy price; when it falls it is slipping. A tall jump is a session where the price moved sharply, and with a holding under a year annualizing magnifies each jump.',
      ),
      laiLo: d(
        'Dạng biểu đồ này hiện khi chuỗi đã nạp có cả phiên đóng cửa trên lẫn dưới giá mua của bạn. Mỗi điểm là lợi suất quy năm nếu bạn bán ở giá đóng cửa của một phiên, đi từ phiên cũ nhất nằm bên trái tới phiên gần nhất nằm bên phải, còn giá mua và số ngày nắm giữ vẫn là con số bạn nhập. Phần đường nằm trên vạch 0 tô xanh là những phiên giá cao hơn giá mua, bán ra là lãi; phần nằm dưới vạch 0 tô đỏ là những phiên giá thấp hơn giá mua, bán ra là lỗ. Chỗ đường cắt vạch 0 là lúc giá đóng cửa vượt lên hay tụt xuống qua giá mua. Đường đi lên là giá đang tăng, đi xuống là đang giảm.',
        'This form appears when the loaded series has sessions closing both above and below your buy price. Each point is the annualized return of selling at one session’s close, from the oldest session on the left to the most recent session on the right. The part above the zero line is shaded green, sessions priced over your buy price where selling meant a gain; the part below is shaded red, sessions priced under it where selling meant a loss. Where the line crosses the zero line, the close passes through your buy price. When the line rises the price is climbing; when it falls it is slipping.',
      ),
    },
  },
};
