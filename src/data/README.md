# Tầng DATA

Hai cổng cấp số liệu, phục vụ hai việc khác nhau.

## Cổng 1 — `DataProvider`: bộ số liệu mẫu tĩnh của WF-10

- `types.ts` — `DataProvider`, `Preset`, `DailyBar`, `Fundamentals`. Đây là hợp đồng của FR-17:
  giao diện chỉ biết tới interface, không biết số liệu đến từ file tĩnh hay từ API.
- `provider.ts` — `createStaticProvider()` đọc bộ tĩnh; `SAMPLE_DATA` là bản dùng trong sản phẩm.
- `samples.ts` — bốn mã FPT · HPG · VNM · MWG, mỗi mã 248 phiên giá.
- `live-fundamentals.generated.ts` — số liệu cơ bản THẬT của 4 mã trên, sinh bởi
  `npm run gen:live-fundamentals` (`scripts/gen-live-fundamentals.mjs`, gọi API Finbox_v2 lúc
  build, không phải lúc chạy).

Cổng này **đồng bộ** và ở nguyên như vậy. Nó phục vụ nút "Nạp mẫu" của 111 màn chi tiết công thức.

## Cổng 2 — `MarketFeed`: số liệu thị trường lúc chạy (`finbox/`)

Thêm ở gói "Danh mục dùng số liệu thật". **Bất đồng bộ, có gọi mạng.**

- `finbox/types.ts` — `MarketFeed`, `TickerRef`, `TickerSnapshot`, `MarketFeedError`. Docblock ở
  đó giải thích vì sao đây là cổng RIÊNG chứ không phải `DataProvider` đổi sang Promise.
- `finbox/map.ts` — thuần, không fetch: đổi đơn vị nghìn ₫ → ₫, lợi nhuận TTM 4 quý, lọc mã khỏi
  chỉ số/ngành bằng luật `code !== name`.
- `finbox/client.ts` — hai endpoint của `dcs.finbox.vn`: `GET /bp/codes` (~1.649 mã) và
  `POST /data/symbols` (thị giá + số liệu cơ bản, nhiều mã một lượt).
- `live-preset.ts` — `presetFromSnapshot()` nối cổng 2 về lại kiểu `Preset` của cổng 1, để
  `presetInputs()` dùng chung cho cả hai nguồn.

⚠ **Đây là chỗ duy nhất trong sản phẩm gọi ra ngoài máy người dùng.** `public/_headers` mở đúng
một origin trong `connect-src`. Chỉ MÃ cổ phiếu được gửi đi; số lượng nắm giữ và giá vốn thì không.
Ai thêm lời gọi mới ở đây phải giữ đúng ranh giới ấy.

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

## Vì sao BỘ MẪU lấy số lúc build, còn DANH MỤC lấy số lúc chạy

Hai cách, và mỗi cách đúng cho việc của nó.

**Bộ mẫu WF-10 lấy lúc build.** `scripts/gen-live-fundamentals.mjs` chạy TAY khi cần
(`npm run gen:live-fundamentals`, cần mạng), gọi API rồi ghi ra `live-fundamentals.generated.ts`;
`samples.ts` import như một hằng số bình thường. Nhờ vậy 111 trang chi tiết công thức mở được khi
mất mạng, và `createStaticProvider()` vẫn là cài đặt duy nhất của `DataProvider`. Muốn thêm mã
hoặc làm mới số thì chạy lại script, không sửa `provider.ts`.

**Danh mục lấy lúc chạy.** Ở đó không có cách nào khác: người dùng chọn mã bất kỳ trong ~1.649 mã,
và cái họ cần là thị giá của phiên hôm nay — hai thứ không nhét vừa một file sinh lúc build. Nên
mới có cổng thứ hai.

Đường phân chia: **thứ gì giống nhau với mọi người dùng và đổi chậm thì lấy lúc build; thứ gì phụ
thuộc lựa chọn của từng người và đổi theo phiên thì lấy lúc chạy.**

Chuỗi giá dài vẫn kẹt ở cả hai đường: API chỉ có 10–21 phiên, không đủ cho SMA/RSI/Bollinger/MACD
hay hồi quy Beta (cần ~248 phiên). Ngày nào có nguồn đủ dài, cách tự nhiên nhất vẫn là mở rộng
generator lúc build — thêm `bars` vào file `.generated.ts`.

## Vì sao chuỗi giá sinh bằng hạt giống cố định

Bản build là HTML tĩnh, nên số liệu phải giống hệt nhau giữa lúc build và lúc chạy — dùng
`Math.random()` sẽ lệch hydration. Cùng lý do với việc `resolveConstant()` bắt buộc nhận `asOf`
thay vì tự lấy ngày hệ thống (NFR-REL-03).

## Ràng buộc

Không được import React hay Next, không được gọi lên tầng giao diện. Được phép import `@/core`.

`live-preset.ts` có thêm một ràng buộc riêng: **không được import Registry**. Danh sách công thức
mà một mã điền được là dữ liệu ghim sẵn (`LIVE_PRESET_FORMULAS`) chứ không phải phép tính lúc
chạy — tính nó cần `spec.variables` của cả 111 công thức, tức kéo cả Registry vào gói của trang
`/danh-muc/` (đo ở màn khác: 131 kB → 217 kB, trong khi cửa kiểm là 180 kB).
`live-preset.test.ts` tính lại từ Registry thật và so từng dòng, nên bản ghim không trôi được.
