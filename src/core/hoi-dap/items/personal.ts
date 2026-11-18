import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `personal` (`src/core/formulas/personal.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_PERSONAL: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'tra-gop-nien-kim': [
    {
      hoi: {
        vi: 'Lãi suất tính theo dư nợ gốc và theo dư nợ giảm dần, cách nào lợi hơn?',
        en: 'Between interest on the original balance and interest on the declining balance, which is cheaper?',
      },
      nguyenVan: 'Lãi suất theo dư nợ gốc và dư nợ giảm dần cái nào lợi hơn?',
      nguon: {
        url: 'https://www.momo.vn/vay-nhanh/blog/cach-tinh-lai-suat-vay-ngan-hang-don-gian-va-chinh-xac-nhat-1314',
        ten: 'MoMo hỏi đáp',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Tính trên dư nợ gốc thì tiền trả mỗi tháng gần như không đổi; tính trên dư nợ giảm dần thì lãi giảm theo số dư còn lại. Nguồn cho rằng nếu trả đều đúng hạn, cách giảm dần thường tiết kiệm chi phí hơn.',
        en: 'Interest on the original balance keeps the monthly payment almost flat; interest on the declining balance falls as the balance falls. The source says that if you pay on time, the declining-balance method usually costs less.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.momo.vn/vay-nhanh/blog/cach-tinh-lai-suat-vay-ngan-hang-don-gian-va-chinh-xac-nhat-1314',
          ten: 'MoMo hỏi đáp',
        },
      ],
    },
    {
      hoi: {
        vi: 'Quy đổi lãi suất năm sang lãi suất tháng như thế nào?',
        en: 'How do I convert an annual interest rate to a monthly rate?',
      },
      nguyenVan: 'Cách quy đổi lãi suất năm sang tháng/ngày như thế nào?',
      nguon: {
        url: 'https://www.momo.vn/vay-nhanh/blog/cach-tinh-lai-suat-vay-ngan-hang-don-gian-va-chinh-xac-nhat-1314',
        ten: 'MoMo hỏi đáp',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nêu lãi suất tháng bằng lãi suất năm chia 12, và đây chỉ là cách quy đổi tham khảo; số tiền thực trả còn tùy cách tính lãi của từng khoản vay.',
        en: 'The source says the monthly rate is the annual rate divided by 12, as a reference conversion only; the amount actually paid also depends on how each loan calculates interest.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.momo.vn/vay-nhanh/blog/cach-tinh-lai-suat-vay-ngan-hang-don-gian-va-chinh-xac-nhat-1314',
          ten: 'MoMo hỏi đáp',
        },
      ],
    },
    {
      hoi: {
        vi: 'Lãi suất chỉ cố định mấy năm đầu rồi thả nổi thì công thức tính thế nào?',
        en: 'If the rate is fixed only for the first years and then floats, how does the formula handle it?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Công thức giả định một mức lãi suất cho cả kỳ hạn, nên kết quả chỉ đúng trong thời gian lãi cố định. Khi lãi đổi, nhập dư nợ còn lại vào ô Số tiền vay cùng lãi suất mới và số năm còn lại để ra khoản trả mỗi tháng mới.',
        en: 'The formula assumes one rate for the whole term, so the result holds only while the rate is fixed. When the rate changes, enter the remaining balance in the Loan amount field with the new rate and the years left to get the new monthly payment.',
      },
    },
  ],
  'tra-gop-goc-deu': [
    {
      hoi: {
        vi: 'Tính lãi suất năm từ lãi suất tháng như thế nào?',
        en: 'How do I work out the annual interest rate from the monthly rate?',
      },
      nguyenVan: 'Tính lãi suất năm từ lãi suất tháng như thế nào?',
      nguon: {
        url: 'https://www.momo.vn/vay-nhanh/blog/cach-tinh-tra-gop-xe-may-cong-thuc-lai-suat-va-vi-2710',
        ten: 'MoMo hỏi đáp',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nêu cách quy đổi đơn giản là lấy lãi suất tháng nhân 12; chi phí thực tế có thể khác vì cách tính lãi và các khoản phí đi kèm.',
        en: 'The source says the simple conversion is monthly rate times 12; the real cost can differ because of the interest method and extra fees.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.momo.vn/vay-nhanh/blog/cach-tinh-tra-gop-xe-may-cong-thuc-lai-suat-va-vi-2710',
          ten: 'MoMo hỏi đáp',
        },
      ],
    },
    {
      hoi: {
        vi: 'Kết quả chỉ là khoản trả tháng đầu, vậy các tháng sau trả bao nhiêu?',
        en: "The result is only the first month's payment, so how much are the later months?",
      },
      tuSoan: true,
      traLoi: {
        vi: 'Mỗi tháng sau nhẹ đi đúng phần gốc mỗi kỳ × lãi suất kỳ, vì dư nợ giảm đều. Vay 3 tỷ ₫, 8%/năm, 20 năm: tháng đầu 32.500.000 ₫, tháng thứ hai 32.416.666,67 ₫, tháng cuối 12.583.333,33 ₫.',
        en: 'Each later month is lighter by the fixed principal × the monthly rate, because the balance falls evenly. Borrowing 3 billion ₫ at 8%/year over 20 years: month one is 32,500,000 ₫, month two 32,416,666.67 ₫ and the last month 12,583,333.33 ₫.',
      },
    },
    {
      hoi: {
        vi: 'Cả kỳ hạn thì trả gốc đều tốn bao nhiêu tiền lãi so với trả đều mỗi tháng?',
        en: 'Over the whole term, how much interest does equal principal cost compared with equal monthly payments?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Ít hơn, ở cùng số vay, lãi suất và kỳ hạn, vì gốc được trả nhanh hơn ngay từ đầu. Vay 3 tỷ ₫, 8%/năm, 20 năm: tổng lãi trả gốc đều là 2.410.000.000 ₫, trả đều mỗi tháng (niên kim) là 3.022.368.496,75 ₫. Đổi lại, những tháng đầu nặng hơn.',
        en: 'Less, for the same loan, rate and term, since principal is repaid faster from the start. Borrowing 3 billion ₫ at 8%/year over 20 years: total interest is 2,410,000,000 ₫ with equal principal and 3,022,368,496.75 ₫ with equal monthly payments (annuity). In exchange the early months are heavier.',
      },
    },
  ],
  'lich-tra-no': [
    {
      hoi: {
        vi: 'Lãi được tính theo số tiền vay ban đầu hay theo số nợ còn lại?',
        en: 'Is interest charged on the original loan amount or on the remaining balance?',
      },
      nguyenVan: 'thì lãi tính theo số nợ 100tr này hay ntn nhỉ',
      nguon: {
        url: 'https://voz.vn/t/hoi-chut-ve-tra-no-vay-bank.1152394/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
      traLoi: {
        vi: 'Trong công thức này là theo số nợ còn lại, ở cả hai phương thức trả: lãi mỗi tháng = dư nợ đầu tháng × lãi suất năm ÷ 12. Dư nợ còn 100 triệu ₫ ở lãi 10%/năm thì lãi tháng ấy là 833.333,33 ₫. Có khoản vay tính lãi trên số vay ban đầu suốt kỳ hạn; công thức không mô phỏng cách ấy, nên cần xem hợp đồng.',
        en: 'In this formula it is the remaining balance, under both repayment methods: interest each month = balance at the start of the month × annual rate ÷ 12. With 100 million ₫ outstanding at 10%/year, that month’s interest is 833,333.33 ₫. Some loans charge interest on the original amount for the whole term; the formula does not model that, so check your contract.',
      },
    },
    {
      hoi: {
        vi: 'Vay theo cách tính lãi nào thì có lợi hơn?',
        en: 'Which interest calculation method is better for the borrower?',
      },
      nguyenVan: 'thì vay theo cách tính lãi nào có lợi hơn nhỉ?',
      nguon: {
        url: 'https://voz.vn/t/hoi-chut-ve-tra-no-vay-bank.1152394/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
      traLoi: {
        vi: 'Cùng lãi suất và kỳ hạn, tổng lãi tính trên dư nợ giảm dần luôn ít hơn lãi cố định trên số vay ban đầu, vì gốc được trả dần nên số nợ chịu lãi cũng giảm. Vay 1 tỷ ₫, 10%/năm, 1 năm: lãi trên trọn 1 tỷ ₫ là 100.000.000 ₫, còn công thức cho tổng lãi 54.990.646,76 ₫ nếu trả đều mỗi tháng (niên kim) và 54.166.666,67 ₫ nếu trả gốc đều.',
        en: 'At the same rate and term, total interest on the declining balance is always less than flat interest on the original amount, because principal is repaid along the way so the balance bearing interest shrinks. Borrowing 1 billion ₫ at 10%/year for 1 year: interest on the full 1 billion ₫ is 100,000,000 ₫, while the formula gives total interest of 54,990,646.76 ₫ with equal monthly payments (annuity) and 54,166,666.67 ₫ with equal principal.',
      },
    },
    {
      hoi: {
        vi: 'Có thể trả bớt tiền gốc để giảm tiền lãi hằng tháng không?',
        en: 'Can I pay down part of the principal to reduce the monthly interest?',
      },
      nguyenVan:
        'Có thể trả bớt tiền gốc không ? VD : Vay người thân 200-300tr quăng vào trả bớt để giảm lãi hàng tháng.',
      nguon: {
        url: 'https://voz.vn/t/thac-mac-co-the-tra-bot-tien-goc-ngan-hang-de-giam-lai-suat.884387/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
      traLoi: {
        vi: 'Công thức không có ô trả trước, nhưng lãi mỗi tháng tính trên dư nợ còn lại nên trả bớt gốc thì lãi các tháng sau giảm theo. Để ước lượng, nhập dư nợ sau khi trả bớt vào ô Số tiền vay cùng kỳ hạn còn lại. Phí trả nợ trước hạn, nếu hợp đồng có, không nằm trong phép tính.',
        en: 'The formula has no prepayment field, but each month’s interest is charged on the remaining balance, so paying down principal lowers the interest of later months. To estimate it, enter the balance after the prepayment in the Loan amount field with the remaining term. Any early repayment fee in your contract is not part of the calculation.',
      },
    },
  ],
  'lai-kep': [
    {
      hoi: {
        vi: 'Số lần ghép lãi hàng năm nghĩa là gì?',
        en: 'What does the number of compounding periods per year mean?',
      },
      nguyenVan: 'Chưa rõ số lần ghép lãi hàng năm là thế nào?',
      nguon: {
        url: 'https://voz.vn/t/cach-tinh-lai-suat-kep-cua-ngan-hang.496708/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
      traLoi: {
        vi: 'Câu trả lời trong chủ đề: là số lần một năm tiền lãi được nhập vào gốc, bằng 12 chia số tháng của kỳ hạn; gửi kỳ hạn năm là 1, nhập lãi hằng tháng là 12. Trong công thức đó là ô Số lần nhập lãi / năm (n), hiện ở chế độ Nâng cao: 1 tỷ ₫ lãi 8,1%/năm trong 1 năm thành 1.081.000.000 ₫ khi n = 1 và 1.082.640.250 ₫ khi n = 2.',
        en: 'The answer in the thread: it is how many times a year interest is added to the principal, equal to 12 divided by the term in months; a one-year term is 1 and monthly crediting is 12. In the formula this is the Compounding frequency / year (n) field, shown in Advanced mode: 1 billion ₫ at 8.1%/year for 1 year becomes 1,081,000,000 ₫ with n = 1 and 1,082,640,250 ₫ with n = 2.',
      },
      nguonTraLoi: [
        {
          url: 'https://voz.vn/t/cach-tinh-lai-suat-kep-cua-ngan-hang.496708/',
          ten: 'Voz',
        },
      ],
    },
    {
      hoi: {
        vi: 'Lãi kép khác gì lãi suất kép?',
        en: 'What is the difference between compound interest and compound interest rate?',
      },
      nguyenVan: 'Lãi kép khác gì lãi suất kép?',
      nguon: {
        url: 'https://www.momo.vn/blog/lai-kep-la-gi-cong-thuc-tinh-lai-kep-c116dt774',
        ten: 'MoMo hỏi đáp',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn cho biết hai cách gọi chỉ cùng một khái niệm, nên không có khác biệt thực chất.',
        en: 'The source says the two terms describe the same concept, so there is no real difference.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.momo.vn/blog/lai-kep-la-gi-cong-thuc-tinh-lai-kep-c116dt774',
          ten: 'MoMo hỏi đáp',
        },
      ],
    },
    {
      hoi: {
        vi: 'Lãi kép tính theo ngày hay theo tháng thì lợi hơn?',
        en: 'Is compounding daily or monthly better?',
      },
      nguyenVan: 'Lãi kép tính theo ngày hay theo tháng lợi hơn?',
      nguon: {
        url: 'https://www.momo.vn/blog/lai-kep-la-gi-cong-thuc-tinh-lai-kep-c116dt774',
        ten: 'MoMo hỏi đáp',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Cùng lãi suất danh nghĩa, ghép lãi càng thường xuyên thì nhận được nhiều hơn một chút, nhưng chênh lệch thường nhỏ.',
        en: 'At the same nominal rate, more frequent compounding gives slightly more, but the gap is usually small.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.momo.vn/blog/lai-kep-la-gi-cong-thuc-tinh-lai-kep-c116dt774',
          ten: 'MoMo hỏi đáp',
        },
      ],
    },
    {
      hoi: {
        vi: 'Số tiền nhỏ có nên bắt đầu tích lũy theo lãi kép không?',
        en: 'Is it worth starting compound-interest saving with a small amount?',
      },
      nguyenVan: 'Số tiền nhỏ có nên bắt đầu tích lũy theo lãi kép không?',
      nguon: {
        url: 'https://www.momo.vn/blog/lai-kep-la-gi-cong-thuc-tinh-lai-kep-c116dt774',
        ten: 'MoMo hỏi đáp',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn trả lời là có, vì lãi kép là cách tính lãi, không đòi số vốn tối thiểu. Trong công thức, số gốc chỉ nhân với hệ số (1 + r/n)^(n × t), nên số tiền nhỏ hay lớn đều tăng cùng một tỷ lệ: 10 triệu ₫ lãi 8%/năm, nhập lãi hằng tháng, sau 10 năm thành 22.196.402,35 ₫, gấp 2,22 lần, đúng như 1 tỷ ₫ thành 2.219.640.234,54 ₫.',
        en: 'The source answers yes, since compounding is a way of computing interest and needs no minimum capital. In the formula the principal is just multiplied by (1 + r/n)^(n × t), so small and large sums grow at the same rate: 10 million ₫ at 8%/year compounded monthly becomes 22,196,402.35 ₫ after 10 years, 2.22 times, just as 1 billion ₫ becomes 2,219,640,234.54 ₫.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.momo.vn/blog/lai-kep-la-gi-cong-thuc-tinh-lai-kep-c116dt774',
          ten: 'MoMo hỏi đáp',
        },
      ],
    },
  ],
  'tiet-kiem-muc-tieu': [
    {
      hoi: {
        vi: 'Có gói tiết kiệm nào cho gửi thêm một số tiền cố định vào sổ sau mỗi tháng không?',
        en: 'Is there a savings product where I can add a fixed amount to the account every month?',
      },
      nguyenVan:
        'muốn hỏi xem có gói tiết kiệm nào thỏa mãn nhu cầu đưa vào sổ tiết kiệm 1 số tiền nào đó sau mỗi tháng không ạ?',
      nguon: {
        url: 'https://voz.vn/t/gui-tiet-kiem-ngan-hang-theo-kieu-tich-luy-hang-thang.298003/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
      traLoi: {
        vi: 'Công thức này giả định đúng kiểu gửi ấy: cuối mỗi tháng góp một khoản bằng nhau, lãi nhập gốc hằng tháng ở một lãi suất không đổi suốt thời gian góp. Sản phẩm thật có thể khác, ví dụ mỗi lần gửi thành một sổ riêng với kỳ hạn và lãi suất riêng, nên kết quả chỉ là ước tính.',
        en: 'This formula assumes exactly that pattern: an equal deposit at the end of each month, with interest added to the balance monthly at one rate throughout. Real products can differ, for example each deposit becoming a separate account with its own term and rate, so the result is an estimate.',
      },
    },
    {
      hoi: {
        vi: 'Khoản góp hằng tháng được tính là gửi vào đầu tháng hay cuối tháng?',
        en: 'Is the monthly deposit assumed at the start or the end of each month?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Cuối mỗi tháng, nên khoản góp cuối cùng vào đúng tháng cần tiền và không kịp sinh lãi. Nếu bạn góp vào đầu tháng, mỗi khoản có thêm một tháng lãi, nên khoản thật sự cần góp thấp hơn kết quả một chút.',
        en: 'At the end of each month, so the last deposit lands in the month the money is needed and earns no interest. If you deposit at the start of each month, every deposit earns one more month of interest, so the amount you actually need is slightly below the result.',
      },
    },
    {
      hoi: {
        vi: 'Đặt lãi suất kỳ vọng 0% thì công thức có báo lỗi không?',
        en: 'Does the formula report an error if the expected rate is 0%?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Khi đó không có tiền lãi gánh hộ, nên khoản gửi hằng tháng bằng mục tiêu chia đều cho số tháng: 1 tỷ ₫ trong 48 tháng là 20.833.333,33 ₫ mỗi tháng, so với 18.186.897,31 ₫ ở lãi 6,8%/năm.',
        en: 'No. With no interest to help, the monthly deposit is simply the target divided by the number of months: 1 billion ₫ over 48 months is 20,833,333.33 ₫ a month, against 18,186,897.31 ₫ at 6.8%/year.',
      },
    },
  ],
  'lai-tien-gui': [
    {
      hoi: {
        vi: 'Công thức này tính lãi đơn hay lãi kép, có cộng lãi vào gốc không?',
        en: 'Is this simple or compound interest, and is interest added to the principal?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Lãi đơn: lãi chỉ tính trên số gốc gửi vào, không nhập vào gốc. Tiền lãi = số gửi × lãi suất năm ÷ 12 × số tháng. Muốn lãi nhập gốc thì dùng công thức lãi kép.',
        en: 'Simple interest: it is computed only on the deposited principal and is not added to it. Interest = deposit × annual rate ÷ 12 × months. For interest added to principal use the compound interest formula.',
      },
    },
    {
      hoi: {
        vi: 'Gửi 100 triệu đồng lãi 6%/năm thì kỳ hạn 6 tháng và 12 tháng nhận lãi bao nhiêu?',
        en: 'If I deposit 100 million at 6% a year, how much interest do I get for 6 months and for 12 months?',
      },
      tuSoan: true,
      traLoi: {
        vi: '6 tháng nhận 3.000.000 đồng, 12 tháng nhận 6.000.000 đồng. Lãi tỉ lệ với số tháng, kết quả là tiền lãi cả kỳ hạn chưa cộng gốc.',
        en: '6 months gives 3,000,000 dong and 12 months gives 6,000,000 dong. Interest is proportional to the months, and the result is the interest for the whole term, not including principal.',
      },
    },
    {
      hoi: {
        vi: 'Ngân hàng trả lãi theo số ngày thực tế nên có khác kết quả ở đây không?',
        en: 'If the bank pays by actual days, can that differ from the result here?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Có thể. Sản phẩm quy lãi suất năm thành lãi mỗi tháng bằng cách chia 12 rồi nhân số tháng, còn ngân hàng thường tính theo số ngày gửi trên năm 365 ngày, nên tiền lãi thật có thể chênh chút.',
        en: 'It can. The tool turns the annual rate into a monthly one by dividing by 12 and multiplying by months, while banks often count the actual days over a 365-day year, so the real interest can differ slightly.',
      },
    },
    {
      hoi: {
        vi: 'Nhập lãi suất 0,06 hay 6 vào ô lãi suất năm?',
        en: 'Should I enter 0.06 or 6 in the annual rate field?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Nhập 6. Ô lãi suất tính theo phần trăm, công thức tự chia 100. Nhập 0,06 sẽ được lãi bằng một phần trăm của mức mong muốn.',
        en: 'Enter 6. The rate field is in percent and the formula divides by 100 itself. Entering 0.06 gives only one hundredth of the interest you expect.',
      },
    },
  ],
};
