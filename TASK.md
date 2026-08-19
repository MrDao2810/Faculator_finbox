# TASK — Nền tảng kỹ thuật & khung điều hướng

Theo dõi tiến độ theo bảng Estimate WBS v7. Mỗi đợt một mục.

| Gói   | Nội dung                                                | Giờ WBS | Trạng thái                                    |
| ----- | ------------------------------------------------------- | ------- | --------------------------------------------- |
| 1.1.1 | Repo + toolchain                                        | 3h00    | Xong (từ trước)                               |
| 1.1.2 | CI/CD + hosting tĩnh                                    | 3h30    | Xong (từ trước)                               |
| 1.2.1 | Design token & primitive                                | 10h00   | Xong — đợt 1                                  |
| 1.3.1 | FormulaRegistry: schema, bộ sinh, validator             | 7h00    | Xong — đợt 1                                  |
| 1.3.2 | MarketConfig thuế & phí                                 | 3h30    | Code xong — **số liệu chờ người đối chiếu**   |
| 1.3.3 | Chuẩn CalcOutput & hệ cảnh báo                          | 4h00    | Xong — đợt 1                                  |
| 1.4.1 | Routing, URL state & khung i18n                         | 5h30    | Xong — đợt 2, **trừ route động**              |
| 1.4.2 | App shell & layout                                      | 2h00    | Xong — đợt 2                                  |
| 2.1.1 | AppHeader · OfflineBanner · ModeToggle · LangSwitch     | 10h00   | Xong — đợt 2                                  |
| 2.1.2 | BottomTabBar                                            | 2h30    | Xong — đợt 2                                  |
| 2.1.3 | DisclaimerBar                                           | 2h00    | Xong — đợt 2                                  |
| 2.2.1 | SearchBox bỏ dấu                                        | 5h00    | Xong — đợt 3                                  |
| 2.2.2 | CategoryFilter                                          | 3h30    | Xong — đợt 3                                  |
| 2.2.3 | FormulaCard                                             | 3h00    | Xong — đợt 3                                  |
| 2.3.1 | NumberInput — 5 trạng thái WF-16                        | 8h00    | Xong — đợt 5                                  |
| 2.3.2 | SliderInput · ButtonGroup · RadioGroup                  | 6h00    | Xong — đợt 5                                  |
| 2.3.3 | SelectInput · Toggle · UnitSwitcher                     | 4h00    | Xong — đợt 5                                  |
| 2.3.4 | LinkedInput                                             | 12h00   | Xong — đợt 5                                  |
| 2.4.1 | ResultBlock                                             | 5h00    | Xong — đợt 5                                  |
| 2.4.2 | ErrorState · InlineWarning                              | 5h00    | Xong — đợt 5                                  |
| 2.4.3 | FormulaLatex (KaTeX)                                    | 3h00    | Xong — xem mục "Ký hiệu toán học"             |
| 2.4.4 | ExplanationAccordion                                    | 3h00    | Xong — đợt 5                                  |
| 2.4.5 | VariableTable · ExampleBlock · SourceBlock              | 4h30    | Xong — đợt 5                                  |
| 2.4.6 | FlowChain                                               | 6h00    | Xong — đợt 5                                  |
| 2.4.7 | StatTile                                                | 2h00    | Xong — đợt 5 (WBS xếp "sau v0.2")             |
| 2.5.1 | PresetSheet                                             | 6h00    | Xong — đợt 6, **số liệu mẫu là bản thảo**     |
| 2.5.2 | PasteImportSheet                                        | 10h00   | Xong — đợt 6                                  |
| 2.5.3 | ExportSheet                                             | 12h00   | Xong — đợt 6                                  |
| 3.1.1 | HomePage — WF-01                                        | 6h00    | Xong — đợt 7                                  |
| 3.1.2 | FormulaListPage — WF-02, có ảo hoá                      | 8h00    | Xong — đợt 7                                  |
| 3.1.3 | SearchPage — WF-09 hai trạng thái                       | 7h00    | Xong — đợt 7                                  |
| 3.2.1 | FormulaDetailBasic — WF-03                              | 7h00    | Xong — đợt 7                                  |
| 3.2.2 | FormulaDetailAdvanced — WF-04                           | 10h00   | Xong — xem mục "Chuỗi định giá chạy thật"     |
| 3.2.3 | FeeTaxCalculator — WF-08                                | 9h00    | Xong — đợt 7                                  |
| 3.2.4 | LoanScheduleScreen — WF-14                              | 8h00    | Xong — đợt 7                                  |
| 5.1.2 | `fees.*` — 8 công thức phí & thuế                       | 11h12   | Xong — đợt 7 (kéo về sớm)                     |
| 5.1.3 | `returns.*` — 4 / 13 công thức                          | ~3h30   | Một phần — đợt 7                              |
| 5.1.4 | `personal.*` — 6 / 8 công thức                          | ~6h00   | Gần xong — đợt 7                              |
| 5.2.2 | `valuation.multiples.*` — P/E, P/B                      | ~2h00   | Một phần — đợt 7 (kéo về sớm)                 |
| —     | Dựng lại WF-01 theo bản thiết kế hi-fi                  | —       | Xong — đợt 8 (chủ dự án yêu cầu)              |
| 3.3.1 | DataTableScreen — WF-05 bảng chuỗi giá OHLCV            | ~8h     | Xong — đợt 9                                  |
| 3.4.1 | PortfolioScreen — WF-06 danh mục cá nhân                | ~8h     | Xong — đợt 9                                  |
| —     | Dựng lại WF-08 và WF-14 theo bản thiết kế hi-fi         | —       | Xong — đợt 10 (chủ dự án yêu cầu)             |
| —     | Tìm kiếm & lọc tại chỗ ở trang chủ                      | —       | Xong — đợt 11a (chủ dự án yêu cầu)            |
| —     | Dựng lại ba bottom sheet theo hi-fi                     | —       | Xong — đợt 12 (chủ dự án yêu cầu)             |
| 3.1.3 | SearchPage — thêm tô sáng khớp + Danh mục hot           | —       | Xong — đợt 12                                 |
| 3.6.1 | SettingsScreen — WF-13                                  | ~6h     | Xong — đợt 12                                 |
| 3.6.2 | PWA — manifest + service worker                         | ~4h     | Xong — đợt 12, **biểu tượng PNG còn thiếu**   |
| —     | Ô tìm không rơi ký tự khi gõ nhanh                      | —       | Xong — đợt 13                                 |
| —     | Dọn khoá i18n mồ côi + ca kiểm chặn tái phát            | —       | Xong — đợt 13                                 |
| —     | Tách chỉ mục nhẹ khỏi Registry (NFR-PER-04)             | —       | Xong — đợt 13                                 |
| —     | Dọn chất lượng phát hành sau kiểm kê                    | —       | Xong — đợt 14                                 |
| 3.1.2 | /cong-thuc/ có HTML tĩnh thật cho Google                | —       | Xong — đợt 14                                 |
| —     | Sửa lỗi không bấm chuyển tab được (chỉ lúc dev)         | —       | Xong — xem mục ngay dưới                      |
| 5.x   | Nối nốt 34 công thức chuỗi giá — **đủ 107/107**         | —       | Xong — xem mục "Đủ 107 công thức"             |
| —     | Cửa gác chặn build khi dev server đang chạy             | —       | Xong — xem mục "lỗi khi click vào xem…"       |
| 2.1.x | Nút quay lại cho ba màn trong (WF-03/05/09)             | —       | Xong — xem mục "Thêm đường ra khỏi màn…"      |
| —     | Nút Cơ bản / Nâng cao lọc danh sách (FR-09 vế 2)        | —       | Xong — xem mục "Nút Nâng cao không đổi gì"    |
| —     | Vẽ lại biểu tượng theo ảnh chủ dự án + dải màu          | —       | Xong — xem mục "Biểu tượng mới"               |
| 4.0   | Dọn nền cho biểu đồ — sửa 3 bug, đo chunk nạp trễ       | ~5h     | Xong — xem mục "Đợt 0 của biểu đồ"            |
| 4.1   | Đường quét độ nhạy cho nhóm Cơ bản — 50 công thức       | ~18h    | Xong — xem mục "Đợt 1 của biểu đồ"            |
| 4.2   | Trục thời gian + nối dây bộ số liệu mẫu vào ô nhập      | ~14h    | Xong — xem mục "Đợt 2 của biểu đồ"            |
| 2.3.2 | Thanh trượt gõ được số cụ thể + ví dụ đưa số lên ô      | ~6h     | Xong — xem mục "Cho gõ số cụ thể vào ô"       |
| 4.3   | Mở biểu đồ cho 47 công thức còn lại — **phủ 97/107**    | ~4h     | Xong — xem mục "Đợt 3 của biểu đồ"            |
| 2.4.4 | Khối Giải thích luôn mở sẵn khi vào màn chi tiết        | —       | Xong — xem mục "Khối Giải thích… luôn mở sẵn" |
| 4.4   | Nút phóng to biểu đồ toàn màn hình + xoay ngang         | ~5h     | Xong — xem mục "Phóng to biểu đồ"             |
| —     | Sửa tên sản phẩm "Falculator" → "Faculator"             | —       | Xong — xem mục "Sửa tên sản phẩm"             |
| —     | Vá lệch hydration `useId()` ở cây biểu đồ               | —       | Xong — xem mục "Đợt đóng đuôi"                |
| —     | Vá nút Back Android xoá trang khi phóng to biểu đồ      | —       | Xong — xem mục "Đợt đóng đuôi"                |
| —     | Đồng bộ lại CLAUDE.md / README / TASK.md với code       | —       | Xong — xem mục "Đợt đóng đuôi"                |
| 2.4.3 | Ký hiệu toán học — KaTeX dựng lúc build                 | 3h00    | Xong — xem mục "Ký hiệu toán học"             |
| —     | Kết quả đổi theo từng phím gõ + gõ không còn khựng      | —       | Xong — xem mục "Gõ tới đâu, kết quả tới đó"   |
| —     | Kiểm tra lỗi toàn dự án + dọn ba điểm sửa nhanh         | —       | Xong — xem mục "Kiểm tra lỗi"                 |
| 5.2.3 | Chuỗi định giá — FR-15 chạy thật                        | 22h30   | Một phần — xem mục "Chuỗi định giá chạy thật" |
| 5.2.3 | Mắt xích DCF khép nhánh FCFF — **107 → 108**            | ~6h     | Xong — xem mục "Đợt 2"                        |
| 4.x   | Renderer thác nước bóc tách, chứng minh bằng `ev`       | ~10h    | Xong — xem mục "Đợt 2"                        |
| —     | Kế hoạch 3 đợt gỡ 4 nhóm vấn đề + đợt 1 (đo + 3 vá)     | —       | Xong — xem mục "Đợt 1 của kế hoạch"           |
| 4.x   | Bóc tách ba công thức vay — né bẫy `lich-tra-no`        | ~5h     | Xong — xem mục "Đợt 3"                        |
| —     | Bộ kiểm Chrome thật qua CDP — `npm run check:chrome`    | ~4h     | Xong — xem mục "Đợt 3"                        |
| 4.x   | Khai chặng bóc tách nốt 6 công thức — đủ 10/10          | ~4h     | Xong — xem mục "Đợt 4"                        |
| —     | Rà 432 đoạn diễn giải + cửa gác nội dung đầu tiên       | ~3h     | Xong — xem mục "Đợt 5"                        |
| 5.1.1 | Hồ sơ đối chiếu 7 hằng số thuế/phí — duyệt và đã áp     | ~3h     | Xong — xem mục "Đợt 6"                        |
| 3.6.3 | Từ điển tiếng Anh cho giao diện — 231/232 khoá          | ~4h     | Một phần — xem mục "Đợt 7"                    |
| 3.6.3 | Luồng locale + gắn lại LangSwitch — FR-21 chạy thật     | ~6h     | Xong — xem mục "Đợt 8"                        |
| —     | Rà đa-agent phần chưa commit + vá 12 lỗi tìm ra         | ~5h     | Xong — xem mục "Đợt 9"                        |
| 5.1.1 | **Đóng gói** — gỡ nhãn BẢN THẢO sau khi rà bản gốc      | —       | Xong — xem mục "Đợt 10"                       |
| —     | Duyệt chuyên môn bằng máy — 432 đoạn, 5 lỗi tìm ra      | ~6h     | Xong — xem mục "Đợt 11" và "Vá 5 câu chữ…"    |
| —     | Bày hằng số MarketConfig trên màn chi tiết + cửa gác    | ~4h     | Xong — xem mục "Đợt 11"                       |
| —     | Vá tràn ngang 360px — chuỗi WF-04, bảng biểu đồ         | —       | Xong — xem mục "Vá tràn ngang 360px"          |
| —     | Vá 5 câu chữ diễn giải sai + nâng vitest vá lỗ critical | —       | Xong — xem mục "Vá 5 câu chữ…"                |
| —     | Giá mục tiêu (109) + Beta (110) + XIRR (111)            | —       | Xong — xem mục "Ba công thức cố ý…"           |

Cộng dồn: **~302 giờ** trên tổng 623 giờ của bảng Estimate (148,5 + 45 nhánh 3 + ~24,2 phần nhánh 5
kéo về sớm + 10 nhánh 3.6 + 4 đợt 13, cộng 10 giờ gói 3.2.2, ~11 giờ phần đã làm của gói 5.2.3,
~5 giờ đợt 1 của kế hoạch, ~10 giờ hai phần đã làm của gói 3.6.3, ~5 giờ đợt rà 9 và ~10 giờ
đợt 11).
**Nhánh 3.1 và 3.2 xong trọn** — 3.2.2 là gói cuối cùng của nhánh 3.2, nay đã đóng.
Nhánh 3.6 xong 3.6.1 và 3.6.2.

---

## Ba công thức cố ý chưa đăng ký — 3/3 xong

Trạng thái: **xong cả ba, đã kiểm đủ năm cửa**. `npm run check` xanh **1352 test / 61 file**;
build 122 trang; `verify:static` **24/24** (111/111 link công thức); `check:chrome` **20/20**;
`size` **164,5 kB** trên cửa 170 kB (Giá mục tiêu + Beta tốn 0,2 kB; XIRR — cả một màn WF-05 —
tốn thêm 1,3 kB). Dev server đang chạy thêm xác nhận trực tiếp cả ba trang: `gia-muc-tieu` và
`beta` tính đúng như đợt trước; `xirr` — nhập tay hai dòng tiền (−100 triệu ₫ ngày 1, +110 triệu
₫ đúng một năm sau) ra đúng **10 %/năm**, khớp tay tính lẫn `spec.tests`. Không trang nào lỗi
console (ngoài một lượt cảnh báo module HMR thoáng qua lúc đang sửa file, tự hết khi tải lại).

### Yêu cầu

> "đưa ra những cách xử lý để tôi lựa chọn" → chọn cả 3 (kèm câu hỏi "giải thích Beta là gì,
> cần thiết vì sao trước") → sau khi giải thích, "bắt đầu hoàn thiện lần lượt từng công thức" →
> sau khi xong Giá mục tiêu và Beta, hỏi lại vì XIRR khác loại (cần dựng cả màn WF-05) →
> "Tiếp tục dựng màn WF-05 ngay".

### Giá mục tiêu (109) — độc lập, không cần dữ liệu mới

`src/core/formulas/valuation-multiples.ts` thêm công thức thứ 10 của nhóm bội số:
Giá mục tiêu = P/E mục tiêu × EPS. Cố ý **không** khai `dependsOn` từ `pe` — P/E hiện tại khác
hẳn P/E mục tiêu, nối chúng là dạy sai người dùng rằng hai con số đó là một (đã ghi lý do ngay
trong code). `categories.ts`: Định giá 19 → 20 (108 → 109).

### Beta (110) — hồi quy cần chuỗi VN-Index, nay đã có

**Việc chính không phải "thêm một công thức" mà là "cho `CalcContext` mang được HAI chuỗi giá
cùng lúc"** — mọi công thức chuỗi giá khác trong Registry chỉ đọc một mình `ctx.series` của mã
đang xem; Beta cần thêm chuỗi VN-Index để hồi quy vào.

- **`calc/types.ts`** — thêm `CalcContext.marketSeries?: ReadonlyArray<number>`.
- **`registry/types.ts`** — thêm `marketSeries?` vào cả `FormulaExample` và `FormulaTestCase`,
  để `spec.tests`/`example` bơm được chuỗi thứ hai riêng cho từng ca — không thì không cách nào
  viết ca kiểm cho một công thức cần hai chuỗi.
- **`calc/run-tests.ts`**, **`formulas/formulas.test.ts`** — hai nơi build `ctx` cho ca kiểm và
  cho ví dụ trên màn đều phải bơm thêm `marketSeries`, cùng luật với `series`/`bars` đã có.
- **`formulas/series-utils.ts`** — `usableMarketCloses()`/`requireMarketCloses()`, sinh đôi với
  `usableCloses()`/`requireCloses()` đã có nhưng đọc `ctx.marketSeries` thay vì `ctx.series`.
- **`data/types.ts`**, **`data/provider.ts`**, **`data/samples.ts`** — `DataProvider.vnIndex()`
  (đúng chữ FR-17 đã viết sẵn: "gắn được mã cổ phiếu và chỉ số VN-Index thật qua DataProvider").
  `VN_INDEX_BARS` dựng bằng đúng `makeBars()` sẵn có, seed `'VNINDEX'` — không phải một `Preset`,
  không đi qua PresetSheet, chỉ nạp thẳng vào `ctx.marketSeries`.
- **`FormulaDetail.tsx`** — `ctx.marketSeries` lấy từ `SAMPLE_DATA.vnIndex()`, tính MỘT LẦN
  ngoài component (giống `ALL_SPECS`) và **luôn có mặt**, không phụ thuộc người dùng đã dán
  chuỗi giá của mã hay chưa — khác `series`/`bars` vốn theo trạng thái người dùng.
- **`risk-ratios.ts`** — công thức `BETA`, đặt cạnh Treynor (cùng `MIN_SESSIONS = 60`, đúng mức
  mà comment `WarningCode.MISSING_SERIES` trong `core/types.ts` đã dự sẵn từ trước: "Beta khi
  chưa đủ 60 phiên giá"). `chartType: 'scatter'` — theo đúng tiền lệ `ty-so-treynor` (type này
  đã dành sẵn cho "hồi quy Beta" nhưng `build.ts` chưa có nhánh render riêng, rơi về cùng đường
  sensitivity sweep như mọi loại khác trừ `waterfall`/`none`).

**Hạn chế đã biết, cố ý chưa vá**: bộ mẫu (`VN_INDEX_BARS` + 4 mã cổ phiếu) là năm chuỗi PRNG
ĐỘC LẬP, không có nhân tố thị trường chung — đo thật trên FPT ra **Beta 0,11**, đúng về toán
nhưng không minh hoạ được một cổ phiếu thật biến động ra sao. `spec.tests` không dựa vào bộ mẫu
này: dùng `betaScaledCloses()` dựng cổ phiếu NGƯỢC từ lợi suất thị trường nhân hệ số, cho beta
lý thuyết đúng bằng hệ số đó (đại số, không xấp xỉ) — kiểm được 1,5 · 1 · −0,5 mà không cần bịa
số liệu tương quan thật.

Cập nhật hai chỗ đã từng cố ý tránh nhắc "công thức Beta" vì nó chưa tồn tại — `ty-so-treynor`
(`risk-ratios.ts`) và `capm` (`valuation-dcf.ts`): nay nêu lại làm một nguồn thật cho ô beta
nhập tay. `categories.ts`: Rủi ro 17 → 18 (109 → 110), gỡ comment "KHÔNG kể Beta".

### XIRR (111) — công thức duy nhất đọc một BẢNG thay vì `spec.variables`

Việc lớn nhất trong ba, và khác loại chứ không chỉ khác độ khó: dòng tiền có ngày là một danh
sách độ dài tuỳ ý, mà `VariableSpec` chỉ biểu diễn được từng Ô một. `xirr()` (hàm thuần, đã có
sẵn từ trước kèm 7 ca kiểm độc lập) không đổi — thứ mới là đường dẫn dữ liệu tới nó.

**Domain — `CalcContext.cashflows`, sinh đôi với `marketSeries` của Beta:**

- **`src/core/cashflow-series.ts`** (mới) — `Cashflow` (ngày + số tiền, cả hai bắt buộc, dùng
  cho `ctx.cashflows`) và `CashflowRow` (số tiền `number | null`, dùng cho bảng đang sửa tay),
  cùng `checkCashflowRow()`/`checkCashflowSeries()`/`cashflowsOf()` — sinh đôi có chủ đích với
  `checkRow()`/`checkSeries()`/`closesOf()` của `price-series.ts` (màn WF-05 gốc, dựng cho chuỗi
  giá OHLCV). Đặt `Cashflow` ở đây — không ở `calc/types.ts` hay `registry/types.ts` — vì cả hai
  file đó đều cần import nó và `calc/types.ts` đã import ngược từ `registry/types.ts`; đặt vào
  một trong hai bên sẽ vòng lặp.
- **`calc/types.ts`** — `CalcContext.cashflows?: ReadonlyArray<Cashflow>`.
- **`registry/types.ts`** — `cashflows?` thêm vào `FormulaExample`/`FormulaTestCase`, và
  **`calc/run-tests.ts`**/**`formulas/formulas.test.ts`** bơm nó vào ctx — cùng bài Beta đã làm
  cho `marketSeries`, lặp lại lần thứ hai nên đúng là lúc nhận ra khuôn: mỗi "chuỗi dữ liệu thứ
  hai" mới cần đúng bốn chỗ sửa này.
- **`formulas/returns.ts`** — `XIRR` (`chartType: 'none'`: biến duy nhất sweep được là điểm xuất
  phát Newton-Raphson, không phải tham số tài chính, quét nó không nói lên điều gì). Cảnh báo
  "chưa đủ dòng tiền" dùng **`INCOMPLETE_INPUT`, không phải `MISSING_SERIES`** — dù nghĩa gần
  hơn, `MISSING_SERIES` sẽ khiến `needsPriceSeries()` xếp nhầm XIRR vào nhóm cần nút "Dán chuỗi
  giá" (dò bằng đúng mã cảnh báo đó). `categories.ts`: Lợi nhuận & cổ tức 13 → 14 (110 → 111).

**Giao diện — thân riêng, nhưng state KHÔNG sống trong thân riêng:**

`XirrBody.tsx` (thân riêng, nạp trễ như `FeeTaxBody`/`LoanScheduleBody`) hiện bảng dòng tiền sửa
tay (thêm/xoá dòng, báo lỗi từng dòng) rồi `ResultBlock` ngay dưới. Điểm khác biệt với hai thân
riêng kia: bảng dòng tiền **sống ở `FormulaDetail.tsx`** (`useState<CashflowRow[]>`, mặc định
hai dòng trống), không sống trong `XirrBody`. Lý do là bất biến "hai chỗ nói hai chuyện là lỗi
nặng" mà dự án đã né ở `historyPoints`/`ResultBlock`: dòng chữ ẩn `data-testid="result-text"`
dưới khối Kết quả (chỗ bộ kiểm tự động đọc) tính từ `ctx` của `FormulaDetail`, không phải từ
state con — để state ở `XirrBody` thì dòng chữ ẩn đó vĩnh viễn báo "chưa nhập đủ" bất kể người
dùng đã điền gì, một con số một nơi nhưng lại có hai nguồn. `DetailBodyProps` thêm ba prop tuỳ
chọn (`output`, `cashflowRows`, `onCashflowRowsChange`) mà `FeeTaxBody`/`LoanScheduleBody` bỏ
qua, `XirrBody` dùng cả ba — `output` truyền thẳng chứ không tính lại, cùng lý do trên.

Đã kiểm bằng Chrome thật, không phải chỉ đọc code: nhập `-100.000.000 ₫` ngày 01/01/2025 và
`+110.000.000 ₫` ngày 01/01/2026 vào bảng, kết quả ra đúng **10 %/năm** — khớp cả tính tay
(NPV = 0 tại r = 10%) lẫn `spec.tests`.

**Cần hai từ điển i18n mới** (`xirr.*`, 8 khoá) vì `XirrBody.tsx` là component máy khách — luật
"client component đi qua `useT()`" của gói 3.6.3 áp dụng, không có miễn trừ nào cho thân riêng.

### Dọn theo sau — số đếm rải khắp bộ kiểm

Đúng kiểu domino đã gặp ở đợt nâng trần trước, và lặp lại HAI LẦN trong đợt này (Beta rồi XIRR):
mỗi công thức mới kéo theo một loạt số cứng phải sửa. Beta đẩy nhóm "công thức ăn chuỗi" 34 → 35;
XIRR ban đầu tưởng cũng cộng vào nhóm đó (vì dùng `MISSING_SERIES`) nhưng sau khi đổi sang
`INCOMPLETE_INPUT` thì tách khỏi nhóm chuỗi giá — kéo theo phải sửa lại hai ca kiểm ở
`FormulaDetail.test.tsx` vốn giả định "chỉ nhóm Rủi ro và Kỹ thuật mới chờ dữ liệu" (nay `xirr`
là ngoại lệ duy nhất, đứng ở nhóm Lợi nhuận & cổ tức). `chart/history.test.ts` cần thêm một
chuỗi VN-Index tự dựng riêng (không import `@/data`, đúng luật CON-02 của chính file đó) vào
context `WITH_BARS` — thiếu nó Beta báo `unavailable` ở MỌI mức trong ca quét toàn Registry.
`prose-audit.test.ts`: danh sách `CHUA_CO` tự hết hạn đúng như thiết kế — `'Beta'` bị ca kiểm tự
đỏ lên nhắc xoá, nay rỗng.

### Việc còn lại

- [ ] Cân nhắc thêm cạnh `dependsOn` từ `beta` sang `capm`/`ty-so-treynor` để ô beta tự điền —
      **cố ý chưa làm**: đó là quyết định giao diện (LinkedInput hay vẫn để nhập tay khi người
      dùng có beta từ nguồn khác), ngoài phạm vi "đăng ký công thức" của đợt này.
- [ ] Bảng dòng tiền của XIRR chỉ nhập tay từng dòng — **cố ý chưa làm** lối dán từ Excel như
      WF-05: `parsePaste()` hiện chỉ hiểu cột giá đóng cửa (bắt buộc dương), không hợp với dòng
      tiền (có thể âm). Cỡ dòng tiền thường vài dòng, không phải hàng trăm phiên, nên chưa cấp
      thiết — để khi có yêu cầu thật mới dựng bộ phân tích riêng.

---

## Vá 5 câu chữ diễn giải sai + nâng vitest vá lỗ critical

Trạng thái: **xong, đã kiểm đủ**. `npm run check` xanh **1347 test / 61 file**, lint sạch,
format sạch, typecheck sạch.

### Yêu cầu

> "đưa ra những cách xử lý để tôi lựa chọn và bạn làm theo" → chọn "áp thẳng bản sửa hợp lý nhất,
> không cần duyệt từng câu" cho 5 câu chữ, và "chỉ nâng vitest 3.0.5 → 3.2.6+" cho lỗ hổng bảo mật.

### 5 câu chữ diễn giải sai (Đợt 11) — đã áp, không còn chờ duyệt riêng

Dò lại đúng field, đúng dòng bằng agent đọc trước khi sửa, để bản sửa bám sát `calc`/`spec.tests`
thay vì đoán:

- **`basis-vn30f`** — `meaning` bỏ khung "thước đo tâm lý thị trường" (basis chủ yếu là chênh
  lệch giá, không phải tâm lý); `howToRead` viết lại để không còn tự mâu thuẫn với `commonMistakes`
  (vốn đã đúng: một phần basis dương là chi phí nắm giữ hợp lý) — nay `howToRead` dẫn người đọc
  sang đúng ý đó thay vì dạy thẳng "basis dương = kỳ vọng tăng".
- **`don-bay-hieu-dung`** — `commonMistakes` sửa "đó chỉ là mức lúc vào lệnh" thành đúng bản chất:
  nghịch đảo tỷ lệ ký quỹ là mức **TRẦN** khi chỉ nộp đúng ký quỹ tối thiểu; nộp dày hơn thì đòn
  bẩy thực đã thấp hơn ngay từ lúc vào lệnh.
- **`irr-nien-kim`** — `whenToUse` bỏ "mua trái phiếu coupon đều" (model không có ô nhập mệnh giá
  hoàn kỳ cuối, `calc` chỉ có 2 số hạng `payment` và `investment`), thêm câu chặn rõ trái phiếu
  coupon không tính đúng bằng công thức này.
- **`ty-so-calmar`** — `commonMistakes` sửa mô tả cơ chế: `calc` trả `DIVIDE_BY_ZERO` khi mẫu số
  đúng bằng 0 (chuỗi tăng đều tuyệt đối), không âm thầm "vọt lên vài chục lần" như câu cũ nói.
  Con số phóng đại thật (16,7 lần ở `spec.tests`) đến từ mẫu số NHỎ chứ không phải BẰNG 0.
- **`do-lech-chuan-ban-phan`** — `howToRead` bỏ khẳng định vô điều kiện "luôn ≤ độ lệch chuẩn đầy
  đủ": đúng với ngưỡng mặc định 0%, nhưng `variables.threshold` cho nhập tới 5% và ở ngưỡng cao
  kết quả vượt qua độ lệch chuẩn đầy đủ (mẫu số đo khoảng cách tới ngưỡng, không phải tới trung
  bình) — đúng như dữ liệu tăng dần ở `spec.tests` (0,67% → 1,40%, tiệm cận mức đầy đủ 1,42%).

Chỉ sửa `src/core/formulas/{derivatives,performance,risk-ratios,risk-volatility}.ts` — không đụng
`summaries.generated.ts` vì field lỗi nằm ở `explanation`, không ở `description` (không cần chạy
lại `gen:summaries`). `prose-audit.test.ts` và `formulas.test.ts` chạy lại đều xanh.

### Nâng vitest 3.0.5 → 3.2.7 — vá lỗ hổng critical

`npm audit` phát hiện lỗ **critical** trong vitest <3.2.6 (đọc/thực thi file tuỳ ý khi Vitest UI
server đang lắng nghe). `package.json` pin cứng version nên `npm install` thường không tự nâng.
Đổi sang bản 3.x mới nhất còn được duy trì (3.2.7, không nhảy sang 4/5 để tránh breaking change),
`npm install vitest@3.2.7 --save-exact`, rồi kiểm lại toàn bộ: typecheck sạch, `npm test` vẫn
**1347/1347**, lint sạch, format sạch. `npm audit` còn **6 lỗ** (2 moderate, 4 high) ở
postcss/sharp/yaml — cả ba chỉ hết khi nâng `next` lên major 16, **cố ý chưa làm** vì đó là
breaking change thật sự, chờ quyết định riêng.

### Việc còn lại

Không còn việc nào của riêng đợt này.

---

## Vá tràn ngang 360px — chuỗi WF-04, bảng biểu đồ, thanh trượt

Trạng thái: **xong, đã kiểm đủ năm cửa**. Code cho đợt này đã nằm sẵn trong working tree khi
phiên này bắt đầu — chưa commit, chưa có mục nhật ký — nên việc của phiên là đọc lại diff, dựng
bản build thật để xác nhận, và ghi lại ở đây; không viết thêm dòng sửa lỗi nào mới.

`npm run check` xanh **1347 test / 61 file** (không đổi so với Đợt 11 — đây là đợt sửa hình học
thuần, jsdom không đo được nên không ca vitest nào bắt được các lỗi này). `npm run build` (dựng
ở bản sao scratchpad, không đụng dev server chủ dự án đang chạy ở cổng 3000) ra đủ 119 trang;
`verify:static` **24/24**; `check:chrome` **20/20** — nâng từ 18 vì chính đợt này thêm hai ca; `size`
**163,0 kB** trên cửa 170 kB.

### Ba lỗi tràn ngang, đều lộ ra ở khổ 360px

1. **Khối chuỗi WF-04 — thanh trượt rơi vào lưới 143px.** Danh sách "điều khiển chiếm trọn hàng"
   (`slider`, `buttonGroup`, `radio`, `toggle`) từng chỉ khai ở `FormulaDetail.tsx`
   (`WIDE_CONTROLS`); `ChainBody.tsx` — thân khối chuỗi, dựng sau — không biết luật này nên luôn ép
   `styles.field` (nửa lưới). Hậu quả: năm thanh trượt của chuỗi WACC bị nhét vào ô 143px, đẩy
   trang cuộn ngang. Vá bằng cách tách `isWideControl()` dùng chung trong `@/ui/inputs`, cả
   `FormulaDetail.tsx` lẫn `ChainBody.tsx` cùng gọi một hàm.
2. **`FlowChainStrip` rò bề rộng nội tại.** Dải bước cuộn ngang trong khung riêng
   (`overflow-x: auto`) đúng NFR-USA-02, nhưng thiếu `contain: layout inline-size` thì bề rộng
   NỘI TẠI của dải vẫn định lại khung nhìn của Chrome di động — đo trên bản build, chuỗi bốn bước
   của `gia-tri-noi-tai-fcff` dài 944px kéo khung nhìn 360 thành 495. Cùng bẫy đã trả giá một lần ở
   `primitives/Table.module.css`, nay áp lại đúng chỗ.
3. **Bảng số liệu trong `ChartFrame` không có vùng cuộn riêng.** Ô bảng `white-space: nowrap` nên
   `width: 100%` không giữ nổi — bề rộng nội tại thắng. Tiêu đề cột dài của
   `gia-tri-noi-tai-fcff` ("Giá trị nội tại từ FCFF (DCF) (₫)") làm bảng rộng 385px trong cột
   344px. Vá bằng `.tableScroll` mới (`overflow-x: auto` + `contain: layout inline-size`, cùng
   công thức với hai chỗ trên), không dùng thẳng primitive `Table` vì bảng này đã nằm trong một
   `<details>` có khung riêng.

Kèm hai vá nhỏ cùng nhóm: `InlineNumber.module.css` thêm `min-width: 0; max-width: 100%` để ô
14ch co lại thay vì lọt ra ngoài khung hẹp; `SliderInput.module.css` thêm `flex-wrap` cho hàng
nhãn + ô giá trị để hai thứ không đè lên cột bên cạnh khi nhãn dài.

### Cửa gác `check:chrome` cũ bị mù đúng chỗ cần thấy nhất

Ca "khối chuỗi không đẩy trang tràn ngang" đã có từ trước nhưng đo `block.scrollWidth` — mà khối
chuỗi là hộp `overflow: visible`, nên `scrollWidth` của nó luôn bằng đúng bề rộng được cấp (328)
dù con bên trong vẽ tràn ra ngoài. Ca này báo "vừa khung" trong khi trang thật cuộn ngang tới
495px — đúng dạng "cửa gác đỗ giả" mà Đợt 9 từng ghi nhận. Sửa bằng cách đo
`document.documentElement.scrollWidth` (chuyện của TRANG) thay vì của khối. Thêm hai ca mới: mở
trang `gia-tri-noi-tai-fcff` (chuỗi dài nhất Registry) kèm bảng số liệu mở, kiểm trang không cuộn
ngang; và đếm nhãn thanh trượt cao quá hai dòng (dấu hiệu bị bóp vào cột hẹp) — bắt được cả khi
bề rộng trang tình cờ vẫn vừa.

### Việc còn lại

Không còn việc nào của riêng đợt này. `FormulaDetail.tsx` cũng mang thay đổi của Đợt 11
(`ConstantsNote`) trong cùng file — hai việc độc lập, chung một file vì cùng chạm khối Số liệu.

---

## Đợt 1 của kế hoạch — số đo nền, và ba vết vá rẻ

Trạng thái: **xong, đã kiểm đủ bốn cửa**. `npm run check` xanh **1273 test / 55 file**;
`npm run build` 118 trang; `npm run verify:static` **24/24** (thêm 2 check); `npm run size`
**155,9 kB** trên cửa kiểm 170 kB.

### Yêu cầu

> "lập kế hoạch và cách để giải quyết các vấn đề trên"

Kế hoạch đầy đủ đã trình và chủ dự án chốt ba điều: **trần công thức nâng 107 → 108** (mở khoá
công thức "Giá trị nội tại từ FCFF" ở đợt 2 — kéo theo sửa bảng SRS mục 3.8 ngoài repo);
**bắt đầu bằng đợt 1** (đo + vá rẻ); **được dừng dev server** (PID 37968, đã xác minh đúng
tiến trình `next start-server` của repo này rồi mới dừng).

### Số đo nền — trả lời rủi ro lớn nhất của kế hoạch

Lo ngại: gói chuỗi đưa `LinkedInput` vào import tĩnh của cả 107 trang, dư địa cửa kiểm chỉ 14 kB.
Đo thật:

| Thứ                              | Kết quả                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Trang nặng nhất                  | **155,9 kB** — dưới cửa 170 kB, ngang mốc cũ 156,0                                                     |
| `ChainBody` (thân khối WF-04)    | chunk **987**, 1,9 kB nén, **0 trang** tham chiếu tĩnh — nạp trễ thuần                                 |
| `LinkedInput` + `FlowChainStrip` | nằm trong chunk chung của 107 trang chi tiết — đúng dự báo, nhưng tổng không tăng nên **không cần gỡ** |

Bẫy đo đã né: chuỗi tiếng Việt trong bundle bị escape unicode tuỳ chỗ, nên truy vết component
phải dò bằng **tên class CSS module** (`stepFailed`, `overriddenTag`) chứ không phải chữ trên
màn. Suýt kết luận nhầm chunk 227 (thực ra chỉ chứa từ điển i18n) là ChainBody.

### Đã đổi file nào — ba vết vá

- **`src/core/chart/sweep.ts`** — lỗi có thật, xác minh bằng chạy: biến `years` của
  `ddm-hai-giai-doan` (bước 1, mặc định 5) cho dải quét 2,5 → 7,5 chia đều thành
  **2,5 · 3,5 · 4,5…** trong khi hàm tính `Math.round` về năm nguyên — sáu trên bảy điểm là bậc
  thang mang nhãn sai. Gốc bệnh ở `sweepDomain()`: chú thích nói "bám bước" nhưng code chỉ giảm
  SỐ điểm, chưa bao giờ bám hai ĐẦU dải vào lưới bước. Nay khi bước chi phối mật độ, hai đầu
  bám lưới `min ?? 0 + k×step` (cùng gốc với `snapToStep()`); số lẻ lấy theo CẢ bước lẫn gốc —
  bản vá đầu chỉ lấy theo bước, `toFixed(1)` cắt 1,75 thành 1,8, chính ca kiểm mới bắt được.
  `lai-kep` cùng biến `years` không dính chỉ vì mặc định 10 cho lo = 5 tròn sẵn. +3 ca kiểm.
- **`src/core/registry/categories.ts`** — mô tả nhóm Rủi ro thôi kể "Beta": công thức đó không
  tồn tại (kẹt dữ liệu VN-Index, gói 3.3.2). Lưu ý đã kiểm: `category.description` hiện chưa
  render ở màn nào — kế hoạch nói "người dùng nhìn thấy" là nói quá — nhưng sửa để ngày nó lên
  màn không mang lời hứa sai.
- **`scripts/verify-static.mjs`** — 22 → **24 check**. Hai check mới gác đúng hai tính chất chỉ
  nhìn thấy trên bản build: (1) khối chuỗi KHÔNG rò vào HTML tĩnh — id `khoi-chuoi` xuất hiện là
  ai đó đổi chế độ mặc định sang Nâng cao hoặc nới điều kiện dựng khối; (2) `ChainBody` nằm trong
  chunk không một file HTML nào của `out/` tham chiếu — ranh giới `next/dynamic` thủng là đỏ ngay.

### Việc còn lại của kế hoạch (đã chốt thứ tự)

1. **Đợt 2** — sửa `runChain` cho hai nhánh cùng đổ một ô (chặn khi MỌI cạnh cùng khoá hỏng,
   không phải cạnh đầu tiên) → công thức `gia-tri-noi-tai-fcff` (18 → 19, 107 → 108, ~10 chỗ số
   ghi cứng, `gen:summaries`) → renderer waterfall chứng minh bằng `ev` (trục Y phải chứa 0,
   nhận `idBase`, vào ca quét id).
2. **Đợt 3** — bộ kiểm Chrome thật (chép harness CDP từ scratchpad về repo trước khi nó mất),
   cột chồng gốc/lãi cho 3 công thức vay, trình bày khối chuỗi theo ảnh WF-04 nếu có ảnh.
3. **Beta**: nằm ngoài cả ba đợt. Chặn bởi gói "ghép hai chuỗi theo ngày" (ngày trong bảng là
   chuỗi thô, dán VN-Index xếp mới-trước là beta ngược dấu không cảnh báo) và bởi bộ mẫu: bốn
   chuỗi PRNG độc lập không có nhân tố thị trường chung — beta tính ra ≈ 0 (FPT 0,039,
   HPG −0,021), sai về bản chất chứ không phải chưa đối chiếu. Bảng tra beta ngành: **bỏ hẳn** —
   `MarketConstant` đòi `legalBasis` mà beta ngành không có cơ sở pháp lý nào.

---

## Đợt 2 — khép nhánh FCFF của chuỗi, và biểu đồ thôi nói điều hiển nhiên

Trạng thái: **xong, đã kiểm đủ bốn cửa**. `npm run check` xanh **1290 test / 55 file** (trước đợt
này 1270); `npm run build` 119 trang; `npm run verify:static` **24/24**; `npm run size`
**156,9 kB** trên cửa kiểm 170 kB.

### Yêu cầu

> "lập kế hoạch và cách để giải quyết các vấn đề trên" → chốt lộ trình ba đợt → "bắt đầu đợt 2 luôn"

Chủ dự án chốt trước khi làm: **nâng trần 107 → 108** (thêm đúng một công thức), và làm đợt 1
trước. Đợt 1 đã xong trọn, kể cả phần đo — sửa trục `years` của ddm, gỡ chữ "Beta" khỏi mô tả nhóm
Rủi ro, thêm 2 check `verify:static` cho khối chuỗi.

### Việc 1 — `runChain()` xử đúng hai nguồn cùng một ô

Lỗi do chính tôi tạo ra ở đợt trước, tự soi ra khi rà lại. Hàm duyệt theo CẠNH nên sai hai chỗ
cùng lúc: chặn ngay ở cạnh hỏng ĐẦU TIÊN dù nguồn kia đang có số dùng được, và để cạnh sau ghi đè
giá trị của cạnh trước mà không ai hay.

Nay gom cạnh theo **biến nhận** (`groupByVariable()`): ô lấy nguồn cấp được số đầu tiên theo thứ
tự khai, và chỉ khi **mọi** nguồn của ô đó hỏng thì bước mới kế thừa lỗi. Registry hôm nay chưa có
ô nào hai nguồn nên lỗi ấy chưa bao giờ chạy — nhưng nó nằm đúng trên đường đi của mắt xích DCF,
nên phải sửa trước. Ba ca kiểm dựng bằng fixture khoá cả hai chiều; chúng đỏ với bản cũ.

### Việc 2 — công thức `gia-tri-noi-tai-fcff`, và 107 → 108

Trước đợt này `wacc`, `fcff`, `fcfe` là ba công thức **không ai tiêu thụ kết quả**. Mắt xích mới
khép nhánh đó lại:

```text
EV = FCFF × (1 + g) ÷ (WACC − g)   → tỷ ₫
Vốn chủ = EV − Nợ vay ròng          → tỷ ₫
Giá trị nội tại = Vốn chủ ÷ Số CP   → ₫/CP, nhân 1.000 vì tỷ chia cho triệu
```

Hệ số 1.000 ấy theo đúng tiền lệ `ncav-tren-co-phieu`. Quên nó là sai ba chữ số mà con số vẫn
trông hợp lý — đúng loại lỗi mà cửa gác đơn vị của đợt trước sinh ra để chặn.

**Cố ý KHÔNG khai cạnh sang `bien-an-toan`** dù đơn vị khớp: ô "Giá trị nội tại ước tính" bên đó
đã nhận từ mô hình Gordon. `runChain()` xử được hai nguồn, nhưng trên màn hình người dùng chỉ thấy
MỘT nhãn nguồn và không có cách nào chọn nguồn kia — tức bày ra một lựa chọn không bấm được. Chọn
mô hình định giá nào là việc của người định giá; tới khi giao diện hỏi được câu đó thì ô kia để
nhập tay.

Số kiểm chứng tính độc lập dạng đóng trước khi viết hàm: 300 × 1,04 ÷ 0,067 = 4.656,7164 tỷ; trừ
300 còn 4.356,7164; chia 118 nhân 1.000 = **36.921,33 ₫**. Bảy ca kiểm trong `spec.tests`.

**Nâng trần**: `valuation` 18 → 19, tổng 107 → 108. Bộ kiểm tự chỉ ra **đúng 7 file** phải sửa,
không phải dò tay: `registry.test.ts` (94→95, 107→108), `chart.test.ts`, `history.test.ts`,
`charts.test.tsx`, `latex-html.test.ts`, `summaries.test.ts` (chạy `gen:summaries`), và
`SettingsScreen.test.tsx` tự xanh lại sau khi sinh lại chỉ mục — màn Cài đặt đếm động nên không
phải sửa.

> **Việc còn nợ ngoài repo: bảng SRS mục 3.8 vẫn ghi 94 / 13 / 107.** Không sửa thì hai tài liệu
> lệch nhau vĩnh viễn. Đã ghi cảnh báo vào `categories.ts` và `CLAUDE.md`.

### Việc 3 — renderer thác nước, chứng minh bằng `ev`

Vấn đề có thật chứ không phải thẩm mỹ: đường quét của `ev` là một **đường thẳng hệ số góc đúng
bằng 1** (EV = vốn hoá + hằng số). Đó chính là loại hình mà dự án viết luật `chartType: 'none'` để
loại — người đọc đoán trước được, vẽ ra không nói gì.

**Chặng khai bằng metadata, không suy từ `extras`.** `extras` là một `Record` không thứ tự, không
dấu, không nhãn — mà thác nước cần đúng ba thứ đó. Thêm `BreakdownStage` vào Registry: `key` (trỏ
vào biến đầu vào HOẶC vào `extras`), `sign`, `shortLabel`. Trường tuỳ chọn nên 107 công thức kia
không đổi gì.

`ev` được chọn làm ca chứng minh vì **ba chặng của nó chính là ba ô nhập** — không sửa một dòng
`calc` nào.

Ba quyết định đáng ghi:

- **Bóc tách là MỘT MỤC trong ô chọn trục**, đứng cạnh "Theo thời gian", không phải màn riêng.
  Nhờ vậy `SweepPicker` và `ChartBody` không phải biết nó tồn tại, và người dùng vẫn đổi sang
  đường quét bằng đúng ô cũ.
- **Cột nằm ngang.** Nhãn chặng tiếng Việt ("Tiền và tương đương tiền") dài gấp ba tới năm lần bề
  ngang một cột đứng trong khung 320 đơn vị. Cột đứng chỉ còn ba lối — xoay 45 độ, cắt cụt, hoặc
  rút gọn tới mất nghĩa — cả ba tệ hơn việc quay cả hình đi 90 độ.
- **Miền trục LUÔN chứa 0.** Chân cột phải có chỗ đứng; bỏ 0 ra ngoài thì cột "Vốn hoá" 9.200 tỷ
  và cột "EV" 11.500 tỷ trông chỉ chênh một mẩu.

`ChartModel` từ union hai nhánh thành ba, và typecheck chỉ thẳng ra **mọi** chỗ giả định chỉ có
hai: `ChartFrame`, `ChartFullscreen`, `ChartBody`, hai file test. Thêm `DrawableChart` (union trừ
`unavailable`) để hai file khung nhận cả hai loại, lần sau thêm loại thứ tư không phải sửa chúng.

### Đã đổi file nào

**Domain**: `calc/run-chain.ts` (gom cạnh theo biến) · `formulas/valuation-dcf.ts` (công thức mới,
file thành 10 công thức) · `formulas/valuation-multiples.ts` (khai `breakdown` cho `ev`) ·
`registry/types.ts` (`BreakdownStage`) · `registry/categories.ts` (18 → 19) · `chart/breakdown.ts`
(mới) · `chart/types.ts` (`WaterfallChart`, `DrawableChart`) · `chart/build.ts`.

**Giao diện**: `charts/WaterfallChart.tsx` (mới) · `charts/chart.module.css` ·
`charts/ChartBody.tsx` · `charts/ChartFrame.tsx` · `charts/ChartFullscreen.tsx`.

**Barrel**: `core/chart/index.ts`, `application/index.ts`.

### Kiểm chứng

**1290 test** (trước đợt 1270), thêm 20 ca:

- 3 ca hai nguồn cùng một ô: nguồn hỏng không chặn được nguồn lành · mọi nguồn hỏng mới kế thừa ·
  ghi đè thắng cả hai;
- 7 ca của công thức mới trong `spec.tests`, tự chạy qua `formulas.test.ts`;
- 12 ca thác nước, trong đó ca quan trọng nhất là **tổng các chặng đúng bằng kết quả công thức** —
  một hình bóc tách cộng lại không ra con số ở khối Kết quả là hình nói dối về chính phép tính nó
  minh hoạ, mà từng cột riêng lẻ vẫn là số hợp lệ nên không ca nào khác bắt được;
- 2 ca giao diện: cây thác nước không có id do React sinh kể cả khi phóng to, và cả **bốn** nhánh
  dựng của `ChartBody` đều sạch.

Hai cửa gác sẵn có tự bắt đúng việc: `chart.test.ts` phát hiện `ev` tuột khỏi nhóm "đường quét",
`history.test.ts` phát hiện nó không còn là `line`. Cả hai đã sửa để diễn đạt bất biến mới chứ
không phải chỉ bơm số.

### Đo trên bản build — dựng ở BẢN SAO, không đụng dev server

Cổng 3000 có dev server **mới** (PID 23148, chủ dự án tự bật lúc 15:02) — khác PID tôi được phép
dừng ở đợt 1, nên không dừng. Cũng không cần: chép cây làm việc sang scratchpad (2,7 MB, trừ
`node_modules` / `.next` / `out` / `.git`), nối `node_modules` bằng junction rồi dựng ở đó. Thứ mà
`check-no-dev.mjs` bảo vệ là `.next/` và `out/` của thư mục gốc; build ở nơi khác thì nó không với
tới được, nên `FFB_ALLOW_BUILD_WITH_DEV=1` ở đây đúng nghĩa "cổng đó không phải dev server của thư
mục này" chứ không phải bịt cửa gác.

| Thứ                    | Đợt 1 (107 CT) | Đợt 2 (108 CT) |                                        |
| ---------------------- | -------------- | -------------- | -------------------------------------- |
| Trang tĩnh             | 118            | **119**        | thêm đúng trang của công thức mới      |
| `verify:static`        | 24/24          | **24/24**      | cả hai check khối chuỗi vẫn đạt        |
| Trang nặng nhất (JS)   | 155,9 kB       | **156,9 kB**   | `lich-tra-no`, dư **13,1 kB** dưới cửa |
| Chỉ mục nhẹ, mọi trang | —              | **10,9 kB**    | 0,1 kB mỗi công thức                   |
| Chunk nạp trễ của `ev` | —              | 8,2 kB         | thác nước không đẻ chunk riêng nào     |

Cả đợt 2 tốn **1,0 kB** trên trang nặng nhất — công thức mới, renderer thác nước và nhánh thứ ba
của `ChartModel` cộng lại. `WaterfallChart` không làm phình vì nó rơi vào đúng chunk biểu đồ đã
nạp trễ sẵn.

**Một chỗ tôi ghi sai ở bản trước, sửa lại:** `verify:static` có **24** phép kiểm, không phải 25.
Hai dòng `check()` cuối file là hai nhánh của một `if/else` (thiếu `robots.txt` thì báo trượt), nên
đếm dòng gọi ra 25 mà chạy chỉ ra 24. `CLAUDE.md` đã sửa theo.

### Dọn số 107 còn kẹt trong chú thích

Nâng trần để lại **39 file** vẫn khẳng định "107 công thức" ở thì hiện tại — kể cả một chỗ người
dùng thật sự đọc: `description` của `/cong-thuc/` đi thẳng vào thẻ meta của HTML tĩnh.

Ranh giới khi quét, vì không phải số 107 nào cũng sai:

- **Sửa** những câu khẳng định trạng thái HIỆN TẠI — "khuôn chi tiết dùng chung cho cả 107 công
  thức", "đủ 107 / 107", "phủ 97 trên 107" (nay 98/108), "cả 107 trang chi tiết cùng gánh".
- **Giữ nguyên** những câu ghi lại một PHÉP ĐO ĐÃ LÀM: "đo 107 thẻ ở khổ 390px ra sáu chiều cao",
  bảng đo ba chế độ output của KaTeX, chuyện `size-report.mjs` từng chia cho 21. Sửa chúng thành
  108 là bịa một phép đo chưa từng chạy.
- **Không đụng `TASK.md`** — nhật ký theo thời gian; viết lại quá khứ là hỏng chính thứ nó ghi.

Hai chỗ lệch nữa lộ ra khi quét: `categories.ts` còn ghi "Mảng chứng khoán — 94 công thức" ngay
dưới docblock đã sửa thành 95, và `registry.test.ts` có tên ca "Nâng cao thấy đủ 107" trong khi
chính nó `expect(...).toHaveLength(108)` ở dòng dưới.

Quét bằng script có xác nhận từng chuỗi phải khớp **đúng một lần**, không thì dừng và không ghi gì
— thay vì `sed` mù, vì "107" cũng là dữ liệu giá trong ca kiểm của `technical-volatility.ts`.

### Còn lại

- [x] **`npm run build` → `verify:static` → `size`** — xong, số ở mục "Đo trên bản build" bên dưới.
- [x] **Ba công thức vay đã khai `breakdown`** — làm ở đợt 3, kể cả cạm bẫy `lich-tra-no`. Còn
      **sáu** công thức khai `waterfall`/`stackedBar` mà chưa khai chặng.
- [x] **Đã kiểm trên Chrome thật** — `npm run check:chrome`, xem mục "Đợt 3".
- [ ] Bảng SRS mục 3.8 ngoài repo — xem trên.

## Đợt 3 — bóc tách ba công thức vay, và bộ kiểm trên Chrome thật

Trạng thái: **xong, đã kiểm đủ năm cửa**. `npm run check` xanh **1298 test / 55 file** (trước đợt
1290); `npm run build` 119 trang; `verify:static` **24/24**; `size` **156,9 kB** — không đổi một
byte nào so với đợt 2; và cửa mới `npm run check:chrome` **10/10** trên Chrome thật.

### Yêu cầu

> "tiếp tục bước tiếp theo theo kế hoạch" → đợt 3 của lộ trình đã chốt: harness Chrome, cột chồng
> gốc/lãi cho ba công thức vay, WF-04 hi-fi nếu có ảnh.

Việc thứ ba **không làm**: nó có điều kiện "nếu có ảnh WF-04 hi-fi", mà chưa có ảnh nào. Dựng theo
tưởng tượng rồi bảo là bám wireframe thì tệ hơn để nguyên.

### Việc 1 — cạm bẫy `lich-tra-no`, và cách né

Đợt 2 đã ghi sẵn chỗ này sẽ vỡ: cột chồng hiển nhiên của một khoản vay là **gốc + lãi**, nhưng kết
quả của `lich-tra-no` chỉ là phần **lãi**. Hình ấy cộng lại ra tổng phải trả, lệch hẳn con số ở
khối Kết quả — và bất biến "tổng các chặng bằng kết quả" sẽ đỏ. Đúng ra phải đỏ.

Lối đi là **đảo chiều phép tính**, vì tổng lãi chính là phần dôi ra của những gì phải trả so với
những gì đã vay:

```text
Tổng phải trả  1.789,7 triệu ₫   (+)
Trừ gốc vay      800,0 triệu ₫   (−)
──────────────────────────────
Tổng lãi         989,7 triệu ₫
```

Đúng từng đồng, không phải xấp xỉ: `buildAmortisation()` ép kỳ cuối trả nốt đúng dư nợ còn lại nên
tổng phần gốc bằng đúng số tiền vay. Và hình này nói thẳng điều `commonMistakes` của chính công
thức cảnh báo — vay 800 triệu mà phải trả gần 1.790 triệu.

Hai công thức vay còn lại dễ hơn vì kết quả của chúng vốn đã là một tổng: `tra-gop-nien-kim` bóc
**kỳ đầu** thành gốc + lãi (ở bộ số WF-14, lãi 6,33 triệu gấp hơn năm lần gốc 1,12 triệu — đúng
câu `howToRead` "những năm đầu phần lớn tiền trả là lãi"), `tra-gop-goc-deu` bóc kỳ đầu thành gốc
mỗi kỳ + lãi kỳ đầu. Cả hai chỉ cần thêm `extras`, không đụng một dòng phép tính nào.

### Việc 1b — hai quyết định thiết kế lộ ra khi có ca thứ hai

**`waterfall` bày bóc tách mặc định, `stackedBar` chỉ đứng trong ô chọn.** Đợt 2 để "khai
`breakdown` là thành hình mặc định", và lý lẽ khi ấy chỉ đúng cho `ev`: đường quét của EV là một
đường thẳng hệ số góc bằng 1, không nói gì. Đường quét của `lich-tra-no` thì ngược hẳn — tổng lãi
theo kỳ hạn là một đường cong lồi, và nó **chính là** điều `commonMistakes` cảnh báo. Bày bóc tách
đè lên nó là lấy một hình tốt thay bằng một hình tốt khác: không được gì mà mất cái đang có.

Ranh giới lấy ngay từ `chartType` chứ không thêm trường mới — `waterfall` nghĩa là bóc tách CHÍNH
LÀ biểu đồ, `stackedBar` nghĩa là thành phần đáng xem nhưng không thay được đường quét. Cả 10 công
thức đã mang sẵn đúng nhãn. Hệ quả đo được: ca kiểm "63 đường quét + 1 bóc tách" **không phải sửa
số** — ba công thức vay vẫn nằm trong nhóm 63.

**Cột tổng phải mang tên đại lượng, không mang tên công việc.** Nhãn cột tổng vốn suy từ tên công
thức, đúng cho `ev` ('EV — giá trị doanh nghiệp' thành 'EV') nhưng ra 'Lịch trả nợ vay' cho một cột
mang giá trị tổng lãi. Thêm `spec.breakdownTotal` tuỳ chọn; nó lợp cả nhãn trục giá trị, chỗ Chrome
vừa chỉ ra là cũng đang ghi 'Lịch trả nợ vay (tỷ ₫)' cho một trục đo tiền lãi.

### Việc 2 — `npm run check:chrome`

Harness CDP từ scratchpad được chép về repo thành `scripts/chrome-check.mjs`, và dựng thành cửa
kiểm thật thay vì một đoạn thăm dò dùng một lần.

Lý do nó phải tồn tại bên cạnh 1298 ca vitest: **jsdom không có bộ dựng hình**, nên mọi phép đo
hình học đều trả 0 — `getBBox()`, `getBoundingClientRect()`, bề rộng chữ. Ba lớp lỗi đi lọt qua
toàn bộ bộ kiểm hiện có: nhãn tràn khung, cột âm vẽ ngược chiều, và khối nạp trễ có hiện ra hay
không. Riêng lớp thứ ba là **nửa còn lại** của phép kiểm ở `verify:static`: chỗ đó chứng minh khối
chuỗi VẮNG trong HTML tĩnh, nhưng không ai chứng minh bật chế độ Nâng cao thì nó PHẢI hiện.

Script tự dựng cả hai đầu: một máy chủ tĩnh `node:http` trên cổng hệ điều hành tự cấp, và một
Chrome riêng với hồ sơ tạm. Cổng tự cấp né luôn cái bẫy service worker đã ghi trong `package.json`
— không đụng 3000 của `next dev`, không đụng 4173 của `preview`.

**Chỉ tắt đúng tiến trình mình bật** — đóng lịch sự bằng `Browser.close`, hết hạn thì `taskkill`
theo PID, và cả hai nằm trong `finally`. Lần chạy đầu tôi để lỗi ném ra ngoài khối dọn dẹp, đó là
cách bỏ lại một Chrome không ai tắt. Tuyệt đối không diệt theo tên tiến trình: chủ dự án đang mở
37 tiến trình Chrome của họ.

Mười phép kiểm, tất cả ở khổ **360×780**:

| Nhóm      | Kiểm gì                                                                         |
| --------- | ------------------------------------------------------------------------------- |
| Thác nước | dựng được · nhãn không tràn · ba cột có bề rộng thật · **cột âm đúng chiều**    |
| Thác nước | ba nhãn khớp đúng thứ Domain dựng · console sạch                                |
| Chuỗi     | Cơ bản KHÔNG hiện · Nâng cao HIỆN sau hydrate · không tràn ngang · console sạch |

Số đo đáng giữ: nhãn chặng dài nhất còn cách mép trái **35,8 đơn vị** — lề 96 đơn vị đủ rộng cho
nhãn dài gấp rưỡi hiện tại. Cột âm chạy 200,9 → 285,7 trong khi cột trước hết ở 285,7, tức mép phải
trùng đỉnh cột trước và thân kéo về bên trái: đúng chiều.

Lần chạy đầu hỏng vì tôi đoán id ô chọn là `#lich-tra-no-sweep`; thật ra `ChartBody` ghép
`idBase = chart-${spec.id}`. Đọc từ HTML đã dựng ra mới biết — cũng là một điểm cộng nhỏ cho việc
kiểm trên bản build thay vì trên nguồn.

### Đã đổi file nào

**Domain**: `registry/types.ts` (`breakdownTotal`) · `chart/breakdown.ts` (nhãn cột tổng) ·
`chart/build.ts` (mặc định theo `chartType`, nhãn trục theo `breakdownTotal`) ·
`formulas/personal.ts` (ba khai báo `breakdown` + `extras` cho hai công thức).

**Công cụ**: `scripts/chrome-check.mjs` (mới) · `package.json` (script `check:chrome`).

### Kiểm chứng

**1298 test**, thêm 8 ca ở `chart.test.ts` (61 → 69 ca trong file):

- **cửa gác cả loại biểu đồ**: MỌI công thức khai `breakdown` phải cộng đúng về kết quả của chính
  nó, kèm chốt danh sách 4 id — thêm công thức mới mà quên nghĩ tới bất biến này là đỏ ngay;
- ba công thức vay mặc định vẫn ra đường quét, bóc tách nằm sẵn trong ô chọn;
- chọn mục ấy thì ra thác nước đủ hai chặng một tổng;
- `lich-tra-no`: tổng phải trả trừ gốc vay ra đúng tổng lãi, cột thứ hai âm;
- cột tổng lấy nhãn từ `breakdownTotal`, không lấy từ tên công thức;
- `tra-gop-nien-kim`: lãi kỳ đầu gấp hơn năm lần gốc;
- `tra-gop-goc-deu`: hai chặng cộng đúng khoản trả kỳ đầu;
- kỳ hạn 0 thì không có mục bóc tách nào.

### Còn lại

- [ ] **Sáu công thức còn khai `waterfall`/`stackedBar` mà chưa khai `breakdown`**: `ncav-tren-co-phieu`,
      `fcff`, `fcfe`, `wacc`, `ddm-hai-giai-doan`, `thue-tncn-dau-tu`. Ba cái đầu là nhóm thật sự
      đáng làm. Cạm bẫy đã thấy trước ở `ncav-tren-co-phieu`: kết quả có phép CHIA cho số cổ phiếu,
      nên chặng phải là số **trên mỗi cổ phiếu** tính sẵn trong `extras`, không phải tài sản và nợ
      thô — khai thô là bất biến "tổng bằng kết quả" đỏ ngay, đúng như nó nên đỏ.
- [ ] **Ảnh WF-04 hi-fi** — chưa có, nên khối chuỗi vẫn đang mang kiểu dáng tự dựng.
- [ ] Bảng SRS mục 3.8 ngoài repo: 94 / 13 / 107 → **95 / 13 / 108**.

## Đợt 11 — duyệt chuyên môn bằng máy, và khối hằng số trên màn chi tiết

Trạng thái: **xong phần code, 5 lỗi diễn giải đang chờ chủ dự án duyệt câu chữ.**
`npm run check` xanh **1347 test / 61 file**; build 119 trang; `verify:static` **24/24**;
`size` **162,9 kB** trên cửa 170 kB; `check:chrome` **18/18**.

### Hai lượt rà, và bài học về cách đặt tiêu chí

Chạy thử nhóm **Phái sinh** trước (7 công thức, 28 đoạn) với bốn tiêu chí rộng — prose so với
`calc`, chuẩn mực tài chính, ranh giới FR-24, độ dễ đọc. Kết quả: 13 phát hiện mức cao/vừa,
**2 lỗi thật**, 11 bị phản biện bác. Tỷ lệ trúng **15%**.

Đọc kỹ 11 cái bị bác thì thấy chúng cùng một hình dạng: góp ý văn phong, "nên thêm", "chưa đủ rõ",
"thuật ngữ chưa giải thích", hoặc đòi một mục diễn giải gánh nội dung của mục khác — trong khi
FR-03 chia bốn mục chính là để không lặp. Còn **cả hai lỗi thật đều thuộc đúng hai loại khách
quan**: một câu tự mâu thuẫn với câu khác trên cùng màn, và một mệnh đề định lượng bị chính số
học của công thức bác.

Nên lượt hai (101 công thức còn lại) **siết tiêu chí xuống đúng hai loại đó**, kèm danh sách cấm
báo. Kết quả: **3 phát hiện, 3/3 qua phản biện — tỷ lệ trúng 100%**, và 8 trong 11 agent trả về
mảng rỗng, đúng như mong đợi.

Bài học đáng ghi: với vòng rà bằng máy, **tiêu chí hẹp và kiểm được cho ra ít phát hiện hơn nhưng
đáng tin hơn hẳn**; tiêu chí rộng sinh ra khối lượng đọc lớn mà phần lớn là khẩu vị biên tập. Chi
phí cũng chênh: 1,15 triệu token cho 28 đoạn ở lượt rộng, 1,12 triệu cho 404 đoạn ở lượt hẹp.

Điểm nữa: vòng phản biện **chặn được nhiều đề xuất sửa sẽ làm hỏng thêm**, không chỉ lọc phát
hiện sai. Bốn lần nó bác đúng những đề xuất chép hằng số thị trường vào prose — 5,9 lần đòn bẩy,
550.000 ₫, "gần 100% tài sản ký quỹ", thang cảnh báo 80/90/100% — tức dựng lại đúng cái bẫy
LDR-03/CON-10 tránh, ở dạng chữ nên lint không bắt được.

### Năm lỗi diễn giải — CHỜ DUYỆT, chưa đụng vào code

| Công thức                | Mục                 | Lỗi                                                                           |
| ------------------------ | ------------------- | ----------------------------------------------------------------------------- |
| `basis-vn30f`            | meaning + howToRead | dạy "basis dương = kỳ vọng tăng" trong khi >½ basis là chi phí nắm giữ        |
| `don-bay-hieu-dung`      | commonMistakes      | gọi nghịch đảo tỷ lệ ký quỹ là "mức lúc vào lệnh" — đó là **trần**            |
| `irr-nien-kim`           | whenToUse           | mời dùng cho trái phiếu coupon, mô hình không có ô nhập mệnh giá hoàn kỳ cuối |
| `ty-so-calmar`           | commonMistakes      | cảnh báo về một con số mà `calc` không bao giờ cho ra                         |
| `do-lech-chuan-ban-phan` | howToRead           | khẳng định "luôn ≤ độ lệch chuẩn đầy đủ" vô điều kiện — sai khi ngưỡng cao    |

Ba cái sau đo được bằng số: IRR lệch **17 điểm phần trăm** (7,93% so với 25%); Calmar với chuỗi
toàn phiên tăng cho mẫu số **đúng bằng 0** nên `calc` trả `DIVIDE_BY_ZERO` chứ không "vọt lên vài
chục lần"; độ lệch chuẩn bán phần ở ngưỡng 5% ra 4,87% tức **gấp 3,44 lần** con số mà câu prose
nói là trần trên.

### Khối hằng số — vá một lỗ hổng mà chính vòng phản biện đào ra

Khi bác đề xuất "chép 100.000 ₫ vào prose", người phản biện chỉ ra thứ đáng sửa nằm ở UI chứ
không ở chữ: **hằng số MarketConfig không hiện trị số ở bất kỳ đâu trên màn chi tiết.** Kiểm lại
thì đúng — `FormulaDetail.tsx` chỉ có một chỗ nhắc tới hằng số (`sourceNote` ở dòng 487, chỉ gắn
cho biến kiểu `toggle`, và là nhãn suông không có trị số), trong khi có **24 lời gọi**
`constantOf`/`rateOf` trải trên 13 công thức.

Ví dụ tệ nhất: `phi-giao-dich-mua` cho ra 138.000 ₫ từ 1.000 CP × 92.000 ₫ mà **mức 0,15% không
xuất hiện ở đâu** — không ở bảng biến (nó không phải ô nhập), không ở khối Nguồn (chỗ đó dành cho
`spec.source`), và `example.note` của công thức này thì trống. Người dùng thấy con số phí mà không
có cách nào biết nó tính theo tỷ lệ nào — trong khi đó lại đúng là thứ khác nhau giữa các công ty
chứng khoán. Trớ trêu: nhóm phí & thuế là nhóm mà mấy con số ấy **là luật định**, đã có sẵn
`effectiveFrom` và `legalBasis` trong `schedules.ts` — dữ liệu đủ để bày, chỉ thiếu chỗ hiển thị.

Cách vá — khai **khoá**, không khai trị số, để trị số tiếp tục chảy từ `schedules.ts`:

- `spec.usesConstants?: ReadonlyArray<MarketConstantKey>` (`registry/types.ts`), khai ở 13 công
  thức trong `derivatives.ts` (5), `fees.ts` (7), `planning.ts` (1).
- `constantsUsedBy(spec, ctx)` trong `formulas/shared.ts` — cạnh `constantOf` vì nó là bản nhiều
  khoá của chính hàm ấy. Không đặt bên `market/resolve.ts`: `registry/types` vừa trỏ xuống
  `market/types` để lấy `MarketConstantKey`, đặt ngược lại thành vòng.
- `ConstantsNote` (`ui/result/`) — nhãn, trị số + đơn vị, ngày hiệu lực, căn cứ pháp lý. Đặt
  **cuối khối Số liệu**, không tách thành khối riêng: nó thuộc về đầu vào, và tách ra thì nó rơi
  xuống dưới khối Kết quả, tức người dùng đọc xong con số rồi mới biết nó tính theo mức nào.
- `formatIsoDate` chuyển từ `chart/history.ts` sang `core/format.ts`. Docblock cũ nói rõ nó nằm
  bên chart để trang chủ khỏi trả tiền cho thứ nó không dùng — lý do ấy hết hiệu lực khi gói cơ sở
  cũng phải in ngày; `formatSessionDate` giữ tên và gọi sang, vì tên nó mang nghĩa riêng của biểu
  đồ (nhãn một PHIÊN).

Chi phí đo được: **+0,1 kB** First Load JS (162,8 → 162,9), và 95 trong 108 trang không thêm nút
DOM nào vì component tự trả `null` khi danh sách rỗng.

### Cửa gác `constants-gate.test.ts` — hai chiều, hai cơ chế khác nhau

Cố ý không dùng chung một cách kiểm, vì mỗi cách mù một kiểu:

1. **Quét mã nguồn** bắt khai **thiếu** — cắt file theo từng `FormulaModule`, gom khoá trong mỗi
   khối rồi đối chiếu. Cần quét nguồn vì lời gọi nào không chạy trong ca kiểm nào thì cách (2)
   không thấy.
2. **Rút hằng số** bắt khai **thừa** — dựng biểu phí thiếu đúng khoá đã khai rồi chạy `calc`, kết
   quả bắt buộc phải hỏng. Cách này không đọc chữ trong file nên không bị lừa bởi khoá nằm trong
   comment hay chuỗi.
3. Ca thứ ba giữ **danh sách file quét** khớp với tập công thức có khai — thiếu ca này thì thêm
   một file nhóm mới có `rateOf` là cửa gác im lặng bỏ qua.

Đã đột biến từng ca, mỗi ca đỏ đúng chỗ nó phải đỏ:

| Đột biến                             | Ca bắt được                              |
| ------------------------------------ | ---------------------------------------- |
| gỡ `usesConstants` của `phi-luu-ky`  | ca 1 (`tra 'fee.custody' mà không khai`) |
| khai thừa `market.settlement.days`   | ca 3 (`bỏ khoá đó đi vẫn ra 1350`)       |
| bỏ `planning.ts` khỏi danh sách quét | ca 2 (`thue-tncn-dau-tu`)                |

Giới hạn đã biết, ghi trong docblock: quét nguồn chỉ hiểu khoá viết thẳng dạng chuỗi. Hiện không
có chỗ nào viết `constantOf(ctx, k)` với `k` là biến; nếu sau này cần thì phải đổi cách kiểm chứ
đừng nới regex.

### Việc còn lại của đợt

- [x] **5 câu chữ chờ duyệt** — xong, xem mục "Vá 5 câu chữ diễn giải sai + nâng vitest".
- [ ] Lượt tra 24 con số thật cho 4 mã mẫu **chết vì chạm giới hạn phiên**, 0/24. Bốn agent đã kịp
      tải về scratchpad các BCTC gốc (FPT hợp nhất Q4/2025 + riêng 2025 đã kiểm toán, VNM hợp nhất
      2025 / Q4-2025 / Q1-2026 / bản kiểm toán 2024) — chạy lại thì đỡ được phần tìm nguồn, nhưng
      **không vớt kết luận nào** của chúng vì chưa cái nào qua phản biện.

## Đợt 10 — gỡ nhãn BẢN THẢO của hằng số thuế & phí (đóng gói 5.1.1)

Trạng thái: **xong**. Một trong ba việc chặn v0.1 đã đóng — còn hai.

### Yêu cầu

> "tôi đã rà bản thảo rồi và thấy được rồi, bạn hãy gỡ những bản thảo thừa. trước khi xóa thì
> hỏi thôi để chốt"

### Vì sao phải hỏi lại trước khi gỡ

Repo có **hai loại nhãn bản thảo nói hai chuyện khác nhau**, và lượt rà của chủ dự án chỉ chạm
loại thứ nhất:

- **Loại A — pháp lý**: khối cảnh báo đầu `market/schedules.ts` và trạng thái hồ sơ cùng thư mục.
  Nói rằng 7 hằng số thuế/phí chờ người đối chiếu văn bản gốc. Đây đúng là thứ vừa được rà.
- **Loại B — số liệu mẫu**: `samples.ts` mang `isDraft: true`, kéo theo nhãn trên PresetSheet,
  câu cảnh báo ở màn Danh mục, câu đính vào file xuất và PNG, 5 khoá i18n, 3 ca kiểm. Nói rằng
  12 mã cổ phiếu là **số tự dựng bằng PRNG có hạt giống**, không phải báo cáo tài chính thật.

Gỡ loại B là để sản phẩm trình bày số bịa như số thật — không liên quan gì tới việc đọc văn bản
pháp luật. Chủ dự án chốt: **chỉ gỡ loại A**, giữ nguyên loại B.

Hai điều chốt thêm cùng lượt: hai mốc ngày của Q5 (01/01/2015 và 01/01/2009) — thứ không nằm
trong 7 con số máy tra được mà do người viết điền từ kiến thức nền — **đã được kiểm trên bản gốc
và xác nhận đúng**; và hồ sơ đối chiếu **giữ lại**, chỉ đổi trạng thái.

### Đã đổi file nào

- **`src/core/market/schedules.ts`** — thay khối "⚠ BẢN THẢO — CHỜ NGƯỜI ĐỐI CHIẾU" bằng ghi
  nhận đã qua hai vòng (máy tra nguồn mở → người đọc bản gốc), kèm điều kiện cho lần sửa sau:
  đổi một con số thì phải kèm `legalBasis` trỏ văn bản ĐANG hiệu lực và một dòng trong hồ sơ.
- **`src/core/market/README.md`** — trạng thái "ĐÓNG", bảng Q1–Q7 đánh dấu đủ bảy dòng, gỡ câu
  cảnh báo về hai mốc Q5 và ghi rõ chúng đã được kiểm. Thêm mục **"Lần rà sau bắt đầu từ đâu"**:
  hồ sơ đóng không có nghĩa hằng số đứng yên — Thông tư 102/2021 chưa ai tra tình trạng hiệu lực
  của chính nó, biểu giá VSDC đổi được mà không cần sửa luật, và T+2 là quy chế chứ không phải
  luật (thị trường đang bàn T+1).
- **`README.md`** — "ba việc chặn v0.1" thành hai, kèm câu dặn đừng gỡ nhãn số liệu mẫu chừng
  nào con số còn là số bịa.
- **`CLAUDE.md`** — cùng nội dung, phía tiếng Anh.

## Đợt 9 — rà lại toàn bộ phần chưa commit, và vá 12 lỗi tìm ra

Trạng thái: **xong**. `npm run check` xanh **1331 test / 59 file**; `verify:static` **24/24**;
`npm run size` **162,8 kB** trên cửa 170; `check:chrome` **18/18**.

### Yêu cầu

> "dự án còn gì chưa làm và chưa thể làm?" → "ok, làm đợt 9"

Trước khi gom commit 8 đợt (129 file), rà lại phần chưa commit bằng 5 hướng soi song song, mỗi
phát hiện phải qua một lượt **phản biện đối nghịch** tự tái hiện được mới công nhận. Kết quả:
11 lỗi thật, cộng 1 lỗi chưa phán vì agent phản biện chết giữa chừng do hết hạn mức phiên —
xác minh riêng sau, và hoá ra nó là lỗi nặng nhất cả đợt.

### Bài học: cửa gác dựng ở đợt 8 THỦNG, và chính nó để lọt hai lỗi

Cửa gác "client không được import `t` build-time" soi file mở đầu bằng `'use client'`.
`FormulaCard.tsx` và `SearchResults.tsx` **không mang directive nào** — chúng là module dùng
chung, vào gói máy khách theo chân component import chúng — nên hai badge "Cơ bản"/"Nâng cao"
nằm im tiếng Việt giữa màn EN mà cửa gác vẫn xanh. Nay soi **toàn bộ `src/ui` + `src/app`**, ai
muốn dùng `t()` build-time phải có tên trong danh sách miễn trừ kèm lý do. Chạy lần đầu nó bắt
ngay `AppHeader.tsx` — file thứ ba mà bản cũ bỏ sót. Thêm một ca kiểm nữa chặn **miễn trừ chết**:
mục nào hết lý do mà còn nằm trong danh sách là đỏ.

Rút ra: gác theo _dấu hiệu khai báo_ (directive) là gác theo thứ người viết có thể quên;
gác theo _phạm vi thư mục_ thì không quên được.

### 12 lỗi đã vá

**Cửa gác đỗ giả (4)** — mỗi cái đều đã chứng minh đỏ được sau khi sửa:

- Cửa gác `t` build-time: xem trên. Bằng chứng đỏ: bắt `AppHeader` ngay lượt chạy đầu.
- `prose-audit` phép kiểm A không bắt được **cả hai tiền lệ sáng lập ghi trong docblock của chính
  nó**: `'beta'` nằm trong danh sách miễn trừ (nên "công thức Beta" đi lọt), và `proseOf()` chỉ
  quét `FormulaSpec` — mô tả nhóm ở `categories.ts`, đúng nơi lỗi từng xảy ra, không hề được soi.
  Nay gỡ `'beta'`, quét cả mô tả 12 nhóm, và thêm một ca riêng cho dạng liệt kê tên trần
  ("Sharpe, Sortino, …") mà regex có từ dẫn không với tới. Danh sách `CHUA_CO` tự hết hạn: Beta
  lên sóng thì ca kiểm đỏ và nhắc xoá tên. Bằng chứng đỏ: thêm "Beta" vào mô tả nhóm Rủi ro →
  đỏ đúng một dòng, rồi hoàn nguyên.
- `check:chrome` assertion "không cột nào bẹp thành vạch" là **tautology**: renderer kẹp sàn
  `Math.max(…, 1)` nên `w >= 1` không bao giờ sai được. Đổi thành `w > 1` — chạm sàn nghĩa là bẹp.
- `verify:static` check "có link quay về" dùng hai `includes` rời nhau, mà vế `href="/cong-thuc/"`
  luôn đúng nhờ thanh tab dưới — nên đúng regression mà comment của nó nói mình chặn (thay
  `<a>` bằng `<button>` + router) vẫn đi qua. Nay một regex đòi hai chuỗi trong **cùng một thẻ
  `<a>`**. Bằng chứng: thử regex với HTML thật (true) và với ca `button` + tab bar (false).

**i18n sót (5)**: hai badge cấp độ chuyển sang lá `<T>` — không dùng `useT()` được vì
`FormulaCard` được dựng ở CẢ hai phía (client và `StaticFormulaList` server); nhãn ba bậc đơn vị
tiền có khoá riêng (`UNIT_SCALE_KEYS`, dây neo với `UNIT_SCALES` ở Domain) nên màn EN thôi hiện
"Total interest … million ₫" ngay trên "Unit: triệu ₫" — tiện thể gộp luôn `loan.millionDong`
trùng vai; `about.schedule` dịch lệch nghĩa ("Fee schedule in use" trong khi con số là SỐ biểu
phí đã nạp) → "Fee schedules loaded"; `ExportSheet` giữ **cờ** thay vì chuỗi đã dịch trong state.

**Dữ liệu & pháp lý (2)**: `SOURCE_FEE_CIRCULAR` còn trích Thông tư 128/2018 — vòng Q1 sửa
`schedules.ts` mà sót nhãn dùng chung, nên khối Nguồn của 5 trang phí chỉ người dùng tới văn bản
đã bị thay, trái với căn cứ của chính hằng số dùng trong cùng phép tính. Nay là 102/2021, **kèm
dây neo** trong `market.test.ts` bắt hai bên trích cùng số thông tư. Và `AS_OF` lấy ngày UTC:
build trong khung 00:00–06:59 giờ Việt Nam đúng ngày một hằng số có hiệu lực thì cả đợt deploy
chạy bằng luật cũ — nay lấy theo `Asia/Ho_Chi_Minh`, vì hằng số của sản phẩm là luật Việt Nam.

**Bụi dấu phẩy động (1)** — lỗi chưa phán, xác minh riêng và là lỗi nặng nhất:

`lich-tra-no` ở **lãi suất 0%** hiện trục `[−200 triệu, 800 triệu]` với vạch "−200" dưới một
biểu đồ không có cột nào âm. `totalPaid` cộng dồn 240 kỳ trong khi chặng thứ hai trừ `amount`
lấy nguyên từ ô nhập — hai đường tích luỹ lệch **−1,19e−7** thay vì triệt tiêu, rồi `Math.floor`
trong `niceAxis` nới hạt bụi ấy thành trọn một bước trục. Quét lưới thanh trượt thật: **1.214 bộ
số dính, 100% ở lãi suất 0**, kể cả bộ mặc định 800 triệu / 20 năm của WF-14 — chỉ cần kéo thanh
lãi suất về đầu trái là thấy. Chín công thức bóc tách còn lại không dính (chúng triệt tiêu bằng
hiệu hai số bằng nhau đúng bit).

Vá hai lớp: **gốc** — `totalPaid = amount + totalInterest`, chặt chứ không xấp xỉ vì
`buildAmortisation` ép kỳ cuối đóng dư nợ về 0; **lớp lỗi** — `breakdownExtent` quét bụi dưới
1e-9 tương đối về 0 trước khi giao cho `niceAxis`, để công thức thứ 11 khai bóc tách không gặp
lại. Ca hồi quy ở lãi suất 0 đã chứng minh đỏ được: hoàn nguyên bản vá gốc thì nó báo đúng
`-1.1920928955078125e-7`.

Kèm theo, cùng ca ấy lộ một cái bẫy trong chính bất biến "tổng chặng = kết quả": nó chia cho
`|output.value|`, mà kết quả bằng 0 là chuyện có thật — biểu thức ra `Infinity` và phép kiểm đỏ
oan. Nay mẫu số lấy theo cột lớn nhất.

### Còn nợ, đã ghi tại chỗ

Tiêu đề trục biểu đồ (`core/chart/build.ts`) ghép `${tên} (${scale.label})` ngay trong
`ChartModel` — chuỗi do Domain dựng và có chứa TÊN CÔNG THỨC, nên để nguyên tới lượt dịch nội
dung chứ không vá nửa vời. Ghi trong docblock của `src/ui/i18n/keys.ts`.

## Đợt 8 — thông luồng locale, gắn lại LangSwitch (gói 3.6.3, phần giữa)

Trạng thái: **xong — FR-21 chạy thật lần đầu**. `npm run check` xanh **1325 test / 59 file**
(thêm 12 ca, 3 file test mới); `verify:static` **24/24**; `npm run size` **162,6 kB** trên cửa
kiểm 170 (+1,6 kB cho phần luồng); `npm run check:chrome` **18/18** — thêm 4 assertion cho luồng
EN. Build trong bản sao scratchpad, dev server PID 23148 không đụng.

### Yêu cầu

> "ok bắt đầu làm"

### Kiến trúc — ba đường chữ đi, cộng một thuộc tính

1. **Client component** → `useT()` (hook mới trong `preferences-context.tsx`): bản `t()` đã buộc
   vào locale đang chọn. Component đặt `const t = useT();` — shadow đúng tên nên toàn bộ call
   site `t('…')` giữ nguyên, diff mỗi file chỉ 2–3 dòng. **~45 file** chuyển kiểu này; phần cơ
   học giao 4 agent chạy song song trên các nhóm file rời nhau, rà lại bằng diff + 4 cửa kiểm.
2. **Server component** → lá client `<T k="…">` (`src/ui/i18n/T.tsx` — file mới): trang chủ và
   AppShell cố ý là server component để CategoryGrid/FormulaCard không vào gói máy khách
   (NFR-PER-04) — bọc ĐÚNG PHẦN CHỮ vào lá thì cả khối vẫn do server dựng, chỉ chữ hydrate.
   Context xuyên qua server children bình thường nên lá vẫn nhận locale. Trang 404 thì chuyển
   hẳn client vì chữ đi qua props string của `EmptyState`; `SearchLink` cũng client vì nhãn nằm
   trong thuộc tính `title`.
3. **Cố ý đứng yên** (mỗi chỗ một comment tại chỗ): metadata trong `layout.tsx` (build-time);
   `DisclaimerBar` (câu miễn trừ phải trùng từng chữ với file xuất — FR-24); fallback SEO
   `StaticFormulaList` (bị FormulaBrowser thế chỗ sau hydrate); vùng in PDF + thẻ PNG của
   `ExportSheet`/`draw-card` — file xuất là tài liệu tiếng Việt trọn vẹn, một câu Anh giữa
   tài liệu Việt là tài liệu hỏng.
4. `<html lang>` đổi theo locale sau hydrate (effect trong Provider) — không đổi thì trình đọc
   màn hình đọc chữ Anh bằng giọng Việt.

`LangSwitch` gắn lại vào AppHeader: cả hai điều kiện của quyết định đợt 14 (có bản dịch + luồng
thông) đã đạt. Mẫu hydrate giữ nguyên của `ffb.prefs.v1`: render đầu luôn tiếng Việt khớp HTML
tĩnh, localStorage đọc trong effect — Chrome thật xác nhận console sạch, không lệch hydration.

### Cửa gác mới — và cái nó bắt được ngay lượt chạy đầu

- `i18n.test.ts`: **file 'use client' không được import `t` tĩnh từ `@/application`** — chữ
  import kiểu đó đóng băng tiếng Việt lúc build, lỗi chỉ lộ khi có người bấm thử từng màn ở EN.
  Lượt chạy đầu bắt ngay `BackLink.tsx` và `Switch.tsx` — hai file bản kiểm kê regex sót vì
  chúng gọi `t(bienSo)` không có nháy đơn ngay sau `t(`. Ngoại lệ có tên: `ExportSheet` (giữ
  `t as tVi` cho vùng in, lý do ghi tại chỗ).
- Cửa gác khoá mồ côi nhận thêm `"key"` nháy kép — khoá đi qua JSX `<T k="…">` không bị báo oan.
- 3 file test mới: `use-t.test.tsx` (4 ca — fallback ngoài Provider, đổi tức thì + ghi
  localStorage + đổi `<html lang>`, hydrate từ EN đã lưu), `LangSwitch.test.tsx` (4 ca — điểm
  đáng gác: sau khi chuyển, chính cái nút phải NÓI TIẾNG ANH), `T.test.tsx` (2 ca).
- `check:chrome` 14 → **18**: tiêu đề trong server children đổi sau hydrate (rủi ro riêng của
  kiến trúc lá `<T>` — jsdom kiểm từng lá, còn "cả trang thật từ HTML tĩnh Việt sang EN mà
  console sạch" chỉ Chrome thật trả lời được), nhãn tab bar client đổi theo, `<html lang>`
  thành `en`, console sạch kể cả cảnh báo hydration.

### Ghi chú cho lượt dịch nội dung (phần cuối 3.6.3)

Hai chuỗi cứng tiếng Việt còn nằm ngoài i18n, tồn tại từ trước: caption "Số liệu — {tên}" trong
`ChartFrame` và bộ nhãn cột `COLUMN_LABELS` của `PasteImportSheet` (nhãn build-time từ tầng
application). Chưa có khoá nên nút EN không đổi được chúng — xử cùng lượt dịch nội dung công thức.

### Còn lại của FR-21

1. Dịch nội dung công thức (tên + 432 đoạn diễn giải) — **sau** duyệt chuyên môn bản tiếng Việt.
2. Câu miễn trừ + vế file xuất theo locale — chủ dự án chốt chữ, làm cùng nhau một lượt.

## Đợt 7 — từ điển tiếng Anh cho giao diện (gói 3.6.3, phần đầu)

Trạng thái: **xong phần khoá giao diện** — `npm run check` xanh **1313 test / 56 file** (thêm 3);
build trong bản sao scratchpad (dev server PID 23148 vẫn giữ :3000, không đụng), `verify:static`
**24/24**, `npm run size` **161,0 kB** trên cửa kiểm 170 kB.

### Yêu cầu

> "giờ tiếp tục làm dự án thôi"

Mục code làm ngay được duy nhất còn lại là gói 3.6.3 (FR-21, 14 giờ WBS). Gói ấy tách được ba
phần: từ điển giao diện (đợt này), luồng locale + gắn lại LangSwitch (đợt sau), và dịch nội
dung công thức — 432 đoạn, cố ý chờ duyệt nội dung bản Việt xong mới dịch để khỏi dịch hai lần.

### Đã đổi file nào

- **`src/application/i18n/en.ts`** — dịch **231/232 khoá**. Khoá duy nhất cố ý bỏ lại:
  `disclaimer.text` — câu miễn trừ trên màn phải trùng từng chữ với câu đính vào file xuất
  (`DISCLAIMER_VI`) mà bộ dựng file xuất chưa biết locale, dịch một vế là hai vế lệch nhau
  (FR-24); câu pháp lý cũng cần chủ dự án chốt chữ. Bẫy chính khi dịch: nhiều khoá đứng ngay
  sau con số ghép ở call site ("12 kết quả") mà tiếng Anh có số ít/số nhiều — khoá nào con số
  có thể bằng 1 thì dùng dạng "(s)" (`result(s)`, `formula(s)`, `row(s)`), khoá nào luôn ≥ 2
  (`loan.condensed`, `home.browse.unit`) để số nhiều trơn. Trước khi dịch đã soi từng call
  site ghép chuỗi để giữ đúng trật tự từ.
- **`src/application/i18n/i18n.test.ts`** — hai ca đang mã hoá trạng thái "en rỗng" viết lại
  thành bất biến mới: nợ dịch còn đúng `['disclaimer.text']`, và đường rơi về tiếng Việt kiểm
  bằng chính khoá đó. Thêm ba ca gác bản dịch: truyền locale ra đúng câu Anh; câu Anh không
  sót chữ có dấu (trừ hai câu cố ý nêu ví dụ “Định giá” và tên đơn vị "đồng");
  `series.empty` phải nhắc đúng nhãn đã dịch của nút `series.addRow`.
- **`src/ui/navigation/AppHeader.tsx`** — cập nhật comment lý do LangSwitch chưa gắn: vế
  "en.ts chưa có câu nào" đã hết đúng, chỉ còn vế luồng locale.

### Số đo NFR-PER-04 — cái giá của từ điển thứ hai

`DICTIONARIES = { vi, en }` là import tĩnh nên từ điển EN nằm trong First Load JS của MỌI
trang: trang nặng nhất 155,9 → **161,0 kB** (+5,1 kB nén), dư địa cửa kiểm còn 9 kB. Ghi nhớ
cho đợt thông luồng locale: nếu cần đòi lại phần này thì tách `en.ts` sang `import()` động chỉ
nạp khi người dùng bấm sang EN — chưa làm bây giờ vì vẫn dưới cửa, và thêm đường async là thêm
bề mặt lỗi khi chưa có gì dùng đến.

### Còn lại của FR-21

1. Thông luồng locale: `t()` chưa call site nào truyền locale — hướng làm là `useT()` đọc
   `usePreferences().locale`; chữ server-render sẽ hiện bản Việt tới khi hydrate (cùng mẫu
   `ffb.prefs.v1` hiện có). Xong vế này thì gắn lại LangSwitch — một dòng trong AppHeader.
2. Dịch nội dung công thức (tên + 432 đoạn diễn giải trong spec, tầng Domain) — sau khi duyệt
   chuyên môn bản tiếng Việt.
3. Dịch câu miễn trừ — làm cùng lúc với vế file xuất theo locale, chữ do chủ dự án chốt.

## Đợt 6 — hồ sơ đối chiếu 7 hằng số thuế & phí (gói 5.1.1)

Trạng thái: **xong trọn — chủ dự án duyệt Q1–Q7 và đã áp vào code** (1310 test / 56 file xanh). Hồ sơ:
`src/core/market/README.md`. Chưa sửa một ký tự nào trong `schedules.ts`: file ấy tự dán nhãn
"BẮT BUỘC được người rà soát đối chiếu văn bản gốc", và hồ sơ máy tra không thay được người rà —
nó chỉ đổi việc của người rà từ "đi tìm và đọc 5 văn bản" thành "gật hoặc lắc từng dòng".

### Yêu cầu

> "bước kia bạn thực hiện giúp tôi đi" — bước hồ sơ đối chiếu, việc chặn v0.1 cao nhất.

### Cách làm

Sáu lượt tra độc lập chạy song song trên nguồn mở (Cổng TTĐT Chính phủ, Bộ Tài chính,
luatvietnam.vn toàn văn, VSD/VSDC, báo lớn), mỗi văn bản một lượt; riêng Luật Thuế TNCN mới —
căn cứ rủi ro nhất vì hiệu lực mới hơn một tháng — thêm một lượt **phản biện** với đề bài "cố
chứng minh lượt một sai". Luật chơi: chỉ nhận KHỚP khi nguồn nêu rõ con số/ngày, không tìm được
thì ghi "chưa xác minh" chứ không đoán. 92 lần truy vấn.

### Kết quả một dòng

**Cả 7 con số đều khớp. Nhưng 4/7 bản ghi sai phần căn cứ** — ngày hiệu lực hoặc văn bản:

| Chỗ sai                | Đang khai                    | Đúng ra                                                                        |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| Môi giới — căn cứ      | TT 128/2018, trần 0,5%       | Đã bị thay: TT 102/2021, trần 0,45%                                            |
| Lưu ký — ngày hiệu lực | 2022-02-27                   | **2022-01-01** — không nguồn nào có ngày 27/02; nghi chép lẫn từ chính số 0,27 |
| T+2 — cơ quan ban hành | "Quy chế giao dịch của HOSE" | Quyết định 109/QĐ-VSD của **VSD** (nay: QĐ 39/QĐ-HĐTV 2025 của VSDC)           |
| VN30F — sở niêm yết    | "Quy chế của HOSE"           | Hợp đồng niêm yết tại **HNX**; HOSE chỉ tính chỉ số cơ sở                      |

Phần thuế — chỗ tôi ngờ nhất — hoá ra **khớp trọn** và là kết quả chắc nhất: Luật 109/2025/QH15
có thật (QH XV kỳ 10, 10/12/2025), hiệu lực đúng 01/07/2026, chuyển nhượng vẫn 0,1%/lần (Điều 13
khoản 2), cổ tức vẫn 5% (Điều 12); mức 20%-trên-lãi chỉ áp cho vốn góp, và đề xuất 20% cho cổ
phần chưa niêm yết chết ở dự thảo. Hai lượt tra độc lập trùng kết quả từng ý.

Hai khoảng trống nội bộ soi ra không cần mạng: hai hằng số thuế **không có bản ghi tiền nhiệm**
(đặt `asOf` trước 01/07/2026 là công thức báo "thiếu hằng số" — trái lời hứa trong docblock
`resolve.ts`), và `validateMarketConfig()` đúng vai chỉ bắt thiếu trường, không bắt sai nội dung.

Sửa lại một câu tôi nói sai ở đợt trước: ngày hiệu lực 01/07/2026 nằm **trước** `asOf` (ngày
build), không phải sau — hai hằng số thuế đang có hiệu lực bình thường.

### Đã đổi file nào

- **`src/core/market/README.md`** (mới) — hồ sơ đầy đủ: bảng 7 dòng, chứng cứ từng dòng, nguồn,
  giới hạn (thuvienphapluat.vn chặn máy 403 nên chưa lượt nào đọc bản gốc có dấu), và bảng
  quyết định Q1–Q7 chờ đánh dấu.
- `TASK.md` — mục này.

### Còn lại

- [x] **Chủ dự án duyệt trọn Q1–Q7** ("ok Q1-Q7", xác nhận lại qua câu hỏi hai nghĩa). Đã áp:
      4 căn cứ/ngày sửa theo hồ sơ, thêm 2 bản ghi thuế tiền nhiệm (2015-01-01 / 2009-01-01 —
      hai mốc này lấy từ kiến thức nền, người rà bản gốc kiểm cùng lượt với Q7), ghi chú ưu đãi
      luật mới vào `thue-co-tuc` + `thue-tncn-dau-tu`, và viết lại 3 ca kiểm đang mã hoá khoảng
      trống cũ thành bất biến mới (trước luật mới → luật cũ; trước MỌI luật → thiếu hằng số).
- [ ] Nhãn "BẢN THẢO" trên `schedules.ts` chỉ nên gỡ sau khi người rà đối chiếu bản gốc có dấu
      (vbpl.vn / Công báo) — hồ sơ này toàn nguồn thứ cấp.

---

## Đợt 5 — rà 432 đoạn diễn giải, và cửa gác nội dung đầu tiên

Trạng thái: **xong**. `npm run check` xanh **1308 test / 56 file** (trước đợt 1301 / 55 — file thứ
56 chính là cửa gác mới).

### Yêu cầu

> "bạn hãy rà cho tôi" → báo cáo 4 phát hiện → "thực hiện tiếp 3 bước trên"

Ba bước đã chốt: sửa hai câu Fisher, viết lại hai mục `whenToUse` cụt, và dựng bản rà thành cửa
kiểm thường trực.

### Bản rà — thất bại trước, kết quả sau

Bản đầu có 7 phép kiểm và ra **189 báo động, trong đó dưới 5 cái là thật**. Ba phép bị vứt vì tiền
đề sai chứ không phải vì khó sửa: "mọi số trong `example.title` là giá trị đầu vào" (sai — "10
năm", "250 phiên" là bối cảnh), "đơn vị trong prose phải là đơn vị của công thức" (sai — tiêu đề mô
tả Ô NHẬP `92.000 ₫/CP`, không mô tả kết quả `lần`), "mọi số trong `note` dẫn ra được từ ví dụ"
(sai — "quy tắc 72", "ngưỡng RSI 70" là đối chiếu bên ngoài, đúng chỗ). Kèm một lỗi kỹ thuật đáng
nhớ: dải regex `[A-ZÀ-Ỹ]` trong Unicode chứa CẢ chữ thường tiếng Việt, nên "công thức đầu tiên…"
bị nuốt thành danh từ riêng.

Bản chặt lại ra **4 phát hiện thật trên 432 đoạn**:

| Chỗ                                 | Vấn đề                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `loi-suat-thuc` — howToRead và note | Gọi "công thức Fisher" như trỏ link đi nơi khác, trong khi Fisher CHÍNH LÀ công thức đang mở |
| `phi-giao-dich-ban` — whenToUse     | 39 ký tự, không nêu tình huống như 106 mục còn lại                                           |
| `hpr` — whenToUse                   | 44 ký tự, cùng bệnh                                                                          |

Và **năm phép kiểm sạch** — đáng giá không kém: không đoạn nào trùng nguyên văn giữa 108 công thức
(chỗ tôi ngờ nhất — 432 đoạn soạn liên tục mà không chép nhầm phát nào), không lời hứa "báo lỗi"
nào thiếu ca kiểm, hai câu "khớp bộ số liệu mẫu" đều khớp thật, hai câu "gấp N lần" đều đúng, và
không ngưỡng diễn giải nào ("trên 2 là tốt") nằm ngoài vùng đường quét vẽ tới được.

### Ba bước sửa

1. **Hai câu Fisher** (`performance.ts`) — bỏ cái tên đọc-như-link: "phép chia ở trên mới cho con
   số đúng" thay cho "công thức Fisher mới chính xác". Không đụng số.
2. **Hai mục `whenToUse`** viết lại theo giọng của file và tránh trùng góc với mục sát bên:
   `phi-giao-dich-ban` lấy góc "khoản thương lượng được, khác thuế và phí lưu ký" (vì `thue-ban`
   ngay dưới đã chiếm góc "số tiền thực về tài khoản"); `hpr` lấy góc "chốt lại khoản đã bán, tính
   trọn cả lãi giá lẫn cổ tức" (vì ROI ngay trên đã chiếm góc "so sánh quy mô khác nhau").
3. **`src/application/prose-audit.test.ts`** — cửa gác nội dung đầu tiên của dự án, 7 phép, 33ms,
   nằm trong `npm run check`.

### Vì sao cửa gác nằm ở tầng Application

Phép kiểm H đối chiếu prose với `@/data/samples.ts`, mà CON-02 cấm `src/core` gọi ngược lên tầng
Data. Đây là file test duy nhất KHÔNG nằm cạnh module nó kiểm — CLAUDE.md đã ghi chú.

### Cửa gác đã được thử phá

Cửa không đỏ được là cửa vô dụng, nên thử: đổi `eps: 6_050 → 6_051` trong `samples.ts`. Đỏ đúng
một ca với thông điệp chỉ thẳng chỗ — "eps-co-ban — example.note: nói khớp bộ mẫu nhưng 6.050
không có trong SAMPLE_PRESETS" — khôi phục thì xanh lại, `git diff` sạch. Phép H tồn tại đúng cho
kịch bản này: `samples.ts` là số bản thảo, CHẮC CHẮN sẽ đổi khi có số thật, và hai câu "khớp bộ số
liệu mẫu" sẽ thành lời nói dối mà không cửa nào khác đỏ.

### Đã đổi file nào

- **`src/core/formulas/performance.ts`** — hai câu Fisher.
- **`src/core/formulas/fees.ts`**, **`src/core/formulas/returns.ts`** — hai mục `whenToUse`.
- **`src/application/prose-audit.test.ts`** (mới) — 7 phép kiểm, docblock ghi cả ba phép đã thử
  rồi bỏ để không ai dựng lại.
- **`CLAUDE.md`**, **`README.md`**, **`src/core/formulas/README.md`** — ghi cửa gác mới.

### Còn lại

- [ ] Phần "432 đoạn có DẠY ĐÚNG tài chính không" — bản rà cơ học không chạm tới, vẫn cần người
      có chuyên môn đọc. Đây vẫn là việc chặn v0.1 thứ ba.
- [ ] Bảng SRS mục 3.8 ngoài repo: 94 / 13 / 107 → **95 / 13 / 108**.

---

## Đợt 4 — khép nốt bóc tách: mười công thức, không còn cái nào chờ

Trạng thái: **xong, đã kiểm đủ năm cửa**. `npm run check` xanh **1301 test / 55 file** (trước đợt
1298); `build` 119 trang; `verify:static` **24/24**; `size` **156,9 kB** — không nhúc nhích một byte
qua cả hai đợt; `check:chrome` **14/14** (thêm 4 phép kiểm).

### Yêu cầu

> "tiếp tục sửa và làm tiếp các bước như kế hoạch đã định"

Mục còn mở duy nhất làm được ngay: sáu công thức khai `waterfall`/`stackedBar` mà chưa khai chặng.
Nay **cả sáu đã khai**, tổng cộng 10 công thức bóc tách được — nhóm "chờ khai chặng" rỗng.

### Một quy luật lộ ra khi soi đủ mười cái

Đợt 3 chia mặc định theo `chartType` với lý lẽ đúng cho bốn ca đã biết. Soi nốt sáu ca còn lại thì
ranh giới ấy hoá ra **khớp trọn**, và không phải tình cờ:

| `chartType`  | Công thức                                   | Đường quét của nó                              |
| ------------ | ------------------------------------------- | ---------------------------------------------- |
| `waterfall`  | `ev`, `fcff`, `fcfe`, `ncav-tren-co-phieu`  | **đường thẳng** — hệ số góc 1, 1−t, 1, 1.000/N |
| `stackedBar` | 3 công thức vay, `wacc`, `ddm`, `thue-tncn` | đường cong, nói được điều riêng                |

Bốn cái nhóm trên là đúng loại hình mà luật `chartType: 'none'` sinh ra để loại — vẽ ra người đọc
đoán trước được. Nên chúng bày bóc tách ngay khi mở màn; sáu cái nhóm dưới giữ đường quét làm mặc
định và bóc tách đứng trong ô chọn. Con số dịch chuyển đúng như vậy: **60 đường quét + 4 bóc tách +
34 chờ chuỗi giá**, trước đợt là 63 + 1 + 34.

Người khai nhãn `chartType` từ nhánh 4 đã phân loại đúng mà chưa nói ra lý do; đợt này chỉ là đọc
lại được lý do ấy và viết nó vào ca kiểm.

### Bẫy `ncav-tren-co-phieu` — đã ghi trước ở đợt 3, và nó vỡ đúng chỗ ấy

Đây là ca DUY NHẤT trong mười cái có phép **chia** sau phép trừ. Khai thẳng hai ô nhập thì hai cột
mang `tỷ ₫` (4.800 và 2.600) trong khi kết quả mang `₫/CP` (18.644) — lệch bốn chữ số **và** lệch cả
đơn vị. Chia sẵn ở `calc` rồi mới đưa lên hình: 40.678 và 22.034 ₫/CP, hiệu đúng bằng kết quả.

Cửa gác toàn Registry dựng ở đợt 3 bắt đúng ca này ngay lượt chạy đầu — đó là lý do nó tồn tại.

### Mười khai báo

| Công thức            | Chặng                                                        |
| -------------------- | ------------------------------------------------------------ |
| `wacc`               | Phần vốn chủ + Phần nợ vay — đúng hai vế của chính công thức |
| `fcff`               | EBIT sau thuế + Khấu hao − Chi đầu tư − Tăng VLĐ ròng        |
| `fcfe`               | FCFF − Lãi vay sau thuế + Vay ròng mới                       |
| `ddm-hai-giai-doan`  | Cổ tức giai đoạn đầu + Giá trị cuối kỳ                       |
| `ncav-tren-co-phieu` | TSNH mỗi CP − Trừ nợ mỗi CP                                  |
| `thue-tncn-dau-tu`   | Thuế chuyển nhượng + Thuế cổ tức — `extras` đã có sẵn        |

Bốn cái còn lại (`ev`, ba công thức vay) khai ở hai đợt trước.

Chỗ `fcff` đáng ghi: `nwcChange` âm nghĩa là vốn lưu động GIẢM, tức giải phóng tiền. Dấu `-1` biến
nó thành cột cộng — đúng cả về toán lẫn về nghĩa, tiền quay về doanh nghiệp thật.

### Đã đổi file nào

**Domain**: `formulas/valuation-dcf.ts` (4 khai báo, `extras` cho `wacc`/`fcff`/`fcfe`/`ddm`) ·
`formulas/valuation-multiples.ts` (`ncav`, chia sẵn theo cổ phiếu) · `formulas/planning.ts`
(`thue-tncn-dau-tu`, chỉ khai báo).

**Công cụ**: `scripts/chrome-check.mjs` — thêm trang `fcff` và 4 phép kiểm.

### Kiểm chứng

**+3 ca vitest**, tất cả nhắm vào chỗ có thể sai âm thầm:

- `ncav`: chặng là số **trên mỗi cổ phiếu**, kèm một khẳng định phủ định — cột đầu **không** được
  gần 4.800, tức không được là con số thô của ô nhập;
- `ddm`: giá trị cuối kỳ chiếm **73,3%** định giá. Tôi viết ca này với ngưỡng "gấp hơn ba lần" và
  **nó đỏ** — tỷ lệ thật là 2,74 lần. Sửa ngưỡng theo số đo chứ không sửa cho vừa: hơn 70%, và chốt
  đúng 0,733. Điều đáng nói của hình vẫn nguyên — gần ba phần tư định giá đến từ một con số `g2`;
- `fcff`: bốn chặng, đúng hai chặng âm, và mặc định bày bóc tách mà không cần truyền `sweepKey`.

Cửa gác toàn Registry tự phủ sáu công thức mới: chốt danh sách 10 id, rồi so tổng chặng với kết quả
theo **sai số tương đối** — các con số ở đây chạy từ 11.500 tỷ ₫ tới 8,6% nên không so tuyệt đối
được.

**+4 phép kiểm Chrome** trên trang `fcff`, hình nhiều chặng nhất:

- bày thác nước ngay khi mở màn, 5 cột, không phải bấm ô chọn;
- nhãn bốn chặng không tràn — mép trái gần nhất **30,4** trên lề 96;
- hình cao **164** đơn vị so với 112 của hình ba chặng, mà trang vẫn không tràn ngang. Đây là chỗ
  đóng nốt lo ngại "chiều cao chạy theo số chặng" ghi từ đợt 2;
- console sạch.

### Còn lại

- [ ] **Nhánh 4 đã đóng phần bóc tách.** Việc còn của nhánh: nhiều đường trên một hình cho nhóm chỉ
      báo kỹ thuật (chưa có gói WBS).
- [ ] **Ảnh WF-04 hi-fi** — chưa có, khối chuỗi vẫn mang kiểu dáng tự dựng.
- [ ] Bảng SRS mục 3.8 ngoài repo: 94 / 13 / 107 → **95 / 13 / 108**.

---

## Chuỗi định giá chạy thật — gói 5.2.3 và màn WF-04 (gói 3.2.2)

Trạng thái: **code xong, cửa gác build đã chạy ở mục "Đợt 1 của kế hoạch" ngay trên**
(`npm run check` xanh **1270 test / 55 file** tại thời điểm đợt; build/verify/size đo sau đó
cùng ba vết vá của đợt 1).

### Yêu cầu

> "thực hiện 1 cho tôi" — mục 1 của danh sách việc còn lại: gói 5.2.3 + 3.2.2.

Ba điều chủ dự án chốt trước khi tôi viết dòng nào:

1. **Giữ đúng 107 công thức** — nối chuỗi bằng công thức sẵn có, không thêm cái nào.
2. **WF-04 là một khối trong màn chi tiết**, không phải route riêng.
3. **Hỏi lại trước khi dừng dev server** để chạy build.

### Hiện trạng đo được trước khi làm — và nó đổi phạm vi

Rà bằng 6 agent song song rồi tổng hợp, mọi con số dưới đây đều kiểm tay lại:

| Thứ                               | Sổ sách đang ghi                | Đo lại được                                                                                      |
| --------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| Mắt xích của chuỗi định giá       | "cần làm cả chuỗi"              | CAPM · WACC · FCFF · FCFE · Biên an toàn **đã có**                                               |
| Cạnh `dependsOn`                  | "khai ở hai chỗ"                | đúng 2, và cả hai **rời nhau**, không thành chuỗi                                                |
| Chỗ trống trong nhóm              | "nhóm Định giá đã đầy 18/18"    | **cả 12 nhóm đều đầy** — không nhóm nào còn chỗ                                                  |
| Cửa chặn khi vượt `expectedCount` | "Registry validator chặn build" | thật ra là `formulas.test.ts` + `registry.test.ts` (ghi cứng 94/13/107); validator chỉ `warning` |

Thứ thiếu **không phải cả chuỗi mà đúng một mắt xích**: "giá trị nội tại chiết khấu từ FCFF".
Thiếu nó thì WACC, FCFF, FCFE là ba ngọn cụt — không ai tiêu thụ kết quả của chúng.

**Không nối tạm bằng công thức sẵn có.** Đã soi hai ứng viên và loại cả hai vì lý do tài chính chứ
không phải kỹ thuật: `ev` là EV **kế toán** (vốn hoá + nợ − tiền mặt), đi từ thị giá chứ không ăn
dòng tiền; `gia-tri-hien-tai` là PV của **một khoản đơn**, không có giá trị cuối kỳ. Nối vào thì
validator vẫn cho qua — cạnh trỏ đúng id, đúng key — và sản phẩm sẽ dạy sai người dùng.

Nên chuỗi của đợt này là **CAPM → Mô hình Gordon → Biên an toàn**: ba công thức đã có, đơn vị khớp
tuyệt đối ở cả hai cạnh, thẳng một mạch nên dải luồng vẽ đúng, và đủ để FR-15 chạy trọn vẹn.

### Vì sao KHÔNG sửa `runFormula()` — chỗ suýt sai nặng nhất

`runFormula()` chặn ô thiếu bằng `INCOMPLETE_INPUT` **trước** khi gọi hàm tính. Nếu chuỗi cứ để ô
móc nối trống rồi gọi thẳng vào đó, người dùng nhận **"Còn thiếu: Suất sinh lợi yêu cầu (r)"** cho
một ô họ không hề bỏ trống — sai nguyên nhân, ngược NFR-USA-04, và ngược đúng lời hứa của WF-15.

Đường sửa hiển nhiên là nới cổng chung ấy. Nhưng cổng chung là đường đi của **cả 107 công thức**, và
nó đang gánh ba con số khoá cứng ở `calc.test.ts` cùng hàm `needsPriceSeries()`. Nên mạch bị cắt ở
**lớp trên**: thượng nguồn lỗi thì `runChain()` trả `inherited()` ngay, không gọi `runFormula()`
lượt đó. `run.ts`, `calc-output.ts`, `types.ts` không phải sửa một dòng nào.

### Hai loại cảnh báo, cố ý khác nhau

Repo đang có hai chính sách trái nhau về mã cảnh báo khi kế thừa. Đợt này chốt lại, và chốt là
**cả hai đều đúng, ở hai chỗ khác nhau**:

- **Ô nhập** giữ nguyên mã GỐC của thượng nguồn (`resolveLinked()` lo) — nó trả lời "vì sao ô này
  chưa có số", mà nguyên nhân thật là CAPM đang `MEANINGLESS`, không phải "kế thừa".
- **Kết quả bước dưới** dùng `INHERITED` (`inherited()` lo) — nó trả lời "vì sao bước này chưa ra
  số", và câu đúng là "vì bước trước đang lỗi".

Màn hình hiện cả hai; chúng bổ sung nhau chứ không chồng nhau.

### Đã đổi file nào

**Tầng Domain**

- **`src/core/calc/run-chain.ts`** (mới) — `runChain()` sắp topo bằng chính `buildFlowChain()` mà
  dải luồng dùng để vẽ, nên **thứ tự tính và thứ tự bày ra không thể lệch nhau**. Đây là nơi DUY
  NHẤT gọi `inherited()` và nơi duy nhất **ghi** `ctx.upstream` — trường ấy khai từ gói 3.x mà tới
  giờ chưa ai ghi vào. Kèm `chainFor()`: lấy **tổ tiên + hậu duệ** của công thức đang xem, KHÔNG
  lấy cả thành phần liên thông — WACC và Gordon cùng nhận từ CAPM nhưng là hai nhánh song song,
  gộp vào một dải là vẽ mũi tên nói sai quan hệ.
- **`src/core/formulas/valuation-dcf.ts`** — thêm 2 cạnh: `mo-hinh-gordon.requiredReturn ← capm`
  và `bien-an-toan.intrinsic ← mo-hinh-gordon`. Chính mô tả của ô r vốn đã ghi "thường lấy từ
  CAPM"; cạnh này biến câu đọc bằng mắt ấy thành đường dẫn số liệu chạy thật.
- **`src/core/calc/index.ts`**, **`src/application/index.ts`** — mở cửa `runChain`, `chainFor` và
  5 kiểu đi kèm (CON-03).

**Hai cửa gác mới ở `formulas.test.ts`** — đây là phần tôi thấy đáng giá nhất của đợt:

- **Cạnh `dependsOn` phải nối hai đầu cùng đơn vị.** `validate.ts` đã kiểm cạnh trỏ đúng công thức
  và đúng biến, nhưng KHÔNG kiểm đơn vị. Khai `fcff ──► gia-tri-hien-tai.futureValue` thì validator
  cho qua, mà chuỗi sẽ đổ con số `300` đơn vị **tỷ ₫** vào ô đơn vị **₫** — sai 9 chữ số, không
  cảnh báo nào, không ca kiểm nào đỏ. Đúng loại lỗi FR-06 sinh ra để chặn, chỉ khác là nó ra một
  con số trông hợp lệ thay vì NaN.
- **Giá trị mặc định của thượng nguồn phải nằm trong miền của ô nhận.** Không thì người dùng gặp
  ô đỏ ngay lượt mở màn đầu tiên — cạnh khai sai chỗ chứ không phải người dùng nhập sai.

**Tầng giao diện**

- **`src/ui/result/FlowChainStrip.tsx`** — sửa luật mũi tên. Bản cũ chèn `→` giữa MỌI cặp bước liên
  tiếp; đồ thị rẽ nhánh thì hai nhánh song song nằm cạnh nhau sau khi sắp topo, và mũi tên giữa
  chúng **nói ra một quan hệ không tồn tại**. Nay chỉ vẽ mũi tên khi bước sau thật sự khai bước
  ngay trước nó; nhánh khác thì ngăn bằng dấu chấm kèm chữ cho trình đọc màn hình. Thêm prop
  `statuses` (bước nào đang gãy — nhãn CHỮ, không chỉ màu) và `column` để bản dọc ≥1024px thành
  **tuỳ chọn**: nơi gọi thật đầu tiên là màn một cột, bật dọc ở đó là dải xổ thành cột pill cao
  lêu nghêu giữa trang.
- **`src/ui/result/FlowChainStrip.test.tsx`** (mới, 8 ca) — component dựng từ đợt 5 mà **chưa có
  ca kiểm nào**, vì chưa màn nào dùng. Nay nó lên màn nên phần bất biến phải được khoá.
- **`src/ui/screens/ChainBody.tsx`** + `.module.css` (mới) — khối WF-04: dải luồng, rồi mỗi bước
  trước/sau là một thẻ gập được có ô nhập riêng và kết quả riêng. Thẻ cấp số liệu TRỰC TIẾP cho
  công thức đang xem thì **mở sẵn** (đó là thứ người ta bật Nâng cao để sửa); các thẻ khác gập lại
  nhưng dòng tóm tắt vẫn hiện kết quả.
- **`src/ui/screens/ChainPanel.tsx`** (mới) — ranh giới `next/dynamic`, khuôn bám đúng
  `FormulaChart` và `DetailBody`. Barrel chỉ xuất ranh giới này, KHÔNG xuất `ChainBody`.

**Màn chi tiết**

- **`src/app/cong-thuc/[id]/FormulaDetail.tsx`** — bốn thay đổi: hai kho state mới
  (`chainInputs` cho các bước khác, `overrides` riêng cho ô móc nối — trộn hai kho là mất phân biệt
  "chưa ghi đè" với "ghi đè đúng bằng giá trị tự động", tức nút Hoàn tác không còn gì để hoàn); ô
  nào có cạnh thì lưới ô nhập dựng `LinkedInput` **tại chỗ** thay cho `VariableField`; kết quả lấy
  từ chuỗi chứ không từ `runFormula()` đơn lẻ; và biểu đồ, khối Ví dụ, bản xuất đều chạy trên
  `effectiveInputs` (ô thường + ô móc nối đã giải) để không có hai con số cho cùng một biến.

### Vì sao 4 ca kiểm quét cả 107 màn không phải sửa một dòng

Đây là rủi ro lớn nhất mà khảo sát chỉ ra, và nó tự tan: khối chuỗi chỉ dựng khi
`mode === 'advanced'` **và** `chainFor()` trả về khác rỗng — tức 101 trên 107 công thức không có
gì, và ở chế độ Cơ bản thì **không công thức nào** có gì. Bốn ca quét ấy chạy ở chế độ mặc định,
vốn là Cơ bản. Có ca kiểm chốt thẳng điều đó, để lần sau ai đổi mặc định thì biết mình vừa đụng gì.

### Kiểm chứng

**1270 test / 55 file**, thêm 41 ca so với trước đợt:

- **20 ca** `run-chain.test.ts` — chuỗi thật trong Registry (thứ tự topo, số chảy đúng, lỗi lan
  hai tầng, ghi đè thắng cả khi thượng nguồn lỗi, ghi đè bằng 0 vẫn là ghi đè, giá trị ngoài miền
  KHÔNG bị kẹp) cộng fixture tự dựng cho đồ thị vòng, `ctx.upstream`, chuỗi rỗng.
- **8 ca** `FlowChainStrip.test.tsx`.
- **8 ca** WF-04 trên màn thật — trong đó ca nặng nhất: **sửa beta ở thẻ CAPM thì kết quả của
  Gordon đổi theo**, và **thượng nguồn lỗi thì màn nói "Cảnh báo kế thừa" chứ không nói "Còn
  thiếu"**. Ca sau là ca chống hồi quy quan trọng nhất của cả gói.
- **2 ca** cửa gác đơn vị và miền giá trị, cộng 3 ca lẻ.

Con số kỳ vọng tính tay bằng dạng đóng trước khi viết: CAPM 3,5 + 1,2 × 8 = 13,1% → Gordon
2.000 × 1,05 ÷ 0,081 = 25.925,93 ₫ → Biên an toàn (25.925,93 − 30.000) ÷ 25.925,93 = −15,71%.

### Còn lại

- [x] **`npm run build` → `verify:static` → `size`** — làm ở mục "Đợt 1 của kế hoạch" phía trên.
      Suy luận được thay bằng số đo: 155,9 kB / 170 kB, `ChainBody` nạp trễ thuần; riêng
      `LinkedInput` + `FlowChainStrip` nằm trong chunk chung của 107 trang chi tiết (không phải
      chỉ 6 trang như suy luận cũ) nhưng tổng không tăng nên giữ nguyên.
- [ ] **Mắt xích "giá trị nội tại chiết khấu từ FCFF"** — chủ dự án ĐÃ chốt nâng 107 → 108,
      xếp vào đợt 2 của kế hoạch. Giá mục tiêu KHÔNG làm: không có cạnh `dependsOn` hợp lệ nào
      (P/E hiện tại ≠ P/E mục tiêu), nó là công thức độc lập, tách khỏi mọi đợt chuỗi.
- [ ] **Chưa kiểm trên Chrome thật.** Toàn bộ đợt này kiểm bằng jsdom. Ba thứ jsdom không nói được:
      thẻ `<details>` bấm mở/gập có mượt không, dải luồng cuộn ngang ở 360px, và vùng chạm của nút
      Ghi đè / Hoàn tác khi hai nút đứng cạnh nhau.
- [ ] **`LinkedInput` luôn dựng `NumberInput`** kể cả khi biến khai `type: 'slider'` — ô "Suất sinh
      lợi yêu cầu" ở chế độ Nâng cao thành ô số thay vì thanh trượt. Chấp nhận được vì wireframe
      WF-04 vẽ ô ấy là giá trị chữ kèm nút Ghi đè, nhưng nếu chủ dự án muốn giữ thanh trượt thì
      phải cho `LinkedInput` đi qua `VariableField`.

---

## Kiểm tra lỗi toàn dự án — và ba điểm dọn ngay

### Yêu cầu

> "kiểm tra lỗi của dự án" → "những lỗi nào có thể sửa được nhanh thì bắt đầu sửa cho tôi"

### Chuỗi kiểm tra chạy được: xanh hết

`typecheck`, `lint` (0 warning), `format:check`, và **1224 test / 53 file** đều qua trước khi
đụng vào gì. Không có lỗi nào ở chuỗi kiểm tra tĩnh.

### Lỗ hổng lớn nhất KHÔNG phải bug code — đã đóng

`npm run build` **chưa chạy lần nào kể từ khi thêm KaTeX**. `out/` còn là bản dựng 08/08, và đọc
thẳng `out/cong-thuc/pe/index.html` thì **không có `<math`**. Nghĩa là ba check KaTeX của
`verify-static.mjs` chưa bao giờ chạy thật, mà theo đúng chú thích trong chính file đó, chúng là
**phép kiểm duy nhất** phân biệt được dựng-lúc-build với dựng-lúc-chạy — unit test jsdom thì
`<math>` nào cũng có. Toàn bộ lý lẽ "0 byte KaTeX phía máy khách" của gói 2.4.3 khi ấy chưa có gì
chứng thực.

Cửa gác `check-no-dev.mjs` chặn build vì dev server còn sống từ hôm trước (PID 22712, cổng 3000).
**Không dùng `FFB_ALLOW_BUILD_WITH_DEV=1`** — chính cửa gác nói cách đó làm hỏng hẳn dev server
đang chạy và nó không tự hồi phục. Dừng đúng PID đó rồi build.

Kết quả, đo thật:

| Phép kiểm       | Kết quả                                      |
| --------------- | -------------------------------------------- |
| `build`         | Đạt — 118 trang tĩnh, 0 lỗi                  |
| `verify:static` | Đạt — **22/22**, gồm cả ba check KaTeX       |
| `size`          | Đạt — **156,0 kB** JS nén, cửa kiểm 170,0 kB |

Gói 2.4.3 giờ đã được chứng thực đúng thứ nó tự nhận: MathML nằm sẵn trong HTML tĩnh, không kèm
`katex.min.css`, không file font nào.

**Cẩn thận với con số của `next build`**: nó báo `/cong-thuc/[id]` là 215 kB "First Load JS", trông
như vượt cửa. Đó là số **thô**; NFR-PER-04 đo JS **đã nén**, và `size-report.mjs` đo đúng thứ đó.
Dư địa còn 14 kB, không rộng.

### Đã đổi file nào — ba điểm sửa nhanh

- **`scripts/verify-static.mjs`** — check "không nạp katex.min.css hay font của KaTeX" thiếu guard
  `detailHtml !== ''`. Thiếu file `out/cong-thuc/pe/index.html` thì `catch` nuốt lỗi, `detailHtml`
  thành chuỗi rỗng và check **pass giả**. Hai check anh em cùng khối làm đúng; chỉ mình nó lệch.
- **`package.json`** + **`package-lock.json`** — `katex` từ `^0.18.4` về **`0.18.4`**. Nó là
  dependency DUY NHẤT của repo dùng caret; `next`, `react`, `react-dom` và cả 15 devDependency đều
  ghim cứng. Riêng gói này lý lẽ đứng trên số đo thật của đúng bản 0.18.4 (bảng đo ở mục dưới) và
  trên cấu trúc markup mà CSS đang bám vào, nên caret là chỗ để một bản minor đổi cả hai thứ đó mà
  không ai biết. Sửa cả lock để `npm ci` không lệch.
- **`src/app/cong-thuc/[id]/latex-html.test.ts`** — thêm ca kiểm chốt lớp bọc `class="katex"` CÓ
  MẶT. `FormulaDetail.module.css` nâng cỡ chữ bằng `.formula :global(.katex)`, tức bám vào class do
  KaTeX sinh, mà các ca cũ chỉ chốt sự VẮNG MẶT của `katex-html`. Bản KaTeX sau bỏ lớp bọc ấy là cỡ
  chữ tụt lặng lẽ, cả bộ test vẫn xanh. Đã render thật bằng 0.18.4 để xác nhận lớp bọc đang có.

Sau khi sửa: `npm run check` xanh, **1225 test**.

### Đã soi và KHÔNG phải lỗi — ghi lại để khỏi ai soi lại

- **`ChartFullscreen.tsx` không lùi nhầm một bước lịch sử.** Hàm dọn chỉ gọi `history.back()` khi
  cả `mine` lẫn `marked` đúng, mà `marked` đọc lại `history.state` ngay lúc dọn. Điều hướng thật
  (`Link` / `router.push`) thay `history.state` nên `marked` thành false → không lùi thêm.
- **`package-lock.json` bỏ caret ở 5 devDeps không phải drift** — `package.json` vốn đã ghim cứng
  từ trước, lock cũ mới là bản lệch, và `npm install katex` đồng bộ lại nó.
- **Không drift `gen:summaries`** — `summaries.test.ts` đối chiếu file sinh mỗi lần chạy test.
- **`detail.latexPending` gỡ sạch**, **"Falculator" không còn trong mã nguồn**, **KaTeX không lọt
  vào client bundle** (chỉ `page.tsx` server component và file test import nó), **`src/ui/charts/`
  không còn lời gọi `useId()` nào** — mọi chỗ còn chữ đó đều là chú thích.

### Còn lại

- [x] Chạy `npm run build` → `npm run verify:static` → `npm run size` — xong, kết quả ở bảng trên.
- [ ] `next lint` in cảnh báo deprecation (Next 16 sẽ gỡ). Chủ dự án chốt **để nguyên bây giờ**:
      chưa gãy, lint vẫn 0 warning, mà chuyển đổi đụng cả hàng rào ranh giới tầng CON-02/CON-03.
- [ ] `.claude/settings.json` (+23 allow rule) đang nằm chung working tree với ba chủ đề code —
      nên tách khỏi commit code.
- [ ] Dev server đã bị dừng để build (PID 22712). Bật lại bằng `npm run dev` khi cần.

---

## Gõ tới đâu, kết quả tới đó — và gõ liền tay không còn khựng

### Yêu cầu

> "mỗi khi nhập thông số vào các ô ví dụ như số liệu trong phần công thức thì đang trong quá trình
> nhập thì phần kết quả cần thay đổi luôn. nâng cấp cần có trải nghiệm mượt hơn và không được đơ"

### Lỗi gốc — một dòng, và nó có chủ đích từ đầu

`NumberInput` chỉ gọi `onChange` ở `onBlur`. Nghĩa là gõ xong cả một con số mà khối Kết quả vẫn
đứng im cho tới khi người dùng bấm ra chỗ khác — đúng triệu chứng "đơ" họ mô tả, dù không có gì
chậm cả. `InlineNumber` (ô số cạnh thanh trượt và ô của khối Ví dụ thực tế) cùng lỗi, và docblock
của nó ghi rõ nó phải cư xử **giống hệt** `NumberInput`, nên phải sửa cả hai.

Vì sao nó thành ra như vậy: quy tắc "không kẹp giá trị trong lúc gõ" của WF-16 bị hiểu rộng thành
"không báo gì lên trong lúc gõ". Hai chuyện khác nhau — một đằng là ĐỔI thứ người dùng đang gõ
dưới tay họ, một đằng là cho phần còn lại của màn biết họ đang gõ gì. Nay mỗi phím đều đẩy giá trị
**thô, chưa kẹp** lên; việc kẹp vẫn để dành cho lúc chốt qua `commitValue()`.

Chuỗi chưa ra số (`''`, `'-'`, `'1,'`) thì bỏ qua lượt đó chứ không đẩy `null` lên — nơi nhận chỉ
biết nhận số, đẩy lên là buộc phải quy thành 0 hoặc NaN, đúng hai thứ FR-06 cấm.

### Rồi mới tới phần "mượt" — và đo trước khi tối ưu

Cho kết quả chạy theo từng phím nghĩa là mỗi phím gõ là một lượt dựng lại cả màn. Đo chi phí thật:

|                          | `runFormula` | `buildChartModel`       |
| ------------------------ | ------------ | ----------------------- |
| `gia-von-trung-binh-dca` | 0,001 ms     | — (`chartType: 'none'`) |
| `pe`                     | 0,000 ms     | **7,5 ms**              |
| `lich-tra-no`            | 0,016 ms     | **11,3 ms**             |
| `wacc`                   | 0,001 ms     | **15,6 ms**             |

Kết quả rẻ tới mức không đáng bàn. **Biểu đồ mới là chỗ nghẽn**: 15,6 ms đã nuốt trọn một khung
hình 60 Hz, chưa tính phần React dựng lại vài trăm thẻ SVG. (Ghi chú: mục "Đợt 2 của biểu đồ" từng
ghi 1,76 ms — đó là đường theo thời gian, không phải đường quét độ nhạy.)

### Phép đo đầu tiên của tôi SAI, và nó suýt dẫn tới kết luận ngược

Bản đo đầu gõ từng phím rồi chờ một khung đôi (~32 ms) mới gõ tiếp. Kết quả: bỏ `useDeferredValue`
đi còn **nhanh hơn** (p50 26 ms so với 31 ms). Lý do: 32 ms còn dài hơn cả một lượt dựng biểu đồ,
nên chẳng có gì để hoãn — phép đo không bao giờ chạm tới chỗ nghẽn, và phần hoãn chỉ tổ thêm một
lượt dựng.

Phải đo đúng cảnh người dùng kêu: **gõ liền tay**, phím nối phím, 14 phím trong ~220 ms. Lúc đó
mới thấy long task 416 ms.

### Kết quả A/B trên Chrome thật (lái qua CDP, trang `/cong-thuc/wacc/`)

|                             | thời gian CHẶN                       | trễ ký tự p50 |
| --------------------------- | ------------------------------------ | ------------- |
| Trước — không hoãn          | 366 · 382 · 389 ms                   | 210–225 ms    |
| Sau — có `useDeferredValue` | 107 · 117 · 142 · 146 · 163 · 200 ms | 100–103 ms    |

**Chặn giảm ~62%, trễ ký tự giảm ~55%.** Số đo trên bản dev; bản build thật sẽ nhanh hơn nữa.

### Một tối ưu bị BỎ vì không chứng minh được

Đã thử `memo` cho ba khối tĩnh của màn (`VariableTable`, `SourceBlock`, `ExplanationAccordion`) —
prop của chúng không đổi theo phím gõ nên trên lý thuyết phải bớt được một mớ việc. Đo 3 lượt mỗi
bên: **không memo 107–200 ms, có memo 117–146 ms** — hai dải chồng nhau, tức nằm trong nhiễu đo.
Đã gỡ bỏ. Không giữ lại thứ chỉ nghe hợp lý mà số không đỡ được.

`memo` ở `FormulaChart` thì GIỮ, và nó là chuyện khác: nó không phải tối ưu suy đoán mà là vế thứ
hai của chính `useDeferredValue`. Thiếu nó thì ở lượt dựng gấp React vẫn đi xuống cả cây biểu đồ
(`buildChartModel` được `useMemo` đỡ, nhưng phần đối chiếu vài trăm thẻ SVG thì không) — tức phần
hoãn mất phân nửa tác dụng.

### Vì sao KHÔNG debounce

Debounce làm chậm mọi thứ đi một khoảng cố định do mình đoán, kể cả khi máy thừa sức vẽ kịp.
`useDeferredValue` để React tự đo: máy khoẻ thì biểu đồ theo kịp gần như tức thì, máy yếu thì tự
giãn ra, và lượt vẽ đang dở bị NGẮT khi người dùng gõ tiếp. Không có con số ma nào phải chỉnh.

### Đã đổi file nào

- **`src/ui/inputs/NumberInput.tsx`** — đẩy giá trị lên theo từng phím.
- **`src/ui/inputs/InlineNumber.tsx`** — cùng thay đổi, giữ hai ô cư xử giống nhau.
- **`src/app/cong-thuc/[id]/FormulaDetail.tsx`** — `useDeferredValue` cho `inputs` của biểu đồ,
  kèm `chartOutput` tính theo đúng bản hoãn ấy (đưa kết quả MỚI kèm số liệu CŨ vào cùng một lượt
  dựng là biểu đồ vẽ một đằng còn câu mô tả nói một nẻo).
- **`src/ui/charts/FormulaChart.tsx`** — `memo`, xem trên.

### Kiểm chứng

`npm run check` xanh: **1229 test / 53 file** (trước 1224). Năm ca mới:

- 3 ca ở `NumberInput.test.tsx` — gõ `'123'` thì nhận đủ ba mốc `[1, 12, 123]` (chứng minh từng
  phím, không phải một phát ở cuối) · đẩy giá trị THÔ chưa kẹp · chuỗi chưa ra số thì KHÔNG báo lên.
- 1 ca ở `FormulaDetail.test.tsx` — gõ mà **không rời ô** thì kết quả đã đổi. Ca cũ có
  `userEvent.tab()` ở cuối nên nó không phân biệt được "đổi theo từng phím" với "chỉ đổi lúc chốt";
  ca mới bỏ hẳn cú `tab` đó, và đấy là toàn bộ điểm của nó.
- 1 ca siết ca cũ: `toHaveBeenLastCalledWith(0)` thay cho `toHaveBeenCalledWith(0)`, để việc kẹp
  lúc chốt vẫn được chốt đúng là lượt CUỐI.

### Còn lại

- [ ] Đo lại trên bản build thật — mọi số ở trên là bản dev, vốn chậm hơn hẳn. Vẫn chờ tắt dev
      server ở cổng 3000.
- [ ] Trang không có biểu đồ (`gia-von-trung-binh-dca`, đúng trang trong ảnh chủ dự án gửi) vẫn
      chặn ~140 ms khi gõ liền 14 phím. Phần này KHÔNG phải biểu đồ; chưa truy ra chỗ tốn. Ở tốc độ
      gõ của người thật (~8–10 phím/giây) thì đo được **0 long task**, nên chưa xếp là lỗi.

---

## Ký hiệu toán học — gói 2.4.3, hoãn từ đợt 5

### Yêu cầu

> "bắt đầu làm tiếp dự án được rồi chứ"

Hướng đã chốt ở đợt trước: KaTeX render **lúc build**, không tốn byte JS nào phía máy khách.

### Đo trước khi viết dòng nào — và số đo đổi luôn cấu hình

Trường `latex` có ở cả 107 spec từ đợt 1 nhưng **chưa bao giờ được đưa qua một bộ dựng nào**, nên
việc đầu tiên là chạy thử cả 107 chuỗi qua KaTeX ở ba chế độ output:

| Chế độ          | 107 CT thô | nén     | Tài sản kèm theo          | Chữ Việt có dấu  |
| --------------- | ---------- | ------- | ------------------------- | ---------------- |
| `htmlAndMathml` | 414,9 kB   | 20,1 kB | +23 kB CSS, ~20 file font | **hỏng metric**  |
| `html`          | 358,2 kB   | 12,7 kB | +23 kB CSS, ~20 file font | **hỏng metric**  |
| `mathml`        | 55,9 kB    | 6,0 kB  | **không gì cả**           | sạch, 0 cảnh báo |

**0 lỗi dựng** trên cả 107 chuỗi — không có chuỗi latex hỏng nào nằm sẵn trong metadata.

Dung lượng đã đủ để chọn `mathml`, nhưng thứ thật sự LOẠI hai chế độ kia là cột cuối. Công thức
của dự án viết bằng chữ tiếng Việt trong `\text{}` — `\text{Vốn chủ sở hữu}`,
`\text{Số CP lưu hành}`. Bộ dựng HTML của KaTeX không có số đo bề rộng cho ký tự có dấu tiếng Việt
(hàng trăm dòng `No character metrics for 'ổ' in style 'Main-Regular'`) và font `KaTeX_Main` cũng
không chứa những glyph ấy. Nhánh MathML không cần metric: trình duyệt tự dàn trang bằng font của
chính trang.

Nói cách khác: cấu hình mặc định của KaTeX là cấu hình sai cho dự án này, và chỉ có đo trên chính
dữ liệu của dự án mới thấy. Mỗi trang chỉ mang MỘT công thức nên chi phí thật là **294–1326 B thô
(~229–452 B nén)**, không phải con số tổng ở bảng trên.

### Một nghi ngờ sai, ghi lại để khỏi ai nghi lại

Markup của `roe` cho thấy KaTeX bẻ chữ "ố" thành `<mover>` chồng hai dấu trên "o", trong khi "ủ ở
ữ" cùng câu thì giữ nguyên. Nghi chuỗi nguồn lẫn hai dạng chuẩn hoá Unicode — **sai**: kiểm cả 107
chuỗi `latex`, `name.vi` và `expression`, không chuỗi nào lệch NFC, và "ố" là U+1ED1 một mã điểm.
Đó là bảng dựng sẵn của chính KaTeX. Chụp màn bằng Chrome thật: hiện ra **đúng y chữ "ố"**, không
phải xử lý gì.

### Đã đổi file nào — gói 2.4.3

- **`src/app/cong-thuc/[id]/latex-html.ts`** (mới) — `latexToMathml()`. Docblock ghi trọn bảng đo
  ở trên và bất biến "chỉ server component được import".
- **`src/app/cong-thuc/[id]/page.tsx`** — dựng ký hiệu rồi truyền xuống qua prop. Đây là server
  component, cùng lý do đã ghi cho `AS_OF`: `katex` nặng ~280 kB, vào gói trình duyệt là vượt cửa
  kiểm 170 kB ngay.
- **`src/app/cong-thuc/[id]/FormulaDetail.tsx`** — khối 3 dựng MathML bằng
  `dangerouslySetInnerHTML`, bỏ câu chờ. **Giữ lại bản dạng chữ** bên dưới: nó nói cùng công thức
  bằng tên đầy đủ tiếng Việt, thứ ký hiệu viết tắt không nói — và là lối đọc còn lại nếu trình
  duyệt quá cũ không dựng được MathML.
- **`src/app/cong-thuc/[id]/FormulaDetail.module.css`** — `.formula`, cuộn ngang riêng cho công
  thức dài (DDM hai giai đoạn, Sortino).
- **`src/application/i18n/vi.ts`** — xoá `detail.latexPending`. Ca kiểm khoá mồ côi của đợt 13 sẽ
  đỏ nếu để lại.
- **`scripts/verify-static.mjs`** — 14 → **17 check**.
- **`package.json`** — `katex` vào `dependencies`, không phải `devDependencies`: `page.tsx` import
  nó nên nó là đầu vào để BUILD được ứng dụng. Cloudflare Pages cài `devDependencies` hay không là
  chuyện của cấu hình, không nên phụ thuộc vào.

### Vì sao ba check mới nằm ở `verify-static` chứ không ở vitest

Cả gói này đứng trên một tính chất: ký hiệu được nướng vào HTML **lúc build**. Tính chất ấy vô hình
với unit test — jsdom dựng component thì `<math>` nào cũng có, kể cả khi nó do JS máy khách sinh ra
lúc chạy. Chỉ đọc thẳng `out/cong-thuc/pe/index.html` mới phân biệt được hai chuyện đó.

Ngày ai đó chuyển `latexToMathml()` vào một client component, 1224 ca vitest vẫn xanh và chỉ ba
check này đỏ. Hai check kia chốt hệ quả của việc chọn `mathml`: không có `katex-html`, không nạp
`katex.min.css` lẫn font `KaTeX_Main` — chốt hệ quả nên vẫn đúng kể cả khi KaTeX đổi tên tuỳ chọn.

### Ca kiểm dựng bằng hàm THẬT, không bằng chuỗi giả

45 chỗ dựng màn trong `FormulaDetail.test.tsx` nay đi qua một wrapper `Man` gọi chính
`latexToMathml()`. Nếu đưa `latexHtml="<math/>"` viết tay thì ca kiểm chỉ chứng minh component in
ra cái nó được đưa; đi qua hàm thật thì **mỗi ca dùng `Man` là một lượt kiểm KaTeX kèm theo, miễn
phí**.

### Kiểm chứng — gói 2.4.3

`npm run check` xanh: **1224 test / 53 file** (trước gói này 1219). Sáu ca mới: 4 ca ở
`latex-html.test.ts` (cả 107 công thức dựng được · latex hỏng thì NÉM chứ không trả khối chữ đỏ ·
chỉ ra MathML · giữ nguyên chữ Việt có dấu) và 2 ca ở màn chi tiết (khối Công thức có `<math>` và
hết câu chờ · bản dạng chữ vẫn còn bên cạnh).

Chụp màn bằng Chrome thật trên 8 công thức nặng chữ Việt (`roe`, `eps-co-ban`, `atr-dao-dong-thuc`,
`ddm-hai-giai-doan`, `ty-so-sortino`, `thanh-toan-nhanh`, `gia-hoa-von`): phân số, Σ, căn bậc hai,
chỉ số dưới, `max(...)` đều dựng đúng, **không nạp một byte CSS hay font nào của KaTeX**.

### Còn lại

- [ ] `npm run build && npm run verify:static && npm run size` — vẫn chờ tắt dev server ở cổng 3000. Đây là chỗ chốt hai điều chưa chứng minh được: ba check mới đạt, và **First Load JS
      không đổi** so với mốc 148,7 kB (bằng chứng `katex` không lọt vào gói máy khách).
- [ ] Trình duyệt không dựng được MathML (Chrome dưới 109, ra 2023) sẽ hiện ký hiệu thành chữ
      chạy liền. Bản dạng chữ ngay dưới vẫn đọc được nên không phải ngõ cụt, nhưng chưa đo trên
      máy thật xem nó xấu tới đâu.

---

## Đợt đóng đuôi — hai lỗi thật, và sổ sách thôi nói sai về chính mình

### Yêu cầu

> "phân tích bước tiếp theo cần làm"

Rà lại toàn bộ trạng thái trước khi chọn việc. Kết quả rà làm đổi hẳn thứ tự ưu tiên, nên ghi lại
phần đo trước.

### Phần lớn "việc còn lại" trong file này đã xong mà chưa ai gạch

| Thứ                | Sổ sách đang ghi                      | Đo lại được                                        |
| ------------------ | ------------------------------------- | -------------------------------------------------- |
| Công thức          | `CLAUDE.md`: "21 of 107"              | **107/107**, đủ `expectedCount` cả 12 nhóm         |
| Nhánh 4 biểu đồ    | `README.md`: "đang chừa sẵn chỗ"      | **Xong**, phủ 97/107, có cả phóng to toàn màn hình |
| Cờ `isDraft`       | đợt 14 xếp vào "còn lại"              | **Đã nối** tới Danh mục, bảng dữ liệu, bản xuất    |
| Biểu tượng PWA PNG | đợt 12–13 xếp vào "còn thiếu"         | **Đã có**, sinh bằng `scripts/gen-icons.mjs`       |
| 5 ca đỏ baseline   | `VIRTUALIZE_THRESHOLD` chờ quyết định | **Đã sửa** — cả bộ 1210 test xanh trước đợt này    |

`CLAUDE.md` là file nạp vào đầu **mọi** phiên Claude sau này, và nó sai ở đúng con số nặng nhất
của repo. Một phiên tin nó sẽ đi hiện thực "công thức thứ 22". Đó là lý do phần đồng bộ tài liệu
nằm trong đợt này chứ không để sau.

### Đã đổi file nào — đợt này

**Lỗi 1: lệch hydration ở cây biểu đồ** (giả lập Android đo được 5 lượt / 2 loại mỗi trang có
biểu đồ; trang `chartType: 'none'` thì 0).

- **`src/ui/charts/ChartBody.tsx`** — sinh `idBase = 'chart-' + formula.spec.id`, truyền xuống cả
  ba component con. Bản phóng to nhận `${idBase}-full`. Ô chọn trục X đổi từ **một biến giữ
  element** sang **một hàm dựng** (`pickerVoi`): nó được dựng ở hai chỗ, mà `id` hai chỗ phải khác
  nhau, còn dùng chung một element thì ô chọn trong màn phóng to mất nhãn.
- **`src/ui/charts/ChartFrame.tsx`**, **`LineChart.tsx`**, **`ChartFullscreen.tsx`** — bỏ `useId()`,
  nhận `idBase` làm prop bắt buộc.
- **`src/ui/charts/SweepPicker.tsx`** — truyền `id` tường minh xuống `Select`. Chỗ này **không nằm
  trong chẩn đoán ban đầu**; xem mục dưới.

**Lỗi 2: nút Back của Android xoá cả trang khi đang phóng to biểu đồ.**

- **`src/ui/charts/ChartFullscreen.tsx`** — mở lớp phủ thì `history.pushState`, nghe `popstate` để
  đóng, đóng bằng nút X hay Esc thì `history.back()` tự gỡ mục đã đẩy.

**Đồng bộ sổ sách:**

- **`CLAUDE.md`** — 107/107, nhánh 4 xong, danh sách lệnh đủ 14 script, sửa câu sai về môi trường
  test, ghi rõ FR-15 chưa chạy và bốn module đang chờ nó, thêm bất biến "không `useId()` trong
  `src/ui/charts`".
- **`README.md`** — mục "Việc tiếp theo theo WBS" viết lại theo hiện trạng.
- **`src/ui/README.md`** — bỏ nhánh 4 khỏi mục "Sắp tới".
- **`src/core/formulas/README.md`** — mục "Còn thiếu": ghi đúng lý do Beta kẹt.
- **`src/core/formulas/risk-ratios.ts`** — mô tả ô beta của `ty-so-treynor` thôi bảo người dùng
  "lấy từ công thức Beta". Công thức đó không tồn tại, nên câu cũ chỉ người dùng đi tìm hư không.

### Ba quyết định đáng ghi lại

**1. Vì sao KHÔNG dùng `{ ssr: false }`** — cách một dòng, diệt cả lớp lỗi hydration. Nó kéo câu
mô tả `<figcaption>` và **toàn bộ bảng số `<details>`** ra khỏi HTML tĩnh của 97 trang chi tiết.
Bảng đó là thứ `ChartFrame` tự gọi là "hợp đồng CÔNG KHAI với người dùng", và là phần biểu đồ duy
nhất Google đọc được. `verify:static` cũng **không** bắt được mất mát ấy — nó kiểm trang chủ, số
link ở trang danh sách và nút quay lại, không kiểm markup biểu đồ. Một hồi quy nội dung im lặng,
đúng loại thất bại mà script kia sinh ra để chặn. Cách đã chọn tốn 0 byte và không đụng ranh giới
nạp trễ.

**2. `formula.spec.id` an toàn làm gốc id** vì nó chính là đoạn URL, Registry đã kiểm trùng, và nó
đến từ prop chứ không từ nội bộ React — hai bên giống nhau theo cấu tạo, không theo may rủi.

**3. Không đuổi theo cú Back thứ nhất trên Android thật.** Chrome ăn cú Back đầu để thoát
fullscreen trước khi điều hướng. Cách bù hiển nhiên là nghe `fullscreenchange` rồi đóng lớp phủ
khi `fullscreenElement` thành null — nhưng giả lập không tái tạo được lớp ấy, nên đó sẽ là vá mù.
Ghi vào docblock, chờ máy thật.

### Chính ca kiểm bắt được chỗ tôi chẩn đoán thiếu

Chẩn đoán ban đầu chỉ nêu hai chỗ gọi `useId()` dưới ranh giới nạp trễ: `ChartFrame` và
`LineChart`. Vá xong hai chỗ đó, ca kiểm bất biến vẫn đỏ với hai id `:r1n:` và `:r1o:` — chúng đến
từ **`Select` primitive** mà `SweepPicker` dùng, cũng nằm trong cùng cây.

Đây là lý do ca kiểm được viết thành **phép quét cả cây tìm hình dạng id của React**, chứ không
phải liệt kê từng component. Liệt kê thì nó đã bỏ sót đúng chỗ này, và lần sau ai thêm một
primitive mới vào cây biểu đồ cũng sẽ lọt.

Không dùng grep làm phép kiểm được: chính những dòng chú thích giải thích bất biến cũng chứa chữ
`useId`, nên grep tự báo dương tính giả.

### Kiểm chứng — đợt này

`npm run check` xanh toàn bộ: lint, typecheck, prettier, **1219 test / 52 file** (trước đợt này là
1210 — thêm 9 ca: 4 ca id tất định, 5 ca nút Back).

Chín ca mới, và ranh giới của chúng:

- 4 ca id: `figcaption` mang `chart-pe-caption`; mở lớp phủ thì có **hai** `<pattern>` với id khác
  nhau; không id nào trong cây mang hình dạng React sinh; và cả **ba nhánh dựng** của `ChartBody`
  (đường quét · theo thời gian · chờ dữ liệu) đều sạch.
- 5 ca Back: chưa mở thì không đụng lịch sử · mở thì đẩy đúng một mục và **giữ nguyên state sẵn có
  của router Next** · bấm Back thì đóng lớp phủ và **không** lùi thêm bước · đóng bằng X thì tự gỡ
  mục · mở lại lần hai thì đẩy lại mục mới.

Phải giả lập `history` cho **cả file** `charts.test.tsx`, không riêng khối test mới: 8 ca phóng to
có sẵn nay cũng đẩy một mục lịch sử thật, và `back()` của jsdom bất đồng bộ nên mục ấy rò từ ca này
sang ca sau.

Những ca trên chỉ chứng minh **cơ chế**. Triệu chứng người dùng thấy — số đã gõ còn nguyên sau khi
bấm Back, và 0 cảnh báo hydration — phải đo lại trên giả lập mobile, jsdom không có nút Back.

### Còn lại

- [ ] **Chạy lại bộ CDP trên giả lập mobile** để chốt hai triệu chứng: `/cong-thuc/pe/` cho 0 lỗi
      console (trước là 5 lượt / 2 loại), và gõ `77777` → phóng to → bấm Back thì lớp phủ đóng, URL
      vẫn `/cong-thuc/pe/`, số còn nguyên.
- [ ] `npm run build && npm run verify:static && npm run size` — cần tắt dev server ở cổng 3000.
      Ghi First Load JS trang nặng nhất cạnh mốc 148,7 kB để chứng minh bản vá id tốn 0 kB.
- [ ] **Cú Back thứ nhất trên máy Android thật** — xem quyết định 3 ở trên.
- [ ] Đặt tên project Cloudflare Pages là `faculator-finbox` cho khớp origin dự phòng ở
      `src/app/site-url.ts`. `verify:static` **không** bắt được lỗi này: phép kiểm ở đó chỉ so
      `robots.txt` và `sitemap.xml` có khớp nhau không, mà cả hai cùng sai một kiểu.
- [ ] Ba việc nội dung chặn v0.1 vẫn nguyên: thuế/phí bản thảo · bộ mẫu tự dựng · diễn giải chưa rà.
- [ ] Đợt sau đã chốt hướng: **KaTeX (gói 2.4.3) render lúc build** trong `gen-summaries.mjs` —
      0 byte JS phía máy khách, cả 107 spec đã có sẵn trường `latex`. Cần duyệt dependency `katex`.

---

## Sửa tên sản phẩm — "Falculator" thành "Faculator"

### Yêu cầu

> "là Faculator-finbox nhé. đổi ở tất cả những nơi đang sai"

Bối cảnh: đang chuẩn bị đưa dự án lên Cloudflare Pages thì lộ ra tên sản phẩm trong code
(`Falculator`, có chữ `l`) không khớp tên kho GitHub (`Faculator_finbox`). Chủ dự án chốt cách
viết đúng là **Faculator**.

### Vì sao đây không chỉ là lỗi chính tả

`src/app/site-url.ts` lấy `https://falculator-finbox.pages.dev` làm tên miền dự phòng khi chưa đặt
`NEXT_PUBLIC_SITE_URL`. Tên miền đó không tồn tại. Để nguyên thì `robots.txt` và `sitemap.xml` —
cả hai đều sinh từ đúng hằng số ấy — sẽ chỉ bot sang một tên miền chết, mà `verify:static` vẫn
xanh: phép kiểm ở đó chỉ so hai file có **khớp nhau** không, nó không biết tên miền có thật hay không.

Tên file xuất cũng mang tên sai: `exportFileName()` sinh `falculator-pe.png`, nghĩa là mỗi ảnh
người dùng chia sẻ ra ngoài đều dán nhãn sai tên sản phẩm.

### Đã đổi file nào, vì sao

- **`src/application/i18n/vi.ts`** — `app.name` → `Faculator Finbox`, `app.brand` → `Faculator`.
  Đây là nguồn chữ duy nhất cho thanh trên và tiêu đề tài liệu, nên sửa một chỗ là cả giao diện
  đổi theo.
- **`src/app/site-url.ts`** — tên miền dự phòng → `https://faculator-finbox.pages.dev`, kéo theo
  `robots.txt` và `sitemap.xml` cùng đúng.
- **`src/core/export-content.ts`** — tiền tố tên file xuất → `faculator-<id>`.
- **`src/core/export-content.test.ts`** — 3 ca kiểm theo tên file mới.
- **`public/manifest.webmanifest`** — `name` + `short_name`: tên hiện dưới biểu tượng khi cài PWA.
- **`package.json`** — trường `description`.
- **`README.md`** — tiêu đề.
- **`src/app/layout.tsx`**, **`src/ui/navigation/AppHeader.tsx`** — chú thích. Chú thích ở
  `layout.tsx` vốn giải thích rằng tên gói npm và tên sản phẩm lệch nhau; nay hết lệch nên viết
  lại chứ không chỉ xoá một chữ cái.
- **`CLAUDE.md`** — ghi cách viết đúng, kèm cảnh báo đừng để chữ `l` quay lại.

### Chỗ cố ý KHÔNG đổi

`TASK.md` còn 5 chỗ mang chữ `Falculator`, để nguyên có chủ đích:

- 3 chỗ là ghi chép lịch sử — mô tả việc đã làm ở đợt trước, và tên file PNG đã xuất lúc kiểm
  thử. Sửa nhật ký là làm sai bản ghi.
- 2 chỗ là **tên file thật** trong thư mục Downloads: `Wireframe Falculator Finbox.html`. Đã kiểm,
  file đó có thật và đúng tên đó. Sửa đi thì câu lệnh `grep` ghi kèm trong log không chạy được nữa.

`CLAUDE.md` còn một chỗ, chính là dòng cảnh báo nêu tên cách viết sai — cố ý.

### Kiểm chứng

`npm run check` xanh toàn bộ: lint, typecheck, prettier, **1210 test / 52 file**.

Chưa chạy `npm run build` + `verify:static` vì dev server đang chạy ở cổng 3000 và cửa gác
`check-no-dev.mjs` chặn — đúng như thiết kế của nó.

### Còn lại

- Build lại + `verify:static` sau khi tắt dev server, để chắc `robots.txt` và `sitemap.xml` sinh ra
  mang tên miền mới.
- Đặt tên project trên Cloudflare Pages là `faculator-finbox` cho khớp tên miền dự phòng; dùng tên
  khác thì phải đặt biến `NEXT_PUBLIC_SITE_URL`.
- Kho GitHub vẫn tên `Faculator_finbox` (gạch dưới). Không ảnh hưởng gì vì tên kho không lộ ra
  người dùng — đổi hay không tuỳ chủ dự án.

---

## Phóng to biểu đồ toàn màn hình

### Yêu cầu

> "thêm button chức năng phóng to biểu đồ sẽ nằm bên cạnh select lựa chọn xem kết quả đổi theo: khi
> click vào button thì sẽ phóng to biểu đồ lên full màn hình điện thoại của người dùng, nếu biểu đồ
> cần không gian để hiển thị thì xoay ngang màn hình của người dùng, lúc đó sẽ yêu cầu người dùng bật
> xoay ngang để xem biểu đồ nhé."

### Quyết định kỹ thuật đáng giải thích nhất: lớp phủ là cơ chế CHÍNH, Fullscreen API chỉ là phần thêm

Cách hiển nhiên là `element.requestFullscreen()`. Nhưng **Safari trên iPhone không hỗ trợ
`requestFullscreen` cho phần tử thường** — chỉ `<video>` mới vào được toàn màn hình. Dựa vào nó thì
nút này chết hẳn trên iPhone, mà đó là phần lớn người dùng Việt Nam.

Nên cơ chế chính là một `<dialog>` phủ kín khung nhìn (`inset: 0`, `100dvh`), chạy ở mọi máy. Fullscreen
API và `screen.orientation.lock('landscape')` là **phần thêm best-effort**, gọi theo đúng thứ tự ấy vì
Chrome trên Android đòi phải đang ở fullscreen mới cho khoá xoay. Cả hai đều bọc `catch`.

Nhờ vậy hai câu yêu cầu của chủ dự án nối vào nhau thành một điều kiện duy nhất: khoá xoay ăn thì
trình duyệt tự xoay ngang, `matchMedia('(orientation: portrait)')` thành `false`, câu nhắc tự biến
mất. Không khoá được thì máy vẫn dọc và người dùng nhận đúng câu nhờ xoay tay, kèm cách bật khoá xoay.

### Đã đổi file nào, vì sao

| File                                | Đổi gì                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `src/ui/charts/ChartFullscreen.tsx` | **mới** — lớp phủ `<dialog>`, thử fullscreen + khoá xoay, câu nhờ xoay |
| `src/ui/charts/ZoomButton.tsx`      | **mới** — nút "Phóng to", có chữ chứ không chỉ biểu tượng              |
| `src/ui/charts/ChartFrame.tsx`      | thêm khe `action` cạnh `picker`, gói cả hai vào một hàng               |
| `src/ui/charts/ChartBody.tsx`       | state `zoomed`, dựng ô chọn MỘT lần rồi dùng ở hai chỗ                 |
| `src/ui/charts/LineChart.tsx`       | thêm prop `fill` — hình choán hết chỗ thay vì giữ tỉ lệ 16/10          |
| `src/ui/charts/chart.module.css`    | hàng điều khiển, nút, lớp phủ, biến thể hình choán chỗ                 |
| `src/application/i18n/vi.ts`        | 4 khoá mới                                                             |
| `src/ui/charts/charts.test.tsx`     | +9 ca                                                                  |

Bốn quyết định nhỏ, mỗi cái sửa một cái bẫy:

- **Khe `action` riêng, không nhét nút vào `picker`.** `SweepPicker` tự trả `null` khi công thức chỉ
  có một biến quét được, và nút phóng to phải CÒN ở đúng những công thức ấy. Có ca kiểm chốt bằng
  `lai-suat-hieu-dung`.
- **Ô chọn dựng một lần, dùng hai chỗ.** Nó không giữ state riêng — đọc `model.sweepKey`, bắn về
  `setSweepKey` — nên ô trên trang và ô trong lớp phủ luôn nói cùng một biến. Cùng cách đã dùng cho
  khối Ví dụ thực tế: hai chỗ hiện cùng con số vì chúng LÀ cùng con số.
- **Nội dung lớp phủ chỉ dựng khi đang mở.** Để sẵn trong DOM là nhân đôi số thẻ SVG của cả 97 trang
  chi tiết cho một thứ không ai xem. Ca kiểm đếm `path[data-points]` phải bằng 1 trước khi bấm.
- **`100dvh` chứ không `100vh`.** `vh` trên điện thoại tính theo khung nhìn lúc thanh địa chỉ đã thu,
  nên `100vh` đẩy đáy hộp xuống dưới mép màn và câu nhờ xoay bị thanh địa chỉ che.

### Một chỗ suýt làm trắng cả màn

Hàm dọn của effect gọi `screen.orientation.unlock()` và `document.exitFullscreen()`. Cả hai đều là
thứ **có thể không tồn tại** — jsdom không có cái nào, iPhone không có khoá xoay. Đọc thẳng rồi gọi là
ném `TypeError` ngay trong hàm dọn, mà lỗi ở đó React không hứng: người dùng bấm thoát phóng to và
được một màn trắng. Nay cả hai đi qua `typeof` / optional chaining.

Đây cũng là lý do bộ kiểm **chỉ vá `<dialog>.showModal()`** trong jsdom mà cố ý để Fullscreen API và
`screen.orientation` vắng mặt: đó đúng là môi trường iPhone, nên nếu sau này ai viết lại phần này dựa
vào `requestFullscreen()` thì các ca kiểm đỏ ngay.

### Ngân sách — A/B trong cùng một worktree, chỉ khác nhau phần nối nút

| Đo                                         | Chưa có phóng to | Có phóng to |    Chênh |
| ------------------------------------------ | ---------------: | ----------: | -------: |
| Trang nặng nhất theo JS (`loi-nhuan-rong`) |         154,8 kB |    155,7 kB | **+0,9** |
| **Gói chung mọi trang đều tải**            |         130,4 kB |    130,4 kB |    **0** |
| Chunk biểu đồ (nạp trễ, 97 trang)          |           7,7 kB |      8,5 kB |     +0,8 |

Cửa kiểm 170 kB → **còn dư 14,3 kB**. Dưới xa trần 6 kB mỗi đợt tự đặt ở đợt 0.

⚠ Không quote dòng "gói chung CSS" của báo cáo: nó nhảy 4,5 ↔ 8,6 kB giữa hai lượt build cùng một
mã nguồn, nên đó là nhiễu của cách Next băm chunk CSS chứ không phải số đo. Cửa kiểm NFR-PER-04 tính
theo First Load **JS**, và con số JS thì ổn định giữa các lượt.

### Kiểm chứng

- `npm run lint` · `typecheck` · `format:check` — sạch. **1.210 test xanh, 0 đỏ** (+11).
- `next build` — 107 trang công thức. `verify:static` **19/19 đạt**.
- Đọc HTML từ dev server đang chạy của chủ dự án: nút `chart_zoom` nằm **trong cùng thẻ**
  `chart_controls` với `<select>` "Xem kết quả đổi theo", và `<dialog class="chart_full…">` có mặt ở
  trạng thái đóng.

### Còn lại

- [x] ~~Chưa kiểm nhánh "có API và chạy đúng"~~ → đã kiểm trên giả lập iPhone và Android, xem mục
      ngay dưới. jsdom chỉ chứng minh được nhánh "thiếu API".
- [ ] **Nút Back của Android xoá cả trang thay vì đóng lớp phủ** — giả lập bắt được, chưa sửa. Xem
      mục dưới.
- [ ] **Chưa kiểm trên máy thật.** Giả lập không thay được ba thứ: thanh địa chỉ thu/nhả của Chrome
      Android (phép thử thật của `100dvh`), khoá xoay ĂN được (giả lập luôn từ chối
      `NotSupportedError` vì máy để bàn không xoay được), và cách Chrome Android chặn Back để thoát
      fullscreen trước khi điều hướng.
- [ ] Người dùng thoát fullscreen bằng cử chỉ hệ thống thì lớp phủ vẫn ở đó — không hỏng gì (nó vẫn
      phủ kín khung nhìn) nên chưa nghe `fullscreenchange`. Thêm sau nếu thấy khó chịu khi dùng thật.

---

## Kiểm chức năng phóng to trên giả lập điện thoại — iPhone rồi Android

### Yêu cầu

> "chạy kiểm thử chức năng phóng to trên giả lập mobile cho tôi" — rồi: "chạy giả lập andoid dự án đi."

### Cách kiểm, và vì sao không dùng jsdom

Lái Chrome thật qua CDP, không thêm dependency (Node 24 đã có `WebSocket` toàn cục). Hai bộ ở
`scratchpad`: `zoom-mobile.mjs` (iPhone 14 Pro) và `zoom-android.mjs` (Pixel 7 + Android phổ thông
360×640, chạy cả hai khổ trong một lượt).

Ba điểm khiến bộ Android **không phải bản sao đổi kích thước** — đây đúng ba nhánh mà bộ iPhone không
chạm tới, vì trên iPhone các API ấy vắng mặt:

| Nhánh trong `ChartFullscreen`           | iPhone   | Android                                       |
| --------------------------------------- | -------- | --------------------------------------------- |
| `requestFullscreen()` phần tử thường    | không có | **có** → vào thật, `<html>` fullscreen        |
| `screen.orientation.lock('landscape')`  | không có | **có** → gọi thật, bị từ chối, phải không sập |
| `unlock()` + `exitFullscreen()` khi dọn | bỏ qua   | **chạy thật** — đúng chỗ từng ném `TypeError` |

Bộ Android gài máy ghi quanh cả ba API trước khi bấm, nên phân biệt được "im vì API không tồn tại"
với "gọi rồi và bị từ chối" — hai thứ khác nhau mà cùng cho ra "không khoá được".

Hai điểm nữa: bấm bằng **chạm thật** (`Input.dispatchTouchEvent`, không phải chuột — đi qua bộ nhận
cử chỉ của Chrome), và **nút Back** của hệ thống, thứ iPhone không có.

### Kết quả

| Bộ                        | Ca kiểm | Đạt |
| ------------------------- | ------: | --- |
| iPhone 14 Pro 393×852     |      31 | 31  |
| Pixel 7 412×915           |      42 | 41  |
| Android phổ thông 360×640 |      42 | 41  |

Số đo đáng lưu: nút phóng to 98×44px, **đúng bằng** `<select>` bên cạnh ở cả ba khổ. Hình khi phóng
to 386×648 (Pixel 7) và 334×373 (360px). Xoay ngang: hình rộng ×2,30 trên Pixel 7 và ×1,84 trên khổ
360px — cả hai **vượt tỉ lệ khung nhìn** của chính máy ấy (×2,22 và ×1,78), tức hình ăn hết phần bề
ngang việc xoay máy mang lại, còn giành thêm chỗ của lề. Không khổ nào tràn hộp (`scrollHeight`
bằng `clientHeight`), nên nút thoát luôn ở trong màn.

Bằng chứng "lớp phủ nằm trên cùng" là `document.elementFromPoint`, không phải ảnh chụp:
`Page.captureScreenshot` **không vẽ top layer** dù thử `fromSurface` cả hai chiều, headless và
headful — ảnh chụp trông y như trang chưa bấm gì. Phép chạm mạnh hơn ảnh: nó trả về đúng phần tử
NHẬN cú chạm, và nó xác nhận thêm biểu đồ trên trang không nhận được cú nào.

### Hai lỗi thật do giả lập tìm ra

**1. Ô chọn ăn 192px chiều cao trong màn phóng to** (iPhone, đã sửa). `flex: 1 1 12rem` đặt thẳng lên
`.picker` đúng trong hàng ngang, nhưng cùng ô chọn ấy dựng lại trong lớp phủ — chỗ đó là flex **cột**,
nên `flex-basis` biến thành **chiều cao**. Ràng vào `.controls .picker`. Hình khi ngang 135 → 248px,
khi dọc 472 → 585px. Ghi lại trong comment ở `chart.module.css`.

**2. Nút Back khi đang phóng to xoá cả trang** (Android, **chưa sửa**). Đo bằng `back-probe.mjs`, đi
qua một cú bấm thật từ danh sách vào công thức để history có đúng một bước lùi trong ứng dụng:

```text
Đã gõ 77777 vào ô nhập · /cong-thuc/pe/ · history.length=3
Đang phóng to: 1 dialog · fullscreen CÓ
Sau khi bấm Back:  đang ở /cong-thuc/ ("Công thức") · 0 dialog · fullscreen đã thoát · ô nhập trống
→ ĐÃ RỜI trang công thức · số đã gõ MẤT
```

`<dialog>` không có liên kết nào với history, nên Back đi thẳng bước điều hướng: người dùng về danh
sách và **mất hết số đã gõ**. Lớp phủ "đóng" chỉ vì cả trang bị tháo. Phần dọn chạy đúng (fullscreen
thoát, `body.overflow` trả lại) nên không có hậu quả nào khác.

Trên máy Android thật còn một lớp nữa: Chrome chặn Back lần đầu để thoát fullscreen, nên lần đầu
người dùng thấy thanh trạng thái quay lại mà lớp phủ **vẫn nguyên** — bấm lần hai mới mất trang.
Giả lập không tái tạo được lớp này (nêu ra để không nhầm là đã kiểm).

Hướng sửa, chờ chủ dự án chốt vì nó chạm vào history: khi mở lớp phủ thì `history.pushState`, nghe
`popstate` để đóng, và khi đóng bằng nút X thì `history.back()` để không để lại rác trong history.
Khoảng 15 dòng trong `ChartFullscreen`, cộng ca kiểm.

### Ba lỗi trong chính bộ kiểm, phải sửa mới tin được kết quả

- **Đo trước khi CSS áp** (iPhone). Next dev cấy `<link>` CSS lúc hydrate, mà nút đã có trong HTML từ
  máy chủ: đo ngay lúc ấy ra nút cao 25px, ô chọn 19px — kích thước mặc định của trình duyệt — và bộ
  kiểm báo hỏng NFR-USA-01 oan. Nay chờ tới khi `--tap-min` đọc được.
- **Dò nhầm phần tử** (iPhone). `querySelector('figure svg')` trúng biểu tượng 16px của chính nút
  phóng to, nên "diện tích hình" là 256px². Nay đi qua `path[data-points]` → `ownerSVGElement`.
- **Hỏi sai câu hỏi, hai lần.** Lượt iPhone đòi _diện tích_ hình phải tăng khi xoay ngang — không thể,
  màn xoay vẫn bấy nhiêu điểm ảnh. Lượt Android đòi hình rộng ×2 — cũng không thể trên máy 360×640,
  vì xoay ngang chỉ rộng thêm ×1,78. Mốc đúng là **tỉ lệ khung nhìn của chính máy ấy**, và nó phát
  hiện được đúng thứ đáng phát hiện: hình có ăn hết phần bề ngang xoay ra được hay không.

Cộng một lỗi lặng của bộ iPhone: `const consoleErrors = []` khai **trong** khối `try`, nên khối báo
cáo cuối file kiểm `typeof consoleErrors !== 'undefined'` không bao giờ thấy nó — mọi lỗi console bị
nuốt im, kể cả lệch hydration. Đã hoisted ra ngoài ở cả hai bộ.

### Lệch hydration — xác nhận lại, vẫn chưa sửa

Bộ Android bắt **5 lượt · 2 loại**, cả hai là lệch hydration ở khối biểu đồ, giống hệt bản iPhone →
**không phải chuyện của Android**, và không phải chuyện của nút phóng to. Vị trí: `useId()` trong
`ChartFrame`, dưới ranh giới `next/dynamic`. Trang `chartType: 'none'` cho **0** lỗi.

Chưa xác định được nó có sẵn từ đợt 1 hay không — `ChartFrame` và `LineChart` đã dùng `useId()` từ
đợt ấy. Tác động thực tế nhỏ (React giữ giá trị của máy chủ cho **cả hai** thuộc tính nên
`figure aria-labelledby` vẫn trỏ đúng `figcaption id`), nhưng cảnh báo là thật.

---

## Khối Giải thích cho người mới — mở sẵn cả bốn mục khi vào màn

### Yêu cầu

Hai câu, câu sau siết lại phạm vi của câu trước:

> "sửa lại phần Giải thích cho người mới sẽ luôn bật khi vào xem chi tiết công thức"
>
> "luôn bật các giải thích của các phần _Công thức này nói lên điều gì_ _Khi nào dùng_ _Cách đọc kết
> quả_ _Sai lầm thường gặp_ khi vào phần công thức"

Tôi đọc câu đầu là "mở mục đầu, bỏ điều kiện theo chế độ" và làm đúng thế, có ghi rõ trong bản trước
của mục này rằng mở cả bốn là một chữ. Câu sau chốt: **mở hết bốn mục.**

### Đã đổi file nào, vì sao

| File                                            | Đổi gì                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| `src/ui/result/ExplanationAccordion.tsx`        | prop `openFirst` → `defaultOpen`, `open={defaultOpen}` cho **cả bốn** mục |
| `src/app/cong-thuc/[id]/FormulaDetail.tsx`      | bỏ hẳn `openFirst={mode === 'basic'}`, không truyền prop nào              |
| `src/app/cong-thuc/[id]/FormulaDetail.test.tsx` | +2 ca (cả hai chế độ), +1 helper, dọn localStorage sau mỗi ca             |

Ba bước đã đi qua, ghi lại để không ai vô tình cuộn về:

1. Bản đầu **gập hết** ở chế độ Nâng cao cho gọn màn (FR-09).
2. Bản giữa mở **mục đầu**, bỏ điều kiện theo chế độ.
3. Nay mở **cả bốn**.

Lý do xuyên suốt: FR-03 bắt buộc bốn mục ấy có mặt chính là để đọc, mà cả hai bản trước đều bắt người
đọc phải bấm mới thấy. Vẫn dùng `<details>` chứ không đổi sang thẻ thường — người đọc **gập lại được**
từng mục khi đã hiểu, và đó là chiều đúng: mặc định là thấy, thu gọn là lựa chọn.

Đổi tên prop chứ không giữ `openFirst` với nghĩa mới: một prop tên "mở cái đầu" mà mở cả bốn là cái
bẫy cho người đọc code sau này. `FormulaDetail` không truyền gì cả, nên chỗ gọi không còn điều kiện
nào để về sau lệch với mặc định của component.

### Hai chỗ ca kiểm dễ đỗ giả, phải xử riêng

- **Nhãn bốn mục xuất hiện HAI lần trong DOM.** Vùng in của `ExportSheet` luôn có mặt (chỉ ẩn bằng
  CSS) và nó dựng cùng bốn nhãn ấy thành `<h2>`. Truy vấn theo chữ trần khớp hai phần tử, nên helper
  `mucGiaiThich()` lọc theo thẻ `SUMMARY` rồi mới lấy `<details>` cha.
- **Ca chế độ Nâng cao phải tự chứng minh là đã vào chế độ đó.** `PreferencesProvider` đọc
  localStorage trong effect, nên lần render đầu vẫn là Cơ bản. Nếu chỉ khẳng định `open === true` thì
  ca đỗ ngay cả khi Provider chưa kịp đọc — vô nghĩa. Nên ca dùng `lai-kep` (có biến `perYear` khai
  `level: 'advanced'`) và **chờ ô đó hiện ra trước**, lấy đó làm bằng chứng chế độ đã đổi thật.

Thêm một điều đáng nói về cách dò: ca kiểm đọc thuộc tính `open` của `<details>`, **không** đọc chữ.
Nội dung bốn mục nằm trong DOM cả khi gập, nên một ca bám vào chữ sẽ xanh ngay cả lúc khối gập kín.

### Kiểm chứng

- `npm run lint` · `typecheck` · `format:check` — sạch. **1.199 test xanh, 0 đỏ.**
- Đọc HTML từ dev server đang chạy của chủ dự án: `pe` và `wacc` đều có **4** thẻ
  `<details class="ExplanationAccordion…" open>`.

---

## Đợt 3 của biểu đồ — mở phạm vi cho 47 công thức còn lại

### Yêu cầu

> "bây giờ tiếp tục vẽ tiếp biểu đồ cho phần công thức chưa có biểu đồ"

### Đo trước khi làm — việc nhỏ hơn kế hoạch dự tính rất nhiều

Kế hoạch nhánh 4 xếp phần còn lại thành ba đợt (~39 giờ): candlestick · underwater · histogram, rồi
stackedBar · waterfall, mỗi loại một renderer riêng. Trước khi viết dòng nào, chạy
`buildChartModel()` trên **cả 107 công thức × 2 chế độ × có/không có chuỗi phiên** để xem Domain
thật sự thiếu gì:

| Đo gì                                                      | Kết quả         |
| ---------------------------------------------------------- | --------------- |
| Công thức không khai `chartType: 'none'`                   | 97              |
| Trong đó Domain dựng được mô hình khi CÓ chuỗi giá         | **97 — tất cả** |
| Ca ngoài dự kiến (không vẽ được vì lý do khác thiếu chuỗi) | **0**           |
| Số phi hữu hạn hay nhãn lộ `NaN`/`undefined`               | **0**           |
| Dựng chậm nhất một mô hình                                 | 18,8 ms         |

Nghĩa là **động cơ vẽ đã xong từ đợt 1 và đợt 2**; thứ chặn 47 công thức chỉ là một vị từ ở tầng
giao diện. Lý do phủ được rộng thế mà không cần renderer mới: giữa hai lối sinh điểm thì không công
thức nào lọt. Đường quét độ nhạy chỉ đòi một biến vô hướng có `min`/`max` — 208 trên 209 biến của
Registry đã khai sẵn. Đường theo thời gian chỉ đòi một chân giá hoặc một chuỗi cắt được tiền tố.

Một chi tiết của phép đo đáng ghi lại vì nó gần làm tôi kết luận sai: lượt khảo sát đầu báo **8 công
thức không vẽ được** (`loi-nhuan-rong`, `gia-hoa-von`, bốn công thức phái sinh, `thue-tncn-dau-tu`,
`roi-rong`). Cả 8 đều mang cùng một câu: "Biểu phí đang chọn không có mức phí áp dụng tại ngày tra
cứu". Nguyên nhân là **ctx của kịch bản khảo sát thiếu `schedule`**, không phải lỗi của sản phẩm —
màn thật luôn truyền `scheduleOrDefault(MARKET_CONFIG, feeScheduleId)`. Thêm biểu phí vào thì cả 8
ra đường ngay. Đây đúng cái bẫy mà comment ở đầu `chart.test.ts` đã ghi từ đợt 1.

### Đã đổi file nào, vì sao

| File                                              | Đổi gì                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/ui/charts/FormulaChart.tsx`                  | `hasChart()` từ `sensitivity && basic` thành `chartType !== 'none'` — 1 dòng |
| `src/app/cong-thuc/[id]/FormulaDetail.tsx`        | bỏ nhánh khung chờ, khối biểu đồ còn một trạng thái                          |
| `src/application/i18n/vi.ts`                      | xoá khoá `detail.chartPending` (mồ côi sau khi bỏ nhánh)                     |
| `src/app/cong-thuc/[id]/FormulaDetail.module.css` | xoá `.chartSlot` — khung nét đứt không còn ai dựng                           |
| `src/core/chart/build.ts`                         | phân biệt **dải khởi động** với **ngắt giữa** — xem mục dưới                 |
| `src/core/chart/chart.test.ts`                    | thay ca chốt 50/43 bằng hai ca chốt phủ 63/34 và 97/10                       |
| `src/core/chart/history.test.ts`                  | +5 ca: phủ 97 công thức × 2 chế độ, và 4 ca cho dải khởi động                |
| `src/ui/charts/charts.test.tsx`                   | +8 ca: phạm vi `hasChart`, bốn họ mới, dải khởi động                         |
| `src/app/cong-thuc/[id]/FormulaDetail.test.tsx`   | ca khung chờ thành ca vẽ thật; +1 ca luồng nạp mẫu cho công thức chuỗi       |

Bốn họ vừa được phủ: **12** công thức `sensitivity` nhóm Nâng cao · **24** công thức cần chuỗi giá
(`candlestick` 11, `histogram` 9, `underwater` 4 — trừ chồng lấn) · **10** công thức khai
`stackedBar`/`waterfall` · **1** công thức `scatter`.

### Dải khởi động không phải đường ngắt

Đây là lỗi thật, không phải việc dọn dẹp. Với 34 công thức, mọi điểm `null` nằm liền một dải ở ĐẦU
chuỗi phiên: RSI-14 không tồn tại ở phiên thứ 3, SMA-20 không tồn tại ở phiên thứ 5, VaR lịch sử đòi
60 quan sát. Đó là **cách chỉ báo cuộn hoạt động**, không phải chỗ công thức sụp — nhưng bản trước
gọi hết là _"Đường ngắt ở 59 phiên không tính được — thiếu chuỗi giá"_, đẩy người đọc đi tìm một sự
cố không tồn tại.

Nay câu mô tả nói: _"59 phiên đầu chưa đủ dữ liệu để tính, nên đường bắt đầu từ 26/03/2025."_ Và
**bỏ hẳn dòng ghi chú** — vì không có gì để cảnh báo.

Phép phân biệt hẹp có chủ đích, hai lớp:

- Chỉ tính là khởi động khi **mọi** điểm `null` nằm liền một dải ở đầu. Một điểm `null` nằm sau một
  phiên đã ra số là ngắt thật, và ghi chú phải còn — `he-so-bien-thien` đúng ca đó (lợi suất trung
  bình đi qua 0), là công thức duy nhất trên toàn Registry.
- Chỉ hỏi trên **trục thời gian**. Trên đường quét, dải null ở đầu không phải khởi động:
  `co-lenh-rui-ro` có 18 mức đầu không ra số vì công thức không có nghĩa ở dải đó, chứ không vì
  thiếu phiên — bảo người đọc "18 mức đầu chưa đủ dữ liệu" là nói sai nguyên nhân. Ca kiểm chốt cả
  hai chiều.

### Mười công thức `chartType: 'none'` — cố ý ở ngoài

Không mở phạm vi tới chúng, và đó là ý nghĩa của nhãn ấy chứ không phải việc còn nợ: phí giao dịch
bằng giá × khối lượng × tỉ lệ, nên đường quét của nó là một đoạn thẳng người đọc đoán trước được.

Có ghi nhận khi khảo sát: **4 trong 10 cái đó vẫn dựng được mô hình** (`rut-truoc-han`,
`gia-von-trung-binh-dca`, `loi-suat-vuot-chuan`, `basis-vn30f`), và hai cái đầu có 4–6 biến quét được
nên biểu đồ của chúng sẽ không tầm thường. **Không tự đổi** — sửa `chartType` là sửa Registry, và
đợt 0 đã đổi nhãn cho 4 công thức gắn sai thật; đây là bốn ca ranh giới cần chủ dự án quyết. Muốn mở
thì đổi `chartType` của công thức ấy, không nới vị từ `hasChart()`.

### Ngân sách — A/B trong cùng một môi trường, và lần này khớp số tuyệt đối

Cổng 3000 vẫn có dev server của chủ dự án nên `check-no-dev.mjs` chặn build ở repo chính. Dựng
worktree tạm (`node_modules` nối bằng junction), phủ toàn bộ cây làm việc lên đó, rồi build **hai
lượt chỉ khác nhau đúng một dòng vị từ**:

| Đo trong cùng worktree                          | 51 trang | 97 trang |  Chênh |
| ----------------------------------------------- | -------: | -------: | -----: |
| Trang nặng nhất theo JS (`loi-nhuan-rong`)      | 154,5 kB | 154,5 kB |  **0** |
| **Gói chung mọi trang đều tải**                 | 130,3 kB | 130,3 kB |  **0** |
| `lich-tra-no` — trang gánh cả hai chunk nạp trễ |        — | 154,2 kB | +6,0\* |
| Số trang chi tiết tải chunk biểu đồ             |       51 |       97 |    +46 |

\* `lich-tra-no` khai `stackedBar` nên trước đây không có biểu đồ; nay nó tải cả `DetailBody` của
WF-14 lẫn chunk biểu đồ, thành trang nặng thứ hai. Vẫn dưới trang nặng nhất, và **cửa kiểm 170 kB
còn dư 15,5 kB**.

Đọc ra hai điều: **trang nặng nhất không nhích một byte** (nó đã có biểu đồ từ đợt 1), và gói chung
vẫn đứng yên — bất biến quan trọng nhất của nhánh 4, kiểm bằng A/B chứ không bằng suy luận.

Khác đợt 2 ở một chỗ đáng mừng: lần đó worktree phồng gói chung lên 161,1 kB nên chỉ dùng được phần
chênh. Lần này worktree cho **130,3 kB**, khớp con số repo chính, và 154,5 kB nối liền mạch với
153,7 kB đo được ở đợt 1 cộng ~0,9 kB của đợt 2. Nên số tuyệt đối lần này dùng được.

### Kiểm chứng

- `npm run lint` · `typecheck` · `format:check` — sạch.
- **1.197 test xanh, 0 đỏ** (trước đợt: 1.182 + 5 đỏ baseline; 5 ca `VIRTUALIZE_THRESHOLD` đã được
  sửa giữa hai đợt, xem mục "Còn lại" của đợt trước).
- `next build` — 107 trang công thức, 114 trang tĩnh. `verify:static` **19/19 đạt**.
- Kiểm trên dev server đang chạy của chủ dự án (chỉ đọc, không tắt tiến trình nào):

| Trang               | Nhãn                  | Khối biểu đồ | `<figure>` | Đúng chưa                           |
| ------------------- | --------------------- | ------------ | ---------- | ----------------------------------- |
| `wacc`              | sensitivity, nâng cao | có           | có         | vẽ "WACC theo Chi phí vốn chủ (Re)" |
| `fcff`              | waterfall             | có           | có         | nhận đường quét thay vì bỏ trống    |
| `sma-n-phien`       | candlestick           | có           | không      | đúng — hiện cảnh báo chờ chuỗi giá  |
| `var-lich-su`       | histogram             | có           | không      | đúng — hiện cảnh báo chờ chuỗi giá  |
| `phi-giao-dich-mua` | none                  | **không**    | không      | đúng — không dựng khối nào          |

### Còn lại

- [ ] **Renderer riêng cho `stackedBar` và `waterfall`** (10 công thức) vẫn là việc thật. Chúng đang
      nhận đường quét độ nhạy — một biểu đồ ĐÚNG, chỉ chưa phải biểu đồ lý tưởng. Không tự sinh được:
      không metadata nào nói "thác nước của FCFF gồm những chặng nào theo thứ tự nào", `extras` là
      các khoá rời rạc không thứ tự. Cần thêm field `breakdown?` vào `FormulaSpec` và bổ sung
      `extras` trong `calc` của 10 công thức, cộng 3–4 token màu categorical.
- [ ] **Nhiều đường trên một hình** cho nhóm chỉ báo: `extras` đã có sẵn `duongGiua`, `smaShort`
      /`smaLong`, `emaFast`/`emaSlow`, `macd`/`histogram`, `peak`/`lastClose` — vẽ MACD cùng đường tín
      hiệu trên một hình sẽ hơn hẳn hai trang riêng. `ChartModel` cần thêm nhánh `lines`.
- [ ] **4 công thức `chartType: 'none'` ranh giới** ở mục trên — chờ chủ dự án quyết có mở không.
- [ ] `npm run build && npm run size` trong repo chính để chốt con số tuyệt đối bằng chính môi trường
      của cửa kiểm. Cần tắt dev server ở cổng 3000 trước.
- [ ] Nợ cũ chưa liên quan đợt này: 8 dòng báo cáo chưa suy ra được (chờ số liệu Finbox), nguồn dữ
      liệu cho mã ngoài 4 mã mẫu, gói 2.4.3 KaTeX và 3.2.2 WF-04.

---

## Cho gõ số cụ thể vào ô — thanh trượt và khối Ví dụ thực tế

### Yêu cầu

> "một số công thức basic khi test thì thấy người dùng chưa tự nhập được số liệu cụ thể mà người
> dùng mong muốn. ví dụ: người dùng sẽ lấy thông số thật của ticker bên finbox_v2 và nhập vào các ô
> để biểu đồ hiển thị cho người dùng hiểu (đó là cách biểu đồ hoạt động). và thêm nữa là ở phần dưới
> cùng cũng đang có Ví dụ thực tế: nên cho người dùng nhập số liệu cụ thể như tôi nói."

### Đo trước khi sửa — rào không nằm ở chỗ tôi đoán ban đầu

Rà cả ba đường có thể chặn người dùng nhập số:

| Rào                                       | Số công thức nhóm Cơ bản | Kết luận                 |
| ----------------------------------------- | -----------------------: | ------------------------ |
| **Thanh trượt — kéo được, KHÔNG gõ được** |              **39 / 78** | Đây là rào thật, đã sửa  |
| Biến nâng cao bị ẩn ở chế độ Cơ bản       |                        3 | Đã có lối đi, không sửa  |
| Biến rời rạc (chọn một trong vài giá trị) |                   6 biến | Rời rạc là đúng bản chất |

Toàn Registry có **97 biến kiểu `slider`**, và trước đợt này con số cạnh nhãn chỉ là một `<output>`
để đọc. Nghĩa là cách duy nhất nhập chúng là kéo, mà kéo thì bám lưới `step`:

- lãi suất bước 0,1% → không kéo tới được 12,37%
- `k` của dải Bollinger bước 0,5 → không kéo tới được 2,1
- **khoản vay của `tra-gop-nien-kim` bước 10.000.000 ₫** → không nhập được khoản vay
  1.234.000.000 ₫; chỉ chọn được bội số của mười triệu

Đúng là "lấy thông số thật của ticker rồi nhập vào" thì không nhập được. **23 trên 50 công thức có
biểu đồ** nằm trong nhóm này, nên biểu đồ cũng vẽ theo một con số không phải con số người dùng muốn.

Hai rào còn lại KHÔNG sửa, và lý do ghi lại để đợt sau không mở ra làm lại:

- Ba công thức ẩn một biến nâng cao (`eps-co-ban.preferredDividend`, `lai-kep.perYear`,
  `rut-truoc-han.demandRate`). Dòng nhắc đã ghi "biến nâng cao đang ẩn — chuyển chế độ để xem", và
  `ModeToggle` nằm trong `AppHeader` nên có trên mọi màn. Lối đi có sẵn.
- Sáu biến rời rạc (số kỳ ghép lãi, mức tin cậy VaR, phương pháp trả nợ) chỉ có vài giá trị hợp lệ
  về mặt tài chính — cho gõ tự do là mời người dùng nhập một giá trị vô nghĩa.

⚠ Ghi lại một điểm lệch trong Domain, **không sửa ở đợt này**: `isLockedForMode()` ghi rõ theo WF-16
trạng thái 5 là biến nâng cao bị **khoá chứ không bị ẩn**, nhưng `FormulaDetail` lại lọc chúng đi
bằng `variablesForLevel()`. Nên trạng thái 5 không bao giờ hiện ra trên màn chi tiết — nó chỉ còn
dùng được ở thanh trượt và ô số khi có ai truyền `mode='basic'` cho một biến nâng cao. Đổi chuyện
này là đổi hành vi FR-09 vế 2 đã chốt, nên cần chủ dự án quyết.

### Đã đổi file nào, vì sao

| File                                    | Sửa gì                                                                                                                                                                                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/ui/inputs/SliderInput.tsx`         | `<output>` cạnh nhãn thành **ô nhập thật**, đứng đúng vị trí cũ. Gõ đi qua `commitValue()` nên vẫn kẹp về `[min, max]` nhưng **không bám lưới `step`** — bước là độ phân giải của ngón tay, miền mới là luật. Kéo thì vẫn `snapToStep` như cũ.                            |
| `src/ui/inputs/SliderInput.module.css`  | Ô giữ đúng dáng cũ của WF-16 (số đậm màu nhấn, dính sát đơn vị), chỉ hiện viền khi có tiêu điểm. Bề rộng ghim 14 ký tự — vừa giá trị dài nhất Registry có là 2.000.000.000 ₫; ghim chứ không co giãn theo nội dung, kẻo bố cục nhích từng phím.                           |
| `src/ui/inputs/InlineNumber.tsx`        | **Mới.** Ô gõ số gọn, không nhãn — **một chỗ duy nhất** cầm quy tắc "gõ số" của dự án. `SliderInput` và `ExampleBlock` đều dùng nó, nên không có ba bản chép tay của cùng logic. `NumberInput` giữ bản riêng vì nó phải vẽ đủ năm trạng thái WF-16 qua primitive `Input`. |
| `src/ui/result/ExampleBlock.tsx`        | Dòng số của ví dụ thành **ô gõ được tại chỗ**. Thêm dòng "Ví dụ gốc" kèm nút quay về, chỉ hiện khi số đang nhập đã lệch khỏi ví dụ. Không truyền `inputs`/`onChange` thì khối vẫn chỉ để đọc như trước.                                                                   |
| `src/ui/result/ExampleBlock.module.css` | Vùng "Ví dụ gốc" tách bằng đường kẻ.                                                                                                                                                                                                                                      |
| `FormulaDetail.tsx`                     | Truyền thẳng `inputs`, `output`, `setValue` xuống khối ví dụ. Hai khối Số liệu và Ví dụ thành **vùng có tên** qua `aria-labelledby`.                                                                                                                                      |
| `src/application/i18n/vi.ts`            | `example.editHint`, `example.original`, `example.reset`.                                                                                                                                                                                                                  |

### Thanh trượt không được nói khác ô nhập

Chỗ dễ sai nhất, và nó là chi tiết của HTML chứ không phải của dự án: **thẻ `range` tự làm tròn
`value` về bội của `step`**. Để `step="0.1"` mà giá trị là 12,37 thì nút kéo hiện ở 12,4 trong khi
phép tính chạy 12,37 — hai điều khiển trên cùng một hàng nói hai con số.

Nên `step` của thanh trượt hạ xuống `"any"` **khi và chỉ khi** giá trị lệch lưới. Lúc đã nằm đúng
lưới (tức mọi lúc trước khi ai gõ, và ngay sau mỗi cú kéo) thì giữ nguyên `step`, nhờ vậy phím mũi
tên và cú kéo vẫn nhảy theo bước đúng như cũ. Và vì handler kéo vẫn `snapToStep`, một cú kéo sau khi
gõ số lệch lưới sẽ tự đưa giá trị về lưới — tự lành, không cần ai dọn.

Về khả năng tiếp cận: nhãn nhìn thấy trỏ vào **ô nhập**, thanh trượt dùng lại đúng nhãn ấy qua
`aria-labelledby`. Hai điều khiển cùng một tên là đúng — chúng sửa cùng một con số — và trình đọc
màn hình phân biệt được bằng **vai**: một cái `slider`, một cái `textbox`. Test cũng bám vào vai
(`getByRole`) chứ không bám nhãn, nên không có ca nào mơ hồ.

### Khối Ví dụ thực tế gõ được tại chỗ

Khối này bày một bộ số hoàn chỉnh đã tính sẵn ("FPT — Giá 92.000 ₫, EPS 6.050 ₫ → P/E ≈ 15,2 lần")
nhưng là ngõ cụt: người đọc phải tự cuộn lên gõ lại từng ô mới thấy biểu đồ vẽ theo bộ số ấy.

**Ghi lại một lần tôi làm thiếu.** Bản đầu tôi chỉ thêm một NÚT "đưa số này lên ô nhập", vì lo "hai
bộ ô trên cùng một màn thì có ngày nói hai kết quả". Chủ dự án nhắc lại là muốn gõ được tại chỗ, nên
làm đúng yêu cầu — và cái lo ngại ấy giải được bằng thiết kế, không cần đánh đổi:

**Ô ở khối Ví dụ KHÔNG giữ state riêng.** Chúng đọc `inputs` và bắn `onChange` của chính màn chi
tiết, tức cùng một biến state với ô ở khối Số liệu. Gõ ở đây hay gõ ở trên là một việc; hai chỗ luôn
hiện cùng con số vì chúng **LÀ** cùng con số, không phải hai bản sao có ngày lệch nhau. Test chốt cả
hai chiều: gõ dưới thì ô trên đổi, gõ trên thì ô dưới đổi.

Còn con số của ví dụ trong Registry vẫn phải giữ được — nó là tài liệu (FR-02), và **17 trên 107
công thức có ví dụ cố ý dùng chu kỳ ngắn hơn mặc định** để tính tay kiểm được (Bollinger 10 phiên
thay vì 20, ATR 5 thay vì 14…). Với chúng, mở màn ra là số đang nhập đã lệch khỏi ví dụ. Nên khi
lệch, khối hiện thêm dòng "Ví dụ gốc cho: …" kèm nút quay về. **Không bao giờ có hai con số cùng
đứng mà không nói rõ cái nào là cái nào.**

### Hai khối thành vùng có tên

Hệ quả trực tiếp của việc bày cùng một giá trị ở hai chỗ: ô hai bên mang **cùng một tên**. Đó là
đúng nghĩa — một con số thì một tên — nhưng người dùng cần biết mình đang gõ ở đâu. Nên khối Số liệu
và khối Ví dụ đều nhận `aria-labelledby` trỏ vào `<h2>` của mình, thành **vùng có tên**: trình đọc
màn hình đọc "Số liệu" hay "Ví dụ thực tế" khi bước vào, rồi mới tới tên ô.

Việc này cũng dọn luôn phần test: mọi truy vấn ô nhập đi qua hai helper `oNhap()` và `oViDu()` khoanh
đúng vùng, thay cho `getByLabelText` toàn màn. Ca kiểm phân biệt bằng đúng thứ người dùng phân biệt.

### Kiểm chứng

- `npm run check` sạch cả bốn cửa. **1.182 test xanh, 0 đỏ** (trước đợt này 1.139 xanh + 5 đỏ).
- `npm run verify:static` 19/19 đạt — nhưng nó đọc `out/` của đợt 1, chưa dựng lại.
- Test mới: `SliderInput.test.tsx` (16 ca, file này trước đây **không có test nào**),
  `ExampleBlock.test.tsx` (11 ca), cộng 8 ca luồng thật ở `FormulaDetail.test.tsx`.
- Ba ca quét cả 107 công thức đáng nhắc: `example.inputs` **khớp trọn khoá biến và nằm sẵn trong
  miền** (lệch khoá thì ô im lặng rơi về chữ chỉ để đọc — không lỗi, không hiện gì, người dùng chỉ
  thấy một dòng không gõ được); ví dụ **điền trọn mọi ô**; và **mọi công thức dựng đủ số ô gõ được**,
  không sót dòng nào thành chữ chết.

### Một ca cũ phải nới hạn thời gian

`đúng 34 công thức có nút dán chuỗi` dựng **trọn 107 màn chi tiết** trong một vòng lặp. Chạy riêng
mất ~3,3 giây, nhưng khi vitest chạy song song nhiều file thì các worker giành CPU và nó lên hơn 5
giây — đỏ vì máy đang bận, không vì sản phẩm sai. Ô nhập mới làm mỗi lượt dựng nặng thêm một chút,
đủ đẩy nó qua vạch. Nới hạn cho **đúng ca đó** lên 15 giây, không nới toàn cục: mọi ca khác vẫn nên
hỏng nếu chậm bất thường.

### Còn lại

- [x] ~~5 test đỏ baseline của `VIRTUALIZE_THRESHOLD`~~ — **đã có người sửa**, buộc ca kiểm vào
      `VIRTUALIZE_THRESHOLD + 1` thay cho số 107 viết cứng. Không phải việc của đợt này.
- [ ] Chạy `npm run build && npm run size` trong repo chính để chốt con số tuyệt đối của cả đợt 2 và
      đợt này. Cần tắt dev server ở cổng 3000 trước.
- [ ] Điểm lệch WF-16 trạng thái 5 nêu ở trên — chờ chủ dự án quyết.

---

## Đợt 2 của biểu đồ — trục thời gian, và nối dây bộ số liệu mẫu

### Yêu cầu

> "hiện tại nếu muốn xem trực quan hơn khi thay số liệu ở ngoài vào để biểu đồ thể hiện rõ trực quan
> hơn với công thức thì có được không. hoặc có thể điền một mã tồn tại và sẽ có những dữ liệu trực
> quan của mã đó rồi biểu đồ được vẽ theo số liệu tương ứng của mã đó để người dễ hiểu hơn được không"

Chủ dự án chốt qua câu hỏi chọn: **trục thời gian + nối dây preset**, và `Fundamentals` chỉ mở rộng
**phần suy ra được bằng phép nhân** — không thêm dòng báo cáo tự đặt nào.

### Đo trước khi làm

Ô nhập mã đã có sẵn từ gói 2.5.1 (`PresetSheet` gọi `SAMPLE_DATA.search`, tìm theo mã lẫn tên, bỏ
dấu). Nghẽn không nằm ở chỗ nhập mã, mà ở chỗ **nạp mã vào thì phần lớn ô không đổi**:

| Trong 50 công thức Cơ bản có biểu đồ          | Trước | Sau |
| --------------------------------------------- | ----: | --: |
| Preset điền được ít nhất một ô                |    14 |  21 |
| Preset điền được **trọn** mọi ô               |     6 |   9 |
| Không mã nào điền thay được (tiền & giả định) |    25 |  25 |

25 công thức cuối — lãi kép, CAGR, lãi lỗ phái sinh, chu kỳ chỉ báo — nhận vốn và giả định của
chính người dùng, nên `presetInputs()` trả về object rỗng và **đó là câu trả lời đúng**, không phải
thiếu sót. Ghi lại để đợt sau không ai đi "phủ cho đủ 50".

### Hai bug thật tìm được khi đo

1. **Vốn hoá thị trường ra số sai lặng lẽ.** Registry có hai khoá cho số cổ phiếu với hai đơn vị
   khác nhau: `shares` bằng **triệu CP** (nhóm Định giá, mặc định 118) và `sharesOutstanding` bằng
   **CP** (nhóm Chỉ số doanh nghiệp, mặc định 1.470.000.000). Bảng ánh xạ cũ trong `FormulaDetail`
   không điền khoá nào trong hai khoá đó, nên nạp FPT xong vốn hoá = giá FPT × 118 triệu CP mặc
   định — **sai hơn 12 lần**, mà trên màn không có gì nói là đã sai.
2. **Ý định có từ đầu nhưng dây chưa nối.** `fundamentals.ts:17-18` ghi rõ "đặt key trùng đúng
   trường của `Fundamentals` để nút Nạp mẫu tự điền được", nhưng `Fundamentals` chỉ có 5 trường
   trong khi nhóm ấy cần `netIncome`, `equity`, `sharesOutstanding`.

### Đã đổi file nào, vì sao

**Tầng Data — nối dây preset**

| File                        | Sửa gì                                                                                                                                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/data/types.ts`         | `Fundamentals` thêm `netIncome` và `equity`, đơn vị **tỷ ₫** khớp `numberVar(…, 'tỷ ₫')` bên Domain. JSDoc nói rõ: bộ mẫu suy ra bằng phép nhân, nguồn thật phải đọc từ báo cáo vì EPS công bố tính trên số CP bình quân gia quyền nên lợi nhuận thật KHÔNG bằng đúng tích ấy.                   |
| `src/data/samples.ts`       | `wholeCompany()` suy hai trường từ `eps × số CP` và `bvps × số CP`. **Không thêm một con số tự đặt nào** — bộ mẫu vốn đã bịa EPS và BVPS, nhân lên chỉ nói lại cùng một điều bằng đơn vị khác. Kiểm chứng: FPT ra 8.893,5 tỷ ₫, khớp mức 8.894 mà `fundamentals.ts` đã dựng bộ số kiểm quanh nó. |
| `src/data/preset-inputs.ts` | **Mới.** `presetInputs(preset, spec)` — bảng ánh xạ chuyển từ `FormulaDetail.tsx` xuống đây. Đơn vị là phần dễ sai nhất nên `shares` chia 1e6, `sharesOutstanding` giữ nguyên, và cả hai bị test khoá lại.                                                                                       |
| `src/data/index.ts`         | Mở `presetFillableKeys`, `presetInputs`.                                                                                                                                                                                                                                                         |
| `src/application/index.ts`  | Mở `presetInputs` cho tầng giao diện.                                                                                                                                                                                                                                                            |
| `FormulaDetail.tsx`         | `applyPreset()` gọi `presetInputs()` thay cho bảng viết cứng 9 dòng. Giảm 20 dòng ở tầng PRESENTATION, và giờ kiểm được bằng Node cho cả 107 công thức.                                                                                                                                          |

**Tầng Domain — trục thời gian**

| File                        | Sửa gì                                                                                                                                                                                                                                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/core/chart/history.ts` | **Mới.** Hai lối sinh điểm theo phiên: **chân giá** (thay ô giá bằng giá đóng cửa từng phiên) và **cắt tiền tố** (chạy lại công thức với chuỗi cắt tới đúng phiên đó). `formatSessionDate` cắt chuỗi ISO chứ không qua `new Date()` — `new Date('2025-12-31').getDate()` trên máy múi giờ âm trả về 30.  |
| `src/core/chart/build.ts`   | Trục thời gian là **một mục trong ô chọn trục X đã có**, không phải loại biểu đồ mới → `ChartBody` và `SweepPicker` không phải sửa một dòng. Thêm trục `'Ngày'` dựng tay (không dùng `niceAxis`: nó làm tròn ra vạch ở phiên 250, một phiên không tồn tại). Có dữ liệu thì **mặc định** vẽ theo dữ liệu. |
| `src/core/chart/table.ts`   | `condensePoints` giữ **hai đầu mỗi quãng `null`** thay vì mọi điểm `null`. Luật cũ đúng cho 42 mức nhưng đường thời gian phơi ngay chỗ hỏng: RSI-14 có 14 phiên đầu `null`, luật cũ đẩy 14 dòng "— , —" giống hệt lên đầu bảng rồi dồn 234 phiên có số thật vào đúng một dòng cuối.                      |
| `src/ui/charts/*`           | `ChartBody` + `FormulaChart` thêm `seriesLabel` để câu mô tả nói rõ vẽ theo phiên của mã nào.                                                                                                                                                                                                            |

### Quy tắc hai chân giá — chỗ ý nghĩa tự đúng mà không cần metadata

- chân _giá hiện tại_ → giá đóng cửa từng phiên: `price`, `sellPrice`, `endPrice`
- chân _giá vào_ → **giữ nguyên** giá người dùng nhập: `buyPrice`, `startPrice`, `entryPrice`

Nhờ vậy `loi-nhuan-rong` thành "lãi lỗ của tôi qua từng phiên nếu mua ở giá đã nhập", `hpr` thành
"lợi suất kể từ giá khởi điểm". Công thức chỉ có chân vào (`gia-hoa-von`, `co-lenh-rui-ro`) **tự
loại mình**. Nếu thay bừa mọi ô có chữ "giá" thì mua và bán cùng một giá ở mọi phiên → đường lãi lỗ
phẳng bằng 0, tức vẽ ra một điều sai. `history.test.ts` có ca riêng phân biệt hai cách làm.

Cùng quy tắc ấy dùng lại ở `presetInputs`: chân vào lấy phiên **đầu** chuỗi, chân hiện tại lấy phiên
**cuối** — nạp mẫu thành "mua đầu kỳ, bán phiên gần nhất" chứ không phải mua bán cùng giá ra 0%.

### Phủ và chi phí — số đo thật

| Đo gì                                  | Kết quả                                                  |
| -------------------------------------- | -------------------------------------------------------- |
| Vẽ theo thời gian được — nhóm Cơ bản   | **18/50** (11 chân giá + 7 cắt tiền tố)                  |
| Vẽ theo thời gian được — toàn Registry | **49/107**                                               |
| P/E của FPT qua 248 phiên              | 248/248 phiên ra số · **0,17 ms**                        |
| RSI theo từng phiên (cắt tiền tố)      | 234/248 ra số, 14 phiên đầu đúng ra `null` · **1,76 ms** |
| NFR-PER-02 cho phép                    | 100 ms                                                   |

Không debounce, không worker, không rAF — `useMemo` là đủ.

### Ngân sách — đo bằng A/B trong cùng một môi trường

Cổng 3000 đang có dev server của chủ dự án (PID 28124), mà `check-no-dev.mjs` chặn build vì
`next build` xoá rồi tạo lại `.next/` và làm dev server hỏng hẳn. Không tắt tiến trình của người
khác, nên dựng **worktree tạm** (`git worktree add --detach`, `node_modules` nối bằng junction) rồi
build hai lượt trong đó: một lượt HEAD sạch, một lượt có đủ đợt 0+1+2.

| Đo trong worktree                    | HEAD sạch | + đợt 0/1/2 |    Chênh |
| ------------------------------------ | --------: | ----------: | -------: |
| Trang nặng nhất (`loi-nhuan-rong`)   |  179,3 kB |    185,4 kB | **+6,1** |
| **Gói chung mọi trang đều tải**      |  161,1 kB |    161,1 kB |    **0** |
| Chunk biểu đồ (đợt 1 đo được 5,1 kB) |         — |      5,9 kB | **+0,8** |

Hai điều đọc ra:

- **Gói chung không nhích một byte** → không có gì rò vào bundle mà cả 117 trang phải tải. Đây là
  bất biến quan trọng nhất của nhánh 4 và nó được kiểm bằng A/B, không phải bằng suy luận.
- Đợt 1 đã đo được +5,2 kB, nên **đợt 2 tốn khoảng +0,9 kB** — dưới xa trần 6 kB/đợt tự đặt ở đợt 0.

⚠ **Con số TUYỆT ĐỐI của bảng trên không so được với cửa kiểm 170 kB.** Cùng một commit, `out/` cũ
trong repo chính cho gói chung 130,5 kB còn worktree cho 161,1 kB — chênh 30,6 kB do môi trường
build (junction `node_modules`, `.next/cache` lạnh), tôi chưa truy ra nguyên nhân. Suy ra thì
153,7 + 0,9 ≈ **154,6 kB**, vẫn dư ~15 kB, nhưng **đó là số suy chứ không phải số đo**.

### Còn lại

- [ ] **Chạy `npm run build && npm run size` trong repo chính để chốt con số tuyệt đối.** Cần chủ dự
      án tắt dev server ở cổng 3000 trước.
- [ ] `npm run verify:static` chưa chạy lại — `out/` hiện tại là bản build của đợt 1.
- [ ] 5 test đỏ baseline của `VIRTUALIZE_THRESHOLD` (xem mục "Đợt 1") vẫn chờ quyết định, **không
      phải do đợt này**.
- [ ] `ps` cần `salesPerShare`, `roa`/`bien-loi-nhuan-*`/`thanh-toan-*`/`vong-quay-*` cần doanh thu,
      tổng tài sản, tài sản & nợ ngắn hạn, tồn kho — **không suy ra được**, chờ số liệu thật của
      Finbox (giả định A1, rủi ro R-01). Thêm 8 dòng đó vào `Fundamentals` sẽ nâng "điền một phần"
      từ 21 lên 25.
- [ ] Muốn tra **mã ngoài 4 mã mẫu**: không có backend nên đường khả thi là JSON tĩnh mỗi mã
      (`fetch('/du-lieu/FPT.json')`) — đo được 22 kB thô/mã, 12 kB dạng mảng gọn, **không chạm cửa
      kiểm vì không phải JS**. Gọi API bên thứ ba thì khoá API nằm trong JS máy khách của bản tĩnh,
      không giấu được, cộng bản quyền dữ liệu thị trường VN. Cần chủ dự án quyết nguồn dữ liệu.

### Kiểm chứng

- `npm run check` — lint sạch, typecheck sạch, prettier sạch.
- **1.139 test xanh** (đợt 1: 1.081 → +58), đúng 5 đỏ baseline cũ.
- Test mới: `src/data/preset-inputs.test.ts` (22 ca) và `src/core/chart/history.test.ts` (25 ca),
  cộng 8 ca giao diện ở `charts.test.tsx` và 3 ca luồng thật ở `FormulaDetail.test.tsx`.
- Ca đáng nói nhất: **vòng khép kín** — nạp bộ mẫu vào `eps-co-ban` và `bvps` phải trả về đúng con
  số EPS và BVPS đã khai, chạy cho cả 4 mã. Nó chứng minh hai trường suy ra không mang thêm số tự
  đặt nào, chứ không chỉ là lời hứa trong JSDoc.
- `history.test.ts` **tự dựng chuỗi phiên** thay vì lấy từ `src/data`: ESLint chặn `src/core` gọi
  lên `@/data` (CON-02, và chặn đúng), và bộ mẫu rồi sẽ bị thay bằng báo cáo thật nên ca kiểm bám
  vào con số của nó sẽ đỏ vì lý do chẳng liên quan tới biểu đồ.

---

## Đợt 1 của biểu đồ — đường quét độ nhạy cho nhóm Cơ bản

### Yêu cầu

> "có thể cần bản vip để có thể xem chi tiết các bảng của bên nâng cao. nên là bây giờ vẽ trước các
> biểu đồ cho các công thức cơ bản đơn giản trước"

Hai việc tách rời. **Bản VIP là chuyện sau** — chủ dự án nói "có thể cần", nên đợt này KHÔNG dựng
cổng thu phí; chỉ đảm bảo về sau khoá được bằng một vị từ (`hasChart()`) thay vì một đợt sửa lan.
Việc làm ngay là vẽ cho nhóm cơ bản.

Phạm vi cắt bằng đúng dữ liệu đang có: `spec.level === 'basic'` — cùng trục Cơ bản / Nâng cao mà
FR-09 và `ModeToggle` vẫn dùng, nên không phải phát minh khái niệm mới.

### Phạm vi đo được, không phải ước

| Nhóm                               | Số công thức |
| ---------------------------------- | -----------: |
| `basic` + `sensitivity`            |       **50** |
| — trong đó vẽ được NGAY khi mở     |       **43** |
| — chờ chuỗi giá (chỉ báo kỹ thuật) |            7 |
| `advanced` + `sensitivity`         |           12 |

43 công thức vẽ được ngay trải khắp: 13 chỉ số doanh nghiệp, 11 lợi nhuận & cổ tức, 6 định giá,
4 phái sinh, 4 tiết kiệm, 3 phí & thuế, 1 rủi ro, 1 đầu tư.

### Đòn bẩy: 50 công thức, 0 dòng metadata

`runFormula()` thuần và đồng bộ, còn 208 trên 209 biến vô hướng đã khai sẵn `min` với `max`. Nên
quét một biến chỉ là gọi lại `runFormula` 42 lần rồi thu `{x, y}` — **không công thức nào phải khai
thêm gì, và công thức thứ 108 sau này tự có biểu đồ.**

Hệ quả kiến trúc: **KHÔNG dùng `CalcOutput.series` cho đường quét.** Nó là "một lần chạy trả một
chuỗi", còn đường quét là "N lần chạy, mỗi lần một điểm". Ép từng công thức tự trả `series` là quay
về 50 việc thủ công. Giữ `CalcOutput.series` cho ca duy nhất nó hợp — công thức tự nhiên sinh chuỗi
trong lúc tính, như lịch trả nợ 240 kỳ.

### Ba cái bẫy đã gặp và cách xử

**1. `min`/`max` là chặn NHẬP SAI, không phải dải hiển thị.** Biến `price` khai
`min: 0, max: 10_000_000` trong khi giá trị dùng thật là 92.000. Quét cả miền thì điểm hiện tại nằm
ở pixel đầu tiên bên trái và 40 điểm còn lại vô nghĩa. → Quét **±50% quanh giá trị hiện tại** rồi
kẹp vào `[min, max]`. Đó mới đúng câu hỏi biểu đồ độ nhạy sinh ra để trả lời.

**2. Chọn biến quét bị NHIỄU DẤU PHẨY ĐỘNG quyết định.** Xếp hạng biến theo biên độ đầu ra là đúng
(đó chính là định nghĩa độ nhạy), nhưng tỉ số đơn giản cho biên độ bằng nhau về mặt toán ở cả hai
biến: quét P/E theo giá cho đúng 2/3, quét theo EPS cũng đúng 2/3. Hai đường tính khác nhau nên số
thực lệch ở chữ số thứ mười sáu — và biểu đồ P/E hoá ra vẽ theo EPS chỉ vì phép chia rơi xuống dưới
một phần tỉ tỉ. → **Làm tròn ba chữ số trước khi so**; hoà thì theo thứ tự khai báo.

**3. Xếp hạng phải chốt bằng `defaultInputs`, không bằng giá trị đang gõ.** Nếu chốt theo inputs
hiện tại thì biến được quét nhảy sang biến khác **giữa lúc người dùng kéo thanh trượt** — trục X
đổi tên, biểu đồ nhảy, không ai đọc được. Chốt bằng mặc định biến `pickSweepVariable()` thành hàm
thuần của `spec`: xác định tuyệt đối, memo được, không lệch hydration.

### FR-06 ở tầng vẽ — ba tầng không lách được

`ChartPoint.y` khai `number | null`, nên hàm nào đi qua nó cũng BUỘC quyết định làm gì với `null`.
**Không có một cái `?? 0` nào trong cả nhánh này.**

1. `y` lấy thẳng `out.value`. Không thay bằng 0, không nội suy.
2. `extentOf()` bỏ qua mọi `null` → mức không tính được **không kéo trục**.
3. `linePath()` gặp `null` thì đóng đoạn và mở `M` mới → **đường ĐỨT**, một `<path>` nhiều đoạn con.

Cộng ba tín hiệu cho người đọc: vùng gạch chéo ở chỗ hở, câu mô tả ghi "3 trên 42 mức không tính
được", và bảng số hiện `— , —` ở đúng những dòng ấy.

Ca vàng chốt lại chuyện này: **quét EPS qua 0** — có mức `null`, và **tuyệt đối không mức nào ra 0**.

### Khả năng tiếp cận — hai quyết định khác thói thường

**`<svg aria-hidden="true">`.** Thông tin nằm trọn ở `<figcaption>` và bảng số. Nhét
`<title>`/`<desc>` dài vào SVG được NVDA, JAWS và VoiceOver xử rất khác nhau, mà người dùng vẫn
không lần qua 42 điểm bằng tai được. Ẩn hình, dựng lối đọc thật.

**Bảng số HIỆN, không `.visually-hidden`.** Cách phổ biến là giấu một bảng chỉ cho trình đọc màn
hình. Ở đây không giấu: người sáng mắt cũng cần con số chính xác — mắt đọc biểu đồ chỉ ra được xu
hướng, không ra được "15,21". Gói trong `<details>` nên không choán màn.

Hệ quả tốt cho việc kiểm: bảng ấy là **hợp đồng công khai với người dùng**, nên test bám vào nó
thay vì bám vào chuỗi `d` — chỉnh một pixel padding không làm đỏ ca nào. Không dùng snapshot SVG.

Không bao giờ chỉ dựa vào màu: dấu "giá trị hiện tại" có **chấm + vạch dọc nét đứt + nhãn chữ**;
chỗ ngắt có **gạch chéo + chữ trong bảng + ghi chú**.

**0 token màu mới.** `--color-accent-vivid` được dành sẵn từ đợt 4 cho đúng việc này và đã qua
`contrast.test.ts`; nhãn trục là chữ nên dùng `--color-muted`.

### Hai lỗi tự tìm ra khi viết test

- **`<details>` cũng map sang role `group`**, nên `role="group"` tôi đặt trên `<figure>` làm hai
  vùng lẫn nhau với cả trình đọc màn hình lẫn bộ kiểm. Bỏ đi: `<figure>` + `<figcaption>` qua
  `aria-labelledby` đã đúng ngữ nghĩa sẵn.
- **`<caption>` của bảng lặp y nguyên tiêu đề hình** → trình đọc màn hình đọc lại hai lần. Đổi
  thành "Số liệu — …".

Kèm một điểm giòn phải siết: từ khi màn có biểu đồ, `<figcaption>` trở thành TÊN của `<figure>`,
nên `getByLabelText(/Giá thị trường/)` khớp cả hình lẫn ô nhập. Sáu truy vấn cũ trong
`FormulaDetail.test.tsx` chỉ đang xanh vì biểu đồ nạp trễ chưa kịp gắn — đã siết về
`{ selector: 'input' }` trước khi chúng thành ca chớp.

### Đã đổi những file nào

| File                                            | Nội dung                                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/core/chart/types.ts`                       | hợp đồng `ChartModel`, `ChartPoint.y: number \| null`                                               |
| `src/core/chart/scale.ts`                       | `extentOf` · `niceStep` · `niceAxis` (4 lưới an toàn) · `linearScale`                               |
| `src/core/chart/path.ts`                        | `linePath` ngắt ở `null` · `gapsOf` · `fixed`                                                       |
| `src/core/chart/sweep.ts`                       | động cơ quét: dải ±50%, xếp hạng theo biên độ đầu ra                                                |
| `src/core/chart/table.ts`                       | `condensePoints` giữ đầu/cuối/đang-nhập/mọi mức lỗi                                                 |
| `src/core/chart/build.ts`                       | `buildChartModel()` — cổng duy nhất, không bao giờ ném lỗi                                          |
| `src/core/chart/index.ts`                       | cửa gom                                                                                             |
| `src/application/index.ts`                      | mở 6 hàm + 9 kiểu qua barrel chọn lọc                                                               |
| `src/ui/charts/` (8 file)                       | `FormulaChart` (ranh giới nạp trễ) · `ChartBody` · `ChartFrame` · `LineChart` · `SweepPicker` · css |
| `src/app/cong-thuc/[id]/FormulaDetail.tsx`      | nối khối 6; nhóm nâng cao giữ câu chờ                                                               |
| `src/application/i18n/vi.ts`                    | 2 khoá mới                                                                                          |
| `src/ui/tokens.test.ts`                         | chặn màu cứng trong thuộc tính SVG — lỗ mà bản cũ không với tới                                     |
| `src/core/chart/chart.test.ts`                  | 46 ca, có ca quét cả 107 công thức                                                                  |
| `src/ui/charts/charts.test.tsx`                 | 14 ca, đọc BẢNG SỐ chứ không đọc SVG                                                                |
| `src/app/cong-thuc/[id]/FormulaDetail.test.tsx` | 3 ca tích hợp + siết 6 truy vấn nhãn                                                                |

### Số đo

- `npm run lint` · `typecheck` · `format:check` — sạch.
- `npm run test` — **1.081 xanh** (trước đợt: 931), 5 đỏ **có sẵn từ trước**.
- `npm run build` — 117 trang tĩnh.
- `npm run size` — **đạt**: nặng nhất `/cong-thuc/loi-nhuan-rong/` **153,7 kB** JS nén, dưới cửa
  kiểm 170 kB, còn dư **16,3 kB**.

**Chunk biểu đồ tốn đúng 5,1 kB nén, nạp ở 50 trang có biểu đồ.** Trang nặng nhất tăng
148,5 → 153,7 kB, tức **+5,2 kB** — dưới trần tự đặt 6 kB mỗi đợt ở đợt 0. Mục "chunk nạp trễ" thêm
ở đợt 0 trả công ngay tại đây: nó là chỗ duy nhất đọc được con số 5,1 kB ấy.

Nhắc lại vì dễ nhầm: `next/dynamic` KHÔNG giấu chi phí khỏi cửa kiểm. 5,1 kB vẫn tính đủ vào 50
trang có biểu đồ; nó chỉ giữ chi phí khỏi 57 trang còn lại, trang danh sách, trang chủ và 404.

### Còn lại

- Nhóm **Nâng cao** (12 công thức `sensitivity`) và các loại biểu đồ khác vẫn ở khung chờ. Mở rộng
  là sửa **một vị từ** `hasChart()` — cũng chính là chỗ khoá vào bản trả phí nếu chủ dự án chốt làm.
- 7 chỉ báo kỹ thuật cơ bản vẽ được ngay sau khi có chuỗi giá; nút "Nạp mẫu" và "Dán chuỗi giá" đã
  nằm sẵn ở khối Số liệu từ đợt 0, nên chỉ cần hai cú bấm.
- Nợ baseline vẫn nguyên: 5 ca đỏ `VIRTUALIZE_THRESHOLD` (xem mục đợt 0).

---

## Đợt 0 của biểu đồ — dọn nền trước khi vẽ dòng nào

### Yêu cầu

> "mỗi một công thức khi xem chi tiết thì đều có phần biểu đồ. vậy hãy cho tôi những lời khuyên để
> làm biểu đồ cho hơn 100 công thức nếu khách muốn xem" — rồi chốt kế hoạch và nói "làm".

Chủ dự án chốt bốn hướng: **tự viết SVG** (không thêm dependency), **tự suy diễn biến quét kèm
dropdown cho người dùng đổi**, **nạp chuỗi mẫu có dán nhãn rõ**, và **làm `sensitivity` trước**
(phủ 72/107). Kế hoạch đầy đủ nằm ngoài repo; đây là đợt 0 của kế hoạch đó: **chưa vẽ gì cả**, chỉ
sửa những chỗ mà biểu đồ sẽ đứng lên.

### Ba bug thật, phát hiện lúc khảo sát chứ không phải chủ dự án báo

**1. `chartType === 'candlestick'` bị dùng nhầm vai làm cờ "công thức này cần chuỗi giá."**
`FormulaDetail.tsx:250` lấy loại BIỂU ĐỒ để quyết định có hiện nút "Dán chuỗi giá" và lối vào bảng
WF-05. Nến chỉ là **11 trong 34** công thức ăn chuỗi — 23 công thức còn lại (phân phối lợi suất,
sụt giảm từ đỉnh, hồi quy) báo "chưa đủ phiên giá" mà trên màn **không có lối nào để nạp**. Ngõ cụt
thật, chỉ là chưa ai bấm tới.

Sửa bằng `needsPriceSeries(formula, asOf)` ở `src/core/calc/run.ts`: chạy công thức với giá trị mặc
định và không có chuỗi, rồi xem nó có báo `MISSING_SERIES` hay không. Đây **chính là phép thử
`FormulaDetail.test.tsx:287-308` đang dùng** để chốt con số 34, nên nó đã được chứng minh đúng cho
toàn Registry và không tốn một dòng metadata nào. Đặt cạnh `missingInputLabels()` vì cùng một loại
câu hỏi: công thức này còn thiếu gì để ra số.

Đã cân nhắc và **bỏ** phương án khai tường minh `dataNeeds?: 'series' | 'bars'` trên `FormulaSpec`:
rõ hơn khi đọc schema nhưng tốn 34 lượt sửa cộng một validator, và một field khai tay thì **lệch
được** với thực tế — còn phép thử thì không.

**2. `applyPreset()` không đẩy `preset.bars` vào ctx.** Hàm chỉ đặt 9 ô vô hướng, nên nạp FPT cho
một công thức chuỗi vẫn ra "chưa đủ phiên giá": nút "Nạp mẫu" nhìn như không làm gì, đúng 34 công
thức. Bộ mẫu có sẵn **248 phiên OHLCV** từ đợt 9, chỉ là chưa ai chuyển sang. `DailyBar` có
`close: number`, hẹp hơn `SeriesRow` (`close: number | null`), nên gán vào được mà không mất mát.

Đây cũng là điều kiện tiên quyết cho hướng "nạp chuỗi mẫu" chủ dự án đã chốt: sửa xong thì **hai cú
bấm là có dữ liệu**.

**3. `draw-card.ts:137` in "Biểu đồ — gói WBS 3.3" vào tấm PNG người dùng chia sẻ ra ngoài.**
Đợt 14 đã dọn đường PDF nhưng bỏ sót đường PNG — ca kiểm chặn `/WBS|nhánh \d|gói \d/` chỉ soi màn
chi tiết nên không với tới Canvas. Nay lấy `t('export.chartPending')`, cùng câu với vùng in.

### Bốn công thức gắn sai `chartType`

`do-rong-dai-bollinger`, `phan-tram-b-bollinger`, `stochastic-k`, `ty-le-khoi-luong` đang là
`'none'` nhưng cả bốn **đều đọc `ctx.series`/`ctx.bars`** và **đều có biến chu kỳ quét được**
(`do-rong-dai-bollinger` có `[BOLLINGER_PERIOD, BOLLINGER_K]`, cả hai là slider đủ min/max/step).
Đổi sang `'sensitivity'`: **4 dòng để phủ thêm 4 công thức** ở đợt sau, không renderer mới, không
token mới. `none` còn 10, `sensitivity` lên 62.

Đã soi thêm 5 công thức nghi gắn sai — `rsi-wilder`, `roc-toc-do-thay-doi`,
`khoang-cach-gia-so-sma`, `do-bien-dong-nam-hoa`, `he-so-bien-thien` — và kết luận **không sai**:
chúng dựa trên chuỗi, đúng, nhưng đều có biến chu kỳ, và "RSI đổi thế nào khi chu kỳ chạy từ 5 tới
30 phiên" là câu hỏi độ nhạy thật, chữa đúng hiểu nhầm "RSI là con số tuyệt đối" mà người mới hay
mắc. Nhãn hiện tại đúng, chỉ chưa phải cách vẽ giàu thông tin nhất.

### Dọn ngân sách trước khi tiêu

**`ExportSheet` nạp trễ bộ vẽ Canvas.** `draw-card` đang được import TĨNH, nên toàn bộ mã vẽ nằm
trong gói cơ sở của cả 107 trang chi tiết dù đa số người dùng không bao giờ xuất PNG. Đổi sang
`await import('./draw-card')` bên trong tay bấm, **và bỏ dòng re-export ở `sheets/index.ts`** —
một dòng `export … from './draw-card'` ở barrel kéo nó về chỗ cũ ngay, vì mọi màn chi tiết đều
`import { ExportSheet } from '@/ui/sheets'`.

Phân biệt quan trọng, và là lý do phải làm việc này TRƯỚC khi có `chart-canvas.ts`: `import()`
**trần** thì chunk KHÔNG được ghi vào HTML nên rời hẳn khỏi "First Load JS"; còn `next/dynamic`
thì **vẫn bị tính**.

**`size-report.mjs` thêm mục "chunk nạp trễ riêng của từng trang".** Đo trên bản build: HTML của
`/cong-thuc/loi-nhuan-rong/` có thêm đúng một chunk mà `/cong-thuc/pe/` không có — chính khối WF-08
nạp trễ. Next vẫn ghi chunk vào HTML của trang thật sự dựng nó, nên `next/dynamic` **không giấu
được chi phí khỏi cửa kiểm 170 kB**. Đây là chỗ duy nhất để biết một khối mới đắt bao nhiêu trước
khi nó đẩy trang nào qua cửa. Trần tự đặt cho các đợt sau: **không đợt nào làm trang nặng nhất tăng
quá 6 kB nén.**

### Đã đổi những file nào

| File                                            | Sửa gì                                                        |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `src/core/calc/run.ts`                          | thêm `needsPriceSeries()`                                     |
| `src/core/calc/index.ts`                        | export nó                                                     |
| `src/application/index.ts`                      | export nó qua barrel chọn lọc                                 |
| `src/app/cong-thuc/[id]/FormulaDetail.tsx`      | `wantsSeries` thay cờ `candlestick`; `applyPreset` đẩy `bars` |
| `src/core/formulas/technical-volatility.ts`     | 4 công thức `none` → `sensitivity`                            |
| `src/ui/sheets/draw-card.ts`                    | bỏ chữ "gói WBS 3.3", lấy i18n                                |
| `src/ui/sheets/ExportSheet.tsx`                 | nạp trễ `draw-card`                                           |
| `src/ui/sheets/index.ts`                        | bỏ re-export `draw-card` (kèm lý do)                          |
| `scripts/size-report.mjs`                       | mục "chunk nạp trễ riêng của từng trang"                      |
| `src/core/calc/calc.test.ts`                    | 5 ca cho `needsPriceSeries`, khoá 34 / 11 / 23                |
| `src/app/cong-thuc/[id]/FormulaDetail.test.tsx` | 3 ca: 34 nút dán, P/E không có nút, nạp mẫu ra số             |

### Số đo

- `npm run lint` · `npm run typecheck` · `npm run format:check` — sạch.
- `npm run test` — **931 xanh**, 5 đỏ **có sẵn từ trước đợt này**.
- `npx vitest run src/core/calc/calc.test.ts` — 22/22.
- `npx vitest run src/app/cong-thuc/[id]/FormulaDetail.test.tsx` — 25/25.
- `npm run build` — 117 trang tĩnh.
- `npm run size` — đạt: nặng nhất `/cong-thuc/loi-nhuan-rong/` **148,5 kB** JS nén, dưới cửa kiểm
  170 kB. Mục "chunk nạp trễ" mới in ra đúng 2 trang có chunk riêng: WF-08 1,4 kB, WF-14 1,2 kB.

**Đợt này TRUNG TÍNH về dung lượng, và đó là kết quả đáng ghi lại chứ không phải thất bại.**
Đo baseline bằng `git stash` rồi build lại: nặng nhất cũng đúng **148,5 kB**. Nạp trễ `draw-card`
CÓ hiệu lực — chunk `827.*.js` chứa `toBlob` nặng **1,4 kB nén** và **0 trang HTML tham chiếu**,
tức nó đã rời hẳn khỏi First Load JS. Nhưng code mới của đợt này (`needsPriceSeries`, `wantsSeries`,
phần map `bars`) tốn xấp xỉ đúng chừng đó nên bù trừ hết.

Giá trị của việc nạp trễ vì vậy nằm ở phía trước, không phải ở con số hôm nay: `chart-canvas.ts`
của đợt 3 sẽ rơi vào chunk 827 ấy thay vì vào gói cơ sở của 107 trang chi tiết. Làm sau thì phải
gỡ ngược.

Dư địa thật trước cửa kiểm: **21,5 kB nén** (170 − 148,5).

### Còn lại

- **Nợ baseline, KHÔNG thuộc đợt này:** 5 ca đỏ ở `src/core/virtual-window.test.ts` và
  `src/ui/browse/VirtualList.test.tsx`. Nguyên nhân: `VIRTUALIZE_THRESHOLD` đã nâng lên **1000**
  (comment ghi "dưới ngưỡng này thì dựng thẳng, ảo hoá chỉ tổ thêm chỗ sai") nhưng 5 test vẫn chờ
  ảo hoá bật ở danh sách 107 mục. Đã xác nhận bằng `git stash`: đỏ y hệt khi chưa có thay đổi nào
  của đợt 0. Cần chủ dự án quyết: hạ ngưỡng lại, hay viết lại 5 test theo ngưỡng mới.

---

## Biểu tượng mới — vẽ lại khối hộp theo ảnh chủ dự án, rồi đổ dải màu

### Yêu cầu

> "đổi lại icon faculator thành icon này cho tôi" (kèm ảnh) — rồi ngay sau đó:
> "chuyển màu logo thành gradient"

### Bản cũ khác bản mới ở đâu

Bản cũ cũng là khối hộp, nhưng **ba mặt ba sắc xanh** để phân biệt. Ảnh chủ dự án đưa dùng
**một màu, ba mặt tách nhau bằng đường trắng**.

Chỗ lệch dễ bỏ qua nhất không phải màu mà là **tỉ lệ**. Đo trên ảnh, quy về nửa chiều rộng
khối: mặt bên cao 1,333 lần, độ sâu mặt trên 0,405 lần. Hình cũ của dự án ngược hẳn — mặt trên
sâu hơn mặt bên cao, nên khối trông bẹt. Lần dựng đầu tôi giữ nguyên tỉ lệ cũ và chỉ đổi màu;
nhìn ảnh render mới thấy sai, phải dựng lại toàn bộ toạ độ.

### Đã đổi file nào — và vì sao

- **`src/app/globals.css`** — bỏ ba màu logo cũ, thêm `--color-brand-from` `#2c6cbe` và
  `--color-brand-to` `#102f5a`. Tách khỏi `--color-accent` có chủ đích: màu nhấn bị ràng buộc
  bởi ngưỡng tương phản của chữ, còn màu logo thì không — đổi bảng màu giao diện không được
  kéo logo đổi theo.
- **`src/ui/navigation/BrandMark.tsx`** — hình học mới, ba mặt cùng một dải màu.
  - Khe hở **để trống chứ không tô trắng**: nền nào ở dưới thì lộ nền ấy, nên logo đặt lên
    thanh trên hay lên nền giấy đều đúng mà không cần biết trước nền là gì.
  - Khe chỉ trừ vào **cạnh TRONG**; cạnh ngoài giữ nguyên nên bóng ngoài vẫn là hình sáu cạnh
    sắc nét, không bị răng cưa ở đường viền.
  - Dải màu dùng `gradientUnits="userSpaceOnUse"`, KHÔNG phải `objectBoundingBox`: ba mặt là ba
    `<path>` riêng, tính theo khung bao từng path thì mỗi mặt một dải và chỗ giáp nhau gãy màu.
  - Stop màu viết bằng `style` chứ không phải thuộc tính `stop-color="var(…)"` — thuộc tính SVG
    không phân giải `var()`, chỉ thuộc tính CSS mới phân giải được.
- **`public/icon.svg`**, **`public/icon-maskable.svg`** — cùng hình học, màu ghi cứng (file này
  bị hệ điều hành đọc rời khỏi trang, không có `:root` để tra biến). Bản maskable dùng
  `<g transform>` thay vì chép lại toạ độ đã thu nhỏ, và đặt dải màu TRONG `<g>` để dải co theo
  khối — không thì bản maskable chỉ hứng được đoạn giữa của dải.
- **`scripts/gen-icons.mjs`** — bộ rasterise tay (dự án không thêm dependency ảnh) trước chỉ
  biết tô màu phẳng. Thêm `brandAt()`: chiếu điểm lên trục dải rồi nội suy trong không gian
  **sRGB**, đúng mặc định `color-interpolation` của SVG — nội suy tuyến tính hoá sẽ cho dải
  khác hẳn và PNG lệch màu so với chính file SVG nằm cạnh.
- **`public/sw.js`** — `ffb-v2` → `ffb-v3`. Tên file biểu tượng không đổi mà nội dung đổi, nên
  người đã cài PWA sẽ lấy bản cũ từ kho, có khi hàng tháng, nếu không nâng số này.

### Lỗi CÓ SẴN bắt được trong lúc làm — `icon.svg` chưa bao giờ dựng được

Kiểm chéo bằng cách nạp `/icon.svg` vào `<img>` trong Chrome thì nó **hỏng**, còn PNG thì tải
bình thường. Nguyên nhân: comment trong file viết tên biến CSS đầy đủ (`--color-accent` ở bản
cũ, `--color-brand-from` ở bản tôi vừa viết). **Đặc tả XML cấm hai dấu gạch ngang liền nhau bên
trong comment**, nên trình duyệt từ chối dựng cả file.

Hệ quả suốt thời gian qua: favicon SVG và mục `image/svg+xml` trong manifest hỏng im lặng.
Không lỗi nào hiện ra, `existsSync('out/icon.svg')` vẫn xanh vì file vẫn nằm đó — và cửa kiểm
cũ chỉ kiểm đúng chừng ấy.

Đã sửa cả hai file (viết tên biến trần, không hai gạch đầu) và thêm cửa kiểm ở
**`scripts/verify-static.mjs`**: bắt đúng điều kiện gây lỗi. **Đã thử phá lại để chắc nó cắn** —
chèn lại `--` vào comment thì kết quả tụt xuống 17/18 và báo đúng tên file.

### Kiểm chứng

`npm run check` 45 file · **914 test** xanh. `npm run verify:static` **18/18**.

| Kiểm                                          | Kết quả                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| PNG (rasterise tay) so SVG (trình duyệt dựng) | lệch trung bình **0,63 / 255**; 0,9% pixel lệch > 8, dồn ở cung bo góc                           |
| `/icon.svg` nạp được vào `<img>`              | 512×512, đọc pixel được (trước khi sửa: **hỏng**)                                                |
| Logo ở **cỡ thật 26px**                       | rasterise đúng 26px rồi phóng nearest-neighbour — ba mặt còn tách rõ, khe dọc thành một vệt sáng |
| Cửa kiểm XML mới                              | phá thử → **FAIL** đúng chỗ, khôi phục → OK                                                      |

Chụp màn ở cỡ thật chứ không phóng vector: `captureScreenshot` với `scale` là Chrome **dựng lại
vector ở độ phân giải cao** — nhìn thì đẹp nhưng không nói được gì về cỡ 26px. Phải vẽ SVG vào
canvas đúng 26px rồi mới phóng bằng nearest-neighbour thì mới thấy đúng từng pixel người dùng nhận.

---

## Nút "Nâng cao" bấm vào không đổi gì — nối vế thứ hai của FR-09

### Chủ dự án báo

> "bây giờ khi click vào tab nâng cao nhưng chưa thấy điều gì xảy ra"

### Đo trước, đoán sau

Lái Chrome thật ở khổ 390×844 trên bản build, ép về Cơ bản rồi bấm "Nâng cao", chụp lại toàn bộ
chữ trong `<main>` trước và sau:

| Màn                | Sau khi bấm                                             |
| ------------------ | ------------------------------------------------------- |
| Trang chủ          | chữ trên màn **y hệt**                                  |
| `/cong-thuc/`      | **y hệt**                                               |
| `/du-lieu/`        | **y hệt**                                               |
| Chi tiết P/E       | chỉ **gập** mục giải thích đầu — mất chữ, không thêm gì |
| Chi tiết `lai-kep` | chạy đúng: ô nhập 4 → 5, bảng biến 9 → 12               |

Không có lỗi console. Nút không hỏng: `aria-pressed` lật, ghi được vào localStorage, nhớ qua
tải lại. Nó chỉ **không có gì để làm**.

Nguyên nhân đếm được trên Registry: **9 / 107** công thức có biến `level: 'advanced'`. 98 công
thức còn lại mọi biến đều `basic` nên `variablesForLevel()` trả cùng một danh sách ở hai chế độ.
Đó KHÔNG phải lỗi dữ liệu — phần lớn công thức thật sự chỉ có 2–4 ô nhập hiển nhiên.

Wireframe chốt FR-09 bằng **hai** câu:

1. "Nhãn Cơ bản / Nâng cao hiển thị trên mỗi công thức" — đã có, là badge trên thẻ.
2. "Chế độ Nâng cao mở toàn bộ tham số **và công thức phức tạp**" — **chưa nối dây ở đâu cả**.

Trong khi Registry đã sẵn sàng cho vế 2: **78 công thức `basic` / 29 `advanced`**.

Còn payload nặng nhất của nút này là WF-04 ("toàn bộ tham số, luồng móc nối, ô tự động, cảnh
báo kế thừa") — chính là gói 3.2.2 đang hoãn. Nút đã lắp trước màn mà nó mở.

### Chốt với chủ dự án

Đưa ba lựa chọn kèm số đo; chủ dự án chọn **lọc danh sách theo cấp độ**. Đánh đổi đã nói rõ
trước khi làm: mặc định sản phẩm là chế độ Cơ bản, nên người mới vào thấy **78 thay vì 107**.

### Đã đổi file nào — và vì sao

**Tầng Domain**

- **`src/core/registry/search.ts`** — thêm `formulasForLevel()` (chế độ Cơ bản chỉ giữ công thức
  mức `basic`) và `countHiddenByLevel()` (bao nhiêu công thức khớp bộ lọc hiện tại nhưng đang bị
  giấu). Hàm sau đi qua chính `selectFormulas()` chứ không tự lọc lại — một bộ lọc thứ hai viết
  tay là chỗ để con số nói ra và danh sách bày ra lệch nhau.
- **`src/core/registry/index.ts`** — xuất hai hàm; sửa luôn dòng chú thích còn ghi "hiện 21 / 107".
- **`src/application/index.ts`** — mở cửa cho tầng giao diện (CON-03).

**Giao diện**

- **`src/ui/browse/HiddenByLevelNote.tsx` + `.module.css`** (mới) — dòng "N công thức nâng cao
  đang ẩn · Bật chế độ Nâng cao". Một component dùng chung cho cả ba màn có danh sách, không
  chép ba lần: đây là chỗ duy nhất giải thích vì sao danh sách ngắn đi, ba màn lệch chữ nhau là
  ba câu trả lời khác nhau cho cùng một câu hỏi. Nút bật nằm ngay trong câu chứ không dẫn sang
  màn Cài đặt.
- **`src/app/cong-thuc/FormulaBrowser.tsx`** — lọc `pool` trước khi lọc/tìm; **mọi bộ đếm cũng
  chạy trên `pool`** (số trên chip lọc mà không khớp số công thức bấm vào được trông như lỗi
  đếm). Thêm khối rỗng riêng cho trường hợp rỗng-vì-chế-độ, kèm nút bật.
- **`src/app/tim-kiem/SearchScreen.tsx`** — cùng luật; `HotCategories`, dòng "xem tất cả N" và
  khối gợi ý đều lấy từ `pool`. Khớp từ khoá nhưng mọi kết quả đều nâng cao thì **không** nói
  "không tìm thấy" — nói đúng chuyện đang xảy ra kèm nút bật.
- **`src/app/HomeSearchPanel.tsx`** — cùng luật cho ô tìm ở trang chủ.
- **`src/application/i18n/vi.ts`** — 4 câu mới. Chữ cố ý khác `detail.hiddenInBasic` vì chỗ này
  ẩn CÔNG THỨC, chỗ kia ẩn BIẾN.

**Cửa kiểm**

- **`scripts/verify-static.mjs`** — check `/cong-thuc/` đổi từ "≥ 21 link" thành **"đủ 107 link"**.
  Đây là chỗ gác đúng rủi ro của thay đổi này: `StaticFormulaList` là server component, không
  đọc localStorage, nên HTML tĩnh phải luôn có đủ đường vào cho cả 107. Ai đó "sửa cho nhất
  quán" bằng cách lọc luôn ở fallback là lặng lẽ giấu 29 URL khỏi Google mà build vẫn xanh.

**Test** — `search.test.ts` (+11), `registry.test.ts` (+3, chạy trên thư viện thật),
`HiddenByLevelNote.test.tsx` (mới, 5), `HomeSearchPanel.test.tsx` (+2).

### Hai chỗ cố tình KHÔNG làm

- **Khối "Công thức dùng hằng ngày" ở trang chủ không bị lọc.** Nó là kệ ghim tay của FR-20,
  không phải danh sách duyệt; và nó do server dựng (`children` của `HomeSearchPanel`) đúng để
  `CategoryGrid` + nhánh `tile` của `FormulaCard` không lọt vào gói máy khách (NFR-PER-04). Đổi
  sang client để lọc là mất tính chất đó, mà ở chế độ Cơ bản chỉ bớt đúng **1 trên 18** thẻ.
- **`/du-lieu/` và 98 trang chi tiết không có biến nâng cao vẫn không đổi gì khi bấm nút.** Đó
  là phần WF-04 (gói 3.2.2) còn hoãn, không sửa được bằng đợt này.

### Hai lỗi bắt được trong lúc làm

- **Ca kiểm "đạt mà rỗng".** Ca kiểm mới dùng `a[href^="/cong-thuc/<id>/"]` để tìm thẻ. Dưới
  jsdom `next/link` **cắt gạch chéo cuối**, nên selector không bao giờ khớp — vế "không thấy"
  luôn đúng kể cả khi màn hỏng. Chỉ lộ ra vì vế "phải thấy" đỏ. Đã thay bằng hàm chấp nhận cả
  hai dạng, kèm chú thích. Bản build thật giữ gạch chéo (`verify:static` đo được).
- **`HomeSearchPanel.test.tsx` đỏ đúng chỗ nên đỏ.** Ca "Xem tất cả nói đúng TỔNG" đếm trên
  `FORMULAS` trọn bộ (58) trong khi panel mặc định chạy chế độ Cơ bản (43). Sửa ca kiểm đếm trên
  đúng bộ mà màn dùng, không sửa màn.

### Kiểm chứng

`npm run check` 45 file · **914 test** xanh. `npm run build` 107 trang.
`npm run verify:static` **17/17**, trong đó `107 / 107 link công thức khác nhau`.
`npm run size` 148,2 kB nặng nhất, dưới cửa kiểm 170 kB.

Lái Chrome thật trên **bản build** (không phải dev), khổ 390×844:

| Tình huống                                         | Kết quả                                                    |
| -------------------------------------------------- | ---------------------------------------------------------- |
| `/cong-thuc/` bấm "Nâng cao" ở thanh trên          | 78 → **107** công thức, dòng báo biến mất                  |
| Bấm nút ngay trong dòng báo                        | 78 → 107, ghi `mode=advanced` vào localStorage             |
| Nhóm "Tài chính DN" (2/2 nâng cao) ở chế độ Cơ bản | khối rỗng riêng + nút bật → bấm ra **2 công thức**         |
| Trang chủ gõ "gia"                                 | dòng "15 công thức nâng cao đang ẩn", bật thì hết          |
| HTML tĩnh tải qua mạng                             | **107** link công thức                                     |
| Vùng chạm nút trong dòng báo                       | **143×44px** (rect chỉ 126×17 — lớp phủ gánh phần còn lại) |
| Chụp ở chế độ xám hoàn toàn (NFR-USA-06)           | dòng báo tách khỏi nền bằng khối nền + gạch chân           |

Không có lỗi console.

---

## Thêm đường ra khỏi màn chi tiết — nút quay lại

### Lỗ hổng

Chủ dự án báo: vào một công thức rồi thì **không có lối quay về danh sách** để chọn cái khác.
Đúng vậy, và không chỉ ở màn chi tiết — wireframe vẽ hàng đầu của **mọi màn trong** là
`‹ tiêu đề` (WF-03, WF-04, WF-05, WF-08, WF-09, WF-14), bản dựng bỏ sót dấu `‹` ấy ở cả ba màn
`/cong-thuc/[id]/`, `/du-lieu/` và `/tim-kiem/`.

Đường ra duy nhất còn lại là bấm tab "Công thức" ở thanh dưới — mà tab đó không đọc ra là "quay
lại", và nó ném người dùng về danh sách trắng trơn, mất sạch bộ lọc vừa đặt. Với 107 công thức
thì lọc lại từ đầu là một hình phạt thật.

### Đã làm

- **`src/ui/navigation/BackLink.tsx`** + **`.module.css`** (mới) — nút quay lại dùng chung.
- **`src/application/last-list-url.ts`** + test (mới, 13 ca) — phần thuần nhớ màn danh sách.
- Lắp vào cả ba màn trong; **`FormulaBrowser.tsx`** ghi lại URL danh sách đang đứng.
- **`vi.ts`** — thêm `nav.backToList`.

### Bốn quyết định

**1. Thẻ `<a>` thật, KHÔNG phải `history.back()`.** `back()` giữ được bộ lọc, nhưng hỏng ở đúng
chỗ hay gặp nhất: trang chi tiết được Google lập chỉ mục (FR-25) nên vào thẳng từ ngoài là
đường vào thường xuyên; lúc đó lịch sử không có mục nào của site và `back()` ném người dùng **ra
khỏi sản phẩm**. Link thật thì luôn tới một chỗ có thật, chạy được cả khi JavaScript chưa tải
xong, và bấm chuột phải mở tab mới được.

**2. Có chữ chứ không chỉ mỗi mũi tên.** Wireframe vẽ `‹` trơn — nhưng đúng cái mũi tên trơn ấy
là thứ chủ dự án tìm không ra. Thêm chữ nói rõ sẽ về đâu, và trình đọc màn hình có ngay một cái
tên tử tế mà không phải bịa `aria-label`.

**3. Nhãn là "Danh sách công thức", KHÔNG phải "Công thức".** Màn chi tiết đã có tiêu đề khối
"Công thức" cho phần biểu thức; dùng lại đúng chữ ấy là hai thứ khác nhau mang cùng một tên trên
cùng một màn. Ca kiểm cũ `getByText('Công thức')` đỏ ngay lúc thử — nó bắt đúng sự mập mờ này.

**4. Nhớ bộ lọc bằng `sessionStorage`, không phải `localStorage`.** Đây là ngữ cảnh của MỘT lượt
duyệt. Mở lại trình duyệt hôm sau mà nút quay lại vẫn nhớ bộ lọc hôm qua thì mới là lạ.

### Ranh giới an toàn

Nội dung `sessionStorage` sửa được bằng tay và giá trị của nó **đi thẳng vào `href`**. Nên
`parseListUrl()` chỉ nhận đường dẫn nội bộ trỏ đúng vào màn danh sách, chặn `javascript:`,
`data:`, URL tuyệt đối, **và cả `//tên-miền-khác/`** — cái cuối nhìn như đường dẫn nội bộ nhưng
trình duyệt hiểu là tên miền khác. Có test riêng cho từng ca.

### Hai chỗ đo mới lộ ra khi kiểm bằng trình duyệt thật

- **Vùng chạm tràn hết bề ngang (366px trên khổ 390px).** Ba màn đều đặt nút trong flex CỘT, mà
  flex cột mặc định `align-items: stretch` — bấm vào khoảng trống bên phải chữ cũng nhảy trang.
  Thêm `align-self: flex-start`, còn đúng 164×44px.
- **`/tim-kiem/` không có nút trong HTML tĩnh.** Không phải lỗi: cả màn đó có marker
  `BAILOUT_TO_CLIENT_SIDE_RENDERING` vì `useSearchParams()`, và nó vốn `noindex`. Trang chi tiết
  và `/du-lieu/` thì có thẻ `<a>` thật trong HTML tĩnh.

### Kiểm chứng

Lái Chrome thật, bấm chuột thật, bốn tình huống:

| Tình huống                                                  | Kết quả                                            |
| ----------------------------------------------------------- | -------------------------------------------------- |
| Danh sách trơn → công thức → quay lại                       | về `/cong-thuc/`, vùng chạm 164×44px, không bị che |
| Lọc `?q=sharpe&category=risk` → công thức → quay lại        | về **đúng** `/cong-thuc/?q=sharpe&category=risk`   |
| Vào thẳng `/cong-thuc/rsi-wilder/`, chưa từng xem danh sách | về `/cong-thuc/` — vẫn ở trong sản phẩm            |
| `/du-lieu/` và `/tim-kiem/`                                 | đều có nút, 164×44px                               |

Lần tải sạch: không lỗi console nào.

**Bài học về chính bộ kiểm:** lần chạy đầu báo tình huống 3 hỏng. Sai ở harness — tôi gọi
`sessionStorage.clear()` khi đang ở `about:blank`, tức xoá kho của origin KHÁC, nên giá trị cũ
của `localhost:3000` vẫn còn. Phải xoá khi đang đứng trên chính origin đó.

`npm run check` 44 file · **893 test** xanh · `verify:static` **17/17** (thêm một check mới canh
đúng lỗ hổng này trên HTML tĩnh) · `npm run size` 146,8 kB, dưới cửa kiểm.

---

## Sửa lỗi — "lỗi khi click vào xem công thức"

### Triệu chứng và nguyên nhân

Mọi trang trả **500** với `Cannot find module './124.js'`. Không phải lỗi trong code: **tôi đã
chạy `npm run build` trong khi dev server đang chạy**, và dev server hỏng hẳn từ đó. Nó không tự
hồi phục — phải tắt dev, xoá `.next`, bật lại.

Điều làm lỗi này tốn công truy là **nó trông y hệt lỗi trong sản phẩm**: thông điệp chỉ vào file
trong `.next/server/app/…`, không hề nhắc gì tới việc vừa có một bản build chạy qua.

Đã khởi động lại và kiểm chứng **không có lỗi thật nào** trong 107 công thức:

- quét HTTP toàn bộ 107 route chi tiết — **107/107 trả 200**;
- lái Chrome **bấm chuột thật** từ màn danh sách vào từng công thức, bắt ngoại lệ JS,
  `console.error`, yêu cầu mạng hỏng, và rà màn xem có lọt `NaN`/`Infinity`/`undefined` —
  **107/107 sạch**. Một ca `ev-sales` báo hỏng nhưng thử lại 3/3 đạt: nhiễu nhất thời của
  harness, không phải lỗi.
- 34 công thức chuỗi giá hiện đúng `— , — %` kèm cảnh báo "Thiếu dữ liệu chuỗi" như thiết kế.

### Một hướng sửa đã thử và ĐÃ BỎ — ghi lại để khỏi ai thử lại

Giả thuyết đầu: `next build` dọn sạch `distDir`, tức nó **ghi đè `.next` của dev server**. Vậy
cho `next build` một `distDir` riêng (`.next-build`) là xong. Đã cài bằng hàm theo `phase` của
`next.config.mjs`.

**Đo lại: vẫn hỏng y như cũ.** Giả thuyết sai. Chụp cây file trước/sau build cho thấy `next build`
**không đụng một file nào** ngoài `.next*` và `out/` — thứ duy nhất đổi thêm là mtime của chính
thư mục gốc, vì hai thư mục kia bị xoá rồi tạo lại trong đó.

Nguyên nhân thật là **bộ theo dõi file của dev server**: nó thấy thư mục gốc đổi nên dựng lại đồ
thị module, webpack đánh số lại chunk phía máy chủ, còn bundle đã phát đi vẫn đòi số cũ — nên ra
`Cannot find module './124.js'` và `__webpack_modules__[moduleId] is not a function`. Không có
công tắc cấu hình nào tắt được chuyện đó.

Hai giả thuyết khác cũng đã loại bằng thí nghiệm:

- **Không phải nhiễu từ file mới:** tạo tay 400 file trong `out/` và `.next-build/` — dev vẫn 200.
- **Không phải `next-env.d.ts`/`tsconfig.json` bị viết lại:** theo dõi nội dung suốt lúc build,
  không đổi lần nào.

Nên `distDir` đã được **gỡ bỏ**: nó không sửa được gì mà lại kéo `.next-build` vào phạm vi
TypeScript (`tsconfig.json` chỉ `exclude` `.next`).

### Việc thật sự làm — cửa gác `prebuild`

- **`scripts/check-no-dev.mjs`** (mới) + **`prebuild`** trong `package.json`.

Dò cổng 3000/3001/3002 ở máy mình; có ai đang lắng nghe thì **dừng build** kèm câu nói rõ chuyện
gì sắp xảy ra và phải làm gì. Chặn được đúng cái sai đã mắc hai lần, thay vì để nó lặp lại lần ba.

Ba điều để cửa gác không bao giờ thành phiền phức:

- trên CI và Cloudflare Pages không có gì lắng nghe nên nó im lặng cho qua;
- bản thân phép dò mà lỗi thì **cho build chạy tiếp** — cửa gác không được là lý do một bản
  build hỏng;
- muốn bỏ qua: `FFB_ALLOW_BUILD_WITH_DEV=1 npm run build`.

Đã thử đủ ba trường hợp: không có dev → cho qua; có dev → chặn, **và dev vẫn sống nguyên** (kiểm
lại 4 route đều 200); có biến môi trường → bỏ qua được.

- **`.prettierignore`** — thêm `.claude/settings.json`. Công cụ tự ghi lại file này mỗi lần đổi
  quyền nên định dạng xong là lần sau lại lệch, làm `npm run check` đỏ vì một file không ai sửa tay.

### Kiểm chứng — sau khi thêm cửa gác

`npm run check` 42 file · **870 test** xanh · `npm run build` xong · `verify:static` **16/16** ·
`npm run size` 148,7 kB, dưới cửa kiểm.

---

## Đủ 107 công thức — nối 34 công thức chuỗi giá và phản biện lại toàn bộ

34 công thức chuỗi giá đã được viết ra ở đợt trước nhưng nằm ngoài Registry: 5 file trên đĩa,
typecheck sạch, mà `index.ts` không nhắc tới file nào. Đợt này nối chúng vào và — quan trọng hơn
— **kiểm chứng lại toàn bộ con số**.

### 1. Nối vào Registry, từng file một

Mỗi file một `import` và một dòng `...MẢNG`, chạy `formulas.test.ts` xong mới sang file sau.
Không gộp, để hỏng ở đâu biết ngay ở đó.

| File                      | Công thức | Ca kiểm sau khi nối |
| ------------------------- | --------- | ------------------- |
| `risk-drawdown.ts`        | 4         | 105 → 109           |
| `risk-volatility.ts`      | 6         | 109 → 115           |
| `risk-ratios.ts`          | 6         | 115 → 121           |
| `technical-trend.ts`      | 9         | 121 → 130           |
| `technical-volatility.ts` | 9         | 130 → **139**       |

Registry: **107 / 107**. Mười hai nhóm đủ cả, rủi ro 17/17 và kỹ thuật 18/18.

### 2. Phản biện — 186 phép kiểm, không tin `tests[]`

Đây là phần tốn công nhất và là lý do đợt này đáng tin.

`tests[]` và hàm `calc` do **cùng một tác giả** viết ra. Cả hai cùng sai một kiểu thì test vẫn
xanh mà công thức vẫn sai — test tự khai không chứng minh được gì. Nên toàn bộ 34 công thức đi
qua một lượt tính lại **độc lập**: trích vector kiểm ra JSON, rồi viết script Node riêng tự cài
từng chỉ báo từ `latex`/`expression` và định nghĩa chuẩn trong sách, **không đọc hàm `calc`**.

| Nhóm                 | Con số tính lại | Tiền đề ca cảnh báo |
| -------------------- | --------------- | ------------------- |
| risk-drawdown        | 14              | 6                   |
| risk-volatility      | 21              | 9                   |
| risk-ratios          | 22              | 16                  |
| technical-trend      | 34              | 18                  |
| technical-volatility | 31              | 15                  |
| **Cộng**             | **122**         | **64**              |

**Kết quả: 0 sai lệch.**

Cái bẫy lớn nhất khi làm việc này là **báo oan vì khác quy ước**. Phần lớn chỉ báo có hơn một
cách tính đúng, nên script tính đủ mọi quy ước hợp lệ rồi mới kết luận — chỉ báo lỗi khi KHÔNG
quy ước nào khớp. Chính cách làm đó phân biệt được thật:

- RSI khớp **Wilder** (hệ số 1/n) và KHÔNG khớp EMA thường (2/(n+1)) — đúng như tên công thức khai;
- Bollinger khớp **σ mẫu** (n−1) chứ không phải σ tổng thể;
- Calmar khớp **CAGR ÷ MDD**, không phải lợi suất bình quân × số phiên ÷ MDD;
- lãi suất phi rủi ro quy về phiên là **hình học** `(1+r)^(1/m)−1`, không phải chia thẳng `r/m`.

Toàn bộ bảng quy ước đã chốt nay ghi trong [src/core/formulas/README.md](src/core/formulas/README.md)
— để lần sau ai sửa còn biết con số dựa trên giả định nào.

64 tiền đề ca cảnh báo cũng được kiểm riêng chứ không tin nhãn: ca khai `DIVIDE_BY_ZERO` thì
mẫu số phải **thật sự** bằng 0, ca khai `MISSING_SERIES` thì chuỗi phải **thật sự** ngắn hơn
mức tối thiểu. Kiểm được cả những chỗ tinh: VaR trên chuỗi chỉ đi lên cho phân vị `+0.0064`,
tức VaR âm — `MEANINGLESS` là đúng mã.

Một quan sát, không phải lỗi: cùng ý "số phiên trong năm bằng 0" nhưng Sharpe trả
`DIVIDE_BY_ZERO` còn "độ biến động năm hoá" trả `MEANINGLESS`. Hai mã khác nhau vì hai phép
tính khác nhau — Sharpe có phép chia thật, còn kia chỉ nhân `√0`. Mỗi mã đúng tại chỗ của nó.

### 3. Bốn ca kiểm vỡ vì Registry lớn lên — sửa TIỀN ĐỀ, không sửa sản phẩm

Cả bốn đều đỏ vì tiền đề của chúng dựa vào việc thư viện **còn dở**, chứ component không sai.

**`FormulaDetail.test.tsx` — "mọi công thức đều có kết quả tính được với giá trị mặc định".**
Đúng khi cả 73 công thức đầu chỉ ăn biến vô hướng. 34 công thức chuỗi giá thì không thể ra số
khi người dùng chưa nạp chuỗi, và ép chúng ra số nghĩa là bịa — đúng thứ FR-06 cấm. Đã xem tận
mắt màn hình dựng ra gì: `— , — %` kèm **"Thiếu dữ liệu chuỗi · Cần ít nhất 30 phiên giá, hiện
mới có 0"**, một dòng chỉ đường, và nút "Nạp mẫu". Không phải ngõ cụt.

Nên bất biến được viết lại cho đúng, và **chặt hơn bản cũ**:

- không công thức nào là ngõ cụt — hoặc ra số, hoặc phải có mã cảnh báo **và** câu chỉ cách khắc phục;
- lý do HỢP LỆ duy nhất để không ra số với giá trị mặc định là `MISSING_SERIES`. Mọi mã khác
  nghĩa là chính bộ giá trị mặc định của công thức tự mâu thuẫn — đó là lỗi thật;
- và đúng **34** công thức ở trạng thái chờ dữ liệu, tất cả thuộc nhóm `risk`/`technical`.

Ca thứ ba là thứ bản cũ không có: nó khoá con số 34 lại, nên ai đổi hợp đồng dữ liệu là biết ngay.

**`HotCategories.test.tsx` (2 ca).** Cả hai đo hành vi "đọc danh sách được truyền vào", nhưng
lấy `FORMULAS` nguyên vẹn làm dữ liệu. Registry còn dở thì sẵn có nhóm rỗng và sẵn có ô lệch
`expectedCount` nên tiền đề tự thoả; đủ 107 thì mọi nhóm đều đầy, tiền đề tắt ngóm. Nay dựng
một danh sách rút gọn riêng (3 công thức của 2 nhóm), thêm một ca mới canh trường hợp Registry
đã đủ.

**`HomeSearchPanel.test.tsx`.** Viết cứng từ khoá `'lai kep'` với giả định nó chỉ thuộc mảng cá
nhân. Tới 107 công thức thì nó khớp cả `gia-tri-tuong-lai` và `loi-suat-nam-hoa` bên chứng
khoán, lọc sang Chứng khoán không còn rỗng. Nay **dò từ khoá lúc chạy**: lấy tên ngắn nhất của
một công thức mảng cá nhân mà kết quả tìm không dính mảng chứng khoán. Ca kiểm đo hành vi "lọc
làm rỗng thì mách lối ra", không đo tình cờ của nội dung Registry.

### 4. `scripts/size-report.mjs` — bỏ hằng số đếm tay

Script viết cứng `FORMULAS_NOW = 21`. Đúng đúng một lần rồi lặng lẽ sai: ở mốc 107 nó vẫn chia
cho 21 và in ra dự báo **"~244,8 kB — VƯỢT ngưỡng 200 kB khi đủ 107 công thức"**, trong khi đã
đủ 107 và đang ở 148,7 kB. Một dự báo sai lại còn to tiếng hơn số đo thật.

Nay đếm thẳng từ `summaries.generated.ts`, và khi đã đủ 107 thì **thôi ngoại suy**, chỉ in số đo.

### 5. Số đo ở mốc 107

| Đại lượng                      | Số đo                                                              |
| ------------------------------ | ------------------------------------------------------------------ |
| `npm run check`                | 42 file · **870 test** xanh                                        |
| `npm run build`                | **117 trang** tĩnh                                                 |
| `npm run verify:static`        | **16/16** đạt · `/cong-thuc/` có đúng **107 link** trong HTML tĩnh |
| Chỉ mục nhẹ (mọi trang tải)    | **9,5 kB** nén cho cả 107 công thức — 0,1 kB mỗi công thức         |
| Trang nặng nhất, First Load JS | **148,7 kB** — dưới cửa kiểm 170 kB và ngân sách 200 kB            |

Nỗi lo dung lượng của đợt 7 chính thức khép lại **bằng số đo chứ không bằng lập luận**: hồi đó
ngoại suy từ 21 công thức cho ra "sẽ vượt 200 kB". Việc tách chỉ mục nhẹ cộng khai `sideEffects`
ở đợt 13 khiến 107 công thức chỉ tốn 9,5 kB trên mọi trang.

### Còn lại

- **Thiếu công thức Beta.** Đủ 107 mà không có Beta, trong khi `categories.ts` liệt nó đầu nhóm
  Rủi ro và `capm` phải để beta thành ô nhập tay, còn `ty-so-treynor` thì mô tả ô beta là "lấy
  từ công thức Beta" — trỏ vào thứ không tồn tại. Nhóm Rủi ro đã đầy 17/17 nên thêm Beta buộc
  phải nâng `expectedCount` lên 18 hoặc bỏ một công thức khác. **Cần chủ dự án quyết.**
- **FR-15 chưa chạy.** `dependsOn` mới khai hai chỗ, `inherited()` chưa ai gọi, `ctx.upstream`
  chưa ai đọc.
- **34 màn mới mở lần đầu là một cảnh báo, không phải một con số.** Đúng thiết kế, nhưng khác
  hẳn 73 công thức cũ vốn chạy được ngay. Có nên nạp sẵn một chuỗi mẫu hay không là quyết định
  sản phẩm, chưa làm.

---

## Sửa lỗi — "không bấm chuyển tab được"

Chủ dự án báo bấm thanh điều hướng dưới không chuyển màn. Dựng lại được lỗi và tách ra **ba
nguyên nhân khác nhau**, cả ba chỉ tồn tại lúc chạy dev; bản `output: 'export'` không dính.
Đã kiểm: 0 trên 29 file HTML trong `out/` có phần tử của lớp phủ dev.

### 1. Ba dev server cùng chạy, một cái treo cứng

`netstat` thấy ba tiến trình `next dev` ở cổng 3000, 3001, 3002, cùng ghi vào một thư mục
`.next`. Cái ở cổng 3000 — cổng mặc định, tức là cổng chủ dự án đang mở — **không trả lời một
yêu cầu nào**: `curl` treo quá 120 giây rồi chết với mã 56. Hai cái kia trả 200 bình thường trên
cả bốn đường dẫn nav. Bấm tab lúc đó là gửi yêu cầu vào chỗ không bao giờ hồi đáp, nên màn hình
đứng im — đúng triệu chứng được báo.

Đã dừng cả ba **theo PID** (không bao giờ diệt theo tên tiến trình), xoá `.next` vì ba tiến trình
đã ghi đè lẫn nhau trong đó, rồi bật lại đúng một cái. Sẵn sàng sau 2 giây.

Không có thay đổi code nào cho phần này — đây là rác môi trường, nhưng là phần gây thiệt hại lớn
nhất vì nó giết **cả bốn** tab.

### 2. Huy hiệu dev tools của Next đè lên tab "Trang chủ" — `next.config.mjs`

Sau khi server khoẻ trở lại, ba tab sau bấm được, riêng **"Trang chủ" vẫn chết**. Đo bằng
`document.elementFromPoint()` ngay tâm vùng chạm: thứ nhận cú bấm là `NEXTJS-PORTAL`, không phải
thẻ `<a>`. Đó là huy hiệu dev tools của Next, mặc định `devIndicators.position = 'bottom-left'`
— trùng khít góc dưới trái, nơi thanh tab trải hết bề ngang đặt tab đầu tiên.

- **`next.config.mjs`** — thêm `devIndicators: false`.

Không dời sang góc khác được: hai góc dưới đều là tab, hai góc trên là link thương hiệu và cụm
nút chế độ/tìm kiếm của `AppHeader`. Góc nào cũng có điều khiển. Mất cái huy hiệu nhỏ, **không**
mất bảng lỗi toàn màn khi biên dịch hỏng — hai thứ khác nhau.

### 3. `preview` và `dev` dùng chung cổng 3000 — service worker bản dựng chiếm origin của dev

Phát hiện thêm khi đọc `package.json`: `preview` là `npx serve out`, mà `serve` mặc định lấy
cổng 3000 — **đúng cổng của `next dev`**. Bản dựng thật đăng ký service worker cho origin nó
chạy, và service worker sống dai qua cả việc tắt server. Nên chỉ cần xem bản preview một lần là
từ đó `localhost:3000` có một service worker chặn mọi điều hướng của dev server, trả lại HTML
bản dựng cũ trong kho; HTML ấy xin chunk băm của bản dựng mà dev server không có, React không
gắn được, cả màn hoá ra chết bấm.

Chưa dựng lại được ổ này trên máy đang thử (profile Chrome sạch), nhưng cơ chế thì chắc chắn và
hậu quả trùng khít triệu chứng, nên vá cả hai đầu:

- **`package.json`** — `preview` đổi thành `serve out -l 4173`, kèm khoá `//preview` giải thích
  vì sao không để mặc định. Hai bên không còn chung origin.
- **`src/ui/layout/ServiceWorker.tsx`** — thêm `unregisterStale()`: lúc dev thì **gỡ** mọi đăng
  ký còn sót và xoá kho `ffb-*`. Đổi cổng chỉ chặn lần sau; máy đã lỡ đăng ký thì phải tự dọn,
  vì service worker không tự đi. Xoá luôn kho chứ không chỉ gỡ đăng ký — gỡ đăng ký mà để kho
  lại thì bản đăng ký kế tiếp ăn lại đúng đống cũ.

### Kiểm chứng — nút quay lại

Lái Chrome thật qua CDP, bấm **chuột thật** (`Input.dispatchMouseEvent`), không dùng
`element.click()`:

- **48 trên 48 cú bấm đạt** — bốn tab × sáu màn xuất phát (`/`, `/cong-thuc/`, `/cong-thuc/pe/`,
  `/tim-kiem/`, `/danh-muc/`, `/cai-dat/`) × hai khổ màn (360×780 và 1280×900).
- Không lỗi console, không yêu cầu mạng hỏng.
- Mọi vùng chạm ≥ 44px và không tab nào bị che (`elementFromPoint` rơi trúng trong thẻ `<a>`).

**Bài học về chính bộ kiểm, đáng ghi để lần sau không mất công:** bản harness đầu báo 35 ca hỏng,
toàn bộ là báo oan, do hai lỗi của chính nó.

1. `Page.navigate` trả về ngay chứ không đợi trang tới nơi. Chờ cứng 1800ms rồi đo toạ độ là đo
   nhằm trang **cũ** và bấm giữa lúc điều hướng đang bay. Phải chờ tới đúng `location.pathname`,
   `readyState === 'complete'`, và thanh tab đã có mặt — hai lần đo liên tiếp mới tính là ổn.
2. Cửa sổ Chrome bị che thì `document.visibilityState === 'hidden'` và chuột tổng hợp **không
   hit-test** — cú bấm biến mất không dấu vết, không lỗi, không sự kiện. Phải gọi
   `Emulation.setFocusEmulationEnabled` trước mỗi cú bấm. Dấu hiệu nhận ra: máy nghe `click` gắn
   ở `document` bắt được `null`, tức là cú bấm chưa từng tới DOM.

Cả hai lần đều nhờ **chụp màn hình nhìn tận mắt** mà lộ ra, không phải nhờ suy luận.

### Ghi nhận lúc đó: hai ca kiểm đỏ sẵn, không do đợt sửa này

Lúc sửa xong phần tab, `npm test` còn **hỏng 2 trên 834 ca** — `HotCategories.test.tsx` và
`HomeSearchPanel.test.tsx`. Cả hai chỉ nhập `@/application` cùng component browse, không chạm
file nào của đợt sửa tab; chúng đỏ vì Registry lớn lên chứ không vì lỗi sản phẩm.

**Đã xử lý ở mục "Đủ 107 công thức" phía trên** — cùng với hai ca nữa vỡ tiếp khi nối đủ 34
công thức chuỗi giá. Cả bốn được sửa TIỀN ĐỀ, không sửa code sản phẩm.

---

## Đợt 14 — Dọn chất lượng phát hành theo kết quả kiểm kê

Bảy việc rẻ nhất trên đường tới hạn v0.1, sau khi chủ dự án chốt bốn quyết định: (1) 86 công
thức sẽ dựng bản thảo theo nhóm — Chỉ số DN trước; (2) ẩn nút VI/EN tới v1.0; (3) `/cong-thuc/`
dựng HTML tĩnh thật; (4) KaTeX giữ hoãn, chỉ đổi câu chữ.

### Đã làm — đợt 14

1. **Gỡ sổ sách nội bộ khỏi mắt người dùng.** `ExportSheet.tsx:200` in "Biểu đồ — gói WBS 3.3"
   vào vùng print — tức vào file PDF người dùng chia sẻ. Thay bằng key mới `export.chartPending`;
   đổi luôn `detail.latexPending`, `detail.chartPending`, `list.empty.registry.hint` sang câu
   không nhắc WBS/nhánh/gói. Ca kiểm mới trong `FormulaDetail.test.tsx` chặn `/WBS|nhánh \d|gói \d/`
   quay lại màn chi tiết; kiểm bản build: **0 file HTML/JS nào trong `out/` còn chữ "WBS"**.
2. **Ẩn `LangSwitch`** khỏi `AppHeader` (component giữ nguyên, lắp lại một dòng khi gói 3.6.3
   thông luồng locale). Lý do ghi tại chỗ: `en.ts` rỗng + `t()` không nhận locale → nút chết.
3. **`format:check` vào `npm run check` và CI** — khe hở làm đợt 13 tích 8 file lệch đã đóng.
4. **Trang 404 tiếng Việt** — `src/app/not-found.tsx` + module css. Trước đây là bản mặc định
   tiếng Anh của Next, nằm ngoài AppShell. Nay trong khung, hai lối ra (tìm kiếm + trang chủ),
   vùng chạm 44px.
5. **`public/_headers`** — CSP (script/style buộc 'unsafe-inline' vì Next export bootstrap bằng
   script inline; phần còn lại khoá: object-src 'none', frame-ancestors 'none', connect-src
   'self' khớp LDR-04/COM-03), nosniff, Referrer-Policy, Permissions-Policy; cache immutable
   cho `/_next/static/*`, no-cache cho `sw.js`. Kèm **`public/robots.txt`** (allow all + sitemap;
   không chặn `/tim-kiem/` để bot còn đọc được thẻ noindex).
6. **`/cong-thuc/` có HTML tĩnh thật** — `StaticFormulaList` (server component, cùng
   `selectFormulas` + `DEFAULT_LIST_PARAMS` với FormulaBrowser để thứ tự không nhảy lúc
   hydrate) làm fallback cho Suspense thay vì `null`. Google và người chưa chạy JS thấy đủ
   21 link; FormulaBrowser thế chỗ nguyên khối khi hydrate.
7. **`verify-static.mjs` 11 → 14 check**: `/cong-thuc/` phải có ≥ 21 link công thức + dòng đếm
   trong HTML tĩnh (cho phép marker bailout — thứ phải có là fallback), và 404 phải là bản
   tiếng Việt trong AppShell.

### Kiểm

`npm run check` (nay gồm format:check) xanh — **766 test / 41 file**; build 31 trang;
`verify:static` **14/14**; `npm run size` đạt (nặng nhất 140,3 kB / cửa kiểm 170 kB);
`_headers` + `robots.txt` có mặt trong `out/`; grep cả `out/`: 0 chữ "WBS", 0 nút LangSwitch.

### Còn lại của đường tới hạn (theo thứ tự đã chốt)

- Lan cờ `isDraft` tới màn Danh mục + bản xuất + CSV (~4h30) — lớp bảo vệ duy nhất nếu số
  liệu vẫn là bản thảo lúc phát hành.
- Biểu tượng PNG cho PWA (sinh bằng Node thuần từ hình học của icon.svg).
- Đăng ký XIRR; rồi bắt đầu nhánh 5 theo nhóm: **Chỉ số DN (11 công thức) trước**.
- Phía chủ dự án, song song: đối chiếu pháp lý 7 hằng số · bộ số liệu mẫu thật · rà diễn giải.

---

## Đợt 13 — Ba việc kỹ thuật rẻ, làm lần lượt

Ba việc chủ dự án chốt sau đợt kiểm kê cuối đợt 12. Mỗi việc kiểm xong mới sang việc sau.

### Việc 1 — Ô tìm rơi ký tự khi gõ nhanh

**Lỗi.** `useListParams()` lấy URL làm nguồn sự thật: gõ một ký tự là gọi `router.replace()` rồi
chờ đọc ngược ra. Hai chỗ hỏng khi gõ nhanh:

1. `router.replace()` của App Router bất đồng bộ. Gõ ký tự thứ hai trước khi lần ghi đầu kịp về,
   Next đánh dấu lần điều hướng trước là bị bỏ — giá trị nó mang theo mất luôn.
2. Trong lúc chờ, `<input>` là ô có kiểm soát mà `value` vẫn là chuỗi CŨ; React ghi lại giá trị cũ
   đó xuống DOM, xoá mất ký tự vừa gõ.

Đo được: gõ qua CDP với độ trễ 0ms, ô nhận về `"lonhun"` thay vì `"loi nhuan"`.

**Cách chữa.** Thêm `src/application/use-query-draft.ts`: giữ bản nháp cục bộ cho ô nhập, hoãn ghi
URL 250ms. Danh sách kết quả lọc theo **bản nháp** nên gõ tới đâu thấy tới đó, không phải chờ.
Phân biệt "URL đổi vì mình vừa ghi" với "URL đổi từ bên ngoài" bằng `sentRef` — thiếu chỗ này thì
chính lần ghi của mình dội lại và xoá những ký tự gõ thêm sau đó.

Ba lối vào, ba hàm riêng: `setDraft` (hoãn) · `commitDraft` (ghi ngay, cho chip "tìm gần đây" và
phím Enter) · `resetDraft` (xoá nháp + huỷ lần ghi treo, cho nút "Xoá bộ lọc" — không có nó thì
lần ghi treo nổ sau khi URL đã sạch và dựng lại đúng từ khoá vừa xoá).

**Đã đổi file:**

- `src/application/use-query-draft.ts` (mới) + `use-query-draft.test.ts` (mới, 11 ca)
- `src/application/use-list-params.ts` — thêm lời nhắc đừng nối thẳng `setParams({ q })` vào `onChange`
- `src/app/tim-kiem/SearchScreen.tsx`, `src/app/cong-thuc/FormulaBrowser.tsx` — đi qua hook mới

**Kiểm.** 11 ca đơn vị, và Chrome thật trên dev server: gõ 0ms ra đúng `"loi nhuan"`, kết quả lọc
ngay trong lúc gõ, URL chỉ ghi sau khi ngừng, mở link `?q=` sẵn thì ô hiện đúng, "Xoá bộ lọc" không
làm từ khoá sống lại. 10/10.

**KHÔNG kiểm nút Lùi**, vì `useListParams` dùng `router.replace` — cố tình không đẻ mục lịch sử cho
từng lần gõ. Đường "URL đổi từ bên ngoài" thật sự là mở link chia sẻ, và ca đó có kiểm.

### Việc 2 — Dọn khoá i18n mồ côi

14 khoá khai trong `vi.ts` mà không nơi nào dùng. Xoá 13, giữ 1 và nối vào chỗ dùng:

| Khoá                        | Xử lý                                                                       |
| --------------------------- | --------------------------------------------------------------------------- |
| `app.name`                  | **Giữ** — nối vào `layout.tsx`, gỡ 3 chỗ gõ cứng "Falculator Finbox"        |
| `app.tagline`               | Xoá — mô tả thật nằm ở `layout.tsx` và `manifest.webmanifest`               |
| `lang.label`                | Xoá — nút đã có `aria-label` riêng qua `lang.switchToEn/Vi`                 |
| `input.derivedPrefix` `'↳'` | Xoá — mũi tên do `core/input-state.ts` ghép, Domain không đọc i18n (CON-02) |
| `input.rangeHint`           | Xoá — WF-16 hiện miền bằng `input.sliderMin/Max/Step`                       |
| `series.of`                 | Xoá — bảng hiện `4 / 10 phiên dùng được`, dùng dấu gạch chéo                |
| `page.home.title`           | Xoá — trang chủ dùng `home.h1`                                              |
| `page.portfolio.title`      | Xoá — màn danh mục dùng `portfolio.title`                                   |
| 6 × `page.placeholder.*`    | Xoá — khung tạm đã bị thay từ đợt 8, chữ còn nói SAI ("sẽ dựng")            |

**Ca kiểm chặn tái phát** trong `i18n.test.ts`: quét cả `src/`, khoá nào không xuất hiện ở đâu là
đỏ. Tìm **chính chuỗi khoá** chứ không chỉ tìm `t('khoá')` — nhiều khoá đi vòng qua
`labelKey`/`nameKey`/`hintKey` rồi mới tới `t(item.labelKey)`; bản đầu của tôi chỉ soi lời gọi trực
tiếp nên báo nhầm 52 khoá mồ côi. Ca kiểm còn đòi quét được > 50 file, để đường dẫn hỏng thì đỏ chứ
không đỗ giả vì không có gì để soi.

Lý do không để đó: gói 3.6.3 sẽ dịch từng khoá sang tiếng Anh — dịch cả khoá chết là tốn công thật.

### Việc 3 — Tách chỉ mục nhẹ khỏi Registry

**Đo trước khi sửa.** Chunk 93 kB (thô) chứa diễn giải, ví dụ, ca kiểm thử và hàm tính của cả 21
công thức bị **29/29 trang tải**, kể cả `404.html`. Ngoại suy đủ 107 công thức thì trang nặng nhất
vượt ngưỡng NFR-PER-04.

**Hai thay đổi, cả hai đều cần:**

1. **`FormulaSummary`** — tách khỏi `FormulaSpec` phần vừa đủ để duyệt và tìm (id, nhóm, tên, mô
   tả, cấp độ, cờ nổi bật, thẻ). `search.ts` và ba component danh sách nhận kiểu hẹp này.
   Bộ dữ liệu ở `formulas/summaries.generated.ts`, **sinh tự động** bằng `npm run gen:summaries`.
2. **`sideEffects` trong `package.json`** — đây mới là chỗ quyết định. Thiếu nó thì webpack phải
   giữ mọi module mà barrel `@/application` chạm tới, nên **bước 1 một mình không giảm được byte
   nào** (đo lần đầu: 143 kB → 143 kB). Thêm vào rồi mới ăn.

**Vì sao sinh chứ không viết tay, cũng không `map()` lúc chạy.** `map()` giữ nguyên cạnh import từ
màn danh sách tới toàn bộ Registry — đúng cạnh cần cắt. Viết tay thì lệch. Bộ sinh đi vòng qua
vitest (`scripts/gen-summaries.mjs`) vì nó cần `import` TypeScript, mà vitest đã có sẵn — không
thêm dependency. `summaries.test.ts` đối chiếu file sinh với Registry thật sau mỗi lần chạy test.

**Kết quả đo (gzip, First Load JS):**

| Trang            | Trước | Sau     |
| ---------------- | ----- | ------- |
| `/`              | 143   | **122** |
| `/cai-dat/`      | 145   | **115** |
| `/cong-thuc/`    | 143   | **121** |
| `/tim-kiem/`     | 144   | **121** |
| `/du-lieu/`      | 142   | **120** |
| `/danh-muc/`     | 140   | **122** |
| `/cong-thuc/pe/` | 156   | **149** |

Diễn giải của một công thức nay chỉ nằm trong HTML của đúng trang đó — kiểm bằng cách tìm câu
diễn giải P/E trong cả `out/`: có mặt ở **1 file duy nhất**, và **không có trong bất kỳ chunk JS
nào**. Thêm công thức là thêm trang mới, không làm nặng trang cũ.

**Đã đổi file:** `registry/types.ts` · `registry/search.ts` · `registry/index.ts` ·
`formulas/summaries.generated.ts` (mới, sinh tự động) · `formulas/summaries.test.ts` (mới, 5 ca) ·
`scripts/gen-summaries.mjs` (mới) · `application/index.ts` · `ui/browse/{FormulaCard,SearchResults,HotCategories}.tsx` ·
`app/{HomeSearchPanel,sitemap}.ts(x)` · `app/cong-thuc/FormulaBrowser.tsx` · `app/tim-kiem/SearchScreen.tsx` ·
`app/cai-dat/SettingsScreen.tsx` · `package.json` · `.prettierignore`

**`size-report.mjs` sửa theo.** Cách đoán "chunk Registry" cũ (tìm chuỗi `lich-tra-no` trong JS)
nay bắt nhầm cả chunk định tuyến và cho ra 284 kB gây hiểu nhầm. Nay đo đúng hai nguồn phình:

- **chỉ mục nhẹ**, mọi trang tải: 5,4 kB / 21 công thức → ~27,4 kB ở 107 (thêm ~22 kB);
- **gói riêng trang chi tiết**, 21 trang dùng chung: 13,4 kB → tối đa +55 kB nếu coi TẤT CẢ là hàm
  tính (cố tình bi quan; phần lớn thật ra là giao diện WF-03 và ba bottom sheet, không tăng theo số
  công thức).

Ước lượng TRÊN ở 107 công thức: ~217 kB. Vẫn trên ngưỡng 200 kB, nhưng đây là cận trên bi quan,
không phải dự báo. Con số thật sẽ biết khi nhánh 5 đổ thêm vài nhóm.

Cũng sửa một lỗi cũ của script: "gói chung mọi trang tải" gộp cả CSS nên hoá ra lớn hơn tổng JS của
một trang — vô lý. Nay tách JS và CSS.

**Kiểm bản build SẢN XUẤT trong Chrome thật** (rung cây có thể cắt nhầm mã, mà lỗi đó không lộ ở
`npm run dev`): 14/14. Quan trọng nhất là hai ca — đổi EPS 6.050 → 12.100 ra **7,6 lần**
(= 92.000/12.100, chứng minh hàm tính còn nguyên), và EPS = 0 ra cảnh báo "chia cho 0" với khối kết
quả KHÔNG có số (FR-06).

### Phát hiện kèm theo

- **Chrome từ chối biểu tượng SVG trong manifest** — `Error while trying to use the following icon
from the Manifest: /icon.svg`. Trước đợt này chỉ ghi "iOS cần PNG 180×180"; nay biết **Chrome
  cũng không nhận**, tức là PWA hiện **chưa cài được ở đâu cả**. Cần biểu tượng PNG 192 và 512
  (+ 180 cho iOS).
- Chrome cảnh báo một file CSS được preload mà trang không dùng tới trong vài giây. Mức `warning`,
  chưa đào.

### Còn lại sau đợt 13

- Biểu tượng PNG cho PWA (xem trên).
- Ngân sách ở 107 công thức: cận trên còn ~217 kB. Nếu chạm cửa kiểm 170 kB thì tách tiếp gói riêng
  của trang chi tiết theo từng nhóm công thức.
- 86/107 công thức, ba việc chặn v0.1 đều là **nội dung** (số liệu thuế/phí, bộ mẫu thật, rà diễn
  giải) — xem mục kiểm kê ở đợt 12.

### Vá sau đợt 13: prettier đỏ 8 file

`npx prettier --check .` đỏ 8 file — phần lớn là file đợt 13 sửa mà chưa format (hook lint-staged
chỉ chạy lúc commit, mà đợt 13 chưa commit). Đã `prettier --write` đúng 8 file đó, kiểm lại 24 ca
test liên quan vẫn xanh. Việc gốc còn treo: `npm run check` KHÔNG gồm `format:check` nên lệch
format chỉ bị bắt ở hook commit, không bị bắt ở CI — ghi vào kiểm kê toàn cục bên dưới.

### Kiểm kê toàn cục sau đợt 13 (trả lời "còn gì chưa hoàn thành")

Rà bằng 6 agent song song (WBS/tiến độ · công thức Domain · truy vết FR/NFR · màn hình & mã mồ côi
· dữ liệu & pháp lý · hạ tầng), mỗi chiều qua một vòng phản biện độc lập cố bác bỏ từng phát hiện,
rồi tổng hợp. Agent soát sót cuối chết vì hết hạn mức phiên — độ phủ chưa được phê bình độc lập.
Kết quả đầy đủ đã báo chủ dự án; những điểm nặng nhất, MỖI ĐIỂM ĐÃ KIỂM TAY LẠI:

1. **Chưa commit gì từ đợt 6** — `git log` có đúng 3 commit, HEAD là sản phẩm đợt 5;
   68 đường dẫn untracked + 60 sửa + 4 xoá. Bẫy kèm: `ci.yml` bản mới gọi `verify:static`/`size`/
   `gen:summaries` mà HEAD chưa có `scripts/` lẫn ba script đó trong `package.json` — commit thiếu
   bộ là CI đỏ. (Quy tắc dự án: chủ dự án tự commit.)
2. **Chữ nội bộ lọt vào bản xuất**: `ExportSheet.tsx:200` in "Biểu đồ — gói WBS 3.3" vào vùng
   print — nằm trong file PDF người dùng chia sẻ. Cùng lớp: `detail.latexPending` và
   `detail.chartPending` nhắc "gói WBS"/"nhánh 4" ngay trên màn chi tiết.
3. **Trang 404 là bản mặc định tiếng Anh của Next** ("404: This page could not be found."),
   nằm ngoài AppShell — chưa có `src/app/not-found.tsx`.
4. **Cờ `isDraft` không lan tới nơi tiêu thụ**: màn Danh mục dựng tổng tiền từ preset bản thảo mà
   không cảnh báo cạnh con số; bản xuất PDF/PNG và CSV không mang dấu vết bản thảo;
   `hasDraftData()` xuất qua barrel nhưng 0 nơi gọi.
5. **Sổ sách lệch mã** ở nhiều chỗ — nặng nhất: bảng WBS đầu file này ghi PWA "Xong" trong khi
   chính đợt 13 xác nhận chưa cài được; cộng dồn giờ thiếu ~14h (3.3.1 + 3.4.1 không có dòng);
   nhánh 4, nhánh 6, 3.5.x và bảy gói bị mã viện dẫn không có dòng theo dõi.

Danh mục còn lại theo nhóm (chi tiết trong báo cáo gửi chủ dự án): nội dung & pháp lý (biểu phí
bản thảo, 1 biểu phí duy nhất, nguồn FR-04 không định vị được, diễn giải chưa rà) · nhánh 5
(86/107, XIRR toán xong chưa đăng ký, `dependsOn` 0/21, 21/21 đều `level: 'basic'`) · màn hình
(`/cong-thuc/` bailout vs priority 0.9, VI/EN bấm không đổi gì, `asOf` chốt cứng, KaTeX, biểu đồ
nhánh 4 chưa động) · nợ kỹ thuật (VirtualList 84px, service worker không dọn cache cũ, không
`_headers`/CSP, không robots.txt, `npm audit` 6 lỗ, `next lint` sắp bị Next 16 bỏ).

---

## Đợt 12 — Ba bottom sheet, màn tìm kiếm, màn cài đặt, PWA, và hai màn mồ côi

Trạng thái: **đang chờ xác nhận**. `npm run check` xanh **744 test / 39 file** (thêm 49 so với
đợt 11a), `npm run build` xanh 31 trang, `npm run verify:static` **11/11** (thêm 5 phép kiểm),
và bộ kiểm trên Chrome thật ở 360×780 trên bản build tĩnh **38/38 đạt**.

Chủ dự án yêu cầu: _"tiếp tục hoàn thành nốt các phần đang làm dở kèm theo việc add vào giao diện
luôn. nếu không có giao diện thì báo cho tôi."_ Đợt này gộp phần còn lại của cả hai nhóm việc đã
chốt (ba bottom sheet · màn tìm kiếm · màn cài đặt · PWA) cộng phần "add vào giao diện".

### Hai màn đã dựng xong mà KHÔNG CÓ lối vào nào

Đây là phát hiện đáng kể nhất của đợt. `ROUTES.data` và `ROUTES.search` chỉ xuất hiện ở
`routes.ts`, `routes.test.ts` và `activeRouteKey()` — nghĩa là **không một link nào trong cả giao
diện trỏ tới hai màn đó**, chỉ gõ URL tay mới mở được:

| Màn                              | Dựng xong ở | Vì sao mất lối vào                                                       |
| -------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `/du-lieu/` — WF-05 bảng dữ liệu | đợt 9       | WF-18 chốt thanh dưới đúng bốn mục nên nó không có chỗ, và không ai thêm |
| `/tim-kiem/` — WF-09 tìm kiếm    | đợt 7       | đợt 11a xoá `SearchEntry` ở trang chủ — nơi DUY NHẤT trỏ tới nó          |

Đã sửa: trang chủ có khối **"Công cụ"** dẫn sang `/du-lieu/` (server component, không thêm gì vào
gói máy khách), màn chi tiết công thức nào cần chuỗi giá có thêm link "Mở bảng dữ liệu →" cạnh nút
dán, và thanh trên có **nút kính lúp** dẫn sang `/tim-kiem/` — đặt ở đó thì mọi màn đều với tới,
kể cả màn chi tiết và màn danh mục vốn không có ô tìm nào.

Nút kính lúp không trùng vai với ô tìm ở trang chủ: ô kia LỌC danh sách đang xem tại chỗ, nút này
mở màn TÌM có chip tìm gần đây và khối danh mục hot. Hai ô nhập trên cùng một màn mới là chỗ gây
nhầm, nên nó là biểu tượng chứ không phải ô nhập thứ hai.

`scripts/verify-static.mjs` nay chặn cứng cả hai lối vào này — chuyện "màn dựng xong mà không ai
tới được" không có test nào bắt, giờ thì có.

### Đã đổi file nào — đợt 12

#### Ba bottom sheet (gói 2.5, theo ảnh 4, 5, 6)

- **`PresetSheet`** — mã cổ phiếu tách thành **huy hiệu chữ đều** bề ngang cố định để cột mã thẳng
  hàng; ô tìm bo 10px cho khớp phần còn lại của app. Chỉ một phần tử mang mã, không nhân đôi thành
  huy hiệu + dòng chữ (trình đọc màn hình sẽ đọc mã hai lần).
- **`PasteImportSheet`** — ba việc: ô gán cột từ `Select` cỡ form đổi thành **chip** (bên dưới vẫn
  là `<select>` gốc phủ trong suốt, giữ nguyên bánh xe chọn của hệ điều hành và vùng chạm 44px);
  thêm **khung xem trước** năm phiên đầu; hai khối báo cáo **tách hẳn nhau** — xanh cho phần nạp
  được, vàng cho phần bỏ qua.
- **`ExportSheet`** — thẻ định dạng có **biểu tượng SVG** vẽ tay ăn theo `currentColor`; hai ô tick
  đổi thành **công tắc**.
- **`ui/primitives/Switch`** (mới) — công tắc cho boolean thường. Khác `inputs/Toggle` vốn gắn chặt
  vào `VariableSpec`; giữ đúng hình rãnh + nút của Toggle để cả app chỉ có một kiểu công tắc.
- **`globals.css`** — thêm `--color-success-soft` và `--color-success-line` cho khối báo "đã đọc
  được N dòng". Chữ trên nền đó đạt **5,48:1**, có ca kiểm trong `contrast.test.ts`.

Chip gán cột cố ý KHÔNG phải nút bấm đảo vòng qua bảy vai trò: gán cột thứ sáu sẽ mất tới sáu lần
chạm, và không có cách nào biết trước còn những lựa chọn nào.

**`PresetSheet` nay dùng ở cả hai chỗ**: màn WF-05 trước đây có `<select>` riêng chỉ liệt kê mã,
nên người dùng chọn mã mà không biết kỳ báo cáo nào, bao nhiêu phiên, hay số liệu còn là bản thảo —
cảnh báo R-01 chỉ nằm trong sheet. **`ExportSheet` KHÔNG gắn vào WF-05**: nó xuất kết quả một công
thức ra PDF/PNG, còn lối ra của bảng chuỗi giá là CSV, đã có nút riêng.

#### Màn tìm kiếm WF-09 (ảnh 2, 3)

- **`core/registry/highlight.ts`** + test (mới, **15 ca**) — `highlightRanges()` và
  `highlightParts()`. Phần khó nằm hết ở đây: gõ "dinh gia" mà chữ trên màn là "Định giá" thì phải
  biết ký tự thứ mấy của chuỗi ĐÃ BỎ DẤU ứng với ký tự thứ mấy của chuỗi GỐC. `normalizeVi()` cả
  chuỗi rồi lấy chỉ số là sai ngay từ chữ có dấu đầu tiên vì `normalize('NFD')` tách một ký tự
  thành nhiều; phải chuẩn hoá **từng ký tự** và giữ bảng chỉ số. Luật tô bám đúng luật chấm điểm
  của `scoreFormula` (khớp theo tiền tố của một từ) — tô kiểu khác thì có dòng kết quả không có
  chữ nào được tô và người dùng tưởng máy trả sai.
- **`ui/browse/Highlight.tsx`** — dùng `<mark>` gốc; nền vàng nhạt **và** chữ đậm, hai dấu hiệu
  (NFR-USA-06).
- **`ui/browse/HotCategories.tsx`** + test (mới, 8 ca) — khối "Danh mục hot". "Hot" đo bằng **số
  công thức đã dùng được**, không phải số dự kiến của SRS, và nhóm rỗng **không xuất hiện**. Đây là
  chỗ khác có chủ đích với lưới nhóm ở trang chủ: lưới kia hiện `expectedCount` để nói thư viện sẽ
  có gì (bấm "Kỹ thuật · 18" ra danh sách rỗng — đánh đổi đã ghi ở đợt 8), còn khối này là lối tắt,
  mà lối tắt dẫn vào phòng trống là lối tắt hỏng.

#### Màn cài đặt WF-13 (ảnh 7) — thay khung tạm

- **`src/app/cai-dat/SettingsScreen.tsx`** + test (mới, **13 ca**) — bốn khối đúng thứ tự wireframe:
  chế độ hiển thị (dùng lại `ModeToggle` của thanh trên, không dựng bản thứ hai) · đơn vị & biểu
  phí · **dữ liệu trên máy** (bốn khoá localStorage kèm cỡ thật và nút xoá từng mục + xoá tất cả) ·
  về sản phẩm.
- **`preferences.ts`** — thêm `unitScale`, có validator riêng và ca kiểm cho giá trị rác.
- **`LoanScheduleBody`** — bảng WF-14 đọc `unitScale`, kèm số chữ số thập phân đổi theo bậc (ở bậc
  tỷ ₫ mà để 2 số lẻ thì kỳ đầu của khoản vay 800 triệu ra "0,01", mất hết thông tin).
- **`UnitSwitcher`** (gói 2.3.3) — component này dựng từ đợt 5 mà **chưa màn nào dùng**; nay nó là
  điều khiển của dòng "Đơn vị tiền trong bảng".

#### PWA (gói 3.6.2)

- `public/manifest.webmanifest`, `public/icon.svg`, `public/icon-maskable.svg`, `public/sw.js`,
  `ui/layout/ServiceWorker.tsx`.
- Service worker **viết tay, không thêm thư viện**: toàn bộ nhu cầu gói trong "giữ lại thứ vừa tải
  và dùng lại khi mất mạng", khoảng 80 dòng, còn Workbox thêm ~15 kB runtime cho những chiến lược
  không dùng tới.
- **Không precache danh sách file**: `output: 'export'` sinh tên chunk có băm, không biết trước lúc
  viết file, và không có bước build nào sinh manifest — precache một danh sách đoán mò thì cài đặt
  hỏng ngay lần đầu. Thay bằng cache-lúc-chạy: điều hướng thì **mạng trước** (HTML hay đổi nhất),
  tài nguyên tĩnh thì **trả kho trước rồi tải bản mới cho lần sau** (tên có băm nên bản trong kho
  không bao giờ cũ so với tên đang xin).
- Chỉ đăng ký ở bản dựng thật và chỉ sau sự kiện `load`. Đăng ký ở `npm run dev` là cách chắc chắn
  nhất để gặp lại lỗi `Cannot find module './124.js'`.
- Sửa kèm: `themeColor` còn sót `#ecebe6` — màu giấy của bảng cam đất đợt 4, nay là `#f4f6fa`.

### Một lỗi thật, chỉ lộ ra khi mở ảnh chụp màn ra nhìn

**Bottom sheet dựng rộng 543px trên màn 360px, tràn nửa ra ngoài.** Máy báo 38/38 xanh, ảnh chụp
mới thấy sheet dán dữ liệu bị cắt mất nửa trái.

Chuỗi nhân quả: bảng chuỗi giá sáu cột rộng 542px nằm trong khung `overflow-x: auto`. Khung đó giữ
đúng bề rộng được cấp (đo được 328px) và cuộn ngang bên trong — đúng thiết kế. Nhưng **bề rộng nội
tại của bảng vẫn rò ra ngoài**: Chrome ở chế độ di động lấy nó để định khung nhìn và nới
`window.innerWidth` từ 360 thành 543. Bottom sheet đặt `width: 100%` nên nó dựng theo 543 ấy.

Đã thử và **không** đủ: `min-width: 0` · `contain: inline-size` một mình · `width: 100%` ·
`overflow-x: hidden` trên `body` · `max-width: 100%` trên `html`. Chỉ `contain: layout inline-size`
đưa khung nhìn về đúng 360 mà vẫn giữ nguyên phần cuộn ngang 542px bên trong. Đã áp cho cả ba khung
cuộn: primitive `Table`, `.tableWrap` của WF-05, `.previewScroll` mới của sheet dán.

Lỗi có từ đợt 9; đợt này lộ ra vì bottom sheet lần đầu được mở trên màn có bảng dữ liệu.

### Ba chỗ bộ kiểm báo sai, phải sửa bộ kiểm

1. **"Tô sáng không chạy" — bộ kiểm gõ quá nhanh.** Ô tìm của `/tim-kiem/` giữ trạng thái trên URL
   nên mỗi phím là một lượt điều hướng; gõ không nghỉ thì lượt sau đè lượt trước và **chỉ ký tự
   cuối sống sót** (đo được `'dinh gia'` còn đúng chữ `'a'`). Ở nhịp người thật 130 ms thì đủ tám
   ký tự và tô đúng ba đoạn. Xem "Việc còn lại" mục 1 — đây là chuyện có thật, không chỉ của bộ kiểm.
2. **"Trang tràn ngang" ở WF-05 — so sai đại lượng.** Phép `documentElement.scrollWidth === 360`
   sai ở màn có khung cuộn ngang lồng bên trong. Thứ NFR-USA-02 cấm là **kéo được cả trang sang
   ngang**; ép `window.scrollTo(500, 0)` thì `scrollX` vẫn 0. Đã đổi bộ kiểm sang thử đúng việc đó.
   (Nhưng lần dò này lại lôi ra lỗi 543px thật ở trên — đo sai mà vẫn bắt được lỗi thật.)
3. **"Có lỗi JS" — do chính bộ kiểm ngắt mạng** để thử phần ngoại tuyến.

Và một lần tôi **chẩn đoán sai rồi sửa nhầm**: thêm `min-width: 0` cho `.tableWrap` kèm chú thích
khẳng định đó là nguyên nhân. Đo lại thì con số không đổi. Đã hoàn lại thay đổi ấy trước khi tìm ra
nguyên nhân thật.

### Hai giả định của tôi sai, code đúng

1. Ca kiểm "số trên ô hot phải nhỏ hơn `expectedCount`" — nhóm `fees-tax` đã đủ **8/8**, nên câu đó
   sai với chính nó. Đổi thành "ít nhất một ô khác số dự kiến", vẫn chặn được việc ai đó đổi sang
   `expectedCount` mà ca kiểm vẫn xanh.
2. Ca kiểm "đổi biểu phí thì ghi xuống localStorage" — `MarketConfig` hiện chỉ có **một** biểu phí
   nên không có gì để đổi sang. Xem "Việc còn lại" mục 2.

### Kết quả kiểm tra — đợt 12

`npm run check`: lint sạch, typecheck sạch, **744 test / 39 file**.
`npm run build`: 31 trang. `npm run verify:static`: **11/11**, `out/index.html` **36.471 B**.

Kích thước gói — ngưỡng NFR-PER-04 là 200 kB:

| Trang             | Trước  | Sau        |
| ----------------- | ------ | ---------- |
| `/`               | 140 kB | **142 kB** |
| `/cai-dat`        | 137 kB | **144 kB** |
| `/tim-kiem`       | 140 kB | **142 kB** |
| `/cong-thuc/[id]` | 151 kB | **155 kB** |

Trên Chrome thật ở 360×780, bản build tĩnh — **38/38 đạt**. Đáng kể nhất:

- Thanh trên có nút kính lúp, trang chủ có ô "Bảng dữ liệu"; vùng chạm 5/5 nút ở thanh trên đủ 44px.
- Gõ không dấu "dinh gia" tô đúng ba đoạn **có dấu** (`giá`, `định`, `giả`); đoạn tô có nền và chữ
  đậm 700.
- Khối "Danh mục hot" hiện 6 nhóm, đều là nhóm đã có công thức.
- Đổi bậc đơn vị ở màn cài đặt → nhãn bảng WF-14 thành "ĐVT: tỷ ₫" và số trong bảng đổi bậc theo,
  không có ô nào ra `0` hay `NaN`. **Cài đặt có tác dụng thật, không phải công tắc trang trí.**
- Sheet nạp mẫu mở từ WF-05, có huy hiệu mã và cảnh báo số liệu bản thảo; bấm Nạp ra 248 dòng.
- Sheet dán: 5 chip gán cột đều đủ 44px, khung xem trước đúng 2 dòng, hai khối báo cáo tách nhau,
  không lọt `NaN`/`undefined`.
- Sheet xuất: 2 thẻ đều có biểu tượng, 2 công tắc và **0** ô tick, nhãn chữ Bật/Tắt, miễn trừ vẫn
  không tắt được.
- Manifest đọc được, khai `standalone`, có cả biểu tượng thường lẫn maskable; service worker
  `activated`; **ngắt mạng vẫn mở lại được `/cong-thuc/pe/`**.

Và mở ảnh chụp ra nhìn tận mắt cả năm màn — đó là cách bắt được lỗi 543px, chữ "Mặc định HOSE 2026
— mặc định" lặp từ, câu miễn trừ hiện hai lần trên màn cài đặt, và ô "Danh mục hot" cao thấp so le.

### Vá sau nghiệm thu: sheet nạp mẫu co lại khi gõ tìm

Chủ dự án báo: _"khi search ví dụ trong popup Nạp bộ số liệu mẫu thì không được co giao diện
popup lại"_.

Đúng. Sheet dán đáy màn hình, nên danh sách ngắn lại là nó **co từ dưới lên**: ô tìm cùng mọi thứ
bên trên nhảy xuống ngay giữa lúc người dùng đang gõ, có khi trượt khỏi ngón tay. Đo được ở
360×780: 4 mã → 1 mã thì mép trên sheet tụt và ô tìm đi theo.

Ba mảnh của bản vá:

1. **Ghim chiều cao vùng kết quả**, đo một lần lúc mở — khi danh sách còn đầy đủ, cũng là lúc nó
   cao nhất, vì lọc chỉ bớt đi chứ không thêm vào. Không viết cứng một số px: số bộ mẫu do
   `DataProvider` quyết, ngày có nguồn thật là khác ngay. Đo bằng `useEffect` chứ không phải
   `useLayoutEffect` — `<dialog>` chưa gọi `showModal()` thì còn `display: none` và đo ra 0; effect
   thụ động của con (`BottomSheet`, nơi gọi `showModal`) chạy trước effect thụ động của cha.
2. **Cảnh báo số liệu bản thảo xét trên CẢ BỘ**, không phải trên phần đang lọc. Trước đó gõ một từ
   khoá không khớp gì là câu cảnh báo biến mất — vừa sai nghĩa (nó nói về nguồn dữ liệu, không nói
   về mấy dòng đang hiện), vừa làm sheet co thêm một nấc.
3. **Đóng sheet thì xoá từ khoá**, để lần mở sau bắt đầu từ danh sách đầy đủ và phép đo ở mục 1
   luôn lấy đúng chiều cao lớn nhất.

Câu "không có mã nào khớp" đặt **giữa** vùng đã ghim chứ không dính lên đầu — treo trên nóc một
khoảng trắng lớn thì nhìn như màn hỏng chứ không như một câu trả lời.

Kiểm trên Chrome thật ở 360×780, bản build tĩnh — **8/8 đạt**: lọc 4 → 1 → 0 mã mà chiều cao sheet
đứng nguyên **659px**, mép trên nguyên **121px**, ô tìm nguyên **232px**; cảnh báo bản thảo còn ở
cả ba trạng thái. Thêm 2 ca vitest cho hai mảnh kiểm được bằng Node (mảnh ghim chiều cao thì jsdom
không dựng layout nên đo đâu cũng ra 0 — chỗ đó chỉ kiểm được trên trình duyệt thật).

### Kiểm kê dung lượng và phần còn lại của dự án

Chủ dự án hỏi: _"hoàn thành nốt dự án. đồng thời kiểm tra xem app đang có dung lượng bao nhiêu"_.

#### Dung lượng — đo thật, có script chạy lại được

Thêm `scripts/size-report.mjs` (`npm run size`, Node thuần, đã cắm vào CI sau bước build).
Vì sao cần bên cạnh con số Next in ra: Next chỉ nói về **JS**, gộp chung "shared by all", và không
nói cả thư mục `out/` nặng bao nhiêu. Script đọc từng file HTML rồi cộng đúng những tài nguyên mà
HTML đó tham chiếu — sát nghĩa "một lượt truy cập đầu tốn bao nhiêu".

|                                 | Thô      | Nén gzip   |
| ------------------------------- | -------- | ---------- |
| **Cả thư mục `out/`** (96 file) | 2.287 kB | **644 kB** |
| JS (31 file)                    | 985 kB   | 309 kB     |
| HTML (29 file)                  | 941 kB   | 226 kB     |
| CSS (5 file)                    | 71 kB    | 13 kB      |
| Ảnh & biểu tượng                | 1,6 kB   | 1,1 kB     |

Một lượt truy cập đầu, đã nén, trình duyệt hiện đại:

| Trang                          | HTML        | JS       | CSS     | Tổng               |
| ------------------------------ | ----------- | -------- | ------- | ------------------ |
| `/cong-thuc/<id>/` (nặng nhất) | 8,7–10,7 kB | 156,3 kB | 11,5 kB | **176,6–178,5 kB** |
| `/du-lieu/`                    | 6,8 kB      | 145 kB   | 11,5 kB | ~163 kB            |
| `/`                            | 8,0 kB      | 140 kB   | 11,5 kB | ~160 kB            |

**First Load JS lớn nhất 156,3 kB** — khớp con số 155 kB Next tự in ra, nên phép đo tin được.
Gói chung mọi trang đều tải: **152,8 kB**. Thêm 38,7 kB gói vá `polyfills` nhưng Next gắn
`noModule` nên chỉ trình duyệt **cũ** tải — bản đầu của script này tính nhầm nó vào và lệch 40 kB
so với chính bản build.

Ngưỡng NFR-PER-04 là 200 kB First Load JS; cửa kiểm đặt ở **170 kB** và CI nay chặn cứng.
Chunk mang Registry đo được **33,2 kB** nén cho 21 công thức; ngoại suy tuyến tính đủ 107 công
thức là ~169 kB — **ước lượng TRÊN**, vì chunk đó còn mang hàm tính dùng chung không tăng theo số
công thức. Dù vậy hướng đã rõ: **phải tách chỉ mục nhẹ TRƯỚC khi thêm nhóm công thức tiếp theo**,
không phải đợi tới 107.

#### "Hoàn thành nốt dự án" — còn đúng những gì

Rà bằng 6 agent đọc song song (5 xong, 1 dừng giữa chừng vì hết hạn mức phiên), rồi tôi kiểm lại
tay những con số load-bearing.

**Còn 86/107 công thức.** Sáu trong mười hai nhóm còn **trống hoàn toàn**: Định giá (0/18) ·
Kỹ thuật (0/18) · Phái sinh (0/7) · Đầu tư (0/2) · Thuế TNCN (0/1) · Tài chính DN (0/2) — cộng
48 công thức chưa động tới. Hai nhóm đã đủ: Phí & thuế VN (8/8), Vay nợ (3/3).

**Ba component đã dựng xong mà chưa màn nào dùng** — cùng lớp lỗi đã bắt `UnitSwitcher` ở đợt 12,
kiểm lại bằng grep loại trừ barrel và test, cả ba đều ra **0 nơi dùng**:

| Component                  | Gói   | Giờ WBS | Đang chờ                                                                   |
| -------------------------- | ----- | ------- | -------------------------------------------------------------------------- |
| `ui/inputs/LinkedInput`    | 2.3.4 | 12h     | `VariableField` không có nhánh `linked`, và **0/21 spec khai `dependsOn`** |
| `ui/result/FlowChainStrip` | 2.4.6 | 6h      | cũng chờ `dependsOn` — gói 5.2.3 mới sinh ra chuỗi phụ thuộc đầu tiên      |
| `ui/primitives/Card`       | 1.2.1 | —       | mất nơi dùng cuối cùng khi đợt 12 thay khung tạm màn cài đặt               |

Kéo theo hai module Domain chết ngoài test: `core/linked-input.ts` và `core/flow-chain.ts`.
**Đề xuất giữ, không xoá** — chúng là hạ tầng đã trả tiền của gói 5.2.3/5.3.1.

**Gói 3.6.3 (dịch tiếng Anh) có hai lỗ, không phải một.** `en.ts` rỗng là lỗ đã biết. Lỗ thứ hai
nặng hơn: `t(key, locale = 'vi')` mà **không call site nào truyền tham số thứ hai** — kiểm tay, 12
kết quả grep đều là `missingConstant(...)` và `preset(...)`, không phải `t()`. Nghĩa là dịch xong
259 câu thì giao diện **vẫn ra tiếng Việt**. Phải thông luồng `locale → t()` trước, dịch sau.

**14 khoá i18n khai rồi không ai gọi**, trong đó 6 khoá `page.placeholder.*` là rác của khung tạm
đã bị thay từ đợt 7–12 và còn nói sai sự thật ("sẽ dựng" trong khi đã dựng xong). Chúng đang tính
vào khối lượng gói 3.6.3, tức báo dư 14 câu cần dịch.

**Ba chỗ kế hoạch cần chốt lại:** (1) P/E và P/B mang `categoryId: 'fundamentals'` chứ không phải
`'valuation'`, nên nhóm "Định giá" vẫn 0/18 dù bảng ghi gói 5.2.2 "một phần"; (2) 11 công thức
Chỉ số DN và 5 công thức mảng cá nhân không nằm trong gói nào được nhắc; (3) không tìm thấy dấu
vết nhánh 6 và gói 3.5.x trong repo — cần đối chiếu bản WBS v7 gốc.

**Ba việc chặn phát hành v0.1 đều là NỘI DUNG, không phải code**: số liệu thuế & phí trong
`schedules.ts` (mới một biểu phí, tất cả là bản thảo) · bộ mẫu `samples.ts` (4 preset, `isDraft`
cả bốn) · phần diễn giải 21 công thức chưa ai rà. Cộng việc thứ tư từ đợt 12: biểu tượng PWA PNG
180×180 cho iOS.

### Việc còn lại — đợt 12

1. **Ô tìm ở `/tim-kiem/` mất ký tự khi gõ nhanh.** Mỗi phím là một lượt `router.replace`, gõ liền
   tay thì lượt sau đè lượt trước. Đo được: gõ không nghỉ `'dinh gia'` chỉ còn `'a'`. Trang chủ
   không dính vì nó giữ trạng thái trong `useState`. Cách sửa: giữ chuỗi trong state cục bộ và chỉ
   đẩy lên URL sau khi ngừng gõ. **Nên làm sớm** — người gõ nhanh sẽ gặp.
2. **"Biểu phí giao dịch" chỉ có MỘT lựa chọn.** `MARKET_CONFIG.schedules` hiện đúng một biểu phí,
   nên ô chọn ở màn cài đặt bấm vào không đổi được gì. Giữ ô lại vì nó là chỗ WF-13 dành sẵn và có
   ghi nguồn; ngày thêm biểu phí thứ hai vào MarketConfig là nó tự có (đã có ca kiểm chốt điều đó).
3. **"Định dạng số" — KHÔNG làm, cần chủ dự án quyết lại.** Chủ dự án đã chốt "làm thật cả ba" dòng
   trong khối Đơn vị & biểu thị. Làm được hai (bậc đơn vị · biểu phí). Dòng thứ ba thì không làm
   nửa vời được, vì hai lý do đo được:

   - `parseViNumber()` đọc số **theo quy ước Việt Nam** và đó là hợp đồng của ô nhập. Bày số kiểu
     Anh mà vẫn đọc kiểu Việt là mở lại đúng lớp lỗi "nhập beta 1,1 ra 11" đã sửa ở đợt 9.
   - `formatNumber()` còn được gọi từ **`core/formulas/fees.ts`** để dựng câu cảnh báo — chỗ đó phải
     tất định vì có ca kiểm chốt từng chữ, không được đổi theo tuỳ chọn người dùng.

   Nếu vẫn muốn làm: phải tách rõ "số để đọc" khỏi "số để nhập" và khỏi "số trong câu cảnh báo",
   đụng 11 file đang gọi `formatNumber`. Đề xuất tách thành việc riêng.

4. **Biểu tượng PWA là SVG.** Chrome cài đặt được, nhưng **iOS đòi PNG** cho biểu tượng màn hình
   chính — hiện iOS sẽ tự dựng ảnh thu nhỏ của trang thay vì dùng logo. Cần một file PNG 180×180
   (và 192/512 cho chắc); đó là tài sản thiết kế, không sinh ra bằng code được.
5. **Phần ngoại tuyến chỉ phủ trang ĐÃ MỞ.** Không precache nên mở lần đầu lúc mất mạng thì chỉ có
   khung trang chủ. Muốn phủ hết 31 trang thì cần một bước build sinh danh sách file — đáng làm khi
   nội dung đã ổn định.
6. **`/cong-thuc/` vẫn là trang rỗng với Google** (14,6 kB, 0 link công thức) mà khai `priority 0.9`.
   Chuyển nguyên từ đợt 11a, chủ dự án đã chốt tách thành việc riêng, chưa xếp lịch.
7. **Ngân sách NFR-PER-04 khi đủ 107 công thức** — chuyển nguyên từ đợt 11a. Cửa kiểm 170 kB.
   Trang cao nhất hiện là `/cong-thuc/[id]` ở **155 kB**.
8. **`VirtualList` ghim `height: 84px` + `overflow: hidden`** — chuyển nguyên từ đợt 11a.
9. **WF-04 (DCF)** vẫn hoãn, cần trọn gói 5.2.3. **KaTeX** (gói 2.4.3) chủ dự án đã chốt làm thật,
   vẫn chưa xếp lịch.

---

## Đợt 11a — Tìm kiếm và lọc ngay tại trang chủ

Trạng thái: **đang chờ xác nhận**. `npm run check` xanh **695 test / 36 file** (thêm 14 so với
đợt 10), `npm run build` xanh 31 trang, `npm run verify:static` (mới) **6/6 đạt**, và bộ kiểm
trên Chrome thật ở 360×780 trên bản build tĩnh **12/12 đạt**.

Chủ dự án báo: _"khi click vào để gõ thì lại đang bật sang màn hình công thức, lý ra là phải cho
phép tìm kiếm + lọc luôn ở bên dưới giống như đang lọc"_.

Nguyên nhân đúng như mô tả: ô tìm ở trang chủ là một thẻ `<a>` trông giống ô nhập, trỏ sang
`/tim-kiem/` — mà `activeRouteKey()` lại cố ý cho route đó **sáng mục "Công thức"** ở thanh dưới,
nên nhìn đúng như vừa bị đá sang màn Công thức.

### Quyết định gốc: vì sao trạng thái tìm KHÔNG lên URL

Đây là chỗ trang chủ khác hẳn `/cong-thuc/`, và là quyết định có chủ đích. Số đo trên bản build
trước khi sửa:

| File                          | Kích thước | Marker bailout | Link công thức trong HTML |
| ----------------------------- | ---------- | -------------- | ------------------------- |
| `out/index.html`              | 33.675 B   | 0              | 11                        |
| `out/cong-thuc/index.html`    | 14.608 B   | **1**          | **0**                     |
| `out/cong-thuc/pe/index.html` | 33.598 B   | 0              | —                         |

Hai điều rút ra. Thứ nhất, `/cong-thuc/` hiện **là trang rỗng với Google**: mọi thứ nằm sau
`<Suspense>` nên bị loại khỏi HTML tĩnh. Thứ hai — và đây mới là điều quan trọng — trang chi tiết
vẫn có HTML thật dù `FormulaDetail` là `'use client'`. Nghĩa là **thủ phạm là `useSearchParams`,
không phải client component**.

Trang chủ là URL `priority 1.0` của sitemap. Dùng `useListParams()` ở đó là mất sạch 33 kB nội
dung Google đang đọc được. Thêm nữa `/?q=roi` và `/cong-thuc/?q=roi` cho cùng một danh sách —
đúng thứ FR-25 không muốn. Nên trạng thái nằm trong `useState`, và `/cong-thuc/` vẫn là URL chính
danh duy nhất, cách đúng một cú chạm qua hàng "Xem tất cả".

Đánh đổi nhận có ý thức: **đang tìm mà bấm Lùi thì rời trang chủ** chứ không hoàn tác việc tìm.
Cách bù bằng cờ trong `history.state` đã kiểm và không dùng được — Next 15 tự ghi đè
`history.state` mỗi lần điều hướng nội bộ nên cờ bị xoá lặng lẽ. Ba lối thoát thay thế đều trong
tầm ngón cái và đều trả tiêu điểm về ô tìm: nút ×, nút "Xoá bộ lọc", phím Esc.

### Đã đổi file nào — đợt 11

#### Trang chủ

- **`src/app/HomeSearchPanel.tsx`** + `.module.css` (mới) — client island. Gõ một chữ là ba khối
  tĩnh nhường chỗ cho `CategoryFilter` đầy đủ + tối đa **8 thẻ** + hàng "Xem tất cả N". Cắt ở 8
  vì trang chủ là nơi XEM TRƯỚC chứ không phải danh sách thứ hai — và nhờ vậy không phải kéo
  `VirtualList` vào gói của trang chủ.
- **`src/app/page.tsx`** — vẫn là **server component**, không `'use client'`, không `<Suspense>`.
  Ba khối tĩnh truyền vào panel qua `children` nên `CategoryGrid` và nhánh `tile` của
  `FormulaCard` không lọt vào gói máy khách. Thêm `<h1>` dạng `visually-hidden`.
- **`src/ui/browse/SearchEntry.tsx`** + `.module.css` — **xoá**, cùng khoá `home.searchEntry`.

#### Component dùng chung

- **`src/ui/browse/SearchBox.tsx`** — thêm `inputRef`, `onCancel`, `onSubmit`. Cả ba đều tuỳ
  chọn nên `/cong-thuc/` và `/tim-kiem/` không phải sửa gì mà vẫn được hưởng bản vá tiêu điểm.
- **`src/application/routes.ts`** — `formulaListPath(params)`. `CategoryGrid` chuyển sang dùng
  chung hàm này thay vì tự ghép chuỗi.

### Ba lỗi CÓ SẴN trong code, bới ra khi rà bẫy

Không cái nào do đợt này gây ra; chúng lộ ra vì trang chủ nay dùng tới những component đó.

1. **`Chip` chỉ cao 36px và không có lớp phủ vùng chạm** — thiếu 8px so với NFR-USA-01, trong khi
   `Button.module.css` đã có sẵn khuôn `.sm::after` giải đúng bài này từ trước. Đã bê khuôn đó
   sang; đo lại trên trình duyệt: 36 → 44px cho cả ba chip.
2. **Nút × của `SearchBox` tự tháo mình khỏi DOM** nên tiêu điểm rơi về `<body>` — người dùng bàn
   phím phải Tab lại từ đầu tài liệu. Nút "Xoá bộ lọc" cũng vậy. Đã trả tiêu điểm về ô tìm.
3. **Trang chủ không có `<h1>` nào** — `out/index.html` trước đợt này đếm được 0. Đây là URL
   `priority 1.0` của sitemap.

### `verify:static` — lưới an toàn mới

`npm run check` chạy vitest **trước** build nên không đọc được thư mục `out/`, và một trang mất
sạch HTML tĩnh thì build **vẫn xanh**. Nghĩa là trước đợt này không có gì chặn được việc ai đó
"sửa cho nhất quán" bằng cách cho `HomeSearchPanel` dùng `useListParams()` — trang chủ sẽ lặng lẽ
mất 33 kB mà không test nào đỏ.

`scripts/verify-static.mjs` (Node thuần, không thêm dependency) đọc thẳng `out/index.html` và ép
sáu điều: không có marker bailout · còn `id="home-featured"` và `id="home-browse"` · có đúng một
`<h1>` · có link tới trang công thức · lớn hơn 25 kB. Đã cắm vào `.github/workflows/ci.yml` ngay
sau bước build.

### Kết quả kiểm tra — đợt 11

`npm run check`: lint sạch, typecheck sạch, **695 test / 36 file**.
`npm run build`: 31 trang. `npm run verify:static`: 6/6, `out/index.html` còn **33.544 B**.

Kích thước gói — ngưỡng NFR-PER-04 là 200 kB:

| Trang        | Trước            | Sau                  |
| ------------ | ---------------- | -------------------- |
| `/`          | 351 B · 138 kB   | 1,37 kB · **140 kB** |
| `/cong-thuc` | 1,92 kB · 140 kB | 1,01 kB · 140 kB     |
| `/tim-kiem`  | 2,29 kB · 140 kB | 1,38 kB · 140 kB     |

Trên Chrome thật ở 360×780, bản build tĩnh — **12/12 đạt**: bấm ô tìm thì Ở LẠI `/` và con trỏ
vào ô · gõ chữ thì lọc tại chỗ, `location.search` vẫn rỗng · khối tĩnh nhường chỗ đúng lúc ·
cắt đúng 8 thẻ trong khi hàng bàn giao nói "11 kết quả" · link giữ đúng `/cong-thuc/?q=gia` ·
chip 36 → 44px · bấm × thì tiêu điểm về ô và khối tĩnh quay lại · không tràn ngang · không lỗi JS.

### Việc còn lại — đợt 11

1. **`/cong-thuc/` là trang rỗng với Google** (14.608 B, không một link công thức nào) nhưng vẫn
   khai `priority 0.9` trong `sitemap.ts`. Chủ dự án đã chốt **tách thành việc riêng**. Hai lối:
   cho `<Suspense>` một fallback do server dựng, hoặc hạ `priority` cho khớp sự thật. Việc này
   đáng làm vì đó chính là URL mà trang chủ bàn giao người dùng sang.
2. **Ngân sách NFR-PER-04 khi đủ 107 công thức.** Chunk registry đo được ~27,5 kB nén cho **21**
   công thức và nạp ở mọi trang. Đủ 107 là vượt 200 kB ở khắp nơi. Thứ tự tách rẻ → đắt: bỏ
   `tests[]` khỏi bundle → tách `explanation`/`source` sang trang chi tiết → chỉ mục nhẹ chỉ gồm
   `id`, `name`, `tags`, `categoryId`, `level`. **Đặt cửa kiểm ở 170 kB.** Lưu ý: trước đợt này
   registry nằm trên trang chủ chỉ vì barrel kéo vào; nay trang chủ _thật sự cần_ nó để lọc, nên
   lối thoát rẻ nhất đã đóng.
3. **`VirtualList` ghim `height: 84px` + `overflow: hidden`** cho mỗi dòng, mâu thuẫn với chính
   docblock của nó. Ở mức phóng to 200% chữ bị cắt. Trang chủ không dính vì cắt còn 8 dòng, nhưng
   `/cong-thuc/` thì có. Sửa bằng `ResizeObserver` chứ không phải nới 84px lên.
4. **`useLayoutEffect` của `VirtualList` phụ thuộc `items`** nên mỗi phím gõ ép một lần đo layout
   đồng bộ; chưa thấy khi mới 21 công thức.
5. **`/tim-kiem/` nay không còn lối vào nào từ giao diện** (`SearchEntry` là nơi duy nhất trỏ tới).
   Vẫn mở được bằng URL, vẫn `noindex`, vẫn ngoài sitemap. Cố ý giữ nguyên; quyết định xoá hay giữ
   nên tách thành việc riêng — nếu giữ thì nên cân nhắc đưa chip "Tìm gần đây" của nó lên trang chủ.

---

## Đợt 10 — Dựng lại WF-08 và WF-14 theo bản thiết kế hi-fi

Trạng thái: **đang chờ xác nhận**. `npm run check` xanh **681 test / 35 file** (thêm 15 so với
đợt 9), `npm run build` xanh 31 trang, `/cong-thuc/[id]` **151 kB** (ngưỡng NFR-PER-04 là 200 kB).
Bộ kiểm trên Chrome thật ở 360×780 trên bản build tĩnh: **23/23 đạt**.

Chủ dự án đưa 8 ảnh render hi-fi và chốt chia làm **ba đợt nhỏ**. Đợt này là ảnh 1 (WF-08 lợi
nhuận ròng sau phí & thuế) và ảnh 8 (WF-14 lịch trả nợ vay). Cả hai màn đã có code từ đợt 7 —
đây là việc chỉnh theo hi-fi, không phải dựng mới.

### Ba quyết định đã chốt cho cả ba đợt

1. **Làm PWA thật** (manifest + service worker tự viết, không thêm thư viện) — thuộc đợt 12.
2. **Làm thật cả ba dòng** trong "Đơn vị & biểu thị" của màn cài đặt, kể cả hai preference chưa
   tồn tại (định dạng số, đơn vị số liệu BCTC) — thuộc đợt 12.
3. Chia ba đợt: **đợt 10** hai màn chi tiết · **đợt 11** ba bottom sheet (ảnh 4, 5, 6) ·
   **đợt 12** tìm kiếm và cài đặt (ảnh 2, 3, 7).

### Đã đổi file nào — đợt 10

#### Tầng Domain

- `src/core/formulas/personal.ts` — thêm `SCHEDULE_GAP`, kiểu `ScheduleCell` và
  `condenseWithGaps()`. Bản thiết kế vẽ hàng "…" cho chỗ đã bỏ bớt kỳ; việc "hai dòng liền nhau
  có nhảy cóc số kỳ không" là một phép suy luận về dữ liệu nên nó phải test được bằng Node, chứ
  không nằm trong JSX chỉ kiểm được bằng mắt.
- `src/core/formulas/index.ts`, `src/application/index.ts` — mở cửa cho ba thứ trên đi qua
  barrel (CON-02).

#### Khung màn chi tiết dùng chung

- `src/ui/navigation/DisclaimerBar.tsx` + `.module.css` — thêm `variant="notice"`: ô vàng nổi
  bật đặt **ngay đầu màn chi tiết**, bên cạnh bản `footer` sẵn có. Lý do ở mục "Miễn trừ" dưới.
- `src/app/cong-thuc/[id]/FormulaDetail.tsx` + `.module.css` — dải miễn trừ đầu màn; khối `.fields`
  đổi từ cột dọc sang **lưới hai cột** (`auto-fit`, `minmax(140px, 1fr)` — cùng công thức lưới với
  `CategoryGrid`, không cần media query); thanh trượt · nhóm nút · công tắc chiếm trọn hàng qua
  `WIDE_CONTROLS`; bỏ khối kết quả chung cho công thức nào đã tự bày ra con số đó.
- `src/ui/screens/DetailBody.tsx` — thêm `DetailConfig` + `hasConfigBlock()` (khối cấu hình đặt
  TRÊN ô nhập) và `ownsResult()`. Cả ba tra theo id giống `hasCustomBody()` sẵn có, nên màn chi
  tiết vẫn **không viết cứng gì cho một công thức cụ thể**.
- `src/ui/screens/FeeScheduleField.tsx` (mới) — ô chọn biểu phí, dựng từ `MARKET_CONFIG.schedules`.

#### Hai màn

- `src/ui/screens/FeeTaxBody.tsx` + `.module.css` — bỏ nhãn mã yêu cầu `FR-14`; tiêu đề khối
  chuyển sang viết hoa màu nhấn cho khớp trang chủ; **thẻ lợi nhuận ròng nền xanh đặc** với huy
  hiệu ROI đổi sắc theo lãi/lỗ.
- `src/ui/screens/LoanScheduleBody.tsx` + `.module.css` — ba thẻ rời gộp thành **một thẻ tóm tắt**
  (khoản trả hằng tháng lớn, tổng lãi và tổng phải trả ngăn bằng vạch dọc); bảng lịch trả nợ có
  hàng "…"; nhãn đơn vị bảng đổi thành "ĐVT: triệu đồng" theo ảnh.
- `src/ui/inputs/SliderInput.tsx` + `.module.css` — giá trị đổi sang màu nhấn; hai mốc min/max dạt
  về hai đầu; rãnh có **phần đã tô** theo giá trị (`--fill` đặt inline, kẹp về 0% khi miền rộng
  bằng 0 để `NaN%` không lọt vào CSS).
- `src/ui/primitives/Input.module.css` — `align-self: stretch` cho ô nhập. Xem "lỗi thật" dưới.
- `src/application/i18n/vi.ts` — thêm `fee.schedule`, `fee.scheduleNote`, `loan.gapRow`; sửa
  `loan.tableUnit`.

### Miễn trừ: vì sao thêm bản ở đầu màn chi tiết

Đợt 8 chủ dự án chốt chuyển dải miễn trừ xuống chân trang, và TASK.md ghi nhận UI-04 khi đó
**chưa đạt**. Bản thiết kế hi-fi của cả ảnh 1 lẫn ảnh 8 đều vẽ ô vàng miễn trừ ngay đầu màn.

Hai chỗ này không mâu thuẫn nhau: chân trang là chỗ tốt cho một lời nhắc thường trực phủ mọi
màn, nhưng màn chi tiết là màn **đang bày ra một con số tiền**, nên câu "chỉ tham khảo" phải nằm
cùng tầm mắt với con số ấy chứ không cách hai màn hình cuộn. Nay màn chi tiết có cả hai bản.

**Cần chủ dự án quyết:** có muốn bỏ bản chân trang trên riêng màn chi tiết không. Để cả hai thì
câu miễn trừ xuất hiện hai lần trên cùng một trang.

### Một lỗi thật bắt được ngoài phạm vi hai màn

**Ô nhập chỉ cao 22px trong khung 44px.** `Input.module.css` cho khung `.control` chiều cao tối
thiểu 44px đúng NFR-USA-01, nhưng chính thẻ `<input>` chỉ cao bằng dòng chữ và nằm giữa khung —
chạm vào phần đệm trên hoặc dưới của ô viền là **không trúng gì cả**. Lỗi có từ trước đợt 10;
nó lộ ra vì đợt này xếp bốn ô nhập của WF-08 thành lưới rồi đo vùng chạm. Sửa bằng
`align-self: stretch`, sau đó cả hai màn đạt 14/14 vùng chạm.

### Bốn chỗ ảnh render KHÔNG khớp số liệu tính ra — không làm theo

| Ảnh ghi                                    | Đúng phải là          | Bằng chứng                                                            |
| ------------------------------------------ | --------------------- | --------------------------------------------------------------------- |
| Ảnh 8: tổng lãi **987,7 trđ**              | **989,7 triệu ₫**     | Ca kiểm sẵn có `formulas.test.ts` chốt 989.691.880,64                 |
| Ảnh 8: tổng phải trả **1.987,7 trđ**       | **1.789,7 triệu ₫**   | 7.457.058 × 240 kỳ = 1,7897 tỷ                                        |
| Ảnh 8: kỳ 239 và 240 còn dư nợ **798,88**  | dư nợ về **0**        | `buildAmortisation()` ép kỳ cuối tất toán                             |
| Ảnh 1: ba dòng đều ghi "Phí giao dịch mua" | mua · bán · thuế CNCK | Chính con số trong ảnh là 0,15%×giá mua, 0,15%×giá bán, 0,10%×giá bán |

Ảnh 8 còn ghi "**Niêm kim**"; từ đúng là "**Niên kim**" (annuity) — giữ chữ đúng. Hai nhãn ô nhập
trong ảnh 1 cũng bị lặp ("Giá thị trường" và "EPS" mỗi cái hai lần) — đó là chữ giữ chỗ.

### Ba chỗ giữ khác bản thiết kế, có lý do

1. **Giữ các khối Ý nghĩa · Công thức · Giải thích · Bảng biến · Ví dụ · Nguồn.** Hai ảnh không
   vẽ chúng, nhưng FR-02, FR-03 và FR-04 bắt buộc phải có. Ảnh là bản cắt gọn phần kết quả.
2. **Dùng "triệu ₫" thay "trđ"** ở thẻ tóm tắt WF-14, cho khớp nhãn "triệu đồng" của bảng ngay
   dưới. Bản thiết kế dùng lẫn hai cách viết cho cùng một đơn vị trên cùng một màn.
3. **Mỗi khoảng trống một hàng "…"** (19 hàng cho bảng 240 kỳ), không gộp thành một dấu duy
   nhất — gộp lại sẽ khiến người đọc tưởng phần giữa là liền mạch.

### Ba lỗi trong chính bộ kiểm — đợt 10

Vòng chạy đầu báo 19/23; ba trong bốn chỗ đỏ là lỗi của bộ kiểm, không phải của trang.

1. **Vùng chạm báo động giả.** Đo `getBoundingClientRect()` của chính nút, trong khi nút nhỏ
   (`Button.sm`, `ModeToggle`, `LangSwitch`) giữ vùng chạm 44px ở **lớp phủ `::after` trong
   suốt** — đúng cách đợt 8 đã làm. Đã sửa bộ kiểm để cộng cả lớp phủ. (Ô nhập 22px thì là lỗi
   thật, xem trên.)
2. **Kỳ cuối bảng đọc ra `NaN`.** Quét `tbody tr` toàn trang nên vơ luôn bảng biến và khối ví dụ.
   Đã giới hạn theo `<caption>` của bảng lịch trả nợ.
3. **Vòng tiêu điểm dừng ở `body`.** `blur()` KHÔNG đưa mốc điều hướng tiêu điểm về đầu tài liệu
   — Chrome vẫn nhớ chỗ cũ, nên sau bước đo vùng chạm (có `scrollIntoView`) phím Tab đầu tiên rơi
   vào giữa trang rồi chạy hết tài liệu và vòng qua `body`. Nạp lại trang trước khi thử là xong.

### Kết quả kiểm tra — đợt 10

`npm run check` xanh: lint sạch, typecheck sạch, **681 test / 35 file**.
`npm run build` xanh: 31 trang, `/cong-thuc/[id]` 151 kB.

Trên bản build tĩnh, Chrome thật ở 360×780 — **23/23 đạt**:

- Không màn nào tràn ngang (`scrollWidth === 360`).
- Miễn trừ đứng trước tiêu đề trên cả hai màn.
- WF-08: ô chọn biểu phí dựng từ `MarketConfig`, kèm dòng ghi nguồn; ô nhập đúng **hai cột**;
  thẻ lãi ròng nền `rgb(29,78,216)` chữ trắng (6,70:1); huy hiệu ROI xanh lá khi lãi;
  các số khớp wireframe tới từng đồng (138.000 · 145.500 · 97.000 · 1.350 · 381.850 · 92.370 ·
  +4.618.150 · +5,01 %).
- WF-14: bốn điều khiển đều chiếm trọn hàng; rãnh trượt tô 36,8 % đúng vị trí 800 triệu trong
  miền 100 triệu – 2 tỷ; 19 hàng "…" đều nằm đúng chỗ nhảy kỳ; bảng đủ kỳ 1 → 240.
- Vùng chạm 14/14 trên cả hai màn; tiêu điểm 8/8 phần tử đầu đều có vòng.
- Không lọt `NaN` / `Infinity` / `undefined`; không có lỗi JS.

### Việc còn lại — đợt 10

1. **Miễn trừ hiện hai lần trên màn chi tiết** — chờ chủ dự án quyết có bỏ bản chân trang ở
   riêng màn này không (xem mục "Miễn trừ" trên).
2. **Đợt 11**: ba bottom sheet theo ảnh 4, 5, 6 — sheet nạp mẫu, sheet dán dữ liệu (gán cột
   chuyển từ dropdown sang chip, thêm khung xem trước), sheet xuất file (thẻ định dạng có biểu
   tượng, ô tick chuyển thành công tắc).
3. **Đợt 12**: màn tìm kiếm hai trạng thái (ảnh 2, 3 — thêm tô sáng đoạn khớp, khối "Danh mục
   hot") và màn cài đặt (ảnh 7 — hiện vẫn là khung tạm), kèm **PWA thật** và **hai preference
   mới** đã chốt ở trên.
4. **Ảnh 4 vẽ hai chỗ chưa có thật**: preset "VN-INDEX" chưa tồn tại trong `SAMPLE_PRESETS`, và
   ảnh ghi "VNM — Thế Giới Di Động" trong khi VNM là Vinamilk còn Thế Giới Di Động là MWG. Xử lý
   ở đợt 11.
5. **WF-04 (ảnh không có trong bộ này)** vẫn hoãn — cần trọn gói 5.2.3: Beta → CAPM → WACC → DCF
   → giá mục tiêu → biên an toàn.
6. **KaTeX** (gói 2.4.3) chủ dự án đã chốt làm thật, chưa nằm trong ba đợt trên — cần nạp trễ
   theo trang để không vỡ ngưỡng 200 kB.

---

## Đợt 9 — WF-05 bảng dữ liệu và WF-06 danh mục cá nhân

Trạng thái: **đang chờ xác nhận**. `npm run check` xanh 666 test / 35 file, `npm run build`
xanh 32 trang, và mọi kiểm tra trên Chrome thật ở 360×780 (bản build tĩnh) đều đạt.

Chủ dự án đưa năm ảnh thiết kế hi-fi và chốt làm **WF-05 trước, rồi WF-06** — đúng chiều phụ
thuộc: chuỗi giá là nền của Beta/Sharpe/VaR, và beta danh mục lại cần beta từng mã.

### Đã đổi file nào — đợt 9

#### Tầng Domain — phần khó nằm hết ở đây

- **`src/core/price-series.ts`** + test (mới, **21 ca**) — luật kiểm một phiên giá. Bắt cả bốn
  kiểu mâu thuẫn: cao < thấp · cao < mở hoặc đóng · thấp > mở hoặc đóng · ngày trùng. Không
  hàm nào ném lỗi: một dòng sai được đánh dấu kèm lý do đọc được, các dòng còn lại vẫn dùng
  được — đúng cách `paste-import.ts` đã làm ở đợt 6.
- **`src/core/portfolio.ts`** + test (mới, **15 ca**) — bốn con số đầu màn WF-06, tất cả trả
  `CalcOutput`. Beta danh mục là **bình quân gia quyền theo giá trị**, không phải trung bình
  cộng; có ca kiểm chặn đúng nhầm lẫn ấy (1,1875 chứ không phải 1,25).

#### Tầng Application

- **`price-series-store.ts`** + test (mới, 15 ca) và **`portfolio-store.ts`** + test (mới,
  15 ca) — cùng khuôn với `recent-searches.ts`: phần thuần test bằng Node, phần chạm
  `localStorage` để màn gọi trong `useEffect`.
- **`routes.ts`** — thêm `data: '/du-lieu/'`. Giống `search`, nó **không** vào `NAV_ITEMS` và
  **không** vào `sitemap.xml` (kiểm lại trên bản build: 0 lần xuất hiện), nhưng vẫn sáng mục
  Công thức để người dùng không tưởng bị lạc.

#### Màn hình — WF-05 và WF-06

- **`src/app/du-lieu/`** (mới) — WF-05. Ba lối vào cùng đổ về một bảng: nhập tay · nạp mẫu qua
  `DataProvider` · dán Excel qua sheet WF-11 đã dựng từ đợt 6. Lối ra là CSV có BOM để Excel
  đọc đúng tiếng Việt.
- **`src/app/danh-muc/`** — WF-06 thật, thay khung tạm. Danh mục rỗng hiện "— , —" kèm lý do ở
  cả bốn thẻ, **không hiện 0 ₫** — đã kiểm bằng máy: chuỗi "0 ₫" xuất hiện đúng 0 lần.
- **`src/ui/result/StatTile.tsx`** — thêm `showEyebrow`. Lưới bốn thẻ nhắc "CHỈ SỐ" bốn lần chỉ
  làm nhiễu, và bản thiết kế không vẽ.

### Vá một lỗ hổng của hàng rào ESLint

Luật CON-03 chặn `@/core/*` và `@/data/*` nhưng **không chặn `@/core` và `@/data`** — thiếu
đúng dạng import qua barrel. Tôi phát hiện vì tự mình vi phạm: màn WF-05 lúc đầu
`import { SAMPLE_PRESETS } from '@/data'` mà lint vẫn xanh. Đã sửa cả hai: code đi qua
`@/application`, và luật thêm hai mục không có dấu `/`. Kiểm lại bằng `eslint --stdin` cho cả
hai dạng — cùng chặn.

### Ba lỗi thật của đợt 9, mỗi lỗi lộ ra theo một cách khác nhau

1. **Nhập beta 1,1 ra 11.** Tôi tự viết hàm đọc số ở màn, và nó xoá mọi dấu chấm vì tưởng đó
   luôn là dấu ngăn nghìn kiểu Việt Nam. Trong khi `parseViNumber()` của đợt 5 đã xử đúng ca
   này từ lâu: `92.000` là ngăn nghìn, còn `1.1` là số thập phân. Chỉ lộ ra khi **nhìn con số
   trên màn** — không test nào của tôi chạm tới, vì tôi test hàm domain chứ không test màn.
   Sửa: bỏ hàm tự viết ở **cả hai màn**, dùng lại `parseViNumber`.
2. **Ngày ISO bị cắt cụt thành `2025-01-2`.** Ô ngày để chung bề rộng tối thiểu với ô số.
   Cũng chỉ lộ ra khi mở ảnh chụp màn ra nhìn — cùng loại với lỗi LaTeX thô của đợt 7.
3. **Gõ vào bảng 248 phiên mất 72 ms mỗi phím.** Bộ mẫu là 1.488 ô nhập, và mỗi phím gõ render
   lại toàn bộ. Sửa bằng memo hoá từng dòng (và truyền `bad: boolean` thay vì mảng issues, vì
   mảng được dựng lại sau mỗi lần gõ nên sẽ phá memo). Đo lại: **23 ms/phím**, nhanh gấp 3.

### Một ca kiểm tôi đoán sai luật

Ca "mua sau ngày định giá" — tôi viết test kỳ vọng XIRR **không có nghiệm**. Thật ra dòng tiền
chỉ đảo chiều nên phương trình vẫn giải được và trả về **−22 %/năm**: một con số đọc như khoản
lỗ, trong khi nguyên nhân thật là gõ nhầm năm. Vì thế mới thêm luật chặn ở
`summarisePortfolio()` với mã `MODEL_VIOLATION`. Đây là lần code đúng còn giả định của tôi sai,
và cách xử là **thêm luật** chứ không phải sửa kỳ vọng cho khớp.

### Kết quả kiểm tra — đợt 9

```text
npm run check  ✔ 666 test / 35 file (tăng 69 so với đợt 8), lint và typecheck sạch
npm run build  ✔ 32 trang; /du-lieu 138 kB, /danh-muc 137 kB (ngưỡng 200 kB)
sitemap.xml    ✔ /du-lieu/ KHÔNG có mặt, đúng chủ ý
```

Chạy thật trên Chrome ở 360×780, trên **bản build tĩnh**:

```text
DAT  WF-05 nạp mẫu FPT ra 248 phiên, cả 248 đều dùng được
DAT  WF-05 bảng 6 cột cuộn ngang trong khung riêng (542 / 326), cả trang không tràn
DAT  WF-05 gõ vào ô mất 23 ms/phím sau khi memo hoá
DAT  WF-06 danh mục rỗng hiện "— , —" ở cả bốn thẻ, chuỗi "0 ₫" xuất hiện 0 lần (FR-06)
DAT  WF-06 thêm FPT 500 CP giá vốn 78.000 ₫ → tổng 51.810.000 ₫ · tỷ trọng 100%
DAT  WF-06 beta 1,1 lần · XIRR 19,6 %/năm — kiểm chéo tay: 39 tr₫ → 51,81 tr₫
     trong ~1,59 năm cho 19,6 %/năm, khớp
DAT  Vùng chạm 44px: 11/11 phần tử ở WF-06, 13/13 ở WF-05
DAT  Không lọt NaN / Infinity / undefined · không có lỗi JS
```

### Việc còn lại — đợt 9

1. **Beta và XIRR vẫn chưa phải công thức trong Registry.** Cả hai đều thiếu một mảnh:

   - **Beta** cần chuỗi lợi suất của **chỉ số thị trường** để so, mà `DataProvider` mới chỉ có
     chuỗi giá từng mã. Phải thêm VN-Index vào bộ số liệu trước.
   - **XIRR** cần bảng **dòng tiền có ngày** — WF-05 đợt này mới làm bảng chuỗi giá. Wireframe
     xếp cả hai loại bảng vào cùng màn WF-05 ("OHLCV / dòng tiền"), nhưng phần dòng tiền chưa
     dựng.

   Vì thế đợt này dùng `xirr()` **trực tiếp** ở `summarisePortfolio()` và để người dùng nhập
   beta tay. Đăng ký sớm hơn thì màn chi tiết của hai công thức đó lúc nào cũng báo thiếu dữ liệu.

2. **Thị giá là số liệu mẫu bản thảo**, lấy từ phiên cuối của `SAMPLE_DATA`. Rủi ro R-01 vẫn mở.
3. **Chuỗi giá chỉ giữ được một mã một lúc.** Khoá `ffb.series.v1` lưu đúng một bảng; nạp mã
   khác là đè lên. Đủ cho việc tính một công thức, nhưng danh mục nhiều mã sẽ cần nhiều chuỗi.
4. **Bảng chưa ảo hoá.** 248 phiên render hết một lượt; `virtual-window.ts` đã có sẵn từ đợt 7
   nhưng ảo hoá bảng có ô nhập thì phải giữ được tiêu điểm khi dòng ra khỏi cửa sổ. Trần hiện
   tại là 400 phiên, đo được vẫn mượt, nên chưa làm.
5. **Còn ba màn trong bộ ảnh chưa làm**: WF-04 (DCF, cần trọn gói 5.2.3), và WF-02 · WF-03
   cần chỉnh lại theo hi-fi. Chủ dự án đã chốt **thêm KaTeX thật** cho khối công thức của
   WF-03 — gói 2.4.3 coi như mở lại, và phải nạp trễ theo trang để không vỡ ngưỡng 200 kB.

---

## Đợt 8 — Trang chủ WF-01 theo bản thiết kế hi-fi

Trạng thái: **đang chờ xác nhận**. `npm run check` xanh 597 test / 31 file, `npm run build`
xanh 30 trang, và 17/17 kiểm tra trên Chrome thật ở 360×780 đều đạt.

Không thuộc gói WBS nào — chủ dự án đưa ảnh render hi-fi của WF-01 và yêu cầu dựng theo.
Đợt 7 đã làm đúng **cấu trúc** wireframe; đợt này làm đúng **hình** của bản thiết kế.

### Bốn quyết định của chủ dự án

1. Đổi bảng màu sang **xanh dương** — lật quyết định "cam đất" của đợt 4.
2. Phạm vi chỉ **nội dung trang chủ**; không đụng cấu trúc header, banner, dải miễn trừ, tab bar
   (chúng vẫn đổi màu theo token — đó là hệ quả của hệ token, không phải sửa thêm).
3. Ô nhóm chưa có công thức: **bỏ** viền đứt và chữ "sắp có", mọi ô như nhau.
4. Thêm `shortName` cho **nhóm**; tên công thức giữ nguyên `name.vi` đầy đủ.

### Ba chỗ ảnh render ghi sai — không làm theo

Đối chiếu với WF-01 trích từ `Faculator-WireFrame.html` (ba file wireframe trong Downloads có
cùng md5 `dd3c2134…`, là một bản) và với `CATEGORIES`:

| Ảnh render ghi                  | Wireframe gốc + SRS 3.8 | Đã dùng                         |
| ------------------------------- | ----------------------- | ------------------------------- |
| "Chứng khoán · 97"              | 94                      | `expectedCountOf('stock')` = 94 |
| Cá nhân 18/13/13/17/8 (tổng 69) | 5/2/3/1/2 = 13          | `expectedCount` từng nhóm       |
| "Phát sinh"                     | "Phái sinh"             | "Phái sinh"                     |

Ảnh lặp lại số của mảng chứng khoán cho mảng cá nhân — nhìn tổng là biết: 69 ≠ 13.

Và **hai thẻ trong ảnh chưa tồn tại**, nên không dựng thẻ giả trỏ vào trang không có:

- **XIRR** — mới có hàm `xirr()`, chưa đăng ký thành công thức (việc còn lại đợt 7, mục 5);
- **"Phí & thuế giao dịch"** — nhóm `fees-tax` có 8 công thức lẻ, không có công thức "tổng chi
  phí một lệnh"; màn WF-08 gắn vào `loi-nhuan-rong`.

Khối nổi bật vì thế có **11 thẻ** (đúng số `isFeatured` đang có) chứ không phải 9 như ảnh.

### Đợt 8b — bám sát bản thiết kế cho cả khung app

Sau khi xem trang chủ chạy thật, chủ dự án yêu cầu làm nốt phần khung cho giống thiết kế:

- **Khối hộp ba chiều + tên "Falculator"** (`BrandMark.tsx` mới). Tên rút còn một chữ, bỏ
  "Finbox" ở đuôi; `app.name` đầy đủ vẫn dùng cho tiêu đề trang và metadata. Logo vẽ bằng SVG
  ăn theo token màu chứ không nhúng file ảnh — đổi bảng màu lần sau là logo đổi theo.
- **Nút ngôn ngữ thành công tắc hai chiều**: một nút, bấm đổi qua lại VI ↔ EN. Bản dịch tiếng
  Anh chưa có câu nào (gói 3.6.3) nên `t()` rơi về tiếng Việt — `title` nói trước điều đó.
- **Thứ tự khung đổi**: banner ngoại tuyến lên **trên** thanh trên, dải miễn trừ xuống **chân
  trang**. Xem mục đánh đổi ngay dưới.
- **Nút chế độ và nút ngôn ngữ nhìn cao 32px** như bản thiết kế, vùng chạm 44px giữ nguyên
  bằng lớp phủ `::after` trong suốt — cùng cách đã dùng cho nút nhỏ ở `Button.module.css`.
- **Icon thanh dưới vẽ lại**: lưới 4 ô cho Công thức, thư mục cho Danh mục, bánh răng cho Cài
  đặt. Mục đang chọn dùng icon **đặc**, mục khác dùng icon nét — khác biệt hình khối này thay
  cho vạch chỉ báo mà bản thiết kế không vẽ, nên NFR-USA-06 vẫn còn dấu hiệu không phụ thuộc màu.
- **Ô tìm kiếm** đổi từ bo tròn hoàn toàn sang bo 10px. Viền vẫn giữ `--color-border-strong`
  dù thiết kế vẽ mảnh hơn: đây là ranh giới điều khiển nên WCAG 1.4.11 đòi ≥ 3:1, mà
  `--color-border` chỉ đạt 1,35:1.
- **Tên thẻ công thức** đổi sang `--color-accent-strong` (xanh đậm hơn tiêu đề khối), đúng ảnh.
- **Trả nợ đợt 2**: `.skipLink` nay có `min-height: var(--tap-min)`. Cùng với `.brand` được
  dựng lại trong đợt này, **cả hai phần tử hụt vùng chạm từ đợt 2 đã hết**.

#### Dải miễn trừ: đã hỏi lại trước khi đụng vào

Chủ dự án lúc đầu yêu cầu **bỏ hẳn**. Tôi nêu rằng FR-24 · UI-04 được SRS xếp vào nhóm không
được cắt, cùng nhóm với FR-06, và app đang đưa ra giá hoà vốn, lãi ròng, ROI, lịch trả nợ —
dải này tồn tại để người dùng không đọc các số đó như lời khuyên mua bán. Chốt lại: **chuyển
xuống chân trang**, đổi từ dải vàng sang chữ nhỏ trên nền chìm.

Vẫn do `AppShell` dựng nên mọi màn đều có và không màn nào quên được. **Đánh đổi**: nó không
còn trong tầm nhìn đầu tiên, phải cuộn hết trang mới thấy — UI-04 nói "trong tầm nhìn đầu
tiên của mọi màn có kết quả", nên điểm này coi như **chưa đạt UI-04** cho tới khi chủ dự án
quyết lại. Câu miễn trừ trong file xuất PNG/PDF thì không đổi.

### Đã đổi file nào — đợt 8

- **`src/app/globals.css`** — 20 token màu sang bảng xanh, kèm `--focus-ring` và hai `--shadow-*`.
  Không đổi **tên** token nào, nên không component nào phải sửa — đúng thứ gói 1.2.1 dựng sẵn để
  chờ bản thiết kế, và là lần thứ hai nó chứng minh được (đợt 4 là lần đầu).
  Mọi cặp màu tính trước bằng công thức WCAG rồi mới chọn; cặp sát ngưỡng nhất là
  `--color-muted` trên `--color-sunken` đạt 5,02:1 trên mức cần 4,5:1.
- **`src/core/registry/types.ts`** + **`categories.ts`** — thêm `shortName` cho 12 nhóm, lấy
  **đúng nguyên văn wireframe** chứ không tự rút gọn. `name` đầy đủ vẫn dùng ở chip lọc, dropdown
  WF-02 và thẻ dạng hàng.
- **`src/ui/browse/CategoryGrid.tsx`** — bỏ prop `counts`, bỏ nhánh "sắp có", đổi sang một hàng
  tên trái / số phải. Giữ nguyên cách dựng href bằng `listParamsToQuery()` — chỗ này đợt 7 đã sửa
  một lỗi thật, không ghép chuỗi tay lại.
- **`src/ui/browse/FormulaCard.tsx`** — thêm `variant="tile"` cho lưới trang chủ: ba dòng
  tên · mô tả · nhóm, bỏ badge cấp độ và mũi tên. Để chung file với `row` thay vì viết component
  mới, nên chỗ dựng đường dẫn và chỗ tra nhóm chỉ có một bản.
- **`src/app/page.tsx`** + **`page.module.css`** — tiêu đề khối viết hoa màu nhấn, bỏ nhãn mã yêu
  cầu (`FR-20`, `21 / 107`), khối nổi bật đổi sang lưới hai cột. Vẫn là **server component**.
- **`src/application/i18n/vi.ts`** — bỏ `home.category.pending`, thêm `home.browse.unit`,
  `home.segment.stock`, `home.segment.personal`; đổi `home.searchEntry` theo câu của ảnh.
- **Test mới**: `CategoryGrid.test.tsx` (6 ca) và `FormulaCard.test.tsx` (6 ca); thêm 2 ca
  `shortName` vào `registry.test.ts`.

### Đánh đổi khi bỏ "sắp có" — cần theo dõi

Số trên ô nhóm nay luôn là số **dự kiến** của SRS, nên bấm "Kỹ thuật · 18" sẽ ra danh sách rỗng.
Đợt 7 cố ý tránh đúng điều này. Hai thứ còn đỡ lại: `EmptyState` của WF-02 nói rõ phạm vi, và
dòng tiến độ cuối trang chủ ("hiện có 21/107") — **đã giữ lại dù ảnh không có nó**, vì sau khi
bỏ nhãn "sắp có" thì đây là chỗ duy nhất còn nói thật.

### Bốn lỗi trong chính bộ kiểm — đợt 8

Cả bốn đều báo hỏng oan, phải sửa bộ kiểm mới tin được kết quả:

1. **Quét chữ "sắp có" trên cả `body` thì dính nhãn ẩn của `LangSwitch`** — "Bản tiếng Anh sắp
   có" nằm trong `span.visually-hidden` ở header, không liên quan lưới nhóm. Phải quét đúng
   phạm vi lưới.
2. **Đo vòng focus ngay sau khi đã `scrollIntoView` tới cuối trang** — chuỗi Tab bắt đầu từ
   vùng đang cuộn nên lần Tab đầu rơi vào `body` và tính là hụt (đo được 7/8). Cuộn về đầu và
   `blur()` trước khi bấm Tab thì đủ **8/8**.
3. **`elementFromPoint` không bao giờ trúng link "Bỏ qua điều hướng"** — nó cố ý nằm ở
   `top: -48px` cho tới khi được focus, nên mọi phép đo vùng chạm đều báo hụt trong khi kích
   thước thật đã đủ. Phải `focus()` nó rồi mới đo.
4. **Nút dev-tools của Next.js che tab "Cài đặt"** — vòng tròn đè lên góc phải dưới, làm phép
   đo vùng chạm báo hụt. Chỉ có ở `npm run dev`; đo trên bản build tĩnh thì hết. Cùng loại bẫy
   "đo nhầm môi trường" với việc chạy build khi dev server đang mở ở đợt 5.

### Kết quả kiểm tra — đợt 8

```text
npm run check  ✔ 597 test / 31 file (tăng 14 so với đợt 7), lint và typecheck sạch
npm run build  ✔ 30 trang; trang chủ vẫn 134 kB First Load, không đổi
```

Chạy thật trên Chrome ở 360×780, trên **bản build tĩnh** — 17/17 đạt:

```text
DAT  Không tràn ngang — scrollWidth 360 / viewport 360
DAT  Khối nổi bật xếp hai cột — 11 thẻ / 6 hàng
DAT  Thẻ ô không có mũi tên, không có badge cấp độ, đủ ba dòng
DAT  Lưới nhóm 7 + 5 ô · không còn viền đứt · không còn chữ "sắp có"
DAT  Tiêu đề ghi 107 công thức · Chứng khoán · 94 · Tài chính cá nhân · 13
DAT  Dòng tiến độ vẫn nói thật 21/107
DAT  Vùng chạm 44px — đo đủ 33 phần tử bấm được (kể cả nút chế độ và nút ngôn ngữ
     nhìn cao 32px), không cái nào hụt. Đo bằng elementFromPoint ở mép trên/dưới
     của ô 44×44, không đo bằng chiều cao thẻ
DAT  Không lọt NaN / Infinity / undefined (FR-06) · không có lỗi JS
DAT  Bảng màu xanh đang chạy — accent #1d4ed8 · paper #f4f6fa
DAT  Tiêu đề khối và số nhóm dùng rgb(29,78,216), viết hoa
DAT  Bấm Tab thật qua 8 phần tử — cả 8 có vòng focus, thứ tự đúng:
     bỏ qua điều hướng → thương hiệu → Cơ bản → Nâng cao → VI → ô tìm kiếm → thẻ
DAT  Bốn màn khác (/cong-thuc, /tim-kiem, /cong-thuc/pe, /cong-thuc/loi-nhuan-rong)
     không tràn ngang, không lọt rác, còn dải miễn trừ, không lỗi JS
```

Chụp màn hình ở chế độ **xám hoàn toàn** (NFR-USA-06): tiêu đề khối vẫn nổi bằng cỡ chữ + viết
hoa + đậm; số nhóm phân biệt bằng vị trí + nét đậm; thẻ phân biệt bằng viền và nền. Và mở ảnh ra
nhìn tận mắt cả trang chủ lẫn màn danh sách — thẻ dạng `row` của WF-02 giữ nguyên hình.

### Việc còn lại — đợt 8

1. **Tên công thức trong ô vẫn là tên đầy đủ.** Ảnh ghi "ROI", "P/E", "Giá hoà vốn"; ô hiện tại
   ghi "ROI — tỷ suất lợi nhuận", "P/E — hệ số giá trên lợi nhuận", nên cao hơn ảnh khoảng một
   dòng. Muốn khớp hẳn thì thêm `shortName` cho `FormulaSpec` — chạm 5 file công thức, schema,
   validator và test. Đã chốt chưa làm ở đợt này.
2. **Thứ tự thẻ trong khối nổi bật theo Registry**, không theo ảnh (ảnh mở đầu bằng phí & thuế,
   hiện tại mở đầu bằng P/E). Nếu muốn thứ tự cố định thì cần thêm trường thứ hạng vào spec.
3. **Ô nhóm rỗng vẫn bấm vào được** — xem mục đánh đổi ở trên.
4. **Dải miễn trừ không còn trong tầm nhìn đầu tiên** — UI-04 coi như chưa đạt, chờ chủ dự án
   quyết lại. Xem mục "Dải miễn trừ" ở trên.
5. **Nút EN đổi được nhưng chưa có gì để đọc** — bấm sang EN thì giao diện vẫn tiếng Việt cho
   tới khi gói WBS 3.6.3 dịch xong 168 câu. Cần cho người dùng biết trước điều này rõ hơn là
   một dòng `title`, hoặc làm luôn gói dịch.
6. `favicon.ico` vẫn 404.
7. **Chưa kiểm trên thiết bị thật** — vẫn là Chrome headless, xem mục "Việc còn lại — đợt 5".

---

## Đợt 7 — WBS 3.1 và 3.2 (sáu màn v0.1)

Trạng thái: **đang chờ xác nhận**. `npm run check` xanh 583 test / 29 file, `npm run build`
xanh 30 trang, và 56/56 kiểm tra trên Chrome thật ở 360×780 đều đạt.

### Phải kéo một phần nhánh 5 về trước — vì sao

WBS ghi nhánh 3 "chỉ tính công lắp ráp". Nhưng bốn trong sáu màn **không dựng được** nếu
Registry còn rỗng, và hai màn thì bản thân chúng là phép tính:

- `FORMULAS` rỗng thì trang chủ không có gì để ghim, danh sách không có dòng nào, và
  `/cong-thuc/[id]/` **không build được** — với `output: 'export'`, Next từ chối một route
  động mà `generateStaticParams()` trả mảng rỗng.
- WF-08 và WF-14 không phải màn hiển thị dữ liệu có sẵn: toàn bộ nội dung của chúng **là**
  kết quả tính.
- Và repo chưa có bộ máy tính toán nào — `FormulaSpec` chỉ là metadata.

Nên đợt này làm thêm **21 công thức** (gói 5.1.2 trọn, phần lớn 5.1.4, một phần 5.1.3 và
5.2.2). Phần kéo về đều xếp **v0.1**, tức là sớm muộn cũng phải làm cho bản phát hành đầu.

### Một lỗ hổng đáng sửa, phát hiện khi đọc lại schema

`FormulaSpec.tests[]` đã có từ gói 1.3.1 và validator bắt buộc mỗi công thức có ít nhất một ca.
Nhưng **chưa có gì chạy chúng** — NFR-MNT-02 coi như chưa được canh suốt sáu đợt.
`runSpecTests()` của đợt này làm nó chạy thật, và bài test duyệt `FORMULA_MODULES` nên công thức
thêm về sau tự động được kiểm, không phải đăng ký ở đâu.

### Đã đổi file nào — đợt 7

#### Bộ máy tính toán (`src/core/calc/`, mới)

- **`types.ts`** — `CalcFn`, `CalcContext`, và `FormulaModule` gộp spec với hàm tính vào **cùng
  một object**. Tách thành hai bảng tra theo id thì khai công thức mà quên hàm tính là lỗi chỉ
  lộ lúc chạy; gộp lại thì typecheck bắt ngay.
- **`run.ts`** — `runFormula()` là cổng duy nhất. Giữ hai lời hứa mà từng công thức không phải
  tự nhớ: ô để trống báo "Chưa nhập đủ" kèm tên ô chứ **không thay bằng 0**; hàm tính ném lỗi
  thì bắt lại thành cảnh báo. Ô trống cố ý **không** rơi về `defaultValue` — mặc định chỉ là
  giá trị khởi tạo của giao diện, không phải giá trị thay thế lúc tính.
- **`run-tests.ts`** — chạy chính `spec.tests[]`, so cả kết quả lẫn **mã cảnh báo mong đợi**.

#### 21 công thức (`src/core/formulas/`, mới)

| File           | Số CT | Nội dung                                                                     |
| -------------- | ----- | ---------------------------------------------------------------------------- |
| `fees.ts`      | 8     | Trọn nhóm phí & thuế VN, kèm `buildFeeBreakdown()` dựng cả khối WF-08        |
| `personal.ts`  | 6     | Vay nợ 3 + tiết kiệm 3, kèm `buildAmortisation()` và `condenseSchedule()`    |
| `returns.ts`   | 4     | ROI, HPR, CAGR, tỷ suất cổ tức — kèm `xirr()` chưa đăng ký, xem việc còn lại |
| `multiples.ts` | 2     | P/E, P/B                                                                     |
| `risk.ts`      | 1     | Cỡ lệnh theo % rủi ro                                                        |

Con số trong `tests[]` **không tự nghĩ ra**: lấy từ nguồn độc lập rồi mới viết hàm. Chi tiết ở
[`src/core/formulas/README.md`](src/core/formulas/README.md).

#### Màn hình — sáu màn v0.1

- **`src/app/page.tsx`** — thay hẳn màn khói của gói 1.1 bằng WF-01. Giữ là **server component**,
  không hook: trang đầu người dùng thấy thì nên nhẹ nhất có thể.
- **`src/ui/browse/CategoryGrid.tsx`** — lưới 12 nhóm. Số đếm **nói thật**: nhóm đã có công thức
  hiện số thật, nhóm chưa có hiện số dự kiến kèm chữ "sắp có" và viền đứt. Không để người dùng
  bấm vào "Phân tích kỹ thuật · 18" rồi gặp danh sách rỗng.
- **`src/core/virtual-window.ts`** + **`src/ui/browse/VirtualList.tsx`** — ảo hoá danh sách,
  tự viết, không thêm dependency. Cuộn theo cả trang chứ không tạo khung cuộn lồng.
  Chỉ ảo hoá khi vượt 40 mục, nên 21 công thức hiện tại vẫn đi đường thường.
- **`src/app/tim-kiem/`** (mới) — WF-09. `robots: noindex` và **không** vào `sitemap.xml`.
- **`src/app/cong-thuc/[id]/`** (mới) — WF-03, chín khối đúng thứ tự wireframe.
- **`src/ui/screens/`** (mới) — `FeeTaxBody` (WF-08) và `LoanScheduleBody` (WF-14), nạp trễ
  theo id công thức bằng `next/dynamic`.
- **`src/ui/inputs/VariableField.tsx`** (mới) — chọn điều khiển theo `spec.type`. Đây là chỗ
  biến lời hứa FR-05 thành sự thật ở cấp màn: màn chi tiết duyệt `variablesForLevel()` rồi
  dựng component này, không màn nào phải biết biến nào dùng ô số và biến nào dùng thanh trượt.
- **`src/application/recent-searches.ts`** (mới) + test — chip "Tìm gần đây".

### Gỡ được ba việc còn treo từ các đợt trước

1. **Route động `/cong-thuc/[id]/`** — việc chặn số 1 của đợt 2, treo từ tháng trước. Registry
   hết rỗng nên `generateStaticParams()` có 21 tham số và build sinh ra 21 trang.
2. **Trạng thái "không tìm thấy"** — việc còn lại số 2 của đợt 3. Giờ chạm tới được.
3. **Ba bottom sheet đã nối vào màn thật** — việc còn lại số 4 của đợt 6.

Và **đã xoá `src/app/thu-nghiem/`**, đúng lời hẹn ghi trong JSDoc của chính nó từ đợt 5.

### Ba lỗi thật, mỗi lỗi lộ ra theo một cách khác nhau

1. **Ô nhóm ở trang chủ không lọc gì.** Tôi ghép tay chuỗi `?nhom=<id>` trong khi bộ đọc URL
   dùng tham số `category`. Link vẫn mở được trang nên trông như chạy đúng, chỉ khi đếm kết quả
   mới thấy vẫn là 21. Không test nào bắt được vì hai bên nằm ở hai file khác nhau.
   Sửa: dựng chuỗi bằng chính `listParamsToQuery()`, và thêm ca kiểm duyệt **cả 12 nhóm** —
   dựng URL rồi đọc lại phải ra đúng nhóm đó.
2. **Màn chi tiết hiện LaTeX thô.** Bốn công thức thiếu `expression` nên rơi về `latex`, người
   dùng nhìn thấy `L_{rong} = Q\,(P_{ban} - P_{mua})`. Chỉ lộ ra khi **mở màn ra nhìn ảnh chụp**
   — cùng loại với lỗi file PNG của đợt 6. Sửa: viết lại cả 21 `expression` thành công thức
   bằng chữ tiếng Việt (`P/E = Giá thị trường ÷ EPS`), sửa lại JSDoc của trường cho đúng công
   dụng mới, và thêm ca kiểm chặn ký hiệu LaTeX lọt vào.
3. **Hai con số tôi tính sai lúc soạn ca kiểm thử** — tổng lãi gốc đều và khoản gửi tiết kiệm
   mục tiêu. Bắt được vì đã tính lại độc lập bằng script trước khi tin, và tổng lãi gốc đều còn
   đối chiếu chéo bằng dạng đóng `i × P × (n+1) / 2`.

### Ba lỗi trong chính bộ kiểm — đợt 7

Đáng ghi vì lần nào cũng suýt báo đạt oan hoặc hỏng oan:

1. **`innerText` trả chữ ĐÃ viết hoa bởi CSS.** Nhiều tiêu đề khối dùng `text-transform:
uppercase`, nên so thẳng với chuỗi trong mã nguồn báo hỏng oan. Phải so bỏ qua hoa thường.
2. **Bộ lọc lỗi JS không nhận ra favicon 404.** Thông điệp là "Failed to load resource…", không
   chứa chữ "favicon" — phải soi trường `url` của bản ghi log.
3. **`el.focus()` bằng JS không kích hoạt `onFocus` của React.** `NumberInput` đổi ô từ chuỗi đã
   định dạng (`6.050`) sang chuỗi thô (`6050`) ngay trong `onFocus`; gọi `.focus()` từ
   `Runtime.evaluate` đặt được `activeElement` nhưng handler không chạy, nên ký tự gõ vào chỉ nối
   thêm vào đuôi — đo được `60500` thay vì `0`, và tôi suýt kết luận sai là sản phẩm hỏng.
   Phải **bấm chuột thật** qua CDP. Cùng loại bẫy với `:focus-visible` của đợt 4.

### Kết quả kiểm tra — đợt 7

```text
npm run check  ✔ 583 test / 29 file (tăng 146 so với đợt 6), lint và typecheck sạch
npm run build  ✔ 30 trang, trong đó 21 trang công thức sinh từ generateStaticParams()
sitemap.xml    ✔ 25 URL (4 trang tĩnh + 21 công thức); /tim-kiem KHÔNG có mặt, đúng chủ ý
```

Chạy thật trên Chrome ở 360×780, trên **bản build tĩnh** — 56/56 đạt. Sáu màn đều kiểm bốn
điều chung (không tràn ngang · không lọt NaN/Infinity/undefined · không lỗi JS · có dải miễn
trừ), cộng phần riêng của từng màn:

```text
DAT  WF-01 khối "Công thức dùng hằng ngày", hai mảng 94/13, nhóm chưa có ghi rõ "sắp có"
DAT  WF-02 đếm đúng 21 công thức, lọc theo nhóm chạy, gõ không dấu ra kết quả
DAT  WF-09 con trỏ đặt sẵn trong ô nhập; "hoa von" ra kết quả; "bitcoin" nêu rõ phạm vi
DAT  WF-03 đủ chín khối, kết quả 15,21 lần, hai khối trống nói rõ lý do
DAT  WF-03 sửa EPS về 0 thì ra "— , —" kèm nguyên nhân, không ra 0 (FR-06)
DAT  WF-03 nút Nạp mẫu mở sheet, Esc đóng được
DAT  WF-08 bốn dòng bóc tách + tổng 381.850 ₫ + hoà vốn 92.370 ₫ + lãi ròng +4.618.150 ₫
     + ROI +5,01 % — khớp từng đồng với ví dụ wireframe
DAT  WF-14 7.457.050 ₫/tháng · tổng lãi 989,7 tr₫ · tổng phải trả 1.789,7 tr₫
DAT  WF-14 bảng rút gọn còn 43 dòng, có nói rõ đã rút gọn, cuộn ngang trong khung riêng
DAT  Vùng chạm ≥ 44px trên mọi phần tử mới của đợt này
DAT  Bấm Tab qua 10 phần tử trên màn chi tiết, cả 10 đều có vòng focus
```

Chụp màn hình ở chế độ **xám hoàn toàn** để kiểm không phụ thuộc màu (NFR-USA-06): nhóm chưa có
công thức phân biệt được bằng viền đứt + nền chìm + chữ "sắp có"; khối lãi ròng của WF-08 nhấn
bằng viền dày 2px + nền, không chỉ bằng màu; dấu `+`/`−` luôn đi kèm số.

### Việc còn lại — đợt 7

1. **Dung lượng gói sẽ vượt ngưỡng khi đủ 107 công thức.** Đo được: metadata của 21 công thức
   là một chunk **67,8 kB** thô, và First Load của trang chủ tăng từ 104 lên **134 kB**.
   Suy ra 107 công thức ≈ 150 kB chỉ riêng metadata → tổng khoảng **255 kB**, vượt ngưỡng
   200 kB của NFR-PER-04.

   Nguyên nhân: `FormulaBrowser` và `SearchScreen` là client component và import thẳng
   `FORMULAS`, nên kéo cả bốn mục diễn giải, ví dụ, ca kiểm thử và nguồn của mọi công thức vào
   gói JS — trong khi màn danh sách chỉ cần id, tên, mô tả, nhóm, cấp độ và từ khoá.

   Hướng xử đã rõ: trang (server component) tự chiếu ra bộ chỉ mục nhẹ rồi truyền xuống client
   qua props, và `selectFormulas()` nhận kiểu hẹp hơn `FormulaSpec`. Chưa làm ở đợt này vì
   ngưỡng chưa vỡ và đây là thay đổi cắt ngang; **nên làm trước khi thêm nhóm công thức tiếp
   theo**, đừng để tới 107 mới sửa.

2. **Nội dung 21 công thức cần người rà.** Bốn mục diễn giải và câu chữ nguồn tham khảo do tôi
   soạn theo giáo trình. Phần toán đã có ví dụ số kiểm chứng độc lập, nhưng **phần chữ thì
   chưa ai đọc lại** — cùng loại việc còn treo với `schedules.ts`.

3. **EMI của WF-14 lệch 50 ₫ so với wireframe.** Wireframe ghi 7.457.100 ₫, giá trị đúng là
   7.457.049,50 ₫ — wireframe làm tròn tới hàng trăm. Tôi giữ giá trị đúng; tổng lãi và tổng
   phải trả thì khớp y nguyên. Cần chủ dự án xác nhận cách làm tròn muốn hiển thị.

4. **Gói 3.2.2 (WF-04) hoãn theo thoả thuận** — nó cần trọn chuỗi Beta → CAPM → WACC → DCF →
   giá mục tiêu → biên an toàn, tức gói 5.2.3 (22h30), và cả hai đều xếp v0.2.

5. **XIRR có hàm và test nhưng chưa thành công thức** — cần bảng nhập dòng tiền có ngày, gói
   3.3.1 (WF-05). Đăng ký sớm thì màn chi tiết của nó lúc nào cũng báo thiếu dữ liệu.

6. **Hai phần tử hụt vùng chạm từ đợt 2 vẫn còn** (`.skipLink` 36px, `.brand` 26px). Nằm ngoài
   phạm vi gói 3.1/3.2 nên không sửa; xem mục "Việc còn lại — đợt 5".

7. **`favicon.ico` 404** — vẫn chưa có, vẫn không phải lỗi, vẫn nên thêm cho sạch log.

---

## Đợt 6 — WBS 2.5 (bottom sheet)

Trạng thái: **đang chờ xác nhận**. `npm run check` xanh 437 test / 23 file, `npm run build`
xanh, 21/21 kiểm tra sheet trên Chrome thật đạt, và file PNG xuất ra đã mở xem tận mắt.

Hết nhánh 2 của WBS, trừ gói 2.4.3 KaTeX đang hoãn.

### Không thêm dependency nào

WBS 2.5.3 ghi "xuất PDF/PNG", nghe như phải cài `jspdf` + `html2canvas` (~400 kB). Không cần:

- **PDF** đi qua `window.print()` với `@page { size: A4 }`. Trình duyệt nào cũng có sẵn mục
  "Lưu thành PDF", và bản in đúng bằng những gì CSS in mô tả. Đổi lại thì phần in phải khai
  ở `globals.css` chứ không nằm trong CSS Module, vì nó cần chạm tới toàn trang.
- **PNG** vẽ tay bằng Canvas 2D. Không phải ảnh chụp DOM mà là một tấm thẻ chia sẻ có chủ
  đích — đúng chữ "PNG chia sẻ nhanh" của WF-12, và không sai font như html2canvas hay bị.

### Đã đổi file nào — đợt 6

#### Tầng Domain — phần khó, test bằng Node

- **`src/core/paste-import.ts`** + test (mới, **41 ca**) — toàn bộ gói 2.5.2 nằm ở đây:
  nhận ký tự ngăn cột (Tab · phẩy · chấm phẩy · gạch đứng), nhận dòng tiêu đề, gán cột theo
  tiêu đề hoặc theo vị trí, đọc số kiểu Việt Nam, và **đếm dòng hợp lệ cùng danh sách dòng bỏ
  qua kèm lý do và số dòng** — đúng ba thứ WF-11 đòi. Không ném lỗi bao giờ: dán 500 dòng mà
  hỏng 2 thì vẫn nạp được 498.
- **`src/core/export-content.ts`** + test (mới, 18 ca) — dựng nội dung file xuất.
  `buildExportContent()` là cổng duy nhất và nó **luôn** điền `disclaimer`, không nhận tham số
  nào để tắt. Kiểu trả về là `string` chứ không phải `string | undefined`, nên bỏ sót là hỏng
  lúc typecheck. Đây là FR-24 được canh ở tầng Domain, cùng cách nghĩ với `ok()` giữ FR-06.
- **`src/core/disclaimer.ts`** (mới) — một hằng số, không import gì. Từ điển i18n và bộ dựng
  file xuất cùng đọc từ đây nên dải miễn trừ trên màn và câu trong file không thể lệch nhau.

#### Tầng Data — lần đầu có nội dung

- **`src/data/types.ts`**, **`provider.ts`**, **`samples.ts`**, **`index.ts`** + test (mới, 17 ca).
  `DataProvider` là hợp đồng của FR-17: khi có nguồn thật thì viết một cài đặt khác của cùng
  interface, giao diện không sửa dòng nào.
- Chuỗi giá sinh bằng bước ngẫu nhiên **có hạt giống cố định**, không dùng `Math.random`: bản
  build là HTML tĩnh nên số liệu phải giống hệt giữa lúc build và lúc chạy, nếu không lệch
  hydration. Cùng lý do với việc `resolveConstant()` bắt buộc nhận `asOf`.

#### Component — đợt 6

- **`src/ui/primitives/BottomSheet.tsx`** (mới) — dựng trên `<dialog>` gốc: có sẵn bẫy tiêu
  điểm, phím Esc, lớp nền mờ. Cả ba sheet dùng chung.
- **`src/ui/sheets/PresetSheet.tsx`** — WF-10. Tìm bỏ dấu, hiện cảnh báo số liệu bản thảo,
  và nói thẳng "sau khi nạp, mọi ô vẫn sửa được từng cái một" (FR-10).
- **`src/ui/sheets/PasteImportSheet.tsx`** — WF-11. Kết quả kiểm tra hiện **ngay khi dán**,
  trước khi bấm Nạp.
- **`src/ui/sheets/ExportSheet.tsx`** + **`draw-card.ts`** — WF-12. Khối miễn trừ cố ý **không
  phải ô tick** mà là thông báo.
- **`src/app/globals.css`** — thêm khối `@media print` và `@page { size: A4 }`.
- **`src/app/thu-nghiem/`** — thêm ba nút mở sheet để nhìn chạy thật.

### Ba lỗi bộ test bắt được trước khi có giao diện

Đáng ghi lại vì cả ba đều sẽ rất khó tìm nếu chỉ thử tay trên màn:

1. **Bảng hai cột bị nuốt mất dòng đầu.** Luật nhận dòng tiêu đề chỉ đếm "ít ô số", mà dòng
   `15/07⇥25.4` có đúng một ô số (vì `15/07` không phải số) nên bị coi là tiêu đề. Sửa: đòi
   thêm điều kiện có ít nhất một ô khớp từ khoá tiêu đề đã biết.
2. **Bảng "Ngày · Giá" không có cột giá đóng cửa.** Đoán cột theo vị trí luôn giả định đủ 4 cột
   OHLC, nên cột thứ hai bị gán thành 'Mở' và **mọi dòng bị loại**. Sửa: dưới 4 cột thì cột
   cuối luôn là giá đóng cửa.
3. **Dòng thiếu ngày bị tụt cột.** `trim()` cả dòng xoá mất ô rỗng đứng đầu, nên `⇥25.4` thành
   `25.4` và giá bị đọc thành ngày. Sửa: chỉ trim từng ô, không trim cả dòng.

### Một lỗi chỉ lộ ra khi mở file PNG ra xem

Biến kiểu chọn xuất ra **con số thô**: file ghi "Kỳ số liệu: 2" thay vì "Kỳ số liệu: Năm".
Test và kiểm tự động đều xanh vì chúng chỉ kiểm có dòng đó hay không, chưa kiểm nội dung có
đọc được hay không. Sửa ở `describeInput()`: biến có `options` thì tra nhãn (LDR-02).
Đây là lý do đáng để mở file xuất ra nhìn tận mắt chứ không chỉ kiểm kích thước file.

### Kết quả kiểm tra — đợt 6

```text
npm run check  ✔ 437 test / 23 file (tăng 92 so với đợt 5), lint và typecheck sạch
npm run build  ✔ 9 trang; /thu-nghiem 131 kB, trang sản phẩm 105–121 kB (ngưỡng 200 kB)
npm audit      ✔ vẫn đúng 6 cảnh báo như baseline, không thêm dependency nào
```

Chạy thật trên Chrome ở 360×780, trên bản build tĩnh — 21/21 đạt:

```text
DAT  WF-10 sheet mở được bằng <dialog>, Esc đóng được
DAT  WF-10 tìm bỏ dấu — gõ "hoa phat" ra HPG, ẩn FPT
DAT  WF-10 nói rõ số liệu là bản thảo tự dựng (R-01)
DAT  WF-10 bấm Nạp thì sheet đóng và giá trị chảy về màn
DAT  WF-11 đếm đúng số dòng hợp lệ ngay khi dán
DAT  WF-11 nêu dòng bỏ qua kèm lý do và số dòng
DAT  WF-11 gán lại cột thì tính lại ngay
DAT  WF-12 nói rõ miễn trừ không tắt được, và không có ô tick nào cho nó
DAT  WF-12 vùng in có sẵn trong DOM, ẩn trên màn, mang câu miễn trừ
DAT  Không tràn ngang ở 360px khi sheet đang mở
DAT  Không lọt NaN / undefined ra màn · không có lỗi JS
```

Xuất PNG thật rồi mở ra xem: file `falculator-pe.png`, 1080×1108, 133 kB, chữ tiếng Việt có
dấu hiện đúng, câu miễn trừ nằm trong khung riêng ở cuối.

### Việc còn lại — đợt 6

1. **Số liệu mẫu là bản thảo tôi tự dựng, không phải BCTC thật.** Giả định A1 và rủi ro R-01
   của SRS vẫn còn nguyên. Mọi `Preset` mang `isDraft: true` và sheet WF-10 hiện cảnh báo,
   nhưng **phải thay bằng số liệu thật trước khi phát hành v0.1**. Thay nội dung
   `src/data/samples.ts` là đủ, không phải sửa chỗ nào khác.
2. **Bản in PDF chưa xem trên giấy.** Đã kiểm vùng in có mặt trong DOM và mang câu miễn trừ,
   nhưng chưa ai bấm in ra PDF thật để xem ngắt trang có đúng không. Cần làm thủ công trên
   Chrome, Safari và một máy in thật.
3. **PNG chỉ có một khổ.** WF-12 không nói khổ nào; hiện vẽ 1080 px ngang. Nếu cần khổ vuông
   cho mạng xã hội thì thêm sau, `drawExportCard()` đã tách riêng nên không đụng vào sheet.
4. **Chưa nối sheet vào màn công thức thật** — mới lắp ở màn thử. Việc nối thuộc gói 3.2.1
   khi dựng WF-03.
5. Hai phần tử hụt vùng chạm từ đợt 2 (`.skipLink` 36px, `.brand` 26px) **vẫn còn** — xem
   mục "Việc còn lại — đợt 5".

---

## Đợt 5 — WBS 2.3 + 2.4 (nhập liệu, hiển thị kết quả & diễn giải)

Trạng thái: **đang chờ xác nhận**. `npm run check` xanh 345 test / 19 file, `npm run build`
xanh, 11/12 kiểm tra trên Chrome thật đạt (mục còn lại là lỗi có sẵn từ đợt 2, xem cuối mục).

### Gỡ được việc chặn số 4 của đợt 2 — wireframe đọc được

TASK.md từng ghi "File HTML trên Drive là bundle base64 không đọc được". **Sai.**
`Wireframe Falculator Finbox.html` trong thư mục Downloads đọc được: nội dung nằm trong chuỗi
JS có ký tự bị escape (dấu gạch chéo ghi thành mã unicode `u002F`), **không phải base64**.
Giải mã bằng:

```bash
grep -oP '============ WF-16.*?============ WF-17' "Wireframe Falculator Finbox.html" \
  | perl -pe 's/\\u002F/\//g; s/<[^>]*>/\n/g'
```

Nhờ đó đợt này bám đúng nguyên văn WF-16 (5 trạng thái ô số kèm dữ liệu mẫu), WF-15 (6 loại
lỗi kèm câu chữ và gợi ý sửa) và WF-03 (9 khối). Ghi lại lệnh ở đây để lần sau khỏi mò.

### Đã đổi file nào — đợt 5

#### Bước 0 — hạ tầng test cho component

- **`package.json`** — thêm 4 devDependency: `jsdom`, `@testing-library/react`,
  `@testing-library/user-event`, `@vitejs/plugin-react`. Cố ý **không** thêm
  `@testing-library/jest-dom`; `expect(el).not.toBeNull()` đủ dùng.
  Phải ghim `@vitejs/plugin-react@4.7.0`: bản 6 đòi Vite 8 trong khi Vitest 3.0.5 kéo Vite 6.
- **`vitest.config.ts`** — thêm plugin React và mở `include` sang `*.test.tsx`. Trước đó file
  `.test.tsx` bị bỏ qua **im lặng**, không báo lỗi — viết bao nhiêu test component cũng vô ích.
  Mặc định vẫn `environment: 'node'`; file nào cần DOM thì tự bật bằng docblock
  `// @vitest-environment jsdom`, ổn định hơn `environmentMatchGlobs` (đã deprecated ở Vitest 3).
- **`src/ui/primitives/Button.test.tsx`** (mới) — test khói chứng minh hạ tầng chạy thật
  trước khi 2.3 và 2.4 dựa vào nó.

#### Bốn module thuần ở Domain — phần khó nằm hết ở đây

Cùng cách nghĩ với `search.ts` của đợt 3: thứ dễ sai thì đưa ra khỏi JSX để test bằng Node.

- **`src/core/format.ts`** + test (mới, 28 ca) — repo trước đó **không có tiện ích định dạng số
  nào**. `formatNumber` theo quy ước Việt Nam, `parseViNumber` đọc ngược cả `92.000` lẫn `14,3`
  lẫn dấu trừ Unicode `−` của wireframe, `formatCalcOutput` trả đúng chuỗi `— , —` của WF-15.
  Locale ghim cứng `'vi-VN'`: bản build là HTML tĩnh, lấy locale hệ thống sẽ lệch hydration.
  Chuỗi rác trả `null` chứ **không bao giờ** trả NaN (FR-06).
- **`src/core/input-state.ts`** + test (mới, 29 ca) — bảng chuyển 5 trạng thái WF-16.
  Thứ tự ưu tiên khai tường minh (`locked` → `outOfRange` → `derived` → `editing` → `default`)
  và có test riêng cho từng cặp tranh chấp, vì đó mới là chỗ dễ sai. `commitValue()` là chỗ
  **duy nhất** được kẹp giá trị.
- **`src/core/linked-input.ts`** + test (mới, 23 ca) — bốn mode của FR-15. Ca then chốt:
  **ghi đè thắng cả khi thượng nguồn đang lỗi**. Nếu không thì dòng gợi ý "Mở Beta để sửa ·
  hoặc ghi đè WACC tại đây" của WF-15 thành lời hứa suông.
- **`src/core/flow-chain.ts`** + test (mới, 12 ca) — sắp topo dải WF-04 từ `dependsOn`, thứ tự
  không viết cứng. Đồ thị có vòng thì trả phần kẹt ở `cyclic` chứ không lặp vô hạn. Gói 5.3.1
  dùng lại đúng hàm này.

#### 2.3 — Bộ điều khiển nhập liệu (`src/ui/inputs/`, mới)

- **`NumberInput`** — bọc primitive `Input`, ánh xạ 5 trạng thái sang 4 sắc thái sẵn có
  (`editing` không cần tone riêng vì `:focus-within` đã lo). **Không có CSS Module**: mọi khác
  biệt về hình đã nằm ở primitive. Dòng phụ đi qua `hint`/`error` của primitive chứ không tự
  vẽ thẻ riêng — nhờ vậy được nối sẵn vào `aria-describedby` và lỗi miền có `role="alert"`.
  Không kẹp giá trị trong lúc gõ; ô giữ chuỗi thô khi đang gõ và chuỗi đã định dạng khi rời ra,
  nếu không thì gõ `92000` sẽ bị chèn dấu chấm giữa chừng và con trỏ nhảy.
- **`SliderInput`** — nhãn `min · step · max` đọc từ metadata, dùng `snapToStep()`. Nút kéo 28px,
  cả hàng 44px (NFR-USA-01 nói rõ "kéo được bằng ngón cái").
- **`ButtonGroup`** — Quý · Năm · TTM, `aria-pressed` như ModeToggle.
- **`RadioGroup`** — radio thật trong `<fieldset>`, mỗi dòng có mô tả phụ; cả dòng là vùng chạm.
- **`SelectInput`** + primitive **`Select`** (mới) — và **thay luôn** `<select>` viết tay trong
  `CategoryFilter.tsx`, đúng việc TASK.md dòng 113 đã hẹn cho gói 2.3.3. Nhờ vậy bỏ được
  `.label` và `.select` trùng lặp trong `CategoryFilter.module.css`.
- **`Toggle`** — `role="switch"`, kèm dòng ghi nguồn hằng số (`Market Config · CON-10`) đúng
  yêu cầu WF-16. Nhãn chữ Bật/Tắt luôn hiện, không chỉ vị trí nút gạt.
- **`UnitSwitcher`** — `tỷ ₫ | triệu ₫ | ₫` (CON-05). Chỉ đổi cách hiển thị; công thức luôn
  nhận số đơn vị đồng.
- **`LinkedInput`** — gói đắt nhất. Bốn trạng thái phân biệt bằng **viền trái 3px và nhãn chữ**
  (`↳ CAPM` / `đã ghi đè`), không chỉ bằng màu — FR-15 nói thẳng điều này. Sửa tay ngay trên ô
  cũng tính là ghi đè, không bắt bấm nút trước.

#### 2.4 — Hiển thị kết quả & diễn giải (`src/ui/result/`, mới)

- **`ResultBlock`** — không tự vẽ trạng thái lỗi mà **giao cho `ErrorState`**. Nhờ vậy khuôn
  `— , —` + nguyên nhân + gợi ý sửa của WF-15 chỉ có một chỗ định nghĩa, và FR-06 không phụ
  thuộc việc người viết màn có nhớ kiểm `value === null` hay không — cùng cách nghĩ với `ok()`.
- **`ErrorState`** · **`InlineWarning`** — sáu loại WF-15, câu chữ lấy từ chính `CalcWarning`.
- **`ExplanationAccordion`** — `<details>/<summary>` gốc: gập/mở được cả khi JS chưa tải.
- **`VariableTable`** — ba cột `BIẾN | ĐƠN VỊ | MÔ TẢ` sinh từ `variablesForLevel()`.
- **`ExampleBlock`** · **`SourceBlock`** · **`FlowChainStrip`** · **`StatTile`**.

#### Khác

- **`src/application/index.ts`** — mở cửa 4 nhóm mới: format, input-state, linked-input,
  flow-chain.
- **`src/application/i18n/vi.ts`** — thêm 34 key nhóm `input.*`, `result.*`, `explain.*`,
  `variable.*`, `example.*`, `source.*`, `flow.*`, `stat.*`.
- **`src/app/thu-nghiem/`** (mới, **TẠM**) — màn thử để nhìn component chạy thật, xem mục dưới.

### Trả nợ đợt 3 — màn thử `/thu-nghiem/`

Đợt 3 để lại đúng cái nợ này: FormulaCard qua typecheck và lint nhưng **chưa ai thấy nó chạy**,
vì `FORMULAS` còn rỗng tới nhánh 5. Nếu không làm gì thì đợt 5 lặp lại y hệt, mà lần này là 17
component chứ không phải một.

Cách xử: `src/app/thu-nghiem/` dựng tay một `FormulaSpec` P/E theo đúng ví dụ WF-03 rồi render
toàn bộ 17 component ở mọi trạng thái. Đặt `robots: noindex`, không có trong `sitemap.xml`.
**Xoá cả thư mục khi gói 3.2.1 dựng màn WF-03 thật.**

### Ba lỗi phát hiện khi chạy thật — đợt 5

1. **Nút nhỏ hụt vùng chạm.** `Button.module.css` có comment "Nút nhỏ vẫn giữ vùng chạm 44px
   bằng đệm dọc trong suốt" nhưng CSS chỉ đặt `min-height: 36px` — comment hứa một đằng, code
   làm một nẻo từ gói 1.2.1. Lộ ra khi đo nút Ghi đè/Hoàn tác. Sửa bằng lớp phủ `::after` có
   **chiều cao cố định** `var(--tap-min)`: thử `inset: -4px` trước thì chỉ ra 42px, vì chiều cao
   thật của nút xê dịch theo font (đo được 34–36px) nên nới tương đối không đủ.
2. **Link "Mở công thức nguồn" chỉ cao 16px** — code mới của LinkedInput. Sửa bằng
   `inline-flex` + `min-height: var(--tap-min)`, không nới đệm để khỏi đội chiều cao cả hàng.
3. **Test link thượng nguồn kiểm sai chỗ.** `<Link>` của Next bỏ dấu `/` cuối khi chạy trong
   jsdom vì test không nạp `next.config.mjs`. Đây là khác biệt môi trường, không phải lỗi sản
   phẩm — đã đổi phép kiểm sang `toContain` và ghi rõ `routes.test.ts` mới là chỗ canh luật này.

### Ba lỗi trong chính bộ kiểm, phải sửa mới tin được kết quả

Đáng ghi lại vì suýt nữa báo đạt oan:

1. **Đo vùng chạm bỏ sót gần cả trang.** `elementFromPoint` trả `null` cho toạ độ ngoài khung
   nhìn, nên mọi phần tử dưới nếp gấp bị bỏ qua **im lặng** và tính là đạt. Phải
   `scrollIntoView` từng phần tử trước khi đo. Sau khi sửa: đo đủ 26/26 thay vì 9.
2. **Điều kiện trúng quá dễ dãi.** Ban đầu tính cả trường hợp điểm rơi vào phần tử **cha** là
   trúng — bấm vào header đâu có kích hoạt link bên trong. Bỏ `hit.contains(el)`.
3. **Kiểm vòng focus soi nhầm phần tử.** Primitive `Input` cố ý bỏ `outline` của chính `<input>`
   và vẽ vòng focus ở `.control` bao ngoài bằng `:focus-within`, nên phải soi cả tổ tiên.

Và một bẫy môi trường: chạy `npm run build` trong khi dev server đang mở sẽ ghi đè `.next` làm
dev server mất chunk, CSS 404 và **mọi số đo thành vô nghĩa** (đo được `min-height: 0px`).
Từ nay kiểm giao diện thì kiểm trên bản build tĩnh qua `npm run preview` — đó cũng đúng là thứ
đem deploy.

### Kết quả kiểm tra — đợt 5

```text
npm run check  ✔ 345 test / 19 file (tăng 155 so với đợt 4), lint và typecheck sạch
npm run build  ✔ 9 trang; /thu-nghiem 124 kB, các trang sản phẩm giữ nguyên 104–117 kB
               (ngưỡng NFR-PER-04 là 200 kB)
sitemap.xml    ✔ vẫn đúng 4 trang sản phẩm, không lọt màn thử
```

Chạy thật trên Chrome ở viewport 360×780, lái qua CDP, kiểm trên **bản build tĩnh**:

```text
DAT  Không tràn ngang ở 360px — scrollWidth 360 / viewport 360
DAT  Ô nhận tự động có nhãn ↳ CAPM
DAT  Ô ngoài miền có nhãn ! min 0
DAT  Ô khoá có nhãn chữ "nâng cao"
DAT  Không lọt NaN / Infinity / undefined ra màn (FR-06)
DAT  Sáu khối lỗi WF-15 đều hiện "— , —"
DAT  Bấm Ghi đè thì hiện nhãn "đã ghi đè" và nút Hoàn tác
DAT  Bấm Hoàn tác thì giá trị về 14,3 của CAPM
DAT  Bấm Tab qua 8 phần tử đều có vòng focus
DAT  Thanh trượt đổi giá trị và hiện ra chữ
DAT  Không có lỗi JS ghi lại
HONG Vùng chạm ≥ 44px — còn 2 phần tử, đều có sẵn từ đợt 2 (xem việc còn lại)
```

Chụp màn hình ở chế độ **xám hoàn toàn** để kiểm không phụ thuộc màu (NFR-USA-06): ô nhận tự
động thấy rõ viền đứt + `↳ CAPM`; ô khoá thấy viền đứt + nền chìm + chữ "nâng cao"; ô ngoài
miền phân biệt bằng dòng `! min 0`.

### Việc còn lại — đợt 5

1. **Hai phần tử hụt vùng chạm, có sẵn từ đợt 2** — không sửa vì nằm ngoài phạm vi 2.3/2.4:

   - `AppShell.module.css` `.skipLink` cao 36px — link "Bỏ qua điều hướng", chỉ hiện khi focus;
   - `AppHeader.module.css` `.brand` cao 26px — link tên thương hiệu.

   Cả hai vi phạm NFR-USA-01. Sửa mỗi chỗ một dòng `min-height: var(--tap-min)`, gộp vào một
   gói `fix` riêng thì gọn hơn là trộn vào đợt này.

2. **Gói 2.4.3 FormulaLatex đang hoãn** — chủ dự án chốt chưa thêm KaTeX (~270 kB kể cả CSS và
   font). Hệ quả: màn WF-03 chưa đủ 9 khối, khối "Công thức" còn trống. Phải quyết lại trước
   khi làm gói 3.2.1.
3. **`favicon.ico` 404** trên mọi trang — dự án chưa có favicon. Trình duyệt nào cũng tự xin
   file này nên không phải lỗi, nhưng nên thêm cho sạch log.
4. **Chưa kiểm trên thiết bị thật.** Vẫn là Chrome headless. Ba thứ máy tính không mô phỏng
   đúng: vùng an toàn tai thỏ, `100dvh` khi thanh địa chỉ co giãn, và cảm giác kéo thanh trượt
   bằng ngón cái. Thuộc gói 7.1.3.
5. **Câu chữ 6 loại lỗi trong `warnings.ts` chưa chỉnh theo nguyên văn WF-15.** Kế hoạch có nêu
   là việc tuỳ chọn và tôi chưa làm để khỏi trộn thay đổi nội dung vào đợt code. Ví dụ WF-15
   ghi "Chưa tính được P/E vì EPS bằng 0. **Doanh nghiệp không có lợi nhuận trên mỗi cổ phiếu
   ở kỳ này.**" còn code mới có vế đầu. Sửa thì phải cập nhật `calc-output.test.ts` và
   `warnings.test.ts` vì hai file này assert nguyên văn.

---

## Đợt 4 — Đổi bảng màu sang cam đất

Trạng thái: **đang chờ xác nhận**. Không thuộc gói WBS nào — chủ dự án yêu cầu đổi màu.
Không đổi một dòng logic nào, chỉ đổi giá trị token.

### Vì sao làm được chỉ bằng một file

Gói 1.2.1 đã chốt token là điểm đổi duy nhất và `src/ui/tokens.test.ts` chặn màu viết thẳng lọt
vào CSS Module. Nhờ đó đổi cả bảng màu là sửa `globals.css`, không phải đi lùng từng component —
đúng thứ đã dựng sẵn để chờ bản Figma.

### Đã đổi file nào — đợt 4

- **`src/app/globals.css`** — thay toàn bộ token màu sang bảng "cam đất" (terracotta):
  - nhấn `--color-accent: #ab4610`, hover `#8a380b`, nền chip `#fce9db`;
  - giấy `--color-paper: #f7f2ec` ngả kem, chữ `--color-ink: #2e2a25` ngả nâu, kẻ `#dbd1c4`;
  - `--color-danger` đẩy từ `#a3282d` sang `#a3202f` — đỏ thẫm hơn để không lẫn với cam nhấn.
    Đây là app báo lỗi liên tục (sáu mã cảnh báo WF-15) nên cam và đỏ phải tách bạch;
  - `--color-warning-soft` đậm lên `#f4e9c8`. Nền giấy nay đã ngả kem nên dải miễn trừ FR-24 gần
    như hoà vào trang — đo được 1,05:1. Đậm lên còn 1,09:1, chữ cảnh báo vẫn đạt 4,99:1.
    (Bảng cũ thật ra còn tệ hơn: 1,02:1.)
  - `--focus-ring` và `--shadow-*` đổi theo cho khớp sắc;
  - thêm **`--color-accent-vivid: #e2620d`** — cam rực. Màu này chỉ đạt 3,4:1 trên nền trắng nên
    **không được làm màu chữ**; nó tồn tại để làm mảng màu: vạch chỉ báo, dấu hiệu thương hiệu,
    đường biểu đồ sau này.
- **`src/ui/navigation/BottomTabBar.module.css`** — vạch chỉ báo tab đang chọn đổi sang
  `--color-accent-vivid` và dày lên 3px. Chữ vẫn giữ `--color-accent` để đạt 4,5:1.
- **`src/ui/tokens.test.ts`** — thêm hàng rào chặn gán `--color-accent-vivid` vào thuộc tính
  `color`. Regex bỏ qua `background-color`/`border-color` nhưng vẫn bắt `-webkit-text-fill-color`;
  đã kiểm tay đủ 8 trường hợp đúng/sai trước khi đưa vào.
- **`src/ui/contrast.test.ts`** — thêm `--color-accent-vivid` vào danh sách token bắt buộc và
  kiểm nó đạt ngưỡng 3:1 của mảng màu trên cả hai nền.

### Kiểm chứng — đợt 4

- `npm run check` xanh: **190 test / 11 file** (tăng 3 test so với đợt 3). `npm run build` xanh,
  `/cong-thuc` vẫn 114 kB First Load.
- Ba bảng cam ứng viên đều được tính trước bằng công thức WCAG rồi mới chọn; bảng đã chọn có cặp
  sát ngưỡng nhất là 4,93:1 trên mức cần 4,5:1.
- Chạy trình duyệt thật ở 390px: không tràn ngang ở cả ba màn; bản build đúng là đang dùng bảng
  cam; tab đang chọn có chữ `rgb(171,70,16)` và vạch `rgb(226,98,13)`.
- Bấm Tab thật qua 6 phần tử đầu trang: cả 6 đều có vòng focus cam đặc 3px (NFR-USA-06).
  Lưu ý cho lần sau: `el.focus()` bằng JS **không** kích hoạt `:focus-visible`, phải gửi phím Tab
  qua CDP mới kiểm được vòng focus.

### Còn lại — đợt 4

- Ba bảng cam khác nhau khá tinh tế trên các màn hiện tại vì app chưa có nhiều bề mặt màu.
  Khi nhánh 3 dựng xong ResultBlock và biểu đồ thì nên nhìn lại một lượt.
- `--color-accent-vivid` mới chỉ dùng ở một chỗ (vạch tab). Chỗ dùng thật của nó là đường biểu đồ
  ở gói 3.3, chưa có gì để kiểm.

---

## Đợt 3 — WBS 2.2 (tìm kiếm & duyệt)

Trạng thái: **đang chờ xác nhận**. `npm run check` và `npm run build` xanh; 10/10 kiểm tra
tương tác trên trình duyệt thật đều đạt.

### Đã đổi file nào — đợt 3

#### Logic ở tầng Domain

- **`src/core/registry/search.ts`** (mới) — toàn bộ phần khó của FR-19 nằm ở đây, thuần TypeScript
  nên test được bằng Node và tái dùng được cho cả màn danh sách lẫn bố cục desktop:
  - `normalizeVi()` bỏ dấu tiếng Việt. NFD tách được dấu thanh, riêng chữ `đ` phải đổi tay vì
    NFD không tách chữ này.
  - `tokenize()` coi mọi ký tự không phải chữ số là dấu ngăn — nhờ đó `"p e"` và `"P/E"` ra cùng
    một bộ từ, đúng ca mà bảng WBS nêu đích danh.
  - `scoreFormula()` chấm điểm theo trường (id > tên Việt > tên Anh > từ khoá > mô tả), khớp theo
    tiền tố để gõ dở chừng đã có gợi ý. **Thiếu một từ khoá là loại** — người tìm "dinh gia dcf"
    không muốn thấy mọi công thức định giá.
  - `selectFormulas()` gộp lọc mảng → lọc nhóm → tìm → sắp xếp.
  - `countByCategoryFor()` / `countBySegmentFor()` cho số đếm trên chip và trong danh sách chọn.
- **`src/core/registry/types.ts`** — thêm `FormulaQuery`, `ListSort`, `SegmentFilter`. Đặt ở
  Domain để logic lọc test được bằng Node; `ListParams` của tầng Application nay chỉ là bí danh
  của `FormulaQuery`, hết cảnh hai nơi định nghĩa cùng một union rồi lệch nhau.
- **`src/core/registry/search.test.ts`** (mới) — 29 ca, gồm cả ca "gõ p e ra P/E" và ca kiểm
  tính xác định của thứ tự kết quả (NFR-REL-03).

#### Component

- **`src/ui/browse/SearchBox.tsx`** — không tự giữ state, giá trị đi thẳng lên URL để link chia
  sẻ được và nút Lùi chạy đúng. Nút xoá có nhãn cho trình đọc màn hình và đủ vùng chạm 44px.
- **`src/ui/browse/CategoryFilter.tsx`** — ba chip mảng kèm số đếm, danh sách chọn 12 nhóm kèm
  số đếm, danh sách chọn cách sắp xếp, nút Xoá bộ lọc. Đổi mảng thì tự bỏ nhóm đang chọn vì nhóm
  cũ có thể không thuộc mảng mới. Dùng `<select>` gốc của hệ điều hành — trên điện thoại nó mở
  bánh xe chọn quen thuộc và không tốn thêm dung lượng gói; primitive `SelectInput` để gói 2.3.3.
- **`src/ui/browse/FormulaCard.tsx`** — cả thẻ là một `<a>` thật chứ không phải `div` bắt sự kiện:
  bấm được, mở tab mới được, điều hướng được cả khi JS chưa tải xong.
- **`src/ui/browse/EmptyState.tsx`** — WF-09 trạng thái B: khi không có kết quả thì nói rõ phạm vi
  sản phẩm (không có tiền mã hoá) và chỉ lối đi tiếp, không để màn trắng.
- **`src/app/cong-thuc/FormulaBrowser.tsx`** (mới) — tách khỏi `page.tsx` vì cần `<Suspense>` bao
  ngoài: bên trong có `useSearchParams()`.

#### Hai lỗi phát hiện khi chạy thật, đã sửa

1. **Gõ "dinh gia" ra "dinhgia".** `parseListParams()` trim chuỗi tìm kiếm, mà URL là nguồn sự
   thật của ô nhập — nên vừa gõ dấu cách là nó bị nuốt ngay, không gõ được từ thứ hai. Bỏ trim
   khi đọc và chỉ bỏ qua chuỗi toàn khoảng trắng khi ghi. Đã thêm test giữ ca này.
2. **Hai nút "×" chồng nhau** trong ô tìm kiếm — nút xoá mặc định của Chrome cho
   `input[type="search"]` nằm cạnh nút của mình. Ẩn nút mặc định bằng
   `::-webkit-search-cancel-button`.

### Kết quả kiểm tra — đợt 3

```text
npm run check  ✔ 187 test / 11 file, lint và typecheck sạch
npm run build  ✔ /cong-thuc 114 kB First Load (ngưỡng NFR-PER-04 là 200 kB)
```

Chạy thật trên Chrome ở viewport 360×780, 10/10 đạt:

```text
DAT  SearchBox + 3 chip mảng + 2 danh sách chọn có mặt
DAT  Registry rỗng thì hiện đúng trạng thái rỗng (WF-09)
DAT  Gõ tìm kiếm thì URL phản ánh ngay — ?q=dinh+gia
DAT  Ô nhập không rớt ký tự khi trạng thái đi qua URL
DAT  Bấm chip Chứng khoán thì URL và aria-pressed cùng đổi
DAT  Chọn mảng Chứng khoán thì danh sách nhóm rút còn 7 nhóm + mục Tất cả
DAT  Xoá bộ lọc thì URL sạch và ô tìm kiếm trống
DAT  Mở link có sẵn bộ lọc thì khôi phục đủ ba thứ (q, mảng, sắp xếp)
DAT  Tham số rác thì rơi về mặc định, màn vẫn mở được
DAT  Không tràn ngang ở 360px
```

### Việc còn lại — đợt 3

1. **FormulaCard chưa có bằng chứng hiển thị.** Registry còn rỗng nên không thẻ nào được vẽ ra;
   component đã qua typecheck và lint nhưng chưa ai nhìn thấy nó chạy. Kiểm cùng lúc với công
   thức đầu tiên ở nhánh 5.
2. **Trạng thái "không tìm thấy" chưa chạm tới được.** Registry rỗng nên luôn rơi vào nhánh
   "chưa có công thức nào"; câu chữ WF-09 trạng thái B đã viết sẵn, chờ có dữ liệu để kiểm.
3. **Chưa chống dội phím khi gõ.** Mỗi ký tự gõ là một lần ghi URL và tính lại danh sách. Với
   Registry rỗng thì không thấy gì, nhưng khi có đủ 107 công thức thì phải đo lại theo
   NFR-PER-02 (dưới 100 ms) và có thể phải chống dội — để cùng gói 3.1.2 khi làm ảo hoá danh sách.

---

## Đợt 2 — WBS 1.4 + 2.1 (khung ứng dụng & điều hướng)

Trạng thái: **đang chờ xác nhận**. `npm run check` và `npm run build` xanh, mọi route trả 200
trên dev server.

### Đã đổi file nào — đợt 2

#### Bước 0 — nâng Next lên bản vá bảo mật

`package.json` — `next` và `eslint-config-next` từ `15.1.6` lên `15.5.22` (bản 15.x mới nhất),
vá CVE-2025-66478. Cùng major nên không có thay đổi phá vỡ; `check` và `build` chạy lại đều xanh,
gói JS còn giảm từ 107 kB xuống 104 kB.

#### 1.4.1 — Routing, URL state & khung i18n

- **`src/application/routes.ts`** + test (mới) — nguồn duy nhất của đường dẫn: `ROUTES`,
  `formulaPath()`, `NAV_ITEMS` (4 mục WF-18), `activeRouteKey()` xác định mục đang chọn.
  Slug tiếng Việt vì đường dẫn là phần Google đọc (FR-25).
- **`src/application/url-state.ts`** + test (mới) — `parseListParams()` / `serializeListParams()`.
  Thuần, không import React, nên test được bằng Node. Giá trị mặc định bị bỏ khỏi URL để link
  chia sẻ ngắn; giá trị lạ bị bỏ qua chứ không làm hỏng màn (FR-19).
- **`src/application/use-list-params.ts`** (mới) — hook bọc `useSearchParams` + `useRouter`.
- **`src/application/i18n/`** (mới) — `vi.ts`, `en.ts` (cố ý rỗng), `index.ts` với `t()` và
  `missingKeys()`. Không thêm thư viện i18n. Thiếu bản dịch thì rơi về tiếng Việt, không hiện
  key trần ra màn hình.
- **`src/application/preferences.ts`** + test (mới) — phần thuần: `readPreferences()` chịu được
  JSON hỏng, thiếu trường, giá trị lạ, biểu phí đã bị gỡ. Một ô rác không làm mất cả bộ.
- **`src/application/preferences-context.tsx`** (mới) — Provider đọc localStorage **trong
  `useEffect`**, không đọc lúc khởi tạo state, nếu không sẽ lệch hydration với HTML tĩnh.
  Gọi `usePreferences()` ngoài Provider thì trả mặc định thay vì ném lỗi.
- **`src/application/use-online-status.ts`** (mới) — `navigator.onLine` + sự kiện online/offline.
- **`src/app/cong-thuc/`, `danh-muc/`, `cai-dat/`** (mới) — ba màn khung, gói nhánh 3 thay nội dung.
- **`src/app/sitemap.ts`** (mới) — sinh `sitemap.xml` từ Registry (FR-25). Cần
  `export const dynamic = 'force-static'`, không có thì `output: 'export'` từ chối build.
- **`src/application/index.ts`** — mở cửa cho i18n, routes, url-state, preferences.
  Phần React tách ra đường dẫn riêng để `sitemap.ts` không phải kéo theo React context.

#### 1.4.2 — AppShell

- **`src/ui/layout/AppShell.tsx`** + module.css (mới) — cột dọc cao đúng màn hình, `100dvh`,
  vùng an toàn `env(safe-area-inset-*)`, link "Bỏ qua điều hướng" cho bàn phím.
  Thứ tự dọc cố định: thanh trên → banner ngoại tuyến → dải miễn trừ → nội dung → thanh nav dưới.
- **`src/app/layout.tsx`** — bọc `PreferencesProvider` + `AppShell`; thêm `metadata.title.template`
  để mỗi công thức có tiêu đề riêng (FR-25); `viewport` không đặt `maximum-scale` để người dùng
  phóng to được (NFR-USA-06).
- **`src/app/globals.css`** — bỏ luật `main { … }`, bố cục nội dung nay do AppShell giữ;
  thêm token `--header-height`, `--tabbar-height`.

#### 2.1 — Khung điều hướng

- **`src/ui/navigation/AppHeader.tsx`** — dính trên; ở màn hẹp rút gọn tên thương hiệu thay vì
  để nút tràn ra ngoài.
- **`src/ui/navigation/OfflineBanner.tsx`** — chỉ hiện khi mất mạng, `role="status"` +
  `aria-live="polite"`. Mất mạng không phải lỗi: sản phẩm chạy offline được (FR-23).
- **`src/ui/navigation/ModeToggle.tsx`** — Cơ bản / Nâng cao, ghi qua `usePreferences()` nên nhớ
  sau khi tải lại (FR-09, SW-02).
- **`src/ui/navigation/LangSwitch.tsx`** — nút EN đang khoá vì FR-21 xếp ở v1.0; để sẵn chỗ.
- **`src/ui/navigation/BottomTabBar.tsx`** + **`TabIcon.tsx`** — 4 mục, dùng `<Link>` chứ không
  `router.push` để bản tĩnh điều hướng được khi JS chưa tải xong. Icon vẽ tay bằng SVG, không
  thêm thư viện.
- **`src/ui/navigation/DisclaimerBar.tsx`** — đặt trong AppShell chứ không ở từng màn, để FR-24
  và UI-04 không phụ thuộc việc người viết màn có nhớ thêm hay không.

Mọi trạng thái "đang chọn" đều báo bằng **ba** dấu hiệu: màu, độ đậm, và vạch chỉ báo hoặc
`aria-pressed`/`aria-current` — không để màu là dấu hiệu duy nhất (NFR-USA-06).

#### Chốt token là điểm đổi duy nhất khi Figma về

- **`src/ui/tokens.test.ts`** (mới) — quét mọi `*.module.css`, báo lỗi nếu có mã màu viết thẳng
  thay vì `var(--color-…)`. Nhờ vậy khi Figma về thì đổi bảng màu là sửa một file.

#### Tài liệu

- **`README.md`** — cập nhật trạng thái, bổ sung `NEXT_PUBLIC_SITE_URL` vào phần deploy, và thêm
  bảng "cùng cách nghĩ đó, áp cho những chỗ khác" liệt kê từng bất biến kèm chỗ test canh nó.

#### Ba lỗi phát hiện khi chạy thật, đã sửa

Chỉ lộ ra khi mở app ở đúng 360px, không có bài test nào bắt được:

1. **Trang chủ tràn ngang.** Bảng biểu phí kéo cả lưới rộng hơn màn hình, thẻ và chip bị cắt ở
   mép phải — vi phạm NFR-USA-02. Nguyên nhân: item của lưới/flex có kích thước tối thiểu mặc
   định là `min-content`, nên bảng rộng đẩy phình cả track. Sửa bằng `min-width: 0` ở
   `Card.module.css`, `AppShell.module.css` và `max-width: 100%` ở `Table.module.css`.
2. **Thanh điều hướng dưới không dính đáy ở trang dài.** `overflow-x: hidden` trên `body` biến
   body thành vùng cuộn và làm hỏng `position: sticky`. Đổi sang `overflow-x: clip` —
   vẫn chặn tràn ngang nhưng không tạo vùng cuộn.
3. **Dòng bảng cao bất thường ở 360px.** Cột "Căn cứ" xuống dòng dù đang nằm ngoài tầm nhìn,
   kéo chiều cao dòng lên gấp ba. Bỏ `whiteSpace: normal` để cột dài cuộn ngang trong khung
   thay vì đội dòng lên.

Kèm một sửa thẩm mỹ: gạch chân của nút VI bám theo bo góc của vùng chạm 44px nên trông như một
khung lạc — đổi sang nền nhạt cho đồng bộ với Chip và ModeToggle.

### Kết quả kiểm tra

```text
npm run lint       ✔ không lỗi (có cảnh báo `next lint` sắp bị bỏ ở Next 16 — xem việc còn lại)
npm run typecheck  ✔ không lỗi
npm test           ✔ 151 test / 10 file
npm run build      ✔ 4 trang + sitemap.xml, First Load JS 104 kB (ngưỡng NFR-PER-04 là 200 kB)
dev server         ✔ / · /cong-thuc/ · /danh-muc/ · /cai-dat/ · /sitemap.xml đều 200, đường lạ 404
HTML tĩnh          ✔ dải miễn trừ nằm trước <main>, chỉ một <main>, có link bỏ qua điều hướng
```

Chạy thật trên Chrome ở viewport 360×780 (lái qua DevTools Protocol), 9/9 đạt:

```text
DAT  Không tràn ngang ở 360px — scrollWidth 360 / viewport 360
DAT  Dải miễn trừ trong tầm nhìn đầu tiên — mép dưới ở 112px
DAT  Vùng chạm thanh tab ≥ 44px — chiều cao: 60, 60, 60, 60
DAT  Bấm Nâng cao thì ghi vào localStorage — {"mode":"advanced","locale":"vi",…}
DAT  Tải lại vẫn giữ chế độ Nâng cao — aria-pressed=true
DAT  Bấm tab Công thức thì đổi trang và tô đúng mục
DAT  Mất mạng thì hiện banner ngoại tuyến
DAT  Có mạng lại thì banner tự ẩn
DAT  Không có lỗi JS ghi lại
```

### Việc còn lại

1. **Route động `/cong-thuc/[id]/` chưa dựng được.** Đã viết xong rồi phải gỡ ra: với
   `output: 'export'`, Next từ chối build một route động mà `generateStaticParams()` trả về mảng
   rỗng — báo `Page "/cong-thuc/[id]" is missing "generateStaticParams()"`. Registry hiện chưa có
   công thức nào nên không có tham số nào để sinh. **Thêm lại cùng lúc với công thức đầu tiên ở
   nhánh 5.** Phần còn lại của FR-25 đã sẵn sàng: `formulaPath()` trong `routes.ts` và `sitemap.ts`
   đều đã đọc từ Registry, thêm công thức là tự có URL.
2. **Kiểm trên thiết bị thật.** Đã chạy và kiểm bằng Chrome headless ở viewport 360×780 (kết quả
   ở trên), nhưng vẫn nên mở trên một máy Android và một máy iOS thật: vùng an toàn tai thỏ,
   `100dvh` khi thanh địa chỉ trình duyệt co giãn, và cảm giác chạm của thanh trượt — ba thứ
   trình duyệt máy tính không mô phỏng đúng. Cũng chưa kiểm điều hướng bằng bàn phím và trình
   đọc màn hình; phần đó thuộc gói 7.1.3.
3. **Số liệu thuế & phí** trong `src/core/market/schedules.ts` vẫn là bản thảo — cần người đối
   chiếu văn bản gốc và chốt mức phí môi giới mặc định (gói WBS 5.1.1). Chưa xong thì chưa phát
   hành v0.1.
4. **Wireframe gốc** — nhánh 2 từ gói 2.3 trở đi cần đúng chi tiết WF-15 (6 loại lỗi kèm câu chữ),
   WF-16 (5 trạng thái ô số), WF-03 (9 khối). File HTML trên Drive là bundle base64 không đọc được.
5. **Đồng bộ SRS và bảng Estimate về Next.js** — hai tài liệu vẫn ghi toolchain Vite + React.

### Ghi nhận baseline (không thuộc phạm vi)

- `next lint` bị đánh dấu deprecated ở 15.5 và sẽ bị bỏ ở Next 16. Khi nào nâng lên 16 thì phải
  chuyển sang ESLint CLI với flat config — một gói `chore` riêng, chưa cần bây giờ.
- `npm audit` còn 6 cảnh báo, đều là phụ thuộc gián tiếp (`postcss`, `sharp` qua `next`; `yaml`
  qua `lint-staged`; `vitest`). Sửa hết đòi nâng major nên chưa động, cần bạn duyệt.
- `prettier --check .` báo `CLAUDE.md` sai định dạng từ trước. Chưa động vào để khỏi lẫn diff.

---

## Đợt 1 — WBS 1.1 → 1.3.3 (nền tảng kỹ thuật)

Trạng thái: **xong**, trừ số liệu thuế & phí còn chờ đối chiếu.

### Đã đổi file nào — đợt 1

#### 1.3.3 — CalcOutput & hệ cảnh báo

- **`src/core/warnings.ts`** (mới) — catalog sáu mã cảnh báo của WF-15, mỗi mã một hàm dựng
  thông điệp tiếng Việt kèm gợi ý sửa (NFR-USA-04). Công thức không tự chế câu chữ nữa, để cả
  107 công thức nói cùng một giọng và đội nội dung sửa một chỗ.
- **`src/core/calc-output.ts`** — `ok()` và `inherited()` lấy thông điệp từ catalog thay vì
  chuỗi viết thẳng. Thêm `snapToStep()` cho thanh trượt (gói 2.3.2 sẽ dùng). `clampToSpec()` gặp
  giá trị không phải số thì rơi về `defaultValue` của biến thay vì `min ?? 0` — đúng ý hơn.
- **`src/core/types.ts`** — `VariableSpec` bổ sung `type`, `defaultValue`, `options` theo LDR-01
  và LDR-02; `MarketConstant` bổ sung `label` (bảng bóc tách WF-08 cần) và `note`.
- **`src/core/warnings.test.ts`** (mới), **`src/core/calc-output.test.ts`** — cập nhật fixture theo
  `VariableSpec` mới, thêm ca cho `snapToStep` và cho gợi ý sửa hai lối đi của cảnh báo kế thừa.

#### 1.3.1 — FormulaRegistry

- **`src/core/registry/types.ts`** (mới) — `FormulaSpec` đủ trường LDR-01 + LDR-02: bốn mục
  `explanation` (FR-03), `source` (FR-04), `level` (FR-09), `isFeatured` (FR-20), `tags` (FR-19),
  `tests` (NFR-MNT-02), `dependsOn` là cạnh đồ thị phụ thuộc cho gói 5.3.1 (FR-15).
- **`src/core/registry/categories.ts`** (mới) — 12 nhóm, `expectedCount` lấy đúng bảng SRS 3.8.
- **`src/core/registry/validate.ts`** (mới) — validator không ném lỗi, trả `RegistryIssue[]` chia
  `error` / `warning`. Bắt: nhóm lạ, trùng id, id sai định dạng URL, thiếu mục diễn giải, thiếu
  nguồn, thiếu ca kiểm thử, biến sai miền, thiếu options, cạnh phụ thuộc trỏ sai.
- **`src/core/registry/build.ts`** (mới) — `createRegistry()` dựng chỉ mục + soát;
  `assertRegistryValid()` chặn cứng khi có lỗi; `serializeRegistry()` sinh JSON;
  `defaultInputs()` / `variablesForLevel()` / `featuredFormulas()` / `countByCategory()`.
- **`src/core/registry/index.ts`** (mới) — cửa gom; `FORMULAS` hiện rỗng, nhánh 5 đổ dần vào.
- **`src/core/registry/registry.test.ts`** (mới) — 33 ca.

**Quyết định**: nguồn dữ liệu duy nhất là module TypeScript, không phải JSON viết tay. Sai schema
bị bắt lúc typecheck, sai nội dung bị bắt lúc test; `serializeRegistry()` sinh JSON khi cần
artifact tĩnh. Vẫn đúng tinh thần CON-04, mà không phải thêm `tsx`/`ts-node` để chạy bộ sinh.

#### 1.3.2 — MarketConfig

- **`src/core/market/types.ts`** (mới) — `MarketConstantKey` là union chứ không phải string tự do,
  nên công thức gõ sai khoá là hỏng lúc typecheck. `FeeSchedule` để WF-08/WF-13 có ô chọn biểu phí.
- **`src/core/market/schedules.ts`** (mới) — biểu phí "Mặc định HOSE 2026", 7 hằng số, mỗi hằng số
  có `effectiveFrom` + `legalBasis` (LDR-03, CON-10).
- **`src/core/market/resolve.ts`** (mới) — `resolveConstant(schedule, key, asOf)` lấy bản ghi mới
  nhất còn hiệu lực; `resolveRate()` đổi phần trăm sang hệ số theo CON-05; `validateMarketConfig()`.
  `asOf` là tham số bắt buộc, Domain không tự lấy ngày hệ thống (NFR-REL-03).
- **`src/core/market/index.ts`**, **`src/core/market/market.test.ts`** (mới) — 17 ca.

#### 1.2.1 — Design token & primitive

- **`src/app/globals.css`** — mở rộng từ 6 biến lên hệ token đầy đủ: màu, thang chữ, khoảng cách,
  bo góc, đổ bóng, vòng focus, vùng chạm 44px, `@media (prefers-reduced-motion)`, `.visually-hidden`.
- **`src/ui/contrast.ts`** + **`src/ui/contrast.test.ts`** (mới) — công cụ tính tương phản WCAG 2.1.
  Test **đọc thẳng `globals.css`** rồi kiểm từng cặp màu, nên đổi màu mà tụt dưới AA là CI đỏ ngay,
  không phải chép màu sang file TS rồi để hai nơi lệch nhau (NFR-USA-06).
  Chính test này bắt được `--muted` cũ (`#8a877f`) chỉ đạt 3,0:1 trên nền giấy — đã đổi.
- **`src/ui/primitives/`** (mới) — `Button`, `Input`, `Card`, `Chip`, `Table` kèm CSS Module.
  `Table` có vùng cuộn ngang riêng theo NFR-USA-02. Trạng thái phân biệt bằng viền + nhãn chữ,
  không chỉ bằng màu.
