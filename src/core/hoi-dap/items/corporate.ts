import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `corporate` (`src/core/formulas/corporate.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_CORPORATE: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'diem-hoa-von': [
    {
      hoi: {
        vi: 'Vì sao điểm hoà vốn bằng tổng chi phí cố định chia cho (giá bán mỗi đơn vị trừ chi phí biến đổi mỗi đơn vị)?',
        en: 'Why, intuitively, does the break-even point equal total fixed costs divided by (selling price per unit minus variable cost per unit)?',
      },
      nguyenVan:
        'Why intuitively does Break-even point $= \\dfrac{\\text{Total fixed costs}}{\\text{Selling price per unit} − \\text{Variable cost per unit}}$?',
      nguon: {
        url: 'https://economics.stackexchange.com/questions/26110/why-intuitively-does-break-even-point-dfrac-texttotal-fixed-costs-text',
        ten: 'Economics StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Hòa vốn là mức sản lượng làm lợi nhuận bằng 0: doanh thu bằng chi phí cố định cộng chi phí biến đổi. Giải ra thì sản lượng bằng chi phí cố định chia phần chênh giữa giá bán và biến phí mỗi đơn vị, tức mỗi đơn vị góp bao nhiêu để bù chi phí cố định.',
        en: 'Break-even is the volume where profit is zero: revenue equals fixed plus variable costs. Solving gives fixed costs divided by the gap between price and variable cost per unit, i.e. how much each unit contributes toward covering fixed costs.',
      },
      nguonTraLoi: [
        {
          url: 'https://economics.stackexchange.com/questions/26110/why-intuitively-does-break-even-point-dfrac-texttotal-fixed-costs-text',
          ten: 'Economics StackExchange',
        },
      ],
    },
  ],
  'don-bay-tong-hop': [
    {
      hoi: {
        vi: 'Đòn bẩy tổng hợp bằng đòn bẩy hoạt động nhân đòn bẩy tài chính, nhân thế nào cho đúng?',
        en: 'Total leverage equals operating leverage times financial leverage; how is it multiplied correctly?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'DOL = (doanh thu − biến phí) ÷ EBIT, DFL = EBIT ÷ (EBIT − lãi vay), nhân lại EBIT triệt tiêu, còn (doanh thu − biến phí) ÷ (EBIT − lãi vay). Ví dụ doanh thu 1.000, biến phí 600, định phí 200, lãi vay 100: EBIT 200, DOL 2, DFL 2, tổng hợp 4.',
        en: 'DOL = (revenue − variable costs) ÷ EBIT and DFL = EBIT ÷ (EBIT − interest); EBIT cancels in the product leaving (revenue − variable costs) ÷ (EBIT − interest). Example revenue 1,000, variable costs 600, fixed costs 200, interest 100: EBIT 200, DOL 2, DFL 2, total 4.',
      },
    },
    {
      hoi: {
        vi: 'Vì sao công thức báo vô nghĩa khi EBIT không dương?',
        en: 'Why does the formula report a meaningless result when EBIT is not positive?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'EBIT bằng doanh thu trừ biến phí trừ định phí hoạt động. Khi EBIT không dương, doanh nghiệp lỗ hoạt động và hệ số đòn bẩy không còn ý nghĩa. Xem lại doanh thu và cấu trúc chi phí.',
        en: 'EBIT is revenue minus variable costs minus operating fixed costs. When EBIT is not positive the company has an operating loss and the leverage coefficient is no longer meaningful. Review revenue and the cost structure.',
      },
    },
    {
      hoi: {
        vi: 'Lãi vay bằng hoặc lớn hơn EBIT thì sao, tại sao không ra số?',
        en: 'What if interest equals or exceeds EBIT, and why is there no number?',
      },
      tuSoan: true,
      traLoi: {
        vi: 'Mẫu số EBIT − lãi vay bằng 0 thì báo chia cho 0, thấp hơn 0 thì báo vô nghĩa vì lợi nhuận hoạt động không đủ trả lãi. Cần giảm nợ vay hoặc chờ EBIT vượt lãi vay.',
        en: 'If EBIT − interest equals 0 it reports a divide-by-zero, and below 0 it reports a meaningless result because operating profit cannot cover interest. Reduce debt or wait for EBIT to exceed interest.',
      },
    },
  ],
};
