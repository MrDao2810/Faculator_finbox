/**
 * Kho chữ "Đọc biểu đồ" cho sáu mục chỉ có MỘT hình riêng của công thức (10/11/2026): đường thành
 * phần, phân phối lợi suất, đường sụt giảm, phân tán lợi suất, cột theo kỳ, thang đo. 40 hình.
 *
 * Tới ngày này khung "?" im với cả sáu (chủ dự án từng chốt "hướng dẫn sử dụng thì chưa cần"). Rồi họ
 * chụp "Đường MACD - hai đường EMA" và hỏi vì sao thiếu hướng dẫn, và chọn viết cho cả 40 hình.
 *
 * Luật chữ y như kho chính (`kiem.ts`): không chữ số, trừ 0 và mốc công thức tự khai (30, 70 của RSI);
 * gọi đúng tên mọi đường, phần cột, vạch, vùng (chỉ phần chữ, vì con số trong nhãn đổi theo ô nhập);
 * hình chỉ có sau khi nạp chuỗi thì nói chuỗi "đã nạp"; không gạch ngang dài. Mỗi đoạn đã đọc đối
 * chiếu với `calc` và với bộ dựng biểu đồ; đoạn mới thêm cũng phải thế.
 */

import type { Bilingual } from '../../../types';
import type { BieuDoRieng, HaiDang } from '../types';
import { d } from './tao';

type Rieng = Pick<
  BieuDoRieng,
  'thanhPhan' | 'phanPhoi' | 'sutGiam' | 'phanTan' | 'cotTheoKy' | 'thangDo'
>;

/* ── Phân phối lợi suất ─────────────────────────────────────────────────────────────────────── */

/**
 * Khung chung của mọi hình phân phối: nói cột là gì, hình dựng từ đâu, vạch Bình quân là gì; phần
 * `them` là cách đọc riêng của từng công thức.
 */
function phanPhoi(
  them: Bilingual,
  loaiVi = 'lợi suất một phiên',
  loaiEn = 'return per session',
): Bilingual {
  return d(
    `Mỗi cột là một khoảng ${loaiVi}, cột càng cao thì càng nhiều phiên rơi vào khoảng ấy. Hình dựng từ chuỗi giá đã nạp, đúng những phiên công thức đọc, và không có trục thời gian. Vạch đứng Bình quân đánh dấu mức trung bình của cả cửa sổ. ${them.vi}`,
    `Each bar is a range of ${loaiEn}, and the taller the bar, the more sessions fall in that range. The chart is built from the loaded price series, using exactly the sessions the formula reads, and it has no time axis. The vertical line Average marks the mean of the whole window. ${them.en}`,
  );
}

