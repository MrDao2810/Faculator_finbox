/**
 * Hình công thức ở chế độ TIẾNG ANH (05/11/2026).
 *
 * `spec.latex` chỉ có một bản, viết cho người Việt: chữ trong `\text{}` ("Tổng nợ phải trả"), chỉ số
 * dưới là chữ Việt bỏ dấu (`P_{mua}`, `F_{lk}`, `r_{danh\,nghia}`) và vài chữ viết tắt tiếng Việt
 * (LNST, TSNH, DT, BP). Hình dựng lúc build từ bản ấy nên chuyển sang tiếng Anh thì chữ dưới hình đổi
 * mà hình thì không. Chủ dự án chụp dòng "Values" của khối Ví dụ ("Tổng nợ phải trả is FPT's total
 * liabilities…"), rồi hình của Giá mục tiêu với `P_{mục tiêu}`: _"lỗi ở cả công thức nữa, chuyển sang
 * ngôn ngữ tiếng anh rồi mà vẫn còn tiếng việt, cần chuyển đổi sang tiếng anh, xát nghĩa nhất có thể
 * để người dùng không bị hiểu lầm"_.
 *
 * Hàm ở đây dịch MỘT chuỗi LaTeX sang bản tiếng Anh. Mọi chỗ dựng hình (hình công thức, từng dòng bảng
 * ký hiệu, từng bước của khung cách tính) đi qua CÙNG hàm, nên một ký hiệu dịch ra giống hệt nhau ở
 * mọi nơi — điều kiện để dòng bảng ký hiệu vẫn là chuỗi con của hình và điểm chạm vẫn tìm được chỗ.
 * Khoá mọi nơi (`spec.symbols[].latex`, `QuizGan.kyHieu`, `FormulaHowTo.entries[].symbol`) vẫn là bản
 * tiếng Việt; chỉ MathML in ra là khác.
 *
 * Nhãn ô nhập mang ký hiệu ở cuối ("Buy price (Pbuy)") đổi theo cùng bảng: `kyHieuPhangEn()`.
 * `latex-en.test.ts` đòi ký hiệu trên nhãn tiếng Anh có mặt trong hình tiếng Anh, và không chữ Việt
 * nào còn trong hình tiếng Anh của 111 công thức.
 */

/**
 * Cụm chữ trong `\text{}`. Dịch theo đúng dòng chữ tiếng Anh dưới hình (`expression.en`), để hình và
 * dòng chữ gọi một đại lượng bằng cùng một tên. Ba chữ viết tắt kế toán tiếng Việt thành thuật ngữ
 * sách giáo khoa tiếng Anh dùng cho đúng khái niệm ấy (06/11/2026, chủ dự án: _"dịch phải xát nghĩa nhất
 * có thể để người dùng công thức hiểu được. vì họ là người nước ngoài thì sao"_): LNST thành
 * 'Net income' và TSNH thành 'Current assets', viết bằng CHỮ như sách CFA viết ROE = Net income ÷
 * Equity; LNTT thành 'EBT', vì nó đứng cạnh EBIT trong cùng đẳng thức. Bản 05/11 dùng NPAT, PBT, CA:
 * NPAT là lối Úc, Anh, CA thì người đọc nước ngoài không đoán ra. "Khấu hao" trong đẳng thức EBITDA là
 * 'D&A' (khấu hao TSCĐ hữu hình và vô hình), không phải 'Depreciation'.
 */
export const CHU_EN: Readonly<Record<string, string>> = {
  'Biên gộp': 'Gross margin',
  'Cổ tức ưu đãi': 'Preferred dividends',
  'Doanh thu thuần': 'Net revenue',
  'Doanh thu': 'Revenue',
  'Giá vốn': 'Cost of goods sold',
  'Hàng tồn kho': 'Inventory',
  'Khấu hao': 'D\\&A',
  LNST: 'Net income',
  LNTT: 'EBT',
  'Lãi vay': 'Interest expense',
  'Nợ ngắn hạn': 'Current liabilities',
  'Nợ vay': 'Debt',
  'Số CP lưu hành': 'Shares outstanding',
  'Số CP': 'Shares outstanding',
  TSNH: 'Current assets',
  'Tiền mặt': 'Cash',
  'Trả nợ gốc': 'Debt repaid',
  'Tài sản ngắn hạn': 'Current assets',
  'Tổng lãi': 'Total interest',
  'Tổng nợ phải trả': 'Total liabilities',
  'Tổng nợ': 'Total liabilities',
  'Tổng tài sản': 'Total assets',
  'Vay mới': 'New borrowing',
  'Vay ngắn hạn': 'Short-term debt',
  'Vòng quay': 'Asset turnover',
  'Vốn chủ sở hữu': 'Equity',
  'Vốn hoá': 'Market cap',
  /* Hình tiếng Việt cũng viết chữ tiếng Anh 'Payout'; tên công thức là 'Payout ratio' nên hình gọi đủ tên. */
  Payout: 'Payout ratio',
  cuối: 'end',
  'mục tiêu': 'target',
  ròng: 'net',
  đầu: 'start',
};

