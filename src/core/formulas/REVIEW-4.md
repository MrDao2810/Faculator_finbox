# Lượt rà thứ tư: câu chữ của 111 công thức và chữ dùng chung (29/10/2026)

## Yêu cầu

Chủ dự án: _"kiểm tra lại toàn bộ câu từ trong dự án sau và xem những phần nào đang đang giải thích không rõ ràng,
gây hiểu lầm của dự án, đặc biệt là phần công thức"_.

Lượt này **chỉ rà, chưa sửa gì**. Mọi đề xuất bên dưới chờ chủ dự án duyệt.

## Đã sửa trong lượt này (29/10/2026, sau khi chủ dự án giao "tự sửa sao cho chuẩn nhất")

Chủ dự án: _"bạn tự sửa sao cho chuẩn nhất vì có những phần tôi thấy chưa chắc đã chuẩn nhất"_. Đã sửa **toàn bộ 30 mục Cao**
và các nhóm N1, N2, N4, N7; mỗi đợt chạy đủ `vitest` (203 file, 5.050 ca), `tsc`, `eslint`, `prettier`.

| Mục                                                                                    | Đã làm                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L09-01, L07-01, L07-02, L06-01, L02-01, L03-02, L10-01, L10-02, L08-03, L08-04, L04-01 | Sửa chữ như hướng sửa ở bảng Cao; câu về độ lệch bán phần dùng số 1,51% đã tính lại từ chuỗi FPT                                                                                                               |
| L01-06                                                                                 | **Sửa code**: `matched()` trong `src/data/preset-inputs.ts` cho WACC lấy `marketCap` vào ô E, không lùi về sổ sách; ca kiểm đổi theo                                                                           |
| L01-05                                                                                 | Nhãn ô E thành "Vốn hoá thị trường (E)", dòng chữ "Vốn hoá ÷ Tổng vốn", biểu đồ tròn "Cơ cấu vốn theo giá thị trường", bốn chỗ kéo theo (how-to, "Đọc biểu đồ", nhãn thanh)                                    |
| L01-07, 08, 09                                                                         | FCFF cả năm 12 tháng, ΔNWC tính từ bảng cân đối và dặn đổi dấu, lãi vay lấy dòng "Trong đó: chi phí lãi vay"                                                                                                   |
| L08-01                                                                                 | IRR niên kim: ô, ký hiệu, hướng dẫn nói cả hai phía (vốn bỏ ra hoặc tiền vay nhận về)                                                                                                                          |
| N1                                                                                     | Cổ tức: 6 mô tả ô và 6 câu hướng dẫn nói "bằng đồng, cộng mọi đợt, 15% mệnh giá là 1.500 ₫"                                                                                                                    |
| N2                                                                                     | Thang %: 15 ký hiệu thêm "dạng thập phân, tức 1% là 0,01"                                                                                                                                                      |
| N4                                                                                     | Bỏ "chọn kỳ khác" ở 8 câu cảnh báo (P/E, P/S, EV/EBITDA, EV/Sales, ROS, hệ số chi trả, hệ số biến thiên x2) và khuôn `divideByZero()`                                                                          |
| N7                                                                                     | Các câu "Nhận tự động": 9 câu nói rõ chỉ ở Nâng cao hoặc không tự điền                                                                                                                                         |
| L11-01..04                                                                             | `noTickerNote` tách thêm `preset.noTickerXirr`; `detail.presetNoData(+Fix)`; `missingSeries()` và chip "Thiếu chuỗi giá"; `inheritedFrom()` chỉ lấy tên trước gạch, trỏ tới thẻ bước, chip "Lỗi từ bước trước" |
| L11-06, L11-10                                                                         | Nút "Nạp ví dụ minh hoạ", mục "Nhóm công thức nổi bật"; `chrome-check.mjs` đổi theo                                                                                                                            |
| L02-04                                                                                 | Cảnh báo giá mục tiêu khi EPS ≤ 0 dẫn sang NCAV hoặc P/B                                                                                                                                                       |

Ba ca kiểm cũ ghim đúng câu đã đổi nên được sửa theo (`run-chain.test.ts`, `charts.test.tsx`, `noi-dung.test.ts` hai danh sách
ghim). Các mục dưới đây **chưa** sửa; làm ở các lượt sau.

### Chưa sửa

- Nhóm N3, N5, N6 đã sửa ngày 30/10/2026 (xem mục "Đã sửa"); còn lại: Vừa và Thấp theo lô.
- Toàn bộ mục Vừa và Thấp còn lại trong các bảng bên dưới, trừ L02-04, L11-06, L11-10.
- `L11-12` (chữ "Market Config") cố ý để nguyên: `screens.test.tsx` ghim chữ ấy và comment `vi.ts` ghi `fee.scheduleNote` "KHÔNG đổi".
- L07-13 (đổi tên "Biên độ dao động lớn nhất"), L10-04 (đưa ô số lần nhập lãi lên Cơ bản), L05-09 (nguồn Hull): cần chủ dự án quyết,
  chưa đụng.

## Cách làm

Mười một agent chỉ đọc, mỗi agent một lô:

| Lô  | Phạm vi                                                                              |
| --- | ------------------------------------------------------------------------------------ |
| L01 | `valuation-dcf.ts` (10 công thức)                                                    |
| L02 | `multiples.ts` + `valuation-multiples.ts` (12)                                       |
| L03 | `fundamentals.ts` + `corporate.ts` (13)                                              |
| L04 | `technical-trend.ts` (9)                                                             |
| L05 | `technical-volatility.ts` (9)                                                        |
| L06 | `risk-ratios.ts` + `risk.ts` (8)                                                     |
| L07 | `risk-volatility.ts` + `risk-drawdown.ts` (10)                                       |
| L08 | `returns.ts` + `performance.ts` (14)                                                 |
| L09 | `fees.ts` + `derivatives.ts` (15)                                                    |
| L10 | `personal.ts` + `planning.ts` (11)                                                   |
| L11 | `src/application/i18n/vi.ts` / `en.ts`, `src/core/warnings.ts`, `formulas/shared.ts` |

Mỗi lô đọc: tên, mô tả, dòng chữ dưới hình, bảng ký hiệu, mô tả ô, bốn mục diễn giải, ví dụ, câu cảnh báo của `calc`,
khung cách tính (`src/core/how-to/`), lời giải ví dụ (`src/core/vi-du/`) và mục ô nhập của hướng dẫn
(`src/core/huong-dan/noi-dung/items.ts`). Mọi khẳng định về số đều chạy lại bằng `runFormula` (script ở scratchpad,
không vào repo). Loại trừ những gì đã có ở `REVIEW-3.md` R1–R21, `REVIEW-2.md` Q1–Q10 và ba mục bị bác ở `REVIEW.md`.

**Không rà:** ngân hàng câu hỏi bài tập (473 câu), các đoạn "Đọc biểu đồ" (rà 13/10/2026), `docKetQua`/`deSai` của
trang hướng dẫn (chỉ ghi khi gặp).

## Kết quả chung

**Số liệu sạch.** Mọi con số trong 111 hàng "Đọc kết quả" và trong lời giải ví dụ đều khớp `calc`, trừ hai chỗ:
ghi chú ví dụ EMA (L04-07) và 185,39% của lợi suất quy năm (L08-17).

Lỗi nằm ở **cách diễn giải**: 221 phát hiện, 30 mức Cao. Phân theo kiểu:

1. **Ô nhập không nói lấy số nào** (nhiều nhất): dòng nào trên báo cáo, kỳ nào, đơn vị nào, trước hay sau thuế, phía
   người vay hay người cho vay. Người làm đúng theo chữ vẫn nhập sai, và `calc` không thể bắt được.
