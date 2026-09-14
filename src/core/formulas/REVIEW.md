# Hồ sơ rà đúng/sai 111 công thức + khối "Giải thích cho người mới" (11/09 – 12/09/2026)

Trạng thái: **đã áp — 13/09/2026.** Chủ dự án duyệt "áp hết, trừ mục cần quyết"; cả 87 phát hiện
CONFIRMED dưới đây đã vào mã nguồn, kèm bốn quyết định riêng ghi ở mục "Đã áp những gì" ngay dưới.
Bảng và danh sách phía sau giữ nguyên như lúc rà, để đọc lại được nguyên trạng vấn đề và bằng chứng.

## Đã áp những gì

- **75 câu prose** (vi + en) áp bằng script định vị theo đường dẫn field trong đúng khối công thức,
  rồi `prettier` + `npm run check`. Ba câu mở đầu bằng "Kết quả <số>" được viết lại thành dạng minh
  hoạ ("25% nghĩa là…") theo nếp sẵn có của repo — chính là lỗi #39 mà buổi test nội bộ phản ánh:
  câu chữ đứng yên trong khi con số đổi theo ô nhập.
- **12 mục sửa code / latex**, gồm 9 lỗi toán và 3 thông điệp cảnh báo. Đáng kể nhất: tách điều kiện
  từ chối của CVaR khỏi VaR (`lossTailOf` thôi tự quyết, mỗi công thức tự chặn theo đúng thứ nó đo),
  thêm ca kiểm chuỗi 61 giá cho CVaR 2,3667%; chặn Gordon khi cổ tức = 0; thu hẹp chốt chặn EBIT âm
  của FCFF còn "âm VÀ thuế > 0"; bỏ chặn EPS ≤ 0 của tỷ suất lợi nhuận trên giá (E/P là tỷ lệ đơn,
  lỗ thì ra % âm đọc được); thêm nhánh tràn số cho lợi suất quy năm theo ngày.
- **Bốn quyết định của chủ dự án** trong lượt áp: (1) áp cả ba chốt chặn trên; (2) latex MACD viết
  tổng quát theo tên chu kỳ thay vì cứng 12/26/9, cho khớp `expression` vốn đã tổng quát; (3) đưa ký
  hiệu công thức vào nhãn ô nhập cho nhóm Định giá + Chỉ số DN — áp theo luật hẹp "chỉ thêm khi latex
  thật sự dùng ký hiệu ngắn cho ô ấy", ra 9 nhãn trên 7 công thức (`no-tren-von-chu` bị luật loại vì
  latex viết tên đầy đủ trong `\text{}`); (4) bỏ mô tả biến lặp dưới ô nhập, giữ ở bảng biến.
- **Vá hai lỗ hổng cửa gác** nêu ở cuối file: `constants-gate.test.ts` nay lần được hằng số đọc qua
  hàm phụ dùng chung (`khoaTheoHamPhu`) — đã đột biến thử, nó đỏ đúng 4 khoá của `loi-nhuan-rong`;
  và `loi-nhuan-rong` khai đủ `usesConstants`.

`npm run check` xanh sau khi áp: **107 file test / 2572 test**, lint và typecheck sạch,
`gen:summaries` không lệch.

## Yêu cầu và phạm vi

> "xác định đúng sai của tất cả công thức + cách giải thích cho người mới"

Hai việc: (1) phần **toán** của 111 công thức — `latex`/`expression`/`calc` có khớp định nghĩa
chuẩn không, mã cảnh báo có đúng tình huống không (FR-06); (2) khối **"Giải thích cho người mới"**
(4 mục: _Công thức này nói lên điều gì · Khi nào dùng · Cách đọc kết quả · Sai lầm thường gặp_) —
chủ dự án chỉ đích danh: nhiều đoạn không bám đúng câu hỏi của tiêu đề mục nó đứng trong, nặng nhất
ở "Cách đọc kết quả".

Đây là lượt rà **thứ ba** trên phần diễn giải, sau Đợt 5 (cửa gác cơ học `prose-audit.test.ts`) và
Đợt 11 (2 tiêu chí hẹp → 5 lỗi). Khác hai lượt trước ở hai điểm: (a) lần đầu tiên phần **toán** được
kiểm bằng một bản tính **độc lập**, không đọc `calc`, thay vì chỉ tin `spec.tests`; (b) lần đầu có
một **chuẩn tường minh** cho "đúng tiêu đề", áp cho cả 444 đoạn thay vì đọc cảm tính.

## Chuẩn "đúng tiêu đề" — thước đo cho 4 mục

| Mục (tiêu đề trên màn)        | Phải trả lời                                                                                                                                   | Không được là                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Công thức này nói lên điều gì | Con số kết quả đo / cho biết điều gì, bằng lời đời thường                                                                                      | cách tính, khi nào dùng, lưu ý                                         |
| Khi nào dùng                  | Tình huống / quyết định cụ thể khiến người dùng mở công thức này                                                                               | định nghĩa, vai trò làm đầu vào của công thức khác, lời khuyên mua/bán |
| Cách đọc kết quả              | Đọc **con số kết quả**: một giá trị cụ thể nghĩa là gì (kèm đơn vị); cao/thấp nghĩa là gì; đem so với mốc nào; giá trị đặc biệt (âm, 0, >100%) | cơ chế tính, độ nhạy của đầu vào, bản chất các thành phần              |
| Sai lầm thường gặp            | Sai lầm cụ thể người dùng mắc khi dùng/đọc công thức, và vì sao sai                                                                            | nhắc lại ý nghĩa, lưu ý chung chung                                    |

Nội dung đúng nhưng nằm sai mục thì đề xuất **chuyển** (`moveTo`) sang mục đúng, không vứt.

## Phương pháp

1. **Harness độc lập** (`scratchpad`, không vào repo): với mỗi công thức, một agent viết **bản tính
   tham chiếu** chỉ từ `latex`/`expression`/`variables` (dump đã cắt bỏ `expected`, tên ca test, ghi
   chú ví dụ — không lộ đáp số) và định nghĩa chuẩn (CFA, Damodaran, Brealey–Myers, Wilder,
   Bollinger, luật thuế VN…) — **chưa đọc thân `calc`**. Một driver chạy cả `runFormula()` thật lẫn
   bản tham chiếu trên: ví dụ + mọi ca `spec.tests` (F3), và 400 bộ đầu vào **ngẫu nhiên có hạt
   giống** theo từng `VariableSpec` — kể cả chuỗi giá/OHLCV/VN-Index/dòng tiền khi công thức cần
   (F4). Bản tham chiếu lần đầu được băm và đóng băng (`.v1.mjs`) trước khi agent đọc `calc` để chẩn
   đoán chỗ lệch — sửa gì sau đó đều phải ghi lý do.
2. **11 lô rà song song** (chia theo file nhóm công thức liên quan), mỗi lô: chạy harness → chỉ khi
   có bằng chứng mới đọc `calc` → rà đủ 4 mục diễn giải theo đúng chuẩn trên → ghi phát hiện kèm
   trích nguyên văn, bằng chứng (phép tính/nguồn/phản ví dụ chạy máy), và câu sửa đề xuất **vi + en**
   đã tự soát qua 8 phép của `src/application/prose-audit.test.ts`.
3. **Phản biện đối nghịch**, chia theo **loại phát hiện** (không theo lô) để cùng một thước đo áp
   dụng nhất quán trên cả 111 công thức: một agent khác cố **bác** từng phát hiện bằng cách tự tính
   lại độc lập, tra nguồn, hoặc chỉ ra đây là một quy ước sản phẩm có chủ đích chứ không phải lỗi.
   Chỉ phát hiện **CONFIRMED** vào báo cáo dưới đây.

## Kết quả

**111/111 công thức có mặt.** Toán: **9 lỗi CONFIRMED** trên 6 công thức (`fcff`, `mo-hinh-gordon`,
`ty-suat-loi-nhuan-tren-gia`, `cvar-lich-su`, `loi-suat-quy-nam-theo-ngay`, `loi-nhuan-rong`) — không
công thức nào cho ra kết quả số sai ở miền dùng thật; cả 9 đều là **mã cảnh báo/chốt chặn sai chỗ**
(chặn nhầm một ca hợp lệ, hoặc từ chối tính mà không đúng lý do) chứ không phải phép tính sai công
thức. Diễn giải: **87/90 phát hiện thô được xác nhận** (3 bị bác — xem mục riêng), trải trên
khoảng một nửa số công thức; phần lớn (35 + 12 = 47) thuộc đúng trọng tâm yêu cầu — lệch tiêu đề 4
mục và thuật ngữ không giải nghĩa.

Hai phát hiện lộ ra **lỗ hổng ở chính cửa gác cơ học** của dự án (không phải lỗi công thức) — xem
mục cuối "Quy ước xác nhận và hai lỗ hổng cửa gác".

---

## Bảng 111 công thức

Cột **4 mục** theo thứ tự Ý nghĩa · Khi nào dùng · Cách đọc · Sai lầm — ✓ đạt, ~ nửa vời (đã bổ sung), ✗ lệch tiêu đề (đã viết lại). **Toán**: ✓ đúng, hoặc số phát hiện F đã CONFIRMED (xem mục chi tiết theo lô ở dưới, cùng số lô).

### Lô 01 — `valuation-dcf.ts` (10 công thức)

| id                     | Toán              | Ý   | Khi | Đọc | Sai | Số phát hiện |
| ---------------------- | ----------------- | --- | --- | --- | --- | ------------ |
| `bien-an-toan`         | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `capm`                 | ✓                 | ✓   | ✓   | ✗   | ✓   | 1            |
| `ddm-hai-giai-doan`    | ✓                 | ~   | ✓   | ✗   | ✓   | 2            |
| `fcfe`                 | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `fcff`                 | SAI — 1 phát hiện | ✓   | ✓   | ✓   | ✓   | 1            |
| `gia-tri-hien-tai`     | ✓                 | ✓   | ✓   | ~   | ✓   | 1            |
| `gia-tri-noi-tai-fcff` | ✓                 | ✓   | ✓   | ✓   | ✓   | 1            |
| `gia-tri-tuong-lai`    | ✓                 | ✓   | ✓   | ~   | ✓   | 1            |
| `mo-hinh-gordon`       | SAI — 1 phát hiện | ✓   | ✓   | ✓   | ✓   | 1            |
| `wacc`                 | ✓                 | ✓   | ✓   | ✓   | ✓   | 1            |

### Lô 02 — `valuation-multiples.ts` (10 công thức)

| id                           | Toán              | Ý   | Khi | Đọc | Sai | Số phát hiện |
| ---------------------------- | ----------------- | --- | --- | --- | --- | ------------ |
| `ev`                         | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `ev-ebitda`                  | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `ev-sales`                   | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `gia-muc-tieu`               | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `ncav-tren-co-phieu`         | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `peg`                        | ✓                 | ✓   | ✓   | ✓   | ~   | 1            |
| `ps`                         | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `so-graham`                  | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `ty-suat-loi-nhuan-tren-gia` | SAI — 1 phát hiện | ✓   | ✓   | ✓   | ✓   | 1            |
| `von-hoa-thi-truong`         | ✓                 | ✓   | ~   | ✓   | ✓   | 1            |

### Lô 03 — `fundamentals.ts + multiples.ts` (13 công thức)

| id                       | Toán | Ý   | Khi | Đọc | Sai | Số phát hiện |
| ------------------------ | ---- | --- | --- | --- | --- | ------------ |
| `bien-loi-nhuan-gop`     | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `bien-loi-nhuan-rong`    | ✓    | ✓   | ✓   | ~   | ✓   | 1            |
| `bvps`                   | ✓    | ✓   | ~   | ✓   | ✓   | 1            |
| `eps-co-ban`             | ✓    | ✓   | ✗   | ✓   | ✓   | 1            |
| `no-tren-von-chu`        | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `pb`                     | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `pe`                     | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `roa`                    | ✓    | ✓   | ✓   | ~   | ✓   | 1            |
| `roe`                    | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `thanh-toan-hien-hanh`   | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `thanh-toan-nhanh`       | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `ty-le-chi-tra-co-tuc`   | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `vong-quay-tong-tai-san` | ✓    | ✓   | ✓   | ✓   | ✓   | —            |

### Lô 04 — `technical-trend.ts` (9 công thức)

| id                       | Toán              | Ý   | Khi | Đọc | Sai | Số phát hiện |
| ------------------------ | ----------------- | --- | --- | --- | --- | ------------ |
| `dong-luong-momentum`    | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `ema-n-phien`            | ✓                 | ✓   | ✓   | ~   | ✓   | 1            |
| `giao-cat-hai-duong-ma`  | ✓                 | ✓   | ✓   | ~   | ✓   | 3            |
| `khoang-cach-gia-so-sma` | ✓                 | ✓   | ✓   | ✓   | ✓   | 1            |
| `macd-duong-chinh`       | SAI — 1 phát hiện | ✓   | ✓   | ✓   | ✓   | 1            |
| `macd-duong-tin-hieu`    | SAI — 1 phát hiện | ✓   | ✓   | ~   | ✓   | 2            |
| `roc-toc-do-thay-doi`    | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `rsi-wilder`             | ✓                 | ✓   | ✓   | ✓   | ✓   | 2            |
| `sma-n-phien`            | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |

### Lô 05 — `technical-volatility.ts` (9 công thức)

| id                      | Toán | Ý   | Khi | Đọc | Sai | Số phát hiện |
| ----------------------- | ---- | --- | --- | --- | --- | ------------ |
| `atr-dao-dong-thuc`     | ✓    | ✓   | ✓   | ~   | ✓   | 1            |
| `dai-bollinger-duoi`    | ✓    | ✓   | ✓   | ✓   | ✓   | 1            |
| `dai-bollinger-tren`    | ✓    | ✓   | ✓   | ✓   | ✓   | 1            |
| `do-bien-dong-lich-su`  | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `do-rong-dai-bollinger` | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `phan-tram-b-bollinger` | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `stochastic-k`          | ✓    | ~   | ✓   | ✓   | ✓   | 1            |
| `ty-le-khoi-luong`      | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `vwap`                  | ✓    | ✓   | ✓   | ✓   | ✓   | 3            |

### Lô 06 — `risk-ratios.ts + risk.ts` (8 công thức)

| id                 | Toán | Ý   | Khi | Đọc | Sai | Số phát hiện |
| ------------------ | ---- | --- | --- | --- | --- | ------------ |
| `beta`             | ✓    | ✓   | ✓   | ✓   | ✓   | 1            |
| `co-lenh-rui-ro`   | ✓    | ✓   | ✓   | ✗   | ✓   | 2            |
| `ty-so-calmar`     | ✓    | ✓   | ✓   | ~   | ✓   | 1            |
| `ty-so-sharpe`     | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `ty-so-sortino`    | ✓    | ✓   | ✓   | ~   | ✓   | 1            |
| `ty-so-thang-thua` | ✓    | ✓   | ✓   | ~   | ✓   | 2            |
| `ty-so-thong-tin`  | ✓    | ✓   | ✓   | ✓   | ✓   | 1            |
| `ty-so-treynor`    | ✓    | ✓   | ✓   | ✓   | ✓   | 1            |

### Lô 07 — `risk-volatility.ts + risk-drawdown.ts` (10 công thức)

| id                             | Toán              | Ý   | Khi | Đọc | Sai | Số phát hiện |
| ------------------------------ | ----------------- | --- | --- | --- | --- | ------------ |
| `bien-do-dao-dong-lon-nhat`    | ✓                 | ✓   | ✓   | ~   | ✓   | 1            |
| `chuoi-phien-giam-dai-nhat`    | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `cvar-lich-su`                 | SAI — 1 phát hiện | ✓   | ✓   | ✓   | ✓   | 1            |
| `do-bien-dong-nam-hoa`         | ✓                 | ✓   | ✓   | ✗   | ✓   | 1            |
| `do-lech-chuan-ban-phan`       | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `do-lech-chuan-loi-suat-phien` | ✓                 | ✓   | ✓   | ✓   | ✓   | 1            |
| `he-so-bien-thien`             | ✓                 | ✓   | ✓   | ~   | ✓   | 1            |
| `sut-giam-hien-tai`            | ✓                 | ✓   | ✓   | ✓   | ✓   | 1            |
| `sut-giam-sau-nhat`            | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `var-lich-su`                  | ✓                 | ✓   | ✓   | ✓   | ✓   | 1            |

### Lô 08 — `performance.ts` (9 công thức)

| id                             | Toán              | Ý   | Khi | Đọc | Sai | Số phát hiện |
| ------------------------------ | ----------------- | --- | --- | --- | --- | ------------ |
| `irr-nien-kim`                 | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `lai-suat-hieu-dung`           | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `loi-suat-nam-hoa`             | ✓                 | ✓   | ✓   | ~   | ✓   | 1            |
| `loi-suat-quy-nam-theo-ngay`   | SAI — 1 phát hiện | ✓   | ✓   | ✓   | ✓   | 1            |
| `loi-suat-thuc`                | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `loi-suat-trung-binh-hinh-hoc` | ✓                 | ✓   | ✓   | ✓   | ~   | 1            |
| `loi-suat-vuot-chuan`          | ✓                 | ✓   | ✓   | ~   | ✓   | 1            |
| `thoi-gian-nhan-doi`           | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `tong-loi-suat-tai-dau-tu`     | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |

### Lô 09 — `fees.ts + returns.ts` (13 công thức)

| id                   | Toán              | Ý   | Khi | Đọc | Sai | Số phát hiện |
| -------------------- | ----------------- | --- | --- | --- | --- | ------------ |
| `cagr`               | ✓                 | ✓   | ✓   | ✗   | ✓   | 1            |
| `gia-hoa-von`        | ✓                 | ✓   | ✓   | ✓   | ✓   | —            |
| `hpr`                | ✓                 | ~   | ✓   | ✓   | ✓   | 2            |
| `loi-nhuan-rong`     | SAI — 1 phát hiện | ✓   | ✓   | ✓   | ✓   | 1            |
| `phi-giao-dich-ban`  | ✓                 | ✓   | ✓   | ✗   | ✓   | 1            |
| `phi-giao-dich-mua`  | ✓                 | ✓   | ✓   | ✗   | ✓   | 2            |
| `phi-luu-ky`         | ✓                 | ✓   | ✓   | ~   | ~   | 2            |
| `roi`                | ✓                 | ✓   | ✓   | ✗   | ✓   | 1            |
| `roi-rong`           | ✓                 | ✗   | ✓   | ✓   | ✓   | 2            |
| `thue-chuyen-nhuong` | ✓                 | ✓   | ✓   | ✗   | ✓   | 1            |
| `thue-co-tuc`        | ✓                 | ✓   | ✓   | ✗   | ✓   | 2            |
| `ty-suat-co-tuc`     | ✓                 | ✓   | ✓   | ~   | ✓   | 1            |
| `xirr`               | SAI — 1 phát hiện | ✓   | ✓   | ✓   | ✓   | 2            |

### Lô 10 — `derivatives.ts + corporate.ts` (9 công thức)

| id                    | Toán | Ý   | Khi | Đọc | Sai | Số phát hiện |
| --------------------- | ---- | --- | --- | --- | --- | ------------ |
| `basis-vn30f`         | ✓    | ✓   | ✓   | ✓   | ✓   | 2            |
| `co-vi-the-phai-sinh` | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `diem-hoa-von`        | ✓    | ✓   | ✓   | ✓   | ✓   | 1            |
| `don-bay-hieu-dung`   | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `don-bay-tong-hop`    | ✓    | ✓   | ✓   | ✓   | ✓   | 1            |
| `gia-ly-thuyet-vn30f` | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `lai-lo-vi-the-long`  | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `lai-lo-vi-the-short` | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `so-hop-dong-toi-da`  | ✓    | ✓   | ✓   | ✓   | ✓   | 1            |

### Lô 11 — `personal.ts + planning.ts` (11 công thức)

| id                       | Toán | Ý   | Khi | Đọc | Sai | Số phát hiện |
| ------------------------ | ---- | --- | --- | --- | --- | ------------ |
| `gia-von-trung-binh-dca` | ✓    | ✓   | ✓   | ✗   | ~   | 3            |
| `gui-quay-vong`          | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `lai-kep`                | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `lai-tien-gui`           | ✓    | ✓   | ✓   | ✗   | ✓   | 1            |
| `lich-tra-no`            | ✓    | ✓   | ✓   | ✓   | ✓   | 1            |
| `rut-truoc-han`          | ✓    | ✓   | ✓   | ~   | ✓   | 1            |
| `so-ky-dca`              | ✓    | ✓   | ✓   | ✓   | ✓   | 2            |
| `thue-tncn-dau-tu`       | ✓    | ✓   | ✓   | ✗   | ✓   | 2            |
| `tiet-kiem-muc-tieu`     | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `tra-gop-goc-deu`        | ✓    | ✓   | ✓   | ✓   | ✓   | —            |
| `tra-gop-nien-kim`       | ✓    | ✓   | ✓   | ✗   | ✓   | 1            |

## Phát hiện đã xác nhận qua phản biện (87)

Mỗi mục: trích nguyên văn hiện tại → vấn đề → bằng chứng → câu sửa đề xuất (vi/en). `severity`: **sai** = sai thật (toán hoặc kiến thức tài chính); **gayHieuNham** = đúng nhưng dẫn người mới hiểu sai; **khoHieu** = đúng nhưng chưa đạt yêu cầu (thuật ngữ không giải nghĩa, lệch tiêu đề nhẹ).

### Lô 01 — `valuation-dcf.ts`

#### `capm`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Beta 1 cho ra đúng mức sinh lợi kỳ vọng của thị trường; beta càng cao thì suất sinh lợi yêu cầu càng lớn — tức chiết khấu càng mạnh."
  - Vấn đề: Cả hai vế nói về ảnh hưởng của ĐẦU VÀO beta lên kết quả, không dạy đọc chính con số %: không nói 13,1% nghĩa là gì, không có đơn vị thời gian (mỗi năm), không có mốc nào để so.
  - Bằng chứng: Tiêu đề mục là 'Cách đọc kết quả'. Vế 'beta càng cao thì … càng lớn' đúng là độ nhạy của đầu vào — thứ mà đường quét ngay dưới đó đã vẽ sẵn. Mốc beta = 1 là mốc đọc tốt nên câu viết lại giữ lại; kiểm bằng claim: 0/300 phản ví dụ. Số trong câu viết lại lấy từ chính khối Ví dụ: 3,5 + 1,2 × 8 = 13,1 và 13,1 − 3,5 = 9,6 điểm phần trăm.
  - Phản biện: Câu gốc toàn nói độ nhạy của beta (đầu vào) chứ không đọc % kết quả; câu sửa dùng đúng số ví dụ đã đọc lại từ spec (13,1% = 3,5+1,2×8, chênh risk-free 9,6 điểm %) và thêm mốc lãi tiết kiệm/trái phiếu Chính phủ đúng như mô tả biến riskFree.
  - **Sửa (vi):** Con số là mức sinh lợi tối thiểu mỗi năm cổ đông nên đòi ở cổ phiếu này: ví dụ trên ra 13,1%/năm, cao hơn lãi suất phi rủi ro 3,5% gần mười điểm phần trăm — đó là phần bù cho rủi ro. Lấy nó so với lãi gửi tiết kiệm hoặc lợi suất trái phiếu Chính phủ; mốc dễ nhớ là beta bằng 1, khi ấy con số ra đúng bằng mức sinh lợi kỳ vọng của cả thị trường.
  - **Sửa (en):** The figure is the minimum annual return a shareholder should demand from this stock: the example gives 13.1%/year, nearly ten percentage points above the 3.5% risk-free rate — that gap is the compensation for risk. Compare it with deposit rates or government bond yields; a handy landmark is a beta of 1, where the figure equals the expected return of the market as a whole.

#### `ddm-hai-giai-doan`

- **T1 · khoHieu** — `explanation.meaning` (Ý nghĩa)

  - Hiện tại: "Tách đời doanh nghiệp làm hai khúc — tăng nhanh rồi ổn định — và cộng giá trị hiện tại của cổ tức cả hai khúc."
  - Vấn đề: Câu trả lời cho tiêu đề 'Công thức này nói lên điều gì' đang là mô tả CÁCH TÍNH (tách rồi cộng), không nói con số kết quả là gì — người mới đọc xong vẫn không biết 40.506,6 ₫ hiện trên màn là đại lượng gì.
  - Bằng chứng: Đối chiếu ngay trong lô: mo-hinh-gordon.meaning nói thẳng con số ('…đáng giá bao nhiêu tiền ở hôm nay') còn ở đây chủ ngữ của cả câu là thao tác của mô hình. meaning hiện ở HAI chỗ (thẻ công thức và màn chi tiết) nên chỗ lệch này người dùng gặp hai lần.
  - Phản biện: Câu gốc chỉ tả cơ chế tính (tách hai giai đoạn rồi cộng PV), không nói con số kết quả đo cái gì; câu sửa nêu đúng đối tượng (giá một cổ phiếu hôm nay) và không có số cần kiểm thêm.
  - **Sửa (vi):** Một cổ phiếu đáng giá bao nhiêu tiền hôm nay, khi cổ tức được cho là tăng nhanh vài năm đầu rồi mới về mức đều đặn mãi mãi — thay vì đều ngay từ năm đầu.
  - **Sửa (en):** How much one share is worth today when dividends are assumed to grow fast for the first few years before settling into a steady rate forever — instead of growing steadily from year one.

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Phần lớn giá trị thường nằm ở giá trị cuối kỳ, nên g2 và r mới là hai con số đáng soi kỹ nhất."
  - Vấn đề: Cả câu nói về hai ĐẦU VÀO đáng soi, không dạy đọc con số kết quả: không có đơn vị, không nói cao/thấp nghĩa là gì, không có mốc để so (thị giá).
  - Bằng chứng: Tiêu đề mục là 'Cách đọc kết quả'. So với mục cùng tên của hai công thức ra ₫ khác trong lô: mo-hinh-gordon và gia-tri-noi-tai-fcff đều mở đầu bằng phép so với thị giá, chỉ công thức này thì không. Ý 'phần lớn giá trị nằm ở giá trị cuối kỳ' được giữ lại trong câu viết lại và đo được ở bộ số ví dụ: 29.673,75 / 40.506,60 = 73,26%; cảnh báo về g2 gần r vốn đã nằm ở commonMistakes.
  - Phản biện: Câu gốc chỉ nói hai biến đầu vào (g2, r) đáng soi — đúng độ nhạy đầu vào bị cấm ở howToRead; câu sửa đọc đúng số ví dụ (40.506,6 ₫, so với thị giá) và tỷ trọng giá trị cuối kỳ 29.673,75/40.506,60 ≈ 73,3% khớp đúng test đã ghi trong file (tính tay 2.053,57+…+29.673,75=40.506,60).
  - **Sửa (vi):** Con số là giá trị một cổ phiếu theo mô hình — ví dụ trên cho 40.506,6 ₫; cao hơn thị giá là cổ phiếu đang rẻ theo cách tính này, thấp hơn là đang đắt. Nhìn thêm cột 'Giá trị cuối kỳ' trên biểu đồ: ở ví dụ nó chiếm khoảng ba phần tư tổng số, nên con số bạn đọc dựa vào giả định dài hạn nhiều hơn vào mấy năm tăng nhanh.
  - **Sửa (en):** The figure is the value of one share under this model — the example gives 40,506.6 ₫; above the market price the stock looks cheap by this calculation, below it looks expensive. Also look at the 'Terminal value' bar on the chart: in the example it accounts for about three quarters of the total, so the number you read leans more on the long-term assumption than on the fast-growth years.

