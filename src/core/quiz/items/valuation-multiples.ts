/**
 * Câu hỏi kiểm tra hiểu bài — nhóm Định giá — bội số.
 *
 * Mỗi câu gắn một nguồn thật; xem bất biến ở `../types.ts`. Không thêm câu nào vào đây mà
 * không có `source.url` trỏ tới chỗ đọc được điều câu hỏi đang kiểm tra.
 */

import type { QuizItem } from '../types';

export const BOI_SO: ReadonlyArray<QuizItem> = [
  {
    id: 'Q001',
    formulaId: 'pe',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'P/E của một doanh nghiệp thép là 12,5 trong khi trung bình ngành 18,0. Nhận định nào hợp lý nhất?',
    },
    choices: {
      a: { vi: 'Cổ phiếu đang rẻ hơn ngành, nên mua vào' },
      b: { vi: 'Doanh nghiệp làm ăn kém hơn trung bình ngành' },
      c: {
        vi: 'Chưa kết luận được — thép là ngành chu kỳ, P/E thấp thường rơi vào đỉnh lợi nhuận',
      },
      d: { vi: 'P/E thấp nghĩa là EPS đang âm' },
    },
    answer: 'c',
    explain: {
      vi: 'Với cổ phiếu chu kỳ, quan hệ đảo ngược: P/E thấp là dấu hiệu ngành đã tới đỉnh. Dẫn Peter Lynch: “Với hầu hết các cổ phiếu, tỷ lệ P/E thấp được coi là một điều tốt lành, nhưng với các cổ phiếu chu kỳ thì điều này lại ngược lại”. HPG từng có P/E 3,41 sau khi giá đã giảm 59%.',
    },
    source: {
      url: 'https://cafef.vn/chuyen-nguoc-doi-nhung-co-that-p-e-thap-khong-phai-la-diem-hap-dan-cua-co-phieu-hoa-phat-2022100819552941.chn',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q002',
    formulaId: 'pe',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'GMD năm 2018 có P/E 4,42 lần ở giá 27.700 đồng. Trong 1.830 tỷ lợi nhuận có 1.350 tỷ từ bán tài sản. P/E cốt lõi xấp xỉ bao nhiêu?',
    },
    choices: {
      a: { vi: 'Vẫn 4,42 lần — lợi nhuận là lợi nhuận' },
      b: { vi: 'Khoảng 17 lần' },
      c: { vi: 'Khoảng 2 lần' },
      d: { vi: 'Không tính được nếu chưa có báo cáo kiểm toán' },
    },
    answer: 'b',
    explain: {
      vi: 'Loại 1.350 tỷ lợi nhuận một lần, lợi nhuận cốt lõi còn khoảng 480 tỷ, P/E cốt lõi khoảng 17 lần — gấp gần 4 lần con số hiển thị. Nguồn kết luận: “P/E cốt lõi trong tương lai của doanh nghiệp mới là yếu tố cần quan tâm”.',
    },
    source: {
      url: 'https://azfin.vn/p-e-thap-can-than-voi-bay-gia-tri/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q003',
    formulaId: 'pe',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Doanh nghiệp báo lỗ, EPS bốn quý gần nhất là −1.200 đồng. App nên hiển thị P/E thế nào?',
    },
    choices: {
      a: { vi: 'P/E âm, càng âm sâu càng rẻ' },
      b: { vi: 'P/E = 0 vì không tính được' },
      c: { vi: 'Hiện “— , —” kèm cảnh báo kết quả không có ý nghĩa' },
      d: { vi: 'Lấy trị tuyệt đối của EPS rồi tính bình thường' },
    },
    answer: 'c',
    explain: {
      vi: 'Khi EPS âm, P/E mất ý nghĩa so sánh. Nghịch lý được ghi nhận: P/E âm sâu hơn (−100) lại hàm ý khoản lỗ NHỎ hơn so với thị giá chứ không phải tệ hơn (−10) — tức con số không đọc theo trực giác được. Đây đúng là mã cảnh báo MEANINGLESS trong WarningCode.',
    },
    source: {
      url: 'https://24hmoney.vn/news/chi-so-pe-5-su-that-gay-soc-ma-90-nha-dau-tu-bo-qua-c30a2690593.html',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q004',
    formulaId: 'pe',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Hai doanh nghiệp cùng ngành, A có P/E thấp hơn B 24%. Điều gì có thể giải thích chênh lệch này mà không liên quan tới việc A rẻ hơn?',
    },
    choices: {
      a: { vi: 'A có đòn bẩy nợ cao hơn' },
      b: { vi: 'A có nhiều tiền mặt hơn' },
      c: { vi: 'A trả cổ tức đều hơn' },
      d: { vi: 'A có vốn hoá lớn hơn' },
    },
    answer: 'a',
    explain: {
      vi: 'P/E chịu ảnh hưởng của cấu trúc vốn còn EV/EBITDA thì không. Nguồn ghi: “Higher leverage usually (but not always) results in a lower price earnings ratio, but this does not necessarily indicate a better value stock” — và dẫn cặp Greggs/Dominos cho tín hiệu ngược nhau giữa hai chỉ số.',
    },
    source: {
      url: 'https://www.footnotesanalyst.com/relative-valuation-conflicts-ev-ebitda-versus-p-e/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q005',
    formulaId: 'pe',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Ngành nào sau đây P/E kém tác dụng nhất do đặc thù ghi nhận doanh thu?' },
    choices: {
      a: { vi: 'Ngân hàng' },
      b: { vi: 'Xây dựng' },
      c: { vi: 'Bán lẻ' },
      d: { vi: 'Điện' },
    },
    answer: 'b',
    explain: {
      vi: 'Ngành xây dựng ghi nhận doanh thu theo tiến độ dự án nên lợi nhuận từng kỳ không phản ánh nhịp kinh doanh thật. Nguồn cũng nêu P/E hợp lý khác nhau theo ngành — ví dụ ngân hàng 12–14 lần.',
    },
    source: {
      url: 'https://simplize.vn/learn/chi-so-pe',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q006',
    formulaId: 'pb',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Một cổ phiếu ngân hàng có P/B 0,7 lần. Cách đọc nào đúng nhất?' },
    choices: {
      a: { vi: 'Chắc chắn rẻ vì mua tài sản dưới giá sổ sách' },
      b: { vi: 'Thị trường đang chiết khấu rủi ro chất lượng tài sản, cần soi nợ xấu' },
      c: { vi: 'Ngân hàng sắp phá sản' },
      d: { vi: 'P/B dưới 1 là lỗi dữ liệu' },
    },
    answer: 'b',
    explain: {
      vi: 'Với ngân hàng, giá trị sổ sách chủ yếu là dư nợ cho vay. Nguồn cảnh báo: “khi nợ xấu tăng cao, giá trị thực tế của các khoản vay này có thể thấp hơn nhiều so với con số ghi chép trên sổ sách”, và nhắc nguyên tắc “Đừng bao giờ nhầm lẫn giữa rẻ và tốt”.',
    },
    source: {
      url: 'https://vimo.cuthongthai.vn/blog/pb-ratio-bi-mat-dinh-gia-co-phieu-ngan-hang',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q007',
    formulaId: 'pb',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Vì sao Damodaran nói mua dưới giá trị sổ sách không đảm bảo là mua rẻ?' },
    choices: {
      a: { vi: 'Vì giá trị sổ sách luôn bị khai thấp' },
      b: { vi: 'Vì giá trị sổ sách là một ý kiến kế toán, không phải giá trị thanh lý' },
      c: { vi: 'Vì P/B chỉ dùng được cho công ty Mỹ' },
      d: { vi: 'Vì thị trường luôn đúng' },
    },
    answer: 'b',
    explain: {
      vi: 'Damodaran: “The book value is an opinion and not a fact”. Niềm tin “P/B < 1 là rẻ” dựa trên hai giả định sai: thị trường kém tin cậy hơn kế toán, và giá trị sổ sách bằng giá trị thanh lý. Doanh nghiệp ROE thấp hoặc rủi ro cao xứng đáng giao dịch dưới book value.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/invfables/ch4new.pdf',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q008',
    formulaId: 'pb',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Loại doanh nghiệp nào khiến P/B trông đắt một cách sai lệch?' },
    choices: {
      a: { vi: 'Doanh nghiệp thép' },
      b: { vi: 'Công ty phần mềm và thương hiệu mạnh' },
      c: { vi: 'Công ty bất động sản' },
      d: { vi: 'Ngân hàng' },
    },
    answer: 'b',
    explain: {
      vi: 'Giá trị sổ sách chỉ ghi nhận tài sản hữu hình. P/B “KHÔNG phù hợp với những công ty có tài sản vô hình lớn (như các công ty phần mềm)” vì thương hiệu, bằng sáng chế, uy tín không nằm trên bảng cân đối.',
    },
    source: {
      url: 'https://simplize.vn/learn/chi-so-pb',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q009',
    formulaId: 'ps',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'P/S của một doanh nghiệp thấp hơn hẳn đối thủ. Kết luận nào đúng?' },
    choices: {
      a: { vi: 'Cổ phiếu rẻ hơn' },
      b: { vi: 'Chỉ biết trả ít hơn cho mỗi đồng doanh thu, chưa biết gì về biên lợi nhuận và nợ' },
      c: { vi: 'Doanh thu đang giảm' },
      d: { vi: 'Doanh nghiệp sắp có lãi' },
    },
    answer: 'b',
    explain: {
      vi: 'P/S thấp một mình nó không nói cổ phiếu rẻ: cùng một mức doanh thu có thể sinh ra lợi nhuận rất khác nhau tuỳ biên lợi nhuận, cấu trúc chi phí và nợ vay, nên con số này chỉ là chỗ bắt đầu hỏi tiếp chứ không phải kết luận. “A low P/S becomes shorthand for cheap. A high P/S becomes shorthand for overpriced. Both assumptions can be completely wrong”, và lỗi thường gặp là “They used the number as a final answer, not a starting point”.',
      en: 'A low P/S on its own does not make a stock cheap: the same revenue can turn into very different profits depending on margin, cost structure and borrowings, so the number is where the questions start, not where they end. The source: “A low P/S becomes shorthand for cheap. A high P/S becomes shorthand for overpriced. Both assumptions can be completely wrong”, and the usual error is that “They used the number as a final answer, not a starting point”.',
    },
    source: {
      url: 'https://medium.com/@patrick_249/price-to-sales-the-most-misused-growth-investing-metric-e5b737c49aa3',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q314',
    formulaId: 'ps',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Theo Aswath Damodaran, so sánh trực tiếp con số P/S giữa các doanh nghiệp có thể gây hiểu lầm trong những tình huống nào? (chọn đủ các đáp án đúng)',
      en: 'According to Aswath Damodaran, comparing raw P/S multiples across companies directly can be misleading in which situations? (select all that apply)',
    },
    choices: {
      a: {
        vi: 'Các doanh nghiệp so sánh có biên lợi nhuận gộp chênh lệch lớn (ví dụ Amazon và Yahoo trong bài viết)',
        en: 'The companies being compared have very different gross margins (e.g., Amazon and Yahoo in the article)',
      },
      b: {
        vi: 'Một doanh nghiệp gộp chung doanh thu từ các mảng kinh doanh có bản chất khác nhau, như AOL với mảng truy cập dial-up và mảng quảng cáo/thương mại',
        en: "A company lumps revenue from businesses with very different natures into one figure, as with AOL's dialup-access and advertising/commerce segments",
      },
      c: {
        vi: 'Doanh nghiệp mới niêm yết trên sàn chứng khoán trong năm đó',
        en: 'The company just listed on the stock exchange that year',
      },
      d: {
        vi: 'Doanh nghiệp đang trả cổ tức bằng tiền mặt hàng quý',
        en: 'The company pays quarterly cash dividends',
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: "Damodaran chỉ ra P/S là thước đo thô, không tách được đòn bẩy biên lợi nhuận: “Yahoo trades at 130 times sales. But few would say that Amazon, which trades at 20 times sales, is only one-third as richly valued as Yahoo.” Amazon phải trừ giá vốn hàng bán khỏi doanh thu còn Yahoo gần như không có giá vốn, nên hai con số P/S không thể so sánh trực tiếp. Tương tự, AOL không nên gộp một P/S chung vì “AOL's revenue comes from two very different businesses -- dialup access and advertising/commerce”, hai mảng có biên lợi nhuận khác hẳn nhau.",
      en: "Damodaran points out that P/S is a crude measure that cannot separate out margin leverage: “Yahoo trades at 130 times sales. But few would say that Amazon, which trades at 20 times sales, is only one-third as richly valued as Yahoo.” Amazon has to subtract cost of goods sold from revenue while Yahoo carries almost none, so the two P/S figures are not directly comparable. Likewise, AOL should not be assigned one blended P/S because “AOL's revenue comes from two very different businesses -- dialup access and advertising/commerce,” two segments with very different margins.",
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/darkside/articles/parsingps.htm',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q315',
    formulaId: 'ps',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Doanh thu của một doanh nghiệp tăng mạnh khiến P/S giảm xuống, trông có vẻ "rẻ" hơn trước. Trước khi kết luận đó là tín hiệu tích cực, nhà đầu tư nên kiểm tra dấu hiệu nào trong báo cáo tài chính?',
      en: 'A company\'s revenue jumps sharply, pushing its P/S down and making the stock look "cheaper." Before concluding that\'s a good sign, which red flag should an investor check for in the financial statements?',
    },
    choices: {
      a: {
        vi: 'Khoản phải thu tăng nhanh hơn rất nhiều so với doanh số',
        en: 'Accounts receivable are growing much faster than sales',
      },
      b: {
        vi: 'Giá vốn hàng bán tăng cùng tỷ lệ với doanh thu',
        en: 'Cost of goods sold is growing at the same rate as revenue',
      },
      c: {
        vi: 'Số cổ phiếu lưu hành giữ nguyên trong kỳ',
        en: 'The number of shares outstanding stayed the same during the period',
      },
      d: {
        vi: 'Vốn hóa thị trường cao hơn tổng doanh thu năm',
        en: 'Market capitalization is higher than annual revenue',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Nguồn cảnh báo: “Nếu các khoản phải thu của doanh nghiệp đang tăng nhanh hơn rất nhiều so với doanh số, có khả năng một số doanh thu ghi nhận sớm nhưng chưa đem lại dòng tiền thực cho doanh nghiệp.” Doanh thu tăng theo cách này chỉ là con số kế toán, chưa phải tiền thật, nên P/S giảm không đồng nghĩa cổ phiếu thực sự rẻ đi.',
      en: "The source warns: “Nếu các khoản phải thu của doanh nghiệp đang tăng nhanh hơn rất nhiều so với doanh số, có khả năng một số doanh thu ghi nhận sớm nhưng chưa đem lại dòng tiền thực cho doanh nghiệp” (roughly, “if a company's receivables are growing much faster than its sales, some revenue may have been booked early without yet bringing in real cash”). Revenue that grows this way is only an accounting figure, not real cash, so a falling P/S does not mean the stock has genuinely gotten cheaper.",
    },
    source: {
      url: 'https://govalue.vn/chi-so-ps/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q316',
    formulaId: 'ps',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Ngày 8/5/2019, GoValue tính P/S của HPG bằng vốn hóa thị trường 71.150,89 tỷ đồng chia cho doanh thu thuần năm 2018 (56.580,42 tỷ đồng), ra 1,26 lần. Nhưng khi đó HPG đã công bố báo cáo tài chính Q1/2019, nên doanh thu thuần lũy kế 4 quý gần nhất đã lên 57.798 tỷ đồng. Nguồn khuyến nghị dùng doanh thu lũy kế 4 quý gần nhất cho chính xác hơn — bảng số liệu có cả hai mức doanh thu, hãy điền đúng con số vào công thức P/S.',
      en: "On May 8, 2019, GoValue computed HPG's P/S as its market cap of VND 71,150.89 billion divided by 2018 full-year net revenue (VND 56,580.42 billion), getting 1.26x. But by then HPG had already released its Q1/2019 results, so trailing four-quarter net revenue had risen to VND 57,798 billion. The source recommends the trailing four-quarter figure for accuracy — the table holds both revenue figures, so put the right one into the P/S formula.",
    },
    facts: [
      {
        label: {
          vi: 'Vốn hóa thị trường HPG (8/5/2019)',
          en: 'HPG market capitalization (May 8, 2019)',
        },
        value: { vi: '71.150,89 tỷ đồng', en: 'VND 71,150.89 billion' },
      },
      {
        label: {
          vi: 'Doanh thu thuần năm 2018 (cả năm tài chính trước)',
          en: 'Full-year 2018 net revenue (prior fiscal year)',
        },
        value: { vi: '56.580,42 tỷ đồng', en: 'VND 56,580.42 billion' },
      },
      {
        label: {
          vi: 'Doanh thu thuần lũy kế 4 quý gần nhất (đã cập nhật Q1/2019)',
          en: 'Trailing four-quarter net revenue (updated with Q1/2019)',
        },
        value: { vi: '57.798 tỷ đồng', en: 'VND 57,798 billion' },
      },
    ],
    expected: 1.231,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'P/S = [71.150,89] ÷ [57.798]',
      en: 'P/S = [71150.89] ÷ [57798]',
    },
    explain: {
      vi: 'Nguồn tính lại P/S ngay sau khi có báo cáo Q1/2019: “Để chính xác hơn chúng ta cần sử dụng doanh thu lũy kế 4 Quý gần nhất của HPG.” Lấy 71.150,89 chia cho 57.798 tỷ đồng doanh thu lũy kế 4 quý ra khoảng 1,23 lần — thấp hơn 1,26 lần nếu vẫn dùng doanh thu cả năm 2018 đã lỗi thời so với báo cáo mới nhất.',
      en: "The source recalculates P/S right after the Q1/2019 results come out: “Để chính xác hơn chúng ta cần sử dụng doanh thu lũy kế 4 Quý gần nhất của HPG” (roughly, “for more accuracy we need to use HPG's trailing four-quarter revenue”). Dividing VND 71,150.89 billion by the trailing four-quarter revenue of VND 57,798 billion gives about 1.23x — lower than the 1.26x you would get by still using the now-outdated full-year-2018 revenue.",
    },
    giai: {
      tinh: { vi: 'hệ số giá trên doanh thu', en: 'Price to sales ratio' },
      thaySo: { vi: '71.150,89 ÷ 57.798', en: '71150.89 ÷ 57798' },
      ketQua: { vi: '1,23 lần', en: '1.23 x' },
      gan: [
        {
          kyHieu: 'P',
          moTa: {
            vi: 'là giá một cổ phiếu; ở đây tử và mẫu cùng nhân với số cổ phiếu, nên dùng thẳng vốn hoá 71.150,89 tỷ ₫',
            en: 'is the price of one share; here top and bottom are both multiplied by the share count, so market cap of 71150.89 billion ₫ is used directly',
          },
        },
        {
          kyHieu: 'S_{ps}',
          moTa: {
            vi: 'là doanh thu trên một cổ phiếu; nhân với số cổ phiếu thành doanh thu thuần 4 quý gần nhất 57.798 tỷ ₫',
            en: 'is revenue per share; multiplied by the share count it becomes trailing four-quarter net revenue of 57798 billion ₫',
          },
        },
      ],
    },
    source: {
      url: 'https://govalue.vn/chi-so-ps/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q010',
    formulaId: 'ev',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Vì sao Enterprise Value trừ đi tiền mặt?' },
    choices: {
      a: { vi: 'Vì tiền mặt không sinh lời' },
      b: { vi: 'Vì bên mua nhận luôn số tiền đó nên nó bù trừ vào giá phải trả' },
      c: { vi: 'Vì tiền mặt đã tính vào nợ' },
      d: { vi: 'Vì chuẩn kế toán yêu cầu' },
    },
    answer: 'b',
    explain: {
      vi: "Vì người mua đứt doanh nghiệp sẽ nhận luôn số tiền mặt đang nằm trong đó, nên phần tiền ấy tự bù lại một phần giá mua: trả 5 đồng để nhận về một tờ 5 đồng thì thực chất không tốn gì. Chính câu hỏi này từng được đặt trên diễn đàn tài chính: “i just dont understand the logic of how it would be cheaper to acquire a firm with a billion cash versus a firm with no cash”, và câu trả lời được chấp nhận là “the buyer would get the target company's cash as part of the deal, effectively lowering the price”.",
      en: "Because whoever buys the whole company also receives the cash sitting inside it, so that cash offsets part of the price: paying 5 to receive a 5 note costs nothing in substance. The question was asked on a finance forum in exactly these words: “i just dont understand the logic of how it would be cheaper to acquire a firm with a billion cash versus a firm with no cash”, and the accepted answer was “the buyer would get the target company's cash as part of the deal, effectively lowering the price”.",
    },
    source: {
      url: 'https://www.wallstreetoasis.com/forum/off-topic/why-subtract-cash-when-we-calculate-enterprise-value',
      kind: 'trai-nghiem',
      vietnam: false,
    },
  },
  {
    id: 'Q011',
    formulaId: 'ev',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Bội số nào sau đây là ghép sai tử số với mẫu số?' },
    choices: {
      a: { vi: 'P/E' },
      b: { vi: 'EV/EBITDA' },
      c: { vi: 'P/EBITDA' },
      d: { vi: 'P/B' },
    },
    answer: 'c',
    explain: {
      vi: 'Tử số vốn chủ (giá, vốn hoá) phải đi với mẫu số vốn chủ; mẫu số toàn doanh nghiệp (EBITDA, doanh thu) phải đi với EV. Damodaran gọi thẳng: “Price to EBITDA is an inconsistent abomination and Price to Sales is almost as badly constructed”.',
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2020/04/a-viral-market-update-vii-mayhem-with.html',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q317',
    formulaId: 'ev',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: "Một cổ phiếu tính ra EV ÂM (tiền mặt ròng lớn hơn cả vốn hoá cộng nợ vay). Nhiều nhà đầu tư mới lập tức gọi đây là một 'món hời'. Giới phân tích cảnh báo điều gì về kết luận vội vàng này?",
      en: "A stock's EV comes out NEGATIVE (net cash exceeds market cap plus debt). Many new investors immediately call this a 'bargain'. What do analysts warn about this quick conclusion?",
    },
    choices: {
      a: {
        vi: 'Kết luận đó chưa chắc đúng: cổ đông thiểu số không có quyền buộc công ty chia số tiền mặt đó ra, và thị trường có thể đang định giá rằng mảng kinh doanh cốt lõi sẽ đốt tiền trong tương lai',
        en: 'The conclusion is not necessarily true: a minority shareholder has no right to force the company to distribute that cash, and the market may be pricing in that the core business will burn cash going forward',
      },
      b: {
        vi: 'Kết luận đó luôn đúng vì tiền mặt là tài sản chắc chắn nhất nên chỉ cần mua vào là có lời',
        en: 'The conclusion is always true because cash is the safest asset, so buying in guarantees a profit',
      },
      c: {
        vi: 'EV âm chỉ là lỗi làm tròn số liệu, không mang ý nghĩa kinh tế nào',
        en: 'A negative EV is just a rounding error and carries no economic meaning',
      },
      d: {
        vi: 'EV âm nghĩa là công ty chắc chắn sắp bị huỷ niêm yết',
        en: 'A negative EV means the company is certain to be delisted soon',
      },
    },
    answer: 'a',
    explain: {
      vi: "Nguồn giải thích cơ chế: “The intuition is that the market expects the company's core-business Assets to generate negative cash flow in the future, which makes them worth a negative amount.” Và cảnh báo trực tiếp: “Be wary of anyone who says a company with a negative Enterprise Value is a 'bargain' – if you're just a minority shareholder, that company is under no obligation to distribute cash to you.” Tức là số tiền mặt lớn trên sổ sách không tự động chảy vào túi cổ đông nhỏ lẻ.",
      en: "The source explains the mechanism: “The intuition is that the market expects the company's core-business Assets to generate negative cash flow in the future, which makes them worth a negative amount.” And it directly warns: “Be wary of anyone who says a company with a negative Enterprise Value is a 'bargain' – if you're just a minority shareholder, that company is under no obligation to distribute cash to you.” In other words, a large cash balance on paper does not automatically flow into a minority shareholder's pocket.",
    },
    source: {
      url: 'https://breakingintowallstreet.com/kb/equity-value-enterprise-value/negative-enterprise-value/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q318',
    formulaId: 'ev',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Công thức EV trong bài lấy số dư nợ vay trực tiếp từ bảng cân đối kế toán, tức giá trị SỔ SÁCH. Khi phần lớn nợ của công ty là vay ngân hàng không niêm yết, không có giá thị trường để tra, Damodaran đề xuất cách nào để ước lượng đúng hơn giá trị THỊ TRƯỜNG của khoản nợ đó?',
      en: "The EV formula in this article takes the debt balance straight from the balance sheet, i.e. its BOOK value. When most of a company's debt is non-traded bank debt with no observable market price, what method does Damodaran propose to better estimate the MARKET value of that debt?",
    },
    choices: {
      a: {
        vi: 'Cộng thêm một khoản phụ trội cố định 20% vào giá trị sổ sách để bù rủi ro thanh khoản',
        en: 'Add a fixed 20% premium to the book value to compensate for illiquidity risk',
      },
      b: {
        vi: 'Coi toàn bộ nợ trên sổ sách như một trái phiếu coupon duy nhất, lãi suất bằng chi phí lãi vay của công ty, kỳ hạn bằng kỳ hạn bình quân theo mệnh giá, rồi định giá lại trái phiếu đó theo chi phí nợ hiện hành',
        en: "Treat the entire debt on the books as one coupon bond, with the coupon equal to the company's interest expense and the maturity equal to the face-value weighted average maturity, then reprice that bond at the current cost of debt",
      },
      c: {
        vi: 'Loại hẳn phần nợ vay ngân hàng ra khỏi công thức EV vì không định giá được',
        en: 'Drop bank debt out of the EV formula entirely because it cannot be valued',
      },
      d: {
        vi: 'Giữ nguyên giá trị sổ sách vì nợ vay ngân hàng không bao giờ chênh lệch với giá trị thị trường',
        en: 'Keep the book value as is, since bank debt never differs from its market value',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn nêu rõ vì sao cần cách này: rất ít doanh nghiệp có toàn bộ nợ dưới dạng trái phiếu giao dịch trên thị trường, phần lớn có nợ không giao dịch như vay ngân hàng. Cách chuyển đổi được trích nguyên văn: “A simple way to convert book value debt into market value debt is to treat the entire debt on the books as one coupon bond, with a coupon set equal to the interest expenses on all the debt and the maturity set equal to the face-value weighted average maturity of the debt, and then to value this coupon bond at the current cost of debt for the company.” Công thức EV rút gọn trong bài dùng thẳng giá trị sổ sách là một quy ước chấp nhận được khi lãi suất ít biến động, nhưng đây mới là cách ước lượng chính xác hơn.',
      en: 'The source explains why this method is needed: very few firms have all their debt in traded bond form, and most carry non-traded debt such as bank loans. The conversion method is quoted verbatim: “A simple way to convert book value debt into market value debt is to treat the entire debt on the books as one coupon bond, with a coupon set equal to the interest expenses on all the debt and the maturity set equal to the face-value weighted average maturity of the debt, and then to value this coupon bond at the current cost of debt for the company.” The simplified EV formula in this article, which uses book value directly, is an acceptable convention when interest rates have not moved much, but this is the more rigorous estimation method.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/valquestions/mktvalofdebt.htm',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q012',
    formulaId: 'ev-ebitda',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Vì sao Buffett và Munger phản đối dùng EBITDA làm thước đo dòng tiền?' },
    choices: {
      a: { vi: 'Vì EBITDA khó tính' },
      b: { vi: 'Vì EBITDA bỏ qua lãi vay, thuế và capex duy trì — đều là chi phí thật' },
      c: { vi: 'Vì EBITDA chỉ dùng cho công ty niêm yết' },
      d: { vi: 'Vì EBITDA thay đổi theo chuẩn kế toán' },
    },
    answer: 'b',
    explain: {
      vi: "Munger: “every time you see the word EBITDA, you should substitute the word bullshit earnings”. Buffett: “Telecoms, for example, spend every dime that's coming in. Interest and taxes are real costs”. Doanh nghiệp EBITDA 2 triệu mà phải chi 2 triệu mua thiết bị mỗi năm thì không sinh lời cho chủ sở hữu.",
    },
    source: {
      url: 'https://www.permanentequity.com/content/ebitda-is-bs-earnings',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q013',
    formulaId: 'ev-ebitda',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'EBITDA bỏ sót yếu tố nào khiến nó không thay thế được dòng tiền?' },
    choices: {
      a: { vi: 'Thay đổi vốn lưu động và dòng tiền đầu tư' },
      b: { vi: 'Doanh thu tài chính' },
      c: { vi: 'Lợi nhuận gộp' },
      d: { vi: 'Chi phí bán hàng' },
    },
    answer: 'a',
    explain: {
      vi: 'Nguồn tiếng Việt: “EBITDA là một chỉ tiêu quan trọng trong đánh giá khả năng sinh lời của doanh nghiệp, tuy nhiên, nó không phải là thước đo để đánh giá dòng tiền của doanh nghiệp” — do không tính thay đổi vốn lưu động, dòng tiền đầu tư và tài chính.',
    },
    source: {
      url: 'https://simplize.vn/learn/ev-ebitda',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q319',
    formulaId: 'ev-ebitda',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Hai doanh nghiệp cùng ngành, một bên thâm dụng tài sản cố định nặng (nhà máy, máy móc lớn), một bên nhẹ tài sản. Vì sao so trực tiếp EV/EBITDA giữa hai bên dễ khiến người xem lầm tưởng bên thâm dụng tài sản đang rẻ hơn?',
      en: 'Two companies in the same industry — one is heavy on fixed assets (large plants, machinery), the other is asset-light. Why does directly comparing their EV/EBITDA multiples risk making the asset-heavy one look cheaper than it actually is?',
    },
    choices: {
      a: {
        vi: 'Vì EBITDA không trừ khấu hao, khoản gần đúng cho chi phí duy trì và thay thế tài sản cố định, nên bội số của doanh nghiệp thâm dụng tài sản bị kéo xuống thấp một cách máy móc chứ không hẳn vì rẻ hơn',
        en: "Because EBITDA does not deduct depreciation, a rough proxy for the ongoing cost of maintaining and replacing fixed assets, so an asset-heavy company's multiple gets mechanically pulled down, not because it is actually cheaper",
      },
      b: {
        vi: 'Vì doanh nghiệp thâm dụng tài sản cố định luôn vay nợ nhiều hơn nên EV luôn thấp hơn',
        en: 'Because asset-heavy companies always carry more debt, so their EV is always lower',
      },
      c: {
        vi: 'Vì EBITDA của doanh nghiệp thâm dụng tài sản bị tính hai lần trong công thức',
        en: "Because an asset-heavy company's EBITDA gets double-counted in the formula",
      },
      d: {
        vi: 'Vì thị trường luôn định giá cổ phiếu ngành sản xuất thấp hơn ngành dịch vụ',
        en: 'Because the market always prices manufacturing stocks lower than service stocks',
      },
    },
    answer: 'a',
    explain: {
      vi: 'Nguồn phân tích chuyên môn (Footnotes Analyst) viết: “You would expect differences in fixed asset intensity to affect the EV/EBITDA multiple. Because market prices (and hence enterprise value) should consider the ongoing cost of replacing fixed assets, comparing EV with a measure that is stated before this cost will lead to the multiple being affected by fixed asset intensity – higher fixed assets leads to a lower multiple.” Nói cách khác, EV đã phản ánh kỳ vọng thị trường về chi phí tái đầu tư tài sản cố định trong tương lai, còn EBITDA thì chưa trừ khoản đó vì khấu hao nằm dưới dòng EBITDA. Vì vậy doanh nghiệp thâm dụng tài sản cố định càng cao thì EV/EBITDA càng thấp một cách cơ học, không phải tín hiệu định giá rẻ.',
      en: "The professional source (Footnotes Analyst) states: “You would expect differences in fixed asset intensity to affect the EV/EBITDA multiple. Because market prices (and hence enterprise value) should consider the ongoing cost of replacing fixed assets, comparing EV with a measure that is stated before this cost will lead to the multiple being affected by fixed asset intensity – higher fixed assets leads to a lower multiple.” In other words, EV already prices in the market's expectation of future capital reinvestment, while EBITDA has not yet subtracted that cost, since depreciation sits below the EBITDA line. So a company with heavier fixed-asset intensity mechanically shows a lower EV/EBITDA multiple, which by itself is not a signal of being undervalued.",
    },
    source: {
      url: 'https://www.footnotesanalyst.com/ebitdaal-more-letters-but-no-more-insight/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q320',
    formulaId: 'ev-ebitda',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Giới ngân hàng đầu tư gần như không dùng EV/EBITDA để định giá ngân hàng và công ty bảo hiểm. Những lý do nào dưới đây đúng với việc EV/EBITDA mất ý nghĩa với nhóm doanh nghiệp này? (Chọn tất cả đáp án đúng.)',
      en: 'Investment bankers almost never use EV/EBITDA to value banks and insurance companies. Which of the following are valid reasons why EV/EBITDA loses meaning for this group? (Select all that apply.)',
    },
    choices: {
      a: {
        vi: 'Nợ (tiền gửi, khoản vay) chính là nguyên liệu đầu vào cho hoạt động kinh doanh cốt lõi là cho vay, không phải một quyết định tài trợ tách rời như ở doanh nghiệp sản xuất',
        en: 'Debt (deposits, borrowings) is the raw material for the core lending business itself, not a financing decision separate from operations the way it is for a manufacturer',
      },
      b: {
        vi: 'Lãi vay là cấu phần cốt lõi của cả doanh thu lẫn chi phí hoạt động, nên loại lãi vay ra để tính EBITDA sẽ xóa mất đúng phần quan trọng nhất',
        en: 'Interest is a core component of both revenue and operating expenses, so stripping it out to compute EBITDA removes exactly the most important piece',
      },
      c: {
        vi: 'Ngân hàng và công ty bảo hiểm không có khấu hao tài sản cố định nên EBITDA luôn bằng doanh thu',
        en: 'Banks and insurers have no fixed-asset depreciation, so EBITDA always equals revenue',
      },
      d: {
        vi: 'Vốn hóa thị trường của ngân hàng luôn lớn hơn giá trị sổ sách nên không tính được EV',
        en: "A bank's market capitalization is always larger than its book value, so EV cannot be calculated",
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: 'Nguồn chuyên môn (Mergers & Inquisitions) khẳng định thẳng: “In fact, you don’t even calculate Enterprise Value for banks and insurance firms.” Lý do gốc rễ nằm ở hai điểm nguồn nêu: với ngân hàng và bảo hiểm, nợ (tiền gửi, khoản vay) tài trợ trực tiếp cho hoạt động cho vay, tức là hoạt động kinh doanh chính chứ không phải một khoản tài trợ tách biệt khỏi hoạt động ("debt... related to the company\'s core operations"); và “EBITDA is no longer meaningful because interest is a critical component of both revenue and expenses” — loại lãi vay ra khỏi lợi nhuận đúng bằng việc loại bỏ động cơ lợi nhuận chính của một ngân hàng. Phương án c và d sai: ngân hàng vẫn có khấu hao (dù nhỏ so với tài sản tài chính), và quy mô vốn hóa lớn hay nhỏ không phải lý do khiến EV mất nghĩa.',
      en: 'The professional source (Mergers & Inquisitions) states plainly: “In fact, you don’t even calculate Enterprise Value for banks and insurance firms.” The root cause has two parts per the source: for banks and insurers, debt (deposits, borrowings) directly funds the core lending business rather than being a financing decision separate from operations ("debt... related to the company\'s core operations"); and “EBITDA is no longer meaningful because interest is a critical component of both revenue and expenses” — stripping out interest removes the very driver of a bank\'s profit. Choices c and d are wrong: banks still carry some depreciation, and market-cap size is not the reason EV loses meaning.',
    },
    source: {
      url: 'https://mergersandinquisitions.com/bank-insurance-modeling-101/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q321',
    formulaId: 'ev-ebitda',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Doanh nghiệp XYZ sở hữu 80% công ty con ABC, nên báo cáo tài chính hợp nhất của XYZ đã gộp 100% doanh thu, EBIT và EBITDA của ABC. Enterprise Value phải cộng thêm lợi ích cổ đông thiểu số thì hai vế của tỷ số mới khớp nhau. Điền năm con số trong bảng vào đúng ô trống của công thức EV/EBITDA — chú ý ô nào cộng vào, ô nào trừ ra.',
      en: "Company XYZ owns 80% of subsidiary ABC, so XYZ's consolidated financial statements already include 100% of ABC's revenue, EBIT and EBITDA. Enterprise Value must add minority interest for both sides of the ratio to match. Put the five figures from the table into the right slots of the EV/EBITDA formula — mind which ones are added and which is subtracted.",
    },
    facts: [
      {
        label: { vi: 'Vốn hóa thị trường', en: 'Market capitalization' },
        value: { vi: '5.000 tỷ đồng', en: 'VND 5,000 billion' },
      },
      {
        label: { vi: 'Tổng nợ vay', en: 'Total debt' },
        value: { vi: '1.200 tỷ đồng', en: 'VND 1,200 billion' },
      },
      {
        label: { vi: 'Tiền và tương đương tiền', en: 'Cash and cash equivalents' },
        value: { vi: '300 tỷ đồng', en: 'VND 300 billion' },
      },
      {
        label: {
          vi: 'Lợi ích cổ đông thiểu số (20% của ABC)',
          en: 'Minority interest (20% stake in ABC)',
        },
        value: { vi: '400 tỷ đồng', en: 'VND 400 billion' },
      },
      {
        label: {
          vi: 'EBITDA hợp nhất (gồm 100% EBITDA của ABC)',
          en: "Consolidated EBITDA (includes 100% of ABC's EBITDA)",
        },
        value: { vi: '800 tỷ đồng', en: 'VND 800 billion' },
      },
    ],
    expected: 7.875,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'EV/EBITDA = ([5.000] + [1.200] + [400] − [300]) ÷ [800]',
      en: 'EV/EBITDA = ([5000] + [1200] + [400] − [300]) ÷ [800]',
    },
    explain: {
      vi: 'EV = Vốn hóa + Nợ vay − Tiền + Lợi ích cổ đông thiểu số = 5.000 + 1.200 − 300 + 400 = 6.300 tỷ đồng. EV/EBITDA = 6.300 / 800 = 7,875 lần. Corporate Finance Institute giải thích vì sao bắt buộc cộng khoản này: “the consolidated financial statements of XYZ will reflect 100% of the Total Sales, EBIT, and EBITDA, etc. of the subsidiary ABC even though XYZ only owns 80% of ABC.” Tức mẫu số EBITDA đã tính đủ 100% công ty con, nên tử số EV cũng phải cộng đủ phần vốn của cổ đông thiểu số; nếu quên cộng, kết quả chỉ còn 5.900 / 800 = 7,375 lần, tức bội số bị bóp méo thấp giả tạo.',
      en: 'EV = Market cap + Debt − Cash + Minority interest = 5,000 + 1,200 − 300 + 400 = VND 6,300 billion. EV/EBITDA = 6,300 / 800 = 7.875x. Corporate Finance Institute explains why this add-back is required: “the consolidated financial statements of XYZ will reflect 100% of the Total Sales, EBIT, and EBITDA, etc. of the subsidiary ABC even though XYZ only owns 80% of ABC.” The EBITDA in the denominator already reflects 100% of the subsidiary, so the EV in the numerator must also include the full minority stake; skipping it would give only 5,900 / 800 = 7.375x, an artificially cheap-looking multiple.',
    },
    giai: {
      tinh: { vi: 'EV/EBITDA', en: 'EV to EBITDA ratio' },
      thaySo: { vi: '(5.000 + 1.200 + 400 − 300) ÷ 800', en: '(5000 + 1200 + 400 − 300) ÷ 800' },
      ketQua: { vi: '7,88 lần', en: '7.88 x' },
      gan: [
        {
          kyHieu: 'EV',
          moTa: {
            vi: 'bằng vốn hoá 5.000 cộng nợ vay 1.200 và lợi ích cổ đông thiểu số 400, trừ tiền mặt 300, đơn vị tỷ ₫',
            en: 'is market cap 5000 plus debt 1200 and minority interest 400, minus cash 300, in billions of ₫',
          },
        },
        { kyHieu: 'EBITDA', giaTri: { vi: '800', en: '800' } },
      ],
    },
    source: {
      url: 'https://corporatefinanceinstitute.com/resources/valuation/minority-interest-in-enterprise-value-calculation/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q014',
    formulaId: 'ev-sales',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Sai lầm cốt lõi khi so EV/Sales giữa hai doanh nghiệp khác mô hình kinh doanh là gì?',
    },
    choices: {
      a: { vi: 'Quên trừ tiền mặt' },
      b: { vi: 'Ngầm tin rằng mọi đồng doanh thu đều có khả năng sinh lời như nhau' },
      c: { vi: 'Dùng doanh thu năm cũ' },
      d: { vi: 'Không điều chỉnh lạm phát' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn chỉ ra lỗi gốc là tin “all dollars of revenue are equal in their profit generation potential”, và nhắc rằng chỉ tiêu càng nằm trên cao trong báo cáo kết quả kinh doanh thì càng ít nói về dòng tiền tương lai. Hai doanh nghiệp biên gộp khác hẳn nhau xứng đáng có EV/Sales khác hẳn nhau.',
    },
    source: {
      url: 'https://www.sleeperthoughts.com/post/why-evrev-is-bad',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q322',
    formulaId: 'ev-sales',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Cổ phiếu X có EV/Sales = 1,2 lần, thấp hơn hẳn mức bình quân toàn thị trường (khoảng 2–3 lần). Theo cảnh báo của CFI, kết luận nào đúng?',
      en: "Stock X has an EV/Sales of 1.2x, well below the broad market average (roughly 2–3x). Per CFI's warning, which conclusion is correct?",
    },
    choices: {
      a: {
        vi: 'X chắc chắn đang bị định giá thấp so với thị trường nên nên mua ngay',
        en: 'X is definitely undervalued relative to the market, so it should be bought right away',
      },
      b: {
        vi: '1,2 lần vẫn có thể là mức cao trong chính ngành hẹp của X, nên chưa chắc là khoản đầu tư hấp dẫn',
        en: "1.2x could still be high within X's own niche industry, so it is not necessarily an attractive investment",
      },
      c: {
        vi: 'EV/Sales dưới 2 lần luôn là tín hiệu bán khống',
        en: 'An EV/Sales below 2x is always a short-sell signal',
      },
      d: {
        vi: 'Phải quy đổi EV/Sales sang lãi suất tiết kiệm ngân hàng mới so sánh được',
        en: 'EV/Sales must be converted into a bank deposit rate before it can be compared at all',
      },
    },
    answer: 'b',
    explain: {
      vi: '“A low EV/Sales ratio relative to the general market may actually be quite high in its niche industry and not be an attractive investment.” CFI nhắc phải so trong chính ngành hẹp của doanh nghiệp, không so với mặt bằng thị trường chung — một con số thấp so với cả thị trường vẫn có thể cao so với các đối thủ cùng ngành.',
      en: "“A low EV/Sales ratio relative to the general market may actually be quite high in its niche industry and not be an attractive investment.” CFI stresses comparing within the company's own niche industry rather than against the broad market — a figure that looks low market-wide can still be high among direct peers.",
    },
    source: {
      url: 'https://corporatefinanceinstitute.com/resources/valuation/enterprise-value-to-sales-ev-sales/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q323',
    formulaId: 'ev-sales',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Wall Street Prep dùng ví dụ Tesla, Amazon để minh hoạ điều gì khi đọc một EV/Sales cao hơn hẳn trung bình ngành?',
      en: 'Wall Street Prep uses the Tesla and Amazon examples to illustrate what point about reading an EV/Sales far above the industry average?',
    },
    choices: {
      a: {
        vi: 'Bội số cao luôn đồng nghĩa cổ phiếu đang bị định giá quá cao (overvalued)',
        en: 'A high multiple always means the stock is overvalued',
      },
      b: {
        vi: 'Trả giá cho tăng trưởng là một lựa chọn mang tính chủ quan, nên bội số cao chưa chắc là bằng chứng định giá quá cao',
        en: 'Paying for growth is a subjective decision, so a high multiple does not necessarily prove the stock is overvalued',
      },
      c: {
        vi: 'Bội số cao chỉ xảy ra khi doanh nghiệp gian lận báo cáo tài chính',
        en: 'A high multiple only happens when a company commits accounting fraud',
      },
      d: {
        vi: 'Tesla và Amazon là hai ví dụ về cổ phiếu bị thị trường định giá sai vĩnh viễn',
        en: 'Tesla and Amazon are two stocks the market has permanently mispriced',
      },
    },
    answer: 'b',
    explain: {
      vi: "“one significant limitation of the metric is that paying for growth is a subjective decision and just because a company's multiple is high, it does NOT necessarily indicate the company is overvalued (e.g. Tesla, Amazon).” Việc trả giá cao cho tăng trưởng tương lai là đánh giá chủ quan của thị trường, không phải bằng chứng khách quan rằng cổ phiếu đang đắt.",
      en: "“one significant limitation of the metric is that paying for growth is a subjective decision and just because a company's multiple is high, it does NOT necessarily indicate the company is overvalued (e.g. Tesla, Amazon).” Paying a premium for future growth is a subjective market judgment, not objective proof that a stock is expensive.",
    },
    source: {
      url: 'https://www.wallstreetprep.com/knowledge/ev-revenue-multiple/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q324',
    formulaId: 'ev-sales',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Vẫn theo Damodaran, những trường hợp nào khiến lỗi "internally inconsistent" của P/Sales (so với EV/Sales) gây sai lệch KHÔNG đáng kể, nên giới phân tích vẫn "thoát" được khi dùng nó?',
      en: 'Still per Damodaran, in which situations does P/Sales\' "internally inconsistent" flaw (relative to EV/Sales) cause negligible distortion, letting analysts "get away with" using it?',
    },
    choices: {
      a: {
        vi: 'Ngành công nghệ, nơi doanh nghiệp gần như không vay nợ',
        en: 'The technology sector, where firms carry almost no debt',
      },
      b: {
        vi: 'Ngành bán lẻ, nơi các doanh nghiệp so sánh có đòn bẩy tài chính tương đồng nhau',
        en: 'The retail sector, where the firms being compared have similar financial leverage',
      },
      c: {
        vi: 'Ngành ngân hàng, nơi nợ vay chiếm phần lớn tổng tài sản',
        en: 'The banking sector, where borrowed funds make up most of total assets',
      },
      d: {
        vi: 'Doanh nghiệp mới niêm yết, chưa có lịch sử báo cáo tài chính',
        en: 'Recently listed companies with no financial reporting history yet',
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: '“Analysts have historically been able to get away with this inconsistency because they have used it in sectors with no debt (technology) or sectors where financial leverage is similar (retail).” Khi nợ gần bằng 0 (công nghệ) hoặc đòn bẩy giữa các doanh nghiệp so sánh gần giống nhau (bán lẻ), phần "lệch" do P/Sales bỏ qua nợ trở nên không đáng kể; ngân hàng — nơi nợ chiếm phần lớn tài sản — không nằm trong nhóm này.',
      en: '“Analysts have historically been able to get away with this inconsistency because they have used it in sectors with no debt (technology) or sectors where financial leverage is similar (retail).” When debt is close to zero (technology) or leverage is similar across the compared firms (retail), the distortion from P/Sales ignoring debt becomes negligible; banking, where debt makes up most of total assets, is not in this group.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/valonlineslides/session18.pdf',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q325',
    formulaId: 'ev-sales',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Trong bài giảng Session 18 (NYU Stern), Damodaran gọi P/Sales là "internally inconsistent". Lý do là gì?',
      en: 'In Session 18 of his NYU Stern lecture, Damodaran calls P/Sales "internally inconsistent". What is the reason?',
    },
    choices: {
      a: {
        vi: 'Tử số P/Sales (vốn hoá) chỉ thuộc về cổ đông, còn mẫu số (doanh thu) được tạo ra từ cả vốn nợ lẫn vốn chủ — lệch đối tượng sở hữu, còn EV ở tử số EV/Sales đại diện cho cả hai',
        en: "P/Sales' numerator (market cap) belongs only to shareholders while its denominator (revenue) is generated by both debt and equity capital — a claimholder mismatch; EV/Sales' numerator (EV) represents both",
      },
      b: {
        vi: 'Vì P/Sales chỉ tính được cho công ty niêm yết, còn EV/Sales tính được cho cả công ty tư nhân',
        en: 'P/Sales can only be computed for listed companies, while EV/Sales also works for private companies',
      },
      c: {
        vi: 'Vì doanh thu dùng cho P/Sales lấy theo quý còn EV/Sales lấy theo năm tài chính',
        en: 'P/Sales uses quarterly revenue while EV/Sales uses fiscal-year revenue',
      },
      d: {
        vi: 'Vì P/Sales không được các chuẩn kế toán quốc tế công nhận',
        en: 'P/Sales is not recognized under international accounting standards',
      },
    },
    answer: 'a',
    explain: {
      vi: '“The price/sales ratio is internally inconsistent, since the market value of equity is divided by the total revenues of the firm.” Vốn hoá (tử số P/Sales) chỉ thuộc về cổ đông, nhưng doanh thu (mẫu số) do toàn bộ tài sản — gồm cả phần tài trợ bằng nợ — tạo ra. EV/Sales nhất quán hơn vì EV đại diện cho giá trị của cả cổ đông lẫn chủ nợ.',
      en: "“The price/sales ratio is internally inconsistent, since the market value of equity is divided by the total revenues of the firm.” Market cap (P/Sales' numerator) belongs only to shareholders, yet revenue (the denominator) is generated by all assets, including debt-financed ones. EV/Sales is consistent because EV represents value claimed by both shareholders and lenders.",
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/valonlineslides/session18.pdf',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q015',
    formulaId: 'peg',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'PEG = 0,8. Vì sao đây chưa phải bằng chứng cổ phiếu là món hời?' },
    choices: {
      a: { vi: 'Vì PEG chỉ dùng cho công ty Mỹ' },
      b: { vi: 'Vì PEG không tính giá trị thời gian của tiền và không giả định gì về tái đầu tư' },
      c: { vi: 'Vì PEG luôn nhỏ hơn 1' },
      d: { vi: 'Vì PEG cần P/E trên 20 mới có nghĩa' },
    },
    answer: 'b',
    explain: {
      vi: "Vì PEG chia bội số cho tốc độ tăng trưởng mà không chiết khấu gì cả: một đồng lợi nhuận của năm thứ năm được tính ngang một đồng của năm nay, nên mức tăng trưởng thật sự cần để hoà vốn lớn hơn nhiều so với điều PEG gợi ý. “The PEG ratio doesn't account for the time value of money”, và “you still need much more massive earnings growth than the PEG ratio would imply you need”.",
      en: "Because PEG divides a multiple by a growth rate and discounts nothing: a unit of profit five years out counts the same as a unit today, so the growth actually needed to break even is far above what PEG implies. The source: “The PEG ratio doesn't account for the time value of money”, and “you still need much more massive earnings growth than the PEG ratio would imply you need”.",
    },
    source: {
      url: 'https://www.fa-mag.com/news/the-fallacy-of-peg-ratios-6544.html',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q016',
    formulaId: 'peg',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Rủi ro lớn nhất khi lấy tốc độ tăng trưởng mấy năm gần nhất làm G trong PEG là gì?',
    },
    choices: {
      a: { vi: 'G quá khứ luôn thấp hơn thực tế' },
      b: { vi: 'PEG thừa hưởng toàn bộ sai số của một con số không ai dự báo nổi' },
      c: { vi: 'G phải tính theo quý' },
      d: { vi: 'G không được vượt 10%' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn tiếng Việt: “không có 1 công thức cụ thể nào giúp xác định chính xác con số này”, và với G quá khứ cao thì đặt câu hỏi ngược: “bạn có dám chắc, con số 50% này sẽ kéo dài trong dài hạn?”',
    },
    source: {
      url: 'https://govalue.vn/chi-so-peg/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q326',
    formulaId: 'peg',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: "Trong nhóm ngành đồ uống, Hansen Natural có PEG thấp nhất nhóm (0,57) nhờ tăng trưởng EPS kỳ vọng 17%, nhưng độ lệch chuẩn giá cổ phiếu của hãng lên tới 62,45% — cao nhất nhóm. Theo phân tích của Damodaran, PEG thấp nhất nhóm có chắc chắn là cổ phiếu 'rẻ' nhất không?",
      en: "In the beverage sector, Hansen Natural has the lowest PEG in the group (0.57) thanks to a 17% expected EPS growth rate, but its stock price standard deviation is 62.45% — the highest in the group. Per Damodaran's analysis, does the lowest PEG in a group necessarily mean the 'cheapest' stock?",
    },
    facts: [
      {
        label: {
          vi: 'PEG của Hansen Natural (thấp nhất nhóm)',
          en: "Hansen Natural's PEG (lowest in the group)",
        },
        value: { vi: '0,57 lần', en: '0.57x' },
      },
      {
        label: {
          vi: 'Tăng trưởng EPS kỳ vọng của Hansen Natural',
          en: "Hansen Natural's expected EPS growth rate",
        },
        value: { vi: '17%', en: '17%' },
      },
      {
        label: {
          vi: 'Độ lệch chuẩn giá cổ phiếu của Hansen Natural (đại diện rủi ro, cao nhất nhóm)',
          en: "Hansen Natural's stock price standard deviation (risk proxy, highest in the group)",
        },
        value: { vi: '62,45%', en: '62.45%' },
      },
    ],
    choices: {
      a: {
        vi: 'Có, PEG thấp nhất luôn là cổ phiếu bị định giá thấp nhất',
        en: 'Yes, the lowest PEG is always the most undervalued stock',
      },
      b: {
        vi: 'Không chắc — công ty rủi ro cao thường có PEG thấp hơn hẳn công ty rủi ro thấp dù tăng trưởng bằng nhau, nên PEG thấp nhất nhóm có thể chính là cổ phiếu rủi ro nhất',
        en: 'Not necessarily — high-risk companies trade at much lower PEG ratios than low-risk companies with the same growth rate, so the lowest PEG in a group could belong to its riskiest firm',
      },
      c: {
        vi: 'Không, vì PEG chỉ áp dụng được cho ngành công nghệ',
        en: 'No, because PEG only applies to the technology sector',
      },
      d: {
        vi: 'Có, miễn là tăng trưởng trên 15%/năm',
        en: 'Yes, as long as growth exceeds 15% per year',
      },
    },
    answer: 'b',
    explain: {
      vi: "Damodaran chỉ rõ: “Proposition 1: High risk companies will trade at much lower PEG ratios than low risk companies with the same expected growth rate. Corollary 1: The company that looks most under valued on a PEG ratio basis in a sector may be the riskiest firm in the sector.” Đúng như vậy: PEG thấp nhất nhóm ngành đồ uống (0,57) thuộc về Hansen Natural — công ty có độ lệch chuẩn giá cổ phiếu cao nhất (62,45%), tức rủi ro cao nhất, chứ không hẳn là công ty 'rẻ' nhất.",
      en: "Damodaran states it directly: “Proposition 1: High risk companies will trade at much lower PEG ratios than low risk companies with the same expected growth rate. Corollary 1: The company that looks most under valued on a PEG ratio basis in a sector may be the riskiest firm in the sector.” Indeed, the lowest PEG in the beverage-sector group (0.57) belongs to Hansen Natural — the company with the highest stock price standard deviation (62.45%), i.e., the highest risk, not necessarily the 'cheapest' one.",
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/eqnotes/peg.pdf',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q327',
    formulaId: 'peg',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Trong công thức PEG, những điều kiện nào dưới đây khiến chỉ số này mang giá trị âm và mất ý nghĩa để định giá? (chọn đủ các đáp án đúng)',
      en: 'In the PEG formula, which of the following conditions make the ratio negative and meaningless for valuation? (select all that apply)',
    },
    choices: {
      a: {
        vi: 'P/E đang âm vì doanh nghiệp làm ăn thua lỗ',
        en: 'P/E is negative because the company is posting a loss',
      },
      b: {
        vi: 'Tốc độ tăng trưởng G dự phóng âm, tức tăng trưởng tương lai được dự đoán thấp hơn hiện tại và quá khứ',
        en: 'The projected growth rate G is negative, meaning future growth is expected to be lower than both current and past growth',
      },
      c: {
        vi: 'Cổ phiếu vừa thực hiện chia tách (stock split) làm tăng số lượng cổ phiếu lưu hành',
        en: 'The stock just went through a split, increasing the number of shares outstanding',
      },
      d: {
        vi: 'P/E của doanh nghiệp đang cao hơn trung bình ngành',
        en: "The company's P/E is higher than the industry average",
      },
    },
    answers: ['a', 'b'],
    explain: {
      vi: 'Nguồn nêu đúng hai trường hợp khiến PEG âm: “P/E âm tức là doanh nghiệp đang làm ăn thua lỗ và lúc này chỉ số không có ý nghĩa về định giá và kinh tế” và “G âm: Nhà đầu tư dự đoán mức tăng trưởng trong tương lai sẽ thấp hơn mức tăng trưởng của hiện tại và quá khứ”. Chia tách cổ phiếu hay P/E cao hơn trung bình ngành không tự nó làm PEG âm.',
      en: 'The source names exactly two cases that make PEG negative: “P/E âm tức là doanh nghiệp đang làm ăn thua lỗ và lúc này chỉ số không có ý nghĩa về định giá và kinh tế” and “G âm: Nhà đầu tư dự đoán mức tăng trưởng trong tương lai sẽ thấp hơn mức tăng trưởng của hiện tại và quá khứ”. A stock split or a P/E above the industry average does not by itself make PEG negative.',
    },
    source: {
      url: 'https://www.dnse.com.vn/hoc/chi-so-peg-la-gi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q017',
    formulaId: 'von-hoa-thi-truong',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Mã A giá 8.000 đồng, mã B giá 120.000 đồng. Kết luận nào đúng?' },
    choices: {
      a: { vi: 'A rẻ hơn B' },
      b: { vi: 'B là doanh nghiệp lớn hơn' },
      c: { vi: 'Không kết luận được gì — thị giá phụ thuộc số cổ phiếu lưu hành' },
      d: { vi: 'A có thanh khoản tốt hơn' },
    },
    answer: 'c',
    explain: {
      vi: 'Đây là “ảo giác giá rẻ” mà CTCK Phú Hưng cảnh báo: “thị giá thấp không đồng nghĩa với cổ phiếu rẻ nếu giá trị nội tại không tương xứng”; đánh giá chỉ dựa trên thị giá mà bỏ qua EPS, ROE hay năng lực tạo dòng tiền “có thể khiến nhà đầu tư dễ rơi vào bẫy định giá”.',
    },
    source: {
      url: 'https://www.phs.vn/tin-tuc/bung-no-co-phieu-luu-hanh-va-bai-toan-giu-gia-tri-that-cho-nha-dau-tu/6312838',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q018',
    formulaId: 'von-hoa-thi-truong',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Bạn nhận cổ phiếu thưởng tỷ lệ 20%. Tài sản của bạn thay đổi thế nào ngay tại thời điểm đó?',
    },
    choices: {
      a: { vi: 'Tăng 20%' },
      b: { vi: 'Không đổi — giá tham chiếu bị điều chỉnh tương ứng' },
      c: { vi: 'Giảm 20%' },
      d: { vi: 'Tăng 20% nhưng phải nộp thuế 5%' },
    },
    answer: 'b',
    explain: {
      vi: 'Không có dòng tiền mới vào doanh nghiệp. Nguồn cảnh báo hệ quả dài hạn: “Khi số lượng cổ phiếu tăng quá nhanh và quá nhiều, giá trị lợi nhuận trên mỗi cổ phần (EPS) giảm sút... có thể làm thị giá cổ phiếu bị điều chỉnh, thậm chí lao dốc nếu kết quả kinh doanh không cải thiện tương ứng”.',
    },
    source: {
      url: 'https://www.phs.vn/tin-tuc/bung-no-co-phieu-luu-hanh-va-bai-toan-giu-gia-tri-that-cho-nha-dau-tu/6312838',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q328',
    formulaId: 'von-hoa-thi-truong',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Doanh nghiệp A và doanh nghiệp B có vốn hóa thị trường bằng nhau, nhưng A gần như không vay nợ còn B vay nợ rất lớn. Theo đúng định nghĩa, vốn hóa thị trường bằng nhau ở đây nói lên điều gì?',
      en: 'Company A and Company B have the same market capitalization, but A carries almost no debt while B is heavily leveraged. By definition, what does an equal market cap actually tell you here?',
    },
    choices: {
      a: {
        vi: 'A và B có giá trị doanh nghiệp (EV) bằng nhau',
        en: 'A and B have equal enterprise value (EV)',
      },
      b: {
        vi: 'Thị trường chỉ đang định giá phần vốn cổ phần của A và B bằng nhau; số tiền phải bỏ ra để mua trọn cả doanh nghiệp, gồm cả nợ, có thể rất khác nhau',
        en: "The market is pricing only A and B's equity at the same level; the amount needed to buy each business outright, debt included, can differ greatly",
      },
      c: {
        vi: 'B đang bị thị trường định giá rẻ hơn A',
        en: 'B is priced cheaper by the market than A',
      },
      d: {
        vi: 'Vốn hóa thị trường đã cộng cả nợ vay, nên A và B thực chất giống hệt nhau',
        en: 'Market cap already includes debt, so A and B are effectively identical',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Vốn hóa thị trường chỉ là phần vốn cổ phần, không phải toàn bộ doanh nghiệp. VietstockPedia ghi rõ: “Trong khi đó, chỉ tiêu Vốn hóa thị trường (Market Capitalization) chỉ cho biết đánh giá của thị trường về giá trị cổ phần”, còn Giá trị doanh nghiệp (EV) — vốn hóa cộng nợ vay, trừ tiền mặt — mới là con số mà nguồn định nghĩa: “EV là giá trị phải bỏ ra để mua toàn bộ vốn cổ phần, nợ vay của doanh nghiệp”. Hai công ty vốn hóa bằng nhau nhưng đòn bẩy nợ khác nhau vẫn có thể có EV rất khác nhau.',
      en: 'Market cap prices only the equity slice of a company, not the whole business. VietstockPedia states: “Trong khi đó, chỉ tiêu Vốn hóa thị trường (Market Capitalization) chỉ cho biết đánh giá của thị trường về giá trị cổ phần”, while Enterprise Value — market cap plus debt, minus cash — is defined by the source as: “EV là giá trị phải bỏ ra để mua toàn bộ vốn cổ phần, nợ vay của doanh nghiệp”. Two companies with equal market caps but different leverage can still end up with very different enterprise values.',
    },
    source: {
      url: 'https://pedia.vietstock.vn/44/Phan-tich-co-ban/1979/Gia-tri-doanh-nghiep',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q329',
    formulaId: 'von-hoa-thi-truong',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Cổ phiếu HPG (chốt phiên 27/07/2018) có giá 37.300 đồng/cổ phiếu, số lượng cổ phiếu đang lưu hành 2.123.907.166 cổ phiếu, tỷ lệ free-float thực tế 56,19%. Theo quy tắc làm tròn tỷ lệ free-float của HOSE cho vùng từ 15% trở lên (làm tròn LÊN theo bước 5%), vốn hóa thị trường điều chỉnh theo tỷ lệ free-float (đã làm tròn) của HPG là bao nhiêu tỷ đồng?',
      en: "HPG stock (closing 27 Jul 2018) trades at VND 37,300/share, with 2,123,907,166 shares outstanding and an actual free-float ratio of 56.19%. Under HOSE's free-float rounding rule for ratios of 15% or higher (round UP to the nearest 5% step), what is HPG's free-float-adjusted market capitalization, in billion VND?",
    },
    facts: [
      {
        label: { vi: 'Giá cổ phiếu', en: 'Share price' },
        value: { vi: '37.300 đồng/cổ phiếu', en: 'VND 37,300/share' },
      },
      {
        label: { vi: 'Số lượng cổ phiếu đang lưu hành', en: 'Shares outstanding' },
        value: { vi: '2.123.907.166 cổ phiếu', en: '2,123,907,166 shares' },
      },
      {
        label: { vi: 'Tỷ lệ free-float thực tế', en: 'Actual free-float ratio' },
        value: { vi: '56,19%', en: '56.19%' },
      },
      {
        label: {
          vi: 'Quy tắc làm tròn (free-float ≥ 15%)',
          en: 'Rounding rule (free float ≥ 15%)',
        },
        value: { vi: 'làm tròn LÊN theo bước 5%', en: 'round UP to the nearest 5% step' },
      },
    ],
    choices: {
      a: { vi: '79.222 tỷ đồng', en: 'VND 79,222 billion' },
      b: { vi: '47.533 tỷ đồng', en: 'VND 47,533 billion' },
      c: { vi: '44.514 tỷ đồng', en: 'VND 44,514 billion' },
      d: { vi: '43.572 tỷ đồng', en: 'VND 43,572 billion' },
    },
    answer: 'b',
    explain: {
      vi: "Vốn hóa thị trường (chưa điều chỉnh) = 37.300 × 2.123.907.166 ≈ 79.222 tỷ đồng — đây là con số công thức 'Vốn hóa thị trường' trong thư viện tính ra. Tỷ lệ free-float thực tế 56,19% rơi vào vùng ≥15%, mà nguồn nêu rõ: “Riêng các Mã Chứng khoán khác có Tỷ lệ Free-Float thực tế từ 15% trở lên vẫn được làm tròn lên theo bước là 5%”, nên làm tròn thành 60%. Áp dụng đúng ví dụ HPG, nguồn tính sẵn: “79.222 tỷ đồng x 60% = 47.533 tỷ đồng”. Đây là vốn hóa điều chỉnh free-float — con số các Sở Giao dịch Chứng khoán dùng để tính trọng số cổ phiếu trong VN-Index, VN30…, khác với vốn hóa thị trường thô mà công thức này tính. Ba đáp án còn lại là ba lỗi hay gặp: 79.222 là vốn hóa thô, chưa điều chỉnh free-float; 44.514 là dùng tỷ lệ thực tế 56,19% mà bỏ qua bước làm tròn; 43.572 là làm tròn XUỐNG 55% trong khi quy tắc đòi làm tròn LÊN.",
      en: "Raw market capitalization = VND 37,300 × 2,123,907,166 shares ≈ VND 79,222 billion — the figure this library's 'Market capitalization' formula itself produces. HPG's actual free-float ratio of 56.19% falls in the ≥15% bracket, and the source states: “Riêng các Mã Chứng khoán khác có Tỷ lệ Free-Float thực tế từ 15% trở lên vẫn được làm tròn lên theo bước là 5%”, so it rounds UP to 60%. Applying that to the HPG example, the source already computes: “79.222 tỷ đồng x 60% = 47.533 tỷ đồng”. That free-float-adjusted figure is what Vietnam's exchanges use to weight a stock inside VN-Index, VN30, and similar indices — not the raw market cap that this formula calculates. The other three are common slips: 79,222 is the raw market cap with no free-float adjustment; 44,514 uses the actual 56.19% ratio and skips the rounding step; 43,572 rounds DOWN to 55% when the rule calls for rounding UP.",
    },
    source: {
      url: 'https://www.chungkhoanonline.com.vn/ty-le-free-float-va-von-hoa-thi-truong-dieu-chinh-ty-le-free-float/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q330',
    formulaId: 'von-hoa-thi-truong',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một doanh nghiệp có giá cổ phiếu 25.000 đồng và 800 triệu cổ phiếu đang lưu hành, tức vốn hóa thị trường 20.000 tỷ đồng. Theo tiêu chuẩn phân loại vốn hóa (MKC) mà Vietstock áp dụng tại Việt Nam, doanh nghiệp này thuộc nhóm nào?',
      en: 'A company has a share price of VND 25,000 and 800 million shares outstanding, i.e. a market cap of VND 20,000 billion. Under the market-cap (MKC) classification standard Vietstock applies in Vietnam, which group does this company fall into?',
    },
    choices: {
      a: { vi: 'Vốn hóa siêu nhỏ (Micro Cap)', en: 'Micro Cap' },
      b: { vi: 'Vốn hóa nhỏ (Small Cap)', en: 'Small Cap' },
      c: { vi: 'Vốn hóa vừa (Mid Cap)', en: 'Mid Cap' },
      d: { vi: 'Vốn hóa lớn (Large Cap)', en: 'Large Cap' },
    },
    answer: 'd',
    explain: {
      vi: '20.000 tỷ đồng vượt ngưỡng Large Cap. Nguồn dẫn tiêu chuẩn Vietstock: “Dựa vào thực tiễn tại Việt Nam, Vietstock phân loại cổ phiếu theo tiêu chuẩn vốn hóa thị trường (Market Capitalization, MKC) thành 4 nhóm: cổ phiếu vốn hóa lớn (large cap), vốn hóa vừa (mid cap), vốn hóa nhỏ (small cap) và vốn hóa siêu nhỏ (micro cap)”, với ngưỡng Large Cap ghi là “MKC > 10.000 tỷ đồng”. Đây là quy ước riêng của một tổ chức dữ liệu, không phải chuẩn pháp lý thống nhất — tổ chức khác có thể đặt ngưỡng khác.',
      en: "VND 20,000 billion clears the Large Cap cutoff. The source cites Vietstock's standard: “Dựa vào thực tiễn tại Việt Nam, Vietstock phân loại cổ phiếu theo tiêu chuẩn vốn hóa thị trường (Market Capitalization, MKC) thành 4 nhóm: cổ phiếu vốn hóa lớn (large cap), vốn hóa vừa (mid cap), vốn hóa nhỏ (small cap) và vốn hóa siêu nhỏ (micro cap)”, with the Large Cap threshold given as “MKC > 10.000 tỷ đồng”. This is one data provider's own convention, not a unified legal standard — another provider may draw the line differently.",
    },
    source: {
      url: 'https://tpbs.com.vn/vi/blog/kien-thuc/kien-thuc-dau-tu/nhom-co-phieu-largecaps-midcaps-smallcaps-microcaps-la-gi?postId=244',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q019',
    formulaId: 'so-graham',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Cách dùng Số Graham bị phê phán nhiều nhất là gì?' },
    choices: {
      a: { vi: 'Dùng một mình, tách khỏi các tiêu chí phòng thủ còn lại' },
      b: { vi: 'Dùng cho công ty công nghệ' },
      c: { vi: 'Dùng hệ số 22,5' },
      d: { vi: 'Dùng EPS thay vì EBIT' },
    },
    answer: 'a',
    explain: {
      vi: "Lỗi bị phê phán nhiều nhất là dùng Số Graham một mình, tách khỏi năm tiêu chí còn lại mà Graham đặt cho nhóm cổ phiếu phòng thủ. “The most common misuse of the Graham Number today is that it's used in isolation almost everywhere, while the five other supporting criteria for Defensive stock selection are completely ignored”. Lấy số liệu đúng một năm để tính cũng bị chính nguồn ấy gọi là “is not only excessively simplistic, but also potentially dangerous”.",
      en: "The most criticised error is using the Graham Number on its own, detached from the five other criteria Graham set for defensive stock selection. The source: “The most common misuse of the Graham Number today is that it's used in isolation almost everywhere, while the five other supporting criteria for Defensive stock selection are completely ignored”. Computing it from a single year of figures is, in the same source, “not only excessively simplistic, but also potentially dangerous”.",
    },
    source: {
      url: 'https://www.grahamvalue.com/article/using-graham-number-correctly',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q331',
    formulaId: 'so-graham',
    format: 'chon-nhieu',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Theo mục hạn chế (Limitations) của Số Graham được tổng hợp trên Wikipedia, những điều kiện nào dưới đây khiến Số Graham mất tác dụng hoặc kém tin cậy? (chọn tất cả đáp án đúng)',
      en: 'According to the Limitations section for the Graham number summarized on Wikipedia, which of the following conditions make the Graham number lose its meaning or become unreliable? (select all that apply)',
    },
    choices: {
      a: {
        vi: 'EPS hoặc giá trị sổ sách mỗi cổ phiếu (BVPS) bị âm',
        en: 'EPS or book value per share (BVPS) is negative',
      },
      b: {
        vi: 'Cổ phiếu tăng trưởng cao, nhất là ngành công nghệ, nơi phần lớn giá trị đến từ lợi nhuận tương lai',
        en: 'High-growth stocks, especially in technology, where much of the value comes from expected future earnings',
      },
      c: {
        vi: 'Tổ chức tài chính, quỹ đầu tư bất động sản (REIT) và doanh nghiệp ít tài sản hữu hình, nơi giá trị sổ sách không phản ánh đúng giá trị kinh tế thực',
        en: 'Financial institutions, REITs, and asset-light businesses, where book value does not reflect true economic value',
      },
      d: {
        vi: 'Cổ phiếu có vốn hoá dưới 1.000 tỷ đồng',
        en: 'Stocks with a market capitalization below VND 1,000 billion',
      },
    },
    answers: ['a', 'b', 'c'],
    explain: {
      vi: "Wikipedia liệt kê đúng ba hạn chế này. Về tăng trưởng: “The formula does not account for future earnings growth, making it unsuitable for evaluating growth stocks, particularly in sectors such as technology where much of a company's value derives from expected future earnings.” Về giá trị âm: “The equation requires both positive earnings per share and positive book value per share. Companies with negative earnings or negative equity produce an undefined result under the square root, making the metric inapplicable.” Về ngành nghề: “The metric is most applicable to industrial and manufacturing companies. It is less useful for financial institutions, REITs, and asset-light businesses where book value may not reflect the company's true economic value.” Đáp án d (ngưỡng vốn hoá) không nằm trong danh sách hạn chế nào được nguồn nêu ra.",
      en: "Wikipedia lists exactly these three limitations. On growth: “The formula does not account for future earnings growth, making it unsuitable for evaluating growth stocks, particularly in sectors such as technology where much of a company's value derives from expected future earnings.” On negative values: “The equation requires both positive earnings per share and positive book value per share. Companies with negative earnings or negative equity produce an undefined result under the square root, making the metric inapplicable.” On sector: “The metric is most applicable to industrial and manufacturing companies. It is less useful for financial institutions, REITs, and asset-light businesses where book value may not reflect the company's true economic value.” Choice d (a market-cap threshold) is not among any limitation the source states.",
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Graham_number',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q332',
    formulaId: 'so-graham',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một doanh nghiệp có EPS ba năm gần nhất lần lượt là: năm nay 2.000 ₫, năm ngoái 8.000 ₫, năm trước nữa 5.000 ₫ (năm nay lợi nhuận giảm mạnh vì một khoản chi phí bất thường). Giá trị sổ sách mỗi cổ phiếu (BVPS) hiện tại là 30.000 ₫. Benjamin Graham khuyến nghị dùng thu nhập bình quân nhiều năm thay vì chỉ lấy năm gần nhất, nên công thức dưới đây lấy trung bình ba năm. Điền ba mức EPS và BVPS vào đúng ô trống.',
      en: "A company's EPS for the last three years is: this year ₫2,000, last year ₫8,000, and the year before that ₫5,000 (this year's profit fell sharply because of a one-time charge). Book value per share (BVPS) is currently ₫30,000. Benjamin Graham recommends average earnings over several years rather than just the latest year, so the formula below averages three years. Put the three EPS figures and the BVPS into the right slots.",
    },
    facts: [
      { label: { vi: 'EPS năm nay', en: 'EPS this year' }, value: { vi: '2.000 ₫', en: '₫2,000' } },
      {
        label: { vi: 'EPS năm ngoái', en: 'EPS last year' },
        value: { vi: '8.000 ₫', en: '₫8,000' },
      },
      {
        label: { vi: 'EPS năm trước nữa', en: 'EPS two years ago' },
        value: { vi: '5.000 ₫', en: '₫5,000' },
      },
      {
        label: { vi: 'Giá trị sổ sách mỗi cổ phiếu (BVPS)', en: 'Book value per share (BVPS)' },
        value: { vi: '30.000 ₫', en: '₫30,000' },
      },
    ],
    expected: 58094.75,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Số Graham = √(22,5 × ([2.000] + [8.000] + [5.000]) ÷ 3 × [30.000])',
      en: 'Graham Number = √(22.5 × ([2000] + [8000] + [5000]) ÷ 3 × [30000])',
    },
    explain: {
      vi: "EPS bình quân 3 năm = (2.000 + 8.000 + 5.000) / 3 = 5.000 ₫. Số Graham = √(22,5 × 5.000 × 30.000) ≈ 58.094,75 ₫. Nếu chỉ lấy EPS năm nay (2.000 ₫) — năm lợi nhuận bị bóp méo bởi chi phí bất thường — kết quả sẽ chỉ khoảng 36.742 ₫, thấp hơn hẳn và dễ khiến cổ phiếu bị đánh giá là 'đắt' một cách sai lệch. Nguồn trích lời Benjamin Graham trong The Intelligent Investor: “In former times analysts and investors paid considerable attention to the average earnings over a fairly long period in the past— usually from seven to ten years.” — tức Graham khuyến nghị lấy thu nhập bình quân nhiều năm, không phải một năm đơn lẻ, để tính các phép định giá kiểu Số Graham.",
      en: "Three-year average EPS = (₫2,000 + ₫8,000 + ₫5,000) / 3 = ₫5,000. Graham number = √(22.5 × 5,000 × 30,000) ≈ ₫58,094.75. Using only this year's EPS (₫2,000) — a year distorted by a one-time charge — would give only about ₫36,742, making the stock look misleadingly 'expensive' by comparison. The source quotes Benjamin Graham in The Intelligent Investor: “In former times analysts and investors paid considerable attention to the average earnings over a fairly long period in the past— usually from seven to ten years.” — that is, Graham recommended using earnings averaged over several years, not a single year, for Graham-number-style valuations.",
    },
    giai: {
      tinh: { vi: 'Số Graham', en: 'Graham number' },
      thaySo: {
        vi: '√(22,5 × (2.000 + 8.000 + 5.000) ÷ 3 × 30.000)',
        en: '√(22.5 × (2000 + 8000 + 5000) ÷ 3 × 30000)',
      },
      ketQua: { vi: '58.094,75 ₫', en: '58094.75 ₫' },
      gan: [
        {
          kyHieu: 'EPS',
          moTa: {
            vi: 'lấy bình quân ba năm 2.000, 8.000 và 5.000 ₫',
            en: 'is the three-year average of 2000, 8000 and 5000 ₫',
          },
        },
        { kyHieu: 'BVPS', giaTri: { vi: '30.000', en: '30000' } },
      ],
    },
    source: {
      url: 'https://stablebread.com/graham-number/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q333',
    formulaId: 'so-graham',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một ngân hàng có EPS = 4.000 ₫/cổ phiếu. Giá trị sổ sách mỗi cổ phiếu (BVPS) theo báo cáo là 40.000 ₫, trong đó 8.000 ₫ là lợi thế thương mại (goodwill) từ các thương vụ mua lại trước đây. Khi ngân hàng có goodwill đáng kể thì nên dùng giá trị sổ sách HỮU HÌNH (loại goodwill) làm phép đối chiếu thận trọng hơn, nên công thức dưới đây trừ goodwill ra khỏi BVPS. Điền ba con số vào đúng ô trống.',
      en: 'A bank has EPS = ₫4,000 per share. Reported book value per share (BVPS) is ₫40,000, of which ₫8,000 is goodwill from past acquisitions. When a bank carries significant goodwill, TANGIBLE book value (excluding goodwill) is the more conservative cross-check, so the formula below subtracts goodwill from BVPS. Put the three figures into the right slots.',
    },
    facts: [
      { label: { vi: 'EPS', en: 'EPS' }, value: { vi: '4.000 ₫', en: '₫4,000' } },
      {
        label: { vi: 'BVPS báo cáo (gồm cả goodwill)', en: 'Reported BVPS (including goodwill)' },
        value: { vi: '40.000 ₫', en: '₫40,000' },
      },
      {
        label: { vi: 'Goodwill mỗi cổ phiếu', en: 'Goodwill per share' },
        value: { vi: '8.000 ₫', en: '₫8,000' },
      },
    ],
    expected: 53665.63,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Số Graham = √(22,5 × [4.000] × ([40.000] − [8.000]))',
      en: 'Graham Number = √(22.5 × [4000] × ([40000] − [8000]))',
    },
    explain: {
      vi: "BVPS hữu hình = 40.000 − 8.000 = 32.000 ₫. Số Graham = √(22,5 × 4.000 × 32.000) ≈ 53.665,63 ₫ — thấp hơn hẳn mức 60.000 ₫ nếu dùng nguyên BVPS báo cáo (đã gồm goodwill). Nguồn cảnh báo: “Because the Graham Number uses BVPS rather than tangible book value per share (TBVPS), banks with substantial goodwill from acquisitions may show an inflated result.” Dùng BVPS gộp cả goodwill mà không đối chiếu bằng TBVPS sẽ khiến một ngân hàng tăng trưởng nhờ mua lại trông 'rẻ' hơn thực tế.",
      en: 'Tangible BVPS = ₫40,000 − ₫8,000 = ₫32,000. Graham number = √(22.5 × 4,000 × 32,000) ≈ ₫53,665.63 — notably lower than the ₫60,000 result obtained using the reported BVPS that still includes goodwill. The source warns: “Because the Graham Number uses BVPS rather than tangible book value per share (TBVPS), banks with substantial goodwill from acquisitions may show an inflated result.” Using BVPS that still includes goodwill without cross-checking against TBVPS makes an acquisition-heavy bank look cheaper than it actually is.',
    },
    giai: {
      tinh: { vi: 'Số Graham', en: 'Graham number' },
      thaySo: { vi: '√(22,5 × 4.000 × (40.000 − 8.000))', en: '√(22.5 × 4000 × (40000 − 8000))' },
      ketQua: { vi: '53.665,63 ₫', en: '53665.63 ₫' },
      gan: [
        { kyHieu: 'EPS', giaTri: { vi: '4.000', en: '4000' } },
        {
          kyHieu: 'BVPS',
          moTa: {
            vi: 'là giá trị sổ sách đã bỏ goodwill: 40.000 trừ 8.000 ₫',
            en: 'is book value with goodwill removed: 40000 minus 8000 ₫',
          },
        },
      ],
    },
    source: {
      url: 'https://banksift.org/valuation/graham-number',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q334',
    formulaId: 'so-graham',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Một nhà đầu tư thấy giá cổ phiếu đang thấp hơn Số Graham đúng 3% và kết luận: "Đây chính là mức giá trị hợp lý chính xác, 3% chênh lệch là biên an toàn cụ thể tôi có được." Theo Wikipedia, cách hiểu Số Graham như vậy sai ở đâu?',
      en: 'An investor notices the market price is exactly 3% below the Graham number and concludes: "This is the precise fair value, and the 3% gap is my exact margin of safety." According to Wikipedia, what is wrong with reading the Graham number this way?',
    },
    choices: {
      a: {
        vi: 'Không sai — Số Graham vốn được thiết kế để cho ra một mức giá trị hợp lý chính xác duy nhất',
        en: 'Nothing is wrong — the Graham number is designed to produce one single precise fair value',
      },
      b: {
        vi: 'Số Graham chỉ cho ra MỘT con số duy nhất, không thể hiện khoảng giá trị hợp lý như các phương pháp phức tạp hơn (ví dụ chiết khấu dòng tiền) có thể cho ra',
        en: 'The Graham number produces only a SINGLE value; it cannot show a range of fair values the way more sophisticated methods (e.g. discounted cash flow) can',
      },
      c: {
        vi: 'Sai vì phải nhân thêm hệ số lạm phát vào Số Graham',
        en: "It's wrong because an inflation factor must be multiplied into the Graham number",
      },
      d: {
        vi: 'Sai vì Số Graham chỉ áp dụng được cho cổ phiếu ngân hàng',
        en: "It's wrong because the Graham number only applies to bank stocks",
      },
    },
    answer: 'b',
    explain: {
      vi: "“The Graham number produces a single value and does not account for the range of possible fair values that more sophisticated methods such as discounted cash flow analysis can provide.” Số Graham là một ngưỡng sàng lọc đơn giản, không phải một mức giá trị nội tại chính xác duy nhất — coi phần trăm chênh lệch với nó là 'biên an toàn cụ thể' là hiểu sai bản chất công cụ.",
      en: '“The Graham number produces a single value and does not account for the range of possible fair values that more sophisticated methods such as discounted cash flow analysis can provide.” The Graham number is a simple screening threshold, not a single precise intrinsic value — treating the percentage gap from it as an exact margin of safety misreads what the tool actually does.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Graham_number',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q020',
    formulaId: 'ncav-tren-co-phieu',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Bạn tìm được 2 cổ phiếu giá thấp hơn NCAV/cp và định dồn tiền vào đó. Vấn đề là gì?',
    },
    choices: {
      a: { vi: 'NCAV chỉ dùng cho công ty lớn' },
      b: { vi: 'Phương pháp chỉ cho kết quả thống kê khi phân tán ít nhất khoảng 20 mã' },
      c: { vi: 'NCAV phải tính theo quý' },
      d: { vi: 'Không có vấn đề gì' },
    },
    answer: 'b',
    explain: {
      vi: 'Vấn đề là dồn vốn vào hai mã: phần lớn cổ phiếu rẻ hơn NCAV rẻ vì có lý do thật, nên phương pháp này chỉ ăn được lợi thế THỐNG KÊ khi rải ra nhiều mã, nguồn đề nghị tối thiểu 20 mã. Nguyên văn: “Most of them deserve their very low prices” và “The method works better with significant diversification, at least 20 net-net value stocks, to reap the statistical returns”. Công thức NCAV rút gọn còn bỏ sót nợ ngoài bảng cân đối, thứ chỉ thuyết minh báo cáo mới ghi.',
      en: 'The problem is concentrating into two names: most stocks trading below NCAV are cheap for a real reason, so the method only earns its STATISTICAL edge when spread across many names, and the source suggests at least 20. Verbatim: “Most of them deserve their very low prices” and “The method works better with significant diversification, at least 20 net-net value stocks, to reap the statistical returns”. The simplified NCAV formula also misses off-balance-sheet liabilities, which appear only in the notes.',
    },
    source: {
      url: 'https://www.netnethunter.com/grahams-net-current-assets-formula/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q335',
    formulaId: 'ncav-tren-co-phieu',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Theo tiêu chuẩn thận trọng mà Graham đặt ra khi mua cổ phiếu net-net, giá mua nên tối đa bằng bao nhiêu phần trăm NCAV mỗi cổ phiếu để có đủ biên an toàn?',
      en: 'Under the conservative standard Graham set for buying net-net stocks, the purchase price should be at most what percentage of NCAV per share to leave an adequate margin of safety?',
    },
    choices: {
      a: {
        vi: '100% NCAV — bằng đúng NCAV là đủ',
        en: '100% of NCAV — matching NCAV exactly is enough',
      },
      b: {
        vi: 'Khoảng 66,7% NCAV (tức 2/3), để có biên an toàn tối thiểu khoảng 33%',
        en: 'About 66.7% of NCAV (i.e., two-thirds), leaving a margin of safety of at least about 33%',
      },
      c: { vi: '90% NCAV', en: '90% of NCAV' },
      d: { vi: '50% NCAV', en: '50% of NCAV' },
    },
    answer: 'b',
    explain: {
      vi: 'Chỉ cần giá thấp hơn NCAV một chút chưa đủ an toàn theo chuẩn gốc của Graham — ông khuyên chỉ mua khi giá không vượt quá 2/3 NCAV, chừa lại khoảng 33% đệm an toàn cho sai số số liệu hoặc tình hình xấu đi thêm. Nguồn viết: “Graham recommended buying stocks trading at no more than 2/3 of their NCAV, providing a margin of safety of at least ~33%.”',
      en: "A price just slightly below NCAV is not enough margin of safety under Graham's original standard — he recommended buying only when the price does not exceed two-thirds of NCAV, leaving roughly a 33% buffer for data inaccuracies or further deterioration. The source states: “Graham recommended buying stocks trading at no more than 2/3 of their NCAV, providing a margin of safety of at least ~33%.”",
    },
    source: {
      url: 'https://stablebread.com/net-net-stock-valuation/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q336',
    formulaId: 'ncav-tren-co-phieu',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Áp bộ lọc NCAV lên một thị trường chứng khoán bất kỳ không cho ra số lượng cổ phiếu net-net như nhau ở mọi nơi. Nghiên cứu của James Montier (dẫn lại trên NetNetHunter) cho thấy phần lớn cơ hội net-net thời hiện đại (1985-2007) tập trung ở đâu?',
      en: "Screening for NCAV does not turn up the same number of net-net stocks in every market. James Montier's research (cited on NetNetHunter) found that most modern-era (1985-2007) net-net opportunities were concentrated where?",
    },
    choices: {
      a: {
        vi: 'Phân bố đều khắp các thị trường phát triển',
        en: 'Spread evenly across developed markets',
      },
      b: { vi: 'Tập trung chủ yếu ở Mỹ', en: 'Concentrated mainly in the United States' },
      c: { vi: 'Tập trung chủ yếu ở Nhật Bản', en: 'Concentrated mainly in Japan' },
      d: { vi: 'Tập trung chủ yếu ở châu Âu', en: 'Concentrated mainly in Europe' },
    },
    answer: 'c',
    explain: {
      vi: 'Nguồn viết: “Montier additionally noted that a majority of net net opportunities in modern times were found in Japan.” Bộ lọc NCAV không cho kết quả đồng đều ở mọi thị trường — nơi có nhiều công ty vốn hoá nhỏ, bảng cân đối kế toán nhiều tiền mặt như Nhật Bản trước đây mới sinh ra phần lớn số cổ phiếu net-net, nên áp dụng máy móc ở một thị trường khác không nên kỳ vọng tìm được nhiều mã tương tự.',
      en: 'The source states: “Montier additionally noted that a majority of net net opportunities in modern times were found in Japan.” An NCAV screen does not turn up an even number of candidates in every market — a market with many small, cash-heavy balance sheets, such as Japan historically, produced most net-net stocks, so applying the screen mechanically elsewhere should not be expected to find as many.',
    },
    source: {
      url: 'https://www.netnethunter.com/net-current-asset-value-what-why-and-how/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q337',
    formulaId: 'ncav-tren-co-phieu',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một doanh nghiệp có tài sản ngắn hạn 6.000 tỷ ₫, nợ ngắn hạn 2.200 tỷ ₫, nợ dài hạn 900 tỷ ₫ và 250.000.000 cổ phiếu lưu hành. Công thức NCAV gốc của Graham trừ TOÀN BỘ nợ phải trả, không chỉ nợ ngắn hạn. Điền bốn con số vào đúng ô trống — chú ý ô nào trừ ra, ô nào là số cổ phiếu ở mẫu số.',
      en: "A company has current assets of 6,000 billion ₫, current liabilities of 2,200 billion ₫, long-term liabilities of 900 billion ₫, and 250,000,000 shares outstanding. Graham's original NCAV formula subtracts ALL liabilities, not just current ones. Put the four figures into the right slots — mind which ones are subtracted and which is the share count in the denominator.",
    },
    facts: [
      {
        label: { vi: 'Tài sản ngắn hạn', en: 'Current assets' },
        value: { vi: '6.000 tỷ ₫', en: '6,000 billion ₫' },
      },
      {
        label: { vi: 'Nợ ngắn hạn', en: 'Current liabilities' },
        value: { vi: '2.200 tỷ ₫', en: '2,200 billion ₫' },
      },
      {
        label: { vi: 'Nợ dài hạn', en: 'Long-term liabilities' },
        value: { vi: '900 tỷ ₫', en: '900 billion ₫' },
      },
      {
        label: { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
        value: { vi: '250.000.000 cổ phiếu', en: '250,000,000 shares' },
      },
    ],
    expected: 11600,
    tolerance: { kind: 'tuong-doi', value: 0.01 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'NCAV mỗi cổ phiếu = ([6.000] − [2.200] − [900]) × 1.000.000.000 ÷ [250.000.000]',
      en: 'NCAV per share = ([6000] − [2200] − [900]) × 1000000000 ÷ [250000000]',
    },
    explain: {
      vi: "NCAV lấy tài sản ngắn hạn trừ TỔNG nợ phải trả — tức nợ ngắn hạn cộng nợ dài hạn (2.200 + 900 = 3.100 tỷ ₫) — chứ không phải chỉ nợ ngắn hạn như vốn lưu động ròng thông thường. Kết quả đúng: (6.000 − 3.100) ÷ 250 × 1.000 = 11.600 ₫/CP. Nếu nhầm sang chỉ trừ nợ ngắn hạn, con số sẽ bị thổi phồng thành 15.200 ₫/CP. Nguồn viết: “Current and long term liabilities together make up total liabilities, and it's this total figure that net net investors use to calculate Graham's net current asset value formula.”",
      en: "NCAV subtracts TOTAL liabilities — current plus long-term (2,200 + 900 = 3,100 billion ₫) — from current assets, not just current liabilities as in ordinary net working capital. The correct result: (6,000 − 3,100) ÷ 250 × 1,000 = 11,600 ₫/share. Subtracting only current liabilities would inflate the figure to 15,200 ₫/share. The source states: “Current and long term liabilities together make up total liabilities, and it's this total figure that net net investors use to calculate Graham's net current asset value formula.”",
    },
    giai: {
      tinh: { vi: 'NCAV trên cổ phiếu', en: 'Net current asset value per share' },
      thaySo: {
        vi: '(6.000 − 2.200 − 900) × 1.000.000.000 ÷ 250.000.000',
        en: '(6000 − 2200 − 900) × 1000000000 ÷ 250000000',
      },
      ketQua: { vi: '11.600 ₫', en: '11600 ₫' },
      gan: [
        { kyHieu: '\\text{TSNH}', giaTri: { vi: '6.000', en: '6000' } },
        {
          kyHieu: '\\text{Tổng nợ}',
          moTa: {
            vi: 'gồm nợ ngắn hạn 2.200 và nợ dài hạn 900, đơn vị tỷ ₫',
            en: 'is short-term debt 2200 plus long-term debt 900, in billions of ₫',
          },
        },
        {
          kyHieu: 'N',
          moTa: {
            vi: 'là 250.000.000 cổ phiếu đang lưu hành',
            en: 'is the 250000000 shares outstanding',
          },
        },
      ],
    },
    source: {
      url: 'https://www.netnethunter.com/grahams-net-current-assets-formula/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q338',
    formulaId: 'ncav-tren-co-phieu',
    format: 'chon-nhieu',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'So với thời Graham (thập niên 1930), điều gì khiến việc tìm và thực hiện chiến lược net-net (mua dưới NCAV) trở nên khó khăn hơn ở thị trường hiện đại? (Chọn tất cả đáp án đúng)',
      en: "Compared with Graham's time (the 1930s), what makes finding and executing the net-net strategy (buying below NCAV) harder in modern markets? (Select all that apply)",
    },
    choices: {
      a: {
        vi: 'Khi một doanh nghiệp đóng cửa ngày nay, chi phí thanh lý phát sinh nhiều hơn, ăn vào phần vốn lưu động đáng lẽ còn lại cho cổ đông',
        en: 'When a business closes today, liquidation costs are higher and eat into the working capital that would otherwise be left for shareholders',
      },
      b: {
        vi: 'Cổ phiếu net-net càng khó tìm hơn khi thị trường đang trong xu hướng tăng giá',
        en: 'Net-net stocks are even harder to find when the market is in an uptrend',
      },
      c: {
        vi: 'Các mô hình kinh doanh và hoạt động quản trị hiện đại như thâu tóm khiến chiến lược này kém hấp dẫn hơn',
        en: 'Modern business models and management activity such as takeovers have made the strategy less lucrative',
      },
      d: {
        vi: 'NCAV chỉ có thể tính được cho công ty niêm yết sau năm 2000',
        en: 'NCAV can only be calculated for companies listed after the year 2000',
      },
    },
    answers: ['a', 'b', 'c'],
    explain: {
      vi: "Nguồn giải thích vì sao net-net khó áp dụng hơn ngày nay: “During Graham's time, whenever businesses were liquidated, many companies preferred to ascribe the working capital to the shareholders' value. Therefore, the net-net approach was more practical than it is now. Today, closing a business usually attracts numerous costs which extract the working capital. However, it may still be viable if one is well-versed in the market and tries to make short-term gains. This is also a method of dispersing the risks that may arise when trading. On the other hand, finding net-net companies is extremely difficult, especially when the market trend is bullish.” Cùng bài viết còn dẫn lời Warren Buffett rằng mô hình kinh doanh thay đổi và các hoạt động quản trị hiện đại như thâu tóm khiến chiến lược này kém hấp dẫn hơn ngày nay. Không có giới hạn 'sau năm 2000' nào được nhắc tới trong nguồn — đáp án d bịa.",
      en: "The source explains why net-net investing is harder today: “During Graham's time, whenever businesses were liquidated, many companies preferred to ascribe the working capital to the shareholders' value. Therefore, the net-net approach was more practical than it is now. Today, closing a business usually attracts numerous costs which extract the working capital. However, it may still be viable if one is well-versed in the market and tries to make short-term gains. This is also a method of dispersing the risks that may arise when trading. On the other hand, finding net-net companies is extremely difficult, especially when the market trend is bullish.” The same article also cites Warren Buffett as saying that evolving business models and modern management activity such as takeovers have made the strategy less lucrative today. No 'after the year 2000' cutoff appears anywhere in the source — choice d is fabricated.",
    },
    source: {
      url: 'https://www.wallstreetmojo.com/net-net/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q021',
    formulaId: 'ty-suat-loi-nhuan-tren-gia',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'P/E thị trường Việt Nam 16,5 lần, thấp hơn Philippines và Indonesia trên 20 lần. Cách so sánh đúng là gì?',
    },
    choices: {
      a: { vi: 'Kết luận chứng khoán VN rẻ hơn' },
      b: { vi: 'Đổi sang E/P rồi đặt cạnh lãi suất phi rủi ro của chính nước đó' },
      c: { vi: 'So thêm P/B' },
      d: { vi: 'So theo vốn hoá thị trường' },
    },
    answer: 'b',
    explain: {
      vi: 'Bài trên Vietstock gọi so P/E thuần giữa các thị trường là sai lầm về bản chất. Khi đổi sang E/P, Việt Nam chỉ cho 6,1% — thấp hơn lãi suất tiết kiệm khoảng 6,5%, tức kênh cổ phiếu không hấp dẫn hơn gửi tiết kiệm. Bản gốc đặt tiêu đề đây là sai lầm phổ biến ở giới chuyên gia.',
    },
    source: {
      url: 'https://vietstock.vn/2017/09/so-sanh-pe-thuan-giua-cac-thi-truong-nha-dau-tu-can-hieu-ban-chat-3355-559371.htm',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q339',
    formulaId: 'ty-suat-loi-nhuan-tren-gia',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Bạn xếp hạng một rổ cổ phiếu từ rẻ nhất đến đắt nhất, trong đó có vài mã đang lỗ nên P/E âm hoặc không xác định. Theo tài liệu chương trình CFA, xếp thẳng theo P/E lúc này gặp vấn đề gì, và nên xử lý ra sao?',
      en: 'You are ranking a basket of stocks from cheapest to most expensive, and a few of them are losing money so their P/E is negative or undefined. According to the CFA curriculum, what goes wrong if you rank them directly by P/E, and what should you do instead?',
    },
    choices: {
      a: {
        vi: 'Không vấn đề gì, cứ xếp theo P/E từ thấp đến cao là đúng',
        en: 'No problem at all — ranking by P/E from low to high is still correct',
      },
      b: {
        vi: 'P/E âm hoặc không xác định bị xếp xuống đáy như thể rẻ nhất, trong khi đó lại là mã đắt nhất; nên xếp theo E/P (tỷ suất lợi nhuận trên giá) từ cao xuống thấp thay vì P/E',
        en: 'A negative or undefined P/E gets ranked at the bottom as if it were the cheapest, when it is actually the most expensive; rank by E/P (earnings yield) from highest to lowest instead',
      },
      c: {
        vi: 'Nên loại hẳn các mã đang lỗ ra khỏi bảng xếp hạng trước khi so P/E',
        en: 'Loss-making stocks should be dropped from the ranking before comparing P/E',
      },
      d: {
        vi: 'Nên lấy trị tuyệt đối của P/E âm rồi xếp bình thường như các mã còn lại',
        en: 'Take the absolute value of the negative P/E and rank it normally with the rest',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Tài liệu CFA Level 2 (Reading 25, LOS 25(f)) ghi rõ vấn đề: “Ranking zero and negative P/Es would rank them below the lowest positive P/E when they are actually the most costly.” Cách sửa được nêu ngay sau đó: xếp theo E/P từ cao xuống thấp thì thứ hạng đúng từ rẻ đến đắt vẫn giữ được kể cả với lợi nhuận âm — đây chính là lý do E/P được ưa dùng hơn P/E khi so sánh một nhóm có công ty đang lỗ.',
      en: 'The CFA Level 2 curriculum (Reading 25, LOS 25(f)) states the problem plainly: “Ranking zero and negative P/Es would rank them below the lowest positive P/E when they are actually the most costly.” The fix follows right after: ranking by E/P from highest to lowest preserves the correct cheap-to-expensive order even when earnings are negative — which is exactly why E/P is favored over P/E when comparing a group that includes loss-making companies.',
    },
    source: {
      url: 'https://analystprep.com/study-notes/cfa-level-2/earnings-yield/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q340',
    formulaId: 'ty-suat-loi-nhuan-tren-gia',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Corporate Finance Institute cho ví dụ: cổ phiếu ABC Corp đang giao dịch ở giá 8 USD/cổ phiếu, còn lợi nhuận trên mỗi cổ phiếu (EPS) 12 tháng gần nhất (LTM) là 0,35 USD/cổ phiếu. Điền hai con số ấy vào đúng ô trống của công thức tỷ suất lợi nhuận trên giá (E/P) — chú ý ô nào là EPS, ô nào là giá.',
      en: "The Corporate Finance Institute gives an example: ABC Corp.'s stock trades at $8 per share, and its last-twelve-months (LTM) earnings per share (EPS) is $0.35 per share. Put those two figures into the right slots of the earnings yield (E/P) formula — mind which slot takes the EPS and which takes the price.",
    },
    facts: [
      {
        label: { vi: 'Giá cổ phiếu ABC Corp', en: 'ABC Corp. share price' },
        value: { vi: '8 USD/cổ phiếu', en: '$8 per share' },
      },
      {
        label: {
          vi: 'EPS 12 tháng gần nhất (LTM) của ABC Corp',
          en: 'ABC Corp. last-twelve-months (LTM) EPS',
        },
        value: { vi: '0,35 USD/cổ phiếu', en: '$0.35 per share' },
      },
    ],
    expected: 4.375,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'E/P = [0,35] ÷ [8] × 100',
      en: 'E/P = [0.35] ÷ [8] × 100',
    },
    explain: {
      vi: "Nguồn nêu rõ quy ước dùng EPS 12 tháng gần nhất: “The earnings yield is a financial ratio that describes the relationship of a company's LTM earnings per share to the company's stock price per share.” Với số liệu ví dụ, E/P = 0,35 ÷ 8 × 100 = 4,375%. Nguồn diễn giải nôm na thành “every dollar invested in ABC Corp.'s stock generates 4 cents” — cách nói làm tròn thô; con số chính xác tính từ chính số liệu nguồn đưa ra là 4,375%.",
      en: "The source states the LTM-EPS convention explicitly: “The earnings yield is a financial ratio that describes the relationship of a company's LTM earnings per share to the company's stock price per share.” Using the example figures, E/P = 0.35 ÷ 8 × 100 = 4.375%. The source loosely paraphrases this as “every dollar invested in ABC Corp.'s stock generates 4 cents” — a rough rounding; the precise value from the source's own numbers is 4.375%.",
    },
    giai: {
      tinh: { vi: 'Tỷ suất lợi nhuận trên giá', en: 'Earnings yield' },
      thaySo: { vi: '0,35 ÷ 8 × 100', en: '0.35 ÷ 8 × 100' },
      ketQua: { vi: '4,38 %', en: '4.38 %' },
      gan: [
        {
          kyHieu: 'EPS',
          moTa: {
            vi: 'là lợi nhuận 12 tháng gần nhất trên một cổ phiếu: 0,35 USD',
            en: 'is trailing twelve-month earnings per share: 0.35 USD',
          },
        },
        {
          kyHieu: 'P',
          moTa: { vi: 'là giá một cổ phiếu: 8 USD', en: 'is the share price: 8 USD' },
        },
      ],
    },
    source: {
      url: 'https://corporatefinanceinstitute.com/resources/knowledge/finance/earnings-yield/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q341',
    formulaId: 'ty-suat-loi-nhuan-tren-gia',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: "Đọc về 'công thức thần kỳ' (Magic Formula) của Joel Greenblatt, bạn thấy ông cũng dùng đúng tên gọi 'earnings yield'. Con số ông tính ra có phải là EPS chia Giá cổ phiếu (E/P) như công thức trên trang này không?",
      en: "Reading about Joel Greenblatt's 'Magic Formula,' you notice he also uses the exact term 'earnings yield.' Is the number he computes the same as EPS divided by share price (E/P), the formula used on this page?",
    },
    choices: {
      a: {
        vi: 'Đúng, chỉ là cách gọi khác của cùng một phép tính EPS chia giá',
        en: "Yes, it's just another name for the same EPS-divided-by-price calculation",
      },
      b: {
        vi: 'Không — Greenblatt tính earnings yield bằng EBIT chia Giá trị doanh nghiệp (EV), khác cả tử số lẫn mẫu số so với EPS chia giá cổ phiếu',
        en: "No — Greenblatt's earnings yield is EBIT divided by enterprise value (EV), a different numerator and denominator from EPS divided by share price",
      },
      c: {
        vi: 'Đúng, chỉ khác ở chỗ Greenblatt dùng lợi nhuận sau thuế thay vì EPS',
        en: 'Yes, the only difference is that Greenblatt uses after-tax net income instead of EPS',
      },
      d: {
        vi: 'Không thể so sánh vì Greenblatt không đưa ra công thức cụ thể',
        en: "They can't be compared because Greenblatt never gives an explicit formula",
      },
    },
    answer: 'b',
    explain: {
      vi: "Trang liberatedstocktrader.com nêu rõ công thức của Greenblatt: “Earnings Yield = EBIT / EV.” và giải thích lý do khác biệt: “Greenblatt's earnings yield is adjusted to take into account not only earnings but also enterprise value, which includes debt and cash.” Trong khi đó E/P dùng trên trang này, theo chính nguồn, là “The earnings yield is the inverse of the price-to-earnings (P/E) ratio” — tức EPS chia giá cổ phiếu. Hai con số cùng tên 'earnings yield' nhưng không dùng thay nhau được.",
      en: "The site liberatedstocktrader.com spells out Greenblatt's formula: “Earnings Yield = EBIT / EV.” and explains the reason for the difference: “Greenblatt's earnings yield is adjusted to take into account not only earnings but also enterprise value, which includes debt and cash.” Meanwhile the E/P used on this page is, in the same source's words, “The earnings yield is the inverse of the price-to-earnings (P/E) ratio” — that is, EPS divided by share price. The two numbers share the same name, 'earnings yield,' but they are not interchangeable.",
    },
    source: {
      url: 'https://www.liberatedstocktrader.com/greenblatt-earnings-yield/',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q342',
    formulaId: 'ty-suat-loi-nhuan-tren-gia',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'ngo-nhan',
    prompt: {
      vi: "Bạn nghe nói việc so 'tỷ suất lợi nhuận trên giá' (E/P) với lợi suất trái phiếu kho bạc kỳ hạn 10 năm được gọi là 'Fed model', và nghĩ đây là công cụ định giá chính thức do Cục Dự trữ Liên bang Mỹ (Fed) đưa ra. Theo The Motley Fool, điều đó có đúng không?",
      en: "You hear that comparing earnings yield (E/P) with the 10-year Treasury bond yield is called the 'Fed model,' and assume it is an official valuation tool published by the U.S. Federal Reserve. According to The Motley Fool, is that correct?",
    },
    choices: {
      a: {
        vi: 'Đúng, Fed đã chính thức công bố và khuyến nghị mô hình này',
        en: 'Yes, the Fed officially published and recommends this model',
      },
      b: {
        vi: 'Sai — cái tên chỉ gắn với ý tưởng so sánh lợi suất, Fed chưa từng chính thức xác nhận mô hình này dù nó đã trở thành công cụ định giá phổ biến',
        en: 'No — the name is just attached to the comparison idea; the Fed never actually endorsed the model even though it became a popular valuation tool',
      },
      c: {
        vi: 'Đúng, nhưng chỉ áp dụng cho chỉ số S&P 500 chứ không áp dụng cho cổ phiếu lẻ',
        en: 'Yes, but it only applies to the S&P 500 index, not to individual stocks',
      },
      d: {
        vi: 'Sai, vì thực chất mô hình này so sánh cổ tức chứ không phải lợi nhuận',
        en: 'No, because the model actually compares dividends, not earnings',
      },
    },
    answer: 'b',
    explain: {
      vi: 'The Motley Fool viết: “Although it was never actually endorsed by the Federal Reserve, the idea of comparing the 10-year Treasury yield and the earnings yield (earnings divided by price) on the S&P 500 has become a standard valuation tool for many investors.” Cái tên khiến nhiều người tưởng nhầm đây là công cụ do Fed ban hành, nhưng thực chất Fed chưa từng đứng sau nó.',
      en: 'The Motley Fool writes: “Although it was never actually endorsed by the Federal Reserve, the idea of comparing the 10-year Treasury yield and the earnings yield (earnings divided by price) on the S&P 500 has become a standard valuation tool for many investors.” The name misleads many people into thinking the Fed issued this tool, but the Fed was never actually behind it.',
    },
    source: {
      url: 'https://www.fool.com/investing/general/2014/01/10/fed-model.aspx',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q022',
    formulaId: 'gia-muc-tieu',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Báo cáo phân tích khuyến nghị MUA với giá mục tiêu 73.000 đồng, thị giá hiện tại 52.000. Cách hiểu đúng?',
    },
    choices: {
      a: { vi: 'Cổ phiếu sẽ đạt 73.000 trong 12 tháng' },
      b: {
        vi: 'Đây là ước lượng có điều kiện, và chính CTCK từ chối trách nhiệm trong phần miễn trừ',
      },
      c: { vi: 'Công ty chứng khoán cam kết mức giá đó' },
      d: { vi: 'Nên mua vì chênh lệch 40%' },
    },
    answer: 'b',
    explain: {
      vi: 'Trường hợp thật: TLG được TPS khuyến nghị mua “lợi nhuận kỳ vọng 36%”, giá mục tiêu 73.000 đồng trong khi cổ phiếu cả năm dao động 45.000–55.000. Điều khoản miễn trừ ghi “TPS sẽ không chịu trách nhiệm đối với tất cả thiệt hại nào”.',
    },
    source: {
      url: 'https://thanhtra.com.vn/kinh-doanh-A08BE54D6/bai-1-phat-sot-voi-nhung-khuyen-nghi-mua-chung-khoan-loi-nhuan-ky-vong--EE057B864.html',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q023',
    formulaId: 'gia-muc-tieu',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'CTCK nâng giá mục tiêu một cổ phiếu. Lý do nào KHÔNG liên quan tới nội tại doanh nghiệp?',
    },
    choices: {
      a: { vi: 'Lợi nhuận quý vượt dự báo' },
      b: { vi: 'Giảm lãi suất chiết khấu trong mô hình' },
      c: { vi: 'Ký được hợp đồng lớn' },
      d: { vi: 'Biên lợi nhuận cải thiện' },
    },
    answer: 'b',
    explain: {
      vi: '“Đằng sau mỗi lần nâng giá mục tiêu... có thể là do đánh giá lại triển vọng lợi nhuận, cũng có thể do giảm lãi suất chiết khấu”, cộng áp lực đi theo thị trường: “việc làm người cô đơn, giữ nguyên định giá cũ trong khi cả thị trường đã nâng đánh giá là không dễ”.',
    },
    source: {
      url: 'https://www.tinnhanhchungkhoan.vn/rui-ro-khi-chay-theo-khuyen-nghi-dinh-gia-cua-chuyen-gia-phan-tich-post271706.html',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q343',
    formulaId: 'gia-muc-tieu',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Định giá một cổ phiếu theo P/E, P/B và P/S cho ra ba mức giá mục tiêu khác nhau. Theo Aswath Damodaran, cách chọn nào dưới đây là một kiểu thiên lệch cần tránh, không phải một tiêu chí hợp lý?',
      en: 'Valuing a stock by P/E, P/B and P/S produces three different target prices. According to Aswath Damodaran, which of the following is a biased shortcut to avoid, not a legitimate criterion for choosing among them?',
    },
    choices: {
      a: {
        vi: 'Chọn bội số có R-squared cao nhất khi hồi quy với các biến nền tảng của ngành',
        en: 'Pick the multiple with the highest R-squared when regressed against sector fundamentals',
      },
      b: {
        vi: 'Chọn bội số phù hợp nhất với cách ngành đó đo lường và tạo ra giá trị',
        en: 'Pick the multiple that best fits how that sector measures and creates value',
      },
      c: {
        vi: 'Chọn bội số nào cho ra đúng kết luận mình đã muốn có sẵn — ví dụ muốn nói cổ phiếu đang rẻ thì chọn bội số cho giá mục tiêu cao nhất',
        en: 'Pick whichever multiple confirms the conclusion you already wanted — e.g., picking the one with the highest target price to argue the stock is cheap',
      },
      d: {
        vi: 'Chọn bội số cho ra kết quả gần với mức trung bình của cả ba bội số',
        en: 'Pick the multiple whose result sits closest to the average of all three',
      },
    },
    answer: 'c',
    explain: {
      vi: 'Slide “Relative Valuation” của Damodaran nêu thẳng cách chọn thiên lệch này: “Use the multiple that best fits your objective. Thus, if you want the company to be undervalued, you pick the multiple that yields the highest value.” Hai cách hợp lý ông nêu là chọn bội số khớp thống kê tốt nhất (R-squared cao nhất khi hồi quy với biến nền tảng ngành) hoặc bội số phù hợp nhất với cách ngành đó tạo giá trị — không phải chọn theo kết luận có sẵn từ trước.',
      en: 'Damodaran\'s "Relative Valuation" slide names this biased approach directly: "Use the multiple that best fits your objective. Thus, if you want the company to be undervalued, you pick the multiple that yields the highest value." The two legitimate approaches he gives are picking the multiple with the best statistical fit (highest R-squared against sector fundamentals) or the one that best matches how that sector creates value — not picking to match a conclusion already decided in advance.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/country/relval.pdf',
      kind: 'chuyen-gia',
      vietnam: false,
    },
  },
  {
    id: 'Q344',
    formulaId: 'gia-muc-tieu',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một công ty được dự phóng lợi nhuận sau thuế năm nay là 500 tỷ đồng, có 100.000.000 cổ phiếu đang lưu hành. P/E mục tiêu theo trung bình ngành là 12 lần. Công thức giá mục tiêu dưới đây dựng EPS dự phóng của năm hiện tại rồi nhân với P/E mục tiêu. Điền ba con số vào đúng ô trống.',
      en: 'A company is projected to earn VND 500 billion in after-tax profit this year and has 100,000,000 shares outstanding. The industry-average target P/E is 12x. The target-price formula below builds the projected EPS for the current year and multiplies by the target P/E. Put the three figures into the right slots.',
    },
    facts: [
      {
        label: {
          vi: 'Lợi nhuận sau thuế dự phóng năm nay',
          en: 'Projected after-tax profit this year',
        },
        value: { vi: '500 tỷ đồng', en: 'VND 500 billion' },
      },
      {
        label: { vi: 'Số cổ phiếu đang lưu hành', en: 'Shares outstanding' },
        value: { vi: '100.000.000 cổ phiếu', en: '100,000,000 shares' },
      },
      {
        label: { vi: 'P/E mục tiêu (trung bình ngành)', en: 'Target P/E (industry average)' },
        value: { vi: '12 lần', en: '12x' },
      },
    ],
    expected: 60000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá mục tiêu = [500] × 1.000.000.000 ÷ [100.000.000] × [12]',
      en: 'Target price = [500] × 1000000000 ÷ [100000000] × [12]',
    },
    explain: {
      vi: 'EPS dự phóng = 500.000.000.000 ÷ 100.000.000 = 5.000 ₫/cp. Giá mục tiêu = 5.000 × 12 = 60.000 ₫. Tititada Academy ghi rõ quy ước này: “Dự phóng EPS là EPS dự đoán của năm hiện tại”, tức lợi nhuận DỰ BÁO cho năm nay, không phải lợi nhuận các quý đã công bố — khác với công thức trong thư viện này, vốn giữ nguyên EPS hiện tại (đã có) khi tính.',
      en: "Projected EPS = 500,000,000,000 ÷ 100,000,000 = VND 5,000 per share. Target price = 5,000 × 12 = VND 60,000. Tititada Academy states this convention explicitly: “Dự phóng EPS là EPS dự đoán của năm hiện tại” (projected EPS is the forecast EPS for the current year), meaning FORECAST profit for the current year, not profit from quarters already reported — unlike this library's own formula, which holds the current (already-reported) EPS fixed.",
    },
    giai: {
      tinh: { vi: 'Giá mục tiêu', en: 'Target price' },
      thaySo: {
        vi: '500 × 1.000.000.000 ÷ 100.000.000 × 12',
        en: '500 × 1000000000 ÷ 100000000 × 12',
      },
      ketQua: { vi: '60.000 ₫', en: '60000 ₫' },
      gan: [
        { kyHieu: 'P/E_{\\text{mục tiêu}}', giaTri: { vi: '12', en: '12' } },
        {
          kyHieu: 'EPS',
          moTa: {
            vi: 'bằng lợi nhuận dự phóng 500 tỷ ₫ chia 100.000.000 cổ phiếu',
            en: 'is the forecast profit of 500 billion ₫ divided by 100000000 shares',
          },
        },
      ],
    },
    source: {
      url: 'https://tititada.com/academy/dau-tu/chi-so-p-e-va-dinh-gia-theo-p-e',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q345',
    formulaId: 'gia-muc-tieu',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Một tài khoản mạng xã hội không phải công ty chứng khoán liên tục đăng "giá mục tiêu" cho nhiều mã cổ phiếu để kêu gọi nhà đầu tư mua vào. Theo quy định, việc này có vấn đề gì?',
      en: 'A social media account that is not a licensed securities firm keeps posting "target prices" for various stocks to urge people to buy. Under the regulations, what is the problem with this?',
    },
    choices: {
      a: {
        vi: 'Không sao cả, vì đây chỉ là quan điểm cá nhân nên ai cũng được đăng',
        en: 'It is fine, since this is just a personal opinion that anyone may post',
      },
      b: {
        vi: 'Chỉ sai nếu sau này giá mục tiêu đó chênh lệch quá xa so với giá thực tế',
        en: 'It is only wrong if that target price later turns out far off from the actual price',
      },
      c: {
        vi: 'Đây là hành vi đăng báo cáo phân tích, khuyến nghị đầu tư khi chưa được cấp phép — cơ quan quản lý từng xử phạt một trường hợp tương tự (Công ty CP Đầu tư ITP)',
        en: 'This is publishing an analysis report and investment recommendation without a license — regulators have already sanctioned a similar case (Đầu tư ITP JSC)',
      },
      d: {
        vi: 'Chỉ vi phạm nếu tài khoản đó thu phí người xem',
        en: 'It only breaks the rules if that account charges viewers a fee',
      },
    },
    answer: 'c',
    explain: {
      vi: 'Theo bài trên Tin nhanh chứng khoán (đăng lại trên Tuổi Trẻ), cơ quan quản lý “đã xử phạt một trường hợp cụ thể là Công ty cổ phần Đầu tư ITP vì đăng tải báo cáo phân tích và khuyến nghị đầu tư khi chưa được cấp phép” — chỉ công ty chứng khoán hoặc công ty quản lý quỹ được cấp phép mới được công khai đưa ra giá mục tiêu và khuyến nghị mua/bán.',
      en: 'According to the article on Tin nhanh chứng khoán (republished on Tuổi Trẻ), regulators "đã xử phạt một trường hợp cụ thể là Công ty cổ phần Đầu tư ITP vì đăng tải báo cáo phân tích và khuyến nghị đầu tư khi chưa được cấp phép" (sanctioned a specific case, Đầu tư ITP JSC, for publishing an analysis report and an investment recommendation without a license) — only a licensed securities company or fund manager may publicly issue a target price and a buy/sell recommendation.',
    },
    source: {
      /*
       * `kind: 'trai-nghiem'` chứ không phải `'quy-dinh'` — bài báo THUẬT LẠI một vụ xử phạt cụ
       * thể (ITP), không phải nguyên văn điều khoản hay biểu phí công bố. Đúng định nghĩa
       * `trai-nghiem` ở types.ts: "Người thật kể lại, hoặc báo chí thuật lại một vụ việc có số
       * liệu." `quy-dinh` dành cho văn bản pháp luật/biểu phí — nếu gắn nhãn đó thì câu này thành
       * nợ trong `SO_CAU_QUY_DINH_CHUA_CO_NGAY`, một tripwire chỉ được phép đi xuống.
       */
      url: 'https://tuoitre.vn/saigontimes/khuyen-nghi-chung-khoan-bai-1-co-the-phat-sinh-trach-nhiem-phap-ly/',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
];
