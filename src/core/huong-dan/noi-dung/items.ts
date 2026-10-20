import type { BaiRieng } from './types';

/**
 * Bốn dòng hướng dẫn riêng của cả 111 công thức — chép NGUYÊN VĂN từ tài liệu chủ dự án giao ngày
 * 03/10/2026 ("HUONG DAN SU DUNG tung cong thuc - 111 cong thuc").
 *
 * Luật của khuôn, lấy từ chính tài liệu: mỗi công thức ĐÚNG bốn dòng, không công thức nào dài hơn.
 * `noi-dung.test.ts` gác khuôn ấy, gác đủ 111 id khớp Registry, và gác cả những chỗ tài liệu tự
 * nhận là còn mở (ngưỡng số trong dòng "Đọc kết quả").
 *
 * Lý do kho này tồn tại, độ trùng đo được với `explanation.*`, và vì sao nó KHÔNG ở i18n: xem
 * docblock `./types.ts`.
 *
 * `en` dịch đủ 755 chuỗi ngày 15/10/2026 (tài liệu chỉ giao tiếng Việt). Bản dịch là nội dung CHỜ
 * CHỦ DỰ ÁN DUYỆT, như mọi chữ chưa qua người đọc; cửa máy kiểm ở `noi-dung.test.ts` (đủ, chỗ trống
 * khớp, số khớp, không gạch dài, không còn dấu tiếng Việt, trần độ dài).
 */