const PHAN_PHOI: Readonly<Record<string, Bilingual>> = {
  'var-lich-su': phanPhoi(
    d(
      'Vạch VaR lịch sử theo phân vị nằm ở mức lỗ mà công thức tính ra, lấy dấu âm: phần cột nằm bên trái vạch là những phiên tệ nhất, chiếm tỷ lệ bằng phần còn lại của mức tin cậy bạn chọn. Đuôi trái càng dài và dày thì vạch càng lùi sâu về bên trái.',
      'The line Historical VaR (percentile method) sits at the loss the formula computes, shown as a negative return: the bars to its left are the worst sessions, a share equal to what is left of the confidence level you chose. The longer and thicker the left tail, the further left the line moves.',
    ),
  ),
  'cvar-lich-su': phanPhoi(
    d(
      'Vạch CVaR nằm ở mức lỗ trung bình của những phiên tệ nhất, lấy dấu âm, nên luôn nằm sâu hơn vạch VaR cùng mức tin cậy. Cột nằm bên trái vạch VaR là đuôi trái; CVaR cho biết trung bình đuôi ấy lỗ bao nhiêu.',
      'The line CVaR sits at the average loss of the worst sessions, shown as a negative return, so it always lies deeper than the VaR line at the same confidence level. The bars left of the VaR line are the left tail, and CVaR tells you how much that tail loses on average.',
    ),
  ),
  'do-lech-chuan-loi-suat-phien': phanPhoi(
    d(
      'Độ lệch chuẩn đo mức các cột tản ra quanh vạch Bình quân: hình càng bè và các cột xa vạch càng cao thì kết quả càng lớn, hình càng nhọn quanh vạch thì kết quả càng nhỏ.',
      'The standard deviation measures how far the bars spread around the line Average: the wider the shape and the taller the bars far from the line, the larger the result; the more peaked around the line, the smaller.',
    ),
  ),
  'do-bien-dong-nam-hoa': phanPhoi(
    d(
      'Kết quả là độ tản ra của chính hình này, nhân lên cho cả năm. Cột tản càng xa vạch Bình quân thì độ biến động năm hoá càng cao.',
      'The result is the spread of this very shape, scaled up to a full year. The farther the bars spread from the line Average, the higher the annualized volatility.',
    ),
  ),
  'do-lech-chuan-ban-phan': phanPhoi(
    d(
      'Công thức chỉ để ý phần cột nằm dưới ngưỡng, tức đuôi trái; các phiên tốt hơn ngưỡng không làm kết quả lớn thêm. Đuôi trái càng dài và dày thì độ lệch chuẩn bán phần càng lớn, dù bên phải có đẹp đến đâu.',
      'The formula only counts the bars below the threshold, the left tail; sessions better than the threshold do not raise the result. The longer and thicker the left tail, the larger the downside deviation, however good the right side looks.',
    ),
  ),
  'he-so-bien-thien': phanPhoi(
    d(
      'Hệ số biến thiên so độ tản của các cột với vị trí vạch Bình quân. Cùng một độ tản, vạch Bình quân nằm càng gần 0 thì tỷ số càng lớn; vạch ấy nằm ở 0 hoặc bên trái 0 thì công thức không tính được.',
      'The coefficient of variation compares the spread of the bars with where the line Average sits. For the same spread, the closer that line is to 0, the larger the ratio; with the line at or left of 0 the formula cannot be computed.',
    ),
  ),
  'ty-so-sharpe': phanPhoi(
    d(
      'Tử số của Sharpe là khoảng cách từ vạch Bình quân tới lãi suất phi rủi ro của một phiên, mẫu số là độ tản của các cột. Vạch Bình quân càng xa về bên phải và các cột càng tụm lại thì tỷ số càng lớn.',
      'The Sharpe numerator is the distance from the line Average to the per-session risk-free rate, and the denominator is the spread of the bars. The farther right the line Average and the tighter the bars, the larger the ratio.',
    ),
  ),
  'ty-so-sortino': phanPhoi(
    d(
      'Mẫu số của Sortino chỉ lấy phần cột nằm dưới ngưỡng phi rủi ro, tức đuôi trái; phần bên phải ngưỡng không bị tính là rủi ro. Vạch Bình quân càng xa bên phải và đuôi trái càng ngắn thì tỷ số càng lớn.',
      'The Sortino denominator only takes the bars below the risk-free threshold, the left tail; the part right of the threshold is not counted as risk. The farther right the line Average and the shorter the left tail, the larger the ratio.',
    ),
  ),
  'ty-so-treynor': phanPhoi(
    d(
      'Hình này chỉ cho thấy phần tử số của Treynor: vạch Bình quân so với lãi suất phi rủi ro. Mẫu số là beta, không nằm trên hình này, nên độ tản của các cột không đổi trực tiếp kết quả.',
      'This chart shows only the numerator of Treynor: the line Average against the risk-free rate. The denominator is beta, which is not on this chart, so the spread of the bars does not directly change the result.',
    ),
  ),
  'ty-so-thong-tin': phanPhoi(
    d(
      'Hình vẽ lợi suất của chính chuỗi giá đã nạp, không phải phần chênh lệch với mức chuẩn mà tỷ số thông tin thật sự đo. Vì vậy hãy xem nó như bức tranh chung về nhịp dao động của chuỗi, chứ không phải tử số hay mẫu số của công thức.',
      'The chart draws the returns of the loaded series itself, not the difference from the benchmark that the information ratio actually measures. Treat it as a general picture of how the series moves, not as the numerator or denominator of the formula.',
    ),
  ),
  'ty-so-thang-thua': phanPhoi(
    d(
      'Cột bên phải 0 là các phiên tăng, cột bên trái 0 là các phiên giảm. Tỷ số thắng thua là mức tăng trung bình của phía phải chia cho mức giảm trung bình của phía trái: phía phải càng xa 0 và phía trái càng gần 0 thì tỷ số càng cao.',
      'Bars right of 0 are rising sessions and bars left of 0 are falling sessions. The win/loss ratio is the average gain on the right divided by the average loss on the left: the farther the right side from 0 and the closer the left side, the higher the ratio.',
    ),
  ),
  'do-bien-dong-lich-su': phanPhoi(
    d(
      'Công thức tính trên lợi suất log, nên các cột ở đây cũng là lợi suất log chứ không phải lợi suất thường. Độ biến động lịch sử là độ tản của các cột này quanh vạch Bình quân, nhân lên cho cả năm.',
      'The formula works on log returns, so the bars here are log returns too, not simple returns. Historical volatility is the spread of these bars around the line Average, scaled up to a full year.',
    ),
    'lợi suất log một phiên',
    'log return per session',
  ),
};