#### `fcff`

- **F5 · gayHieuNham** — `calc`
  - Hiện tại: "EBIT âm làm khoản EBIT × (1 − thuế suất) hàm ý một khoản hoàn thuế không có thật, kết quả mất ý nghĩa."
  - Vấn đề: Chốt chặn bắt mọi EBIT < 0, nhưng lý do nó nêu chỉ tồn tại khi thuế suất > 0. Ở thuế suất 0% không có khoản hoàn thuế nào trong phép tính, FCFF = EBIT + Khấu hao − CapEx − ΔVLĐ chính là định nghĩa chuẩn — vậy mà công thức vẫn từ chối, kèm một câu giải thích không đúng với bộ số người dùng đang nhập.
  - Bằng chứng: Claim 'fcff.calc.message (thuế suất 0%)': 200/200 mẫu EBIT < 0 với taxRate = 0 đều bị từ chối. Ví dụ {ebit −100, taxRate 0, depreciation 120, capex 180, nwcChange 40}: định nghĩa chuẩn cho −200 tỷ ₫, calc báo lỗi với câu trên. Thuế suất 0% tới được từ thanh trượt (min 0) và là đúng cách Damodaran xử một năm lỗ — bỏ lá chắn thuế chứ không bỏ phép tính. Chính howToRead của công thức này cũng dạy rằ…
  - Phản biện: Đọc trực tiếp valuation-dcf.ts xác nhận chốt chặn là `if (ebit < 0)` không tham chiếu taxRate, trong khi lý do duy nhất công thức nêu trong thông điệp ('EBIT âm làm khoản EBIT × (1 − thuế suất) hàm ý một khoản hoàn thuế không có thật') chỉ đúng khi thuế suất > 0; ở taxRate=0 số hạng suy biến về đún…
  - **Sửa (vi):** Thu hẹp chốt chặn còn 'EBIT âm VÀ thuế suất lớn hơn 0' rồi giữ nguyên thông điệp hiện có — khi thuế suất bằng 0 thì tính bình thường, vì lúc đó số hạng EBIT × (1 − t) không hàm ý khoản hoàn thuế nào. Ca kiểm hiện có (EBIT −100, thuế 20%) vẫn báo lỗi như cũ; thêm ca kiểm {ebit: -100, taxRate: 0, depreciation: 120, capex: 180, nwcChange: 40} với expected: -200. Nếu chủ dự án muốn giữ chốt chặn rộng vì lý do khác, thì phải viết lại thông điệp vì ở thuế 0% nó đang nêu một nguyên nhân không có thật.
  - **Sửa (en):** Narrow the guard to 'EBIT is negative AND the tax rate is above 0' and keep the existing message — with a zero tax rate the calculation should run as normal, because the EBIT × (1 − t) term then implies no tax refund at all. The existing test (EBIT −100, tax 20%) still fails as before; add a test {ebit: -100, taxRate: 0, depreciation: 120, capex: 180, nwcChange: 40} expecting −200. If the broad guard is deliberately kept for another reason, the message needs to be rewritten, since at a zero tax rate it currently states a cause that does not exist.

#### `gia-tri-hien-tai`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Tỷ lệ chiết khấu càng cao hoặc thời gian càng dài thì giá trị hôm nay càng teo nhỏ — 1 tỷ sau 10 năm với chiết khấu 8% chỉ còn khoảng 463 triệu."
  - Vấn đề: Vế đầu là độ nhạy của hai đầu vào — đúng thứ đường quét ngay dưới đó đã vẽ — nên mục chỉ còn nửa sau làm nhiệm vụ của tiêu đề: có con số nhưng không nói đem so với cái gì để ra quyết định.
  - Bằng chứng: Con số 463 triệu khớp calc (463.193.488,08 ₫, claim 0/1 phản ví dụ). Vế 'thời gian càng dài càng teo nhỏ' còn có ngoại lệ ngay trong miền thanh trượt: ở tỷ lệ chiết khấu 0% giá trị đứng yên chứ không teo — claim bắt 45/400 phản ví dụ, tất cả đều tại rate = 0, mà 0% lại là một ca kiểm chính thức của công thức. Câu viết lại bỏ được cả hai vấn đề.
  - Phản biện: Nửa câu là độ nhạy của hai đầu vào và không có mốc so; câu sửa giữ đúng số 463 triệu (khớp example.expected 463.193.488,08 ₫) và bổ sung đúng mốc còn thiếu (giá phải trả hôm nay để có khoản tương lai đó).
  - **Sửa (vi):** Con số là số tiền hôm nay tương đương với khoản tiền tương lai: 1 tỷ ₫ nhận sau 10 năm, chiết khấu 8%/năm, chỉ đáng khoảng 463 triệu ₫ ở hôm nay. Hãy đem nó so với cái giá phải trả ngay bây giờ để có khoản tiền ấy, hoặc so với một khoản khác đã quy về cùng mốc hôm nay — đó là cách duy nhất để hai khoản tiền ở hai thời điểm so được với nhau.
  - **Sửa (en):** The figure is the amount today that is equivalent to that future sum: 1 billion ₫ received in 10 years, discounted at 8%/year, is worth only about 463 million ₫ today. Compare it with the price you would have to pay right now to secure that sum, or with another amount already brought back to today — that is the only way two amounts at two different dates can be compared.

#### `gia-tri-noi-tai-fcff`

