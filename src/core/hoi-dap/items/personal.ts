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
