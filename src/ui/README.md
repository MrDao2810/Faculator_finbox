# Tầng PRESENTATION — component dùng chung

## Đã có

- `primitives/` — gói WBS 1.2.1 và 2.3.3: `Button`, `Input`, `Select`, `Card`, `Chip`, `Table`
  (khung bảng có vùng cuộn ngang riêng). Mọi kiểu dáng đọc token từ `src/app/globals.css`,
  không hard-code màu.
- `navigation/` — gói 2.1: `AppHeader`, `OfflineBanner`, `ModeToggle`, `LangSwitch`,
  `BottomTabBar`, `DisclaimerBar`.
- `layout/` — gói 1.4.2: `AppShell`.
- `browse/` — gói 2.2: `SearchBox`, `CategoryFilter`, `FormulaCard`, `EmptyState`.
- `inputs/` — gói 2.3: `NumberInput` (5 trạng thái WF-16), `SliderInput`, `ButtonGroup`,
  `RadioGroup`, `SelectInput`, `Toggle`, `UnitSwitcher`, `LinkedInput` (4 trạng thái FR-15).
- `result/` — gói 2.4: `ResultBlock`, `ErrorState`, `InlineWarning`, `ExplanationAccordion`,
  `VariableTable`, `ExampleBlock`, `SourceBlock`, `FlowChainStrip`, `StatTile`.
- `contrast.ts` — công cụ tính tỉ số tương phản WCAG. `contrast.test.ts` đọc thẳng
  `globals.css` và chặn CI nếu đổi màu làm tụt dưới ngưỡng AA (NFR-USA-06).

## Sắp tới

Gói 2.4.3 `FormulaLatex` (đang hoãn — chưa chốt có thêm KaTeX hay không) và gói 2.5 bottom
sheet: `PresetSheet`, `PasteImportSheet`, `ExportSheet`.

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