/* ── Đường sụt giảm ─────────────────────────────────────────────────────────────────────────── */

/** Bốn dạng của đường sụt giảm; `danhDau` là câu nói điểm được đánh dấu nghĩa là gì. */
function sutGiam(danhDau: Bilingual): HaiDang {
  return {
    duong: d(
      `Đường mức sụt của giá so với đỉnh đã qua, đi từ phiên cũ nhất tới phiên gần nhất của chuỗi đã nạp. Đường đi lên là giá đang lún sâu hơn đỉnh, đường đi xuống là giá hồi lại gần đỉnh, và chạm 0 là giá vừa lập đỉnh mới. ${danhDau.vi}`,
      `The drop of the price below its running peak, from the oldest session to the most recent session of the loaded series. The line rises when the price sinks deeper below the peak, falls when it recovers toward the peak, and touches 0 when it sets a new peak. ${danhDau.en}`,
    ),
    cot: d(
      'Mỗi phiên một cột đứng từ 0, từ phiên cũ nhất tới phiên gần nhất của chuỗi đã nạp. Cột càng cao là phiên ấy giá càng nằm sâu dưới đỉnh trước đó; phiên nào không có cột là phiên giá vừa lập đỉnh mới.',
      'One bar per session standing on 0, from the oldest session to the most recent session of the loaded series. The taller the bar, the deeper the price sits below the earlier peak that session; a session with no bar is one where the price just set a new peak.',
    ),
    diem: d(
      `Mỗi phiên một chấm, từ phiên cũ nhất tới phiên gần nhất của chuỗi đã nạp, không nối với nhau. Chấm đi lên là giá lún sâu hơn đỉnh, chấm đi xuống là giá hồi lại, chấm nằm trên 0 là đang dưới đỉnh. ${danhDau.vi}`,
      `One dot per session, from the oldest session to the most recent session of the loaded series, not joined. A dot rises as the price sinks deeper below the peak, falls as it recovers, and a dot above 0 means the price is below its peak. ${danhDau.en}`,
    ),
    bac: d(
      'Mức sụt của mỗi phiên được giữ nguyên thành một bậc cho tới phiên kế tiếp, từ phiên cũ nhất tới phiên gần nhất của chuỗi đã nạp. Bậc đi lên là giá lún sâu hơn đỉnh, bậc đi xuống là giá hồi lại, và bậc nằm trên 0 là giá chưa quay về đỉnh.',
      'The drop of each session is held as a step until the next session, from the oldest session to the most recent session of the loaded series. A step rises as the price sinks deeper below the peak, falls as it recovers, and a step above 0 means the price has not returned to its peak.',
    ),
  };
}

