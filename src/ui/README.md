# Tầng PRESENTATION — component dùng chung

## Đã có

- `primitives/` — gói WBS 1.2.1, 2.3.3 và 2.5: `Button`, `Input`, `Select`, `Card`, `Chip`,
  `Badge`, `Table` (khung bảng có vùng cuộn ngang riêng), `BottomSheet` (dựng trên `<dialog>` gốc).
  Mọi kiểu dáng đọc token từ `src/app/globals.css`, không hard-code màu.
  `Badge` gom bảy bản chép của đợt rà soát phân cấp — hai họ, `basic`/`advanced` cho cấp độ và
  `code` cho mã chứng khoán. `Card` hiện **chưa có nơi dùng**: API `eyebrow`/`title`/`subtitle`
  của nó không khớp mặt nào đang có (`StatTile` đặt con số bên phải nhãn, `ChainBody.step` là
  `<details>`, dòng mã của Danh mục là `<li>`), nên hợp đồng phân cấp mà nó mã hoá đã chuyển sang
  bảng "Ba bậc chữ" dưới đây cùng các cửa gác đi kèm.
- `navigation/` — gói 2.1: `AppHeader`, `OfflineBanner`, `ModeToggle`, `LangSwitch`,
  `BottomTabBar`, `DisclaimerBar`.
- `layout/` — gói 1.4.2: `AppShell`.
- `browse/` — gói 2.2 và 3.1: `SearchBox`, `CategoryFilter`, `FormulaCard`, `EmptyState`,
  `CategoryGrid` (WF-01), `VirtualList` (ảo hoá WF-02), `SearchResults` và
  `RecentSearches` (WF-09).
- `inputs/` — gói 2.3: `NumberInput` (5 trạng thái WF-16), `SliderInput`, `ButtonGroup`,
  `RadioGroup`, `SelectInput`, `Toggle`, `UnitSwitcher`, `LinkedInput` (4 trạng thái FR-15),
  và `VariableField` chọn điều khiển theo `spec.type` (FR-05).
- `screens/` — gói 3.2.3 và 3.2.4: `FeeTaxBody` (WF-08), `LoanScheduleBody` (WF-14), nạp trễ
  theo id công thức qua `DetailBody`. Khác `result/`: những thứ trong đó dùng chung cho mọi
  công thức, còn ở đây là bố cục riêng của đúng một màn trong wireframe.
- `result/` — gói 2.4: `ResultBlock`, `ErrorState`, `InlineWarning`, `ExplanationAccordion`,
  `VariableTable`, `ExampleBlock`, `SourceBlock`, `FlowChainStrip`, `StatTile`.
- `sheets/` — gói 2.5: `PresetSheet` (WF-10), `PasteImportSheet` (WF-11), `ExportSheet` (WF-12)
  kèm `draw-card.ts` vẽ thẻ PNG bằng Canvas.
- `contrast.ts` — công cụ tính tỉ số tương phản WCAG. `contrast.test.ts` đọc thẳng
  `globals.css` và chặn CI nếu đổi màu làm tụt dưới ngưỡng AA (NFR-USA-06).

## Sắp tới

Không còn khối nào ở trạng thái chờ trên màn chi tiết.

Gói 2.4.3 (ký hiệu toán học) **đã xong**, nhưng KHÔNG có component nào ở đây: nó phải chạy lúc
build mới không tốn byte JS nào của trình duyệt, mà mọi thứ trong thư mục này đều là component
phía máy khách. Chỗ dựng nằm ở `src/app/cong-thuc/[id]/latex-html.ts`, gọi từ `page.tsx` — server
component. Đừng bọc lại thành một `FormulaLatex` ở đây; làm thế là kéo ~280 kB `katex` vào gói.

Nhánh 4 biểu đồ **đã xong** — `charts/` phủ 102/111 công thức, kèm màn phóng to toàn màn hình.
Từ gói 5.2.3 có thêm `charts/WaterfallChart` cho biểu đồ bóc tách, nay phủ **đủ 10** công thức khai
`waterfall`/`stackedBar`. Khai `chartType: 'waterfall'` thì bóc tách là hình MẶC ĐỊNH — bốn cái
(`ev`, `fcff`, `fcfe`, `ncav-tren-co-phieu`), đều là những công thức có đường quét thẳng nên hình
kia không nói gì. Khai `stackedBar` thì bóc tách chỉ là một mục trong ô chọn trục và đường quét vẫn
đứng đầu. Xem docblock của `chart/build.ts`.

Kiểm hình dạng thật bằng `npm run check:chrome` — jsdom trả 0 cho mọi phép đo hình học nên nhãn
tràn khung, cột âm vẽ ngược chiều và chiều cao chạy theo số chặng đều lọt qua `*.test.tsx`.

`inputs/LinkedInput` và `result/FlowChainStrip` **đã có nơi dùng** từ gói 5.2.3, sau một quãng dài
dựng xong mà nằm không. Chuỗi định giá có hai nhánh — `capm → mo-hinh-gordon → bien-an-toan`, và
`capm → wacc → gia-tri-noi-tai-fcff ← fcff → fcfe` — với hai chỗ gọi: `screens/ChainBody` (khối
chuỗi của màn nâng cao WF-04) cùng chính màn chi tiết, nơi biến nào có cạnh `dependsOn` thì lưới ô
nhập dựng `LinkedInput` thay cho `VariableField`.

