import type { QuizItem } from '../types';

/**
 * Câu TÍNH TOÁN — mở ngày 24/09/2026 theo yêu cầu chủ dự án.
 *
 * "Hiện tại toàn bộ bài kiểm tra đang chỉ có liên quan đến lý thuyết mà không có thực hành → bài
 * kiểm tra cần phải có liên quan đến phép tính công thức bên trên rồi bên dưới là các đáp án để
 * người dùng chọn." Đo lại lúc ấy: 345 câu thì 306 câu không có bảng số liệu nào, và chỉ 3 câu
 * trắc nghiệm bắt người học tính thật.
 *
 * ── 25/09/2026: đổi từ BỐN LỰA CHỌN sang ĐIỀN SỐ ─────────────────────────────────────────────
 *
 * Chủ dự án: "việc đưa ra các ô để nhập vào giống như tôi yêu cầu thì bạn chưa sửa, vẫn để chọn
 * các số liệu ABCD". Cả 66 câu nay là câu điền số: người học đặt số liệu của bảng vào ô trống trong
 * chính công thức của trang. Hằng số (× 100, 10^9, biểu phí 0,15%, hệ số 100.000 ₫ mỗi điểm) hiện
 * sẵn; khi đặt đủ số liệu sẽ vượt năm ô thì một đại lượng được viết sẵn (tổng nguồn vốn 1.000 ở
 * WACC, số cổ phiếu ở định giá FCFF, khối lượng 1.000 ở giá hoà vốn, tiền mua 12 triệu ở DCA) — và
 * đề bài nói ra điều ấy.
 *
 * ── Bốn quy tắc của nhóm câu này ─────────────────────────────────────────────────────────────
 *
 * 1. **Kết quả do `calc` của sản phẩm tính ra, không do người soạn tính tay.** Mỗi câu vẫn khai
 *    `verify` (xem docblock `QuizVerify`) và `quiz.test.ts` chạy `runFormula` với đúng bộ số liệu
 *    ấy — đổi dạng không được làm mất cửa gác này. Dòng công thức thì qua cửa gác riêng của câu điền
 *    số: bóc ngoặc tính lại phải ra `expected`.
 * 2. **Lời giải gọi tên những lỗi CÓ THẬT.** Chia ngược tử với mẫu, quên đổi tỷ đồng sang đồng,
 *    quên nhân 100, quên lá chắn thuế, dừng ở bước giữa. Đó vốn là ba đáp án sai của dạng cũ; nay
 *    lời giải dẫn chúng theo kết quả sai mà mỗi lỗi sinh ra.
 * 3. **Số liệu chọn cho tính nhẩm ra số tròn.** Người học phải kiểm lại được bằng giấy bút, chứ
 *    không phải bấm máy rồi tin.
 * 4. **Tầng bằng chứng là `tinh-toan`, không phải `ngo-nhan`.** Lời giải của một phép tính không
 *    trích ai cả, nó dẫn lại chính phép tính — nên ca kiểm "trích nguyên văn" không áp vào đây.
 *    Đường dẫn nguồn vẫn bắt buộc và trỏ tới trang định nghĩa công thức, đúng trang mà những câu
 *    lý thuyết của công thức ấy đang dùng.
 *
 * Q388 (IRR niên kim) khác một chỗ: IRR không có công thức tính thẳng, nên câu cho SẴN IRR mà máy
 * tính tài chính dò ra, người học đặt khoản thu mỗi kỳ và số kỳ vào phương trình niên kim, và kết
 * quả là số vốn bỏ ra — cách kiểm một IRR, cùng lối câu XIRR Q473 đã làm. `expected` của nó vì thế
 * khác `verify.expected` (IRR mà `calc` trả về).
 *
 * KHÔNG dùng được `verify` cho công thức ăn chuỗi giá: chuỗi đi trong `CalcContext` chứ không
 * trong `inputs`. Những công thức ấy có câu điền số riêng ở `thuc-hanh.ts` (Q454–Q473).
 */