const SUT_GIAM: Readonly<Record<string, HaiDang>> = {
  'sut-giam-sau-nhat': sutGiam(
    d(
      'Điểm được đánh dấu là phiên đầu tiên chạm mức sụt sâu nhất của cửa sổ đã chọn, và độ cao của nó chính là kết quả.',
      'The marked point is the first session to reach the deepest drop in the chosen window, and its height is the result.',
    ),
  ),
  'sut-giam-hien-tai': sutGiam(
    d(
      'Điểm được đánh dấu là phiên gần nhất, và độ cao của nó chính là kết quả.',
      'The marked point is the most recent session, and its height is the result.',
    ),
  ),
  'chuoi-phien-giam-dai-nhat': sutGiam(
    d(
      'Điểm được đánh dấu là chỗ chuỗi phiên giảm liên tiếp dài nhất kết thúc. Kết quả là số phiên của chuỗi ấy chứ không phải độ cao của điểm, nên đường chỉ cho thấy chuỗi nằm ở đâu trong chuỗi giá.',
      'The marked point is where the longest run of consecutive falling sessions ends. The result is the number of sessions in that run, not the height of the point, so the line only shows where the run sits in the price series.',
    ),
  ),
  'ty-so-calmar': sutGiam(
    d(
      'Điểm được đánh dấu là chỗ sụt sâu nhất, và độ cao của nó là mẫu số của tỷ số Calmar: sụt càng sâu thì tỷ số càng thấp.',
      'The marked point is the deepest drop, and its height is the denominator of the Calmar ratio: the deeper the drop, the lower the ratio.',
    ),
  ),
};

/* ── Đường thành phần ───────────────────────────────────────────────────────────────────────── */

const THANH_PHAN: Readonly<Record<string, Bilingual>> = {
  'giao-cat-hai-duong-ma': d(
    'Hai đường SMA và Giá đóng cửa vẽ cùng một trục, từ phiên cũ nhất tới phiên gần nhất của chuỗi đã nạp; hình này là giá, không phải mức chênh lệch. Kết quả là khoảng cách giữa hai đường SMA: khi chúng cắt nhau, khoảng cách bằng 0, và đường SMA ngắn nằm trên hay dưới đường dài cho biết dấu của kết quả.',
    'The two SMA lines and the Closing price share one axis, from the oldest session to the most recent session of the loaded series; this chart shows prices, not the difference. The result is the gap between the two lines: where they cross the gap is 0, and whether the short session SMA is above or below the long one gives the sign of the result.',
  ),
  'macd-duong-chinh': d(
    'Hai đường EMA và Giá đóng cửa vẽ cùng một trục, từ phiên cũ nhất tới phiên gần nhất của chuỗi đã nạp. Đường MACD chính là khoảng cách giữa EMA nhanh và EMA chậm: hai đường càng xa nhau thì MACD càng lớn, cắt nhau thì MACD bằng 0. Phần đầu chuỗi bị gạch chéo vì EMA chưa đủ phiên để tính.',
    'The two session EMA lines and the Closing price share one axis, from the oldest session to the most recent session of the loaded series. The MACD line is the gap between the fast and the slow EMA: the farther apart they are, the larger the MACD, and where they cross it is 0. The start of the series is hatched because the EMA lacks enough sessions to compute.',
  ),
  'macd-duong-tin-hieu': d(
    'Đường MACD và Đường tín hiệu vẽ cùng một trục, từ phiên cũ nhất tới phiên gần nhất của chuỗi đã nạp; đây là hai đường số đo, không phải giá. Đường tín hiệu là bản làm mượt của đường MACD nên chạy chậm hơn; kết quả là khoảng cách giữa hai đường, và hai đường cắt nhau thì khoảng cách bằng 0.',
    'The MACD line and the session signal line share one axis, from the oldest session to the most recent session of the loaded series; these are two indicator lines, not prices. The signal line is a smoothed copy of the MACD line, so it moves more slowly; the result is the gap between them, and where they cross the gap is 0.',
  ),
  'dong-luong-momentum': d(
    'Giá đóng cửa và đường Giá trước đó một số phiên vẽ cùng một trục, từ phiên cũ nhất tới phiên gần nhất của chuỗi đã nạp. Đường thứ hai chính là đường giá dịch sang phải đúng số phiên đã chọn, nên khoảng cách giữa hai đường tại một phiên là động lượng của phiên ấy: giá đóng cửa nằm trên đường kia là động lượng dương.',
    'The Closing price and the line Price a set number of sessions earlier share one axis, from the oldest session to the most recent session of the loaded series. The second line is the price line shifted right by exactly the chosen number of sessions, so the gap between the two at a session is the momentum of that session: the closing price above the other line means positive momentum.',
  ),
  'atr-dao-dong-thuc': d(
    'Đường ATR và đường mảnh Dao động thực từng phiên vẽ cùng một trục, từ phiên cũ nhất tới phiên gần nhất của chuỗi đã nạp; đây là biên độ giá của mỗi phiên, không phải giá. ATR là mức trung bình có làm mượt của dao động thực, nên chạy êm hơn: đường mảnh nhảy theo từng phiên, ATR chỉ dịch dần theo nó.',
    'The session ATR line and the thin True range per session line share one axis, from the oldest session to the most recent session of the loaded series; they show the price range of each session, not the price. ATR is a smoothed average of the true range, so it moves more calmly: the thin line jumps with each session while ATR only drifts after it.',
  ),
  'bien-do-dao-dong-lon-nhat': d(
    'Giá đóng cửa cao nhất và Giá đóng cửa thấp nhất của cửa sổ, cùng Giá đóng cửa, vẽ trên một trục, từ phiên cũ nhất tới phiên gần nhất của chuỗi đã nạp. Hai đường kia là đỉnh và đáy của cửa sổ trượt tới từng phiên; khoảng cách giữa chúng, tính theo phần trăm của đáy, là biên độ dao động.',
    'The Highest close and the Lowest close of the window, together with the Closing price, share one axis, from the oldest session to the most recent session of the loaded series. The first two are the peak and the trough of the window sliding up to each session; the gap between them, as a percentage of the trough, is the range.',
  ),
};