`screens/ChainPanel` là ranh giới `next/dynamic` của khối ấy — **đừng** xuất `ChainBody` ra barrel,
xuất là cả 111 trang chi tiết cùng gánh trong khi chỉ **7 công thức** dùng tới (`capm`, `wacc`,
`mo-hinh-gordon`, `bien-an-toan`, `fcff`, `fcfe`, `gia-tri-noi-tai-fcff`), và chỉ khi bật chế độ
Nâng cao.

## Ba bậc chữ

Mọi khối chữ trên màn phải rơi vào **đúng một** trong ba bậc dưới đây. Đây là hợp đồng của đợt rà
soát phân cấp thị giác — bản rà soát báo "nhiều màn thiếu phân cấp rõ giữa primary – secondary –
metadata", và nguyên nhân đo được là 231 trên 291 khai báo `font-size` dồn vào hai bậc cách nhau
đúng 1px.

| Bậc           | Cỡ / đậm / màu                                            | Dùng cho                                  |
| ------------- | --------------------------------------------------------- | ----------------------------------------- |
| **primary**   | `--text-base` · `--weight-bold` · `--color-ink`           | tên công thức, mã CK, con số của một dòng |
| **secondary** | `--text-sm` · `--weight-regular` · `--color-ink-soft`     | mô tả, câu diễn giải, câu cảnh báo        |
| **metadata**  | `--text-xs` · `--weight-medium` · `--color-muted`, in hoa | nhóm, huy hiệu, nhãn ô, đơn vị            |

Hai bậc nằm ngoài bảng vì chúng chỉ có một chỗ dùng: **tiêu đề khối** (`--text-sm` · bold · in hoa ·
`--color-ink`) và **con số kết quả** (`clamp(--text-2xl, 9vw, --text-3xl)` · bold · `--color-ink`).

Năm cửa gác giữ những thứ này khỏi trôi, tất cả đọc thẳng file nguồn vì CSS Module không được áp
trong jsdom:

- `typography.test.ts` — hai bậc chữ liền nhau ở đáy thang phải cách ít nhất 2px.
- `section-title.test.ts` — 8 nơi khai tiêu đề khối phải giống nhau từng thuộc tính.
- `result-card.test.ts` — 3 thẻ mang đáp án của cả màn phải cùng một khuôn.
- `warning-surface.test.ts` — 5 mặt cảnh báo vàng phải cùng nền, viền, bo góc.
- `radius.test.ts` — `--radius-lg` chỉ dành cho bottom sheet; mọi điều khiển bo `--radius-md`.

## Màu nói gì

- **Xanh `--color-selected`** — hành động chính (`Button.primary`, nút thêm mã) và khối **Kết quả**.
  Đổi từ cam sang xanh ở đợt rà soát phân cấp, theo bản rà soát ("Blue = action/result").
- **Xanh `--color-accent`** — đi tới: link, tab, thanh điều hướng, đường biểu đồ.
- **Cam `--color-highlight`** — nay CHỈ còn là mốc dữ liệu: vạch giá trị hiện tại trên biểu đồ và
  thanh Hoàn tác. Không còn nút bấm nào màu cam.
- **Xám** — mọi thứ hạng phụ. **Vàng** — cảnh báo. **Đỏ** — hỏng. **Xanh lá** — lãi.

Bóng đổ chỉ dành cho lớp **nổi** (nút trượt, phản hồi hover). Thẻ tĩnh tách nền bằng viền 1px.

## Cách viết component ở đây

- **Controlled thuần.** Nhận `value` + `onChange`, không tự giữ state, không tự gọi hook đọc
  URL hay localStorage. Chỗ giữ state là màn hình ở `src/app`.
- **Sinh từ metadata, không hard-code.** Điều khiển nhập liệu đọc nhãn, đơn vị, miền hợp lệ,
  bước nhảy và danh sách lựa chọn từ `VariableSpec` (FR-05, LDR-01).
- **Phần khó để ở Domain.** Bảng chuyển trạng thái, định dạng số, thứ tự dải luồng đều là hàm
  thuần trong `src/core` nên test được bằng Node; component chỉ lắp ráp. Xem `input-state.ts`,
  `linked-input.ts`, `format.ts`, `flow-chain.ts`.
- **Dựng trên primitive**, không viết lại nút và ô nhập. Dòng gợi ý và câu lỗi đi qua
  `hint`/`error` của `Input` để được nối sẵn vào `aria-describedby`.
- **Trạng thái phải có ít nhất hai dấu hiệu** — màu cộng với viền, độ đậm, hoặc nhãn chữ. Không
  bao giờ chỉ có màu (NFR-USA-06). Cách kiểm nhanh: chụp màn hình rồi chuyển sang xám.
- **Vùng chạm ≥ 44px** cho mọi thứ bấm được (NFR-USA-01). Nút nhỏ thì nới bằng lớp phủ
  `::after` có chiều cao cố định `var(--tap-min)`, đừng nới tương đối kiểu `inset: -4px` —
  chiều cao thật của nút xê dịch theo font.

## Test

`*.test.tsx` chạy môi trường jsdom, bật bằng docblock `// @vitest-environment jsdom` ở đầu file.
Không có docblock thì file chạy môi trường Node và mọi lệnh render sẽ hỏng.

## Ràng buộc

CON-03: không được import thẳng `@/core/*` hay `@/data/*`. Mọi thứ đi qua `@/application` —
là barrel chọn lọc, muốn dùng gì ở Domain thì mở cửa ra đó từng thứ một.