2. **Câu chép khuôn sang chỗ không hợp**: hướng dẫn ô của RSI chép từ SMA, lời dặn vay nằm ở công thức tiền gửi,
   "Nhận tự động" ở ô không có cạnh chuỗi.
3. **Câu tụt hậu sau một lần đổi giao diện**: nút đã đổi tên, mã không còn theo sang công thức khác, khối ví dụ hết
   sửa được.
4. **Sửa dở các lượt trước**: mục đã sửa ở "Đọc kết quả" nhưng câu cũ còn ở Ý nghĩa, mô tả ô hoặc cảnh báo.

## Nhóm sửa đồng loạt (một câu mẫu cho nhiều chỗ)

### N1. Cổ tức theo % mệnh giá, một đợt hay cả năm (Cao)

Nghị quyết cổ tức ở Việt Nam ghi tỷ lệ trên mệnh giá ("cổ tức 20%") và mỗi nghị quyết chỉ một đợt. Không ô cổ tức nào
dặn đổi ra đồng hay cộng các đợt. Gõ "20" thì kết quả nhỏ đi khoảng 100 lần; gõ một đợt thì nhỏ đi một nửa.

| Mã     | Công thức                             | Chỗ                                                               |
| ------ | ------------------------------------- | ----------------------------------------------------------------- |
| L03-01 | `ty-le-chi-tra-co-tuc`                | mô tả ô `dividendPerShare` (fundamentals.ts:1628), hướng dẫn      |
| L08-02 | `ty-suat-co-tuc`                      | mô tả ô (returns.ts:562), hướng dẫn; không nói trước/sau thuế     |
| L09-02 | `thue-co-tuc`                         | mô tả ô (fees.ts:99), hướng dẫn (items.ts:3330)                   |
| L10-03 | `thue-tncn-dau-tu`                    | mô tả ô (planning.ts:1538), hướng dẫn (items.ts:4095)             |
| L01-04 | `mo-hinh-gordon`, `ddm-hai-giai-doan` | hướng dẫn "kỳ gần nhất" (items.ts:827, 870) trái mô tả "12 tháng" |

Câu mẫu: _"Tổng cổ tức tiền mặt một cổ phiếu trong 12 tháng gần nhất, tính bằng đồng, cộng mọi đợt, trước thuế.
Doanh nghiệp thường công bố theo tỷ lệ trên mệnh giá 10.000 ₫, nên cổ tức 15% là 1.500 ₫."_ (Tránh số trùng giá trị
mặc định của ô vì gate `noi-dung.test.ts`.)

### N2. Thang %: bảng ký hiệu ghi "%" trong khi hình dùng dạng thập phân (Cao/Vừa)

REVIEW-3 đã sửa ở `lai-tien-gui`, `tiet-kiem-muc-tieu` ("dạng thập phân, 8% là 0,08"), còn sót:

| Mã     | Công thức / ký hiệu                                                                                   |
| ------ | ----------------------------------------------------------------------------------------------------- |
| L09-03 | `gia-ly-thuyet-vn30f` r, q (derivatives.ts:128, 133); `so-hop-dong-toi-da` k; `co-vi-the-phai-sinh` r |
| L09-04 | `r_mua`, `r_ban`, `r_thue`, `r_ct` của 5 công thức phí/thuế (fees.ts:148, 248, 343, 447, 691, 698)    |
| L06-06 | `co-lenh-rui-ro` r (risk.ts:44)                                                                       |
| L10-08 | `rut-truoc-han` r_kkh, `gui-quay-vong` r_n, r_d (planning.ts:83, 370, 386)                            |
| L10-15 | `so-ky-dca` i (ký hiệu "÷ 100 ÷ 12", khung cách tính "÷ 12")                                          |
| L06-11 | `ty-so-calmar` r_nam                                                                                  |

Câu mẫu thêm vào cuối: _", dạng thập phân, tức 1% là 0,01"_ (1% để chữ không cũ đi khi biểu phí đổi).

### N3. Giá nhập theo nghìn đồng như trên bảng giá (Vừa)

L10-13 (DCA, thuế TNCN), L02-02 (P/S: doanh thu tỷ ÷ triệu CP ra 37,157 gõ vào ô ₫ → P/S 1.956,56). Câu mẫu: _"Tính
bằng đồng; bảng giá ghi theo nghìn đồng, nên 66,8 trên bảng giá là 66.800 ₫."_

### N4. "Chọn kỳ khác" khi màn không có ô chọn kỳ (Vừa)

L02-05, L11-14 (P/E, ROS, hệ số chi trả, P/S, EV/EBITDA, EV/Sales, khuôn `divideByZero()`), L07-11 (hệ số biến thiên).
Bỏ vế "chọn kỳ"; với hệ số biến thiên trỏ tới ô "Số phiên lấy để tính".

### N5. Lãi suất phi rủi ro: tiết kiệm, TPCP 1 năm hay 10 năm (Vừa)

L06-04 (Sharpe, Sortino, Treynor "Khi nào dùng" nói tiết kiệm), L01-12 (CAPM ba mục diễn giải nói tiết kiệm, hướng dẫn
cấm), L09-14 (VN30F: hướng dẫn "10 năm" cạnh mô tả "kỳ hạn ngắn"). Phần 1 năm / 10 năm đã là Q7; phần "tiết kiệm" mới.

### N6. Mức tham chiếu mâu thuẫn giữa các trang (Vừa)

L10-11 (8–12% chỗ thường chỗ lạc quan; "tiết kiệm 5–6%" trái ví dụ 6,8%), L01-11 (g "thấp hơn GDP" và "quanh GDP"),
L09-07 (ký quỹ 17–25% và 17–20%), L10-07 (lãi không kỳ hạn 0,1% và 0,1–0,5%). Đề xuất: một câu chung, không ghi số.

### N7. Câu "Nhận tự động" sai (Cao)

| Mã     | Ô                                       | Sự thật                                                  |
| ------ | --------------------------------------- | -------------------------------------------------------- |
| L01-01 | `capm` β (items.ts:940, mô tả en F:795) | không có cạnh `dependsOn`, nạp theo mã cũng không điền   |
| L01-02 | `ddm-hai-giai-doan` r (items.ts:903)    | không có cạnh (cạnh capm → requiredReturn là của Gordon) |
| L01-03 | `bien-an-toan` V (items.ts:1290)        | chỉ ở chế độ Nâng cao; đây là công thức Cơ bản           |

Các câu tương tự ở Gordon r, WACC re, FCFE FCFF, DCF FCFF/WACC cũng chỉ đúng ở Nâng cao.

## Mục mức Cao (30)