/* ── Phân tán lợi suất (Beta) ───────────────────────────────────────────────────────────────── */

const PHAN_TAN: Bilingual = d(
  'Mỗi chấm Từng phiên là một phiên: vị trí ngang là lợi suất VN-Index của phiên ấy, vị trí dọc là lợi suất cổ phiếu. Hình dựng từ chuỗi giá đã nạp, đúng những phiên công thức hồi quy. Đường hồi quy đi qua đám chấm, và độ dốc của nó đọc theo số trên hai trục chính là beta: dốc lên càng mạnh thì cổ phiếu càng đi theo thị trường mạnh, nằm ngang là gần như không theo, dốc xuống là đi ngược. Hai vạch 0 chia hình thành bốn góc.',
  'Each dot Each session is one session: its horizontal position is the VN-Index return that session and its vertical position the stock return. The chart is built from the loaded price series, using exactly the sessions the formula regresses. The Regression line runs through the cloud, and its slope, read in the numbers on the two axes, is the beta: the steeper it rises, the more strongly the stock follows the market, flat means it barely follows, and falling means it moves against it. The two zero lines split the chart into four quadrants.',
);

/* ── Cột theo kỳ ────────────────────────────────────────────────────────────────────────────── */

const COT_THEO_KY: Readonly<Record<string, Bilingual>> = {
  'ddm-hai-giai-doan': d(
    'Mỗi cột là cổ tức của một năm trong giai đoạn tăng trưởng đầu. Phần Giá trị hôm nay là phần còn lại của khoản ấy khi quy về hôm nay; Phần mất do chiết khấu xếp lên trên là phần bị bớt vì tiền nhận càng xa càng ít giá trị. Hai phần cộng lại là cổ tức đúng năm ấy. Giai đoạn sau, giá trị cuối kỳ, không có cột.',
    "Each bar is the dividend of one year in the first growth stage. The part Value today is what is left of that payment once brought back to today; the part Lost to discounting stacked on top is what is shaved off because money received later is worth less. Together they make that year's dividend. The second stage, the terminal value, has no bar.",
  ),
  'gia-tri-hien-tai': d(
    'Mỗi cột là số dư vào cuối một năm nếu số tiền hiện tại đem sinh lời. Phần Giá trị hiện tại (PV) là khoản gốc ban đầu, không đổi qua các năm; Phần sinh lợi xếp lên trên là lãi đã tích lại. Cột cuối cao đúng bằng giá trị tương lai bạn đã nhập.',
    "Each bar is the balance at the end of a year if today's amount is invested. The part Present value (PV) is the starting principal, unchanged through the years; the part Return earned stacked on top is the interest accumulated. The last bar stands exactly as tall as the future value you entered.",
  ),
  'gia-tri-tuong-lai': d(
    'Mỗi cột là số dư vào cuối một năm. Phần Số tiền hiện tại (PV) là khoản gốc, Phần sinh lợi xếp lên trên là lãi tích lại. Đường đứt Nếu chỉ tính lãi đơn là số dư khi lãi không sinh thêm lãi; khi lãi suất dương, khoảng cách từ đỉnh cột tới đường ấy là phần lãi sinh ra từ chính lãi, và nó rộng dần theo năm.',
    'Each bar is the balance at the end of a year. The part Present amount (PV) is the principal and the part Return earned stacked on top is the accumulated interest. The dashed line With simple interest only is the balance if interest did not earn interest; with a positive rate, the gap from the top of a bar to that line is the interest earned on interest, widening year by year.',
  ),
  'tong-loi-suat-tai-dau-tu': d(
    'Mỗi cột là tổng lợi suất cộng dồn tới cuối một năm, tách thành hai phần xếp chồng: Phần do giá tăng và Phần do cổ tức (gồm tái đầu tư). Chiều cao cả cột là tổng lợi suất của năm ấy, nên cột cuối cao đúng bằng kết quả.',
    'Each bar is the cumulative total return up to the end of a year, split into two stacked parts: From price growth and From dividends (incl. reinvesting). The height of the whole bar is the total return for that year, so the last bar stands exactly as tall as the result.',
  ),
  'loi-suat-trung-binh-hinh-hoc': d(
    'Mỗi cột Lợi suất kỳ là lợi suất của một kỳ: cột mọc lên trên vạch 0 là kỳ có lãi, cột rủ xuống dưới là kỳ lỗ. Hai vạch ngang là hai cách lấy trung bình: Trung bình hình học là mức mỗi kỳ cho ra đúng tổng lợi suất cả chặng, còn Trung bình cộng chỉ cộng rồi chia đều. Khi các kỳ lệch nhau nhiều, vạch Trung bình cộng nằm cao hơn vạch hình học.',
    'Each Period return bar is the return of one period: a bar rising above the zero line is a gain, one hanging below is a loss. The two horizontal lines are two ways of averaging: the Geometric mean is the rate per period that reproduces the exact total over the whole stretch, while the Arithmetic mean just adds and divides. When the periods differ a lot, the Arithmetic mean line sits above the geometric one.',
  ),
  'ty-le-khoi-luong': d(
    'Mỗi cột là khối lượng khớp của một phiên, từ phiên cũ nhất tới phiên gần nhất của chuỗi đã nạp, ngày ghi dưới cột. Vạch ngang Trung bình là mức bình quân của các phiên đứng trước phiên cuối: cột cuối cao hơn vạch bao nhiêu lần chính là kết quả, còn các cột kia cho thấy mức ấy có phải thói quen của mã hay không.',
    'Each bar is the traded volume of one session, from the oldest session to the most recent session of the loaded series, with the date under the bar. The horizontal line Average of the previous is the mean of the sessions before the last one: how many times the last bar stands above the line is the result, while the other bars show whether that level is usual for the stock.',
  ),
  'tra-gop-nien-kim': d(
    'Mỗi cột là tiền trả trong một năm, tách thành Tiền gốc và Tiền lãi xếp chồng; vì mỗi kỳ trả một số tiền đều nhau nên các cột cao gần bằng nhau, chỉ phần gốc ngày một dày lên và phần lãi mỏng đi. Đường Dư nợ cuối năm đo theo trục bên phải. Vạch dọc Gốc vượt lãi từ năm đánh dấu năm đầu tiên tiền gốc trả nhiều hơn tiền lãi; không có vạch nếu ngay năm đầu đã thế.',
    'Each bar is what is paid in one year, split into stacked Principal and Interest; because each period pays the same amount, the bars stand almost equally tall, with the principal growing thicker and the interest thinner. The line Balance at year end is measured on the right axis. The vertical line Principal exceeds interest from year marks the first year the principal paid is larger than the interest; there is no line if that already holds in the first year.',
  ),
  'tra-gop-goc-deu': d(
    'Mỗi cột là tiền trả trong một năm, tách thành Tiền gốc và Tiền lãi xếp chồng. Vì gốc trả đều mỗi kỳ nên khúc Tiền gốc cao bằng nhau ở mọi năm, còn Tiền lãi mỏng dần theo dư nợ, làm các cột thấp dần. Đường Dư nợ cuối năm đo theo trục bên phải. Vạch dọc Gốc vượt lãi từ năm đánh dấu năm đầu tiên gốc trả nhiều hơn lãi; không có vạch nếu ngay năm đầu đã thế.',
    'Each bar is what is paid in one year, split into stacked Principal and Interest. Because the principal is paid evenly each period, the Principal part stands equally tall every year while the Interest thins out with the balance, so the bars get lower. The line Balance at year end is measured on the right axis. The vertical line Principal exceeds interest from year marks the first year the principal paid is larger than the interest; there is no line if that already holds in the first year.',
  ),
  'lich-tra-no': d(
    'Mỗi cột là tiền trả trong một năm, tách thành Tiền gốc và Tiền lãi xếp chồng; hình dáng các cột phụ thuộc phương thức trả bạn chọn: trả đều số tiền thì cột cao gần bằng nhau, trả gốc đều thì cột thấp dần. Đường Dư nợ cuối năm đo theo trục bên phải. Vạch dọc Gốc vượt lãi từ năm đánh dấu năm đầu tiên gốc trả nhiều hơn lãi; không có vạch nếu ngay năm đầu đã thế.',
    'Each bar is what is paid in one year, split into stacked Principal and Interest; the shape depends on the repayment method you chose: equal payments give bars of nearly equal height, equal principal gives bars that get lower. The line Balance at year end is measured on the right axis. The vertical line Principal exceeds interest from year marks the first year the principal paid is larger than the interest; there is no line if that already holds in the first year.',
  ),
  'lai-kep': d(
    'Mỗi cột là số dư vào cuối một năm. Phần Tiền gốc (P) không đổi qua các năm, Phần Tiền lãi tích luỹ xếp lên trên. Đường đứt Nếu chỉ tính lãi đơn là số dư khi lãi không sinh thêm lãi; khi lãi suất dương, khoảng cách từ đỉnh cột tới đường ấy là lãi sinh ra từ chính lãi, và nó rộng dần theo năm.',
    'Each bar is the balance at the end of a year. The part Principal (P) is unchanged through the years and the part Accumulated interest is stacked on top. The dashed line With simple interest only is the balance if interest did not earn interest; with a positive rate, the gap from the top of a bar to that line is interest earned on interest, widening year by year.',
  ),
  'tiet-kiem-muc-tieu': d(
    'Mỗi cột là số dư vào cuối một năm, tách thành Tiền đã gửi và Tiền lãi tích luỹ xếp chồng. Vạch ngang Mục tiêu là số tiền bạn muốn có: đỉnh cột cuối chạm đúng vạch, và lãi chiếm càng nhiều phần cột thì số tiền phải tự gửi càng ít.',
    'Each bar is the balance at the end of a year, split into stacked Deposited so far and Accumulated interest. The horizontal line Goal is the amount you want to reach: the top of the last bar meets the line exactly, and the more of a bar is interest, the less you have to deposit yourself.',
  ),
  'gui-quay-vong': d(
    'Mỗi cột là tiền lãi có được sau một vòng của Gửi quay vòng kỳ ngắn, chỉ tính lãi chứ không kể gốc, nên cột sau cao hơn cột trước vì gốc đã gộp lãi. Vạch đứt Gửi một lần là tiền lãi nếu gửi một lần kỳ dài tới ngày đáo hạn; khoảng chênh giữa đỉnh cột cuối và vạch ấy chính là kết quả.',
    'Each bar is the interest earned after one round of Rolling short deposits, interest only and not the principal, so each bar is taller than the one before because the principal now includes interest. The dashed line One deposit is the interest from a single long deposit at maturity; the gap between the top of the last bar and that line is the result.',
  ),
  'gia-von-trung-binh-dca': d(
    'Mỗi cột là Giá mua của một đợt. Hai vạch ngang so hai cách trung bình: Giá vốn trung bình tính theo số cổ phiếu mua được, còn Trung bình cộng giá mua chỉ cộng giá rồi chia đều. Khi mỗi đợt bỏ số tiền như nhau, đợt giá thấp mua được nhiều cổ phiếu hơn nên vạch Giá vốn trung bình nằm thấp hơn vạch kia.',
    'Each bar is the Purchase price of one round. The two horizontal lines compare two averages: Average cost is weighted by the shares bought, while Simple average of prices just adds the prices and divides. When each round puts in the same amount of money, a low-price round buys more shares, so the line Average cost sits below the other.',
  ),
  'so-ky-dca': d(
    'Mỗi cột là số dư vào cuối một năm, tách thành Tiền đã góp và Lợi nhuận tích luỹ xếp chồng. Vạch ngang Mục tiêu là số tiền bạn muốn có: đỉnh cột cuối chạm đúng vạch. Phần lợi nhuận càng dày thì càng ít phải góp.',
    'Each bar is the balance at the end of a year, split into stacked Contributed so far and Accumulated return. The horizontal line Goal is the amount you want to reach: the top of the last bar meets the line exactly. The thicker the return part, the less you have to contribute.',
  ),
};