export const TINH_TOAN: ReadonlyArray<QuizItem> = [
  {
    id: 'Q346',
    formulaId: 'pe',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức P/E, chú ý con số nào nằm ở tử số.',
      en: 'With the figures below, put the right two numbers into the slots of the P/E formula, noting which one sits in the numerator.',
    },
    facts: [
      {
        label: { vi: 'Giá thị trường', en: 'Market price' },
        value: { vi: '64.000 ₫', en: '64000 ₫' },
      },
      {
        label: { vi: 'EPS bốn quý gần nhất', en: 'Trailing EPS' },
        value: { vi: '4.000 ₫', en: '4000 ₫' },
      },
    ],
    expected: 16,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: { vi: 'P/E = [64.000] ÷ [4.000]', en: 'P/E = [64000] ÷ [4000]' },
    verify: { inputs: { price: 64000, eps: 4000 }, expected: 16, tolerance: 0.01 },
    explain: {
      vi: '64.000 chia 4.000 bằng 16,0 lần: nhà đầu tư đang trả 16 đồng cho mỗi đồng lợi nhuận một năm. Ba kết quả sai hay gặp: 0,06 lần là chia ngược, lấy EPS chia giá, và đó là tỷ suất lợi nhuận trên giá (E/P) chứ không phải P/E. 60.000 ₫ là lấy hiệu hai con số thay vì lấy thương. 16,0% sai đơn vị: P/E là số LẦN, không phải phần trăm.',
      en: '64,000 divided by 4,000 is 16.0x: the investor is paying 16 for each unit of annual earnings. Three common wrong results: 0.06x inverts the ratio, EPS over price, which is the earnings yield (E/P) rather than P/E. 60,000 ₫ subtracts instead of dividing. 16.0% has the wrong unit: P/E is a MULTIPLE, not a percentage.',
    },
    giai: {
      tinh: { vi: 'hệ số giá trên lợi nhuận', en: 'Price to earnings ratio' },
      thaySo: { vi: '64.000 ÷ 4.000', en: '64000 ÷ 4000' },
      ketQua: { vi: '16,0 lần', en: '16.0x' },
      gan: [
        { kyHieu: 'P', giaTri: { vi: '64.000', en: '64000' } },
        { kyHieu: 'EPS', giaTri: { vi: '4.000', en: '4000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức P/B, chú ý con số nào nằm ở tử số.',
      en: 'With the figures below, put the right two numbers into the slots of the P/B formula, noting which one sits in the numerator.',
    },
    facts: [
      {
        label: { vi: 'Giá thị trường', en: 'Market price' },
        value: { vi: '64.000 ₫', en: '64000 ₫' },
      },
      {
        label: { vi: 'Giá trị sổ sách mỗi cổ phiếu', en: 'Book value per share' },
        value: { vi: '25.600 ₫', en: '25600 ₫' },
      },
    ],
    expected: 2.5,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: { vi: 'P/B = [64.000] ÷ [25.600]', en: 'P/B = [64000] ÷ [25600]' },
    verify: { inputs: { price: 64000, bookValuePerShare: 25600 }, expected: 2.5, tolerance: 0.01 },
    explain: {
      vi: '64.000 chia 25.600 bằng 2,5 lần: thị trường đang trả gấp 2,5 lần giá trị sổ sách. 0,4 lần là chia ngược. 38.400 ₫ là phần chênh giữa giá và giá trị sổ sách, tức lấy hiệu thay vì lấy thương, và nó vẫn mang đơn vị tiền nên không thể là một hệ số. 2,5% sai đơn vị: P/B là số lần.',
      en: '64,000 divided by 25,600 is 2.5x: the market is paying 2.5 times book value. 0.4x inverts the ratio. 38,400 ₫ is the gap between price and book value, a subtraction instead of a division, and it still carries a money unit so it cannot be a multiple. 2.5% has the wrong unit: P/B is a multiple.',
    },
    giai: {
      tinh: { vi: 'hệ số giá trên giá trị sổ sách', en: 'Price to book ratio' },
      thaySo: { vi: '64.000 ÷ 25.600', en: '64000 ÷ 25600' },
      ketQua: { vi: '2,5 lần', en: '2.5x' },
      gan: [
        { kyHieu: 'P', giaTri: { vi: '64.000', en: '64000' } },
        { kyHieu: 'BVPS', giaTri: { vi: '25.600', en: '25600' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức EPS cơ bản. Chú ý lợi nhuận ghi bằng tỷ đồng còn EPS ra đồng, và hệ số 10^9 trong công thức đã lo phần đổi đơn vị ấy.',
      en: 'With the figures below, put the right three numbers into the slots of the basic EPS formula. Note that profit is in billions of dong while EPS comes out in dong, and the 10^9 factor in the formula already handles that conversion.',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận sau thuế', en: 'Net income' },
        value: { vi: '6.000 tỷ ₫', en: '6000 billion ₫' },
      },
      { label: { vi: 'Cổ tức ưu đãi', en: 'Preferred dividend' }, value: { vi: '0 ₫', en: '0 ₫' } },
      {
        label: { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
        value: { vi: '1.500.000.000 CP', en: '1500000000 shares' },
      },
    ],
    expected: 4000,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'EPS = ([6.000] − [0]) ÷ [1.500.000.000] × 10^9',
      en: 'EPS = ([6000] − [0]) ÷ [1500000000] × 10^9',
    },
    verify: {
      inputs: { netIncome: 6000, preferredDividend: 0, sharesOutstanding: 1500000000 },
      expected: 4000,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Lợi nhuận ghi bằng TỶ đồng còn kết quả phải ra ĐỒNG, nên phải đổi đơn vị: 6.000 tỷ là 6.000.000.000.000 ₫, chia cho 1,5 tỷ cổ phiếu ra 4.000 ₫. Kết quả 4 ₫ chính là quên bước đổi ấy, lấy thẳng 6.000 chia 1.500 triệu. 0,25 ₫ là chia ngược. 9.000 tỷ ₫ là nhân thay vì chia, và một chỉ số tính trên MỘT cổ phiếu thì không thể lớn hơn cả lợi nhuận của doanh nghiệp.',
      en: 'Profit is stated in BILLIONS while the result must be in dong, so the unit has to be converted: 6,000 billion is 6,000,000,000,000 ₫, divided by 1.5 billion shares gives 4,000 ₫. A result of 4 ₫ is exactly that conversion forgotten, dividing 6,000 by 1,500 million directly. 0.25 ₫ inverts the ratio. 9,000 billion ₫ multiplies instead of dividing, and a per-SHARE figure cannot exceed the profit of the whole company.',
    },
    giai: {
      tinh: { vi: 'EPS cơ bản', en: 'Basic earnings per share' },
      thaySo: { vi: '(6.000 − 0) ÷ 1.500.000.000 × 10^9', en: '(6000 − 0) ÷ 1500000000 × 10^9' },
      ketQua: { vi: '4.000 ₫', en: '4000 ₫' },
      gan: [
        { kyHieu: '\\text{LNST}', giaTri: { vi: '6.000', en: '6000' } },
        { kyHieu: '\\text{Cổ tức ưu đãi}', giaTri: { vi: '0 ₫', en: '0 ₫' } },
        { kyHieu: '\\text{Số CP lưu hành}', giaTri: { vi: '1.500.000.000', en: '1500000000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức BVPS. Chú ý vốn chủ ghi bằng tỷ đồng, hệ số 10^9 đổi nó ra đồng.',
      en: 'With the figures below, put the right two numbers into the slots of the BVPS formula. Note that equity is in billions of dong; the 10^9 factor converts it to dong.',
    },
    facts: [
      {
        label: { vi: 'Vốn chủ sở hữu', en: 'Shareholders equity' },
        value: { vi: '30.000 tỷ ₫', en: '30000 billion ₫' },
      },
      {
        label: { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
        value: { vi: '1.500.000.000 CP', en: '1500000000 shares' },
      },
    ],
    expected: 20000,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'BVPS = [30.000] ÷ [1.500.000.000] × 10^9',
      en: 'BVPS = [30000] ÷ [1500000000] × 10^9',
    },
    verify: {
      inputs: { equity: 30000, sharesOutstanding: 1500000000 },
      expected: 20000,
      tolerance: 0.5,
    },
    explain: {
      vi: '30.000 tỷ ₫ là 30.000.000.000.000 ₫, chia cho 1,5 tỷ cổ phiếu ra 20.000 ₫ mỗi cổ phiếu. Kết quả 20 ₫ là quên đổi tỷ đồng sang đồng, đúng cái bẫy đơn vị mà EPS cũng mắc. 0,05 ₫ là chia ngược. 45.000 tỷ ₫ là nhân thay vì chia. Mẹo tự soát: BVPS phải cùng cỡ với thị giá, một con số 20 ₫ hay 45.000 tỷ ₫ đều không thể là giá của một cổ phiếu.',
      en: '30,000 billion ₫ is 30,000,000,000,000 ₫, divided by 1.5 billion shares gives 20,000 ₫ per share. A result of 20 ₫ skips the billion-to-dong conversion, the same unit trap EPS has. 0.05 ₫ inverts the ratio. 45,000 billion ₫ multiplies instead of dividing. A quick self-check: BVPS should be in the same range as the share price, and neither 20 ₫ nor 45,000 billion ₫ could be the value of one share.',
    },
    giai: {
      tinh: { vi: 'giá trị sổ sách mỗi cổ phiếu', en: 'Book value per share' },
      thaySo: { vi: '30.000 ÷ 1.500.000.000 × 10^9', en: '30000 ÷ 1500000000 × 10^9' },
      ketQua: { vi: '20.000 ₫', en: '20000 ₫' },
      gan: [
        { kyHieu: '\\text{Vốn chủ sở hữu}', giaTri: { vi: '30.000', en: '30000' } },
        { kyHieu: '\\text{Số CP lưu hành}', giaTri: { vi: '1.500.000.000', en: '1500000000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức ROE, chú ý mẫu số là vốn chủ sở hữu.',
      en: 'With the figures below, put the right two numbers into the slots of the ROE formula, noting that the denominator is shareholders equity.',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận sau thuế', en: 'Net income' },
        value: { vi: '6.000 tỷ ₫', en: '6000 billion ₫' },
      },
      {
        label: { vi: 'Vốn chủ sở hữu', en: 'Shareholders equity' },
        value: { vi: '30.000 tỷ ₫', en: '30000 billion ₫' },
      },
    ],
    expected: 20,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: { vi: 'ROE = [6.000] ÷ [30.000] × 100', en: 'ROE = [6000] ÷ [30000] × 100' },
    verify: { inputs: { netIncome: 6000, equity: 30000 }, expected: 20, tolerance: 0.01 },
    explain: {
      vi: '6.000 chia 30.000 bằng 0,2, nhân 100 ra 20%: mỗi 100 đồng vốn chủ sở hữu tạo ra 20 đồng lợi nhuận trong năm. Kết quả 0,2% là quên bước nhân 100. 500% là chia ngược, lấy vốn chủ chia lợi nhuận. 24.000 tỷ ₫ là lấy hiệu hai con số, và kết quả vẫn mang đơn vị tiền nên không thể là một tỷ suất. Hai con số cùng đơn vị tỷ đồng nên ở đây KHÔNG phải đổi đơn vị.',
      en: '6,000 divided by 30,000 is 0.2, times 100 gives 20%: every 100 of equity produced 20 of profit over the year. A result of 0.2% forgets the times-100 step. 500% inverts the ratio, equity over profit. 24,000 billion ₫ subtracts, and the result still carries a money unit so it cannot be a rate of return. Both inputs are already in billions, so no unit conversion is needed here.',
    },
    giai: {
      tinh: { vi: 'tỷ suất sinh lời trên vốn chủ', en: 'Return on equity' },
      thaySo: { vi: '6.000 ÷ 30.000 × 100', en: '6000 ÷ 30000 × 100' },
      ketQua: { vi: '20%', en: '20%' },
      gan: [
        { kyHieu: '\\text{LNST}', giaTri: { vi: '6.000', en: '6000' } },
        { kyHieu: '\\text{Vốn chủ sở hữu}', giaTri: { vi: '30.000 tỷ ₫', en: '30000 billion ₫' } },
      ],
    },
    source: { url: 'https://cophieux.com/chi-so-roe/', kind: 'giao-khoa', vietnam: true },
  },
  {
    id: 'Q351',
    formulaId: 'roa',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức ROA, chú ý mẫu số là tổng tài sản.',
      en: 'With the figures below, put the right two numbers into the slots of the ROA formula, noting that the denominator is total assets.',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận sau thuế', en: 'Net income' },
        value: { vi: '6.000 tỷ ₫', en: '6000 billion ₫' },
      },
      {
        label: { vi: 'Tổng tài sản', en: 'Total assets' },
        value: { vi: '75.000 tỷ ₫', en: '75000 billion ₫' },
      },
    ],
    expected: 8,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: { vi: 'ROA = [6.000] ÷ [75.000] × 100', en: 'ROA = [6000] ÷ [75000] × 100' },
    verify: { inputs: { netIncome: 6000, totalAssets: 75000 }, expected: 8, tolerance: 0.01 },
    explain: {
      vi: '6.000 chia 75.000 bằng 0,08, nhân 100 ra 8%: mỗi 100 đồng tài sản tạo ra 8 đồng lợi nhuận. Kết quả 0,08% là quên nhân 100. 8 lần sai đơn vị, ROA là một tỷ suất phần trăm chứ không phải hệ số. 69.000 tỷ ₫ là lấy hiệu. So với ROE 20% ở cùng doanh nghiệp, ROA luôn thấp hơn vì mẫu số là tổng tài sản, gồm cả phần tài trợ bằng nợ.',
      en: '6,000 divided by 75,000 is 0.08, times 100 gives 8%: every 100 of assets produced 8 of profit. A result of 0.08% forgets the times-100 step. 8x has the wrong unit, ROA is a percentage rate, not a multiple. 69,000 billion ₫ subtracts. Compared with a 20% ROE at the same company, ROA is always lower because the denominator is total assets, including the part funded by debt.',
    },
    giai: {
      tinh: { vi: 'tỷ suất sinh lời trên tài sản', en: 'Return on assets' },
      thaySo: { vi: '6.000 ÷ 75.000 × 100', en: '6000 ÷ 75000 × 100' },
      ketQua: { vi: '8%', en: '8%' },
      gan: [
        { kyHieu: '\\text{LNST}', giaTri: { vi: '6.000', en: '6000' } },
        { kyHieu: '\\text{Tổng tài sản}', giaTri: { vi: '75.000 tỷ ₫', en: '75000 billion ₫' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức biên lợi nhuận ròng, chú ý mẫu số là doanh thu thuần.',
      en: 'With the figures below, put the right two numbers into the slots of the net profit margin formula, noting that the denominator is net revenue.',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận sau thuế', en: 'Net income' },
        value: { vi: '6.000 tỷ ₫', en: '6000 billion ₫' },
      },
      {
        label: { vi: 'Doanh thu thuần', en: 'Net revenue' },
        value: { vi: '50.000 tỷ ₫', en: '50000 billion ₫' },
      },
    ],
    expected: 12,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: { vi: 'ROS = [6.000] ÷ [50.000] × 100', en: 'ROS = [6000] ÷ [50000] × 100' },
    verify: { inputs: { netIncome: 6000, revenue: 50000 }, expected: 12, tolerance: 0.01 },
    explain: {
      vi: '6.000 chia 50.000 bằng 0,12, nhân 100 ra 12%: cứ 100 đồng doanh thu thì giữ lại được 12 đồng lợi nhuận sau khi trừ hết chi phí và thuế. Kết quả 0,12% là quên nhân 100. 8,33 lần là chia ngược, lấy doanh thu chia lợi nhuận. 44.000 tỷ ₫ là lấy hiệu, tức tổng chi phí và thuế, chứ không phải biên lợi nhuận.',
      en: '6,000 divided by 50,000 is 0.12, times 100 gives 12%: every 100 of revenue leaves 12 of profit after all costs and tax. A result of 0.12% forgets the times-100 step. 8.33x inverts the ratio, revenue over profit. 44,000 billion ₫ subtracts, giving total costs and tax rather than a margin.',
    },
    giai: {
      tinh: { vi: 'biên lợi nhuận ròng', en: 'Net profit margin' },
      thaySo: { vi: '6.000 ÷ 50.000 × 100', en: '6000 ÷ 50000 × 100' },
      ketQua: { vi: '12%', en: '12%' },
      gan: [
        { kyHieu: '\\text{LNST}', giaTri: { vi: '6.000', en: '6000' } },
        { kyHieu: '\\text{Doanh thu thuần}', giaTri: { vi: '50.000 tỷ ₫', en: '50000 billion ₫' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức biên lợi nhuận gộp, chú ý doanh thu thuần xuất hiện hai lần, ở tử số và ở mẫu số.',
      en: 'With the figures below, put the right three numbers into the slots of the gross profit margin formula, noting that net revenue appears twice, in the numerator and in the denominator.',
    },
    facts: [
      {
        label: { vi: 'Doanh thu thuần', en: 'Net revenue' },
        value: { vi: '50.000 tỷ ₫', en: '50000 billion ₫' },
      },
      {
        label: { vi: 'Giá vốn hàng bán', en: 'Cost of goods sold' },
        value: { vi: '32.500 tỷ ₫', en: '32500 billion ₫' },
      },
    ],
    expected: 35,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Biên gộp = ([50.000] − [32.500]) ÷ [50.000] × 100',
      en: 'Gross margin = ([50000] − [32500]) ÷ [50000] × 100',
    },
    verify: { inputs: { revenue: 50000, cogs: 32500 }, expected: 35, tolerance: 0.01 },
    explain: {
      vi: 'Lợi nhuận gộp bằng 50.000 trừ 32.500 tức 17.500, chia cho doanh thu 50.000 ra 0,35, nhân 100 thành 35%. Kết quả 65% là tỷ lệ giá vốn trên doanh thu, tức phần bù của kết quả đúng. 53,85% là chia lợi nhuận gộp cho GIÁ VỐN thay vì cho doanh thu, một lỗi đổi mẫu số hay gặp. 17.500 tỷ ₫ là dừng ở bước giữa: đó là lợi nhuận gộp, chưa phải biên.',
      en: 'Gross profit is 50,000 minus 32,500, that is 17,500, divided by revenue of 50,000 gives 0.35, times 100 makes 35%. A result of 65% is cost of goods sold over revenue, the complement of the right result. 53.85% divides gross profit by COST rather than by revenue, a common swap of denominator. 17,500 billion ₫ stops at the intermediate step: that is gross profit, not yet a margin.',
    },
    giai: {
      tinh: { vi: 'Biên lợi nhuận gộp', en: 'Gross profit margin' },
      thaySo: { vi: '(50.000 − 32.500) ÷ 50.000 × 100', en: '(50000 − 32500) ÷ 50000 × 100' },
      ketQua: { vi: '35%', en: '35%' },
      gan: [
        { kyHieu: '\\text{Doanh thu}', giaTri: { vi: '50.000', en: '50000' } },
        { kyHieu: '\\text{Giá vốn}', giaTri: { vi: '32.500', en: '32500' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức D/E, chú ý con số nào nằm ở tử số.',
      en: 'With the figures below, put the right two numbers into the slots of the D/E formula, noting which one sits in the numerator.',
    },
    facts: [
      {
        label: { vi: 'Tổng nợ phải trả', en: 'Total liabilities' },
        value: { vi: '45.000 tỷ ₫', en: '45000 billion ₫' },
      },
      {
        label: { vi: 'Vốn chủ sở hữu', en: 'Shareholders equity' },
        value: { vi: '30.000 tỷ ₫', en: '30000 billion ₫' },
      },
    ],
    expected: 1.5,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: { vi: 'D/E = [45.000] ÷ [30.000]', en: 'D/E = [45000] ÷ [30000]' },
    verify: { inputs: { totalLiabilities: 45000, equity: 30000 }, expected: 1.5, tolerance: 0.01 },
    explain: {
      vi: '45.000 chia 30.000 bằng 1,5 lần: doanh nghiệp vay 1,5 đồng cho mỗi đồng vốn chủ sở hữu. 0,67 lần là chia ngược. 60% là tỷ lệ nợ trên TỔNG NGUỒN VỐN (45.000 chia 75.000), một chỉ số khác hẳn tuy cùng nói về đòn bẩy, nên đọc kỹ mẫu số trước khi so sánh hai doanh nghiệp. 15.000 tỷ ₫ là lấy hiệu.',
      en: '45,000 divided by 30,000 is 1.5x: the company borrows 1.5 for every 1 of equity. 0.67x inverts the ratio. 60% is debt over TOTAL CAPITAL (45,000 over 75,000), a different measure of the same leverage, so check the denominator before comparing two companies. 15,000 billion ₫ subtracts.',
    },
    giai: {
      tinh: { vi: 'hệ số nợ trên vốn chủ', en: 'Debt to equity ratio' },
      thaySo: { vi: '45.000 ÷ 30.000', en: '45000 ÷ 30000' },
      ketQua: { vi: '1,5 lần', en: '1.5x' },
      gan: [
        {
          kyHieu: '\\text{Tổng nợ phải trả}',
          giaTri: { vi: '45.000 tỷ ₫', en: '45000 billion ₫' },
        },
        { kyHieu: '\\text{Vốn chủ sở hữu}', giaTri: { vi: '30.000 tỷ ₫', en: '30000 billion ₫' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức hệ số thanh toán hiện hành.',
      en: 'With the figures below, put the right two numbers into the slots of the current ratio formula.',
    },
    facts: [
      {
        label: { vi: 'Tài sản ngắn hạn', en: 'Current assets' },
        value: { vi: '36.000 tỷ ₫', en: '36000 billion ₫' },
      },
      {
        label: { vi: 'Nợ ngắn hạn', en: 'Current liabilities' },
        value: { vi: '24.000 tỷ ₫', en: '24000 billion ₫' },
      },
    ],
    expected: 1.5,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'Hệ số hiện hành = [36.000] ÷ [24.000]',
      en: 'Current ratio = [36000] ÷ [24000]',
    },
    verify: {
      inputs: { currentAssets: 36000, currentLiabilities: 24000 },
      expected: 1.5,
      tolerance: 0.01,
    },
    explain: {
      vi: '36.000 chia 24.000 bằng 1,5 lần: tài sản ngắn hạn đủ trả 1,5 lần số nợ đến hạn trong vòng một năm. 0,67 lần là chia ngược. 12.000 tỷ ₫ là lấy hiệu, và đó là VỐN LƯU ĐỘNG RÒNG, một con số có ý nghĩa riêng nhưng không phải hệ số thanh toán. 1,5% sai đơn vị.',
      en: '36,000 divided by 24,000 is 1.5x: current assets cover the liabilities falling due within a year 1.5 times over. 0.67x inverts the ratio. 12,000 billion ₫ subtracts, and that is NET WORKING CAPITAL, a meaningful figure of its own but not a liquidity ratio. 1.5% has the wrong unit.',
    },
    giai: {
      tinh: { vi: 'Hệ số thanh toán hiện hành', en: 'Current ratio' },
      thaySo: { vi: '36.000 ÷ 24.000', en: '36000 ÷ 24000' },
      ketQua: { vi: '1,5 lần', en: '1.5x' },
      gan: [
        {
          kyHieu: '\\text{Tài sản ngắn hạn}',
          giaTri: { vi: '36.000 tỷ ₫', en: '36000 billion ₫' },
        },
        { kyHieu: '\\text{Nợ ngắn hạn}', giaTri: { vi: '24.000 tỷ ₫', en: '24000 billion ₫' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức hệ số thanh toán nhanh, chú ý hàng tồn kho bị trừ ra khỏi tài sản ngắn hạn.',
      en: 'With the figures below, put the right three numbers into the slots of the quick ratio formula, noting that inventory is taken out of current assets.',
    },
    facts: [
      {
        label: { vi: 'Tài sản ngắn hạn', en: 'Current assets' },
        value: { vi: '36.000 tỷ ₫', en: '36000 billion ₫' },
      },
      {
        label: { vi: 'Hàng tồn kho', en: 'Inventory' },
        value: { vi: '12.000 tỷ ₫', en: '12000 billion ₫' },
      },
      {
        label: { vi: 'Nợ ngắn hạn', en: 'Current liabilities' },
        value: { vi: '24.000 tỷ ₫', en: '24000 billion ₫' },
      },
    ],
    expected: 1,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'Hệ số nhanh = ([36.000] − [12.000]) ÷ [24.000]',
      en: 'Quick ratio = ([36000] − [12000]) ÷ [24000]',
    },
    verify: {
      inputs: { currentAssets: 36000, inventory: 12000, currentLiabilities: 24000 },
      expected: 1,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Loại hàng tồn kho ra khỏi tài sản ngắn hạn trước: 36.000 trừ 12.000 bằng 24.000, chia cho nợ ngắn hạn 24.000 ra đúng 1,0 lần. Kết quả 1,5 lần là quên bước loại hàng tồn kho, và đó chính là hệ số thanh toán HIỆN HÀNH. 0,5 lần là lấy riêng hàng tồn kho chia nợ ngắn hạn. 24.000 tỷ ₫ là dừng ở tử số.',
      en: 'Strip inventory out of current assets first: 36,000 minus 12,000 is 24,000, divided by current liabilities of 24,000 gives exactly 1.0x. A result of 1.5x skips the inventory step, and that is the CURRENT ratio. 0.5x divides inventory alone by current liabilities. 24,000 billion ₫ stops at the numerator.',
    },
    giai: {
      tinh: { vi: 'Hệ số thanh toán nhanh', en: 'Quick ratio' },
      thaySo: { vi: '(36.000 − 12.000) ÷ 24.000', en: '(36000 − 12000) ÷ 24000' },
      ketQua: { vi: '1,0 lần', en: '1.0x' },
      gan: [
        {
          kyHieu: '\\text{Tài sản ngắn hạn}',
          giaTri: { vi: '36.000 tỷ ₫', en: '36000 billion ₫' },
        },
        { kyHieu: '\\text{Hàng tồn kho}', giaTri: { vi: '12.000 tỷ ₫', en: '12000 billion ₫' } },
        { kyHieu: '\\text{Nợ ngắn hạn}', giaTri: { vi: '24.000 tỷ ₫', en: '24000 billion ₫' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức vòng quay tổng tài sản.',
      en: 'With the figures below, put the right two numbers into the slots of the total asset turnover formula.',
    },
    facts: [
      {
        label: { vi: 'Doanh thu thuần', en: 'Net revenue' },
        value: { vi: '60.000 tỷ ₫', en: '60000 billion ₫' },
      },
      {
        label: { vi: 'Tổng tài sản', en: 'Total assets' },
        value: { vi: '75.000 tỷ ₫', en: '75000 billion ₫' },
      },
    ],
    expected: 0.8,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'vòng', en: 'x' },
    worked: {
      vi: 'Vòng quay tài sản = [60.000] ÷ [75.000]',
      en: 'Asset turnover = [60000] ÷ [75000]',
    },
    verify: { inputs: { revenue: 60000, totalAssets: 75000 }, expected: 0.8, tolerance: 0.01 },
    explain: {
      vi: '60.000 chia 75.000 bằng 0,8 vòng: mỗi đồng tài sản tạo ra 0,8 đồng doanh thu trong năm. 1,25 vòng là chia ngược. 80% sai đơn vị, đây là SỐ VÒNG quay chứ không phải một tỷ lệ phần trăm, và gọi nhầm tên thì cũng đọc nhầm ý nghĩa. 15.000 tỷ ₫ là lấy hiệu.',
      en: '60,000 divided by 75,000 is 0.8: each unit of assets generated 0.8 of revenue over the year. 1.25 inverts the ratio. 80% has the wrong unit, this is a TURNOVER count rather than a percentage, and the wrong name leads to the wrong reading. 15,000 billion ₫ subtracts.',
    },
    giai: {
      tinh: { vi: 'Vòng quay tổng tài sản', en: 'Total asset turnover' },
      thaySo: { vi: '60.000 ÷ 75.000', en: '60000 ÷ 75000' },
      ketQua: { vi: '0,8 vòng', en: '0.8x' },
      gan: [
        { kyHieu: '\\text{Doanh thu thuần}', giaTri: { vi: '60.000 tỷ ₫', en: '60000 billion ₫' } },
        { kyHieu: '\\text{Tổng tài sản}', giaTri: { vi: '75.000 tỷ ₫', en: '75000 billion ₫' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức hệ số chi trả cổ tức, chú ý con số nào nằm ở tử số.',
      en: 'With the figures below, put the right two numbers into the slots of the dividend payout ratio formula, noting which one sits in the numerator.',
    },
    facts: [
      {
        label: { vi: 'Cổ tức tiền mặt mỗi cổ phiếu', en: 'Cash dividend per share' },
        value: { vi: '1.500 ₫', en: '1500 ₫' },
      },
      { label: { vi: 'EPS', en: 'EPS' }, value: { vi: '5.000 ₫', en: '5000 ₫' } },
    ],
    expected: 30,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Hệ số chi trả = [1.500] ÷ [5.000] × 100',
      en: 'Payout ratio = [1500] ÷ [5000] × 100',
    },
    verify: { inputs: { dividendPerShare: 1500, eps: 5000 }, expected: 30, tolerance: 0.01 },
    explain: {
      vi: '1.500 chia 5.000 bằng 0,3, nhân 100 ra 30%: doanh nghiệp chia 30% lợi nhuận và giữ lại 70% để tái đầu tư. Kết quả 3,33 lần là chia ngược, và con số ấy có tên riêng là hệ số bao phủ cổ tức. 70% là phần GIỮ LẠI, phần bù của kết quả đúng. 0,3% là quên nhân 100.',
      en: '1,500 divided by 5,000 is 0.3, times 100 gives 30%: the company pays out 30% of earnings and retains 70% to reinvest. A result of 3.33x inverts the ratio, and that figure has its own name, dividend cover. 70% is the RETENTION rate, the complement of the right result. 0.3% forgets the times-100 step.',
    },
    giai: {
      tinh: { vi: 'Hệ số chi trả cổ tức', en: 'Dividend payout ratio' },
      thaySo: { vi: '1.500 ÷ 5.000 × 100', en: '1500 ÷ 5000 × 100' },
      ketQua: { vi: '30%', en: '30%' },
      gan: [
        { kyHieu: 'DPS', giaTri: { vi: '1.500', en: '1500' } },
        { kyHieu: 'EPS', giaTri: { vi: '5.000', en: '5000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức Enterprise Value, chú ý ô nào cộng vào và ô nào trừ ra.',
      en: 'With the figures below, put the right three numbers into the slots of the Enterprise Value formula, noting which slot is added and which is subtracted.',
    },
    facts: [
      {
        label: { vi: 'Vốn hoá thị trường', en: 'Market capitalization' },
        value: { vi: '12.000 tỷ ₫', en: '12000 billion ₫' },
      },
      {
        label: { vi: 'Tổng nợ vay', en: 'Total debt' },
        value: { vi: '5.000 tỷ ₫', en: '5000 billion ₫' },
      },
      {
        label: { vi: 'Tiền và tương đương tiền', en: 'Cash and equivalents' },
        value: { vi: '2.000 tỷ ₫', en: '2000 billion ₫' },
      },
    ],
    expected: 15000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: 'tỷ ₫', en: 'billion ₫' },
    worked: { vi: 'EV = [12.000] + [5.000] − [2.000]', en: 'EV = [12000] + [5000] − [2000]' },
    verify: {
      inputs: { marketCap: 12000, totalDebt: 5000, cash: 2000 },
      expected: 15000,
      tolerance: 1,
    },
    explain: {
      vi: 'Cộng nợ vay, TRỪ tiền mặt: 12.000 cộng 5.000 trừ 2.000 bằng 15.000 tỷ ₫. Dấu của tiền mặt là chỗ hay nhầm nhất, và lý do nó mang dấu trừ rất đơn giản: người mua đứt doanh nghiệp sẽ nhận luôn số tiền ấy, nên nó tự bù lại một phần giá mua. Kết quả 19.000 là cộng cả tiền mặt, 9.000 là trừ cả nợ vay, 12.000 là dừng ở vốn hoá, tức bỏ qua hẳn phần nợ.',
      en: 'Add debt, SUBTRACT cash: 12,000 plus 5,000 minus 2,000 is 15,000 billion ₫. The sign on cash is where mistakes cluster, and the reason for the minus is simple: whoever buys the whole company also receives that cash, so it offsets part of the price. A result of 19,000 adds cash, 9,000 subtracts debt too, and 12,000 stops at market capitalization, ignoring debt entirely.',
    },
    giai: {
      tinh: { vi: 'giá trị doanh nghiệp', en: 'Enterprise value' },
      thaySo: { vi: '12.000 + 5.000 − 2.000', en: '12000 + 5000 − 2000' },
      ketQua: { vi: '15.000 tỷ ₫', en: '15000 billion ₫' },
      gan: [
        { kyHieu: '\\text{Vốn hoá}', giaTri: { vi: '12.000', en: '12000' } },
        { kyHieu: '\\text{Nợ vay}', giaTri: { vi: '5.000', en: '5000' } },
        { kyHieu: '\\text{Tiền mặt}', giaTri: { vi: '2.000', en: '2000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức EV/Sales.',
      en: 'With the figures below, put the right two numbers into the slots of the EV/Sales formula.',
    },
    facts: [
      {
        label: { vi: 'Enterprise Value', en: 'Enterprise Value' },
        value: { vi: '15.000 tỷ ₫', en: '15000 billion ₫' },
      },
      {
        label: { vi: 'Doanh thu thuần', en: 'Net revenue' },
        value: { vi: '10.000 tỷ ₫', en: '10000 billion ₫' },
      },
    ],
    expected: 1.5,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: { vi: 'EV/Sales = [15.000] ÷ [10.000]', en: 'EV/Sales = [15000] ÷ [10000]' },
    verify: { inputs: { ev: 15000, revenue: 10000 }, expected: 1.5, tolerance: 0.01 },
    explain: {
      vi: '15.000 chia 10.000 bằng 1,5 lần: thị trường định giá cả doanh nghiệp, gồm cả phần chủ nợ, bằng 1,5 lần doanh thu một năm. 0,67 lần là chia ngược. 1,5% sai đơn vị. 5.000 tỷ ₫ là lấy hiệu. Lưu ý tử số phải là EV chứ không phải vốn hoá: thay EV bằng vốn hoá thì ra P/S, một bội số ghép tử số của cổ đông với mẫu số của cả doanh nghiệp.',
      en: '15,000 divided by 10,000 is 1.5x: the market values the whole business, creditors included, at 1.5 times one year of revenue. 0.67x inverts the ratio. 1.5% has the wrong unit. 5,000 billion ₫ subtracts. Note the numerator must be EV, not market cap: swapping it gives P/S, a multiple that pairs an equity numerator with a whole-firm denominator.',
    },
    giai: {
      tinh: { vi: 'EV trên doanh thu', en: 'EV to sales ratio' },
      thaySo: { vi: '15.000 ÷ 10.000', en: '15000 ÷ 10000' },
      ketQua: { vi: '1,5 lần', en: '1.5x' },
      gan: [
        { kyHieu: 'EV', giaTri: { vi: '15.000', en: '15000' } },
        { kyHieu: '\\text{Doanh thu}', giaTri: { vi: '10.000', en: '10000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng bốn con số vào ô trống của mô hình Gordon, chú ý tốc độ tăng trưởng g xuất hiện hai lần: nhân vào cổ tức ở tử số, và bị trừ khỏi r ở mẫu số.',
      en: 'With the figures below, put the right four numbers into the slots of the Gordon model, noting that the growth rate g appears twice: it grows the dividend in the numerator and is subtracted from r in the denominator.',
    },
    facts: [
      {
        label: { vi: 'Cổ tức vừa trả (D₀)', en: 'Dividend just paid (D₀)' },
        value: { vi: '2.400 ₫', en: '2400 ₫' },
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
    expected: 31200,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá trị cổ phiếu = [2.400] × (1 + [4] ÷ 100) ÷ (([12] − [4]) ÷ 100)',
      en: 'Stock value = [2400] × (1 + [4] ÷ 100) ÷ (([12] − [4]) ÷ 100)',
    },
    verify: {
      inputs: { dividend: 2400, growth: 4, requiredReturn: 12 },
      expected: 31200,
      tolerance: 1,
    },
    explain: {
      vi: 'Tử số là cổ tức NĂM TỚI, tức 2.400 nhân 1,04 bằng 2.496; mẫu số là r trừ g, tức 0,12 trừ 0,04 bằng 0,08. 2.496 chia 0,08 ra 31.200 ₫. Kết quả 30.000 ₫ là quên nhân với (1 + g), lấy thẳng cổ tức vừa trả. 20.000 ₫ là lấy r làm mẫu số mà quên trừ g, và đó là lỗi nặng nhất: mẫu số của mô hình này luôn là PHẦN CHÊNH giữa suất chiết khấu và tốc độ tăng. 2.496 ₫ là dừng ở tử số, chưa chiết khấu.',
      en: 'The numerator is NEXT year dividend, 2,400 times 1.04 which is 2,496; the denominator is r minus g, 0.12 minus 0.04 which is 0.08. 2,496 divided by 0.08 gives 31,200 ₫. A result of 30,000 ₫ forgets the (1 + g) factor and uses the dividend just paid. 20,000 ₫ puts r in the denominator without subtracting g, the most damaging slip: the denominator here is always the GAP between the discount rate and the growth rate. 2,496 ₫ stops at the numerator, before discounting.',
    },
    giai: {
      tinh: {
        vi: 'giá trị cổ phiếu theo mô hình Gordon',
        en: 'stock value under the Gordon growth model',
      },
      thaySo: {
        vi: '2.400 × (1 + 4 ÷ 100) ÷ ((12 − 4) ÷ 100)',
        en: '2400 × (1 + 4 ÷ 100) ÷ ((12 − 4) ÷ 100)',
      },
      ketQua: { vi: '31.200 ₫', en: '31200 ₫' },
      gan: [
        { kyHieu: 'D_0', giaTri: { vi: '2.400', en: '2400' } },
        { kyHieu: 'g', giaTri: { vi: '4', en: '4' } },
        { kyHieu: 'r', giaTri: { vi: '12', en: '12' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt cổ tức vừa trả vào đủ năm ô trống của mô hình DDM hai giai đoạn: bốn ô cho bốn năm tăng trưởng nhanh, và một ô cho giá trị cuối kỳ ở năm thứ tư. Chú ý ở ví dụ này tốc độ tăng giai đoạn đầu đúng bằng suất sinh lời đòi hỏi, nên mỗi năm quy về hôm nay vẫn là nguyên cổ tức ấy.',
      en: 'With the figures below, put the dividend just paid into all five slots of the two-stage DDM: four slots for the four high-growth years and one for the terminal value at year four. Note that here stage-one growth equals the required return, so each year discounts back to exactly that dividend.',
    },
    facts: [
      {
        label: { vi: 'Cổ tức vừa trả (D₀)', en: 'Dividend just paid (D₀)' },
        value: { vi: '2.000 ₫', en: '2000 ₫' },
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
    expected: 34000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá trị cổ phiếu = [2.000] × (1 + 12 ÷ 100) ÷ (1 + 12 ÷ 100) + [2.000] × (1 + 12 ÷ 100)^2 ÷ (1 + 12 ÷ 100)^2 + [2.000] × (1 + 12 ÷ 100)^3 ÷ (1 + 12 ÷ 100)^3 + [2.000] × (1 + 12 ÷ 100)^4 ÷ (1 + 12 ÷ 100)^4 + [2.000] × (1 + 12 ÷ 100)^4 × (1 + 4 ÷ 100) ÷ ((12 − 4) ÷ 100 × (1 + 12 ÷ 100)^4)',
      en: 'Stock value = [2000] × (1 + 12 ÷ 100) ÷ (1 + 12 ÷ 100) + [2000] × (1 + 12 ÷ 100)^2 ÷ (1 + 12 ÷ 100)^2 + [2000] × (1 + 12 ÷ 100)^3 ÷ (1 + 12 ÷ 100)^3 + [2000] × (1 + 12 ÷ 100)^4 ÷ (1 + 12 ÷ 100)^4 + [2000] × (1 + 12 ÷ 100)^4 × (1 + 4 ÷ 100) ÷ ((12 − 4) ÷ 100 × (1 + 12 ÷ 100)^4)',
    },
    verify: {
      inputs: { dividend: 2000, growthStage1: 12, years: 4, growthTerminal: 4, requiredReturn: 12 },
      expected: 34000,
      tolerance: 1,
    },
    explain: {
      vi: 'Giá trị gồm HAI phần cộng lại. Bốn cổ tức của giai đoạn đầu chiết khấu về hiện tại: ở đây tốc độ tăng đúng bằng suất chiết khấu nên mỗi năm quy về vẫn là 2.000 ₫, tổng 8.000 ₫. Giá trị cuối kỳ tại năm 4 bằng cổ tức năm 5 chia cho (r trừ g vĩnh viễn), rồi chiết khấu về hiện tại thành 26.000 ₫. Cộng lại ra 34.000 ₫. Ba kết quả sai hay gặp đều là bỏ quên một mảnh: 26.000 ₫ chỉ lấy giá trị cuối kỳ, 8.000 ₫ chỉ lấy cổ tức giai đoạn đầu, còn 48.911 ₫ là quên chiết khấu giá trị cuối kỳ về hiện tại, lấy nguyên con số tại năm 4.',
      en: 'The value is TWO parts added together. The four stage-one dividends discounted to today: here the growth rate equals the discount rate, so each year is worth 2,000 ₫ in present value, 8,000 ₫ in total. The terminal value at year 4 is the year-5 dividend divided by (r minus terminal g), discounted back to 26,000 ₫ today. Together that is 34,000 ₫. Each wrong result drops a piece: 26,000 ₫ takes only the terminal value, 8,000 ₫ only the stage-one dividends, and 48,911 ₫ forgets to discount the terminal value, using its year-4 figure as is.',
    },
    giai: {
      tinh: {
        vi: 'giá trị cổ phiếu theo DDM hai giai đoạn',
        en: 'stock value under the two-stage dividend discount model',
      },
      thaySo: {
        vi: '2.000 × (1 + 12 ÷ 100) ÷ (1 + 12 ÷ 100) + 2.000 × (1 + 12 ÷ 100)^2 ÷ (1 + 12 ÷ 100)^2 + 2.000 × (1 + 12 ÷ 100)^3 ÷ (1 + 12 ÷ 100)^3 + 2.000 × (1 + 12 ÷ 100)^4 ÷ (1 + 12 ÷ 100)^4 + 2.000 × (1 + 12 ÷ 100)^4 × (1 + 4 ÷ 100) ÷ ((12 − 4) ÷ 100 × (1 + 12 ÷ 100)^4)',
        en: '2000 × (1 + 12 ÷ 100) ÷ (1 + 12 ÷ 100) + 2000 × (1 + 12 ÷ 100)^2 ÷ (1 + 12 ÷ 100)^2 + 2000 × (1 + 12 ÷ 100)^3 ÷ (1 + 12 ÷ 100)^3 + 2000 × (1 + 12 ÷ 100)^4 ÷ (1 + 12 ÷ 100)^4 + 2000 × (1 + 12 ÷ 100)^4 × (1 + 4 ÷ 100) ÷ ((12 − 4) ÷ 100 × (1 + 12 ÷ 100)^4)',
      },
      ketQua: { vi: '34.000 ₫', en: '34000 ₫' },
      gan: [
        { kyHieu: 'D_0', giaTri: { vi: '2.000', en: '2000' } },
        { kyHieu: 'g_1', giaTri: { vi: '12', en: '12' } },
        { kyHieu: 'n', giaTri: { vi: '4', en: '4' } },
        { kyHieu: 'g_2', giaTri: { vi: '4', en: '4' } },
        { kyHieu: 'r', giaTri: { vi: '12', en: '12' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức CAPM, chú ý beta chỉ nhân vào phần bù rủi ro, không nhân vào lãi suất phi rủi ro.',
      en: 'With the figures below, put the right three numbers into the slots of the CAPM formula, noting that beta multiplies only the risk premium, not the risk-free rate.',
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
    expected: 16,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: { vi: 'Chi phí vốn chủ = [4] + [1,5] × [8]', en: 'Cost of equity = [4] + [1.5] × [8]' },
    verify: { inputs: { riskFree: 4, beta: 1.5, erp: 8 }, expected: 16, tolerance: 0.01 },
    explain: {
      vi: 'Beta chỉ nhân vào PHẦN BÙ, không nhân vào lãi suất phi rủi ro: 4 cộng 1,5 nhân 8 bằng 4 cộng 12, ra 16%. Kết quả 12% là cộng thẳng 4 với 8, tức bỏ quên beta. 18% là nhân beta vào cả tổng (1,5 nhân 12), tức kéo cả phần phi rủi ro vào rủi ro. 6% là nhân beta với lãi suất phi rủi ro. Thứ tự phép tính ở đây chính là ý nghĩa của mô hình: lãi suất phi rủi ro là nền, phần bù mới là chỗ rủi ro được trả công.',
      en: 'Beta multiplies the PREMIUM only, never the risk-free rate: 4 plus 1.5 times 8 is 4 plus 12, giving 16%. A result of 12% adds 4 and 8 directly, dropping beta. 18% multiplies beta by the whole sum (1.5 times 12), dragging the risk-free part into the risky one. 6% multiplies beta by the risk-free rate. The order of operations here is the meaning of the model: the risk-free rate is the floor, the premium is where risk gets paid.',
    },
    giai: {
      tinh: { vi: 'chi phí vốn chủ sở hữu', en: 'cost of equity' },
      thaySo: { vi: '4 + 1,5 × 8', en: '4 + 1.5 × 8' },
      ketQua: { vi: '16%', en: '16%' },
      gan: [
        { kyHieu: 'r_f', giaTri: { vi: '4', en: '4' } },
        { kyHieu: '\\beta', giaTri: { vi: '1,5', en: '1.5' } },
        { kyHieu: 'ERP', giaTri: { vi: '8', en: '8' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng năm con số vào ô trống của công thức WACC. Tổng nguồn vốn 600 cộng 400 bằng 1.000 đã viết sẵn; chú ý chỉ phần nợ vay mới nhân thêm (1 trừ thuế suất).',
      en: 'With the figures below, put the right five numbers into the slots of the WACC formula. Total capital, 600 plus 400 = 1000, is already written in; note that only the debt part is multiplied by (1 minus the tax rate).',
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
    expected: 12.2,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'WACC = [600] ÷ 1.000 × [15] + [400] ÷ 1.000 × [10] × (1 − [20] ÷ 100)',
      en: 'WACC = [600] ÷ 1000 × [15] + [400] ÷ 1000 × [10] × (1 − [20] ÷ 100)',
    },
    verify: {
      inputs: { equity: 600, debt: 400, costEquity: 15, costDebt: 10, taxRate: 20 },
      expected: 12.2,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Tỷ trọng vốn chủ là 600 trên 1.000 tức 60%, nợ là 40%. Phần vốn chủ đóng góp 0,6 nhân 15 bằng 9,0. Phần nợ phải nhân thêm (1 trừ thuế suất) vì lãi vay được trừ khi tính thuế: 0,4 nhân 10 nhân 0,8 bằng 3,2. Cộng lại ra 12,2%. Kết quả 13,0% là quên lá chắn thuế. 12,5% là bình quân SỐ HỌC của 15 và 10, tức bỏ qua tỷ trọng. 25,0% là cộng thẳng hai chi phí vốn.',
      en: 'The equity weight is 600 over 1,000, that is 60%, and debt is 40%. Equity contributes 0.6 times 15, which is 9.0. Debt must also be multiplied by (1 minus the tax rate) because interest is deductible: 0.4 times 10 times 0.8 is 3.2. Together that is 12.2%. A result of 13.0% drops the tax shield. 12.5% is the plain ARITHMETIC average of 15 and 10, ignoring the weights. 25.0% simply adds the two costs.',
    },
    giai: {
      tinh: { vi: 'chi phí vốn bình quân gia quyền', en: 'Weighted average cost of capital' },
      thaySo: {
        vi: '600 ÷ 1.000 × 15 + 400 ÷ 1.000 × 10 × (1 − 20 ÷ 100)',
        en: '600 ÷ 1000 × 15 + 400 ÷ 1000 × 10 × (1 − 20 ÷ 100)',
      },
      ketQua: { vi: '12,2%', en: '12.2%' },
      gan: [
        { kyHieu: 'E', giaTri: { vi: '600', en: '600' } },
        { kyHieu: 'D', giaTri: { vi: '400', en: '400' } },
        {
          kyHieu: 'E+D',
          moTa: {
            vi: 'bằng 600 cộng 400, tức 1.000 tỷ ₫',
            en: 'is 600 plus 400, that is 1000 billion ₫',
          },
        },
        { kyHieu: 'r_e', giaTri: { vi: '15', en: '15' } },
        { kyHieu: 'r_d', giaTri: { vi: '10', en: '10' } },
        { kyHieu: 't', giaTri: { vi: '20', en: '20' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng năm con số vào ô trống của công thức FCFF, chú ý khấu hao được cộng lại còn chi đầu tư và phần tăng vốn lưu động bị trừ ra.',
      en: 'With the figures below, put the right five numbers into the slots of the FCFF formula, noting that depreciation is added back while capital expenditure and the increase in working capital are subtracted.',
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
    expected: 380,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: 'tỷ ₫', en: 'billion ₫' },
    worked: {
      vi: 'FCFF = [600] × (1 − [20] ÷ 100) + [150] − [200] − [50]',
      en: 'FCFF = [600] × (1 − [20] ÷ 100) + [150] − [200] − [50]',
    },
    verify: {
      inputs: { ebit: 600, taxRate: 20, depreciation: 150, capex: 200, nwcChange: 50 },
      expected: 380,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Bốn bước: EBIT sau thuế là 600 nhân 0,8 bằng 480; CỘNG khấu hao 150 vì đó là chi phí không chi tiền; TRỪ chi đầu tư 200 và TRỪ thay đổi vốn lưu động 50. Kết quả 380 tỷ ₫. Kết quả 430 tỷ là bỏ sót thay đổi vốn lưu động. 500 tỷ là quên trừ thuế trên EBIT. 80 tỷ là trừ khấu hao thay vì cộng ngược vào, đúng lỗi mà Damodaran gọi cộng khấu hao là "điểm dừng giữa đường" đã cảnh báo.',
      en: 'Four steps: after-tax EBIT is 600 times 0.8, that is 480; ADD back depreciation of 150 because it is a non-cash charge; SUBTRACT capital expenditure of 200 and SUBTRACT the working-capital change of 50. The result is 380 billion ₫. A result of 430 drops the working-capital change. 500 forgets to tax EBIT. 80 subtracts depreciation instead of adding it back, the error behind Damodaran warning that adding depreciation back is only an intermediate stop.',
    },
    giai: {
      tinh: { vi: 'dòng tiền tự do của doanh nghiệp', en: 'Free cash flow to firm' },
      thaySo: {
        vi: '600 × (1 − 20 ÷ 100) + 150 − 200 − 50',
        en: '600 × (1 − 20 ÷ 100) + 150 − 200 − 50',
      },
      ketQua: { vi: '380 tỷ ₫', en: '380 billion ₫' },
      gan: [
        { kyHieu: 'EBIT', giaTri: { vi: '600', en: '600' } },
        { kyHieu: 't', giaTri: { vi: '20', en: '20' } },
        { kyHieu: 'Dep', giaTri: { vi: '150', en: '150' } },
        { kyHieu: 'CapEx', giaTri: { vi: '200', en: '200' } },
        { kyHieu: '\\Delta NWC', giaTri: { vi: '50', en: '50' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng bốn con số vào ô trống của công thức FCFE, chú ý chỉ phần lãi vay SAU THUẾ bị trừ, còn vay ròng thì được cộng vào.',
      en: 'With the figures below, put the right four numbers into the slots of the FCFE formula, noting that only the AFTER-TAX interest is subtracted while net borrowing is added.',
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
    expected: 370,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: 'tỷ ₫', en: 'billion ₫' },
    worked: {
      vi: 'FCFE = [380] − [50] × (1 − [20] ÷ 100) + [30]',
      en: 'FCFE = [380] − [50] × (1 − [20] ÷ 100) + [30]',
    },
    verify: {
      inputs: { fcff: 380, interest: 50, taxRate: 20, netBorrowing: 30 },
      expected: 370,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Đi từ dòng tiền của CẢ doanh nghiệp về dòng tiền của riêng CỔ ĐÔNG: trừ lãi vay SAU THUẾ, tức 50 nhân 0,8 bằng 40, rồi cộng phần vay ròng 30 vì đó là tiền chủ nợ mới bơm vào. 380 trừ 40 cộng 30 bằng 370 tỷ ₫. Kết quả 360 tỷ là trừ nguyên 50, quên lá chắn thuế của lãi vay. 310 tỷ là trừ cả vay ròng thay vì cộng. 450 tỷ là cộng lãi vay thay vì trừ.',
      en: 'Move from the cash flow of the WHOLE firm to the cash flow of the SHAREHOLDERS: subtract after-tax interest, 50 times 0.8 which is 40, then add net new borrowing of 30 because that is fresh money from lenders. 380 minus 40 plus 30 is 370 billion ₫. A result of 360 subtracts the full 50, forgetting the tax shield on interest. 310 subtracts net borrowing instead of adding it. 450 adds interest instead of subtracting it.',
    },
    giai: {
      tinh: { vi: 'dòng tiền tự do của cổ đông', en: 'Free cash flow to equity' },
      thaySo: { vi: '380 − 50 × (1 − 20 ÷ 100) + 30', en: '380 − 50 × (1 − 20 ÷ 100) + 30' },
      ketQua: { vi: '370 tỷ ₫', en: '370 billion ₫' },
      gan: [
        { kyHieu: 'FCFF', giaTri: { vi: '380', en: '380' } },
        { kyHieu: 'I', giaTri: { vi: '50', en: '50' } },
        { kyHieu: 't', giaTri: { vi: '20', en: '20' } },
        { kyHieu: '\\Delta B', giaTri: { vi: '30', en: '30' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng năm con số vào ô trống của công thức định giá theo FCFF. Số cổ phiếu 150 triệu đã viết sẵn; chú ý g xuất hiện hai lần, và nợ ròng bị trừ khỏi giá trị doanh nghiệp trước khi chia cho số cổ phiếu.',
      en: 'With the figures below, put the right five numbers into the slots of the FCFF valuation formula. The 150 million shares are already written in; note that g appears twice, and net debt is subtracted from enterprise value before dividing by the share count.',
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
    expected: 30266.67,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá trị nội tại = ([380] × (1 + [4] ÷ 100) ÷ (([12] − [4]) ÷ 100) − [400]) ÷ 150 × 1.000',
      en: 'Intrinsic value = ([380] × (1 + [4] ÷ 100) ÷ (([12] − [4]) ÷ 100) − [400]) ÷ 150 × 1000',
    },
    verify: {
      inputs: { fcff: 380, growth: 4, wacc: 12, netDebt: 400, shares: 150 },
      expected: 30266.67,
      tolerance: 1,
    },
    explain: {
      vi: 'Ba bước. Giá trị doanh nghiệp bằng 380 nhân 1,04 chia cho (0,12 trừ 0,04), tức 395,2 chia 0,08 bằng 4.940 tỷ ₫. Trừ nợ ròng 400 còn 4.540 tỷ ₫ thuộc về cổ đông. Chia cho 150 triệu cổ phiếu, nhớ đổi tỷ đồng sang đồng, ra 30.267 ₫. Kết quả 32.933 ₫ là quên trừ nợ ròng, tức định giá cả doanh nghiệp rồi gán hết cho cổ đông. 29.000 ₫ là quên nhân FCFF với (1 + g). 30,27 ₫ là quên đổi đơn vị, chia thẳng tỷ đồng cho triệu cổ phiếu.',
      en: 'Three steps. Enterprise value is 380 times 1.04 divided by (0.12 minus 0.04), that is 395.2 over 0.08, giving 4,940 billion ₫. Subtract net debt of 400 and 4,540 billion ₫ belongs to shareholders. Divide by 150 million shares, remembering to convert billions into dong, for 30,267 ₫. A result of 32,933 ₫ forgets net debt, valuing the whole firm and handing it all to shareholders. 29,000 ₫ forgets the (1 + g) factor on FCFF. 30.27 ₫ skips the unit conversion, dividing billions straight by millions of shares.',
    },
    giai: {
      tinh: {
        vi: 'giá trị nội tại mỗi cổ phiếu từ FCFF',
        en: 'intrinsic value per share from FCFF',
      },
      thaySo: {
        vi: '(380 × (1 + 4 ÷ 100) ÷ ((12 − 4) ÷ 100) − 400) ÷ 150 × 1.000',
        en: '(380 × (1 + 4 ÷ 100) ÷ ((12 − 4) ÷ 100) − 400) ÷ 150 × 1000',
      },
      ketQua: { vi: '30.267 ₫', en: '30267 ₫' },
      gan: [
        { kyHieu: 'FCFF', giaTri: { vi: '380', en: '380' } },
        { kyHieu: 'g', giaTri: { vi: '4', en: '4' } },
        { kyHieu: 'WACC', giaTri: { vi: '12', en: '12' } },
        { kyHieu: 'D_{\\text{ròng}}', giaTri: { vi: '400', en: '400' } },
        { kyHieu: '\\text{Số CP}', giaTri: { vi: '150', en: '150' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức giá trị hiện tại, chú ý số năm nằm ở số mũ.',
      en: 'With the figures below, put the right three numbers into the slots of the present value formula, noting that the number of years is the exponent.',
    },
    facts: [
      {
        label: { vi: 'Số tiền nhận được trong tương lai', en: 'Future amount' },
        value: { vi: '1.331.000.000 ₫', en: '1331000000 ₫' },
      },
      {
        label: { vi: 'Suất chiết khấu', en: 'Discount rate' },
        value: { vi: '10%/năm', en: '10% a year' },
      },
      { label: { vi: 'Số năm', en: 'Years' }, value: { vi: '3 năm', en: '3 years' } },
    ],
    expected: 1000000000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'PV = [1.331.000.000] ÷ (1 + [10] ÷ 100)^[3]',
      en: 'PV = [1331000000] ÷ (1 + [10] ÷ 100)^[3]',
    },
    verify: {
      inputs: { futureValue: 1331000000, rate: 10, years: 3 },
      expected: 1000000000,
      tolerance: 1,
    },
    explain: {
      vi: 'Chiết khấu là CHIA cho (1 + r) mũ số năm: 1,1 mũ 3 bằng 1,331, và 1.331.000.000 chia 1,331 ra đúng 1.000.000.000 ₫. Kết quả 1.023.846.154 ₫ là chiết khấu theo lãi ĐƠN, chia cho 1,3 thay vì 1,331. 931.700.000 ₫ là trừ thẳng 30% khỏi số tiền tương lai, một phép trừ chứ không phải phép chiết khấu. 1.771.561.000 ₫ là nhân thay vì chia, tức đi ngược chiều thời gian.',
      en: 'Discounting means DIVIDING by (1 + r) to the power of the number of years: 1.1 cubed is 1.331, and 1,331,000,000 divided by 1.331 is exactly 1,000,000,000 ₫. A result of 1,023,846,154 ₫ discounts at SIMPLE interest, dividing by 1.3 instead of 1.331. 931,700,000 ₫ subtracts 30% from the future amount, a subtraction rather than discounting. 1,771,561,000 ₫ multiplies instead of dividing, running time the wrong way.',
    },
    giai: {
      tinh: { vi: 'Giá trị hiện tại (PV)', en: 'Present value' },
      thaySo: { vi: '1.331.000.000 ÷ (1 + 10 ÷ 100)^3', en: '1331000000 ÷ (1 + 10 ÷ 100)^3' },
      ketQua: { vi: '1.000.000.000 ₫', en: '1000000000 ₫' },
      gan: [
        { kyHieu: 'FV', giaTri: { vi: '1.331.000.000', en: '1331000000' } },
        { kyHieu: 'r', giaTri: { vi: '10', en: '10' } },
        { kyHieu: 'n', giaTri: { vi: '3', en: '3' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức giá trị tương lai, chú ý số năm nằm ở số mũ.',
      en: 'With the figures below, put the right three numbers into the slots of the future value formula, noting that the number of years is the exponent.',
    },
    facts: [
      {
        label: { vi: 'Số tiền hiện tại', en: 'Present amount' },
        value: { vi: '100.000.000 ₫', en: '100000000 ₫' },
      },
      {
        label: { vi: 'Lãi suất', en: 'Interest rate' },
        value: { vi: '10%/năm', en: '10% a year' },
      },
      { label: { vi: 'Số năm', en: 'Years' }, value: { vi: '3 năm', en: '3 years' } },
    ],
    expected: 133100000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'FV = [100.000.000] × (1 + [10] ÷ 100)^[3]',
      en: 'FV = [100000000] × (1 + [10] ÷ 100)^[3]',
    },
    verify: {
      inputs: { presentValue: 100000000, rate: 10, years: 3 },
      expected: 133100000,
      tolerance: 1,
    },
    explain: {
      vi: '100.000.000 nhân 1,1 mũ 3, tức nhân 1,331, ra 133.100.000 ₫. Kết quả 130.000.000 ₫ là lãi ĐƠN: cộng 10% ba lần trên vốn gốc mà không cho lãi sinh lãi, và khoảng cách 3.100.000 ₫ giữa hai con số chính là phần lãi kép. 110.000.000 ₫ là mới tính một năm. 75.131.480 ₫ là chia thay vì nhân, tức tính ngược về hiện tại.',
      en: '100,000,000 times 1.1 cubed, that is times 1.331, gives 133,100,000 ₫. A result of 130,000,000 ₫ uses SIMPLE interest: 10% added three times on the original capital, with no interest on interest, and the 3,100,000 ₫ gap between the two is precisely the compounding. 110,000,000 ₫ covers only one year. 75,131,480 ₫ divides instead of multiplying, running back to the present.',
    },
    giai: {
      tinh: { vi: 'Giá trị tương lai (FV)', en: 'Future value' },
      thaySo: { vi: '100.000.000 × (1 + 10 ÷ 100)^3', en: '100000000 × (1 + 10 ÷ 100)^3' },
      ketQua: { vi: '133.100.000 ₫', en: '133100000 ₫' },
      gan: [
        { kyHieu: 'PV', giaTri: { vi: '100.000.000', en: '100000000' } },
        { kyHieu: 'r', giaTri: { vi: '10', en: '10' } },
        { kyHieu: 'n', giaTri: { vi: '3', en: '3' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức biên an toàn, chú ý mẫu số là giá trị nội tại chứ không phải giá thị trường.',
      en: 'With the figures below, put the right three numbers into the slots of the margin of safety formula, noting that the denominator is the intrinsic value, not the market price.',
    },
    facts: [
      {
        label: { vi: 'Giá trị nội tại ước tính', en: 'Estimated intrinsic value' },
        value: { vi: '50.000 ₫', en: '50000 ₫' },
      },
      {
        label: { vi: 'Giá thị trường', en: 'Market price' },
        value: { vi: '35.000 ₫', en: '35000 ₫' },
      },
    ],
    expected: 30,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Biên an toàn = ([50.000] − [35.000]) ÷ [50.000] × 100',
      en: 'Margin of safety = ([50000] − [35000]) ÷ [50000] × 100',
    },
    verify: { inputs: { intrinsic: 50000, price: 35000 }, expected: 30, tolerance: 0.01 },
    explain: {
      vi: 'Mẫu số là GIÁ TRỊ NỘI TẠI, không phải giá mua: (50.000 trừ 35.000) chia 50.000 bằng 0,3, tức 30%. Kết quả 42,86% là chia phần chênh cho giá thị trường, và nó luôn lớn hơn con số đúng nên đọc nhầm sẽ thấy mình an toàn hơn thực tế. 70% là tỷ lệ giá trên giá trị nội tại, tức phần bù của kết quả đúng. 15.000 ₫ là dừng ở phần chênh, chưa phải một biên.',
      en: 'The denominator is INTRINSIC VALUE, not the purchase price: (50,000 minus 35,000) over 50,000 is 0.3, that is 30%. A result of 42.86% divides the gap by the market price, and it always comes out larger than the right result, so reading it makes the position look safer than it is. 70% is price over intrinsic value, the complement of the right result. 15,000 ₫ stops at the gap, which is not yet a margin.',
    },
    giai: {
      tinh: { vi: 'Biên an toàn', en: 'Margin of safety' },
      thaySo: { vi: '(50.000 − 35.000) ÷ 50.000 × 100', en: '(50000 − 35000) ÷ 50000 × 100' },
      ketQua: { vi: '30%', en: '30%' },
      gan: [
        { kyHieu: 'V', giaTri: { vi: '50.000', en: '50000' } },
        { kyHieu: 'P', giaTri: { vi: '35.000', en: '35000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức phí giao dịch mua. Biểu phí 0,15% lấy từ bảng hằng số của sản phẩm và đã viết sẵn trong công thức.',
      en: 'With the figures below, put the right two numbers into the slots of the buy-side fee formula. The 0.15% rate comes from the product’s constants table and is already written in.',
    },
    facts: [
      {
        label: { vi: 'Khối lượng mua', en: 'Quantity bought' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      { label: { vi: 'Giá mua', en: 'Buy price' }, value: { vi: '50.000 ₫', en: '50000 ₫' } },
    ],
    expected: 75000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Phí mua = [1.000] × [50.000] × 0,15 ÷ 100',
      en: 'Buy fee = [1000] × [50000] × 0.15 ÷ 100',
    },
    verify: { inputs: { quantity: 1000, buyPrice: 50000 }, expected: 75000, tolerance: 1 },
    explain: {
      vi: 'Giá trị lệnh là 1.000 nhân 50.000 bằng 50.000.000 ₫, nhân với biểu phí 0,15% ra 75.000 ₫. Con số 0,15% lấy từ bảng hằng số của sản phẩm, in ngay dưới khối Số liệu trên màn, nên không cần nhớ thuộc lòng. Kết quả 50.000 ₫ là dùng nhầm mức 0,1%, vốn là thuế chuyển nhượng khi BÁN chứ không phải phí mua. 7.500 ₫ và 750.000 ₫ đều là lệch một chữ số thập phân, 0,015% và 1,5%.',
      en: 'The order is 1,000 times 50,000, that is 50,000,000 ₫, times the 0.15% fee schedule gives 75,000 ₫. The 0.15% comes from the product constants table, printed right under the inputs block on screen, so it does not have to be memorised. A result of 50,000 ₫ uses 0.1%, which is the transfer tax on SELLING, not a buying fee. 7,500 ₫ and 750,000 ₫ are both a decimal place out, 0.015% and 1.5%.',
    },
    giai: {
      tinh: { vi: 'Phí giao dịch mua', en: 'Buy-side brokerage fee' },
      thaySo: { vi: '1.000 × 50.000 × 0,15 ÷ 100', en: '1000 × 50000 × 0.15 ÷ 100' },
      ketQua: { vi: '75.000 ₫', en: '75000 ₫' },
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{mua}', giaTri: { vi: '50.000', en: '50000' } },
        { kyHieu: 'r_{mua}', giaTri: { vi: '0,15%', en: '0.15%' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức PHÍ giao dịch bán, chưa tính thuế. Biểu phí 0,15% đã viết sẵn trong công thức.',
      en: 'With the figures below, put the right two numbers into the slots of the sell-side FEE formula, tax excluded. The 0.15% rate is already written in.',
    },
    facts: [
      {
        label: { vi: 'Khối lượng bán', en: 'Quantity sold' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      { label: { vi: 'Giá bán', en: 'Sell price' }, value: { vi: '60.000 ₫', en: '60000 ₫' } },
    ],
    expected: 90000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Phí bán = [1.000] × [60.000] × 0,15 ÷ 100',
      en: 'Sell fee = [1000] × [60000] × 0.15 ÷ 100',
    },
    verify: { inputs: { quantity: 1000, sellPrice: 60000 }, expected: 90000, tolerance: 1 },
    explain: {
      vi: 'Giá trị lệnh 1.000 nhân 60.000 bằng 60.000.000 ₫, nhân 0,15% ra 90.000 ₫. Phí bán tính trên GIÁ BÁN chứ không trên giá mua, nên một lệnh lãi sẽ chịu phí bán cao hơn phí mua. Kết quả 60.000 ₫ là thuế chuyển nhượng 0,1%, một khoản khác đi kèm nhưng không phải phí. 150.000 ₫ là cộng gộp cả phí và thuế, đúng tổng chi phí bán nhưng câu hỏi chỉ hỏi phí. 9.000 ₫ lệch một chữ số thập phân.',
      en: 'The order is 1,000 times 60,000, that is 60,000,000 ₫, times 0.15% gives 90,000 ₫. The selling fee is charged on the SALE price, not the purchase price, so a profitable trade pays more on the way out than on the way in. A result of 60,000 ₫ is the 0.1% transfer tax, a separate charge that travels with it but is not a fee. 150,000 ₫ adds fee and tax together, the correct total selling cost but not what was asked. 9,000 ₫ is a decimal place out.',
    },
    giai: {
      tinh: { vi: 'Phí giao dịch bán', en: 'Sell-side brokerage fee' },
      thaySo: { vi: '1.000 × 60.000 × 0,15 ÷ 100', en: '1000 × 60000 × 0.15 ÷ 100' },
      ketQua: { vi: '90.000 ₫', en: '90000 ₫' },
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{ban}', giaTri: { vi: '60.000', en: '60000' } },
        { kyHieu: 'r_{ban}', giaTri: { vi: '0,15%', en: '0.15%' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bạn mua 1.000 cổ phiếu giá 50.000 ₫ và bán ra ở giá 60.000 ₫. Hãy đặt đúng hai con số vào ô trống của công thức thuế chuyển nhượng, chú ý thuế tính trên giá trị bán chứ không tính trên lãi.',
      en: 'You bought 1000 shares at 50000 ₫ and sold at 60000 ₫. Put the right two numbers into the slots of the transfer tax formula, noting that the tax is levied on the sale value, not on the profit.',
    },
    facts: [
      {
        label: { vi: 'Khối lượng bán', en: 'Quantity sold' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      { label: { vi: 'Giá bán', en: 'Sell price' }, value: { vi: '60.000 ₫', en: '60000 ₫' } },
      {
        label: { vi: 'Lãi gộp của lệnh', en: 'Gross profit on the trade' },
        value: { vi: '10.000.000 ₫', en: '10000000 ₫' },
      },
    ],
    expected: 60000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Thuế chuyển nhượng = [1.000] × [60.000] × 0,1 ÷ 100',
      en: 'Transfer tax = [1000] × [60000] × 0.1 ÷ 100',
    },
    verify: { inputs: { quantity: 1000, sellPrice: 60000 }, expected: 60000, tolerance: 1 },
    explain: {
      vi: 'Thuế tính trên GIÁ TRỊ BÁN, không tính trên lãi: 60.000.000 nhân 0,1% bằng 60.000 ₫. Con số lãi 10.000.000 ₫ trong đề bài là số liệu thừa cố ý, vì đây đúng là chỗ hay nhầm nhất. Kết quả 2.000.000 ₫ là đánh 20% trên lãi, cách làm của một số nước khác chứ không phải quy định hiện hành ở Việt Nam. 90.000 ₫ là dùng nhầm mức phí 0,15%. 0 ₫ là tin rằng giao dịch nhỏ hay lệnh lỗ thì được miễn, trong khi không có ngưỡng miễn nào.',
      en: 'The tax is charged on SALE VALUE, not on profit: 60,000,000 times 0.1% is 60,000 ₫. The 10,000,000 ₫ profit in the brief is deliberately redundant, because that is exactly where the mistake happens. A result of 2,000,000 ₫ taxes the profit at 20%, which is how some other countries do it but not the rule in force in Vietnam. 90,000 ₫ uses the 0.15% fee rate. 0 ₫ assumes small or loss-making trades are exempt, and there is no exemption threshold.',
    },
    giai: {
      tinh: { vi: 'Thuế chuyển nhượng chứng khoán', en: 'Securities transfer tax' },
      thaySo: { vi: '1.000 × 60.000 × 0,1 ÷ 100', en: '1000 × 60000 × 0.1 ÷ 100' },
      ketQua: { vi: '60.000 ₫', en: '60000 ₫' },
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{ban}', giaTri: { vi: '60.000', en: '60000' } },
        { kyHieu: 'r_{thue}', giaTri: { vi: '0,1%', en: '0.1%' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức thuế cổ tức tiền mặt. Thuế suất 5% đã viết sẵn trong công thức.',
      en: 'With the figures below, put the right two numbers into the slots of the cash dividend tax formula. The 5% rate is already written in.',
    },
    facts: [
      {
        label: { vi: 'Số cổ phiếu nắm giữ', en: 'Shares held' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      {
        label: { vi: 'Cổ tức tiền mặt mỗi cổ phiếu', en: 'Cash dividend per share' },
        value: { vi: '3.000 ₫', en: '3000 ₫' },
      },
    ],
    expected: 150000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Thuế cổ tức = [1.000] × [3.000] × 5 ÷ 100',
      en: 'Dividend tax = [1000] × [3000] × 5 ÷ 100',
    },
    verify: { inputs: { quantity: 1000, dividendPerShare: 3000 }, expected: 150000, tolerance: 1 },
    explain: {
      vi: 'Cổ tức nhận được là 1.000 nhân 3.000 bằng 3.000.000 ₫, nhân thuế suất 5% ra 150.000 ₫, và khoản này bị khấu trừ ngay khi chia nên tiền về tài khoản đã là số sau thuế. Kết quả 300.000 ₫ dùng 10% và 600.000 ₫ dùng 20%, hai mức thuộc về các loại thu nhập khác. 0 ₫ là lập luận "thuế chồng thuế": doanh nghiệp đã nộp thuế thu nhập doanh nghiệp rồi nên cổ đông được miễn. Đó là một quan điểm phản biện, không phải căn cứ miễn trừ.',
      en: 'The dividend received is 1,000 times 3,000, that is 3,000,000 ₫, times the 5% rate gives 150,000 ₫, and it is withheld at payment so the cash landing in the account is already net. A result of 300,000 ₫ uses 10% and 600,000 ₫ uses 20%, rates that belong to other kinds of income. 0 ₫ is the double-taxation argument: the company already paid corporate tax so the shareholder should be exempt. That is an objection, not a statutory exemption.',
    },
    giai: {
      tinh: { vi: 'Thuế cổ tức tiền mặt', en: 'Cash dividend tax' },
      thaySo: { vi: '1.000 × 3.000 × 5 ÷ 100', en: '1000 × 3000 × 5 ÷ 100' },
      ketQua: { vi: '150.000 ₫', en: '150000 ₫' },
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'D', giaTri: { vi: '3.000', en: '3000' } },
        { kyHieu: 'r_{ct}', giaTri: { vi: '5%', en: '5%' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bạn nắm giữ 1.000 cổ phiếu suốt 12 tháng và không mua bán gì thêm. Hãy đặt đúng hai con số vào ô trống của công thức phí lưu ký; mức 0,27 ₫ mỗi cổ phiếu mỗi tháng đã viết sẵn.',
      en: 'You hold 1000 shares for 12 months and place no further trades. Put the right two numbers into the slots of the custody fee formula; the 0.27 ₫ per share per month rate is already written in.',
    },
    facts: [
      {
        label: { vi: 'Số cổ phiếu lưu ký', en: 'Shares in custody' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      {
        label: { vi: 'Thời gian nắm giữ', en: 'Holding period' },
        value: { vi: '12 tháng', en: '12 months' },
      },
    ],
    expected: 3240,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: { vi: 'Phí lưu ký = [1.000] × [12] × 0,27', en: 'Custody fee = [1000] × [12] × 0.27' },
    verify: { inputs: { quantity: 1000, months: 12 }, expected: 3240, tolerance: 1 },
    explain: {
      vi: 'Phí lưu ký tính theo SỐ CỔ PHIẾU và theo THÁNG, không tính theo giá trị: 1.000 nhân 0,27 ₫ mỗi tháng bằng 270 ₫, nhân 12 tháng ra 3.240 ₫. Kết quả 270 ₫ là quên nhân số tháng. 3.240.000 ₫ là nhầm 0,27 ₫ mỗi cổ phiếu thành 0,27% trên giá trị. 0 ₫ là tin rằng tháng không giao dịch thì không bị trừ, trong khi phí này trả cho việc GIỮ chứng khoán, tách hẳn khỏi phí giao dịch.',
      en: 'The depository fee is charged per SHARE and per MONTH, not on value: 1,000 times 0.27 ₫ a month is 270 ₫, times 12 months gives 3,240 ₫. A result of 270 ₫ forgets to multiply by the months. 3,240,000 ₫ mistakes 0.27 ₫ per share for 0.27% of value. 0 ₫ assumes a month without trades is free, whereas this fee pays for HOLDING the securities, entirely separate from trading fees.',
    },
    giai: {
      tinh: { vi: 'Phí lưu ký', en: 'Custody fee' },
      thaySo: { vi: '1.000 × 12 × 0,27', en: '1000 × 12 × 0.27' },
      ketQua: { vi: '3.240 ₫', en: '3240 ₫' },
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'M', giaTri: { vi: '12', en: '12' } },
        { kyHieu: 'c', giaTri: { vi: '0,27', en: '0.27' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức giá hoà vốn thực. Khối lượng 1.000 CP, các biểu phí và thuế đã viết sẵn; chú ý giá mua xuất hiện hai lần, trong tiền mua và trong phí mua.',
      en: 'With the figures below, put the right three numbers into the slots of the true break-even price formula. The 1000 shares and every fee and tax rate are already written in; note that the buy price appears twice, in the purchase amount and in the buy fee.',
    },
    facts: [
      { label: { vi: 'Khối lượng', en: 'Quantity' }, value: { vi: '1.000 CP', en: '1000 shares' } },
      { label: { vi: 'Giá mua', en: 'Buy price' }, value: { vi: '50.000 ₫', en: '50000 ₫' } },
      {
        label: { vi: 'Thời gian nắm giữ', en: 'Holding period' },
        value: { vi: '12 tháng', en: '12 months' },
      },
    ],
    expected: 50203.75,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá hoà vốn = (1.000 × [50.000] + 1.000 × [50.000] × 0,15 ÷ 100 + 1.000 × [12] × 0,27) ÷ (1.000 × (1 − 0,15 ÷ 100 − 0,1 ÷ 100))',
      en: 'Break-even price = (1000 × [50000] + 1000 × [50000] × 0.15 ÷ 100 + 1000 × [12] × 0.27) ÷ (1000 × (1 − 0.15 ÷ 100 − 0.1 ÷ 100))',
    },
    verify: {
      inputs: { quantity: 1000, months: 12, buyPrice: 50000 },
      expected: 50203.75,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Giá hoà vốn phải gánh cả bốn khoản: phí mua 75.000 ₫, phí lưu ký 12 tháng 3.240 ₫, rồi phí bán 0,15% và thuế bán 0,1% — hai khoản sau tính trên chính GIÁ BÁN chưa biết, nên phải giải ngược: vốn đã bỏ ra 50.078.240 ₫ chia cho (1 trừ 0,0025) bằng 50.203.749 ₫, tức 50.203,75 ₫ mỗi cổ phiếu. Kết quả 50.000 ₫ là bỏ hết chi phí. 50.078,24 ₫ chỉ cộng phí mua và phí lưu ký, quên phí và thuế lúc bán. 50.228,24 ₫ cộng thẳng tổng chi phí vào giá mua, tức tính phí bán trên giá MUA thay vì trên giá bán.',
      en: 'The break-even price has to carry all four charges: a 75,000 ₫ buying fee, 3,240 ₫ of depository fees over 12 months, then the 0.15% selling fee and the 0.1% sale tax, both charged on the SALE price that is still unknown, so it has to be solved backwards: the 50,078,240 ₫ already committed divided by (1 minus 0.0025) gives 50,203,749 ₫, that is 50,203.75 ₫ per share. A result of 50,000 ₫ ignores costs entirely. 50,078.24 ₫ covers only the buying fee and custody, forgetting the selling charges. 50,228.24 ₫ adds total costs onto the purchase price, charging the selling fee against the BUY price instead of the sale price.',
    },
    giai: {
      tinh: { vi: 'Giá hoà vốn thực', en: 'True break-even price' },
      thaySo: {
        vi: '(1.000 × 50.000 + 1.000 × 50.000 × 0,15 ÷ 100 + 1.000 × 12 × 0,27) ÷ (1.000 × (1 − 0,15 ÷ 100 − 0,1 ÷ 100))',
        en: '(1000 × 50000 + 1000 × 50000 × 0.15 ÷ 100 + 1000 × 12 × 0.27) ÷ (1000 × (1 − 0.15 ÷ 100 − 0.1 ÷ 100))',
      },
      ketQua: { vi: '50.203,75 ₫', en: '50203.75 ₫' },
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{mua}', giaTri: { vi: '50.000', en: '50000' } },
        {
          kyHieu: 'F_{mua}',
          moTa: {
            vi: 'bằng 0,15% của tiền mua 1.000 cổ phiếu × 50.000 ₫',
            en: 'is 0.15% of the purchase, 1000 shares × 50000 ₫',
          },
        },
        {
          kyHieu: 'F_{lk}',
          moTa: {
            vi: 'bằng 1.000 cổ phiếu nhân 12 tháng nhân 0,27 ₫',
            en: 'is 1000 shares times 12 months times 0.27 ₫',
          },
        },
        { kyHieu: 'r_{ban}', giaTri: { vi: '0,15%', en: '0.15%' } },
        { kyHieu: 'r_{thue}', giaTri: { vi: '0,1%', en: '0.1%' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt giá mua và giá bán vào đủ năm ô trống của công thức lợi nhuận ròng. Chú ý giá bán xuất hiện ba lần (tiền bán, phí bán, thuế bán) còn giá mua hai lần (tiền mua, phí mua).',
      en: 'With the figures below, put the buy and sell prices into all five slots of the net profit formula. Note that the sell price appears three times (proceeds, sell fee, sell tax) and the buy price twice (cost, buy fee).',
    },
    facts: [
      { label: { vi: 'Khối lượng', en: 'Quantity' }, value: { vi: '1.000 CP', en: '1000 shares' } },
      { label: { vi: 'Giá mua', en: 'Buy price' }, value: { vi: '50.000 ₫', en: '50000 ₫' } },
      { label: { vi: 'Giá bán', en: 'Sell price' }, value: { vi: '60.000 ₫', en: '60000 ₫' } },
      {
        label: { vi: 'Thời gian nắm giữ', en: 'Holding period' },
        value: { vi: '12 tháng', en: '12 months' },
      },
    ],
    expected: 9771760,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Lợi nhuận ròng = 1.000 × ([60.000] − [50.000]) − (1.000 × [50.000] × 0,15 ÷ 100 + 1.000 × [60.000] × 0,15 ÷ 100 + 1.000 × [60.000] × 0,1 ÷ 100 + 1.000 × 12 × 0,27)',
      en: 'Net profit = 1000 × ([60000] − [50000]) − (1000 × [50000] × 0.15 ÷ 100 + 1000 × [60000] × 0.15 ÷ 100 + 1000 × [60000] × 0.1 ÷ 100 + 1000 × 12 × 0.27)',
    },
    verify: {
      inputs: { quantity: 1000, months: 12, buyPrice: 50000, sellPrice: 60000 },
      expected: 9771760,
      tolerance: 1,
    },
    explain: {
      vi: 'Lãi gộp là 1.000 nhân (60.000 trừ 50.000) bằng 10.000.000 ₫. Trừ đủ bốn khoản: phí mua 75.000, phí bán 90.000, thuế bán 60.000, phí lưu ký 12 tháng 3.240 — tổng 228.240 ₫, còn lại 9.771.760 ₫. Kết quả 10.000.000 ₫ là lãi gộp, chưa trừ gì. 9.835.000 ₫ là chỉ trừ hai khoản phí giao dịch, quên thuế bán và phí lưu ký. 9.775.000 ₫ là quên riêng phí lưu ký, khoản nhỏ nhất nên cũng hay rơi nhất.',
      en: 'Gross profit is 1,000 times (60,000 minus 50,000), that is 10,000,000 ₫. Deduct all four charges: 75,000 buying fee, 90,000 selling fee, 60,000 sale tax and 3,240 of depository fees over 12 months, 228,240 ₫ in total, leaving 9,771,760 ₫. A result of 10,000,000 ₫ is gross profit before anything. 9,835,000 ₫ deducts the two trading fees only, missing the sale tax and custody. 9,775,000 ₫ drops the depository fee alone, the smallest item and therefore the one most often forgotten.',
    },
    giai: {
      tinh: { vi: 'Lợi nhuận ròng sau phí & thuế', en: 'Net profit after fees and taxes' },
      thaySo: {
        vi: '1.000 × (60.000 − 50.000) − (1.000 × 50.000 × 0,15 ÷ 100 + 1.000 × 60.000 × 0,15 ÷ 100 + 1.000 × 60.000 × 0,1 ÷ 100 + 1.000 × 12 × 0,27)',
        en: '1000 × (60000 − 50000) − (1000 × 50000 × 0.15 ÷ 100 + 1000 × 60000 × 0.15 ÷ 100 + 1000 × 60000 × 0.1 ÷ 100 + 1000 × 12 × 0.27)',
      },
      ketQua: { vi: '9.771.760 ₫', en: '9771760 ₫' },
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{ban}', giaTri: { vi: '60.000', en: '60000' } },
        { kyHieu: 'P_{mua}', giaTri: { vi: '50.000', en: '50000' } },
        {
          kyHieu: 'F_{mua}',
          moTa: { vi: 'bằng 0,15% của tiền mua', en: 'is 0.15% of the purchase amount' },
        },
        {
          kyHieu: 'F_{ban}',
          moTa: { vi: 'bằng 0,15% của tiền bán', en: 'is 0.15% of the sale proceeds' },
        },
        { kyHieu: 'T', moTa: { vi: 'bằng 0,1% của tiền bán', en: 'is 0.1% of the sale proceeds' } },
        {
          kyHieu: 'F_{lk}',
          moTa: {
            vi: 'bằng 1.000 cổ phiếu nhân 12 tháng nhân 0,27 ₫',
            en: 'is 1000 shares times 12 months times 0.27 ₫',
          },
        },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Vẫn lệnh mua 1.000 cổ phiếu giá 50.000 ₫, bán ở 60.000 ₫ sau 12 tháng. Hãy đặt đúng hai con số vào ô trống của công thức ROI ròng, chú ý mẫu số là vốn thực bỏ ra, đã gồm phí mua và phí lưu ký.',
      en: 'Same trade: 1000 shares bought at 50000 ₫ and sold at 60000 ₫ after 12 months. Put the right two numbers into the slots of the net ROI formula, noting that the denominator is the capital actually committed, buying fee and custody included.',
    },
    facts: [
      {
        label: { vi: 'Lợi nhuận ròng', en: 'Net profit' },
        value: { vi: '9.771.760 ₫', en: '9771760 ₫' },
      },
      {
        label: {
          vi: 'Vốn đã bỏ ra (gồm phí mua và phí lưu ký)',
          en: 'Capital committed (buying fee and custody included)',
        },
        value: { vi: '50.078.240 ₫', en: '50078240 ₫' },
      },
    ],
    expected: 19.512986,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'ROI ròng = [9.771.760] ÷ [50.078.240] × 100',
      en: 'Net ROI = [9771760] ÷ [50078240] × 100',
    },
    verify: {
      inputs: { quantity: 1000, months: 12, buyPrice: 50000, sellPrice: 60000 },
      expected: 19.512986,
      tolerance: 0.01,
    },
    explain: {
      vi: '9.771.760 chia 50.078.240 bằng 0,1951, tức 19,51%. Cả hai vế đều phải "ròng": tử số là lãi sau khi trừ hết phí và thuế, mẫu số là vốn thực sự bỏ ra, tức giá mua CỘNG phí mua và phí lưu ký. Kết quả 20,00% là lãi gộp chia vốn gốc, bỏ qua toàn bộ chi phí ở cả hai vế. 19,54% là lấy đúng tử số nhưng mẫu số chỉ có 50.000.000, quên phần phí đã bỏ ra. 16,67% là chia cho giá bán thay vì cho vốn bỏ ra.',
      en: '9,771,760 divided by 50,078,240 is 0.1951, that is 19.51%. Both sides have to be net: the numerator is profit after every fee and tax, the denominator is the capital actually committed, the purchase PLUS the buying fee and custody. A result of 20.00% divides gross profit by the raw purchase, ignoring costs on both sides. 19.54% takes the right numerator but a denominator of only 50,000,000, forgetting the fees already paid. 16.67% divides by the sale value instead of the capital committed.',
    },
    giai: {
      tinh: { vi: 'ROI ròng sau phí & thuế', en: 'Net ROI after fees and taxes' },
      thaySo: { vi: '9.771.760 ÷ 50.078.240 × 100', en: '9771760 ÷ 50078240 × 100' },
      ketQua: { vi: '19,51%', en: '19.51%' },
      gan: [
        {
          kyHieu: 'L_{rong}',
          moTa: {
            vi: 'là lợi nhuận ròng sau toàn bộ phí và thuế: 9.771.760 ₫',
            en: 'is the net profit after every fee and tax: 9771760 ₫',
          },
        },
        {
          kyHieu: 'Q \\cdot P_{mua} + F_{mua} + F_{lk}',
          giaTri: { vi: '50.078.240', en: '50078240' },
        },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức ROI, chú ý vốn bỏ ra xuất hiện hai lần và mẫu số là vốn chứ không phải giá trị hiện tại.',
      en: 'With the figures below, put the right three numbers into the slots of the ROI formula, noting that the capital invested appears twice and the denominator is the capital, not the current value.',
    },
    facts: [
      {
        label: { vi: 'Vốn bỏ ra', en: 'Capital invested' },
        value: { vi: '100.000.000 ₫', en: '100000000 ₫' },
      },
      {
        label: { vi: 'Giá trị hiện tại', en: 'Current value' },
        value: { vi: '130.000.000 ₫', en: '130000000 ₫' },
      },
    ],
    expected: 30,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'ROI = ([130.000.000] − [100.000.000]) ÷ [100.000.000] × 100',
      en: 'ROI = ([130000000] − [100000000]) ÷ [100000000] × 100',
    },
    verify: { inputs: { cost: 100000000, current: 130000000 }, expected: 30, tolerance: 0.01 },
    explain: {
      vi: 'Phần lãi là 130 triệu trừ 100 triệu bằng 30 triệu, chia cho VỐN BỎ RA 100 triệu, ra 30%. Kết quả 23,08% là chia cho giá trị hiện tại. 130% là tỷ lệ giá trị hiện tại trên vốn, tức quên trừ 1 nên gộp cả phần vốn gốc vào tỷ suất. 30.000.000 ₫ là dừng ở phần lãi. Lưu ý ROI không nói gì về THỜI GIAN: 30% trong 5 ngày và 30% trong 5 năm viết ra giống hệt nhau.',
      en: 'The gain is 130 million minus 100 million, that is 30 million, divided by the CAPITAL INVESTED of 100 million, giving 30%. A result of 23.08% divides by the current value. 130% is current value over cost, forgetting to subtract 1 and so folding the original capital into the return. 30,000,000 ₫ stops at the gain. Note that ROI says nothing about TIME: 30% over five days and 30% over five years are written identically.',
    },
    giai: {
      tinh: { vi: 'tỷ suất lợi nhuận', en: 'Return on investment' },
      thaySo: {
        vi: '(130.000.000 − 100.000.000) ÷ 100.000.000 × 100',
        en: '(130000000 − 100000000) ÷ 100000000 × 100',
      },
      ketQua: { vi: '30%', en: '30%' },
      gan: [
        { kyHieu: 'V_{cuoi}', giaTri: { vi: '130.000.000', en: '130000000' } },
        { kyHieu: 'V_{dau}', giaTri: { vi: '100.000.000', en: '100000000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng bốn con số vào ô trống của công thức HPR, chú ý cổ tức được cộng vào phần chênh giá và giá đầu kỳ xuất hiện hai lần.',
      en: 'With the figures below, put the right four numbers into the slots of the HPR formula, noting that the dividend is added to the price change and the starting price appears twice.',
    },
    facts: [
      {
        label: { vi: 'Giá đầu kỳ', en: 'Price at start' },
        value: { vi: '50.000 ₫', en: '50000 ₫' },
      },
      {
        label: { vi: 'Giá cuối kỳ', en: 'Price at end' },
        value: { vi: '60.000 ₫', en: '60000 ₫' },
      },
      {
        label: { vi: 'Cổ tức nhận trong kỳ', en: 'Dividend received' },
        value: { vi: '2.000 ₫/CP', en: '2000 ₫ a share' },
      },
    ],
    expected: 24,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'HPR = ([60.000] − [50.000] + [2.000]) ÷ [50.000] × 100',
      en: 'HPR = ([60000] − [50000] + [2000]) ÷ [50000] × 100',
    },
    verify: {
      inputs: { startPrice: 50000, endPrice: 60000, dividend: 2000 },
      expected: 24,
      tolerance: 0.01,
    },
    explain: {
      vi: 'HPR cộng CẢ HAI nguồn lợi ích: chênh giá 10.000 ₫ và cổ tức 2.000 ₫, tổng 12.000 ₫, chia cho giá đầu kỳ 50.000 ₫ ra 24%. Kết quả 20% là quên cổ tức, và đó là lỗi khiến mọi so sánh với cổ phiếu trả cổ tức cao bị lệch xuống. 4% là chỉ tính riêng cổ tức, tức tỷ suất cổ tức. 12.000 ₫ là dừng ở tử số, chưa chia cho vốn ban đầu.',
      en: 'HPR adds BOTH sources of return: the 10,000 ₫ price gain and the 2,000 ₫ dividend, 12,000 ₫ together, divided by the 50,000 ₫ starting price gives 24%. A result of 20% drops the dividend, the error that biases every comparison against high-dividend stocks. 4% counts the dividend alone, which is the dividend yield. 12,000 ₫ stops at the numerator, before dividing by the starting capital.',
    },
    giai: {
      tinh: { vi: 'lợi suất kỳ nắm giữ', en: 'Holding period return' },
      thaySo: {
        vi: '(60.000 − 50.000 + 2.000) ÷ 50.000 × 100',
        en: '(60000 − 50000 + 2000) ÷ 50000 × 100',
      },
      ketQua: { vi: '24%', en: '24%' },
      gan: [
        { kyHieu: 'P_{cuoi}', giaTri: { vi: '60.000', en: '60000' } },
        { kyHieu: 'P_{dau}', giaTri: { vi: '50.000', en: '50000' } },
        { kyHieu: 'D', giaTri: { vi: '2.000', en: '2000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức CAGR, chú ý số năm nằm ở mẫu của số mũ.',
      en: 'With the figures below, put the right three numbers into the slots of the CAGR formula, noting that the number of years sits under the exponent.',
    },
    facts: [
      {
        label: { vi: 'Giá trị đầu kỳ', en: 'Value at start' },
        value: { vi: '100.000.000 ₫', en: '100000000 ₫' },
      },
      {
        label: { vi: 'Giá trị cuối kỳ', en: 'Value at end' },
        value: { vi: '133.100.000 ₫', en: '133100000 ₫' },
      },
      { label: { vi: 'Số năm', en: 'Years' }, value: { vi: '3 năm', en: '3 years' } },
    ],
    expected: 10,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%/năm', en: '% a year' },
    worked: {
      vi: 'CAGR = (([133.100.000] ÷ [100.000.000])^(1 ÷ [3]) − 1) × 100',
      en: 'CAGR = (([133100000] ÷ [100000000])^(1 ÷ [3]) − 1) × 100',
    },
    verify: {
      inputs: { start: 100000000, end: 133100000, years: 3 },
      expected: 10,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Hệ số tăng cả kỳ là 133,1 chia 100 bằng 1,331; lấy căn bậc 3 ra 1,1 rồi trừ 1 được 10% mỗi năm. Kết quả 33,10% là tổng mức tăng của CẢ BA NĂM, chưa quy về một năm. 11,03% là chia đều 33,1% cho 3 năm, một phép chia thẳng bỏ qua việc lãi sinh lãi nên luôn cao hơn CAGR thật. 1,331 lần là dừng ở hệ số tăng, chưa lấy căn và chưa trừ 1.',
      en: 'The whole-period growth factor is 133.1 over 100, that is 1.331; the cube root is 1.1, and subtracting 1 leaves 10% a year. A result of 33.10% is the total growth over ALL THREE YEARS, not yet annualized. 11.03% divides 33.1% evenly across three years, a flat split that ignores compounding and so always overstates the true CAGR. 1.331x stops at the growth factor, before the root and the subtraction.',
    },
    giai: {
      tinh: { vi: 'tăng trưởng kép hằng năm', en: 'Compound annual growth rate' },
      thaySo: {
        vi: '((133.100.000 ÷ 100.000.000)^(1 ÷ 3) − 1) × 100',
        en: '((133100000 ÷ 100000000)^(1 ÷ 3) − 1) × 100',
      },
      ketQua: { vi: '10,00%/năm', en: '10.00% a year' },
      gan: [
        { kyHieu: 'V_{cuoi}', giaTri: { vi: '133.100.000', en: '133100000' } },
        { kyHieu: 'V_{dau}', giaTri: { vi: '100.000.000', en: '100000000' } },
        { kyHieu: 't', giaTri: { vi: '3', en: '3' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng hai con số vào ô trống của công thức tỷ suất cổ tức, chú ý mẫu số là giá thị trường chứ không phải mệnh giá.',
      en: 'With the figures below, put the right two numbers into the slots of the dividend yield formula, noting that the denominator is the market price, not the par value.',
    },
    facts: [
      {
        label: { vi: 'Giá thị trường', en: 'Market price' },
        value: { vi: '50.000 ₫', en: '50000 ₫' },
      },
      {
        label: { vi: 'Cổ tức tiền mặt một năm', en: 'Annual cash dividend' },
        value: { vi: '2.500 ₫/CP', en: '2500 ₫ a share' },
      },
    ],
    expected: 5,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Tỷ suất cổ tức = [2.500] ÷ [50.000] × 100',
      en: 'Dividend yield = [2500] ÷ [50000] × 100',
    },
    verify: { inputs: { price: 50000, dividendPerShare: 2500 }, expected: 5, tolerance: 0.01 },
    explain: {
      vi: '2.500 chia 50.000 bằng 0,05, nhân 100 ra 5%: mỗi 100 đồng bỏ ra mua cổ phiếu nhận về 5 đồng cổ tức một năm. Mẫu số là GIÁ THỊ TRƯỜNG chứ không phải mệnh giá, nên cùng một mức cổ tức sẽ cho tỷ suất khác nhau tuỳ giá mua. Kết quả 20 lần là chia ngược. 0,05% là quên nhân 100. 47.500 ₫ là lấy hiệu.',
      en: '2,500 divided by 50,000 is 0.05, times 100 gives 5%: every 100 spent on the share returns 5 in dividends a year. The denominator is the MARKET price, not par value, so the same dividend gives a different yield depending on what you paid. A result of 20x inverts the ratio. 0.05% forgets the times-100 step. 47,500 ₫ subtracts.',
    },
    giai: {
      tinh: { vi: 'Tỷ suất cổ tức', en: 'Dividend yield' },
      thaySo: { vi: '2.500 ÷ 50.000 × 100', en: '2500 ÷ 50000 × 100' },
      ketQua: { vi: '5%', en: '5%' },
      gan: [
        { kyHieu: 'D', giaTri: { vi: '2.500', en: '2500' } },
        { kyHieu: 'P', giaTri: { vi: '50.000', en: '50000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một chiến lược lãi đều 1% mỗi tháng. Hãy đặt đúng hai con số vào ô trống của công thức năm hoá, chú ý số kỳ trong năm nằm ở số mũ chứ không nhân thẳng.',
      en: 'A strategy returns a steady 1% a month. Put the right two numbers into the slots of the annualization formula, noting that the number of periods is an exponent, not a multiplier.',
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
    expected: 12.682503,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Lợi suất năm = ((1 + [1] ÷ 100)^[12] − 1) × 100',
      en: 'Annualized return = ((1 + [1] ÷ 100)^[12] − 1) × 100',
    },
    verify: {
      inputs: { periodReturn: 1, periodsPerYear: 12 },
      expected: 12.682503,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Năm hoá là NHÂN DỒN chứ không phải nhân thẳng: 1,01 mũ 12 bằng 1,1268, trừ 1 ra 12,68%. Kết quả 12,00% là nhân 1% với 12, bỏ qua việc lãi tháng trước lại sinh lãi, và 0,68 điểm phần trăm chênh lệch chính là phần lãi kép ấy. 3,46% là nhân với căn bậc hai của 12, quy ước dùng cho ĐỘ BIẾN ĐỘNG chứ không dùng cho lợi suất. 1,00% là giữ nguyên lợi suất một kỳ.',
      en: 'Annualizing means COMPOUNDING, not multiplying: 1.01 to the twelfth is 1.1268, minus 1 gives 12.68%. A result of 12.00% multiplies 1% by 12, ignoring that each month earns on the previous month, and the 0.68 percentage-point gap is exactly that compounding. 3.46% multiplies by the square root of 12, the convention for VOLATILITY rather than for returns. 1.00% leaves the single-period return untouched.',
    },
    giai: {
      tinh: { vi: 'Lợi suất năm hoá', en: 'Annualized return' },
      thaySo: { vi: '((1 + 1 ÷ 100)^12 − 1) × 100', en: '((1 + 1 ÷ 100)^12 − 1) × 100' },
      ketQua: { vi: '12,68%', en: '12.68%' },
      gan: [
        {
          kyHieu: 'r_{ky}',
          moTa: { vi: 'là lợi suất mỗi tháng: 1%', en: 'is the return per month: 1%' },
        },
        {
          kyHieu: 'm',
          moTa: {
            vi: 'là 12 kỳ, vì kỳ ở đây là tháng',
            en: 'is 12 periods, because a period here is a month',
          },
        },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Gửi tiết kiệm lãi 12%/năm trong khi lạm phát 5%/năm. Hãy đặt đúng hai con số vào ô trống của công thức Fisher, chú ý lạm phát nằm ở mẫu số chứ không bị trừ thẳng.',
      en: 'A deposit pays 12% a year while inflation runs at 5% a year. Put the right two numbers into the slots of the Fisher formula, noting that inflation sits in the denominator rather than being subtracted.',
    },
    facts: [
      {
        label: { vi: 'Lợi suất danh nghĩa', en: 'Nominal return' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
      { label: { vi: 'Lạm phát', en: 'Inflation' }, value: { vi: '5%/năm', en: '5% a year' } },
    ],
    expected: 6.666667,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Lợi suất thực = ((1 + [12] ÷ 100) ÷ (1 + [5] ÷ 100) − 1) × 100',
      en: 'Real return = ((1 + [12] ÷ 100) ÷ (1 + [5] ÷ 100) − 1) × 100',
    },
    verify: { inputs: { nominal: 12, inflation: 5 }, expected: 6.666667, tolerance: 0.01 },
    explain: {
      vi: 'Công thức Fisher CHIA chứ không trừ: 1,12 chia 1,05 bằng 1,0667, trừ 1 ra 6,67%. Kết quả 7,00% là phép trừ 12 trừ 5, một xấp xỉ khá sát khi lạm phát thấp nhưng lệch dần khi lạm phát cao, và ở đây đã cao hơn con số đúng 0,33 điểm phần trăm. 17,00% là cộng thay vì trừ. 2,4 lần là chia thẳng 12 cho 5, hai con số phần trăm chia cho nhau thì không còn là một suất sinh lời.',
      en: 'The Fisher relation DIVIDES rather than subtracts: 1.12 over 1.05 is 1.0667, minus 1 gives 6.67%. A result of 7.00% is 12 minus 5, a fair approximation at low inflation that drifts as inflation rises, and here it already overstates by 0.33 percentage points. 17.00% adds instead of subtracting. 2.4x divides 12 by 5, and one percentage divided by another is no longer a rate of return.',
    },
    giai: {
      tinh: { vi: 'Lợi suất thực sau lạm phát', en: 'real return after inflation' },
      thaySo: {
        vi: '((1 + 12 ÷ 100) ÷ (1 + 5 ÷ 100) − 1) × 100',
        en: '((1 + 12 ÷ 100) ÷ (1 + 5 ÷ 100) − 1) × 100',
      },
      ketQua: { vi: '6,67%', en: '6.67%' },
      gan: [
        { kyHieu: 'r_{danh\\,nghia}', giaTri: { vi: '12', en: '12' } },
        { kyHieu: '\\pi', moTa: { vi: 'là lạm phát 5% một năm', en: 'is inflation of 5% a year' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Một khoản vay ghi lãi suất 12%/năm, ghép lãi theo QUÝ. Hãy đặt đúng ba con số vào ô trống của công thức lãi suất hiệu dụng năm, chú ý số lần ghép lãi xuất hiện hai lần.',
      en: 'A loan quotes 12% a year compounded QUARTERLY. Put the right three numbers into the slots of the effective annual rate formula, noting that the compounding count appears twice.',
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
    expected: 12.550881,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'EAR = ((1 + [12] ÷ 100 ÷ [4])^[4] − 1) × 100',
      en: 'EAR = ((1 + [12] ÷ 100 ÷ [4])^[4] − 1) × 100',
    },
    verify: { inputs: { rate: 12, perYear: 4 }, expected: 12.550881, tolerance: 0.01 },
    explain: {
      vi: 'Mỗi quý cộng 12 chia 4 bằng 3%, và lãi quý trước lại sinh lãi: 1,03 mũ 4 bằng 1,1255, trừ 1 ra 12,55%. Kết quả 12,00% là lãi DANH NGHĨA, con số ghi trên hợp đồng, và chênh 0,55 điểm phần trăm là cái giá của việc ghép lãi bốn lần. 12,68% là ghép theo THÁNG, tức đọc nhầm kỳ ghép lãi. 48,00% là nhân 12% với 4, nhầm lãi suất năm thành lãi suất quý.',
      en: 'Each quarter adds 12 over 4, that is 3%, and each quarter earns on the last: 1.03 to the fourth is 1.1255, minus 1 gives 12.55%. A result of 12.00% is the NOMINAL rate printed in the contract, and the 0.55 percentage-point gap is the price of compounding four times. 12.68% compounds MONTHLY, misreading the compounding period. 48.00% multiplies 12% by 4, treating the annual rate as a quarterly one.',
    },
    giai: {
      tinh: { vi: 'Lãi suất hiệu dụng năm (EAR)', en: 'Effective annual rate' },
      thaySo: { vi: '((1 + 12 ÷ 100 ÷ 4)^4 − 1) × 100', en: '((1 + 12 ÷ 100 ÷ 4)^4 − 1) × 100' },
      ketQua: { vi: '12,55%', en: '12.55%' },
      gan: [
        { kyHieu: 'r', giaTri: { vi: '12', en: '12' } },
        { kyHieu: 'm', giaTri: { vi: '4', en: '4' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức tổng lợi suất có tái đầu tư cổ tức, chú ý tăng giá và cổ tức nhân dồn riêng rồi mới ghép.',
      en: 'With the figures below, put the right three numbers into the slots of the total return formula with dividends reinvested, noting that price growth and dividends compound separately before being combined.',
    },
    facts: [
      { label: { vi: 'Tăng giá', en: 'Price growth' }, value: { vi: '8%/năm', en: '8% a year' } },
      {
        label: { vi: 'Tỷ suất cổ tức', en: 'Dividend yield' },
        value: { vi: '2%/năm', en: '2% a year' },
      },
      { label: { vi: 'Số năm', en: 'Years' }, value: { vi: '3 năm', en: '3 years' } },
    ],
    expected: 33.681645,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%', en: '%' },
    worked: {
      vi: 'Tổng lợi suất = (((1 + [8] ÷ 100) × (1 + [2] ÷ 100))^[3] − 1) × 100',
      en: 'Total return = (((1 + [8] ÷ 100) × (1 + [2] ÷ 100))^[3] − 1) × 100',
    },
    verify: {
      inputs: { priceGrowth: 8, dividendYield: 2, years: 3 },
      expected: 33.681645,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Hai nguồn lợi ích nhân dồn RIÊNG rồi mới ghép: 1,08 mũ 3 bằng 1,2597 cho phần tăng giá, 1,02 mũ 3 bằng 1,0612 cho phần cổ tức tái đầu tư, nhân hai hệ số ra 1,3368, trừ 1 được 33,68%. Kết quả 33,10% là gộp 8% với 2% thành 10% rồi mới luỹ thừa, tức bỏ qua việc cổ tức sau khi tái đầu tư cũng sinh lời riêng. 30,00% là nhân thẳng 10% với 3 năm, không có lãi kép. 25,97% là chỉ tính phần tăng giá, quên hẳn cổ tức.',
      en: 'The two sources compound SEPARATELY before being combined: 1.08 cubed is 1.2597 for price growth, 1.02 cubed is 1.0612 for reinvested dividends, and the product 1.3368 minus 1 gives 33.68%. A result of 33.10% merges 8% and 2% into 10% before compounding, ignoring that reinvested dividends earn on their own. 30.00% multiplies 10% by three years with no compounding at all. 25.97% counts price growth only, dropping dividends entirely.',
    },
    giai: {
      tinh: {
        vi: 'Tổng lợi suất có tái đầu tư cổ tức',
        en: 'Total return with reinvested dividends',
      },
      thaySo: {
        vi: '(((1 + 8 ÷ 100) × (1 + 2 ÷ 100))^3 − 1) × 100',
        en: '(((1 + 8 ÷ 100) × (1 + 2 ÷ 100))^3 − 1) × 100',
      },
      ketQua: { vi: '33,68%', en: '33.68%' },
      gan: [
        { kyHieu: 'g', giaTri: { vi: '8', en: '8' } },
        { kyHieu: 'y', giaTri: { vi: '2', en: '2' } },
        { kyHieu: 'n', giaTri: { vi: '3', en: '3' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Năm thứ nhất danh mục lãi 50%, năm thứ hai lỗ 50%. Hãy đặt độ lớn của hai lợi suất ấy vào ô trống của công thức trung bình hình học; dấu cộng của năm lãi và dấu trừ của năm lỗ đã viết sẵn.',
      en: 'A portfolio gains 50% in year one and loses 50% in year two. Put the size of each return into the slots of the geometric mean formula; the plus sign of the gain year and the minus sign of the loss year are already written in.',
    },
    facts: [
      { label: { vi: 'Lợi suất năm 1', en: 'Year 1 return' }, value: { vi: '+50%', en: '+50%' } },
      { label: { vi: 'Lợi suất năm 2', en: 'Year 2 return' }, value: { vi: '−50%', en: '−50%' } },
    ],
    expected: -13.39746,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%/năm', en: '% a year' },
    worked: {
      vi: 'Lợi suất hình học = (((1 + [50] ÷ 100) × (1 − [50] ÷ 100))^(1 ÷ 2) − 1) × 100',
      en: 'Geometric return = (((1 + [50] ÷ 100) × (1 − [50] ÷ 100))^(1 ÷ 2) − 1) × 100',
    },
    verify: {
      inputs: { periods: 2, r1: 50, r2: -50, r3: 0 },
      expected: -13.39746,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Nhân dồn hai hệ số rồi mới lấy căn: 1,5 nhân 0,5 bằng 0,75, căn bậc hai của 0,75 là 0,866, trừ 1 ra −13,40% mỗi năm. Kết quả 0% là trung bình CỘNG, đúng về số học nhưng sai về tiền: 100 lên 150 rồi còn 75, tức mất một phần tư vốn trong khi trung bình cộng báo hoà. −25% chính là mức lỗ của CẢ KỲ, chưa chia về một năm. −12,5% là chia đôi mức lỗ cả kỳ, một phép chia thẳng bỏ qua lãi kép.',
      en: 'Chain the two factors first, then take the root: 1.5 times 0.5 is 0.75, the square root of 0.75 is 0.866, minus 1 gives −13.40% a year. A result of 0% is the ARITHMETIC mean, correct as arithmetic and wrong as money: 100 rises to 150 and ends at 75, a quarter of the capital gone while the average reports break-even. −25% is the loss over the WHOLE period, not yet per year. −12.5% halves that period loss, a flat split that ignores compounding.',
    },
    giai: {
      tinh: { vi: 'Lợi suất trung bình hình học', en: 'Geometric mean return' },
      thaySo: {
        vi: '(((1 + 50 ÷ 100) × (1 − 50 ÷ 100))^(1 ÷ 2) − 1) × 100',
        en: '(((1 + 50 ÷ 100) × (1 − 50 ÷ 100))^(1 ÷ 2) − 1) × 100',
      },
      ketQua: { vi: '−13,40%/năm', en: '−13.40% a year' },
      gan: [
        {
          kyHieu: 'r_k',
          moTa: {
            vi: 'là lợi suất từng năm: năm 1 lãi 50%, năm 2 lỗ 50%',
            en: 'is each year’s return: a 50% gain in year 1, a 50% loss in year 2',
          },
        },
        { kyHieu: 'n', moTa: { vi: 'là 2 năm', en: 'is 2 years' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bỏ ra 100 triệu ₫ và nhận đều 30 triệu ₫ mỗi kỳ trong 4 kỳ; máy tính tài chính dò ra IRR bằng 7,7138% mỗi kỳ. IRR không có công thức tính thẳng, nên cách kiểm là chiết khấu các khoản thu theo đúng IRR ấy xem có ra lại số vốn bỏ ra không. Hãy đặt đúng hai con số vào ô trống của công thức niên kim.',
      en: 'You invest 100 million ₫ and receive 30 million ₫ each period for 4 periods; a financial calculator finds an IRR of 7.7138% a period. The IRR has no closed-form formula, so the check is to discount the payments at that IRR and see whether they add back up to the outlay. Put the right two numbers into the slots of the annuity formula.',
    },
    facts: [
      {
        label: { vi: 'Vốn bỏ ra ban đầu', en: 'Initial outlay' },
        value: { vi: '100.000.000 ₫', en: '100000000 ₫' },
      },
      {
        label: { vi: 'Khoản nhận mỗi kỳ', en: 'Payment per period' },
        value: { vi: '30.000.000 ₫', en: '30000000 ₫' },
      },
      { label: { vi: 'Số kỳ', en: 'Number of periods' }, value: { vi: '4 kỳ', en: '4 periods' } },
      {
        label: { vi: 'IRR máy tính tài chính dò ra', en: 'IRR found by a financial calculator' },
        value: { vi: '7,7138%/kỳ', en: '7.7138% a period' },
      },
    ],
    expected: 100000000,
    tolerance: { kind: 'tuong-doi', value: 0.001 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Vốn bỏ ra = [30.000.000] × (1 − 1 ÷ (1 + 7,7138 ÷ 100)^[4]) ÷ (7,7138 ÷ 100)',
      en: 'Initial outlay = [30000000] × (1 − 1 ÷ (1 + 7.7138 ÷ 100)^[4]) ÷ (7.7138 ÷ 100)',
    },
    verify: {
      inputs: { investment: 100000000, payment: 30000000, periods: 4 },
      expected: 7.713847,
      tolerance: 0.01,
    },
    explain: {
      vi: 'IRR là mức chiết khấu làm cho bốn khoản 30 triệu, mỗi khoản chiết khấu về hiện tại theo kỳ của nó, cộng lại vừa đúng 100 triệu — ở đây là 7,71% mỗi kỳ. Không có công thức đóng, phải dò nghiệm, và đó là lý do con số không tròn. Kết quả 20,00% là tổng lãi 20 triệu chia vốn 100 triệu, bỏ qua hẳn thời điểm nhận tiền. 5,00% là chia tổng lãi ấy cho 4 kỳ rồi cho vốn. 30,00% là lấy khoản nhận chia vốn, tức nhầm dòng tiền hoàn vốn với tiền lãi.',
      en: 'IRR is the discount rate that makes the four 30-million payments, each discounted back over its own period, add up to exactly 100 million, which here is 7.71% a period. There is no closed form, it has to be solved numerically, which is why the figure is not round. A result of 20.00% divides the 20 million total gain by the 100 million invested, ignoring when the money arrives. 5.00% spreads that gain over four periods first. 30.00% divides the payment by the outlay, mistaking the return of capital for the return on it.',
    },
    giai: {
      tinh: {
        vi: 'giá trị hôm nay của 4 khoản thu, chiết khấu theo IRR',
        en: 'today’s value of the four payments, discounted at the IRR',
      },
      thaySo: {
        vi: '30.000.000 × (1 − 1 ÷ (1 + 7,7138 ÷ 100)^4) ÷ (7,7138 ÷ 100)',
        en: '30000000 × (1 − 1 ÷ (1 + 7.7138 ÷ 100)^4) ÷ (7.7138 ÷ 100)',
      },
      ketQua: { vi: '100.000.000 ₫', en: '100000000 ₫' },
      gan: [
        { kyHieu: 'C', giaTri: { vi: '30.000.000', en: '30000000' } },
        { kyHieu: 'n', giaTri: { vi: '4', en: '4' } },
        {
          kyHieu: 'IRR',
          moTa: {
            vi: 'là mức máy tính tài chính dò ra: 7,7138% mỗi kỳ',
            en: 'is the rate a financial calculator finds: 7.7138% a period',
          },
        },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Vốn sinh lời 6%/năm, ghép lãi hằng năm. Hãy đặt lãi suất vào ô trống của công thức thời gian nhân đôi CHÍNH XÁC, chứ không phải quy tắc 72.',
      en: 'Capital compounds at 6% a year. Put the rate into the slot of the EXACT doubling-time formula, not the rule of 72.',
    },
    facts: [
      { label: { vi: 'Lãi suất', en: 'Interest rate' }, value: { vi: '6%/năm', en: '6% a year' } },
    ],
    expected: 11.895661,
    tolerance: { kind: 'tuyet-doi', value: 0.05 },
    unit: { vi: 'năm', en: 'years' },
    worked: {
      vi: 'Thời gian nhân đôi = ln(2) ÷ ln(1 + [6] ÷ 100)',
      en: 'Doubling time = ln(2) ÷ ln(1 + [6] ÷ 100)',
    },
    verify: { inputs: { rate: 6 }, expected: 11.895661, tolerance: 0.05 },
    explain: {
      vi: 'Nghiệm chính xác là logarit của 2 chia cho logarit của 1,06, ra 11,90 năm. Kết quả 12,0 năm là XẤP XỈ theo quy tắc 72, tức 72 chia 6, và nó sai chưa tới hai tháng nên vẫn rất đáng dùng để nhẩm nhanh — nhưng nó là ước lượng, không phải kết quả của phép tính. Quy tắc 72 sát nhất quanh mức lãi 8% và lệch dần khi lãi suất cao. 16,7 năm là lấy 100 chia 6, một quy tắc không có cơ sở. 6,0 năm là lấy luôn con số lãi suất.',
      en: 'The exact solution is the logarithm of 2 divided by the logarithm of 1.06, which is 11.90 years. A result of 12.0 is the rule-of-72 APPROXIMATION, 72 over 6, and it is off by less than two months, so it remains an excellent mental shortcut, but it is an estimate rather than the result of the calculation. The rule of 72 is closest around 8% and drifts as rates rise. 16.7 years divides 100 by 6, a rule with no basis. 6.0 years simply repeats the interest rate.',
    },
    giai: {
      tinh: { vi: 'Thời gian nhân đôi vốn', en: 'doubling time' },
      thaySo: { vi: 'ln(2) ÷ ln(1 + 6 ÷ 100)', en: 'ln(2) ÷ ln(1 + 6 ÷ 100)' },
      ketQua: { vi: '11,9 năm', en: '11.9 years' },
      gan: [{ kyHieu: 'r', moTa: { vi: 'là lãi suất 6% một năm', en: 'is the 6% annual rate' } }],
    },
    source: { url: 'https://en.wikipedia.org/wiki/Rule_of_72', kind: 'giao-khoa', vietnam: false },
  },
  {
    id: 'Q390',
    formulaId: 'loi-suat-quy-nam-theo-ngay',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Mua ở 50.000 ₫, bán ở 55.000 ₫ sau 73 ngày. Hãy đặt đúng ba con số vào ô trống của công thức quy năm, chú ý số ngày nắm giữ nằm dưới 365 ở số mũ.',
      en: 'Bought at 50000 ₫ and sold at 55000 ₫ after 73 days. Put the right three numbers into the slots of the annualization formula, noting that the days held sit under 365 in the exponent.',
    },
    facts: [
      { label: { vi: 'Giá mua', en: 'Buy price' }, value: { vi: '50.000 ₫', en: '50000 ₫' } },
      { label: { vi: 'Giá bán', en: 'Sell price' }, value: { vi: '55.000 ₫', en: '55000 ₫' } },
      {
        label: { vi: 'Số ngày nắm giữ', en: 'Days held' },
        value: { vi: '73 ngày', en: '73 days' },
      },
    ],
    expected: 61.051,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: '%/năm', en: '% a year' },
    worked: {
      vi: 'Lợi suất quy năm = (([55.000] ÷ [50.000])^(365 ÷ [73]) − 1) × 100',
      en: 'Annualized return = (([55000] ÷ [50000])^(365 ÷ [73]) − 1) × 100',
    },
    verify: {
      inputs: { buyPrice: 50000, sellPrice: 55000, days: 73 },
      expected: 61.051,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Lợi suất kỳ nắm giữ là 5.000 chia 50.000 bằng 10%. Một năm có 365 chia 73 bằng 5 kỳ như thế, và quy năm là NHÂN DỒN: 1,1 mũ 5 bằng 1,61051, trừ 1 ra 61,05%. Kết quả 50,00% là nhân thẳng 10% với 5, bỏ qua lãi kép. 10,00% là giữ nguyên lợi suất kỳ nắm giữ, chưa quy năm. 2,00% là chia 10% cho 5. Lưu ý con số 61% này chỉ là phép quy đổi, KHÔNG có nghĩa cả năm sẽ lãi 61%.',
      en: 'The holding period return is 5,000 over 50,000, that is 10%. A year holds 365 over 73, five such periods, and annualizing means COMPOUNDING: 1.1 to the fifth is 1.61051, minus 1 gives 61.05%. A result of 50.00% multiplies 10% by 5, ignoring compounding. 10.00% leaves the holding period return unconverted. 2.00% divides 10% by 5. Note that the 61% figure is only a conversion, it does NOT mean the year will return 61%.',
    },
    giai: {
      tinh: { vi: 'Lợi suất quy năm theo số ngày', en: 'Annualized holding period return' },
      thaySo: {
        vi: '((55.000 ÷ 50.000)^(365 ÷ 73) − 1) × 100',
        en: '((55000 ÷ 50000)^(365 ÷ 73) − 1) × 100',
      },
      ketQua: { vi: '61,05%/năm', en: '61.05% a year' },
      gan: [
        { kyHieu: 'P_{ban}', giaTri: { vi: '55.000', en: '55000' } },
        { kyHieu: 'P_{mua}', giaTri: { vi: '50.000', en: '50000' } },
        { kyHieu: 'd', giaTri: { vi: '73', en: '73' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Danh mục lãi 18% trong khi chỉ số tham chiếu lãi 12%. Hãy đặt đúng hai con số vào ô trống của công thức lợi suất vượt chuẩn, chú ý thứ tự của phép trừ.',
      en: 'A portfolio returns 18% while the benchmark returns 12%. Put the right two numbers into the slots of the excess return formula, minding the order of the subtraction.',
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
    expected: 6,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'điểm phần trăm', en: 'percentage points' },
    worked: { vi: 'Lợi suất vượt chuẩn = [18] − [12]', en: 'Excess return = [18] − [12]' },
    verify: { inputs: { portfolioReturn: 18, benchmarkReturn: 12 }, expected: 6, tolerance: 0.01 },
    explain: {
      vi: 'Lợi suất vượt chuẩn là phép TRỪ hai lợi suất: 18 trừ 12 bằng 6 điểm phần trăm. Kết quả 50% là mức vượt TƯƠNG ĐỐI (6 chia 12), một cách nói khác và không so sánh được với con số vượt chuẩn của danh mục khác. 1,5 lần là tỷ lệ 18 trên 12. 30% là cộng hai lợi suất. Lưu ý vượt chuẩn 6 điểm chưa chắc là làm tốt: nếu phần vượt ấy đến từ việc gánh rủi ro cao hơn chỉ số thì alpha điều chỉnh rủi ro vẫn có thể âm.',
      en: 'Excess return is a SUBTRACTION of two returns: 18 minus 12 is 6 percentage points. A result of 50% is the RELATIVE outperformance (6 over 12), a different statement that cannot be compared with another portfolio excess return. 1.5x is the ratio of 18 to 12. 30% adds the two returns. Note that beating the benchmark by 6 points is not automatically good: if the excess came from carrying more risk than the index, risk-adjusted alpha can still be negative.',
    },
    giai: {
      tinh: { vi: 'Lợi suất vượt chuẩn', en: 'Excess return' },
      thaySo: { vi: '18 − 12', en: '18 − 12' },
      ketQua: { vi: '6 điểm phần trăm', en: '6 percentage points' },
      gan: [
        { kyHieu: 'r_{p}', giaTri: { vi: '18', en: '18' } },
        { kyHieu: 'r_{b}', giaTri: { vi: '12', en: '12' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Theo quy tắc 2%, hãy đặt đúng bốn con số vào ô trống của công thức cỡ lệnh, chú ý mẫu số là khoảng lỗ trên mỗi cổ phiếu, tức giá vào trừ giá dừng lỗ.',
      en: 'Under the 2% rule, put the right four numbers into the slots of the position size formula, noting that the denominator is the loss per share, entry minus stop.',
    },
    facts: [
      {
        label: { vi: 'Vốn tài khoản', en: 'Account equity' },
        value: { vi: '500.000.000 ₫', en: '500000000 ₫' },
      },
      {
        label: { vi: 'Rủi ro cho phép mỗi lệnh', en: 'Risk allowed per trade' },
        value: { vi: '2%', en: '2%' },
      },
      {
        label: { vi: 'Giá vào lệnh', en: 'Entry price' },
        value: { vi: '50.000 ₫', en: '50000 ₫' },
      },
      {
        label: { vi: 'Giá dừng lỗ', en: 'Stop-loss price' },
        value: { vi: '45.000 ₫', en: '45000 ₫' },
      },
    ],
    expected: 2000,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: 'CP', en: 'shares' },
    worked: {
      vi: 'Cỡ lệnh = [500.000.000] × [2] ÷ 100 ÷ ([50.000] − [45.000])',
      en: 'Position size = [500000000] × [2] ÷ 100 ÷ ([50000] − [45000])',
    },
    verify: {
      inputs: { capital: 500000000, riskPercent: 2, entryPrice: 50000, stopPrice: 45000 },
      expected: 2000,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Hai bước. Số tiền được phép mất: 500.000.000 nhân 2% bằng 10.000.000 ₫. Mức lỗ trên mỗi cổ phiếu nếu chạm dừng lỗ: 50.000 trừ 45.000 bằng 5.000 ₫. Chia ra được 2.000 cổ phiếu. Điểm cốt lõi là cỡ lệnh được SUY NGƯỢC từ khoảng cách dừng lỗ, chứ không chọn trước rồi mới tìm chỗ đặt dừng lỗ. Kết quả 10.000 CP là lấy 500 triệu chia giá vào lệnh, tức dồn hết vốn. 200 CP là lấy 10 triệu chia giá vào lệnh, nhầm khoảng lỗ thành cả giá cổ phiếu. 222 CP là chia cho giá dừng lỗ theo cùng lối nhầm ấy.',
      en: 'Two steps. The money at risk: 500,000,000 times 2% is 10,000,000 ₫. The loss per share if the stop is hit: 50,000 minus 45,000 is 5,000 ₫. Dividing gives 2,000 shares. The key point is that position size is DERIVED from the stop distance, not chosen first and given a stop afterwards. A result of 10,000 divides the whole 500 million by the entry price, committing everything. 200 divides 10 million by the entry price, mistaking the stop distance for the full share price. 222 does the same against the stop price.',
    },
    giai: {
      tinh: { vi: 'Cỡ lệnh theo % rủi ro', en: 'Risk-based position size' },
      thaySo: {
        vi: '500.000.000 × 2 ÷ 100 ÷ (50.000 − 45.000)',
        en: '500000000 × 2 ÷ 100 ÷ (50000 − 45000)',
      },
      ketQua: { vi: '2.000 CP', en: '2000 shares' },
      gan: [
        { kyHieu: 'V', giaTri: { vi: '500.000.000', en: '500000000' } },
        { kyHieu: 'r', giaTri: { vi: '2', en: '2' } },
        { kyHieu: 'P_{vao}', giaTri: { vi: '50.000', en: '50000' } },
        { kyHieu: 'P_{cat}', giaTri: { vi: '45.000', en: '45000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng bốn con số vào ô trống của công thức giá lý thuyết hợp đồng tương lai, chú ý cổ tức được trừ khỏi lãi suất và số ngày tới đáo hạn nằm trên 365.',
      en: 'With the figures below, put the right four numbers into the slots of the theoretical futures price formula, noting that the dividend yield is subtracted from the rate and the days to expiry sit over 365.',
    },
    facts: [
      {
        label: { vi: 'Chỉ số cơ sở', en: 'Spot index' },
        value: { vi: '1.200 điểm', en: '1200 points' },
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
    expected: 1202.9589,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'điểm', en: 'points' },
    worked: {
      vi: 'Giá lý thuyết = [1.200] × (1 + ([4,8] − [1,8]) ÷ 100 × [30] ÷ 365)',
      en: 'Theoretical price = [1200] × (1 + ([4.8] − [1.8]) ÷ 100 × [30] ÷ 365)',
    },
    verify: {
      inputs: { indexValue: 1200, riskFreeRate: 4.8, dividendYield: 1.8, days: 30 },
      expected: 1202.9589,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Chi phí nắm giữ là phần chênh giữa lãi vay và cổ tức, tính theo số ngày còn lại: 4,8% trừ 1,8% bằng 3% một năm, nhân 30 chia 365 ra 0,2466%, nhân với 1.200 điểm được 2,96 điểm. Cộng vào chỉ số cơ sở ra 1.202,96 điểm. Kết quả 1.200,00 điểm là bỏ hẳn chi phí nắm giữ. 1.236,00 điểm là tính đủ 3% cho CẢ NĂM thay vì cho 30 ngày. 1.197,04 điểm là trừ thay vì cộng. Giá lý thuyết không phải dự báo của thị trường về mức chỉ số khi đáo hạn.',
      en: 'The cost of carry is the gap between the financing rate and the dividend yield, prorated over the days remaining: 4.8% minus 1.8% is 3% a year, times 30 over 365 gives 0.2466%, times 1,200 points is 2.96 points. Added to the spot index that is 1,202.96 points. A result of 1,200.00 drops the carry entirely. 1,236.00 applies the full 3% for a WHOLE YEAR instead of 30 days. 1,197.04 subtracts instead of adding. The theoretical price is not a market forecast of where the index will be at expiry.',
    },
    giai: {
      tinh: { vi: 'Giá lý thuyết hợp đồng tương lai', en: 'Theoretical futures price' },
      thaySo: {
        vi: '1.200 × (1 + (4,8 − 1,8) ÷ 100 × 30 ÷ 365)',
        en: '1200 × (1 + (4.8 − 1.8) ÷ 100 × 30 ÷ 365)',
      },
      ketQua: { vi: '1.202,96 điểm', en: '1202.96 points' },
      gan: [
        { kyHieu: 'S', giaTri: { vi: '1.200', en: '1200' } },
        { kyHieu: 'r', giaTri: { vi: '4,8', en: '4.8' } },
        { kyHieu: 'q', giaTri: { vi: '1,8', en: '1.8' } },
        { kyHieu: 'd', giaTri: { vi: '30', en: '30' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Hợp đồng tương lai đang ở 1.206 điểm trong khi chỉ số VN30 ở 1.200 điểm. Hãy đặt đúng hai con số vào ô trống của công thức basis, chú ý thứ tự của phép trừ vì dấu của basis mang thông tin.',
      en: 'The futures trade at 1206 points while the VN30 index is at 1200. Put the right two numbers into the slots of the basis formula, minding the order of the subtraction, since the sign of the basis carries meaning.',
    },
    facts: [
      {
        label: { vi: 'Giá hợp đồng tương lai', en: 'Futures price' },
        value: { vi: '1.206 điểm', en: '1206 points' },
      },
      {
        label: { vi: 'Chỉ số cơ sở', en: 'Spot index' },
        value: { vi: '1.200 điểm', en: '1200 points' },
      },
    ],
    expected: 6,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'điểm', en: 'points' },
    worked: { vi: 'Basis = [1.206] − [1.200]', en: 'Basis = [1206] − [1200]' },
    verify: { inputs: { futuresPoints: 1206, indexValue: 1200 }, expected: 6, tolerance: 0.01 },
    explain: {
      vi: 'Basis là giá hợp đồng tương lai TRỪ chỉ số cơ sở: 1.206 trừ 1.200 bằng +6 điểm, tức thị trường phái sinh đang cao hơn cơ sở. Dấu mang thông tin nên không được đảo: basis dương là trạng thái thông thường khi lãi vay cao hơn cổ tức. Kết quả −6 điểm là trừ ngược. +0,5 điểm là con số phần trăm (6 chia 1.200) gắn nhầm đơn vị điểm. 1,005 lần là lấy tỷ lệ hai giá, quên trừ đi phần cơ sở.',
      en: 'The basis is the futures price MINUS the spot index: 1,206 minus 1,200 is +6 points, meaning the derivative trades above the underlying. The sign carries information, so it must not be flipped: a positive basis is the normal state when financing costs exceed the dividend yield. A result of −6 subtracts the wrong way round. +0.5 is the percentage figure (6 over 1,200) mislabelled as points. 1.005x takes the ratio of the two prices, forgetting to net off the underlying.',
    },
    giai: {
      tinh: { vi: 'chênh giá so với chỉ số', en: 'Futures basis' },
      thaySo: { vi: '1.206 − 1.200', en: '1206 − 1200' },
      ketQua: { vi: '+6 điểm', en: '+6 points' },
      gan: [
        { kyHieu: 'F', giaTri: { vi: '1.206', en: '1206' } },
        { kyHieu: 'S', giaTri: { vi: '1.200', en: '1200' } },
      ],
    },
    source: { url: 'https://www.finhay.com.vn/basis-la-gi', kind: 'giao-khoa', vietnam: true },
  },
  {
    id: 'Q395',
    formulaId: 'lai-lo-vi-the-short',
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Bạn mở vị thế Short 2 hợp đồng ở 1.250 điểm và đóng ở 1.230 điểm. Hãy đặt đúng ba con số vào ô trống của công thức lãi lỗ vị thế Short; hệ số 100.000 ₫ mỗi điểm đã viết sẵn. Chú ý vị thế Short lấy điểm mở trừ điểm đóng.',
      en: 'You open a short of 2 contracts at 1250 points and close at 1230. Put the right three numbers into the slots of the short position P&L formula; the 100000 ₫ per point multiplier is already written in. Note that a short takes entry minus exit.',
    },
    facts: [
      {
        label: { vi: 'Điểm mở vị thế', en: 'Entry points' },
        value: { vi: '1.250 điểm', en: '1250 points' },
      },
      {
        label: { vi: 'Điểm đóng vị thế', en: 'Exit points' },
        value: { vi: '1.230 điểm', en: '1230 points' },
      },
      { label: { vi: 'Số hợp đồng', en: 'Contracts' }, value: { vi: '2 HĐ', en: '2 contracts' } },
    ],
    expected: 4000000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Lãi/lỗ Short = ([1.250] − [1.230]) × 100.000 × [2]',
      en: 'Short P&L = ([1250] − [1230]) × 100000 × [2]',
    },
    verify: {
      inputs: { entryPoints: 1250, exitPoints: 1230, contracts: 2 },
      expected: 4000000,
      tolerance: 1,
    },
    explain: {
      vi: 'Vị thế Short lãi khi chỉ số GIẢM, nên lấy điểm mở trừ điểm đóng: 1.250 trừ 1.230 bằng 20 điểm. Mỗi điểm của hợp đồng VN30F trị giá 100.000 ₫, nhân 2 hợp đồng ra 4.000.000 ₫ lãi. Kết quả lỗ 4.000.000 ₫ là tính theo chiều của vị thế Long, đúng con số nhưng ngược dấu. Lãi 2.000.000 ₫ là quên nhân số hợp đồng. Lãi 40 ₫ là quên hệ số nhân 100.000 ₫ mỗi điểm.',
      en: 'A short position gains when the index FALLS, so take entry minus exit: 1,250 minus 1,230 is 20 points. Each VN30F point is worth 100,000 ₫, times 2 contracts gives a 4,000,000 ₫ profit. A result of loss applies the long direction, right number and wrong sign. A 2,000,000 ₫ profit forgets the contract count. A 40 ₫ profit forgets the 100,000 ₫ multiplier per point.',
    },
    giai: {
      tinh: { vi: 'Lãi/lỗ vị thế Short', en: 'Short futures position P&L' },
      thaySo: { vi: '(1.250 − 1.230) × 100.000 × 2', en: '(1250 − 1230) × 100000 × 2' },
      ketQua: { vi: 'Lãi 4.000.000 ₫', en: 'Profit of 4000000 ₫' },
      gan: [
        { kyHieu: 'P_{mo}', giaTri: { vi: '1.250', en: '1250' } },
        { kyHieu: 'P_{dong}', giaTri: { vi: '1.230', en: '1230' } },
        { kyHieu: 'm', giaTri: { vi: '100.000', en: '100000' } },
        { kyHieu: 'N', giaTri: { vi: '2', en: '2' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức số hợp đồng tối đa; hệ số 100.000 ₫ mỗi điểm đã viết sẵn. Chú ý mẫu số là tiền ký quỹ cho MỘT hợp đồng.',
      en: 'With the figures below, put the right three numbers into the slots of the maximum contracts formula; the 100000 ₫ per point multiplier is already written in. Note that the denominator is the margin for ONE contract.',
    },
    facts: [
      {
        label: { vi: 'Vốn tài khoản', en: 'Account equity' },
        value: { vi: '200.000.000 ₫', en: '200000000 ₫' },
      },
      {
        label: { vi: 'Giá hợp đồng', en: 'Futures price' },
        value: { vi: '1.250 điểm', en: '1250 points' },
      },
      { label: { vi: 'Tỷ lệ ký quỹ', en: 'Margin ratio' }, value: { vi: '20%', en: '20%' } },
    ],
    expected: 8,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: 'HĐ', en: 'contracts' },
    worked: {
      vi: 'Số hợp đồng tối đa = [200.000.000] ÷ ([1.250] × 100.000 × [20] ÷ 100)',
      en: 'Max contracts = [200000000] ÷ ([1250] × 100000 × [20] ÷ 100)',
    },
    verify: {
      inputs: { capital: 200000000, futuresPoints: 1250, marginRatio: 20 },
      expected: 8,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Giá trị danh nghĩa một hợp đồng là 1.250 nhân 100.000 bằng 125.000.000 ₫, ký quỹ 20% tức 25.000.000 ₫ mỗi hợp đồng. 200 triệu chia 25 triệu bằng 8. Kết quả phải LÀM TRÒN XUỐNG vì hợp đồng không chia nhỏ được, nên con số này đi theo bậc thang chứ không mượt. Kết quả 9 HĐ là làm tròn lên, và mở 9 hợp đồng thì thiếu ký quỹ ngay từ đầu. 1 HĐ là lấy vốn chia giá trị danh nghĩa mà quên tỷ lệ ký quỹ. 40 HĐ là chia cho 20% của chính vốn tài khoản.',
      en: 'One contract has a notional of 1,250 times 100,000, that is 125,000,000 ₫, and 20% margin means 25,000,000 ₫ each. 200 million over 25 million is 8. The result has to be rounded DOWN because contracts are indivisible, which is why this figure moves in steps rather than smoothly. A result of 9 rounds up, and nine contracts would be under-margined from the start. 1 divides equity by the full notional, forgetting the margin ratio. 40 divides by 20% of the account equity itself.',
    },
    giai: {
      tinh: { vi: 'Số hợp đồng tối đa theo ký quỹ', en: 'Maximum contracts by initial margin' },
      thaySo: {
        vi: '200.000.000 ÷ (1.250 × 100.000 × 20 ÷ 100)',
        en: '200000000 ÷ (1250 × 100000 × 20 ÷ 100)',
      },
      ketQua: { vi: '8 HĐ', en: '8 contracts' },
      gan: [
        { kyHieu: 'V', giaTri: { vi: '200.000.000', en: '200000000' } },
        { kyHieu: 'F', giaTri: { vi: '1.250', en: '1250' } },
        { kyHieu: 'm', giaTri: { vi: '100.000', en: '100000' } },
        { kyHieu: 'k', giaTri: { vi: '20', en: '20' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Theo quy tắc 2%, hãy đặt đúng ba con số vào ô trống của công thức cỡ vị thế phái sinh; hệ số 100.000 ₫ mỗi điểm đã viết sẵn. Chú ý mẫu số là số tiền mất trên MỘT hợp đồng nếu chạm dừng lỗ.',
      en: 'Under the 2% rule, put the right three numbers into the slots of the futures position size formula; the 100000 ₫ per point multiplier is already written in. Note that the denominator is the loss on ONE contract if the stop is hit.',
    },
    facts: [
      {
        label: { vi: 'Vốn tài khoản', en: 'Account equity' },
        value: { vi: '400.000.000 ₫', en: '400000000 ₫' },
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
    expected: 4,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: 'HĐ', en: 'contracts' },
    worked: {
      vi: 'Số hợp đồng = [400.000.000] × [2] ÷ 100 ÷ ([20] × 100.000)',
      en: 'Contracts = [400000000] × [2] ÷ 100 ÷ ([20] × 100000)',
    },
    verify: {
      inputs: { capital: 400000000, riskPercent: 2, stopPoints: 20 },
      expected: 4,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Số tiền được phép mất là 400.000.000 nhân 2% bằng 8.000.000 ₫. Nếu chạm dừng lỗ, mỗi hợp đồng mất 20 điểm nhân 100.000 ₫ bằng 2.000.000 ₫. Chia ra được 4 hợp đồng, làm tròn xuống. Kết quả 8 HĐ là dùng 4% thay vì 2%, hoặc quên rằng mỗi điểm trị giá 100.000 ₫ chứ không phải 50.000. 400 HĐ là chia 8 triệu cho riêng 20 điểm, bỏ mất hệ số nhân. 2 HĐ là lấy khoảng dừng lỗ 20 điểm nhân đôi hệ số. Đây là cỡ vị thế theo RỦI RO, luôn nhỏ hơn hoặc bằng số hợp đồng ký quỹ cho phép.',
      en: 'The money at risk is 400,000,000 times 2%, that is 8,000,000 ₫. If the stop is hit, each contract loses 20 points times 100,000 ₫, that is 2,000,000 ₫. Dividing gives 4 contracts, rounded down. A result of 8 uses 4% instead of 2%, or forgets that a point is worth 100,000 ₫ rather than 50,000. 400 divides 8 million by the 20 points alone, dropping the multiplier. 2 doubles the multiplier against the stop distance. This is RISK-based sizing, and it is always at or below what margin alone would allow.',
    },
    giai: {
      tinh: { vi: 'Cỡ vị thế phái sinh theo % rủi ro', en: 'Risk-based futures position size' },
      thaySo: {
        vi: '400.000.000 × 2 ÷ 100 ÷ (20 × 100.000)',
        en: '400000000 × 2 ÷ 100 ÷ (20 × 100000)',
      },
      ketQua: { vi: '4 HĐ', en: '4 contracts' },
      gan: [
        { kyHieu: 'V', giaTri: { vi: '400.000.000', en: '400000000' } },
        { kyHieu: 'r', giaTri: { vi: '2', en: '2' } },
        { kyHieu: '\\Delta P', giaTri: { vi: '20', en: '20' } },
        { kyHieu: 'm', giaTri: { vi: '100.000', en: '100000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức đòn bẩy hiệu dụng; hệ số 100.000 ₫ mỗi điểm đã viết sẵn. Chú ý tử số là giá trị danh nghĩa của cả vị thế.',
      en: 'With the figures below, put the right three numbers into the slots of the effective leverage formula; the 100000 ₫ per point multiplier is already written in. Note that the numerator is the notional value of the whole position.',
    },
    facts: [
      {
        label: { vi: 'Giá hợp đồng', en: 'Futures price' },
        value: { vi: '1.250 điểm', en: '1250 points' },
      },
      { label: { vi: 'Số hợp đồng', en: 'Contracts' }, value: { vi: '2 HĐ', en: '2 contracts' } },
      {
        label: { vi: 'Vốn chủ trong tài khoản', en: 'Account equity' },
        value: { vi: '50.000.000 ₫', en: '50000000 ₫' },
      },
    ],
    expected: 5,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'Đòn bẩy = [1.250] × 100.000 × [2] ÷ [50.000.000]',
      en: 'Leverage = [1250] × 100000 × [2] ÷ [50000000]',
    },
    verify: {
      inputs: { futuresPoints: 1250, contracts: 2, equity: 50000000 },
      expected: 5,
      tolerance: 0.01,
    },
    explain: {
      vi: 'Giá trị danh nghĩa là 1.250 nhân 100.000 nhân 2 hợp đồng bằng 250.000.000 ₫, chia cho vốn chủ 50.000.000 ₫ ra 5,0 lần: chỉ số nhích 1% thì tài khoản biến động 5%. Kết quả 2,5 lần là quên nhân số hợp đồng. 0,2 lần là chia ngược. 10,0 lần là dùng hệ số 200.000 ₫ mỗi điểm. Lưu ý đòn bẩy này tính trên VỐN CHỦ thực có, khác với tỷ lệ ký quỹ tối thiểu, và nó là con số quyết định tài khoản chịu được cú ngược chiều bao xa.',
      en: 'The notional is 1,250 times 100,000 times 2 contracts, that is 250,000,000 ₫, divided by 50,000,000 ₫ of equity gives 5.0x: a 1% move in the index swings the account by 5%. A result of 2.5x forgets the contract count. 0.2x inverts the ratio. 10.0x uses a 200,000 ₫ multiplier per point. Note this leverage is measured against actual EQUITY, not against the minimum margin ratio, and it is the number that decides how far an adverse move the account can absorb.',
    },
    giai: {
      tinh: { vi: 'Tỷ lệ đòn bẩy hiệu dụng', en: 'Effective leverage ratio' },
      thaySo: { vi: '1.250 × 100.000 × 2 ÷ 50.000.000', en: '1250 × 100000 × 2 ÷ 50000000' },
      ketQua: { vi: '5,0 lần', en: '5.0x' },
      gan: [
        { kyHieu: 'F', giaTri: { vi: '1.250', en: '1250' } },
        { kyHieu: 'm', giaTri: { vi: '100.000', en: '100000' } },
        { kyHieu: 'N', giaTri: { vi: '2', en: '2' } },
        { kyHieu: 'E', giaTri: { vi: '50.000.000', en: '50000000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Vay 600 triệu ₫, lãi 12%/năm, trả góp niên kim trong 10 năm, tức 120 kỳ tháng đã viết sẵn ở số mũ. Hãy đặt số tiền vay và lãi suất năm vào đủ bốn ô trống; chú ý lãi suất năm xuất hiện ba lần, lần nào cũng chia 100 rồi chia 12 để ra lãi một tháng.',
      en: 'A 600 million ₫ loan at 12% a year, repaid as a level annuity over 10 years; the 120 monthly periods are already in the exponent. Put the loan amount and the annual rate into all four slots; note that the annual rate appears three times, each time divided by 100 and by 12 to get the monthly rate.',
    },
    facts: [
      {
        label: { vi: 'Số tiền vay', en: 'Loan amount' },
        value: { vi: '600.000.000 ₫', en: '600000000 ₫' },
      },
      {
        label: { vi: 'Lãi suất', en: 'Interest rate' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
      { label: { vi: 'Thời hạn', en: 'Term' }, value: { vi: '10 năm', en: '10 years' } },
    ],
    expected: 8608256.9,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫/tháng', en: '₫ a month' },
    worked: {
      vi: 'Trả mỗi tháng = [600.000.000] × [12] ÷ 100 ÷ 12 × (1 + [12] ÷ 100 ÷ 12)^120 ÷ ((1 + [12] ÷ 100 ÷ 12)^120 − 1)',
      en: 'Monthly payment = [600000000] × [12] ÷ 100 ÷ 12 × (1 + [12] ÷ 100 ÷ 12)^120 ÷ ((1 + [12] ÷ 100 ÷ 12)^120 − 1)',
    },
    verify: {
      inputs: { amount: 600000000, rate: 12, years: 10 },
      expected: 8608256.9,
      tolerance: 1,
    },
    explain: {
      vi: 'Lãi một kỳ là 12% chia 12 bằng 1% mỗi tháng, kỳ hạn 120 tháng. Công thức niên kim cho khoản trả cố định 8.608.257 ₫ mỗi tháng, trong đó kỳ đầu có 6.000.000 ₫ là lãi và chỉ 2.608.257 ₫ vào gốc. Kết quả 5.000.000 ₫ là chia đều 600 triệu cho 120 tháng, tức quên hẳn phần lãi. 11.000.000 ₫ là khoản trả của kỳ ĐẦU theo phương án gốc đều, cao hơn vì trả gốc nhanh hơn. 11.000.000.000 ₫ lệch hẳn ba chữ số.',
      en: 'The periodic rate is 12% over 12, that is 1% a month, across 120 months. The annuity formula gives a fixed payment of 8,608,257 ₫ a month, of which the first payment is 6,000,000 ₫ interest and only 2,608,257 ₫ principal. A result of 5,000,000 ₫ spreads 600 million evenly over 120 months, dropping interest entirely. 11,000,000 ₫ is the FIRST payment under the equal-principal method, higher because principal amortizes faster. 11,000,000,000 ₫ is three digits out.',
    },
    giai: {
      tinh: { vi: 'khoản trả góp mỗi tháng theo niên kim', en: 'the monthly annuity loan payment' },
      thaySo: {
        vi: '600.000.000 × 12 ÷ 100 ÷ 12 × (1 + 12 ÷ 100 ÷ 12)^120 ÷ ((1 + 12 ÷ 100 ÷ 12)^120 − 1)',
        en: '600000000 × 12 ÷ 100 ÷ 12 × (1 + 12 ÷ 100 ÷ 12)^120 ÷ ((1 + 12 ÷ 100 ÷ 12)^120 − 1)',
      },
      ketQua: { vi: '8.608.257 ₫/tháng', en: '8608257 ₫ a month' },
      gan: [
        { kyHieu: 'P', giaTri: { vi: '600.000.000', en: '600000000' } },
        {
          kyHieu: 'i',
          moTa: {
            vi: 'là lãi một tháng: lãi suất năm 12% chia cho 12 tháng',
            en: 'is the monthly rate: the 12% annual rate divided by 12 months',
          },
        },
        {
          kyHieu: 'n',
          moTa: {
            vi: 'là 120 kỳ trả, tức 10 năm nhân 12 tháng',
            en: 'is 120 payments, that is 10 years times 12 months',
          },
        },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Vẫn khoản vay 600 triệu ₫, lãi 12%/năm, 10 năm, nhưng trả theo phương án GỐC ĐỀU. Hãy đặt đúng bốn con số vào ô trống của công thức khoản trả kỳ đầu, chú ý số tiền vay xuất hiện hai lần: chia đều ra từng kỳ, và làm gốc tính lãi kỳ đầu.',
      en: 'Same 600 million ₫ loan at 12% over 10 years, but on the EQUAL-PRINCIPAL method. Put the right four numbers into the slots of the first-payment formula, noting that the loan amount appears twice: split evenly across periods, and as the base for the first month’s interest.',
    },
    facts: [
      {
        label: { vi: 'Số tiền vay', en: 'Loan amount' },
        value: { vi: '600.000.000 ₫', en: '600000000 ₫' },
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
    expected: 11000000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Kỳ đầu = [600.000.000] ÷ [120] + [600.000.000] × [12] ÷ 100 ÷ 12',
      en: 'First payment = [600000000] ÷ [120] + [600000000] × [12] ÷ 100 ÷ 12',
    },
    verify: {
      inputs: { amount: 600000000, rate: 12, years: 10 },
      expected: 11000000,
      tolerance: 1,
    },
    explain: {
      vi: 'Gốc chia đều: 600.000.000 chia 120 kỳ bằng 5.000.000 ₫ mỗi kỳ. Lãi kỳ đầu tính trên dư nợ còn nguyên: 600.000.000 nhân 1% bằng 6.000.000 ₫. Cộng lại kỳ đầu trả 11.000.000 ₫, và các kỳ sau giảm dần vì dư nợ giảm. Kết quả 5.000.000 ₫ là chỉ phần gốc, 6.000.000 ₫ là chỉ phần lãi. 8.608.257 ₫ là khoản trả cố định của phương án niên kim: nó thấp hơn ở kỳ đầu nhưng tổng lãi cả đời khoản vay lại cao hơn, vì gốc giảm chậm hơn.',
      en: 'Principal is split evenly: 600,000,000 over 120 periods is 5,000,000 ₫ each. First-period interest is charged on the untouched balance: 600,000,000 times 1% is 6,000,000 ₫. Together the first payment is 11,000,000 ₫, and later ones fall as the balance shrinks. A result of 5,000,000 ₫ is the principal part only and 6,000,000 ₫ the interest part only. 8,608,257 ₫ is the level annuity payment: lower at the start, but more interest over the life of the loan because principal amortizes more slowly.',
    },
    giai: {
      tinh: {
        vi: 'khoản trả kỳ đầu khi trả góp gốc đều',
        en: 'the first payment of an equal-principal loan',
      },
      thaySo: {
        vi: '600.000.000 ÷ 120 + 600.000.000 × 12 ÷ 100 ÷ 12',
        en: '600000000 ÷ 120 + 600000000 × 12 ÷ 100 ÷ 12',
      },
      ketQua: { vi: '11.000.000 ₫', en: '11000000 ₫' },
      gan: [
        { kyHieu: 'P', giaTri: { vi: '600.000.000', en: '600000000' } },
        {
          kyHieu: 'n',
          moTa: {
            vi: 'là 120 kỳ trả, tức 10 năm nhân 12 tháng',
            en: 'is 120 payments, that is 10 years times 12 months',
          },
        },
        {
          kyHieu: 'i',
          moTa: {
            vi: 'là lãi một tháng: lãi suất năm 12% chia cho 12 tháng',
            en: 'is the monthly rate: the 12% annual rate divided by 12 months',
          },
        },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Vay 600 triệu ₫, lãi 12%/năm, trả góp niên kim 10 năm. Tổng lãi bằng 120 lần khoản trả mỗi tháng trừ đi số tiền vay. Hãy đặt số tiền vay và lãi suất năm vào đủ năm ô trống; chú ý số tiền vay xuất hiện hai lần, lần cuối là phần gốc bị trừ ra.',
      en: 'A 600 million ₫ loan at 12% repaid as a level annuity over 10 years. Total interest is 120 monthly payments minus the amount borrowed. Put the loan amount and the annual rate into all five slots; note that the loan amount appears twice, the last time as the principal taken out.',
    },
    facts: [
      {
        label: { vi: 'Số tiền vay', en: 'Loan amount' },
        value: { vi: '600.000.000 ₫', en: '600000000 ₫' },
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
    expected: 432990828.5,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Tổng lãi = 120 × [600.000.000] × [12] ÷ 100 ÷ 12 × (1 + [12] ÷ 100 ÷ 12)^120 ÷ ((1 + [12] ÷ 100 ÷ 12)^120 − 1) − [600.000.000]',
      en: 'Total interest = 120 × [600000000] × [12] ÷ 100 ÷ 12 × (1 + [12] ÷ 100 ÷ 12)^120 ÷ ((1 + [12] ÷ 100 ÷ 12)^120 − 1) − [600000000]',
    },
    verify: {
      inputs: { amount: 600000000, rate: 12, years: 10, method: 1 },
      expected: 432990828.5,
      tolerance: 1,
    },
    explain: {
      vi: 'Trả 8.608.257 ₫ mỗi tháng trong 120 tháng là tổng 1.032.990.828 ₫; trừ đi 600.000.000 ₫ gốc đã vay, phần lãi là 432.990.828 ₫. Kết quả 1.032.990.828 ₫ là TỔNG TIỀN ĐÃ TRẢ, gồm cả gốc, không phải lãi. 720.000.000 ₫ là tính lãi đơn 12% trên toàn bộ 600 triệu suốt 10 năm, bỏ qua việc dư nợ giảm dần. 72.000.000 ₫ là lãi của đúng một năm. Tổng lãi tăng theo kỳ hạn nhanh hơn tuyến tính, nên kéo dài thời hạn để giảm khoản trả tháng luôn phải trả giá ở đây.',
      en: 'Paying 8,608,257 ₫ a month for 120 months totals 1,032,990,828 ₫; less the 600,000,000 ₫ borrowed, the interest is 432,990,828 ₫. A result of 1,032,990,828 ₫ is TOTAL PAID including principal, not interest. 720,000,000 ₫ charges simple interest of 12% on the full 600 million for ten years, ignoring the falling balance. 72,000,000 ₫ is one year of interest. Total interest rises faster than linearly with the term, so stretching the term to lower the monthly payment always costs here.',
    },
    giai: {
      tinh: { vi: 'tổng tiền lãi của khoản vay', en: 'total interest on the loan' },
      thaySo: {
        vi: '120 × 600.000.000 × 12 ÷ 100 ÷ 12 × (1 + 12 ÷ 100 ÷ 12)^120 ÷ ((1 + 12 ÷ 100 ÷ 12)^120 − 1) − 600.000.000',
        en: '120 × 600000000 × 12 ÷ 100 ÷ 12 × (1 + 12 ÷ 100 ÷ 12)^120 ÷ ((1 + 12 ÷ 100 ÷ 12)^120 − 1) − 600000000',
      },
      ketQua: { vi: '432.990.828 ₫', en: '432990828 ₫' },
      gan: [
        {
          kyHieu: 'n',
          moTa: {
            vi: 'là 120 kỳ trả, tức 10 năm nhân 12 tháng',
            en: 'is 120 payments, that is 10 years times 12 months',
          },
        },
        {
          kyHieu: 'L_k',
          moTa: {
            vi: 'là tiền lãi của từng tháng; cộng đủ 120 tháng thì bằng 120 khoản trả trừ 600.000.000 tiền gốc',
            en: 'is each month’s interest; summed over 120 months it equals 120 payments minus the 600000000 principal',
          },
        },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Gửi 100 triệu ₫, lãi 12%/năm ghép lãi mỗi năm một lần, trong 3 năm. Hãy đặt đúng năm con số vào ô trống của công thức lãi kép, chú ý số lần ghép lãi mỗi năm xuất hiện hai lần.',
      en: 'Deposit 100 million ₫ at 12% a year compounded once a year for 3 years. Put the right five numbers into the slots of the compound interest formula, noting that the compounding count appears twice.',
    },
    facts: [
      {
        label: { vi: 'Vốn gốc', en: 'Principal' },
        value: { vi: '100.000.000 ₫', en: '100000000 ₫' },
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
    expected: 140492800,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Tiền cuối kỳ = [100.000.000] × (1 + [12] ÷ 100 ÷ [1])^([1] × [3])',
      en: 'Ending balance = [100000000] × (1 + [12] ÷ 100 ÷ [1])^([1] × [3])',
    },
    verify: {
      inputs: { principal: 100000000, rate: 12, years: 3, perYear: 1 },
      expected: 140492800,
      tolerance: 1,
    },
    explain: {
      vi: '100.000.000 nhân 1,12 mũ 3 bằng 140.492.800 ₫. Kết quả 136.000.000 ₫ là lãi ĐƠN: cộng 12 triệu ba lần trên vốn gốc, và khoảng cách 4.492.800 ₫ chính là phần lãi sinh ra từ lãi. 40.492.800 ₫ là phần LÃI, chưa cộng vốn gốc, nên trả lời nhầm câu hỏi. 112.000.000 ₫ là mới một năm. Lưu ý số tiền danh nghĩa tăng không có nghĩa sức mua tăng tương ứng, còn phải trừ lạm phát.',
      en: '100,000,000 times 1.12 cubed is 140,492,800 ₫. A result of 136,000,000 ₫ uses SIMPLE interest, adding 12 million three times to the original capital, and the 4,492,800 ₫ gap is precisely the interest earned on interest. 40,492,800 ₫ is the INTEREST alone, without the principal, answering a different question. 112,000,000 ₫ covers one year. Note that a rising nominal balance does not mean purchasing power rose with it, inflation still has to come off.',
    },
    giai: {
      tinh: { vi: 'số tiền cuối kỳ theo lãi kép', en: 'the ending balance with compound interest' },
      thaySo: {
        vi: '100.000.000 × (1 + 12 ÷ 100 ÷ 1)^(1 × 3)',
        en: '100000000 × (1 + 12 ÷ 100 ÷ 1)^(1 × 3)',
      },
      ketQua: { vi: '140.492.800 ₫', en: '140492800 ₫' },
      gan: [
        { kyHieu: 'P', giaTri: { vi: '100.000.000', en: '100000000' } },
        { kyHieu: 'r', moTa: { vi: 'là lãi suất 12% một năm', en: 'is the 12% annual rate' } },
        { kyHieu: 'n', giaTri: { vi: '1', en: '1' } },
        { kyHieu: 't', giaTri: { vi: '3', en: '3' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Gửi 200 triệu ₫ kỳ hạn 6 tháng, lãi suất niêm yết 6%/năm. Hãy đặt đúng ba con số vào ô trống của công thức tiền lãi, chú ý lãi suất niêm yết là lãi NĂM nên phải chia 12 rồi nhân số tháng gửi.',
      en: 'Deposit 200 million ₫ for 6 months at a quoted 6% a year. Put the right three numbers into the slots of the interest formula, noting that the quoted rate is ANNUAL, so it is divided by 12 and multiplied by the months held.',
    },
    facts: [
      {
        label: { vi: 'Số tiền gửi', en: 'Deposit' },
        value: { vi: '200.000.000 ₫', en: '200000000 ₫' },
      },
      {
        label: { vi: 'Lãi suất niêm yết', en: 'Quoted rate' },
        value: { vi: '6%/năm', en: '6% a year' },
      },
      { label: { vi: 'Kỳ hạn', en: 'Term' }, value: { vi: '6 tháng', en: '6 months' } },
    ],
    expected: 6000000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Tiền lãi = [200.000.000] × [6] ÷ 100 ÷ 12 × [6]',
      en: 'Interest = [200000000] × [6] ÷ 100 ÷ 12 × [6]',
    },
    verify: {
      inputs: { principal: 200000000, rate: 6, months: 6 },
      expected: 6000000,
      tolerance: 1,
    },
    explain: {
      vi: 'Lãi suất niêm yết luôn là lãi suất NĂM, nên phải chia theo số tháng thực gửi: 200.000.000 nhân 6% nhân 6 chia 12 bằng 6.000.000 ₫. Kết quả 12.000.000 ₫ là tính đủ một năm cho một kỳ hạn sáu tháng, lỗi hay gặp nhất khi đọc bảng lãi suất. 1.000.000 ₫ là chia 6% cho 12 tháng rồi quên nhân lại số tháng gửi. 206.000.000 ₫ là tổng tiền nhận về cả gốc lẫn lãi, không phải riêng tiền lãi.',
      en: 'A quoted rate is always ANNUAL, so it must be prorated over the months actually on deposit: 200,000,000 times 6% times 6 over 12 gives 6,000,000 ₫. A result of 12,000,000 ₫ applies a full year to a six-month term, the commonest slip when reading a rate table. 1,000,000 ₫ divides 6% by twelve months and forgets to multiply back by the months held. 206,000,000 ₫ is the total returned, principal included, not the interest.',
    },
    giai: {
      tinh: { vi: 'tiền lãi tiền gửi có kỳ hạn', en: 'term deposit interest' },
      thaySo: { vi: '200.000.000 × 6 ÷ 100 ÷ 12 × 6', en: '200000000 × 6 ÷ 100 ÷ 12 × 6' },
      ketQua: { vi: '6.000.000 ₫', en: '6000000 ₫' },
      gan: [
        { kyHieu: 'P', giaTri: { vi: '200.000.000', en: '200000000' } },
        {
          kyHieu: 'r',
          moTa: { vi: 'là lãi suất niêm yết 6% một năm', en: 'is the quoted 6% annual rate' },
        },
        { kyHieu: 'T', giaTri: { vi: '6', en: '6' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Muốn có 600 triệu ₫ sau 36 tháng, gửi đều hằng tháng với lãi 6%/năm. Hãy đặt đúng bốn con số vào ô trống của công thức tiết kiệm theo mục tiêu, chú ý lãi suất năm xuất hiện hai lần và số tháng nằm ở số mũ.',
      en: 'To reach 600 million ₫ in 36 months by saving monthly at 6% a year, put the right four numbers into the slots of the goal-based savings formula, noting that the annual rate appears twice and the number of months is the exponent.',
    },
    facts: [
      {
        label: { vi: 'Mục tiêu', en: 'Target' },
        value: { vi: '600.000.000 ₫', en: '600000000 ₫' },
      },
      { label: { vi: 'Lãi suất', en: 'Interest rate' }, value: { vi: '6%/năm', en: '6% a year' } },
      { label: { vi: 'Số tháng', en: 'Months' }, value: { vi: '36 tháng', en: '36 months' } },
    ],
    expected: 15253162.5,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫/tháng', en: '₫ a month' },
    worked: {
      vi: 'Gửi mỗi tháng = [600.000.000] × [6] ÷ 100 ÷ 12 ÷ ((1 + [6] ÷ 100 ÷ 12)^[36] − 1)',
      en: 'Monthly deposit = [600000000] × [6] ÷ 100 ÷ 12 ÷ ((1 + [6] ÷ 100 ÷ 12)^[36] − 1)',
    },
    verify: {
      inputs: { target: 600000000, rate: 6, months: 36 },
      expected: 15253162.5,
      tolerance: 1,
    },
    explain: {
      vi: 'Mỗi khoản gửi vào còn sinh lời cho tới ngày đạt mục tiêu, nên số tiền phải gửi THẤP HƠN mức chia đều. Lãi một kỳ là 0,5% mỗi tháng; giải phương trình niên kim cho 36 kỳ ra 15.253.162 ₫ mỗi tháng. Kết quả 16.666.667 ₫ là chia đều 600 triệu cho 36 tháng, tức coi như tiền gửi vào không sinh lời, và phần chênh 1,4 triệu mỗi tháng chính là công của lãi kép. 15.723.270 ₫ và 14.150.943 ₫ là hai cách tính lãi sai: một bên chỉ cho khoản gửi cuối sinh lời, một bên cho cả 600 triệu sinh lời ngay từ tháng đầu.',
      en: 'Every contribution keeps earning until the target date, so the required amount is BELOW an even split. The periodic rate is 0.5% a month; solving the annuity equation over 36 periods gives 15,253,162 ₫ a month. A result of 16,666,667 ₫ divides 600 million evenly across 36 months, treating the contributions as earning nothing, and the 1.4 million monthly gap is exactly what compounding does. 15,723,270 ₫ and 14,150,943 ₫ are two wrong treatments of the interest: one lets only the last contribution earn, the other lets the full 600 million earn from month one.',
    },
    giai: {
      tinh: {
        vi: 'khoản gửi đều hằng tháng để đạt mục tiêu',
        en: 'the monthly deposit needed to reach a goal',
      },
      thaySo: {
        vi: '600.000.000 × 6 ÷ 100 ÷ 12 ÷ ((1 + 6 ÷ 100 ÷ 12)^36 − 1)',
        en: '600000000 × 6 ÷ 100 ÷ 12 ÷ ((1 + 6 ÷ 100 ÷ 12)^36 − 1)',
      },
      ketQua: { vi: '15.253.162 ₫/tháng', en: '15253162 ₫ a month' },
      gan: [
        { kyHieu: 'FV', giaTri: { vi: '600.000.000', en: '600000000' } },
        {
          kyHieu: 'i',
          moTa: {
            vi: 'là lãi một tháng: lãi suất năm 6% chia cho 12 tháng',
            en: 'is the monthly rate: the 6% annual rate divided by 12 months',
          },
        },
        { kyHieu: 'n', giaTri: { vi: '36', en: '36' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Gửi 200 triệu ₫ kỳ hạn 12 tháng lãi 6%/năm, nhưng rút ở tháng thứ 6. Hãy đặt đúng ba con số vào ô trống của công thức lãi rút trước hạn, chú ý rút trước hạn thì cả thời gian đã gửi tính theo lãi suất KHÔNG kỳ hạn chứ không theo lãi hợp đồng.',
      en: 'A 200 million ₫ deposit for 12 months at 6% is withdrawn in month 6. Put the right three numbers into the slots of the early-withdrawal formula, noting that the whole time held earns the DEMAND rate, not the contract rate.',
    },
    facts: [
      {
        label: { vi: 'Số tiền gửi', en: 'Deposit' },
        value: { vi: '200.000.000 ₫', en: '200000000 ₫' },
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
    expected: 100000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Lãi thực nhận = [200.000.000] × [0,1] ÷ 100 × [6] ÷ 12',
      en: 'Interest received = [200000000] × [0.1] ÷ 100 × [6] ÷ 12',
    },
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
      vi: 'Rút trước hạn thì TOÀN BỘ thời gian đã gửi bị tính lại theo lãi suất không kỳ hạn, chứ không phải chỉ phần còn thiếu: 200.000.000 nhân 0,1% nhân 6 chia 12 bằng 100.000 ₫. So với 6.000.000 ₫ lẽ ra nhận được nếu giữ đủ sáu tháng theo lãi hợp đồng, khoản mất đi là 5.900.000 ₫. Kết quả 6.000.000 ₫ là tin rằng vẫn được hưởng lãi hợp đồng cho phần đã gửi. 3.000.000 ₫ là cắt một nửa lãi như một khoản phạt. 200.000 ₫ là tính đủ 12 tháng theo lãi không kỳ hạn.',
      en: 'On an early withdrawal the ENTIRE period held is repriced at the demand rate, not just the missing part: 200,000,000 times 0.1% times 6 over 12 gives 100,000 ₫. Against the 6,000,000 ₫ that six months at the contract rate would have paid, 5,900,000 ₫ is given up. A result of 6,000,000 ₫ assumes the contract rate still applies to the months held. 3,000,000 ₫ halves the interest as a penalty. 200,000 ₫ applies the demand rate for a full twelve months.',
    },
    giai: {
      tinh: { vi: 'Lãi thực nhận khi rút trước hạn', en: 'Early withdrawal interest' },
      thaySo: { vi: '200.000.000 × 0,1 ÷ 100 × 6 ÷ 12', en: '200000000 × 0.1 ÷ 100 × 6 ÷ 12' },
      ketQua: { vi: '100.000 ₫', en: '100000 ₫' },
      gan: [
        { kyHieu: 'P', giaTri: { vi: '200.000.000', en: '200000000' } },
        { kyHieu: 'r_{kkh}', giaTri: { vi: '0,1', en: '0.1' } },
        { kyHieu: 't', giaTri: { vi: '6', en: '6' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Gửi 200 triệu ₫ trong 12 tháng: quay vòng hai kỳ 6 tháng lãi 5%/năm, so với gửi thẳng 12 tháng lãi 6%/năm. Hãy đặt đúng bốn con số vào ô trống của công thức so sánh; số tiền gửi và hai vòng quay đã viết sẵn. Chú ý con số 6 có mặt ở hai nghĩa: kỳ hạn ngắn 6 tháng và lãi suất kỳ dài 6%/năm.',
      en: 'Placing 200 million ₫ for 12 months: two rolling 6-month terms at 5% versus one 12-month term at 6%. Put the right four numbers into the slots of the comparison formula; the deposit and the two rolls are already written in. Note that the number 6 appears with two meanings: the 6-month short term and the 6% long-term rate.',
    },
    facts: [
      {
        label: { vi: 'Số tiền gửi', en: 'Deposit' },
        value: { vi: '200.000.000 ₫', en: '200000000 ₫' },
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
    expected: -1875000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Chênh lệch = 200.000.000 × (1 + [5] × [6] ÷ 12 ÷ 100)^2 − 200.000.000 × (1 + [6] × [12] ÷ 12 ÷ 100)',
      en: 'Difference = 200000000 × (1 + [5] × [6] ÷ 12 ÷ 100)^2 − 200000000 × (1 + [6] × [12] ÷ 12 ÷ 100)',
    },
    verify: {
      inputs: { principal: 200000000, shortRate: 5, shortMonths: 6, longRate: 6, totalMonths: 12 },
      expected: -1875000,
      tolerance: 1,
    },
    explain: {
      vi: 'Quay vòng: kỳ đầu 200.000.000 nhân 2,5% bằng 5.000.000 ₫, tái gửi cả gốc lẫn lãi nên kỳ hai được 205.000.000 nhân 2,5% bằng 5.125.000 ₫, tổng cuối kỳ 210.125.000 ₫. Gửi thẳng 12 tháng: 200.000.000 nhân 6% bằng 12.000.000 ₫, tổng 212.000.000 ₫. Chênh 1.875.000 ₫ NGHIÊNG VỀ kỳ dài. Kết quả 2.000.000 ₫ là so thẳng 6% với 5% mà quên phần lãi kép của kỳ quay vòng. "Hai cách bằng nhau" là bỏ qua chênh lệch lãi suất giữa hai kỳ hạn. Quay vòng chỉ thắng khi lãi suất kỳ ngắn tăng lên ở lần tái gửi.',
      en: 'Rolling: the first term earns 200,000,000 times 2.5%, that is 5,000,000 ₫, and rolling principal plus interest means the second earns 205,000,000 times 2.5%, that is 5,125,000 ₫, ending at 210,125,000 ₫. The 12-month term: 200,000,000 times 6% is 12,000,000 ₫, ending at 212,000,000 ₫. The 1,875,000 ₫ gap FAVORS the long term. A result of 2,000,000 ₫ compares 6% with 5% directly, missing the compounding inside the rolling option. Equal ignores the rate difference between terms entirely. Rolling only wins if the short rate rises by the time it is renewed.',
    },
    giai: {
      tinh: {
        vi: 'chênh lệch giữa gửi quay vòng kỳ ngắn và gửi kỳ dài',
        en: 'the gap between rolling short-term and long-term deposits',
      },
      thaySo: {
        vi: '200.000.000 × (1 + 5 × 6 ÷ 12 ÷ 100)^2 − 200.000.000 × (1 + 6 × 12 ÷ 12 ÷ 100)',
        en: '200000000 × (1 + 5 × 6 ÷ 12 ÷ 100)^2 − 200000000 × (1 + 6 × 12 ÷ 12 ÷ 100)',
      },
      ketQua: { vi: 'Quay vòng kém hơn 1.875.000 ₫', en: 'Rolling is 1875000 ₫ worse' },
      gan: [
        { kyHieu: 'P', giaTri: { vi: '200.000.000', en: '200000000' } },
        { kyHieu: 'r_n', giaTri: { vi: '5', en: '5' } },
        { kyHieu: 'm', giaTri: { vi: '6', en: '6' } },
        {
          kyHieu: 'k',
          moTa: {
            vi: 'là 2 vòng: 12 tháng chia kỳ 6 tháng',
            en: 'is 2 rolls: 12 months divided by the 6-month term',
          },
        },
        { kyHieu: 'r_d', giaTri: { vi: '6', en: '6' } },
        { kyHieu: 'T', giaTri: { vi: '12', en: '12' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Mua ba lần, mỗi lần 12 triệu ₫, ở các mức giá 60.000 ₫, 40.000 ₫ và 30.000 ₫. Tiền mua mỗi đợt đã viết sẵn; hãy đặt ba mức giá vào ô trống, chú ý giá nằm ở mẫu số vì tiền chia giá mới ra số cổ phiếu mua được.',
      en: 'Three purchases of 12 million ₫ each at 60000 ₫, 40000 ₫ and 30000 ₫. The amount of each purchase is already written in; put the three prices into the slots, noting that prices sit in the denominators because money divided by price gives the shares bought.',
    },
    facts: [
      {
        label: { vi: 'Lần 1', en: 'Purchase 1' },
        value: { vi: '12.000.000 ₫ ở giá 60.000 ₫', en: '12000000 ₫ at 60000 ₫' },
      },
      {
        label: { vi: 'Lần 2', en: 'Purchase 2' },
        value: { vi: '12.000.000 ₫ ở giá 40.000 ₫', en: '12000000 ₫ at 40000 ₫' },
      },
      {
        label: { vi: 'Lần 3', en: 'Purchase 3' },
        value: { vi: '12.000.000 ₫ ở giá 30.000 ₫', en: '12000000 ₫ at 30000 ₫' },
      },
    ],
    expected: 40000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Giá vốn trung bình = 3 × 12.000.000 ÷ (12.000.000 ÷ [60.000] + 12.000.000 ÷ [40.000] + 12.000.000 ÷ [30.000])',
      en: 'Average cost = 3 × 12000000 ÷ (12000000 ÷ [60000] + 12000000 ÷ [40000] + 12000000 ÷ [30000])',
    },
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
      vi: 'Tính theo SỐ CỔ PHIẾU mua được chứ không theo giá: 12 triệu chia 60.000 được 200 CP, chia 40.000 được 300 CP, chia 30.000 được 400 CP, tổng 900 CP cho 36.000.000 ₫, ra giá vốn 40.000 ₫. Kết quả 43.333 ₫ là trung bình CỘNG ba mức giá, và nó luôn CAO hơn giá vốn thật khi số tiền mỗi lần bằng nhau, vì tiền cố định mua được nhiều cổ phiếu hơn ở vùng giá thấp. Đó chính là cơ chế của DCA. 36.000.000 ₫ là tổng tiền đã bỏ ra. 30.000 ₫ là lấy mức giá thấp nhất.',
      en: 'Work from the SHARES bought, not from the prices: 12 million over 60,000 is 200 shares, over 40,000 is 300, over 30,000 is 400, totalling 900 shares for 36,000,000 ₫, an average cost of 40,000 ₫. A result of 43,333 ₫ is the ARITHMETIC mean of the three prices, and it always sits ABOVE the true average cost when the amounts are equal, because a fixed sum buys more shares at lower prices. That is the mechanism of DCA. 36,000,000 ₫ is the total invested. 30,000 ₫ is simply the lowest price.',
    },
    giai: {
      tinh: { vi: 'Giá vốn trung bình khi mua DCA', en: 'DCA average cost per share' },
      thaySo: {
        vi: '3 × 12.000.000 ÷ (12.000.000 ÷ 60.000 + 12.000.000 ÷ 40.000 + 12.000.000 ÷ 30.000)',
        en: '3 × 12000000 ÷ (12000000 ÷ 60000 + 12000000 ÷ 40000 + 12000000 ÷ 30000)',
      },
      ketQua: { vi: '40.000 ₫', en: '40000 ₫' },
      gan: [
        {
          kyHieu: 'C_i',
          moTa: {
            vi: 'là số tiền bỏ ra mỗi lần mua: cả 3 lần đều là 12.000.000 ₫',
            en: 'is the money put in at each purchase: 12000000 ₫ all 3 times',
          },
        },
        {
          kyHieu: 'P_i',
          moTa: {
            vi: 'là giá cổ phiếu lúc mua: lần 1 là 60.000 ₫, lần 2 là 40.000 ₫, lần 3 là 30.000 ₫',
            en: 'is the share price at each purchase: 60000 ₫ the 1st time, 40000 ₫ the 2nd, 30000 ₫ the 3rd',
          },
        },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Mỗi tháng bỏ vào 10 triệu ₫, lợi suất kỳ vọng 12%/năm, mục tiêu 240 triệu ₫. Hãy đặt đúng bốn con số vào ô trống của công thức số kỳ góp; kết quả phải làm tròn LÊN thành số tháng trọn vẹn.',
      en: 'Contributing 10 million ₫ a month at an expected 12% a year toward a 240 million ₫ target, put the right four numbers into the slots of the number-of-periods formula; the result is rounded UP to whole months.',
    },
    facts: [
      {
        label: { vi: 'Mục tiêu', en: 'Target' },
        value: { vi: '240.000.000 ₫', en: '240000000 ₫' },
      },
      {
        label: { vi: 'Bỏ vào mỗi tháng', en: 'Monthly contribution' },
        value: { vi: '10.000.000 ₫', en: '10000000 ₫' },
      },
      {
        label: { vi: 'Lợi suất kỳ vọng', en: 'Expected return' },
        value: { vi: '12%/năm', en: '12% a year' },
      },
    ],
    expected: 22,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: 'tháng', en: 'months' },
    worked: {
      vi: 'Số tháng = ln(1 + [240.000.000] × [12] ÷ 100 ÷ 12 ÷ [10.000.000]) ÷ ln(1 + [12] ÷ 100 ÷ 12)',
      en: 'Months = ln(1 + [240000000] × [12] ÷ 100 ÷ 12 ÷ [10000000]) ÷ ln(1 + [12] ÷ 100 ÷ 12)',
    },
    verify: {
      inputs: { target: 240000000, contribution: 10000000, rate: 12 },
      expected: 22,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Không có lợi suất thì cần đúng 24 tháng (240 chia 10). Có lợi suất 1% mỗi tháng, tiền bỏ vào sớm sinh lời thêm nên về đích sớm hơn: 22 tháng. Kết quả 24 tháng là bỏ qua phần sinh lời — nó cũng là con số ĐÚNG khi lợi suất bằng 0, nên hay bị chọn theo thói quen. 20 tháng là tính lợi suất cho cả 240 triệu ngay từ tháng đầu, trong khi số dư mới tích dần. 27 tháng thì lâu hơn cả phương án không lợi suất, không có cách tính nào dẫn tới đó.',
      en: 'With no return it takes exactly 24 months (240 over 10). At 1% a month the early contributions earn, so the target arrives sooner: 22 months. A result of 24-month ignores the return, and it is also the CORRECT result at zero return, which is why it gets picked out of habit. 20 months applies the return to the full 240 million from month one, when the balance is still building. 27 months is slower than saving with no return at all, which no calculation produces.',
    },
    giai: {
      tinh: { vi: 'Số kỳ DCA để đạt mục tiêu', en: 'DCA periods to reach a goal' },
      thaySo: {
        vi: 'ln(1 + 240.000.000 × 12 ÷ 100 ÷ 12 ÷ 10.000.000) ÷ ln(1 + 12 ÷ 100 ÷ 12)',
        en: 'ln(1 + 240000000 × 12 ÷ 100 ÷ 12 ÷ 10000000) ÷ ln(1 + 12 ÷ 100 ÷ 12)',
      },
      ketQua: { vi: '22 tháng', en: '22 months' },
      gan: [
        { kyHieu: 'FV', giaTri: { vi: '240.000.000', en: '240000000' } },
        {
          kyHieu: 'i',
          moTa: {
            vi: 'là lợi suất một tháng: 12% một năm chia cho 12 tháng',
            en: 'is the monthly return: 12% a year divided by 12 months',
          },
        },
        { kyHieu: 'C', giaTri: { vi: '10.000.000', en: '10000000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Trong năm bạn bán 1.000 cổ phiếu ở giá 60.000 ₫ và nhận cổ tức 3.000 ₫/CP. Hãy đặt đúng bốn con số vào ô trống của công thức thuế TNCN; hai thuế suất 0,1% và 5% đã viết sẵn. Chú ý khối lượng xuất hiện ở cả hai khoản thuế.',
      en: 'In one year you sell 1000 shares at 60000 ₫ and receive a 3000 ₫ dividend a share. Put the right four numbers into the slots of the personal income tax formula; the 0.1% and 5% rates are already written in. Note that the quantity appears in both taxes.',
    },
    facts: [
      {
        label: { vi: 'Khối lượng bán', en: 'Quantity sold' },
        value: { vi: '1.000 CP', en: '1000 shares' },
      },
      { label: { vi: 'Giá bán', en: 'Sell price' }, value: { vi: '60.000 ₫', en: '60000 ₫' } },
      {
        label: { vi: 'Cổ tức tiền mặt', en: 'Cash dividend' },
        value: { vi: '3.000 ₫/CP', en: '3000 ₫ a share' },
      },
    ],
    expected: 210000,
    tolerance: { kind: 'tuyet-doi', value: 1 },
    unit: { vi: '₫', en: '₫' },
    worked: {
      vi: 'Thuế TNCN = [1.000] × [60.000] × 0,1 ÷ 100 + [1.000] × [3.000] × 5 ÷ 100',
      en: 'Personal income tax = [1000] × [60000] × 0.1 ÷ 100 + [1000] × [3000] × 5 ÷ 100',
    },
    verify: {
      inputs: { quantity: 1000, sellPrice: 60000, dividendPerShare: 3000 },
      expected: 210000,
      tolerance: 1,
    },
    explain: {
      vi: 'Hai khoản thuế RIÊNG BIỆT, mỗi khoản có cơ sở tính và thuế suất riêng. Thuế chuyển nhượng: 60.000.000 nhân 0,1% bằng 60.000 ₫, tính trên giá trị bán. Thuế cổ tức: 3.000.000 nhân 5% bằng 150.000 ₫, tính trên cổ tức nhận được. Tổng 210.000 ₫. Kết quả 60.000 ₫ và 150.000 ₫ mỗi kết quả chỉ lấy một vế. 315.000 ₫ là áp nhầm 5% lên cả giá trị bán. Hai khoản này không bù trừ cho nhau và cũng không phụ thuộc vào việc lệnh bán lãi hay lỗ.',
      en: 'Two SEPARATE taxes, each with its own base and rate. Transfer tax: 60,000,000 times 0.1% is 60,000 ₫, charged on sale value. Dividend tax: 3,000,000 times 5% is 150,000 ₫, charged on the dividend received. Together 210,000 ₫. The 60,000 ₫ and 150,000 ₫ answers each take one side only. 315,000 ₫ applies 5% to the sale value as well. The two do not offset each other and neither depends on whether the sale was at a profit or a loss.',
    },
    giai: {
      tinh: {
        vi: 'Thuế TNCN một giao dịch đầu tư trong năm',
        en: 'Personal income tax on an investment in a year',
      },
      thaySo: {
        vi: '1.000 × 60.000 × 0,1 ÷ 100 + 1.000 × 3.000 × 5 ÷ 100',
        en: '1000 × 60000 × 0.1 ÷ 100 + 1000 × 3000 × 5 ÷ 100',
      },
      ketQua: { vi: '210.000 ₫', en: '210000 ₫' },
      gan: [
        { kyHieu: 'Q', giaTri: { vi: '1.000', en: '1000' } },
        { kyHieu: 'P_{ban}', giaTri: { vi: '60.000', en: '60000' } },
        { kyHieu: 'r_{cn}', giaTri: { vi: '0,1%', en: '0.1%' } },
        { kyHieu: 'D', giaTri: { vi: '3.000', en: '3000' } },
        { kyHieu: 'r_{ct}', giaTri: { vi: '5%', en: '5%' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng ba con số vào ô trống của công thức sản lượng hoà vốn, chú ý mẫu số là số dư đảm phí, tức giá bán trừ biến phí.',
      en: 'With the figures below, put the right three numbers into the slots of the break-even quantity formula, noting that the denominator is the contribution margin, price minus variable cost.',
    },
    facts: [
      {
        label: { vi: 'Chi phí cố định', en: 'Fixed cost' },
        value: { vi: '600.000.000 ₫', en: '600000000 ₫' },
      },
      {
        label: { vi: 'Giá bán một sản phẩm', en: 'Unit price' },
        value: { vi: '50.000 ₫', en: '50000 ₫' },
      },
      {
        label: { vi: 'Biến phí một sản phẩm', en: 'Unit variable cost' },
        value: { vi: '20.000 ₫', en: '20000 ₫' },
      },
    ],
    expected: 20000,
    tolerance: { kind: 'tuyet-doi', value: 0.5 },
    unit: { vi: 'sản phẩm', en: 'units' },
    worked: {
      vi: 'Sản lượng hoà vốn = [600.000.000] ÷ ([50.000] − [20.000])',
      en: 'Break-even quantity = [600000000] ÷ ([50000] − [20000])',
    },
    verify: {
      inputs: { fixedCost: 600000000, unitPrice: 50000, variableCost: 20000 },
      expected: 20000,
      tolerance: 0.5,
    },
    explain: {
      vi: 'Mỗi sản phẩm bán ra đóng góp 50.000 trừ 20.000 bằng 30.000 ₫ vào việc bù chi phí cố định. 600.000.000 chia 30.000 bằng 20.000 sản phẩm. Kết quả 12.000 sản phẩm là chia cho GIÁ BÁN, tức quên trừ biến phí. 30.000 sản phẩm là chia cho biến phí. 8.571 sản phẩm là chia cho tổng 50.000 cộng 20.000. Mô hình này giả định giá bán và biến phí đơn vị không đổi ở mọi mức sản lượng, và chỉ có MỘT sản phẩm — đa sản phẩm là chỗ nó gãy.',
      en: 'Each unit sold contributes 50,000 minus 20,000, that is 30,000 ₫ toward covering fixed costs. 600,000,000 over 30,000 is 20,000 units. A result of 12,000 divides by the SELLING price, forgetting to net off variable cost. 30,000 divides by the variable cost. 8,571 divides by 50,000 plus 20,000. The model assumes the selling price and unit variable cost hold at every output level and that there is a SINGLE product, and multiple products is where it breaks.',
    },
    giai: {
      tinh: { vi: 'sản lượng hoà vốn', en: 'break-even quantity' },
      thaySo: { vi: '600.000.000 ÷ (50.000 − 20.000)', en: '600000000 ÷ (50000 − 20000)' },
      ketQua: { vi: '20.000 sản phẩm', en: '20000 units' },
      gan: [
        { kyHieu: 'FC', giaTri: { vi: '600.000.000', en: '600000000' } },
        { kyHieu: 'P', giaTri: { vi: '50.000', en: '50000' } },
        { kyHieu: 'VC', giaTri: { vi: '20.000', en: '20000' } },
      ],
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
    format: 'dien-so',
    kind: 'quy-uoc',
    evidence: 'tinh-toan',
    prompt: {
      vi: 'Với số liệu dưới đây, hãy đặt đúng năm con số vào ô trống của công thức đòn bẩy tổng hợp; chi phí cố định đã viết sẵn. Chú ý doanh thu và biến phí xuất hiện ở cả tử lẫn mẫu, còn lãi vay chỉ bị trừ ở mẫu.',
      en: 'With the figures below, put the right five numbers into the slots of the degree of total leverage formula; the fixed cost is already written in. Note that revenue and variable cost appear in both the numerator and the denominator, while interest is subtracted only in the denominator.',
    },
    facts: [
      {
        label: { vi: 'Doanh thu', en: 'Revenue' },
        value: { vi: '2.000.000.000 ₫', en: '2000000000 ₫' },
      },
      {
        label: { vi: 'Biến phí', en: 'Variable cost' },
        value: { vi: '1.200.000.000 ₫', en: '1200000000 ₫' },
      },
      {
        label: { vi: 'Chi phí cố định', en: 'Fixed cost' },
        value: { vi: '400.000.000 ₫', en: '400000000 ₫' },
      },
      {
        label: { vi: 'Chi phí lãi vay', en: 'Interest expense' },
        value: { vi: '200.000.000 ₫', en: '200000000 ₫' },
      },
    ],
    expected: 4,
    tolerance: { kind: 'tuyet-doi', value: 0.01 },
    unit: { vi: 'lần', en: 'x' },
    worked: {
      vi: 'Đòn bẩy tổng hợp = ([2.000.000.000] − [1.200.000.000]) ÷ ([2.000.000.000] − [1.200.000.000] − 400.000.000 − [200.000.000])',
      en: 'Total leverage = ([2000000000] − [1200000000]) ÷ ([2000000000] − [1200000000] − 400000000 − [200000000])',
    },
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
      vi: 'Số dư đảm phí là 2.000 trừ 1.200 bằng 800 triệu; EBIT là 800 trừ 400 bằng 400 triệu. DOL bằng 800 chia 400 tức 2,0 lần; DFL bằng EBIT chia (EBIT trừ lãi vay), tức 400 chia 200 bằng 2,0 lần. Đòn bẩy tổng hợp là TÍCH của hai: 2,0 nhân 2,0 bằng 4,0 lần, nghĩa là doanh thu nhích 1% thì lợi nhuận sau lãi vay đổi 4%. Kết quả 2,0 lần là mới lấy một trong hai vế. 1,0 lần là lấy tỷ lệ DOL trên DFL. 8,0 lần là cộng rồi nhân nhầm.',
      en: 'Contribution margin is 2,000 minus 1,200, that is 800 million; EBIT is 800 minus 400, that is 400 million. DOL is 800 over 400, that is 2.0x; DFL is EBIT over (EBIT minus interest), 400 over 200, also 2.0x. Total leverage is the PRODUCT of the two: 2.0 times 2.0 is 4.0x, meaning a 1% move in revenue swings post-interest profit by 4%. A result of 2.0x takes one factor only. 1.0x is the ratio of DOL to DFL. 8.0x mixes an addition into the multiplication.',
    },
    giai: {
      tinh: { vi: 'đòn bẩy tổng hợp', en: 'degree of total leverage' },
      thaySo: {
        vi: '(2.000.000.000 − 1.200.000.000) ÷ (2.000.000.000 − 1.200.000.000 − 400.000.000 − 200.000.000)',
        en: '(2000000000 − 1200000000) ÷ (2000000000 − 1200000000 − 400000000 − 200000000)',
      },
      ketQua: { vi: '4,0 lần', en: '4.0x' },
      gan: [
        { kyHieu: 'DT', giaTri: { vi: '2.000.000.000', en: '2000000000' } },
        { kyHieu: 'BP', giaTri: { vi: '1.200.000.000', en: '1200000000' } },
        {
          kyHieu: 'EBIT',
          moTa: {
            vi: 'bằng doanh thu trừ biến phí trừ chi phí cố định, tức 400.000.000 ₫',
            en: 'is revenue minus variable cost minus fixed cost, that is 400000000 ₫',
          },
        },
        { kyHieu: 'I', giaTri: { vi: '200.000.000', en: '200000000' } },
      ],
    },
    source: {
      url: 'https://amis.misa.vn/27215/don-bay-trong-kinh-doanh/',
      kind: 'giao-khoa',
      vietnam: true,
    },
  },
];
