/**
 * Hình riêng của từng công thức, 111 hình cho 111 công thức trong Registry.
 *
 * Bộ hình do chủ dự án đặt vẽ và gửi lại ngày 23/10/2026; nó THAY icon nhóm trên thẻ công thức
 * (ô kệ "Công thức dùng hằng ngày" và thẻ trong danh sách). Icon nhóm (`CategoryIcon`) vẫn ở lại
 * những chỗ nói về một NHÓM: dải chọn nhóm, thư mục nhóm, nhóm nổi bật ở màn tìm kiếm.
 *
 * Quy ước vẽ, giữ nguyên khi thêm hay sửa một hình: lưới 24 × 24, nét 1,75 đầu tròn, màu
 * `currentColor` (`FormulaIcon` khai các thuộc tính ấy trên `<svg>`, ở đây chỉ có phần thân).
 * Phần tô nhạt (`fill-opacity=".22"`) luôn là con số công thức tính ra; nét mờ
 * (`stroke-opacity`) là mốc so sánh hoặc phần bị loại. Tỷ số vẽ như phân số: tử trên vạch, mẫu
 * dưới vạch. Mỗi ký hiệu một nghĩa trong cả bộ: nhãn giá = giá, đồng xu = lợi nhuận, hai đồng xu
 * = cổ tức, cuốn sổ = vốn chủ (sổ sách), hoá đơn = doanh thu, khối hộp = tài sản, toà nhà =
 * doanh nghiệp (EV), tờ tiền = EBITDA, ô vuông = cổ phiếu, mũi tên tăng = lợi suất hay tăng
 * trưởng, đường chuông = độ lệch chuẩn, cơ quan thuế = thuế.
 *
 * Câu "hình vẽ gì" của mỗi mục là COMMENT, không phải dữ liệu: nó dành cho người sửa hình, và
 * trình nén bỏ comment, nên 111 câu ấy không vào gói trình duyệt. Một bảng ý nghĩa xuất ra như
 * dữ liệu sẽ nằm trong JS của màn Công thức mà không màn nào đọc tới.
 *
 * Chuỗi là SVG viết tay, nhúng bằng `dangerouslySetInnerHTML`: chỉ được dùng bốn thẻ `g`,
 * `path`, `circle`, `rect` và không thuộc tính sự kiện nào. `formula-icons.test.ts` gác điều
 * đó, cùng với việc mỗi công thức của Registry có đúng một hình và không hai công thức trùng hình.
 */
