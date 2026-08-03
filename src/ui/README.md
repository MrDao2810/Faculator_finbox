# Tầng PRESENTATION — component dùng chung

## Đã có

- `primitives/` — gói WBS 1.2.1: `Button`, `Input`, `Card`, `Chip`, `Table` (khung bảng có
  vùng cuộn ngang riêng). Mọi kiểu dáng đọc token từ `src/app/globals.css`, không hard-code màu.
- `contrast.ts` — công cụ tính tỉ số tương phản WCAG. `contrast.test.ts` đọc thẳng
  `globals.css` và chặn CI nếu đổi màu làm tụt dưới ngưỡng AA (NFR-USA-06).

## Sắp tới

Nhánh 2 của WBS: AppHeader, BottomTabBar, DisclaimerBar, SearchBox, CategoryFilter, FormulaCard,
NumberInput (5 trạng thái WF-16), LinkedInput, ResultBlock, ErrorState… Mỗi component một thư mục,
dựng trên primitive sẵn có chứ không viết lại nút và ô nhập.

## Ràng buộc

CON-03: không được import thẳng `@/core/*` hay `@/data/*`. Mọi thứ đi qua `@/application`.
