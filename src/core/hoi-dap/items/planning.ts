import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `planning` (`src/core/formulas/planning.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_PLANNING: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'gia-von-trung-binh-dca': [
    {
      hoi: {
        vi: 'Có tài liệu nào phân tích toán học của việc mua trung bình giá (DCA) và nó có thật sự có lợi không?',
        en: 'Is there a detailed mathematical analysis of dollar cost averaging and is it really beneficial?',
      },
      nguyenVan:
        'Does anyone have a reference to a detailed mathematical analysis of the process of dollar cost averaging and whether it is really beneficial?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/7097/the-mathematics-of-dollar-cost-averaging',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Khi mỗi kỳ bỏ ra số tiền bằng nhau, giá vốn trung bình chính là trung bình điều hòa của các giá mua, nên nghiêng về các mức giá thấp. Nguồn nói tác dụng rõ hơn khi giá biến động mạnh.',
        en: 'When an equal amount is invested each period, the average cost equals the harmonic mean of the purchase prices, so it leans toward the lower prices. The source says the effect is stronger when volatility is higher.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/7097/the-mathematics-of-dollar-cost-averaging',
          ten: 'Money StackExchange',
        },
      ],
    },
  ],
  'rut-truoc-han': [
    {
      hoi: {
        vi: 'Rút tiền tiết kiệm trước hạn có mất hết lãi không?',
        en: 'Do I lose all the interest if I withdraw savings early?',
      },
      nguyenVan: 'Rút tiền tiết kiệm trước hạn có mất hết lãi không?',
      nguon: {
        url: 'https://www.momo.vn/blog/rut-tien-tiet-kiem-truoc-thoi-han-nhung-luu-y-ban-can-biet-c181dt1655',
        ten: 'MoMo hỏi đáp',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Không mất sạch nhưng còn rất ít: phần tiền rút được tính theo lãi suất không kỳ hạn, thấp hơn nhiều so với lãi suất kỳ hạn ban đầu.',
        en: 'Not all of it, but very little remains: the withdrawn amount earns the demand-deposit rate, far below the original term rate.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.momo.vn/blog/rut-tien-tiet-kiem-truoc-thoi-han-nhung-luu-y-ban-can-biet-c181dt1655',
          ten: 'MoMo hỏi đáp',
        },
      ],
    },
    {
      hoi: {
        vi: 'Khi rút một phần hoặc toàn bộ tiền gửi trước hạn thì lãi được tính thế nào?',
        en: 'How is interest calculated when I withdraw part or all of a deposit early?',
      },
      nguyenVan:
        'Khi rút một phần hoặc toàn bộ tiền trong số tiền gửi trước thời hạn thì tiền lãi được tính như thế nào?',
      nguon: {
        url: 'https://techcombank.com/thong-tin/blog/tien-gui-co-ky-han',
        ten: 'Techcombank hỏi đáp',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Rút một phần thì chỉ phần rút hưởng lãi suất không kỳ hạn, phần còn lại giữ lãi suất kỳ hạn đã thỏa thuận; rút toàn bộ thì cả số tiền tính theo lãi suất không kỳ hạn.',
        en: 'For a partial withdrawal only the withdrawn part earns the demand-deposit rate and the rest keeps the agreed term rate; for a full withdrawal the whole amount earns the demand-deposit rate.',
      },
      nguonTraLoi: [
        {
          url: 'https://techcombank.com/thong-tin/blog/tien-gui-co-ky-han',
          ten: 'Techcombank hỏi đáp',
        },
      ],
    },
    {
      hoi: {
        vi: 'Rút một phần sổ tiết kiệm được không?',
        en: 'Can I withdraw only part of a savings deposit?',
      },
      nguyenVan: 'Rút một phần sổ tiết kiệm được không?',
      nguon: {
        url: 'https://www.momo.vn/blog/rut-tien-tiet-kiem-truoc-thoi-han-nhung-luu-y-ban-can-biet-c181dt1655',
        ten: 'MoMo hỏi đáp',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn cho biết hầu hết ngân hàng cho rút một phần gốc; phần rút tính lãi không kỳ hạn, phần còn lại giữ lãi suất kỳ hạn ban đầu.',
        en: 'The source says most banks allow withdrawing part of the principal; the withdrawn part earns the demand-deposit rate and the rest keeps the original term rate.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.momo.vn/blog/rut-tien-tiet-kiem-truoc-thoi-han-nhung-luu-y-ban-can-biet-c181dt1655',
          ten: 'MoMo hỏi đáp',
        },
      ],
    },
    {
      hoi: {
        vi: 'Nếu rút trước hạn 2 đến 3 tháng thì ngân hàng tính lãi như thế nào?',
        en: 'If I withdraw 2 to 3 months early, how does the bank calculate interest?',
      },
      nguyenVan: 'Vậy nếu rút trước hạn 2 3 tháng thì ngân hàng tính lãi như nào ạ.',
      nguon: {
        url: 'https://voz.vn/t/rut-tien-truoc-han-ngan-hang-tinh-lai-ntn-cac-thim.243021/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'Rút trước hạn thì ngân hàng có thu hồi số lãi đã trả hằng tháng không?',
        en: 'If I withdraw early, will the bank take back the interest already paid each month?',
      },
      nguyenVan: 'rút trước hạn 6 tháng nó tự thu hồi số lãi đã trả hàng tháng phải không ạ?',
      nguon: {
        url: 'https://voz.vn/t/tat-toan-truoc-han-bi-thu-hoi-lai-da-tra.790686/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
    },
  ],
  'gui-quay-vong': [
    {
      hoi: {
        vi: 'Nếu lãi suất vẫn như vậy, cứ để tái tục cho lãi nhập gốc thì có khác gì gửi kỳ dài không?',
        en: 'If the rate stays the same, does letting a deposit roll over and compound differ from a long-term deposit?',
      },
      nguyenVan: 'ví nếu vẫn là lãi số % như vậy cứ để im cho nó lãi kép thì cũng khác gì đâu nhỉ',
      nguon: {
        url: 'https://voz.vn/t/gui-ngan-hang-ky-han-nhanh-hay-cham-thi-se-tot-hon-ca-cac-bac.905129/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
    },
  ],
  'thue-tncn-dau-tu': [
    {
      hoi: {
        vi: 'Bán chứng khoán bị lỗ thì có được trừ vào thuế không?',
        en: 'If I sell securities at a loss, is the loss deducted from the tax?',
      },
      nguyenVan: 'Vậy lỗ có bị trừ không bro?',
      nguon: {
        url: 'https://voz.vn/t/dong-thue-tncn-tu-thu-nhap-chung-khoan.434037/',
        ten: 'Voz',
        noi: 'dien-dan',
        vietnam: true,
      },
    },
  ],
  'so-ky-dca': [
    {
      hoi: {
        vi: 'Vì sao tính ra cần ít tháng hơn mục tiêu chia mức góp?',
        en: 'Why is the number of months smaller than target divided by contribution?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Vì các khoản góp sinh lợi. Chia thẳng mục tiêu cho mức góp bỏ qua lợi nhuận tích luỹ nên cho số tháng dài hơn hoặc bằng. Ví dụ 500 triệu, góp 10 triệu mỗi tháng, 6,8%/năm cần 45 tháng thay vì 50.',
        en: 'Because contributions earn a return. Dividing target by contribution ignores accumulated returns, so it gives an equal or longer time. For example 500 million, 10 million a month at 6.8% a year takes 45 months instead of 50.',
      },
    },
    {
      hoi: {
        vi: 'Sản phẩm giả định góp đầu tháng hay cuối tháng?',
        en: 'Does the tool assume contributions at the start or the end of the month?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Cuối mỗi tháng. Lợi suất năm chia 12 thành lợi suất tháng và khoản góp đầu tiên chưa kịp sinh lời tháng đầu.',
        en: 'At the end of each month. The annual rate is divided by 12 to get a monthly rate, and the first contribution earns nothing in its first month.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao kết quả luôn là số tháng tròn, tháng cuối có thể vượt mục tiêu?',
        en: 'Why is the result always a whole number of months, and could the last month overshoot the target?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Số tháng được làm tròn lên tháng trọn vẹn đầu tiên đủ mục tiêu. Tháng đó số dư thường nhỉnh hơn mục tiêu một chút, trừ khi trùng đúng.',
        en: "The months are rounded up to the first whole month that reaches the target. That month's balance is usually slightly above the target unless it matches exactly.",
      },
    },
    {
      hoi: {
        vi: 'Tại sao báo lỗi chia cho 0 khi mức góp bằng 0, và nếu lợi suất 0% thì sao?',
        en: 'Why is there a divide-by-zero when the contribution is 0, and what if the return is 0%?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không góp đồng nào thì không bao giờ tới mục tiêu nên sản phẩm báo lỗi, không in số. Lợi suất 0% vẫn tính được: số tháng bằng mục tiêu chia mức góp, làm tròn lên.',
        en: 'With no contribution the goal is never reached, so the tool reports an error rather than a number. A 0% return still works: months equal the target divided by the contribution, rounded up.',
      },
    },
  ],
};