- **P2 · gayHieuNham** — `calc`
  - Hiện tại: "FCFF âm hoặc bằng 0 thì mô hình tăng trưởng đều cho ra giá trị doanh nghiệp âm — không định giá được bằng cách này."
  - Vấn đề: Câu nêu một nguyên nhân sai với đúng nửa trường hợp mà nó tự gọi tên: FCFF bằng 0 cho ra giá trị doanh nghiệp bằng 0, không phải số âm. Người dùng nhập FCFF = 0 đọc xong sẽ tưởng doanh nghiệp của mình có giá trị âm.
  - Bằng chứng: Số học: 0 × (1 + 4%) ÷ (10,7% − 4%) = 0 tỷ ₫, không âm. Lần chạy đầu của driver bắt đúng ca này trong mẫu ngẫu nhiên: {fcff 0, growth 4%, wacc 9,7%, netDebt −630.705,6, shares 523,4} — calc từ chối kèm câu trên, trong khi phần vốn chủ thật ra dương (tiền nhiều hơn nợ). FCFF = 0 tới được cả bằng tay lẫn qua cạnh FR-15 từ công thức FCFF (ví dụ EBIT 200, thuế 20%, khấu hao 50, CapEx 190, ΔVLĐ 20 → 0…
  - Phản biện: Đọc thẳng calc: enterpriseValue = fcff×(1+g)/((wacc-g)/100), nên fcff=0 cho ra 0 tỷ (không âm) trong khi thông điệp MEANINGLESS khẳng định 'FCFF bằng 0 ... cho ra giá trị doanh nghiệp âm', sai với đúng nhánh nó tự mô tả.
  - **Sửa (vi):** FCFF bằng 0 hoặc âm thì mô hình tăng trưởng đều cho ra giá trị doanh nghiệp bằng 0 hoặc âm — không còn gì để chia cho cổ đông, nên cách này không định giá được.
  - **Sửa (en):** A zero or negative FCFF makes the steady-growth model produce an enterprise value of zero or below — nothing is left to divide among shareholders, so this method cannot value the company.

#### `gia-tri-tuong-lai`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Thời gian là biến mạnh nhất — 100 triệu ở mức 10%/năm thành gần 418 triệu sau 15 năm, và hơn 670 triệu nếu chờ thêm 5 năm nữa."
  - Vấn đề: Mở đầu bằng so sánh sức mạnh giữa các ĐẦU VÀO, rồi chỉ đưa hai con số mà không nói con số ấy là gì và đem so với cái gì — người mới không biết phải làm gì với '418 triệu' ngoài việc trầm trồ.
  - Bằng chứng: Hai con số đều khớp calc (417.724.816,94 và 672.749.994,93 — claim 0/1 phản ví dụ), nên chỉ cần giữ số và đổi nhiệm vụ của câu. Vế 'thời gian là biến mạnh nhất' cũng không đúng khắp miền: ở tỷ suất 0% thêm năm không đổi gì, ở tỷ suất âm thêm năm làm con số nhỏ đi. Câu viết lại không lặp lại ý 'gấp hơn 4 lần' đã có ở example.note ngay bên dưới.
  - Phản biện: Câu gốc mở đầu bằng so sánh độ nhạy giữa các đầu vào rồi không cho mốc so; tự chạy lại calc xác nhận cả hai số của câu sửa đúng (417.724.816,94 ở 15 năm và 672.749.994,93 ở 20 năm — verify-t1.mjs in ra đúng khớp), và câu sửa thêm mốc mục tiêu cá nhân còn thiếu.
  - **Sửa (vi):** Con số là số tiền bạn sẽ có ở cuối kỳ nếu mức sinh lợi giả định giữ nguyên suốt thời gian đó: 100 triệu ₫ để yên 15 năm ở 10%/năm thành gần 418 triệu ₫. Đem nó so với mục tiêu bạn đặt cho mốc thời gian ấy — còn thiếu thì thử lại với vốn ban đầu lớn hơn hoặc thời gian dài hơn, chờ thêm 5 năm nữa con số đã lên hơn 670 triệu ₫.
  - **Sửa (en):** The figure is what you would hold at the end of the period if the assumed return holds throughout: 100 million ₫ left alone for 15 years at 10%/year becomes nearly 418 million ₫. Compare it with the target you set for that date — if it falls short, try again with a larger starting amount or a longer horizon; waiting another 5 years already takes the figure past 670 million ₫.

#### `mo-hinh-gordon`

- **F5 · gayHieuNham** — `calc`
  - Hiện tại: "return ok((v('dividend') \* (1 + g / 100)) / ((r - g) / 100), '₫');"
  - Vấn đề: Cổ tức vừa trả D0 = 0 (doanh nghiệp chưa trả cổ tức — rất phổ biến ở cổ phiếu tăng trưởng) cho ra kết quả '0 ₫' trình bày như một mức giá cổ phiếu, thay vì báo rằng mô hình cổ tức không định giá được doanh nghiệp không trả cổ tức.
  - Bằng chứng: Claim 'mo-hinh-gordon calc (FR-06, D0 = 0)': 200/200 phản ví dụ, calc luôn ra value 0, unit '₫' — ví dụ {dividend 0, growth 8,4%, requiredReturn 17,4%} → 0 ₫. Ô nhập cho phép (min 0). Hệ quả trên chuỗi FR-15: bien-an-toan nhận intrinsic = 0 rồi báo 'Chưa tính được biên an toàn vì giá trị nội tại bằng 0' — sai nguyên nhân, người dùng đi sửa ô giá trị nội tại chứ không biết là mô hình không áp dụng…
  - Phản biện: Đọc trực tiếp valuation-dcf.ts xác nhận calc chỉ chặn r=g (DIVIDE_BY_ZERO) và r<g (MEANINGLESS), không có chốt nào cho dividend=0, nên D0=0 luôn lọt qua tới ok((0\*(1+g/100))/((r-g)/100),'₫') = ok(0,'₫') và hiện như một mức giá thật; đây là ca thật (0 là min hợp lệ của ô nhập D0, đúng giá trị một cổ…
  - **Sửa (vi):** Thêm một chốt chặn trước phép chia: khi cổ tức vừa trả (D0) bằng 0 thì trả fail(MEANINGLESS) với thông điệp 'Cổ tức vừa trả bằng 0 thì không có dòng cổ tức nào để chiết khấu — cách này không định giá được doanh nghiệp chưa trả cổ tức.' và gợi ý sửa 'Nhập cổ tức tiền mặt 12 tháng gần nhất, hoặc dùng một cách định giá dựa trên dòng tiền nếu doanh nghiệp chưa trả cổ tức.'; thêm ca kiểm {dividend: 0, growth: 5, requiredReturn: 12} với expected: null và expectedWarning: 'MEANINGLESS'.
  - **Sửa (en):** Add a guard before the division: when the most recent dividend (D0) is 0, return fail(MEANINGLESS) with the message 'A most recent dividend of 0 leaves no dividend stream to discount — this method cannot value a company that pays no dividend.' and the fix line 'Enter the cash dividend of the last 12 months, or use a cash-flow based method if the company pays no dividend.'; add a test {dividend: 0, growth: 5, requiredReturn: 12} with expected: null and expectedWarning: 'MEANINGLESS'.

#### `wacc`

- **P2 · gayHieuNham** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Nợ vay nhiều làm WACC thấp đi nhưng rủi ro tài chính tăng lên — con số này không phản ánh vế rủi ro đó."
  - Vấn đề: Nói không điều kiện rằng thêm nợ thì WACC giảm. Chỉ đúng khi lãi vay SAU THUẾ còn rẻ hơn chi phí vốn chủ; hai thanh trượt của chính màn này cho phép ngược lại, và khi ấy thêm nợ làm WACC TĂNG — người mới kéo thanh nợ lên sẽ thấy con số đi ngược câu vừa đọc.
  - Bằng chứng: Claim 'wacc.explanation.howToRead': 192/600 phản ví dụ. Ca dựng tay, tái lập được trên màn bằng đúng bộ mặc định: Re 3,5% (chính là CAPM với beta 0 và Rf 3,5%), Rd 12%, thuế 20% → lãi vay sau thuế 9,6% đắt hơn vốn chủ 3,5%; vốn chủ 600, nợ 400 → WACC 5,94%, giữ nguyên vốn chủ và nâng nợ lên 900 → WACC 7,16%.
  - Phản biện: Tính tay xác nhận: giữ equity=600 và nâng debt 400→900 với Re=3,5% (CAPM beta 0) và Rd sau thuế 9,6% (>Re) làm WACC TĂNG từ 5,94%→7,16%, ngược hẳn câu 'nợ vay nhiều làm WACC thấp đi' viết vô điều kiện.
  - **Sửa (vi):** Dự án chỉ tạo giá trị khi sinh lợi vượt WACC. Thêm nợ chỉ kéo WACC xuống chừng nào lãi vay sau thuế còn rẻ hơn chi phí vốn chủ — và ngay cả khi rẻ hơn thì rủi ro tài chính vẫn tăng, phần rủi ro ấy con số này không phản ánh.
  - **Sửa (en):** A project only creates value when its return exceeds WACC. Adding debt pulls WACC down only for as long as after-tax interest stays cheaper than the cost of equity — and even when it is cheaper, financial risk still rises, a side this figure does not capture.

### Lô 02 — `valuation-multiples.ts`

#### `peg`

- **P2 · gayHieuNham** — `explanation.commonMistakes` (Sai lầm thường gặp)
  - Hiện tại: "PEG nhạy với g hơn với P/E, dự phóng sai vài điểm phần trăm là kết luận đảo chiều."
  - Vấn đề: Mệnh đề so sánh độ nhạy không có cơ sở toán học: PEG = P/E ÷ g là một tỷ số đơn nên độ co giãn theo P/E và theo g luôn bằng nhau về độ lớn (±1), không phụ thuộc giá trị của P/E hay g.
  - Bằng chứng: claim peg.explanation.commonMistakes trong driver lô 02: tăng P/E thêm 5% và tăng g thêm 5% (mẫu cố tình lấy P/E = 20..200, g = 1..16, tức P/E lớn hơn g nhiều lần — vùng mệnh đề dễ đúng nhất nếu nó đúng) — 600/600 phản ví dụ, độ dịch chuyển PEG từ phía P/E không hề nhỏ hơn phía g. Xem AUDIT/diff-out/02.json, mục claims.
  - Phản biện: PEG = P/E ÷ g là tỷ số đơn nên độ co giãn theo P/E và theo g luôn bằng nhau về độ lớn (±1) bất kể giá trị P/E hay g — không có cơ sở toán nào để nói 'nhạy với g hơn'; câu sửa giữ đúng ý (g là dự phóng bất định) mà bỏ so sánh độ nhạy sai.
  - **Sửa (vi):** Dùng con số tăng trưởng quá lạc quan — g là một dự phóng, không chắc chắn như P/E vốn tính từ số liệu đã có, nên sai lệch vài điểm phần trăm ở g dễ kéo PEG lệch xa kết luận ban đầu.
  - **Sửa (en):** Using an overly optimistic growth figure — g is a forecast, less certain than P/E which is computed from data already on hand, so an error of a few percentage points in g can easily pull PEG far from the original conclusion.

#### `ty-suat-loi-nhuan-tren-gia`

- **F2 · gayHieuNham** — `calc`
  - Hiện tại: "Tỷ suất lợi nhuận trên giá không có ý nghĩa khi doanh nghiệp không có lãi."
  - Vấn đề: EPS ≤ 0 bị chặn thành MEANINGLESS, nhưng earnings yield (E/P) là TỶ LỆ ĐƠN (EPS ÷ Giá), không phải bội số nghịch đảo như P/E — theo chuẩn (Damodaran), nó vẫn tính được và có nghĩa khi lỗ (ra % âm); đây chính là một lý do E/P hay được dùng thay P/E khi mẫu so sánh có công ty lỗ. Việc chặn còn tự mâu thuẫn với whenToUse/howToRead của chính công thức này, vốn đang dạy so sánh trực tiếp tỷ suất này với lãi suất tiết kiệm — đúng lúc công ty lỗ (tỷ suất âm, thấp hơn hẳn lãi suất tiết kiệm) là tình huống người mới cần thấy nhất thì bị chặn mất.
  - Bằng chứng: driver lô 02, ca test 'doanh nghiệp không có lãi thì tỷ suất vô nghĩa' + random 92/400 mẫu CALC_REFUSES — xem AUDIT/diff-out/02.json
  - Phản biện: Đọc trực tiếp valuation-multiples.ts xác nhận calc chặn `eps <= 0` → MEANINGLESS, nhưng E/P = EPS ÷ Giá × 100 là một TỶ SỐ ĐƠN (không phải bội số nghịch đảo như P/E), giữ nguyên dấu và vẫn tính được, có nghĩa khi EPS âm (đúng lý do kinh điển E/P được ưa dùng hơn P/E cho mẫu có công ty lỗ — CFA/Damo…
  - **Sửa (vi):** Bỏ điều kiện chặn eps ≤ 0 trong calc; chỉ giữ chặn giá = 0 (chia cho 0). Khi EPS âm, trả về tỷ suất âm hợp lệ (đơn vị %) — số âm tự nó truyền tải đúng thông điệp doanh nghiệp đang lỗ trên mỗi cổ phiếu, đúng công thức đã đăng ký (EPS ÷ Giá × 100) vốn không có ràng buộc dấu. Cập nhật ca kiểm hiện có 'doanh nghiệp không có lãi thì tỷ suất vô nghĩa' (eps: -1.200, price: 92.000) từ expectedWarning MEANINGLESS sang expected khoảng -1,30. Nếu vẫn muốn giữ cảnh báo vì lý do sư phạm, nên đổi thông điệp thay vì gọi là 'vô nghĩa' — giải thích số âm nghĩa là gì — để không mâu thuẫn với whenToUse/howToRead hiện có.
  - **Sửa (en):** Remove the eps ≤ 0 guard in calc; keep only the price = 0 (division by zero) guard. When EPS is negative, return the valid negative yield (in %) — the negative sign itself correctly conveys that the company is losing money per share, matching the registered formula (EPS ÷ Price × 100), which carries no sign restriction. Update the existing test 'doanh nghiệp không có lãi thì tỷ suất vô nghĩa' (eps: -1,200, price: 92,000) from expectedWarning MEANINGLESS to an expected value of about -1.30. If the warning is kept for pedagogical reasons, reword it instead of calling it 'meaningless' — explain what a negative result means — so it does not contradict the existing whenToUse/howToRead sections.

#### `von-hoa-thi-truong`

- **T1 · khoHieu** — `explanation.whenToUse` (Khi nào dùng)
  - Hiện tại: "Xếp cỡ doanh nghiệp — vốn hoá lớn, vừa, nhỏ — và làm đầu vào cho EV cùng các bội số so sánh."
  - Vấn đề: Nửa sau câu nói vai trò làm đầu vào cho công thức khác (EV, các bội số so sánh) — đúng loại nội dung mục 'Khi nào dùng' phải tránh theo thước đo đã chốt, vì không trả lời câu hỏi 'khi nào chính người dùng mở màn này', mà mô tả sơ đồ tính toán nội bộ của ứng dụng.
  - Bằng chứng: đối chiếu thước đo 4 mục trong BRIEF.md: whenToUse 'Không phải: định nghĩa, vai trò làm đầu vào của công thức khác, lời khuyên mua/bán'
  - Phản biện: Nửa câu 'làm đầu vào cho EV cùng các bội số so sánh' là đúng loại nội dung bị loại trừ khỏi whenToUse theo thước đo BRIEF; câu sửa nêu hai tình huống thật (tìm hiểu mã lạ, cân đối tỷ trọng theo vốn hoá) và không còn nhắc vai trò đầu vào của công thức khác.
  - **Sửa (vi):** Khi mới tìm hiểu một cổ phiếu lạ, hoặc muốn cân đối danh mục theo tỷ trọng vốn hoá lớn, vừa, nhỏ phù hợp khẩu vị rủi ro của bản thân.
  - **Sửa (en):** When first researching an unfamiliar stock, or wanting to balance a portfolio across large-, mid-, and small-cap weights to match your own risk appetite.

### Lô 03 — `fundamentals.ts + multiples.ts`

#### `bien-loi-nhuan-rong`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Biên ròng mỏng nghĩa là chỉ cần chi phí nhích nhẹ là lợi nhuận bốc hơi; biên dày cho doanh nghiệp sức chịu đựng tốt hơn khi thị trường xấu."
  - Vấn đề: Giải thích hệ quả của biên mỏng/dày nhưng không cho mốc nào để biết một con số cụ thể là mỏng hay dày — đúng ca 'howToRead không có mốc so' mà BRIEF.md nêu làm ví dụ của mức nuaVoi.
  - Bằng chứng: Thước đo howToRead yêu cầu 'đem so với mốc nào'; toàn đoạn không so với ngành, kỳ trước hay một ngưỡng % nào, trong khi commonMistakes của chính công thức này lại dùng đúng mốc ngành (bán lẻ vài phần trăm so với phần mềm vài chục phần trăm) để minh hoạ — cho thấy mốc cần thiết nhưng bị đặt lạc sang mục khác.
  - Phản biện: Câu gốc nói đúng hệ quả mỏng/dày nhưng thiếu mốc ngành mà chính commonMistakes cùng màn đang minh hoạ bằng số; đúng mức nuaVoi nên câu sửa giữ nguyên câu gốc và bổ sung câu nêu mốc còn thiếu, không lặp số của commonMistakes.
  - **Sửa (vi):** Biên ròng mỏng nghĩa là chỉ cần chi phí nhích nhẹ là lợi nhuận bốc hơi; biên dày cho doanh nghiệp sức chịu đựng tốt hơn khi thị trường xấu. Mức 'mỏng' hay 'dày' phụ thuộc vào ngành, nên chỉ nên so sánh biên ròng giữa các doanh nghiệp cùng lĩnh vực hoặc so với chính doanh nghiệp đó ở các kỳ trước.
  - **Sửa (en):** A thin net margin means a small uptick in costs can wipe out profit; a thick margin gives a company more resilience when the market turns bad. What counts as 'thin' or 'thick' depends on the industry, so only compare net margin across companies in the same field, or against the same company's own prior periods.

#### `bvps`

- **T1 · gayHieuNham** — `explanation.whenToUse` (Khi nào dùng)
  - Hiện tại: "Là mẫu số của P/B, và là mốc so sánh khi thị giá rơi sâu."
  - Vấn đề: Nửa đầu câu nêu vai trò làm mẫu số của P/B — đúng mẫu bị loại trừ của mục 'Khi nào dùng'; chỉ nửa sau ('mốc so sánh khi thị giá rơi sâu') là một tình huống thật.
  - Bằng chứng: Thước đo 4 mục ở BRIEF.md loại trừ 'vai trò làm đầu vào của công thức khác' khỏi whenToUse; 'mẫu số của P/B' đúng mẫu đó.
  - Phản biện: Nửa đầu 'mẫu số của P/B' đúng mẫu bị cấm; nửa sau đã có tình huống thật nên đúng mức nuaVoi, câu sửa giữ và mở rộng đúng phần thiếu mà không thêm số sai.
  - **Sửa (vi):** Khi thị giá rơi sâu hoặc cổ phiếu bị bán tháo, dùng làm mốc so sánh xem thị trường đang định giá doanh nghiệp thấp hơn giá trị sổ sách bao nhiêu.
  - **Sửa (en):** When the market price drops sharply or the stock is being sold off, use it as a reference point to see how far below book value the market is pricing the company.

#### `eps-co-ban`

- **T1 · gayHieuNham** — `explanation.whenToUse` (Khi nào dùng)
  - Hiện tại: "Là đầu vào của P/E và của hầu hết phép so sánh lợi nhuận giữa các doanh nghiệp."
  - Vấn đề: Toàn câu chỉ nêu vai trò làm đầu vào của công thức khác (P/E), đúng mẫu bị loại trừ của mục 'Khi nào dùng', không nêu tình huống nào khiến người dùng mở chính EPS.
  - Bằng chứng: Thước đo 4 mục ở BRIEF.md loại trừ rõ 'vai trò làm đầu vào của công thức khác' khỏi whenToUse; câu hiện tại không có nội dung nào khác ngoài vai trò đó.
  - Phản biện: Toàn câu gốc chỉ là vai trò làm đầu vào của P/E — đúng mẫu bị cấm hoàn toàn ở whenToUse, không còn nội dung nào khác; câu sửa nêu đúng tình huống người dùng thật (đọc báo cáo quý/năm, theo dõi xu hướng lợi nhuận mỗi cổ phiếu).
  - **Sửa (vi):** Khi đọc báo cáo tài chính theo quý hoặc theo năm và muốn biết lợi nhuận mỗi cổ phiếu đang tăng hay giảm so với kỳ trước.
  - **Sửa (en):** When reading quarterly or annual financial reports and wanting to see whether profit per share is rising or falling compared with the previous period.

#### `roa`

- **T1 · gayHieuNham** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "ROA thấp hơn ROE là bình thường vì tài sản luôn lớn hơn vốn chủ; khoảng cách càng rộng thì doanh nghiệp vay nợ càng nhiều."
  - Vấn đề: Chỉ dạy đọc ROA bằng cách so với ROE, bỏ sót mốc so sánh quan trọng hơn — trung bình ngành — mà chính commonMistakes của công thức này thừa nhận là cần thiết; đồng thời 'tài sản luôn lớn hơn vốn chủ' không đúng khi nợ phải trả bằng 0 (lúc đó tài sản bằng vốn chủ, ROA = ROE, không phải nhỏ hơn).
  - Bằng chứng: BRIEF.md liệt kê 'trung bình ngành' là một mốc so sánh chuẩn của howToRead; commonMistakes của chính roa viết 'ngân hàng và bán lẻ có mặt bằng ROA hoàn toàn khác nhau' — mốc đó không xuất hiện ở howToRead. Câu sửa đã kiểm bằng claim trong refs/03.mjs (roa.explanation.howToRead), driver báo 0/600 phản ví dụ trên bộ input nhất quán (Tổng tài sản = Vốn chủ + Nợ, Nợ ≥ 0, LNST > 0), kể cả biên Nợ = 0.
  - Phản biện: Câu gốc thiếu mốc ngành mà chính commonMistakes cùng công thức đòi hỏi, và 'tài sản luôn lớn hơn vốn chủ' sai khi Nợ=0 (khi đó Tài sản=Vốn chủ nên ROA=ROE, không phải thấp hơn); câu sửa thêm mốc ngành trước, đổi 'luôn' thành 'thường' và khoanh đúng phạm vi doanh nghiệp có lãi.
  - **Sửa (vi):** So ROA với trung bình ngành là cách đọc đáng tin cậy nhất, vì mỗi ngành cần lượng tài sản khác nhau để tạo ra doanh thu. Trong cùng một doanh nghiệp có lãi, ROA thường thấp hơn ROE vì tổng tài sản bao gồm cả vốn chủ lẫn nợ phải trả — khoảng cách càng rộng thì vay nợ càng nhiều.
  - **Sửa (en):** Comparing ROA with the industry average is the most reliable way to read it, since different industries need different amounts of assets to generate revenue. Within the same profitable company, ROA is usually lower than ROE because total assets include both equity and liabilities — the wider the gap, the more debt the company carries.

### Lô 04 — `technical-trend.ts`

#### `ema-n-phien`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Đọc giống SMA nhưng nhạy hơn: EMA bám sát giá hơn, đổi lại báo nhiễu nhiều hơn ở thị trường đi ngang."
  - Vấn đề: Mục 'Cách đọc kết quả' không dạy đọc con số nào: nó chỉ sang một công thức khác, trong khi mỗi công thức là một URL riêng nên người mở thẳng trang EMA không có gì để đọc kết quả 25.556,86 ₫.
  - Bằng chứng: Cả đoạn không nêu đơn vị, không nêu mốc so (giá đóng cửa phiên cuối), không nói cao/thấp nghĩa là gì — ba phần chính của tiêu đề. Đối chiếu: sma-n-phien.howToRead nêu đủ 'giá nằm trên đường… là xu hướng tăng'. Ví dụ trên chính màn EMA: EMA 25.556,86 ₫ trong khi giá phiên cuối 24.800 ₫, tức giá đã nằm dưới đường — điều mà example.note nói nhưng howToRead thì không.
  - Phản biện: Câu gốc chỉ đẩy người đọc sang trang SMA, không tự đọc được kết quả của chính trang EMA (mỗi công thức là một URL riêng); câu sửa dạy so kết quả với giá đóng cửa phiên cuối, diễn đạt khác với howToRead của sma-n-phien nên không trùng nguyên văn dù cùng quy ước đọc.
  - **Sửa (vi):** Kết quả là một mức giá tính bằng đồng, đọc bằng cách đem so với giá đóng cửa phiên cuối: giá nằm trên EMA và đường dốc lên là đà tăng còn giữ, giá cắt xuống dưới đường là đà đang yếu đi. Vì phiên mới nặng ký hơn nên EMA quay đầu sớm hơn SMA, đổi lại nó cũng đổi chiều theo cả những nhịp nhiễu khi thị trường đi ngang.
  - **Sửa (en):** The result is a price in dong, read by comparing it with the latest closing price: price above the EMA with the line sloping up means the advance is holding, price crossing below means it is fading. Because recent periods carry more weight, the EMA turns sooner than the SMA — and in exchange it also turns on noise while the market moves sideways.

#### `giao-cat-hai-duong-ma`

- **P2 · gayHieuNham** — `explanation.howToRead` (Cách đọc kết quả)

  - Hiện tại: "Hai đường SMA thành phần trả kèm trong kết quả phụ. Hiệu gần 0 nghĩa là hai đường đang chồng nhau, tức thị trường đi ngang và tín hiệu cắt dễ đảo qua đảo lại."
  - Vấn đề: Suy ra 'hiệu gần 0 ⇒ thị trường đi ngang' là sai: hiệu cũng đi qua 0 đúng lúc xu hướng đảo chiều mạnh — tức chính khoảnh khắc chỉ báo sinh ra để bắt — nên người mới sẽ bỏ qua nó như nhiễu đi ngang. Đoạn cũng không dạy đọc con số chính (dấu và đơn vị), phần việc của tiêu đề.
  - Bằng chứng: Claim giao-cat-hai-duong-ma.explanation.howToRead: 8/8 phản ví dụ, tất cả rơi vào cùng một điểm trên CHÍNH chuỗi ví dụ 40 phiên của công thức. Cắt chuỗi tại phiên 30 (bộ mặc định 10/20): SMA10 = 26.975 ₫, SMA20 = 26.937,5 ₫, hiệu +37,5 ₫ — gần 0 tuyệt đối (0,14% thị giá) — trong khi giá đã giảm đúng 150 ₫ mười phiên liên tiếp, từ 27.800 ₫ xuống 26.300 ₫ (−5,4%). Đây là phiên hiệu đổi dấu, tức lần…
  - Phản biện: Tính tay lại đúng trên GIA_40_PHIEN cắt tại phiên 30 (bộ 10/20): SMA10=26.975, SMA20=26.937,5, hiệu +37,5 — gần 0 tuyệt đối — trong khi 10 phiên liền trước đó giá giảm đều -5,4% và phiên 31 hiệu đã đổi dấu (-120), tức hiệu gần 0 xảy ra đúng lúc đảo chiều mạnh chứ không phải lúc đi ngang.
  - **Sửa (vi):** Kết quả tính bằng đồng: dương là đường ngắn đang nằm trên đường dài, âm là nằm dưới, và cả hai đường SMA thành phần đều trả kèm ở phần kết quả phụ. Hiệu gần 0 chỉ nói hai đường đang chồng nhau — có thể vì giá đi ngang, mà cũng có thể vì một nhịp đảo chiều đang diễn ra, nên phải nhìn cả chuỗi giá chứ đừng kết luận từ một con số.
  - **Sửa (en):** The result is in dong: positive means the short line currently sits above the long line, negative means below, and both component SMAs come back in the extra results. A difference near 0 only says the two lines overlap — that can be a sideways market, but it is just as much what a reversal looks like while it happens, so read the price series alongside it rather than concluding from a single number.

- **T3 · gayHieuNham** — `explanation.whenToUse` (Khi nào dùng)

  - Hiện tại: "Khi cần một quy tắc vào lệnh cơ học, không phụ thuộc cảm nhận: mua khi hiệu đổi từ âm sang dương, bán khi ngược lại."
  - Vấn đề: Câu ra thẳng một luật giao dịch cho người đọc ('mua khi…, bán khi…') chứ không mô tả quy ước của chỉ báo — đúng dạng khuyến nghị mua/bán mà CON-11 cấm, và cửa gác prose-audit không bắt vì câu không có chủ ngữ người.
  - Bằng chứng: Đối chiếu ngay trong lô: macd-duong-tin-hieu.whenToUse nói cùng một quy ước theo lối mô tả và không ra lệnh ('MACD cắt lên trên đường tín hiệu là đà chuyển sang tăng'). Chính mục commonMistakes của công thức này lại cảnh báo hậu quả của việc làm theo luật vừa nêu: 'Giao dịch mọi lần cắt trong thị trường đi ngang… phí giao dịch ăn hết phần lãi', nên hai mục đứng cạnh nhau trên một màn đang nói hai…
  - Phản biện: 'Mua khi..., bán khi...' là mệnh lệnh trực tiếp bằng động từ mua/bán, khác về bản chất với câu mô tả quy ước ('đà chuyển sang tăng/giảm') mà chính công thức anh em macd-duong-tin-hieu dùng cho đúng tình huống cắt hai đường tương tự trong cùng file; RA_LENH_CHO_PHEP hiện đang rỗng nên không có miễn …
  - **Sửa (vi):** Khi muốn một mốc cơ học để bám xu hướng thay vì đoán bằng cảm nhận: hiệu đổi từ âm sang dương là lúc đường ngắn vừa cắt lên đường dài, đổi từ dương sang âm là vừa cắt xuống — quy ước đọc tín hiệu của cặp trung bình động là vậy.
  - **Sửa (en):** When you want a mechanical marker for following the trend instead of going by feel: the difference turning from negative to positive is the moment the short line has just crossed above the long one, and the other way round for a downward crossover — that is how a moving-average pair is read by convention.

- **P2 · khoHieu** — `calc: thông điệp cảnh báo chuKyNguoc — gợi ý sửa`
  - Hiện tại: "Đặt Chu kỳ đường ngắn nhỏ hơn Chu kỳ đường dài, ví dụ 12 và 26 phiên."
  - Vấn đề: Gợi ý sửa trên màn Giao cắt hai đường trung bình mách cặp 12 và 26 — cặp của MACD — trái với chính mô tả biến của công thức này và trái với bộ mặc định 10/20 mà màn đang hiển thị.
  - Bằng chứng: Hàm chuKyNguoc() dùng chung cho cả MACD lẫn giao cắt nên câu ví dụ bị dính nguyên của MACD (driver bắt ở ca test 'đường ngắn đặt dài hơn đường dài là đặt ngược' và 30 mẫu ngẫu nhiên). Mô tả biến shortPeriod của công thức này viết 'Cặp quen dùng: 10 và 20 phiên cho ngắn hạn, 50 và 200 cho dài hạn'; defaultValue là 10 và 20.
  - Phản biện: Xác nhận chuKyNguoc() dùng chung cho MACD (mặc định đúng 12/26) và cho giao-cắt-hai-đường-MA (mặc định 10/20, mô tả biến shortPeriod cũng ghi '10 và 20 phiên'), nên câu gợi ý sửa cứng '12 và 26 phiên' trên màn này trái với chính spec/defaults của nó.
  - **Sửa (vi):** Cho chuKyNguoc() nhận thêm cặp số ví dụ theo từng công thức: MACD giữ '12 và 26 phiên', giao cắt hai đường trung bình đổi thành 'ví dụ 10 và 20 phiên' cho khớp bộ mặc định và mô tả biến của chính nó.
  - **Sửa (en):** Give chuKyNguoc() an extra argument for the example pair per formula: MACD keeps '12 and 26 periods', while the moving-average crossover says 'for example 10 and 20 periods', matching its own defaults and variable description.

#### `khoang-cach-gia-so-sma`

- **P2 · gayHieuNham** — `explanation.whenToUse` (Khi nào dùng)
  - Hiện tại: "Khi cân nhắc mua đuổi: giá vừa chạy quá xa khỏi đường trung bình thường có nhịp co về, và ngược lại."
  - Vấn đề: Câu hứa một xu hướng hồi về trung bình ('thường có nhịp co về') như một tính chất của chỉ báo, trong khi con số này không nói gì về chuyện đó — và chính mục 'Sai lầm thường gặp' ngay dưới nói ngược lại.
  - Bằng chứng: Claim khoang-cach-gia-so-sma.explanation.whenToUse: 171/171 phản ví dụ. Chuỗi tăng đều 1%/phiên giữ khoảng cách so với SMA 20 đứng yên ở 9,72–9,75% suốt 60 phiên, không có phiên nào co về; với 0,5%/phiên là 4,79–4,83%. Phản ví dụ driver bắt được: chuỗi 42 phiên D = 14,36%, chuỗi 73 phiên D = 11,43%, chuỗi 89 phiên D = 13,97% — đều không thu hẹp sau 5 phiên. Trên cùng màn, commonMistakes viết 'Mã …
  - Phản biện: Tính tay trên chuỗi tăng đều xác nhận: khoảng cách so với SMA20 đứng yên (không co về) suốt nhiều phiên khi giá trend đều, và chính commonMistakes ngay dưới đã nói mã biến động mạnh lệch 15-20% 'chưa có gì bất thường' — mâu thuẫn trực tiếp với 'thường có nhịp co về'.
  - **Sửa (vi):** Khi cân nhắc mua đuổi một mã vừa chạy nhanh: con số này cho biết giá đang đứng cách đường trung bình bao nhiêu phần trăm, để bạn đối chiếu với mức lệch thường thấy của chính mã đó thay vì ước lượng bằng mắt.
  - **Sửa (en):** When you are weighing whether to chase a stock that has just run: this figure says how many percent price currently stands away from the moving average, so you can hold it against that stock's own usual stretch instead of eyeballing the chart.

#### `macd-duong-chinh`

- **F1 · khoHieu** — `latex`
  - Hiện tại: "MACD = EMA*{12} - EMA*{26}"
  - Vấn đề: Latex viết cứng 12 và 26 trong khi hai chu kỳ là thanh trượt (2–100 và 3–200), nên đặt chu kỳ khác là công thức in trên màn nói một đằng, kết quả tính một nẻo.
  - Bằng chứng: Chạy calc với fastPeriod 3 / slowPeriod 6 trên chuỗi 20 phiên ra 119,62 ₫ (ca test của chính spec) trong khi khối công thức vẫn hiện EMA*{12} − EMA*{26}. Cùng file, giao-cat-hai-duong-ma viết latex tổng quát 'C = SMA*{ngan} - SMA*{dai}' đúng kiểu cần dùng ở đây; expression tiếng Việt cũng đã tổng quát ('EMA chu kỳ nhanh − EMA chu kỳ chậm').
  - Phản biện: Đọc trực tiếp technical-trend.ts xác nhận latex viết cứng 'MACD = EMA*{12} - EMA*{26}' trong khi fastPeriod/slowPeriod là thanh trượt (2–100 / 3–200) và calc dùng đúng v('fastPeriod')/v('slowPeriod') của người dùng; ca test có sẵn trong chính spec (fastPeriod 3, slowPeriod 6 trên chuỗi 20 phiên) ra…
  - **Sửa (vi):** Viết latex tổng quát theo tên chu kỳ thay vì số: EMA chỉ số 'nhanh' trừ EMA chỉ số 'cham', cùng lối viết không dấu như latex của giao-cat-hai-duong-ma. Bộ 12/26 vẫn còn nguyên ở defaultValue và ở mô tả biến ('Bộ tham số kinh điển của Appel là 12 phiên') nên không mất thông tin.
  - **Sửa (en):** Write the latex generically with period names instead of numbers — fast EMA minus slow EMA — in the same unaccented style as the giao-cat-hai-duong-ma latex. The 12/26 set still lives in defaultValue and in the variable description, so nothing is lost.

#### `macd-duong-tin-hieu`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)

  - Hiện tại: "Khoảng cách MACD trừ đường tín hiệu chính là cột histogram quen thuộc, trả kèm trong phần kết quả phụ. Histogram âm và đang doãng ra nghĩa là đà giảm còn mạnh lên."
  - Vấn đề: Cả đoạn dạy đọc histogram — một số phụ — chứ không dạy đọc chính kết quả của công thức: người dùng thấy 25,07 ₫ mà không có câu nào nói con số ấy so với cái gì thì là cao hay thấp.
  - Bằng chứng: Kết quả của công thức là đường tín hiệu (₫), ví dụ trên màn cho 25,07 ₫; mốc so duy nhất có nghĩa là đường MACD (−247,35 ₫ trong cùng ví dụ, trả ở extras.macd) hoặc mốc 0 — không mục nào trong bốn mục nói điều đó. 'Histogram doãng ra' còn đòi hai phiên liên tiếp, trong khi màn chỉ trả một con số tại phiên cuối.
  - Phản biện: Câu gốc chỉ dạy đọc histogram (số phụ), không đọc đường tín hiệu là kết quả chính; tự chạy lại calc thật (verify-t1.mjs) xác nhận đúng signal=25,065 ₫ và extras.macd=−247,348 ₫ ở ví dụ 12/26/9 trên GIA_40_PHIEN, khớp hai số câu sửa dùng.
  - **Sửa (vi):** Đường tín hiệu là một con số tính bằng đồng, chỉ có nghĩa khi đọc kèm đường MACD: MACD nằm trên đường tín hiệu là đà đang nghiêng lên, nằm dưới là đang nghiêng xuống. Hiệu của hai đường chính là cột histogram trả kèm ở phần kết quả phụ — trong ví dụ 12/26/9, đường tín hiệu 25,07 ₫ còn MACD −247,35 ₫ nên histogram âm sâu.
  - **Sửa (en):** The signal line is a figure in dong that only means something read next to the MACD line: MACD above the signal line means momentum is leaning up, below it means leaning down. The gap between the two is the familiar histogram bar, returned in the extra results — in the 12/26/9 example the signal line is 25.07 VND while MACD is −247.35 VND, so the histogram is deeply negative.

- **F1 · khoHieu** — `latex`
  - Hiện tại: "Signal = EMA\_{9}(MACD)"
  - Vấn đề: Latex viết cứng chu kỳ 9 trong khi signalPeriod là thanh trượt 2–100, nên đặt chu kỳ tín hiệu khác là công thức in trên màn không còn là phép tính đang chạy.
  - Bằng chứng: Ca test của chính spec chạy bộ 3/6/3 và ra 146,4859 ₫ trong khi khối công thức vẫn hiện EMA\_{9}. Cùng lỗi dạng với latex của macd-duong-chinh; expression tiếng Việt đã tổng quát ('EMA chu kỳ tín hiệu tính trên chuỗi giá trị MACD').
  - Phản biện: Cùng dạng lỗi với macd-duong-chinh, xác nhận độc lập: latex viết cứng 'Signal = EMA*{9}(MACD)' trong khi signalPeriod là thanh trượt 2–100 và calc dùng v('signalPeriod'); ca test có sẵn (fastPeriod 3 / slowPeriod 6 / signalPeriod 3) ra 146,4859 ₫ trong khi latex trên màn vẫn hiện EMA*{9} — không co…
  - **Sửa (vi):** Viết latex theo tên chu kỳ thay vì số — EMA chỉ số 'tin hieu' lấy trên chuỗi MACD — giữ 9 ở defaultValue và ở mô tả biến (đang nêu rõ bộ mặc định 12/26/9).
  - **Sửa (en):** Write the latex with the period name instead of the number — the signal-period EMA taken on the MACD series — keeping 9 in defaultValue and in the variable description, which already states the default 12/26/9 set.

#### `rsi-wilder`

- **T2 · khoHieu** — `explanation.whenToUse` (Khi nào dùng)

  - Hiện tại: "Khi muốn biết một nhịp tăng hay giảm đã đi quá đà chưa, hoặc khi tìm phân kỳ giữa giá và động lượng."
  - Vấn đề: 'Phân kỳ giữa giá và động lượng' không được giải nghĩa ở bất kỳ đoạn nào trên màn, mà đây là công thức level 'basic' và còn nằm trên kệ 'Công thức dùng hằng ngày' — người mới đọc xong vẫn không biết vế thứ hai nói tình huống gì.
  - Bằng chứng: Dò toàn bộ screenText của rsi-wilder (cả hai chế độ): 'phân kỳ' xuất hiện đúng một lần, chính ở câu này; 'động lượng' cũng chỉ xuất hiện ở đây và không có định nghĩa. Bốn mục diễn giải, mô tả biến, tiêu đề ví dụ và note đều không nhắc lại. Thêm một mệnh đề mô tả hiện tượng là đủ, không cần thuật ngữ mới.
  - Phản biện: Đọc lại toàn bộ spec rsi-wilder trong technical-trend.ts: 'phân kỳ' và 'động lượng' chỉ xuất hiện đúng một lần, ở chính câu này — meaning/howToRead/commonMistakes/variables.period đều không nhắc lại hay giải nghĩa; công thức level 'basic' và isFeatured nên T2 phải xét thuật ngữ này.
  - **Sửa (vi):** Khi muốn biết một nhịp tăng hay giảm đã đi quá đà chưa, hoặc khi giá lập đỉnh mới mà RSI lại lập đỉnh thấp hơn — hiện tượng đó gọi là phân kỳ, dấu hiệu đà tăng đang đuối dần.
  - **Sửa (en):** When you want to know whether an up- or down-move has gone too far, or when price makes a new high while RSI makes a lower high — that pattern is called divergence, a sign that momentum is running out.

- **T3 · khoHieu** — `variables.period.description`
  - Hiện tại: "Wilder dùng 14 phiên. Chuỗi giá phải có ít nhất số phiên này cộng thêm 1 để đủ lợi suất — 15 giá cho RSI 14."
  - Vấn đề: Không chỗ nào trên màn nói kết quả còn phụ thuộc ĐỘ DÀI chuỗi nạp vào, trong khi làm mượt Wilder kéo theo cả phần chuỗi phía trước — người mới nạp 20 phiên rồi so với bảng giá (vài trăm phiên) thấy lệch mà tưởng công thức sai.
  - Bằng chứng: Claim rsi-wilder.explanation.meaning: 134/281 mẫu ngẫu nhiên có \|RSI toàn chuỗi − RSI 15 giá cuối\| > 5 điểm. Đo riêng trên 3.000 chuỗi ngẫu nhiên: trung vị lệch 5,0 điểm, p90 14,9 điểm, tối đa 23,8 điểm — đủ để nhảy qua mốc 70/30 mà cả hai con số đều 'đúng'. Công thức anh em ema-n-phien đã có đúng kiểu ghi chú này ở mô tả biến ('Nạp được gấp ba lần chu kỳ thì phần mồi gần như hết ảnh hưởng').
  - Phản biện: Mô phỏng độc lập (3.000 chuỗi ngẫu nhiên, so RSI tính trên toàn chuỗi 300 phiên với RSI tính trên đúng 15 giá cuối, cùng công thức wilderAverages trong file gốc) ra lệch trung vị 4,96 điểm, p90 12,2, tối đa 28,4 — khớp số lượng cấp độ với evidence gốc (5,0 / 14,9 / 23,8) và đủ để nhảy qua mốc 70/30…
  - **Sửa (vi):** Wilder dùng 14 phiên. Chuỗi giá phải có ít nhất số phiên này cộng thêm 1 để đủ lợi suất — 15 giá cho RSI 14. Cách làm mượt của Wilder còn kéo theo cả phần chuỗi phía trước, nên nạp chuỗi dài ngắn khác nhau thì con số cũng lệch nhau vài điểm.
  - **Sửa (en):** Wilder used 14 periods. The price series must have at least this many periods plus 1 to have enough returns — 15 prices for a 14-period RSI. Wilder's smoothing also carries the earlier part of the series with it, so a longer or shorter series shifts the figure by a few points.

### Lô 05 — `technical-volatility.ts`

#### `atr-dao-dong-thuc`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "ATR là số tiền, không phải phần trăm và không có hướng — ATR cao chỉ nghĩa là biên độ rộng, không nói giá đang lên hay xuống."
  - Vấn đề: Mục "Cách đọc kết quả" không đưa mốc nào để biết 500 ₫ là rộng hay hẹp, mà thước đo duy nhất (chia ATR cho thị giá) lại nằm ở mục "Sai lầm thường gặp"; vế còn lại "ATR cao chỉ nghĩa là biên độ rộng" là định nghĩa lặp lại chính nó.
  - Bằng chứng: Ví dụ trên màn cho ATR = 500 ₫ với giá đóng cửa phiên gần nhất 26.800 ₫ (driver replay ví dụ: calc = 500) → 1,87% thị giá mỗi phiên; người mới đọc xong mục này vẫn không biết 500 ₫ là nhiều hay ít.
  - Phản biện: Câu gốc không cho mốc so (mốc chia-cho-giá nằm ở commonMistakes) nên người mới không biết 500 ₫ là nhiều hay ít; câu sửa thêm đúng phép so 500/26.800 ≈ 1,9%, và 26.800 ₫ là giá phiên cuối thật của BARS_VI_DU (đối chiếu chéo với example.note của stochastic-k dùng chung bộ bars).
  - **Sửa (vi):** ATR là số tiền của một phiên, không phải phần trăm và không có hướng — ATR cao chỉ nói biên độ rộng, không nói giá lên hay xuống. Muốn biết rộng tới đâu thì đem so với thị giá: ATR 500 ₫ trên cổ phiếu 26.800 ₫ là gần 1,9% thị giá mỗi phiên.
  - **Sửa (en):** ATR is a per-session amount in VND, not a percentage, and it has no direction — a high ATR only means a wide range, not that price is rising or falling. To see how wide, compare it with the market price: an ATR of 500 VND on a 26,800 VND stock is close to 1.9% of the price per session.

#### `dai-bollinger-duoi`

- **P2 · khoHieu** — `example.note`
  - Hiện tại: "Giá đóng cửa mới nhất 27.200 ₫ đang nằm gần dải trên, cách dải dưới gần 1.400 ₫."
  - Vấn đề: Khoảng cách thật là 1.435,81 ₫, tức HƠN 1.400 ₫ chứ không phải "gần 1.400 ₫" (trong tiếng Việt "gần X" là chưa tới X).
  - Bằng chứng: 27.200 − 25.764,19 = 1.435,81 ₫, với 25.764,19 chính là con số công thức in ra ngay trên khối Ví dụ (driver: calc = 25.764,187780). Ghi chú ví dụ của `dai-bollinger-tren` dùng đúng chữ "hơn" cho cùng kiểu làm tròn: 805,81 ₫ → "hơn 800 ₫".
  - Phản biện: 27.200 − 25.764,19 = 1.435,81 ₫, tức HƠN 1.400 chứ không phải 'gần 1.400' (chưa tới X); công thức song sinh dai-bollinger-tren dùng đúng chữ 'hơn' cho một khoảng chênh cùng dạng (805,81 ₫ → 'hơn 800 ₫'), xác nhận đây là lỗi chọn từ chứ không phải cách đọc khác.
  - **Sửa (vi):** Giá đóng cửa mới nhất 27.200 ₫ đang nằm gần dải trên, cách dải dưới hơn 1.400 ₫.
  - **Sửa (en):** The latest close of 27,200 VND sits near the upper band, more than 1,400 VND above the lower band.

#### `dai-bollinger-tren`

- **P2 · gayHieuNham** — `explanation.meaning` (Ý nghĩa)
  - Hiện tại: "Ranh giới trên của vùng giá "bình thường": dải tự nở ra khi thị trường động và tự co lại khi thị trường lặng, vì bề rộng của nó chính là độ lệch chuẩn của giá."
  - Vấn đề: Bề rộng dải là 2k lần độ lệch chuẩn (mặc định k = 2 nên bằng 4σ), không phải "chính là" độ lệch chuẩn — câu này mâu thuẫn với dòng `expression` ngay phía trên và với ô nhập k ngay dưới.
  - Bằng chứng: claim dai-bollinger-tren.explanation.meaning: 333/380 phản ví dụ; 47 ca còn lại đều rơi vào k = 0,5 (2k = 1) là trường hợp duy nhất câu này đúng. Ngay bộ số liệu mẫu trên màn: σ = 402,91 ₫ nhưng dải trên − dải dưới = 27.375,81 − 25.764,19 = 1.611,62 ₫, đúng 4σ.
  - Phản biện: Với k mặc định 2, dải trên-dải dưới = 4σ và khoảng cách đường giữa tới dải trên = 2σ — độc lập tính lại khớp đúng ví dụ trên màn (σ=402,91 ₫, dải trên−dải dưới=1.611,62 ₫=4σ), không 'chính là' σ như câu viết, và mâu thuẫn với ô nhập k ngay dưới.
  - **Sửa (vi):** Ranh giới trên của vùng giá "bình thường": dải tự nở ra khi thị trường động và tự co lại khi thị trường lặng, vì khoảng cách từ đường giữa lên tới nó đúng bằng k lần độ lệch chuẩn của giá.
  - **Sửa (en):** The upper boundary of the "normal" price zone: the band widens on its own when the market is volatile and narrows when it is quiet, because its distance from the middle line is exactly k times the standard deviation of price.

#### `stochastic-k`

- **T1 · khoHieu** — `explanation.meaning` (Ý nghĩa)
  - Hiện tại: "Ý tưởng gốc: khi thị trường mạnh, giá đóng cửa có xu hướng nằm gần đỉnh của biên độ gần đây; khi yếu thì nằm gần đáy."
  - Vấn đề: Mục "Công thức này nói lên điều gì" chỉ kể lý lẽ đằng sau chỉ báo mà không nói con số %K ĐO cái gì; câu nói đúng điều đó nằm ở `description`, mà `description` không hiện trên màn chi tiết.
  - Bằng chứng: screenText của cả hai chế độ (basic và advanced) không có khoá `description`; đọc hết khối giải thích, người mới vẫn chưa biết 90,48% trong khối Ví dụ là gì cho tới khi xuống mục "Cách đọc kết quả". `meaning` lại là đoạn được render HAI lần trên màn.
  - Phản biện: meaning chỉ nêu lý lẽ nền chứ chưa nói %K đo cái gì; câu định nghĩa đúng lại nằm ở description, vốn không hiện trên màn chi tiết theo BRIEF — câu sửa đưa đúng câu định nghĩa (gần như nguyên văn description) lên đầu meaning và giữ lý lẽ gốc làm câu sau.
  - **Sửa (vi):** Cho biết giá đóng cửa đang nằm ở đâu trong khoảng cao nhất – thấp nhất của n phiên gần nhất, quy về thang 0–100%. Ý tưởng gốc: thị trường mạnh thì giá đóng cửa nằm gần đỉnh của biên độ, yếu thì nằm gần đáy.
  - **Sửa (en):** Shows where the closing price sits within the highest–lowest range of the last n sessions, on a 0–100% scale. The original idea: when the market is strong the close sits near the top of that range; when weak, near the bottom.

#### `vwap`

- **P1 · sai** — `explanation.meaning` (Ý nghĩa)

  - Hiện tại: "Mức giá mà phần lớn cổ phiếu thực sự đổi chủ trong kỳ — sát với giá vốn bình quân của thị trường hơn là trung bình cộng thông thường."
  - Vấn đề: VWAP là bình quân GIA QUYỀN theo khối lượng, không phải mức giá có nhiều cổ phiếu khớp nhất (thứ đó là đỉnh của phân bố khối lượng theo giá); VWAP thường rơi đúng vào vùng giá gần như không ai khớp. Vế sau của câu mới là câu đúng, nhưng vế đầu là thứ người mới đọc trước.
  - Bằng chứng: claim vwap.explanation.meaning: 480/600 mẫu ngẫu nhiên có DƯỚI một nửa khối lượng khớp ở vùng cách VWAP không quá 1%. Kịch bản bằng số (driver xác nhận, edge "khối lượng dồn trên giá hiện tại"): 8 phiên, 6 triệu CP khớp ở 25.400 ₫ và 2,8 triệu CP ở 25.000–21.000 ₫ → VWAP = 24.041 ₫, trong khi 60% khối lượng đổi chủ ở 25.400 ₫ và KHÔNG phiên nào khớp quanh 24.041 ₫. Người mới tin câu này sẽ coi 24…
  - Phản biện: VWAP là bình quân GIA QUYỀN theo khối lượng, không phải mức giá khớp nhiều nhất (mode); tự dựng phản ví dụ độc lập 2 phiên (90% khối lượng khớp 100, 10% khớp 200 → VWAP=110, lệch hẳn khỏi giá của 90% khối lượng) xác nhận đúng hướng lập luận của finding, khớp với kịch bản 8 phiên (VWAP=24.041 ₫, 60%…
  - **Sửa (vi):** Giá vốn bình quân của cả kỳ: mỗi phiên góp vào theo đúng số cổ phiếu đã khớp, nên phiên giao dịch sôi động kéo con số về phía giá của nó mạnh hơn hẳn phiên ế.
  - **Sửa (en):** The average cost basis for the whole period: every session contributes in proportion to the shares it actually matched, so a heavily traded session pulls the number toward its own price far more than a quiet one does.

- **P1 · gayHieuNham** — `explanation.whenToUse` (Khi nào dùng)

  - Hiện tại: "Khi đánh giá một lần mua bán lớn đã khớp tốt hay xấu so với mặt bằng, hoặc khi tìm vùng giá được nhiều người mua nhất trong kỳ."
  - Vấn đề: Vế sau hứa một việc VWAP không làm được: "vùng giá được nhiều người mua nhất" là đỉnh của phân bố khối lượng theo giá, còn VWAP chỉ là một con số bình quân. Người mới mở công thức này để làm việc đó sẽ nhận sai câu trả lời mà không có gì trên màn báo cho biết.
  - Bằng chứng: Cùng kịch bản đã xác nhận bằng driver: VWAP = 24.041 ₫ nhưng vùng giá đông người mua nhất là 25.400 ₫ (60% khối lượng).
  - Phản biện: Cùng lỗi mean-vs-mode với explanation.meaning, riêng ở vế 'tìm vùng giá được nhiều người mua nhất' — trong kịch bản 8 phiên đã xác nhận, vùng đông người mua nhất là 25.400 ₫ (60% khối lượng) chứ không phải 24.041 ₫ (VWAP), nên lời hứa này công thức không làm được.
  - **Sửa (vi):** Khi đánh giá một lần mua bán lớn đã khớp tốt hay xấu so với mặt bằng của kỳ, hoặc khi cần một mốc giá có tính tới khối lượng thay vì trung bình cộng các phiên.
  - **Sửa (en):** When judging whether a large trade executed well or poorly against the overall level of the period, or when you need a price benchmark that takes volume into account instead of a plain average of sessions.

- **P1 · sai** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Giá hiện tại trên VWAP nghĩa là phần đông người mua trong kỳ đang có lãi; dưới VWAP thì ngược lại."
  - Vấn đề: "Phần đông" là mệnh đề về TRUNG VỊ, còn VWAP là TRUNG BÌNH gia quyền: giá trên VWAP chỉ bảo đảm người mua BÌNH QUÂN đang lãi. Chỉ cần khối lượng dồn về một vùng giá là phần đông người mua đang lỗ trong khi giá vẫn nằm trên VWAP.
  - Bằng chứng: claim vwap.explanation.howToRead: 26/263 ca ngẫu nhiên có giá trên VWAP nhưng dưới một nửa khối lượng đang lãi. Kịch bản bằng số (driver xác nhận): giá hiện tại 25.000 ₫ > VWAP 24.041 ₫, nhưng 60% khối lượng mua ở 25.400 ₫ đang LỖ 400 ₫/CP, chỉ 32% đang lãi và 8% hoà vốn.
  - Phản biện: Giá trên VWAP chỉ bảo đảm người mua BÌNH QUÂN có lãi, không bảo đảm PHẦN ĐÔNG có lãi; tự dựng phản ví dụ độc lập (60% khối lượng khớp giá 130, 40% khớp giá 50 → VWAP=98; giá hiện tại 100 > 98 nhưng 60% khối lượng — phần đông — đang lỗ vì mua ở 130) xác nhận kết luận của câu gốc bị đảo ngược đúng nh…
  - **Sửa (vi):** Giá hiện tại trên VWAP nghĩa là người mua BÌNH QUÂN của kỳ đang lãi, dưới VWAP thì đang lỗ. Chỉ là bình quân thôi: một phiên khối lượng lớn kéo VWAP về phía giá của nó, nên phần đông người mua vẫn có thể đang lỗ dù giá nằm trên VWAP.
  - **Sửa (en):** Price above VWAP means the AVERAGE buyer of the period is in profit; below it, at a loss. On average only: one heavy-volume session pulls VWAP toward its own price, so most buyers can still be under water even when price sits above VWAP.

### Lô 06 — `risk-ratios.ts + risk.ts`

#### `beta`

- **P1 · sai** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Beta âm — cổ phiếu đi NGƯỢC thị trường — hiếm nhưng có thật, thường gặp ở vàng hoặc một số ngành phòng thủ."
  - Vấn đề: Ngành phòng thủ (điện, nước, hàng thiết yếu) có beta DƯƠNG THẤP chứ không âm — câu này còn mâu thuẫn với chính vế trước nó, vế đã xếp 'giữa 0 và 1 là yếu hơn' đúng vào vùng của các ngành đó.
  - Bằng chứng: Bảng beta theo ngành của Damodaran và mọi giáo trình CAPM xếp tiện ích/hàng thiết yếu ở 0,3–0,8, dương. Kịch bản: người mới đọc câu này rồi mua một mã điện/nước để làm lá chắn, chờ nó TĂNG khi thị trường giảm; beta thật khoảng +0,5 nên VN-Index giảm 10% thì mã đó vẫn giảm khoảng 5% — lệch 15 điểm phần trăm so với kỳ vọng +5%. Trong repo, chính ca test 'cổ phiếu đi ngược thị trường' phải dựng chuỗ…
  - Phản biện: Ngành phòng thủ (điện, nước, hàng thiết yếu) có beta DƯƠNG THẤP (khoảng 0,3–0,8 theo dữ liệu ngành của Damodaran và giáo trình CAPM chuẩn), không âm; tự kiểm độc lập kịch bản mua cổ phiếu điện/nước kỳ vọng TĂNG khi VN-Index giảm 10% — với beta thật +0,5 thì cổ phiếu vẫn giảm khoảng 5%, lệch 15 điểm…
  - **Sửa (vi):** Beta trên 1 là biến động mạnh hơn thị trường, giữa 0 và 1 là yếu hơn — vùng của các ngành phòng thủ như điện, nước hay hàng thiết yếu: VN-Index giảm 10% thì một cổ phiếu beta 0,5 vẫn giảm khoảng 5%, chỉ giảm ít hơn chứ không đi ngược. Beta âm, tức cổ phiếu tăng khi thị trường giảm, rất hiếm; gặp beta âm trên một cửa sổ ngắn thì hãy kéo dài cửa sổ trước khi tin.
  - **Sửa (en):** A beta above 1 means the stock swings more than the market, between 0 and 1 means it swings less — where defensive sectors such as utilities and staples sit: if the VN-Index drops 10%, a beta-0.5 stock still drops about 5%, it simply drops less rather than moving the other way. A negative beta, where the stock rises as the market falls, is genuinely rare; if a short window produces one, extend the window before trusting it.

#### `co-lenh-rui-ro`

- **P1 · gayHieuNham** — `explanation.meaning` (Ý nghĩa)

  - Hiện tại: "Khối lượng lớn nhất được phép mua, sao cho nếu giá chạm mức cắt lỗ thì khoản mất đúng bằng mức rủi ro đã định trước."
  - Vấn đề: Công thức chỉ chặn KHOẢN LỖ, không chặn số tiền phải bỏ ra, nên 'khối lượng lớn nhất được phép mua' sai bất cứ khi nào khoảng cắt lỗ hẹp: kết quả có thể đắt hơn cả tài khoản mà màn không cảnh báo gì.
  - Bằng chứng: Claim co-lenh-rui-ro.explanation.meaning: 151/600 phản ví dụ (hạt 20260911). Ngay trên bộ mặc định của màn — vốn 500.000.000 ₫, rủi ro 2%, giá vào 92.000 ₫ — chỉ cần đặt cắt lỗ 91.900 ₫ là ra 100.000 CP, tức 9,2 tỷ ₫, gấp 18,4 lần vốn. Ca i=2 của claim: vốn 558.000.000 ₫, rủi ro 7,7%, vào 55.070 ₫, cắt lỗ 54.960 ₫ → 390.600 CP = 21,51 tỷ ₫ = 38,5 lần vốn.
  - Phản biện: Tính tay độc lập trên đúng bộ mặc định của màn (vốn 500.000.000 ₫, rủi ro 2%, vào 92.000 ₫): đặt cắt lỗ 91.900 ₫ (gap 100 ₫) ra Q=10.000.000/100=100.000 CP, cần 100.000×92.000=9,2 tỷ ₫ = 18,4 lần vốn — công thức chỉ chặn RỦI RO (khoản mất tối đa), không chặn số tiền phải bỏ ra, nên 'khối lượng lớn …
  - **Sửa (vi):** Khối lượng mà nếu giá chạm mức cắt lỗ thì khoản mất đúng bằng mức rủi ro đã định trước. Đây là trần theo RỦI RO, chưa phải trần theo số tiền đang có: khoảng cắt lỗ hẹp có thể cho ra khối lượng đắt hơn cả tài khoản.
  - **Sửa (en):** The quantity for which, if the price hits the stop-loss level, the loss equals exactly the risk you set in advance. This is a ceiling set by RISK, not by the cash you hold: a narrow stop distance can produce a quantity that costs more than the whole account.

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Đặt cắt lỗ càng sát giá vào thì được mua càng nhiều, nhưng cũng càng dễ bị quét khỏi vị thế."
  - Vấn đề: Mục nói về ĐỘ NHẠY của ô nhập chứ không dạy đọc con số kết quả: không nói 1.666,67 CP trên màn phải hiểu thế nào, không nêu mốc nào để đối chiếu — trong khi đây là công thức mức cơ bản, có mặt trên khối 'Công thức dùng hằng ngày' của trang chủ.
  - Bằng chứng: Thước đo bốn mục: 'Cách đọc kết quả' phải dạy đọc con số (một giá trị cụ thể nghĩa là gì kèm đơn vị, cao/thấp ra sao, đem so với mốc nào), KHÔNG phải độ nhạy của đầu vào. Cả câu hiện tại là quan hệ giữa hai ô nhập. Mốc thiếu chính là mốc đã chứng minh ở phát hiện explanation.meaning: khối lượng × giá vào so với vốn tài khoản.
  - Phản biện: Câu gốc là độ nhạy của hai ô nhập (entry/stop), không đọc số kết quả — nghiêm trọng hơn vì đây là công thức basic trên khối 'dùng hằng ngày'; câu sửa đọc đúng 1.666,67 CP làm tròn xuống 1.600 CP (đúng bội 100 như example.note) và bản ghép commonMistakes đọc liền mạch với câu gốc của mục đó.
  - Đề xuất chuyển sang: `explanation.commonMistakes`
  - **Sửa (vi):** howToRead thay bằng: «Con số là khối lượng tối đa của riêng lệnh này: 1.666,67 CP nghĩa là cỡ lệnh dừng ở 1.600 CP sau khi làm tròn xuống bội 100 cổ phiếu. Nhân khối lượng với giá vào rồi so với vốn tài khoản trước khi đặt lệnh — cắt lỗ càng sát giá vào thì số tiền phải bỏ ra càng dễ vượt quá vốn.» — câu độ nhạy cũ chuyển xuống commonMistakes, thành: «Mua theo số tiền chẵn rồi mới nghĩ tới cắt lỗ. Thứ tự đúng là: chọn mức cắt lỗ trước, khối lượng suy ra sau — và đừng kéo cắt lỗ sát giá vào chỉ để được mua nhiều hơn, vì vị thế càng dễ bị quét khỏi thị trường.»
  - **Sửa (en):** howToRead becomes: «The number is the maximum quantity for this one order: 1,666.67 shares means the order stops at 1,600 shares once rounded down to a multiple of 100. Multiply the quantity by the entry price and compare it with your account capital before placing the order — the tighter the stop sits to the entry, the more easily that amount exceeds your capital.» — the old sensitivity sentence moves into commonMistakes, which becomes: «Buying a round amount of money first and only then thinking about the stop-loss. The correct order is: choose the stop-loss level first, and let the quantity follow from it — and do not pull the stop close to the entry just to be allowed a larger size, because the position is then far easier to get stopped out of.»

#### `ty-so-calmar`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Trên 1 nghĩa là lãi một năm đã lớn hơn cú sụt sâu nhất. Nguyên bản Calmar tính trên 36 tháng; cửa sổ chỉ 60 phiên thì phép quy năm phóng đại tử số nên con số dễ đẹp quá mức."
  - Vấn đề: Mục không nói giá trị ÂM nghĩa là gì, dù đó là kết quả bình thường của mọi giai đoạn lỗ và chính spec có ca test ra −2,2904; nửa câu còn lại chỉ nhắc lại cảnh báo thổi phồng đã có nguyên vẹn ở mục Sai lầm thường gặp.
  - Bằng chứng: spec.tests có ca 'chuỗi giảm đều cho tỷ số âm' expected −2,2904, tức màn hoàn toàn có thể hiện −2,29 lần mà không đoạn nào dạy đọc dấu âm. commonMistakes đã viết 'mức sụt giảm sâu nhất nhỏ làm tỷ số bị thổi phồng lên hàng chục lần', trùng ý với vế sau của howToRead.
  - Phản biện: Câu gốc không nói số ÂM nghĩa là gì dù spec.tests có ca 'chuỗi giảm đều' ra hẳn −2,2904; câu sửa thêm hướng đọc số âm (đọc thẳng mức sụt giảm, đừng xếp hạng bằng tỷ số) và giữ đúng số ví dụ 1,95 lần khớp example.expected.
  - **Sửa (vi):** Trên 1 nghĩa là lãi một năm đã lớn hơn cú sụt sâu nhất — ví dụ bên dưới cho 1,95 lần. Số âm nghĩa là cả giai đoạn đang lỗ, khi đó hãy đọc thẳng mức sụt giảm chứ đừng xếp hạng bằng tỷ số. Nguyên bản Calmar tính trên 36 tháng; cửa sổ chỉ 60 phiên thì phép quy năm phóng đại tử số nên con số dễ đẹp quá mức.
  - **Sửa (en):** Above 1 means the annual gain already exceeds the deepest drawdown — the example below gives 1.95. A negative value means the whole period is a loss; read the drawdown itself in that case rather than ranking by the ratio. The original Calmar is computed over 36 months; with a window of only 60 sessions, annualizing inflates the numerator, so the figure can look deceptively good.

#### `ty-so-sortino`

- **P2 · gayHieuNham** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Luôn cao hơn Sharpe của cùng chuỗi nếu các phiên tăng mạnh hơn các phiên giảm."
  - Vấn đề: Chữ 'Luôn' sai khi lợi suất bình quân tụt xuống dưới ngưỡng phi rủi ro: tử số âm thì mẫu số nhỏ hơn kéo Sortino xuống THẤP hơn Sharpe, đúng ngược chiều câu này; hơn nữa mục Sai lầm thường gặp ngay bên dưới lại cấm đem hai tỷ số ra so thẳng.
  - Bằng chứng: Claim ty-so-sortino.explanation.howToRead: 133/593 phản ví dụ (hạt 20260911). Ca i=1: 120 giá, 23 phiên tăng trung bình +2,94% so với 96 phiên giảm trung bình −2,10% (tiền đề của câu đúng), lợi suất bình quân −1,1217%/phiên, σ 1,998% và σ_d 1,898% → Sortino −9,4913 thấp hơn Sharpe −9,0163. Mâu thuẫn nội bộ: commonMistakes viết 'So thẳng Sortino với Sharpe rồi kết luận danh mục tốt hơn — hai thước…
  - Phản biện: Dựng lại ca cụ thể: 23 phiên tăng bình quân +2,94% và 96 phiên giảm bình quân −2,10% (đúng điều kiện 'phiên tăng mạnh hơn phiên giảm') nhưng lợi suất bình quân vẫn âm sâu (~−1,12%/phiên) do tần suất phiên giảm áp đảo, nên σ_d nhỏ hơn σ lại kéo Sortino (−9,49) THẤP hơn Sharpe (−9,02) — ngược hẳn 'Lu…
  - **Sửa (vi):** Đọc theo cùng thang với Sharpe: quanh 1 là khá, trên 2 là tốt, số âm nghĩa là danh mục còn thua ngưỡng phi rủi ro. Khi lợi suất bình quân vượt ngưỡng, Sortino thường cao hơn Sharpe của cùng chuỗi vì mẫu số bỏ qua các phiên tăng; nhưng khi lợi suất tụt dưới ngưỡng thì chính mẫu số nhỏ ấy kéo tỷ số xuống THẤP hơn Sharpe.
  - **Sửa (en):** Read it on the same scale as Sharpe: around 1 is decent, above 2 is good, and a negative value means the portfolio fell short of the risk-free threshold. When the average return clears that threshold, Sortino usually sits higher than the Sharpe ratio for the same series because the denominator ignores rising sessions; but once the return drops below the threshold, that same smaller denominator drags the ratio LOWER than Sharpe.

#### `ty-so-thang-thua`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)

  - Hiện tại: "Đây là tỷ số về BIÊN ĐỘ, không phải về tần suất. Tỷ số 1,2 mà chỉ 30% số phiên tăng thì tổng cuộc vẫn lỗ — phải đọc kèm số phiên tăng và số phiên giảm."
  - Vấn đề: Mục không dạy đọc chính con số kết quả — không nói 1,16 lần trên màn nghĩa là gì, không đưa mốc để so — mà lại mượn nguyên cặp số 1,2 và 30% của mục Sai lầm thường gặp, nên người mới đọc hai mục thấy y hệt nhau.
  - Bằng chứng: commonMistakes ngay bên dưới viết 'tỷ lệ thắng 30% và tỷ số thắng/thua 1,2 vẫn là một chiến lược thua' — cùng ví dụ, cùng kết luận. Kết quả ví dụ của màn là 1,16 lần (calc 1,1589) nhưng không mục nào nói 1,16 lần đọc ra sao, cũng không nêu mốc hoà vốn theo tỷ lệ phiên tăng.
  - Phản biện: Câu gốc không đọc con số 1,16 lần của chính ví dụ, mà mượn nguyên cặp số (1,2 / 30%) đã có ở commonMistakes ngay dưới; câu sửa đọc đúng 1,16 lần (khớp spec.tests 1,1589) và nêu mốc hoà vốn theo tỷ lệ phiên tăng/giảm bằng số mới, không trùng commonMistakes.
  - **Sửa (vi):** Đây là tỷ số về BIÊN ĐỘ, không phải về tần suất: 1,16 lần nghĩa là một phiên tăng lãi trung bình bằng 1,16 lần mức lỗ của một phiên giảm. Mốc để so là số phiên tăng và số phiên giảm: hai bên ngang nhau thì 1 lần là hoà, phiên tăng càng ít thì tỷ số phải càng lớn mới bù lại.
  - **Sửa (en):** This is a ratio of MAGNITUDE, not frequency: 1.16 means the average gain of a rising session equals 1.16 times the average loss of a falling one. The yardstick is the count of rising versus falling sessions: with the two sides equal, 1 is break-even, and the fewer the rising sessions, the larger the ratio has to be to make up for them.

- **P1 · gayHieuNham** — `explanation.commonMistakes` (Sai lầm thường gặp)
  - Hiện tại: "Cần nhân với tỷ lệ thắng mới ra kỳ vọng: tỷ lệ thắng 30% và tỷ số thắng/thua 1,2 vẫn là một chiến lược thua."
  - Vấn đề: Kỳ vọng không phải là tỷ lệ thắng nhân tỷ số: phép nhân đó luôn ra số DƯƠNG nên người làm theo sẽ kết luận ngược hẳn kết luận của chính câu này.
  - Bằng chứng: Với đúng cặp số trong câu: 30% × 1,2 = +0,36, trong khi kỳ vọng thật (lấy mức lỗ bình quân làm 1 đơn vị) là 0,3 × 1,2 − 0,7 × 1 = −0,34, tức lỗ; điểm hoà vốn nằm ở tỷ số (1 − 0,3)/0,3 = 2,33 lần. Claim ty-so-thang-thua.explanation.commonMistakes: 302/600 phản ví dụ (hạt 20260911) — ca i=0: tỷ lệ thắng 52,3%, tỷ số 0,616 → phép nhân ra +0,322 còn kỳ vọng thật là −0,680%/phiên.
  - Phản biện: Tính tay độc lập đúng cặp số nêu trong câu: 30% × 1,2 = +0,36 (dương), trong khi kỳ vọng đúng công thức (lấy mức lỗ bình quân làm 1 đơn vị) là 0,3×1,2 − 0,7×1 = −0,34 (âm) — phép nhân mà câu gốc dạy luôn cho kết quả dương, đảo dấu ngay với chính kết luận 'vẫn là một chiến lược thua' của câu đó; điể…
  - **Sửa (vi):** Coi tỷ số trên 1 là chắc chắn có lãi. Phải cân với tỷ lệ thắng: kỳ vọng bằng tỷ lệ thắng × mức lãi bình quân TRỪ tỷ lệ thua × mức lỗ bình quân, nên với tỷ lệ thắng 30% thì tỷ số phải hơn 2,3 lần mới hoà, còn 1,2 lần vẫn là một chiến lược thua.
  - **Sửa (en):** Assuming a ratio above 1 guarantees a profit. It has to be weighed against the win rate: expectancy equals the win rate times the average gain MINUS the loss rate times the average loss, so at a 30% win rate the ratio must exceed about 2.3 just to break even, and 1.2 is still a losing strategy.

#### `ty-so-thong-tin`

- **P1 · gayHieuNham** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Từ 0,5 trở lên đã là quản lý chủ động tốt theo thang của Grinold & Kahn; trên 1 là hiếm."
  - Vấn đề: Thang 0,5 của Grinold & Kahn đo lợi suất vượt chuẩn trên SAI SỐ BÁM CHUẨN từng phiên, còn con số của màn này chia cho độ lệch chuẩn lợi suất của chính danh mục — hai mẫu số khác nhau nên cùng một danh mục có thể vượt hay trượt mốc 0,5 tuỳ cách chia, và lời đính chính duy nhất lại nằm ở `spec.note`, một trường không render ở đâu.
  - Bằng chứng: Claim ty-so-thong-tin.explanation.howToRead: 311/568 phản ví dụ (hạt 20260911). Ca i=4: 88 giá, chuẩn nhập −11,18%/năm → màn hiện 0,5080 (mẫu số là ĐLC của chính danh mục, 14,82%/năm) trong khi tỷ số thông tin đúng nghĩa trên cùng cặp chuỗi là 0,2748 (sai số bám chuẩn 21,76%/năm): màn gọi 'tốt', tỷ số thật thì không. Ngay bộ ví dụ trên màn cũng vậy — extras.trackingError = 43,788%/năm chính là độ…
  - Phản biện: Mẫu số hiển thị là ĐLC lợi suất của chính danh mục (xác nhận qua calc: deviation = sampleStdDev(returns) trên chuỗi danh mục, không trừ một chuỗi chuẩn thật), khác sai số bám chuẩn thật mà thang 0,5 của Grinold & Kahn dùng làm mốc; tự tính đại số độc lập (σ_p=15%, σ_chuẩn=20%, tương quan 0,3 → sai …
  - **Sửa (vi):** Số âm nghĩa là đi lệch khỏi chuẩn mà vẫn thua chuẩn; càng cao thì phần thắng chuẩn càng đáng với mức biến động phải chịu. Nhưng đừng chấm theo thang quen thuộc của quản lý chủ động: bản rút gọn này nhập chuẩn bằng MỘT con số cả năm nên mẫu số là độ lệch chuẩn lợi suất của chính danh mục chứ không phải sai số bám chuẩn từng phiên. Hãy so với mốc 0 và với chính danh mục ở kỳ trước, nhập theo cùng một cách.
  - **Sửa (en):** A negative value means deviating from the benchmark while still underperforming it; the higher the number, the more the outperformance justifies the volatility borne. But do not score it on the familiar active-management scale: this simplified version takes the benchmark as a SINGLE annual figure, so the denominator is the standard deviation of the portfolio's own returns rather than a session-by-session tracking error. Compare it against 0 and against the same portfolio in an earlier period, entered the same way.

#### `ty-so-treynor`

- **P2 · gayHieuNham** — `variables.beta.description`
  - Hiện tại: "Nhập tay: tính bằng công thức Beta của thư viện này (dán chuỗi giá cổ phiếu), lấy từ bảng dữ liệu công ty chứng khoán, báo cáo quỹ, hoặc trang thống kê của sở giao dịch."
  - Vấn đề: Làm đúng lời chỉ dẫn này thì công thức Beta không ra số: nó cần HAI chuỗi — giá cổ phiếu và VN-Index — chứ không chỉ chuỗi giá cổ phiếu, và mỗi chuỗi phải đủ 60 phiên.
  - Bằng chứng: calc của BETA gọi cả requireCloses(ctx, sessions) lẫn requireMarketCloses(ctx, sessions). Cạnh 'thiếu chuỗi chỉ số' trong refs/06.mjs: chuỗi cổ phiếu 80 giá, không có marketSeries → MISSING_SERIES 'Cần ít nhất 60 phiên giá VN-Index, hiện mới có 0'. Chính spec của Beta cũng có ca test 'chưa nạp chuỗi VN-Index thì chưa hồi quy được, dù cổ phiếu đủ phiên'. Mô tả biến `sessions` của Beta nói đúng ('C…
  - Phản biện: Đọc thẳng calc của BETA: bắt buộc CẢ HAI requireCloses (cổ phiếu) và requireMarketCloses (VN-Index, tối thiểu MIN_SESSIONS=60 mỗi chuỗi), có sẵn ca test 'chưa nạp chuỗi VN-Index thì chưa hồi quy được dù cổ phiếu đủ phiên' → MISSING_SERIES; làm đúng theo lời chỉ dẫn '(dán chuỗi giá cổ phiếu)' trên m…
  - **Sửa (vi):** Nhập tay: tính bằng công thức Beta của thư viện này (cần cả chuỗi giá cổ phiếu lẫn chuỗi VN-Index, mỗi chuỗi tối thiểu 60 phiên), lấy từ bảng dữ liệu công ty chứng khoán, báo cáo quỹ, hoặc trang thống kê của sở giao dịch. Beta 1 nghĩa là biến động ngang thị trường.
  - **Sửa (en):** Enter manually: compute it with this library's Beta formula (it needs both the stock price series and the VN-Index series, at least 60 sessions each), or take it from a brokerage data table, a fund report, or an exchange statistics page. A beta of 1 means volatility in line with the market.

### Lô 07 — `risk-volatility.ts + risk-drawdown.ts`

#### `bien-do-dao-dong-lon-nhat`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Tính theo đáy làm gốc, nên đọc là "từ đáy lên đỉnh tăng bao nhiêu phần trăm". Biên độ rộng nghĩa là vào lệnh sai vùng thì chênh lệch rất lớn."
  - Vấn đề: Nói được gốc tính nhưng không neo vào con số nào và không có mốc so, nên thấy kết quả 8,25% người mới không biết đó là rộng hay hẹp — mà 'rộng' lại chính là điều mục này bảo phải để ý.
  - Bằng chứng: example.expected = 8,2474% và example.note chỉ lặp lại phép tính ('Chênh 8 đơn vị giá trên nền đáy 97'), nên trên cả màn không có chỗ nào nói 8,25% là mức nào.
  - Phản biện: Câu gốc nêu đúng gốc quy đổi (lấy đáy làm gốc) nhưng không neo vào số nào và không cho mốc so; câu sửa đọc đúng 8,25% (khớp example.expected 8,2474) và thêm mốc so với chính mã ở kỳ trước hoặc mã cùng ngành.
  - **Sửa (vi):** Tính theo đáy làm gốc, nên đọc là "từ đáy lên đỉnh tăng bao nhiêu phần trăm": 8,25% nghĩa là đỉnh cao hơn đáy 8,25%. Muốn biết rộng hay hẹp thì so với chính mã đó ở một kỳ trước dài bằng đúng kỳ này, hoặc với một mã cùng ngành trong cùng kỳ — biên độ càng rộng thì vào lệnh lệch vùng càng chênh nhiều.
  - **Sửa (en):** It is computed with the trough as the base, so read it as "how many percent from trough to peak": 8.25% means the peak sits 8.25% above the trough. To judge whether that is wide or narrow, compare it with the same ticker over an equally long earlier period, or with a peer ticker over the same period — the wider the range, the more it costs to enter at the wrong zone.

#### `cvar-lich-su`

- **F5 · gayHieuNham** — `calc (nhánh lossTailOf dùng chung với VaR)`
  - Hiện tại: "if (threshold >= 0) { return meaningless({ vi: 'Trong cửa sổ đang xét, ngay cả nhóm phiên tệ nhất ở mức tin cậy ... vẫn không lỗ, nên không có mức lỗ để đo.' ... }) }"
  - Vấn đề: CVaR dùng chung chốt chặn của VaR. Chốt đó kiểm NGƯỠNG phân vị, còn CVaR đo TRUNG BÌNH PHẦN ĐUÔI — hai đại lượng khác nhau. Khi ngưỡng dương nhưng đuôi vẫn lỗ thật, màn hình từ chối tính và giấu một mức tổn thất kỳ vọng có thật, đúng kiểu 'lỗi không phải lỗi' mà FR-06 muốn tránh theo chiều ngược lại.
  - Bằng chứng: Ca biên 'một phiên sàn giữa 57 phiên tăng' (refs/07.mjs): 61 giá, 60 lợi suất gồm 57 phiên +0,5%, hai phiên −0,05% và một phiên −7%. Phân vị 5% nội suy = +0,4725% → calc trả MEANINGLESS; nhưng đuôi r ≤ ngưỡng gồm đúng ba phiên −7%, −0,05%, −0,05%, trung bình −2,3667%, tức CVaR thật là 2,3667%. Claim dựng theo họ chuỗi này: 376/376 phản ví dụ, với cửa sổ 60–199 lợi suất. Chuỗi ngẫu nhiên: 0/59, nê…
  - Phản biện: Đọc trực tiếp risk-drawdown.ts xác nhận CVAR_LICH_SU.calc gọi cùng lossTailOf() với VAR_LICH_SU và fail ngay khi 'code' in tail, tức khi threshold>=0; tự dựng lại đúng chuỗi 61 giá của finding (57 phiên +0,5%, hai phiên −0,05% ở vị trí 20/30, một phiên −7% ở vị trí 10) và tính tay phân vị 5% với nộ…
  - **Sửa (vi):** Tách điều kiện từ chối của CVaR khỏi điều kiện của VaR: lossTailOf chỉ nên trả về chuỗi lợi suất và ngưỡng, còn mỗi công thức tự quyết. VaR từ chối khi ngưỡng ≥ 0 (giữ nguyên); CVaR tính trung bình phần đuôi trước rồi chỉ từ chối khi trung bình đó ≥ 0 — lúc ấy mới thật sự 'không có mức lỗ để đo'. Thêm ca kiểm cho chuỗi 61 giá nói trên (57 phiên +0,5%, hai phiên −0,05%, một phiên −7%) với expected 2,3667, đồng thời xác nhận ca kiểm cũ 'chuỗi chỉ đi lên' (CHUOI_TANG_DEU_61) vẫn đúng MEANINGLESS dưới điều kiện mới, vì tail toàn số dương thì trung bình cũng dương.
  - **Sửa (en):** Split CVaR's refusal condition from VaR's: lossTailOf should hand back the returns and the threshold and let each formula decide. VaR keeps refusing when the threshold is at or above zero; CVaR should average its tail first and refuse only when that average is at or above zero — only then is there genuinely no loss to measure. Add a test for the 61-price series above (57 sessions at +0.5%, two at −0.05%, one at −7%) with an expected value of 2.3667, and confirm the existing 'all-up series' test (CHUOI_TANG_DEU_61) still returns MEANINGLESS under the new condition, since an all-positive tail still averages positive.

#### `do-bien-dong-nam-hoa`

- **T1 · gayHieuNham** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Nhân với căn bậc hai của số phiên chứ không nhân thẳng số phiên: rủi ro cộng dồn theo căn thời gian, nên 1,4%/phiên thành khoảng 22%/năm chứ không phải 350%."
  - Vấn đề: Mục 'Cách đọc kết quả' đang dạy CƠ CHẾ TÍNH chứ không dạy đọc con số: đọc xong người mới vẫn không biết 22%/năm nghĩa là gì với người đang nắm cổ phiếu, cao hay thấp, đem so với cái gì.
  - Bằng chứng: Cùng ý đã nằm sẵn ở 'Sai lầm thường gặp' ngay dưới ('Nhân độ lệch chuẩn phiên với 250 thay vì với căn bậc hai của 250'), nên mục này không thêm gì mà lại bỏ trống đúng câu hỏi của tiêu đề. Số học trong câu thì đúng: 1,4 × √250 = 22,1 và 1,4 × 250 = 350.
  - Phản biện: Câu gốc là cơ chế tính (căn bậc hai thời gian) trùng ý đã có ở commonMistakes ngay dưới, không đọc mức rủi ro 22%/năm nghĩa là gì với người nắm cổ phiếu; câu sửa đọc đúng số 22%/năm là mức dao động cả năm và thêm mốc so (mã cùng ngành, số biến động quỹ công bố).
  - **Sửa (vi):** Đọc là mức dao động của cả một năm: 22%/năm nghĩa là trong một năm bình thường, giá có thể lệch khoảng 22% so với mức trung bình, lên hoặc xuống. Số càng lớn thì đường giá càng gập ghềnh; muốn biết mức đó là cao hay thấp thì so với một mã cùng ngành trong cùng kỳ, hoặc với con số biến động mà báo cáo quỹ công bố, vì tất cả đều đã quy về cùng đơn vị năm.
  - **Sửa (en):** Read it as a full year's swing: 22%/year means that in a normal year the price can drift about 22% away from its average, up or down. The larger the number, the bumpier the price line; to judge whether that level is high or low, compare it with a peer ticker over the same period, or with the volatility figure a fund report publishes, since all of them are already stated per year.

#### `do-lech-chuan-loi-suat-phien`

- **P2 · gayHieuNham** — `explanation.whenToUse` (Khi nào dùng)
  - Hiện tại: "Khi cần một con số duy nhất để so mức dao động của hai cổ phiếu, hoặc làm đầu vào cho Sharpe và VaR."
  - Vấn đề: VaR duy nhất trong thư viện này là VaR LỊCH SỬ, đọc thẳng phân vị chuỗi lợi suất và không nhận độ lệch chuẩn làm đầu vào, nên câu này dắt người mới tới một màn không có chỗ dùng con số vừa tính.
  - Bằng chứng: var-lich-su.variables chỉ có 'confidence' và 'lookback'; calc gọi percentileLinear(), không gọi sampleStdDev() — risk-drawdown.ts dòng 549-555. Nửa còn lại thì đúng: ty-so-sharpe có σ ở mẫu số (risk-ratios.ts dòng 471).
  - Phản biện: Đọc thẳng var-lich-su: variables chỉ {confidence, lookback}, calc dùng percentileLinear() trên chuỗi lợi suất, không hề nhận hay dùng độ lệch chuẩn — VaR duy nhất của thư viện không có chỗ nào dùng con số vừa tính, trong khi nửa Sharpe của câu thì đúng (sampleStdDev ở mẫu số Sharpe).
  - **Sửa (vi):** Khi cần một con số duy nhất để so mức dao động của hai cổ phiếu trong cùng một kỳ, hoặc khi cần mẫu số cho tỷ số Sharpe và số liệu đầu vào để quy độ biến động về năm.
  - **Sửa (en):** When you need a single number to compare the volatility of two stocks over the same period, or when you need the denominator of the Sharpe ratio and the input for annualizing volatility.

#### `he-so-bien-thien`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Số càng NHỎ càng tốt: mỗi phần lợi suất kiếm được phải trả bằng ít rủi ro hơn. Đây là tỷ số thuần, không có đơn vị."
  - Vấn đề: Có hướng cao/thấp nhưng không dạy đọc một giá trị cụ thể và không cho mốc so, nên nhìn kết quả 3,3382 lần người mới vẫn không biết thế là nhiều hay ít; câu cuối còn nói 'không có đơn vị' trong khi kết quả hiện kèm đơn vị 'lần' ngay cạnh.
  - Bằng chứng: resultUnit của spec là 'lần' và khối Ví dụ in '3.3382 lần'; mục này không nhắc gì tới con số đó. Ý nghĩa thật của 3,3382 nằm ở example.note chứ không nằm trong mục dạy đọc.
  - Phản biện: Câu gốc thiếu mốc so và tự mâu thuẫn ('không có đơn vị' trong khi resultUnit và khối Ví dụ hiện đơn vị 'lần'); câu sửa đọc đúng số 3,3 lần (khớp spec 3,3382, cũng khớp example.note 'hơn ba phần dao động'), bỏ câu sai và thêm mốc so hai mã cùng kỳ.
  - **Sửa (vi):** 3,3 lần nghĩa là mỗi 1% lợi suất bình quân một phiên phải đổi bằng 3,3% dao động. Số càng NHỎ càng tốt, nhưng nó chỉ có nghĩa khi đem so: đo hai mã trên cùng một kỳ, mã nào hệ số thấp hơn thì mỗi phần lãi kèm ít dao động hơn.
  - **Sửa (en):** A value of 3.3 means every 1% of average per-session return is paid for with 3.3% of volatility. The SMALLER the better, but the number only means something in comparison: measure two tickers over the same period, and the one with the lower coefficient carries less volatility per unit of return.

#### `sut-giam-hien-tai`

- **T3 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Muốn về lại đỉnh thì cần lãi 100 ÷ (100 − kết quả) − 1, tức đang chìm 20% phải lãi 25%."
  - Vấn đề: Công thức viết ra cho 0,25 chứ không phải 25: 100 ÷ (100 − 20) − 1 = 0,25. Người mới bấm máy đúng theo chữ sẽ ra 0,25 rồi đọc thành 0,25%, ngược hẳn với vế sau của chính câu đó.
  - Bằng chứng: Tự kiểm: 100/(100−20) − 1 = 0,25 (dạng phân số), còn con số mục này muốn nói là 25 (dạng phần trăm) — hai vế của một câu lệch nhau đúng 100 lần.
  - Phản biện: Tự tính lại: 100 ÷ (100 − 20) − 1 = 0,25, không phải 25 — công thức viết ra trong câu và ví dụ bằng số ngay sau nó lệch nhau đúng 100 lần, một người mới bấm máy đúng theo chữ sẽ ra 0,25 và có thể đọc thành 0,25%, ngược hẳn với 'phải lãi 25%' của chính câu đó.
  - **Sửa (vi):** Số dương nghĩa là đang thấp hơn đỉnh: 10 nghĩa là còn kém đỉnh 10%. Bằng 0 nghĩa là giá vừa lập đỉnh mới của cửa sổ. Mức lãi cần để về lại đỉnh luôn lớn hơn mức đang chìm: chìm 20% phải lãi 25%, chìm 50% phải lãi 100%.
  - **Sửa (en):** A positive number means it is below the peak: 10 means it is still 10% short of the peak. Zero means the price has just set a new peak within the window. The gain needed to climb back to the peak is always larger than the drawdown itself: 20% underwater needs a 25% gain, 50% underwater needs a 100% gain.

#### `var-lich-su`

- **P2 · gayHieuNham** — `calc.warning.message (nhánh ngưỡng phân vị ≥ 0)`
  - Hiện tại: "Trong cửa sổ đang xét, ngay cả nhóm phiên tệ nhất ở mức tin cậy 95% vẫn không lỗ, nên không có mức lỗ để đo."
  - Vấn đề: Thông điệp nói về NHÓM PHIÊN TỆ NHẤT trong khi thứ được kiểm là NGƯỠNG phân vị. Khi ngưỡng dương mà trong cửa sổ vẫn có phiên lỗ nặng, câu này sai sự thật và làm người đọc yên tâm nhầm; câu gợi ý sửa ('mẫu chỉ toàn phiên tăng') cũng sai theo.
  - Bằng chứng: Ca biên 'một phiên sàn giữa 57 phiên tăng' trong refs/07.mjs: 61 giá — 57 phiên +0,5%, hai phiên −0,05%, một phiên −7%. Ngưỡng phân vị 5% nội suy ra +0,4725% nên calc trả MEANINGLESS đúng câu trên, trong khi ba phiên tệ nhất lỗ trung bình 2,3667%. Mẫu ngẫu nhiên: 0/59 lần rơi vào tình huống này, nên hiếm.
  - Phản biện: Dựng lại đúng ca biên (61 giá: 57 phiên +0,5%, 2 phiên −0,05%, 1 phiên −7%): nội suy phân vị 5% = +0,4725% (≥0, kích hoạt MEANINGLESS) nhưng ba phiên tệ nhất lỗ trung bình 2,3667% — thông điệp 'ngay cả nhóm phiên tệ nhất... vẫn không lỗ' sai sự thật vì thứ được kiểm là ngưỡng phân vị nội suy, không…
  - **Sửa (vi):** Đổi thông điệp sang nói đúng thứ đang kiểm: ở mức tin cậy này ngưỡng lỗ của một phiên xấu vẫn là một mức TĂNG, nên không có ngưỡng lỗ để đọc — kèm gợi ý chọn cửa sổ dài hơn, và bỏ mệnh đề 'mẫu chỉ toàn phiên tăng' vì cửa sổ vẫn có thể có phiên giảm. Giữ nguyên nhánh từ chối của VaR.
  - **Sửa (en):** Reword the warning to describe what is actually being checked: at this confidence level the bad-session loss threshold is still a GAIN, so there is no loss threshold to read — keep the suggestion to widen the window, and drop the 'the sample is made up entirely of up sessions' clause, since the window may well contain down sessions. Leave the VaR refusal itself unchanged.

### Lô 08 — `performance.ts`

#### `loi-suat-nam-hoa`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Vì tính theo lãi kép nên kết quả cao hơn phép nhân đơn thuần: 2%/tháng ra 26,8%/năm chứ không phải 24%."
  - Vấn đề: Toàn câu giải thích CƠ CHẾ tính (lãi kép so với nhân đơn thuần) — đúng nội dung bị loại khỏi howToRead theo thước đo 4 mục — chứ không dạy đọc GIÁ TRỊ kết quả: không có mốc so sánh (vd lãi tiết kiệm, dù whenToUse đã gợi ý mốc này) và không nói kết quả âm/cao/thấp nghĩa là gì.
  - Bằng chứng: Đối chiếu thước đo 4 mục ở BRIEF: howToRead 'Không phải: cơ chế tính'. Câu hiện tại không có từ nào về mốc so sánh hay dấu âm/dương của kết quả.
  - Phản biện: Câu gốc là cơ chế lãi kép, thiếu mốc lãi tiết kiệm dù whenToUse đã gợi ý mốc đó; câu sửa đề xuất ban đầu thêm chữ 'luôn' vào 'cao hơn phép nhân đơn thuần' — SAI tại số kỳ/năm = 1 (khi đó (1+r)^1−1 đúng bằng r×1, hai cách bằng nhau chứ không phải cao hơn) nên đã bỏ 'luôn' và thêm điều kiện đúng phạm…
  - **Sửa (vi):** So kết quả với lãi suất gửi tiết kiệm cùng kỳ hạn: cao hơn nghĩa là khoản lãi ngắn hạn đang thắng kênh gửi tiết kiệm nếu giữ nguyên nhịp đó cả năm. Vì tính theo lãi kép nên con số cao hơn phép nhân đơn thuần khi có nhiều hơn một kỳ mỗi năm — 2%/tháng ra 26,8%/năm chứ không phải 24%.
  - **Sửa (en):** Compare the result against a savings rate over the same horizon: higher means the short-term gain is beating a savings account if that pace held for a whole year. Because it compounds, the figure comes out higher than simple multiplication whenever there is more than one period per year — 2%/month becomes 26.8%/year, not 24%.

#### `loi-suat-quy-nam-theo-ngay`

- **F5 · khoHieu** — `calc`
  - Hiện tại: "Phép tính cho ra giá trị không xác định với bộ số liệu hiện tại. ↳ Kiểm tra lại các ô đầu vào."
  - Vấn đề: calc không có nhánh kiểm riêng cho trường hợp (Giá bán/Giá mua)^(365/Số ngày) tràn số (Infinity) khi tỷ lệ giá lớn kết hợp số ngày nắm giữ rất ngắn — rơi thẳng vào lưới an toàn chung của ok(), hiện thông điệp chung chung không nêu nguyên nhân thật (số ngày quá ngắn so với mức chênh lệch giá), khác với cách các nhánh khác của CHÍNH công thức này (days=0, buyPrice=0) đều có thông điệp riêng nêu rõ nguyên nhân.
  - Bằng chứng: GENERIC_WARN 15/400 mẫu ngẫu nhiên, vd buyPrice=80.000, sellPrice=10.000.000, days=1 → tỷ lệ 125 mũ 365 tràn số double-precision; buyPrice=95.231, sellPrice=10.000.000, days=1 tương tự. Đọc calc (performance.ts, hàm calc của loi-suat-quy-nam-theo-ngay) xác nhận: sau hai chặn days<=0 và buy===0 là `return ok(Math.pow(sellPrice/buy, 365/days)... )` không có chặn tràn số nào trước đó.
  - Phản biện: Đọc trực tiếp performance.ts xác nhận sau hai chặn days<=0 và buy===0, calc gọi thẳng `ok((Math.pow(sellPrice/buy, 365/days) - 1) * 100, '%')` không có chặn tràn số nào trước đó, nên rơi vào lưới an toàn chung của ok() (calc-output.ts) với thông điệp 'Phép tính cho ra giá trị không xác định... Kiểm…
  - **Sửa (vi):** Thêm một chặn trước khi gọi ok(): tính base = sellPrice/buy rồi kiểm Number.isFinite(Math.pow(base, 365/days)) (hoặc so sánh luỹ thừa của logarit với một ngưỡng an toàn); nếu không hữu hạn, trả một CalcWarning riêng (dùng meaningless()) nêu nguyên nhân 'Số ngày nắm giữ quá ngắn so với mức chênh lệch giá khiến phép quy năm vượt quá khả năng hiển thị' kèm gợi ý 'Kiểm tra lại giá mua/giá bán, hoặc nhập số ngày nắm giữ dài hơn.' — cùng giọng với hai nhánh divideByZero() đã có sẵn trong chính công thức này. Thêm ca kiểm {buyPrice: 80.000, sellPrice: 10.000.000, days: 1} với expected: null và expectedWarning ở mã MEANINGLESS (hoặc mã tương đương) để chốt hành vi mới.
  - **Sửa (en):** Before calling ok(), compute base = sellPrice/buy and check Number.isFinite(Math.pow(base, 365/days)) (or compare the log-scaled exponent against a safe threshold); if not finite, return a dedicated CalcWarning (via meaningless()) explaining that the holding period is too short relative to the price change for the annualized figure to be displayed, with a fix suggestion to double-check the buy/sell prices or use a longer holding period — matching the tone of this formula's existing two divideByZero() branches. Add a test {buyPrice: 80,000, sellPrice: 10,000,000, days: 1} expecting null with a MEANINGLESS warning (or an equivalent code) to pin the new behaviour.

#### `loi-suat-trung-binh-hinh-hoc`

- **P2 · gayHieuNham** — `explanation.commonMistakes` (Sai lầm thường gặp)
  - Hiện tại: "Lấy trung bình cộng: lãi 50% rồi lỗ 50% ra trung bình cộng 0%, trong khi thực tế đã mất 25% vốn."
  - Vấn đề: Đặt '-25%' ngay cạnh 'trung bình cộng 0%' khiến người mới dễ tưởng chính Ô KẾT QUẢ của công thức này (trung bình hình học MỖI KỲ) cũng ra -25% cho bộ số 50%/-50% — nhưng công thức trả về khoảng -13,4%/kỳ, một con số khác hẳn. -25% là mức lỗ TỔNG của cả hai kỳ gộp lại, không phải trung bình mỗi kỳ mà công thức này tính.
  - Bằng chứng: claim loi-suat-trung-binh-hinh-hoc.commonMistakes, 3/3 phản ví dụ: H.calc({periods:2,r1:50,r2:-50}) = -13,397459...%/kỳ ≠ -25%. Kiểm lại: (1-0,13397...)^2-1 = -0,25 đúng bằng -25% khi gộp hai kỳ — hai con số nhất quán nếu đọc đúng vai trò của chúng, nhưng câu hiện tại không nói rõ vai trò khác nhau này.
  - Phản biện: H.calc({periods:2, r1:50, r2:-50}) = −13,3975%/kỳ, không phải −25% — đặt '−25%' sát cạnh 'trung bình cộng 0%' khiến người mới tưởng ô KẾT QUẢ của chính công thức này ra −25%, trong khi −25% là mức lỗ gộp cả hai kỳ chứ không phải trung bình mỗi kỳ mà công thức trả về.
  - **Sửa (vi):** Lấy trung bình cộng: lãi 50% rồi lỗ 50% ra trung bình cộng 0%/kỳ — trong khi trung bình hình học đúng của hai kỳ này là khoảng −13,4%/kỳ, gộp lại đúng bằng mức vốn đã giảm 25% sau hai kỳ.
  - **Sửa (en):** Using the arithmetic average: a 50% gain then a 50% loss averages to 0%/period — whereas the correct geometric mean of these two periods is about −13.4%/period, which compounds out to the actual 25% drop in capital after the two periods.

#### `loi-suat-vuot-chuan`

- **P1 · gayHieuNham** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Dương nghĩa là thắng chuẩn, âm là thua chuẩn — thua chuẩn kéo dài là dấu hiệu nên cân nhắc đầu tư theo chỉ số."
  - Vấn đề: Vế sau là một khuyến nghị hành động đầu tư cụ thể (chuyển sang đầu tư theo chỉ số) dựa trên tín hiệu của công thức — vi phạm tinh thần CON-11/FR-24 (cấm khuyến nghị mua/bán/đầu tư dưới mọi hình thức), dùng lối nói mềm nên lọt qua cửa gác tự động.
  - Bằng chứng: Đối chiếu trực tiếp 5 regex của raLenhMuaBan() trong src/application/prose-audit.test.ts (dòng 453-457): (1) 'khuyến nghị\|gợi ý\|khuyên'+'mua/bán' — không khớp vì câu không dùng 'mua/bán'; (2) chủ ngữ người + 'nên mua/bán/giải ngân/vào lệnh/xuống tiền' — không khớp vì câu dùng 'nên cân nhắc đầu tư', không phải 'nên đầu tư' và không có chủ ngữ liền trước; (3) 'nên mua/bán ngay/vào/ra/thêm' — không …
  - Phản biện: Rà độc lập cả 6 regex của raLenhMuaBan() trong prose-audit.test.ts xác nhận câu 'thua chuẩn kéo dài là dấu hiệu nên cân nhắc đầu tư theo chỉ số' không khớp mẫu nào (không có 'mua/bán', chủ ngữ người, hay 'đáng+từ khoá') nên lọt qua cửa gác tự động, nhưng về nội dung vẫn là khuyến nghị hành động đầu…
  - **Sửa (vi):** Dương nghĩa là thắng chuẩn, âm là thua chuẩn — thua chuẩn kéo dài nhiều kỳ liên tiếp là tín hiệu đáng xem lại cách chọn cổ phiếu hoặc mức phí đang trả, không phải một kỳ lẻ tẻ.
  - **Sửa (en):** Positive means beating the benchmark, negative means trailing it — a losing streak across many consecutive periods is a signal worth reviewing your stock-picking approach or the fees you are paying, not just a single off period.

### Lô 09 — `fees.ts + returns.ts`

#### `cagr`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Là con số đã san phẳng: thực tế từng năm có thể lên xuống mạnh quanh mức bình quân này."
  - Vấn đề: Là một lưu ý về bản chất số liệu, không dạy đọc kết quả: không nói 14,87% nghĩa là gì, không có mốc so, không nói số âm nghĩa gì — và trùng ý với mục 'Sai lầm thường gặp' ngay dưới.
  - Bằng chứng: commonMistakes cùng màn: 'Coi CAGR như lợi suất chắc chắn của năm tới. Nó là số liệu quá khứ đã được làm mượt.' Cùng một thông điệp 'đã làm mượt' xuất hiện hai lần liên tiếp, còn con số 14,87% trên màn thì không mục nào đụng tới.
  - Phản biện: Câu gốc là lưu ý 'số liệu đã làm mượt', trùng ý commonMistakes ngay dưới, không đọc số 14,87%; câu sửa đọc đúng ví dụ 100tr→200tr/5 năm (khớp (200/100)^(1/5)−1=14,8698%≈14,87%) và thêm mốc lãi tiết kiệm cùng kỳ hạn.
  - **Sửa (vi):** Kết quả 14,87% là mức tăng mỗi năm: 100 triệu ₫ tăng 14,87% mỗi năm thì sau 5 năm thành 200 triệu ₫. Số âm nghĩa là vốn co lại đều mỗi năm; đem so với lãi suất tiết kiệm cùng kỳ hạn để biết nhanh hay chậm.
  - **Sửa (en):** A result of 14.87% is the per-year rate: 100 million ₫ growing 14.87% a year becomes 200 million ₫ after 5 years. A negative figure means the capital shrinks every year; compare it against a savings rate of the same term to see whether it is fast or slow.

#### `hpr`

- **T3 · khoHieu** — `explanation.meaning` (Ý nghĩa)

  - Hiện tại: "Tổng lợi ích thu được trên một cổ phiếu trong kỳ, gồm cả lãi giá lẫn cổ tức."
  - Vấn đề: 'Tổng lợi ích thu được trên một cổ phiếu' đọc ra một số TIỀN, trong khi kết quả là phần trăm — người mới nhìn '20,51' rất dễ hiểu thành 20,51 ₫ mỗi cổ phiếu.
  - Bằng chứng: resultUnit của hpr là '%'. Với ví dụ trên màn (78.000 → 92.000, cổ tức 2.000) lợi ích bằng tiền là 16.000 ₫/CP còn kết quả hiện ra là 20,51% — hai con số khác nhau hoàn toàn, mà câu meaning không có chữ nào nói kết quả được chia cho giá đầu kỳ.
  - Phản biện: resultUnit của hpr là '%' nhưng 'Tổng lợi ích thu được trên một cổ phiếu' đọc như một số tiền ₫/CP; ví dụ trên màn cho kết quả 20,51 trong khi lợi ích bằng tiền thực (92.000−78.000+2.000) là 16.000 ₫ — hai con số khác thang hoàn toàn, câu meaning không có chữ nào nói kết quả đã chia cho giá đầu kỳ.
  - **Sửa (vi):** Trong kỳ nắm giữ, mỗi trăm đồng bỏ ra mua cổ phiếu mang lại bao nhiêu đồng — tính cả phần giá lên xuống lẫn cổ tức đã nhận.
  - **Sửa (en):** Over the holding period, how many đồng each hundred đồng spent on the stock returns — counting both the price move and the dividends received.

- **T2 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Cao hơn tỷ suất tính theo giá thuần đúng bằng phần cổ tức, nên cổ phiếu cổ tức cao nhìn khác hẳn."
  - Vấn đề: 'Tỷ suất tính theo giá thuần' là MỐC SO duy nhất câu này đưa ra, mà cụm đó không được giải nghĩa ở bất cứ đâu trên màn — người mới không biết phải tính con số để đem so như thế nào.
  - Bằng chứng: grep toàn repo: 'giá thuần' chỉ xuất hiện đúng hai lần trong prose — ở đây và ở roi-rong.howToRead — và mang HAI nghĩa khác nhau (ở đây là loại cổ tức ra, ở roi-rong là loại phí và thuế ra). screenText của hpr (cả hai chế độ) không có dòng nào định nghĩa nó; ba ô nhập chỉ là Giá đầu kỳ, Giá cuối kỳ, Cổ tức. Cả hai công thức đều level 'basic'.
  - Phản biện: 'Tỷ suất tính theo giá thuần' là mốc so sánh duy nhất của câu nhưng không được định nghĩa ở bất kỳ đâu trên màn hpr (ba biến nhập chỉ là Giá đầu kỳ/Giá cuối kỳ/Cổ tức, không có mô tả nào giải nghĩa 'giá thuần'); công thức level 'basic' nên phải xét thuật ngữ này.
  - **Sửa (vi):** Cao hơn tỷ suất tính trên giá thuần — tức (Giá cuối kỳ − Giá đầu kỳ) ÷ Giá đầu kỳ — đúng bằng phần cổ tức chia cho giá đầu kỳ: ví dụ trên màn ra 20,51%, còn bỏ cổ tức đi chỉ còn 17,95%.
  - **Sửa (en):** It exceeds the price-only return — (Ending price − Starting price) ÷ Starting price — by exactly the dividend divided by the starting price: the example above gives 20.51%, while dropping the dividend leaves 17.95%.

#### `loi-nhuan-rong`

- **F5 · sai** — `spec.usesConstants`
  - Hiện tại: "(không có trường usesConstants trong spec của loi-nhuan-rong)"
  - Vấn đề: calc đọc BỐN hằng số MarketConfig qua totalCostOf() nhưng spec không khai khoá nào, nên màn chi tiết mất hẳn khối hằng số — vi phạm CON-10/LDR-03 và đúng cái lỗ hổng mà gói ConstantsNote sinh ra để vá.
  - Bằng chứng: fees.ts: LOI_NHUAN_RONG.calc gọi totalCostOf(v, ctx), hàm này gọi rateOf(ctx,'fee.brokerage.buy'), rateOf(ctx,'fee.brokerage.sell'), rateOf(ctx,'tax.transfer.sell'), constantOf(ctx,'fee.custody'). spec-dump/full/09.json: loi-nhuan-rong có 0 dòng constants trong screenText, trong khi gia-hoa-von và roi-rong — dùng đúng bốn khoá ấy — có 4 dòng. Hậu quả trên màn: example.note công bố 'tổng chi phí 3…
  - Phản biện: Đọc trực tiếp fees.ts xác nhận LOI_NHUAN_RONG.calc gọi totalCostOf(v, ctx), hàm này đọc đúng bốn hằng số fee.brokerage.buy/fee.brokerage.sell/tax.transfer.sell/fee.custody (rateOf/constantOf), nhưng spec của loi-nhuan-rong không khai usesConstants nào, trong khi ROI_RONG ngay phần sau — gọi cùng hà…
  - **Sửa (vi):** Khai usesConstants: ['fee.brokerage.buy', 'fee.brokerage.sell', 'tax.transfer.sell', 'fee.custody'] cho loi-nhuan-rong — đúng bốn khoá totalCostOf() đọc, giống hệt roi-rong. Kèm theo, mở rộng khoaTheoCongThuc() trong constants-gate.test.ts để nó lần được hằng số đọc qua hàm phụ dùng chung (totalCostOf, breakEvenPrice) thay vì chỉ đọc trong đúng khối văn bản của mỗi FormulaModule, nếu không cửa gác vẫn xanh khi lỗi này tái diễn ở một công thức khác.
  - **Sửa (en):** Declare usesConstants: ['fee.brokerage.buy', 'fee.brokerage.sell', 'tax.transfer.sell', 'fee.custody'] on loi-nhuan-rong — exactly the four keys totalCostOf() reads, the same set roi-rong already declares. Alongside it, widen khoaTheoCongThuc() in constants-gate.test.ts so it follows constants read through shared helper functions (totalCostOf, breakEvenPrice) instead of only scanning each FormulaModule's own text block; otherwise the gate stays green the next time this happens to another formula.

#### `phi-giao-dich-ban`

- **P2 · gayHieuNham** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Một vòng mua – bán chịu phí hai lần, nên chi phí gấp đôi mức của một lệnh."
  - Vấn đề: Nói chi phí một vòng mua–bán bằng hai lần phí một lệnh, trong khi một vòng còn cõng thuế chuyển nhượng và phí lưu ký — người mới lấy 'gấp đôi' làm ước lượng sẽ thiếu tiền; ngoài ra câu không dạy đọc con số ₫ nào.
  - Bằng chứng: Chính bộ số WF-08 của sản phẩm: phí bán 145.500 ₫ nên 'gấp đôi' là 291.000 ₫, nhưng tổng chi phí một vòng mà màn 'Lợi nhuận ròng sau phí & thuế' công bố trong example.note là 381.850 ₫ — thiếu 90.850 ₫, tức 31% (extras.totalCost = 381850 do chính calc trả). Claim phi-giao-dich-ban.explanation.howToRead: 371/384 phản ví dụ ngẫu nhiên với biên ±5%. Cửa gác 'gấp N lần' của prose-audit không bắt được…
  - Phản biện: 'Gấp đôi' phí bán WF-08 (145.500→291.000 ₫) thiếu hẳn 90.850 ₫ (31%) so với tổng chi phí một vòng thật mà chính màn 'Lợi nhuận ròng sau phí & thuế' công bố (381.850 ₫, gồm cả thuế chuyển nhượng và phí lưu ký mà câu này bỏ qua); cửa gác 'gấp N lần' tự động không bắt được vì chữ 'đôi' không phải chữ …
  - **Sửa (vi):** Kết quả là số tiền bị trừ khỏi tiền bán: bán 1.000 CP giá 97.000 ₫ mất 145.500 ₫, tức 145,5 ₫ mỗi cổ phiếu. Đây mới là một chiều — cả vòng mua rồi bán còn cõng thêm thuế bán và phí lưu ký.
  - **Sửa (en):** The result is the amount deducted from the sale proceeds: selling 1,000 shares at 97,000 ₫ costs 145,500 ₫, or 145.5 ₫ per share. That is only one leg — a full buy-sell round trip also carries the sell tax and the custody fee.

#### `phi-giao-dich-mua`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)

  - Hiện tại: "Phí tính trên giá trị giao dịch chứ không trên khoản lãi, nên mua rồi bán ngay vẫn mất phí."
  - Vấn đề: Tả cơ chế tính phí, không dạy đọc con số ₫ hiện ra: không nói 138.000 ₫ nghĩa là gì, không có mốc so, không nói làm gì tiếp với nó.
  - Bằng chứng: Tiêu đề mục là 'Cách đọc kết quả'. Trên màn, dòng kết quả là '138.000 ₫' và không câu nào quy nó về mỗi cổ phiếu hay về giá vốn; câu hiện tại trả lời cho câu hỏi 'phí tính thế nào', đúng phần việc của mục 'Sai lầm thường gặp' ngay dưới.
  - Phản biện: Câu gốc tả cơ chế thu phí, không đọc số 138.000 ₫ hiện trên màn; câu sửa quy đúng ra 138 ₫/CP (138.000 ÷ 1.000 CP của ví dụ WF-08, không chép thẳng tỷ lệ phí MarketConfig 0,15%) và có bản ghép commonMistakes liền mạch ở mục kế tiếp.
  - Đề xuất chuyển sang: `explanation.commonMistakes`
  - **Sửa (vi):** Kết quả là số tiền bị trừ thêm ngoài tiền mua: ví dụ trên màn, lệnh 92.000.000 ₫ mất 138.000 ₫, tức mỗi cổ phiếu đắt thêm 138 ₫ so với giá khớp. Cộng số này vào giá vốn trước khi tính lãi.
  - **Sửa (en):** The result is the amount deducted on top of the purchase money: on the example above, a 92,000,000 ₫ order costs 138,000 ₫, meaning each share is 138 ₫ more expensive than the matched price. Add it to your cost basis before computing any profit.

- **T1 · khoHieu** — `explanation.commonMistakes` (Sai lầm thường gặp)
  - Hiện tại: "Tưởng phí đã nằm trong giá khớp lệnh. Phí được trừ riêng khỏi tiền trong tài khoản."
  - Vấn đề: Mục nhận của phần chuyển ở trên — cần bản ghép để vẫn đọc được như một đoạn liền, không phải hai câu rời.
  - Bằng chứng: Hai hiểu nhầm khác nhau nên giữ cả hai: 'phí đã nằm trong giá' và 'mua bán trong ngày thì không mất phí'. Ca kiểm 'không mua gì thì không mất phí' (quantity 0 → 0 ₫) cho thấy phí chỉ mất khi có khớp lệnh, không mâu thuẫn.
  - Phản biện: Đây là mục nhận của finding howToRead ở trên; bản ghép giữ nguyên câu gốc rồi nối ý chuyển từ howToRead bằng 'Và vì...', đọc liền mạch như một mục hai sai lầm liên quan, không chỉ dán rời hai câu.
  - **Sửa (vi):** Tưởng phí đã nằm trong giá khớp lệnh — phí được trừ riêng khỏi tiền trong tài khoản. Và vì phí tính trên giá trị giao dịch chứ không trên khoản lãi, mua rồi bán ngay vẫn mất phí.
  - **Sửa (en):** Assuming the fee is already baked into the matched price — it is deducted separately from the account balance. And because the fee is charged on the transaction value rather than on any profit, even an immediate buy-and-sell still incurs it.

#### `phi-luu-ky`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)

  - Hiện tại: "Rất nhỏ với lệnh ngắn hạn, nhưng cộng dồn đáng kể khi giữ nhiều cổ phiếu trong nhiều năm."
  - Vấn đề: Có nói to/nhỏ nhưng không có mốc so nào và không đọc con số: người dùng thấy '1.350 ₫' vẫn không biết đó là phí của cả 5 tháng hay của một tháng, cũng không biết đem so với cái gì.
  - Bằng chứng: Ô nhập 'Thời gian nắm giữ 5 tháng' + kết quả '1.350 ₫' đứng cạnh nhau mà không câu nào nối chúng lại; 1.350 ₫ là tổng cả kỳ (270 ₫/tháng, đúng ca kiểm 'bán ngay trong tháng đầu vẫn tính một tháng').
  - Phản biện: Câu gốc chỉ định tính (rất nhỏ / cộng dồn) mà không đọc số 1.350 ₫ hiện trên màn; câu sửa quy đúng 1.350 ÷ 1.000 CP = 1,35 ₫/CP và làm rõ đây là TỔNG cả 5 tháng chứ không phải mỗi tháng — khớp test 'bán ngay trong tháng đầu vẫn tính một tháng' (270 ₫, đúng 1.350/5).
  - **Sửa (vi):** Kết quả là tổng phí cho cả kỳ nắm giữ chứ không phải mỗi tháng: 1.000 CP giữ 5 tháng hết 1.350 ₫, tức 1,35 ₫ mỗi cổ phiếu. Chia cho khối lượng rồi cộng vào giá mua để thấy khoản này đẩy giá hoà vốn lên bao nhiêu.
  - **Sửa (en):** The result is the total for the whole holding period, not a monthly amount: 1,000 shares held for 5 months costs 1,350 ₫, or 1.35 ₫ per share. Divide it by the quantity and add it to the buy price to see how far it pushes the break-even price up.

- **T1 · khoHieu** — `explanation.commonMistakes` (Sai lầm thường gặp)
  - Hiện tại: "Bỏ qua hoàn toàn khi tính giá hoà vốn của khoản nắm giữ dài hạn."
  - Vấn đề: Câu cụt chủ ngữ và không nói vì sao sai: không rõ ai bỏ qua cái gì, cũng không nói bỏ qua thì con số lệch về phía nào.
  - Bằng chứng: Tiêu đề mục đòi 'sai lầm cụ thể và vì sao sai'. Hướng lệch kiểm được: giá hoà vốn của gia-hoa-von có F_lk ở tử số, nên bỏ phí lưu ký ra thì giá hoà vốn tính được LUÔN thấp hơn thực tế (ví dụ WF-08: 92.370,28 ₫ có phí lưu ký, 92.368,92 ₫ nếu bỏ).
  - Phản biện: Câu gốc cụt chủ ngữ và không nói hướng lệch; tự chạy lại gia-hoa-von (verify-t1.mjs) xác nhận bỏ phí lưu ký cho 92.368,92 ₫ thay vì 92.370,28 ₫ có phí — đúng hướng 'thấp hơn thực tế' mà câu sửa nêu, không phải suy đoán.
  - **Sửa (vi):** Bỏ hẳn phí lưu ký khỏi giá hoà vốn vì thấy nó nhỏ. Khoản này đã bị trừ khỏi tài khoản trước khi bạn bán, nên không cộng vào thì giá hoà vốn tính ra thấp hơn thực tế.
  - **Sửa (en):** Dropping the custody fee out of the break-even price because it looks small. It has already left the account before you sell, so leaving it out makes the break-even price come out lower than it really is.

#### `roi`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "ROI không tính tới thời gian: 25% trong một năm và 25% trong năm năm là hai chuyện rất khác nhau."
  - Vấn đề: Là một lưu ý, không phải cách đọc: không nói 25% nghĩa là gì, số âm nghĩa là gì, đem so với mốc nào — và nói lại đúng điều mục 'Sai lầm thường gặp' ngay dưới đã nói.
  - Bằng chứng: commonMistakes cùng màn: 'Dùng ROI để so hai khoản có thời gian nắm giữ khác nhau. Muốn so thì dùng CAGR.' Hai mục liên tiếp cùng một nội dung, nên người mới đọc hết bốn mục vẫn không biết con số 25% trên màn nghĩa là gì.
  - Phản biện: Câu gốc là một lưu ý về thời gian, trùng ý commonMistakes ngay dưới, không đọc số 25%; câu sửa đọc đúng ví dụ (100tr→125tr, khớp test 'lãi 25%'), nêu số âm/0% và mốc lãi tiết kiệm cùng kỳ hạn, không nhắc lại CAGR như commonMistakes đã nói.
  - **Sửa (vi):** Kết quả 25% nghĩa là 100 triệu ₫ bỏ ra nay thành 125 triệu ₫ — cứ 100 đồng vốn lãi thêm 25 đồng. Số âm là đang lỗ, 0% là vừa đủ hoà vốn; muốn biết hơn kém thì so với lãi suất tiết kiệm của đúng khoảng thời gian ấy.
  - **Sửa (en):** A result of 25% means 100 million ₫ put in is now 125 million ₫ — every 100 đồng of capital earned 25 đồng more. A negative figure means a loss and 0% means exactly break-even; to judge it, compare against a savings rate over the same span of time.

#### `roi-rong`

- **T1 · khoHieu** — `explanation.meaning` (Ý nghĩa)

  - Hiện tại: "Lãi ròng chia cho vốn thực bỏ ra, gồm cả phí mua và phí lưu ký."
  - Vấn đề: Đọc lại công thức bằng lời chứ không nói con số 5,01% cho biết điều gì — mà dòng expression ngay phía trên đã nói đúng y như vậy: 'ROI ròng = Lợi nhuận ròng ÷ Vốn thực bỏ ra × 100'.
  - Bằng chứng: So với công thức anh em cùng lô: roi.meaning viết 'Mỗi trăm đồng bỏ ra đang sinh ra bao nhiêu đồng lãi' — đúng giọng của tiêu đề 'Công thức này nói lên điều gì'. roi-rong.meaning thì lặp expression, nên người mới đọc hai dòng liên tiếp mà chỉ nhận một thông tin.
  - Phản biện: Câu gốc lặp lại gần như đúng dòng expression phía trên, không nói bằng lời thường ROI ròng đo cái gì; câu sửa theo đúng giọng của roi.meaning liền kề trong cùng lô ('mỗi trăm đồng... bao nhiêu đồng lãi') nhưng không trùng nguyên văn, thêm 'sau phí và thuế' để phân biệt hai công thức.
  - **Sửa (vi):** Sau khi trừ hết phí và thuế, mỗi trăm đồng vốn thật sự bỏ ra mang về bao nhiêu đồng lãi.
  - **Sửa (en):** After every fee and tax, how many đồng of profit each hundred đồng of capital actually deployed brings back.

- **P2 · gayHieuNham** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Luôn thấp hơn tỷ suất tính theo giá thuần. Chênh lệch càng rõ khi giao dịch ngắn và dày."
  - Vấn đề: Câu thứ hai NGƯỢC với chính công thức: với đúng bộ ô nhập trên màn, giữ CÀNG LÂU khoảng cách càng rộng, vì phí lưu ký cộng dồn theo tháng. Thêm nữa 'dày' (giao dịch nhiều lần) là thứ công thức này không mô hình hoá — nó chỉ tính một vòng mua–bán.
  - Bằng chứng: Claim roi-rong.explanation.howToRead: 448/452 phản ví dụ ngẫu nhiên. Ca biên chạy bằng calc thật: 100.000 CP mua 10.000 ₫ bán 10.500 ₫ (tỷ suất giá thuần 5%) — giữ 1 tháng ra 4,5778% (cách 0,42 điểm %), giữ 60 tháng ra 4,4117% (cách 0,59 điểm %). Bộ WF-08 cùng chiều: 1 tháng 5,0134% so với 60 tháng 4,9952%. Người mới tin câu này sẽ đi tìm chênh lệch ở chỗ nó nhỏ nhất.
  - Phản biện: totalCostOf() cộng dồn phí lưu ký theo months (feeCustody = q×months×rate) vào cả tử số và mẫu số của ROI ròng, nên giữ càng lâu khoảng cách với tỷ suất giá thuần càng RỘNG chứ không hẹp; tính tay độc lập với bộ số 100.000 CP/10.000→10.500 ₫ ra đúng 4,58% (1 tháng, cách 0,42 điểm) và 4,41% (60 thán…
  - **Sửa (vi):** Luôn thấp hơn tỷ suất tính trên giá thuần, tức (Giá bán − Giá mua) ÷ Giá mua. Giữ càng lâu khoảng cách càng rộng, vì phí lưu ký cộng dồn thêm mỗi tháng.
  - **Sửa (en):** Always lower than the rate computed on the raw prices alone — (Sell price − Buy price) ÷ Buy price. The longer you hold, the wider the gap, because the custody fee keeps adding up month after month.

#### `thue-chuyen-nhuong`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Thuế tính trên giá trị bán chứ không trên phần lãi — bán lỗ vẫn phải nộp khoản này."
  - Vấn đề: Tả cơ chế thu thuế, không dạy đọc con số; và gần như chép lại nguyên ý của mục 'Sai lầm thường gặp' ngay dưới, nên người đọc mất một mục mà không nhận thêm gì.
  - Bằng chứng: commonMistakes cùng màn: 'Tưởng lỗ thì được miễn thuế. Cách tính hiện hành thu theo giá trị bán, không theo lãi.' Hai câu nói đúng một điều. Kết quả trên màn là '97.000 ₫' và không câu nào quy về mỗi cổ phiếu hay về giá hoà vốn.
  - Phản biện: Câu gốc gần như chép lại nguyên ý commonMistakes ngay dưới và không đọc số 97.000 ₫; câu sửa quy đúng ra 97 ₫/CP (97.000 ÷ 1.000 CP, không chép thẳng thuế suất MarketConfig 0,1%) và đưa ra hành động cụ thể (cộng vào giá hoà vốn).
  - **Sửa (vi):** Kết quả là khoản trừ thẳng vào tiền bán: bán 1.000 CP giá 97.000 ₫ nộp 97.000 ₫, tức 97 ₫ mỗi cổ phiếu. Cộng nó vào giá hoà vốn, vì số này chỉ đổi theo giá bán và khối lượng.
  - **Sửa (en):** The result is a direct deduction from the sale proceeds: selling 1,000 shares at 97,000 ₫ owes 97,000 ₫, or 97 ₫ per share. Add it into your break-even price, since the amount moves only with the sale price and the quantity.

#### `thue-co-tuc`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)

  - Hiện tại: "Công ty chứng khoán khấu trừ sẵn, nên số tiền về tài khoản đã là số sau thuế."
  - Vấn đề: Tả quy trình thu hộ, không dạy đọc con số 100.000 ₫: không nói nó nghĩa là gì, trừ vào đâu, còn lại bao nhiêu; và phần 'khấu trừ trước khi tiền về tài khoản' đã nằm sẵn trong mục 'Công thức này nói lên điều gì'.
  - Bằng chứng: meaning cùng màn: 'Phần cổ tức bị khấu trừ thuế trước khi chuyển về tài khoản nhà đầu tư.' Trên màn không con số nào nối 2.000.000 ₫ cổ tức công bố với 1.900.000 ₫ thực nhận, dù cả hai suy ra được từ chính ô nhập của ví dụ.
  - Phản biện: Câu gốc lặp lại đúng ý đã có ở meaning cùng màn (khấu trừ trước khi về tài khoản) mà không nối số công bố với số thực nhận; câu sửa dùng đúng phép tính từ ô nhập ví dụ (1.000×2.000=2.000.000, trừ 100.000 còn 1.900.000, khớp test 'cổ tức 2.000 ₫/CP trên 1.000 CP').
  - **Sửa (vi):** Kết quả là phần cổ tức bị giữ lại: 1.000 CP × 2.000 ₫ là 2.000.000 ₫ công bố, nộp 100.000 ₫, còn 1.900.000 ₫ về tài khoản. Lấy số thực nhận này mới ra đúng tỷ suất cổ tức.
  - **Sửa (en):** The result is the slice of the dividend held back: 1,000 shares × 2,000 ₫ is 2,000,000 ₫ announced, 100,000 ₫ withheld, 1,900,000 ₫ reaching the account. Use that net figure to get the dividend yield right.

- **T3 · khoHieu** — `note`
  - Hiện tại: "Công thức tính cho cổ tức tiền mặt của cổ phiếu. Lợi tức được chia từ quỹ đầu tư chứng khoán hoặc quỹ bất động sản được giảm 50% thuế theo luật thuế mới — trường hợp đó nằm ngoài phạm vi ở đây."
  - Vấn đề: Giới hạn phạm vi duy nhất của công thức nằm ở spec.note, mà spec.note không được render ở đâu; người dùng gõ lợi tức quỹ vào ô 'Cổ tức tiền mặt' sẽ ra số thuế cao gấp đôi thực tế mà màn không hề cảnh báo.
  - Bằng chứng: spec-dump/full/09.json: visibility.noteRendered = false cho cả 13 công thức của lô; screenText (basic và advanced) không chứa dòng note nào. example.note thì CÓ render (xem gia-hoa-von, loi-nhuan-rong) nhưng thue-co-tuc chưa khai example.note.
  - Phản biện: Grep trực tiếp src/ui/\*_/_.tsx xác nhận không component nào đọc spec.note của FormulaSpec (chỉ example.note trong ExampleBlock.tsx và MarketConstant.note trong ConstantsNote.tsx được render) — khớp cả BRIEF.md lẫn evidence gốc của lô 09; giới hạn phạm vi DUY NHẤT của công thức (không áp dụng cho cổ…
  - Đề xuất chuyển sang: `example.note`
  - **Sửa (vi):** Áp dụng cho cổ tức tiền mặt của cổ phiếu. Lợi tức chia từ quỹ đầu tư chứng khoán hoặc quỹ bất động sản có mức riêng, không tính bằng công thức này.
  - **Sửa (en):** This covers cash dividends on stocks. Distributions from securities investment funds or real estate funds are taxed at their own rate and are not computed by this formula.

#### `ty-suat-co-tuc`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Tỷ suất cao bất thường thường do giá vừa giảm mạnh, chứ không hẳn do doanh nghiệp hào phóng."
  - Vấn đề: Chỉ giải thích NGUYÊN NHÂN của một tỷ suất cao, không dạy đọc con số: 2,17% nghĩa là gì, quy ra bao nhiêu tiền, và cao hay thấp thì so với cái gì mới biết.
  - Bằng chứng: Mốc so duy nhất của công thức này nằm ở mục khác — whenToUse: 'so với lãi suất tiết kiệm ngân hàng' — nên mục 'Cách đọc kết quả' bỏ trống đúng phần việc của nó. Câu nguyên nhân thì vẫn đúng và đáng giữ, chỉ cần đứng sau phần đọc số.
  - Phản biện: Câu gốc chỉ nói nguyên nhân của tỷ suất cao bất thường, không đọc số 2,17%; câu sửa quy đúng ra 2.170 ₫ trên mỗi 100.000 ₫ vốn (2,17%×100.000, khớp example.expected) và ghi rõ 'trước thuế' để không mâu thuẫn với commonMistakes của chính công thức (vốn nói cổ tức công bố chưa trừ thuế).
  - **Sửa (vi):** Kết quả 2,17% nghĩa là bỏ ra 100.000 ₫ mua cổ phiếu thì một năm nhận về 2.170 ₫ tiền mặt, trước thuế. Tỷ suất cao bất thường thường do giá vừa giảm mạnh chứ không hẳn do doanh nghiệp hào phóng.
  - **Sửa (en):** A result of 2.17% means 100,000 ₫ spent on the stock returns 2,170 ₫ in cash over a year, before tax. An unusually high yield is often the result of a sharp price drop rather than a generous company.

#### `xirr`

- **F5 · gayHieuNham** — `calc.warning.fix (xirrNotConverged)`

  - Hiện tại: "Kiểm tra lại: cần ít nhất một khoản chi ra và một khoản thu về, kèm ngày đúng thứ tự."
  - Vấn đề: Một câu gợi ý sửa phục vụ hai nguyên nhân khác hẳn nhau, và ở nguyên nhân thứ hai nó chỉ người dùng đi kiểm thứ vốn đã đúng — dữ liệu có đủ chi và thu, ngày đúng thứ tự, chỉ là nghiệm nằm ngoài khoảng quét.
  - Bằng chứng: Ca biên chạy bằng calc thật: mua 100.000.000 ₫ ngày 01/01/2025, 7 ngày sau còn 80.000.000 ₫ → XIRR thật −99,99912%/năm, calc trả MEANINGLESS kèm đúng câu trên. Lỗ 60% sau 30 ngày cũng vậy (−99,99856%/năm). Ngưỡng suy ra từ low = −0,9999 của bisectXirr: lỗ quá ~16% trong một tuần hoặc ~54% trong một tháng là rơi vào vùng này — hoàn toàn có thật với màn Danh mục, nơi một mã vừa mua vài ngày là chuy…
  - Phản biện: Đọc trực tiếp returns.ts xác nhận xirr() trả null ở nhiều nhánh khác nhau (thiếu dòng tiền, không đổi dấu, ngày không hợp lệ, hoặc bisectXirr không bắt được nghiệm trong [−0,9999;10]) nhưng XIRR.calc chỉ dùng đúng MỘT thông điệp xirrNotConverged() cho mọi trường hợp; theo chính luồng mã, nhánh bise…
  - **Sửa (vi):** Cho xirr() phân biệt hai nguyên nhân (dòng tiền không đổi dấu, so với nghiệm nằm ngoài khoảng [−0,9999; 10] mà bisectXirr quét) rồi để calc chọn câu tương ứng. Nếu chưa tách được thì ít nhất bổ sung nguyên nhân thứ hai vào câu gợi ý: 'Kiểm tra lại: cần ít nhất một khoản chi ra và một khoản thu về, kèm ngày đúng thứ tự. Nếu đã đủ cả hai thì lãi hoặc lỗ đang nằm trong quãng ngày quá ngắn để quy ra suất sinh lợi năm — với quãng vài ngày, ROI hoặc HPR đọc dễ hơn.' Thêm ca kiểm cho cặp dòng tiền −100.000.000 ₫ ngày 01/01/2025 và +80.000.000 ₫ bảy ngày sau: vẫn giữ expectedWarning MEANINGLESS như hiện tại, chỉ để chốt rằng câu gợi ý sửa mới không còn bảo người dùng kiểm tra thứ đã đúng.
  - **Sửa (en):** Let xirr() tell its two failure causes apart (cash flows that never change sign, versus a root outside the [−0.9999, 10] window bisectXirr scans) and have calc pick the matching sentence. Short of that, add the second cause to the fix line: 'Check again: you need at least one outflow and one inflow, with dates in the correct order. If both are present, the gain or loss sits in too short a span to annualize — over a few days, ROI or HPR reads more easily.' Add a test for the cash-flow pair −100,000,000 ₫ on 2025-01-01 and +80,000,000 ₫ seven days later: keep the existing expectedWarning of MEANINGLESS, just to pin that the new fix-suggestion text no longer tells the user to check something that is already correct.

- **T3 · gayHieuNham** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Đọc như một mức lãi suất kép mỗi năm. Cao hơn lãi suất tiết kiệm là khoản đầu tư đang thắng; khác IRR thường, XIRR không đòi các kỳ cách đều."
  - Vấn đề: Không chỗ nào nói con số năm hoá phóng đại thế nào khi quãng ngày ngắn, nên người mới gặp một số khổng lồ vẫn đọc nó như 'lãi suất mỗi năm' và kết luận khoản đầu tư đang thắng đậm.
  - Bằng chứng: calc thật: mua 100.000.000 ₫ ngày 01/01/2025, hai ngày sau giá trị 107.000.000 ₫ (lãi 7%) → màn hiện 23.042.921,63 %/năm; lãi 15% sau 10 ngày → 16.323,71 %/năm. Cả hai đều đúng toán và đều lọt qua mọi cửa gác, nhưng đọc theo đúng câu hiện tại thì thành 'thắng lãi suất tiết kiệm' hàng triệu lần. Vế cuối ('khác IRR thường...') còn lặp nguyên ý đã có trong mục 'Công thức này nói lên điều gì' ngay ph…
  - Phản biện: Tự tính lại đúng phương trình XIRR hai dòng tiền: lãi 7% sau 2 ngày ra 23.042.921,63 %/năm, lãi 15% sau 10 ngày ra 16.323,71 %/năm — khớp chính xác con số evidence gốc của lô 09, xác nhận câu 'cao hơn lãi suất tiết kiệm là đang thắng' không cảnh báo gì về mức phóng đại khủng khiếp này khi quãng ngà…
  - **Sửa (vi):** Đọc như một mức lãi suất kép mỗi năm, đem so với lãi suất tiết kiệm cùng kỳ hạn: ví dụ trên màn, 100 triệu ₫ thành 110 triệu ₫ sau đúng một năm cho 10%/năm. Quãng giữa các dòng tiền càng ngắn thì con số quy ra năm càng bị phóng đại — lãi 7% trong hai ngày đã thành hàng triệu %/năm.
  - **Sửa (en):** Read it as a compound annual interest rate and compare it against a savings rate of the same term: on the example above, 100 million ₫ becoming 110 million ₫ after exactly one year gives 10%/year. The shorter the span between cash flows, the more the annualized figure is magnified — a 7% gain over two days already becomes millions of percent per year.

### Lô 10 — `derivatives.ts + corporate.ts`

#### `basis-vn30f`

- **P2 · sai** — `explanation.howToRead` (Cách đọc kết quả)

  - Hiện tại: "quá nửa mức đó thường chỉ là chi phí nắm giữ hợp lý (xem mục Lỗi hay gặp)"
  - Vấn đề: Trỏ tới mục 'Lỗi hay gặp' — tên này không tồn tại trên màn; tiêu đề thật (khoá explain.commonMistakes trong src/application/i18n/vi.ts) là 'Sai lầm thường gặp'.
  - Bằng chứng: src/application/i18n/vi.ts dòng 221: 'explain.commonMistakes': 'Sai lầm thường gặp' — không có khoá/nhãn nào tên 'Lỗi hay gặp' trong bộ dịch.
  - Phản biện: Grep xác nhận 'Lỗi hay gặp' không tồn tại làm nhãn ở bất kỳ đâu trong repo — nhãn thật (src/application/i18n/vi.ts dòng 221) là 'Sai lầm thường gặp'; đáng chú ý bản tiếng Anh của CHÍNH câu này đã viết đúng '(see Common mistakes)' từ trước, chỉ riêng bản Việt bị sai tên mục.
  - **Sửa (vi):** Không đọc thẳng mọi basis dương là kỳ vọng tăng — quá nửa mức đó thường chỉ là chi phí nắm giữ hợp lý (xem mục Sai lầm thường gặp). Basis vượt hẳn mức chi phí đó, hoặc basis âm sâu bất thường, mới đáng đọc là tâm lý thị trường. Càng gần đáo hạn basis càng co về 0.
  - **Sửa (en):** Don't read every positive basis as a bullish signal — much of it is usually just the fair cost of carry (see Common mistakes). Only a basis that clearly exceeds that cost, or an unusually deep negative basis, is worth reading as market sentiment. The basis converges to 0 as expiry approaches.

- **P1 · gayHieuNham** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "quá nửa mức đó thường chỉ là chi phí nắm giữ hợp lý"
  - Vấn đề: Khẳng định tỷ lệ cụ thể ('quá nửa') giữa basis quan sát được và phần chi phí nắm giữ hợp lý — một tỷ lệ thực nghiệm ứng dụng không có dữ liệu nào để kiểm chứng, và không đúng chung chung, nhất là đúng vào lúc basis bất thường (khi người đọc cần câu này nhất).
  - Bằng chứng: Với bộ mặc định của gia-ly-thuyet-vn30f (chỉ số 1.280, lãi suất 4,5%, cổ tức 1,8%, 30 ngày) chi phí nắm giữ hợp lý chỉ ≈ 2,84 điểm. Nếu basis quan sát được nới ra 20 điểm (biến động mạnh, vẫn trong biên [0;10000] của biến futuresPoints) thì phần chi phí nắm giữ chỉ chiếm ≈ 14% chứ không phải 'quá nửa' — người mới tin câu này sẽ coi một nửa mức basis 20 điểm là bình thường, trong khi ~86% thực chấ…
  - Phản biện: Grep xác nhận 'Lỗi hay gặp' không tồn tại làm nhãn ở bất kỳ đâu trong repo — nhãn thật (src/application/i18n/vi.ts dòng 221) là 'Sai lầm thường gặp'; đáng chú ý bản tiếng Anh của CHÍNH câu này đã viết đúng '(see Common mistakes)' từ trước, chỉ riêng bản Việt bị sai tên mục.
  - **Sửa (vi):** Không đọc thẳng mọi basis dương là kỳ vọng tăng — quá nửa mức đó thường chỉ là chi phí nắm giữ hợp lý (xem mục Sai lầm thường gặp). Basis vượt hẳn mức chi phí đó, hoặc basis âm sâu bất thường, mới đáng đọc là tâm lý thị trường. Càng gần đáo hạn basis càng co về 0.
  - **Sửa (en):** Don't read every positive basis as a bullish signal — much of it is usually just the fair cost of carry (see Common mistakes). Only a basis that clearly exceeds that cost, or an unusually deep negative basis, is worth reading as market sentiment. The basis converges to 0 as expiry approaches.

#### `diem-hoa-von`

- **P2 · sai** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Doanh thu hoà vốn ở dòng phụ giúp so thẳng với doanh thu trên báo cáo."
  - Vấn đề: Không có 'dòng phụ' nào hiện doanh thu hoà vốn cho kết quả người dùng tự nhập — extras.breakEvenRevenue mà calc trả về không được UI render ở đâu ngoài khối Ví dụ cố định (dùng số liệu Ví dụ, không phải số liệu người dùng nhập).
  - Bằng chứng: Grep toàn bộ src/ui cho 'extras' chỉ khớp trong src/core/chart/breakdown.ts — nơi extras chỉ được dùng để vẽ biểu đồ waterfall/stackedBar; diem-hoa-von khai chartType:'sensitivity' (không phải waterfall/stackedBar) nên breakEvenRevenue không bao giờ lên UI cho kết quả sống. 'Doanh thu hoà vốn tương ứng 1,25 tỷ ₫' chỉ xuất hiện trong example.note — văn bản tĩnh gắn với đúng bộ số của Ví dụ, không …
  - Phản biện: Grep toàn src/ui và src/application cho 'extras' không ra kết quả nào — extras (gồm breakEvenRevenue mà calc tính) chỉ được đọc trong src/core/chart/breakdown.ts cho chartType waterfall/stackedBar, còn diem-hoa-von khai 'sensitivity' và không có spec.breakdown, nên không có 'dòng phụ' nào hiện doan…
  - **Sửa (vi):** Điểm hoà vốn càng thấp so với sản lượng thực tế thì biên an toàn càng dày. Muốn so với doanh thu trên báo cáo, nhân sản lượng hoà vốn với giá bán để ra doanh thu hoà vốn tương ứng.
  - **Sửa (en):** The lower the break-even point is relative to actual output, the thicker the margin of safety. To compare against reported revenue, multiply the break-even quantity by the selling price to get the matching break-even revenue.

#### `don-bay-tong-hop`

- **T2 · khoHieu** — `explanation.meaning` (Ý nghĩa)
  - Hiện tại: "DOL đo phần khuếch đại do định phí hoạt động, DFL đo phần do lãi vay, nhân lại thành đòn bẩy tổng hợp."
  - Vấn đề: EBIT xuất hiện trong latex/expression và trong cả 3 thông điệp cảnh báo (WF-15) nhưng không được giải nghĩa ở đâu trên màn — EBIT không phải biến nhập (không có mô tả biến riêng) nên người mới không biết nó suy ra từ 3 ô Doanh thu/Tổng biến phí/Định phí hoạt động thế nào.
  - Bằng chứng: Rà spec-dump/full/10.json: 'EBIT' xuất hiện ở latex, expression và 3 message cảnh báo trong calc (EBIT không dương / EBIT trừ lãi vay / EBIT thấp hơn lãi vay) nhưng không có trong bất kỳ explanation.\* hay variables[].description nào của don-bay-tong-hop.
  - Phản biện: EBIT xuất hiện ở latex, expression và cả 3 thông điệp cảnh báo (corporate.ts) nhưng không một mục diễn giải hay biến nào giải nghĩa nó, dù công thức level 'advanced' (T2 ở advanced chỉ xét thuật ngữ riêng của công thức) — đối chiếu fcff (cũng advanced, cùng chuỗi định giá) cho thấy sản phẩm có nếp …
  - **Sửa (vi):** Hệ số khuếch đại từ doanh thu tới EPS: DOL đo phần khuếch đại do định phí hoạt động, DFL đo phần do lãi vay, nhân lại thành đòn bẩy tổng hợp. EBIT ở đây là lợi nhuận trước lãi vay và thuế, bằng doanh thu trừ biến phí trừ định phí hoạt động.
  - **Sửa (en):** The amplification factor from revenue to EPS: DOL measures the amplification from operating fixed cost, DFL measures the part from interest expense, and multiplying them gives the degree of total leverage. EBIT here is operating profit before interest and tax, equal to revenue minus variable cost minus operating fixed cost.

#### `so-hop-dong-toi-da`

- **T2 · khoHieu** — `explanation.meaning` (Ý nghĩa)
  - Hiện tại: "Mỗi hợp đồng đòi một khoản ký quỹ ban đầu bằng giá trị danh nghĩa nhân tỷ lệ ký quỹ"
  - Vấn đề: 'Giá trị danh nghĩa' xuất hiện mà không có ở đâu trên màn của chính công thức này giải nghĩa nó là gì (không phải biến nhập, không có mô tả riêng) — công thức level 'basic' nên T2 xét mọi thuật ngữ tài chính then chốt.
  - Bằng chứng: Rà toàn bộ screenText.basic/advanced của so-hop-dong-toi-da trong spec-dump/full/10.json: 'giá trị danh nghĩa' chỉ xuất hiện đúng một lần ở explanation.meaning, không xuất hiện lại ở mô tả biến hay mục nào khác trên màn này.
  - Phản biện: Đọc lại toàn bộ spec trong derivatives.ts: 'giá trị danh nghĩa' chỉ xuất hiện đúng một lần, ở chính câu này — ba biến nhập (Vốn ký quỹ, Điểm hợp đồng, Tỷ lệ ký quỹ) không có mô tả nào giải nghĩa nó bằng Điểm hợp đồng × Hệ số nhân; công thức level 'basic' nên phải xét thuật ngữ này dù nó cũng là tên…
  - **Sửa (vi):** Mỗi hợp đồng đòi một khoản ký quỹ ban đầu bằng giá trị danh nghĩa (điểm hợp đồng nhân hệ số nhân) nhân tỷ lệ ký quỹ; vốn chia cho khoản đó là số hợp đồng mở được.
  - **Sửa (en):** Each contract requires initial margin equal to its notional value (contract points times the multiplier) times the margin ratio; capital divided by that amount gives the number of contracts you can open.

### Lô 11 — `personal.ts + planning.ts`

#### `gia-von-trung-binh-dca`

- **T1 · sai** — `explanation.howToRead` (Cách đọc kết quả)

  - Hiện tại: "Mua cùng một số tiền mỗi đợt thì đợt giá thấp mua được nhiều cổ phiếu hơn, nên giá vốn trung bình luôn thấp hơn trung bình cộng các mức giá."
  - Vấn đề: Hai lỗi chồng nhau: (1) nội dung giải thích CƠ CHẾ vì sao giá vốn bình quân thấp hơn, không dạy đọc con số kết quả so với mốc nào; (2) mệnh đề định lượng 'luôn thấp hơn' sai khi các đợt mua CÙNG một mức giá — khi đó giá vốn trung bình chính là trung bình điều hoà (harmonic mean) và theo bất đẳng thức AM-HM, HM=AM khi mọi giá bằng nhau (dấu bằng, không phải 'thấp hơn').
  - Bằng chứng: Claim tự động qua driver (600 mẫu ngẫu nhiên, seed 20260911): 280/600 phản ví dụ vi phạm 'luôn thấp hơn'. Ca cụ thể xác minh bằng H.calc thật: ba đợt cùng giá 46.577 ₫ (tiền khác nhau) → giá vốn = 46.577 ₫ đúng bằng trung bình cộng ba giá — không thấp hơn.
  - Phản biện: Tự chạy lại calc thật (verify-t1.mjs): ba đợt CÙNG giá 46.577 (tiền khác nhau) cho kết quả 46.577,00 — bằng, không thấp hơn — nên 'luôn thấp hơn trung bình cộng' sai; thêm một ca lệch hẳn (100tr ở giá 100.000, 1tr ở giá 10.000) cho kết quả 91.818,18, CAO HƠN cả trung bình cộng 55.000, cho thấy lỗi …
  - **Sửa (vi):** So giá vốn trung bình vừa tính với thị giá hiện tại: thấp hơn thị giá là đang lãi, cao hơn là đang lỗ. Con số này luôn nằm giữa mức giá thấp nhất và cao nhất trong các đợt đã mua, không bao giờ vượt ra ngoài khoảng đó.
  - **Sửa (en):** Compare this average cost with the stock's current market price: below it means you are in profit, above it means a loss. The figure always falls between the lowest and highest prices among your purchase rounds, never outside that range.

- **P2 · sai** — `explanation.commonMistakes` (Sai lầm thường gặp)

  - Hiện tại: "Cộng các mức giá rồi chia ba. Cách đó bỏ qua việc mỗi đợt mua được số cổ phiếu khác nhau, cho ra giá vốn cao hơn thực tế."
  - Vấn đề: Chiều 'cao hơn thực tế' không phải lúc nào cũng đúng — khi đợt có GIÁ CAO lại được rót NHIỀU TIỀN hơn hẳn các đợt giá thấp, trung bình cộng đơn giản có thể THẤP hơn giá vốn thực (chiều ngược lại), vì giá vốn thực khi đó bị kéo lên gần mức giá cao (do trọng số tiền lớn).
  - Bằng chứng: Xác minh bằng H.calc thật (mẫu ngẫu nhiên seed 20260911, i=2 trong claim log): amount1=436.326 ₫ @ giá 35.870 ₫, amount2=218.197.176 ₫ @ giá 128.851 ₫ (đợt giá cao nhận phần lớn tiền) → giá vốn trung bình thực = 128.187,86 ₫, CAO HƠN trung bình cộng hai giá (82.360,5 ₫) — ngược chiều với câu 'cho ra giá vốn cao hơn thực tế'.
  - Phản biện: Tính tay lại ca amount1=436.326 ₫@35.870 ₫, amount2=218.197.176 ₫@128.851 ₫ (đợt giá cao nhận phần lớn tiền): giá vốn thực ≈128.180 ₫ CAO HƠN hẳn trung bình cộng hai giá (82.360,5 ₫) — ngược chiều với 'cho ra giá vốn cao hơn thực tế'; chiều lệch phụ thuộc đợt nào được rót nhiều tiền, không cố định.
  - **Sửa (vi):** Cộng các mức giá rồi chia ba, coi đó là giá vốn. Cách tính này bỏ qua số tiền khác nhau ở mỗi đợt, nên có thể lệch khá xa so với giá vốn thực — lệch theo hướng nào còn tuỳ đợt nào được rót nhiều tiền hơn.
  - **Sửa (en):** Adding up the prices and dividing by three, treating that as the cost basis. This ignores the different amount invested each round, so it can be well off the real average cost — which direction it drifts depends on which round received more money.

- **T2 · khoHieu** — `explanation.meaning` (Ý nghĩa)
  - Hiện tại: "Giá vốn trung bình khi mua DCA"
  - Vấn đề: 'DCA' xuất hiện ngay trong tên công thức (level: basic, phải xét mọi thuật ngữ) nhưng không được giải nghĩa ở bất cứ đâu trong 4 mục diễn giải hay mô tả biến — người mới chưa biết DCA là gì sẽ không hiểu công thức này áp dụng cho tình huống nào.
  - Bằng chứng: Rà toàn bộ meaning/whenToUse/howToRead/commonMistakes và variables.\*.description của gia-von-trung-binh-dca: không có chỗ nào viết ra cụm 'đầu tư định kỳ' hay diễn giải chữ viết tắt DCA; mô tả nhóm 'investing' (nơi có định nghĩa 'Đầu tư định kỳ') không hiện trên màn chi tiết.
  - Phản biện: Đọc lại toàn bộ spec trong planning.ts: DCA chỉ nằm trong tên công thức, cả 4 mục diễn giải lẫn 6 mô tả biến (amount1-3/price1-3) đều không viết ra 'đầu tư định kỳ' hay giải nghĩa chữ viết tắt; description có gợi ý nhưng description không render trên màn chi tiết (chỉ ở thẻ/tìm kiếm). Công thức lev…
  - **Sửa (vi):** Mức giá bình quân thực sự đã trả cho mỗi cổ phiếu sau khi gom nhiều đợt mua rải đều theo thời gian (DCA) ở các mức giá cao lẫn thấp.
  - **Sửa (en):** The average price actually paid per share after combining several purchases spread out over time (DCA) at both high and low prices.

#### `lai-tien-gui`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Lãi tăng theo đúng tỷ lệ với số tiền gửi và với số tháng."
  - Vấn đề: Đây là độ nhạy của kết quả theo hai biến đầu vào (tính tuyến tính của công thức), không phải cách đọc con số lãi cụ thể — rubric liệt kê 'độ nhạy của đầu vào' là điều howToRead KHÔNG được nói.
  - Bằng chứng: Đối chiếu tiêu đề mục: howToRead phải dạy một giá trị cụ thể nghĩa là gì và so với mốc nào (thị giá, lãi tiết kiệm khác, mục tiêu…); câu hiện tại không nêu mốc so sánh nào, chỉ mô tả cơ chế tuyến tính vốn đã thấy được từ chính expression phía trên.
  - Phản biện: Câu gốc là độ nhạy tuyến tính theo hai đầu vào — tự kiểm calc xác nhận đúng là tuyến tính (test 'gấp đôi kỳ hạn thì gấp đôi tiền lãi': 5.500.000→11.000.000) nhưng đó chính là nội dung bị cấm ở howToRead; câu sửa nêu đây là TỔNG lãi cả kỳ chứ không phải lãi suất năm, và thêm mốc mục tiêu/ngân hàng k…
  - **Sửa (vi):** Con số này là tổng tiền lãi cho cả kỳ hạn đã chọn, không phải mức lãi suất theo năm — so nó với mục tiêu tiết kiệm của bạn hoặc với đề nghị của một kỳ hạn hay ngân hàng khác.
  - **Sửa (en):** This figure is the total interest for the whole term you chose, not an annual rate — compare it with your savings goal or with an offer for a different term or bank.

#### `lich-tra-no`

- **P2 · sai** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Với cùng lãi suất và kỳ hạn, gốc đều luôn cho tổng lãi thấp hơn niên kim, đổi lại kỳ đầu nặng hơn."
  - Vấn đề: 'Luôn thấp hơn' sai ở biên lãi suất 0%/năm — khi đó cả hai phương thức đều cho tổng lãi đúng bằng 0, tức BẰNG NHAU chứ không phải gốc đều thấp hơn. Biên này nằm ngay trong khoảng nhập liệu (rate min=0, một đầu của thanh trượt).
  - Bằng chứng: Xác minh bằng calc: inputs {amount:800000000, rate:0, years:20, method:1} và method:2 đều ra 0 (đã có sẵn trong spec.tests 'lãi suất 0% thì không có đồng lãi nào'); tổng quát hoá đại số EMI·n−P và i·P·(n+1)/2 đều triệt tiêu khi i=0. Với i>0, n≥12 (bị chặn bởi years≥1) bất đẳng thức gốc đều ≤ niên kim vẫn đúng chặt — chỉ riêng điểm i=0 là dấu bằng.
  - Phản biện: Trong buildAmortisation(), interest = balance×i được tính GIỐNG HỆT nhau cho cả hai phương thức trước khi rẽ nhánh gốc/niên kim, nên ở rate=0% (đầu mút có thật của thanh trượt, đã có sẵn spec.test) tổng lãi hai phương thức đều bằng 0 — TIE chứ không phải 'gốc đều luôn thấp hơn'; với i>0 bất đẳng th…
  - **Sửa (vi):** Với cùng lãi suất và kỳ hạn, gốc đều không bao giờ cho tổng lãi cao hơn niên kim — bằng nhau khi lãi suất 0%/năm, còn lại đều thấp hơn — đổi lại kỳ đầu nặng hơn.
  - **Sửa (en):** For the same rate and term, equal-principal never yields higher total interest than annuity — they tie when the rate is 0%/year, and equal-principal is lower otherwise — at the cost of a heavier first period.

#### `rut-truoc-han`

- **P2 · sai** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "So con số này với phần lãi hợp đồng lẽ ra được hưởng (hiện ở phần số phụ) — chênh lệch chính là cái giá của việc rút sớm."
  - Vấn đề: 'Hiện ở phần số phụ' không đúng: với bộ số của chính người dùng, không có nơi nào trên màn hiển thị interestAtContractRate/lostInterest — công thức khai chartType:'none' (không biểu đồ, không breakdown) nên `extras` không được vẽ ra bất cứ đâu; toàn repo `src/ui` và `src/application` không có chỗ nào đọc `extras` ngoài hệ thống biểu đồ.
  - Bằng chứng: screenText (basic lẫn advanced) của rut-truoc-han trong full dump chỉ có 'example.note' (văn bản tĩnh, số cố định 2,29 triệu/2,25 triệu của RIÊNG bộ dữ liệu ví dụ) — không có dòng nào ứng với input hiện tại của người dùng. Driver còn xác nhận contractRate và termMonths là BIẾN CHẾT (đổi giá trị không đổi con số kết quả hiển thị) khi công thức không báo lỗi — hai biến này chỉ quyết định có báo lỗi…
  - Phản biện: calc trả extras.interestAtContractRate/lostInterest nhưng chartType:'none' và không khai spec.breakdown; cùng phép grep 'extras' như diem-hoa-von xác nhận không nơi nào trong src/ui/src/application đọc extras ngoài breakdown chart — 'hiện ở phần số phụ' không có thật trên màn cho kết quả sống, và c…
  - **Sửa (vi):** So con số này với phần lãi đáng lẽ được hưởng nếu tính theo lãi suất hợp đồng cho cùng số tháng đã gửi — chênh lệch chính là cái giá của việc rút sớm.
  - **Sửa (en):** Compare this figure with the interest you would have earned at the contract rate for the same number of months held — the gap is the price of withdrawing early.

#### `so-ky-dca`

- **P2 · sai** — `explanation.commonMistakes` (Sai lầm thường gặp)

  - Hiện tại: "Lấy mục tiêu chia cho mức góp rồi coi đó là số tháng — cách đó bỏ qua lợi nhuận tích luỹ nên ra thời gian dài hơn thực tế, nhất là ở kế hoạch nhiều năm."
  - Vấn đề: 'Dài hơn thực tế' sai ở biên lợi suất kỳ vọng 0%/năm — khi đó calc thật dùng đúng công thức Math.ceil(target/contribution), tức BẰNG với cách tính ngây thơ, không dài hơn.
  - Bằng chứng: Đọc calc thật: nhánh 'if (i===0) return ok(Math.ceil(target/contribution))' — với rate=0 (đầu mút thanh trượt) hai cách tính trùng nhau tuyệt đối. Tổng quát hoá: vì Math.ceil đơn điệu không giảm và số kỳ có lãi luôn ≤ số kỳ không lãi, cách ngây thơ luôn CHO KẾT QUẢ LỚN HƠN HOẶC BẰNG chứ không phải luôn dài hơn.
  - Phản biện: Đọc thẳng calc: nhánh 'if (i===0) return ok(Math.ceil(target/contribution))' cho thấy ở lợi suất kỳ vọng 0%/năm (đầu mút có thật của thanh trượt) cách 'ngây thơ' và cách đúng TRÙNG NHAU tuyệt đối, không phải 'dài hơn thực tế'; với i>0 thì ngây thơ mới thực sự dài hơn.
  - **Sửa (vi):** Lấy mục tiêu chia cho mức góp rồi coi đó là số tháng — cách đó bỏ qua lợi nhuận tích luỹ nên cho thời gian dài hơn hoặc bằng thực tế (bằng nhau khi lợi suất kỳ vọng là 0%), chênh lệch rõ nhất ở kế hoạch nhiều năm.
  - **Sửa (en):** Dividing the target by the contribution and treating that as the number of months — this ignores accumulated returns, so it gives a time that is longer than or equal to the actual one (equal when the expected return is 0%), with the gap becoming clearest for multi-year plans.

- **T2 · khoHieu** — `explanation.meaning` (Ý nghĩa)
  - Hiện tại: "Số kỳ DCA để đạt mục tiêu"
  - Vấn đề: Cùng lỗ hổng thuật ngữ như gia-von-trung-binh-dca: 'DCA' trong tên công thức không được giải nghĩa ở đâu trong 4 mục diễn giải hay mô tả biến.
  - Bằng chứng: Rà toàn bộ `explanation.*` và `variables.*.description` của so-ky-dca: không có cụm nào diễn giải DCA là gì (đầu tư định kỳ, số tiền cố định mỗi kỳ).
  - Phản biện: Cùng lỗ hổng thuật ngữ như gia-von-trung-binh-dca: DCA nằm trong tên công thức, 4 mục diễn giải chỉ dùng 'góp đều'/'đều đặn' mà không nối lại với chữ viết tắt DCA ở đâu; description có định nghĩa nhưng không render trên màn chi tiết. Công thức level 'basic' nên phải xét thuật ngữ này.
  - **Sửa (vi):** Số tháng góp đều tối thiểu — theo cách đầu tư định kỳ số tiền cố định mỗi tháng (DCA) — để tổng tiền góp cộng lợi nhuận tích luỹ chạm mức mục tiêu.
  - **Sửa (en):** The minimum number of months of contributing a fixed amount each period (DCA) for total contributions plus accumulated returns to reach the target.

#### `thue-tncn-dau-tu`

- **P2 · sai** — `category.personal-tax.description`

  - Hiện tại: "Thuế thu nhập từ tiền lương theo biểu luỹ tiến từng phần."
  - Vấn đề: Mô tả nhóm 'personal-tax' nói về thuế TIỀN LƯƠNG theo biểu LUỸ TIẾN TỪNG PHẦN, nhưng nhóm này chỉ có DUY NHẤT một công thức (thue-tncn-dau-tu) tính thuế CHUYỂN NHƯỢNG CHỨNG KHOÁN + CỔ TỨC TIỀN MẶT theo hai thuế suất PHẲNG (không luỹ tiến, không liên quan tiền lương) — mô tả nhóm sai hoàn toàn với nội dung duy nhất của nhóm.
  - Bằng chứng: \_categories.json: personal-tax.expectedCount=1, members=['thue-tncn-dau-tu']. Công thức dùng usesConstants=['tax.transfer.sell' (thuế suất phẳng 0,1%), 'tax.dividend.cash' (thuế suất phẳng 5%)] qua rateOf(), nhân thẳng không qua bậc/khung nào. Toàn bộ personal.ts và planning.ts không có bất kỳ biểu thuế luỹ tiến từng phần hay biến 'tiền lương' nào.
  - Phản biện: personal-tax.expectedCount=1 và grep xác nhận thue-tncn-dau-tu là THÀNH VIÊN DUY NHẤT; calc của nó là T=Q·P_bán·r_cn + Q·D·r_ct với hai thuế suất PHẲNG đọc qua rateOf(), không có tiền lương, không có biểu luỹ tiến từng phần nào trong toàn bộ planning.ts/personal.ts — mô tả nhóm hiện tại sai hoàn to…
  - **Sửa (vi):** Thuế thu nhập cá nhân trên một giao dịch đầu tư chứng khoán trong năm: thuế chuyển nhượng khi bán và thuế cổ tức tiền mặt, cả hai đều theo thuế suất cố định.
  - **Sửa (en):** Personal income tax on a securities investment transaction in a year: transfer tax on the sale and tax on cash dividends, both at flat rates.

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Hai khoản có bản chất khác nhau: thuế chuyển nhượng tính trên giá trị bán nên lỗ vẫn phải nộp, còn thuế cổ tức khấu trừ trước khi tiền về tài khoản."
  - Vấn đề: Mô tả BẢN CHẤT của hai thành phần thuế (rubric liệt kê là điều howToRead KHÔNG được nói), không dạy đọc con số TỔNG THUẾ kết quả; đồng thời phần 'lỗ vẫn phải nộp' đã lặp gần như nguyên ý với chính commonMistakes ngay bên dưới, gây trùng lặp giữa hai mục trên cùng màn.
  - Bằng chứng: Đối chiếu commonMistakes cùng công thức: 'Tưởng bán lỗ thì cả năm không mất đồng thuế nào — thuế chuyển nhượng thu theo giá trị bán, không theo lãi.' — cùng một luận điểm 'lỗ vẫn phải nộp thuế chuyển nhượng' xuất hiện ở cả hai mục.
  - Phản biện: Câu gốc tả bản chất của hai khoản thuế và lặp gần nguyên ý commonMistakes ('lỗ vẫn phải nộp'), không đọc tổng thuế 197.000 ₫; câu sửa đọc bằng cách so với lãi/lỗ thực tế và trỏ đúng biểu đồ bóc tách có thật (breakdown transferTax/dividendTax đã khai trong spec), không bịa tính năng.
  - **Sửa (vi):** So tổng thuế này với phần lãi hoặc lỗ thực tế từ giao dịch, để thấy thuế chiếm bao nhiêu trong khoản tiền nhận về. Biểu đồ bóc tách bên dưới tách riêng phần đến từ bán và phần đến từ cổ tức.
  - **Sửa (en):** Compare this total tax with the actual gain or loss from the transaction, to see how much of the money you receive it takes up. The breakdown chart below separates the portion from the sale from the portion from the dividend.

#### `tra-gop-nien-kim`

- **T1 · khoHieu** — `explanation.howToRead` (Cách đọc kết quả)
  - Hiện tại: "Những năm đầu phần lớn tiền trả là lãi, nên trả trước hạn sớm tiết kiệm được nhiều hơn trả muộn."
  - Vấn đề: Đây là bản chất của cơ cấu gốc/lãi qua thời gian (một hiểu biết đúng, hữu ích) chứ không dạy đọc CON SỐ KẾT QUẢ (khoản trả hằng tháng) — không nói con số này cao/thấp nghĩa là gì hay so với mốc nào.
  - Bằng chứng: Đối chiếu tiêu đề mục 'Cách đọc kết quả' trong BRIEF: phải dạy đọc giá trị kết quả kèm mốc so sánh; câu hiện tại thuộc nhóm 'bản chất các thành phần' — nhóm rubric liệt kê là KHÔNG thuộc howToRead.
  - Phản biện: Câu gốc là bản chất cơ cấu gốc/lãi, không đọc khoản trả hằng tháng; câu sửa so đúng đối tượng có thật trong Registry ('trả góp gốc đều', id tra-gop-goc-deu, payment giảm dần theo thời gian trong khi niên kim không đổi — đúng như spec của nó). Finding gốc thiếu câu ghép ở đích commonMistakes (chỉ ch…
  - Đề xuất chuyển sang: `explanation.commonMistakes`
  - **Sửa (vi):** howToRead thay bằng: «So khoản trả hằng tháng này với thu nhập của bạn để biết có kham nổi lâu dài không. Con số này giữ nguyên suốt toàn bộ kỳ hạn vay — không giảm dần theo thời gian như ở trả góp gốc đều.» — câu cơ cấu gốc/lãi cũ chuyển xuống commonMistakes, ghép thành: «Chỉ nhìn số tiền hằng tháng thấy vừa sức mà không cộng lại tổng lãi phải trả cả kỳ hạn. Cũng dễ quên rằng những năm đầu phần lớn khoản trả là lãi chứ chưa phải gốc, nên trả trước hạn càng sớm càng tiết kiệm được nhiều hơn để càng muộn.»
  - **Sửa (en):** howToRead becomes: «Compare this monthly payment with your income to judge whether it is affordable over the long run. The figure stays the same for the entire loan term — it does not decrease over time the way the equal-principal payment does.» — the old principal/interest-structure sentence moves into commonMistakes, merged as: «Judging affordability only by the monthly amount, without adding up the total interest paid over the whole term. It is also easy to forget that in the early years most of each payment is interest rather than principal, so paying off early saves more than waiting.»

## Phát hiện bị bác ở vòng phản biện (3)

Ghi lại để không ai dựng lại đúng phát hiện này lần sau.

- **02/so-graham** — `example.note` (P2): "Giá thị trường 92.000 ₫ đang cao hơn hẳn mức trần theo chuẩn Graham." — Đây đúng là ca 'giá thị trường 92.000' mà docblock của prose-audit.test.ts (mục 'Ba phép kiểm ĐÃ THỬ RỒI BỎ') nêu đích danh là đối chiếu bên ngoài hợp lệ — 92.000 ₫ là thị giá cố định của công ty mẫu WF-03 dùng xuyên suốt P/E, P/B, EV/Revenue, vốn hoá cùng cặp EPS 6.050/BVPS 24.800 này, không phải số bịa; so-graham không có biến giá nên calc không có gì để mâu thuẫn, và mệnh đề cũng không phải dạng định lượng có phản ví dụ — không khớp cả hai nhánh của tiêu chí P2.
- **04/macd-duong-tin-hieu** — `example.note` (T3): "MACD đã xuống −247 ₫ nhưng đường tín hiệu còn dương vì vẫn mang theo phần đà tăng trước đó — histog…" — prose-audit.test.ts (docblock quanh dòng 448, hàm raLenhMuaBan) trích nguyên văn chính cụm 'tín hiệu bán đã hình thành' — grep xác nhận cụm này chỉ tồn tại đúng một chỗ trong toàn repo, ở chính câu example.note này — làm ví dụ CỐ Ý được miễn trừ, với lý do ghi rõ: câu mô tả quy ước của chỉ báo (histogram âm sâu được giới phân tích kỹ thuật gọi là gì), không ra lệnh cho ai; cấm nó là cấm mô tả chính đối tượng công thức tính ra. Đây là quyết định sản phẩm đã cân nhắc và ghi lại, không phải khoảng trống của regex — finding không đưa thêm bằng chứng nào để đảo ngược quyết định đó.
- **05/vwap** — `explanation.commonMistakes` (P1): "Nhầm với VWAP trong phiên của bảng giá: bản trong phiên tính theo từng lệnh khớp và giá điển hình (…" — Quan sát kỹ thuật đúng — 'tính theo từng lệnh khớp' và 'giá điển hình (cao+thấp+đóng)/3' là hai cách không tương thích (một lệnh khớp chỉ có một giá; tự dựng 2 kịch bản tick độc lập cho chênh lệch tới 6,7% giữa hai cách tính) — nhưng finding không kèm kịch bản bằng số như bắt buộc của P1, và kết luận hành động chính của câu gốc ('hai con số không trùng nhau, đừng mong khớp') vẫn đúng hướng chứ không bị đảo ngược; đề xuất hạ xuống mức góp ý chính xác hoá cơ chế tính (gần P2 hơn P1), không giữ nguyên P1.

## Quy ước xác nhận trong lúc rà, và hai lỗ hổng cửa gác lộ ra

`refs/<lô>.mjs` (bản tính tham chiếu viết mù) sai domain ở nhiều điểm biên trước khi đối chiếu lại `calc` — 36 lần sửa, đều là quy ước sản phẩm đúng (chặn input không có thật, mã cảnh báo theo FR-06), không phải lỗi. Đáng ghi lại hai lỗ hổng ở CHÍNH cửa gác cơ học của dự án, lộ ra qua lượt rà:

- **`constants-gate.test.ts` bỏ sót lời gọi hằng số qua hàm dùng chung.** `loi-nhuan-rong` đọc 4 hằng số qua `totalCostOf()` (hàm phụ trong `fees.ts`) nhưng không khai `usesConstants` — cửa gác quét theo khối `FormulaModule` nên không theo dấu qua lời gọi hàm gián tiếp. Xem finding F5 lô 09.
- **`raLenhMuaBan()` trong `prose-audit.test.ts` không bắt hết lời khuyên đầu tư.** `loi-suat-vuot-chuan.howToRead` ("nên cân nhắc đầu tư theo chỉ số") là khuyến nghị đầu tư thật (CON-11) nhưng lách qua cả 6 mẫu regex hiện có — không mẫu nào bắt "nên cân nhắc + [danh từ]". Xem finding P1 lô 08.

---

## Việc còn lại

- [x] Chủ dự án chọn phát hiện nào áp — chọn "áp hết, trừ mục cần quyết"; đã áp đủ 87.
- [x] Sửa prose (vi + en), `calc`/`tests`/`example`; `npm run check` xanh; `gen:summaries` không lệch.
- [x] Vá hai lỗ hổng cửa gác.
- [ ] Đây là lượt rà bằng máy có phản biện, **không thay thế** việc chuyên gia tài chính đọc lại toàn
      bộ — mục "việc chặn v0.1 thứ ba" trong `CLAUDE.md`/`README.md` giữ nguyên trạng thái cho tới khi
      chủ dự án xác nhận.
- [ ] 75 đoạn diễn giải vừa viết lại (chủ yếu "Cách đọc kết quả") cũng là nội dung MỚI — nên coi là
      "chưa qua chuyên gia đọc lại" như phần còn lại, dù đã qua một vòng phản biện bằng máy.
- [ ] Hai ghi chú trong bảng feedback chưa suy ra được từ chữ, cần ảnh chụp hoặc chủ dự án nói rõ:
      "Nghìn đ và đ???" (nghi lệch giữa đơn vị ô nhập `₫` và thang hiển thị tự động "nghìn ₫") và
      "K có dấu trừ" (nghi số âm mất dấu ở một chỗ hiển thị).
- [ ] Mục #43 mới áp cho nhóm Định giá + Chỉ số DN. 100 công thức còn lại (nhóm kỹ thuật, rủi ro,
      phái sinh, cá nhân) vẫn chưa có ký hiệu ở nhãn ô nhập — để lại theo đúng phạm vi đã chốt.
