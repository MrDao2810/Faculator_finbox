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
      en: 'In the Gordon growth model, why must g not exceed the growth rate of the economy?',
    },
    choices: {
      a: { vi: 'Vì quy định kế toán', en: 'Because of an accounting rule' },
      b: {
        vi: 'Vì đó là ràng buộc toán học, không phải giả định kinh tế để tranh luận',
        en: 'Because it is a mathematical constraint, not an economic assumption open to debate',
      },
      c: { vi: 'Vì g cao làm tăng rủi ro', en: 'Because a high g increases risk' },
      d: { vi: 'Vì nhà đầu tư không tin g cao', en: 'Because investors do not believe a high g' },
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
      en: 'You raise g from 3% to 5% in the Gordon formula but keep the final-year cash flow unchanged. What is wrong with that?',
    },
    choices: {
      a: {
        vi: 'Không sai, đó là phân tích độ nhạy',
        en: 'Nothing is wrong, that is just sensitivity analysis',
      },
      b: { vi: 'g phải là số nguyên', en: 'g must be a whole number' },
      c: { vi: 'Phải đổi cả lãi suất phi rủi ro', en: 'The risk-free rate must also be changed' },
      d: {
        vi: 'Tăng trưởng phải trả giá bằng tái đầu tư nên dòng tiền không thể giữ nguyên',
        en: 'Growth has to be paid for with reinvestment, so the cash flow cannot stay the same',
      },
    },
    answer: 'd',
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
      en: 'In the stable-growth stage, many people set CapEx equal to depreciation and ignore the change in working capital. What is the consequence?',
    },
    choices: {
      a: {
        vi: 'Tỷ lệ tái đầu tư thành 0 mà doanh nghiệp vẫn tăng trưởng mãi — giả định vô lý',
        en: 'The reinvestment rate becomes 0 while the company keeps growing forever — an absurd assumption',
      },
      b: { vi: 'Mô hình chính xác hơn', en: 'The model becomes more accurate' },
      c: { vi: 'Giá trị cuối kỳ bằng 0', en: 'Terminal value becomes 0' },
      d: { vi: 'Không ảnh hưởng gì', en: 'It has no effect at all' },
    },
    answer: 'a',
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
      en: 'A model has a company growing 30% a year for 5 years, then dropping to 6% forever from year 6. How does Damodaran assess this?',
    },
    choices: {
      a: { vi: 'Đây là chuẩn mực ngành', en: 'This is an industry standard' },
      b: { vi: 'Chỉ đúng với công ty công nghệ', en: 'This only holds for technology companies' },
      c: {
        vi: 'Bước chuyển đột ngột này gần như chắc chắn không thực tế',
        en: 'This sudden jump is almost certainly unrealistic',
      },
      d: {
        vi: 'Cần kéo dài giai đoạn 1 lên 10 năm là đủ',
        en: 'It is enough to just extend stage 1 to 10 years',
      },
    },
    answer: 'c',
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
    prompt: {
      vi: 'Doanh nghiệp nào KHÔNG dùng được mô hình chiết khấu cổ tức?',
      en: 'Which kind of company CANNOT use the dividend discount model?',
    },
    choices: {
      a: {
        vi: 'Doanh nghiệp trả cổ tức đều nhiều năm',
        en: 'A company that has paid steady dividends for many years',
      },
      b: { vi: 'Doanh nghiệp tăng trưởng chậm', en: 'A slow-growing company' },
      c: { vi: 'Doanh nghiệp ngành tiện ích', en: 'A utility-sector company' },
      d: {
        vi: 'Doanh nghiệp không trả cổ tức hoặc tỷ lệ chi trả thất thường',
        en: 'A company that pays no dividends or has an erratic payout ratio',
      },
    },
    answer: 'd',
    explain: {
      vi: 'ASEAN Securities: “không thể sử dụng nó cho bất kỳ công ty nào không trả cổ tức”, “thật khó để sử dụng mô hình này cho các công ty mới bắt đầu trả cổ tức hoặc có tỷ lệ chi trả cổ tức không nhất quán”. Vietstock: DDM “phù hợp để định giá các doanh nghiệp có tốc độ tăng trưởng chậm, chính sách trả cổ tức đều đặn”.',
      en: 'ASEAN Securities says it “không thể sử dụng nó cho bất kỳ công ty nào không trả cổ tức”, adding that “thật khó để sử dụng mô hình này cho các công ty mới bắt đầu trả cổ tức hoặc có tỷ lệ chi trả cổ tức không nhất quán”. Vietstock notes that DDM is “phù hợp để định giá các doanh nghiệp có tốc độ tăng trưởng chậm, chính sách trả cổ tức đều đặn”.',
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
      en: 'You look up the beta of the same stock on three financial websites and get three different numbers. Why?',
    },
    choices: {
      a: { vi: 'Một trong ba trang bị lỗi', en: 'One of the three sites has an error' },
      b: { vi: 'Beta thay đổi theo giờ giao dịch', en: 'Beta changes by the hour during trading' },
      c: {
        vi: 'Các trang dùng mốc thời gian và chỉ số tham chiếu khác nhau',
        en: 'The sites use different time windows and different reference indexes',
      },
      d: { vi: 'Do làm tròn', en: 'It is just rounding' },
    },
    answer: 'c',
    explain: {
      vi: 'Nguồn tiếng Việt ghi nhận đúng hiện tượng này: “Thường thì mấy trang web tài chính chứng khoán có kết quả tính hệ số Beta khá cách biệt”, và khuyên “bạn đừng cứng nhắc chỉ bám vào beta”. Damodaran bổ sung: sai số chuẩn của beta khoảng 0,20 nên beta 1,10 có thể thật sự nằm trong 0,70–1,50.',
      en: 'The Vietnamese source records exactly this phenomenon: “Thường thì mấy trang web tài chính chứng khoán có kết quả tính hệ số Beta khá cách biệt”, and advises that “bạn đừng cứng nhắc chỉ bám vào beta”. Damodaran adds that the standard error of beta is roughly 0.20, so a beta of 1.10 could realistically fall anywhere between 0.70 and 1.50.',
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
      en: 'A company is registered in Vietnam but earns 80% of its revenue from the US and Europe. How should the country risk premium be calculated?',
    },
    choices: {
      a: {
        vi: 'Theo nơi doanh nghiệp hoạt động, không theo nơi đăng ký',
        en: 'Based on where the company operates, not where it is registered',
      },
      b: { vi: 'Cộng nguyên phần bù rủi ro Việt Nam', en: 'Add the full Vietnam risk premium' },
      c: { vi: 'Bỏ qua vì đã có beta', en: 'Ignore it, since beta already covers that' },
      d: { vi: 'Lấy trung bình các nước', en: 'Take the average across countries' },
    },
    answer: 'a',
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
      en: 'How true is the claim that "beta has been proven useless", based on CFA Institute research?',
    },
    choices: {
      a: {
        vi: 'Không hẳn — danh mục beta cao vượt danh mục beta thấp hơn 5 điểm phần trăm/năm, và 2010–2020 CAPM đúng 10/11 năm',
        en: 'Not quite — a high-beta portfolio beat a low-beta one by more than 5 percentage points a year, and CAPM was right 10 of 11 years from 2010 to 2020',
      },
      b: { vi: 'Hoàn toàn đúng', en: 'Completely true' },
      c: { vi: 'Beta chỉ sai ở thị trường mới nổi', en: 'Beta is only wrong in emerging markets' },
      d: { vi: 'Chưa ai kiểm chứng', en: 'No one has verified it yet' },
    },
    answer: 'a',
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
    prompt: {
      vi: '“Tôi muốn lãi 15% nên chiết khấu ở 15%”. Damodaran nói gì về cách làm này?',
      en: '"I want to earn 15%, so I discount at 15%." What does Damodaran say about this approach?',
    },
    choices: {
      a: {
        vi: 'Mức lợi nhuận bạn muốn không phải là chi phí vốn của bạn',
        en: 'The return you want is not your cost of capital',
      },
      b: {
        vi: 'Hợp lý nếu đó là mục tiêu đầu tư',
        en: 'Reasonable if that is your investment target',
      },
      c: { vi: 'Chỉ sai khi lãi suất thấp', en: 'Only wrong when interest rates are low' },
      d: { vi: 'Đúng với nhà đầu tư cá nhân', en: 'True for individual investors' },
    },
    answer: 'a',
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
    prompt: {
      vi: 'Tập đoàn đa ngành dùng một WACC chung cho mọi dự án. Hậu quả là gì?',
      en: 'A conglomerate uses one common WACC for every project. What is the consequence?',
    },
    choices: {
      a: {
        vi: 'Mảng an toàn đi trợ giá cho mảng rủi ro',
        en: 'The safe division ends up subsidizing the risky one',
      },
      b: { vi: 'Tiết kiệm thời gian, không hại gì', en: 'It saves time and does no harm' },
      c: { vi: 'WACC bị tính thấp đi', en: 'WACC ends up understated' },
      d: {
        vi: 'Chỉ ảnh hưởng báo cáo, không ảnh hưởng quyết định',
        en: 'It only affects reporting, not decisions',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Hậu quả là dự án rủi ro cao được dự án an toàn gánh hộ: một rào cản chung đòi hỏi quá thấp ở mảng rủi ro nên dự án xấu dễ được duyệt, và quá cao ở mảng an toàn nên dự án tốt bị loại oan. Damodaran: “If you use the cost of capital of the company as your hurdle rate for all investments, risky investments (and businesses) will be subsidized by safe investments”, và ông xếp tỷ lệ rào cản cấp công ty vào nhóm huyền thoại cần bỏ.',
      en: 'The consequence is that safe projects subsidize risky ones: a single company-wide hurdle asks too little of the risky division, so bad projects clear it, and too much of the safe division, so good projects are rejected. Damodaran: “If you use the cost of capital of the company as your hurdle rate for all investments, risky investments (and businesses) will be subsidized by safe investments”, and he lists the company-level hurdle rate among the myths to drop.',
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
      en: 'You calculate a WACC of 9% but it feels "too low", so you tack on another 3% just to be safe. How do you assess this?',
    },
    choices: {
      a: { vi: 'Thận trọng là tốt', en: 'Being cautious is good' },
      b: {
        vi: 'Đây là cộng phần bù không căn cứ, chỉ vì con số trông không vừa mắt',
        en: 'This is adding an unfounded premium just because the number does not look right',
      },
      c: { vi: 'Đúng nếu thị trường biến động', en: 'Correct if the market is volatile' },
      d: { vi: 'Chỉ sai khi cộng quá 5%', en: 'Only wrong if you add more than 5%' },
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
    prompt: {
      vi: 'FCFF phải chiết khấu bằng tỷ lệ nào và cho ra giá trị gì?',
      en: 'FCFF must be discounted at what rate, and what value does that produce?',
    },
    choices: {
      a: {
        vi: 'Chi phí vốn chủ — ra giá trị vốn chủ',
        en: 'Cost of equity — produces equity value',
      },
      b: {
        vi: 'Lãi suất phi rủi ro — ra giá trị doanh nghiệp',
        en: 'Risk-free rate — produces firm value',
      },
      c: { vi: 'WACC — ra thẳng giá trị vốn chủ', en: 'WACC — produces equity value directly' },
      d: {
        vi: 'WACC — ra giá trị doanh nghiệp, còn phải trừ nợ',
        en: 'WACC — produces firm value, from which debt must still be subtracted',
      },
    },
    answer: 'd',
    explain: {
      vi: 'FCFF là dòng tiền của mọi bên nên chiết khấu bằng WACC: “the weighted average cost of capital (WACC) is the appropriate discount rate”. Shinhan Securities VN: FCFF cho ra “giá trị doanh nghiệp (bao gồm giá trị của chủ nợ và chủ sở hữu)” — muốn ra vốn chủ phải trừ nợ.',
      en: 'FCFF is cash flow to every capital provider, so it is discounted at WACC: “the weighted average cost of capital (WACC) is the appropriate discount rate”. Shinhan Securities VN: FCFF produces “giá trị doanh nghiệp (bao gồm giá trị của chủ nợ và chủ sở hữu)” — reaching equity value still requires subtracting debt.',
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
    prompt: {
      vi: 'Cộng khấu hao ngược vào lợi nhuận đã ra dòng tiền tự do chưa?',
      en: 'Does adding depreciation back into earnings already give you free cash flow?',
    },
    choices: {
      a: { vi: 'Rồi', en: 'Yes, it does' },
      b: { vi: 'Chỉ đúng với doanh nghiệp sản xuất', en: 'Only true for manufacturing companies' },
      c: {
        vi: 'Chưa — đó chỉ là một điểm dừng trung gian',
        en: 'Not yet — that is only an intermediate stop',
      },
      d: { vi: 'Chỉ đúng nếu không có nợ', en: 'Only true if there is no debt' },
    },
    answer: 'c',
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
    prompt: {
      vi: 'Doanh nghiệp trẻ tăng trưởng nhanh có FCFE âm nhiều năm. Kết luận nào hợp lý?',
      en: 'A young, fast-growing company has had negative FCFE for several years. Which conclusion is reasonable?',
    },
    choices: {
      a: {
        vi: 'Loại ngay vì dòng tiền âm',
        en: 'Reject it immediately because the cash flow is negative',
      },
      b: { vi: 'Doanh nghiệp đang gian lận', en: 'The company is committing fraud' },
      c: { vi: 'FCFE âm là lỗi tính toán', en: 'Negative FCFE is a calculation error' },
      d: {
        vi: 'Có thể do tái đầu tư nhiều hơn số kiếm được — một năm FCF còn nhiễu hơn một năm lợi nhuận',
        en: 'It may simply be reinvesting more than it earns — a single year of FCF is even noisier than a single year of earnings',
      },
    },
    answer: 'd',
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
    prompt: {
      vi: 'FCFE khác FCFF ở điểm nào khi chiết khấu?',
      en: 'How does FCFE differ from FCFF when it comes to discounting?',
    },
    choices: {
      a: {
        vi: 'FCFE chiết khấu bằng chi phí vốn chủ và ra thẳng giá trị vốn chủ',
        en: 'FCFE is discounted at the cost of equity and produces equity value directly',
      },
      b: { vi: 'FCFE cũng dùng WACC', en: 'FCFE also uses WACC' },
      c: { vi: 'FCFE dùng lãi suất trái phiếu', en: 'FCFE uses the bond interest rate' },
      d: { vi: 'Hai cái giống nhau', en: 'The two are the same' },
    },
    answer: 'a',
    explain: {
      vi: 'FCFE là dòng tiền sau khi trả nợ nên chiết khấu bằng chi phí vốn chủ: “the correct discount rate to use is the cost of equity”. Nhầm hai tỷ lệ này là lỗi kinh điển trong mô hình DCF.',
      en: 'FCFE is cash flow after debt service, so it is discounted at the cost of equity: “the correct discount rate to use is the cost of equity”. Confusing the two rates is a classic mistake in DCF models.',
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
      en: 'Terminal value accounts for 75% of the total value in your DCF model. What does Damodaran say?',
    },
    choices: {
      a: {
        vi: 'Mô hình không đáng tin, phải kéo dài dự báo',
        en: 'The model is not trustworthy; the forecast period must be extended',
      },
      b: { vi: 'Phải giảm xuống dưới 50%', en: 'It must be brought down below 50%' },
      c: {
        vi: 'Đáng lo là khi terminal value KHÔNG chiếm phần lớn giá trị',
        en: 'What should worry you is when terminal value does NOT account for most of the value',
      },
      d: {
        vi: 'Phải đổi sang phương pháp bội số',
        en: 'You must switch to a multiples-based method',
      },
    },
    answer: 'c',
    explain: {
      vi: 'Damodaran bác bỏ ngộ nhận này: “In fact, it is when it does not account for the bulk of the value that you should be wary of a DCF!” — vì phần lớn lợi nhuận của cổ đông đến từ tăng giá chứ không phải cổ tức. Vấn đề nằm ở chất lượng giả định tạo ra terminal value, không phải ở tỷ trọng.',
      en: "Damodaran rejects this misconception: “In fact, it is when it does not account for the bulk of the value that you should be wary of a DCF!” — because most of a shareholder's return comes from price appreciation, not dividends. The real issue is the quality of the assumptions behind the terminal value, not its share of the total.",
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
      en: 'After computing terminal value with the Gordon formula, what is the mandatory next step?',
    },
    choices: {
      a: { vi: 'Chiết khấu nó về hiện tại', en: 'Discount it back to the present' },
      b: {
        vi: 'Cộng thẳng vào tổng hiện giá các dòng tiền',
        en: 'Add it directly to the sum of the present values of the cash flows',
      },
      c: { vi: 'Nhân với tỷ lệ tăng trưởng', en: 'Multiply it by the growth rate' },
      d: { vi: 'Trừ đi vốn lưu động', en: 'Subtract working capital from it' },
    },
    answer: 'a',
    explain: {
      vi: 'Terminal value tính tại thời điểm cuối kỳ dự báo nên phải chiết khấu tiếp: “A crucial next step is to discount the terminal value (TV) to the present date”. Cùng nguồn khuyến nghị g cuối kỳ nằm trong 2–4% theo GDP.',
      en: 'Terminal value is computed as of the end of the forecast period, so it still has to be discounted: “A crucial next step is to discount the terminal value (TV) to the present date”. The same source recommends keeping the terminal growth rate in the 2–4% range, in line with GDP.',
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
      en: 'What does Damodaran call a model that mixes equity cash flow with a firm-wide discount rate?',
    },
    choices: {
      a: { vi: 'Mô hình bảo thủ', en: 'A conservative model' },
      b: {
        vi: 'Chimera DCF — trộn các đơn vị không tương thích',
        en: 'A Chimera DCF — mixing incompatible units',
      },
      c: { vi: 'Mô hình hai giai đoạn', en: 'A two-stage model' },
      d: { vi: 'Mô hình rút gọn', en: 'A simplified model' },
    },
    answer: 'b',
    explain: {
      vi: 'Damodaran đặt tên cho lỗi này trong bài “If you have a D and a CF, you have a DCF!”. Bốn chiều phải nhất quán: vốn chủ vs doanh nghiệp, trước thuế vs sau thuế, danh nghĩa vs thực, và đồng tiền — điều rất đáng chú ý khi trộn dòng tiền VND với chiết khấu theo USD.',
      en: 'Damodaran names this mistake in his piece “If you have a D and a CF, you have a DCF!”. Four dimensions have to stay consistent: equity vs. firm, pre-tax vs. after-tax, nominal vs. real, and currency — well worth noting when VND cash flows get mixed with a USD discount rate.',
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
      en: "Vietnam's asset-valuation regulation uses the commercial bank interest rate in the valuation year as the discount rate. What is the shortcoming?",
    },
    choices: {
      a: {
        vi: 'Lạm phát của đúng một năm quyết định giá trị tài sản dùng hai ba mươi năm',
        en: 'The inflation of a single year ends up determining the value of an asset that is used for twenty or thirty years',
      },
      b: { vi: 'Không có bất cập', en: 'There is no shortcoming' },
      c: { vi: 'Lãi suất ngân hàng quá cao', en: 'The bank interest rate is too high' },
      d: { vi: 'Không áp dụng được cho bất động sản', en: 'It cannot be applied to real estate' },
    },
    answer: 'a',
    explain: {
      vi: 'Nghiên cứu của ĐH Lâm nghiệp: “tỷ lệ lạm phát của năm định giá sẽ quyết định giá của tài sản có thời hạn sử dụng... hai ba mươi năm sau đó”, và chỉ ra chênh lệch giá trị quy đổi của cùng một luồng thu nhập 20 năm lên tới 2,34 lần. Tác giả đề xuất dùng dữ liệu bình quân đa năm.',
      en: 'Research from the Vietnam National University of Forestry: “tỷ lệ lạm phát của năm định giá sẽ quyết định giá của tài sản có thời hạn sử dụng... hai ba mươi năm sau đó”, and shows the converted value of the same 20-year income stream can differ by as much as 2.34 times. The authors recommend using multi-year average data instead.',
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
      en: 'Profit growth differs from year to year. Using a 7.14%/year arithmetic average to project to 2022 gives VND 162.08 billion, while the actual figure is VND 148.43 billion. Why the gap?',
    },
    choices: {
      a: {
        vi: 'Trung bình cộng phóng đại vì không phản ánh tính tích luỹ — phải dùng CAGR 5,80%',
        en: 'The arithmetic average overstates it because it ignores compounding — the 5.80% CAGR should be used instead',
      },
      b: { vi: 'Do làm tròn', en: 'It is just rounding' },
      c: { vi: 'Do thiếu một năm dữ liệu', en: "It is missing a year's data" },
      d: { vi: 'Do lạm phát', en: 'It is due to inflation' },
    },
    answer: 'a',
    explain: {
      vi: 'Nguồn tính cả hai chiều: trung bình cộng 7,14% ra 162,08 tỷ, còn CAGR 5,80% ra “148.43 tỷ. Đúng bằng với số thật”.',
      en: 'The source computes it both ways: the 7.14% arithmetic average gives VND 162.08 billion, while the 5.80% CAGR gives “148.43 tỷ. Đúng bằng với số thật”.',
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
    prompt: {
      vi: 'Bạn nới biên an toàn từ 30% lên 50% để an toàn hơn. Cái giá phải trả là gì?',
      en: 'You widen your margin of safety from 30% to 50% to be safer. What is the cost of doing that?',
    },
    choices: {
      a: {
        vi: 'Giảm sai lầm loại 1 nhưng tăng sai lầm loại 2 — bỏ lỡ cơ hội',
        en: 'It reduces type 1 errors but increases type 2 errors — missed opportunities',
      },
      b: { vi: 'Không có giá nào', en: 'There is no cost at all' },
      c: { vi: 'Phải trả phí giao dịch cao hơn', en: 'You have to pay higher transaction fees' },
      d: { vi: 'Mất quyền nhận cổ tức', en: 'You lose the right to receive dividends' },
    },
    answer: 'a',
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
    prompt: {
      vi: 'Định giá sơ sài nhưng mua rẻ hơn 40% thì biên an toàn có bảo vệ được không?',
      en: 'If the valuation itself is sloppy but you buy 40% below it, can the margin of safety still protect you?',
    },
    choices: {
      a: {
        vi: 'Có, đó là mục đích của biên an toàn',
        en: 'Yes, that is exactly what a margin of safety is for',
      },
      b: {
        vi: 'Gần như không — biên an toàn trên một định giá sai chỉ gây hại',
        en: 'Almost not at all — a margin of safety on a flawed valuation only does harm',
      },
      c: { vi: 'Có nếu doanh nghiệp trả cổ tức', en: 'Yes, if the company pays dividends' },
      d: { vi: 'Có nếu nắm giữ trên 5 năm', en: 'Yes, if held for more than 5 years' },
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
    prompt: {
      vi: 'Trên sàn VN, P/B dưới 1 đã đủ coi là có biên an toàn chưa?',
      en: 'On the Vietnamese stock market, is a P/B below 1 already enough to count as a margin of safety?',
    },
    choices: {
      a: {
        vi: 'Rồi, vì mua dưới giá trị tài sản',
        en: 'Yes, because you are buying below asset value',
      },
      b: {
        vi: 'Chỉ đủ với doanh nghiệp bất động sản',
        en: 'Only enough for real estate companies',
      },
      c: { vi: 'Chỉ đủ khi kèm ROE trên 15%', en: 'Only enough when paired with an ROE above 15%' },
      d: {
        vi: 'Chưa — báo cáo ghi nhận tài sản, còn thị trường định giá khả năng tài sản đó tạo tiền',
        en: 'Not yet — the financial statements record the assets, while the market prices the ability of those assets to generate cash',
      },
    },
    answer: 'd',
    explain: {
      vi: '“chữ sổ sách là phần dễ bị bỏ qua nhất. BCTC ghi nhận tài sản, còn thị trường định giá khả năng tài sản đó tạo tiền”; “Bẫy giá trị xuất hiện khi cổ phiếu trông rẻ nhưng thiếu cơ chế mở khóa giá trị”.',
      en: '“chữ sổ sách là phần dễ bị bỏ qua nhất. BCTC ghi nhận tài sản, còn thị trường định giá khả năng tài sản đó tạo tiền”; “Bẫy giá trị xuất hiện khi cổ phiếu trông rẻ nhưng thiếu cơ chế mở khóa giá trị”.',
    },
    source: {
      url: 'https://nguoiquansat.vn/co-phieu-duoi-gia-tri-so-sach-bai-hoc-benjamin-graham-va-chiec-bay-p-b-thap-tren-san-chung-khoan-viet-nam-296389.html',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
];
