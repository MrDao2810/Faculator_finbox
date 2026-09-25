/**
 * Câu hỏi kiểm tra hiểu bài — nhóm Định giá — chiết khấu dòng tiền.
 *
 * Mỗi câu gắn một nguồn thật; xem bất biến ở `../types.ts`. Không thêm câu nào vào đây mà
 * không có `source.url` trỏ tới chỗ đọc được điều câu hỏi đang kiểm tra.
 */

import type { QuizItem } from '../types';

export const DCF: ReadonlyArray<QuizItem> = [
  {
    id: 'Q024',
    formulaId: 'mo-hinh-gordon',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Trong mô hình Gordon, vì sao g không được vượt tốc độ tăng trưởng của nền kinh tế?',
    },
    choices: {
      a: { vi: 'Vì quy định kế toán' },
      b: { vi: 'Vì đó là ràng buộc toán học, không phải giả định kinh tế để tranh luận' },
      c: { vi: 'Vì g cao làm tăng rủi ro' },
      d: { vi: 'Vì nhà đầu tư không tin g cao' },
    },
    answer: 'b',
    explain: {
      vi: 'Vì một doanh nghiệp tăng mãi nhanh hơn nền kinh tế thì đến lúc nào đó sẽ lớn hơn chính nền kinh tế ấy; và vì lãi suất phi rủi ro, nền của r, đã chứa sẵn tốc độ tăng danh nghĩa của nền kinh tế, nên g vượt mốc đó là g tiến sát rồi vượt r. Lúc ấy mẫu số r trừ g co về 0 rồi đổi dấu: giá trị phình ra vô cực rồi lật sang âm. Damodaran nói đây là ràng buộc của chính phép tính chứ không phải một quan điểm kinh tế: “This is not a debatable assumption, since it is mathematical, not one that owes its presence to economic theory”.',
      en: 'Because a company that keeps growing faster than the economy eventually becomes larger than the economy itself; and because the risk-free rate, the floor under r, already embeds the economy nominal growth rate, pushing g past that point pushes it toward and then past r. The denominator r minus g then shrinks to zero and flips sign: value blows up to infinity and then turns negative. Damodaran calls this a constraint of the arithmetic rather than an economic view: “This is not a debatable assumption, since it is mathematical, not one that owes its presence to economic theory”.',
    },
    source: {
      url: 'https://aswathdamodaran.substack.com/p/myth-52-as-g-rto-infinity-and-beyond-16-11-30',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q025',
    formulaId: 'mo-hinh-gordon',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Bạn nâng g từ 3% lên 5% trong công thức Gordon nhưng giữ nguyên dòng tiền năm cuối. Sai ở đâu?',
    },
    choices: {
      a: { vi: 'Không sai, đó là phân tích độ nhạy' },
      b: { vi: 'Tăng trưởng phải trả giá bằng tái đầu tư nên dòng tiền không thể giữ nguyên' },
      c: { vi: 'g phải là số nguyên' },
      d: { vi: 'Phải đổi cả lãi suất phi rủi ro' },
    },
    answer: 'b',
    explain: {
      vi: 'Sai ở chỗ coi tăng trưởng là thứ miễn phí: muốn tăng nhanh hơn thì phải tái đầu tư nhiều hơn, nên dòng tiền năm cuối phải giảm đi chứ không thể giữ nguyên. Damodaran: “Growth is not free and it has to be paid for with reinvestment... you cannot leave cash flows fixed and change the growth rate”. Ông cũng nhắc thứ tạo ra giá trị không phải bản thân tốc độ tăng: “It is not the growth rate per se, but the excess returns... that drives value”.',
      en: 'The mistake is treating growth as free: growing faster means reinvesting more, so the final-year cash flow has to fall, not stay put. Damodaran: “Growth is not free and it has to be paid for with reinvestment... you cannot leave cash flows fixed and change the growth rate”. He also notes that what creates value is not the growth rate itself: “It is not the growth rate per se, but the excess returns... that drives value”.',
    },
    source: {
      url: 'https://aswathdamodaran.substack.com/p/myth-53-growth-is-good-more-growth-16-11-30',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q026',
    formulaId: 'mo-hinh-gordon',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Ở giai đoạn ổn định, nhiều người đặt CapEx = khấu hao và bỏ qua thay đổi vốn lưu động. Hệ quả là gì?',
    },
    choices: {
      a: { vi: 'Mô hình chính xác hơn' },
      b: { vi: 'Tỷ lệ tái đầu tư thành 0 mà doanh nghiệp vẫn tăng trưởng mãi — giả định vô lý' },
      c: { vi: 'Giá trị cuối kỳ bằng 0' },
      d: { vi: 'Không ảnh hưởng gì' },
    },
    answer: 'b',
    explain: {
      vi: 'Hệ quả là mô hình cho doanh nghiệp tăng trưởng mãi mà không phải bỏ thêm đồng vốn nào: tỷ lệ tái đầu tư thành 0 trong khi g vẫn dương, nên giá trị cuối kỳ bị thổi lên. Damodaran mô tả đúng hành vi này: “Analysts seems to be willing to assume that when you get to stable growth, you can set capital expenditures = depreciation, ignore working capital changes and effectively make the reinvestment rate zero, while allowing the firm to continue growing”.',
      en: 'The result is a model where the company grows forever without putting in another unit of capital: the reinvestment rate becomes zero while g stays positive, so terminal value is inflated. Damodaran describes exactly this habit: “Analysts seems to be willing to assume that when you get to stable growth, you can set capital expenditures = depreciation, ignore working capital changes and effectively make the reinvestment rate zero, while allowing the firm to continue growing”.',
    },
    source: {
      url: 'https://aswathdamodaran.substack.com/p/myth-53-growth-is-good-more-growth-16-11-30',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q027',
    formulaId: 'ddm-hai-giai-doan',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Mô hình cho doanh nghiệp tăng 30%/năm trong 5 năm rồi rơi xuống 6% vĩnh viễn từ năm thứ 6. Damodaran đánh giá thế nào?',
    },
    choices: {
      a: { vi: 'Đây là chuẩn mực ngành' },
      b: { vi: 'Bước chuyển đột ngột này gần như chắc chắn không thực tế' },
      c: { vi: 'Chỉ đúng với công ty công nghệ' },
      d: { vi: 'Cần kéo dài giai đoạn 1 lên 10 năm là đủ' },
    },
    answer: 'b',
    explain: {
      vi: 'Ông đánh giá là không thực tế: bậc rơi thẳng từ 30% xuống 6% ngay sau năm thứ năm là một cú gãy không có thật, doanh nghiệp giảm tốc dần chứ không giảm hết trong một năm. Damodaran: “the model assumes that the firm may be growing at 30% for five years only to then grow at 6% (stable growth) until eternity. Is this realistic? Probably not”. Mô hình ba giai đoạn, với một giai đoạn chuyển tiếp, sinh ra để vá đúng chỗ này.',
      en: 'He judges it unrealistic: a cliff straight from 30% to 6% right after year five is a break that does not happen, companies decelerate gradually rather than all in one year. Damodaran: “the model assumes that the firm may be growing at 30% for five years only to then grow at 6% (stable growth) until eternity. Is this realistic? Probably not”. The three-stage model, with a transition phase, exists to patch exactly this.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/adamodar/New_Home_Page/articles/ddm.htm',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q028',
    formulaId: 'ddm-hai-giai-doan',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Doanh nghiệp nào KHÔNG dùng được mô hình chiết khấu cổ tức?' },
    choices: {
      a: { vi: 'Doanh nghiệp trả cổ tức đều nhiều năm' },
      b: { vi: 'Doanh nghiệp không trả cổ tức hoặc tỷ lệ chi trả thất thường' },
      c: { vi: 'Doanh nghiệp tăng trưởng chậm' },
      d: { vi: 'Doanh nghiệp ngành tiện ích' },
    },
    answer: 'b',
    explain: {
      vi: 'ASEAN Securities: “không thể sử dụng nó cho bất kỳ công ty nào không trả cổ tức”, “thật khó để sử dụng mô hình này cho các công ty mới bắt đầu trả cổ tức hoặc có tỷ lệ chi trả cổ tức không nhất quán”. Vietstock: DDM “phù hợp để định giá các doanh nghiệp có tốc độ tăng trưởng chậm, chính sách trả cổ tức đều đặn”.',
    },
    source: {
      url: 'https://www.aseansc.com.vn/mo-hinh-chiet-khau-co-tuc-dinh-gia-co-phieu/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q029',
    formulaId: 'capm',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Bạn tra beta của cùng một cổ phiếu trên ba trang tài chính và ra ba số khác nhau. Vì sao?',
    },
    choices: {
      a: { vi: 'Một trong ba trang bị lỗi' },
      b: { vi: 'Các trang dùng mốc thời gian và chỉ số tham chiếu khác nhau' },
      c: { vi: 'Beta thay đổi theo giờ giao dịch' },
      d: { vi: 'Do làm tròn' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn tiếng Việt ghi nhận đúng hiện tượng này: “Thường thì mấy trang web tài chính chứng khoán có kết quả tính hệ số Beta khá cách biệt”, và khuyên “bạn đừng cứng nhắc chỉ bám vào beta”. Damodaran bổ sung: sai số chuẩn của beta khoảng 0,20 nên beta 1,10 có thể thật sự nằm trong 0,70–1,50.',
    },
    source: {
      url: 'https://cophieux.com/he-so-beta/',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q030',
    formulaId: 'capm',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Doanh nghiệp đăng ký tại Việt Nam nhưng 80% doanh thu từ Mỹ và châu Âu. Phần bù rủi ro quốc gia nên tính thế nào?',
    },
    choices: {
      a: { vi: 'Cộng nguyên phần bù rủi ro Việt Nam' },
      b: { vi: 'Theo nơi doanh nghiệp hoạt động, không theo nơi đăng ký' },
      c: { vi: 'Bỏ qua vì đã có beta' },
      d: { vi: 'Lấy trung bình các nước' },
    },
    answer: 'b',
    explain: {
      vi: 'Tính theo NƠI DOANH NGHIỆP HOẠT ĐỘNG, không theo nơi đăng ký: doanh thu đến từ Mỹ và châu Âu thì phần bù rủi ro quốc gia phải bình quân theo tỷ trọng doanh thu của các thị trường ấy, chứ không lấy nguyên phần bù của Việt Nam. Damodaran: “the exposure to country risk comes from where a company operates, not where it is incorporated”, và “Not all companies or projects are average risk”. Ông cũng cảnh báo tính trùng: doanh nghiệp ở nước có rủi ro vỡ nợ dễ bị gánh phần bù hai lần.',
      en: 'Weight it by WHERE THE COMPANY OPERATES, not where it is registered: with revenue coming from the US and Europe, the country risk premium has to be a revenue-weighted average of those markets rather than Vietnam premium applied whole. Damodaran: “the exposure to country risk comes from where a company operates, not where it is incorporated”, and “Not all companies or projects are average risk”. He also warns about double counting: companies in countries with default risk easily carry the premium twice.',
    },
    source: {
      url: 'https://aswathdamodaran.substack.com/p/country-risk-2025-the-story-behind',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q031',
    formulaId: 'capm',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Nhận định “beta đã bị chứng minh là vô dụng” đúng tới đâu theo nghiên cứu của CFA Institute?',
    },
    choices: {
      a: { vi: 'Hoàn toàn đúng' },
      b: {
        vi: 'Không hẳn — danh mục beta cao vượt danh mục beta thấp hơn 5 điểm phần trăm/năm, và 2010–2020 CAPM đúng 10/11 năm',
      },
      c: { vi: 'Beta chỉ sai ở thị trường mới nổi' },
      d: { vi: 'Chưa ai kiểm chứng' },
    },
    answer: 'b',
    explain: {
      vi: 'Nói beta vô dụng là quá lời. CFA Institute đo lại và thấy beta dự báo không tệ như tiếng đồn, danh mục beta cao vượt danh mục beta thấp hơn 5 điểm phần trăm mỗi năm, và CAPM đúng ở 10 trong 11 năm giai đoạn 2010 đến 2020. Nguyên văn: “beta is not as bad a predictor of future returns as is often thought”; “a high beta portfolio generated slightly more than 5 percentage point premium over its low beta peer on an annualized basis”; “From 2010 to 2020, CAPM was right in 10 of the 11 years”. Giai đoạn beta thực sự thất bại là thập niên 1980.',
      en: 'Calling beta useless overstates the case. CFA Institute re-measured it and found beta predicts returns better than its reputation suggests: a high-beta portfolio beat its low-beta peer by slightly over 5 percentage points a year, and CAPM was right in 10 of the 11 years from 2010 to 2020. Verbatim: “beta is not as bad a predictor of future returns as is often thought”; “a high beta portfolio generated slightly more than 5 percentage point premium over its low beta peer on an annualized basis”; “From 2010 to 2020, CAPM was right in 10 of the 11 years”. The decade where beta genuinely failed was the 1980s.',
    },
    source: {
      url: 'https://rpc.cfainstitute.org/blogs/enterprising-investor/2021/revisiting-beta-how-well-has-beta-predicted-returns',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q032',
    formulaId: 'wacc',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: '“Tôi muốn lãi 15% nên chiết khấu ở 15%”. Damodaran nói gì về cách làm này?' },
    choices: {
      a: { vi: 'Hợp lý nếu đó là mục tiêu đầu tư' },
      b: { vi: 'Mức lợi nhuận bạn muốn không phải là chi phí vốn của bạn' },
      c: { vi: 'Chỉ sai khi lãi suất thấp' },
      d: { vi: 'Đúng với nhà đầu tư cá nhân' },
    },
    answer: 'b',
    explain: {
      vi: 'Damodaran bác thẳng: chi phí vốn là mức sinh lời thị trường đòi hỏi cho rủi ro của khoản đầu tư, không phải mức lãi người định giá mong muốn. Nguyên văn: “The fact that you would like to make 15% is nice but it is not your cost of capital” và “A cost of capital is not that discount rate that yields a value you would like to see”. Ông cũng nhắc tỷ lệ chiết khấu “definitely not the most critical” đầu vào của một mô hình DCF, dòng tiền mới là chỗ quyết định.',
      en: 'Damodaran rejects it outright: the cost of capital is the return the market demands for the risk of the investment, not the return the valuer would like to earn. Verbatim: “The fact that you would like to make 15% is nice but it is not your cost of capital” and “A cost of capital is not that discount rate that yields a value you would like to see”. He also notes the discount rate is “definitely not the most critical” input in a DCF, the cash flows decide the answer.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/country/CostofCapitalShort2022.pdf',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q033',
    formulaId: 'wacc',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Tập đoàn đa ngành dùng một WACC chung cho mọi dự án. Hậu quả là gì?' },
    choices: {
      a: { vi: 'Tiết kiệm thời gian, không hại gì' },
      b: { vi: 'Mảng an toàn đi trợ giá cho mảng rủi ro' },
      c: { vi: 'WACC bị tính thấp đi' },
      d: { vi: 'Chỉ ảnh hưởng báo cáo, không ảnh hưởng quyết định' },
    },
    answer: 'b',
    explain: {
      vi: 'Hậu quả là dự án rủi ro cao được dự án an toàn gánh hộ: một rào cản chung đòi hỏi quá thấp ở mảng rủi ro nên dự án xấu dễ được duyệt, và quá cao ở mảng an toàn nên dự án tốt bị loại oan. Damodaran: “If you use the cost of capital of the company as your hurdle rate for all investments, risky investments (and businesses) will be subsidized by safe investments”, và ông xếp tỷ lệ rào cản cấp công ty vào nhóm huyền thoại cần bỏ.',
      en: 'The consequence is that safe projects subsidise risky ones: a single company-wide hurdle asks too little of the risky division, so bad projects clear it, and too much of the safe division, so good projects are rejected. Damodaran: “If you use the cost of capital of the company as your hurdle rate for all investments, risky investments (and businesses) will be subsidized by safe investments”, and he lists the company-level hurdle rate among the myths to drop.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/country/CostofCapitalShort2022.pdf',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q034',
    formulaId: 'wacc',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Bạn tính ra WACC 9% nhưng thấy “thấp quá” nên cộng thêm 3% cho chắc. Đánh giá?',
    },
    choices: {
      a: { vi: 'Thận trọng là tốt' },
      b: { vi: 'Đây là cộng phần bù không căn cứ, chỉ vì con số trông không vừa mắt' },
      c: { vi: 'Đúng nếu thị trường biến động' },
      d: { vi: 'Chỉ sai khi cộng quá 5%' },
    },
    answer: 'b',
    explain: {
      vi: 'Đó là tự đặt ra tỷ lệ rào cản theo cảm giác, và Damodaran xếp nó vào việc gần như không bao giờ nên làm. Nếu WACC 9% trông thấp thì phải xem lại đầu vào (beta, phần bù rủi ro, chi phí nợ), chứ cộng thêm 3% là biến một con số đo được thành một con số mong muốn. Ông ghi nhận đúng hành vi này, nhà phân tích cộng phần bù vì “the discount rate that I am getting looks too low”, và kết luận “making up hurdle rates (higher or lower than the market-conscious number) is almost never a good idea”.',
      en: 'That is inventing a hurdle rate by feel, and Damodaran puts it among the things almost never worth doing. If a 9% WACC looks too low, the inputs are what to re-examine, beta, the risk premium, the cost of debt, whereas adding 3% turns a measured number into a wished-for one. He records exactly this habit, analysts adding a premium because “the discount rate that I am getting looks too low”, and concludes that “making up hurdle rates (higher or lower than the market-conscious number) is almost never a good idea”.',
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2025/02/data-update-6-for-2025-from-macro-to.html',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q035',
    formulaId: 'fcff',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'FCFF phải chiết khấu bằng tỷ lệ nào và cho ra giá trị gì?' },
    choices: {
      a: { vi: 'Chi phí vốn chủ — ra giá trị vốn chủ' },
      b: { vi: 'WACC — ra giá trị doanh nghiệp, còn phải trừ nợ' },
      c: { vi: 'Lãi suất phi rủi ro — ra giá trị doanh nghiệp' },
      d: { vi: 'WACC — ra thẳng giá trị vốn chủ' },
    },
    answer: 'b',
    explain: {
      vi: 'FCFF là dòng tiền của mọi bên nên chiết khấu bằng WACC: “the weighted average cost of capital (WACC) is the appropriate discount rate”. Shinhan Securities VN: FCFF cho ra “giá trị doanh nghiệp (bao gồm giá trị của chủ nợ và chủ sở hữu)” — muốn ra vốn chủ phải trừ nợ.',
    },
    source: {
      url: 'https://www.wallstreetprep.com/knowledge/common-errors-in-dcf-models/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q036',
    formulaId: 'fcff',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Cộng khấu hao ngược vào lợi nhuận đã ra dòng tiền tự do chưa?' },
    choices: {
      a: { vi: 'Rồi' },
      b: { vi: 'Chưa — đó chỉ là một điểm dừng trung gian' },
      c: { vi: 'Chỉ đúng với doanh nghiệp sản xuất' },
      d: { vi: 'Chỉ đúng nếu không có nợ' },
    },
    answer: 'b',
    explain: {
      vi: 'Chưa. Cộng khấu hao ngược vào lợi nhuận mới đi được nửa đường: còn phải trừ chi đầu tư tài sản cố định và thay đổi vốn lưu động thì mới ra dòng tiền tự do. Damodaran: “adding back depreciation to earnings gives you free cash flow, an intermediate stop, at best”. Ông còn gọi chính cụm “free cash flow” là “one of the most dangerous terms in finance”, vì mỗi nơi bẻ định nghĩa một kiểu.',
      en: 'Not yet. Adding depreciation back to earnings only gets you halfway: capital expenditure and the change in working capital still have to come out before it is free cash flow. Damodaran: “adding back depreciation to earnings gives you free cash flow, an intermediate stop, at best”. He goes further and calls the phrase “free cash flow” itself “one of the most dangerous terms in finance”, because every user bends the definition.',
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2022/10/earnings-and-cash-flows-primer-on-free.html',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q037',
    formulaId: 'fcfe',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Doanh nghiệp trẻ tăng trưởng nhanh có FCFE âm nhiều năm. Kết luận nào hợp lý?' },
    choices: {
      a: { vi: 'Loại ngay vì dòng tiền âm' },
      b: {
        vi: 'Có thể do tái đầu tư nhiều hơn số kiếm được — một năm FCF còn nhiễu hơn một năm lợi nhuận',
      },
      c: { vi: 'Doanh nghiệp đang gian lận' },
      d: { vi: 'FCFE âm là lỗi tính toán' },
    },
    answer: 'b',
    explain: {
      vi: "FCFE âm nhiều năm ở doanh nghiệp trẻ thường là dấu hiệu đang tái đầu tư mạnh, không phải dấu hiệu làm ăn kém: phải xem dòng tiền âm đi vào đâu chứ không kết luận từ dấu của một năm. Damodaran: “a single year's free cash flow actually has more noise in it, and is less informative about a company's operating health, than a single year's earnings”. Tesla trước 2020 là ví dụ quen thuộc, dòng tiền tự do âm vì dựng nhà máy.",
      en: "Years of negative FCFE at a young company usually signal heavy reinvestment rather than a weak business: the question is where the negative cash went, not what sign one year carries. Damodaran: “a single year's free cash flow actually has more noise in it, and is less informative about a company's operating health, than a single year's earnings”. Tesla before 2020 is the familiar case, free cash flow negative because it was building factories.",
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2022/10/earnings-and-cash-flows-primer-on-free.html',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q038',
    formulaId: 'fcfe',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'FCFE khác FCFF ở điểm nào khi chiết khấu?' },
    choices: {
      a: { vi: 'FCFE chiết khấu bằng chi phí vốn chủ và ra thẳng giá trị vốn chủ' },
      b: { vi: 'FCFE cũng dùng WACC' },
      c: { vi: 'FCFE dùng lãi suất trái phiếu' },
      d: { vi: 'Hai cái giống nhau' },
    },
    answer: 'a',
    explain: {
      vi: 'FCFE là dòng tiền sau khi trả nợ nên chiết khấu bằng chi phí vốn chủ: “the correct discount rate to use is the cost of equity”. Nhầm hai tỷ lệ này là lỗi kinh điển trong mô hình DCF.',
    },
    source: {
      url: 'https://shinhansec.com.vn/vi/kien-thuc-dau-tu/84/dinh-gia-doanh-nghiep-bang-mo-hinh-fcfe-fcff-la-gi.html',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q039',
    formulaId: 'gia-tri-noi-tai-fcff',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Giá trị cuối kỳ chiếm 75% tổng giá trị trong mô hình DCF của bạn. Damodaran nói gì?',
    },
    choices: {
      a: { vi: 'Mô hình không đáng tin, phải kéo dài dự báo' },
      b: { vi: 'Đáng lo là khi terminal value KHÔNG chiếm phần lớn giá trị' },
      c: { vi: 'Phải giảm xuống dưới 50%' },
      d: { vi: 'Phải đổi sang phương pháp bội số' },
    },
    answer: 'b',
    explain: {
      vi: 'Damodaran bác bỏ ngộ nhận này: “In fact, it is when it does not account for the bulk of the value that you should be wary of a DCF!” — vì phần lớn lợi nhuận của cổ đông đến từ tăng giá chứ không phải cổ tức. Vấn đề nằm ở chất lượng giả định tạo ra terminal value, không phải ở tỷ trọng.',
    },
    source: {
      url: 'https://aswathdamodaran.substack.com/p/myth-55-the-terminal-value-ate-my-16-11-30',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q040',
    formulaId: 'gia-tri-noi-tai-fcff',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Sau khi tính terminal value bằng công thức Gordon, bước bắt buộc tiếp theo là gì?',
    },
    choices: {
      a: { vi: 'Cộng thẳng vào tổng hiện giá các dòng tiền' },
      b: { vi: 'Chiết khấu nó về hiện tại' },
      c: { vi: 'Nhân với tỷ lệ tăng trưởng' },
      d: { vi: 'Trừ đi vốn lưu động' },
    },
    answer: 'b',
    explain: {
      vi: 'Terminal value tính tại thời điểm cuối kỳ dự báo nên phải chiết khấu tiếp: “A crucial next step is to discount the terminal value (TV) to the present date”. Cùng nguồn khuyến nghị g cuối kỳ nằm trong 2–4% theo GDP.',
    },
    source: {
      url: 'https://www.wallstreetprep.com/knowledge/common-errors-in-dcf-models/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q041',
    formulaId: 'gia-tri-hien-tai',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Damodaran gọi mô hình trộn dòng tiền vốn chủ với tỷ lệ chiết khấu toàn doanh nghiệp là gì?',
    },
    choices: {
      a: { vi: 'Mô hình bảo thủ' },
      b: { vi: 'Chimera DCF — trộn các đơn vị không tương thích' },
      c: { vi: 'Mô hình hai giai đoạn' },
      d: { vi: 'Mô hình rút gọn' },
    },
    answer: 'b',
    explain: {
      vi: 'Damodaran đặt tên cho lỗi này trong bài “If you have a D and a CF, you have a DCF!”. Bốn chiều phải nhất quán: vốn chủ vs doanh nghiệp, trước thuế vs sau thuế, danh nghĩa vs thực, và đồng tiền — điều rất đáng chú ý khi trộn dòng tiền VND với chiết khấu theo USD.',
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2015/02/dcf-myth-1-if-you-have-ddiscount-rate.html',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q042',
    formulaId: 'gia-tri-hien-tai',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Quy định định giá tài sản ở VN dùng lãi suất ngân hàng thương mại tại năm định giá làm tỷ lệ chiết khấu. Bất cập là gì?',
    },
    choices: {
      a: { vi: 'Không có bất cập' },
      b: { vi: 'Lạm phát của đúng một năm quyết định giá trị tài sản dùng hai ba mươi năm' },
      c: { vi: 'Lãi suất ngân hàng quá cao' },
      d: { vi: 'Không áp dụng được cho bất động sản' },
    },
    answer: 'b',
    explain: {
      vi: 'Nghiên cứu của ĐH Lâm nghiệp: “tỷ lệ lạm phát của năm định giá sẽ quyết định giá của tài sản có thời hạn sử dụng... hai ba mươi năm sau đó”, và chỉ ra chênh lệch giá trị quy đổi của cùng một luồng thu nhập 20 năm lên tới 2,34 lần. Tác giả đề xuất dùng dữ liệu bình quân đa năm.',
    },
    source: {
      url: 'https://vnuf.edu.vn/documents/454250/1796579/14.KTCS%20-%20Nguyen%20Quang%20Ha.pdf',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q043',
    formulaId: 'gia-tri-tuong-lai',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Lợi nhuận tăng trưởng các năm khác nhau. Dùng trung bình cộng 7,14%/năm để chiếu tới 2022 ra 162,08 tỷ, trong khi số thật là 148,43 tỷ. Vì sao lệch?',
    },
    choices: {
      a: { vi: 'Do làm tròn' },
      b: { vi: 'Trung bình cộng phóng đại vì không phản ánh tính tích luỹ — phải dùng CAGR 5,80%' },
      c: { vi: 'Do thiếu một năm dữ liệu' },
      d: { vi: 'Do lạm phát' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn tính cả hai chiều: trung bình cộng 7,14% ra 162,08 tỷ, còn CAGR 5,80% ra “148.43 tỷ. Đúng bằng với số thật”.',
    },
    source: {
      url: 'https://bizuni.vn/dau-tu/cagr-toc-do-tang-truong-binh-quan-kep-ty-suat-loi-nhuan-binh-quan-tai-chinh-geometric-mean/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q044',
    formulaId: 'bien-an-toan',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Bạn nới biên an toàn từ 30% lên 50% để an toàn hơn. Cái giá phải trả là gì?' },
    choices: {
      a: { vi: 'Không có giá nào' },
      b: { vi: 'Giảm sai lầm loại 1 nhưng tăng sai lầm loại 2 — bỏ lỡ cơ hội' },
      c: { vi: 'Phải trả phí giao dịch cao hơn' },
      d: { vi: 'Mất quyền nhận cổ tức' },
    },
    answer: 'b',
    explain: {
      vi: "Cái giá là bỏ lỡ nhiều cơ hội tốt: nới biên an toàn thì giảm được lỗi mua phải cổ phiếu đắt (sai lầm loại 1), nhưng tăng lỗi bỏ qua cổ phiếu thật sự rẻ (sai lầm loại 2), và tiền nằm ngoài thị trường cũng là một khoản chi phí. Damodaran: “Increasing your MOS will reduce your type 1 errors but will increase your type 2 errors”, và “There are very few actions in investing that don't create costs and benefits and MOS is not an exception”. Nếu bạn thường xuyên giữ tiền mặt nhiều hơn khẩu vị tự nhiên, quy trình đang tạo chi phí ròng.",
      en: "The cost is missing good opportunities: a wider margin of safety reduces the error of buying an overpriced stock (type 1) but increases the error of passing on a genuinely cheap one (type 2), and cash sitting out of the market is itself a cost. Damodaran: “Increasing your MOS will reduce your type 1 errors but will increase your type 2 errors”, and “There are very few actions in investing that don't create costs and benefits and MOS is not an exception”. If you routinely hold more cash than your natural appetite, the process is costing you on net.",
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2016/05/dcf-myth-31-margin-of-safety-tool-for.html',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q045',
    formulaId: 'bien-an-toan',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Định giá sơ sài nhưng mua rẻ hơn 40% thì biên an toàn có bảo vệ được không?' },
    choices: {
      a: { vi: 'Có, đó là mục đích của biên an toàn' },
      b: { vi: 'Gần như không — biên an toàn trên một định giá sai chỉ gây hại' },
      c: { vi: 'Có nếu doanh nghiệp trả cổ tức' },
      d: { vi: 'Có nếu nắm giữ trên 5 năm' },
    },
    answer: 'b',
    explain: {
      vi: 'Không. Biên an toàn là lớp đệm quanh một giá trị đã tính tử tế; nếu bản thân giá trị nội tại đã sai thì mua rẻ hơn 40% so với một con số sai vẫn có thể là mua đắt, mà lại yên tâm nhầm. Damodaran: “If your valuations are incomplete, badly done or biased, having a MOS on that value will provide little protection and can only hurt you”.',
      en: 'No. A margin of safety is a cushion around a value that was computed properly; if the intrinsic value is wrong to begin with, paying 40% below a wrong number can still be overpaying, only now with false confidence. Damodaran: “If your valuations are incomplete, badly done or biased, having a MOS on that value will provide little protection and can only hurt you”.',
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2016/05/dcf-myth-31-margin-of-safety-tool-for.html',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q046',
    formulaId: 'bien-an-toan',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Trên sàn VN, P/B dưới 1 đã đủ coi là có biên an toàn chưa?' },
    choices: {
      a: { vi: 'Rồi, vì mua dưới giá trị tài sản' },
      b: {
        vi: 'Chưa — báo cáo ghi nhận tài sản, còn thị trường định giá khả năng tài sản đó tạo tiền',
      },
      c: { vi: 'Chỉ đủ với doanh nghiệp bất động sản' },
      d: { vi: 'Chỉ đủ khi kèm ROE trên 15%' },
    },
    answer: 'b',
    explain: {
      vi: '“chữ sổ sách là phần dễ bị bỏ qua nhất. BCTC ghi nhận tài sản, còn thị trường định giá khả năng tài sản đó tạo tiền”; “Bẫy giá trị xuất hiện khi cổ phiếu trông rẻ nhưng thiếu cơ chế mở khóa giá trị”.',
    },
    source: {
      url: 'https://nguoiquansat.vn/co-phieu-duoi-gia-tri-so-sach-bai-hoc-benjamin-graham-va-chiec-bay-p-b-thap-tren-san-chung-khoan-viet-nam-296389.html',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
];
