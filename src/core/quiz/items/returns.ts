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
      en: 'Year 1 gains 50%, year 2 loses 50%. The arithmetic mean is 0%. What actually happens to the account?',
    },
    choices: {
      a: { vi: 'Hoà vốn', en: 'Breaks even' },
      b: { vi: 'Mất 50%', en: 'Loses 50%' },
      c: { vi: 'Lãi 25%', en: 'Gains 25%' },
      d: { vi: 'Mất 25%', en: 'Loses 25%' },
    },
    answer: 'd',
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
      en: 'A stock falls 20% from 100,000 to 80,000, then rises 20%. What is the price now?',
    },
    choices: {
      a: { vi: '100.000', en: '100,000' },
      b: { vi: '104.000', en: '104,000' },
      c: { vi: '98.000', en: '98,000' },
      d: { vi: '96.000', en: '96,000' },
    },
    answer: 'd',
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
      en: 'An advisor says a fund has an "average return of 10% a year." What question should you ask?',
    },
    choices: {
      a: {
        vi: 'Mức 10% ấy tính theo tháng hay theo năm',
        en: 'Whether that 10% is per month or per year',
      },
      b: { vi: 'Quỹ đang quản lý bao nhiêu tài sản', en: 'How much the fund has under management' },
      c: {
        vi: 'Ai là người trực tiếp điều hành quỹ',
        en: 'Who is personally in charge of running the fund',
      },
      d: {
        vi: 'Đó là trung bình cộng hay CAGR',
        en: 'Whether that is an arithmetic mean or a CAGR',
      },
    },
    answer: 'd',
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
    prompt: {
      vi: 'Quỹ có CAGR 12%/năm trong 10 năm. Điều này KHÔNG nói gì?',
      en: 'A fund has a CAGR of 12% a year over 10 years. What does this NOT tell you?',
    },
    choices: {
      a: {
        vi: 'Tốc độ tăng trưởng gộp bình quân mỗi năm',
        en: 'The average compound growth rate per year',
      },
      b: {
        vi: 'Giá trị cuối kỳ gấp mấy lần giá trị đầu kỳ',
        en: 'The ratio of the ending value to the starting value',
      },
      c: { vi: 'Kỳ đo kéo dài bao nhiêu năm', en: 'How many years the measurement covers' },
      d: {
        vi: 'Diễn biến giữa kỳ và giai đoạn gần đây',
        en: 'The path in between and how the recent stretch went',
      },
    },
    answer: 'd',
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
      en: 'You contribute 10 million a month into an open-ended fund for 12 months. Is CAGR the right way to measure performance?',
    },
    choices: {
      a: {
        vi: 'Không, chỉ cần lấy lãi chia cho tổng tiền đã nộp',
        en: 'No, just divide the gain by total contributions',
      },
      b: {
        vi: 'Không, dòng tiền nộp rải rác phải dùng XIRR',
        en: 'No, scattered contributions call for XIRR',
      },
      c: {
        vi: 'Đúng, nếu số tiền nộp mỗi tháng bằng nhau',
        en: 'Yes, if each monthly amount stays the same',
      },
      d: {
        vi: 'Đúng, nếu khoản đầu tư được giữ trên ba năm',
        en: 'Yes, if the investment is held over three years',
      },
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
      en: 'You contribute 10 million a month for 12 months (120 million total), ending the year with 132 million. You calculate "a 10% annual gain." What is the actual XIRR roughly?',
    },
    choices: {
      a: { vi: 'Vẫn là 10%', en: 'Still 10%' },
      b: { vi: 'Khoảng 5%', en: 'About 5%' },
      c: { vi: 'Khoảng 12%', en: 'About 12%' },
      d: { vi: 'Khoảng 19%', en: 'About 19%' },
    },
    answer: 'd',
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
    prompt: {
      vi: 'Dòng tiền đổi dấu nhiều hơn một lần (+ + − − − +). IRR sẽ thế nào?',
      en: 'A cash flow series changes sign more than once (+ + − − − +). What happens to the IRR?',
    },
    choices: {
      a: {
        vi: 'Vẫn chỉ một nghiệm, như dòng tiền thông thường',
        en: 'Still a single root, as with ordinary cash flows',
      },
      b: {
        vi: 'Phương trình vô nghiệm, không tính được',
        en: 'The equation has no root and cannot be solved',
      },
      c: {
        vi: 'Có thể có nhiều nghiệm thực, như 0% và 10%',
        en: 'It can have several real roots, such as 0% and 10%',
      },
      d: {
        vi: 'Nghiệm nhỏ nhất chính là IRR cần tìm',
        en: 'The smallest root is the IRR you are looking for',
      },
    },
    answer: 'c',
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
    prompt: {
      vi: 'IRR của dự án là 25%. Giả định ngầm thường được nêu là gì?',
      en: "A project's IRR is 25%. What implicit assumption is usually cited?",
    },
    choices: {
      a: {
        vi: 'Dòng tiền dương được tái đầu tư ở mức 25%',
        en: 'Positive cash flows are reinvested at that same 25%',
      },
      b: {
        vi: 'Chi phí vốn của dự án cũng đúng bằng 25%',
        en: "The project's cost of capital is also exactly 25%",
      },
      c: {
        vi: 'Dự án không có rủi ro và lạm phát bằng 0',
        en: 'The project carries no risk and inflation is zero',
      },
      d: {
        vi: 'Thuế suất bằng 0 suốt vòng đời dự án',
        en: "The tax rate is zero over the project's whole life",
      },
    },
    answer: 'a',
    explain: {
      vi: 'CFI: “it assumes all positive cash flows of a project will be reinvested at the same rate as the project” - điều hiếm khi xảy ra, nên MIRR ra đời để sửa. Lưu ý: giới học thuật còn tranh cãi giả định này có thực sự tồn tại hay không.',
      en: 'CFI: “it assumes all positive cash flows of a project will be reinvested at the same rate as the project” - something that rarely happens in practice, which is why MIRR was created to fix it. Note: academics still debate whether this assumption actually holds.',
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
      en: 'A 100 million consumer loan has a contract rate of 0.83% a month on the original principal, repaid over 12 installments. How does the actual effective interest rate compare with the rate printed in the contract?',
    },
    choices: {
      a: { vi: 'Bằng đúng con số trên hợp đồng', en: 'Exactly the rate in the contract' },
      b: { vi: 'Thấp hơn con số trên hợp đồng', en: 'Lower than the rate in the contract' },
      c: { vi: 'Gần gấp đôi con số trên hợp đồng', en: 'Nearly double the rate in the contract' },
      d: {
        vi: 'Chỉ nhỉnh hơn khoảng một phần mười',
        en: 'Only about a tenth above the contract rate',
      },
    },
    answer: 'c',
    explain: {
      vi: 'Phóng sự CafeF: “người vay phải chịu lãi suất gần gấp đôi, trong khi ít khách hàng biết được sự lắt léo này” - vì lãi vẫn tính trên toàn bộ vốn vay ban đầu dù mỗi tháng đã trả bớt gốc. Điều tra Tuổi Trẻ ghi nhận trường hợp lãi suất quy đổi lên tới 49,68%/năm.',
      en: 'A CafeF report: “người vay phải chịu lãi suất gần gấp đôi, trong khi ít khách hàng biết được sự lắt léo này” (borrowers end up paying nearly double the interest, while few customers notice the catch) - because interest is still charged on the entire original principal even though part of it has been repaid each month. A Tuoi Tre investigation found a case where the converted rate reached 49.68% a year.',
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
      en: 'A nominal rate of 6% a year compounds monthly. What is the effective annual rate (EAR)?',
    },
    choices: {
      a: { vi: '6,00%', en: '6.00%' },
      b: { vi: '6,50%', en: '6.50%' },
      c: { vi: '6,17%', en: '6.17%' },
      d: { vi: '7,20%', en: '7.20%' },
    },
    answer: 'c',
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
      en: 'A loan is quoted with an "APR." Does the word "annual" guarantee that figure is the real cost of borrowing for a full year?',
    },
    choices: {
      a: {
        vi: 'Có, đó chính là chi phí vay thực của năm',
        en: 'Yes, it is the real yearly cost of borrowing',
      },
      b: {
        vi: 'Có, miễn là khoản vay kéo dài trên 12 tháng',
        en: 'Yes, as long as the loan runs over 12 months',
      },
      c: {
        vi: 'Không, APR danh nghĩa chưa gồm phí và lãi kép',
        en: 'No, a nominal APR leaves out fees and compounding',
      },
      d: {
        vi: 'Có, nếu bên cho vay là một ngân hàng thương mại',
        en: 'Yes, if the lender is a commercial bank',
      },
    },
    answer: 'c',
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
    prompt: {
      vi: 'Lãi tiền gửi 10%/năm, lạm phát 25%. Mất bao nhiêu sức mua?',
      en: 'A deposit rate of 10% a year against 25% inflation. How much purchasing power is lost?',
    },
    choices: {
      a: { vi: '15%', en: '15%' },
      b: { vi: '25%', en: '25%' },
      c: { vi: '12%', en: '12%' },
      d: { vi: '10%', en: '10%' },
    },
    answer: 'c',
    explain: {
      vi: 'Phép trừ 10 − 25 = −15% chỉ là xấp xỉ. Công thức Fisher chính xác: 1,1/1,25 − 1 = −12%. Nguồn ghi rõ: “the actual loss of purchasing power is exactly 12%”. Phép trừ chỉ gần đúng khi cả lãi suất lẫn lạm phát đều thấp.',
      en: 'Simple subtraction, 10 − 25 = −15%, is only an approximation. The exact Fisher formula gives 1.1/1.25 − 1 = −12%. The source states plainly: “the actual loss of purchasing power is exactly 12%”. Subtraction is only a good approximation when both the interest rate and inflation are low.',
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
      en: 'What formula for the real interest rate is common among mainstream Vietnamese sources (banks, industry publications)?',
    },
    choices: {
      a: {
        vi: 'Công thức Fisher chính xác, dạng phép chia',
        en: 'The exact Fisher formula, written as a division',
      },
      b: {
        vi: 'Lãi suất danh nghĩa chia cho chỉ số CPI',
        en: 'Nominal interest rate divided by the CPI index',
      },
      c: {
        vi: 'Lãi suất danh nghĩa cộng tỷ lệ lạm phát',
        en: 'Nominal interest rate plus the inflation rate',
      },
      d: {
        vi: 'Lãi suất danh nghĩa trừ tỷ lệ lạm phát',
        en: 'Nominal interest rate minus the inflation rate',
      },
    },
    answer: 'd',
    explain: {
      vi: 'VPBank: “Lãi suất thực = Lãi suất danh nghĩa – Tỷ lệ lạm phát”; Tạp chí Thị trường Tài chính Tiền tệ cũng dùng cùng công thức. Đây là trường hợp ngộ nhận được củng cố từ chính nguồn chính thống - app nên hiện cả hai cách tính.',
      en: 'VPBank: “Lãi suất thực = Lãi suất danh nghĩa – Tỷ lệ lạm phát” (real interest rate = nominal interest rate minus the inflation rate); the Tap chi Thi truong Tai chinh Tien te (Finance and Monetary Market magazine) also uses the same formula. This is a case where a misconception is reinforced by mainstream sources themselves - the app should show both methods.',
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
    prompt: {
      vi: 'Quy tắc 72 chính xác nhất ở vùng lãi suất nào?',
      en: 'At what range of interest rates is the rule of 72 most accurate?',
    },
    choices: {
      a: { vi: 'Quanh mức 8% mỗi kỳ', en: 'Around 8% per period' },
      b: { vi: 'Quanh mức 2% mỗi kỳ', en: 'Around 2% per period' },
      c: { vi: 'Quanh mức 15% mỗi kỳ', en: 'Around 15% per period' },
      d: { vi: 'Quanh mức 25% mỗi kỳ', en: 'Around 25% per period' },
    },
    answer: 'a',
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
    prompt: {
      vi: 'Hai khoản đầu tư cùng ROI 25%. Thông tin còn thiếu là gì?',
      en: 'Two investments both have a 25% ROI. What information is missing?',
    },
    choices: {
      a: { vi: 'Mỗi khoản thuộc về ngành nghề nào', en: 'Which industry each one is in' },
      b: { vi: 'Mỗi khoản được nắm giữ bao lâu', en: 'How long each one was held' },
      c: { vi: 'Mỗi khoản lãi bao nhiêu phần trăm', en: 'What percentage each one gained' },
      d: { vi: 'Mỗi khoản do ai đứng tên sở hữu', en: 'Whose name each one is held in' },
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
    prompt: {
      vi: 'Danh mục lãi 8% trong một quý. Có nên công bố “hơn 36%/năm” không?',
      en: 'A portfolio gains 8% in one quarter. Should it be reported as "more than 36% a year"?',
    },
    choices: {
      a: {
        vi: 'Nên, gộp lãi bốn quý là cách quy chuẩn theo năm',
        en: 'Yes, compounding four quarters is the standard method',
      },
      b: {
        vi: 'Nên, miễn là có ghi chú rõ cách tính',
        en: 'Yes, as long as the method is clearly footnoted',
      },
      c: {
        vi: 'Không, nên báo 32%/năm vì không tính lãi gộp',
        en: 'No, report 32% a year, since gains are not compounded',
      },
      d: {
        vi: 'Không, kỳ dưới một năm không được năm hoá',
        en: 'No, periods under a year must not be annualized',
      },
    },
    answer: 'd',
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
    prompt: {
      vi: 'Tại sao năm hoá một kỳ ngắn lại gây hiểu nhầm mạnh nhất với lợi suất cao?',
      en: 'Why does annualizing a short period mislead the most when the return is high?',
    },
    choices: {
      a: {
        vi: 'Vì phép nhân chồng coi cả năm đều lãi như vậy',
        en: 'Because compounding assumes the whole year earns at that pace',
      },
      b: {
        vi: 'Vì sai số làm tròn lớn dần khi lợi suất cao',
        en: 'Because rounding errors grow larger as the return gets higher',
      },
      c: {
        vi: 'Vì phí giao dịch tăng theo mức lợi suất',
        en: 'Because transaction fees rise along with the return',
      },
      d: {
        vi: 'Vì thuế trên khoản lãi lớn bị bỏ sót',
        en: 'Because taxes on a large gain get left out',
      },
    },
    answer: 'a',
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
    prompt: {
      vi: 'Quy ước đếm ngày Actual/360 so với 30/360 ảnh hưởng thế nào tới người vay?',
      en: 'How does the Actual/360 day-count convention affect a borrower compared with 30/360?',
    },
    choices: {
      a: {
        vi: 'Không khác gì, vì cả hai đều chia cho 360',
        en: 'No difference, since both divide by 360',
      },
      b: {
        vi: 'Thêm 5 đến 6 ngày lãi mỗi năm, gốc giảm chậm hơn',
        en: '5 to 6 extra days of interest a year, slower amortization',
      },
      c: {
        vi: 'Trả ít lãi hơn vì một năm chỉ tính 360 ngày',
        en: 'Pays less interest, since a year counts only 360 days',
      },
      d: {
        vi: 'Chỉ khác nhau vào năm nhuận, lệch một ngày',
        en: 'Differs only in leap years, by one day',
      },
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
    prompt: {
      vi: 'Bạn tính lợi suất quỹ bằng phần trăm thay đổi của giá. Sai sót là gì?',
      en: "You calculate a fund's return using the percentage change in price. What is the error?",
    },
    choices: {
      a: {
        vi: 'Tính trùng cổ tức đã nhận nên ra cao hơn',
        en: 'Double-counts dividends received, so it reads high',
      },
      b: {
        vi: 'Quên trừ phí quản lý nên ra cao hơn thực tế',
        en: 'Forgets to deduct the management fee, so it reads high',
      },
      c: {
        vi: 'Bỏ sót cổ tức và lãi tái đầu tư nên ra thấp hơn',
        en: 'Leaves out reinvested dividends and interest, so it reads low',
      },
      d: {
        vi: 'Không sai gì, tổng lợi suất cũng chỉ đo giá',
        en: 'No error, total return also measures price alone',
      },
    },
    answer: 'c',
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
    prompt: {
      vi: 'Danh mục lãi 20% trong khi chỉ số tham chiếu lãi 15%. Kết luận nào đúng?',
      en: 'A portfolio gains 20% while its benchmark gains 15%. Which conclusion is correct?',
    },
    choices: {
      a: {
        vi: 'Danh mục đã tạo ra alpha dương 5 điểm phần trăm',
        en: 'The portfolio generated positive alpha of 5 percentage points',
      },
      b: {
        vi: 'Chưa kết luận được khi chưa điều chỉnh rủi ro',
        en: 'No conclusion until risk is adjusted for',
      },
      c: {
        vi: 'Nhà quản lý đã chứng minh được năng lực',
        en: 'The manager has proven their skill',
      },
      d: {
        vi: 'Lợi suất điều chỉnh rủi ro cũng cao hơn',
        en: 'Its risk-adjusted return is also higher',
      },
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
      en: 'You buy a stock the day before the ex-dividend record date, receive a 2,000 VND/share dividend the next day, then sell. Is a profit guaranteed?',
    },
    choices: {
      a: {
        vi: 'Có, lời đúng bằng 2.000 đồng mỗi cổ phiếu',
        en: 'Yes, a 2,000 VND gain on every share',
      },
      b: {
        vi: 'Không, giá tham chiếu giảm bằng cổ tức',
        en: 'No, the reference price drops by the dividend',
      },
      c: {
        vi: 'Có, nếu bán ngay trong phiên giao dịch đó',
        en: 'Yes, if sold within that same trading session',
      },
      d: {
        vi: 'Có, nếu đó là cổ phiếu có vốn hoá lớn',
        en: 'Yes, as long as it is a large-cap stock',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn đặt đúng câu hỏi này và trả lời: “Không có dòng tiền mới nào được tạo ra, nó chỉ đơn thuần được chuyển từ sổ sách của công ty sang túi của cá nhân bạn”: 28.000 (giá sau điều chỉnh) + 2.000 (tiền mặt) = 30.000 như cũ.',
      en: 'The source asks this exact question and answers: “Không có dòng tiền mới nào được tạo ra, nó chỉ đơn thuần được chuyển từ sổ sách của công ty sang túi của cá nhân bạn”: 28,000 (the adjusted price) + 2,000 (cash) = 30,000, same as before.',
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
      en: "A stock's dividend yield rises from 5% to 10% while the company keeps its dividend unchanged. What happened?",
    },
    choices: {
      a: {
        vi: 'Doanh nghiệp làm ăn hiệu quả gấp đôi',
        en: 'The company became twice as profitable',
      },
      b: { vi: 'Cổ phiếu trở nên hấp dẫn gấp đôi', en: 'The stock became twice as attractive' },
      c: { vi: 'Giá cổ phiếu đã giảm một nửa', en: 'The share price has halved' },
      d: { vi: 'Số cổ phiếu lưu hành đã giảm đi', en: 'Fewer shares are now outstanding' },
    },
    answer: 'c',
    explain: {
      vi: '“Nếu giá cổ phiếu giảm xuống 25.000 đồng nhưng doanh nghiệp vẫn trả 2.500 đồng, tỷ suất cổ tức trên mức giá mới sẽ tăng lên 10%”, và nếu giá giảm vì kinh doanh suy yếu thì chính mức cổ tức đó cũng khó duy trì. “Dividend Yield cao đôi khi là tín hiệu cần tìm hiểu thêm, chứ không phải tín hiệu mặc nhiên để mua vào”.',
      en: '“Nếu giá cổ phiếu giảm xuống 25.000 đồng nhưng doanh nghiệp vẫn trả 2.500 đồng, tỷ suất cổ tức trên mức giá mới sẽ tăng lên 10%”, and if the price fell because the business weakened, that same dividend may be hard to sustain. “Dividend Yield cao đôi khi là tín hiệu cần tìm hiểu thêm, chứ không phải tín hiệu mặc nhiên để mua vào”.',
    },
    source: {
      url: 'https://kinhtechungkhoan.vn/chi-so-dividend-yield-co-tuc-cao-khong-dong-nghia-co-phieu-hap-dan',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
];
