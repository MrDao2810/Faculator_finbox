# Tầng DATA

Nơi ở của `DataProvider` và các bộ số liệu mẫu tĩnh mà wireframe WF-10 vẽ.

## Đã có

- `types.ts` — `DataProvider`, `Preset`, `DailyBar`, `Fundamentals`. Đây là hợp đồng của FR-17:
  giao diện chỉ biết tới interface, không biết số liệu đến từ file tĩnh hay từ API.
- `provider.ts` — `createStaticProvider()` đọc bộ tĩnh; `SAMPLE_DATA` là bản dùng trong sản phẩm.
- `samples.ts` — bốn mã FPT · HPG · VNM · MWG, mỗi mã 248 phiên giá.
- `live-fundamentals.generated.ts` — số liệu cơ bản THẬT của 4 mã trên, sinh bởi
  `npm run gen:live-fundamentals` (`scripts/gen-live-fundamentals.mjs`, gọi API Finbox_v2 lúc
  build/dev, không phải lúc chạy — site là static export, không backend).

## ⚠ Một phần vẫn là bản thảo

Số liệu trong `samples.ts` **không còn 100% tự dựng** như trước. Từ đợt "Nạp số liệu cơ bản THẬT
từ API Finbox_v2" (xem `TASK.md`):

- **Fundamentals** (EPS, giá trị sổ sách, số CP lưu hành, lợi nhuận ròng, cổ tức) của 4 mã đọc
  thật từ `LIVE_FUNDAMENTALS` — giả định A1 của SRS nay đã đúng một phần.
- **Chuỗi giá** (`bars` từng mã, và `VN_INDEX_BARS`) **vẫn PRNG bịa**, và bị chặn cứng: API
  Finbox_v2 xác nhận tối đa chỉ 10-21 phiên/mã, không đủ cho SMA/RSI/Bollinger/MACD hay hồi quy
  Beta (cần ~248 phiên). Rủi ro R-01 của SRS vẫn còn mở ở phần này.
- `equity` (vốn chủ sở hữu) vẫn SUY RA bằng `bookValuePerShare × sharesOutstanding` — Finbox_v2
  không trả field vốn chủ sở hữu tuyệt đối.

Mọi `Preset` vẫn mang `isDraft: true`, và `PresetSheet` vẫn cảnh báo cho người dùng thấy điều đó —
**đừng gỡ nhãn ấy chừng nào chuỗi giá còn là số bịa**. Chi tiết đầy đủ nằm ở docblock đầu
`samples.ts`.

## Cách đã lấy số liệu thật — generator lúc build, không phải `DataProvider` thứ hai

Vì sản phẩm là static export (không backend, không gọi API lúc runtime), cách đã chọn cho phần
fundamentals **không** phải viết thêm một cài đặt khác của `DataProvider` — `createStaticProvider()`
vẫn là cài đặt duy nhất, và interface `DataProvider` vẫn hoàn toàn đồng bộ. Thay vào đó,
`scripts/gen-live-fundamentals.mjs` chạy TAY lúc cần (`npm run gen:live-fundamentals`, cần mạng),
gọi API Finbox_v2 rồi ghi kết quả ra `live-fundamentals.generated.ts`; `samples.ts` import file đó
như một hằng số tĩnh bình thường. Muốn thêm mã hoặc làm mới số liệu thì chạy lại script đó, không
sửa `provider.ts`.

Nếu sau này có nguồn chuỗi giá đủ dài (điều kiện đang chặn ở trên), cách tự nhiên nhất là mở rộng
đúng generator này — thêm trường `bars` vào file `.generated.ts` — chứ không phải đổi kiến trúc
`DataProvider` sang bất đồng bộ; site tĩnh không có chỗ để một `DataProvider` runtime chạy.

## Vì sao chuỗi giá sinh bằng hạt giống cố định

Bản build là HTML tĩnh, nên số liệu phải giống hệt nhau giữa lúc build và lúc chạy — dùng
`Math.random()` sẽ lệch hydration. Cùng lý do với việc `resolveConstant()` bắt buộc nhận `asOf`
thay vì tự lấy ngày hệ thống (NFR-REL-03).

## Ràng buộc

Không được import React hay Next, không được gọi lên tầng giao diện. Được phép import `@/core`.