/**
 * Cụm `\text{}` vốn đã là tiếng Anh hay tên riêng — giữ nguyên. Ghim để một cụm MỚI phải được xếp
 * vào một trong hai bảng (`latex-en.test.ts`), không lặng lẽ in tiếng Việt.
 */
export const CHU_GIU_NGUYEN: ReadonlySet<string> = new Set([
  'Cov',
  'Var',
  'Current ratio',
  'Quick ratio',
  'Graham',
]);

/**
 * Chỉ số dưới viết bằng chữ Việt bỏ dấu (không nằm trong `\text{}`). Dịch sang chữ tiếng Anh ngắn:
 * `P_{mua}` thành `P_{buy}`, `F_{lk}` (lưu ký) thành `F_{custody}`, `_{hv}` (hoà vốn) thành `_{BE}`
 * (break-even). Chỉ số đã là tiếng Anh (`max`, `min`, `long`, `short`, `ps`) không có dòng ở đây.
 */
export const CHI_SO_EN: Readonly<Record<string, string>> = {
  ban: 'sell',
  cat: 'stop',
  cham: 'slow',
  cn: 'transfer',
  ct: 'div',
  cuoi: 'end',
  dai: 'long',
  'danh\\,nghia': 'nominal',
  dau: 'start',
  /* Điểm đóng, mở VỊ THẾ phái sinh: 'exit', 'entry' (P_close là giá đóng cửa của một phiên). */
  dong: 'exit',
  duoi: 'lower',
  hv: 'BE',
  kkh: 'demand',
  ky: 'period',
  lk: 'custody',
  mo: 'entry',
  mua: 'buy',
  nam: 'annual',
  ngan: 'short',
  nhanh: 'fast',
  phien: 'session',
  rong: 'net',
  'tin hieu': 'signal',
  thuc: 'real',
  /* Thuế suất CHUYỂN NHƯỢNG 0,1%: thuế TNCN đầu tư cũng vẽ nó là r_{transfer}, một thuế một tên. */
  thue: 'transfer',
  tren: 'upper',
  vao: 'entry',
};

/**
 * Ký hiệu RIÊNG của một công thức: tên viết tắt tiếng Việt đứng làm biến, hay chỉ số một chữ cái là
 * chữ đầu của một từ Việt. Chỉ thay trong hình của đúng công thức ấy (và các bước cách tính của nó),
 * vì cùng chữ ấy ở công thức khác có thể mang nghĩa khác: `r_d` của WACC là chi phí NỢ (debt), còn
 * `r_d` của Gửi quay vòng là lãi kỳ DÀI.
 *
 * Mỗi cặp là [mẫu, thay] với mẫu được neo hai đầu: không ăn vào giữa một tên dài hơn (`DT` trong
 * `DTL`).
 */
