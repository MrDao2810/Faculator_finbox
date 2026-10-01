/**
 * Câu hỏi kiểm tra hiểu bài — nhóm Vay nợ, tiết kiệm & DCA.
 *
 * Mỗi câu gắn một nguồn thật; xem bất biến ở `../types.ts`. Không thêm câu nào vào đây mà
 * không có `source.url` trỏ tới chỗ đọc được điều câu hỏi đang kiểm tra.
 */

import type { QuizItem } from '../types';

export const CA_NHAN: ReadonlyArray<QuizItem> = [
  {
    id: 'Q188',
    formulaId: 'tra-gop-goc-deu',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Vay 120 triệu, 12%/năm, 12 tháng. Tổng lãi theo dư nợ gốc ban đầu và theo dư nợ giảm dần lần lượt là?',
      en: 'Borrow 120 million, 12%/year, over 12 months. What is the total interest under the flat-rate method (interest on the original principal) and under the declining-balance method, respectively?',
    },
    choices: {
      a: { vi: '14,4 triệu cả hai', en: '14.4 million for both' },
      b: { vi: '7,8 triệu và 14,4 triệu', en: '7.8 million and 14.4 million' },
      c: { vi: 'Bằng nhau', en: 'The same' },
      d: { vi: '14,4 triệu và 7,8 triệu', en: '14.4 million and 7.8 million' },
    },
    answer: 'd',
    explain: {
      vi: 'Nguồn tính sẵn: “Theo dư nợ gốc: Tiền lãi mỗi tháng 1.200.000 VND (không đổi), Tổng lãi 12 tháng: 14.400.000 VND” so với “Theo dư nợ giảm dần... Tổng lãi 12 tháng: 7.800.000 VND” — cùng một con số 12%/năm nhưng chênh gần gấp đôi.',
      en: 'The source has already worked this out: under the original-balance method the monthly interest is a constant 1,200,000 VND and the 12-month total is 14,400,000 VND — “Theo dư nợ gốc: Tiền lãi mỗi tháng 1.200.000 VND (không đổi), Tổng lãi 12 tháng: 14.400.000 VND” — versus a 12-month total of 7,800,000 VND under the declining-balance method — “Theo dư nợ giảm dần... Tổng lãi 12 tháng: 7.800.000 VND”. Same 12%/year rate, but the difference is nearly double.',
    },
    source: {
      url: 'https://wiki.batdongsan.com.vn/wiki/du-no-goc-va-du-no-giam-dan-la-gi-109402',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q189',
    formulaId: 'tra-gop-goc-deu',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Gói A ghi 2,2%/tháng trên dư nợ gốc, gói B ghi 3,75%/tháng trên dư nợ giảm dần. Gói nào đắt hơn?',
      en: 'Package A states 2.2%/month on the original balance, package B states 3.75%/month on the declining balance. Which package is more expensive?',
    },
    choices: {
      a: { vi: 'Gói B vì con số lớn hơn', en: 'Package B, because the figure is bigger' },
      b: { vi: 'Gói A', en: 'Package A' },
      c: { vi: 'Không so được', en: 'They cannot be compared' },
      d: {
        vi: 'Số tiền phải trả như nhau — hai con số chỉ là hai cách diễn đạt',
        en: 'The amount payable is the same — the two figures are just two ways of expressing it',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Nguồn nêu đúng cặp số này: “với lãi suất trên dư nợ gốc là 2.2%/tháng thì mức lãi suất trên dư nợ giảm dần sẽ là 3.75%/tháng, nhưng số tiền bạn phải trả như nhau”. Vì vậy phải hỏi phương pháp tính trước khi so hai con số.',
      en: 'The source gives exactly this pair of figures: a 2.2%/month rate on the original balance is equivalent to a 3.75%/month rate on the declining balance, with the amount actually payable being the same — “với lãi suất trên dư nợ gốc là 2.2%/tháng thì mức lãi suất trên dư nợ giảm dần sẽ là 3.75%/tháng, nhưng số tiền bạn phải trả như nhau”. So you have to ask which method is used before comparing two rates.',
    },
    source: {
      url: 'https://wiki.batdongsan.com.vn/wiki/du-no-goc-va-du-no-giam-dan-la-gi-109402',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q190',
    formulaId: 'lich-tra-no',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Trả góp niên kim 30 năm. Ở kỳ trả đầu tiên, bao nhiêu phần trăm tiền đi vào lãi?',
      en: 'A 30-year annuity loan. In the very first payment, what percentage of the money goes to interest?',
    },
    choices: {
      a: { vi: 'Khoảng 80–90%', en: 'About 80–90%' },
      b: { vi: 'Khoảng 50%', en: 'About 50%' },
      c: { vi: 'Khoảng 20%', en: 'About 20%' },
      d: { vi: 'Chia đều gốc và lãi', en: 'Split evenly between principal and interest' },
    },
    answer: 'a',
    explain: {
      vi: 'Khoảng 80 đến 90% kỳ trả đầu tiên là lãi, chỉ 10 đến 20% vào gốc: đầu kỳ dư nợ còn nguyên nên phần lãi tính trên nó lớn nhất, và tỷ lệ chỉ đảo dần về sau. Với khoản vay 30 năm, điểm mà gốc bằng lãi chỉ đến quanh kỳ thứ 257, tức đã đi hơn hai phần ba kỳ hạn. “payment 1 allocates about 80-90% of the total payment towards interest and only 10-20% toward the principal balance”, và điểm cân bằng ở “payment 257 or over two thirds through the term”.',
      en: 'Roughly 80 to 90% of the first payment is interest and only 10 to 20% principal: at the start the balance is untouched, so the interest computed on it is at its largest, and the split only reverses gradually. On a 30-year loan the point where principal equals interest arrives around payment 257, more than two thirds of the way through. The source: “payment 1 allocates about 80-90% of the total payment towards interest and only 10-20% toward the principal balance”, with the crossover at “payment 257 or over two thirds through the term”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Amortization_schedule',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q191',
    formulaId: 'tra-gop-nien-kim',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Khoản trả hằng tháng cố định có nghĩa là gốc cũng được trả đều không?',
      en: 'Does a fixed monthly payment mean the principal is also paid off evenly?',
    },
    choices: {
      a: { vi: 'Có', en: 'Yes' },
      b: { vi: 'Có nếu lãi suất cố định', en: 'Yes, if the interest rate is fixed' },
      c: { vi: 'Có với khoản vay dưới 5 năm', en: 'Yes, for loans under 5 years' },
      d: {
        vi: 'Không — tổng tiền giữ nguyên nhưng giai đoạn đầu phần lãi lớn hơn phần gốc',
        en: 'No — the total payment stays the same, but early on the interest portion is larger than the principal portion',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Bài trên Thời báo Ngân hàng: ngân hàng “chia đều số tiền cả lãi và gốc trong các năm để đảm bảo số tiền phải trả hàng tháng là khoản tương đối cố định”; có phương án 21 tháng đầu khách hàng “chỉ trả lãi cho khoản vay”, từ tháng 22 mới “trả cả lãi lẫn gốc”.',
      en: 'A Thời báo Ngân hàng article explains that banks spread principal and interest evenly across the loan term so the monthly payment stays roughly fixed — “chia đều số tiền cả lãi và gốc trong các năm để đảm bảo số tiền phải trả hàng tháng là khoản tương đối cố định”. Under one plan, the customer pays interest only for the first 21 months — “chỉ trả lãi cho khoản vay” — and only starts paying both principal and interest from month 22 — “trả cả lãi lẫn gốc”.',
    },
    source: {
      url: 'https://thoibaonganhang.vn/nien-kim-co-dinh-don-gian-hoa-bai-toan-tai-chinh-cho-nguoi-mua-nha-84990.html',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q192',
    formulaId: 'lich-tra-no',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Anh Khôi vay 353 triệu mua xe, năm đầu ưu đãi 8,2%/năm. Sau ưu đãi, lãi suất thả nổi là bao nhiêu?',
      en: 'Mr. Khôi borrows 353 million to buy a car, with a first-year promotional rate of 8.2%/year. After the promotional period, what does the floating rate become?',
    },
    choices: {
      a: { vi: 'Khoảng 10%', en: 'About 10%' },
      b: { vi: '12%', en: '12%' },
      c: {
        vi: '18%/năm, và biên độ tăng từ 3,6% lên 6,6%',
        en: '18%/year, with the margin rising from 3.6% to 6.6%',
      },
      d: { vi: 'Giữ nguyên 8,2%', en: 'Stays at 8.2%' },
    },
    answer: 'c',
    explain: {
      vi: 'Trường hợp thật trên VietnamFinance: “khoản vay chuyển qua lãi suất thả nổi từ kỳ thanh toán tháng 7 với mức 18%/năm”. Điểm ít ai lường: không chỉ lãi suất cơ sở tăng mà BIÊN ĐỘ cũng bị nâng lên.',
      en: 'A real case reported by VietnamFinance: the loan switched to the floating rate from the July payment period, at 18%/year — “khoản vay chuyển qua lãi suất thả nổi từ kỳ thanh toán tháng 7 với mức 18%/năm”. The part few people expect: it is not only the base rate that rises — the MARGIN gets raised too.',
    },
    source: {
      url: 'https://vietnamfinance.vn/lai-tha-noi-cham-dinh-18-nam-nguoi-mua-nha-xe-tra-gop-ban-het-de-thoat-no-d150828.html',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q193',
    formulaId: 'lich-tra-no',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Khoản vay 3 tỷ đồng, lãi suất tăng 4 điểm phần trăm. Tiền trả hằng tháng thay đổi thế nào?',
      en: 'A 3 billion dong loan, with the interest rate rising 4 percentage points. How does the monthly payment change?',
    },
    choices: {
      a: { vi: 'Tăng khoảng 2 triệu', en: 'Rises by about 2 million' },
      b: { vi: 'Từ 30 triệu lên gần 40 triệu', en: 'From 30 million to nearly 40 million' },
      c: { vi: 'Không đổi, chỉ kéo dài kỳ hạn', en: 'Unchanged — only the term is extended' },
      d: { vi: 'Tăng khoảng 5%', en: 'Rises by about 5%' },
    },
    answer: 'b',
    explain: {
      vi: 'Trường hợp chị Nguyễn Huyền (Hà Nội): “mỗi tháng chị phải gánh thêm khoảng 10 triệu đồng tiền lãi phát sinh, nâng tổng số tiền gốc và lãi phải trả hàng tháng từ 30 triệu lên gần 40 triệu đồng” — tăng khoảng một phần ba.',
      en: 'The case of Ms. Nguyễn Huyền (Hanoi): she now bears an extra roughly 10 million dong of interest each month, raising her total monthly principal-and-interest payment from 30 million to nearly 40 million — “mỗi tháng chị phải gánh thêm khoảng 10 triệu đồng tiền lãi phát sinh, nâng tổng số tiền gốc và lãi phải trả hàng tháng từ 30 triệu lên gần 40 triệu đồng” — a rise of about a third.',
    },
    source: {
      url: 'https://docnhanh.vn/kinh-te/cu-soc-lai-suat-tha-noi-nguoi-mua-nha-ngop-tho-vi-chi-phi-tra-no-tang-them-ca-chuc-trieu-moi-thang-tintuc1033352',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q194',
    formulaId: 'lich-tra-no',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Thời gian ưu đãi lãi suất vay mua nhà ở VN phổ biến kéo dài bao lâu?',
      en: 'In Vietnam, how long does a promotional home-loan interest rate typically last?',
    },
    choices: {
      a: { vi: '3–5 năm', en: '3–5 years' },
      b: { vi: 'Toàn bộ kỳ hạn', en: 'The entire loan term' },
      c: {
        vi: '6–12 tháng, sau đó lãi thực tế phổ biến 13–15%/năm',
        en: '6–12 months, after which the actual rate is typically 13–15%/year',
      },
      d: { vi: '24–36 tháng', en: '24–36 months' },
    },
    answer: 'c',
    explain: {
      vi: '“Lãi suất vay mua nhà trong thời gian ưu đãi hiện phổ biến 8,5-11%/năm, với thời gian áp dụng thường kéo dài 6-12 tháng”, còn “Lãi suất thực tế người vay phải chịu hiện phổ biến 13-15%/năm”, tính bằng lãi suất cơ sở cộng biên độ khoảng 3,3–3,5%.',
      en: 'The promotional home-loan rate is typically 8.5–11%/year, usually lasting 6 to 12 months — “Lãi suất vay mua nhà trong thời gian ưu đãi hiện phổ biến 8,5-11%/năm, với thời gian áp dụng thường kéo dài 6-12 tháng” — while the actual rate borrowers end up paying is typically 13–15%/year — “Lãi suất thực tế người vay phải chịu hiện phổ biến 13-15%/năm” — computed as the base rate plus a margin of about 3.3–3.5%.',
    },
    source: {
      url: 'https://dantri.com.vn/bat-dong-san/lai-vay-mua-nha-len-13-15-sau-uu-dai-lam-gi-de-tranh-can-kiet-dong-tien-20260811163931692.htm',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q195',
    formulaId: 'lich-tra-no',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Có tiền và muốn tất toán khoản vay sớm. Chi phí phát sinh?',
      en: 'You have the money and want to close out the loan early. What cost does that trigger?',
    },
    choices: {
      a: { vi: 'Không có', en: 'None' },
      b: {
        vi: 'Phí trả nợ trước hạn tính bằng tỷ lệ % nhân số tiền trả trước, giảm dần theo số năm đã vay',
        en: 'An early-repayment fee, calculated as a percentage of the prepaid amount, that decreases the longer the loan has run',
      },
      c: { vi: 'Phí cố định theo hợp đồng', en: 'A fixed fee set by the contract' },
      d: { vi: 'Chỉ mất phần lãi còn lại', en: 'Only the remaining interest is lost' },
    },
    answer: 'b',
    explain: {
      vi: 'Thông tư 39/2016/TT-NHNN cho phép các bên thoả thuận phí trả nợ trước hạn. Mức công bố: Vietcombank 0,3–1% (khoản trung/dài hạn) hoặc 1,5% năm đầu và miễn từ năm thứ 6; Techcombank 2–3% tuỳ năm; OCB 3–5%; BVBank 3% năm đầu, miễn sau 4 năm.',
      en: 'Circular 39/2016/TT-NHNN lets the two parties agree on an early-repayment fee. Published rates: Vietcombank 0.3–1% (medium/long-term loans) or 1.5% in the first year, waived from year 6 onward; Techcombank 2–3% depending on the year; OCB 3–5%; BVBank 3% in the first year, waived after 4 years.',
    },
    source: {
      url: 'https://vnba.org.vn/vi/phi-phat-tra-no-truoc-han-duoc-tinh-nhu-the-nao-11962.htm',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q196',
    formulaId: 'rut-truoc-han',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Gửi 100 triệu kỳ hạn 12 tháng lãi 5,5%/năm, rút toàn bộ ở tháng thứ 6. Nhận được bao nhiêu lãi?',
      en: 'You deposit 100 million for a 12-month term at 5.5%/year, then withdraw the whole amount in month 6. How much interest do you get?',
    },
    choices: {
      a: { vi: 'Khoảng 2,75 triệu (một nửa)', en: 'About 2.75 million (half)' },
      b: { vi: 'Mất trắng toàn bộ lãi', en: 'You lose all the interest entirely' },
      c: {
        vi: 'Vài chục nghìn đồng — toàn bộ thời gian gửi tính lại theo lãi không kỳ hạn 0,1–0,2%/năm',
        en: 'A few tens of thousands of dong — the whole deposit period is recalculated at the demand-deposit rate of 0.1–0.2%/year',
      },
      d: { vi: 'Lãi theo kỳ hạn 6 tháng', en: 'Interest at the 6-month term rate' },
    },
    answer: 'c',
    explain: {
      vi: 'Nguồn nêu đúng ví dụ này: người gửi chỉ nhận vài chục nghìn đồng thay vì hơn 2,5 triệu đồng tiền lãi kỳ hạn. Lưu ý thêm: nhiều người tưởng rút trước hạn là “mất trắng” lãi, thực tế vẫn được hưởng lãi suất không kỳ hạn.',
      en: 'The source gives exactly this example: the depositor receives only a few tens of thousands of dong instead of the more than 2.5 million dong of term interest. Worth noting: many people assume an early withdrawal means “mất trắng” (losing it all) on the interest, but in fact you still earn the demand-deposit rate.',
    },
    source: {
      url: 'https://kenh14.vn/rut-tien-tiet-kiem-giua-chung-ban-se-mat-bao-nhieu-lai-215251004185554376.chn',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q197',
    formulaId: 'rut-truoc-han',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Gửi 1 tỷ lãi 6%/năm, cần gấp 500 triệu. Theo Thông tư 04/2022 (hiệu lực 01/8/2022), nên làm gì?',
      en: 'You have 1 billion on deposit at 6%/year and urgently need 500 million. Under Circular 04/2022 (effective 01/08/2022), what should you do?',
    },
    choices: {
      a: { vi: 'Tất toán cả sổ', en: 'Close out the whole account' },
      b: { vi: 'Vay cầm cố sổ', en: 'Take a loan against the passbook' },
      c: {
        vi: 'Rút một phần — phần rút chịu lãi không kỳ hạn, 500 triệu còn lại vẫn hưởng 6%',
        en: 'Make a partial withdrawal — the withdrawn portion earns the demand-deposit rate, while the remaining 500 million still earns 6%',
      },
      d: { vi: 'Không rút được trước hạn', en: 'You cannot withdraw early at all' },
    },
    answer: 'c',
    explain: {
      vi: '“chỉ phần rút trước hạn chịu lãi suất không kỳ hạn, phần tiền gửi còn lại được ngân hàng giữ nguyên mức lãi suất”. Trước Thông tư 04/2022, rút trước hạn buộc phải tất toán toàn bộ và chịu lãi không kỳ hạn trên cả sổ.',
      en: 'Only the early-withdrawn portion earns the demand-deposit rate, while the bank keeps the remaining deposit at its original rate — “chỉ phần rút trước hạn chịu lãi suất không kỳ hạn, phần tiền gửi còn lại được ngân hàng giữ nguyên mức lãi suất”. Before Circular 04/2022, an early withdrawal forced a full closeout, with the demand-deposit rate applied across the entire account.',
    },
    source: {
      url: 'https://cafef.vn/rut-mot-phan-tien-tiet-kiem-truoc-ky-han-co-duoc-huong-lai-cao-188230918105219101.chn',
      kind: 'quy-dinh',
      vietnam: true,
      effectiveFrom: '2022-08-01',
    },
  },
  {
    id: 'Q198',
    formulaId: 'lai-tien-gui',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Công thức tính lãi ngân hàng VN công bố dùng mẫu số nào?',
      en: 'What denominator does the interest formula published by Vietnamese banks use?',
    },
    choices: {
      a: {
        vi: '365 ngày và số ngày sử dụng thực tế',
        en: '365 days, with the actual number of days used',
      },
      b: { vi: '360 ngày', en: '360 days' },
      c: { vi: '12 tháng tròn', en: '12 whole months' },
      d: { vi: '30 ngày mỗi tháng', en: '30 days per month' },
    },
    answer: 'a',
    explain: {
      vi: 'Công thức ngân hàng công bố: “Tiền lãi = ∑ (Dư nợ thực tế x Lãi suất/365 x Số ngày sử dụng)”. Nếu app dùng quy ước 30 ngày/tháng thì kết quả sẽ lệch so với số ngân hàng trả — ví dụ 1 tỷ gửi 6 tháng lãi 8,1%: quy ước 30 ngày ra 40,5 triệu, tính theo ngày thực ra khoảng 39,9 triệu.',
      en: 'The formula the bank publishes: interest equals the sum, over the period, of actual balance times rate divided by 365 times days used — “Tiền lãi = ∑ (Dư nợ thực tế x Lãi suất/365 x Số ngày sử dụng)”. If an app instead assumes 30 days per month, the result will differ from what the bank actually pays — for example, 1 billion deposited for 6 months at 8.1%: the 30-day convention gives 40.5 million, while the actual-days calculation gives about 39.9 million.',
    },
    source: {
      url: 'https://techcombank.com/thong-tin/blog/cach-tinh-lai-vay-ngan-hang',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q226',
    formulaId: 'tiet-kiem-muc-tieu',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Bạn lấy lãi suất 12 tháng ngân hàng niêm yết điền vào ô Lãi suất kỳ vọng cho kế hoạch gửi đều hằng tháng. Khoản gửi mỗi tháng mà công thức trả về khi đó thế nào?',
      en: "You take the bank's posted 12-month rate and type it into the Expected rate field for a plan of equal monthly deposits. What happens to the monthly deposit the formula returns?",
    },
    choices: {
      a: {
        vi: 'Cao hơn mức thật sự cần, vì gửi góp được cộng thêm lãi ưu đãi cho khách gửi đều',
        en: 'It comes out higher than what is really needed, because monthly-contribution accounts carry a bonus rate for regular savers',
      },
      b: {
        vi: 'Đúng bằng mức cần, vì mọi hình thức tiết kiệm cùng kỳ hạn đều áp chung một lãi suất niêm yết',
        en: 'It is exactly right, because every savings product of the same term carries the one posted rate',
      },
      c: {
        vi: 'Không đổi, vì lãi suất chỉ tác động tới số tiền mục tiêu chứ không tới khoản gửi hằng tháng',
        en: 'It is unchanged, because the rate affects only the target amount, not the monthly deposit',
      },
      d: {
        vi: 'Thấp hơn mức thật sự cần, vì sản phẩm gửi góp thường trả lãi thấp hơn gửi thông thường cùng kỳ hạn',
        en: 'It comes out lower than what is really needed, because monthly-contribution accounts usually pay less than a standard deposit of the same term',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Bà Nguyễn Phương Huyền (Sacombank) nêu rõ chênh lệch này: “So với gửi tiết kiệm thông thường, tiết kiệm gửi góp thường có lãi suất thấp hơn khi gửi cùng kỳ hạn.” Lãi suất nằm ở mẫu số (1+i)^n − 1, nên điền lãi cao hơn thực tế làm mẫu số phình ra và khoản gửi hằng tháng nhỏ đi — kế hoạch trông nhẹ hơn khả năng thật và về đích hụt tiền.',
      en: 'Nguyễn Phương Huyền of Sacombank states the gap plainly: “So với gửi tiết kiệm thông thường, tiết kiệm gửi góp thường có lãi suất thấp hơn khi gửi cùng kỳ hạn.” The rate sits in the denominator (1+i)^n − 1, so an overstated rate inflates the denominator and shrinks the monthly deposit — the plan looks easier than it is and lands short of the goal.',
    },
    source: {
      url: 'https://vnexpress.net/nen-mo-tiet-kiem-gui-gop-hay-gui-thong-thuong-4276935.html',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q227',
    formulaId: 'tiet-kiem-muc-tieu',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Kế hoạch 60 tháng, ô Lãi suất kỳ vọng điền 6%/năm. Giả định nào của công thức dễ hỏng nhất khi gửi tiết kiệm ở Việt Nam?',
      en: 'A 60-month plan with 6%/year typed into the Expected rate field. Which assumption is the most likely to break for a Vietnamese bank deposit?',
    },
    choices: {
      a: {
        vi: 'Không có giả định nào bị hỏng, vì ngân hàng cam kết mức lãi suất cho tới khi đạt mục tiêu',
        en: 'Nothing breaks: the bank commits to the rate until the goal is reached',
      },
      b: {
        vi: 'Công thức giữ nguyên một mức lãi suất suốt 60 tháng, trong khi lãi chỉ cố định trong một kỳ hạn rồi đổi lúc tái tục',
        en: 'The formula holds one rate across all 60 months, whereas the rate is fixed only within a term and is reset on rollover',
      },
      c: {
        vi: 'Công thức quá thận trọng, vì lãi suất tiết kiệm tăng dần theo thời gian gửi',
        en: 'The formula is too conservative, because savings rates climb the longer the money stays deposited',
      },
      d: {
        vi: 'Lãi suất chỉ thay đổi khi Ngân hàng Nhà nước điều chỉnh trần lãi suất huy động',
        en: 'The rate moves only when the State Bank changes the deposit rate ceiling',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn bác bỏ thẳng cách hiểu “để lâu thì lãi suất tự lên”: “Một số người vẫn cho rằng lãi suất sẽ tăng dần theo thời gian, suy nghĩ này về gửi tiết kiệm là sai lầm. Lãi suất được cố định cho mỗi kỳ hạn gửi tiết kiệm và không thay đổi trong suốt kỳ hạn đó.” Mức 6% chỉ chắc chắn trong đúng kỳ hạn đã chọn; các kỳ sau phải tái tục theo lãi suất tại thời điểm đó, nên con số công thức đưa ra là một kịch bản chứ không phải một cam kết.',
      en: "The source directly rejects the idea that “để lâu thì lãi suất tự lên” (a rate rises on its own the longer you leave the money): “Một số người vẫn cho rằng lãi suất sẽ tăng dần theo thời gian, suy nghĩ này về gửi tiết kiệm là sai lầm. Lãi suất được cố định cho mỗi kỳ hạn gửi tiết kiệm và không thay đổi trong suốt kỳ hạn đó.” The 6% is locked only for the term you picked; later terms roll over at whatever rate applies then, so the formula's output is a scenario, not a commitment.",
    },
    source: {
      url: 'https://timo.vn/blogs/nhung-lam-tuong-ve-gui-tiet-kiem-lai-kep/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q228',
    formulaId: 'tiet-kiem-muc-tieu',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Công thức giả định khoản gửi hằng tháng rơi vào thời điểm nào trong tháng, và điều đó kéo theo gì?',
      en: 'When in the month does the formula assume each deposit lands, and what follows from that?',
    },
    choices: {
      a: {
        vi: 'Cuối mỗi tháng, nên khoản gửi của tháng cuối cùng không kịp sinh đồng lãi nào',
        en: "At the end of each month, so the final month's deposit earns no interest at all",
      },
      b: {
        vi: 'Đầu mỗi tháng, nên mọi khoản gửi đều được tính ít nhất một tháng lãi',
        en: 'At the start of each month, so every deposit earns at least one month of interest',
      },
      c: {
        vi: 'Giữa tháng, nên mỗi khoản gửi được tính nửa tháng lãi',
        en: 'Mid-month, so every deposit is credited half a month of interest',
      },
      d: {
        vi: 'Thời điểm gửi trong tháng không ảnh hưởng, vì lãi chỉ tính trên tổng số dư cuối kỳ',
        en: 'The timing within the month makes no difference, since interest accrues on the closing balance only',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Đây là quy ước ordinary annuity: khoản gửi đặt ở cuối kỳ, nên khoản thứ n được gửi đúng lúc kết toán — “The last payment is taken out the same time it is made, and will not earn any interest.” Hệ quả thực tế: nếu bạn gửi vào đầu mỗi tháng thay vì cuối tháng, mỗi khoản có thêm một kỳ sinh lãi và số tiền phải để dành mỗi tháng thấp hơn con số công thức trả về.',
      en: 'This is the ordinary-annuity convention: deposits sit at the end of each period, so the n-th deposit arrives exactly when the balance is struck — “The last payment is taken out the same time it is made, and will not earn any interest.” The practical consequence: depositing at the start of each month instead gives every deposit one extra compounding period, so the amount you actually need to set aside is lower than the figure the formula returns.',
    },
    source: {
      url: 'https://math.libretexts.org/Bookshelves/Applied_Mathematics/Applied_Finite_Mathematics_(Sekhon_and_Bloom)/06%3A_Mathematics_of_Finance/6.03%3A_Annuities_and_Sinking_Funds',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q229',
    formulaId: 'tiet-kiem-muc-tieu',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Công thức coi số tiền mục tiêu là một con số đứng yên. Với mục tiêu tích đủ tiền mua căn hộ ở Hà Nội, giả định đó hỏng ở đâu?',
      en: 'The formula treats the target amount as a number that stays put. For a goal of saving up to buy an apartment in Hanoi, where does that assumption break?',
    },
    choices: {
      a: {
        vi: 'Không hỏng ở đâu, vì giá căn hộ đã được chốt tại thời điểm đặt mục tiêu',
        en: 'It does not break: the apartment price is locked in when the goal is set',
      },
      b: {
        vi: 'Hỏng vì tiền gửi mất giá do lạm phát, còn giá căn hộ thì đứng yên',
        en: 'It breaks because inflation erodes the deposit, while apartment prices stand still',
      },
      c: {
        vi: 'Hỏng vì ngân hàng thu phí quản lý tài khoản tiết kiệm, ăn dần vào số dư',
        en: 'It breaks because account maintenance fees eat into the balance',
      },
      d: {
        vi: 'Giá căn hộ chạy nhanh hơn tốc độ tích luỹ — 5 năm qua Hà Nội tăng khoảng 72% trong khi thu nhập bình quân chỉ tăng 6–10% mỗi năm',
        en: 'Apartment prices outrun the pace of saving — over the past five years Hanoi rose about 72% while average income grew only 6–10% a year',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Số liệu Avison Young Việt Nam trên báo Dân Việt: “Theo phân tích của Avison Young Việt Nam, trong 5 năm qua, giá căn hộ tại Hà Nội tăng khoảng 72%, TP.HCM tăng 50% và Đà Nẵng tăng 34%, trong khi thu nhập bình quân chỉ tăng khoảng 6-10% mỗi năm.” Lãi 6%/năm trong ô Lãi suất kỳ vọng không đuổi kịp mức đó, nên kế hoạch tính đúng đến từng đồng vẫn có thể về đích mà vẫn thiếu tiền mua căn hộ đã nhắm. Muốn dùng công thức cho mục tiêu kiểu này thì phải nâng số tiền mục tiêu theo tốc độ tăng giá dự kiến, chứ không lấy giá hôm nay.',
      en: "Avison Young Vietnam's figures, reported by Dân Việt: “Theo phân tích của Avison Young Việt Nam, trong 5 năm qua, giá căn hộ tại Hà Nội tăng khoảng 72%, TP.HCM tăng 50% và Đà Nẵng tăng 34%, trong khi thu nhập bình quân chỉ tăng khoảng 6-10% mỗi năm.” A 6%/year expected rate does not keep up with that, so a plan computed to the last dong can still finish short of the apartment it was aimed at. To use the formula for a goal like this, raise the target amount by the expected price growth instead of entering today's price.",
    },
    source: {
      url: 'https://danviet.vn/giac-mo-mua-nha-cua-nguoi-tre-can-nhieu-hon-mot-khoan-vay-d1450299.html',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q199',
    formulaId: 'lai-kep',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Số tiền cuối kỳ do lãi kép tạo ra có phải mức giàu lên thật sự không?',
      en: 'Is the ending balance produced by compound interest a real increase in wealth?',
    },
    choices: {
      a: { vi: 'Phải', en: 'Yes' },
      b: { vi: 'Phải nếu gửi trên 10 năm', en: 'Yes, if deposited for more than 10 years' },
      c: { vi: 'Phải với lãi suất trên 8%', en: 'Yes, if the rate is above 8%' },
      d: {
        vi: 'Không — phải trừ lạm phát; nếu giá cả tăng nhanh hơn thì vẫn lỗ sức mua',
        en: 'No — inflation must be subtracted; if prices rise faster, you still lose purchasing power',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Không hẳn: lãi kép danh nghĩa chỉ nói số tiền tăng bao nhiêu, còn giàu lên hay không phải đo bằng sức mua sau lạm phát. Tiền tăng 10% trong khi giá hàng hoá tăng 25% là sức mua GIẢM. Nguồn nêu đúng tình huống ấy: “If the prices of the food, clothing, housing, and other things that she wishes to purchase have increased 25% over this period, she has, in fact, suffered a real loss of about 15% in her purchasing power”.',
      en: 'Not necessarily: nominal compounding only says how much the balance grew, while being better off is measured in purchasing power after inflation. Money up 10% while the prices of goods rise 25% means purchasing power FELL. The source sets out exactly that case: “If the prices of the food, clothing, housing, and other things that she wishes to purchase have increased 25% over this period, she has, in fact, suffered a real loss of about 15% in her purchasing power”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Real_interest_rate',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q200',
    formulaId: 'lai-kep',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Nghiên cứu về hành vi tài chính ghi nhận con người có thiên lệch gì với tăng trưởng kép?',
      en: 'What bias does financial-behavior research find people have toward compound growth?',
    },
    choices: {
      a: { vi: 'Đánh giá quá cao', en: 'They overestimate it' },
      b: { vi: 'Ước lượng chính xác', en: 'They estimate it accurately' },
      c: {
        vi: 'Đánh giá thấp (exponential growth bias)',
        en: 'They underestimate it (exponential growth bias)',
      },
      d: { vi: 'Không có thiên lệch nào', en: 'There is no bias at all' },
    },
    answer: 'c',
    explain: {
      vi: 'Thiên lệch tăng trưởng mũ: con người có xu hướng ĐÁNH GIÁ THẤP sức mạnh của lãi kép, nên vừa hụt kỳ vọng khi tiết kiệm vừa xem nhẹ lãi vay tích luỹ khi đi vay. “Exponential growth bias is the tendency to underestimate compound growth processes. This bias can have financial implications as well”, dẫn nghiên cứu Stango và Zinman (2009) trên The Journal of Finance.',
      en: 'Exponential growth bias: people tend to UNDERESTIMATE how compounding works, so they expect too little when saving and take accumulating interest too lightly when borrowing. The source: “Exponential growth bias is the tendency to underestimate compound growth processes. This bias can have financial implications as well”, citing Stango and Zinman (2009) in The Journal of Finance.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Exponential_growth_bias',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q201',
    formulaId: 'lai-kep',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Gửi tiết kiệm là tự động có lãi kép. Đúng không?',
      en: 'Does putting money in a savings account automatically mean compound interest? True or false?',
    },
    choices: {
      a: { vi: 'Đúng', en: 'True' },
      b: { vi: 'Đúng với kỳ hạn trên 12 tháng', en: 'True, for terms over 12 months' },
      c: { vi: 'Đúng nếu lãi suất trên 6%', en: 'True, if the rate is above 6%' },
      d: {
        vi: 'Không — phải nhập lãi vào gốc và tái tục đều đặn thì mới thành lãi chồng lãi',
        en: 'False — the interest must be added back into the principal and rolled over regularly for it to actually compound',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Lãi kép là khi “số tiền lãi được cộng dồn vào số tiền gốc để tiếp tục chu kỳ đầu tư mới” — tức phải tái tục đều đặn; hiệu quả thường chỉ rõ sau 10–20 năm.',
      en: 'Compound interest is when the interest earned gets added into the principal to start a new investment cycle — “số tiền lãi được cộng dồn vào số tiền gốc để tiếp tục chu kỳ đầu tư mới” — meaning it must be rolled over regularly; the effect usually only becomes clear after 10 to 20 years.',
    },
    source: {
      url: 'https://timo.vn/blogs/lai-suat-kep-la-gi/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q202',
    formulaId: 'gui-quay-vong',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Sổ tiết kiệm đáo hạn mà bạn không chỉ định gì. Rủi ro của tự động tái tục?',
      en: 'A savings passbook matures and you give no instructions. What is the risk of automatic rollover?',
    },
    choices: {
      a: { vi: 'Không có rủi ro', en: 'There is no risk' },
      b: { vi: 'Bị chuyển sang không kỳ hạn', en: 'It gets converted to a no-term deposit' },
      c: {
        vi: 'Tiền bị khoá thêm một kỳ, và có nơi tái tục ở lãi suất thấp hơn kỳ ban đầu',
        en: 'The money gets locked up for another term, and some banks roll it over at a lower rate than the original term',
      },
      d: { vi: 'Mất lãi kỳ trước', en: 'You lose the interest from the previous term' },
    },
    answer: 'c',
    explain: {
      vi: 'Rủi ro là tiền bị khoá thêm một kỳ nữa mà bạn không chủ động chọn, và kỳ mới có thể chạy ở lãi suất thấp hơn kỳ cũ. Không dặn gì trước ngày đáo hạn thì ngân hàng được quyền tự tái tục. “In the absence of such directions, the institution may roll over the CD automatically, once again tying up the money for a period of time” và “Some banks have been known to renew at rates lower than that of the original CD”.',
      en: 'The risk is that the money is locked up for another term you did not choose, and the new term may run at a lower rate than the old one. Leave no instruction before maturity and the bank may roll it over on its own. The source: “In the absence of such directions, the institution may roll over the CD automatically, once again tying up the money for a period of time” and “Some banks have been known to renew at rates lower than that of the original CD”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Certificate_of_deposit',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q203',
    formulaId: 'gia-von-trung-binh-dca',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Có một khoản tiền lớn. Chia nhỏ giải ngân dần (DCA) hay bỏ vào một lần? Nghiên cứu Vanguard trên dữ liệu 1976–2022 nói gì?',
      en: 'You have a large lump sum. Phase it in gradually (DCA) or invest it all at once? What does Vanguard research on 1976–2022 data say?',
    },
    choices: {
      a: {
        vi: 'Bỏ một lần thắng khoảng hai phần ba số lần',
        en: 'Investing it all at once wins about two-thirds of the time',
      },
      b: { vi: 'DCA thắng đa số', en: 'DCA wins the majority of the time' },
      c: { vi: 'Hai cách như nhau', en: 'The two approaches are the same' },
      d: { vi: 'Chưa có nghiên cứu', en: 'No research exists on this' },
    },
    answer: 'a',
    explain: {
      vi: 'Nghiên cứu cho thấy bỏ vào một lần thắng khoảng hai phần ba số trường hợp, vì thị trường tăng nhiều hơn giảm nên tiền đứng ngoài chờ giải ngân là tiền mất cơ hội. Vanguard đo trên thị trường Mỹ, Anh, Úc, Canada và EU: “Lump-sum investment strategies beat common cost averaging investment strategies two-thirds of the time”, cụ thể “LS outperformed 68% of the time”.',
      en: 'The research finds a lump sum wins about two thirds of the time, because markets rise more often than they fall, so cash waiting to be deployed is cash giving up return. Vanguard measured it across the US, UK, Australia, Canada and the EU: “Lump-sum investment strategies beat common cost averaging investment strategies two-thirds of the time”, specifically “LS outperformed 68% of the time”.',
    },
    source: {
      url: 'https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q204',
    formulaId: 'gia-von-trung-binh-dca',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Vậy khi nào DCA vẫn là lựa chọn hợp lý?',
      en: 'So when is DCA still a reasonable choice?',
    },
    choices: {
      a: { vi: 'Khi muốn lợi nhuận cao nhất', en: 'When you want the highest possible return' },
      b: { vi: 'Khi thị trường đang tăng', en: 'When the market is rising' },
      c: {
        vi: 'Khi nhà đầu tư sợ lỗ — đổi lợi nhuận kỳ vọng lấy giảm rủi ro',
        en: 'When the investor is loss-averse — trading expected return for lower risk',
      },
      d: { vi: 'Không bao giờ', en: 'Never' },
    },
    answer: 'c',
    explain: {
      vi: 'Khi người đầu tư sợ lỗ mạnh: rải vốn cho lợi suất kỳ vọng thấp hơn nhưng cũng giảm khả năng vào đúng đỉnh rồi bỏ cuộc, và một kế hoạch theo được vẫn hơn một kế hoạch tối ưu mà bỏ giữa chừng. Chi phí cơ hội định lượng được, với 100.000 USD trong một năm, danh mục 100% cổ phiếu bỏ vào một lần cao hơn 2,2%. Vanguard: “The relationship between increased return at the cost of additional risk-taking suggests that investors with higher loss aversion would be better off drip feeding their investment through a cost-averaging approach”.',
      en: 'When the investor is strongly loss-averse: phasing the money in lowers expected return but also lowers the odds of buying the top and then abandoning the plan, and a plan that gets followed beats an optimal one that gets dropped. The opportunity cost is measurable: on 100,000 USD over one year, an all-equity lump sum came out 2.2% ahead. Vanguard: “The relationship between increased return at the cost of additional risk-taking suggests that investors with higher loss aversion would be better off drip feeding their investment through a cost-averaging approach”.',
    },
    source: {
      url: 'https://www.nl.vanguard/professional/vanguard-365/cost-averaging',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q205',
    formulaId: 'so-ky-dca',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Rải vốn càng nhiều kỳ, càng lâu thì càng an toàn và càng lợi. Đúng không?',
      en: 'The more periods and the longer you spread the capital out, the safer and more profitable it is. True or false?',
    },
    choices: {
      a: {
        vi: 'Không — thời gian rải càng dài thì chi phí cơ hội càng lớn',
        en: 'False — the longer the phase-in period, the greater the opportunity cost',
      },
      b: { vi: 'Đúng', en: 'True' },
      c: { vi: 'Đúng nếu trên 12 kỳ', en: 'True, if spread over more than 12 periods' },
      d: { vi: 'Đúng với danh mục 60/40', en: 'True, for a 60/40 portfolio' },
    },
    answer: 'a',
    explain: {
      vi: 'Sai: kéo dài thời gian rải vốn chỉ làm tăng chi phí cơ hội, vì tiền chờ giải ngân là tiền không sinh lời trong khi thị trường tăng nhiều hơn giảm. Ví dụ danh mục 60/40 với 100.000 USD: rải trong 3 tháng đạt 107.453 USD so với 109.360 USD nếu bỏ vào một lần. Vanguard: “the longer the CA horizon—the time it takes to fully invest cash—the greater the opportunity cost incurred”.',
      en: 'Wrong: stretching the phase-in only raises the opportunity cost, because cash waiting to be deployed earns nothing while markets rise more often than they fall. On a 60/40 portfolio of 100,000 USD, phasing in over three months reached 107,453 USD against 109,360 USD for the lump sum. Vanguard: “the longer the CA horizon—the time it takes to fully invest cash—the greater the opportunity cost incurred”.',
    },
    source: {
      url: 'https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q206',
    formulaId: 'gia-von-trung-binh-dca',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Phần lớn tranh luận “DCA có tốt không” thực ra đang nói về tình huống nào?',
      en: 'Most of the “is DCA good?” debate is actually about which situation?',
    },
    choices: {
      a: {
        vi: 'Rải một khoản tiền lớn bất ngờ (thừa kế, tiền bảo hiểm)',
        en: 'Phasing in a large windfall (an inheritance, an insurance payout)',
      },
      b: {
        vi: 'Đầu tư đều đặn từ thu nhập hằng tháng',
        en: 'Investing steadily out of monthly income',
      },
      c: { vi: 'Mua bình quân giá xuống', en: 'Averaging down on a falling price' },
      d: { vi: 'Đầu tư vào quỹ chỉ số', en: 'Investing in an index fund' },
    },
    answer: 'a',
    explain: {
      vi: 'Phần lớn tranh luận ấy thực ra nói về việc giải ngân DẦN một khoản tiền lớn có sẵn, chẳng hạn tiền bảo hiểm hay thừa kế, chứ không phải DCA đúng nghĩa là đều đặn bỏ vào từ thu nhập hằng tháng. Hai tình huống khác nhau nên kết luận của bên này không áp cho bên kia. “The confusion occurs where the term dollar cost averaging is incorrectly used to describe a different investment strategy... where the investor invests a windfall gain such as an insurance payout or inheritance”, và “this is actually a rare event for most investors”.',
      en: 'Most of that debate is really about phasing in a lump sum already in hand, an insurance payout or an inheritance, rather than dollar-cost averaging proper, which is investing steadily out of monthly income. They are two different situations, so a conclusion about one does not carry to the other. The source: “The confusion occurs where the term dollar cost averaging is incorrectly used to describe a different investment strategy... where the investor invests a windfall gain such as an insurance payout or inheritance”, and “this is actually a rare event for most investors”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Dollar_cost_averaging',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
];
