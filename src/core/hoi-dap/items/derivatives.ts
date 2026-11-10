import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `derivatives` (`src/core/formulas/derivatives.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_DERIVATIVES: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'so-hop-dong-toi-da': [
    {
      hoi: {
        vi: 'Short một hợp đồng VN30F thì giá trị hợp đồng là 150 triệu đồng, vậy có phải bỏ ra đủ 150 triệu không?',
        en: 'If I short one VN30F contract and its value is 150 million VND, do I have to put up the full 150 million?',
      },
      nguyenVan: 'Giả sử mình short mã vn30f2106 này 1 đơn vị thì giá nó là 150 tr à ?',
      nguon: {
        url: 'https://voz.vn/t/long-short-trong-chung-khoan-la-gi-cac-fen.318836/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
      traLoi: {
        vi: 'Theo chủ đề, mỗi điểm chỉ số VN30 ứng với 100.000 đồng nên giá trị hợp đồng tính theo điểm nhân hệ số này, nhưng chỉ phải nộp ký quỹ là một phần giá trị đó, không phải đủ toàn bộ.',
        en: 'According to the thread, each VN30 index point is worth 100,000 VND, so the contract value is the index level times that multiplier, but only a margin deposit, a fraction of that value, is required, not the full amount.',
      },
      nguonTraLoi: [
        {
          url: 'https://voz.vn/t/long-short-trong-chung-khoan-la-gi-cac-fen.318836/',
          ten: 'Voz',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tài khoản phải có ít nhất bao nhiêu tiền mới chơi được phái sinh?',
        en: 'How much money must an account hold at minimum to trade derivatives?',
      },
      nguyenVan: 'tài khoản phải ít nhất bao nhiêu mới chơi phái sinh được thế các bác',
      nguon: {
        url: 'https://voz.vn/t/lap-hoi-choi-chung-khoan-phai-sinh-vn30f1m.222188/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'Giao dịch phái sinh VN30 cần tối thiểu bao nhiêu tiền?',
        en: 'What is the minimum amount of money needed to trade VN30 futures?',
      },
      nguyenVan: 'Giao dịch phái sinh VN30 cần tối thiểu bao nhiêu tiền?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/chi-phi-giao-dich-hop-dong-tuong-lai-vn30/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'Số tiền ký quỹ cho một hợp đồng phái sinh có thay đổi so với hệ thống cũ không?',
        en: 'Has the margin amount for one derivatives contract changed compared with the old system?',
      },
      nguyenVan: 'Số tiền ký quỹ cho 1 hợp đồng phái sinh có thay đổi so với hệ thống cũ không?',
      nguon: {
        url: 'https://www.ssi.com.vn/khach-hang-ca-nhan/krx-thi-truong-phai-sinh-faq',
        ten: 'SSI hỗ trợ',
        noi: 'hoi-dap',
        vietnam: true,
      },
    },
  ],
  'don-bay-hieu-dung': [
    {
      hoi: {
        vi: 'Hợp đồng tương lai giảm 5% khi mình đang short thì mình lời đúng 5% hay nhiều hơn?',
        en: 'If a futures contract falls 5% while I am short, do I gain exactly 5% or more?',
      },
      nguyenVan: 'Cuối phiên nó giảm 5% thì mình lời 5% có đúng ko nhỉ ?',
      nguon: {
        url: 'https://voz.vn/t/long-short-trong-chung-khoan-la-gi-cac-fen.318836/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'Giao dịch hợp đồng tương lai khác gì giao dịch chứng khoán cơ sở?',
        en: 'How does trading futures differ from trading the underlying securities?',
      },
      nguyenVan:
        'Giao dịch Hợp đồng tương lai (HĐTL) có gì khác so với giao dịch chứng khoán cơ sở?',
      nguon: {
        url: 'https://www.ssi.com.vn/khach-hang-ca-nhan/phai-sinh-faq',
        ten: 'SSI hỗ trợ',
        noi: 'hoi-dap',
        vietnam: true,
      },
      traLoi: {
        vi: 'Theo nguồn, hợp đồng tương lai chỉ cần ký quỹ một phần giá trị hợp đồng, đó là đòn bẩy, và có thể bán khống mà không cần sở hữu tài sản cơ sở.',
        en: 'According to the source, a futures contract needs only a part of its value as margin, which is the leverage, and you can sell short without owning the underlying asset.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.ssi.com.vn/khach-hang-ca-nhan/phai-sinh-faq',
          ten: 'SSI hỗ trợ',
        },
      ],
    },
    {
      hoi: {
        vi: 'Rủi ro khi tham gia hợp đồng tương lai là gì?',
        en: 'What risks come with trading futures?',
      },
      nguyenVan: 'Rủi ro trong việc tham gia HĐTL tôi có thể gặp phải là gì?',
      nguon: {
        url: 'https://www.ssi.com.vn/khach-hang-ca-nhan/phai-sinh-faq',
        ten: 'SSI hỗ trợ',
        noi: 'hoi-dap',
        vietnam: true,
      },
      traLoi: {
        vi: 'Theo nguồn, có rủi ro thị trường và rủi ro đòn bẩy: khoản lỗ có thể vượt quá số ký quỹ ban đầu, và có thể bị gọi ký quỹ bổ sung, nếu không nộp thì vị thế có thể bị đóng.',
        en: 'According to the source, there is market risk and leverage risk: the loss can exceed the initial margin, and you can face a margin call, and if you do not top up the position may be closed.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.ssi.com.vn/khach-hang-ca-nhan/phai-sinh-faq',
          ten: 'SSI hỗ trợ',
        },
      ],
    },
  ],
  'lai-lo-vi-the-short': [
    {
      hoi: {
        vi: 'Khi đang short hợp đồng tương lai và lời rồi, có phải chờ đáo hạn mới lấy được lãi không?',
        en: 'When I am short a futures contract and in profit, must I wait until expiry to take the profit?',
      },
      nguyenVan: 'Giả sử nó lời 5% thì mình có đc lấy luôn ko hay phải đợi đáo hạn phái sinh',
      nguon: {
        url: 'https://voz.vn/t/long-short-trong-chung-khoan-la-gi-cac-fen.318836/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'Lỗ phái sinh có thể làm âm tài khoản không?',
        en: 'Can a futures loss take the account negative?',
      },
      nguyenVan: 'Lỗ phái sinh có bị âm tài khoản không?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/chi-phi-giao-dich-hop-dong-tuong-lai-vn30/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
    },
  ],
  'lai-lo-vi-the-long': [
    {
      hoi: {
        vi: 'Lỗ phái sinh có thể làm âm tài khoản không?',
        en: 'Can a futures loss take the account negative?',
      },
      nguyenVan: 'Lỗ phái sinh có bị âm tài khoản không?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/chi-phi-giao-dich-hop-dong-tuong-lai-vn30/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
    },
  ],
  'gia-ly-thuyet-vn30f': [
    {
      hoi: {
        vi: 'Giá lý thuyết hợp đồng VN30F được tính từ những yếu tố nào?',
        en: 'Which inputs is the VN30F theoretical price built from?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Từ chỉ số VN30 hiện tại, lãi suất phi rủi ro, tỷ suất cổ tức của rổ VN30 và số ngày đến đáo hạn: giá = chỉ số × [1 + (lãi suất − cổ tức) × số ngày ÷ 365]. Kết quả tính bằng điểm.',
        en: 'From the current VN30 index, the risk-free rate, the dividend yield of the VN30 basket and the days to expiry: price = index × [1 + (rate − yield) × days ÷ 365]. The result is in index points.',
      },
    },
    {
      hoi: {
        vi: 'Vì sao giá lý thuyết có thể thấp hơn chỉ số cơ sở?',
        en: 'Why can the theoretical price be below the underlying index?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Khi tỷ suất cổ tức lớn hơn lãi suất thì phần trừ trong ngoặc âm. Ví dụ chỉ số 1.280, lãi suất 4,5%, cổ tức 6%, 90 ngày cho giá lý thuyết 1.275,27 điểm.',
        en: 'When the dividend yield exceeds the interest rate the bracket turns negative. For example index 1,280, rate 4.5%, yield 6%, 90 days give a theoretical price of 1,275.27 points.',
      },
    },
    {
      hoi: {
        vi: 'Số ngày đến đáo hạn bằng 0 thì giá lý thuyết là bao nhiêu?',
        en: 'What is the theoretical price when days to expiry is 0?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Bằng đúng chỉ số cơ sở, vì không còn thời gian để lãi suất và cổ tức tạo chênh lệch.',
        en: 'Exactly the underlying index, since no time is left for interest and dividends to create a gap.',
      },
    },
    {
      hoi: {
        vi: 'Công thức báo lỗi khi nào?',
        en: 'When does the formula report an error?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Hai trường hợp: chỉ số cơ sở bằng hoặc nhỏ hơn 0, và số ngày đến đáo hạn âm. Cả hai đều báo vô nghĩa, không trả về một con số giả.',
        en: 'In two cases: the underlying index is 0 or less, and the days to expiry are negative. Both are reported as meaningless instead of returning a placeholder number.',
      },
    },
  ],
  'basis-vn30f': [
    {
      hoi: {
        vi: 'Basis dương và basis âm nghĩa là gì theo cách công cụ tính?',
        en: 'What do a positive and a negative basis mean the way the tool computes it?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Basis = giá hợp đồng VN30F − chỉ số VN30. Dương là giá hợp đồng cao hơn chỉ số, âm là thấp hơn; ví dụ 1.285,5 so với 1.280 là +5,5 điểm, còn 1.275 là −5 điểm.',
        en: 'Basis = VN30F price − VN30 index. Positive means the contract is above the index, negative means below; for example 1,285.5 against 1,280 is +5.5 points, and 1,275 is −5 points.',
      },
    },
    {
      hoi: {
        vi: 'Basis dương có nghĩa là thị trường đang hưng phấn không?',
        en: 'Does a positive basis mean the market is euphoric?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chưa chắc. Một phần basis là chênh lệch hợp lý do lãi suất trừ cổ tức, nên cần đặt cạnh giá lý thuyết của hợp đồng cùng thời điểm; công thức Giá lý thuyết hợp đồng tương lai cho ra con số đó.',
        en: "Not necessarily. Part of the basis is the fair gap from interest minus dividends, so set it beside the contract's theoretical price at the same moment; the Theoretical futures price formula gives that figure.",
      },
    },
    {
      hoi: {
        vi: 'Basis được tính bằng đồng hay bằng điểm?',
        en: 'Is the basis in dong or in points?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Bằng điểm chỉ số. Muốn ra tiền, nhân với hệ số nhân hợp đồng; theo biểu phí đang dùng, hệ số là 100.000 ₫ mỗi điểm, nên 3 điểm là 300.000 ₫ trên một hợp đồng.',
        en: 'In index points. To get money, multiply by the contract multiplier; the schedule in use sets 100,000 ₫ per point, so 3 points are 300,000 ₫ per contract.',
      },
    },
    {
      hoi: {
        vi: 'Khi nào công thức Basis báo lỗi?',
        en: 'When does the Basis formula report an error?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Khi chỉ số cơ sở bằng hoặc nhỏ hơn 0, vì không có mốc để so sánh. Lúc đó công thức báo vô nghĩa và nhắc nhập chỉ số VN30 hiện tại.',
        en: 'When the underlying index is 0 or less, since there is no reference point. The formula then reports a meaningless result and asks for the current VN30 index.',
      },
    },
  ],
  'co-vi-the-phai-sinh': [
    {
      hoi: {
        vi: 'Vì sao kết quả số hợp đồng luôn là số nguyên và được làm tròn xuống?',
        en: 'Why is the number of contracts always a whole number rounded down?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không mở được một phần hợp đồng, và làm tròn lên sẽ vượt mức rủi ro đã đặt. Với vốn 500 triệu, rủi ro 2%, cắt lỗ 15 điểm, tính ra 6,67 nên được mở 6 hợp đồng.',
        en: 'You cannot open a fraction of a contract, and rounding up would exceed the risk you set. With 500 million ₫ capital, 2% risk and a 15-point stop, the calculation gives 6.67 so 6 contracts are allowed.',
      },
    },
    {
      hoi: {
        vi: 'Hệ số nhân 100.000 ₫ mỗi điểm dùng để làm gì trong công thức này?',
        en: 'What is the 100,000 ₫ per point multiplier used for in this formula?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Quy khoảng cách cắt lỗ từ điểm ra tiền: mỗi hợp đồng chạm cắt lỗ 15 điểm mất 15 × 100.000 = 1,5 triệu ₫. Số tiền chấp nhận mất chia cho khoản này ra số hợp đồng.',
        en: 'It converts the stop distance from points into money: each contract hitting a 15-point stop loses 15 × 100,000 = 1.5 million ₫. The accepted loss divided by that gives the contract count.',
      },
    },
    {
      hoi: {
        vi: 'Số hợp đồng này đã tính đến ký quỹ chưa?',
        en: 'Does this contract count take margin into account?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chưa. Công thức chỉ dựa trên vốn, % rủi ro, khoảng cách cắt lỗ và hệ số nhân, không dùng mức ký quỹ nào. Hãy chọn điểm cắt lỗ trước rồi suy ra số hợp đồng, đừng mở tối đa theo ký quỹ rồi mới nghĩ đến cắt lỗ.',
        en: 'No. The formula uses only capital, risk percent, stop distance and the multiplier, with no margin requirement. Choose the stop first and derive the size from it, rather than opening the margin maximum and thinking of a stop later.',
      },
    },
    {
      hoi: {
        vi: 'Kết quả bằng 0 hợp đồng có nghĩa là gì?',
        en: 'What does a result of 0 contracts mean?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Với khoảng cắt lỗ này, ngay một hợp đồng cũng đã mất nhiều hơn số tiền rủi ro đã đặt. Ví dụ vốn 500 triệu, rủi ro 2% là 10 triệu ₫, mà cắt lỗ 100 điểm cho một hợp đồng mất 10 triệu ₫ thì vừa đủ 1, còn cắt lỗ 101 điểm sẽ cho 0.',
        en: 'With this stop distance even one contract loses more than the risk amount you set. For example 500 million ₫ at 2% is 10 million ₫; a 100-point stop costs exactly 10 million ₫ per contract and gives 1, while a 101-point stop gives 0.',
      },
    },
    {
      hoi: {
        vi: 'Khoảng cách cắt lỗ bằng 0 hoặc âm thì công thức báo gì?',
        en: 'What does the formula report if the stop distance is 0 or negative?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Bằng 0 thì báo chia cho 0 và nhắc đặt cắt lỗ cách điểm vào ít nhất 1 điểm. Âm thì báo vô nghĩa, vì khoảng cách luôn dương, dùng chung cho cả Long và Short.',
        en: 'Zero reports a divide by zero and asks for a stop at least 1 point from entry. Negative reports a meaningless result, since a distance is always positive and applies to both Long and Short.',
      },
    },
  ],
};
