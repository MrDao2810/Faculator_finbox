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
  'search.placeholder': 'Tên công thức, ví dụ P/E hay dinh gia',
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
  'detail.export': '↓ Xuất',
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
  'preset.subtitle': 'Dữ liệu mẫu tĩnh qua DataProvider · bản đầu chưa có giá thời gian thực',
  'preset.searchLabel': 'Tìm mã cổ phiếu',
  'preset.searchPlaceholder': 'Tìm mã cổ phiếu…',
  'preset.load': 'Nạp',
  'preset.noMatch': 'Không có mã nào khớp. Thử gõ mã ngắn hơn, ví dụ “fpt”.',
  'preset.editableAfterLoad': 'Sau khi nạp, mọi ô vẫn sửa được từng cái một.',
  'preset.draftTag': 'số liệu bản thảo',
  'preset.draftTitle': 'Số liệu tự dựng, chưa đối chiếu báo cáo thật.',
  'preset.draftDetail':
    'Dùng để thử đường đi của tính năng. Đừng dựa vào con số tính ra để ra quyết định.',
  /* Câu ngắn đi kèm ngay CẠNH CON SỐ tiền — dùng ở màn Danh mục và trong file xuất ra.
     Khác `preset.draftDetail` ở chỗ nó phải đọc lọt trong một dòng hẹp. */
  'preset.draftInline': 'Thị giá lấy từ bộ số liệu mẫu tự dựng, chưa đối chiếu báo cáo thật.',
  'preset.draftExport': 'Số liệu đầu vào lấy từ bộ mẫu tự dựng, chưa đối chiếu báo cáo thật.',

  // Dán từ Excel / CSV — WF-11, gói 2.5.2
  // ── Danh mục cá nhân WF-06 (gói 3.4.1) ────────────────────────────────────
  'portfolio.title': 'Danh mục của tôi',
  'portfolio.subtitle': 'Lưu tại thiết bị · không cần đăng nhập',
  'portfolio.totalValue': 'Tổng giá trị',
  'portfolio.beta': 'Beta danh mục',
  'portfolio.xirr': 'XIRR toàn DM',
  'portfolio.count': 'Số mã',
  'portfolio.holdings': 'Nắm giữ',
  'portfolio.shares': 'CP',
  'portfolio.costPrice': 'giá vốn',
  'portfolio.weight': 'tỷ trọng',
  'portfolio.add': 'Thêm mã cổ phiếu',
  'portfolio.remove': 'Bỏ mã',
  'portfolio.empty': 'Chưa có mã nào. Thêm mã đầu tiên để xem tổng giá trị và tỷ trọng.',
  'portfolio.localTag': 'CỤC BỘ',
  'portfolio.localOnly':
    'Danh mục chỉ lưu trên thiết bị này (localStorage). Không gửi lên máy chủ.',
  'portfolio.formCode': 'Mã cổ phiếu',
  'portfolio.formQuantity': 'Số cổ phiếu',
  'portfolio.formCostPrice': 'Giá vốn một cổ phiếu (₫)',
  'portfolio.formBuyDate': 'Ngày mua',
  'portfolio.formBeta': 'Beta (để trống nếu chưa biết)',
  'portfolio.formSubmit': 'Thêm vào danh mục',
  'portfolio.formCancel': 'Huỷ',
  'portfolio.betaHint':
    'Beta chưa tính tự động được — cần chuỗi lợi suất của cả mã lẫn chỉ số thị trường. Nhập tay nếu bạn đã có số.',
  'portfolio.priceNote': 'Thị giá lấy từ bộ số liệu mẫu, chưa phải giá thời gian thực.',

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
  'series.localOnly': 'Chuỗi giá chỉ lưu trên thiết bị này (localStorage). Không gửi lên máy chủ.',
  'series.localTag': 'CỤC BỘ',
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
  /* Chỗ dành sẵn trong file in khi người dùng chọn kèm biểu đồ mà biểu đồ chưa dựng.
     Không nhắc sổ sách nội bộ (số gói WBS) — câu này nằm trong file người dùng chia sẻ ra ngoài. */
  'export.chartPending': 'Biểu đồ sẽ được bổ sung ở bản sau.',
  'export.withDetails': 'Kèm bảng biến & giải thích',
  'export.withDetailsHint': 'Ý nghĩa từng biến và phần giải thích cho người mới',
  'export.disclaimerLocked': 'Miễn trừ tự động đính kèm',
  'export.disclaimerLockedDetail': 'Không thể tắt — mọi file xuất ra đều mang tuyên bố miễn trừ.',
  'export.doPdf': 'Xuất PDF',
  'export.doPng': 'Xuất PNG',
  'export.failed': 'Chưa xuất được file. Trình duyệt có thể đang chặn tải xuống.',

  /* Nhãn chữ của công tắc. Luôn hiện cạnh nút gạt để trạng thái không phụ thuộc màu
     (NFR-USA-06) — cùng cách `inputs/Toggle` đang làm với nhãn của từng biến. */
  'switch.on': 'Bật',
  'switch.off': 'Tắt',

  // Trang chủ — WF-01, gói 3.1.1
  /*
   * Tiêu đề cấp một của trang chủ. Bản thiết kế hi-fi không vẽ nó, nên trên màn nó được ẩn
   * bằng `visually-hidden` — nhưng phải TỒN TẠI: trang chủ là URL priority 1.0 của sitemap mà
   * trước đợt này cả tài liệu không có lấy một <h1> nào.
   */
  'home.h1': 'Thư viện công thức tài chính và chứng khoán Việt Nam',
  /* Tiêu đề ẩn của khối kết quả tìm — để trình đọc màn hình biết vừa nhảy sang một vùng khác. */
  'home.search.resultsHeading': 'Kết quả tìm kiếm',
  'home.search.seeAll': 'Xem tất cả',
  'home.search.results': 'kết quả',
  /* Lối ra khi bộ lọc đang che mất kết quả: "Bỏ lọc · 12 kết quả". */
  'home.search.dropFilter': 'Bỏ lọc',
  'home.featured.title': 'Công thức dùng hằng ngày',
  'home.browse.title': 'Duyệt theo nhóm',
  /* Đơn vị ghép sau tổng số ở tiêu đề khối: "Duyệt theo nhóm · 108 công thức". */
  'home.browse.unit': 'công thức',
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
  'settings.mode.hint': 'Chế độ Cơ bản ẩn bớt biến nâng cao và mở sẵn phần giải thích.',
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
  'data.empty': 'chưa lưu gì',
  'data.chars': 'ký tự',
  'data.remove': 'Xoá',
  'data.clearAll': 'Xoá toàn bộ dữ liệu trên máy',
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
