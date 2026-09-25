import type { QuizItem } from '../types';

/**
 * Câu TÍNH TOÁN — mở ngày 24/09/2026 theo yêu cầu chủ dự án.
 *
 * "Hiện tại toàn bộ bài kiểm tra đang chỉ có liên quan đến lý thuyết mà không có thực hành → bài
 * kiểm tra cần phải có liên quan đến phép tính công thức bên trên rồi bên dưới là các đáp án để
 * người dùng chọn." Đo lại lúc ấy: 345 câu thì 306 câu không có bảng số liệu nào, và chỉ 3 câu
 * trắc nghiệm bắt người học tính thật.
 *
 * ── Bốn quy tắc của nhóm câu này ─────────────────────────────────────────────────────────────
 *
 * 1. **Đáp số do `calc` của sản phẩm tính ra, không do người soạn tính tay.** Mỗi câu khai
 *    `verify` (xem docblock `QuizVerify`) và `quiz.test.ts` chạy `runFormula` với đúng bộ số liệu
 *    ấy. Một đáp số soạn nhầm sẽ dạy sai ngay bên dưới chính công thức đúng, trên cùng một màn.
 * 2. **Ba đáp án sai là ba lỗi CÓ THẬT, không phải số bịa cho khác đi.** Chia ngược tử với mẫu,
 *    quên đổi tỷ đồng sang đồng, quên nhân 100, quên lá chắn thuế, dừng ở bước giữa. Mỗi đáp án
 *    sai được lời giải gọi tên, nên chọn nhầm vẫn học được một điều.
 * 3. **Số liệu chọn cho tính nhẩm ra số tròn.** Người học phải kiểm lại được bằng giấy bút, chứ
 *    không phải bấm máy rồi tin. Số tròn cũng khiến ba đáp án sai lệch hẳn nhau, không mập mờ.
 * 4. **Tầng bằng chứng là `tinh-toan`, không phải `ngo-nhan`.** Lời giải của một phép tính không
 *    trích ai cả, nó dẫn lại chính phép tính — nên ca kiểm "trích nguyên văn" không áp vào đây.
 *    Đường dẫn nguồn vẫn bắt buộc và trỏ tới trang định nghĩa công thức, đúng trang mà những câu
 *    lý thuyết của công thức ấy đang dùng.
 *
 * KHÔNG dùng được cho công thức ăn chuỗi giá: chuỗi đi trong `CalcContext` chứ không trong
 * `inputs`, nên `verify` không tả đủ đề bài. 35 công thức thuộc diện ấy, và chúng cần một lối
 * khác — chưa làm.
 */