export const FORMULA_ICONS: Readonly<Record<string, string>> = {
  // Nhãn giá trên vạch chia, đồng xu dưới vạch: giá chia lợi nhuận mỗi cổ phiếu, đúng thứ tự chữ
  // P/E.
  pe: '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-4 0L-1.6 -3H4V3H-1.6Z"/><circle cx="-0.6" cy="0" r="0.75" fill="currentColor" stroke="none"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><circle cx="0" cy="0" r="3.5"/><path d="M0 -1.2V1.2"/></g>',
  // Nhãn giá chia cuốn sổ: giá thị trường trên giá trị sổ sách.
  pb: '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-4 0L-1.6 -3H4V3H-1.6Z"/><circle cx="-0.6" cy="0" r="0.75" fill="currentColor" stroke="none"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><rect x="-3.4" y="-3.3" width="6.8" height="6.6" rx="0.8"/><path d="M-1.4 -3.3V3.3"/></g>',
  // Một đồng xu lợi nhuận rẽ nhánh xuống ba ô cổ phiếu: lãi chia đều cho từng cổ phiếu.
  'eps-co-ban':
    '<g transform="translate(12 4.8) scale(1.0)" stroke-width="1.750"><circle cx="0" cy="0" r="3.5"/><path d="M0 -1.2V1.2"/></g><path d="M12 8.6V12M5.5 12H18.5M5.5 12V15.2M12 12V15.2M18.5 12V15.2"/><rect x="3.3" y="16" width="4.4" height="4.4" rx="1"/><rect x="9.8" y="16" width="4.4" height="4.4" rx="1"/><rect x="16.3" y="16" width="4.4" height="4.4" rx="1"/>',
  // Cuốn sổ vốn chủ rẽ nhánh xuống ba ô cổ phiếu: vốn sổ sách chia cho từng cổ phiếu.
  bvps: '<g transform="translate(12 4.8) scale(1.0)" stroke-width="1.750"><rect x="-3.4" y="-3.3" width="6.8" height="6.6" rx="0.8"/><path d="M-1.4 -3.3V3.3"/></g><path d="M12 8.6V12M5.5 12H18.5M5.5 12V15.2M12 12V15.2M18.5 12V15.2"/><rect x="3.3" y="16" width="4.4" height="4.4" rx="1"/><rect x="9.8" y="16" width="4.4" height="4.4" rx="1"/><rect x="16.3" y="16" width="4.4" height="4.4" rx="1"/>',
  // Cuốn sổ vốn chủ sinh ra đồng xu lợi nhuận (mũi tên): mỗi đồng vốn cổ đông đẻ ra bao nhiêu lãi.
  roe: '<g transform="translate(6.5 16.5) scale(1.2)" stroke-width="1.458"><rect x="-3.4" y="-3.3" width="6.8" height="6.6" rx="0.8"/><path d="M-1.4 -3.3V3.3"/></g><path d="M6.5 11C6.5 7.4 8.6 6.6 12.2 6.6"/><path d="M10.57 5.13L12.2 6.6L10.57 8.07"/><circle cx="17.5" cy="6.6" r="3.8"/><path d="M17.5 5.2V8"/>',
  // Khối tài sản sinh ra đồng xu lợi nhuận: toàn bộ tài sản tạo ra bao nhiêu lãi.
  roa: '<g transform="translate(6.5 16.5) scale(1.2)" stroke-width="1.458"><path d="M0 -3.8L3.5 -1.9V1.9L0 3.8L-3.5 1.9V-1.9Z"/><path d="M-3.5 -1.9L0 0L3.5 -1.9M0 0V3.8"/></g><path d="M6.5 11C6.5 7.4 8.6 6.6 12.2 6.6"/><path d="M10.57 5.13L12.2 6.6L10.57 8.07"/><circle cx="17.5" cy="6.6" r="3.8"/><path d="M17.5 5.2V8"/>',
  // Cột doanh thu bị trừ nhiều lớp chi phí, phần tô ở đỉnh là phần lãi ròng còn giữ lại.
  'bien-loi-nhuan-rong':
    '<rect x="6" y="3" width="12" height="18" rx="1.5"/><path d="M6 3h12v4h-12Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M6 7H18M6 11.5H18M6 16H18"/>',
  // Cột doanh thu chỉ trừ một lớp giá vốn, phần tô còn lại lớn hơn hẳn biên ròng.
  'bien-loi-nhuan-gop':
    '<rect x="6" y="3" width="12" height="18" rx="1.5"/><path d="M6 3h12v9h-12Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M6 12H18"/>',
  // Cán cân lệch về đĩa nợ: nợ vay đang nặng hơn hay nhẹ hơn vốn của chính doanh nghiệp.
  'no-tren-von-chu':
    '<path d="M12 4V20M8 20.5H16"/><path d="M3.5 9L20.5 4.8"/><circle cx="12" cy="6.9" r="1.1" fill="currentColor" stroke="none"/><path d="M1.5 14.2L3.5 9L5.5 14.2"/><path d="M1.5 14.2A2 1.6 0 0 0 5.5 14.2Z"/><path d="M18.5 10L20.5 4.8L22.5 10"/><path d="M18.5 10A2 1.6 0 0 0 22.5 10Z"/>',
  // Tiền và hàng tồn (bên trái) lớn hơn hoặc bằng hoá đơn nợ ngắn hạn (bên phải).
  'thanh-toan-hien-hanh':
    '<circle cx="5.5" cy="7.6" r="3.3"/><path d="M5.5 6.41V8.79"/><g transform="translate(5.5 16.5) scale(1.0)" stroke-width="1.750"><path d="M0 -3.8L3.5 -1.9V1.9L0 3.8L-3.5 1.9V-1.9Z"/><path d="M-3.5 -1.9L0 0L3.5 -1.9M0 0V3.8"/></g><path d="M10.6 9.4L13.6 11.4L10.6 13.4M10.6 15.6H13.6"/><g transform="translate(18.2 12) scale(1.25)" stroke-width="1.400"><path d="M-3 -3.5H3V3.5L1.5 2.4L0 3.5L-1.5 2.4L-3 3.5Z"/><path d="M-1.4 -1.2H1.4M-1.4 0.9H0.4"/></g>',
  // Như hệ số hiện hành nhưng khối hàng tồn bị gạch mờ: chỉ dùng tiền để so với nợ.
  'thanh-toan-nhanh':
    '<circle cx="5.5" cy="7.6" r="3.3"/><path d="M5.5 6.41V8.79"/><g stroke-opacity=".4"><g transform="translate(5.5 16.5) scale(1.0)" stroke-width="1.750"><path d="M0 -3.8L3.5 -1.9V1.9L0 3.8L-3.5 1.9V-1.9Z"/><path d="M-3.5 -1.9L0 0L3.5 -1.9M0 0V3.8"/></g></g><path d="M2 20.5L9 12.5" stroke-opacity=".4"/><path d="M10.6 9.4L13.6 11.4L10.6 13.4M10.6 15.6H13.6"/><g transform="translate(18.2 12) scale(1.25)" stroke-width="1.400"><path d="M-3 -3.5H3V3.5L1.5 2.4L0 3.5L-1.5 2.4L-3 3.5Z"/><path d="M-1.4 -1.2H1.4M-1.4 0.9H0.4"/></g>',
  // Khối tài sản giữa vòng mũi tên quay: tài sản quay được mấy vòng doanh thu một năm.
  'vong-quay-tong-tai-san':
    '<g transform="translate(12 12) scale(1.15)" stroke-width="1.522"><path d="M0 -3.8L3.5 -1.9V1.9L0 3.8L-3.5 1.9V-1.9Z"/><path d="M-3.5 -1.9L0 0L3.5 -1.9M0 0V3.8"/></g><path d="M3.92 9.06A8.6 8.6 0 0 1 18.08 5.92"/><path d="M17.96 3.52L18.08 5.92L15.68 5.79"/><path d="M20.08 14.94A8.6 8.6 0 0 1 5.92 18.08"/><path d="M6.04 20.48L5.92 18.08L8.32 18.21"/>',
  // Chiếc bánh lợi nhuận có một miếng tách ra (tô): phần lãi chia cho cổ đông, phần còn lại giữ
  // lại.
  'ty-le-chi-tra-co-tuc':
    '<path d="M10.5 13L17.3 9.83A7.5 7.5 0 1 1 10.5 5.5Z"/><path d="M12.7 11L12.7 3.5A7.5 7.5 0 0 1 19.5 7.83Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M12.7 11L12.7 3.5A7.5 7.5 0 0 1 19.5 7.83Z"/>',
  // Nhãn giá chia hoá đơn: giá trên doanh thu mỗi cổ phiếu.
  ps: '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-4 0L-1.6 -3H4V3H-1.6Z"/><circle cx="-0.6" cy="0" r="0.75" fill="currentColor" stroke="none"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><path d="M-3 -3.5H3V3.5L1.5 2.4L0 3.5L-1.5 2.4L-3 3.5Z"/><path d="M-1.4 -1.2H1.4M-1.4 0.9H0.4"/></g>',
  // Cả toà nhà doanh nghiệp được gắn nhãn giá: cái giá để mua đứt toàn bộ doanh nghiệp.
  ev: '<path d="M2.5 21V10L8.5 5L14.5 10V21"/><path d="M1.5 21H15.5"/><path d="M6 13.5H11M6 17H11"/><g transform="translate(18.6 16) scale(1.0)" stroke-width="1.750"><path d="M-4 0L-1.6 -3H4V3H-1.6Z"/><circle cx="-0.6" cy="0" r="0.75" fill="currentColor" stroke="none"/></g>',
  // Toà nhà doanh nghiệp chia tờ tiền: EV trên dòng tiền hoạt động EBITDA.
  'ev-ebitda':
    '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-3.6 3.5V-1.2L0 -3.6L3.6 -1.2V3.5Z"/><path d="M-1 3.5V1H1V3.5"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><rect x="-4" y="-2.6" width="8" height="5.2" rx="0.8"/><circle cx="0" cy="0" r="1.2"/></g>',
  // Toà nhà doanh nghiệp chia hoá đơn: EV trên doanh thu.
  'ev-sales':
    '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-3.6 3.5V-1.2L0 -3.6L3.6 -1.2V3.5Z"/><path d="M-1 3.5V1H1V3.5"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><path d="M-3 -3.5H3V3.5L1.5 2.4L0 3.5L-1.5 2.4L-3 3.5Z"/><path d="M-1.4 -1.2H1.4M-1.4 0.9H0.4"/></g>',
  // Nhãn giá chia mũi tên tăng trưởng: P/E đặt trên tốc độ tăng lợi nhuận.
  peg: '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-4 0L-1.6 -3H4V3H-1.6Z"/><circle cx="-0.6" cy="0" r="0.75" fill="currentColor" stroke="none"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><path d="M-4 3L-1.2 0.2L1 1.8L4 -2.8"/><path d="M1.3 -2.9H4V-0.2"/></g>',
  // Nhãn giá nhân với khối ô cổ phiếu: giá × số cổ phiếu lưu hành.
  'von-hoa-thi-truong':
    '<g transform="translate(6.2 12) scale(1.1)" stroke-width="1.591"><path d="M-4 0L-1.6 -3H4V3H-1.6Z"/><circle cx="-0.6" cy="0" r="0.75" fill="currentColor" stroke="none"/></g><path d="M10.9 10.9L13.1 13.1M13.1 10.9L10.9 13.1"/><g transform="translate(17.8 12) scale(1.1)" stroke-width="1.591"><rect x="-4" y="-4" width="3.5" height="3.5" rx="0.6"/><rect x="0.5" y="-4" width="3.5" height="3.5" rx="0.6"/><rect x="-4" y="0.5" width="3.5" height="3.5" rx="0.6"/><rect x="0.5" y="0.5" width="3.5" height="3.5" rx="0.6"/></g>',
  // Dấu căn bao lấy đồng xu × cuốn sổ: căn của 22,5 × EPS × BVPS.
  'so-graham':
    '<path d="M2 13L4.6 11.6L7.6 20L11.6 4H22"/><circle cx="14.6" cy="12.4" r="2.6"/><path d="M14.6 11.46V13.34"/><path d="M17.6 11.4L18.8 12.6M18.8 11.4L17.6 12.6"/><g transform="translate(20.4 12.4) scale(0.62)" stroke-width="2.823"><rect x="-3.4" y="-3.3" width="6.8" height="6.6" rx="0.8"/><path d="M-1.4 -3.3V3.3"/></g>',
  // Búa đấu giá: giá trị còn lại nếu thanh lý ngay hôm nay.
  'ncav-tren-co-phieu':
    '<rect x="7" y="5.5" width="9" height="5" rx="1" transform="rotate(-45 11.5 8)"/><path d="M13.3 9.8L20 16.5"/><rect x="3.5" y="17.5" width="9" height="3.5" rx="1"/>',
  // Đồng xu trên nhãn giá, ngược với P/E: lợi nhuận chia giá, đọc như lãi suất.
  'ty-suat-loi-nhuan-tren-gia':
    '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><circle cx="0" cy="0" r="3.5"/><path d="M0 -1.2V1.2"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><path d="M-4 0L-1.6 -3H4V3H-1.6Z"/><circle cx="-0.6" cy="0" r="0.75" fill="currentColor" stroke="none"/></g>',
  // Mũi tên cắm vào hồng tâm: mức giá kịch bản muốn nhắm tới.
  'gia-muc-tieu':
    '<circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4.4"/><circle cx="11" cy="13" r="1.3" fill="currentColor" stroke="none"/><path d="M11 13L19 5"/><path d="M19 5V2M19 5H22"/>',
  // Ba cột cổ tức tăng đều rồi dấu vô cực: cổ tức tăng với một nhịp cố định mãi mãi.
  'mo-hinh-gordon':
    '<path d="M3.5 20.5V15.5M7.5 20.5V13.5M11.5 20.5V11.5" stroke-width="2.8"/><path d="M18.25 13C17 10.8 14.6 10.8 14.6 13C14.6 15.2 17 15.2 18.25 13C19.5 10.8 21.9 10.8 21.9 13C21.9 15.2 19.5 15.2 18.25 13Z"/>',
  // Cột cổ tức tăng dốc rồi chững lại, vạch mờ chia hai giai đoạn tăng trưởng.
  'ddm-hai-giai-doan':
    '<path d="M3.5 20.5V16.5M7.5 20.5V12M11.5 20.5V6.5M16 20.5V5.5M20 20.5V4.5" stroke-width="2.8"/><path d="M13.75 3V21" stroke-opacity=".4"/>',
  // Đường thẳng xuất phát từ mức phi rủi ro (vạch mờ) và dốc lên: rủi ro cao thì lợi suất đòi hỏi
  // cao.
  capm: '<path d="M3 3V21H21"/><path d="M3 15H20" stroke-opacity=".4"/><path d="M3 15L20 5"/><circle cx="13" cy="9.12" r="1.5" fill="currentColor" stroke="none"/>',
  // Vành tròn chia hai phần vốn chủ và nợ (phần tô), dấu % ở giữa: chi phí vốn bình quân theo tỷ
  // trọng.
  wacc: '<path d="M12 3A9 9 0 0 1 18.89 17.79L15.83 15.21A5 5 0 0 0 12 7Z" fill="currentColor" fill-opacity=".22" stroke="none"/><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 7L12 3"/><path d="M15.83 15.21L18.89 17.79"/><path d="M10.3 13.7L13.7 10.3"/><circle cx="10.4" cy="10.4" r="0.75" fill="currentColor" stroke="none"/><circle cx="13.6" cy="13.6" r="0.75" fill="currentColor" stroke="none"/>',
  // Đồng tiền chia cho cả chủ nợ (ngân hàng) lẫn cổ đông (người): dòng tiền tự do của doanh nghiệp.
  fcff: '<circle cx="12" cy="4.6" r="2.9"/><path d="M12 3.56V5.64"/><path d="M10.2 8.2L6.6 12.2"/><path d="M8.59 11.99L6.6 12.2L6.6 10.2"/><path d="M13.8 8.2L17.4 12.2"/><path d="M17.4 10.2L17.4 12.2L15.41 11.99"/><path d="M2 15.6L5.5 13.4L9 15.6Z"/><path d="M3.6 16.8V19.2M5.5 16.8V19.2M7.4 16.8V19.2"/><path d="M2 21H9"/><circle cx="18.5" cy="14.8" r="2.1"/><path d="M15 21C15 18.5 16.6 17.6 18.5 17.6C20.4 17.6 22 18.5 22 21"/>',
  // Như FCFF nhưng nhánh chủ nợ mờ đi: đã trả nợ xong, phần còn lại thuộc cổ đông.
  fcfe: '<circle cx="12" cy="4.6" r="2.9"/><path d="M12 3.56V5.64"/><g stroke-opacity=".4"><path d="M10.2 8.2L6.6 12.2"/><path d="M8.59 11.99L6.6 12.2L6.6 10.2"/><path d="M2 15.6L5.5 13.4L9 15.6Z"/><path d="M3.6 16.8V19.2M5.5 16.8V19.2M7.4 16.8V19.2"/><path d="M2 21H9"/></g><path d="M13.8 8.2L17.4 12.2"/><path d="M17.4 10.2L17.4 12.2L15.41 11.99"/><circle cx="18.5" cy="14.8" r="2.1"/><path d="M15 21C15 18.5 16.6 17.6 18.5 17.6C20.4 17.6 22 18.5 22 21"/>',
  // Các cột dòng tiền tương lai được mũi tên kéo về một đồng xu hôm nay: chiết khấu dòng tiền
  // (DCF).
  'gia-tri-noi-tai-fcff':
    '<rect x="13" y="12" width="2.2" height="8.5" rx="0.6"/><rect x="16.4" y="12" width="2.2" height="8.5" rx="0.6"/><rect x="19.8" y="12" width="2.2" height="8.5" rx="0.6"/><path d="M17.5 9.6C17.5 5 11 3.6 8.4 8.6"/><path d="M10.45 7.8L8.4 8.6L7.81 6.48"/><circle cx="6.4" cy="14.8" r="4"/><path d="M6.4 13.36V16.24"/>',
  // Đồng xu tương lai (mờ) kéo về đồng xu hôm nay (tô): kết quả là số tiền hôm nay.
  'gia-tri-hien-tai':
    '<path d="M2.6 13A3.6 3.6 0 1 0 9.8 13A3.6 3.6 0 1 0 2.6 13Z" fill="currentColor" fill-opacity=".22" stroke="none"/><circle cx="6.2" cy="13" r="3.6"/><path d="M6.2 11.7V14.3"/><path d="M15.4 13L11.2 13"/><path d="M12.83 14.47L11.2 13L12.83 11.53"/><g stroke-opacity=".4"><circle cx="18.2" cy="13" r="3.9"/><path d="M18.2 11.6V14.4"/></g><path d="M18.2 6V8" stroke-opacity=".4"/>',
  // Đồng xu hôm nay (mờ) lớn lên thành đồng xu tương lai (tô): kết quả là số tiền cuối kỳ.
  'gia-tri-tuong-lai':
    '<g stroke-opacity=".4"><circle cx="5.8" cy="13" r="3.6"/><path d="M5.8 11.7V14.3"/></g><path d="M10.4 13L13.6 13"/><path d="M11.97 11.53L13.6 13L11.97 14.47"/><path d="M13.3 13A4.6 4.6 0 1 0 22.5 13A4.6 4.6 0 1 0 13.3 13Z" fill="currentColor" fill-opacity=".22" stroke="none"/><circle cx="17.9" cy="13" r="4.6"/><path d="M17.9 11.34V14.66"/>',
  // Cột nét đứt là giá trị ước tính, cột liền là thị giá, phần tô ở giữa là khoảng mua rẻ hơn.
  'bien-an-toan':
    '<rect x="4" y="4" width="6.5" height="17" rx="1" stroke-dasharray="2 2.4"/><rect x="13.5" y="11" width="6.5" height="10" rx="1"/><path d="M13.5 4h6.5v7h-6.5Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M10.5 4H20M13.5 4V11M20 4V11" stroke-opacity=".4"/>',
  // Cột vốn bỏ ra và cột giá trị hiện tại, phần tô là phần lãi so với vốn.
  roi: '<rect x="4" y="12" width="6.5" height="9" rx="1"/><rect x="13.5" y="4" width="6.5" height="17" rx="1"/><path d="M13.5 4h6.5v8h-6.5Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M13.5 12H20"/><path d="M10.5 12H13.5" stroke-opacity=".4"/>',
  // Như ROI, cộng thêm hai đồng xu trên đỉnh: tăng giá cộng cổ tức nhận trong kỳ.
  hpr: '<rect x="4" y="13" width="6.5" height="8" rx="1"/><rect x="13.5" y="9" width="6.5" height="12" rx="1"/><path d="M13.5 9h6.5v4h-6.5Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M13.5 13H20"/><path d="M10.5 13H13.5" stroke-opacity=".4"/><g transform="translate(16.75 4.6) scale(0.95)" stroke-width="1.842"><circle cx="-2" cy="0.6" r="2.2"/><circle cx="2" cy="-0.6" r="2.2"/></g>',
  // Đường lên xuống thất thường (mờ) được quy về một đường tăng đều nối cùng hai điểm đầu cuối.
  cagr: '<path d="M3 18L6.5 13L9 16L12.5 8L15.5 12L21 5" stroke-opacity=".4"/><path d="M3 18C9 17 15 13 21 5"/><circle cx="3" cy="18" r="1.4" fill="currentColor" stroke="none"/><circle cx="21" cy="5" r="1.4" fill="currentColor" stroke="none"/>',
  // Hai đồng xu cổ tức chia nhãn giá: tiền mặt nhận mỗi năm trên giá mua.
  'ty-suat-co-tuc':
    '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><circle cx="-2" cy="0.6" r="2.2"/><circle cx="2" cy="-0.6" r="2.2"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><path d="M-4 0L-1.6 -3H4V3H-1.6Z"/><circle cx="-0.6" cy="0" r="0.75" fill="currentColor" stroke="none"/></g>',
  // Mũi tên tiền ra (xuống) và tiền vào (lên) ở những ngày cách nhau không đều.
  xirr: '<path d="M2 12H22"/><path d="M3.5 12L3.5 19"/><path d="M4.84 17.51L3.5 19L2.16 17.51"/><path d="M7.5 12L7.5 6"/><path d="M6.16 7.49L7.5 6L8.84 7.49"/><path d="M12.5 12L12.5 17.5"/><path d="M13.84 16.01L12.5 17.5L11.16 16.01"/><path d="M15.5 12L15.5 7.5"/><path d="M14.16 8.99L15.5 7.5L16.84 8.99"/><path d="M20.5 12L20.5 4"/><path d="M19.16 5.49L20.5 4L21.84 5.49"/>',
  // Lịch 12 ô, chỉ một ô đậm: lấy lãi một kỳ quy ra cả năm.
  'loi-suat-nam-hoa':
    '<rect x="3" y="4.5" width="18" height="16.5" rx="1.8"/><path d="M3 8.1H21"/><path d="M8.04 2.9V5.9M15.96 2.9V5.9"/><circle cx="7" cy="11.4" r="1.3" fill="currentColor" stroke="none"/><circle cx="10.33" cy="11.4" r="0.9" fill="currentColor" fill-opacity=".35" stroke="none"/><circle cx="13.67" cy="11.4" r="0.9" fill="currentColor" fill-opacity=".35" stroke="none"/><circle cx="17" cy="11.4" r="0.9" fill="currentColor" fill-opacity=".35" stroke="none"/><circle cx="7" cy="14.6" r="0.9" fill="currentColor" fill-opacity=".35" stroke="none"/><circle cx="10.33" cy="14.6" r="0.9" fill="currentColor" fill-opacity=".35" stroke="none"/><circle cx="13.67" cy="14.6" r="0.9" fill="currentColor" fill-opacity=".35" stroke="none"/><circle cx="17" cy="14.6" r="0.9" fill="currentColor" fill-opacity=".35" stroke="none"/><circle cx="7" cy="17.8" r="0.9" fill="currentColor" fill-opacity=".35" stroke="none"/><circle cx="10.33" cy="17.8" r="0.9" fill="currentColor" fill-opacity=".35" stroke="none"/><circle cx="13.67" cy="17.8" r="0.9" fill="currentColor" fill-opacity=".35" stroke="none"/><circle cx="17" cy="17.8" r="0.9" fill="currentColor" fill-opacity=".35" stroke="none"/>',
  // Cột lợi suất danh nghĩa bị mũi tên lạm phát ép xuống, phần tô là lợi suất thực còn lại.
  'loi-suat-thuc':
    '<g stroke-opacity=".4"><rect x="6" y="3" width="12" height="18" rx="1.5"/></g><rect x="6" y="10" width="12" height="11" rx="1.5"/><path d="M6 10h12v11h-12Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M12 3.8L12 8.4"/><path d="M13.34 6.91L12 8.4L10.66 6.91"/>',
  // Bậc thang nhập lãi nhiều lần đi cao hơn đường lãi danh nghĩa (mờ).
  'lai-suat-hieu-dung':
    '<path d="M3 20L21 8" stroke-opacity=".4"/><path d="M3 20H5.6V17.6H8.6V15H11.6V12.2H14.6V9.2H17.6V6H21"/>',
  // Đồng xu cổ tức được mũi tên đưa ngược vào đường tăng giá: cổ tức mua thêm cổ phiếu.
  'tong-loi-suat-tai-dau-tu':
    '<path d="M3 13L8 8.5L11 10.5L19 3.5"/><path d="M16.6 3.47L19 3.5L18.72 5.88"/><circle cx="17" cy="17" r="3.4"/><path d="M17 15.78V18.22"/><path d="M13.4 17.4C8.6 18.4 5.2 16.8 4.6 14.2"/><path d="M3.57 16.14L4.6 14.2L6.42 15.43"/>',
  // Ba kỳ lợi suất cao thấp khác nhau và một mức trung bình chung (nét đứt).
  'loi-suat-trung-binh-hinh-hoc':
    '<rect x="4" y="7" width="3.6" height="14" rx="0.8"/><rect x="10.2" y="15" width="3.6" height="6" rx="0.8"/><rect x="16.4" y="4" width="3.6" height="17" rx="0.8"/><path d="M2 12H22" stroke-dasharray="2 2.4"/>',
  // Một mũi tên bỏ vốn xuống, sau đó các mũi tên thu về đều nhau: dòng tiền niên kim.
  'irr-nien-kim':
    '<path d="M2 13H22"/><path d="M4.5 13L4.5 21"/><path d="M5.97 19.37L4.5 21L3.03 19.37"/><path d="M10 13L10 4"/><path d="M8.53 5.63L10 4L11.47 5.63"/><path d="M14.5 13L14.5 4"/><path d="M13.03 5.63L14.5 4L15.97 5.63"/><path d="M19 13L19 4"/><path d="M17.53 5.63L19 4L20.47 5.63"/>',
  // Một đồng xu thành hai đồng xu: bao lâu thì vốn gấp đôi.
  'thoi-gian-nhan-doi':
    '<circle cx="5.4" cy="12" r="3.3"/><path d="M5.4 10.81V13.19"/><path d="M10 12L13.4 12"/><path d="M11.91 10.66L13.4 12L11.91 13.34"/><circle cx="18.2" cy="7.4" r="3.3"/><path d="M18.2 6.21V8.59"/><circle cx="18.2" cy="16.6" r="3.3"/><path d="M18.2 15.41V17.79"/>',
  // Đoạn ngắn vài ngày (tô) bị kéo dài thành cả thanh một năm.
  'loi-suat-quy-nam-theo-ngay':
    '<path d="M4 15H21.5V19.5H4" stroke-opacity=".4"/><rect x="2.5" y="15" width="4" height="4.5" rx="1"/><path d="M2.5 15h4v4.5h-4Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M4.5 10L21 10"/><path d="M19.22 8.39L21 10L19.22 11.61"/><path d="M4.5 8V12"/>',
  // Đường danh mục nằm trên đường chỉ số (mờ), phần tô là phần thắng chuẩn.
  'loi-suat-vuot-chuan':
    '<path d="M3 18L9 15L14 16L21 12" stroke-opacity=".4"/><path d="M3 17L9 11L14 12L21 5"/><path d="M14 12L21 5V12L14 16Z" fill="currentColor" fill-opacity=".22" stroke="none"/><circle cx="21" cy="5" r="1.3" fill="currentColor" stroke="none"/>',
  // Miếng nhỏ 1–2% của vòng vốn quyết định chồng cổ phiếu được mua.
  'co-lenh-rui-ro':
    '<circle cx="7.5" cy="8.5" r="5.4"/><path d="M7.5 8.5L7.5 3.1A5.4 5.4 0 0 1 11.64 5.03Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M7.5 8.5L7.5 3.1A5.4 5.4 0 0 1 11.64 5.03Z"/><rect x="13" y="15.6" width="8.5" height="5" rx="1"/><rect x="13" y="10.6" width="8.5" height="5" rx="1"/>',
  // Giá rơi từ đỉnh xuống đáy sâu nhất, mũi tên đo độ sâu cú rơi.
  'sut-giam-sau-nhat':
    '<path d="M2 14L6.5 4.5L10.5 10L13 8L17.5 19.5"/><path d="M6.5 4.5H22M17.5 19.5H22" stroke-opacity=".4"/><path d="M21 6.5L21 17.5"/><path d="M22.47 15.87L21 17.5L19.53 15.87"/>',
  // Chấm giá hôm nay nằm dưới đỉnh gần nhất, mũi tên đo khoảng còn thiếu.
  'sut-giam-hien-tai':
    '<path d="M6.5 5H22" stroke-opacity=".4"/><path d="M2 15L6.5 5L11 14L14.5 10.5L17.5 14"/><circle cx="17.5" cy="14" r="1.7" fill="currentColor" stroke="none"/><path d="M21 7L21 14"/><path d="M22.47 12.37L21 14L19.53 12.37"/>',
  // Biểu đồ phân phối lợi suất, vạch cắt ở đuôi trái: ngưỡng lỗ của phiên tệ.
  'var-lich-su':
    '<path d="M3 21V18M6 21V15M9 21V11M12 21V7M15 21V10M18 21V15M21 21V18"/><path d="M7.5 2.5V21" stroke-dasharray="2 2.4"/>',
  // Cùng biểu đồ, chỉ đậm phần đuôi bên trái vạch cắt: lỗ trung bình trong nhóm phiên tệ nhất.
  'cvar-lich-su':
    '<path d="M3 21V18M6 21V15"/><path d="M9 21V11M12 21V7M15 21V10M18 21V15M21 21V18" stroke-opacity=".4"/><path d="M7.5 2.5V21"/>',
  // Đường chuông với hai vạch ±1 độ lệch chuẩn.
  'do-lech-chuan-loi-suat-phien':
    '<path d="M2 19C6 19 7.5 5 12 5C16.5 5 18 19 22 19"/><path d="M2 21H22"/><path d="M8.4 10V21M15.6 10V21" stroke-dasharray="2 2.4"/>',
  // Chuông hẹp (một phiên) mở rộng thành chuông rộng (một năm).
  'do-bien-dong-nam-hoa':
    '<path d="M2 16C3.6 16 4 10.5 5.5 10.5S7.4 16 9 16"/><path d="M10 12.5L13 12.5"/><path d="M11.66 11.3L13 12.5L11.66 13.7"/><path d="M14 16C15.6 16 16 6 18 6S20.4 16 22 16"/><path d="M2 18.5H9M14 18.5H22"/>',
  // Chỉ tô nửa chuông bên trái: chỉ đo phần dao động xuống.
  'do-lech-chuan-ban-phan':
    '<path d="M2 19C6 19 7.5 5 12 5"/><path d="M12 5C16.5 5 18 19 22 19" stroke-opacity=".4"/><path d="M2 21H22"/><path d="M2 19C6 19 7.5 5 12 5V21H2Z" fill="currentColor" fill-opacity=".22" stroke="none"/>',
  // Đường chuông chia mũi tên lợi suất: độ lệch chuẩn trên lợi suất bình quân.
  'he-so-bien-thien':
    '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-4 2.8C-2.2 2.8 -1.6 -2.8 0 -2.8S2.2 2.8 4 2.8"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><path d="M-4 3L-1.2 0.2L1 1.8L4 -2.8"/><path d="M1.3 -2.9H4V-0.2"/></g>',
  // Hai chấm đáy thấp nhất và đỉnh cao nhất nằm trên hai vạch biên.
  'bien-do-dao-dong-lon-nhat':
    '<path d="M2 5H22M2 19H22" stroke-opacity=".4"/><path d="M3 13L6 19L10 10L13 14L17 5L21 11"/><circle cx="6" cy="19" r="1.4" fill="currentColor" stroke="none"/><circle cx="17" cy="5" r="1.4" fill="currentColor" stroke="none"/>',
  // Cầu thang đi xuống, mỗi bậc là một phiên giảm liên tiếp.
  'chuoi-phien-giam-dai-nhat':
    '<path d="M3 5H7V9H11V13H15V17H21"/><path d="M13.5 4.5L20 11"/><path d="M19.88 8.8L20 11L17.8 10.88"/>',
  // Đám chấm và đường hồi quy: độ dốc của đường chính là beta.
  beta: '<path d="M3 3V21H21"/><path d="M5 18.5L20.5 5"/><circle cx="7" cy="14.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="17" r="1.1" fill="currentColor" stroke="none"/><circle cx="11.5" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="13.5" cy="13.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="18" cy="10" r="1.1" fill="currentColor" stroke="none"/>',
  // Lợi suất chia đường chuông: lợi suất vượt phi rủi ro trên độ lệch chuẩn.
  'ty-so-sharpe':
    '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-4 3L-1.2 0.2L1 1.8L4 -2.8"/><path d="M1.3 -2.9H4V-0.2"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><path d="M-4 2.8C-2.2 2.8 -1.6 -2.8 0 -2.8S2.2 2.8 4 2.8"/></g>',
  // Lợi suất chia nửa chuông chiều giảm: chỉ phạt dao động xuống.
  'ty-so-sortino':
    '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-4 3L-1.2 0.2L1 1.8L4 -2.8"/><path d="M1.3 -2.9H4V-0.2"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><path d="M-4 2.8C-2.2 2.8 -1.6 -2.8 0 -2.8V2.8Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M-4 2.8C-2.2 2.8 -1.6 -2.8 0 -2.8V2.8"/><path d="M0 -2.8C1.6 -2.8 2.2 2.8 4 2.8" stroke-opacity=".4"/></g>',
  // Lợi suất chia ký hiệu beta (đám chấm và đường dốc): lợi suất trên rủi ro hệ thống.
  'ty-so-treynor':
    '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-4 3L-1.2 0.2L1 1.8L4 -2.8"/><path d="M1.3 -2.9H4V-0.2"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><path d="M-4 3L4 -3"/><circle cx="-2.4" cy="0.2" r="0.75" fill="currentColor" stroke="none"/><circle cx="0.2" cy="1.4" r="0.75" fill="currentColor" stroke="none"/><circle cx="1.6" cy="-2.4" r="0.75" fill="currentColor" stroke="none"/></g>',
  // Lợi suất chia hai đường lệch nhau: phần thắng chuẩn trên mức đi lệch khỏi chuẩn.
  'ty-so-thong-tin':
    '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-4 3L-1.2 0.2L1 1.8L4 -2.8"/><path d="M1.3 -2.9H4V-0.2"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><path d="M-4 0.2L4 -2.8"/><path d="M-4 3L4 0" stroke-opacity=".4"/></g>',
  // Lợi suất chia cú rơi từ đỉnh: lợi suất năm trên mức sụt giảm sâu nhất.
  'ty-so-calmar':
    '<g transform="translate(12 6) scale(1.2)" stroke-width="1.458"><path d="M-4 3L-1.2 0.2L1 1.8L4 -2.8"/><path d="M1.3 -2.9H4V-0.2"/></g><path d="M4.5 12H19.5"/><g transform="translate(12 18) scale(1.2)" stroke-width="1.458"><path d="M-4 -2.8L0.6 3.2L4 0.2"/><path d="M-4 -2.8H4" stroke-opacity=".4"/></g>',
  // Cột phiên tăng trên trục và cột phiên giảm dưới trục, so độ lớn hai bên.
  'ty-so-thang-thua':
    '<path d="M2.5 13H21.5"/><rect x="5" y="3.5" width="5.5" height="9.5" rx="1"/><path d="M5 3.5h5.5v9.5h-5.5Z" fill="currentColor" fill-opacity=".22" stroke="none"/><rect x="13.5" y="13" width="5.5" height="5.5" rx="1"/>',
  // Đường giá răng cưa (mờ) được làm mượt; năm vạch dưới bằng nhau: mọi phiên cùng trọng số.
  'sma-n-phien':
    '<path d="M2 11L5 6.5L8 10L11 4.5L14 9.5L17 3.5L20 7.5L22 5.5" stroke-opacity=".4"/><path d="M2 10C8 9 14 7.5 22 4.5"/><path d="M4 21V17M8 21V17M12 21V17M16 21V17M20 21V17"/>',
  // Như SMA nhưng vạch trọng số tăng dần: phiên càng mới càng nặng.
  'ema-n-phien':
    '<path d="M2 11L5 6.5L8 10L11 4.5L14 9.5L17 3.5L20 7.5L22 5.5" stroke-opacity=".4"/><path d="M2 10.5C9 10 15 8 22 5"/><path d="M4 21V19.5M8 21V18.4M12 21V17.3M16 21V16.2M20 21V15"/>',
  // Đường MACD cắt qua mốc 0 (vạch mờ), chấm đánh dấu điểm đổi chiều.
  'macd-duong-chinh':
    '<path d="M2 12H22" stroke-opacity=".4"/><path d="M2 18C7 18 9 13.5 12 12C15 10.5 17 6 22 6"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  // Đường MACD và đường tín hiệu mượt hơn (nét đứt) đi cạnh nhau.
  'macd-duong-tin-hieu':
    '<path d="M2 17C7 17 10 7.5 14 7.5C17 7.5 19 11 22 12.5"/><path d="M2 19C8 19 11 10.5 15 10C18 9.6 20 10.8 22 11" stroke-dasharray="2 2.4"/>',
  // Đường dao động giữa hai vạch ngưỡng 70 và 30.
  'rsi-wilder':
    '<path d="M2 7H22M2 17H22" stroke-opacity=".4"/><path d="M2 13C5 3.5 8 3.5 10 11C12 18.5 15 21 17 14C19 8 21 9 22 10"/>',
  // Đồng hồ đo tốc độ: giá thay đổi nhanh chậm bao nhiêu phần trăm.
  'roc-toc-do-thay-doi':
    '<path d="M3.5 17A8.5 8.5 0 0 1 20.5 17"/><path d="M12 8.5V10.5M5.8 11L7.2 12.2M18.2 11L16.8 12.2"/><path d="M12 17L16.5 11"/><circle cx="12" cy="17" r="1.6" fill="currentColor" stroke="none"/><path d="M3 20.5H21"/>',
  // Mũi tên có vệt tốc độ: sức đẩy của xu hướng.
  'dong-luong-momentum':
    '<path d="M9 12L21.5 12"/><path d="M19.27 9.99L21.5 12L19.27 14.01"/><path d="M3 7.5H10M2 12H5.5M3 16.5H10"/>',
  // Chấm giá cách đường trung bình, mũi tên đo khoảng cách.
  'khoang-cach-gia-so-sma':
    '<path d="M2 17.5C8 16.5 14 14.5 22 11.5"/><circle cx="15" cy="5" r="1.7" fill="currentColor" stroke="none"/><path d="M15 7.3L15 12.4"/><path d="M16.34 10.91L15 12.4L13.66 10.91"/><path d="M13.66 8.79L15 7.3L16.34 8.79"/>',
  // Đường ngắn và đường dài (nét đứt) cắt nhau, vòng tròn đánh dấu điểm cắt.
  'giao-cat-hai-duong-ma':
    '<path d="M2 18C9 18 15 6 22 6"/><path d="M2 8C9 8 15 16 22 16" stroke-dasharray="2 2.4"/><circle cx="12" cy="12" r="2.2"/>',
  // Ba đường dải, chỉ dải trên đậm, chấm giá chạm dải trên.
  'dai-bollinger-tren':
    '<path d="M2 7.5C8 3 14 7 22 3"/><path d="M2 12C8 8 14 12 22 8" stroke-opacity=".4"/><path d="M2 16.5C8 13 14 17 22 13" stroke-opacity=".4"/><circle cx="17.2" cy="5.3" r="1.6" fill="currentColor" stroke="none"/>',
  // Ba đường dải, chỉ dải dưới đậm, chấm giá chạm dải dưới.
  'dai-bollinger-duoi':
    '<path d="M2 7.5C8 3 14 7 22 3" stroke-opacity=".4"/><path d="M2 12C8 8 14 12 22 8" stroke-opacity=".4"/><path d="M2 16.5C8 13 14 17 22 13"/><circle cx="17.2" cy="15.3" r="1.6" fill="currentColor" stroke="none"/>',
  // Dải trên và dải dưới với mũi tên đo khoảng cách giữa hai dải.
  'do-rong-dai-bollinger':
    '<path d="M2 7C8 3 14 7 22 3"/><path d="M2 19C8 15 14 19 22 15"/><path d="M11.25 7.4L11.25 14.6"/><path d="M12.59 13.11L11.25 14.6L9.91 13.11"/><path d="M9.91 8.89L11.25 7.4L12.59 8.89"/>',
  // Hai cây nến và thước đo biên độ từ cao nhất xuống thấp nhất.
  'atr-dao-dong-thuc':
    '<path d="M7 4V20"/><rect x="5.5" y="8" width="3" height="8" rx="0.6"/><path d="M13 7V17"/><rect x="11.5" y="9" width="3" height="5" rx="0.6"/><path d="M19 4V20M17.5 4H20.5M17.5 20H20.5"/>',
  // Chấm giá giữa hai dải được chiếu sang thước đo: vị trí tính bằng phần trăm.
  'phan-tram-b-bollinger':
    '<path d="M2 5H14M2 19H14"/><circle cx="8" cy="8" r="1.7" fill="currentColor" stroke="none"/><path d="M10 8H17" stroke-opacity=".4"/><path d="M19.5 5V19M18 5H21M18 19H21"/><circle cx="19.5" cy="8" r="1.7" fill="currentColor" stroke="none"/>',
  // Nến cuối đóng cửa sát vạch đỉnh của n phiên.
  'stochastic-k':
    '<path d="M2 4.5H22M2 19.5H22" stroke-opacity=".4"/><path d="M6 9V17"/><rect x="4.8" y="11" width="2.4" height="4" rx="0.5"/><path d="M12 7V16"/><rect x="10.8" y="9" width="2.4" height="5" rx="0.5"/><path d="M18 5V13"/><rect x="16.8" y="6.5" width="2.4" height="4" rx="0.5"/><path d="M16.8 6.5h2.4v4h-2.4Z" fill="currentColor" fill-opacity=".22" stroke="none"/>',
  // Đường giá bình quân nằm trên các cột khối lượng: giá có trọng số khối lượng.
  vwap: '<path d="M2 12L6 5L10 11L14 4.5L18 10.5L22 6" stroke-opacity=".4"/><path d="M2 8.5H22"/><path d="M3 21V17M7.5 21V14.5M12 21V18M16.5 21V15.5M21 21V16.5"/>',
  // Đường dao động kèm đồng hồ: biến động đo từ dữ liệu quá khứ.
  'do-bien-dong-lich-su':
    '<circle cx="16.5" cy="7" r="4.5"/><path d="M16.5 4.6V7L18.4 8.4"/><path d="M2 17C4.5 11 7 11 9 16C11 21 13.5 21 15.5 16C17.5 11 20 13 22 16"/>',
  // Một cột khối lượng vượt hẳn vạch trung bình (mờ): hôm nay gấp mấy lần bình thường.
  'ty-le-khoi-luong':
    '<path d="M3 21V17M7 21V18M11 21V16M15 21V17.5"/><rect x="18.8" y="4" width="3.2" height="17" rx="0.8"/><path d="M18.8 4h3.2v17h-3.2Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M2 14.5H16.5" stroke-opacity=".4"/>',
  // Chấm chỉ số hôm nay đi lên tới chấm giá ở ngày đáo hạn (lịch): cộng chi phí nắm giữ.
  'gia-ly-thuyet-vn30f':
    '<circle cx="3.8" cy="17" r="1.7" fill="currentColor" stroke="none"/><path d="M5.6 16.6C10 16 14.4 14.6 17.4 13.8"/><circle cx="19" cy="13.4" r="1.7" fill="currentColor" stroke="none"/><rect x="15" y="3.6" width="8" height="6.6" rx="1.8"/><path d="M15 6H23"/><path d="M17.24 2V5M20.76 2V5"/><path d="M2 20H22" stroke-opacity=".4"/>',
  // Đường hợp đồng và đường chỉ số hội tụ về một điểm, mũi tên đo khoảng chênh.
  'basis-vn30f':
    '<path d="M3 6L20 12"/><path d="M3 18L20 12" stroke-dasharray="2 2.4"/><circle cx="20" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M6 8.7L6 15.3"/><path d="M7.27 13.89L6 15.3L4.73 13.89"/><path d="M4.73 10.11L6 8.7L7.27 10.11"/>',
  // Đường giá đi lên: vị thế mua lãi khi giá tăng.
  'lai-lo-vi-the-long':
    '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 16L10.5 12.5L13 14.5L17 8.5"/><path d="M14.48 9.14L17 8.5L17.38 11.07"/>',
  // Đường giá đi xuống: vị thế bán lãi khi giá giảm.
  'lai-lo-vi-the-short':
    '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 8L10.5 11.5L13 9.5L17 15.5"/><path d="M17.38 12.93L17 15.5L14.48 14.86"/>',
  // Chồng hợp đồng chạm vạch trần: số hợp đồng tối đa mà vốn ký quỹ cho phép.
  'so-hop-dong-toi-da':
    '<path d="M3 3.5H21" stroke-dasharray="2 2.4"/><rect x="4.5" y="12" width="15" height="8.5" rx="1.6"/><path d="M6.5 9.2H17.5M8.5 6.6H15.5"/><path d="M8 16.3H13"/>',
  // Miếng nhỏ % rủi ro của vòng vốn quyết định số hợp đồng mở.
  'co-vi-the-phai-sinh':
    '<circle cx="7.5" cy="8.5" r="5.4"/><path d="M7.5 8.5L7.5 3.1A5.4 5.4 0 0 1 11.64 5.03Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M7.5 8.5L7.5 3.1A5.4 5.4 0 0 1 11.64 5.03Z"/><rect x="12.5" y="15" width="9.5" height="6" rx="1.2"/><path d="M14 12.4H20.5"/>',
  // Đòn bẩy: quả nặng nhỏ ở đầu ngắn nâng được lực lớn ở đầu dài.
  'don-bay-hieu-dung':
    '<path d="M2 19L22 12"/><path d="M9 20.5L12 15.5L15 20.5"/><rect x="2.5" y="13.2" width="4" height="3.6" rx="0.6"/><path d="M20 3.5L20 10.2"/><path d="M21.47 8.57L20 10.2L18.53 8.57"/>',
  // Xe đẩy mua hàng kèm đồng xu dấu trừ: khoản phí bị trừ khi mua.
  'phi-giao-dich-mua':
    '<path d="M2 6H4.5L6.5 15.5H15.5L17.4 9H5.3"/><circle cx="8" cy="19" r="1.3"/><circle cx="14.5" cy="19" r="1.3"/><circle cx="19" cy="5" r="3"/><path d="M17.6 5H20.4"/>',
  // Nhãn giá bán kèm đồng xu dấu trừ: khoản phí bị trừ khi bán.
  'phi-giao-dich-ban':
    '<path d="M2.5 14L8 8H16.5V20H8Z"/><circle cx="8.4" cy="14" r="1.1" fill="currentColor" stroke="none"/><circle cx="19" cy="5" r="3"/><path d="M17.6 5H20.4"/>',
  // Cơ quan thuế kèm nhãn giá bán: thuế tính trên giá trị bán.
  'thue-chuyen-nhuong':
    '<path d="M2.5 8.2L8 4.6L13.5 8.2Z"/><path d="M4.6 10.4V16.4M8 10.4V16.4M11.4 10.4V16.4"/><path d="M2.5 18.8H13.5"/><g transform="translate(18.6 12) scale(1.05)" stroke-width="1.667"><path d="M-4 0L-1.6 -3H4V3H-1.6Z"/><circle cx="-0.6" cy="0" r="0.75" fill="currentColor" stroke="none"/></g>',
  // Cơ quan thuế kèm hai đồng xu cổ tức: thuế trừ vào cổ tức tiền mặt.
  'thue-co-tuc':
    '<path d="M2.5 8.2L8 4.6L13.5 8.2Z"/><path d="M4.6 10.4V16.4M8 10.4V16.4M11.4 10.4V16.4"/><path d="M2.5 18.8H13.5"/><g transform="translate(18.4 12) scale(1.0)" stroke-width="1.750"><circle cx="-2" cy="0.6" r="2.2"/><circle cx="2" cy="-0.6" r="2.2"/></g>',
  // Két giữ cổ phiếu kèm đồng hồ: phí lưu ký tính theo thời gian nắm giữ.
  'phi-luu-ky':
    '<rect x="2.5" y="6" width="13.5" height="13" rx="2"/><circle cx="9.25" cy="12.5" r="3.2"/><circle cx="9.25" cy="12.5" r="0.9" fill="currentColor" stroke="none"/><path d="M5.5 19V21M13 19V21"/><circle cx="19" cy="6.5" r="3.4"/><path d="M19 4.8V6.5L20.3 7.6"/>',
  // Nhãn giá với dấu bằng: mức giá bán để hoà vốn sau phí và thuế.
  'gia-hoa-von':
    '<path d="M2.5 12L8.5 5H21.5V19H8.5Z"/><circle cx="8.6" cy="12" r="1.2" fill="currentColor" stroke="none"/><path d="M12.5 10.5H18.5M12.5 13.5H18.5"/>',
  // Chiếc ví: số tiền thực sự về túi sau phí và thuế.
  'loi-nhuan-rong':
    '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M16 10.5H21V15.5H16A2.5 2.5 0 0 1 16 10.5Z"/><circle cx="16.3" cy="13" r="1" fill="currentColor" stroke="none"/><path d="M5 6L14.5 3L16.5 6"/>',
  // Ví kèm mũi tên tăng: tỷ suất lợi nhuận thật tính trên tiền về túi.
  'roi-rong':
    '<rect x="2" y="9" width="15" height="12" rx="2"/><path d="M12.5 13H17V17H12.5A2 2 0 0 1 12.5 13Z"/><circle cx="12.8" cy="15" r="0.9" fill="currentColor" stroke="none"/><path d="M13 7.5L20.8 2.6"/><path d="M18.44 2.19L20.8 2.6L20.14 4.91"/>',
  // Ba chồng xu cao dần: lãi nhập gốc làm khoản tiền lớn nhanh dần.
  'lai-kep':
    '<rect x="2.5" y="15.5" width="5" height="5.5" rx="1.6"/><rect x="9.5" y="10.5" width="5" height="10.5" rx="1.6"/><rect x="16.5" y="4.5" width="5" height="16.5" rx="1.6"/><path d="M2.5 18.2H7.5M9.5 13.2H14.5M9.5 15.9H14.5M9.5 18.6H14.5"/><path d="M16.5 7.2H21.5M16.5 9.9H21.5M16.5 12.6H21.5M16.5 15.3H21.5M16.5 18H21.5"/>',
  // Đồng xu bỏ vào heo đất: tiền gửi tiết kiệm sinh lãi.
  'lai-tien-gui':
    '<path d="M4.5 12.5C4.5 9 8 7 12.5 7C16 7 18.5 8.5 19.5 11H21.5V15H19.5C19 16.4 18 17.4 17 18V21H14.5V19H10.5V21H8V18C6 16.8 4.5 14.8 4.5 12.5Z"/><path d="M10.5 9.8H14"/><circle cx="17" cy="11" r="0.9" fill="currentColor" stroke="none"/><path d="M4.5 11.6C3 11.6 2.4 10.2 3 9.2"/><circle cx="12.25" cy="3.4" r="2.1"/><path d="M12.25 2.64V4.16"/>',
  // Lá cờ đích cạnh chồng xu: để dành để đạt một số tiền mục tiêu.
  'tiet-kiem-muc-tieu':
    '<path d="M5 21V3"/><path d="M5 4H16L13.5 7.5L16 11H5"/><rect x="11" y="14" width="10" height="7" rx="2"/><path d="M11 16.4H21M11 18.7H21"/>',
  // Thanh kỳ hạn bị rời ra giữa chừng, đoạn sau mờ: rút trước khi tới vạch đáo hạn.
  'rut-truoc-han':
    '<circle cx="3" cy="16" r="1.5" fill="currentColor" stroke="none"/><path d="M3 16H11"/><path d="M11 16H19.5" stroke-opacity=".4"/><path d="M20.5 12.5V19.5"/><path d="M11 16C11 12 12 9 15 6.5"/><path d="M12.6 6.43L15 6.5L14.68 8.88"/>',
  // Ba mũi tên ngắn nối nhau so với một mũi tên dài: quay vòng kỳ ngắn hay gửi một kỳ dài.
  'gui-quay-vong':
    '<path d="M2.5 7L7 7"/><path d="M5.66 5.8L7 7L5.66 8.2"/><path d="M9.75 7L14.25 7"/><path d="M12.91 5.8L14.25 7L12.91 8.2"/><path d="M17 7L21.5 7"/><path d="M20.16 5.8L21.5 7L20.16 8.2"/><path d="M2.5 17L21.5 17"/><path d="M19.57 15.26L21.5 17L19.57 18.74"/>',
  // Bốn cột trả bằng nhau, phần lãi (tô) nhỏ dần: khoản trả cố định mỗi kỳ.
  'tra-gop-nien-kim':
    '<rect x="2.5" y="6" width="2.8" height="14.5" rx="0.5"/><path d="M2.5 6h2.8v9h-2.8Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M2.5 15H5.3"/><rect x="7.9" y="6" width="2.8" height="14.5" rx="0.5"/><path d="M7.9 6h2.8v7h-2.8Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M7.9 13H10.7"/><rect x="13.3" y="6" width="2.8" height="14.5" rx="0.5"/><path d="M13.3 6h2.8v5h-2.8Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M13.3 11H16.1"/><rect x="18.7" y="6" width="2.8" height="14.5" rx="0.5"/><path d="M18.7 6h2.8v3h-2.8Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M18.7 9H21.5"/>',
  // Phần gốc dưới bằng nhau, phần lãi (tô) giảm nên cột thấp dần: kỳ đầu nặng nhất.
  'tra-gop-goc-deu':
    '<rect x="2.5" y="4" width="2.8" height="16.5" rx="0.5"/><path d="M2.5 4h2.8v12h-2.8Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M2.5 16H5.3"/><rect x="7.9" y="8" width="2.8" height="12.5" rx="0.5"/><path d="M7.9 8h2.8v8h-2.8Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M7.9 16H10.7"/><rect x="13.3" y="12" width="2.8" height="8.5" rx="0.5"/><path d="M13.3 12h2.8v4h-2.8Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M13.3 16H16.1"/><rect x="18.7" y="15" width="2.8" height="5.5" rx="0.5"/><path d="M18.7 15h2.8v1h-2.8Z" fill="currentColor" fill-opacity=".22" stroke="none"/><path d="M18.7 16H21.5"/>',
  // Bảng lịch trả từng kỳ, các dòng đã trả có dấu tích.
  'lich-tra-no':
    '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9H21M3 13H21M3 17H21"/><path d="M9.5 9V21"/><path d="M5 11L5.9 11.9L7.4 10.3M5 15L5.9 15.9L7.4 14.3"/>',
  // Ba lần mua ở ba mức giá, nét đứt là giá vốn bình quân.
  'gia-von-trung-binh-dca':
    '<circle cx="5.5" cy="6.5" r="2.6"/><path d="M5.5 5.56V7.44"/><circle cx="12" cy="17.5" r="2.6"/><path d="M12 16.56V18.44"/><circle cx="18.5" cy="8.5" r="2.6"/><path d="M18.5 7.56V9.44"/><path d="M2 12.5H22" stroke-dasharray="2 2.4"/>',
  // Từng bậc góp đều đi lên tới lá cờ mục tiêu: cần bao nhiêu kỳ.
  'so-ky-dca':
    '<path d="M3 20.5H7V16.5H11V12.5H15V8.5H18.5"/><path d="M18.5 8.5V2.5"/><path d="M18.5 3H22.5L21.3 4.6L22.5 6.2H18.5"/>',
  // Đường doanh thu cắt đường chi phí (nét đứt), vòng tròn là điểm hoà vốn.
  'diem-hoa-von':
    '<path d="M3 3V21H21"/><path d="M3 21L20 5"/><path d="M3 13L20 8" stroke-dasharray="2 2.4"/><circle cx="15.36" cy="9.36" r="1.9"/>',
  // Mũi tên nhỏ đi qua dấu khuếch đại thành mũi tên lớn: doanh thu đổi 1%, EPS đổi nhiều lần.
  'don-bay-tong-hop':
    '<path d="M5 20L5 14"/><path d="M3.53 15.63L5 14L6.47 15.63"/><path d="M9.5 9.5L12.5 12.5L9.5 15.5"/><path d="M18 21L18 3.5"/><path d="M15.99 5.73L18 3.5L20.01 5.73"/>',
  // Cơ quan thuế và một người: tổng thuế thu nhập cá nhân của nhà đầu tư cho một giao dịch.
  'thue-tncn-dau-tu':
    '<path d="M2.5 8.2L8 4.6L13.5 8.2Z"/><path d="M4.6 10.4V16.4M8 10.4V16.4M11.4 10.4V16.4"/><path d="M2.5 18.8H13.5"/><circle cx="18.6" cy="8.2" r="2.3"/><path d="M14.8 15.2C14.8 12.7 16.5 11.6 18.6 11.6C20.7 11.6 22.4 12.7 22.4 15.2"/>',
};