| Mã     | Công thức                      | Chỗ                                                                 | Lỗi                                                                                                                                                                      | Hướng sửa                                                                        |
| ------ | ------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| L01-01 | `capm`                         | hướng dẫn β, mô tả ô en                                             | N7                                                                                                                                                                       | "Ô này không tự điền"                                                            |
| L01-02 | `ddm-hai-giai-doan`            | hướng dẫn r                                                         | N7                                                                                                                                                                       | như trên                                                                         |
| L01-03 | `bien-an-toan`                 | hướng dẫn V                                                         | N7                                                                                                                                                                       | nói rõ chỉ ở Nâng cao                                                            |
| L01-04 | Gordon, DDM hai giai đoạn      | hướng dẫn cổ tức                                                    | N1                                                                                                                                                                       | N1                                                                               |
| L01-05 | `wacc`                         | nhãn E, dòng chữ, ký hiệu E+D, tiêu đề biểu đồ tròn                 | "Vốn chủ sở hữu", "Tổng nguồn vốn" trùng tên dòng sổ sách mã 400 / 440                                                                                                   | "Vốn hoá thị trường (E)", "Tổng vốn"; kéo theo `skippedPhrases`, `input-symbols` |
| L01-06 | `wacc`                         | hướng dẫn `equity.luuY` **và code** `src/data/preset-inputs.ts:136` | Nạp theo mã điền E = vốn chủ SỔ SÁCH; hướng dẫn cho phép dùng sổ sách. FPT: WACC 9,36% / DCF 79.328 ₫ / MOS +8,36% thay vì 10,87% / 60.651 ₫ / −19,87%, kết luận đảo dấu | **Sửa code**: điền E từ `marketCap` hoặc không điền; bỏ câu cho phép sổ sách     |
| L01-07 | `gia-tri-noi-tai-fcff`, `fcff` | ký hiệu, mô tả ô FCFF                                               | Không dặn FCFF đủ 12 tháng; nhập số một quý ra 20.206 ₫ thay vì 60.651 ₫                                                                                                 | "năm gần nhất, đủ 12 tháng"                                                      |
| L01-08 | `fcff`                         | hướng dẫn ΔNWC                                                      | Chỉ sang báo cáo lưu chuyển tiền tệ, nơi khoản này ghi ngược dấu; chép −3.608,7 ra FCFF 12.385 thay vì 5.168                                                             | Tính từ bảng cân đối; dặn đổi dấu                                                |
| L01-09 | `fcfe`                         | hướng dẫn lãi vay                                                   | Chỉ sang "chi phí tài chính" (mã 22, gồm lỗ tỷ giá) thay vì "chi phí lãi vay" (mã 23)                                                                                    | dòng mã 23                                                                       |
| L02-01 | `ev-ebitda`                    | `explanation.meaning` (valuation-multiples.ts:485)                  | "Số năm … hoàn lại giá mua" trong khi "Đọc kết quả" nói "không phải số năm hoàn vốn". REVIEW-2 B6 sửa dở                                                                 | câu đề xuất của L02                                                              |
| L03-01 | `ty-le-chi-tra-co-tuc`         | ô cổ tức                                                            | N1                                                                                                                                                                       | N1                                                                               |
| L03-02 | `no-tren-von-chu`              | mô tả, Ý nghĩa, Khi nào dùng, mô tả ô en                            | "đang vay" trong khi `calc` chia tổng nợ phải trả. **Đã là REVIEW-2 C8, chưa áp**; câu "lãi suất tăng" ở Khi nào dùng là mới                                             | câu sửa của C8                                                                   |
| L04-01 | `rsi-wilder`                   | hướng dẫn ô period (items.ts:2525–2529)                             | Chép từ SMA: "Số phiên của đường trung bình. 20 ngắn hạn, 50 trung hạn, 200 dài hạn". 200 vượt trần thanh trượt                                                          | Câu của Wilder 14 phiên. **Văn bản của chủ dự án (guide-111.json)**              |
| L06-01 | `beta` (+ ô beta của Treynor)  | mô tả, Khi nào dùng, ký hiệu β                                      | "biến động mạnh hay yếu hơn thị trường"; beta đo độ nhạy theo nhịp, không đo tổng dao động (FPT β 0,81 nhưng σ 29% vs 18%)                                               | "thường lên xuống theo nhịp thị trường mạnh hơn hay nhẹ hơn"                     |
| L07-01 | `sut-giam-hien-tai`            | Ý nghĩa (risk-drawdown.ts:538)                                      | "Khoảng cách còn lại để quay về đỉnh", nhưng `calc` chia cho đỉnh: 31,48% so với cần tăng 45,94%                                                                         | "thấp hơn đỉnh bao nhiêu %, tính trên đỉnh"                                      |
| L07-02 | `do-lech-chuan-ban-phan`       | Cách đọc kết quả, ghi chú ví dụ (risk-volatility.ts:568)            | "nhỏ hơn hẳn độ lệch chuẩn là dao động đến từ phiên tăng"; chuỗi đối xứng ±1% cho 0,71 lần                                                                               | so với độ lệch bán phần của mã khác                                              |
| L08-01 | `irr-nien-kim`                 | nhãn P, C, ký hiệu, hướng dẫn                                       | Nhãn phía nhà đầu tư ("Vốn bỏ ra ban đầu"), Khi nào dùng và ví dụ phía người vay; nhập tiền tự có ra 2,80%/tháng thay vì 0,79%                                           | mô tả hai phía                                                                   |
| L08-02 | `ty-suat-co-tuc`               | ô cổ tức                                                            | N1, thêm trước/sau thuế                                                                                                                                                  | N1                                                                               |
| L08-03 | `tong-loi-suat-tai-dau-tu`     | nhãn biểu đồ tròn và cột (performance.ts:592, 750), ghi chú ví dụ   | "Phần nhờ tái đầu tư" = `total − fromPriceGrowth` (performance.ts:729), tức toàn bộ phần cổ tức: 35,09 điểm, tái đầu tư thật chỉ 11,02                                   | "Phần nhờ cổ tức"; sửa kèm câu "EXTRA from reinvesting" trong CLAUDE.md          |
| L08-04 | `hpr`                          | hướng dẫn giá đầu kỳ                                                | "dùng giá đã điều chỉnh": giá điều chỉnh đã trừ cổ tức tiền mặt, nhập thêm D là cộng hai lần (23,68% thay vì 20,51%)                                                     | dặn ô Cổ tức nhập 0 khi dùng giá điều chỉnh                                      |
| L09-01 | `co-vi-the-phai-sinh`          | hướng dẫn `stopPoints.luuY`, `deSai` (items.ts:3159, 3169)          | "Đặt quá hẹp sẽ ra 0 hợp đồng": ngược phép tính, hẹp cho NHIỀU hợp đồng, rộng mới ra 0                                                                                   | **Sửa trước tiên**                                                               |
| L09-02 | `thue-co-tuc`                  | ô cổ tức                                                            | N1                                                                                                                                                                       | N1                                                                               |
| L09-03 | VN30F và phái sinh             | ký hiệu r, q, k                                                     | N2; thế 4,5 và 1,8 ra 1.564 điểm thay vì 1.282,84                                                                                                                        | N2                                                                               |
| L10-01 | `tra-gop-nien-kim`             | mô tả (personal.ts:99)                                              | "dư nợ giảm dần" là tên ngân hàng VN dùng cho cách trả gốc đều (repo cũng tag `tra-gop-goc-deu` như vậy)                                                                 | "trả góp đều, lãi tính trên dư nợ còn lại"                                       |
| L10-02 | `lai-tien-gui`, `lai-kep`      | hướng dẫn rate (items.ts:3542, 3591)                                | "Vay mua nhà thường 8–12%/năm" chép sang công thức tiền gửi                                                                                                              | biểu lãi suất tiền gửi                                                           |
| L10-03 | `thue-tncn-dau-tu`             | ô cổ tức                                                            | N1                                                                                                                                                                       | N1                                                                               |
| L11-01 | `xirr`                         | `preset.noTickerNote` (vi.ts:742)                                   | Hứa "không đổi được ô nào", nhưng Nạp thay hẳn bảng dòng tiền bằng hai dòng (FormulaDetail.tsx ~2076); vế "mã theo sang công thức khác" sai từ 13/10                     | nói đúng việc Nạp làm                                                            |
| L11-02 | 8 công thức nhận mã            | `detail.presetNoData(+Fix)` (vi.ts:454)                             | "Công thức này không dùng số liệu của mã": dải chỉ hiện khi công thức CÓ nhận mã; nút "Xem ví dụ thực tế" chỉ cuộn trang                                                 | "Mã HPG chưa cấp được số nào (thường do chưa tra được thị giá)"                  |
| L11-03 | 35 công thức chuỗi             | `missingSeries()` fix, chip (warnings.ts:33, 86)                    | "dán chuỗi giá từ Excel" không còn nút nào tên vậy; thiếu phiên thường do chính ô người dùng đặt (Beta 300 phiên, VN-Index cố định)                                      | cho nơi gọi truyền `fix` riêng; nói "giảm số phiên/chu kỳ"                       |
| L11-04 | 5 công thức trong chuỗi        | `inheritedFrom()` (warnings.ts:117)                                 | Câu bị gạch dài chẻ đôi; "Mở CAPM để sửa" dẫn sai đường (số của chuỗi nằm ở thẻ bước của màn đang xem); chip "Cảnh báo kế thừa"                                          | trỏ tới thẻ bước; chip "Lỗi từ bước trước"                                       |

