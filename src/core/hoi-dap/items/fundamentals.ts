import type { CauHoiThuongGap } from '../types';

/**
 * Câu hỏi thường gặp của nhóm `fundamentals` (`src/core/formulas/fundamentals.ts`). Câu THẬT đã được mở lại link và
 * đối chiếu nguyên văn ở lượt phản biện; câu `tuSoan` do đội sản phẩm soạn từ chính công thức và đã
 * được đối chiếu với `calc` — xem docblock `../types.ts`. Câu không có `traLoi` bị ẩn khỏi màn.
 */
export const HOI_DAP_FUNDAMENTALS: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  'ty-le-chi-tra-co-tuc': [
    {
      hoi: {
        vi: 'Làm sao đọc được tỷ lệ chi trả cổ tức lên tới 1.372%?',
        en: 'How to interpret a 1,372.55% dividend payout ratio?',
      },
      nguyenVan: 'How to interpret a 1,372.55% dividend payout ratio (GSK)?',
      nguon: {
        url: 'https://money.stackexchange.com/questions/76362/how-to-interpret-a-1-372-55-dividend-payout-ratio-gsk',
        ten: 'Money StackExchange',
        noi: 'hoi-dap',
        vietnam: false,
      },
      traLoi: {
        vi: 'Câu trả lời được chấp nhận nói tỷ lệ này phụ thuộc kỳ đo. Nếu một kỳ lợi nhuận rất thấp mà công ty vẫn giữ cổ tức thì tỷ lệ vọt lên rất cao. Cần xem chi tiết kỳ đó thay vì đọc con số một mình.',
        en: 'The accepted answer says the ratio depends on the period measured. If earnings were very low in a period but the dividend was kept, the ratio jumps very high. Look at the details of that period instead of reading the number alone.',
      },
      nguonTraLoi: [
        {
          url: 'https://money.stackexchange.com/questions/76362/how-to-interpret-a-1-372-55-dividend-payout-ratio-gsk',
          ten: 'Money StackExchange',
        },
      ],
    },
  ],
  'eps-co-ban': [
    {
      hoi: {
        vi: 'EPS âm có nghĩa là gì?',
        en: 'What does a negative EPS mean?',
      },
      nguyenVan: 'EPS âm có nghĩa là gì?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/eps-la-gi/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói EPS âm nghĩa là doanh nghiệp thua lỗ trong kỳ đó, và khi lỗ thì EPS cùng P/E không còn ý nghĩa để so sánh. Công thức ở đây vẫn in số âm khi lãi ròng nhỏ hơn 0.',
        en: 'The source says a negative EPS means the company posted a loss in that period, and with a loss EPS and P/E are not meaningful for comparison. The formula here still prints a negative number when net income is below zero.',
      },
      nguonTraLoi: [
        {
          url: 'https://thuvienchungkhoan.vn/eps-la-gi/',
          ten: 'Thư viện chứng khoán',
        },
      ],
    },
    {
      hoi: {
        vi: 'Vì sao EPS của cùng một doanh nghiệp trên các nền tảng khác nhau lại không giống nhau?',
        en: 'Why does the EPS of the same company differ across platforms?',
      },
      nguyenVan:
        'EPS của cùng một doanh nghiệp trên các nền tảng khác nhau đôi khi không giống nhau - tại sao?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/eps-la-gi/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nêu ba lý do: nền tảng này dùng EPS cơ bản còn nền tảng kia dùng EPS pha loãng, khác kỳ lấy số (4 quý gần nhất, năm tài chính hay năm dương lịch), và khác lợi nhuận công ty mẹ với hợp nhất.',
        en: 'The source gives three reasons: one platform uses basic EPS and another diluted EPS, different periods (trailing four quarters, fiscal year or calendar year), and parent-company versus consolidated profit.',
      },
      nguonTraLoi: [
        {
          url: 'https://thuvienchungkhoan.vn/eps-la-gi/',
          ten: 'Thư viện chứng khoán',
        },
      ],
    },
    {
      hoi: {
        vi: 'EPS tăng mạnh có nhất thiết là tin tốt không?',
        en: 'Is a sharp rise in EPS necessarily good news?',
      },
      nguyenVan: 'EPS tăng mạnh có nhất thiết là tin tốt không?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/eps-la-gi/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn trả lời không nhất thiết: cần xem EPS tăng nhờ doanh thu thật, cắt giảm chi phí, thu nhập bất thường hay mua lại cổ phiếu làm giảm số cổ phiếu.',
        en: 'The source says not necessarily: check whether the rise came from real revenue growth, cost cuts, one-off income, or buybacks that shrink the share count.',
      },
      nguonTraLoi: [
        {
          url: 'https://thuvienchungkhoan.vn/eps-la-gi/',
          ten: 'Thư viện chứng khoán',
        },
      ],
    },
    {
      hoi: {
        vi: 'Nên so sánh EPS theo quý liền kề hay so với cùng quý năm trước?',
        en: 'Should EPS be compared with the previous quarter or with the same quarter last year?',
      },
      nguyenVan: 'Nên so sánh EPS theo quý liền kề hay so với cùng quý năm trước?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/eps-la-gi/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Theo nguồn, so với cùng quý năm trước thường có ý nghĩa hơn vì loại được yếu tố mùa vụ.',
        en: 'The source says comparing with the same quarter last year is usually more meaningful because it removes seasonality.',
      },
      nguonTraLoi: [
        {
          url: 'https://thuvienchungkhoan.vn/eps-la-gi/',
          ten: 'Thư viện chứng khoán',
        },
      ],
    },
    {
      hoi: {
        vi: 'EPS và cổ tức có liên quan với nhau không?',
        en: 'Are EPS and dividends related?',
      },
      nguyenVan: 'EPS và cổ tức có liên quan không?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/eps-la-gi/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'Nên so sánh EPS giữa những doanh nghiệp nào?',
        en: 'Which companies should EPS be compared between?',
      },
      nguyenVan: 'Nên so sánh EPS giữa những doanh nghiệp nào?',
      nguon: {
        url: 'https://www.finhay.com.vn/eps',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói nên so sánh các doanh nghiệp cùng lĩnh vực và đối chiếu với mức trung bình ngành.',
        en: 'The source says to compare companies in the same field and check against the industry average.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/eps',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Khi dùng EPS, cần theo dõi thêm những thông tin nào?',
        en: 'What other information should be followed when using EPS?',
      },
      nguyenVan: 'Khi sử dụng EPS, cần theo dõi thêm những thông tin nào?',
      nguon: {
        url: 'https://www.finhay.com.vn/eps',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói ngoài EPS cần xem tình hình kinh doanh, kế hoạch phát hành cổ phiếu mới, báo cáo tài chính và bảng cân đối kế toán.',
        en: 'The source says that besides EPS, look at business performance, plans to issue new shares, the financial statements and the balance sheet.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/eps',
          ten: 'Finhay',
        },
      ],
    },
  ],
  bvps: [
    {
      hoi: {
        vi: 'BVPS và giá trị sổ sách có khác nhau không?',
        en: 'Are BVPS and book value different?',
      },
      nguyenVan: 'BVPS và giá trị sổ sách (book value – BV) có khác nhau không?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/bvps-la-gi/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói giá trị sổ sách thường chỉ tổng vốn chủ sở hữu, còn BVPS là giá trị đó tính trên mỗi cổ phiếu đang lưu hành; trong thực tế hai thuật ngữ hay dùng lẫn nhau.',
        en: 'The source says book value usually means total equity while BVPS is that value per outstanding share; in practice the two terms are often used interchangeably.',
      },
      nguonTraLoi: [
        {
          url: 'https://thuvienchungkhoan.vn/bvps-la-gi/',
          ten: 'Thư viện chứng khoán',
        },
      ],
    },
    {
      hoi: {
        vi: 'Thị giá dưới BVPS có nghĩa là gì?',
        en: 'What does a market price below BVPS mean?',
      },
      nguyenVan: 'Thị giá dưới BVPS có nghĩa là gì?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/bvps-la-gi/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói thị trường đang định giá doanh nghiệp thấp hơn giá trị tài sản ròng trên sổ sách; có thể do tài sản tốt mà bị định giá thấp, hoặc do vấn đề ẩn như nợ xấu cao.',
        en: 'The source says the market values the company below its net book assets; either the assets are good and undervalued, or there are hidden problems such as high bad debts.',
      },
      nguonTraLoi: [
        {
          url: 'https://thuvienchungkhoan.vn/bvps-la-gi/',
          ten: 'Thư viện chứng khoán',
        },
      ],
    },
    {
      hoi: {
        vi: 'BVPS tăng có nghĩa là tốt không?',
        en: 'Does a rising BVPS mean something good?',
      },
      nguyenVan: 'BVPS tăng có nghĩa là tốt không?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/bvps-la-gi/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói thông thường có, vì lợi nhuận giữ lại tích luỹ trên mỗi cổ phiếu; nhưng BVPS cũng tăng khi phát hành thêm cổ phiếu giá cao, điều này không cho thấy hoạt động tốt hơn.',
        en: 'The source says usually yes, as retained earnings build up per share; but BVPS can also rise from issuing new shares at a high price, which does not show better operations.',
      },
      nguonTraLoi: [
        {
          url: 'https://thuvienchungkhoan.vn/bvps-la-gi/',
          ten: 'Thư viện chứng khoán',
        },
      ],
    },
    {
      hoi: {
        vi: 'Có thể so sánh BVPS của hai doanh nghiệp khác ngành không?',
        en: 'Can the BVPS of two companies in different industries be compared?',
      },
      nguyenVan: 'Có thể so sánh BVPS của hai doanh nghiệp khác ngành không?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/bvps-la-gi/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói không nên, vì mỗi ngành có cơ cấu tài sản và đặc điểm kế toán khác nhau; BVPS có nghĩa trong cùng ngành hoặc so với lịch sử chính doanh nghiệp.',
        en: "The source says it should not be done, since each industry has a different asset structure and accounting; BVPS is meaningful within one industry or against the company's own history.",
      },
      nguonTraLoi: [
        {
          url: 'https://thuvienchungkhoan.vn/bvps-la-gi/',
          ten: 'Thư viện chứng khoán',
        },
      ],
    },
    {
      hoi: {
        vi: 'Cách nhanh nhất để tra BVPS của một mã cổ phiếu là gì?',
        en: 'What is the fastest way to look up the BVPS of a ticker?',
      },
      nguyenVan: 'Cách nhanh nhất để tra BVPS của một mã cổ phiếu?',
      nguon: {
        url: 'https://thuvienchungkhoan.vn/bvps-la-gi/',
        ten: 'Thư viện chứng khoán FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn hướng dẫn nhập mã trên CafeF, FireAnt hoặc VNDirect rồi tìm mục Chỉ số tài chính hoặc Định giá; cần số chính xác thì tự tính từ báo cáo tài chính gốc.',
        en: 'The source says to enter the ticker on CafeF, FireAnt or VNDirect and find the financial ratios or valuation section; for precise figures, compute it from the original financial statements.',
      },
      nguonTraLoi: [
        {
          url: 'https://thuvienchungkhoan.vn/bvps-la-gi/',
          ten: 'Thư viện chứng khoán',
        },
      ],
    },
  ],
  roe: [
    {
      hoi: {
        vi: 'Hai doanh nghiệp có ROE bằng nhau có thể tăng trưởng khác nhau không?',
        en: 'Can two companies with the same ROE grow at different rates?',
      },
      nguyenVan: 'Hai doanh nghiệp có ROE bằng nhau có thể tăng trưởng khác nhau không?',
      nguon: {
        url: 'https://www.finhay.com.vn/roe-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'ROE tăng cao có luôn cho thấy doanh nghiệp hoạt động tốt hơn không?',
        en: 'Does a sharp rise in ROE always show the company is doing better?',
      },
      nguyenVan: 'ROE tăng cao có luôn cho thấy doanh nghiệp hoạt động tốt hơn không?',
      nguon: {
        url: 'https://www.finhay.com.vn/roe-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói không: ROE có thể tăng bất thường khi vốn chủ sở hữu ở mẫu số quá nhỏ, chẳng hạn sau nhiều năm thua lỗ, nên cần tìm nguyên nhân thay vì chỉ nhìn con số.',
        en: 'The source says no: ROE can jump when equity in the denominator is very small, for example after years of losses, so look into the cause instead of the number alone.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/roe-la-gi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Vì sao các nhà đầu tư có thể tính ra ROE khác nhau cho cùng một doanh nghiệp?',
        en: 'Why can investors calculate different ROE for the same company?',
      },
      nguyenVan: 'Vì sao các nhà đầu tư có thể tính ra ROE khác nhau cho cùng doanh nghiệp?',
      nguon: {
        url: 'https://www.finhay.com.vn/roe-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói họ có thể chọn vốn chủ sở hữu khác nhau: bình quân hai kỳ, đầu kỳ hoặc cuối kỳ. Ở sản phẩm này ROE dùng vốn chủ sở hữu cuối kỳ, nên khi so với số của nơi khác cần xem họ dùng cách nào.',
        en: 'The source says investors may pick different equity figures: the two-period average, opening or closing balance. This product uses closing equity, so when comparing with other figures check which basis they use.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/roe-la-gi',
          ten: 'Finhay',
        },
      ],
    },
  ],
  roa: [
    {
      hoi: {
        vi: 'Vì sao không nên so sánh ROA giữa hai doanh nghiệp khác ngành?',
        en: 'Why should ROA not be compared between two companies in different industries?',
      },
      nguyenVan: 'Vì sao không nên so sánh ROA giữa hai doanh nghiệp khác ngành?',
      nguon: {
        url: 'https://www.finhay.com.vn/roa-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói các ngành có cơ cấu tài sản khác nhau nên cùng một ROA không nhất thiết mang cùng ý nghĩa; nên so sánh trong cùng ngành.',
        en: 'The source says industries have different asset structures, so the same ROA does not necessarily mean the same thing; compare within one industry.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/roa-la-gi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'ROA cao hơn trung bình ngành nhưng giảm dần có đáng lưu ý không?',
        en: 'Is an ROA above the industry average but declining over time worth noting?',
      },
      nguyenVan: 'ROA cao hơn trung bình ngành nhưng giảm dần có đáng lưu ý không?',
      nguon: {
        url: 'https://www.finhay.com.vn/roa-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn trả lời có: doanh nghiệp vẫn có thể hơn mức trung bình ngành trong khi hiệu quả dùng tài sản giảm so với chính mình trước đây, nên xu hướng nhiều năm quan trọng hơn một điểm số.',
        en: 'The source says yes: a company can beat the industry average while its asset efficiency declines against its own past, so the multi-year trend matters more than one data point.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/roa-la-gi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Chỉ số ROA có thể bị ảnh hưởng bởi cách ghi nhận lợi nhuận không?',
        en: 'Can ROA be affected by how profit is recognized?',
      },
      nguyenVan: 'Chỉ số ROA có thể bị ảnh hưởng bởi cách ghi nhận lợi nhuận không?',
      nguon: {
        url: 'https://www.finhay.com.vn/roa-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói có: lựa chọn kế toán có thể làm lợi nhuận báo cáo cao hoặc thấp hơn và làm lệch ROA, nên dùng cùng các chỉ số khác.',
        en: 'The source says yes: accounting choices can raise or lower reported profit and distort ROA, so use it with other indicators.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/roa-la-gi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Chỉ số ROA thể hiện điều gì?',
        en: 'What does ROA show?',
      },
      nguyenVan: 'Chỉ số ROA thể hiện điều gì?',
      nguon: {
        url: 'https://taca.com.vn/chi-so-roa/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'Có thể tính chỉ số ROA của một công ty như thế nào?',
        en: 'How can the ROA of a company be calculated?',
      },
      nguyenVan: 'Có thể tính toán chỉ số ROA của một công ty như thế nào?',
      nguon: {
        url: 'https://taca.com.vn/chi-so-roa/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
    },
  ],
  'bien-loi-nhuan-rong': [
    {
      hoi: {
        vi: 'Biên lợi nhuận ròng tăng mạnh có luôn là tín hiệu tích cực không?',
        en: 'Is a sharp rise in net profit margin always a positive signal?',
      },
      nguyenVan: 'Biên lợi nhuận ròng tăng mạnh có luôn là tín hiệu tích cực không?',
      nguon: {
        url: 'https://www.finhay.com.vn/en/bien-loi-nhuan-rong-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói chưa đủ để kết luận: cần xem khoản lãi đến từ kinh doanh cốt lõi hay giao dịch một lần như bán đất, thanh lý công ty con, và đối chiếu với dòng tiền.',
        en: 'The source says it is not enough to conclude: check whether the gain came from core business or a one-off such as a land sale or subsidiary disposal, and compare with cash flow.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/en/bien-loi-nhuan-rong-la-gi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Doanh nghiệp có biên lợi nhuận ròng thấp có luôn hoạt động kém không?',
        en: 'Does a company with a low net profit margin always perform badly?',
      },
      nguyenVan: 'Doanh nghiệp có biên lợi nhuận ròng thấp có luôn hoạt động kém không?',
      nguon: {
        url: 'https://www.finhay.com.vn/en/bien-loi-nhuan-rong-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói không thể kết luận chỉ từ mức biên tuyệt đối vì mỗi ngành có cấu trúc chi phí và vòng quay vốn khác nhau; nên so với cùng ngành, đối thủ trực tiếp và lịch sử của công ty.',
        en: "The source says no conclusion from the absolute margin alone, as industries differ in cost structure and capital turnover; compare with peers, direct competitors and the company's own history.",
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/en/bien-loi-nhuan-rong-la-gi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Vì sao cần xem chính sách khấu hao khi so sánh biên lợi nhuận ròng?',
        en: 'Why look at depreciation policy when comparing net profit margins?',
      },
      nguyenVan: 'Vì sao cần xem chính sách khấu hao khi so sánh biên lợi nhuận ròng?',
      nguon: {
        url: 'https://www.finhay.com.vn/en/bien-loi-nhuan-rong-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói cách khấu hao làm đổi chi phí ghi nhận trong kỳ và lợi nhuận sau thuế, nên hai công ty bán sản phẩm giống nhau vẫn có thể báo cáo biên khác nhau.',
        en: 'The source says the depreciation method changes the expense recognized in the period and after-tax profit, so two companies selling similar products can report different margins.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/en/bien-loi-nhuan-rong-la-gi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Dữ liệu tính ROS lấy ở báo cáo nào?',
        en: 'Which report is the data for ROS taken from?',
      },
      nguyenVan: 'Dữ liệu tính ROS được lấy ở báo cáo nào?',
      nguon: {
        url: 'https://www.finhay.com.vn/chi-so-ros',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói dùng lợi nhuận sau thuế và doanh thu thuần từ báo cáo kết quả hoạt động kinh doanh.',
        en: 'The source says it uses profit after tax and net revenue from the income statement.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/chi-so-ros',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Có nên đánh giá ROS chỉ qua một kỳ kinh doanh không?',
        en: 'Should ROS be judged from a single period only?',
      },
      nguyenVan: 'Có nên đánh giá ROS chỉ qua một kỳ kinh doanh không?',
      nguon: {
        url: 'https://www.finhay.com.vn/chi-so-ros',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn khuyên xem diễn biến qua nhiều năm, phân biệt doanh nghiệp theo chu kỳ và khoản thu nhập tăng đột biến.',
        en: 'The source advises looking at the trend over several years and separating cyclical businesses and one-off income spikes.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/chi-so-ros',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'ROS âm có luôn cho thấy chiến lược của doanh nghiệp thất bại không?',
        en: "Does a negative ROS always mean the company's strategy has failed?",
      },
      nguyenVan: 'ROS âm có luôn cho thấy chiến lược của doanh nghiệp thất bại không?',
      nguon: {
        url: 'https://www.finhay.com.vn/chi-so-ros',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói cần xem chiến lược công ty đang theo đuổi; ROS âm có thể chấp nhận được nếu công ty cố ý giành thị phần.',
        en: 'The source says look at the strategy being pursued; a negative ROS can be acceptable if the company is deliberately gaining market share.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/chi-so-ros',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Biên lợi nhuận ròng bao nhiêu là hợp lý?',
        en: 'What net profit margin is reasonable?',
      },
      nguyenVan: '2. Biên lợi nhuận ròng bao nhiêu là hợp lý?',
      nguon: {
        url: 'https://taca.com.vn/loi-nhuan-rong/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
    },
  ],
  'bien-loi-nhuan-gop': [
    {
      hoi: {
        vi: 'Biên lợi nhuận gộp cao có đồng nghĩa doanh nghiệp có lãi ròng không?',
        en: 'Does a high gross margin mean the company has a net profit?',
      },
      nguyenVan: 'Biên lợi nhuận gộp cao có đồng nghĩa doanh nghiệp có lãi ròng không?',
      nguon: {
        url: 'https://www.finhay.com.vn/bien-loi-nhuan-gop-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói không: lợi nhuận gộp còn phải bù chi phí bán hàng, quản lý, lãi vay và thuế, nên có thể lỗ ròng dù biên gộp cao.',
        en: 'The source says no: gross profit must still cover selling, administrative, interest and tax costs, so a net loss is possible despite a high gross margin.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/bien-loi-nhuan-gop-la-gi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Vì sao không nên dùng một quý cao điểm để đánh giá biên lợi nhuận gộp cả năm?',
        en: 'Why should a peak quarter not be used to judge the gross margin of a whole year?',
      },
      nguyenVan: 'Vì sao không nên dùng một quý cao điểm để đánh giá biên lợi nhuận gộp cả năm?',
      nguon: {
        url: 'https://www.finhay.com.vn/bien-loi-nhuan-gop-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói ở ngành mùa vụ, doanh thu và công suất dồn vào vài quý có thể đẩy biên gộp cao hơn mức thường; dùng số bốn quý gần nhất để tránh coi quý cao điểm là đại diện.',
        en: 'The source says in seasonal industries sales and capacity cluster in a few quarters and can inflate gross margin; use the trailing four quarters instead of treating a peak quarter as representative.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/bien-loi-nhuan-gop-la-gi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Cần đọc phần nào để biết chính sách hàng tồn kho ảnh hưởng đến biên lợi nhuận gộp?',
        en: 'Which part should be read to see how inventory policy affects gross margin?',
      },
      nguyenVan:
        'Cần đọc phần nào để biết chính sách hàng tồn kho ảnh hưởng đến biên lợi nhuận gộp?',
      nguon: {
        url: 'https://www.finhay.com.vn/bien-loi-nhuan-gop-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói nên đọc thuyết minh báo cáo tài chính để biết phương pháp hạch toán hàng tồn kho, vì giá vốn có thể khác nhau khi giá đầu vào đổi.',
        en: 'The source says read the notes to the financial statements for the inventory accounting method, since cost of goods sold can differ when input prices change.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/bien-loi-nhuan-gop-la-gi',
          ten: 'Finhay',
        },
      ],
    },
  ],
  'no-tren-von-chu': [
    {
      hoi: {
        vi: 'Có thể áp dụng cùng một mức D/E để đánh giá mọi ngành không?',
        en: 'Can the same D/E level be used to assess every industry?',
      },
      nguyenVan: 'Có thể áp dụng cùng một mức D/E để đánh giá mọi ngành không?',
      nguon: {
        url: 'https://www.finhay.com.vn/d-e-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói không nên áp máy móc một mức chung, vì nhu cầu vốn và tốc độ tăng trưởng của mỗi ngành khác nhau.',
        en: 'The source says not to apply one level mechanically, because capital needs and growth rates differ by industry.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/d-e-la-gi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Hai công ty có cùng D/E có nhất thiết chịu rủi ro giống nhau không?',
        en: 'Do two companies with the same D/E necessarily carry the same risk?',
      },
      nguyenVan: 'Hai công ty có cùng D/E có nhất thiết chịu rủi ro giống nhau không?',
      nguon: {
        url: 'https://www.finhay.com.vn/d-e-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói không nhất thiết: kỳ hạn nợ khác nhau nên rủi ro khác nhau, cần xem thêm nợ ngắn hạn và dài hạn.',
        en: 'The source says not necessarily: debt maturities differ, so risk differs; also look at short-term and long-term obligations.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/d-e-la-gi',
          ten: 'Finhay',
        },
      ],
    },
    {
      hoi: {
        vi: 'Vì sao cách phân loại cổ phiếu ưu đãi có thể làm D/E thay đổi?',
        en: 'Why can the classification of preferred shares change D/E?',
      },
      nguyenVan: 'Vì sao cách phân loại cổ phiếu ưu đãi có thể làm D/E thay đổi?',
      nguon: {
        url: 'https://www.finhay.com.vn/d-e-la-gi',
        ten: 'Finhay FAQs',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói xếp cổ phiếu ưu đãi vào nợ thì D/E tăng, xếp vào vốn chủ sở hữu thì giảm, nên cần xem cơ sở tính. Ở sản phẩm này D là tổng nợ phải trả và E là vốn chủ sở hữu đúng như trên bảng cân đối.',
        en: 'The source says counting preferred shares as debt raises D/E and counting them as equity lowers it, so check the basis. In this product D is total liabilities and E is equity exactly as on the balance sheet.',
      },
      nguonTraLoi: [
        {
          url: 'https://www.finhay.com.vn/d-e-la-gi',
          ten: 'Finhay',
        },
      ],
    },
  ],
  'thanh-toan-hien-hanh': [
    {
      hoi: {
        vi: 'Tỷ lệ thanh toán hiện hành tốt là bao nhiêu?',
        en: 'What is a good current ratio?',
      },
      nguyenVan: 'Tỷ lệ thanh toán hiện hành (Current Ratio) tốt là bao nhiêu?',
      nguon: {
        url: 'https://taca.com.vn/ty-le-thanh-toan-hien-hanh/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'Công thức tỷ lệ thanh toán hiện hành là gì?',
        en: 'What is the formula for the current ratio?',
      },
      nguyenVan: 'Công thức tỷ lệ thanh toán hiện hành là gì?',
      nguon: {
        url: 'https://taca.com.vn/ty-le-thanh-toan-hien-hanh/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói tỷ lệ tính bằng tài sản ngắn hạn chia cho nợ ngắn hạn.',
        en: 'The source says it is current assets divided by current liabilities.',
      },
      nguonTraLoi: [
        {
          url: 'https://taca.com.vn/ty-le-thanh-toan-hien-hanh/',
          ten: 'TACA',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tỷ lệ thanh toán hiện hành có nghĩa là gì?',
        en: 'What does the current ratio mean?',
      },
      nguyenVan: 'Tỷ lệ thanh toán hiện hành (Current Ratio) có nghĩa là gì?',
      nguon: {
        url: 'https://taca.com.vn/ty-le-thanh-toan-hien-hanh/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói chỉ số mô tả quan hệ giữa tài sản và nợ phải trả của công ty; càng cao thì tài sản càng nhiều hơn nợ, chẳng hạn mức 4 nghĩa là có thể trang trải nợ ngắn hạn bốn lần.',
        en: "The source says it describes the relationship between a company's assets and liabilities; the higher it is the more assets exceed debts, for example 4 means current liabilities could be covered four times over.",
      },
      nguonTraLoi: [
        {
          url: 'https://taca.com.vn/ty-le-thanh-toan-hien-hanh/',
          ten: 'TACA',
        },
      ],
    },
  ],
  'thanh-toan-nhanh': [
    {
      hoi: {
        vi: 'Tại sao gọi là tỷ số thanh toán nhanh?',
        en: 'Why is it called the quick ratio?',
      },
      nguyenVan: 'Tại sao gọi là tỷ số thanh toán nhanh (Quick Ratio)?',
      nguon: {
        url: 'https://taca.com.vn/ty-so-thanh-toan-nhanh/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói tên gọi này vì chỉ tính các tài sản thanh khoản cao nhất, có thể đổi nhanh ra tiền để trả nợ ngắn hạn.',
        en: 'The source says the name reflects that it counts only the most liquid assets, which can be turned into cash quickly to pay short-term debts.',
      },
      nguonTraLoi: [
        {
          url: 'https://taca.com.vn/ty-so-thanh-toan-nhanh/',
          ten: 'TACA',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tỷ số thanh toán nhanh cao có phải là tốt không?',
        en: 'Is a high quick ratio good?',
      },
      nguyenVan: 'Tỷ số thanh toán nhanh (Quick Ratio) cao có phải là tốt không?',
      nguon: {
        url: 'https://taca.com.vn/ty-so-thanh-toan-nhanh/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói về nguyên tắc cao thường được xem là tốt vì đủ tài sản thanh khoản, nhưng giữ quá nhiều tiền không đầu tư có thể lãng phí nguồn lực.',
        en: 'The source says in principle high is usually seen as good as liquid assets suffice, but holding excessive idle cash can waste resources.',
      },
      nguonTraLoi: [
        {
          url: 'https://taca.com.vn/ty-so-thanh-toan-nhanh/',
          ten: 'TACA',
        },
      ],
    },
    {
      hoi: {
        vi: 'Tỷ số thanh toán nhanh và hiện hành khác nhau như thế nào?',
        en: 'How do the quick ratio and the current ratio differ?',
      },
      nguyenVan: 'Quick Ratio và Current Ratio khác nhau như thế nào?',
      nguon: {
        url: 'https://taca.com.vn/ty-so-thanh-toan-nhanh/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói hệ số nhanh loại hàng tồn kho nên thận trọng hơn, còn hệ số hiện hành tính cả tồn kho và chi phí trả trước nên dễ đánh giá cao khả năng trả nợ nếu tồn kho khó bán. Ở đây hệ số nhanh bằng (tài sản ngắn hạn trừ tồn kho) chia nợ ngắn hạn.',
        en: 'The source says the quick ratio excludes inventory so it is more conservative, while the current ratio includes inventory and prepaid expenses and can overstate ability to pay if inventory is hard to sell. Here the quick ratio is (current assets minus inventory) divided by current liabilities.',
      },
      nguonTraLoi: [
        {
          url: 'https://taca.com.vn/ty-so-thanh-toan-nhanh/',
          ten: 'TACA',
        },
      ],
    },
    {
      hoi: {
        vi: 'Điều gì xảy ra nếu tỷ số thanh toán nhanh cho thấy doanh nghiệp không đủ thanh khoản?',
        en: 'What happens if the quick ratio shows the company lacks liquidity?',
      },
      nguyenVan: 'Điều gì xảy ra nếu quick ratio cho thấy doanh nghiệp không đủ thanh khoản?',
      nguon: {
        url: 'https://taca.com.vn/ty-so-thanh-toan-nhanh/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'Cách tính tỷ số thanh toán nhanh là gì?',
        en: 'How is the quick ratio calculated?',
      },
      nguyenVan: 'Cách tính tỷ số thanh toán nhanh (Quick Ratio)?',
      nguon: {
        url: 'https://taca.com.vn/ty-so-thanh-toan-nhanh/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn đưa hai cách: lấy tài sản ngắn hạn trừ hàng tồn kho rồi chia cho nợ ngắn hạn, hoặc cộng tiền, chứng khoán ngắn hạn và phải thu rồi chia cho nợ ngắn hạn. Sản phẩm này dùng cách thứ nhất.',
        en: 'The source gives two ways: current assets minus inventory divided by current liabilities, or cash plus short-term securities plus receivables divided by current liabilities. This product uses the first way.',
      },
    },
  ],
  'vong-quay-tong-tai-san': [
    {
      hoi: {
        vi: 'Giá trị vòng quay tài sản tốt là bao nhiêu?',
        en: 'What is a good asset turnover value?',
      },
      nguyenVan: 'Giá trị vòng quay tài sản tốt là bao nhiêu?',
      nguon: {
        url: 'https://taca.com.vn/chi-so-vong-quay-tong-tai-san/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói không có mức tốt chung; vòng quay thay đổi theo ngành nên chỉ so sánh trong cùng ngành.',
        en: 'The source says there is no universal good value; turnover varies by industry so compare only within the same industry.',
      },
      nguonTraLoi: [
        {
          url: 'https://taca.com.vn/chi-so-vong-quay-tong-tai-san/',
          ten: 'TACA',
        },
      ],
    },
    {
      hoi: {
        vi: 'Một số hạn chế của chỉ số vòng quay tài sản là gì?',
        en: 'What are some limitations of the asset turnover ratio?',
      },
      nguyenVan: 'Một số hạn chế của Chỉ số vòng quay tài sản là gì?',
      nguon: {
        url: 'https://taca.com.vn/chi-so-vong-quay-tong-tai-san/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
      traLoi: {
        vi: 'Nguồn nói chỉ số một mình không đủ chi tiết để phân tích cổ phiếu và có thể biến động mạnh giữa các năm, nên cần xem xu hướng theo thời gian.',
        en: 'The source says the ratio alone does not give enough detail to analyze a stock and can vary widely year to year, so look at the trend over time.',
      },
      nguonTraLoi: [
        {
          url: 'https://taca.com.vn/chi-so-vong-quay-tong-tai-san/',
          ten: 'TACA',
        },
      ],
    },
    {
      hoi: {
        vi: 'Chỉ số vòng quay tổng tài sản là gì?',
        en: 'What is the total asset turnover ratio?',
      },
      nguyenVan: 'Chỉ số vòng quay tổng tài sản là gì?',
      nguon: {
        url: 'https://taca.com.vn/chi-so-vong-quay-tong-tai-san/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
    },
    {
      hoi: {
        vi: 'Làm thế nào để một công ty cải thiện tỷ lệ vòng quay tài sản?',
        en: 'How can a company improve its asset turnover?',
      },
      nguyenVan: 'Làm thế nào để một công ty có thể cải thiện tỷ lệ vòng quay tài sản?',
      nguon: {
        url: 'https://taca.com.vn/chi-so-vong-quay-tong-tai-san/',
        ten: 'TACA FAQ',
        noi: 'faq',
        vietnam: true,
      },
    },
  ],
};
