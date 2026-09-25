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
    },
    choices: {
      a: { vi: 'Tăng 20%' },
      b: { vi: 'Không đổi — giá điều chỉnh từ 40.000 xuống khoảng 33.333 đồng' },
      c: { vi: 'Giảm vì bị pha loãng' },
      d: { vi: 'Tăng nhưng phải chờ ngày về' },
    },
    answer: 'b',
    explain: {
      vi: 'DNSE nêu đúng ngộ nhận: “Số lượng cổ phiếu trong tài khoản tăng lên khiến nhiều người nghĩ rằng mình đang được thêm tiền mà không phải bỏ ra đồng nào”, trong khi “Không có giá trị mới được tạo ra” — 1.200 cổ phiếu × 33.333 đồng vẫn là 40 triệu.',
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
    },
    choices: {
      a: { vi: 'Lợi nhuận suy giảm' },
      b: { vi: 'Mẫu số tăng do pha loãng, lợi nhuận có thể không đổi' },
      c: { vi: 'Sai sót kế toán' },
      d: { vi: 'Doanh nghiệp giấu lãi' },
    },
    answer: 'b',
    explain: {
      vi: 'DNSE: “Khi số cổ phiếu tăng nhưng lợi nhuận không đổi, EPS giảm xuống, khiến cổ phiếu trở nên kém hấp dẫn hơn về mặt định giá” — và chia liên tục mà không tăng trưởng tương ứng sẽ đẩy P/E lên.',
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
    prompt: { vi: 'EPS quý tăng vọt. Điều cần kiểm tra đầu tiên là gì?' },
    choices: {
      a: { vi: 'Giá cổ phiếu đã tăng chưa' },
      b: {
        vi: 'Lợi nhuận đến từ đâu — có khoản một lần như bán tài sản, thoái vốn, hoàn nhập dự phòng không',
      },
      c: { vi: 'Khối lượng giao dịch' },
      d: { vi: 'Ý kiến của môi giới' },
    },
    answer: 'b',
    explain: {
      vi: 'CafeF: “Lợi nhuận tăng mạnh đôi khi đến từ các khoản một lần – như bán tài sản, thoái vốn, hoặc hoàn nhập dự phòng”. Trường hợp KBC: mua 9,6 triệu cổ phần giá 96 tỷ rồi xác định lại giá trị 2.493 tỷ, ghi nhận lợi nhuận 2.397 tỷ.',
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
    },
    choices: {
      a: { vi: 'Không có rủi ro, số liệu là số liệu' },
      b: {
        vi: 'Con số có thể đảo chiều sau kiểm toán — đã có trường hợp từ lãi 39 tỷ thành lỗ 86,5 tỷ',
      },
      c: { vi: 'Chỉ lệch vài phần trăm' },
      d: { vi: 'Chỉ ảnh hưởng doanh nghiệp nhỏ' },
    },
    answer: 'b',
    explain: {
      vi: 'Trường hợp thật: Chứng khoán Sài Gòn – Hà Nội “giảm hơn 100 tỷ đồng lợi nhuận, từ LÃI 39 tỷ đồng xuống mức LỖ 86,5 tỷ đồng” sau kiểm toán. Kỷ lục thuộc về KBC với chênh lệch 2.256 tỷ, bốc hơi 92% lợi nhuận.',
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
    prompt: { vi: 'Doanh nghiệp chia cổ phiếu thưởng 2:1. BVPS thay đổi thế nào?' },
    choices: {
      a: { vi: 'Giữ nguyên' },
      b: { vi: 'Giảm tương ứng vì vốn chủ không đổi mà số cổ phiếu tăng' },
      c: { vi: 'Tăng gấp đôi' },
      d: { vi: 'Phụ thuộc giá thị trường' },
    },
    answer: 'b',
    explain: {
      vi: 'GoValue: “đây là nghiệp vụ chia tách cổ phiếu. Nó không hề phát sinh bất kỳ dòng tiền mới” nên “giá trị sổ sách (Vốn CSH / Số lượng cổ phiếu) giảm tương ứng”. Nguồn còn cảnh báo lãnh đạo có thể dùng cách này để che giấu thiếu hụt dòng tiền mặt.',
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
    prompt: { vi: 'Với doanh nghiệp lỗ kéo dài nhiều năm, BVPS có thể rơi vào tình trạng nào?' },
    choices: {
      a: { vi: 'Bằng 0' },
      b: { vi: 'Âm, khiến P/B âm và mất ý nghĩa' },
      c: { vi: 'Không đổi' },
      d: { vi: 'Bằng mệnh giá' },
    },
    answer: 'b',
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
    },
    choices: {
      a: { vi: 'A tốt hơn vì ROE cao hơn' },
      b: { vi: 'B đáng giá hơn — ROE của A chủ yếu đến từ đòn bẩy' },
      c: { vi: 'Hai bên tương đương' },
      d: { vi: 'Không so sánh được' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn tiếng Việt nói thẳng: “Một doanh nghiệp có ROE = 30% và ROA = 5%, Ngọ không đánh giá cao bằng doanh nghiệp ROE = 20% và ROA = 15%”. CafeF bổ sung: ROE cao bất thường “có thể đến từ việc doanh nghiệp vay nợ nhiều, khiến lợi nhuận trên vốn tăng ảo”.',
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
    prompt: { vi: 'Hành động nào của doanh nghiệp làm ROE tăng mà lợi nhuận không đổi?' },
    choices: {
      a: { vi: 'Tăng doanh thu' },
      b: { vi: 'Mua lại cổ phiếu quỹ làm giảm vốn chủ sở hữu' },
      c: { vi: 'Trả cổ tức tiền mặt' },
      d: { vi: 'Phát hành thêm cổ phiếu' },
    },
    answer: 'b',
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
    prompt: { vi: 'Doanh nghiệp giữ rất nhiều tiền mặt nhưng hoạt động rất lãi. ROE sẽ thế nào?' },
    choices: {
      a: { vi: 'Cao hơn bình thường' },
      b: { vi: 'Thấp đi vì tiền mặt dư thừa nằm trong vốn chủ sở hữu' },
      c: { vi: 'Không ảnh hưởng' },
      d: { vi: 'Bằng ROA' },
    },
    answer: 'b',
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
    prompt: { vi: 'Doanh nghiệp thép có ROA thấp hơn doanh nghiệp phần mềm. Kết luận nào đúng?' },
    choices: {
      a: { vi: 'Thép làm ăn kém hơn' },
      b: {
        vi: 'Ngành công nghiệp nặng buộc phải có tài sản cố định lớn nên ROA thấp là đặc thù cơ cấu',
      },
      c: { vi: 'Số liệu thép bị sai' },
      d: { vi: 'Phải so ROE thay vì ROA' },
    },
    answer: 'b',
    explain: {
      vi: '“Với các công ty hoạt động trong ngành công nghiệp nặng như: Thép, xi măng,… thường yêu cầu tài sản cố định rất lớn. Do đó chỉ số ROA sẽ tương đối thấp”.',
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
    },
    choices: {
      a: { vi: 'ROA không tính tài sản vô hình' },
      b: { vi: 'Tử số là lợi nhuận sau thuế — đã trừ lãi vay, nên vẫn dính cơ cấu vốn' },
      c: { vi: 'ROA tính theo quý' },
      d: { vi: 'ROA không so sánh được trong cùng ngành' },
    },
    answer: 'b',
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
    },
    choices: {
      a: { vi: 'Tăng tương ứng' },
      b: { vi: 'Âm gần 1 tỷ — toàn bộ lãi đến từ thu nhập khác' },
      c: { vi: 'Bằng 0' },
      d: { vi: 'Không công bố' },
    },
    answer: 'b',
    explain: {
      vi: '“hoạt động kinh doanh còn ghi nhận lợi nhuận gộp âm gần 1 tỷ đồng”, và kết luận “Lợi nhuận tăng mạnh không phải lúc nào cũng đi cùng sự cải thiện của hoạt động kinh doanh cốt lõi”.',
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
    },
    choices: {
      a: { vi: 'Vì nó nhỏ nhất' },
      b: { vi: 'Vì nó hứng trọn mọi tác động của nghiệp vụ kế toán, thuế và chi phí tài chính' },
      c: { vi: 'Vì nó tính theo năm' },
      d: { vi: 'Vì doanh nghiệp không phải công bố' },
    },
    answer: 'b',
    explain: {
      vi: 'Tài liệu kế toán: “Biên lợi nhuận ròng là dễ bị tác động bởi các nghiệp vụ kế toán nhất”.',
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
    prompt: { vi: 'Biên lợi nhuận gộp cao có đảm bảo doanh nghiệp lãi tốt không?' },
    choices: {
      a: { vi: 'Có' },
      b: { vi: 'Không — chi phí bán hàng và quản lý có thể ăn hết phần lãi đó' },
      c: { vi: 'Có nếu doanh thu tăng' },
      d: { vi: 'Có với doanh nghiệp sản xuất' },
    },
    answer: 'b',
    explain: {
      vi: 'Tài liệu kế toán: biên gộp cao “chưa thể hiện được hết việc quản lý chi phí”, và “Mỗi ngành nghề kinh doanh sẽ có khoảng biên lợi nhuận khác nhau nên để tìm ra con số chung cho các ngành là không thể”.',
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
    prompt: { vi: 'Nghiên cứu học thuật ghi nhận nhà quản lý can thiệp biên gộp bằng cách nào?' },
    choices: {
      a: { vi: 'Ghi nhận doanh thu sớm' },
      b: { vi: 'Chuyển chi phí từ giá vốn sang chi phí hoạt động' },
      c: { vi: 'Hoãn khấu hao' },
      d: { vi: 'Tăng hàng tồn kho' },
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
    prompt: { vi: 'D/E của doanh nghiệp là 1,8. Cách xử lý nào hợp lý nhất?' },
    choices: {
      a: { vi: 'Loại ngay vì trên 1' },
      b: { vi: 'So với đặc thù ngành, và tách nợ ngắn hạn với nợ dài hạn' },
      c: { vi: 'Chấp nhận vì nợ là đòn bẩy tốt' },
      d: { vi: 'Chỉ xem nếu ROE trên 20%' },
    },
    answer: 'b',
    explain: {
      vi: '“không nên hoàn toàn bỏ qua các công ty có chỉ số D/E lớn hơn 1”; “Chỉ số D/E thấp không phải lúc nào cũng chỉ ra rằng công ty là tốt, đặc biệt nếu tỷ lệ này âm”; và “Nợ ngắn hạn và nợ dài hạn đều được tính vào tổng nợ... nhưng có kỳ hạn và mức độ rủi ro khác nhau”.',
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
        vi: 'Vốn chủ sở hữu đã âm: nợ phải trả vượt quá tài sản, đây là cảnh báo nặng chứ không phải điểm cộng',
        en: 'Equity has gone negative: liabilities now exceed assets, which is a severe warning rather than a plus',
      },
      c: {
        vi: 'Lỗi hiển thị, nên lấy trị tuyệt đối 3,2 lần rồi đem so sánh',
        en: 'It is a display error, so take the absolute value of 3.2 times and compare with that',
      },
      d: {
        vi: 'Doanh nghiệp đang giữ nhiều tiền mặt hơn số nợ',
        en: 'The company holds more cash than debt',
      },
    },
    answer: 'b',
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
        vi: 'B nhẹ gánh hơn, vì các khoản chiếm dụng đó không phải trả lãi, khác hẳn nợ vay',
        en: 'B carries the lighter burden, because that kind of occupied capital bears no interest, unlike borrowing',
      },
      c: {
        vi: 'B rủi ro hơn, vì đang bị đối tác chiếm dụng vốn',
        en: 'B is riskier, because its partners are tying up its capital',
      },
      d: {
        vi: 'Phải bỏ hết khoản phải trả ra khỏi tử số thì D/E mới có nghĩa',
        en: 'Payables must be stripped out of the numerator before D/E means anything',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Bài phân tích của CafeF tách rõ hai thành phần của tử số và nêu đặc điểm của phần không phải nợ vay: “Đặc thù của các khoản phải trả là không phải chịu lãi suất, có tính gối đầu và không thể thiếu trong các giao dịch kinh doanh”. Cùng một con số 1,5 lần, A phải trả lãi trên gần như toàn bộ khoản nợ còn B gần như không, nên áp lực dòng tiền khác hẳn nhau. Cách xử lý đúng là mở thuyết minh xem tử số gồm những gì, chứ không xoá khoản phải trả khỏi công thức như đáp án d, vì đó vẫn là nghĩa vụ doanh nghiệp phải thanh toán.',
      en: 'A CafeF analysis separates the two components of the numerator and describes the non-borrowing part: “Đặc thù của các khoản phải trả là không phải chịu lãi suất, có tính gối đầu và không thể thiếu trong các giao dịch kinh doanh”. At the same 1.5 times, A pays interest on nearly all of its debt while B pays almost none, so the cash-flow pressure is not comparable. The right move is to read the notes and see what the numerator contains, not to delete payables from the formula as option d suggests, since they are still obligations that must be settled.',
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
        vi: 'Không đủ, vì phải cộng cả lô trái phiếu dự kiến phát hành vào nợ phải trả, thành 5,2 lần',
        en: 'No, because the planned bond issue must be added to total liabilities first, bringing it to 5.2 times',
      },
      c: {
        vi: 'Đủ, vì trần 5 lần chỉ tính nợ vay ngân hàng chứ không tính toàn bộ nợ phải trả',
        en: 'Yes, because the 5-times cap counts only bank borrowings, not all liabilities',
      },
      d: {
        vi: 'Đủ, nếu báo cáo tài chính quý gần nhất cho thấy tỷ lệ đã lùi xuống dưới 5 lần',
        en: 'Yes, provided the most recent quarterly statements show the ratio back below 5 times',
      },
    },
    answer: 'b',
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
        vi: 'Vốn chủ là lớp đệm hứng lỗ đầu tiên; đệm chỉ bằng khoảng một phần chín số nợ thì dự án lỗ nhẹ đã ăn sang tiền của trái chủ',
        en: "Equity is the first cushion to absorb losses; at roughly one-ninth of debt, even a modest project loss already reaches bondholders' money",
      },
      c: {
        vi: 'Là điểm tốt, vì doanh nghiệp đang tận dụng đòn bẩy để sinh lời cao hơn',
        en: 'It is a good sign, since the company is using leverage to earn a higher return',
      },
      d: {
        vi: 'Chỉ cần lãi suất 13% đủ bù rủi ro là mua được',
        en: 'A 13% coupon is compensation enough for the risk on its own',
      },
    },
    answer: 'b',
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
    },
    choices: {
      a: { vi: 'Rất an toàn' },
      b: { vi: 'Chưa chắc — tồn kho ứ đọng khó chuyển thành tiền, và vốn đang bị chôn' },
      c: { vi: 'Doanh nghiệp thiếu vốn' },
      d: { vi: 'Tỷ số này không có ý nghĩa' },
    },
    answer: 'b',
    explain: {
      vi: '“tỷ số này cao là do tỷ trọng của hàng tồn kho cao chưa hẳn đã là an toàn. Nếu như thị trường biến động xấu, hàng tồn kho bị ứ đọng khiến cho hàng tồn kho khó chuyển thành tiền mặt”. Giáo trình bổ sung: vốn chôn trong tài sản ngắn hạn làm giảm lợi nhuận.',
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
    prompt: { vi: 'Đã loại hàng tồn kho, vì sao tỷ số thanh toán nhanh vẫn có thể đánh lừa?' },
    choices: {
      a: { vi: 'Vì còn tiền mặt' },
      b: { vi: 'Vì khoản phải thu còn lại có thể kém chất lượng hoặc không đòi được' },
      c: { vi: 'Vì công thức sai' },
      d: { vi: 'Vì chưa trừ nợ dài hạn' },
    },
    answer: 'b',
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
    },
    choices: {
      a: { vi: 'Vận hành hiệu quả hơn thật sự' },
      b: { vi: 'Tỷ lệ tăng do mẫu số giảm — có thể không lãi hơn chút nào' },
      c: { vi: 'Doanh thu đã tăng' },
      d: { vi: 'Biên lợi nhuận đã cải thiện' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn tiếng Việt: bán tài sản “dẫn đến tỷ lệ lạm phát giả tạo”; “Việc thuê ngoài các cơ sở sản xuất sẽ dẫn đến tỷ lệ luân chuyển tài sản cao hơn” khiến doanh nghiệp “có vẻ hiệu quả hơn so với các đối thủ cạnh tranh ngay cả khi không có nhiều lợi nhuận hơn”.',
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
    prompt: { vi: 'Doanh nghiệp có payout ratio 85%. Cách đọc nào thận trọng nhất?' },
    choices: {
      a: { vi: 'Rất khoẻ, chia nhiều cho cổ đông' },
      b: {
        vi: 'Có thể đang vắt kiệt lợi nhuận, không còn tiền tái đầu tư — cần xem nguồn tiền trả cổ tức',
      },
      c: { vi: 'Sắp phá sản' },
      d: { vi: 'Payout cao luôn tốt cho cổ đông dài hạn' },
    },
    answer: 'b',
    explain: {
      vi: '“Nếu tỷ lệ này quá cao (trên 70-80% chẳng hạn), đó có thể là dấu hiệu công ty đang vắt kiệt lợi nhuận để trả cổ tức, hoặc không có đủ tiền để tái đầu tư” — và nguồn tiền “Có thể là vay nợ, có thể là rút ruột từ quỹ dự phòng”.',
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
    },
    choices: {
      a: { vi: 'Ban lãnh đạo bạc đãi cổ đông' },
      b: {
        vi: 'Payout hợp lý phụ thuộc cơ hội đầu tư — payout cao thường là dấu hiệu hết cơ hội hấp dẫn',
      },
      c: { vi: 'Doanh nghiệp thiếu tiền mặt' },
      d: { vi: 'Sắp phát hành thêm cổ phiếu' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn dẫn trường hợp DPM: “Một công ty sẽ chọn cách trả cổ tức cao, nếu như công ty đó không có nhiều cơ hội đầu tư sinh lời hấp dẫn” và “chưa hẳn trả cổ tức cao đã là tốt”.',
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
    prompt: { vi: 'Giả định nào KHÔNG nằm trong mô hình điểm hoà vốn cơ bản?' },
    choices: {
      a: { vi: 'Chi phí cố định không đổi' },
      b: { vi: 'Biến phí đơn vị không đổi ở mọi sản lượng' },
      c: { vi: 'Giá bán như nhau ở mọi sản lượng' },
      d: { vi: 'Doanh nghiệp có nhiều dòng sản phẩm' },
    },
    answer: 'd',
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
    prompt: { vi: 'Doanh nghiệp có đòn bẩy tổng hợp cao. Khi EBIT giảm 10%, điều gì xảy ra?' },
    choices: {
      a: { vi: 'EPS giảm khoảng 10%' },
      b: { vi: 'EPS giảm mạnh hơn nhiều, và nguy cơ mất khả năng thanh toán tăng' },
      c: { vi: 'EPS không đổi' },
      d: { vi: 'EPS tăng do tiết kiệm thuế' },
    },
    answer: 'b',
    explain: {
      vi: '“nếu kinh doanh không thuận lợi, EBIT giảm, đòn bẩy tài chính càng lớn sẽ làm tăng nguy cơ mất khả năng thanh toán”; và ví von “sử dụng đòn bẩy kinh doanh như sử dụng con dao hai lưỡi”.',
    },
    source: {
      url: 'https://amis.misa.vn/27215/don-bay-trong-kinh-doanh/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
];