## Mục mức Vừa và Thấp

Ghi theo lô; đề xuất câu đầy đủ (vi + en) nằm trong báo cáo từng lô, tóm ở cột cuối.

### L01 · valuation-dcf

| Mã     | Mức  | Công thức / chỗ                            | Lỗi → hướng sửa                                                                                         |
| ------ | ---- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| L01-10 | Vừa  | DDM hai giai đoạn, nhãn thanh (F:401, 403) | "Cổ tức giai đoạn 1", "Giá trị cuối kỳ" là số ĐÃ chiết khấu → "Hiện giá cổ tức GĐ1", "Hiện giá cuối kỳ" |
| L01-11 | Vừa  | ô g của Gordon, DDM, DCF                   | N6                                                                                                      |
| L01-12 | Vừa  | CAPM ba mục diễn giải                      | N5                                                                                                      |
| L01-13 | Vừa  | FCFF Ý nghĩa                               | "tái đầu tư để duy trì" trong khi trừ cả CapEx mở rộng                                                  |
| L01-14 | Vừa  | FCFF Cách đọc kết quả                      | mốc LNST trong khi FCFF chưa trừ lãi vay → EBIT × (1 − t)                                               |
| L01-15 | Vừa  | FCFE dòng chữ                              | ngoặc sát tên đọc thành phép nhân                                                                       |
| L01-16 | Vừa  | DCF cảnh báo FCFF ≤ 0                      | REVIEW-2 A11 chưa áp                                                                                    |
| L01-17 | Vừa  | khung ΔNWC, D_ròng                         | hình "Tiền mặt", chữ "Tiền và tương đương tiền"                                                         |
| L01-18 | Vừa  | ô thuế suất WACC, FCFF                     | "thực nộp" và "phổ thông theo luật"                                                                     |
| L01-19 | Vừa  | CAPM ví dụ β 0,9043 vs Beta ví dụ 0,8126   | hai ví dụ hai beta; "treo vào" → "phụ thuộc vào"                                                        |
| L01-20 | Thấp | WACC ô chi phí nợ                          | không nói trước thuế, cả năm                                                                            |
| L01-21 | Thấp | DDM hướng dẫn g2                           | "phải thấp hơn hẳn g1" sai (g1 = g2 vẫn tính)                                                           |
| L01-22 | Thấp | CAPM hướng dẫn rf                          | "2026 quanh 3–4%" trái ví dụ 4,57%                                                                      |
| L01-23 | Thấp | nguồn ví dụ cả lô                          | "chốt 15/09" đọc như ngày chốt quyền; en "locked in", ngày ISO                                          |
| L01-24 | Thấp | DDM dòng chữ en; WACC tiêu đề ví dụ        | tên lệch nhãn ô; "Re/Rd" viết hoa                                                                       |
| L01-25 | Thấp | sáu chỗ văn                                | CAPM mô tả thiếu ERP; "lá chắn thuế"; "rẻ hơn"; MOS "giá mua"; gạch ngang trong "0,5–1,5"…              |

### L02 · bội số định giá

| Mã     | Mức  | Công thức / chỗ                        | Lỗi → hướng sửa                                                         |
| ------ | ---- | -------------------------------------- | ----------------------------------------------------------------------- |
| L02-02 | Vừa  | P/S ô doanh thu mỗi CP                 | N3; thiếu "bốn quý gần nhất"                                            |
| L02-03 | Vừa  | Số Graham Ý nghĩa, ghi chú ví dụ       | "hai trần riêng" trong khi là một tích 22,5; tại số Graham P/B FPT 2,38 |
| L02-04 | Vừa  | Giá mục tiêu cảnh báo EPS ≤ 0          | gợi ý Số Graham cũng lỗi với EPS âm (REVIEW-2 B3 chưa áp)               |
| L02-05 | Vừa  | P/E, P/S, EV/EBITDA, EV/Sales cảnh báo | N4                                                                      |
| L02-06 | Vừa  | P/S ghi chú ví dụ                      | "So với mốc 1 lần": P/S không có ngưỡng 1                               |
| L02-07 | Vừa  | P/S vs EV/Sales ví dụ                  | hai nền doanh thu, suy ra EV/Sales luôn > P/S                           |
| L02-08 | Vừa  | Giá mục tiêu ví dụ                     | "P/E 15 theo trung bình lịch sử" không nguồn                            |
| L02-09 | Thấp | Giá mục tiêu Khi nào dùng              | "giá chốt lời"                                                          |
| L02-10 | Thấp | P/E Ý nghĩa                            | "hoàn lại" gợi tiền về túi                                              |
| L02-11 | Thấp | Vốn hoá Sai lầm thường gặp             | bỏ vế tiền mặt của EV                                                   |
| L02-12 | Thấp | E/P dòng chữ                           | "Tỷ suất lợi nhuận" thiếu "trên giá"                                    |
| L02-13 | Thấp | PEG ô tăng trưởng                      | EPS hay lợi nhuận                                                       |
| L02-14 | Thấp | PEG ô P/E en                           | "Company ratios group" không tồn tại (REVIEW-2 B8)                      |
| L02-15 | Thấp | NCAV nhãn thanh en                     | thiếu "/share"                                                          |
| L02-16 | Thấp | Vốn hoá lời giải N                     | ngày lệch nguồn                                                         |
| L02-17 | Thấp | 6 câu DIVIDE_BY_ZERO                   | tên số chia viết hoa giữa câu                                           |

### L03 · chỉ số doanh nghiệp

| Mã     | Mức  | Công thức / chỗ                                | Lỗi → hướng sửa                                                      |
| ------ | ---- | ---------------------------------------------- | -------------------------------------------------------------------- |
| L03-03 | Vừa  | DTL Sai lầm thường gặp                         | "chỉ đúng cho thay đổi nhỏ": đúng tuyệt đối trong mô hình của `calc` |
| L03-04 | Vừa  | Hệ số chi trả ô EPS                            | không nói kỳ; khung nối sang EPS nửa năm ra 67,83%                   |
| L03-05 | Vừa  | EPS, ROE, ROA, biên ròng: nhãn và ký hiệu LNST | không nói "của cổ đông công ty mẹ"                                   |
| L03-06 | Vừa  | DTL ô biến phí, định phí                       | báo cáo không có dòng này; nói cách ước                              |
| L03-07 | Vừa  | Biên ròng nhãn "Chi phí và thuế"               | là số dư, không phải tổng chi phí → "Doanh thu còn lại"              |
| L03-08 | Vừa  | DTL nhãn "Lãi trước thuế"                      | là EBIT − lãi vay → "Lãi sau lãi vay"                                |
| L03-09 | Vừa  | EPS, BVPS hướng dẫn số CP                      | bản cáo bạch thường đã cũ → thuyết minh BCTC                         |
| L03-10 | Thấp | Thanh toán hiện hành/nhanh cảnh báo            | "thanh khoản đã an toàn" → bảo kiểm lại ô                            |
| L03-11 | Thấp | DTL cảnh báo EBIT ≤ 0                          | EBIT = 0 là hoà vốn; lời khuyên cho ban điều hành                    |
| L03-12 | Thấp | Điểm hoà vốn cảnh báo                          | tên ô thứ ba "biến phí đơn vị"                                       |
| L03-13 | Thấp | DTL ký hiệu I                                  | "lãi vay phải trả" trùng khoản bảng cân đối                          |
| L03-14 | Thấp | DTL nhãn nguồn ví dụ                           | thiếu nguồn của BP, FC                                               |
| L03-15 | Thấp | DTL mô tả en                                   | văn                                                                  |

