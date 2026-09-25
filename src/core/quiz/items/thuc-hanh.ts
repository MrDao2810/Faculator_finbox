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
      gan: [
        { kyHieu: 'P', giaTri: { vi: '36.000', en: '36000' } },
        { kyHieu: 'EPS', giaTri: { vi: '3.000', en: '3000' } },
      ],
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
      gan: [
        { kyHieu: 'V', giaTri: { vi: '42.500', en: '42500' } },
        { kyHieu: 'P', giaTri: { vi: '33.850', en: '33850' } },
      ],
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
      gan: [
        { kyHieu: '\\text{Doanh thu}', giaTri: { vi: '968,1', en: '968.1' } },
        { kyHieu: '\\text{Giá vốn}', giaTri: { vi: '837,8', en: '837.8' } },
      ],
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
      tinh: { vi: 'biên lợi nhuận ròng', en: 'Net profit margin' },
      thaySo: { vi: '143 ÷ 613 × 100', en: '143 ÷ 613 × 100' },
      ketQua: { vi: '23,33 %', en: '23.33 %' },
      gan: [
        { kyHieu: '\\text{LNST}', giaTri: { vi: '143', en: '143' } },
        { kyHieu: '\\text{Doanh thu thuần}', giaTri: { vi: '613 tỷ ₫', en: '613 billion ₫' } },
      ],
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
      tinh: { vi: 'giá trị sổ sách mỗi cổ phiếu', en: 'Book value per share' },
      thaySo: {
        vi: '(96.437 − 91) ÷ 5.814.785.700 × 10^9',
        en: '(96437 − 91) ÷ 5814785700 × 10^9',
      },
      ketQua: { vi: '16.569,14 ₫', en: '16569.14 ₫' },
      gan: [
        {
          kyHieu: '\\text{Vốn chủ sở hữu}',
          moTa: {
            vi: 'của cổ đông công ty mẹ: 96.437 trừ 91 phần không kiểm soát, đơn vị tỷ ₫',
            en: 'belonging to parent shareholders: 96437 minus 91 of non-controlling interest, in billions of ₫',
          },
        },
        { kyHieu: '\\text{Số CP lưu hành}', giaTri: { vi: '5.814.785.700', en: '5814785700' } },
      ],
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
      tinh: { vi: 'tăng trưởng kép hằng năm', en: 'Compound annual growth rate' },
      thaySo: {
        vi: '((900.000.000 ÷ 600.000.000)^(1 ÷ 3) − 1) × 100',
        en: '((900000000 ÷ 600000000)^(1 ÷ 3) − 1) × 100',
      },
      ketQua: { vi: '14,47 %/năm', en: '14.47 %/year' },
      gan: [
        { kyHieu: 'V_{cuoi}', giaTri: { vi: '900.000.000', en: '900000000' } },
        { kyHieu: 'V_{dau}', giaTri: { vi: '600.000.000', en: '600000000' } },
        { kyHieu: 't', giaTri: { vi: '3', en: '3' } },
      ],
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
      tinh: { vi: 'chi phí vốn chủ sở hữu', en: 'Capital asset pricing model' },
      thaySo: { vi: '3 + 1,1 × 2', en: '3 + 1.1 × 2' },
      ketQua: { vi: '5,2 %/năm', en: '5.2 %/year' },
      gan: [
        { kyHieu: 'r_f', giaTri: { vi: '3', en: '3' } },
        { kyHieu: '\\beta', giaTri: { vi: '1,1', en: '1.1' } },
        { kyHieu: 'ERP', giaTri: { vi: '2', en: '2' } },
      ],
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
      tinh: {
        vi: 'giá trị cổ phiếu theo DDM hai giai đoạn',
        en: 'stock value under the two-stage dividend discount model',
      },
      thaySo: {
        vi: '2.000 × (1 + 9 ÷ 100) ÷ (1 + 16 ÷ 100) + 2.000 × (1 + 9 ÷ 100)^2 ÷ (1 + 16 ÷ 100)^2 + 2.000 × (1 + 9 ÷ 100)^2 × (1 + 6 ÷ 100) ÷ ((16 − 6) ÷ 100 × (1 + 16 ÷ 100)^2)',
        en: '2000 × (1 + 9 ÷ 100) ÷ (1 + 16 ÷ 100) + 2000 × (1 + 9 ÷ 100)^2 ÷ (1 + 16 ÷ 100)^2 + 2000 × (1 + 9 ÷ 100)^2 × (1 + 6 ÷ 100) ÷ ((16 − 6) ÷ 100 × (1 + 16 ÷ 100)^2)',
      },
      ketQua: { vi: '22.363,79 ₫', en: '22363.79 ₫' },
      gan: [
        { kyHieu: 'D_0', giaTri: { vi: '2.000', en: '2000' } },
        { kyHieu: 'g_1', giaTri: { vi: '9', en: '9' } },
        { kyHieu: 'r', giaTri: { vi: '16', en: '16' } },
        { kyHieu: 'g_2', giaTri: { vi: '6', en: '6' } },
      ],
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
      gan: [
        {
          kyHieu: '\\text{LNST}',
          moTa: {
            vi: 'dành cho cổ phiếu phổ thông: 1.621 trừ 300 cổ tức ưu đãi, đơn vị tỷ ₫',
            en: 'attributable to common shares: 1621 minus 300 of preferred dividends, in billions of ₫',
          },
        },
        { kyHieu: '\\text{Số CP lưu hành}', giaTri: { vi: '559.166.666,7', en: '559166666.7' } },
      ],
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
      tinh: { vi: 'EV trên doanh thu', en: 'EV to sales ratio' },
      thaySo: { vi: '(175 + 20 + 30 − 12,5) ÷ 85', en: '(175 + 20 + 30 − 12.5) ÷ 85' },
      ketQua: { vi: '2,5 lần', en: '2.5 x' },
      gan: [
        {
          kyHieu: 'EV',
          moTa: {
            vi: 'bằng vốn hoá 175 cộng nợ vay 20 và 30, trừ tiền mặt 12,5, đơn vị triệu USD',
            en: 'is market cap 175 plus debt of 20 and 30, minus cash of 12.5, in millions of USD',
          },
        },
        {
          kyHieu: '\\text{Doanh thu}',
          moTa: {
            vi: 'là doanh thu thuần cả năm: 85 triệu USD',
            en: 'is full-year net revenue: 85 million USD',
          },
        },
      ],
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
      tinh: { vi: 'giá trị doanh nghiệp', en: 'Enterprise value' },
      thaySo: {
        vi: '86.774,72 + 10.904,34 + 1.477,83 − 6.440,18',
        en: '86774.72 + 10904.34 + 1477.83 − 6440.18',
      },
      ketQua: { vi: '92.716,71 tỷ ₫', en: '92716.71 billion ₫' },
      gan: [
        { kyHieu: '\\text{Vốn hoá}', giaTri: { vi: '86.774,72', en: '86774.72' } },
        {
          kyHieu: '\\text{Nợ vay}',
          moTa: {
            vi: 'gồm vay ngắn hạn 10.904,34 và vay dài hạn 1.477,83, đơn vị tỷ ₫',
            en: 'is short-term borrowing 10904.34 plus long-term borrowing 1477.83, in billions of ₫',
          },
        },
        { kyHieu: '\\text{Tiền mặt}', giaTri: { vi: '6.440,18', en: '6440.18' } },
      ],
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
      tinh: { vi: 'dòng tiền tự do của cổ đông', en: 'Free cash flow to equity' },
      thaySo: { vi: '11,8 − 3 × (1 − 21 ÷ 100) + 1', en: '11.8 − 3 × (1 − 21 ÷ 100) + 1' },
      ketQua: { vi: '10,43 triệu USD', en: '10.43 USD million' },
      gan: [
        {
          kyHieu: 'FCFF',
          moTa: {
            vi: 'là dòng tiền tự do của doanh nghiệp: 11,8 triệu USD',
            en: 'is free cash flow to the firm: 11.8 million USD',
          },
        },
        {
          kyHieu: 'I',
          moTa: {
            vi: 'là chi phí lãi vay, chưa trừ thuế: 3 triệu USD',
            en: 'is interest expense before tax: 3 million USD',
          },
        },
        { kyHieu: 't', giaTri: { vi: '21', en: '21' } },
        {
          kyHieu: '\\Delta B',
          moTa: {
            vi: 'là vay ròng mới trong kỳ: 1 triệu USD',
            en: 'is net new borrowing in the period: 1 million USD',
          },
        },
      ],
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
      tinh: { vi: 'dòng tiền tự do của doanh nghiệp', en: 'Free cash flow to firm' },
      thaySo: {
        vi: '250 × (100 − 30) ÷ 100 + 50 − 100 − 20',
        en: '250 × (100 − 30) ÷ 100 + 50 − 100 − 20',
      },
      ketQua: { vi: '105 triệu USD', en: '105 $ million' },
      gan: [
        {
          kyHieu: 'EBIT',
          moTa: {
            vi: 'là lợi nhuận trước lãi vay và thuế: 250 triệu USD',
            en: 'is earnings before interest and tax: 250 million USD',
          },
        },
        { kyHieu: 't', giaTri: { vi: '30', en: '30' } },
        {
          kyHieu: 'Dep',
          moTa: {
            vi: 'là khấu hao, cộng lại vì không phải chi tiền: 50 triệu USD',
            en: 'is depreciation, added back because no cash leaves: 50 million USD',
          },
        },
        {
          kyHieu: 'CapEx',
          moTa: {
            vi: 'là chi đầu tư tài sản cố định: 100 triệu USD',
            en: 'is capital expenditure: 100 million USD',
          },
        },
        {
          kyHieu: '\\Delta NWC',
          moTa: {
            vi: 'là phần tăng vốn lưu động ròng: 20 triệu USD',
            en: 'is the increase in net working capital: 20 million USD',
          },
        },
      ],
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
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{mua}', giaTri: { vi: '50.000', en: '50000' } },
        { kyHieu: 'F_{mua}', giaTri: { vi: '75.000', en: '75000' } },
        {
          kyHieu: 'F_{lk}',
          moTa: {
            vi: 'là phí lưu ký cả 3 tháng nắm giữ: 810 ₫',
            en: 'is the custody fee for the 3 months held: 810 ₫',
          },
        },
      ],
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
      gan: [
        { kyHieu: 'FV', giaTri: { vi: '500.000.000', en: '500000000' } },
        { kyHieu: 'r', giaTri: { vi: '8', en: '8' } },
        { kyHieu: 'n', giaTri: { vi: '5', en: '5' } },
      ],
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
      gan: [
        { kyHieu: 'FCFF', giaTri: { vi: '500', en: '500' } },
        {
          kyHieu: 'g',
          moTa: {
            vi: 'là tăng trưởng dài hạn 4%/năm, viết dạng thập phân 0,04',
            en: 'is long-run growth of 4% a year, written as the decimal 0.04',
          },
        },
        {
          kyHieu: 'WACC',
          moTa: {
            vi: 'là 12%/năm, viết dạng thập phân 0,12',
            en: 'is 12% a year, written as the decimal 0.12',
          },
        },
        { kyHieu: 'D_{\\text{ròng}}', giaTri: { vi: '800', en: '800' } },
        { kyHieu: '\\text{Số CP}', giaTri: { vi: '300', en: '300' } },
      ],
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
      gan: [
        { kyHieu: 'PV', giaTri: { vi: '100.000.000', en: '100000000' } },
        { kyHieu: 'r', giaTri: { vi: '10', en: '10' } },
        { kyHieu: 'n', giaTri: { vi: '5', en: '5' } },
      ],
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
      tinh: { vi: 'lợi suất kỳ nắm giữ', en: 'Holding period return' },
      thaySo: {
        vi: '(35.000 − 30.000 + 1.000) ÷ 30.000 × 100',
        en: '(35000 − 30000 + 1000) ÷ 30000 × 100',
      },
      ketQua: { vi: '20 %', en: '20 %' },
      gan: [
        { kyHieu: 'P_{cuoi}', giaTri: { vi: '35.000', en: '35000' } },
        { kyHieu: 'P_{dau}', giaTri: { vi: '30.000', en: '30000' } },
        { kyHieu: 'D', giaTri: { vi: '1.000', en: '1000' } },
      ],
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
      gan: [
        { kyHieu: 'r', giaTri: { vi: '12', en: '12' } },
        { kyHieu: 'm', giaTri: { vi: '4', en: '4' } },
      ],
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
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{ban}', giaTri: { vi: '105.000', en: '105000' } },
        { kyHieu: 'P_{mua}', giaTri: { vi: '100.000', en: '100000' } },
        {
          kyHieu: 'F_{mua}',
          moTa: {
            vi: 'bằng 0,15% của giá trị mua 100.000.000 ₫',
            en: 'is 0.15% of the 100000000 ₫ purchase value',
          },
        },
        {
          kyHieu: 'F_{ban}',
          moTa: {
            vi: 'bằng 0,15% của giá trị bán 105.000.000 ₫',
            en: 'is 0.15% of the 105000000 ₫ sale value',
          },
        },
        {
          kyHieu: 'T',
          moTa: {
            vi: 'bằng 0,1% của giá trị bán 105.000.000 ₫',
            en: 'is 0.1% of the 105000000 ₫ sale value',
          },
        },
        {
          kyHieu: 'F_{lk}',
          moTa: {
            vi: 'bằng 1.000 cổ phiếu nhân 1 tháng nhân 0,27 ₫',
            en: 'is 1000 shares times 1 month times 0.27 ₫',
          },
        },
      ],
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
      gan: [
        {
          kyHieu: 'r_{ky}',
          moTa: {
            vi: 'là lợi suất tháng gần nhất: 0,7%',
            en: 'is the latest monthly return: 0.7%',
          },
        },
        {
          kyHieu: 'm',
          moTa: {
            vi: 'là 12 kỳ, vì kỳ ở đây là tháng',
            en: 'is 12 periods, because a period here is a month',
          },
        },
      ],
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
      gan: [
        { kyHieu: 'r_{danh\\,nghia}', giaTri: { vi: '5,5', en: '5.5' } },
        { kyHieu: '\\pi', moTa: { vi: 'là lạm phát 4% một năm', en: 'is inflation of 4% a year' } },
      ],
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
      tinh: {
        vi: 'giá trị cổ phiếu theo mô hình Gordon',
        en: 'stock value under the Gordon growth model',
      },
      thaySo: { vi: '3.000 × (100 + 5) ÷ (10 − 5)', en: '3000 × (100 + 5) ÷ (10 − 5)' },
      ketQua: { vi: '63.000 ₫', en: '63000 ₫' },
      gan: [
        { kyHieu: 'D_0', giaTri: { vi: '3.000', en: '3000' } },
        { kyHieu: 'g', giaTri: { vi: '5', en: '5' } },
        { kyHieu: 'r', giaTri: { vi: '10', en: '10' } },
      ],
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
      tinh: { vi: 'hệ số nợ trên vốn chủ', en: 'Debt to equity ratio' },
      thaySo: { vi: '(94.186 + 32.493) ÷ 131.220', en: '(94186 + 32493) ÷ 131220' },
      ketQua: { vi: '0,9654 lần', en: '0.9654 x' },
      gan: [
        {
          kyHieu: '\\text{Tổng nợ phải trả}',
          moTa: {
            vi: 'gồm nợ ngắn hạn 94.186 và nợ dài hạn 32.493, đơn vị tỷ ₫',
            en: 'is short-term liabilities 94186 plus long-term liabilities 32493, in billions of ₫',
          },
        },
        {
          kyHieu: '\\text{Vốn chủ sở hữu}',
          giaTri: { vi: '131.220 tỷ ₫', en: '131220 billion ₫' },
        },
      ],
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
      tinh: { vi: 'hệ số giá trên giá trị sổ sách', en: 'Price to book ratio' },
      thaySo: { vi: '74.700 ÷ (32.816,52 ÷ 2,09)', en: '74700 ÷ (32816.52 ÷ 2.09)' },
      ketQua: { vi: '4,76 lần', en: '4.76 x' },
      gan: [
        { kyHieu: 'P', giaTri: { vi: '74.700', en: '74700' } },
        {
          kyHieu: 'BVPS',
          moTa: {
            vi: 'bằng vốn chủ 32.816,52 tỷ ₫ chia 2,09 tỷ cổ phiếu',
            en: 'is equity of 32816.52 billion ₫ divided by 2.09 billion shares',
          },
        },
      ],
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
      tinh: { vi: 'P/E trên tăng trưởng', en: 'Price/earnings to growth ratio' },
      thaySo: { vi: '(25.000 ÷ 3.000) ÷ 10', en: '(25000 ÷ 3000) ÷ 10' },
      ketQua: { vi: '0,8333 lần', en: '0.8333 x' },
      gan: [
        {
          kyHieu: 'P/E',
          moTa: {
            vi: 'bằng giá 25.000 ₫ chia EPS 3.000 ₫',
            en: 'is the 25000 ₫ price divided by the 3000 ₫ EPS',
          },
        },
        {
          kyHieu: 'g',
          moTa: {
            vi: 'là tăng trưởng EPS dự kiến 10% một năm, viết số 10',
            en: 'is expected EPS growth of 10% a year, written as 10',
          },
        },
      ],
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
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{ban}', giaTri: { vi: '90.000', en: '90000' } },
        { kyHieu: 'r_{ban}', giaTri: { vi: '0,15%', en: '0.15%' } },
      ],
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
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{mua}', giaTri: { vi: '25.000', en: '25000' } },
        { kyHieu: 'r_{mua}', giaTri: { vi: '0,3%', en: '0.3%' } },
      ],
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
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '2.000', en: '2000' } },
        { kyHieu: 'M', giaTri: { vi: '3', en: '3' } },
        { kyHieu: 'c', giaTri: { vi: '0,27', en: '0.27' } },
      ],
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
      tinh: { vi: 'tỷ suất sinh lời trên tài sản', en: 'Return on assets' },
      thaySo: { vi: '1.200 ÷ 15.000 × 100', en: '1200 ÷ 15000 × 100' },
      ketQua: { vi: '8 %', en: '8 %' },
      gan: [
        { kyHieu: '\\text{LNST}', giaTri: { vi: '1.200', en: '1200' } },
        { kyHieu: '\\text{Tổng tài sản}', giaTri: { vi: '15.000 tỷ ₫', en: '15000 billion ₫' } },
      ],
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
      tinh: { vi: 'tỷ suất sinh lời trên vốn chủ', en: 'Return on equity' },
      thaySo: {
        vi: '109,2 ÷ ((302,71 + 340,06) ÷ 2) × 100',
        en: '109.2 ÷ ((302.71 + 340.06) ÷ 2) × 100',
      },
      ketQua: { vi: '33,98 %', en: '33.98 %' },
      gan: [
        { kyHieu: '\\text{LNST}', giaTri: { vi: '109,2', en: '109.2' } },
        {
          kyHieu: '\\text{Vốn chủ sở hữu}',
          moTa: {
            vi: 'lấy bình quân đầu kỳ 302,71 và cuối kỳ 340,06, đơn vị tỷ ₫',
            en: 'is the average of 302.71 at the start and 340.06 at the end, in billions of ₫',
          },
        },
      ],
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
      gan: [
        {
          kyHieu: 'L_{rong}',
          moTa: {
            vi: 'là lợi nhuận ròng sau toàn bộ phí và thuế: 4.587.230 ₫',
            en: 'is the net profit after every fee and tax: 4587230 ₫',
          },
        },
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{mua}', giaTri: { vi: '100.000', en: '100000' } },
        { kyHieu: 'F_{mua}', giaTri: { vi: '150.000', en: '150000' } },
        {
          kyHieu: 'F_{lk}',
          moTa: { vi: 'là phí lưu ký 1 tháng: 270 ₫', en: 'is one month of custody fee: 270 ₫' },
        },
      ],
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
      tinh: { vi: 'tỷ suất lợi nhuận', en: 'Return on investment' },
      thaySo: {
        vi: '(550.000.000 − 500.000.000) ÷ 500.000.000 × 100',
        en: '(550000000 − 500000000) ÷ 500000000 × 100',
      },
      ketQua: { vi: '10 %', en: '10 %' },
      gan: [
        { kyHieu: 'V_{cuoi}', giaTri: { vi: '550.000.000', en: '550000000' } },
        { kyHieu: 'V_{dau}', giaTri: { vi: '500.000.000', en: '500000000' } },
      ],
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
      gan: [
        {
          kyHieu: '\\text{Tài sản ngắn hạn}',
          giaTri: { vi: '110.620 tỷ ₫', en: '110620 billion ₫' },
        },
        { kyHieu: '\\text{Nợ ngắn hạn}', giaTri: { vi: '46.900 tỷ ₫', en: '46900 billion ₫' } },
      ],
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
      gan: [
        {
          kyHieu: '\\text{Tài sản ngắn hạn}',
          giaTri: { vi: '44.578 tỷ ₫', en: '44578 billion ₫' },
        },
        { kyHieu: '\\text{Hàng tồn kho}', giaTri: { vi: '25.696 tỷ ₫', en: '25696 billion ₫' } },
        { kyHieu: '\\text{Nợ ngắn hạn}', giaTri: { vi: '26.000 tỷ ₫', en: '26000 billion ₫' } },
      ],
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
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{ban}', giaTri: { vi: '25.000', en: '25000' } },
        { kyHieu: 'r_{thue}', giaTri: { vi: '0,1%', en: '0.1%' } },
      ],
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
      gan: [
        {
          kyHieu: 'Q',
          moTa: {
            vi: 'gồm 1.500 cổ phiếu có từ trước và 500 cổ phiếu mua trước ngày giao dịch không hưởng quyền',
            en: 'is the 1500 shares already held plus the 500 bought before the ex-rights date',
          },
        },
        { kyHieu: 'D', giaTri: { vi: '1.850', en: '1850' } },
        { kyHieu: 'r_{ct}', giaTri: { vi: '5%', en: '5%' } },
      ],
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
      gan: [
        { kyHieu: 'DPS', giaTri: { vi: '4.000', en: '4000' } },
        { kyHieu: 'EPS', giaTri: { vi: '7.717', en: '7717' } },
      ],
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
      gan: [
        { kyHieu: 'D', giaTri: { vi: '3.000', en: '3000' } },
        { kyHieu: 'P', giaTri: { vi: '50.000', en: '50000' } },
      ],
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
      gan: [
        { kyHieu: 'P', giaTri: { vi: '50.000', en: '50000' } },
        { kyHieu: 'N', giaTri: { vi: '10', en: '10' } },
      ],
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
      gan: [
        {
          kyHieu: '\\text{Doanh thu thuần}',
          moTa: {
            vi: 'bằng doanh thu 554.000 trừ chiết khấu 24.000 USD',
            en: 'is sales of 554000 minus 24000 USD of discounts',
          },
        },
        {
          kyHieu: '\\text{Tổng tài sản}',
          moTa: {
            vi: 'lấy bình quân đầu kỳ 300.900 và cuối kỳ 300.400 USD',
            en: 'is the average of 300900 at the start and 300400 USD at the end',
          },
        },
      ],
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
        vi: 'chi phí vốn bình quân gia quyền',
        en: 'Weighted average cost of capital',
      },
      thaySo: {
        vi: '600 ÷ 1.000 × 12 + 400 ÷ 1.000 × 6 × (1 − 25 ÷ 100)',
        en: '600 ÷ 1000 × 12 + 400 ÷ 1000 × 6 × (1 − 25 ÷ 100)',
      },
      ketQua: { vi: '9 %', en: '9 %' },
      gan: [
        {
          kyHieu: 'E',
          moTa: {
            vi: 'là vốn chủ theo giá thị trường: 600 triệu USD',
            en: 'is equity at market value: 600 million USD',
          },
        },
        {
          kyHieu: 'D',
          moTa: {
            vi: 'là nợ vay theo giá thị trường: 400 triệu USD',
            en: 'is debt at market value: 400 million USD',
          },
        },
        {
          kyHieu: 'E+D',
          moTa: {
            vi: 'bằng 600 cộng 400, tức 1.000 triệu USD',
            en: 'is 600 plus 400, that is 1000 million USD',
          },
        },
        { kyHieu: 'r_e', giaTri: { vi: '12', en: '12' } },
        { kyHieu: 'r_d', giaTri: { vi: '6', en: '6' } },
        { kyHieu: 't', giaTri: { vi: '25', en: '25' } },
      ],
    },
    source: {
      url: 'https://www.meinvoice.vn/tin-tuc/33427/wacc-la-gi-huong-dan-chi-tiet-cach-tinh-va-y-nghia-trong-tai-chinh/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q454',
    formulaId: 'cvar-lich-su',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Lấy 60 giá đóng cửa gần nhất của VN-Index, từ 30/06 đến 24/09/2026, được 59 lợi suất phiên. Ở độ tin cậy 95%, phân vị 5% của chuỗi lợi suất ấy, tức ngưỡng VaR trước khi đổi dấu, là −0,0188. Bảng số liệu liệt kê năm phiên giảm mạnh nhất của cửa sổ theo thứ tự thời gian, lợi suất viết dạng thập phân đúng như chữ r trong công thức. CVaR chỉ lấy trung bình những phiên có lợi suất KHÔNG CAO HƠN ngưỡng, nên không phải cả năm phiên đều vào. Hãy đặt đúng ba lợi suất vào ô trống của công thức CVaR, theo thứ tự thời gian, sau khi so từng phiên với ngưỡng −0,0188: phiên nào cao hơn ngưỡng, dù chỉ một chút, thì nằm ngoài phần đuôi.',
      en: "Take the latest 60 VN-Index closes, from 2026-06-30 to 2026-09-24, which give 59 session returns. At 95% confidence, the 5th percentile of those returns, that is, the VaR threshold before its sign is flipped, is −0.0188. The table lists the window's five sharpest down sessions in date order, with returns written as decimals, exactly like the letter r in the formula. CVaR averages only the sessions whose return is NO HIGHER than the threshold, so not all five belong in it. Put the right three returns into the slots of the CVaR formula, in date order, after comparing each session with the −0.0188 threshold: a session above the threshold, even by a hair, stays out of the tail.",
    },
    facts: [
      {
        label: { vi: 'Cửa sổ quan sát', en: 'Observation window' },
        value: {
          vi: '60 giá đóng cửa VN-Index, từ 30/06 đến 24/09/2026, tức 59 lợi suất phiên',
          en: '60 VN-Index closes, 2026-06-30 to 2026-09-24, i.e. 59 session returns',
        },
      },
      {
        label: { vi: 'Độ tin cậy', en: 'Confidence level' },
        value: { vi: '95%', en: '95%' },
      },
      {
        label: {
          vi: 'Phân vị 5% của chuỗi lợi suất, tức ngưỡng VaR trước khi đổi dấu',
          en: '5th percentile of the returns, i.e. the VaR threshold before the sign flip',
        },
        value: { vi: '−0,0188 (tức −1,88%)', en: '−0.0188 (i.e. −1.88%)' },
      },
      {
        label: { vi: 'Lợi suất phiên 20/07/2026', en: 'Return on 2026-07-20' },
        value: { vi: '−0,0246 (tức −2,46%)', en: '−0.0246 (i.e. −2.46%)' },
      },
      {
        label: { vi: 'Lợi suất phiên 22/07/2026', en: 'Return on 2026-07-22' },
        value: { vi: '−0,0358 (tức −3,58%)', en: '−0.0358 (i.e. −3.58%)' },
      },
      {
        label: { vi: 'Lợi suất phiên 14/08/2026', en: 'Return on 2026-08-14' },
        value: { vi: '−0,0207 (tức −2,07%)', en: '−0.0207 (i.e. −2.07%)' },
      },
      {
        label: { vi: 'Lợi suất phiên 07/09/2026', en: 'Return on 2026-09-07' },
        value: { vi: '−0,0170 (tức −1,70%)', en: '−0.0170 (i.e. −1.70%)' },
      },
      {
        label: { vi: 'Lợi suất phiên 11/09/2026', en: 'Return on 2026-09-11' },
        value: { vi: '−0,0186 (tức −1,86%)', en: '−0.0186 (i.e. −1.86%)' },
      },
    ],
    expected: 2.7033,
    tolerance: { kind: 'tuyet-doi', value: 0.005 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'CVaR 95% = −([−0,0246] + [−0,0358] + [−0,0207]) ÷ 3 × 100',
      en: 'CVaR 95% = −([−0.0246] + [−0.0358] + [−0.0207]) ÷ 3 × 100',
    },
    explain: {
      vi: 'Ngưỡng là −0,0188, nên phần đuôi chỉ gồm những phiên có lợi suất không cao hơn −0,0188: 20/07 (−0,0246), 22/07 (−0,0358) và 14/08 (−0,0207). Phiên 11/09 có lợi suất −0,0186, sát ngưỡng nhưng vẫn cao hơn −0,0188 một chút nên nằm ngoài, phiên 07/09 (−0,0170) càng ở ngoài. Trung bình ba phiên là −0,0811 ÷ 3 = −0,0270; dấu trừ đứng trước đổi nó thành mức lỗ dương, nhân 100 ra 2,70%. Cái bẫy là lấy cả năm phiên giảm mạnh nhất: trung bình khi đó chỉ còn 2,33%, vì hai phiên nhẹ hơn ngưỡng kéo mức lỗ đuôi nông đi, tức là báo rủi ro thấp hơn thực tế. Số 3 đứng sẵn ở mẫu số là số phiên trong phần đuôi, không phải 59 lợi suất của cả cửa sổ. So với VaR 95% là 1,88%, CVaR 2,70% sâu hơn, đúng như định nghĩa: VaR nói cửa nằm ở đâu, CVaR nói phía sau cửa sâu tới đâu. Tính trên lợi suất chưa làm tròn thì ra 2,7042%, chênh nhau chỉ do làm tròn bốn chữ số thập phân.',
      en: 'The threshold is −0.0188, so the tail holds only the sessions whose return is no higher than −0.0188: 2026-07-20 (−0.0246), 2026-07-22 (−0.0358) and 2026-08-14 (−0.0207). The 2026-09-11 session returned −0.0186, close to the threshold but still slightly above −0.0188, so it stays out, and 2026-09-07 (−0.0170) is further out still. The average of the three is −0.0811 ÷ 3 = −0.0270; the minus sign in front turns it into a positive loss, and multiplying by 100 gives 2.70%. The trap is taking all five sharpest drops: the average then falls to 2.33%, because the two sessions milder than the threshold make the tail look shallower, which reports less risk than there is. The 3 already printed in the denominator is the number of sessions in the tail, not the 59 returns of the whole window. Against the 95% VaR of 1.88%, the CVaR of 2.70% runs deeper, exactly as defined: VaR says where the doorway is, CVaR says how far down it goes behind it. On unrounded returns the result is 2.7042%, the gap coming only from rounding to four decimals.',
    },
    giai: {
      tinh: {
        vi: 'Tổn thất kỳ vọng phần đuôi (CVaR 95%) của VN-Index trên 60 phiên',
        en: 'The 95% conditional VaR of the VN-Index over 60 sessions',
      },
      thaySo: {
        vi: '−(−0,0246 + −0,0358 + −0,0207) ÷ 3 × 100',
        en: '−(−0.0246 + −0.0358 + −0.0207) ÷ 3 × 100',
      },
      ketQua: { vi: '2,7 %', en: '2.7 %' },
      gan: [
        {
          kyHieu: '\\alpha',
          moTa: {
            vi: 'là độ tin cậy 95%, nên phần đuôi là 5% số phiên xấu nhất',
            en: 'is the 95% confidence level, so the tail is the worst 5% of sessions',
          },
        },
        {
          kyHieu: 'Q_{1-\\alpha}(r_N)',
          moTa: {
            vi: 'là ngưỡng lợi suất ở phân vị 5%: −0,0188',
            en: 'is the return threshold at the 5% percentile: −0.0188',
          },
        },
        {
          kyHieu: 'r',
          moTa: {
            vi: 'của 3 phiên thấp hơn ngưỡng ấy là −0,0246, −0,0358 và −0,0207',
            en: 'of the 3 sessions below that threshold is −0.0246, −0.0358 and −0.0207',
          },
        },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VNINDEX&StartDate=06/30/2026&EndDate=09/24/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q455',
    formulaId: 'dai-bollinger-duoi',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Theo lịch sử giá của Vingroup (VIC) trên CafeF, phiên 17/08/2026 cổ phiếu đóng cửa ở 198.000 ₫, phiên giảm thứ ba liên tiếp. Bạn dựng dải Bollinger dưới với chu kỳ 20 phiên và hệ số k = 2. Bảng số liệu có cả đường trung bình 10 phiên, giá thấp nhất của 20 phiên và giá đóng cửa của chính phiên ấy. Trang ấy chỉ ghi giá từng phiên, nên hai đường trung bình và độ lệch chuẩn trong bảng được tính lại từ những giá đóng cửa ấy. Hãy đặt đúng ba con số vào ô trống của công thức dải dưới, chú ý đường giữa phải là trung bình của đúng 20 phiên dùng để tính độ lệch chuẩn, và dải dưới không phải đáy thấp nhất của 20 phiên.',
      en: "According to the Vingroup (VIC) price history on CafeF, the stock closed at 198000 ₫ on 2026-08-17, its third straight down session. You build the lower Bollinger band with a 20-session period and multiplier k = 2. The table also holds the 10-session moving average, the lowest price of the 20 sessions and that day's own closing price. That page lists only each session's prices, so the averages and the standard deviation in the table were computed from those closes. Put the right three numbers into the slots of the lower band formula, noting that the middle line must average exactly the 20 sessions used for the standard deviation, and that the lower band is not the lowest low of the 20 sessions.",
    },
    facts: [
      {
        label: { vi: 'Giá đóng cửa VIC phiên 17/08/2026', en: 'VIC closing price on 2026-08-17' },
        value: { vi: '198.000 ₫', en: '198000 ₫' },
      },
      {
        label: {
          vi: 'Giá thấp nhất trong 20 phiên, từ 21/07 đến 17/08/2026',
          en: 'Lowest price over the 20 sessions, 2026-07-21 to 2026-08-17',
        },
        value: { vi: '194.600 ₫', en: '194600 ₫' },
      },
      {
        label: {
          vi: 'Trung bình giá đóng cửa 10 phiên, từ 04/08 đến 17/08/2026',
          en: 'Average close over 10 sessions, 2026-08-04 to 2026-08-17',
        },
        value: { vi: '211.060 ₫', en: '211060 ₫' },
      },
      {
        label: {
          vi: 'Trung bình giá đóng cửa 20 phiên, từ 21/07 đến 17/08/2026',
          en: 'Average close over the 20 sessions, 2026-07-21 to 2026-08-17',
        },
        value: { vi: '212.545 ₫', en: '212545 ₫' },
      },
      {
        label: {
          vi: 'Độ lệch chuẩn mẫu của 20 giá đóng cửa ấy',
          en: 'Sample standard deviation of those 20 closes',
        },
        value: { vi: '6.466 ₫', en: '6466 ₫' },
      },
      {
        label: { vi: 'Hệ số k, mặc định của Bollinger', en: 'Multiplier k, the Bollinger default' },
        value: { vi: '2', en: '2' },
      },
    ],
    expected: 199613,
    tolerance: { kind: 'tuong-doi', value: 0.001 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Dải dưới = [212.545] − [2] × [6.466]',
      en: 'Lower band = [212545] − [2] × [6466]',
    },
    explain: {
      vi: 'Đường giữa là trung bình 20 phiên 212.545 ₫, đặt vào ô đầu; phần bị trừ đi là hệ số k = 2 nhân độ lệch chuẩn mẫu của cùng 20 giá đóng cửa ấy, 6.466 ₫: 212.545 − 2 × 6.466 = 199.613 ₫. Giá đóng cửa 198.000 ₫ nằm dưới dải dưới 1.613 ₫, tức phiên 17/08 đã đóng cửa thủng dải. Bẫy thứ nhất là trung bình 10 phiên 211.060 ₫: ghép nó với độ lệch chuẩn 20 phiên ra 198.128 ₫, một dải lai của hai chu kỳ, và khoảng thủng dải co từ 1.613 ₫ xuống còn 128 ₫. Bẫy thứ hai là giá thấp nhất 20 phiên 194.600 ₫: đó là mép dưới của kênh Donchian, dựng từ đáy giá, còn dải Bollinger dựng từ trung bình và độ lệch chuẩn. Lấy giá đóng cửa làm tâm thì ra 185.068 ₫ và cú thủng dải biến mất hẳn. Sau phiên này VIC hồi lên 230.000 ₫ ngày 26/08, nhưng thủng dải dưới rồi rơi tiếp cũng là chuyện thường: dải chỉ đo độ phân tán của giá, không báo trước hướng đi.',
      en: 'The middle line is the 20-session average of 212545 ₫, placed in the first slot; what gets subtracted is the multiplier k = 2 times the sample standard deviation of those same 20 closes, 6466 ₫: 212545 − 2 × 6466 = 199613 ₫. The 198000 ₫ close sits 1613 ₫ below the lower band, so the 2026-08-17 session closed through the band. The first trap is the 10-session average of 211060 ₫: pairing it with the 20-session standard deviation gives 198128 ₫, a hybrid of two periods, and the break shrinks from 1613 ₫ to just 128 ₫. The second trap is the 20-session low of 194600 ₫: that is the bottom edge of a Donchian channel, built from price lows, while a Bollinger band is built from an average and a standard deviation. Centering the band on the closing price gives 185068 ₫ and the break disappears entirely. After this session VIC recovered to 230000 ₫ on 2026-08-26, but breaking below the lower band and then falling further is just as common: the band only measures how dispersed price is, it does not forecast direction.',
    },
    giai: {
      tinh: {
        vi: 'Dải Bollinger dưới của VIC phiên 17/08/2026',
        en: 'The lower Bollinger band of VIC on 2026-08-17',
      },
      thaySo: { vi: '212.545 − 2 × 6.466', en: '212545 − 2 × 6466' },
      ketQua: { vi: '199.613 ₫', en: '199613 ₫' },
      gan: [
        {
          kyHieu: 'SMA_{n}',
          moTa: {
            vi: 'là trung bình giá đóng cửa 20 phiên: 212.545 ₫',
            en: 'is the 20-session average close: 212545 ₫',
          },
        },
        { kyHieu: 'k', giaTri: { vi: '2', en: '2' } },
        {
          kyHieu: '\\sigma_{n}',
          moTa: {
            vi: 'là độ lệch chuẩn của 20 giá đóng cửa ấy: 6.466 ₫',
            en: 'is the standard deviation of those 20 closes: 6466 ₫',
          },
        },
        { kyHieu: 'n', giaTri: { vi: '20', en: '20' } },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VIC&StartDate=07/21/2026&EndDate=08/17/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q456',
    formulaId: 'dai-bollinger-tren',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Theo lịch sử giá của PV GAS (GAS) trên CafeF, phiên 15/09/2026 cổ phiếu tăng mạnh và đóng cửa ở 91.400 ₫. Bạn dựng dải Bollinger trên với chu kỳ 20 phiên và hệ số k = 2 để xem phiên ấy đã ra ngoài vùng dao động quen thuộc chưa. Bảng số liệu có cả giá đóng cửa, giá cao nhất của 20 phiên và độ lệch chuẩn của riêng 10 phiên gần nhất. Trang ấy chỉ ghi giá từng phiên, nên các trung bình và độ lệch chuẩn trong bảng được tính lại từ những giá đóng cửa ấy. Hãy đặt đúng ba con số vào ô trống của công thức dải trên, chú ý dải được dựng quanh đường trung bình chứ không quanh giá đóng cửa, và độ lệch chuẩn phải tính trên cùng 20 phiên với đường trung bình.',
      en: "According to the PV GAS (GAS) price history on CafeF, the stock rallied on 2026-09-15 and closed at 91400 ₫. You build the upper Bollinger band with a 20-session period and multiplier k = 2 to see whether that session left its usual trading range. The table also holds the closing price, the highest price of the 20 sessions and the standard deviation of just the latest 10 sessions. That page lists only each session's prices, so the averages and standard deviations in the table were computed from those closes. Put the right three numbers into the slots of the upper band formula, noting that the band is built around the moving average, not around the closing price, and that the standard deviation must cover the same 20 sessions as the average.",
    },
    facts: [
      {
        label: { vi: 'Giá đóng cửa GAS phiên 15/09/2026', en: 'GAS closing price on 2026-09-15' },
        value: { vi: '91.400 ₫', en: '91400 ₫' },
      },
      {
        label: {
          vi: 'Giá cao nhất trong 20 phiên, từ 14/08 đến 15/09/2026',
          en: 'Highest price over the 20 sessions, 2026-08-14 to 2026-09-15',
        },
        value: { vi: '91.500 ₫', en: '91500 ₫' },
      },
      {
        label: {
          vi: 'Trung bình giá đóng cửa 20 phiên, từ 14/08 đến 15/09/2026',
          en: 'Average close over the 20 sessions, 2026-08-14 to 2026-09-15',
        },
        value: { vi: '83.795 ₫', en: '83795 ₫' },
      },
      {
        label: {
          vi: 'Độ lệch chuẩn mẫu của 20 giá đóng cửa ấy',
          en: 'Sample standard deviation of those 20 closes',
        },
        value: { vi: '2.839 ₫', en: '2839 ₫' },
      },
      {
        label: {
          vi: 'Độ lệch chuẩn mẫu của 10 giá đóng cửa gần nhất, từ 28/08 đến 15/09/2026',
          en: 'Sample standard deviation of the latest 10 closes, 2026-08-28 to 2026-09-15',
        },
        value: { vi: '2.457 ₫', en: '2457 ₫' },
      },
      {
        label: { vi: 'Hệ số k, mặc định của Bollinger', en: 'Multiplier k, the Bollinger default' },
        value: { vi: '2', en: '2' },
      },
    ],
    expected: 89473,
    tolerance: { kind: 'tuong-doi', value: 0.001 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Dải trên = [83.795] + [2] × [2.839]',
      en: 'Upper band = [83795] + [2] × [2839]',
    },
    explain: {
      vi: 'Đường giữa của dải là trung bình 20 phiên 83.795 ₫, nên số này vào ô đầu; hệ số k = 2 nhân với độ lệch chuẩn mẫu của đúng 20 giá đóng cửa ấy, 2.839 ₫: 83.795 + 2 × 2.839 = 89.473 ₫. Giá đóng cửa 91.400 ₫ nằm trên dải trên 1.927 ₫, tức phiên 15/09 đã đóng cửa ra ngoài vùng dao động quen thuộc của 20 phiên. Bẫy thứ nhất là dựng dải quanh giá đóng cửa: 91.400 + 2 × 2.839 ra 97.078 ₫, và cú vượt dải biến mất chỉ vì đặt sai tâm. Bẫy thứ hai là độ lệch chuẩn 10 phiên 2.457 ₫: ghép nó với trung bình 20 phiên ra 88.709 ₫, một dải lai của hai chu kỳ chứ không phải dải của chu kỳ nào. Giá cao nhất 20 phiên 91.500 ₫ là cách dựng mép trên của kênh Donchian, không thuộc công thức này. Và vượt dải trên chỉ nói giá đang ở mép trên vùng dao động, tự nó không phải tín hiệu bán.',
      en: 'The middle line of the band is the 20-session average of 83795 ₫, so it goes into the first slot; the multiplier k = 2 then scales the sample standard deviation of exactly those 20 closes, 2839 ₫: 83795 + 2 × 2839 = 89473 ₫. The 91400 ₫ close sits 1927 ₫ above the upper band, so the 2026-09-15 session closed outside the usual 20-session trading range. The first trap is building the band around the closing price: 91400 + 2 × 2839 gives 97078 ₫, and the breakout vanishes purely because the center is wrong. The second trap is the 10-session standard deviation of 2457 ₫: pairing it with the 20-session average gives 88709 ₫, a hybrid of two periods rather than the band of either one. The 20-session high of 91500 ₫ is how the top edge of a Donchian channel is built, and it does not belong in this formula. And closing above the upper band only says price is at the top edge of its range; on its own it is not a sell signal.',
    },
    giai: {
      tinh: {
        vi: 'Dải Bollinger trên của GAS phiên 15/09/2026',
        en: 'The upper Bollinger band of GAS on 2026-09-15',
      },
      thaySo: { vi: '83.795 + 2 × 2.839', en: '83795 + 2 × 2839' },
      ketQua: { vi: '89.473 ₫', en: '89473 ₫' },
      gan: [
        {
          kyHieu: 'SMA_{n}',
          moTa: {
            vi: 'là trung bình giá đóng cửa 20 phiên: 83.795 ₫',
            en: 'is the 20-session average close: 83795 ₫',
          },
        },
        { kyHieu: 'k', giaTri: { vi: '2', en: '2' } },
        {
          kyHieu: '\\sigma_{n}',
          moTa: {
            vi: 'là độ lệch chuẩn của 20 giá đóng cửa ấy: 2.839 ₫',
            en: 'is the standard deviation of those 20 closes: 2839 ₫',
          },
        },
        { kyHieu: 'n', giaTri: { vi: '20', en: '20' } },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=GAS&StartDate=08/14/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q457',
    formulaId: 'do-lech-chuan-ban-phan',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Lấy 11 giá đóng cửa VN-Index từ 19/08 đến 07/09/2026 thì được một chuỗi lợi suất phiên, liệt kê đủ ở bảng dưới theo thứ tự thời gian. Ngưỡng để mặc định 0%, tức chỉ những phiên có lợi suất dưới 0% mới vào tổng bình phương, còn mẫu số vẫn tính theo toàn bộ cửa sổ. Hãy đặt đúng ba con số vào ô trống của công thức Độ lệch chuẩn bán phần, các lợi suất theo thứ tự thời gian. Chú ý ô ở mẫu số: bảng có ba con số đếm khác nhau, là số giá đóng cửa, số lợi suất và số phiên giảm, và chỉ một con số đúng là n của công thức.',
      en: "Taking 11 VN-Index closes from 2026-08-19 to 2026-09-07 gives a series of session returns, listed in full below in date order. The threshold is left at its default of 0%, so only sessions with a return below 0% enter the sum of squares, while the denominator still counts the whole window. Put the right three numbers into the slots of the downside deviation formula, with the returns in date order. Watch the denominator slot: the table holds three different counts, the number of closes, the number of returns and the number of down sessions, and only one of them is the formula's n.",
    },
    facts: [
      {
        label: { vi: 'Cửa sổ quan sát', en: 'Observation window' },
        value: {
          vi: '11 giá đóng cửa VN-Index, từ 19/08 đến 07/09/2026',
          en: '11 VN-Index closes, 2026-08-19 to 2026-09-07',
        },
      },
      {
        label: {
          vi: 'Lợi suất từng phiên, theo thứ tự thời gian từ 20/08 đến 07/09/2026',
          en: 'Return of each session, in date order from 2026-08-20 to 2026-09-07',
        },
        value: {
          vi: '+0,44%; +1,95%; +1,17%; +0,15%; +1,67%; +0,56%; +0,03%; −0,24%; +1,39%; −1,70%',
          en: '+0.44%; +1.95%; +1.17%; +0.15%; +1.67%; +0.56%; +0.03%; −0.24%; +1.39%; −1.70%',
        },
      },
      {
        label: {
          vi: 'Số lợi suất phiên của cửa sổ',
          en: 'Number of session returns in the window',
        },
        value: { vi: '10', en: '10' },
      },
      {
        label: { vi: 'Số phiên giảm trong cửa sổ', en: 'Number of down sessions in the window' },
        value: { vi: '2', en: '2' },
      },
      {
        label: { vi: 'Ngưỡng lợi suất mỗi phiên', en: 'Per-session return threshold' },
        value: { vi: '0%', en: '0%' },
      },
    ],
    expected: 0.5723,
    tolerance: { kind: 'tuyet-doi', value: 0.005 },
    unit: { vi: '%/phiên', en: '%/session' },
    worked: {
      vi: 'DD = √((([−0,24] − 0)^2 + ([−1,70] − 0)^2) ÷ ([10] − 1))',
      en: 'DD = √((([−0.24] − 0)^2 + ([−1.70] − 0)^2) ÷ ([10] − 1))',
    },
    explain: {
      vi: 'Chỉ hai phiên có lợi suất dưới ngưỡng 0%: 03/09 (−0,24%) và 07/09 (−1,70%). Phiên 28/08 chỉ tăng +0,03% nhưng vẫn không dưới ngưỡng nên không vào tổng. Tổng bình phương là (−0,24 − 0)² + (−1,70 − 0)² = 0,0576 + 2,89 = 2,9476. Mẫu số là n − 1 với n = 10, tổng số lợi suất của cả cửa sổ kể cả tám phiên tăng: 2,9476 ÷ 9 = 0,3275, căn bậc hai ra khoảng 0,57%/phiên. Bẫy thứ nhất là đặt số phiên giảm 2 vào ô n: mẫu số còn 1 và kết quả vọt lên 1,72%/phiên, gấp ba lần, đúng lỗi chia cho số phiên dưới ngưỡng mà trang này cảnh báo. Bẫy thứ hai là lấy 11 giá đóng cửa làm n, ra 0,54%/phiên: 11 giá chỉ cho 10 lợi suất, vì phiên đầu tiên không có phiên liền trước để so. Tính trên lợi suất chưa làm tròn thì ra 0,5712%/phiên, chênh nhau chỉ do làm tròn hai chữ số thập phân.',
      en: 'Only two sessions returned less than the 0% threshold: 2026-09-03 (−0.24%) and 2026-09-07 (−1.70%). The 2026-08-28 session rose just +0.03%, but that is still not below the threshold, so it stays out of the sum. The sum of squares is (−0.24 − 0)² + (−1.70 − 0)² = 0.0576 + 2.89 = 2.9476. The denominator is n − 1 with n = 10, the total number of returns in the window, the eight up sessions included: 2.9476 ÷ 9 = 0.3275, and its square root is about 0.57%/session. The first trap is putting the 2 down sessions into the n slot: the denominator shrinks to 1 and the result jumps to 1.72%/session, three times as high, which is exactly the divide-by-sessions-below-threshold error this page warns about. The second trap is using the 11 closes as n, which gives 0.54%/session: 11 closes yield only 10 returns, because the first session has no prior close to compare against. On unrounded returns the result is 0.5712%/session, the gap coming only from rounding to two decimals.',
    },
    giai: {
      tinh: {
        vi: 'Độ lệch chuẩn bán phần của VN-Index trong 10 phiên',
        en: 'The downside deviation of the VN-Index over 10 sessions',
      },
      thaySo: {
        vi: '√(((−0,24 − 0)^2 + (−1,70 − 0)^2) ÷ (10 − 1))',
        en: '√(((−0.24 − 0)^2 + (−1.70 − 0)^2) ÷ (10 − 1))',
      },
      ketQua: { vi: '0,5723 %/phiên', en: '0.5723 %/session' },
      gan: [
        {
          kyHieu: 'r_t',
          moTa: {
            vi: 'của 2 phiên giảm là −0,24% và −1,70%; các phiên tăng không vào tổng',
            en: 'of the 2 down sessions is −0.24% and −1.70%; the up sessions stay out of the sum',
          },
        },
        { kyHieu: 'B', giaTri: { vi: '0', en: '0' } },
        { kyHieu: 'n', giaTri: { vi: '10', en: '10' } },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VNINDEX&StartDate=08/19/2026&EndDate=09/07/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q458',
    formulaId: 'dong-luong-momentum',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bảng giá lịch sử của Hòa Phát (HPG) cho giá đóng cửa phiên thứ Năm 24/09/2026, phiên liền trước nó và vài phiên quanh mốc hai tuần trước. Bạn cần động lượng 10 phiên chốt phiên 24/09/2026. Từ 09/09 đến 24/09/2026 sàn mở cửa đủ mọi ngày từ thứ Hai đến thứ Sáu, không có ngày nghỉ lễ nào. Hãy đếm lùi 10 phiên rồi đặt hai con số vào ô trống của công thức động lượng; chú ý 10 phiên ở đây là lùi 10 bước tính từ phiên cuối, không phải 10 phiên gần nhất tính cả phiên cuối, động lượng dùng giá đóng cửa chứ không dùng giá mở cửa, và giá phiên cuối đứng trước dấu trừ.',
      en: 'The price history of Hoa Phat (HPG) gives the close of Thursday 2026-09-24, the session just before it and a few sessions around the two-weeks-earlier mark. You need the 10-session momentum as of the 2026-09-24 session. From 2026-09-09 to 2026-09-24 the exchange was open every Monday to Friday, with no holidays. Count back 10 sessions, then put the right two numbers into the slots of the momentum formula; note that 10 sessions here means stepping back 10 times from the last session, not the 10 most recent sessions counting the last one, that momentum uses the closing price rather than the opening price, and that the last session’s price comes before the minus sign.',
    },
    facts: [
      {
        label: {
          vi: 'Giá đóng cửa HPG phiên thứ Năm 24/09/2026, phiên cuối',
          en: 'HPG close, Thursday 2026-09-24, the last session',
        },
        value: { vi: '20.800 ₫', en: '20800 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên thứ Tư 23/09/2026', en: 'Close, Wednesday 2026-09-23' },
        value: { vi: '21.050 ₫', en: '21050 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên thứ Sáu 11/09/2026', en: 'Close, Friday 2026-09-11' },
        value: { vi: '21.300 ₫', en: '21300 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên thứ Năm 10/09/2026', en: 'Close, Thursday 2026-09-10' },
        value: { vi: '21.850 ₫', en: '21850 ₫' },
      },
      {
        label: { vi: 'Giá mở cửa phiên thứ Năm 10/09/2026', en: 'Open, Thursday 2026-09-10' },
        value: { vi: '22.000 ₫', en: '22000 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên thứ Tư 09/09/2026', en: 'Close, Wednesday 2026-09-09' },
        value: { vi: '22.050 ₫', en: '22050 ₫' },
      },
    ],
    expected: -1050,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Động lượng = [20.800] − [21.850]',
      en: 'Momentum = [20800] − [21850]',
    },
    explain: {
      vi: 'Đếm lùi từ phiên cuối 24/09: ba phiên 23, 22, 21/09 là 1 đến 3, năm phiên từ 18/09 về 14/09 là 4 đến 8, phiên 11/09 là 9 và phiên 10/09 là 10. Vậy giá cách đó 10 phiên là giá đóng cửa 21.850 ₫ của 10/09, và 20.800 − 21.850 ra −1.050 ₫: sau 10 phiên HPG thấp hơn 1.050 ₫, dấu âm cho biết đà đang đi xuống. Bẫy thứ nhất là hiểu 10 phiên là 10 phiên gần nhất tính cả phiên cuối, lấy nhầm 21.300 ₫ của 11/09, tức là tính động lượng 9 phiên, ra −500 ₫, chỉ còn chưa tới một nửa mức giảm thật. Bẫy thứ hai là lấy giá mở cửa 22.000 ₫ của 10/09, ra −1.200 ₫, trộn giá đầu phiên với giá cuối phiên. Đặt ngược thứ tự, lấy giá cũ trừ giá mới, thì ra +1.050 ₫ và đọc thành cổ phiếu đang có đà tăng trong khi giá thực tế đã giảm.',
      en: 'Count back from the last session on 2026-09-24: the three sessions of 2026-09-23, 22 and 21 are 1 to 3, the five sessions from 2026-09-18 back to 2026-09-14 are 4 to 8, 2026-09-11 is 9 and 2026-09-10 is 10. So the price 10 sessions back is the 21850 ₫ close of 2026-09-10, and 20800 − 21850 gives −1050 ₫: after 10 sessions HPG is 1050 ₫ lower, and the minus sign says the move is downward. The first trap is reading 10 sessions as the 10 most recent sessions including the last one, picking the 21300 ₫ close of 2026-09-11 by mistake, which is really a 9-session momentum of −500 ₫, less than half the real drop. The second trap is taking the 22000 ₫ opening price of 2026-09-10, giving −1200 ₫ by mixing a start-of-session price with an end-of-session one. Reversing the order, subtracting the new price from the old one, gives +1050 ₫ and reads as upward momentum when the price actually fell.',
    },
    giai: {
      tinh: {
        vi: 'Động lượng 10 phiên của HPG chốt phiên 24/09/2026',
        en: 'The 10-session momentum of HPG as of the 2026-09-24 session',
      },
      thaySo: { vi: '20.800 − 21.850', en: '20800 − 21850' },
      ketQua: { vi: '-1.050 ₫', en: '-1050 ₫' },
      gan: [
        { kyHieu: 'P_t', giaTri: { vi: '20.800', en: '20800' } },
        {
          kyHieu: 'P_{t-n}',
          moTa: {
            vi: 'là giá đóng cửa 10 phiên trước, ngày 10/09: 21.850 ₫',
            en: 'is the close 10 sessions earlier, on 10/09: 21850 ₫',
          },
        },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=HPG&StartDate=09/09/2026&EndDate=09/24/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q459',
    formulaId: 'giao-cat-hai-duong-ma',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Các đường trung bình ở bảng Số liệu được tính từ giá đóng cửa của Hòa Phát (HPG) trong lịch sử giá trên CafeF, tới phiên 07/08/2026; trang ấy chỉ ghi giá từng phiên, không ghi sẵn đường trung bình. Bạn theo dõi cặp 10 phiên và 20 phiên, cặp ngắn hạn quen dùng, nhưng bảng còn có cả đường 5 phiên lẫn giá đóng cửa của chính phiên ấy. Hãy đặt đúng hai con số vào ô trống của công thức chênh lệch giữa hai đường trung bình, chú ý đường ngắn đứng trước dấu trừ, đường dài đứng sau: đảo thứ tự là đọc ngược tín hiệu.',
      en: "The moving averages in the table were computed from the Hoa Phat Group (HPG) closing prices in the CafeF price history, up to the 2026-08-07 session; that page lists each session's prices, not the averages themselves. You follow the 10- and 20-session pair, the usual short-term pair, but the table also holds the 5-session line and that day's own closing price. Put the right two numbers into the slots of the moving-average gap formula, noting that the short line goes before the minus sign and the long line after it: swapping them reads the signal backwards.",
    },
    facts: [
      {
        label: { vi: 'Giá đóng cửa HPG phiên 07/08/2026', en: 'HPG closing price on 2026-08-07' },
        value: { vi: '22.000 ₫', en: '22000 ₫' },
      },
      {
        label: {
          vi: 'SMA 5 phiên, từ 03/08 đến 07/08/2026',
          en: '5-session SMA, 2026-08-03 to 2026-08-07',
        },
        value: { vi: '22.110 ₫', en: '22110 ₫' },
      },
      {
        label: {
          vi: 'SMA 10 phiên, từ 27/07 đến 07/08/2026',
          en: '10-session SMA, 2026-07-27 to 2026-08-07',
        },
        value: { vi: '21.705 ₫', en: '21705 ₫' },
      },
      {
        label: {
          vi: 'SMA 20 phiên, từ 13/07 đến 07/08/2026',
          en: '20-session SMA, 2026-07-13 to 2026-08-07',
        },
        value: { vi: '21.605 ₫', en: '21605 ₫' },
      },
    ],
    expected: 100,
    tolerance: { kind: 'tuong-doi', value: 0.001 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Chênh lệch = [21.705] − [21.605]',
      en: 'Difference = [21705] − [21605]',
    },
    explain: {
      vi: 'Cặp đang theo dõi là 10 và 20 phiên, nên đường ngắn là SMA 10 phiên 21.705 ₫, đặt trước dấu trừ, còn đường dài là SMA 20 phiên 21.605 ₫, đặt sau: 21.705 − 21.605 = 100 ₫. Hiệu dương nghĩa là đường ngắn đang nằm trên đường dài, và vì ở phiên 06/08/2026 hiệu này còn âm 67,5 ₫, phiên 07/08 chính là lúc đường 10 phiên vừa cắt lên. Bẫy thứ nhất là đảo thứ tự: 21.605 − 21.705 ra âm 100 ₫, đọc thành cắt xuống, ngược hẳn tín hiệu. Bẫy thứ hai là SMA 5 phiên 22.110 ₫: nó cũng là một đường ngắn nhưng thuộc cặp 5 và 20 phiên, cho hiệu 505 ₫ của một cặp khác. Giá đóng cửa 22.000 ₫ không phải đường trung bình nào; giá cắt đường trung bình là một tín hiệu khác. Hiệu 100 ₫ chưa tới 0,5% thị giá, tức hai đường gần như chồng lên nhau: tính tiếp trên cùng bảng giá, cặp này cắt xuống ngày 20/08, cắt lên ngày 04/09 rồi lại cắt xuống ngày 16/09, đúng cảnh hai đường quấn nhau khi giá đi ngang.',
      en: 'The pair being followed is 10 and 20 sessions, so the short line is the 10-session SMA of 21705 ₫, placed before the minus sign, and the long line is the 20-session SMA of 21605 ₫, placed after it: 21705 − 21605 = 100 ₫. A positive gap means the short line sits above the long one, and since the gap was still minus 67.5 ₫ on 2026-08-06, the 2026-08-07 session is exactly when the 10-session line crossed above. The first trap is swapping the order: 21605 − 21705 gives minus 100 ₫, which reads as a downward cross, the opposite signal. The second trap is the 5-session SMA of 22110 ₫: it is also a short line, but it belongs to the 5-and-20 pair and gives a 505 ₫ gap for a different pair. The 22000 ₫ closing price is not a moving average at all; price crossing a moving average is a different signal. A 100 ₫ gap is under 0.5% of the price, meaning the two lines almost overlap: computed further on the same price table, this pair crossed down on 2026-08-20, up on 2026-09-04 and down again on 2026-09-16, the textbook picture of two lines tangling while price moves sideways.',
    },
    giai: {
      tinh: {
        vi: 'Chênh lệch giữa đường SMA 10 phiên và đường SMA 20 phiên của HPG',
        en: 'The gap between the 10-session and the 20-session SMA of HPG',
      },
      thaySo: { vi: '21.705 − 21.605', en: '21705 − 21605' },
      ketQua: { vi: '100 ₫', en: '100 ₫' },
      gan: [
        {
          kyHieu: 'SMA_{ngan}',
          moTa: { vi: 'là SMA 10 phiên: 21.705 ₫', en: 'is the 10-session SMA: 21705 ₫' },
        },
        {
          kyHieu: 'SMA_{dai}',
          moTa: { vi: 'là SMA 20 phiên: 21.605 ₫', en: 'is the 20-session SMA: 21605 ₫' },
        },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=HPG&StartDate=07/13/2026&EndDate=08/07/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q460',
    formulaId: 'lai-lo-vi-the-long',
    format: 'dien-so',
    kind: 'hau-qua',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bản tin phái sinh ngày 22/09/2026 của Entrade ghi VN30F1M chốt phiên ở 1.949 điểm và dẫn hai kịch bản của HSC. Kịch bản Long: vào lệnh ở 1.955 khi giá vượt kháng cự, mục tiêu 1.975, cắt lỗ dưới 1.950. Một nhà đầu tư mở 3 hợp đồng Long theo đúng kịch bản ấy và muốn biết mình lãi lỗ bao nhiêu nếu giá chạy tới mục tiêu. Hãy đặt đúng ba con số vào ô trống của công thức lãi/lỗ vị thế Long; chú ý điểm mở là điểm vào lệnh của kịch bản chứ không phải giá chốt phiên 1.949, điểm đóng đứng trước dấu trừ, và bảng còn có các mốc của kịch bản Short không thuộc vị thế này.',
      en: "Entrade's derivatives bulletin of 2026-09-22 reports that VN30F1M closed the session at 1949 points and quotes two HSC scenarios. The Long scenario: enter at 1955 once price breaks resistance, target 1975, stop loss below 1950. An investor opens 3 Long contracts exactly on that scenario and wants to know the profit or loss if price reaches the target. Put the right three numbers into the slots of the long position P&L formula; note that the opening level is the scenario's entry point, not the 1949 session close, that the closing level comes before the minus sign, and that the table also carries Short scenario levels that do not belong to this position.",
    },
    facts: [
      {
        label: {
          vi: 'Giá chốt phiên VN30F1M ngày 22/09/2026',
          en: 'VN30F1M session close on 2026-09-22',
        },
        value: { vi: '1.949 điểm', en: '1949 points' },
      },
      {
        label: { vi: 'Kịch bản Long, điểm vào lệnh', en: 'Long scenario, entry point' },
        value: { vi: '1.955 điểm', en: '1955 points' },
      },
      {
        label: { vi: 'Kịch bản Long, mục tiêu', en: 'Long scenario, target' },
        value: { vi: '1.975 điểm', en: '1975 points' },
      },
      {
        label: { vi: 'Kịch bản Long, cắt lỗ', en: 'Long scenario, stop loss' },
        value: { vi: 'dưới 1.950 điểm', en: 'below 1950 points' },
      },
      {
        label: {
          vi: 'Kịch bản Short, điểm vào lệnh và mục tiêu',
          en: 'Short scenario, entry point and target',
        },
        value: { vi: '1.940 điểm và 1.915 điểm', en: '1940 points and 1915 points' },
      },
      {
        label: {
          vi: 'Số hợp đồng nhà đầu tư mở theo kịch bản Long',
          en: 'Contracts the investor opens on the Long scenario',
        },
        value: { vi: '3 HĐ', en: '3 contracts' },
      },
      {
        label: { vi: 'Hệ số nhân hợp đồng VN30F', en: 'VN30F contract multiplier' },
        value: { vi: '100.000 ₫ mỗi điểm', en: '100000 ₫ per point' },
      },
    ],
    expected: 6000000,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Lãi/lỗ Long = ([1.975] − [1.955]) × 100.000 × [3]',
      en: 'Long P&L = ([1975] − [1955]) × 100000 × [3]',
    },
    explain: {
      vi: 'Vị thế Long lãi khi điểm đóng cao hơn điểm mở, nên điểm đóng 1.975, tức mục tiêu của kịch bản, đứng trước dấu trừ; điểm mở 1.955, tức điểm vào lệnh, đứng sau; số hợp đồng 3 vào ô cuối. Hệ số nhân 100.000 ₫ mỗi điểm là quy cách của hợp đồng nên đã in sẵn: (1.975 − 1.955) × 100.000 × 3 ra 6.000.000 ₫. Bẫy thứ nhất là giá chốt phiên 1.949: kịch bản chỉ vào lệnh khi giá vượt 1.955, nên lấy 1.949 làm điểm mở sẽ ra 7.800.000 ₫, tính thêm 6 điểm mà vị thế chưa từng nắm. Bẫy thứ hai là đảo thứ tự: (1.955 − 1.975) biến khoản lãi 6.000.000 ₫ thành khoản lỗ cùng độ lớn. Hai mốc 1.940 và 1.915 thuộc kịch bản Short. Con số này cũng chưa trừ phí giao dịch và thuế.',
      en: "A long position profits when the closing level is above the opening level, so the closing level 1975, the scenario's target, comes before the minus sign; the opening level 1955, the entry point, comes after it; and the 3 contracts go into the last slot. The multiplier of 100000 ₫ per point is part of the contract specification, so it is already printed: (1975 − 1955) × 100000 × 3 gives 6000000 ₫. The first trap is the 1949 session close: the scenario only enters once price breaks 1955, so using 1949 as the opening level gives 7800000 ₫, counting 6 points the position never held. The second trap is reversing the order: (1955 − 1975) turns the 6000000 ₫ profit into a loss of the same size. The 1940 and 1915 levels belong to the Short scenario. This figure also has not deducted trading fees and taxes.",
    },
    giai: {
      tinh: {
        vi: 'Lãi/lỗ của 3 hợp đồng Long nếu kịch bản chạm mục tiêu',
        en: 'P&L of the 3 long contracts if the scenario hits its target',
      },
      thaySo: { vi: '(1.975 − 1.955) × 100.000 × 3', en: '(1975 − 1955) × 100000 × 3' },
      ketQua: { vi: '6.000.000 ₫', en: '6000000 ₫' },
      gan: [
        { kyHieu: 'P_{dong}', giaTri: { vi: '1.975', en: '1975' } },
        { kyHieu: 'P_{mo}', giaTri: { vi: '1.955', en: '1955' } },
        { kyHieu: 'm', giaTri: { vi: '100.000', en: '100000' } },
        { kyHieu: 'N', giaTri: { vi: '3', en: '3' } },
      ],
    },
    source: {
      url: 'https://blog.entrade.com.vn/ban-tin-phai-sinh-22-09-2026-vn30f1m-rut-chan-manh-1-940-1-960-quyet-dinh-long-hay-short/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q461',
    formulaId: 'macd-duong-chinh',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Thư viện thuật ngữ của UB Academy minh hoạ chỉ báo MACD bằng cổ phiếu VNM: cổ phiếu đang giao dịch quanh 85.000đ, EMA 12 phiên là 86.500 và EMA 26 phiên là 88.000. Cùng đoạn ấy còn nêu đường Signal, tức EMA 9 phiên tính trên chính chuỗi MACD, ở mức −1.200. Hãy đặt đúng hai con số vào ô trống của công thức đường MACD. Chú ý thứ tự phép trừ: phải biết trong hai đường EMA, đường nào là EMA chu kỳ nhanh, đường nào là EMA chu kỳ chậm; còn thị giá và đường Signal thì có nằm trong công thức này hay không.',
      en: "UB Academy's glossary illustrates the MACD indicator with VNM stock: the share trades around 85000 ₫, the 12-session EMA is 86500 and the 26-session EMA is 88000. The same passage also gives the Signal line, the 9-session EMA taken on the MACD series itself, at −1200. Put the right two numbers into the slots of the MACD line formula. Mind the order of the subtraction: you need to know which of the two EMAs is the fast-period EMA and which is the slow-period EMA, and whether the share price and the Signal line belong in this formula at all.",
    },
    facts: [
      {
        label: { vi: 'Thị giá VNM trong ví dụ', en: 'VNM share price in the example' },
        value: { vi: 'quanh 85.000 ₫', en: 'around 85000 ₫' },
      },
      {
        label: { vi: 'EMA 12 phiên', en: '12-session EMA' },
        value: { vi: '86.500 ₫', en: '86500 ₫' },
      },
      {
        label: { vi: 'EMA 26 phiên', en: '26-session EMA' },
        value: { vi: '88.000 ₫', en: '88000 ₫' },
      },
      {
        label: {
          vi: 'Đường Signal, EMA 9 phiên của chuỗi MACD',
          en: 'Signal line, the 9-session EMA of the MACD series',
        },
        value: { vi: '−1.200 ₫', en: '−1200 ₫' },
      },
    ],
    expected: -1500,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'MACD = [86.500] − [88.000]',
      en: 'MACD = [86500] − [88000]',
    },
    explain: {
      vi: 'Đường nhanh là EMA có chu kỳ ngắn hơn, ở đây 12 phiên, nên 86.500 đứng trước dấu trừ; EMA 26 phiên ở 88.000 là đường chậm, đứng sau. MACD = 86.500 − 88.000 = −1.500 ₫, đúng con số nguồn ghi: “EMA12 = 86.500 và EMA26 = 88.000 nên MACD = -1.500”. Giá trị âm nghĩa là đường nhanh đang nằm dưới đường chậm, đà giảm vẫn chiếm ưu thế. Đảo hai ô sẽ ra +1.500 ₫ và lật hẳn cách đọc sang đà tăng, dù không con số nào thay đổi. Thị giá 85.000 ₫ không có mặt trong công thức: lấy nó trừ EMA 26 phiên ra −3.000 ₫, là khoảng cách giữa giá và đường trung bình, một đại lượng khác. Đường Signal −1.200 ₫ cũng không vào ô nào: nó là EMA 9 phiên tính trên chính chuỗi MACD để so với MACD, và hiệu MACD trừ Signal, ở đây −300 ₫, là Histogram. Nguồn chỉ gợi ý cân nhắc mở vị thế mua khi đường MACD vượt lên đường Signal và Histogram chuyển từ âm sang dương, mà lúc này −1.500 vẫn nằm dưới −1.200.',
      en: 'The fast line is the EMA with the shorter period, here 12 sessions, so 86500 goes before the minus sign; the 26-session EMA at 88000 is the slow line and goes after it. MACD = 86500 − 88000 = −1500 ₫, the figure the source gives: “EMA12 = 86.500 và EMA26 = 88.000 nên MACD = -1.500” (EMA12 = 86500 and EMA26 = 88000, so MACD = −1500). A negative value means the fast line sits below the slow line, so downward momentum still has the upper hand. Swapping the two slots gives +1500 ₫ and flips the reading to upward momentum, even though no number changed. The 85000 ₫ share price is not in the formula: subtracting the 26-session EMA from it gives −3000 ₫, the distance between price and a moving average, which is a different quantity. The −1200 ₫ Signal line fills no slot either: it is the 9-session EMA taken on the MACD series itself, used as a yardstick for MACD, and MACD minus Signal, here −300 ₫, is the Histogram. The source only suggests considering a long position once the MACD line crosses above the Signal line and the Histogram turns from negative to positive, and at this point −1500 is still below −1200.',
    },
    giai: {
      tinh: { vi: 'Đường MACD của VNM trong ví dụ', en: "VNM's MACD line in the example" },
      thaySo: { vi: '86.500 − 88.000', en: '86500 − 88000' },
      ketQua: { vi: '-1.500 ₫', en: '-1500 ₫' },
      gan: [
        {
          kyHieu: 'EMA_{nhanh}',
          moTa: { vi: 'là EMA 12 phiên: 86.500 ₫', en: 'is the 12-session EMA: 86500 ₫' },
        },
        {
          kyHieu: 'EMA_{cham}',
          moTa: { vi: 'là EMA 26 phiên: 88.000 ₫', en: 'is the 26-session EMA: 88000 ₫' },
        },
      ],
    },
    source: {
      url: 'https://ub.edu.vn/thu-vien-thuat-ngu/chi-bao-macd',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q462',
    formulaId: 'roc-toc-do-thay-doi',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bảng giá lịch sử của Vinamilk (VNM) cho giá đóng cửa bảy phiên liền nhau, từ phiên thứ Hai 24/08 đến phiên thứ Sáu 04/09/2026. Bạn cần ROC 5 phiên chốt phiên 04/09/2026. Bình thường một tuần lịch có đúng 5 phiên, nhưng tuần này sàn không mở cửa từ 29/08 đến 02/09 vì cuối tuần và kỳ nghỉ lễ Quốc khánh, nên giá của thứ Sáu tuần trước không còn là giá cách đó 5 phiên. Hãy đếm lùi đúng 5 phiên rồi đặt hai con số vào ô trống của công thức ROC; chú ý giá phiên cuối nằm trên tử số, giá cách đó 5 phiên nằm dưới mẫu số.',
      en: 'The price history of Vinamilk (VNM) gives the closing prices of seven consecutive sessions, from Monday 2026-08-24 to Friday 2026-09-04. You need the 5-session ROC as of the 2026-09-04 session. A calendar week normally holds exactly 5 sessions, but this time the exchange stayed closed from 2026-08-29 to 2026-09-02 for the weekend and the National Day holiday, so the previous Friday’s price is no longer the price 5 sessions back. Count back exactly 5 sessions, then put the right two numbers into the slots of the ROC formula; note that the last session’s price goes in the numerator and the price 5 sessions earlier goes in the denominator.',
    },
    facts: [
      {
        label: {
          vi: 'Giá đóng cửa VNM phiên thứ Sáu 04/09/2026, phiên cuối',
          en: 'VNM close, Friday 2026-09-04, the last session',
        },
        value: { vi: '61.900 ₫', en: '61900 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên thứ Năm 03/09/2026', en: 'Close, Thursday 2026-09-03' },
        value: { vi: '61.200 ₫', en: '61200 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên thứ Sáu 28/08/2026', en: 'Close, Friday 2026-08-28' },
        value: { vi: '62.300 ₫', en: '62300 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên thứ Năm 27/08/2026', en: 'Close, Thursday 2026-08-27' },
        value: { vi: '62.500 ₫', en: '62500 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên thứ Tư 26/08/2026', en: 'Close, Wednesday 2026-08-26' },
        value: { vi: '62.800 ₫', en: '62800 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên thứ Ba 25/08/2026', en: 'Close, Tuesday 2026-08-25' },
        value: { vi: '62.600 ₫', en: '62600 ₫' },
      },
      {
        label: { vi: 'Giá đóng cửa phiên thứ Hai 24/08/2026', en: 'Close, Monday 2026-08-24' },
        value: { vi: '63.200 ₫', en: '63200 ₫' },
      },
    ],
    expected: -1.1182,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'ROC = ([61.900] ÷ [62.600] − 1) × 100',
      en: 'ROC = ([61900] ÷ [62600] − 1) × 100',
    },
    explain: {
      vi: 'Đếm lùi từ phiên cuối 04/09: phiên 03/09 là 1 phiên trước, 28/08 là 2, 27/08 là 3, 26/08 là 4 và 25/08 là 5, nên giá cách đó 5 phiên là 62.600 ₫ chứ không phải giá thứ Sáu tuần trước. Đặt 61.900 lên tử số, 62.600 xuống mẫu số: (61.900 ÷ 62.600 − 1) × 100 ra khoảng −1,12%, tức VNM đã mất hơn 1% sau 5 phiên. Bẫy thứ nhất là đếm theo lịch: ba ngày nghỉ lễ Quốc khánh từ 31/08 đến 02/09 không có phiên nào, nên lấy giá 62.300 ₫ của thứ Sáu 28/08 thực chất là tính ROC 2 phiên, ra −0,64%, nhẹ đi gần một nửa. Bẫy thứ hai là đếm cả phiên cuối vào 5 phiên, lấy nhầm 62.800 ₫ của 26/08 thành ROC 4 phiên, ra −1,43%. Đảo tử số và mẫu số thì dấu đổi, ra khoảng +1,13%, đọc thành cổ phiếu đang tăng trong khi giá thực tế đã giảm.',
      en: 'Count back from the last session on 2026-09-04: 2026-09-03 is 1 session back, 2026-08-28 is 2, 2026-08-27 is 3, 2026-08-26 is 4 and 2026-08-25 is 5, so the price 5 sessions back is 62600 ₫, not the previous Friday’s price. Put 61900 in the numerator and 62600 in the denominator: (61900 ÷ 62600 − 1) × 100 gives about −1.12%, meaning VNM lost more than 1% over 5 sessions. The first trap is counting by the calendar: the three National Day holidays from 2026-08-31 to 2026-09-02 had no sessions, so taking the 62300 ₫ close of Friday 2026-08-28 actually computes a 2-session ROC, giving −0.64%, close to half the real move. The second trap is counting the last session itself as one of the 5, picking the 62800 ₫ close of 2026-08-26 by mistake and turning it into a 4-session ROC of −1.43%. Swapping the numerator and denominator flips the sign to about +1.13%, which reads as a rising stock when the price actually fell.',
    },
    giai: {
      tinh: {
        vi: 'ROC 5 phiên của VNM chốt phiên 04/09/2026',
        en: 'The 5-session ROC of VNM as of the 2026-09-04 session',
      },
      thaySo: { vi: '(61.900 ÷ 62.600 − 1) × 100', en: '(61900 ÷ 62600 − 1) × 100' },
      ketQua: { vi: '-1,12 %', en: '-1.12 %' },
      gan: [
        { kyHieu: 'P_t', giaTri: { vi: '61.900', en: '61900' } },
        {
          kyHieu: 'P_{t-n}',
          moTa: {
            vi: 'là giá đóng cửa 5 phiên trước, ngày 25/08: 62.600 ₫',
            en: 'is the close 5 sessions earlier, on 25/08: 62600 ₫',
          },
        },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VNM&StartDate=08/24/2026&EndDate=09/04/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q463',
    formulaId: 'rsi-wilder',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một bài hướng dẫn cách tính RSI 14 kỳ đưa ra một ví dụ giả định: trong 14 phiên của một cổ phiếu có 9 phiên tăng, cộng lại được 18 điểm, và 5 phiên giảm, cộng lại được 10 điểm. Bảng số liệu có hai cách lấy trung bình: một cách chia tổng cho cả 14 phiên, cách kia chỉ chia cho số phiên có tăng hoặc số phiên có giảm. Hãy đặt đúng hai con số vào ô trống của công thức RSI; chú ý trung bình tăng và trung bình giảm của Wilder tính trên cả kỳ 14 phiên, phiên nào không tăng thì góp 0 vào trung bình tăng, và trung bình tăng nằm trên tử số của RS.',
      en: 'A guide to computing the 14-period RSI gives this hypothetical example: over 14 sessions of a stock there were 9 up sessions adding up to 18 points and 5 down sessions adding up to 10 points. The table holds two ways of averaging: one divides each total by all 14 sessions, the other divides only by the number of up sessions or down sessions. Put the right two numbers into the slots of the RSI formula; note that the Wilder average gain and average loss are taken over the whole 14-session period, a session that did not rise adds 0 to the average gain, and the average gain sits in the numerator of RS.',
    },
    facts: [
      {
        label: { vi: 'Số phiên trong kỳ RSI', en: 'Sessions in the RSI period' },
        value: { vi: '14 phiên', en: '14 sessions' },
      },
      {
        label: {
          vi: 'Trung bình tăng, tổng mức tăng chia cho cả 14 phiên',
          en: 'Average gain, total gains divided by all 14 sessions',
        },
        value: { vi: '1,28 điểm', en: '1.28 points' },
      },
      {
        label: {
          vi: 'Trung bình giảm, tổng mức giảm chia cho cả 14 phiên',
          en: 'Average loss, total losses divided by all 14 sessions',
        },
        value: { vi: '0,71 điểm', en: '0.71 points' },
      },
      {
        label: {
          vi: 'Mức tăng bình quân của riêng 9 phiên tăng',
          en: 'Average rise across the 9 up sessions only',
        },
        value: { vi: '2 điểm', en: '2 points' },
      },
      {
        label: {
          vi: 'Mức giảm bình quân của riêng 5 phiên giảm',
          en: 'Average drop across the 5 down sessions only',
        },
        value: { vi: '2 điểm', en: '2 points' },
      },
    ],
    expected: 64.3216,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: 'điểm', en: 'points' },
    worked: {
      vi: 'RSI = 100 − 100 ÷ (1 + [1,28] ÷ [0,71])',
      en: 'RSI = 100 − 100 ÷ (1 + [1.28] ÷ [0.71])',
    },
    explain: {
      vi: 'Hai ô của công thức là trung bình tăng và trung bình giảm theo Wilder, và cả hai đều chia cho đủ 14 phiên của kỳ: phiên không tăng góp 0 vào trung bình tăng, phiên không giảm góp 0 vào trung bình giảm. Vì thế 1,28 nằm trên tử số của RS, 0,71 nằm dưới mẫu số, và 100 − 100 ÷ (1 + 1,28 ÷ 0,71) ra khoảng 64,32, khớp mức 64,3 bài viết tính. Bài viết ghi “Trung bình mức tăng = 18/14 = 1,28; trung bình mức giảm = 10/14 = 0,71”; chia chính xác thì 18 ÷ 14 là 1,2857, nên số của bài đã bị cắt bớt, nhưng RSI chỉ lệch chưa tới 0,04 điểm. Cái bẫy là hai dòng 2 điểm: chúng chia tổng mức tăng cho 9 phiên tăng và tổng mức giảm cho 5 phiên giảm. Đặt hai số ấy vào thì RS thành 1 và RSI ra đúng 50, như thể bên mua và bên bán ngang sức, trong khi bên mua đã thắng 9 trên 14 phiên. Đảo hai ô, để trung bình giảm lên tử số, thì RSI ra khoảng 35,68, đọc ngược hẳn chiều thị trường. Với kỳ đầu tiên đúng 14 phiên như ở đây, trung bình của Wilder trùng với trung bình cộng thường; từ phiên thứ 15 trở đi mới có bước làm mượt, lấy trung bình cũ nhân 13, cộng mức tăng mới rồi chia 14.',
      en: 'The two slots of the formula are the Wilder average gain and average loss, and both are divided by all 14 sessions of the period: a session that did not rise adds 0 to the average gain, and a session that did not fall adds 0 to the average loss. So 1.28 goes in the numerator of RS, 0.71 in the denominator, and 100 − 100 ÷ (1 + 1.28 ÷ 0.71) gives about 64.32, matching the 64.3 the article computes. The article writes “Trung bình mức tăng = 18/14 = 1,28; trung bình mức giảm = 10/14 = 0,71” (average gain = 18/14 = 1.28; average loss = 10/14 = 0.71); dividing exactly, 18 ÷ 14 is 1.2857, so the article truncated its figures, but RSI moves by less than 0.04 points. The trap is the two rows of 2 points: they divide the total gain by the 9 up sessions and the total loss by the 5 down sessions. Put those two in and RS becomes 1 and RSI comes out at exactly 50, as if buyers and sellers were evenly matched, when buyers actually won 9 of the 14 sessions. Swap the two slots, putting the average loss in the numerator, and RSI comes out at about 35.68, reading the market the wrong way round. For a first period of exactly 14 sessions like this one, the Wilder average equals the plain arithmetic mean; the smoothing step only starts from session 15 on, taking the previous average times 13, adding the new gain and dividing by 14.',
    },
    giai: {
      tinh: { vi: 'RSI 14 phiên của cổ phiếu', en: 'The 14-session RSI of the stock' },
      thaySo: { vi: '100 − 100 ÷ (1 + 1,28 ÷ 0,71)', en: '100 − 100 ÷ (1 + 1.28 ÷ 0.71)' },
      ketQua: { vi: '64,32 điểm', en: '64.32 points' },
      gan: [
        {
          kyHieu: '\\overline{Gain}_n',
          moTa: {
            vi: 'là mức tăng trung bình mỗi phiên trong 14 phiên: 1,28 điểm',
            en: 'is the average gain per session over 14 sessions: 1.28 points',
          },
        },
        {
          kyHieu: '\\overline{Loss}_n',
          moTa: {
            vi: 'là mức giảm trung bình mỗi phiên trong 14 phiên: 0,71 điểm',
            en: 'is the average loss per session over 14 sessions: 0.71 points',
          },
        },
      ],
    },
    source: {
      url: 'https://fin5s.com/rsi-la-gi/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q464',
    formulaId: 'sma-n-phien',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Lịch sử giá trên CafeF ghi giá đóng cửa cổ phiếu ACB trong bảy phiên gần nhất, từ 16/09 đến 24/09/2026; ngày 19 và 20/09 là thứ Bảy và Chủ nhật nên không có phiên. Cần tính đường SMA 5 phiên tại phiên t là phiên 24/09/2026. Hãy đặt đúng năm giá đóng cửa vào năm ô trống của công thức SMA theo thứ tự của tổng: ô đầu là i = 0, tức chính phiên t, mỗi ô sau lùi thêm một phiên. Chú ý cửa sổ là năm PHIÊN giao dịch đếm lùi từ phiên t, không phải năm ngày lịch, nên không phải phiên nào trong bảng cũng được vào công thức.',
      en: "CafeF's price history lists ACB closing prices for the seven most recent sessions, from 2026-09-16 to 2026-09-24; September 19 and 20 were a Saturday and a Sunday, so there were no sessions on those days. You need the 5-session SMA at session t, the 2026-09-24 session. Put the right five closing prices into the five slots of the SMA formula in the order of the sum: the first slot is i = 0, session t itself, and each slot after it steps back one session. Watch the window: it is five trading SESSIONS counted back from session t, not five calendar days, so not every session in the table belongs in the formula.",
    },
    facts: [
      {
        label: {
          vi: 'Số phiên của đường trung bình (n)',
          en: 'Number of sessions in the average (n)',
        },
        value: { vi: '5 phiên', en: '5 sessions' },
      },
      {
        label: {
          vi: 'Giá đóng cửa ACB phiên 24/09/2026, thứ Năm (phiên t)',
          en: 'ACB close on 2026-09-24, Thursday (session t)',
        },
        value: { vi: '21.400 ₫', en: '21400 ₫' },
      },
      {
        label: {
          vi: 'Giá đóng cửa ACB phiên 23/09/2026, thứ Tư',
          en: 'ACB close on 2026-09-23, Wednesday',
        },
        value: { vi: '21.800 ₫', en: '21800 ₫' },
      },
      {
        label: {
          vi: 'Giá đóng cửa ACB phiên 22/09/2026, thứ Ba',
          en: 'ACB close on 2026-09-22, Tuesday',
        },
        value: { vi: '22.000 ₫', en: '22000 ₫' },
      },
      {
        label: {
          vi: 'Giá đóng cửa ACB phiên 21/09/2026, thứ Hai',
          en: 'ACB close on 2026-09-21, Monday',
        },
        value: { vi: '22.400 ₫', en: '22400 ₫' },
      },
      {
        label: {
          vi: 'Giá đóng cửa ACB phiên 18/09/2026, thứ Sáu',
          en: 'ACB close on 2026-09-18, Friday',
        },
        value: { vi: '21.900 ₫', en: '21900 ₫' },
      },
      {
        label: {
          vi: 'Giá đóng cửa ACB phiên 17/09/2026, thứ Năm',
          en: 'ACB close on 2026-09-17, Thursday',
        },
        value: { vi: '22.800 ₫', en: '22800 ₫' },
      },
      {
        label: {
          vi: 'Giá đóng cửa ACB phiên 16/09/2026, thứ Tư',
          en: 'ACB close on 2026-09-16, Wednesday',
        },
        value: { vi: '22.600 ₫', en: '22600 ₫' },
      },
    ],
    expected: 21900,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'SMA 5 = ([21.400] + [21.800] + [22.000] + [22.400] + [21.900]) ÷ 5',
      en: 'SMA 5 = ([21400] + [21800] + [22000] + [22400] + [21900]) ÷ 5',
    },
    explain: {
      vi: 'Tổng chạy từ i = 0 đến n − 1 = 4, nên năm ô là năm phiên giao dịch gần nhất đếm lùi từ phiên t: 24/09, 23/09, 22/09, 21/09, rồi vượt qua hai ngày cuối tuần về phiên thứ Sáu 18/09. Cộng lại được 109.500 ₫, chia cho n = 5 ra 21.900 ₫. Cái bẫy thứ nhất là đếm ngày lịch: năm ngày từ 20/09 đến 24/09 chỉ chứa bốn phiên, vì 19 và 20/09 là thứ Bảy và Chủ nhật, nên phiên 18/09 vẫn thuộc cửa sổ. Cái bẫy thứ hai là hai phiên 17/09 (22.800 ₫) và 16/09 (22.600 ₫): chúng có trong bảng nhưng nằm ngoài cửa sổ năm phiên; kéo cả hai vào là thành SMA 7 phiên, ra khoảng 22.129 ₫, cao hơn gần 230 ₫ vì hai phiên cũ đều đóng cửa ở mức cao. Đọc kết quả: phiên t đóng cửa 21.400 ₫, nằm dưới đường SMA 5 ở 21.900 ₫, tức giá đang yếu hơn mặt bằng một tuần giao dịch vừa qua.',
      en: 'The sum runs from i = 0 to n − 1 = 4, so the five slots are the five most recent trading sessions counted back from session t: September 24, 23, 22 and 21, then across the weekend to Friday, September 18. They add up to 109500 ₫, and dividing by n = 5 gives 21900 ₫. The first trap is counting calendar days: the five days from September 20 to 24 hold only four sessions, because September 19 and 20 were a Saturday and a Sunday, so the September 18 session is still inside the window. The second trap is the September 17 (22800 ₫) and September 16 (22600 ₫) sessions: they are in the table but outside the five-session window; pulling both in turns the line into a 7-session SMA of about 22129 ₫, nearly 230 ₫ higher, because both older sessions closed high. Reading the result: session t closed at 21400 ₫, below the 5-session SMA of 21900 ₫, so price is weaker than its average level over the past trading week.',
    },
    giai: {
      tinh: {
        vi: 'Đường SMA 5 phiên của ACB tại phiên 24/09/2026',
        en: 'The 5-session SMA of ACB at the 2026-09-24 session',
      },
      thaySo: {
        vi: '(21.400 + 21.800 + 22.000 + 22.400 + 21.900) ÷ 5',
        en: '(21400 + 21800 + 22000 + 22400 + 21900) ÷ 5',
      },
      ketQua: { vi: '21.900 ₫', en: '21900 ₫' },
      gan: [
        {
          kyHieu: 'P_{t-i}',
          moTa: {
            vi: 'là giá đóng cửa 5 phiên gần nhất, từ 24/09 lùi về 18/09: 21.400, 21.800, 22.000, 22.400 và 21.900 ₫',
            en: 'is the close of the latest 5 sessions, from 24/09 back to 18/09: 21400, 21800, 22000, 22400 and 21900 ₫',
          },
        },
        { kyHieu: 'n', moTa: { vi: 'là 5 phiên', en: 'is 5 sessions' } },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=ACB&StartDate=09/16/2026&EndDate=09/24/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q465',
    formulaId: 'stochastic-k',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Lịch sử giá trên CafeF cho cổ phiếu TCB (Techcombank) trong 14 phiên từ 07/09 đến 24/09/2026 cho ra các mốc dưới đây. Stochastic %K chu kỳ 14 đo đỉnh và đáy bằng giá cao nhất và giá thấp nhất TRONG PHIÊN chứ không bằng giá đóng cửa, nên bảng ghi cả hai bộ đỉnh đáy để bạn chọn. Hãy đặt đúng bốn con số vào ô trống của công thức %K; chú ý giá thấp nhất 14 phiên xuất hiện hai lần, một lần ở tử số và một lần ở mẫu số, và giá đứng đầu tử số là giá đóng cửa của phiên gần nhất 24/09 chứ không phải giá mở cửa.',
      en: "CafeF's price history for Techcombank (TCB) over the 14 sessions from 2026-09-07 to 2026-09-24 gives the levels below. A 14-session stochastic %K measures the high and the low with the INTRADAY high and low, not with closing prices, so the table lists both sets of highs and lows for you to choose from. Put the right four numbers into the slots of the %K formula; note that the 14-session low appears twice, once in the numerator and once in the denominator, and that the price at the head of the numerator is the close of the latest session, 2026-09-24, not its opening price.",
    },
    facts: [
      {
        label: { vi: 'Giá đóng cửa TCB phiên 24/09/2026', en: 'TCB closing price on 2026-09-24' },
        value: { vi: '32.950 ₫', en: '32950 ₫' },
      },
      {
        label: { vi: 'Giá mở cửa TCB phiên 24/09/2026', en: 'TCB opening price on 2026-09-24' },
        value: { vi: '32.750 ₫', en: '32750 ₫' },
      },
      {
        label: {
          vi: 'Giá đóng cửa cao nhất của 14 phiên (phiên 23/09)',
          en: 'Highest close of the 14 sessions (2026-09-23)',
        },
        value: { vi: '33.150 ₫', en: '33150 ₫' },
      },
      {
        label: {
          vi: 'Giá cao nhất trong phiên, cao nhất của 14 phiên (phiên 23/09)',
          en: 'Highest intraday high of the 14 sessions (2026-09-23)',
        },
        value: { vi: '33.450 ₫', en: '33450 ₫' },
      },
      {
        label: {
          vi: 'Giá đóng cửa thấp nhất của 14 phiên (phiên 11/09 và 18/09)',
          en: 'Lowest close of the 14 sessions (2026-09-11 and 2026-09-18)',
        },
        value: { vi: '31.600 ₫', en: '31600 ₫' },
      },
      {
        label: {
          vi: 'Giá thấp nhất trong phiên, thấp nhất của 14 phiên (phiên 14/09)',
          en: 'Lowest intraday low of the 14 sessions (2026-09-14)',
        },
        value: { vi: '31.400 ₫', en: '31400 ₫' },
      },
    ],
    expected: 75.61,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: '%K = ([32.950] − [31.400]) ÷ ([33.450] − [31.400]) × 100',
      en: '%K = ([32950] − [31400]) ÷ ([33450] − [31400]) × 100',
    },
    explain: {
      vi: '%K đo giá đóng cửa đứng ở đâu trong biên độ thật của 14 phiên, và biên độ ấy tính bằng giá cao nhất, thấp nhất trong phiên. Vì thế 33.450 ₫, đỉnh trong phiên 23/09, vào ô đỉnh; 31.400 ₫, đáy trong phiên 14/09, vào cả hai ô đáy; còn 32.950 ₫ của phiên 24/09 đứng đầu tử số: (32.950 − 31.400) ÷ (33.450 − 31.400) × 100 ra 75,61%. Cái bẫy là hai dòng đỉnh đáy theo giá đóng cửa: đặt 33.150 ₫ và 31.600 ₫ vào thì ra (32.950 − 31.600) ÷ (33.150 − 31.600) × 100 = 87,10%, vượt mốc 80 nên bị đọc thành đóng cửa sát đỉnh, trong khi con số đúng còn cách mốc ấy hơn 4 điểm. Giá mở cửa 32.750 ₫ không có chỗ nào trong công thức.',
      en: '%K measures where the close sits within the true range of the 14 sessions, and that range is taken from intraday highs and lows. So 33450 ₫, the intraday high of 2026-09-23, goes into the high slot; 31400 ₫, the intraday low of 2026-09-14, goes into both low slots; and the 32950 ₫ close of 2026-09-24 heads the numerator: (32950 − 31400) ÷ (33450 − 31400) × 100 gives 75.61%. The trap is the pair of highs and lows taken from closing prices: putting 33150 ₫ and 31600 ₫ in gives (32950 − 31600) ÷ (33150 − 31600) × 100 = 87.10%, above the 80 mark and so read as a close near the top, while the correct figure is still more than 4 points below that mark. The 32750 ₫ opening price has no place anywhere in the formula.',
    },
    giai: {
      tinh: {
        vi: 'Stochastic %K chu kỳ 14 của TCB phiên 24/09/2026',
        en: "TCB's 14-session stochastic %K on 2026-09-24",
      },
      thaySo: {
        vi: '(32.950 − 31.400) ÷ (33.450 − 31.400) × 100',
        en: '(32950 − 31400) ÷ (33450 − 31400) × 100',
      },
      ketQua: { vi: '75,61 %', en: '75.61 %' },
      gan: [
        { kyHieu: 'C', giaTri: { vi: '32.950', en: '32950' } },
        {
          kyHieu: 'L_{n}',
          moTa: {
            vi: 'là giá thấp nhất trong phiên của 14 phiên: 31.400 ₫',
            en: 'is the lowest intraday price of the 14 sessions: 31400 ₫',
          },
        },
        {
          kyHieu: 'H_{n}',
          moTa: {
            vi: 'là giá cao nhất trong phiên của 14 phiên: 33.450 ₫',
            en: 'is the highest intraday price of the 14 sessions: 33450 ₫',
          },
        },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=TCB&StartDate=09/07/2026&EndDate=09/24/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q466',
    formulaId: 'sut-giam-hien-tai',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Lịch sử giá cổ phiếu FPT trên CafeF, từ 26/08 đến 25/09/2026: phiên 25/09 đóng cửa 64.700 ₫, còn giá đóng cửa cao nhất của 30 phiên ấy rơi vào phiên 10/09. FPT chốt quyền nhận cổ phiếu thưởng tỷ lệ 10:1 ngày 22/09/2026, nên cột giá điều chỉnh của CafeF đã chia giá mọi phiên trước 21/09 cho 1,1: phiên 10/09 ở cột ấy ghi 67.730 ₫, trong khi cột giá đóng cửa vẫn ghi 74.500 ₫ như bảng giá hôm ấy. Hãy đặt đúng ba con số vào ô trống của công thức Mức sụt giảm hiện tại, chú ý đỉnh xuất hiện hai lần, một lần ở tử số và một lần ở mẫu số, và đỉnh với giá phiên gần nhất phải cùng một thước giá.',
      en: "FPT's price history on CafeF, from 2026-08-26 to 2026-09-25: the 2026-09-25 session closed at 64700 ₫, and the highest close of those 30 sessions fell on 2026-09-10. FPT set 2026-09-22 as the record date for a bonus issue of one new share for every ten held, so CafeF's adjusted price column has divided every session before 2026-09-21 by 1.1: the 2026-09-10 session reads 67730 ₫ in that column, while the close column still shows the 74500 ₫ of that day's price board. Put the right three numbers into the slots of the current drawdown formula, noting that the peak appears twice, once in the numerator and once in the denominator, and that the peak and the latest close must be on the same price basis.",
    },
    facts: [
      {
        label: {
          vi: 'Giá đóng cửa phiên gần nhất, 25/09/2026',
          en: 'Close of the latest session, 2026-09-25',
        },
        value: { vi: '64.700 ₫', en: '64700 ₫' },
      },
      {
        label: {
          vi: 'Giá đóng cửa cao nhất trong 30 phiên, phiên 10/09/2026, ở cột giá điều chỉnh cho cổ phiếu thưởng',
          en: 'Highest close of the 30 sessions, 2026-09-10, in the column adjusted for the bonus shares',
        },
        value: { vi: '67.730 ₫', en: '67730 ₫' },
      },
      {
        label: {
          vi: 'Giá cao nhất trong phiên 10/09/2026, chưa điều chỉnh',
          en: 'Intraday high on 2026-09-10, unadjusted',
        },
        value: { vi: '74.800 ₫', en: '74800 ₫' },
      },
      {
        label: {
          vi: 'Giá đóng cửa 10/09/2026 ở cột giá đóng cửa, chưa điều chỉnh',
          en: 'Close on 2026-09-10 in the close column, unadjusted',
        },
        value: { vi: '74.500 ₫', en: '74500 ₫' },
      },
      {
        label: {
          vi: 'Giá đóng cửa phiên liền trước, 24/09/2026',
          en: 'Close of the previous session, 2026-09-24',
        },
        value: { vi: '65.300 ₫', en: '65300 ₫' },
      },
    ],
    expected: 4.47,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Sụt giảm hiện tại = ([67.730] − [64.700]) ÷ [67.730] × 100',
      en: 'Current drawdown = ([67730] − [64700]) ÷ [67730] × 100',
    },
    explain: {
      vi: 'Đỉnh là giá đóng cửa cao nhất trong cửa sổ, lấy ở cột giá điều chỉnh, nên 67.730 ₫ đứng ở cả tử số lẫn mẫu số, còn giá phiên gần nhất 64.700 ₫ chỉ đứng ở vế bị trừ: (67.730 − 64.700) ÷ 67.730 × 100 ra 4,47%. Cái bẫy lớn nhất là 74.500 ₫ ở cột giá đóng cửa: đó là giá phiên 10/09 trước đợt cổ phiếu thưởng, đem so với giá 64.700 ₫ sau ngày không hưởng quyền thì ra 13,15%, gần gấp ba mức chìm thật, vì phần giá giảm do chia thêm cổ phiếu bị tính nhầm thành thua lỗ. Hai số còn lại cũng sai chỗ: 74.800 ₫ là giá cao nhất TRONG phiên, lại chưa điều chỉnh, lấy nó làm đỉnh ra 13,50%; còn 65.300 ₫ là giá phiên 24/09, đã không còn là phiên gần nhất.',
      en: 'The peak is the highest close in the window, taken from the adjusted column, so 67730 ₫ goes into both the numerator and the denominator, while the latest close of 64700 ₫ only sits on the subtracted side: (67730 − 64700) ÷ 67730 × 100 gives 4.47%. The biggest trap is the 74500 ₫ in the close column: that is the 2026-09-10 price from before the bonus issue, and setting it against the 64700 ₫ price after the ex-rights date gives 13.15%, nearly three times the real drawdown, because the price drop caused by the extra shares gets counted as a loss. The other two figures are misplaced as well: 74800 ₫ is the highest price DURING the session, and unadjusted on top of that, so using it as the peak gives 13.50%; 65300 ₫ is the 2026-09-24 price, which is no longer the latest session.',
    },
    giai: {
      tinh: {
        vi: 'Mức sụt giảm hiện tại của FPT so với đỉnh 30 phiên',
        en: "FPT's current drawdown from its 30-session peak",
      },
      thaySo: {
        vi: '(67.730 − 64.700) ÷ 67.730 × 100',
        en: '(67730 − 64700) ÷ 67730 × 100',
      },
      ketQua: { vi: '4,47 %', en: '4.47 %' },
      gan: [
        {
          kyHieu: 'P_{max}',
          moTa: {
            vi: 'là giá đóng cửa cao nhất trong 30 phiên, ở cột giá điều chỉnh cho cổ phiếu thưởng: 67.730 ₫',
            en: 'is the highest close of the 30 sessions, in the column adjusted for the bonus shares: 67730 ₫',
          },
        },
        { kyHieu: 'P_{t}', giaTri: { vi: '64.700', en: '64700' } },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/26/2026&EndDate=09/25/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q467',
    formulaId: 'ty-so-calmar',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bài hướng dẫn về tỷ số Calmar trên Quantt đánh giá một quỹ giao dịch hợp đồng tương lai qua ba năm: lợi suất từng năm +18,5%, +9,2% và +14,1%, còn cú sụt sâu nhất từ đỉnh xuống đáy trong cả ba năm là −12,3%. Bảng số liệu có ba cách tóm tắt lợi suất ba năm: lãi cộng dồn, bình quân cộng và lợi suất năm hoá theo lãi kép. Hãy đặt đúng hai con số, viết ở dạng thập phân, vào ô trống của công thức Calmar; chú ý tử số là lợi suất MỖI NĂM tính theo lãi kép, còn mẫu số là độ lớn của mức sụt giảm nên không mang dấu âm.',
      en: 'A Calmar ratio tutorial on Quantt evaluates a managed futures fund over three years: annual returns of +18.5%, +9.2% and +14.1%, and a worst peak-to-trough decline of −12.3% across the whole three years. The table summarizes the three-year return three ways: cumulative gain, simple average and compounded annualized return. Put the right two numbers, written as decimals, into the slots of the Calmar formula; note that the numerator is the return PER YEAR on a compounded basis, and the denominator is the size of the drawdown, so it carries no minus sign.',
    },
    facts: [
      {
        label: {
          vi: 'Lợi suất từng năm 2023, 2024, 2025',
          en: 'Annual return in 2023, 2024, 2025',
        },
        value: { vi: '+18,5%; +9,2%; +14,1%', en: '+18.5%; +9.2%; +14.1%' },
      },
      {
        label: {
          vi: 'Lãi cộng dồn cả ba năm, từ hệ số 1,185 × 1,092 × 1,141 = 1,4764',
          en: 'Cumulative gain over the three years, from the factor 1.185 × 1.092 × 1.141 = 1.4764',
        },
        value: { vi: '0,4764 (47,64%)', en: '0.4764 (47.64%)' },
      },
      {
        label: {
          vi: 'Bình quân cộng lợi suất ba năm',
          en: 'Simple average of the three annual returns',
        },
        value: { vi: '0,1393 (13,93%)', en: '0.1393 (13.93%)' },
      },
      {
        label: {
          vi: 'Lợi suất năm hoá theo lãi kép (CAGR) ba năm',
          en: 'Compounded annualized return (CAGR) over three years',
        },
        value: { vi: '0,1386 (13,86%/năm)', en: '0.1386 (13.86%/year)' },
      },
      {
        label: {
          vi: 'Mức sụt giảm sâu nhất từ đỉnh xuống đáy trong ba năm',
          en: 'Maximum peak-to-trough drawdown over the three years',
        },
        value: { vi: '−12,3%, độ lớn 0,123', en: '−12.3%, magnitude 0.123' },
      },
    ],
    expected: 1.1268,
    tolerance: { kind: 'tuyet-doi', value: 0.005 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'Tỷ số Calmar = [0,1386] ÷ [0,123]',
      en: 'Calmar ratio = [0.1386] ÷ [0.123]',
    },
    explain: {
      vi: 'Tử số là lợi suất năm hoá theo lãi kép: nhân ba hệ số 1,185 × 1,092 × 1,141 được 1,4764, lấy căn bậc ba rồi trừ 1, bài gốc ghi ra 0,1386, tức 13,86% mỗi năm. Mẫu số là độ lớn của cú sụt sâu nhất, 0,123. Lấy 0,1386 chia 0,123 ra khoảng 1,13 lần: mỗi năm quỹ kiếm được hơn một lần cú đau lớn nhất đã phải chịu. Bẫy thứ nhất là lãi cộng dồn 0,4764: đó là lãi của cả ba năm gộp lại, đặt vào tử số thì ra khoảng 3,87 lần, đẹp gấp hơn ba lần thực tế. Bẫy thứ hai là bình quân cộng 0,1393: nó luôn không nhỏ hơn lợi suất kép vì bỏ qua việc lãi năm này chồng lên vốn đã đổi của năm trước; ở đây chỉ lệch chút ít, nhưng lợi suất các năm càng chênh nhau thì lệch càng xa. Bài gốc nói rõ vì sao dùng lãi kép: “Using CAGR rather than simple average return ensures the numerator reflects actual wealth accumulation.” Mẫu số lấy 0,123 chứ không phải −0,123, vì giữ dấu âm thì một quỹ đang lãi lại ra tỷ số âm.',
      en: 'The numerator is the compounded annualized return: multiplying the three factors 1.185 × 1.092 × 1.141 gives 1.4764, and taking the cube root and subtracting 1 gives the 0.1386 the tutorial reports, that is, 13.86% a year. The denominator is the size of the worst drawdown, 0.123. 0.1386 divided by 0.123 is about 1.13x: each year the fund earned a little more than the single biggest loss it had to sit through. The first trap is the 0.4764 cumulative gain: that is three years of return lumped together, and putting it in the numerator gives about 3.87x, more than three times better than the truth. The second trap is the 0.1393 simple average: it is never smaller than the compounded return because it ignores that each year’s gain lands on the capital left by the year before; the gap is small here, but it widens the more the yearly returns differ. The tutorial states why compounding is used: “Using CAGR rather than simple average return ensures the numerator reflects actual wealth accumulation.” The denominator takes 0.123, not −0.123, because keeping the minus sign turns a profitable fund into a negative ratio.',
    },
    giai: {
      tinh: { vi: 'Tỷ số Calmar của quỹ', en: 'Calmar ratio of the fund' },
      thaySo: { vi: '0,1386 ÷ 0,123', en: '0.1386 ÷ 0.123' },
      ketQua: { vi: '1,13 lần', en: '1.13 x' },
      gan: [
        {
          kyHieu: 'r_{nam}',
          moTa: {
            vi: 'là lợi suất năm hoá theo lãi kép của ba năm: 0,1386, tức 13,86%',
            en: 'is the compound annualized return over the three years: 0.1386, that is 13.86%',
          },
        },
        { kyHieu: 'MDD', giaTri: { vi: '0,123', en: '0.123' } },
      ],
    },
    source: {
      url: 'https://www.quantt.co.uk/resources/calmar-ratio-explained',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q468',
    formulaId: 'ty-so-sharpe',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bài hướng dẫn tính tỷ số Sharpe trên Quantt đánh giá một danh mục cổ phiếu Anh qua sáu tháng, lợi suất từng tháng 2,8%; −1,2%; 3,5%; −0,4%; 1,9%; 2,6%, lãi suất phi rủi ro 4,0%/năm. Công thức của trang làm việc theo kỳ rồi mới quy năm: lợi suất bình quân một kỳ trừ lãi phi rủi ro của một kỳ, chia độ lệch chuẩn lợi suất kỳ, rồi nhân căn bậc hai của số kỳ trong năm, ở đây dữ liệu tháng nên là √12. Bảng số liệu có cả lãi suất năm lẫn lợi suất vượt trội mà bài đã trừ sẵn lãi phi rủi ro. Hãy đặt đúng ba con số vào ô trống của công thức Sharpe; chú ý ô bị trừ là lãi phi rủi ro của MỘT THÁNG quy theo lãi kép chứ không phải lãi cả năm, và ô đầu tiên là lợi suất chưa trừ gì.',
      en: 'A Sharpe ratio tutorial on Quantt evaluates a UK equity portfolio over six months, with monthly returns of 2.8%; −1.2%; 3.5%; −0.4%; 1.9%; 2.6% and a risk-free rate of 4.0% a year. The formula on this page works per period and annualizes last: the average return of one period minus the risk-free rate of one period, divided by the standard deviation of period returns, then multiplied by the square root of periods per year, which for monthly data is √12. The table holds both the annual rate and an excess return from which the tutorial has already subtracted the risk-free rate. Put the right three numbers into the slots of the Sharpe formula; note that the subtracted slot is the risk-free rate for ONE MONTH, compounded, not the full-year rate, and the first slot is the return before anything is subtracted.',
    },
    facts: [
      {
        label: {
          vi: 'Lợi suất của danh mục, tháng 1 đến tháng 6',
          en: 'Portfolio return, month 1 to month 6',
        },
        value: {
          vi: '2,8%; −1,2%; 3,5%; −0,4%; 1,9%; 2,6%',
          en: '2.8%; −1.2%; 3.5%; −0.4%; 1.9%; 2.6%',
        },
      },
      {
        label: {
          vi: 'Lợi suất bình quân một tháng của danh mục',
          en: 'Average one-month return of the portfolio',
        },
        value: { vi: '1,533%', en: '1.533%' },
      },
      {
        label: {
          vi: 'Độ lệch chuẩn lợi suất tháng, mẫu chia n − 1',
          en: 'Standard deviation of monthly returns, sample (n − 1)',
        },
        value: { vi: '1,896%', en: '1.896%' },
      },
      {
        label: { vi: 'Lãi suất phi rủi ro / năm', en: 'Risk-free rate / year' },
        value: { vi: '4,0%', en: '4.0%' },
      },
      {
        label: {
          vi: 'Lãi suất phi rủi ro quy về một tháng theo lãi kép, (1 + 4%)^(1/12) − 1',
          en: 'Risk-free rate converted to one month by compounding, (1 + 4%)^(1/12) − 1',
        },
        value: { vi: '0,327%', en: '0.327%' },
      },
      {
        label: {
          vi: 'Lợi suất vượt trội bình quân một tháng, bài đã trừ sẵn lãi phi rủi ro',
          en: 'Average one-month excess return, risk-free rate already subtracted by the tutorial',
        },
        value: { vi: '1,200%', en: '1.200%' },
      },
      {
        label: {
          vi: 'Số kỳ dữ liệu trong một năm, dữ liệu tháng',
          en: 'Data periods per year, monthly data',
        },
        value: { vi: '12', en: '12' },
      },
    ],
    expected: 2.2034,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'Tỷ số Sharpe = ([1,533] − [0,327]) ÷ [1,896] × √12',
      en: 'Sharpe ratio = ([1.533] − [0.327]) ÷ [1.896] × √12',
    },
    explain: {
      vi: 'Công thức của trang tính theo từng kỳ rồi mới quy năm: lợi suất bình quân một tháng 1,533% trừ lãi phi rủi ro của một tháng 0,327% còn 1,206%, chia độ lệch chuẩn lợi suất tháng 1,896% được khoảng 0,636, nhân √12 (khoảng 3,464) ra khoảng 2,20 lần. Bẫy thứ nhất là dòng lãi suất 4,0%/năm: đặt nó vào ô bị trừ là đem lãi cả năm trừ vào lợi suất một tháng, tử số thành −2,467 và tỷ số rơi xuống khoảng −4,51 lần, dù danh mục thắng lãi phi rủi ro rõ ràng. Bẫy thứ hai là dòng 1,200%: đó là lợi suất vượt trội bài đã trừ sẵn lãi phi rủi ro, đặt vào ô đầu rồi trừ tiếp 0,327% là trừ hai lần, ra khoảng 1,60 lần. Bài gốc quy lãi năm về tháng bằng cách chia thẳng 4,0% cho 12 được 0,333% nên ra 2,19; trang này quy theo lãi kép như ghi ở bảng ký hiệu, nên ô ấy là 0,327% và kết quả nhích lên khoảng 2,20. Độ lệch chuẩn cũng phải là của lợi suất THÁNG, vì phép nhân √12 đã làm việc quy năm rồi.',
      en: 'The formula on this page works per period and annualizes last: the average one-month return of 1.533% minus the one-month risk-free rate of 0.327% leaves 1.206%; divided by the 1.896% standard deviation of monthly returns that is about 0.636, and multiplied by √12 (about 3.464) it gives about 2.20x. The first trap is the 4.0% per year line: putting it in the subtracted slot takes a full year of interest away from a single month of return, turning the numerator into −2.467 and the ratio into about −4.51x, even though the portfolio clearly beat the risk-free rate. The second trap is the 1.200% line: that is the excess return with the risk-free rate already taken out by the tutorial, so putting it in the first slot and then subtracting 0.327% again subtracts it twice, giving about 1.60x. The original tutorial converts the annual rate to a monthly one by dividing 4.0% straight by 12, which gives 0.333% and a result of 2.19; this page compounds, as its symbol legend states, so that slot takes 0.327% and the result edges up to about 2.20. The standard deviation must also be the one of MONTHLY returns, because multiplying by √12 already does the annualizing.',
    },
    giai: {
      tinh: {
        vi: 'Tỷ số Sharpe quy năm của danh mục',
        en: 'Annualized Sharpe ratio of the portfolio',
      },
      thaySo: { vi: '(1,533 − 0,327) ÷ 1,896 × √12', en: '(1.533 − 0.327) ÷ 1.896 × √12' },
      ketQua: { vi: '2,2 lần', en: '2.2 x' },
      gan: [
        {
          kyHieu: '\\bar{r}_p',
          moTa: {
            vi: 'là lợi suất bình quân một tháng: 1,533%',
            en: 'is the average monthly return: 1.533%',
          },
        },
        {
          kyHieu: 'r_f',
          moTa: {
            vi: 'là lãi suất phi rủi ro quy về một tháng: 0,327%',
            en: 'is the risk-free rate converted to one month: 0.327%',
          },
        },
        {
          kyHieu: '\\sigma_p',
          moTa: {
            vi: 'là độ lệch chuẩn lợi suất tháng: 1,896%',
            en: 'is the standard deviation of monthly returns: 1.896%',
          },
        },
        {
          kyHieu: 'm',
          moTa: { vi: 'là 12, vì dữ liệu theo tháng', en: 'is 12, because the data are monthly' },
        },
      ],
    },
    source: {
      url: 'https://www.quantt.co.uk/resources/sharpe-ratio-explained',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q469',
    formulaId: 'ty-so-sortino',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bài viết về tỷ lệ Sortino trên Algotrade Knowledge Hub lấy ví dụ một danh mục có tỷ suất sinh lợi tám năm lần lượt 19%, 12%, 23%, −5%, 15%, 6%, 13%, −4%, và tỷ suất lợi nhuận mục tiêu của nhà đầu tư là 7%/năm; trong công thức của trang, mức mục tiêu này đứng đúng chỗ ngưỡng mà mọi năm được đem ra so. Dòng công thức dưới đây đã viết độ lệch chuẩn phần giảm ra thành căn bậc hai, và bảng số liệu có cả lợi suất gốc của những năm lỗ lẫn mức thua lỗ tương đối so với ngưỡng. Hãy đặt đúng năm con số vào ô trống của công thức Sortino; chú ý dưới dấu căn là phần hụt so với ngưỡng 7% chứ không phải lợi suất gốc của năm lỗ, và dữ liệu đã tính theo năm nên hệ số quy năm là √1.',
      en: 'An article on the Sortino ratio on the Algotrade Knowledge Hub uses a portfolio whose returns over eight years were 19%, 12%, 23%, −5%, 15%, 6%, 13%, −4%, with an investor target return of 7% a year; in the formula on this page, that target sits exactly where the threshold every year is compared against goes. The line below writes the downside deviation out as a square root, and the table holds both the raw returns of the losing years and the shortfalls relative to the threshold. Put the right five numbers into the slots of the Sortino formula; note that what goes under the root is the shortfall against the 7% threshold, not the raw return of a losing year, and that the data is already yearly, so the annualization factor is √1.',
    },
    facts: [
      {
        label: {
          vi: 'Tỷ suất sinh lợi hằng năm của danh mục, năm 1 đến năm 8',
          en: 'Annual portfolio return, year 1 to year 8',
        },
        value: {
          vi: '19%; 12%; 23%; −5%; 15%; 6%; 13%; −4%',
          en: '19%; 12%; 23%; −5%; 15%; 6%; 13%; −4%',
        },
      },
      {
        label: {
          vi: 'Tỷ suất lợi nhuận mục tiêu, dùng làm ngưỡng',
          en: 'Target return, used as the threshold',
        },
        value: { vi: '7%/năm', en: '7%/year' },
      },
      {
        label: { vi: 'Tỷ suất sinh lợi bình quân 8 năm', en: 'Average return over the 8 years' },
        value: { vi: '9,875%', en: '9.875%' },
      },
      {
        label: {
          vi: 'Lợi suất tương đối bình quân, bài đã trừ sẵn ngưỡng',
          en: 'Average relative return, threshold already subtracted by the article',
        },
        value: { vi: '2,88%', en: '2.88%' },
      },
      {
        label: {
          vi: 'Mức thua lỗ tương đối so với ngưỡng của năm 4, năm 6, năm 8; năm khác bằng 0%',
          en: 'Shortfall relative to the threshold in year 4, year 6, year 8; 0% in the other years',
        },
        value: { vi: '−12%; −1%; −11%', en: '−12%; −1%; −11%' },
      },
      {
        label: {
          vi: 'Số kỳ dữ liệu trong một năm, dữ liệu năm',
          en: 'Data periods per year, yearly data',
        },
        value: { vi: '1', en: '1' },
      },
    ],
    expected: 0.4986,
    tolerance: { kind: 'tuyet-doi', value: 0.005 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'Tỷ số Sortino = ([9,875] − [7]) ÷ √((([−12])^2 + ([−1])^2 + ([−11])^2) ÷ 8) × √1',
      en: 'Sortino ratio = ([9.875] − [7]) ÷ √((([−12])^2 + ([−1])^2 + ([−11])^2) ÷ 8) × √1',
    },
    explain: {
      vi: 'Tử số lấy tỷ suất sinh lợi bình quân 9,875% trừ ngưỡng 7%, còn 2,875%. Ô ngưỡng là r_f: trang lấy lãi suất phi rủi ro làm ngưỡng, còn bài gốc lấy tỷ suất lợi nhuận mục tiêu 7% của nhà đầu tư; công thức giữ nguyên, chỉ đổi con số đứng ở chỗ ngưỡng, và dữ liệu theo năm nên 7% không phải quy đổi gì. Mẫu số là độ lệch chuẩn phần giảm: chỉ ba năm rơi dưới ngưỡng có phần hụt, −12%, −1% và −11%; bình phương lên được 144, 1 và 121, cộng lại 266, chia cho cả 8 năm ra 33,25, khai căn ra khoảng 5,77%. Lấy 2,875 chia 5,77 ra khoảng 0,50 lần (bài gốc ghi 0,49 vì cắt bớt chữ số của 2,88 ÷ 5,77, chứ không làm tròn); dữ liệu theo năm nên √1 không đổi gì, còn nhân √250 như chuỗi theo ngày là thổi tỷ số lên gần 16 lần. Bẫy thứ nhất là lợi suất gốc −5% và −4% của năm 4 và năm 8: đặt chúng dưới dấu căn là đo thua lỗ so với 0 chứ không so với ngưỡng, lại bỏ sót năm 6 lãi 6% mà vẫn hụt 1% so với 7%; mẫu số teo còn khoảng 2,26% và tỷ số phình lên khoảng 1,27 lần. Bẫy thứ hai là dòng 2,88%: đó là phần chênh bài đã trừ sẵn ngưỡng, đặt vào ô đầu rồi trừ tiếp 7% là trừ hai lần. Con số 8 dưới dấu căn là quy ước của trang: chia cho 3 năm hụt thay vì cả 8 năm thì mẫu số phình thành khoảng 9,42% và tỷ số tụt còn khoảng 0,31.',
      en: "The numerator takes the 9.875% average return minus the 7% threshold, leaving 2.875%. The threshold slot is r_f: this page uses the risk-free rate as its threshold, while the article uses the investor's 7% target return; the formula stays the same, only the number standing in the threshold slot changes, and since the data is yearly the 7% needs no conversion. The denominator is the downside deviation: only three years fall below the threshold, with shortfalls of −12%, −1% and −11%; squared they give 144, 1 and 121, which sum to 266, divided by all 8 years that is 33.25, and the square root is about 5.77%. 2.875 divided by 5.77 is about 0.50x (the article prints 0.49 because it truncates 2.88 ÷ 5.77 rather than rounding it); the data is yearly, so √1 changes nothing, whereas multiplying by √250 as for a daily series would inflate the ratio almost 16 times. The first trap is the raw −5% and −4% returns of year 4 and year 8: putting them under the root measures losses against 0 instead of against the threshold, and it also drops year 6, which gained 6% yet still fell 1% short of 7%; the denominator shrinks to about 2.26% and the ratio swells to about 1.27x. The second trap is the 2.88% line: that is the gap with the threshold already subtracted by the article, so putting it in the first slot and subtracting 7% again subtracts it twice. The 8 under the root is this page’s convention: dividing by the 3 shortfall years instead of all 8 swells the denominator to about 9.42% and drops the ratio to about 0.31.",
    },
    giai: {
      tinh: { vi: 'Tỷ số Sortino của danh mục', en: 'Sortino ratio of the portfolio' },
      thaySo: {
        vi: '(9,875 − 7) ÷ √(((−12)^2 + (−1)^2 + (−11)^2) ÷ 8) × √1',
        en: '(9.875 − 7) ÷ √(((−12)^2 + (−1)^2 + (−11)^2) ÷ 8) × √1',
      },
      ketQua: { vi: '0,4986 lần', en: '0.4986 x' },
      gan: [
        {
          kyHieu: '\\bar{r}_p',
          moTa: {
            vi: 'là lợi suất bình quân 8 năm: 9,875%',
            en: 'is the 8-year average return: 9.875%',
          },
        },
        {
          kyHieu: 'r_f',
          moTa: {
            vi: 'ở đây là tỷ suất mục tiêu dùng làm ngưỡng: 7% một năm',
            en: 'is here the target return used as the threshold: 7% a year',
          },
        },
        {
          kyHieu: '\\min(0, r_t - r_f)',
          moTa: {
            vi: 'chỉ khác 0 ở ba năm dưới ngưỡng, năm 4, 6 và 8: −12, −1 và −11',
            en: 'is non-zero only in the three years below the threshold, years 4, 6 and 8: −12, −1 and −11',
          },
        },
        {
          kyHieu: 'n',
          moTa: {
            vi: 'là 8 năm, kể cả những năm trên ngưỡng',
            en: 'is 8 years, including the years above the threshold',
          },
        },
        {
          kyHieu: 'm',
          moTa: { vi: 'là 1, vì dữ liệu theo năm', en: 'is 1, because the data are yearly' },
        },
      ],
    },
    source: {
      url: 'https://hub.algotrade.vn/knowledge-hub/ty-le-sortino/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q470',
    formulaId: 'ty-so-thang-thua',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Từ giá đóng cửa cổ phiếu MWG trên lịch sử giá của CafeF, lợi suất sáu phiên gần nhất tính đến 24/09/2026 (giá đóng cửa chia giá đóng cửa phiên trước rồi trừ 1, làm tròn hai chữ số thập phân) được ghi ở bảng dưới. Ô Ngưỡng bỏ qua phiên đi ngang đặt h = 0,5%: phiên nào tăng hoặc giảm không quá 0,5% bị coi là đi ngang và không vào vế nào. Hãy đặt đúng năm lợi suất vào năm ô trống của công thức Tỷ số thắng/thua: tử số nhận các phiên tăng, mẫu số nhận các phiên giảm, trong mỗi vế xếp từ phiên mới đến phiên cũ như thứ tự trong bảng, và chép nguyên dấu cộng trừ. Chú ý so từng phiên với ngưỡng theo độ lớn: một phiên giảm nhẹ vẫn có thể là phiên đi ngang, còn phiên chỉ nhỉnh hơn ngưỡng một chút thì vẫn được tính.',
      en: "From MWG closing prices on CafeF's price history, the returns of the six most recent sessions up to 2026-09-24 (the close divided by the previous close, minus 1, rounded to two decimals) are listed below. The flat-session threshold field is set to h = 0.5%: a session that rises or falls by no more than 0.5% counts as flat and goes into neither side. Put the right five returns into the five slots of the win/loss ratio formula: the numerator takes the rising sessions, the denominator takes the falling sessions, each side ordered from the newest session to the oldest as in the table, with the sign copied as shown. Compare each session with the threshold by size: a small drop can still be a flat session, while a session only just past the threshold still counts.",
    },
    facts: [
      {
        label: { vi: 'Ngưỡng bỏ qua phiên đi ngang (h)', en: 'Flat-session threshold (h)' },
        value: { vi: '0,5%', en: '0.5%' },
      },
      {
        label: { vi: 'Lợi suất MWG phiên 24/09/2026', en: 'MWG return on 2026-09-24' },
        value: { vi: '−0,41%', en: '−0.41%' },
      },
      {
        label: { vi: 'Lợi suất MWG phiên 23/09/2026', en: 'MWG return on 2026-09-23' },
        value: { vi: '+0,55%', en: '+0.55%' },
      },
      {
        label: { vi: 'Lợi suất MWG phiên 22/09/2026', en: 'MWG return on 2026-09-22' },
        value: { vi: '+1,53%', en: '+1.53%' },
      },
      {
        label: { vi: 'Lợi suất MWG phiên 21/09/2026', en: 'MWG return on 2026-09-21' },
        value: { vi: '−1,10%', en: '−1.10%' },
      },
      {
        label: { vi: 'Lợi suất MWG phiên 18/09/2026', en: 'MWG return on 2026-09-18' },
        value: { vi: '−0,82%', en: '−0.82%' },
      },
      {
        label: { vi: 'Lợi suất MWG phiên 17/09/2026', en: 'MWG return on 2026-09-17' },
        value: { vi: '+2,24%', en: '+2.24%' },
      },
    ],
    expected: 1.5,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'Tỷ số thắng/thua = (([0,55] + [1,53] + [2,24]) ÷ 3) ÷ |([−1,10] + [−0,82]) ÷ 2|',
      en: 'Win/loss ratio = (([0.55] + [1.53] + [2.24]) ÷ 3) ÷ |([−1.10] + [−0.82]) ÷ 2|',
    },
    explain: {
      vi: 'Với ngưỡng h = 0,5%, phiên 24/09 giảm 0,41% nằm trong khoảng cộng trừ 0,5% nên là phiên đi ngang, không vào vế nào; phiên 23/09 tăng 0,55% thì vượt ngưỡng nên vẫn là phiên tăng. Tử số là bình quân ba phiên tăng: (0,55 + 1,53 + 2,24) ÷ 3 = 1,44%. Mẫu số là bình quân hai phiên giảm: (−1,10 − 0,82) ÷ 2 = −0,96%, lấy trị tuyệt đối còn 0,96%. Tỷ số ra 1,44 ÷ 0,96 = 1,5 lần: một phiên tăng bình quân lớn gấp rưỡi một phiên giảm bình quân. Bẫy thứ nhất là đưa phiên −0,41% vào mẫu số: bình quân ba phiên giảm còn khoảng 0,78% và tỷ số phình lên khoảng 1,85 lần, vì một phiên gần như đứng yên kéo mức giảm bình quân xuống. Bẫy thứ hai là loại nhầm phiên +0,55% vì nó sát ngưỡng: bình quân hai phiên tăng còn lại là 1,885% và tỷ số vọt lên khoảng 1,96 lần. Để kiểm lại một dòng trong bảng: phiên 23/09 đóng cửa 73.200 ₫ sau phiên 22/09 đóng cửa 72.800 ₫, nên lợi suất là 73.200 ÷ 72.800 − 1, xấp xỉ +0,55%.',
      en: 'With the threshold at h = 0.5%, the 0.41% drop on September 24 lies within plus or minus 0.5%, so it is a flat session and goes into neither side; the 0.55% gain on September 23 is past the threshold, so it still counts as a rising session. The numerator is the average of the three rising sessions: (0.55 + 1.53 + 2.24) ÷ 3 = 1.44%. The denominator is the average of the two falling sessions: (−1.10 − 0.82) ÷ 2 = −0.96%, which becomes 0.96% once the absolute value is taken. The ratio is 1.44 ÷ 0.96 = 1.5x: an average rising session is one and a half times the size of an average falling one. The first trap is putting the −0.41% session in the denominator: the average of three falling sessions shrinks to about 0.78% and the ratio swells to about 1.85x, because a nearly motionless session drags the average loss down. The second trap is dropping the +0.55% session because it sits close to the threshold: the two remaining rising sessions average 1.885% and the ratio jumps to about 1.96x. To check one line of the table: the September 23 session closed at 73200 ₫ after a September 22 close of 72800 ₫, so the return is 73200 ÷ 72800 − 1, about +0.55%.',
    },
    giai: {
      tinh: {
        vi: 'Tỷ số thắng/thua của MWG qua sáu phiên tới 24/09/2026',
        en: "MWG's win/loss ratio over the six sessions to 2026-09-24",
      },
      thaySo: {
        vi: '((0,55 + 1,53 + 2,24) ÷ 3) ÷ |(−1,10 + −0,82) ÷ 2|',
        en: '((0.55 + 1.53 + 2.24) ÷ 3) ÷ |(−1.10 + −0.82) ÷ 2|',
      },
      ketQua: { vi: '1,5 lần', en: '1.5 x' },
      gan: [
        {
          kyHieu: '\\overline{r^{+}}_h',
          moTa: {
            vi: 'là bình quân 3 phiên tăng vượt ngưỡng 0,5%: 0,55%, 1,53% và 2,24%',
            en: 'is the average of the 3 up sessions beyond the 0.5% threshold: 0.55%, 1.53% and 2.24%',
          },
        },
        {
          kyHieu: '\\overline{r^{-}}_h',
          moTa: {
            vi: 'là bình quân 2 phiên giảm vượt ngưỡng: −1,10% và −0,82%',
            en: 'is the average of the 2 down sessions beyond the threshold: −1.10% and −0.82%',
          },
        },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=MWG&StartDate=09/16/2026&EndDate=09/24/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q471',
    formulaId: 'var-lich-su',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Ví dụ thực tế trên trang tính VaR lịch sử 95% cho một danh mục bám VN-Index từ 71 giá đóng cửa ngày 04/06 đến 15/09/2026 lấy từ Investing.com, tức 70 lợi suất phiên. Theo cách tính của trang, phân vị mức 5% nằm ở vị trí h = (70 − 1) × (1 − 0,95) = 3,45 trên chuỗi lợi suất xếp tăng dần, nên phải nội suy giữa vị trí 3 và vị trí 4 với phần lẻ 0,45. Bảng số liệu có sáu lợi suất thấp nhất. Hãy đặt đúng ba con số vào ô trống của công thức VaR, chú ý vị trí đếm từ 0 ở lợi suất thấp nhất, và lợi suất ở vị trí 3 xuất hiện hai lần.',
      en: "The page's own worked example computes a 95% historical VaR for a portfolio tracking the VN-Index from 71 closes between 2026-06-04 and 2026-09-15 taken from Investing.com, that is, 70 session returns. Under the page's method, the 5% percentile sits at position h = (70 − 1) × (1 − 0.95) = 3.45 in the returns sorted in ascending order, so it is interpolated between position 3 and position 4 with a fractional part of 0.45. The table lists the six lowest returns. Put the right three numbers into the slots of the VaR formula, noting that positions are counted from 0 at the lowest return, and that the return at position 3 appears twice.",
    },
    facts: [
      {
        label: { vi: 'Chuỗi dùng để tính', en: 'Series used' },
        value: {
          vi: '71 giá đóng cửa VN-Index từ 04/06 đến 15/09/2026, tức 70 lợi suất phiên',
          en: '71 VN-Index closes from 2026-06-04 to 2026-09-15, that is, 70 session returns',
        },
      },
      {
        label: { vi: 'Độ tin cậy', en: 'Confidence level' },
        value: { vi: '95%', en: '95%' },
      },
      {
        label: {
          vi: 'Vị trí phân vị h = (70 − 1) × (1 − 0,95), đếm từ 0 ở lợi suất thấp nhất',
          en: 'Percentile position h = (70 − 1) × (1 − 0.95), counted from 0 at the lowest return',
        },
        value: {
          vi: '3,45, gồm phần nguyên 3 và phần lẻ 0,45',
          en: '3.45, a whole part of 3 and a fractional part of 0.45',
        },
      },
      {
        label: {
          vi: 'Sáu lợi suất phiên thấp nhất, xếp tăng dần, dạng thập phân',
          en: 'The six lowest session returns, sorted in ascending order, as decimals',
        },
        value: {
          vi: '−0,0358; −0,0263; −0,0246; −0,0207; −0,0186; −0,0170',
          en: '−0.0358; −0.0263; −0.0246; −0.0207; −0.0186; −0.0170',
        },
      },
    ],
    expected: 1.9755,
    tolerance: { kind: 'tuyet-doi', value: 0.005 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'VaR 95% = −([−0,0207] + 0,45 × ([−0,0186] − [−0,0207])) × 100',
      en: 'VaR 95% = −([−0.0207] + 0.45 × ([−0.0186] − [−0.0207])) × 100',
    },
    explain: {
      vi: 'Đếm từ 0 ở lợi suất thấp nhất thì vị trí 3 là lợi suất thấp thứ tư, −0,0207, còn vị trí 4 là −0,0186. Phân vị nằm 0,45 đoạn đường từ số thứ nhất sang số thứ hai, nên −0,0207 đứng hai chỗ: làm điểm xuất phát và làm số bị trừ trong khoảng cách giữa hai quan sát. Dấu trừ đằng trước đổi phân vị âm thành mức lỗ dương: −(−0,0207 + 0,45 × 0,0021) × 100 ra 1,9755%, đúng con số của ví dụ trên trang. Cái bẫy là đếm từ 1: lấy nhầm −0,0246 và −0,0207 thì ngưỡng phình lên 2,28%. Phiên tệ nhất −0,0358 cũng không phải VaR, nó chỉ là một trong bốn phiên lỗ nặng hơn ngưỡng, và VaR nói ngưỡng chứ không nói mức lỗ nặng nhất.',
      en: "Counting from 0 at the lowest return, position 3 is the fourth-lowest return, −0.0207, and position 4 is −0.0186. The percentile sits 0.45 of the way from the first to the second, so −0.0207 appears in two places: as the starting point and as the number subtracted in the gap between the two observations. The leading minus sign turns the negative percentile into a positive loss: −(−0.0207 + 0.45 × 0.0021) × 100 gives 1.9755%, exactly the figure in the page's example. The trap is counting from 1: picking −0.0246 and −0.0207 by mistake inflates the threshold to 2.28%. The worst session, −0.0358, is not the VaR either; it is just one of the four sessions that lost more than the threshold, and VaR states a threshold, not the heaviest loss.",
    },
    giai: {
      tinh: {
        vi: 'Ngưỡng lỗ một phiên VaR 95% của danh mục bám VN-Index',
        en: 'The one-session 95% VaR of the VN-Index-tracking portfolio',
      },
      thaySo: {
        vi: '−(−0,0207 + 0,45 × (−0,0186 − −0,0207)) × 100',
        en: '−(−0.0207 + 0.45 × (−0.0186 − −0.0207)) × 100',
      },
      ketQua: { vi: '1,98 %', en: '1.98 %' },
      gan: [
        { kyHieu: '\\alpha', moTa: { vi: 'là độ tin cậy 95%', en: 'is the 95% confidence level' } },
        {
          kyHieu: 'r',
          moTa: {
            vi: 'là hai lợi suất kẹp vị trí 3,45 khi xếp tăng dần: −0,0207 và −0,0186; lấy thêm 0,45 phần khoảng cách giữa chúng',
            en: 'is the two returns around position 3.45 in ascending order: −0.0207 and −0.0186, plus 0.45 of the gap between them',
          },
        },
      ],
    },
    source: {
      url: 'https://vn.investing.com/indices/vn-historical-data',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q472',
    formulaId: 'vwap',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bảng lịch sử giao dịch của CafeF tách khối lượng mỗi phiên của FPT làm hai cột: khớp lệnh và thỏa thuận. Giá đóng cửa hình thành từ các lệnh khớp, còn giao dịch thỏa thuận là những giao dịch hai bên tự thỏa thuận giá với nhau, không qua khớp lệnh. Bạn cần VWAP gộp hai phiên gần nhất, 23/09 và 24/09/2026, theo đúng công thức của trang: giá đóng cửa mỗi phiên nhân với khối lượng khớp của chính phiên ấy, rồi chia cho tổng khối lượng khớp. Hai giá đóng cửa đã in sẵn trong công thức; hãy đặt đúng bốn con số vào ô trống, chú ý mỗi khối lượng xuất hiện hai lần, một lần cạnh giá của phiên mình ở tử số và một lần ở mẫu số, và cột thỏa thuận không thuộc công thức này.',
      en: "CafeF's trading history splits each FPT session's volume into two columns: matched orders and put-through deals. The closing price comes out of order matching, while put-through deals are trades whose price the two parties negotiate between themselves, outside order matching. You need the VWAP pooling the two latest sessions, 2026-09-23 and 2026-09-24, exactly as this page defines it: each session's closing price times that same session's matched volume, divided by the total matched volume. The two closing prices are already printed in the formula; put the right four numbers into the slots, noting that each volume appears twice, once next to its own session's price in the numerator and once in the denominator, and that the put-through column does not belong in this formula.",
    },
    facts: [
      {
        label: { vi: 'Giá đóng cửa FPT phiên 23/09/2026', en: 'FPT closing price on 2026-09-23' },
        value: { vi: '66.100 ₫', en: '66100 ₫' },
      },
      {
        label: { vi: 'Khối lượng khớp lệnh phiên 23/09/2026', en: 'Matched volume on 2026-09-23' },
        value: { vi: '3.557.500 cổ phiếu', en: '3557500 shares' },
      },
      {
        label: {
          vi: 'Khối lượng thỏa thuận phiên 23/09/2026',
          en: 'Put-through volume on 2026-09-23',
        },
        value: { vi: '1.297.000 cổ phiếu', en: '1297000 shares' },
      },
      {
        label: { vi: 'Giá đóng cửa FPT phiên 24/09/2026', en: 'FPT closing price on 2026-09-24' },
        value: { vi: '65.300 ₫', en: '65300 ₫' },
      },
      {
        label: { vi: 'Khối lượng khớp lệnh phiên 24/09/2026', en: 'Matched volume on 2026-09-24' },
        value: { vi: '4.350.900 cổ phiếu', en: '4350900 shares' },
      },
      {
        label: {
          vi: 'Khối lượng thỏa thuận phiên 24/09/2026',
          en: 'Put-through volume on 2026-09-24',
        },
        value: { vi: '1.431.463 cổ phiếu', en: '1431463 shares' },
      },
      {
        label: { vi: 'Giá trị thỏa thuận phiên 24/09/2026', en: 'Put-through value on 2026-09-24' },
        value: { vi: '101,2 tỷ ₫', en: '101.2 billion ₫' },
      },
    ],
    expected: 65659.87,
    tolerance: { kind: 'tuong-doi', value: 0.001 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'VWAP = (66.100 × [3.557.500] + 65.300 × [4.350.900]) ÷ ([3.557.500] + [4.350.900])',
      en: 'VWAP = (66100 × [3557500] + 65300 × [4350900]) ÷ ([3557500] + [4350900])',
    },
    explain: {
      vi: 'VWAP của trang gộp theo phiên: mỗi giá đóng cửa đi cùng khối lượng khớp của chính phiên ấy, và tổng các khối lượng đó nằm ở mẫu số. Vì thế 3.557.500 đứng cạnh 66.100 ₫ của phiên 23/09, 4.350.900 đứng cạnh 65.300 ₫ của phiên 24/09, rồi cả hai lặp lại dưới mẫu số: (66.100 × 3.557.500 + 65.300 × 4.350.900) ÷ (3.557.500 + 4.350.900) ra khoảng 65.660 ₫, thấp hơn trung bình cộng 65.700 ₫ vì phiên 24/09 khớp nhiều hơn. Bẫy thứ nhất là cột thỏa thuận: cùng bảng ấy ghi 1.431.463 cổ phiếu thỏa thuận phiên 24/09 trị giá 101,2 tỷ ₫, tức khoảng 70.700 ₫ một cổ phiếu, nên ghép khối lượng ấy với giá đóng cửa 65.300 ₫ là gán cho nó một mức giá nó không hề giao dịch. Bẫy thứ hai là đổi chỗ hai khối lượng khớp: kết quả thành khoảng 65.740 ₫, nghiêng về giá của phiên khớp ít hơn.',
      en: "This page's VWAP pools by session: each closing price travels with that same session's matched volume, and the sum of those volumes sits in the denominator. So 3557500 goes next to the 66100 ₫ of 2026-09-23, 4350900 goes next to the 65300 ₫ of 2026-09-24, and both repeat in the denominator: (66100 × 3557500 + 65300 × 4350900) ÷ (3557500 + 4350900) gives about 65660 ₫, below the plain average of 65700 ₫ because more shares matched on 2026-09-24. The first trap is the put-through column: the same table records 1431463 put-through shares on 2026-09-24 worth 101.2 billion ₫, about 70700 ₫ a share, so pairing that volume with the 65300 ₫ close assigns it a price it never traded at. The second trap is swapping the two matched volumes: the result becomes about 65740 ₫, tilted toward the price of the session that matched fewer shares.",
    },
    giai: {
      tinh: {
        vi: 'VWAP gộp hai phiên 23/09 và 24/09/2026 của FPT',
        en: "FPT's VWAP pooling the 2026-09-23 and 2026-09-24 sessions",
      },
      thaySo: {
        vi: '(66.100 × 3.557.500 + 65.300 × 4.350.900) ÷ (3.557.500 + 4.350.900)',
        en: '(66100 × 3557500 + 65300 × 4350900) ÷ (3557500 + 4350900)',
      },
      ketQua: { vi: '65.659,87 ₫', en: '65659.87 ₫' },
      gan: [
        {
          kyHieu: 'C_i',
          moTa: {
            vi: 'là giá đóng cửa: 66.100 ₫ phiên 23/09 và 65.300 ₫ phiên 24/09',
            en: 'is the close: 66100 ₫ on 23/09 and 65300 ₫ on 24/09',
          },
        },
        {
          kyHieu: 'V_i',
          moTa: {
            vi: 'là khối lượng khớp lệnh: 3.557.500 cổ phiếu phiên 23/09 và 4.350.900 cổ phiếu phiên 24/09',
            en: 'is the matched volume: 3557500 shares on 23/09 and 4350900 shares on 24/09',
          },
        },
      ],
    },
    source: {
      url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/23/2026&EndDate=09/24/2026&PageIndex=1&PageSize=20',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q473',
    formulaId: 'xirr',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Trang hướng dẫn hàm XIRR của Microsoft có một ví dụ mẫu: chi 10.000 ngày 01/01/2008, rồi thu về 2.750 ngày 01/03/2008, 4.250 ngày 30/10/2008, 3.250 ngày 15/02/2009 và 2.750 ngày 01/04/2009; hàm trả về 37,34%/năm. Bảng mẫu không ghi đơn vị tiền, ở đây đọc là nghìn đồng. Dòng công thức bên dưới đã điền sẵn năm dòng tiền theo thứ tự ngày và XIRR 0,3734, dòng tiền đầu tiên có số ngày bằng 0, nên chỉ còn trống số ngày của bốn lần thu tiền. Bảng số liệu đếm số ngày theo hai cách mà công thức chỉ nhận một cách. Hãy đặt đúng bốn con số vào bốn ô để tổng quy về ngày đầu bằng 0.',
      en: "Microsoft's help page for the XIRR function has a sample: pay out 10000 on 2008-01-01, then receive 2750 on 2008-03-01, 4250 on 2008-10-30, 3250 on 2009-02-15 and 2750 on 2009-04-01; the function returns 37.34%/year. The sample gives no currency, so read it here as thousands of dong. The line below already holds the five cash flows in date order and the XIRR of 0.3734, and the first cash flow has a day count of 0, so only the day counts of the four receipts are blank. The table counts days in two ways and the formula accepts only one. Put the right four numbers into the four slots so that the sum discounted to day one comes to 0.",
    },
    facts: [
      {
        label: {
          vi: 'Dòng tiền ngày 01/01/2008, chi ra lúc bắt đầu',
          en: 'Cash flow on 2008-01-01, paid out at the start',
        },
        value: { vi: '−10.000 nghìn ₫', en: '−10000 thousand ₫' },
      },
      {
        label: { vi: 'Dòng tiền ngày 01/03/2008', en: 'Cash flow on 2008-03-01' },
        value: { vi: '2.750 nghìn ₫', en: '2750 thousand ₫' },
      },
      {
        label: { vi: 'Dòng tiền ngày 30/10/2008', en: 'Cash flow on 2008-10-30' },
        value: { vi: '4.250 nghìn ₫', en: '4250 thousand ₫' },
      },
      {
        label: { vi: 'Dòng tiền ngày 15/02/2009', en: 'Cash flow on 2009-02-15' },
        value: { vi: '3.250 nghìn ₫', en: '3250 thousand ₫' },
      },
      {
        label: { vi: 'Dòng tiền ngày 01/04/2009', en: 'Cash flow on 2009-04-01' },
        value: { vi: '2.750 nghìn ₫', en: '2750 thousand ₫' },
      },
      {
        label: { vi: 'XIRR hàm Excel trả về', en: 'XIRR returned by the Excel function' },
        value: { vi: '37,34%/năm, tức 0,3734', en: '37.34%/year, that is 0.3734' },
      },
      {
        label: {
          vi: 'Số ngày kể từ 01/01/2008 tới từng lần thu tiền, theo thứ tự ngày',
          en: 'Days from 2008-01-01 to each receipt, in date order',
        },
        value: { vi: '60; 303; 411; 456', en: '60; 303; 411; 456' },
      },
      {
        label: {
          vi: 'Số ngày kể từ lần có dòng tiền liền trước, theo thứ tự ngày',
          en: 'Days since the previous cash flow, in date order',
        },
        value: { vi: '60; 243; 108; 45', en: '60; 243; 108; 45' },
      },
    ],
    expected: 0,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: 'nghìn ₫', en: 'thousand ₫' },
    worked: {
      vi: 'Tổng quy về ngày đầu = −10.000 ÷ (1 + 0,3734)^(0 ÷ 365) + 2.750 ÷ (1 + 0,3734)^([60] ÷ 365) + 4.250 ÷ (1 + 0,3734)^([303] ÷ 365) + 3.250 ÷ (1 + 0,3734)^([411] ÷ 365) + 2.750 ÷ (1 + 0,3734)^([456] ÷ 365)',
      en: 'Sum discounted to day one = −10000 ÷ (1 + 0.3734)^(0 ÷ 365) + 2750 ÷ (1 + 0.3734)^([60] ÷ 365) + 4250 ÷ (1 + 0.3734)^([303] ÷ 365) + 3250 ÷ (1 + 0.3734)^([411] ÷ 365) + 2750 ÷ (1 + 0.3734)^([456] ÷ 365)',
    },
    explain: {
      vi: 'Trong công thức XIRR, d_i là số ngày tính từ dòng tiền ĐẦU TIÊN, nên mọi lần thu tiền đều đếm từ 01/01/2008: 60, 303, 411 và 456 ngày, và cả năm phân số cùng quy về một mốc chung là ngày bỏ tiền ra. Đặt đúng như vậy thì tổng chỉ còn −0,22 nghìn đồng, phần lẻ do làm tròn 0,373362535 thành 0,3734, nghĩa là 37,34%/năm đúng là nghiệm. Cái bẫy là dãy đếm từ lần liền trước (60; 243; 108; 45): đó là cách nghĩ của IRR theo kỳ, nhưng mỗi khoản thu bị chiết khấu quá ít ngày nên tổng lệch lên khoảng 1.654 nghìn đồng, và XIRR giải ra từ dãy ấy vọt lên gần 120%/năm. Số 60 có mặt ở cả hai dãy chỉ vì lần thu đầu tiên cách ngày đầu đúng 60 ngày.',
      en: 'In the XIRR formula, d_i is the number of days counted from the FIRST cash flow, so every receipt is counted from 2008-01-01: 60, 303, 411 and 456 days, and all five fractions are brought back to one common anchor, the day the money went in. Placed that way, the sum is only −0.22 thousand dong, a leftover from rounding 0.373362535 to 0.3734, which means 37.34%/year really is the root. The trap is the row counted from the previous cash flow (60; 243; 108; 45): that is the per-period thinking of ordinary IRR, but each receipt is then discounted over too few days, so the sum drifts up to about 1654 thousand dong, and the XIRR solved from that row jumps to almost 120%/year. The number 60 shows up in both rows only because the first receipt falls exactly 60 days after day one.',
    },
    giai: {
      tinh: {
        vi: 'Tổng năm dòng tiền quy về ngày 01/01/2008 ở mức XIRR 37,34%/năm',
        en: 'The sum of the five cash flows discounted to 2008-01-01 at an XIRR of 37.34%/year',
      },
      thaySo: {
        vi: '−10.000 ÷ (1 + 0,3734)^(0 ÷ 365) + 2.750 ÷ (1 + 0,3734)^(60 ÷ 365) + 4.250 ÷ (1 + 0,3734)^(303 ÷ 365) + 3.250 ÷ (1 + 0,3734)^(411 ÷ 365) + 2.750 ÷ (1 + 0,3734)^(456 ÷ 365)',
        en: '−10000 ÷ (1 + 0.3734)^(0 ÷ 365) + 2750 ÷ (1 + 0.3734)^(60 ÷ 365) + 4250 ÷ (1 + 0.3734)^(303 ÷ 365) + 3250 ÷ (1 + 0.3734)^(411 ÷ 365) + 2750 ÷ (1 + 0.3734)^(456 ÷ 365)',
      },
      ketQua: { vi: '0 nghìn ₫', en: '0 thousand ₫' },
      gan: [
        {
          kyHieu: 'XIRR',
          moTa: {
            vi: 'là mức Excel trả về: 0,3734, tức 37,34% một năm',
            en: 'is the rate Excel returns: 0.3734, that is 37.34% a year',
          },
        },
        {
          kyHieu: 'CF_i',
          moTa: {
            vi: 'là các dòng tiền theo thứ tự ngày: chi ra 10.000, rồi thu về 2.750, 4.250, 3.250 và 2.750 nghìn ₫',
            en: 'is the cash flows by date: 10000 paid out, then 2750, 4250, 3250 and 2750 thousand ₫ received',
          },
        },
        {
          kyHieu: 'd_i',
          moTa: {
            vi: 'là số ngày tính từ 01/01/2008: 0, 60, 303, 411 và 456',
            en: 'is the number of days counted from 01/01/2008: 0, 60, 303, 411 and 456',
          },
        },
      ],
    },
    source: {
      url: 'https://support.microsoft.com/vi-vn/office/xirr-ha%CC%80m-xirr-de1242ec-6477-445b-b11b-a303ad9adc9d',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
];
