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
      },
    },
    thoiGian: {
      duong: d(
        'Đường đi từ phiên cũ nhất bên trái tới phiên gần nhất bên phải; mỗi điểm là P/B tính với giá đóng cửa của phiên đó, còn giá trị sổ sách vẫn là con số bạn nhập. Hình này đi theo đúng chuỗi giá bạn đã nạp, không còn là phép thử. Đường đi lên là giá đang cao dần so với sổ sách, đi xuống là khoảng chênh ấy đang thu lại.',
        'The line runs from the oldest session on the left to the most recent session on the right; each point is the P/B at that session’s closing price, with book value kept at the figure you entered. It follows the price series you loaded and is no longer a what-if. When it rises the price is carrying a growing premium over book; when it falls that premium is shrinking.',
      ),
      cot: d(
        'Mỗi cột là P/B của một phiên, cột cuối bên phải là phiên gần nhất. Nhìn cả dãy để thấy mức P/B mà chuỗi đã nạp hay quay về: cột cuối cao hơn hẳn mức ấy là giá đang đứng trên mức quen thuộc của chính nó.',
        'Each bar is the P/B of one session, the last one on the right being the latest. Read the whole row to see the P/B level the loaded series tends to return to: a last bar well above that level means the price sits above its own usual range.',
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
      },
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
      },
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
      },
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
      },
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
      },
    },
  },
};
