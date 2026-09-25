/**
 * Câu hỏi kiểm tra hiểu bài — nhóm Phái sinh VN30F.
 *
 * Mỗi câu gắn một nguồn thật; xem bất biến ở `../types.ts`. Không thêm câu nào vào đây mà
 * không có `source.url` trỏ tới chỗ đọc được điều câu hỏi đang kiểm tra.
 */

import type { QuizItem } from '../types';

export const PHAI_SINH: ReadonlyArray<QuizItem> = [
  {
    id: 'Q149',
    formulaId: 'lai-lo-vi-the-long',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Vị thế phái sinh đang lỗ nhưng bạn chưa đóng. Khi nào khoản lỗ được ghi nhận?' },
    choices: {
      a: { vi: 'Chỉ khi đóng vị thế' },
      b: { vi: 'Cuối mỗi phiên, và phải thanh toán bằng tiền trước 9 giờ sáng hôm sau' },
      c: { vi: 'Cuối tháng' },
      d: { vi: 'Ngày đáo hạn' },
    },
    answer: 'b',
    explain: {
      vi: 'Phái sinh hạch toán theo cơ chế mark-to-market. “Cuối mỗi ngày giao dịch, NĐT phải thanh toán toàn bộ lãi/lỗ phát sinh theo giá thực tế của HĐTL” và “Nếu tài khoản ghi nhận lỗ ròng, NĐT phải thanh toán toàn bộ số lỗ phát sinh trước 9 giờ sáng ngày hôm sau”. Không có chuyện “ôm lỗ chờ gỡ” như cổ phiếu cơ sở.',
    },
    source: {
      url: 'https://www.vfs.com.vn/cach-dau-tu-chung-khoan-phai-sinh',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q150',
    formulaId: 'lai-lo-vi-the-long',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Phiên đáo hạn 21/05/2020, HĐTL đóng cửa giá trần 864 điểm trong khi VN30 đóng cửa 815,55 điểm. Người mua tại giá trần lỗ bao nhiêu mỗi hợp đồng?',
    },
    facts: [
      { label: { vi: 'HĐTL VN30 đóng cửa (giá trần)' }, value: { vi: '864,00 điểm' } },
      { label: { vi: 'VN30 đóng cửa cùng phiên' }, value: { vi: '815,55 điểm' } },
      { label: { vi: 'Hệ số nhân hợp đồng' }, value: { vi: '100.000 đồng/điểm' } },
    ],
    choices: {
      a: { vi: 'Không lỗ vì mua đúng giá khớp' },
      b: { vi: '4,845 triệu đồng' },
      c: { vi: '480.000 đồng' },
      d: { vi: '48,45 triệu đồng' },
    },
    answer: 'b',
    explain: {
      vi: 'Lãi/lỗ ngày đáo hạn tính theo giá thanh toán dựa trên chỉ số VN30, không theo giá HĐTL. Chênh 48,45 điểm × hệ số nhân 100.000 đồng = 4,845 triệu đồng/hợp đồng. Báo chí ghi nhận: “mức lỗ đến từ sự chênh lệch giữa giá phái sinh và chỉ số cơ sở là 4,845 triệu đồng/hợp đồng”.',
    },
    source: {
      url: 'https://tinnhanhchungkhoan.vn/chung-khoan/chay-tai-khoan-trong-phien-dao-han-chung-khoan-phai-sinh-328263.html',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q151',
    formulaId: 'lai-lo-vi-the-short',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Cùng phiên 21/05/2020, người BÁN trong phiên ATC ở giá trần thì sao?' },
    choices: {
      a: { vi: 'Lỗ nặng vì giá tăng kịch trần' },
      b: { vi: 'Lãi đúng phần chênh 48,45 điểm khi thanh toán về VN30' },
      c: { vi: 'Hoà vốn' },
      d: { vi: 'Bị huỷ lệnh' },
    },
    answer: 'b',
    explain: {
      vi: 'Với hợp đồng đáo hạn, thanh toán về chỉ số cơ sở nên bên bán ở giá trần hưởng đúng phần chênh. Tổng chênh lệch giá trị trong phiên ATC gần 17,5 tỷ đồng, chuyển từ bên mua sang bên bán.',
    },
    source: {
      url: 'https://tuoitre.vn/nld/vnmoney/chay-tai-khoan-trong-phien-dao-han-chung-khoan-phai-sinh-20200525101757216.htm',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q152',
    formulaId: 'co-vi-the-phai-sinh',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Ký quỹ gần 14 triệu đồng cho một hợp đồng VN30F. Quy mô vị thế danh nghĩa là bao nhiêu?',
    },
    choices: {
      a: { vi: '14 triệu' },
      b: { vi: '80,75 triệu đồng (tại mức 807,5 điểm)' },
      c: { vi: '28 triệu' },
      d: { vi: 'Bằng số dư tài khoản' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn ghi nhận đúng cặp số này: “giá trị danh nghĩa của 1 hợp đồng là 80,75 triệu đồng” trong khi “nhà đầu tư chỉ cần ký quỹ gần 14 triệu đồng”. Bạn đang chịu rủi ro trên toàn bộ quy mô danh nghĩa, không phải trên số tiền đã nộp.',
    },
    source: {
      url: 'https://tinnhanhchungkhoan.vn/chung-khoan/chay-tai-khoan-trong-phien-dao-han-chung-khoan-phai-sinh-328263.html',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q153',
    formulaId: 'co-vi-the-phai-sinh',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: { vi: 'Hệ số nhân hợp đồng VN30F là bao nhiêu?' },
    choices: {
      a: { vi: '10.000 đồng/điểm' },
      b: { vi: '100.000 đồng/điểm' },
      c: { vi: '1 triệu đồng/điểm' },
      d: { vi: 'Thay đổi theo phiên' },
    },
    answer: 'b',
    explain: {
      vi: 'Quy định giao dịch HĐTL chỉ số VN30: “Hệ số nhân hợp đồng: 100.000 đồng”. Nghĩa là biến động 10 điểm chỉ số bằng 1 triệu đồng mỗi hợp đồng — con số mà nhiều người mới coi là “vài điểm thì có đáng bao nhiêu”.',
    },
    source: {
      url: 'https://www.phs.vn/san-pham-dich-vu/quy-dinh-ve-hdtl-chi-so-vn-30/22',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q154',
    formulaId: 'co-vi-the-phai-sinh',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: { vi: 'Thuế TNCN với giao dịch phái sinh tính trên cái gì?' },
    choices: {
      a: { vi: 'Phần lãi' },
      b: { vi: 'Giá chuyển nhượng từng lần — lỗ vẫn phải nộp' },
      c: { vi: 'Số hợp đồng' },
      d: { vi: 'Tiền ký quỹ' },
    },
    answer: 'b',
    explain: {
      vi: 'Quy định: “Thuế TNCN = Giá chuyển nhượng từng lần * 0,1%”. Giống thuế chứng khoán cơ sở, nghĩa vụ thuế không phụ thuộc lãi hay lỗ.',
    },
    source: {
      url: 'https://www.phs.vn/san-pham-dich-vu/quy-dinh-ve-hdtl-chi-so-vn-30/22',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q155',
    formulaId: 'don-bay-hieu-dung',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Ký quỹ phái sinh có phải là khoản vay margin không?' },
    choices: {
      a: { vi: 'Phải, và phải trả lãi vay' },
      b: {
        vi: 'Không — đó là tài sản đảm bảo thanh toán, không chịu lãi vay nhưng phải thanh toán lãi/lỗ hằng ngày',
      },
      c: { vi: 'Phải, nhưng lãi suất thấp hơn' },
      d: { vi: 'Tuỳ công ty chứng khoán' },
    },
    answer: 'b',
    explain: {
      vi: 'Không. Ký quỹ phái sinh là tài sản đặt cọc bảo đảm nghĩa vụ thanh toán, không phải tiền vay, nên không phát sinh lãi vay. VnEconomy gọi nó là “tài sản đảm bảo thanh toán”; BSC khẳng định “nhà đầu tư không phải chịu thêm bất cứ một khoản lãi vay nào”; CME Group nói thẳng rằng đây không phải khoản trả trước và người đặt ký quỹ cũng không sở hữu tài sản cơ sở, nguyên văn: “It is not a down payment and you do not own the underlying commodity”.',
      en: 'No. Derivatives margin is collateral posted to secure the settlement obligation, not borrowed money, so no loan interest arises. VnEconomy calls it “tài sản đảm bảo thanh toán” (settlement collateral); BSC states “nhà đầu tư không phải chịu thêm bất cứ một khoản lãi vay nào” (the investor bears no loan interest at all); CME Group puts it plainly: “It is not a down payment and you do not own the underlying commodity”.',
    },
    source: {
      url: 'https://vneconomy.vn/chung-khoan-phai-sinh-truoc-gio-g-4-con-ac-mong-margin-call.htm',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q156',
    formulaId: 'don-bay-hieu-dung',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Mức lỗ tối đa khi giao dịch phái sinh có bằng số tiền đã ký quỹ không?' },
    choices: {
      a: { vi: 'Có, đó là toàn bộ rủi ro' },
      b: { vi: 'Không — có thể lỗ vượt 100% vốn khi giá gap qua điểm cắt lỗ' },
      c: { vi: 'Có nếu đặt lệnh dừng lỗ' },
      d: { vi: 'Có với hợp đồng tháng gần' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn VN: “có thể mất hơn 100% vốn nếu không quản lý rủi ro”. Đây là khác biệt cốt lõi với mua cổ phiếu bằng tiền mặt, nơi mức lỗ tối đa đúng bằng số tiền bỏ ra.',
    },
    source: {
      url: 'https://vimo.cuthongthai.vn/blog/phai-sinh-vn30-huong-dan-co-ban',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q157',
    formulaId: 'don-bay-hieu-dung',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Vị thế của bạn đang LÃI. Có thể bị gọi ký quỹ bổ sung không?' },
    choices: {
      a: { vi: 'Không bao giờ' },
      b: {
        vi: 'Có — khi giá trị tài sản tăng thì quy mô giao dịch tăng, yêu cầu ký quỹ tăng theo',
      },
      c: { vi: 'Chỉ khi giữ qua đêm' },
      d: { vi: 'Chỉ với vị thế bán' },
    },
    answer: 'b',
    explain: {
      vi: 'VnEconomy nêu đúng nghịch lý này: “vị thế có lãi, nhưng nhà đầu tư vẫn có thể bị call margin” vì “Khi giá trị tài sản tăng lên tức là quy mô giao dịch cũng tăng, đồng nghĩa với việc phải tăng khoản đặt cọc”.',
    },
    source: {
      url: 'https://vneconomy.vn/chung-khoan-phai-sinh-truoc-gio-g-4-con-ac-mong-margin-call.htm',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q158',
    formulaId: 'don-bay-hieu-dung',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Đòn bẩy phái sinh thường được nói là “khoảng 6 lần”. Con số này cố định không?',
    },
    choices: {
      a: { vi: 'Cố định theo luật' },
      b: {
        vi: 'Không — phụ thuộc tỷ lệ ký quỹ do VSDC/CTCK áp dụng và mức điểm chỉ số; các nguồn ghi 13%, 15%, 17%, 15–20% ở những thời điểm khác nhau',
      },
      c: { vi: 'Cố định 10 lần' },
      d: { vi: 'Do nhà đầu tư tự chọn' },
    },
    answer: 'b',
    explain: {
      vi: 'VFS tính đòn bẩy “cao gấp khoảng 6 lần chứng khoán cơ sở” với ký quỹ 13%; BSC nêu 15%; nguồn khác nêu 15–20%; tài liệu Pinetree nêu IM 17%. Vì vậy tỷ lệ ký quỹ phải là tham số cấu hình trong app, không hard-code.',
    },
    source: {
      url: 'https://www.vfs.com.vn/cach-dau-tu-chung-khoan-phai-sinh',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q159',
    formulaId: 'so-hop-dong-toi-da',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: { vi: 'Giới hạn vị thế HĐTL VN30 với nhà đầu tư cá nhân là bao nhiêu?' },
    choices: {
      a: { vi: 'Không giới hạn' },
      b: { vi: 'Dưới 5.000 hợp đồng' },
      c: { vi: 'Dưới 500 hợp đồng' },
      d: { vi: 'Dưới 20.000 hợp đồng' },
    },
    answer: 'b',
    explain: {
      vi: 'Quy định: cá nhân “Dưới 5.000 Hợp đồng”, tổ chức dưới 10.000, nhà đầu tư chứng khoán chuyên nghiệp dưới 20.000. Nhiều người không biết thị trường VN có trần giới hạn vị thế theo từng nhà đầu tư.',
    },
    source: {
      url: 'https://www.phs.vn/san-pham-dich-vu/quy-dinh-ve-hdtl-chi-so-vn-30/22',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q160',
    formulaId: 'so-hop-dong-toi-da',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Lấy toàn bộ vốn chia cho ký quỹ ban đầu để mở tối đa số hợp đồng. Sai ở đâu?' },
    choices: {
      a: { vi: 'Không sai nếu có lệnh dừng lỗ' },
      b: {
        vi: 'Phải chừa tiền cho ký quỹ biến đổi và call margin — khuyến nghị giữ dự phòng tiền mặt bằng 200% ký quỹ ban đầu',
      },
      c: { vi: 'Phải chia cho 2' },
      d: { vi: 'Chỉ sai với vị thế bán' },
    },
    answer: 'b',
    explain: {
      vi: 'Bộ quy tắc trong nguồn VN: không dùng quá 30% tổng vốn cho phái sinh, và giữ sẵn tiền mặt bằng 200% ký quỹ ban đầu. DNSE khuyến nghị “phân bổ nguồn vốn hợp lý”, tránh đánh tất tay.',
    },
    source: {
      url: 'https://vimo.cuthongthai.vn/blog/phai-sinh-vn30-huong-dan-co-ban',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q161',
    formulaId: 'so-hop-dong-toi-da',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: { vi: 'Tỷ lệ sử dụng ký quỹ chạm 100%. Điều gì xảy ra?' },
    choices: {
      a: { vi: 'Vẫn giao dịch bình thường' },
      b: { vi: 'VSD đề nghị tạm ngừng giao dịch; CTCK còn đặt ngưỡng xử lý thấp hơn nhiều' },
      c: { vi: 'Tài khoản bị đóng' },
      d: { vi: 'Được tự động nạp thêm' },
    },
    answer: 'b',
    explain: {
      vi: '“Khi tỷ lệ sử dụng ký quỹ đạt 100%, VSD sẽ gửi thông báo cho sở giao dịch đề nghị tạm ngừng giao dịch”, kèm không cho mở vị thế mới. Pinetree cảnh báo và đóng vị thế từ mức 75–90%, nên số hợp đồng thực mở được luôn ít hơn tính toán lý thuyết.',
    },
    source: {
      url: 'https://vneconomy.vn/chung-khoan-phai-sinh-truoc-gio-g-4-con-ac-mong-margin-call.htm',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q162',
    formulaId: 'basis-vn30f',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Bạn đọc “basis âm” ở hai nguồn khác nhau. Vì sao có thể hiểu ngược?' },
    choices: {
      a: { vi: 'Một nguồn sai' },
      b: {
        vi: 'Hai quy ước dấu ngược nhau: giáo khoa quốc tế dùng Spot − Futures, bản tin VN dùng Futures − Spot',
      },
      c: { vi: 'Do làm tròn' },
      d: { vi: 'Do khác hợp đồng tháng' },
    },
    answer: 'b',
    explain: {
      vi: 'Finhay dùng “Basis = Giá giao ngay (Spot Price) − Giá tương lai (Futures Price)” và cảnh báo “quy ước tính basis khác nhau giữa các sàn”; trong khi bản tin MBS ghi “basis được nới rất rộng -15,29 điểm” với nghĩa phái sinh thấp hơn cơ sở. App cần nêu rõ quy ước mình dùng.',
    },
    source: {
      url: 'https://www.finhay.com.vn/basis-la-gi',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q163',
    formulaId: 'basis-vn30f',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Basis nới rộng mạnh. Đây có phải cơ hội dễ kiếm lời không?' },
    choices: {
      a: { vi: 'Có, chênh lệch sẽ thu hẹp' },
      b: {
        vi: 'Bản tin phái sinh ghi ngược lại: basis nới rộng khiến hoạt động trading khó khăn hơn',
      },
      c: { vi: 'Có nếu basis dương' },
      d: { vi: 'Có với hợp đồng tháng xa' },
    },
    answer: 'b',
    explain: {
      vi: 'Tiêu đề bản tin MBS: “HĐTL VN30 – CHÊNH LỆCH BASIS KHIẾN HOẠT ĐỘNG TRADING GẶP NHIỀU KHÓ KHĂN”, và “với độ lệch pha mạnh giữa hai thị trường vẫn đang -15,29 điểm thì hoạt động trading của giới đầu tư sẽ gặp nhiều khó khăn”.',
    },
    source: {
      url: 'https://www.mbs.com.vn/media/nijlemqy/ban-tin-phai-sinh_20190222.pdf',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q164',
    formulaId: 'basis-vn30f',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Càng gần đáo hạn basis càng hội tụ êm ả về 0. Đúng không?' },
    choices: {
      a: { vi: 'Đúng, đó là quy luật' },
      b: {
        vi: 'Không — phiên ATC ngày đáo hạn có thể bật ra basis rất lớn, như +48,45 điểm ngày 21/05/2020',
      },
      c: { vi: 'Đúng với hợp đồng tháng gần' },
      d: { vi: 'Đúng nếu thanh khoản cao' },
    },
    answer: 'b',
    explain: {
      vi: 'Ngày 21/05/2020, “giá hợp đồng tương lai đáo hạn trong phiên này vọt tăng, đóng cửa tại mức trần, đạt 864 điểm, cao hơn 48,45 điểm so với mức giá đóng cửa của VN30 (815,55 điểm)”.',
    },
    source: {
      url: 'https://tinnhanhchungkhoan.vn/chung-khoan/chay-tai-khoan-trong-phien-dao-han-chung-khoan-phai-sinh-328263.html',
      kind: 'trai-nghiem',
      vietnam: true,
    },
  },
  {
    id: 'Q165',
    formulaId: 'gia-ly-thuyet-vn30f',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: 'Giá lý thuyết của HĐTL VN30 là gì?' },
    choices: {
      a: { vi: 'Dự báo VN30 sẽ ở đâu khi đáo hạn' },
      b: { vi: 'Giá cân bằng theo chi phí nắm giữ: giá cơ sở cộng lãi vay trừ cổ tức' },
      c: { vi: 'Trung bình giá 30 phiên' },
      d: { vi: 'Giá do sở giao dịch công bố' },
    },
    answer: 'b',
    explain: {
      vi: 'Giá lý thuyết là giá chỉ số cơ sở cộng chi phí nắm giữ tới ngày đáo hạn, chứ không phải mức chỉ số mà thị trường dự đoán. BSC viết công thức “Fair Value of the Futures = Spot Price + Cost of Carry”, và bản tiếng Việt trên chính trang ấy: “Giá tương lai = Giá cơ sở + (Lãi vay – cổ tức)”. Phần cộng thêm chỉ là lãi vay trừ đi cổ tức nhận được trong kỳ nắm giữ.',
      en: 'The theoretical price is the spot index plus the cost of carrying the position to expiry, not the level the market expects the index to reach. BSC gives the formula “Fair Value of the Futures = Spot Price + Cost of Carry”, and in Vietnamese on the same page: “Giá tương lai = Giá cơ sở + (Lãi vay – cổ tức)”. The add-on is only the borrowing cost less the dividends received over the holding period.',
    },
    source: {
      url: 'https://www.bsc.com.vn/tin-tuc/tin-chi-tiet/653080-dinh-gia-hop-dong-tuong-lai',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q166',
    formulaId: 'gia-ly-thuyet-vn30f',
    format: 'trac-nghiem',
    kind: 'dieu-kien',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Giá thực tế lệch giá lý thuyết. Có arbitrage phi rủi ro ở thị trường VN không?',
    },
    choices: {
      a: { vi: 'Có, rất dễ' },
      b: {
        vi: 'Rất khó — khó dựng rổ chỉ số chính xác, bị hạn chế bán khống cơ sở, chi phí có thể triệt tiêu lợi nhuận',
      },
      c: { vi: 'Có nếu chênh trên 1 điểm' },
      d: { vi: 'Chỉ tổ chức nước ngoài làm được' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn phân tích rào cản tại VN: cần vốn lớn để dựng rổ chỉ số, hạn chế bán khống cổ phiếu cơ sở, cộng spread và trượt giá; mức chênh cần thiết thường phải từ 5 điểm trở lên mới đáng làm.',
    },
    source: {
      url: 'https://vfin.vn/arbitrage-chi-so-vn30/',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
  {
    id: 'Q167',
    formulaId: 'gia-ly-thuyet-vn30f',
    format: 'trac-nghiem',
    kind: 'dinh-che',
    evidence: 'quy-dinh',
    prompt: { vi: 'Giá thanh toán cuối cùng của HĐTL VN30 hiện được xác định thế nào?' },
    choices: {
      a: { vi: 'Giá đóng cửa VN30 ngày giao dịch cuối' },
      b: {
        vi: 'Trung bình số học chỉ số trong 30 phút cuối, sau khi loại 3 giá trị cao nhất và 3 giá trị thấp nhất',
      },
      c: { vi: 'Giá khớp cuối của HĐTL' },
      d: { vi: 'Trung bình cả phiên' },
    },
    answer: 'b',
    explain: {
      vi: 'Tài liệu PHS mô tả cách tính hiện hành; tài liệu MBS cũ hơn vẫn ghi “Theo Giá đóng cửa của chỉ số VN30”. Quy định đã đổi sau các phiên đáo hạn bất thường — cần xác minh mốc hiệu lực trước khi đưa vào app.',
    },
    source: {
      url: 'https://www.phs.vn/san-pham-dich-vu/quy-dinh-ve-hdtl-chi-so-vn-30/22',
      kind: 'quy-dinh',
      vietnam: true,
    },
  },
  {
    id: 'Q168',
    formulaId: 'lai-lo-vi-the-short',
    format: 'trac-nghiem',
    kind: 'hau-qua',
    evidence: 'ngo-nhan',
    prompt: {
      vi: 'Theo thống kê được báo chí dẫn, tỷ lệ nhà đầu tư có lợi nhuận trên thị trường phái sinh VN là bao nhiêu?',
    },
    choices: {
      a: { vi: 'Khoảng 50%' },
      b: { vi: 'Khoảng 5%' },
      c: { vi: 'Khoảng 30%' },
      d: { vi: 'Không có số liệu' },
    },
    answer: 'b',
    explain: {
      vi: 'CafeF: “chỉ có 5% nhà đầu tư thu được lợi nhuận trên thị trường phái sinh, còn lại đa phần thua lỗ”. Ông Vũ Duy Khánh chỉ ra lỗi phổ biến: “giao dịch nhiều nhưng hiệu quả thấp, vì thường chốt lời các khoản lãi nhỏ, trong khi lỗ lớn”.',
    },
    source: {
      url: 'https://cafef.vn/goc-toi-cua-chung-khoan-phai-sinh-20180712090321451.chn',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
];