export const KY_HIEU_RIENG_EN: Readonly<Record<string, ReadonlyArray<readonly [string, string]>>> =
  {
    /* DT = doanh thu, BP = biến phí. */
    'don-bay-tong-hop': [
      ['DT', 'Rev'],
      ['BP', 'TVC'],
    ],
    /* DT_hv = doanh thu hoà vốn. */
    'diem-hoa-von': [['DT', 'Rev']],
    /* r_n = lãi kỳ ngắn, r_d = lãi kỳ dài. */
    'gui-quay-vong': [
      ['r_n', 'r_{short}'],
      ['r_d', 'r_{long}'],
    ],
    /*
     * L_k = lãi kỳ k, D_k = dư nợ, G_k = gốc trả trong kỳ: ký hiệu của Kellison (The Theory of Interest),
     * B_k = outstanding balance, P_k = principal repaid. Hình chính của công thức không có P hay B nào
     * khác để lẫn. Mẫu `D_k` không ăn vào `D_{k-1}` vì phải neo đúng chữ k ngay sau gạch dưới.
     */
    'lich-tra-no': [
      ['L_k', 'I_k'],
      ['D_k', 'B_k'],
      ['D_{k-1}', 'B_{k-1}'],
      ['G_k', 'P_k'],
    ],
    /*
     * EMI là lối gọi của ngân hàng Ấn Độ, không ai giải nghĩa. PMT là ký hiệu của Excel và sách giáo
     * khoa, và chính sản phẩm đã dùng nó cho khoản gửi đều của Tiết kiệm mục tiêu.
     */
    'tra-gop-nien-kim': [['EMI', 'PMT']],
    /* L_rong = lợi nhuận ròng; L đọc như "Loss" trong tiếng Anh, nên viết bằng chữ như hình ROE viết Net income. */
    'loi-nhuan-rong': [['L_{rong}', '\\text{Net profit}']],
    'roi-rong': [['L_{rong}', '\\text{Net profit}']],
    /* C = chênh lệch hai đường SMA; C của %B, %K là giá đóng cửa, nên viết bằng chữ như dòng diễn giải. */
    'giao-cat-hai-duong-ma': [['C', '\\text{Difference}']],
    /*
     * DD = độ lệch chuẩn bán phần. Tiếng Anh đọc DD là drawdown (thư viện có DD_t của Sụt giảm hiện tại),
     * còn Sortino viết chính đại lượng này là sigma_d.
     */
    'do-lech-chuan-ban-phan': [['DD', '\\sigma_d']],
  };

function thoat(chu: string): string {
  return chu.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Bản tiếng Anh của một chuỗi LaTeX của công thức `formulaId`. Không có gì để dịch thì trả CHÍNH
 * chuỗi ấy — bên gọi so `===` để biết công thức nào cần dựng thêm bản tiếng Anh.
 */
export function latexEn(latex: string, formulaId: string): string {
  let ra = latex;
  for (const [mau, thay] of KY_HIEU_RIENG_EN[formulaId] ?? []) {
    ra = ra.replace(new RegExp(`(?<![A-Za-z\\\\])${thoat(mau)}(?![A-Za-z])`, 'g'), thay);
  }
  ra = ra.replace(/\\text\{([^{}]*)\}/g, (nguyen, chu: string) => {
    const en = CHU_EN[chu];
    return en === undefined ? nguyen : `\\text{${en}}`;
  });
  /*
   * Nội dung chỉ số tới dấu phẩy hay ngoặc đóng đầu tiên. `\,` (khoảng hẹp trong `danh\,nghia`) là một
   * phần của chữ, không phải dấu phẩy kết thúc — nên dấu `\` chỉ được đi qua dưới dạng `\,`.
   */
  ra = ra.replace(/_\{((?:\\,|[^{},\\])*?)([,}])/g, (nguyen, chu: string, sau: string) => {
    const en = CHI_SO_EN[chu];
    return en === undefined ? nguyen : `_{${en}${sau}`;
  });
  return ra;
}

/**
 * Ký hiệu VIẾT LIỀN trên nhãn ô nhập ('Pmua', 'Dròng', 'LNST') → bản tiếng Anh ('Pbuy', 'Dnet',
 * 'NPAT'). Cùng bảng với `latexEn()`; `latex-en.test.ts` đòi kết quả có mặt trong hình tiếng Anh.
 * Ký hiệu không có chữ Việt ('P', 'EPS', 're') trả nguyên.
 */
export const KY_HIEU_PHANG_EN: Readonly<Record<string, string>> = {
  BP: 'TVC',
  DT: 'Rev',
  Dròng: 'Dnet',
  LNST: 'Net income',
  Pban: 'Psell',
  Pcat: 'Pstop',
  Pcuoi: 'Pend',
  Pdau: 'Pstart',
  Pdong: 'Pexit',
  Pmo: 'Pentry',
  Pmua: 'Pbuy',
  Pvao: 'Pentry',
  'rdanh nghia': 'rnominal',
  rkkh: 'rdemand',
  rky: 'rperiod',
  TSNH: 'Current assets',
  Vcuoi: 'Vend',
  Vdau: 'Vstart',
};

export function kyHieuPhangEn(kyHieu: string): string {
  return KY_HIEU_PHANG_EN[kyHieu] ?? kyHieu;
}