/* ── Thang đo ───────────────────────────────────────────────────────────────────────────────── */

const THANG_DO: Readonly<Record<string, Bilingual>> = {
  'rsi-wilder': d(
    'Nửa vòng cung chia ba vùng: Quá bán dưới 30, Trung tính từ 30 tới 70, Quá mua trên 70. Kim chỉ vào RSI của phiên gần nhất trong chuỗi đã nạp; vùng chứa kim sáng đậm, hai vùng kia mờ đi. Đây là vị trí của một con số trên thang, không phải lời khuyên mua hay bán: RSI có thể nằm lâu trong vùng Quá mua khi giá đang tăng mạnh.',
    'The half ring is split into three zones: Oversold below 30, Neutral from 30 to 70, Overbought above 70. The needle points at the RSI of the most recent session in the loaded series; the zone holding the needle is bright and the other two fade. This is the position of one number on a scale, not advice to buy or sell: RSI can stay in the Overbought zone for a long time while the price is rising strongly.',
  ),
  'phan-tram-b-bollinger': d(
    'Nửa vòng cung chia ba vùng: Dưới dải dưới, Trong dải từ 0 tới 100, Trên dải trên. Kim chỉ vào %B của phiên gần nhất trong chuỗi đã nạp: 0 là giá đúng dải dưới, 100 là giá đúng dải trên. Vùng chứa kim sáng đậm; giá ra ngoài dải thì kim nằm ở hai vùng ngoài cùng, và chữ dưới kim vẫn ghi số thật.',
    'The half ring is split into three zones: Below the lower band, Inside the band from 0 to 100, Above the upper band. The needle points at the %B of the most recent session in the loaded series: 0 is a price exactly on the lower band and 100 exactly on the upper band. The zone holding the needle is bright; a price outside the bands puts the needle in an outer zone, and the figure under it still shows the real number.',
  ),
  'stochastic-k': d(
    'Nửa vòng cung chia ba vùng: Sát đáy dưới 20, Ở giữa từ 20 tới 80, Sát đỉnh trên 80, tính theo vị trí của giá đóng cửa trong biên độ cao thấp gần đây. Kim chỉ vào %K của phiên gần nhất trong chuỗi đã nạp; vùng chứa kim sáng đậm, hai vùng kia mờ đi. Đây là vị trí của một con số trên thang, không phải lời khuyên mua hay bán.',
    'The half ring is split into three zones: Near the low below 20, In between from 20 to 80, Near the high above 80, based on where the closing price sits within the recent high-low range. The needle points at the %K of the most recent session in the loaded series; the zone holding the needle is bright and the other two fade. This is the position of one number on a scale, not advice to buy or sell.',
  ),
};

/* ── Gộp theo công thức ─────────────────────────────────────────────────────────────────────── */

const RA: Record<string, Rieng> = {};
const them = <K extends keyof Rieng>(kho: Readonly<Record<string, Rieng[K]>>, truong: K): void => {
  for (const [id, chu] of Object.entries(kho)) RA[id] = { ...RA[id], [truong]: chu };
};
them(THANH_PHAN, 'thanhPhan');
them(PHAN_PHOI, 'phanPhoi');
them(SUT_GIAM, 'sutGiam');
them(COT_THEO_KY, 'cotTheoKy');
them(THANG_DO, 'thangDo');
RA['beta'] = { ...RA['beta'], phanTan: PHAN_TAN };

export const HINH_RIENG: Readonly<Record<string, Rieng>> = RA;
