/**
 * Câu hỏi kiểm tra hiểu bài — nhóm Lợi suất & hiệu quả.
 *
 * Mỗi câu gắn một nguồn thật; xem bất biến ở `../types.ts`. Không thêm câu nào vào đây mà
 * không có `source.url` trỏ tới chỗ đọc được điều câu hỏi đang kiểm tra.
 */

import type { QuizItem } from '../types';

export const LOI_SUAT: ReadonlyArray<QuizItem> = [
  {
    id: 'Q127',
    formulaId: 'loi-suat-trung-binh-hinh-hoc',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Năm 1 lãi 50%, năm 2 lỗ 50%. Trung bình cộng bằng 0%. Tài khoản thực tế thế nào?',
    },
    choices: {
      a: { vi: 'Hoà vốn' },
      b: { vi: 'Mất 25%' },
      c: { vi: 'Mất 50%' },
      d: { vi: 'Lãi 25%' },
    },
    answer: 'b',
    explain: {
      vi: 'Tài khoản còn 75, tức MẤT 25%, dù trung bình cộng bằng 0%: 100 lên 150 rồi giảm một nửa còn 75. Cú lỗ 50% ăn vào số tiền đã lớn hơn, nên trung bình cộng luôn nói đẹp hơn thực tế. “+50% and −50% average to 0% but leave you down 25%”, và đây là lý do phải dùng trung bình hình học: “the arithmetic mean is always greater than the geometric mean unless the numbers are identical”.',
      en: 'The account is at 75, DOWN 25%, even though the arithmetic mean is 0%: 100 goes to 150, then halves to 75. The 50% loss bites into a larger balance, which is why the arithmetic mean always reads better than reality. The source: “+50% and −50% average to 0% but leave you down 25%”, and this is why the geometric mean is the right tool: “the arithmetic mean is always greater than the geometric mean unless the numbers are identical”.',
    },
    source: {
      url: 'https://adviceonly.com/glossary/annualized-return',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q128',
    formulaId: 'loi-suat-trung-binh-hinh-hoc',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Cổ phiếu giảm 20% từ 100.000 xuống 80.000 rồi tăng 20%. Giá bây giờ là bao nhiêu?',
    },
    choices: {
      a: { vi: '100.000' },
      b: { vi: '96.000' },
      c: { vi: '104.000' },
      d: { vi: '98.000' },
    },
    answer: 'b',
    explain: {
      vi: 'Còn 96.000 đồng chứ không về lại 100.000: 80.000 nhân 1,2 bằng 96.000, vì mức tăng 20% tính trên số tiền đã nhỏ hơn. Muốn hoà vốn từ mức giảm 20% thì phải tăng 25%. “To break even, the stock would need to appreciate by 25%”. Khoảng cách giữa trung bình cộng và trung bình hình học chính là phần hao hụt do biến động ấy.',
      en: 'It reaches 96,000, not back to 100,000: 80,000 times 1.2 is 96,000, because the 20% gain applies to a smaller base. Recovering from a 20% fall requires a 25% rise. The source: “To break even, the stock would need to appreciate by 25%”. The gap between the arithmetic and geometric means is exactly this volatility drag.',
    },
    source: {
      url: 'https://smartasset.com/advisor-resources/volatility-drag',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q129',
    formulaId: 'loi-suat-trung-binh-hinh-hoc',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Tư vấn viên nói quỹ có “lợi suất trung bình 10%/năm”. Câu hỏi nên đặt ra là gì?',
    },
    choices: {
      a: { vi: 'Quỹ có bao nhiêu tài sản' },
      b: { vi: 'Đó là trung bình cộng hay CAGR — hai con số có thể chênh nhau vài điểm phần trăm' },
      c: { vi: 'Phí quản lý bao nhiêu' },
      d: { vi: 'Ai là người quản lý' },
    },
    answer: 'b',
    explain: {
      vi: "Nên hỏi đó là trung bình cộng hay trung bình hình học, vì hai con số ấy khác nhau và chỉ trung bình hình học mới phản ánh số tiền thực nhận. “Brokers and advisors love to throw out averages because they're technically true”, nhưng “the average rate of return doesn't equal actual rate of return”. Một quỹ quảng cáo trung bình 10% mỗi năm hoàn toàn có thể chỉ thực tăng 7% mỗi năm.",
      en: "Ask whether that is an arithmetic or a geometric average, because the two differ and only the geometric one matches the money actually received. The source: “Brokers and advisors love to throw out averages because they're technically true”, yet “the average rate of return doesn't equal actual rate of return”. A fund advertising a 10% average year can easily have compounded at 7%.",
    },
    source: {
      url: 'https://prosperitythinkers.com/cagr-vs-average-growth-rate/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q130',
    formulaId: 'cagr',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Quỹ có CAGR 12%/năm trong 10 năm. Điều này KHÔNG nói gì?' },
    choices: {
      a: { vi: 'Tốc độ tăng trưởng gộp đều' },
      b: { vi: 'Biến động giữa kỳ và giai đoạn gần đây có kém không' },
      c: { vi: 'Giá trị đầu và cuối kỳ' },
      d: { vi: 'Số năm nắm giữ' },
    },
    answer: 'b',
    explain: {
      vi: 'Nó KHÔNG nói đường đi trong 10 năm ấy ra sao: CAGR san phẳng toàn bộ biến động thành một tốc độ duy nhất, nên một quỹ đi đều và một quỹ sụt 50% rồi hồi lại vẫn có thể cho cùng con số. Kỳ đo càng dài càng che được giai đoạn gần đây kém. “It smooths out the volatility of returns to provide a single growth rate” và “longer time periods smooth out short-term volatility, potentially masking recent underperformance”.',
      en: 'It says NOTHING about the path taken over those ten years: CAGR flattens all the volatility into one rate, so a steady fund and one that halved and recovered can print the same number. The longer the window, the more it can hide a weak recent stretch. The source: “It smooths out the volatility of returns to provide a single growth rate” and “longer time periods smooth out short-term volatility, potentially masking recent underperformance”.',
    },
    source: {
      url: 'https://docs.tradingmetrics.com/en/technical-analysis/trading-metrics/performance-metrics/cagr',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q131',
    formulaId: 'cagr',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Bạn nộp 10 triệu/tháng vào quỹ mở suốt 12 tháng. Dùng CAGR để đo hiệu quả có đúng không?',
    },
    choices: {
      a: { vi: 'Đúng' },
      b: {
        vi: 'Không — CAGR giả định một khoản vốn cố định đầu kỳ; với dòng tiền rải rác phải dùng XIRR',
      },
      c: { vi: 'Đúng nếu số tiền mỗi tháng bằng nhau' },
      d: { vi: 'Đúng nếu nắm trên 3 năm' },
    },
    answer: 'b',
    explain: {
      vi: "Không đúng. CAGR giả định bỏ vào một lần ở đầu kỳ và rút ra ở cuối kỳ, trong khi nộp đều hằng tháng là nhiều dòng tiền vào ở nhiều thời điểm khác nhau, mỗi khoản có số ngày sinh lời riêng. Trường hợp này phải dùng XIRR. “CAGR assumes a fixed investment figure at the start and end of the investment horizon, which is not consistent with the periodic nature of SIPs”, trong khi “XIRR factors in an SIP's irregular investment pattern”.",
      en: "No. CAGR assumes one lump in at the start and one out at the end, while a monthly plan is many inflows at many dates, each compounding for a different length of time. That case needs XIRR. The source: “CAGR assumes a fixed investment figure at the start and end of the investment horizon, which is not consistent with the periodic nature of SIPs”, whereas “XIRR factors in an SIP's irregular investment pattern”.",
    },
    source: {
      url: 'https://www.axismf.com/mutual-fund-knowledge-centre/articles/how-to-assess-mutual-fund-returns',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q132',
    formulaId: 'xirr',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Nộp đều 10 triệu/tháng trong 12 tháng (tổng 120 triệu), cuối năm còn 132 triệu. Bạn tính “lãi 10%/năm”. XIRR thực tế khoảng bao nhiêu?',
    },
    choices: {
      a: { vi: '10%' },
      b: { vi: 'Khoảng 19%' },
      c: { vi: 'Khoảng 5%' },
      d: { vi: 'Khoảng 12%' },
    },
    answer: 'b',
    explain: {
      vi: 'Khoảng 19% một năm, không phải 10%. Con số 10% là lợi suất tuyệt đối trên tổng tiền đã nộp, trong khi phần lớn các khoản nộp chỉ nằm trong quỹ vài tháng, nên quy về lợi suất năm thì cao gần gấp đôi. Nguồn nêu đúng ví dụ này: “Absolute Return - 10%... XIRR - ~ 19% (annualized return considering the timing of each SIP instalment)”.',
      en: 'About 19% a year, not 10%. The 10% is an absolute return on total contributions, while most of those contributions were only invested for a few months, so annualizing roughly doubles the figure. The source gives this exact example: “Absolute Return - 10%... XIRR - ~ 19% (annualized return considering the timing of each SIP instalment)”.',
    },
    source: {
      url: 'https://www.kotakmf.com/Information/blogs/absolute-return-vs-xirr',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q133',
    formulaId: 'xirr',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Dòng tiền đổi dấu nhiều hơn một lần (+ + − − − +). IRR sẽ thế nào?' },
    choices: {
      a: { vi: 'Luôn có đúng một nghiệm' },
      b: { vi: 'Có thể có nhiều nghiệm thực, ví dụ vừa 0% vừa 10%' },
      c: { vi: 'Không tính được' },
      d: { vi: 'Bằng trung bình các dòng tiền' },
    },
    answer: 'b',
    explain: {
      vi: 'IRR có thể có NHIỀU nghiệm thực, không chỉ một: mỗi lần dòng tiền đổi dấu là phương trình có thêm một khả năng cắt trục, nên một chuỗi đổi dấu hai lần có thể vừa đúng ở 0% vừa đúng ở 10% mà không có cách nào chọn đúng một trong hai bằng chính công thức. “When the sign of the cash flows changes more than once... the IRR may have multiple real values”, và nêu đúng ví dụ “0% as well as 10%”.',
      en: 'IRR can have SEVERAL real roots, not one: every sign change adds another way the equation can cross zero, so a series that flips twice may be solved by both 0% and 10%, with nothing in the formula to pick between them. The source: “When the sign of the cash flows changes more than once... the IRR may have multiple real values”, giving exactly the example “0% as well as 10%”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Internal_rate_of_return',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q134',
    formulaId: 'irr-nien-kim',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'IRR của dự án là 25%. Giả định ngầm thường được nêu là gì?' },
    choices: {
      a: { vi: 'Lạm phát bằng 0' },
      b: { vi: 'Mọi dòng tiền dương được tái đầu tư ở chính mức 25%' },
      c: { vi: 'Dự án không có rủi ro' },
      d: { vi: 'Thuế suất bằng 0' },
    },
    answer: 'b',
    explain: {
      vi: 'CFI: “it assumes all positive cash flows of a project will be reinvested at the same rate as the project” — điều hiếm khi xảy ra, nên MIRR ra đời để sửa. Lưu ý: giới học thuật còn tranh cãi giả định này có thực sự tồn tại hay không.',
    },
    source: {
      url: 'https://corporatefinanceinstitute.com/resources/valuation/internal-rate-return-irr/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q135',
    formulaId: 'irr-nien-kim',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Vay tiêu dùng 100 triệu, hợp đồng ghi lãi 0,83%/tháng tính trên dư nợ gốc ban đầu, trả góp 12 tháng. Lãi suất hiệu dụng thực tế so với con số ghi trên hợp đồng?',
    },
    choices: {
      a: { vi: 'Bằng nhau' },
      b: { vi: 'Cao gần gấp đôi' },
      c: { vi: 'Thấp hơn' },
      d: { vi: 'Chênh khoảng 10%' },
    },
    answer: 'b',
    explain: {
      vi: 'Phóng sự CafeF: “người vay phải chịu lãi suất gần gấp đôi, trong khi ít khách hàng biết được sự lắt léo này” — vì lãi vẫn tính trên toàn bộ vốn vay ban đầu dù mỗi tháng đã trả bớt gốc. Điều tra Tuổi Trẻ ghi nhận trường hợp lãi suất quy đổi lên tới 49,68%/năm.',
    },
    source: {
      url: 'https://cafef.vn/tai-chinh-ngan-hang/vay-tieu-dung-tin-chap-nguoi-vay-tien-dang-bi-bop-co-200711269846808.chn',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q136',
    formulaId: 'lai-suat-hieu-dung',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Lãi suất danh nghĩa 6%/năm, ghép lãi hằng tháng. Lãi suất hiệu dụng năm (EAR) là bao nhiêu?',
    },
    choices: {
      a: { vi: '6,00%' },
      b: { vi: '6,17%' },
      c: { vi: '6,50%' },
      d: { vi: '7,20%' },
    },
    answer: 'b',
    explain: {
      vi: '6,17% một năm: mỗi tháng cộng 0,5% và lãi tháng trước lại sinh lãi, nên sau 12 tháng hệ số tăng trưởng là 1,005 mũ 12, cao hơn mức danh nghĩa 6%. “a nominal rate of 6% compounded monthly gives an EAR of 6.17%, since each month 0.5% is applied and after 12 months the growth factor is [1.005]^12”. Vì lãi suất hiệu dụng tăng theo tần suất ghép lãi, không so trực tiếp được hai lãi suất danh nghĩa có kỳ ghép lãi khác nhau.',
      en: '6.17% a year: each month adds 0.5% and the previous month interest earns interest too, so after 12 months the growth factor is 1.005 to the 12th, above the 6% nominal. The source: “a nominal rate of 6% compounded monthly gives an EAR of 6.17%, since each month 0.5% is applied and after 12 months the growth factor is [1.005]^12”. Because the effective rate rises with compounding frequency, two nominal rates on different compounding periods cannot be compared directly.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Effective_interest_rate',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q137',
    formulaId: 'lai-suat-hieu-dung',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Khoản vay ghi “APR”. Chữ “annual” có đảm bảo đó là chi phí vay thực của cả năm không?',
    },
    choices: {
      a: { vi: 'Có' },
      b: {
        vi: 'Không — APR danh nghĩa là lãi đơn; APR hiệu dụng gồm phí cộng lãi kép, một khoản phí nhỏ có thể đẩy nó lên rất cao',
      },
      c: { vi: 'Có nếu vay trên 12 tháng' },
      d: { vi: 'Có với ngân hàng, không với công ty tài chính' },
    },
    answer: 'b',
    explain: {
      vi: 'Không đảm bảo. APR danh nghĩa chỉ là lãi đơn quy về một năm, chưa tính phí và chưa tính ghép lãi; APR hiệu dụng mới gộp cả hai. Với khoản vay ngắn ngày, một khoản phí 10 đô trên 100 đô có thể đẩy APR hiệu dụng lên khoảng 435%. “The nominal APR is the simple-interest rate (for a year). The effective APR is the fee+compound interest rate”, và “Despite the word annual in APR, it is not necessarily a direct reference for the interest rate paid on a stable balance over one year”.',
      en: 'It does not. A nominal APR is simple interest scaled to a year, before fees and before compounding; only the effective APR includes both. On a short loan, a 10 fee on 100 can push the effective APR to roughly 435%. The source: “The nominal APR is the simple-interest rate (for a year). The effective APR is the fee+compound interest rate”, and “Despite the word annual in APR, it is not necessarily a direct reference for the interest rate paid on a stable balance over one year”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Annual_percentage_rate',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q138',
    formulaId: 'loi-suat-thuc',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Lãi tiền gửi 10%/năm, lạm phát 25%. Mất bao nhiêu sức mua?' },
    choices: {
      a: { vi: '15%' },
      b: { vi: '12%' },
      c: { vi: '25%' },
      d: { vi: '10%' },
    },
    answer: 'b',
    explain: {
      vi: 'Phép trừ 10 − 25 = −15% chỉ là xấp xỉ. Công thức Fisher chính xác: 1,1/1,25 − 1 = −12%. Nguồn ghi rõ: “the actual loss of purchasing power is exactly 12%”. Phép trừ chỉ gần đúng khi cả lãi suất lẫn lạm phát đều thấp.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Real_interest_rate',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q139',
    formulaId: 'loi-suat-thuc',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Nguồn chính thống ở VN (ngân hàng, tạp chí chuyên ngành) phổ biến công thức nào cho lãi suất thực?',
    },
    choices: {
      a: { vi: 'Công thức Fisher chính xác' },
      b: { vi: 'Phép trừ: lãi suất danh nghĩa − tỷ lệ lạm phát' },
      c: { vi: 'Chia cho chỉ số CPI' },
      d: { vi: 'Nhân với hệ số điều chỉnh' },
    },
    answer: 'b',
    explain: {
      vi: 'VPBank: “Lãi suất thực = Lãi suất danh nghĩa – Tỷ lệ lạm phát”; Tạp chí Thị trường Tài chính Tiền tệ cũng dùng cùng công thức. Đây là trường hợp ngộ nhận được củng cố từ chính nguồn chính thống — app nên hiện cả hai cách tính.',
    },
    source: {
      url: 'https://www.vpbank.com.vn/bi-kip-va-chia-se/corporate-story-and-tips/corporate-sat-category/lai-suat-danh-nghia',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q140',
    formulaId: 'thoi-gian-nhan-doi',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Quy tắc 72 chính xác nhất ở vùng lãi suất nào?' },
    choices: {
      a: { vi: 'Mọi mức lãi suất' },
      b: { vi: 'Khoảng 6–10%, chuẩn nhất quanh 8%' },
      c: { vi: 'Dưới 3%' },
      d: { vi: 'Trên 20%' },
    },
    answer: 'b',
    explain: {
      vi: 'Chính xác nhất quanh mức lãi 8% một kỳ, và càng lệch xa mốc ấy sai số càng lớn, nhất là về phía lãi suất cao. Lãi suất thấp nên đổi tử số sang 69,3, lãi suất cao thì 78 sát hơn. “the rule of 72 is most accurate for periodically compounded interests around 8%” và “the approximations are less accurate at higher interest rates”.',
      en: 'Most accurate around 8% a period, with the error growing the further you move from that point, especially toward higher rates. At low rates swap the numerator for 69.3, at high rates 78 fits better. The source: “the rule of 72 is most accurate for periodically compounded interests around 8%” and “the approximations are less accurate at higher interest rates”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Rule_of_72',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q141',
    formulaId: 'roi',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Hai khoản đầu tư cùng ROI 25%. Thông tin còn thiếu là gì?' },
    choices: {
      a: { vi: 'Số tiền đầu tư' },
      b: { vi: 'Thời gian nắm giữ — ROI không chứa yếu tố thời gian' },
      c: { vi: 'Ngành nghề' },
      d: { vi: 'Phí giao dịch' },
    },
    answer: 'b',
    explain: {
      vi: 'Thiếu THỜI GIAN. ROI chỉ nói lãi bao nhiêu phần trăm trên vốn bỏ ra, không nói mất bao lâu, nên 25% trong 5 ngày và 25% trong 5 năm hiện ra y như nhau dù khác hẳn nhau về hiệu quả. Muốn so sánh thì phải quy về cùng một khung thời gian, chẳng hạn bằng CAGR. CFI: “The ROI Formula Disregards the Factor of Time”, và “a return of 25% over 5 years is expressed the same way as a return of 25% over 5 days”.',
      en: 'TIME is missing. ROI states the percentage gained on the capital put in but not how long it took, so 25% over five days and 25% over five years look identical while being nothing alike. Comparing them requires putting both on the same time frame, for instance via CAGR. CFI: “The ROI Formula Disregards the Factor of Time”, and “a return of 25% over 5 years is expressed the same way as a return of 25% over 5 days”.',
    },
    source: {
      url: 'https://corporatefinanceinstitute.com/resources/accounting/return-on-investment-roi-formula',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q142',
    formulaId: 'hpr',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Danh mục lãi 8% trong một quý. Có nên công bố “hơn 36%/năm” không?' },
    choices: {
      a: { vi: 'Nên, đó là cách quy chuẩn' },
      b: { vi: 'Không — chuẩn mực đo hiệu quả khuyến cáo không năm hoá kỳ dưới một năm' },
      c: { vi: 'Nên nếu ghi chú rõ' },
      d: { vi: 'Nên với quỹ mở' },
    },
    answer: 'b',
    explain: {
      vi: 'Không nên. Nhân một quý lên thành cả năm là ngầm khẳng định ba quý còn lại cũng sẽ lãi như thế, điều không ai biết được. Chuẩn đo hiệu quả đầu tư cấm hẳn việc này: “Returns for periods of less than one year must not be annualized”, vì làm vậy “might be interpreted as suggesting that the rest of the year is most likely to have the same rate of return”. Cách nói gọn của một nguồn khác: con số ấy “technically defined and practically misleading”.',
      en: 'No. Scaling one quarter up to a year quietly claims the other three will do the same, which nobody knows. The performance standards forbid it outright: “Returns for periods of less than one year must not be annualized”, because doing so “might be interpreted as suggesting that the rest of the year is most likely to have the same rate of return”. As another source puts it, the figure is “technically defined and practically misleading”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Rate_of_return',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q143',
    formulaId: 'loi-suat-nam-hoa',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Vì sao năm hoá một kỳ ngắn lại gây hiểu nhầm mạnh nhất với lợi suất cao?' },
    choices: {
      a: { vi: 'Do làm tròn' },
      b: {
        vi: 'Vì phép năm hoá nhân chồng, ngầm giả định phần còn lại của năm cũng sinh lời như thế',
      },
      c: { vi: 'Do phí giao dịch' },
      d: { vi: 'Do thuế' },
    },
    answer: 'b',
    explain: {
      vi: 'Vì phép năm hoá nhân sai số lên theo luỹ thừa: lợi suất kỳ ngắn càng cao thì con số quy năm càng phóng đại, và một kỳ vài tuần thì chưa đủ dữ liệu để tin rằng tốc độ ấy giữ được cả năm. Chuẩn đo hiệu quả đầu tư nói thẳng: “Investment performance professionals generally advise against quoting annualized return over a holding period of less than a year”.',
      en: 'Because annualizing compounds the error: the higher the short-period return, the more the annualized figure exaggerates, and a few weeks is nowhere near enough evidence that the pace holds for a year. The performance standards say it plainly: “Investment performance professionals generally advise against quoting annualized return over a holding period of less than a year”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Holding_period_return',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q144',
    formulaId: 'loi-suat-quy-nam-theo-ngay',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Quy ước đếm ngày Actual/360 so với 30/360 ảnh hưởng thế nào tới người vay?' },
    choices: {
      a: { vi: 'Không khác gì' },
      b: { vi: 'Trả thêm lãi của 5–6 ngày mỗi năm, và gốc giảm chậm hơn' },
      c: { vi: 'Trả ít lãi hơn' },
      d: { vi: 'Chỉ ảnh hưởng năm nhuận' },
    },
    answer: 'b',
    explain: {
      vi: "Actual/360 tính lãi trên số ngày thực nhưng chia cho 360, nên mỗi năm người vay trả thêm lãi của 5 đến 6 ngày so với quy ước 30/360, và phần gốc giảm chậm hơn một chút nên dư nợ còn lại cao hơn khoảng 1 đến 2%. “the borrower is paying interest for 5 or 6 additional days a year as compared to the 30/360 day count convention”, và “the loan's principal is reduced at a slightly lower rate”.",
      en: "Actual/360 charges interest on the real number of days but divides by 360, so each year the borrower pays an extra 5 or 6 days of interest compared with 30/360, and principal amortizes slightly more slowly, leaving the balance about 1 to 2% higher. The source: “the borrower is paying interest for 5 or 6 additional days a year as compared to the 30/360 day count convention”, and “the loan's principal is reduced at a slightly lower rate”.",
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Day_count_convention',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q145',
    formulaId: 'tong-loi-suat-tai-dau-tu',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Bạn tính lợi suất quỹ bằng phần trăm thay đổi của giá. Sai sót là gì?' },
    choices: {
      a: { vi: 'Quên trừ phí' },
      b: { vi: 'Bỏ qua cổ tức và lãi được tái đầu tư nên khai thiếu lợi suất' },
      c: { vi: 'Quên điều chỉnh lạm phát' },
      d: { vi: 'Quên thuế' },
    },
    answer: 'b',
    explain: {
      vi: 'Sai sót là bỏ mất phần cổ tức và lãi được tái đầu tư: phần trăm thay đổi của giá chỉ đo phần tăng giá, nên kết quả thấp hơn lợi suất thật. Tổng lợi suất mới là thước đo đầy đủ. “Total Return assumes that dividends and interest are reinvested in the funds”, còn cách tính bỏ qua tái đầu tư “slightly understates the total return”.',
      en: 'It drops the dividends and interest that were reinvested: a percentage change in price captures only the capital gain, so the answer comes in below the real return. Total return is the complete measure. The source: “Total Return assumes that dividends and interest are reinvested in the funds”, while the price-only calculation “slightly understates the total return”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Total_return',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q146',
    formulaId: 'loi-suat-vuot-chuan',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Danh mục lãi 20% trong khi chỉ số tham chiếu lãi 15%. Kết luận nào đúng?' },
    choices: {
      a: { vi: 'Chắc chắn có alpha dương' },
      b: { vi: 'Chưa chắc — phải điều chỉnh rủi ro; vị thế quá rủi ro vẫn có thể cho alpha âm' },
      c: { vi: 'Nhà quản lý giỏi' },
      d: { vi: 'Nên tăng tỷ trọng' },
    },
    answer: 'b',
    explain: {
      vi: "Vượt chỉ số 5 điểm phần trăm chưa đủ để kết luận làm tốt: nếu phần vượt ấy đến từ việc gánh rủi ro cao hơn hẳn chỉ số thì alpha điều chỉnh rủi ro vẫn có thể âm. Và bản thân chỉ số tham chiếu cũng phải đại diện đúng cho danh mục mới so được. “although a return of 20% may appear good, the investment can still have a negative alpha if it's involved in an excessively risky position”, và lưu ý “a single stock index might not be representative of the investment's holdings”.",
      en: "Beating the index by 5 percentage points is not enough to call it good: if the excess came from carrying far more risk than the index, risk-adjusted alpha can still be negative. And the benchmark itself has to represent the portfolio before the comparison means anything. The source: “although a return of 20% may appear good, the investment can still have a negative alpha if it's involved in an excessively risky position”, noting that “a single stock index might not be representative of the investment's holdings”.",
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Alpha_(finance)',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q147',
    formulaId: 'ty-suat-co-tuc',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Mua cổ phiếu ngày trước chốt quyền, hôm sau nhận cổ tức 2.000 đồng/cp rồi bán. Có lời chắc chắn không?',
    },
    choices: {
      a: { vi: 'Có' },
      b: {
        vi: 'Không — giá tham chiếu bị điều chỉnh giảm đúng bằng cổ tức, tổng tài sản không đổi',
      },
      c: { vi: 'Có nếu bán ngay trong phiên' },
      d: { vi: 'Có với cổ phiếu vốn hoá lớn' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn đặt đúng câu hỏi này và trả lời: “Không có dòng tiền mới nào được tạo ra, nó chỉ đơn thuần được chuyển từ sổ sách của công ty sang túi của cá nhân bạn” — 28.000 (giá sau điều chỉnh) + 2.000 (tiền mặt) = 30.000 như cũ.',
    },
    source: {
      url: 'https://fesacademy.com.vn/thu-vien-dau-tu/ngay-giao-dich-khong-huong-quyen-la-gi-tai-sao-nhan-co-tuc-xong-gia-co-phieu-lai-giam/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q148',
    formulaId: 'ty-suat-co-tuc',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Tỷ suất cổ tức của một cổ phiếu tăng từ 5% lên 10% trong khi doanh nghiệp giữ nguyên mức cổ tức. Điều gì đã xảy ra?',
    },
    choices: {
      a: { vi: 'Doanh nghiệp làm ăn tốt hơn' },
      b: { vi: 'Giá cổ phiếu đã giảm một nửa — tỷ suất tăng “ảo”' },
      c: { vi: 'Doanh nghiệp tăng cổ tức' },
      d: { vi: 'Số cổ phiếu lưu hành giảm' },
    },
    answer: 'b',
    explain: {
      vi: '“Nếu giá cổ phiếu giảm xuống 25.000 đồng nhưng doanh nghiệp vẫn trả 2.500 đồng, tỷ suất cổ tức trên mức giá mới sẽ tăng lên 10%” — và nếu giá giảm vì kinh doanh suy yếu thì chính mức cổ tức đó cũng khó duy trì. “Dividend Yield cao đôi khi là tín hiệu cần tìm hiểu thêm, chứ không phải tín hiệu mặc nhiên để mua vào”.',
    },
    source: {
      url: 'https://kinhtechungkhoan.vn/chi-so-dividend-yield-co-tuc-cao-khong-dong-nghia-co-phieu-hap-dan',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
];
