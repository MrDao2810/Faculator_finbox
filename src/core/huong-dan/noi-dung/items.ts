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
 * `en` chưa có câu nào — tài liệu chỉ có tiếng Việt. `pick()` rơi về tiếng Việt im lặng, cùng nếp
 * ngân hàng câu hỏi.
 */
export const BAI_RIENG: Readonly<Record<string, BaiRieng>> = {
  /* ── Cơ bản doanh nghiệp — 13 công thức ──────────────────────────────────────────────────── */

  pe: {
    deLamGi: {
      vi: 'Biết thị trường đang trả bao nhiêu đồng cho mỗi đồng lãi một năm của doanh nghiệp.',
    },
    oNhap: {
      price: {
        layODau: { vi: 'Giá đóng cửa gần nhất trên bảng giá, hoặc nhập theo mã.' },
      },
      eps: {
        layODau: { vi: 'Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu.' },
        luuY: {
          vi: 'Cộng bốn quý gần nhất. Lấy một quý rồi đọc như cả năm là lỗi thường gặp nhất.',
        },
      },
    },
    docKetQua: {
      vi: 'Cao là thị trường kỳ vọng tăng trưởng, hoặc đang đắt; thấp là rẻ, hoặc đang có rủi ro. So trong cùng ngành mới có nghĩa.',
    },
    deSai: {
      vi: 'Lấy EPS của một quý rồi đọc như EPS cả năm, làm P/E phồng lên bốn lần.',
    },
  },

  pb: {
    deLamGi: {
      vi: 'Biết thị trường trả bao nhiêu cho mỗi đồng vốn ghi trên sổ sách.',
    },
    oNhap: {
      price: {
        layODau: { vi: 'Giá đóng cửa gần nhất trên bảng giá, hoặc nhập theo mã.' },
      },
      bookValuePerShare: {
        layODau: { vi: 'Nhận từ công thức BVPS, hoặc lấy vốn chủ chia số cổ phiếu lưu hành.' },
      },
    },
    docKetQua: {
      vi: 'Dưới 1 là thị giá thấp hơn sổ sách, có thể rẻ, cũng có thể do thị trường nghi ngờ chất lượng tài sản.',
    },
    deSai: {
      vi: 'Dùng cho ngân hàng và công ty công nghệ như nhau; tài sản hai ngành này khác hẳn bản chất.',
    },
  },

  'eps-co-ban': {
    deLamGi: {
      vi: 'Biết mỗi cổ phiếu gánh được bao nhiêu đồng lãi trong kỳ.',
    },
    oNhap: {
      netIncome: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng cuối cùng, phần thuộc cổ đông công ty mẹ.',
        },
        luuY: { vi: 'Cộng bốn quý nếu muốn tính cả năm.' },
      },
      preferredDividend: {
        layODau: { vi: 'Thuyết minh báo cáo tài chính, phần cổ phiếu ưu đãi.' },
        luuY: { vi: 'Phần lớn doanh nghiệp Việt Nam để 0.' },
      },
      sharesOutstanding: {
        layODau: { vi: 'Báo cáo quản trị hoặc bản cáo bạch, mục cổ phiếu đang lưu hành.' },
        luuY: { vi: 'Dùng số đang lưu hành, không dùng số đăng ký.' },
      },
    },
    docKetQua: {
      vi: 'Tăng đều qua các năm là dấu hiệu tốt; âm nghĩa là đang lỗ trên mỗi cổ phiếu.',
    },
    deSai: {
      vi: 'Dùng số cổ phiếu đăng ký thay vì số đang lưu hành, khiến EPS thấp hơn thực tế.',
    },
  },

  bvps: {
    deLamGi: {
      vi: 'Biết nếu bán hết tài sản và trả hết nợ theo đúng giá sổ sách thì mỗi cổ phiếu còn lại bao nhiêu.',
    },
    oNhap: {
      equity: {
        layODau: { vi: 'Bảng cân đối kế toán, dòng tổng vốn chủ sở hữu.' },
      },
      sharesOutstanding: {
        layODau: { vi: 'Báo cáo quản trị hoặc bản cáo bạch, mục cổ phiếu đang lưu hành.' },
        luuY: { vi: 'Dùng số đang lưu hành, không dùng số đăng ký.' },
      },
    },
    docKetQua: {
      vi: 'Thị giá dưới BVPS nghĩa là thị trường định giá doanh nghiệp dưới sổ sách, cần tìm hiểu vì sao trước khi kết luận là rẻ.',
    },
    deSai: {
      vi: 'Coi giá trị sổ sách là giá bán được; nhiều tài sản trên sổ không bán được bằng giá ghi sổ.',
    },
  },

  roe: {
    deLamGi: {
      vi: 'Biết mỗi đồng vốn cổ đông tạo ra bao nhiêu đồng lãi trong năm.',
    },
    oNhap: {
      netIncome: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng cuối cùng, phần thuộc cổ đông công ty mẹ.',
        },
        luuY: { vi: 'Cộng bốn quý nếu muốn tính cả năm.' },
      },
      equity: {
        layODau: { vi: 'Bảng cân đối kế toán, dòng tổng vốn chủ sở hữu.' },
      },
    },
    docKetQua: {
      vi: 'Giữ trên 15% nhiều năm liền thường là doanh nghiệp tốt. Nếu cao đột biến một năm thì phải xem có phải nhờ lợi nhuận bất thường.',
    },
    deSai: {
      vi: 'ROE cao nhờ vay nhiều chứ không nhờ kinh doanh giỏi; xem kèm D/E mới đủ.',
    },
  },

  roa: {
    deLamGi: {
      vi: 'Biết doanh nghiệp dùng toàn bộ tài sản hiệu quả đến đâu, bất kể tiền đó là vốn hay nợ.',
    },
    oNhap: {
      netIncome: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng cuối cùng, phần thuộc cổ đông công ty mẹ.',
        },
        luuY: { vi: 'Cộng bốn quý nếu muốn tính cả năm.' },
      },
      totalAssets: {
        layODau: { vi: 'Bảng cân đối kế toán, dòng tổng tài sản.' },
      },
    },
    docKetQua: {
      vi: 'So với trung bình ngành là cách đọc đáng tin nhất, vì mỗi ngành cần lượng tài sản khác nhau.',
    },
    deSai: {
      vi: 'So ROA của ngân hàng với ROA của bán lẻ; hai mặt bằng hoàn toàn khác nhau.',
    },
  },

  'bien-loi-nhuan-rong': {
    deLamGi: {
      vi: 'Biết trong 100 đồng doanh thu thì giữ lại được bao nhiêu đồng lãi.',
    },
    oNhap: {
      netIncome: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng cuối cùng, phần thuộc cổ đông công ty mẹ.',
        },
        luuY: { vi: 'Cộng bốn quý nếu muốn tính cả năm.' },
      },
      revenue: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng doanh thu thuần sau khi trừ các khoản giảm trừ.',
        },
        luuY: { vi: 'Cộng bốn quý nếu muốn tính cả năm.' },
      },
    },
    docKetQua: {
      vi: 'Biên mỏng nghĩa là chi phí nhích nhẹ là lợi nhuận bốc hơi; biên dày cho sức chịu đựng tốt hơn.',
    },
    deSai: {
      vi: 'Lấy doanh thu gộp thay vì doanh thu thuần, làm biên thấp giả.',
    },
  },

  'bien-loi-nhuan-gop': {
    deLamGi: {
      vi: 'Biết doanh nghiệp còn lại bao nhiêu sau khi trừ giá vốn, trước mọi chi phí khác.',
    },
    oNhap: {
      revenue: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng doanh thu thuần sau khi trừ các khoản giảm trừ.',
        },
        luuY: { vi: 'Cộng bốn quý nếu muốn tính cả năm.' },
      },
      cogs: {
        layODau: { vi: 'Báo cáo kết quả kinh doanh, dòng giá vốn hàng bán.' },
        luuY: { vi: 'Cùng kỳ với doanh thu.' },
      },
    },
    docKetQua: {
      vi: 'Ổn định hoặc tăng dần là giữ được giá bán; co lại thường do cạnh tranh ép giá hoặc chi phí đầu vào tăng.',
    },
    deSai: {
      vi: 'Coi biên gộp cao là lãi nhiều; chi phí bán hàng và quản lý vẫn chưa trừ.',
    },
  },

  'no-tren-von-chu': {
    deLamGi: {
      vi: 'Biết doanh nghiệp đang vay bao nhiêu so với vốn của chính mình.',
    },
    oNhap: {
      totalLiabilities: {
        layODau: { vi: 'Bảng cân đối kế toán, dòng tổng nợ phải trả.' },
        luuY: { vi: 'Gồm cả nợ vay lẫn nợ phải trả người bán.' },
      },
      equity: {
        layODau: { vi: 'Bảng cân đối kế toán, dòng tổng vốn chủ sở hữu.' },
      },
    },
    docKetQua: {
      vi: 'Trên 2 lần là đòn bẩy cao với phần lớn ngành sản xuất; ngân hàng và bất động sản có mặt bằng khác hẳn.',
    },
    deSai: {
      vi: 'Chỉ lấy nợ vay mà bỏ nợ phải trả người bán, làm hệ số thấp giả.',
    },
  },

  'thanh-toan-hien-hanh': {
    deLamGi: {
      vi: 'Biết tài sản ngắn hạn có đủ trả các khoản nợ đến hạn trong một năm không.',
    },
    oNhap: {
      currentAssets: {
        layODau: { vi: 'Bảng cân đối kế toán, tổng tài sản ngắn hạn.' },
      },
      currentLiabilities: {
        layODau: { vi: 'Bảng cân đối kế toán, tổng nợ phải trả ngắn hạn.' },
      },
    },
    docKetQua: {
      vi: 'Dưới 1 lần là dấu hiệu căng thẳng thanh khoản; quá cao lại có thể là ứ đọng vốn.',
    },
    deSai: {
      vi: 'Yên tâm vì hệ số cao trong khi phần lớn tài sản ngắn hạn là hàng tồn khó bán; xem thêm hệ số thanh toán nhanh.',
    },
  },

  'thanh-toan-nhanh': {
    deLamGi: {
      vi: 'Biết doanh nghiệp trả nợ ngắn hạn được không nếu không bán được hàng tồn kho.',
    },
    oNhap: {
      currentAssets: {
        layODau: { vi: 'Bảng cân đối kế toán, tổng tài sản ngắn hạn.' },
      },
      inventory: {
        layODau: { vi: 'Bảng cân đối kế toán, mục hàng tồn kho ròng.' },
      },
      currentLiabilities: {
        layODau: { vi: 'Bảng cân đối kế toán, tổng nợ phải trả ngắn hạn.' },
      },
    },
    docKetQua: {
      vi: 'Quanh 1 lần trở lên là an toàn; thấp hơn hẳn hệ số hiện hành nghĩa là thanh khoản đang phụ thuộc nặng vào bán hàng tồn.',
    },
    deSai: {
      vi: 'Quên trừ hàng tồn kho, biến công thức này thành bản sao của hệ số hiện hành.',
    },
  },

  'vong-quay-tong-tai-san': {
    deLamGi: {
      vi: 'Biết mỗi đồng tài sản tạo ra bao nhiêu đồng doanh thu một năm.',
    },
    oNhap: {
      revenue: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng doanh thu thuần sau khi trừ các khoản giảm trừ.',
        },
        luuY: { vi: 'Cộng bốn quý nếu muốn tính cả năm.' },
      },
      totalAssets: {
        layODau: { vi: 'Bảng cân đối kế toán, dòng tổng tài sản.' },
      },
    },
    docKetQua: {
      vi: 'Bán lẻ quay nhanh trên 2 vòng nhưng biên mỏng; điện nước, bất động sản quay dưới 0,5 vòng nhưng biên dày.',
    },
    deSai: {
      vi: 'So ngang giữa hai ngành khác nhau rồi kết luận ngành quay chậm là kém.',
    },
  },

  'ty-le-chi-tra-co-tuc': {
    deLamGi: {
      vi: 'Biết doanh nghiệp chia bao nhiêu phần lãi cho cổ đông, giữ lại bao nhiêu để tái đầu tư.',
    },
    oNhap: {
      dividendPerShare: {
        layODau: { vi: 'Nghị quyết chi trả cổ tức của doanh nghiệp.' },
        luuY: { vi: 'Chỉ lấy cổ tức tiền mặt, không lấy cổ tức bằng cổ phiếu.' },
      },
      eps: {
        layODau: { vi: 'Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu.' },
        luuY: {
          vi: 'Cộng bốn quý gần nhất. Lấy một quý rồi đọc như cả năm là lỗi thường gặp nhất.',
        },
      },
    },
    docKetQua: {
      vi: 'Trên 100% nghĩa là trả nhiều hơn lãi làm ra, phải lấy từ tiền tích luỹ, khó bền. Doanh nghiệp tăng trưởng nhanh thường giữ hệ số thấp.',
    },
    deSai: {
      vi: 'Cộng cả cổ tức bằng cổ phiếu vào tử số; công thức này chỉ tính cổ tức tiền mặt.',
    },
  },

  /* ── Định giá — 20 công thức ─────────────────────────────────────────────────────────────── */

  ps: {
    deLamGi: {
      vi: 'Định giá doanh nghiệp theo quy mô doanh thu, dùng được cả khi đang lỗ.',
    },
    oNhap: {
      price: {
        layODau: { vi: 'Giá đóng cửa gần nhất trên bảng giá, hoặc nhập theo mã.' },
      },
      salesPerShare: {
        layODau: { vi: 'Doanh thu thuần chia số cổ phiếu lưu hành.' },
      },
    },
    docKetQua: {
      vi: 'Thấp hơn các doanh nghiệp cùng ngành gợi ý đang rẻ so với quy mô doanh thu.',
    },
    deSai: {
      vi: 'So khác ngành; biên lợi nhuận mỗi ngành một khác nên cùng mức P/S không cùng ý nghĩa.',
    },
  },

  ev: {
    deLamGi: {
      vi: 'Biết cái giá thực để mua đứt doanh nghiệp, gồm cả gánh nợ và trừ tiền mặt sẵn có.',
    },
    oNhap: {
      marketCap: {
        layODau: { vi: 'Nhận từ công thức Vốn hoá, hoặc lấy trên bảng giá.' },
      },
      totalDebt: {
        layODau: { vi: 'Bảng cân đối kế toán, cộng vay ngắn hạn và vay dài hạn.' },
        luuY: { vi: 'Chỉ lấy nợ vay có lãi, không lấy nợ phải trả người bán.' },
      },
      cash: {
        layODau: { vi: 'Bảng cân đối kế toán, mục tiền và các khoản tương đương tiền.' },
        luuY: { vi: 'Có thể cộng thêm đầu tư tài chính ngắn hạn thanh khoản cao.' },
      },
    },
    docKetQua: {
      vi: 'EV lớn hơn vốn hoá nghĩa là doanh nghiệp vay nhiều hơn tiền mặt đang giữ. EV âm là hiếm, khi tiền mặt vượt cả vốn hoá cộng nợ.',
    },
    deSai: {
      vi: 'Quên trừ tiền mặt, làm EV cao giả và mọi bội số dựa trên EV sai theo.',
    },
  },

  'ev-ebitda': {
    deLamGi: {
      vi: 'So giá mua đứt doanh nghiệp với dòng tiền hoạt động, bỏ qua khác biệt về khấu hao và cơ cấu vốn.',
    },
    oNhap: {
      ev: {
        layODau: { vi: 'Nhận tự động từ công thức EV.' },
      },
      ebitda: {
        layODau: { vi: 'Lợi nhuận trước lãi vay, thuế và khấu hao. Lấy EBIT cộng khấu hao.' },
        luuY: { vi: 'Cộng bốn quý nếu muốn tính cả năm.' },
      },
    },
    docKetQua: {
      vi: 'Thấp hơn trung bình ngành gợi ý đang rẻ.',
    },
    deSai: {
      vi: 'Quên rằng EBITDA chưa trừ chi đầu tư, nên ngành thâm dụng vốn trông rẻ một cách giả tạo.',
    },
  },

  'ev-sales': {
    deLamGi: {
      vi: 'Định giá theo doanh thu nhưng có tính cả nợ, khác P/S ở chỗ đó.',
    },
    oNhap: {
      ev: {
        layODau: { vi: 'Nhận tự động từ công thức EV.' },
      },
      revenue: {
        layODau: {
          vi: 'Báo cáo kết quả kinh doanh, dòng doanh thu thuần sau khi trừ các khoản giảm trừ.',
        },
        luuY: { vi: 'Cộng bốn quý nếu muốn tính cả năm.' },
      },
    },
    docKetQua: {
      vi: 'Trong cùng ngành, thấp hơn trung bình gợi ý đang rẻ so với quy mô kinh doanh.',
    },
    deSai: {
      vi: 'So với P/S rồi thắc mắc vì sao lệch; EV/Sales có cộng nợ nên luôn khác.',
    },
  },

  peg: {
    deLamGi: {
      vi: 'Biết mức P/E hiện tại có tương xứng với tốc độ tăng trưởng lợi nhuận không.',
    },
    oNhap: {
      pe: {
        layODau: { vi: 'Nhận từ công thức P/E, hoặc lấy trên bảng giá.' },
      },
      growth: {
        layODau: { vi: 'Dự phóng tăng trưởng lợi nhuận của bạn, hoặc của công ty chứng khoán.' },
        luuY: { vi: 'Lấy mức duy trì được vài năm, không lấy mức của một năm đột biến.' },
      },
    },
    docKetQua: {
      vi: 'Quanh 1 thường coi là hợp lý. Dưới 1 gợi ý rẻ so với tăng trưởng, trên 2 là đắt trừ khi tăng trưởng còn tăng tốc.',
    },
    deSai: {
      vi: 'Lấy tăng trưởng của một năm đột biến làm tăng trưởng dài hạn, khiến PEG đẹp giả.',
    },
  },

  'von-hoa-thi-truong': {
    deLamGi: {
      vi: 'Biết thị trường đang định giá phần vốn cổ đông của doanh nghiệp bao nhiêu tiền.',
    },
    oNhap: {
      price: {
        layODau: { vi: 'Giá đóng cửa gần nhất trên bảng giá, hoặc nhập theo mã.' },
      },
      shares: {
        layODau: { vi: 'Báo cáo quản trị, mục cổ phiếu đang lưu hành. Ô này nhận triệu CP.' },
        luuY: { vi: 'Nếu có 1,47 tỷ cổ phiếu thì nhập 1470.' },
      },
    },
    docKetQua: {
      vi: 'Đây là giá phần vốn cổ đông, chưa tính nợ. Doanh nghiệp lớn thường biến động giá êm hơn doanh nghiệp vốn hoá nhỏ.',
    },
    deSai: {
      vi: 'Nhầm đơn vị số cổ phiếu, ô này nhận triệu CP chứ không phải CP.',
    },
  },

  'so-graham': {
    deLamGi: {
      vi: 'Có một mức giá trần bảo thủ theo chuẩn Benjamin Graham để đối chiếu với thị giá.',
    },
    oNhap: {
      eps: {
        layODau: { vi: 'Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu.' },
        luuY: {
          vi: 'Cộng bốn quý gần nhất. Lấy một quý rồi đọc như cả năm là lỗi thường gặp nhất.',
        },
      },
      bvps: {
        layODau: { vi: 'Nhận từ công thức BVPS, hoặc lấy vốn chủ chia số cổ phiếu lưu hành.' },
      },
    },
    docKetQua: {
      vi: 'Thị giá thấp hơn số Graham gợi ý cổ phiếu chưa đắt theo chuẩn này.',
    },
    deSai: {
      vi: 'Dùng làm bộ lọc duy nhất; đây là chuẩn bảo thủ, dễ bỏ sót doanh nghiệp tăng trưởng.',
    },
  },

  'ncav-tren-co-phieu': {
    deLamGi: {
      vi: 'Biết nếu thanh lý ngay hôm nay, chỉ tính tài sản ngắn hạn và trừ hết nợ, thì mỗi cổ phiếu còn bao nhiêu.',
    },
    oNhap: {
      currentAssets: {
        layODau: { vi: 'Bảng cân đối kế toán, tổng tài sản ngắn hạn.' },
      },
      totalLiabilities: {
        layODau: { vi: 'Bảng cân đối kế toán, dòng tổng nợ phải trả.' },
        luuY: { vi: 'Gồm cả nợ vay lẫn nợ phải trả người bán.' },
      },
      shares: {
        layODau: { vi: 'Báo cáo quản trị, mục cổ phiếu đang lưu hành. Ô này nhận triệu CP.' },
        luuY: { vi: 'Nếu có 1,47 tỷ cổ phiếu thì nhập 1470.' },
      },
    },
    docKetQua: {
      vi: 'Giá dưới NCAV là tín hiệu rẻ hiếm gặp, thường chỉ xuất hiện lúc thị trường hoảng loạn.',
    },
    deSai: {
      vi: 'Thấy NCAV âm rồi tưởng doanh nghiệp có vấn đề; âm là điều bình thường với hầu hết doanh nghiệp.',
    },
  },

  'ty-suat-loi-nhuan-tren-gia': {
    deLamGi: {
      vi: 'Đổi P/E thành phần trăm để so thẳng với lãi suất tiết kiệm.',
    },
    oNhap: {
      eps: {
        layODau: { vi: 'Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu.' },
        luuY: {
          vi: 'Cộng bốn quý gần nhất. Lấy một quý rồi đọc như cả năm là lỗi thường gặp nhất.',
        },
      },
      price: {
        layODau: { vi: 'Giá đóng cửa gần nhất trên bảng giá, hoặc nhập theo mã.' },
      },
    },
    docKetQua: {
      vi: 'Nếu cao hơn lãi suất tiết kiệm đáng kể thì cổ phiếu đang cho suất sinh lời hấp dẫn hơn gửi tiền, đổi lại rủi ro cao hơn hẳn.',
    },
    deSai: {
      vi: 'Coi con số này là tiền thật nhận được; lợi nhuận phần lớn giữ lại trong doanh nghiệp chứ không về tài khoản bạn.',
    },
  },

  'gia-muc-tieu': {
    deLamGi: {
      vi: 'Dựng một mức giá kịch bản từ P/E bạn cho là hợp lý.',
    },
    oNhap: {
      targetPe: {
        layODau: { vi: 'P/E trung bình ngành, hoặc P/E lịch sử của chính mã đó.' },
        luuY: {
          vi: 'Đây là giả định của bạn, không phải số liệu. Thử vài mức để thấy khoảng giá.',
        },
      },
      eps: {
        layODau: { vi: 'Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu.' },
        luuY: {
          vi: 'Cộng bốn quý gần nhất. Lấy một quý rồi đọc như cả năm là lỗi thường gặp nhất.',
        },
      },
    },
    docKetQua: {
      vi: 'Cao hơn thị giá nghĩa là còn dư địa tăng nếu P/E mục tiêu thành hiện thực.',
    },
    deSai: {
      vi: 'Đọc như một dự báo; đây là một kịch bản phụ thuộc hoàn toàn vào hai số bạn vừa nhập.',
    },
  },

  'mo-hinh-gordon': {
    deLamGi: {
      vi: 'Định giá cổ phiếu theo dòng cổ tức tăng đều mãi mãi.',
    },
    oNhap: {
      dividend: {
        layODau: { vi: 'Cổ tức tiền mặt của kỳ gần nhất, theo nghị quyết chi trả.' },
      },
      growth: {
        layODau: { vi: 'Mức tăng cổ tức bạn tin là duy trì được mãi mãi.' },
        luuY: { vi: '3–5% là vùng hợp lý. Đặt sát suất sinh lợi r sẽ làm kết quả vọt lên vô lý.' },
      },
      requiredReturn: {
        layODau: { vi: 'Nhận tự động từ CAPM, hoặc nhập mức bạn tự đòi hỏi.' },
        luuY: { vi: 'Phải lớn hơn tăng trưởng g, nếu không mô hình cho kết quả vô lý.' },
      },
    },
    docKetQua: {
      vi: 'Giá trị tính ra cao hơn thị giá nghĩa là cổ phiếu đang rẻ theo mô hình.',
    },
    deSai: {
      vi: 'Đặt tăng trưởng g sát với suất sinh lợi r; kết quả cực nhạy với hiệu r − g và sẽ vọt lên vô lý.',
    },
  },

  'ddm-hai-giai-doan': {
    deLamGi: {
      vi: 'Định giá cổ phiếu đang tăng trưởng nhanh rồi mới chậm lại, thay vì tăng đều ngay từ đầu.',
    },
    oNhap: {
      dividend: {
        layODau: { vi: 'Cổ tức tiền mặt của kỳ gần nhất, theo nghị quyết chi trả.' },
      },
      growthStage1: {
        layODau: { vi: 'Mức tăng cổ tức trong những năm đầu còn tăng nhanh.' },
        luuY: { vi: 'Lấy từ kế hoạch doanh nghiệp hoặc dự phóng của công ty chứng khoán.' },
      },
      years: {
        layODau: { vi: 'Số năm bạn tin doanh nghiệp còn tăng trưởng nhanh.' },
        luuY: { vi: '5 năm là giả định phổ biến.' },
      },
      growthTerminal: {
        layODau: { vi: 'Mức tăng cổ tức sau khi giai đoạn tăng nhanh kết thúc.' },
        luuY: { vi: 'Phải thấp hơn hẳn g1 và nhỏ hơn suất sinh lợi r.' },
      },
      requiredReturn: {
        layODau: { vi: 'Nhận tự động từ CAPM, hoặc nhập mức bạn tự đòi hỏi.' },
        luuY: { vi: 'Phải lớn hơn tăng trưởng g, nếu không mô hình cho kết quả vô lý.' },
      },
    },
    docKetQua: {
      vi: 'Con số là giá trị một cổ phiếu theo mô hình; cao hơn thị giá là đang rẻ theo cách tính này.',
    },
    deSai: {
      vi: 'Để tăng trưởng dài hạn g2 cao bằng giai đoạn đầu, làm mô hình mất ý nghĩa.',
    },
  },

  capm: {
    deLamGi: {
      vi: 'Biết mức sinh lợi tối thiểu mỗi năm mà cổ đông nên đòi ở cổ phiếu này.',
    },
    oNhap: {
      riskFree: {
        layODau: {
          vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm, xem trên HNX hoặc bản tin thị trường.',
        },
        luuY: { vi: 'Việt Nam 2026 quanh 3–4%/năm. Không dùng lãi suất tiết kiệm ngân hàng.' },
      },
      beta: {
        layODau: { vi: 'Nhận tự động từ công thức Beta, hoặc nhập theo mã.' },
        luuY: { vi: 'Trên 1 là nhạy hơn thị trường, dưới 1 là ít nhạy hơn.' },
      },
      erp: {
        layODau: { vi: 'Phần lợi suất thị trường cổ phiếu vượt trên trái phiếu chính phủ.' },
        luuY: { vi: 'Thị trường Việt Nam thường dùng 7–9%.' },
      },
    },
    docKetQua: {
      vi: 'Con số là ngưỡng sinh lợi tối thiểu, dùng làm suất chiết khấu cho các mô hình định giá.',
    },
    deSai: {
      vi: 'Dùng lãi suất tiết kiệm ngân hàng làm lãi suất phi rủi ro; chuẩn là trái phiếu chính phủ.',
    },
  },

  wacc: {
    deLamGi: {
      vi: 'Biết doanh nghiệp phải sinh lợi tối thiểu bao nhiêu để không huỷ giá trị, tính cả vốn lẫn nợ.',
    },
    oNhap: {
      equity: {
        layODau: { vi: 'Dùng vốn hoá thị trường nếu có, vì WACC tính theo giá thị trường.' },
        luuY: { vi: 'Có thể lấy số liệu trong sổ sách, nhưng sẽ kém chính xác.' },
      },
      debt: {
        layODau: { vi: 'Bảng cân đối kế toán, cộng vay ngắn hạn và vay dài hạn.' },
      },
      costEquity: {
        layODau: { vi: 'Nhận tự động từ công thức CAPM.' },
        luuY: { vi: 'Thường 11–16% với cổ phiếu Việt Nam.' },
      },
      costDebt: {
        layODau: {
          vi: 'Thuyết minh báo cáo tài chính, mục chi phí tài chính: lấy lãi vay chia dư nợ bình quân.',
        },
        luuY: { vi: 'Doanh nghiệp niêm yết Việt Nam thường 7–11%/năm.' },
      },
      taxRate: {
        layODau: { vi: 'Thuế suất phổ thông theo luật hiện hành.' },
        luuY: {
          vi: '20% cho phần lớn doanh nghiệp. Doanh nghiệp ưu đãi có thể thấp hơn, xem thuyết minh.',
        },
      },
    },
    docKetQua: {
      vi: 'Dự án chỉ tạo giá trị khi sinh lợi vượt WACC.',
    },
    deSai: {
      vi: 'Tưởng rằng nếu vay thêm thì WACC giảm; điều đó chỉ đúng khi lãi vay sau thuế còn rẻ hơn chi phí vốn chủ.',
    },
  },

  fcff: {
    deLamGi: {
      vi: 'Biết doanh nghiệp tạo ra bao nhiêu tiền mặt thực sự còn lại cho cả chủ nợ và cổ đông.',
    },
    oNhap: {
      ebit: {
        layODau: { vi: 'Lợi nhuận thuần từ hoạt động kinh doanh cộng lại chi phí lãi vay.' },
      },
      taxRate: {
        layODau: { vi: 'Thuế suất phổ thông theo luật hiện hành.' },
        luuY: {
          vi: '20% cho phần lớn doanh nghiệp. Doanh nghiệp ưu đãi có thể thấp hơn, xem thuyết minh.',
        },
      },
      depreciation: {
        layODau: { vi: 'Báo cáo lưu chuyển tiền tệ, mục khấu hao tài sản cố định.' },
      },
      capex: {
        layODau: { vi: 'Báo cáo lưu chuyển tiền tệ, mục tiền chi mua sắm tài sản cố định.' },
        luuY: { vi: 'Nhập số dương.' },
      },
      nwcChange: {
        layODau: { vi: 'Chênh lệch vốn lưu động giữa hai kỳ, xem báo cáo lưu chuyển tiền tệ.' },
        luuY: { vi: 'Nếu vốn lưu động giảm thì nhập số âm.' },
      },
    },
    docKetQua: {
      vi: 'Biểu đồ bóc tách bên dưới cho thấy từng khoản cộng trừ dẫn tới con số cuối.',
    },
    deSai: {
      vi: 'Thấy FCFF âm rồi kết luận xấu; doanh nghiệp đang mở rộng có thể chi đầu tư lớn hơn tiền tạo ra, cần xem âm vì đầu tư hay vì kinh doanh kém.',
    },
  },

  fcfe: {
    deLamGi: {
      vi: 'Biết sau khi trả lãi vay và cân đối nợ vay mới, cổ đông còn lại bao nhiêu tiền mặt.',
    },
    oNhap: {
      fcff: {
        layODau: { vi: 'Nhận tự động từ công thức FCFF.' },
      },
      interest: {
        layODau: { vi: 'Báo cáo kết quả kinh doanh, mục chi phí tài chính.' },
      },
      taxRate: {
        layODau: { vi: 'Thuế suất phổ thông theo luật hiện hành.' },
        luuY: {
          vi: '20% cho phần lớn doanh nghiệp. Doanh nghiệp ưu đãi có thể thấp hơn, xem thuyết minh.',
        },
      },
      netBorrowing: {
        layODau: {
          vi: 'Tiền vay mới trừ tiền trả nợ gốc, ở báo cáo lưu chuyển tiền tệ phần tài chính.',
        },
        luuY: { vi: 'Nếu trả nợ nhiều hơn vay mới thì nhập số âm.' },
      },
    },
    docKetQua: {
      vi: 'Cao hơn cổ tức thực trả nghĩa là còn dư địa tăng cổ tức hoặc mua lại cổ phiếu.',
    },
    deSai: {
      vi: 'Để vay ròng mới bằng 0 cho đơn giản; khoản này thường lớn và làm lệch kết quả nhiều.',
    },
  },

  'gia-tri-noi-tai-fcff': {
    deLamGi: {
      vi: 'Ra một mức giá trị nội tại cho mỗi cổ phiếu từ dòng tiền doanh nghiệp.',
    },
    oNhap: {
      fcff: {
        layODau: { vi: 'Nhận tự động từ công thức FCFF.' },
      },
      growth: {
        layODau: { vi: 'Mức tăng dòng tiền bạn tin là duy trì được mãi mãi.' },
        luuY: {
          vi: 'Đặt thấp hơn tăng trưởng GDP dài hạn, thường 3–5%, và luôn phải nhỏ hơn WACC.',
        },
      },
      wacc: {
        layODau: { vi: 'Nhận tự động từ công thức WACC, hoặc nhập tay nếu bạn có ước tính riêng.' },
        luuY: { vi: 'Phải lớn hơn tăng trưởng dài hạn g, nếu không mô hình vô nghĩa.' },
      },
      netDebt: {
        layODau: { vi: 'Nợ vay trừ tiền và tương đương tiền.' },
        luuY: { vi: 'Với doanh nghiệp nhiều tiền mặt, số này có thể là số âm, nhập đúng dấu âm.' },
      },
      shares: {
        layODau: { vi: 'Báo cáo quản trị, mục cổ phiếu đang lưu hành. Ô này nhận triệu CP.' },
        luuY: { vi: 'Nếu có 1,47 tỷ cổ phiếu thì nhập 1470.' },
      },
    },
    docKetQua: {
      vi: 'So con số này với thị giá; cao hơn nhiều là cổ phiếu đang rẻ theo mô hình.',
    },
    deSai: {
      vi: 'Đặt g sát WACC; kết quả cực nhạy với hiệu WACC − g, nên thử vài kịch bản trước khi tin một con số.',
    },
  },

  'gia-tri-hien-tai': {
    deLamGi: {
      vi: 'Biết một khoản tiền nhận trong tương lai đáng bao nhiêu tiền hôm nay.',
    },
    oNhap: {
      futureValue: {
        layODau: { vi: 'Khoản tiền sẽ nhận được ở một thời điểm trong tương lai.' },
      },
      rate: {
        layODau: { vi: 'Mức sinh lợi bạn có thể kiếm được ở kênh đầu tư khác cùng rủi ro.' },
        luuY: { vi: 'Chiết khấu thấp làm mọi khoản tiền tương lai trông giá trị hơn thực tế.' },
      },
      years: {
        layODau: { vi: 'Khoảng cách giữa hai mốc thời gian đang xét.' },
        luuY: { vi: 'Lệch một năm ở đây làm kết quả lệch đáng kể.' },
      },
    },
    docKetQua: {
      vi: 'Con số là số tiền hôm nay tương đương với khoản tiền tương lai đó.',
    },
    deSai: {
      vi: 'Chọn tỷ lệ chiết khấu quá thấp, làm mọi khoản tiền tương lai trông giá trị hơn thực tế.',
    },
  },

  'gia-tri-tuong-lai': {
    deLamGi: {
      vi: 'Biết số tiền hiện có sẽ thành bao nhiêu sau một số năm nếu giữ nguyên mức sinh lợi.',
    },
    oNhap: {
      presentValue: {
        layODau: { vi: 'Số tiền bạn có trong tay hôm nay.' },
      },
      rate: {
        layODau: { vi: 'Mức sinh lợi bạn giả định duy trì suốt thời gian đầu tư.' },
      },
      years: {
        layODau: { vi: 'Khoảng cách giữa hai mốc thời gian đang xét.' },
        luuY: { vi: 'Lệch một năm ở đây làm kết quả lệch đáng kể.' },
      },
    },
    docKetQua: {
      vi: 'Con số là số tiền ở cuối kỳ nếu mức sinh lợi giả định giữ nguyên suốt thời gian đó.',
    },
    deSai: {
      vi: 'Quên rằng lạm phát ăn mòn số này; muốn tính sức mua thật thì dùng thêm công thức Lợi suất thực.',
    },
  },

  'bien-an-toan': {
    deLamGi: {
      vi: 'Biết đang mua rẻ hơn giá trị ước tính bao nhiêu phần trăm.',
    },
    oNhap: {
      intrinsic: {
        layODau: {
          vi: 'Nhận tự động từ Mô hình Gordon, hoặc nhập từ mô hình định giá khác của bạn.',
        },
        luuY: { vi: 'Biên an toàn chỉ chắc bằng mô hình sinh ra con số này.' },
      },
      price: {
        layODau: { vi: 'Giá đóng cửa gần nhất trên bảng giá.' },
      },
    },
    docKetQua: {
      vi: 'Biên 25% nghĩa là mua rẻ hơn ước tính một phần tư; biên âm nghĩa là đang trả cao hơn giá trị tính ra.',
    },
    deSai: {
      vi: 'Tin biên an toàn trong khi giá trị nội tại dựa trên giả định lỏng lẻo; biên chỉ chắc bằng mô hình sinh ra nó.',
    },
  },

  /* ── Lợi suất — 14 công thức ─────────────────────────────────────────────────────────────── */

  roi: {
    deLamGi: {
      vi: 'Biết khoản đầu tư đã lãi hay lỗ bao nhiêu phần trăm so với vốn bỏ ra.',
    },
    oNhap: {
      cost: {
        layODau: {
          vi: 'Tổng tiền đã chi cho khoản đầu tư, gồm cả phí nếu muốn con số sát thực.',
        },
      },
      current: {
        layODau: { vi: 'Giá trị thị trường của khoản đầu tư hôm nay.' },
      },
    },
    docKetQua: {
      vi: '25% nghĩa là cứ 100 đồng vốn lãi thêm 25 đồng. Âm là đang lỗ.',
    },
    deSai: {
      vi: 'Quên phí và thuế; nếu muốn con số thật thì dùng công thức ROI ròng.',
    },
  },

  hpr: {
    deLamGi: {
      vi: 'Biết tổng lãi của cả kỳ nắm giữ, gồm cả tăng giá lẫn cổ tức.',
    },
    oNhap: {
      startPrice: {
        layODau: { vi: 'Giá đóng cửa phiên đầu của kỳ bạn xét.' },
        luuY: { vi: 'Nếu có chia tách trong kỳ thì phải dùng giá đã điều chỉnh.' },
      },
      endPrice: {
        layODau: { vi: 'Giá đóng cửa phiên cuối của kỳ bạn xét.' },
      },
      dividend: {
        layODau: { vi: 'Cổ tức tiền mặt nhận được trong đúng kỳ nắm giữ.' },
      },
    },
    docKetQua: {
      vi: 'Phần cao hơn tỷ suất tính trên giá thuần chính là đóng góp của cổ tức.',
    },
    deSai: {
      vi: 'Bỏ quên cổ tức, làm hiệu quả nắm giữ dài hạn thấp hơn thực tế.',
    },
  },

  cagr: {
    deLamGi: {
      vi: 'Quy nhiều năm lãi lỗ thất thường về một mức tăng đều mỗi năm để dễ so sánh.',
    },
    oNhap: {
      start: {
        layODau: { vi: 'Giá trị khoản đầu tư ở thời điểm bắt đầu.' },
      },
      end: {
        layODau: { vi: 'Giá trị khoản đầu tư ở thời điểm kết thúc.' },
      },
      years: {
        layODau: { vi: 'Khoảng cách giữa hai mốc thời gian đang xét.' },
        luuY: { vi: 'Lệch một năm ở đây làm kết quả lệch đáng kể.' },
      },
    },
    docKetQua: {
      vi: '14,87% nghĩa là nếu tăng đều 14,87% mỗi năm thì sau số năm đó ra đúng giá trị cuối kỳ.',
    },
    deSai: {
      vi: 'Nhập số năm lệch một năm; sai lệch nhỏ ở đây làm kết quả lệch đáng kể.',
    },
  },

  'ty-suat-co-tuc': {
    deLamGi: {
      vi: 'Biết nếu bỏ tiền mua cổ phiếu thì một năm nhận lại bao nhiêu phần trăm bằng tiền mặt.',
    },
    oNhap: {
      price: {
        layODau: { vi: 'Giá đóng cửa gần nhất trên bảng giá.' },
      },
      dividendPerShare: {
        layODau: { vi: 'Cộng các đợt chi trả tiền mặt trong 12 tháng gần nhất.' },
        luuY: { vi: 'Chỉ cộng cổ tức tiền mặt.' },
      },
    },
    docKetQua: {
      vi: '2,17% nghĩa là nếu bỏ 100.000 ₫ thì một năm nhận 2.170 ₫ tiền mặt, trước thuế.',
    },
    deSai: {
      vi: 'Thấy tỷ suất cao bất thường rồi mừng; thường là do giá vừa rơi mạnh, không phải do cổ tức tăng.',
    },
  },

  xirr: {
    deLamGi: {
      vi: 'Biết lãi suất thực của một chuỗi giao dịch vào ra nhiều lần vào những ngày khác nhau.',
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
    },
    deSai: {
      vi: 'Quên dấu âm cho khoản bỏ ra; nếu thiếu dấu âm thì không tính được.',
    },
  },

  'loi-suat-nam-hoa': {
    deLamGi: {
      vi: 'Quy một mức lãi ngắn hạn về mức lãi tương đương cả năm.',
    },
    oNhap: {
      periodReturn: {
        layODau: { vi: 'Lãi của đúng một kỳ, chưa quy ra năm.' },
      },
      periodsPerYear: {
        layODau: { vi: 'Số kỳ của lợi suất vừa nhập trong một năm.' },
        luuY: { vi: '12 nếu theo tháng, 4 nếu theo quý, 52 nếu theo tuần.' },
      },
    },
    docKetQua: {
      vi: 'So với lãi suất gửi tiết kiệm cùng kỳ hạn để biết khoản lãi ngắn hạn có đáng không.',
    },
    deSai: {
      vi: 'Quy năm một khoản lãi may mắn của một kỳ rồi coi như mức bền vững.',
    },
  },

  'loi-suat-thuc': {
    deLamGi: {
      vi: 'Biết tiền có thực sự mua được nhiều hơn không, sau khi trừ trượt giá.',
    },
    oNhap: {
      nominal: {
        layODau: { vi: 'Lãi suất ghi trên hợp đồng, hoặc mức sinh lợi bạn đạt được.' },
      },
      inflation: {
        layODau: {
          vi: 'Chỉ số giá tiêu dùng do Tổng cục Thống kê công bố, mục CPI bình quân năm.',
        },
        luuY: { vi: 'Việt Nam nhiều năm gần đây quanh 3–4%.' },
      },
    },
    docKetQua: {
      vi: 'Âm nghĩa là tiền vẫn tăng trên sổ nhưng sức mua đang giảm.',
    },
    deSai: {
      vi: 'Lấy lợi suất trừ thẳng lạm phát; đó chỉ là xấp xỉ, công thức này tính chính xác hơn.',
    },
  },

  'lai-suat-hieu-dung': {
    deLamGi: {
      vi: 'Biết lãi suất thật khi ngân hàng nhập lãi nhiều lần trong năm.',
    },
    oNhap: {
      rate: {
        layODau: { vi: 'Con số in trên bảng lãi suất, trước khi tính đến ghép lãi.' },
      },
      perYear: {
        layODau: { vi: 'Xem hợp đồng tiền gửi, mục kỳ nhập lãi.' },
        luuY: { vi: 'Sổ tiết kiệm Việt Nam phần lớn nhập lãi cuối kỳ hoặc mỗi tháng.' },
      },
    },
    docKetQua: {
      vi: 'EAR luôn lớn hơn hoặc bằng lãi danh nghĩa; chênh càng rõ khi lãi suất cao và ghép dày.',
    },
    deSai: {
      vi: 'So hai sản phẩm bằng lãi suất danh nghĩa; phải quy về EAR mới so sánh được.',
    },
  },

  'tong-loi-suat-tai-dau-tu': {
    deLamGi: {
      vi: 'Biết nếu lấy cổ tức mua thêm cổ phiếu thì sau nhiều năm khác bao nhiêu so với chỉ giữ.',
    },
    oNhap: {
      priceGrowth: {
        layODau: { vi: 'Mức tăng giá trung bình mỗi năm bạn giả định, chưa tính cổ tức.' },
      },
      dividendYield: {
        layODau: {
          vi: 'Cổ tức tiền mặt một năm chia thị giá, hoặc lấy từ công thức Tỷ suất cổ tức.',
        },
      },
      years: {
        layODau: { vi: 'Số năm dự định giữ khoản đầu tư.' },
      },
    },
    docKetQua: {
      vi: 'Phần chênh so với chỉ tính tăng giá chính là công của cổ tức tái đầu tư.',
    },
    deSai: {
      vi: 'Quên trừ thuế cổ tức; tiền thực tái đầu tư ít hơn cổ tức công bố.',
    },
  },

  'loi-suat-trung-binh-hinh-hoc': {
    deLamGi: {
      vi: 'Tính mức lãi trung bình đúng cho nhiều kỳ liên tiếp, thay vì trung bình cộng sai lệch.',
    },
    oNhap: {
      periods: {
        layODau: { vi: 'Chọn số kỳ bạn có số liệu.' },
        luuY: { vi: '2 hoặc 3 kỳ. Chọn 1 trong các kỳ thì kỳ còn lại sẽ ẩn đi.' },
      },
      r1: {
        layODau: { vi: 'Lãi của kỳ đầu tiên, tính bằng phần trăm.' },
        luuY: { vi: 'Kỳ lỗ nhập số âm.' },
      },
      r2: {
        layODau: { vi: 'Lãi của kỳ thứ hai.' },
        luuY: { vi: 'Kỳ lỗ nhập số âm.' },
      },
      r3: {
        layODau: { vi: 'Lãi của kỳ thứ ba. Ẩn khi chọn 2 kỳ.' },
        luuY: { vi: 'Kỳ lỗ nhập số âm.' },
      },
    },
    docKetQua: {
      vi: 'Luôn thấp hơn trung bình cộng khi lợi suất có biến động; biến động càng mạnh khoảng cách càng lớn.',
    },
    deSai: {
      vi: 'Dùng trung bình cộng để báo cáo hiệu quả nhiều năm, làm kết quả đẹp hơn thực tế.',
    },
  },

  'irr-nien-kim': {
    deLamGi: {
      vi: 'Biết lãi suất ẩn trong một gói trả đều, ví dụ gói trả góp hoặc hợp đồng thuê.',
    },
    oNhap: {
      investment: {
        layODau: { vi: 'Số tiền chi một lần ở thời điểm bắt đầu.' },
      },
      payment: {
        layODau: { vi: 'Số tiền bạn nhận về đều đặn mỗi kỳ.' },
        luuY: { vi: 'Mọi kỳ phải bằng nhau; nếu không đều thì dùng XIRR.' },
      },
      periods: {
        layODau: { vi: 'Số lần sẽ nhận tiền về, đếm theo kỳ chứ không theo năm.' },
        luuY: { vi: 'Nếu trả góp 5 năm theo tháng thì nhập 60.' },
      },
    },
    docKetQua: {
      vi: 'IRR tính theo kỳ: nếu dòng tiền theo tháng thì đây là %/tháng.',
    },
    deSai: {
      vi: 'So thẳng %/tháng với lãi suất năm của ngân hàng; phải năm hoá thêm một bước.',
    },
  },

  'thoi-gian-nhan-doi': {
    deLamGi: {
      vi: 'Biết với mức lãi kép hiện tại thì bao lâu vốn gấp đôi.',
    },
    oNhap: {
      rate: {
        layODau: { vi: 'Mức sinh lợi bạn kỳ vọng duy trì đều mỗi năm.' },
        luuY: { vi: 'Lấy mức bền vững, không lấy mức của một năm tốt.' },
      },
    },
    docKetQua: {
      vi: 'Số năm cần để vốn nhân đôi. Số phụ kèm theo là ước lượng nhanh lấy 72 chia lợi suất.',
    },
    deSai: {
      vi: 'Áp mức lợi suất của một năm tốt cho cả chặng dài.',
    },
  },

  'loi-suat-quy-nam-theo-ngay': {
    deLamGi: {
      vi: 'Quy lãi của một thương vụ ngắn về mức tương đương cả năm.',
    },
    oNhap: {
      buyPrice: {
        layODau: { vi: 'Giá khớp lệnh mua của bạn.' },
      },
      sellPrice: {
        layODau: { vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.' },
      },
      days: {
        layODau: { vi: 'Đếm theo ngày lịch từ ngày mua tới ngày bán.' },
        luuY: { vi: 'Nắm càng ngắn thì phép quy năm càng phóng đại.' },
      },
    },
    docKetQua: {
      vi: 'Nắm càng ngắn thì phép quy năm phóng đại càng mạnh: lãi 7,5% trong 90 ngày quy năm thành hơn 34%.',
    },
    deSai: {
      vi: 'Coi con số quy năm của một lệnh vài ngày là hiệu quả đầu tư.',
    },
  },

  'loi-suat-vuot-chuan': {
    deLamGi: {
      vi: 'Biết danh mục đang thắng hay thua chỉ số so sánh.',
    },
    oNhap: {
      portfolioReturn: {
        layODau: { vi: 'Lãi của danh mục bạn trong kỳ, tính cả cổ tức.' },
      },
      benchmarkReturn: {
        layODau: { vi: 'Mức tăng của VN-Index hoặc VN30 trong đúng kỳ đang xét.' },
        luuY: { vi: 'Phải cùng kỳ với lợi suất danh mục, nếu không so sánh mất nghĩa.' },
      },
    },
    docKetQua: {
      vi: 'Dương là thắng chuẩn, âm là thua chuẩn.',
    },
    deSai: {
      vi: 'Lấy hai kỳ khác nhau cho hai ô, làm so sánh mất nghĩa.',
    },
  },

  /* ── Rủi ro — 18 công thức ───────────────────────────────────────────────────────────────── */

  'co-lenh-rui-ro': {
    deLamGi: {
      vi: 'Biết được mua tối đa bao nhiêu cổ phiếu để nếu chạm cắt lỗ thì chỉ mất đúng phần vốn đã định.',
    },
    oNhap: {
      capital: {
        layODau: { vi: 'Tổng vốn đang có trong tài khoản chứng khoán.' },
      },
      riskPercent: {
        layODau: { vi: 'Phần vốn bạn chấp nhận mất nếu lệnh này chạm cắt lỗ.' },
        luuY: { vi: '1–2% là mức quản trị rủi ro thông dụng. Trên 5% là rất mạo hiểm.' },
      },
      entryPrice: {
        layODau: { vi: 'Giá dự định mua, hoặc giá đã khớp.' },
      },
      stopPrice: {
        layODau: { vi: 'Mức giá thoát lệnh nếu đi ngược dự tính.' },
        luuY: { vi: 'Đặt quá sát giá vào sẽ làm cỡ lệnh vọt lên rất lớn.' },
      },
    },
    docKetQua: {
      vi: 'Con số là khối lượng tối đa của riêng lệnh này, cần làm tròn xuống bội số lô.',
    },
    deSai: {
      vi: 'Đặt cắt lỗ quá sát giá vào, làm cỡ lệnh vọt lên rất lớn.',
    },
  },

  'sut-giam-sau-nhat': {
    deLamGi: {
      vi: 'Biết trong cửa sổ đang xét, giá từng rơi khỏi đỉnh sâu nhất bao nhiêu.',
    },
    oNhap: {
      lookback: {
        layODau: { vi: 'Độ dài cửa sổ quan sát, tính lùi từ phiên mới nhất.' },
        luuY: { vi: '250 phiên là khoảng một năm. Nếu cửa sổ quá ngắn thì kết quả nhảy liên tục.' },
      },
    },
    docKetQua: {
      vi: 'Số dương nghĩa là mất: 25 nghĩa là từng rơi 25% khỏi đỉnh. Rơi 25% phải lãi lại 33% mới hoà vốn.',
    },
    deSai: {
      vi: 'Đọc số dương thành lãi; ở công thức này dương luôn là mất.',
    },
  },

  'sut-giam-hien-tai': {
    deLamGi: {
      vi: 'Biết giá hôm nay còn kém đỉnh gần nhất bao nhiêu phần trăm.',
    },
    oNhap: {
      lookback: {
        layODau: { vi: 'Độ dài cửa sổ quan sát, tính lùi từ phiên mới nhất.' },
        luuY: { vi: '250 phiên là khoảng một năm. Nếu cửa sổ quá ngắn thì kết quả nhảy liên tục.' },
      },
    },
    docKetQua: {
      vi: '10 nghĩa là còn kém đỉnh 10%. Bằng 0 nghĩa là giá vừa lập đỉnh mới của cửa sổ.',
    },
    deSai: {
      vi: 'Nhầm với mức sụt giảm sâu nhất; công thức này chỉ nói hiện tại.',
    },
  },

  'var-lich-su': {
    deLamGi: {
      vi: 'Biết trong một phiên tệ, mức lỗ thường không vượt quá bao nhiêu phần trăm.',
    },
    oNhap: {
      confidence: {
        layODau: { vi: 'Chọn mức tin cậy cho phép đo rủi ro.' },
        luuY: { vi: '95% là mức quen dùng; 99% cho ra con số lớn hơn và thận trọng hơn.' },
      },
      lookback: {
        layODau: { vi: 'Độ dài cửa sổ quan sát, tính lùi từ phiên mới nhất.' },
        luuY: { vi: '250 phiên là khoảng một năm. Nếu cửa sổ quá ngắn thì kết quả nhảy liên tục.' },
      },
    },
    docKetQua: {
      vi: 'Số dương nghĩa là mất: 2,5 nghĩa là lỗ 2,5% trong phiên tệ. Số càng lớn càng rủi ro.',
    },
    deSai: {
      vi: 'Hiểu ngược dấu; đây là chỗ hay nhầm nhất trong nhóm rủi ro.',
    },
  },

  'cvar-lich-su': {
    deLamGi: {
      vi: 'Biết khi đã rơi vào nhóm phiên tệ nhất thì mức lỗ trung bình là bao nhiêu.',
    },
    oNhap: {
      confidence: {
        layODau: { vi: 'Chọn mức tin cậy cho phép đo rủi ro.' },
        luuY: { vi: '95% là mức quen dùng; 99% cho ra con số lớn hơn và thận trọng hơn.' },
      },
      lookback: {
        layODau: { vi: 'Độ dài cửa sổ quan sát, tính lùi từ phiên mới nhất.' },
        luuY: { vi: '250 phiên là khoảng một năm. Nếu cửa sổ quá ngắn thì kết quả nhảy liên tục.' },
      },
    },
    docKetQua: {
      vi: 'Cùng quy ước với VaR, số dương là mất. CVaR luôn lớn hơn hoặc bằng VaR cùng độ tin cậy.',
    },
    deSai: {
      vi: 'Dùng CVaR thay VaR mà quên rằng nó luôn lớn hơn, rồi tưởng rủi ro tăng.',
    },
  },

  'do-lech-chuan-loi-suat-phien': {
    deLamGi: {
      vi: 'Biết giá nhảy mạnh đến đâu giữa các phiên.',
    },
    oNhap: {
      sessions: {
        layODau: { vi: 'Số phiên gần nhất đưa vào phép tính.' },
        luuY: { vi: '60 phiên là khoảng ba tháng.' },
      },
    },
    docKetQua: {
      vi: 'Số càng lớn giá càng nhảy mạnh. Khoảng hai phần ba số phiên nằm trong cộng trừ một lần con số này.',
    },
    deSai: {
      vi: 'So độ lệch chuẩn theo phiên với độ biến động năm hoá; hai đơn vị khác nhau.',
    },
  },

  'do-bien-dong-nam-hoa': {
    deLamGi: {
      vi: 'Quy mức dao động theo phiên về mức dao động của cả một năm.',
    },
    oNhap: {
      sessions: {
        layODau: { vi: 'Số phiên gần nhất đưa vào phép tính.' },
        luuY: { vi: '60 phiên là khoảng ba tháng.' },
      },
      tradingDays: {
        layODau: { vi: 'Số phiên thị trường mở cửa trong một năm.' },
        luuY: { vi: 'Việt Nam khoảng 250 phiên. Không dùng 365 ngày.' },
      },
    },
    docKetQua: {
      vi: '22%/năm nghĩa là trong một năm bình thường, giá có thể lệch khoảng 22% so với mức trung bình.',
    },
    deSai: {
      vi: 'Đổi số phiên một năm thành 365; thị trường chỉ giao dịch khoảng 250 phiên.',
    },
  },

  'do-lech-chuan-ban-phan': {
    deLamGi: {
      vi: 'Đo riêng phần dao động xuống, bỏ qua phần tăng giá.',
    },
    oNhap: {
      sessions: {
        layODau: { vi: 'Số phiên gần nhất đưa vào phép tính.' },
        luuY: { vi: '60 phiên là khoảng ba tháng.' },
      },
      threshold: {
        layODau: { vi: 'Mốc để tính phần dao động xuống.' },
        luuY: { vi: 'Để 0% nếu chỉ muốn tính các phiên giảm giá.' },
      },
    },
    docKetQua: {
      vi: 'Thường nhỏ hơn hoặc bằng độ lệch chuẩn đầy đủ vì đã bỏ hết phần tăng giá.',
    },
    deSai: {
      vi: 'Đặt ngưỡng cao rồi quên, làm con số phồng lên mà không hiểu vì sao.',
    },
  },

  'he-so-bien-thien': {
    deLamGi: {
      vi: 'Biết mỗi đơn vị lợi suất phải đổi bằng bao nhiêu đơn vị dao động.',
    },
    oNhap: {
      sessions: {
        layODau: { vi: 'Số phiên gần nhất đưa vào phép tính.' },
        luuY: { vi: '60 phiên là khoảng ba tháng.' },
      },
    },
    docKetQua: {
      vi: '3,3 lần nghĩa là mỗi 1% lợi suất bình quân một phiên phải đổi bằng 3,3% dao động. Càng nhỏ càng tốt.',
    },
    deSai: {
      vi: 'Dùng khi lợi suất bình quân âm; lúc đó con số mất ý nghĩa.',
    },
  },

  'bien-do-dao-dong-lon-nhat': {
    deLamGi: {
      vi: 'Biết trong kỳ, từ đáy lên đỉnh giá đã đi bao xa.',
    },
    oNhap: {
      sessions: {
        layODau: { vi: 'Độ dài kỳ quan sát tính bằng phiên.' },
        luuY: { vi: '60 phiên là khoảng ba tháng.' },
      },
    },
    docKetQua: {
      vi: 'Tính theo đáy làm gốc: 8,25% nghĩa là đỉnh cao hơn đáy 8,25%.',
    },
    deSai: {
      vi: 'Đọc như mức lãi có thể đạt được; không ai mua đúng đáy bán đúng đỉnh.',
    },
  },

  'chuoi-phien-giam-dai-nhat': {
    deLamGi: {
      vi: 'Biết giá đã từng giảm liên tiếp bao nhiêu phiên không nghỉ.',
    },
    oNhap: {
      sessions: {
        layODau: { vi: 'Độ dài kỳ quan sát tính bằng phiên.' },
        luuY: { vi: '60 phiên là khoảng ba tháng.' },
      },
    },
    docKetQua: {
      vi: 'Đơn vị là phiên, không phải phần trăm. Kết quả 0 nghĩa là không có phiên giảm nào trong cửa sổ.',
    },
    deSai: {
      vi: 'Suy ra mức lỗ từ số phiên; chuỗi dài chưa chắc mất nhiều nếu mỗi phiên giảm nhẹ.',
    },
  },

  beta: {
    deLamGi: {
      vi: 'Biết cổ phiếu nhạy với thị trường đến mức nào.',
    },
    oNhap: {
      sessions: {
        layODau: { vi: 'Số phiên đưa vào phép hồi quy với chỉ số thị trường.' },
        luuY: {
          vi: 'Tối thiểu 60 phiên, nên dùng 120 hoặc 250. Nếu quá ít phiên thì beta rất kém ổn định.',
        },
      },
    },
    docKetQua: {
      vi: 'Trên 1 là biến động mạnh hơn thị trường, giữa 0 và 1 là yếu hơn, vùng của các ngành phòng thủ.',
    },
    deSai: {
      vi: 'Lấy quá ít phiên; beta tính trên vài chục phiên rất kém ổn định.',
    },
  },

  'ty-so-sharpe': {
    deLamGi: {
      vi: 'Biết mỗi đơn vị rủi ro đổi được bao nhiêu lợi suất vượt mức phi rủi ro.',
    },
    oNhap: {
      riskFree: {
        layODau: { vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm.' },
        luuY: { vi: 'Dùng cùng một mức cho mọi công thức rủi ro để so sánh với nhau.' },
      },
      sessionsPerYear: {
        layODau: { vi: 'Số phiên thị trường mở cửa trong một năm, dùng để quy năm.' },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Giữ nguyên số liệu cho mọi tỷ số để so sánh với nhau.',
        },
      },
    },
    docKetQua: {
      vi: 'Dưới 1 là bình thường, quanh 1 là khá, trên 2 là rất tốt nhưng phải nghi ngờ mẫu quá ngắn.',
    },
    deSai: {
      vi: 'So Sharpe của hai danh mục tính trên hai độ dài chuỗi khác nhau.',
    },
  },

  'ty-so-sortino': {
    deLamGi: {
      vi: 'Giống Sharpe nhưng chỉ phạt phần dao động xuống, không phạt phần tăng giá.',
    },
    oNhap: {
      riskFree: {
        layODau: { vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm.' },
        luuY: { vi: 'Dùng cùng một mức cho mọi công thức rủi ro để so sánh với nhau.' },
      },
      sessionsPerYear: {
        layODau: { vi: 'Số phiên thị trường mở cửa trong một năm, dùng để quy năm.' },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Giữ nguyên số liệu cho mọi tỷ số để so sánh với nhau.',
        },
      },
    },
    docKetQua: {
      vi: 'Cùng thang với Sharpe: quanh 1 là khá, trên 2 là tốt, âm nghĩa là còn thua ngưỡng phi rủi ro.',
    },
    deSai: {
      vi: 'Đọc Sortino và Sharpe như hai số thay thế nhau; Sortino thường cao hơn một cách tự nhiên.',
    },
  },

  'ty-so-treynor': {
    deLamGi: {
      vi: 'Biết lợi suất vượt chuẩn đổi về mỗi đơn vị beta là bao nhiêu.',
    },
    oNhap: {
      riskFree: {
        layODau: { vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm.' },
        luuY: { vi: 'Dùng cùng một mức cho mọi công thức rủi ro để so sánh với nhau.' },
      },
      sessionsPerYear: {
        layODau: { vi: 'Số phiên thị trường mở cửa trong một năm, dùng để quy năm.' },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Giữ nguyên số liệu cho mọi tỷ số để so sánh với nhau.',
        },
      },
      beta: {
        layODau: { vi: 'Lấy từ công thức Beta, tính trên chính chuỗi giá của danh mục.' },
      },
    },
    docKetQua: {
      vi: 'Càng cao càng tốt, nhưng chỉ so sánh được giữa các danh mục đã đa dạng hoá tốt.',
    },
    deSai: {
      vi: 'Dùng cho một cổ phiếu đơn lẻ; Treynor giả định rủi ro riêng đã được phân tán hết.',
    },
  },

  'ty-so-thong-tin': {
    deLamGi: {
      vi: 'Biết phần thắng chuẩn có đáng với mức đi lệch khỏi chuẩn hay không.',
    },
    oNhap: {
      benchmarkReturn: {
        layODau: { vi: 'Mức tăng một năm của chỉ số dùng làm chuẩn.' },
        luuY: { vi: 'Chọn chuẩn cùng nhóm tài sản với danh mục.' },
      },
      sessionsPerYear: {
        layODau: { vi: 'Số phiên thị trường mở cửa trong một năm, dùng để quy năm.' },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Giữ nguyên số liệu cho mọi tỷ số để so sánh với nhau.',
        },
      },
    },
    docKetQua: {
      vi: 'Âm nghĩa là đi lệch khỏi chuẩn mà vẫn thua chuẩn.',
    },
    deSai: {
      vi: 'Chọn chuẩn so sánh không cùng nhóm tài sản với danh mục.',
    },
  },

  'ty-so-calmar': {
    deLamGi: {
      vi: 'So lợi suất một năm với cú sụt sâu nhất đã phải chịu.',
    },
    oNhap: {
      sessionsPerYear: {
        layODau: { vi: 'Số phiên thị trường mở cửa trong một năm, dùng để quy năm.' },
        luuY: {
          vi: 'Việt Nam khoảng 250 phiên. Giữ nguyên số liệu cho mọi tỷ số để so sánh với nhau.',
        },
      },
    },
    docKetQua: {
      vi: 'Trên 1 nghĩa là lãi một năm đã lớn hơn cú sụt sâu nhất. Âm nghĩa là cả giai đoạn đang lỗ.',
    },
    deSai: {
      vi: 'Tính trên chuỗi quá ngắn chưa chứa cú sụt thật, làm Calmar đẹp giả.',
    },
  },

  'ty-so-thang-thua': {
    deLamGi: {
      vi: 'Biết một phiên tăng lãi trung bình bằng bao nhiêu lần một phiên giảm lỗ.',
    },
    oNhap: {
      threshold: {
        layODau: { vi: 'Mức biến động nhỏ mà bạn muốn coi như không đổi.' },
        luuY: { vi: 'Nếu để 0 thì tính mọi phiên. Đặt 0,2–0,5% để lọc phiên lặng.' },
      },
    },
    docKetQua: {
      vi: '0,87 lần nghĩa là mỗi phiên tăng lãi trung bình chỉ bằng 0,87 lần mức lỗ của một phiên giảm.',
    },
    deSai: {
      vi: 'Đọc thành tỷ lệ số phiên thắng trên số phiên thua; đây là tỷ số về biên độ, không phải tần suất.',
    },
  },

  /* ── Phân tích kỹ thuật — 18 công thức ───────────────────────────────────────────────────── */

  'sma-n-phien': {
    deLamGi: {
      vi: 'Làm mượt giá để nhìn ra xu hướng thay vì nhiễu từng phiên.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên của đường trung bình.' },
        luuY: { vi: '20 phiên cho ngắn hạn, 50 trung hạn, 200 dài hạn. RSI dùng 14 phiên.' },
      },
    },
    docKetQua: {
      vi: 'Giá nằm trên đường và đường dốc lên là xu hướng tăng; giá cắt xuống dưới là tín hiệu suy yếu.',
    },
    deSai: {
      vi: 'Dùng chu kỳ ngắn rồi than nhiều tín hiệu giả; chu kỳ càng dài càng ít nhiễu nhưng càng chậm.',
    },
  },

  'ema-n-phien': {
    deLamGi: {
      vi: 'Giống SMA nhưng phản ứng nhanh hơn với giá mới.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên của đường trung bình.' },
        luuY: { vi: '20 phiên cho ngắn hạn, 50 trung hạn, 200 dài hạn. RSI dùng 14 phiên.' },
      },
    },
    docKetQua: {
      vi: 'Là một mức giá tính bằng đồng, đọc bằng cách so với giá đóng cửa phiên cuối.',
    },
    deSai: {
      vi: 'Chờ EMA xác nhận như SMA; EMA quay đầu sớm hơn nên tín hiệu cũng nhiều hơn.',
    },
  },

  'macd-duong-chinh': {
    deLamGi: {
      vi: 'Đo đà tăng giảm bằng khoảng cách giữa hai đường EMA.',
    },
    oNhap: {
      fastPeriod: {
        layODau: { vi: 'Chu kỳ của đường trung bình ngắn trong cặp MACD.' },
        luuY: { vi: '12 là mặc định phổ biến. Phải nhỏ hơn chu kỳ chậm.' },
      },
      slowPeriod: {
        layODau: { vi: 'Chu kỳ của đường trung bình dài trong cặp MACD.' },
        luuY: { vi: '26 là mặc định phổ biến.' },
      },
    },
    docKetQua: {
      vi: 'Cắt lên trên 0 là đà chuyển sang tăng, cắt xuống dưới 0 là chuyển sang giảm.',
    },
    deSai: {
      vi: 'So giá trị MACD giữa hai mã khác nhau; con số tính bằng đồng nên chỉ so sánh được với chính mã đó.',
    },
  },

  'macd-duong-tin-hieu': {
    deLamGi: {
      vi: 'Có một đường mượt hơn để đối chiếu với MACD, lọc bớt tín hiệu giả.',
    },
    oNhap: {
      fastPeriod: {
        layODau: { vi: 'Chu kỳ của đường trung bình ngắn trong cặp MACD.' },
        luuY: { vi: '12 là mặc định phổ biến. Phải nhỏ hơn chu kỳ chậm.' },
      },
      slowPeriod: {
        layODau: { vi: 'Chu kỳ của đường trung bình dài trong cặp MACD.' },
        luuY: { vi: '26 là mặc định phổ biến.' },
      },
      signalPeriod: {
        layODau: { vi: 'Số phiên làm mượt đường MACD.' },
        luuY: { vi: '9 là mặc định phổ biến.' },
      },
    },
    docKetQua: {
      vi: 'MACD nằm trên đường tín hiệu là đà đang mạnh lên, nằm dưới là đang yếu đi.',
    },
    deSai: {
      vi: 'Đọc đường tín hiệu một mình; nó chỉ có nghĩa khi đặt cạnh MACD.',
    },
  },

  'rsi-wilder': {
    deLamGi: {
      vi: 'Đo sức mạnh tương đối của phe mua so với phe bán.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên của đường trung bình.' },
        luuY: { vi: '20 phiên cho ngắn hạn, 50 trung hạn, 200 dài hạn. RSI dùng 14 phiên.' },
      },
    },
    docKetQua: {
      vi: 'Trên 70 là vùng quá mua, dưới 30 là quá bán, quanh 50 là cân bằng.',
    },
    deSai: {
      vi: 'Bán ngay khi RSI vượt 70; trong xu hướng tăng mạnh RSI có thể ở vùng cao rất lâu.',
    },
  },

  'roc-toc-do-thay-doi': {
    deLamGi: {
      vi: 'Biết giá hôm nay cao hơn hay thấp hơn n phiên trước bao nhiêu phần trăm.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên lùi về trước để so với giá hôm nay.' },
        luuY: { vi: 'Tránh chọn đúng phiên có sự kiện bất thường như chia tách.' },
      },
    },
    docKetQua: {
      vi: 'Dương là cao hơn n phiên trước, âm là thấp hơn. Tính bằng % nên so ngang giữa các mã được.',
    },
    deSai: {
      vi: 'Chọn số phiên nhìn lại rơi đúng vào một cú sốc giá, làm con số méo.',
    },
  },

  'dong-luong-momentum': {
    deLamGi: {
      vi: 'Đo sức của xu hướng bằng mức chênh giá tuyệt đối.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên lùi về trước để so với giá hôm nay.' },
        luuY: { vi: 'Tránh chọn đúng phiên có sự kiện bất thường như chia tách.' },
      },
    },
    docKetQua: {
      vi: 'Dấu cho biết chiều, độ lớn cho biết sức. Động lượng thu hẹp trong khi giá vẫn tạo đỉnh mới là dấu hiệu xu hướng đang đuối.',
    },
    deSai: {
      vi: 'So động lượng giữa hai mã khác thị giá; đơn vị là đồng nên không so ngang được, cần dùng ROC.',
    },
  },

  'khoang-cach-gia-so-sma': {
    deLamGi: {
      vi: 'Biết giá đang xa đường trung bình bao nhiêu phần trăm.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Chu kỳ của đường trung bình để đo khoảng cách.' },
        luuY: { vi: '20 hoặc 50 là hai mức quen dùng.' },
      },
    },
    docKetQua: {
      vi: 'Dương là giá nằm trên đường, âm là nằm dưới. Càng xa 0 càng căng.',
    },
    deSai: {
      vi: 'Đặt một ngưỡng chung cho mọi mã; ngưỡng căng tuỳ độ biến động từng cổ phiếu.',
    },
  },

  'giao-cat-hai-duong-ma': {
    deLamGi: {
      vi: 'Theo dõi tín hiệu cắt nhau của đường ngắn và đường dài.',
    },
    oNhap: {
      shortPeriod: {
        layODau: { vi: 'Chu kỳ của đường trung bình nhanh hơn.' },
        luuY: { vi: 'Đặt quá gần đường dài sẽ làm tín hiệu cắt xảy ra liên tục.' },
      },
      longPeriod: {
        layODau: { vi: 'Chu kỳ của đường trung bình chậm hơn.' },
        luuY: { vi: 'Cặp 50 và 200 là cặp quen dùng để tìm tín hiệu cắt.' },
      },
    },
    docKetQua: {
      vi: 'Dương là đường ngắn đang nằm trên đường dài, âm là nằm dưới.',
    },
    deSai: {
      vi: 'Đặt hai chu kỳ quá gần nhau, làm tín hiệu cắt xảy ra liên tục và mất ý nghĩa.',
    },
  },

  'dai-bollinger-tren': {
    deLamGi: {
      vi: 'Biết mép trên của vùng dao động quen thuộc đang ở mức giá nào.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên tính trung bình và độ lệch chuẩn cho dải.' },
        luuY: { vi: '20 là mặc định phổ biến.' },
      },
      k: {
        layODau: { vi: 'Số lần độ lệch chuẩn để vẽ dải rộng hay hẹp.' },
        luuY: { vi: '2 là mặc định phổ biến. Nếu tăng lên 2,5 thì dải rộng ra và ít bị chạm hơn.' },
      },
    },
    docKetQua: {
      vi: 'Giá chạm hoặc vượt dải trên nghĩa là đang ở mép trên vùng dao động quen thuộc.',
    },
    deSai: {
      vi: 'Coi chạm dải trên là tín hiệu bán; trong xu hướng tăng mạnh giá có thể bám dải trên rất lâu.',
    },
  },

  'dai-bollinger-duoi': {
    deLamGi: {
      vi: 'Biết mép dưới của vùng dao động quen thuộc đang ở mức giá nào.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên tính trung bình và độ lệch chuẩn cho dải.' },
        luuY: { vi: '20 là mặc định phổ biến.' },
      },
      k: {
        layODau: { vi: 'Số lần độ lệch chuẩn để vẽ dải rộng hay hẹp.' },
        luuY: { vi: '2 là mặc định phổ biến. Nếu tăng lên 2,5 thì dải rộng ra và ít bị chạm hơn.' },
      },
    },
    docKetQua: {
      vi: 'Giá thủng dải dưới nghĩa là đang ở mép dưới vùng dao động quen thuộc.',
    },
    deSai: {
      vi: 'Coi thủng dải dưới là tín hiệu mua; trong xu hướng giảm giá có thể bám dải dưới suốt chặng.',
    },
  },

  'do-rong-dai-bollinger': {
    deLamGi: {
      vi: 'Biết giá đang lặng hay đang động so với chính nó trước đây.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên tính trung bình và độ lệch chuẩn cho dải.' },
        luuY: { vi: '20 là mặc định phổ biến.' },
      },
      k: {
        layODau: { vi: 'Số lần độ lệch chuẩn để vẽ dải rộng hay hẹp.' },
        luuY: { vi: '2 là mặc định phổ biến. Nếu tăng lên 2,5 thì dải rộng ra và ít bị chạm hơn.' },
      },
    },
    docKetQua: {
      vi: 'Càng nhỏ thì giá càng lặng. So với chính mã đó vài tháng trước mới có nghĩa.',
    },
    deSai: {
      vi: 'So độ rộng giữa hai mã; không có ngưỡng chung cho mọi cổ phiếu.',
    },
  },

  'atr-dao-dong-thuc': {
    deLamGi: {
      vi: 'Biết một phiên bình thường giá đi bao nhiêu đồng, để đặt cắt lỗ cho vừa.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên lấy trung bình biên độ.' },
        luuY: { vi: '14 là chuẩn Wilder.' },
      },
    },
    docKetQua: {
      vi: 'Là số tiền của một phiên, không phải phần trăm và không có hướng.',
    },
    deSai: {
      vi: 'Đọc ATR cao thành giá sắp tăng; ATR chỉ nói biên độ rộng, không nói chiều.',
    },
  },

  'phan-tram-b-bollinger': {
    deLamGi: {
      vi: 'Biết giá đang nằm ở đâu trong dải, tính bằng phần trăm thay vì bằng đồng.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên tính trung bình và độ lệch chuẩn cho dải.' },
        luuY: { vi: '20 là mặc định phổ biến.' },
      },
      k: {
        layODau: { vi: 'Số lần độ lệch chuẩn để vẽ dải rộng hay hẹp.' },
        luuY: { vi: '2 là mặc định phổ biến. Nếu tăng lên 2,5 thì dải rộng ra và ít bị chạm hơn.' },
      },
    },
    docKetQua: {
      vi: 'Trên 100% là đã vượt hẳn dải trên, dưới 0% là đã thủng dải dưới. Hai trạng thái này bình thường, không phải lỗi.',
    },
    deSai: {
      vi: 'Tưởng giá trị ngoài khoảng 0 đến 100% là sai số liệu.',
    },
  },

  'stochastic-k': {
    deLamGi: {
      vi: 'Biết giá đóng cửa đang nằm sát đỉnh hay sát đáy của n phiên gần nhất.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên lấy đỉnh và đáy để so với giá đóng cửa.' },
        luuY: { vi: '14 là mặc định phổ biến.' },
      },
    },
    docKetQua: {
      vi: 'Trên 80% là đóng cửa sát đỉnh của n phiên, dưới 20% là sát đáy.',
    },
    deSai: {
      vi: 'Coi 80 và 20 là ngưỡng mua bán cứng; đó là hai mốc quy ước phổ biến, không phải quy tắc.',
    },
  },

  vwap: {
    deLamGi: {
      vi: 'Biết giá bình quân mà toàn thị trường đã mua trong kỳ, có tính trọng số khối lượng.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên gộp lại để tính giá bình quân theo khối lượng.' },
        luuY: { vi: '20 phiên là khoảng một tháng giao dịch.' },
      },
    },
    docKetQua: {
      vi: 'Giá hiện tại trên VWAP nghĩa là người mua bình quân của kỳ đang lãi, nếu dưới VWAP thì đang lỗ.',
    },
    deSai: {
      vi: 'Suy ra tình trạng của từng nhà đầu tư; đây chỉ là bình quân của cả kỳ.',
    },
  },

  'do-bien-dong-lich-su': {
    deLamGi: {
      vi: 'Đo mức dao động của giá trong một năm dựa trên lịch sử đã có.',
    },
    oNhap: {
      sample: {
        layODau: { vi: 'Số phiên gần nhất lấy để đo biến động.' },
        luuY: { vi: '60 phiên là khoảng ba tháng, đủ ổn định mà vẫn bám tình hình hiện tại.' },
      },
      tradingDays: {
        layODau: { vi: 'Số phiên thị trường mở cửa trong một năm.' },
        luuY: { vi: 'Việt Nam khoảng 250 phiên. Không dùng 365 ngày.' },
      },
    },
    docKetQua: {
      vi: '40%/năm nghĩa là trong khoảng hai phần ba số năm, lợi suất một năm lệch không quá 40% quanh mức trung bình.',
    },
    deSai: {
      vi: 'Dùng số quá khứ làm dự báo tương lai; biến động thay đổi theo giai đoạn thị trường.',
    },
  },

  'ty-le-khoi-luong': {
    deLamGi: {
      vi: 'Biết phiên hôm nay giao dịch sôi động gấp bao nhiêu lần bình thường.',
    },
    oNhap: {
      period: {
        layODau: { vi: 'Số phiên lấy trung bình khối lượng để làm mốc so sánh.' },
        luuY: { vi: '20 phiên là mốc quen dùng.' },
      },
    },
    docKetQua: {
      vi: 'Bằng 1 lần là đúng mức trung bình, 2 lần là gấp đôi.',
    },
    deSai: {
      vi: 'Coi khối lượng đột biến là tín hiệu tốt; chỉ số này không có hướng, đột biến đi kèm giá giảm mạnh là điều khác hẳn.',
    },
  },

  /* ── Phái sinh — 7 công thức ─────────────────────────────────────────────────────────────── */

  'gia-ly-thuyet-vn30f': {
    deLamGi: {
      vi: 'Biết hợp đồng tương lai đáng giá bao nhiêu điểm theo lý thuyết, để đối chiếu với giá thị trường.',
    },
    oNhap: {
      indexValue: {
        layODau: { vi: 'Giá trị chỉ số VN30 trên bảng giá, lấy cùng thời điểm với giá hợp đồng.' },
      },
      riskFreeRate: {
        layODau: { vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm.' },
        luuY: { vi: 'Dùng cùng một mức cho mọi công thức rủi ro để so sánh với nhau.' },
      },
      dividendYield: {
        layODau: { vi: 'Số liệu rổ VN30 trên bản tin HOSE hoặc trang dữ liệu chỉ số.' },
        luuY: { vi: 'Thường 1,5–2,5%/năm.' },
      },
      days: {
        layODau: { vi: 'Đếm theo ngày lịch tới ngày đáo hạn hợp đồng, xem lịch HNX.' },
        luuY: { vi: 'Hợp đồng VN30F đáo hạn thứ Năm thứ ba của tháng.' },
      },
    },
    docKetQua: {
      vi: 'Giá thị trường cao hơn giá lý thuyết đáng kể là thị trường đang hưng phấn; thấp hơn nhiều là đang bi quan.',
    },
    deSai: {
      vi: 'Đếm số ngày đến đáo hạn theo ngày giao dịch; ô này nhận ngày lịch.',
    },
  },

  'basis-vn30f': {
    deLamGi: {
      vi: 'Biết hợp đồng tương lai đang cao hơn hay thấp hơn chỉ số cơ sở bao nhiêu điểm.',
    },
    oNhap: {
      futuresPoints: {
        layODau: { vi: 'Giá khớp của hợp đồng VN30F trên bảng giá phái sinh.' },
        luuY: { vi: 'Lấy cùng thời điểm với chỉ số cơ sở.' },
      },
      indexValue: {
        layODau: { vi: 'Giá trị chỉ số VN30 trên bảng giá, lấy cùng thời điểm với giá hợp đồng.' },
      },
    },
    docKetQua: {
      vi: 'Dương là hợp đồng cao hơn chỉ số, âm là thấp hơn.',
    },
    deSai: {
      vi: 'Đọc mọi basis dương thành kỳ vọng tăng; một phần mức đó chỉ là chi phí nắm giữ hợp lý.',
    },
  },

  'lai-lo-vi-the-long': {
    deLamGi: {
      vi: 'Biết vị thế mua đang lãi hay lỗ bao nhiêu tiền.',
    },
    oNhap: {
      entryPoints: {
        layODau: { vi: 'Giá khớp khi bạn mở vị thế.' },
      },
      exitPoints: {
        layODau: { vi: 'Giá khớp khi đóng, hoặc giá hiện tại nếu vị thế còn mở.' },
      },
      contracts: {
        layODau: { vi: 'Số hợp đồng tương lai đang giữ hoặc định mở.' },
      },
    },
    docKetQua: {
      vi: 'Điểm đóng cao hơn điểm mở là lãi, thấp hơn là lỗ.',
    },
    deSai: {
      vi: 'Quên rằng lãi lỗ được thanh toán bù trừ hằng ngày, không đợi tới lúc đóng vị thế.',
    },
  },

  'lai-lo-vi-the-short': {
    deLamGi: {
      vi: 'Biết vị thế bán đang lãi hay lỗ bao nhiêu tiền.',
    },
    oNhap: {
      entryPoints: {
        layODau: { vi: 'Giá khớp khi bạn mở vị thế.' },
      },
      exitPoints: {
        layODau: { vi: 'Giá khớp khi đóng, hoặc giá hiện tại nếu vị thế còn mở.' },
      },
      contracts: {
        layODau: { vi: 'Số hợp đồng tương lai đang giữ hoặc định mở.' },
      },
    },
    docKetQua: {
      vi: 'Điểm đóng thấp hơn điểm mở là lãi, cao hơn là lỗ, ngược chiều hoàn toàn với Long.',
    },
    deSai: {
      vi: 'Dùng nhầm công thức Long cho vị thế bán, ra kết quả ngược dấu.',
    },
  },

  'so-hop-dong-toi-da': {
    deLamGi: {
      vi: 'Biết với số vốn ký quỹ hiện có thì mở được tối đa bao nhiêu hợp đồng.',
    },
    oNhap: {
      capital: {
        layODau: { vi: 'Số tiền ký quỹ đang có trong tài khoản phái sinh.' },
      },
      futuresPoints: {
        layODau: { vi: 'Giá hợp đồng VN30F trên bảng giá phái sinh.' },
      },
      marginRatio: {
        layODau: { vi: 'Quy định của công ty chứng khoán nơi bạn mở tài khoản phái sinh.' },
        luuY: { vi: 'Thị trường Việt Nam thường 17–20%, có thể nâng khi biến động mạnh.' },
      },
    },
    docKetQua: {
      vi: 'Làm tròn xuống số nguyên. Ra 0 nghĩa là vốn chưa đủ ký quỹ cho dù chỉ một hợp đồng.',
    },
    deSai: {
      vi: 'Mở kín trần; chỉ cần một nhịp ngược chiều là có lệnh gọi ký quỹ.',
    },
  },

  'co-vi-the-phai-sinh': {
    deLamGi: {
      vi: 'Biết mở bao nhiêu hợp đồng để nếu chạm cắt lỗ thì chỉ mất đúng phần vốn đã định.',
    },
    oNhap: {
      capital: {
        layODau: { vi: 'Tổng vốn trong tài khoản phái sinh.' },
      },
      riskPercent: {
        layODau: { vi: 'Phần vốn bạn chấp nhận mất nếu lệnh này chạm cắt lỗ.' },
        luuY: { vi: '1–2% là mức quản trị rủi ro thông dụng. Trên 5% là rất mạo hiểm.' },
      },
      stopPoints: {
        layODau: { vi: 'Số điểm từ giá vào lệnh tới mức thoát lệnh.' },
        luuY: { vi: 'Đặt quá hẹp sẽ ra 0 hợp đồng.' },
      },
    },
    docKetQua: {
      vi: 'Làm tròn xuống số nguyên hợp đồng, nên rủi ro thực luôn nhỏ hơn hoặc bằng mức đã định.',
    },
    deSai: {
      vi: 'Đặt khoảng cách cắt lỗ quá hẹp, kết quả ra 0 hợp đồng.',
    },
  },

  'don-bay-hieu-dung': {
    deLamGi: {
      vi: 'Biết giá trị vị thế đang gấp bao nhiêu lần vốn thực có trong tài khoản.',
    },
    oNhap: {
      futuresPoints: {
        layODau: { vi: 'Giá hợp đồng VN30F trên bảng giá phái sinh.' },
      },
      contracts: {
        layODau: { vi: 'Số hợp đồng tương lai đang giữ hoặc định mở.' },
      },
      equity: {
        layODau: { vi: 'Số dư thực tế trong tài khoản phái sinh, sau lãi lỗ đã bù trừ.' },
        luuY: { vi: 'Vốn giảm vì thua lỗ sẽ tự đẩy đòn bẩy lên.' },
      },
    },
    docKetQua: {
      vi: 'Càng cao thì biên an toàn trước một lệnh gọi ký quỹ càng mỏng.',
    },
    deSai: {
      vi: 'Tính một lần rồi yên tâm; vốn thực giảm vì thua lỗ sẽ tự đẩy đòn bẩy lên.',
    },
  },

  /* ── Phí & thuế thị trường Việt Nam — 8 công thức ────────────────────────────────────────── */

  'phi-giao-dich-mua': {
    deLamGi: {
      vi: 'Biết một lệnh mua bị trừ thêm bao nhiêu tiền phí.',
    },
    oNhap: {
      quantity: {
        layODau: { vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.' },
        luuY: { vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.' },
      },
      buyPrice: {
        layODau: { vi: 'Giá khớp lệnh mua của bạn.' },
      },
    },
    docKetQua: {
      vi: 'Số tiền trừ thêm ngoài tiền mua. Chia cho khối lượng để biết mỗi cổ phiếu đắt thêm bao nhiêu.',
    },
    deSai: {
      vi: 'Quên rằng đây mới là một chiều; bán ra còn một lần phí nữa.',
    },
  },

  'phi-giao-dich-ban': {
    deLamGi: {
      vi: 'Biết một lệnh bán bị trừ bao nhiêu tiền phí.',
    },
    oNhap: {
      quantity: {
        layODau: { vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.' },
        luuY: { vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.' },
      },
      sellPrice: {
        layODau: { vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.' },
      },
    },
    docKetQua: {
      vi: 'Số tiền trừ khỏi tiền bán.',
    },
    deSai: {
      vi: 'Tính phí bán mà quên thuế chuyển nhượng, vốn là khoản riêng.',
    },
  },

  'thue-chuyen-nhuong': {
    deLamGi: {
      vi: 'Biết khoản thuế bị trừ khi bán, tính trên giá trị bán chứ không trên lãi.',
    },
    oNhap: {
      quantity: {
        layODau: { vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.' },
        luuY: { vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.' },
      },
      sellPrice: {
        layODau: { vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.' },
      },
    },
    docKetQua: {
      vi: 'Khoản trừ thẳng vào tiền bán, nộp cả khi giao dịch đang lỗ.',
    },
    deSai: {
      vi: 'Tưởng rằng nếu lỗ thì không phải nộp; thuế này tính trên giá trị bán.',
    },
  },

  'thue-co-tuc': {
    deLamGi: {
      vi: 'Biết cổ tức công bố về tới tài khoản còn bao nhiêu.',
    },
    oNhap: {
      quantity: {
        layODau: { vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.' },
        luuY: { vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.' },
      },
      dividendPerShare: {
        layODau: { vi: 'Cổ tức tiền mặt theo nghị quyết chi trả.' },
      },
    },
    docKetQua: {
      vi: 'Phần cổ tức bị giữ lại. Lấy cổ tức công bố trừ số này ra tiền thực nhận.',
    },
    deSai: {
      vi: 'Dùng tỷ suất cổ tức công bố để tính thu nhập thật mà quên khoản thuế này.',
    },
  },

  'phi-luu-ky': {
    deLamGi: {
      vi: 'Biết giữ cổ phiếu trong kho lưu ký tốn bao nhiêu tiền theo thời gian.',
    },
    oNhap: {
      quantity: {
        layODau: { vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.' },
        luuY: { vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.' },
      },
      months: {
        layODau: { vi: 'Số tháng đã giữ hoặc dự định giữ cổ phiếu.' },
        luuY: { vi: 'Dùng để tính phí lưu ký cộng dồn.' },
      },
    },
    docKetQua: {
      vi: 'Tổng phí cho cả kỳ nắm giữ, không phải mỗi tháng.',
    },
    deSai: {
      vi: 'Bỏ qua vì số nhỏ; nếu giữ nhiều mã và nhiều năm thì khoản này cộng dồn đáng kể.',
    },
  },

  'gia-hoa-von': {
    deLamGi: {
      vi: 'Biết phải bán ở giá nào mới thực sự không lỗ, sau khi gánh hết phí và thuế.',
    },
    oNhap: {
      quantity: {
        layODau: { vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.' },
        luuY: { vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.' },
      },
      months: {
        layODau: { vi: 'Số tháng đã giữ hoặc dự định giữ cổ phiếu.' },
        luuY: { vi: 'Dùng để tính phí lưu ký cộng dồn.' },
      },
      buyPrice: {
        layODau: { vi: 'Giá khớp lệnh mua của bạn.' },
      },
    },
    docKetQua: {
      vi: 'Luôn cao hơn giá mua, vì phải gánh cả phí mua, phí bán, thuế bán và phí lưu ký.',
    },
    deSai: {
      vi: 'Lấy giá mua làm mốc hoà vốn, bán đúng giá mua mà vẫn lỗ.',
    },
  },

  'loi-nhuan-rong': {
    deLamGi: {
      vi: 'Biết một thương vụ trọn vẹn thực sự lãi hay lỗ bao nhiêu tiền.',
    },
    oNhap: {
      quantity: {
        layODau: { vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.' },
        luuY: { vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.' },
      },
      months: {
        layODau: { vi: 'Số tháng đã giữ hoặc dự định giữ cổ phiếu.' },
        luuY: { vi: 'Dùng để tính phí lưu ký cộng dồn.' },
      },
      buyPrice: {
        layODau: { vi: 'Giá khớp lệnh mua của bạn.' },
      },
      sellPrice: {
        layODau: { vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.' },
      },
    },
    docKetQua: {
      vi: 'Luôn nhỏ hơn lãi gộp trên bảng giá; khoảng cách giữa hai con số chính là tổng chi phí.',
    },
    deSai: {
      vi: 'So con số này với lãi hiển thị trên ứng dụng môi giới rồi tưởng sai; ứng dụng thường chưa trừ hết.',
    },
  },

  'roi-rong': {
    deLamGi: {
      vi: 'Biết tỷ suất lợi nhuận thật sau khi trừ mọi chi phí.',
    },
    oNhap: {
      quantity: {
        layODau: { vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.' },
        luuY: { vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.' },
      },
      months: {
        layODau: { vi: 'Số tháng đã giữ hoặc dự định giữ cổ phiếu.' },
        luuY: { vi: 'Dùng để tính phí lưu ký cộng dồn.' },
      },
      buyPrice: {
        layODau: { vi: 'Giá khớp lệnh mua của bạn.' },
      },
      sellPrice: {
        layODau: { vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.' },
      },
    },
    docKetQua: {
      vi: 'Luôn thấp hơn tỷ suất tính trên giá thuần. Giữ càng lâu khoảng cách càng rộng vì phí lưu ký cộng dồn.',
    },
    deSai: {
      vi: 'Dùng ROI thường để đánh giá hiệu quả thật; con số này mới là con số thực nhận.',
    },
  },

  /* ── Tiết kiệm — 5 công thức ─────────────────────────────────────────────────────────────── */

  'lai-kep': {
    deLamGi: {
      vi: 'Biết một khoản gốc để yên nhiều năm sẽ thành bao nhiêu khi lãi nhập vào gốc.',
    },
    oNhap: {
      principal: {
        layODau: { vi: 'Số tiền ban đầu bạn bỏ vào.' },
      },
      rate: {
        layODau: { vi: 'Bảng lãi suất của ngân hàng hoặc hợp đồng vay.' },
        luuY: { vi: 'Vay mua nhà thường 8–12%/năm sau kỳ ưu đãi.' },
      },
      years: {
        layODau: { vi: 'Số năm bạn để tiền sinh lời.' },
      },
      perYear: {
        layODau: { vi: 'Xem hợp đồng tiền gửi, mục kỳ nhập lãi.' },
        luuY: {
          vi: 'Ghép càng dày thì tiền cuối kỳ càng nhiều, nhưng chênh lệch nhỏ ở lãi suất thấp.',
        },
      },
    },
    docKetQua: {
      vi: 'Chênh so với lãi đơn nhỏ ở vài năm đầu và rõ rệt sau mười năm.',
    },
    deSai: {
      vi: 'Chọn số lần nhập lãi không khớp với sản phẩm thật, làm kết quả lệch.',
    },
  },

  'lai-tien-gui': {
    deLamGi: {
      vi: 'Biết một sổ tiết kiệm đến hạn nhận được bao nhiêu tiền lãi.',
    },
    oNhap: {
      principal: {
        layODau: { vi: 'Số tiền ghi trên sổ tiết kiệm.' },
      },
      rate: {
        layODau: { vi: 'Bảng lãi suất của ngân hàng hoặc hợp đồng vay.' },
        luuY: { vi: 'Vay mua nhà thường 8–12%/năm sau kỳ ưu đãi.' },
      },
      months: {
        layODau: { vi: 'Kỳ hạn gửi ghi trên sổ tiết kiệm.' },
      },
    },
    docKetQua: {
      vi: 'Tổng tiền lãi cho cả kỳ hạn đã chọn, không phải mức lãi suất theo năm.',
    },
    deSai: {
      vi: 'Đọc con số này như lãi một năm khi kỳ hạn chỉ 6 tháng.',
    },
  },

  'tiet-kiem-muc-tieu': {
    deLamGi: {
      vi: 'Biết mỗi tháng phải để dành bao nhiêu để đạt một số tiền mong muốn.',
    },
    oNhap: {
      target: {
        layODau: { vi: 'Số tiền muốn có vào cuối chặng.' },
      },
      rate: {
        layODau: { vi: 'Mức sinh lợi bạn tin là đạt được trong suốt chặng tiết kiệm.' },
        luuY: { vi: 'Gửi tiết kiệm 5–6%, quỹ cổ phiếu dài hạn 8–12%. Đặt cao là tự lừa mình.' },
      },
      months: {
        layODau: { vi: 'Số tháng từ nay tới lúc cần đạt mục tiêu.' },
        luuY: { vi: 'Kéo dài thời gian làm khoản góp mỗi tháng nhẹ đi rất nhanh.' },
      },
    },
    docKetQua: {
      vi: 'Số tiền phải gửi đều mỗi tháng.',
    },
    deSai: {
      vi: 'Nâng lãi suất kỳ vọng để khoản góp nhẹ đi; kéo dài thời gian hiệu quả hơn nhiều và chắc chắn hơn.',
    },
  },

  'rut-truoc-han': {
    deLamGi: {
      vi: 'Biết nếu rút sổ trước hạn thì mất bao nhiêu tiền lãi.',
    },
    oNhap: {
      principal: {
        layODau: { vi: 'Số tiền ghi trên sổ tiết kiệm.' },
      },
      contractRate: {
        layODau: { vi: 'Lãi suất ghi trên sổ tiết kiệm cho đúng kỳ hạn đã chọn.' },
      },
      termMonths: {
        layODau: { vi: 'Kỳ hạn ghi trên sổ tiết kiệm, không phải số tháng đã gửi.' },
      },
      monthsHeld: {
        layODau: { vi: 'Số tháng thực tế đã gửi tính tới ngày rút.' },
        luuY: { vi: 'Phải nhỏ hơn kỳ hạn hợp đồng, nếu không thì không phải rút trước hạn.' },
      },
      demandRate: {
        layODau: { vi: 'Xem hợp đồng tiền gửi, điều khoản rút trước hạn.' },
        luuY: { vi: 'Phần lớn ngân hàng để 0,1–0,5%/năm.' },
      },
    },
    docKetQua: {
      vi: 'Số tiền lãi thực nhận, tính theo lãi suất không kỳ hạn cho số tháng đã gửi.',
    },
    deSai: {
      vi: 'Tưởng được hưởng lãi suất hợp đồng cho phần thời gian đã gửi.',
    },
  },

  'gui-quay-vong': {
    deLamGi: {
      vi: 'So hai cách gửi để biết cách nào được nhiều tiền hơn.',
    },
    oNhap: {
      principal: {
        layODau: { vi: 'Số tiền ghi trên sổ tiết kiệm.' },
      },
      shortRate: {
        layODau: { vi: 'Bảng lãi suất, dòng kỳ hạn ngắn dự định quay vòng.' },
        luuY: { vi: 'Mức này có thể thay đổi ở mỗi lần quay vòng.' },
      },
      shortMonths: {
        layODau: { vi: 'Kỳ hạn của sổ ngắn dự định quay vòng liên tục.' },
        luuY: { vi: '3 hoặc 6 tháng là hai lựa chọn quen dùng.' },
      },
      longRate: {
        layODau: { vi: 'Bảng lãi suất, dòng kỳ hạn dài đang cân nhắc.' },
      },
      totalMonths: {
        layODau: { vi: 'Tổng số tháng dự định để tiền trong ngân hàng.' },
        luuY: { vi: 'Nên là bội số của kỳ hạn ngắn để so sánh công bằng.' },
      },
    },
    docKetQua: {
      vi: 'Dương là quay vòng kỳ ngắn được nhiều hơn; âm là sổ kỳ dài thắng.',
    },
    deSai: {
      vi: 'Giả định lãi suất kỳ ngắn giữ nguyên suốt chặng; thực tế nó thay đổi ở mỗi lần quay vòng.',
    },
  },

  /* ── Vay & trả góp — 3 công thức ─────────────────────────────────────────────────────────── */

  'tra-gop-nien-kim': {
    deLamGi: {
      vi: 'Biết mỗi tháng phải trả bao nhiêu khi khoản trả cố định suốt kỳ vay.',
    },
    oNhap: {
      amount: {
        layODau: { vi: 'Số tiền giải ngân ghi trên hợp đồng vay.' },
      },
      rate: {
        layODau: { vi: 'Bảng lãi suất của ngân hàng hoặc hợp đồng vay.' },
        luuY: { vi: 'Vay mua nhà thường 8–12%/năm sau kỳ ưu đãi.' },
      },
      years: {
        layODau: { vi: 'Thời hạn vay ghi trên hợp đồng.' },
      },
    },
    docKetQua: {
      vi: 'Con số giữ nguyên suốt toàn bộ kỳ vay; so với thu nhập để biết có đủ khả năng chi trả không.',
    },
    deSai: {
      vi: 'Quên rằng lãi suất thả nổi sau kỳ ưu đãi sẽ làm khoản trả thay đổi.',
    },
  },

  'tra-gop-goc-deu': {
    deLamGi: {
      vi: 'Biết khoản trả kỳ đầu khi gốc chia đều còn lãi giảm dần.',
    },
    oNhap: {
      amount: {
        layODau: { vi: 'Số tiền giải ngân ghi trên hợp đồng vay.' },
      },
      rate: {
        layODau: { vi: 'Bảng lãi suất của ngân hàng hoặc hợp đồng vay.' },
        luuY: { vi: 'Vay mua nhà thường 8–12%/năm sau kỳ ưu đãi.' },
      },
      years: {
        layODau: { vi: 'Thời hạn vay ghi trên hợp đồng.' },
      },
    },
    docKetQua: {
      vi: 'Kỳ đầu nặng nhất, đây là con số cần cân đối với thu nhập hằng tháng.',
    },
    deSai: {
      vi: 'So khoản trả kỳ đầu của gốc đều với khoản trả cố định của niên kim rồi kết luận gốc đều đắt hơn.',
    },
  },

  'lich-tra-no': {
    deLamGi: {
      vi: 'Xem toàn bộ lịch trả từng kỳ và tổng lãi phải trả của cả khoản vay.',
    },
    oNhap: {
      amount: {
        layODau: { vi: 'Số tiền giải ngân ghi trên hợp đồng vay.' },
      },
      rate: {
        layODau: { vi: 'Bảng lãi suất của ngân hàng hoặc hợp đồng vay.' },
        luuY: { vi: 'Vay mua nhà thường 8–12%/năm sau kỳ ưu đãi.' },
      },
      years: {
        layODau: { vi: 'Thời hạn vay ghi trên hợp đồng.' },
      },
      method: {
        layODau: { vi: 'Chọn cách trả nợ của hợp đồng vay.' },
        luuY: {
          vi: 'Niên kim: trả cố định mỗi tháng. Gốc đều: gốc chia đều, lãi giảm dần, kỳ đầu nặng nhất.',
        },
      },
    },
    docKetQua: {
      vi: 'Với cùng lãi suất và kỳ hạn, gốc đều không bao giờ cho tổng lãi cao hơn niên kim.',
    },
    deSai: {
      vi: 'Chọn theo tổng lãi mà bỏ qua dòng tiền; gốc đều rẻ hơn nhưng nặng ở những kỳ đầu.',
    },
  },

  /* ── Đầu tư cá nhân — 2 công thức ────────────────────────────────────────────────────────── */

  'gia-von-trung-binh-dca': {
    deLamGi: {
      vi: 'Biết giá vốn thực sau khi mua rải nhiều đợt với giá khác nhau.',
    },
    oNhap: {
      amount1: {
        layODau: { vi: 'Số tiền bạn chi ở đợt mua đầu tiên.' },
      },
      price1: {
        layODau: { vi: 'Giá khớp của đợt mua đầu tiên.' },
      },
      amount2: {
        layODau: { vi: 'Số tiền chi ở đợt thứ hai. Để 0 nếu chưa có đợt này.' },
      },
      price2: {
        layODau: { vi: 'Giá khớp của đợt mua thứ hai.' },
        luuY: { vi: 'Nếu không có đợt này thì để tiền mua bằng 0.' },
      },
      amount3: {
        layODau: { vi: 'Số tiền chi ở đợt thứ ba. Để 0 nếu chưa có đợt này.' },
      },
      price3: {
        layODau: { vi: 'Giá khớp của đợt mua thứ ba.' },
        luuY: { vi: 'Nếu không có đợt này thì để tiền mua bằng 0.' },
      },
    },
    docKetQua: {
      vi: 'So giá vốn trung bình với thị giá: thấp hơn là đang lãi, cao hơn là đang lỗ.',
    },
    deSai: {
      vi: 'Lấy trung bình cộng của ba mức giá; mua cùng số tiền ở các mức giá khác nhau cho ra kết quả khác.',
    },
  },

  'so-ky-dca': {
    deLamGi: {
      vi: 'Biết nếu góp đều mỗi tháng thì bao lâu đạt được số tiền mong muốn.',
    },
    oNhap: {
      target: {
        layODau: { vi: 'Số tiền muốn có vào cuối chặng.' },
      },
      contribution: {
        layODau: { vi: 'Số tiền bạn chắc chắn góp được đều mỗi tháng.' },
        luuY: { vi: 'Đặt mức giữ được lâu dài, không đặt mức chỉ làm được vài tháng.' },
      },
      rate: {
        layODau: { vi: 'Mức sinh lợi bạn tin là đạt được trong suốt chặng góp.' },
        luuY: { vi: 'Quỹ cổ phiếu dài hạn 8–12% là giả định đã khá lạc quan.' },
      },
    },
    docKetQua: {
      vi: 'Số tháng, đã làm tròn lên kỳ trọn vẹn gần nhất.',
    },
    deSai: {
      vi: 'Nâng lợi suất kỳ vọng để rút ngắn thời gian; tăng mức góp mới là cách chắc chắn hơn nhiều.',
    },
  },

  /* ── Tài chính doanh nghiệp — 2 công thức ────────────────────────────────────────────────── */

  'diem-hoa-von': {
    deLamGi: {
      vi: 'Biết phải bán bao nhiêu sản phẩm mới đủ bù chi phí.',
    },
    oNhap: {
      fixedCost: {
        layODau: {
          vi: 'Chi phí không đổi theo sản lượng: thuê mặt bằng, lương quản lý, khấu hao.',
        },
        luuY: { vi: 'Xếp nhầm giữa định phí và biến phí làm kết quả lệch hẳn.' },
      },
      unitPrice: {
        layODau: { vi: 'Giá bán chưa thuế của một đơn vị sản phẩm.' },
      },
      variableCost: {
        layODau: {
          vi: 'Chi phí tăng thêm khi làm thêm một sản phẩm: nguyên vật liệu, nhân công trực tiếp.',
        },
        luuY: { vi: 'Phải nhỏ hơn giá bán, nếu không thì không bao giờ hoà vốn.' },
      },
    },
    docKetQua: {
      vi: 'Điểm hoà vốn càng thấp so với sản lượng thực tế thì biên an toàn càng dày.',
    },
    deSai: {
      vi: 'Xếp nhầm chi phí giữa định phí và biến phí, làm kết quả lệch hẳn.',
    },
  },

  'don-bay-tong-hop': {
    deLamGi: {
      vi: 'Biết nếu doanh thu thay đổi 1% thì EPS thay đổi khoảng bao nhiêu phần trăm.',
    },
    oNhap: {
      revenue: {
        layODau: { vi: 'Báo cáo kết quả kinh doanh, dòng doanh thu thuần.' },
      },
      variableCost: {
        layODau: { vi: 'Tổng chi phí thay đổi theo sản lượng trong kỳ.' },
      },
      fixedCost: {
        layODau: { vi: 'Chi phí cố định của hoạt động kinh doanh trong kỳ.' },
      },
      interest: {
        layODau: { vi: 'Báo cáo kết quả kinh doanh, chi phí lãi vay của kỳ.' },
      },
    },
    docKetQua: {
      vi: 'Đòn bẩy 4 lần nghĩa là nếu doanh thu tăng 1% thì EPS tăng khoảng 4%, và nếu giảm 1% thì EPS cũng giảm 4%.',
    },
    deSai: {
      vi: 'Chỉ nhìn chiều tăng; đòn bẩy khuếch đại cả hai chiều như nhau.',
    },
  },

  /* ── Thuế thu nhập cá nhân — 1 công thức ─────────────────────────────────────────────────── */

  'thue-tncn-dau-tu': {
    deLamGi: {
      vi: 'Biết tổng thuế phải nộp cho một giao dịch, gồm cả phần bán và phần cổ tức.',
    },
    oNhap: {
      quantity: {
        layODau: { vi: 'Số cổ phiếu của lệnh hoặc của khoản nắm giữ.' },
        luuY: { vi: 'Sàn HOSE giao dịch theo lô 100 cổ phiếu.' },
      },
      sellPrice: {
        layODau: { vi: 'Giá khớp lệnh bán, hoặc giá dự định bán.' },
      },
      dividendPerShare: {
        layODau: { vi: 'Cổ tức tiền mặt theo nghị quyết chi trả.' },
      },
    },
    docKetQua: {
      vi: 'So tổng thuế với phần lãi hoặc lỗ thực tế để thấy thuế chiếm bao nhiêu trong khoản tiền nhận về.',
    },
    deSai: {
      vi: 'Tưởng rằng nếu lỗ thì không phải nộp; thuế chuyển nhượng tính trên giá trị bán, không trên lãi.',
    },
  },
};
