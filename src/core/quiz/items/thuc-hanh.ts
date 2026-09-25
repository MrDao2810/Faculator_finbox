import type { QuizItem } from '../types';

/**
 * Câu THỰC HÀNH — đợt 24/09/2026, dạng ĐIỀN SỐ vào chính công thức của trang.
 *
 * Chủ dự án: "vẫn có nhiều câu có quá nhiều lý thuyết trong khi tôi muốn người dùng làm quen và
 * sử dụng được công thức thay vì chỉ toàn lý thuyết." Đo lúc ấy: 411 câu thì chỉ 105 câu (25,5%)
 * bắt người đọc cầm số mà làm; 13 công thức không có câu thực hành nào, và 91 công thức có đúng
 * MỘT — vì đợt tính toán trước đó thêm mỗi công thức một câu rồi dừng.
 *
 * ── Vì sao nhóm này là `dien-so` chứ không phải trắc nghiệm có tính toán ─────────────────────
 *
 * Chủ dự án chọn dạng điền số làm dạng chính: đề bài cho số liệu, người học đặt từng con số vào
 * đúng ô trong công thức. Trắc nghiệm có tính toán kiểm kỹ năng BẤM MÁY; điền số kiểm kỹ năng
 * ĐẶT SỐ VÀO CÔNG THỨC, đúng thứ một thư viện công thức tồn tại để dạy.
 *
 * Dạng này còn mở được cánh cửa mà `verify` không mở nổi. Cửa gác của câu tính toán chạy
 * `runFormula` nên chỉ tả được công thức ăn ô nhập rời — 13 công thức ăn CHUỖI GIÁ (SMA,
 * Bollinger, RSI, Sharpe…) vì thế chưa từng có câu thực hành nào. Cửa gác của câu điền số thì
 * bóc ngoặc vuông ra và TÍNH LẠI CHÍNH DÒNG CÔNG THỨC, không gọi `calc`, nên một chuỗi giá viết
 * thẳng ra thành các ô trống là hợp lệ: `SMA 5 = ([▢] + [▢] + [▢] + [▢] + [▢]) ÷ 5`.
 *
 * ── Luật soạn, không cửa gác nào kiểm hộ ─────────────────────────────────────────────────────
 *
 * 1. **Chỉ vẽ công thức của CHÍNH trang ấy.** Xem docblock `CAU_DIEN_SO` ở `quiz.test.ts`. Được
 *    phép khai triển một đại lượng của công thức ấy (EPS viết ra thành lợi nhuận ÷ số cổ phiếu);
 *    không được vẽ một công thức khác.
 * 2. **Mọi ô trống phải là con số bảng `facts` nói NGUYÊN VĂN** — người học chép từ bảng xuống.
 * 3. **Bỏ trống SỐ LIỆU, chừa hằng số cấu trúc** (× 100, (n − 1), √252, hệ số đơn vị): bỏ trống
 *    hằng số là hỏi một câu khác hẳn.
 * 4. **Một đại lượng xuất hiện mấy lần thì bỏ trống HẾT, hoặc không lần nào.**
 * 5. **Bảng số liệu cố ý có số gây nhiễu**, nếu không thì đặt đúng chỗ không còn là một phép thử.
 * 6. **Đề bài nói việc ĐẶT SỐ**, không hỏi "kết quả là bao nhiêu" — kết quả lộ ra sau khi chấm.
 */
