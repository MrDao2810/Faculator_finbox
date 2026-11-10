import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `fees` (`src/core/formulas/fees.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_FEES: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'thue-chuyen-nhuong': [
    {
      hoi: {
        vi: 'Lỗ khi bán cổ phiếu có được miễn hoặc khấu trừ thuế không?',
        en: 'If I sell a stock at a loss, is the transfer tax waived or deductible?',
      },
      nguyenVan: 'Lỗ khi bán cổ phiếu có được miễn hoặc khấu trừ thuế không?',
      nguon: {
        url: 'https://kisvn.vn/en/hoc-dau-tu/thue-ban-co-phieu',
        ten: 'KIS Việt Nam FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Không. Thuế chuyển nhượng chứng khoán tính 0,1% trên giá trị bán của từng giao dịch, không tính trên lợi nhuận, nên bán lỗ vẫn chịu thuế.',
        en: 'No. The securities transfer tax is 0.1% of the sale value of each trade, not of the profit, so a sale at a loss is still taxed.',
      },
      nguonTraLoi: [
        {
          url: 'https://kisvn.vn/en/hoc-dau-tu/thue-ban-co-phieu',
          ten: 'KIS Việt Nam FAQ',
        },
      ],
    },
    {
      hoi: {
        vi: 'Mua cổ phiếu có bị tính thuế thu nhập cá nhân không?',
        en: 'Is personal income tax charged when I buy a stock?',
      },
      nguyenVan: 'Mua cổ phiếu có bị tính thuế TNCN không?',
      nguon: {
        url: 'https://kisvn.vn/en/hoc-dau-tu/thue-ban-co-phieu',
        ten: 'KIS Việt Nam FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Thông thường không tính thuế khi mua. Thuế 0,1% khấu trừ ở chiều bán; chiều mua chỉ có phí giao dịch và các phí dịch vụ khác.',
        en: 'Normally no tax is charged on a buy. The 0.1% tax is withheld on the sell side; a buy only carries brokerage and other service fees.',
      },
      nguonTraLoi: [
        {
          url: 'https://kisvn.vn/en/hoc-dau-tu/thue-ban-co-phieu',
          ten: 'KIS Việt Nam FAQ',
        },
      ],
    },
  ],
  'thue-co-tuc': [
    {
      hoi: {
        vi: 'Không bán cổ phiếu thì có phải nộp thuế không?',
        en: 'Do I owe tax if I do not sell my shares?',
      },
      nguyenVan: 'Không bán cổ phiếu thì có phải nộp thuế không?',
      nguon: {
        url: 'https://kisvn.vn/en/hoc-dau-tu/thue-ban-co-phieu',
        ten: 'KIS Việt Nam FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Chỉ nắm giữ chưa phát sinh thuế chuyển nhượng, nhưng cổ tức tiền mặt vẫn chịu thuế 5% khi bạn đang giữ cổ phiếu.',
        en: 'Merely holding shares triggers no transfer tax, but cash dividends are still taxed at 5% while you hold the stock.',
      },
      nguonTraLoi: [
        {
          url: 'https://kisvn.vn/en/hoc-dau-tu/thue-ban-co-phieu',
          ten: 'KIS Việt Nam FAQ',
        },
      ],
    },
  ],
  'loi-nhuan-rong': [
    {
      hoi: {
        vi: 'Lỗ khi bán cổ phiếu có được miễn hoặc khấu trừ thuế không?',
        en: 'If I sell a stock at a loss, is the transfer tax waived or deductible?',
      },
      nguyenVan: 'Lỗ khi bán cổ phiếu có được miễn hoặc khấu trừ thuế không?',
      nguon: {
        url: 'https://kisvn.vn/en/hoc-dau-tu/thue-ban-co-phieu',
        ten: 'KIS Việt Nam FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Không. Thuế 0,1% tính trên giá trị bán của từng giao dịch, không tính trên lợi nhuận, nên bán lỗ vẫn bị trừ thuế này.',
        en: 'No. The 0.1% tax is on the sale value of each trade, not on profit, so a loss-making sale still bears it.',
      },
      nguonTraLoi: [
        {
          url: 'https://kisvn.vn/en/hoc-dau-tu/thue-ban-co-phieu',
          ten: 'KIS Việt Nam FAQ',
        },
      ],
    },
  ],
  'phi-giao-dich-mua': [
    {
      hoi: {
        vi: 'Phí giao dịch mua được tính trên khối lượng cổ phiếu hay trên giá trị lệnh?',
        en: 'Is the buy brokerage fee charged on the number of shares or on the order value?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Trên giá trị lệnh: phí = khối lượng × giá mua × tỷ lệ phí. Theo biểu phí đang dùng trong công cụ, tỷ lệ mua là 0,15%, nên 1.000 CP giá 92.000 ₫ bị phí 138.000 ₫.',
        en: 'On the order value: fee = quantity × buy price × fee rate. Under the fee schedule used in the tool the buy rate is 0.15%, so 1,000 shares at 92,000 ₫ carry a 138,000 ₫ fee.',
      },
    },
    {
      hoi: {
        vi: 'Phí mua đã nằm trong giá khớp lệnh hay bị trừ riêng khỏi tài khoản?',
        en: 'Is the buy fee already included in the matched price, or deducted separately from the account?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Trừ riêng. Giá khớp chỉ là giá cổ phiếu, còn phí là khoản thêm, nên giá vốn thật của mỗi cổ phiếu cao hơn giá khớp. Công thức này chỉ cho ra khoản phí, chưa cộng vào giá vốn.',
        en: 'Separately. The matched price is only the share price and the fee is extra, so your true cost per share is above the matched price. This formula returns only the fee, not the adjusted cost.',
      },
    },
    {
      hoi: {
        vi: 'Mức phí 0,15% trong công cụ có phải mức luật định mà công ty chứng khoán nào cũng thu không?',
        en: 'Is the 0.15% rate in the tool a statutory rate that every broker charges?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Đó là mức phổ biến đặt làm biểu phí mặc định của công cụ, không phải mức luật định. Biểu phí đang dùng ghi trần phí môi giới 0,45% giá trị giao dịch theo Thông tư 102/2021/TT-BTC, và công ty chứng khoán của bạn có thể thu khác.',
        en: "No. It is a common market rate set as the tool's default schedule, not a statutory rate. The schedule in use cites a 0.45% cap on brokerage under Circular 102/2021/TT-BTC, and your broker may charge differently.",
      },
    },
    {
      hoi: {
        vi: 'Nếu mua 0 cổ phiếu thì phí mua là bao nhiêu?',
        en: 'What is the buy fee if I buy 0 shares?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Bằng 0 ₫, vì phí tỷ lệ với giá trị lệnh mà lệnh bằng 0. Đây là kết quả đúng của phép tính, không phải lỗi.',
        en: 'It is 0 ₫, because the fee is proportional to the order value and the order is 0. That is the genuine result of the calculation, not an error.',
      },
    },
  ],
  'phi-giao-dich-ban': [
    {
      hoi: {
        vi: 'Phí giao dịch bán có gồm cả thuế chuyển nhượng chứng khoán không?',
        en: 'Does the sell brokerage fee include the securities transfer tax?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Đây chỉ là phí công ty chứng khoán, thuế là khoản riêng của công thức thuế chuyển nhượng. Với 1.000 CP bán giá 97.000 ₫, phí là 145.500 ₫ còn thuế là 97.000 ₫ theo biểu phí đang dùng.',
        en: "No. This is only the broker's fee, while the tax is a separate item in the transfer tax formula. For 1,000 shares sold at 97,000 ₫ the fee is 145,500 ₫ and the tax is 97,000 ₫ under the schedule in use.",
      },
    },
    {
      hoi: {
        vi: 'Phí bán tính trên giá bán hay trên khoản lãi của lệnh?',
        en: 'Is the sell fee charged on the sale price or on the profit of the trade?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Trên giá trị bán: khối lượng × giá bán × tỷ lệ phí bán. Lệnh bán lỗ vẫn bị phí, vì phí không phụ thuộc lãi hay lỗ.',
        en: 'On the sale value: quantity × sell price × sell fee rate. A losing sale still pays the fee, because the fee does not depend on profit or loss.',
      },
    },
    {
      hoi: {
        vi: 'Khi ước tính lãi, chỉ trừ phí mua có đủ không hay còn phải trừ phí bán?',
        en: 'When estimating profit, is subtracting only the buy fee enough, or must I subtract the sell fee too?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Phải trừ cả phí bán, vì mỗi lệnh khớp đều bị thu phí riêng. Quên phí bán làm lãi ước tính cao hơn thực tế; công thức Lợi nhuận ròng sau phí & thuế gộp sẵn phí mua, phí bán, thuế và phí lưu ký.',
        en: 'You must subtract the sell fee too, since every matched order is charged its own fee. Forgetting it overstates the estimated profit; the Net profit after fees and taxes formula already combines buy fee, sell fee, tax and custody fee.',
      },
    },
  ],
  'phi-luu-ky': [
    {
      hoi: {
        vi: 'Phí lưu ký tính theo giá cổ phiếu hay theo số cổ phiếu và số tháng giữ?',
        en: 'Is the custody fee based on the share price, or on the number of shares and months held?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Theo số cổ phiếu và số tháng, không phụ thuộc giá: khối lượng × số tháng × mức phí mỗi cổ phiếu mỗi tháng. Theo biểu phí đang dùng, mức này là 0,27 ₫/CP/tháng, nên 1.000 CP giữ 5 tháng là 1.350 ₫.',
        en: 'By the number of shares and months, regardless of price: quantity × months × fee per share per month. Under the schedule in use the rate is 0.27 ₫/share/month, so 1,000 shares held 5 months cost 1,350 ₫.',
      },
    },
    {
      hoi: {
        vi: 'Kết quả là phí mỗi tháng hay tổng phí cả thời gian nắm giữ?',
        en: 'Is the result a monthly fee or the total for the whole holding period?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Tổng cho cả thời gian nắm giữ bạn nhập. Muốn phí một tháng thì đặt thời gian là 1 tháng: 1.000 CP khi đó là 270 ₫.',
        en: 'It is the total for the whole holding period you enter. For a single month set the period to 1 month: 1,000 shares then cost 270 ₫.',
      },
    },
    {
      hoi: {
        vi: 'Mức 0,27 ₫ mỗi cổ phiếu mỗi tháng lấy từ đâu và công ty chứng khoán nào cũng thu đúng mức đó?',
        en: 'Where does the 0.27 ₫ per share per month come from, and does every broker charge exactly that?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Công cụ lấy theo biểu giá kèm Thông tư 101/2021/TT-BTC, nay do VSDC ban hành theo cơ chế Thông tư 83/2024/TT-BTC, mức 0,27 ₫ vẫn giữ. Công cụ không khẳng định mọi công ty chứng khoán thu đúng mức này; hãy đối chiếu bảng phí nơi bạn mở tài khoản.',
        en: 'The tool uses the price schedule under Circular 101/2021/TT-BTC, now issued by VSDC under the Circular 83/2024/TT-BTC mechanism, with the 0.27 ₫ rate unchanged. The tool does not claim every broker charges exactly this; check the fee table where your account is held.',
      },
    },
    {
      hoi: {
        vi: 'Có thể bỏ phí lưu ký khỏi giá hoà vốn vì nó nhỏ không?',
        en: 'Can I leave the custody fee out of the break-even price because it is small?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không nên. Khoản này đã bị trừ khỏi tài khoản trước khi bán, nên bỏ đi thì giá hoà vốn tính ra thấp hơn thực tế. Công thức Giá hoà vốn thực đã cộng sẵn phí lưu ký.',
        en: 'It is better not to. The amount has already left the account before you sell, so omitting it makes the break-even price too low. The True break-even price formula already includes the custody fee.',
      },
    },
  ],
  'gia-hoa-von': [
    {
      hoi: {
        vi: 'Vì sao giá hoà vốn thực cao hơn giá mua dù giá không giảm?',
        en: 'Why is the true break-even price above my buy price even if the price has not fallen?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Vì bạn phải bù phí mua, phí lưu ký, và khi bán còn mất phí bán cùng thuế. Với mua 92.000 ₫, giữ 5 tháng, giá hoà vốn là 92.370,28 ₫, tức bán đúng giá mua là đã lỗ.',
        en: 'Because you must recover the buy fee and custody fee, and when selling you also pay the sell fee and tax. For a 92,000 ₫ buy held 5 months the break-even is 92,370.28 ₫, so selling at the buy price is already a loss.',
      },
    },
    {
      hoi: {
        vi: 'Giá hoà vốn đã tính những khoản phí và thuế nào?',
        en: 'Which fees and taxes does the break-even price already include?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Bốn khoản: phí mua, phí lưu ký theo số tháng giữ, phí bán và thuế chuyển nhượng khi bán. Tỷ lệ lấy theo biểu phí đang dùng trong công cụ. Không có khoản nào khác ngoài bốn khoản này.',
        en: 'Four items: the buy fee, the custody fee for the months held, the sell fee and the transfer tax on the sale. Rates come from the fee schedule in use in the tool; no other taxes or fees are included.',
      },
    },
    {
      hoi: {
        vi: 'Khi nào công thức báo lỗi thay vì ra giá hoà vốn?',
        en: 'When does the formula show an error instead of a break-even price?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Khi khối lượng bằng 0 thì báo chia cho 0, vì không còn cổ phiếu nào để chia chi phí. Nó cũng báo vô nghĩa nếu tổng phí bán và thuế bán từ 100% trở lên, điều không xảy ra với biểu phí hiện tại.',
        en: 'With quantity 0 it reports a divide by zero, since there are no shares to spread the cost over. It also reports a meaningless result if the sell fee and tax add up to 100% or more, which does not happen with the current schedule.',
      },
    },
    {
      hoi: {
        vi: 'Giá hoà vốn có đổi khi tôi mua nhiều cổ phiếu hơn không?',
        en: 'Does the break-even price change if I buy more shares?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Phí mua, phí bán và thuế đều tỷ lệ với giá trị lệnh, còn phí lưu ký tỷ lệ với số cổ phiếu, nên khối lượng bị triệt tiêu ở tử số và mẫu số. Giá mua và số tháng giữ mới làm giá hoà vốn đổi. Riêng khối lượng bằng 0 thì công thức báo lỗi.',
        en: 'No. The buy fee, sell fee and tax scale with order value and custody with share count, so quantity cancels between numerator and denominator. The buy price and months held are what move it. Only a quantity of 0 makes the formula report an error.',
      },
    },
  ],
  'roi-rong': [
    {
      hoi: {
        vi: 'ROI ròng chia lợi nhuận ròng cho tiền mua cổ phiếu hay cho tổng vốn bỏ ra?',
        en: 'Does net ROI divide net profit by the share purchase value or by the total capital deployed?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Cho tổng vốn thực bỏ ra: tiền mua cộng phí mua và phí lưu ký. Chia cho tiền mua thuần sẽ làm tỷ suất đẹp hơn thực tế.',
        en: 'By the total capital actually deployed: purchase value plus buy fee and custody fee. Dividing by the raw purchase value would flatter the rate.',
      },
    },
    {
      hoi: {
        vi: 'Phí mua, phí bán, thuế và phí lưu ký đã được trừ khỏi lợi nhuận trong ROI ròng chưa?',
        en: 'Are the buy fee, sell fee, tax and custody fee already deducted from the profit in net ROI?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Rồi. Lợi nhuận ròng lấy chênh lệch giá bán trừ giá mua rồi trừ cả bốn khoản đó, tỷ lệ lấy theo biểu phí đang dùng. Với ví dụ 1.000 CP mua 92.000 ₫, bán 97.000 ₫, giữ 5 tháng, kết quả là 5,01% (lợi nhuận ròng 4.618.150 ₫).',
        en: 'Yes. Net profit takes the sell-minus-buy gap and then subtracts all four items, with rates from the schedule in use. For 1,000 shares bought at 92,000 ₫, sold at 97,000 ₫ and held 5 months the result is 5.01% (net profit 4,618,150 ₫).',
      },
    },
    {
      hoi: {
        vi: 'ROI ròng là lãi theo năm hay lãi của riêng lần mua bán này?',
        en: 'Is net ROI an annual return or the return of this single round trip?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Là lãi của riêng lần mua bán này, tính trên vốn bỏ ra, không quy ra năm. Muốn so với lãi suất tiết kiệm phải so với lãi tính đúng cho số tháng bạn giữ.',
        en: 'It is the return of this single round trip on the capital put in, not annualized. To compare it with savings interest, use the interest for exactly the months you held.',
      },
    },
    {
      hoi: {
        vi: 'Khi nào ROI ròng báo lỗi chia cho 0?',
        en: 'When does net ROI report a divide by zero?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Khi vốn bỏ ra bằng 0: khối lượng bằng 0, hoặc giá mua và thời gian nắm giữ cùng bằng 0. Lúc đó không có mẫu số để tính tỷ suất. Hãy nhập khối lượng và giá mua lớn hơn 0.',
        en: 'When the capital deployed is 0: the quantity is 0, or both the buy price and the holding months are 0. There is then no base to compute a rate on. Enter a quantity and buy price greater than 0.',
      },
    },
  ],
};
