/**
 * Tầng APPLICATION — từ điển tiếng Việt (gói WBS 1.4.1).
 *
 * Tiếng Việt là ngôn ngữ gốc: mọi key đều phải có ở đây, và `MessageKey` sinh ra từ chính
 * object này nên thêm key mà quên viết bản Việt là hỏng lúc typecheck.
 *
 * FR-21 (chuyển VI/EN) xếp ở v1.0. Đợt này chỉ dựng khung, chưa dịch.
 */

export const vi = {
  'app.name': 'Falculator Finbox',
  'app.tagline': 'Thư viện công thức tài chính và chứng khoán Việt Nam',

  // Điều hướng — WF-18 chốt thanh nav dưới có 4 mục
  'nav.primary': 'Điều hướng chính',
  'nav.skipToContent': 'Bỏ qua điều hướng, tới nội dung',
  'nav.home': 'Trang chủ',
  'nav.formulas': 'Công thức',
  'nav.portfolio': 'Danh mục',
  'nav.settings': 'Cài đặt',

  // Chế độ hiển thị — FR-09
  'mode.label': 'Chế độ hiển thị',
  'mode.basic': 'Cơ bản',
  'mode.advanced': 'Nâng cao',

  // Ngôn ngữ — FR-21
  'lang.label': 'Ngôn ngữ',
  'lang.vi': 'VI',
  'lang.en': 'EN',
  'lang.enComingSoon': 'Bản tiếng Anh sắp có',

  // Trạng thái mạng — FR-23
  'offline.title': 'Hoạt động ngoại tuyến',
  'offline.detail': 'Mất kết nối mạng. Mọi phép tính vẫn chạy vì máy tính nằm ngay trên máy bạn.',

  // Miễn trừ trách nhiệm — FR-24, không được cắt ở bất kỳ bản nào
  'disclaimer.text': 'Kết quả chỉ mang tính tham khảo, không phải khuyến nghị đầu tư.',

  // Tìm kiếm — FR-19, NFR-USA-03
  'search.label': 'Tìm công thức',
  'search.placeholder': 'Tên công thức, ví dụ P/E hay dinh gia',
  'search.hint': 'Gõ không dấu vẫn ra đúng: “dinh gia” ra “Định giá”, “p e” ra “P/E”.',
  'search.clear': 'Xoá ô tìm kiếm',

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
  'list.count': 'công thức',
  'list.empty.registry.title': 'Chưa có công thức nào',
  'list.empty.registry.hint': 'Nhánh 5 của WBS sẽ đổ 107 công thức vào Registry.',
  'list.empty.noMatch.title': 'Không tìm thấy công thức nào',
  'list.empty.noMatch.scope':
    'Sản phẩm chỉ có công thức chứng khoán và tài chính cá nhân Việt Nam — không có tiền mã hoá.',
  'list.empty.noMatch.hint': 'Thử bớt từ khoá, hoặc xoá bộ lọc để xem lại toàn bộ danh sách.',

  // Nhập liệu — WF-16, gói 2.3
  'input.derivedPrefix': '↳',
  'input.lockedBadge': 'nâng cao',
  'input.lockedHint': 'Chuyển sang chế độ Nâng cao để sửa ô này.',
  'input.rangeHint': 'Miền hợp lệ',
  'input.sliderMin': 'min',
  'input.sliderMax': 'max',
  'input.sliderStep': 'step',
  'input.unitLabel': 'Đơn vị hiển thị',
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
  'source.title': 'Nguồn tham khảo',
  'flow.title': 'Dải luồng tính toán',
  'flow.cyclicWarning': 'Có bước phụ thuộc vòng nên chưa xếp được thứ tự:',
  'stat.eyebrow': 'CHỈ SỐ',

  // Tiêu đề màn
  'page.home.title': 'Trang chủ',
  'page.formulas.title': 'Công thức',
  'page.portfolio.title': 'Danh mục cá nhân',
  'page.settings.title': 'Cài đặt',

  // Chỗ dựng tạm, gói nhánh 3 sẽ thay bằng màn thật
  'page.placeholder.home': 'Màn WF-01 sẽ dựng ở gói WBS 3.1.1.',
  'page.placeholder.formulas': 'Màn WF-02 sẽ dựng ở gói WBS 3.1.2.',
  'page.placeholder.formulaDetail': 'Màn WF-03 sẽ dựng ở gói WBS 3.2.1.',
  'page.placeholder.portfolio': 'Màn WF-06 sẽ dựng ở gói WBS 3.4.1.',
  'page.placeholder.settings': 'Màn WF-13 sẽ dựng ở gói WBS 3.6.1.',
  'page.placeholder.noFormulaYet':
    'Chưa có công thức nào trong Registry — nhánh 5 của WBS sẽ đổ 107 công thức vào.',
} as const;
