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

  /*
   * Điều hướng — bốn mục. `nav.home` ("Trang chủ") đã BỎ ngày 15/09/2026: trang chủ gộp vào màn
   * Công thức, nên mục ấy không còn màn nào để trỏ tới — xem docblock `NAV_ITEMS`.
   */
  'nav.primary': 'Điều hướng chính',
  'nav.skipToContent': 'Bỏ qua điều hướng, tới nội dung',
  'nav.formulas': 'Công thức',
  'nav.portfolio': 'Danh mục',
  'nav.settings': 'Cài đặt',
  'nav.about': 'Về chúng tôi',
  /* Nhãn ngắn của riêng thanh tab dưới — lý do hình học ghi ở `NavItem.shortLabelKey`. */
  'nav.aboutShort': 'Giới thiệu',
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
   * `search.hint` — câu "Gõ không dấu vẫn ra đúng: “dinh gia” ra “Định giá”…" từng đứng dưới ô và
   * trong hai khối rỗng — đã BỎ HẲN theo yêu cầu chủ dự án: nó giải thích một tính năng người dùng
   * không cần biết mới dùng được, cứ gõ là ra. Khả năng bỏ dấu nằm ở `normalizeVi()` tầng Domain,
   * không phụ thuộc câu chữ nào cả.
   */
  'search.placeholder': 'Tên công thức, ví dụ P/E hay định giá',
  'search.clear': 'Xoá ô tìm kiếm',

  // Màn tìm kiếm WF-09 — gói 3.1.3
  'search.recent.title': 'Tìm gần đây',
  'search.recent.clear': 'Xoá lịch sử',
  'search.tip': 'Gõ tên công thức, tên viết tắt, hoặc điều bạn đang muốn tính.',
  'search.matchNote': 'Khớp không dấu với',
  'search.resultCount': 'kết quả',
  'search.noMatch': 'Không tìm thấy',
  'search.suggest.title': 'Có thể bạn cần',
  /*
   * `search.seeAll` — "Xoá tìm kiếm · xem tất cả" — đã BỎ. Chủ dự án cho gỡ chính cái link ấy khỏi
   * trạng thái không-tìm-thấy (lý do ở `SearchScreen.tsx`), nhưng khoá thì ở lại và thành khoá chết:
   * `i18n.test.ts` báo đỏ đúng nó. Link cuối thẻ nhóm nay dùng `search.folder.seeAll`, khác chữ và
   * khác việc — không phải chỗ để hồi sinh khoá cũ.
   */
  /* Khối lối tắt ở trạng thái chưa gõ gì. Số trên ô là số công thức ĐÃ DÙNG ĐƯỢC. */
  'search.hot.title': 'Danh mục hot',
  /*
   * Thẻ nhóm ở khổ PC — bản vẽ "Thư mục theo nhóm". Hai link cuối thẻ ghép thêm con số hoặc tên
   * nhóm phía sau ("Xem tất cả 20 →", "Mở nhóm Vay nợ →"), nên viết cụt, không dấu chấm.
   * `search.noneIn` mở đầu hàng chip những nhóm KHÔNG có kết quả, đứng cuối trạng thái đang gõ.
   */
  'search.folder.seeAll': 'Xem tất cả',
  'search.folder.open': 'Mở nhóm',
  'search.noneIn': 'Không có kết quả trong:',

  /*
   * Lọc — WF-02. Bốn khoá `filter.segment.*` (Mảng · Tất cả · Chứng khoán · Cá nhân) đã BỎ cùng
   * ba tab mảng khi trang chủ gộp vào màn Công thức: bản vẽ chỉ còn một hàng chip nhóm.
   */
  'filter.category.label': 'Nhóm công thức',
  'filter.category.all': 'Tất cả nhóm',
  /*
   * Chữ thay cho con số trên chip của nhóm mà chế độ Cơ bản giấu sạch — hiện chỉ có
   * `corporate-finance` (2/2 công thức mức nâng cao). Chữ chứ không in `0`: số 0 đọc ra là "nhóm
   * này rỗng", trong khi sự thật là "nhóm này chỉ có ở chế độ kia" — kiểu im lặng FR-06 chặn.
   */
  'filter.category.advancedOnly': 'chỉ ở Nâng cao',
  /* Nhãn hai nút cuộn hàng chip ở khổ PC — nút chỉ có mũi tên nên chữ nằm ở `title`. */
  'filter.category.scrollPrev': 'Nhóm phía trước',
  'filter.category.scrollNext': 'Xem thêm nhóm',
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

  // Danh sách kết quả — cũng là tiêu đề khối "DANH SÁCH CÔNG THỨC" của màn Công thức
  'list.label': 'Danh sách công thức',
  'list.count': 'công thức',
  /* Mở đầu dòng đếm: "Hiển thị · 79 công thức". */
  'list.showing': 'Hiển thị',
  /* Nhãn nhìn thấy đứng trước cụm Cơ bản / Nâng cao trong hàng tiêu đề danh sách. */
  'list.levelLabel': 'Mức độ',
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
  /*
   * ── Hai dòng phụ của màn nạp mã, và chúng phải dùng CHUNG MỘT DANH TỪ ────────────────
   *
   *   ô mở  → 'dữ liệu của VHM'   (ghép trước tên mã)
   *   ô khoá → 'dữ liệu mẫu'      (đứng một mình: không tên mã, không phủ định)
   *
   * Cùng chữ "dữ liệu", chỉ khác vế sau. Đó là toàn bộ thiết kế của cặp câu này: người đọc
   * so đúng MỘT chỗ khác nhau ('của VHM' ↔ 'mẫu') thay vì phải dịch hai danh từ về cùng một
   * nghĩa trước đã.
   *
   * ── Lịch sử, vì cả hai vế đều đã sai một lần ────────────────────────────────────────
   *
   * Vế ô khoá đổi ba đời, mỗi lần đều vì nó cố nói về MÃ thay vì nói về CON SỐ:
   *
   *   'VHM không có'          → cụt: không có GÌ?
   *   'không phải số của VHM' → đủ nghĩa nhưng là một mệnh đề phủ định; chủ dự án chốt
   *                             *"không cần phải giải thích… ghi là 'dữ liệu mẫu' là được rồi"*.
   *   'dữ liệu mẫu'           → gọi thẳng tên thứ đang nằm trong ô: số của ví dụ minh hoạ
   *                             trong Registry.
   *
   * Vế ô mở thì trước là 'số của VHM', và chính vì vế kia đã đổi sang "dữ liệu" mà nó hỏng
   * theo: chủ dự án đọc hai câu cạnh nhau rồi hỏi *"nếu là dữ liệu của mã thì phải ghi là
   * 'dữ liệu của …' chứ? cứ ghi là 'số của …' nghĩa là gì. ko hiểu"*. Hai danh từ khác nhau
   * cho hai thứ cùng loại đọc ra như hai khái niệm khác nhau.
   *
   * ⚠ Hai vế này sống hay chết cùng nhau. Đổi chữ ở một vế thì phải soi lại vế kia — đúng
   * cái bẫy vừa sập một lần.
   * ⚠ Và đừng ghép tên mã vào 'dữ liệu mẫu' cho "cân". Đó là bản đã bị chê ở đời thứ hai.
   */
  'input.fromTicker': 'dữ liệu của',
  'input.sampleData': 'dữ liệu mẫu',
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
  'input.revert': 'Nhận tự động',
  'input.overridden': 'đã nhập tay',
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
  /*
   * `result.live` ("cập nhật tức thì") đã BỎ — chủ dự án chốt 14/09/2026, cũng là mục #34 của
   * bảng feedback test nội bộ.
   *
   * FR-05 vẫn được giữ bằng CHỨC NĂNG chứ không bằng lời: gõ tới đâu con số đổi tới đó, và người
   * dùng thấy điều ấy ngay ở lần gõ đầu tiên. Một nhãn dán thường trực để hứa một hành vi mà bản
   * thân hành vi tự nói ra được thì chỉ chiếm chỗ trên dòng nhãn.
   *
   * Cùng nếp với `settings.data.note` và `portfolio.localOnly` đã gỡ trước đó: bỏ lời, giữ việc.
   */
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
  /*
   * `example.editHint` ("Sửa được ngay tại đây — thay bằng số thật của mã bạn đang xem.") đã BỎ,
   * chủ dự án chốt 10/09/2026. Nó là câu hướng dẫn cách dùng đứng ở đúng chỗ người dùng đã tự làm
   * được việc ấy — ô nhập nằm ngay trên. Lý do đầy đủ ở chỗ nó từng đứng trong `ExampleBlock.tsx`.
   */
  'example.original': 'Ví dụ gốc cho:',
  'example.reset': 'Về số của ví dụ',
  /*
   * Nhãn đứng trước `example.source` — trích dẫn của MỘT ví dụ cụ thể (khác `source.title`, mục
   * lớn "Nguồn tham khảo" trích lý thuyết/pháp lý của cả công thức). Chỉ khoảng một phần ba công
   * thức neo ví dụ vào một trường hợp có thật mới có `example.source`; phần còn lại không hiện
   * dòng này.
   */
  'example.source': 'Nguồn:',
  'source.title': 'Nguồn tham khảo',
  /*
   * ── Cả nhóm `flow.*` đã BỎ ngày 16/09/2026 ─────────────────────────────────
   *
   * `flow.title`, `flow.branch`, `flow.alsoFrom`, `flow.stepError`, `flow.cyclicWarning` chỉ
   * phục vụ hình vẽ chuỗi phụ thuộc ở đầu khối Chuỗi công thức. Hình ấy không còn — nó không giữ
   * chức năng nào mà thẻ bước bên dưới không có sẵn, và ba lần viết lời dẫn đều không cứu nổi.
   * Lý do đầy đủ ở docblock `ui/screens/ChainBody.tsx`.
   */

  // Chuỗi công thức nối nhau — WF-04, FR-15 (gói 5.2.3)
  'chain.title': 'Chuỗi công thức',
  /*
   * `chain.intro` cũng BỎ, và đây là lần thứ hai. Cả ba bản từng viết (10/09 "Kết quả mỗi bước
   * chảy thẳng vào ô của bước sau…", 16/09 "Số liệu chảy theo chiều mũi tên…", rồi "Mỗi ô là một
   * công thức…") đều làm cùng một việc: đi giải thích một hình vẽ. Bỏ hình thì hết việc cho câu
   * dẫn — hai tiêu đề nhóm ngay dưới đã nói đủ, và nói bằng chính chữ của việc đang làm.
   */
  'chain.upstreamHeading': 'Bước trước — cấp số liệu cho công thức đang xem',
  'chain.downstreamHeading': 'Bước sau — dùng kết quả của công thức đang xem',
  'chain.openStep': 'Mở màn riêng của bước này',
  'stat.eyebrow': 'CHỈ SỐ',

  // Màn chi tiết công thức — WF-03, gói 3.2.1
  'detail.loadPreset': 'Nạp mẫu',
  'detail.preset': 'Đã nạp',
  'detail.jumpToExample': 'Xem ví dụ thực tế ↓',
  /*
   * `detail.fundamentalsSource` ('số liệu Finbox_v2 tới' + ngày) ĐÃ BỎ ngày 14/09/2026 cùng với
   * `detail.tickerSticky` — xem chỗ khoá ấy từng nằm, phía dưới. Khoá bỏ hẳn chứ không để lại một
   * chuỗi không ai đọc: cửa khoá mồ côi ở `i18n.test.ts` bắt đúng loại rác đó.
   */
  /*
   * Ba câu dưới đứng SAU mã (“FPT · …”), nên viết thường.
   *
   * `tickerFailed` và `tickerNoData` là hai ca KHÁC HẲN nhau, và trước đợt này chúng dùng chung
   * một câu. Mất mạng thì thử lại là hợp lý; còn mã không có số liệu cơ bản (khoảng 100 trên 1.005
   * mã — báo cáo chưa đủ bốn quý liền nhau, hoặc bộ số không tự khớp) thì thử lại bao nhiêu lần
   * cũng vậy. Một câu chung khiến người dùng bấm lại mãi một thứ không bao giờ chạy.
   */
  'detail.tickerLoading': 'đang lấy số liệu thật của mã…',
  'detail.tickerFailed':
    'không lấy được số liệu của mã — nhập tay, hoặc bấm “Nạp mẫu” để dùng bộ số liệu sẵn có.',
  'detail.tickerNoData':
    'mã này chưa có đủ số liệu cơ bản để nạp (báo cáo chưa đủ bốn quý liền nhau, hoặc các con số ' +
    'không khớp nhau). Thử lại cũng vậy — chọn mã khác, hoặc nhập tay.',
  /*
   * ── Hai nút icon ở hàng tiêu đề ────────────────────────────────────────────
   *
   * Chủ dự án chốt: *"button xuất cần thay đổi sang dạng icon… 1 icon tượng trưng cho download 1
   * icon tượng trưng cho share link"*. Chữ giữ lại bên cạnh icon chứ không bỏ hẳn: icon một mình
   * thì cái mũi tên xuống và cái mắt xích trông na ná nhau ở khổ 16px, mà đây là hai việc khác
   * hẳn — một cái tải file về máy, một cái sao chép đường dẫn.
   *
   * `detail.export` cũ ('↓ Xuất') bỏ: mũi tên nay là icon thật, không còn phải vẽ bằng ký tự.
   */
  'detail.download': 'Tải về',
  'detail.shareLink': 'Chia sẻ',
  'detail.shareCopied': 'Đã sao chép link',
  /*
   * Câu nói ra thứ link KHÔNG mang. Chỉ hiện với công thức ăn chuỗi giá — xem `share-inputs.ts`:
   * 248 phiên không nhét vừa URL, và cắt bớt cho vừa là để người nhận thấy một con số khác người
   * gửi thấy.
   */
  'detail.shareNoSeries': 'Link mang theo số liệu đang nhập; chuỗi giá thì người nhận phải tự nạp.',

  /*
   * ── Mã dính theo lượt duyệt ────────────────────────────────────────────────
   *
   * `detail.tickerSticky` ('đang dùng cho mọi công thức trong lượt xem này') và
   * `detail.fundamentalsSource` ('số liệu Finbox_v2 tới' + ngày) BỎ ngày 14/09/2026 theo yêu cầu
   * chủ dự án: *"bỏ đoạn text sau ở trong công thức khi mới nạp mã"*.
   *
   * Thanh mã giữ lại huy hiệu mã và hai nút, nên vế "màn phải nói ra đang dùng mã nào" — điều kiện
   * để việc tự điền ô không thành một bất ngờ — vẫn còn. Vế MỐC NGÀY thì nay không còn chỗ nào
   * trên màn nói ra; đó là thay đổi có chủ ý, và docblock của `active-ticker.ts` đã ghi lại.
   */
  'detail.tickerChange': 'Đổi mã',
  'detail.tickerClear': 'Bỏ mã',

  /*
   * ── Lưu phép tính vào tab "Công thức" của màn Danh mục ─────────────────────
   *
   * Nút hiện ở CẢ 111 công thức, không riêng nhóm có mã: người dùng tính một khoản vay hay một
   * mức phí cũng muốn giữ lại kết quả y như khi định giá một mã.
   */
  'detail.saveToPortfolio': '☆ Lưu vào danh mục',
  /*
   * Nút bỏ thay đổi, đứng BÊN TRÁI nút lưu ở cuối trang. "Huỷ và thoát" chứ không chỉ "Huỷ": nó
   * làm hai việc — trả mọi ô về mặc định, xoá bản nháp, rồi rời màn — nên tên nút phải nói cả hai,
   * không thì người dùng tưởng chỉ hoàn tác tại chỗ.
   */
  'detail.cancel': 'Huỷ và thoát',
  /*
   * Nạp một mã cho công thức KHÔNG dùng số liệu của mã nào (41 công thức: vay, tiết kiệm, phái
   * sinh, lãi kép…). Hai khoá tách rời vì giữa chúng có `<strong>{mã}</strong>` — ghép một chuỗi
   * rồi cắt lại theo dấu là kiểu vỡ ngay khi dịch sang ngôn ngữ khác trật tự.
   */
  'detail.presetNoData': 'Công thức này không dùng số liệu của mã',
  'detail.presetNoDataFix':
    'Nó chạy bằng số của chính bạn — gõ thẳng vào các ô ở trên, hoặc bấm "Xem ví dụ minh hoạ" để ' +
    'lấy một bộ số mẫu.',
  /*
   * ── Dải "AAA điền được 2 trong 4 ô…" ĐÃ BỎ, cùng cả cụm khoá `detail.presetPartial*` ──────
   *
   * Chủ dự án bỏ đoạn văn ấy vì nó tốn không gian mà nói một điều đặt sai chỗ: kể tên vài ô rồi
   * để người dùng tự dò xuống dưới xem ô nào là ô nào. Thay bằng `input.sampleData` ngay
   * trên — dòng phụ nằm trên chính cái ô nó nói tới, và ô ấy khoá lại luôn.
   *
   * Đừng dựng lại cụm khoá này. Thiếu lời giải thích thì sửa dòng phụ trên ô, không thêm một
   * đoạn văn thứ hai nói cùng một điều ở xa hơn.
   */
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
  /*
   * Nhãn khối bày những đại lượng công thức TỰ TÍNH RA từ các ô trên — thứ biểu đồ bóc tách gọi
   * tên và vẽ thành cột, nhưng không có ô nhập nào mang tên ấy. Xem `DerivedNote.tsx`.
   */
  'detail.derivedInUse': 'Từ các ô trên, công thức tính ra',
  'detail.pasteSeries': 'Dán chuỗi giá từ Excel',
  'detail.loadExample': 'Xem ví dụ minh hoạ',
  'detail.exampleLoaded': 'Đã xem ví dụ minh hoạ ✓',
  'detail.exampleSeriesNote':
    'Đây là chuỗi số dựng sẵn để minh hoạ đúng ý nghĩa công thức, không phải giá cổ phiếu thật của công ty nào.',
  'detail.exampleSeriesLabel': 'ví dụ minh hoạ',
  /*
   * `detail.applyToTable` / `detail.appliedToTable` đã BỎ cùng nút của chúng — chủ dự án chốt
   * 14/09/2026. Việc "đưa chuỗi và mã sang bảng WF-05" nay chạy tự động khi bấm
   * `detail.openDataTable`; xem `handOverToDataTable()` ở `FormulaDetail.tsx`.
   */
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
   * Nhóm nút đổi lối vẽ.
   *
   * Bản trước là 'Kiểu hình', chọn theo lập luận "nhãn nói VIỆC chứ không nói cơ chế". Chủ dự án
   * đổi lại thành 'Loại biểu đồ' ngày 09/09/2026. Lập luận cũ trả giá bằng thứ quan trọng hơn:
   * 'kiểu hình' không phải chữ người đọc gặp ở đâu khác, nên nó bắt người ta dừng lại đoán, ngay
   * cạnh một ô chọn đã dài sẵn. 'Loại biểu đồ' nói đúng thứ hai cái nút làm và ai cũng đọc được.
   * Đừng khôi phục bản cũ.
   */
  'chart.kindLabel': 'Loại biểu đồ',
  'chart.kindLine': 'Đường',
  'chart.kindBar': 'Cột',
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
   * ── CẢ HAI khoá gợi ý dưới biểu đồ đã BỎ ────────────────────────────────────────────────────
   *
   * `chart.applyHintReady` ("Bấm vào biểu đồ để áp dụng giá trị đó vào ô nhập.") bỏ trước, rồi
   * `chart.applyHintTimeAxis` ("Trục đang là thời gian nên bấm không ghi được gì — đổi mục 'Xem
   * kết quả đổi theo' ở trên sang một biến số…") bỏ nốt ngày 14/09/2026. Cả component `ApplyHint`
   * lẫn luật CSS `.applyHint` đi theo — dưới hình nay không còn dòng gợi ý nào.
   *
   * Cái giá, ghi ở đây vì nó là lý do câu thứ hai từng được giữ lại: trục X mặc định của 35 công
   * thức ăn chuỗi giá LÀ thời gian, và bấm lúc đó không ghi gì vào ô Số liệu. Không còn câu nào
   * nói ra điều ấy, nên cú bấm đầu tiên trên những màn đó trông như tính năng không hoạt động.
   * Tính năng vẫn còn nguyên (`canApplyPoint` ở `ChartBody`); đổi trục sang một biến số thì bấm
   * vẫn áp dụng được.
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
  /*
   * ── Bốn chuỗi của sheet này đã BỎ ngày 09/09/2026, theo yêu cầu của chủ dự án ───────────────
   *
   *   `preset.subtitle`          "Kho mã mẫu — mã nào cũng có sẵn 248 phiên giá…"
   *   `preset.rankedNote`        "Bốn mã chọn theo kết quả của chính công thức này…"
   *   `preset.browseMarketNote`  "Toàn bộ mã đang giao dịch… chỉ có MỘT phiên giá…"
   *   `preset.editableAfterLoad` "Sau khi nạp, ô nào mã có số thì vẫn sửa được…"
   *
   * Và cặp `preset.draftTitle` / `preset.draftDetail` (khối vàng "giá quá khứ tự dựng") ở dưới.
   *
   * Đừng dựng lại một khoá cùng nghĩa dưới tên khác. Cái đáng biết khi quay lại chỗ này: hai câu
   * `seriesOnlyNote` / `noTickerNote` ngay dưới KHÔNG bị gỡ theo, và mỗi câu ở lại vì một lý do
   * riêng — ghi tại `PresetSheet.tsx`.
   *
   * ⚠ `preset.topPicks` ngay dưới đứng đúng chỗ `rankedNote` từng đứng, nhưng KHÔNG phải nó quay
   * lại: câu cũ tả CÁCH XẾP ("xếp từ thấp đến cao — nhìn một lượt là thấy biên độ"), nhãn mới chỉ
   * gọi tên bốn dòng bên dưới là gì. Chủ dự án chốt 09/09/2026: bỏ câu dài, giữ một nhãn ngắn.
   */
  'preset.load': 'Nạp',
  /*
   * Nhãn của bốn dòng khi chúng thật sự được chọn theo công thức đang xem.
   *
   * Chỉ đúng ở ca có xếp hạng (`pickPresetsFor()` chạy thật công thức với từng mã trong kho rồi
   * trải bốn mã trên biên độ kết quả). Hai ca còn lại bốn mã là bộ `WF10_CODES` theo thứ tự kho,
   * nên gọi chúng là "hợp nhất cho công thức này" là nói sai — `PresetSheet` gác nhánh ấy.
   */
  'preset.topPicks': 'Mẫu ưu tiên — bốn mã hợp nhất để chạy thử công thức này',
  /*
   * Hai câu dẫn còn lại của sheet — xem `PresetSheet`. Tách riêng chứ không gộp: gộp lại thì câu
   * chung phải mờ tới mức không nói được gì, mà đây đúng chỗ người dùng cần biết bấm Nạp xong sẽ
   * đổi cái gì.
   */
  'preset.seriesOnlyNote':
    'Công thức này chạy bằng chuỗi phiên giá. Chỉ phiên gần nhất là giá thật; đường đi trước đó ' +
    'là số tự dựng, nên đọc bốn con số dưới đây như ví dụ, đừng như so sánh thị trường.',
  /*
   * Cố ý KHÔNG mở đầu bằng "Công thức này không dùng số liệu của mã" như `detail.presetNoData`.
   * Sheet vẫn nằm trong DOM sau khi đóng, nên hai câu gần trùng làm mọi truy vấn theo chữ trả về
   * hai phần tử — và người dùng nạp xong cũng đọc đúng một câu hai lần. Sheet trả lời "vì sao lại
   * là bốn mã này", còn câu kia trả lời "vừa bấm Nạp thì có gì đổi": hai câu hỏi khác nhau.
   */
  'preset.noTickerNote':
    'Bốn mã dưới đây không đổi được ô nào của công thức này — nó chạy bằng số của chính bạn. Nạp ' +
    'một mã ở đây chỉ để mã đó theo bạn sang những công thức có dùng tới.',
  'preset.cannotCompute': 'không ra kết quả với mã này',
  /* Dòng phụ cho công thức chỉ ăn chuỗi giá: mức giá là thứ duy nhất khác nhau giữa các mã. */
  'preset.lastPrice': 'Giá phiên gần nhất',
  /* Lối sang kho mã lớn. Cố ý không chép số mã vào câu: con số đó do nguồn quyết, chép vào
     đây là để nó rữa trong im lặng. */
  'preset.browseMarket': 'Tìm mã khác trong toàn thị trường →',
  /*
   * Nhãn bản thảo nay nói ĐÚNG NỬA nào là số tự dựng.
   *
   * Trước đợt mở kho mã, câu này là "Số liệu tự dựng, chưa đối chiếu báo cáo thật" — đúng lúc
   * viết, sai từ lúc `gen:live-fundamentals` có mặt: EPS, giá trị sổ sách, số CP, lợi nhuận và
   * cổ tức đọc thẳng từ Finbox_v2, và nay thị giá phiên gần nhất cũng vậy. Phần còn tự dựng là
   * ĐƯỜNG ĐI của giá qua 247 phiên trước đó, vì Finbox_v2 không có lịch sử giá dài.
   *
   * Nói quá cũng hỏng như nói thiếu: dán "chưa đối chiếu báo cáo thật" lên một con số vừa lấy
   * từ báo cáo thật thì lần sau người dùng không tin cả cảnh báo lẫn con số.
   */
  'preset.draftTag': 'giá quá khứ tự dựng',
  /*
   * ⚠ `preset.draftTitle` / `preset.draftDetail` đã BỎ — khối vàng nói rõ 247/248 phiên giá là số
   * tự dựng. Chủ dự án chốt gỡ.
   *
   * Cái giá, đo được chứ không suy đoán: cả bốn mã mẫu đều `isDraft`, nên `mixedDraft` trong
   * `PresetSheet` luôn sai và `preset.draftTag` ngay trên KHÔNG bao giờ hiện với bộ mẫu hiện tại.
   * Tức màn hình không còn câu nào nói ra điều đó. Chỗ còn giữ lời hứa: cờ `isDraft` trong
   * `samples.ts` (ba ca kiểm ghim), câu `preset.seriesOnlyNote` ở ca công thức ăn chuỗi, và
   * `preset.draftExport` đính vào mọi file xuất ra.
   *
   * Cùng nếp với `portfolio.localOnly` và `settings.data.note` đã gỡ cùng ngày — quyết định có
   * chủ ý, không phải một cửa gác bị rơi.
   */
  /* Câu ngắn đi kèm ngay CẠNH CON SỐ tiền — dùng ở màn Danh mục và trong file xuất ra. */
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
  /*
   * Nay còn là TÊN MÀN trên thanh trên (`headerTitleKey()`), không chỉ là `<h1>` trong thân màn.
   * Phụ đề `portfolio.subtitle` đi kèm nó đã bỏ hẳn (chủ dự án chốt 09/09/2026).
   */
  'portfolio.title': 'Danh mục của tôi',
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
  /*
   * ⚠ `portfolio.localTag` ("CỤC BỘ") và `portfolio.localOnly` đã XOÁ — chủ dự án chốt 09/09/2026.
   *
   * Ghi lại vì hai khoá này không phải chú thích thường. `localOnly` là chỗ DUY NHẤT sản phẩm nói
   * trên màn rằng mã cổ phiếu rời khỏi máy để tra thị giá, còn số lượng và giá vốn thì không —
   * CLAUDE.md gọi tên nó ở mục "The one network call". Cùng đợt, `settings.data.note` cũng xoá.
   *
   * Cam kết bản thân KHÔNG đổi: chỉ mã cổ phiếu vào request, và ca kiểm ở `src/data/finbox/` vẫn
   * gác điều đó. Thứ mất đi là lời nói ra trên màn. Muốn trả lại thì rẻ nhất là một dòng ở khối
   * "Về sản phẩm" của màn Cài đặt.
   */
  'portfolio.formCode': 'Mã cổ phiếu',
  // "Số cổ phiếu" trần bị đọc nhầm thành số CP LƯU HÀNH — cụm mà Domain dùng cho
  // `sharesOutstanding`. Thêm "nắm giữ" để hai khái niệm không còn trùng chữ.
  'portfolio.formQuantity': 'Số cổ phiếu nắm giữ',
  'portfolio.formCostPrice': 'Giá vốn một cổ phiếu (₫)',
  'portfolio.formBuyDate': 'Ngày mua',
  /*
   * Nhãn trần, KHÔNG kèm "(để trống nếu chưa biết)" — chủ dự án chốt 14/09/2026 bỏ vế ấy.
   *
   * Nó nói một điều mà dòng gợi ý ngay dưới đã nói đủ và nói rõ hơn ("nhập tay nếu bạn đã có số"),
   * nên đặt trong nhãn là bắt người dùng đọc cùng một câu hai lần — mà lại đọc trước, lúc còn chưa
   * biết beta là gì. Nhãn của một ô nhập nên gọi tên thứ nó nhận, không mang theo hướng dẫn.
   */
  'portfolio.formBeta': 'Beta',
  'portfolio.formSubmit': 'Thêm vào danh mục',
  'portfolio.formCancel': 'Huỷ',
  /*
   * Câu này phải NÓI BETA LÀ GÌ trước, rồi mới nói vì sao phải nhập tay.
   *
   * Bản trước chỉ có vế thứ hai ("chưa tính tự động được — cần chuỗi lợi suất của cả mã lẫn chỉ số
   * thị trường"), và chủ dự án báo đúng chỗ ấy: người chưa biết beta đọc xong vẫn không biết phải
   * gõ con số gì vào ô. Một câu giải thích vì sao KHÔNG có số chỉ có nghĩa với người đã biết số ấy
   * là gì — mà ô này thì đứng trước cả hai loại người dùng.
   *
   * Con số 1,5 lấy đúng khuôn `meaning` của công thức `beta` trong Registry ("VN-Index tăng hay
   * giảm 1% thì cổ phiếu này thường tăng hay giảm khoảng 1,5%"). Cố ý chép ý chứ không chép chữ:
   * hai chỗ nói cùng một điều bằng cùng một ví dụ thì người đọc gặp lại là nhận ra ngay, còn hai
   * cách giải thích khác nhau cho cùng một khái niệm mới là thứ làm họ ngờ mình hiểu sai.
   *
   * Nhắc VN-Index bằng tên thay vì "chỉ số thị trường": đó là chỉ số mà công thức `beta` thật sự
   * hồi quy theo, và người dùng Việt Nam đọc tên ấy ra ngay.
   */
  'portfolio.betaHint':
    'Beta đo mức mã này nhảy mạnh hay yếu hơn VN-Index — beta 1,5 nghĩa là chỉ số nhích 1% thì mã ' +
    'thường nhích khoảng 1,5%, dưới 1 là nhẹ hơn thị trường. Sản phẩm chưa tự tính được vì cần ' +
    'chuỗi lợi suất của cả mã lẫn chỉ số; nhập tay nếu bạn đã có số.',
  /*
   * `portfolio.priceNote` ("Thị giá lấy từ Finbox theo phiên gần nhất, không phải giá khớp lệnh")
   * đã BỎ — chủ dự án chốt 14/09/2026, cùng đợt với "(để trống nếu chưa biết)" và "cập nhật tức thì".
   *
   * Câu ấy trả lời một câu hỏi chưa ai hỏi, ngay trước khi người dùng kịp chọn mã: lúc ô còn trống
   * thì chưa có thị giá nào trên màn để mà đính kèm điều kiện. Thứ giữ lời hứa "số này cũ tới đâu"
   * không mất đi — nó nằm đúng CẠNH CON SỐ, ở dòng ngày phiên mà `PortfolioScreen` bày khi giá lấy
   * từ bộ nhớ đệm (`PriceState = 'stale'`), và ca kiểm ghim dòng ấy vẫn nguyên.
   *
   * Ô mã ở chế độ SỬA cũng đã bỏ nốt câu của nó (`portfolio.editHint`) trong cùng ngày, nên giờ
   * ô mã KHÔNG còn dòng gợi ý nào ở cả hai chế độ — xem bia mộ của khoá ấy.
   */
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
  /*
   * ── `portfolio.editHint` đã XOÁ (14/09/2026) ──────────────────────────────────────────────
   *
   * "Đổi số lượng, giá vốn, ngày mua hoặc beta. Muốn đổi mã thì bỏ rồi thêm lại." Chủ dự án chốt
   * bỏ, cùng đợt với `portfolio.formulaHint`.
   *
   * Vế đầu kể lại thứ form đã tự bày: bốn ô đổi được đang hiện ngay bên dưới câu ấy. Vế sau là
   * lối đi vòng cho một việc hiếm (đổi mã của một dòng đã có), không đáng một dòng chữ thường
   * trực trên MỌI lượt sửa. Còn việc "mã đang khoá" thì nút mã `disabled` đã nói bằng hình.
   */
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
  /*
   * ── `portfolio.formulaHint` đã XOÁ (14/09/2026) ───────────────────────────────────────────
   *
   * "Tuỳ chọn. Chọn rồi thì lưu xong sẽ mở thẳng công thức đó với số liệu của mã đã điền sẵn."
   *
   * Vế "tuỳ chọn": ô này không có dấu bắt buộc nào và form gửi được khi bỏ trống — không cần một
   * câu nói ra. Vế "lưu xong sẽ mở": nhãn nút gửi ngay bên dưới đã nói đúng thế
   * (`portfolio.formSubmitOpen` "Thêm và mở công thức" / `portfolio.formSaveOpen` "Lưu và mở
   * công thức"), và nhãn nút thì đọc được ĐÚNG LÚC bấm.
   *
   * ⚠ Hai nhãn ấy nay là chỗ DUY NHẤT nói ra điều đó — dòng phụ của sheet
   * (`portfolio.formulasSubtitle`) cũng đã xoá cùng ngày. Đổi chữ trên hai nhãn thì phải giữ
   * nguyên vế "mở", đừng rút gọn thành "Lưu".
   */
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
   * ── `portfolio.formulasSubtitle` đã XOÁ (14/09/2026) ──────────────────────────────────────
   *
   * "Chọn một công thức — lưu xong sẽ mở với số liệu của mã điền sẵn". Chủ dự án cho là chữ
   * thừa, và đúng: tiêu đề sheet đã nói đây là danh sách công thức, mỗi dòng là một nút bấm rõ
   * ràng, còn vế "điền sẵn" thì từng dòng đã in ra bằng con số thật ("2/2 ô điền sẵn") — cụ thể
   * hơn hẳn câu văn.
   *
   * Điều câu ấy giữ được mà chỗ khác không nói: bấm một dòng là CHỌN chứ không MỞ ngay. Nay
   * nhãn nút gửi form gánh vế đó — `portfolio.formSubmitOpen` ("Thêm và mở công thức") /
   * `portfolio.formSaveOpen` ("Lưu và mở công thức") nói đúng lúc nào thì trang mới mở. Đừng
   * dựng lại dòng phụ này mà không xét hai nhãn ấy trước.
   */
  // Đứng SAU cặp số "2/2", nên viết thường và mở đầu bằng đơn vị.
  'portfolio.formulasFilled': 'ô điền sẵn',
  'portfolio.formulasNoPrice':
    'Chưa tra được thị giá của mã này, nên các công thức cần giá đã bị lược bớt hoặc điền ít ô hơn.',

  /*
   * ── Khối "Phép tính đã lưu" ở màn Danh mục ──────────────────────────────────
   *
   * Ba khoá của cụm tab đã XOÁ hẳn (14/09/2026): `tabHoldings` · `tabSaved` · `savedEmpty`. Chủ dự
   * án bỏ cụm tab: *"bỏ tabbar đi và giữ lại toàn bộ giao diện và logic thêm mã cổ phiếu cũ"*.
   *
   * Bốn khoá dưới đây từng xoá cùng lượt ấy rồi QUAY LẠI (15/09/2026), kèm một khoá tiêu đề mới:
   * nút Lưu ở 111 màn chi tiết vẫn ghi vào kho mà không còn chỗ nào bày kho ra, và chủ dự án báo
   * đó là lỗi. Danh sách nay là khối thứ hai của màn, không tab. `savedEmpty` không quay lại vì
   * khối chỉ dựng khi kho có mục — xem chú thích cạnh khối trong `PortfolioScreen.tsx`.
   */
  'portfolio.savedTitle': 'Phép tính đã lưu',
  'portfolio.savedOpen': 'Xem',
  'portfolio.savedRemove': 'Xoá',
  // Đứng TRƯỚC một ngày: "lưu 15/09/2026".
  'portfolio.savedAt': 'lưu',
  'portfolio.savedNeedsSeries': 'Cần chuỗi giá',

  // ── Chọn mã từ toàn thị trường — gói "Danh mục dùng số liệu thật" ──────────
  'ticker.title': 'Chọn mã cổ phiếu',
  'ticker.subtitle': 'Toàn bộ mã đang giao dịch, lấy từ Finbox',
  'ticker.searchLabel': 'Tìm mã hoặc tên doanh nghiệp',
  'ticker.searchPlaceholder': 'FPT, Hoà Phát…',
  'ticker.pick': 'Chọn',
  // Mã đang giữ vẫn chọn được (sẽ cộng dồn), nên đây là NHÃN chứ không phải lời từ chối.
  'ticker.held': 'đã có',
  /*
   * Nhãn cạnh mã chưa có báo cáo dùng được. Ngắn hết mức: nó đứng trong một dòng đã có mã, tên
   * doanh nghiệp và nút chọn, ở khổ 360px.
   *
   * Hai bản vì bảng mã sinh lúc build và cũ đi mỗi kỳ báo cáo. Còn mới thì nói thẳng "chưa có số
   * liệu"; quá một kỳ rồi thì hạ giọng thành "có thể chưa có" — khẳng định một mã hợp lệ là không
   * dùng được thì người dùng bỏ qua nó, và đó là cái giá đắt hơn hẳn một cú bấm thừa.
   */
  'ticker.noData': 'chưa có số liệu',
  'ticker.noDataStale': 'có thể chưa có số liệu',
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
     localStorage (25/08/2026). Câu tương đương ở màn Danh mục (`portfolio.localOnly`) cũng đã bỏ
     ngày 09/09/2026 — nay không màn nào còn dòng cam kết dữ liệu. */
  'series.needMore':
    'Beta và Sharpe cần ít nhất 60 phiên để có ý nghĩa thống kê. Hiện chưa đủ, kết quả sẽ báo thiếu dữ liệu.',

  /* Biểu đồ nến và cột kiểm dữ liệu — bản vẽ "Chuỗi giá OHLCV" của chủ dự án (10/09/2026). */
  'series.chartLabel': 'Biểu đồ nến của chuỗi giá',
  'series.chartBlank':
    'Chưa có phiên nào vẽ được. Điền giá đóng cửa, hoặc sửa những dòng đang lỗi.',
  'series.sessions': 'phiên',
  'series.overPeriod': 'cả kỳ',
  'series.rangeLabel': 'Khoảng thời gian',
  'series.range.1m': '1T',
  'series.range.3m': '3T',
  'series.range.6m': '6T',
  'series.range.all': 'Cả chuỗi',
  /* Nút ghi "1T" nhưng cắt theo SỐ PHIÊN — xem docblock `CandleRange`. Nói ra, đừng để đoán. */
  'series.rangeHint': 'Số phiên gần nhất:',
  'series.rangeAllHint': 'Toàn bộ chuỗi trong bảng',
  'series.legendUp': 'Phiên tăng',
  'series.legendDown': 'Phiên giảm',
  'series.legendLast': 'Đóng cửa gần nhất',
  'series.legendSkipped': 'phiên lỗi — chưa vẽ, sửa ở bảng dưới',

  'series.tableTitle': 'Bảng số liệu',
  /* Chủ dự án chốt 10/09/2026: ngày mới nhất lên ĐẦU bảng. Câu này nói ra thứ tự đang dùng. */
  'series.tableHint': 'Mới → cũ · sửa trực tiếp trong ô',
  'series.checkTitle': 'Kiểm tra dữ liệu',
  'series.checkFloor': 'Beta, Sharpe',
  'series.checkCap': 'tối đa',
  'series.goToRow': 'Tới dòng',
  'series.allGood': 'Không dòng nào đang lỗi.',

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
  /*
   * `nameHint` và `done` từng gọi tên "tab Công thức" / "Danh mục › Công thức" — một tab đã bỏ
   * từ 14/09/2026. Nay gọi đúng tên khối mà người dùng sẽ thấy ngay sau khi lưu.
   */
  'save.nameHint': 'Tên hiện ở khối Phép tính đã lưu của màn Danh mục.',
  'save.suggestions': 'Gợi ý tên',
  'save.submit': 'Lưu vào danh mục',
  'save.done': 'Đã lưu vào Danh mục › Phép tính đã lưu.',
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

  /*
   * Khối "Công thức dùng hằng ngày" — FR-20, nay là khối ĐẦU của màn Công thức.
   *
   * Toàn bộ khoá `home.*` đã bỏ ngày 15/09/2026 cùng trang chủ riêng: ô tìm chỉ-lọc-kệ, lưới
   * "Duyệt theo nhóm", khối "Công cụ" và `<h1>` ẩn.
   *
   * Cũng ngày ấy chủ dự án bỏ hai dòng chữ phụ của kệ vì dư thừa: `shelf.personalNote` ("Những công
   * thức bạn hay mở đã được đưa lên đầu. Lịch sử này nằm trên máy bạn…") và `tools.data` /
   * `tools.dataHint` (link "Bảng dữ liệu · Nhập hoặc dán chuỗi giá OHLCV…"). Đó là quyết định có chủ
   * đích, không phải khoá rơi mất: việc cá nhân hoá vẫn được nói ở màn Cài đặt (`data.usage.note`),
   * và bảng dữ liệu vẫn vào được từ màn chi tiết của công thức dùng chuỗi giá.
   */
  'shelf.title': 'Công thức dùng hằng ngày',
  /* Nút cuối hàng tiêu đề kệ — bày nốt các ô đang ẩn ngay tại chỗ; bấm lần nữa thì `shelf.collapse`. */
  'shelf.seeAll': 'Xem tất cả',
  'shelf.collapse': 'Thu gọn',

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
  'settings.units.title': 'Đơn vị & biểu thị',
  'settings.units.scale': 'Đơn vị tiền trong bảng',
  /*
   * `settings.theme.hint` và `settings.units.scaleHint` đã xoá — chủ dự án chốt 09/09/2026.
   *
   * Câu theme mang một vế KHÔNG suy ra được từ nhãn: file PNG và bản in luôn nền sáng dù giao diện
   * đang tối. Vế ấy nay chỉ còn trong mã (`draw-card.ts`), người dùng không được báo trước.
   */
  'settings.units.schedule': 'Biểu phí giao dịch',
  'settings.units.scheduleHint':
    'Dùng cho màn lợi nhuận ròng sau phí & thuế. Nguồn: Market Config.',
  /* `settings.data.note` đã xoá cùng đợt với dải "CỤC BỘ" — xem docblock ở `portfolio.formCode`. */
  /*
   * "Dữ liệu của bạn" chứ không còn "Dữ liệu trên máy" — chủ dự án chọn 14/09/2026, khi khối này
   * rút xuống còn tiêu đề và một nút xoá (`HIEN_KHOI_DU_LIEU`).
   *
   * Vế "trên máy" đi cùng bản kiểm kê chín kho: lúc ấy tiêu đề phải nói kho nằm ĐÂU. Bản rút gọn
   * không kể kho nào cả, nên thứ cần nói là dữ liệu ấy THUỘC VỀ AI — và đó cũng là vế hợp với một
   * nút xoá sạch.
   */
  'settings.data.title': 'Dữ liệu của bạn',
  'settings.about.title': 'Về sản phẩm',

  /*
   * ── Mỗi kho một CÂU nói trong đó có gì, không phải khoá kho và độ dài chuỗi ─────────────────
   *
   * Dòng phụ trước đây in `ffb.prefs.v1 · 98 ký tự`. Chủ dự án chỉ vào đúng dòng ấy: *"đang không
   * hiểu vùng khoanh tròn biểu thị cho cái gì. không có nghĩa"*. Cả hai vế đều là thứ chỉ người
   * viết mã đọc được — tên khoá là chi tiết cài đặt, còn "ký tự" là độ dài chuỗi JSON, một con số
   * không trả lời câu hỏi nào người dùng đang hỏi.
   *
   * Câu thay vào phải trả lời đúng hai điều: **trong đó có gì** và **nó từ đâu ra** (tức xoá đi
   * thì mất thao tác nào của mình). Viết bằng danh từ đời thường, và gọi đúng TÊN MÀN nơi dữ liệu
   * ấy sinh ra, để người dùng nối được với việc họ đã làm.
   *
   * `data.chars` đã bỏ cùng con số ấy; `i18n.test.ts` có ca bắt khoá mồ côi nên đừng để lại.
   */
  'data.prefs': 'Tuỳ chọn hiển thị',
  'data.prefs.note':
    'Chế độ hiển thị, ngôn ngữ, giao diện sáng/tối, đơn vị và biểu phí bạn đã chọn.',
  'data.recent': 'Từ khoá đã tìm',
  /* Một kho cho cả hai ô tìm từ khi trang chủ gộp vào màn Công thức — `data.recentHome` đã bỏ. */
  'data.recent.note':
    'Tên công thức bạn đã chọn khi tìm ở màn Công thức hoặc màn Tìm kiếm, giữ lại để lần sau bấm cho nhanh.',
  'data.series': 'Chuỗi giá đã nhập',
  'data.series.note': 'Bảng giá theo từng phiên bạn nhập, dán hoặc nạp ở màn Bảng dữ liệu.',
  'data.portfolio': 'Danh mục cá nhân',
  'data.portfolio.note': 'Các mã bạn đã thêm vào Danh mục, kèm số lượng, giá vốn và ngày mua.',
  'data.saved': 'Phép tính đã lưu',
  'data.saved.note': 'Những phép tính bạn bấm Lưu ở màn công thức, kèm tên bạn đặt cho chúng.',
  'data.drafts': 'Số đang gõ dở',
  'data.drafts.note':
    'Số bạn vừa nhập ở màn công thức, giữ tạm để rời màn rồi quay lại không phải gõ lại từ đầu.',
  'data.usage': 'Công thức đã mở',
  'data.usage.note':
    'Công thức bạn hay mở, dùng để xếp lại khối Công thức dùng hằng ngày theo thói quen.',
  'data.tickers': 'Danh sách mã',
  'data.tickers.note':
    'Danh sách mã của sàn, tải về một lần cho ô tìm mã chạy nhanh và vẫn dùng được khi mất mạng.',
  'data.prices': 'Giá đã lưu',
  'data.prices.note':
    'Giá phiên gần nhất của các mã trong Danh mục, giữ lại để vẫn xem được khi mất mạng.',
  'data.empty': 'Chưa có gì',
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

  /*
   * ── Màn "Về chúng tôi" (/ve-chung-toi/) ──────────────────────────────────────────────────────
   *
   * Tiền tố `aboutUs.` chứ KHÔNG phải `about.`: bốn khoá ngay trên đã thuộc về khối "Về sản phẩm"
   * của màn Cài đặt — ba dòng số liệu, không phải văn giới thiệu. Trộn hai màn vào một namespace
   * là mời người sửa sau đổi nhầm chỗ.
   *
   * Đây là màn DUY NHẤT của sản phẩm viết bằng giọng quảng bá. Hai luật tự đặt cho nó:
   *
   *   1. Không câu nào được nói quá thứ mã nguồn làm thật. Cụ thể ở `aboutUs.stat.freshNote`
   *      dưới đây, và ở cả khối `aboutUs.not.*` — khối ấy tồn tại chính vì một trang giới thiệu
   *      chỉ đáng tin khi nó chịu nói ra phần mình không làm.
   *   2. Không dựng lại cam kết riêng tư đã gỡ. Khoá `portfolio.localOnly` (dải "CỤC BỘ") và
   *      `settings.data.note` bỏ ngày 09/09/2026 theo yêu cầu chủ dự án; `aboutUs.yourData.*`
   *      dưới đây cố ý chỉ MÔ TẢ kiến trúc ("nằm trong localStorage của thiết bị") chứ không hứa
   *      hẹn gì thay mặt sản phẩm. Xem chú thích ở `settings.data.title`.
   */
  'aboutUs.eyebrow': 'Về Faculator Finbox',
  'aboutUs.title': 'Công cụ tài chính thông minh cho nhà đầu tư hiện đại',
  'aboutUs.lead':
    'Faculator Finbox là ứng dụng web tra cứu, tính toán và trực quan hoá công thức cho thị trường Việt Nam. Điểm khác biệt cốt lõi: các công thức không đứng độc lập mà kết nối thành đồ thị phụ thuộc — đầu ra của bước trước chảy thẳng vào đầu vào của bước sau.',
  'aboutUs.stat.full': 'Đầy đủ',
  'aboutUs.stat.fullNote': 'Công cụ tài chính',
  'aboutUs.stat.fresh': 'Dữ liệu cập nhật',
  /*
   * "Theo phiên gần nhất", KHÔNG phải "Liên tục" như bản vẽ.
   *
   * Thứ sản phẩm thật sự lấy về là thị giá cuối phiên của tab Danh mục, và nó luôn đi kèm ngày
   * phiên (`TickerSnapshot.asOfDate`). Chuỗi giá trong bộ mẫu thì vẫn là số dựng sẵn. Viết "liên
   * tục" là hứa một bảng giá khớp lệnh trực tiếp mà sản phẩm không có — và nó cãi thẳng
   * `aboutUs.not.realtimeNote` cách đó hai màn cuộn.
   */
  'aboutUs.stat.freshNote': 'Theo phiên gần nhất',
  'aboutUs.stat.simple': 'Giao diện đơn giản',
  'aboutUs.stat.simpleNote': 'Dễ sử dụng',

  'aboutUs.can.title': 'Sản phẩm làm được gì',
  'aboutUs.can.lookup': 'Tra cứu có giải thích',
  'aboutUs.can.lookupNote':
    'Mỗi công thức đi kèm ý nghĩa, lúc nào nên dùng, cách đọc kết quả và những lỗi thường gặp.',
  'aboutUs.can.instant': 'Tính toán tức thì',
  'aboutUs.can.instantNote':
    'Gõ số tới đâu thì kết quả và biểu đồ đổi tới đó, không có nút Tính nào phải bấm.',
  'aboutUs.can.chain': 'Chuỗi móc nối có kiểm soát',
  'aboutUs.can.chainNote':
    'Đầu ra của một công thức nạp thẳng vào ô nhập của công thức sau, và bạn vẫn ghi đè được bằng số của mình.',
  'aboutUs.can.fees': 'Phí và thuế thị trường Việt Nam',
  'aboutUs.can.feesNote':
    'Phí giao dịch, thuế thu nhập và thuế cổ tức theo quy định trong nước, khai một chỗ ở Market Config.',
  'aboutUs.can.data': 'Dữ liệu mẫu và nhập liệu linh hoạt',
  'aboutUs.can.dataNote':
    'Nạp bộ số liệu mẫu theo mã cổ phiếu, hoặc tự gõ và dán bảng giá của riêng bạn.',
  'aboutUs.can.portfolio': 'Danh mục cá nhân tại thiết bị',
  'aboutUs.can.portfolioNote':
    'Theo dõi các mã đang nắm giữ kèm giá vốn, hỗ trợ XIRR và các phép tính liên quan mà không bắt buộc đăng nhập.',

  'aboutUs.arch.title': 'Kiến trúc client-only (zero backend)',
  'aboutUs.arch.ui': 'Tầng trình bày',
  'aboutUs.arch.uiNote': 'SPA/PWA chạy trong trình duyệt, thiết kế mobile-first.',
  'aboutUs.arch.calc': 'Tầng tính toán',
  'aboutUs.arch.calcNote': 'Bộ máy công thức và đồ thị phụ thuộc giữa các bước.',
  'aboutUs.arch.registry': 'Formula Registry',
  'aboutUs.arch.registryNote': 'Định nghĩa công thức, biến, đơn vị và nội dung giải thích.',
  'aboutUs.arch.provider': 'DataProvider',
  'aboutUs.arch.providerNote':
    'Cấp chuỗi giá và số liệu mẫu, cô lập nguồn dữ liệu khỏi ba tầng trên.',

  'aboutUs.yourData.title': 'Dữ liệu của bạn',
  'aboutUs.yourData.noAccount': 'Không tài khoản, không máy chủ',
  'aboutUs.yourData.noAccountNote':
    'Sản phẩm chạy trọn trong trình duyệt: không có bước đăng ký, không có máy chủ tài khoản. Danh mục và tuỳ chọn hiển thị nằm trong localStorage của chính thiết bị, nên xoá dữ liệu trình duyệt hoặc đổi máy thì chúng không đi theo.',
  'aboutUs.yourData.sources': 'Nguồn tham khảo công khai',
  'aboutUs.yourData.sourcesNote':
    'Mỗi công thức ghi rõ nguồn — giáo trình, chuẩn mực kế toán hoặc văn bản pháp luật — để bạn kiểm chứng. Hằng số phí và thuế lấy từ Market Config, sửa một chỗ áp dụng toàn hệ thống.',

  'aboutUs.not.title': 'Faculator không phải là gì?',
  'aboutUs.not.broker': 'Không phải sàn giao dịch',
  'aboutUs.not.brokerNote': 'Không đặt lệnh, không kết nối tài khoản chứng khoán.',
  'aboutUs.not.realtime': 'Không phải bảng giá thời gian thực',
  /*
   * Bản vẽ ghi "Không cung cấp giá thị trường thời gian thực ở bản phát hành đầu". Câu ấy đã sai
   * kể từ gói "Danh mục dùng số liệu thật": sản phẩm CÓ gọi `dcs.finbox.vn` lấy thị giá, và
   * `public/_headers` mở `connect-src` cho đúng origin ấy. Nên trục của câu đổi từ "có giá hay
   * không" sang "giá LOẠI NÀO" — vẫn giữ nguyên điều bản vẽ muốn nói (đừng dùng app này để lướt
   * sóng) mà không nói sai về thứ mã nguồn đang làm.
   */
  'aboutUs.not.realtimeNote':
    'Thị giá ở tab Danh mục là giá của phiên gần nhất, lấy từ nhà cung cấp dữ liệu và luôn kèm ngày phiên. Đây không phải bảng giá khớp lệnh trực tiếp.',
  /*
   * Mục này THAY cho thẻ thứ ba của bản vẽ — bản vẽ lặp lại nguyên văn thẻ thứ hai, hiển nhiên là
   * lỗi dựng ảnh. Chọn "kho dữ liệu lịch sử" vì nó vừa đúng sự thật kiểm chứng được (chuỗi giá
   * trong bộ mẫu là số dựng sẵn; API chỉ trả 10 phiên, không đủ cho RSI-14 hay SMA-20), vừa dẫn
   * người đọc sang đúng việc cần làm tiếp là màn Bảng dữ liệu.
   */
  'aboutUs.not.history': 'Không phải kho dữ liệu lịch sử',
  'aboutUs.not.historyNote':
    'Bộ số liệu mẫu dựng sẵn chỉ đủ để minh hoạ cách một công thức chạy. Muốn tính trên chuỗi giá thật và dài, bạn tự nhập hoặc dán vào Bảng dữ liệu.',
  'aboutUs.not.advice': 'Không phải công cụ tư vấn đầu tư',
  'aboutUs.not.adviceNote':
    'Mọi con số trên màn là kết quả tính toán để tham khảo, không phải khuyến nghị mua bán.',

  'aboutUs.cta.eyebrow': 'Bắt đầu ngay hôm nay',
  'aboutUs.cta.title': 'Cùng Faculator Finbox làm chủ thị trường',
  'aboutUs.cta.note':
    'Không cần đăng ký. Mở công thức, nạp bộ số liệu mẫu theo mã cổ phiếu và xem kết quả cập nhật tức thì — hoạt động đầy đủ cả khi ngoại tuyến.',
  'aboutUs.cta.action': 'Truy cập ngay',

  // Tiêu đề <h1> của màn. Chỉ có key cho màn nào THẬT SỰ hiện tiêu đề bằng chữ:
  // danh mục dùng `portfolio.title`.
  'page.formulas.title': 'Công thức',
  'page.settings.title': 'Cài đặt',

  // Trang 404 — trước đợt 14 là bản mặc định tiếng Anh của Next, nằm ngoài AppShell.
  'notFound.title': 'Không tìm thấy trang này',
  'notFound.reason': 'Đường dẫn có thể gõ sai, hoặc trang đã được dời chỗ.',
  'notFound.suggest': 'Thử tìm công thức theo tên — gõ không dấu vẫn ra đúng.',
  'notFound.search': 'Tìm công thức',
  /* Thay `notFound.home` — không còn trang chủ riêng, màn Công thức là màn mở đầu. */
  'notFound.formulas': 'Về danh sách công thức',
} as const;
