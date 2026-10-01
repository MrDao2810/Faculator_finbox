/**
 * Câu hỏi kiểm tra hiểu bài — nhóm Chỉ số doanh nghiệp.
 *
 * Mỗi câu gắn một nguồn thật; xem bất biến ở `../types.ts`. Không thêm câu nào vào đây mà
 * không có `source.url` trỏ tới chỗ đọc được điều câu hỏi đang kiểm tra.
 */

import type { QuizItem } from '../types';

export const CHI_SO_DN: ReadonlyArray<QuizItem> = [
  {
    id: 'Q047',
    formulaId: 'eps-co-ban',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Sau đợt chia cổ tức bằng cổ phiếu, tài khoản bạn từ 1.000 lên 1.200 cổ phiếu. Tài sản thay đổi ra sao?',
      en: 'After a stock dividend, your account goes from 1,000 to 1,200 shares. What happens to your wealth?',
    },
    choices: {
      a: { vi: 'Tăng 20%', en: 'It increases by 20%' },
      b: {
        vi: 'Không đổi — giá điều chỉnh từ 40.000 xuống khoảng 33.333 đồng',
        en: 'Unchanged — the price adjusts from VND 40,000 down to about VND 33,333',
      },
      c: { vi: 'Giảm vì bị pha loãng', en: 'It decreases due to dilution' },
      d: {
        vi: 'Tăng nhưng phải chờ ngày về',
        en: 'It increases, but you have to wait for the shares to be delivered',
      },
    },
    answer: 'b',
    explain: {
      vi: 'DNSE nêu đúng ngộ nhận: “Số lượng cổ phiếu trong tài khoản tăng lên khiến nhiều người nghĩ rằng mình đang được thêm tiền mà không phải bỏ ra đồng nào”, trong khi “Không có giá trị mới được tạo ra” — 1.200 cổ phiếu × 33.333 đồng vẫn là 40 triệu.',
      en: 'DNSE names the misconception exactly: “Số lượng cổ phiếu trong tài khoản tăng lên khiến nhiều người nghĩ rằng mình đang được thêm tiền mà không phải bỏ ra đồng nào” (seeing more shares in the account makes many people think they are getting free money for nothing), while “Không có giá trị mới được tạo ra” (no new value is created) — 1,200 shares × VND 33,333 is still VND 40 million.',
    },
    source: {
      url: 'https://www.dnse.com.vn/senses/tin-tuc/hieu-dung-ve-pha-loang-co-phieu-khi-doanh-nghiep-chia-co-tuc-35163328',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q048',
    formulaId: 'eps-co-ban',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'EPS kỳ này thấp hơn kỳ trước trong khi doanh nghiệp vừa chia cổ phiếu thưởng. Nguyên nhân khả dĩ nhất?',
      en: "This period's EPS is lower than last period's, right after the company issued bonus shares. What is the most likely cause?",
    },
    choices: {
      a: {
        vi: 'Mẫu số tăng do pha loãng, lợi nhuận có thể không đổi',
        en: 'The denominator rose due to dilution; profit may be unchanged',
      },
      b: { vi: 'Lợi nhuận suy giảm', en: 'Profit has declined' },
      c: { vi: 'Sai sót kế toán', en: 'An accounting error' },
      d: { vi: 'Doanh nghiệp giấu lãi', en: 'The company is hiding profit' },
    },
    answer: 'a',
    explain: {
      vi: 'DNSE: “Khi số cổ phiếu tăng nhưng lợi nhuận không đổi, EPS giảm xuống, khiến cổ phiếu trở nên kém hấp dẫn hơn về mặt định giá” — và chia liên tục mà không tăng trưởng tương ứng sẽ đẩy P/E lên.',
      en: 'DNSE: “Khi số cổ phiếu tăng nhưng lợi nhuận không đổi, EPS giảm xuống, khiến cổ phiếu trở nên kém hấp dẫn hơn về mặt định giá” (when the share count rises but profit is unchanged, EPS falls, making the stock look less attractive on valuation) — and repeated share splits with no matching growth push the P/E up.',
    },
    source: {
      url: 'https://www.dnse.com.vn/senses/tin-tuc/hieu-dung-ve-pha-loang-co-phieu-khi-doanh-nghiep-chia-co-tuc-35163328',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q049',
    formulaId: 'eps-co-ban',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'EPS quý tăng vọt. Điều cần kiểm tra đầu tiên là gì?',
      en: 'Quarterly EPS has jumped sharply. What is the first thing to check?',
    },
    choices: {
      a: { vi: 'Giá cổ phiếu đã tăng chưa', en: 'Whether the share price has already risen' },
      b: { vi: 'Khối lượng giao dịch', en: 'Trading volume' },
      c: {
        vi: 'Lợi nhuận đến từ đâu — có khoản một lần như bán tài sản, thoái vốn, hoàn nhập dự phòng không',
        en: 'Where the profit came from — whether it includes one-off items such as an asset sale, a divestment, or a provision reversal',
      },
      d: { vi: 'Ý kiến của môi giới', en: "A broker's opinion" },
    },
    answer: 'c',
    explain: {
      vi: 'CafeF: “Lợi nhuận tăng mạnh đôi khi đến từ các khoản một lần – như bán tài sản, thoái vốn, hoặc hoàn nhập dự phòng”. Trường hợp KBC: mua 9,6 triệu cổ phần giá 96 tỷ rồi xác định lại giá trị 2.493 tỷ, ghi nhận lợi nhuận 2.397 tỷ.',
      en: 'CafeF: “Lợi nhuận tăng mạnh đôi khi đến từ các khoản một lần – như bán tài sản, thoái vốn, hoặc hoàn nhập dự phòng” (a sharp jump in profit sometimes comes from one-off items — an asset sale, a divestment, or a provision reversal). Case in point, KBC: it bought 9.6 million shares for VND 96 billion, then revalued them at VND 2,493 billion, booking a VND 2,397 billion gain.',
    },
    source: {
      url: 'https://cafef.vn/doc-vi-bao-cao-tai-chinh-3-chi-bao-boc-tran-doanh-nghiep-lai-ao-188251022221734407.chn',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q050',
    formulaId: 'eps-co-ban',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Bạn định giá theo EPS trên BCTC tự lập doanh nghiệp vừa công bố. Rủi ro là gì?',
      en: 'You are valuing a company using the EPS on the self-prepared financial statements it just released. What is the risk?',
    },
    choices: {
      a: { vi: 'Không có rủi ro, số liệu là số liệu', en: 'No risk — a number is a number' },
      b: { vi: 'Chỉ lệch vài phần trăm', en: 'It is off by only a few percent, at most' },
      c: { vi: 'Chỉ ảnh hưởng doanh nghiệp nhỏ', en: 'It only affects small companies' },
      d: {
        vi: 'Con số có thể đảo chiều sau kiểm toán — đã có trường hợp từ lãi 39 tỷ thành lỗ 86,5 tỷ',
        en: 'The number can flip after the audit — there have been real cases going from a VND 39 billion profit to a VND 86.5 billion loss',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Trường hợp thật: Chứng khoán Sài Gòn – Hà Nội “giảm hơn 100 tỷ đồng lợi nhuận, từ LÃI 39 tỷ đồng xuống mức LỖ 86,5 tỷ đồng” sau kiểm toán. Kỷ lục thuộc về KBC với chênh lệch 2.256 tỷ, bốc hơi 92% lợi nhuận.',
      en: 'A real case: Saigon-Hanoi Securities (SHS) “giảm hơn 100 tỷ đồng lợi nhuận, từ LÃI 39 tỷ đồng xuống mức LỖ 86,5 tỷ đồng” (its profit fell by more than VND 100 billion, from a PROFIT of VND 39 billion to a LOSS of VND 86.5 billion) after the audit. The record belongs to KBC, with a VND 2,256 billion swing that wiped out 92% of its profit.',
    },
    source: {
      url: 'https://cafebiz.vn/giai-ma-su-bien-hoa-ky-la-cua-con-so-loi-nhuan-tren-bao-cao-tai-chinh-truoc-va-sau-moi-mua-kiem-toan-17622091414393773.chn',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q051',
    formulaId: 'bvps',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Doanh nghiệp chia cổ phiếu thưởng 2:1. BVPS thay đổi thế nào?',
      en: 'A company issues a 2:1 bonus share. How does BVPS change?',
    },
    choices: {
      a: {
        vi: 'Giảm tương ứng vì vốn chủ không đổi mà số cổ phiếu tăng',
        en: 'It falls proportionally, since equity is unchanged but the share count rises',
      },
      b: { vi: 'Giữ nguyên', en: 'It stays the same' },
      c: { vi: 'Tăng gấp đôi', en: 'It doubles' },
      d: { vi: 'Phụ thuộc giá thị trường', en: 'It depends on the market price' },
    },
    answer: 'a',
    explain: {
      vi: 'GoValue: “đây là nghiệp vụ chia tách cổ phiếu. Nó không hề phát sinh bất kỳ dòng tiền mới” nên “giá trị sổ sách (Vốn CSH / Số lượng cổ phiếu) giảm tương ứng”. Nguồn còn cảnh báo lãnh đạo có thể dùng cách này để che giấu thiếu hụt dòng tiền mặt.',
      en: 'GoValue: “đây là nghiệp vụ chia tách cổ phiếu. Nó không hề phát sinh bất kỳ dòng tiền mới” (this is a stock-split transaction; it generates no new cash flow at all), so “giá trị sổ sách (Vốn CSH / Số lượng cổ phiếu) giảm tương ứng” (book value — equity ÷ share count — falls proportionally). The source also warns that management can use this move to mask a cash-flow shortfall.',
    },
    source: {
      url: 'https://govalue.vn/co-phieu-thuong-la-gi/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q052',
    formulaId: 'bvps',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Với doanh nghiệp lỗ kéo dài nhiều năm, BVPS có thể rơi vào tình trạng nào?',
      en: 'For a company with losses stretching over many years, what state can BVPS end up in?',
    },
    choices: {
      a: {
        vi: 'Âm, khiến P/B âm và mất ý nghĩa',
        en: 'Negative, making P/B negative and meaningless',
      },
      b: { vi: 'Bằng 0', en: 'Zero' },
      c: { vi: 'Không đổi', en: 'Unchanged' },
      d: { vi: 'Bằng mệnh giá', en: 'Equal to par value' },
    },
    answer: 'a',
    explain: {
      vi: 'Giá trị sổ sách của vốn chủ sở hữu có thể âm khi doanh nghiệp lỗ liên tiếp nhiều kỳ, kéo BVPS âm theo và làm tỷ số P/B mất nghĩa. Damodaran: “The book value of equity can become negative if a firm has a sustained string of negative earnings reports, leading to a negative price-book value ratio”. Ông cũng lưu ý BVPS gần như vô nghĩa với doanh nghiệp dịch vụ ít tài sản cố định.',
      en: 'Book equity can turn negative after a sustained run of loss-making periods, dragging BVPS negative with it and leaving the P/B ratio meaningless. Damodaran: “The book value of equity can become negative if a firm has a sustained string of negative earnings reports, leading to a negative price-book value ratio”. He also notes BVPS says almost nothing about service firms with few fixed assets.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/lectures/pbv.html',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q053',
    formulaId: 'roe',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Doanh nghiệp A có ROE 30% và ROA 5%. Doanh nghiệp B có ROE 20% và ROA 15%. Đánh giá nào hợp lý?',
      en: 'Company A has ROE of 30% and ROA of 5%. Company B has ROE of 20% and ROA of 15%. Which assessment is reasonable?',
    },
    choices: {
      a: {
        vi: 'B đáng giá hơn — ROE của A chủ yếu đến từ đòn bẩy',
        en: "B is worth more — A's ROE mostly comes from leverage",
      },
      b: { vi: 'A tốt hơn vì ROE cao hơn', en: 'A is better, since its ROE is higher' },
      c: { vi: 'Hai bên tương đương', en: 'The two are equivalent' },
      d: { vi: 'Không so sánh được', en: 'They cannot be compared' },
    },
    answer: 'a',
    explain: {
      vi: 'Nguồn tiếng Việt nói thẳng: “Một doanh nghiệp có ROE = 30% và ROA = 5%, Ngọ không đánh giá cao bằng doanh nghiệp ROE = 20% và ROA = 15%”. CafeF bổ sung: ROE cao bất thường “có thể đến từ việc doanh nghiệp vay nợ nhiều, khiến lợi nhuận trên vốn tăng ảo”.',
      en: 'The Vietnamese source says it plainly: “Một doanh nghiệp có ROE = 30% và ROA = 5%, Ngọ không đánh giá cao bằng doanh nghiệp ROE = 20% và ROA = 15%” (a company with ROE = 30% and ROA = 5% is rated lower than one with ROE = 20% and ROA = 15%). CafeF adds that an abnormally high ROE “có thể đến từ việc doanh nghiệp vay nợ nhiều, khiến lợi nhuận trên vốn tăng ảo” (can come from heavy borrowing, which inflates the return on equity artificially).',
    },
    source: {
      url: 'https://cophieux.com/chi-so-roe/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q054',
    formulaId: 'roe',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Hành động nào của doanh nghiệp làm ROE tăng mà lợi nhuận không đổi?',
      en: 'Which corporate action raises ROE while profit stays unchanged?',
    },
    choices: {
      a: { vi: 'Tăng doanh thu', en: 'Increasing revenue' },
      b: { vi: 'Trả cổ tức tiền mặt', en: 'Paying a cash dividend' },
      c: { vi: 'Phát hành thêm cổ phiếu', en: 'Issuing more shares' },
      d: {
        vi: 'Mua lại cổ phiếu quỹ làm giảm vốn chủ sở hữu',
        en: 'Buying back treasury shares, which shrinks equity',
      },
    },
    answer: 'd',
    explain: {
      vi: "Mua lại cổ phiếu quỹ: lợi nhuận giữ nguyên nhưng vốn chủ sở hữu giảm, nên mẫu số nhỏ lại và ROE tăng dù hiệu quả kinh doanh không đổi. Nguồn tiếng Việt: “ROE hoàn toàn có thể bị bóp méo nếu như doanh nghiệp mua lại cổ phiếu quỹ để làm giảm vốn chủ sở hữu, khi đó lợi nhuận vẫn không đổi nên sẽ tăng ROE”. CFI xếp việc này cùng nhóm với ghi giảm giá trị tài sản: “asset write-downs and share repurchases to artificially boost ROE by decreasing total shareholders' equity”.",
      en: "Buying back shares: profit is unchanged but equity falls, so the denominator shrinks and ROE rises even though the business is no more efficient. The Vietnamese source: “ROE hoàn toàn có thể bị bóp méo nếu như doanh nghiệp mua lại cổ phiếu quỹ để làm giảm vốn chủ sở hữu, khi đó lợi nhuận vẫn không đổi nên sẽ tăng ROE” (ROE can be distorted when a company buys back shares to shrink equity, since profit is unchanged, ROE rises). CFI groups this with asset write-downs: “asset write-downs and share repurchases to artificially boost ROE by decreasing total shareholders' equity”.",
    },
    source: {
      url: 'https://cophieux.com/chi-so-roe/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q055',
    formulaId: 'roe',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Doanh nghiệp giữ rất nhiều tiền mặt nhưng hoạt động rất lãi. ROE sẽ thế nào?',
      en: 'A company holds a great deal of cash but operates very profitably. What happens to ROE?',
    },
    choices: {
      a: {
        vi: 'Thấp đi vì tiền mặt dư thừa nằm trong vốn chủ sở hữu',
        en: 'It falls, since the excess cash sits inside equity',
      },
      b: { vi: 'Cao hơn bình thường', en: 'It is higher than normal' },
      c: { vi: 'Không ảnh hưởng', en: 'No effect' },
      d: { vi: 'Bằng ROA', en: 'It equals ROA' },
    },
    answer: 'a',
    explain: {
      vi: 'ROE sẽ THẤP đi, dù hoạt động rất lãi: tiền mặt dư nằm trong vốn chủ sở hữu, tức mẫu số phình ra trong khi phần tiền ấy gần như không sinh lợi nhuận. Refinitiv: “A company with a great deal of excess cash will be penalized with a lower ROE, even though its operations are highly profitable”, và nói thêm rằng ROE giải thích được rất ít chênh lệch định giá: “Only 1% of the difference in valuation between S&P 500 companies can be explained through ROE”.',
      en: 'ROE goes DOWN, however profitable the operations are: the excess cash sits inside equity, so the denominator swells while that cash earns almost nothing. Refinitiv: “A company with a great deal of excess cash will be penalized with a lower ROE, even though its operations are highly profitable”, adding that ROE explains very little of the valuation gap: “Only 1% of the difference in valuation between S&P 500 companies can be explained through ROE”.',
    },
    source: {
      url: 'https://lipperalpha.refinitiv.com/2018/11/dont-get-misled-by-return-on-equity-roe',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q056',
    formulaId: 'roa',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Doanh nghiệp thép có ROA thấp hơn doanh nghiệp phần mềm. Kết luận nào đúng?',
      en: 'A steel company has a lower ROA than a software company. Which conclusion is correct?',
    },
    choices: {
      a: { vi: 'Thép làm ăn kém hơn', en: 'The steel company is performing worse' },
      b: {
        vi: 'Ngành công nghiệp nặng buộc phải có tài sản cố định lớn nên ROA thấp là đặc thù cơ cấu',
        en: 'Heavy industry requires large fixed assets, so a low ROA is a structural feature',
      },
      c: { vi: 'Số liệu thép bị sai', en: "The steel company's figures are wrong" },
      d: { vi: 'Phải so ROE thay vì ROA', en: 'ROE should be compared instead of ROA' },
    },
    answer: 'b',
    explain: {
      vi: '“Với các công ty hoạt động trong ngành công nghiệp nặng như: Thép, xi măng,… thường yêu cầu tài sản cố định rất lớn. Do đó chỉ số ROA sẽ tương đối thấp”.',
      en: '“Với các công ty hoạt động trong ngành công nghiệp nặng như: Thép, xi măng,… thường yêu cầu tài sản cố định rất lớn. Do đó chỉ số ROA sẽ tương đối thấp” (companies in heavy industries such as steel and cement typically require very large fixed assets, so their ROA tends to be relatively low).',
    },
    source: {
      url: 'https://master.masvn.com/en/kien-thuc-dau-tu-chung-khoan/chi-so-roa-roe-la-gi-va-y-nghia-trong-phan-tich-dau-tu-180',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q057',
    formulaId: 'roa',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'ROA thường được giới thiệu là thước đo thuần hiệu quả tài sản. Điểm chưa chuẩn ở đâu?',
      en: 'ROA is usually presented as a pure measure of asset efficiency. Where does that fall short?',
    },
    choices: {
      a: { vi: 'ROA không tính tài sản vô hình', en: 'ROA does not count intangible assets' },
      b: { vi: 'ROA tính theo quý', en: 'ROA is computed quarterly' },
      c: {
        vi: 'Tử số là lợi nhuận sau thuế — đã trừ lãi vay, nên vẫn dính cơ cấu vốn',
        en: 'The numerator is after-tax profit — already net of interest expense — so it still carries capital structure',
      },
      d: {
        vi: 'ROA không so sánh được trong cùng ngành',
        en: 'ROA cannot be compared within the same industry',
      },
    },
    answer: 'c',
    explain: {
      vi: "Chưa chuẩn ở tử số: lợi nhuận sau thuế đã trừ chi phí lãi vay, nên ROA tính theo cách phổ biến vẫn dính cấu trúc vốn, trong khi tài sản ở mẫu số do cả nợ lẫn vốn chủ tài trợ. “Net income is an inappropriate choice of numerator... because it includes a deduction for interest expense”, và “A proper measurement of ROA should focus exclusively on operating returns, and therefore should be independent of the firm's capital structure — which net income clearly is not”. Muốn đo thuần hiệu quả tài sản thì tử số phải là lợi nhuận hoạt động sau thuế.",
      en: "The numerator is the weak point: net income is already after interest expense, so the common form of ROA still carries capital structure, while the assets in the denominator are funded by both debt and equity. The source: “Net income is an inappropriate choice of numerator... because it includes a deduction for interest expense”, and “A proper measurement of ROA should focus exclusively on operating returns, and therefore should be independent of the firm's capital structure — which net income clearly is not”. To measure asset efficiency alone the numerator has to be after-tax operating profit.",
    },
    source: {
      url: 'https://www.abi.org/abi-journal/return-on-assets-so-usefuland-so-misused',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q058',
    formulaId: 'bien-loi-nhuan-rong',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'QCG có quý doanh thu 11,5 tỷ (giảm 91,2%) nhưng lợi nhuận sau thuế 167,1 tỷ, tăng 93,4 lần. Lợi nhuận gộp thì sao?',
      en: 'QCG reported quarterly revenue of VND 11.5 billion (down 91.2%) but after-tax profit of VND 167.1 billion, up 93.4-fold. What about gross profit?',
    },
    choices: {
      a: { vi: 'Tăng tương ứng', en: 'It rose correspondingly' },
      b: { vi: 'Bằng 0', en: 'It was zero' },
      c: {
        vi: 'Âm gần 1 tỷ — toàn bộ lãi đến từ thu nhập khác',
        en: 'It was negative by almost VND 1 billion — the entire profit came from other income',
      },
      d: { vi: 'Không công bố', en: 'It was not disclosed' },
    },
    answer: 'c',
    explain: {
      vi: '“hoạt động kinh doanh còn ghi nhận lợi nhuận gộp âm gần 1 tỷ đồng”, và kết luận “Lợi nhuận tăng mạnh không phải lúc nào cũng đi cùng sự cải thiện của hoạt động kinh doanh cốt lõi”.',
      en: '“hoạt động kinh doanh còn ghi nhận lợi nhuận gộp âm gần 1 tỷ đồng” (core operations even booked a gross loss of almost VND 1 billion), concluding that “Lợi nhuận tăng mạnh không phải lúc nào cũng đi cùng sự cải thiện của hoạt động kinh doanh cốt lõi” (a sharp jump in profit does not always come with an improvement in the core business).',
    },
    source: {
      url: 'https://www.tinnhanhchungkhoan.vn/nhieu-doanh-nghiep-niem-yet-lai-lon-nho-thu-nhap-khac-post396380.html',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q059',
    formulaId: 'bien-loi-nhuan-rong',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Vì sao biên lợi nhuận ròng — chỉ tiêu cuối cùng của báo cáo — lại kém tin cậy nhất?',
      en: 'Why is the net profit margin — the last line item of the statement — the least reliable one?',
    },
    choices: {
      a: {
        vi: 'Vì nó hứng trọn mọi tác động của nghiệp vụ kế toán, thuế và chi phí tài chính',
        en: 'Because it absorbs the full impact of accounting choices, tax, and financial expenses',
      },
      b: { vi: 'Vì nó nhỏ nhất', en: 'Because it is the smallest figure' },
      c: { vi: 'Vì nó tính theo năm', en: 'Because it is computed annually' },
      d: {
        vi: 'Vì doanh nghiệp không phải công bố',
        en: 'Because companies are not required to disclose it',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Tài liệu kế toán: “Biên lợi nhuận ròng là dễ bị tác động bởi các nghiệp vụ kế toán nhất”.',
      en: 'The accounting material: “Biên lợi nhuận ròng là dễ bị tác động bởi các nghiệp vụ kế toán nhất” (the net profit margin is the most easily affected by accounting treatments).',
    },
    source: {
      url: 'https://kketoan.duytan.edu.vn/bai-viet/bai-viet-ths-duong-thi-thanh-hien-bien-loi-nhuan-nhung-luu-y-khi-su-dung',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q060',
    formulaId: 'bien-loi-nhuan-gop',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Biên lợi nhuận gộp cao có đảm bảo doanh nghiệp lãi tốt không?',
      en: 'Does a high gross margin guarantee that a company is solidly profitable?',
    },
    choices: {
      a: { vi: 'Có', en: 'Yes' },
      b: { vi: 'Có nếu doanh thu tăng', en: 'Yes, if revenue is growing' },
      c: { vi: 'Có với doanh nghiệp sản xuất', en: 'Yes, for manufacturing companies' },
      d: {
        vi: 'Không — chi phí bán hàng và quản lý có thể ăn hết phần lãi đó',
        en: 'No — selling and administrative expenses can eat up that entire margin',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Tài liệu kế toán: biên gộp cao “chưa thể hiện được hết việc quản lý chi phí”, và “Mỗi ngành nghề kinh doanh sẽ có khoảng biên lợi nhuận khác nhau nên để tìm ra con số chung cho các ngành là không thể”.',
      en: 'The accounting material: a high gross margin “chưa thể hiện được hết việc quản lý chi phí” (does not fully reflect how well costs are managed), and “Mỗi ngành nghề kinh doanh sẽ có khoảng biên lợi nhuận khác nhau nên để tìm ra con số chung cho các ngành là không thể” (every industry has its own margin range, so finding one common benchmark across industries is impossible).',
    },
    source: {
      url: 'https://kketoan.duytan.edu.vn/bai-viet/bai-viet-ths-duong-thi-thanh-hien-bien-loi-nhuan-nhung-luu-y-khi-su-dung',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q061',
    formulaId: 'bien-loi-nhuan-gop',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Nghiên cứu học thuật ghi nhận nhà quản lý can thiệp biên gộp bằng cách nào?',
      en: 'How does academic research find that managers manipulate gross margin?',
    },
    choices: {
      a: { vi: 'Ghi nhận doanh thu sớm', en: 'By recognizing revenue early' },
      b: {
        vi: 'Chuyển chi phí từ giá vốn sang chi phí hoạt động',
        en: 'By shifting costs from cost of goods sold into operating expenses',
      },
      c: { vi: 'Hoãn khấu hao', en: 'By deferring depreciation' },
      d: { vi: 'Tăng hàng tồn kho', en: 'By inflating inventory' },
    },
    answer: 'b',
    explain: {
      vi: "Bằng cách xếp lại khoản mục chi phí: đẩy một phần giá vốn hàng bán xuống chi phí hoạt động, biên gộp đẹp lên trong khi tổng chi phí và lợi nhuận không đổi. Nghiên cứu về classification shifting ghi: “managers, on average, misclassify costs of goods sold as operating expenses”, và động cơ thường thấy là “just meet prior period's gross margin”, tức vừa đủ bằng biên gộp kỳ trước.",
      en: "By reshuffling cost lines: part of cost of goods sold is pushed down into operating expenses, so gross margin looks better while total costs and profit are unchanged. The classification-shifting research records that “managers, on average, misclassify costs of goods sold as operating expenses”, and the usual motive is to “just meet prior period's gross margin”.",
    },
    source: {
      url: 'https://www.sciencedirect.com/science/article/abs/pii/S0148296318304636',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q062',
    formulaId: 'no-tren-von-chu',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'D/E của doanh nghiệp là 1,8. Cách xử lý nào hợp lý nhất?',
      en: "A company's D/E is 1.8. Which approach is most reasonable?",
    },
    choices: {
      a: {
        vi: 'So với đặc thù ngành, và tách nợ ngắn hạn với nợ dài hạn',
        en: 'Compare it against industry norms, and separate short-term debt from long-term debt',
      },
      b: { vi: 'Loại ngay vì trên 1', en: 'Rule it out immediately, since it is above 1' },
      c: { vi: 'Chấp nhận vì nợ là đòn bẩy tốt', en: 'Accept it, since debt is good leverage' },
      d: { vi: 'Chỉ xem nếu ROE trên 20%', en: 'Only consider it if ROE is above 20%' },
    },
    answer: 'a',
    explain: {
      vi: '“không nên hoàn toàn bỏ qua các công ty có chỉ số D/E lớn hơn 1”; “Chỉ số D/E thấp không phải lúc nào cũng chỉ ra rằng công ty là tốt, đặc biệt nếu tỷ lệ này âm”; và “Nợ ngắn hạn và nợ dài hạn đều được tính vào tổng nợ... nhưng có kỳ hạn và mức độ rủi ro khác nhau”.',
      en: '“không nên hoàn toàn bỏ qua các công ty có chỉ số D/E lớn hơn 1” (companies with a D/E above 1 should not be dismissed outright); “Chỉ số D/E thấp không phải lúc nào cũng chỉ ra rằng công ty là tốt, đặc biệt nếu tỷ lệ này âm” (a low D/E does not always mean a company is sound, especially if the ratio is negative); and “Nợ ngắn hạn và nợ dài hạn đều được tính vào tổng nợ... nhưng có kỳ hạn và mức độ rủi ro khác nhau” (both short-term and long-term debt count toward total liabilities... but they differ in maturity and risk).',
    },
    source: {
      url: 'https://onehousing.vn/blog/nhung-luu-y-nha-dau-tu-can-biet-khi-su-dung-ty-le-no-tren-von-chu-so-huu-de-n17t',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q207',
    formulaId: 'no-tren-von-chu',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Báo cáo tài chính của một doanh nghiệp cho ra D/E âm, bằng −3,2 lần. Con số âm này nói lên điều gì?',
      en: "A company's financial statements produce a negative D/E of −3.2 times. What does that negative figure mean?",
    },
    choices: {
      a: {
        vi: 'Doanh nghiệp không còn nợ nữa nên hệ số quay về số âm',
        en: 'The company has no debt left, so the ratio flips negative',
      },
      b: {
        vi: 'Lỗi hiển thị, nên lấy trị tuyệt đối 3,2 lần rồi đem so sánh',
        en: 'It is a display error, so take the absolute value of 3.2 times and compare with that',
      },
      c: {
        vi: 'Doanh nghiệp đang giữ nhiều tiền mặt hơn số nợ',
        en: 'The company holds more cash than debt',
      },
      d: {
        vi: 'Vốn chủ sở hữu đã âm: nợ phải trả vượt quá tài sản, đây là cảnh báo nặng chứ không phải điểm cộng',
        en: 'Equity has gone negative: liabilities now exceed assets, which is a severe warning rather than a plus',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Tử số là tổng nợ phải trả nên không bao giờ âm, dấu âm chỉ có thể đến từ mẫu số. DNSE viết thẳng: “Đặc biệt là, tỷ lệ nợ trên vốn chủ sở hữu âm điều này có nghĩa là công ty có vốn sở hữu âm, các khoản phải trả vượt quá tài sản của công ty”. Lấy trị tuyệt đối sẽ biến một doanh nghiệp đã mất hết vốn chủ thành một doanh nghiệp trông như vay vừa phải, nên tuyệt đối không xếp con số này cạnh D/E của doanh nghiệp bình thường.',
      en: 'The numerator is total liabilities and can never be negative, so the minus sign can only come from the denominator. DNSE states it plainly: “Đặc biệt là, tỷ lệ nợ trên vốn chủ sở hữu âm điều này có nghĩa là công ty có vốn sở hữu âm, các khoản phải trả vượt quá tài sản của công ty”. Taking the absolute value would turn a company that has wiped out its equity into one that merely looks moderately geared, so never line this number up beside a normal D/E.',
    },
    source: {
      url: 'https://www.dnse.com.vn/hoc/chi-so-d-e-la-gi',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q208',
    formulaId: 'no-tren-von-chu',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Hai doanh nghiệp cùng có D/E bằng 1,5 lần, tính theo tổng nợ phải trả. Ở A gần hết là vay ngân hàng; ở B gần hết là tiền người mua trả trước và tiền còn nợ nhà cung cấp. Kết luận nào đúng?',
      en: "Two companies both show a D/E of 1.5 times, measured on total liabilities. Almost all of A's figure is bank borrowing; almost all of B's is customer prepayments and unpaid supplier invoices. Which conclusion holds?",
    },
    choices: {
      a: {
        vi: 'Rủi ro tài chính như nhau, vì con số D/E bằng nhau',
        en: 'Their financial risk is the same, since the D/E figures match',
      },
      b: {
        vi: 'B rủi ro hơn, vì đang bị đối tác chiếm dụng vốn',
        en: 'B is riskier, because its partners are tying up its capital',
      },
      c: {
        vi: 'Phải bỏ hết khoản phải trả ra khỏi tử số thì D/E mới có nghĩa',
        en: 'Payables must be stripped out of the numerator before D/E means anything',
      },
      d: {
        vi: 'B nhẹ gánh hơn, vì các khoản chiếm dụng đó không phải trả lãi, khác hẳn nợ vay',
        en: 'B carries the lighter burden, because that kind of occupied capital bears no interest, unlike borrowing',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Bài phân tích của CafeF tách rõ hai thành phần của tử số và nêu đặc điểm của phần không phải nợ vay: “Đặc thù của các khoản phải trả là không phải chịu lãi suất, có tính gối đầu và không thể thiếu trong các giao dịch kinh doanh”. Cùng một con số 1,5 lần, A phải trả lãi trên gần như toàn bộ khoản nợ còn B gần như không, nên áp lực dòng tiền khác hẳn nhau. Cách xử lý đúng là mở thuyết minh xem tử số gồm những gì, chứ không xoá khoản phải trả khỏi công thức như đáp án c, vì đó vẫn là nghĩa vụ doanh nghiệp phải thanh toán.',
      en: 'A CafeF analysis separates the two components of the numerator and describes the non-borrowing part: “Đặc thù của các khoản phải trả là không phải chịu lãi suất, có tính gối đầu và không thể thiếu trong các giao dịch kinh doanh”. At the same 1.5 times, A pays interest on nearly all of its debt while B pays almost none, so the cash-flow pressure is not comparable. The right move is to read the notes and see what the numerator contains, not to delete payables from the formula as option c suggests, since they are still obligations that must be settled.',
    },
    source: {
      url: 'https://cafef.vn/so-sanh-he-so-no-cua-cac-doanh-nghiep-bat-dong-san-20220917180113214.chn',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q209',
    formulaId: 'no-tren-von-chu',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một công ty chưa đại chúng có nợ phải trả bằng 4,7 lần vốn chủ sở hữu theo báo cáo tài chính năm liền kề đã kiểm toán. Công ty muốn chào bán riêng lẻ một lô trái phiếu trị giá 0,5 lần vốn chủ sở hữu. Theo quy định có hiệu lực từ 1/7/2025, công ty có đủ điều kiện không?',
      en: "A non-public company's total liabilities are 4.7 times its equity per its latest audited annual financial statements. It now wants to privately place a bond issue worth 0.5 times equity. Under the rule effective 1 July 2025, does it qualify?",
    },
    choices: {
      a: {
        vi: 'Đủ, vì 4,7 lần vẫn dưới trần 5 lần',
        en: 'Yes, because 4.7 times is still under the 5-times cap',
      },
      b: {
        vi: 'Đủ, vì trần 5 lần chỉ tính nợ vay ngân hàng chứ không tính toàn bộ nợ phải trả',
        en: 'Yes, because the 5-times cap counts only bank borrowings, not all liabilities',
      },
      c: {
        vi: 'Không đủ, vì phải cộng cả lô trái phiếu dự kiến phát hành vào nợ phải trả, thành 5,2 lần',
        en: 'No, because the planned bond issue must be added to total liabilities first, bringing it to 5.2 times',
      },
      d: {
        vi: 'Đủ, nếu báo cáo tài chính quý gần nhất cho thấy tỷ lệ đã lùi xuống dưới 5 lần',
        en: 'Yes, provided the most recent quarterly statements show the ratio back below 5 times',
      },
    },
    answer: 'c',
    explain: {
      vi: 'Điều kiện tại Luật sửa đổi, bổ sung một số điều của Luật Doanh nghiệp, hiệu lực từ 1/7/2025: “Có nợ phải trả (bao gồm giá trị trái phiếu dự kiến phát hành) không vượt quá 5 lần vốn chủ sở hữu của tổ chức phát hành theo báo cáo tài chính năm liền kề trước năm phát hành được kiểm toán”. Lô trái phiếu sắp phát hành được cộng vào tử số TRƯỚC khi so với trần, nên 4,7 + 0,5 = 5,2 lần là vượt. Căn cứ cũng phải là báo cáo năm đã kiểm toán chứ không phải báo cáo quý. Doanh nghiệp nhà nước, tổ chức tín dụng, doanh nghiệp bảo hiểm và doanh nghiệp phát hành trái phiếu để thực hiện dự án bất động sản nằm ngoài diện áp dụng.',
      en: "The condition in Vietnam's amended Law on Enterprises, effective 1 July 2025, reads: “Có nợ phải trả (bao gồm giá trị trái phiếu dự kiến phát hành) không vượt quá 5 lần vốn chủ sở hữu của tổ chức phát hành theo báo cáo tài chính năm liền kề trước năm phát hành được kiểm toán”. The bond about to be issued enters the numerator before the test is applied, so 4.7 + 0.5 = 5.2 times fails it. The benchmark is the audited annual statements, not a quarterly one. State-owned enterprises, credit institutions, insurers and bonds issued to fund a real-estate project fall outside the rule.",
    },
    source: {
      url: 'https://www.tinnhanhchungkhoan.vn/tu-ngay-172025-phat-hanh-trai-phieu-phai-co-no-phai-tra-khong-qua-5-lan-von-chu-so-huu-post371362.html',
      kind: 'quy-dinh',
      vietnam: true,
      effectiveFrom: '2025-07-01',
    },
  },
  {
    id: 'Q210',
    formulaId: 'no-tren-von-chu',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một công ty bất động sản chưa niêm yết phát hành trái phiếu lãi 13%/năm, nợ vay ròng gấp khoảng 9 lần vốn chủ sở hữu. Vốn chủ mỏng như vậy có ý nghĩa gì với người bỏ tiền mua trái phiếu?',
      en: 'An unlisted property developer is issuing bonds at 13% a year while its net borrowings run at about 9 times equity. What does equity that thin mean for whoever buys the bonds?',
    },
    choices: {
      a: {
        vi: 'Không ảnh hưởng, vì trái chủ được trả trước cổ đông',
        en: 'It changes nothing, since bondholders rank ahead of shareholders',
      },
      b: {
        vi: 'Là điểm tốt, vì doanh nghiệp đang tận dụng đòn bẩy để sinh lời cao hơn',
        en: 'It is a good sign, since the company is using leverage to earn a higher return',
      },
      c: {
        vi: 'Vốn chủ là lớp đệm hứng lỗ đầu tiên; đệm chỉ bằng khoảng một phần chín số nợ thì dự án lỗ nhẹ đã ăn sang tiền của trái chủ',
        en: "Equity is the first cushion to absorb losses; at roughly one-ninth of debt, even a modest project loss already reaches bondholders' money",
      },
      d: {
        vi: 'Chỉ cần lãi suất 13% đủ bù rủi ro là mua được',
        en: 'A 13% coupon is compensation enough for the risk on its own',
      },
    },
    answer: 'c',
    explain: {
      vi: 'Số liệu FiinRatings dẫn trên VnEconomy cho thấy mặt bằng đòn bẩy của nhóm chưa niêm yết: “Nợ vay ròng/vốn chủ sở hữu của các doanh nghiệp này hiện ở mức lên tới 9,7 lần trong khi các doanh nghiệp niêm yết chỉ ở mức 3,4 lần”. Vốn chủ sở hữu là phần chịu lỗ trước, nên tỷ lệ này cho biết dự án được phép lỗ bao nhiêu trước khi chủ nợ bắt đầu mất tiền. Quyền được trả trước của trái chủ ở đáp án a chỉ có giá trị khi còn tài sản để chia.',
      en: 'FiinRatings figures quoted by VnEconomy show the leverage baseline of the unlisted group: “Nợ vay ròng/vốn chủ sở hữu của các doanh nghiệp này hiện ở mức lên tới 9,7 lần trong khi các doanh nghiệp niêm yết chỉ ở mức 3,4 lần”. Equity takes the first loss, so the ratio tells you how much the project may lose before creditors start losing money. The seniority in option a is only worth something while there are assets left to distribute.',
    },
    source: {
      url: 'https://vneconomy.vn/doc-vi-dong-tien-cua-doanh-nghiep-bat-dong-san-tay-khong-bat-giac.htm',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q063',
    formulaId: 'thanh-toan-hien-hanh',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Tỷ số thanh toán hiện hành 3,2 lần, trong đó hàng tồn kho chiếm phần lớn tài sản ngắn hạn. Đánh giá?',
      en: 'The current ratio is 3.2 times, and inventory makes up most of current assets. How should this be assessed?',
    },
    choices: {
      a: { vi: 'Rất an toàn', en: 'Very safe' },
      b: { vi: 'Doanh nghiệp thiếu vốn', en: 'The company is short of capital' },
      c: {
        vi: 'Chưa chắc — tồn kho ứ đọng khó chuyển thành tiền, và vốn đang bị chôn',
        en: 'Not necessarily — stagnant inventory is hard to convert into cash, and capital is tied up',
      },
      d: { vi: 'Tỷ số này không có ý nghĩa', en: 'This ratio is meaningless' },
    },
    answer: 'c',
    explain: {
      vi: '“tỷ số này cao là do tỷ trọng của hàng tồn kho cao chưa hẳn đã là an toàn. Nếu như thị trường biến động xấu, hàng tồn kho bị ứ đọng khiến cho hàng tồn kho khó chuyển thành tiền mặt”. Giáo trình bổ sung: vốn chôn trong tài sản ngắn hạn làm giảm lợi nhuận.',
      en: '“tỷ số này cao là do tỷ trọng của hàng tồn kho cao chưa hẳn đã là an toàn. Nếu như thị trường biến động xấu, hàng tồn kho bị ứ đọng khiến cho hàng tồn kho khó chuyển thành tiền mặt” (a high ratio driven by a large inventory share is not necessarily safe — if the market turns unfavorable, stagnant inventory becomes hard to convert into cash). The textbook adds that capital tied up in current assets drags down profit.',
    },
    source: {
      url: 'https://takeprofit.vn/tin-nhanh-chung-khoan/nhom-chi-so-thanh-toan/1648352281543',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q064',
    formulaId: 'thanh-toan-nhanh',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Đã loại hàng tồn kho, vì sao tỷ số thanh toán nhanh vẫn có thể đánh lừa?',
      en: 'Inventory has already been excluded — why can the quick ratio still be misleading?',
    },
    choices: {
      a: { vi: 'Vì còn tiền mặt', en: 'Because cash is still included' },
      b: { vi: 'Vì công thức sai', en: 'Because the formula is wrong' },
      c: {
        vi: 'Vì khoản phải thu còn lại có thể kém chất lượng hoặc không đòi được',
        en: 'Because the remaining receivables can be low quality or uncollectible',
      },
      d: { vi: 'Vì chưa trừ nợ dài hạn', en: 'Because long-term debt has not been subtracted' },
    },
    answer: 'c',
    explain: {
      vi: 'Vì phần còn lại sau khi loại hàng tồn kho vẫn có thể kém chất lượng: chứng khoán ngắn hạn khó bán và khoản phải thu khó đòi vẫn được tính đủ vào tử số. Giáo trình: “An accumulation of poor-quality marketable securities or receivables, or both, could cause an acid-test ratio to appear deceptively favorable”. Bản tiếng Việt nói cùng ý: “Một khoản phải thu có thể mất nhiều thời gian để thu hồi hoặc có rủi ro không thu hồi được”.',
      en: 'Because what is left after stripping out inventory can itself be low quality: illiquid marketable securities and doubtful receivables still count in full in the numerator. The textbook: “An accumulation of poor-quality marketable securities or receivables, or both, could cause an acid-test ratio to appear deceptively favorable”. The Vietnamese text makes the same point: “Một khoản phải thu có thể mất nhiều thời gian để thu hồi hoặc có rủi ro không thu hồi được” (a receivable can take a long time to collect, or may never be collected).',
    },
    source: {
      url: 'https://taca.com.vn/ty-so-thanh-toan-nhanh/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q065',
    formulaId: 'vong-quay-tong-tai-san',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Vòng quay tổng tài sản của doanh nghiệp tăng mạnh sau khi họ bán bớt nhà máy và thuê ngoài sản xuất. Ý nghĩa?',
      en: "A company's total asset turnover jumps sharply after it sells off factories and outsources production. What does this mean?",
    },
    choices: {
      a: {
        vi: 'Vận hành hiệu quả hơn thật sự',
        en: 'The business genuinely became more efficient',
      },
      b: {
        vi: 'Tỷ lệ tăng do mẫu số giảm — có thể không lãi hơn chút nào',
        en: 'The ratio rose because the denominator shrank — profitability may not have improved at all',
      },
      c: { vi: 'Doanh thu đã tăng', en: 'Revenue has increased' },
      d: { vi: 'Biên lợi nhuận đã cải thiện', en: 'The profit margin has improved' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn tiếng Việt: bán tài sản “dẫn đến tỷ lệ lạm phát giả tạo”; “Việc thuê ngoài các cơ sở sản xuất sẽ dẫn đến tỷ lệ luân chuyển tài sản cao hơn” khiến doanh nghiệp “có vẻ hiệu quả hơn so với các đối thủ cạnh tranh ngay cả khi không có nhiều lợi nhuận hơn”.',
      en: 'The Vietnamese source: selling assets “dẫn đến tỷ lệ lạm phát giả tạo” (leads to an artificially inflated ratio); “Việc thuê ngoài các cơ sở sản xuất sẽ dẫn đến tỷ lệ luân chuyển tài sản cao hơn” (outsourcing production facilities leads to a higher asset turnover ratio), making the company “có vẻ hiệu quả hơn so với các đối thủ cạnh tranh ngay cả khi không có nhiều lợi nhuận hơn” (look more efficient than its competitors even when it is no more profitable).',
    },
    source: {
      url: 'https://taca.com.vn/chi-so-vong-quay-tong-tai-san/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q066',
    formulaId: 'ty-le-chi-tra-co-tuc',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Doanh nghiệp có payout ratio 85%. Cách đọc nào thận trọng nhất?',
      en: 'A company has an 85% payout ratio. What is the most cautious way to read that?',
    },
    choices: {
      a: {
        vi: 'Có thể đang vắt kiệt lợi nhuận, không còn tiền tái đầu tư — cần xem nguồn tiền trả cổ tức',
        en: 'It may be squeezing out every last bit of profit with no cash left to reinvest — check where the dividend money comes from',
      },
      b: {
        vi: 'Rất khoẻ, chia nhiều cho cổ đông',
        en: 'Very healthy — paying shareholders generously',
      },
      c: { vi: 'Sắp phá sản', en: 'About to go bankrupt' },
      d: {
        vi: 'Payout cao luôn tốt cho cổ đông dài hạn',
        en: 'A high payout is always good for long-term shareholders',
      },
    },
    answer: 'a',
    explain: {
      vi: '“Nếu tỷ lệ này quá cao (trên 70-80% chẳng hạn), đó có thể là dấu hiệu công ty đang vắt kiệt lợi nhuận để trả cổ tức, hoặc không có đủ tiền để tái đầu tư” — và nguồn tiền “Có thể là vay nợ, có thể là rút ruột từ quỹ dự phòng”.',
      en: '“Nếu tỷ lệ này quá cao (trên 70-80% chẳng hạn), đó có thể là dấu hiệu công ty đang vắt kiệt lợi nhuận để trả cổ tức, hoặc không có đủ tiền để tái đầu tư” (if the ratio is too high — say, above 70–80% — it can signal that the company is squeezing out profit to pay dividends, or does not have enough cash to reinvest) — and the money can be “Có thể là vay nợ, có thể là rút ruột từ quỹ dự phòng” (borrowed, or drained from a reserve fund).',
    },
    source: {
      url: 'https://vimo.cuthongthai.vn/blog/co-tuc-cao-bay-ngot-hay-kim-cuong-that-90-f0-khong-biet',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q067',
    formulaId: 'ty-le-chi-tra-co-tuc',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Doanh nghiệp giữ lại 840 tỷ lợi nhuận cho dự án mới thay vì chia cổ tức. Điều này nói lên gì?',
      en: 'A company retains VND 840 billion of profit for a new project instead of paying it out as dividends. What does that say?',
    },
    choices: {
      a: { vi: 'Ban lãnh đạo bạc đãi cổ đông', en: 'Management is mistreating shareholders' },
      b: { vi: 'Doanh nghiệp thiếu tiền mặt', en: 'The company is short of cash' },
      c: { vi: 'Sắp phát hành thêm cổ phiếu', en: 'It is about to issue more shares' },
      d: {
        vi: 'Payout hợp lý phụ thuộc cơ hội đầu tư — payout cao thường là dấu hiệu hết cơ hội hấp dẫn',
        en: 'A sensible payout depends on investment opportunities — a high payout is often a sign that attractive opportunities have run out',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Nguồn dẫn trường hợp DPM: “Một công ty sẽ chọn cách trả cổ tức cao, nếu như công ty đó không có nhiều cơ hội đầu tư sinh lời hấp dẫn” và “chưa hẳn trả cổ tức cao đã là tốt”.',
      en: 'The source cites the DPM case: “Một công ty sẽ chọn cách trả cổ tức cao, nếu như công ty đó không có nhiều cơ hội đầu tư sinh lời hấp dẫn” (a company chooses to pay a high dividend when it lacks attractive, profitable investment opportunities) and “chưa hẳn trả cổ tức cao đã là tốt” (a high dividend is not necessarily a good thing).',
    },
    source: {
      url: 'https://m.nhipcaudautu.vn/kinh-doanh/co-tuc-cao-co-phai-la-tot--3264403/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q068',
    formulaId: 'diem-hoa-von',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Giả định nào KHÔNG nằm trong mô hình điểm hoà vốn cơ bản?',
      en: 'Which assumption is NOT part of the basic break-even model?',
    },
    choices: {
      a: {
        vi: 'Doanh nghiệp có nhiều dòng sản phẩm',
        en: 'The company has multiple product lines',
      },
      b: { vi: 'Chi phí cố định không đổi', en: 'Fixed costs stay constant' },
      c: {
        vi: 'Biến phí đơn vị không đổi ở mọi sản lượng',
        en: 'Unit variable cost stays constant at every output level',
      },
      d: {
        vi: 'Giá bán như nhau ở mọi sản lượng',
        en: 'Selling price is the same at every output level',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Mô hình điểm hoà vốn cơ bản giả định chi phí cố định không đổi trong kỳ, biến phí trên một đơn vị không đổi, “Giá bán là như nhau ở mọi mức sản lượng” và “Sản lượng sản xuất = Sản lượng tiêu thụ” (tài liệu ACCA). Bán nhiều sản phẩm KHÔNG nằm trong số giả định ấy, và đó chính là chỗ mô hình gãy, như tutor2u nêu: “Most businesses sell more than one product, so break-even for the business becomes harder to calculate”.',
      en: 'The basic break-even model assumes fixed costs stay flat over the period, unit variable cost stays flat, “Giá bán là như nhau ở mọi mức sản lượng” (the selling price is the same at every output level) and “Sản lượng sản xuất = Sản lượng tiêu thụ” (units produced equal units sold), per the ACCA material. Selling several products is NOT among those assumptions, and it is exactly where the model breaks, as tutor2u notes: “Most businesses sell more than one product, so break-even for the business becomes harder to calculate”.',
    },
    source: {
      url: 'https://knowledge.sapp.edu.vn/knowledge/acca-f5-lesson-4-ph%C3%A2n-t%C3%ADch-m%E1%BB%91i-quan-h%E1%BB%87-chi-ph%C3%AD-s%E1%BA%A3n-l%C6%B0%E1%BB%A3ng-l%E1%BB%A3i-nhu%E1%BA%ADn-cost-volume-profit-analysis',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q069',
    formulaId: 'don-bay-tong-hop',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Doanh nghiệp có đòn bẩy tổng hợp cao. Khi EBIT giảm 10%, điều gì xảy ra?',
      en: 'A company has a high degree of total leverage. When EBIT falls 10%, what happens?',
    },
    choices: {
      a: { vi: 'EPS giảm khoảng 10%', en: 'EPS falls by about 10%' },
      b: { vi: 'EPS không đổi', en: 'EPS stays unchanged' },
      c: { vi: 'EPS tăng do tiết kiệm thuế', en: 'EPS rises due to tax savings' },
      d: {
        vi: 'EPS giảm mạnh hơn nhiều, và nguy cơ mất khả năng thanh toán tăng',
        en: 'EPS falls much more sharply, and the risk of insolvency rises',
      },
    },
    answer: 'd',
    explain: {
      vi: '“nếu kinh doanh không thuận lợi, EBIT giảm, đòn bẩy tài chính càng lớn sẽ làm tăng nguy cơ mất khả năng thanh toán”; và ví von “sử dụng đòn bẩy kinh doanh như sử dụng con dao hai lưỡi”.',
      en: '“nếu kinh doanh không thuận lợi, EBIT giảm, đòn bẩy tài chính càng lớn sẽ làm tăng nguy cơ mất khả năng thanh toán” (if business turns unfavorable and EBIT falls, the greater the financial leverage, the higher the risk of insolvency); and the source likens it to “sử dụng đòn bẩy kinh doanh như sử dụng con dao hai lưỡi” (using operating leverage is like using a double-edged sword).',
    },
    source: {
      url: 'https://amis.misa.vn/27215/don-bay-trong-kinh-doanh/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
];