### L04 · chỉ báo xu hướng

| Mã     | Mức  | Công thức / chỗ                   | Lỗi → hướng sửa                                                                    |
| ------ | ---- | --------------------------------- | ---------------------------------------------------------------------------------- |
| L04-02 | Vừa  | RSI cảnh báo giá đứng yên         | "kéo dài số phiên" không bao giờ gỡ được (REVIEW-2 D4 chưa áp)                     |
| L04-03 | Vừa  | Giao cắt MA mô tả, Ý nghĩa        | "dấu dương là cắt lên đã xảy ra"; dấu chỉ nói đường nào nằm trên                   |
| L04-04 | Vừa  | Giao cắt MA Cách đọc câu 2        | "gần 0 là chưa ngả về đâu": thực tế gần 0 là sắp cắt                               |
| L04-05 | Vừa  | Động lượng mô tả                  | "chênh lệch tuyệt đối" trong khi kết quả có dấu                                    |
| L04-06 | Vừa  | EMA Cách đọc                      | "giá trên EMA là đà mới kéo lên", ví dụ cùng màn bác                               |
| L04-07 | Vừa  | EMA ghi chú ví dụ                 | ghép bình quân trọng số với bình quân đơn: tính lại ra 72.342 chứ không 72.389     |
| L04-08 | Vừa  | Đường tín hiệu MACD Cách đọc      | mốc là MACD nhưng màn không in số MACD                                             |
| L04-09 | Vừa  | khung MACD, giao cắt (recipes.ts) | "Số phiên n" cho hai ô khác nhau                                                   |
| L04-10 | Vừa  | RSI ký hiệu Gain/Loss             | "trong ô Số phiên" đọc thành trung bình n phiên cuối                               |
| L04-11 | Vừa  | RSI Cách đọc                      | "Quá mua / Quá bán" không giải thích                                               |
| L04-12 | Vừa  | ROC, Động lượng hướng dẫn         | "tránh chọn đúng phiên chia tách": chia tách ở bất kỳ đâu trong khoảng (guide-111) |
| L04-13 | Thấp | ROC mô tả, hướng dẫn              | "hôm nay" → "phiên cuối của chuỗi đã nạp"                                          |
| L04-14 | Thấp | RSI mô tả ô                       | "lợi suất" (calc dùng chênh giá ₫); "lệch vài điểm" thực tới 11                    |
| L04-15 | Thấp | EMA, MACD, RSI tiêu đề ví dụ      | ba bối cảnh khác nhau cho cùng phiên chốt (REVIEW-2 D5)                            |
| L04-16 | Thấp | Tín hiệu MACD mô tả; tên RSI      | số cứng 9, 14 trong khi ô là thanh trượt                                           |
| L04-17 | Thấp | `EMA_{tin hieu}`                  | KaTeX ra "tinhieu" → `tin\,hieu`                                                   |
| L04-18 | Thấp | SMA, EMA hướng dẫn                | câu "RSI dùng 14 phiên" lạc chủ đề                                                 |
| L04-19 | Thấp | RSI Sai lầm thường gặp            | "bảng giá" / "price chart"                                                         |
| L04-20 | Thấp | MACD ô fastPeriod                 | "Appel" không giới thiệu                                                           |
| L04-21 | Thấp | RSI khung bước 2–3                | chỉ số n và t lẫn nhau                                                             |
| L04-22 | Thấp | ROC ghi chú ví dụ                 | "treo nhiều vào"                                                                   |

### L05 · chỉ báo biến động

| Mã     | Mức  | Công thức / chỗ                      | Lỗi → hướng sửa                                                                |
| ------ | ---- | ------------------------------------ | ------------------------------------------------------------------------------ |
| L05-01 | Vừa  | ATR hướng dẫn, mô tả ô period        | "lấy trung bình biên độ": thực là làm mượt Wilder cả chuỗi (1.364 vs 1.502,87) |
| L05-02 | Vừa  | Stochastic cảnh báo                  | "kịch trần/kịch sàn" sai nguyên nhân (REVIEW-2 D11 chưa áp)                    |
| L05-03 | Vừa  | Bollinger σ (ký hiệu, lời giải)      | "độ lệch chuẩn …, chia cho 20" đọc thành chia sau cùng                         |
| L05-04 | Vừa  | VWAP Ý nghĩa, Khi nào dùng, Cách đọc | "giá thị trường đã trả" trong khi ước theo giá đóng cửa                        |
| L05-05 | Vừa  | Độ biến động lịch sử hướng dẫn       | "cửa sổ ba tháng" đứng yên cạnh số đi theo ô                                   |
| L05-06 | Vừa  | Độ biến động lịch sử mô tả           | "căn bậc hai số phiên" → "số phiên giao dịch một năm"                          |
| L05-07 | Vừa  | Độ biến động lịch sử Ý nghĩa         | mời so với lãi suất                                                            |
| L05-08 | Vừa  | Độ rộng Bollinger ghi chú ví dụ      | 9,34 "nằm ở khoảng giữa" của 4,96–34,73                                        |
| L05-09 | Vừa  | Độ biến động lịch sử                 | "giáo trình khuyên ít nhất 60 phiên": cần đối chiếu Hull                       |
| L05-10 | Thấp | Stochastic                           | mốc "điểm" và "%" cho cùng thang                                               |
| L05-11 | Thấp | %B cảnh báo                          | "chuỗi phẳng lì": chỉ cần n phiên cuối                                         |
| L05-12 | Thấp | ATR ký hiệu, khung bước 1            | "phiên đầu" mơ hồ                                                              |
| L05-13 | Thấp | Dải Bollinger mô tả                  | độ lệch chuẩn của cả chuỗi hay n phiên                                         |
| L05-14 | Thấp | Độ rộng Bollinger Ý nghĩa            | "đang nở hay đang bóp" từ một con số                                           |
| L05-15 | Thấp | khung BB của độ rộng, %B             | k, n không có ô mang tên                                                       |
| L05-16 | Thấp | Stochastic khung L_n, H_n            | chỉ số n và t lẫn nhau                                                         |
| L05-17 | Thấp | Bollinger lời giải en                | "middle band" / "middle line"                                                  |
| L05-18 | Thấp | Tỷ lệ khối lượng, dải dưới en        | văn                                                                            |

### L06 · tỷ số rủi ro

