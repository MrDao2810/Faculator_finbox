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
    },
    choices: {
      a: { vi: 'Không nộp vì lỗ' },
      b: { vi: '100.000 đồng (0,1% trên giá bán)' },
      c: { vi: 'Nộp trên phần lỗ' },
      d: { vi: 'Nộp khi quyết toán cuối năm' },
    },
    answer: 'b',
    explain: {
      vi: 'Thông tư 111/2013/TT-BTC (sửa đổi bởi Thông tư 25/2018): “Cá nhân chuyển nhượng chứng khoán nộp thuế theo thuế suất 0,1% trên giá chuyển nhượng chứng khoán từng lần” — không phân biệt lãi hay lỗ. Cử tri từng kiến nghị Bộ Tài chính rằng “bán chứng khoán lỗ vẫn đóng thuế 0,1% là chưa phù hợp”.',
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
    prompt: { vi: 'Cuối năm danh mục lỗ. Bạn có được hoàn lại thuế 0,1% đã bị khấu trừ không?' },
    choices: {
      a: { vi: 'Được, khi quyết toán' },
      b: { vi: 'Không — đây là thuế khấu trừ tại nguồn, mang tính thuế cuối cùng' },
      c: { vi: 'Được 50%' },
      d: { vi: 'Được nếu lỗ trên 100 triệu' },
    },
    answer: 'b',
    explain: {
      vi: 'Thuế khấu trừ tại nguồn được coi là “thuế cuối cùng, không yêu cầu quyết toán bổ sung hay bù trừ lỗ lãi”. Khai sai để xin hoàn còn có thể bị phạt 1–5 triệu đồng.',
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
    prompt: { vi: 'Lỗ ở mã A, lãi ở mã B trong cùng kỳ. Có được bù trừ khi tính thuế không?' },
    choices: {
      a: { vi: 'Được' },
      b: { vi: 'Không — thuế tính trên giá trị bán từng lần, từng mã riêng biệt' },
      c: { vi: 'Được nếu cùng công ty chứng khoán' },
      d: { vi: 'Được nếu cùng tháng' },
    },
    answer: 'b',
    explain: {
      vi: 'Không có cơ chế bù trừ lãi/lỗ: thuế 0,1% tính trên tổng giá trị bán của từng lần, không phải trên thu nhập ròng sau khi trừ lỗ.',
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
    },
    choices: {
      a: { vi: '20% trên phần lãi' },
      b: { vi: 'Giữ 0,1% trên giá chuyển nhượng' },
      c: { vi: 'Miễn thuế' },
      d: { vi: '2% trên giá bán' },
    },
    answer: 'b',
    explain: {
      vi: 'Luật số 109/2025/QH15, Điều 13 khoản 2: “Thuế thu nhập cá nhân đối với thu nhập từ chuyển nhượng chứng khoán được xác định bằng giá chuyển nhượng nhân (x) với thuế suất 0,1%”. Đề xuất 20% trên lãi từng được nêu tháng 7/2025 rồi rút lại tháng 9/2025; đề xuất 3/2026 chỉ nhắm cổ phiếu CHƯA niêm yết.',
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
    prompt: { vi: 'Giao dịch giá trị nhỏ hoặc bán cổ phiếu lẻ có được miễn thuế 0,1% không?' },
    choices: {
      a: { vi: 'Có, dưới 10 triệu được miễn' },
      b: { vi: 'Không có ngưỡng miễn nào' },
      c: { vi: 'Có với cổ phiếu lẻ' },
      d: { vi: 'Tuỳ công ty chứng khoán' },
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
    prompt: { vi: 'Phí giao dịch và thuế TNCN thu ở chiều nào?' },
    choices: {
      a: { vi: 'Cả hai đều thu hai chiều' },
      b: { vi: 'Phí thu cả chiều mua lẫn bán; thuế 0,1% chỉ thu chiều bán' },
      c: { vi: 'Cả hai chỉ thu chiều bán' },
      d: { vi: 'Phí chỉ thu chiều mua' },
    },
    answer: 'b',
    explain: {
      vi: '“Phí giao dịch chứng khoán sẽ tính cả 2 chiều phí mua và phí bán”, còn “Thuế thu nhập cá nhân chỉ thu khi nhà đầu tư thực hiện bán cổ phiếu thành công”.',
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
    },
    choices: {
      a: { vi: '0,15%' },
      b: { vi: '0,35%' },
      c: { vi: '0,5%' },
      d: { vi: 'Không có trần' },
    },
    answer: 'c',
    explain: {
      vi: 'VnExpress: theo Thông tư 128 của Bộ Tài chính hiệu lực từ 2/2019, “các công ty chứng khoán không được phép thu phí giao dịch quá 0,5% giá trị một lần giao dịch”. Mặt bằng thực tế khoảng 0,1–0,35%, và biểu phí công bố trải từ khoảng 0,027% tới 0,5%.',
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
    },
    choices: {
      a: { vi: 'Không đáng kể' },
      b: {
        vi: 'Rất đáng kể — phí 0,2% là 333.000 đồng, trong khi biểu phí thị trường trải từ khoảng 0,027% tới 0,5%',
      },
      c: { vi: 'Chỉ chênh vài nghìn đồng' },
      d: { vi: 'Các công ty thu như nhau' },
    },
    answer: 'b',
    explain: {
      vi: 'VnExpress nêu ví dụ mua 1.000 MWG giá 166.500 đồng, phí 0,2% là 333.000 đồng. Bảng biểu phí công bố: TCBS 0,1% đồng hạng, MBS 0,12% online, VPS 0,2% online bậc thang, SSI 0,25% online, FPTS 0,06–0,15%.',
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
    },
    choices: {
      a: { vi: 'Đúng' },
      b: { vi: 'Sai — vẫn còn thuế 0,1% khi bán, phí lưu ký hằng tháng và lãi margin' },
      c: { vi: 'Đúng nếu giao dịch online' },
      d: { vi: 'Đúng trong 6 tháng đầu' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn nhấn mạnh “free trading” không loại bỏ chi phí: thuế, phí lưu ký và lãi margin vẫn áp dụng bất kể chọn công ty nào.',
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
    prompt: { vi: 'Phí lưu ký chứng khoán tính trên cơ sở nào?' },
    choices: {
      a: { vi: 'Phần trăm giá trị danh mục' },
      b: { vi: 'Số lượng chứng khoán nắm giữ — 0,27 đồng/cổ phiếu/tháng' },
      c: { vi: 'Số lần giao dịch' },
      d: { vi: 'Số dư tiền mặt' },
    },
    answer: 'b',
    explain: {
      vi: 'Theo Thông tư 127/2018/TT-BTC: cổ phiếu, chứng chỉ quỹ, chứng quyền 0,27 đồng/đơn vị/tháng. Nguồn ghi nhận nhà đầu tư thường nhầm phí lưu ký với phí giao dịch; phí này chỉ phụ thuộc SỐ LƯỢNG, không phụ thuộc giá trị danh mục. Đây cũng là chỗ rất dễ lập trình sai.',
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
    prompt: { vi: 'Tháng này bạn không mua bán gì. Có bị trừ phí lưu ký không?' },
    choices: {
      a: { vi: 'Không' },
      b: { vi: 'Có — phí tính theo số dư bình quân cuối mỗi ngày, gồm cả ngày nghỉ lễ' },
      c: { vi: 'Chỉ khi danh mục trên 100 triệu' },
      d: { vi: 'Tuỳ công ty chứng khoán' },
    },
    answer: 'b',
    explain: {
      vi: 'Có. Phí lưu ký trả cho việc giữ chứng khoán trên tài khoản, tách hẳn khỏi phí giao dịch, nên tháng không mua bán gì vẫn bị trừ. Nguyên văn: “Depository fees are separate from transaction fees and apply regardless of whether trading occurs”. ACBS minh hoạ mức “1.000 x 0,27 = 270 VNĐ” mỗi tháng cho 1.000 chứng khoán, và tính cả ngày nghỉ: “Calculations include weekends and holidays”.',
      en: 'Yes. The depository fee pays for holding the securities in the account, entirely separate from trading fees, so a month with no trades is still charged. Verbatim: “Depository fees are separate from transaction fees and apply regardless of whether trading occurs”. ACBS works it through as “1.000 x 0,27 = 270 VNĐ” a month per 1,000 securities, weekends included: “Calculations include weekends and holidays”.',
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
    prompt: { vi: 'Chuyển sang công ty chứng khoán khác có được phí lưu ký rẻ hơn không?' },
    choices: {
      a: { vi: 'Có, mỗi công ty một mức' },
      b: { vi: 'Không — phí trả cho VSDC, do Nhà nước quy định, giống nhau ở mọi công ty' },
      c: { vi: 'Có nếu danh mục lớn' },
      d: { vi: 'Có với tài khoản mở mới' },
    },
    answer: 'b',
    explain: {
      vi: '“Phí này giống nhau ở tất cả công ty chứng khoán (SSI, TCBS, VPS, DSC, v.v.)” và “Mức phí do Nhà nước quy định, không phải do các công ty chứng khoán quyết định”.',
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
    prompt: { vi: 'Nhận cổ tức bằng cổ phiếu. Nghĩa vụ thuế phát sinh thế nào?' },
    choices: {
      a: { vi: 'Miễn thuế vì không nhận tiền' },
      b: { vi: 'Khi bán, chịu 5% trên mệnh giá cộng 0,1% trên giá trị giao dịch' },
      c: { vi: 'Nộp 5% ngay khi nhận' },
      d: { vi: 'Nộp 20% trên phần lãi' },
    },
    answer: 'b',
    explain: {
      vi: 'Theo Nghị định 126/2020/NĐ-CP, “nhà đầu tư bán chứng khoán được chia thưởng, được trả cổ tức sẽ bị khấu trừ 5% thuế thu nhập cá nhân”, cộng 0,1% trên giá trị giao dịch. Nghịch lý được nhà đầu tư nêu: cổ tức cổ phiếu không làm tăng tài sản nhưng vẫn phát sinh nghĩa vụ thuế.',
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
    },
    choices: {
      a: { vi: 'Không, vì đã nộp một lần' },
      b: { vi: 'Có — cổ tức tiền mặt vẫn chịu thuế TNCN 5% khấu trừ tại nguồn' },
      c: { vi: 'Chỉ nộp nếu trên 10 triệu' },
      d: { vi: 'Chỉ nộp với cổ phiếu chưa niêm yết' },
    },
    answer: 'b',
    explain: {
      vi: 'Vẫn phải nộp. Lập luận “thuế chồng thuế” là quan điểm phản biện của nhà đầu tư, không phải căn cứ miễn trừ. Một nhà đầu tư đặt vấn đề vì sao cá nhân vẫn nộp khi doanh nghiệp đã nộp thuế thu nhập doanh nghiệp trên phần lợi nhuận trước khi chia, nguyên văn “the company already paid corporate income tax on profits before distributing dividends”, nhưng luật vẫn quy định cổ đông cá nhân nộp 5% trên cổ tức nhận được.',
      en: 'It is still owed. The “double taxation” argument is an investor objection, not a statutory exemption. One investor asks why individuals still pay when “the company already paid corporate income tax on profits before distributing dividends”, yet the law still charges individual shareholders 5% on the dividend they receive.',
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
    prompt: { vi: 'Khoản nào sau đây được MIỄN thuế TNCN theo Luật số 109/2025/QH15?' },
    choices: {
      a: { vi: 'Cổ tức tiền mặt' },
      b: { vi: 'Lãi tiền gửi tại tổ chức tín dụng' },
      c: { vi: 'Lãi trái phiếu doanh nghiệp' },
      d: { vi: 'Cổ tức bằng cổ phiếu khi bán' },
    },
    answer: 'b',
    explain: {
      vi: 'Luật số 109/2025/QH15, Điều 4 khoản 6 liệt kê thu nhập miễn thuế: “Thu nhập từ lãi trái phiếu chính phủ, lãi trái phiếu chính quyền địa phương, lãi tiền gửi tại tổ chức tín dụng, lãi từ hợp đồng bảo hiểm nhân thọ”. Cổ tức và lãi trái phiếu doanh nghiệp chịu 5% theo Điều 12 khoản 1.',
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
    prompt: { vi: 'Giá hoà vốn của một lệnh mua cổ phiếu gồm những gì?' },
    choices: {
      a: { vi: 'Chỉ giá mua' },
      b: { vi: 'Giá mua + phí mua + phí bán + thuế 0,1% trên giá bán' },
      c: { vi: 'Giá mua + phí mua' },
      d: { vi: 'Giá mua + thuế' },
    },
    answer: 'b',
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
    },
    choices: {
      a: { vi: 'Bằng 0 vì lỗ' },
      b: { vi: 'Lớn hơn người ít giao dịch, chỉ vì khối lượng giao dịch cao' },
      c: { vi: 'Được giảm 50%' },
      d: { vi: 'Tính trên phần lỗ' },
    },
    answer: 'b',
    explain: {
      vi: 'Vẫn phải nộp, và tổng thuế còn tăng theo số vòng giao dịch chứ không theo lãi lỗ: thuế bán 0,1% tính trên giá trị bán của từng lệnh, nên lỗ ròng cả năm vẫn nộp đủ. Bộ Tài chính thừa nhận cơ chế này tạo tình huống bất hợp lý, nguyên văn “active traders pay more total tax simply from higher transaction volume, even with net losses”. Mỗi vòng mua rồi bán gánh: phí mua, phí bán, thuế bán 0,1% và phí lưu ký hằng tháng.',
      en: 'Tax is still owed, and the total rises with the number of round trips rather than with profit or loss: the 0.1% sale tax is charged on each sale value, so a year that ends in a net loss still pays in full. The Ministry of Finance acknowledges the outcome is unreasonable, verbatim: “active traders pay more total tax simply from higher transaction volume, even with net losses”. Every round trip carries buying fees, selling fees, the 0.1% sale tax and the monthly depository fee.',
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
    prompt: { vi: 'Bán xong muốn dùng tiền ngay trước chu kỳ thanh toán T+2. Chi phí phát sinh?' },
    choices: {
      a: { vi: 'Không có' },
      b: { vi: 'Phí ứng trước tiền bán khoảng 0,03–0,04%/ngày' },
      c: { vi: 'Phí cố định 50.000 đồng' },
      d: { vi: 'Lãi suất margin' },
    },
    answer: 'b',
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
    prompt: { vi: 'Phí lưu ký bắt đầu tính từ thời điểm nào?' },
    choices: {
      a: { vi: 'Ngày khớp lệnh mua' },
      b: { vi: 'Ngày chứng khoán về tài khoản (ngày thanh toán)' },
      c: { vi: 'Ngày đặt lệnh' },
      d: { vi: 'Đầu tháng kế tiếp' },
    },
    answer: 'b',
    explain: {
      vi: 'Phí lưu ký tính từ ngày chứng khoán về tài khoản, tức ngày thanh toán, chứ không phải ngày khớp lệnh mua; và chỉ dừng khi quyền sở hữu thực sự chuyển sang người mua lúc bán. Nguyên văn: “Fees begin accruing on settlement day, not purchase date. They end when ownership actually transfers to the buyer during sales”.',
      en: 'The depository fee starts on the day the securities land in the account, the settlement day, not the day the buy order matched; and it stops only when ownership actually transfers to the buyer on a sale. Verbatim: “Fees begin accruing on settlement day, not purchase date. They end when ownership actually transfers to the buyer during sales”.',
    },
    source: {
      url: 'https://thuvienchungkhoan.vn/phi-luu-ky-chung-khoan/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
];
