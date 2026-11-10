import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `risk-drawdown` (`src/core/formulas/risk-drawdown.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_RISK_DRAWDOWN: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'sut-giam-sau-nhat': [
    {
      hoi: {
        vi: 'Mức sụt giảm sâu nhất được tính trên vốn đầu tư hay trên lãi lỗ tuyệt đối?',
        en: 'Is maximum drawdown calculated on invested capital or on raw P&L?',
      },
      nguyenVan: 'Drawdown calculation for strategies',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/3970',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
  'var-lich-su': [
    {
      hoi: {
        vi: 'Tính VaR lịch sử khi chuỗi dữ liệu ngắn thì làm thế nào?',
        en: 'How do I calculate historical VaR with a short time series?',
      },
      nguyenVan: 'Calculating HIstorical VaR with short time series',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/30039',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
  'cvar-lich-su': [
    {
      hoi: {
        vi: 'Quy đổi tổn thất kỳ vọng (CVaR) sang năm như thế nào?',
        en: 'How do I annualize Expected Shortfall?',
      },
      nguyenVan: 'How to annualize Expected Shortfall?',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/928',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
  'sut-giam-hien-tai': [
    {
      hoi: {
        vi: 'Mức sụt giảm (drawdown) tính thế nào khi đỉnh đầu tiên của chiến lược có giá trị 0 và phép chia bị chia cho 0?',
        en: 'How should drawdown be calculated when the first peak of a strategy is 0 and the formula divides by zero?',
      },
      nguyenVan: 'The problem arises when the first "peak" of the trading strategy is of value 0.',
      nguon: {
        url: 'https://quant.stackexchange.com/questions/3970/drawdown-calculation-for-strategies',
        ten: 'Quant StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
    },
  ],
};