| Mã     | Mức  | Công thức / chỗ                       | Lỗi → hướng sửa                                                                     |
| ------ | ---- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| L06-02 | Vừa  | Sortino ghi chú ví dụ, mô tả          | "dao động của các phiên lãi kém" đưa lại cách đọc REVIEW-3 đã sửa (0,27 vs 0,39)    |
| L06-03 | Vừa  | Treynor Cách đọc, ghi chú ví dụ       | mốc tự tính ra 4,10 trong khi công thức cho 5,98; ngầm VN-Index lãi 10,55% vs 8,67% |
| L06-04 | Vừa  | Sharpe, Sortino, Treynor Khi nào dùng | N5                                                                                  |
| L06-05 | Vừa  | Cỡ lệnh theo rủi ro                   | "mất đúng mức đã định" chưa tính phí, thuế, giá rơi xuyên (10,63 triệu vs 10 triệu) |
| L06-06 | Vừa  | Cỡ lệnh ký hiệu r                     | N2                                                                                  |
| L06-07 | Vừa  | 5 tỷ số ký hiệu r̄_p                   | không nói tính trên toàn chuỗi đang nạp                                             |
| L06-08 | Vừa  | Sortino dòng chữ, ký hiệu n           | "Tổng số phiên" trong khi n = số lợi suất (249)                                     |
| L06-09 | Thấp | Beta hướng dẫn sessions               | khuyên 120/250 mà mặc định và ví dụ 60                                              |
| L06-10 | Thấp | r_f, r̄_b                              | "năm" dùng như biến                                                                 |
| L06-11 | Thấp | Calmar r_nam                          | N2                                                                                  |
| L06-12 | Thấp | Thắng/thua Sai lầm                    | "hơn 2,3 lần mới hoà" (đúng 2,33)                                                   |
| L06-13 | Thấp | Thắng/thua cảnh báo                   | "trung bình mức giảm bằng 0" sai nguyên nhân                                        |
| L06-14 | Thấp | Thắng/thua ô ngưỡng                   | câu 60 phiên dính vào mô tả ngưỡng                                                  |
| L06-15 | Thấp | Beta tên                              | "rủi ro hệ thống" không giải nghĩa                                                  |
| L06-16 | Thấp | Cỡ lệnh vs hướng dẫn                  | làm tròn tới cổ phiếu hay lô                                                        |
| L06-17 | Thấp | 7 câu DIVIDE_BY_ZERO                  | tên số chia viết hoa                                                                |
| L06-18 | Thấp | Beta khung Cov/Var, lời giải          | n không định nghĩa; "(%²)"                                                          |

### L07 · biến động, sụt giảm

| Mã     | Mức  | Công thức / chỗ                     | Lỗi → hướng sửa                                                   |
| ------ | ---- | ----------------------------------- | ----------------------------------------------------------------- |
| L07-03 | Vừa  | Chuỗi phiên giảm dài nhất Ý nghĩa   | không nói phiên đứng giá cắt chuỗi (ví dụ có ca này: 5 vs 4)      |
| L07-04 | Vừa  | VaR, CVaR ô độ tin cậy              | không nói bằng lời "95% = khoảng 5/100 phiên lỗ nặng hơn"         |
| L07-05 | Vừa  | VaR, CVaR khung bước h              | n không định nghĩa (n = 71 ra 1,96 vs 1,98)                       |
| L07-06 | Vừa  | CVaR dòng chữ, khung E              | "ngưỡng VaR" lúc dương lúc âm                                     |
| L07-07 | Vừa  | CVaR ký hiệu E, VaR ký hiệu Q en    | nói đã đổi dấu trong khi hình còn dấu trừ                         |
| L07-08 | Vừa  | MDD, VaR, CVaR khung cửa sổ         | một ô hai ký hiệu N và L; max(30, L) không bao giờ có tác dụng    |
| L07-09 | Vừa  | 4 công thức ô lookback              | chuỗi ngắn hơn ô thì lặng lẽ tính cả chuỗi                        |
| L07-10 | Vừa  | Độ lệch bán phần mô tả, ô ngưỡng    | "bỏ qua các phiên tăng" chỉ đúng ở ngưỡng 0                       |
| L07-11 | Vừa  | Hệ số biến thiên cảnh báo           | N4 (166/221 cửa sổ gặp lỗi này)                                   |
| L07-12 | Vừa  | Độ biến động năm hoá Ý nghĩa        | mời so với lãi suất                                               |
| L07-13 | Vừa  | Biên độ dao động lớn nhất tên       | trùng thuật ngữ biên độ trần sàn; đổi tên là việc chủ dự án quyết |
| L07-14 | Thấp | Độ lệch chuẩn lợi suất mô tả        | "bình quân" độ lệch; "phần trăm" vs "điểm phần trăm"              |
| L07-15 | Thấp | Độ lệch chuẩn lợi suất ký hiệu r̄, t | "n phiên" vs n lợi suất                                           |
| L07-16 | Thấp | CVaR Ý nghĩa                        | "nặng hơn ngưỡng" (REVIEW-3 sửa dở)                               |
| L07-17 | Thấp | 3 ký hiệu                           | "dài theo ô"; tên ô en không có trên màn                          |
| L07-18 | Thấp | Độ lệch chuẩn lợi suất ghi chú      | "54 lần đổi giá" (có phiên đứng giá)                              |
| L07-19 | Thấp | Hệ số biến thiên tiêu đề, cảnh báo  | "lợi nhuận" vs "lợi suất"                                         |

### L08 · hiệu suất, lợi suất

| Mã     | Mức  | Công thức / chỗ                      | Lỗi → hướng sửa                                                                  |
| ------ | ---- | ------------------------------------ | -------------------------------------------------------------------------------- |
| L08-05 | Vừa  | CAGR thanh trượt năm                 | chỉ nhận số nguyên, ví dụ 9,12 năm không tự tính lại được (sửa code hoặc nói rõ) |
| L08-06 | Vừa  | HPR ô cổ tức                         | "nhận được trong kỳ" vs ngày không hưởng quyền; trước/sau thuế                   |
| L08-07 | Vừa  | Lãi suất hiệu dụng hướng dẫn perYear | sổ lĩnh lãi hằng tháng không nhập lãi vào gốc                                    |
| L08-08 | Vừa  | Lợi suất thực hướng dẫn lạm phát     | "chỉ số CPI" → gõ 104,45 ra −46,6%                                               |
| L08-09 | Vừa  | Tổng lợi suất ô tăng giá             | "trung bình" trong khi calc cần tăng trưởng kép                                  |
| L08-10 | Vừa  | Lợi suất vượt chuẩn hướng dẫn        | danh mục có cổ tức so với VN-Index chỉ giá                                       |
| L08-11 | Vừa  | ROI ô giá trị hiện tại, Khi nào dùng | có cộng cổ tức đã nhận hay không                                                 |
| L08-12 | Vừa  | XIRR cảnh báo không hội tụ           | "kèm ngày đúng thứ tự": thứ tự không quan trọng                                  |
| L08-13 | Vừa  | XIRR Sai lầm thường gặp              | "dòng cuối phải là giá trị hiện tại": sai khi đã bán hết                         |
| L08-14 | Vừa  | Lợi suất bình quân hình học ô kỳ     | không nói các kỳ phải dài bằng nhau (ví dụ trộn 12 và 8 tháng)                   |
| L08-15 | Thấp | XIRR ký hiệu i, d_i                  | "dòng tiền đầu tiên" vs ngày sớm nhất                                            |
| L08-16 | Thấp | Lợi suất vượt chuẩn Ý nghĩa          | "thành tích thật sự" chưa điều chỉnh rủi ro                                      |
| L08-17 | Thấp | Lợi suất quy năm ghi chú             | 185,39% tính từ số chưa in; từ 15,12% ra 185,44%                                 |
| L08-18 | Thấp | Thời gian nhân đôi tên en            | "(rule of 72)" trong khi màn tính bằng ln                                        |
| L08-19 | Thấp | Lợi suất quy năm Cách đọc            | "đã bán lỗ" vs giá dự định bán                                                   |
| L08-20 | Thấp | HPR nguồn en                         | ex-dividend vs record date                                                       |

### L09 · phí, thuế, phái sinh

