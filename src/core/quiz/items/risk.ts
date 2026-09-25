/**
 * Câu hỏi kiểm tra hiểu bài — nhóm Rủi ro & danh mục.
 *
 * Mỗi câu gắn một nguồn thật; xem bất biến ở `../types.ts`. Không thêm câu nào vào đây mà
 * không có `source.url` trỏ tới chỗ đọc được điều câu hỏi đang kiểm tra.
 */

import type { QuizItem } from '../types';

export const RUI_RO: ReadonlyArray<QuizItem> = [
  {
    id: 'Q070',
    formulaId: 'var-lich-su',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'VaR 99% một ngày của danh mục là 5%. Điều này KHÔNG nói gì?' },
    choices: {
      a: { vi: 'Ngưỡng lỗ ở mức tin cậy 99%' },
      b: { vi: 'Mức lỗ có thể xảy ra trong 1% trường hợp còn lại' },
      c: { vi: 'Phân vị của phân phối lợi suất' },
      d: { vi: 'Kết quả dựa trên dữ liệu quá khứ' },
    },
    answer: 'b',
    explain: {
      vi: 'Nó không nói gì về mức lỗ trong 1% phiên tệ nhất: VaR chỉ đặt ra một ngưỡng, không mô tả phần đuôi nằm sau ngưỡng ấy, nên lỗ ở đó có thể là 6% mà cũng có thể là 40%. David Einhorn ví von: “A 99% Value-at-Risk calculation does not evaluate what happens in the last one percent... This is like an airbag that works all the time, except when you have a car accident”. Muốn biết phần đuôi ấy thì phải dùng CVaR.',
      en: 'It says nothing about how much is lost in the worst 1% of sessions: VaR only sets a threshold, it does not describe the tail behind it, so the loss there could be 6% or 40%. David Einhorn puts it in an image: “A 99% Value-at-Risk calculation does not evaluate what happens in the last one percent... This is like an airbag that works all the time, except when you have a car accident”. Reading that tail is what CVaR is for.',
    },
    source: {
      url: 'https://www.azquotes.com/quote/1345674',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q071',
    formulaId: 'var-lich-su',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Điều trần trước Quốc hội Mỹ sau khủng hoảng 2008 kết luận gì về VaR?' },
    choices: {
      a: { vi: 'VaR đo được rủi ro khủng hoảng' },
      b: { vi: 'VaR không được thiết kế để xử lý rủi ro khủng hoảng — hỏng đúng lúc cần nhất' },
      c: { vi: 'VaR chỉ sai với trái phiếu' },
      d: { vi: 'VaR cần mẫu lớn hơn là đủ' },
    },
    answer: 'b',
    explain: {
      vi: 'Kết luận là VaR không được dựng ra để đo rủi ro khủng hoảng, nên càng đúng lúc cần nhất thì càng không dùng được. Richard Bookstaber điều trần: “VaR is not constructed to deal with crisis risk” và “VaR is a good measure of risk except when it really matters”. Taleb trong cùng phiên còn cảnh báo tác dụng ngược của nó: VaR “has side effects of increasing risk-taking, even by those who know that it is not reliable”.',
      en: 'The finding was that VaR was never built to measure crisis risk, so it fails precisely when it is needed most. Richard Bookstaber testified: “VaR is not constructed to deal with crisis risk” and “VaR is a good measure of risk except when it really matters”. Taleb, at the same hearing, warned about its perverse effect: VaR “has side effects of increasing risk-taking, even by those who know that it is not reliable”.',
    },
    source: {
      url: 'https://science.house.gov/sites/republicans.science.house.gov/files/documents/hearings/091009_Bookstaber.pdf',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q072',
    formulaId: 'var-lich-su',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Gộp hai danh mục độc lập lại, VaR của danh mục tổng có luôn nhỏ hơn tổng hai VaR riêng không?',
    },
    choices: {
      a: { vi: 'Có, nhờ đa dạng hoá' },
      b: { vi: 'Không — VaR không có tính cộng dưới, có trường hợp VaR gộp lớn hơn' },
      c: { vi: 'Có nếu tương quan âm' },
      d: { vi: 'Luôn bằng nhau' },
    },
    answer: 'b',
    explain: {
      vi: 'Không. VaR không phải thước đo nhất quán: gộp hai danh mục lại, VaR của tổng có thể LỚN hơn tổng hai VaR riêng, vì rủi ro nấp ngay dưới ngưỡng tin cậy ở từng danh mục khi cộng lại thì vượt ngưỡng. “VaR is telling us that the diversified two-bond portfolio is dramatically riskier than the sum of the two single-bond positions”, vì “Risks that are individually hidden below the confidence level can pile up across positions until their combined probability pokes above the threshold”. CVaR không mắc khuyết điểm này.',
      en: 'No. VaR is not a coherent risk measure: combine two portfolios and the VaR of the total can be LARGER than the sum of the two separate VaRs, because risks sitting just below the confidence level in each position add up until they cross it. The source: “VaR is telling us that the diversified two-bond portfolio is dramatically riskier than the sum of the two single-bond positions”, since “Risks that are individually hidden below the confidence level can pile up across positions until their combined probability pokes above the threshold”. CVaR does not have this flaw.',
    },
    source: {
      url: 'https://riskhub.org/blogs/why-value-at-risk-is-not-a-coherent-risk-measure',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q248',
    formulaId: 'var-lich-su',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một nhà quản lý rủi ro tính VaR lịch sử bằng phương pháp mô phỏng lịch sử (historical simulation) trên 300 phiên giao dịch gần nhất. Theo quy ước xếp hạng quan sát của phương pháp này, VaR ở mức tin cậy cl% là khoản lỗ xếp hạng [(1 − cl%) × n + 1] tính từ nặng nhất trở xuống. Năm khoản lỗ nặng nhất trong 300 phiên (đơn vị triệu, số âm là lỗ) lần lượt là −30; −27; −23; −21; −19. Tính VaR ở mức tin cậy 99%, nhập kết quả dưới dạng số DƯƠNG thể hiện mức lỗ.',
      en: "A risk manager computes historical VaR by historical simulation over the most recent 300 trading days. Under this method's observation-ranking convention, the cl% VaR is the loss ranked [(1 − cl%) × n + 1] counting from the worst. The five worst losses among the 300 sessions (millions, negative = loss) are −30, −27, −23, −21, −19 in order. Compute the 99% VaR, stating it as a POSITIVE loss figure.",
    },
    facts: [
      {
        label: { vi: 'Số phiên quan sát (n)', en: 'Number of observations (n)' },
        value: { vi: '300 phiên', en: '300 sessions' },
      },
      {
        label: { vi: 'Mức tin cậy (cl%)', en: 'Confidence level (cl%)' },
        value: { vi: '99%', en: '99%' },
      },
      {
        label: {
          vi: 'Năm khoản lỗ nặng nhất trong 300 phiên (triệu, âm là lỗ), từ nặng tới nhẹ',
          en: 'Five worst losses among the 300 sessions (millions, negative = loss), worst to least severe',
        },
        value: { vi: '−30; −27; −23; −21; −19', en: '−30; −27; −23; −21; −19' },
      },
    ],
    choices: {
      a: { vi: '30 triệu', en: '30 million' },
      b: { vi: '23 triệu', en: '23 million' },
      c: { vi: '21 triệu', en: '21 million' },
      d: { vi: '19 triệu', en: '19 million' },
    },
    answer: 'c',
    explain: {
      vi: "Quy ước 'xếp hạng quan sát' của mô phỏng lịch sử: sắp các khoản lỗ từ nặng nhất tới nhẹ nhất, VaR ở mức tin cậy cl% là quan sát xếp hạng (1 − cl%) × n + 1. Với n = 300 và cl% = 99%, hạng cần tìm là (1 − 0,99) × 300 + 1 = 3 + 1 = 4 — tức khoản lỗ nặng thứ 4, bằng −21 (triệu). VaR luôn nêu dưới dạng số dương thể hiện mức lỗ nên đáp án là 21. Đây là quy ước chọn theo THỨ HẠNG rời rạc trên chuỗi đã sắp xếp — khác phép nội suy phân vị tuyến tính mà chính công thức VaR lịch sử của Faculator Finbox dùng, nên hai cách tính có thể cho hai con số hơi khác nhau trên cùng một chuỗi dữ liệu; đây là một quy ước thay thế phổ biến trong tài liệu ngành, không phải cách Faculator đang tính. Ba đáp án còn lại là ba lỗi hay gặp: 30 là lấy luôn khoản lỗ nặng nhất; 23 là dừng ở hạng 3, quên cộng 1 vào công thức xếp hạng; 19 là đếm lố sang hạng 5.",
      en: "The 'observation-ranking' convention of historical simulation: sort the losses from worst to least severe; the cl% VaR is the observation ranked (1 − cl%) × n + 1. With n = 300 and cl% = 99%, that rank is (1 − 0.99) × 300 + 1 = 3 + 1 = 4 — the 4th-worst loss, which is −21 (million). VaR is always stated as a positive loss figure, so the answer is 21. This discrete-rank convention on a sorted series differs from the linear-interpolation percentile Faculator Finbox's own historical-VaR formula uses, so the two methods can give slightly different numbers on the same data — this is a common alternative convention in the literature, not how Faculator itself computes it. The other three are common slips: 30 simply takes the worst loss; 23 stops at rank 3, forgetting the +1 in the ranking formula; 19 counts one rank too far, to rank 5.",
    },
    source: {
      url: 'https://analystprep.com/study-notes/frm/part-2/market-risk-measurement-and-management/estimating-market-risk-measures/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q249',
    formulaId: 'var-lich-su',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Quy tắc căn bậc hai thời gian (square-root-of-time rule) quy đổi VaR sang kỳ hạn dài hơn theo công thức: VaR kỳ T = VaR 1 phiên × căn bậc hai của T, với giả định lợi suất các phiên độc lập và cùng phân phối (i.i.d.). Một danh mục có VaR 1 phiên ở độ tin cậy 99% bằng 2% giá trị danh mục. Giả định i.i.d. đúng như quy tắc yêu cầu, VaR ước tính cho kỳ hạn 25 phiên bằng bao nhiêu % giá trị danh mục?',
      en: "The square-root-of-time rule scales VaR to a longer horizon as: T-day VaR = 1-day VaR × square root of T, assuming session returns are independent and identically distributed (i.i.d.). A portfolio's 1-day VaR at 99% confidence is 2% of portfolio value. Assuming the i.i.d. condition the rule requires, what is the estimated VaR for a 25-session horizon, as a % of portfolio value?",
    },
    facts: [
      {
        label: { vi: 'VaR 1 phiên, độ tin cậy 99%', en: '1-day VaR, 99% confidence' },
        value: { vi: '2% giá trị danh mục', en: '2% of portfolio value' },
      },
      {
        label: { vi: 'Kỳ hạn cần quy đổi (T)', en: 'Horizon to scale to (T)' },
        value: { vi: '25 phiên', en: '25 sessions' },
      },
      {
        label: { vi: 'Quy tắc quy đổi', en: 'Scaling rule' },
        value: { vi: 'VaR kỳ T = VaR 1 phiên × √T', en: 'T-day VaR = 1-day VaR × √T' },
      },
    ],
    choices: {
      a: { vi: '2% giá trị danh mục', en: '2% of portfolio value' },
      b: { vi: '10% giá trị danh mục', en: '10% of portfolio value' },
      c: { vi: '50% giá trị danh mục', en: '50% of portfolio value' },
      d: { vi: '0,4% giá trị danh mục', en: '0.4% of portfolio value' },
    },
    answer: 'b',
    explain: {
      vi: "Quy tắc căn bậc hai thời gian quy đổi VaR theo công thức T-day VaR = 1-day VaR × √T, dựa trên giả định lợi suất các phiên độc lập và cùng phân phối (i.i.d.) khiến phương sai cộng dồn tuyến tính theo số phiên. Với VaR 1 phiên = 2% và T = 25, VaR 25 phiên ước tính = 2% × √25 = 2% × 5 = 10%. Sai lầm thường gặp — cũng là điều chính công thức VaR lịch sử của Faculator Finbox tự cảnh báo trong mục 'sai lầm thường gặp' — là nhân thẳng VaR một phiên với số phiên (2% × 25 = 50%, gấp 5 lần) thay vì nhân với căn bậc hai. Quy tắc này cũng chỉ là một XẤP XỈ: khi giả định i.i.d. bị vi phạm (biến động thay đổi theo thời gian, đuôi phân phối dày, có bước nhảy), cách quy đổi này có xu hướng ĐÁNH GIÁ THẤP rủi ro thật. Ba đáp án còn lại là ba lỗi hay gặp: 2% là quên quy đổi kỳ hạn; 50% là nhân thẳng với T thay vì với căn bậc hai của T — đúng cái mà quy tắc này sinh ra để tránh; 0,4% là chia cho căn T thay vì nhân.",
      en: "The square-root-of-time rule scales VaR via T-day VaR = 1-day VaR × √T, relying on the assumption that session returns are independent and identically distributed (i.i.d.), so variance accumulates linearly with the number of sessions. With a 1-day VaR of 2% and T = 25, the scaled 25-day VaR is 2% × √25 = 2% × 5 = 10%. A common mistake — one Faculator Finbox's own historical-VaR formula flags in its 'common mistakes' notes — is multiplying the one-day VaR straight by the number of sessions (2% × 25 = 50%, five times too high) instead of by the square root. The rule is also only an APPROXIMATION: when the i.i.d. assumption fails (time-varying volatility, fat tails, jumps), this scaling tends to UNDERESTIMATE the true risk. The other three are common slips: 2% forgets to scale at all; 50% multiplies by T rather than by the square root of T — exactly what this rule exists to prevent; 0.4% divides by the square root instead of multiplying.",
    },
    source: {
      url: 'https://analystprep.com/study-notes/frm/part-2/current-issues-in-financial-markets/frm-part-2/message-from-the-academic-literature-on-risk-management-for-the-trading-book/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q073',
    formulaId: 'cvar-lich-su',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'CVaR 99% bằng 8%. Cách hiểu đúng?' },
    choices: {
      a: { vi: 'Không thể lỗ quá 8%' },
      b: { vi: 'Trung bình của phần đuôi, ước lượng từ rất ít quan sát nên rất nhiễu' },
      c: { vi: 'Xác suất lỗ 8% là 99%' },
      d: { vi: 'Lỗ tối đa trong lịch sử là 8%' },
    },
    answer: 'b',
    explain: {
      vi: 'Đọc là: trong 1% phiên tệ nhất, mức lỗ BÌNH QUÂN khoảng 8%, chứ không phải lỗ tối đa 8%. Con số ấy lại dựng trên rất ít quan sát nên rất nhiễu, nguồn: “at 99% the historical CVaR is the mean of just 45 observations”; phân phối khớp còn cho thấy “the fitted tail expects days worse than any yet observed”. CVaR cũng khó kiểm định ngược hơn VaR.',
      en: 'Read it as: across the worst 1% of sessions, the AVERAGE loss is about 8%, not that the loss is capped at 8%. That average rests on very few observations and is therefore noisy, the source: “at 99% the historical CVaR is the mean of just 45 observations”; the fitted distribution also shows that “the fitted tail expects days worse than any yet observed”. CVaR is also harder to backtest than VaR.',
    },
    source: {
      url: 'https://www.pyportfolios.com/research/cvar-expected-shortfall',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q250',
    formulaId: 'cvar-lich-su',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Vì sao CVaR (Expected Shortfall) được giới chuyên môn xếp là thước đo rủi ro "mạch lạc" (coherent), còn VaR thì không?',
      en: 'Why do practitioners classify CVaR (Expected Shortfall) as a "coherent" risk measure while VaR is not?',
    },
    choices: {
      a: {
        vi: 'Vì CVaR luôn cộng dồn được: rủi ro của hai danh mục gộp lại không bao giờ vượt tổng rủi ro riêng từng danh mục (tính dưới cộng)',
        en: 'Because CVaR is always subadditive: the risk of a combined portfolio never exceeds the sum of the risks of its parts',
      },
      b: { vi: 'Vì CVaR luôn là một số dương', en: 'Because CVaR is always a positive number' },
      c: {
        vi: 'Vì CVaR tính từ dữ liệu lịch sử còn VaR thì không',
        en: 'Because CVaR is computed from historical data while VaR is not',
      },
      d: {
        vi: 'Vì CVaR không phụ thuộc mức tin cậy đã chọn',
        en: 'Because CVaR does not depend on the chosen confidence level',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Nguồn viết thẳng: “ES is always subadditive. VaR is not.” Tính dưới cộng (subadditivity) — “the risk of a combined portfolio should never exceed the sum of the risks of its parts” — là tiên đề then chốt để một thước đo rủi ro được gọi là mạch lạc (coherent). VaR có thể vi phạm điều này (gộp hai vị thế lại làm VaR nhảy vọt so với tổng hai VaR riêng), còn CVaR thì không, vì nó lấy trung bình cả phần đuôi thay vì chỉ đọc một ngưỡng.',
      en: 'The source states plainly: “ES is always subadditive. VaR is not.” Subadditivity — “the risk of a combined portfolio should never exceed the sum of the risks of its parts” — is the key axiom for a risk measure to be called coherent. VaR can violate it (combining two positions can make VaR jump above the sum of the two individual VaRs), CVaR cannot, because it averages the whole tail rather than reading a single threshold.',
    },
    source: {
      url: 'https://riskhub.org/blogs/expected-shortfall-vs-var',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q251',
    formulaId: 'cvar-lich-su',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Theo khung vốn rủi ro thị trường FRTB (Basel III), cơ quan giám sát yêu cầu ngân hàng tính vốn dựa trên thước đo nào, ở mức tin cậy bao nhiêu?',
      en: 'Under the FRTB market-risk capital framework (Basel III), what measure and confidence level do regulators require banks to use for capital?',
    },
    choices: {
      a: { vi: 'VaR ở mức tin cậy 99%', en: 'VaR at the 99% confidence level' },
      b: {
        vi: 'Expected Shortfall (CVaR) ở mức tin cậy 97,5%',
        en: 'Expected Shortfall (CVaR) at the 97.5% confidence level',
      },
      c: {
        vi: 'Expected Shortfall (CVaR) ở mức tin cậy 99%',
        en: 'Expected Shortfall (CVaR) at the 99% confidence level',
      },
      d: { vi: 'VaR ở mức tin cậy 95%', en: 'VaR at the 95% confidence level' },
    },
    answer: 'b',
    explain: {
      vi: '“Rather than define ES at the 99 percent level, the Basel Committee specified the ES at the 97.5 percent level because a 97.5 percent ES will be very similar to a 99 percent VaR so long as the losses are approximately normally distributed.” Uỷ ban Basel chọn 97,5% để mức vốn yêu cầu không nhảy vọt so với khung VaR 99% cũ, trong khi vẫn chuyển sang một thước đo mạch lạc, bắt được cả độ lớn tổn thất trong phần đuôi — không phải chỉ giữ nguyên mức tin cậy 99% cũ cho ES.',
      en: '“Rather than define ES at the 99 percent level, the Basel Committee specified the ES at the 97.5 percent level because a 97.5 percent ES will be very similar to a 99 percent VaR so long as the losses are approximately normally distributed.” The Committee picked 97.5% so required capital would not jump relative to the old 99% VaR framework, while still moving to a coherent measure that captures the size of tail losses — not by simply keeping the old 99% level for ES.',
    },
    source: {
      url: 'https://bpi.com/why-is-the-frtb-expected-shortfall-calculation-designed-as-it-is/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q074',
    formulaId: 'ty-so-sharpe',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Một chiến lược có Sharpe ratio rất cao. Điều gì vẫn có thể xảy ra?' },
    choices: {
      a: { vi: 'Không gì cả, Sharpe cao là an toàn' },
      b: {
        vi: 'Mất toàn bộ tiền — đã có bài báo toán học chứng minh điều này tương thích với Sharpe cao',
      },
      c: { vi: 'Lợi nhuận thấp nhưng ổn định' },
      d: { vi: 'Chỉ lỗ tối đa bằng độ lệch chuẩn' },
    },
    answer: 'b',
    explain: {
      vi: 'Vẫn có thể mất sạch tiền. Sharpe đo lợi suất bình quân chia cho độ lệch chuẩn của một giai đoạn, nên một chuỗi lãi đều đặn rồi một cú sập cuối cùng vẫn để lại tỷ số rất cao khi tính trên chính chuỗi đó. Bài “Losing money with a high Sharpe ratio” (arXiv:1109.0706) dựng một ví dụ tối giản: “A simple example shows that losing all money is compatible with a very high Sharpe ratio (as computed after losing all money)”.',
      en: 'You can still lose everything. The Sharpe ratio divides an average return by the standard deviation over a window, so a steady run of gains followed by one collapse can still leave a very high ratio computed on that same window. The paper “Losing money with a high Sharpe ratio” (arXiv:1109.0706) builds a minimal example: “A simple example shows that losing all money is compatible with a very high Sharpe ratio (as computed after losing all money)”.',
    },
    source: {
      url: 'https://ar5iv.arxiv.org/html/1109.0706',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q075',
    formulaId: 'ty-so-sharpe',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Cách đơn giản nhất để đẩy Sharpe ratio lên mà không tạo thêm giá trị cho nhà đầu tư là gì?',
    },
    choices: {
      a: { vi: 'Tăng số lệnh giao dịch' },
      b: { vi: 'Bán quyền chọn ngoài giá rồi gửi phần còn lại ở tài sản phi rủi ro' },
      c: { vi: 'Giảm phí quản lý' },
      d: { vi: 'Đổi chỉ số tham chiếu' },
    },
    answer: 'b',
    explain: {
      vi: "Bán quyền chọn xa giá (out of the money) rồi để phần còn lại ở tài sản phi rủi ro: phí quyền chọn vào đều như lãi, còn rủi ro dồn hết vào phần đuôi mà độ lệch chuẩn không thấy, nên Sharpe đẹp lên mà nhà đầu tư không được lợi gì thêm. Nghiên cứu trên Review of Financial Studies: “A simple strategy that accomplishes this has the fund sell an out of the money option in the first month, while investing the remaining funds in the risk free asset”, và định nghĩa thao túng là hành động đẩy chỉ số hiệu quả lên mà “does not actually add value for the fund's investor”.",
      en: "Sell a far out-of-the-money option and park the rest in the risk-free asset: the premium arrives steadily like interest while all the risk piles into a tail that standard deviation cannot see, so the Sharpe ratio improves without the investor gaining anything. Research in the Review of Financial Studies: “A simple strategy that accomplishes this has the fund sell an out of the money option in the first month, while investing the remaining funds in the risk free asset”, defining manipulation as raising a performance measure in a way that “does not actually add value for the fund's investor”.",
    },
    source: {
      url: 'https://www.ivo-welch.org/research/journalcopy/ingersoll2007portfolio.pdf',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q076',
    formulaId: 'ty-so-sharpe',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Giả định ẩn nào của Sharpe ratio khiến nó che mất rủi ro sập?' },
    choices: {
      a: { vi: 'Lợi suất phân phối chuẩn' },
      b: { vi: 'Lãi suất phi rủi ro bằng 0' },
      c: { vi: 'Danh mục đã đa dạng hoá' },
      d: { vi: 'Không có phí giao dịch' },
    },
    answer: 'a',
    explain: {
      vi: 'Giả định ẩn là độ biến động nói hết được rủi ro, trong khi nó xem cú tăng và cú giảm như nhau và không thấy phần đuôi trái. CFA Institute: “Hidden within the Sharpe Ratio is the assumption that volatility... captures risk in its entirety”. Khảo sát 15 chỉ số toàn cầu cho thấy phần lớn lệch trái, tức dễ lao dốc hơn leo dốc: “Ten of the 15 indices exhibit left skewness, or crash risk”.',
      en: 'The hidden assumption is that volatility captures risk in full, when it treats a jump up and a jump down alike and cannot see the left tail. CFA Institute: “Hidden within the Sharpe Ratio is the assumption that volatility... captures risk in its entirety”. A survey of 15 global indices found most of them skewed left, more prone to collapse than to melt-up: “Ten of the 15 indices exhibit left skewness, or crash risk”.',
    },
    source: {
      url: 'https://rpc.cfainstitute.org/blogs/enterprising-investor/2022/how-sharp-is-the-sharpe-ratio-an-analysis-of-global-stock-indices',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q077',
    formulaId: 'ty-so-sharpe',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Nhân Sharpe theo phiên với căn bậc hai của 252 để ra Sharpe năm. Vấn đề của phép này?',
    },
    choices: {
      a: { vi: 'Không có vấn đề, đây là chuẩn' },
      b: {
        vi: 'Nó giả định lợi suất nhiều ngày bằng tổng lợi suất từng ngày, trong khi lợi suất nhân chồng',
      },
      c: { vi: 'Phải dùng 365 thay vì 252' },
      d: { vi: 'Chỉ sai với quỹ mở' },
    },
    answer: 'b',
    explain: {
      vi: 'Phép nhân với căn bậc hai của 252 chỉ đúng nếu lợi suất nhiều phiên cộng dồn được như phép cộng và các phiên độc lập, cùng phân phối. Nguồn nêu thẳng giả định ấy: “An assumption is made that (since the returns are small) the return over a number of days equals sum of the returns on the individual days”. Với tài sản biến động mạnh thì sai lệch rất lớn: Bitcoin cho Sharpe 2,5 theo cách quy năm chuẩn so với 0,83 khi tính đúng.',
      en: 'Multiplying by the square root of 252 only holds if multi-session returns add up like sums and the sessions are independent and identically distributed. The source states the assumption plainly: “An assumption is made that (since the returns are small) the return over a number of days equals sum of the returns on the individual days”. For volatile assets the gap is large: Bitcoin shows a Sharpe of 2.5 under the standard annualization against 0.83 when done properly.',
    },
    source: {
      url: 'https://ar5iv.arxiv.org/html/1802.04413',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q270',
    formulaId: 'ty-so-sharpe',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Hai quỹ cùng lỗ 12% trong một quý thị trường giảm, lãi suất phi rủi ro 6%. Quỹ A có độ lệch chuẩn 8%/quý, Quỹ B có độ lệch chuẩn 6%/quý (rủi ro thấp hơn hẳn). Sharpe ratio xếp hạng hai quỹ này thế nào, và vì sao đây là một nghịch lý của công thức?',
      en: 'Two funds both lost 12% in the same falling quarter, with a 6% risk-free rate. Fund A has 8% volatility per quarter, Fund B has 6% volatility (clearly lower risk). How does the Sharpe ratio rank the two funds, and why is this a paradox of the formula?',
    },
    choices: {
      a: {
        vi: 'Quỹ A (rủi ro cao hơn) lại có Sharpe cao hơn, đỡ âm hơn (−2,25 so với −3,00) dù hai quỹ lỗ bằng nhau và B rủi ro thấp hơn — Sharpe xếp hạng ngược với lẽ thường',
        en: 'Fund A (the riskier one) gets the higher, less negative Sharpe ratio (−2.25 vs −3.00), even though both lost the same amount and B is less risky — Sharpe ranks them backwards',
      },
      b: {
        vi: 'Quỹ B luôn được xếp tốt hơn vì rủi ro thấp hơn — Sharpe âm vẫn tuân theo logic thông thường như Sharpe dương',
        en: 'Fund B always ranks better because it has lower risk — a negative Sharpe ratio still follows ordinary logic just like a positive one',
      },
      c: {
        vi: 'Hai quỹ có Sharpe bằng nhau vì mức lỗ như nhau, độ lệch chuẩn không ảnh hưởng khi tử số âm',
        en: 'Both funds get the same Sharpe ratio because they lost the same amount, so volatility does not matter once the numerator is negative',
      },
      d: {
        vi: 'Không thể so sánh vì Sharpe ratio luôn vô nghĩa khi ra số âm, bất kể trường hợp nào',
        en: 'The two cannot be compared at all because a negative Sharpe ratio is always meaningless in every case',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Sharpe = (lợi suất − lãi suất phi rủi ro) / độ lệch chuẩn. Vì tử số ở đây âm (−12% − 6% = −18%), chia cho độ lệch chuẩn LỚN hơn lại ra một số ÍT ÂM hơn: Sharpe_A = −18%/8% = −2,25; Sharpe_B = −18%/6% = −3,00. Quỹ A rủi ro cao hơn lại có Sharpe "tốt" hơn — ngược hẳn lẽ thường. Nguồn viết đúng ví dụ này: “Both lost the same amount. Fund B did it with less volatility, so by any reasonable standard Fund B is the better of the two. The Sharpe ratio says the opposite: Fund A, at −2.25, outranks Fund B at −3.00.” Đây là lý do giới chuyên môn cảnh báo không dùng Sharpe để xếp hạng khi lợi suất vượt trội âm.',
      en: 'Sharpe = (return − risk-free rate) / volatility. Since the numerator here is negative (−12% − 6% = −18%), dividing by a LARGER volatility gives a LESS negative number: Sharpe_A = −18%/8% = −2.25; Sharpe_B = −18%/6% = −3.00. The riskier fund (A) ends up with the "better" Sharpe ratio — the exact opposite of common sense. The source states this precise example: “Both lost the same amount. Fund B did it with less volatility, so by any reasonable standard Fund B is the better of the two. The Sharpe ratio says the opposite: Fund A, at −2.25, outranks Fund B at −3.00.” This is why practitioners warn against using the Sharpe ratio to rank funds when excess returns are negative.',
    },
    source: {
      url: 'https://www.valuefy.com/insights/negative-sharpe-ratio-down-market',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q078',
    formulaId: 'ty-so-sortino',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Khi nào Sortino xếp hạng danh mục y hệt Sharpe?' },
    choices: {
      a: { vi: 'Không bao giờ' },
      b: { vi: 'Khi MAR bằng lãi suất phi rủi ro và lợi suất phân phối chuẩn' },
      c: { vi: 'Khi danh mục có lợi suất âm' },
      d: { vi: 'Khi số quan sát dưới 100' },
    },
    answer: 'b',
    explain: {
      vi: "Khi mức sinh lời tối thiểu chấp nhận được (MAR) đặt đúng bằng lãi suất phi rủi ro VÀ lợi suất phân phối chuẩn: lúc ấy phần đuôi trái không còn khác phần đuôi phải, nên độ lệch bán phần tỷ lệ với độ lệch chuẩn và hai tỷ số xếp hạng giống hệt nhau. Nhưng đặt MAR bằng lãi suất phi rủi ro cũng làm mất luôn ý nghĩa mục tiêu riêng mà Sortino sinh ra để đo. CFA Institute: “If the MAR is equivalent to the risk-free rate and the investment's returns are normally distributed, the Sortino ratio will assign the same ranking to a portfolio as the Sharpe ratio”.",
      en: "When the minimum acceptable return (MAR) is set exactly at the risk-free rate AND returns are normally distributed: the left tail then mirrors the right, so downside deviation is proportional to standard deviation and the two ratios rank identically. But setting MAR at the risk-free rate also throws away the target-specific meaning Sortino exists to measure. CFA Institute: “If the MAR is equivalent to the risk-free rate and the investment's returns are normally distributed, the Sortino ratio will assign the same ranking to a portfolio as the Sharpe ratio”.",
    },
    source: {
      url: 'https://rpc.cfainstitute.org/-/media/documents/code/gips/the-sortino-ratio.pdf',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q211',
    formulaId: 'ty-so-sortino',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Quỹ X lãi 12%/năm, độ lệch rủi ro thua lỗ 10%. Quỹ Z lãi 10%/năm, độ lệch 7%. Lãi phi rủi ro 2,5%. Quỹ nào hiệu quả hơn theo Sortino?',
      en: 'Fund X returns 12% a year with a 10% downside deviation. Fund Z returns 10% a year with a 7% downside deviation. The risk-free rate is 2.5%. Which fund is more efficient on the Sortino ratio?',
    },
    choices: {
      a: {
        vi: 'Quỹ X, vì lợi nhuận cao hơn 2 điểm phần trăm',
        en: 'Fund X, because its return is 2 percentage points higher',
      },
      b: {
        vi: 'Quỹ Z: 1,07 lần so với 0,95 lần, tức mỗi đơn vị rủi ro giảm giá đổi được nhiều lãi hơn',
        en: 'Fund Z: 1.07 versus 0.95, meaning it earns more return per unit of downside risk',
      },
      c: {
        vi: 'Bằng nhau, vì phần lợi nhuận cao hơn của X bù đúng phần rủi ro cao hơn',
        en: "They tie, because X's extra return exactly offsets its extra risk",
      },
      d: {
        vi: 'Không so được, vì hai quỹ có độ lệch rủi ro thua lỗ khác nhau',
        en: 'They cannot be compared, because the two funds have different downside deviations',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Sortino không xếp hạng theo lợi suất thô mà theo lãi thu được trên mỗi đơn vị rủi ro giảm giá: (10% − 2,5%) ÷ 7% = 1,07 lần, cao hơn (12% − 2,5%) ÷ 10% = 0,95 lần. VietnamBiz kết luận đúng chỗ dễ đọc nhầm này: “Mặc dù Quĩ tương hỗ X có tỉ suất lợi nhuận cao hơn 2%, nhưng nó không kiếm được lợi nhuận đó hiệu quả như Quĩ tương hỗ Z, chứng minh bởi các độ lệch rủi ro thua lỗ của họ.” Nhìn một mình con số lợi nhuận là bỏ mất đúng thứ tỷ số này sinh ra để đo.',
      en: 'The Sortino ratio does not rank by raw return but by return per unit of downside risk: (10% − 2.5%) ÷ 7% = 1.07, above (12% − 2.5%) ÷ 10% = 0.95. VietnamBiz draws the conclusion exactly where the number is easy to misread: “Mặc dù Quĩ tương hỗ X có tỉ suất lợi nhuận cao hơn 2%, nhưng nó không kiếm được lợi nhuận đó hiệu quả như Quĩ tương hỗ Z, chứng minh bởi các độ lệch rủi ro thua lỗ của họ.” Looking at the return alone throws away the very thing this ratio exists to measure.',
    },
    source: {
      url: 'https://vietnambiz.vn/ti-so-sortino-sortino-ratio-la-gi-cong-thuc-va-vi-du-20191113151110168.htm',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q212',
    formulaId: 'ty-so-sortino',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Trang này tính Sortino từ chuỗi 71 phiên, tức hơn ba tháng giá. Theo Charles Schwab, chuỗi dài bao nhiêu thì con số mới đủ tin?',
      en: 'This page computes the Sortino ratio from a 71-session series, a little over three months of prices. According to Charles Schwab, how long does the return history need to be before the number can be trusted?',
    },
    choices: {
      a: {
        vi: 'Khoảng 30 phiên là đủ, vì đã vượt số phiên tối thiểu để công thức chạy được',
        en: 'About 30 sessions is enough, since that already clears the minimum the formula needs to run',
      },
      b: {
        vi: 'Dưới ba năm dữ liệu là đã làm yếu độ tin cậy; lý tưởng là mười năm, đủ trọn một chu kỳ kinh doanh',
        en: 'Less than three years of data already weakens the result; ten years is ideal, enough to cover a full business cycle',
      },
      c: {
        vi: 'Chỉ cần đủ nhiều phiên giảm, tổng độ dài chuỗi không quan trọng',
        en: 'Only the number of losing sessions matters; the total length of the series is irrelevant',
      },
      d: {
        vi: 'Chuỗi càng ngắn càng tốt vì bám sát trạng thái thị trường hiện tại',
        en: 'The shorter the series the better, because it tracks current market conditions',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Chuỗi vài chục phiên chỉ có vài phiên rơi dưới ngưỡng, nên mẫu số dựng trên quá ít quan sát và tỷ số nhảy mạnh chỉ vì một phiên xấu. Schwab viết thẳng trong mục hạn chế: “Using less than three years of historical data can weaken the validity of Sortino ratio calculations.”, và dẫn lời Viraj Desai, giám đốc Schwab Asset Management, rằng mười năm dữ liệu mới là lý tưởng vì thường bao trọn một chu kỳ kinh doanh. Con số 71 phiên trên trang này vì thế nên đọc như một ảnh chụp ngắn hạn, không phải kết luận về chất lượng danh mục.',
      en: 'With only a few dozen sessions, just a handful fall below the threshold, so the denominator rests on very few observations and the ratio swings on a single bad session. Schwab states it plainly in its limitations section: “Using less than three years of historical data can weaken the validity of Sortino ratio calculations.”, quoting Viraj Desai, director of Schwab Asset Management, that ten years of data is ideal because it usually spans a full business cycle. The 71-session figure on this page should therefore be read as a short-term snapshot, not a verdict on portfolio quality.',
    },
    source: {
      url: 'https://www.schwab.com/learn/story/using-sortino-ratio-to-gauge-downside-risk',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q213',
    formulaId: 'ty-so-sortino',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Ngưỡng phi rủi ro nhập theo năm được quy về từng phiên trước khi đếm phần hụt. Việc quy đổi đó tác động thế nào tới mức rủi ro đo được?',
      en: 'The risk-free threshold is entered as an annual rate, then converted to a per-session rate before the shortfalls are counted. What does that conversion do to the amount of risk the ratio measures?',
    },
    choices: {
      a: {
        vi: 'Không tác động gì, vì mục tiêu cả năm và mục tiêu mỗi phiên là tương đương nhau',
        en: 'Nothing, because an annual target and a per-session target are equivalent',
      },
      b: {
        vi: 'Tác động đáng kể: buộc vượt ngưỡng ở từng kỳ ngắn là đòi hỏi khắt khe hơn nhiều so với vượt ngưỡng một lần cho cả năm',
        en: 'A lot: requiring the threshold to be cleared in every short period is far more demanding than clearing it once over a whole year',
      },
      c: {
        vi: 'Chỉ đổi tử số, còn mẫu số giữ nguyên vì mẫu số không dùng ngưỡng',
        en: 'It only changes the numerator; the denominator is unaffected because it does not use the threshold',
      },
      d: {
        vi: 'Luôn làm mẫu số nhỏ đi, nên tỷ số quy đổi bao giờ cũng cao hơn',
        en: 'It always shrinks the denominator, so the converted ratio is always higher',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Mẫu số đếm phần hụt của TỪNG phiên so với ngưỡng, nên chia nhỏ mục tiêu năm ra từng kỳ làm số phiên bị coi là hụt nhiều lên hẳn. Wikipedia nói rõ chỗ này: “This significantly affects the amount of risk that is identified. For example, a goal of earning 1% in every month of one year results in a greater risk than the seemingly equivalent goal of earning 12% in one year.” Vì vậy đừng so Sortino tính theo phiên với Sortino tính theo tháng hay theo năm của cùng một danh mục, dù ngưỡng ghi trên giấy giống nhau.',
      en: "The denominator counts each session's shortfall against the threshold, so slicing an annual target into short periods sharply increases how many periods count as falling short. Wikipedia spells this out: “This significantly affects the amount of risk that is identified. For example, a goal of earning 1% in every month of one year results in a greater risk than the seemingly equivalent goal of earning 12% in one year.” So never compare a session-based Sortino ratio with a monthly or annual one for the same portfolio, even when the stated threshold looks identical.",
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Sortino_ratio',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q214',
    formulaId: 'ty-so-sortino',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một quỹ khoe suốt 215 tháng chỉ có 10 tháng lỗ, biến động rất thấp, nên Sortino của quỹ vọt lên rất cao. Nên hiểu con số đó thế nào?',
      en: 'A fund reports only 10 losing months out of 215 with very low volatility, so its Sortino ratio comes out extremely high. How should that number be read?',
    },
    choices: {
      a: {
        vi: 'Là bằng chứng quỹ quản trị rủi ro giỏi, nên rót thêm tiền',
        en: 'Proof the fund manages risk well, so put more money in',
      },
      b: {
        vi: 'Là dấu hiệu phải soi lại nguồn số liệu: gần như không còn phiên giảm để chia, mà chuỗi lãi đều bất thường đúng là một trong các dấu hiệu cảnh báo của vụ Madoff',
        en: 'A signal to go back and check where the numbers come from: there is almost no downside left to divide by, and an unnaturally smooth track record was one of the Madoff red flags',
      },
      c: {
        vi: 'Là con số vô nghĩa, vì Sortino không tính được khi có quá ít tháng lỗ',
        en: 'A meaningless number, because the Sortino ratio cannot be computed with so few losing months',
      },
      d: {
        vi: 'Là ảo giác của phép quy năm; tính lại theo tháng thì tỷ số sẽ về mức bình thường',
        en: 'An artifact of annualization; recomputed monthly, the ratio would fall back to normal',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Mẫu số Sortino chỉ lớn lên nhờ các phiên rơi dưới ngưỡng, nên một chuỗi gần như không lỗ sẽ đẩy tỷ số lên cực cao mà chẳng chứng minh được điều gì về kỹ năng. The Hedge Fund Journal xếp đúng đặc điểm này vào danh sách dấu hiệu cảnh báo bị bỏ lỡ của Bernard Madoff: “Of 215 months only 10 were reported as being down, with the fund displaying very low volatility.” — bài viết nói về vụ ponzi bị cáo buộc quy mô 50 tỷ USD. Gặp tỷ số cao bất thường thì việc cần làm là kiểm tra lại dữ liệu và tính thanh khoản của tài sản, không phải rót thêm tiền.',
      en: 'The Sortino denominator only grows from sessions that fall below the threshold, so a track record with almost no losses pushes the ratio sky-high while proving nothing about skill. The Hedge Fund Journal lists exactly this trait among the missed red flags in the Bernard Madoff case: “Of 215 months only 10 were reported as being down, with the fund displaying very low volatility.” — the article concerns an alleged US$50 billion ponzi scheme. When a ratio looks impossibly good, the move is to re-examine the data and the liquidity of the underlying assets, not to add money.',
    },
    source: {
      url: 'https://thehedgefundjournal.com/madoff-d1/',
      kind: 'trai-nghiem',
      vietnam: false,
    },
  },
  {
    id: 'Q079',
    formulaId: 'do-lech-chuan-ban-phan',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Cách tính downside deviation phổ biến nhất — và cũng sai nhất — là gì?' },
    choices: {
      a: { vi: 'Bỏ hết phiên dương rồi lấy độ lệch chuẩn phần còn lại' },
      b: { vi: 'Chia cho tổng số quan sát' },
      c: { vi: 'Dùng MAR bằng 0' },
      d: { vi: 'Lấy căn của phương sai' },
    },
    answer: 'a',
    explain: {
      vi: 'Sai phổ biến nhất là vứt bỏ hết phiên dương rồi lấy độ lệch chuẩn của riêng những phiên âm: làm vậy là chia cho số phiên âm thay vì chia cho TỔNG số quan sát, nên rủi ro bị hiểu thấp đi đáng kể và Sortino đẹp lên một cách giả tạo. Red Rock Capital trên CME Group: “we have seen the Sortino ratio, and in particular the target downside deviation, calculated incorrectly more often than not... by throwing away all the positive returns and take the standard deviation of negative returns”.',
      en: 'The commonest error is discarding every positive session and taking the standard deviation of the negative ones alone: that divides by the number of negative sessions instead of by the TOTAL number of observations, so risk is materially understated and Sortino flatters the fund. Red Rock Capital, via CME Group: “we have seen the Sortino ratio, and in particular the target downside deviation, calculated incorrectly more often than not... by throwing away all the positive returns and take the standard deviation of negative returns”.',
    },
    source: {
      url: 'https://www.cmegroup.com/education/files/rr-sortino-a-sharper-ratio.pdf',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q257',
    formulaId: 'do-lech-chuan-ban-phan',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một quỹ CTA (quỹ giao dịch có quản lý) có downside deviation CAO HƠN độ lệch chuẩn đầy đủ của chính nó. Theo một bài phân tích chuyên ngành về đo lường rủi ro của CTA, điều này hàm ý gì?',
      en: 'A CTA (managed futures fund) has a downside deviation HIGHER than its own full standard deviation. According to an industry analysis on measuring CTA risk, what does this imply?',
    },
    choices: {
      a: {
        vi: 'Các tháng lỗ của quỹ dao động mạnh hơn hẳn các tháng lãi',
        en: "The fund's losing months swing far more than its winning months",
      },
      b: {
        vi: 'Quỹ chắc chắn đã tính sai công thức downside deviation',
        en: 'The fund must have miscalculated the downside deviation formula',
      },
      c: {
        vi: 'Ngưỡng B đang bị đặt cao hơn lợi suất bình quân của quỹ',
        en: "The threshold B is set above the fund's average return",
      },
      d: {
        vi: 'Quỹ đang có beta âm với thị trường chung',
        en: 'The fund has a negative beta to the broad market',
      },
    },
    answer: 'a',
    explain: {
      vi: "Nguồn viết: “If the reverse was true (where the downside deviation was higher than the standard deviation), that would mean that the CTA's negative months are much more volatile than the CTA's positive months.” Bình thường downside deviation thấp hơn độ lệch chuẩn đầy đủ vì nó chỉ đếm phần dao động xấu; khi nó vượt lên, lý do là các tháng âm dao động dữ dội hơn hẳn các tháng dương, chứ không phải một lỗi tính toán hay chuyện beta.",
      en: "The source states: “If the reverse was true (where the downside deviation was higher than the standard deviation), that would mean that the CTA's negative months are much more volatile than the CTA's positive months.” Downside deviation is normally lower than full standard deviation because it only counts the bad swings; when it overtakes it, the reason is that negative months are far more volatile than positive ones, not a calculation error or a beta story.",
    },
    source: {
      url: 'https://www.managedfuturesinvesting.com/a-better-measure-of-risk-standard-deviation-or-downside-deviation/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q258',
    formulaId: 'do-lech-chuan-ban-phan',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một báo cáo quỹ chỉ ghi vỏn vẹn: “Semideviation: 4%/năm”, không nói thêm gì khác. Theo một bài viết chuyên đề về công thức semideviation, vì sao con số này một mình nó rất KHÓ diễn giải?',
      en: 'A fund report states only: “Semideviation: 4%/year”, nothing else. According to an article on the semideviation formula, why is this figure, by itself, very HARD to interpret?',
    },
    choices: {
      a: {
        vi: 'Vì không rõ ngưỡng B nào được dùng làm mốc, lợi suất bình quân, 0, hay một mức lợi suất tối thiểu chấp nhận được, mỗi mốc cho một ý nghĩa khác nhau',
        en: 'Because it is unclear which benchmark B was used, the mean return, zero, or a minimum acceptable return, each giving the figure a different meaning',
      },
      b: {
        vi: 'Vì số liệu năm luôn phải quy đổi về số liệu tháng thì mới đọc được',
        en: 'Because annual figures always need to be converted to monthly figures before they can be read',
      },
      c: {
        vi: 'Vì semideviation về nguyên tắc không bao giờ được vượt quá 10%/năm',
        en: 'Because semideviation can in principle never exceed 10% per year',
      },
      d: {
        vi: 'Vì báo cáo thiếu ký hiệu % thì con số coi như vô nghĩa',
        en: 'Because omitting the % sign makes the figure meaningless',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Nguồn viết: “One common mistake is failing to define the threshold. Reporting a semideviation of 4% without stating whether the benchmark was the mean return, zero or a minimum acceptable return makes the figure difficult to interpret.” Độ lệch chuẩn bán phần luôn gắn với một ngưỡng B cụ thể; đổi ngưỡng là đổi ý nghĩa của con số, nên một báo cáo thiếu ngưỡng thì người đọc không có cách nào đối chiếu hay diễn giải đúng.',
      en: 'The source states: “One common mistake is failing to define the threshold. Reporting a semideviation of 4% without stating whether the benchmark was the mean return, zero or a minimum acceptable return makes the figure difficult to interpret.” Downside/semideviation is always tied to a specific threshold B; changing the threshold changes what the number means, so a report that omits it leaves the reader with no way to interpret or compare the figure correctly.',
    },
    source: {
      url: 'https://www.finvia.site/blog/en/semideviation-formula',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q259',
    formulaId: 'do-lech-chuan-ban-phan',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Theo bài viết “The Sortino Ratio” (CFA Institute, 2012, dẫn lời một chuyên gia đánh giá quỹ đầu cơ), những khác biệt nào dưới đây có thể khiến downside deviation tính từ CÙNG một chuỗi lợi suất gốc ra hai con số RẤT khác nhau, khiến việc đem so sánh trực tiếp trở nên vô nghĩa nếu không kiểm tra trước?',
      en: 'According to “The Sortino Ratio” (CFA Institute, 2012, quoting a hedge-fund evaluation expert), which of the following differences can make downside deviation computed from the SAME underlying return series come out very different, making a direct comparison meaningless unless checked first?',
    },
    choices: {
      a: {
        vi: 'Tần suất dữ liệu dùng để tính (lợi suất tháng so với lợi suất năm)',
        en: 'The data frequency used (monthly returns vs. annual returns)',
      },
      b: {
        vi: 'Cách tính là rời rạc (dựa thẳng vào lợi suất lịch sử) hay khớp một đường phân phối xác suất liên tục',
        en: 'Whether the method is discrete (straight from historical returns) or fits a continuous probability distribution',
      },
      c: {
        vi: 'Chọn dùng lợi suất danh nghĩa hay lợi suất đã điều chỉnh cổ tức',
        en: 'Whether nominal or dividend-adjusted returns are used',
      },
      d: {
        vi: 'Không có yếu tố nào khác ngoài số phiên quan sát ảnh hưởng tới kết quả',
        en: 'No factor other than the number of observed sessions affects the result',
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: 'Nguồn đưa đúng ví dụ: “Using the monthly returns of the S&P 500 Index for 10 years (2001-2010)... gives a downside deviation of 3.71%... If, however, 10 discrete periods of annual returns are used then there are only four observations below 5%, which produces a dramatically different number” — đổi tần suất tháng sang năm trên cùng một chuỗi giá đã đủ đổi hẳn kết quả. Bài viết còn thuật lại ví dụ của Sortino và Forsey (1996) trên thị trường Nhật thập niên 1980: “In fact, the monthly downside deviation of the sample period was 2.74 percent calculated under the discrete method... The monthly downside deviation rises to 3.20 percent when calculated according to a method that involves fitting a continuous probability curve over the distribution of returns and using integral calculus for the computation.” Cùng một dữ liệu, đổi cách tính (rời rạc/liên tục) cũng đổi kết quả. Phương án (c) không được nguồn nhắc tới, còn (d) bị chính hai ví dụ trên bác bỏ trực tiếp.',
      en: "The source gives this exact example: “Using the monthly returns of the S&P 500 Index for 10 years (2001-2010)... gives a downside deviation of 3.71%... If, however, 10 discrete periods of annual returns are used then there are only four observations below 5%, which produces a dramatically different number” — switching monthly to annual frequency on the same price series alone changes the result drastically. The article also recounts Sortino and Forsey's (1996) 1980s Japan example: “In fact, the monthly downside deviation of the sample period was 2.74 percent calculated under the discrete method... The monthly downside deviation rises to 3.20 percent when calculated according to a method that involves fitting a continuous probability curve over the distribution of returns and using integral calculus for the computation.” Same underlying data, different method (discrete vs. continuous), different result. Option (c) is never mentioned by the source, and (d) is directly contradicted by both examples above.",
    },
    source: {
      url: 'https://rpc.cfainstitute.org/sites/default/files/-/media/documents/code/gips/the-sortino-ratio.pdf',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q260',
    formulaId: 'do-lech-chuan-ban-phan',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một chuyên gia CFA (Amelia Hopkins, Granville Capital) nêu ví dụ: downside deviation tính từ lợi suất THÁNG của chỉ số S&P 500 (giai đoạn 2001–2010, ngưỡng MAR tháng 0,4167%, tương đương 5%/năm) là 3,71%/tháng. Áp đúng quy ước quy đổi ra năm mà bài viết mô tả — nhân với căn bậc hai của số kỳ trong năm, giống hệt cách quy năm độ lệch chuẩn thường dùng — downside deviation theo năm là bao nhiêu %?',
      en: 'A CFA practitioner (Amelia Hopkins, Granville Capital) gives this example: the downside deviation computed from MONTHLY S&P 500 returns (2001-2010, monthly MAR of 0.4167%, i.e. 5% annually) is 3.71%/month. Applying the exact annualizing convention the article describes — multiplying by the square root of the number of periods per year, the same way standard deviation is annualized — what is the annualized downside deviation, in %?',
    },
    facts: [
      {
        label: {
          vi: 'Downside deviation tính theo lợi suất tháng',
          en: 'Downside deviation from monthly returns',
        },
        value: {
          vi: '3,71%/tháng (dữ liệu S&P 500, 2001–2010, ngưỡng MAR tháng 0,4167% ≈ 5%/năm)',
          en: '3.71%/month (S&P 500 data, 2001-2010, monthly MAR 0.4167% ≈ 5%/year)',
        },
      },
      {
        label: {
          vi: 'Quy ước quy đổi ra năm mà bài viết mô tả',
          en: 'Annualizing convention the article describes',
        },
        value: {
          vi: 'Nhân với căn bậc hai của số kỳ trong năm (ở đây là căn 12, vì dùng dữ liệu tháng)',
          en: 'Multiply by the square root of the number of periods per year (here √12, since monthly data is used)',
        },
      },
    ],
    choices: {
      a: { vi: '3,71%/năm', en: '3.71%/year' },
      b: { vi: '12,85%/năm', en: '12.85%/year' },
      c: { vi: '44,52%/năm', en: '44.52%/year' },
      d: { vi: '1,07%/năm', en: '1.07%/year' },
    },
    answer: 'b',
    explain: {
      vi: "Nguồn (bài “The Sortino Ratio”, Deborah Kidd CFA, CFA Institute 2012, dẫn lời Amelia Hopkins) đưa đúng con số này: “Using the monthly returns of the S&P 500 Index for 10 years (2001-2010) and a monthly MAR of 0.4167% (5 percent annually) gives a downside deviation of 3.71%. Annualizing the number by multiplying by the square root of 12 (which is another problem) gives 12.84%.” Lấy 3,71 nhân căn 12 (≈3,4641) ra khoảng 12,85%, khớp con số bài viết nêu (12,84%, chỉ lệch do làm tròn). Chú ý: ngay trong ngoặc, tác giả đã gọi bước nhân căn 12 này là “một vấn đề khác” — bài viết còn nói thẳng phía sau: “I have read that you cannot annualize downside deviation in the same manner as standard deviation... but analytical packages I've seen do it anyway,” tức quy ước này bị dùng phổ biến dù giới chuyên môn không coi là đúng đắn về mặt lý thuyết. Ba đáp án còn lại là ba lỗi hay gặp: 3,71% là bỏ quên bước quy năm và báo thẳng con số theo tháng; 44,52% là nhân với 12 thay vì với căn 12; 1,07% là chia cho căn 12 thay vì nhân.",
      en: "The source (“The Sortino Ratio”, Deborah Kidd CFA, CFA Institute 2012, quoting Amelia Hopkins) gives exactly this: “Using the monthly returns of the S&P 500 Index for 10 years (2001-2010) and a monthly MAR of 0.4167% (5 percent annually) gives a downside deviation of 3.71%. Annualizing the number by multiplying by the square root of 12 (which is another problem) gives 12.84%.” 3.71 × √12 (≈3.4641) works out to about 12.85%, matching the article's 12.84% (the small gap is rounding). Note that the parenthetical already flags the ×√12 step as “another problem,” and the article states outright afterward: “I have read that you cannot annualize downside deviation in the same manner as standard deviation... but analytical packages I've seen do it anyway” — a widely used convention that experts do not consider theoretically sound. The other three are common slips: 3.71% skips the annualizing step and reports the monthly figure as is; 44.52% multiplies by 12 instead of by the square root of 12; 1.07% divides by the square root instead of multiplying.",
    },
    source: {
      url: 'https://rpc.cfainstitute.org/sites/default/files/-/media/documents/code/gips/the-sortino-ratio.pdf',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q080',
    formulaId: 'ty-so-treynor',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Hai danh mục cùng beta, một tập trung 3 mã, một đa dạng 40 mã. Treynor chấm điểm thế nào?',
    },
    choices: {
      a: { vi: 'Danh mục đa dạng cao hơn' },
      b: { vi: 'Như nhau — Treynor chỉ chia cho rủi ro hệ thống' },
      c: { vi: 'Danh mục tập trung cao hơn' },
      d: { vi: 'Không tính được' },
    },
    answer: 'b',
    explain: {
      vi: 'Treynor chấm hai danh mục NHƯ NHAU, vì nó chỉ chia phần vượt chuẩn cho beta, tức chỉ tính rủi ro hệ thống. Danh mục 3 mã có rủi ro tổng cao hơn nhiều nhưng phần rủi ro riêng ấy không được thị trường trả công và cũng không vào mẫu số, nên bị bỏ qua hoàn toàn. “portfolios with identical systematic risk, but different total risk, will be rated the same. But the portfolio with a higher total risk is less diversified and therefore has a higher unsystematic risk which is not priced in the market”. Treynor cũng chỉ là tiêu chí xếp hạng, không lượng hoá giá trị gia tăng.',
      en: 'Treynor scores them the SAME, because it divides excess return by beta and therefore counts only systematic risk. The three-stock portfolio carries far more total risk, but that idiosyncratic part is not rewarded by the market and never enters the denominator, so it is ignored entirely. The source: “portfolios with identical systematic risk, but different total risk, will be rated the same. But the portfolio with a higher total risk is less diversified and therefore has a higher unsystematic risk which is not priced in the market”. Treynor is also only a ranking criterion, it does not quantify value added.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Treynor_ratio',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q271',
    formulaId: 'ty-so-treynor',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một quỹ đầu tư có tỷ số Treynor cao vượt trội trong 3 năm gần nhất. Theo hạn chế được nêu về công thức này, điều đó nói lên gì về hiệu suất TƯƠNG LAI của quỹ?',
      en: "A fund shows an outstandingly high Treynor ratio over the past 3 years. Based on the limitation noted for this metric, what does that tell you about the fund's FUTURE performance?",
    },
    choices: {
      a: {
        vi: 'Đảm bảo quỹ sẽ tiếp tục vượt trội trong tương lai',
        en: 'It guarantees the fund will keep outperforming in the future',
      },
      b: {
        vi: 'Không đảm bảo gì cả, vì tỷ số chỉ phản ánh cách danh mục đã vận hành trong quá khứ',
        en: 'It guarantees nothing, because the ratio only reflects how the portfolio has behaved in the past',
      },
      c: {
        vi: 'Đảm bảo beta của quỹ sẽ không đổi',
        en: "It guarantees the fund's beta will stay unchanged",
      },
      d: {
        vi: 'Đảm bảo quỹ đã loại bỏ hết rủi ro phi hệ thống',
        en: 'It guarantees the fund has eliminated all unsystematic risk',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn liệt kê tính nhìn-về-quá-khứ là một hạn chế của tỉ lệ Treynor: “Hạn chế của tỉ lệ Treynor là bản chất nhìn về quá khứ. Việc đầu tư có khả năng thực hiện và phản ứng khác trong tương lai so với trước đây.” Một tỷ số Treynor cao trong quá khứ không đảm bảo gì cho tương lai, vì cả beta lẫn mối quan hệ với thị trường đều có thể thay đổi.',
      en: 'The source lists the backward-looking nature as a limitation of the Treynor ratio: “Hạn chế của tỉ lệ Treynor là bản chất nhìn về quá khứ. Việc đầu tư có khả năng thực hiện và phản ứng khác trong tương lai so với trước đây” (the investment may perform and react differently in the future than it did before). A high past Treynor ratio guarantees nothing about the future, since both beta and the relationship with the market can change.',
    },
    source: {
      url: 'https://vietnambiz.vn/ti-le-treynor-treynor-ratio-la-gi-dac-diem-cong-thuc-tinh-va-han-che-20200506145207118.htm',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q272',
    formulaId: 'ty-so-treynor',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Danh mục A có tỷ số Treynor cao hơn danh mục B. Theo hạn chế được nêu, điều đó có tự động cho biết gì so với CHÍNH thị trường (market portfolio)?',
      en: 'Portfolio A has a higher Treynor ratio than portfolio B. Based on the limitation noted, does that automatically tell you anything relative to the market portfolio ITSELF?',
    },
    choices: {
      a: {
        vi: 'Cho biết chính xác A vượt trội thị trường bao nhiêu phần trăm',
        en: 'It tells you exactly how many percentage points A outperforms the market by',
      },
      b: {
        vi: 'Không cho biết gì — tỷ số không nói được danh mục có tốt hơn chính thị trường hay không',
        en: 'It tells you nothing — the ratio does not say whether the portfolio is better than the market itself',
      },
      c: { vi: 'Cho biết A chắc chắn có beta bằng 1', en: "It tells you A's beta must equal 1" },
      d: {
        vi: 'Cho biết A không còn rủi ro phi hệ thống',
        en: 'It tells you A has no unsystematic risk left',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn nêu: “they do not provide information on whether the portfolios are better than the market portfolio.” Tỷ số Treynor (cũng như Sharpe) chỉ xếp hạng các danh mục với nhau; tự thân con số không nói được danh mục có đánh bại chính thị trường (chỉ số) hay không.',
      en: 'The source states: “they do not provide information on whether the portfolios are better than the market portfolio.” The Treynor ratio (like the Sharpe ratio) only ranks portfolios against each other — the number itself does not say whether a portfolio beats the market (the index) itself.',
    },
    source: {
      url: 'https://analystprep.com/cfa-level-1-exam/portfolio-management/calculate-and-interpret-the-sharpe-ratio-treynor-ratio-m2-and-jensens-alpha/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q273',
    formulaId: 'ty-so-treynor',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Theo tài liệu ôn thi CFA Level I, những điều kiện nào khiến tỷ số Treynor MẤT khả năng so sánh có ý nghĩa giữa các danh mục?',
      en: 'According to CFA Level I exam-prep material, which conditions make the Treynor ratio fail to give a meaningful comparison between portfolios?',
    },
    choices: {
      a: {
        vi: 'Phần bù rủi ro (tử số, Rp − Rf) của danh mục bị âm',
        en: "The portfolio's risk premium (numerator, Rp − Rf) is negative",
      },
      b: { vi: 'Beta của danh mục âm', en: "The portfolio's beta is negative" },
      c: { vi: 'Beta của danh mục lớn hơn 1', en: "The portfolio's beta is greater than 1" },
      d: {
        vi: 'Lãi suất phi rủi ro tăng trong kỳ đánh giá',
        en: 'The risk-free rate rises during the evaluation period',
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: 'Nguồn nêu đúng hai điều kiện làm hỏng khả năng so sánh của tỷ số Treynor: “As with the Sharpe ratio, the Treynor ratio requires positive numerators to give meaningful comparative results” (tử số phải dương) và “Apart from this, the Treynor ratio does not work for negative beta assets” (không dùng được với beta âm). Beta lớn hơn 1 hay lãi suất phi rủi ro đổi theo thời gian không nằm trong hai điều kiện này — công thức vẫn tính và so sánh bình thường.',
      en: "The source names exactly two conditions that break the Treynor ratio's comparability: “As with the Sharpe ratio, the Treynor ratio requires positive numerators to give meaningful comparative results” (the numerator must be positive) and “Apart from this, the Treynor ratio does not work for negative beta assets” (it fails for negative-beta assets). A beta above 1 or a rising risk-free rate is not among these conditions — the ratio still computes and compares normally in those cases.",
    },
    source: {
      url: 'https://analystprep.com/cfa-level-1-exam/portfolio-management/calculate-and-interpret-the-sharpe-ratio-treynor-ratio-m2-and-jensens-alpha/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q274',
    formulaId: 'ty-so-treynor',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một danh mục có lợi suất 22%/năm, lãi suất phi rủi ro 1%/năm và beta so với thị trường bằng 2,5. Công thức tỷ số Treynor đã dựng sẵn dưới đây, chia thêm cho 100 để đưa hai lợi suất từ thang phần trăm về dạng tỷ lệ. Điền ba con số vào đúng ô trống — chú ý ô nào là lợi suất danh mục, ô nào là lãi suất phi rủi ro.',
      en: "A portfolio returns 22%/year, the risk-free rate is 1%/year, and the portfolio's beta versus the market is 2.5. The Treynor ratio formula is laid out below, with the extra division by 100 that turns the two percentage returns into plain ratios. Put the three figures into the right slots — mind which slot takes the portfolio return and which takes the risk-free rate.",
    },
    facts: [
      {
        label: { vi: 'Lợi suất danh mục / năm', en: 'Portfolio return / year' },
        value: { vi: '22%', en: '22%' },
      },
      {
        label: { vi: 'Lãi suất phi rủi ro / năm', en: 'Risk-free rate / year' },
        value: { vi: '1%', en: '1%' },
      },
      { label: { vi: 'Beta của danh mục', en: 'Portfolio beta' }, value: { vi: '2,5', en: '2.5' } },
    ],
    expected: 0.084,
    tolerance: { kind: 'tuyet-doi', value: 0.003 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'Treynor = ([22] − [1]) ÷ 100 ÷ [2,5]',
      en: 'Treynor = ([22] − [1]) ÷ 100 ÷ [2.5]',
    },
    explain: {
      vi: 'Nguồn tính ví dụ mẫu: “For investment C, the Treynor ratio comes out to be ( 22 – 1 ) / (2.5 * 100) = 0.084”. Cách viết (2,5 × 100) chỉ là mẹo đổi hiệu số phần trăm (22 − 1 = 21) sang số thập phân trước khi chia cho beta — bản chất vẫn là (22% − 1%) / 2,5 = 0,21 / 2,5 = 0,084. Người quen các tỷ số kiểu Sharpe hay nhân kết quả với 100, hoặc quên đổi % sang số thập phân trước khi chia cho beta, nên hay tính sai bước này.',
      en: "The source's worked example: “For investment C, the Treynor ratio comes out to be ( 22 – 1 ) / (2.5 * 100) = 0.084.” Writing (2.5 × 100) is just a trick to turn the percentage-point difference (22 − 1 = 21) into a decimal before dividing by beta — it is really (22% − 1%) / 2.5 = 0.21 / 2.5 = 0.084. People used to Sharpe-style ratios often multiply the result by 100, or forget to convert the % figures to a decimal before dividing by beta, and get this step wrong.",
    },
    source: {
      url: 'https://www.wallstreetmojo.com/treynor-ratio/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q081',
    formulaId: 'ty-so-thong-tin',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Vì sao Information Ratio có thể ra âm ngay cả khi nhà quản lý thực sự tạo alpha?',
    },
    choices: {
      a: { vi: 'Do tracking error quá nhỏ' },
      b: { vi: 'Do IR dùng lợi suất số học và bỏ qua đòn bẩy' },
      c: { vi: 'Do chọn sai chỉ số' },
      d: { vi: 'Do chưa trừ phí quản lý' },
    },
    answer: 'b',
    explain: {
      vi: 'Vì Information Ratio dùng lợi suất số học thay vì lợi suất hình học và bỏ qua đòn bẩy, nên chuỗi lợi suất có biến động mạnh sẽ bị tính lệch: tỷ số ra âm trong khi nhà quản lý vẫn thực sự vượt chỉ số tham chiếu, và ngược lại. Nguyên văn: “it considers arithmetic returns (rather than geometric returns) and ignores leverage. This can lead to the Information Ratio calculated for a manager being negative when the manager produces alpha to the benchmark and vice versa”.',
      en: 'Because the Information Ratio uses arithmetic rather than geometric returns and ignores leverage, a volatile return series is measured off-center: the ratio can come out negative while the manager really is beating the benchmark, and the other way round. Verbatim: “it considers arithmetic returns (rather than geometric returns) and ignores leverage. This can lead to the Information Ratio calculated for a manager being negative when the manager produces alpha to the benchmark and vice versa”.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Information_ratio',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q275',
    formulaId: 'ty-so-thong-tin',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Những điều kiện nào dưới đây khiến một Information Ratio tính ra KHÔNG còn đáng tin cậy hoặc mất ý nghĩa?',
      en: 'Which of the following conditions make a calculated Information Ratio unreliable or meaningless?',
    },
    choices: {
      a: {
        vi: 'Benchmark dùng để so sánh không phù hợp hoặc là một benchmark quá yếu',
        en: 'The benchmark used for comparison is a poor fit or is too weak',
      },
      b: {
        vi: 'Mẫu quan sát quá ngắn, ví dụ mới chỉ chạy một backtest vài tháng',
        en: 'The observation sample is too short, e.g. only a few months of backtest',
      },
      c: {
        vi: 'Lợi suất phân phối lệch mạnh, không đủ ôn hoà như giả định của thước đo',
        en: 'Returns are heavily skewed, not well-behaved as the measure assumes',
      },
      d: {
        vi: 'Danh mục duy trì Information Ratio trên 0,5 liên tục nhiều năm',
        en: 'The portfolio sustains an Information Ratio above 0.5 for many years running',
      },
    },
    answers: ['a', 'b', 'c'],
    explain: {
      vi: '“a mismatched benchmark renders it meaningless”; về mẫu ngắn: “Short backtests routinely print far higher values that regress sharply out of sample”; về phân phối lợi suất: “like the Sharpe ratio it assumes reasonably well-behaved return distributions and enough observations for the mean estimate to be trustworthy”. Ba điều trên đúng, còn duy trì IR trên 0,5 nhiều năm lại là điều ngược lại: chính nguồn gọi mốc đó là biểu hiện của kỹ năng thật (rule of thumb 0,5 = tốt khi giữ được qua nhiều năm), không phải dấu hiệu thước đo bị sai.',
      en: 'The source: “a mismatched benchmark renders it meaningless”; on short samples: “Short backtests routinely print far higher values that regress sharply out of sample”; on return distributions: “like the Sharpe ratio it assumes reasonably well-behaved return distributions and enough observations for the mean estimate to be trustworthy”. All three hold, while sustaining an IR above 0.5 for years is the opposite case, the same source calls that a mark of genuine skill, not a sign the measure is broken.',
    },
    source: {
      url: 'https://www.luxalgo.com/library/concept/information-ratio/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q276',
    formulaId: 'ty-so-thong-tin',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một chiến lược có Information Ratio tính trên dữ liệu THÁNG là 1,08 lần. Quy ước quy năm là nhân với căn bậc hai số kỳ trong năm. Điền hai con số ấy vào đúng ô trống của công thức dưới đây.',
      en: "A strategy's Information Ratio computed from MONTHLY data is 1.08x. The annualization convention multiplies by the square root of the number of periods per year. Put those two figures into the right slots of the formula below.",
    },
    facts: [
      {
        label: {
          vi: 'Information Ratio theo tháng (chưa quy năm)',
          en: 'Monthly Information Ratio (not yet annualized)',
        },
        value: { vi: '1,08 lần', en: '1.08x' },
      },
      {
        label: { vi: 'Số kỳ (tháng) trong một năm', en: 'Number of periods (months) per year' },
        value: { vi: '12', en: '12' },
      },
    ],
    expected: 3.74,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: 'lần', en: 'x' },
    /*
     * Nguồn (quantt.co.uk, trang Anh) viết "Annualised", không phải "Annualized". Bản `vi` giữ
     * nguyên — câu trích tồn tại để người đọc mở nguồn đối chiếu, đổi chính tả là phá điều đó.
     * Bản `en` chuẩn hoá theo `annualiz` (US) đúng quy ước chính tả của sản phẩm — `i18n.test.ts`
     * quét MỌI chuỗi `en:` trong Domain, không chừa phần trong ngoặc kép. Hai bản vì thế lệch
     * đúng một chữ cái ở từ này, có chủ đích.
     */
    worked: {
      vi: 'IR năm = [1,08] × √[12]',
      en: 'Annualized IR = [1.08] × √[12]',
    },
    explain: {
      vi: 'Nguồn nêu đúng ví dụ số cho quy ước này: “Annualised IR = 1.08 x sqrt(12) = 1.08 x 3.464 = 3.74”, tức nhân IR theo kỳ với căn bậc hai số kỳ trong năm (12 cho dữ liệu tháng, 252 cho dữ liệu ngày, 52 cho dữ liệu tuần). Cùng nguồn cảnh báo sai lầm phổ biến: “applying sqrt(252) to monthly data or sqrt(12) to daily data is a common mistake”, dùng nhầm hệ số quy năm ứng với tần suất dữ liệu khiến kết quả vô nghĩa.',
      en: 'The source gives the worked example for this exact convention: “Annualized IR = 1.08 x sqrt(12) = 1.08 x 3.464 = 3.74”, meaning the per-period IR is multiplied by the square root of periods per year (12 for monthly data, 252 for daily, 52 for weekly). The same source flags a common mistake: “applying sqrt(252) to monthly data or sqrt(12) to daily data is a common mistake” that renders the result meaningless.',
    },
    source: {
      url: 'https://www.quantt.co.uk/resources/information-ratio-explained',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q277',
    formulaId: 'ty-so-thong-tin',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Theo quy tắc kinh nghiệm được giới thực hành viện dẫn, một Information Ratio khoảng bao nhiêu, nếu duy trì được nhiều năm liền, đã được xem là tốt?',
      en: 'According to the rule of thumb cited by industry practitioners, roughly what Information Ratio, if sustained over multiple years, is considered good?',
    },
    choices: {
      a: { vi: 'Khoảng 0,05', en: 'About 0.05' },
      b: { vi: 'Khoảng 0,5', en: 'About 0.5' },
      c: { vi: 'Khoảng 3,0', en: 'About 3.0' },
      d: { vi: 'Khoảng 10', en: 'About 10' },
    },
    answer: 'b',
    explain: {
      vi: '“Rules of thumb from institutional practice call roughly 0.5 good and 1.0 excellent when sustained over multiple years”. Cùng nguồn cảnh báo thêm: “Short backtests routinely print far higher values that regress sharply out of sample”, nên một IR rất cao đo trên vài tháng không nói lên điều gì; mốc 0,5 chỉ có ý nghĩa khi giữ được qua nhiều năm.',
      en: '“Rules of thumb from institutional practice call roughly 0.5 good and 1.0 excellent when sustained over multiple years.” The same source warns: “Short backtests routinely print far higher values that regress sharply out of sample”, so a very high IR measured over a few months proves nothing; the 0.5 benchmark only carries weight when sustained over years.',
    },
    source: {
      url: 'https://www.luxalgo.com/library/concept/information-ratio/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q082',
    formulaId: 'ty-so-calmar',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Nhược điểm cốt lõi của tỷ số Calmar là gì?' },
    choices: {
      a: { vi: 'Không tính lãi suất phi rủi ro' },
      b: { vi: 'Mẫu số là một sự kiện lịch sử duy nhất nên chỉ số rất nhiễu' },
      c: { vi: 'Chỉ dùng cho quỹ phòng hộ' },
      d: { vi: 'Không tính được khi lợi suất âm' },
    },
    answer: 'b',
    explain: {
      vi: 'Mẫu số của Calmar là mức sụt giảm sâu nhất, tức MỘT sự kiện lịch sử duy nhất, nên cả tỷ số dựng trên một điểm dữ liệu: đổi cửa sổ quan sát là đổi hẳn kết quả, và lịch sử càng dài thì Calmar càng có xu hướng xấu đi chỉ vì có thêm thời gian để một cú sụt sâu hơn xảy ra. “the denominator is one historical event, so the ratio is unstable across windows”, “an estimate built on one data point is noisy”, và Calmar “tends to worsen as the track record grows simply because more time allows deeper drawdowns to occur”.',
      en: 'The Calmar denominator is the deepest drawdown, a SINGLE historical event, so the whole ratio rests on one data point: change the observation window and the answer changes, and the longer the track record the worse Calmar tends to look, purely because more time allows a deeper drawdown to happen. The source: “the denominator is one historical event, so the ratio is unstable across windows”, “an estimate built on one data point is noisy”, and Calmar “tends to worsen as the track record grows simply because more time allows deeper drawdowns to occur”.',
    },
    source: {
      url: 'https://www.luxalgo.com/library/concept/calmar-ratio/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q278',
    formulaId: 'ty-so-calmar',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Theo Corporate Finance Institute, vì sao không nên dùng tỷ số Calmar để xếp hạng trực tiếp hai danh mục nếu một danh mục backtest 3 năm còn danh mục kia chỉ backtest 6 tháng?',
      en: "According to Corporate Finance Institute, why shouldn't the Calmar ratio be used to directly rank two portfolios if one was backtested over 3 years while the other was backtested over only 6 months?",
    },
    choices: {
      a: {
        vi: 'Vì tỷ số Calmar không thể điều chỉnh cho các khung thời gian khác nhau, nên các danh mục phải cùng kỳ backtest mới so sánh được',
        en: 'Because the Calmar ratio cannot be adjusted to different time horizons, so portfolios must share the same backtesting period to be compared',
      },
      b: {
        vi: 'Vì cơ quan quản lý quy định kỳ backtest tối thiểu là 3 năm',
        en: 'Because regulators mandate a minimum 3-year backtesting period',
      },
      c: {
        vi: 'Vì lãi suất phi rủi ro thay đổi theo độ dài kỳ backtest',
        en: 'Because the risk-free rate changes with the length of the backtesting period',
      },
      d: {
        vi: 'Vì công thức tự động chiết khấu kỳ ngắn hơn về cùng một mức với kỳ dài',
        en: 'Because the formula automatically discounts the shorter period down to match the longer one',
      },
    },
    answer: 'a',
    explain: {
      vi: '“the Calmar ratio cannot be adjusted to various time horizons; hence, portfolios must have the same period of backtesting while using the ratio”. Đây không phải quy định pháp lý (ý b) hay một phép chiết khấu tự động trong công thức (ý d) — bản thân tỷ số đơn giản là không có cơ chế quy đổi giữa các độ dài kỳ khác nhau.',
      en: '“the Calmar ratio cannot be adjusted to various time horizons; hence, portfolios must have the same period of backtesting while using the ratio”. This is neither a legal mandate (b) nor an automatic discounting mechanism built into the formula (d) — the ratio simply has no way to reconcile different period lengths.',
    },
    source: {
      url: 'https://corporatefinanceinstitute.com/resources/career-map/sell-side/capital-markets/calmar-ratio/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q279',
    formulaId: 'ty-so-calmar',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Nhiều người dùng lẫn tỷ số Calmar với tỷ số MAR (Managed Account Reports) vì tưởng hai tỷ số này là một. Theo Wikipedia, điểm khác biệt thật sự giữa chúng nằm ở đâu?',
      en: 'Many people conflate the Calmar ratio with the MAR ratio (Managed Account Reports), assuming they are the same thing. According to Wikipedia, where does the real difference lie?',
    },
    choices: {
      a: {
        vi: 'Calmar dùng dữ liệu 36 tháng gần nhất, còn MAR dùng toàn bộ dữ liệu kể từ khi quỹ thành lập',
        en: "Calmar uses the most recent 36 months of data, while MAR uses all performance data since the fund's inception",
      },
      b: {
        vi: 'Calmar chia lợi suất năm hoá cho độ lệch chuẩn, còn MAR chia cho mức sụt giảm sâu nhất',
        en: 'Calmar divides annualized return by standard deviation, while MAR divides by maximum drawdown',
      },
      c: {
        vi: 'Calmar chỉ áp dụng cho quỹ phòng hộ, MAR chỉ áp dụng cho cổ phiếu riêng lẻ',
        en: 'Calmar applies only to hedge funds, MAR only to individual stocks',
      },
      d: {
        vi: 'Calmar dùng lợi suất theo ngày, còn MAR dùng lợi suất theo tuần',
        en: 'Calmar uses daily returns, while MAR uses weekly returns',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Hai tỷ số khác nhau ở cửa sổ dữ liệu, không ở công thức: Calmar chỉ lấy 36 tháng gần nhất, còn MAR lấy toàn bộ dữ liệu kể từ khi quỹ thành lập. Cả hai đều chia lợi nhuận năm hoá cho mức sụt giảm sâu nhất. “Although the Calmar ratio and MAR ratio are sometimes assumed to be identical, they are in fact different: Calmar ratio uses 36 months of performance data, whereas MAR ratio uses all performance data from inception onwards”.',
      en: 'The two differ in the data window, not the formula: Calmar takes only the most recent 36 months, while MAR takes all data since the fund was launched. Both divide annualized return by maximum drawdown. “Although the Calmar ratio and MAR ratio are sometimes assumed to be identical, they are in fact different: Calmar ratio uses 36 months of performance data, whereas MAR ratio uses all performance data from inception onwards.”',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Calmar_ratio',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q083',
    formulaId: 'ty-so-thang-thua',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Trader chuyên nghiệp Peter Brandt có tỷ lệ thắng bao nhiêu trong sự nghiệp?' },
    choices: {
      a: { vi: 'Trên 70%' },
      b: { vi: 'Dưới 50%' },
      c: { vi: 'Khoảng 60%' },
      d: { vi: 'Không công bố' },
    },
    answer: 'b',
    explain: {
      vi: 'Dưới 50% suốt cả sự nghiệp, tức thua nhiều hơn thắng, mà vẫn lãi lớn: lợi nhuận đến từ độ lớn của một nhóm nhỏ lệnh thắng chứ không từ tần suất thắng. Brandt: “a win rate throughout my career that has always been below 50%” và “85% of my career profits come from 15% of my trades”. Đây là lý do tỷ lệ thắng đứng một mình không nói được hệ thống có lãi hay không.',
      en: 'Below 50% across his whole career, losing more often than winning, and still highly profitable: the profit comes from the size of a small group of winners, not from how often he wins. Brandt: “a win rate throughout my career that has always been below 50%” and “85% of my career profits come from 15% of my trades”. This is why a win rate on its own says nothing about whether a system makes money.',
    },
    source: {
      url: 'https://traderviet.tv/t/ty-le-thang-win-rate-cua-trader-chuyen-nghiep-la-bao-nhieu.28912/',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q280',
    formulaId: 'ty-so-thang-thua',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Theo bài viết, nếu một nhà đầu tư KHÔNG có tỷ lệ chiến thắng (win rate) cao, để vẫn đảm bảo có lợi nhuận thì tỷ lệ lãi/lỗ của các giao dịch cần như thế nào?',
      en: 'According to the article, if an investor does NOT have a high win rate, what must the profit/loss ratio of their trades be to still secure a profit?',
    },
    choices: {
      a: {
        vi: 'Bắt buộc phải tốt (đủ lớn) để bù lại',
        en: 'It must be good (large enough) to make up for it',
      },
      b: {
        vi: 'Không quan trọng, cứ giữ nguyên như hiện tại',
        en: "It doesn't matter, keep it as is",
      },
      c: {
        vi: 'Nên hạ xuống dưới 1 cho dễ chốt lời',
        en: 'It should be pushed below 1 for easier profit-taking',
      },
      d: {
        vi: 'Chuyển sang đếm số lệnh thắng thay vì đo biên độ lãi/lỗ',
        en: 'Switch to counting winning trades instead of measuring gain/loss size',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Bài viết nêu quan hệ tỷ lệ nghịch giữa hai đại lượng: win rate cao thì tỷ lệ lãi/lỗ có thể thấp mà vẫn ổn; còn nguồn viết rõ chiều ngược lại: “Ngược lại, nếu NĐT không có tỷ lệ chiến thắng cao thì bắt buộc phải có tỷ lệ lãi/lỗ tốt thì mới đảm bảo được lợi nhuận”. Đúng như mục "Sai lầm thường gặp" của công thức trong bài: một tỷ số thắng/thua chỉ có ý nghĩa khi đặt cạnh tỷ lệ thắng, không phải một con số đứng một mình.',
      en: 'The article states an inverse relationship: with a high win rate the ratio can be low and still be fine; but for the opposite case it says explicitly: “Ngược lại, nếu NĐT không có tỷ lệ chiến thắng cao thì bắt buộc phải có tỷ lệ lãi/lỗ tốt thì mới đảm bảo được lợi nhuận” (conversely, without a high win rate, the ratio must be good [large] to secure a profit). This matches this formula\'s own "common mistakes" note: the ratio only means something once weighed against the win rate, never as a number standing alone.',
    },
    source: {
      url: 'https://daututudau.net/ty-le-lai-lo-phu-hop-trong-dau-tu-chung-khoan',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q281',
    formulaId: 'ty-so-thang-thua',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Theo công thức PF = (p × R) / (1 − p) trong nguồn (p = tỷ lệ thắng, R = tỷ số thắng/thua), một chiến lược có tỷ lệ thắng 40% và tỷ số thắng/thua 2 lần thì Profit Factor (PF) bằng bao nhiêu?',
      en: "Using the source's formula PF = (p × R) / (1 − p) (p = win rate, R = the win/loss ratio), a strategy with a 40% win rate and a win/loss ratio of 2 has what Profit Factor (PF)?",
    },
    facts: [
      { label: { vi: 'Tỷ lệ thắng (p)', en: 'Win rate (p)' }, value: { vi: '40%', en: '40%' } },
      {
        label: { vi: 'Tỷ số thắng/thua (R)', en: 'Win/loss ratio (R)' },
        value: { vi: '2 lần (2:1)', en: '2 (2:1)' },
      },
    ],
    choices: {
      a: { vi: '0,8 lần', en: '0.8x' },
      b: { vi: '1,33 lần', en: '1.33x' },
      c: { vi: '2 lần', en: '2x' },
      d: { vi: '3,33 lần', en: '3.33x' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn cho sẵn đúng ví dụ số này: “a 40% win rate with a 2:1 payoff has PF = 0.4 × 2 / 0.6 ≈ 1.33”. Thay p = 0,4 và R = 2 vào PF = (p×R)/(1−p): (0,4×2)/0,6 = 0,8/0,6 ≈ 1,33 lần. Profit Factor KHÔNG phải là tỷ số thắng/thua — nó khoá thêm tỷ lệ thắng vào, đúng như nguồn nói ba đại lượng (win rate, tỷ số thắng/thua, profit factor) "aren\'t independent" (không độc lập với nhau). Ba đáp án còn lại là ba lỗi hay gặp: 0,8 là dừng ở tử số p × R, quên chia cho tỷ lệ thua; 2 là lấy luôn tỷ số thắng/thua và tưởng nó chính là Profit Factor; 3,33 là chia R cho (1 − p) mà quên nhân tỷ lệ thắng.',
      en: 'The source gives this exact numeric example: “a 40% win rate with a 2:1 payoff has PF = 0.4 × 2 / 0.6 ≈ 1.33”. Plugging p = 0.4 and R = 2 into PF = (p×R)/(1−p) gives 0.8/0.6 ≈ 1.33. Profit factor is NOT the win/loss ratio itself — it folds the win rate in too, exactly why the source says the three quantities "aren\'t independent". The other three are common slips: 0.8 stops at the numerator p × R and forgets to divide by the loss rate; 2 takes the win/loss ratio itself and mistakes it for the Profit Factor; 3.33 divides R by (1 − p) but forgets to multiply by the win rate.',
    },
    source: {
      url: 'https://www.pnlledger.com/profit-factor-vs-win-rate-vs-payoff-ratio/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q282',
    formulaId: 'ty-so-thang-thua',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một nguồn tiếng Việt tính "tỷ lệ lời/lỗ" cho MỘT lệnh cụ thể (khác cách tính trung bình nhiều phiên của công thức trong bài, nhưng cùng ý so lãi tiềm năng với lỗ tiềm năng): tỷ lệ = (giá chốt lời − giá vào lệnh) ÷ (giá vào lệnh − giá cắt lỗ). Áp cho lệnh mua PVS với ba mức giá dưới đây, tỷ lệ này bằng bao nhiêu lần?',
      en: 'A Vietnamese source computes a "profit/loss ratio" for a SINGLE order (a different calculation from this article\'s multi-session average, but the same idea of weighing potential gain against potential loss): ratio = (take-profit price − entry price) ÷ (entry price − stop-loss price). Applied to this PVS buy order with the three prices below, what is the ratio?',
    },
    facts: [
      {
        label: { vi: 'Giá vào lệnh mua PVS', en: 'PVS entry price' },
        value: { vi: '30.000 đ/cp', en: 'VND 30,000/share' },
      },
      {
        label: { vi: 'Giá chốt lời mục tiêu', en: 'Target take-profit price' },
        value: { vi: '36.000 đ/cp', en: 'VND 36,000/share' },
      },
      {
        label: { vi: 'Giá cắt lỗ', en: 'Stop-loss price' },
        value: { vi: '28.000 đ/cp', en: 'VND 28,000/share' },
      },
    ],
    choices: {
      a: { vi: '0,33 lần', en: '0.33x' },
      b: { vi: '1,2 lần', en: '1.2x' },
      c: { vi: '3 lần', en: '3x' },
      d: { vi: '0,2 lần', en: '0.2x' },
    },
    answer: 'c',
    explain: {
      vi: 'Nguồn tính sẵn: “Như vậy, đối với giao dịch này tỷ lệ lời/lỗ của giao dịch này là: (36.000 – 30.000)/(30.000 – 28.000) = 3 lần.” Tử số là khoảng cách tới giá chốt lời, mẫu số là khoảng cách tới giá cắt lỗ; đảo ngược hai vế (lấy khoảng lỗ chia khoảng lãi) là lỗi hay gặp khi mới học đọc tỷ lệ này. Ba đáp án còn lại là ba lỗi hay gặp: 0,33 là đảo ngược tử và mẫu, tức lấy lỗ chia lãi; 1,2 là lấy giá chốt lời chia giá vào lệnh, bỏ qua hẳn khoảng cắt lỗ; 0,2 là lấy phần lãi chia cho giá vào lệnh thay vì chia cho khoảng lỗ.',
      en: 'The source computes it directly: “Như vậy, đối với giao dịch này tỷ lệ lời/lỗ của giao dịch này là: (36.000 – 30.000)/(30.000 – 28.000) = 3 lần.” (So for this trade the profit/loss ratio is (36,000 − 30,000)/(30,000 − 28,000) = 3 times.) The numerator is the distance to the take-profit target, the denominator the distance to the stop-loss; flipping the two (loss distance over profit distance) is a common beginner slip when reading this ratio. The other three are common slips: 0.33 inverts numerator and denominator, dividing loss by gain; 1.2 divides the take-profit price by the entry price, ignoring the stop-loss distance entirely; 0.2 divides the gain by the entry price rather than by the loss distance.',
    },
    source: {
      url: 'https://daututudau.net/ty-le-lai-lo-phu-hop-trong-dau-tu-chung-khoan',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q084',
    formulaId: 'chuoi-phien-giam-dai-nhat',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Hệ thống có tỷ lệ thắng 25%, chạy 100 lệnh. Chuỗi thua dài nhất nên chuẩn bị tinh thần là bao nhiêu?',
    },
    choices: {
      a: { vi: '3 lệnh' },
      b: { vi: 'Khoảng 16 lệnh' },
      c: { vi: '50 lệnh' },
      d: { vi: 'Không dự đoán được' },
    },
    answer: 'b',
    explain: {
      vi: 'Khoảng 16 lệnh thua liên tiếp, theo công thức chuỗi thua kỳ vọng bằng trị tuyệt đối của ln(n) chia cho âm ln(1 trừ P): với tỷ lệ thắng 25% và 100 lệnh thì đó là chuyện bình thường của xác suất, không phải dấu hiệu hệ thống hỏng. “With a 25% win rate on a sample size of 100 trades, you should be comfortable with a loss streak of 16”. Rất nhiều người bỏ cuộc đúng vào lúc chuỗi thua ấy xảy ra.',
      en: 'About 16 losses in a row, from the expected-streak formula, the absolute value of ln(n) divided by minus ln(1 minus P): with a 25% win rate over 100 trades that is ordinary probability, not a sign the system is broken. The source: “With a 25% win rate on a sample size of 100 trades, you should be comfortable with a loss streak of 16”. Plenty of traders quit at precisely that point.',
    },
    source: {
      url: 'https://retailtradersrepository.substack.com/p/s2-b-calculating-your-expected-losing',
      kind: 'trai-nghiem',
      vietnam: false,
    },
  },
  {
    id: 'Q266',
    formulaId: 'chuoi-phien-giam-dai-nhat',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Phân tích lợi suất bình quân của phiên kế tiếp sau các chuỗi 3 đến 6 phiên tăng liên tiếp của S&P 500 giai đoạn 1993-2013 cho thấy điều gì về việc dùng độ dài một chuỗi phiên cùng chiều để đoán phiên kế tiếp?',
      en: 'Looking at the average next-session return after streaks of 3 to 6 consecutive up sessions in the S&P 500 from 1993 to 2013, what does the data suggest about using the length of a same-direction streak to predict the next session?',
    },
    choices: {
      a: {
        vi: 'Chuỗi càng dài thì phiên kế tiếp càng có khả năng đảo chiều',
        en: 'The longer the streak, the more likely the next session reverses',
      },
      b: {
        vi: 'Lợi suất bình quân phiên kế tiếp dao động quanh 0%, không cho thấy thiên hướng rõ rệt theo hướng nào',
        en: 'The average next-session return hovers around 0%, with no clear directional bias',
      },
      c: {
        vi: 'Chuỗi càng dài thì phiên kế tiếp càng có khả năng tiếp tục cùng chiều',
        en: 'The longer the streak, the more likely the next session continues the same way',
      },
      d: {
        vi: 'Không rút ra được gì vì mỗi giai đoạn thị trường một khác',
        en: 'Nothing can be concluded because markets differ across periods',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Tin rằng chuỗi dài thì phiên kế tiếp "phải" đảo chiều chính là ngộ nhận gambler\'s fallacy. Nguồn định nghĩa đây là “an intuitive belief that long streaks, even with fair coins or dice, influence the odds of the next result”, rồi sau khi kiểm chứng bằng dữ liệu S&P 500 (lợi suất bình quân phiên sau chuỗi 3-6 phiên tăng chỉ dao động quanh 0%) kết luận “the data suggests that any sort of directional analysis based on market history is just another example of the Gambler\'s Fallacy”.',
      en: 'Believing a long streak means the next session "has to" reverse is exactly the gambler\'s fallacy. The source defines it as “an intuitive belief that long streaks, even with fair coins or dice, influence the odds of the next result”, then after testing it against S&P 500 data (average returns after 3-6 up-day streaks stayed close to 0%) concludes “the data suggests that any sort of directional analysis based on market history is just another example of the Gambler\'s Fallacy”.',
    },
    source: {
      url: 'https://www.sixfigureinvesting.com/2013/11/market-with-consecutive-up-days/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q267',
    formulaId: 'chuoi-phien-giam-dai-nhat',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một hệ thống giao dịch hay một mã cổ phiếu vừa trải qua một chuỗi thua/giảm liên tiếp dài bất thường. Trong các phát biểu sau, những phát biểu nào ĐÚNG theo các ngộ nhận tâm lý thường gặp đã được ghi nhận?',
      en: 'A trading system or a stock has just gone through an unusually long losing/declining streak. Which of the statements below are correct, based on documented common psychological misconceptions?',
    },
    choices: {
      a: {
        vi: 'Với hầu hết hệ thống, một chuỗi thua dài như vậy không phải dấu hiệu hệ thống hỏng mà gần như là một khả năng chắc chắn về mặt toán học',
        en: 'For most systems, a losing streak that long is not a malfunction but close to a mathematical certainty',
      },
      b: {
        vi: 'Sau nhiều lần thua liên tiếp, xác suất thắng ở lần kế tiếp tăng lên vì "đã đến lúc phải thắng"',
        en: 'After several consecutive losses, the odds of winning the next one go up because a win is "due"',
      },
      c: {
        vi: 'Bỏ một chiến lược đang đúng ngay giữa chuỗi thua, hoặc tăng gấp đôi khối lượng để gỡ lại, là phản ứng cảm tính thường gặp chứ không phải cách xử lý đúng',
        en: 'Abandoning a sound strategy mid-streak, or doubling position size to win it back, is a common emotional reaction rather than the right response',
      },
      d: {
        vi: 'Xác suất thắng hay thua của lệnh/phiên kế tiếp phụ thuộc vào kết quả của các lệnh/phiên liền trước nó',
        en: 'The odds of winning or losing the next trade or session depend on the outcomes of the ones right before it',
      },
    },
    answers: ['a', 'c'],
    explain: {
      vi: "Nguồn gọi thẳng đây là hai thiên kiến gây hại: “Two biases do the damage. The gambler's fallacy convinces us that after several losses a win is \"due\" — it isn't; each trade's odds are unchanged.” Nguồn cũng khẳng định với hầu hết hệ thống, chuỗi thua dài “are not a malfunction. They are a mathematical certainty”, và nêu sai lầm lớn nhất là “abandoning a sound strategy mid-streak, or doubling size to 'win it back'”. Vậy (a) và (c) đúng; (b) và (d) chính là ngộ nhận gambler's fallacy mà nguồn bác bỏ, vì mỗi lệnh có xác suất không đổi bất kể chuỗi trước đó.",
      en: "The source names two biases at fault: “Two biases do the damage. The gambler's fallacy convinces us that after several losses a win is \"due\" — it isn't; each trade's odds are unchanged.” It also states that for most systems a streak that long “are not a malfunction. They are a mathematical certainty”, and names the biggest mistake as “abandoning a sound strategy mid-streak, or doubling size to 'win it back'”. So (a) and (c) are correct; (b) and (d) are exactly the gambler's fallacy the source rejects, since each trade's odds stay unchanged regardless of the prior streak.",
    },
    source: {
      url: 'https://arrowalgo.com/losing-streak-trading/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q085',
    formulaId: 'sut-giam-sau-nhat',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Tài khoản lỗ 50%. Cần lãi bao nhiêu để hoà vốn?' },
    choices: {
      a: { vi: '50%' },
      b: { vi: '75%' },
      c: { vi: '100%' },
      d: { vi: '150%' },
    },
    answer: 'c',
    explain: {
      vi: 'Toán hồi phục phi tuyến, nguồn liệt kê: “Lỗ 10% cần lãi 11,1%... Lỗ 30% cần lãi 42,8%... Lỗ 50% cần lãi 100% để hòa vốn”, và cảnh báo “Khả năng phục hồi tài khoản giảm đi đáng kể, nếu mức lỗ vượt quá 25%”.',
    },
    source: {
      url: 'https://casin.vn/hoc/chung-khoan-co-ban/gong-lo-chung-khoan-thong-tin/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q086',
    formulaId: 'sut-giam-sau-nhat',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Quỹ có max drawdown lịch sử −20%. Suy luận nào sai?' },
    choices: {
      a: { vi: 'Mức giảm tương lai sẽ không vượt −20%' },
      b: { vi: 'Con số phụ thuộc cửa sổ đo' },
      c: { vi: 'Nó rút gọn cả lịch sử về một số duy nhất' },
      d: { vi: 'Quỹ lập năm 2010 sẽ bỏ sót khủng hoảng 2008' },
    },
    answer: 'a',
    explain: {
      vi: 'Sai nhất là suy ra mức sụt tương lai sẽ không quá 20%: mức sụt sâu nhất chỉ ghi lại đúng một giai đoạn tệ nhất ĐÃ xảy ra trong cửa sổ đo, không phải giới hạn cho tương lai. “Maximum drawdown is inherently backward-looking and captures only the single worst historical episode”, “Future drawdowns can be larger or smaller than historical ones”. Một quỹ đo giai đoạn 2010 đến 2019 còn bỏ qua hẳn khủng hoảng 2008, nguyên văn “completely missing the 2008 crisis”.',
      en: 'The worst inference is that future drawdowns will stay within 20%: maximum drawdown records the single worst episode that HAS happened inside the measurement window, it is not a ceiling on what comes next. The source: “Maximum drawdown is inherently backward-looking and captures only the single worst historical episode”, “Future drawdowns can be larger or smaller than historical ones”. A fund measured over 2010 to 2019 misses the 2008 crisis entirely, verbatim “completely missing the 2008 crisis”.',
    },
    source: {
      url: 'https://ryanoconnellfinance.com/maximum-drawdown/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q242',
    formulaId: 'sut-giam-sau-nhat',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Theo bài học của DNSE, tỷ lệ Drawdown (tính theo %) vượt quá mức nào thì nhà đầu tư cần nhanh chóng có biện pháp để ổn định lại?',
      en: "According to DNSE's investor-education article, above what drawdown ratio (in %) should an investor quickly take action to stabilize it?",
    },
    choices: {
      a: { vi: 'Vượt quá 5%', en: 'Above 5%' },
      b: { vi: 'Vượt quá 10%', en: 'Above 10%' },
      c: { vi: 'Vượt quá 20%', en: 'Above 20%' },
      d: {
        vi: 'Không có ngưỡng cụ thể, tuỳ chiến lược mỗi người',
        en: 'There is no specific threshold, it depends on each strategy',
      },
    },
    answer: 'c',
    explain: {
      vi: 'Nguồn viết: “Tỷ lệ Drawdown không nên vượt quá 20%. Bởi tỷ lệ càng cao, khả năng để nhà đầu tư thu hồi được vốn ban đầu càng thấp. Nếu Drawdown vượt quá 20%, nhà đầu tư cần có biện pháp nhanh chóng để ổn định lại tỷ lệ này.” Đây là một ngưỡng tham khảo chung để đọc con số MDD là còn ổn hay đáng báo động, không phải một hằng số tuyệt đối cho mọi khẩu vị rủi ro — nhưng 20% là mốc DNSE dùng để khuyến nghị hành động.',
      en: 'The source states (in Vietnamese): “Tỷ lệ Drawdown không nên vượt quá 20%. Bởi tỷ lệ càng cao, khả năng để nhà đầu tư thu hồi được vốn ban đầu càng thấp. Nếu Drawdown vượt quá 20%, nhà đầu tư cần có biện pháp nhanh chóng để ổn định lại tỷ lệ này.” This is a general reference threshold for reading whether an MDD figure is still fine or alarming, not an absolute constant for every risk appetite — but 20% is the mark DNSE uses to recommend acting quickly.',
    },
    source: {
      url: 'https://www.dnse.com.vn/hoc/drawdown-la-gi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q243',
    formulaId: 'sut-giam-sau-nhat',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Hai quỹ A và B đều có Maximum Drawdown lịch sử bằng nhau, cùng 30%. Quỹ A chỉ có đúng một lần sụt giảm lớn (chính là cú 30% đó), ngoài ra chỉ giảm nhẹ quanh 5%; quỹ B liên tục trải qua các đợt sụt 10%, 15%, 20% trước khi cuối cùng mới gặp cú 30%. Chỉ dựa vào con số MDD bằng nhau, những điều nào sau đây KHÔNG THỂ khẳng định là giống nhau giữa hai quỹ? (chọn tất cả đáp án đúng)',
      en: 'Funds A and B both have the same historical Maximum Drawdown of 30%. Fund A has exactly one large drawdown (that 30% one) and otherwise only shallow ~5% dips; Fund B repeatedly goes through 10%, 15%, 20% drawdowns before finally hitting the 30% one. Based on the equal MDD figure alone, which of the following CANNOT be assumed to be the same between the two funds? (select all that apply)',
    },
    choices: {
      a: {
        vi: 'Tần suất các đợt sụt giảm gần bằng mức tối đa mà quỹ từng trải qua trước đó',
        en: 'The frequency of near-maximum drawdowns each fund went through before that',
      },
      b: {
        vi: 'Cảm giác/mức độ chịu đựng tâm lý của nhà đầu tư khi nắm giữ suốt cả giai đoạn',
        en: 'The psychological toll on an investor holding through the whole period',
      },
      c: {
        vi: 'Mức lãi suất cần thiết để hồi phục về đúng đỉnh cũ sau cú sụt 30% đó',
        en: 'The required gain to recover back to the old peak after that 30% drop',
      },
      d: {
        vi: 'Độ sâu của cú sụt giảm lớn nhất mà mỗi quỹ từng trải qua',
        en: 'The depth of the single largest drawdown each fund ever experienced',
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: 'Nguồn viết: “According to maximum drawdown, both strategies look the same. But clearly, the experience of owning them would have been very different.” Ví dụ đi kèm: quỹ B liên tục gặp các đợt sụt 10%, 15%, 20% trước cú 30%, còn quỹ A ngoài cú 30% đó chỉ giảm nhẹ quanh 5% — hai trải nghiệm nắm giữ rất khác nhau dù MDD giống hệt. Vậy tần suất các đợt sụt gần-tối-đa (a) và cảm giác nắm giữ qua cả giai đoạn (b) không thể suy ra chỉ từ con số MDD. Ngược lại, độ sâu cú giảm lớn nhất (d) chính là con số MDD nên hiển nhiên giống nhau ở cả hai quỹ, và mức lãi cần để hồi phục (c) chỉ phụ thuộc vào % lỗ (30%) nên cũng giống nhau bất kể tần suất.',
      en: 'The source states: “According to maximum drawdown, both strategies look the same. But clearly, the experience of owning them would have been very different.” In its example, fund B repeatedly hits 10%, 15%, 20% drawdowns before the 30% one, while fund A only has shallow ~5% dips besides that 30% drawdown — two very different holding experiences despite an identical MDD. So the frequency of near-maximum drawdowns (a) and the psychological experience of holding through the period (b) cannot be inferred from the MDD figure alone. By contrast, the depth of the largest drawdown (d) is exactly what MDD reports, so it is obviously the same for both funds, and the gain needed to recover (c) depends only on the loss percentage (30%), so it is also identical regardless of frequency.',
    },
    source: {
      url: 'https://portfoliobuilder.substack.com/p/building-blocks-drawdown',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q244',
    formulaId: 'sut-giam-sau-nhat',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'NAV của một danh mục ghi nhận qua 5 phiên liên tiếp theo bảng dưới (tỷ đồng). Mức sụt giảm sâu nhất (MDD) phải tính "cuốn chiếu" theo từng đỉnh mới (rolling) — không phải ghép đỉnh cao nhất với đáy thấp nhất của cả giai đoạn. Điền đúng cặp đỉnh và đáy làm nên MDD vào các ô trống của công thức.',
      en: "A portfolio's NAV over 5 consecutive sessions is given below (VND billion). Maximum Drawdown (MDD) must be computed on a rolling basis against each new peak — not by pairing the period's single highest value with its single lowest. Put the peak and the trough that actually produce the MDD into the formula's slots.",
    },
    facts: [
      {
        label: { vi: 'NAV phiên 1 (tỷ đồng)', en: 'NAV session 1 (VND billion)' },
        value: { vi: '400', en: '400' },
      },
      {
        label: { vi: 'NAV phiên 2 (tỷ đồng)', en: 'NAV session 2 (VND billion)' },
        value: { vi: '150', en: '150' },
      },
      {
        label: { vi: 'NAV phiên 3 (tỷ đồng)', en: 'NAV session 3 (VND billion)' },
        value: { vi: '500', en: '500' },
      },
      {
        label: { vi: 'NAV phiên 4 (tỷ đồng)', en: 'NAV session 4 (VND billion)' },
        value: { vi: '350', en: '350' },
      },
      {
        label: { vi: 'NAV phiên 5 (tỷ đồng)', en: 'NAV session 5 (VND billion)' },
        value: { vi: '450', en: '450' },
      },
    ],
    expected: 62.5,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'MDD = ([400] − [150]) ÷ [400] × 100',
      en: 'MDD = ([400] − [150]) ÷ [400] × 100',
    },
    explain: {
      vi: 'Nếu tính ẩu bằng cách lấy đỉnh cao nhất toàn kỳ (500, ở phiên 3) trừ đáy thấp nhất toàn kỳ (150, ở phiên 2) rồi chia cho 500, sẽ ra 70% — nhưng đáy 150 xảy ra TRƯỚC khi danh mục đạt đỉnh 500, nên phép ghép đó đặt một đáy cạnh một đỉnh còn chưa tồn tại ở thời điểm đó. Nguồn yêu cầu tính trên cơ sở cuốn chiếu: “If calculating the maximum drawdown in Excel, ensure the formula is dynamic to capture each new peak and restart of the cycle, i.e. on a “rolling basis”.” Nghĩa là đỉnh dùng để so sánh phải là đỉnh cao nhất TÍNH ĐẾN THỜI ĐIỂM ĐÓ: ở phiên 2, đỉnh tính đến lúc đó chỉ là 400 (phiên 1), nên mức giảm hợp lệ là (400−150)/400 = 62,5%; ở phiên 4, đỉnh tính đến lúc đó là 500 (phiên 3), mức giảm là (500−350)/500 = 30%. Lớn nhất trong các mức giảm hợp lệ là 62,5% — đó mới là MDD đúng của cả giai đoạn.',
      en: "Naively subtracting the period's single lowest value (150, session 2) from its single highest value (500, session 3) and dividing by 500 gives 70% — but the 150 low occurred BEFORE the portfolio ever reached the 500 peak, so that pairing matches a trough with a peak that did not exist yet at that time. The source requires computing on a rolling basis: “If calculating the maximum drawdown in Excel, ensure the formula is dynamic to capture each new peak and restart of the cycle, i.e. on a “rolling basis”.” This means the comparison peak must be the highest value reached so far: at session 2, the peak-to-date was only 400 (session 1), so the valid drawdown there is (400−150)/400 = 62.5%; at session 4, the peak-to-date is 500 (session 3), giving (500−350)/500 = 30%. The largest of these valid drawdowns is 62.5% — that is the period's correct MDD.",
    },
    source: {
      url: 'https://www.wallstreetprep.com/knowledge/maximum-drawdown-mdd/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q087',
    formulaId: 'sut-giam-hien-tai',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Sụt giảm −17% hồi phục trong 6 tháng so với sụt giảm −5% kéo dài 36 tháng. Cái nào bào mòn nhà đầu tư hơn?',
    },
    choices: {
      a: { vi: 'Cái −17%' },
      b: { vi: 'Có lập luận rằng cái −5% kéo dài 36 tháng khó chịu hơn' },
      c: { vi: 'Như nhau' },
      d: { vi: 'Không so sánh được' },
    },
    answer: 'b',
    explain: {
      vi: 'Cú sụt nông nhưng kéo dài 36 tháng thường bào mòn hơn: độ sâu là con số ai cũng nhìn, còn THỜI GIAN chìm dưới đỉnh mới là thứ người ta phải sống cùng từng tháng, và đó là lúc nhà đầu tư bỏ cuộc. “It can be argued that the duration of the drawdown is more painful than the magnitude”, và nêu đúng cặp ví dụ này. Thời gian phục hồi là thước đo ít được chú ý hơn độ sâu.',
      en: 'The shallow drawdown that drags on for 36 months usually wears people down more: depth is the number everyone looks at, but the TIME spent under the previous peak is what has to be lived through month by month, and that is when investors give up. The source: “It can be argued that the duration of the drawdown is more painful than the magnitude”, using this very pair as the example. Recovery time gets far less attention than depth.',
    },
    source: {
      url: 'https://www.rcmalternatives.com/2013/10/the-2-important-drawdown-measurements-how-deep-how-long/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q245',
    formulaId: 'sut-giam-hien-tai',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một danh mục có bảng theo dõi: đỉnh cao nhất từng đạt 200.000 $, giá trị cuối kỳ 170.000 $ (Mức sụt giảm hiện tại = 15% so với đỉnh), nhưng trước đó danh mục từng rơi tới 25% (từ 100.000 $ xuống 75.000 $) rồi hồi phục hoàn toàn trước khi kỳ đo kết thúc. Con số 15% đang hiển thị lúc này có mâu thuẫn với mức 25% từng ghi nhận không?',
      en: "A portfolio's tracking table shows: highest peak ever $200,000, ending value $170,000 (Current drawdown from peak = 15%), but earlier it had fallen as much as 25% (from $100,000 to $75,000) and fully recovered before the period ended. Does the 15% figure now contradict the 25% recorded earlier?",
    },
    choices: {
      a: {
        vi: 'Có, vì mức sụt giảm chỉ được phép giảm dần theo thời gian, không thể nhỏ hơn mức đã từng ghi nhận',
        en: 'Yes, because drawdown may only shrink over time, never sit below a level once recorded',
      },
      b: {
        vi: 'Không, vì 25% là mức sụt giảm sâu nhất từng xảy ra trong quá khứ và đã hồi phục xong, còn 15% là khoảng cách tới đỉnh gần nhất tính đến hiện tại — hai con số đo hai thời điểm khác nhau',
        en: 'No, because 25% is the worst historical drawdown, already fully recovered, while 15% is the distance to the most recent peak as of now — the two figures measure two different points in time',
      },
      c: {
        vi: 'Có, vì mức sụt giảm hiện tại luôn phải bằng đúng mức sụt giảm sâu nhất',
        en: 'Yes, because current drawdown must always equal the maximum drawdown',
      },
      d: {
        vi: 'Không so sánh được vì hai con số dùng đơn vị tiền tệ khác nhau',
        en: 'They cannot be compared because the two figures use different currency units',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn dùng đúng ví dụ này (đỉnh 200.000 $, giá cuối kỳ 170.000 $): “Current drawdown at the end is 15%, and that final episode remains unrecovered.”, trong khi mức sụt giảm sâu nhất 25% xảy ra sớm hơn (từ 100.000 $ xuống 75.000 $) và ĐÃ hồi phục hoàn toàn trước khi kỳ đo kết thúc. Hai chỉ số nhìn vào hai mốc thời gian khác nhau nên không hề mâu thuẫn — đây chính là nhầm lẫn phổ biến giữa mức sụt giảm hiện tại và mức sụt giảm sâu nhất.',
      en: 'The source uses exactly this example (peak $200,000, ending value $170,000): “Current drawdown at the end is 15%, and that final episode remains unrecovered.”, while the 25% maximum drawdown happened earlier (from $100,000 down to $75,000) and had FULLY recovered before the period ended. The two figures look at two different points in time, so they are not contradictory — this is precisely the common mix-up between current drawdown and maximum drawdown.',
    },
    source: {
      url: 'https://www.luxalgo.com/blog/maximum-drawdown-metric-calculation-and-use-cases/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q246',
    formulaId: 'sut-giam-hien-tai',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một trang hướng dẫn về biểu đồ sụt giảm viết: “A line at zero means the portfolio was at an all-time high in purchasing power, and every dip below is a real loss that a real investor once had to sit through.” Câu này đang nhấn mạnh điều gì về ý nghĩa của mức 0%?',
      en: 'A guide about drawdown charts states: “A line at zero means the portfolio was at an all-time high in purchasing power, and every dip below is a real loss that a real investor once had to sit through.” What is this sentence emphasizing about the meaning of a 0% reading?',
    },
    choices: {
      a: {
        vi: '0% là ngưỡng nguy hiểm, còn số âm mới là vùng an toàn',
        en: '0% is the dangerous threshold, while a negative number is the safe zone',
      },
      b: {
        vi: 'Mức 0% chỉ xảy ra đúng lúc đang ở đỉnh cao nhất, còn mọi mức sụt giảm khác 0 là khoản lỗ CÓ THẬT mà một nhà đầu tư từng phải trải qua, không phải một con số thống kê trừu tượng trên biểu đồ',
        en: 'A 0% reading occurs only exactly at a new peak, while every non-zero drawdown is a REAL loss a real investor once had to live through, not an abstract statistic on a chart',
      },
      c: {
        vi: '0% có nghĩa danh mục chưa bao giờ giảm giá trị trong suốt lịch sử',
        en: '0% means the portfolio has never lost value throughout its whole history',
      },
      d: {
        vi: 'Chỉ cần theo dõi mức 0%, mọi số âm khác đều có thể bỏ qua',
        en: 'Only the 0% level matters; every other negative value can be ignored',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn nói rõ: “A line at zero means the portfolio was at an all-time high in purchasing power, and every dip below is a real loss that a real investor once had to sit through.” — mức 0% chỉ đúng vào lúc lập đỉnh mới, còn mọi con số khác 0 là mức lỗ mà một NGƯỜI THẬT từng phải chịu đựng, không phải một tham số trừu tượng chỉ tồn tại trên biểu đồ.',
      en: 'The source states: “A line at zero means the portfolio was at an all-time high in purchasing power, and every dip below is a real loss that a real investor once had to sit through.” — a 0% reading holds exactly at a new peak, while every non-zero reading is a loss a REAL person actually lived through, not an abstract parameter that only exists on a chart.',
    },
    source: {
      url: 'https://portfoliocharts.com/charts/drawdowns/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q247',
    formulaId: 'sut-giam-hien-tai',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một cổ phiếu đang có Mức sụt giảm hiện tại (DD_t) bằng 30% so với đỉnh trong cửa sổ đang xét. Từ mức giá hiện tại, cổ phiếu cần tăng thêm bao nhiêu phần trăm nữa để giá quay lại đúng đỉnh đó (làm tròn 1 chữ số thập phân)?',
      en: 'A stock currently has a Current drawdown from peak (DD_t) of 30% below the peak of the window. From the current price, how many percent must it gain to climb back to exactly that same peak (round to 1 decimal place)?',
    },
    facts: [
      {
        label: {
          vi: 'Mức sụt giảm hiện tại so với đỉnh (DD_t)',
          en: 'Current drawdown from peak (DD_t)',
        },
        value: { vi: '30%', en: '30%' },
      },
    ],
    choices: {
      a: { vi: '30,0%', en: '30.0%' },
      b: { vi: '33,3%', en: '33.3%' },
      c: { vi: '42,9%', en: '42.9%' },
      d: { vi: '70,0%', en: '70.0%' },
    },
    answer: 'c',
    explain: {
      vi: 'Giá hiện tại = Đỉnh × (1 − 30%) = 0,7 × Đỉnh, nên lãi cần có để quay lại đỉnh = Đỉnh ÷ (0,7 × Đỉnh) − 1 = 1/0,7 − 1 ≈ 42,9%. Nguồn nêu đúng quy luật bất đối xứng này qua các ví dụ nhỏ hơn: “Với việc lỗ 5% thì bạn cần đầu tư lãi sau đó 5.3% thì mới hoàn vốn. Nếu số lỗ là 20% thì bạn phải lãi 25%, và khi số lỗ lên đến 50% thì bạn phải lãi 100% thì mới hoàn vốn” — sụt càng sâu thì mức lãi cần để hoà vốn càng vượt xa mức sụt theo tỷ lệ 1:1, không bao giờ bằng nhau. Ba đáp án còn lại là ba lỗi hay gặp: 30,0% là tưởng giảm bao nhiêu thì tăng lại đúng bấy nhiêu; 33,3% là chia cho đỉnh thay vì chia cho giá hiện tại; 70,0% là phần giá còn lại so với đỉnh, không phải mức tăng cần có.',
      en: 'Current price = Peak × (1 − 30%) = 0.7 × Peak, so the gain needed to return to the peak = Peak ÷ (0.7 × Peak) − 1 = 1/0.7 − 1 ≈ 42.9%. The source states this exact asymmetry with smaller examples: “Với việc lỗ 5% thì bạn cần đầu tư lãi sau đó 5.3% thì mới hoàn vốn. Nếu số lỗ là 20% thì bạn phải lãi 25%, và khi số lỗ lên đến 50% thì bạn phải lãi 100% thì mới hoàn vốn” (a 5% loss needs a 5.3% gain to break even, a 20% loss needs 25%, a 50% loss needs 100%) — the deeper the drawdown, the more the required recovery gain outpaces it, never a 1:1 ratio. The other three are common slips: 30.0% assumes the gain needed equals the loss taken; 33.3% divides by the peak instead of by the current price; 70.0% is the price remaining relative to the peak, not the gain required.',
    },
    source: {
      url: 'https://blog.fireant.vn/post/cut-loss-nguyen-tac-cat-lo',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q088',
    formulaId: 'beta',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Được báo beta của một cổ phiếu Mỹ là 1,10. Khoảng giá trị thật hợp lý là bao nhiêu?',
    },
    choices: {
      a: { vi: '1,09 – 1,11' },
      b: { vi: 'Khoảng 0,70 – 1,50' },
      c: { vi: '1,00 – 1,20' },
      d: { vi: 'Beta không có sai số' },
    },
    answer: 'b',
    explain: {
      vi: 'Sai số chuẩn của một ước lượng beta điển hình ở Mỹ vào khoảng 0,20, nên khoảng tin cậy hai sai số chuẩn đã rộng bằng thế. Damodaran: “The beta estimate for a typical US company has a standard error that is about 0.20”, nên “the true beta could be anywhere from 0.70 to 1.50”.',
      en: 'The standard error of a typical US beta estimate is about 0.20, so a two-standard-error band is already that wide. Damodaran: “The beta estimate for a typical US company has a standard error that is about 0.20”, hence “the true beta could be anywhere from 0.70 to 1.50”.',
    },
    giai: {
      tinh: { vi: 'Khoảng tin cậy 95% của beta', en: 'The 95% confidence band of beta' },
      congThuc: {
        vi: 'Khoảng tin cậy = Beta báo cáo ± 2 × Sai số chuẩn',
        en: 'Confidence band = Reported beta ± 2 × Standard error',
      },
      thaySo: { vi: '1,10 ± 2 × 0,20', en: '1.10 ± 2 × 0.20' },
      ketQua: { vi: '0,70 đến 1,50', en: '0.70 to 1.50' },
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2009/02/problem-with-regression-betas.html',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q089',
    formulaId: 'beta',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Theo quy ước của CafeF, cổ phiếu mới niêm yết dưới 30 phiên được tính beta thế nào?',
    },
    choices: {
      a: { vi: 'Tính trên số phiên có sẵn' },
      b: { vi: 'Không tính beta' },
      c: { vi: 'Gán beta bằng 1' },
      d: { vi: 'Lấy beta trung bình ngành' },
    },
    answer: 'b',
    explain: {
      vi: 'CafeF quy định: beta “được tính dựa trên dữ liệu giao dịch 100 phiên liên tiếp gần thời điểm hiện tại nhất”; dưới 30 phiên thì không tính; từ 30 đến dưới 100 phiên thì tính từ lúc bắt đầu giao dịch. VnExpress bổ sung beta “không phù hợp để đánh giá các công ty mới thành lập, mới lên sàn”.',
    },
    source: {
      url: 'https://cafef.vn/du-lieu/help/hesobeta.aspx',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q090',
    formulaId: 'beta',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: { vi: 'Cổ phiếu UPCoM thanh khoản thấp cho beta rất nhỏ. Kết luận nào đúng?' },
    choices: {
      a: { vi: 'Cổ phiếu này ít rủi ro hơn thị trường' },
      b: { vi: 'Giao dịch thưa làm beta bị lệch xuống một cách có hệ thống' },
      c: { vi: 'Beta nhỏ do vốn hoá nhỏ' },
      d: { vi: 'Do sàn UPCoM biên độ rộng' },
    },
    answer: 'b',
    explain: {
      vi: 'Nghiên cứu về thin trading: các phương pháp hiệu chỉnh (Scholes-Williams, Dimson, Hansen-Hodrick) giảm được độ lệch nhưng “less bias comes at the cost of a higher standard error”. Giao dịch không đồng bộ khiến beta ước lượng thấp hơn thực tế.',
    },
    source: {
      url: 'https://ideas.repec.org/a/bla/jbfnac/v35y2008i9-10p1196-1219.html',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q268',
    formulaId: 'beta',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một nền tảng dữ liệu tính được beta hồi quy (raw beta, Cov/Var thô từ dữ liệu lịch sử) của một cổ phiếu là 1,50. Theo quy ước "beta điều chỉnh" (adjusted beta) mà Bloomberg dùng — bình quân gia quyền giữa beta hồi quy (trọng số 0,67) và beta thị trường bằng 1 (trọng số 0,33) — beta điều chỉnh của cổ phiếu này là bao nhiêu?',
      en: 'A data platform computes a stock\'s regression (raw) beta — the plain Cov/Var from historical data — at 1.50. Under the "adjusted beta" convention Bloomberg uses — a weighted average of the regression beta (weight 0.67) and a market beta of 1 (weight 0.33) — what is this stock\'s adjusted beta?',
    },
    facts: [
      {
        label: {
          vi: 'Beta hồi quy (raw beta) từ dữ liệu lịch sử',
          en: 'Regression (raw) beta from historical data',
        },
        value: { vi: '1,50 lần', en: '1.50x' },
      },
      {
        label: {
          vi: 'Trọng số quy ước: beta hồi quy / beta thị trường (= 1)',
          en: 'Convention weights: regression beta / market beta (= 1)',
        },
        value: { vi: '0,67 / 0,33', en: '0.67 / 0.33' },
      },
    ],
    choices: {
      a: { vi: '1,50 lần', en: '1.50x' },
      b: { vi: '1,335 lần', en: '1.335x' },
      c: { vi: '1,25 lần', en: '1.25x' },
      d: { vi: '1,005 lần', en: '1.005x' },
    },
    answer: 'b',
    explain: {
      vi: 'Corporate Finance Institute nêu đúng công thức Bloomberg dùng: “Adjusted Beta = Regression Beta (0.67) + 1.00 (0.33)”. Beta điều chỉnh là bình quân gia quyền giữa beta hồi quy (trọng số 0,67) và beta thị trường bằng 1 (trọng số 0,33), vì thực nghiệm cho thấy beta có xu hướng trôi dần về 1 qua thời gian. Với beta hồi quy 1,50: 0,67 × 1,50 + 0,33 × 1 = 1,335. Ba đáp án còn lại là ba lỗi hay gặp: 1,50 là báo thẳng beta hồi quy, bỏ qua bước điều chỉnh; 1,25 là lấy bình quân SỐ HỌC của 1,50 và 1, tức cho hai vế trọng số bằng nhau thay vì 0,67 và 0,33; 1,005 là chỉ nhân 0,67 × 1,50 rồi quên cộng vế beta thị trường.',
      en: 'Corporate Finance Institute gives the exact formula Bloomberg applies: “Adjusted Beta = Regression Beta (0.67) + 1.00 (0.33)”. The adjusted beta is a weighted average of the regression beta (weight 0.67) and the market beta of 1 (weight 0.33), because betas empirically tend to drift toward 1 over time. With a regression beta of 1.50: 0.67 × 1.50 + 0.33 × 1 = 1.335. The other three are common slips: 1.50 reports the regression beta as is, skipping the adjustment; 1.25 takes the ARITHMETIC mean of 1.50 and 1, weighting both sides equally instead of 0.67 and 0.33; 1.005 computes only 0.67 × 1.50 and forgets to add the market-beta term.',
    },
    source: {
      url: 'https://corporatefinanceinstitute.com/resources/knowledge/trading-investing/adjusted-beta/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q269',
    formulaId: 'beta',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Bài viết "Beta - công cụ đo lường rủi ro" trên Tin nhanh chứng khoán chỉ ra: khi dùng beta để tính CAPM, phần bù rủi ro tính ra chỉ đủ bù đắp loại rủi ro nào của một cổ phiếu, và bỏ sót loại rủi ro nào?',
      en: 'The article "Beta - a risk measurement tool" on Tin nhanh chứng khoán points out: when beta is used to compute CAPM, the resulting risk premium only compensates for which type of a stock\'s risk, and leaves out which type?',
    },
    choices: {
      a: {
        vi: 'Chỉ bù đắp rủi ro hệ thống, bỏ sót rủi ro riêng (phi hệ thống) của từng công ty',
        en: "Only compensates systematic risk, leaving out each company's own (unsystematic) risk",
      },
      b: {
        vi: 'Bù đắp toàn bộ rủi ro, kể cả rủi ro kinh doanh riêng của công ty',
        en: "Fully compensates all risk, including the firm's own business risk",
      },
      c: {
        vi: 'Chỉ bù đắp rủi ro thanh khoản khi cổ phiếu giao dịch thưa',
        en: 'Only compensates liquidity risk from thin trading',
      },
      d: {
        vi: 'Bù đắp rủi ro tỷ giá chứ không phải rủi ro biến động giá cổ phiếu',
        en: 'Compensates currency risk rather than stock-price risk',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Tin nhanh chứng khoán viết rõ: “kết quả được xác định từ CAPM chỉ đủ để bù đắp rủi ro hệ thống mà không tính đến rủi ro của từng công ty”. Vì beta chỉ là hệ số góc của đường hồi quy lợi suất cổ phiếu theo lợi suất thị trường, nó bỏ qua phần dư của hồi quy — chính là rủi ro phi hệ thống (rủi ro kinh doanh, rủi ro tài chính riêng của doanh nghiệp). Bài viết còn nêu cách bù thêm: cộng vào mức phí CAPM giá trị trung bình các sai số ngẫu nhiên khi hồi quy dữ liệu quá khứ.',
      en: "The Vietnamese outlet Tin nhanh chứng khoán states it plainly: “kết quả được xác định từ CAPM chỉ đủ để bù đắp rủi ro hệ thống mà không tính đến rủi ro của từng công ty” (the result derived from CAPM is only enough to compensate systematic risk, without accounting for each company's own risk) — beta, being only the slope of the stock-return-on-market-return regression, ignores the regression's residual, which stands for unsystematic risk (a firm's own business and financial risk). The article adds a fix: add the average of the regression's random errors to the CAPM premium to cover that gap.",
    },
    source: {
      url: 'https://www.tinnhanhchungkhoan.vn/beta-cong-cu-do-luong-rui-ro-post76647.html',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q091',
    formulaId: 'do-lech-chuan-loi-suat-phien',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Buffett đánh giá thế nào về việc dùng biến động làm đại diện cho rủi ro?' },
    choices: {
      a: { vi: 'Đó là chuẩn mực đúng đắn' },
      b: { vi: 'Cách dạy đó dễ nhưng sai bét' },
      c: { vi: 'Chỉ đúng với danh mục lớn' },
      d: { vi: 'Đúng trong ngắn hạn' },
    },
    answer: 'b',
    explain: {
      vi: 'Ông bác thẳng: biến động không đồng nghĩa rủi ro. Rủi ro thật với Buffett là khả năng mất sức mua vĩnh viễn, còn giá dao động chỉ là giá dao động, thậm chí là cơ hội mua. Thư gửi cổ đông Berkshire: “Volatility is far from synonymous with risk”, và về cách dạy đánh đồng hai thứ ấy: “Though this pedagogic assumption makes for easy teaching, it is dead wrong”.',
      en: 'He rejects it outright: volatility is not risk. For Buffett real risk is the chance of permanently losing purchasing power, while a fluctuating price is just a fluctuating price, and sometimes an opportunity to buy. From the Berkshire shareholder letters: “Volatility is far from synonymous with risk”, and on the teaching that conflates the two: “Though this pedagogic assumption makes for easy teaching, it is dead wrong”.',
    },
    source: {
      url: 'https://www.valueresearchonline.com/stories/27349/buffett-explains-why-volatility-is-not-risk-and-why-equity-is-best/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q092',
    formulaId: 'do-bien-dong-nam-hoa',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Quy tắc nhân căn bậc hai của thời gian để quy biến động về năm đúng khi nào?' },
    choices: {
      a: { vi: 'Luôn đúng' },
      b: {
        vi: 'Khi lợi suất độc lập và phân phối chuẩn — thực tế thị trường có xu hướng và phụ thuộc đường đi',
      },
      c: { vi: 'Chỉ đúng với cổ phiếu' },
      d: { vi: 'Chỉ đúng khi biến động dưới 20%' },
    },
    answer: 'b',
    explain: {
      vi: 'Chỉ đúng khi lợi suất các phiên độc lập và cùng phân phối chuẩn, tức không có xu hướng và không phụ thuộc đường đi. Nguồn nêu thẳng giả định: “Underlying the sqrt[t] relationship... is the assumption that stock market returns follow a Gaussian distribution”, và thực tế thì “returns in the real world are not randomly sampled from some distribution, they are path-dependent”. Khi có xu hướng, ước lượng theo căn bậc hai của thời gian bị thấp đi trong dài hạn.',
      en: 'It only holds when session returns are independent and normally distributed, meaning no trend and no path dependence. The source states the assumption plainly: “Underlying the sqrt[t] relationship... is the assumption that stock market returns follow a Gaussian distribution”, whereas in practice “returns in the real world are not randomly sampled from some distribution, they are path-dependent”. Where a trend exists, the square-root-of-time estimate understates long-horizon volatility.',
    },
    source: {
      url: 'https://www.sixfigureinvesting.com/2014/06/volatility-and-the-square-root-of-time/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q255',
    formulaId: 'do-bien-dong-nam-hoa',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một cổ phiếu có độ lệch chuẩn lợi suất THÁNG bằng 17,9%/tháng. Quy tắc quy năm của "Độ biến động năm hoá" là nhân độ lệch chuẩn một kỳ với căn bậc hai của số kỳ trong năm; ở đây kỳ là tháng. Điền độ lệch chuẩn tháng và số kỳ trong năm vào đúng ô trống.',
      en: 'A stock has a MONTHLY return standard deviation of 17.9%/month. The annualizing rule of "Annualized volatility" multiplies the per-period standard deviation by the square root of the number of periods in a year; here the period is a month. Put the monthly standard deviation and the number of periods per year into the right slots.',
    },
    facts: [
      {
        label: {
          vi: 'Độ lệch chuẩn lợi suất tháng (s)',
          en: 'Monthly return standard deviation (s)',
        },
        value: { vi: '17,9%/tháng', en: '17.9%/month' },
      },
      {
        label: { vi: 'Số kỳ trong một năm (D)', en: 'Periods per year (D)' },
        value: { vi: '12 tháng', en: '12 months' },
      },
    ],
    expected: 62.01,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: '%/năm', en: '%/year' },
    worked: {
      vi: 'Độ biến động năm = [17,9] × √[12]',
      en: 'Annualized volatility = [17.9] × √[12]',
    },
    explain: {
      vi: 'Theo Motley Fool: “Annualized volatility = standard deviation (volatility) multiplied by the square root of the periods in the year.” Nguồn tự tính ví dụ đúng công thức này trên một cổ phiếu có độ lệch chuẩn tháng 17,9%: “Stock A annualized volatility = 17.9% multiplied by the square root of 12, resulting in 62%” — tức 17,9% × √12 ≈ 62%/năm, nhân với CĂN BẬC HAI của 12 chứ không nhân thẳng với 12.',
      en: "Per the Motley Fool: “Annualized volatility = standard deviation (volatility) multiplied by the square root of the periods in the year.” The source's own worked example applies this exact rule to a stock with a 17.9% monthly standard deviation: “Stock A annualized volatility = 17.9% multiplied by the square root of 12, resulting in 62%” — i.e. 17.9% × √12 ≈ 62%/year, using the SQUARE ROOT of 12, not 12 directly.",
    },
    source: {
      url: 'https://www.fool.com/investing/how-to-calculate/annualized-volatility/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q256',
    formulaId: 'do-bien-dong-nam-hoa',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'CFA Institute chỉ ra rằng việc nhân độ lệch chuẩn lợi suất THÁNG với căn bậc hai của 12 để ra độ biến động năm "không thể đúng" về mặt toán học trong trường hợp thông thường. Vì sao?',
      en: 'CFA Institute points out that multiplying monthly return standard deviation by the square root of 12 to get annualized volatility "cannot be correct" mathematically in the ordinary case. Why?',
    },
    choices: {
      a: {
        vi: 'Vì lợi suất năm là TÍCH của các lợi suất tháng (do lãi kép), không phải TỔNG của chúng, trong khi phép nhân với căn bậc hai của số kỳ chỉ đúng khi đại lượng cộng dồn theo TỔNG',
        en: 'Because annual return is the PRODUCT of monthly returns (compounding), not their SUM, while multiplying by the square root of the period count is only valid when the quantity accumulates by SUM',
      },
      b: {
        vi: 'Vì độ lệch chuẩn của lợi suất tháng luôn bằng đúng độ lệch chuẩn của lợi suất ngày',
        en: 'Because monthly return standard deviation always equals daily return standard deviation',
      },
      c: {
        vi: 'Vì thị trường chứng khoán luôn có xu hướng tăng trong dài hạn nên không cần quy năm',
        en: 'Because stock markets always trend upward over the long run, so no annualizing is needed',
      },
      d: {
        vi: 'Vì một năm có thể có 11 hoặc 13 tháng tuỳ theo năm nhuận',
        en: 'Because a year can have 11 or 13 months depending on leap years',
      },
    },
    answer: 'a',
    explain: {
      vi: '“Annual return is a product of monthly returns rather than a sum of monthly returns. Thus, multiplying the standard deviation of monthly returns by the square root of 12 to get annualized standard deviation cannot be correct.” Quy tắc căn bậc hai của thời gian vốn chỉ đúng khi đại lượng cộng dồn theo TỔNG (như lợi suất log); lợi suất đơn (simple return) lại gộp theo TÍCH vì lãi kép, nên áp thẳng công thức thông thường lên lợi suất đơn là chưa chuẩn — khác với góc "độc lập, phân phối chuẩn" mà câu hỏi cũ của công thức này đã hỏi.',
      en: "“Annual return is a product of monthly returns rather than a sum of monthly returns. Thus, multiplying the standard deviation of monthly returns by the square root of 12 to get annualized standard deviation cannot be correct.” The square-root-of-time rule is only strictly valid when the quantity accumulates additively (as log returns do); simple returns instead compound multiplicatively, so applying the rule directly to them is not technically sound — a different angle from the independence/normality issue this formula's earlier quiz item already covers.",
    },
    source: {
      url: 'https://rpc.cfainstitute.org/research/cfa-digest/2013/11/whats-wrong-with-multiplying-by-the-square-root-of-twelve-digest-summary',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q093',
    formulaId: 'he-so-bien-thien',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Khi nào hệ số biến thiên mất ý nghĩa?' },
    choices: {
      a: { vi: 'Khi độ lệch chuẩn quá lớn' },
      b: { vi: 'Khi lợi suất kỳ vọng ở mẫu số bằng 0 hoặc âm' },
      c: { vi: 'Khi số quan sát dưới 30' },
      d: { vi: 'Khi danh mục có trên 20 mã' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn tiếng Việt: “nếu lợi nhuận kì vọng nằm ở mẫu số bằng 0 hoặc âm thì hệ số biến thiên có thể sẽ sai” — tình huống rất thường gặp ở danh mục đang lỗ.',
    },
    source: {
      url: 'https://vietnambiz.vn/he-so-bien-thien-coefficient-of-variation-cv-la-gi-nhung-dac-diem-can-luu-y-20191121233238319.htm',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q261',
    formulaId: 'he-so-bien-thien',
    format: 'dien-so',
    kind: 'doc-ket-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một tài liệu ôn CFA Level I đưa ví dụ: tín phiếu kho bạc (T-Bill) có lợi suất bình quân tháng 0,5% với độ lệch chuẩn 0,58%; khoản đầu tư Y có lợi suất bình quân tháng 1,5% và độ lệch chuẩn 6%. Bảng số liệu có đủ bốn con số của CẢ HAI tài sản — điền đúng hai con số của Y vào công thức hệ số biến thiên (CV) dưới đây.',
      en: 'A CFA Level I study note gives this example: a T-Bill has a mean monthly return of 0.5% with a standard deviation of 0.58%; investment Y has a mean monthly return of 1.5% and a standard deviation of 6%. The table holds all four figures for BOTH assets — put the right two figures for Y into the coefficient of variation (CV) formula below.',
    },
    facts: [
      {
        label: { vi: 'Lợi suất bình quân tháng của T-Bill', en: 'T-Bill mean monthly return' },
        value: { vi: '0,5%', en: '0.5%' },
      },
      {
        label: { vi: 'Độ lệch chuẩn của T-Bill', en: 'T-Bill standard deviation' },
        value: { vi: '0,58%', en: '0.58%' },
      },
      {
        label: { vi: 'Lợi suất bình quân tháng của Y', en: 'Investment Y mean monthly return' },
        value: { vi: '1,5%', en: '1.5%' },
      },
      {
        label: { vi: 'Độ lệch chuẩn của Y', en: 'Investment Y standard deviation' },
        value: { vi: '6%', en: '6%' },
      },
    ],
    expected: 4,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'CV của Y = [6] ÷ [1,5]',
      en: 'CV of Y = [6] ÷ [1.5]',
    },
    explain: {
      vi: '“the dispersion per unit monthly return of T-Bills is less than that of Y. Therefore, investment Y is riskier than an investment on T-Bills” — CV(Y) = 6/1,5 = 4 lần, cao hơn hẳn CV(T-Bill) = 0,58/0,5 = 1,16 lần. Đáng chú ý: nếu chỉ so độ lệch chuẩn thô (6% so với 0,58%, cách nhau hơn 10 lần) sẽ đánh giá chênh lệch rủi ro lớn hơn nhiều so với con số CV thực (chỉ khoảng 3,4 lần) — CV mới là con số đọc đúng rủi ro trên mỗi đơn vị lợi suất khi hai khoản đầu tư có lợi suất kỳ vọng khác nhau.',
      en: '“the dispersion per unit monthly return of T-Bills is less than that of Y. Therefore, investment Y is riskier than an investment on T-Bills.” CV(Y) = 6/1.5 = 4x, well above CV(T-Bill) = 0.58/0.5 = 1.16x. Note that comparing raw standard deviations alone (6% vs 0.58%, a 10x+ gap) would suggest a far bigger risk difference than the actual CV gap (about 3.4x) — CV is the number that correctly reads risk per unit of return when two investments have different expected returns.',
    },
    source: {
      url: 'https://analystprep.com/cfa-level-1-exam/quantitative-methods/coefficient-of-variation-sharpe-ratio/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q262',
    formulaId: 'he-so-bien-thien',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: "Một bài hướng dẫn dùng ví dụ nhà đầu tư Mr. X so sánh ba cổ phiếu bằng hệ số biến thiên (bảng dưới). Nếu chỉ nhìn lợi suất bình quân để chọn cổ phiếu 'tốt nhất', nhà đầu tư sẽ bỏ lỡ điều gì?",
      en: "A tutorial uses an example where investor Mr. X compares three stocks by coefficient of variation (table below). If he judged the 'best' stock only by average return, what would he be missing?",
    },
    facts: [
      {
        label: { vi: 'Cổ phiếu α', en: 'Stock α' },
        value: {
          vi: 'Lợi suất 18%, độ lệch chuẩn 12%, CV 66,67%',
          en: 'Return 18%, SD 12%, CV 66.67%',
        },
      },
      {
        label: { vi: 'Cổ phiếu β', en: 'Stock β' },
        value: { vi: 'Lợi suất 25%, độ lệch chuẩn 20%, CV 80%', en: 'Return 25%, SD 20%, CV 80%' },
      },
      {
        label: { vi: 'Cổ phiếu λ', en: 'Stock λ' },
        value: { vi: 'Lợi suất 8%, độ lệch chuẩn 3%, CV 37,5%', en: 'Return 8%, SD 3%, CV 37.5%' },
      },
    ],
    choices: {
      a: {
        vi: 'β có lợi suất cao nhất nên chắc chắn là lựa chọn tốt nhất',
        en: 'β has the highest return, so it must be the best choice',
      },
      b: {
        vi: 'λ có lợi suất bình quân thấp nhất trong ba mã, nhưng lại là cổ phiếu tốt nhất vì CV thấp nhất',
        en: 'λ has the lowest average return of the three, yet it is the best stock because its CV is the lowest',
      },
      c: {
        vi: 'Cả ba cổ phiếu tốt như nhau, vì CV chỉ là con số phụ không ảnh hưởng tới lựa chọn',
        en: "All three stocks are equally good, since CV is just a secondary number that doesn't affect the choice",
      },
      d: {
        vi: 'α luôn tốt hơn λ, vì lợi suất bình quân của α cao hơn',
        en: "α is always better than λ, because α's average return is higher",
      },
    },
    answer: 'b',
    explain: {
      vi: '“the stock λ is the best-performing stock instead of the fact that it has the lowest return out of all. Same way, β having the highest return of all, is the least performing among the three” — λ có CV thấp nhất (37,5%) nên là cổ phiếu tốt nhất theo rủi ro trên mỗi đơn vị lợi suất, dù lợi suất bình quân 8% là thấp nhất trong ba mã; ngược lại β lợi suất cao nhất (25%) nhưng CV cũng cao nhất (80%) nên lại là cổ phiếu kém nhất.',
      en: '“the stock λ is the best-performing stock instead of the fact that it has the lowest return out of all. Same way, β having the highest return of all, is the least performing among the three.” λ has the lowest CV (37.5%), making it the best stock on a risk-per-return basis even though its 8% average return is the lowest of the three; conversely, β has the highest return (25%) but also the highest CV (80%), making it the worst performer.',
    },
    source: {
      url: 'https://efinancemanagement.com/investment-decisions/coefficient-of-variation',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q263',
    formulaId: 'he-so-bien-thien',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Miller & Karson (1977) đưa ra một phép kiểm định thống kê để xem chênh lệch CV giữa hai chứng khoán có ý nghĩa hay không. Một bài phân tích học thuật (Michigan State University) điểm lại phép kiểm định này. Những phát biểu nào dưới đây ĐÚNG?',
      en: 'Miller & Karson (1977) proposed a statistical test to check whether the difference in CV between two securities is significant. An academic paper (Michigan State University) reviews this test. Which statements below are TRUE?',
    },
    choices: {
      a: {
        vi: 'Phép kiểm định này khá phức tạp, không phải nhà đầu tư cá nhân nào cũng tự tính hay hiểu được',
        en: 'The test is fairly complex — not every individual investor can compute or understand it',
      },
      b: {
        vi: 'Điều kiện để phép kiểm định đáng tin (đủ số chứng khoán so sánh, CV đủ nhỏ) hiếm khi đạt được trên thực tế thị trường cổ phiếu',
        en: 'The condition for the test to be reliable (enough securities to compare, small enough CV) is rarely met in real stock markets',
      },
      c: {
        vi: 'Vì đơn giản và trực quan nên hầu hết công ty chứng khoán đều tích hợp sẵn phép kiểm định này vào phần mềm giao dịch',
        en: 'Because it is simple and intuitive, most brokerages build this test directly into their trading software',
      },
      d: {
        vi: 'Phép kiểm định chỉ cần biết giá đóng cửa cuối năm của từng cổ phiếu, không cần dữ liệu nào khác',
        en: "The test only needs each stock's year-end closing price and nothing else",
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: '“The test statistic is complex which may not be accessible by many ordinary investors” — nên (a) đúng. Bài viết cũng nói thẳng điều kiện để phép kiểm định đáng tin (đủ số chứng khoán so sánh, CV đủ nhỏ) “is rarely achieved in securities, especially in stock market”, nên (b) cũng đúng. Không có căn cứ nào cho (c) — phần mềm giao dịch tích hợp sẵn phép kiểm định này — hay cho (d) — chỉ cần giá đóng cửa cuối năm.',
      en: '“The test statistic is complex which may not be accessible by many ordinary investors,” so (a) is true. The paper also states outright that the condition for the test to be reliable (enough securities, small enough CV) “is rarely achieved in securities, especially in stock market,” so (b) is true too. Nothing in the source supports (c) — brokerages building this test into trading software — or (d) — needing only year-end closing prices.',
    },
    source: {
      url: 'https://arxiv.org/pdf/2109.03977',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q264',
    formulaId: 'he-so-bien-thien',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một bài viết cảnh báo hạn chế của hệ số biến thiên nêu tình huống: một khoản đầu tư từng biến động mạnh trong quá khứ nên độ lệch chuẩn tính ra vẫn cao, dù tình hình hiện tại đã cải thiện nhiều. Nếu nhà đầu tư chỉ dựa vào CV để quyết định, điều gì có thể xảy ra?',
      en: 'An article warning about the limitations of the coefficient of variation describes this case: an investment that was highly volatile in the past still shows a high standard deviation, even though the current situation has improved a lot. If an investor relies only on CV to decide, what could happen?',
    },
    choices: {
      a: {
        vi: 'CV luôn tự động cập nhật theo triển vọng hiện tại nên không có rủi ro đánh giá sai',
        en: 'CV automatically updates to reflect the current outlook, so there is no risk of misjudging it',
      },
      b: {
        vi: 'Nhà đầu tư có thể bỏ lỡ một cơ hội sinh lời tốt, vì CV vẫn cao do kế thừa độ lệch chuẩn của giai đoạn biến động cũ',
        en: 'The investor may miss a good return opportunity, because CV stays high, carrying over the standard deviation from the old volatile period',
      },
      c: {
        vi: 'Công thức sẽ báo lỗi và từ chối tính toán trong trường hợp này',
        en: 'The formula will throw an error and refuse to compute in this case',
      },
      d: {
        vi: 'CV chắc chắn tính ra thấp hơn thực tế, khiến nhà đầu tư mua nhiều hơn mức cần thiết',
        en: 'CV will definitely come out lower than reality, causing the investor to buy more than needed',
      },
    },
    answer: 'b',
    explain: {
      vi: '“The situation may have improved in favor of the investment option and can be an excellent return opportunity in the present times. The standard deviation will be high for the stock when calculated, and hence, the coefficient of variation will be high too. If an investor solely relies on this figure for making his investment decision, he might not go for this option. Hence, he may miss out on an opportunity to get high returns.” Độ lệch chuẩn tính từ dữ liệu lịch sử mang theo biến động của quá khứ, nên CV có thể vẫn cao dù triển vọng hiện tại đã tốt hơn — dựa hoàn toàn vào con số này khiến nhà đầu tư bỏ lỡ cơ hội, chứ không phải tránh được rủi ro.',
      en: "“The situation may have improved in favor of the investment option and can be an excellent return opportunity in the present times. The standard deviation will be high for the stock when calculated, and hence, the coefficient of variation will be high too. If an investor solely relies on this figure for making his investment decision, he might not go for this option. Hence, he may miss out on an opportunity to get high returns.” A standard deviation built from historical data carries the past's volatility forward, so CV can stay high even when the current outlook has improved — relying on it alone makes an investor miss an opportunity rather than avoid a risk.",
    },
    source: {
      url: 'https://efinancemanagement.com/investment-decisions/coefficient-of-variation',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q094',
    formulaId: 'bien-do-dao-dong-lon-nhat',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: { vi: 'Biên độ dao động giá một phiên trên HOSE, HNX và UPCoM lần lượt là bao nhiêu?' },
    choices: {
      a: { vi: '±7%, ±10%, ±15%' },
      b: { vi: '±5%, ±7%, ±10%' },
      c: { vi: '±10%, ±15%, ±20%' },
      d: { vi: 'Giống nhau cả ba sàn' },
    },
    answer: 'a',
    explain: {
      vi: 'Biên độ bị chặn theo SÀN chứ không theo cổ phiếu: HOSE ±7%, HNX ±10%, UPCoM ±15%; phiên chào sàn lần lượt ±20%, ±30%, ±40%. Vì vậy so biên độ một mã HOSE với một mã UPCoM là so hai trần khác nhau, không phải so mức biến động tự nhiên.',
    },
    source: {
      url: 'https://www.dnse.com.vn/hoc/bien-do-dao-dong-gia-co-phieu',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q265',
    formulaId: 'bien-do-dao-dong-lon-nhat',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Cổ phiếu XYZ có 12 phiên gần nhất với giá ĐÓNG CỬA cao nhất là 24.500 ₫ và giá đóng cửa thấp nhất là 21.800 ₫. Riêng một phiên trong số đó, giá từng chạm 25.200 ₫ trong lúc khớp lệnh nhưng cuối phiên lùi về đóng cửa ở 23.900 ₫. Biên độ dao động lớn nhất trong kỳ A chỉ tính theo giá ĐÓNG CỬA, như các chỉ số kiểu "52 tuần cao/thấp". Điền đúng hai mức giá ấy vào các ô trống — chú ý giá thấp nhất xuất hiện hai lần.',
      en: 'Stock XYZ\'s most recent 12 sessions have a highest CLOSING price of 24,500 VND and a lowest closing price of 21,800 VND. In one of those sessions the price touched 25,200 VND intraday but closed back down at 23,900 VND. The peak-to-trough price range A counts CLOSING prices only, as "52-week high/low" indicators do. Put the right two prices into the slots — note the lowest price appears twice.',
    },
    facts: [
      {
        label: {
          vi: 'Giá đóng cửa cao nhất trong 12 phiên (P_max)',
          en: 'Highest closing price over the 12 sessions (P_max)',
        },
        value: { vi: '24.500 ₫', en: '24,500 VND' },
      },
      {
        label: {
          vi: 'Giá đóng cửa thấp nhất trong 12 phiên (P_min)',
          en: 'Lowest closing price over the 12 sessions (P_min)',
        },
        value: { vi: '21.800 ₫', en: '21,800 VND' },
      },
      {
        label: {
          vi: 'Giá cao nhất TRONG PHIÊN (không phải giá đóng cửa) của phiên đột biến',
          en: 'Intraday high (not the closing price) of the spike session',
        },
        value: { vi: '25.200 ₫', en: '25,200 VND' },
      },
      {
        label: {
          vi: 'Giá đóng cửa của chính phiên đột biến đó',
          en: 'Closing price of that same spike session',
        },
        value: { vi: '23.900 ₫', en: '23,900 VND' },
      },
    ],
    expected: 12.39,
    tolerance: { kind: 'tuyet-doi', value: 0.1 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Biên độ = ([24.500] − [21.800]) ÷ [21.800] × 100',
      en: 'Range = ([24500] − [21800]) ÷ [21800] × 100',
    },
    explain: {
      vi: 'A = (P_max − P_min) ÷ P_min × 100 = (24.500 − 21.800) ÷ 21.800 × 100 ≈ 12,39%, tính hoàn toàn bằng giá ĐÓNG CỬA — đúng như spec formula định nghĩa P_max/P_min là "giá đóng cửa cao nhất/thấp nhất". Mức 25.200 ₫ chỉ là giá chạm trong phiên rồi tụt về 23.900 ₫ lúc đóng cửa nên KHÔNG được tính vào P_max; lấy nhầm 25.200 ₫ sẽ ra 15,60% — sai. Nguồn nói về cùng quy ước này ở chỉ số mức cao/thấp 52 tuần: “Mức giá 52 tuần Cao/Thấp được tính dựa trên giá đóng cửa hàng ngày của chứng khoán. Thông thường, một cổ phiếu thực sự có thể vượt mức giá cao trong 52 tuần, nhưng cuối cùng lại đóng cửa dưới mức cao trước đó, cho nên giá sẽ không được công nhận.”',
      en: 'A = (P_max − P_min) ÷ P_min × 100 = (24,500 − 21,800) ÷ 21,800 × 100 ≈ 12.39%, using CLOSING prices only — matching how the formula\'s own spec defines P_max/P_min as "the highest/lowest closing price". The 25,200 VND print was only touched intraday and the session closed back down at 23,900 VND, so it does NOT count as P_max; using 25,200 VND by mistake would give 15.60%, which is wrong. The source states the same convention for the 52-week high/low: “Mức giá 52 tuần Cao/Thấp được tính dựa trên giá đóng cửa hàng ngày của chứng khoán. Thông thường, một cổ phiếu thực sự có thể vượt mức giá cao trong 52 tuần, nhưng cuối cùng lại đóng cửa dưới mức cao trước đó, cho nên giá sẽ không được công nhận.”',
    },
    source: {
      url: 'https://masterskills.org/blog/muc-gia-52-tuan-cao-thap-52-week-high-low-la-gi-hieu-ve-muc-gia-52-tuan-cao-thap.html',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q095',
    formulaId: 'co-lenh-rui-ro',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Quy tắc 2% trong quản trị vốn nghĩa là gì?' },
    choices: {
      a: { vi: 'Mua cổ phiếu bằng 2% tài khoản' },
      b: {
        vi: 'Phần vốn chịu rủi ro tối đa 2% — tính bằng khoảng cách tới điểm dừng lỗ nhân khối lượng',
      },
      c: { vi: 'Lãi mục tiêu 2% mỗi lệnh' },
      d: { vi: 'Giữ 2% tiền mặt' },
    },
    answer: 'b',
    explain: {
      vi: 'Nghĩa là mỗi lệnh chỉ được phép mất tối đa 2% vốn tài khoản nếu chạm dừng lỗ, và cỡ lệnh được SUY NGƯỢC từ khoảng cách dừng lỗ chứ không đặt trước rồi mới tìm chỗ dừng. CME Group: “you never put more than 2% of your account equity at risk”, với ví dụ “the 2% Rule tells you that you could risk no more than 20 ticks on the trade (5 contracts x $10/tick x 20 ticks = $1,000)”.',
      en: 'It means a single trade may lose at most 2% of account equity if the stop is hit, and position size is DERIVED from the stop distance rather than chosen first and given a stop afterwards. CME Group: “you never put more than 2% of your account equity at risk”, with the worked example “the 2% Rule tells you that you could risk no more than 20 ticks on the trade (5 contracts x $10/tick x 20 ticks = $1,000)”.',
    },
    source: {
      url: 'https://www.cmegroup.com/education/courses/trade-and-risk-management/the-2-percent-rule',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q096',
    formulaId: 'co-lenh-rui-ro',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Nhà sáng lập FinPeace kể lại việc “all in full margin” để bắt đáy. Kết cục?' },
    choices: {
      a: { vi: 'Lãi lớn khi thị trường hồi' },
      b: { vi: 'Cháy tài khoản, mất khoảng 1 triệu USD' },
      c: { vi: 'Hoà vốn sau 2 năm' },
      d: { vi: 'Chỉ lỗ 30%' },
    },
    answer: 'b',
    explain: {
      vi: 'Ông Nguyễn Tuấn Anh: “tôi quyết định tất tay - all in full margin vào cổ phiếu chứng khoán này”; “Ông bị cháy tài khoản và mất toàn bộ tài sản khi đó có được, khoảng 1 triệu USD”. Kết luận của ông: kiểu chơi này “về dài hạn gần như chắc chắn sẽ thua, bất kể trước đó họ đã thắng được bao nhiêu tiền”.',
    },
    source: {
      url: 'https://cafebiz.vn/tung-chay-tai-khoan-mat-1-trieu-usd-vi-all-in-full-margin-nha-sang-lap-finpeace-chia-se-bi-kip-giup-nha-dau-tu-ne-nhung-cu-sap-tren-thi-truong-176221117102257897.chn',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q241',
    formulaId: 'co-lenh-rui-ro',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Đặt cắt lỗ rất sát giá vào lệnh khiến công thức cỡ lệnh theo % rủi ro cho ra khối lượng rất lớn. Vì sao nhà đầu tư vẫn có thể KHÔNG đặt được lệnh này?',
      en: 'A stop-loss placed very close to the entry price makes the risk-based position-size formula output a very large quantity. Why might the investor still be unable to place this order?',
    },
    choices: {
      a: {
        vi: 'Không sao cả, vì rủi ro thực tế vẫn đúng bằng % đã đặt trước',
        en: 'Nothing is wrong; the actual risk still equals the % set in advance',
      },
      b: {
        vi: 'Giá trị lệnh (khối lượng × giá vào) có thể vượt quá toàn bộ sức mua của tài khoản',
        en: "The order's value (shares × entry price) can exceed the account's entire buying power",
      },
      c: {
        vi: 'Công thức sẽ tự động hạ khối lượng xuống cho vừa vốn',
        en: 'The formula automatically lowers the quantity to fit the capital',
      },
      d: {
        vi: 'Mức rủi ro % sẽ tự động giảm để bù lại',
        en: 'The risk % automatically decreases to compensate',
      },
    },
    answer: 'b',
    explain: {
      vi: "Cỡ lệnh theo % rủi ro chỉ đảm bảo đúng MỨC LỖ nếu chạm cắt lỗ, không đảm bảo bạn đủ tiền mua được số cổ phiếu đó. Nguồn minh hoạ bằng AAPL giá 150 USD, cắt lỗ 145 USD, rủi ro 100 USD: khối lượng tính ra là 20 cổ phiếu (100 ÷ 5), nhưng nguồn cảnh báo “If you don't have $3,000 buying power (20 × $150), you can't execute it. Some setups become unavailable on small accounts.” — 20 cổ phiếu × 150 USD = 3.000 USD giá trị lệnh có thể vượt hẳn số tiền đang có, dù rủi ro tính ra vẫn đúng 100 USD. Cắt lỗ càng sát giá vào thì khối lượng càng lớn và càng dễ rơi vào tình huống này.",
      en: "Risk-based position sizing only guarantees the LOSS if the stop is hit, not that you have enough money to buy that many shares. The source illustrates this with AAPL at $150, a stop at $145, and $100 of risk: the formula gives 20 shares (100 ÷ 5), but it warns “If you don't have $3,000 buying power (20 × $150), you can't execute it. Some setups become unavailable on small accounts.” That is, 20 shares × $150 = $3,000 of order value can exceed what you actually hold, even though the calculated risk is still exactly $100. The tighter the stop sits to the entry, the larger the quantity, and the more likely this is to happen.",
    },
    source: {
      url: 'https://www.tradingsim.com/blog/position-sizing-guide',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q097',
    formulaId: 'do-lech-chuan-loi-suat-phien',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Danh mục gồm 15 mã thuộc nhiều ngành khác nhau. Rủi ro đã được giảm đáng kể chưa?',
    },
    choices: {
      a: { vi: 'Rồi, đó là đa dạng hoá chuẩn' },
      b: {
        vi: 'Chưa — danh mục vẫn nằm trong một loại tài sản, cùng chịu tác động khi thị trường chung giảm',
      },
      c: { vi: 'Rồi nếu có trên 10 mã' },
      d: { vi: 'Chỉ cần thêm cổ phiếu ngân hàng' },
    },
    answer: 'b',
    explain: {
      vi: 'Ông Nguyễn Khoa (FinSuccess): “nhiều nhà đầu tư đang đa dạng hóa theo tên gọi tài sản thay vì bản chất rủi ro”. Bài chỉ ra khi thị trường suy giảm, sở hữu 10–20 mã vẫn không giúp giảm rủi ro đáng kể.',
    },
    source: {
      url: 'https://tuoitre.vn/vi-sao-danh-muc-co-co-phieu-nhieu-nganh-nhung-van-rui-ro-100260810133658464.htm',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q252',
    formulaId: 'do-lech-chuan-loi-suat-phien',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: "Độ lệch chuẩn lợi suất coi một phiên TĂNG mạnh và một phiên GIẢM mạnh là 'rủi ro' như nhau. Đây chính là điều giới chuyên môn phản đối khi dùng nó (hay tỷ số Sharpe dựa trên nó) để đánh giá một danh mục vừa có lợi nhuận tăng đột biến — phản đối đó là gì?",
      en: "Return standard deviation treats a big UP session and a big DOWN session as equally 'risky'. This is exactly what finance professionals object to when using it (or the Sharpe ratio built on it) to judge a portfolio with a sudden profit spike — what is the objection?",
    },
    choices: {
      a: {
        vi: 'Vì công thức tính sai về mặt toán học',
        en: 'Because the formula is mathematically incorrect',
      },
      b: {
        vi: 'Vì độ lệch chuẩn/tỷ số Sharpe không phân biệt được biến động có lợi (tăng giá) và biến động bất lợi (giảm giá), nên phạt luôn cả những phiên lãi lớn',
        en: 'Because standard deviation / the Sharpe ratio cannot distinguish favorable volatility (price rises) from unfavorable volatility (price drops), so it penalizes big winning sessions just as much',
      },
      c: {
        vi: 'Vì độ lệch chuẩn chỉ tính được cho trái phiếu, không tính được cho cổ phiếu',
        en: 'Because standard deviation can only be calculated for bonds, not stocks',
      },
      d: {
        vi: 'Vì độ lệch chuẩn luôn cho kết quả âm khi lợi nhuận dương',
        en: 'Because standard deviation always comes out negative when returns are positive',
      },
    },
    answer: 'b',
    explain: {
      vi: 'The Hedge Fund Journal, khi giới thiệu tỷ số Sortino thay cho Sharpe, viết: “The most common objection to use of the Sharpe ratio is that it fails to distinguish between downside volatility (generally considered undesirable) and upside volatility (which seldom draws complaints from investors).” Vì mẫu số của Sharpe chính là độ lệch chuẩn lợi suất phiên, hạn chế này áp dụng trực tiếp: một phiên tăng vọt cộng vào độ lệch chuẩn y như một phiên giảm sâu.',
      en: "The Hedge Fund Journal, introducing the Sortino ratio as an alternative to Sharpe, writes: “The most common objection to use of the Sharpe ratio is that it fails to distinguish between downside volatility (generally considered undesirable) and upside volatility (which seldom draws complaints from investors).” Since the Sharpe ratio's denominator is exactly the return standard deviation, this limitation applies directly: one spectacular up session adds to it exactly like one deep down session.",
    },
    source: {
      url: 'https://thehedgefundjournal.com/the-limits-of-low-volatility-and-the-deviancy-of-standard-deviation/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q253',
    formulaId: 'do-lech-chuan-loi-suat-phien',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một chuỗi gồm 5 lợi suất phiên liên tiếp của một cổ phiếu cho ở bảng dưới, lợi suất bình quân bằng 0%. Công thức ĐỘ LỆCH CHUẨN MẪU đã dựng sẵn — chia cho (n − 1) theo hiệu chỉnh Bessel, đúng như mẫu số trong công thức trên trang này. Điền năm lợi suất vào đúng thứ tự các ô trống.',
      en: "A stock's 5 consecutive session returns are in the table below; their average is 0%. The SAMPLE standard deviation formula is laid out — dividing by (n − 1) per Bessel's correction, the same denominator this page's formula uses. Put the five returns into the slots in the right order.",
    },
    facts: [
      {
        label: { vi: 'Lợi suất phiên 1', en: 'Session 1 return' },
        value: { vi: '+2,0%', en: '+2.0%' },
      },
      {
        label: { vi: 'Lợi suất phiên 2', en: 'Session 2 return' },
        value: { vi: '−1,0%', en: '−1.0%' },
      },
      {
        label: { vi: 'Lợi suất phiên 3', en: 'Session 3 return' },
        value: { vi: '+1,0%', en: '+1.0%' },
      },
      {
        label: { vi: 'Lợi suất phiên 4', en: 'Session 4 return' },
        value: { vi: '−2,0%', en: '−2.0%' },
      },
      {
        label: { vi: 'Lợi suất phiên 5', en: 'Session 5 return' },
        value: { vi: '0,0%', en: '0.0%' },
      },
      {
        label: { vi: 'Lợi suất bình quân 5 phiên', en: 'Average of the 5 sessions' },
        value: { vi: '0,0%', en: '0.0%' },
      },
      {
        label: { vi: 'Số lợi suất trong mẫu (n)', en: 'Number of returns in the sample (n)' },
        value: { vi: '5', en: '5' },
      },
    ],
    expected: 1.58,
    tolerance: { kind: 'tuyet-doi', value: 0.02 },
    unit: { vi: '%/phiên', en: '%/session' },
    worked: {
      vi: 's = √((([2] − 0)^2 + ([−1] − 0)^2 + ([1] − 0)^2 + ([−2] − 0)^2 + ([0] − 0)^2) ÷ (5 − 1))',
      en: 's = √((([2] − 0)^2 + ([−1] − 0)^2 + ([1] − 0)^2 + ([−2] − 0)^2 + ([0] − 0)^2) ÷ (5 − 1))',
    },
    explain: {
      vi: "Vì trung bình bằng 0%, độ lệch từng phiên so với trung bình chính là giá trị lợi suất: bình phương lần lượt là 4, 1, 1, 4, 0 (%²), tổng bằng 10. Vì đây là độ lệch chuẩn MẪU nên chia cho (n − 1) = 4, không chia cho n = 5: phương sai = 10/4 = 2,5(%²) → độ lệch chuẩn = √2,5 ≈ 1,58%/phiên. Nếu lỡ chia cho n sẽ ra 1,41%/phiên — sai quy ước. Nguồn xác nhận quy ước n − 1 (hiệu chỉnh Bessel) dùng cho mẫu: “The key difference is the denominator: N for population (divide by total count) vs n−1 for samples (Bessel's correction to reduce bias).”",
      en: "Since the mean is 0%, each session's deviation equals its own return: the squares are 4, 1, 1, 4, 0 (%²), summing to 10. Because this is the SAMPLE standard deviation, divide by (n − 1) = 4, not by n = 5: variance = 10/4 = 2.5 (%²) → standard deviation = √2.5 ≈ 1.58%/session. Dividing by n instead would wrongly give 1.41%/session. The source confirms the n − 1 (Bessel's correction) convention for samples: “The key difference is the denominator: N for population (divide by total count) vs n−1 for samples (Bessel's correction to reduce bias).”",
    },
    source: {
      url: 'https://www.calcplanet.com/formulas/standard-deviation-formula/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q254',
    formulaId: 'do-lech-chuan-loi-suat-phien',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'ChartSchool (StockCharts) chỉ ra điều gì khi so sánh độ lệch chuẩn tính trên biến động GIÁ TUYỆT ĐỐI (₫, USD) giữa hai cổ phiếu có mức giá khác nhau, ví dụ Google (khoảng 550 USD) và Intel (khoảng 22 USD)?',
      en: "What does StockCharts' ChartSchool point out when comparing standard deviation computed on ABSOLUTE PRICE moves (in currency units) between two differently priced stocks, e.g. Google (about $550) and Intel (about $22)?",
    },
    choices: {
      a: {
        vi: 'Cổ phiếu giá cao (Google) sẽ luôn có độ lệch chuẩn cao hơn cổ phiếu giá thấp (Intel), nhưng đó là do MỨC GIÁ chứ không phải do biến động thực sự lớn hơn',
        en: 'The higher-priced stock (Google) will always show a higher standard deviation than the lower-priced one (Intel), but that reflects the PRICE LEVEL, not genuinely larger swings',
      },
      b: {
        vi: 'Cổ phiếu giá cao luôn ổn định hơn cổ phiếu giá thấp',
        en: 'A higher-priced stock is always more stable than a lower-priced one',
      },
      c: {
        vi: 'Độ lệch chuẩn tính trên giá tuyệt đối chỉ dùng được với cổ phiếu Mỹ',
        en: 'Standard deviation on absolute price only works for US stocks',
      },
      d: {
        vi: 'Không có khác biệt nào giữa việc tính trên giá tuyệt đối và tính trên lợi suất %',
        en: 'There is no difference between computing it on absolute price and on % returns',
      },
    },
    answer: 'a',
    explain: {
      vi: '“Securities with high prices, such as Google (±550), will have higher standard deviation values than securities with low prices, such as Intel (±22). These higher values are not a reflection of higher volatility, but rather a reflection of the actual price.” Đây chính là lý do công thức trên trang này tính độ lệch chuẩn trên LỢI SUẤT % so với phiên liền trước (r_t), chứ không tính trên chênh lệch giá tuyệt đối — để so sánh mức dao động giữa các cổ phiếu có thang giá khác nhau mà không bị sai lệch chỉ vì mức giá.',
      en: "“Securities with high prices, such as Google (±550), will have higher standard deviation values than securities with low prices, such as Intel (±22). These higher values are not a reflection of higher volatility, but rather a reflection of the actual price.” This is exactly why this page's formula computes standard deviation on the % return versus the previous session's close (r_t), not on the raw price difference — so stocks trading at very different price levels can be compared fairly.",
    },
    source: {
      url: 'https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/standard-deviation-volatility',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
];
