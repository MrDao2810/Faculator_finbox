/**
 * Tầng APPLICATION — từ điển tiếng Việt (gói WBS 1.4.1).
 *
 * Tiếng Việt là ngôn ngữ gốc: mọi key đều phải có ở đây, và `MessageKey` sinh ra từ chính
 * object này nên thêm key mà quên viết bản Việt là hỏng lúc typecheck.
 *
 * FR-21 (chuyển VI/EN) xếp ở v1.0. Đợt này chỉ dựng khung, chưa dịch.
 */

import { DISCLAIMER_VI } from '@/core/disclaimer';

export const vi = {
  /* Tên đầy đủ — dùng cho tiêu đề tài liệu trong `layout.tsx`, không hiện trên thanh trên. */
  'app.name': 'Faculator Finbox',
  /* Tên gọn hiện cạnh logo trên thanh trên — bản thiết kế chỉ ghi "Faculator". */
  'app.brand': 'Faculator',

  // Điều hướng — WF-18 chốt thanh nav dưới có 4 mục
  'nav.primary': 'Điều hướng chính',
  'nav.skipToContent': 'Bỏ qua điều hướng, tới nội dung',
  'nav.home': 'Trang chủ',
  'nav.formulas': 'Công thức',
  'nav.portfolio': 'Danh mục',
  'nav.settings': 'Cài đặt',
  /*
   * Nhãn nút quay lại của các màn trong. CỐ Ý khác `nav.formulas`: màn chi tiết đã có tiêu đề
   * khối "Công thức" cho phần biểu thức, nên dùng lại đúng chữ ấy cho nút quay lại là hai thứ
   * khác nhau mang cùng một tên trên cùng một màn — người dùng lẫn trình đọc màn hình đều rối.
   */
  'nav.backToList': 'Danh sách công thức',
  /** Nhãn nút quay lại khi `/du-lieu/` biết mình được mở từ đúng công thức nào (tham số `from`). */
  'nav.backToFormula': 'Quay lại công thức',

  // Chế độ hiển thị — FR-09
  'mode.label': 'Chế độ hiển thị',
  'mode.basic': 'Cơ bản',
  'mode.advanced': 'Nâng cao',

  // Bảng màu giao diện
  'theme.label': 'Giao diện',
  'theme.light': 'Sáng',
  'theme.dark': 'Tối',
  /* Nhãn cho nút icon trên thanh trên: icon nói đang ở đâu, hai câu này nói bấm vào thì gì xảy
     ra — cùng cách `lang.switchTo*` làm cho nút ngôn ngữ. */
  'theme.switchToDark': 'Chuyển sang giao diện tối',
  'theme.switchToLight': 'Chuyển sang giao diện sáng',

  // Ngôn ngữ — FR-21
  'lang.vi': 'VI',
  'lang.en': 'EN',
  /* Nhãn cho trình đọc màn hình: nút là công tắc hai chiều, chữ trên nút chỉ ghi mã ngôn ngữ. */
  'lang.switchToEn': 'Chuyển sang tiếng Anh',
  'lang.switchToVi': 'Chuyển sang tiếng Việt',
  'lang.enPartial': 'Bản tiếng Anh đang dịch dở — câu chưa dịch vẫn hiện tiếng Việt',

  // Trạng thái mạng — FR-23
  'offline.title': 'Hoạt động ngoại tuyến',
  'offline.detail': 'Mất kết nối mạng. Mọi phép tính vẫn chạy vì máy tính nằm ngay trên máy bạn.',

  // Miễn trừ trách nhiệm — FR-24, không được cắt ở bất kỳ bản nào.
  // Đọc lại từ hằng số ở tầng Domain để dải miễn trừ trên màn và câu đính vào file xuất
  // không bao giờ lệch nhau (xem src/core/disclaimer.ts).
  'disclaimer.text': DISCLAIMER_VI,

  // Tìm kiếm — FR-19, NFR-USA-03
  'search.label': 'Tìm công thức',
  /*
   * Ví dụ trong watermark viết CÓ DẤU.
   *
   * Bản trước cố tình viết "dinh gia" không dấu để quảng cáo NFR-USA-03. Chủ dự án đọc ra thành
   * lỗi chính tả chứ không ra thông điệp, nên nó không làm được việc mình sinh ra để làm — mà
   * watermark cũng không phải chỗ giải thích: nó biến mất ngay khi người dùng gõ ký tự đầu tiên.
   *
   * Thông điệp không mất đi đâu cả, nó vốn đã nằm nguyên câu ở `search.hint` ngay bên dưới
   * ("Gõ không dấu vẫn ra đúng: …"), và chính câu đó mới là chỗ hiện ra đúng lúc cần — khi tìm
   * không thấy gì. Khả năng bỏ dấu thì nằm ở `normalizeVi` tầng Domain, không phụ thuộc câu chữ.
   */
  'search.placeholder': 'Tên công thức, ví dụ P/E hay định giá',
  'search.hint': 'Gõ không dấu vẫn ra đúng: “dinh gia” ra “Định giá”, “p e” ra “P/E”.',
  'search.clear': 'Xoá ô tìm kiếm',

  // Màn tìm kiếm WF-09 — gói 3.1.3
  'search.recent.title': 'Tìm gần đây',
  'search.recent.clear': 'Xoá lịch sử',
  'search.tip': 'Gõ tên công thức, tên viết tắt, hoặc điều bạn đang muốn tính.',
  'search.matchNote': 'Khớp không dấu với',
  'search.resultCount': 'kết quả',
  'search.noMatch': 'Không tìm thấy',
  'search.suggest.title': 'Có thể bạn cần',
  'search.seeAll': 'Xoá tìm kiếm · xem tất cả',
  /* Khối lối tắt ở trạng thái chưa gõ gì. Số trên ô là số công thức ĐÃ DÙNG ĐƯỢC,
     khác lưới nhóm ở trang chủ vốn hiện số dự kiến của SRS. */
  'search.hot.title': 'Danh mục hot',

  // Lọc — WF-02
  'filter.segment.label': 'Mảng',
  'filter.segment.all': 'Tất cả',
  'filter.segment.stock': 'Chứng khoán',
  'filter.segment.personal': 'Cá nhân',
  'filter.category.label': 'Nhóm công thức',
  'filter.category.all': 'Tất cả nhóm',
  'filter.reset': 'Xoá bộ lọc',
  'sort.label': 'Sắp xếp',
  'sort.featured': 'Thiết thực trước',
  /* Hai cách sắp dưới đây chấm điểm từ lịch sử mở công thức trên chính máy này. */
  'sort.recent': 'Vừa xem gần đây',
  'sort.used': 'Hay dùng nhất',
  'sort.basic': 'Cơ bản trước',
  'sort.az': 'Tên A → Z',
  'sort.za': 'Tên Z → A',

  // Cấp độ — FR-09
  'level.basic': 'Cơ bản',
  'level.advanced': 'Nâng cao',

  // Danh sách kết quả
  'list.label': 'Danh sách công thức',
  'list.count': 'công thức',
  'list.empty.registry.title': 'Chưa có công thức nào',
  'list.empty.registry.hint': 'Thư viện công thức đang được bổ sung dần.',
  'list.empty.noMatch.title': 'Không tìm thấy công thức nào',
  'list.empty.noMatch.scope':
    'Sản phẩm chỉ có công thức chứng khoán và tài chính cá nhân Việt Nam — không có tiền mã hoá.',
  'list.empty.noMatch.hint': 'Thử bớt từ khoá, hoặc xoá bộ lọc để xem lại toàn bộ danh sách.',

  /*
   * Chế độ Cơ bản đang giấu bớt công thức — vế thứ hai của FR-09.
   *
   * Phải nói ra bằng SỐ và kèm nút bật, không im lặng cắt danh sách: người dùng không có cách
   * nào đoán được vì sao nhóm "Tài chính DN" trống trơn (cả 2 công thức của nó đều mức nâng cao).
   * Chữ cố ý khác `detail.hiddenInBasic` vì chỗ này ẩn CÔNG THỨC, chỗ kia ẩn BIẾN.
   */
  'list.hiddenByLevel': 'công thức nâng cao đang ẩn',
  'list.showAdvanced': 'Bật chế độ Nâng cao',
  'list.empty.basicOnly.title': 'Ở đây chỉ có công thức nâng cao',
  'list.empty.basicOnly.hint':
    'Bạn đang ở chế độ Cơ bản nên danh sách trống. Bật Nâng cao để xem đủ.',

  // Nhập liệu — WF-16, gói 2.3
  // Mũi tên '↳ CAPM' của ô nhận giá trị tự động KHÔNG nằm ở đây: nó do `core/input-state.ts`
  // ghép, mà tầng Domain không được đọc i18n (CON-02).
  'input.lockedBadge': 'nâng cao',
  'input.lockedHint': 'Chuyển sang chế độ Nâng cao để sửa ô này.',
  'input.sliderMin': 'min',
  'input.sliderMax': 'max',
  'input.sliderStep': 'step',
  'input.unitLabel': 'Đơn vị hiển thị',
  /*
   * Nhãn ba bậc đơn vị tiền. Bản gốc là `UNIT_SCALES[].label` ở Domain (CON-05) — một ca kiểm
   * trong i18n.test.ts giữ hai bên khớp từng chữ. Xem `src/ui/i18n/keys.ts`.
   */
  'unit.scale.billion': 'tỷ ₫',
  'unit.scale.million': 'triệu ₫',
  'unit.scale.dong': '₫',
  'input.override': 'Ghi đè',
  'input.revert': 'Hoàn tác',
  'input.overridden': 'đã ghi đè',
  'input.openUpstream': 'Mở công thức nguồn',
  'input.autoFrom': 'Nhận tự động từ',

  // Kết quả & diễn giải — WF-03, WF-15, gói 2.4
  'result.eyebrow': 'KẾT QUẢ',
  /*
   * Tiêu đề khối Kết quả, ẩn khỏi mắt và chỉ dành cho trình đọc màn hình / điều hướng bằng phím.
   *
   * Là khoá RIÊNG chứ không dùng lại `result.eyebrow`, dù hai chữ gần như nhau. Lý do đo được:
   * `result.eyebrow` viết hoa toàn bộ ngay trong từ điển, và ba ca kiểm ở `FormulaDetail.test.tsx`
   * dò đúng chuỗi 'KẾT QUẢ' để biết khối kết quả CHUNG có mặt hay không — công thức nào tự bày
   * kết quả trong thân riêng thì khối chung phải vắng. Dùng chung một khoá là tiêu đề ẩn luôn
   * khớp, và ba ca kiểm ấy mất hiệu lực trong im lặng.
   */
  'result.heading': 'Kết quả',
  'result.live': 'cập nhật tức thì',
  'result.unavailable': 'Chưa tính được',
  'result.fixPrefix': '↳',
  'explain.title': 'Giải thích cho người mới',
  'explain.meaning': 'Công thức này nói lên điều gì',
  'explain.whenToUse': 'Khi nào dùng',
  'explain.howToRead': 'Cách đọc kết quả',
  'explain.commonMistakes': 'Sai lầm thường gặp',
  'variable.tableCaption': 'Bảng biến đầu vào',
  'variable.colName': 'BIẾN',
  'variable.colUnit': 'ĐƠN VỊ',
  'variable.colDescription': 'MÔ TẢ',
  'variable.noDescription': '—',
  'example.title': 'Ví dụ thực tế',
  'example.editHint': 'Sửa được ngay tại đây — thay bằng số thật của mã bạn đang xem.',
  'example.original': 'Ví dụ gốc cho:',
  'example.reset': 'Về số của ví dụ',
  'source.title': 'Nguồn tham khảo',
  'flow.title': 'Dải luồng tính toán',
  'flow.cyclicWarning': 'Có bước phụ thuộc vòng nên chưa xếp được thứ tự:',
  // Chỉ trình đọc màn hình nghe: dấu chấm ngăn hai nhánh song song, không phải mũi tên nối tiếp.
  'flow.branch': 'nhánh khác',
  'flow.stepError': 'lỗi',

  // Chuỗi công thức nối nhau — WF-04, FR-15 (gói 5.2.3)
  'chain.title': 'Chuỗi công thức',
  'chain.intro':
    'Kết quả mỗi bước chảy thẳng vào ô của bước sau. Sửa số ở bước trước là cả chuỗi tính lại.',
  'chain.upstreamHeading': 'Bước trước — cấp số liệu cho công thức đang xem',
  'chain.downstreamHeading': 'Bước sau — dùng kết quả của công thức đang xem',
  'chain.openStep': 'Mở màn riêng của bước này',
  'stat.eyebrow': 'CHỈ SỐ',

  // Màn chi tiết công thức — WF-03, gói 3.2.1
  'detail.loadPreset': 'Nạp mẫu',
  'detail.preset': 'Đã nạp',
  'detail.jumpToExample': 'Xem ví dụ thực tế ↓',
  'detail.fundamentalsSource':
    'Số liệu cơ bản (EPS, giá trị sổ sách, số CP, cổ tức…) của mã này lấy thật từ Finbox_v2, đối chiếu lúc',
  // Hai câu dưới đứng SAU mã (“FPT · …”), nên viết thường.
  'detail.tickerLoading': 'đang lấy số liệu thật của mã…',
  'detail.tickerFailed':
    'không lấy được số liệu của mã — nhập tay, hoặc bấm “Nạp mẫu” để dùng bộ số liệu sẵn có.',
  'detail.export': '↓ Xuất',

  /*
   * ── Mã dính theo lượt duyệt ────────────────────────────────────────────────
   *
   * Câu này đứng SAU mã ('HPG · đang dùng…') và là điều kiện để việc tự điền ô nhập không thành
   * một bất ngờ: số vừa xuất hiện trong ô là của một mã mà người dùng không bấm gì ở màn này cả.
   * Cùng luật mà thị giá đã lưu ở tab Danh mục đang chịu — được dùng số đã cất, nhưng phải gọi
   * tên được nguồn của nó.
   */
  'detail.tickerSticky': 'đang dùng cho mọi công thức trong lượt xem này',
  'detail.tickerChange': 'Đổi mã',
  'detail.tickerClear': 'Bỏ mã',

  /*
   * ── Lưu phép tính vào tab "Công thức" của màn Danh mục ─────────────────────
   *
   * Nút hiện ở CẢ 111 công thức, không riêng nhóm có mã: người dùng tính một khoản vay hay một
   * mức phí cũng muốn giữ lại kết quả y như khi định giá một mã.
   */
  'detail.saveToPortfolio': '☆ Lưu vào danh mục',
  // Hai câu dưới đứng SAU tên phép tính đã lưu, nên viết thường.
  'detail.restoredNote': 'phép tính đã lưu ngày',
  'detail.restoredMissing': 'không tìm thấy phép tính đã lưu — có thể nó đã bị xoá khỏi máy này.',
  /*
   * Kho lưu KHÔNG cất chuỗi giá (xem docblock `saved-calc-store.ts`), nên mở lại một công thức
   * nhóm chuỗi mà bảng dữ liệu đang khác lúc lưu thì kết quả sẽ khác. Nói thẳng ra còn hơn để
   * người dùng đọc một con số mới dưới một cái tên cũ (FR-06).
   */
  'detail.restoredNeedsSeries':
    'Phép tính này dùng chuỗi giá, mà chuỗi đang có trong máy không khớp lúc lưu — kết quả hiện tại có thể khác con số đã lưu. Nạp lại chuỗi giá trước khi đọc kết quả.',

  'detail.meaning': 'Ý nghĩa',
  'detail.formula': 'Công thức',
  'detail.inputs': 'Số liệu',
  'detail.hiddenInBasic': 'biến nâng cao đang ẩn — chuyển chế độ để xem',
  'detail.constantSource': 'Market Config · CON-10',
  'detail.constantsInUse': 'Đang tính theo các mức sau',
  'detail.constantSince': 'áp dụng từ',
  'detail.pasteSeries': 'Dán chuỗi giá từ Excel',
  'detail.loadExample': 'Xem ví dụ minh hoạ',
  'detail.exampleLoaded': 'Đã xem ví dụ minh hoạ ✓',
  'detail.exampleSeriesNote':
    'Đây là chuỗi số dựng sẵn để minh hoạ đúng ý nghĩa công thức, không phải giá cổ phiếu thật của công ty nào.',
  'detail.exampleSeriesLabel': 'ví dụ minh hoạ',
  'detail.applyToTable': 'Áp dụng vào bảng dữ liệu',
  'detail.appliedToTable': 'Đã áp dụng ✓',
  'detail.seriesLoaded': 'Đã nạp số phiên giá:',
  /*
   * Mã lấy từ kho toàn thị trường chỉ có ĐÚNG một phiên giá (`live-preset.ts`) — nguồn Finbox
   * không cấp chuỗi dài. Công thức cần nhiều phiên mà im lặng thì người dùng đọc ra "nạp mã
   * xong vẫn không tính được" và tưởng sản phẩm hỏng; phải nói cả nguyên nhân lẫn lối đi tiếp.
   */
  'detail.liveSeriesShort':
    'Mã này chỉ có một phiên giá — nguồn số liệu thật không cấp chuỗi dài. Công thức này cần ' +
    'nhiều phiên: dán chuỗi giá, hoặc bấm “Nạp mẫu” và chọn một trong bốn mã mẫu.',
  /*
   * Chuỗi VN-Index trong bộ mẫu là PRNG (`samples.ts`), mà công thức hồi quy với thị trường thì
   * LUÔN đọc nó qua `ctx.marketSeries` — không ai bấm "Nạp mẫu" cho nó cả. Không có câu này thì
   * người dùng nhận một hệ số beta gần 0 trông hoàn toàn hợp lệ: đúng loại "số sai mà trông có
   * lý" mà FR-06 tồn tại để chặn. Nói cả nguyên nhân lẫn cách đọc con số đang thấy.
   */
  'detail.draftMarketSeries':
    'Chuỗi VN-Index dùng để so sánh hiện là số liệu mẫu tự dựng, chưa phải chỉ số thật — con số ' +
    'ra đây chỉ để xem cách đọc, đừng dùng cho quyết định thật.',
  'detail.openDataTable': 'Mở bảng dữ liệu →',
  'detail.chart': 'Biểu đồ',
  /* Nhãn ô chọn biến cho trục X của đường quét độ nhạy (FR-08). */
  'chart.sweepLabel': 'Xem kết quả đổi theo',
  /*
   * Bảng số liệu tương đương, gói trong <details>. HIỆN chứ không giấu bằng .visually-hidden:
   * người sáng mắt cũng cần con số chính xác, mắt đọc biểu đồ chỉ ra được xu hướng.
   */
  'chart.showData': 'Xem số liệu',
  /* Caption ẩn của bảng số liệu — cố ý KHÁC tiêu đề hình, ghép "<caption> — <tên hình>". */
  'chart.tableCaption': 'Số liệu',
  /*
   * Xem biểu đồ toàn màn hình. Hai câu nhắc xoay là HAI việc khác nhau, cố ý tách rời:
   * câu đầu nhờ xoay máy, câu sau chỉ hiện khi trình duyệt không tự xoay được — hầu hết là iPhone,
   * hoặc máy Android đang bật khoá xoay.
   */
  /*
   * Hiện dưới biểu đồ khi trục X đang là thời gian (HISTORY_KEY) — bấm/nhả lúc đó KHÔNG ghi được
   * gì vào ô Số liệu (không có ô nào tương ứng "một ngày trong quá khứ"), khác các trục biến số
   * khác nơi bấm áp dụng được luôn. Không có gợi ý này thì cú bấm trên các công thức cần chuỗi giá
   * (mặc định luôn mở ra đúng trục thời gian) trông như tính năng không hoạt động.
   */
  'chart.applyHintTimeAxis':
    'Trục đang là thời gian nên bấm không ghi được gì — đổi mục "Xem kết quả đổi theo" ở trên sang một biến số để bấm áp dụng giá trị.',
  /*
   * Vế KHẲNG ĐỊNH của câu ngay trên, thêm ở đợt này.
   *
   * Trước đó sản phẩm chỉ nói khi tính năng KHÔNG dùng được. Người dùng đổi trục theo đúng lời
   * khuyên, rồi câu kia biến mất và không còn gì cho biết giờ bấm được — nên lối tương tác duy
   * nhất của biểu đồ chỉ tự nhắc tới mình vào đúng lúc nó không chạy.
   *
   * Nói "ô nhập" chứ không "ô Số liệu": ở khổ điện thoại khối Số liệu nằm ngoài tầm mắt khi đang
   * xem biểu đồ, nên gọi tên khối là bắt người đọc đi tìm; gọi tên thứ họ sắp thấy nhảy số thì không.
   */
  'chart.applyHintReady': 'Bấm vào biểu đồ để áp dụng giá trị đó vào ô nhập.',
  'chart.zoom': 'Phóng to',
  'chart.exit': 'Thoát phóng to',
  'chart.rotate': 'Xoay ngang điện thoại để biểu đồ rộng hơn.',
  'chart.rotateUnlock': 'Máy đang khoá xoay thì mở Cài đặt nhanh rồi bật Xoay màn hình.',

  // Màn phí & thuế — WF-08, gói 3.2.3
  'fee.schedule': 'Biểu phí',
  'fee.scheduleNote': 'Hằng số lấy từ Market Config — sửa một chỗ, áp dụng toàn hệ thống.',
  'fee.breakdown': 'Bóc tách chi phí',
  'fee.totalCost': 'Tổng chi phí',
  'fee.breakEven': 'Giá hoà vốn thực',
  'fee.breakEvenNote': 'bán dưới giá này là lỗ',
  'fee.netProfit': 'Lợi nhuận ròng',
  'fee.grossProfit': 'lãi gộp',
  'fee.netRoi': 'ROI ròng',

  // Màn vay nợ — WF-14, gói 3.2.4
  'loan.monthly': 'Trả hằng tháng',
  'loan.totalInterest': 'Tổng lãi',
  'loan.totalPaid': 'Tổng phải trả',
  'loan.schedule': 'Lịch trả nợ',
  /* Nhãn đơn vị bảng. Bậc đơn vị ghép vào sau, lấy từ cài đặt (WF-13) chứ không viết cứng. */
  'loan.tableUnit': 'ĐVT:',
  // Hàng "…" thay cho những kỳ đã bỏ bớt. Trình đọc màn hình đọc câu này chứ không đọc ba dấu chấm.
  'loan.gapRow': 'đã bỏ bớt các kỳ ở giữa',
  'loan.colPeriod': 'KỲ',
  'loan.colPrincipal': 'GỐC',
  'loan.colInterest': 'LÃI',
  'loan.colBalance': 'CÒN LẠI',
  'loan.condensed.before': 'Bảng đã rút gọn — hiện',
  'loan.condensed.after': 'kỳ: 12 kỳ đầu, mốc cuối mỗi năm, và kỳ cuối.',

  // Nạp bộ số liệu mẫu — WF-10, gói 2.5.1
  'preset.title': 'Nạp bộ số liệu mẫu',
  'preset.subtitle': 'Bốn mã mẫu — mỗi mã có sẵn chuỗi phiên giá, dùng được cho công thức chuỗi',
  'preset.load': 'Nạp',
  /* Lối sang kho mã lớn. Cố ý không chép số mã vào câu: con số đó do nguồn quyết, chép vào
     đây là để nó rữa trong im lặng. */
  'preset.browseMarket': 'Tìm mã khác trong toàn thị trường →',
  'preset.browseMarketNote':
    'Toàn bộ mã đang giao dịch, số liệu thật của phiên gần nhất — nhưng chỉ có MỘT phiên giá, ' +
    'nên công thức cần nhiều phiên vẫn phải dán chuỗi riêng.',
  'preset.editableAfterLoad': 'Sau khi nạp, mọi ô vẫn sửa được từng cái một.',
  'preset.draftTag': 'số liệu bản thảo',
  'preset.draftTitle': 'Số liệu tự dựng, chưa đối chiếu báo cáo thật.',
  'preset.draftDetail':
    'Dùng để thử đường đi của tính năng. Đừng dựa vào con số tính ra để ra quyết định.',
  /* Câu ngắn đi kèm ngay CẠNH CON SỐ tiền — dùng ở màn Danh mục và trong file xuất ra.
     Khác `preset.draftDetail` ở chỗ nó phải đọc lọt trong một dòng hẹp. */
  /*
   * `preset.draftInline` đã bị xoá ở gói "Danh mục dùng số liệu thật".
   *
   * Nó chỉ có một nơi dùng: câu cảnh báo bản thảo dưới bốn con số của màn Danh mục. Nay thị giá
   * ở màn đó lấy thật từ Finbox nên không còn gì để cảnh báo, và ca "khoá mồ côi" trong
   * `i18n.test.ts` bắt được ngay lúc gỡ. `preset.draftTag` và `preset.draftExport` vẫn còn dùng
   * (PresetSheet và file xuất), nên giữ nguyên.
   */
  'preset.draftExport': 'Số liệu đầu vào lấy từ bộ mẫu tự dựng, chưa đối chiếu báo cáo thật.',

  // Dán từ Excel / CSV — WF-11, gói 2.5.2
  // ── Danh mục cá nhân WF-06 (gói 3.4.1) ────────────────────────────────────
  'portfolio.title': 'Danh mục của tôi',
  'portfolio.subtitle': 'Lưu tại thiết bị · không cần đăng nhập',
  'portfolio.totalValue': 'Tổng giá trị',
  'portfolio.beta': 'Beta danh mục',
  'portfolio.xirr': 'XIRR toàn DM',
  'portfolio.count': 'Số mã',
  /*
   * Chế độ Cơ bản đang giấu hai ô Beta và XIRR — FR-09.
   *
   * Chữ cố ý khác `list.hiddenByLevel` ("công thức nâng cao đang ẩn") và `detail.hiddenInBasic`
   * ("biến nâng cao đang ẩn"): ba chỗ ẩn ba LOẠI thứ khác nhau, dùng chung một câu thì người
   * đọc không biết mình đang thiếu công thức, thiếu biến hay thiếu con số.
   */
  'portfolio.hiddenByLevel': 'ô nâng cao đang ẩn',
  'portfolio.holdings': 'Nắm giữ',
  'portfolio.shares': 'CP',
  'portfolio.costPrice': 'giá vốn',
  'portfolio.weight': 'tỷ trọng',
  'portfolio.add': 'Thêm mã cổ phiếu',
  'portfolio.remove': 'Bỏ mã',
  'portfolio.empty': 'Chưa có mã nào. Thêm mã đầu tiên để xem tổng giá trị và tỷ trọng.',
  'portfolio.localTag': 'CỤC BỘ',
  /*
   * Câu này từng ghi "Không gửi lên máy chủ." và điều đó KHÔNG còn đúng kể từ gói lấy thị giá
   * thật: mã cổ phiếu phải rời máy thì mới tra được giá. Số lượng nắm giữ và giá vốn — hai thứ
   * riêng tư thật sự — vẫn không đi đâu cả, và câu mới nói đúng ranh giới đó thay vì hứa suông.
   */
  'portfolio.localOnly':
    'Số lượng và giá vốn chỉ lưu trên thiết bị này (localStorage). Chỉ mã cổ phiếu được gửi tới Finbox để tra thị giá.',
  'portfolio.formCode': 'Mã cổ phiếu',
  // "Số cổ phiếu" trần bị đọc nhầm thành số CP LƯU HÀNH — cụm mà Domain dùng cho
  // `sharesOutstanding`. Thêm "nắm giữ" để hai khái niệm không còn trùng chữ.
  'portfolio.formQuantity': 'Số cổ phiếu nắm giữ',
  'portfolio.formCostPrice': 'Giá vốn một cổ phiếu (₫)',
  'portfolio.formBuyDate': 'Ngày mua',
  'portfolio.formBeta': 'Beta (để trống nếu chưa biết)',
  'portfolio.formSubmit': 'Thêm vào danh mục',
  'portfolio.formCancel': 'Huỷ',
  'portfolio.betaHint':
    'Beta chưa tính tự động được — cần chuỗi lợi suất của cả mã lẫn chỉ số thị trường. Nhập tay nếu bạn đã có số.',
  'portfolio.priceNote': 'Thị giá lấy từ Finbox theo phiên gần nhất, không phải giá khớp lệnh.',
  'portfolio.pickCode': 'Chọn mã',
  'portfolio.priceLoading': 'Đang lấy thị giá…',
  'portfolio.priceFailed': 'Không lấy được thị giá từ Finbox.',
  'portfolio.priceRetry': 'Thử lại',

  // ── Lãi/lỗ và vốn — hai thẻ thêm vào bốn thẻ gốc của WF-06 ─────────────────
  'portfolio.totalCost': 'Vốn đã bỏ ra',
  'portfolio.gain': 'Lãi/lỗ',

  /*
   * ── Nhãn của lưới số liệu trong khối chi tiết ─────────────────────────────
   *
   * Đây là NHÃN đứng riêng một dòng phía trên giá trị, không phải mảnh ghép giữa câu, nên viết
   * hoa chữ đầu và đủ nghĩa khi đứng một mình. Bản trước là mảnh câu viết thường ('giá', 'mua')
   * ghép thành `100 CP · giá vốn 21 ₫ · chưa có giá` — đọc được nhưng không dò được.
   *
   * `portfolio.costPrice` và `portfolio.weight` vẫn viết thường: từ đợt dựng lại theo bản vẽ
   * WF-06 chúng KHÔNG còn là nhãn của lưới nữa mà là chữ đi liền con số ngay trên dòng gọn
   * ('giá vốn 60.000 ₫' · 'tỷ trọng'), nên chữ thường là đúng chỗ chứ không còn là chuyện CSS.
   *
   * `portfolio.cellQuantity` ('Số lượng') đã bỏ ở đợt ấy: số lượng lên dòng gọn, nơi đơn vị 'CP'
   * ngay sau con số đã nói đủ, nên nhãn thành thừa. Cửa "khoá mồ côi" ở `i18n.test.ts` bắt được
   * ngay lúc nó thành thừa.
   */
  'portfolio.marketPrice': 'Thị giá',
  'portfolio.priceMissing': 'chưa có giá',
  'portfolio.betaShort': 'beta',
  'portfolio.edit': 'Sửa',
  /*
   * Nhãn của nút phủ lên cả dòng mã — nút mở khối chi tiết. Không hiện thành chữ trên màn (dòng
   * đã có mũi tên), nhưng là toàn bộ tên khả truy cập của nút nên phải nói đúng việc nó làm.
   */
  'portfolio.details': 'Chi tiết',
  'portfolio.editHint':
    'Đổi số lượng, giá vốn, ngày mua hoặc beta. Muốn đổi mã thì bỏ rồi thêm lại.',
  'portfolio.formSave': 'Lưu thay đổi',

  /*
   * Thêm lại một mã đang giữ thì `addHolding()` CỘNG DỒN vào dòng cũ chứ không tạo dòng thứ hai
   * — hành vi đúng ("thêm FPT lần nữa" = mua thêm), nhưng trước đây nó xảy ra trong im lặng nên
   * người dùng tưởng màn đang cho tạo mã trùng. Nhãn nút đổi theo luôn: hứa đúng việc sắp làm,
   * ngay tại chỗ người ta đọc kỹ nhất.
   */
  'portfolio.mergeNote':
    'Mã này đã có trong danh mục. Thêm nữa sẽ cộng dồn số lượng và tính lại giá vốn bình quân, không tạo dòng thứ hai. Muốn sửa số đang có thì huỷ form, bấm vào mã trong danh sách rồi bấm Sửa.',
  'portfolio.formMerge': 'Cộng thêm vào mã đã có',
  /*
   * Nhãn nút khi VỪA cộng dồn VỪA mở công thức.
   *
   * Không gộp vào `formSubmitOpen` ("Thêm và mở công thức"): chữ "Thêm" ở đó hứa một dòng mới,
   * mà việc sắp xảy ra là cộng vào dòng đã có. Đây đúng là lý do `formMerge` ra đời — hứa sai
   * ngay trên đích bấm, chỗ người ta đọc kỹ nhất — nên nhánh có công thức phải giữ nguyên luật ấy.
   */
  'portfolio.formMergeOpen': 'Cộng thêm và mở công thức',

  /*
   * Câu lỗi của form.
   *
   * Trước khi có chúng, ba ca hỏng đều IM LẶNG: ô trống thì nút không làm gì, số lượng 0 thì
   * form đóng lại như đã thêm xong, và đủ 50 mã cũng thế. Thao tác hỏng mà trông như thành công
   * là thứ NFR-USA-04 muốn chặn.
   *
   * Con số 50 trong `portfolio.errFull` phải khớp `MAX_HOLDINGS`; `i18n.test.ts` có ca ghim.
   */
  'portfolio.errCode': 'Chọn mã cổ phiếu trước đã.',
  'portfolio.errQuantity': 'Nhập số cổ phiếu nắm giữ, lớn hơn 0.',
  'portfolio.errCostPrice': 'Nhập giá vốn một cổ phiếu, lớn hơn 0.',
  'portfolio.errBeta': 'Beta phải là một số, ví dụ 1,1 — hoặc để trống nếu chưa biết.',
  'portfolio.errFull': 'Danh mục đã đủ 50 mã. Bỏ bớt một mã trước khi thêm mã mới.',

  // ── Trạng thái thị giá: luôn hiện, luôn nói rõ giá thuộc phiên nào ─────────
  'portfolio.priceSession': 'Giá phiên',
  'portfolio.priceRefresh': 'Làm mới',
  'portfolio.priceStale': 'Chưa làm mới được thị giá — đang dùng giá đã lưu.',
  /*
   * Nguồn trả lời được nhưng không mã nào có giá. Cố ý KHÁC `portfolio.priceFailed`: ở đây mạng
   * không hỏng, chỉ là Finbox không có mã người dùng nhập — nên lời khuyên là soát lại mã, không
   * phải "thử lại". Lý do đầy đủ đã nằm ở ô "Tổng giá trị"; câu này chỉ giữ cho thanh khỏi trống.
   */
  'portfolio.priceNone': 'Chưa có mã nào tra được thị giá.',
  /*
   * ── Ô chọn công thức trong form thêm/sửa mã ───────────────────────────────
   *
   * `portfolio.formulas` từng là nhãn của một NÚT ở dòng mã; từ đợt gộp luồng thêm mã nó là nhãn
   * của một Ô NHẬP trong form. Giữ nguyên chuỗi vì nó vẫn gọi đúng tên việc, chỉ đổi vai.
   */
  'portfolio.formulas': 'Tính công thức',
  'portfolio.pickFormula': 'Chọn công thức',
  'portfolio.formulaHint':
    'Tuỳ chọn. Chọn rồi thì lưu xong sẽ mở thẳng công thức đó với số liệu của mã đã điền sẵn.',
  /*
   * Chữ trên NÚT khi chưa có mã, và bấm vào nó là mở sheet chọn mã thật.
   *
   * Từng để nút `disabled` với chữ "Chọn công thức", và chủ dự án báo "bấm vào không thấy hiệu ứng
   * gì" — một nút hứa một việc rồi im lặng. Nút phải nói đúng thứ nó sắp làm.
   */
  'portfolio.pickCodeFirst': 'Chọn mã cổ phiếu trước',
  'portfolio.formulaNeedsCode':
    'Số ô điền sẵn của mỗi công thức phụ thuộc mã, nên phải có mã rồi mới chọn được. Bấm vào ô này để chọn mã.',
  'portfolio.formulaClear': 'Bỏ chọn công thức',
  'portfolio.formSubmitOpen': 'Thêm và mở công thức',
  'portfolio.formSaveOpen': 'Lưu và mở công thức',
  'portfolio.formulasTitle': 'Công thức dùng được với mã này',
  /*
   * Nói CHỌN chứ không nói MỞ. Sheet từng đi thẳng tới trang công thức khi bấm một dòng; từ đợt
   * gộp luồng thêm mã nó trả lựa chọn về form, và form lưu xong mới mở. Hứa "mở" ở đây là hứa sai
   * một nhịp — người dùng bấm rồi thấy mình quay lại form và tưởng thao tác hỏng.
   */
  'portfolio.formulasSubtitle': 'Chọn một công thức — lưu xong sẽ mở với số liệu của mã điền sẵn',
  // Đứng SAU cặp số "2/2", nên viết thường và mở đầu bằng đơn vị.
  'portfolio.formulasFilled': 'ô điền sẵn',
  'portfolio.formulasNoPrice':
    'Chưa tra được thị giá của mã này, nên các công thức cần giá đã bị lược bớt hoặc điền ít ô hơn.',

  /*
   * ── Hai tab của màn Danh mục: Mã · Công thức ───────────────────────────────
   *
   * Tab "Công thức" giữ các phép tính người dùng đã lưu từ màn chi tiết. Nhãn tab đứng cạnh
   * một con số đếm ('Mã (5)') nên phải ngắn và là DANH TỪ, không phải câu lệnh.
   */
  'portfolio.tabHoldings': 'Mã',
  'portfolio.tabSaved': 'Công thức',
  'portfolio.savedEmpty':
    'Chưa lưu phép tính nào. Mở một công thức, nhập số liệu rồi bấm “Lưu vào danh mục” để giữ lại kết quả ở đây.',
  'portfolio.savedOpen': 'Mở lại',
  'portfolio.savedRename': 'Đổi tên',
  'portfolio.savedRemove': 'Xoá',
  'portfolio.savedSaveName': 'Lưu tên',
  'portfolio.savedNameLabel': 'Tên phép tính',
  /*
   * Ngày lưu KHÔNG phải thứ trang trí — nó là điều kiện để bày một con số cũ mà vẫn lương thiện,
   * đúng cặp ràng buộc mà `price-cache-store.ts` đặt ra cho thị giá đã lưu: được dùng số cũ,
   * nhưng phải nói rõ số ấy thuộc mốc nào. Tab này không tính lại, nên bỏ ngày đi là vi phạm.
   */
  'portfolio.savedAt': 'lưu',
  'portfolio.savedResultNote': 'Kết quả của lần lưu, không tính lại. Bấm “Mở lại” để tính lại.',
  'portfolio.savedNeedsSeries': 'Cần chuỗi giá',

  // ── Chọn mã từ toàn thị trường — gói "Danh mục dùng số liệu thật" ──────────
  'ticker.title': 'Chọn mã cổ phiếu',
  'ticker.subtitle': 'Toàn bộ mã đang giao dịch, lấy từ Finbox',
  'ticker.searchLabel': 'Tìm mã hoặc tên doanh nghiệp',
  'ticker.searchPlaceholder': 'FPT, Hoà Phát…',
  'ticker.pick': 'Chọn',
  // Mã đang giữ vẫn chọn được (sẽ cộng dồn), nên đây là NHÃN chứ không phải lời từ chối.
  'ticker.held': 'đã có',
  'ticker.pickHeld': 'Cộng thêm',
  'ticker.loading': 'Đang tải danh sách mã…',
  'ticker.noMatch': 'Không có mã nào khớp. Thử gõ mã ngắn hơn, ví dụ “fpt”.',
  // Đứng ngay SAU cặp số "60/1.649", nên câu phải mở đầu bằng đơn vị và không viết hoa.
  'ticker.capped': 'mã · gõ thêm để thu hẹp danh sách',
  'ticker.retry': 'Thử lại',
  'ticker.errorNetwork': 'Không tải được danh sách mã. Kiểm tra kết nối mạng rồi thử lại.',
  'ticker.errorSource': 'Nguồn dữ liệu trả về thứ không đọc được. Thử lại sau ít phút.',
  'ticker.stale': 'Đang hiện danh sách của lần tải trước, có thể đã cũ.',

  // ── Bảng dữ liệu WF-05 (gói 3.3.1) ────────────────────────────────────────
  'series.title': 'Chuỗi giá OHLCV',
  'series.subtitle': 'dùng cho Beta / Sharpe / VaR',
  'series.codeLabel': 'Mã cổ phiếu',
  'series.loadPreset': 'Nạp mẫu',
  'series.addRow': 'Thêm dòng',
  'series.paste': 'Dán Excel/CSV',
  'series.downloadCsv': 'Tải CSV',
  'series.clear': 'Xoá',
  'series.clearConfirm': 'Xoá toàn bộ bảng? Thao tác này không hoàn tác được.',
  'series.removeRow': 'Xoá dòng',
  'series.colDate': 'Ngày',
  'series.colOpen': 'Mở',
  'series.colHigh': 'Cao',
  'series.colLow': 'Thấp',
  'series.colClose': 'Đóng',
  'series.colVolume': 'Khối lượng',
  'series.empty': 'Bảng đang trống. Bấm “Thêm dòng” để nhập tay, hoặc nạp một bộ số liệu mẫu.',
  'series.usable': 'phiên dùng được',
  'series.rowLabel': 'Dòng',
  /* Không còn `series.localOnly` / `series.localTag`: màn bảng dữ liệu bỏ dòng ghi chú
     localStorage (25/08/2026). Câu tương đương chỉ còn ở màn Danh mục — `portfolio.localOnly`. */
  'series.needMore':
    'Beta và Sharpe cần ít nhất 60 phiên để có ý nghĩa thống kê. Hiện chưa đủ, kết quả sẽ báo thiếu dữ liệu.',

  'xirr.tableTitle': 'Dòng tiền',
  'xirr.hint':
    'Số âm là tiền chi ra, số dương là tiền thu về — dòng cuối thường là giá trị hiện tại.',
  'xirr.addRow': 'Thêm dòng',
  'xirr.removeRow': 'Xoá dòng',
  'xirr.colDate': 'Ngày',
  'xirr.colAmount': 'Số tiền (₫)',
  'xirr.rowLabel': 'Dòng',
  'xirr.usable': 'dòng tiền dùng được',

  'paste.title': 'Dán dữ liệu',
  'paste.subtitle': 'Chuỗi giá OHLC dán thẳng từ Excel hoặc file CSV',
  'paste.areaLabel': 'Dán dữ liệu vào đây',
  'paste.placeholder': '15/07\t25.10\t25.60\t24.90\t25.40',
  'paste.assignColumns': 'Gán cột',
  'paste.column': 'Cột',
  /*
   * Nhãn HIỂN THỊ của từng vai trò cột. Bản gốc là `COLUMN_LABELS` ở Domain (đúng chữ WF-11)
   * — một ca kiểm trong i18n.test.ts giữ hai bên khớp từng chữ. Từ vựng ĐOÁN cột từ header
   * dán vào (`HEADER_WORDS`) là chuyện khác, vẫn nằm nguyên trong Domain.
   */
  'paste.col.date': 'Ngày',
  'paste.col.open': 'Mở',
  'paste.col.high': 'Cao',
  'paste.col.low': 'Thấp',
  'paste.col.close': 'Đóng',
  'paste.col.volume': 'KL',
  'paste.col.ignore': 'Bỏ qua',
  /* Khung xem trước: chỗ duy nhất đối chiếu được phần dán với phần máy đọc ra, trước khi nạp. */
  'paste.previewLabel': 'Xem trước',
  'paste.previewCaption': 'Vài phiên đầu đọc được từ dữ liệu vừa dán',
  'paste.previewMore': 'dòng nữa không hiện ở đây, nhưng vẫn được nạp.',
  'paste.validRows': 'dòng hợp lệ, sẵn sàng nạp',
  'paste.skippedRows': 'dòng bỏ qua',
  'paste.truncated': 'Đã cắt bớt phần vượt trần:',
  'paste.rows': 'dòng',
  'paste.cancel': 'Huỷ',
  'paste.import': 'Nạp',

  // Xuất PDF / PNG — WF-12, gói 2.5.3
  'export.title': 'Xuất kết quả',
  'export.formatLabel': 'Định dạng file',
  'export.pdf': 'PDF A4',
  'export.pdfHint': 'in được',
  'export.png': 'PNG',
  'export.pngHint': 'chia sẻ nhanh',
  'export.withChart': 'Kèm biểu đồ',
  'export.withChartHint': 'Ảnh biểu đồ của công thức, nếu công thức đó có vẽ',
  /* Câu dự phòng của vùng in và của tấm PNG: người dùng bật "Kèm biểu đồ" nhưng công thức này
     không vẽ hình nào (11 công thức khai `chartType: 'none'`), hoặc hình chưa nạp xong. Nói ĐÚNG
     lý do chứ không để một khung rỗng — người mở file không có cách nào khác để biết vì sao chỗ
     ấy trống. Thay cho `export.chartPending` cũ, câu hẹn "sẽ có ở bản sau" nay đã sai. */
  'export.chartNone': 'Công thức này không có biểu đồ.',
  'export.withDetails': 'Kèm bảng biến & giải thích',
  'export.withDetailsHint': 'Ý nghĩa từng biến và phần giải thích cho người mới',
  'export.disclaimerLocked': 'Miễn trừ tự động đính kèm',
  'export.disclaimerLockedDetail': 'Không thể tắt — mọi file xuất ra đều mang tuyên bố miễn trừ.',
  'export.doPdf': 'Xuất PDF',
  'export.doPng': 'Xuất PNG',
  'export.failed': 'Chưa xuất được file. Trình duyệt có thể đang chặn tải xuống.',

  /*
   * ── Sheet "Lưu vào danh mục" ───────────────────────────────────────────────
   *
   * Con số 30 trong `save.errFull` phải khớp `MAX_SAVED_CALCS`; `i18n.test.ts` có ca ghim,
   * y như cách con số 50 của `portfolio.errFull` đang được ghim theo `MAX_HOLDINGS`.
   */
  'save.title': 'Lưu vào danh mục',
  'save.subtitle': 'Giữ lại bộ số liệu và kết quả này để mở lại sau',
  'save.nameLabel': 'Đặt tên cho phép tính',
  'save.nameHint': 'Tên hiện ở tab Công thức của màn Danh mục.',
  'save.suggestions': 'Gợi ý tên',
  'save.submit': 'Lưu vào danh mục',
  'save.done': 'Đã lưu vào Danh mục › Công thức.',
  'save.goToPortfolio': 'Xem trong danh mục',
  'save.errEmpty': 'Đặt một cái tên trước đã — tên trống thì sau này không tìm lại được.',
  'save.errDuplicate': 'Đã có một phép tính tên này. Đặt tên khác để hai mục không lẫn nhau.',
  'save.errFull': 'Đã lưu đủ 30 phép tính. Xoá bớt một mục trong danh mục trước khi lưu thêm.',
  /*
   * Không cho lưu một kết quả đang lỗi. Cất một con số sai rồi bày nó ra tab Danh mục — nơi
   * không có ô nhập nào để người dùng thấy nguyên nhân — đúng là thứ FR-06 sinh ra để chặn.
   */
  'save.errNoResult':
    'Kết quả đang báo lỗi nên chưa lưu được. Sửa số liệu cho tới khi có kết quả rồi lưu lại.',
  'save.failed':
    'Chưa lưu được. Trình duyệt có thể đang chặn bộ nhớ cục bộ hoặc đã hết dung lượng.',

  /* Nhãn chữ của công tắc. Luôn hiện cạnh nút gạt để trạng thái không phụ thuộc màu
     (NFR-USA-06) — cùng cách `inputs/Toggle` đang làm với nhãn của từng biến. */
  'switch.on': 'Bật',
  'switch.off': 'Tắt',

  // Trang chủ — WF-01, gói 3.1.1
  /*
   * Câu mô tả dài của trang chủ. Bản thiết kế không vẽ nó, nên nó nằm trong phần ẩn của thẻ
   * <h1> — nhưng phải TỒN TẠI: trang chủ là URL priority 1.0 của sitemap, và cụm "công thức
   * tài chính và chứng khoán Việt Nam" là thứ bộ máy tìm kiếm đọc, còn tên thương hiệu ở dòng
   * thấy được thì không nói gì về nội dung trang.
   */
  'home.h1': 'Thư viện công thức tài chính và chứng khoán Việt Nam',
  /* Dải mở đầu trang chủ — bản thiết kế đợt 12. Phần THẤY ĐƯỢC của thẻ <h1>. */
  'home.hero.title': 'Bộ công cụ tính nhanh của Finbox',
  /* Ghép sau tổng số công thức: "111 công thức chứng khoán & …". Con số do màn tự đếm từ
     Registry, không viết vào câu chữ — số chép vào prose thì rữa trong im lặng. */
  'home.hero.subtitle': 'công thức chứng khoán & tài chính cá nhân, cập nhật tức thì.',
  /*
   * Khối kết quả ở trang chủ KHÔNG có tiêu đề riêng: nó dùng lại `home.featured.title` của chính
   * kệ nó đang lọc, vì nó là kệ ấy thu hẹp lại chứ không phải một khối mới. Khoá
   * `home.search.resultsHeading` (tiêu đề ẩn) đã bỏ cùng đợt — tiêu đề nay hiện ra cho mắt thấy.
   */
  'home.search.featuredEmpty': 'Không ô nào trong khối này khớp',
  /* Dòng đầu khối rỗng phải nói ra PHẠM VI: rỗng ở đây là chuyện thường, không phải hỏng.
     Cố ý không viết con số 18 vào câu — số chép vào prose thì rữa trong im lặng. */
  'home.search.featuredScope':
    'Ô tìm ở trang chủ chỉ lọc khối “Công thức dùng hằng ngày”, không phải cả thư viện.',
  'home.search.notFound': 'Không thấy công thức bạn cần?',
  /* Ghép với số kết quả: "Tìm trong cả thư viện · 5 kết quả". */
  'home.search.searchWhole': 'Tìm trong cả thư viện',
  'home.search.results': 'kết quả',
  'home.featured.title': 'Công thức dùng hằng ngày',
  /* Chỉ hiện khi lịch sử đã thật sự đổi thứ tự khối — trang chủ tự sắp lại mà im lặng là
     hành vi lén, cùng lý do màn danh mục nói thẳng dữ liệu nằm ở đâu. */
  'home.featured.personalNote':
    'Những công thức bạn hay mở đã được đưa lên đầu. Lịch sử này nằm trên máy bạn, không gửi đi đâu.',
  'home.browse.title': 'Duyệt theo nhóm',
  /* Đơn vị ghép sau tổng số ở tiêu đề khối: "Duyệt theo nhóm · 111 công thức". */
  'home.browse.unit': 'công thức',
  /*
   * Nhãn thay cho số trên ô nhóm mà chế độ Cơ bản giấu sạch — hiện chỉ có `corporate-finance`
   * (2/2 công thức đều mức nâng cao).
   *
   * Phải là CHỮ chứ không được in số `0`: ô vẫn bấm vào được và màn danh sách phía sau vẫn có
   * khối rỗng riêng kèm nút bật, nên một con số 0 trơ trọi ở đây đọc ra là "nhóm này rỗng" —
   * sai, và đúng kiểu im lặng mà FR-06 sinh ra để chặn.
   */
  'home.browse.advancedOnly': 'chỉ ở Nâng cao',
  /* Nhãn mảng ở trang chủ. Rộng rãi hơn chip lọc nên viết đủ chữ, không dùng `filter.segment.*`. */
  'home.segment.stock': 'Chứng khoán',
  'home.segment.personal': 'Tài chính cá nhân',
  'home.progress': 'Thư viện đang hoàn thiện dần — hiện có',
  /* Khối "Công cụ": lối vào những màn không có mục riêng ở thanh dưới. */
  'home.tools.title': 'Công cụ',
  'home.tools.data': 'Bảng dữ liệu',
  'home.tools.dataHint': 'Nhập hoặc dán chuỗi giá OHLCV dùng cho Beta, Sharpe, VaR',

  // Màn cài đặt — WF-13, gói 3.6.1
  'settings.mode.title': 'Chế độ hiển thị',
  'settings.mode.label': 'Cơ bản hay Nâng cao',
  /*
   * Câu này TỪNG SAI: nó hứa chế độ Cơ bản "mở sẵn phần giải thích", trong khi
   * `ExplanationAccordion` đã chuyển sang luôn mở ở CẢ HAI chế độ (`defaultOpen = true`, chủ
   * dự án chốt). Viết lại theo đúng những gì chế độ thật sự đổi, tính cả ba màn vừa nối dây.
   */
  'settings.mode.hint':
    'Nâng cao mở thêm công thức phức tạp, toàn bộ biến nâng cao, chuỗi định giá, và ô Beta / XIRR ở màn Danh mục.',
  'settings.theme.label': 'Sáng hay Tối',
  'settings.theme.hint':
    'Lựa chọn này nằm trên máy bạn và chỉ đổi màu giao diện. File PNG và bản in xuất ra vẫn luôn nền sáng.',
  'settings.units.title': 'Đơn vị & biểu thị',
  'settings.units.scale': 'Đơn vị tiền trong bảng',
  'settings.units.scaleHint':
    'Chỉ đổi cách bày con số trong bảng. Phép tính vẫn chạy bằng đồng, và ô nhập vẫn theo quy ước Việt Nam.',
  'settings.units.schedule': 'Biểu phí giao dịch',
  'settings.units.scheduleHint':
    'Dùng cho màn lợi nhuận ròng sau phí & thuế. Nguồn: Market Config.',
  'settings.data.title': 'Dữ liệu trên máy',
  'settings.data.note': 'Mọi thứ dưới đây nằm trong trình duyệt của bạn và không được gửi đi đâu.',
  'settings.about.title': 'Về sản phẩm',

  'data.prefs': 'Tuỳ chọn hiển thị',
  'data.recent': 'Từ khoá đã tìm',
  'data.series': 'Chuỗi giá đã nhập',
  'data.portfolio': 'Danh mục cá nhân',
  'data.saved': 'Phép tính đã lưu',
  'data.drafts': 'Số đang gõ dở',
  'data.usage': 'Công thức đã mở',
  'data.tickers': 'Danh sách mã',
  'data.prices': 'Giá đã lưu',
  'data.empty': 'chưa lưu gì',
  'data.chars': 'ký tự',
  'data.remove': 'Xoá',
  'data.clearAll': 'Xoá toàn bộ dữ liệu trên máy',
  /*
   * Thanh hoàn tác sau khi xoá MỘT kho (đợt 13).
   *
   * Bốn mẩu rời chứ không một câu trọn: `t()` không nội suy tham số (xem `i18n/index.ts`), mà
   * câu này phải ghép cả tên kho lẫn số giây đang đếm ngược. Ghép ở component, đúng nếp đã dùng
   * cho câu đếm kết quả ở trang chủ.
   * Ghép ra: "Đã xoá · Từ khoá đã tìm · còn 5 giây".
   */
  'data.removed': 'Đã xoá',
  'data.undo': 'Hoàn tác',
  'data.undoIn': 'còn',
  'data.seconds': 'giây',
  'data.clearConfirm':
    'Xoá toàn bộ dữ liệu đã lưu trên máy? Tuỳ chọn, lịch sử tìm, chuỗi giá và danh mục sẽ mất hết. Thao tác này không hoàn tác được.',

  'about.formulas': 'Công thức đang dùng được',
  'about.schedule': 'Biểu phí đã nạp',
  'about.offline': 'Chạy ngoại tuyến',
  'about.offlineValue': 'có',

  // Tiêu đề <h1> của màn. Chỉ có key cho màn nào THẬT SỰ hiện tiêu đề bằng chữ:
  // trang chủ dùng `home.h1` (ẩn cho trình đọc màn hình), danh mục dùng `portfolio.title`.
  'page.formulas.title': 'Công thức',
  'page.settings.title': 'Cài đặt',

  // Trang 404 — trước đợt 14 là bản mặc định tiếng Anh của Next, nằm ngoài AppShell.
  'notFound.title': 'Không tìm thấy trang này',
  'notFound.reason': 'Đường dẫn có thể gõ sai, hoặc trang đã được dời chỗ.',
  'notFound.suggest': 'Thử tìm công thức theo tên — gõ không dấu vẫn ra đúng.',
  'notFound.search': 'Tìm công thức',
  'notFound.home': 'Về trang chủ',
} as const;
