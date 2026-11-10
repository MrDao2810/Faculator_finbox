import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `risk` (`src/core/formulas/risk.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_RISK: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'co-lenh-rui-ro': [
    {
      hoi: {
        vi: 'Vì sao đặt giá cắt lỗ bằng giá vào lệnh thì công thức báo lỗi thay vì ra một con số?',
        en: 'Why does the formula report an error instead of a number when the stop-loss equals the entry price?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Khoảng lỗ mỗi cổ phiếu bằng 0 nên cỡ lệnh phải chia cho 0. Sản phẩm báo chia cho 0 chứ không in số vô hạn hay 0. Hãy đặt giá cắt lỗ thấp hơn giá vào lệnh.',
        en: 'The loss per share is 0, so the position size would divide by 0. The product reports a divide-by-zero error rather than show an infinite number or 0. Set the stop-loss below the entry price.',
      },
    },
    {
      hoi: {
        vi: 'Giá cắt lỗ cao hơn giá vào lệnh thì sao, có tính được cỡ lệnh không?',
        en: 'What if the stop-loss is above the entry price, can the position size still be computed?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Không. Công thức này dành cho lệnh mua nên cắt lỗ phải nằm dưới giá vào. Nếu đặt cao hơn, khoảng lỗ ra số âm và sản phẩm báo kết quả vô nghĩa, không đảo dấu để cho ra một số dương.',
        en: 'No. This formula is for buy orders, so the stop must sit below the entry. If it is higher, the gap turns negative and the product reports a meaningless result instead of flipping the sign into a positive number.',
      },
    },
    {
      hoi: {
        vi: 'Cỡ lệnh ra lớn hơn số tiền tôi có trong tài khoản thì có sao không?',
        en: 'What if the position size costs more than the money in my account?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Công thức chỉ giới hạn theo rủi ro, không kiểm tra tiền mặt. Ví dụ vốn 500 triệu ₫, rủi ro 2%, vào 92.000 và cắt lỗ 91.000 cho 10.000 cổ phiếu, tức 920 triệu ₫ tiền mua. Bạn phải tự giảm xuống theo số tiền có.',
        en: 'It caps the order by risk only and does not check cash. For example, capital of 500 million ₫, 2% risk, entry 92,000 and stop 91,000 gives 10,000 shares, which costs 920 million ₫. You must scale down to the cash you have.',
      },
    },
    {
      hoi: {
        vi: 'Cỡ lệnh ra số lẻ như 2.272,73 thì tôi mua bao nhiêu cổ phiếu?',
        en: 'The position size shows a fraction such as 2,272.73, so how many shares should I buy?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Sản phẩm không làm tròn, nên số mua thật phải làm tròn xuống: ở ví dụ là 2.272. Làm tròn lên thành 2.273 cổ phiếu thì khoản lỗ khi chạm cắt lỗ vượt mức rủi ro đã đặt.',
        en: 'The product does not round, so the real order must be rounded down: 2,272 in the example. Rounding up to 2,273 shares would make the loss at the stop exceed the risk you set.',
      },
    },
    {
      hoi: {
        vi: 'Cỡ lệnh này đã tính phí giao dịch và thuế chưa?',
        en: 'Does this position size already include trading fees and tax?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Chưa. Công thức chỉ dùng vốn, % rủi ro, giá vào và giá cắt lỗ. Phí mua bán và trượt giá khi khớp lệnh làm khoản lỗ thực tế lệch so với mức bạn đặt.',
        en: 'No. The formula uses only capital, risk percent, entry and stop prices. Trading fees and slippage on fills make the real loss differ from the amount you set.',
      },
    },
  ],
};