| Mã     | Mức  | Công thức / chỗ                    | Lỗi → hướng sửa                                                   |
| ------ | ---- | ---------------------------------- | ----------------------------------------------------------------- |
| L09-04 | Vừa  | 5 công thức phí/thuế ký hiệu tỷ lệ | N2; bốn cách viết một mức phí trên cùng màn                       |
| L09-05 | Vừa  | ô quantity dùng chung              | "mua vào rồi bán ra" ở màn thuế cổ tức (REVIEW-2 G5)              |
| L09-06 | Vừa  | Cỡ vị thế phái sinh hướng dẫn      | "tới mức thoát lệnh" gồm cả chốt lời                              |
| L09-07 | Vừa  | Số HĐ tối đa ký quỹ                | N6; VSDC hay công ty chứng khoán                                  |
| L09-08 | Vừa  | Số HĐ tối đa nguồn                 | hai ngày hiệu lực cho cùng mức 17%                                |
| L09-09 | Vừa  | ký hiệu F "điểm hợp đồng"          | không nói là giá VN30F đang khớp (gõ 15 ra 784 HĐ)                |
| L09-10 | Vừa  | `missingConstant` fix              | "chọn biểu phí khác ở Cài đặt": không có ô chọn; en sai ngữ pháp  |
| L09-11 | Vừa  | `fee.scheduleNote`                 | "Market Config" (cùng L11-12)                                     |
| L09-12 | Vừa  | Đòn bẩy hiệu dụng ghi chú          | ngầm coi là Long                                                  |
| L09-13 | Vừa  | Số HĐ tối đa ghi chú, Cách đọc     | "còn dư 3.048.200 ₫" đọc như tiền rảnh (5,08 điểm là dưới ký quỹ) |
| L09-14 | Vừa  | VN30F hướng dẫn rf                 | N5                                                                |
| L09-15 | Thấp | Lợi nhuận ròng nhãn bảng           | "CNCK" không giải thích                                           |
| L09-16 | Thấp | Thuế cổ tức nguồn                  | Luật 109/2025 chưa hiệu lực ở đợt 12/2025 (REVIEW-2 G4)           |
| L09-17 | Thấp | Ví dụ phái sinh                    | "VN30F1M", "VN30F2005", "ATC" không giải nghĩa                    |
| L09-18 | Thấp | Thuế chuyển nhượng ghi chú         | 55.000 vừa là giá vừa là thuế                                     |
| L09-19 | Thấp | Giá hoà vốn ghi chú                | 252,77 × 1.000 ≠ 252.140                                          |
| L09-20 | Thấp | Giá hoà vốn dòng chữ               | "Thuế suất bán", en "sales tax"                                   |
| L09-21 | Thấp | VN30F mô tả                        | "(cost of carry)" tiếng Anh                                       |

Ngoài phạm vi, ghi lại: `docKetQua` của `co-vi-the-phai-sinh` (items.ts:3165) còn câu REVIEW-2 G14 đã sửa ở màn chi tiết.

### L10 · tài chính cá nhân, kế hoạch

| Mã     | Mức  | Công thức / chỗ                         | Lỗi → hướng sửa                                                 |
| ------ | ---- | --------------------------------------- | --------------------------------------------------------------- |
| L10-04 | Vừa  | Lãi kép ô perYear ẩn ở Cơ bản (12)      | sổ 12 tháng tái tục là 1 lần/năm: lệch 6 triệu/100 triệu/10 năm |
| L10-05 | Vừa  | Rút trước hạn cảnh báo, ô monthsHeld    | sổ tự tái tục                                                   |
| L10-06 | Vừa  | Rút trước hạn ô gốc                     | rút một phần                                                    |
| L10-07 | Vừa  | Rút trước hạn ô lãi không kỳ hạn        | N6                                                              |
| L10-08 | Vừa  | ký hiệu r_kkh, r_n, r_d                 | N2                                                              |
| L10-09 | Vừa  | Gửi quay vòng ô tổng tháng              | "nên là bội số" trong khi calc từ chối                          |
| L10-10 | Vừa  | Lãi kép Sai lầm thường gặp              | "lãi suất thực nhận" dễ lẫn với lợi suất thực                   |
| L10-11 | Vừa  | Tiết kiệm mục tiêu, Số kỳ DCA hướng dẫn | N6; "tự lừa mình"                                               |
| L10-12 | Vừa  | Thuế TNCN Cách đọc                      | lời một cổ phiếu hay cả khoản                                   |
| L10-13 | Vừa  | DCA, Thuế TNCN ô giá                    | N3                                                              |
| L10-14 | Thấp | Lịch trả nợ khung L_k                   | dùng tiền lãi kỳ k trước khi định nghĩa                         |
| L10-15 | Thấp | Số kỳ DCA ký hiệu i                     | N2                                                              |
| L10-16 | Thấp | Trả góp niên kim ghi chú                | "không khớp" không nói vì sao                                   |
| L10-17 | Thấp | Lịch trả nợ ghi chú                     | "0,75%" đọc như lãi suất                                        |
| L10-18 | Thấp | Thuế TNCN nguồn en                      | "dividend paid on" vs ngày chốt quyền                           |
| L10-19 | Thấp | Lãi tiền gửi Sai lầm                    | "phần lớn ngân hàng" vs Thông tư 04/2022                        |
| L10-20 | Thấp | DCA mô tả                               | hướng dẫn thao tác đã cũ trên thẻ danh sách                     |
| L10-21 | Thấp | 3 ký hiệu i en                          | tên ô en không có trên màn                                      |
| L10-22 | Thấp | DCA ô lots                              | câu của chủ dự án, chỉ nêu                                      |

### L11 · chữ dùng chung

| Mã     | Mức  | Key / chỗ                                       | Lỗi → hướng sửa                                                                    |
| ------ | ---- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| L11-05 | Vừa  | `detail.liveSeriesShort`, `detail.tickerFailed` | trỏ tới nút "Nạp mẫu" đã thành chip; "dán chuỗi giá" không có nút                  |
| L11-06 | Vừa  | `detail.loadExample` / `exampleLoaded`          | "Xem ví dụ minh hoạ" ghi đè ô nhập → "Nạp ví dụ minh hoạ"; vi "Đã xem" en "loaded" |
| L11-07 | Vừa  | `detail.hiddenInBasic`                          | "chuyển chế độ" mà màn chi tiết không có nút                                       |
| L11-08 | Vừa  | `input.overridden` + `autoFrom` + `revert`      | "đã sửa · Nhận tự động từ…" hai trạng thái ngược trên một dòng                     |
| L11-09 | Vừa  | `paste.badRows` + `paste.rows`                  | "3 dòng dòng lỗi"                                                                  |
| L11-10 | Vừa  | `search.hot.title`                              | "Danh mục hot" trùng tên màn Danh mục                                              |
| L11-11 | Vừa  | `export.chartNone`                              | "không có biểu đồ" in cả khi chỉ chưa vẽ được                                      |
| L11-12 | Vừa  | `fee.scheduleNote`, `aboutUs.*`                 | "Market Config"                                                                    |
| L11-13 | Vừa  | `guide.warn.*` (guide-111.json)                 | câu chung sai với chia 0 từ chuỗi giá, MODEL_VIOLATION, "Nạp mã"                   |
| L11-14 | Vừa  | `divideByZero()` khuôn                          | N4                                                                                 |
| L11-15 | Thấp | `paste.reordered`                               | "đã đảo lại" trong khi lưới hiện mới → cũ                                          |
| L11-16 | Thấp | `offline.detail`                                | "máy tính nằm trên máy bạn"; chọn mã cần mạng                                      |
| L11-17 | Thấp | `nhomSoDuTheoNam()`                             | cột lẻ "Năm 4" là tháng 45                                                         |
| L11-18 | Thấp | `missingConstant()`                             | như L09-10                                                                         |
| L11-19 | Thấp | `portfolio.betaHint`; en "by hand/manually"     | thư viện có công thức Beta; en còn "nhập tay"                                      |
| L11-20 | Thấp | `search.matchNote`                              | "Khớp không dấu" in cả khi gõ đủ dấu                                               |
| L11-21 | Thấp | `aboutUs.*`                                     | "đồ thị phụ thuộc", "đầy đủ cả khi ngoại tuyến" nói quá                            |
| L11-22 | Thấp | `series.subtitle`                               | "dùng cho Beta / Sharpe / VaR" trong khi cấp cho 35 công thức                      |
| L11-23 | Thấp | `portfolio.errBuyDate`                          | nêu quy luật, sai tên ô                                                            |
| L11-24 | Thấp | `portfolio.guide.xirr.note`                     | "mua nhiều đợt" không còn lối vào                                                  |

