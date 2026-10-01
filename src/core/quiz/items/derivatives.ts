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
    prompt: {
      vi: 'Vị thế phái sinh đang lỗ nhưng bạn chưa đóng. Khi nào khoản lỗ được ghi nhận?',
      en: 'A derivatives position is running a loss but you have not closed it. When is the loss recognized?',
    },
    choices: {
      a: { vi: 'Chỉ khi đóng vị thế', en: 'Only when the position is closed' },
      b: {
        vi: 'Cuối mỗi phiên, và phải thanh toán bằng tiền trước 9 giờ sáng hôm sau',
        en: 'At the end of every session, and it must be settled in cash before 9am the next morning',
      },
      c: { vi: 'Cuối tháng', en: 'At month end' },
      d: { vi: 'Ngày đáo hạn', en: 'On the expiry date' },
    },
    answer: 'b',
    explain: {
      vi: 'Phái sinh hạch toán theo cơ chế mark-to-market. “Cuối mỗi ngày giao dịch, NĐT phải thanh toán toàn bộ lãi/lỗ phát sinh theo giá thực tế của HĐTL” và “Nếu tài khoản ghi nhận lỗ ròng, NĐT phải thanh toán toàn bộ số lỗ phát sinh trước 9 giờ sáng ngày hôm sau”. Không có chuyện “ôm lỗ chờ gỡ” như cổ phiếu cơ sở.',
      en: 'Derivatives are accounted for on a mark-to-market basis. “Cuối mỗi ngày giao dịch, NĐT phải thanh toán toàn bộ lãi/lỗ phát sinh theo giá thực tế của HĐTL” and “Nếu tài khoản ghi nhận lỗ ròng, NĐT phải thanh toán toàn bộ số lỗ phát sinh trước 9 giờ sáng ngày hôm sau”. There is no “ôm lỗ chờ gỡ” (holding a loss and waiting for it to recover) the way there is with the underlying stock.',
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
      en: 'On the 21/05/2020 expiry session the futures contract closed at its ceiling price of 864 points while VN30 closed at 815.55 points. How much does a buyer at the ceiling price lose per contract?',
    },
    facts: [
      {
        label: { vi: 'HĐTL VN30 đóng cửa (giá trần)', en: 'VN30 futures close (ceiling price)' },
        value: { vi: '864,00 điểm', en: '864.00 points' },
      },
      {
        label: { vi: 'VN30 đóng cửa cùng phiên', en: 'VN30 close in the same session' },
        value: { vi: '815,55 điểm', en: '815.55 points' },
      },
      {
        label: { vi: 'Hệ số nhân hợp đồng', en: 'Contract multiplier' },
        value: { vi: '100.000 đồng/điểm', en: 'VND 100,000/point' },
      },
    ],
    choices: {
      a: {
        vi: 'Không lỗ vì mua đúng giá khớp',
        en: 'No loss, since the trade matched at the quoted price',
      },
      b: { vi: '480.000 đồng', en: 'VND 480,000' },
      c: { vi: '4,845 triệu đồng', en: 'VND 4.845 million' },
      d: { vi: '48,45 triệu đồng', en: 'VND 48.45 million' },
    },
    answer: 'c',
    explain: {
      vi: 'Lãi/lỗ ngày đáo hạn tính theo giá thanh toán dựa trên chỉ số VN30, không theo giá HĐTL. Chênh 48,45 điểm × hệ số nhân 100.000 đồng = 4,845 triệu đồng/hợp đồng. Báo chí ghi nhận: “mức lỗ đến từ sự chênh lệch giữa giá phái sinh và chỉ số cơ sở là 4,845 triệu đồng/hợp đồng”.',
      en: 'The expiry-day P&L is computed against the settlement price, which is based on the VN30 index, not the futures price. The 48.45-point gap × the 100,000 ₫ multiplier = VND 4.845 million per contract. The press reported: “mức lỗ đến từ sự chênh lệch giữa giá phái sinh và chỉ số cơ sở là 4,845 triệu đồng/hợp đồng”.',
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
    prompt: {
      vi: 'Cùng phiên 21/05/2020, người BÁN trong phiên ATC ở giá trần thì sao?',
      en: 'In that same 21/05/2020 session, what happened to the SELLER who traded at the ceiling price in the ATC session?',
    },
    choices: {
      a: {
        vi: 'Lỗ nặng vì giá tăng kịch trần',
        en: 'A heavy loss, since the price rose to its ceiling',
      },
      b: { vi: 'Hoà vốn', en: 'Broke even' },
      c: {
        vi: 'Lãi đúng phần chênh 48,45 điểm khi thanh toán về VN30',
        en: 'Gained exactly the 48.45-point gap once settlement was pegged to VN30',
      },
      d: { vi: 'Bị huỷ lệnh', en: 'Had the order canceled' },
    },
    answer: 'c',
    explain: {
      vi: 'Với hợp đồng đáo hạn, thanh toán về chỉ số cơ sở nên bên bán ở giá trần hưởng đúng phần chênh. Tổng chênh lệch giá trị trong phiên ATC gần 17,5 tỷ đồng, chuyển từ bên mua sang bên bán.',
      en: 'For an expiring contract, settlement is pegged to the underlying index, so a seller at the ceiling price captures exactly that gap. The total value transferred in the ATC session was nearly VND 17.5 billion, moving from buyers to sellers.',
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
      en: 'Margin of nearly VND 14 million is posted for one VN30F contract. What is the notional size of the position?',
    },
    choices: {
      a: { vi: '14 triệu', en: 'VND 14 million' },
      b: {
        vi: '80,75 triệu đồng (tại mức 807,5 điểm)',
        en: 'VND 80.75 million (at the 807.5-point level)',
      },
      c: { vi: '28 triệu', en: 'VND 28 million' },
      d: { vi: 'Bằng số dư tài khoản', en: 'Equal to the account balance' },
    },
    answer: 'b',
    explain: {
      vi: 'Nguồn ghi nhận đúng cặp số này: “giá trị danh nghĩa của 1 hợp đồng là 80,75 triệu đồng” trong khi “nhà đầu tư chỉ cần ký quỹ gần 14 triệu đồng”. Bạn đang chịu rủi ro trên toàn bộ quy mô danh nghĩa, không phải trên số tiền đã nộp.',
      en: 'The source states exactly this pair of numbers: “giá trị danh nghĩa của 1 hợp đồng là 80,75 triệu đồng” while “nhà đầu tư chỉ cần ký quỹ gần 14 triệu đồng”. You are exposed to risk on the full notional size, not merely on the margin you posted.',
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
    prompt: {
      vi: 'Hệ số nhân hợp đồng VN30F là bao nhiêu?',
      en: 'What is the contract multiplier for a VN30F futures contract?',
    },
    choices: {
      a: { vi: '100.000 đồng/điểm', en: 'VND 100,000/point' },
      b: { vi: '10.000 đồng/điểm', en: 'VND 10,000/point' },
      c: { vi: '1 triệu đồng/điểm', en: 'VND 1 million/point' },
      d: { vi: 'Thay đổi theo phiên', en: 'It changes every session' },
    },
    answer: 'a',
    explain: {
      vi: 'Quy định giao dịch HĐTL chỉ số VN30: “Hệ số nhân hợp đồng: 100.000 đồng”. Nghĩa là biến động 10 điểm chỉ số bằng 1 triệu đồng mỗi hợp đồng — con số mà nhiều người mới coi là “vài điểm thì có đáng bao nhiêu”.',
      en: 'The VN30 index futures trading rules state: “Hệ số nhân hợp đồng: 100.000 đồng”. That means a 10-point index move is worth VND 1 million per contract — a figure many newcomers dismiss as “vài điểm thì có đáng bao nhiêu”.',
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
    prompt: {
      vi: 'Thuế TNCN với giao dịch phái sinh tính trên cái gì?',
      en: 'What is personal income tax on a derivatives trade levied on?',
    },
    choices: {
      a: {
        vi: 'Giá chuyển nhượng từng lần — lỗ vẫn phải nộp',
        en: 'The transfer value of each trade — it is owed even on a losing trade',
      },
      b: { vi: 'Phần lãi', en: 'The gain portion' },
      c: { vi: 'Số hợp đồng', en: 'The number of contracts' },
      d: { vi: 'Tiền ký quỹ', en: 'The margin amount' },
    },
    answer: 'a',
    explain: {
      vi: 'Quy định: “Thuế TNCN = Giá chuyển nhượng từng lần * 0,1%”. Giống thuế chứng khoán cơ sở, nghĩa vụ thuế không phụ thuộc lãi hay lỗ.',
      en: 'The regulation states: “Thuế TNCN = Giá chuyển nhượng từng lần * 0,1%”. Just as with the underlying stock, the tax obligation does not depend on whether the trade made a gain or a loss.',
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
    prompt: {
      vi: 'Ký quỹ phái sinh có phải là khoản vay margin không?',
      en: 'Is derivatives margin the same thing as a margin loan?',
    },
    choices: {
      a: {
        vi: 'Không — đó là tài sản đảm bảo thanh toán, không chịu lãi vay nhưng phải thanh toán lãi/lỗ hằng ngày',
        en: 'No — it is collateral securing settlement, it carries no loan interest, but daily gains/losses must still be settled',
      },
      b: { vi: 'Phải, và phải trả lãi vay', en: 'Yes, and loan interest is owed on it' },
      c: { vi: 'Phải, nhưng lãi suất thấp hơn', en: 'Yes, but at a lower interest rate' },
      d: { vi: 'Tuỳ công ty chứng khoán', en: 'It depends on the brokerage' },
    },
    answer: 'a',
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
    prompt: {
      vi: 'Mức lỗ tối đa khi giao dịch phái sinh có bằng số tiền đã ký quỹ không?',
      en: 'Is the maximum possible loss on a derivatives trade capped at the margin posted?',
    },
    choices: {
      a: { vi: 'Có, đó là toàn bộ rủi ro', en: 'Yes, that is the entire risk' },
      b: { vi: 'Có nếu đặt lệnh dừng lỗ', en: 'Yes, if a stop-loss order is placed' },
      c: { vi: 'Có với hợp đồng tháng gần', en: 'Yes, for the near-month contract' },
      d: {
        vi: 'Không — có thể lỗ vượt 100% vốn khi giá gap qua điểm cắt lỗ',
        en: 'No — the loss can exceed 100% of capital when the price gaps through the stop-loss level',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Nguồn VN: “có thể mất hơn 100% vốn nếu không quản lý rủi ro”. Đây là khác biệt cốt lõi với mua cổ phiếu bằng tiền mặt, nơi mức lỗ tối đa đúng bằng số tiền bỏ ra.',
      en: 'The Vietnamese source states: “có thể mất hơn 100% vốn nếu không quản lý rủi ro”. This is the core difference from buying a stock outright in cash, where the maximum loss is exactly the amount paid.',
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
    prompt: {
      vi: 'Vị thế của bạn đang LÃI. Có thể bị gọi ký quỹ bổ sung không?',
      en: 'Your position is currently PROFITABLE. Can you still get a margin call?',
    },
    choices: {
      a: { vi: 'Không bao giờ', en: 'Never' },
      b: { vi: 'Chỉ khi giữ qua đêm', en: 'Only if the position is held overnight' },
      c: {
        vi: 'Có — khi giá trị tài sản tăng thì quy mô giao dịch tăng, yêu cầu ký quỹ tăng theo',
        en: 'Yes — as the asset value rises the position size grows with it, so the margin requirement rises too',
      },
      d: { vi: 'Chỉ với vị thế bán', en: 'Only on a short position' },
    },
    answer: 'c',
    explain: {
      vi: 'VnEconomy nêu đúng nghịch lý này: “vị thế có lãi, nhưng nhà đầu tư vẫn có thể bị call margin” vì “Khi giá trị tài sản tăng lên tức là quy mô giao dịch cũng tăng, đồng nghĩa với việc phải tăng khoản đặt cọc”.',
      en: 'VnEconomy states this exact paradox: “vị thế có lãi, nhưng nhà đầu tư vẫn có thể bị call margin” because “Khi giá trị tài sản tăng lên tức là quy mô giao dịch cũng tăng, đồng nghĩa với việc phải tăng khoản đặt cọc”.',
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
      en: 'Derivatives leverage is often quoted as “about 6 times”. Is that figure fixed?',
    },
    choices: {
      a: { vi: 'Cố định theo luật', en: 'Fixed by law' },
      b: { vi: 'Cố định 10 lần', en: 'Fixed at 10 times' },
      c: {
        vi: 'Không — phụ thuộc tỷ lệ ký quỹ do VSDC/CTCK áp dụng và mức điểm chỉ số; các nguồn ghi 13%, 15%, 17%, 15–20% ở những thời điểm khác nhau',
        en: 'No — it depends on the margin rate set by VSDC/the broker and on the index level; sources cite 13%, 15%, 17%, 15–20% at different points in time',
      },
      d: { vi: 'Do nhà đầu tư tự chọn', en: 'The investor chooses it' },
    },
    answer: 'c',
    explain: {
      vi: 'VFS tính đòn bẩy “cao gấp khoảng 6 lần chứng khoán cơ sở” với ký quỹ 13%; BSC nêu 15%; nguồn khác nêu 15–20%; tài liệu Pinetree nêu IM 17%. Vì vậy tỷ lệ ký quỹ phải là tham số cấu hình trong app, không hard-code.',
      en: 'VFS puts leverage at “cao gấp khoảng 6 lần chứng khoán cơ sở” with a 13% margin rate; BSC cites 15%; another source cites 15–20%; Pinetree’s documentation cites an initial margin of 17%. So the margin rate has to be a configurable parameter in the app, not hard-coded.',
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
    prompt: {
      vi: 'Giới hạn vị thế HĐTL VN30 với nhà đầu tư cá nhân là bao nhiêu?',
      en: 'What is the VN30 futures position limit for an individual investor?',
    },
    choices: {
      a: { vi: 'Không giới hạn', en: 'No limit' },
      b: { vi: 'Dưới 5.000 hợp đồng', en: 'Under 5,000 contracts' },
      c: { vi: 'Dưới 500 hợp đồng', en: 'Under 500 contracts' },
      d: { vi: 'Dưới 20.000 hợp đồng', en: 'Under 20,000 contracts' },
    },
    answer: 'b',
    explain: {
      vi: 'Quy định: cá nhân “Dưới 5.000 Hợp đồng”, tổ chức dưới 10.000, nhà đầu tư chứng khoán chuyên nghiệp dưới 20.000. Nhiều người không biết thị trường VN có trần giới hạn vị thế theo từng nhà đầu tư.',
      en: 'The regulation sets an individual’s limit at “Dưới 5.000 Hợp đồng”, an institution’s at under 10,000, and a professional securities investor’s at under 20,000. Many people do not realize the Vietnamese market caps position size per investor at all.',
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
    prompt: {
      vi: 'Lấy toàn bộ vốn chia cho ký quỹ ban đầu để mở tối đa số hợp đồng. Sai ở đâu?',
      en: 'Dividing all of your capital by the initial margin to open the maximum number of contracts. What is wrong with that?',
    },
    choices: {
      a: {
        vi: 'Không sai nếu có lệnh dừng lỗ',
        en: 'Nothing, as long as a stop-loss order is placed',
      },
      b: { vi: 'Phải chia cho 2', en: 'You must divide by 2' },
      c: {
        vi: 'Phải chừa tiền cho ký quỹ biến đổi và call margin — khuyến nghị giữ dự phòng tiền mặt bằng 200% ký quỹ ban đầu',
        en: 'You must leave room for variation margin and margin calls — the recommendation is to hold cash reserves equal to 200% of the initial margin',
      },
      d: { vi: 'Chỉ sai với vị thế bán', en: 'It is only wrong for a short position' },
    },
    answer: 'c',
    explain: {
      vi: 'Bộ quy tắc trong nguồn VN: không dùng quá 30% tổng vốn cho phái sinh, và giữ sẵn tiền mặt bằng 200% ký quỹ ban đầu. DNSE khuyến nghị “phân bổ nguồn vốn hợp lý”, tránh đánh tất tay.',
      en: 'The rule set in the Vietnamese source: never put more than 30% of total capital into derivatives, and keep cash on hand equal to 200% of the initial margin. DNSE recommends “phân bổ nguồn vốn hợp lý”, avoiding an all-in bet.',
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
    prompt: {
      vi: 'Tỷ lệ sử dụng ký quỹ chạm 100%. Điều gì xảy ra?',
      en: 'The margin utilization ratio hits 100%. What happens?',
    },
    choices: {
      a: { vi: 'Vẫn giao dịch bình thường', en: 'Trading continues as normal' },
      b: { vi: 'Tài khoản bị đóng', en: 'The account is closed' },
      c: {
        vi: 'VSD đề nghị tạm ngừng giao dịch; CTCK còn đặt ngưỡng xử lý thấp hơn nhiều',
        en: 'VSD proposes a trading suspension; the broker sets its own action threshold well below that',
      },
      d: { vi: 'Được tự động nạp thêm', en: 'Funds are automatically topped up' },
    },
    answer: 'c',
    explain: {
      vi: '“Khi tỷ lệ sử dụng ký quỹ đạt 100%, VSD sẽ gửi thông báo cho sở giao dịch đề nghị tạm ngừng giao dịch”, kèm không cho mở vị thế mới. Pinetree cảnh báo và đóng vị thế từ mức 75–90%, nên số hợp đồng thực mở được luôn ít hơn tính toán lý thuyết.',
      en: '“Khi tỷ lệ sử dụng ký quỹ đạt 100%, VSD sẽ gửi thông báo cho sở giao dịch đề nghị tạm ngừng giao dịch”, on top of blocking new positions from opening. Pinetree already issues warnings and force-closes positions starting from 75–90%, so the number of contracts you can actually open is always lower than the theoretical calculation.',
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
    prompt: {
      vi: 'Bạn đọc “basis âm” ở hai nguồn khác nhau. Vì sao có thể hiểu ngược?',
      en: 'You read “negative basis” in two different sources. Why might it mean the opposite in each?',
    },
    choices: {
      a: {
        vi: 'Hai quy ước dấu ngược nhau: giáo khoa quốc tế dùng Spot − Futures, bản tin VN dùng Futures − Spot',
        en: 'The two use opposite sign conventions: international textbooks use Spot − Futures, Vietnamese market reports use Futures − Spot',
      },
      b: { vi: 'Một nguồn sai', en: 'One of the sources is simply wrong' },
      c: { vi: 'Do làm tròn', en: 'It is a rounding artifact' },
      d: { vi: 'Do khác hợp đồng tháng', en: 'They refer to different contract months' },
    },
    answer: 'a',
    explain: {
      vi: 'Finhay dùng “Basis = Giá giao ngay (Spot Price) − Giá tương lai (Futures Price)” và cảnh báo “quy ước tính basis khác nhau giữa các sàn”; trong khi bản tin MBS ghi “basis được nới rất rộng -15,29 điểm” với nghĩa phái sinh thấp hơn cơ sở. App cần nêu rõ quy ước mình dùng.',
      en: 'Finhay uses “Basis = Giá giao ngay (Spot Price) − Giá tương lai (Futures Price)” and warns that “quy ước tính basis khác nhau giữa các sàn”; meanwhile an MBS bulletin writes “basis được nới rất rộng -15,29 điểm”, meaning the futures price is below the underlying. The app needs to state plainly which convention it uses.',
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
    prompt: {
      vi: 'Basis nới rộng mạnh. Đây có phải cơ hội dễ kiếm lời không?',
      en: 'The basis has widened sharply. Is that an easy profit opportunity?',
    },
    choices: {
      a: { vi: 'Có, chênh lệch sẽ thu hẹp', en: 'Yes, the gap will narrow' },
      b: { vi: 'Có nếu basis dương', en: 'Yes, if the basis is positive' },
      c: {
        vi: 'Bản tin phái sinh ghi ngược lại: basis nới rộng khiến hoạt động trading khó khăn hơn',
        en: 'The derivatives bulletin says the opposite: a widened basis makes trading harder',
      },
      d: { vi: 'Có với hợp đồng tháng xa', en: 'Yes, for a far-month contract' },
    },
    answer: 'c',
    explain: {
      vi: 'Tiêu đề bản tin MBS: “HĐTL VN30 – CHÊNH LỆCH BASIS KHIẾN HOẠT ĐỘNG TRADING GẶP NHIỀU KHÓ KHĂN”, và “với độ lệch pha mạnh giữa hai thị trường vẫn đang -15,29 điểm thì hoạt động trading của giới đầu tư sẽ gặp nhiều khó khăn”.',
      en: 'The MBS bulletin headline reads: “HĐTL VN30 – CHÊNH LỆCH BASIS KHIẾN HOẠT ĐỘNG TRADING GẶP NHIỀU KHÓ KHĂN”, and “với độ lệch pha mạnh giữa hai thị trường vẫn đang -15,29 điểm thì hoạt động trading của giới đầu tư sẽ gặp nhiều khó khăn”.',
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
    prompt: {
      vi: 'Càng gần đáo hạn basis càng hội tụ êm ả về 0. Đúng không?',
      en: 'The closer to expiry, the more smoothly the basis converges to zero. True?',
    },
    choices: {
      a: {
        vi: 'Không — phiên ATC ngày đáo hạn có thể bật ra basis rất lớn, như +48,45 điểm ngày 21/05/2020',
        en: 'No — the ATC session on expiry day can throw up a very large basis, such as +48.45 points on 21/05/2020',
      },
      b: { vi: 'Đúng, đó là quy luật', en: 'True, that is the rule' },
      c: { vi: 'Đúng với hợp đồng tháng gần', en: 'True for the near-month contract' },
      d: { vi: 'Đúng nếu thanh khoản cao', en: 'True if liquidity is high' },
    },
    answer: 'a',
    explain: {
      vi: 'Ngày 21/05/2020, “giá hợp đồng tương lai đáo hạn trong phiên này vọt tăng, đóng cửa tại mức trần, đạt 864 điểm, cao hơn 48,45 điểm so với mức giá đóng cửa của VN30 (815,55 điểm)”.',
      en: 'On 21/05/2020, “giá hợp đồng tương lai đáo hạn trong phiên này vọt tăng, đóng cửa tại mức trần, đạt 864 điểm, cao hơn 48,45 điểm so với mức giá đóng cửa của VN30 (815,55 điểm)”.',
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
    prompt: {
      vi: 'Giá lý thuyết của HĐTL VN30 là gì?',
      en: 'What is the theoretical price of a VN30 futures contract?',
    },
    choices: {
      a: {
        vi: 'Dự báo VN30 sẽ ở đâu khi đáo hạn',
        en: 'A forecast of where VN30 will be at expiry',
      },
      b: { vi: 'Trung bình giá 30 phiên', en: 'The 30-session average price' },
      c: { vi: 'Giá do sở giao dịch công bố', en: 'A price published by the exchange' },
      d: {
        vi: 'Giá cân bằng theo chi phí nắm giữ: giá cơ sở cộng lãi vay trừ cổ tức',
        en: 'The cost-of-carry equilibrium price: the underlying price plus borrowing cost minus dividends',
      },
    },
    answer: 'd',
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
      en: 'The actual price deviates from the theoretical price. Is risk-free arbitrage available in the Vietnamese market?',
    },
    choices: {
      a: { vi: 'Có, rất dễ', en: 'Yes, quite easily' },
      b: { vi: 'Có nếu chênh trên 1 điểm', en: 'Yes, if the gap exceeds 1 point' },
      c: { vi: 'Chỉ tổ chức nước ngoài làm được', en: 'Only foreign institutions can do it' },
      d: {
        vi: 'Rất khó — khó dựng rổ chỉ số chính xác, bị hạn chế bán khống cơ sở, chi phí có thể triệt tiêu lợi nhuận',
        en: 'Very hard — an accurate index basket is difficult to build, short-selling the underlying is restricted, and costs can wipe out the profit',
      },
    },
    answer: 'd',
    explain: {
      vi: 'Nguồn phân tích rào cản tại VN: cần vốn lớn để dựng rổ chỉ số, hạn chế bán khống cổ phiếu cơ sở, cộng spread và trượt giá; mức chênh cần thiết thường phải từ 5 điểm trở lên mới đáng làm.',
      en: 'The source analyzes the barriers in Vietnam: it takes a large amount of capital to build the index basket, short-selling the underlying stocks is restricted, and once spread and slippage are added, the gap usually needs to be 5 points or more before the trade is worthwhile.',
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
    prompt: {
      vi: 'Giá thanh toán cuối cùng của HĐTL VN30 hiện được xác định thế nào?',
      en: 'How is the final settlement price of a VN30 futures contract currently determined?',
    },
    choices: {
      a: {
        vi: 'Giá đóng cửa VN30 ngày giao dịch cuối',
        en: 'The VN30 closing price on the last trading day',
      },
      b: {
        vi: 'Trung bình số học chỉ số trong 30 phút cuối, sau khi loại 3 giá trị cao nhất và 3 giá trị thấp nhất',
        en: 'The arithmetic average of the index over the last 30 minutes, after discarding the 3 highest and 3 lowest values',
      },
      c: { vi: 'Giá khớp cuối của HĐTL', en: 'The last matched price of the futures contract' },
      d: { vi: 'Trung bình cả phiên', en: 'The average over the whole session' },
    },
    answer: 'b',
    explain: {
      vi: 'Tài liệu PHS mô tả cách tính hiện hành; tài liệu MBS cũ hơn vẫn ghi “Theo Giá đóng cửa của chỉ số VN30”. Quy định đã đổi sau các phiên đáo hạn bất thường — cần xác minh mốc hiệu lực trước khi đưa vào app.',
      en: 'The PHS document describes the current calculation method; the older MBS document still reads “Theo Giá đóng cửa của chỉ số VN30”. The rule changed after several unusual expiry sessions — the effective date needs to be verified before this goes into the app.',
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
      en: 'According to statistics cited by the press, what share of investors in the Vietnamese derivatives market are profitable?',
    },
    choices: {
      a: { vi: 'Khoảng 5%', en: 'About 5%' },
      b: { vi: 'Khoảng 50%', en: 'About 50%' },
      c: { vi: 'Khoảng 30%', en: 'About 30%' },
      d: { vi: 'Không có số liệu', en: 'No data exists' },
    },
    answer: 'a',
    explain: {
      vi: 'CafeF: “chỉ có 5% nhà đầu tư thu được lợi nhuận trên thị trường phái sinh, còn lại đa phần thua lỗ”. Ông Vũ Duy Khánh chỉ ra lỗi phổ biến: “giao dịch nhiều nhưng hiệu quả thấp, vì thường chốt lời các khoản lãi nhỏ, trong khi lỗ lớn”.',
      en: 'CafeF: “chỉ có 5% nhà đầu tư thu được lợi nhuận trên thị trường phái sinh, còn lại đa phần thua lỗ”. Mr. Vũ Duy Khánh points to a common mistake: “giao dịch nhiều nhưng hiệu quả thấp, vì thường chốt lời các khoản lãi nhỏ, trong khi lỗ lớn”.',
    },
    source: {
      url: 'https://cafef.vn/goc-toi-cua-chung-khoan-phai-sinh-20180712090321451.chn',
      kind: 'chuyen-gia',
      vietnam: true,
    },
  },
];
