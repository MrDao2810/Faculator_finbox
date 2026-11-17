/**
 * Câu hỏi kiểm tra hiểu bài — nhóm Phí & thuế.
 *
 * Mỗi câu gắn một nguồn thật; xem bất biến ở `../types.ts`. Không thêm câu nào vào đây mà
 * không có `source.url` trỏ tới chỗ đọc được điều câu hỏi đang kiểm tra.
 */

import type { QuizItem } from '../types';

export const PHI_THUE: ReadonlyArray<QuizItem> = [
  {
    id: 'Q169',
    formulaId: 'thue-chuyen-nhuong',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Bạn cắt lỗ, bán 100 triệu đồng cổ phiếu mua giá 130 triệu. Thuế TNCN phải nộp?',
      en: 'You cut your losses, selling VND 100 million of stock bought for VND 130 million. What personal income tax is due?',
    },
    choices: {
      a: { vi: 'Không nộp, vì bán lỗ', en: 'None, since it is a loss' },
      b: { vi: '100.000 đồng, tính trên giá bán', en: 'VND 100,000, charged on the sale value' },
      c: { vi: '30.000 đồng, tính trên phần lỗ', en: 'VND 30,000, charged on the loss' },
      d: {
        vi: 'Tính gộp khi quyết toán cuối năm',
        en: 'Computed in total at year-end tax finalization',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Thông tư 111/2013/TT-BTC (sửa đổi bởi Thông tư 25/2018): “Cá nhân chuyển nhượng chứng khoán nộp thuế theo thuế suất 0,1% trên giá chuyển nhượng chứng khoán từng lần” - không phân biệt lãi hay lỗ. Cử tri từng kiến nghị Bộ Tài chính rằng “bán chứng khoán lỗ vẫn đóng thuế 0,1% là chưa phù hợp”.',
      en: 'Circular 111/2013/TT-BTC (as amended by Circular 25/2018): “Cá nhân chuyển nhượng chứng khoán nộp thuế theo thuế suất 0,1% trên giá chuyển nhượng chứng khoán từng lần” - no distinction between gain and loss. Voters once petitioned the Ministry of Finance that “bán chứng khoán lỗ vẫn đóng thuế 0,1% là chưa phù hợp”.',
    },
    source: {
      url: 'https://thuvienphapluat.vn/ma-so-thue/phap-luat-thue/cat-lo-chung-khoan-thi-co-phai-dong-01-thue-tncn-khong-214868.html',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q170',
    formulaId: 'thue-chuyen-nhuong',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Cuối năm danh mục lỗ. Bạn có được hoàn lại thuế 0,1% đã bị khấu trừ không?',
      en: 'Your portfolio is at a loss at year-end. Can you get the 0.1% tax already withheld refunded?',
    },
    choices: {
      a: { vi: 'Được, khi quyết toán cuối năm', en: 'Yes, at year-end tax finalization' },
      b: {
        vi: 'Không, nhưng được trừ vào thuế năm sau',
        en: "No, but it is offset against next year's tax",
      },
      c: { vi: 'Không, đây là thuế cuối cùng', en: 'No, this is a final tax' },
      d: { vi: 'Được, nếu lỗ trên 100 triệu đồng', en: 'Yes, if the loss exceeds VND 100 million' },
    },
    answer: 'c',
    explain: {
      vi: 'Thuế khấu trừ tại nguồn được coi là “thuế cuối cùng, không yêu cầu quyết toán bổ sung hay bù trừ lỗ lãi”. Khai sai để xin hoàn còn có thể bị phạt 1–5 triệu đồng.',
      en: 'Tax withheld at source is treated as “thuế cuối cùng, không yêu cầu quyết toán bổ sung hay bù trừ lỗ lãi”. Filing incorrectly to claim a refund can also draw a fine of VND 1–5 million.',
    },
    source: {
      url: 'https://congtyluatacc.vn/lo-chung-khoan-co-duoc-hoan-thue-tncn-0-1-da-nop-khong/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q171',
    formulaId: 'thue-chuyen-nhuong',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Lỗ ở mã A, lãi ở mã B trong cùng kỳ. Có được bù trừ khi tính thuế không?',
      en: 'A loss on stock A and a gain on stock B in the same period. Can they be offset when calculating tax?',
    },
    choices: {
      a: { vi: 'Được, nếu cùng một năm tính thuế', en: 'Yes, if within the same tax year' },
      b: { vi: 'Không, mỗi lệnh bán chịu thuế riêng', en: 'No, each sale is taxed on its own' },
      c: {
        vi: 'Được, nếu cùng công ty chứng khoán',
        en: 'Yes, if both go through the same broker',
      },
      d: {
        vi: 'Không, chỉ bù trừ được trong cùng một mã',
        en: 'No, offsetting only works within one ticker',
      },
    },
    answer: 'b',
    explain: {
      vi: 'Không có cơ chế bù trừ lãi/lỗ: thuế 0,1% tính trên tổng giá trị bán của từng lần, không phải trên thu nhập ròng sau khi trừ lỗ.',
      en: 'There is no gain/loss offsetting mechanism: the 0.1% tax is calculated on the total sale value of each trade, not on net income after subtracting losses.',
    },
    source: {
      url: 'https://congtyluatacc.vn/chung-khoan-bi-lo-co-duoc-bu-tru-khi-tinh-thue-tncn-khong/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q172',
    formulaId: 'thue-chuyen-nhuong',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Theo Luật Thuế TNCN số 109/2025/QH15 (hiệu lực 01/7/2026), chứng khoán NIÊM YẾT bị đánh thuế thế nào?',
      en: 'Under Personal Income Tax Law No. 109/2025/QH15 (effective July 1, 2026), how are LISTED securities taxed?',
    },
    choices: {
      a: { vi: '20% trên phần lãi mỗi lần bán', en: '20% on the gain from each sale' },
      b: { vi: '0,1% trên giá chuyển nhượng', en: '0.1% of the transfer value' },
      c: { vi: 'Miễn thuế với chứng khoán niêm yết', en: 'Exempt for listed securities' },
      d: { vi: 'Thuế 2% trên giá chuyển nhượng', en: 'A 2% tax on the transfer value' },
    },
    answer: 'b',
    explain: {
      vi: 'Luật số 109/2025/QH15, Điều 13 khoản 2: “Thuế thu nhập cá nhân đối với thu nhập từ chuyển nhượng chứng khoán được xác định bằng giá chuyển nhượng nhân (x) với thuế suất 0,1%”. Đề xuất 20% trên lãi từng được nêu tháng 7/2025 rồi rút lại tháng 9/2025; đề xuất 3/2026 chỉ nhắm cổ phiếu CHƯA niêm yết.',
      en: 'Law No. 109/2025/QH15, Article 13(2): “Thuế thu nhập cá nhân đối với thu nhập từ chuyển nhượng chứng khoán được xác định bằng giá chuyển nhượng nhân (x) với thuế suất 0,1%”. A proposal for 20% on the gain was floated in July 2025 and then withdrawn in September 2025; the March 2026 proposal only targets UNLISTED shares.',
    },
    source: {
      url: 'https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Luat-Thue-thu-nhap-ca-nhan-2025-so-109-2025-QH15-665870.aspx',
      kind: 'quy-dinh',
      vietnam: true,
      effectiveFrom: '2026-07-01',
    },
  },
  {
    id: 'Q173',
    formulaId: 'thue-chuyen-nhuong',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Giao dịch giá trị nhỏ hoặc bán cổ phiếu lẻ có được miễn thuế 0,1% không?',
      en: 'Are small-value trades or odd-lot share sales exempt from the 0.1% tax?',
    },
    choices: {
      a: { vi: 'Có, dưới 10 triệu được miễn', en: 'Yes, trades under VND 10 million are exempt' },
      b: { vi: 'Không có ngưỡng miễn nào', en: 'No, there is no exemption threshold' },
      c: { vi: 'Có với cổ phiếu lẻ', en: 'Yes, for odd-lot shares' },
      d: { vi: 'Tuỳ công ty chứng khoán', en: 'It depends on the broker' },
    },
    answer: 'b',
    explain: {
      vi: "Không có trường hợp miễn nào. Thuế chuyển nhượng 0,1% tính trên giá trị bán của mọi lệnh, không có ngưỡng tối thiểu và không phụ thuộc lãi hay lỗ, nên bán cổ phiếu lẻ hay bán giá trị rất nhỏ vẫn nộp. “No exemptions exist. Every stock sale triggers this tax. There's no minimum threshold”, và ghi nhận ngộ nhận phổ biến là tin “taxes only apply to profits or that small transactions are exempt. Neither is true”.",
      en: "There is no exemption. The 0.1% transfer tax applies to the sale value of every order, with no minimum threshold and no regard for profit or loss, so odd lots and tiny trades are taxed too. The source: “No exemptions exist. Every stock sale triggers this tax. There's no minimum threshold”, and it records the common belief that “taxes only apply to profits or that small transactions are exempt. Neither is true”.",
    },
    source: {
      url: 'https://aas.com.vn/thue-khi-ban-co-phieu/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q174',
    formulaId: 'phi-giao-dich-mua',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Phí giao dịch và thuế TNCN thu ở chiều nào?',
      en: 'Which side of a trade are the brokerage fee and personal income tax collected on?',
    },
    choices: {
      a: {
        vi: 'Phí và thuế đều thu ở cả hai chiều',
        en: 'Fee and tax are both charged on both sides',
      },
      b: {
        vi: 'Phí và thuế đều chỉ thu khi bán',
        en: 'Fee and tax are both charged only on sales',
      },
      c: {
        vi: 'Phí chỉ thu khi mua, thuế chỉ thu khi bán',
        en: 'Fee only on buys, tax only on sales',
      },
      d: {
        vi: 'Phí thu hai chiều, thuế chỉ thu khi bán',
        en: 'Fee on both sides, tax only on sales',
      },
    },
    answer: 'd',
    explain: {
      vi: '“Phí giao dịch chứng khoán sẽ tính cả 2 chiều phí mua và phí bán”, còn “Thuế thu nhập cá nhân chỉ thu khi nhà đầu tư thực hiện bán cổ phiếu thành công”.',
      en: '“Phí giao dịch chứng khoán sẽ tính cả 2 chiều phí mua và phí bán”, while “Thuế thu nhập cá nhân chỉ thu khi nhà đầu tư thực hiện bán cổ phiếu thành công”.',
    },
    source: {
      url: 'https://stockkisvn.vn/phi-va-thue-giao-dich-chung-khoan/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q175',
    formulaId: 'phi-giao-dich-ban',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Trần phí giao dịch mà công ty chứng khoán được thu theo Thông tư 128 là bao nhiêu?',
      en: 'Under Circular 128, what is the cap on the brokerage fee a broker may charge?',
    },
    choices: {
      a: { vi: '0,15%', en: '0.15%' },
      b: { vi: '0,5%', en: '0.5%' },
      c: { vi: '0,35%', en: '0.35%' },
      d: { vi: 'Không có trần', en: 'No cap' },
    },
    answer: 'b',
    explain: {
      vi: 'VnExpress: theo Thông tư 128 của Bộ Tài chính hiệu lực từ 2/2019, “các công ty chứng khoán không được phép thu phí giao dịch quá 0,5% giá trị một lần giao dịch”. Mặt bằng thực tế khoảng 0,1–0,35%, và biểu phí công bố trải từ khoảng 0,027% tới 0,5%.',
      en: 'VnExpress: under Circular 128 of the Ministry of Finance, effective from February 2019, “các công ty chứng khoán không được phép thu phí giao dịch quá 0,5% giá trị một lần giao dịch”. The actual market range runs about 0.1–0.35%, and published fee schedules span roughly 0.027% to 0.5%.',
    },
    source: {
      url: 'https://vnexpress.net/phi-giao-dich-tai-cac-cong-ty-chung-khoan-lon-4304921.html',
      kind: 'quy-dinh',
      vietnam: true,
      effectiveFrom: '2019-02-01',
    },
  },
  {
    id: 'Q176',
    formulaId: 'phi-giao-dich-mua',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Cùng lệnh 166,5 triệu đồng, chênh lệch phí giữa các công ty chứng khoán có đáng kể không?',
      en: 'For the same VND 166.5 million order, is the fee difference between brokers significant?',
    },
    choices: {
      a: { vi: 'Có, chênh tới vài triệu đồng', en: 'Yes, up to several million dong' },
      b: {
        vi: 'Có, chênh tới vài trăm nghìn đồng',
        en: 'Yes, up to several hundred thousand dong',
      },
      c: { vi: 'Không, chỉ chênh vài nghìn đồng', en: 'No, the gap is only a few thousand dong' },
      d: { vi: 'Không, các công ty thu như nhau', en: 'No, the brokers charge the same' },
    },
    answer: 'b',
    explain: {
      vi: 'VnExpress nêu ví dụ mua 1.000 MWG giá 166.500 đồng, phí 0,2% là 333.000 đồng. Bảng biểu phí công bố: TCBS 0,1% đồng hạng, MBS 0,12% online, VPS 0,2% online bậc thang, SSI 0,25% online, FPTS 0,06–0,15%.',
      en: 'VnExpress gives the example of buying 1,000 MWG shares at VND 166,500, where a 0.2% fee comes to VND 333,000. Published fee schedules: TCBS 0.1% flat, MBS 0.12% online, VPS 0.2% online tiered, SSI 0.25% online, FPTS 0.06–0.15%.',
    },
    source: {
      url: 'https://topi.vn/phi-giao-dich-chung-khoan.html',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q177',
    formulaId: 'phi-giao-dich-ban',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Mở tài khoản ở công ty “miễn phí giao dịch” thì giao dịch không tốn chi phí nào?',
      en: 'If you open an account at a broker advertising “free trading”, does that mean no cost on any trade?',
    },
    choices: {
      a: { vi: 'Vẫn tốn thuế bán và phí lưu ký', en: 'Transfer tax and custody fees still apply' },
      b: { vi: 'Không tốn gì, phí và thuế đều miễn', en: 'Nothing, both fees and tax are waived' },
      c: { vi: 'Không tốn gì nếu chỉ giao dịch online', en: 'Nothing, if you trade only online' },
      d: { vi: 'Chỉ tốn lãi margin nếu có vay', en: 'Only margin interest, if you borrow' },
    },
    answer: 'a',
    explain: {
      vi: 'Nguồn nhấn mạnh “free trading” không loại bỏ chi phí: thuế, phí lưu ký và lãi margin vẫn áp dụng bất kể chọn công ty nào.',
      en: 'The source stresses that “free trading” does not eliminate costs: taxes, the custody fee and margin interest still apply whichever broker you choose.',
    },
    source: {
      url: 'https://www.vfs.com.vn/phi-giao-dich-chung-khoan-re-nhat',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q178',
    formulaId: 'phi-luu-ky',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Phí lưu ký chứng khoán tính trên cơ sở nào?',
      en: 'What is the securities custody fee calculated on?',
    },
    choices: {
      a: { vi: 'Phần trăm trên giá trị danh mục', en: 'A percentage of portfolio value' },
      b: { vi: 'Giá trị lệnh khớp trong tháng', en: 'The value of orders matched that month' },
      c: { vi: 'Số lượng chứng khoán nắm giữ', en: 'The number of securities held' },
      d: { vi: 'Số dư tiền mặt trên tài khoản', en: 'The cash balance in the account' },
    },
    answer: 'c',
    explain: {
      vi: 'Theo Thông tư 127/2018/TT-BTC: cổ phiếu, chứng chỉ quỹ, chứng quyền 0,27 đồng/đơn vị/tháng. Nguồn ghi nhận nhà đầu tư thường nhầm phí lưu ký với phí giao dịch; phí này chỉ phụ thuộc SỐ LƯỢNG, không phụ thuộc giá trị danh mục. Đây cũng là chỗ rất dễ lập trình sai.',
      en: 'Under Circular 127/2018/TT-BTC: stocks, fund certificates and covered warrants are charged VND 0.27/unit/month. The source notes that investors commonly confuse the custody fee with the brokerage fee; this fee depends only on QUANTITY, not on portfolio value. This is also a place where the calculation is very easy to code wrong.',
    },
    source: {
      url: 'https://thuvienchungkhoan.vn/phi-luu-ky-chung-khoan/',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q179',
    formulaId: 'phi-luu-ky',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Tháng này bạn không mua bán gì. Có bị trừ phí lưu ký không?',
      en: "This month you didn't buy or sell anything. Is the custody fee still deducted?",
    },
    choices: {
      a: {
        vi: 'Không, phí chỉ tính khi có giao dịch',
        en: 'No, it is charged only when you trade',
      },
      b: {
        vi: 'Chỉ khi danh mục trên 100 triệu',
        en: 'Only if the portfolio exceeds VND 100 million',
      },
      c: {
        vi: 'Có, tính theo số chứng khoán đang giữ',
        en: 'Yes, it is based on the securities you hold',
      },
      d: {
        vi: 'Tuỳ chính sách từng công ty chứng khoán',
        en: "It depends on each broker's policy",
      },
    },
    answer: 'c',
    explain: {
      vi: 'Có. Phí lưu ký trả cho việc giữ chứng khoán trên tài khoản, tách hẳn khỏi phí giao dịch, nên tháng không mua bán gì vẫn bị trừ. Nguyên văn: “Depository fees are separate from transaction fees and apply regardless of whether trading occurs”. ACBS minh hoạ mức “1.000 x 0,27 = 270 VNĐ” mỗi tháng cho 1.000 chứng khoán, và tính cả ngày nghỉ: “Calculations include weekends and holidays”.',
      en: 'Yes. The custody fee pays for holding the securities in the account, entirely separate from trading fees, so a month with no trades is still charged. Verbatim: “Depository fees are separate from transaction fees and apply regardless of whether trading occurs”. ACBS works it through as “1.000 x 0,27 = 270 VNĐ” a month per 1,000 securities, weekends included: “Calculations include weekends and holidays”.',
    },
    source: {
      url: 'https://acbs.com.vn/blog/phi-luu-ky-chung-khoan',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q180',
    formulaId: 'phi-luu-ky',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Chuyển sang công ty chứng khoán khác có được phí lưu ký rẻ hơn không?',
      en: 'Does switching to a different broker get you a cheaper custody fee?',
    },
    choices: {
      a: { vi: 'Có, mỗi công ty tự đặt mức riêng', en: 'Yes, each broker sets its own rate' },
      b: { vi: 'Không, mọi công ty cùng một mức', en: 'No, every broker charges the same rate' },
      c: { vi: 'Không, trừ khi danh mục rất lớn', en: 'No, unless the portfolio is very large' },
      d: { vi: 'Có, với tài khoản vừa mở mới', en: 'Yes, for a newly opened account' },
    },
    answer: 'b',
    explain: {
      vi: '“Phí này giống nhau ở tất cả công ty chứng khoán (SSI, TCBS, VPS, DSC, v.v.)” và “Mức phí do Nhà nước quy định, không phải do các công ty chứng khoán quyết định”.',
      en: '“Phí này giống nhau ở tất cả công ty chứng khoán (SSI, TCBS, VPS, DSC, v.v.)” and “Mức phí do Nhà nước quy định, không phải do các công ty chứng khoán quyết định”.',
    },
    source: {
      url: 'https://www.dsc.com.vn/kien-thuc/phi-luu-ky-chung-khoan-la-gi',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q181',
    formulaId: 'thue-co-tuc',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Nhận cổ tức bằng cổ phiếu. Nghĩa vụ thuế phát sinh thế nào?',
      en: 'You receive a stock dividend. How does the tax obligation arise?',
    },
    choices: {
      a: { vi: 'Miễn thuế, vì không nhận tiền mặt', en: 'Exempt, since no cash is received' },
      b: { vi: 'Khi bán, chỉ nộp 0,1% giá bán', en: 'On sale, only 0.1% of the price' },
      c: {
        vi: 'Khi bán, 5% mệnh giá và 0,1% giá bán',
        en: 'On sale, 5% of par and 0.1% of the price',
      },
      d: { vi: 'Nộp 20% trên phần lãi khi bán', en: '20% on the capital gain, paid when sold' },
    },
    answer: 'c',
    explain: {
      vi: 'Theo Nghị định 126/2020/NĐ-CP, “nhà đầu tư bán chứng khoán được chia thưởng, được trả cổ tức sẽ bị khấu trừ 5% thuế thu nhập cá nhân”, cộng 0,1% trên giá trị giao dịch. Nghịch lý được nhà đầu tư nêu: cổ tức cổ phiếu không làm tăng tài sản nhưng vẫn phát sinh nghĩa vụ thuế.',
      en: 'Under Decree 126/2020/ND-CP, “nhà đầu tư bán chứng khoán được chia thưởng, được trả cổ tức sẽ bị khấu trừ 5% thuế thu nhập cá nhân” (investors who sell shares received as a bonus or a dividend have 5% personal income tax withheld), plus 0.1% on the transaction value. The paradox investors raise: a stock dividend does not increase actual wealth, yet it still creates a tax obligation.',
    },
    source: {
      url: 'https://vneconomy.vn/thue-co-tuc-bang-co-phieu-nha-dau-tu-thiet-cong-ty-chung-khoan-roi-viec.htm',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q182',
    formulaId: 'thue-co-tuc',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Doanh nghiệp đã nộp thuế TNDN trước khi chia cổ tức. Cổ đông cá nhân có phải nộp thêm không?',
      en: 'The company already paid corporate income tax before distributing the dividend. Does the individual shareholder still have to pay more?',
    },
    choices: {
      a: { vi: 'Không, vì doanh nghiệp đã nộp thuế', en: 'No, the company already paid the tax' },
      b: {
        vi: 'Chỉ nộp nếu cổ tức trên 10 triệu',
        en: 'Only if the dividend exceeds VND 10 million',
      },
      c: { vi: 'Chỉ nộp với cổ phiếu chưa niêm yết', en: 'Only on shares that are not listed' },
      d: { vi: 'Có, vẫn nộp 5% trên cổ tức', en: 'Yes, 5% is still due on the dividend' },
    },
    answer: 'd',
    explain: {
      vi: 'Vẫn phải nộp. Lập luận “thuế chồng thuế” là quan điểm phản biện của nhà đầu tư, không phải căn cứ miễn trừ. Một nhà đầu tư đặt vấn đề vì sao cá nhân vẫn nộp khi doanh nghiệp đã nộp thuế thu nhập doanh nghiệp trên phần lợi nhuận trước khi chia, nguyên văn “the company already paid corporate income tax on profits before distributing dividends”, nhưng luật vẫn quy định cổ đông cá nhân nộp 5% trên cổ tức nhận được.',
      en: 'It is still owed. The “thuế chồng thuế” (double taxation) argument is an investor objection, not a statutory exemption. One investor asks why individuals still pay when “the company already paid corporate income tax on profits before distributing dividends”, yet the law still charges individual shareholders 5% on the dividend they receive.',
    },
    source: {
      url: 'https://tuoitre.vn/thu-thue-ngay-khi-nhan-co-tuc-bang-co-phieu-chua-cam-tien-da-lo-nop-thue-20250701102729031.htm',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q183',
    formulaId: 'thue-tncn-dau-tu',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Khoản nào sau đây được MIỄN thuế TNCN theo Luật số 109/2025/QH15?',
      en: 'Which of the following is EXEMPT from personal income tax under Law No. 109/2025/QH15?',
    },
    choices: {
      a: {
        vi: 'Lãi tiền gửi tại tổ chức tín dụng',
        en: 'Interest on deposits at credit institutions',
      },
      b: {
        vi: 'Cổ tức tiền mặt nhận từ doanh nghiệp',
        en: 'Cash dividends received from a company',
      },
      c: { vi: 'Lãi trái phiếu doanh nghiệp', en: 'Interest on corporate bonds' },
      d: { vi: 'Cổ tức bằng cổ phiếu khi bán', en: 'Stock dividends, once those shares are sold' },
    },
    answer: 'a',
    explain: {
      vi: 'Luật số 109/2025/QH15, Điều 4 khoản 6 liệt kê thu nhập miễn thuế: “Thu nhập từ lãi trái phiếu chính phủ, lãi trái phiếu chính quyền địa phương, lãi tiền gửi tại tổ chức tín dụng, lãi từ hợp đồng bảo hiểm nhân thọ”. Cổ tức và lãi trái phiếu doanh nghiệp chịu 5% theo Điều 12 khoản 1.',
      en: 'Law No. 109/2025/QH15, Article 4(6) lists tax-exempt income: “Thu nhập từ lãi trái phiếu chính phủ, lãi trái phiếu chính quyền địa phương, lãi tiền gửi tại tổ chức tín dụng, lãi từ hợp đồng bảo hiểm nhân thọ”. Dividends and corporate bond interest are subject to 5% under Article 12(1).',
    },
    source: {
      url: 'https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Luat-Thue-thu-nhap-ca-nhan-2025-so-109-2025-QH15-665870.aspx',
      kind: 'quy-dinh',
      vietnam: true,
      effectiveFrom: '2026-07-01',
    },
  },
  {
    id: 'Q184',
    formulaId: 'gia-hoa-von',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Giá hoà vốn của một lệnh mua cổ phiếu gồm những gì?',
      en: 'What does the break-even price of a stock purchase order include?',
    },
    choices: {
      a: {
        vi: 'Giá mua + phí mua + thuế 0,1% giá mua',
        en: 'Purchase price + buying fee + 0.1% tax on the purchase',
      },
      b: {
        vi: 'Giá mua + phí mua + thuế trên phần lãi',
        en: 'Purchase price + buying fee + tax on the gain',
      },
      c: {
        vi: 'Giá mua + phí hai chiều + thuế trên phần lãi',
        en: 'Purchase price + both fees + tax on the gain',
      },
      d: {
        vi: 'Giá mua + phí hai chiều + thuế 0,1% giá bán',
        en: 'Purchase price + both fees + 0.1% tax on the sale',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Giá hoà vốn phải cộng đủ ba lớp chi phí lên giá mua: phí mua, phí bán và thuế bán 0,1% trên giá trị bán. KIS liệt kê đúng bốn thành phần “purchase fees + selling fees + the 0.1% tax on sale value + original purchase price”, và nhấn mạnh thuế 0,1% “cannot be reduced by purchase costs or trading fees”, tức thuế tính trên GIÁ TRỊ BÁN và không được trừ giá vốn hay phí ra khỏi cơ sở tính thuế.',
      en: 'The break-even price has to add three layers of cost on top of the purchase price: buying fees, selling fees and the 0.1% tax on sale value. KIS lists exactly four components, “purchase fees + selling fees + the 0.1% tax on sale value + original purchase price”, and stresses that the 0.1% tax “cannot be reduced by purchase costs or trading fees”, meaning it is charged on SALE VALUE with no deduction for cost basis or fees.',
    },
    source: {
      url: 'https://kisvn.vn/hoc-dau-tu/thue-ban-co-phieu',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q185',
    formulaId: 'loi-nhuan-rong',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Giao dịch lướt sóng nhiều lần trong năm nhưng lỗ ròng. Tổng thuế phải nộp thế nào?',
      en: 'A trader makes many round trips during the year but ends up with a net loss. How much total tax is owed?',
    },
    choices: {
      a: {
        vi: 'Tăng theo số lần bán, dù lỗ ròng',
        en: 'It rises with each sale, despite a net loss',
      },
      b: { vi: 'Bằng 0, vì cả năm lỗ ròng', en: 'Zero, since the year ends at a net loss' },
      c: { vi: 'Được hoàn lại khi quyết toán năm', en: 'Refunded at year-end tax finalization' },
      d: { vi: 'Tính trên phần lỗ ròng cả năm', en: "Charged on the year's net loss" },
    },
    answer: 'a',
    explain: {
      vi: 'Vẫn phải nộp, và tổng thuế còn tăng theo số vòng giao dịch chứ không theo lãi lỗ: thuế bán 0,1% tính trên giá trị bán của từng lệnh, nên lỗ ròng cả năm vẫn nộp đủ. Bộ Tài chính thừa nhận cơ chế này tạo tình huống bất hợp lý, nguyên văn “active traders pay more total tax simply from higher transaction volume, even with net losses”. Mỗi vòng mua rồi bán gánh: phí mua, phí bán, thuế bán 0,1% và phí lưu ký hằng tháng.',
      en: 'Tax is still owed, and the total rises with the number of round trips rather than with profit or loss: the 0.1% transfer tax is charged on each sale value, so a year that ends in a net loss still pays in full. The Ministry of Finance acknowledges the outcome is unreasonable, verbatim: “active traders pay more total tax simply from higher transaction volume, even with net losses”. Every round trip carries buying fees, selling fees, the 0.1% transfer tax and the monthly custody fee.',
    },
    source: {
      url: 'https://vietstock.vn/2024/11/kien-nghi-cat-lo-chung-khoan-khong-can-dong-thue-143-1247891.htm',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q186',
    formulaId: 'roi-rong',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Bán xong muốn dùng tiền ngay trước chu kỳ thanh toán T+2. Chi phí phát sinh?',
      en: 'You want to use the proceeds right away, before the T+2 settlement cycle completes. What cost does that incur?',
    },
    choices: {
      a: {
        vi: 'Không tốn gì, tiền bán đã là của bạn',
        en: 'Nothing, the proceeds are already yours',
      },
      b: { vi: 'Phí cố định 50.000 đồng mỗi lần ứng', en: 'A flat VND 50,000 fee per advance' },
      c: {
        vi: 'Lãi margin, như khi vay mua cổ phiếu',
        en: 'Margin interest, as when borrowing to buy stock',
      },
      d: {
        vi: 'Phí ứng trước tiền bán, tính theo ngày',
        en: 'A daily fee for advancing the proceeds',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Ứng trước tiền bán là một khoản vay ngắn ngày, tính lãi theo từng ngày cho tới khi tiền về, nên nó ăn thẳng vào ROI ròng của giao dịch lướt sóng. Biểu phí công bố: “Advance Payment Interest: Ranges from 0,03%-0,04% daily when accessing sale proceeds before settlement (T+2)”, tức khoảng 0,03 đến 0,04% mỗi ngày trên số tiền ứng.',
      en: 'Advancing the sale proceeds is a short loan charged by the day until settlement, so it eats straight into the net ROI of a quick trade. The published schedule reads: “Advance Payment Interest: Ranges from 0,03%-0,04% daily when accessing sale proceeds before settlement (T+2)”, roughly 0.03 to 0.04% a day on the advanced amount.',
    },
    source: {
      url: 'https://www.vfs.com.vn/chi-phi-giao-dich-chung-khoan',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q187',
    formulaId: 'phi-luu-ky',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: {
      vi: 'Phí lưu ký bắt đầu tính từ thời điểm nào?',
      en: 'From what point does the custody fee start accruing?',
    },
    choices: {
      a: { vi: 'Ngày lệnh mua được khớp', en: 'The day the buy order is matched' },
      b: { vi: 'Ngày bạn đặt lệnh mua', en: 'The day you place the buy order' },
      c: { vi: 'Ngày đầu tiên của tháng kế tiếp', en: 'The first day of the following month' },
      d: { vi: 'Ngày chứng khoán về tài khoản', en: 'The day the securities reach the account' },
    },
    answer: 'd',
    explain: {
      vi: 'Phí lưu ký tính từ ngày chứng khoán về tài khoản, tức ngày thanh toán, chứ không phải ngày khớp lệnh mua; và chỉ dừng khi quyền sở hữu thực sự chuyển sang người mua lúc bán. Nguyên văn: “Fees begin accruing on settlement day, not purchase date. They end when ownership actually transfers to the buyer during sales”.',
      en: 'The custody fee starts on the day the securities land in the account, the settlement day, not the day the buy order matched; and it stops only when ownership actually transfers to the buyer on a sale. Verbatim: “Fees begin accruing on settlement day, not purchase date. They end when ownership actually transfers to the buyer during sales”.',
    },
    source: {
      url: 'https://thuvienchungkhoan.vn/phi-luu-ky-chung-khoan/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
];
