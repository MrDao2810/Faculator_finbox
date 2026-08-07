# Tầng DATA

Nơi ở của `DataProvider` và các bộ số liệu mẫu tĩnh mà wireframe WF-10 vẽ.

## Đã có

- `types.ts` — `DataProvider`, `Preset`, `DailyBar`, `Fundamentals`. Đây là hợp đồng của FR-17:
  giao diện chỉ biết tới interface, không biết số liệu đến từ file tĩnh hay từ API.
- `provider.ts` — `createStaticProvider()` đọc bộ tĩnh; `SAMPLE_DATA` là bản dùng trong sản phẩm.
- `samples.ts` — bốn mã FPT · HPG · VNM · MWG, mỗi mã 248 phiên giá.

## ⚠ Số liệu hiện tại là bản thảo

Con số trong `samples.ts` **do tôi tự dựng**, không phải báo cáo tài chính thật. SRS ghi giả
định A1 và rủi ro R-01: Finbox sẽ cấp bộ số liệu mẫu, tới giờ vẫn chưa có. Không có dữ liệu thì
sheet WF-10 không dựng được, nên đợt 6 tự dựng một bộ để hoàn thiện đường đi.

Mọi `Preset` mang `isDraft: true`, và `PresetSheet` hiện cảnh báo cho người dùng thấy. **Phải
thay bằng số liệu thật trước khi phát hành v0.1** — thay nội dung `samples.ts` là đủ.

## Đổi sang nguồn dữ liệu thật

Viết một cài đặt khác của `DataProvider` rồi đổi chỗ khởi tạo `SAMPLE_DATA`. Không component
nào phải sửa. Nếu nguồn mới là bất đồng bộ thì đổi kiểu trả về sang `Promise` — đó là thay đổi
phá vỡ có chủ đích, làm cùng lúc với gói lấy dữ liệu.

## Vì sao chuỗi giá sinh bằng hạt giống cố định

Bản build là HTML tĩnh, nên số liệu phải giống hệt nhau giữa lúc build và lúc chạy — dùng
`Math.random()` sẽ lệch hydration. Cùng lý do với việc `resolveConstant()` bắt buộc nhận `asOf`
thay vì tự lấy ngày hệ thống (NFR-REL-03).

## Ràng buộc

Không được import React hay Next, không được gọi lên tầng giao diện. Được phép import `@/core`.