## Mục cũ chưa áp (tìm ra ở lượt trước, câu cũ vẫn còn trong mã)

| Mục                     | Công thức                                                             | Ghi chú                                                |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| REVIEW-2 C8             | `no-tren-von-chu`                                                     | = L03-02, mức Cao                                      |
| REVIEW-2 B6             | `ev-ebitda`                                                           | = L02-01, sửa ở Đọc kết quả, còn ở Ý nghĩa             |
| REVIEW-2 B3, B8         | giá mục tiêu, PEG                                                     | = L02-04, L02-14                                       |
| REVIEW-2 D4, D5, D11    | RSI, EMA, Stochastic                                                  | = L04-02, L04-15, L05-02                               |
| REVIEW-2 A11, A13       | DCF, Biên an toàn                                                     | A13 áp một phần                                        |
| REVIEW-2 E12, E13       | MDD, sụt giảm hiện tại                                                | tiêu đề "Mua đúng đỉnh"; "MDD không bao giờ giảm"      |
| REVIEW-2 F12, F14       | lợi suất thực                                                         |                                                        |
| REVIEW-2 G4, G5, G14    | thuế cổ tức, phái sinh                                                | G14 còn ở `docKetQua`                                  |
| REVIEW-2 H3, H4, H8, H9 | DCA, tiết kiệm mục tiêu, thuế TNCN                                    | H3 (DCA quy lệch cho "số tiền khác nhau") đáng ưu tiên |
| REVIEW-3 "Nhỏ"          | Beta mô tả (E5/E6), VWAP commonMistakes, hệ số chi trả khi lỗ, tên en | gộp vào L06-01 ở Beta                                  |

## Đề xuất thứ tự sửa (chờ duyệt)

1. **Đợt 1, câu dạy sai chiều hoặc sai đại lượng** (Cao, chỉ chữ): L09-01, L07-01, L07-02, L06-01, L02-01, L03-02,
   L10-01, L10-02, L08-03, L04-01 (cần duyệt câu vì là guide-111.json).
2. **Đợt 2, nhóm đồng loạt** N1 → N7, một câu mẫu mỗi nhóm.
3. **Đợt 3, chữ dùng chung tụt hậu** L11-01 → L11-14.
4. **Đợt 4, sửa code**: L01-06 (WACC nạp vốn chủ sổ sách), L08-05 (bước thanh trượt CAGR), tuỳ chủ dự án.
5. **Đợt 5**: các mục Vừa/Thấp còn lại và các mục cũ chưa áp.

Mỗi đợt chạy đủ gate: `when-to-use-rules`, `how-to-read-rules`, `meaning-rules`, `example-note-rules`, `noi-dung`,
`input-symbols`, `bieu-do`, `prose-audit`, `i18n`.

## Câu hỏi cho chủ dự án

- Văn bản từ `guide-111.json` (L04-01, L04-12, L11-13): duyệt câu đề xuất hay tự viết lại?
- L01-06: ô E của WACC khi nạp theo mã lấy vốn hoá hay để trống?
- L07-13: đổi tên "Biên độ dao động lớn nhất trong kỳ"?
- L10-04: đưa ô "Số lần nhập lãi" của lãi kép lên chế độ Cơ bản?
- L05-09: "giáo trình khuyên ít nhất 60 phiên" cần đối chiếu Hull; giữ, sửa số, hay đổi thành quy ước của sản phẩm?

## Đã sửa thêm (30/10/2026)

- N3: bảy ô giá (giá bán ở 6 công thức phí/thuế, giá đợt 1 của DCA) có luuY "Tính bằng đồng: bảng giá ghi 66,8 nghĩa là 66.800 ₫"; ô doanh thu mỗi CP của P/S nói rõ đổi tỷ ₫ ra đồng.
- N5: Sharpe, Sortino, Treynor, CAPM so với trái phiếu chính phủ thay vì tiết kiệm; ô rf bỏ "3–4%" trái ví dụ 4,57%.
- N6: g của Gordon, DDM, DCF thống nhất "không vượt tăng trưởng GDP dài hạn"; ký quỹ "từ 17% trở lên tuỳ công ty chứng khoán"; lãi không kỳ hạn bỏ số; mức lãi của tiết kiệm mục tiêu bỏ 5–6% và 8–12%.
- Ghim lại: 14 câu luuY có gạch en (từ 18), 166 ô có luuY, 762 chuỗi hướng dẫn, danh sách số cứng trùng mặc định bớt 2.

## Đã sửa thêm, đợt L01–L02 (30/10/2026)

L01-10 (nhãn thanh DDM: "Hiện giá cổ tức GĐ1", "Hiện giá cuối kỳ"), L01-13 (FCFF Ý nghĩa nói cả CapEx và vốn lưu động), L01-18 (thuế suất: "bạn áp dụng, mặc định mức phổ thông"), L01-21 (g2 không phải "thấp hơn hẳn g1"), L02-06 (P/S ghi chú ví dụ không còn mốc 1 lần), L02-10 (P/E "cộng lại bằng"), L02-12 (E/P "trên giá"), L02-14 (bỏ "Company ratios group").

## Đã sửa thêm, đợt L03–L04 (30/10/2026)

L03-07 (nhãn thanh biên ròng "Doanh thu còn lại"), L03-09 (số cổ phiếu lấy ở thuyết minh BCTC), L03-10 (nợ ngắn hạn 0 không phải "thanh khoản đã an toàn"), L04-02 (RSI cảnh báo giá đứng yên), L04-10 (ký hiệu Gain/Loss nói chu kỳ Wilder), L04-13 (ROC: "phiên cuối của chuỗi" thay "hôm nay").

## Đã sửa thêm, đợt L05–L06 (30/10/2026)

L05-01 (ATR: chu kỳ làm mượt Wilder), L05-02 (Stochastic: bỏ "kịch trần/kịch sàn"), L05-05 (độ biến động lịch sử: bỏ "ba tháng" đứng yên), L05-06 (nhân căn bậc hai số phiên một năm), L05-14 (độ rộng Bollinger: "rộng hay hẹp"), L06-09 (beta: bỏ 120/250 trái mặc định 60).

## Ki?m b?n build (30/10/2026)

Build tr�n b?n sao: qua. verify:static 56/56 sau khi s?a ph�p ki?m h?nh hai v? (d?ng ch? nay b?c c?m trong span). check:chrome 208/216, y h?t HEAD s?ch (8 ca h?ng c� s?n: nh?n tr?c bi?u �?, popup ch?-c�-ngh?a, n�t form th�m m?, th? t? ng�y b?ng d? li?u). size v�?t c?a 180 kB ? 112 trang, c?ng c� s?n.

## Đã sửa thêm, đợt L07–L08 (30/10/2026)

L08-12 (XIRR cảnh báo: "kèm ngày của từng khoản", bỏ "đúng thứ tự"), L08-16 (lợi suất vượt chuẩn Ý nghĩa: chưa điều chỉnh rủi ro), L08-18 (tên en "Doubling time", bỏ "(rule of 72)" vì màn tính bằng ln).

## Đã sửa thêm, đợt tính lại (30/10/2026)

L08-08 (lạm phát: nhập mức tăng %, không phải chỉ số), L08-14 (các kỳ phải dài bằng nhau), L07-03 (phiên đứng giá cắt chuỗi giảm). Đã tính lại L08-17: lãi ròng 15,1187% (phí mua 0,15%, phí bán 0,15%, thuế 0,1%), quy năm 185,41%; ghi chú ví dụ đang in 185,39%, chưa sửa vì chưa chắc biểu phí lúc ghi.
