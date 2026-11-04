import type { BieuDoRieng } from '../types';
import { d } from './tao';

/** Nhóm định giá (`valuation`) — 20 công thức. */
export const BIEU_DO_DINH_GIA: Readonly<Record<string, BieuDoRieng>> = {
  ps: {
    truc: {
      price: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá thị trường (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu giá đổi thì P/S ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: doanh thu trên mỗi cổ phiếu giữ nguyên, giá càng cao thì bạn trả càng nhiều cho mỗi đồng doanh thu.',
          'The line runs left to right along the Market price (P) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on price, not market history. The line rises steadily: with sales per share held still, a higher price means paying more for each unit of revenue.',
        ),
        cot: d(
          'Mỗi cột là P/S ở một mức giá, cột cao dần về bên phải và cột tô đặc là mức giá bạn đang nhập. Cột cao gấp đôi là trả gấp đôi cho cùng một đồng doanh thu, dù doanh thu ấy có biến thành lãi hay không.',
          'Each bar is the P/S at one price level; bars grow taller to the right and the solid one is the price you have entered. A bar twice as tall means paying twice as much for the same unit of revenue, whether or not that revenue ever turns into profit.',
        ),
        diem: d(
          'Mỗi chấm là P/S tính ở một mức của ô Giá thị trường (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu giá đổi thì P/S ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, chấm sau cao hơn chấm trước cùng một khoảng: doanh thu mỗi cổ phiếu đứng yên, nên P/S chỉ là giá chia cho một con số cố định. Giữa hai chấm không có mức giá nào được tính.',
          'Each dot is the P/S at one level of the Market price (P) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on price, not market history. The row of dots rises in a straight line, each dot higher than the last by the same amount: with revenue per share held still, P/S is just the price divided by a fixed figure. No price level between two dots is computed.',
        ),
      },
      salesPerShare: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Doanh thu trên mỗi cổ phiếu (Sps), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu doanh thu mỗi cổ phiếu đổi mà giá đứng yên thì P/S ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: doanh thu đứng sau mỗi cổ phiếu càng lớn thì cùng mức giá ấy càng rẻ so với sức bán hàng của doanh nghiệp.',
          'The line runs left to right along the Revenue per share (Sps) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on revenue per share with the price held still, not market history. The line falls and flattens: the more revenue stands behind each share, the cheaper that same price is relative to what the company sells.',
        ),
        cot: d(
          'Mỗi cột là P/S ở một mức doanh thu mỗi cổ phiếu, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. P/S không nhìn tới lợi nhuận: hai cột bằng nhau vẫn có thể là một doanh nghiệp lãi dày và một doanh nghiệp đang lỗ.',
          'Each bar is the P/S at one level of revenue per share; bars shrink to the right and the solid one is the level you have entered. P/S ignores profit: two equal bars can still be one company with fat margins and one that is losing money.',
        ),
        diem: d(
          'Mỗi chấm là P/S tính ở một mức của ô Doanh thu trên mỗi cổ phiếu (Sps), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu doanh thu mỗi cổ phiếu đổi mà giá đứng yên thì P/S ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, bên trái mỗi chấm hụt so với chấm trước một khoảng dài, sang phải các khoảng ấy ngắn dần: doanh thu đã lớn thì thêm một phần nữa chỉ làm cùng mức giá rẻ đi chút ít so với sức bán hàng.',
          'Each dot is the P/S at one level of the Revenue per share (Sps) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on revenue per share with the price held still, not market history. The row of dots falls, with long drops from one dot to the next on the left that shorten toward the right: once revenue is large, a little more of it makes the same price only slightly cheaper against what the company sells.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là P/S tính với giá đóng cửa của phiên đó, còn doanh thu trên mỗi cổ phiếu vẫn là con số bạn nhập. Hình này đi theo đúng chuỗi giá bạn đã nạp, không còn là phép thử. Đường đi lên là giá đang cao dần so với doanh thu của doanh nghiệp, đi xuống là mức định giá ấy đang hạ.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the P/S at that session’s closing price, with sales per share kept at the figure you entered. It follows the price series you loaded and is no longer a what-if. When it rises the price is climbing against the company’s revenue; when it falls that valuation is coming down.',
      ),
      cot: d(
        'Mỗi cột là P/S của một phiên, cột cuối bên phải là phiên gần nhất. So cột cuối với phần còn lại của dãy để biết giá phiên gần nhất đang đắt hay rẻ so với chính quãng bạn đã nạp.',
        'Each bar is the P/S of one session, the last one on the right being the latest. Compare the last bar with the rest of the row to see whether the latest price is dear or cheap against the stretch you loaded.',
      ),
      diem: d(
        'Mỗi chấm là P/S của một phiên trong chuỗi bạn đã nạp, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; P/S tính với giá đóng cửa của phiên ấy, còn doanh thu trên mỗi cổ phiếu vẫn là con số bạn nhập. Dãy chấm đi lên là giá đang cao dần so với doanh thu của doanh nghiệp, đi xuống là mức định giá ấy đang hạ. Vì doanh thu đứng yên, dãy chấm có đúng dáng của giá đóng cửa, chỉ khác thang số ở trục dọc.',
        'Each dot is the P/S of one session in the series you loaded, running from the oldest session on the left to the most recent session on the right; it uses that session’s closing price, with revenue per share kept at the figure you entered. When the row of dots rises the price is climbing against the company’s revenue; when it falls that valuation is coming down. Because the revenue figure stays fixed, the dots trace exactly the shape of the closing prices, only on a different vertical scale.',
      ),
      bac: d(
        'Mỗi bậc là P/S của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc giữ nằm ngang suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào để tính. Doanh thu trên mỗi cổ phiếu vẫn là con số bạn nhập, nên mỗi bước nhảy cao hay thấp tỉ lệ đúng với số đồng giá đổi trong phiên. Bậc đi lên là giá đang cao dần so với doanh thu, đi xuống là mức định giá ấy đang hạ.',
        'Each step is the P/S of one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and only then jumps to the next session’s value, since there is no closing price between two sessions. Revenue per share stays at the figure you entered, so the height of each jump is in exact proportion to how far the price moved that session. When the staircase rises the price is climbing against revenue; when it falls the valuation is coming down.',
      ),
    },
  },

  ev: {
    truc: {
      marketCap: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn hoá thị trường, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu vốn hoá đổi mà nợ vay và tiền mặt đứng yên thì EV ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: vốn hoá thêm một đồng thì EV thêm đúng một đồng, vì người mua trọn doanh nghiệp phải trả đủ cho cổ đông.',
          'The line runs left to right along the Market capitalization field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on market cap with debt and cash held still, not market history. The line rises steadily: one more unit of market cap adds exactly one unit of EV, because a buyer of the whole company has to pay shareholders in full.',
        ),
        cot: d(
          'Mỗi cột là EV ở một mức vốn hoá, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột nào cũng cách chính mức vốn hoá của nó một khoảng không đổi, bằng nợ vay trừ tiền mặt.',
          'Each bar is EV at one level of market cap; bars grow taller to the right and the solid one is the level you have entered. Every bar differs from its own market cap by the same fixed amount, debt minus cash.',
        ),
        diem: d(
          'Mỗi chấm là EV tính ở một mức của ô Vốn hoá thị trường, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu vốn hoá đổi mà nợ vay và tiền mặt đứng yên thì EV ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, chấm sau cao hơn chấm trước đúng bằng bước vốn hoá giữa hai chấm: nợ vay trừ tiền mặt chỉ là một khoản cộng thêm cố định, không đổi theo vốn hoá.',
          'Each dot is EV at one level of the Market capitalization field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on market cap with debt and cash held still, not market history. The row of dots rises in a straight line, each dot higher than the last by exactly the step in market cap between them: debt minus cash is only a fixed amount added on top, whatever the market cap.',
        ),
        laiLo: d(
          'Dạng này chỉ hiện khi tiền mặt vượt nợ vay một khoản nằm trong dải của ô Vốn hoá thị trường đang vẽ, tức một doanh nghiệp ôm rất nhiều tiền. Phần đường trên vạch 0 tô xanh là EV dương: người mua trọn doanh nghiệp vẫn phải bỏ tiền ra; phần dưới vạch 0 tô đỏ là EV âm: tiền trong két nhiều hơn cả vốn hoá lẫn nợ vay. Hai màu chỉ nói dấu của EV, không nói lãi hay lỗ. Đây là phép thử nếu vốn hoá đổi thì EV ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều và cắt vạch 0 ở mức vốn hoá bằng đúng tiền mặt trừ nợ vay.',
          'This form appears only when cash exceeds debt by an amount that lies inside the range of the Market capitalization field being drawn, in other words a company sitting on a lot of cash. Above the zero line the area is shaded green, a positive EV where a buyer still pays out; below it is shaded red, a negative EV where the cash in the vault exceeds market cap and debt combined. The colors show the sign of EV, not profit or loss. It is a what-if on market cap, not market history. The line rises steadily and crosses the zero line where market cap equals cash minus debt.',
        ),
      },
      totalDebt: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Nợ vay, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu nợ vay đổi mà vốn hoá và tiền mặt đứng yên thì EV ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: mỗi đồng nợ là một đồng người mua trọn doanh nghiệp phải gánh thay, nên nợ càng nhiều thì cái giá thật để thâu tóm càng cao.',
          'The line runs left to right along the Debt field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on debt with market cap and cash held still, not market history. The line rises steadily: every unit of debt is a unit the buyer of the whole company takes over, so more debt means a higher real price for the takeover.',
        ),
        cot: d(
          'Mỗi cột là EV ở một mức nợ vay, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Hai doanh nghiệp cùng vốn hoá có thể đứng ở hai cột rất khác nhau: cột cao hơn là doanh nghiệp vay nhiều hơn.',
          'Each bar is EV at one debt level; bars grow taller to the right and the solid one is the level you have entered. Two companies with the same market cap can stand on very different bars: the taller one is the heavier borrower.',
        ),
        diem: d(
          'Mỗi chấm là EV tính ở một mức của ô Nợ vay, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu nợ vay đổi mà vốn hoá và tiền mặt đứng yên thì EV ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, các chấm cách nhau những bước bằng nhau: mỗi đồng nợ người mua phải gánh thay cộng thẳng một đồng vào cái giá thâu tóm, dù doanh nghiệp đang nợ ít hay đã nợ chồng chất.',
          'Each dot is EV at one level of the Debt field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on debt with market cap and cash held still, not market history. The row of dots rises in equal steps: every unit of debt the buyer takes over adds one unit straight onto the takeover price, whether the company owes little or a great deal.',
        ),
        laiLo: d(
          'Dạng này chỉ hiện khi tiền mặt lớn hơn vốn hoá, và phần lớn hơn ấy nằm trong dải của ô Nợ vay đang vẽ. Phần đường trên vạch 0 tô xanh là EV dương: cộng cả nợ vay vào, giá mua trọn doanh nghiệp vẫn lớn hơn số tiền nó đang giữ; phần dưới vạch 0 tô đỏ là EV âm: nợ ít tới mức tiền trong két trả hết nợ rồi vẫn còn dư hơn cả vốn hoá. Màu ở đây chỉ nói dấu của EV. Đây là phép thử nếu nợ vay đổi thì EV ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều và cắt vạch 0 ở mức nợ vay bằng tiền mặt trừ vốn hoá.',
          'This form appears only when cash is larger than market cap, by an amount that lies inside the range of the Debt field being drawn. Above the zero line the area is shaded green, a positive EV: even with the debt added, the whole company costs more than the cash it holds; below it is shaded red, a negative EV: debt is so low that the cash in the vault could repay it and still leave more than the market cap. The colors only show the sign of EV. It is a what-if on debt, not market history. The line rises steadily and crosses the zero line where debt equals cash minus market cap.',
        ),
      },
      cash: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tiền mặt và tiền gửi, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lượng tiền mặt đổi mà vốn hoá và nợ vay đứng yên thì EV ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: mua xong doanh nghiệp thì tiền trong két về tay người mua, nên mỗi đồng tiền mặt làm cái giá thật giảm đúng một đồng.',
          'The line runs left to right along the Cash and cash equivalents field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on cash with market cap and debt held still, not market history. The line falls steadily: once the company is bought its cash belongs to the buyer, so each unit of cash lowers the real price by exactly one unit.',
        ),
        cot: d(
          'Mỗi cột là EV ở một mức tiền mặt, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Doanh nghiệp ôm nhiều tiền nằm ở các cột thấp bên phải: vốn hoá của nó trông lớn nhưng một phần là tiền người mua lấy lại được ngay.',
          'Each bar is EV at one cash level; bars shrink to the right and the solid one is the level you have entered. A cash-rich company sits on the short bars to the right: its market cap looks large, but part of it is money the buyer gets straight back.',
        ),
        diem: d(
          'Mỗi chấm là EV tính ở một mức của ô Tiền mặt và tiền gửi, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lượng tiền mặt đổi mà vốn hoá và nợ vay đứng yên thì EV ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống thành một hàng thẳng, chấm sau thấp hơn chấm trước đúng bằng bước tiền mặt giữa hai chấm: người mua cầm lại bao nhiêu tiền trong két thì cái giá thật hạ đúng bấy nhiêu.',
          'Each dot is EV at one level of the Cash and cash equivalents field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on cash with market cap and debt held still, not market history. The row of dots falls in a straight line, each dot lower than the last by exactly the step in cash between them: whatever cash the buyer takes back from the vault comes straight off the real price.',
        ),
        laiLo: d(
          'Dạng này chỉ hiện khi dải của ô Tiền mặt và tiền gửi đi qua mức tiền mặt bằng vốn hoá cộng nợ vay: tiền bạn nhập đã lớn cỡ hai khoản ấy cộng lại, hoặc ô đang là 0 nên trục chạy hết dải ô cho phép. Phần đường trên vạch 0 tô xanh là EV dương, người mua trọn doanh nghiệp vẫn phải bỏ tiền ra; phần dưới vạch 0 tô đỏ là EV âm, tiền trong két nhiều hơn cả vốn hoá lẫn nợ vay. Đây là phép thử nếu tiền mặt đổi thì EV ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều và cắt vạch 0 đúng ở mức ấy.',
          'This form appears only when the range of the Cash and cash equivalents field passes the level where cash equals market cap plus debt: the cash you entered is about that size, or the field is at 0 so the axis spans its whole allowed range. The part of the line above the zero line is shaded green, a positive EV where a buyer still pays out; the part below is shaded red, a negative EV where the cash in the vault exceeds market cap and debt combined. It is a what-if on cash, not market history. The line falls steadily and crosses the zero line at exactly that level.',
        ),
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. Vốn hoá và Nợ vay là hai thanh tô màu, tức hai khoản cộng vào; Tiền mặt là thanh viền nét đứt, tức khoản trừ ra; thanh sẫm cuối cùng là EV và bằng đúng con số ở khối Kết quả. Trong ba thanh thành phần, thanh dài nhất là khoản quyết định EV nhiều nhất. Hình không có xu thế nào để đọc: nó cho thấy cái giá mua trọn doanh nghiệp ghép từ những phần nào.',
      'This chart has a single form: horizontal bars, read from top to bottom. Market cap and Debt are the two filled bars, the amounts added in; Cash is the bar with a dashed outline, the amount taken out; the dark bar at the end is EV and matches the figure in the Result block exactly. Of the three component bars, the longest is the part that drives the total most. There is no trend to read here: the chart shows which pieces the price of buying the whole company is made of.',
    ),
    vanhKhuyen: d(
      'Vành khuyên chỉ hiện khi ô Tiền mặt và tiền gửi đang là 0: Tiền mặt là khoản trừ, trên vòng tròn không có chỗ cho nó, nên chỉ khi bằng 0 thì EV mới đúng là tổng các múi. Khi ấy vòng gồm múi Vốn hoá và múi Nợ vay, mỗi múi to theo phần nó chiếm trong giá mua trọn doanh nghiệp; Tiền mặt vẫn có dòng trong chú giải nhưng chiếm phần bằng 0. Lỗ giữa in EV và giá trị của nó, rê chuột hay chạm một múi là hiện tên và giá trị múi ấy. Múi Nợ vay càng lớn thì càng nhiều phần của giá ấy là nợ người mua phải gánh thay.',
      'The donut appears only when the Cash and cash equivalents field is at 0: Cash is an amount taken out and has no place on a circle, so only at 0 is EV truly the sum of the slices. The ring then holds a Market cap slice and a Debt slice, each sized by its share of the price of buying the whole company; Cash keeps its row in the legend with a share of 0. The hole shows EV and its value, and hovering over or tapping a slice shows that slice’s name and value. The bigger the Debt slice, the more of that price is debt the buyer takes over.',
    ),
  },

  'ev-ebitda': {
    truc: {
      ev: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá trị doanh nghiệp (EV), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu giá mua trọn doanh nghiệp đổi thì bội số ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: EBITDA giữ nguyên, EV càng lớn thì phải mất càng nhiều năm lợi nhuận hoạt động mới bù được giá mua.',
          'The line runs left to right along the Enterprise value (EV) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the price of the whole company, not market history. The line rises steadily: with EBITDA held still, a larger EV takes more years of operating profit to pay back.',
        ),
        cot: d(
          'Mỗi cột là EV/EBITDA ở một mức EV, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột đọc được thành số năm EBITDA cần để bằng giá mua, nên cột thấp hơn là mức giá dễ chịu hơn.',
          'Each bar is EV/EBITDA at one EV level; bars grow taller to the right and the solid one is the level you have entered. Bar height reads as the years of EBITDA needed to match the purchase price, so a shorter bar is the more comfortable price.',
        ),
        diem: d(
          'Mỗi chấm là EV/EBITDA tính ở một mức của ô Giá trị doanh nghiệp (EV), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu giá mua trọn doanh nghiệp đổi mà EBITDA đứng yên thì bội số ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, các chấm cách nhau cùng một khoảng: EBITDA cố định, nên mỗi phần EV như nhau thêm vào cộng cùng một phần vào số năm EBITDA cần để bằng giá mua.',
          'Each dot is EV/EBITDA at one level of the Enterprise value (EV) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the price of the whole company with EBITDA held still, not market history. The row of dots rises in evenly spaced steps: with EBITDA fixed, each equal slice of EV adds the same amount to the years of EBITDA it takes to match the purchase price.',
        ),
        laiLo: d(
          'Dạng này chỉ hiện khi ô Giá trị doanh nghiệp (EV) đang là 0: trục ngang khi ấy chạy hết dải ô cho phép, EV âm bên trái, EV dương bên phải. Phần đường trên vạch 0 tô xanh là bội số dương, đọc được thành số năm EBITDA cần để bằng giá mua trọn doanh nghiệp; phần dưới vạch 0 tô đỏ là bội số âm, tức tiền mặt nhiều hơn cả vốn hoá cộng nợ vay, và không còn đọc thành số năm. Đây là phép thử nếu EV đổi thì bội số ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều và cắt vạch 0 ngay ở vạch đứt dọc, nơi EV bằng 0.',
          'This form appears only when the Enterprise value (EV) field is at 0: the horizontal axis then spans the whole range the field allows, negative EV on the left, positive on the right. Above the zero line the area is shaded green, a positive multiple that reads as the years of EBITDA needed to match the takeover price; below it is shaded red, a negative multiple where cash exceeds market cap plus debt, which no longer reads as years. It is a what-if on EV, not market history. The line rises steadily and crosses the zero line right at the dashed vertical line, where EV is 0.',
        ),
      },
      ebitda: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô EBITDA, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu EBITDA đổi mà giá trị doanh nghiệp đứng yên thì EV/EBITDA ra bao nhiêu, không phải diễn biến thị trường. Khi EV dương, đường đi xuống và thoải dần: dòng lợi nhuận trước lãi vay, thuế và khấu hao càng lớn thì cùng một cái giá mua trọn doanh nghiệp càng nhanh được hoàn lại. EV âm, tức tiền mặt nhiều hơn vốn hoá cộng nợ vay, thì bội số âm và đường đi lên về phía 0.',
          'The line runs left to right along the EBITDA field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on EBITDA with enterprise value held still, not market history. With a positive EV the line falls and flattens: the larger the earnings before interest, tax and depreciation, the sooner the same takeover price is earned back. With a negative EV, meaning more cash than market cap plus debt, the multiple is negative and the line rises toward 0.',
        ),
        cot: d(
          'Mỗi cột là EV/EBITDA ở một mức EBITDA, cột tô đặc là mức bạn đang nhập. Khi EV dương, cột thấp dần về bên phải, và chiều cao cột đọc gần như số năm EBITDA cần để bù lại giá mua, nên cột cao bên trái là thương vụ lâu hoàn vốn. Khi EV âm, cột quay xuống dưới và ngắn dần, và không còn đọc được thành số năm.',
          'Each bar is EV/EBITDA at one EBITDA level, and the solid one is the level you have entered. With a positive EV the bars shrink to the right, and bar height reads roughly as the years of EBITDA needed to cover the purchase price, so the tall bars on the left are slow paybacks. With a negative EV the bars hang down and get shorter, and no longer read as years.',
        ),
        diem: d(
          'Mỗi chấm là EV/EBITDA tính ở một mức của ô EBITDA, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu EBITDA đổi mà giá trị doanh nghiệp đứng yên thì bội số ra bao nhiêu, không phải diễn biến thị trường. Khi EV dương, dãy chấm đi xuống, bên trái các chấm rơi những bước dài, sang phải các bước ngắn lại: EBITDA đã lớn thì thêm nữa chỉ bớt chút ít số năm cần để bù giá mua. Khi EV âm, các chấm nằm dưới 0 và đi lên dần về phía 0.',
          'Each dot is EV/EBITDA at one level of the EBITDA field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on EBITDA with enterprise value held still, not market history. With a positive EV the row of dots falls, in long drops on the left that grow shorter on the right: once EBITDA is large, a bit more only trims the years needed to cover the purchase price slightly. With a negative EV the dots sit below 0 and the row rises toward it.',
        ),
      },
    },
  },

  'ev-sales': {
    truc: {
      ev: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá trị doanh nghiệp (EV), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu giá mua trọn doanh nghiệp đổi thì EV/Sales ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: doanh thu giữ nguyên, EV càng lớn thì mỗi đồng doanh thu đang được định giá càng cao.',
          'The line runs left to right along the Enterprise value (EV) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the price of the whole company, not market history. The line rises steadily: with revenue held still, a larger EV puts a higher value on every unit of revenue.',
        ),
        cot: d(
          'Mỗi cột là EV/Sales ở một mức EV, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột chạm mức một lần là chỗ giá mua trọn doanh nghiệp bằng đúng doanh thu một năm.',
          'Each bar is EV/Sales at one EV level; bars grow taller to the right and the solid one is the level you have entered. A bar reaching one time is where the price of the whole company equals a single year of revenue.',
        ),
        diem: d(
          'Mỗi chấm là EV/Sales tính ở một mức của ô Giá trị doanh nghiệp (EV), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu giá mua trọn doanh nghiệp đổi mà doanh thu đứng yên thì EV/Sales ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau theo chiều cao: doanh thu cố định, nên mỗi phần EV thêm vào nâng giá đặt lên mỗi đồng doanh thu lên cùng một mức.',
          'Each dot is EV/Sales at one level of the Enterprise value (EV) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the price of the whole company with revenue held still, not market history. The row of dots rises in a straight line, evenly spaced in height: with revenue fixed, each equal slice of EV raises the value placed on every unit of revenue by the same amount.',
        ),
        laiLo: d(
          'Dạng này chỉ hiện khi ô Giá trị doanh nghiệp (EV) đang là 0, lúc trục ngang trải hết dải ô cho phép, phía trái là EV âm, phía phải là EV dương. Phần đường nằm trên vạch 0 được tô xanh: mỗi đồng doanh thu đang được định giá bằng một số tiền dương. Phần dưới vạch 0 tô đỏ: EV âm, doanh nghiệp giữ nhiều tiền mặt hơn cả vốn hoá cộng nợ vay, nên hệ số cũng âm. Đây là phép thử nếu EV đổi mà doanh thu đứng yên thì hệ số ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều, cắt vạch 0 đúng chỗ vạch đứt dọc đang đứng.',
          'This form appears only when the Enterprise value (EV) field is at 0, so the horizontal axis spans the whole range the field allows, negative EV to the left and positive to the right. Where the line is above the zero line it is shaded green: each unit of revenue carries a positive price. Below it is shaded red: a negative EV, a company holding more cash than its market cap plus debt, so the ratio turns negative too. It is a what-if on EV with revenue held still, not market history. The line rises steadily and crosses the zero line exactly where the dashed vertical line stands.',
        ),
      },
      revenue: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Doanh thu thuần, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu doanh thu đổi mà giá trị doanh nghiệp đứng yên thì EV/Sales ra bao nhiêu, không phải diễn biến thị trường. Khi EV dương, đường đi xuống và thoải dần: doanh thu càng lớn thì cái giá mua trọn doanh nghiệp càng nhỏ so với sức bán hàng của nó. EV âm, tức tiền mặt nhiều hơn vốn hoá cộng nợ vay, thì hệ số âm và đường đi lên về phía 0.',
          'The line runs left to right along the Net revenue field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on revenue with enterprise value held still, not market history. With a positive EV the line falls and flattens: the larger the revenue, the smaller the takeover price looks next to what the company sells. With a negative EV, meaning more cash than market cap plus debt, the ratio is negative and the line rises toward 0.',
        ),
        cot: d(
          'Mỗi cột là EV/Sales ở một mức doanh thu, cột tô đặc là mức bạn đang nhập. Khi EV dương, cột thấp dần về bên phải; khi EV âm, cột quay xuống dưới và ngắn dần. Hệ số này dùng được cả khi doanh nghiệp chưa có lãi, nhưng cột thấp chỉ đáng giá khi doanh thu ấy rồi sẽ thành lợi nhuận.',
          'Each bar is EV/Sales at one revenue level, and the solid one is the level you have entered. With a positive EV the bars shrink to the right; with a negative EV they hang down and get shorter. The ratio works even before a company turns a profit, but a short bar is only worth something if that revenue eventually becomes earnings.',
        ),
        diem: d(
          'Mỗi chấm là EV/Sales tính ở một mức của ô Doanh thu thuần, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu doanh thu đổi mà giá trị doanh nghiệp đứng yên thì hệ số ra bao nhiêu, không phải diễn biến thị trường. Khi EV dương, dãy chấm đi xuống, mỗi chấm hụt so với chấm trước một khoảng nhỏ dần về bên phải: doanh thu càng lớn thì thêm một phần nữa càng ít làm đổi giá đặt lên mỗi đồng doanh thu. Khi EV âm, các chấm nằm dưới 0 và đi lên dần về phía 0.',
          'Each dot is EV/Sales at one level of the Net revenue field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on revenue with enterprise value held still, not market history. With a positive EV the row of dots falls, each drop from one dot to the next smaller than the one before: the larger revenue already is, the less a further slice changes the price put on each unit of it. With a negative EV the dots sit below 0 and the row rises toward it.',
        ),
      },
    },
  },

  peg: {
    truc: {
      pe: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô P/E hiện tại, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu P/E đổi mà tốc độ tăng trưởng đứng yên thì PEG ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cùng một tốc độ tăng trưởng, P/E càng cao thì bạn trả càng đắt cho mỗi phần tăng trưởng ấy.',
          'The line runs left to right along the Current P/E field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on P/E with growth held still, not market history. The line rises steadily: at the same growth rate, a higher P/E means paying more for each point of that growth.',
        ),
        cot: d(
          'Mỗi cột là PEG ở một mức P/E, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột chạm mức một lần là chỗ P/E vừa bằng tốc độ tăng trưởng; cột thấp hơn thế là tăng trưởng đang được bán rẻ.',
          'Each bar is PEG at one P/E level; bars grow taller to the right and the solid one is the level you have entered. A bar reaching one time is where P/E just equals the growth rate; anything shorter means growth is selling cheap.',
        ),
        diem: d(
          'Mỗi chấm là PEG tính ở một mức của ô P/E hiện tại, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu P/E đổi mà tốc độ tăng trưởng đứng yên thì PEG ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, chấm sau cao hơn chấm trước một khoảng như nhau: PEG chỉ là P/E chia cho một tốc độ tăng trưởng cố định. Chấm nào nằm dưới mức một lần là mức P/E còn rẻ so với đà tăng ấy.',
          'Each dot is PEG at one level of the Current P/E field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on P/E with growth held still, not market history. The row of dots rises in a straight line, each dot above the last by the same amount: PEG is simply P/E divided by a fixed growth rate. Any dot below one time marks a P/E that is still cheap for that growth.',
        ),
      },
      growth: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tăng trưởng lợi nhuận kỳ vọng (g), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tốc độ tăng trưởng kỳ vọng đổi mà P/E đứng yên thì PEG ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: lợi nhuận được kỳ vọng tăng càng nhanh thì cùng mức P/E ấy càng dễ chấp nhận.',
          'The line runs left to right along the Expected earnings growth (g) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on expected growth with P/E held still, not market history. The line falls and flattens: the faster profit is expected to grow, the easier that same P/E is to justify.',
        ),
        cot: d(
          'Mỗi cột là PEG ở một mức tăng trưởng, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột nào hạ xuống dưới mức một lần là chỗ tăng trưởng kỳ vọng đã lớn hơn chính con số P/E; vì tăng trưởng chỉ là dự báo, cột thấp cũng chỉ chắc bằng dự báo ấy.',
          'Each bar is PEG at one growth rate; bars shrink to the right and the solid one is the rate you have entered. A bar dropping below one time is where expected growth exceeds the P/E figure itself; since growth is only a forecast, a short bar is only as solid as that forecast.',
        ),
        diem: d(
          'Mỗi chấm là PEG tính ở một mức của ô Tăng trưởng lợi nhuận kỳ vọng (g), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tăng trưởng kỳ vọng đổi mà P/E đứng yên thì PEG ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, các bước hụt lớn ở bên trái rồi nhỏ dần về bên phải: khi dự báo tăng trưởng thấp, chỉ cần sai lệch một chút trong dự báo là PEG đã lệch xa.',
          'Each dot is PEG at one level of the Expected earnings growth (g) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on expected growth with P/E held still, not market history. The row of dots falls, with big drops on the left that shrink toward the right: when the growth forecast is low, a small error in that forecast already moves PEG a long way.',
        ),
      },
    },
  },

  'von-hoa-thi-truong': {
    truc: {
      price: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá thị trường (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu giá đổi thì vốn hoá ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: số cổ phiếu giữ nguyên, giá tăng bao nhiêu phần thì cả doanh nghiệp được định giá cao lên bấy nhiêu phần.',
          'The line runs left to right along the Market price (P) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on price, not market history. The line rises steadily: with the share count held still, the whole company is valued up in exact proportion to the price.',
        ),
        cot: d(
          'Mỗi cột là vốn hoá ở một mức giá, cột cao dần về bên phải và cột tô đặc là mức giá bạn đang nhập. Chiều cao cột là số tiền thị trường đang trả cho toàn bộ cổ phiếu đang lưu hành.',
          'Each bar is the market cap at one price level; bars grow taller to the right and the solid one is the price you have entered. Bar height is what the market is paying for all the shares outstanding.',
        ),
        diem: d(
          'Mỗi chấm là vốn hoá tính ở một mức của ô Giá thị trường (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu giá đổi thì vốn hoá ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau: số cổ phiếu cố định, nên mỗi bước giá như nhau cộng vào vốn hoá cùng một số tiền, bằng bước giá ấy nhân với số cổ phiếu đang lưu hành.',
          'Each dot is the market cap at one level of the Market price (P) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on price, not market history. The row of dots rises in a straight line with even spacing: with the share count fixed, each equal step in price adds the same sum to the market cap, that step times the shares outstanding.',
        ),
      },
      shares: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số cổ phiếu lưu hành (N), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số cổ phiếu đổi mà giá đứng yên thì vốn hoá ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: vốn hoá là giá nhân với số cổ phiếu, nên số cổ phiếu tăng bao nhiêu phần thì vốn hoá tăng bấy nhiêu phần.',
          'The line runs left to right along the Shares outstanding (N) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the share count with the price held still, not market history. The line rises steadily: market cap is price times shares, so it grows in exact proportion to the share count.',
        ),
        cot: d(
          'Mỗi cột là vốn hoá ở một mức số cổ phiếu, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Ngoài đời giá hiếm khi đứng yên khi doanh nghiệp phát hành thêm, nên các cột bên phải là mức trần nếu thị trường không ép giá xuống.',
          'Each bar is market cap at one share count; bars grow taller to the right and the solid one is the count you have entered. In practice the price rarely holds still when new shares are issued, so the bars on the right are a ceiling that assumes the market does not mark the price down.',
        ),
        diem: d(
          'Mỗi chấm là vốn hoá tính ở một mức của ô Số cổ phiếu lưu hành (N), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu số cổ phiếu đổi mà giá đứng yên thì vốn hoá ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, hai chấm kề nhau luôn cách nhau một khoảng như nhau: mỗi cổ phiếu thêm vào được tính đúng bằng giá bạn nhập, nên vốn hoá tăng cùng nhịp với số cổ phiếu.',
          'Each dot is the market cap at one level of the Shares outstanding (N) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the share count with the price held still, not market history. The row of dots rises evenly, with the same gap between every pair of neighbors: each extra share is counted at exactly the price you entered, so the market cap grows in step with the share count.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là vốn hoá tính với giá đóng cửa của phiên đó, còn số cổ phiếu vẫn là con số bạn nhập. Hình này đi theo đúng chuỗi giá bạn đã nạp, và hình dạng đường trùng với đường giá. Đường đi lên là doanh nghiệp đang được định giá cao dần, đi xuống là mức định giá ấy đang co lại.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the market cap at that session’s closing price, with the share count kept at the figure you entered. It follows the price series you loaded, and its shape matches the price line. When it rises the company is being valued higher; when it falls that valuation is shrinking.',
      ),
      cot: d(
        'Mỗi cột là vốn hoá của một phiên, cột cuối bên phải là phiên gần nhất. Chênh lệch chiều cao giữa hai cột là số tiền vốn hoá đã thêm vào hay mất đi giữa hai phiên ấy.',
        'Each bar is the market cap of one session, the last one on the right being the latest. The difference in height between two bars is the market value gained or lost between those two sessions.',
      ),
      diem: d(
        'Mỗi chấm là vốn hoá của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; vốn hoá tính với giá đóng cửa của phiên ấy, còn số cổ phiếu vẫn là con số bạn nhập. Hình đi theo đúng chuỗi giá bạn đã nạp: dãy chấm đi lên là doanh nghiệp đang được định giá cao dần, đi xuống là mức định giá ấy co lại. Chuỗi dài thì các chấm dày lại thành một dải; chỗ hai chấm kề nhau tách xa theo chiều dọc là phiên giá đổi mạnh.',
        'Each dot is the market cap of one session, running from the oldest session on the left to the most recent session on the right; it uses that session’s closing price, with the share count kept at the figure you entered. The chart follows the price series you loaded: when the row of dots rises the company is being valued higher, and when it falls that valuation is shrinking. On a long series the dots pack into a dense band; where two neighbors pull far apart vertically, the price moved sharply that session.',
      ),
      bac: d(
        'Mỗi bậc là vốn hoá của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi nhảy thẳng sang mức của phiên sau, vì vốn hoá chỉ đổi khi có giá đóng cửa mới. Số cổ phiếu vẫn là con số bạn nhập, nên mỗi bước nhảy cao bao nhiêu là thị trường vừa thêm hay bớt bấy nhiêu tiền cho cả doanh nghiệp trong một phiên. Bậc đi lên là doanh nghiệp đang được định giá cao dần, đi xuống là mức định giá ấy co lại.',
        'Each step is the market cap of one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and jumps straight to the next one’s value, because the market cap only changes when a new closing price arrives. The share count stays at the figure you entered, so the height of each jump is how much value the market added to or took from the whole company in that one session. When the staircase rises the company is being valued higher; when it falls that valuation is shrinking.',
      ),
    },
  },

  'so-graham': {
    truc: {
      eps: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô EPS, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu EPS đổi thì mức giá Graham chấp nhận ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: công thức lấy căn bậc hai, nên EPS gấp đôi không làm số Graham gấp đôi mà chỉ nâng nó thêm chừng bốn phần mười.',
          'The line runs left to right along the EPS field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the price Graham would accept as EPS changes, not market history. The line rises but flattens: the formula takes a square root, so doubling EPS does not double the Graham number but lifts it by about four tenths.',
        ),
        cot: d(
          'Mỗi cột là số Graham ở một mức EPS, cột cao dần về bên phải nhưng mỗi cột thêm ít hơn cột trước; cột tô đặc là mức bạn đang nhập. Chiều cao cột là trần giá theo Graham, nên thị giá nằm trên đỉnh cột là đã vượt mức ông cho là hợp lý.',
          'Each bar is the Graham number at one EPS level; bars grow taller to the right, each adding less than the one before, and the solid one is the level you have entered. Bar height is Graham’s price ceiling, so a market price above the top of the bar has passed what he considered reasonable.',
        ),
        diem: d(
          'Mỗi chấm là số Graham tính ở một mức của ô EPS, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu EPS đổi thì mức giá Graham chấp nhận ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên, nhưng mỗi chấm chỉ cao hơn chấm trước một khoảng nhỏ dần về bên phải: EPS nằm trong dấu căn, nên phần lợi nhuận thêm vào sau nâng trần giá ít hơn phần thêm vào trước.',
          'Each dot is the Graham number at one level of the EPS field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the price Graham would accept as EPS changes, not market history. The row of dots rises, but each dot gains less on the one before as you move right: EPS sits under the square root, so every later slice of earnings lifts the price ceiling less than the slice before it.',
        ),
      },
      bvps: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá trị sổ sách / CP (BVPS), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu giá trị sổ sách đổi mà EPS đứng yên thì số Graham ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: sổ sách nằm trong dấu căn, nên sổ sách tăng gấp đôi chỉ nâng mức giá hợp lý lên chưa tới gấp rưỡi.',
          'The line runs left to right along the Book value / share (BVPS) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on book value with EPS held still, not market history. The line rises but flattens: book value sits under the square root, so doubling it lifts the fair price by less than half.',
        ),
        cot: d(
          'Mỗi cột là số Graham ở một mức giá trị sổ sách, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột là mức giá cao nhất Graham cho là còn hợp lý; thị giá nằm trên đỉnh cột là đã vượt ngưỡng ấy.',
          'Each bar is the Graham number at one level of book value; bars grow taller to the right and the solid one is the level you have entered. Bar height is the highest price Graham would still call reasonable; a market price above the top of the bar is past that limit.',
        ),
        diem: d(
          'Mỗi chấm là số Graham tính ở một mức của ô Giá trị sổ sách / CP (BVPS), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu giá trị sổ sách đổi mà EPS đứng yên thì số Graham ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên, khoảng cách giữa hai chấm kề nhau hẹp dần về bên phải. Sổ sách và EPS đứng ngang hàng dưới cùng một dấu căn, nên dãy chấm này có đúng dáng của dãy chấm theo EPS, chỉ khác các mức ghi trên trục ngang.',
          'Each dot is the Graham number at one level of the Book value / share (BVPS) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on book value with EPS held still, not market history. The row of dots rises, the gap between neighbors narrowing toward the right. Book value and EPS sit side by side under the same square root, so this row has exactly the shape of the row drawn against EPS; only the levels along the horizontal axis differ.',
        ),
      },
    },
  },

  'ncav-tren-co-phieu': {
    truc: {
      currentAssets: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tài sản ngắn hạn (TSNH), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tài sản ngắn hạn đổi mà tổng nợ đứng yên thì NCAV mỗi cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: mỗi đồng tài sản ngắn hạn thêm vào là một đồng còn lại cho cổ đông sau khi trả hết nợ; chỗ nào đường nằm dưới 0 là chỗ tài sản ngắn hạn chưa đủ phủ nợ.',
          'The line runs left to right along the Current assets (TSNH) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on current assets with total liabilities held still, not market history. The line rises steadily: every extra unit of current assets is a unit left for shareholders once all debts are paid; wherever it sits below 0, current assets do not yet cover the liabilities.',
        ),
        cot: d(
          'Mỗi cột là NCAV mỗi cổ phiếu ở một mức tài sản ngắn hạn, cột tô đặc là mức bạn đang nhập. Cột quay xuống dưới vạch 0 ở bên trái là vùng nợ lớn hơn tài sản ngắn hạn; chỗ cột đổi sang mọc lên trên vạch 0 là lúc hai bên vừa bằng nhau.',
          'Each bar is NCAV per share at one level of current assets, and the solid one is the level you have entered. Bars hanging below the zero line on the left mark liabilities larger than current assets; where they flip to stand above the zero line is where the two are just equal.',
        ),
        diem: d(
          'Mỗi chấm là NCAV mỗi cổ phiếu tính ở một mức của ô Tài sản ngắn hạn (TSNH), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tài sản ngắn hạn đổi mà tổng nợ đứng yên thì NCAV mỗi cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, các chấm cách nhau đúng một khoảng: mỗi phần tài sản ngắn hạn thêm vào được chia đều cho cùng một số cổ phiếu. Chấm nào nằm dưới 0 là mức tài sản ngắn hạn chưa đủ trả hết nợ.',
          'Each dot is NCAV per share at one level of the Current assets (TSNH) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on current assets with total liabilities held still, not market history. The row of dots rises in even steps: each extra slice of current assets is shared equally across the same number of shares. Any dot below 0 is a level of current assets that cannot yet pay off all the liabilities.',
        ),
        laiLo: d(
          'Dạng này hiện khi tổng nợ nằm trong dải của ô Tài sản ngắn hạn (TSNH) đang vẽ, tức có những mức tài sản ngắn hạn đủ trả nợ và những mức không đủ. Phần đường trên vạch 0 tô xanh là NCAV dương: đem tài sản ngắn hạn trả xong mọi khoản nợ vẫn còn phần cho cổ đông; phần dưới vạch 0 tô đỏ là NCAV âm: tài sản ngắn hạn không đủ trả nợ, mỗi cổ phiếu gánh một phần thiếu hụt. Đây là phép thử nếu tài sản ngắn hạn đổi thì NCAV ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều và cắt vạch 0 ở mức tài sản ngắn hạn bằng đúng tổng nợ.',
          'This form appears when total liabilities lie inside the range of the Current assets (TSNH) field being drawn, so some levels cover the debts and some do not. Above the zero line the area is shaded green, a positive NCAV: current assets pay off every liability and still leave something for shareholders; below it is shaded red, a negative NCAV: current assets come up short and each share carries part of the gap. It is a what-if on current assets, not market history. The line rises steadily and crosses the zero line where current assets equal total liabilities.',
        ),
      },
      totalLiabilities: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tổng nợ phải trả, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tổng nợ đổi mà tài sản ngắn hạn đứng yên thì NCAV mỗi cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: mỗi đồng nợ thêm vào lấy đi đúng một đồng khỏi phần tài sản ngắn hạn còn lại cho cổ đông.',
          'The line runs left to right along the Total liabilities field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on total liabilities with current assets held still, not market history. The line falls steadily: every extra unit of debt takes exactly one unit from the current assets left over for shareholders.',
        ),
        cot: d(
          'Mỗi cột là NCAV mỗi cổ phiếu ở một mức tổng nợ, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột càng thấp thì khoảng đệm giữa thị giá và giá trị thanh lý càng mỏng.',
          'Each bar is NCAV per share at one level of total liabilities; bars shrink to the right and the solid one is the level you have entered. The shorter the bar, the thinner the cushion between the market price and liquidation value.',
        ),
        diem: d(
          'Mỗi chấm là NCAV mỗi cổ phiếu tính ở một mức của ô Tổng nợ phải trả, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tổng nợ đổi mà tài sản ngắn hạn đứng yên thì NCAV ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống thành hàng thẳng, mỗi chấm thấp hơn chấm trước cùng một khoảng: phần nợ thêm vào chia cho cùng một số cổ phiếu, nên mỗi bước nợ như nhau lấy đi của mỗi cổ phiếu một phần như nhau.',
          'Each dot is NCAV per share at one level of the Total liabilities field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on total liabilities with current assets held still, not market history. The row of dots falls in a straight line, each dot lower than the last by the same amount: the extra debt is split over the same number of shares, so each equal step of liabilities takes the same slice from every share.',
        ),
        laiLo: d(
          'Dạng này hiện khi tài sản ngắn hạn nằm trong dải của ô Tổng nợ phải trả đang vẽ, chẳng hạn khi ô ấy đang là 0 và trục chạy hết dải ô cho phép. Phần đường trên vạch 0 tô xanh là NCAV dương, tài sản ngắn hạn trả hết nợ vẫn còn phần cho cổ đông; phần dưới vạch 0 tô đỏ là NCAV âm, nợ đã vượt tài sản ngắn hạn và cổ đông không còn gì từ phần tài sản ấy. Đây là phép thử nếu tổng nợ đổi thì NCAV ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều và cắt vạch 0 ở mức nợ bằng đúng tài sản ngắn hạn.',
          'This form appears when current assets lie inside the range of the Total liabilities field being drawn, for example when that field is at 0 and the axis spans its whole allowed range. Above the zero line the area is shaded green, a positive NCAV where current assets settle every debt with something left over; below it is shaded red, a negative NCAV where debts outgrow current assets and leave shareholders nothing from them. It is a what-if on total liabilities, not market history. The line falls steadily and crosses the zero line where liabilities equal current assets.',
        ),
      },
      shares: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số cổ phiếu lưu hành (N), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số cổ phiếu đổi mà tài sản và nợ đứng yên thì NCAV mỗi cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Khi tài sản ngắn hạn lớn hơn tổng nợ, đường đi xuống và thoải dần: cùng một phần tài sản còn lại sau nợ chia cho càng nhiều cổ phiếu thì mỗi cổ phiếu nhận càng ít. Khi tổng nợ lớn hơn, kết quả âm và đường đi lên: khoản thiếu hụt chia cho càng nhiều cổ phiếu thì phần của mỗi cổ phiếu càng nhẹ.',
          'The line runs left to right along the Shares outstanding (N) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the share count with assets and liabilities held still, not market history. When current assets exceed total liabilities the line falls and flattens: the same assets left after debt, split across more shares, leave less for each one. When liabilities are larger the result is negative and the line rises: the shortfall split across more shares weighs less on each one.',
        ),
        cot: d(
          'Mỗi cột là NCAV mỗi cổ phiếu ở một mức số cổ phiếu, cột tô đặc là mức bạn đang nhập. Khi tài sản ngắn hạn lớn hơn tổng nợ, cột thấp dần về bên phải; khi tổng nợ lớn hơn, cột quay xuống dưới và ngắn dần. Nhập thiếu số cổ phiếu là lỗi dễ gặp nhất ở đây: nó đẩy bạn sang các cột bên trái, nơi con số của mỗi cổ phiếu bị phóng to.',
          'Each bar is NCAV per share at one share count, and the solid one is the count you have entered. When current assets exceed total liabilities the bars shrink to the right; when liabilities are larger they hang down and get shorter. Understating the share count is the easiest mistake here: it moves you to the bars on the left, where the per-share figure is magnified.',
        ),
        diem: d(
          'Mỗi chấm là NCAV mỗi cổ phiếu tính ở một mức của ô Số cổ phiếu lưu hành (N), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu số cổ phiếu đổi mà tài sản và nợ đứng yên thì NCAV ra bao nhiêu, không phải diễn biến thị trường. Khi tài sản ngắn hạn lớn hơn tổng nợ, dãy chấm đi xuống, hụt nhiều ở bên trái và ít dần về bên phải; khi tổng nợ lớn hơn, các chấm nằm dưới 0 và đi lên dần về phía 0. Số cổ phiếu chỉ chia mỏng phần dư hay phần thiếu, không bao giờ đổi được dấu của nó.',
          'Each dot is NCAV per share at one level of the Shares outstanding (N) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the share count with assets and liabilities held still, not market history. When current assets exceed total liabilities the row of dots falls, dropping a lot on the left and less and less to the right; when liabilities are larger the row sits below 0 and rises toward it. No share count can change the sign: more shares only spread the surplus or the shortfall thinner.',
        ),
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. TSNH mỗi CP là thanh tô màu, phần tài sản ngắn hạn chia cho mỗi cổ phiếu; Trừ nợ mỗi CP là thanh viền nét đứt, toàn bộ nợ phải trả chia cho mỗi cổ phiếu; thanh sẫm cuối cùng là NCAV và bằng đúng con số ở khối Kết quả. Thanh trừ dài gần bằng thanh cộng thì tài sản ngắn hạn chỉ vừa đủ trả nợ, và phần còn lại cho cổ đông rất mỏng.',
      'This chart has a single form: horizontal bars, read from top to bottom. Current assets is the filled bar, current assets spread over each share; Less liabilities is the bar with a dashed outline, all liabilities spread over each share; the dark bar at the end is NCAV and matches the figure in the Result block exactly. When the minus bar is nearly as long as the plus bar, current assets barely cover the debts and little is left for shareholders.',
    ),
    vanhKhuyen: d(
      'Vành khuyên chỉ hiện khi ô Tổng nợ phải trả đang là 0: Trừ nợ mỗi CP là khoản trừ, trên vòng tròn không có chỗ cho nó, nên chỉ khi bằng 0 thì NCAV mới đúng là tổng các múi. Khi ấy cả vòng là một múi TSNH mỗi CP, Trừ nợ mỗi CP vẫn có dòng trong chú giải nhưng chiếm phần bằng 0, và NCAV in ở lỗ giữa bằng đúng tài sản ngắn hạn của mỗi cổ phiếu. Rê chuột hay chạm múi là hiện tên và giá trị của nó. Muốn thấy nợ ăn mất bao nhiêu tài sản ngắn hạn thì xem dạng Thanh ngang.',
      'The donut appears only when the Total liabilities field is at 0: Less liabilities is an amount taken out and has no place on a circle, so only at 0 is NCAV truly the sum of the slices. The whole ring is then a single Current assets slice, Less liabilities keeps its row in the legend with a share of 0, and the NCAV in the hole equals the current assets behind each share. Hovering over or tapping the slice shows its name and value. To see how much of the current assets the debts eat up, switch to the horizontal bars.',
    ),
  },

  'ty-suat-loi-nhuan-tren-gia': {
    truc: {
      eps: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô EPS, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu EPS đổi thì tỷ suất lợi nhuận trên giá ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: giá mua giữ nguyên, cổ phiếu làm ra càng nhiều lợi nhuận thì mỗi đồng bạn bỏ ra sinh lời càng cao.',
          'The line runs left to right along the EPS field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on EPS, not market history. The line rises steadily: at the same purchase price, the more the share earns, the more each unit you put in returns.',
        ),
        cot: d(
          'Mỗi cột là tỷ suất lợi nhuận ở một mức EPS, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Chiều cao cột so được thẳng với lãi suất tiết kiệm: cột thấp hơn lãi suất gửi ngân hàng là cổ phiếu đang sinh lời kém hơn gửi tiền.',
          'Each bar is the earnings yield at one EPS level; bars grow taller to the right and the solid one is the level you have entered. Bar height compares directly with a savings rate: a bar below the bank deposit rate means the share earns less than a deposit.',
        ),
        diem: d(
          'Mỗi chấm là tỷ suất lợi nhuận trên giá tính ở một mức của ô EPS, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu EPS đổi thì tỷ suất ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau: giá mua giữ nguyên, nên mỗi phần lợi nhuận như nhau thêm vào nâng tỷ suất lên cùng một khoảng. Mỗi chấm là một phép thử riêng; giữa hai chấm không có mức EPS nào được tính.',
          'Each dot is the earnings yield at one level of the EPS field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on EPS, not market history. The row of dots rises in a straight line with even spacing: at the same purchase price, each equal slice of earnings adds the same amount to the yield. Each dot is a separate what-if; no EPS level between two dots is computed.',
        ),
        laiLo: d(
          'Dạng này chỉ hiện khi ô EPS đang là 0: trục ngang khi ấy trải đều hai phía quanh 0, bên trái là doanh nghiệp lỗ, bên phải là doanh nghiệp có lãi. Phần đường trên vạch 0 tô xanh là tỷ suất dương: mỗi đồng bạn bỏ ra mua cổ phiếu ứng với một phần lợi nhuận công ty làm ra; phần dưới vạch 0 tô đỏ là tỷ suất âm: mỗi đồng ấy ứng với một phần lỗ. Đây là phép thử nếu EPS đổi thì tỷ suất ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều và cắt vạch 0 ngay tại vạch đứt dọc, nơi EPS bằng 0.',
          'This form appears only when the EPS field is at 0: the horizontal axis then spreads evenly on both sides of 0, loss-making companies on the left and profitable ones on the right. The part of the line above the zero line is shaded green, a positive yield where each unit you pay for the share stands for a slice of profit; the part below is shaded red, a negative yield where it stands for a slice of loss. It is a what-if on EPS, not market history. The line rises steadily and crosses the zero line right at the dashed vertical line, where EPS is 0.',
        ),
      },
      price: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá thị trường (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu giá đổi mà EPS đứng yên thì tỷ suất lợi nhuận ra bao nhiêu, không phải diễn biến thị trường. Khi EPS dương, đường đi xuống và thoải dần: giá càng cao thì mỗi đồng bỏ ra mua cổ phiếu đem về càng ít lợi nhuận. Khi EPS âm, đường nằm dưới 0 và đi lên: giá càng cao thì khoản lỗ trên mỗi đồng bỏ ra càng nhỏ.',
          'The line runs left to right along the Market price (P) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on price with EPS held still, not market history. With a positive EPS the line falls and flattens: the higher the price, the less profit each unit spent on the share brings back. With a negative EPS the line sits below 0 and rises: the higher the price, the smaller the loss on each unit spent.',
        ),
        cot: d(
          'Mỗi cột là tỷ suất lợi nhuận ở một mức giá, cột tô đặc là mức giá bạn đang nhập. Khi EPS dương, cột thấp dần về bên phải, và đặt chiều cao cột cạnh lãi suất tiết kiệm cùng kỳ hạn là thấy ngay mức giá nào cổ phiếu còn sinh lời hơn gửi tiền. Khi EPS âm, cột quay xuống dưới và ngắn dần về bên phải.',
          'Each bar is the earnings yield at one price level, and the solid one is the price you have entered. With a positive EPS the bars shrink to the right, and setting a bar’s height beside a savings rate for the same term shows at which prices the share still earns more than a deposit. With a negative EPS the bars hang down and get shorter to the right.',
        ),
        diem: d(
          'Mỗi chấm là tỷ suất lợi nhuận trên giá tính ở một mức của ô Giá thị trường (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu giá đổi mà EPS đứng yên thì tỷ suất ra bao nhiêu, không phải diễn biến thị trường. Khi EPS dương, dãy chấm đi xuống, bên trái mỗi chấm hụt nhiều so với chấm trước, sang phải hụt ít dần: ở vùng giá thấp, giá chỉ nhích một chút là tỷ suất đã giảm rõ. Khi EPS âm, các chấm nằm dưới 0 và đi lên dần về phía 0.',
          'Each dot is the earnings yield at one level of the Market price (P) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on price with EPS held still, not market history. With a positive EPS the row of dots falls, dropping a lot from one dot to the next on the left and less and less toward the right: at a low price, even a small move up cuts the yield noticeably. With a negative EPS the dots sit below 0 and the row rises toward it.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là tỷ suất lợi nhuận tính với giá đóng cửa của phiên đó, còn EPS vẫn là con số bạn nhập. Khi EPS dương, đường đi NGƯỢC chiều giá của chuỗi bạn đã nạp: đường đi lên là giá đang giảm nên mỗi đồng mua vào sinh lời nhiều hơn, đi xuống là giá đang tăng và cổ phiếu đắt dần. Khi EPS âm, cả đường nằm dưới 0 và đi cùng chiều giá.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the earnings yield at that session’s closing price, with EPS kept at the figure you entered. With a positive EPS it moves AGAINST the price of the series you loaded: when it rises the price is dropping, so each unit invested earns more; when it falls the price is climbing and the share is getting dearer. With a negative EPS the whole line sits below 0 and moves with the price.',
      ),
      cot: d(
        'Mỗi cột là tỷ suất lợi nhuận của một phiên, cột cuối bên phải là phiên gần nhất. Khi EPS dương, cột cao nhất trong dãy là phiên cổ phiếu rẻ nhất so với lợi nhuận, cột thấp nhất là phiên đắt nhất.',
        'Each bar is the earnings yield of one session, the last one on the right being the latest. With a positive EPS, the tallest bar in the row is the session when the share was cheapest against its profit, the shortest when it was dearest.',
      ),
      diem: d(
        'Mỗi chấm là tỷ suất lợi nhuận trên giá của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; tỷ suất tính với giá đóng cửa của phiên ấy, còn EPS vẫn là con số bạn nhập. Khi EPS dương, dãy chấm đi ngược chiều giá của chuỗi bạn đã nạp: chấm đi lên là giá đang giảm, đi xuống là giá đang tăng. Vì tỷ suất lấy EPS chia cho giá, cùng một số đồng giá đổi làm chấm nhảy xa hơn ở những phiên giá đang thấp. Khi EPS âm, mọi chấm nằm dưới 0.',
        'Each dot is the earnings yield of one session, running from the oldest session on the left to the most recent session on the right; it uses that session’s closing price, with EPS kept at the figure you entered. With a positive EPS the dots move against the price of the series you loaded: a row that rises means the price is dropping, a row that falls means it is climbing. Because the yield divides EPS by the price, the same price move shifts a dot further in sessions when the price is low. With a negative EPS every dot sits below 0.',
      ),
      bac: d(
        'Mỗi bậc là tỷ suất lợi nhuận trên giá của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy và chỉ nhảy khi có giá đóng cửa của phiên sau. EPS vẫn là con số bạn nhập, nên khi EPS dương, bậc đi lên là giá vừa giảm, đi xuống là giá vừa tăng, và bậc nhảy cao là phiên giá đổi mạnh. Khi EPS âm, cả cầu thang nằm dưới 0 và bước cùng chiều giá.',
        'Each step is the earnings yield of one session, running from the oldest session on the left to the most recent session on the right: it stays level through that session and only jumps when the next session’s close comes in. EPS stays at the figure you entered, so with a positive EPS a step that rises means the price has just dropped, one that falls means it has just climbed, and a tall jump marks a sharp price move. With a negative EPS the whole staircase sits below 0 and moves with the price.',
      ),
    },
  },

  'gia-muc-tieu': {
    truc: {
      targetPe: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô P/E mục tiêu, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu bạn chọn một P/E khác thì giá mục tiêu ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: EPS giữ nguyên, bạn tin thị trường sẽ trả bội số cao hơn bao nhiêu thì giá mục tiêu nhích lên bấy nhiêu.',
          'The line runs left to right along the Target P/E field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the P/E you choose, not market history. The line rises steadily: with EPS held still, the target price moves up exactly as far as the multiple you believe the market will pay.',
        ),
        cot: d(
          'Mỗi cột là giá mục tiêu ở một mức P/E, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Khoảng cách giữa cột thấp nhất và cột cao nhất cho thấy giá mục tiêu phụ thuộc vào giả định P/E đến đâu: nó là một dải, không phải một điểm.',
          'Each bar is the target price at one P/E level; bars grow taller to the right and the solid one is the level you have entered. The spread between the shortest and tallest bars shows how much the target hangs on the P/E assumption: it is a range, not a point.',
        ),
        diem: d(
          'Mỗi chấm là giá mục tiêu tính ở một mức của ô P/E mục tiêu, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu bạn chọn một P/E khác thì giá mục tiêu ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, chấm sau cao hơn chấm trước đúng một khoảng: phần P/E bạn chọn cao thêm nào cũng được nhân với cùng một EPS. Giữa hai chấm không có mức P/E nào được tính, nên mỗi chấm là một giả định riêng.',
          'Each dot is the target price at one level of the Target P/E field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the P/E you choose, not market history. The row of dots rises in a straight line, each dot above the last by the same amount: every extra slice of P/E you pick is multiplied by the same EPS. No P/E level between two dots is computed, so each dot is a separate assumption.',
        ),
      },
      eps: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô EPS, từ một nửa đến gấp rưỡi mức EPS bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức bạn nhập. Đây là phép thử nếu EPS đổi mà P/E mục tiêu đứng yên thì giá mục tiêu ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: giá mục tiêu bằng P/E mục tiêu nhân EPS, nên EPS khác đi bao nhiêu phần thì giá mục tiêu khác đi đúng bấy nhiêu phần.',
          'The line runs left to right along the EPS field, from half to one and a half times the EPS you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on EPS with the target P/E held still, not market history. The line rises steadily: target price is target P/E times EPS, so any change in EPS carries through to the target price in the same proportion.',
        ),
        cot: d(
          'Mỗi cột là giá mục tiêu ở một mức EPS, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Khoảng cách giữa hai cột cạnh nhau là số đồng giá mục tiêu đổi đi mỗi khi EPS nhích một bậc.',
          'Each bar is the target price at one EPS level; bars grow taller to the right and the solid one is the level you have entered. The gap between two neighboring bars is how far the target price moves each time EPS shifts one step.',
        ),
        diem: d(
          'Mỗi chấm là giá mục tiêu tính ở một mức của ô EPS, từ một nửa đến gấp rưỡi mức EPS bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức bạn nhập. Đây là phép thử nếu EPS đổi mà P/E mục tiêu đứng yên thì giá mục tiêu ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, các chấm cách nhau đúng một khoảng: mỗi đồng EPS thêm vào được nhân với P/E mục tiêu, nên lợi nhuận đổi bao nhiêu phần thì giá mục tiêu đổi bấy nhiêu phần. Giá mục tiêu chỉ chắc bằng con số EPS bạn tin doanh nghiệp giữ được.',
          'Each dot is the target price at one level of the EPS field, from half to one and a half times the EPS you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on EPS with the target P/E held still, not market history. The row of dots rises evenly, the same gap between each pair: each extra unit of EPS is multiplied by the target P/E, so the target price moves in the same proportion as earnings. A target is only as firm as the EPS you trust the company to keep.',
        ),
      },
    },
  },

  'mo-hinh-gordon': {
    truc: {
      dividend: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Cổ tức vừa trả (D0), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mức cổ tức đổi mà tăng trưởng và suất sinh lợi yêu cầu đứng yên thì giá trị cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: mọi khoản cổ tức về sau đều mọc ra từ khoản vừa trả, nên cổ tức gốc lớn hơn bao nhiêu phần thì giá trị lớn hơn bấy nhiêu phần.',
          'The line runs left to right along the Most recent dividend (D0) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the dividend with growth and required return held still, not market history. The line rises steadily: every future dividend grows out of the one just paid, so a larger starting dividend lifts the value in exact proportion.',
        ),
        cot: d(
          'Mỗi cột là giá trị cổ phiếu ở một mức cổ tức, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Nhập cổ tức của một năm chia đột biến là tự đặt mình lên một cột cao hơn mức doanh nghiệp giữ được lâu dài.',
          'Each bar is the share value at one dividend level; bars grow taller to the right and the solid one is the level you have entered. Entering the dividend of an unusually generous year puts you on a taller bar than the company can sustain.',
        ),
        diem: d(
          'Mỗi chấm là giá trị cổ phiếu tính ở một mức của ô Cổ tức vừa trả (D0), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu mức cổ tức đổi mà tăng trưởng và suất sinh lợi yêu cầu đứng yên thì giá trị ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau: mô hình nhân cổ tức với một hệ số cố định do tăng trưởng và suất sinh lợi yêu cầu quyết định, nên mỗi đồng cổ tức thêm vào cộng vào giá trị cùng một số tiền.',
          'Each dot is the share value at one level of the Most recent dividend (D0) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the dividend with growth and required return held still, not market history. The row of dots rises in a straight line with even spacing: the model multiplies the dividend by a fixed factor set by growth and the required return, so each extra unit of dividend adds the same amount to the value.',
        ),
      },
      growth: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tăng trưởng cổ tức dài hạn (g), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tốc độ tăng trưởng đổi mà suất sinh lợi yêu cầu đứng yên thì giá trị cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc dần: tăng trưởng càng tiến gần suất sinh lợi yêu cầu thì mẫu số càng nhỏ, nên giá trị vọt lên rất nhanh ở đầu bên phải.',
          'The line runs left to right along the Long-term dividend growth (g) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on growth with the required return held still, not market history. The line rises and steepens: as growth closes in on the required return the denominator shrinks, so the value shoots up at the right-hand end.',
        ),
        cot: d(
          'Mỗi cột là giá trị cổ phiếu ở một mức tăng trưởng, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột bên phải cao vọt không có nghĩa cổ phiếu đáng giá ngần ấy: nó cho thấy mô hình phản ứng mạnh tới mức nào với giả định tăng trưởng.',
          'Each bar is the share value at one growth rate; bars grow taller to the right and the solid one is the rate you have entered. A towering bar on the right does not mean the share is worth that much: it shows how hard the model reacts to the growth assumption.',
        ),
        diem: d(
          'Mỗi chấm là giá trị cổ phiếu tính ở một mức của ô Tăng trưởng cổ tức dài hạn (g), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tốc độ tăng trưởng đổi mà suất sinh lợi yêu cầu đứng yên thì giá trị ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên, chấm sau cách chấm trước mỗi lúc một xa: tăng trưởng càng sát suất sinh lợi yêu cầu thì cùng một bước tăng thêm càng đẩy giá trị lên mạnh, nên ở các chấm bên phải, một sai số nhỏ trong giả định đã đáng rất nhiều tiền.',
          'Each dot is the share value at one level of the Long-term dividend growth (g) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on growth with the required return held still, not market history. The row of dots rises, each dot further above the last than the one before: the closer growth gets to the required return, the harder the same small step pushes the value, so among the dots on the right a tiny error in the assumption is worth a lot of money.',
        ),
      },
      requiredReturn: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Suất sinh lợi yêu cầu (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu bạn đòi mức sinh lợi khác thì giá trị cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: đòi sinh lợi càng cao thì dòng cổ tức tương lai càng mất giá, và đoạn dốc nhất nằm bên trái, nơi suất sinh lợi sát với tốc độ tăng trưởng.',
          'The line runs left to right along the Required rate of return (r) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the return you demand, not market history. The line falls and flattens: the more return you require, the less the future dividends are worth today, and the steepest stretch sits on the left where the required return is close to the growth rate.',
        ),
        cot: d(
          'Mỗi cột là giá trị cổ phiếu ở một mức suất sinh lợi yêu cầu, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Mấy cột bên trái cao vọt so với phần còn lại là lời nhắc: mô hình này rất dễ đổi kết quả khi hai giả định sát nhau.',
          'Each bar is the share value at one required return; bars shrink to the right and the solid one is the level you have entered. The few bars on the left towering over the rest are a reminder that this model swings hard when its two assumptions sit close together.',
        ),
        diem: d(
          'Mỗi chấm là giá trị cổ phiếu tính ở một mức của ô Suất sinh lợi yêu cầu (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu bạn đòi mức sinh lợi khác thì giá trị ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, mấy chấm đầu bên trái rơi những bước rất dài rồi các bước ngắn dần: ở đó suất sinh lợi gần tốc độ tăng trưởng nhất, hiệu giữa hai con số nhỏ nhất. Sang phải, đòi thêm cùng một bước sinh lợi chỉ làm giá trị hạ chút ít.',
          'Each dot is the share value at one level of the Required rate of return (r) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the return you demand, not market history. The row of dots falls, the first few on the left dropping in very long strides that then shorten: there the required return sits closest to the growth rate and the gap between them is smallest. Further right, asking for one more step of return lowers the value only slightly.',
        ),
      },
    },
  },

  'ddm-hai-giai-doan': {
    truc: {
      dividend: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Cổ tức vừa trả (D0), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mức cổ tức đổi mà các giả định tăng trưởng đứng yên thì giá trị cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cả hai giai đoạn đều khởi đi từ khoản cổ tức vừa trả, nên nó lớn hơn bao nhiêu phần thì giá trị cổ phiếu lớn hơn bấy nhiêu phần.',
          'The line runs left to right along the Most recent dividend (D0) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the dividend with the growth assumptions held still, not market history. The line rises steadily: both stages start from the dividend just paid, so the share value scales with it in exact proportion.',
        ),
        cot: d(
          'Mỗi cột là giá trị cổ phiếu theo hai giai đoạn ở một mức cổ tức, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Các cột cách đều nhau: cổ tức gốc chỉ nhân cả dòng tiền lên theo tỷ lệ, không làm đổi hình dạng của nó.',
          'Each bar is the two-stage share value at one dividend level; bars grow taller to the right and the solid one is the level you have entered. The bars are evenly spaced: the starting dividend only scales the whole stream of payments, it does not change its shape.',
        ),
        diem: d(
          'Mỗi chấm là giá trị cổ phiếu theo hai giai đoạn, tính ở một mức của ô Cổ tức vừa trả (D0), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu mức cổ tức đổi mà các giả định tăng trưởng đứng yên thì giá trị ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, các chấm cách nhau cùng một khoảng: mỗi đồng cổ tức vừa trả thêm vào được nhân với cùng một hệ số, gom từ mọi năm của giai đoạn đầu lẫn phần dài hạn.',
          'Each dot is the two-stage share value at one level of the Most recent dividend (D0) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the dividend with the growth assumptions held still, not market history. The row of dots rises with a fixed gap between neighbors: each extra unit of the dividend just paid is multiplied by one and the same factor, gathered from every first-stage year and the long-run part alike.',
        ),
      },
      growthStage1: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tăng trưởng giai đoạn đầu (g1), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tốc độ tăng của những năm đầu đổi thì giá trị cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và hơi dốc dần: cổ tức tăng nhanh hơn trong giai đoạn đầu không chỉ làm các năm ấy lớn hơn mà còn nâng cả điểm xuất phát của giai đoạn dài hạn phía sau.',
          'The line runs left to right along the First-stage growth (g1) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on growth in the early years, not market history. The line rises and steepens slightly: faster early growth not only enlarges those years’ dividends, it also raises the starting point of the long-term stage that follows.',
        ),
        cot: d(
          'Mỗi cột là giá trị cổ phiếu ở một mức tăng trưởng giai đoạn đầu, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Khoảng cách giữa các cột cho biết bạn đang trả thêm bao nhiêu cho mỗi bậc kỳ vọng tăng trưởng.',
          'Each bar is the share value at one first-stage growth rate; bars grow taller to the right and the solid one is the rate you have entered. The spacing between bars shows how much extra you are paying for each step of growth you expect.',
        ),
        diem: d(
          'Mỗi chấm là giá trị cổ phiếu tính ở một mức của ô Tăng trưởng giai đoạn đầu (g1), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tốc độ tăng của những năm đầu đổi thì giá trị ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên, chấm sau cách chấm trước xa hơn một chút: tăng trưởng giai đoạn đầu nhân dồn qua từng năm và còn nâng cả điểm xuất phát của phần dài hạn, nên mỗi bước kỳ vọng thêm vào đáng giá hơn bước trước.',
          'Each dot is the share value at one level of the First-stage growth (g1) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on growth in the early years, not market history. The row of dots rises, each dot a little further above the last: first-stage growth compounds year after year and also lifts the starting point of the long-run part, so each extra step of expected growth is worth more than the one before.',
        ),
      },
      years: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số năm giai đoạn đầu (n), từ khoảng một nửa đến khoảng gấp rưỡi số năm bạn đang nhập, mỗi điểm cách nhau một năm; vạch đứt dọc có chấm tròn là đúng số năm bạn nhập. Đây là phép thử nếu giai đoạn tăng nhanh kéo dài hay ngắn lại thì giá trị cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Khi giai đoạn đầu tăng nhanh hơn dài hạn, đường đi lên: mỗi năm tăng nhanh thêm vào là thêm một năm cổ tức lớn và một điểm xuất phát cao hơn cho giai đoạn dài hạn. Nhập tăng trưởng giai đoạn đầu thấp hơn tăng trưởng dài hạn thì đường đi xuống.',
          'The line runs left to right along the Length of the first stage in years (n) field, from about half to about one and a half times the number of years you have entered, one point per year; the dashed vertical line with a dot marks your own figure. It is a what-if on how long the fast-growth stage lasts, not market history. When the first stage grows faster than the long term, the line rises: each extra year of fast growth adds one more large dividend and a higher starting point for the long-term stage. With first-stage growth entered below long-term growth, the line falls.',
        ),
        cot: d(
          'Mỗi cột là giá trị cổ phiếu ứng với một độ dài của giai đoạn đầu, cột tô đặc là số năm bạn đang nhập. Khi giai đoạn đầu tăng nhanh hơn dài hạn, cột cao dần về bên phải, và bước từ cột này sang cột kế là giá của việc tin rằng doanh nghiệp tăng nhanh thêm một năm; giai đoạn đầu tăng chậm hơn dài hạn thì cột thấp dần. Chỉ có vài cột vì ô này nhận số năm tròn.',
          'Each bar is the share value for one length of the first stage, and the solid one is the number of years you have entered. When the first stage grows faster than the long term the bars grow taller to the right, and the step from one bar to the next is the price of believing in one more year of fast growth; when it grows more slowly they shrink. There are only a few bars because the field takes whole years.',
        ),
        diem: d(
          'Mỗi chấm là giá trị cổ phiếu ứng với một số năm tròn của ô Số năm giai đoạn đầu (n), từ khoảng một nửa đến khoảng gấp rưỡi số năm bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng số năm bạn nhập. Đây là phép thử nếu giai đoạn tăng nhanh dài hay ngắn hơn thì giá trị ra bao nhiêu, không phải diễn biến thị trường. Chỉ có vài chấm vì không có năm lẻ. Khi giai đoạn đầu tăng nhanh hơn dài hạn, dãy chấm đi lên: mỗi chấm sang phải là thêm một năm cổ tức tăng nhanh trước khi chậm lại; nhập tăng trưởng giai đoạn đầu thấp hơn dài hạn thì dãy chấm đi xuống.',
          'Each dot is the share value for one whole number of years in the Length of the first stage in years (n) field, from about half to about one and a half times the years you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on how long the fast-growth stage lasts, not market history. There are only a few dots, as there are no fractional years. When the first stage grows faster than the long term the row of dots rises, each dot to the right adding one more year of fast growth before the slowdown; with first-stage growth below long-term growth it falls.',
        ),
        bac: d(
          'Mỗi bậc là giá trị cổ phiếu ứng với một số năm tròn của ô Số năm giai đoạn đầu (n), từ khoảng một nửa đến khoảng gấp rưỡi số năm bạn đang nhập: bậc giữ nằm ngang tới năm kế tiếp rồi mới nhảy, vì phép tính làm tròn số năm, không có giai đoạn nào dài nửa năm. Đây là phép thử, không phải diễn biến thị trường. Khi giai đoạn đầu tăng nhanh hơn dài hạn, cầu thang đi lên, bậc nhảy cao dần nếu tăng trưởng giai đoạn đầu còn vượt suất sinh lợi yêu cầu và thấp dần nếu thấp hơn; tăng trưởng giai đoạn đầu thấp hơn dài hạn thì cầu thang đi xuống.',
          'Each step is the share value for one whole number of years in the Length of the first stage in years (n) field, from about half to about one and a half times the years you have entered: it stays level until the next year, then jumps, because the calculation rounds the years and no stage lasts half a year. It is a what-if, not market history. When the first stage grows faster than the long term the staircase rises, its jumps growing taller if first-stage growth also beats the required return and shorter if it is lower; with first-stage growth below long-term growth the staircase falls.',
        ),
      },
      growthTerminal: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tăng trưởng dài hạn (g2), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tốc độ tăng trưởng mãi mãi về sau đổi thì giá trị cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc dần: phần giá trị nằm ở giai đoạn dài hạn chia cho khoảng cách giữa suất sinh lợi yêu cầu và tốc độ này, nên càng sát nhau thì giá trị càng phình ra.',
          'The line runs left to right along the Long-term growth (g2) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the growth rate assumed forever after, not market history. The line rises and steepens: the value held in the long-term stage is divided by the gap between the required return and this rate, so the closer the two get, the more the value swells.',
        ),
        cot: d(
          'Mỗi cột là giá trị cổ phiếu ở một mức tăng trưởng dài hạn, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Khi giai đoạn đầu chỉ dài vài năm, một điểm phần trăm thêm vào tăng trưởng mãi mãi nặng hơn hẳn một điểm phần trăm thêm vào những năm đầu ấy, nên đây là giả định cần dè dặt nhất.',
          'Each bar is the share value at one long-term growth rate; bars grow taller to the right and the solid one is the rate you have entered. When the first stage lasts only a few years, one more percentage point of growth forever weighs far more than one more point in those early years, so this is the assumption to be most cautious about.',
        ),
        diem: d(
          'Mỗi chấm là giá trị cổ phiếu tính ở một mức của ô Tăng trưởng dài hạn (g2), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tốc độ tăng mãi mãi về sau đổi thì giá trị ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên, khoảng cách giữa hai chấm kề nhau nới rộng dần về bên phải: phần dài hạn được chia cho hiệu giữa suất sinh lợi yêu cầu và tốc độ này, hiệu ấy càng hẹp thì mỗi bước tăng trưởng thêm vào càng nặng ký.',
          'Each dot is the share value at one level of the Long-term growth (g2) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the growth rate assumed forever after, not market history. The row of dots rises, the gap between neighbors widening toward the right: the long-run part is divided by the spread between the required return and this rate, and the narrower that spread, the more each extra step of growth weighs.',
        ),
      },
      requiredReturn: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Suất sinh lợi yêu cầu (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu bạn đòi mức sinh lợi khác thì giá trị cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: cả cổ tức giai đoạn đầu lẫn giá trị cuối kỳ đều bị chiết khấu nặng hơn khi suất sinh lợi tăng, và phần giá trị cuối kỳ co lại nhanh nhất.',
          'The line runs left to right along the Required rate of return (r) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the return you demand, not market history. The line falls and flattens: both the first-stage dividends and the terminal value are discounted harder as the required return goes up, and the terminal value shrinks fastest.',
        ),
        cot: d(
          'Mỗi cột là giá trị cổ phiếu ở một mức suất sinh lợi yêu cầu, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Độ chênh giữa hai cột cạnh nhau là cái giá của việc đòi sinh lợi cao thêm một nấc.',
          'Each bar is the share value at one required return; bars shrink to the right and the solid one is the level you have entered. The drop between two neighboring bars is the cost of demanding one more notch of return.',
        ),
        diem: d(
          'Mỗi chấm là giá trị cổ phiếu theo hai giai đoạn, tính ở một mức của ô Suất sinh lợi yêu cầu (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu bạn đòi mức sinh lợi khác thì giá trị ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, các bước hụt dài ở bên trái rồi ngắn dần về bên phải: suất sinh lợi tăng thì phần dài hạn co lại nhanh hơn hẳn cổ tức giai đoạn đầu, và co mạnh nhất ở bên trái, nơi suất sinh lợi còn gần tăng trưởng dài hạn.',
          'Each dot is the two-stage share value at one level of the Required rate of return (r) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the return you demand, not market history. The row of dots falls in long drops on the left that shorten toward the right: as the required return goes up, the long-run part shrinks much faster than the first-stage dividends, and hardest on the left, where the return is still close to long-term growth.',
        ),
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. Phần giai đoạn đầu và Phần dài hạn là hai thanh tô màu cộng lại với nhau; thanh sẫm cuối cùng là Giá trị cổ phiếu và bằng đúng con số ở khối Kết quả. Thanh thứ hai thường dài hơn hẳn thanh đầu: phần lớn giá trị nằm ở quãng sau những năm tăng trưởng nhanh, tức ở giả định xa nhất và khó kiểm chứng nhất.',
      'This chart has a single form: horizontal bars, read from top to bottom. First-stage part and Long-run part are two filled bars that add together; the dark bar at the end is Share value and matches the figure in the Result block exactly. The second bar is usually far longer than the first: most of the value lies beyond the fast-growth years, in the most distant and least checkable assumption.',
    ),
    vanhKhuyen: d(
      'Vành khuyên chia Giá trị cổ phiếu thành hai múi: Phần giai đoạn đầu là cổ tức những năm tăng nhanh tính về hôm nay, Phần dài hạn là mọi năm sau đó gộp lại. Mỗi múi to theo phần nó chiếm, chú giải cạnh vòng in giá trị và phần chiếm của từng múi, lỗ giữa in tổng; rê chuột hay chạm một múi là hiện tên và giá trị múi ấy. Múi Phần dài hạn thường lấn phần lớn vòng; giai đoạn đầu càng dài, hay tăng trưởng dài hạn càng thấp so với suất sinh lợi yêu cầu, thì múi Phần giai đoạn đầu càng to. Cổ tức vừa trả không làm đổi tỉ phần hai múi.',
      'The donut splits Share value into two slices: First-stage part is the dividends of the fast-growth years valued today, Long-run part is every year after that rolled into one. Each slice is sized by its share, the legend beside the ring gives each slice’s value and share, and the hole shows the total; hovering over or tapping a slice shows its name and value. The Long-run part slice usually takes most of the ring; a longer first stage, or long-term growth further below the required return, makes the First-stage part slice bigger. The dividend just paid does not change the split.',
    ),
  },

  capm: {
    truc: {
      riskFree: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lãi suất phi rủi ro (rf), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất phi rủi ro đổi mà beta và phần bù rủi ro đứng yên thì chi phí vốn chủ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: lãi suất phi rủi ro là mức sàn của mọi khoản đầu tư, nên nó nhích lên bao nhiêu thì suất sinh lợi cổ đông đòi hỏi nhích lên đúng bấy nhiêu.',
          'The line runs left to right along the Risk-free rate (rf) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the risk-free rate with beta and the risk premium held still, not market history. The line rises steadily: the risk-free rate is the floor under every investment, so each move in it passes straight into the return shareholders require.',
        ),
        cot: d(
          'Mỗi cột là chi phí vốn chủ ở một mức lãi suất phi rủi ro, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Phần cột nằm trên chính mức lãi suất ấy không đổi từ cột này sang cột khác: đó là phần bù cho rủi ro, bằng beta nhân phần bù thị trường.',
          'Each bar is the cost of equity at one risk-free rate; bars grow taller to the right and the solid one is the rate you have entered. The part of each bar above the rate itself never changes from bar to bar: it is the reward for risk, beta times the market premium.',
        ),
        diem: d(
          'Mỗi chấm là chi phí vốn chủ tính ở một mức của ô Lãi suất phi rủi ro (rf), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lãi suất phi rủi ro đổi mà beta và phần bù rủi ro đứng yên thì chi phí vốn chủ ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành một hàng thẳng, các chấm cách đều nhau: từ chấm này sang chấm kế, chi phí vốn chủ tăng đúng bằng phần lãi suất tăng thêm, vì phần bù cho rủi ro không đổi.',
          'Each dot is the cost of equity at one level of the Risk-free rate (rf) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the risk-free rate with beta and the risk premium held still, not market history. The row of dots rises in a straight, evenly spaced line: from one dot to the next, the cost of equity climbs by exactly the extra risk-free rate, because the reward for risk stays the same.',
        ),
      },
      beta: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Hệ số beta (β), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu beta đổi thì chi phí vốn chủ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cổ phiếu càng dao động mạnh hơn thị trường thì cổ đông càng đòi sinh lợi cao để bù rủi ro, và độ dốc của đường chính là phần bù rủi ro thị trường.',
          'The line runs left to right along the Beta coefficient (β) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on beta, not market history. The line rises steadily: the more a share swings relative to the market, the more return shareholders require for the risk, and the slope of the line is the market risk premium itself.',
        ),
        cot: d(
          'Mỗi cột là chi phí vốn chủ ở một mức beta, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Phần chân chung của mọi cột là lãi suất phi rủi ro; phần cao thêm là thứ beta mang lại.',
          'Each bar is the cost of equity at one beta; bars grow taller to the right and the solid one is the level you have entered. The base shared by every bar is the risk-free rate; the extra height is what beta adds.',
        ),
        diem: d(
          'Mỗi chấm là chi phí vốn chủ tính ở một mức của ô Hệ số beta (β), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu beta đổi thì chi phí vốn chủ ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên đều, mỗi chấm cao hơn chấm bên trái cùng một khoảng: phần bù rủi ro thị trường nhân với đoạn beta tăng thêm. Các chấm nằm bên phải mức beta bằng một là cổ phiếu dao động mạnh hơn cả thị trường, nên bị đòi sinh lợi cao hơn mức kỳ vọng của thị trường.',
          'Each dot is the cost of equity at one level of the Beta coefficient (β) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on beta, not market history. The row of dots rises steadily, each dot the same distance above the one to its left: the market risk premium times the extra beta. Dots to the right of a beta of one are shares that swing more than the market, so they are asked to earn more than the market’s expected return.',
        ),
      },
      erp: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Phần bù rủi ro thị trường (ERP), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu phần bù rủi ro đổi mà lãi suất phi rủi ro và beta đứng yên thì chi phí vốn chủ ra bao nhiêu, không phải diễn biến thị trường. Với beta dương, đường đi lên đều, beta càng lớn thì càng dốc: mỗi điểm phần bù thêm vào đẩy chi phí vốn lên càng mạnh. Beta âm thì đường đi xuống: cổ phiếu đi ngược thị trường là một kiểu bảo hiểm, nên phần bù càng cao thì nó càng bị đòi ít sinh lợi.',
          'The line runs left to right along the Equity risk premium (ERP) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the risk premium with the risk-free rate and beta held still, not market history. With a positive beta the line rises steadily, steeper for a larger beta: each extra point of premium then pushes the cost of equity up harder. With a negative beta the line falls: a share moving against the market works like insurance, so a higher premium lowers its required return.',
        ),
        cot: d(
          'Mỗi cột là chi phí vốn chủ ở một mức phần bù rủi ro, cột tô đặc là mức bạn đang nhập. Với beta dương, cột cao dần về bên phải; beta âm thì cột thấp dần. Phần bù rủi ro không tra được ở bảng giá nào mà phải ước lượng, nên hãy nhìn cả dãy cột như khoảng có thể xảy ra chứ không riêng một cột.',
          'Each bar is the cost of equity at one risk premium, and the solid one is the premium you have entered. With a positive beta the bars grow taller to the right; with a negative beta they shrink. The premium cannot be read off any price board and has to be estimated, so look at the whole row of bars as a plausible range, not at one bar alone.',
        ),
        diem: d(
          'Mỗi chấm là chi phí vốn chủ tính ở một mức của ô Phần bù rủi ro thị trường (ERP), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu phần bù rủi ro đổi mà lãi suất phi rủi ro và beta đứng yên thì chi phí vốn chủ ra bao nhiêu, không phải diễn biến thị trường. Với beta dương, dãy chấm đi lên, mỗi chấm cao hơn chấm trước đúng beta lần đoạn phần bù tăng thêm, nên beta càng lớn thì mỗi bước đẩy chi phí vốn chủ lên càng nhiều. Beta âm thì dãy chấm đi xuống; beta bằng 0 thì mọi chấm đứng cùng một mức, đúng bằng lãi suất phi rủi ro.',
          'Each dot is the cost of equity at one level of the Equity risk premium (ERP) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the risk premium with the risk-free rate and beta held still, not market history. With a positive beta the row of dots rises steadily, each dot above the last by beta times the extra premium, so a larger beta makes every step lift the cost of equity more. With a negative beta the row falls; with a beta of 0 every dot sits at the risk-free rate itself.',
        ),
      },
    },
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Lãi phi rủi ro (rf) rồi Phần bù (β × ERP) cộng lại thành thanh sẫm cuối cùng, Chi phí VCSH (re), bằng đúng con số ở khối Kết quả. Thanh Phần bù (β × ERP) càng dài thì cổ đông đang đòi phần thưởng cho rủi ro cổ phiếu lớn hơn hẳn mức sàn lãi phi rủi ro, chứ không chỉ là khoản bù cho việc giữ tiền theo thời gian.',
        'Each horizontal bar is one part, read from top to bottom: Risk-free rate (rf) then Premium (β × ERP) add up to the dark bar at the end, Cost of equity (re), matching the figure in the Result block exactly. The longer the Premium (β × ERP) bar, the more that required return is a reward for stock risk rather than just the floor rate for holding money over time.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Chi phí VCSH (re) thành hai múi, Lãi phi rủi ro (rf) và Phần bù (β × ERP), mỗi múi to theo phần nó chiếm trong chi phí vốn chủ. Lỗ giữa in Chi phí VCSH (re) cùng giá trị của nó, bằng đúng con số ở khối Kết quả; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Phần bù (β × ERP) càng lớn thì mức sinh lợi cổ đông đòi hỏi càng nằm nhiều ở phần thưởng cho rủi ro cổ phiếu, chứ không phải ở mức sàn lãi phi rủi ro.',
        'The ring splits Cost of equity (re) into two slices, Risk-free rate (rf) and Premium (β × ERP), each sized by its share of the cost of equity. The hole shows Cost of equity (re) and its value, the figure in the Result block; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The bigger the Premium (β × ERP) slice, the more of that required return comes from a reward for stock risk rather than the risk-free floor.',
      ),
    },
  },

  wacc: {
    truc: {
      equity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn hoá thị trường (E), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lượng vốn chủ đổi mà nợ vay và hai mức chi phí vốn đứng yên thì WACC ra bao nhiêu, không phải diễn biến thị trường. Khi vốn chủ đắt hơn nợ vay sau thuế, đường đi lên nhưng thoải dần: tỷ trọng vốn chủ càng lớn thì chi phí vốn bình quân càng nhích về phía chi phí vốn chủ. Khi nợ vay sau thuế đắt hơn thì đường đi xuống, vì thêm vốn chủ là thêm nguồn vốn rẻ hơn.',
          'The line runs left to right along the Market capitalization (E) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the amount of equity with debt and both costs of capital held still, not market history. When equity costs more than after-tax debt the line rises but flattens: the larger equity’s weight, the closer the blended cost drifts toward the cost of equity. When after-tax debt costs more the line falls, because more equity means more of the cheaper funding.',
        ),
        cot: d(
          'Mỗi cột là WACC ở một mức vốn chủ, cột tô đặc là mức bạn đang nhập. Khi vốn chủ đắt hơn nợ vay sau thuế, cột cao dần về bên phải và tiến tới chi phí vốn chủ mà không vượt nó: đó là mức của một doanh nghiệp không vay đồng nào. Khi nợ vay sau thuế đắt hơn thì cột thấp dần về mức ấy.',
          'Each bar is WACC at one equity level, and the solid one is the level you have entered. When equity costs more than after-tax debt the bars grow taller to the right and creep toward the cost of equity without passing it: that is the level of a company that borrows nothing. When after-tax debt costs more the bars shrink toward that same level.',
        ),
        diem: d(
          'Mỗi chấm là WACC tính ở một mức của ô Vốn hoá thị trường (E), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lượng vốn chủ đổi mà nợ vay và hai mức chi phí vốn đứng yên thì WACC ra bao nhiêu, không phải diễn biến thị trường. Khi vốn chủ đắt hơn nợ vay sau thuế, dãy chấm đi lên và các chấm sát nhau dần về bên phải: mỗi phần vốn chủ thêm vào kéo WACC về phía chi phí vốn chủ một đoạn ngắn hơn phần trước. Khi nợ vay sau thuế đắt hơn, dãy chấm đi xuống, cũng sát dần như thế.',
          'Each dot is WACC at one level of the Market capitalization (E) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the amount of equity with debt and both costs of capital held still, not market history. When equity costs more than after-tax debt the row of dots rises and the dots crowd closer together to the right: each extra amount of equity pulls WACC a shorter way toward the cost of equity than the one before. When after-tax debt costs more, the row falls, crowding together the same way.',
        ),
      },
      debt: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Nợ vay (D), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lượng nợ vay đổi mà vốn chủ và hai mức chi phí vốn đứng yên thì WACC ra bao nhiêu, không phải diễn biến thị trường. Khi nợ vay sau thuế rẻ hơn vốn chủ, đường đi xuống và thoải dần: tỷ trọng nợ càng lớn thì chi phí vốn bình quân càng thấp. Khi nợ vay sau thuế đắt hơn vốn chủ thì đường đi lên.',
          'The line runs left to right along the Debt (D) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the amount of debt with equity and both costs of capital held still, not market history. When after-tax debt is cheaper than equity the line falls and flattens: a larger weight of debt lowers the blended cost. When after-tax debt costs more than equity the line rises.',
        ),
        cot: d(
          'Mỗi cột là WACC ở một mức nợ vay, cột tô đặc là mức bạn đang nhập. Khi nợ vay sau thuế rẻ hơn vốn chủ, cột thấp dần về bên phải; đắt hơn thì cột cao dần. Đừng đọc các cột thấp như lời khuyên vay thêm: phép tính giữ nguyên chi phí của từng nguồn vốn, trong khi ngoài đời nợ dày lên thì cả chủ nợ lẫn cổ đông đều đòi lãi cao hơn.',
          'Each bar is WACC at one debt level, and the solid one is the level you have entered. When after-tax debt is cheaper than equity the bars shrink to the right; when it costs more they grow taller. Do not read the short bars as advice to borrow more: the calculation keeps each source’s cost fixed, whereas in real life lenders and shareholders both ask for more as debt piles up.',
        ),
        diem: d(
          'Mỗi chấm là WACC tính ở một mức của ô Nợ vay (D), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lượng nợ vay đổi mà vốn chủ và hai mức chi phí vốn đứng yên thì WACC ra bao nhiêu, không phải diễn biến thị trường. Khi nợ vay sau thuế rẻ hơn vốn chủ, dãy chấm đi xuống và các chấm sát nhau dần về bên phải: nợ đã chiếm càng nhiều phần thì mỗi đồng vay thêm hạ WACC càng ít. Khi nợ vay sau thuế đắt hơn vốn chủ, dãy chấm đi lên, cũng sát dần như thế.',
          'Each dot is WACC at one level of the Debt (D) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the amount of debt with equity and both costs of capital held still, not market history. When after-tax debt is cheaper than equity the row of dots falls and the dots crowd together to the right: the bigger debt’s share already is, the less each extra unit borrowed lowers WACC. When after-tax debt costs more than equity the row rises, crowding together the same way.',
        ),
      },
      costEquity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chi phí vốn chủ (re), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu chi phí vốn chủ đổi thì WACC ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều nhưng không tăng một đổi một: vốn chủ chỉ là một phần nguồn vốn, nên chi phí vốn chủ tăng một điểm thì WACC tăng chưa tới một điểm.',
          'The line runs left to right along the Cost of equity (re) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the cost of equity, not market history. The line rises steadily but less than one for one: equity is only part of the funding, so one more point of equity cost adds less than a point to WACC.',
        ),
        cot: d(
          'Mỗi cột là WACC ở một mức chi phí vốn chủ, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột thấp hơn là vốn rẻ hơn, và vốn rẻ hơn làm mọi dòng tiền tương lai đáng giá hơn khi chiết khấu.',
          'Each bar is WACC at one cost of equity; bars grow taller to the right and the solid one is the level you have entered. A shorter bar means cheaper capital, and cheaper capital makes every future cash flow worth more once discounted.',
        ),
        diem: d(
          'Mỗi chấm là WACC tính ở một mức của ô Chi phí vốn chủ (re), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu chi phí vốn chủ đổi thì WACC ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau, nhưng mỗi chấm chỉ cao hơn chấm trước một phần của bước chi phí vốn chủ: đúng bằng tỷ trọng vốn chủ trong tổng vốn, vì chỉ phần vốn ấy chịu mức chi phí này.',
          'Each dot is WACC at one level of the Cost of equity (re) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the cost of equity, not market history. The row of dots rises in a straight, evenly spaced line, yet each dot sits only a fraction of the equity-cost step above the last: exactly equity’s weight in total capital, since only that part of the funding carries this cost.',
        ),
      },
      costDebt: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chi phí nợ vay (rd), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi suất đi vay đổi thì WACC ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều nhưng không tăng một đổi một: lãi vay chỉ tính trên phần nợ, và sau khi trừ lá chắn thuế thì mỗi điểm lãi suất thêm vào chỉ lọt một phần xuống chi phí vốn bình quân.',
          'The line runs left to right along the Cost of debt (rd) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the borrowing rate, not market history. The line rises steadily but less than one for one: interest applies only to the debt portion, and after the tax shield only part of each extra point reaches the blended cost.',
        ),
        cot: d(
          'Mỗi cột là WACC ở một mức chi phí nợ vay, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Bước từ cột này sang cột kế nhỏ hơn hẳn bước lãi suất tương ứng, vì lãi vay chỉ tính trên phần nợ và thuế còn gánh hộ thêm một phần.',
          'Each bar is WACC at one cost of debt; bars grow taller to the right and the solid one is the rate you have entered. The step from one bar to the next is much smaller than the matching step in the rate, because interest applies only to the debt portion and tax absorbs part of what is left.',
        ),
        diem: d(
          'Mỗi chấm là WACC tính ở một mức của ô Chi phí nợ vay (rd), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lãi suất đi vay đổi thì WACC ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau, nhưng từ chấm này sang chấm kế WACC chỉ tăng một phần của bước lãi suất: bước ấy bị thu nhỏ hai lần, theo tỷ trọng nợ trong tổng vốn rồi theo phần còn lại sau thuế.',
          'Each dot is WACC at one level of the Cost of debt (rd) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the borrowing rate, not market history. The row of dots rises in a straight, evenly spaced line, but from one dot to the next WACC gains only part of the step in the rate: that step is scaled down twice, by debt’s weight in total capital and then by what is left after tax.',
        ),
      },
      taxRate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thuế suất thuế TNDN (t), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu thuế suất đổi thì WACC ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều, và các mức ghi trên trục dọc cho thấy cả đường chỉ hạ một khoảng hẹp: lãi vay được trừ trước khi tính thuế, nên thuế suất càng cao thì phần lãi nhà nước gánh hộ càng lớn và chi phí nợ sau thuế càng thấp.',
          'The line runs left to right along the Corporate income tax rate (t) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the tax rate, not market history. The line falls steadily, and the levels on the vertical axis show that it drops only a narrow span: interest is deducted before tax, so the higher the tax rate, the more of the interest the state effectively pays and the lower the after-tax cost of debt.',
        ),
        cot: d(
          'Mỗi cột là WACC ở một mức thuế suất, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Các cột gần bằng nhau: thuế chỉ chạm vào phần nợ, nên doanh nghiệp vay càng ít thì dãy cột càng phẳng.',
          'Each bar is WACC at one tax rate; bars shrink to the right and the solid one is the rate you have entered. The bars are nearly level: tax touches only the debt portion, so the less a company borrows, the more even the row.',
        ),
        diem: d(
          'Mỗi chấm là WACC tính ở một mức của ô Thuế suất thuế TNDN (t), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu thuế suất đổi thì WACC ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống thành hàng thẳng, các chấm cách đều nhau: mỗi điểm thuế suất thêm vào làm lá chắn thuế của lãi vay dày thêm cùng một phần. Các mức ghi trên trục dọc cho thấy chấm cao nhất và thấp nhất thường chỉ cách nhau một khoảng hẹp, càng hẹp khi doanh nghiệp vay càng ít.',
          'Each dot is WACC at one level of the Corporate income tax rate (t) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the tax rate, not market history. The row of dots falls in a straight, evenly spaced line: every extra point of tax thickens the interest tax shield by the same amount. The levels on the vertical axis show the highest and lowest dots are usually only a narrow span apart, narrower still the less the company borrows.',
        ),
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. Phần vốn chủ và Phần nợ vay là hai thanh tô màu cộng lại với nhau, mỗi thanh đã nhân sẵn tỷ trọng của nguồn vốn ấy và phần nợ đã trừ lá chắn thuế; thanh sẫm cuối cùng là WACC và bằng đúng con số ở khối Kết quả. Thanh nào dài hơn là nguồn vốn ấy đang gánh phần lớn chi phí vốn của doanh nghiệp.',
      'This chart has a single form: horizontal bars, read from top to bottom. Equity portion and Debt portion are two filled bars that add together, each already multiplied by that source’s weight and the debt one already net of the tax shield; the dark bar at the end is WACC and matches the figure in the Result block exactly. The longer bar is the funding source carrying most of the company’s cost of capital.',
    ),
    vanhKhuyen: d(
      'Vòng tròn chia WACC thành hai múi, Phần vốn chủ và Phần nợ vay, mỗi múi đã nhân sẵn tỷ trọng của nguồn vốn ấy và múi nợ đã trừ lá chắn thuế. Lỗ giữa in WACC cùng giá trị của nó, bằng đúng con số ở khối Kết quả; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, còn rê chuột hay chạm một múi thì hiện tên và giá trị của múi ấy. Múi to hơn là nguồn vốn gánh phần lớn chi phí vốn. Đừng đọc múi thành tỷ trọng vốn: khi nợ vay sau thuế rẻ hơn vốn chủ, múi Phần nợ vay nhỏ hơn phần nợ chiếm trong tổng vốn.',
      'The ring splits WACC into two slices, Equity portion and Debt portion, each already multiplied by that source’s weight, the debt one net of the tax shield. The hole shows WACC and its value, the figure in the Result block; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The larger slice is the source carrying most of the cost of capital. Do not read a slice as a weight in capital: when after-tax debt is cheaper than equity, the Debt portion slice is smaller than debt’s share of total capital.',
    ),
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Vốn hoá (E) rồi Nợ vay (D) cộng lại thành thanh sẫm cuối cùng, Tổng vốn (E+D), bằng đúng số tiền hai ô Vốn hoá và Nợ vay cộng vào, không phải con số WACC ở khối Kết quả. Thanh nào dài hơn là nguồn vốn ấy đang chiếm phần lớn hơn trong tổng vốn công ty, bất kể chi phí huy động của nó cao hay thấp.',
        'Each horizontal bar is one part, read from top to bottom: Market cap (E) then Debt (D) add up to the dark bar at the end, Total capital (E+D), the sum of the two amounts entered in those two fields, not the WACC percentage shown in the Result block. The longer bar is the funding source making up the larger share of total capital, whatever that source’s own cost of capital happens to be.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Tổng vốn (E+D) thành hai múi, Vốn hoá (E) và Nợ vay (D), mỗi múi to theo phần nó chiếm trong tổng vốn công ty đang dùng. Lỗ giữa in Tổng vốn (E+D) cùng giá trị của nó, bằng đúng số tiền hai ô Vốn hoá và Nợ vay cộng vào, không phải con số WACC ở khối Kết quả; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Nợ vay (D) càng lớn thì công ty càng dùng nhiều vốn vay hơn vốn cổ đông để tài trợ cho tài sản của mình, bất kể lúc đó nguồn vốn nào đang rẻ hơn.',
        'The ring splits Total capital (E+D) into two slices, Market cap (E) and Debt (D), each sized by its share of the capital the company uses. The hole shows Total capital (E+D) and its value, the sum of those two amounts, not the WACC percentage in the Result block; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The bigger the Debt (D) slice, the more the company funds itself with borrowed money rather than shareholders’ money.',
      ),
    },
  },

  fcff: {
    truc: {
      ebit: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Lợi nhuận trước lãi vay và thuế (EBIT), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu EBIT đổi mà khấu hao, chi đầu tư và vốn lưu động đứng yên thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: mỗi đồng EBIT thêm vào để lại cho dòng tiền tự do đúng phần còn lại sau thuế.',
          'The line runs left to right along the Earnings before interest and tax (EBIT) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on EBIT with depreciation, capital spending and working capital held still, not market history. The line rises steadily: each extra unit of EBIT leaves free cash flow with exactly its after-tax remainder.',
        ),
        cot: d(
          'Mỗi cột là FCFF ở một mức EBIT, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột thấp hơn hẳn mức EBIT của chính nó là bình thường: thuế, chi đầu tư và vốn lưu động đã lấy đi một phần trước khi tiền thành tự do.',
          'Each bar is FCFF at one EBIT level; bars grow taller to the right and the solid one is the level you have entered. A bar well below its own EBIT is normal: tax, capital spending and working capital have taken their share before the cash becomes free.',
        ),
        diem: d(
          'Mỗi chấm là FCFF tính ở một mức của ô Lợi nhuận trước lãi vay và thuế (EBIT), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu EBIT đổi mà khấu hao, chi đầu tư và vốn lưu động đứng yên thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau: từ chấm này sang chấm kế, FCFF chỉ tăng thêm phần sau thuế của đoạn EBIT tăng thêm, vì ba khoản kia không đổi theo.',
          'Each dot is FCFF at one level of the Earnings before interest and tax (EBIT) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on EBIT with depreciation, capital spending and working capital held still, not market history. The row of dots rises in a straight, evenly spaced line: from one dot to the next, FCFF gains only the after-tax part of the extra EBIT, since the other three items do not move with it.',
        ),
        laiLo: d(
          'Dạng này hiện khi FCFF đổi dấu ngay trong dải của ô Lợi nhuận trước lãi vay và thuế (EBIT): ở đầu trái, EBIT sau thuế chưa đủ trả chi đầu tư và vốn lưu động tăng thêm sau khi trừ khấu hao, ở đầu phải thì dư. Phần trên vạch 0 tô xanh là tiền còn lại cho chủ nợ và cổ đông; phần dưới vạch 0 tô đỏ là kỳ tiêu nhiều hơn làm ra, dù lãi trên sổ có thể vẫn dương. Đây là phép thử nếu EBIT đổi thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều, cắt vạch 0 ở mức EBIT vừa đủ trả khoản tái đầu tư ấy.',
          'This form appears when FCFF changes sign within the range of the Earnings before interest and tax (EBIT) field: at the left end, after-tax EBIT does not cover capital spending plus the rise in working capital net of depreciation; at the right end it does. Above the zero line the area is shaded green, cash left for lenders and shareholders; below it is shaded red, a period that spends more than it brings in, even if the books show a profit. It is a what-if on EBIT, not market history. The line rises steadily and crosses the zero line at the EBIT that just covers that reinvestment.',
        ),
      },
      taxRate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thuế suất thuế TNDN (t), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu thuế suất đổi thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: thuế tính trên EBIT, nên thuế suất tăng một điểm thì dòng tiền tự do mất đúng một phần trăm của EBIT.',
          'The line runs left to right along the Corporate income tax rate (t) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the tax rate, not market history. The line falls steadily: tax is charged on EBIT, so each extra point of tax takes exactly one percent of EBIT out of free cash flow.',
        ),
        cot: d(
          'Mỗi cột là FCFF ở một mức thuế suất, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Doanh nghiệp đang hưởng ưu đãi thuế đứng ở cột cao bên trái; hết ưu đãi là trượt về các cột bên phải dù việc kinh doanh không đổi.',
          'Each bar is FCFF at one tax rate; bars shrink to the right and the solid one is the rate you have entered. A company enjoying a tax break stands on a tall bar to the left; when the break ends it slides toward the bars on the right though the business itself has not changed.',
        ),
        diem: d(
          'Mỗi chấm là FCFF tính ở một mức của ô Thuế suất thuế TNDN (t), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu thuế suất đổi thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống thành hàng thẳng, các chấm cách đều nhau: mỗi điểm thuế suất thêm vào lấy đi đúng một phần trăm EBIT khỏi dòng tiền tự do, ở chấm nào cũng như nhau.',
          'Each dot is FCFF at one level of the Corporate income tax rate (t) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the tax rate, not market history. The row of dots falls in a straight, evenly spaced line: each extra point of tax removes exactly one percent of EBIT from free cash flow, the same amount wherever the dot sits.',
        ),
        laiLo: d(
          'Dạng này hiện khi trong dải của ô Thuế suất thuế TNDN (t) có cả mức thuế để lại tiền lẫn mức thuế làm hụt tiền: ở mức thuế thấp nhất, EBIT sau thuế còn đủ trả chi đầu tư và vốn lưu động tăng thêm sau khi trừ khấu hao, ở mức cao nhất thì không. Phần trên vạch 0 tô xanh, bên trái, là tiền còn lại cho chủ nợ và cổ đông; phần dưới vạch 0 tô đỏ, bên phải, là kỳ tiêu nhiều hơn làm ra. Đây là phép thử nếu thuế suất đổi thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều, cắt vạch 0 ở mức thuế vừa ăn hết phần dư ấy.',
          'This form appears when FCFF changes sign within the range of the Corporate income tax rate (t) field: at the lowest rate, after-tax EBIT still covers capital spending plus the rise in working capital net of depreciation; at the highest it does not. The green part above the zero line, on the left, is cash left for lenders and shareholders; the red part below, on the right, is a period that spends more than it brings in. It is a what-if on the tax rate, not market history. The line falls steadily and crosses the zero line at the rate that eats up exactly that surplus.',
        ),
      },
      depreciation: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Khấu hao (Dep), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu khấu hao đổi mà EBIT đứng yên thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: khấu hao là chi phí ghi sổ chứ không phải tiền chi ra, nên nó được cộng trả lại nguyên vẹn vào dòng tiền.',
          'The line runs left to right along the Depreciation (Dep) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on depreciation with EBIT held still, not market history. The line rises steadily: depreciation is a book expense, not cash paid out, so it is added back to cash flow in full.',
        ),
        cot: d(
          'Mỗi cột là FCFF ở một mức khấu hao, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Khấu hao lớn thường đi cùng tài sản sắp phải thay, nên cột cao ở đây hãy đọc cạnh mức chi đầu tư.',
          'Each bar is FCFF at one depreciation level; bars grow taller to the right and the solid one is the level you have entered. Heavy depreciation usually comes with assets that will soon need replacing, so read a tall bar here next to capital spending.',
        ),
        diem: d(
          'Mỗi chấm là FCFF tính ở một mức của ô Khấu hao (Dep), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu khấu hao đổi mà EBIT đứng yên thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau, và từ chấm này sang chấm kế FCFF tăng đúng bằng phần khấu hao tăng thêm: khấu hao là chi phí ghi sổ chứ không phải tiền chi ra, nên được cộng trả lại nguyên vẹn.',
          'Each dot is FCFF at one level of the Depreciation (Dep) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on depreciation with EBIT held still, not market history. The row of dots rises in a straight, evenly spaced line, and from one dot to the next FCFF gains exactly the extra depreciation: it is a book expense, not cash paid out, so it is added back in full.',
        ),
        laiLo: d(
          'Dạng này hiện khi EBIT sau thuế tự nó chưa đủ trả chi đầu tư và vốn lưu động tăng thêm, và phần thiếu ấy nằm trong dải của ô Khấu hao (Dep): bên trái dải, khoản khấu hao cộng trả lại chưa lấp đủ, bên phải thì lấp dư. Phần trên vạch 0 tô xanh là tiền còn lại cho chủ nợ và cổ đông; phần dưới vạch 0 tô đỏ là kỳ doanh nghiệp tiêu nhiều hơn làm ra. Đây là phép thử nếu khấu hao đổi mà EBIT đứng yên thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều, cắt vạch 0 ở mức khấu hao vừa bằng phần thiếu ấy.',
          'This form appears when after-tax EBIT alone does not cover capital spending plus the rise in working capital, and the shortfall lies within the range of the Depreciation (Dep) field: on the left the depreciation added back does not fill it, on the right it more than fills it. The green part above the zero line is cash left for lenders and shareholders; the red part below is a period that spends more than it brings in. It is a what-if on depreciation with EBIT held still, not market history. The line rises steadily and crosses the zero line where depreciation just equals that shortfall.',
        ),
      },
      capex: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chi đầu tư tài sản cố định (CapEx), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu chi đầu tư đổi thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: mỗi đồng đem đi mua máy móc, nhà xưởng là một đồng rời khỏi dòng tiền tự do của năm ấy.',
          'The line runs left to right along the Capital expenditure (CapEx) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on capital spending, not market history. The line falls steadily: every unit spent on plant and equipment is a unit that leaves that year’s free cash flow.',
        ),
        cot: d(
          'Mỗi cột là FCFF ở một mức chi đầu tư, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột thấp bên phải chưa chắc là tin xấu: doanh nghiệp đang mở rộng chấp nhận dòng tiền tự do mỏng hôm nay để đổi lấy lợi nhuận về sau.',
          'Each bar is FCFF at one level of capital spending; bars shrink to the right and the solid one is the level you have entered. A short bar on the right is not necessarily bad news: a company that is expanding accepts thin free cash flow today in exchange for profit later.',
        ),
        diem: d(
          'Mỗi chấm là FCFF tính ở một mức của ô Chi đầu tư tài sản cố định (CapEx), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu chi đầu tư đổi thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống thành hàng thẳng, các chấm cách đều nhau, và từ chấm này sang chấm kế FCFF giảm đúng bằng phần chi đầu tư tăng thêm: tiền mua máy móc, nhà xưởng rời khỏi dòng tiền tự do của kỳ ấy trọn từng đồng.',
          'Each dot is FCFF at one level of the Capital expenditure (CapEx) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on capital spending, not market history. The row of dots falls in a straight, evenly spaced line, and from one dot to the next FCFF drops by exactly the extra capital spending: every unit spent on plant and equipment leaves that period’s free cash flow in full.',
        ),
        laiLo: d(
          'Dạng này hiện khi trong dải của ô Chi đầu tư tài sản cố định (CapEx) có mức chi mà tiền kinh doanh làm ra còn trả đủ và có mức chi vượt quá số tiền ấy, tức EBIT sau thuế cộng khấu hao trừ vốn lưu động tăng thêm. Phần trên vạch 0 tô xanh, bên trái, là kỳ đầu tư xong vẫn còn tiền cho chủ nợ và cổ đông; phần dưới vạch 0 tô đỏ, bên phải, là kỳ chi đầu tư vượt tiền làm ra, phải vay hoặc gọi thêm vốn để bù. Đây là phép thử nếu chi đầu tư đổi thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều, cắt vạch 0 ở mức chi vừa tiêu hết số tiền ấy.',
          'This form appears when FCFF changes sign within the range of the Capital expenditure (CapEx) field: on the left, the cash the business earns, after-tax EBIT plus depreciation minus the rise in working capital, pays for the spending; on the right it does not. The green part above the zero line still leaves cash for lenders and shareholders; the red part below is investment outrunning the cash earned, funded by borrowing or new capital. It is a what-if on capital spending, not market history. The line falls steadily and crosses the zero line at the spending that uses up exactly that cash.',
        ),
      },
      nwcChange: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tăng vốn lưu động ròng (ΔNWC), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mức tăng vốn lưu động đổi thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: tiền nằm thêm ở hàng tồn kho và khoản phải thu là tiền chưa về két, nên vốn lưu động tăng bao nhiêu thì dòng tiền tự do giảm bấy nhiêu.',
          'The line runs left to right along the Increase in net working capital (ΔNWC) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the growth in working capital, not market history. The line falls steadily: cash tied up in extra inventory and receivables has not yet come home, so free cash flow drops by exactly the increase in working capital.',
        ),
        cot: d(
          'Mỗi cột là FCFF ở một mức tăng vốn lưu động, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Doanh thu tăng nhanh mà khách trả chậm đẩy doanh nghiệp sang cột thấp bên phải: lợi nhuận có trên sổ nhưng tiền chưa về.',
          'Each bar is FCFF at one increase in working capital; bars shrink to the right and the solid one is the level you have entered. Fast sales growth with slow-paying customers pushes a company to a short bar on the right: the profit is on the books but the cash has not arrived.',
        ),
        diem: d(
          'Mỗi chấm là FCFF tính ở một mức của ô Tăng vốn lưu động ròng (ΔNWC), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu mức tăng vốn lưu động đổi thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống thành hàng thẳng, các chấm cách đều nhau: từ chấm này sang chấm kế, FCFF giảm đúng bằng số tiền nằm thêm ở hàng tồn kho và khoản phải thu, tiền chưa về két.',
          'Each dot is FCFF at one level of the Increase in net working capital (ΔNWC) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the growth in working capital, not market history. The row of dots falls in a straight, evenly spaced line: from one dot to the next, FCFF drops by exactly the extra cash tied up in inventory and receivables, money that has not yet come home.',
        ),
        laiLo: d(
          'Dạng này hiện khi FCFF đổi dấu ngay trong dải của ô Tăng vốn lưu động ròng (ΔNWC). Khi ô đang là 0, trục trải cả hai phía: bên trái vốn lưu động giảm, tiền từ hàng tồn kho và khoản phải thu quay về; bên phải vốn lưu động tăng. Phần trên vạch 0 tô xanh là kỳ còn tiền cho chủ nợ và cổ đông; phần dưới vạch 0 tô đỏ là kỳ tiền bị giam vào vốn lưu động tới mức hụt. Đây là phép thử nếu vốn lưu động đổi thì FCFF ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều, cắt vạch 0 ở mức tăng vừa tiêu hết số tiền còn lại sau chi đầu tư.',
          'This form appears when FCFF changes sign within the range of the Increase in net working capital (ΔNWC) field. With the field at 0 the axis spans both sides: on the left working capital shrinks and cash comes back from inventory and receivables, on the right it grows. The green part above the zero line leaves cash for lenders and shareholders; the red part below is so much cash tied up in working capital that there is a shortfall. It is a what-if on working capital, not market history. The line falls steadily and crosses the zero line at the increase that uses up what is left after investing.',
        ),
      },
    },
    bocTach: d(
      'Các thanh nằm ngang, đọc từ trên xuống. EBIT sau thuế và Khấu hao là hai thanh được tô màu, tiền đi vào; Chi đầu tư và Tăng VLĐ ròng là hai thanh viền nét đứt, tiền doanh nghiệp phải bỏ lại để tiếp tục hoạt động; thanh sẫm cuối cùng là FCFF và bằng đúng con số ở khối Kết quả. Nếu vốn lưu động giảm, thanh Tăng VLĐ ròng đổi sang tô màu vì tiền quay về. Hai thanh trừ dài gần bằng hai thanh cộng là doanh nghiệp làm ra tiền nhưng phải tái đầu tư gần hết.',
      'Horizontal bars, read from top to bottom. After-tax EBIT and Depreciation are the two filled bars, cash coming in; CapEx and Increase in net WC are the two bars with a dashed outline, cash the company must leave behind to keep operating; the dark bar at the end is FCFF and matches the figure in the Result block exactly. If working capital falls, the Increase in net WC bar turns filled. When the two minus bars nearly match the two plus bars, the company makes cash but has to reinvest almost all of it.',
    ),
  },

  fcfe: {
    truc: {
      fcff: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Dòng tiền tự do của doanh nghiệp (FCFF), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu FCFF đổi mà lãi vay và vay ròng đứng yên thì FCFE ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: phần dành cho chủ nợ không đổi, nên mỗi đồng dòng tiền của doanh nghiệp thêm vào chảy trọn về phía cổ đông.',
          'The line runs left to right along the Free cash flow to firm (FCFF) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on FCFF with interest and net borrowing held still, not market history. The line rises steadily: what goes to lenders does not change, so every extra unit of the firm’s cash flow passes entirely to shareholders.',
        ),
        cot: d(
          'Mỗi cột là FCFE ở một mức FCFF, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Khoảng chênh giữa một cột và mức FCFF của chính nó là phần chủ nợ đã lấy, sau khi tính cả khoản vay ròng mới.',
          'Each bar is FCFE at one FCFF level; bars grow taller to the right and the solid one is the level you have entered. The gap between a bar and its own FCFF is what lenders have taken, net of any new borrowing.',
        ),
        diem: d(
          'Mỗi chấm là FCFE tính ở một mức của ô Dòng tiền tự do của doanh nghiệp (FCFF), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu FCFF đổi mà lãi vay và vay ròng đứng yên thì FCFE ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau, và chấm nào cũng cách mức FCFF của chính nó cùng một khoảng: lãi vay sau thuế trừ vay ròng mới, phần không đổi theo FCFF.',
          'Each dot is FCFE at one level of the Free cash flow to firm (FCFF) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on FCFF with interest and net borrowing held still, not market history. The row of dots rises in a straight, evenly spaced line, and every dot sits the same distance from its own FCFF: after-tax interest minus new net borrowing, which does not move with FCFF.',
        ),
        laiLo: d(
          'Dạng này hiện khi FCFE đổi dấu ngay trong dải của ô Dòng tiền tự do của doanh nghiệp (FCFF); khi ô đang là 0, trục trải hết dải cho phép của ô, cả phía âm. Phần trên vạch 0 tô xanh là tiền còn lại cho cổ đông; phần dưới vạch 0 tô đỏ là kỳ cổ đông không còn đồng nào, phải bù bằng tiền đang có hoặc góp thêm vốn. Đây là phép thử nếu FCFF đổi mà lãi vay và vay ròng đứng yên thì FCFE ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều, cắt vạch 0 ở mức FCFF mà cộng với vay ròng mới vừa đủ trả lãi vay sau thuế.',
          'This form appears when FCFE changes sign within the range of the Free cash flow to firm (FCFF) field; with the field at 0, the axis spans the field’s whole allowed range, negative side included. The green part above the zero line is cash left for shareholders; the red part below leaves them nothing, the gap covered from cash on hand or fresh capital. It is a what-if on FCFF with interest and net borrowing held still, not market history. The line rises steadily and crosses the zero line where FCFF plus new net borrowing exactly covers after-tax interest.',
        ),
      },
      interest: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chi phí lãi vay (I), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lãi vay đổi thì FCFE ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều nhưng không giảm một đổi một: lãi vay được trừ trước thuế, nên mỗi đồng lãi thêm vào chỉ lấy của cổ đông phần còn lại sau lá chắn thuế.',
          'The line runs left to right along the Interest expense (I) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on interest, not market history. The line falls steadily but less than one for one: interest is deducted before tax, so each extra unit of interest costs shareholders only what remains after the tax shield.',
        ),
        cot: d(
          'Mỗi cột là FCFE ở một mức lãi vay, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Lãi suất thả nổi tăng lên là doanh nghiệp tự trượt sang cột bên phải, không cần vay thêm đồng nào.',
          'Each bar is FCFE at one level of interest; bars shrink to the right and the solid one is the level you have entered. When a floating rate goes up the company slides to the right by itself, without borrowing anything more.',
        ),
        diem: d(
          'Mỗi chấm là FCFE tính ở một mức của ô Chi phí lãi vay (I), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu lãi vay đổi thì FCFE ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống thành hàng thẳng, các chấm cách đều nhau, nhưng từ chấm này sang chấm kế FCFE chỉ giảm phần sau thuế của khoản lãi tăng thêm: lãi vay được trừ trước khi tính thuế, nên thuế gánh hộ phần còn lại.',
          'Each dot is FCFE at one level of the Interest expense (I) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on interest, not market history. The row of dots falls in a straight, evenly spaced line, yet from one dot to the next FCFE loses only the after-tax part of the extra interest: interest is deducted before tax, so tax carries the rest.',
        ),
        laiLo: d(
          'Dạng này hiện khi trong dải của ô Chi phí lãi vay (I) có mức lãi mà FCFF cộng vay ròng mới còn trả được và có mức trả không nổi; khi ô đang là 0, trục chạy từ 0 tới mức trần của ô. Phần trên vạch 0 tô xanh, bên trái, là tiền còn lại cho cổ đông sau khi trả lãi; phần dưới vạch 0 tô đỏ, bên phải, là mức lãi nặng tới mức cổ đông không còn gì, phải bù bằng tiền đang có. Đây là phép thử nếu lãi vay đổi thì FCFE ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều, cắt vạch 0 ở mức lãi mà phần sau thuế vừa bằng FCFF cộng vay ròng mới.',
          'This form appears when the range of the Interest expense (I) field holds both interest that FCFF plus new net borrowing can pay and interest it cannot; with the field at 0, the axis runs from 0 to the field’s ceiling. The green part above the zero line, on the left, is cash left for shareholders after interest; the red part below, on the right, is interest so heavy that nothing is left for them and the gap comes out of cash on hand. It is a what-if on interest, not market history. The line falls steadily and crosses the zero line where after-tax interest equals FCFF plus new net borrowing.',
        ),
      },
      taxRate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thuế suất thuế TNDN (t), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu thuế suất đổi mà FCFF bạn nhập đứng yên thì FCFE ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều, và các mức ghi trên trục dọc cho thấy cả đường chỉ nhích một khoảng hẹp: ở công thức này thuế chỉ chạm vào lãi vay, và thuế suất càng cao thì lá chắn thuế của lãi vay càng dày. Phần thuế đánh lên lợi nhuận đã nằm sẵn trong con số FCFF.',
          'The line runs left to right along the Corporate income tax rate (t) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the tax rate with the FCFF you entered held still, not market history. The line rises steadily, and the levels on the vertical axis show that it gains only a narrow span: in this formula tax touches only interest, and a higher rate makes the interest tax shield thicker. The tax on operating profit is already inside the FCFF figure.',
        ),
        cot: d(
          'Mỗi cột là FCFE ở một mức thuế suất, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Đừng đọc dãy cột này thành thuế cao thì có lợi: muốn thấy thuế ăn vào dòng tiền thế nào thì phải đổi thuế suất ở chính công thức FCFF.',
          'Each bar is FCFE at one tax rate; bars grow taller to the right and the solid one is the rate you have entered. Do not read this row as higher tax being good: to see how tax eats into cash flow, change the rate in the FCFF formula itself.',
        ),
        diem: d(
          'Mỗi chấm là FCFE tính ở một mức của ô Thuế suất thuế TNDN (t), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu thuế suất đổi mà FCFF bạn nhập đứng yên thì FCFE ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau: ở công thức này thuế chỉ chạm vào lãi vay, mỗi điểm thuế suất làm lá chắn thuế dày thêm một phần trăm chi phí lãi vay. Thuế đánh lên lợi nhuận đã nằm sẵn trong FCFF, nên dãy chấm không nói thuế cao là có lợi.',
          'Each dot is FCFE at one level of the Corporate income tax rate (t) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the tax rate with the FCFF you entered held still, not market history. The row of dots rises in a straight, evenly spaced line: in this formula tax touches only interest, and each extra point of tax thickens the interest tax shield by one percent of interest expense. The tax on profit already sits inside FCFF, so the row does not mean higher tax helps.',
        ),
      },
      netBorrowing: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vay ròng mới (ΔB), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu khoản vay ròng đổi thì FCFE ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: tiền vay thêm trong kỳ là tiền vào tay doanh nghiệp, nên nó cộng thẳng vào phần cổ đông có thể rút ra.',
          'The line runs left to right along the New net borrowing (ΔB) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on net borrowing, not market history. The line rises steadily: money borrowed during the period is cash in the company’s hands, so it adds straight to what shareholders could take out.',
        ),
        cot: d(
          'Mỗi cột là FCFE ở một mức vay ròng, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột cao nhờ vay không bền bằng cột cao nhờ kinh doanh: khoản vay hôm nay là lãi và gốc phải trả ở các kỳ sau.',
          'Each bar is FCFE at one level of net borrowing; bars grow taller to the right and the solid one is the level you have entered. A bar that is tall because of borrowing is less durable than one that is tall because of the business: today’s loan is interest and principal due in later periods.',
        ),
        diem: d(
          'Mỗi chấm là FCFE tính ở một mức của ô Vay ròng mới (ΔB), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu khoản vay ròng đổi thì FCFE ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau, và từ chấm này sang chấm kế FCFE tăng đúng bằng phần vay thêm: tiền vay về cộng thẳng vào phần cổ đông có thể rút ra, nhưng là tiền phải trả lại ở các kỳ sau.',
          'Each dot is FCFE at one level of the New net borrowing (ΔB) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on net borrowing, not market history. The row of dots rises in a straight, evenly spaced line, and from one dot to the next FCFE gains exactly the extra borrowing: borrowed cash adds straight to what shareholders could take out, but it has to be paid back in later periods.',
        ),
        laiLo: d(
          'Dạng này hiện khi FCFE đổi dấu ngay trong dải của ô Vay ròng mới (ΔB). Khi ô đang là 0, trục trải hai phía quanh 0: bên trái là kỳ trả nợ gốc nhiều hơn vay, bên phải là kỳ vay thêm. Phần trên vạch 0 tô xanh là tiền còn lại cho cổ đông; phần dưới vạch 0 tô đỏ là chỗ FCFF cộng vay ròng mới không đủ trả lãi vay sau thuế, cổ đông không còn gì. Đây là phép thử nếu khoản vay ròng đổi thì FCFE ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều, cắt vạch 0 ở mức vay ròng mà cộng với FCFF vừa đủ trả lãi vay sau thuế.',
          'This form appears when FCFE changes sign within the range of the New net borrowing (ΔB) field. With the field at 0 the axis spans both sides of 0: on the left the company repays more principal than it borrows, on the right it borrows more. The green part above the zero line is cash left for shareholders; the red part below is where FCFF plus new net borrowing does not cover after-tax interest, leaving them nothing. It is a what-if on net borrowing, not market history. The line rises steadily and crosses the zero line where FCFF plus new net borrowing just covers after-tax interest.',
        ),
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. FCFF là thanh tô màu mở đầu; Lãi vay sau thuế là thanh viền nét đứt, phần phải trả cho chủ nợ; Vay ròng mới là thanh tô màu khi doanh nghiệp vay thêm, và đổi sang viền nét đứt khi kỳ ấy trả nợ nhiều hơn vay; thanh sẫm cuối cùng là FCFE và bằng đúng con số ở khối Kết quả. Nếu thanh FCFE dài chủ yếu nhờ thanh Vay ròng mới thì dòng tiền của cổ đông đang đến từ nợ chứ không từ hoạt động kinh doanh.',
      'This chart has a single form: horizontal bars, read from top to bottom. FCFF is the filled bar that opens it; After-tax interest is the bar with a dashed outline, what goes to lenders; New net borrowing is a filled bar when the company borrows more and a dashed one when it repays more than it borrows; the dark bar at the end is FCFE and matches the figure in the Result block exactly. If that last bar is long mainly because of New net borrowing, shareholders’ cash is coming from debt rather than from the business.',
    ),
    vanhKhuyen: d(
      'Vành khuyên chỉ hiện khi không phần nào âm. Lãi vay sau thuế là khoản trừ ra, nên điều ấy chỉ xảy ra khi ô Chi phí lãi vay bằng 0 và cả FCFF lẫn Vay ròng mới không âm; Lãi vay sau thuế khi ấy không có múi, chú giải ghi nó chiếm 0 phần trăm. Vòng chia FCFE giữa hai múi còn lại: múi FCFF là phần đến từ kinh doanh, múi Vay ròng mới là phần đến từ tiền đi vay. Lỗ giữa in FCFE và giá trị của nó; rê chuột hay chạm một múi thì hiện tên và giá trị của múi ấy. Múi Vay ròng mới càng to thì tiền của cổ đông càng dựa vào nợ.',
      'The donut needs every part to be at least 0, and since After-tax interest is subtracted, that means the Interest expense field is 0 and neither FCFF nor New net borrowing is negative; After-tax interest then has no slice and the legend shows it at a 0 percent share. The ring splits FCFE between the other two: the FCFF slice comes from the business, the New net borrowing slice from borrowed money. The hole shows FCFE and its value; hovering over or tapping a slice shows its name and value. The bigger the New net borrowing slice, the more shareholders’ cash leans on debt.',
    ),
  },

  'gia-tri-noi-tai-fcff': {
    truc: {
      fcff: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Dòng tiền tự do của doanh nghiệp (FCFF), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu FCFF đổi mà WACC và tăng trưởng đứng yên thì giá trị nội tại ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: cả dòng tiền tương lai được suy ra từ con số này, nên nó là đòn bẩy trực tiếp nhất của kết quả.',
          'The line runs left to right along the Free cash flow to firm (FCFF) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on FCFF with WACC and growth held still, not market history. The line rises steadily: the whole future stream of cash is projected from this figure, so it is the most direct lever on the result.',
        ),
        cot: d(
          'Mỗi cột là giá trị nội tại ở một mức FCFF, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Lấy FCFF của một năm đột biến làm gốc là tự đặt mình lên cột cao hơn thực tế, vì mô hình kéo dài con số ấy tới mãi mãi.',
          'Each bar is the intrinsic value at one FCFF level; bars grow taller to the right and the solid one is the level you have entered. Starting from the FCFF of an unusually good year puts you on a bar taller than reality, because the model extends that figure forever.',
        ),
        diem: d(
          'Mỗi chấm là giá trị nội tại mỗi cổ phiếu tính ở một mức của ô Dòng tiền tự do của doanh nghiệp (FCFF), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu FCFF đổi mà WACC và tăng trưởng đứng yên thì giá trị nội tại ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau: từ chấm này sang chấm kế, giá trị doanh nghiệp tăng gấp nhiều lần phần FCFF tăng thêm, vì mô hình kéo con số ấy ra mọi năm về sau rồi mới chia cho số cổ phiếu.',
          'Each dot is the intrinsic value per share at one level of the Free cash flow to firm (FCFF) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on FCFF with WACC and growth held still, not market history. The row of dots rises in a straight, evenly spaced line: from one dot to the next, enterprise value grows by many times the extra FCFF, because the model carries that figure into every future year before dividing by the share count.',
        ),
      },
      growth: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tăng trưởng FCFF dài hạn (g), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tốc độ tăng trưởng dài hạn đổi thì giá trị nội tại ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và dốc dần: tăng trưởng càng tiến gần WACC thì mẫu số càng nhỏ, nên vài phần mười điểm ở đầu bên phải đã đổi giá trị rất nhiều.',
          'The line runs left to right along the Long-term FCFF growth (g) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on long-term growth, not market history. The line rises and steepens: as growth closes in on WACC the denominator shrinks, so a few tenths of a point at the right-hand end already move the value a great deal.',
        ),
        cot: d(
          'Mỗi cột là giá trị nội tại ở một mức tăng trưởng dài hạn, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Tăng trưởng mãi mãi của một doanh nghiệp khó vượt tăng trưởng của cả nền kinh tế, nên các cột cao nhất bên phải là vùng nên nghi ngờ trước.',
          'Each bar is the intrinsic value at one long-term growth rate; bars grow taller to the right and the solid one is the rate you have entered. A company can hardly outgrow the whole economy forever, so the tallest bars on the right are the first to doubt.',
        ),
        diem: d(
          'Mỗi chấm là giá trị nội tại tính ở một mức của ô Tăng trưởng FCFF dài hạn (g), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tốc độ tăng trưởng dài hạn đổi thì giá trị nội tại ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên và các chấm giãn xa nhau dần về bên phải: g càng tiến gần WACC thì khoảng cách giữa hai con số ấy càng hẹp, nên cùng một bước tăng trưởng ở đầu phải đẩy giá trị lên nhiều hơn hẳn ở đầu trái.',
          'Each dot is the intrinsic value at one level of the Long-term FCFF growth (g) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on long-term growth, not market history. The row of dots rises and the dots spread further apart to the right: as g closes in on WACC the gap between the two narrows, so the same step in growth lifts the value far more at the right-hand end than at the left.',
        ),
      },
      wacc: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Chi phí vốn bình quân (WACC), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu WACC đổi thì giá trị nội tại ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: vốn càng đắt thì dòng tiền tương lai càng mất giá, và kết quả đổi mạnh nhất ở bên trái, nơi WACC sát với tốc độ tăng trưởng dài hạn.',
          'The line runs left to right along the Weighted average cost of capital (WACC) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on WACC, not market history. The line falls and flattens: the dearer the capital, the less future cash flows are worth, and the result swings hardest on the left where WACC sits close to the long-term growth rate.',
        ),
        cot: d(
          'Mỗi cột là giá trị nội tại ở một mức WACC, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Hai cột sát hai bên cột tô đặc cho thấy chỉ cần lệch WACC một chút là giá trị mỗi cổ phiếu đã đổi bao nhiêu.',
          'Each bar is the intrinsic value at one WACC; bars shrink to the right and the solid one is the level you have entered. The two bars on either side of the solid one show how far the per-share value moves when WACC is off by only a little.',
        ),
        diem: d(
          'Mỗi chấm là giá trị nội tại tính ở một mức của ô Chi phí vốn bình quân (WACC), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu WACC đổi thì giá trị nội tại ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, các chấm bên trái cách nhau xa hơn hẳn các chấm bên phải: càng về bên trái WACC càng sát tốc độ tăng trưởng dài hạn, mỗi bước WACC làm giá trị đổi càng mạnh; càng sang phải vốn càng đắt và mỗi bước đổi càng ít.',
          'Each dot is the intrinsic value at one level of the Weighted average cost of capital (WACC) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on WACC, not market history. The row of dots falls, with the dots on the left much further apart than those on the right: the further left, the closer WACC sits to long-term growth and the harder each step in WACC moves the value; further right, capital is dearer and each step moves it less.',
        ),
      },
      netDebt: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Nợ vay ròng (Dròng), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu nợ ròng đổi thì giá trị nội tại ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: giá trị cả doanh nghiệp phải trả cho chủ nợ trước, nên mỗi đồng nợ ròng thêm vào bớt đi đúng một đồng khỏi phần của cổ đông.',
          'The line runs left to right along the Net debt (Dròng) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on net debt, not market history. The line falls steadily: the value of the whole firm goes to lenders first, so every extra unit of net debt takes exactly one unit from the shareholders’ part.',
        ),
        cot: d(
          'Mỗi cột là giá trị nội tại ở một mức nợ ròng, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Nợ ròng âm, tức tiền mặt nhiều hơn nợ vay, thì cộng thêm vào giá trị thay vì trừ đi.',
          'Each bar is the intrinsic value at one level of net debt; bars shrink to the right and the solid one is the level you have entered. Negative net debt, meaning more cash than borrowings, adds to the value instead of taking from it.',
        ),
        diem: d(
          'Mỗi chấm là giá trị nội tại tính ở một mức của ô Nợ vay ròng (Dròng), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu nợ ròng đổi thì giá trị nội tại ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống thành hàng thẳng, các chấm cách đều nhau: giá trị doanh nghiệp trả chủ nợ trước, nên mỗi phần nợ ròng thêm vào bớt đúng phần ấy khỏi vốn của cổ đông, rồi chia đều cho mọi cổ phiếu.',
          'Each dot is the intrinsic value at one level of the Net debt (Dròng) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on net debt, not market history. The row of dots falls in a straight, evenly spaced line: the firm’s value goes to lenders first, so each extra unit of net debt comes straight off the shareholders’ equity, spread evenly over every share.',
        ),
      },
      shares: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số cổ phiếu lưu hành, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số cổ phiếu đổi thì giá trị nội tại mỗi cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: giá trị của cả phần vốn cổ đông không đổi, chia cho càng nhiều cổ phiếu thì mỗi cổ phiếu nhận càng ít.',
          'The line runs left to right along the Shares outstanding field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the share count, not market history. The line falls and flattens: the value of all the equity does not change, and split across more shares it leaves less for each one.',
        ),
        cot: d(
          'Mỗi cột là giá trị nội tại mỗi cổ phiếu ở một mức số cổ phiếu, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Nếu doanh nghiệp còn quyền chọn hay trái phiếu chuyển đổi chưa thực hiện, giá trị thật nằm ở một cột lệch về bên phải so với cột tô đặc.',
          'Each bar is the intrinsic value per share at one share count; bars shrink to the right and the solid one is the count you have entered. If options or convertible bonds are still outstanding, the true value sits on a bar to the right of the solid one.',
        ),
        diem: d(
          'Mỗi chấm là giá trị nội tại mỗi cổ phiếu tính ở một mức của ô Số cổ phiếu lưu hành, từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu số cổ phiếu đổi thì giá trị nội tại mỗi cổ phiếu ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống, các chấm bên trái cách nhau xa hơn các chấm bên phải: cùng một phần vốn của cổ đông chia cho thêm cổ phiếu thì mỗi cổ phiếu mất nhiều nhất khi số cổ phiếu còn ít.',
          'Each dot is the intrinsic value per share at one level of the Shares outstanding field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the share count, not market history. The row of dots falls, with the dots on the left further apart than those on the right: the same equity split across extra shares costs each share the most while there are still few of them.',
        ),
      },
    },
  },

  'gia-tri-hien-tai': {
    truc: {
      futureValue: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số tiền trong tương lai (FV), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu khoản tiền tương lai đổi thì hôm nay nó đáng bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: tỷ lệ chiết khấu và số năm giữ nguyên, khoản tương lai lớn lên bao nhiêu phần thì giá trị hôm nay lớn lên bấy nhiêu phần.',
          'The line runs left to right along the Future amount (FV) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the future amount, not market history. The line rises steadily: with the discount rate and the years held still, today’s value grows in exact proportion to the future amount.',
        ),
        cot: d(
          'Mỗi cột là giá trị hiện tại ở một mức số tiền tương lai, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Mọi cột đều thấp hơn con số tương lai nó đại diện; khoảng hụt ấy là cái giá của việc phải chờ.',
          'Each bar is the present value at one future amount; bars grow taller to the right and the solid one is the level you have entered. Every bar is shorter than the future figure it stands for; that shortfall is the price of having to wait.',
        ),
        diem: d(
          'Mỗi chấm là giá trị hiện tại tính ở một mức của ô Số tiền trong tương lai (FV), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu khoản tiền tương lai đổi thì hôm nay nó đáng bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau: tỷ lệ chiết khấu và số năm giữ nguyên thì mọi chấm chia cho cùng một hệ số, nên chấm ở đầu trái đúng bằng một nửa chấm trên vạch đứt, chấm ở đầu phải đúng gấp rưỡi.',
          'Each dot is the present value at one level of the Future amount (FV) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the future amount, not market history. The row of dots rises in a straight, evenly spaced line: with the rate and the years held still, every dot is divided by the same factor, so the dot at the left end is exactly half the one on the dashed line and the dot at the right end one and a half times it.',
        ),
      },
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tỷ lệ chiết khấu / năm (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu tỷ lệ chiết khấu đổi thì giá trị hiện tại ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: tỷ lệ chiết khấu là mức sinh lời bạn bỏ lỡ khi phải chờ, nên nó càng cao thì khoản tiền tương lai càng kém giá trị ở hôm nay.',
          'The line runs left to right along the Discount rate / year (r) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the discount rate, not market history. The line falls and flattens: the discount rate is the return you give up by waiting, so the higher it is, the less a future sum is worth today.',
        ),
        cot: d(
          'Mỗi cột là giá trị hiện tại ở một tỷ lệ chiết khấu, cột thấp dần về bên phải và cột tô đặc là tỷ lệ bạn đang nhập. Với tỷ lệ chiết khấu dương, cột nào cũng thấp hơn số tiền tương lai; phần hụt là cái giá của việc phải chờ.',
          'Each bar is the present value at one discount rate; bars shrink to the right and the solid one is the rate you have entered. With a positive discount rate every bar is shorter than the future amount; the shortfall is the price of having to wait.',
        ),
        diem: d(
          'Mỗi chấm là giá trị hiện tại tính ở một mức của ô Tỷ lệ chiết khấu / năm (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu tỷ lệ chiết khấu đổi thì giá trị hiện tại ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống và các chấm sát nhau dần về bên phải: mỗi bước tỷ lệ thêm vào cắt bớt một giá trị hiện tại đã nhỏ đi, nên phần mất thêm ở mỗi bước ít dần.',
          'Each dot is the present value at one level of the Discount rate / year (r) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the discount rate, not market history. The row of dots falls and the dots crowd closer together to the right: each extra step in the rate trims a present value that is already smaller, so each step takes away less.',
        ),
      },
      years: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số năm (n), từ một nửa đến gấp rưỡi số năm bạn đang nhập, mỗi điểm cách nhau một năm; vạch đứt dọc có chấm tròn là đúng số năm bạn nhập. Đây là phép thử nếu thời gian chờ đổi thì giá trị hiện tại ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống và thoải dần: mỗi năm phải chờ thêm lại chiết khấu thêm một lần, nên khoản tiền càng xa thì hôm nay càng nhỏ.',
          'The line runs left to right along the Years (n) field, from half to one and a half times the number of years you have entered, one point per year; the dashed vertical line with a dot marks your own figure. It is a what-if on how long you wait, not market history. The line falls and flattens: every extra year of waiting discounts the sum once more, so the further away the money is, the smaller it is today.',
        ),
        cot: d(
          'Mỗi cột là giá trị hiện tại ứng với một số năm chờ, cột thấp dần về bên phải và cột tô đặc là số năm bạn đang nhập. Mỗi cột bằng cột bên trái nó nhân với cùng một hệ số nhỏ hơn một, nên dãy cột lùi theo tỷ lệ chứ không lùi theo số đồng.',
          'Each bar is the present value for one number of years waited; bars shrink to the right and the solid one is the number you have entered. Each bar equals the one on its left times the same factor below one, so the row shrinks in proportion, not by a fixed amount.',
        ),
        diem: d(
          'Mỗi chấm là giá trị hiện tại ứng với một số năm nguyên của ô Số năm (n), từ một nửa đến gấp rưỡi số năm bạn đang nhập, các chấm cách nhau đúng một năm; chấm nằm trên vạch đứt dọc là đúng số năm bạn nhập. Đây là phép thử nếu thời gian chờ đổi thì giá trị hiện tại ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống và sát nhau dần về bên phải: mỗi chấm bằng chấm bên trái chia thêm một lần cho cùng một hệ số, nên mỗi năm chờ thêm làm mất cùng một tỷ lệ chứ không cùng một số tiền.',
          'Each dot is the present value for one whole number of years in the Years (n) field, from half to one and a half times the number you have entered, the dots exactly one year apart; the dot on the dashed vertical line is your own figure. It is a what-if on how long you wait, not market history. The row of dots falls and crowds closer together to the right: each dot is the one on its left divided once more by the same factor, so every extra year of waiting costs the same proportion, not the same sum.',
        ),
        bac: d(
          'Mỗi bậc là giá trị hiện tại của một số năm nguyên trên ô Số năm (n), từ một nửa đến gấp rưỡi số năm bạn đang nhập: bậc nằm ngang suốt một năm rồi mới hạ sang mức của năm kế tiếp, vì ô chỉ nhận số năm nguyên và phép tính làm tròn số năm, không có năm lẻ nào để tính. Đây là phép thử nếu thời gian chờ đổi thì giá trị hiện tại ra bao nhiêu, không phải diễn biến thị trường. Cầu thang đi xuống và mỗi bậc hạ ngắn hơn bậc trước: mỗi năm chờ thêm chỉ chiết khấu phần giá trị còn lại sau những năm trước.',
          'Each step is the present value for one whole number of years in the Years (n) field, from half to one and a half times the number you have entered: the step stays level for a full year before dropping to the next year’s value, because the field takes only whole years and the calculation rounds the years, leaving no fractional year to compute. It is a what-if on how long you wait, not market history. The staircase falls, each drop shorter than the one before: every extra year only discounts the value left after the earlier years.',
        ),
      },
    },
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Giá trị hiện tại rồi Phần sinh lợi cộng lại thành thanh sẫm cuối cùng, Số tiền tương lai, bằng đúng con số bạn đã nhập vào ô Số tiền trong tương lai (FV), không phải con số ở khối Kết quả, vì khối đó in đúng thanh Giá trị hiện tại. Thanh Phần sinh lợi càng dài thì phải chờ lâu hơn, hoặc chịu mức chiết khấu cao hơn, mới đổi số tiền hiện tại thành đúng khoản tương lai đã nhập.',
        'Each horizontal bar is one part, read from top to bottom: Present value (PV) then Return earned add up to the dark bar at the end, Future amount (FV), matching the amount you entered in the Future amount (FV) field, not the figure in the Result block, which prints the Present value (PV) bar instead. The longer the Return earned bar, the longer the wait, or the higher the discount rate, needed to turn that present value into the future amount you entered.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Số tiền tương lai thành hai múi, Giá trị hiện tại và Phần sinh lợi, mỗi múi to theo phần nó chiếm trong khoản tiền tương lai ấy. Lỗ giữa in Số tiền tương lai cùng giá trị của nó, bằng đúng con số bạn đã nhập vào ô Số tiền trong tương lai (FV), không phải con số ở khối Kết quả; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Giá trị hiện tại mới là con số đúng bằng khối Kết quả; múi Phần sinh lợi càng lớn thì phần phải chờ lãi kép làm ra càng chiếm nhiều trong khoản tương lai ấy.',
        'The ring splits Future amount (FV) into two slices, Present value (PV) and Return earned, each sized by its share of that future sum. The hole shows Future amount (FV) and its value, matching the amount you entered for it, not the figure in the Result block; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The Present value (PV) slice matches the Result block exactly; the bigger the Return earned slice, the more of that sum comes from compounding over the wait rather than from today’s amount.',
      ),
    },
  },

  'gia-tri-tuong-lai': {
    truc: {
      presentValue: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số tiền hiện tại (PV), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu số tiền bỏ vào hôm nay đổi thì giá trị tương lai ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên đều: lãi kép nhân mọi đồng vốn với cùng một hệ số, nên bỏ vào gấp đôi thì nhận về gấp đôi.',
          'The line runs left to right along the Present amount (PV) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the sum you put in today, not market history. The line rises steadily: compounding multiplies every unit of capital by the same factor, so putting in twice as much returns twice as much.',
        ),
        cot: d(
          'Mỗi cột là giá trị tương lai ở một mức tiền gốc, cột cao dần về bên phải và cột tô đặc là mức bạn đang nhập. Tỷ lệ giữa chiều cao một cột và số tiền gốc của nó giống hệt nhau ở mọi cột: đó là hệ số lãi kép của cả quãng thời gian.',
          'Each bar is the future value at one starting amount; bars grow taller to the right and the solid one is the amount you have entered. The ratio of a bar’s height to its own starting amount is identical for every bar: it is the compounding factor for the whole period.',
        ),
        diem: d(
          'Mỗi chấm là giá trị tương lai tính ở một mức của ô Số tiền hiện tại (PV), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu số tiền bỏ vào hôm nay đổi thì giá trị tương lai ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên thành hàng thẳng, các chấm cách đều nhau: mọi chấm nhân với cùng một hệ số lãi kép, nên khoảng chênh giữa hai chấm kề nhau chính là bước tiền gốc giữa chúng đã lớn lên theo hệ số ấy.',
          'Each dot is the future value at one level of the Present amount (PV) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the sum you put in today, not market history. The row of dots rises in a straight, evenly spaced line: every dot is multiplied by the same compounding factor, so the gap between two neighboring dots is simply the step in the starting sum grown at that factor.',
        ),
      },
      rate: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tỷ suất sinh lợi / năm (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu mức sinh lợi mỗi năm đổi thì số tiền cuối kỳ ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và càng lúc càng dốc: lãi sinh ra lại tiếp tục sinh lãi, nên mỗi điểm sinh lợi thêm vào đem về nhiều tiền hơn điểm trước đó.',
          'The line runs left to right along the Rate of return / year (r) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the yearly return, not market history. The line rises and keeps steepening: returns earn returns of their own, so each extra point of return brings in more money than the point before.',
        ),
        cot: d(
          'Mỗi cột là số tiền cuối kỳ ở một mức sinh lợi, cột cao dần về bên phải và mỗi cột thêm nhiều hơn cột trước; cột tô đặc là mức bạn đang nhập. Các bậc lớn dần ấy chính là lãi kép nhìn bằng mắt.',
          'Each bar is the ending amount at one rate of return; bars grow taller to the right, each adding more than the one before, and the solid one is the level you have entered. Those widening steps are compounding made visible.',
        ),
        diem: d(
          'Mỗi chấm là giá trị tương lai tính ở một mức của ô Tỷ suất sinh lợi / năm (r), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu mức sinh lợi mỗi năm đổi thì số tiền cuối kỳ ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên và các chấm giãn xa nhau dần về bên phải: lãi sinh ra lại sinh lãi suốt mọi năm, nên cùng một bước sinh lợi ở đầu phải đem về nhiều tiền hơn ở đầu trái.',
          'Each dot is the future value at one level of the Rate of return / year (r) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on the yearly return, not market history. The row of dots rises and the dots spread further apart to the right: returns keep earning returns year after year, so the same step in the rate brings in more money at the right-hand end than at the left.',
        ),
      },
      years: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Số năm (n), từ khoảng một nửa đến khoảng gấp rưỡi số năm bạn đang nhập, mỗi điểm cách nhau một năm; vạch đứt dọc có chấm tròn là đúng số năm bạn nhập. Đây là phép thử nếu thời gian nắm giữ đổi thì giá trị tương lai ra bao nhiêu, không phải diễn biến thị trường. Với tỷ suất sinh lợi dương, đường đi lên và dốc dần: lãi của năm sau tính trên cả lãi của những năm trước, nên càng về cuối mỗi năm thêm vào càng đem lại nhiều tiền hơn. Tỷ suất âm thì đường đi xuống, mỗi năm giữ thêm là mất thêm một phần.',
          'The line runs left to right along the Years (n) field, from about half to about one and a half times the number of years you have entered, one point per year; the dashed vertical line with a dot marks your own figure. It is a what-if on how long the money stays invested, not market history. With a positive rate of return the line rises and steepens: each year’s return is earned on all the earlier returns as well, so the later a year comes, the more money it adds. With a negative rate the line falls, each extra year losing a further slice.',
        ),
        cot: d(
          'Mỗi cột là giá trị tương lai ứng với một số năm, cột tô đặc là số năm bạn đang nhập. Với tỷ suất sinh lợi dương, cột cao dần về bên phải và bước nhảy giữa hai cột cạnh nhau cũng lớn dần: đó là lãi kép hiện ra thành hình. Tỷ suất âm thì cột thấp dần.',
          'Each bar is the future value for one number of years, and the solid one is the number you have entered. With a positive rate of return the bars grow taller to the right and the jump between neighboring bars widens too: that is compounding made visible. With a negative rate the bars shrink.',
        ),
        diem: d(
          'Mỗi chấm là giá trị tương lai ứng với một số năm nguyên của ô Số năm (n), từ khoảng một nửa đến khoảng gấp rưỡi số năm bạn đang nhập, các chấm cách nhau đúng một năm; chấm nằm trên vạch đứt dọc là đúng số năm bạn nhập. Đây là phép thử nếu thời gian nắm giữ đổi thì giá trị tương lai ra bao nhiêu, không phải diễn biến thị trường. Với tỷ suất dương, dãy chấm đi lên và giãn xa nhau dần: mỗi chấm bằng chấm trước nhân thêm cùng một hệ số. Tỷ suất âm thì dãy chấm đi xuống và sát nhau dần, mỗi năm mất cùng một tỷ lệ của phần còn lại.',
          'Each dot is the future value for one whole number of years in the Years (n) field, from about half to about one and a half times the number you have entered, the dots exactly one year apart; the dot on the dashed vertical line is your own figure. It is a what-if on how long the money stays invested, not market history. With a positive rate of return the row of dots rises and spreads further apart: each dot is the one before multiplied by the same factor. With a negative rate it falls and crowds together, losing the same proportion of what is left each year.',
        ),
        bac: d(
          'Mỗi bậc là giá trị tương lai của một số năm nguyên trên ô Số năm (n), từ khoảng một nửa đến khoảng gấp rưỡi số năm bạn đang nhập: bậc nằm ngang suốt một năm rồi mới nhảy sang mức của năm sau, vì cả ô lẫn phép tính chỉ đếm trọn từng năm, không có năm lẻ. Đây là phép thử nếu thời gian nắm giữ đổi thì giá trị tương lai ra bao nhiêu, không phải diễn biến thị trường. Với tỷ suất dương, cầu thang đi lên và mỗi bậc nhảy cao hơn bậc trước, vì lãi năm sau tính trên cả lãi các năm trước. Tỷ suất âm thì cầu thang đi xuống, mỗi bậc hạ ít hơn bậc trước.',
          'Each step is the future value for one whole number of years in the Years (n) field, from about half to about one and a half times the number you have entered: the step stays level through a year and then jumps to the next year’s value, because both the field and the calculation count whole years only. It is a what-if on how long the money stays invested, not market history. With a positive rate the staircase rises and each jump is taller than the one before, since next year’s return is earned on the earlier returns too. With a negative rate it falls, each drop smaller than the last.',
        ),
      },
    },
    coCau: {
      thanh: d(
        'Mỗi thanh nằm ngang là một phần, đọc từ trên xuống: Số tiền hiện tại rồi Phần sinh lợi cộng lại thành thanh sẫm cuối cùng, Giá trị tương lai, bằng đúng con số ở khối Kết quả. Thanh Phần sinh lợi càng dài thì lãi kép đã làm số tiền ban đầu lớn lên càng nhiều qua từng năm sinh lợi.',
        'Each horizontal bar is one part, read from top to bottom: Present amount (PV) then Return earned add up to the dark bar at the end, Future value (FV), matching the figure in the Result block exactly. The longer the Return earned bar, the more compounding has grown that starting sum over the years it was invested.',
      ),
      vanhKhuyen: d(
        'Vòng tròn chia Giá trị tương lai thành hai múi, Số tiền hiện tại và Phần sinh lợi, mỗi múi to theo phần nó chiếm trong khoản tiền cuối kỳ ấy. Lỗ giữa in Giá trị tương lai cùng giá trị của nó, bằng đúng con số ở khối Kết quả; chú giải cạnh vòng in tên, giá trị và phần trăm mỗi múi chiếm, rê chuột hay chạm một múi thì hiện tên và giá trị múi ấy. Múi Phần sinh lợi càng lớn thì phần tiền có được nhờ sinh lợi kép càng vượt xa số tiền hiện tại bỏ vào ban đầu.',
        'The ring splits Future value (FV) into two slices, Present amount (PV) and Return earned, each sized by its share of that ending sum. The hole shows Future value (FV) and its value, the figure in the Result block; the legend beside the ring gives each slice’s name, value and percentage share, and hovering over or tapping a slice shows its name and value. The bigger the Return earned slice, the further the money made from compounding outgrows the present amount originally put in.',
      ),
    },
  },

  'bien-an-toan': {
    truc: {
      intrinsic: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Giá trị nội tại ước tính (V), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu ước tính giá trị nội tại đổi thì biên an toàn ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên nhưng thoải dần: thị giá giữ nguyên, bạn định giá doanh nghiệp càng cao thì khoảng đệm so với thị giá càng dày, và nó tiến dần tới mức toàn bộ chứ không bao giờ chạm.',
          'The line runs left to right along the Estimated intrinsic value (V) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on your intrinsic value estimate, not market history. The line rises but flattens: with the market price held still, the higher you value the business the thicker the cushion over that price, creeping toward the whole value without ever reaching it.',
        ),
        cot: d(
          'Mỗi cột là biên an toàn ở một mức giá trị nội tại, cột tô đặc là mức bạn đang nhập. Các cột bên trái quay xuống dưới vạch 0 là vùng giá trị nội tại thấp hơn thị giá, tức đang mua đắt hơn giá trị; chỗ cột đổi sang mọc lên trên vạch 0 là mức giá trị nội tại vừa bằng thị giá.',
          'Each bar is the margin of safety at one intrinsic value, and the solid one is the level you have entered. Bars on the left hanging below the zero line mark intrinsic values under the market price, that is paying more than the business is worth; where they switch to standing above the zero line, intrinsic value just equals the market price.',
        ),
        diem: d(
          'Mỗi chấm là biên an toàn tính ở một mức của ô Giá trị nội tại ước tính (V), từ một nửa đến gấp rưỡi con số bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng con số bạn nhập. Đây là phép thử nếu ước tính giá trị nội tại đổi thì biên an toàn ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi lên và sát nhau dần về bên phải: thị giá giữ nguyên, mỗi phần giá trị nội tại thêm vào làm khoảng đệm dày thêm ít hơn phần trước. Chấm nằm dưới 0 là mức giá trị nội tại thấp hơn thị giá.',
          'Each dot is the margin of safety at one level of the Estimated intrinsic value (V) field, from half to one and a half times the figure you have entered; the dot on the dashed vertical line is your own figure. It is a what-if on your intrinsic value estimate, not market history. The row of dots rises and the dots crowd closer together to the right: with the market price held still, each further rise in intrinsic value thickens the cushion less than the one before. Dots below 0 are values under the market price.',
        ),
        laiLo: d(
          'Dạng này hiện khi thị giá nằm trong dải đang vẽ của ô Giá trị nội tại ước tính (V), như ở bộ số mặc định. Phần dưới vạch 0 tô đỏ, bên trái, là những mức giá trị nội tại thấp hơn thị giá: mua ở giá ấy là trả nhiều hơn giá trị bạn ước; phần trên vạch 0 tô xanh, bên phải, là khoảng đệm khi giá trị cao hơn thị giá. Đây là phép thử nếu ước tính giá trị nội tại đổi thì biên an toàn ra bao nhiêu, không phải diễn biến thị trường. Đường đi lên và cắt vạch 0 đúng ở mức giá trị nội tại bằng thị giá.',
          'This form appears when the market price lies within the range drawn for the Estimated intrinsic value (V) field, as it does with the default figures. The red part below the zero line, on the left, is intrinsic values under the market price: buying at that price means paying more than your estimate; the green part above, on the right, is the cushion when value exceeds the price. It is a what-if on your intrinsic value estimate, not market history. The line rises and crosses the zero line exactly where intrinsic value equals the market price.',
        ),
      },
      price: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Thị giá hiện tại (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; vạch đứt dọc có chấm tròn là đúng mức giá bạn nhập. Đây là phép thử nếu thị giá đổi mà giá trị nội tại bạn ước tính đứng yên thì biên an toàn ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều, tức đi ngược với giá: giá càng cao thì khoảng đệm giữa giá và giá trị càng mỏng, và khi đường xuống dưới 0 là giá đã vượt giá trị nội tại.',
          'The line runs left to right along the Current market price (P) field, from half to one and a half times the price you have entered; the dashed vertical line with a dot marks your own price. It is a what-if on the market price with your estimate of intrinsic value held still, not market history. The line falls steadily, that is against the price: the higher the price, the thinner the cushion between price and value, and once the line drops below 0 the price has passed intrinsic value.',
        ),
        cot: d(
          'Mỗi cột là biên an toàn ở một mức giá, cột tô đặc là mức giá bạn đang nhập. Cột mọc lên trên vạch 0 là vùng giá còn dưới giá trị nội tại; cột quay xuống dưới vạch 0 ở bên phải là vùng mua vào đã đắt hơn giá trị ước tính.',
          'Each bar is the margin of safety at one price, and the solid one is the price you have entered. Bars standing above the zero line are prices still below intrinsic value; bars hanging below the zero line on the right are prices where buying already costs more than the estimated value.',
        ),
        diem: d(
          'Mỗi chấm là biên an toàn tính ở một mức của ô Thị giá hiện tại (P), từ một nửa đến gấp rưỡi mức giá bạn đang nhập; chấm nằm trên vạch đứt dọc là đúng mức giá bạn nhập. Đây là phép thử nếu thị giá đổi mà giá trị nội tại bạn ước tính đứng yên thì biên an toàn ra bao nhiêu, không phải diễn biến thị trường. Dãy chấm đi xuống thành hàng thẳng, các chấm cách đều nhau: mỗi bước giá lấy đi cùng một phần khoảng đệm, bằng bước ấy tính theo phần trăm của giá trị nội tại. Chấm nằm dưới 0 là mức giá đã vượt giá trị nội tại.',
          'Each dot is the margin of safety at one level of the Current market price (P) field, from half to one and a half times the price you have entered; the dot on the dashed vertical line is your own price. It is a what-if on the market price with your estimate of intrinsic value held still, not market history. The row of dots falls in a straight, evenly spaced line: each price step removes the same share of the cushion, that step measured as a percentage of intrinsic value. Dots below 0 are prices above intrinsic value.',
        ),
        laiLo: d(
          'Dạng này hiện khi giá trị nội tại bạn ước tính nằm trong dải giá đang vẽ của ô Thị giá hiện tại (P), như ở bộ số mặc định. Phần trên vạch 0 tô xanh, bên trái, là những mức giá còn dưới giá trị nội tại, mua vào còn khoảng đệm; phần dưới vạch 0 tô đỏ, bên phải, là mức giá đã cao hơn giá trị bạn ước. Đây là phép thử nếu thị giá đổi mà giá trị nội tại đứng yên thì biên an toàn ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều và cắt vạch 0 đúng ở mức giá bằng giá trị nội tại.',
          'This form appears when your intrinsic value estimate lies within the range of prices drawn for the Current market price (P) field, as it does with the default figures. The green part above the zero line, on the left, is prices still below intrinsic value, where buying leaves a cushion; the red part below, on the right, is prices already above your estimate. It is a what-if on the market price with intrinsic value held still, not market history. The line falls steadily and crosses the zero line exactly where the price equals intrinsic value.',
        ),
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là biên an toàn tính với giá đóng cửa của phiên đó, còn giá trị nội tại vẫn là con số bạn nhập. Hình này đi theo chuỗi giá bạn đã nạp, nhưng đi NGƯỢC chiều giá. Đường đi lên là giá đang giảm: phần nằm trên 0 là khoảng đệm đang dày thêm, phần nằm dưới 0 là giá chỉ bớt cao hơn giá trị nội tại. Đường đi xuống là giá đang tăng, tiến sát rồi vượt giá trị ấy.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the margin of safety at that session’s closing price, with intrinsic value kept at the figure you entered. It follows the price series you loaded, but moves AGAINST the price. When it rises the price is dropping: above 0 the cushion is thickening, below 0 the price is merely less far above intrinsic value. When it falls the price is climbing toward that value or past it.',
      ),
      cot: d(
        'Mỗi cột là biên an toàn của một phiên, cột cuối bên phải là phiên gần nhất. Cột mọc lên trên vạch 0 là phiên giá còn dưới giá trị nội tại; cột quay xuống dưới vạch 0 là phiên giá đã vượt giá trị ấy.',
        'Each bar is the margin of safety of one session, the last one on the right being the latest. A bar standing above the zero line is a session priced below intrinsic value; one hanging below the zero line is a session priced above it.',
      ),
      diem: d(
        'Mỗi chấm là biên an toàn của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; biên tính với giá đóng cửa của phiên ấy, còn giá trị nội tại vẫn là con số bạn nhập. Hình đi theo chuỗi giá bạn đã nạp nhưng ngược chiều với giá. Dãy chấm đi lên là giá đang giảm và khoảng đệm dày thêm; đi xuống là giá đang tăng, tiến sát rồi vượt giá trị nội tại. Chấm nằm dưới 0 là phiên giá đã cao hơn giá trị ấy, còn chấm tách hẳn khỏi các chấm quanh nó là phiên giá đổi mạnh.',
        'Each dot is the margin of safety of one session, running from the oldest session on the left to the most recent session on the right; it uses that session’s closing price, with intrinsic value kept at the figure you entered. The chart follows the price series you loaded, but against the price. When the row of dots rises the price is dropping and the cushion is thickening; when it falls the price is climbing toward intrinsic value or past it. Dots below 0 are sessions priced above that value, and a dot standing apart from its neighbors is a session where the price moved sharply.',
      ),
      bac: d(
        'Mỗi bậc là biên an toàn của một phiên, đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải: bậc nằm ngang suốt phiên ấy rồi mới nhảy sang mức của phiên sau, vì giữa hai phiên không có giá đóng cửa nào. Giá trị nội tại vẫn là con số bạn nhập, nên cầu thang đi ngược chiều giá: đi lên là giá đang giảm, đi xuống là giá đang tăng. Mỗi bậc nhảy cao đúng bằng mức giá đổi so với phiên trước, tính theo phần trăm của giá trị nội tại; bậc rơi xuống dưới 0 là phiên giá vượt giá trị ấy.',
        'Each step is the margin of safety of one session, running from the oldest session on the left to the most recent session on the right: the step stays level through that session and then jumps to the next one, because there is no closing price between two sessions. Intrinsic value stays at the figure you entered, so the staircase moves against the price: when it rises the price is dropping, when it falls the price is climbing. Each jump is the size of that session’s price change, measured as a percentage of intrinsic value; a step dropping below 0 is a session priced above that value.',
      ),
    },
  },
};