export const BAI_RIENG: Readonly<Record<string, BaiRieng>> = {
  /* ── Cơ bản doanh nghiệp — 13 công thức ──────────────────────────────────────────────────── */

  pe: {
    deLamGi: {
      vi: 'Biết thị trường đang trả bao nhiêu đồng cho mỗi đồng lãi một năm của doanh nghiệp.',
      en: 'See how many dong the market pays for each dong the company earns in a year.',
    },
    oNhap: {
      price: {
        layODau: {
          vi: 'Giá đóng cửa gần nhất trên bảng giá, hoặc nhập theo mã.',
          en: 'The latest close on the price board, or fill it in by ticker.',
        },
      },
      eps: {
        layODau: {
          vi: 'Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu.',
          en: 'The financial statements, the basic EPS line.',
        },
        luuY: {
          vi: 'Cộng bốn quý gần nhất. Lấy một quý rồi đọc như cả năm là lỗi thường gặp nhất.',
          en: 'Add up the last four quarters. Reading one quarter as a full year is the most common mistake.',
        },
      },
    },
    docKetQua: {
      vi: 'Cao là thị trường kỳ vọng tăng trưởng, hoặc đang đắt; thấp là rẻ, hoặc đang có rủi ro. So trong cùng ngành mới có nghĩa.',
      en: 'High means the market expects growth, or the stock is expensive; low means cheap, or risky. It only means something within the same industry.',
    },
    deSai: {
      vi: 'Lấy EPS của một quý rồi đọc như EPS cả năm, làm P/E phồng lên bốn lần.',
      en: "Taking one quarter's EPS and reading it as a full year's, which inflates P/E four times over.",
    },
  },

  pb: {
    deLamGi: {
      vi: 'Biết thị trường trả bao nhiêu cho mỗi đồng vốn ghi trên sổ sách.',
      en: 'See how much the market pays for each dong of equity recorded on the books.',
    },
    oNhap: {
      price: {
        layODau: {
          vi: 'Giá đóng cửa gần nhất trên bảng giá, hoặc nhập theo mã.',
          en: 'The latest close on the price board, or fill it in by ticker.',
        },
      },
      bookValuePerShare: {
        layODau: {
          vi: 'Nhận từ công thức BVPS, hoặc lấy vốn chủ chia số cổ phiếu lưu hành.',
          en: 'From the Book value per share formula, or equity divided by shares outstanding.',
        },
      },
    },
    docKetQua: {
      vi: 'Dưới 1 là thị giá thấp hơn sổ sách, có thể rẻ, cũng có thể do thị trường nghi ngờ chất lượng tài sản.',
      en: 'Below 1 means the market price is under book value: it may be cheap, or the market may doubt the quality of the assets.',
    },
    deSai: {
      vi: 'Dùng cho ngân hàng và công ty công nghệ như nhau; tài sản hai ngành này khác hẳn bản chất.',
      en: 'Using it the same way for banks and tech companies; the assets of these two industries are fundamentally different.',
    },
  },

  'eps-co-ban': {
    deLamGi: {
      vi: 'Biết mỗi cổ phiếu gánh được bao nhiêu đồng lãi trong kỳ.',
      en: 'See how many dong of profit each share carries for the period.',
    },
    oNhap: {
      netIncome: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng cuối cùng, phần thuộc cổ đông công ty mẹ.',
          en: 'Income statement, the bottom line, the part attributable to parent company shareholders.',
        },
        luuY: {
          vi: 'Cộng tất cả bốn quý khi tính cả năm.',
          en: 'Add up all four quarters for a full year.',
        },
      },
      preferredDividend: {
        layODau: {
          vi: 'Thuyết minh báo cáo tài chính, phần cổ phiếu ưu đãi.',
          en: 'Notes to the financial statements, the preferred shares section.',
        },
        luuY: {
          vi: 'Phần lớn doanh nghiệp Việt Nam để 0.',
          en: 'Most Vietnamese companies leave this at 0.',
        },
      },
      sharesOutstanding: {
        layODau: {
          vi: 'Báo cáo quản trị hoặc bản cáo bạch, mục cổ phiếu đang lưu hành.',
          en: 'Corporate governance report or prospectus, the shares outstanding section.',
        },
        luuY: {
          vi: 'Sử dụng số liệu đang lưu hành, không dùng số liệu đăng ký.',
          en: 'Use the outstanding figure, not the registered one.',
        },
      },
    },
    docKetQua: {
      vi: 'Tăng đều qua các năm là dấu hiệu tốt; âm nghĩa là đang lỗ trên mỗi cổ phiếu.',
      en: 'Rising steadily over the years is a good sign; negative means a loss on each share.',
    },
    deSai: {
      vi: 'Dùng số cổ phiếu đăng ký thay vì số đang lưu hành, khiến EPS thấp hơn thực tế.',
      en: 'Using the registered share count instead of the outstanding one, which makes EPS lower than it really is.',
    },
  },

  bvps: {
    deLamGi: {
      vi: 'Biết nếu bán hết tài sản và trả hết nợ theo đúng giá sổ sách thì mỗi cổ phiếu còn lại bao nhiêu.',
      en: 'See how much would be left per share if all assets were sold and all debts paid at exactly book value.',
    },
    oNhap: {
      equity: {
        layODau: {
          vi: 'Bảng cân đối kế toán, dòng tổng vốn chủ sở hữu.',
          en: 'Balance sheet, the total equity line.',
        },
      },
      sharesOutstanding: {
        layODau: {
          vi: 'Báo cáo quản trị hoặc bản cáo bạch, mục cổ phiếu đang lưu hành.',
          en: 'Corporate governance report or prospectus, the shares outstanding section.',
        },
        luuY: {
          vi: 'Sử dụng số liệu đang lưu hành, không dùng số liệu đăng ký.',
          en: 'Use the outstanding figure, not the registered one.',
        },
      },
    },
    docKetQua: {
      vi: 'Thị giá dưới BVPS nghĩa là thị trường định giá doanh nghiệp dưới sổ sách, cần tìm hiểu vì sao trước khi kết luận là rẻ.',
      en: 'A market price below BVPS means the market values the company below its books; find out why before concluding it is cheap.',
    },
    deSai: {
      vi: 'Coi giá trị sổ sách là giá bán được; nhiều tài sản trên sổ không bán được bằng giá ghi sổ.',
      en: 'Treating book value as a sale price; many assets on the books cannot be sold at their book value.',
    },
  },

  roe: {
    deLamGi: {
      vi: 'Biết mỗi đồng vốn cổ đông tạo ra bao nhiêu đồng lãi trong năm.',
      en: "See how many dong of profit each dong of shareholders' capital earns in a year.",
    },
    oNhap: {
      netIncome: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng cuối cùng, phần thuộc cổ đông công ty mẹ.',
          en: 'Income statement, the bottom line, the part attributable to parent company shareholders.',
        },
        luuY: {
          vi: 'Cộng tất cả bốn quý khi tính cả năm.',
          en: 'Add up all four quarters for a full year.',
        },
      },
      equity: {
        layODau: {
          vi: 'Bảng cân đối kế toán, dòng tổng vốn chủ sở hữu.',
          en: 'Balance sheet, the total equity line.',
        },
      },
    },
    docKetQua: {
      vi: 'Giữ trên 15% nhiều năm liền thường là doanh nghiệp tốt. Nếu cao đột biến một năm thì phải xem có phải nhờ lợi nhuận bất thường.',
      en: 'Staying above 15% for many years usually means a good business. If it spikes in one year, check whether that came from one-off profit.',
    },
    deSai: {
      vi: 'ROE cao nhờ vay nhiều chứ không nhờ kinh doanh giỏi; xem kèm D/E mới đủ.',
      en: 'A high ROE that comes from heavy borrowing, not from running the business well; you need D/E alongside it.',
    },
  },

  roa: {
    deLamGi: {
      vi: 'Biết doanh nghiệp dùng toàn bộ tài sản hiệu quả đến đâu, bất kể tiền đó là vốn hay nợ.',
      en: 'See how efficiently the company uses all its assets, whether that money is equity or debt.',
    },
    oNhap: {
      netIncome: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng cuối cùng, phần thuộc cổ đông công ty mẹ.',
          en: 'Income statement, the bottom line, the part attributable to parent company shareholders.',
        },
        luuY: {
          vi: 'Cộng tất cả bốn quý khi tính cả năm.',
          en: 'Add up all four quarters for a full year.',
        },
      },
      totalAssets: {
        layODau: {
          vi: 'Bảng cân đối kế toán, dòng tổng tài sản.',
          en: 'Balance sheet, the total assets line.',
        },
      },
    },
    docKetQua: {
      vi: 'So với trung bình ngành là cách đọc đáng tin nhất, vì mỗi ngành cần lượng tài sản khác nhau.',
      en: 'Comparing with the industry average is the most reliable reading, because each industry needs a different amount of assets.',
    },
    deSai: {
      vi: 'So ROA của ngân hàng với ROA của bán lẻ; hai mặt bằng hoàn toàn khác nhau.',
      en: "Comparing a bank's ROA with a retailer's; the two baselines are completely different.",
    },
  },

  'bien-loi-nhuan-rong': {
    deLamGi: {
      vi: 'Biết trong 100 đồng doanh thu thì giữ lại được bao nhiêu đồng lãi.',
      en: 'See how many dong of profit the company keeps out of every 100 dong of revenue.',
    },
    oNhap: {
      netIncome: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng cuối cùng, phần thuộc cổ đông công ty mẹ.',
          en: 'Income statement, the bottom line, the part attributable to parent company shareholders.',
        },
        luuY: {
          vi: 'Cộng tất cả bốn quý khi tính cả năm.',
          en: 'Add up all four quarters for a full year.',
        },
      },
      revenue: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng doanh thu thuần sau khi trừ các khoản giảm trừ.',
          en: 'Income statement, the net revenue line after deductions.',
        },
        luuY: {
          vi: 'Cộng tất cả bốn quý khi tính cả năm.',
          en: 'Add up all four quarters for a full year.',
        },
      },
    },
    docKetQua: {
      vi: 'Biên mỏng nghĩa là chi phí nhích nhẹ là lợi nhuận bốc hơi; biên dày cho sức chịu đựng tốt hơn.',
      en: 'A thin margin means a small rise in costs wipes out the profit; a thick margin gives more room to absorb shocks.',
    },
    deSai: {
      vi: 'Lấy doanh thu gộp thay vì doanh thu thuần, làm biên thấp giả.',
      en: 'Using gross revenue instead of net revenue, which makes the margin falsely low.',
    },
  },

  'bien-loi-nhuan-gop': {
    deLamGi: {
      vi: 'Biết doanh nghiệp còn lại bao nhiêu sau khi trừ giá vốn, trước mọi chi phí khác.',
      en: 'See how much the company has left after cost of goods sold, before any other expense.',
    },
    oNhap: {
      revenue: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng doanh thu thuần sau khi trừ các khoản giảm trừ.',
          en: 'Income statement, the net revenue line after deductions.',
        },
        luuY: {
          vi: 'Cộng tất cả bốn quý khi tính cả năm.',
          en: 'Add up all four quarters for a full year.',
        },
      },
      cogs: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng giá vốn hàng bán.',
          en: 'Income statement, the cost of goods sold line.',
        },
        luuY: { vi: 'Cùng kỳ với doanh thu.', en: 'Same period as revenue.' },
      },
    },
    docKetQua: {
      vi: 'Ổn định hoặc tăng dần là giữ được giá bán; co lại thường do cạnh tranh ép giá hoặc chi phí đầu vào tăng.',
      en: 'Steady or rising means it is holding its selling prices; shrinking usually comes from competitive price pressure or higher input costs.',
    },
    deSai: {
      vi: 'Coi biên gộp cao là lãi nhiều; chi phí bán hàng và quản lý vẫn chưa trừ.',
      en: 'Taking a high gross margin to mean high profit; selling and administrative expenses are not deducted yet.',
    },
  },

  'no-tren-von-chu': {
    deLamGi: {
      vi: 'Biết doanh nghiệp đang vay bao nhiêu so với vốn của chính mình.',
      en: 'See how much the company is borrowing compared with its own capital.',
    },
    oNhap: {
      totalLiabilities: {
        layODau: {
          vi: 'Bảng cân đối kế toán, dòng tổng nợ phải trả.',
          en: 'Balance sheet, the total liabilities line.',
        },
        luuY: {
          vi: 'Gồm cả nợ vay lẫn nợ phải trả người bán.',
          en: 'Includes both borrowings and payables to suppliers.',
        },
      },
      equity: {
        layODau: {
          vi: 'Bảng cân đối kế toán, dòng tổng vốn chủ sở hữu.',
          en: 'Balance sheet, the total equity line.',
        },
      },
    },
    docKetQua: {
      vi: 'Trên 2 lần là đòn bẩy cao với phần lớn ngành sản xuất; ngân hàng và bất động sản có mặt bằng khác hẳn.',
      en: 'Above 2 times is high leverage for most manufacturing industries; banks and real estate have a completely different baseline.',
    },
    deSai: {
      vi: 'Chỉ lấy nợ vay mà bỏ nợ phải trả người bán, làm hệ số thấp giả.',
      en: 'Counting only borrowings and leaving out payables to suppliers, which makes the ratio falsely low.',
    },
  },

  'thanh-toan-hien-hanh': {
    deLamGi: {
      vi: 'Biết tài sản ngắn hạn có đủ trả các khoản nợ đến hạn trong một năm không.',
      en: 'See whether current assets are enough to pay the debts falling due within one year.',
    },
    oNhap: {
      currentAssets: {
        layODau: {
          vi: 'Bảng cân đối kế toán, tổng tài sản ngắn hạn.',
          en: 'Balance sheet, total current assets.',
        },
      },
      currentLiabilities: {
        layODau: {
          vi: 'Bảng cân đối kế toán, tổng nợ phải trả ngắn hạn.',
          en: 'Balance sheet, total current liabilities.',
        },
      },
    },
    docKetQua: {
      vi: 'Dưới 1 lần là dấu hiệu căng thẳng thanh khoản; quá cao lại có thể là ứ đọng vốn.',
      en: 'Below 1 is a sign of liquidity strain; too high can mean capital is sitting idle.',
    },
    deSai: {
      vi: 'Yên tâm vì hệ số cao trong khi phần lớn tài sản ngắn hạn là hàng tồn khó bán; xem thêm hệ số thanh toán nhanh.',
      en: 'Feeling safe because the ratio is high while most current assets are hard-to-sell inventory; check the Quick ratio too.',
    },
  },

  'thanh-toan-nhanh': {
    deLamGi: {
      vi: 'Biết doanh nghiệp trả nợ ngắn hạn được không nếu không bán được hàng tồn kho.',
      en: 'See whether the company could pay its short-term debts if it could not sell its inventory.',
    },
    oNhap: {
      currentAssets: {
        layODau: {
          vi: 'Bảng cân đối kế toán, tổng tài sản ngắn hạn.',
          en: 'Balance sheet, total current assets.',
        },
      },
      inventory: {
        layODau: {
          vi: 'Bảng cân đối kế toán, mục hàng tồn kho ròng.',
          en: 'Balance sheet, the net inventory line.',
        },
      },
      currentLiabilities: {
        layODau: {
          vi: 'Bảng cân đối kế toán, tổng nợ phải trả ngắn hạn.',
          en: 'Balance sheet, total current liabilities.',
        },
      },
    },
    docKetQua: {
      vi: 'Quanh 1 lần trở lên là an toàn; thấp hơn hẳn hệ số hiện hành nghĩa là thanh khoản đang phụ thuộc nặng vào bán hàng tồn.',
      en: 'Around 1 or above is safe; well below the Current ratio means liquidity leans heavily on selling inventory.',
    },
    deSai: {
      vi: 'Quên trừ hàng tồn kho, biến công thức này thành bản sao của hệ số hiện hành.',
      en: 'Forgetting to subtract inventory, which turns this formula into a copy of the Current ratio.',
    },
  },

  'vong-quay-tong-tai-san': {
    deLamGi: {
      vi: 'Biết mỗi đồng tài sản tạo ra bao nhiêu đồng doanh thu một năm.',
      en: 'See how many dong of revenue each dong of assets generates in a year.',
    },
    oNhap: {
      revenue: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng doanh thu thuần sau khi trừ các khoản giảm trừ.',
          en: 'Income statement, the net revenue line after deductions.',
        },
        luuY: {
          vi: 'Cộng tất cả bốn quý khi tính cả năm.',
          en: 'Add up all four quarters for a full year.',
        },
      },
      totalAssets: {
        layODau: {
          vi: 'Bảng cân đối kế toán, dòng tổng tài sản.',
          en: 'Balance sheet, the total assets line.',
        },
      },
    },
    docKetQua: {
      vi: 'Bán lẻ quay nhanh trên 2 vòng nhưng biên mỏng; điện nước, bất động sản quay dưới 0,5 vòng nhưng biên dày.',
      en: 'Retail turns over fast, above 2 times, but on thin margins; utilities and real estate turn below 0,5 times but with thick margins.',
    },
    deSai: {
      vi: 'So ngang giữa hai ngành khác nhau rồi kết luận ngành quay chậm là kém.',
      en: 'Comparing two different industries side by side and concluding that the slower-turning one is worse.',
    },
  },

  'ty-le-chi-tra-co-tuc': {
    deLamGi: {
      vi: 'Biết doanh nghiệp chia bao nhiêu phần lãi cho cổ đông, giữ lại bao nhiêu để tái đầu tư.',
      en: 'See how much of its profit the company pays out to shareholders and how much it keeps to reinvest.',
    },
    oNhap: {
      dividendPerShare: {
        layODau: {
          vi: 'Nghị quyết chi trả cổ tức của doanh nghiệp.',
          en: "The company's dividend payment resolution.",
        },
        luuY: {
          vi: 'Chỉ lấy cổ tức tiền mặt, không lấy cổ tức bằng cổ phiếu.',
          en: 'Cash dividends only, not stock dividends.',
        },
      },
      eps: {
        layODau: {
          vi: 'Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu.',
          en: 'The financial statements, the basic EPS line.',
        },
        luuY: {
          vi: 'Cộng bốn quý gần nhất. Lấy một quý rồi đọc như cả năm là lỗi thường gặp nhất.',
          en: 'Add up the last four quarters. Reading one quarter as a full year is the most common mistake.',
        },
      },
    },
    docKetQua: {
      vi: 'Trên 100% nghĩa là trả nhiều hơn lãi làm ra, phải lấy từ tiền tích luỹ, khó bền. Doanh nghiệp tăng trưởng nhanh thường giữ hệ số thấp.',
      en: 'Above 100% means it pays out more than it earns, drawing on accumulated cash, which is hard to sustain. Fast-growing companies usually keep the ratio low.',
    },
    deSai: {
      vi: 'Cộng cả cổ tức bằng cổ phiếu vào tử số; công thức này chỉ tính cổ tức tiền mặt.',
      en: 'Adding stock dividends to the numerator; this formula counts cash dividends only.',
    },
  },

  /* ── Định giá — 20 công thức ─────────────────────────────────────────────────────────────── */

  ps: {
    deLamGi: {
      vi: 'Định giá doanh nghiệp theo quy mô doanh thu, dùng được cả khi đang lỗ.',
      en: 'Values a company by the size of its revenue, and works even when the company is losing money.',
    },
    oNhap: {
      price: {
        layODau: {
          vi: 'Giá đóng cửa gần nhất trên bảng giá, hoặc nhập theo mã.',
          en: 'The latest closing price on the price board, or fill it in by ticker.',
        },
      },
      salesPerShare: {
        layODau: {
          vi: 'Doanh thu thuần chia số cổ phiếu lưu hành.',
          en: 'Net revenue divided by the number of shares outstanding.',
        },
      },
    },
    docKetQua: {
      vi: 'Thấp hơn các doanh nghiệp cùng ngành gợi ý đang rẻ so với quy mô doanh thu.',
      en: 'Lower than companies in the same industry suggests it is cheap relative to its revenue.',
    },
    deSai: {
      vi: 'So khác ngành; biên lợi nhuận mỗi ngành một khác nên cùng mức P/S không cùng ý nghĩa.',
      en: 'Comparing across industries; profit margins differ from one industry to another, so the same P/S does not mean the same thing.',
    },
  },

  ev: {
    deLamGi: {
      vi: 'Biết cái giá thực để mua đứt doanh nghiệp, gồm cả gánh nợ và trừ tiền mặt sẵn có.',
      en: 'Shows the real price of buying the whole company, including its debt and minus the cash it already holds.',
    },
    oNhap: {
      marketCap: {
        layODau: {
          vi: 'Nhận từ công thức Vốn hoá, hoặc lấy trên bảng giá.',
          en: 'Taken from the Market capitalization formula, or from the price board.',
        },
      },
      totalDebt: {
        layODau: {
          vi: 'Bảng cân đối kế toán, cộng vay ngắn hạn và vay dài hạn.',
          en: 'Balance sheet: add short-term and long-term borrowings.',
        },
        luuY: {
          vi: 'Chỉ lấy nợ vay có lãi, không lấy nợ phải trả người bán.',
          en: 'Only count interest-bearing debt, not amounts owed to suppliers.',
        },
      },
      cash: {
        layODau: {
          vi: 'Bảng cân đối kế toán, mục tiền và các khoản tương đương tiền.',
          en: 'Balance sheet, the cash and cash equivalents line.',
        },
        luuY: {
          vi: 'Có thể cộng thêm đầu tư tài chính ngắn hạn thanh khoản cao.',
          en: 'You can also add highly liquid short-term financial investments.',
        },
      },
    },
    docKetQua: {
      vi: 'EV lớn hơn vốn hoá nghĩa là doanh nghiệp vay nhiều hơn tiền mặt đang giữ. EV âm là hiếm, khi tiền mặt vượt cả vốn hoá cộng nợ.',
      en: 'EV above market capitalization means the company has borrowed more than the cash it holds. Negative EV is rare: it happens when cash exceeds market capitalization plus debt.',
    },
    deSai: {
      vi: 'Quên trừ tiền mặt, làm EV cao giả và mọi bội số dựa trên EV sai theo.',
      en: 'Forgetting to subtract cash, which inflates EV and throws off every multiple based on EV.',
    },
  },

  'ev-ebitda': {
    deLamGi: {
      vi: 'So giá mua đứt doanh nghiệp với dòng tiền hoạt động, bỏ qua khác biệt về khấu hao và cơ cấu vốn.',
      en: 'Compares the price of buying the whole company with its operating cash flow, ignoring differences in depreciation and capital structure.',
    },
    oNhap: {
      ev: {
        layODau: {
          vi: 'Nhận tự động từ công thức EV.',
          en: 'Auto-filled from the Enterprise value formula.',
        },
      },
      ebitda: {
        layODau: {
          vi: 'Lợi nhuận trước lãi vay, thuế và khấu hao. Lấy EBIT cộng khấu hao.',
          en: 'Earnings before interest, taxes and depreciation. Take EBIT plus depreciation.',
        },
        luuY: {
          vi: 'Cộng tất cả bốn quý khi tính cả năm.',
          en: 'Add up all four quarters for a full year.',
        },
      },
    },
    docKetQua: {
      vi: 'Thấp hơn trung bình ngành gợi ý đang rẻ.',
      en: 'Below the industry average suggests it is cheap.',
    },
    deSai: {
      vi: 'Quên rằng EBITDA chưa trừ chi đầu tư, nên ngành thâm dụng vốn trông rẻ một cách giả tạo.',
      en: 'Forgetting that EBITDA does not subtract capital spending, so capital-intensive industries look falsely cheap.',
    },
  },

  'ev-sales': {
    deLamGi: {
      vi: 'Định giá theo doanh thu nhưng có tính cả nợ, khác P/S ở chỗ đó.',
      en: 'Values a company by its revenue but also counts its debt, which is how it differs from P/S.',
    },
    oNhap: {
      ev: {
        layODau: {
          vi: 'Nhận tự động từ công thức EV.',
          en: 'Auto-filled from the Enterprise value formula.',
        },
      },
      revenue: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng doanh thu thuần sau khi trừ các khoản giảm trừ.',
          en: 'Income statement, the net revenue line after revenue deductions.',
        },
        luuY: {
          vi: 'Cộng tất cả bốn quý khi tính cả năm.',
          en: 'Add up all four quarters for a full year.',
        },
      },
    },
    docKetQua: {
      vi: 'Trong cùng ngành, thấp hơn trung bình gợi ý đang rẻ so với quy mô kinh doanh.',
      en: 'Within the same industry, below the average suggests it is cheap relative to the size of its business.',
    },
    deSai: {
      vi: 'So với P/S rồi thắc mắc vì sao lệch; EV/Sales có cộng nợ nên luôn khác.',
      en: 'Comparing it with P/S and wondering why they differ; EV/Sales adds in debt, so it is always different.',
    },
  },

  peg: {
    deLamGi: {
      vi: 'Biết mức P/E hiện tại có tương xứng với tốc độ tăng trưởng lợi nhuận không.',
      en: "Shows whether the current P/E is in line with the company's earnings growth rate.",
    },
    oNhap: {
      pe: {
        layODau: {
          vi: 'Nhận từ công thức P/E, hoặc lấy trên bảng giá.',
          en: 'Taken from the Price to earnings ratio formula, or from the price board.',
        },
      },
      growth: {
        layODau: {
          vi: 'Dự phóng tăng trưởng lợi nhuận của bạn, hoặc của công ty chứng khoán.',
          en: "Your own earnings growth forecast, or a securities firm's.",
        },
        luuY: {
          vi: 'Lấy mức duy trì được vài năm, không lấy mức của một năm đột biến.',
          en: 'Use a rate that can last several years, not the rate of one exceptional year.',
        },
      },
    },
    docKetQua: {
      vi: 'Quanh 1 thường coi là hợp lý. Dưới 1 gợi ý rẻ so với tăng trưởng, trên 2 là đắt trừ khi tăng trưởng còn tăng tốc.',
      en: 'Around 1 is usually seen as fair. Below 1 suggests cheap relative to growth, above 2 is expensive unless growth is still accelerating.',
    },
    deSai: {
      vi: 'Lấy tăng trưởng của một năm đột biến làm tăng trưởng dài hạn, khiến PEG đẹp giả.',
      en: 'Using the growth of one exceptional year as long-term growth, which makes PEG look falsely good.',
    },
  },

  'von-hoa-thi-truong': {
    deLamGi: {
      vi: 'Biết thị trường đang định giá phần vốn cổ đông của doanh nghiệp bao nhiêu tiền.',
      en: "Shows how much money the market is currently valuing the company's shareholders' equity at.",
    },
    oNhap: {
      price: {
        layODau: {
          vi: 'Giá đóng cửa gần nhất trên bảng giá, hoặc nhập theo mã.',
          en: 'The latest closing price on the price board, or fill it in by ticker.',
        },
      },
      shares: {
        layODau: {
          vi: 'Báo cáo quản trị, mục cổ phiếu đang lưu hành. Ô này nhận triệu CP.',
          en: 'Corporate governance report, shares outstanding section. This field takes millions of shares.',
        },
        luuY: {
          vi: 'Nếu có {shares|coPhieu} cổ phiếu thì nhập {shares}.',
          en: 'If there are {shares|coPhieu} shares, enter {shares}.',
        },
      },
    },
    docKetQua: {
      vi: 'Đây là giá phần vốn cổ đông, chưa tính nợ. Doanh nghiệp lớn thường biến động giá êm hơn doanh nghiệp vốn hoá nhỏ.',
      en: "This is the price of the shareholders' equity, not counting debt. Large companies usually move more smoothly in price than small-cap companies.",
    },
    deSai: {
      vi: 'Nhầm đơn vị số cổ phiếu, ô này nhận triệu CP chứ không phải CP.',
      en: 'Mixing up the unit of the share count; this field takes millions of shares, not shares.',
    },
  },

  'so-graham': {
    deLamGi: {
      vi: 'Có một mức giá trần bảo thủ theo chuẩn Benjamin Graham để đối chiếu với thị giá.',
      en: "Gives you a conservative price ceiling, by Benjamin Graham's standard, to compare with the market price.",
    },
    oNhap: {
      eps: {
        layODau: {
          vi: 'Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu.',
          en: 'Financial statements, the basic EPS line.',
        },
        luuY: {
          vi: 'Cộng bốn quý gần nhất. Lấy một quý rồi đọc như cả năm là lỗi thường gặp nhất.',
          en: 'Add the last four quarters. Reading one quarter as a full year is the most common mistake.',
        },
      },
      bvps: {
        layODau: {
          vi: 'Nhận từ công thức BVPS, hoặc lấy vốn chủ chia số cổ phiếu lưu hành.',
          en: 'Taken from the Book value per share formula, or equity divided by shares outstanding.',
        },
      },
    },
    docKetQua: {
      vi: 'Thị giá thấp hơn số Graham gợi ý cổ phiếu chưa đắt theo chuẩn này.',
      en: 'A market price below the Graham number suggests the stock is not yet expensive by this standard.',
    },
    deSai: {
      vi: 'Dùng làm bộ lọc duy nhất; đây là chuẩn bảo thủ, dễ bỏ sót doanh nghiệp tăng trưởng.',
      en: 'Using it as the only filter; it is a conservative standard and easily misses growth companies.',
    },
  },

  'ncav-tren-co-phieu': {
    deLamGi: {
      vi: 'Biết nếu thanh lý ngay hôm nay, chỉ tính tài sản ngắn hạn và trừ hết nợ, thì mỗi cổ phiếu còn bao nhiêu.',
      en: 'Shows what each share would be left with if liquidated today, counting only current assets and subtracting all liabilities.',
    },
    oNhap: {
      currentAssets: {
        layODau: {
          vi: 'Bảng cân đối kế toán, tổng tài sản ngắn hạn.',
          en: 'Balance sheet, total current assets.',
        },
      },
      totalLiabilities: {
        layODau: {
          vi: 'Bảng cân đối kế toán, dòng tổng nợ phải trả.',
          en: 'Balance sheet, the total liabilities line.',
        },
        luuY: {
          vi: 'Gồm cả nợ vay lẫn nợ phải trả người bán.',
          en: 'Includes both borrowings and amounts owed to suppliers.',
        },
      },
      shares: {
        layODau: {
          vi: 'Báo cáo quản trị, mục cổ phiếu đang lưu hành. Ô này nhận triệu CP.',
          en: 'Corporate governance report, shares outstanding section. This field takes millions of shares.',
        },
        luuY: {
          vi: 'Nếu có {shares|coPhieu} cổ phiếu thì nhập {shares}.',
          en: 'If there are {shares|coPhieu} shares, enter {shares}.',
        },
      },
    },
    docKetQua: {
      vi: 'Giá dưới NCAV là tín hiệu rẻ hiếm gặp, thường chỉ xuất hiện lúc thị trường hoảng loạn.',
      en: 'A price below NCAV is a rare sign of cheapness, usually seen only when the market panics.',
    },
    deSai: {
      vi: 'Thấy NCAV âm rồi tưởng doanh nghiệp có vấn đề; âm là điều bình thường với hầu hết doanh nghiệp.',
      en: 'Seeing a negative NCAV and assuming the company is in trouble; negative is normal for most companies.',
    },
  },

  'ty-suat-loi-nhuan-tren-gia': {
    deLamGi: {
      vi: 'Đổi P/E thành phần trăm để so thẳng với lãi suất tiết kiệm.',
      en: 'Turns P/E into a percentage so you can compare it directly with savings interest rates.',
    },
    oNhap: {
      eps: {
        layODau: {
          vi: 'Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu.',
          en: 'Financial statements, the basic EPS line.',
        },
        luuY: {
          vi: 'Cộng bốn quý gần nhất. Lấy một quý rồi đọc như cả năm là lỗi thường gặp nhất.',
          en: 'Add the last four quarters. Reading one quarter as a full year is the most common mistake.',
        },
      },
      price: {
        layODau: {
          vi: 'Giá đóng cửa gần nhất trên bảng giá, hoặc nhập theo mã.',
          en: 'The latest closing price on the price board, or fill it in by ticker.',
        },
      },
    },
    docKetQua: {
      vi: 'Nếu cao hơn lãi suất tiết kiệm đáng kể thì cổ phiếu đang cho suất sinh lời hấp dẫn hơn gửi tiền, đổi lại rủi ro cao hơn hẳn.',
      en: 'If it is well above the savings rate, the stock offers a more attractive return than a deposit, in exchange for much higher risk.',
    },
    deSai: {
      vi: 'Coi con số này là tiền thật nhận được; lợi nhuận phần lớn giữ lại trong doanh nghiệp chứ không về tài khoản bạn.',
      en: 'Treating this number as real cash you receive; most of the earnings stay in the company and never reach your account.',
    },
  },

  'gia-muc-tieu': {
    deLamGi: {
      vi: 'Dựng một mức giá kịch bản từ P/E bạn cho là hợp lý.',
      en: 'Builds a scenario price from the P/E you consider reasonable.',
    },
    oNhap: {
      targetPe: {
        layODau: {
          vi: 'P/E trung bình ngành, hoặc P/E lịch sử của chính mã đó.',
          en: "The industry average P/E, or the ticker's own historical P/E.",
        },
        luuY: {
          vi: 'Đây là giả định của bạn, không phải số liệu. Thử vài mức để thấy khoảng giá.',
          en: 'This is your assumption, not data. Try a few levels to see the price range.',
        },
      },
      eps: {
        layODau: {
          vi: 'Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu.',
          en: 'Financial statements, the basic EPS line.',
        },
        luuY: {
          vi: 'Cộng bốn quý gần nhất. Lấy một quý rồi đọc như cả năm là lỗi thường gặp nhất.',
          en: 'Add the last four quarters. Reading one quarter as a full year is the most common mistake.',
        },
      },
    },
    docKetQua: {
      vi: 'Cao hơn thị giá nghĩa là còn dư địa tăng nếu P/E mục tiêu thành hiện thực.',
      en: 'Above the market price means there is room to rise if the target P/E comes true.',
    },
    deSai: {
      vi: 'Đọc như một dự báo; đây là một kịch bản phụ thuộc hoàn toàn vào hai số bạn vừa nhập.',
      en: 'Reading it as a forecast; it is a scenario that depends entirely on the two numbers you just entered.',
    },
  },

  'mo-hinh-gordon': {
    deLamGi: {
      vi: 'Định giá cổ phiếu theo dòng cổ tức tăng đều mãi mãi.',
      en: 'Values a stock by a dividend stream that grows steadily forever.',
    },
    oNhap: {
      dividend: {
        layODau: {
          vi: 'Cổ tức tiền mặt của kỳ gần nhất, theo nghị quyết chi trả.',
          en: 'The cash dividend of the most recent period, per the dividend payment resolution.',
        },
      },
      growth: {
        layODau: {
          vi: 'Mức tăng cổ tức bạn tin là duy trì được mãi mãi.',
          en: 'The dividend growth rate you believe can be sustained forever.',
        },
        luuY: {
          vi: '3–5% là vùng hợp lý. Đặt sát suất sinh lợi r sẽ làm kết quả vọt lên vô lý.',
          en: '3 to 5% is reasonable. Setting it near the required return r makes the result shoot up absurdly.',
        },
      },
      requiredReturn: {
        layODau: {
          vi: 'Nhận tự động từ CAPM, hoặc nhập mức bạn tự đòi hỏi.',
          en: 'Auto-filled from the Capital asset pricing model, or enter the rate you demand yourself.',
        },
        luuY: {
          vi: 'Phải lớn hơn tăng trưởng g, nếu không mô hình cho kết quả vô lý.',
          en: 'Must be greater than growth g, otherwise the model gives an absurd result.',
        },
      },
    },
    docKetQua: {
      vi: 'Giá trị tính ra cao hơn thị giá nghĩa là cổ phiếu đang rẻ theo mô hình.',
      en: 'A computed value above the market price means the stock is cheap according to the model.',
    },
    deSai: {
      vi: 'Đặt tăng trưởng g sát với suất sinh lợi r; kết quả cực nhạy với hiệu r − g và sẽ vọt lên vô lý.',
      en: 'Setting growth g close to the required return r; the result is extremely sensitive to r − g and will shoot up absurdly.',
    },
  },

  'ddm-hai-giai-doan': {
    deLamGi: {
      vi: 'Định giá cổ phiếu đang tăng trưởng nhanh rồi mới chậm lại, thay vì tăng đều ngay từ đầu.',
      en: 'Values a stock that grows fast before slowing down, instead of growing steadily from the start.',
    },
    oNhap: {
      dividend: {
        layODau: {
          vi: 'Cổ tức tiền mặt của kỳ gần nhất, theo nghị quyết chi trả.',
          en: 'The cash dividend of the most recent period, per the dividend payment resolution.',
        },
      },
      growthStage1: {
        layODau: {
          vi: 'Mức tăng cổ tức trong những năm đầu còn tăng nhanh.',
          en: 'The dividend growth rate in the early years, while growth is still fast.',
        },
        luuY: {
          vi: 'Lấy từ kế hoạch doanh nghiệp hoặc dự phóng của công ty chứng khoán.',
          en: "Take it from the company's plan or a securities firm's forecast.",
        },
      },
      years: {
        layODau: {
          vi: 'Số năm bạn tin doanh nghiệp còn tăng trưởng nhanh.',
          en: 'The number of years you believe the company will keep growing fast.',
        },
        luuY: { vi: '5 năm là giả định phổ biến.', en: '5 years is a common assumption.' },
      },
      growthTerminal: {
        layODau: {
          vi: 'Mức tăng cổ tức sau khi giai đoạn tăng nhanh kết thúc.',
          en: 'The dividend growth rate after the fast-growth stage ends.',
        },
        luuY: {
          vi: 'Phải thấp hơn hẳn g1 và nhỏ hơn suất sinh lợi r.',
          en: 'Must be well below g1 and less than the required return r.',
        },
      },
      requiredReturn: {
        layODau: {
          vi: 'Nhận tự động từ CAPM, hoặc nhập mức bạn tự đòi hỏi.',
          en: 'Auto-filled from the Capital asset pricing model, or enter the rate you demand yourself.',
        },
        luuY: {
          vi: 'Phải lớn hơn tăng trưởng g, nếu không mô hình cho kết quả vô lý.',
          en: 'Must be greater than growth g, otherwise the model gives an absurd result.',
        },
      },
    },
    docKetQua: {
      vi: 'Con số là giá trị một cổ phiếu theo mô hình; cao hơn thị giá là đang rẻ theo cách tính này.',
      en: 'The number is the value of one share under the model; above the market price means it is cheap by this calculation.',
    },
    deSai: {
      vi: 'Để tăng trưởng dài hạn g2 cao bằng giai đoạn đầu, làm mô hình mất ý nghĩa.',
      en: 'Letting long-term growth g2 be as high as the first stage, which makes the model meaningless.',
    },
  },

  capm: {
    deLamGi: {
      vi: 'Biết mức sinh lợi tối thiểu mỗi năm mà cổ đông nên đòi ở cổ phiếu này.',
      en: 'Shows the minimum yearly return shareholders should demand from this stock.',
    },
    oNhap: {
      riskFree: {
        layODau: {
          vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm, xem trên HNX hoặc bản tin thị trường.',
          en: 'The 10-year government bond yield, on HNX or in market news bulletins.',
        },
        luuY: {
          vi: 'Việt Nam 2026 quanh 3–4%/năm. Không dùng lãi suất tiết kiệm ngân hàng.',
          en: 'In Vietnam in 2026 it is around 3 to 4%/year. Do not use bank savings rates.',
        },
      },
      beta: {
        layODau: {
          vi: 'Nhận tự động từ công thức Beta, hoặc nhập theo mã.',
          en: 'Auto-filled from the Beta coefficient formula, or fill it in by ticker.',
        },
        luuY: {
          vi: 'Trên 1 là nhạy hơn thị trường, dưới 1 là ít nhạy hơn.',
          en: 'Above 1 means more sensitive than the market, below 1 means less sensitive.',
        },
      },
      erp: {
        layODau: {
          vi: 'Phần lợi suất thị trường cổ phiếu vượt trên trái phiếu chính phủ.',
          en: 'The extra yield the stock market earns above government bonds.',
        },
        luuY: {
          vi: 'Thị trường Việt Nam thường dùng 7–9%.',
          en: '7 to 9% is commonly used for the Vietnamese market.',
        },
      },
    },
    docKetQua: {
      vi: 'Con số là ngưỡng sinh lợi tối thiểu, dùng làm suất chiết khấu cho các mô hình định giá.',
      en: 'The number is the minimum return threshold, used as the discount rate for valuation models.',
    },
    deSai: {
      vi: 'Dùng lãi suất tiết kiệm ngân hàng làm lãi suất phi rủi ro; chuẩn là trái phiếu chính phủ.',
      en: 'Using a bank savings rate as the risk-free rate; the standard is government bonds.',
    },
  },

  wacc: {
    deLamGi: {
      vi: 'Biết doanh nghiệp phải sinh lợi tối thiểu bao nhiêu để không huỷ giá trị, tính cả vốn lẫn nợ.',
      en: 'Shows the minimum return the company must earn to avoid destroying value, counting both equity and debt.',
    },
    oNhap: {
      equity: {
        layODau: {
          vi: 'Dùng vốn hoá thị trường nếu có, vì WACC tính theo giá thị trường.',
          en: 'Use market capitalization if available, because WACC is based on market values.',
        },
        luuY: {
          vi: 'Có thể lấy số liệu trong sổ sách, nhưng sẽ kém chính xác.',
          en: 'You can use the book figure, but it will be less accurate.',
        },
      },
      debt: {
        layODau: {
          vi: 'Bảng cân đối kế toán, cộng vay ngắn hạn và vay dài hạn.',
          en: 'Balance sheet: add short-term and long-term borrowings.',
        },
      },
      costEquity: {
        layODau: {
          vi: 'Nhận tự động từ công thức CAPM.',
          en: 'Auto-filled from the Capital asset pricing model formula.',
        },
        luuY: {
          vi: 'Thường 11–16% với cổ phiếu Việt Nam.',
          en: 'Usually 11 to 16% for Vietnamese stocks.',
        },
      },
      costDebt: {
        layODau: {
          vi: 'Thuyết minh báo cáo tài chính, mục chi phí tài chính: lấy lãi vay chia dư nợ bình quân.',
          en: 'Notes to the financial statements, financial expenses: interest divided by average debt.',
        },
        luuY: {
          vi: 'Doanh nghiệp niêm yết Việt Nam thường 7–11%/năm.',
          en: 'Usually 7 to 11%/year for Vietnamese listed companies.',
        },
      },
      taxRate: {
        layODau: {
          vi: 'Thuế suất phổ thông theo luật hiện hành.',
          en: 'The standard rate under current law.',
        },
        luuY: {
          vi: '20% cho phần lớn doanh nghiệp. Doanh nghiệp ưu đãi có thể thấp hơn, xem thuyết minh.',
          en: '20% for most firms. Tax-incentive firms may pay less, see the notes to the financial statements.',
        },
      },
    },
    docKetQua: {
      vi: 'Dự án chỉ tạo giá trị khi sinh lợi vượt WACC.',
      en: 'A project creates value only when its return exceeds WACC.',
    },
    deSai: {
      vi: 'Tưởng rằng nếu vay thêm thì WACC giảm; điều đó chỉ đúng khi lãi vay sau thuế còn rẻ hơn chi phí vốn chủ.',
      en: 'Assuming that borrowing more lowers WACC; that holds only when after-tax interest is still cheaper than the cost of equity.',
    },
  },

  fcff: {
    deLamGi: {
      vi: 'Biết doanh nghiệp tạo ra bao nhiêu tiền mặt thực sự còn lại cho cả chủ nợ và cổ đông.',
      en: 'Shows how much real cash the company generates that is left for both creditors and shareholders.',
    },
    oNhap: {
      ebit: {
        layODau: {
          vi: 'Lợi nhuận thuần từ hoạt động kinh doanh cộng lại chi phí lãi vay.',
          en: 'Net operating profit with interest expense added back.',
        },
      },
      taxRate: {
        layODau: {
          vi: 'Thuế suất phổ thông theo luật hiện hành.',
          en: 'The standard rate under current law.',
        },
        luuY: {
          vi: '20% cho phần lớn doanh nghiệp. Doanh nghiệp ưu đãi có thể thấp hơn, xem thuyết minh.',
          en: '20% for most firms. Tax-incentive firms may pay less, see the notes to the financial statements.',
        },
      },
      depreciation: {
        layODau: {
          vi: 'Báo cáo lưu chuyển tiền tệ, mục khấu hao tài sản cố định.',
          en: 'Cash flow statement, the depreciation of fixed assets line.',
        },
      },
      capex: {
        layODau: {
          vi: 'Báo cáo lưu chuyển tiền tệ, mục tiền chi mua sắm tài sản cố định.',
          en: 'Cash flow statement, the cash paid to buy fixed assets line.',
        },
        luuY: { vi: 'Nhập số dương.', en: 'Enter a positive number.' },
      },
      nwcChange: {
        layODau: {
          vi: 'Chênh lệch vốn lưu động giữa hai kỳ, xem báo cáo lưu chuyển tiền tệ.',
          en: 'The change in working capital between two periods; see the cash flow statement.',
        },
        luuY: {
          vi: 'Nếu vốn lưu động giảm thì nhập số âm.',
          en: 'If working capital fell, enter a negative number.',
        },
      },
    },
    docKetQua: {
      vi: 'Biểu đồ bóc tách bên dưới cho thấy từng khoản cộng trừ dẫn tới con số cuối.',
      en: 'The breakdown chart below shows each item added or subtracted on the way to the final number.',
    },
    deSai: {
      vi: 'Thấy FCFF âm rồi kết luận xấu; doanh nghiệp đang mở rộng có thể chi đầu tư lớn hơn tiền tạo ra, cần xem âm vì đầu tư hay vì kinh doanh kém.',
      en: 'Seeing negative FCFF and calling it bad; an expanding company can invest more than it generates, so check whether investing or weak business made it negative.',
    },
  },

  fcfe: {
    deLamGi: {
      vi: 'Biết sau khi trả lãi vay và cân đối nợ vay mới, cổ đông còn lại bao nhiêu tiền mặt.',
      en: 'Shows how much cash is left for shareholders after paying interest and netting out new borrowing.',
    },
    oNhap: {
      fcff: {
        layODau: {
          vi: 'Nhận tự động từ công thức FCFF.',
          en: 'Auto-filled from the Free cash flow to firm formula.',
        },
      },
      interest: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, mục chi phí tài chính.',
          en: 'Income statement, the financial expenses line.',
        },
      },
      taxRate: {
        layODau: {
          vi: 'Thuế suất phổ thông theo luật hiện hành.',
          en: 'The standard rate under current law.',
        },
        luuY: {
          vi: '20% cho phần lớn doanh nghiệp. Doanh nghiệp ưu đãi có thể thấp hơn, xem thuyết minh.',
          en: '20% for most firms. Tax-incentive firms may pay less, see the notes to the financial statements.',
        },
      },
      netBorrowing: {
        layODau: {
          vi: 'Tiền vay mới trừ tiền trả nợ gốc, ở báo cáo lưu chuyển tiền tệ phần tài chính.',
          en: 'New borrowing minus principal repaid, in the financing section of the cash flow statement.',
        },
        luuY: {
          vi: 'Nếu trả nợ nhiều hơn vay mới thì nhập số âm.',
          en: 'If repayments exceed new borrowing, enter a negative number.',
        },
      },
    },
    docKetQua: {
      vi: 'Cao hơn cổ tức thực trả nghĩa là còn dư địa tăng cổ tức hoặc mua lại cổ phiếu.',
      en: 'Above the dividends actually paid means there is room to raise dividends or buy back shares.',
    },
    deSai: {
      vi: 'Để vay ròng mới bằng 0 cho đơn giản; khoản này thường lớn và làm lệch kết quả nhiều.',
      en: 'Setting new net borrowing to 0 for simplicity; this item is often large and skews the result a lot.',
    },
  },

  'gia-tri-noi-tai-fcff': {
    deLamGi: {
      vi: 'Ra một mức giá trị nội tại cho mỗi cổ phiếu từ dòng tiền doanh nghiệp.',
      en: "Gives an intrinsic value per share from the company's cash flow.",
    },
    oNhap: {
      fcff: {
        layODau: {
          vi: 'Nhận tự động từ công thức FCFF.',
          en: 'Auto-filled from the Free cash flow to firm formula.',
        },
      },
      growth: {
        layODau: {
          vi: 'Mức tăng dòng tiền bạn tin là duy trì được mãi mãi.',
          en: 'The cash flow growth rate you believe can be sustained forever.',
        },
        luuY: {
          vi: 'Đặt thấp hơn tăng trưởng GDP dài hạn, thường 3–5%, và luôn phải nhỏ hơn WACC.',
          en: 'Set it below long-term GDP growth, usually 3 to 5%, and always below WACC.',
        },
      },
      wacc: {
        layODau: {
          vi: 'Nhận tự động từ công thức WACC, hoặc nhập ước tính riêng của bạn.',
          en: 'Auto-filled from the Weighted average cost of capital formula, or type in your own estimate.',
        },
        luuY: {
          vi: 'Phải lớn hơn tăng trưởng dài hạn g, nếu không mô hình vô nghĩa.',
          en: 'Must be greater than long-term growth g, otherwise the model is meaningless.',
        },
      },
      netDebt: {
        layODau: {
          vi: 'Nợ vay trừ tiền và tương đương tiền.',
          en: 'Debt minus cash and cash equivalents.',
        },
        luuY: {
          vi: 'Với doanh nghiệp nhiều tiền mặt, số này có thể là số âm, nhập đúng dấu âm.',
          en: 'For cash-rich companies this can be negative; enter it with the minus sign.',
        },
      },
      shares: {
        layODau: {
          vi: 'Báo cáo quản trị, mục cổ phiếu đang lưu hành. Ô này nhận triệu CP.',
          en: 'Corporate governance report, shares outstanding section. This field takes millions of shares.',
        },
        luuY: {
          vi: 'Nếu có {shares|coPhieu} cổ phiếu thì nhập {shares}.',
          en: 'If there are {shares|coPhieu} shares, enter {shares}.',
        },
      },
    },
    docKetQua: {
      vi: 'So con số này với thị giá; cao hơn nhiều là cổ phiếu đang rẻ theo mô hình.',
      en: 'Compare this number with the market price; well above it means the stock is cheap according to the model.',
    },
    deSai: {
      vi: 'Đặt g sát WACC; kết quả cực nhạy với hiệu WACC − g, nên thử vài kịch bản trước khi tin một con số.',
      en: 'Setting g close to WACC; the result is extremely sensitive to WACC − g, so try a few scenarios before trusting any one number.',
    },
  },

  'gia-tri-hien-tai': {
    deLamGi: {
      vi: 'Biết một khoản tiền nhận trong tương lai đáng bao nhiêu tiền hôm nay.',
      en: 'Shows how much an amount received in the future is worth today.',
    },
    oNhap: {
      futureValue: {
        layODau: {
          vi: 'Khoản tiền sẽ nhận được ở một thời điểm trong tương lai.',
          en: 'The amount you will receive at some point in the future.',
        },
      },
      rate: {
        layODau: {
          vi: 'Mức sinh lợi bạn có thể kiếm được ở kênh đầu tư khác cùng rủi ro.',
          en: 'The return you could earn from another investment with the same risk.',
        },
        luuY: {
          vi: 'Chiết khấu thấp làm mọi khoản tiền tương lai trông giá trị hơn thực tế.',
          en: 'A low discount rate makes every future amount look more valuable than it really is.',
        },
      },
      years: {
        layODau: {
          vi: 'Khoảng cách giữa hai mốc thời gian đang xét.',
          en: 'The time between the two points in time being considered.',
        },
        luuY: {
          vi: 'Lệch một năm ở đây làm kết quả lệch đáng kể.',
          en: 'Being off by one year here shifts the result considerably.',
        },
      },
    },
    docKetQua: {
      vi: 'Con số là số tiền hôm nay tương đương với khoản tiền tương lai đó.',
      en: 'The number is the amount today that is equivalent to that future amount.',
    },
    deSai: {
      vi: 'Chọn tỷ lệ chiết khấu quá thấp, làm mọi khoản tiền tương lai trông giá trị hơn thực tế.',
      en: 'Choosing a discount rate that is too low, which makes every future amount look more valuable than it really is.',
    },
  },

  'gia-tri-tuong-lai': {
    deLamGi: {
      vi: 'Biết số tiền hiện có sẽ thành bao nhiêu sau một số năm nếu giữ nguyên mức sinh lợi.',
      en: 'Shows what the money you have now will grow to after a number of years if the return stays the same.',
    },
    oNhap: {
      presentValue: {
        layODau: {
          vi: 'Số tiền bạn có trong tay hôm nay.',
          en: 'The amount of money you have in hand today.',
        },
      },
      rate: {
        layODau: {
          vi: 'Mức sinh lợi bạn giả định duy trì suốt thời gian đầu tư.',
          en: 'The return you assume holds for the whole investment period.',
        },
      },
      years: {
        layODau: {
          vi: 'Khoảng cách giữa hai mốc thời gian đang xét.',
          en: 'The time between the two points in time being considered.',
        },
        luuY: {
          vi: 'Lệch một năm ở đây làm kết quả lệch đáng kể.',
          en: 'Being off by one year here shifts the result considerably.',
        },
      },
    },
    docKetQua: {
      vi: 'Con số là số tiền ở cuối kỳ nếu mức sinh lợi giả định giữ nguyên suốt thời gian đó.',
      en: 'The number is the amount at the end of the period if the assumed return holds for the whole time.',
    },
    deSai: {
      vi: 'Quên rằng lạm phát ăn mòn số này; muốn tính sức mua thật thì dùng thêm công thức Lợi suất thực.',
      en: 'Forgetting that inflation erodes this number; to get real purchasing power, also use the Real return (Fisher equation) formula.',
    },
  },

  'bien-an-toan': {
    deLamGi: {
      vi: 'Biết đang mua rẻ hơn giá trị ước tính bao nhiêu phần trăm.',
      en: 'Shows by what percentage you are buying below the estimated value.',
    },
    oNhap: {
      intrinsic: {
        layODau: {
          vi: 'Nhận tự động từ Mô hình Gordon, hoặc nhập từ mô hình định giá khác của bạn.',
          en: 'Auto-filled from the Gordon growth model, or enter it from another valuation model of yours.',
        },
        luuY: {
          vi: 'Biên an toàn chỉ chắc bằng mô hình sinh ra con số này.',
          en: 'The margin of safety is only as solid as the model that produced this number.',
        },
      },
      price: {
        layODau: {
          vi: 'Giá đóng cửa gần nhất trên bảng giá.',
          en: 'The latest closing price on the price board.',
        },
      },
    },
    docKetQua: {
      vi: 'Biên 25% nghĩa là mua rẻ hơn ước tính một phần tư; biên âm nghĩa là đang trả cao hơn giá trị tính ra.',
      en: 'A 25% margin means buying a quarter below the estimate; a negative margin means paying more than the computed value.',
    },
    deSai: {
      vi: 'Tin biên an toàn trong khi giá trị nội tại dựa trên giả định lỏng lẻo; biên chỉ chắc bằng mô hình sinh ra nó.',
      en: 'Trusting the margin of safety while the intrinsic value rests on loose assumptions; the margin is only as solid as the model behind it.',
    },
  },

  /* ── Lợi suất — 14 công thức ─────────────────────────────────────────────────────────────── */

  roi: {
    deLamGi: {
      vi: 'Biết khoản đầu tư đã lãi hay lỗ bao nhiêu phần trăm so với vốn bỏ ra.',
      en: 'Shows what percentage your investment has gained or lost relative to the capital you put in.',
    },
    oNhap: {
      cost: {
        layODau: {
          vi: 'Tổng tiền đã chi cho khoản đầu tư, gồm cả phí nếu muốn con số sát thực.',
          en: 'The total spent on the investment, fees included if you want a realistic figure.',
        },
      },
      current: {
        layODau: {
          vi: 'Giá trị thị trường của khoản đầu tư hôm nay.',
          en: 'The market value of the investment today.',
        },
      },
    },
    docKetQua: {
      vi: '25% nghĩa là cứ 100 đồng vốn lãi thêm 25 đồng. Âm là đang lỗ.',
      en: '25% means every 100 dong of capital earned 25 dong more. A negative result means a loss.',
    },
    deSai: {
      vi: 'Quên phí và thuế; nếu muốn con số thật thì dùng công thức ROI ròng.',
      en: 'Forgetting fees and taxes; for the true figure, use the Net ROI after fees and taxes formula.',
    },
  },

  hpr: {
    deLamGi: {
      vi: 'Biết tổng lãi của cả kỳ nắm giữ, gồm cả tăng giá lẫn cổ tức.',
      en: 'Shows the total return over the whole holding period, from both price gains and dividends.',
    },
    oNhap: {
      startPrice: {
        layODau: {
          vi: 'Giá đóng cửa phiên đầu của kỳ bạn xét.',
          en: 'The closing price of the first session of the period you are looking at.',
        },
        luuY: {
          vi: 'Nếu có chia tách trong kỳ thì phải dùng giá đã điều chỉnh.',
          en: 'If there was a stock split during the period, use the adjusted price.',
        },
      },
      endPrice: {
        layODau: {
          vi: 'Giá đóng cửa phiên cuối của kỳ bạn xét.',
          en: 'The closing price of the last session of the period you are looking at.',
        },
      },
      dividend: {
        layODau: {
          vi: 'Cổ tức tiền mặt nhận được trong đúng kỳ nắm giữ.',
          en: 'Cash dividends received during exactly that holding period.',
        },
      },
    },
    docKetQua: {
      vi: 'Phần cao hơn tỷ suất tính trên giá thuần chính là đóng góp của cổ tức.',
      en: 'The amount by which it exceeds the return on price alone is what dividends contributed.',
    },
    deSai: {
      vi: 'Bỏ quên cổ tức, làm hiệu quả nắm giữ dài hạn thấp hơn thực tế.',
      en: 'Leaving out dividends, which makes long-term holding look worse than it really is.',
    },
  },

  cagr: {
    deLamGi: {
      vi: 'Quy nhiều năm lãi lỗ thất thường về một mức tăng đều mỗi năm để dễ so sánh.',
      en: 'Turns several years of uneven gains and losses into one steady yearly growth rate that is easy to compare.',
    },
    oNhap: {
      start: {
        layODau: {
          vi: 'Giá trị khoản đầu tư ở thời điểm bắt đầu.',
          en: 'The value of the investment at the start.',
        },
      },
      end: {
        layODau: {
          vi: 'Giá trị khoản đầu tư ở thời điểm kết thúc.',
          en: 'The value of the investment at the end.',
        },
      },
      years: {
        layODau: {
          vi: 'Khoảng cách giữa hai mốc thời gian đang xét.',
          en: 'The span between the two points in time you are looking at.',
        },
        luuY: {
          vi: 'Lệch một năm ở đây làm kết quả lệch đáng kể.',
          en: 'Being off by one year here throws the result off significantly.',
        },
      },
    },
    docKetQua: {
      vi: '14,87% nghĩa là nếu tăng đều 14,87% mỗi năm thì sau số năm đó ra đúng giá trị cuối kỳ.',
      en: '14,87% means that growing a steady 14,87% every year for that many years lands exactly on the ending value.',
    },
    deSai: {
      vi: 'Nhập số năm lệch một năm; sai lệch nhỏ ở đây làm kết quả lệch đáng kể.',
      en: 'Entering a number of years that is off by one; a small error here throws the result off significantly.',
    },
  },

  'ty-suat-co-tuc': {
    deLamGi: {
      vi: 'Biết nếu bỏ tiền mua cổ phiếu thì một năm nhận lại bao nhiêu phần trăm bằng tiền mặt.',
      en: 'Shows what percentage of your money comes back in cash each year if you buy the shares.',
    },
    oNhap: {
      price: {
        layODau: {
          vi: 'Giá đóng cửa gần nhất trên bảng giá.',
          en: 'The latest closing price on the price board.',
        },
      },
      dividendPerShare: {
        layODau: {
          vi: 'Cộng các đợt chi trả tiền mặt trong 12 tháng gần nhất.',
          en: 'Add up the cash payouts over the last 12 months.',
        },
        luuY: { vi: 'Chỉ cộng cổ tức tiền mặt.', en: 'Only add cash dividends.' },
      },
    },
    docKetQua: {
      vi: '2,17% nghĩa là nếu bỏ 100.000 ₫ thì một năm nhận 2.170 ₫ tiền mặt, trước thuế.',
      en: '2,17% means that if you put in 100.000 ₫, you receive 2.170 ₫ in cash a year, before tax.',
    },
    deSai: {
      vi: 'Thấy tỷ suất cao bất thường rồi mừng; thường là do giá vừa rơi mạnh, không phải do cổ tức tăng.',
      en: 'Getting excited about an unusually high yield; it usually means the price just fell sharply, not that the dividend rose.',
    },
  },

  xirr: {
    deLamGi: {
      vi: 'Biết lãi suất thực của một chuỗi giao dịch vào ra nhiều lần vào những ngày khác nhau.',
      en: 'Shows the actual rate of return on money going in and out several times on different dates.',
    },
    /*
     * RỖNG, và đó là sự thật chứ không phải chỗ còn thiếu: số liệu của `xirr` vào bằng BẢNG DÒNG
     * TIỀN, không qua bảng biến, nên công thức này không có ô nhập nào để viết chữ.
     *
     * Mục cũ tả ô "Suất sinh lợi khởi điểm" và dặn *"chỉ thay đổi khi kết quả không hội tụ"* — ô
     * ấy đã bỏ ngày 06/10/2026 vì đo được là nó không đổi được kết quả ở bất kỳ giá trị nào, và
     * lời dặn ấy cũng sai: `xirr()` có nhánh chia đôi dự phòng, không hội tụ thì không điểm xuất
     * phát nào cứu được. Xem docblock mục 5 ở `src/core/formulas/returns.ts`.
     */
    oNhap: {},
    docKetQua: {
      vi: 'Đọc như một mức lãi kép mỗi năm, đem so với lãi suất tiết kiệm cùng kỳ hạn.',
      en: 'Read it as a yearly compound rate and compare it with a savings rate for the same term.',
    },
    deSai: {
      vi: 'Quên dấu âm cho khoản bỏ ra; nếu thiếu dấu âm thì không tính được.',
      en: 'Forgetting the minus sign on money you put in; without the minus sign, nothing can be computed.',
    },
  },

  'loi-suat-nam-hoa': {
    deLamGi: {
      vi: 'Quy một mức lãi ngắn hạn về mức lãi tương đương cả năm.',
      en: 'Converts a short-term return into its equivalent for a full year.',
    },
    oNhap: {
      periodReturn: {
        layODau: {
          vi: 'Lãi của đúng một kỳ, chưa quy ra năm.',
          en: 'The return for exactly one period, not yet annualized.',
        },
      },
      periodsPerYear: {
        layODau: {
          vi: 'Số kỳ của lợi suất vừa nhập trong một năm.',
          en: 'How many periods of the return you just entered fit in one year.',
        },
        luuY: {
          vi: '12 nếu theo tháng, 4 nếu theo quý, 52 nếu theo tuần.',
          en: '12 for monthly, 4 for quarterly, 52 for weekly.',
        },
      },
    },
    docKetQua: {
      vi: 'So với lãi suất gửi tiết kiệm cùng kỳ hạn để biết khoản lãi ngắn hạn có đáng không.',
      en: 'Compare it with a savings rate for the same term to see whether the short-term return is worth it.',
    },
    deSai: {
      vi: 'Quy năm một khoản lãi may mắn của một kỳ rồi coi như mức bền vững.',
      en: "Annualizing one lucky period's return and treating it as a sustainable rate.",
    },
  },

  'loi-suat-thuc': {
    deLamGi: {
      vi: 'Biết tiền có thực sự mua được nhiều hơn không, sau khi trừ trượt giá.',
      en: 'Shows whether your money really buys more after accounting for inflation.',
    },
    oNhap: {
      nominal: {
        layODau: {
          vi: 'Lãi suất ghi trên hợp đồng, hoặc mức sinh lợi bạn đạt được.',
          en: 'The rate stated in the contract, or the return you actually earned.',
        },
      },
      inflation: {
        layODau: {
          vi: 'Chỉ số giá tiêu dùng do Tổng cục Thống kê công bố, mục CPI bình quân năm.',
          en: 'The consumer price index published by the General Statistics Office, under average annual CPI.',
        },
        luuY: {
          vi: 'Việt Nam nhiều năm gần đây quanh 3–4%.',
          en: 'In recent years Vietnam has been around 3 to 4%.',
        },
      },
    },
    docKetQua: {
      vi: 'Âm nghĩa là tiền vẫn tăng trên sổ nhưng sức mua đang giảm.',
      en: 'A negative result means your money still grows on paper but its buying power is shrinking.',
    },
    deSai: {
      vi: 'Lấy lợi suất trừ thẳng lạm phát; đó chỉ là xấp xỉ, công thức này tính chính xác hơn.',
      en: 'Simply subtracting inflation from the return; that is only an approximation, and this formula is more accurate.',
    },
  },

  'lai-suat-hieu-dung': {
    deLamGi: {
      vi: 'Biết lãi suất thật khi ngân hàng nhập lãi nhiều lần trong năm.',
      en: 'Shows the true interest rate when the bank compounds interest several times a year.',
    },
    oNhap: {
      rate: {
        layODau: {
          vi: 'Con số in trên bảng lãi suất, trước khi tính đến ghép lãi.',
          en: 'The figure printed on the rate sheet, before compounding is taken into account.',
        },
      },
      perYear: {
        layODau: {
          vi: 'Xem hợp đồng tiền gửi, mục kỳ nhập lãi.',
          en: 'See the deposit contract, in the section on how often interest is credited.',
        },
        luuY: {
          vi: 'Sổ tiết kiệm Việt Nam phần lớn nhập lãi cuối kỳ hoặc mỗi tháng.',
          en: 'Most Vietnamese savings accounts credit interest at the end of the term or every month.',
        },
      },
    },
    docKetQua: {
      vi: 'EAR luôn lớn hơn hoặc bằng lãi danh nghĩa; chênh càng rõ khi lãi suất cao và ghép dày.',
      en: 'EAR is always greater than or equal to the nominal rate; the gap widens as the rate rises and compounding gets more frequent.',
    },
    deSai: {
      vi: 'So hai sản phẩm bằng lãi suất danh nghĩa; phải quy về EAR mới so sánh được.',
      en: 'Comparing two products by their nominal rates; they can only be compared once converted to EAR.',
    },
  },

  'tong-loi-suat-tai-dau-tu': {
    deLamGi: {
      vi: 'Biết nếu lấy cổ tức mua thêm cổ phiếu thì sau nhiều năm khác bao nhiêu so với chỉ giữ.',
      en: 'Shows how much using dividends to buy more shares changes the outcome over many years versus just holding.',
    },
    oNhap: {
      priceGrowth: {
        layODau: {
          vi: 'Mức tăng giá trung bình mỗi năm bạn giả định, chưa tính cổ tức.',
          en: 'The average yearly price growth you assume, not counting dividends.',
        },
      },
      dividendYield: {
        layODau: {
          vi: 'Cổ tức tiền mặt một năm chia thị giá, hoặc lấy từ công thức Tỷ suất cổ tức.',
          en: "One year's cash dividend divided by the market price, or take it from the Dividend yield formula.",
        },
      },
      years: {
        layODau: {
          vi: 'Số năm dự định giữ khoản đầu tư.',
          en: 'How many years you plan to hold the investment.',
        },
      },
    },
    docKetQua: {
      vi: 'Phần chênh so với chỉ tính tăng giá chính là công của cổ tức tái đầu tư.',
      en: 'The difference from price growth alone is what reinvested dividends added.',
    },
    deSai: {
      vi: 'Quên trừ thuế cổ tức; tiền thực tái đầu tư ít hơn cổ tức công bố.',
      en: 'Forgetting to deduct dividend tax; the cash actually reinvested is less than the announced dividend.',
    },
  },

  'loi-suat-trung-binh-hinh-hoc': {
    deLamGi: {
      vi: 'Tính mức lãi trung bình đúng cho nhiều kỳ liên tiếp, thay vì trung bình cộng sai lệch.',
      en: 'Computes the correct average return over several consecutive periods, instead of a misleading arithmetic mean.',
    },
    oNhap: {
      // Hai câu của ô này sửa 13/10/2026 (câu của `r3` cũng sửa hôm ấy, rồi bỏ 14/10): nhóm nút "2 kỳ / 3 kỳ" đã thành hai nút
      // Thêm / Bỏ, nên bản trong `guide-111.json` ("2 hoặc 3 kỳ…") nói về một điều khiển không còn.
      periods: {
        layODau: { vi: 'Đếm số kỳ bạn có số liệu.', en: 'Count the periods you have figures for.' },
        luuY: {
          vi: 'Từ {periods|min} tới {periods|max} kỳ. Bấm Thêm kỳ hoặc Bỏ kỳ ở cuối khối Số liệu để đổi.',
          en: '{periods|min} to {periods|max} periods. Press Add a period or Remove period at the end of the Inputs block to change it.',
        },
      },
      r1: {
        layODau: {
          vi: 'Lãi của kỳ đầu tiên, tính bằng phần trăm.',
          en: 'The return of the first period, as a percentage.',
        },
        luuY: { vi: 'Kỳ lỗ nhập số âm.', en: 'Enter a losing period as a negative number.' },
      },
      // Kỳ 2 và kỳ 3 không còn câu riêng (14/10/2026), cùng lượt với đợt 2, 3 của
      // `gia-von-trung-binh-dca`: lặp lại câu của kỳ 1. Bài chỉ kể nhóm 1 — xem `isLaterRepeatSlot`.
    },
    docKetQua: {
      vi: 'Luôn thấp hơn trung bình cộng khi lợi suất có biến động; biến động càng mạnh khoảng cách càng lớn.',
      en: 'Always lower than the arithmetic mean when returns vary; the more they swing, the wider the gap.',
    },
    deSai: {
      vi: 'Dùng trung bình cộng để báo cáo hiệu quả nhiều năm, làm kết quả đẹp hơn thực tế.',
      en: 'Using the arithmetic mean to report performance over many years, which makes results look better than they are.',
    },
  },

  'irr-nien-kim': {
    deLamGi: {
      vi: 'Biết lãi suất ẩn trong một gói trả đều, ví dụ gói trả góp hoặc hợp đồng thuê.',
      en: 'Shows the interest rate hidden in an equal-payment deal, such as an installment plan or a lease.',
    },
    oNhap: {
      investment: {
        layODau: {
          vi: 'Số tiền chi một lần ở thời điểm bắt đầu.',
          en: 'The lump sum paid out at the start.',
        },
      },
      payment: {
        layODau: {
          vi: 'Số tiền bạn nhận về đều đặn mỗi kỳ.',
          en: 'The amount you receive regularly each period.',
        },
        luuY: {
          vi: 'Mọi kỳ phải bằng nhau; nếu không đều thì dùng XIRR.',
          en: 'Every period must be the same amount; if they are uneven, use XIRR.',
        },
      },
      periods: {
        layODau: {
          vi: 'Số lần sẽ nhận tiền về, đếm theo kỳ chứ không theo năm.',
          en: 'How many payments you will receive, counted in periods, not years.',
        },
        luuY: {
          vi: 'Nếu trả góp 5 năm theo tháng thì nhập 60.',
          en: 'For 5 years of monthly installments, enter 60.',
        },
      },
    },
    docKetQua: {
      vi: 'IRR tính theo kỳ: nếu dòng tiền theo tháng thì đây là %/tháng.',
      en: 'IRR is per period: if the cash flows are monthly, this is %/month.',
    },
    deSai: {
      vi: 'So thẳng %/tháng với lãi suất năm của ngân hàng; phải năm hoá thêm một bước.',
      en: "Comparing a %/month figure directly with a bank's annual rate; it needs one more step to annualize it.",
    },
  },

  'thoi-gian-nhan-doi': {
    deLamGi: {
      vi: 'Biết với mức lãi kép hiện tại thì bao lâu vốn gấp đôi.',
      en: 'Shows how long it takes your capital to double at the current compound return.',
    },
    oNhap: {
      rate: {
        layODau: {
          vi: 'Mức sinh lợi bạn kỳ vọng duy trì đều mỗi năm.',
          en: 'The return you expect to keep up steadily every year.',
        },
        luuY: {
          vi: 'Lấy mức bền vững, không lấy mức của một năm tốt.',
          en: 'Use a sustainable rate, not the rate from one good year.',
        },
      },
    },
    docKetQua: {
      vi: 'Số năm cần để vốn nhân đôi. Số phụ kèm theo là ước lượng nhanh lấy 72 chia lợi suất.',
      en: 'The number of years it takes your capital to double. The secondary figure beside it is a quick estimate: 72 divided by the return.',
    },
    deSai: {
      vi: 'Áp mức lợi suất của một năm tốt cho cả chặng dài.',
      en: 'Applying the return from one good year to the whole long stretch.',
    },
  },

  'loi-suat-quy-nam-theo-ngay': {
    deLamGi: {
      vi: 'Quy lãi của một thương vụ ngắn về mức tương đương cả năm.',
      en: 'Converts the return of a short trade into its full-year equivalent.',
    },
    oNhap: {
      buyPrice: {
        layODau: {
          vi: 'Giá khớp lệnh mua của bạn.',
          en: 'The price your buy order was filled at.',
        },
      },
      sellPrice: {
        layODau: {
          vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.',
          en: 'The price your sell order was filled at, or the price you plan to sell at.',
        },
      },
      days: {
        layODau: {
          vi: 'Đếm theo ngày lịch từ ngày mua tới ngày bán.',
          en: 'Count calendar days from the buy date to the sell date.',
        },
        luuY: {
          vi: 'Nắm càng ngắn thì phép quy năm càng phóng đại.',
          en: 'The shorter the hold, the more annualizing exaggerates.',
        },
      },
    },
    docKetQua: {
      vi: 'Nắm càng ngắn thì phép quy năm phóng đại càng mạnh: lãi 7,5% trong 90 ngày quy năm thành hơn 34%.',
      en: 'The shorter the hold, the more annualizing exaggerates: a 7,5% gain over 90 days annualizes to more than 34%.',
    },
    deSai: {
      vi: 'Coi con số quy năm của một lệnh vài ngày là hiệu quả đầu tư.',
      en: 'Treating the annualized figure of a trade held only a few days as your investment performance.',
    },
  },

  'loi-suat-vuot-chuan': {
    deLamGi: {
      vi: 'Biết danh mục đang thắng hay thua chỉ số so sánh.',
      en: 'Shows whether your portfolio is beating or trailing its benchmark index.',
    },
    oNhap: {
      portfolioReturn: {
        layODau: {
          vi: 'Lãi của danh mục bạn trong kỳ, tính cả cổ tức.',
          en: "Your portfolio's return for the period, dividends included.",
        },
      },
      benchmarkReturn: {
        layODau: {
          vi: 'Mức tăng của VN-Index hoặc VN30 trong đúng kỳ đang xét.',
          en: 'The gain of the VN-Index or VN30 over exactly the period you are looking at.',
        },
        luuY: {
          vi: 'Phải cùng kỳ với lợi suất danh mục, nếu không so sánh mất nghĩa.',
          en: 'It must cover the same period as the portfolio return, or the comparison is meaningless.',
        },
      },
    },
    docKetQua: {
      vi: 'Dương là thắng chuẩn, âm là thua chuẩn.',
      en: 'Positive means beating the benchmark, negative means trailing it.',
    },
    deSai: {
      vi: 'Lấy hai kỳ khác nhau cho hai ô, làm so sánh mất nghĩa.',
      en: 'Using two different periods for the two fields, which makes the comparison meaningless.',
    },
  },

  /* ── Rủi ro — 18 công thức ───────────────────────────────────────────────────────────────── */

  'co-lenh-rui-ro': {
    deLamGi: {
      vi: 'Biết được mua tối đa bao nhiêu cổ phiếu để nếu chạm cắt lỗ thì chỉ mất đúng phần vốn đã định.',
      en: 'Shows the most shares you can buy so that, if the stop-loss is hit, you lose exactly the portion of capital you set.',
    },
    oNhap: {
      capital: {
        layODau: {
          vi: 'Tổng vốn đang có trong tài khoản chứng khoán.',
          en: 'The total capital currently in your brokerage account.',
        },
      },
      riskPercent: {
        layODau: {
          vi: 'Phần vốn bạn chấp nhận mất nếu lệnh này chạm cắt lỗ.',
          en: 'The portion of capital you accept losing if this trade hits the stop-loss.',
        },
        luuY: {
          vi: '1–2% là mức quản trị rủi ro thông dụng. Trên 5% là rất mạo hiểm.',
          en: '1 to 2% is the common risk-management level. Above 5% is very risky.',
        },
      },
      entryPrice: {
        layODau: {
          vi: 'Giá dự định mua, hoặc giá đã khớp.',
          en: 'The price you plan to buy at, or the price your order was matched at.',
        },
      },
      stopPrice: {
        layODau: {
          vi: 'Mức giá thoát lệnh nếu đi ngược dự tính.',
          en: 'The price at which you exit if the trade goes against you.',
        },
        luuY: {
          vi: 'Đặt quá sát giá vào sẽ làm cỡ lệnh vọt lên rất lớn.',
          en: 'Setting it too close to the entry price makes the position size shoot up.',
        },
      },
    },
    docKetQua: {
      vi: 'Con số là khối lượng tối đa của riêng lệnh này, cần làm tròn xuống bội số lô.',
      en: 'The number is the maximum quantity for this trade alone; round it down to a multiple of the lot size.',
    },
    deSai: {
      vi: 'Đặt cắt lỗ quá sát giá vào, làm cỡ lệnh vọt lên rất lớn.',
      en: 'Setting the stop-loss too close to the entry price, which makes the position size shoot up.',
    },
  },

  'sut-giam-sau-nhat': {
    deLamGi: {
      vi: 'Biết trong cửa sổ đang xét, giá từng rơi khỏi đỉnh sâu nhất bao nhiêu.',
      en: 'Shows the deepest fall from a peak the price has had within the window being examined.',
    },
    oNhap: {
      lookback: {
        layODau: {
          vi: 'Độ dài cửa sổ quan sát, tính lùi từ phiên mới nhất.',
          en: 'The length of the observation window, counted back from the latest session.',
        },
        luuY: {
          vi: '{lookback} phiên là khoảng {lookback|thoiGian}. Nếu cửa sổ quá ngắn thì kết quả nhảy liên tục.',
          en: '{lookback} sessions is about {lookback|thoiGian}. If the window is too short, the result keeps jumping.',
        },
      },
    },
    docKetQua: {
      vi: 'Số dương nghĩa là mất: 25 nghĩa là từng rơi 25% khỏi đỉnh. Rơi 25% phải lãi lại 33% mới hoà vốn.',
      en: 'A positive number means a loss: 25 means the price once fell 25% from a peak. After a 25% fall, it takes a 33% gain to break even.',
    },
    deSai: {
      vi: 'Đọc số dương thành lãi; ở công thức này dương luôn là mất.',
      en: 'Reading a positive number as a gain; in this formula positive always means a loss.',
    },
  },

  'sut-giam-hien-tai': {
    deLamGi: {
      vi: 'Biết giá hôm nay còn kém đỉnh gần nhất bao nhiêu phần trăm.',
      en: "Shows how far, in percent, today's price is still below the latest peak.",
    },
    oNhap: {
      lookback: {
        layODau: {
          vi: 'Độ dài cửa sổ quan sát, tính lùi từ phiên mới nhất.',
          en: 'The length of the observation window, counted back from the latest session.',
        },
        luuY: {
          vi: '{lookback} phiên là khoảng {lookback|thoiGian}. Nếu cửa sổ quá ngắn thì kết quả nhảy liên tục.',
          en: '{lookback} sessions is about {lookback|thoiGian}. If the window is too short, the result keeps jumping.',
        },
      },
    },
    docKetQua: {
      vi: '10 nghĩa là còn kém đỉnh 10%. Bằng 0 nghĩa là giá vừa lập đỉnh mới của cửa sổ.',
      en: '10 means the price is still 10% below the peak. 0 means the price has just set a new peak for the window.',
    },
    deSai: {
      vi: 'Nhầm với mức sụt giảm sâu nhất; công thức này chỉ nói hiện tại.',
      en: 'Confusing it with maximum drawdown; this formula only tells you where things stand now.',
    },
  },

  'var-lich-su': {
    deLamGi: {
      vi: 'Biết trong một phiên tệ, mức lỗ thường không vượt quá bao nhiêu phần trăm.',
      en: 'Shows the percentage a loss usually does not exceed in a bad session.',
    },
    oNhap: {
      confidence: {
        layODau: {
          vi: 'Chọn mức tin cậy cho phép đo rủi ro.',
          en: 'Choose the confidence level for the risk measurement.',
        },
        luuY: {
          vi: '95% là mức quen dùng; 99% cho ra con số lớn hơn và thận trọng hơn.',
          en: '95% is the usual level; 99% gives a larger, more conservative number.',
        },
      },
      lookback: {
        layODau: {
          vi: 'Độ dài cửa sổ quan sát, tính lùi từ phiên mới nhất.',
          en: 'The length of the observation window, counted back from the latest session.',
        },
        luuY: {
          vi: '{lookback} phiên là khoảng {lookback|thoiGian}. Nếu cửa sổ quá ngắn thì kết quả nhảy liên tục.',
          en: '{lookback} sessions is about {lookback|thoiGian}. If the window is too short, the result keeps jumping.',
        },
      },
    },
    docKetQua: {
      vi: 'Số dương nghĩa là mất: 2,5 nghĩa là lỗ 2,5% trong phiên tệ. Số càng lớn càng rủi ro.',
      en: 'A positive number means a loss: 2,5 means losing 2,5% in a bad session. The larger the number, the riskier.',
    },
    deSai: {
      vi: 'Hiểu ngược dấu; đây là chỗ hay nhầm nhất trong nhóm rủi ro.',
      en: 'Reading the sign backwards; this is the most common mix-up in the Risk group.',
    },
  },

  'cvar-lich-su': {
    deLamGi: {
      vi: 'Biết khi đã rơi vào nhóm phiên tệ nhất thì mức lỗ trung bình là bao nhiêu.',
      en: 'Shows the average loss once you are in the group of worst sessions.',
    },
    oNhap: {
      confidence: {
        layODau: {
          vi: 'Chọn mức tin cậy cho phép đo rủi ro.',
          en: 'Choose the confidence level for the risk measurement.',
        },
        luuY: {
          vi: '95% là mức quen dùng; 99% cho ra con số lớn hơn và thận trọng hơn.',
          en: '95% is the usual level; 99% gives a larger, more conservative number.',
        },
      },
      lookback: {
        layODau: {
          vi: 'Độ dài cửa sổ quan sát, tính lùi từ phiên mới nhất.',
          en: 'The length of the observation window, counted back from the latest session.',
        },
        luuY: {
          vi: '{lookback} phiên là khoảng {lookback|thoiGian}. Nếu cửa sổ quá ngắn thì kết quả nhảy liên tục.',
          en: '{lookback} sessions is about {lookback|thoiGian}. If the window is too short, the result keeps jumping.',
        },
      },
    },
    docKetQua: {
      vi: 'Cùng quy ước với VaR, số dương là mất. CVaR luôn lớn hơn hoặc bằng VaR cùng độ tin cậy.',
      en: 'Same convention as VaR: a positive number is a loss. CVaR is always greater than or equal to VaR at the same confidence level.',
    },
    deSai: {
      vi: 'Dùng CVaR thay VaR mà quên rằng nó luôn lớn hơn, rồi tưởng rủi ro tăng.',
      en: 'Using CVaR instead of VaR, forgetting that it is always larger, and then thinking the risk has gone up.',
    },
  },

  'do-lech-chuan-loi-suat-phien': {
    deLamGi: {
      vi: 'Biết giá nhảy mạnh đến đâu giữa các phiên.',
      en: 'Shows how sharply the price jumps from session to session.',
    },
    oNhap: {
      sessions: {
        layODau: {
          vi: 'Số phiên gần nhất đưa vào phép tính.',
          en: 'The number of most recent sessions included in the calculation.',
        },
        luuY: {
          vi: '{sessions} phiên là khoảng {sessions|thoiGian}.',
          en: '{sessions} sessions is about {sessions|thoiGian}.',
        },
      },
    },
    docKetQua: {
      vi: 'Số càng lớn giá càng nhảy mạnh. Khoảng hai phần ba số phiên nằm trong cộng trừ một lần con số này.',
      en: 'The larger the number, the more sharply the price jumps. About two thirds of sessions fall within plus or minus one times this number.',
    },
    deSai: {
      vi: 'So độ lệch chuẩn theo phiên với độ biến động năm hoá; hai đơn vị khác nhau.',
      en: 'Comparing the per-session standard deviation with annualized volatility; the two are in different units.',
    },
  },

  'do-bien-dong-nam-hoa': {
    deLamGi: {
      vi: 'Quy mức dao động theo phiên về mức dao động của cả một năm.',
      en: 'Converts per-session volatility into the volatility of a whole year.',
    },
    oNhap: {
      sessions: {
        layODau: {
          vi: 'Số phiên gần nhất đưa vào phép tính.',
          en: 'The number of most recent sessions included in the calculation.',
        },
        luuY: {
          vi: '{sessions} phiên là khoảng {sessions|thoiGian}.',
          en: '{sessions} sessions is about {sessions|thoiGian}.',
        },
      },
      tradingDays: {
        layODau: {
          vi: 'Số phiên thị trường mở cửa trong một năm.',
          en: 'The number of sessions the market is open in a year.',
        },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Không dùng 365 ngày.',
          en: 'Vietnam has about 250 sessions. Do not use 365 days.',
        },
      },
    },
    docKetQua: {
      vi: '22%/năm nghĩa là trong một năm bình thường, giá có thể lệch khoảng 22% so với mức trung bình.',
      en: '22%/year means that in a normal year the price can deviate about 22% from its average.',
    },
    deSai: {
      vi: 'Đổi số phiên một năm thành 365; thị trường chỉ giao dịch khoảng 250 phiên.',
      en: 'Changing the sessions per year to 365; the market only trades about 250 sessions.',
    },
  },

  'do-lech-chuan-ban-phan': {
    deLamGi: {
      vi: 'Đo riêng phần dao động xuống, bỏ qua phần tăng giá.',
      en: 'Measures only the downside movement, ignoring price gains.',
    },
    oNhap: {
      sessions: {
        layODau: {
          vi: 'Số phiên gần nhất đưa vào phép tính.',
          en: 'The number of most recent sessions included in the calculation.',
        },
        luuY: {
          vi: '{sessions} phiên là khoảng {sessions|thoiGian}.',
          en: '{sessions} sessions is about {sessions|thoiGian}.',
        },
      },
      threshold: {
        layODau: {
          vi: 'Mốc để tính phần dao động xuống.',
          en: 'The mark against which downside movement is measured.',
        },
        luuY: {
          vi: 'Để 0% nếu chỉ muốn tính các phiên giảm giá.',
          en: 'Leave it at 0% to count only the sessions where the price fell.',
        },
      },
    },
    docKetQua: {
      vi: 'Thường nhỏ hơn hoặc bằng độ lệch chuẩn đầy đủ vì đã bỏ hết phần tăng giá.',
      en: 'Usually less than or equal to the full standard deviation, since all the upside has been left out.',
    },
    deSai: {
      vi: 'Đặt ngưỡng cao rồi quên, làm con số phồng lên mà không hiểu vì sao.',
      en: 'Setting a high threshold and forgetting it, which inflates the number without you knowing why.',
    },
  },

  'he-so-bien-thien': {
    deLamGi: {
      vi: 'Biết mỗi đơn vị lợi suất phải đổi bằng bao nhiêu đơn vị dao động.',
      en: 'Shows how many units of fluctuation you trade for each unit of return.',
    },
    oNhap: {
      sessions: {
        layODau: {
          vi: 'Số phiên gần nhất đưa vào phép tính.',
          en: 'The number of most recent sessions included in the calculation.',
        },
        luuY: {
          vi: '{sessions} phiên là khoảng {sessions|thoiGian}.',
          en: '{sessions} sessions is about {sessions|thoiGian}.',
        },
      },
    },
    docKetQua: {
      vi: '3,3 lần nghĩa là mỗi 1% lợi suất bình quân một phiên phải đổi bằng 3,3% dao động. Càng nhỏ càng tốt.',
      en: '3,3 times means each 1% of average return per session costs 3,3% of fluctuation. Smaller is better.',
    },
    deSai: {
      vi: 'Dùng khi lợi suất bình quân âm; lúc đó con số mất ý nghĩa.',
      en: 'Using it when the average return is negative; the number then loses its meaning.',
    },
  },

  'bien-do-dao-dong-lon-nhat': {
    deLamGi: {
      vi: 'Biết trong kỳ, từ đáy lên đỉnh giá đã đi bao xa.',
      en: 'Shows how far the price traveled from trough to peak during the period.',
    },
    oNhap: {
      sessions: {
        layODau: {
          vi: 'Độ dài kỳ quan sát tính bằng phiên.',
          en: 'The length of the observation period, in sessions.',
        },
        luuY: {
          vi: '{sessions} phiên là khoảng {sessions|thoiGian}.',
          en: '{sessions} sessions is about {sessions|thoiGian}.',
        },
      },
    },
    docKetQua: {
      vi: 'Tính theo đáy làm gốc: 8,25% nghĩa là đỉnh cao hơn đáy 8,25%.',
      en: 'Measured with the trough as the base: 8,25% means the peak is 8,25% above the trough.',
    },
    deSai: {
      vi: 'Đọc như mức lãi có thể đạt được; không ai mua đúng đáy bán đúng đỉnh.',
      en: 'Reading it as a gain you could make; nobody buys exactly at the bottom and sells exactly at the top.',
    },
  },

  'chuoi-phien-giam-dai-nhat': {
    deLamGi: {
      vi: 'Biết giá đã từng giảm liên tiếp bao nhiêu phiên không nghỉ.',
      en: 'Shows the most sessions in a row the price has fallen without a break.',
    },
    oNhap: {
      sessions: {
        layODau: {
          vi: 'Độ dài kỳ quan sát tính bằng phiên.',
          en: 'The length of the observation period, in sessions.',
        },
        luuY: {
          vi: '{sessions} phiên là khoảng {sessions|thoiGian}.',
          en: '{sessions} sessions is about {sessions|thoiGian}.',
        },
      },
    },
    docKetQua: {
      vi: 'Đơn vị là phiên, không phải phần trăm. Kết quả 0 nghĩa là không có phiên giảm nào trong cửa sổ.',
      en: 'The unit is sessions, not percent. A result of 0 means there was no down session in the window.',
    },
    deSai: {
      vi: 'Suy ra mức lỗ từ số phiên; chuỗi dài chưa chắc mất nhiều nếu mỗi phiên giảm nhẹ.',
      en: 'Inferring the size of the loss from the number of sessions; a long streak may not lose much if each session falls only slightly.',
    },
  },

  beta: {
    deLamGi: {
      vi: 'Biết cổ phiếu nhạy với thị trường đến mức nào.',
      en: 'Shows how sensitive the stock is to the market.',
    },
    oNhap: {
      sessions: {
        layODau: {
          vi: 'Số phiên đưa vào phép hồi quy với chỉ số thị trường.',
          en: 'The number of sessions included in the regression against the market index.',
        },
        luuY: {
          vi: 'Tối thiểu {sessions|min} phiên, nên dùng 120 hoặc 250. Nếu quá ít phiên thì beta rất kém ổn định.',
          en: 'At least {sessions|min} sessions; 120 or 250 is better. With too few sessions, beta is very unstable.',
        },
      },
    },
    docKetQua: {
      vi: 'Trên 1 là biến động mạnh hơn thị trường, giữa 0 và 1 là yếu hơn, vùng của các ngành phòng thủ.',
      en: 'Above 1 means it moves more than the market; between 0 and 1 means less, the range of defensive sectors.',
    },
    deSai: {
      vi: 'Lấy quá ít phiên; beta tính trên vài chục phiên rất kém ổn định.',
      en: 'Using too few sessions; a beta computed on a few dozen sessions is very unstable.',
    },
  },

  'ty-so-sharpe': {
    deLamGi: {
      vi: 'Biết mỗi đơn vị rủi ro đổi được bao nhiêu lợi suất vượt mức phi rủi ro.',
      en: 'Shows how much return above the risk-free rate you get for each unit of risk.',
    },
    oNhap: {
      riskFree: {
        layODau: {
          vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm.',
          en: 'The yield on 10-year government bonds.',
        },
        luuY: {
          vi: 'Dùng cùng một mức cho mọi công thức rủi ro để so sánh với nhau.',
          en: 'Use the same rate in every risk formula so they can be compared.',
        },
      },
      sessionsPerYear: {
        layODau: {
          vi: 'Số phiên thị trường mở cửa trong một năm, dùng để quy năm.',
          en: 'The number of sessions the market is open in a year, used to annualize.',
        },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Giữ nguyên số liệu cho mọi tỷ số để so sánh với nhau.',
          en: 'Vietnam has about 250 sessions. Keep the same figure for every ratio so they can be compared.',
        },
      },
    },
    docKetQua: {
      vi: 'Dưới 1 là bình thường, quanh 1 là khá, trên 2 là rất tốt nhưng phải nghi ngờ mẫu quá ngắn.',
      en: 'Below 1 is ordinary, around 1 is fairly good, above 2 is very good but you should suspect the sample is too short.',
    },
    deSai: {
      vi: 'So Sharpe của hai danh mục tính trên hai độ dài chuỗi khác nhau.',
      en: 'Comparing the Sharpe ratios of two portfolios computed over series of different lengths.',
    },
  },

  'ty-so-sortino': {
    deLamGi: {
      vi: 'Giống Sharpe nhưng chỉ phạt phần dao động xuống, không phạt phần tăng giá.',
      en: 'Like Sharpe, but it penalizes only downside movement, not price gains.',
    },
    oNhap: {
      riskFree: {
        layODau: {
          vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm.',
          en: 'The yield on 10-year government bonds.',
        },
        luuY: {
          vi: 'Dùng cùng một mức cho mọi công thức rủi ro để so sánh với nhau.',
          en: 'Use the same rate in every risk formula so they can be compared.',
        },
      },
      sessionsPerYear: {
        layODau: {
          vi: 'Số phiên thị trường mở cửa trong một năm, dùng để quy năm.',
          en: 'The number of sessions the market is open in a year, used to annualize.',
        },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Giữ nguyên số liệu cho mọi tỷ số để so sánh với nhau.',
          en: 'Vietnam has about 250 sessions. Keep the same figure for every ratio so they can be compared.',
        },
      },
    },
    docKetQua: {
      vi: 'Cùng thang với Sharpe: quanh 1 là khá, trên 2 là tốt, âm nghĩa là còn thua ngưỡng phi rủi ro.',
      en: 'Same scale as Sharpe: around 1 is fairly good, above 2 is good, negative means it still trails the risk-free level.',
    },
    deSai: {
      vi: 'Đọc Sortino và Sharpe như hai số thay thế nhau; Sortino thường cao hơn một cách tự nhiên.',
      en: 'Treating Sortino and Sharpe as interchangeable numbers; Sortino is usually higher by nature.',
    },
  },

  'ty-so-treynor': {
    deLamGi: {
      vi: 'Biết lợi suất vượt chuẩn đổi về mỗi đơn vị beta là bao nhiêu.',
      en: 'Shows how much excess return you get for each unit of beta.',
    },
    oNhap: {
      riskFree: {
        layODau: {
          vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm.',
          en: 'The yield on 10-year government bonds.',
        },
        luuY: {
          vi: 'Dùng cùng một mức cho mọi công thức rủi ro để so sánh với nhau.',
          en: 'Use the same rate in every risk formula so they can be compared.',
        },
      },
      sessionsPerYear: {
        layODau: {
          vi: 'Số phiên thị trường mở cửa trong một năm, dùng để quy năm.',
          en: 'The number of sessions the market is open in a year, used to annualize.',
        },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Giữ nguyên số liệu cho mọi tỷ số để so sánh với nhau.',
          en: 'Vietnam has about 250 sessions. Keep the same figure for every ratio so they can be compared.',
        },
      },
      beta: {
        layODau: {
          vi: 'Lấy từ công thức Beta, tính trên chính chuỗi giá của danh mục.',
          en: "From the Beta coefficient formula, computed on the portfolio's own price series.",
        },
      },
    },
    docKetQua: {
      vi: 'Càng cao càng tốt, nhưng chỉ so sánh được giữa các danh mục đã đa dạng hoá tốt.',
      en: 'Higher is better, but it can only be compared across well-diversified portfolios.',
    },
    deSai: {
      vi: 'Dùng cho một cổ phiếu đơn lẻ; Treynor giả định rủi ro riêng đã được phân tán hết.',
      en: 'Using it for a single stock; Treynor assumes company-specific risk has been fully diversified away.',
    },
  },

  'ty-so-thong-tin': {
    deLamGi: {
      vi: 'Biết phần thắng chuẩn có đáng với mức đi lệch khỏi chuẩn hay không.',
      en: 'Shows whether your margin over the benchmark is worth how far you strayed from it.',
    },
    oNhap: {
      benchmarkReturn: {
        layODau: {
          vi: 'Mức tăng một năm của chỉ số dùng làm chuẩn.',
          en: 'The one-year gain of the index used as the benchmark.',
        },
        luuY: {
          vi: 'Chọn chuẩn cùng nhóm tài sản với danh mục.',
          en: 'Pick a benchmark from the same asset class as the portfolio.',
        },
      },
      sessionsPerYear: {
        layODau: {
          vi: 'Số phiên thị trường mở cửa trong một năm, dùng để quy năm.',
          en: 'The number of sessions the market is open in a year, used to annualize.',
        },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Giữ nguyên số liệu cho mọi tỷ số để so sánh với nhau.',
          en: 'Vietnam has about 250 sessions. Keep the same figure for every ratio so they can be compared.',
        },
      },
    },
    docKetQua: {
      vi: 'Âm nghĩa là đi lệch khỏi chuẩn mà vẫn thua chuẩn.',
      en: 'Negative means you strayed from the benchmark and still trailed it.',
    },
    deSai: {
      vi: 'Chọn chuẩn so sánh không cùng nhóm tài sản với danh mục.',
      en: 'Choosing a benchmark from a different asset class than the portfolio.',
    },
  },

  'ty-so-calmar': {
    deLamGi: {
      vi: 'So lợi suất một năm với cú sụt sâu nhất đã phải chịu.',
      en: 'Compares the one-year return with the deepest drop you had to endure.',
    },
    oNhap: {
      sessionsPerYear: {
        layODau: {
          vi: 'Số phiên thị trường mở cửa trong một năm, dùng để quy năm.',
          en: 'The number of sessions the market is open in a year, used to annualize.',
        },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Giữ nguyên số liệu cho mọi tỷ số để so sánh với nhau.',
          en: 'Vietnam has about 250 sessions. Keep the same figure for every ratio so they can be compared.',
        },
      },
    },
    docKetQua: {
      vi: 'Trên 1 nghĩa là lãi một năm đã lớn hơn cú sụt sâu nhất. Âm nghĩa là cả giai đoạn đang lỗ.',
      en: 'Above 1 means the one-year gain was larger than the deepest drop. Negative means the whole period is at a loss.',
    },
    deSai: {
      vi: 'Tính trên chuỗi quá ngắn chưa chứa cú sụt thật, làm Calmar đẹp giả.',
      en: 'Computing it on a series too short to contain a real drop, which makes Calmar look deceptively good.',
    },
  },

  'ty-so-thang-thua': {
    deLamGi: {
      vi: 'Biết một phiên tăng lãi trung bình bằng bao nhiêu lần một phiên giảm lỗ.',
      en: 'Shows the average gain of an up session as a multiple of the average loss of a down session.',
    },
    oNhap: {
      threshold: {
        layODau: {
          vi: 'Mức biến động nhỏ mà bạn muốn coi như không đổi.',
          en: 'The small move you want to treat as no change.',
        },
        luuY: {
          vi: 'Nếu để 0 thì tính mọi phiên. Đặt 0,2–0,5% để lọc phiên lặng.',
          en: 'At 0, every session counts. Set 0,2 to 0,5% to filter out quiet sessions.',
        },
      },
    },
    docKetQua: {
      vi: '0,87 lần nghĩa là mỗi phiên tăng lãi trung bình chỉ bằng 0,87 lần mức lỗ của một phiên giảm.',
      en: '0,87 times means each up session gains on average only 0,87 times what a down session loses.',
    },
    deSai: {
      vi: 'Đọc thành tỷ lệ số phiên thắng trên số phiên thua; đây là tỷ số về biên độ, không phải tần suất.',
      en: 'Reading it as the number of winning sessions over losing ones; it is a ratio of size, not of frequency.',
    },
  },

  /* ── Phân tích kỹ thuật — 18 công thức ───────────────────────────────────────────────────── */

  'sma-n-phien': {
    deLamGi: {
      vi: 'Làm mượt giá để nhìn ra xu hướng thay vì nhiễu từng phiên.',
      en: 'Smooths out the price so you see the trend instead of session-to-session noise.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên của đường trung bình.',
          en: 'The number of sessions in the moving average.',
        },
        luuY: {
          vi: '20 phiên cho ngắn hạn, 50 trung hạn, 200 dài hạn. RSI dùng 14 phiên.',
          en: '20 sessions for the short term, 50 for the medium term, 200 for the long term. RSI uses 14 sessions.',
        },
      },
    },
    docKetQua: {
      vi: 'Giá nằm trên đường và đường dốc lên là xu hướng tăng; giá cắt xuống dưới là tín hiệu suy yếu.',
      en: 'Price above the line with the line sloping up is an uptrend; price crossing below the line is a sign of weakening.',
    },
    deSai: {
      vi: 'Dùng chu kỳ ngắn rồi than nhiều tín hiệu giả; chu kỳ càng dài càng ít nhiễu nhưng càng chậm.',
      en: 'Using a short period and then complaining about false signals; the longer the period, the less noise, but the slower it reacts.',
    },
  },

  'ema-n-phien': {
    deLamGi: {
      vi: 'Giống SMA nhưng phản ứng nhanh hơn với giá mới.',
      en: 'Like SMA, but reacts faster to new prices.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên của đường trung bình.',
          en: 'The number of sessions in the moving average.',
        },
        luuY: {
          vi: '20 phiên cho ngắn hạn, 50 trung hạn, 200 dài hạn. RSI dùng 14 phiên.',
          en: '20 sessions for the short term, 50 for the medium term, 200 for the long term. RSI uses 14 sessions.',
        },
      },
    },
    docKetQua: {
      vi: 'Là một mức giá tính bằng đồng, đọc bằng cách so với giá đóng cửa phiên cuối.',
      en: 'It is a price level in dong; read it by comparing it with the closing price of the last session.',
    },
    deSai: {
      vi: 'Chờ EMA xác nhận như SMA; EMA quay đầu sớm hơn nên tín hiệu cũng nhiều hơn.',
      en: 'Waiting for EMA to confirm the way SMA does; EMA turns earlier, so it also gives more signals.',
    },
  },

  'macd-duong-chinh': {
    deLamGi: {
      vi: 'Đo đà tăng giảm bằng khoảng cách giữa hai đường EMA.',
      en: 'Measures upward or downward momentum by the gap between two EMA lines.',
    },
    oNhap: {
      fastPeriod: {
        layODau: {
          vi: 'Chu kỳ của đường trung bình ngắn trong cặp MACD.',
          en: 'The period of the shorter moving average in the MACD pair.',
        },
        luuY: {
          vi: '12 là mặc định phổ biến. Phải nhỏ hơn chu kỳ chậm.',
          en: '12 is the common default. It must be smaller than the slow period.',
        },
      },
      slowPeriod: {
        layODau: {
          vi: 'Chu kỳ của đường trung bình dài trong cặp MACD.',
          en: 'The period of the longer moving average in the MACD pair.',
        },
        luuY: { vi: '26 là mặc định phổ biến.', en: '26 is the common default.' },
      },
    },
    docKetQua: {
      vi: 'Cắt lên trên 0 là đà chuyển sang tăng, cắt xuống dưới 0 là chuyển sang giảm.',
      en: 'Crossing above 0 means momentum is turning up; crossing below 0 means it is turning down.',
    },
    deSai: {
      vi: 'So giá trị MACD giữa hai mã khác nhau; con số tính bằng đồng nên chỉ so sánh được với chính mã đó.',
      en: 'Comparing MACD values between two different tickers; the figure is in dong, so it can only be compared with the same ticker.',
    },
  },

  'macd-duong-tin-hieu': {
    deLamGi: {
      vi: 'Có một đường mượt hơn để đối chiếu với MACD, lọc bớt tín hiệu giả.',
      en: 'Gives you a smoother line to compare MACD against, filtering out some false signals.',
    },
    oNhap: {
      fastPeriod: {
        layODau: {
          vi: 'Chu kỳ của đường trung bình ngắn trong cặp MACD.',
          en: 'The period of the shorter moving average in the MACD pair.',
        },
        luuY: {
          vi: '12 là mặc định phổ biến. Phải nhỏ hơn chu kỳ chậm.',
          en: '12 is the common default. It must be smaller than the slow period.',
        },
      },
      slowPeriod: {
        layODau: {
          vi: 'Chu kỳ của đường trung bình dài trong cặp MACD.',
          en: 'The period of the longer moving average in the MACD pair.',
        },
        luuY: { vi: '26 là mặc định phổ biến.', en: '26 is the common default.' },
      },
      signalPeriod: {
        layODau: {
          vi: 'Số phiên làm mượt đường MACD.',
          en: 'The number of sessions used to smooth the MACD line.',
        },
        luuY: { vi: '9 là mặc định phổ biến.', en: '9 is the common default.' },
      },
    },
    docKetQua: {
      vi: 'MACD nằm trên đường tín hiệu là đà đang mạnh lên, nằm dưới là đang yếu đi.',
      en: 'MACD above the signal line means momentum is getting stronger; below it means momentum is getting weaker.',
    },
    deSai: {
      vi: 'Đọc đường tín hiệu một mình; nó chỉ có nghĩa khi đặt cạnh MACD.',
      en: 'Reading the signal line on its own; it only means something next to MACD.',
    },
  },

  'rsi-wilder': {
    deLamGi: {
      vi: 'Đo sức mạnh tương đối của phe mua so với phe bán.',
      en: 'Measures the relative strength of buyers compared with sellers.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên của đường trung bình.',
          en: 'The number of sessions in the moving average.',
        },
        luuY: {
          vi: '20 phiên cho ngắn hạn, 50 trung hạn, 200 dài hạn. RSI dùng 14 phiên.',
          en: '20 sessions for the short term, 50 for the medium term, 200 for the long term. RSI uses 14 sessions.',
        },
      },
    },
    docKetQua: {
      vi: 'Trên 70 là vùng quá mua, dưới 30 là quá bán, quanh 50 là cân bằng.',
      en: 'Above 70 is the overbought zone, below 30 is oversold, and around 50 is balanced.',
    },
    deSai: {
      vi: 'Bán ngay khi RSI vượt 70; trong xu hướng tăng mạnh RSI có thể ở vùng cao rất lâu.',
      en: 'Selling as soon as RSI goes above 70; in a strong uptrend RSI can stay in the high zone for a long time.',
    },
  },

  'roc-toc-do-thay-doi': {
    deLamGi: {
      vi: 'Biết giá hôm nay cao hơn hay thấp hơn n phiên trước bao nhiêu phần trăm.',
      en: "Shows by what percent today's price is higher or lower than the price n sessions ago.",
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên lùi về trước để so với giá hôm nay.',
          en: "How many sessions to go back to compare with today's price.",
        },
        luuY: {
          vi: 'Tránh chọn đúng phiên có sự kiện bất thường như chia tách.',
          en: 'Avoid landing right on a session with an unusual event, such as a stock split.',
        },
      },
    },
    docKetQua: {
      vi: 'Dương là cao hơn n phiên trước, âm là thấp hơn. Tính bằng % nên so ngang giữa các mã được.',
      en: 'Positive means higher than n sessions ago, negative means lower. It is in %, so you can compare it across tickers.',
    },
    deSai: {
      vi: 'Chọn số phiên nhìn lại rơi đúng vào một cú sốc giá, làm con số méo.',
      en: 'Choosing a lookback that lands right on a price shock, which distorts the figure.',
    },
  },

  'dong-luong-momentum': {
    deLamGi: {
      vi: 'Đo sức của xu hướng bằng mức chênh giá tuyệt đối.',
      en: 'Measures the strength of a trend by the absolute price difference.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên lùi về trước để so với giá hôm nay.',
          en: "How many sessions to go back to compare with today's price.",
        },
        luuY: {
          vi: 'Tránh chọn đúng phiên có sự kiện bất thường như chia tách.',
          en: 'Avoid landing right on a session with an unusual event, such as a stock split.',
        },
      },
    },
    docKetQua: {
      vi: 'Dấu cho biết chiều, độ lớn cho biết sức. Động lượng thu hẹp trong khi giá vẫn tạo đỉnh mới là dấu hiệu xu hướng đang đuối.',
      en: 'The sign shows the direction and the size shows the strength. Momentum shrinking while price still makes new highs is a sign the trend is running out of steam.',
    },
    deSai: {
      vi: 'So động lượng giữa hai mã khác thị giá; đơn vị là đồng nên không so ngang được, cần dùng ROC.',
      en: 'Comparing momentum between two tickers with different market prices; it is in dong, so they cannot be compared directly. Use ROC instead.',
    },
  },

  'khoang-cach-gia-so-sma': {
    deLamGi: {
      vi: 'Biết giá đang xa đường trung bình bao nhiêu phần trăm.',
      en: 'Shows how far, in percent, the price is from the moving average.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Chu kỳ của đường trung bình để đo khoảng cách.',
          en: 'The period of the moving average the distance is measured from.',
        },
        luuY: {
          vi: '20 hoặc 50 là hai mức quen dùng.',
          en: '20 or 50 are the two commonly used settings.',
        },
      },
    },
    docKetQua: {
      vi: 'Dương là giá nằm trên đường, âm là nằm dưới. Càng xa 0 càng căng.',
      en: 'Positive means the price is above the line, negative means below it. The further from 0, the more stretched.',
    },
    deSai: {
      vi: 'Đặt một ngưỡng chung cho mọi mã; ngưỡng căng tuỳ độ biến động từng cổ phiếu.',
      en: 'Setting one threshold for every ticker; what counts as stretched depends on how volatile each stock is.',
    },
  },

  'giao-cat-hai-duong-ma': {
    deLamGi: {
      vi: 'Theo dõi tín hiệu cắt nhau của đường ngắn và đường dài.',
      en: 'Tracks the crossover signals between the short line and the long line.',
    },
    oNhap: {
      shortPeriod: {
        layODau: {
          vi: 'Chu kỳ của đường trung bình nhanh hơn.',
          en: 'The period of the faster moving average.',
        },
        luuY: {
          vi: 'Đặt quá gần đường dài sẽ làm tín hiệu cắt xảy ra liên tục.',
          en: 'Setting it too close to the long line makes crossovers happen constantly.',
        },
      },
      longPeriod: {
        layODau: {
          vi: 'Chu kỳ của đường trung bình chậm hơn.',
          en: 'The period of the slower moving average.',
        },
        luuY: {
          vi: 'Cặp 50 và 200 là cặp quen dùng để tìm tín hiệu cắt.',
          en: '50 and 200 is the commonly used pair for spotting crossover signals.',
        },
      },
    },
    docKetQua: {
      vi: 'Dương là đường ngắn đang nằm trên đường dài, âm là nằm dưới.',
      en: 'Positive means the short line is above the long line, negative means it is below.',
    },
    deSai: {
      vi: 'Đặt hai chu kỳ quá gần nhau, làm tín hiệu cắt xảy ra liên tục và mất ý nghĩa.',
      en: 'Setting the two periods too close together, so crossovers happen constantly and lose their meaning.',
    },
  },

  'dai-bollinger-tren': {
    deLamGi: {
      vi: 'Biết mép trên của vùng dao động quen thuộc đang ở mức giá nào.',
      en: 'Shows the price level at the upper edge of the usual trading range.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên tính trung bình và độ lệch chuẩn cho dải.',
          en: 'The number of sessions used for the average and standard deviation of the bands.',
        },
        luuY: { vi: '20 là mặc định phổ biến.', en: '20 is the common default.' },
      },
      k: {
        layODau: {
          vi: 'Số lần độ lệch chuẩn để vẽ dải rộng hay hẹp.',
          en: 'How many standard deviations to use, which makes the bands wider or narrower.',
        },
        luuY: {
          vi: '2 là mặc định phổ biến. Nếu tăng lên 2,5 thì dải rộng ra và ít bị chạm hơn.',
          en: '2 is the common default. Raising it to 2,5 widens the bands so they are touched less often.',
        },
      },
    },
    docKetQua: {
      vi: 'Giá chạm hoặc vượt dải trên nghĩa là đang ở mép trên vùng dao động quen thuộc.',
      en: 'Price touching or breaking above the upper band means it is at the upper edge of its usual trading range.',
    },
    deSai: {
      vi: 'Coi chạm dải trên là tín hiệu bán; trong xu hướng tăng mạnh giá có thể bám dải trên rất lâu.',
      en: 'Treating a touch of the upper band as a sell signal; in a strong uptrend price can hug the upper band for a long time.',
    },
  },

  'dai-bollinger-duoi': {
    deLamGi: {
      vi: 'Biết mép dưới của vùng dao động quen thuộc đang ở mức giá nào.',
      en: 'Shows the price level at the lower edge of the usual trading range.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên tính trung bình và độ lệch chuẩn cho dải.',
          en: 'The number of sessions used for the average and standard deviation of the bands.',
        },
        luuY: { vi: '20 là mặc định phổ biến.', en: '20 is the common default.' },
      },
      k: {
        layODau: {
          vi: 'Số lần độ lệch chuẩn để vẽ dải rộng hay hẹp.',
          en: 'How many standard deviations to use, which makes the bands wider or narrower.',
        },
        luuY: {
          vi: '2 là mặc định phổ biến. Nếu tăng lên 2,5 thì dải rộng ra và ít bị chạm hơn.',
          en: '2 is the common default. Raising it to 2,5 widens the bands so they are touched less often.',
        },
      },
    },
    docKetQua: {
      vi: 'Giá thủng dải dưới nghĩa là đang ở mép dưới vùng dao động quen thuộc.',
      en: 'Price breaking below the lower band means it is at the lower edge of its usual trading range.',
    },
    deSai: {
      vi: 'Coi thủng dải dưới là tín hiệu mua; trong xu hướng giảm giá có thể bám dải dưới suốt chặng.',
      en: 'Treating a break below the lower band as a buy signal; in a downtrend price can hug the lower band the whole way down.',
    },
  },

  'do-rong-dai-bollinger': {
    deLamGi: {
      vi: 'Biết giá đang lặng hay đang động so với chính nó trước đây.',
      en: 'Shows whether the price is quiet or active compared with its own past.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên tính trung bình và độ lệch chuẩn cho dải.',
          en: 'The number of sessions used for the average and standard deviation of the bands.',
        },
        luuY: { vi: '20 là mặc định phổ biến.', en: '20 is the common default.' },
      },
      k: {
        layODau: {
          vi: 'Số lần độ lệch chuẩn để vẽ dải rộng hay hẹp.',
          en: 'How many standard deviations to use, which makes the bands wider or narrower.',
        },
        luuY: {
          vi: '2 là mặc định phổ biến. Nếu tăng lên 2,5 thì dải rộng ra và ít bị chạm hơn.',
          en: '2 is the common default. Raising it to 2,5 widens the bands so they are touched less often.',
        },
      },
    },
    docKetQua: {
      vi: 'Càng nhỏ thì giá càng lặng. So với chính mã đó vài tháng trước mới có nghĩa.',
      en: 'The smaller it is, the quieter the price. It only means something when compared with the same ticker a few months earlier.',
    },
    deSai: {
      vi: 'So độ rộng giữa hai mã; không có ngưỡng chung cho mọi cổ phiếu.',
      en: 'Comparing bandwidth between two tickers; there is no common threshold that fits every stock.',
    },
  },

  'atr-dao-dong-thuc': {
    deLamGi: {
      vi: 'Biết một phiên bình thường giá đi bao nhiêu đồng, để đặt cắt lỗ cho vừa.',
      en: 'Shows how many dong the price moves in a normal session, so you can set a sensible stop-loss.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên lấy trung bình biên độ.',
          en: 'The number of sessions the range is averaged over.',
        },
        luuY: { vi: '14 là chuẩn Wilder.', en: "14 is Wilder's standard." },
      },
    },
    docKetQua: {
      vi: 'Là số tiền của một phiên, không phải phần trăm và không có hướng.',
      en: 'It is an amount of money per session, not a percentage, and it has no direction.',
    },
    deSai: {
      vi: 'Đọc ATR cao thành giá sắp tăng; ATR chỉ nói biên độ rộng, không nói chiều.',
      en: 'Reading a high ATR as a sign the price is about to rise; ATR only says the range is wide, not which way it goes.',
    },
  },

  'phan-tram-b-bollinger': {
    deLamGi: {
      vi: 'Biết giá đang nằm ở đâu trong dải, tính bằng phần trăm thay vì bằng đồng.',
      en: 'Shows where the price sits within the bands, in percent rather than in dong.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên tính trung bình và độ lệch chuẩn cho dải.',
          en: 'The number of sessions used for the average and standard deviation of the bands.',
        },
        luuY: { vi: '20 là mặc định phổ biến.', en: '20 is the common default.' },
      },
      k: {
        layODau: {
          vi: 'Số lần độ lệch chuẩn để vẽ dải rộng hay hẹp.',
          en: 'How many standard deviations to use, which makes the bands wider or narrower.',
        },
        luuY: {
          vi: '2 là mặc định phổ biến. Nếu tăng lên 2,5 thì dải rộng ra và ít bị chạm hơn.',
          en: '2 is the common default. Raising it to 2,5 widens the bands so they are touched less often.',
        },
      },
    },
    docKetQua: {
      vi: 'Trên 100% là đã vượt hẳn dải trên, dưới 0% là đã thủng dải dưới. Hai trạng thái này bình thường, không phải lỗi.',
      en: 'Above 100% means it has gone fully above the upper band, below 0% means it has broken through the lower band. Both states are normal, not errors.',
    },
    deSai: {
      vi: 'Tưởng giá trị ngoài khoảng 0 đến 100% là sai số liệu.',
      en: 'Thinking a value outside the 0 to 100% range means the data is wrong.',
    },
  },

  'stochastic-k': {
    deLamGi: {
      vi: 'Biết giá đóng cửa đang nằm sát đỉnh hay sát đáy của n phiên gần nhất.',
      en: 'Shows whether the closing price sits near the high or near the low of the last n sessions.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên lấy đỉnh và đáy để so với giá đóng cửa.',
          en: 'The number of sessions whose high and low are compared with the closing price.',
        },
        luuY: { vi: '14 là mặc định phổ biến.', en: '14 is the common default.' },
      },
    },
    docKetQua: {
      vi: 'Trên 80% là đóng cửa sát đỉnh của n phiên, dưới 20% là sát đáy.',
      en: 'Above 80% means the close is near the high of the n sessions, below 20% means it is near the low.',
    },
    deSai: {
      vi: 'Coi 80 và 20 là ngưỡng mua bán cứng; đó là hai mốc quy ước phổ biến, không phải quy tắc.',
      en: 'Treating 80 and 20 as hard buy and sell thresholds; they are two common conventional marks, not rules.',
    },
  },

  vwap: {
    deLamGi: {
      vi: 'Biết giá bình quân mà toàn thị trường đã mua trong kỳ, có tính trọng số khối lượng.',
      en: 'Shows the average price the whole market paid during the period, weighted by volume.',
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên gộp lại để tính giá bình quân theo khối lượng.',
          en: 'The number of sessions pooled to compute the volume-weighted average price.',
        },
        luuY: {
          vi: '{period} phiên là khoảng {period|thoiGian} giao dịch.',
          en: '{period} sessions is about {period|thoiGian} of trading.',
        },
      },
    },
    docKetQua: {
      vi: 'Giá hiện tại trên VWAP nghĩa là người mua bình quân của kỳ đang lãi, nếu dưới VWAP thì đang lỗ.',
      en: 'A current price above VWAP means the average buyer of the period is in profit; below VWAP means at a loss.',
    },
    deSai: {
      vi: 'Suy ra tình trạng của từng nhà đầu tư; đây chỉ là bình quân của cả kỳ.',
      en: 'Drawing conclusions about each individual investor; this is only an average for the whole period.',
    },
  },

  'do-bien-dong-lich-su': {
    deLamGi: {
      vi: 'Đo mức dao động của giá trong một năm dựa trên lịch sử đã có.',
      en: 'Measures how much the price swings over a year, based on past history.',
    },
    oNhap: {
      sample: {
        layODau: {
          vi: 'Số phiên gần nhất lấy để đo biến động.',
          en: 'The number of most recent sessions used to measure volatility.',
        },
        luuY: {
          vi: '{sample} phiên là khoảng {sample|thoiGian}, cửa sổ ba tháng đủ ổn định mà vẫn bám tình hình hiện tại.',
          en: '{sample} sessions is about {sample|thoiGian}; a three-month window is stable enough yet tracks the present.',
        },
      },
      tradingDays: {
        layODau: {
          vi: 'Số phiên thị trường mở cửa trong một năm.',
          en: 'The number of sessions the market is open in a year.',
        },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Không dùng 365 ngày.',
          en: 'Vietnam has about 250 sessions. Do not use 365 days.',
        },
      },
    },
    docKetQua: {
      vi: '40%/năm nghĩa là trong khoảng hai phần ba số năm, lợi suất một năm lệch không quá 40% quanh mức trung bình.',
      en: '40%/year means that in roughly two thirds of years, the one-year return stays within 40% of its average.',
    },
    deSai: {
      vi: 'Dùng số quá khứ làm dự báo tương lai; biến động thay đổi theo giai đoạn thị trường.',
      en: 'Using past figures as a forecast of the future; volatility changes from one market phase to the next.',
    },
  },

  'ty-le-khoi-luong': {
    deLamGi: {
      vi: 'Biết phiên hôm nay giao dịch sôi động gấp bao nhiêu lần bình thường.',
      en: "Shows how many times more active today's session is than normal.",
    },
    oNhap: {
      period: {
        layODau: {
          vi: 'Số phiên lấy trung bình khối lượng để làm mốc so sánh.',
          en: 'The number of sessions whose volume is averaged to set the baseline for comparison.',
        },
        luuY: {
          vi: '20 phiên là mốc quen dùng.',
          en: '20 sessions is the commonly used baseline.',
        },
      },
    },
    docKetQua: {
      vi: 'Bằng 1 lần là đúng mức trung bình, 2 lần là gấp đôi.',
      en: 'A value of 1 means exactly the average level, 2 means double.',
    },
    deSai: {
      vi: 'Coi khối lượng đột biến là tín hiệu tốt; chỉ số này không có hướng, đột biến đi kèm giá giảm mạnh là điều khác hẳn.',
      en: 'Treating a volume spike as a good sign; this ratio has no direction, and a spike alongside a sharp price drop is a very different thing.',
    },
  },

  /* ── Phái sinh — 7 công thức ─────────────────────────────────────────────────────────────── */

  'gia-ly-thuyet-vn30f': {
    deLamGi: {
      vi: 'Biết hợp đồng tương lai đáng giá bao nhiêu điểm theo lý thuyết, để đối chiếu với giá thị trường.',
      en: 'Shows what the futures contract is worth in points in theory, to compare with the market price.',
    },
    oNhap: {
      indexValue: {
        layODau: {
          vi: 'Giá trị chỉ số VN30 trên bảng giá, lấy cùng thời điểm với giá hợp đồng.',
          en: 'The VN30 index value on the price board, taken at the same time as the contract price.',
        },
      },
      riskFreeRate: {
        layODau: {
          vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm.',
          en: 'The yield on 10-year government bonds.',
        },
        luuY: {
          vi: 'Dùng cùng một mức cho mọi công thức rủi ro để so sánh với nhau.',
          en: 'Use the same rate in every risk formula so they can be compared.',
        },
      },
      dividendYield: {
        layODau: {
          vi: 'Số liệu rổ VN30 trên bản tin HOSE hoặc trang dữ liệu chỉ số.',
          en: 'VN30 basket data in the HOSE bulletin or on an index data page.',
        },
        luuY: { vi: 'Thường 1,5–2,5%/năm.', en: 'Usually 1,5 to 2,5%/year.' },
      },
      days: {
        layODau: {
          vi: 'Đếm theo ngày lịch tới ngày đáo hạn hợp đồng, xem lịch HNX.',
          en: "Count calendar days to the contract's expiry date; see the HNX calendar.",
        },
        luuY: {
          vi: 'Hợp đồng VN30F đáo hạn thứ Năm thứ ba của tháng.',
          en: 'VN30F contracts expire on the third Thursday of the month.',
        },
      },
    },
    docKetQua: {
      vi: 'Giá thị trường cao hơn giá lý thuyết đáng kể là thị trường đang hưng phấn; thấp hơn nhiều là đang bi quan.',
      en: 'A market price well above the theoretical price means the market is euphoric; far below it means the market is pessimistic.',
    },
    deSai: {
      vi: 'Đếm số ngày đến đáo hạn theo ngày giao dịch; ô này nhận ngày lịch.',
      en: 'Counting days to expiry in trading days; this field takes calendar days.',
    },
  },

  'basis-vn30f': {
    deLamGi: {
      vi: 'Biết hợp đồng tương lai đang cao hơn hay thấp hơn chỉ số cơ sở bao nhiêu điểm.',
      en: 'Shows how many points the futures contract is above or below the underlying index.',
    },
    oNhap: {
      futuresPoints: {
        layODau: {
          vi: 'Giá khớp của hợp đồng VN30F trên bảng giá phái sinh.',
          en: 'The matched price of the VN30F contract on the derivatives price board.',
        },
        luuY: {
          vi: 'Lấy cùng thời điểm với chỉ số cơ sở.',
          en: 'Take it at the same time as the underlying index.',
        },
      },
      indexValue: {
        layODau: {
          vi: 'Giá trị chỉ số VN30 trên bảng giá, lấy cùng thời điểm với giá hợp đồng.',
          en: 'The VN30 index value on the price board, taken at the same time as the contract price.',
        },
      },
    },
    docKetQua: {
      vi: 'Dương là hợp đồng cao hơn chỉ số, âm là thấp hơn.',
      en: 'Positive means the contract is above the index, negative means it is below.',
    },
    deSai: {
      vi: 'Đọc mọi basis dương thành kỳ vọng tăng; một phần mức đó chỉ là chi phí nắm giữ hợp lý.',
      en: 'Reading every positive basis as an expectation of a rise; part of it is just the fair cost of carry.',
    },
  },

  'lai-lo-vi-the-long': {
    deLamGi: {
      vi: 'Biết vị thế mua đang lãi hay lỗ bao nhiêu tiền.',
      en: 'Shows how much money the long position is making or losing.',
    },
    oNhap: {
      entryPoints: {
        layODau: {
          vi: 'Giá khớp khi bạn mở vị thế.',
          en: 'The matched price when you opened the position.',
        },
      },
      exitPoints: {
        layODau: {
          vi: 'Giá khớp khi đóng, hoặc giá hiện tại nếu vị thế còn mở.',
          en: 'The matched price when you close, or the current price if the position is still open.',
        },
      },
      contracts: {
        layODau: {
          vi: 'Số hợp đồng tương lai đang giữ hoặc định mở.',
          en: 'The number of futures contracts you hold or plan to open.',
        },
      },
    },
    docKetQua: {
      vi: 'Điểm đóng cao hơn điểm mở là lãi, thấp hơn là lỗ.',
      en: 'Closing points higher than opening points is a profit; lower is a loss.',
    },
    deSai: {
      vi: 'Quên rằng lãi lỗ được thanh toán bù trừ hằng ngày, không đợi tới lúc đóng vị thế.',
      en: 'Forgetting that profit and loss are settled every day, without waiting until you close the position.',
    },
  },

  'lai-lo-vi-the-short': {
    deLamGi: {
      vi: 'Biết vị thế bán đang lãi hay lỗ bao nhiêu tiền.',
      en: 'Shows how much money the short position is making or losing.',
    },
    oNhap: {
      entryPoints: {
        layODau: {
          vi: 'Giá khớp khi bạn mở vị thế.',
          en: 'The matched price when you opened the position.',
        },
      },
      exitPoints: {
        layODau: {
          vi: 'Giá khớp khi đóng, hoặc giá hiện tại nếu vị thế còn mở.',
          en: 'The matched price when you close, or the current price if the position is still open.',
        },
      },
      contracts: {
        layODau: {
          vi: 'Số hợp đồng tương lai đang giữ hoặc định mở.',
          en: 'The number of futures contracts you hold or plan to open.',
        },
      },
    },
    docKetQua: {
      vi: 'Điểm đóng thấp hơn điểm mở là lãi, cao hơn là lỗ, ngược chiều hoàn toàn với Long.',
      en: 'Closing points lower than opening points is a profit; higher is a loss, the exact opposite of a long position.',
    },
    deSai: {
      vi: 'Dùng nhầm công thức Long cho vị thế bán, ra kết quả ngược dấu.',
      en: 'Using the long position formula for a short position by mistake, which gives a result with the opposite sign.',
    },
  },

  'so-hop-dong-toi-da': {
    deLamGi: {
      vi: 'Biết với số vốn ký quỹ hiện có thì mở được tối đa bao nhiêu hợp đồng.',
      en: 'Shows the maximum number of contracts you can open with the margin capital you have.',
    },
    oNhap: {
      capital: {
        layODau: {
          vi: 'Số tiền ký quỹ đang có trong tài khoản phái sinh.',
          en: 'The margin money currently in your derivatives account.',
        },
      },
      futuresPoints: {
        layODau: {
          vi: 'Giá hợp đồng VN30F trên bảng giá phái sinh.',
          en: 'The VN30F contract price on the derivatives price board.',
        },
      },
      marginRatio: {
        layODau: {
          vi: 'Quy định của công ty chứng khoán nơi bạn mở tài khoản phái sinh.',
          en: 'Set by the securities company where you opened your derivatives account.',
        },
        luuY: {
          vi: 'Thị trường Việt Nam thường 17–20%, có thể nâng khi biến động mạnh.',
          en: 'Usually 17 to 20% in Vietnam, and it may be raised when volatility is high.',
        },
      },
    },
    docKetQua: {
      vi: 'Làm tròn xuống số nguyên. Ra 0 nghĩa là vốn chưa đủ ký quỹ cho dù chỉ một hợp đồng.',
      en: 'Rounded down to a whole number. A result of 0 means your capital is not enough to cover the margin for even one contract.',
    },
    deSai: {
      vi: 'Mở kín trần; chỉ cần một nhịp ngược chiều là có lệnh gọi ký quỹ.',
      en: 'Opening right up to the limit; a single move against you is enough to trigger a margin call.',
    },
  },

  'co-vi-the-phai-sinh': {
    deLamGi: {
      vi: 'Biết mở bao nhiêu hợp đồng để nếu chạm cắt lỗ thì chỉ mất đúng phần vốn đã định.',
      en: 'Shows how many contracts to open so that hitting your stop-loss costs only the share of capital you set.',
    },
    oNhap: {
      capital: {
        layODau: {
          vi: 'Tổng vốn trong tài khoản phái sinh.',
          en: 'Total capital in your derivatives account.',
        },
      },
      riskPercent: {
        layODau: {
          vi: 'Phần vốn bạn chấp nhận mất nếu lệnh này chạm cắt lỗ.',
          en: 'The share of capital you accept losing if this trade hits its stop-loss.',
        },
        luuY: {
          vi: '1–2% là mức quản trị rủi ro thông dụng. Trên 5% là rất mạo hiểm.',
          en: '1 to 2% is the usual risk management level. Above 5% is very risky.',
        },
      },
      stopPoints: {
        layODau: {
          vi: 'Số điểm từ giá vào lệnh tới mức thoát lệnh.',
          en: 'The number of points from your entry price to your exit level.',
        },
        luuY: {
          vi: 'Đặt quá hẹp sẽ ra 0 hợp đồng.',
          en: 'Setting it too tight gives 0 contracts.',
        },
      },
    },
    docKetQua: {
      vi: 'Làm tròn xuống số nguyên hợp đồng, nên rủi ro thực luôn nhỏ hơn hoặc bằng mức đã định.',
      en: 'Rounded down to a whole number of contracts, so the actual risk is always at or below the level you set.',
    },
    deSai: {
      vi: 'Đặt khoảng cách cắt lỗ quá hẹp, kết quả ra 0 hợp đồng.',
      en: 'Setting the stop-loss distance too tight, which gives 0 contracts.',
    },
  },

  'don-bay-hieu-dung': {
    deLamGi: {
      vi: 'Biết giá trị vị thế đang gấp bao nhiêu lần vốn thực có trong tài khoản.',
      en: 'Shows how many times larger the position value is than the actual equity in your account.',
    },
    oNhap: {
      futuresPoints: {
        layODau: {
          vi: 'Giá hợp đồng VN30F trên bảng giá phái sinh.',
          en: 'The VN30F contract price on the derivatives price board.',
        },
      },
      contracts: {
        layODau: {
          vi: 'Số hợp đồng tương lai đang giữ hoặc định mở.',
          en: 'The number of futures contracts you hold or plan to open.',
        },
      },
      equity: {
        layODau: {
          vi: 'Số dư thực tế trong tài khoản phái sinh, sau lãi lỗ đã bù trừ.',
          en: 'The actual balance in your derivatives account, after profit and loss have been settled.',
        },
        luuY: {
          vi: 'Vốn giảm vì thua lỗ sẽ tự đẩy đòn bẩy lên.',
          en: 'Equity shrinking from losses pushes leverage up on its own.',
        },
      },
    },
    docKetQua: {
      vi: 'Càng cao thì biên an toàn trước một lệnh gọi ký quỹ càng mỏng.',
      en: 'The higher it is, the thinner your safety margin before a margin call.',
    },
    deSai: {
      vi: 'Tính một lần rồi yên tâm; vốn thực giảm vì thua lỗ sẽ tự đẩy đòn bẩy lên.',
      en: 'Calculating it once and then relaxing; equity shrinking from losses pushes leverage up on its own.',
    },
  },

  /* ── Phí & thuế thị trường Việt Nam — 8 công thức ────────────────────────────────────────── */

  'phi-giao-dich-mua': {
    deLamGi: {
      vi: 'Biết một lệnh mua bị trừ thêm bao nhiêu tiền phí.',
      en: 'Find out how much extra a buy order costs you in fees.',
    },
    oNhap: {
      quantity: {
        layODau: {
          vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.',
          en: 'The number of shares in the order or in the holding.',
        },
        luuY: {
          vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.',
          en: 'HOSE trades in lots of 100 shares.',
        },
      },
      buyPrice: {
        layODau: {
          vi: 'Giá khớp lệnh mua của bạn.',
          en: 'The price your buy order was matched at.',
        },
      },
    },
    docKetQua: {
      vi: 'Số tiền trừ thêm ngoài tiền mua. Chia cho khối lượng để biết mỗi cổ phiếu đắt thêm bao nhiêu.',
      en: 'The amount charged on top of the purchase amount. Divide it by the quantity to see how much more each share costs.',
    },
    deSai: {
      vi: 'Quên rằng đây mới là một chiều; bán ra còn một lần phí nữa.',
      en: 'Forgetting that this is only one side; selling costs you another fee.',
    },
  },

  'phi-giao-dich-ban': {
    deLamGi: {
      vi: 'Biết một lệnh bán bị trừ bao nhiêu tiền phí.',
      en: 'Find out how much a sell order costs you in fees.',
    },
    oNhap: {
      quantity: {
        layODau: {
          vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.',
          en: 'The number of shares in the order or in the holding.',
        },
        luuY: {
          vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.',
          en: 'HOSE trades in lots of 100 shares.',
        },
      },
      sellPrice: {
        layODau: {
          vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.',
          en: 'The price your sell order was matched at, or the price you plan to sell at.',
        },
      },
    },
    docKetQua: {
      vi: 'Số tiền trừ khỏi tiền bán.',
      en: 'The amount taken out of the sale proceeds.',
    },
    deSai: {
      vi: 'Tính phí bán mà quên thuế chuyển nhượng, vốn là khoản riêng.',
      en: 'Working out the sell fee but forgetting the transfer tax, which is a separate charge.',
    },
  },

  'thue-chuyen-nhuong': {
    deLamGi: {
      vi: 'Biết khoản thuế bị trừ khi bán, tính trên giá trị bán chứ không trên lãi.',
      en: 'Find out the tax deducted when you sell, charged on the sale value rather than on the profit.',
    },
    oNhap: {
      quantity: {
        layODau: {
          vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.',
          en: 'The number of shares in the order or in the holding.',
        },
        luuY: {
          vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.',
          en: 'HOSE trades in lots of 100 shares.',
        },
      },
      sellPrice: {
        layODau: {
          vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.',
          en: 'The price your sell order was matched at, or the price you plan to sell at.',
        },
      },
    },
    docKetQua: {
      vi: 'Khoản trừ thẳng vào tiền bán, nộp cả khi giao dịch đang lỗ.',
      en: 'A deduction taken straight from the sale proceeds, paid even when the trade is at a loss.',
    },
    deSai: {
      vi: 'Tưởng rằng nếu lỗ thì không phải nộp; thuế này tính trên giá trị bán.',
      en: 'Thinking you owe nothing if you made a loss; this tax is charged on the sale value.',
    },
  },

  'thue-co-tuc': {
    deLamGi: {
      vi: 'Biết cổ tức công bố về tới tài khoản còn bao nhiêu.',
      en: 'Find out how much of an announced dividend actually reaches your account.',
    },
    oNhap: {
      quantity: {
        layODau: {
          vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.',
          en: 'The number of shares in the order or in the holding.',
        },
        luuY: {
          vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.',
          en: 'HOSE trades in lots of 100 shares.',
        },
      },
      dividendPerShare: {
        layODau: {
          vi: 'Cổ tức tiền mặt theo nghị quyết chi trả.',
          en: "The cash dividend set in the company's payout resolution.",
        },
      },
    },
    docKetQua: {
      vi: 'Phần cổ tức bị giữ lại. Lấy cổ tức công bố trừ số này ra tiền thực nhận.',
      en: 'The part of the dividend that is withheld. Subtract it from the announced dividend to get what you actually receive.',
    },
    deSai: {
      vi: 'Dùng tỷ suất cổ tức công bố để tính thu nhập thật mà quên khoản thuế này.',
      en: 'Using the announced dividend yield to work out your real income and forgetting this tax.',
    },
  },

  'phi-luu-ky': {
    deLamGi: {
      vi: 'Biết giữ cổ phiếu trong kho lưu ký tốn bao nhiêu tiền theo thời gian.',
      en: 'Find out how much keeping your shares in custody costs over time.',
    },
    oNhap: {
      quantity: {
        layODau: {
          vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.',
          en: 'The number of shares in the order or in the holding.',
        },
        luuY: {
          vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.',
          en: 'HOSE trades in lots of 100 shares.',
        },
      },
      months: {
        layODau: {
          vi: 'Số tháng đã giữ hoặc dự định giữ cổ phiếu.',
          en: 'The number of months you have held or plan to hold the shares.',
        },
        luuY: {
          vi: 'Dùng để tính phí lưu ký cộng dồn.',
          en: 'Used to work out the accumulated custody fee.',
        },
      },
    },
    docKetQua: {
      vi: 'Tổng phí cho cả kỳ nắm giữ, không phải mỗi tháng.',
      en: 'The total fee for the whole holding period, not per month.',
    },
    deSai: {
      vi: 'Bỏ qua vì số nhỏ; nếu giữ nhiều mã và nhiều năm thì khoản này cộng dồn đáng kể.',
      en: 'Ignoring it because the number is small; with many tickers held for many years it adds up to a real amount.',
    },
  },

  'gia-hoa-von': {
    deLamGi: {
      vi: 'Biết phải bán ở giá nào mới thực sự không lỗ, sau khi gánh hết phí và thuế.',
      en: 'Find out the price you must sell at to truly avoid a loss once all fees and taxes are paid.',
    },
    oNhap: {
      quantity: {
        layODau: {
          vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.',
          en: 'The number of shares in the order or in the holding.',
        },
        luuY: {
          vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.',
          en: 'HOSE trades in lots of 100 shares.',
        },
      },
      months: {
        layODau: {
          vi: 'Số tháng đã giữ hoặc dự định giữ cổ phiếu.',
          en: 'The number of months you have held or plan to hold the shares.',
        },
        luuY: {
          vi: 'Dùng để tính phí lưu ký cộng dồn.',
          en: 'Used to work out the accumulated custody fee.',
        },
      },
      buyPrice: {
        layODau: {
          vi: 'Giá khớp lệnh mua của bạn.',
          en: 'The price your buy order was matched at.',
        },
      },
    },
    docKetQua: {
      vi: 'Luôn cao hơn giá mua, vì phải gánh cả phí mua, phí bán, thuế bán và phí lưu ký.',
      en: 'Always above the buy price, because it has to cover the buy fee, the sell fee, the tax on the sale and the custody fee.',
    },
    deSai: {
      vi: 'Lấy giá mua làm mốc hoà vốn, bán đúng giá mua mà vẫn lỗ.',
      en: 'Taking the buy price as the break-even point, then selling at exactly the buy price and still losing money.',
    },
  },

  'loi-nhuan-rong': {
    deLamGi: {
      vi: 'Biết một thương vụ trọn vẹn thực sự lãi hay lỗ bao nhiêu tiền.',
      en: 'Find out how much money a complete trade really made or lost.',
    },
    oNhap: {
      quantity: {
        layODau: {
          vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.',
          en: 'The number of shares in the order or in the holding.',
        },
        luuY: {
          vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.',
          en: 'HOSE trades in lots of 100 shares.',
        },
      },
      months: {
        layODau: {
          vi: 'Số tháng đã giữ hoặc dự định giữ cổ phiếu.',
          en: 'The number of months you have held or plan to hold the shares.',
        },
        luuY: {
          vi: 'Dùng để tính phí lưu ký cộng dồn.',
          en: 'Used to work out the accumulated custody fee.',
        },
      },
      buyPrice: {
        layODau: {
          vi: 'Giá khớp lệnh mua của bạn.',
          en: 'The price your buy order was matched at.',
        },
      },
      sellPrice: {
        layODau: {
          vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.',
          en: 'The price your sell order was matched at, or the price you plan to sell at.',
        },
      },
    },
    docKetQua: {
      vi: 'Luôn nhỏ hơn lãi gộp trên bảng giá; khoảng cách giữa hai con số chính là tổng chi phí.',
      en: 'Always smaller than the gross gain on the price board; the gap between the two numbers is exactly your total cost.',
    },
    deSai: {
      vi: 'So con số này với lãi hiển thị trên ứng dụng môi giới rồi tưởng sai; ứng dụng thường chưa trừ hết.',
      en: 'Comparing this number with the profit in your brokerage app and thinking it is wrong; the app usually has not deducted everything.',
    },
  },

  'roi-rong': {
    deLamGi: {
      vi: 'Biết tỷ suất lợi nhuận thật sau khi trừ mọi chi phí.',
      en: 'Find out your real rate of return after every cost is deducted.',
    },
    oNhap: {
      quantity: {
        layODau: {
          vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.',
          en: 'The number of shares in the order or in the holding.',
        },
        luuY: {
          vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.',
          en: 'HOSE trades in lots of 100 shares.',
        },
      },
      months: {
        layODau: {
          vi: 'Số tháng đã giữ hoặc dự định giữ cổ phiếu.',
          en: 'The number of months you have held or plan to hold the shares.',
        },
        luuY: {
          vi: 'Dùng để tính phí lưu ký cộng dồn.',
          en: 'Used to work out the accumulated custody fee.',
        },
      },
      buyPrice: {
        layODau: {
          vi: 'Giá khớp lệnh mua của bạn.',
          en: 'The price your buy order was matched at.',
        },
      },
      sellPrice: {
        layODau: {
          vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.',
          en: 'The price your sell order was matched at, or the price you plan to sell at.',
        },
      },
    },
    docKetQua: {
      vi: 'Luôn thấp hơn tỷ suất tính trên giá thuần. Giữ càng lâu khoảng cách càng rộng vì phí lưu ký cộng dồn.',
      en: 'Always lower than the return worked out on prices alone. The longer you hold, the wider the gap, because the custody fee keeps adding up.',
    },
    deSai: {
      vi: 'Dùng ROI thường để đánh giá hiệu quả thật; con số này mới là con số thực nhận.',
      en: 'Using plain ROI to judge real performance; this number is the one you actually take home.',
    },
  },

  /* ── Tiết kiệm — 5 công thức ─────────────────────────────────────────────────────────────── */

  'lai-kep': {
    deLamGi: {
      vi: 'Biết một khoản gốc để yên nhiều năm sẽ thành bao nhiêu khi lãi nhập vào gốc.',
      en: 'Find out what a principal left alone for many years grows to when interest is added to the principal.',
    },
    oNhap: {
      principal: {
        layODau: { vi: 'Số tiền ban đầu bạn bỏ vào.', en: 'The amount you put in at the start.' },
      },
      rate: {
        layODau: {
          vi: 'Bảng lãi suất của ngân hàng hoặc hợp đồng vay.',
          en: "The bank's interest rate table, or your loan contract.",
        },
        luuY: {
          vi: 'Vay mua nhà thường 8–12%/năm sau kỳ ưu đãi.',
          en: 'Home loans usually run 8 to 12%/year after the promotional period.',
        },
      },
      years: {
        layODau: {
          vi: 'Số năm bạn để tiền sinh lời.',
          en: 'The number of years you leave the money to grow.',
        },
      },
      perYear: {
        layODau: {
          vi: 'Xem hợp đồng tiền gửi, mục kỳ nhập lãi.',
          en: 'See your deposit contract, in the section on how often interest is added to principal.',
        },
        luuY: {
          vi: 'Ghép càng dày thì tiền cuối kỳ càng nhiều, nhưng chênh lệch nhỏ ở lãi suất thấp.',
          en: 'The more often it compounds, the more you end up with, but the difference is small at low rates.',
        },
      },
    },
    docKetQua: {
      vi: 'Chênh so với lãi đơn nhỏ ở vài năm đầu và rõ rệt sau mười năm.',
      en: 'The gap over simple interest is small in the first few years and clear after ten years.',
    },
    deSai: {
      vi: 'Chọn số lần nhập lãi không khớp với sản phẩm thật, làm kết quả lệch.',
      en: 'Choosing a compounding frequency that does not match the real product, which skews the result.',
    },
  },

  'lai-tien-gui': {
    deLamGi: {
      vi: 'Biết một sổ tiết kiệm đến hạn nhận được bao nhiêu tiền lãi.',
      en: 'Find out how much interest a savings deposit pays when it matures.',
    },
    oNhap: {
      principal: {
        layODau: {
          vi: 'Số tiền ghi trên sổ tiết kiệm.',
          en: 'The amount shown on your savings deposit.',
        },
      },
      rate: {
        layODau: {
          vi: 'Bảng lãi suất của ngân hàng hoặc hợp đồng vay.',
          en: "The bank's interest rate table, or your loan contract.",
        },
        luuY: {
          vi: 'Vay mua nhà thường 8–12%/năm sau kỳ ưu đãi.',
          en: 'Home loans usually run 8 to 12%/year after the promotional period.',
        },
      },
      months: {
        layODau: {
          vi: 'Kỳ hạn gửi ghi trên sổ tiết kiệm.',
          en: 'The deposit term shown on your savings deposit.',
        },
      },
    },
    docKetQua: {
      vi: 'Tổng tiền lãi cho cả kỳ hạn đã chọn, không phải mức lãi suất theo năm.',
      en: 'The total interest for the whole term you chose, not the yearly interest rate.',
    },
    deSai: {
      vi: 'Đọc con số này như lãi một năm khi kỳ hạn chỉ 6 tháng.',
      en: "Reading this number as one year's interest when the term is only 6 months.",
    },
  },

  'tiet-kiem-muc-tieu': {
    deLamGi: {
      vi: 'Biết mỗi tháng phải để dành bao nhiêu để đạt một số tiền mong muốn.',
      en: 'Find out how much to set aside each month to reach the amount you want.',
    },
    oNhap: {
      target: {
        layODau: {
          vi: 'Số tiền muốn có vào cuối chặng.',
          en: 'The amount you want to have at the end.',
        },
      },
      rate: {
        layODau: {
          vi: 'Mức sinh lợi bạn tin là đạt được trong suốt chặng tiết kiệm.',
          en: 'The return you believe you can earn throughout the saving period.',
        },
        luuY: {
          vi: 'Gửi tiết kiệm 5–6%, quỹ cổ phiếu dài hạn 8–12%. Đặt cao là tự lừa mình.',
          en: 'Savings deposits pay 5 to 6%, long-term equity funds 8 to 12%. Setting it high is fooling yourself.',
        },
      },
      months: {
        layODau: {
          vi: 'Số tháng từ nay tới lúc cần đạt mục tiêu.',
          en: 'The number of months from now until you need to reach the goal.',
        },
        luuY: {
          vi: 'Kéo dài thời gian làm khoản góp mỗi tháng nhẹ đi rất nhanh.',
          en: 'Extending the time makes each monthly payment lighter very quickly.',
        },
      },
    },
    docKetQua: {
      vi: 'Số tiền phải gửi đều mỗi tháng.',
      en: 'The amount you must deposit every month.',
    },
    deSai: {
      vi: 'Nâng lãi suất kỳ vọng để khoản góp nhẹ đi; kéo dài thời gian hiệu quả hơn nhiều và chắc chắn hơn.',
      en: 'Raising the expected rate so the payments look lighter; extending the time works much better and is far more certain.',
    },
  },

  'rut-truoc-han': {
    deLamGi: {
      vi: 'Biết nếu rút sổ trước hạn thì mất bao nhiêu tiền lãi.',
      en: 'Find out how much interest you lose if you withdraw a savings deposit before it matures.',
    },
    oNhap: {
      principal: {
        layODau: {
          vi: 'Số tiền ghi trên sổ tiết kiệm.',
          en: 'The amount shown on your savings deposit.',
        },
      },
      contractRate: {
        layODau: {
          vi: 'Lãi suất ghi trên sổ tiết kiệm cho đúng kỳ hạn đã chọn.',
          en: 'The rate shown on your savings deposit for the exact term you chose.',
        },
      },
      termMonths: {
        layODau: {
          vi: 'Kỳ hạn ghi trên sổ tiết kiệm, không phải số tháng đã gửi.',
          en: 'The term shown on your savings deposit, not the number of months already deposited.',
        },
      },
      monthsHeld: {
        layODau: {
          vi: 'Số tháng thực tế đã gửi tính tới ngày rút.',
          en: 'The actual number of months deposited up to the day you withdraw.',
        },
        luuY: {
          vi: 'Phải nhỏ hơn kỳ hạn hợp đồng, nếu không thì không phải rút trước hạn.',
          en: 'Must be shorter than the Contract term, otherwise it is not an early withdrawal.',
        },
      },
      demandRate: {
        layODau: {
          vi: 'Xem hợp đồng tiền gửi, điều khoản rút trước hạn.',
          en: 'See your deposit contract, under the early withdrawal clause.',
        },
        luuY: {
          vi: 'Phần lớn ngân hàng để 0,1–0,5%/năm.',
          en: 'Most banks set it at 0,1 to 0,5%/year.',
        },
      },
    },
    docKetQua: {
      vi: 'Số tiền lãi thực nhận, tính theo lãi suất không kỳ hạn cho số tháng đã gửi.',
      en: 'The interest you actually receive, paid at the demand-deposit rate for the months you have already deposited.',
    },
    deSai: {
      vi: 'Tưởng được hưởng lãi suất hợp đồng cho phần thời gian đã gửi.',
      en: 'Thinking you still get the contract rate for the time the money was already deposited.',
    },
  },

  'gui-quay-vong': {
    deLamGi: {
      vi: 'So hai cách gửi để biết cách nào được nhiều tiền hơn.',
      en: 'Compare two ways of depositing to see which one earns more money.',
    },
    oNhap: {
      principal: {
        layODau: {
          vi: 'Số tiền ghi trên sổ tiết kiệm.',
          en: 'The amount shown on your savings deposit.',
        },
      },
      shortRate: {
        layODau: {
          vi: 'Bảng lãi suất, dòng kỳ hạn ngắn dự định quay vòng.',
          en: "The bank's rate table, on the row for the short term you plan to roll over.",
        },
        luuY: {
          vi: 'Mức này có thể thay đổi ở mỗi lần quay vòng.',
          en: 'This rate can change at every rollover.',
        },
      },
      shortMonths: {
        layODau: {
          vi: 'Kỳ hạn của sổ ngắn dự định quay vòng liên tục.',
          en: 'The term of the short deposit you plan to keep rolling over.',
        },
        luuY: {
          vi: '3 hoặc 6 tháng là hai lựa chọn quen dùng.',
          en: '3 or 6 months are the two usual choices.',
        },
      },
      longRate: {
        layODau: {
          vi: 'Bảng lãi suất, dòng kỳ hạn dài đang cân nhắc.',
          en: "The bank's rate table, on the row for the long term you are considering.",
        },
      },
      totalMonths: {
        layODau: {
          vi: 'Tổng số tháng dự định để tiền trong ngân hàng.',
          en: 'The total number of months you plan to keep the money in the bank.',
        },
        luuY: {
          vi: 'Nên là bội số của kỳ hạn ngắn để so sánh công bằng.',
          en: 'Should be a multiple of the short term for a fair comparison.',
        },
      },
    },
    docKetQua: {
      vi: 'Dương là quay vòng kỳ ngắn được nhiều hơn; âm là sổ kỳ dài thắng.',
      en: 'Positive means rolling over the short term earns more; negative means the long-term deposit wins.',
    },
    deSai: {
      vi: 'Giả định lãi suất kỳ ngắn giữ nguyên suốt chặng; thực tế nó thay đổi ở mỗi lần quay vòng.',
      en: 'Assuming the short-term rate stays the same the whole way; in reality it changes at every rollover.',
    },
  },

  /* ── Vay & trả góp — 3 công thức ─────────────────────────────────────────────────────────── */

  'tra-gop-nien-kim': {
    deLamGi: {
      vi: 'Biết mỗi tháng phải trả bao nhiêu khi khoản trả cố định suốt kỳ vay.',
      en: 'Find out how much you pay each month when the payment stays fixed for the whole loan.',
    },
    oNhap: {
      amount: {
        layODau: {
          vi: 'Số tiền giải ngân ghi trên hợp đồng vay.',
          en: 'The disbursed amount written in your loan contract.',
        },
      },
      rate: {
        layODau: {
          vi: 'Bảng lãi suất của ngân hàng hoặc hợp đồng vay.',
          en: "The bank's interest rate table, or your loan contract.",
        },
        luuY: {
          vi: 'Vay mua nhà thường 8–12%/năm sau kỳ ưu đãi.',
          en: 'Home loans usually run 8 to 12%/year after the promotional period.',
        },
      },
      years: {
        layODau: {
          vi: 'Thời hạn vay ghi trên hợp đồng.',
          en: 'The loan term written in the contract.',
        },
      },
    },
    docKetQua: {
      vi: 'Con số giữ nguyên suốt toàn bộ kỳ vay; so với thu nhập để biết có đủ khả năng chi trả không.',
      en: 'This number stays the same for the entire loan term; compare it with your income to see whether you can afford it.',
    },
    deSai: {
      vi: 'Quên rằng lãi suất thả nổi sau kỳ ưu đãi sẽ làm khoản trả thay đổi.',
      en: 'Forgetting that a floating rate after the promotional period will change the payment.',
    },
  },

  'tra-gop-goc-deu': {
    deLamGi: {
      vi: 'Biết khoản trả kỳ đầu khi gốc chia đều còn lãi giảm dần.',
      en: 'Find out your first payment when the principal is split evenly and the interest shrinks over time.',
    },
    oNhap: {
      amount: {
        layODau: {
          vi: 'Số tiền giải ngân ghi trên hợp đồng vay.',
          en: 'The disbursed amount written in your loan contract.',
        },
      },
      rate: {
        layODau: {
          vi: 'Bảng lãi suất của ngân hàng hoặc hợp đồng vay.',
          en: "The bank's interest rate table, or your loan contract.",
        },
        luuY: {
          vi: 'Vay mua nhà thường 8–12%/năm sau kỳ ưu đãi.',
          en: 'Home loans usually run 8 to 12%/year after the promotional period.',
        },
      },
      years: {
        layODau: {
          vi: 'Thời hạn vay ghi trên hợp đồng.',
          en: 'The loan term written in the contract.',
        },
      },
    },
    docKetQua: {
      vi: 'Kỳ đầu nặng nhất, đây là con số cần cân đối với thu nhập hằng tháng.',
      en: 'The first payment is the heaviest; it is the number to weigh against your monthly income.',
    },
    deSai: {
      vi: 'So khoản trả kỳ đầu của gốc đều với khoản trả cố định của niên kim rồi kết luận gốc đều đắt hơn.',
      en: 'Comparing the first equal-principal payment with the fixed annuity payment and concluding that equal principal costs more.',
    },
  },

  'lich-tra-no': {
    deLamGi: {
      vi: 'Xem toàn bộ lịch trả từng kỳ và tổng lãi phải trả của cả khoản vay.',
      en: 'See the full schedule of every payment and the total interest paid over the whole loan.',
    },
    oNhap: {
      amount: {
        layODau: {
          vi: 'Số tiền giải ngân ghi trên hợp đồng vay.',
          en: 'The disbursed amount written in your loan contract.',
        },
      },
      rate: {
        layODau: {
          vi: 'Bảng lãi suất của ngân hàng hoặc hợp đồng vay.',
          en: "The bank's interest rate table, or your loan contract.",
        },
        luuY: {
          vi: 'Vay mua nhà thường 8–12%/năm sau kỳ ưu đãi.',
          en: 'Home loans usually run 8 to 12%/year after the promotional period.',
        },
      },
      years: {
        layODau: {
          vi: 'Thời hạn vay ghi trên hợp đồng.',
          en: 'The loan term written in the contract.',
        },
      },
      method: {
        layODau: {
          vi: 'Chọn cách trả nợ của hợp đồng vay.',
          en: 'Choose the repayment method in your loan contract.',
        },
        luuY: {
          vi: 'Niên kim: trả cố định mỗi tháng. Gốc đều: gốc chia đều, lãi giảm dần, kỳ đầu nặng nhất.',
          en: 'Annuity: fixed monthly payment. Equal principal: even principal, falling interest, largest at first.',
        },
      },
    },
    docKetQua: {
      vi: 'Với cùng lãi suất và kỳ hạn, gốc đều không bao giờ cho tổng lãi cao hơn niên kim.',
      en: 'At the same rate and term, equal principal never gives more total interest than an annuity.',
    },
    deSai: {
      vi: 'Chọn theo tổng lãi mà bỏ qua dòng tiền; gốc đều rẻ hơn nhưng nặng ở những kỳ đầu.',
      en: 'Choosing by total interest and ignoring cash flow; equal principal is cheaper but heavy in the first periods.',
    },
  },

  /* ── Đầu tư cá nhân — 2 công thức ────────────────────────────────────────────────────────── */

  'gia-von-trung-binh-dca': {
    deLamGi: {
      vi: 'Biết giá vốn thực sau khi mua rải nhiều đợt với giá khác nhau.',
      en: 'Find out your real cost per share after buying in several rounds at different prices.',
    },
    oNhap: {
      // Viết thêm 13/10/2026 cùng nhóm ô lặp; không có trong `guide-111.json` của chủ dự án. Câu hiện
      // nay là chữ chủ dự án đưa ngày 14/10/2026.
      lots: {
        layODau: {
          vi: 'Đếm số đợt bạn đã mua; có thể thêm tiền mua và giá mua của đợt mới.',
          en: 'Count the rounds you have bought; you can add the amount and price of a new round.',
        },
      },
      amount1: {
        layODau: {
          vi: 'Số tiền bạn chi ở đợt mua đầu tiên.',
          en: 'The amount you spent in the first purchase round.',
        },
      },
      price1: {
        layODau: {
          vi: 'Giá khớp của đợt mua đầu tiên.',
          en: 'The matched price of the first purchase round.',
        },
      },
      // Đợt 2 và đợt 3 không còn câu riêng (14/10/2026). Chủ dự án chụp chúng trong khung "?": _"xóa
      // mấy kiểu giải thích tôi đưa như này đi"_. Chúng lặp lại câu của đợt 1, và "để 0 nếu chưa có
      // đợt này" đã cũ từ khi có nút Bỏ đợt. Bài chỉ kể nhóm 1 — xem `isLaterRepeatSlot`.
    },
    docKetQua: {
      vi: 'So giá vốn trung bình với thị giá: thấp hơn là đang lãi, cao hơn là đang lỗ.',
      en: 'Compare the average cost with the market price: below it means you are up, above it means you are down.',
    },
    deSai: {
      vi: 'Lấy trung bình cộng của ba mức giá; mua cùng số tiền ở các mức giá khác nhau cho ra kết quả khác.',
      en: 'Taking the simple average of the three prices; putting the same amount in at different prices gives a different result.',
    },
  },

  'so-ky-dca': {
    deLamGi: {
      vi: 'Biết nếu góp đều mỗi tháng thì bao lâu đạt được số tiền mong muốn.',
      en: 'Find out how long it takes to reach the amount you want if you contribute evenly every month.',
    },
    oNhap: {
      target: {
        layODau: {
          vi: 'Số tiền muốn có vào cuối chặng.',
          en: 'The amount you want to have at the end.',
        },
      },
      contribution: {
        layODau: {
          vi: 'Số tiền bạn chắc chắn góp được đều mỗi tháng.',
          en: 'The amount you are sure you can contribute every month.',
        },
        luuY: {
          vi: 'Đặt mức giữ được lâu dài, không đặt mức chỉ làm được vài tháng.',
          en: 'Set an amount you can keep up for the long run, not one you can only manage for a few months.',
        },
      },
      rate: {
        layODau: {
          vi: 'Mức sinh lợi bạn tin là đạt được trong suốt chặng góp.',
          en: 'The return you believe you can earn throughout the contribution period.',
        },
        luuY: {
          vi: 'Quỹ cổ phiếu dài hạn 8–12% là giả định đã khá lạc quan.',
          en: '8 to 12% for long-term equity funds is already a fairly optimistic assumption.',
        },
      },
    },
    docKetQua: {
      vi: 'Số tháng, đã làm tròn lên kỳ trọn vẹn gần nhất.',
      en: 'The number of months, rounded up to the nearest whole period.',
    },
    deSai: {
      vi: 'Nâng lợi suất kỳ vọng để rút ngắn thời gian; tăng mức góp mới là cách chắc chắn hơn nhiều.',
      en: 'Raising the expected return to shorten the time; raising the contribution is a far more certain way.',
    },
  },

  /* ── Tài chính doanh nghiệp — 2 công thức ────────────────────────────────────────────────── */

  'diem-hoa-von': {
    deLamGi: {
      vi: 'Biết phải bán bao nhiêu sản phẩm mới đủ bù chi phí.',
      en: 'Find out how many units you must sell to cover your costs.',
    },
    oNhap: {
      fixedCost: {
        layODau: {
          vi: 'Chi phí không đổi theo sản lượng: thuê mặt bằng, lương quản lý, khấu hao.',
          en: 'Costs that do not change with output: rent, management salaries, depreciation.',
        },
        luuY: {
          vi: 'Xếp nhầm giữa định phí và biến phí làm kết quả lệch hẳn.',
          en: 'Putting a cost in the wrong group, fixed or variable, throws the result far off.',
        },
      },
      unitPrice: {
        layODau: {
          vi: 'Giá bán chưa thuế của một đơn vị sản phẩm.',
          en: 'The selling price of one unit, before tax.',
        },
      },
      variableCost: {
        layODau: {
          vi: 'Chi phí tăng thêm khi làm thêm một sản phẩm: nguyên vật liệu, nhân công trực tiếp.',
          en: 'The extra cost of making one more unit: raw materials, direct labor.',
        },
        luuY: {
          vi: 'Phải nhỏ hơn giá bán, nếu không thì không bao giờ hoà vốn.',
          en: 'Must be lower than the selling price, otherwise you never break even.',
        },
      },
    },
    docKetQua: {
      vi: 'Điểm hoà vốn càng thấp so với sản lượng thực tế thì biên an toàn càng dày.',
      en: 'The lower the break-even point is compared with actual output, the wider the margin of safety.',
    },
    deSai: {
      vi: 'Xếp nhầm chi phí giữa định phí và biến phí, làm kết quả lệch hẳn.',
      en: 'Putting costs in the wrong group, fixed or variable, which throws the result far off.',
    },
  },

  'don-bay-tong-hop': {
    deLamGi: {
      vi: 'Biết nếu doanh thu thay đổi 1% thì EPS thay đổi khoảng bao nhiêu phần trăm.',
      en: 'Find out roughly how many percent EPS changes when revenue changes by 1%.',
    },
    oNhap: {
      revenue: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng doanh thu thuần.',
          en: 'The income statement, net revenue line.',
        },
      },
      variableCost: {
        layODau: {
          vi: 'Tổng chi phí thay đổi theo sản lượng trong kỳ.',
          en: 'Total costs that change with output during the period.',
        },
      },
      fixedCost: {
        layODau: {
          vi: 'Chi phí cố định của hoạt động kinh doanh trong kỳ.',
          en: 'The fixed costs of running the business during the period.',
        },
      },
      interest: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, chi phí lãi vay của kỳ.',
          en: 'The income statement, interest expense for the period.',
        },
      },
    },
    docKetQua: {
      vi: 'Đòn bẩy 4 lần nghĩa là nếu doanh thu tăng 1% thì EPS tăng khoảng 4%, và nếu giảm 1% thì EPS cũng giảm 4%.',
      en: 'Leverage of 4 times means that if revenue rises 1%, EPS rises about 4%, and if revenue falls 1%, EPS also falls 4%.',
    },
    deSai: {
      vi: 'Chỉ nhìn chiều tăng; đòn bẩy khuếch đại cả hai chiều như nhau.',
      en: 'Looking only at the upside; leverage magnifies both directions equally.',
    },
  },

  /* ── Thuế thu nhập cá nhân — 1 công thức ─────────────────────────────────────────────────── */

  'thue-tncn-dau-tu': {
    deLamGi: {
      vi: 'Biết tổng thuế phải nộp cho một giao dịch, gồm cả phần bán và phần cổ tức.',
      en: 'Find out the total tax owed on one trade, covering both the sale and the dividend.',
    },
    oNhap: {
      quantity: {
        layODau: {
          vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.',
          en: 'The number of shares in the order or in the holding.',
        },
        luuY: {
          vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.',
          en: 'HOSE trades in lots of 100 shares.',
        },
      },
      sellPrice: {
        layODau: {
          vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.',
          en: 'The price your sell order was matched at, or the price you plan to sell at.',
        },
      },
      dividendPerShare: {
        layODau: {
          vi: 'Cổ tức tiền mặt theo nghị quyết chi trả.',
          en: "The cash dividend set in the company's payout resolution.",
        },
      },
    },
    docKetQua: {
      vi: 'So tổng thuế với phần lãi hoặc lỗ thực tế để thấy thuế chiếm bao nhiêu trong khoản tiền nhận về.',
      en: 'Compare the total tax with your actual gain or loss to see how big a share of the money you receive goes to tax.',
    },
    deSai: {
      vi: 'Tưởng rằng nếu lỗ thì không phải nộp; thuế chuyển nhượng tính trên giá trị bán, không trên lãi.',
      en: 'Thinking you owe nothing if you made a loss; the transfer tax is charged on the sale value, not on the profit.',
    },
  },
};
