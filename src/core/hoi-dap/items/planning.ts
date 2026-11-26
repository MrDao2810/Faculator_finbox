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
    {
      hoi: {
        vi: 'Tại sao một đợt có tiền mua mà giá mua bằng 0 thì công thức báo chia cho 0?',
        en: 'Why does the formula report a divide by zero when a round has an amount but a purchase price of 0?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Số cổ phiếu mua được mỗi đợt là tiền mua chia giá mua, nên giá bằng 0 thì không chia được. Hãy nhập giá mua đợt đó lớn hơn 0, hoặc đưa cả tiền mua đợt đó về 0 để công thức bỏ qua đợt này.',
        en: 'The shares bought in each round are the amount divided by the price, so a price of 0 cannot be divided. Enter a purchase price above 0 for that round, or set its amount to 0 as well so the formula skips the round.',
      },
    },
    {
      hoi: {
        vi: 'Cộng phí mua vào ô Tiền mua thì giá vốn trung bình có tính luôn phí không?',
        en: 'If I add the buy fee into the Amount invested field, does the average cost include the fee?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Công thức tính số cổ phiếu bằng tiền mua chia giá mua, nên cộng cùng một tỷ lệ phí vào mọi đợt thì số cổ phiếu cũng đội theo đúng tỷ lệ ấy và giá vốn không đổi: ba đợt FPT 10.000.000 ₫ hay 10.015.000 ₫ đều cho 67.028,32 ₫. Muốn có giá hoà vốn tính cả phí và thuế, dùng công thức Giá hoà vốn thực.',
        en: 'No. The formula counts shares as the amount divided by the price, so adding the same fee rate to every round inflates the share count by that same ratio and the average cost stays put: three FPT rounds of 10,000,000 ₫ or 10,015,000 ₫ both give 67,028.32 ₫. For a break-even price that includes fees and tax, use the True break-even price formula.',
      },
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
      traLoi: {
        vi: 'Câu trả lời trong chủ đề: dù chỉ còn 2 đến 3 tháng, cả quãng đã gửi vẫn tính theo lãi suất không kỳ hạn, gần như mất hết lãi. Công thức tính đúng như vậy: sổ 100 triệu ₫ kỳ hạn 12 tháng lãi 5,5%/năm, rút sau 273 ngày với lãi không kỳ hạn 0,1%/năm, nhận 74.794,52 ₫ thay vì 4.113.698,63 ₫ theo lãi trên sổ cho 273 ngày ấy.',
        en: 'The answer in the thread: even with only 2 to 3 months left, the whole period held earns only the demand-deposit rate, so nearly all the interest is lost. The formula works the same way: a 100 million ₫ 12-month deposit at 5.5%/year withdrawn after 273 days, with a 0.1%/year demand rate, earns 74,794.52 ₫ instead of the 4,113,698.63 ₫ the contract rate pays for those 273 days.',
      },
      nguonTraLoi: [
        {
          url: 'https://voz.vn/t/rut-tien-truoc-han-ngan-hang-tinh-lai-ntn-cac-thim.243021/',
          ten: 'Voz',
        },
      ],
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
      traLoi: {
        vi: 'Khi rút trước hạn, cả quãng đã gửi chỉ được hưởng lãi không kỳ hạn, tức con số công thức trả về: sổ 1 tỷ ₫ lãi 8,1%/năm rút sau 92 ngày chỉ được hưởng 252.054,79 ₫ trên 20.416.438,36 ₫ lãi theo sổ. Nếu sổ đã trả lãi hằng tháng theo mức ghi trên sổ, phần đã nhận vượt con số ấy được tính lại khi tất toán theo điều khoản của sổ; công thức không mô phỏng bước này.',
        en: 'On early withdrawal the whole period held earns only the demand-deposit rate, which is the figure the formula returns: 1 billion ₫ at 8.1%/year withdrawn after 92 days is entitled to 252,054.79 ₫ out of 20,416,438.36 ₫ of contract interest. If the deposit has already paid monthly interest at the contract rate, what you received above that figure is settled at closing under the deposit terms; the formula does not model that step.',
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
      traLoi: {
        vi: 'Có khác, nhưng ít: cùng lãi suất thì quay vòng cầm về nhiều hơn một chút, vì lãi mỗi vòng được gửi tiếp. 100 triệu ₫ cùng 5%/năm trong 12 tháng: hai vòng 6 tháng hơn sổ 12 tháng 62.500 ₫, bốn vòng 3 tháng hơn 94.533,69 ₫. Khi sổ kỳ dài trả lãi cao hơn thì kết quả có thể thành âm.',
        en: 'Yes, slightly: at the same rate rolling over ends a little ahead, because each round’s interest is redeposited. 100 million ₫ at 5%/year for 12 months: two 6-month rounds beat the 12-month deposit by 62,500 ₫, and four 3-month rounds by 94,533.69 ₫. When the long deposit pays a higher rate the result can turn negative.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao tổng thời gian không chia hết cho kỳ hạn ngắn thì công thức báo kết quả không có ý nghĩa?',
        en: 'Why does the formula report a meaningless result when the total time is not a multiple of the short term?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Vì vòng cuối bị dở dang, chẳng hạn kỳ 5 tháng trong 12 tháng, nên hai cách gửi không kết thúc cùng lúc để so. Hãy chọn tổng thời gian là bội số của kỳ hạn ngắn: kỳ 3 tháng thì so ở mốc 6, 9 hay 12 tháng.',
        en: 'Because the last round would be cut short, for example 5-month terms over 12 months, so the two options do not end at the same time. Pick a total time that is a multiple of the short term: with 3-month terms compare at 6, 9 or 12 months.',
      },
    },
    {
      hoi: {
        vi: 'Nếu cần tiền giữa chừng mà rút sổ kỳ dài trước hạn thì phép so sánh còn đúng không?',
        en: 'If I need the money midway and break the long deposit early, does the comparison still hold?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Công thức so ở mốc đáo hạn của sổ kỳ dài; rút trước hạn thì sổ ấy chỉ được lãi không kỳ hạn. Ví dụ sổ 1 tỷ ₫ kỳ hạn 12 tháng lãi 6,8%/năm rút sau 182 ngày, lãi không kỳ hạn 0,1%/năm, chỉ nhận 498.630,14 ₫; xem công thức Lãi thực nhận khi rút trước hạn.',
        en: 'No. The formula compares at the maturity of the long deposit; withdrawn early, that deposit earns only the demand-deposit rate. For example, 1 billion ₫ in a 12-month deposit at 6.8%/year withdrawn after 182 days, with a 0.1%/year demand rate, earns just 498,630.14 ₫; see the Interest received on early withdrawal formula.',
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
      traLoi: {
        vi: 'Câu trả lời trong chủ đề: lệnh bán nào cũng bị trừ thuế, lỗ hay lãi như nhau. Đúng với biểu phí đang dùng: thuế chuyển nhượng 0,1% tính trên giá trị bán từng lần (Luật 109/2025/QH15, Điều 13 khoản 2), nên khoản lỗ không làm giảm thuế; bán lỗ 1.000 CP ở giá 55.000 ₫ vẫn chịu 55.000 ₫ thuế chuyển nhượng.',
        en: 'The answer in the thread: every sale is taxed, at a loss or a gain alike. That matches the schedule in use: the 0.1% transfer tax is charged on the sale value of each trade (Law 109/2025/QH15, Article 13 clause 2), so a loss does not reduce it; selling 1,000 shares at a loss at 55,000 ₫ still costs 55,000 ₫ in transfer tax.',
      },
      nguonTraLoi: [
        {
          url: 'https://voz.vn/t/dong-thue-tncn-tu-thu-nhap-chung-khoan.434037/',
          ten: 'Voz',
        },
      ],
    },
    {
      hoi: {
        vi: 'Năm nay chưa bán cổ phiếu thì nhập ô Giá bán thế nào?',
        en: 'If I have not sold the shares this year, what goes in the Sell price field?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Nhập 0. Khi đó phần thuế chuyển nhượng bằng 0 và tổng thuế chỉ còn thuế cổ tức: 1.000 CP nhận cổ tức 2.000 ₫ mỗi cổ phiếu chịu 100.000 ₫.',
        en: 'Enter 0. The transfer tax part is then 0 and the total is just the dividend tax: 1,000 shares receiving a 2,000 ₫ dividend per share owe 100,000 ₫.',
      },
    },
    {
      hoi: {
        vi: 'Tại sao Giá bán và Cổ tức tiền mặt cùng bằng 0 thì công thức báo kết quả không có ý nghĩa?',
        en: 'Why does the formula report a meaningless result when both the Sell price and the Cash dividend per share are 0?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Vì trong năm chưa có giá trị bán hay cổ tức nào nên không có căn cứ tính thuế; in ra 0 ₫ sẽ trông như đã tính xong. Hãy nhập giá bán hoặc cổ tức lớn hơn 0.',
        en: 'Because there is no sale value or dividend in the year, there is no basis for a tax; printing 0 ₫ would look like a finished calculation. Enter a sell price or a dividend above 0.',
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