export const THUC_HANH: ReadonlyArray<QuizItem> = [
  {
    id: 'Q412',
    formulaId: 'pe',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một cổ phiếu đang giao dịch ở 36.000 ₫. Doanh nghiệp vừa công bố báo cáo quý mới nên EPS lũy kế bốn quý gần nhất đã khác EPS của năm tài chính trước, và P/E theo quy ước lấy EPS bốn quý gần nhất. Bảng số liệu có cả hai mức EPS — đặt đúng hai con số vào ô trống của công thức P/E.',
      en: 'A stock trades at 36,000 ₫. The company has just reported a new quarter, so trailing four-quarter EPS now differs from last fiscal year EPS, and by convention P/E uses the trailing four-quarter figure. The table holds both EPS figures — put the right two numbers into the slots of the P/E formula.',
    },
    facts: [
      {
        label: { vi: 'Giá thị trường một cổ phiếu', en: 'Market price per share' },
        value: { vi: '36.000 ₫', en: '36000 ₫' },
      },
      {
        label: { vi: 'EPS lũy kế bốn quý gần nhất', en: 'Trailing four-quarter EPS' },
        value: { vi: '3.000 ₫', en: '3000 ₫' },
      },
      {
        label: { vi: 'EPS năm tài chính trước', en: 'Prior fiscal year EPS' },
        value: { vi: '2.400 ₫', en: '2400 ₫' },
      },
    ],
    expected: 12,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'P/E = [36.000] ÷ [3.000]',
      en: 'P/E = [36000] ÷ [3000]',
    },
    explain: {
      vi: '36.000 chia 3.000 ra 12,0 lần: nhà đầu tư đang trả 12 đồng cho mỗi đồng lợi nhuận một năm. Đặt nhầm EPS 2.400 ₫ của năm tài chính trước vào mẫu số sẽ ra 15,0 lần — cổ phiếu trông đắt hơn thực tế một phần tư, chỉ vì mẫu số đã lỗi thời so với báo cáo mới nhất. EPS bốn quý gần nhất là quy ước của P/E trailing, và nó đổi sau mỗi kỳ báo cáo.',
      en: '36,000 divided by 3,000 gives 12.0x: the investor is paying 12 dong for each dong of a year of profit. Putting the prior fiscal year EPS of 2,400 ₫ in the denominator instead gives 15.0x — the stock looks a quarter more expensive than it is, purely because the denominator is out of date against the latest report. Trailing four-quarter EPS is the convention for trailing P/E, and it changes after every reporting period.',
    },
    giai: {
      tinh: { vi: 'P/E của cổ phiếu', en: 'The P/E of the stock' },
      thaySo: { vi: '36.000 ÷ 3.000', en: '36000 ÷ 3000' },
      ketQua: { vi: '12,0 lần', en: '12.0x' },
    },
    source: {
      url: 'https://simplize.vn/learn/chi-so-pe',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q413',
    formulaId: 'bien-an-toan',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một báo cáo phân tích cổ phiếu CTG ngày 23/06/2026 chốt vùng định giá 12 tháng từ 40.000 đến 45.000 đồng/cp và lấy giá trị trung tâm 42.500 đồng/cp làm giá trị nội tại, trong khi giá đóng cửa phiên 22/06/2026 là 33.850 đồng/cp. Báo cáo còn ghi sẵn một dòng upside tham khảo +25,5%, nhưng con số đó chia phần chênh cho thị giá chứ không phải cho giá trị nội tại. Hãy đặt đúng ba con số vào ô trống của công thức Biên an toàn, chú ý giá trị nội tại xuất hiện hai lần, một lần ở tử số và một lần ở mẫu số.',
      en: 'A research note on the Vietnamese bank stock CTG dated 2026-06-23 sets a 12-month valuation range from 40000 to 45000 ₫ per share and takes the 42500 ₫ midpoint as the intrinsic value, while the closing price on 2026-06-22 was 33850 ₫. The note also prints a reference upside of +25.5%, but that figure divides the gap by the market price rather than by the intrinsic value. Put the right three numbers into the slots of the margin of safety formula, noting that the intrinsic value appears twice, once in the numerator and once in the denominator.',
    },
    facts: [
      {
        label: { vi: 'Giá đóng cửa CTG phiên 22/06/2026', en: 'CTG closing price on 2026-06-22' },
        value: { vi: '33.850 ₫', en: '33850 ₫' },
      },
      {
        label: {
          vi: 'Giá trị nội tại, lấy theo giá trị trung tâm của vùng định giá 12 tháng',
          en: 'Intrinsic value, taken as the midpoint of the 12-month valuation range',
        },
        value: { vi: '42.500 ₫', en: '42500 ₫' },
      },
      {
        label: {
          vi: 'Vùng định giá 12 tháng báo cáo đưa ra',
          en: '12-month valuation range given in the note',
        },
        value: { vi: 'từ 40.000 ₫ đến 45.000 ₫', en: 'from 40000 ₫ to 45000 ₫' },
      },
      {
        label: {
          vi: 'Upside tham khảo báo cáo ghi sẵn',
          en: 'Reference upside printed in the note',
        },
        value: { vi: '+25,5%', en: '+25.5%' },
      },
    ],
    expected: 20.35,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Biên an toàn = ([42.500] − [33.850]) ÷ [42.500] × 100',
      en: 'Margin of safety = ([42500] − [33850]) ÷ [42500] × 100',
    },
    explain: {
      vi: 'Mẫu số của biên an toàn là giá trị nội tại, nên 42.500 ₫ đứng ở cả tử số lẫn mẫu số, còn 33.850 ₫ chỉ đứng ở vế bị trừ: (42.500 − 33.850) ÷ 42.500 × 100 ra 20,35%. Cái bẫy nằm ngay trong bảng số liệu: dòng upside +25,5% chính là phần chênh 8.650 ₫ chia cho thị giá 33.850 ₫, tức là đặt nhầm thị giá xuống mẫu số. Con số ấy luôn lớn hơn biên an toàn thật, nên ai đọc theo nó sẽ tưởng mình mua rẻ hơn thực tế. Hai đầu vùng định giá 40.000 ₫ và 45.000 ₫ cũng là số gây nhiễu: biên an toàn tính trên đúng một con số định giá, ở đây báo cáo chọn giá trị trung tâm.',
      en: 'The denominator of the margin of safety is the intrinsic value, so 42500 ₫ goes into both the numerator and the denominator, while 33850 ₫ only sits on the subtracted side: (42500 − 33850) ÷ 42500 × 100 gives 20.35%. The trap is printed in the table itself: the +25.5% upside line is the same 8650 ₫ gap divided by the 33850 ₫ market price, that is, the market price dropped into the denominator by mistake. That figure is always larger than the true margin of safety, so anyone who reads it as one believes the purchase is cheaper than it is. The 40000 ₫ and 45000 ₫ ends of the valuation range are distractors too: a margin of safety is computed against exactly one valuation figure, and here the note picks the midpoint.',
    },
    giai: {
      tinh: { vi: 'Biên an toàn', en: 'Margin of safety' },
      thaySo: { vi: '(42.500 − 33.850) ÷ 42.500 × 100', en: '(42500 − 33850) ÷ 42500 × 100' },
      ketQua: { vi: '20,35 %', en: '20.35 %' },
    },
    source: {
      url: 'https://24hmoney.vn/news/ctg--bao-cao-phan-tich-dinh-gia-co-phieu-2026-c30a2797985.html',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q414',
    formulaId: 'bien-loi-nhuan-gop',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Tạp chí Mekong Asean đưa tin kết quả quý 2/2026 của Dệt may Thành Công (TCM): doanh thu thuần cao nhất bốn quý gần đây, nhưng giá vốn hàng bán tăng nhanh hơn doanh thu nên biên lợi nhuận gộp co lại. Bảng số liệu chép từ bài báo có cả doanh thu thuần lũy kế 6 tháng và lợi nhuận sau thuế, hai con số không thuộc công thức này. Hãy đặt đúng ba con số của riêng quý 2/2026 vào ô trống của công thức biên lợi nhuận gộp; chú ý doanh thu thuần xuất hiện hai lần, ở cả tử số lẫn mẫu số, và ô bị trừ ra là giá vốn hàng bán chứ không phải lợi nhuận sau thuế.',
      en: 'Mekong Asean magazine reported Thanh Cong Textile Garment (TCM) Q2 2026 results: net revenue was the highest in four quarters, but cost of goods sold grew faster than revenue, so the gross profit margin narrowed. The table copied from the article also holds the six-month cumulative net revenue and the after-tax profit, two figures that do not belong in this formula. Put the right three Q2 2026 figures into the slots of the gross profit margin formula; note that net revenue appears twice, in both the numerator and the denominator, and the figure being subtracted is cost of goods sold, not after-tax profit.',
    },
    facts: [
      {
        label: { vi: 'Doanh thu thuần quý 2/2026', en: 'Net revenue, Q2 2026' },
        value: { vi: '968,1 tỷ đồng', en: '968.1 billion ₫' },
      },
      {
        label: { vi: 'Giá vốn hàng bán quý 2/2026', en: 'Cost of goods sold, Q2 2026' },
        value: { vi: '837,8 tỷ đồng', en: '837.8 billion ₫' },
      },
      {
        label: {
          vi: 'Doanh thu thuần lũy kế 6 tháng đầu 2026',
          en: 'Cumulative net revenue, first half of 2026',
        },
        value: { vi: '1.978 tỷ đồng', en: '1978 billion ₫' },
      },
      {
        label: { vi: 'Lợi nhuận sau thuế quý 2/2026', en: 'After-tax profit, Q2 2026' },
        value: { vi: '45,8 tỷ đồng', en: '45.8 billion ₫' },
      },
    ],
    expected: 13.4594,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Biên gộp = ([968,1] − [837,8]) ÷ [968,1] × 100',
      en: 'Gross margin = ([968.1] − [837.8]) ÷ [968.1] × 100',
    },
    explain: {
      vi: 'Lấy 968,1 trừ 837,8 còn 130,3 tỷ đồng lợi nhuận gộp, chia lại cho chính 968,1 rồi nhân 100 ra khoảng 13,46%, đúng mức bài báo ghi là “khoảng 13,5%” và co lại mạnh so với 18,4% cùng kỳ, vì “giá vốn hàng bán tại doanh nghiệp tăng nhanh hơn doanh thu, với mức tăng gần 18% YoY lên 837,8 tỷ đồng”. Doanh thu thuần phải điền cả hai ô: cùng một con số đứng ở tử số để trừ đi giá vốn, rồi đứng ở mẫu số làm gốc so sánh. Hai con số gài trong bảng bắt đúng hai lỗi hay gặp. Đặt doanh thu thuần lũy kế 6 tháng 1.978 tỷ đồng vào mẫu số là ghép doanh thu nửa năm với giá vốn một quý, hai kỳ khác nhau, ra 57,6% vô nghĩa. Còn lấy lợi nhuận sau thuế 45,8 tỷ đồng làm tử số thì ra 4,73%, đó là biên lợi nhuận ròng, đã trừ thêm chi phí bán hàng, chi phí quản lý và lãi vay, không phải biên gộp.',
      en: 'Subtracting 837.8 from 968.1 leaves gross profit of 130.3 billion ₫; dividing that back by the same 968.1 and multiplying by 100 gives about 13.46%, matching the “khoảng 13,5%” (roughly 13.5%) the article reports, and a sharp narrowing from 18.4% a year earlier, because “giá vốn hàng bán tại doanh nghiệp tăng nhanh hơn doanh thu, với mức tăng gần 18% YoY lên 837,8 tỷ đồng” (roughly, cost of goods sold grew faster than revenue, up nearly 18% year over year to 837.8 billion ₫). Net revenue fills both slots: the same figure sits in the numerator, where cost of goods sold is subtracted from it, and again in the denominator as the base of comparison. The two decoy figures catch the two common errors. Putting the six-month cumulative revenue of 1978 billion ₫ in the denominator pairs half a year of revenue with one quarter of cost, two different periods, and yields a meaningless 57.6%. Using after-tax profit of 45.8 billion ₫ as the numerator yields 4.73%, which is the net profit margin, already net of selling expenses, administrative expenses and interest, not the gross margin.',
    },
    giai: {
      tinh: { vi: 'Biên lợi nhuận gộp', en: 'Gross profit margin' },
      thaySo: { vi: '(968,1 − 837,8) ÷ 968,1 × 100', en: '(968.1 − 837.8) ÷ 968.1 × 100' },
      ketQua: { vi: '13,46 %', en: '13.46 %' },
    },
    source: {
      url: 'https://mekongasean.vn/gia-von-tang-nhanh-hon-doanh-thu-loi-nhuan-tcm-quy-2-giam-444-57887.html',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q415',
    formulaId: 'bien-loi-nhuan-rong',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Quý II/2026, DIC Corp (mã DIG) báo doanh thu thuần 613 tỷ đồng nhưng lợi nhuận gộp chỉ 42 tỷ đồng, trong khi lợi nhuận sau thuế lại lên tới 143 tỷ đồng nhờ doanh thu tài chính và lãi từ công ty liên doanh, liên kết. Biên lợi nhuận ròng lấy dòng lãi CUỐI CÙNG của báo cáo kết quả kinh doanh, không phải lãi từ bán hàng. Bảng số liệu có cả hai dòng lãi — đặt đúng hai con số vào ô trống của công thức ROS, chú ý tử số là lợi nhuận sau thuế chứ không phải lợi nhuận gộp.',
      en: 'In Q2 2026, DIC Corp (ticker DIG) reported net revenue of 613 billion dong but gross profit of only 42 billion dong, while net income after tax reached 143 billion dong thanks to financial income and profit from joint ventures and associates. Net profit margin takes the LAST profit line of the income statement, not the profit from selling goods. The table holds both profit lines — put the right two numbers into the slots of the ROS formula, and note that the numerator is net income after tax, not gross profit.',
    },
    facts: [
      {
        label: { vi: 'Doanh thu thuần quý II/2026', en: 'Q2 2026 net revenue' },
        value: { vi: '613 tỷ đồng', en: '613 billion ₫' },
      },
      {
        label: { vi: 'Lợi nhuận gộp quý II/2026', en: 'Q2 2026 gross profit' },
        value: { vi: '42 tỷ đồng', en: '42 billion ₫' },
      },
      {
        label: { vi: 'Lợi nhuận sau thuế quý II/2026', en: 'Q2 2026 net income after tax' },
        value: { vi: '143 tỷ đồng', en: '143 billion ₫' },
      },
      {
        label: { vi: 'Doanh thu tài chính quý II/2026', en: 'Q2 2026 financial income' },
        value: { vi: '116 tỷ đồng', en: '116 billion ₫' },
      },
    ],
    expected: 23.33,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'ROS = [143] ÷ [613] × 100',
      en: 'ROS = [143] ÷ [613] × 100',
    },
    explain: {
      vi: 'Lấy 143 chia 613 rồi nhân 100 ra 23,33%: cứ 100 đồng doanh thu thuần quý II, DIG giữ lại hơn 23 đồng lãi ròng. Bẫy nằm ở dòng lợi nhuận gộp 42 tỷ đồng — đặt nó vào tử số thì ra 6,85%, đúng bằng biên lợi nhuận gộp mà bài báo nói đã co từ 39% xuống 6,9%. Đây là ca hiếm khi biên ròng CAO HƠN biên gộp, vì phần lãi lớn không đến từ bán hàng mà từ 116 tỷ đồng doanh thu tài chính cùng 40 tỷ đồng lãi công ty liên doanh, liên kết. ROS luôn lấy dòng lãi cuối cùng sau thuế, nên nó nhận trọn cả những khoản ngoài hoạt động cốt lõi; muốn đo sức khoẻ của việc bán hàng thì phải đọc biên gộp bên cạnh, chứ không thay ROS bằng nó. Số 100 trong công thức là hằng số đổi tỷ lệ ra phần trăm nên luôn hiện sẵn, không phải ô để điền.',
      en: 'Dividing 143 by 613 and multiplying by 100 gives 23.33%: out of every 100 dong of Q2 net revenue, DIG keeps more than 23 dong of net profit. The trap is the gross profit line of 42 billion dong — putting that in the numerator yields 6.85%, exactly the gross margin the article says shrank from 39% to 6.9%. This is the rare case where the net margin is HIGHER than the gross margin, because most of the profit came not from selling goods but from 116 billion dong of financial income plus 40 billion dong of profit from joint ventures and associates. ROS always takes the last profit line after tax, so it absorbs everything outside core operations; to judge the health of the selling business you read the gross margin beside it rather than replacing ROS with it. The 100 in the formula is the structural constant that converts the ratio to a percentage, so it stays visible and is not a slot.',
    },
    giai: {
      tinh: { vi: 'ROS — biên lợi nhuận ròng', en: 'Net profit margin' },
      thaySo: { vi: '143 ÷ 613 × 100', en: '143 ÷ 613 × 100' },
      ketQua: { vi: '23,33 %', en: '23.33 %' },
    },
    source: {
      url: 'https://www.tinnhanhchungkhoan.vn/nhieu-doanh-nghiep-niem-yet-lai-lon-nho-thu-nhap-khac-post396380.html',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q416',
    formulaId: 'bvps',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Báo cáo tài chính hợp nhất quý 1/2023 của Hòa Phát (HPG) ghi vốn chủ sở hữu 96.437 tỷ ₫, trong đó 91 tỷ ₫ là lợi ích cổ đông không kiểm soát, tức phần vốn của cổ đông thiểu số ở các công ty con chứ không thuộc về cổ đông HPG. BVPS ở trang này lấy vốn chủ sở hữu của cổ đông công ty mẹ chia cho số cổ phiếu đang lưu hành và KHÔNG trừ tài sản vô hình; bản có trừ tài sản vô hình là giá trị sổ sách hữu hình, một chỉ tiêu khác. Bảng số liệu có sẵn cả hai dòng tài sản vô hình để thử bạn: hãy đặt đúng ba con số vào ô trống của công thức BVPS, chú ý ô nào trừ ra và dòng nào không được đụng tới.',
      en: "Hoa Phat Group (HPG) reported consolidated equity of 96,437 billion ₫ at March 31, 2023, of which 91 billion ₫ is non-controlling interests, the minority shareholders' stake in its subsidiaries rather than value belonging to HPG shareholders. The BVPS formula on this page divides equity attributable to the parent company's shareholders by shares outstanding and does NOT subtract intangible assets; the version that subtracts them is tangible book value, a different metric. The table deliberately includes both intangible-asset lines: put the right three figures into the slots of the BVPS formula, minding which one is subtracted and which lines must be left alone.",
    },
    facts: [
      {
        label: {
          vi: 'Vốn chủ sở hữu hợp nhất tại 31/03/2023',
          en: 'Consolidated equity at March 31, 2023',
        },
        value: { vi: '96.437 tỷ ₫', en: '96437 billion ₫' },
      },
      {
        label: { vi: 'Lợi ích cổ đông không kiểm soát', en: 'Non-controlling interests' },
        value: { vi: '91 tỷ ₫', en: '91 billion ₫' },
      },
      {
        label: { vi: 'Số cổ phiếu đang lưu hành', en: 'Shares outstanding' },
        value: { vi: '5.814.785.700 CP', en: '5814785700 shares' },
      },
      {
        label: { vi: 'Tài sản cố định vô hình', en: 'Intangible fixed assets' },
        value: { vi: '619 tỷ ₫', en: '619 billion ₫' },
      },
      {
        label: { vi: 'Quyền sử dụng đất', en: 'Land use rights' },
        value: { vi: '217 tỷ ₫', en: '217 billion ₫' },
      },
    ],
    expected: 16569.14,
    tolerance: { kind: 'tuong-doi', value: 0.005 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'BVPS = ([96.437] − [91]) ÷ [5.814.785.700] × 10^9',
      en: 'BVPS = ([96437] − [91]) ÷ [5814785700] × 10^9',
    },
    explain: {
      vi: 'Vốn chủ sở hữu của cổ đông công ty mẹ là 96.437 − 91 = 96.346 tỷ ₫; chia cho 5.814.785.700 cổ phiếu rồi nhân 10^9 để đổi tỷ ₫ ra ₫, được khoảng 16.569 ₫ mỗi cổ phiếu. Bảng số liệu giăng hai cái bẫy. Thứ nhất là 91 tỷ ₫ lợi ích cổ đông không kiểm soát: đó là phần vốn của cổ đông thiểu số ở các công ty con, để nguyên trong tử số thì BVPS bị thổi lên và sai lệch ấy chảy thẳng sang P/B lẫn số Graham. Thứ hai là 619 tỷ ₫ tài sản cố định vô hình cùng 217 tỷ ₫ quyền sử dụng đất: đây là số liệu của giá trị sổ sách hữu hình, một chỉ tiêu khắt khe hơn mà chính trang nguồn tính trên cùng bộ số này; công thức BVPS ở đây không trừ chúng, trừ vào là đã đổi sang chỉ tiêu khác nhưng vẫn gọi tên BVPS. Hệ số 10^9 không phải ô trống vì nó là phép đổi đơn vị của công thức, không phải số liệu của doanh nghiệp.',
      en: "Equity attributable to the parent company's shareholders is 96,437 − 91 = 96,346 billion ₫; divided by 5,814,785,700 shares and multiplied by 10^9 to turn billion ₫ into ₫, that gives about 16,569 ₫ per share. The table sets two traps. The first is the 91 billion ₫ of non-controlling interests: that is the minority shareholders' stake in the subsidiaries, and leaving it in the numerator inflates BVPS, an error that flows straight into P/B and the Graham number. The second is the 619 billion ₫ of intangible fixed assets together with the 217 billion ₫ of land use rights: those belong to tangible book value, a stricter metric that the source page itself computes from this same data set; the BVPS formula here does not subtract them, and subtracting them means you have switched metrics while still calling the result BVPS. The 10^9 factor is not a slot because it is the formula's own unit conversion, not a figure from the company.",
    },
    giai: {
      tinh: { vi: 'BVPS — giá trị sổ sách mỗi cổ phiếu', en: 'Book value per share' },
      thaySo: {
        vi: '(96.437 − 91) ÷ 5.814.785.700 × 10^9',
        en: '(96437 − 91) ÷ 5814785700 × 10^9',
      },
      ketQua: { vi: '16.569,14 ₫', en: '16569.14 ₫' },
    },
    source: {
      url: 'https://tikop.vn/blog/gia-tri-so-sach-cua-co-phieu-la-gi-vai-tro-cach-tinh-bvps-chi-tiet-6438',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q417',
    formulaId: 'cagr',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Đầu năm 2019 một nhà đầu tư bỏ 600.000.000 ₫ mua cổ phiếu VCB ở giá 60.000 ₫ một cổ phiếu. Cuối năm 2022 giá lên 90.000 ₫ nên vẫn số cổ phiếu ấy đã thành 900.000.000 ₫. Bảng theo dõi danh mục của nhà đầu tư kẻ bốn cột năm là 2019, 2020, 2021 và 2022, nhưng t trong công thức CAGR là số năm đã trôi qua giữa hai mốc chứ không phải số cột năm trong bảng. Đặt đúng ba con số của bảng vào ô trống của công thức CAGR, chú ý ô số năm lấy thời gian nắm giữ, còn hai ô tử số và mẫu số lấy giá trị cả khoản đầu tư chứ không lấy giá một cổ phiếu.',
      en: "At the start of 2019 an investor put 600,000,000 ₫ into VCB shares at 60,000 ₫ per share. By the end of 2022 the price had risen to 90,000 ₫, so the same shares were worth 900,000,000 ₫. The investor's portfolio sheet has four year columns, 2019, 2020, 2021 and 2022, but t in the CAGR formula is the number of years that elapsed between the two marks, not the number of year columns in the sheet. Put the right three figures from the table into the slots of the CAGR formula, minding that the years slot takes the holding period, while the numerator and denominator slots take the value of the whole investment rather than the price of one share.",
    },
    facts: [
      {
        label: {
          vi: 'Giá trị cả khoản đầu tư đầu năm 2019',
          en: 'Value of the whole investment at the start of 2019',
        },
        value: { vi: '600.000.000 ₫', en: '600000000 ₫' },
      },
      {
        label: {
          vi: 'Giá trị cả khoản đầu tư cuối năm 2022',
          en: 'Value of the whole investment at the end of 2022',
        },
        value: { vi: '900.000.000 ₫', en: '900000000 ₫' },
      },
      {
        label: {
          vi: 'Giá một cổ phiếu VCB đầu năm 2019',
          en: 'Price of one VCB share at the start of 2019',
        },
        value: { vi: '60.000 ₫', en: '60000 ₫' },
      },
      {
        label: {
          vi: 'Số cột năm trong bảng theo dõi danh mục (2019, 2020, 2021, 2022)',
          en: 'Year columns in the portfolio sheet (2019, 2020, 2021, 2022)',
        },
        value: { vi: '4 năm', en: '4 years' },
      },
      {
        label: {
          vi: 'Thời gian nắm giữ từ đầu năm 2019 đến cuối năm 2022',
          en: 'Holding period from the start of 2019 to the end of 2022',
        },
        value: { vi: '3 năm', en: '3 years' },
      },
    ],
    expected: 14.4714,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%/năm', en: '%/year' },
    worked: {
      vi: 'CAGR = (([900.000.000] ÷ [600.000.000])^(1 ÷ [3]) − 1) × 100',
      en: 'CAGR = (([900000000] ÷ [600000000])^(1 ÷ [3]) − 1) × 100',
    },
    explain: {
      vi: 'Tử số là giá trị cuối 900.000.000 ₫, mẫu số là giá trị đầu 600.000.000 ₫, số mũ là 1 chia cho 3 năm nắm giữ. Pinetree viết thẳng phép tính ấy: “[(900.000.000/ 600.000.000) ^ (1/3)] – 1 = 14%”, con số nguồn làm tròn xuống, còn tính đủ chữ số thì ra 14,47%/năm. Bẫy thứ nhất là bốn cột năm: bảng có 2019, 2020, 2021, 2022 nên rất dễ đặt 4 vào ô số năm, nhưng từ đầu 2019 đến cuối 2022 chỉ có 3 năm tăng trưởng, và đặt 4 sẽ kéo kết quả xuống 10,67%/năm, tức chia mức tăng cho một năm không hề tồn tại. Bẫy thứ hai là 60.000 ₫: đó là giá một cổ phiếu, ghép nó với 900.000.000 ₫ của cả khoản đầu tư thì hai vế của tỷ số không cùng đơn vị và kết quả vọt lên mấy nghìn phần trăm. Trừ 1 và nhân 100 là hằng số của công thức, một bước bóc phần vốn gốc ra khỏi hệ số nhân, một bước đổi tỷ lệ 0,1447 sang phần trăm, nên cả hai đều không phải ô trống.',
      en: 'The numerator is the ending value of 900,000,000 ₫, the denominator the starting value of 600,000,000 ₫, and the exponent is 1 divided by the 3 years held. Pinetree writes the arithmetic out directly: “[(900.000.000/ 600.000.000) ^ (1/3)] – 1 = 14%”, a figure the source rounds down; carried to more digits it is 14.47%/year. The first trap is the four year columns: the sheet lists 2019, 2020, 2021 and 2022, so it is tempting to put 4 in the years slot, but only 3 years of growth elapsed between the start of 2019 and the end of 2022, and a 4 would drag the result down to 10.67%/year, spreading the gain over a year that never happened. The second trap is the 60,000 ₫: that is the price of one share, and pairing it with the 900,000,000 ₫ of the whole investment leaves the two sides of the ratio in different units, which sends the result into the thousands of percent. Subtracting 1 and multiplying by 100 are constants of the formula, one stripping the original capital out of the growth multiple and one turning the 0.1447 ratio into a percentage, so neither is a slot.',
    },
    giai: {
      tinh: { vi: 'CAGR — tăng trưởng kép hằng năm', en: 'Compound annual growth rate' },
      thaySo: {
        vi: '((900.000.000 ÷ 600.000.000)^(1 ÷ 3) − 1) × 100',
        en: '((900000000 ÷ 600000000)^(1 ÷ 3) − 1) × 100',
      },
      ketQua: { vi: '14,47 %/năm', en: '14.47 %/year' },
    },
    source: {
      url: 'https://pinetree.vn/post/20220808/cagr-la-gi-y-nghia-va-cach-tinh/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q418',
    formulaId: 'capm',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'DNSE lấy ví dụ một nhà đầu tư rót 200 triệu đồng vào cổ phiếu VNM: beta của VNM là 1,1 lần, lãi suất phi rủi ro 3%/năm, và thị trường được kỳ vọng tăng 5%/năm. CAPM cộng vào lãi suất phi rủi ro PHẦN BÙ rủi ro thị trường, tức phần vượt của kỳ vọng thị trường so với lãi suất phi rủi ro, chứ không phải bản thân mức kỳ vọng ấy. Bảng số liệu có đủ cả hai con số, hãy đặt đúng ba con số vào ô trống của công thức CAPM, chú ý ô cuối là phần bù chứ không phải lợi nhuận kỳ vọng của cả thị trường.',
      en: "DNSE works through an example of an investor putting 200 million dong into VNM shares: VNM's beta is 1.1, the risk-free rate is 3%/year, and the market is expected to rise 5%/year. CAPM adds the market risk PREMIUM to the risk-free rate, meaning the excess of the expected market return over the risk-free rate, not that expected return itself. The table holds both figures, so put the right three numbers into the slots of the CAPM formula, minding that the last slot takes the premium and not the expected return of the whole market.",
    },
    facts: [
      {
        label: { vi: 'Lãi suất phi rủi ro (Rf)', en: 'Risk-free rate (Rf)' },
        value: { vi: '3%', en: '3%' },
      },
      {
        label: { vi: 'Hệ số beta của VNM (β)', en: "VNM's beta coefficient (β)" },
        value: { vi: '1,1 lần', en: '1.1x' },
      },
      {
        label: {
          vi: 'Lợi nhuận kỳ vọng của cả thị trường (Rm)',
          en: 'Expected return of the whole market (Rm)',
        },
        value: { vi: '5%', en: '5%' },
      },
      {
        label: {
          vi: 'Phần bù rủi ro thị trường (Rm trừ Rf)',
          en: 'Market risk premium (Rm minus Rf)',
        },
        value: { vi: '2%', en: '2%' },
      },
      {
        label: { vi: 'Tỷ suất cổ tức của VNM', en: "VNM's dividend yield" },
        value: { vi: '3%/năm', en: '3%/year' },
      },
    ],
    expected: 5.2,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%/năm', en: '%/year' },
    worked: {
      vi: 'Chi phí vốn chủ = [3] + [1,1] × [2]',
      en: 'Cost of equity = [3] + [1.1] × [2]',
    },
    explain: {
      vi: 'Ô cuối phải là 2%, tức phần bù rủi ro thị trường, chứ không phải 5% kỳ vọng của cả thị trường: CAPM cộng vào lãi suất phi rủi ro đúng phần VƯỢT của thị trường so với chính lãi suất ấy. Nguồn viết thẳng phép tính: “3% + 1.1 × (5% – 3%) = 5.2%”. Đặt nhầm 5% vào ô cuối sẽ ra 8,5%/năm, thổi chi phí vốn chủ lên hơn ba điểm phần trăm, và vì con số này đi thẳng vào WACC rồi thành suất chiết khấu của mọi mô hình định giá, một cổ phiếu đáng mua sẽ bị chấm là đắt. Dòng cổ tức 3%/năm trong bảng cũng là số gây nhiễu: nó không phải biến nào của CAPM, chỉ tình cờ trùng giá trị với lãi suất phi rủi ro.',
      en: 'The last slot takes 2%, the market risk premium, not the 5% expected return of the whole market: CAPM adds to the risk-free rate exactly the market’s EXCESS over that same rate. The source writes the arithmetic out: “3% + 1.1 × (5% – 3%) = 5.2%” (roughly, 3% plus 1.1 times the 5% minus 3% gap). Dropping 5% into the last slot gives 8.5%/year, inflating the cost of equity by more than three percentage points, and because this figure feeds straight into WACC and then becomes the discount rate of every valuation model, a stock worth buying gets marked as expensive. The 3%/year dividend yield row is noise too: it is not a CAPM input at all, it merely happens to equal the risk-free rate.',
    },
    giai: {
      tinh: { vi: 'CAPM — chi phí vốn chủ sở hữu', en: 'Capital asset pricing model' },
      thaySo: { vi: '3 + 1,1 × 2', en: '3 + 1.1 × 2' },
      ketQua: { vi: '5,2 %/năm', en: '5.2 %/year' },
    },
    source: {
      url: 'https://www.dnse.com.vn/hoc/capm-la-gi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q419',
    formulaId: 'ddm-hai-giai-doan',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bài tập ôn thi CPA: một cổ phiếu đang có thị giá 20.000 ₫/cổ phần, cổ tức năm trước 2.000 ₫/cổ phần, tỷ suất sinh lợi yêu cầu 16%/năm. Phương án đang xét giả định hai năm tới cổ tức tăng 9%/năm, các năm sau đó tăng ổn định 6%/năm mãi mãi. Bảng số liệu có cả cổ tức năm trước lẫn cổ tức dự kiến năm tới, và có cả hai tốc độ tăng trưởng. Đặt đúng năm con số vào ô trống của công thức DDM hai giai đoạn: chú ý cổ tức vừa trả xuất hiện ở cả ba số hạng, và giá trị cuối kỳ chạy bằng tăng trưởng dài hạn ở cả tử số lẫn mẫu số.',
      en: "A CPA exam exercise: a share trades at 20,000 ₫ per share, paid a dividend of 2,000 ₫ per share last year, and the required return is 16% per year. The case under review assumes dividends grow 9% per year for the next two years, then settle at a steady 6% per year forever. The table holds both last year's dividend and next year's expected dividend, and both growth rates. Put the right five numbers into the slots of the two-stage DDM formula: note that the dividend just paid appears in all three terms, and the terminal value runs on the long-term growth rate in both the numerator and the denominator.",
    },
    facts: [
      {
        label: { vi: 'Thị giá hiện tại', en: 'Current market price' },
        value: { vi: '20.000 ₫/cổ phần', en: '20000 ₫ per share' },
      },
      {
        label: { vi: 'Cổ tức vừa trả năm trước (D0)', en: 'Dividend just paid last year (D0)' },
        value: { vi: '2.000 ₫/cổ phần', en: '2000 ₫ per share' },
      },
      {
        label: { vi: 'Cổ tức dự kiến trả năm tới (D1)', en: 'Dividend expected next year (D1)' },
        value: { vi: '2.180 ₫/cổ phần', en: '2180 ₫ per share' },
      },
      {
        label: {
          vi: 'Tăng trưởng cổ tức hai năm tới (g1)',
          en: 'Dividend growth over the next two years (g1)',
        },
        value: { vi: '9%/năm', en: '9% per year' },
      },
      {
        label: {
          vi: 'Tăng trưởng cổ tức ổn định từ năm thứ ba (g2)',
          en: 'Steady dividend growth from year three onward (g2)',
        },
        value: { vi: '6%/năm', en: '6% per year' },
      },
      {
        label: { vi: 'Tỷ suất sinh lợi yêu cầu (r)', en: 'Required rate of return (r)' },
        value: { vi: '16%/năm', en: '16% per year' },
      },
    ],
    expected: 22363.79,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá trị cổ phiếu = [2.000] × (1 + 9 ÷ 100) ÷ (1 + 16 ÷ 100) + [2.000] × (1 + 9 ÷ 100)^2 ÷ (1 + 16 ÷ 100)^2 + [2.000] × (1 + 9 ÷ 100)^2 × (1 + [6] ÷ 100) ÷ ((16 − [6]) ÷ 100 × (1 + 16 ÷ 100)^2)',
      en: 'Share value = [2000] × (1 + 9 ÷ 100) ÷ (1 + 16 ÷ 100) + [2000] × (1 + 9 ÷ 100)^2 ÷ (1 + 16 ÷ 100)^2 + [2000] × (1 + 9 ÷ 100)^2 × (1 + [6] ÷ 100) ÷ ((16 − [6]) ÷ 100 × (1 + 16 ÷ 100)^2)',
    },
    explain: {
      vi: 'Cả ba số hạng đều mọc lên từ cổ tức VỪA TRẢ 2.000 ₫, vì mỗi số hạng đã mang sẵn thừa số (1 + 9 ÷ 100) của riêng nó. Đặt cổ tức dự kiến năm tới 2.180 ₫ vào đó là nhân tăng trưởng hai lần, kết quả bị đẩy lên 24.377 ₫. Hai ô còn lại đều là tăng trưởng dài hạn 6%: giá trị cuối kỳ chính là mô hình Gordon áp từ năm thứ ba trở đi, nên cả bước tăng cuối (1 + 6 ÷ 100) lẫn hiệu (16 − 6) đều phải chạy bằng g2. Đặt nhầm 9% của hai năm đầu vào đó làm hiệu r trừ g co lại còn 7%, kết quả phồng lên 31.143 ₫, cao hơn con số đúng gần 40%. Kết quả đúng 22.364 ₫ cao hơn thị giá 20.000 ₫, nên theo phương án này cổ phiếu đang rẻ hơn giá trị.',
      en: "All three terms grow out of the dividend JUST PAID of 2,000 ₫, because each term already carries its own (1 + 9 ÷ 100) factor. Putting next year's expected dividend of 2,180 ₫ there applies the growth twice and pushes the result up to 24,377 ₫. The other two slots are both the long-term growth rate of 6%: the terminal value is the Gordon model applied from year three onward, so the final growth step (1 + 6 ÷ 100) and the spread (16 − 6) must both run on g2. Putting the first two years' 9% there shrinks the r minus g spread to 7% and inflates the result to 31,143 ₫, almost 40% above the correct figure. The correct result of 22,364 ₫ sits above the market price of 20,000 ₫, so under this scenario the share is cheaper than its value.",
    },
    giai: {
      tinh: { vi: 'DDM hai giai đoạn', en: 'Two-stage dividend discount model' },
      thaySo: {
        vi: '2.000 × (1 + 9 ÷ 100) ÷ (1 + 16 ÷ 100) + 2.000 × (1 + 9 ÷ 100)^2 ÷ (1 + 16 ÷ 100)^2 + 2.000 × (1 + 9 ÷ 100)^2 × (1 + 6 ÷ 100) ÷ ((16 − 6) ÷ 100 × (1 + 16 ÷ 100)^2)',
        en: '2000 × (1 + 9 ÷ 100) ÷ (1 + 16 ÷ 100) + 2000 × (1 + 9 ÷ 100)^2 ÷ (1 + 16 ÷ 100)^2 + 2000 × (1 + 9 ÷ 100)^2 × (1 + 6 ÷ 100) ÷ ((16 − 6) ÷ 100 × (1 + 16 ÷ 100)^2)',
      },
      ketQua: { vi: '22.363,79 ₫', en: '22363.79 ₫' },
    },
    source: {
      url: 'https://taca.edu.vn/bai-tap-dinh-gia-trai-phieu-va-co-phieu/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q420',
    formulaId: 'eps-co-ban',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'TACA hướng dẫn tính EPS cơ bản cho một doanh nghiệp có lợi nhuận sau thuế bốn quý gần nhất 1.621 tỷ ₫ và cổ tức ưu đãi phải trả 300 tỷ ₫. Trong kỳ doanh nghiệp phát hành thêm hai đợt cổ phiếu và mua lại 10.000.000 cổ phiếu quỹ, nên số cổ phiếu đầu kỳ, số cuối kỳ và số bình quân gia quyền cả kỳ là ba con số khác nhau; EPS cơ bản chia cho số bình quân gia quyền. Bảng số liệu có đủ cả ba, hãy đặt đúng ba con số vào ô trống của công thức EPS, chú ý ô nào trừ ra ở tử số và ô nào là số cổ phiếu ở mẫu số.',
      en: 'TACA works through basic EPS for a company whose trailing four-quarter profit after tax is 1621 billion ₫ and whose preferred dividend payable is 300 billion ₫. During the period the company issued shares twice and bought back 10,000,000 treasury shares, so the opening share count, the closing share count and the weighted average for the period are three different numbers; basic EPS divides by the weighted average. The table holds all three, so put the right three numbers into the slots of the EPS formula, minding which one is subtracted in the numerator and which one is the share count in the denominator.',
    },
    facts: [
      {
        label: {
          vi: 'Lợi nhuận sau thuế bốn quý gần nhất',
          en: 'Trailing four-quarter profit after tax',
        },
        value: { vi: '1.621 tỷ ₫', en: '1621 billion ₫' },
      },
      {
        label: {
          vi: 'Cổ tức ưu đãi phải trả trong kỳ',
          en: 'Preferred dividend payable for the period',
        },
        value: { vi: '300 tỷ ₫', en: '300 billion ₫' },
      },
      {
        label: {
          vi: 'Số cổ phiếu lưu hành đầu kỳ (1/1/2023)',
          en: 'Shares outstanding at the start of the period (1 Jan 2023)',
        },
        value: { vi: '500.000.000 cổ phiếu', en: '500000000 shares' },
      },
      {
        label: {
          vi: 'Số cổ phiếu lưu hành cuối kỳ (31/12/2023)',
          en: 'Shares outstanding at the end of the period (31 Dec 2023)',
        },
        value: { vi: '640.000.000 cổ phiếu', en: '640000000 shares' },
      },
      {
        label: {
          vi: 'Số cổ phiếu lưu hành bình quân gia quyền cả kỳ',
          en: 'Weighted-average shares outstanding for the period',
        },
        value: { vi: '559.166.666,7 cổ phiếu', en: '559166666.7 shares' },
      },
    ],
    expected: 2362.44,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'EPS = ([1.621] − [300]) ÷ [559.166.666,7] × 10^9',
      en: 'EPS = ([1621] − [300]) ÷ [559166666.7] × 10^9',
    },
    explain: {
      vi: 'Tử số là phần lợi nhuận còn lại cho cổ đông phổ thông, nên phải trừ 300 tỷ ₫ cổ tức ưu đãi ra khỏi 1.621 tỷ ₫: còn 1.321 tỷ ₫. Mẫu số là số cổ phiếu bình quân gia quyền 559.166.666,7, vì trong kỳ doanh nghiệp vừa phát hành thêm vừa mua cổ phiếu quỹ nên số cổ phiếu không đứng yên ngày nào. Hệ số 10^9 đổi tỷ ₫ ra ₫, và kết quả là 2.362,44 ₫ mỗi cổ phiếu, đúng con số nguồn tính ra. Bảng số liệu cố ý đặt ba mức cổ phiếu cạnh nhau: lấy nhầm số đầu kỳ 500.000.000 thì EPS vọt lên 2.642 ₫, lấy nhầm số cuối kỳ 640.000.000 thì tụt xuống 2.064 ₫, còn quên trừ cổ tức ưu đãi thì ra 2.899 ₫. Ba con số ấy đều trông hợp lý, chỉ có một con số đặt đúng chỗ.',
      en: 'The numerator is the profit left for common shareholders, so the 300 billion ₫ preferred dividend comes out of the 1621 billion ₫ first, leaving 1321 billion ₫. The denominator is the weighted-average count of 559166666.7 shares, because the company both issued new shares and bought treasury shares during the period, so the share count never stood still. The 10^9 factor converts billion ₫ into ₫, and the result is 2362.44 ₫ per share, exactly the figure the source computes. The table deliberately puts three share counts side by side: taking the opening count of 500000000 pushes EPS up to 2642 ₫, taking the closing count of 640000000 drags it down to 2064 ₫, and forgetting the preferred dividend gives 2899 ₫. All three look plausible; only one placement is right.',
    },
    giai: {
      tinh: { vi: 'EPS cơ bản', en: 'Basic earnings per share' },
      thaySo: {
        vi: '(1.621 − 300) ÷ 559.166.666,7 × 10^9',
        en: '(1621 − 300) ÷ 559166666.7 × 10^9',
      },
      ketQua: { vi: '2.362,44 ₫', en: '2362.44 ₫' },
    },
    source: {
      url: 'https://taca.com.vn/chi-so-eps/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q421',
    formulaId: 'ev-sales',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một doanh nghiệp có 10 triệu cổ phiếu đang lưu hành, thị giá 17,50 USD một cổ phiếu. Bảng cân đối kế toán ghi riêng nợ vay ngắn hạn và nợ vay dài hạn, còn tiền và tương đương tiền chỉ chiếm 10% tổng tài sản. Tử số của EV/Sales là giá trị doanh nghiệp chứ không phải vốn hóa, nên phải cộng đủ cả hai khoản nợ rồi mới trừ tiền mặt. Đặt đúng năm con số vào ô trống của công thức EV/Sales — chú ý ô nào cộng vào, ô nào trừ ra, và bảng có cả tổng tài sản lẫn tiền mặt.',
      en: 'A company has 10 million shares outstanding at a market price of 17.50 USD per share. Its balance sheet lists short-term borrowings and long-term borrowings separately, while cash and cash equivalents are only 10% of total assets. The numerator of EV/Sales is enterprise value, not market capitalization, so both debt figures must be added before cash is subtracted. Put the right five numbers into the slots of the EV/Sales formula — mind which ones are added and which one is subtracted, and note that the table holds both total assets and cash.',
    },
    facts: [
      {
        label: {
          vi: 'Vốn hóa thị trường (10 triệu cổ phiếu × 17,50 USD)',
          en: 'Market capitalization (10 million shares × 17.50 USD)',
        },
        value: { vi: '175 triệu USD', en: '175 million USD' },
      },
      {
        label: { vi: 'Nợ vay ngắn hạn', en: 'Short-term borrowings' },
        value: { vi: '20 triệu USD', en: '20 million USD' },
      },
      {
        label: { vi: 'Nợ vay dài hạn', en: 'Long-term borrowings' },
        value: { vi: '30 triệu USD', en: '30 million USD' },
      },
      {
        label: { vi: 'Tổng tài sản', en: 'Total assets' },
        value: { vi: '125 triệu USD', en: '125 million USD' },
      },
      {
        label: {
          vi: 'Tiền và tương đương tiền (10% tổng tài sản)',
          en: 'Cash and cash equivalents (10% of total assets)',
        },
        value: { vi: '12,5 triệu USD', en: '12.5 million USD' },
      },
      {
        label: { vi: 'Doanh thu thuần cả năm', en: 'Net revenue for the year' },
        value: { vi: '85 triệu USD', en: '85 million USD' },
      },
    ],
    expected: 2.5,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'EV/Sales = ([175] + [20] + [30] − [12,5]) ÷ [85]',
      en: 'EV/Sales = ([175] + [20] + [30] − [12.5]) ÷ [85]',
    },
    explain: {
      vi: 'Giá trị doanh nghiệp = vốn hóa + nợ vay − tiền mặt, nên tử số là 175 + 20 + 30 − 12,5 = 212,5 triệu USD; chia cho doanh thu thuần 85 triệu USD ra 2,5 lần. Cái bẫy nằm ở dòng Tổng tài sản 125 triệu USD: chỉ 10% số đó là tiền mặt, tức 12,5 triệu USD, nên ai kéo nhầm 125 vào ô trừ sẽ ra 100 ÷ 85 ≈ 1,18 lần, rẻ hơn thực tế gần một nửa. Hai khoản nợ đều phải cộng vào: bỏ sót khoản vay dài hạn 30 triệu USD thì tỷ số tụt còn 2,15 lần. Và nếu chỉ đặt vốn hóa 175 lên tử số rồi chia cho doanh thu thì con số 2,06 lần thu được là P/S chứ không phải EV/Sales — bội số ghép tử số của riêng cổ đông với mẫu số của cả doanh nghiệp, tức bỏ qua đúng phần nợ mà người mua sẽ phải gánh.',
      en: 'Enterprise value = market cap + borrowings − cash, so the numerator is 175 + 20 + 30 − 12.5 = 212.5 million USD; divided by net revenue of 85 million USD that gives 2.5x. The trap is the Total assets row of 125 million USD: only 10% of it is cash, that is 12.5 million USD, so anyone who drags 125 into the subtraction slot gets 100 ÷ 85 ≈ 1.18x, almost half as cheap as reality. Both debt figures must be added: dropping the 30 million USD of long-term borrowings pulls the ratio down to 2.15x. And putting only the 175 market cap in the numerator gives 2.06x, which is P/S rather than EV/Sales — a multiple that pairs an equity numerator with a whole-firm denominator, ignoring exactly the debt a buyer would have to take on.',
    },
    giai: {
      tinh: { vi: 'EV/Sales — EV trên doanh thu', en: 'EV to sales ratio' },
      thaySo: { vi: '(175 + 20 + 30 − 12,5) ÷ 85', en: '(175 + 20 + 30 − 12.5) ÷ 85' },
      ketQua: { vi: '2,5 lần', en: '2.5 x' },
    },
    source: {
      url: 'https://vietnambiz.vn/he-so-ev-r-la-gi-cach-tinh-he-so-ev-r-20200508120305304.htm',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q422',
    formulaId: 'ev',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Cuối năm 2022, cổ phiếu FPT có vốn hoá thị trường 86.774,72 tỷ ₫. Nợ vay của FPT nằm ở hai dòng riêng trên bảng cân đối kế toán — vay ngắn hạn và vay dài hạn — và EV cộng cả hai dòng đó. Bảng số liệu dưới đây có nhiều dòng hơn số ô trống trong công thức. Đặt đúng bốn con số vào ô trống của công thức EV, chú ý ô nào cộng vào và ô nào trừ ra.',
      en: "At the end of 2022, FPT had a market capitalization of 86774.72 billion ₫. FPT's borrowings sit on two separate balance sheet lines — short-term debt and long-term debt — and EV adds both of them. The table below has more rows than the formula has slots. Put the right four numbers into the slots of the EV formula, minding which ones are added and which one is subtracted.",
    },
    facts: [
      {
        label: {
          vi: 'Vốn hoá thị trường (giá 79.100 ₫ × 1.097.025.560 cổ phiếu)',
          en: 'Market capitalization (79100 ₫ × 1097025560 shares)',
        },
        value: { vi: '86.774,72 tỷ ₫', en: '86774.72 billion ₫' },
      },
      {
        label: { vi: 'Vay ngắn hạn', en: 'Short-term debt' },
        value: { vi: '10.904,34 tỷ ₫', en: '10904.34 billion ₫' },
      },
      {
        label: { vi: 'Vay dài hạn', en: 'Long-term debt' },
        value: { vi: '1.477,83 tỷ ₫', en: '1477.83 billion ₫' },
      },
      {
        label: { vi: 'Tiền và tương đương tiền', en: 'Cash and cash equivalents' },
        value: { vi: '6.440,18 tỷ ₫', en: '6440.18 billion ₫' },
      },
      {
        label: {
          vi: 'Nợ vay ròng (nợ vay đã trừ tiền mặt)',
          en: 'Net debt (borrowings less cash)',
        },
        value: { vi: '5.941,99 tỷ ₫', en: '5941.99 billion ₫' },
      },
      {
        label: { vi: 'EBITDA năm 2022', en: '2022 EBITDA' },
        value: { vi: '10.141,07 tỷ ₫', en: '10141.07 billion ₫' },
      },
    ],
    expected: 92716.71,
    tolerance: { kind: 'tuong-doi', value: 0.005 },
    unit: { vi: 'tỷ ₫', en: 'billion ₫' },
    worked: {
      vi: 'EV = [86.774,72] + [10.904,34] + [1.477,83] − [6.440,18]',
      en: 'EV = [86774.72] + [10904.34] + [1477.83] − [6440.18]',
    },
    explain: {
      vi: 'Đặt đúng chỗ thì EV = 86.774,72 + 10.904,34 + 1.477,83 − 6.440,18 = 92.716,71 tỷ ₫, khớp con số Simplize tính cho FPT cuối năm 2022. Hai khoản vay phải cộng riêng vì bảng cân đối kế toán trình bày chúng ở hai dòng, và nguồn định nghĩa rõ phần nào của nợ được đưa vào: “Nợ vay là tổng các khoản nợ có yếu tố lãi suất (phải trả lãi) và bao gồm cả các khoản nợ ngắn hạn và dài hạn.” Bẫy nằm ở dòng nợ vay ròng 5.941,99 tỷ ₫: nó đã trừ tiền mặt sẵn, nên ai đặt nó vào ô nợ vay rồi vẫn trừ tiếp 6.440,18 là trừ tiền mặt hai lần, ra 86.276,53 tỷ ₫ — thấp hơn EV thật gần 6.440 tỷ, thậm chí thấp hơn cả vốn hoá. Dòng EBITDA 10.141,07 tỷ ₫ thuộc về công thức EV/EBITDA ở trang khác, không phải một số hạng của EV, và nó cố ý đứng sát con số vay ngắn hạn 10.904,34 tỷ ₫ để ai chép vội dễ lấy nhầm.',
      en: 'Placed correctly, EV = 86,774.72 + 10,904.34 + 1,477.83 − 6,440.18 = 92,716.71 billion ₫, matching the figure Simplize computes for FPT at the end of 2022. The two borrowing lines are added separately because the balance sheet presents them as two lines, and the source states exactly which part of the liabilities goes in: “Nợ vay là tổng các khoản nợ có yếu tố lãi suất (phải trả lãi) và bao gồm cả các khoản nợ ngắn hạn và dài hạn” (roughly, borrowings are the total of interest-bearing liabilities, short-term and long-term alike). The trap is the net debt row of 5,941.99 billion ₫: cash has already been taken out of it, so putting it in the debt slot and still subtracting 6,440.18 subtracts cash twice and lands on 86,276.53 billion ₫ — nearly 6,440 billion below the real EV, and even below market cap. The 10,141.07 billion ₫ EBITDA row belongs to the EV/EBITDA formula on another page, not to a term of EV, and it sits deliberately close to the 10,904.34 billion ₫ short-term debt figure so a hurried reader can grab the wrong one.',
    },
    giai: {
      tinh: { vi: 'EV — giá trị doanh nghiệp', en: 'Enterprise value' },
      thaySo: {
        vi: '86.774,72 + 10.904,34 + 1.477,83 − 6.440,18',
        en: '86774.72 + 10904.34 + 1477.83 − 6440.18',
      },
      ketQua: { vi: '92.716,71 tỷ ₫', en: '92716.71 billion ₫' },
    },
    source: {
      url: 'https://simplize.vn/learn/ev-ebitda',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q423',
    formulaId: 'fcfe',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một bài hướng dẫn định giá đi từ EBIT 20 triệu USD, thuế suất 21%, khấu hao, chi đầu tư và thay đổi vốn lưu động để ra FCFF 11,8 triệu USD, rồi bắc cầu sang FCFE: doanh nghiệp trả 3 triệu USD chi phí lãi vay và vay ròng thêm 1 triệu USD trong kỳ. Công thức trừ lãi vay SAU THUẾ, nên hệ số (1 − thuế suất) đã nằm sẵn trong hình, trong khi bảng số liệu lại đưa luôn khoản lãi vay sau thuế mà nguồn tính sẵn. Đặt đúng bốn con số vào ô trống của công thức FCFE, chú ý ô lãi vay nhận con số nào và ô nào cộng vào, ô nào trừ ra.',
      en: 'A valuation guide starts from EBIT of USD 20 million, a 21% tax rate, depreciation, capital spending and the change in working capital to reach FCFF of USD 11.8 million, then bridges across to FCFE: the company pays USD 3 million of interest expense and raises USD 1 million of net new debt during the period. The formula subtracts AFTER-TAX interest, so the (1 − tax rate) factor is already drawn in the picture, while the table also hands you the after-tax interest the source has already worked out. Put the right four numbers into the slots of the FCFE formula, minding which figure the interest slot takes and which terms are added and which subtracted.',
    },
    facts: [
      {
        label: {
          vi: 'EBIT cả năm (đầu vào của bước tính FCFF trước đó)',
          en: 'Full-year EBIT (an input to the earlier FCFF step)',
        },
        value: { vi: '20 triệu USD', en: 'USD 20 million' },
      },
      {
        label: {
          vi: 'FCFF — dòng tiền tự do của doanh nghiệp',
          en: 'FCFF — free cash flow to the firm',
        },
        value: { vi: '11,8 triệu USD', en: 'USD 11.8 million' },
      },
      {
        label: {
          vi: 'Chi phí lãi vay trong kỳ (chưa trừ thuế)',
          en: 'Interest expense for the period (before tax)',
        },
        value: { vi: '3 triệu USD', en: 'USD 3 million' },
      },
      {
        label: {
          vi: 'Lãi vay sau thuế nguồn đã tính sẵn',
          en: 'After-tax interest the source already computed',
        },
        value: { vi: '2,37 triệu USD', en: 'USD 2.37 million' },
      },
      {
        label: { vi: 'Thuế suất thuế TNDN', en: 'Corporate income tax rate' },
        value: { vi: '21%', en: '21%' },
      },
      {
        label: {
          vi: 'Vay ròng mới trong kỳ (vay thêm trừ trả gốc)',
          en: 'Net new borrowing in the period (new debt minus principal repaid)',
        },
        value: { vi: '1 triệu USD', en: 'USD 1 million' },
      },
    ],
    expected: 10.43,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: 'triệu USD', en: 'USD million' },
    worked: {
      vi: 'FCFE = [11,8] − [3] × (1 − [21] ÷ 100) + [1]',
      en: 'FCFE = [11.8] − [3] × (1 − [21] ÷ 100) + [1]',
    },
    explain: {
      vi: 'FCFE chỉ trừ phần lãi vay SAU THUẾ, nên ô lãi vay nhận con số gộp 3 triệu USD, còn hệ số (1 − 21 ÷ 100) nằm sẵn trong hình lo phần khấu trừ thuế: 3 × 0,79 ra 2,37 triệu USD. Bảng số liệu cố ý đưa luôn 2,37 triệu USD — đặt con số ấy vào ô lãi vay là trừ thuế hai lần, ra 10,93 thay vì 10,43. Vay ròng mới 1 triệu USD thì CỘNG vào chứ không trừ, vì tiền vay thêm là tiền cổ đông được dùng ngay trong kỳ; đúng vì thế mà khi vay ròng đảo chiều sang âm, FCFE sụt mạnh dù hoạt động kinh doanh không đổi. EBIT 20 triệu USD là đầu vào của bước tính FCFF phía trước, không phải FCFF, nên nó không vào ô nào cả. “take the same $11.8M FCFF from above. Assume interest expense of $3M and the firm raised $1M of net new debt.”',
      en: 'FCFE subtracts only the AFTER-TAX interest, so the interest slot takes the gross figure of USD 3 million while the (1 − 21 ÷ 100) factor already drawn in the picture handles the tax deduction: 3 × 0.79 gives USD 2.37 million. The table deliberately also offers USD 2.37 million — putting that figure into the interest slot deducts tax twice and gives 10.93 instead of 10.43. Net new borrowing of USD 1 million is ADDED, not subtracted, because borrowed money is cash shareholders can use straight away in the period; that is exactly why FCFE drops sharply when net borrowing turns negative even though the underlying business has not changed. EBIT of USD 20 million is an input to the earlier FCFF step, not FCFF itself, so it belongs in no slot at all. “take the same $11.8M FCFF from above. Assume interest expense of $3M and the firm raised $1M of net new debt.”',
    },
    giai: {
      tinh: { vi: 'FCFE — dòng tiền tự do của cổ đông', en: 'Free cash flow to equity' },
      thaySo: { vi: '11,8 − 3 × (1 − 21 ÷ 100) + 1', en: '11.8 − 3 × (1 − 21 ÷ 100) + 1' },
      ketQua: { vi: '10,43 triệu USD', en: '10.43 USD million' },
    },
    source: {
      url: 'https://ctacquisitions.com/free-cash-flow-formula/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q424',
    formulaId: 'fcff',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một tài liệu định giá dựng ví dụ cho doanh nghiệp ABC: EBIT 250 triệu USD, thuế suất thuế TNDN 30%, khấu hao và phân bổ 50 triệu USD, chi đầu tư tài sản cố định 100 triệu USD, và vốn lưu động ròng tăng 20 triệu USD trong kỳ. Bảng số liệu còn có lợi nhuận sau thuế, là con số đã trừ lãi vay và đã nộp thuế rồi, nên nó không phải thứ đi vào ô đầu tiên. Đặt đúng năm con số vào ô trống của công thức FCFF; chú ý ô nào cộng vào, ô nào trừ ra, và ô nằm trong ngoặc nhận con số phần trăm chứ không nhận một khoản tiền.',
      en: 'A valuation write-up builds an example for Company ABC: EBIT of $250 million, a 30% corporate income tax rate, depreciation and amortization of $50 million, capital expenditure of $100 million, and net working capital rising by $20 million over the period. The table also carries net income, a figure that already deducts interest and already pays tax, so it is not what belongs in the first slot. Put the right five numbers into the slots of the FCFF formula; watch which slot adds and which subtracts, and note that the slot inside the parentheses takes the percentage figure, not a money amount.',
    },
    facts: [
      {
        label: {
          vi: 'Lợi nhuận trước lãi vay và thuế (EBIT)',
          en: 'Earnings before interest and tax (EBIT)',
        },
        value: { vi: '250 triệu USD', en: '$250 million' },
      },
      {
        label: { vi: 'Lợi nhuận sau thuế', en: 'Net income' },
        value: { vi: '154 triệu USD', en: '$154 million' },
      },
      {
        label: { vi: 'Thuế suất thuế TNDN', en: 'Corporate income tax rate' },
        value: { vi: '30%', en: '30%' },
      },
      {
        label: { vi: 'Khấu hao và phân bổ', en: 'Depreciation and amortization' },
        value: { vi: '50 triệu USD', en: '$50 million' },
      },
      {
        label: { vi: 'Chi đầu tư tài sản cố định (CapEx)', en: 'Capital expenditure (CapEx)' },
        value: { vi: '100 triệu USD', en: '$100 million' },
      },
      {
        label: {
          vi: 'Tăng vốn lưu động ròng trong kỳ',
          en: 'Increase in net working capital for the period',
        },
        value: { vi: '20 triệu USD', en: '$20 million' },
      },
    ],
    expected: 105,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: 'triệu USD', en: '$ million' },
    worked: {
      vi: 'FCFF = [250] × (100 − [30]) ÷ 100 + [50] − [100] − [20]',
      en: 'FCFF = [250] × (100 − [30]) ÷ 100 + [50] − [100] − [20]',
    },
    explain: {
      vi: '250 × (100 − 30) ÷ 100 ra 175 triệu USD EBIT sau thuế; cộng 50 triệu khấu hao, trừ 100 triệu chi đầu tư và trừ 20 triệu vốn lưu động ròng phình thêm, còn 105 triệu USD. Bẫy nằm ở dòng lợi nhuận sau thuế 154 triệu USD: con số ấy đã trừ 30 triệu USD lãi vay rồi mới chịu thuế, nên đặt nó vào ô đầu tiên là đánh thuế lần thứ hai lên một số đã nộp thuế, đồng thời trừ lãi vay trong khi WACC dùng để chiết khấu FCFF vốn đã tính sẵn chi phí nợ, tức trừ hai lần. Kết quả khi ấy rơi xuống 37,8 triệu USD. Khấu hao được cộng lại vì đó là chi phí không bằng tiền, còn chi đầu tư và phần vốn lưu động tăng thêm là tiền thật đã rời doanh nghiệp nên đều mang dấu trừ.',
      en: '250 × (100 − 30) ÷ 100 gives $175 million of after-tax EBIT; add $50 million of depreciation, subtract $100 million of capital expenditure and subtract the $20 million rise in net working capital, and $105 million is left. The trap is the net income line of $154 million: that figure already deducts $30 million of interest before tax is applied, so putting it in the first slot taxes an already-taxed number a second time while also deducting interest, even though the WACC used to discount FCFF already prices the cost of debt, so the charge lands twice. The result then falls to $37.8 million. Depreciation is added back because it is a non-cash expense, while capital expenditure and the increase in working capital are real money that has left the company, so both carry a minus sign.',
    },
    giai: {
      tinh: { vi: 'FCFF — dòng tiền tự do của doanh nghiệp', en: 'Free cash flow to firm' },
      thaySo: {
        vi: '250 × (100 − 30) ÷ 100 + 50 − 100 − 20',
        en: '250 × (100 − 30) ÷ 100 + 50 − 100 − 20',
      },
      ketQua: { vi: '105 triệu USD', en: '105 $ million' },
    },
    source: {
      url: 'https://www.highradius.com/resources/Blog/unlevered-free-cash-flow-formula/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q425',
    formulaId: 'gia-hoa-von',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một nhà đầu tư mua 1.000 cổ phiếu ở giá 50.000 ₫ rồi giữ 3 tháng trước khi bán. Công ty chứng khoán thu phí môi giới 0,15% mỗi chiều, thuế chuyển nhượng khi bán là 0,1% giá bán, phí lưu ký 0,27 ₫ một cổ phiếu một tháng. Ở mẫu số, phần còn lại của mỗi đồng bán ra đã điền sẵn 0,0015 cho phí bán và 0,001 cho thuế bán; khối lượng 1.000 cũng đã điền sẵn ở cả tử lẫn mẫu. Bảng số liệu còn có giá phiên gần nhất, phí bán ước tính và phí lưu ký một tháng. Hãy đặt đúng ba con số vào ô trống của công thức giá hoà vốn, chú ý phí bán và thuế bán không cộng vào tử số vì chúng đã nằm ở mẫu số, còn phí lưu ký phải lấy của cả kỳ nắm giữ chứ không phải của một tháng.',
      en: 'An investor buys 1,000 shares at 50,000 ₫ and holds them for 3 months before selling. The broker charges 0.15% brokerage on each side, the transfer tax on the sale is 0.1% of the sale value, and custody costs 0.27 ₫ per share per month. In the denominator, the share of each dong of proceeds that survives is already filled in: 0.0015 for the sell fee and 0.001 for the sell tax; the quantity 1000 is already filled in on both the top and the bottom. The table also lists the latest session price, an estimated sell fee and one month of custody. Put the right three figures into the slots of the break-even price formula, noting that the sell fee and the sell tax are not added to the numerator because they already sit in the denominator, and that the custody fee must be the whole holding period, not a single month.',
    },
    facts: [
      {
        label: { vi: 'Khối lượng mua', en: 'Quantity bought' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      {
        label: { vi: 'Giá mua một cổ phiếu', en: 'Buy price per share' },
        value: { vi: '50.000 ₫', en: '50000 ₫' },
      },
      {
        label: { vi: 'Giá thị trường phiên gần nhất', en: 'Latest session market price' },
        value: { vi: '51.200 ₫', en: '51200 ₫' },
      },
      {
        label: { vi: 'Phí giao dịch mua đã trả', en: 'Buy-side brokerage fee already paid' },
        value: { vi: '75.000 ₫', en: '75000 ₫' },
      },
      {
        label: { vi: 'Phí giao dịch bán ước tính', en: 'Estimated sell-side brokerage fee' },
        value: { vi: '75.302 ₫', en: '75302 ₫' },
      },
      {
        label: {
          vi: 'Phí lưu ký cả kỳ nắm giữ 3 tháng',
          en: 'Custody fee for the whole 3-month holding period',
        },
        value: { vi: '810 ₫', en: '810 ₫' },
      },
      {
        label: { vi: 'Phí lưu ký một tháng', en: 'Custody fee for one month' },
        value: { vi: '270 ₫', en: '270 ₫' },
      },
    ],
    expected: 50201.31,
    tolerance: { kind: 'tuong-doi', value: 0.001 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá hoà vốn = (1.000 × [50.000] + [75.000] + [810]) ÷ (1.000 × (1 − 0,0015 − 0,001))',
      en: 'Break-even price = (1000 × [50000] + [75000] + [810]) ÷ (1000 × (1 − 0.0015 − 0.001))',
    },
    explain: {
      vi: 'Tử số chỉ gom những đồng tiền đã thật sự rời tài khoản trước lúc bán: 1.000 × 50.000 = 50.000.000 ₫ tiền mua, cộng 75.000 ₫ phí mua và 810 ₫ phí lưu ký của cả ba tháng, thành 50.075.810 ₫. Con số 75.302 ₫ trong bảng là bẫy chính: phí bán có thật, nhưng nó tính trên chính giá bán còn chưa biết, nên công thức không cộng nó vào tử số mà trừ tỷ lệ 0,0015 của nó ở mẫu số, cùng thuế 0,001. Mỗi 1 ₫ bán ra chỉ còn lại 0,9975 ₫, nên 50.075.810 chia cho 997,5 ra 50.201,31 ₫. Bẫy thứ hai là 270 ₫: đó là phí lưu ký một tháng, đặt nó thay cho 810 ₫ của cả kỳ là tính thiếu chi phí. Bẫy thứ ba là 51.200 ₫, giá phiên gần nhất, không liên quan gì tới vốn đã bỏ ra. Bài học vỡ lòng của Casin dựng đúng tình huống này và ước lượng nhanh bằng tổng ma sát 0,4%, tức 0,15% phí mua nằm ở tử số cộng 0,15% phí bán và 0,1% thuế bán nằm ở mẫu số.',
      en: "The numerator gathers only the money that has actually left the account before the sale: 1,000 × 50,000 = 50,000,000 ₫ of purchase value, plus the 75,000 ₫ buy fee and the 810 ₫ of custody for all three months, giving 50,075,810 ₫. The 75,302 ₫ in the table is the main trap: the sell fee is real, but it is charged on the very sale price that is still unknown, so the formula does not add it to the numerator and instead subtracts its 0.0015 rate in the denominator, alongside the 0.001 tax. Each 1 ₫ of proceeds leaves only 0.9975 ₫, so 50,075,810 divided by 997.5 gives 50,201.31 ₫. The second trap is 270 ₫: that is one month of custody, and using it in place of the 810 ₫ for the whole period understates the cost. The third is 51,200 ₫, the latest session price, which has nothing to do with the money already spent. Casin's primer builds this same scenario and estimates it quickly with a total friction of 0.4%, that is the 0.15% buy fee in the numerator plus the 0.15% sell fee and the 0.1% sell tax in the denominator.",
    },
    giai: {
      tinh: { vi: 'Giá hoà vốn thực', en: 'True break-even price' },
      thaySo: {
        vi: '(1.000 × 50.000 + 75.000 + 810) ÷ (1.000 × (1 − 0,0015 − 0,001))',
        en: '(1000 × 50000 + 75000 + 810) ÷ (1000 × (1 − 0.0015 − 0.001))',
      },
      ketQua: { vi: '50.201,31 ₫', en: '50201.31 ₫' },
    },
    source: {
      url: 'https://casin.vn/hoc/chung-khoan-co-ban/break-even/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q426',
    formulaId: 'gia-tri-hien-tai',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một khoản tiền 500.000.000 ₫ sẽ được nhận trọn gói sau 5 năm nữa, giữa chừng không có đồng nào chảy về. Người nhận muốn quy khoản đó về hôm nay với tỷ lệ chiết khấu 8%/năm. Bảng số liệu ghi kỳ hạn theo cả năm lẫn tháng, và còn có thêm mức lạm phát dự kiến — đặt đúng ba con số vào ô trống của công thức giá trị hiện tại, chú ý số mũ phải đếm theo cùng đơn vị thời gian với tỷ lệ chiết khấu.',
      en: 'A lump sum of 500,000,000 ₫ will be received in 5 years, with no cash flow in between. The recipient wants to bring it back to today at a discount rate of 8%/year. The table states the remaining term in both years and months, and it also lists an expected inflation rate — put the right three numbers into the slots of the present value formula, noting that the exponent must be counted in the same time unit as the discount rate.',
    },
    facts: [
      {
        label: { vi: 'Số tiền sẽ nhận một lần khi đáo hạn', en: 'Lump sum received at maturity' },
        value: { vi: '500.000.000 ₫', en: '500000000 ₫' },
      },
      {
        label: { vi: 'Tỷ lệ chiết khấu yêu cầu', en: 'Required discount rate' },
        value: { vi: '8%/năm', en: '8%/year' },
      },
      {
        label: {
          vi: 'Thời gian còn lại tới lúc nhận tiền',
          en: 'Time remaining until the money is received',
        },
        value: { vi: '5 năm, tức 60 tháng', en: '5 years, that is 60 months' },
      },
      {
        label: { vi: 'Lạm phát bình quân dự kiến', en: 'Expected average inflation' },
        value: { vi: '4%/năm', en: '4%/year' },
      },
    ],
    expected: 340291598.52,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá trị hiện tại = [500.000.000] ÷ (1 + [8] ÷ 100) ^ [5]',
      en: 'Present value = [500000000] ÷ (1 + [8] ÷ 100) ^ [5]',
    },
    explain: {
      vi: 'Tỷ lệ chiết khấu tính theo năm nên số mũ cũng phải đếm theo năm: ô số mũ nhận 5, không phải 60. Đặt nhầm 60 tháng vào đó thì mẫu số thành 1,08^60, tức khoảng 101,26 lần thay vì 1,47 lần, và kết quả rơi xuống chưa tới 5 triệu ₫ — nhỏ hơn con số đúng gần 69 lần. Mức lạm phát 4%/năm trong bảng là số gây nhiễu: lạm phát có thể là một lý do để chọn tỷ lệ chiết khấu cao hay thấp, nhưng nó không thay chỗ của tỷ lệ chiết khấu trong công thức; đặt 4 vào ô tỷ lệ sẽ ra khoảng 410,96 triệu ₫, cao hơn thực tế hơn 70 triệu ₫. Ô tỷ lệ nhận 8 vì con số trong bảng viết theo phần trăm, còn công thức cần tỷ lệ, nên phần ÷ 100 đã được in sẵn chứ không bỏ trống. Đặt đúng cả ba thì 500.000.000 ÷ 1,08^5 ≈ 340.291.598,52 ₫: khoản 500 triệu ₫ nhận sau 5 năm chỉ đáng khoảng 340 triệu ₫ ở hôm nay, đúng mức mà UB Academy tính ra trong ví dụ gốc.',
      en: "The discount rate is quoted per year, so the exponent must be counted in years too: the exponent slot takes 5, not 60. Putting 60 months there makes the denominator 1.08^60, about 101.26 times instead of 1.47 times, and the result drops below 5 million ₫ — nearly 69 times smaller than the correct figure. The 4%/year inflation rate in the table is a distractor: inflation can be a reason to pick a higher or lower discount rate, but it does not take the discount rate's place in the formula; putting 4 in the rate slot gives about 410.96 million ₫, over 70 million ₫ too high. The rate slot takes 8 because the table states a percentage while the formula needs a ratio, which is why the ÷ 100 is printed rather than left blank. Placed correctly, 500,000,000 ÷ 1.08^5 is about 340,291,598.52 ₫: a 500 million ₫ sum received in 5 years is worth only about 340 million ₫ today, the same figure UB Academy computes in the original example.",
    },
    giai: {
      tinh: { vi: 'Giá trị hiện tại (PV)', en: 'Present value' },
      thaySo: { vi: '500.000.000 ÷ (1 + 8 ÷ 100) ^ 5', en: '500000000 ÷ (1 + 8 ÷ 100) ^ 5' },
      ketQua: { vi: '340.291.598,52 ₫', en: '340291598.52 ₫' },
    },
    source: {
      url: 'https://ub.edu.vn/thu-vien-thuat-ngu/gia-tri-hien-tai',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q427',
    formulaId: 'gia-tri-noi-tai-fcff',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một doanh nghiệp niêm yết có dòng tiền ổn định; ban phân tích giả định FCFF từ nay tăng đều mãi ở tốc độ bền vững dài hạn. Mô hình FCFF là dòng tiền thuộc về cả chủ nợ lẫn cổ đông nên phải chiết khấu bằng WACC, không phải bằng chi phí vốn chủ sở hữu, và bảng số liệu cố ý có cả hai suất chiết khấu lẫn hai mức tăng trưởng. Số cổ phiếu lưu hành đã in sẵn ở mẫu số, hãy đặt đúng năm con số còn lại vào ô trống của công thức giá trị nội tại từ FCFF: chú ý g xuất hiện hai lần và chú ý ô nào trừ ra.',
      en: 'A listed company has stable cash flow; the analysts assume FCFF now grows steadily forever at a sustainable long-term rate. FCFF belongs to both creditors and shareholders, so it must be discounted at the WACC rather than at the cost of equity, and the table deliberately carries both discount rates and both growth rates. The share count is already printed in the denominator, so place the remaining five figures into the slots of the FCFF intrinsic value formula: note that g appears twice, and note which slot is subtracted.',
    },
    facts: [
      {
        label: {
          vi: 'Dòng tiền tự do của doanh nghiệp (FCFF) năm vừa rồi',
          en: 'Free cash flow to the firm (FCFF), latest year',
        },
        value: { vi: '500 tỷ ₫', en: '500 billion ₫' },
      },
      {
        label: {
          vi: 'Tăng trưởng FCFF dài hạn bền vững (g)',
          en: 'Sustainable long-term FCFF growth (g)',
        },
        value: { vi: '4%/năm, tức 0,04', en: '4%/year, i.e. 0.04' },
      },
      {
        label: {
          vi: 'Tăng trưởng FCFF của riêng năm vừa rồi',
          en: 'FCFF growth in the latest year alone',
        },
        value: { vi: '11%/năm, tức 0,11', en: '11%/year, i.e. 0.11' },
      },
      {
        label: {
          vi: 'Chi phí vốn bình quân (WACC)',
          en: 'Weighted average cost of capital (WACC)',
        },
        value: { vi: '12%/năm, tức 0,12', en: '12%/year, i.e. 0.12' },
      },
      {
        label: { vi: 'Chi phí vốn chủ sở hữu (Re)', en: 'Cost of equity (Re)' },
        value: { vi: '15%/năm, tức 0,15', en: '15%/year, i.e. 0.15' },
      },
      {
        label: { vi: 'Nợ vay ròng', en: 'Net debt' },
        value: { vi: '800 tỷ ₫', en: '800 billion ₫' },
      },
      {
        label: { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
        value: { vi: '300 triệu CP', en: '300 million shares' },
      },
    ],
    expected: 19000,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá trị nội tại = ([500] × (1 + [0,04]) ÷ ([0,12] − [0,04]) − [800]) ÷ 300 × 1.000',
      en: 'Intrinsic value = ([500] × (1 + [0.04]) ÷ ([0.12] − [0.04]) − [800]) ÷ 300 × 1000',
    },
    explain: {
      vi: 'FCFF là dòng tiền thuộc về cả chủ nợ lẫn cổ đông, nên suất chiết khấu đặt vào ô giữa phải là WACC 0,12. Đặt nhầm chi phí vốn chủ sở hữu 0,15 vào đó là lấy giá vốn của riêng cổ đông chiết khấu dòng tiền của cả doanh nghiệp, giá trị nội tại tụt còn khoảng 13.091 ₫. Bẫy thứ hai nằm ở hai mức tăng trưởng: 11% là mức của riêng năm vừa rồi, không phải tốc độ đều mãi; thay 0,04 bằng 0,11 thì hiệu WACC trừ g chỉ còn 0,01 và giá trị vọt lên hơn 182.000 ₫, đúng kiểu phồng vô lý khi g tiến sát WACC. Ô g lại xuất hiện hai lần, một lần đẩy FCFF sang năm sau và một lần nằm trong hiệu WACC trừ g, nên điền sót một chỗ là hỏng cả bài. Đặt đúng thì giá trị doanh nghiệp ra 6.500 tỷ ₫, trừ 800 tỷ ₫ nợ vay ròng còn 5.700 tỷ ₫ của cổ đông, chia cho 300 triệu cổ phiếu ra 19 nghìn ₫ mỗi cổ phiếu, và hệ số 1.000 in sẵn chỉ để đổi nghìn ₫ sang ₫. Quên trừ nợ vay ròng thì con số thành 21.667 ₫, tức tính cả phần của chủ nợ vào tài sản cổ đông, đúng như nguồn nhắc: “Giá cổ phiếu = (V₀ - VD) / Số cổ phiếu hiện hành”.',
      en: 'FCFF belongs to both creditors and shareholders, so the rate placed in the middle slot must be the WACC of 0.12. Putting the 0.15 cost of equity there discounts the whole firm cash flow at the shareholders own required return, and the intrinsic value drops to about 13,091 ₫. The second trap is the pair of growth rates: 11% is what happened in the latest year alone, not a perpetual rate; swapping 0.04 for 0.11 leaves a WACC minus g spread of only 0.01 and the value balloons past 182,000 ₫, the classic blow-up when g approaches WACC. And g appears twice, once pushing FCFF into next year and once inside the WACC minus g spread, so missing one slot ruins the whole answer. Placed correctly, enterprise value comes to 6,500 billion ₫, less 800 billion ₫ of net debt leaves 5,700 billion ₫ for shareholders, and dividing by 300 million shares gives 19 thousand ₫ per share, with the printed 1,000 factor only converting thousand ₫ into ₫. Forget the net debt subtraction and the figure becomes 21,667 ₫, counting the creditors claim as shareholder value, exactly what the Vietnamese source warns against: “Giá cổ phiếu = (V₀ - VD) / Số cổ phiếu hiện hành” (share price equals firm value minus debt value, divided by shares outstanding).',
    },
    giai: {
      tinh: { vi: 'Giá trị nội tại từ FCFF (DCF)', en: 'Intrinsic value from FCFF' },
      thaySo: {
        vi: '(500 × (1 + 0,04) ÷ (0,12 − 0,04) − 800) ÷ 300 × 1.000',
        en: '(500 × (1 + 0.04) ÷ (0.12 − 0.04) − 800) ÷ 300 × 1000',
      },
      ketQua: { vi: '19.000 ₫', en: '19000 ₫' },
    },
    source: {
      url: 'https://shinhansec.com.vn/vi/kien-thuc-dau-tu/84/dinh-gia-doanh-nghiep-bang-mo-hinh-fcfe-fcff-la-gi.html',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q428',
    formulaId: 'gia-tri-tuong-lai',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bài viết của VietnamBiz về giá trị tương lai của tiền lấy ví dụ: một người gửi tiết kiệm 100.000.000 ₫, kì hạn gửi mỗi lần là 1 năm, lãi suất 10%/năm, và đến hết năm thứ 5 mới rút cả gốc lẫn lãi; lãi mỗi kỳ nhập vào gốc nên đây là lãi kép. Bảng số liệu có cả kì hạn gửi lẫn thời gian giữ, và lãi suất vẫn đang ghi theo phần trăm. Hãy đặt đúng ba con số vào ô trống của công thức Giá trị tương lai: chú ý ô số mũ nhận thời gian giữ chứ không phải kì hạn gửi, còn ô lãi suất đã có sẵn ÷ 100 đứng ngay sau nên chỉ điền con số phần trăm.',
      en: 'A VietnamBiz article on the future value of money works through this example: a saver deposits 100,000,000 ₫ on a term of 1 year each time, at a rate of 10%/year, and only withdraws principal plus interest at the end of year 5; each period of interest is rolled back into the principal, so this is compound interest. The table holds both the deposit term and the holding period, and the rate is still written as a percentage. Put the right three numbers into the slots of the future value formula: note that the exponent slot takes the holding period, not the deposit term, and the rate slot already has ÷ 100 right after it, so enter only the percentage figure.',
    },
    facts: [
      {
        label: { vi: 'Số tiền gửi ban đầu (PV)', en: 'Initial deposit (PV)' },
        value: { vi: '100.000.000 ₫', en: '100000000 ₫' },
      },
      {
        label: { vi: 'Lãi suất tiền gửi', en: 'Deposit interest rate' },
        value: { vi: '10%/năm', en: '10%/year' },
      },
      {
        label: {
          vi: 'Kì hạn gửi mỗi lần, tức mỗi kỳ nhập lãi vào gốc',
          en: 'Deposit term each time, i.e. each period interest is rolled into principal',
        },
        value: { vi: '1 năm', en: '1 year' },
      },
      {
        label: {
          vi: 'Thời gian giữ trước khi rút cả gốc lẫn lãi',
          en: 'Holding period before withdrawing principal plus interest',
        },
        value: { vi: '5 năm', en: '5 years' },
      },
    ],
    expected: 161051000,
    tolerance: { kind: 'tuong-doi', value: 0.001 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá trị tương lai = [100.000.000] × (1 + [10] ÷ 100)^[5]',
      en: 'Future value = [100000000] × (1 + [10] ÷ 100)^[5]',
    },
    explain: {
      vi: 'Nguồn viết thẳng phép tính ra: “FV5 = 100 x (1 + 10%)5 = 161,1 (triệu đồng)”. Đặt đúng chỗ thì 100.000.000 ₫ nhân 1,1 lũy thừa 5 ra 161.051.000 ₫. Cái bẫy nằm ở ô số mũ, vì bảng số liệu có hai mốc thời gian: kì hạn gửi 1 năm và thời gian giữ 5 năm. Kì hạn 1 năm chỉ nói mỗi năm lãi được nhập một lần vào gốc, tức một năm là một kỳ tính lãi; số mũ n phải là số kỳ đã trôi qua, nên nó là 5. Điền 1 vào ô số mũ sẽ ra 110.000.000 ₫, đúng bằng số tiền sau một năm và bỏ mất toàn bộ phần lãi sinh lãi của bốn năm còn lại. Ô lãi suất chừa sẵn ÷ 100 vì công thức cần tỷ lệ 0,1 chứ không phải con số 10; điền thẳng 10 vào chỗ của tỷ lệ sẽ thành mức sinh lợi 1.000% một năm.',
      en: 'The source writes the arithmetic out directly: “FV5 = 100 x (1 + 10%)5 = 161,1 (triệu đồng)”. Placed correctly, 100,000,000 ₫ times 1.1 to the fifth power gives 161,051,000 ₫. The trap sits in the exponent slot, because the table holds two time figures: a deposit term of 1 year and a holding period of 5 years. The 1-year term only says that interest is rolled into the principal once a year, so one year is one compounding period; the exponent n must be the number of periods that have passed, which is 5. Putting 1 in the exponent slot gives 110,000,000 ₫, exactly the balance after one year, and throws away all the interest-on-interest of the remaining four years. The rate slot already carries ÷ 100 because the formula needs the ratio 0.1, not the figure 10; entering 10 where the ratio belongs would mean a return of 1,000% a year.',
    },
    giai: {
      tinh: { vi: 'Giá trị tương lai (FV)', en: 'Future value' },
      thaySo: { vi: '100.000.000 × (1 + 10 ÷ 100)^5', en: '100000000 × (1 + 10 ÷ 100)^5' },
      ketQua: { vi: '161.051.000 ₫', en: '161051000 ₫' },
    },
    source: {
      url: 'https://vietnambiz.vn/gia-tri-tuong-lai-cua-tien-future-value-fv-la-gi-cach-xac-dinh-20190812000605052.htm',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q429',
    formulaId: 'hpr',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Trung tâm Nghiên cứu khoa học và Đào tạo chứng khoán (UBCKNN) nêu ví dụ: nhà đầu tư A mua 1.000 cổ phiếu ở giá 30.000 ₫ một cổ phiếu, một năm sau bán lại toàn bộ ở 35.000 ₫, và trước khi bán đã nhận cổ tức tiền mặt 1.000 ₫ mỗi cổ phiếu. HPR tính trên một cổ phiếu nên số lượng cổ phiếu không vào công thức. Bảng số liệu còn có tỷ lệ cổ tức công bố theo mệnh giá và mệnh giá cổ phiếu − hãy đặt đúng bốn con số vào ô trống của công thức HPR, chú ý giá đầu kỳ xuất hiện hai lần.',
      en: 'The State Securities Commission research and training center (SRTC) gives this example: investor A buys 1,000 shares at 30,000 ₫ per share, sells the whole lot a year later at 35,000 ₫, and before selling receives a cash dividend of 1,000 ₫ per share. HPR is measured per share, so the number of shares never enters the formula. The table also carries the announced dividend rate as a percentage of par value and the par value itself − put the right four numbers into the slots of the HPR formula, and note that the starting price appears twice.',
    },
    facts: [
      {
        label: {
          vi: 'Giá mua một cổ phiếu (đầu kỳ)',
          en: 'Purchase price per share (start of period)',
        },
        value: { vi: '30.000 ₫', en: '30000 ₫' },
      },
      {
        label: { vi: 'Giá bán một cổ phiếu (cuối kỳ)', en: 'Sale price per share (end of period)' },
        value: { vi: '35.000 ₫', en: '35000 ₫' },
      },
      {
        label: {
          vi: 'Cổ tức tiền mặt đã nhận trong kỳ',
          en: 'Cash dividend received during the period',
        },
        value: { vi: '1.000 ₫/CP', en: '1000 ₫/share' },
      },
      {
        label: {
          vi: 'Tỷ lệ cổ tức tiền mặt công bố (theo mệnh giá)',
          en: 'Announced cash dividend rate (on par value)',
        },
        value: { vi: '10%', en: '10%' },
      },
      {
        label: { vi: 'Mệnh giá một cổ phiếu', en: 'Par value per share' },
        value: { vi: '10.000 ₫', en: '10000 ₫' },
      },
    ],
    expected: 20,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'HPR = ([35.000] − [30.000] + [1.000]) ÷ [30.000] × 100',
      en: 'HPR = ([35000] − [30000] + [1000]) ÷ [30000] × 100',
    },
    explain: {
      vi: 'Tử số gồm tất cả những gì một cổ phiếu mang lại trong kỳ: phần giá lên 35.000 − 30.000 = 5.000 ₫ cộng 1.000 ₫ cổ tức đã nhận, thành 6.000 ₫; chia cho 30.000 ₫ vốn bỏ ra ban đầu rồi nhân 100 ra 20%. Giá đầu kỳ phải điền cả hai chỗ vì nó vừa là mốc trừ ở tử số vừa là gốc chia ở mẫu số. Hai dòng cuối bảng là bẫy: cổ tức được công bố dưới dạng 10% mệnh giá, ai đặt số 10 vào ô cổ tức sẽ ra 16,7%, còn ai lấy mệnh giá 10.000 ₫ làm giá đầu kỳ sẽ ra 260%. Vào công thức luôn là số tiền cổ tức thực nhận trên mỗi cổ phiếu và giá mua thực tế, không phải tỷ lệ công bố cũng không phải mệnh giá. Nguồn viết: “Trong trường hợp cổ phiếu ông A mua trả cổ tức hàng năm là 1.000 đồng/cổ phiếu, tương ứng với 1 triệu đồng cho 1000 cổ phiếu đang sở hữu, và ông A nhận được số cổ tức đó trước khi thực hiện giao dịch bán trên thị trường, tổng lợi nhuận thu được là 6.000.000 đồng”.',
      en: 'The numerator holds everything one share returned over the period: the price gain of 35,000 − 30,000 = 5,000 ₫ plus the 1,000 ₫ dividend already received, so 6,000 ₫; divided by the 30,000 ₫ originally invested and multiplied by 100 it gives 20%. The starting price goes into both slots because it is at once the baseline subtracted in the numerator and the base divided by in the denominator. The last two rows of the table are the trap: the dividend was announced as 10% of par value, so putting 10 into the dividend slot yields 16.7%, while taking the 10,000 ₫ par value as the starting price yields 260%. What enters the formula is always the cash actually received per share and the price actually paid, never the announced rate and never the par value. The source writes: “Trong trường hợp cổ phiếu ông A mua trả cổ tức hàng năm là 1.000 đồng/cổ phiếu, tương ứng với 1 triệu đồng cho 1000 cổ phiếu đang sở hữu, và ông A nhận được số cổ tức đó trước khi thực hiện giao dịch bán trên thị trường, tổng lợi nhuận thu được là 6.000.000 đồng” (roughly: the shares also paid an annual dividend of 1,000 ₫ per share, received before the sale, so total profit came to 6,000,000 ₫ on the 1,000-share lot).',
    },
    giai: {
      tinh: { vi: 'HPR — lợi suất kỳ nắm giữ', en: 'Holding period return' },
      thaySo: {
        vi: '(35.000 − 30.000 + 1.000) ÷ 30.000 × 100',
        en: '(35000 − 30000 + 1000) ÷ 30000 × 100',
      },
      ketQua: { vi: '20 %', en: '20 %' },
    },
    source: {
      url: 'https://nhadautu.srtc.org.vn/p/loi-nhuan-va-muc-sinh-loi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q430',
    formulaId: 'lai-suat-hieu-dung',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một khoản tiết kiệm 200.000.000 ₫ gửi kỳ hạn 3 tháng, ngân hàng niêm yết lãi suất danh nghĩa 12%/năm, đến hạn tự động nhập lãi vào gốc rồi gửi tiếp nên trong một năm lãi được ghép 4 lần. Công thức EAR lấy r là lãi suất danh nghĩa cả năm, còn m là số lần ghép lãi trong một năm chứ không phải số tháng của mỗi kỳ. Hãy đặt đúng ba con số trong bảng vào ô trống của công thức EAR; chú ý số lần ghép lãi xuất hiện hai lần, vừa ở mẫu số vừa ở số mũ, và số tiền gửi không vào ô nào cả.',
      en: 'A savings deposit of 200,000,000 ₫ is placed on a three-month term. The bank quotes a nominal rate of 12%/year and, at maturity, automatically rolls the interest into the principal and redeposits it, so interest compounds 4 times within one year. In the EAR formula r is the nominal rate for a full year, while m is the number of compounding periods per year, not the number of months in each period. Put the right three figures from the table into the slots of the EAR formula; note that the compounding frequency appears twice, in the denominator and in the exponent, and that the deposit amount belongs in no slot at all.',
    },
    facts: [
      {
        label: {
          vi: 'Lãi suất danh nghĩa ngân hàng niêm yết / năm',
          en: 'Nominal rate quoted by the bank / year',
        },
        value: { vi: '12 %', en: '12%' },
      },
      {
        label: { vi: 'Số tiền gửi ban đầu', en: 'Initial deposit' },
        value: { vi: '200.000.000 ₫', en: '200,000,000 ₫' },
      },
      {
        label: { vi: 'Kỳ hạn mỗi lần nhập lãi vào gốc', en: 'Term of each compounding period' },
        value: { vi: '3 tháng', en: '3 months' },
      },
      {
        label: { vi: 'Số lần nhập lãi vào gốc trong một năm', en: 'Compounding periods per year' },
        value: { vi: '4 lần', en: '4 times' },
      },
    ],
    expected: 12.5509,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'EAR = ((1 + [12] ÷ [4] ÷ 100)^[4] − 1) × 100',
      en: 'EAR = ((1 + [12] ÷ [4] ÷ 100)^[4] − 1) × 100',
    },
    explain: {
      vi: 'Công thức EAR lấy r là lãi suất danh nghĩa CẢ NĂM và m là SỐ LẦN ghép lãi trong một năm, nên 12 vào ô r, còn 4 vào cả hai ô m: một lần ở mẫu số, một lần ở số mũ. Mỗi quý số dư sinh 12 ÷ 4 = 3 %, ghép bốn lần thành (1 + 0,03)^4 = 1,1255, tức 12,55 %/năm chứ không phải 12 % — đúng con số bài giảng ghi cho trường hợp m = 4. Bảng số liệu cài hai cái bẫy. Dòng "Kỳ hạn mỗi lần nhập lãi vào gốc: 3 tháng" là độ dài của một kỳ, không phải số kỳ trong năm; đặt 3 vào hai ô m sẽ ra 12,49 %, gần đúng nên rất khó nhận ra là sai. Còn 200.000.000 ₫ không vào ô nào cả: lãi suất hiệu dụng là một tỷ lệ, gửi nhiều hay ít thì tỷ lệ ấy vẫn thế.',
      en: 'The EAR formula takes r as the nominal rate for a FULL YEAR and m as the NUMBER OF TIMES interest compounds within that year, so 12 goes into the r slot and 4 goes into both m slots: once in the denominator, once in the exponent. Each quarter the balance earns 12 ÷ 4 = 3%, and compounding four times gives (1 + 0.03)^4 = 1.1255, that is 12.55%/year rather than 12% — the figure the lesson reports for m = 4. The table hides two traps. The row "Term of each compounding period: 3 months" is the length of one period, not the number of periods in a year; putting 3 into both m slots gives 12.49%, close enough that the error is hard to spot. And the 200,000,000 ₫ deposit belongs in no slot at all: an effective rate is a ratio, so the size of the deposit does not change it.',
    },
    giai: {
      tinh: { vi: 'Lãi suất hiệu dụng năm (EAR)', en: 'Effective annual rate' },
      thaySo: { vi: '((1 + 12 ÷ 4 ÷ 100)^4 − 1) × 100', en: '((1 + 12 ÷ 4 ÷ 100)^4 − 1) × 100' },
      ketQua: { vi: '12,55 %', en: '12.55 %' },
    },
    source: {
      url: 'https://tikop.vn/blog/lai-suat-hieu-dung-la-gi-cong-thuc-tinh-lai-suat-hieu-dung-chuan-2317',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q431',
    formulaId: 'loi-nhuan-rong',
    format: 'dien-so',
    kind: 'dinh-che',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Ngày 01/03/2025 một nhà đầu tư mua 1.000 cổ phiếu VCI giá 100.000 ₫, đến 01/04/2025 bán hết ở 105.000 ₫. Công ty chứng khoán thu phí 0,15% mỗi chiều, thuế chuyển nhượng 0,1% khi bán, phí lưu ký 0,27 ₫ một cổ phiếu mỗi tháng — ba mức này đã in sẵn trong công thức nên không phải điền. Bảng số liệu có cả giá trị mua, giá trị bán, phần lãi gộp và số ngày nắm giữ: đặt đúng bốn con số vào ô trống của công thức Lợi nhuận ròng, chú ý mỗi mức phần trăm tính trên giá trị nào, và phí lưu ký đếm theo tháng chứ không theo ngày.',
      en: 'On 2025-03-01 an investor buys 1,000 VCI shares at 100,000 ₫ and on 2025-04-01 sells the whole lot at 105,000 ₫. The broker charges 0.15% on each side, the transfer tax is 0.1% on the sale, and custody costs 0.27 ₫ per share per month — those three rates are already printed in the formula, so they are not to be filled in. The table holds the buy value, the sell value, the gross gain and the number of days held: put the right four numbers into the slots of the net profit formula, watching which value each percentage is charged on, and remember that custody counts months held, not days.',
    },
    facts: [
      {
        label: { vi: 'Khối lượng mua rồi bán', en: 'Quantity bought then sold' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      {
        label: { vi: 'Giá mua một cổ phiếu', en: 'Buy price per share' },
        value: { vi: '100.000 ₫', en: '100000 ₫' },
      },
      {
        label: { vi: 'Giá bán một cổ phiếu', en: 'Sell price per share' },
        value: { vi: '105.000 ₫', en: '105000 ₫' },
      },
      {
        label: { vi: 'Giá trị mua cả lô', en: 'Total buy value' },
        value: { vi: '100.000.000 ₫', en: '100000000 ₫' },
      },
      {
        label: { vi: 'Giá trị bán cả lô', en: 'Total sell value' },
        value: { vi: '105.000.000 ₫', en: '105000000 ₫' },
      },
      {
        label: { vi: 'Lãi gộp trước phí và thuế', en: 'Gross gain before fees and tax' },
        value: { vi: '5.000.000 ₫', en: '5000000 ₫' },
      },
      {
        label: { vi: 'Thời gian nắm giữ', en: 'Holding period' },
        value: { vi: '1 tháng', en: '1 month' },
      },
      {
        label: {
          vi: 'Số ngày nắm giữ, 01/03 đến 01/04/2025',
          en: 'Days held, 2025-03-01 to 2025-04-01',
        },
        value: { vi: '31 ngày', en: '31 days' },
      },
    ],
    expected: 4587230,
    tolerance: { kind: 'tuong-doi', value: 0.0001 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Lợi nhuận ròng = 1.000 × (105.000 − 100.000) − ([100.000.000] × 0,15 ÷ 100 + [105.000.000] × 0,15 ÷ 100 + [105.000.000] × 0,1 ÷ 100 + 1.000 × [1] × 0,27)',
      en: 'Net profit = 1000 × (105000 − 100000) − ([100000000] × 0.15 ÷ 100 + [105000000] × 0.15 ÷ 100 + [105000000] × 0.1 ÷ 100 + 1000 × [1] × 0.27)',
    },
    explain: {
      vi: 'Cả ba mức phần trăm đều tính trên GIÁ TRỊ giao dịch, không tính trên giá một cổ phiếu và càng không tính trên phần lãi. Phí mua đi với giá trị mua 100.000.000 ₫; phí bán và thuế chuyển nhượng cùng đi với giá trị bán 105.000.000 ₫, nên ô thứ hai và ô thứ ba nhận cùng một con số. ACBS viết thẳng: “Nhà đầu tư phải nộp 0,1% trên tổng giá trị giao dịch bán, trong khi người mua không bị tính thuế.” Bẫy thứ nhất trong bảng là dòng lãi gộp 5.000.000 ₫: đặt nó vào ô thuế thì ra 5.000 ₫ thay vì 105.000 ₫, tức là đánh thuế trên lãi, trong khi thuế vẫn thu cả khi giao dịch lỗ. Bẫy thứ hai là 31 ngày: phí lưu ký 0,27 ₫ đếm theo tháng nắm giữ, đặt 31 vào đó thì phí đội từ 270 ₫ lên 8.370 ₫. Đặt đúng cả bốn ô thì tổng phí và thuế là 412.770 ₫, và khoản lãi gộp 5.000.000 ₫ chỉ còn 4.587.230 ₫ thực sự vào túi.',
      en: 'All three percentages are charged on the transaction VALUE, not on the price of a single share and certainly not on the gain. The buy fee pairs with the buy value of 100,000,000 ₫; the sell fee and the transfer tax both pair with the sell value of 105,000,000 ₫, so the second and third slots take the same figure. ACBS states it plainly: “Nhà đầu tư phải nộp 0,1% trên tổng giá trị giao dịch bán, trong khi người mua không bị tính thuế.” (the investor pays 0.1% of the total sale value, while the buyer is not taxed). The first trap in the table is the 5,000,000 ₫ gross gain row: placing it in the tax slot gives 5,000 ₫ instead of 105,000 ₫, which taxes the profit, whereas the tax is collected even on a losing trade. The second trap is the 31 days: the 0.27 ₫ custody fee counts months held, so putting 31 there inflates it from 270 ₫ to 8,370 ₫. Place all four correctly and fees plus tax come to 412,770 ₫, leaving 4,587,230 ₫ of the 5,000,000 ₫ gross gain actually in hand.',
    },
    giai: {
      tinh: { vi: 'Lợi nhuận ròng sau phí & thuế', en: 'Net profit after fees and taxes' },
      thaySo: {
        vi: '1.000 × (105.000 − 100.000) − (100.000.000 × 0,15 ÷ 100 + 105.000.000 × 0,15 ÷ 100 + 105.000.000 × 0,1 ÷ 100 + 1.000 × 1 × 0,27)',
        en: '1000 × (105000 − 100000) − (100000000 × 0.15 ÷ 100 + 105000000 × 0.15 ÷ 100 + 105000000 × 0.1 ÷ 100 + 1000 × 1 × 0.27)',
      },
      ketQua: { vi: '4.587.230 ₫', en: '4587230 ₫' },
    },
    source: {
      url: 'https://acbs.com.vn/blog/chi-phi-giao-dich-chung-khoan',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q432',
    formulaId: 'loi-suat-nam-hoa',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một tài khoản đầu tư lãi 0,7% riêng trong tháng vừa rồi. Để so nhịp lãi đó với lãi suất tiết kiệm niêm yết theo năm, phải quy lợi suất một tháng về cả năm theo lãi kép: trong ngoặc là lợi suất MỘT KỲ, còn số mũ là số kỳ CÓ TRONG MỘT NĂM. Bảng số liệu còn có cả lợi suất lũy kế và số tháng đã nắm giữ kể từ khi mở tài khoản — đặt đúng hai con số vào ô trống của công thức lợi suất năm hoá, chú ý ô số mũ đếm số kỳ trong một năm chứ không phải số tháng đã nắm giữ.',
      en: 'An investment account gained 0.7% in the past month alone. To compare that pace against a savings rate quoted per year, the monthly return has to be annualized by compounding: the bracket takes the return for ONE period, and the exponent takes the number of periods IN ONE YEAR. The table also holds the cumulative return and the number of months held since the account was opened — put the right two numbers into the slots of the annualized return formula, and note that the exponent counts periods per year, not months already held.',
    },
    facts: [
      {
        label: { vi: 'Lợi suất tháng gần nhất', en: 'Latest monthly return' },
        value: { vi: '0,7 %', en: '0.7%' },
      },
      {
        label: {
          vi: 'Số kỳ trong một năm khi kỳ là tháng',
          en: 'Number of periods per year when the period is a month',
        },
        value: { vi: '12 kỳ', en: '12 periods' },
      },
      {
        label: {
          vi: 'Lợi suất lũy kế kể từ khi mở tài khoản',
          en: 'Cumulative return since the account was opened',
        },
        value: { vi: '16 %', en: '16%' },
      },
      {
        label: { vi: 'Số tháng đã nắm giữ', en: 'Number of months held' },
        value: { vi: '15 tháng', en: '15 months' },
      },
    ],
    expected: 8.7311,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Lợi suất năm = ((1 + [0,7] ÷ 100) ^ [12] − 1) × 100',
      en: 'Annual return = ((1 + [0.7] ÷ 100) ^ [12] − 1) × 100',
    },
    explain: {
      vi: 'Quy một tháng về cả năm là đặt lợi suất MỘT KỲ (0,7%) vào ngoặc và số kỳ CÓ TRONG MỘT NĂM (12) vào số mũ; ÷ 100 và × 100 chỉ là đổi đơn vị giữa phần trăm và tỷ lệ nên giữ nguyên, không phải ô để điền. Nguồn viết thẳng phép tính: “If the monthly return is 0.7%, then the compound annual return is: Return_annual = (1.007)^12 - 1 = 0.0873 = 8.73%”. Hai dòng còn lại trong bảng là bẫy. 15 là số tháng ĐÃ nắm giữ, đặt vào số mũ thì ra mức lãi kép của 15 tháng chứ không còn là mức năm hoá. 16% là lợi suất LŨY KẾ của trọn 15 tháng ấy, đặt vào ngoặc thì thành nhân một mức tích luỹ lên mười hai lần nữa, ra con số vô lý. Số mũ luôn là số kỳ trong một năm: 12 nếu kỳ là tháng, 52 nếu kỳ là tuần.',
      en: 'Annualizing one month means putting the return for ONE period (0.7%) inside the bracket and the number of periods IN ONE YEAR (12) in the exponent; the ÷ 100 and × 100 only convert between percent and ratio, so they stay visible and are not slots to fill. The source writes the calculation out: “If the monthly return is 0.7%, then the compound annual return is: Return_annual = (1.007)^12 - 1 = 0.0873 = 8.73%”. The other two rows of the table are traps. 15 is the number of months already held, and in the exponent it gives the compounded 15-month figure rather than an annualized one. 16% is the cumulative return over those whole 15 months, and in the bracket it compounds an already accumulated figure twelve more times, which produces a nonsensical number. The exponent is always the number of periods per year: 12 when the period is a month, 52 when it is a week.',
    },
    giai: {
      tinh: { vi: 'Lợi suất năm hoá', en: 'Annualized return' },
      thaySo: { vi: '((1 + 0,7 ÷ 100) ^ 12 − 1) × 100', en: '((1 + 0.7 ÷ 100) ^ 12 − 1) × 100' },
      ketQua: { vi: '8,73 %', en: '8.73 %' },
    },
    source: {
      url: 'https://analystprep.com/cfa-level-1-exam/quantitative-methods/annualized-returns/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q433',
    formulaId: 'loi-suat-thuc',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Ông A gửi 1 tỷ đồng kỳ hạn 12 tháng theo lãi suất niêm yết trong bảng. Bảng số liệu có cả lãi suất kỳ hạn 6 tháng lẫn mức tăng CPI của riêng tháng gần nhất, trong khi khoản gửi kéo dài đúng một năm nên cả tử số lẫn mẫu số đều phải là số liệu tính theo năm. Đặt đúng hai con số vào ô trống của công thức lợi suất thực sau lạm phát, chú ý ô nào là lãi suất ở tử số, ô nào là lạm phát ở mẫu số.',
      en: 'Mr A deposits VND 1 billion for a 12-month term at the posted rate in the table. The table also holds the 6-month rate and the CPI rise for the latest month alone, while the deposit runs for exactly one year, so both the numerator and the denominator must be figures measured per year. Put the right two numbers into the slots of the real-return-after-inflation formula, minding which slot takes the interest rate in the numerator and which takes inflation in the denominator.',
    },
    facts: [
      {
        label: { vi: 'Lãi suất niêm yết, kỳ hạn 12 tháng', en: 'Posted rate, 12-month term' },
        value: { vi: '5,5%/năm', en: '5.5% a year' },
      },
      {
        label: { vi: 'Lãi suất niêm yết, kỳ hạn 6 tháng', en: 'Posted rate, 6-month term' },
        value: { vi: '4,7%/năm', en: '4.7% a year' },
      },
      {
        label: { vi: 'Lạm phát CPI bình quân cả năm', en: 'Average CPI inflation for the year' },
        value: { vi: '4%/năm', en: '4% a year' },
      },
      {
        label: {
          vi: 'CPI tháng gần nhất so với tháng trước',
          en: 'Latest month CPI against the previous month',
        },
        value: { vi: '0,35%', en: '0.35%' },
      },
      {
        label: { vi: 'Số tiền gửi', en: 'Amount deposited' },
        value: { vi: '1 tỷ đồng', en: 'VND 1 billion' },
      },
    ],
    expected: 1.4423,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%/năm', en: '%/year' },
    worked: {
      vi: 'Lợi suất thực = ((100 + [5,5]) ÷ (100 + [4]) − 1) × 100',
      en: 'Real return = ((100 + [5.5]) ÷ (100 + [4]) − 1) × 100',
    },
    explain: {
      vi: 'Lãi suất niêm yết đi lên tử số, lạm phát đi xuống mẫu số: 100 đồng gửi đi thành 105,5 đồng, còn giỏ hàng 100 đồng nay phải trả 104 đồng, chia hai con số ấy cho nhau mới ra phần sức mua thật sự tăng thêm, khoảng 1,44%/năm. Đảo hai ô cho nhau ra −1,42%/năm, đổi hẳn dấu kết quả. Bảng để sẵn ba cái bẫy: lãi suất kỳ hạn 6 tháng 4,7%/năm (khoản này khoá đúng 12 tháng, đặt vào ra 0,67%/năm), mức tăng CPI 0,35% của riêng một tháng (đặt xuống mẫu số là đem lợi suất cả năm so với lạm phát một tháng, ra 5,13%/năm), và số tiền gửi 1 tỷ đồng vốn không đi vào ô nào, vì lợi suất thực không phụ thuộc gửi nhiều hay ít. Lấy 5,5 trừ thẳng 4 ra 1,5%, cao hơn con số đúng, và khoảng chênh ấy rộng dần khi lạm phát tăng.',
      en: 'The posted rate goes in the numerator and inflation in the denominator: 100 dong deposited becomes 105.5 dong, while a basket that cost 100 dong now costs 104 dong, and only dividing the two gives the purchasing power that is genuinely gained, about 1.44% a year. Swapping the two slots gives −1.42% a year, flipping the sign of the answer. The table sets three traps: the 6-month rate of 4.7% a year (this deposit is locked for a full 12 months, and using it gives 0.67% a year), the 0.35% CPI rise for a single month (putting it in the denominator compares a full-year return against one month of inflation, giving 5.13% a year), and the VND 1 billion deposited, which fills no slot at all because the real return does not depend on how much is deposited. Subtracting 4 straight from 5.5 gives 1.5%, above the correct figure, and that gap widens as inflation rises.',
    },
    giai: {
      tinh: { vi: 'Lợi suất thực sau lạm phát', en: 'Real return (Fisher equation)' },
      thaySo: {
        vi: '((100 + 5,5) ÷ (100 + 4) − 1) × 100',
        en: '((100 + 5.5) ÷ (100 + 4) − 1) × 100',
      },
      ketQua: { vi: '1,44 %/năm', en: '1.44 %/year' },
    },
    source: {
      url: 'https://ub.edu.vn/thu-vien-thuat-ngu/lai-suat-thuc',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q434',
    formulaId: 'mo-hinh-gordon',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Cổ phiếu Công ty A đang giao dịch 48.000 ₫/CP. Doanh nghiệp vừa trả cổ tức tiền mặt 3.000 ₫/CP, cổ tức được giả định tăng đều 5%/năm mãi về sau, và nhà đầu tư đòi hỏi tỷ suất sinh lợi 10%/năm. Mô hình Gordon nhận cổ tức VỪA TRẢ rồi tự nhân tăng trưởng một lần ngay trên tử số, nên bảng số liệu cố ý để sẵn cả cổ tức kỳ vọng năm tới. Hai ô g và r nhập theo thang phần trăm nên tử số viết là (100 + g). Đặt đúng bốn con số vào ô trống của công thức Gordon: chú ý ô cổ tức lấy số vừa trả chứ không phải số năm tới, và tăng trưởng g xuất hiện hai lần.',
      en: "Company A's stock trades at 48,000 ₫ per share. The company has just paid a cash dividend of 3,000 ₫ per share, that dividend is assumed to grow at a steady 5% per year forever, and investors require a 10% annual return. The Gordon model takes the dividend JUST PAID and applies the growth factor once itself, right in the numerator, so the table deliberately also lists next year's expected dividend. The g and r fields are entered on a percentage scale, so the numerator is written as (100 + g). Put the right four figures into the slots of the Gordon formula: mind that the dividend slot takes the amount just paid, not next year's, and that the growth rate g appears twice.",
    },
    facts: [
      {
        label: {
          vi: 'Giá thị trường một cổ phiếu (ngày định giá)',
          en: 'Market price per share (valuation date)',
        },
        value: { vi: '48.000 ₫', en: '48000 ₫' },
      },
      {
        label: { vi: 'Cổ tức tiền mặt vừa trả (D0)', en: 'Cash dividend just paid (D0)' },
        value: { vi: '3.000 ₫', en: '3000 ₫' },
      },
      {
        label: { vi: 'Cổ tức kỳ vọng năm tới (D1)', en: 'Expected dividend next year (D1)' },
        value: { vi: '3.150 ₫', en: '3150 ₫' },
      },
      {
        label: {
          vi: 'Tốc độ tăng trưởng cổ tức dài hạn (g)',
          en: 'Long-term dividend growth rate (g)',
        },
        value: { vi: '5 %/năm', en: '5%/year' },
      },
      {
        label: { vi: 'Tỷ suất sinh lợi yêu cầu (r)', en: 'Required rate of return (r)' },
        value: { vi: '10 %/năm', en: '10%/year' },
      },
    ],
    expected: 63000,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá trị cổ phiếu = [3.000] × (100 + [5]) ÷ ([10] − [5])',
      en: 'Share value = [3000] × (100 + [5]) ÷ ([10] − [5])',
    },
    explain: {
      vi: 'Đặt 3.000 ₫ vào ô cổ tức, 5 vào cả hai ô tăng trưởng và 10 vào ô tỷ suất yêu cầu thì dòng công thức thành 3.000 × 105 ÷ 5 = 63.000 ₫, trùng đúng lời giải của nguồn: “P0 = [CF0x(1+g)] / (r - g) = [3.000x(1 + 5%)] / (10% - 5%) = 63.000 đồng”. Bẫy nằm ở dòng 3.150 ₫ trong bảng: đó là cổ tức kỳ vọng năm tới, tức 3.000 đã được nhân sẵn (1 + g). Đặt nó vào ô cổ tức là nhân tăng trưởng hai lần và ra 66.150 ₫, cao hơn 5% một cách vô cớ. Ngược lại, quên hẳn phần (100 + g) mà chia thẳng 3.000 cho 5 thì ra 60.000 ₫, tức bỏ mất một năm tăng trưởng. Giá thị trường 48.000 ₫ không bao giờ đi vào công thức; nó chỉ là mức để đem so với kết quả, và ở đây 63.000 ₫ cao hơn 48.000 ₫ nên mô hình nói cổ phiếu đang rẻ. Tử số viết (100 + g) chứ không phải (1 + g) vì hai ô g và r nhập theo thang phần trăm: nhân với (100 + g) rồi chia cho (r − g) cho đúng kết quả như nhân với (1 + g/100) rồi chia cho (r − g)/100.',
      en: "Putting 3,000 ₫ in the dividend slot, 5 in both growth slots and 10 in the required-return slot turns the line into 3,000 × 105 ÷ 5 = 63,000 ₫, matching the source's own solution: “P0 = [CF0x(1+g)] / (r - g) = [3.000x(1 + 5%)] / (10% - 5%) = 63.000 đồng” (Vietnamese; 3,000 grown by 5% and divided by the 10% minus 5% spread gives 63,000 dong). The trap is the 3,150 ₫ row in the table: that is next year's expected dividend, meaning 3,000 already multiplied by (1 + g). Placing it in the dividend slot applies growth twice and yields 66,150 ₫, 5% too high for no reason. Conversely, dropping the (100 + g) factor and dividing 3,000 straight by 5 gives 60,000 ₫, which throws away a full year of growth. The 48,000 ₫ market price never enters the formula; it is only the figure you compare the answer against, and here 63,000 ₫ above 48,000 ₫ is the model calling the stock cheap. The numerator is written as (100 + g) rather than (1 + g) because g and r are entered on a percentage scale: multiplying by (100 + g) and dividing by (r − g) gives the same result as multiplying by (1 + g/100) and dividing by (r − g)/100.",
    },
    giai: {
      tinh: { vi: 'Mô hình Gordon (DDM một giai đoạn)', en: 'Gordon growth model' },
      thaySo: { vi: '3.000 × (100 + 5) ÷ (10 − 5)', en: '3000 × (100 + 5) ÷ (10 − 5)' },
      ketQua: { vi: '63.000 ₫', en: '63000 ₫' },
    },
    source: {
      url: 'https://www.profinvietnam.com/p/mo-hinh-tang-truong-gordon',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q435',
    formulaId: 'no-tren-von-chu',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bảng cân đối kế toán hợp nhất của Tập đoàn Hòa Phát (HPG) tại 31/12/2025 tách nợ phải trả thành hai dòng riêng: nợ ngắn hạn và nợ dài hạn. D/E lấy TOÀN BỘ nợ phải trả, tức cộng cả hai dòng lại, còn mẫu số phải là vốn chủ sở hữu của đúng ngày chốt sổ ấy. Bảng số liệu dưới đây cố ý có thêm tổng tài sản và vốn chủ sở hữu của kỳ trước. Đặt đúng ba con số vào ô trống của công thức D/E, chú ý hai ô trên tử số cộng vào nhau và ô mẫu số phải cùng ngày 31/12/2025.',
      en: "Hoa Phat Group's (HPG) consolidated balance sheet at 31 December 2025 splits liabilities into two separate lines: short-term liabilities and long-term liabilities. D/E takes ALL liabilities, i.e. both lines added together, while the denominator must be equity at that same reporting date. The table below deliberately also carries total assets and the prior period's equity. Put the right three figures into the slots of the D/E formula, noting that the two numerator slots add together and that the denominator slot must come from the same 31 December 2025 date.",
    },
    facts: [
      {
        label: { vi: 'Nợ ngắn hạn 31/12/2025', en: 'Short-term liabilities at 31/12/2025' },
        value: { vi: '94.186 tỷ ₫', en: '94186 billion ₫' },
      },
      {
        label: { vi: 'Nợ dài hạn 31/12/2025', en: 'Long-term liabilities at 31/12/2025' },
        value: { vi: '32.493 tỷ ₫', en: '32493 billion ₫' },
      },
      {
        label: { vi: 'Tổng tài sản 31/12/2025', en: 'Total assets at 31/12/2025' },
        value: { vi: '257.899 tỷ ₫', en: '257899 billion ₫' },
      },
      {
        label: { vi: 'Vốn chủ sở hữu 31/12/2025', en: 'Equity at 31/12/2025' },
        value: { vi: '131.220 tỷ ₫', en: '131220 billion ₫' },
      },
      {
        label: { vi: 'Vốn chủ sở hữu 31/12/2024', en: 'Equity at 31/12/2024' },
        value: { vi: '114.647 tỷ ₫', en: '114647 billion ₫' },
      },
    ],
    expected: 0.9654,
    tolerance: { kind: 'tuyet-doi', value: 0.005 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'D/E = ([94.186] + [32.493]) ÷ [131.220]',
      en: 'D/E = ([94186] + [32493]) ÷ [131220]',
    },
    explain: {
      vi: '94.186 + 32.493 = 126.679 tỷ ₫ nợ phải trả, chia cho 131.220 tỷ ₫ vốn chủ sở hữu ra 0,97 lần: Hòa Phát đang gánh xấp xỉ một đồng nợ trên mỗi đồng vốn của cổ đông, đúng mức mà bài phân tích nhận xét là “mức đòn bẩy D/E gần 1 lần”. Bảng số liệu cài hai cái bẫy. Đặt 257.899 tỷ ₫ tổng tài sản xuống mẫu số ra 0,49 lần, nhưng đó là hệ số nợ trên tổng tài sản, một chỉ số khác hẳn, và nó luôn nhỏ hơn D/E vì tổng tài sản đã bao gồm sẵn phần vốn chủ. Đặt 114.647 tỷ ₫ vốn chủ của 31/12/2024 xuống mẫu số ra 1,10 lần, tức thổi đòn bẩy lên thêm 14%, vì đó là lấy nợ cuối kỳ chia cho vốn chủ đầu kỳ, trộn hai ngày chốt sổ khác nhau. Tử số và mẫu số của D/E phải đọc trên cùng một cột của cùng một bảng cân đối kế toán.',
      en: '94,186 + 32,493 = 126,679 billion ₫ of liabilities, divided by 131,220 billion ₫ of equity, gives 0.97x: Hoa Phat carries roughly one dong of debt for every dong of shareholder capital, matching the analysis note that its leverage sits at about 1x. The table sets two traps. Putting total assets of 257,899 billion ₫ in the denominator gives 0.49x, but that is the debt-to-assets ratio, an entirely different metric, and it is always smaller than D/E because total assets already include equity. Putting the 31/12/2024 equity of 114,647 billion ₫ in the denominator gives 1.10x, inflating leverage by 14%, because that divides period-end debt by opening equity and mixes two different reporting dates. The numerator and denominator of D/E must be read from the same column of the same balance sheet.',
    },
    giai: {
      tinh: { vi: 'D/E — hệ số nợ trên vốn chủ', en: 'Debt to equity ratio' },
      thaySo: { vi: '(94.186 + 32.493) ÷ 131.220', en: '(94186 + 32493) ÷ 131220' },
      ketQua: { vi: '0,9654 lần', en: '0.9654 x' },
    },
    source: {
      url: 'https://www.dsc.com.vn/kien-thuc/phan-tich-bao-cao-tai-chinh-hoa-phat',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q436',
    formulaId: 'pb',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bài học định giá của Simplize tính P/B cho Vinamilk (VNM): giá cổ phiếu 74.700 ₫, vốn chủ sở hữu cuối năm 2022 là 32.816,52 tỷ ₫ trên 2,09 tỷ cổ phiếu đang lưu hành. Công thức dưới đây khai triển giá trị sổ sách mỗi cổ phiếu thành vốn chủ sở hữu chia số cổ phiếu lưu hành; vốn chủ sở hữu tính bằng tỷ ₫ chia cho số cổ phiếu tính bằng tỷ cổ phiếu nên thương số ra thẳng ₫ một cổ phiếu, không cần hệ số đổi đơn vị nào. Bảng số liệu có cả vốn điều lệ theo mệnh giá, hãy đặt đúng ba con số vào ô trống của công thức P/B, chú ý mẫu số lấy vốn chủ sở hữu chứ không lấy vốn điều lệ.',
      en: "Simplize's valuation lesson computes P/B for Vinamilk (VNM): share price 74700 ₫, shareholders' equity at the end of 2022 of 32816.52 billion ₫ over 2.09 billion shares outstanding. The formula below expands book value per share into equity divided by shares outstanding; equity in billions of dong over shares in billions of shares gives dong per share directly, so no unit factor is needed. The table also carries charter capital at par value, so put the right three numbers into the slots of the P/B formula, noting that the denominator takes equity, not charter capital.",
    },
    facts: [
      {
        label: { vi: 'Giá thị trường một cổ phiếu VNM', en: 'VNM market price per share' },
        value: { vi: '74.700 ₫', en: '74700 ₫' },
      },
      {
        label: { vi: 'Vốn chủ sở hữu cuối năm 2022', en: "Shareholders' equity at end of 2022" },
        value: { vi: '32.816,52 tỷ ₫', en: '32816.52 billion ₫' },
      },
      {
        label: { vi: 'Số cổ phiếu đang lưu hành', en: 'Shares outstanding' },
        value: { vi: '2,09 tỷ cổ phiếu', en: '2.09 billion shares' },
      },
      {
        label: {
          vi: 'Vốn điều lệ theo mệnh giá (2,09 tỷ cổ phiếu nhân mệnh giá)',
          en: 'Charter capital at par value (2.09 billion shares times par)',
        },
        value: { vi: '20.900 tỷ ₫', en: '20900 billion ₫' },
      },
      {
        label: { vi: 'Mệnh giá một cổ phiếu niêm yết', en: 'Par value of one listed share' },
        value: { vi: '10.000 ₫', en: '10000 ₫' },
      },
    ],
    expected: 4.76,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'P/B = [74.700] ÷ ([32.816,52] ÷ [2,09])',
      en: 'P/B = [74700] ÷ ([32816.52] ÷ [2.09])',
    },
    explain: {
      vi: 'Vốn chủ sở hữu 32.816,52 tỷ ₫ chia cho 2,09 tỷ cổ phiếu ra giá trị sổ sách 15.702 ₫ một cổ phiếu, rồi 74.700 chia 15.702 ra 4,76 lần, đúng con số bài học công bố: “Giá trị sổ sách hiện tại của VNM = 32,816.52 (tỷ đồng) / 2.09 (tỷ cổ phiếu) = 15,702 (vnđ/CP)”. Cái bẫy nằm ở dòng vốn điều lệ 20.900 tỷ ₫: nó chỉ là 2,09 tỷ cổ phiếu nhân mệnh giá 10.000 ₫, nên đặt nó vào mẫu số sẽ cho giá trị sổ sách đúng bằng mệnh giá 10.000 ₫ và P/B vọt lên 7,47 lần, đắt hơn thực tế hơn một nửa. Vốn chủ sở hữu còn gồm thặng dư vốn cổ phần và lợi nhuận giữ lại nhiều năm, còn vốn điều lệ thì đứng yên cho tới đợt phát hành kế tiếp, nên hai con số này không thay thế cho nhau được. Mệnh giá 10.000 ₫ đặt vào mẫu số cũng cho cùng kết quả sai ấy.',
      en: 'Equity of 32816.52 billion ₫ divided by 2.09 billion shares gives book value of 15702 ₫ per share, and 74700 divided by 15702 gives 4.76x, exactly the figure the lesson publishes: “Giá trị sổ sách hiện tại của VNM = 32,816.52 (tỷ đồng) / 2.09 (tỷ cổ phiếu) = 15,702 (vnđ/CP)”. The trap is the charter capital row of 20900 billion ₫: it is merely 2.09 billion shares times the 10000 ₫ par value, so putting it in the denominator returns a book value equal to par, 10000 ₫, and pushes P/B to 7.47x, over half again more expensive than reality. Equity also carries share premium and years of retained earnings, while charter capital stays frozen until the next issue, so the two figures are not interchangeable. Putting the 10000 ₫ par value straight into the denominator produces the same wrong answer.',
    },
    giai: {
      tinh: { vi: 'P/B — hệ số giá trên giá trị sổ sách', en: 'Price to book ratio' },
      thaySo: { vi: '74.700 ÷ (32.816,52 ÷ 2,09)', en: '74700 ÷ (32816.52 ÷ 2.09)' },
      ketQua: { vi: '4,76 lần', en: '4.76 x' },
    },
    source: {
      url: 'https://simplize.vn/learn/chi-so-pb',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q437',
    formulaId: 'peg',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'VnExpress lấy cổ phiếu X làm ví dụ: ngày 4/3/2024 giá thị trường là 25.000 đồng, EPS trong năm là 3.000 đồng, tốc độ tăng trưởng EPS dự kiến 10%/năm. Ở đây P/E được viết khai triển thành giá chia EPS, nên công thức PEG có ba ô trống. Bảng số liệu còn kèm EPS năm liền trước và tốc độ tăng trưởng doanh thu dự kiến, hãy đặt đúng ba con số vào ô trống của công thức PEG. Chú ý ô EPS nhận EPS nào, và ô tăng trưởng nhận tăng trưởng lợi nhuận kỳ vọng viết trần theo số phần trăm, không phải tăng trưởng doanh thu.',
      en: 'VnExpress uses stock X as an example: on March 4, 2024 the market price is 25,000 dong, EPS for the year is 3,000 dong, and expected EPS growth is 10%/year. Here P/E is written out as price divided by EPS, so the PEG formula has three slots. The table also carries the prior year EPS and the expected revenue growth, so put the right three numbers into the slots of the PEG formula. Mind which EPS the denominator takes, and that the growth slot takes expected earnings growth as a plain percentage figure, not revenue growth.',
    },
    facts: [
      {
        label: {
          vi: 'Giá thị trường cổ phiếu X (4/3/2024)',
          en: 'Market price of stock X (March 4, 2024)',
        },
        value: { vi: '25.000 ₫', en: '25000 ₫' },
      },
      {
        label: { vi: 'EPS trong năm của cổ phiếu X', en: 'EPS for the year of stock X' },
        value: { vi: '3.000 ₫', en: '3000 ₫' },
      },
      {
        label: { vi: 'EPS năm liền trước', en: 'Prior year EPS' },
        value: { vi: '2.500 ₫', en: '2500 ₫' },
      },
      {
        label: { vi: 'Tăng trưởng EPS dự kiến (G)', en: 'Expected EPS growth (G)' },
        value: { vi: '10%/năm', en: '10%/year' },
      },
      {
        label: { vi: 'Tăng trưởng doanh thu dự kiến', en: 'Expected revenue growth' },
        value: { vi: '18%/năm', en: '18%/year' },
      },
    ],
    expected: 0.8333,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'PEG = ([25.000] ÷ [3.000]) ÷ [10]',
      en: 'PEG = ([25000] ÷ [3000]) ÷ [10]',
    },
    explain: {
      vi: 'Giá 25.000 ₫ chia EPS 3.000 ₫ ra P/E khoảng 8,33 lần, chia tiếp cho 10 là con số phần trăm của tăng trưởng EPS kỳ vọng thì ra PEG khoảng 0,83, đúng kết quả nguồn viết: “PEG = 8,3 / 10 = 0,83”. Dưới 1 nghĩa là P/E đang thấp so với tốc độ tăng trưởng của chính doanh nghiệp. Bảng cố ý để hai con số sai chỗ. Đặt EPS năm liền trước 2.500 ₫ xuống mẫu số thì P/E thành 10 lần và PEG thành 1,00, cổ phiếu từ chỗ rẻ so với tăng trưởng hoá ra vừa đúng giá. Đặt tăng trưởng doanh thu 18%/năm vào ô tăng trưởng thì PEG còn khoảng 0,46, rẻ gấp đôi mức thật, trong khi doanh thu tăng nhanh hơn lợi nhuận là chuyện rất thường gặp khi biên lợi nhuận co lại. Ô tăng trưởng cũng nhận 10 chứ không phải 0,10: g trong PEG là con số phần trăm viết trần.',
      en: "A price of 25,000 ₫ divided by EPS of 3,000 ₫ gives a P/E of about 8.33x; dividing again by 10, the percentage figure for expected EPS growth, gives a PEG of about 0.83, matching the source: “PEG = 8,3 / 10 = 0,83”. Below 1 means the P/E is low relative to the company's own growth rate. The table deliberately holds two numbers that belong nowhere in this formula. Putting the prior year EPS of 2,500 ₫ in the denominator turns P/E into 10x and PEG into 1.00, so the stock moves from cheap relative to growth to merely fairly priced. Putting the 18%/year revenue growth into the growth slot gives a PEG of about 0.46, twice as cheap as the real figure, and revenue growing faster than earnings is very common when margins are shrinking. The growth slot also takes 10, not 0.10: g in PEG is the plain percentage figure.",
    },
    giai: {
      tinh: { vi: 'PEG — P/E trên tăng trưởng', en: 'Price/earnings to growth ratio' },
      thaySo: { vi: '(25.000 ÷ 3.000) ÷ 10', en: '(25000 ÷ 3000) ÷ 10' },
      ketQua: { vi: '0,8333 lần', en: '0.8333 x' },
    },
    source: {
      url: 'https://vnexpress.net/chi-so-peg-la-gi-4861277.html',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q438',
    formulaId: 'phi-giao-dich-ban',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một nhà đầu tư bán 1.000 cổ phiếu ở giá khớp lệnh 90.000 ₫, tài khoản mở tại một công ty chứng khoán thu phí môi giới kênh trực tuyến 0,15% giá trị lệnh (mức các công ty thị phần lớn công bố hiện dao động quanh 0,12% đến 0,25%). Bảng số liệu ghi thêm giá mua trước đó và thuế suất chuyển nhượng, cả hai đều là số hợp lý nhưng không thuộc công thức này. Hãy đặt đúng ba con số vào ô trống của công thức phí giao dịch bán: chú ý ô giá lấy giá bán chứ không lấy giá vốn, và ô tỷ lệ lấy phí môi giới chứ không lấy thuế suất.',
      en: 'An investor sells 1,000 shares at a matched price of 90,000 ₫, through a brokerage that charges an online commission of 0.15% of the order value (published online rates at the largest brokers currently sit between 0.12% and 0.25%). The table also lists the earlier buy price and the transfer tax rate, both plausible figures that belong to neither slot of this formula. Put the right three numbers into the slots of the sell-side brokerage fee formula: the price slot takes the sell price, not the cost basis, and the rate slot takes the commission, not the tax rate.',
    },
    facts: [
      {
        label: { vi: 'Khối lượng bán', en: 'Quantity sold' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      {
        label: { vi: 'Giá bán khớp lệnh', en: 'Matched sell price' },
        value: { vi: '90.000 ₫', en: '90000 ₫' },
      },
      {
        label: { vi: 'Giá mua trước đó (giá vốn)', en: 'Earlier buy price (cost basis)' },
        value: { vi: '82.000 ₫', en: '82000 ₫' },
      },
      {
        label: {
          vi: 'Tỷ lệ phí môi giới lệnh bán, kênh trực tuyến',
          en: 'Online sell-side brokerage fee rate',
        },
        value: { vi: '0,15 %', en: '0.15 %' },
      },
      {
        label: { vi: 'Thuế suất chuyển nhượng khi bán', en: 'Transfer tax rate on a sale' },
        value: { vi: '0,1 %', en: '0.1 %' },
      },
    ],
    expected: 135000,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Phí bán = [1.000] × [90.000] × [0,15] ÷ 100',
      en: 'Sell fee = [1000] × [90000] × [0.15] ÷ 100',
    },
    explain: {
      vi: 'Phí môi giới chiều bán tính trên giá trị lệnh bán thực khớp: 1.000 × 90.000 ₫ ra 90.000.000 ₫, nhân tiếp 0,15% ra 135.000 ₫. Phép chia cho 100 để nguyên trong công thức vì nó chỉ đổi con số phần trăm của biểu phí thành hệ số nhân, nó thuộc về công thức chứ không phải số liệu của đề bài. Bảng số liệu cài sẵn hai cái bẫy. Thứ nhất là giá mua 82.000 ₫: đặt nó vào ô giá sẽ ra 123.000 ₫, sai vì người điền vẫn tính theo giá vốn, trong khi công ty chứng khoán thu trên số tiền lệnh bán vừa khớp, nên giá càng tăng thì phí bán càng cao hơn phí mua. Thứ hai là thuế suất chuyển nhượng 0,1%: đặt vào ô tỷ lệ sẽ ra 90.000 ₫, đó là khoản thuế nộp cho Nhà nước, một khoản khác cũng trừ vào tiền bán nhưng không phải phí môi giới. Lệnh bán này chịu cả hai khoản, cộng lại là 225.000 ₫.',
      en: "The sell-side commission is charged on the value of the order that actually matched: 1,000 × 90,000 ₫ gives 90,000,000 ₫, and 0.15% of that is 135,000 ₫. The division by 100 stays visible in the formula because it only turns the schedule's percentage figure into a multiplier; it belongs to the formula, not to the data in the question. The table holds two traps. First, the buy price of 82,000 ₫: putting it into the price slot gives 123,000 ₫, wrong because it reasons from the cost basis, while the brokerage charges on the proceeds of the matched sell order, so a risen price means a bigger fee on the sell leg than on the buy leg. Second, the transfer tax rate of 0.1%: putting it into the rate slot gives 90,000 ₫, which is the tax paid to the State, a separate deduction from the sale proceeds and not the commission. This sell order carries both, 225,000 ₫ together.",
    },
    giai: {
      tinh: { vi: 'Phí giao dịch bán', en: 'Sell-side brokerage fee' },
      thaySo: { vi: '1.000 × 90.000 × 0,15 ÷ 100', en: '1000 × 90000 × 0.15 ÷ 100' },
      ketQua: { vi: '135.000 ₫', en: '135000 ₫' },
    },
    source: {
      url: 'https://vnexpress.net/phi-giao-dich-tai-cac-cong-ty-chung-khoan-lon-4304921.html',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q439',
    formulaId: 'phi-giao-dich-mua',
    format: 'dien-so',
    kind: 'dinh-che',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một nhà đầu tư mua 1.000 cổ phiếu ACB ở giá 25.000 ₫ qua công ty chứng khoán thu phí môi giới 0,3% giá trị lệnh. Cùng lô đó dự tính bán lại ở 30.000 ₫, và lúc bán còn chịu thuế thu nhập cá nhân 0,1%. Công thức phí giao dịch mua đã dựng sẵn dưới đây, chia thêm cho 100 để đưa tỷ lệ phí từ thang phần trăm về dạng tỷ lệ. Đặt đúng ba con số vào ô trống của công thức Phí giao dịch mua, chú ý ô giá lấy giá MUA chứ không phải giá bán, và ô tỷ lệ lấy phí môi giới chứ không phải thuế bán.',
      en: 'An investor buys 1,000 ACB shares at 25,000 ₫ through a broker charging a 0.3% commission on the order value. The same lot is meant to be sold later at 30,000 ₫, and selling also carries a 0.1% personal income tax. The buy-side fee formula is laid out below, with an extra division by 100 that turns the fee rate from a percentage into a plain ratio. Put the right three figures into the slots of the Buy-side brokerage fee formula, minding that the price slot takes the BUY price and not the sell price, and that the rate slot takes the commission and not the sales tax.',
    },
    facts: [
      {
        label: { vi: 'Khối lượng mua', en: 'Quantity bought' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      {
        label: { vi: 'Giá mua một cổ phiếu ACB', en: 'ACB buy price per share' },
        value: { vi: '25.000 ₫', en: '25000 ₫' },
      },
      {
        label: { vi: 'Giá bán dự tính', en: 'Planned sell price' },
        value: { vi: '30.000 ₫', en: '30000 ₫' },
      },
      {
        label: { vi: 'Phí môi giới công ty chứng khoán thu', en: 'Broker commission rate' },
        value: { vi: '0,3%', en: '0.3%' },
      },
      {
        label: {
          vi: 'Thuế thu nhập cá nhân, chỉ thu khi bán',
          en: 'Personal income tax, charged on selling only',
        },
        value: { vi: '0,1%', en: '0.1%' },
      },
    ],
    expected: 75000,
    tolerance: { kind: 'tuong-doi', value: 0.005 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Phí mua = [1.000] × [25.000] × [0,3] ÷ 100',
      en: 'Buy fee = [1000] × [25000] × [0.3] ÷ 100',
    },
    explain: {
      vi: '1.000 × 25.000 ₫ ra giá trị lệnh 25.000.000 ₫; nhân tiếp 0,3% được 75.000 ₫, đúng con số nguồn KIS tự tính trong cùng ví dụ: “Phí mua (0,3%): 75.000đ”. Hai con số gài bẫy trong bảng đều là số thật của cùng vòng giao dịch ấy, nên rất dễ với nhầm. Đặt giá bán 30.000 ₫ vào ô giá sẽ ra 90.000 ₫, đó là phí BÁN của lệnh sau chứ không phải phí mua đang hỏi. Đặt 0,1% vào ô tỷ lệ sẽ ra 25.000 ₫, vì 0,1% là thuế thu nhập cá nhân, chỉ thu khi bán và thu trên giá bán, không dính gì tới lệnh mua. Phí mua luôn tính trên giá trị lệnh MUA đã khớp, nên chỉ khối lượng, giá mua và tỷ lệ phí môi giới được vào công thức; phần ÷ 100 để nguyên vì nó chỉ đổi 0,3% về dạng tỷ lệ 0,003.',
      en: '1,000 × 25,000 ₫ gives an order value of 25,000,000 ₫; multiplying by 0.3% gives 75,000 ₫, exactly the figure the KIS source computes in the same example: “Phí mua (0,3%): 75.000đ”. Both distractors in the table are real numbers from that same round trip, which is what makes them easy to grab. Putting the 30,000 ₫ sell price into the price slot gives 90,000 ₫, which is the SELL-side fee of the later order, not the buy fee being asked for. Putting 0.1% into the rate slot gives 25,000 ₫, because 0.1% is the personal income tax, charged only on selling and levied on the sell price, with nothing to do with a buy order. The buy fee is always computed on the matched BUY order value, so only the quantity, the buy price and the commission rate belong in the formula; the ÷ 100 stays visible because it merely turns 0.3% into the ratio 0.003.',
    },
    giai: {
      tinh: { vi: 'Phí giao dịch mua', en: 'Buy-side brokerage fee' },
      thaySo: { vi: '1.000 × 25.000 × 0,3 ÷ 100', en: '1000 × 25000 × 0.3 ÷ 100' },
      ketQua: { vi: '75.000 ₫', en: '75000 ₫' },
    },
    source: {
      url: 'https://stockkisvn.vn/phi-va-thue-giao-dich-chung-khoan/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q440',
    formulaId: 'phi-luu-ky',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một nhà đầu tư để nguyên 2.000 cổ phiếu VNM trong tài khoản lưu ký suốt ba tháng 5, 6 và 7/2025, không mua bán gì thêm. Biểu phí của VSDC thu theo số cổ phiếu và theo tháng, không thu theo giá trị danh mục và cũng không thu theo ngày. Bảng số liệu dưới đây có cả số ngày nắm giữ lẫn giá trị lô cổ phiếu — hãy đặt đúng hai con số vào ô trống của công thức Phí lưu ký. Mức phí 0,27 ₫ mỗi cổ phiếu mỗi tháng đã in sẵn trong công thức, nên chú ý ô nào là khối lượng, ô nào là số tháng.',
      en: 'An investor leaves 2,000 VNM shares untouched in the custody account through May, June and July 2025, placing no further trades. The VSDC schedule charges by share count and by month, not on portfolio value and not by day. The table below holds both the day count and the value of the holding — put the right two numbers into the slots of the custody fee formula. The rate of 0.27 ₫ per share per month is already printed in the formula, so mind which slot is the quantity and which is the months.',
    },
    facts: [
      {
        label: {
          vi: 'Khối lượng cổ phiếu VNM trong tài khoản lưu ký',
          en: 'VNM shares in the custody account',
        },
        value: { vi: '2.000 CP', en: '2000 shares' },
      },
      {
        label: {
          vi: 'Số tháng cổ phiếu nằm trong tài khoản (tháng 5, 6 và 7/2025)',
          en: 'Months the shares sat in the account (May, June and July 2025)',
        },
        value: { vi: '3 tháng', en: '3 months' },
      },
      {
        label: { vi: 'Số ngày nắm giữ tương ứng', en: 'Matching number of days held' },
        value: { vi: '92 ngày', en: '92 days' },
      },
      {
        label: {
          vi: 'Giá trị lô cổ phiếu theo giá thị trường cuối kỳ',
          en: 'Market value of the holding at the end of the period',
        },
        value: { vi: '124.000.000 ₫', en: '124000000 ₫' },
      },
      {
        label: {
          vi: 'Mức phí lưu ký cổ phiếu theo biểu phí (đã in sẵn trong công thức)',
          en: 'Custody rate for shares from the schedule (already printed in the formula)',
        },
        value: { vi: '0,27 ₫/CP/tháng', en: '0.27 ₫/share/month' },
      },
    ],
    expected: 1620,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Phí lưu ký = [2.000] × [3] × 0,27',
      en: 'Custody fee = [2000] × [3] × 0.27',
    },
    explain: {
      vi: 'Phí lưu ký nhân ba thứ với nhau: khối lượng, số tháng nằm trong tài khoản và mức phí của biểu phí. Đặt 2.000 vào ô khối lượng và 3 vào ô số tháng thì ra 1.620 ₫ cho cả kỳ, tức đúng 540 ₫ mỗi tháng như ví dụ của nguồn: “Nhà đầu tư đang nắm giữ 2.000 cổ phiếu VNM trong suốt tháng 5/2025. Phí lưu ký = 2.000 × 0,27 = 540 đồng/tháng”. Bảng cố ý để thêm hai con số hợp lý mà sai chỗ. Đặt 92 ngày vào ô số tháng thì phí phồng lên hơn ba mươi lần, vì biểu phí tính theo tháng chứ không tính theo ngày. Đặt giá trị lô cổ phiếu 124.000.000 ₫ vào ô khối lượng thì còn lệch xa hơn nữa: phí lưu ký thu trên đầu cổ phiếu chứ không thu trên số tiền, nên cùng một khoản đầu tư mà mua cổ phiếu giá thấp thì số cổ phiếu nhiều hơn và phí phải trả cao hơn.',
      en: 'The custody fee multiplies three things: the quantity, the number of months the shares sat in the account, and the rate from the schedule. Putting 2,000 in the quantity slot and 3 in the months slot gives 1,620 ₫ for the whole period, which is exactly 540 ₫ a month, matching the source’s own example: “Nhà đầu tư đang nắm giữ 2.000 cổ phiếu VNM trong suốt tháng 5/2025. Phí lưu ký = 2.000 × 0,27 = 540 đồng/tháng” (2,000 VNM shares held through May 2025, custody fee 2,000 × 0.27 = 540 ₫ a month). The table deliberately carries two plausible figures that belong somewhere else. Putting the 92 days into the months slot inflates the fee more than thirtyfold, because the schedule charges by month and not by day. Putting the holding value of 124,000,000 ₫ into the quantity slot is further off still: the fee is charged per share and not on the money, so the same investment spread over cheaper shares means more shares and a larger fee.',
    },
    giai: {
      tinh: { vi: 'Phí lưu ký', en: 'Custody fee' },
      thaySo: { vi: '2.000 × 3 × 0,27', en: '2000 × 3 × 0.27' },
      ketQua: { vi: '1.620 ₫', en: '1620 ₫' },
    },
    source: {
      url: 'https://thuvienchungkhoan.vn/phi-luu-ky-chung-khoan/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q441',
    formulaId: 'roa',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một doanh nghiệp niêm yết vừa công bố báo cáo tài chính năm, bảng dưới lấy hai dòng từ báo cáo kết quả kinh doanh và hai dòng từ bảng cân đối kế toán cuối kỳ. ROA đo lợi nhuận trên TOÀN BỘ tài sản, gồm cả phần vốn tự có lẫn phần đi vay, nên mẫu số là tổng tài sản chứ không phải vốn chủ sở hữu, còn tử số là lợi nhuận sau thuế chứ không phải trước thuế. Hãy đặt đúng hai con số vào hai ô trống của công thức ROA, chú ý bảng đã cài sẵn một con số dành cho ROE và một con số dành cho lợi nhuận trước thuế.',
      en: 'A listed company has just published its annual financial statements; the table below takes two lines from the income statement and two lines from the period-end balance sheet. ROA measures profit against ALL assets, both equity-funded and debt-funded, so the denominator is total assets rather than equity, and the numerator is profit after tax rather than before tax. Put the right two figures into the two slots of the ROA formula, noting that the table deliberately holds one figure that belongs to ROE and one that is profit before tax.',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận sau thuế cả năm', en: 'Full-year net income after tax' },
        value: { vi: '1.200 tỷ ₫', en: 'VND 1200 billion' },
      },
      {
        label: { vi: 'Lợi nhuận trước thuế cả năm', en: 'Full-year profit before tax' },
        value: { vi: '1.500 tỷ ₫', en: 'VND 1500 billion' },
      },
      {
        label: {
          vi: 'Tổng tài sản trên bảng cân đối kế toán cuối kỳ',
          en: 'Total assets on the period-end balance sheet',
        },
        value: { vi: '15.000 tỷ ₫', en: 'VND 15000 billion' },
      },
      {
        label: { vi: 'Vốn chủ sở hữu cuối kỳ', en: "Period-end shareholders' equity" },
        value: { vi: '6.000 tỷ ₫', en: 'VND 6000 billion' },
      },
    ],
    expected: 8,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'ROA = [1.200] ÷ [15.000] × 100',
      en: 'ROA = [1200] ÷ [15000] × 100',
    },
    explain: {
      vi: '1.200 chia 15.000 rồi nhân 100 ra 8,0%: cứ 100 đồng tài sản thì doanh nghiệp tạo ra 8 đồng lãi ròng. Hai ô trống có hai cái bẫy cài sẵn trong bảng. Đặt vốn chủ sở hữu 6.000 tỷ ₫ xuống mẫu số sẽ ra 20%, nhưng đó là ROE, tức lãi tính trên riêng phần vốn tự có; nguồn viết rõ hai mẫu số khác nhau: “ROA = (Lợi nhuận sau thuế / Tổng tài sản) x 100%” còn “ROE = (Lợi nhuận sau thuế / Vốn chủ sở hữu) x 100%”. Khoảng cách giữa 8% và 20% chính là phần đòn bẩy nợ đóng góp, không phải phần doanh nghiệp làm ăn giỏi hơn. Đặt lợi nhuận trước thuế 1.500 tỷ ₫ lên tử số sẽ ra 10%, thổi phồng hiệu quả bằng đúng khoản thuế doanh nghiệp chưa nộp. Ô × 100 để nguyên vì nó chỉ đổi tỷ lệ ra phần trăm, không phải một con số lấy từ báo cáo.',
      en: '1,200 divided by 15,000 and multiplied by 100 gives 8.0%: every 100 dong of assets generates 8 dong of net profit. The two slots carry two traps planted in the table. Putting equity of VND 6,000 billion in the denominator gives 20%, but that is ROE, the return on the owner-funded part alone; the source spells out the two different denominators: “ROA = (Lợi nhuận sau thuế / Tổng tài sản) x 100%” and “ROE = (Lợi nhuận sau thuế / Vốn chủ sở hữu) x 100%”. The gap between 8% and 20% is exactly what debt leverage contributes, not evidence that the business runs better. Putting profit before tax of VND 1,500 billion in the numerator gives 10%, inflating the result by the corporate tax the company has not yet paid. The × 100 stays visible because it only converts the ratio to a percentage; it is not a figure taken from the statements.',
    },
    giai: {
      tinh: { vi: 'ROA — tỷ suất sinh lời trên tài sản', en: 'Return on assets' },
      thaySo: { vi: '1.200 ÷ 15.000 × 100', en: '1200 ÷ 15000 × 100' },
      ketQua: { vi: '8 %', en: '8 %' },
    },
    source: {
      url: 'https://master.masvn.com/en/kien-thuc-dau-tu-chung-khoan/chi-so-roa-roe-la-gi-va-y-nghia-trong-phan-tich-dau-tu-180',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q442',
    formulaId: 'roe',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Simplize tính ROE năm 2022 của cổ phiếu BCF (CTCP Thực phẩm Bích Chi) theo quy ước vốn chủ sở hữu bình quân: lợi nhuận sau thuế cả năm chia cho trung bình cộng của vốn chủ đầu kỳ và vốn chủ cuối kỳ, rồi nhân 100. Bảng số liệu còn có tổng tài sản cuối năm và lợi nhuận sau thuế của năm 2021. Hãy đặt đúng ba con số vào ô trống của công thức ROE, chú ý mẫu số lấy cả hai mốc vốn chủ chứ không chỉ mốc cuối kỳ, và mẫu số không phải tổng tài sản.',
      en: 'Simplize computes the 2022 ROE of BCF (Bich Chi Food JSC) using the average-equity convention: full-year net income after tax divided by the mean of beginning and ending equity, then multiplied by 100. The table also carries year-end total assets and 2021 net income after tax. Put the right three numbers into the slots of the ROE formula, noting that the denominator takes both equity dates, not only the ending one, and that the denominator is not total assets.',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận sau thuế năm 2022', en: 'Net income after tax, 2022' },
        value: { vi: '109,2 tỷ đồng', en: 'VND 109.2 billion' },
      },
      {
        label: { vi: 'Vốn chủ sở hữu đầu kỳ (31/12/2021)', en: 'Beginning equity (Dec 31, 2021)' },
        value: { vi: '302,71 tỷ đồng', en: 'VND 302.71 billion' },
      },
      {
        label: { vi: 'Vốn chủ sở hữu cuối kỳ (31/12/2022)', en: 'Ending equity (Dec 31, 2022)' },
        value: { vi: '340,06 tỷ đồng', en: 'VND 340.06 billion' },
      },
      {
        label: { vi: 'Tổng tài sản tại 31/12/2022', en: 'Total assets at Dec 31, 2022' },
        value: { vi: '453 tỷ đồng', en: 'VND 453 billion' },
      },
      {
        label: { vi: 'Lợi nhuận sau thuế năm 2021', en: 'Net income after tax, 2021' },
        value: { vi: '54 tỷ đồng', en: 'VND 54 billion' },
      },
    ],
    expected: 33.98,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'ROE = [109,2] ÷ (([302,71] + [340,06]) ÷ 2) × 100',
      en: 'ROE = [109.2] ÷ (([302.71] + [340.06]) ÷ 2) × 100',
    },
    explain: {
      vi: 'Simplize nêu thẳng quy ước: “Vốn chủ sở hữu bình quân = (Vốn chủ sở hữu đầu kỳ + Vốn chủ sở hữu cuối kỳ)/2”, nên mẫu số của BCF năm 2022 là (302,71 + 340,06) ÷ 2 = 321,385 tỷ đồng, và ROE ra khoảng 33,98%. Bảng số liệu cố ý để sẵn ba cái bẫy. Chỉ lấy vốn chủ cuối kỳ 340,06 tỷ đồng thì ROE tụt còn 32,11%, tức bỏ qua chuyện doanh nghiệp chỉ có đủ ngần ấy vốn vào cuối năm chứ không phải suốt cả năm. Đặt tổng tài sản 453 tỷ đồng vào mẫu số thì ra 24,11%, nhưng đó là ROA chứ không còn là ROE. Còn ghép lợi nhuận sau thuế 54 tỷ đồng của năm 2021 với vốn chủ bình quân của năm 2022 thì ra 16,80%, tức trộn hai kỳ khác nhau vào cùng một tỷ số. Hai hằng số ÷ 2 và × 100 để nguyên vì chúng thuộc về công thức, không phải số liệu của đề bài.',
      en: "Simplize states the convention outright: “Vốn chủ sở hữu bình quân = (Vốn chủ sở hữu đầu kỳ + Vốn chủ sở hữu cuối kỳ)/2” (average equity is the mean of beginning and ending equity), so BCF's 2022 denominator is (302.71 + 340.06) / 2 = VND 321.385 billion and ROE works out to about 33.98%. The table plants three traps. Using only the ending equity of VND 340.06 billion drops ROE to 32.11%, which ignores that the company held that much capital only at year-end rather than all year long. Putting total assets of VND 453 billion into the denominator gives 24.11%, but that is ROA, not ROE. Pairing 2021 net income of VND 54 billion with 2022 average equity gives 16.80%, mixing two different periods into one ratio. The ÷ 2 and the × 100 stay visible because they belong to the formula, not to the data of the question.",
    },
    giai: {
      tinh: { vi: 'ROE — tỷ suất sinh lời trên vốn chủ', en: 'Return on equity' },
      thaySo: {
        vi: '109,2 ÷ ((302,71 + 340,06) ÷ 2) × 100',
        en: '109.2 ÷ ((302.71 + 340.06) ÷ 2) × 100',
      },
      ketQua: { vi: '33,98 %', en: '33.98 %' },
    },
    source: {
      url: 'https://simplize.vn/learn/roe',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q443',
    formulaId: 'roi-rong',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Theo ví dụ của VFS: mua 1.000 cổ phiếu VCI giá 100.000 ₫, giữ một tháng rồi bán ở 105.000 ₫. Bảng dưới đã bóc sẵn từng khoản phí và thuế của cả vòng mua rồi bán. Mẫu số của ROI ròng là vốn thực bỏ ra, tức chỉ gồm những khoản tiền đã chi ra TRƯỚC lúc bán; phí giao dịch bán và thuế chuyển nhượng phát sinh lúc bán nên đã nằm trong lợi nhuận ròng ở tử số rồi. Đặt đúng năm con số vào ô trống của công thức ROI ròng, chú ý khoản phí nào vào mẫu số và khoản nào không, và tử số lấy lãi ròng chứ không lấy lãi gộp.',
      en: 'From the VFS worked example: buy 1,000 VCI shares at 100,000 ₫, hold for one month, then sell at 105,000 ₫. The table below already breaks out every fee and tax of the whole buy-then-sell round trip. The denominator of net ROI is the capital actually deployed, so it holds only the money paid out BEFORE the sale; the sell-side brokerage fee and the transfer tax arise at the sale and are already subtracted inside the net profit in the numerator. Put the right five figures into the slots of the net ROI formula, minding which fees belong in the denominator and which do not, and that the numerator takes net profit, not gross profit.',
    },
    facts: [
      {
        label: { vi: 'Khối lượng mua rồi bán', en: 'Quantity bought then sold' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      {
        label: { vi: 'Giá mua một cổ phiếu', en: 'Buy price per share' },
        value: { vi: '100.000 ₫', en: '100000 ₫' },
      },
      {
        label: { vi: 'Phí giao dịch mua (0,15%)', en: 'Buy-side brokerage fee (0.15%)' },
        value: { vi: '150.000 ₫', en: '150000 ₫' },
      },
      {
        label: {
          vi: 'Phí lưu ký 1 tháng (0,27 ₫/CP/tháng)',
          en: 'Custody fee for 1 month (0.27 ₫ per share per month)',
        },
        value: { vi: '270 ₫', en: '270 ₫' },
      },
      {
        label: { vi: 'Phí giao dịch bán (0,15%)', en: 'Sell-side brokerage fee (0.15%)' },
        value: { vi: '157.500 ₫', en: '157500 ₫' },
      },
      {
        label: { vi: 'Thuế chuyển nhượng khi bán (0,1%)', en: 'Transfer tax on the sale (0.1%)' },
        value: { vi: '105.000 ₫', en: '105000 ₫' },
      },
      {
        label: {
          vi: 'Lãi gộp chênh lệch giá, chưa trừ khoản nào',
          en: 'Gross price-difference profit, before any deduction',
        },
        value: { vi: '5.000.000 ₫', en: '5000000 ₫' },
      },
      {
        label: {
          vi: 'Lợi nhuận ròng sau toàn bộ phí và thuế',
          en: 'Net profit after every fee and tax',
        },
        value: { vi: '4.587.230 ₫', en: '4587230 ₫' },
      },
    ],
    expected: 4.58,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'ROI ròng = [4.587.230] ÷ ([1.000] × [100.000] + [150.000] + [270]) × 100',
      en: 'Net ROI = [4587230] ÷ ([1000] × [100000] + [150000] + [270]) × 100',
    },
    explain: {
      vi: 'Vốn thực bỏ ra là 100.000.000 ₫ tiền mua cộng 150.000 ₫ phí mua và 270 ₫ phí lưu ký, thành 100.150.270 ₫; lấy 4.587.230 ₫ lãi ròng chia cho số ấy rồi nhân 100 ra 4,58%. Bảng số liệu cố ý để sẵn ba con số dễ đặt nhầm. Phí giao dịch bán 157.500 ₫ và thuế chuyển nhượng 105.000 ₫ chỉ phát sinh lúc bán, đã bị trừ trong lãi ròng ở tử số, nên cộng thêm vào mẫu số là tính hai lần cùng một khoản. Lãi gộp 5.000.000 ₫ đặt vào tử số sẽ ra 4,99%, cao hơn thực tế hơn bốn phần mười điểm phần trăm chỉ vì bỏ quên toàn bộ chi phí. Còn nếu chia lãi ròng cho riêng 100.000.000 ₫ tiền mua thì ra 4,59%, cũng đẹp hơn thực tế, vì mẫu số quên mất hai khoản đã chi trước khi bán.',
      en: 'The capital actually deployed is 100,000,000 ₫ of purchase money plus the 150,000 ₫ buy fee and the 270 ₫ custody fee, for 100,150,270 ₫; dividing the 4,587,230 ₫ of net profit by that and multiplying by 100 gives 4.58%. The table deliberately holds three figures that are easy to misplace. The 157,500 ₫ sell-side fee and the 105,000 ₫ transfer tax arise only at the sale and are already subtracted inside the net profit in the numerator, so adding them to the denominator counts the same money twice. Putting the 5,000,000 ₫ gross profit in the numerator gives 4.99%, more than four tenths of a percentage point above reality, purely by forgetting every cost. And dividing net profit by the 100,000,000 ₫ of purchase money alone gives 4.59%, also flattering, because that denominator drops the two amounts already paid out before the sale.',
    },
    giai: {
      tinh: { vi: 'ROI ròng sau phí & thuế', en: 'Net ROI after fees and taxes' },
      thaySo: {
        vi: '4.587.230 ÷ (1.000 × 100.000 + 150.000 + 270) × 100',
        en: '4587230 ÷ (1000 × 100000 + 150000 + 270) × 100',
      },
      ketQua: { vi: '4,58 %', en: '4.58 %' },
    },
    source: {
      url: 'https://www.vfs.com.vn/chi-phi-giao-dich-chung-khoan',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q444',
    formulaId: 'roi',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Tháng 3/2023 một nhà đầu tư bỏ 500.000.000 ₫ mua cổ phiếu của một doanh nghiệp niêm yết và tới nay vẫn nắm giữ. Màn hình tài khoản hôm nay in mấy con số cạnh nhau: giá trị của riêng số cổ phiếu ấy, số dư tiền mặt chưa giải ngân, và tổng tài sản gộp cả hai. ROI chỉ so giá trị của chính khoản đã đầu tư với số vốn đã bỏ ra cho nó, không dính gì tới phần tiền còn nằm im trong tài khoản. Đặt đúng ba con số vào ô trống của công thức ROI, chú ý vốn bỏ ra xuất hiện hai lần: một lần ở tử số để lấy phần chênh lệch, một lần ở mẫu số để chia.',
      en: 'In March 2023 an investor put 500,000,000 ₫ into the shares of a listed company and still holds them. The account screen today prints several figures side by side: the value of those shares alone, the uninvested cash balance, and total assets combining the two. ROI compares only the value of the investment itself against the capital put into it, and has nothing to do with cash sitting idle in the account. Put the right three numbers into the slots of the ROI formula, noting that the capital invested appears twice: once in the numerator to take the difference, once in the denominator to divide by.',
    },
    facts: [
      {
        label: {
          vi: 'Vốn bỏ ra mua cổ phiếu (tháng 3/2023)',
          en: 'Capital invested in the shares (March 2023)',
        },
        value: { vi: '500.000.000 ₫', en: '500000000 ₫' },
      },
      {
        label: {
          vi: 'Giá trị riêng số cổ phiếu ấy hôm nay',
          en: 'Value of those shares alone today',
        },
        value: { vi: '550.000.000 ₫', en: '550000000 ₫' },
      },
      {
        label: { vi: 'Số dư tiền mặt chưa giải ngân', en: 'Uninvested cash balance' },
        value: { vi: '70.000.000 ₫', en: '70000000 ₫' },
      },
      {
        label: {
          vi: 'Tổng tài sản trên màn hình tài khoản',
          en: 'Total assets shown on the account screen',
        },
        value: { vi: '620.000.000 ₫', en: '620000000 ₫' },
      },
      {
        label: { vi: 'Thời gian đã nắm giữ', en: 'Holding period so far' },
        value: { vi: '3 năm 6 tháng', en: '3 years and 6 months' },
      },
    ],
    expected: 10,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'ROI = ([550.000.000] − [500.000.000]) ÷ [500.000.000] × 100',
      en: 'ROI = ([550000000] − [500000000]) ÷ [500000000] × 100',
    },
    explain: {
      vi: 'Lãi 50.000.000 ₫ trên 500.000.000 ₫ vốn bỏ ra cho đúng 10%: cứ 100 đồng vốn sinh thêm 10 đồng. Mẫu số của ROI luôn là số vốn đã bỏ ra cho chính khoản đầu tư ấy, nên con số 500.000.000 ₫ phải điền vào cả hai ô, một ô lấy chênh lệch và một ô làm mẫu. Bảng số liệu cố ý dựng hai cái bẫy lấy thẳng từ màn hình tài khoản. Bẫy thứ nhất là tổng tài sản 620.000.000 ₫, vốn đã gộp 70.000.000 ₫ tiền mặt chưa giải ngân: đặt nó vào ô giá trị hiện tại thì ra 24%, tức tính cả phần tiền chưa hề mua cổ phiếu nào. Bẫy thứ hai là thời gian nắm giữ 3 năm 6 tháng, một con số hợp lý nhưng không có ô nào để đặt, vì ROI không có chiều thời gian; muốn so với một khoản chỉ nắm sáu tháng thì phải dùng CAGR chứ không phải ROI. Nguồn ghi lại đúng phép tính này: “(550-500)/500 x 100% = 10%”.',
      en: 'A gain of 50,000,000 ₫ on 500,000,000 ₫ of capital gives exactly 10%: every 100 dong of capital earned 10 dong more. The denominator of ROI is always the capital put into that same investment, so 500,000,000 ₫ belongs in both slots, one taking the difference and one dividing. The table deliberately sets two traps taken straight from the account screen. The first is total assets of 620,000,000 ₫, which already includes 70,000,000 ₫ of uninvested cash: placing it in the current-value slot gives 24%, counting money that never bought a single share. The second is the holding period of 3 years and 6 months, a plausible figure with no slot at all, because ROI carries no sense of time; comparing against a position held only six months calls for CAGR, not ROI. The source records this very calculation: “(550-500)/500 x 100% = 10%”.',
    },
    giai: {
      tinh: { vi: 'ROI — tỷ suất lợi nhuận', en: 'Return on investment' },
      thaySo: {
        vi: '(550.000.000 − 500.000.000) ÷ 500.000.000 × 100',
        en: '(550000000 − 500000000) ÷ 500000000 × 100',
      },
      ketQua: { vi: '10 %', en: '10 %' },
    },
    source: {
      url: 'https://blog.slimcrm.vn/quan-tri/roi-la-gi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q445',
    formulaId: 'thanh-toan-hien-hanh',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một bài tập phân tích báo cáo tài chính cho bảng cân đối kế toán của một doanh nghiệp tại hai thời điểm, đơn vị tỷ đồng, kèm cả dòng hàng tồn kho. Hệ số thanh toán hiện hành lấy trọn tài sản ngắn hạn, không trừ hàng tồn kho ra, vì tồn kho vẫn là tài sản ngắn hạn; trừ ra là sang hệ số thanh toán nhanh, một công thức khác. Đặt đúng hai con số của ngày 31/12/2019 vào ô trống của công thức hệ số hiện hành, chú ý bảng còn có cả cột 31/12/2018 lẫn dòng hàng tồn kho.',
      en: "A financial statement analysis exercise gives a company's balance sheet at two dates, in billions of dong, including the inventory line. The current ratio takes the whole of current assets and does not subtract inventory, because inventory is still a current asset; subtracting it gives the quick ratio, a different formula. Put the two figures dated 31/12/2019 into the right slots of the current ratio formula, minding that the table also carries the 31/12/2018 column and the inventory line.",
    },
    facts: [
      {
        label: { vi: 'Tài sản ngắn hạn 31/12/2019', en: 'Current assets at 31/12/2019' },
        value: { vi: '110.620 tỷ đồng', en: 'VND 110620 billion' },
      },
      {
        label: { vi: 'Nợ ngắn hạn 31/12/2019', en: 'Current liabilities at 31/12/2019' },
        value: { vi: '46.900 tỷ đồng', en: 'VND 46900 billion' },
      },
      {
        label: { vi: 'Hàng tồn kho 31/12/2019', en: 'Inventory at 31/12/2019' },
        value: { vi: '23.120 tỷ đồng', en: 'VND 23120 billion' },
      },
      {
        label: { vi: 'Tài sản ngắn hạn 31/12/2018', en: 'Current assets at 31/12/2018' },
        value: { vi: '102.960 tỷ đồng', en: 'VND 102960 billion' },
      },
      {
        label: { vi: 'Nợ ngắn hạn 31/12/2018', en: 'Current liabilities at 31/12/2018' },
        value: { vi: '39.380 tỷ đồng', en: 'VND 39380 billion' },
      },
    ],
    expected: 2.36,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'Hệ số hiện hành = [110.620] ÷ [46.900]',
      en: 'Current ratio = [110620] ÷ [46900]',
    },
    explain: {
      vi: '110.620 chia cho 46.900 ra 2,36 lần: mỗi đồng nợ phải trả trong 12 tháng tới có 2,36 đồng tài sản ngắn hạn đứng sau. Bảng số liệu cố ý để hai cái bẫy. Bẫy thứ nhất là hàng tồn kho 23.120 tỷ đồng: trừ nó khỏi tử số trước khi chia sẽ ra 1,87 lần, nhưng đó là hệ số thanh toán nhanh, một công thức khác, vì hệ số hiện hành nhận cả tồn kho vào tử số. Bẫy thứ hai là cột 31/12/2018: lấy 102.960 chia 39.380 ra 2,61 lần, một con số đúng nhưng của thời điểm khác, và nó che mất việc thanh khoản đã lùi từ 2,61 xuống 2,36 trong năm 2019.',
      en: '110,620 divided by 46,900 gives 2.36x: every dong of debt falling due in the next 12 months is backed by 2.36 dong of current assets. The table deliberately holds two traps. The first is the inventory line of 23,120 billion dong: taking it out of the numerator before dividing gives 1.87x, but that is the quick ratio, a different formula, because the current ratio keeps inventory in the numerator. The second is the 31/12/2018 column: 102,960 divided by 39,380 gives 2.61x, a correct figure but for another date, and it hides the fact that liquidity slipped from 2.61 to 2.36 over 2019.',
    },
    giai: {
      tinh: { vi: 'Hệ số thanh toán hiện hành', en: 'Current ratio' },
      thaySo: { vi: '110.620 ÷ 46.900', en: '110620 ÷ 46900' },
      ketQua: { vi: '2,36 lần', en: '2.36 x' },
    },
    source: {
      url: 'https://taca.edu.vn/bai-tap-phan-tich-kha-nang-thanh-toan/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q446',
    formulaId: 'thanh-toan-nhanh',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bảng cân đối kế toán ngày 31/12/2022 của Công ty Cổ phần Đầu tư Thế Giới Di Động (MWG). Đây là nhà bán lẻ nên hàng tồn kho chiếm hơn một nửa tài sản ngắn hạn, đúng chỗ mà hệ số thanh toán nhanh muốn loại ra. Bảng số liệu cố ý để thêm tổng tài sản và số dư tiền mặt: tử số lấy tài sản ngắn hạn chứ không lấy tổng tài sản, và cũng không rút gọn về mỗi tiền mặt. Đặt đúng ba con số vào ô trống của công thức hệ số thanh toán nhanh, chú ý ô nào bị trừ ra khỏi tử số.',
      en: 'The balance sheet of Mobile World Investment Corporation (MWG) at 31 December 2022. This is a retailer, so inventory is more than half of current assets, exactly what the quick ratio wants to strip out. The table deliberately also carries total assets and the cash balance: the numerator takes current assets, not total assets, and it is not cut down to cash alone either. Put the right three numbers into the slots of the quick ratio formula, and mind which one is subtracted out of the numerator.',
    },
    facts: [
      {
        label: { vi: 'Tài sản ngắn hạn (31/12/2022)', en: 'Current assets (31 Dec 2022)' },
        value: { vi: '44.578 tỷ đồng', en: '44578 billion ₫' },
      },
      {
        label: { vi: 'Hàng tồn kho (31/12/2022)', en: 'Inventory (31 Dec 2022)' },
        value: { vi: '25.696 tỷ đồng', en: '25696 billion ₫' },
      },
      {
        label: { vi: 'Nợ ngắn hạn (31/12/2022)', en: 'Current liabilities (31 Dec 2022)' },
        value: { vi: '26.000 tỷ đồng', en: '26000 billion ₫' },
      },
      {
        label: { vi: 'Tổng tài sản (31/12/2022)', en: 'Total assets (31 Dec 2022)' },
        value: { vi: '55.834 tỷ đồng', en: '55834 billion ₫' },
      },
      {
        label: {
          vi: 'Tiền và các khoản tương đương tiền (31/12/2022)',
          en: 'Cash and cash equivalents (31 Dec 2022)',
        },
        value: { vi: '5.061 tỷ đồng', en: '5061 billion ₫' },
      },
    ],
    expected: 0.726,
    tolerance: { kind: 'tuyet-doi', value: 0.005 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'Hệ số nhanh = ([44.578] − [25.696]) ÷ [26.000]',
      en: 'Quick ratio = ([44578] − [25696]) ÷ [26000]',
    },
    explain: {
      vi: 'Tài sản ngắn hạn 44.578 tỷ trừ hàng tồn kho 25.696 tỷ còn 18.882 tỷ tài sản đổi ra tiền được nhanh, chia cho 26.000 tỷ nợ ngắn hạn ra khoảng 0,73 lần. Dưới 1 nghĩa là nếu hàng trong kho không bán kịp thì MWG chưa đủ tiền trả hết nợ đến hạn, điều bình thường với bán lẻ nhưng hệ số hiện hành giấu mất: cùng kỳ ấy 44.578 chia 26.000 ra 1,71 lần, và khoảng cách giữa 1,71 với 0,73 chính là phần thanh khoản đang nằm trong kho. Hai cái bẫy trong bảng đều là số thật của cùng doanh nghiệp, chỉ sai chỗ. Đặt tổng tài sản 55.834 tỷ vào tử số ra 1,16 lần, vẽ ra một doanh nghiệp an toàn không có thật, vì nhà xưởng và cửa hàng không dùng để trả nợ trong vài tháng tới được. Rút tử số về mỗi tiền mặt 5.061 tỷ thì ra 0,19 lần, khắt khe quá đà vì đã bỏ mất khoản phải thu và đầu tư tài chính ngắn hạn, những thứ cũng đổi ra tiền nhanh.',
      en: 'Current assets of 44,578 billion ₫ minus inventory of 25,696 billion ₫ leaves 18,882 billion ₫ of assets that can be turned into cash quickly; divided by 26,000 billion ₫ of current liabilities that is about 0.73x. Below 1 means that if the goods on the shelves do not sell in time, MWG does not have enough to cover everything falling due. That is normal for a retailer, but the current ratio hides it: for the same date, 44,578 divided by 26,000 is 1.71x, and the gap between 1.71 and 0.73 is precisely the liquidity sitting in the warehouse. Both traps in the table are real figures for the same company, just in the wrong place. Putting total assets of 55,834 billion ₫ in the numerator gives 1.16x and paints a safety that does not exist, because warehouses and stores cannot pay debts due in the next few months. Cutting the numerator down to the cash balance of 5,061 billion ₫ gives 0.19x, needlessly harsh, since it drops receivables and short-term investments, which also convert to cash quickly.',
    },
    giai: {
      tinh: { vi: 'Hệ số thanh toán nhanh', en: 'Quick ratio' },
      thaySo: { vi: '(44.578 − 25.696) ÷ 26.000', en: '(44578 − 25696) ÷ 26000' },
      ketQua: { vi: '0,726 lần', en: '0.726 x' },
    },
    source: {
      url: 'https://taichinhbenvung.com/phan-tich-danh-gia-chuyen-sau-tinh-hinh-tai-chinh-cong-ty-co-phan-dau-tu-the-gioi-di-dong-ma-co-phieu-mwg/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q447',
    formulaId: 'thue-chuyen-nhuong',
    format: 'dien-so',
    kind: 'dinh-che',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một nhà đầu tư mua 1.000 cổ phiếu ở giá 28.000 ₫, ít lâu sau cắt lỗ trọn lô này với giá khớp lệnh 25.000 ₫. Thuế chuyển nhượng chứng khoán thu 0,1% trên giá trị bán từng lần, thu cả khi giao dịch lỗ, và mức 0,1% đã để sẵn trong công thức. Bảng số liệu có cả giá mua lẫn giá bán — đặt đúng hai con số vào ô trống của công thức thuế chuyển nhượng; chú ý ô giá nhận giá bán chứ không phải giá mua, và khoản lỗ không đi vào công thức.',
      en: 'An investor buys 1,000 shares at 28,000 ₫, then cuts the whole lot at a matched sell price of 25,000 ₫. Securities transfer tax takes 0.1% of the sale value of each trade, collected even on a losing trade, and that 0.1% rate is already filled in. The table carries both the buy price and the sell price — put the right two numbers into the slots of the transfer tax formula; note that the price slot takes the sell price rather than the buy price, and that the loss never enters the formula.',
    },
    facts: [
      {
        label: { vi: 'Khối lượng cổ phiếu bán ra', en: 'Quantity of shares sold' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      {
        label: { vi: 'Giá khớp lệnh bán', en: 'Matched sell price' },
        value: { vi: '25.000 ₫', en: '25000 ₫' },
      },
      {
        label: { vi: 'Giá mua vào trước đó', en: 'Earlier buy price' },
        value: { vi: '28.000 ₫', en: '28000 ₫' },
      },
      {
        label: { vi: 'Khoản lỗ của giao dịch', en: 'Loss on the trade' },
        value: { vi: '3.000.000 ₫', en: '3000000 ₫' },
      },
    ],
    expected: 25000,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Thuế chuyển nhượng = [1.000] × [25.000] × 0,1 ÷ 100',
      en: 'Transfer tax = [1000] × [25000] × 0.1 ÷ 100',
    },
    explain: {
      vi: 'Căn cứ tính thuế là GIÁ TRỊ BÁN, nên ô khối lượng nhận 1.000 CP và ô giá nhận 25.000 ₫, tức giá khớp lệnh bán. 1.000 × 25.000 ra giá trị bán 25.000.000 ₫, lấy 0,1% của số đó còn 25.000 ₫, đúng như nguồn tính: “Nếu bạn thực hiện lệnh bán 1.000 cổ phiếu DSC với giá khớp lệnh là 25.000 VNĐ/cổ phiếu, tổng doanh thu nhận về sẽ là 25.000.000 VNĐ. Khi đó, số thuế TNCN bạn phải nộp là: 25.000.000 x 0,1% = 25.000 VNĐ.” Bẫy nằm ở dòng giá mua 28.000 ₫ trong bảng: đặt nó vào ô giá sẽ ra 28.000 ₫, cao hơn số phải nộp 3.000 ₫, vì đó là tiền bỏ ra chứ không phải tiền thu về. Dòng lỗ 3.000.000 ₫ cũng không có chỗ nào trong công thức: lô này lỗ mà vẫn nộp đủ thuế, vì thuế suất 0,1% đánh trên giá bán chứ không trên lãi.',
      en: 'The tax base is the SALE VALUE, so the quantity slot takes 1,000 shares and the price slot takes 25,000 ₫, the matched sell price. 1,000 × 25,000 gives a sale value of 25,000,000 ₫, and 0.1% of that leaves 25,000 ₫, exactly as the source computes it: “Nếu bạn thực hiện lệnh bán 1.000 cổ phiếu DSC với giá khớp lệnh là 25.000 VNĐ/cổ phiếu, tổng doanh thu nhận về sẽ là 25.000.000 VNĐ. Khi đó, số thuế TNCN bạn phải nộp là: 25.000.000 x 0,1% = 25.000 VNĐ.” The trap is the 28,000 ₫ buy price row: putting it in the price slot returns 28,000 ₫, which is 3,000 ₫ more than is owed, because that is money spent rather than money received. The 3,000,000 ₫ loss row has no place in the formula either: this lot lost money and still owes the full tax, because the 0.1% rate falls on the sale price, not on the gain.',
    },
    giai: {
      tinh: { vi: 'Thuế chuyển nhượng chứng khoán', en: 'Securities transfer tax' },
      thaySo: { vi: '1.000 × 25.000 × 0,1 ÷ 100', en: '1000 × 25000 × 0.1 ÷ 100' },
      ketQua: { vi: '25.000 ₫', en: '25000 ₫' },
    },
    source: {
      url: 'https://www.dsc.com.vn/kien-thuc/thue-chuyen-nhuong-chung-khoan-la-gi',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q448',
    formulaId: 'thue-co-tuc',
    format: 'dien-so',
    kind: 'dinh-che',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Vinamilk (VNM) trả nốt cổ tức tiền mặt năm 2025 theo tỷ lệ 18,5% trên mệnh giá, tức 1.850 đồng mỗi cổ phiếu, với ngày giao dịch không hưởng quyền 26/6/2026 — cổ phiếu mua đúng ngày ấy không còn được nhận đợt cổ tức này. Công ty chứng khoán khấu trừ thuế thu nhập cá nhân 5% ngay tại nguồn. Bảng số liệu cố ý có cả lô mua đúng ngày giao dịch không hưởng quyền lẫn con số 18,5%: hãy đặt đúng ba con số vào ô trống của công thức Thuế cổ tức tiền mặt, chú ý lô nào được cộng vào khối lượng và con số nào mới là cổ tức của một cổ phiếu.',
      en: 'Vinamilk (VNM) is paying the remaining 2025 cash dividend at 18.5% of par value, that is 1,850 dong per share, with an ex-dividend date of June 26, 2026, so shares bought on that very day no longer receive this payment. The brokerage withholds the 5% personal income tax at source. The table deliberately holds both the lot bought on the ex-dividend date and the 18.5% figure: put the right three numbers into the slots of the cash dividend tax formula, minding which lot is added to the quantity and which figure is the dividend per share.',
    },
    facts: [
      {
        label: { vi: 'Cổ phiếu VNM đang nắm giữ từ trước', en: 'VNM shares already held' },
        value: { vi: '1.500 CP', en: '1500 shares' },
      },
      {
        label: {
          vi: 'Mua thêm ngày 25/6/2026, trước ngày giao dịch không hưởng quyền',
          en: 'Bought on June 25, 2026, before the ex-dividend date',
        },
        value: { vi: '500 CP', en: '500 shares' },
      },
      {
        label: {
          vi: 'Mua thêm ngày 26/6/2026, đúng ngày giao dịch không hưởng quyền',
          en: 'Bought on June 26, 2026, on the ex-dividend date itself',
        },
        value: { vi: '800 CP', en: '800 shares' },
      },
      {
        label: {
          vi: 'Tỷ lệ cổ tức công bố, tính trên mệnh giá 10.000 ₫',
          en: 'Announced dividend rate, on the 10,000 ₫ par value',
        },
        value: { vi: '18,5%', en: '18.5%' },
      },
      {
        label: { vi: 'Cổ tức tiền mặt mỗi cổ phiếu', en: 'Cash dividend per share' },
        value: { vi: '1.850 ₫', en: '1850 ₫' },
      },
      {
        label: {
          vi: 'Thuế suất thuế thu nhập cá nhân với cổ tức tiền mặt',
          en: 'Personal income tax rate on cash dividends',
        },
        value: { vi: '5%', en: '5%' },
      },
    ],
    expected: 185000,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Thuế cổ tức = ([1.500] + [500]) × [1.850] × 5 ÷ 100',
      en: 'Dividend tax = ([1500] + [500]) × [1850] × 5 ÷ 100',
    },
    explain: {
      vi: 'Khối lượng đi vào công thức là số cổ phiếu có tên trong danh sách chốt quyền, tức 1.500 + 500 = 2.000 CP. Lô 800 CP mua đúng ngày giao dịch không hưởng quyền 26/6/2026 không được nhận đợt cổ tức này, cộng nhầm vào thì thuế vọt lên 259.000 ₫ thay vì 185.000 ₫. Cái bẫy thứ hai là con số 18,5%: thông báo viết “18,5% (1 cổ phiếu nhận được 1.850 đồng)”, nghĩa là 18,5% tính trên mệnh giá 10.000 ₫ chứ không phải cổ tức một cổ phiếu, nên đặt 18,5 vào ô cổ tức chỉ ra 1.850 ₫ tiền thuế, lệch một trăm lần. Đặt đúng thì tổng cổ tức công bố là 3.700.000 ₫, thuế khấu trừ tại nguồn 185.000 ₫, tiền thực về tài khoản 3.515.000 ₫.',
      en: 'The quantity that enters the formula is the number of shares on the record list, that is 1,500 + 500 = 2,000 shares. The 800-share lot bought on the ex-dividend date of June 26, 2026 does not receive this payment, and adding it by mistake pushes the tax to 259,000 ₫ instead of 185,000 ₫. The second trap is the 18.5% figure: the announcement reads “18,5% (1 cổ phiếu nhận được 1.850 đồng)”, meaning 18.5% of the 10,000 ₫ par value rather than the dividend per share, so putting 18.5 into the dividend slot yields a tax of only 1,850 ₫, off by a factor of a hundred. Placed correctly, the announced dividend is 3,700,000 ₫, the tax withheld at source is 185,000 ₫, and 3,515,000 ₫ reaches the account.',
    },
    giai: {
      tinh: { vi: 'Thuế cổ tức tiền mặt', en: 'Cash dividend tax' },
      thaySo: { vi: '(1.500 + 500) × 1.850 × 5 ÷ 100', en: '(1500 + 500) × 1850 × 5 ÷ 100' },
      ketQua: { vi: '185.000 ₫', en: '185000 ₫' },
    },
    source: {
      url: 'https://www.tinnhanhchungkhoan.vn/vnm-ngay-gdkhq-tra-co-tuc-con-lai-nam-2025-bang-tien-185-post392797.html',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q449',
    formulaId: 'ty-le-chi-tra-co-tuc',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Năm 2011, Vinamilk (VNM) đạt EPS 7.717 ₫ và trả cổ tức tiền mặt 4.000 ₫ cho mỗi cổ phiếu. Doanh nghiệp công bố mức này dưới tên gọi “cổ tức 40%”, vì ở Việt Nam tỷ lệ cổ tức luôn tính trên mệnh giá 10.000 ₫ chứ không tính trên lợi nhuận. Bảng số liệu có cả 40% lẫn mệnh giá: hãy đặt đúng hai con số vào ô trống của công thức hệ số chi trả cổ tức, chú ý tử số phải là số tiền cổ tức thật trên một cổ phiếu, không phải tỷ lệ doanh nghiệp công bố.',
      en: 'In 2011, Vinamilk (VNM) earned EPS of 7,717 ₫ and paid a cash dividend of 4,000 ₫ per share. The company announced that as a “40% dividend”, because in Vietnam a dividend rate is always quoted against the 10,000 ₫ par value, never against profit. The table holds both the 40% figure and the par value: put the right two numbers into the slots of the dividend payout ratio formula, and note that the numerator must be the actual cash amount per share, not the announced rate.',
    },
    facts: [
      {
        label: { vi: 'EPS năm 2011 của VNM', en: 'VNM earnings per share, 2011' },
        value: { vi: '7.717 ₫', en: '7717 ₫' },
      },
      {
        label: {
          vi: 'Cổ tức tiền mặt trả cho mỗi cổ phiếu năm 2011',
          en: 'Cash dividend paid per share in 2011',
        },
        value: { vi: '4.000 ₫', en: '4000 ₫' },
      },
      {
        label: {
          vi: 'Tỷ lệ cổ tức doanh nghiệp công bố, tính trên mệnh giá',
          en: 'Dividend rate announced by the company, quoted against par value',
        },
        value: { vi: '40%', en: '40%' },
      },
      {
        label: { vi: 'Mệnh giá một cổ phiếu niêm yết', en: 'Par value of one listed share' },
        value: { vi: '10.000 ₫', en: '10000 ₫' },
      },
    ],
    expected: 51.8336,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Hệ số chi trả = [4.000] ÷ [7.717] × 100',
      en: 'Payout ratio = [4000] ÷ [7717] × 100',
    },
    explain: {
      vi: 'Nguồn ghi: “Vào năm 2011, Công ty CP sữa Việt Nam Vinamilk (mã chứng khoán là VNM) có EPS là 7.717 vnđ, trong đó cổ tức chi trả cho mỗi cổ phiếu là 4.000 vnđ (40%)”. Tử số là 4.000 ₫ tiền mặt thật mỗi cổ phiếu, mẫu số là EPS 7.717 ₫, nhân 100 ra 51,8%: VNM đem hơn một nửa lợi nhuận đi trả cổ tức và giữ lại gần 48,2% để tái đầu tư. Cái bẫy nằm ở con số 40% trong bảng. Doanh nghiệp Việt Nam luôn công bố cổ tức theo mệnh giá 10.000 ₫ chứ không theo lợi nhuận, nên 40% chỉ nói VNM trả 4.000 ₫ trên một cổ phiếu, hoàn toàn không nói VNM dùng 40% lợi nhuận. Ai chép thẳng 40 vào tử số sẽ ra 0,5%, sai hơn một trăm lần; ai đọc luôn 40% thành hệ số chi trả thì hụt gần 12 điểm phần trăm so với con số thật.',
      en: 'The source reads: “Vào năm 2011, Công ty CP sữa Việt Nam Vinamilk (mã chứng khoán là VNM) có EPS là 7.717 vnđ, trong đó cổ tức chi trả cho mỗi cổ phiếu là 4.000 vnđ (40%)” — in 2011 Vinamilk earned EPS of 7,717 ₫ and paid a cash dividend of 4,000 ₫ per share, announced as 40%. The numerator is the real 4,000 ₫ of cash per share, the denominator is EPS of 7,717 ₫, and multiplying by 100 gives 51.8%: VNM handed out more than half its profit and retained about 48.2% to reinvest. The trap is the 40% figure in the table. Vietnamese companies always announce dividends against the 10,000 ₫ par value rather than against profit, so 40% only says VNM paid 4,000 ₫ per share and says nothing about the share of profit. Copying 40 into the numerator gives 0.5%, off by more than a hundredfold, while reading 40% as the payout ratio understates the real figure by almost 12 percentage points.',
    },
    giai: {
      tinh: { vi: 'Hệ số chi trả cổ tức', en: 'Dividend payout ratio' },
      thaySo: { vi: '4.000 ÷ 7.717 × 100', en: '4000 ÷ 7717 × 100' },
      ketQua: { vi: '51,83 %', en: '51.83 %' },
    },
    source: {
      url: 'https://taichinh24h.com.vn/co-tuc-la-gi/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q450',
    formulaId: 'ty-suat-co-tuc',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Ngày 20/8/2021, SZL công bố chi trả cổ tức bằng tiền tỷ lệ 30%. Theo quy ước của thị trường Việt Nam, tỷ lệ công bố ấy tính trên mệnh giá 10.000 ₫, nên mỗi cổ phiếu nhận 3.000 ₫ tiền mặt; thị giá SZL thời điểm đó khoảng 50.000 ₫. Tỷ suất cổ tức thì đo trên THỊ GIÁ, không đo trên mệnh giá. Bảng số liệu có đủ cả mệnh giá lẫn thị giá, hãy đặt đúng hai con số vào ô trống của công thức tỷ suất cổ tức, chú ý mẫu số lấy giá nào.',
      en: 'On August 20, 2021, SZL announced a cash dividend at a rate of 30%. By Vietnamese market convention that announced rate applies to the 10,000 ₫ par value, so each share receives 3,000 ₫ in cash; SZL traded around 50,000 ₫ at the time. Dividend yield, however, is measured against the MARKET price, not against par. The table holds both the par value and the market price, so put the right two numbers into the slots of the dividend yield formula, minding which price belongs in the denominator.',
    },
    facts: [
      {
        label: {
          vi: 'Tỷ lệ cổ tức tiền mặt SZL công bố 20/8/2021',
          en: 'Cash dividend rate SZL announced on 2021-08-20',
        },
        value: { vi: '30% mệnh giá', en: '30% of par' },
      },
      {
        label: { vi: 'Mệnh giá một cổ phiếu', en: 'Par value per share' },
        value: { vi: '10.000 ₫', en: '10000 ₫' },
      },
      {
        label: { vi: 'Cổ tức tiền mặt cả năm quy ra tiền', en: 'Annual cash dividend in đồng' },
        value: { vi: '3.000 ₫/CP', en: '3000 ₫/share' },
      },
      {
        label: { vi: 'Thị giá SZL thời điểm đó', en: 'SZL market price at the time' },
        value: { vi: '50.000 ₫', en: '50000 ₫' },
      },
    ],
    expected: 6,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Tỷ suất cổ tức = [3.000] ÷ [50.000] × 100',
      en: 'Dividend yield = [3000] ÷ [50000] × 100',
    },
    explain: {
      vi: "3.000 chia 50.000 rồi nhân 100 ra 6%: bỏ ra 50.000 ₫ mua một cổ phiếu SZL thì mỗi năm nhận lại 3.000 ₫ tiền mặt. Cái bẫy nằm ở dòng mệnh giá 10.000 ₫ trong bảng, vì đặt nó xuống mẫu số sẽ ra đúng 30%, tức là chép lại tỷ lệ cổ tức đã công bố chứ không phải tỷ suất. Hai con số ấy khác nhau chỉ vì mẫu số khác nhau, AzFin viết thẳng: “Tỷ lệ cổ tức chính là tính tỷ lệ trên 'Mệnh giá' – tức 10k/cp.” Mệnh giá là con số cố định ghi trên giấy tờ, còn tỷ suất cổ tức đo phần tiền nhà đầu tư thật sự bỏ ra, nên mẫu số phải là thị giá và nó đổi theo từng phiên. Nhân 100 là bước đổi ra phần trăm, không phải một số liệu, nên nó nằm sẵn trong công thức.",
      en: "3,000 divided by 50,000 and multiplied by 100 gives 6%: spending 50,000 ₫ on one SZL share returns 3,000 ₫ in cash each year. The trap is the 10,000 ₫ par value row in the table, because putting it in the denominator gives exactly 30%, which merely copies back the announced dividend rate instead of measuring a yield. The two figures differ only because the denominators differ. AzFin says it plainly: “Tỷ lệ cổ tức chính là tính tỷ lệ trên 'Mệnh giá' – tức 10k/cp.” (the announced dividend rate is computed on par value, i.e. 10,000 ₫ per share). Par value is a fixed number on paper, while dividend yield measures what the investor actually paid, so the denominator must be the market price and it moves with every session. The × 100 is the conversion to percent, not a data point, so it stays visible in the formula.",
    },
    giai: {
      tinh: { vi: 'Tỷ suất cổ tức', en: 'Dividend yield' },
      thaySo: { vi: '3.000 ÷ 50.000 × 100', en: '3000 ÷ 50000 × 100' },
      ketQua: { vi: '6 %', en: '6 %' },
    },
    source: {
      url: 'https://azfin.vn/cach-tinh-ty-le-va-ty-suat-co-tuc/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q451',
    formulaId: 'von-hoa-thi-truong',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một doanh nghiệp niêm yết đã phát hành 12 triệu cổ phiếu, trong đó tự mua lại 2 triệu làm cổ phiếu quỹ, nên chỉ còn 10 triệu cổ phiếu đang lưu hành. Mệnh giá mỗi cổ phiếu là 10.000 ₫, còn giá đóng cửa phiên gần nhất là 50.000 ₫. Theo quy ước, vốn hoá thị trường lấy giá thị trường nhân số cổ phiếu ĐANG LƯU HÀNH, chứ không lấy mệnh giá và không lấy số cổ phiếu đã phát hành. Bảng số liệu có đủ cả bốn con số, hãy đặt đúng hai con số vào ô trống của công thức Vốn hoá thị trường; chú ý hệ số ÷ 1.000 để sẵn là phần đổi đơn vị, vì ô Giá tính bằng ₫ còn ô Số cổ phiếu tính bằng triệu CP.',
      en: 'A listed company has issued 12 million shares, of which it bought back 2 million as treasury shares, leaving 10 million shares outstanding. The par value is 10,000 ₫ per share, while the latest closing price is 50,000 ₫. By convention, market capitalization multiplies the market price by the shares OUTSTANDING, not by par value and not by the issued share count. The table lists all four figures, so put the right two numbers into the slots of the market capitalization formula; note that the ÷ 1,000 already in place is the unit conversion, because the price slot is in ₫ while the share slot is in millions of shares.',
    },
    facts: [
      {
        label: {
          vi: 'Giá đóng cửa một cổ phiếu, phiên gần nhất',
          en: 'Closing price per share, latest session',
        },
        value: { vi: '50.000 ₫', en: '50000 ₫' },
      },
      {
        label: { vi: 'Số cổ phiếu đang lưu hành', en: 'Shares outstanding' },
        value: { vi: '10 triệu CP', en: '10 million shares' },
      },
      {
        label: {
          vi: 'Số cổ phiếu đã phát hành, gồm cả cổ phiếu quỹ',
          en: 'Shares issued, treasury shares included',
        },
        value: { vi: '12 triệu CP', en: '12 million shares' },
      },
      {
        label: { vi: 'Mệnh giá một cổ phiếu', en: 'Par value per share' },
        value: { vi: '10.000 ₫', en: '10000 ₫' },
      },
    ],
    expected: 500,
    tolerance: { kind: 'tuong-doi', value: 0.001 },
    unit: { vi: 'tỷ ₫', en: 'billion ₫' },
    worked: {
      vi: 'Vốn hoá = [50.000] × [10] ÷ 1.000',
      en: 'Market cap = [50000] × [10] ÷ 1000',
    },
    explain: {
      vi: 'Giá 50.000 ₫ nhân 10 triệu cổ phiếu đang lưu hành, chia 1.000 để đổi triệu ₫ ra tỷ ₫, được 500 tỷ ₫, đúng con số nguồn tính sẵn trong ví dụ của họ. Bảng số liệu cố ý cài hai cái bẫy. Bẫy thứ nhất là 12 triệu cổ phiếu đã phát hành: 2 triệu cổ phiếu quỹ doanh nghiệp đang tự giữ thì không còn lưu hành, không có quyền biểu quyết và không nhận cổ tức, nên đặt 12 vào ô số cổ phiếu sẽ ra 600 tỷ ₫, thổi vốn hoá lên 20% so với thực tế. Bẫy thứ hai là mệnh giá 10.000 ₫: đặt mệnh giá vào ô giá sẽ ra 100 tỷ ₫, và đó không phải vốn hoá mà là vốn điều lệ tính trên số cổ phiếu lưu hành, một con số cố định ghi trong giấy tờ chứ không đổi theo thị trường. Vốn hoá thị trường đo cái thị trường đang trả, nên ô giá chỉ nhận giá đóng cửa.',
      en: 'A price of 50,000 ₫ times 10 million shares outstanding, divided by 1,000 to turn million ₫ into billion ₫, gives 500 billion ₫, the same figure the source computes in its own example. The table plants two traps on purpose. The first is the 12 million issued shares: the 2 million treasury shares the company holds itself are no longer outstanding, carry no voting rights and receive no dividend, so putting 12 into the share slot yields 600 billion ₫ and inflates market cap by 20% above the truth. The second is the 10,000 ₫ par value: putting par value into the price slot yields 100 billion ₫, which is not market cap but charter capital measured on the outstanding shares, a fixed figure on paper that never moves with the market. Market capitalization measures what the market is paying today, so the price slot only ever takes the closing price.',
    },
    giai: {
      tinh: { vi: 'Vốn hoá thị trường', en: 'Market capitalization' },
      thaySo: { vi: '50.000 × 10 ÷ 1.000', en: '50000 × 10 ÷ 1000' },
      ketQua: { vi: '500 tỷ ₫', en: '500 billion ₫' },
    },
    source: {
      url: 'https://www.vfs.com.vn/gia-tri-von-hoa-thi-truong-la-gi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q452',
    formulaId: 'vong-quay-tong-tai-san',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một công ty có tổng tài sản đầu kỳ 300.900 $ và tổng tài sản cuối kỳ 300.400 $; trong kỳ công ty đạt doanh thu 554.000 $ và có chiết khấu bán hàng 24.000 $. Vòng quay tổng tài sản lấy doanh thu THUẦN ở tử số, tức doanh thu đã trừ các khoản giảm trừ, và lấy tổng tài sản BÌNH QUÂN ở mẫu số chứ không lấy riêng số cuối kỳ. Bảng số liệu còn một dòng không thuộc công thức này. Hãy đặt đúng bốn con số vào ô trống của công thức vòng quay tổng tài sản, chú ý ô nào trừ ra ở tử số và hai ô nào cộng vào trước khi chia đôi ở mẫu số.',
      en: 'A company has total assets of 300900 $ at the start of the period and 300400 $ at the end; during the period it books sales revenue of 554000 $ with sales discounts of 24000 $. Total asset turnover puts NET revenue in the numerator, meaning revenue after deductions, and AVERAGE total assets in the denominator rather than the closing figure alone. The table carries one more row that does not belong to this formula. Put the right four numbers into the slots of the total asset turnover formula, watching which one is subtracted in the numerator and which two are added before halving in the denominator.',
    },
    facts: [
      {
        label: {
          vi: 'Doanh thu bán hàng trong kỳ (chưa trừ các khoản giảm trừ)',
          en: 'Sales revenue for the period (before deductions)',
        },
        value: { vi: '554.000 $', en: '554000 $' },
      },
      {
        label: { vi: 'Chiết khấu bán hàng trong kỳ', en: 'Sales discounts for the period' },
        value: { vi: '24.000 $', en: '24000 $' },
      },
      {
        label: { vi: 'Tổng tài sản đầu kỳ', en: 'Total assets at the start of the period' },
        value: { vi: '300.900 $', en: '300900 $' },
      },
      {
        label: { vi: 'Tổng tài sản cuối kỳ', en: 'Total assets at the end of the period' },
        value: { vi: '300.400 $', en: '300400 $' },
      },
      {
        label: { vi: 'Lợi nhuận sau thuế trong kỳ', en: 'After-tax profit for the period' },
        value: { vi: '42.000 $', en: '42000 $' },
      },
    ],
    expected: 1.7628,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'vòng', en: 'x' },
    worked: {
      vi: 'Vòng quay tài sản = ([554.000] − [24.000]) ÷ (([300.900] + [300.400]) ÷ 2)',
      en: 'Asset turnover = ([554000] − [24000]) ÷ (([300900] + [300400]) ÷ 2)',
    },
    explain: {
      vi: 'Hai quy ước gộp vào một dòng. Tử số phải là doanh thu THUẦN, nên lấy 554.000 trừ chiết khấu bán hàng 24.000, còn 530.000 $. Mẫu số phải là tổng tài sản BÌNH QUÂN, nên cộng đầu kỳ 300.900 với cuối kỳ 300.400 rồi chia đôi, được 300.650 $. Chia ra 1,76 vòng, đúng như nguồn kết luận: “Kết quả kia cho biết cứ 1 đồng tài sản sẽ thu được 1.76 đồng doanh thu tương ứng”. Quên chiết khấu mà đặt thẳng 554.000 vào tử số thì ra 1,84 vòng, thổi hiệu suất lên gần 5%. Dòng lợi nhuận sau thuế 42.000 $ trong bảng không thuộc công thức này: đem nó chia cho tài sản là ra ROA khoảng 14%, một chỉ số khác hẳn. Riêng việc lấy thẳng tài sản cuối kỳ ở ví dụ này chỉ lệch sang 1,764 vòng vì đầu kỳ và cuối kỳ gần bằng nhau, nên cái bẫy ấy gần như không thấy được; năm nào doanh nghiệp tăng vốn hay mua sắm lớn thì khoảng lệch mới lộ ra, và đó chính là lý do quy ước bắt lấy số bình quân.',
      en: 'Two conventions folded into one line. The numerator must be NET revenue, so subtract the 24000 of sales discounts from 554000, leaving 530000 $. The denominator must be AVERAGE total assets, so add the opening 300900 to the closing 300400 and halve the sum, giving 300650 $. The division yields 1.76 turns, exactly what the source concludes: “Kết quả kia cho biết cứ 1 đồng tài sản sẽ thu được 1.76 đồng doanh thu tương ứng” (each unit of assets brings in 1.76 of revenue). Forgetting the discount and dropping 554000 straight into the numerator gives 1.84 turns, inflating efficiency by nearly 5%. The after-tax profit row of 42000 $ belongs to a different ratio: divided by assets it produces an ROA of about 14%. Taking closing assets alone shifts the answer only to 1.764 here, because opening and closing are nearly equal, so that trap is almost invisible; in a year with a capital raise or a large purchase the gap becomes obvious, which is why the convention insists on the average.',
    },
    giai: {
      tinh: { vi: 'Vòng quay tổng tài sản', en: 'Total asset turnover' },
      thaySo: {
        vi: '(554.000 − 24.000) ÷ ((300.900 + 300.400) ÷ 2)',
        en: '(554000 − 24000) ÷ ((300900 + 300400) ÷ 2)',
      },
      ketQua: { vi: '1,76 vòng', en: '1.76 x' },
    },
    source: {
      url: 'https://taca.com.vn/chi-so-vong-quay-tong-tai-san/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q453',
    formulaId: 'wacc',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bài hướng dẫn của MISA dựng một doanh nghiệp có giá trị thị trường vốn chủ sở hữu 600 triệu USD và giá trị thị trường nợ vay 400 triệu USD, nên tổng nguồn vốn V bằng 1.000 triệu USD — con số này đã điền sẵn ở cả hai mẫu số. Công thức dưới đây cũng để sẵn hệ số (1 − thuế suất ÷ 100) ở nhánh nợ, nên ô lãi suất của nhánh ấy phải nhận chi phí nợ TRƯỚC thuế, dù bảng số liệu có sẵn cả mức sau thuế. Đặt đúng năm con số vào ô trống của công thức WACC — chú ý con số nào lên tử số nhánh vốn chủ, con số nào lên tử số nhánh nợ, và lãi suất nào đi kèm lá chắn thuế.',
      en: 'A MISA tutorial builds a company whose equity has a market value of 600 million USD and whose debt has a market value of 400 million USD, so total capital V is 1,000 million USD — that figure is already filled in at both denominators. The formula below also comes with the (1 − tax rate ÷ 100) factor already in place on the debt leg, so that leg’s rate slot must take the PRE-tax cost of debt, even though the table also lists the after-tax figure. Put the five figures into the right slots of the WACC formula — mind which number goes on top of the equity leg, which goes on top of the debt leg, and which rate carries the tax shield.',
    },
    facts: [
      {
        label: {
          vi: 'Giá trị thị trường của vốn chủ sở hữu (E)',
          en: 'Market value of equity (E)',
        },
        value: { vi: '600 triệu USD', en: '600 million USD' },
      },
      {
        label: { vi: 'Giá trị thị trường của nợ vay (D)', en: 'Market value of debt (D)' },
        value: { vi: '400 triệu USD', en: '400 million USD' },
      },
      {
        label: { vi: 'Chi phí vốn chủ sở hữu (Re)', en: 'Cost of equity (Re)' },
        value: { vi: '12%', en: '12%' },
      },
      {
        label: { vi: 'Chi phí nợ vay trước thuế (Rd)', en: 'Pre-tax cost of debt (Rd)' },
        value: { vi: '6%', en: '6%' },
      },
      {
        label: {
          vi: 'Chi phí nợ vay sau thuế, nguồn đã tính sẵn',
          en: 'After-tax cost of debt, already worked out by the source',
        },
        value: { vi: '4,5%', en: '4.5%' },
      },
      {
        label: {
          vi: 'Thuế suất thuế thu nhập doanh nghiệp (T)',
          en: 'Corporate income tax rate (T)',
        },
        value: { vi: '25%', en: '25%' },
      },
    ],
    expected: 9,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'WACC = [600] ÷ 1.000 × [12] + [400] ÷ 1.000 × [6] × (1 − [25] ÷ 100)',
      en: 'WACC = [600] ÷ 1000 × [12] + [400] ÷ 1000 × [6] × (1 − [25] ÷ 100)',
    },
    explain: {
      vi: 'Hai nhánh của WACC chia chung một mẫu số là tổng nguồn vốn V = 600 + 400 = 1.000 triệu USD, nên tỷ trọng vốn chủ là 0,6 và tỷ trọng nợ là 0,4. Nhánh vốn chủ cho 0,6 × 12% = 7,2%; nhánh nợ cho 0,4 × 6% × (1 − 0,25) = 1,8%. Cộng lại đúng con số nguồn kết luận: “Chi phí vốn bình quân WACC của doanh nghiệp là 9%.” Bẫy nằm ở dòng 4,5% trong bảng: đó là “Chi phí nợ sau thuế”, chính nguồn đã nhân sẵn lá chắn thuế vào. Công thức trên màn đã có sẵn hệ số (1 − 25 ÷ 100), nên đặt 4,5 vào ô lãi suất là trừ thuế hai lần, kết quả tụt còn 8,55% và doanh nghiệp trông như huy động vốn rẻ hơn thực tế. Ô lãi suất ấy phải nhận “Chi phí nợ trước thuế” 6%. Bẫy thứ hai là đảo 12% với 6%: đặt ngược lại ra 7,2% chứ không phải 9%, vì vốn chủ chiếm tới 60% cơ cấu nên nó gánh phần lớn con số.',
      en: 'Both legs of WACC share one denominator, total capital V = 600 + 400 = 1,000 million USD, so the equity weight is 0.6 and the debt weight is 0.4. The equity leg gives 0.6 × 12% = 7.2%; the debt leg gives 0.4 × 6% × (1 − 0.25) = 1.8%. Together they match the source’s conclusion: “Chi phí vốn bình quân WACC của doanh nghiệp là 9%” (roughly, “the company’s weighted average cost of capital is 9%”). The trap is the 4.5% row in the table: that is the source’s own “Chi phí nợ sau thuế” (after-tax cost of debt), which already has the tax shield multiplied in. The formula on screen already carries the (1 − 25 ÷ 100) factor, so putting 4.5 into the rate slot deducts tax twice; the result drops to 8.55% and the company looks as if it raises capital more cheaply than it really does. That slot must take the pre-tax 6%. The second trap is swapping 12% and 6%: reversed, the answer comes out at 7.2% rather than 9%, because equity is 60% of the structure and therefore carries most of the figure.',
    },
    giai: {
      tinh: {
        vi: 'WACC — chi phí vốn bình quân gia quyền',
        en: 'Weighted average cost of capital',
      },
      thaySo: {
        vi: '600 ÷ 1.000 × 12 + 400 ÷ 1.000 × 6 × (1 − 25 ÷ 100)',
        en: '600 ÷ 1000 × 12 + 400 ÷ 1000 × 6 × (1 − 25 ÷ 100)',
      },
      ketQua: { vi: '9 %', en: '9 %' },
    },
    source: {
      url: 'https://www.meinvoice.vn/tin-tuc/33427/wacc-la-gi-huong-dan-chi-tiet-cach-tinh-va-y-nghia-trong-tai-chinh/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
];
