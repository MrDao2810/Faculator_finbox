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
      },
      cash: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Tiền và tương đương tiền, từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lượng tiền mặt đổi mà vốn hoá và nợ vay đứng yên thì EV ra bao nhiêu, không phải diễn biến thị trường. Đường đi xuống đều: mua xong doanh nghiệp thì tiền trong két về tay người mua, nên mỗi đồng tiền mặt làm cái giá thật giảm đúng một đồng.',
          'The line runs left to right along the Cash and cash equivalents field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on cash with market cap and debt held still, not market history. The line falls steadily: once the company is bought its cash belongs to the buyer, so each unit of cash lowers the real price by exactly one unit.',
        ),
        cot: d(
          'Mỗi cột là EV ở một mức tiền mặt, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Doanh nghiệp ôm nhiều tiền nằm ở các cột thấp bên phải: vốn hoá của nó trông lớn nhưng một phần là tiền người mua lấy lại được ngay.',
          'Each bar is EV at one cash level; bars shrink to the right and the solid one is the level you have entered. A cash-rich company sits on the short bars to the right: its market cap looks large, but part of it is money the buyer gets straight back.',
        ),
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. Vốn hoá và Nợ vay là hai thanh tô màu, tức hai khoản cộng vào; Tiền mặt là thanh viền nét đứt, tức khoản trừ ra; thanh sẫm cuối cùng là EV và bằng đúng con số ở khối Kết quả. Trong ba thanh thành phần, thanh dài nhất là khoản quyết định EV nhiều nhất. Hình không có xu thế nào để đọc: nó cho thấy cái giá mua trọn doanh nghiệp ghép từ những phần nào.',
      'This chart has a single form: horizontal bars, read from top to bottom. Market cap and Debt are the two filled bars, the amounts added in; Cash is the bar with a dashed outline, the amount taken out; the dark bar at the end is EV and matches the figure in the Result block exactly. Of the three component bars, the longest is the part that drives the total most. There is no trend to read here: the chart shows which pieces the price of buying the whole company is made of.',
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
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. TSNH mỗi CP là thanh tô màu, phần tài sản ngắn hạn chia cho mỗi cổ phiếu; Trừ nợ mỗi CP là thanh viền nét đứt, toàn bộ nợ phải trả chia cho mỗi cổ phiếu; thanh sẫm cuối cùng là NCAV và bằng đúng con số ở khối Kết quả. Thanh trừ dài gần bằng thanh cộng thì tài sản ngắn hạn chỉ vừa đủ trả nợ, và phần còn lại cho cổ đông rất mỏng.',
      'This chart has a single form: horizontal bars, read from top to bottom. Current assets/share is the filled bar, current assets spread over each share; Less liabilities/share is the bar with a dashed outline, all liabilities spread over each share; the dark bar at the end is NCAV and matches the figure in the Result block exactly. When the minus bar is nearly as long as the plus bar, current assets barely cover the debts and little is left for shareholders.',
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
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. Cổ tức giai đoạn đầu và Giá trị cuối kỳ là hai thanh tô màu cộng lại với nhau; thanh sẫm cuối cùng là Giá trị cổ phiếu và bằng đúng con số ở khối Kết quả. Thanh thứ hai thường dài hơn hẳn thanh đầu: phần lớn giá trị nằm ở quãng sau những năm tăng trưởng nhanh, tức ở giả định xa nhất và khó kiểm chứng nhất.',
      'This chart has a single form: horizontal bars, read from top to bottom. First-stage dividends and Terminal value are two filled bars that add together; the dark bar at the end is Share value and matches the figure in the Result block exactly. The second bar is usually far longer than the first: most of the value lies beyond the fast-growth years, in the most distant and least checkable assumption.',
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
      },
    },
  },

  wacc: {
    truc: {
      equity: {
        duong: d(
          'Đường chạy từ trái sang phải theo ô Vốn chủ sở hữu (E), từ một nửa đến gấp rưỡi con số bạn đang nhập; vạch đứt dọc có chấm tròn là đúng con số bạn nhập. Đây là phép thử nếu lượng vốn chủ đổi mà nợ vay và hai mức chi phí vốn đứng yên thì WACC ra bao nhiêu, không phải diễn biến thị trường. Khi vốn chủ đắt hơn nợ vay sau thuế, đường đi lên nhưng thoải dần: tỷ trọng vốn chủ càng lớn thì chi phí vốn bình quân càng nhích về phía chi phí vốn chủ. Khi nợ vay sau thuế đắt hơn thì đường đi xuống, vì thêm vốn chủ là thêm nguồn vốn rẻ hơn.',
          'The line runs left to right along the Equity (E) field, from half to one and a half times the figure you have entered; the dashed vertical line with a dot marks your own figure. It is a what-if on the amount of equity with debt and both costs of capital held still, not market history. When equity costs more than after-tax debt the line rises but flattens: the larger equity’s weight, the closer the blended cost drifts toward the cost of equity. When after-tax debt costs more the line falls, because more equity means more of the cheaper funding.',
        ),
        cot: d(
          'Mỗi cột là WACC ở một mức vốn chủ, cột tô đặc là mức bạn đang nhập. Khi vốn chủ đắt hơn nợ vay sau thuế, cột cao dần về bên phải và tiến tới chi phí vốn chủ mà không vượt nó: đó là mức của một doanh nghiệp không vay đồng nào. Khi nợ vay sau thuế đắt hơn thì cột thấp dần về mức ấy.',
          'Each bar is WACC at one equity level, and the solid one is the level you have entered. When equity costs more than after-tax debt the bars grow taller to the right and creep toward the cost of equity without passing it: that is the level of a company that borrows nothing. When after-tax debt costs more the bars shrink toward that same level.',
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
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. Phần vốn chủ và Phần nợ vay là hai thanh tô màu cộng lại với nhau, mỗi thanh đã nhân sẵn tỷ trọng của nguồn vốn ấy và phần nợ đã trừ lá chắn thuế; thanh sẫm cuối cùng là WACC và bằng đúng con số ở khối Kết quả. Thanh nào dài hơn là nguồn vốn ấy đang gánh phần lớn chi phí vốn của doanh nghiệp.',
      'This chart has a single form: horizontal bars, read from top to bottom. Equity portion and Debt portion are two filled bars that add together, each already multiplied by that source’s weight and the debt one already net of the tax shield; the dark bar at the end is WACC and matches the figure in the Result block exactly. The longer bar is the funding source carrying most of the company’s cost of capital.',
    ),
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
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. EBIT sau thuế và Khấu hao là hai thanh tô màu, tiền đi vào; Chi đầu tư và Tăng VLĐ ròng là hai thanh viền nét đứt, tiền doanh nghiệp phải bỏ lại để tiếp tục hoạt động; thanh sẫm cuối cùng là FCFF và bằng đúng con số ở khối Kết quả. Nếu vốn lưu động giảm, thanh Tăng VLĐ ròng đổi sang tô màu vì tiền quay về. Hai thanh trừ dài gần bằng hai thanh cộng là doanh nghiệp làm ra tiền nhưng phải tái đầu tư gần hết.',
      'This chart has a single form: horizontal bars, read from top to bottom. After-tax EBIT and Depreciation are the two filled bars, cash coming in; CapEx and Increase in net WC are the two bars with a dashed outline, cash the company must leave behind to keep operating; the dark bar at the end is FCFF and matches the figure in the Result block exactly. If working capital falls, the Increase in net WC bar turns filled. When the two minus bars nearly match the two plus bars, the company makes cash but has to reinvest almost all of it.',
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
      },
    },
    bocTach: d(
      'Hình này chỉ có một dạng: các thanh nằm ngang, đọc từ trên xuống. FCFF là thanh tô màu mở đầu; Lãi vay sau thuế là thanh viền nét đứt, phần phải trả cho chủ nợ; Vay ròng mới là thanh tô màu khi doanh nghiệp vay thêm, và đổi sang viền nét đứt khi kỳ ấy trả nợ nhiều hơn vay; thanh sẫm cuối cùng là FCFE và bằng đúng con số ở khối Kết quả. Nếu thanh FCFE dài chủ yếu nhờ thanh Vay ròng mới thì dòng tiền của cổ đông đang đến từ nợ chứ không từ hoạt động kinh doanh.',
      'This chart has a single form: horizontal bars, read from top to bottom. FCFF is the filled bar that opens it; After-tax interest is the bar with a dashed outline, what goes to lenders; New net borrowing is a filled bar when the company borrows more and a dashed one when it repays more than it borrows; the dark bar at the end is FCFE and matches the figure in the Result block exactly. If that last bar is long mainly because of New net borrowing, shareholders’ cash is coming from debt rather than from the business.',
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
      },
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
      },
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
    },
  },
};