export const TINH_TOAN: ReadonlyArray<QuizItem> = [
  {
    id: 'Q346',
    formulaId: 'pe',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, P/E của cổ phiếu bằng bao nhiêu?',
      en: 'With the figures below, what is the P/E of this stock?',
    },
    facts: [
      {
        label: { vi: 'Giá thị trường', en: 'Market price' },
        value: { vi: '64.000 ₫', en: '64,000 ₫' },
      },
      {
        label: { vi: 'EPS bốn quý gần nhất', en: 'Trailing EPS' },
        value: { vi: '4.000 ₫', en: '4,000 ₫' },
      },
    ],
    choices: {
      a: { vi: '16,0 lần', en: '16.0x' },
      b: { vi: '0,06 lần', en: '0.06x' },
      c: { vi: '60.000 ₫', en: '60,000 ₫' },
      d: { vi: '16,0%', en: '16.0%' },
    },
    answer: 'a',
    verify: { inputs: { price: 64000, eps: 4000 }, expected: 16, tolerance: 0.01 },
    explain: {
      vi: '64.000 chia 4.000 bằng 16,0 lần: nhà đầu tư đang trả 16 đồng cho mỗi đồng lợi nhuận một năm. Ba đáp án còn lại là ba lỗi hay gặp. 0,06 lần là chia ngược, lấy EPS chia giá, và đó là tỷ suất lợi nhuận trên giá (E/P) chứ không phải P/E. 60.000 ₫ là lấy hiệu hai con số thay vì lấy thương. 16,0% sai đơn vị: P/E là số LẦN, không phải phần trăm.',
      en: '64,000 divided by 4,000 is 16.0x: the investor is paying 16 for each unit of annual earnings. The other three are common slips. 0.06x inverts the ratio, EPS over price, which is the earnings yield (E/P) rather than P/E. 60,000 ₫ subtracts instead of dividing. 16.0% has the wrong unit: P/E is a MULTIPLE, not a percentage.',
    },
    source: {
      url: 'https://cafef.vn/chuyen-nguoc-doi-nhung-co-that-p-e-thap-khong-phai-la-diem-hap-dan-cua-co-phieu-hoa-phat-2022100819552941.chn',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q347',
    formulaId: 'pb',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, P/B của cổ phiếu bằng bao nhiêu?',
      en: 'With the figures below, what is the P/B of this stock?',
    },
    facts: [
      {
        label: { vi: 'Giá thị trường', en: 'Market price' },
        value: { vi: '64.000 ₫', en: '64,000 ₫' },
      },
      {
        label: { vi: 'Giá trị sổ sách mỗi cổ phiếu', en: 'Book value per share' },
        value: { vi: '25.600 ₫', en: '25,600 ₫' },
      },
    ],
    choices: {
      a: { vi: '2,5 lần', en: '2.5x' },
      b: { vi: '0,4 lần', en: '0.4x' },
      c: { vi: '38.400 ₫', en: '38,400 ₫' },
      d: { vi: '2,5%', en: '2.5%' },
    },
    answer: 'a',
    verify: { inputs: { price: 64000, bookValuePerShare: 25600 }, expected: 2.5, tolerance: 0.01 },
    explain: {
      vi: '64.000 chia 25.600 bằng 2,5 lần: thị trường đang trả gấp 2,5 lần giá trị sổ sách. 0,4 lần là chia ngược. 38.400 ₫ là phần chênh giữa giá và giá trị sổ sách, tức lấy hiệu thay vì lấy thương, và nó vẫn mang đơn vị tiền nên không thể là một hệ số. 2,5% sai đơn vị: P/B là số lần.',
      en: '64,000 divided by 25,600 is 2.5x: the market is paying 2.5 times book value. 0.4x inverts the ratio. 38,400 ₫ is the gap between price and book value, a subtraction instead of a division, and it still carries a money unit so it cannot be a multiple. 2.5% has the wrong unit: P/B is a multiple.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/invfables/ch4new.pdf',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q348',
    formulaId: 'eps-co-ban',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, EPS cơ bản bằng bao nhiêu?',
      en: 'With the figures below, what is basic EPS?',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận sau thuế', en: 'Net income' },
        value: { vi: '6.000 tỷ ₫', en: '6,000 billion ₫' },
      },
      { label: { vi: 'Cổ tức ưu đãi', en: 'Preferred dividend' }, value: { vi: '0 ₫', en: '0 ₫' } },
      {
        label: { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
        value: { vi: '1,5 tỷ CP', en: '1.5 billion shares' },
      },
    ],
    choices: {
      a: { vi: '4.000 ₫', en: '4,000 ₫' },
      b: { vi: '4 ₫', en: '4 ₫' },
      c: { vi: '0,25 ₫', en: '0.25 ₫' },
      d: { vi: '9.000 tỷ ₫', en: '9,000 billion ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { netIncome: 6000, preferredDividend: 0, sharesOutstanding: 1500000000 },
      expected: 4000,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Lợi nhuận ghi bằng TỶ đồng còn kết quả phải ra ĐỒNG, nên phải đổi đơn vị: 6.000 tỷ là 6.000.000.000.000 ₫, chia cho 1,5 tỷ cổ phiếu ra 4.000 ₫. Đáp án 4 ₫ chính là quên bước đổi ấy, lấy thẳng 6.000 chia 1.500 triệu. 0,25 ₫ là chia ngược. 9.000 tỷ ₫ là nhân thay vì chia, và một chỉ số tính trên MỘT cổ phiếu thì không thể lớn hơn cả lợi nhuận của doanh nghiệp.',
      en: 'Profit is stated in BILLIONS while the result must be in dong, so the unit has to be converted: 6,000 billion is 6,000,000,000,000 ₫, divided by 1.5 billion shares gives 4,000 ₫. The 4 ₫ answer is exactly that conversion forgotten, dividing 6,000 by 1,500 million directly. 0.25 ₫ inverts the ratio. 9,000 billion ₫ multiplies instead of dividing, and a per-SHARE figure cannot exceed the profit of the whole company.',
    },
    source: {
      url: 'https://www.dnse.com.vn/senses/tin-tuc/hieu-dung-ve-pha-loang-co-phieu-khi-doanh-nghiep-chia-co-tuc-35163328',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q349',
    formulaId: 'bvps',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, BVPS bằng bao nhiêu?',
      en: 'With the figures below, what is BVPS?',
    },
    facts: [
      {
        label: { vi: 'Vốn chủ sở hữu', en: 'Shareholders equity' },
        value: { vi: '30.000 tỷ ₫', en: '30,000 billion ₫' },
      },
      {
        label: { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
        value: { vi: '1,5 tỷ CP', en: '1.5 billion shares' },
      },
    ],
    choices: {
      a: { vi: '20.000 ₫', en: '20,000 ₫' },
      b: { vi: '20 ₫', en: '20 ₫' },
      c: { vi: '0,05 ₫', en: '0.05 ₫' },
      d: { vi: '45.000 tỷ ₫', en: '45,000 billion ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { equity: 30000, sharesOutstanding: 1500000000 },
      expected: 20000,
      tolerance: 0.5,
    },
    explain: {
      vi: '30.000 tỷ ₫ là 30.000.000.000.000 ₫, chia cho 1,5 tỷ cổ phiếu ra 20.000 ₫ mỗi cổ phiếu. Đáp án 20 ₫ là quên đổi tỷ đồng sang đồng, đúng cái bẫy đơn vị mà EPS cũng mắc. 0,05 ₫ là chia ngược. 45.000 tỷ ₫ là nhân thay vì chia. Mẹo tự soát: BVPS phải cùng cỡ với thị giá, một con số 20 ₫ hay 45.000 tỷ ₫ đều không thể là giá của một cổ phiếu.',
      en: '30,000 billion ₫ is 30,000,000,000,000 ₫, divided by 1.5 billion shares gives 20,000 ₫ per share. The 20 ₫ answer skips the billion-to-dong conversion, the same unit trap EPS has. 0.05 ₫ inverts the ratio. 45,000 billion ₫ multiplies instead of dividing. A quick self-check: BVPS should be in the same range as the share price, and neither 20 ₫ nor 45,000 billion ₫ could be the value of one share.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/lectures/pbv.html',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q350',
    formulaId: 'roe',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, ROE bằng bao nhiêu?',
      en: 'With the figures below, what is ROE?',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận sau thuế', en: 'Net income' },
        value: { vi: '6.000 tỷ ₫', en: '6,000 billion ₫' },
      },
      {
        label: { vi: 'Vốn chủ sở hữu', en: 'Shareholders equity' },
        value: { vi: '30.000 tỷ ₫', en: '30,000 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '20%', en: '20%' },
      b: { vi: '0,2%', en: '0.2%' },
      c: { vi: '500%', en: '500%' },
      d: { vi: '24.000 tỷ ₫', en: '24,000 billion ₫' },
    },
    answer: 'a',
    verify: { inputs: { netIncome: 6000, equity: 30000 }, expected: 20, tolerance: 0.01 },
    explain: {
      vi: '6.000 chia 30.000 bằng 0,2, nhân 100 ra 20%: mỗi 100 đồng vốn chủ sở hữu tạo ra 20 đồng lợi nhuận trong năm. Đáp án 0,2% là quên bước nhân 100. 500% là chia ngược, lấy vốn chủ chia lợi nhuận. 24.000 tỷ ₫ là lấy hiệu hai con số, và kết quả vẫn mang đơn vị tiền nên không thể là một tỷ suất. Hai con số cùng đơn vị tỷ đồng nên ở đây KHÔNG phải đổi đơn vị.',
      en: '6,000 divided by 30,000 is 0.2, times 100 gives 20%: every 100 of equity produced 20 of profit over the year. The 0.2% answer forgets the times-100 step. 500% inverts the ratio, equity over profit. 24,000 billion ₫ subtracts, and the result still carries a money unit so it cannot be a rate of return. Both inputs are already in billions, so no unit conversion is needed here.',
    },
    source: { url: 'https://cophieux.com/chi-so-roe/', kind: 'giao-khoa', vietnam: true },
  },
  {
    id: 'Q351',
    formulaId: 'roa',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, ROA bằng bao nhiêu?',
      en: 'With the figures below, what is ROA?',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận sau thuế', en: 'Net income' },
        value: { vi: '6.000 tỷ ₫', en: '6,000 billion ₫' },
      },
      {
        label: { vi: 'Tổng tài sản', en: 'Total assets' },
        value: { vi: '75.000 tỷ ₫', en: '75,000 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '8%', en: '8%' },
      b: { vi: '0,08%', en: '0.08%' },
      c: { vi: '8 lần', en: '8x' },
      d: { vi: '69.000 tỷ ₫', en: '69,000 billion ₫' },
    },
    answer: 'a',
    verify: { inputs: { netIncome: 6000, totalAssets: 75000 }, expected: 8, tolerance: 0.01 },
    explain: {
      vi: '6.000 chia 75.000 bằng 0,08, nhân 100 ra 8%: mỗi 100 đồng tài sản tạo ra 8 đồng lợi nhuận. Đáp án 0,08% là quên nhân 100. 8 lần sai đơn vị, ROA là một tỷ suất phần trăm chứ không phải hệ số. 69.000 tỷ ₫ là lấy hiệu. So với ROE 20% ở cùng doanh nghiệp, ROA luôn thấp hơn vì mẫu số là tổng tài sản, gồm cả phần tài trợ bằng nợ.',
      en: '6,000 divided by 75,000 is 0.08, times 100 gives 8%: every 100 of assets produced 8 of profit. The 0.08% answer forgets the times-100 step. 8x has the wrong unit, ROA is a percentage rate, not a multiple. 69,000 billion ₫ subtracts. Compared with a 20% ROE at the same company, ROA is always lower because the denominator is total assets, including the part funded by debt.',
    },
    source: {
      url: 'https://master.masvn.com/en/kien-thuc-dau-tu-chung-khoan/chi-so-roa-roe-la-gi-va-y-nghia-trong-phan-tich-dau-tu-180',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q352',
    formulaId: 'bien-loi-nhuan-rong',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, biên lợi nhuận ròng bằng bao nhiêu?',
      en: 'With the figures below, what is the net profit margin?',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận sau thuế', en: 'Net income' },
        value: { vi: '6.000 tỷ ₫', en: '6,000 billion ₫' },
      },
      {
        label: { vi: 'Doanh thu thuần', en: 'Net revenue' },
        value: { vi: '50.000 tỷ ₫', en: '50,000 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '12%', en: '12%' },
      b: { vi: '0,12%', en: '0.12%' },
      c: { vi: '8,33 lần', en: '8.33x' },
      d: { vi: '44.000 tỷ ₫', en: '44,000 billion ₫' },
    },
    answer: 'a',
    verify: { inputs: { netIncome: 6000, revenue: 50000 }, expected: 12, tolerance: 0.01 },
    explain: {
      vi: '6.000 chia 50.000 bằng 0,12, nhân 100 ra 12%: cứ 100 đồng doanh thu thì giữ lại được 12 đồng lợi nhuận sau khi trừ hết chi phí và thuế. Đáp án 0,12% là quên nhân 100. 8,33 lần là chia ngược, lấy doanh thu chia lợi nhuận. 44.000 tỷ ₫ là lấy hiệu, tức tổng chi phí và thuế, chứ không phải biên lợi nhuận.',
      en: '6,000 divided by 50,000 is 0.12, times 100 gives 12%: every 100 of revenue leaves 12 of profit after all costs and tax. The 0.12% answer forgets the times-100 step. 8.33x inverts the ratio, revenue over profit. 44,000 billion ₫ subtracts, giving total costs and tax rather than a margin.',
    },
    source: {
      url: 'https://www.tinnhanhchungkhoan.vn/nhieu-doanh-nghiep-niem-yet-lai-lon-nho-thu-nhap-khac-post396380.html',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q353',
    formulaId: 'bien-loi-nhuan-gop',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, biên lợi nhuận gộp bằng bao nhiêu?',
      en: 'With the figures below, what is the gross profit margin?',
    },
    facts: [
      {
        label: { vi: 'Doanh thu thuần', en: 'Net revenue' },
        value: { vi: '50.000 tỷ ₫', en: '50,000 billion ₫' },
      },
      {
        label: { vi: 'Giá vốn hàng bán', en: 'Cost of goods sold' },
        value: { vi: '32.500 tỷ ₫', en: '32,500 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '35%', en: '35%' },
      b: { vi: '65%', en: '65%' },
      c: { vi: '53,85%', en: '53.85%' },
      d: { vi: '17.500 tỷ ₫', en: '17,500 billion ₫' },
    },
    answer: 'a',
    verify: { inputs: { revenue: 50000, cogs: 32500 }, expected: 35, tolerance: 0.01 },
    explain: {
      vi: 'Lợi nhuận gộp bằng 50.000 trừ 32.500 tức 17.500, chia cho doanh thu 50.000 ra 0,35, nhân 100 thành 35%. Đáp án 65% là tỷ lệ giá vốn trên doanh thu, tức phần bù của đáp án đúng. 53,85% là chia lợi nhuận gộp cho GIÁ VỐN thay vì cho doanh thu, một lỗi đổi mẫu số hay gặp. 17.500 tỷ ₫ là dừng ở bước giữa: đó là lợi nhuận gộp, chưa phải biên.',
      en: 'Gross profit is 50,000 minus 32,500, that is 17,500, divided by revenue of 50,000 gives 0.35, times 100 makes 35%. The 65% answer is cost of goods sold over revenue, the complement of the right one. 53.85% divides gross profit by COST rather than by revenue, a common swap of denominator. 17,500 billion ₫ stops at the intermediate step: that is gross profit, not yet a margin.',
    },
    source: {
      url: 'https://kketoan.duytan.edu.vn/bai-viet/bai-viet-ths-duong-thi-thanh-hien-bien-loi-nhuan-nhung-luu-y-khi-su-dung',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q354',
    formulaId: 'no-tren-von-chu',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hệ số D/E bằng bao nhiêu?',
      en: 'With the figures below, what is the D/E ratio?',
    },
    facts: [
      {
        label: { vi: 'Tổng nợ phải trả', en: 'Total liabilities' },
        value: { vi: '45.000 tỷ ₫', en: '45,000 billion ₫' },
      },
      {
        label: { vi: 'Vốn chủ sở hữu', en: 'Shareholders equity' },
        value: { vi: '30.000 tỷ ₫', en: '30,000 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '1,5 lần', en: '1.5x' },
      b: { vi: '0,67 lần', en: '0.67x' },
      c: { vi: '60%', en: '60%' },
      d: { vi: '15.000 tỷ ₫', en: '15,000 billion ₫' },
    },
    answer: 'a',
    verify: { inputs: { totalLiabilities: 45000, equity: 30000 }, expected: 1.5, tolerance: 0.01 },
    explain: {
      vi: '45.000 chia 30.000 bằng 1,5 lần: doanh nghiệp vay 1,5 đồng cho mỗi đồng vốn chủ sở hữu. 0,67 lần là chia ngược. 60% là tỷ lệ nợ trên TỔNG NGUỒN VỐN (45.000 chia 75.000), một chỉ số khác hẳn tuy cùng nói về đòn bẩy, nên đọc kỹ mẫu số trước khi so sánh hai doanh nghiệp. 15.000 tỷ ₫ là lấy hiệu.',
      en: '45,000 divided by 30,000 is 1.5x: the company borrows 1.5 for every 1 of equity. 0.67x inverts the ratio. 60% is debt over TOTAL CAPITAL (45,000 over 75,000), a different measure of the same leverage, so check the denominator before comparing two companies. 15,000 billion ₫ subtracts.',
    },
    source: {
      url: 'https://onehousing.vn/blog/nhung-luu-y-nha-dau-tu-can-biet-khi-su-dung-ty-le-no-tren-von-chu-so-huu-de-n17t',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q355',
    formulaId: 'thanh-toan-hien-hanh',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hệ số thanh toán hiện hành bằng bao nhiêu?',
      en: 'With the figures below, what is the current ratio?',
    },
    facts: [
      {
        label: { vi: 'Tài sản ngắn hạn', en: 'Current assets' },
        value: { vi: '36.000 tỷ ₫', en: '36,000 billion ₫' },
      },
      {
        label: { vi: 'Nợ ngắn hạn', en: 'Current liabilities' },
        value: { vi: '24.000 tỷ ₫', en: '24,000 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '1,5 lần', en: '1.5x' },
      b: { vi: '0,67 lần', en: '0.67x' },
      c: { vi: '12.000 tỷ ₫', en: '12,000 billion ₫' },
      d: { vi: '1,5%', en: '1.5%' },
    },
    answer: 'a',
    verify: {
      inputs: { currentAssets: 36000, currentLiabilities: 24000 },
      expected: 1.5,
      tolerance: 0.01,
    },
    explain: {
      vi: '36.000 chia 24.000 bằng 1,5 lần: tài sản ngắn hạn đủ trả 1,5 lần số nợ đến hạn trong vòng một năm. 0,67 lần là chia ngược. 12.000 tỷ ₫ là lấy hiệu, và đó là VỐN LƯU ĐỘNG RÒNG, một con số có ý nghĩa riêng nhưng không phải hệ số thanh toán. 1,5% sai đơn vị.',
      en: '36,000 divided by 24,000 is 1.5x: current assets cover the liabilities falling due within a year 1.5 times over. 0.67x inverts the ratio. 12,000 billion ₫ subtracts, and that is NET WORKING CAPITAL, a meaningful figure of its own but not a liquidity ratio. 1.5% has the wrong unit.',
    },
    source: {
      url: 'https://takeprofit.vn/tin-nhanh-chung-khoan/nhom-chi-so-thanh-toan/1648352281543',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q356',
    formulaId: 'thanh-toan-nhanh',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hệ số thanh toán nhanh bằng bao nhiêu?',
      en: 'With the figures below, what is the quick ratio?',
    },
    facts: [
      {
        label: { vi: 'Tài sản ngắn hạn', en: 'Current assets' },
        value: { vi: '36.000 tỷ ₫', en: '36,000 billion ₫' },
      },
      {
        label: { vi: 'Hàng tồn kho', en: 'Inventory' },
        value: { vi: '12.000 tỷ ₫', en: '12,000 billion ₫' },
      },
      {
        label: { vi: 'Nợ ngắn hạn', en: 'Current liabilities' },
        value: { vi: '24.000 tỷ ₫', en: '24,000 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '1,0 lần', en: '1.0x' },
      b: { vi: '1,5 lần', en: '1.5x' },
      c: { vi: '0,5 lần', en: '0.5x' },
      d: { vi: '24.000 tỷ ₫', en: '24,000 billion ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { currentAssets: 36000, inventory: 12000, currentLiabilities: 24000 },
      expected: 1,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Loại hàng tồn kho ra khỏi tài sản ngắn hạn trước: 36.000 trừ 12.000 bằng 24.000, chia cho nợ ngắn hạn 24.000 ra đúng 1,0 lần. Đáp án 1,5 lần là quên bước loại hàng tồn kho, và đó chính là hệ số thanh toán HIỆN HÀNH. 0,5 lần là lấy riêng hàng tồn kho chia nợ ngắn hạn. 24.000 tỷ ₫ là dừng ở tử số.',
      en: 'Strip inventory out of current assets first: 36,000 minus 12,000 is 24,000, divided by current liabilities of 24,000 gives exactly 1.0x. The 1.5x answer skips the inventory step, and that is the CURRENT ratio. 0.5x divides inventory alone by current liabilities. 24,000 billion ₫ stops at the numerator.',
    },
    source: {
      url: 'https://taca.com.vn/ty-so-thanh-toan-nhanh/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q357',
    formulaId: 'vong-quay-tong-tai-san',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, vòng quay tổng tài sản bằng bao nhiêu?',
      en: 'With the figures below, what is total asset turnover?',
    },
    facts: [
      {
        label: { vi: 'Doanh thu thuần', en: 'Net revenue' },
        value: { vi: '60.000 tỷ ₫', en: '60,000 billion ₫' },
      },
      {
        label: { vi: 'Tổng tài sản', en: 'Total assets' },
        value: { vi: '75.000 tỷ ₫', en: '75,000 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '0,8 vòng', en: '0.8x' },
      b: { vi: '1,25 vòng', en: '1.25x' },
      c: { vi: '80%', en: '80%' },
      d: { vi: '15.000 tỷ ₫', en: '15,000 billion ₫' },
    },
    answer: 'a',
    verify: { inputs: { revenue: 60000, totalAssets: 75000 }, expected: 0.8, tolerance: 0.01 },
    explain: {
      vi: '60.000 chia 75.000 bằng 0,8 vòng: mỗi đồng tài sản tạo ra 0,8 đồng doanh thu trong năm. 1,25 vòng là chia ngược. 80% sai đơn vị, đây là SỐ VÒNG quay chứ không phải một tỷ lệ phần trăm, và gọi nhầm tên thì cũng đọc nhầm ý nghĩa. 15.000 tỷ ₫ là lấy hiệu.',
      en: '60,000 divided by 75,000 is 0.8: each unit of assets generated 0.8 of revenue over the year. 1.25 inverts the ratio. 80% has the wrong unit, this is a TURNOVER count rather than a percentage, and the wrong name leads to the wrong reading. 15,000 billion ₫ subtracts.',
    },
    source: {
      url: 'https://taca.com.vn/chi-so-vong-quay-tong-tai-san/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q358',
    formulaId: 'ty-le-chi-tra-co-tuc',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hệ số chi trả cổ tức bằng bao nhiêu?',
      en: 'With the figures below, what is the dividend payout ratio?',
    },
    facts: [
      {
        label: { vi: 'Cổ tức tiền mặt mỗi cổ phiếu', en: 'Cash dividend per share' },
        value: { vi: '1.500 ₫', en: '1,500 ₫' },
      },
      { label: { vi: 'EPS', en: 'EPS' }, value: { vi: '5.000 ₫', en: '5,000 ₫' } },
    ],
    choices: {
      a: { vi: '30%', en: '30%' },
      b: { vi: '3,33 lần', en: '3.33x' },
      c: { vi: '70%', en: '70%' },
      d: { vi: '0,3%', en: '0.3%' },
    },
    answer: 'a',
    verify: { inputs: { dividendPerShare: 1500, eps: 5000 }, expected: 30, tolerance: 0.01 },
    explain: {
      vi: '1.500 chia 5.000 bằng 0,3, nhân 100 ra 30%: doanh nghiệp chia 30% lợi nhuận và giữ lại 70% để tái đầu tư. Đáp án 3,33 lần là chia ngược, và con số ấy có tên riêng là hệ số bao phủ cổ tức. 70% là phần GIỮ LẠI, phần bù của đáp án đúng. 0,3% là quên nhân 100.',
      en: '1,500 divided by 5,000 is 0.3, times 100 gives 30%: the company pays out 30% of earnings and retains 70% to reinvest. The 3.33x answer inverts the ratio, and that figure has its own name, dividend cover. 70% is the RETENTION rate, the complement of the right answer. 0.3% forgets the times-100 step.',
    },
    source: {
      url: 'https://vimo.cuthongthai.vn/blog/co-tuc-cao-bay-ngot-hay-kim-cuong-that-90-f0-khong-biet',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q359',
    formulaId: 'ev',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, Enterprise Value bằng bao nhiêu?',
      en: 'With the figures below, what is Enterprise Value?',
    },
    facts: [
      {
        label: { vi: 'Vốn hoá thị trường', en: 'Market capitalization' },
        value: { vi: '12.000 tỷ ₫', en: '12,000 billion ₫' },
      },
      {
        label: { vi: 'Tổng nợ vay', en: 'Total debt' },
        value: { vi: '5.000 tỷ ₫', en: '5,000 billion ₫' },
      },
      {
        label: { vi: 'Tiền và tương đương tiền', en: 'Cash and equivalents' },
        value: { vi: '2.000 tỷ ₫', en: '2,000 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '15.000 tỷ ₫', en: '15,000 billion ₫' },
      b: { vi: '19.000 tỷ ₫', en: '19,000 billion ₫' },
      c: { vi: '9.000 tỷ ₫', en: '9,000 billion ₫' },
      d: { vi: '12.000 tỷ ₫', en: '12,000 billion ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { marketCap: 12000, totalDebt: 5000, cash: 2000 },
      expected: 15000,
      tolerance: 1,
    },
    explain: {
      vi: 'Cộng nợ vay, TRỪ tiền mặt: 12.000 cộng 5.000 trừ 2.000 bằng 15.000 tỷ ₫. Dấu của tiền mặt là chỗ hay nhầm nhất, và lý do nó mang dấu trừ rất đơn giản: người mua đứt doanh nghiệp sẽ nhận luôn số tiền ấy, nên nó tự bù lại một phần giá mua. Đáp án 19.000 là cộng cả tiền mặt, 9.000 là trừ cả nợ vay, 12.000 là dừng ở vốn hoá, tức bỏ qua hẳn phần nợ.',
      en: 'Add debt, SUBTRACT cash: 12,000 plus 5,000 minus 2,000 is 15,000 billion ₫. The sign on cash is where mistakes cluster, and the reason for the minus is simple: whoever buys the whole company also receives that cash, so it offsets part of the price. The 19,000 answer adds cash, 9,000 subtracts debt too, and 12,000 stops at market capitalization, ignoring debt entirely.',
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2020/04/a-viral-market-update-vii-mayhem-with.html',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q360',
    formulaId: 'ev-sales',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, EV/Sales bằng bao nhiêu?',
      en: 'With the figures below, what is EV/Sales?',
    },
    facts: [
      {
        label: { vi: 'Enterprise Value', en: 'Enterprise Value' },
        value: { vi: '15.000 tỷ ₫', en: '15,000 billion ₫' },
      },
      {
        label: { vi: 'Doanh thu thuần', en: 'Net revenue' },
        value: { vi: '10.000 tỷ ₫', en: '10,000 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '1,5 lần', en: '1.5x' },
      b: { vi: '0,67 lần', en: '0.67x' },
      c: { vi: '1,5%', en: '1.5%' },
      d: { vi: '5.000 tỷ ₫', en: '5,000 billion ₫' },
    },
    answer: 'a',
    verify: { inputs: { ev: 15000, revenue: 10000 }, expected: 1.5, tolerance: 0.01 },
    explain: {
      vi: '15.000 chia 10.000 bằng 1,5 lần: thị trường định giá cả doanh nghiệp, gồm cả phần chủ nợ, bằng 1,5 lần doanh thu một năm. 0,67 lần là chia ngược. 1,5% sai đơn vị. 5.000 tỷ ₫ là lấy hiệu. Lưu ý tử số phải là EV chứ không phải vốn hoá: thay EV bằng vốn hoá thì ra P/S, một bội số ghép tử số của cổ đông với mẫu số của cả doanh nghiệp.',
      en: '15,000 divided by 10,000 is 1.5x: the market values the whole business, creditors included, at 1.5 times one year of revenue. 0.67x inverts the ratio. 1.5% has the wrong unit. 5,000 billion ₫ subtracts. Note the numerator must be EV, not market cap: swapping it gives P/S, a multiple that pairs an equity numerator with a whole-firm denominator.',
    },
    source: {
      url: 'https://corporatefinanceinstitute.com/resources/valuation/enterprise-value-to-sales-ev-sales/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q361',
    formulaId: 'mo-hinh-gordon',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, giá trị hợp lý theo mô hình Gordon bằng bao nhiêu?',
      en: 'With the figures below, what is the fair value under the Gordon model?',
    },
    facts: [
      {
        label: { vi: 'Cổ tức vừa trả (D₀)', en: 'Dividend just paid (D₀)' },
        value: { vi: '2.400 ₫', en: '2,400 ₫' },
      },
      {
        label: { vi: 'Tăng trưởng cổ tức (g)', en: 'Dividend growth (g)' },
        value: { vi: '4%/năm', en: '4% a year' },
      },
      {
        label: { vi: 'Suất sinh lời đòi hỏi (r)', en: 'Required return (r)' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
    ],
    choices: {
      a: { vi: '31.200 ₫', en: '31,200 ₫' },
      b: { vi: '30.000 ₫', en: '30,000 ₫' },
      c: { vi: '20.000 ₫', en: '20,000 ₫' },
      d: { vi: '2.496 ₫', en: '2,496 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { dividend: 2400, growth: 4, requiredReturn: 12 },
      expected: 31200,
      tolerance: 1,
    },
    explain: {
      vi: 'Tử số là cổ tức NĂM TỚI, tức 2.400 nhân 1,04 bằng 2.496; mẫu số là r trừ g, tức 0,12 trừ 0,04 bằng 0,08. 2.496 chia 0,08 ra 31.200 ₫. Đáp án 30.000 ₫ là quên nhân với (1 + g), lấy thẳng cổ tức vừa trả. 20.000 ₫ là lấy r làm mẫu số mà quên trừ g, và đó là lỗi nặng nhất: mẫu số của mô hình này luôn là PHẦN CHÊNH giữa suất chiết khấu và tốc độ tăng. 2.496 ₫ là dừng ở tử số, chưa chiết khấu.',
      en: 'The numerator is NEXT year dividend, 2,400 times 1.04 which is 2,496; the denominator is r minus g, 0.12 minus 0.04 which is 0.08. 2,496 divided by 0.08 gives 31,200 ₫. The 30,000 ₫ answer forgets the (1 + g) factor and uses the dividend just paid. 20,000 ₫ puts r in the denominator without subtracting g, the most damaging slip: the denominator here is always the GAP between the discount rate and the growth rate. 2,496 ₫ stops at the numerator, before discounting.',
    },
    source: {
      url: 'https://aswathdamodaran.substack.com/p/myth-52-as-g-rto-infinity-and-beyond-16-11-30',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q362',
    formulaId: 'ddm-hai-giai-doan',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, giá trị hợp lý theo mô hình DDM hai giai đoạn bằng bao nhiêu?',
      en: 'With the figures below, what is the fair value under the two-stage DDM?',
    },
    facts: [
      {
        label: { vi: 'Cổ tức vừa trả (D₀)', en: 'Dividend just paid (D₀)' },
        value: { vi: '2.000 ₫', en: '2,000 ₫' },
      },
      {
        label: { vi: 'Tăng trưởng giai đoạn đầu', en: 'Stage-one growth' },
        value: { vi: '12%/năm trong 4 năm', en: '12% a year for 4 years' },
      },
      {
        label: { vi: 'Tăng trưởng vĩnh viễn', en: 'Terminal growth' },
        value: { vi: '4%/năm', en: '4% a year' },
      },
      {
        label: { vi: 'Suất sinh lời đòi hỏi (r)', en: 'Required return (r)' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
    ],
    choices: {
      a: { vi: '34.000 ₫', en: '34,000 ₫' },
      b: { vi: '26.000 ₫', en: '26,000 ₫' },
      c: { vi: '8.000 ₫', en: '8,000 ₫' },
      d: { vi: '48.911 ₫', en: '48,911 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: {
        dividend: 2000,
        growthStage1: 12,
        years: 4,
        growthTerminal: 4,
        requiredReturn: 12,
      },
      expected: 34000,
      tolerance: 1,
    },
    explain: {
      vi: 'Giá trị gồm HAI phần cộng lại. Bốn cổ tức của giai đoạn đầu chiết khấu về hiện tại: ở đây tốc độ tăng đúng bằng suất chiết khấu nên mỗi năm quy về vẫn là 2.000 ₫, tổng 8.000 ₫. Giá trị cuối kỳ tại năm 4 bằng cổ tức năm 5 chia cho (r trừ g vĩnh viễn), rồi chiết khấu về hiện tại thành 26.000 ₫. Cộng lại ra 34.000 ₫. Ba đáp án sai đều là bỏ quên một mảnh: 26.000 ₫ chỉ lấy giá trị cuối kỳ, 8.000 ₫ chỉ lấy cổ tức giai đoạn đầu, còn 48.911 ₫ là quên chiết khấu giá trị cuối kỳ về hiện tại, lấy nguyên con số tại năm 4.',
      en: 'The value is TWO parts added together. The four stage-one dividends discounted to today: here the growth rate equals the discount rate, so each year is worth 2,000 ₫ in present value, 8,000 ₫ in total. The terminal value at year 4 is the year-5 dividend divided by (r minus terminal g), discounted back to 26,000 ₫ today. Together that is 34,000 ₫. Each wrong answer drops a piece: 26,000 ₫ takes only the terminal value, 8,000 ₫ only the stage-one dividends, and 48,911 ₫ forgets to discount the terminal value, using its year-4 figure as is.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/adamodar/New_Home_Page/articles/ddm.htm',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q363',
    formulaId: 'capm',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, chi phí vốn chủ sở hữu theo CAPM bằng bao nhiêu?',
      en: 'With the figures below, what is the cost of equity under CAPM?',
    },
    facts: [
      {
        label: { vi: 'Lãi suất phi rủi ro', en: 'Risk-free rate' },
        value: { vi: '4%/năm', en: '4% a year' },
      },
      { label: { vi: 'Beta', en: 'Beta' }, value: { vi: '1,5 lần', en: '1.5x' } },
      {
        label: { vi: 'Phần bù rủi ro vốn chủ', en: 'Equity risk premium' },
        value: { vi: '8%', en: '8%' },
      },
    ],
    choices: {
      a: { vi: '16%', en: '16%' },
      b: { vi: '12%', en: '12%' },
      c: { vi: '18%', en: '18%' },
      d: { vi: '6%', en: '6%' },
    },
    answer: 'a',
    verify: { inputs: { riskFree: 4, beta: 1.5, erp: 8 }, expected: 16, tolerance: 0.01 },
    explain: {
      vi: 'Beta chỉ nhân vào PHẦN BÙ, không nhân vào lãi suất phi rủi ro: 4 cộng 1,5 nhân 8 bằng 4 cộng 12, ra 16%. Đáp án 12% là cộng thẳng 4 với 8, tức bỏ quên beta. 18% là nhân beta vào cả tổng (1,5 nhân 12), tức kéo cả phần phi rủi ro vào rủi ro. 6% là nhân beta với lãi suất phi rủi ro. Thứ tự phép tính ở đây chính là ý nghĩa của mô hình: lãi suất phi rủi ro là nền, phần bù mới là chỗ rủi ro được trả công.',
      en: 'Beta multiplies the PREMIUM only, never the risk-free rate: 4 plus 1.5 times 8 is 4 plus 12, giving 16%. The 12% answer adds 4 and 8 directly, dropping beta. 18% multiplies beta by the whole sum (1.5 times 12), dragging the risk-free part into the risky one. 6% multiplies beta by the risk-free rate. The order of operations here is the meaning of the model: the risk-free rate is the floor, the premium is where risk gets paid.',
    },
    source: {
      url: 'https://aswathdamodaran.substack.com/p/country-risk-2025-the-story-behind',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q364',
    formulaId: 'wacc',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, WACC bằng bao nhiêu?',
      en: 'With the figures below, what is the WACC?',
    },
    facts: [
      {
        label: { vi: 'Vốn chủ sở hữu', en: 'Equity' },
        value: { vi: '600 tỷ ₫', en: '600 billion ₫' },
      },
      { label: { vi: 'Nợ vay', en: 'Debt' }, value: { vi: '400 tỷ ₫', en: '400 billion ₫' } },
      { label: { vi: 'Chi phí vốn chủ', en: 'Cost of equity' }, value: { vi: '15%', en: '15%' } },
      {
        label: { vi: 'Chi phí nợ trước thuế', en: 'Pre-tax cost of debt' },
        value: { vi: '10%', en: '10%' },
      },
      { label: { vi: 'Thuế suất', en: 'Tax rate' }, value: { vi: '20%', en: '20%' } },
    ],
    choices: {
      a: { vi: '12,2%', en: '12.2%' },
      b: { vi: '13,0%', en: '13.0%' },
      c: { vi: '12,5%', en: '12.5%' },
      d: { vi: '25,0%', en: '25.0%' },
    },
    answer: 'a',
    verify: {
      inputs: { equity: 600, debt: 400, costEquity: 15, costDebt: 10, taxRate: 20 },
      expected: 12.2,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Tỷ trọng vốn chủ là 600 trên 1.000 tức 60%, nợ là 40%. Phần vốn chủ đóng góp 0,6 nhân 15 bằng 9,0. Phần nợ phải nhân thêm (1 trừ thuế suất) vì lãi vay được trừ khi tính thuế: 0,4 nhân 10 nhân 0,8 bằng 3,2. Cộng lại ra 12,2%. Đáp án 13,0% là quên lá chắn thuế. 12,5% là bình quân SỐ HỌC của 15 và 10, tức bỏ qua tỷ trọng. 25,0% là cộng thẳng hai chi phí vốn.',
      en: 'The equity weight is 600 over 1,000, that is 60%, and debt is 40%. Equity contributes 0.6 times 15, which is 9.0. Debt must also be multiplied by (1 minus the tax rate) because interest is deductible: 0.4 times 10 times 0.8 is 3.2. Together that is 12.2%. The 13.0% answer drops the tax shield. 12.5% is the plain ARITHMETIC average of 15 and 10, ignoring the weights. 25.0% simply adds the two costs.',
    },
    source: {
      url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/country/CostofCapitalShort2022.pdf',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q365',
    formulaId: 'fcff',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, FCFF bằng bao nhiêu?',
      en: 'With the figures below, what is FCFF?',
    },
    facts: [
      { label: { vi: 'EBIT', en: 'EBIT' }, value: { vi: '600 tỷ ₫', en: '600 billion ₫' } },
      { label: { vi: 'Thuế suất', en: 'Tax rate' }, value: { vi: '20%', en: '20%' } },
      {
        label: { vi: 'Khấu hao', en: 'Depreciation' },
        value: { vi: '150 tỷ ₫', en: '150 billion ₫' },
      },
      {
        label: { vi: 'Chi đầu tư tài sản cố định', en: 'Capital expenditure' },
        value: { vi: '200 tỷ ₫', en: '200 billion ₫' },
      },
      {
        label: { vi: 'Thay đổi vốn lưu động', en: 'Change in working capital' },
        value: { vi: '50 tỷ ₫', en: '50 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '380 tỷ ₫', en: '380 billion ₫' },
      b: { vi: '430 tỷ ₫', en: '430 billion ₫' },
      c: { vi: '500 tỷ ₫', en: '500 billion ₫' },
      d: { vi: '80 tỷ ₫', en: '80 billion ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { ebit: 600, taxRate: 20, depreciation: 150, capex: 200, nwcChange: 50 },
      expected: 380,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Bốn bước: EBIT sau thuế là 600 nhân 0,8 bằng 480; CỘNG khấu hao 150 vì đó là chi phí không chi tiền; TRỪ chi đầu tư 200 và TRỪ thay đổi vốn lưu động 50. Kết quả 380 tỷ ₫. Đáp án 430 tỷ là bỏ sót thay đổi vốn lưu động. 500 tỷ là quên trừ thuế trên EBIT. 80 tỷ là trừ khấu hao thay vì cộng ngược vào, đúng lỗi mà Damodaran gọi cộng khấu hao là "điểm dừng giữa đường" đã cảnh báo.',
      en: 'Four steps: after-tax EBIT is 600 times 0.8, that is 480; ADD back depreciation of 150 because it is a non-cash charge; SUBTRACT capital expenditure of 200 and SUBTRACT the working-capital change of 50. The result is 380 billion ₫. The 430 answer drops the working-capital change. 500 forgets to tax EBIT. 80 subtracts depreciation instead of adding it back, the error behind Damodaran warning that adding depreciation back is only an intermediate stop.',
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2022/10/earnings-and-cash-flows-primer-on-free.html',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q366',
    formulaId: 'fcfe',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, FCFE bằng bao nhiêu?',
      en: 'With the figures below, what is FCFE?',
    },
    facts: [
      { label: { vi: 'FCFF', en: 'FCFF' }, value: { vi: '380 tỷ ₫', en: '380 billion ₫' } },
      {
        label: { vi: 'Chi phí lãi vay', en: 'Interest expense' },
        value: { vi: '50 tỷ ₫', en: '50 billion ₫' },
      },
      { label: { vi: 'Thuế suất', en: 'Tax rate' }, value: { vi: '20%', en: '20%' } },
      {
        label: { vi: 'Vay ròng trong kỳ', en: 'Net new borrowing' },
        value: { vi: '30 tỷ ₫', en: '30 billion ₫' },
      },
    ],
    choices: {
      a: { vi: '370 tỷ ₫', en: '370 billion ₫' },
      b: { vi: '360 tỷ ₫', en: '360 billion ₫' },
      c: { vi: '310 tỷ ₫', en: '310 billion ₫' },
      d: { vi: '450 tỷ ₫', en: '450 billion ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { fcff: 380, interest: 50, taxRate: 20, netBorrowing: 30 },
      expected: 370,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Đi từ dòng tiền của CẢ doanh nghiệp về dòng tiền của riêng CỔ ĐÔNG: trừ lãi vay SAU THUẾ, tức 50 nhân 0,8 bằng 40, rồi cộng phần vay ròng 30 vì đó là tiền chủ nợ mới bơm vào. 380 trừ 40 cộng 30 bằng 370 tỷ ₫. Đáp án 360 tỷ là trừ nguyên 50, quên lá chắn thuế của lãi vay. 310 tỷ là trừ cả vay ròng thay vì cộng. 450 tỷ là cộng lãi vay thay vì trừ.',
      en: 'Move from the cash flow of the WHOLE firm to the cash flow of the SHAREHOLDERS: subtract after-tax interest, 50 times 0.8 which is 40, then add net new borrowing of 30 because that is fresh money from lenders. 380 minus 40 plus 30 is 370 billion ₫. The 360 answer subtracts the full 50, forgetting the tax shield on interest. 310 subtracts net borrowing instead of adding it. 450 adds interest instead of subtracting it.',
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2022/10/earnings-and-cash-flows-primer-on-free.html',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q367',
    formulaId: 'gia-tri-noi-tai-fcff',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, giá trị nội tại mỗi cổ phiếu bằng bao nhiêu?',
      en: 'With the figures below, what is the intrinsic value per share?',
    },
    facts: [
      {
        label: { vi: 'FCFF năm gần nhất', en: 'Latest FCFF' },
        value: { vi: '380 tỷ ₫', en: '380 billion ₫' },
      },
      {
        label: { vi: 'Tăng trưởng vĩnh viễn (g)', en: 'Perpetual growth (g)' },
        value: { vi: '4%/năm', en: '4% a year' },
      },
      { label: { vi: 'WACC', en: 'WACC' }, value: { vi: '12%', en: '12%' } },
      { label: { vi: 'Nợ ròng', en: 'Net debt' }, value: { vi: '400 tỷ ₫', en: '400 billion ₫' } },
      {
        label: { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
        value: { vi: '150 triệu CP', en: '150 million shares' },
      },
    ],
    choices: {
      a: { vi: '30.267 ₫', en: '30,267 ₫' },
      b: { vi: '32.933 ₫', en: '32,933 ₫' },
      c: { vi: '29.000 ₫', en: '29,000 ₫' },
      d: { vi: '30,27 ₫', en: '30.27 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { fcff: 380, growth: 4, wacc: 12, netDebt: 400, shares: 150 },
      expected: 30266.67,
      tolerance: 1,
    },
    explain: {
      vi: 'Ba bước. Giá trị doanh nghiệp bằng 380 nhân 1,04 chia cho (0,12 trừ 0,04), tức 395,2 chia 0,08 bằng 4.940 tỷ ₫. Trừ nợ ròng 400 còn 4.540 tỷ ₫ thuộc về cổ đông. Chia cho 150 triệu cổ phiếu, nhớ đổi tỷ đồng sang đồng, ra 30.267 ₫. Đáp án 32.933 ₫ là quên trừ nợ ròng, tức định giá cả doanh nghiệp rồi gán hết cho cổ đông. 29.000 ₫ là quên nhân FCFF với (1 + g). 30,27 ₫ là quên đổi đơn vị, chia thẳng tỷ đồng cho triệu cổ phiếu.',
      en: 'Three steps. Enterprise value is 380 times 1.04 divided by (0.12 minus 0.04), that is 395.2 over 0.08, giving 4,940 billion ₫. Subtract net debt of 400 and 4,540 billion ₫ belongs to shareholders. Divide by 150 million shares, remembering to convert billions into dong, for 30,267 ₫. The 32,933 ₫ answer forgets net debt, valuing the whole firm and handing it all to shareholders. 29,000 ₫ forgets the (1 + g) factor on FCFF. 30.27 ₫ skips the unit conversion, dividing billions straight by millions of shares.',
    },
    source: {
      url: 'https://aswathdamodaran.substack.com/p/myth-55-the-terminal-value-ate-my-16-11-30',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q368',
    formulaId: 'gia-tri-hien-tai',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, giá trị hiện tại của khoản tiền tương lai bằng bao nhiêu?',
      en: 'With the figures below, what is the present value of that future amount?',
    },
    facts: [
      {
        label: { vi: 'Số tiền nhận được trong tương lai', en: 'Future amount' },
        value: { vi: '1.331.000.000 ₫', en: '1,331,000,000 ₫' },
      },
      {
        label: { vi: 'Suất chiết khấu', en: 'Discount rate' },
        value: { vi: '10%/năm', en: '10% a year' },
      },
      { label: { vi: 'Số năm', en: 'Years' }, value: { vi: '3 năm', en: '3 years' } },
    ],
    choices: {
      a: { vi: '1.000.000.000 ₫', en: '1,000,000,000 ₫' },
      b: { vi: '1.023.846.154 ₫', en: '1,023,846,154 ₫' },
      c: { vi: '931.700.000 ₫', en: '931,700,000 ₫' },
      d: { vi: '1.771.561.000 ₫', en: '1,771,561,000 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { futureValue: 1331000000, rate: 10, years: 3 },
      expected: 1000000000,
      tolerance: 1,
    },
    explain: {
      vi: 'Chiết khấu là CHIA cho (1 + r) mũ số năm: 1,1 mũ 3 bằng 1,331, và 1.331.000.000 chia 1,331 ra đúng 1.000.000.000 ₫. Đáp án 1.023.846.154 ₫ là chiết khấu theo lãi ĐƠN, chia cho 1,3 thay vì 1,331. 931.700.000 ₫ là trừ thẳng 30% khỏi số tiền tương lai, một phép trừ chứ không phải phép chiết khấu. 1.771.561.000 ₫ là nhân thay vì chia, tức đi ngược chiều thời gian.',
      en: 'Discounting means DIVIDING by (1 + r) to the power of the number of years: 1.1 cubed is 1.331, and 1,331,000,000 divided by 1.331 is exactly 1,000,000,000 ₫. The 1,023,846,154 ₫ answer discounts at SIMPLE interest, dividing by 1.3 instead of 1.331. 931,700,000 ₫ subtracts 30% from the future amount, a subtraction rather than discounting. 1,771,561,000 ₫ multiplies instead of dividing, running time the wrong way.',
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2015/02/dcf-myth-1-if-you-have-ddiscount-rate.html',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q369',
    formulaId: 'gia-tri-tuong-lai',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, giá trị tương lai của khoản tiền hiện tại bằng bao nhiêu?',
      en: 'With the figures below, what is the future value of that amount?',
    },
    facts: [
      {
        label: { vi: 'Số tiền hiện tại', en: 'Present amount' },
        value: { vi: '100.000.000 ₫', en: '100,000,000 ₫' },
      },
      {
        label: { vi: 'Lãi suất', en: 'Interest rate' },
        value: { vi: '10%/năm', en: '10% a year' },
      },
      { label: { vi: 'Số năm', en: 'Years' }, value: { vi: '3 năm', en: '3 years' } },
    ],
    choices: {
      a: { vi: '133.100.000 ₫', en: '133,100,000 ₫' },
      b: { vi: '130.000.000 ₫', en: '130,000,000 ₫' },
      c: { vi: '110.000.000 ₫', en: '110,000,000 ₫' },
      d: { vi: '75.131.480 ₫', en: '75,131,480 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { presentValue: 100000000, rate: 10, years: 3 },
      expected: 133100000,
      tolerance: 1,
    },
    explain: {
      vi: '100.000.000 nhân 1,1 mũ 3, tức nhân 1,331, ra 133.100.000 ₫. Đáp án 130.000.000 ₫ là lãi ĐƠN: cộng 10% ba lần trên vốn gốc mà không cho lãi sinh lãi, và khoảng cách 3.100.000 ₫ giữa hai con số chính là phần lãi kép. 110.000.000 ₫ là mới tính một năm. 75.131.480 ₫ là chia thay vì nhân, tức tính ngược về hiện tại.',
      en: '100,000,000 times 1.1 cubed, that is times 1.331, gives 133,100,000 ₫. The 130,000,000 ₫ answer uses SIMPLE interest: 10% added three times on the original capital, with no interest on interest, and the 3,100,000 ₫ gap between the two is precisely the compounding. 110,000,000 ₫ covers only one year. 75,131,480 ₫ divides instead of multiplying, running back to the present.',
    },
    source: {
      url: 'https://bizuni.vn/dau-tu/cagr-toc-do-tang-truong-binh-quan-kep-ty-suat-loi-nhuan-binh-quan-tai-chinh-geometric-mean/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q370',
    formulaId: 'bien-an-toan',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, biên an toàn bằng bao nhiêu?',
      en: 'With the figures below, what is the margin of safety?',
    },
    facts: [
      {
        label: { vi: 'Giá trị nội tại ước tính', en: 'Estimated intrinsic value' },
        value: { vi: '50.000 ₫', en: '50,000 ₫' },
      },
      {
        label: { vi: 'Giá thị trường', en: 'Market price' },
        value: { vi: '35.000 ₫', en: '35,000 ₫' },
      },
    ],
    choices: {
      a: { vi: '30%', en: '30%' },
      b: { vi: '42,86%', en: '42.86%' },
      c: { vi: '70%', en: '70%' },
      d: { vi: '15.000 ₫', en: '15,000 ₫' },
    },
    answer: 'a',
    verify: { inputs: { intrinsic: 50000, price: 35000 }, expected: 30, tolerance: 0.01 },
    explain: {
      vi: 'Mẫu số là GIÁ TRỊ NỘI TẠI, không phải giá mua: (50.000 trừ 35.000) chia 50.000 bằng 0,3, tức 30%. Đáp án 42,86% là chia phần chênh cho giá thị trường, và nó luôn lớn hơn con số đúng nên đọc nhầm sẽ thấy mình an toàn hơn thực tế. 70% là tỷ lệ giá trên giá trị nội tại, tức phần bù của đáp án đúng. 15.000 ₫ là dừng ở phần chênh, chưa phải một biên.',
      en: 'The denominator is INTRINSIC VALUE, not the purchase price: (50,000 minus 35,000) over 50,000 is 0.3, that is 30%. The 42.86% answer divides the gap by the market price, and it always comes out larger than the right one, so reading it makes the position look safer than it is. 70% is price over intrinsic value, the complement of the right answer. 15,000 ₫ stops at the gap, which is not yet a margin.',
    },
    source: {
      url: 'https://aswathdamodaran.blogspot.com/2016/05/dcf-myth-31-margin-of-safety-tool-for.html',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q371',
    formulaId: 'phi-giao-dich-mua',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, phí giao dịch của lệnh mua bằng bao nhiêu?',
      en: 'With the figures below, what is the trading fee on this buy order?',
    },
    facts: [
      {
        label: { vi: 'Khối lượng mua', en: 'Quantity bought' },
        value: { vi: '1.000 CP', en: '1,000 shares' },
      },
      { label: { vi: 'Giá mua', en: 'Buy price' }, value: { vi: '50.000 ₫', en: '50,000 ₫' } },
    ],
    choices: {
      a: { vi: '75.000 ₫', en: '75,000 ₫' },
      b: { vi: '50.000 ₫', en: '50,000 ₫' },
      c: { vi: '7.500 ₫', en: '7,500 ₫' },
      d: { vi: '750.000 ₫', en: '750,000 ₫' },
    },
    answer: 'a',
    verify: { inputs: { quantity: 1000, buyPrice: 50000 }, expected: 75000, tolerance: 1 },
    explain: {
      vi: 'Giá trị lệnh là 1.000 nhân 50.000 bằng 50.000.000 ₫, nhân với biểu phí 0,15% ra 75.000 ₫. Con số 0,15% lấy từ bảng hằng số của sản phẩm, in ngay dưới khối Số liệu trên màn, nên không cần nhớ thuộc lòng. Đáp án 50.000 ₫ là dùng nhầm mức 0,1%, vốn là thuế chuyển nhượng khi BÁN chứ không phải phí mua. 7.500 ₫ và 750.000 ₫ đều là lệch một chữ số thập phân, 0,015% và 1,5%.',
      en: 'The order is 1,000 times 50,000, that is 50,000,000 ₫, times the 0.15% fee schedule gives 75,000 ₫. The 0.15% comes from the product constants table, printed right under the inputs block on screen, so it does not have to be memorised. The 50,000 ₫ answer uses 0.1%, which is the transfer tax on SELLING, not a buying fee. 7,500 ₫ and 750,000 ₫ are both a decimal place out, 0.015% and 1.5%.',
    },
    source: {
      url: 'https://stockkisvn.vn/phi-va-thue-giao-dich-chung-khoan/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q372',
    formulaId: 'phi-giao-dich-ban',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, PHÍ giao dịch của lệnh bán bằng bao nhiêu? (chưa tính thuế)',
      en: 'With the figures below, what is the trading FEE on this sell order? (tax excluded)',
    },
    facts: [
      {
        label: { vi: 'Khối lượng bán', en: 'Quantity sold' },
        value: { vi: '1.000 CP', en: '1,000 shares' },
      },
      { label: { vi: 'Giá bán', en: 'Sell price' }, value: { vi: '60.000 ₫', en: '60,000 ₫' } },
    ],
    choices: {
      a: { vi: '90.000 ₫', en: '90,000 ₫' },
      b: { vi: '60.000 ₫', en: '60,000 ₫' },
      c: { vi: '150.000 ₫', en: '150,000 ₫' },
      d: { vi: '9.000 ₫', en: '9,000 ₫' },
    },
    answer: 'a',
    verify: { inputs: { quantity: 1000, sellPrice: 60000 }, expected: 90000, tolerance: 1 },
    explain: {
      vi: 'Giá trị lệnh 1.000 nhân 60.000 bằng 60.000.000 ₫, nhân 0,15% ra 90.000 ₫. Phí bán tính trên GIÁ BÁN chứ không trên giá mua, nên một lệnh lãi sẽ chịu phí bán cao hơn phí mua. Đáp án 60.000 ₫ là thuế chuyển nhượng 0,1%, một khoản khác đi kèm nhưng không phải phí. 150.000 ₫ là cộng gộp cả phí và thuế, đúng tổng chi phí bán nhưng câu hỏi chỉ hỏi phí. 9.000 ₫ lệch một chữ số thập phân.',
      en: 'The order is 1,000 times 60,000, that is 60,000,000 ₫, times 0.15% gives 90,000 ₫. The selling fee is charged on the SALE price, not the purchase price, so a profitable trade pays more on the way out than on the way in. The 60,000 ₫ answer is the 0.1% transfer tax, a separate charge that travels with it but is not a fee. 150,000 ₫ adds fee and tax together, the correct total selling cost but not what was asked. 9,000 ₫ is a decimal place out.',
    },
    source: {
      url: 'https://vnexpress.net/phi-giao-dich-tai-cac-cong-ty-chung-khoan-lon-4304921.html',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q373',
    formulaId: 'thue-chuyen-nhuong',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bạn mua 1.000 cổ phiếu giá 50.000 ₫ và bán ra ở giá 60.000 ₫. Thuế chuyển nhượng phải nộp là bao nhiêu?',
      en: 'You bought 1,000 shares at 50,000 ₫ and sold at 60,000 ₫. How much transfer tax is due?',
    },
    facts: [
      {
        label: { vi: 'Khối lượng bán', en: 'Quantity sold' },
        value: { vi: '1.000 CP', en: '1,000 shares' },
      },
      { label: { vi: 'Giá bán', en: 'Sell price' }, value: { vi: '60.000 ₫', en: '60,000 ₫' } },
      {
        label: { vi: 'Lãi gộp của lệnh', en: 'Gross profit on the trade' },
        value: { vi: '10.000.000 ₫', en: '10,000,000 ₫' },
      },
    ],
    choices: {
      a: { vi: '60.000 ₫', en: '60,000 ₫' },
      b: { vi: '2.000.000 ₫', en: '2,000,000 ₫' },
      c: { vi: '90.000 ₫', en: '90,000 ₫' },
      d: { vi: '0 ₫', en: '0 ₫' },
    },
    answer: 'a',
    verify: { inputs: { quantity: 1000, sellPrice: 60000 }, expected: 60000, tolerance: 1 },
    explain: {
      vi: 'Thuế tính trên GIÁ TRỊ BÁN, không tính trên lãi: 60.000.000 nhân 0,1% bằng 60.000 ₫. Con số lãi 10.000.000 ₫ trong đề bài là số liệu thừa cố ý, vì đây đúng là chỗ hay nhầm nhất. Đáp án 2.000.000 ₫ là đánh 20% trên lãi, cách làm của một số nước khác chứ không phải quy định hiện hành ở Việt Nam. 90.000 ₫ là dùng nhầm mức phí 0,15%. 0 ₫ là tin rằng giao dịch nhỏ hay lệnh lỗ thì được miễn, trong khi không có ngưỡng miễn nào.',
      en: 'The tax is charged on SALE VALUE, not on profit: 60,000,000 times 0.1% is 60,000 ₫. The 10,000,000 ₫ profit in the brief is deliberately redundant, because that is exactly where the mistake happens. The 2,000,000 ₫ answer taxes the profit at 20%, which is how some other countries do it but not the rule in force in Vietnam. 90,000 ₫ uses the 0.15% fee rate. 0 ₫ assumes small or loss-making trades are exempt, and there is no exemption threshold.',
    },
    source: {
      url: 'https://thuvienphapluat.vn/ma-so-thue/phap-luat-thue/cat-lo-chung-khoan-thi-co-phai-dong-01-thue-tncn-khong-214868.html',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q374',
    formulaId: 'thue-co-tuc',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, thuế trên cổ tức tiền mặt phải nộp là bao nhiêu?',
      en: 'With the figures below, how much tax is due on the cash dividend?',
    },
    facts: [
      {
        label: { vi: 'Số cổ phiếu nắm giữ', en: 'Shares held' },
        value: { vi: '1.000 CP', en: '1,000 shares' },
      },
      {
        label: { vi: 'Cổ tức tiền mặt mỗi cổ phiếu', en: 'Cash dividend per share' },
        value: { vi: '3.000 ₫', en: '3,000 ₫' },
      },
    ],
    choices: {
      a: { vi: '150.000 ₫', en: '150,000 ₫' },
      b: { vi: '300.000 ₫', en: '300,000 ₫' },
      c: { vi: '600.000 ₫', en: '600,000 ₫' },
      d: { vi: '0 ₫', en: '0 ₫' },
    },
    answer: 'a',
    verify: { inputs: { quantity: 1000, dividendPerShare: 3000 }, expected: 150000, tolerance: 1 },
    explain: {
      vi: 'Cổ tức nhận được là 1.000 nhân 3.000 bằng 3.000.000 ₫, nhân thuế suất 5% ra 150.000 ₫, và khoản này bị khấu trừ ngay khi chia nên tiền về tài khoản đã là số sau thuế. Đáp án 300.000 ₫ dùng 10% và 600.000 ₫ dùng 20%, hai mức thuộc về các loại thu nhập khác. 0 ₫ là lập luận "thuế chồng thuế": doanh nghiệp đã nộp thuế thu nhập doanh nghiệp rồi nên cổ đông được miễn. Đó là một quan điểm phản biện, không phải căn cứ miễn trừ.',
      en: 'The dividend received is 1,000 times 3,000, that is 3,000,000 ₫, times the 5% rate gives 150,000 ₫, and it is withheld at payment so the cash landing in the account is already net. The 300,000 ₫ answer uses 10% and 600,000 ₫ uses 20%, rates that belong to other kinds of income. 0 ₫ is the double-taxation argument: the company already paid corporate tax so the shareholder should be exempt. That is an objection, not a statutory exemption.',
    },
    source: {
      url: 'https://vneconomy.vn/thue-co-tuc-bang-co-phieu-nha-dau-tu-thiet-cong-ty-chung-khoan-roi-viec.htm',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q375',
    formulaId: 'phi-luu-ky',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bạn nắm giữ 1.000 cổ phiếu suốt 12 tháng và không mua bán gì thêm. Tổng phí lưu ký phải trả là bao nhiêu?',
      en: 'You hold 1,000 shares for 12 months and place no further trades. What is the total depository fee?',
    },
    facts: [
      {
        label: { vi: 'Số cổ phiếu lưu ký', en: 'Shares in custody' },
        value: { vi: '1.000 CP', en: '1,000 shares' },
      },
      {
        label: { vi: 'Thời gian nắm giữ', en: 'Holding period' },
        value: { vi: '12 tháng', en: '12 months' },
      },
    ],
    choices: {
      a: { vi: '3.240 ₫', en: '3,240 ₫' },
      b: { vi: '270 ₫', en: '270 ₫' },
      c: { vi: '3.240.000 ₫', en: '3,240,000 ₫' },
      d: { vi: '0 ₫', en: '0 ₫' },
    },
    answer: 'a',
    verify: { inputs: { quantity: 1000, months: 12 }, expected: 3240, tolerance: 1 },
    explain: {
      vi: 'Phí lưu ký tính theo SỐ CỔ PHIẾU và theo THÁNG, không tính theo giá trị: 1.000 nhân 0,27 ₫ mỗi tháng bằng 270 ₫, nhân 12 tháng ra 3.240 ₫. Đáp án 270 ₫ là quên nhân số tháng. 3.240.000 ₫ là nhầm 0,27 ₫ mỗi cổ phiếu thành 0,27% trên giá trị. 0 ₫ là tin rằng tháng không giao dịch thì không bị trừ, trong khi phí này trả cho việc GIỮ chứng khoán, tách hẳn khỏi phí giao dịch.',
      en: 'The depository fee is charged per SHARE and per MONTH, not on value: 1,000 times 0.27 ₫ a month is 270 ₫, times 12 months gives 3,240 ₫. The 270 ₫ answer forgets to multiply by the months. 3,240,000 ₫ mistakes 0.27 ₫ per share for 0.27% of value. 0 ₫ assumes a month without trades is free, whereas this fee pays for HOLDING the securities, entirely separate from trading fees.',
    },
    source: {
      url: 'https://thuvienchungkhoan.vn/phi-luu-ky-chung-khoan/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q376',
    formulaId: 'gia-hoa-von',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, phải bán ở giá nào thì vừa đúng hoà vốn?',
      en: 'With the figures below, at what price does the trade exactly break even?',
    },
    facts: [
      {
        label: { vi: 'Khối lượng', en: 'Quantity' },
        value: { vi: '1.000 CP', en: '1,000 shares' },
      },
      { label: { vi: 'Giá mua', en: 'Buy price' }, value: { vi: '50.000 ₫', en: '50,000 ₫' } },
      {
        label: { vi: 'Thời gian nắm giữ', en: 'Holding period' },
        value: { vi: '12 tháng', en: '12 months' },
      },
    ],
    choices: {
      a: { vi: '50.203,75 ₫', en: '50,203.75 ₫' },
      b: { vi: '50.000 ₫', en: '50,000 ₫' },
      c: { vi: '50.078,24 ₫', en: '50,078.24 ₫' },
      d: { vi: '50.228,24 ₫', en: '50,228.24 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { quantity: 1000, months: 12, buyPrice: 50000 },
      expected: 50203.75,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Giá hoà vốn phải gánh cả bốn khoản: phí mua 75.000 ₫, phí lưu ký 12 tháng 3.240 ₫, rồi phí bán 0,15% và thuế bán 0,1% — hai khoản sau tính trên chính GIÁ BÁN chưa biết, nên phải giải ngược: vốn đã bỏ ra 50.078.240 ₫ chia cho (1 trừ 0,0025) bằng 50.203.749 ₫, tức 50.203,75 ₫ mỗi cổ phiếu. Đáp án 50.000 ₫ là bỏ hết chi phí. 50.078,24 ₫ chỉ cộng phí mua và phí lưu ký, quên phí và thuế lúc bán. 50.228,24 ₫ cộng thẳng tổng chi phí vào giá mua, tức tính phí bán trên giá MUA thay vì trên giá bán.',
      en: 'The break-even price has to carry all four charges: a 75,000 ₫ buying fee, 3,240 ₫ of depository fees over 12 months, then the 0.15% selling fee and the 0.1% sale tax, both charged on the SALE price that is still unknown, so it has to be solved backwards: the 50,078,240 ₫ already committed divided by (1 minus 0.0025) gives 50,203,749 ₫, that is 50,203.75 ₫ per share. The 50,000 ₫ answer ignores costs entirely. 50,078.24 ₫ covers only the buying fee and custody, forgetting the selling charges. 50,228.24 ₫ adds total costs onto the purchase price, charging the selling fee against the BUY price instead of the sale price.',
    },
    source: {
      url: 'https://kisvn.vn/hoc-dau-tu/thue-ban-co-phieu',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q377',
    formulaId: 'loi-nhuan-rong',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, lợi nhuận ròng sau phí và thuế của lệnh này bằng bao nhiêu?',
      en: 'With the figures below, what is the net profit on this trade after fees and tax?',
    },
    facts: [
      {
        label: { vi: 'Khối lượng', en: 'Quantity' },
        value: { vi: '1.000 CP', en: '1,000 shares' },
      },
      { label: { vi: 'Giá mua', en: 'Buy price' }, value: { vi: '50.000 ₫', en: '50,000 ₫' } },
      { label: { vi: 'Giá bán', en: 'Sell price' }, value: { vi: '60.000 ₫', en: '60,000 ₫' } },
      {
        label: { vi: 'Thời gian nắm giữ', en: 'Holding period' },
        value: { vi: '12 tháng', en: '12 months' },
      },
    ],
    choices: {
      a: { vi: '9.771.760 ₫', en: '9,771,760 ₫' },
      b: { vi: '10.000.000 ₫', en: '10,000,000 ₫' },
      c: { vi: '9.835.000 ₫', en: '9,835,000 ₫' },
      d: { vi: '9.775.000 ₫', en: '9,775,000 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { quantity: 1000, months: 12, buyPrice: 50000, sellPrice: 60000 },
      expected: 9771760,
      tolerance: 1,
    },
    explain: {
      vi: 'Lãi gộp là 1.000 nhân (60.000 trừ 50.000) bằng 10.000.000 ₫. Trừ đủ bốn khoản: phí mua 75.000, phí bán 90.000, thuế bán 60.000, phí lưu ký 12 tháng 3.240 — tổng 228.240 ₫, còn lại 9.771.760 ₫. Đáp án 10.000.000 ₫ là lãi gộp, chưa trừ gì. 9.835.000 ₫ là chỉ trừ hai khoản phí giao dịch, quên thuế bán và phí lưu ký. 9.775.000 ₫ là quên riêng phí lưu ký, khoản nhỏ nhất nên cũng hay rơi nhất.',
      en: 'Gross profit is 1,000 times (60,000 minus 50,000), that is 10,000,000 ₫. Deduct all four charges: 75,000 buying fee, 90,000 selling fee, 60,000 sale tax and 3,240 of depository fees over 12 months, 228,240 ₫ in total, leaving 9,771,760 ₫. The 10,000,000 ₫ answer is gross profit before anything. 9,835,000 ₫ deducts the two trading fees only, missing the sale tax and custody. 9,775,000 ₫ drops the depository fee alone, the smallest item and therefore the one most often forgotten.',
    },
    source: {
      url: 'https://vietstock.vn/2024/11/kien-nghi-cat-lo-chung-khoan-khong-can-dong-thue-143-1247891.htm',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q378',
    formulaId: 'roi-rong',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Vẫn lệnh mua 1.000 cổ phiếu giá 50.000 ₫, bán ở 60.000 ₫ sau 12 tháng. ROI ròng sau phí và thuế bằng bao nhiêu?',
      en: 'Same trade: 1,000 shares bought at 50,000 ₫ and sold at 60,000 ₫ after 12 months. What is the net ROI after fees and tax?',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận ròng', en: 'Net profit' },
        value: { vi: '9.771.760 ₫', en: '9,771,760 ₫' },
      },
      {
        label: {
          vi: 'Vốn đã bỏ ra (gồm phí mua và phí lưu ký)',
          en: 'Capital committed (buying fee and custody included)',
        },
        value: { vi: '50.078.240 ₫', en: '50,078,240 ₫' },
      },
    ],
    choices: {
      a: { vi: '19,51%', en: '19.51%' },
      b: { vi: '20,00%', en: '20.00%' },
      c: { vi: '19,54%', en: '19.54%' },
      d: { vi: '16,67%', en: '16.67%' },
    },
    answer: 'a',
    verify: {
      inputs: { quantity: 1000, months: 12, buyPrice: 50000, sellPrice: 60000 },
      expected: 19.512986,
      tolerance: 0.01,
    },
    explain: {
      vi: '9.771.760 chia 50.078.240 bằng 0,1951, tức 19,51%. Cả hai vế đều phải "ròng": tử số là lãi sau khi trừ hết phí và thuế, mẫu số là vốn thực sự bỏ ra, tức giá mua CỘNG phí mua và phí lưu ký. Đáp án 20,00% là lãi gộp chia vốn gốc, bỏ qua toàn bộ chi phí ở cả hai vế. 19,54% là lấy đúng tử số nhưng mẫu số chỉ có 50.000.000, quên phần phí đã bỏ ra. 16,67% là chia cho giá bán thay vì cho vốn bỏ ra.',
      en: '9,771,760 divided by 50,078,240 is 0.1951, that is 19.51%. Both sides have to be net: the numerator is profit after every fee and tax, the denominator is the capital actually committed, the purchase PLUS the buying fee and custody. The 20.00% answer divides gross profit by the raw purchase, ignoring costs on both sides. 19.54% takes the right numerator but a denominator of only 50,000,000, forgetting the fees already paid. 16.67% divides by the sale value instead of the capital committed.',
    },
    source: {
      url: 'https://www.vfs.com.vn/chi-phi-giao-dich-chung-khoan',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q379',
    formulaId: 'roi',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, ROI của khoản đầu tư bằng bao nhiêu?',
      en: 'With the figures below, what is the ROI on this investment?',
    },
    facts: [
      {
        label: { vi: 'Vốn bỏ ra', en: 'Capital invested' },
        value: { vi: '100.000.000 ₫', en: '100,000,000 ₫' },
      },
      {
        label: { vi: 'Giá trị hiện tại', en: 'Current value' },
        value: { vi: '130.000.000 ₫', en: '130,000,000 ₫' },
      },
    ],
    choices: {
      a: { vi: '30%', en: '30%' },
      b: { vi: '23,08%', en: '23.08%' },
      c: { vi: '130%', en: '130%' },
      d: { vi: '30.000.000 ₫', en: '30,000,000 ₫' },
    },
    answer: 'a',
    verify: { inputs: { cost: 100000000, current: 130000000 }, expected: 30, tolerance: 0.01 },
    explain: {
      vi: 'Phần lãi là 130 triệu trừ 100 triệu bằng 30 triệu, chia cho VỐN BỎ RA 100 triệu, ra 30%. Đáp án 23,08% là chia cho giá trị hiện tại. 130% là tỷ lệ giá trị hiện tại trên vốn, tức quên trừ 1 nên gộp cả phần vốn gốc vào tỷ suất. 30.000.000 ₫ là dừng ở phần lãi. Lưu ý ROI không nói gì về THỜI GIAN: 30% trong 5 ngày và 30% trong 5 năm viết ra giống hệt nhau.',
      en: 'The gain is 130 million minus 100 million, that is 30 million, divided by the CAPITAL INVESTED of 100 million, giving 30%. The 23.08% answer divides by the current value. 130% is current value over cost, forgetting to subtract 1 and so folding the original capital into the return. 30,000,000 ₫ stops at the gain. Note that ROI says nothing about TIME: 30% over five days and 30% over five years are written identically.',
    },
    source: {
      url: 'https://corporatefinanceinstitute.com/resources/accounting/return-on-investment-roi-formula',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q380',
    formulaId: 'hpr',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, lợi suất kỳ nắm giữ (HPR) bằng bao nhiêu?',
      en: 'With the figures below, what is the holding period return (HPR)?',
    },
    facts: [
      {
        label: { vi: 'Giá đầu kỳ', en: 'Price at start' },
        value: { vi: '50.000 ₫', en: '50,000 ₫' },
      },
      {
        label: { vi: 'Giá cuối kỳ', en: 'Price at end' },
        value: { vi: '60.000 ₫', en: '60,000 ₫' },
      },
      {
        label: { vi: 'Cổ tức nhận trong kỳ', en: 'Dividend received' },
        value: { vi: '2.000 ₫/CP', en: '2,000 ₫ a share' },
      },
    ],
    choices: {
      a: { vi: '24%', en: '24%' },
      b: { vi: '20%', en: '20%' },
      c: { vi: '4%', en: '4%' },
      d: { vi: '12.000 ₫', en: '12,000 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { startPrice: 50000, endPrice: 60000, dividend: 2000 },
      expected: 24,
      tolerance: 0.01,
    },
    explain: {
      vi: 'HPR cộng CẢ HAI nguồn lợi ích: chênh giá 10.000 ₫ và cổ tức 2.000 ₫, tổng 12.000 ₫, chia cho giá đầu kỳ 50.000 ₫ ra 24%. Đáp án 20% là quên cổ tức, và đó là lỗi khiến mọi so sánh với cổ phiếu trả cổ tức cao bị lệch xuống. 4% là chỉ tính riêng cổ tức, tức tỷ suất cổ tức. 12.000 ₫ là dừng ở tử số, chưa chia cho vốn ban đầu.',
      en: 'HPR adds BOTH sources of return: the 10,000 ₫ price gain and the 2,000 ₫ dividend, 12,000 ₫ together, divided by the 50,000 ₫ starting price gives 24%. The 20% answer drops the dividend, the error that biases every comparison against high-dividend stocks. 4% counts the dividend alone, which is the dividend yield. 12,000 ₫ stops at the numerator, before dividing by the starting capital.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Rate_of_return',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q381',
    formulaId: 'cagr',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, CAGR của khoản đầu tư bằng bao nhiêu?',
      en: 'With the figures below, what is the CAGR of this investment?',
    },
    facts: [
      {
        label: { vi: 'Giá trị đầu kỳ', en: 'Value at start' },
        value: { vi: '100.000.000 ₫', en: '100,000,000 ₫' },
      },
      {
        label: { vi: 'Giá trị cuối kỳ', en: 'Value at end' },
        value: { vi: '133.100.000 ₫', en: '133,100,000 ₫' },
      },
      { label: { vi: 'Số năm', en: 'Years' }, value: { vi: '3 năm', en: '3 years' } },
    ],
    choices: {
      a: { vi: '10,00%/năm', en: '10.00% a year' },
      b: { vi: '33,10%/năm', en: '33.10% a year' },
      c: { vi: '11,03%/năm', en: '11.03% a year' },
      d: { vi: '1,331 lần', en: '1.331x' },
    },
    answer: 'a',
    verify: {
      inputs: { start: 100000000, end: 133100000, years: 3 },
      expected: 10,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Hệ số tăng cả kỳ là 133,1 chia 100 bằng 1,331; lấy căn bậc 3 ra 1,1 rồi trừ 1 được 10% mỗi năm. Đáp án 33,10% là tổng mức tăng của CẢ BA NĂM, chưa quy về một năm. 11,03% là chia đều 33,1% cho 3 năm, một phép chia thẳng bỏ qua việc lãi sinh lãi nên luôn cao hơn CAGR thật. 1,331 lần là dừng ở hệ số tăng, chưa lấy căn và chưa trừ 1.',
      en: 'The whole-period growth factor is 133.1 over 100, that is 1.331; the cube root is 1.1, and subtracting 1 leaves 10% a year. The 33.10% answer is the total growth over ALL THREE YEARS, not yet annualized. 11.03% divides 33.1% evenly across three years, a flat split that ignores compounding and so always overstates the true CAGR. 1.331x stops at the growth factor, before the root and the subtraction.',
    },
    source: {
      url: 'https://docs.tradingmetrics.com/en/technical-analysis/trading-metrics/performance-metrics/cagr',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q382',
    formulaId: 'ty-suat-co-tuc',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, tỷ suất cổ tức bằng bao nhiêu?',
      en: 'With the figures below, what is the dividend yield?',
    },
    facts: [
      {
        label: { vi: 'Giá thị trường', en: 'Market price' },
        value: { vi: '50.000 ₫', en: '50,000 ₫' },
      },
      {
        label: { vi: 'Cổ tức tiền mặt một năm', en: 'Annual cash dividend' },
        value: { vi: '2.500 ₫/CP', en: '2,500 ₫ a share' },
      },
    ],
    choices: {
      a: { vi: '5%', en: '5%' },
      b: { vi: '20 lần', en: '20x' },
      c: { vi: '0,05%', en: '0.05%' },
      d: { vi: '47.500 ₫', en: '47,500 ₫' },
    },
    answer: 'a',
    verify: { inputs: { price: 50000, dividendPerShare: 2500 }, expected: 5, tolerance: 0.01 },
    explain: {
      vi: '2.500 chia 50.000 bằng 0,05, nhân 100 ra 5%: mỗi 100 đồng bỏ ra mua cổ phiếu nhận về 5 đồng cổ tức một năm. Mẫu số là GIÁ THỊ TRƯỜNG chứ không phải mệnh giá, nên cùng một mức cổ tức sẽ cho tỷ suất khác nhau tuỳ giá mua. Đáp án 20 lần là chia ngược. 0,05% là quên nhân 100. 47.500 ₫ là lấy hiệu.',
      en: '2,500 divided by 50,000 is 0.05, times 100 gives 5%: every 100 spent on the share returns 5 in dividends a year. The denominator is the MARKET price, not par value, so the same dividend gives a different yield depending on what you paid. The 20x answer inverts the ratio. 0.05% forgets the times-100 step. 47,500 ₫ subtracts.',
    },
    source: {
      url: 'https://fesacademy.com.vn/thu-vien-dau-tu/ngay-giao-dich-khong-huong-quyen-la-gi-tai-sao-nhan-co-tuc-xong-gia-co-phieu-lai-giam/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q383',
    formulaId: 'loi-suat-nam-hoa',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một chiến lược lãi đều 1% mỗi tháng. Lợi suất năm hoá bằng bao nhiêu?',
      en: 'A strategy returns a steady 1% a month. What is the annualized return?',
    },
    facts: [
      {
        label: { vi: 'Lợi suất một kỳ', en: 'Return per period' },
        value: { vi: '1%/tháng', en: '1% a month' },
      },
      {
        label: { vi: 'Số kỳ trong năm', en: 'Periods per year' },
        value: { vi: '12 kỳ', en: '12 periods' },
      },
    ],
    choices: {
      a: { vi: '12,68%', en: '12.68%' },
      b: { vi: '12,00%', en: '12.00%' },
      c: { vi: '3,46%', en: '3.46%' },
      d: { vi: '1,00%', en: '1.00%' },
    },
    answer: 'a',
    verify: {
      inputs: { periodReturn: 1, periodsPerYear: 12 },
      expected: 12.682503,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Năm hoá là NHÂN DỒN chứ không phải nhân thẳng: 1,01 mũ 12 bằng 1,1268, trừ 1 ra 12,68%. Đáp án 12,00% là nhân 1% với 12, bỏ qua việc lãi tháng trước lại sinh lãi, và 0,68 điểm phần trăm chênh lệch chính là phần lãi kép ấy. 3,46% là nhân với căn bậc hai của 12, quy ước dùng cho ĐỘ BIẾN ĐỘNG chứ không dùng cho lợi suất. 1,00% là giữ nguyên lợi suất một kỳ.',
      en: 'Annualizing means COMPOUNDING, not multiplying: 1.01 to the twelfth is 1.1268, minus 1 gives 12.68%. The 12.00% answer multiplies 1% by 12, ignoring that each month earns on the previous month, and the 0.68 percentage-point gap is exactly that compounding. 3.46% multiplies by the square root of 12, the convention for VOLATILITY rather than for returns. 1.00% leaves the single-period return untouched.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Holding_period_return',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q384',
    formulaId: 'loi-suat-thuc',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Gửi tiết kiệm lãi 12%/năm trong khi lạm phát 5%/năm. Lợi suất THỰC bằng bao nhiêu?',
      en: 'A deposit pays 12% a year while inflation runs at 5% a year. What is the REAL return?',
    },
    facts: [
      {
        label: { vi: 'Lợi suất danh nghĩa', en: 'Nominal return' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
      { label: { vi: 'Lạm phát', en: 'Inflation' }, value: { vi: '5%/năm', en: '5% a year' } },
    ],
    choices: {
      a: { vi: '6,67%', en: '6.67%' },
      b: { vi: '7,00%', en: '7.00%' },
      c: { vi: '17,00%', en: '17.00%' },
      d: { vi: '2,4 lần', en: '2.4x' },
    },
    answer: 'a',
    verify: { inputs: { nominal: 12, inflation: 5 }, expected: 6.666667, tolerance: 0.01 },
    explain: {
      vi: 'Công thức Fisher CHIA chứ không trừ: 1,12 chia 1,05 bằng 1,0667, trừ 1 ra 6,67%. Đáp án 7,00% là phép trừ 12 trừ 5, một xấp xỉ khá sát khi lạm phát thấp nhưng lệch dần khi lạm phát cao, và ở đây đã cao hơn con số đúng 0,33 điểm phần trăm. 17,00% là cộng thay vì trừ. 2,4 lần là chia thẳng 12 cho 5, hai con số phần trăm chia cho nhau thì không còn là một suất sinh lời.',
      en: 'The Fisher relation DIVIDES rather than subtracts: 1.12 over 1.05 is 1.0667, minus 1 gives 6.67%. The 7.00% answer is 12 minus 5, a fair approximation at low inflation that drifts as inflation rises, and here it already overstates by 0.33 percentage points. 17.00% adds instead of subtracting. 2.4x divides 12 by 5, and one percentage divided by another is no longer a rate of return.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Real_interest_rate',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q385',
    formulaId: 'lai-suat-hieu-dung',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một khoản vay ghi lãi suất 12%/năm, ghép lãi theo QUÝ. Lãi suất hiệu dụng năm (EAR) bằng bao nhiêu?',
      en: 'A loan quotes 12% a year compounded QUARTERLY. What is the effective annual rate (EAR)?',
    },
    facts: [
      {
        label: { vi: 'Lãi suất danh nghĩa', en: 'Nominal rate' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
      {
        label: { vi: 'Số kỳ ghép lãi', en: 'Compounding periods' },
        value: { vi: '4 lần/năm', en: '4 a year' },
      },
    ],
    choices: {
      a: { vi: '12,55%', en: '12.55%' },
      b: { vi: '12,00%', en: '12.00%' },
      c: { vi: '12,68%', en: '12.68%' },
      d: { vi: '48,00%', en: '48.00%' },
    },
    answer: 'a',
    verify: { inputs: { rate: 12, perYear: 4 }, expected: 12.550881, tolerance: 0.01 },
    explain: {
      vi: 'Mỗi quý cộng 12 chia 4 bằng 3%, và lãi quý trước lại sinh lãi: 1,03 mũ 4 bằng 1,1255, trừ 1 ra 12,55%. Đáp án 12,00% là lãi DANH NGHĨA, con số ghi trên hợp đồng, và chênh 0,55 điểm phần trăm là cái giá của việc ghép lãi bốn lần. 12,68% là ghép theo THÁNG, tức đọc nhầm kỳ ghép lãi. 48,00% là nhân 12% với 4, nhầm lãi suất năm thành lãi suất quý.',
      en: 'Each quarter adds 12 over 4, that is 3%, and each quarter earns on the last: 1.03 to the fourth is 1.1255, minus 1 gives 12.55%. The 12.00% answer is the NOMINAL rate printed in the contract, and the 0.55 percentage-point gap is the price of compounding four times. 12.68% compounds MONTHLY, misreading the compounding period. 48.00% multiplies 12% by 4, treating the annual rate as a quarterly one.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Effective_interest_rate',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q386',
    formulaId: 'tong-loi-suat-tai-dau-tu',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, tổng lợi suất có tái đầu tư cổ tức sau 3 năm bằng bao nhiêu?',
      en: 'With the figures below, what is the total return with dividends reinvested over 3 years?',
    },
    facts: [
      { label: { vi: 'Tăng giá', en: 'Price growth' }, value: { vi: '8%/năm', en: '8% a year' } },
      {
        label: { vi: 'Tỷ suất cổ tức', en: 'Dividend yield' },
        value: { vi: '2%/năm', en: '2% a year' },
      },
      { label: { vi: 'Số năm', en: 'Years' }, value: { vi: '3 năm', en: '3 years' } },
    ],
    choices: {
      a: { vi: '33,68%', en: '33.68%' },
      b: { vi: '33,10%', en: '33.10%' },
      c: { vi: '30,00%', en: '30.00%' },
      d: { vi: '25,97%', en: '25.97%' },
    },
    answer: 'a',
    verify: {
      inputs: { priceGrowth: 8, dividendYield: 2, years: 3 },
      expected: 33.681645,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Hai nguồn lợi ích nhân dồn RIÊNG rồi mới ghép: 1,08 mũ 3 bằng 1,2597 cho phần tăng giá, 1,02 mũ 3 bằng 1,0612 cho phần cổ tức tái đầu tư, nhân hai hệ số ra 1,3368, trừ 1 được 33,68%. Đáp án 33,10% là gộp 8% với 2% thành 10% rồi mới luỹ thừa, tức bỏ qua việc cổ tức sau khi tái đầu tư cũng sinh lời riêng. 30,00% là nhân thẳng 10% với 3 năm, không có lãi kép. 25,97% là chỉ tính phần tăng giá, quên hẳn cổ tức.',
      en: 'The two sources compound SEPARATELY before being combined: 1.08 cubed is 1.2597 for price growth, 1.02 cubed is 1.0612 for reinvested dividends, and the product 1.3368 minus 1 gives 33.68%. The 33.10% answer merges 8% and 2% into 10% before compounding, ignoring that reinvested dividends earn on their own. 30.00% multiplies 10% by three years with no compounding at all. 25.97% counts price growth only, dropping dividends entirely.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Total_return',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q387',
    formulaId: 'loi-suat-trung-binh-hinh-hoc',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Năm thứ nhất danh mục lãi 50%, năm thứ hai lỗ 50%. Lợi suất trung bình HÌNH HỌC mỗi năm bằng bao nhiêu?',
      en: 'A portfolio gains 50% in year one and loses 50% in year two. What is the GEOMETRIC average return a year?',
    },
    facts: [
      { label: { vi: 'Lợi suất năm 1', en: 'Year 1 return' }, value: { vi: '+50%', en: '+50%' } },
      { label: { vi: 'Lợi suất năm 2', en: 'Year 2 return' }, value: { vi: '−50%', en: '−50%' } },
    ],
    choices: {
      a: { vi: '−13,40%/năm', en: '−13.40% a year' },
      b: { vi: '0%/năm', en: '0% a year' },
      c: { vi: '−25%/năm', en: '−25% a year' },
      d: { vi: '−12,5%/năm', en: '−12.5% a year' },
    },
    answer: 'a',
    verify: {
      inputs: { periods: 2, r1: 50, r2: -50, r3: 0 },
      expected: -13.39746,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Nhân dồn hai hệ số rồi mới lấy căn: 1,5 nhân 0,5 bằng 0,75, căn bậc hai của 0,75 là 0,866, trừ 1 ra −13,40% mỗi năm. Đáp án 0% là trung bình CỘNG, đúng về số học nhưng sai về tiền: 100 lên 150 rồi còn 75, tức mất một phần tư vốn trong khi trung bình cộng báo hoà. −25% chính là mức lỗ của CẢ KỲ, chưa chia về một năm. −12,5% là chia đôi mức lỗ cả kỳ, một phép chia thẳng bỏ qua lãi kép.',
      en: 'Chain the two factors first, then take the root: 1.5 times 0.5 is 0.75, the square root of 0.75 is 0.866, minus 1 gives −13.40% a year. The 0% answer is the ARITHMETIC mean, correct as arithmetic and wrong as money: 100 rises to 150 and ends at 75, a quarter of the capital gone while the average reports break-even. −25% is the loss over the WHOLE period, not yet per year. −12.5% halves that period loss, a flat split that ignores compounding.',
    },
    source: {
      url: 'https://adviceonly.com/glossary/annualized-return',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q388',
    formulaId: 'irr-nien-kim',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bỏ ra 100 triệu ₫ và nhận đều 30 triệu ₫ mỗi kỳ trong 4 kỳ. IRR mỗi kỳ bằng bao nhiêu?',
      en: 'You invest 100 million ₫ and receive 30 million ₫ each period for 4 periods. What is the IRR per period?',
    },
    facts: [
      {
        label: { vi: 'Vốn bỏ ra ban đầu', en: 'Initial outlay' },
        value: { vi: '100.000.000 ₫', en: '100,000,000 ₫' },
      },
      {
        label: { vi: 'Khoản nhận mỗi kỳ', en: 'Payment per period' },
        value: { vi: '30.000.000 ₫', en: '30,000,000 ₫' },
      },
      { label: { vi: 'Số kỳ', en: 'Number of periods' }, value: { vi: '4 kỳ', en: '4 periods' } },
    ],
    choices: {
      a: { vi: '7,71%/kỳ', en: '7.71% a period' },
      b: { vi: '20,00%/kỳ', en: '20.00% a period' },
      c: { vi: '5,00%/kỳ', en: '5.00% a period' },
      d: { vi: '30,00%/kỳ', en: '30.00% a period' },
    },
    answer: 'a',
    verify: {
      inputs: { investment: 100000000, payment: 30000000, periods: 4 },
      expected: 7.713847,
      tolerance: 0.01,
    },
    explain: {
      vi: 'IRR là mức chiết khấu làm cho bốn khoản 30 triệu, mỗi khoản chiết khấu về hiện tại theo kỳ của nó, cộng lại vừa đúng 100 triệu — ở đây là 7,71% mỗi kỳ. Không có công thức đóng, phải dò nghiệm, và đó là lý do con số không tròn. Đáp án 20,00% là tổng lãi 20 triệu chia vốn 100 triệu, bỏ qua hẳn thời điểm nhận tiền. 5,00% là chia tổng lãi ấy cho 4 kỳ rồi cho vốn. 30,00% là lấy khoản nhận chia vốn, tức nhầm dòng tiền hoàn vốn với tiền lãi.',
      en: 'IRR is the discount rate that makes the four 30-million payments, each discounted back over its own period, add up to exactly 100 million, which here is 7.71% a period. There is no closed form, it has to be solved numerically, which is why the figure is not round. The 20.00% answer divides the 20 million total gain by the 100 million invested, ignoring when the money arrives. 5.00% spreads that gain over four periods first. 30.00% divides the payment by the outlay, mistaking the return of capital for the return on it.',
    },
    source: {
      url: 'https://corporatefinanceinstitute.com/resources/valuation/internal-rate-return-irr/',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q389',
    formulaId: 'thoi-gian-nhan-doi',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Vốn sinh lời 6%/năm, ghép lãi hằng năm. Thời gian nhân đôi CHÍNH XÁC là bao lâu?',
      en: 'Capital compounds at 6% a year. How long does it take to double, computed exactly?',
    },
    facts: [
      { label: { vi: 'Lãi suất', en: 'Interest rate' }, value: { vi: '6%/năm', en: '6% a year' } },
    ],
    choices: {
      a: { vi: '11,9 năm', en: '11.9 years' },
      b: { vi: '12,0 năm', en: '12.0 years' },
      c: { vi: '16,7 năm', en: '16.7 years' },
      d: { vi: '6,0 năm', en: '6.0 years' },
    },
    answer: 'a',
    verify: { inputs: { rate: 6 }, expected: 11.895661, tolerance: 0.05 },
    explain: {
      vi: 'Nghiệm chính xác là logarit của 2 chia cho logarit của 1,06, ra 11,90 năm. Đáp án 12,0 năm là XẤP XỈ theo quy tắc 72, tức 72 chia 6, và nó sai chưa tới hai tháng nên vẫn rất đáng dùng để nhẩm nhanh — nhưng nó là ước lượng, không phải kết quả của phép tính. Quy tắc 72 sát nhất quanh mức lãi 8% và lệch dần khi lãi suất cao. 16,7 năm là lấy 100 chia 6, một quy tắc không có cơ sở. 6,0 năm là lấy luôn con số lãi suất.',
      en: 'The exact solution is the logarithm of 2 divided by the logarithm of 1.06, which is 11.90 years. The 12.0 answer is the rule-of-72 APPROXIMATION, 72 over 6, and it is off by less than two months, so it remains an excellent mental shortcut, but it is an estimate rather than the result of the calculation. The rule of 72 is closest around 8% and drifts as rates rise. 16.7 years divides 100 by 6, a rule with no basis. 6.0 years simply repeats the interest rate.',
    },
    source: { url: 'https://en.wikipedia.org/wiki/Rule_of_72', kind: 'giao-khoa', vietnam: false },
  },
  {
    id: 'Q390',
    formulaId: 'loi-suat-quy-nam-theo-ngay',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Mua ở 50.000 ₫, bán ở 55.000 ₫ sau 73 ngày. Lợi suất quy năm bằng bao nhiêu?',
      en: 'Bought at 50,000 ₫ and sold at 55,000 ₫ after 73 days. What is the annualized return?',
    },
    facts: [
      { label: { vi: 'Giá mua', en: 'Buy price' }, value: { vi: '50.000 ₫', en: '50,000 ₫' } },
      { label: { vi: 'Giá bán', en: 'Sell price' }, value: { vi: '55.000 ₫', en: '55,000 ₫' } },
      {
        label: { vi: 'Số ngày nắm giữ', en: 'Days held' },
        value: { vi: '73 ngày', en: '73 days' },
      },
    ],
    choices: {
      a: { vi: '61,05%/năm', en: '61.05% a year' },
      b: { vi: '50,00%/năm', en: '50.00% a year' },
      c: { vi: '10,00%/năm', en: '10.00% a year' },
      d: { vi: '2,00%/năm', en: '2.00% a year' },
    },
    answer: 'a',
    verify: {
      inputs: { buyPrice: 50000, sellPrice: 55000, days: 73 },
      expected: 61.051,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Lợi suất kỳ nắm giữ là 5.000 chia 50.000 bằng 10%. Một năm có 365 chia 73 bằng 5 kỳ như thế, và quy năm là NHÂN DỒN: 1,1 mũ 5 bằng 1,61051, trừ 1 ra 61,05%. Đáp án 50,00% là nhân thẳng 10% với 5, bỏ qua lãi kép. 10,00% là giữ nguyên lợi suất kỳ nắm giữ, chưa quy năm. 2,00% là chia 10% cho 5. Lưu ý con số 61% này chỉ là phép quy đổi, KHÔNG có nghĩa cả năm sẽ lãi 61%.',
      en: 'The holding period return is 5,000 over 50,000, that is 10%. A year holds 365 over 73, five such periods, and annualizing means COMPOUNDING: 1.1 to the fifth is 1.61051, minus 1 gives 61.05%. The 50.00% answer multiplies 10% by 5, ignoring compounding. 10.00% leaves the holding period return unconverted. 2.00% divides 10% by 5. Note that the 61% figure is only a conversion, it does NOT mean the year will return 61%.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Day_count_convention',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q391',
    formulaId: 'loi-suat-vuot-chuan',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Danh mục lãi 18% trong khi chỉ số tham chiếu lãi 12%. Lợi suất vượt chuẩn bằng bao nhiêu?',
      en: 'A portfolio returns 18% while the benchmark returns 12%. What is the excess return?',
    },
    facts: [
      {
        label: { vi: 'Lợi suất danh mục', en: 'Portfolio return' },
        value: { vi: '18%', en: '18%' },
      },
      {
        label: { vi: 'Lợi suất chỉ số tham chiếu', en: 'Benchmark return' },
        value: { vi: '12%', en: '12%' },
      },
    ],
    choices: {
      a: { vi: '6 điểm phần trăm', en: '6 percentage points' },
      b: { vi: '50%', en: '50%' },
      c: { vi: '1,5 lần', en: '1.5x' },
      d: { vi: '30%', en: '30%' },
    },
    answer: 'a',
    verify: {
      inputs: { portfolioReturn: 18, benchmarkReturn: 12 },
      expected: 6,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Lợi suất vượt chuẩn là phép TRỪ hai lợi suất: 18 trừ 12 bằng 6 điểm phần trăm. Đáp án 50% là mức vượt TƯƠNG ĐỐI (6 chia 12), một cách nói khác và không so sánh được với con số vượt chuẩn của danh mục khác. 1,5 lần là tỷ lệ 18 trên 12. 30% là cộng hai lợi suất. Lưu ý vượt chuẩn 6 điểm chưa chắc là làm tốt: nếu phần vượt ấy đến từ việc gánh rủi ro cao hơn chỉ số thì alpha điều chỉnh rủi ro vẫn có thể âm.',
      en: 'Excess return is a SUBTRACTION of two returns: 18 minus 12 is 6 percentage points. The 50% answer is the RELATIVE outperformance (6 over 12), a different statement that cannot be compared with another portfolio excess return. 1.5x is the ratio of 18 to 12. 30% adds the two returns. Note that beating the benchmark by 6 points is not automatically good: if the excess came from carrying more risk than the index, risk-adjusted alpha can still be negative.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Alpha_(finance)',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q392',
    formulaId: 'co-lenh-rui-ro',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Theo quy tắc 2%, với số liệu dưới đây bạn được mua tối đa bao nhiêu cổ phiếu?',
      en: 'Under the 2% rule, how many shares may you buy with the figures below?',
    },
    facts: [
      {
        label: { vi: 'Vốn tài khoản', en: 'Account equity' },
        value: { vi: '500.000.000 ₫', en: '500,000,000 ₫' },
      },
      {
        label: { vi: 'Rủi ro cho phép mỗi lệnh', en: 'Risk allowed per trade' },
        value: { vi: '2%', en: '2%' },
      },
      {
        label: { vi: 'Giá vào lệnh', en: 'Entry price' },
        value: { vi: '50.000 ₫', en: '50,000 ₫' },
      },
      {
        label: { vi: 'Giá dừng lỗ', en: 'Stop-loss price' },
        value: { vi: '45.000 ₫', en: '45,000 ₫' },
      },
    ],
    choices: {
      a: { vi: '2.000 CP', en: '2,000 shares' },
      b: { vi: '10.000 CP', en: '10,000 shares' },
      c: { vi: '200 CP', en: '200 shares' },
      d: { vi: '222 CP', en: '222 shares' },
    },
    answer: 'a',
    verify: {
      inputs: { capital: 500000000, riskPercent: 2, entryPrice: 50000, stopPrice: 45000 },
      expected: 2000,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Hai bước. Số tiền được phép mất: 500.000.000 nhân 2% bằng 10.000.000 ₫. Mức lỗ trên mỗi cổ phiếu nếu chạm dừng lỗ: 50.000 trừ 45.000 bằng 5.000 ₫. Chia ra được 2.000 cổ phiếu. Điểm cốt lõi là cỡ lệnh được SUY NGƯỢC từ khoảng cách dừng lỗ, chứ không chọn trước rồi mới tìm chỗ đặt dừng lỗ. Đáp án 10.000 CP là lấy 500 triệu chia giá vào lệnh, tức dồn hết vốn. 200 CP là lấy 10 triệu chia giá vào lệnh, nhầm khoảng lỗ thành cả giá cổ phiếu. 222 CP là chia cho giá dừng lỗ theo cùng lối nhầm ấy.',
      en: 'Two steps. The money at risk: 500,000,000 times 2% is 10,000,000 ₫. The loss per share if the stop is hit: 50,000 minus 45,000 is 5,000 ₫. Dividing gives 2,000 shares. The key point is that position size is DERIVED from the stop distance, not chosen first and given a stop afterwards. The 10,000 answer divides the whole 500 million by the entry price, committing everything. 200 divides 10 million by the entry price, mistaking the stop distance for the full share price. 222 does the same against the stop price.',
    },
    source: {
      url: 'https://www.cmegroup.com/education/courses/trade-and-risk-management/the-2-percent-rule',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q393',
    formulaId: 'gia-ly-thuyet-vn30f',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, giá lý thuyết của hợp đồng tương lai bằng bao nhiêu điểm?',
      en: 'With the figures below, what is the theoretical futures price in index points?',
    },
    facts: [
      {
        label: { vi: 'Chỉ số cơ sở', en: 'Spot index' },
        value: { vi: '1.200 điểm', en: '1,200 points' },
      },
      {
        label: { vi: 'Lãi suất phi rủi ro', en: 'Risk-free rate' },
        value: { vi: '4,8%/năm', en: '4.8% a year' },
      },
      {
        label: { vi: 'Tỷ suất cổ tức', en: 'Dividend yield' },
        value: { vi: '1,8%/năm', en: '1.8% a year' },
      },
      {
        label: { vi: 'Số ngày tới đáo hạn', en: 'Days to expiry' },
        value: { vi: '30 ngày', en: '30 days' },
      },
    ],
    choices: {
      a: { vi: '1.202,96 điểm', en: '1,202.96 points' },
      b: { vi: '1.200,00 điểm', en: '1,200.00 points' },
      c: { vi: '1.236,00 điểm', en: '1,236.00 points' },
      d: { vi: '1.197,04 điểm', en: '1,197.04 points' },
    },
    answer: 'a',
    verify: {
      inputs: { indexValue: 1200, riskFreeRate: 4.8, dividendYield: 1.8, days: 30 },
      expected: 1202.9589,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Chi phí nắm giữ là phần chênh giữa lãi vay và cổ tức, tính theo số ngày còn lại: 4,8% trừ 1,8% bằng 3% một năm, nhân 30 chia 365 ra 0,2466%, nhân với 1.200 điểm được 2,96 điểm. Cộng vào chỉ số cơ sở ra 1.202,96 điểm. Đáp án 1.200,00 điểm là bỏ hẳn chi phí nắm giữ. 1.236,00 điểm là tính đủ 3% cho CẢ NĂM thay vì cho 30 ngày. 1.197,04 điểm là trừ thay vì cộng. Giá lý thuyết không phải dự báo của thị trường về mức chỉ số khi đáo hạn.',
      en: 'The cost of carry is the gap between the financing rate and the dividend yield, prorated over the days remaining: 4.8% minus 1.8% is 3% a year, times 30 over 365 gives 0.2466%, times 1,200 points is 2.96 points. Added to the spot index that is 1,202.96 points. The 1,200.00 answer drops the carry entirely. 1,236.00 applies the full 3% for a WHOLE YEAR instead of 30 days. 1,197.04 subtracts instead of adding. The theoretical price is not a market forecast of where the index will be at expiry.',
    },
    source: {
      url: 'https://www.bsc.com.vn/tin-tuc/tin-chi-tiet/653080-dinh-gia-hop-dong-tuong-lai',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q394',
    formulaId: 'basis-vn30f',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Hợp đồng tương lai đang ở 1.206 điểm trong khi chỉ số VN30 ở 1.200 điểm. Basis bằng bao nhiêu?',
      en: 'The futures trade at 1,206 points while the VN30 index is at 1,200. What is the basis?',
    },
    facts: [
      {
        label: { vi: 'Giá hợp đồng tương lai', en: 'Futures price' },
        value: { vi: '1.206 điểm', en: '1,206 points' },
      },
      {
        label: { vi: 'Chỉ số cơ sở', en: 'Spot index' },
        value: { vi: '1.200 điểm', en: '1,200 points' },
      },
    ],
    choices: {
      a: { vi: '+6 điểm', en: '+6 points' },
      b: { vi: '−6 điểm', en: '−6 points' },
      c: { vi: '+0,5 điểm', en: '+0.5 points' },
      d: { vi: '1,005 lần', en: '1.005x' },
    },
    answer: 'a',
    verify: {
      inputs: { futuresPoints: 1206, indexValue: 1200 },
      expected: 6,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Basis là giá hợp đồng tương lai TRỪ chỉ số cơ sở: 1.206 trừ 1.200 bằng +6 điểm, tức thị trường phái sinh đang cao hơn cơ sở. Dấu mang thông tin nên không được đảo: basis dương là trạng thái thông thường khi lãi vay cao hơn cổ tức. Đáp án −6 điểm là trừ ngược. +0,5 điểm là con số phần trăm (6 chia 1.200) gắn nhầm đơn vị điểm. 1,005 lần là lấy tỷ lệ hai giá, quên trừ đi phần cơ sở.',
      en: 'The basis is the futures price MINUS the spot index: 1,206 minus 1,200 is +6 points, meaning the derivative trades above the underlying. The sign carries information, so it must not be flipped: a positive basis is the normal state when financing costs exceed the dividend yield. The −6 answer subtracts the wrong way round. +0.5 is the percentage figure (6 over 1,200) mislabelled as points. 1.005x takes the ratio of the two prices, forgetting to net off the underlying.',
    },
    source: { url: 'https://www.finhay.com.vn/basis-la-gi', kind: 'giao-khoa', vietnam: true },
  },
  {
    id: 'Q395',
    formulaId: 'lai-lo-vi-the-short',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bạn mở vị thế Short 2 hợp đồng ở 1.250 điểm và đóng ở 1.230 điểm. Lãi hay lỗ bao nhiêu?',
      en: 'You open a short of 2 contracts at 1,250 points and close at 1,230. What is the profit or loss?',
    },
    facts: [
      {
        label: { vi: 'Điểm mở vị thế', en: 'Entry points' },
        value: { vi: '1.250 điểm', en: '1,250 points' },
      },
      {
        label: { vi: 'Điểm đóng vị thế', en: 'Exit points' },
        value: { vi: '1.230 điểm', en: '1,230 points' },
      },
      { label: { vi: 'Số hợp đồng', en: 'Contracts' }, value: { vi: '2 HĐ', en: '2 contracts' } },
    ],
    choices: {
      a: { vi: 'Lãi 4.000.000 ₫', en: 'Profit of 4,000,000 ₫' },
      b: { vi: 'Lỗ 4.000.000 ₫', en: 'Loss of 4,000,000 ₫' },
      c: { vi: 'Lãi 2.000.000 ₫', en: 'Profit of 2,000,000 ₫' },
      d: { vi: 'Lãi 40 ₫', en: 'Profit of 40 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { entryPoints: 1250, exitPoints: 1230, contracts: 2 },
      expected: 4000000,
      tolerance: 1,
    },
    explain: {
      vi: 'Vị thế Short lãi khi chỉ số GIẢM, nên lấy điểm mở trừ điểm đóng: 1.250 trừ 1.230 bằng 20 điểm. Mỗi điểm của hợp đồng VN30F trị giá 100.000 ₫, nhân 2 hợp đồng ra 4.000.000 ₫ lãi. Đáp án lỗ 4.000.000 ₫ là tính theo chiều của vị thế Long, đúng con số nhưng ngược dấu. Lãi 2.000.000 ₫ là quên nhân số hợp đồng. Lãi 40 ₫ là quên hệ số nhân 100.000 ₫ mỗi điểm.',
      en: 'A short position gains when the index FALLS, so take entry minus exit: 1,250 minus 1,230 is 20 points. Each VN30F point is worth 100,000 ₫, times 2 contracts gives a 4,000,000 ₫ profit. The loss answer applies the long direction, right number and wrong sign. A 2,000,000 ₫ profit forgets the contract count. A 40 ₫ profit forgets the 100,000 ₫ multiplier per point.',
    },
    source: {
      url: 'https://tuoitre.vn/nld/vnmoney/chay-tai-khoan-trong-phien-dao-han-chung-khoan-phai-sinh-20200525101757216.htm',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q396',
    formulaId: 'so-hop-dong-toi-da',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, tài khoản mở được tối đa bao nhiêu hợp đồng?',
      en: 'With the figures below, how many contracts can the account carry at most?',
    },
    facts: [
      {
        label: { vi: 'Vốn tài khoản', en: 'Account equity' },
        value: { vi: '200.000.000 ₫', en: '200,000,000 ₫' },
      },
      {
        label: { vi: 'Giá hợp đồng', en: 'Futures price' },
        value: { vi: '1.250 điểm', en: '1,250 points' },
      },
      { label: { vi: 'Tỷ lệ ký quỹ', en: 'Margin ratio' }, value: { vi: '20%', en: '20%' } },
    ],
    choices: {
      a: { vi: '8 HĐ', en: '8 contracts' },
      b: { vi: '9 HĐ', en: '9 contracts' },
      c: { vi: '1 HĐ', en: '1 contract' },
      d: { vi: '40 HĐ', en: '40 contracts' },
    },
    answer: 'a',
    verify: {
      inputs: { capital: 200000000, futuresPoints: 1250, marginRatio: 20 },
      expected: 8,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Giá trị danh nghĩa một hợp đồng là 1.250 nhân 100.000 bằng 125.000.000 ₫, ký quỹ 20% tức 25.000.000 ₫ mỗi hợp đồng. 200 triệu chia 25 triệu bằng 8. Kết quả phải LÀM TRÒN XUỐNG vì hợp đồng không chia nhỏ được, nên con số này đi theo bậc thang chứ không mượt. Đáp án 9 HĐ là làm tròn lên, và mở 9 hợp đồng thì thiếu ký quỹ ngay từ đầu. 1 HĐ là lấy vốn chia giá trị danh nghĩa mà quên tỷ lệ ký quỹ. 40 HĐ là chia cho 20% của chính vốn tài khoản.',
      en: 'One contract has a notional of 1,250 times 100,000, that is 125,000,000 ₫, and 20% margin means 25,000,000 ₫ each. 200 million over 25 million is 8. The result has to be rounded DOWN because contracts are indivisible, which is why this figure moves in steps rather than smoothly. The 9 answer rounds up, and nine contracts would be under-margined from the start. 1 divides equity by the full notional, forgetting the margin ratio. 40 divides by 20% of the account equity itself.',
    },
    source: {
      url: 'https://www.phs.vn/san-pham-dich-vu/quy-dinh-ve-hdtl-chi-so-vn-30/22',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q397',
    formulaId: 'co-vi-the-phai-sinh',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Theo quy tắc 2%, với số liệu dưới đây nên mở tối đa bao nhiêu hợp đồng?',
      en: 'Under the 2% rule, how many contracts should be opened at most with the figures below?',
    },
    facts: [
      {
        label: { vi: 'Vốn tài khoản', en: 'Account equity' },
        value: { vi: '400.000.000 ₫', en: '400,000,000 ₫' },
      },
      {
        label: { vi: 'Rủi ro cho phép mỗi lệnh', en: 'Risk allowed per trade' },
        value: { vi: '2%', en: '2%' },
      },
      {
        label: { vi: 'Khoảng dừng lỗ', en: 'Stop distance' },
        value: { vi: '20 điểm', en: '20 points' },
      },
    ],
    choices: {
      a: { vi: '4 HĐ', en: '4 contracts' },
      b: { vi: '8 HĐ', en: '8 contracts' },
      c: { vi: '400 HĐ', en: '400 contracts' },
      d: { vi: '2 HĐ', en: '2 contracts' },
    },
    answer: 'a',
    verify: {
      inputs: { capital: 400000000, riskPercent: 2, stopPoints: 20 },
      expected: 4,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Số tiền được phép mất là 400.000.000 nhân 2% bằng 8.000.000 ₫. Nếu chạm dừng lỗ, mỗi hợp đồng mất 20 điểm nhân 100.000 ₫ bằng 2.000.000 ₫. Chia ra được 4 hợp đồng, làm tròn xuống. Đáp án 8 HĐ là dùng 4% thay vì 2%, hoặc quên rằng mỗi điểm trị giá 100.000 ₫ chứ không phải 50.000. 400 HĐ là chia 8 triệu cho riêng 20 điểm, bỏ mất hệ số nhân. 2 HĐ là lấy khoảng dừng lỗ 20 điểm nhân đôi hệ số. Đây là cỡ vị thế theo RỦI RO, luôn nhỏ hơn hoặc bằng số hợp đồng ký quỹ cho phép.',
      en: 'The money at risk is 400,000,000 times 2%, that is 8,000,000 ₫. If the stop is hit, each contract loses 20 points times 100,000 ₫, that is 2,000,000 ₫. Dividing gives 4 contracts, rounded down. The 8 answer uses 4% instead of 2%, or forgets that a point is worth 100,000 ₫ rather than 50,000. 400 divides 8 million by the 20 points alone, dropping the multiplier. 2 doubles the multiplier against the stop distance. This is RISK-based sizing, and it is always at or below what margin alone would allow.',
    },
    source: {
      url: 'https://tinnhanhchungkhoan.vn/chung-khoan/chay-tai-khoan-trong-phien-dao-han-chung-khoan-phai-sinh-328263.html',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q398',
    formulaId: 'don-bay-hieu-dung',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, tỷ lệ đòn bẩy hiệu dụng của vị thế bằng bao nhiêu?',
      en: 'With the figures below, what is the effective leverage of the position?',
    },
    facts: [
      {
        label: { vi: 'Giá hợp đồng', en: 'Futures price' },
        value: { vi: '1.250 điểm', en: '1,250 points' },
      },
      { label: { vi: 'Số hợp đồng', en: 'Contracts' }, value: { vi: '2 HĐ', en: '2 contracts' } },
      {
        label: { vi: 'Vốn chủ trong tài khoản', en: 'Account equity' },
        value: { vi: '50.000.000 ₫', en: '50,000,000 ₫' },
      },
    ],
    choices: {
      a: { vi: '5,0 lần', en: '5.0x' },
      b: { vi: '2,5 lần', en: '2.5x' },
      c: { vi: '0,2 lần', en: '0.2x' },
      d: { vi: '10,0 lần', en: '10.0x' },
    },
    answer: 'a',
    verify: {
      inputs: { futuresPoints: 1250, contracts: 2, equity: 50000000 },
      expected: 5,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Giá trị danh nghĩa là 1.250 nhân 100.000 nhân 2 hợp đồng bằng 250.000.000 ₫, chia cho vốn chủ 50.000.000 ₫ ra 5,0 lần: chỉ số nhích 1% thì tài khoản biến động 5%. Đáp án 2,5 lần là quên nhân số hợp đồng. 0,2 lần là chia ngược. 10,0 lần là dùng hệ số 200.000 ₫ mỗi điểm. Lưu ý đòn bẩy này tính trên VỐN CHỦ thực có, khác với tỷ lệ ký quỹ tối thiểu, và nó là con số quyết định tài khoản chịu được cú ngược chiều bao xa.',
      en: 'The notional is 1,250 times 100,000 times 2 contracts, that is 250,000,000 ₫, divided by 50,000,000 ₫ of equity gives 5.0x: a 1% move in the index swings the account by 5%. The 2.5x answer forgets the contract count. 0.2x inverts the ratio. 10.0x uses a 200,000 ₫ multiplier per point. Note this leverage is measured against actual EQUITY, not against the minimum margin ratio, and it is the number that decides how far an adverse move the account can absorb.',
    },
    source: {
      url: 'https://vneconomy.vn/chung-khoan-phai-sinh-truoc-gio-g-4-con-ac-mong-margin-call.htm',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q399',
    formulaId: 'tra-gop-nien-kim',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Vay 600 triệu ₫, lãi 12%/năm, trả góp niên kim trong 10 năm. Số tiền trả mỗi tháng bằng bao nhiêu?',
      en: 'A 600 million ₫ loan at 12% a year, repaid as a level annuity over 10 years. What is the monthly payment?',
    },
    facts: [
      {
        label: { vi: 'Số tiền vay', en: 'Loan amount' },
        value: { vi: '600.000.000 ₫', en: '600,000,000 ₫' },
      },
      {
        label: { vi: 'Lãi suất', en: 'Interest rate' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
      { label: { vi: 'Thời hạn', en: 'Term' }, value: { vi: '10 năm', en: '10 years' } },
    ],
    choices: {
      a: { vi: '8.608.257 ₫/tháng', en: '8,608,257 ₫ a month' },
      b: { vi: '5.000.000 ₫/tháng', en: '5,000,000 ₫ a month' },
      c: { vi: '11.000.000 ₫/tháng', en: '11,000,000 ₫ a month' },
      d: { vi: '11.000.000.000 ₫/tháng', en: '11,000,000,000 ₫ a month' },
    },
    answer: 'a',
    verify: {
      inputs: { amount: 600000000, rate: 12, years: 10 },
      expected: 8608256.9,
      tolerance: 1,
    },
    explain: {
      vi: 'Lãi một kỳ là 12% chia 12 bằng 1% mỗi tháng, kỳ hạn 120 tháng. Công thức niên kim cho khoản trả cố định 8.608.257 ₫ mỗi tháng, trong đó kỳ đầu có 6.000.000 ₫ là lãi và chỉ 2.608.257 ₫ vào gốc. Đáp án 5.000.000 ₫ là chia đều 600 triệu cho 120 tháng, tức quên hẳn phần lãi. 11.000.000 ₫ là khoản trả của kỳ ĐẦU theo phương án gốc đều, cao hơn vì trả gốc nhanh hơn. 11.000.000.000 ₫ lệch hẳn ba chữ số.',
      en: 'The periodic rate is 12% over 12, that is 1% a month, across 120 months. The annuity formula gives a fixed payment of 8,608,257 ₫ a month, of which the first payment is 6,000,000 ₫ interest and only 2,608,257 ₫ principal. The 5,000,000 ₫ answer spreads 600 million evenly over 120 months, dropping interest entirely. 11,000,000 ₫ is the FIRST payment under the equal-principal method, higher because principal amortizes faster. 11,000,000,000 ₫ is three digits out.',
    },
    source: {
      url: 'https://thoibaonganhang.vn/nien-kim-co-dinh-don-gian-hoa-bai-toan-tai-chinh-cho-nguoi-mua-nha-84990.html',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q400',
    formulaId: 'tra-gop-goc-deu',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Vẫn khoản vay 600 triệu ₫, lãi 12%/năm, 10 năm, nhưng trả theo phương án GỐC ĐỀU. Kỳ đầu phải trả bao nhiêu?',
      en: 'Same 600 million ₫ loan at 12% over 10 years, but on the EQUAL-PRINCIPAL method. What is the first payment?',
    },
    facts: [
      {
        label: { vi: 'Số tiền vay', en: 'Loan amount' },
        value: { vi: '600.000.000 ₫', en: '600,000,000 ₫' },
      },
      {
        label: { vi: 'Lãi suất', en: 'Interest rate' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
      {
        label: { vi: 'Thời hạn', en: 'Term' },
        value: { vi: '10 năm (120 kỳ)', en: '10 years (120 periods)' },
      },
    ],
    choices: {
      a: { vi: '11.000.000 ₫', en: '11,000,000 ₫' },
      b: { vi: '5.000.000 ₫', en: '5,000,000 ₫' },
      c: { vi: '8.608.257 ₫', en: '8,608,257 ₫' },
      d: { vi: '6.000.000 ₫', en: '6,000,000 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { amount: 600000000, rate: 12, years: 10 },
      expected: 11000000,
      tolerance: 1,
    },
    explain: {
      vi: 'Gốc chia đều: 600.000.000 chia 120 kỳ bằng 5.000.000 ₫ mỗi kỳ. Lãi kỳ đầu tính trên dư nợ còn nguyên: 600.000.000 nhân 1% bằng 6.000.000 ₫. Cộng lại kỳ đầu trả 11.000.000 ₫, và các kỳ sau giảm dần vì dư nợ giảm. Đáp án 5.000.000 ₫ là chỉ phần gốc, 6.000.000 ₫ là chỉ phần lãi. 8.608.257 ₫ là khoản trả cố định của phương án niên kim: nó thấp hơn ở kỳ đầu nhưng tổng lãi cả đời khoản vay lại cao hơn, vì gốc giảm chậm hơn.',
      en: 'Principal is split evenly: 600,000,000 over 120 periods is 5,000,000 ₫ each. First-period interest is charged on the untouched balance: 600,000,000 times 1% is 6,000,000 ₫. Together the first payment is 11,000,000 ₫, and later ones fall as the balance shrinks. The 5,000,000 ₫ answer is the principal part only and 6,000,000 ₫ the interest part only. 8,608,257 ₫ is the level annuity payment: lower at the start, but more interest over the life of the loan because principal amortizes more slowly.',
    },
    source: {
      url: 'https://wiki.batdongsan.com.vn/wiki/du-no-goc-va-du-no-giam-dan-la-gi-109402',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q401',
    formulaId: 'lich-tra-no',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Vay 600 triệu ₫, lãi 12%/năm, trả góp niên kim 10 năm. TỔNG LÃI phải trả trong cả kỳ hạn là bao nhiêu?',
      en: 'A 600 million ₫ loan at 12% repaid as a level annuity over 10 years. What is the TOTAL INTEREST over the term?',
    },
    facts: [
      {
        label: { vi: 'Số tiền vay', en: 'Loan amount' },
        value: { vi: '600.000.000 ₫', en: '600,000,000 ₫' },
      },
      {
        label: { vi: 'Lãi suất', en: 'Interest rate' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
      { label: { vi: 'Thời hạn', en: 'Term' }, value: { vi: '10 năm', en: '10 years' } },
      {
        label: { vi: 'Phương án trả', en: 'Repayment method' },
        value: { vi: 'Niên kim', en: 'Level annuity' },
      },
    ],
    choices: {
      a: { vi: '432.990.828 ₫', en: '432,990,828 ₫' },
      b: { vi: '1.032.990.828 ₫', en: '1,032,990,828 ₫' },
      c: { vi: '720.000.000 ₫', en: '720,000,000 ₫' },
      d: { vi: '72.000.000 ₫', en: '72,000,000 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { amount: 600000000, rate: 12, years: 10, method: 1 },
      expected: 432990828.5,
      tolerance: 1,
    },
    explain: {
      vi: 'Trả 8.608.257 ₫ mỗi tháng trong 120 tháng là tổng 1.032.990.828 ₫; trừ đi 600.000.000 ₫ gốc đã vay, phần lãi là 432.990.828 ₫. Đáp án 1.032.990.828 ₫ là TỔNG TIỀN ĐÃ TRẢ, gồm cả gốc, không phải lãi. 720.000.000 ₫ là tính lãi đơn 12% trên toàn bộ 600 triệu suốt 10 năm, bỏ qua việc dư nợ giảm dần. 72.000.000 ₫ là lãi của đúng một năm. Tổng lãi tăng theo kỳ hạn nhanh hơn tuyến tính, nên kéo dài thời hạn để giảm khoản trả tháng luôn phải trả giá ở đây.',
      en: 'Paying 8,608,257 ₫ a month for 120 months totals 1,032,990,828 ₫; less the 600,000,000 ₫ borrowed, the interest is 432,990,828 ₫. The 1,032,990,828 ₫ answer is TOTAL PAID including principal, not interest. 720,000,000 ₫ charges simple interest of 12% on the full 600 million for ten years, ignoring the falling balance. 72,000,000 ₫ is one year of interest. Total interest rises faster than linearly with the term, so stretching the term to lower the monthly payment always costs here.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Amortization_schedule',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q402',
    formulaId: 'lai-kep',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Gửi 100 triệu ₫, lãi 12%/năm ghép lãi mỗi năm, trong 3 năm. Số tiền cuối kỳ bằng bao nhiêu?',
      en: 'Deposit 100 million ₫ at 12% a year compounded annually for 3 years. What is the ending balance?',
    },
    facts: [
      {
        label: { vi: 'Vốn gốc', en: 'Principal' },
        value: { vi: '100.000.000 ₫', en: '100,000,000 ₫' },
      },
      {
        label: { vi: 'Lãi suất', en: 'Interest rate' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
      {
        label: { vi: 'Số kỳ ghép lãi', en: 'Compounding' },
        value: { vi: '1 lần/năm', en: 'once a year' },
      },
      { label: { vi: 'Số năm', en: 'Years' }, value: { vi: '3 năm', en: '3 years' } },
    ],
    choices: {
      a: { vi: '140.492.800 ₫', en: '140,492,800 ₫' },
      b: { vi: '136.000.000 ₫', en: '136,000,000 ₫' },
      c: { vi: '40.492.800 ₫', en: '40,492,800 ₫' },
      d: { vi: '112.000.000 ₫', en: '112,000,000 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { principal: 100000000, rate: 12, years: 3, perYear: 1 },
      expected: 140492800,
      tolerance: 1,
    },
    explain: {
      vi: '100.000.000 nhân 1,12 mũ 3 bằng 140.492.800 ₫. Đáp án 136.000.000 ₫ là lãi ĐƠN: cộng 12 triệu ba lần trên vốn gốc, và khoảng cách 4.492.800 ₫ chính là phần lãi sinh ra từ lãi. 40.492.800 ₫ là phần LÃI, chưa cộng vốn gốc, nên trả lời nhầm câu hỏi. 112.000.000 ₫ là mới một năm. Lưu ý số tiền danh nghĩa tăng không có nghĩa sức mua tăng tương ứng, còn phải trừ lạm phát.',
      en: '100,000,000 times 1.12 cubed is 140,492,800 ₫. The 136,000,000 ₫ answer uses SIMPLE interest, adding 12 million three times to the original capital, and the 4,492,800 ₫ gap is precisely the interest earned on interest. 40,492,800 ₫ is the INTEREST alone, without the principal, answering a different question. 112,000,000 ₫ covers one year. Note that a rising nominal balance does not mean purchasing power rose with it, inflation still has to come off.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Real_interest_rate',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q403',
    formulaId: 'lai-tien-gui',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Gửi 200 triệu ₫ kỳ hạn 6 tháng, lãi suất niêm yết 6%/năm. Tiền lãi nhận được khi đáo hạn là bao nhiêu?',
      en: 'Deposit 200 million ₫ for 6 months at a quoted 6% a year. How much interest is received at maturity?',
    },
    facts: [
      {
        label: { vi: 'Số tiền gửi', en: 'Deposit' },
        value: { vi: '200.000.000 ₫', en: '200,000,000 ₫' },
      },
      {
        label: { vi: 'Lãi suất niêm yết', en: 'Quoted rate' },
        value: { vi: '6%/năm', en: '6% a year' },
      },
      { label: { vi: 'Kỳ hạn', en: 'Term' }, value: { vi: '6 tháng', en: '6 months' } },
    ],
    choices: {
      a: { vi: '6.000.000 ₫', en: '6,000,000 ₫' },
      b: { vi: '12.000.000 ₫', en: '12,000,000 ₫' },
      c: { vi: '1.000.000 ₫', en: '1,000,000 ₫' },
      d: { vi: '206.000.000 ₫', en: '206,000,000 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { principal: 200000000, rate: 6, months: 6 },
      expected: 6000000,
      tolerance: 1,
    },
    explain: {
      vi: 'Lãi suất niêm yết luôn là lãi suất NĂM, nên phải chia theo số tháng thực gửi: 200.000.000 nhân 6% nhân 6 chia 12 bằng 6.000.000 ₫. Đáp án 12.000.000 ₫ là tính đủ một năm cho một kỳ hạn sáu tháng, lỗi hay gặp nhất khi đọc bảng lãi suất. 1.000.000 ₫ là chia 6% cho 12 tháng rồi quên nhân lại số tháng gửi. 206.000.000 ₫ là tổng tiền nhận về cả gốc lẫn lãi, không phải riêng tiền lãi.',
      en: 'A quoted rate is always ANNUAL, so it must be prorated over the months actually on deposit: 200,000,000 times 6% times 6 over 12 gives 6,000,000 ₫. The 12,000,000 ₫ answer applies a full year to a six-month term, the commonest slip when reading a rate table. 1,000,000 ₫ divides 6% by twelve months and forgets to multiply back by the months held. 206,000,000 ₫ is the total returned, principal included, not the interest.',
    },
    source: {
      url: 'https://techcombank.com/thong-tin/blog/cach-tinh-lai-vay-ngan-hang',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q404',
    formulaId: 'tiet-kiem-muc-tieu',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Muốn có 600 triệu ₫ sau 36 tháng, gửi đều hằng tháng với lãi 6%/năm. Mỗi tháng cần gửi bao nhiêu?',
      en: 'To reach 600 million ₫ in 36 months by saving monthly at 6% a year, how much must go in each month?',
    },
    facts: [
      {
        label: { vi: 'Mục tiêu', en: 'Target' },
        value: { vi: '600.000.000 ₫', en: '600,000,000 ₫' },
      },
      { label: { vi: 'Lãi suất', en: 'Interest rate' }, value: { vi: '6%/năm', en: '6% a year' } },
      { label: { vi: 'Số tháng', en: 'Months' }, value: { vi: '36 tháng', en: '36 months' } },
    ],
    choices: {
      a: { vi: '15.253.162 ₫/tháng', en: '15,253,162 ₫ a month' },
      b: { vi: '16.666.667 ₫/tháng', en: '16,666,667 ₫ a month' },
      c: { vi: '15.723.270 ₫/tháng', en: '15,723,270 ₫ a month' },
      d: { vi: '14.150.943 ₫/tháng', en: '14,150,943 ₫ a month' },
    },
    answer: 'a',
    verify: {
      inputs: { target: 600000000, rate: 6, months: 36 },
      expected: 15253162.5,
      tolerance: 1,
    },
    explain: {
      vi: 'Mỗi khoản gửi vào còn sinh lời cho tới ngày đạt mục tiêu, nên số tiền phải gửi THẤP HƠN mức chia đều. Lãi một kỳ là 0,5% mỗi tháng; giải phương trình niên kim cho 36 kỳ ra 15.253.162 ₫ mỗi tháng. Đáp án 16.666.667 ₫ là chia đều 600 triệu cho 36 tháng, tức coi như tiền gửi vào không sinh lời, và phần chênh 1,4 triệu mỗi tháng chính là công của lãi kép. 15.723.270 ₫ và 14.150.943 ₫ là hai cách tính lãi sai: một bên chỉ cho khoản gửi cuối sinh lời, một bên cho cả 600 triệu sinh lời ngay từ tháng đầu.',
      en: 'Every contribution keeps earning until the target date, so the required amount is BELOW an even split. The periodic rate is 0.5% a month; solving the annuity equation over 36 periods gives 15,253,162 ₫ a month. The 16,666,667 ₫ answer divides 600 million evenly across 36 months, treating the contributions as earning nothing, and the 1.4 million monthly gap is exactly what compounding does. 15,723,270 ₫ and 14,150,943 ₫ are two wrong treatments of the interest: one lets only the last contribution earn, the other lets the full 600 million earn from month one.',
    },
    source: {
      url: 'https://vnexpress.net/nen-mo-tiet-kiem-gui-gop-hay-gui-thong-thuong-4276935.html',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q405',
    formulaId: 'rut-truoc-han',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Gửi 200 triệu ₫ kỳ hạn 12 tháng lãi 6%/năm, nhưng rút ở tháng thứ 6. Tiền lãi thực nhận là bao nhiêu?',
      en: 'A 200 million ₫ deposit for 12 months at 6% is withdrawn in month 6. How much interest is actually received?',
    },
    facts: [
      {
        label: { vi: 'Số tiền gửi', en: 'Deposit' },
        value: { vi: '200.000.000 ₫', en: '200,000,000 ₫' },
      },
      {
        label: { vi: 'Lãi suất theo hợp đồng', en: 'Contract rate' },
        value: { vi: '6%/năm', en: '6% a year' },
      },
      { label: { vi: 'Đã gửi được', en: 'Months held' }, value: { vi: '6 tháng', en: '6 months' } },
      {
        label: { vi: 'Lãi suất không kỳ hạn', en: 'Demand rate' },
        value: { vi: '0,1%/năm', en: '0.1% a year' },
      },
    ],
    choices: {
      a: { vi: '100.000 ₫', en: '100,000 ₫' },
      b: { vi: '6.000.000 ₫', en: '6,000,000 ₫' },
      c: { vi: '3.000.000 ₫', en: '3,000,000 ₫' },
      d: { vi: '200.000 ₫', en: '200,000 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: {
        principal: 200000000,
        contractRate: 6,
        termMonths: 12,
        monthsHeld: 6,
        demandRate: 0.1,
      },
      expected: 100000,
      tolerance: 1,
    },
    explain: {
      vi: 'Rút trước hạn thì TOÀN BỘ thời gian đã gửi bị tính lại theo lãi suất không kỳ hạn, chứ không phải chỉ phần còn thiếu: 200.000.000 nhân 0,1% nhân 6 chia 12 bằng 100.000 ₫. So với 6.000.000 ₫ lẽ ra nhận được nếu giữ đủ sáu tháng theo lãi hợp đồng, khoản mất đi là 5.900.000 ₫. Đáp án 6.000.000 ₫ là tin rằng vẫn được hưởng lãi hợp đồng cho phần đã gửi. 3.000.000 ₫ là cắt một nửa lãi như một khoản phạt. 200.000 ₫ là tính đủ 12 tháng theo lãi không kỳ hạn.',
      en: 'On an early withdrawal the ENTIRE period held is repriced at the demand rate, not just the missing part: 200,000,000 times 0.1% times 6 over 12 gives 100,000 ₫. Against the 6,000,000 ₫ that six months at the contract rate would have paid, 5,900,000 ₫ is given up. The 6,000,000 ₫ answer assumes the contract rate still applies to the months held. 3,000,000 ₫ halves the interest as a penalty. 200,000 ₫ applies the demand rate for a full twelve months.',
    },
    source: {
      url: 'https://kenh14.vn/rut-tien-tiet-kiem-giua-chung-ban-se-mat-bao-nhieu-lai-215251004185554376.chn',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q406',
    formulaId: 'gui-quay-vong',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Gửi 200 triệu ₫ trong 12 tháng: quay vòng hai kỳ 6 tháng lãi 5%/năm, so với gửi thẳng 12 tháng lãi 6%/năm. Chênh lệch là bao nhiêu?',
      en: 'Placing 200 million ₫ for 12 months: two rolling 6-month terms at 5% versus one 12-month term at 6%. What is the difference?',
    },
    facts: [
      {
        label: { vi: 'Số tiền gửi', en: 'Deposit' },
        value: { vi: '200.000.000 ₫', en: '200,000,000 ₫' },
      },
      {
        label: { vi: 'Kỳ ngắn', en: 'Short term' },
        value: { vi: '6 tháng, 5%/năm', en: '6 months at 5% a year' },
      },
      {
        label: { vi: 'Kỳ dài', en: 'Long term' },
        value: { vi: '12 tháng, 6%/năm', en: '12 months at 6% a year' },
      },
    ],
    choices: {
      a: { vi: 'Quay vòng kém hơn 1.875.000 ₫', en: 'Rolling is 1,875,000 ₫ worse' },
      b: { vi: 'Quay vòng hơn 1.875.000 ₫', en: 'Rolling is 1,875,000 ₫ better' },
      c: { vi: 'Quay vòng kém hơn 2.000.000 ₫', en: 'Rolling is 2,000,000 ₫ worse' },
      d: { vi: 'Hai cách bằng nhau', en: 'The two are equal' },
    },
    answer: 'a',
    verify: {
      inputs: {
        principal: 200000000,
        shortRate: 5,
        shortMonths: 6,
        longRate: 6,
        totalMonths: 12,
      },
      expected: -1875000,
      tolerance: 1,
    },
    explain: {
      vi: 'Quay vòng: kỳ đầu 200.000.000 nhân 2,5% bằng 5.000.000 ₫, tái gửi cả gốc lẫn lãi nên kỳ hai được 205.000.000 nhân 2,5% bằng 5.125.000 ₫, tổng cuối kỳ 210.125.000 ₫. Gửi thẳng 12 tháng: 200.000.000 nhân 6% bằng 12.000.000 ₫, tổng 212.000.000 ₫. Chênh 1.875.000 ₫ NGHIÊNG VỀ kỳ dài. Đáp án 2.000.000 ₫ là so thẳng 6% với 5% mà quên phần lãi kép của kỳ quay vòng. "Hai cách bằng nhau" là bỏ qua chênh lệch lãi suất giữa hai kỳ hạn. Quay vòng chỉ thắng khi lãi suất kỳ ngắn tăng lên ở lần tái gửi.',
      en: 'Rolling: the first term earns 200,000,000 times 2.5%, that is 5,000,000 ₫, and rolling principal plus interest means the second earns 205,000,000 times 2.5%, that is 5,125,000 ₫, ending at 210,125,000 ₫. The 12-month term: 200,000,000 times 6% is 12,000,000 ₫, ending at 212,000,000 ₫. The 1,875,000 ₫ gap FAVORS the long term. The 2,000,000 ₫ answer compares 6% with 5% directly, missing the compounding inside the rolling option. Equal ignores the rate difference between terms entirely. Rolling only wins if the short rate rises by the time it is renewed.',
    },
    source: {
      url: 'https://en.wikipedia.org/wiki/Certificate_of_deposit',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q407',
    formulaId: 'gia-von-trung-binh-dca',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Mua ba lần, mỗi lần 12 triệu ₫, ở các mức giá 60.000 ₫, 40.000 ₫ và 30.000 ₫. Giá vốn trung bình bằng bao nhiêu?',
      en: 'Three purchases of 12 million ₫ each at 60,000 ₫, 40,000 ₫ and 30,000 ₫. What is the average cost?',
    },
    facts: [
      {
        label: { vi: 'Lần 1', en: 'Purchase 1' },
        value: { vi: '12.000.000 ₫ ở giá 60.000 ₫', en: '12,000,000 ₫ at 60,000 ₫' },
      },
      {
        label: { vi: 'Lần 2', en: 'Purchase 2' },
        value: { vi: '12.000.000 ₫ ở giá 40.000 ₫', en: '12,000,000 ₫ at 40,000 ₫' },
      },
      {
        label: { vi: 'Lần 3', en: 'Purchase 3' },
        value: { vi: '12.000.000 ₫ ở giá 30.000 ₫', en: '12,000,000 ₫ at 30,000 ₫' },
      },
    ],
    choices: {
      a: { vi: '40.000 ₫', en: '40,000 ₫' },
      b: { vi: '43.333 ₫', en: '43,333 ₫' },
      c: { vi: '36.000.000 ₫', en: '36,000,000 ₫' },
      d: { vi: '30.000 ₫', en: '30,000 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: {
        amount1: 12000000,
        price1: 60000,
        amount2: 12000000,
        price2: 40000,
        amount3: 12000000,
        price3: 30000,
      },
      expected: 40000,
      tolerance: 1,
    },
    explain: {
      vi: 'Tính theo SỐ CỔ PHIẾU mua được chứ không theo giá: 12 triệu chia 60.000 được 200 CP, chia 40.000 được 300 CP, chia 30.000 được 400 CP, tổng 900 CP cho 36.000.000 ₫, ra giá vốn 40.000 ₫. Đáp án 43.333 ₫ là trung bình CỘNG ba mức giá, và nó luôn CAO hơn giá vốn thật khi số tiền mỗi lần bằng nhau, vì tiền cố định mua được nhiều cổ phiếu hơn ở vùng giá thấp. Đó chính là cơ chế của DCA. 36.000.000 ₫ là tổng tiền đã bỏ ra. 30.000 ₫ là lấy mức giá thấp nhất.',
      en: 'Work from the SHARES bought, not from the prices: 12 million over 60,000 is 200 shares, over 40,000 is 300, over 30,000 is 400, totalling 900 shares for 36,000,000 ₫, an average cost of 40,000 ₫. The 43,333 ₫ answer is the ARITHMETIC mean of the three prices, and it always sits ABOVE the true average cost when the amounts are equal, because a fixed sum buys more shares at lower prices. That is the mechanism of DCA. 36,000,000 ₫ is the total invested. 30,000 ₫ is simply the lowest price.',
    },
    source: {
      url: 'https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q408',
    formulaId: 'so-ky-dca',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Mỗi tháng bỏ vào 10 triệu ₫, lợi suất kỳ vọng 12%/năm, mục tiêu 240 triệu ₫. Cần bao nhiêu tháng?',
      en: 'Contributing 10 million ₫ a month at an expected 12% a year toward a 240 million ₫ target. How many months?',
    },
    facts: [
      {
        label: { vi: 'Mục tiêu', en: 'Target' },
        value: { vi: '240.000.000 ₫', en: '240,000,000 ₫' },
      },
      {
        label: { vi: 'Bỏ vào mỗi tháng', en: 'Monthly contribution' },
        value: { vi: '10.000.000 ₫', en: '10,000,000 ₫' },
      },
      {
        label: { vi: 'Lợi suất kỳ vọng', en: 'Expected return' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
    ],
    choices: {
      a: { vi: '22 tháng', en: '22 months' },
      b: { vi: '24 tháng', en: '24 months' },
      c: { vi: '20 tháng', en: '20 months' },
      d: { vi: '27 tháng', en: '27 months' },
    },
    answer: 'a',
    verify: {
      inputs: { target: 240000000, contribution: 10000000, rate: 12 },
      expected: 22,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Không có lợi suất thì cần đúng 24 tháng (240 chia 10). Có lợi suất 1% mỗi tháng, tiền bỏ vào sớm sinh lời thêm nên về đích sớm hơn: 22 tháng. Đáp án 24 tháng là bỏ qua phần sinh lời — nó cũng là con số ĐÚNG khi lợi suất bằng 0, nên hay bị chọn theo thói quen. 20 tháng là tính lợi suất cho cả 240 triệu ngay từ tháng đầu, trong khi số dư mới tích dần. 27 tháng thì lâu hơn cả phương án không lợi suất, không có cách tính nào dẫn tới đó.',
      en: 'With no return it takes exactly 24 months (240 over 10). At 1% a month the early contributions earn, so the target arrives sooner: 22 months. The 24-month answer ignores the return, and it is also the CORRECT answer at zero return, which is why it gets picked out of habit. 20 months applies the return to the full 240 million from month one, when the balance is still building. 27 months is slower than saving with no return at all, which no calculation produces.',
    },
    source: {
      url: 'https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf',
      kind: 'giao-khoa',
      vietnam: false,
    },
  },
  {
    id: 'Q409',
    formulaId: 'thue-tncn-dau-tu',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Trong năm bạn bán 1.000 cổ phiếu ở giá 60.000 ₫ và nhận cổ tức 3.000 ₫/CP. Tổng thuế TNCN phải nộp là bao nhiêu?',
      en: 'In one year you sell 1,000 shares at 60,000 ₫ and receive a 3,000 ₫ dividend a share. What is the total personal income tax?',
    },
    facts: [
      {
        label: { vi: 'Khối lượng bán', en: 'Quantity sold' },
        value: { vi: '1.000 CP', en: '1,000 shares' },
      },
      { label: { vi: 'Giá bán', en: 'Sell price' }, value: { vi: '60.000 ₫', en: '60,000 ₫' } },
      {
        label: { vi: 'Cổ tức tiền mặt', en: 'Cash dividend' },
        value: { vi: '3.000 ₫/CP', en: '3,000 ₫ a share' },
      },
    ],
    choices: {
      a: { vi: '210.000 ₫', en: '210,000 ₫' },
      b: { vi: '60.000 ₫', en: '60,000 ₫' },
      c: { vi: '150.000 ₫', en: '150,000 ₫' },
      d: { vi: '315.000 ₫', en: '315,000 ₫' },
    },
    answer: 'a',
    verify: {
      inputs: { quantity: 1000, sellPrice: 60000, dividendPerShare: 3000 },
      expected: 210000,
      tolerance: 1,
    },
    explain: {
      vi: 'Hai khoản thuế RIÊNG BIỆT, mỗi khoản có cơ sở tính và thuế suất riêng. Thuế chuyển nhượng: 60.000.000 nhân 0,1% bằng 60.000 ₫, tính trên giá trị bán. Thuế cổ tức: 3.000.000 nhân 5% bằng 150.000 ₫, tính trên cổ tức nhận được. Tổng 210.000 ₫. Đáp án 60.000 ₫ và 150.000 ₫ mỗi đáp án chỉ lấy một vế. 315.000 ₫ là áp nhầm 5% lên cả giá trị bán. Hai khoản này không bù trừ cho nhau và cũng không phụ thuộc vào việc lệnh bán lãi hay lỗ.',
      en: 'Two SEPARATE taxes, each with its own base and rate. Transfer tax: 60,000,000 times 0.1% is 60,000 ₫, charged on sale value. Dividend tax: 3,000,000 times 5% is 150,000 ₫, charged on the dividend received. Together 210,000 ₫. The 60,000 ₫ and 150,000 ₫ answers each take one side only. 315,000 ₫ applies 5% to the sale value as well. The two do not offset each other and neither depends on whether the sale was at a profit or a loss.',
    },
    source: {
      url: 'https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Luat-Thue-thu-nhap-ca-nhan-2025-so-109-2025-QH15-665870.aspx',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q410',
    formulaId: 'diem-hoa-von',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, phải bán bao nhiêu sản phẩm mới hoà vốn?',
      en: 'With the figures below, how many units must be sold to break even?',
    },
    facts: [
      {
        label: { vi: 'Chi phí cố định', en: 'Fixed cost' },
        value: { vi: '600.000.000 ₫', en: '600,000,000 ₫' },
      },
      {
        label: { vi: 'Giá bán một sản phẩm', en: 'Unit price' },
        value: { vi: '50.000 ₫', en: '50,000 ₫' },
      },
      {
        label: { vi: 'Biến phí một sản phẩm', en: 'Unit variable cost' },
        value: { vi: '20.000 ₫', en: '20,000 ₫' },
      },
    ],
    choices: {
      a: { vi: '20.000 sản phẩm', en: '20,000 units' },
      b: { vi: '12.000 sản phẩm', en: '12,000 units' },
      c: { vi: '30.000 sản phẩm', en: '30,000 units' },
      d: { vi: '8.571 sản phẩm', en: '8,571 units' },
    },
    answer: 'a',
    verify: {
      inputs: { fixedCost: 600000000, unitPrice: 50000, variableCost: 20000 },
      expected: 20000,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Mỗi sản phẩm bán ra đóng góp 50.000 trừ 20.000 bằng 30.000 ₫ vào việc bù chi phí cố định. 600.000.000 chia 30.000 bằng 20.000 sản phẩm. Đáp án 12.000 sản phẩm là chia cho GIÁ BÁN, tức quên trừ biến phí. 30.000 sản phẩm là chia cho biến phí. 8.571 sản phẩm là chia cho tổng 50.000 cộng 20.000. Mô hình này giả định giá bán và biến phí đơn vị không đổi ở mọi mức sản lượng, và chỉ có MỘT sản phẩm — đa sản phẩm là chỗ nó gãy.',
      en: 'Each unit sold contributes 50,000 minus 20,000, that is 30,000 ₫ toward covering fixed costs. 600,000,000 over 30,000 is 20,000 units. The 12,000 answer divides by the SELLING price, forgetting to net off variable cost. 30,000 divides by the variable cost. 8,571 divides by 50,000 plus 20,000. The model assumes the selling price and unit variable cost hold at every output level and that there is a SINGLE product, and multiple products is where it breaks.',
    },
    source: {
      url: 'https://knowledge.sapp.edu.vn/knowledge/acca-f5-lesson-4-ph%C3%A2n-t%C3%ADch-m%E1%BB%91i-quan-h%E1%BB%87-chi-ph%C3%AD-s%E1%BA%A3n-l%C6%B0%E1%BB%A3ng-l%E1%BB%A3i-nhu%E1%BA%ADn-cost-volume-profit-analysis',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
  {
    id: 'Q411',
    formulaId: 'don-bay-tong-hop',
    format: 'trac-nghiem',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, đòn bẩy tổng hợp (DTL) bằng bao nhiêu?',
      en: 'With the figures below, what is the degree of total leverage (DTL)?',
    },
    facts: [
      {
        label: { vi: 'Doanh thu', en: 'Revenue' },
        value: { vi: '2.000.000.000 ₫', en: '2,000,000,000 ₫' },
      },
      {
        label: { vi: 'Biến phí', en: 'Variable cost' },
        value: { vi: '1.200.000.000 ₫', en: '1,200,000,000 ₫' },
      },
      {
        label: { vi: 'Chi phí cố định', en: 'Fixed cost' },
        value: { vi: '400.000.000 ₫', en: '400,000,000 ₫' },
      },
      {
        label: { vi: 'Chi phí lãi vay', en: 'Interest expense' },
        value: { vi: '200.000.000 ₫', en: '200,000,000 ₫' },
      },
    ],
    choices: {
      a: { vi: '4,0 lần', en: '4.0x' },
      b: { vi: '2,0 lần', en: '2.0x' },
      c: { vi: '1,0 lần', en: '1.0x' },
      d: { vi: '8,0 lần', en: '8.0x' },
    },
    answer: 'a',
    verify: {
      inputs: {
        revenue: 2000000000,
        variableCost: 1200000000,
        fixedCost: 400000000,
        interest: 200000000,
      },
      expected: 4,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Số dư đảm phí là 2.000 trừ 1.200 bằng 800 triệu; EBIT là 800 trừ 400 bằng 400 triệu. DOL bằng 800 chia 400 tức 2,0 lần; DFL bằng EBIT chia (EBIT trừ lãi vay), tức 400 chia 200 bằng 2,0 lần. Đòn bẩy tổng hợp là TÍCH của hai: 2,0 nhân 2,0 bằng 4,0 lần, nghĩa là doanh thu nhích 1% thì lợi nhuận sau lãi vay đổi 4%. Đáp án 2,0 lần là mới lấy một trong hai vế. 1,0 lần là lấy tỷ lệ DOL trên DFL. 8,0 lần là cộng rồi nhân nhầm.',
      en: 'Contribution margin is 2,000 minus 1,200, that is 800 million; EBIT is 800 minus 400, that is 400 million. DOL is 800 over 400, that is 2.0x; DFL is EBIT over (EBIT minus interest), 400 over 200, also 2.0x. Total leverage is the PRODUCT of the two: 2.0 times 2.0 is 4.0x, meaning a 1% move in revenue swings post-interest profit by 4%. The 2.0x answer takes one factor only. 1.0x is the ratio of DOL to DFL. 8.0x mixes an addition into the multiplication.',
    },
    source: {
      url: 'https://amis.misa.vn/27215/don-bay-trong-kinh-doanh/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
];
