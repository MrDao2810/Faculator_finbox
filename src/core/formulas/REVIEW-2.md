# Lượt rà thứ hai: nội dung 111 công thức sau khi thay ví dụ thật (17/09/2026)

Trạng thái: **chưa áp, chờ chủ dự án duyệt.** File này là hồ sơ rà; chưa có chữ hay dòng code nào
trong `src/` bị đổi theo nó. Đọc cùng `REVIEW.md` (lượt rà 11–13/09) để không dựng lại phát hiện đã
bị bác ở lượt trước.

## Yêu cầu

Chủ dự án: _"tiếp tục kiểm tra các công thức đang có giải thích sai hoặc công thức sai"_.

## Vì sao cần lượt này

Lượt 11–13/09 đã rà phần toán và 4 mục giải thích. Sau đó, ngày 15–16/09, khối Ví dụ của cả 111 công
thức được thay bằng số thật lấy từ một bảng tính, và chưa ai rà lại chữ của khối ấy. Lần đối chiếu
bảng tính trước khi áp đã thấy 18 chỗ chữ mâu thuẫn với số; một phần đã lọt vào repo.

## Cách làm

1. Dump toàn bộ chữ trên màn chi tiết của 111 công thức, kèm kết quả engine thật của ví dụ, và dựng
   một "probe" gọi `runFormula()` với đầu vào tuỳ ý. Tất cả nằm trong thư mục tạm của phiên, không
   thêm file nào vào `src/`.
2. 8 lô rà song song theo file nhóm, cùng một hướng dẫn: mọi câu định lượng phải tính lại bằng probe;
   câu phán đoán chỉ được báo khi có phản ví dụ cụ thể; không dựng lại quy ước sản phẩm đã chốt.
3. Kiểm lại từng phát hiện: đọc bằng chứng, chạy lại probe cho các câu số quan trọng, đọc code cho
   các câu về giao diện (màn Cài đặt, `extras.rule72`, bảng dòng tiền XIRR). Chỉnh mức 7 phát hiện và
   thêm 1 phát hiện lô G bỏ sót (X1).

## Kết quả

- **105 phát hiện trên 67 công thức**: 2 S1, 33 S2, 70 S3. 44 công thức không có phát hiện.
- **Không công thức nào tính ra số sai ở miền dùng thật.** Hai chỗ lệch ở mức định nghĩa: dải
  Bollinger chia độ lệch chuẩn cho n−1 trong khi Bollinger chia n (D10), và tỷ số thông tin nhận chuẩn
  là một con số cố định nên thực chất ra đúng tỷ số Sharpe (E2, E3).
- **S1**: ví dụ Treynor ghép lợi suất của VN-Index với beta của FPT nên −7,61 không phải tỷ số Treynor
  của danh mục nào (E1); định nghĩa độ lệch chuẩn của dải Bollinger (D10).

Mức: **S1** số hoặc định nghĩa sai · **S2** câu sai sự thật hoặc gây hiểu sai rõ ràng · **S3** lệch nhỏ.

Chỉnh mức khi kiểm lại: D1 từ S1 xuống S2 (lỗi câu chữ, không phải phép tính, dù kết luận bị ngược);
D10 từ S2 lên S1 (định nghĩa); H4, H5, B3, E3 từ S2 xuống S3 (cách diễn đạt, hoặc lối tắt màn đã nói
một phần); G14 từ S3 lên S2 (dạy sai rằng cắt lỗ chặn được khoản lỗ khi giá nhảy qua).

## Năm nguyên nhân gốc

1. **Giải thích trích số của ví dụ cũ** (5 chỗ). Câu "ví dụ trên ra…" viết khi ví dụ còn trùng bộ mặc
   định, không ai cập nhật khi ví dụ đổi: `capm` (A4), `ddm-hai-giai-doan` (A2), `phi-giao-dich-mua`
   (G3), `macd-duong-tin-hieu` (D1, nói histogram âm sâu trong khi ví dụ ra dương), `hpr` (F1).
2. **Câu định lượng trong khối Ví dụ sai với engine hoặc với chuỗi giá thật**: độ nhạy của DDM (A1) và
   DCF (A8); `von-hoa-thi-truong` "đáy 24/07, bốc hơi gần 17.000 tỷ" trong khi vốn hoá tăng (B1);
   `gui-quay-vong` "lãi kép gần như bù hết" trong khi chỉ bù 54% (H2); `lai-tien-gui` "chừng 600
   nghìn" (H1); `rsi-wilder` tả ngược cơ chế (D2); `co-lenh-rui-ro` "cắt lỗ dưới đáy tháng 8" (C1);
   `do-lech-chuan-ban-phan` "luôn nhỏ hơn độ lệch chuẩn" (E10); `phi-luu-ky` "2 tháng" cho 49 ngày (G7).
3. **Ví dụ phạm đúng lỗi màn đó cảnh báo, hoặc ghép số không cùng gốc**: Treynor (E1); tỷ số thông tin
   lấy lãi tiết kiệm làm chuẩn (E2); WACC vốn chủ sổ sách (A7); biên an toàn nói "lấy từ DCF" trong khi
   ô ấy nối từ Gordon (A13); EV/EBITDA "tám năm hoàn vốn" (B6); PEG dùng g đã qua (B7); P/S và EV/Sales
   "cùng đo một thứ" (B2); tổng lợi suất tái đầu tư "giữ 5 năm" dựng từ số 2 năm (F5); trung bình hình
   học trộn kỳ 12 tháng với kỳ 8 tháng (F4).
4. **Khái niệm sai lặp lại ở nhiều màn**: beta đo "mức dao động" (A5, E4, E5, E6; FPT beta 0,90 nhưng
   dao động gấp 1,65 lần VN-Index trên cùng cửa sổ); "tiền và tương đương tiền" trong EV và nợ ròng
   trong khi ví dụ trừ cả đầu tư tài chính ngắn hạn (B5, A10); D/E nói "vay" trong khi chia tổng nợ phải
   trả (C8); ROE và vòng quay tài sản nói "trong một năm" trong khi không quy năm (C5, C10); công ty
   chứng khoán "khấu trừ thuế cổ tức" (H6, X1).
5. **Lời hứa về giao diện không có thật**: "Sửa được ở màn Cài đặt" trên 5 màn phí (G1, G2, cùng ý ở
   `shared.ts:32`); "số phụ theo quy tắc 72" không hiện trên màn (F2); "biểu đồ bóc tách bên dưới"
   (H7); ví dụ XIRR không nạp được dòng tiền nên khối Ví dụ in "≈ \_ \_ %/năm" (F7).

## Cần chủ dự án quyết (10 mục)

| #   | Việc                                                                                                      | Phương án                                                                      | Đề xuất                                                                                                                                                                                             |
| --- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Độ lệch chuẩn của 4 công thức dải Bollinger (D10)                                                         | (a) đổi calc sang chia n như Bollinger; (b) giữ n−1, nói rõ trên màn           | (a): đúng định nghĩa của nguồn mà màn trích. Đổi số 4 ví dụ và ca kiểm; dải trên của ví dụ từ 74.988 thành 74.902 ₫                                                                                 |
| Q2  | Tỷ số thông tin nhận chuẩn là một con số cố định (E2, E3)                                                 | (a) giữ, sửa ví dụ và chữ cho thật; (b) đổi chuẩn sang chuỗi VN-Index như Beta | (a) cho lượt này; (b) để thành gói riêng                                                                                                                                                            |
| Q3  | Ví dụ WACC dùng vốn chủ sổ sách (A7)                                                                      | (a) đổi sang vốn hoá 124.631,5 tỷ ₫; (b) giữ                                   | (a): khớp "Sai lầm thường gặp" của chính công thức. Hệ quả đo được: WACC 9,36% thành 10,87%, DCF 79.161 thành 60.651 ₫, thấp hơn thị giá 72.700 ₫, biên an toàn thành âm; chữ 3 ví dụ phải viết lại |
| Q4  | Số 8,13% ở ví dụ `capm` là cột nào của Damodaran (A6)                                                     | xác nhận nguồn                                                                 | nếu là tổng phần bù rủi ro của Việt Nam thì chỉ sửa tên đại lượng trong dòng nguồn                                                                                                                  |
| Q5  | "Sửa được ở màn Cài đặt" (G1, G2, `shared.ts:32`)                                                         | (a) sửa chữ theo đúng hiện trạng; (b) thêm chức năng sửa mức phí               | (a)                                                                                                                                                                                                 |
| Q6  | Căn cứ pháp lý phí lưu ký: Quyết định 1541/QĐ-BTC (ví dụ) hay Thông tư 101/2021 và 83/2024 (hằng số) (G8) | tra lại văn bản                                                                | giữ theo hồ sơ đã duyệt 17/08 cho tới khi có văn bản khác; sửa dòng nguồn của ví dụ cho khớp                                                                                                        |
| Q7  | Lãi suất phi rủi ro: ô nhập dặn TPCP kỳ hạn 1 năm, ba ví dụ dùng kỳ hạn 10 năm (E7)                       | (a) sửa mô tả ô; (b) thay số kỳ hạn 1 năm vào 3 ví dụ                          | (a): cùng số với CAPM                                                                                                                                                                               |
| Q8  | Cảnh báo "Cần ít nhất 60 phiên" khi chuỗi ngắn hơn thanh trượt (E14: 6 công thức, cùng khuôn ở Beta)      | (a) sửa câu, gợi ý kéo thanh trượt; (b) tính trên số phiên đang có             | (a)                                                                                                                                                                                                 |
| Q9  | Ví dụ XIRR không nạp được dòng tiền (F7)                                                                  | (a) thêm lối nạp dòng tiền của ví dụ vào bảng; (b) chỉ ghi dòng tiền bằng chữ  | (a)                                                                                                                                                                                                 |
| Q10 | "Số phụ theo quy tắc 72" không hiện (F2)                                                                  | (a) sửa chữ; (b) hiện `extras.rule72` trên màn                                 | (a)                                                                                                                                                                                                 |

## Đề xuất kèm: chặn nguyên nhân gốc số 1

Thêm một phép vào `src/application/prose-audit.test.ts`: trong 4 mục giải thích, câu nào nhắc "ví dụ
trên", "ví dụ trên màn" hay "trong ví dụ" mà có con số thì đỏ. Số của ví dụ chỉ nằm ở `example.note`,
ngay cạnh ví dụ; 4 mục giải thích dùng số minh hoạ. Khi áp, năm câu ở nguyên nhân 1 viết lại theo dạng
minh hoạ thay vì neo lại vào số ví dụ mới (câu sửa trong danh sách dưới đang neo vào số mới, sẽ đổi
theo), để lần đổi ví dụ sau không lặp lại lỗi này.

## Không đề nghị sửa

- A14 `diem-hoa-von`: biến phí 689.600 so với 689.618 ₫, kết quả chỉ lệch 0,006%.
- Phần số của B4 `ev`: vốn hoá 124.631,5 so với 124.631,79 tỷ ₫ (lệch 0,0002%, EV hiển thị không đổi).
  Chỉ sửa phần ngày trong tiêu đề.

## Việc còn lại

- [ ] Chủ dự án duyệt danh sách dưới đây và chốt Q1 tới Q10.
- [ ] Áp theo quyết định, chạy `npm run check`, cập nhật `TASK.md`.

## Danh sách đầy đủ theo file và công thức

Mã phát hiện (A1, B3…) là mã lô rà cộng số thứ tự, dùng để chỉ nhanh khi duyệt. Mức sau khi kiểm lại: **2 S1 · 33 S2 · 70 S3**, tổng **105**.

### `valuation-dcf.ts`

#### `ddm-hai-giai-doan` — DDM hai giai đoạn

**A1 · S2 · câu sai** — `example.note` (src/core/formulas/valuation-dcf.ts:484)

- **Trích:** Phần lớn giá trị vẫn nằm ở giá trị cuối kỳ chứ không ở năm năm cổ tức đầu — sai một điểm phần trăm ở g vĩnh viễn làm kết quả xê dịch mạnh hơn sai năm điểm ở g giai đoạn đầu.
- **Vấn đề:** Câu độ nhạy sai chiều: lệch năm điểm ở g giai đoạn đầu làm kết quả xê dịch MẠNH HƠN lệch một điểm ở g vĩnh viễn, ở cả hai hướng. Một điểm ở g vĩnh viễn chỉ ngang khoảng ba điểm ở g giai đoạn đầu. (Vế 'phần lớn giá trị nằm ở giá trị cuối kỳ' thì đúng: 75,89%.)
- **Bằng chứng:** Probe ddm-hai-giai-doan trên bộ ví dụ (43.845,09 ₫): g1 14→9: 35.833,32 ₫ (−18,27%); g1 14→19: 53.304,77 ₫ (+21,58%); g2 5→4: 39.367,00 ₫ (−10,21%); g2 5→6: 49.836,04 ₫ (+13,66%). Ba điểm ở g1: g1 11: 38.875,96 ₫ (−11,33%); g1 17: 49.335,15 ₫ (+12,52%). Tỷ trọng giá trị cuối kỳ: 33.273,54 ÷ 43.845,09 = 75,89%.
- **Sửa (vi):** Giai đoạn tăng nhanh lấy theo mức tăng lợi nhuận sau thuế nửa đầu 2026 của FPT. Phần lớn giá trị vẫn nằm ở giá trị cuối kỳ chứ không ở năm năm cổ tức đầu, nên một điểm phần trăm ở g vĩnh viễn nặng ngang khoảng ba điểm ở g giai đoạn đầu: hạ g vĩnh viễn từ 5% xuống 4% làm kết quả giảm khoảng 10%, còn hạ g giai đoạn đầu từ 14% xuống 11% làm kết quả giảm khoảng 11%.
- **Sửa (en):** The fast-growth stage follows FPT’s net-profit growth in the first half of 2026. Most of the value still sits in the terminal value rather than in the first five years of dividends, so one percentage point on the perpetual g weighs about as much as three points on the early-stage g: cutting the perpetual g from 5% to 4% lowers the result by about 10%, while cutting the early-stage g from 14% to 11% lowers it by about 11%.

**A2 · S2 · ví dụ** — `explanation.howToRead` (src/core/formulas/valuation-dcf.ts:462)

- **Trích:** Con số là giá trị một cổ phiếu theo mô hình — ví dụ trên cho 40.506,6 ₫; cao hơn thị giá là cổ phiếu đang rẻ theo cách tính này, thấp hơn là đang đắt. Nhìn thêm cột 'Giá trị cuối kỳ' trên biểu đồ: ở ví dụ nó chiếm khoảng ba phần tư tổng số, nên con số bạn đọc dựa vào giả định dài hạn nhiều hơn vào mấy năm tăng nhanh.
- **Vấn đề:** 40.506,6 ₫ là kết quả của bộ MẶC ĐỊNH (g1 15%, 5 năm, g2 4%, r 12%); câu được viết 11–13/09 khi khối Ví dụ còn trùng bộ mặc định. Từ 15–16/09 khối Ví dụ là FPT (tiêu đề 'tăng 14%/năm trong 5 năm rồi 5% mãi mãi, r 11,92%', dòng 'Ví dụ gốc cho: 43.845 ₫'), nên mục này trích cho 'ví dụ' một con số không có ở khối Ví dụ. Phụ: chartType 'stackedBar' nên biểu đồ mặc định là đường quét; cột 'Giá trị cuối kỳ' chỉ hiện sau khi chọn 'Bóc tách' ở ô 'Xem kết quả đổi theo'.
- **Bằng chứng:** Engine ví dụ: 43.845,09 ₫ (pvStage1 10.571,55; pvTerminal 33.273,54, tức 75,89%). Bộ mặc định: 40.506,60 ₫ (73,26%). REVIEW.md dòng 290–292: câu viết lại với bằng chứng 'đọc đúng số ví dụ (40.506,6 ₫…)'. src/ui/result/ExampleBlock.tsx dòng 141–145 hiện 'Ví dụ gốc cho: <example.expected>'. src/core/chart/build.ts dòng 575: bóc tách chỉ là mặc định khi chartType === 'waterfall'; nhãn mục chọn là BREAKDOWN_LABEL 'Bóc tách' (breakdown.ts dòng 20).
- **Sửa (vi):** Con số là giá trị một cổ phiếu theo mô hình, ví dụ FPT trên màn cho 43.845 ₫; cao hơn thị giá là cổ phiếu đang rẻ theo cách tính này, thấp hơn là đang đắt. Chọn 'Bóc tách' ở biểu đồ để xem cột 'Giá trị cuối kỳ': ở ví dụ nó chiếm khoảng ba phần tư tổng số, nên con số bạn đọc dựa vào giả định dài hạn nhiều hơn vào mấy năm tăng nhanh.
- **Sửa (en):** The figure is the value of one share under this model; the FPT example on this screen gives 43,845 ₫. Above the market price the stock looks cheap by this calculation, below it looks expensive. Pick 'Breakdown' on the chart to see the 'Terminal value' bar: in the example it accounts for about three quarters of the total, so the number you read leans more on the long-term assumption than on the fast-growth years.

**A3 · S2 · gây hiểu sai** — `calc` (src/core/formulas/valuation-dcf.ts:582)

- **Trích:** let dividend = v('dividend'); … return ok(pvStage1 + pvTerminal, '₫', { extras: { pvStage1, pvTerminal } });
- **Vấn đề:** Ô 'Cổ tức vừa trả (D0)' cho phép 0 (min 0). Với D0 = 0 calc không có chốt chặn nào và trả '0 ₫' như một mức giá cổ phiếu, không cảnh báo. Người mới đọc là cổ phiếu đáng giá 0 ₫, trong khi thực ra mô hình cổ tức không áp dụng được cho doanh nghiệp chưa trả cổ tức. mo-hinh-gordon đã được vá đúng ca này (REVIEW.md, F5 của mo-hinh-gordon), DDM hai giai đoạn thì chưa; trái FR-06 (không bày 0 thay cho lỗi).
- **Bằng chứng:** Probe ddm-hai-giai-doan {dividend 0} trên bộ ví dụ và trên bộ mặc định: value 0 ₫, warning null. Cùng đầu vào ở mo-hinh-gordon: MEANINGLESS 'Cổ tức vừa trả bằng 0 thì không có dòng cổ tức nào để chiết khấu…'. calc dòng 544–598 chỉ chặn r = g2 (dòng 548) và r < g2 (dòng 562).
- **Sửa (vi):** Thêm chốt chặn ở đầu calc như mo-hinh-gordon: dividend bằng 0 thì trả fail(MEANINGLESS) với thông điệp 'Cổ tức vừa trả bằng 0 thì không có dòng cổ tức nào để chiết khấu, nên cách này không định giá được doanh nghiệp chưa trả cổ tức.' và gợi ý 'Nhập cổ tức tiền mặt 12 tháng gần nhất, hoặc dùng một cách định giá dựa trên dòng tiền nếu doanh nghiệp chưa trả cổ tức.'; thêm ca kiểm {dividend: 0, growthStage1: 15, years: 5, growthTerminal: 4, requiredReturn: 12} với expected null, expectedWarning 'MEANINGLESS'.
- **Sửa (en):** Add a guard at the top of calc, as in mo-hinh-gordon: when dividend is 0, return fail(MEANINGLESS) with the message 'A most recent dividend of 0 leaves no dividend stream to discount, so this method cannot value a company that pays no dividend.' and the fix line 'Enter the cash dividend of the last 12 months, or use a cash-flow based method if the company pays no dividend.'; add a test {dividend: 0, growthStage1: 15, years: 5, growthTerminal: 4, requiredReturn: 12} with expected null and expectedWarning 'MEANINGLESS'.

#### `capm` — CAPM — chi phí vốn chủ sở hữu

**A4 · S2 · ví dụ** — `explanation.howToRead` (src/core/formulas/valuation-dcf.ts:702)

- **Trích:** Con số là mức sinh lợi tối thiểu mỗi năm cổ đông nên đòi ở cổ phiếu này: ví dụ trên ra 13,1%/năm, cao hơn lãi suất phi rủi ro 3,5% gần mười điểm phần trăm — đó là phần bù cho rủi ro.
- **Vấn đề:** 13,1% và 3,5% là bộ MẶC ĐỊNH (3,5 + 1,2 × 8); câu viết 11–13/09 khi khối Ví dụ còn trùng bộ mặc định. Khối Ví dụ hiện là FPT: lợi suất TPCP 4,57%, beta 0,9043, ERP 8,13%, 'Ví dụ gốc cho: 11,92 %', tức cao hơn lãi suất phi rủi ro khoảng 7,35 điểm chứ không 'gần mười điểm'. Bấm 'Về số của ví dụ' thì màn hiện 11,92% trong khi mục này nói ví dụ ra 13,1%.
- **Bằng chứng:** Engine ví dụ capm: 11,921959% (4,57 + 0,9043 × 8,13); 11,921959 − 4,57 = 7,352 điểm. Bộ mặc định: 13,1%. REVIEW.md dòng 271: 'Số trong câu viết lại lấy từ chính khối Ví dụ: 3,5 + 1,2 × 8 = 13,1'.
- **Sửa (vi):** Con số là mức sinh lợi tối thiểu mỗi năm cổ đông nên đòi ở cổ phiếu này: ví dụ FPT trên màn ra 11,92%/năm, cao hơn lãi suất phi rủi ro 4,57% khoảng 7,35 điểm phần trăm, đó là phần bù cho rủi ro. Lấy nó so với lãi gửi tiết kiệm hoặc lợi suất trái phiếu Chính phủ; mốc dễ nhớ là beta bằng 1, khi ấy con số ra đúng bằng mức sinh lợi kỳ vọng của cả thị trường.
- **Sửa (en):** The figure is the minimum annual return a shareholder should demand from this stock: the FPT example on this screen gives 11.92%/year, about 7.35 percentage points above the 4.57% risk-free rate, and that gap is the compensation for risk. Compare it with deposit rates or government bond yields; a handy landmark is a beta of 1, where the figure equals the expected return of the market as a whole.

**A5 · S2 · câu sai** — `example.note` (src/core/formulas/valuation-dcf.ts:718)

- **Trích:** Beta dưới 1 nghĩa là FPT biến động nhẹ hơn thị trường — trái với cảm nhận rằng cổ phiếu công nghệ luôn bốc; riêng beta này hồi quy trên 55 phiên, ngắn hơn nhiều so với chuẩn hành nghề 2–5 năm.
- **Vấn đề:** Beta đo phần cổ phiếu đi CÙNG thị trường (β = ρ × σ cổ phiếu ÷ σ thị trường), không đo mức dao động. Trong chính cửa sổ tạo ra beta 0,9043, FPT dao động mạnh hơn VN-Index khoảng 1,65 lần; beta dưới 1 chỉ vì tương quan thấp (0,55). Kết luận sai người mới rút ra: FPT ít biến động, an toàn hơn thị trường. Vế 'trái với cảm nhận rằng cổ phiếu công nghệ luôn bốc' dựa trên chính cách hiểu sai đó. Con số '55 phiên' thì ĐÚNG (xem bằng chứng).
- **Bằng chứng:** Hồi quy OLS lợi suất đơn theo phiên của FPT_57_PHIEN.slice(0, 55) trên VNINDEX_71_PHIEN.slice(14, 69), tức 55 giá đóng cửa 24/06→11/09/2026 (54 cặp lợi suất), ra đúng 0,9043, tương quan 0,549; lệch cửa sổ một phiên thì không ra số này (tới 14/09: 0,9051; tới 15/09: 0,8892). Engine do-lech-chuan-loi-suat-phien {sessions 55} trên cùng cửa sổ: FPT 1,924%/phiên, VN-Index 1,167%/phiên (tỷ số 1,649); do-bien-dong-nam-hoa: 30,42%/năm so với 18,45%/năm. Ví dụ có sẵn của do-lech-chuan-loi-suat-phien cho FPT 1,925%/phiên. Chuẩn CFA: β = Cov(Ri, Rm) ÷ Var(Rm) = ρ × σi ÷ σm. '55 phiên 24/06/2026 → 11/09/2026' khớp nguồn ví dụ Treynor (risk-ratios.ts dòng 970).
- **Sửa (vi):** Beta 0,9043 nghĩa là trung bình khi VN-Index đi 1%, FPT đi cùng chiều khoảng 0,9%, chứ không có nghĩa FPT dao động nhẹ hơn thị trường: trong chính 55 phiên dùng để hồi quy, FPT dao động khoảng 1,92% mỗi phiên, gấp khoảng 1,65 lần VN-Index (1,17%), nhưng chỉ một phần nhịp dao động ấy đi cùng thị trường. Beta này hồi quy trên 55 phiên, ngắn hơn nhiều so với chuẩn hành nghề 2 đến 5 năm. Kết quả chính là chi phí vốn chủ đưa vào WACC và làm r cho mô hình cổ tức.
- **Sửa (en):** A beta of 0.9043 means that, on average, when the VN-Index moves 1%, FPT moves about 0.9% in the same direction; it does not mean FPT swings less than the market: over the same 55 sessions used for the regression, FPT moved about 1.92% per session, about 1.65 times the VN-Index's 1.17%, but only part of that movement tracks the market. This beta is regressed over 55 sessions, far shorter than the 2 to 5 years standard practice uses. The figure is exactly the cost of equity fed into WACC, and the r used in a dividend model.

**A6 · S3 · gây hiểu sai** — `example.source` (src/core/formulas/valuation-dcf.ts:722)

- **Trích:** Trading Economics (lợi suất TPCP 10 năm) và Damodaran (phần bù rủi ro quốc gia), chốt 15/09/2026.
- **Vấn đề:** 8,13% đi vào ô ERP, mô tả là 'Mức sinh lợi kỳ vọng của thị trường cổ phiếu vượt trên lãi suất phi rủi ro', tức TỔNG phần bù. Theo Damodaran (chính nguồn chương 7–8 công thức trích), 'phần bù rủi ro quốc gia' (country risk premium) là phần CỘNG THÊM vào phần bù của thị trường trưởng thành, không phải ERP. Nên hoặc dòng nguồn gọi sai tên đại lượng (nếu 8,13% là tổng phần bù của Việt Nam, như tiêu đề 'phần bù rủi ro Việt Nam' gợi ý), hoặc ví dụ nhập nhầm đại lượng. Kết luận sai người mới rút ra: lấy cột 'Country Risk Premium' của Damodaran điền vào ô ERP cho mã khác, làm chi phí vốn chủ thấp đi đúng bằng beta × phần bù thị trường trưởng thành.
- **Bằng chứng:** variables.erp.description dòng 686; SOURCE_DAMODARAN_COC dòng 58–63; tiêu đề ví dụ dòng 712 'phần bù rủi ro Việt Nam 8,13%'. Bảng quốc gia của Damodaran tách riêng Country Risk Premium và Equity Risk Premium (= phần bù thị trường trưởng thành + phần bù quốc gia). Không tra web; cần chủ dự án xác nhận 8,13% lấy từ cột nào.
- **Sửa (vi):** Trading Economics (lợi suất TPCP 10 năm) và Damodaran (tổng phần bù rủi ro vốn cổ phần của Việt Nam, gồm phần bù thị trường trưởng thành cộng phần bù rủi ro quốc gia), chốt 15/09/2026.
- **Sửa (en):** Trading Economics (10-year government bond yield) and Damodaran (Vietnam's total equity risk premium, the mature-market premium plus the country risk premium), locked in 2026-09-15.

#### `wacc` — WACC — chi phí vốn bình quân gia quyền

**A7 · S2 · ví dụ** — `example.title / example.inputs.equity` (src/core/formulas/valuation-dcf.ts:919)

- **Trích:** FPT — vốn chủ 40.995,7 tỷ ₫ ngày 30/06/2026, nợ vay 17.444 tỷ, Re 11,92%, Rd 4,2%, thuế 20%
- **Vấn đề:** ĐÃ BIẾT, chờ chủ dự án quyết: ví dụ dùng vốn chủ SỔ SÁCH trong khi bảng ký hiệu (E 'theo giá thị trường', dòng 798), mô tả ô và commonMistakes đòi vốn hoá.
- **Bằng chứng:** Ghi một dòng theo BRIEF. Phụ, gặp khi đối chiếu: cùng ngày 30/06/2026 các ví dụ P/B, BVPS, ROE dùng vốn chủ 39.851,5 tỷ ₫ (multiples.ts dòng 261). Probe tham khảo: E bằng vốn hoá 124.631,5 tỷ ₫ (ví dụ EV, valuation-multiples.ts dòng 352) cho WACC khoảng 10,87%, kéo theo ví dụ DCF và biên an toàn.
- **Sửa (vi):** Chờ chủ dự án quyết (đã biết).
- **Sửa (en):** Pending the project owner's decision (known issue).

#### `gia-tri-noi-tai-fcff` — Giá trị nội tại từ FCFF (DCF)

**A8 · S2 · câu sai** — `example.note` (src/core/formulas/valuation-dcf.ts:1651)

- **Trích:** Kết quả phụ thuộc nặng vào hiệu WACC − g: hạ g một điểm phần trăm là giá trị rơi hơn 20%, nên bản định giá nghiêm túc luôn kèm bảng độ nhạy hai chiều thay vì một con số duy nhất.
- **Vấn đề:** Hạ g một điểm (5% xuống 4%) chỉ làm giá trị giảm 17,75%, không 'hơn 20%'. Chiều ngược lại mới vượt 20% (nâng g lên 6% thì tăng 28,28%), nên câu vừa sai số vừa bỏ qua đúng điểm bất đối xứng đáng nói.
- **Bằng chứng:** Probe gia-tri-noi-tai-fcff: ví dụ 79.161,38 ₫; growth 4 → 65.110,75 ₫ (−17,75%); growth 6 → 101.550,66 ₫ (+28,28%). Kết luận giữ nguyên nếu đổi WACC ví dụ thành 9,36 (−17,79% / +28,37%) hoặc 9,3649 (−17,77% / +28,33%), nên câu sửa đúng cả khi áp phát hiện WACC 9,37 bên dưới.
- **Sửa (vi):** Nợ vay ròng âm nghĩa là FPT giữ tiền và đầu tư tài chính ngắn hạn nhiều hơn nợ vay, nên phần ấy cộng thêm vào giá trị của cổ đông. Kết quả phụ thuộc nặng vào hiệu WACC − g: hạ g một điểm phần trăm là giá trị rơi gần 18%, còn nâng g một điểm thì giá trị tăng hơn 28%, nên bản định giá nghiêm túc luôn kèm bảng độ nhạy hai chiều thay vì một con số duy nhất.
- **Sửa (en):** Negative net debt means FPT holds more cash and short-term investments than borrowings, so that balance adds to the shareholders’ share. The result leans heavily on the WACC − g spread: cutting g by one percentage point takes nearly 18% off the value, while raising it by one point adds more than 28%, which is why a serious valuation always ships a two-way sensitivity table instead of a single figure.

**A9 · S3 · ví dụ** — `example.title / example.inputs.wacc` (src/core/formulas/valuation-dcf.ts:1645)

- **Trích:** FPT — FCFF 5.168,3 tỷ ₫, tăng 5%/năm, WACC 9,37%, nợ vay ròng −11.527,6 tỷ, 1.714,33 triệu CP
- **Vấn đề:** Ô WACC nhận từ công thức wacc (dependsOn). Ví dụ của wacc ra 9,3649%, và màn WACC hiện '9,36 %' (tối đa 2 chữ số lẻ), không phải 9,37 (inputs dòng 1648: wacc 9.37). 9,37 chỉ ra được khi tính WACC bằng chi phí vốn chủ CHƯA làm tròn 11,921959% (ra 9,36625%), trong khi chính ví dụ wacc nhập Re 11,92. Người kiểm tay theo chuỗi capm → wacc → DCF không ra 79.161 ₫, và lệch lan sang ví dụ bien-an-toan (79.161 ₫, 8,1618%). Lệch nhỏ (0,21%).
- **Bằng chứng:** Probe wacc: Re 11,92 → 9,364877%; Re 11,921959 → 9,366251%. Probe DCF: wacc 9,37 → 79.161,38 ₫; 9,36 → 79.327,52 ₫; 9,364877 (số chuỗi Nâng cao truyền nguyên) → 79.246,40 ₫. Probe bien-an-toan: intrinsic 79.328 → 8,3552%; 79.246 → 8,2604%. src/core/format.ts dòng 95 (maxDecimals mặc định 2), src/ui/result/ResultBlock.tsx dòng 73.
- **Sửa (vi):** Đổi ô WACC của ví dụ thành 9,36, trong tiêu đề thay 'WACC 9,37%' bằng 'WACC 9,36%', expected thành 79.328. Kéo theo bien-an-toan: intrinsic 79.328, expected 8,3552, trong tiêu đề thay 'giá trị nội tại 79.161 ₫' bằng 'giá trị nội tại 79.328 ₫'. Ghi chú của hai ví dụ vẫn đúng sau khi đổi: biên vẫn chưa tới mười điểm phần trăm, và WACC 9,86% đã cho 71.858 ₫, thấp hơn thị giá.
- **Sửa (en):** Change the example's WACC input to 9.36, replace 'WACC 9.37%' with 'WACC 9.36%' in the title, and set expected to 79,328. Carry it into bien-an-toan: intrinsic 79,328, expected 8.3552, and replace 'intrinsic value of 79,161 ₫' with 'intrinsic value of 79,328 ₫' in the title. Both notes stay true after the change: the margin is still under ten percentage points, and a WACC of 9.86% already gives 71,858 ₫, below the market price.

**A10 · S3 · ví dụ** — `symbols[D_ròng].meaning / variables.netDebt.description` (src/core/formulas/valuation-dcf.ts:1537)

- **Trích:** nợ vay ròng, nợ vay chịu lãi trừ tiền và tương đương tiền, tỷ ₫ | (dòng 1606) Nợ vay chịu lãi trừ tiền và tương đương tiền; âm nghĩa là tiền nhiều hơn nợ.
- **Vấn đề:** Ví dụ nhập nợ vay ròng −11.527,6 tỷ = nợ vay 17.444 − 28.971,6 tỷ 'tiền VÀ đầu tư tài chính ngắn hạn' (note dòng 1651 cũng nói vậy). Định nghĩa trên màn (bảng ký hiệu và mô tả ô) chỉ trừ 'tiền và tương đương tiền', khoản mục không gồm tiền gửi và đầu tư ngắn hạn trên 3 tháng. Người làm theo bảng ký hiệu trên BCTC của FPT sẽ không ra −11.527,6 và ra giá trị nội tại thấp hơn ví dụ.
- **Bằng chứng:** valuation-multiples.ts dòng 352–355 (ví dụ EV): 'tiền và đầu tư ngắn hạn 28.971,6 tỷ ₫', nợ vay 17.444; 17.444 − 28.971,6 = −11.527,6. fundamentals.ts dòng 976: '28.972 tỷ ₫ tiền và đầu tư tài chính ngắn hạn'. Cùng độ lệch định nghĩa có ở ô cash của ev (valuation-multiples.ts dòng 285, ngoài lô A).
- **Sửa (vi):** Bảng ký hiệu: 'nợ vay ròng, nợ vay chịu lãi trừ tiền, tương đương tiền và đầu tư tài chính ngắn hạn, tỷ ₫'. Mô tả ô: 'Nợ vay chịu lãi trừ tiền, tương đương tiền và đầu tư tài chính ngắn hạn; âm nghĩa là tiền nhiều hơn nợ.'
- **Sửa (en):** Legend: 'net debt, interest-bearing debt minus cash, cash equivalents and short-term investments, billion ₫'. Field description: 'Interest-bearing debt minus cash, cash equivalents and short-term investments; negative means cash exceeds debt.'

**A11 · S3 · cảnh báo** — `calc (cảnh báo MEANINGLESS khi fcff <= 0)` (src/core/formulas/valuation-dcf.ts:1740)

- **Trích:** FCFF bằng 0 hoặc âm thì mô hình tăng trưởng đều cho ra giá trị doanh nghiệp bằng 0 hoặc âm — không còn gì để chia cho cổ đông, nên cách này không định giá được.
- **Vấn đề:** (1) Vế 'không còn gì để chia cho cổ đông' sai khi nợ vay ròng âm: chốt chặn chạy TRƯỚC khi trừ nợ ròng, nên doanh nghiệp giàu tiền mặt vẫn còn phần cho cổ đông. Kết luận sai: người dùng nhập FCFF âm cho FPT (note ví dụ fcff nói nửa đầu 2026 dòng tiền kinh doanh âm) sẽ đọc là cổ đông không còn gì, trong khi riêng tiền ròng đã khoảng 6.724 ₫/CP. (2) Bản en chưa được sửa theo REVIEW.md: vẫn nói FCFF bằng 0 cho giá trị doanh nghiệp ÂM (thực ra bằng 0), khác nội dung bản vi.
- **Bằng chứng:** Probe DCF trên bộ ví dụ FPT: fcff −500 và fcff 0 → MEANINGLESS với câu trên; fcff 0,0001 → equityValue 11.527,6 tỷ, 6.724,26 ₫/CP. calc: chốt fcff <= 0 ở dòng 1735 đứng trước phép trừ netDebt ở dòng 1782. REVIEW.md dòng 322–323 đề xuất bản en 'an enterprise value of zero or below', chưa áp.
- **Sửa (vi):** FCFF bằng 0 hoặc âm thì mô hình tăng trưởng đều cho ra giá trị doanh nghiệp bằng 0 hoặc âm, nên cách này không định giá được phần kinh doanh của doanh nghiệp.
- **Sửa (en):** A zero or negative FCFF makes the steady-growth model produce an enterprise value of zero or below, so this method cannot value the company's operations.

#### `gia-tri-hien-tai` — Giá trị hiện tại (PV)

**A12 · S3 · câu sai** — `example.note` (src/core/formulas/valuation-dcf.ts:1923)

- **Trích:** Con số bỏ qua lạm phát: với CPI bình quân 4,45%/năm, mục tiêu ấy sau mười năm chỉ còn sức mua tương đương khoảng 645 triệu ₫ hôm nay.
- **Vấn đề:** 1 tỷ ₫ ÷ 1,0445^10 = 647,0 triệu ₫, không phải 645. Lệch nhỏ (0,3%) nhưng con số ghi tới hàng triệu, người tính tay bằng chính công thức PV không ra 645.
- **Bằng chứng:** Probe gia-tri-hien-tai {futureValue 1.000.000.000, rate 4,45, years 10} → 647.016.799 ₫.
- **Sửa (vi):** Con số bỏ qua lạm phát: với CPI bình quân 4,45%/năm, mục tiêu ấy sau mười năm chỉ còn sức mua tương đương khoảng 647 triệu ₫ hôm nay.
- **Sửa (en):** The figure ignores inflation: at an average CPI of 4.45%/year, that target ten years out is worth only about 647 million ₫ in today’s purchasing power.

#### `bien-an-toan` — Biên an toàn

**A13 · S2 · ví dụ** — `example.note` (src/core/formulas/valuation-dcf.ts:2256)

- **Trích:** Giá trị nội tại lấy nguyên từ mô hình DCF ở trên, nên biên này thừa hưởng mọi giả định của mô hình đó.
- **Vấn đề:** Cạnh dependsOn DUY NHẤT của bien-an-toan là mo-hinh-gordon (dòng 2299); docblock dòng 1479–1483 ghi rõ DCF cố ý KHÔNG nối sang đây. Trên chính màn này, chế độ Nâng cao hiện khối 'Số liệu lấy từ công thức khác' với CAPM và Mô hình Gordon, ô V ghi 'Nhận tự động từ' Gordon; chế độ Cơ bản không có gì về DCF ở phía trên. Nên 'mô hình DCF ở trên' trỏ vào thứ không có trên màn và trái với khối chuỗi. Ví dụ của thượng nguồn thật (Gordon, 30.347 ₫) cho biên −139,56%. Kết luận sai: người dùng tin ô V được DCF cấp số, và 79.161 ₫ là số chuỗi tự đưa về.
- **Bằng chứng:** valuation-dcf.ts dòng 2299: dependsOn [{ formulaId: 'mo-hinh-gordon', variableKey: 'intrinsic' }]; src/core/calc/run-chain.ts chainFor() đi theo dependsOn; vi.ts: 'chain.title' = 'Số liệu lấy từ công thức khác', 'input.autoFrom' = 'Nhận tự động từ' (LinkedInput.tsx dòng 85). Probe bien-an-toan {intrinsic 30.347} → −139,562%.
- **Sửa (vi):** Giá trị nội tại lấy từ ví dụ của công thức Giá trị nội tại từ FCFF (DCF), không phải từ mô hình Gordon mà ô này tự nhận ở chế độ Nâng cao; lấy giá trị Gordon của FPT (30.347 ₫) thì biên âm khoảng 140%, vì Gordon chỉ định giá phần cổ tức. Biên này thừa hưởng mọi giả định của mô hình DCF. Graham đòi biên tối thiểu 30 đến 50% chính vì lý do ấy: ở mức đệm chưa tới mười điểm phần trăm, chỉ một giả định lệch nhẹ là kết luận đảo chiều.
- **Sửa (en):** The intrinsic value comes from the worked example of the Intrinsic value from FCFF (DCF) formula, not from the Gordon model this field pulls in automatically in advanced mode; with FPT's Gordon value (30,347 ₫) the margin would be about −140%, because Gordon values only the dividend stream. This margin inherits every assumption of the DCF model. Graham asked for at least 30 to 50% for exactly that reason: with a cushion under ten percentage points, a single assumption drifting slightly flips the conclusion.

### `valuation-multiples.ts`

#### `von-hoa-thi-truong` — Vốn hoá thị trường

**B1 · S2 · câu sai** — `example.note` (src/core/formulas/valuation-multiples.ts:966)

- **Trích:** Khoảng 4,7 tỷ USD, đưa FPT vào nhóm doanh nghiệp lớn nhất sàn HOSE. Con số đổi theo từng phiên: ở đáy 24/07/2026 giá 62.900 ₫ cho vốn hoá 107.831 tỷ ₫, bốc hơi gần 17.000 tỷ trong bảy tuần dù doanh nghiệp không có gì thay đổi — vốn hoá đo thị trường, không đo giá trị doanh nghiệp.
- **Vấn đề:** Hai chỗ sai so với chuỗi giá thật trong repo. (1) 24/07/2026 không phải đáy: đóng cửa 27/07/2026 là 62.200 ₫, thấp hơn 62.900 ₫. (2) Sai chiều: "bốc hơi gần 17.000 tỷ trong bảy tuần" khớp đúng khoảng 24/07 → 11/09/2026 (49 ngày), nhưng trong khoảng đó vốn hoá TĂNG 16.800 tỷ chứ không mất. Người mới sẽ hiểu FPT mất gần 17.000 tỷ vốn hoá trong bảy tuần dẫn tới ngày 24/07, và 24/07 là đáy; cả hai đều sai.
- **Bằng chứng:** FPT_57_PHIEN / FPT_57_BARS (market-series-2026.ts): đóng cửa 24/07 = 62.900, 27/07 = 62.200 (thấp nhất cả chuỗi), giá thấp nhất trong phiên 28/07 = 61.500. Probe von-hoa-thi-truong: giá 62.900 → 107.831,357 tỷ; giá 72.700 → 124.631,791 tỷ; chênh 16.800,4 tỷ ("gần 17.000"), và 24/07 → 11/09 đúng 49 ngày = bảy tuần, tức con số tác giả tính là mức TĂNG từ 24/07 tới 11/09. Dữ liệu repo không cho khoảng bảy tuần nào kết thúc ở 24/07: chuỗi FPT bắt đầu 24/06; đỉnh trước 24/07 là 73.200 ₫ ngày 07/07 → 125.488,956 tỷ, giảm 17.657,6 tỷ trong 17 ngày. Nếu muốn giữ chữ "đáy": 27/07 giá 62.200 → 106.631,326 tỷ, tới 11/09 (46 ngày, chưa đầy bảy tuần) tăng 18.000,5 tỷ.
- **Sửa (vi):** Khoảng 4,7 tỷ USD, đưa FPT vào nhóm doanh nghiệp lớn nhất sàn HOSE. Con số đổi theo từng phiên: phiên 24/07/2026 giá 62.900 ₫ chỉ cho vốn hoá 107.831 tỷ ₫, đúng bảy tuần sau đã tăng thêm gần 17.000 tỷ dù doanh nghiệp không có gì thay đổi, vì vốn hoá đo thị trường, không đo giá trị doanh nghiệp.
- **Sửa (en):** Around 4.7 billion USD, placing FPT among the largest companies on HOSE. The figure moves session by session: the 2026-07-24 close of 62,900 ₫ gave a market cap of only 107,831 billion ₫, and exactly seven weeks later it had gained nearly 17,000 billion with nothing changing at the company, because market cap measures the market, not the business.

#### `ev-sales` — EV/Sales — EV trên doanh thu

**B2 · S2 · câu sai** — `example.note` (src/core/formulas/valuation-multiples.ts:640)

- **Trích:** Cao hơn P/S 1,96 lần của cùng cổ phiếu chỉ vì chọn kỳ khác: mẫu số ở đây là doanh thu quy năm theo nền hợp nhất đã bỏ FPT Telecom, còn P/S vẫn dùng doanh thu bốn quý gần nhất 63.698,4 tỷ ₫. Hai bội số cùng đo một thứ vẫn ra hai kết quả, nên luôn phải đọc kèm kỳ của mẫu số.
- **Vấn đề:** "Chỉ vì chọn kỳ khác" và "Hai bội số cùng đo một thứ" đều sai. P/S và EV/Sales khác nhau ở cả TỬ SỐ (vốn hoá so với EV) lẫn mẫu số. Với FPT hai hiệu ứng ngược chiều: đổi tử số sang EV làm bội số GIẢM khoảng 9% (FPT giữ tiền nhiều hơn nợ vay), đổi mẫu số sang doanh thu quy năm làm bội số TĂNG khoảng 21%. Nếu cùng kỳ doanh thu, EV/Sales thấp hơn P/S chứ không bằng. Người mới rút ra: P/S và EV/Sales là một, khớp kỳ là ra cùng số, nên dùng P/S thay EV/Sales được; đó đúng là sai lầm commonMistakes của chính công thức này cảnh báo (dòng 628: dùng vốn hoá thay EV ở tử số). (Phụ, không tách thành phát hiện riêng: bảng ký hiệu và mô tả ô ghi doanh thu "bốn quý gần nhất" trong khi ví dụ dùng số quy năm; note đã nói rõ điều này.)
- **Bằng chứng:** Probe: P/S ví dụ = 1,9566; EV/Sales ví dụ = 2,1528. ev-sales với ev 113.103,9 và revenue 63.698,4 (doanh thu bốn quý mà chính note nêu) → 1,7756, thấp hơn P/S. ev-sales với ev = vốn hoá 124.631,791 và revenue 63.698,4 → 1,9566 = P/S. Tách: EV/vốn hoá = 113.103,9/124.631,791 = 0,9075 (−9,25%, do nợ vay ròng 17.444 − 28.971,6 = −11.527,6); 63.698,4/52.537 = 1,2125 (+21,2%, doanh thu quy năm nhỏ hơn 17,52%); 0,9075 × 1,2125 = 1,1003 = 2,1528/1,9566.
- **Sửa (vi):** Cao hơn P/S 1,96 lần của cùng cổ phiếu vì hai lý do ngược chiều nhau. Tử số là EV, nhỏ hơn vốn hoá khoảng 9% do FPT giữ tiền nhiều hơn nợ vay: nếu chia cùng doanh thu bốn quý gần nhất 63.698,4 tỷ ₫ như P/S thì EV/Sales chỉ khoảng 1,78 lần. Mẫu số ở đây lại là doanh thu quy năm 52.537 tỷ ₫ theo nền hợp nhất đã bỏ FPT Telecom, nhỏ hơn khoảng 17,5%, nên đẩy bội số lên 2,15 lần. Vì vậy luôn phải đọc kèm tử số là vốn hoá hay EV, và kỳ của mẫu số.
- **Sửa (en):** Higher than the same stock’s P/S of 1.96x for two reasons that pull in opposite directions. The numerator is EV, about 9% below market cap because FPT holds more cash than debt: divided by the same last-four-quarters revenue of 63,698.4 billion ₫ that P/S uses, EV/Sales would be only about 1.78x. The denominator here, however, is annualized revenue of 52,537 billion ₫ on the consolidation basis that excludes FPT Telecom, about 17.5% smaller, which lifts the multiple to 2.15x. So always check whether the numerator is market cap or EV, and which period the denominator covers.

#### `gia-muc-tieu` — Giá mục tiêu

**B3 · S3 · cảnh báo** — `calc → warning MEANINGLESS (eps <= 0), fix` (src/core/formulas/valuation-multiples.ts:1697)

- **Trích:** Dùng Số Graham hoặc NCAV trên cổ phiếu để định giá doanh nghiệp đang lỗ.
- **Vấn đề:** Cảnh báo bật khi EPS ≤ 0 (doanh nghiệp lỗ hoặc không có lãi) nhưng gợi ý chuyển sang Số Graham, công thức cũng chặn đúng điều kiện EPS ≤ 0. Người dùng làm theo gợi ý sẽ gặp lại một cảnh báo "không có ý nghĩa" y hệt.
- **Bằng chứng:** calc gia-muc-tieu (dòng 1687): eps <= 0 → meaningless với fix này. calc so-graham (dòng 1179): eps <= 0 → meaningless "Số Graham cần EPS dương — doanh nghiệp đang lỗ hoặc không có lợi nhuận thì căn bậc hai không có nghĩa.". Probe: gia-muc-tieu eps −1.200 → null (MEANINGLESS); so-graham eps −1.200 → null (MEANINGLESS); eps 0 ở cả hai cũng MEANINGLESS. NCAV trên cổ phiếu không đọc EPS nên vẫn tính được (probe ra 7.561,9 ₫); P/B dùng được khi vốn chủ dương. Fix của chính so-graham gợi ý đúng cặp NCAV + P/B.
- **Sửa (vi):** Dùng NCAV trên cổ phiếu hoặc P/B để định giá doanh nghiệp đang lỗ.
- **Sửa (en):** Use net current asset value per share or P/B to value a loss-making company.

#### `ev` — EV — giá trị doanh nghiệp

**B4 · S3 · ví dụ** — `example.title` (src/core/formulas/valuation-multiples.ts:352)

- **Trích:** FPT — vốn hoá 124.631,5 tỷ ₫, nợ vay 17.444 tỷ ₫, tiền và đầu tư ngắn hạn 28.971,6 tỷ ₫ (30/06/2026)
- **Vấn đề:** (1) Ngày "(30/06/2026)" đặt cuối tiêu đề đọc như áp cho cả ba số, nhưng vốn hoá là theo giá phiên 11/09/2026 (source dòng 362 nói vậy); vốn hoá tại 30/06/2026 khác hẳn. (2) Vốn hoá 124.631,5 không khớp kết quả màn von-hoa-thi-truong (124.631,791): số ở đây dùng số cổ phiếu chính xác 1.714.326.422, còn màn vốn hoá dùng 1.714,33 triệu đã làm tròn. Lệch rất nhỏ, không đổi EV hiển thị, nhưng người đối chiếu hai màn bằng tay thấy hai số khác nhau.
- **Bằng chứng:** FPT_57_BARS: đóng cửa 30/06/2026 = 70.200 ₫ → probe von-hoa-thi-truong = 120.345,966 tỷ, không phải 124.631,5. Probe: shares 1.714,326422 → 124.631,531; shares 1.714,33 (ví dụ von-hoa) → 124.631,791; chênh 0,26 tỷ (0,0002%). Probe ev với marketCap 124.631,791 → 113.104,19 (so với 113.103,9); ev-ebitda vẫn 8,1359, ev-sales vẫn 2,1528. Probe von-hoa với shares 1.714,326 → 124.631,5002 (khớp tiêu đề ev); giá 62.900 với shares 1.714,326 → 107.831,1 (note von-hoa vẫn ghi 107.831).
- **Sửa (vi):** Tiêu đề: "FPT — vốn hoá 124.631,5 tỷ ₫ theo giá phiên 11/09/2026; nợ vay 17.444 tỷ ₫ và tiền và đầu tư ngắn hạn 28.971,6 tỷ ₫ tại 30/06/2026". Để vốn hoá khớp màn von-hoa-thi-truong: đổi ví dụ ở đó sang "1.714,326 triệu cổ phiếu lưu hành" (inputs shares: 1_714.326), engine ra 124.631,5 tỷ ₫, expected 124_632 vẫn trong ±1, số 107.831 tỷ ₫ trong note ở đó không đổi.
- **Sửa (en):** Title: "FPT — market cap 124,631.5 billion ₫ at the 2026-09-11 close; debt 17,444 billion ₫ and cash and short-term investments 28,971.6 billion ₫ as of 2026-06-30". To make the market cap match the von-hoa-thi-truong screen, change that example to "1,714.326 million shares outstanding" (inputs shares: 1_714.326); the engine then returns 124,631.5 billion ₫, expected 124_632 stays within ±1, and the 107,831 billion ₫ figure in that note is unchanged.

**B5 · S3 · ví dụ** — `variables[cash].label/description, symbols[\text{Tiền mặt}], expression ↔ example.title` (src/core/formulas/valuation-multiples.ts:319)

- **Trích:** nhãn ô (dòng 319): "Tiền và tương đương tiền"; mô tả (326): "Tiền mặt, tiền gửi và các khoản tương đương tiền."; bảng ký hiệu (285): "tiền và tương đương tiền, tỷ ₫"; dòng chữ (263): "EV = Vốn hoá thị trường + Nợ vay − Tiền và tương đương tiền"; tiêu đề ví dụ (352): "…tiền và đầu tư ngắn hạn 28.971,6 tỷ ₫…"
- **Vấn đề:** Nhãn ô, bảng ký hiệu và dòng chữ đều gọi khoản bị trừ là "Tiền và tương đương tiền", đúng tên riêng của mã số 110 trên bảng cân đối kế toán, còn ví dụ nhập "tiền và đầu tư ngắn hạn" (mã 110 + 120). Người làm lại ví dụ theo nhãn sẽ chỉ lấy mã 110 và ra EV lớn hơn, không tái tạo được 113.103,9. Cách ví dụ làm mới là cách CFA; phần định nghĩa trên màn hẹp hơn chuẩn.
- **Bằng chứng:** Thông tư 200/2014/TT-BTC, mẫu B01-DN: mã số 110 "Tiền và các khoản tương đương tiền" tách riêng với mã số 120 "Đầu tư tài chính ngắn hạn". fundamentals.ts dòng 976 gọi đúng con số này là "28.972 tỷ ₫ tiền và đầu tư tài chính ngắn hạn"; valuation-dcf.ts dòng 1648 (gia-tri-noi-tai-fcff) dùng nợ vay ròng −11.527,6 = 17.444 − 28.971,6 nên định nghĩa này đã lan sang chuỗi DCF. CFA Program, Market-Based Valuation: Price and Enterprise Value Multiples: EV trừ "cash, cash equivalents, and short-term investments". Mô tả ô có chữ "tiền gửi" nên có thể hiểu gồm tiền gửi có kỳ hạn, nhưng nhãn, bảng ký hiệu và dòng chữ đều là tên mã 110. Repo không có số tách mã 110/120 để lượng hoá chênh lệch.
- **Sửa (vi):** Giữ số của ví dụ, sửa phần định nghĩa cho khớp: nhãn ô "Tiền và đầu tư ngắn hạn"; mô tả ô "Tiền, các khoản tương đương tiền và đầu tư tài chính ngắn hạn như tiền gửi có kỳ hạn, tức mã số 110 và 120 trên bảng cân đối kế toán."; bảng ký hiệu \text{Tiền mặt}: "tiền, tương đương tiền và đầu tư tài chính ngắn hạn, tỷ ₫"; dòng chữ: "EV = Vốn hoá thị trường + Nợ vay − Tiền và đầu tư ngắn hạn".
- **Sửa (en):** Keep the example’s figure and align the definition: field label "Cash and short-term investments"; field description "Cash, cash equivalents and short-term financial investments such as term deposits, i.e. codes 110 and 120 on the balance sheet."; legend for \text{Tiền mặt}: "cash, cash equivalents and short-term investments, billion ₫"; expression: "EV = Market capitalization + Debt − Cash and short-term investments".

#### `ev-ebitda` — EV/EBITDA

**B6 · S3 · gây hiểu sai** — `example.note (cùng khung với explanation.meaning dòng 472)` (src/core/formulas/valuation-multiples.ts:496)

- **Trích:** Khoảng tám năm EBITDA để hoàn lại giá mua trọn doanh nghiệp, trùng khớp với bội số 8,14 lần stockanalysis công bố độc lập. EBITDA ở đây quy năm bằng cách nhân đôi số liệu sáu tháng — cách làm chỉ đúng khi hoạt động kinh doanh không có mùa vụ mạnh.
- **Vấn đề:** "Khoảng tám năm EBITDA để hoàn lại giá mua trọn doanh nghiệp" đọc EBITDA như tiền thật trả về người mua, đúng điều commonMistakes cùng màn cảnh báo (dòng 484: "Coi EBITDA là dòng tiền thật — nó bỏ qua chi đầu tư và thay đổi vốn lưu động"). Người mới rút ra: mua trọn FPT theo EV thì khoảng tám năm thu hồi vốn. Theo chính số liệu FPT trong repo, dòng tiền tự do chỉ bằng khoảng một phần ba EBITDA, nên thời gian hoàn vốn bằng tiền dài gần gấp ba. explanation.meaning (dòng 472, "Số năm dòng lợi nhuận hoạt động cần có để hoàn lại toàn bộ giá mua doanh nghiệp") dùng cùng khung; nên sửa cùng lượt.
- **Bằng chứng:** Ví dụ fcff (FPT năm 2025), probe: FCFF = 5.168,34 tỷ với EBIT 13.848,8 và khấu hao 2.795,9 → EBITDA 16.644,7 tỷ; FCFF/EBITDA = 31,05%. Minh hoạ cùng EV 113.103,9: probe ev-ebitda với ebitda 5.168,3 → 21,88 (gần 22 năm theo FCFF, so với 8,14 theo EBITDA).
- **Sửa (vi):** Giá mua trọn doanh nghiệp bằng khoảng tám lần EBITDA một năm, trùng khớp với bội số 8,14 lần stockanalysis công bố độc lập; đó không phải tám năm hoàn vốn, vì EBITDA chưa trừ thuế, chi đầu tư và vốn lưu động. EBITDA ở đây quy năm bằng cách nhân đôi số liệu sáu tháng, cách làm chỉ đúng khi hoạt động kinh doanh không có mùa vụ mạnh.
- **Sửa (en):** The price of the whole company is about eight times one year of EBITDA, matching the 8.14x that stockanalysis publishes independently; that is not an eight-year payback, since EBITDA comes before tax, capital expenditure and working capital. The EBITDA here is annualized by doubling six months of data, which is valid only when the business has no strong seasonality.

#### `peg` — PEG — P/E trên tăng trưởng

**B7 · S3 · ví dụ** — `example.note (và example.title dòng 794)` (src/core/formulas/valuation-multiples.ts:800)

- **Trích:** Dưới 1 theo quy tắc Peter Lynch, tức P/E đang thấp so với tốc độ tăng trưởng của chính doanh nghiệp. Cả kết luận treo vào chữ g: thay bằng kế hoạch công ty 15%/năm thì PEG còn 0,83, còn dự phóng thận trọng 10%/năm đẩy PEG lên 1,24 và lật ngược nhận định — nên nhập g kèm ghi rõ nguồn.
- **Vấn đề:** Ô g được định nghĩa là tăng trưởng KỲ VỌNG vài năm tới (nhãn "Tăng trưởng lợi nhuận kỳ vọng (g)", mô tả dòng 768 "Tốc độ tăng EPS dự kiến vài năm tới", commonMistakes dòng 788 "g là một dự phóng"), nhưng ví dụ nhập 14,1 là mức tăng lợi nhuận ĐÃ QUA của 6 tháng đầu 2026 so với cùng kỳ (tiêu đề dòng 794), rồi câu đầu note rút kết luận "P/E đang thấp so với tốc độ tăng trưởng của chính doanh nghiệp" từ chính số đó như thể nó là g kỳ vọng. Người mới rút ra: lấy mức tăng nửa năm vừa công bố làm g là đủ. Thêm nữa, note P/E và note EV/Sales nói từ 2026 FPT Telecom không còn hợp nhất, nên mức tăng 6 tháng 2026 so với 2025 có thể lẫn hiệu ứng đổi phạm vi hợp nhất.
- **Bằng chứng:** Probe peg: g 14,1 → 0,8787; g 15 → 0,826; g 10 → 1,239 (các số 0,83 và 1,24 trong note đúng; cách nhập g theo số % khớp calc, bảng ký hiệu và mô tả ô). Mâu thuẫn là giữa KỲ của số liệu ví dụ (đã qua, nửa năm) và định nghĩa ô (dự phóng, vài năm tới).
- **Sửa (vi):** Dưới 1 theo quy tắc Peter Lynch, nhưng 14,1% là mức tăng đã qua của 6 tháng đầu 2026, còn g của PEG là dự phóng cho vài năm tới. Cả kết luận treo vào chữ g: thay bằng kế hoạch công ty 15%/năm thì PEG còn 0,83, còn dự phóng thận trọng 10%/năm đẩy PEG lên 1,24 và lật ngược nhận định, nên nhập g kèm ghi rõ nguồn.
- **Sửa (en):** Below 1 by Peter Lynch’s rule, but 14.1% is the growth already booked in H1 2026, while PEG’s g is a forecast for the next few years. The whole conclusion hangs on g: the company’s own 15%/year plan brings PEG down to 0.83, while a conservative 10%/year forecast lifts it to 1.24 and flips the reading, so record where g came from.

**B8 · S3 · câu sai** — `variables[pe].description (en)` (src/core/formulas/valuation-multiples.ts:756)

- **Trích:** Hệ số giá trên lợi nhuận — tính bằng công thức P/E của nhóm Chỉ số DN.
- **Vấn đề:** Bản en chỉ người dùng tới "the Company ratios group", nhưng giao diện tiếng Anh không có nhóm nào tên vậy; nhóm chứa P/E hiện là "Company fundamentals" / "Fundamentals". Bản vi "nhóm Chỉ số DN" đúng.
- **Bằng chứng:** src/core/registry/categories.ts dòng 39–42: id fundamentals, name.en "Company fundamentals", shortName.en "Fundamentals", shortName.vi "Chỉ số DN". multiples.ts: pe có categoryId "fundamentals".
- **Sửa (vi):** Hệ số giá trên lợi nhuận, tính bằng công thức P/E của nhóm Chỉ số DN. (Nội dung bản vi giữ nguyên, chỉ bỏ gạch ngang.)
- **Sửa (en):** The price-to-earnings ratio, calculated with the P/E formula in the Fundamentals group.

#### `ty-suat-loi-nhuan-tren-gia` — Tỷ suất lợi nhuận trên giá

**B9 · S3 · gây hiểu sai** — `example.note` (src/core/formulas/valuation-multiples.ts:1483)

- **Trích:** Đúng bằng nghịch đảo P/E 12,39 lần. Đặt cạnh lãi suất tiết kiệm 12 tháng 6,8%/năm và lợi suất trái phiếu chính phủ kỳ hạn 10 năm 4,57%/năm thì phần bù rủi ro khoảng 3,5 điểm phần trăm — nhưng đây là lợi nhuận doanh nghiệp làm ra, phần thực về túi cổ đông chỉ là cổ tức 2,75%.
- **Vấn đề:** Câu nêu HAI mốc (tiết kiệm 6,8% và TPCP 10 năm 4,57%) rồi chỉ đưa MỘT phần bù "khoảng 3,5 điểm", con số chỉ đúng khi so với TPCP. howToRead của chính công thức dạy so với lãi suất tiết kiệm, nên người mới sẽ hiểu FPT cho hơn gửi tiết kiệm 3,5 điểm, trong khi thật ra chỉ hơn khoảng 1,3 điểm.
- **Bằng chứng:** Probe ty-suat-loi-nhuan-tren-gia (ví dụ): 8,0702%. 8,0702 − 4,57 = 3,50 điểm; 8,0702 − 6,8 = 1,27 điểm. Cổ tức 2.000/72.700 = 2,751% (khớp 2,75%).
- **Sửa (vi):** Đúng bằng nghịch đảo P/E 12,39 lần. Tỷ suất này cao hơn lợi suất trái phiếu chính phủ kỳ hạn 10 năm 4,57%/năm khoảng 3,5 điểm phần trăm, nhưng chỉ hơn lãi suất tiết kiệm 12 tháng 6,8%/năm khoảng 1,3 điểm phần trăm; và đây là lợi nhuận doanh nghiệp làm ra, phần thực về túi cổ đông chỉ là cổ tức 2,75%.
- **Sửa (en):** Exactly the inverse of the 12.39x P/E. The yield sits about 3.5 percentage points above the 4.57%/year 10-year government bond yield, but only about 1.3 points above the 6.8%/year 12-month deposit rate; and this is profit the company earns, while what actually reaches shareholders is the 2.75% dividend.

### `multiples.ts`

#### `pb` — P/B — hệ số giá trên giá trị sổ sách

**B10 · S3 · gây hiểu sai** — `example.note` (src/core/formulas/multiples.ts:257)

- **Trích:** Giá trị của một doanh nghiệp công nghệ nằm ở con người và hợp đồng chứ không ở tài sản ghi trên sổ, nên P/B của FPT luôn cao hơn nhóm sản xuất và không đặt cạnh HPG hay VNM để so được. Phần vốn chủ sở hữu thực sự đứng sau mỗi cổ phiếu chỉ bằng chưa tới một phần ba thị giá.
- **Vấn đề:** "P/B của FPT luôn cao hơn nhóm sản xuất" (en: "structurally above manufacturers") sai ở chữ "luôn": P/B = ROE × P/E, nên doanh nghiệp sản xuất có ROE cao hoặc P/E cao có P/B vượt FPT; VNM, chính cái tên câu này đặt cạnh FPT, là doanh nghiệp sản xuất nổi tiếng ROE cao. Người mới rút ra: P/B cao hay thấp do ngành quyết định (công nghệ luôn trên sản xuất), trong khi P/B đi theo ROE và P/E. Phần sau của câu (không so P/B của FPT với doanh nghiệp nặng tài sản) vẫn đúng.
- **Bằng chứng:** Ví dụ FPT: EPS/BVPS = 5.867/23.246 = 25,24%, P/E 12,3913 → P/B 3,1274 (probe). Doanh nghiệp giả định ROE 25%, P/E 13: probe pe (giá 52.000, EPS 4.000) → 13; pb (giá 52.000, BVPS 16.000) → 3,25, cao hơn FPT. Về VNM: kiến thức chung (P/B nhiều năm quanh 4 đến 7 lần), không tra số; chủ dự án kiểm lại nếu muốn giữ tên VNM. Ghi thêm: commonMistakes của pb (dòng 245) cảnh báo đúng việc áp P/B cho doanh nghiệp công nghệ và ví dụ chọn FPT; note đã tự nêu giới hạn nên không tách thành phát hiện.
- **Sửa (vi):** Giá trị của một doanh nghiệp công nghệ nằm nhiều ở con người và hợp đồng chứ không ở tài sản ghi trên sổ, nên P/B của FPT không đặt cạnh doanh nghiệp nặng tài sản như HPG để kết luận đắt rẻ được. Phần vốn chủ sở hữu thực sự đứng sau mỗi cổ phiếu chỉ bằng chưa tới một phần ba thị giá.
- **Sửa (en):** A technology company’s value sits largely in its people and contracts rather than in assets on the books, so FPT’s P/B cannot be set against an asset-heavy manufacturer such as HPG to judge cheap or expensive. The equity actually standing behind each share is under a third of the market price.

### `fundamentals.ts`

#### `eps-co-ban` — EPS cơ bản

**C2 · S3 · câu sai** — `example.note` (src/core/formulas/fundamentals.ts:220)

- **Trích:** Thấp hơn khoảng 0,6% so với mức 2.967 ₫ FPT tự công bố, vì doanh nghiệp chia cho số cổ phiếu bình quân gia quyền trong kỳ còn ô nhập ở đây là số cổ phiếu cuối kỳ, sau khi đã phát hành thêm ESOP và cổ phiếu thưởng. Khác biệt về phương pháp, không phải sai số tính toán.
- **Vấn đề:** Câu quy chênh lệch giữa số cổ phiếu bình quân gia quyền và số cuối kỳ cho cả ESOP lẫn cổ phiếu thưởng. Theo chuẩn mực, cổ phiếu thưởng (cũng như chia tách) KHÔNG tạo ra chênh lệch này: số cổ phiếu bình quân được điều chỉnh hồi tố như thể đợt thưởng đã xảy ra từ đầu kỳ sớm nhất được trình bày. Chỉ cổ phiếu phát hành có thu tiền trong kỳ (như ESOP) mới làm số bình quân thấp hơn số cuối kỳ. Người mới học phải một điều sai: thưởng cổ phiếu giữa kỳ làm EPS công bố cao hơn EPS tính theo số cuối kỳ. Các con số của câu vẫn đúng.
- **Bằng chứng:** IAS 33 đoạn 26 đến 28 (capitalisation hoặc bonus issue: số cổ phiếu trước sự kiện được điều chỉnh “as if the event had occurred at the beginning of the earliest period presented”); VAS 30 “Lãi trên cổ phiếu” có quy định tương ứng. Probe: 5.055,1 tỷ ₫ ÷ 1.714.326.422 CP × 10^9 = 2.948,74 ₫; 2.967 ÷ 2.948,74 = 1,00619, tức thấp hơn 0,62% (câu “khoảng 0,6%” đúng). Số bình quân để ra đúng 2.967 ₫ là 1.703.774.857 CP (probe → 2.967,00 ₫), ít hơn số cuối kỳ khoảng 10,55 triệu CP.
- **Sửa (vi):** Thấp hơn khoảng 0,6% so với mức 2.967 ₫ FPT tự công bố, vì doanh nghiệp chia cho số cổ phiếu bình quân gia quyền trong kỳ còn ô nhập ở đây là số cổ phiếu cuối kỳ, đã gồm phần cổ phiếu ESOP phát hành trong kỳ. Cổ phiếu thưởng không gây ra chênh lệch này, vì chuẩn mực tính nó như đã lưu hành từ đầu kỳ. Khác biệt về phương pháp, không phải sai số tính toán.
- **Sửa (en):** About 0.6% below the 2,967 ₫ FPT reports itself, because the company divides by the weighted-average share count for the period while the field here holds the end-of-period count, which includes the ESOP shares issued during the period. Bonus shares do not cause this gap, because the standard counts them as outstanding from the start of the period. A difference in method, not a calculation error.

**C3 · S3 · toán** — `symbols[\text{Số CP lưu hành}].meaning + variables.sharesOutstanding.description` (src/core/formulas/fundamentals.ts:162)

- **Trích:** Bảng ký hiệu (dòng 162): “số cổ phiếu (CP) phổ thông đang lưu hành” · Mô tả ô (biến dùng chung, dòng 107): “Số cổ phiếu phổ thông đang lưu hành, không tính cổ phiếu quỹ.”
- **Vấn đề:** Công thức mang tên “EPS cơ bản” và dẫn nguồn CFA + VAS, mà cả hai định nghĩa mẫu số của EPS cơ bản là số cổ phiếu phổ thông lưu hành BÌNH QUÂN GIA QUYỀN trong kỳ. Bảng ký hiệu và mô tả ô lại hướng người dùng nhập số cổ phiếu đang lưu hành (số hiện tại, cuối kỳ), nên con số trên màn không phải EPS cơ bản theo chuẩn mà là một xấp xỉ: chính ví dụ lệch 0,6% so với EPS cơ bản FPT công bố và phải giải thích bằng “khác biệt về phương pháp”. Độ lệch lớn khi doanh nghiệp phát hành thêm có thu tiền giữa kỳ (phát hành riêng lẻ, chào bán cho cổ đông hiện hữu, ESOP). Biến sharesOutstanding dùng chung với bvps, nơi số cuối kỳ là đúng, nên chỉ sửa riêng cho eps-co-ban. Mô tả ô eps của ty-le-chi-tra-co-tuc (dòng 1457, “chia cho số cổ phiếu đang lưu hành”) có cùng kiểu rút gọn.
- **Bằng chứng:** IAS 33 đoạn 10 và 19 (“the number of ordinary shares shall be the weighted average number of ordinary shares outstanding during the period”); CFA Institute, Financial Reporting and Analysis: Basic EPS = (Net income − Preferred dividends) ÷ Weighted average number of shares outstanding; VAS 30 “Lãi trên cổ phiếu”: lãi cơ bản chia cho số bình quân gia quyền cổ phiếu phổ thông đang lưu hành trong kỳ. Probe: số cuối kỳ 1.714.326.422 CP → 2.948,74 ₫; số bình quân suy từ số công bố 1.703.774.857 CP → 2.967,00 ₫.
- **Sửa (vi):** Bảng ký hiệu \text{Số CP lưu hành}: “số cổ phiếu (CP) phổ thông lưu hành bình quân gia quyền trong kỳ”. Mô tả ô sharesOutstanding, riêng eps-co-ban: “Số cổ phiếu phổ thông lưu hành bình quân gia quyền trong kỳ, không tính cổ phiếu quỹ. Chỉ có số cuối kỳ thì kết quả là số xấp xỉ.”
- **Sửa (en):** Legend \text{Số CP lưu hành}: “weighted-average number of common shares outstanding during the period”. sharesOutstanding field description, eps-co-ban only: “Weighted-average number of common shares outstanding during the period, excluding treasury shares. With only the period-end count, the result is an approximation.”

#### `bvps` — BVPS — giá trị sổ sách mỗi cổ phiếu

**C4 · S3 · gây hiểu sai** — `variables.equity.description (biến dùng chung; ảnh hưởng bvps và roe)` (src/core/formulas/fundamentals.ts:69)

- **Trích:** Vốn chủ sở hữu trên bảng cân đối kế toán cuối kỳ.
- **Vấn đề:** Trên bảng cân đối kế toán hợp nhất, dòng “Vốn chủ sở hữu” đã gồm lợi ích cổ đông không kiểm soát: với FPT ngày 30/06/2026 là 40.995,7 tỷ ₫, đúng con số no-tren-von-chu gọi là “tổng vốn chủ”. Làm đúng theo mô tả ô ở màn BVPS là phạm đúng lỗi mà example.note của BVPS cảnh báo (“Phải lấy vốn chủ của cổ đông công ty mẹ chứ không lấy tổng vốn chủ 40.995,7 tỷ ₫”). Ở ROE, tử số đã là lợi nhuận của cổ đông công ty mẹ (mô tả ô netIncome) nên mẫu số lấy theo mô tả này bị lệch phạm vi với tử số. Kết luận sai cụ thể: người dùng nhập 40.995,7 và nhận BVPS 23.913,59 ₫ thay vì 23.246,16 ₫ (cao hơn 2,87%), ROE 12,33% thay vì 12,68%. Tiêu đề ví dụ ROE (dòng 470) cũng chỉ ghi “vốn chủ 39.851,5 tỷ ₫”, không nói đó là phần của cổ đông công ty mẹ. Ở no-tren-von-chu dùng tổng vốn chủ là đúng nên giữ mô tả hiện tại cho công thức đó.
- **Bằng chứng:** example.note bvps dòng 346; example.title no-tren-von-chu dòng 970 (“tổng vốn chủ 40.995,7 tỷ ₫”); 39.851,5 + 1.144,2 = 40.995,7. Thông tư 202/2014/TT-BTC trình bày lợi ích cổ đông không kiểm soát bên trong phần Vốn chủ sở hữu của bảng cân đối kế toán hợp nhất. Probe: bvps equity 39.851,5 → 23.246,16 ₫; equity 40.995,7 → 23.913,59 ₫ (tỷ lệ 1,02871); roe equity 39.851,5 → 12,6848%; equity 40.995,7 → 12,3308%.
- **Sửa (vi):** Mô tả ô equity riêng cho bvps và roe: “Vốn chủ sở hữu cuối kỳ thuộc cổ đông công ty mẹ, tức đã trừ lợi ích cổ đông không kiểm soát.” (no-tren-von-chu giữ mô tả hiện tại.)
- **Sửa (en):** equity field description for bvps and roe only: “Period-end equity attributable to the parent company’s shareholders, i.e. excluding non-controlling interests.” (no-tren-von-chu keeps its current description.)

#### `roe` — ROE — tỷ suất sinh lời trên vốn chủ

**C5 · S3 · toán** — `description + explanation.meaning` (src/core/formulas/fundamentals.ts:420)

- **Trích:** Mô tả (dòng 420): “Một đồng vốn của cổ đông làm ra bao nhiêu đồng lợi nhuận trong một năm.” · Ý nghĩa (dòng 452): “Hiệu quả sử dụng vốn của cổ đông: bỏ 100 đồng vốn thì mỗi năm sinh ra bao nhiêu đồng lãi.”
- **Vấn đề:** Mô tả thẻ và mục “Công thức này nói lên điều gì” khẳng định kết quả là lãi MỖI NĂM, nhưng calc chỉ chia LNST cho vốn chủ, không quy năm, và bảng ký hiệu ghi LNST “trong kỳ”. Ví dụ trên cùng màn dùng lợi nhuận 6 tháng và example.note phải nói “Đây là hiệu quả của một kỳ SÁU THÁNG, không phải của cả năm”, tức mâu thuẫn thẳng với câu mô tả. Kết luận sai cụ thể: đọc mô tả rồi đặt 12,68% cạnh mốc “trên 15% nhiều năm liền” của “Cách đọc kết quả”, người mới kết luận FPT dưới ngưỡng doanh nghiệp tốt, trong khi quy năm là 25,37%.
- **Bằng chứng:** calc dòng 533: ok((v('netIncome') / eq) \* 100, '%'), không có hệ số năm hoá; bảng ký hiệu LNST dòng 436; example.note dòng 476. Probe: ví dụ (LNST 6 tháng 5.055,1) → 12,6848%; LNST quy năm 10.110,2 → 25,3697%. Cách sửa khác nếu muốn giữ mô tả theo năm: đổi ví dụ sang số liệu bốn quý, hoặc ghi thêm vào note “quy về một năm thì khoảng 25,4%” (đã probe).
- **Sửa (vi):** Mô tả: “Một đồng vốn của cổ đông làm ra bao nhiêu đồng lợi nhuận trong kỳ, thường tính cho một năm.” Công thức này nói lên điều gì: “Hiệu quả sử dụng vốn của cổ đông: bỏ 100 đồng vốn thì sinh ra bao nhiêu đồng lãi trong kỳ của số lợi nhuận đã nhập; nhập lợi nhuận cả năm thì đó là số lãi mỗi năm.”
- **Sửa (en):** Description: “How much profit each unit of shareholder capital generates over the period, usually measured over a year.” Meaning: “How efficiently shareholder capital is used: for every 100 units of capital, how many units of profit it generates over the period of the profit entered; with a full year's profit, that is the profit per year.”

#### `roa` — ROA — tỷ suất sinh lời trên tài sản

**C6 · S3 · câu sai** — `example.note` (src/core/formulas/fundamentals.ts:603)

- **Trích:** Khoảng cách với ROE 12,68% của cùng kỳ chính là phần đòn bẩy đóng góp: tổng tài sản lớn hơn vốn chủ 1,85 lần vì doanh nghiệp đang dùng 32.738,4 tỷ ₫ nợ phải trả, và mức khuếch đại lợi nhuận trên vốn chủ đúng bằng chừng ấy.
- **Vấn đề:** 1,85 lần là tổng tài sản chia vốn chủ của cổ đông công ty mẹ (73.734,2 ÷ 39.851,5), nhưng câu quy toàn bộ phần chênh cho 32.738,4 tỷ ₫ nợ phải trả. Tính tay đúng theo câu: (39.851,5 + 32.738,4) ÷ 39.851,5 = 1,82 lần, không ra 1,85; phần còn lại là 1.144,2 tỷ ₫ lợi ích cổ đông không kiểm soát (số example.note của bvps nêu). Nếu hiểu “vốn chủ” là tổng vốn chủ 40.995,7 như no-tren-von-chu thì tỷ lệ là 1,80 lần. Không cách đọc nào tái tạo được “1,85 lần vì 32.738,4 tỷ ₫ nợ phải trả”. Vế “mức khuếch đại đúng bằng chừng ấy” thì đúng: ROE ÷ ROA = 1,85.
- **Bằng chứng:** Probe: ROA ví dụ 6,8558%; ROE ví dụ 12,6848%; ROE ÷ ROA = 1,85022; 73.734,2 ÷ 39.851,5 = 1,85022; (39.851,5 + 32.738,4) = 72.589,9 ÷ 39.851,5 = 1,82151; 73.734,2 ÷ 40.995,7 = 1,79858; (39.851,5 + 32.738,4 + 1.144,2) = 73.734,1 ÷ 39.851,5 = 1,85022.
- **Sửa (vi):** Khoảng cách với ROE 12,68% của cùng kỳ chủ yếu do đòn bẩy: tổng tài sản bằng 1,85 lần vốn chủ của cổ đông công ty mẹ, vì ngoài phần vốn ấy doanh nghiệp còn dùng 32.738,4 tỷ ₫ nợ phải trả và 1.144,2 tỷ ₫ lợi ích cổ đông không kiểm soát. ROE đúng bằng ROA nhân với 1,85 lần ấy.
- **Sửa (en):** The gap against the same period’s ROE of 12.68% comes mostly from leverage: total assets are 1.85 times the equity attributable to the parent company’s shareholders, because on top of that equity the company uses 32,738.4 billion ₫ of liabilities and 1,144.2 billion ₫ of non-controlling interests. ROE equals ROA multiplied by exactly that 1.85.

#### `bien-loi-nhuan-gop` — Biên lợi nhuận gộp

**C7 · S2 · ví dụ** — `example.note` (src/core/formulas/fundamentals.ts:840)

- **Trích:** Giá vốn suy ra bằng doanh thu trừ lợi nhuận gộp 8.523,5 tỷ ₫. Biên gộp kỳ này co lại vì quý 2 doanh thu giảm trong khi giá vốn vẫn tăng, sau khi FPT thôi hợp nhất mảng viễn thông — nên không đọc chuỗi biên gộp 2025 và 2026 như một dãy liền mạch.
- **Vấn đề:** (1) Lệch kỳ: ô nhập là số 6 tháng đầu 2026 (tiêu đề và nguồn đều ghi 6 tháng), nhưng câu thứ hai giải thích việc biên gộp “kỳ này co lại” bằng diễn biến của riêng quý 2. Biên gộp nửa năm là bình quân của cả quý 1 và quý 2 nên không quy riêng cho quý 2 được, và màn không có số nào của quý 2 để người đọc kiểm. (2) Tự mâu thuẫn: “co lại” là so với một kỳ trước; nếu kỳ trước thuộc 2025 thì câu đang làm đúng phép so xuyên qua mốc thôi hợp nhất mảng viễn thông mà vế sau của chính nó cấm (“không đọc chuỗi biên gộp 2025 và 2026 như một dãy liền mạch”). Việc thôi hợp nhất áp dụng từ 2026 (theo note của pe) tác động cả hai quý 2026, không riêng quý 2. Kết luận sai cụ thể: người mới tin biên gộp FPT đang xấu đi vì giá vốn tăng nhanh hơn doanh thu, trong khi con số 32,45% trên màn không so được với 2025. Câu đầu (8.523,5 tỷ ₫) đúng.
- **Bằng chứng:** example.title dòng 834 và example.source dòng 844 ghi “6 tháng đầu 2026”; inputs dòng 837 { revenue: 26_268.5, cogs: 17_745 }. Probe → 32,4476%; 26.268,5 − 17.745 = 8.523,5. multiples.ts dòng 107 (note của pe): “EPS bốn quý gần nhất vẫn còn phần FPT Telecom của các quý 2025, trong khi từ 2026 khoản này không còn hợp nhất.”
- **Sửa (vi):** Giá vốn suy ra bằng doanh thu trừ lợi nhuận gộp 8.523,5 tỷ ₫. Từ 2026 FPT thôi hợp nhất mảng viễn thông, nên biên gộp 6 tháng đầu 2026 không đặt cạnh biên gộp các kỳ 2025 để kết luận co hay giãn được: cơ cấu doanh thu hai bên khác nhau, muốn so thì so với các kỳ có cùng phạm vi hợp nhất.
- **Sửa (en):** Cost of goods sold is derived as revenue minus gross profit of 8,523.5 billion ₫. FPT stopped consolidating its telecom arm from 2026, so the H1 2026 gross margin cannot be set beside 2025 periods to conclude that it narrowed or widened: the revenue mix differs, so compare only with periods that have the same consolidation scope.

#### `no-tren-von-chu` — D/E — hệ số nợ trên vốn chủ

**C8 · S2 · gây hiểu sai** — `description + explanation.meaning + variables.totalLiabilities.description` (src/core/formulas/fundamentals.ts:890)

- **Trích:** Mô tả (dòng 890): “Doanh nghiệp đang vay bao nhiêu đồng nợ trên mỗi đồng vốn của cổ đông.” · Ý nghĩa (dòng 952): “Mức độ dùng đòn bẩy tài chính: doanh nghiệp dựa vào tiền vay nhiều hay ít so với vốn tự có.” · Mô tả ô (dòng 943): “Toàn bộ nợ ngắn hạn và dài hạn trên bảng cân đối kế toán.”
- **Vấn đề:** Calc chia TỔNG nợ phải trả (gồm cả phải trả người bán, người mua trả tiền trước, chi phí phải trả, là những khoản không tính lãi) cho vốn chủ, nhưng mô tả thẻ nói “đang vay bao nhiêu đồng nợ” và mục ý nghĩa nói “dựa vào tiền vay”; bản en của mô tả ô còn viết “debt” (thường hiểu là nợ vay) ngay dưới nhãn “Total liabilities”. Chính example.note của công thức phủ nhận cách đọc đó: chỉ khoảng 17.444 tỷ ₫ là nợ vay có lãi, tính riêng nợ vay thì hệ số còn 0,43 lần. Kết luận sai cụ thể: đọc mô tả rồi nhìn 0,80 lần trên màn, người mới tin FPT đi vay 0,80 đồng trên mỗi đồng vốn, gần gấp đôi con số nợ vay thật (0,43). Đây cũng đúng sai lầm “Coi mọi khoản nợ như nhau” mà commonMistakes của chính công thức cảnh báo. Người dùng bản en làm theo “All short-term and long-term debt” sẽ nhập 17.444 và nhận 0,43 thay vì 0,80.
- **Bằng chứng:** calc dòng 1033: ok(v('totalLiabilities') / eq, 'lần'); bảng ký hiệu D dòng 909 (“tức tổng nợ phải trả”); example.note dòng 976. Probe: ví dụ 32.738,4 ÷ 40.995,7 → 0,7986 lần; chỉ nợ vay 17.444 → 0,4255 lần. Tiền lệ trong repo: ncav-tren-co-phieu dùng cùng khoá totalLiabilities và viết “Toàn bộ nợ ngắn hạn và dài hạn, không riêng nợ vay.” / “All short-term and long-term liabilities, not just borrowed debt.” (valuation-multiples.ts dòng 1309 và 1310); comment ở fundamentals.ts dòng 931 và 932 nói hai công thức dùng khoá này “với đúng nghĩa này”.
- **Sửa (vi):** Mô tả: “Doanh nghiệp đang gánh bao nhiêu đồng nợ phải trả, gồm cả nợ vay lẫn các khoản không tính lãi, trên mỗi đồng vốn của cổ đông.” Công thức này nói lên điều gì: “Mức độ dùng đòn bẩy tài chính: doanh nghiệp dựa vào vốn của người khác, gồm nợ vay lẫn các khoản chiếm dụng như phải trả người bán, nhiều hay ít so với vốn tự có.” Mô tả ô totalLiabilities: “Toàn bộ nợ ngắn hạn và dài hạn trên bảng cân đối kế toán, không riêng nợ vay.”
- **Sửa (en):** Description: “How much in total liabilities, borrowings and interest-free items alike, the company carries for every unit of shareholder capital.” Meaning: “The degree of financial leverage: how much the company relies on other people's money, both borrowings and interest-free items such as trade payables, relative to its own capital.” totalLiabilities field description: “All short-term and long-term liabilities on the balance sheet, not just borrowed debt.”

#### `thanh-toan-nhanh` — Hệ số thanh toán nhanh

**C9 · S3 · gây hiểu sai** — `example.note` (src/core/formulas/fundamentals.ts:1223)

- **Trích:** Bỏ tồn kho ra gần như không làm hệ số suy giảm, vì tồn kho chỉ chiếm 2,6% tài sản ngắn hạn — nét đặc trưng của doanh nghiệp dịch vụ. Phép thử này chỉ thực sự cảnh báo được ở doanh nghiệp bán lẻ hay sản xuất, nơi hai hệ số cách nhau rất xa.
- **Vấn đề:** Chữ “chỉ” loại bất động sản ra khỏi nhóm mà phép thử có tác dụng, trong khi “Khi nào dùng” của chính công thức đặt bất động sản đầu danh sách (“bất động sản, thép, bán lẻ”), và doanh nghiệp phát triển bất động sản là nơi hàng tồn kho (dự án, quỹ đất) chiếm phần lớn tài sản ngắn hạn. Kết luận sai cụ thể: với cổ phiếu bất động sản thì chỉ cần nhìn hệ số hiện hành, hệ số nhanh không cảnh báo thêm gì. Câu đầu của note đúng.
- **Bằng chứng:** whenToUse dòng 1203. Probe: ví dụ → 1,5160 lần, hệ số hiện hành cùng số → 1,5563 lần, tồn kho 1.183,1 ÷ 45.702 = 2,59% (“2,6%” đúng). Minh hoạ cùng tài sản ngắn hạn 45.702 và nợ ngắn hạn 29.365,3 nhưng tồn kho 70% tài sản ngắn hạn (31.991,4): hệ số nhanh 0,47 lần so với hệ số hiện hành 1,56 lần.
- **Sửa (vi):** Bỏ tồn kho ra gần như không làm hệ số suy giảm, vì tồn kho chỉ chiếm 2,6% tài sản ngắn hạn, đúng nét của doanh nghiệp dịch vụ. Phép thử này thực sự cảnh báo được ở doanh nghiệp tồn kho lớn như bất động sản, sản xuất hay bán lẻ, nơi hai hệ số cách nhau rất xa.
- **Sửa (en):** Removing inventory barely dents the ratio, because inventory is only 2.6% of current assets, the hallmark of a services company. This test really warns you at companies with heavy inventory, such as real estate developers, manufacturers or retailers, where the two ratios sit far apart.

#### `vong-quay-tong-tai-san` — Vòng quay tổng tài sản

**C10 · S3 · toán** — `description` (src/core/formulas/fundamentals.ts:1298)

- **Trích:** Một đồng tài sản tạo ra bao nhiêu đồng doanh thu trong một năm.
- **Vấn đề:** Mô tả thẻ nói kết quả là doanh thu mỗi NĂM, nhưng calc chỉ chia doanh thu cho tổng tài sản, không quy năm; bảng ký hiệu trên cùng màn ghi “tính bằng số vòng trong kỳ”, còn ví dụ dùng doanh thu nửa năm và note nói “Doanh thu ở đây mới là nửa năm”. Mô tả mâu thuẫn với cả bảng ký hiệu lẫn ví dụ. Kết luận sai cụ thể: đọc 0,36 vòng như số cả năm rồi xếp FPT vào nhóm “quay chậm (dưới 0,5 vòng)” của điện nước, bất động sản trong “Cách đọc kết quả”, trong khi quy năm là 0,71 vòng.
- **Bằng chứng:** calc dòng 1386: ok(v('revenue') / assets, 'vòng'); bảng ký hiệu dòng 1310; example.note dòng 1346; howToRead dòng 1330. Probe: ví dụ → 0,3563 vòng; doanh thu quy năm 52.537 → 0,7125 vòng.
- **Sửa (vi):** Một đồng tài sản tạo ra bao nhiêu đồng doanh thu trong kỳ, thường tính cho một năm.
- **Sửa (en):** How much revenue each unit of assets generates over the period, usually measured over a year.

#### `ty-le-chi-tra-co-tuc` — Hệ số chi trả cổ tức

**C11 · S3 · cảnh báo** — `calc: cảnh báo MEANINGLESS khi EPS âm (message + fix)` (src/core/formulas/fundamentals.ts:1543)

- **Trích:** Thông điệp (dòng 1543): “Hệ số chi trả không có ý nghĩa khi doanh nghiệp đang lỗ: cổ tức lúc này lấy từ tiền tích luỹ, không phải từ lợi nhuận trong kỳ.” · Gợi ý sửa (dòng 1547): “Xem nguồn tiền trả cổ tức trên báo cáo lưu chuyển tiền tệ.”
- **Vấn đề:** Điều kiện kích hoạt chỉ là eps < 0, không xét cổ tức, trong khi ô cổ tức cho phép nhập 0. Doanh nghiệp lỗ và không trả cổ tức (ca thường gặp) nhập cổ tức 0 vẫn nhận câu khẳng định “cổ tức lúc này lấy từ tiền tích luỹ” cùng lời khuyên đi xem nguồn tiền trả cổ tức, dù không có khoản cổ tức nào.
- **Bằng chứng:** Dòng 1538: if (eps < 0) { … }; ô dividendPerShare min 0 (dòng 1440). Probe: cổ tức 0, EPS −1.500 → MEANINGLESS với đúng thông điệp và gợi ý trên; cổ tức 2.000, EPS −1.500 → cùng thông điệp.
- **Sửa (vi):** Thông điệp: “Hệ số chi trả không có ý nghĩa khi doanh nghiệp đang lỗ: kỳ này không có lợi nhuận để chia, nên cổ tức nếu có phải lấy từ lợi nhuận giữ lại của các kỳ trước.” Gợi ý sửa: “Nếu doanh nghiệp vẫn trả cổ tức, xem nguồn tiền trả trên báo cáo lưu chuyển tiền tệ.”
- **Sửa (en):** Message: “The payout ratio is not meaningful when the company is running a loss: there is no profit this period to pay out of, so any dividend has to come from earnings retained in earlier periods.” Fix: “If the company still pays a dividend, check where the cash came from on the cash flow statement.”

### `corporate.ts`

#### `diem-hoa-von` — Điểm hoà vốn doanh nghiệp

**A14 · S3 · ví dụ** — `example.inputs.variableCost / example.note` (src/core/formulas/corporate.ts:146)

- **Trích:** variableCost: 689_600 | (dòng 149) Điểm hoà vốn tương đương khoảng 7.834 tỷ ₫ doanh thu mỗi quý, thấp hơn doanh thu thực khoảng 43%
- **Vấn đề:** Nguồn ghi biến phí lấy theo giá vốn trên doanh thu thuần quý 2/2026 của FPT; cùng quý đó ví dụ don-bay-tong-hop dùng giá vốn 9.508,8 tỷ trên doanh thu 13.788,5 tỷ, tức 68,9618%, ra 689.618 ₫ cho mỗi 1 triệu ₫ doanh thu, không phải 689.600 (đã làm tròn về 68,96%). Note hiện tại KHÔNG còn câu 'theo đúng tỷ lệ giá vốn' của bảng tính cũ, nên chỉ còn lệch làm tròn: sản lượng hoà vốn 7.834.407 thay vì 7.834.862, doanh thu hoà vốn 7.834,4 thay vì 7.834,9 tỷ ₫ (0,006%). Câu 'khoảng 43%' vẫn đúng (43,18%). Tác động không đáng kể.
- **Bằng chứng:** 9.508,8 ÷ 13.788,5 × 1.000.000 = 689.618,16 ₫ (corporate.ts dòng 373–374). Probe diem-hoa-von {variableCost 689.618} → 7.834.861,56 sản phẩm; ví dụ hiện tại → 7.834.407,22. (13.788,5 − 7.834,9) ÷ 13.788,5 = 43,18%.
- **Sửa (vi):** Đổi variableCost thành 689.618, expected 7.834.862; note: 'Điểm hoà vốn tương đương khoảng 7.835 tỷ ₫ doanh thu mỗi quý, thấp hơn doanh thu thực khoảng 43%…' (phần còn lại giữ nguyên).
- **Sửa (en):** Change variableCost to 689,618 and expected to 7,834,862; note: 'The break-even point works out to roughly 7,835 billion ₫ of revenue per quarter, about 43% below actual revenue…' (the rest unchanged).

### `risk.ts`

#### `co-lenh-rui-ro` — Cỡ lệnh theo % rủi ro

**C1 · S2 · ví dụ** — `example.title + example.source` (src/core/formulas/risk.ts:125)

- **Trích:** Tiêu đề (dòng 125): “Vốn 500 triệu ₫, rủi ro 2% mỗi lệnh, mua FPT giá phiên 11/09/2026, cắt lỗ dưới đáy tháng 8/2026” · Nguồn (dòng 135): “investing.com, giá đóng cửa CTCP FPT (mã FPT) phiên 11/09/2026; mức cắt lỗ lấy theo đáy phiên 14/08/2026.”
- **Vấn đề:** Ô giá cắt lỗ là 68.300 ₫, đúng bằng GIÁ ĐÓNG CỬA phiên 14/08/2026 (cũng là giá đóng cửa thấp nhất tháng 8), không phải đáy phiên 14/08 và không nằm dưới đáy tháng 8. Theo chính chuỗi FPT_57_BARS của repo: đáy phiên 14/08 là 68.000 ₫; đáy trong phiên thấp nhất tháng 8 là 67.300 ₫ (03/08); phiên 18/08 cũng có đáy 68.200 ₫, thấp hơn 68.300 ₫. Vậy “cắt lỗ dưới đáy tháng 8” sai với cả hai cách hiểu chữ “đáy” (68.300 cao hơn đáy trong phiên 67.300, và chỉ bằng chứ không dưới giá đóng cửa thấp nhất), còn “đáy phiên 14/08” trỏ nhầm sang giá đóng cửa. Người đọc làm theo cách đặt cắt lỗ mà tiêu đề tả sẽ ra cỡ lệnh khác hẳn con số trên màn và khác con số 2.200 CP mà “Cách đọc kết quả” nêu.
- **Bằng chứng:** market-series-2026.ts dòng 101: bar('14/08/2026', 69_300, 69_600, 68_000, 68_300, …) → đáy 68.000, đóng cửa 68.300; dòng 92: bar('03/08/2026', 67_400, 71_700, 67_300, 71_700, …) → đáy 67.300; dòng 103: 18/08 đáy 68.200. Giá vào 72.700 khớp giá đóng cửa 11/09 (dòng 118). Quét 20 phiên tháng 8: đáy trong phiên thấp nhất 67.300 (03/08), giá đóng cửa thấp nhất 68.300 (14/08). Probe (vốn 500.000.000 ₫, 2%, vào 72.700): cắt lỗ 68.300 (ví dụ) → 2.272,73 CP (tròn lô 2.200); 68.000 (đáy phiên 14/08) → 2.127,66 CP (tròn lô 2.100); 67.900 (ngay dưới đáy 14/08) → 2.083,33 CP (2.000); 67.300 (đáy tháng 8) → 1.851,85 CP (1.800); 67.200 (ngay dưới đáy tháng 8) → 1.818,18 CP (1.800).
- **Sửa (vi):** Giữ ô nhập, sửa chữ. Tiêu đề: “Vốn 500 triệu ₫, rủi ro 2% mỗi lệnh, mua FPT giá phiên 11/09/2026, cắt lỗ ở giá đóng cửa thấp nhất tháng 8/2026”. Nguồn: “investing.com, giá đóng cửa CTCP FPT (mã FPT) phiên 11/09/2026; mức cắt lỗ lấy theo giá đóng cửa phiên 14/08/2026, thấp nhất tháng 8/2026.” (Nếu muốn giữ ý “dưới đáy tháng 8” thì phải đổi stopPrice thành 67.200, expected thành 1.818, và câu trong howToRead thành “1.818,18 CP nghĩa là cỡ lệnh dừng ở 1.800 CP sau khi làm tròn xuống bội 100 cổ phiếu”.)
- **Sửa (en):** Keep the inputs, fix the words. Title: “Capital of 500 million ₫, 2% risk per trade, buying FPT at the 2026-09-11 close with a stop at the lowest close of August 2026”. Source: “investing.com, FPT Corp’s (ticker FPT) close on 2026-09-11; the stop-loss level taken from the 2026-08-14 close, the lowest close of August 2026.” (To keep a stop below the August low instead, change stopPrice to 67,200, expected to 1,818, and the howToRead sentence to “1,818.18 shares means the order stops at 1,800 shares once rounded down to a multiple of 100”.)

### `technical-trend.ts`

#### `macd-duong-tin-hieu` — Đường tín hiệu MACD

**D1 · S2 · câu sai** — `explanation.howToRead` (src/core/formulas/technical-trend.ts:784)

- **Trích:** Hiệu của hai đường chính là cột histogram trả kèm ở phần kết quả phụ — trong ví dụ 12/26/9, đường tín hiệu 25,07 ₫ còn MACD −247,35 ₫ nên histogram âm sâu.
- **Vấn đề:** Câu neo vào 'ví dụ 12/26/9' nhưng các con số là của ca kiểm cũ trên chuỗi tự dựng 40 phiên, không phải khối Ví dụ đang hiện trên màn (FPT 57 phiên tới 15/09/2026, cùng bộ 12/26/9). Trên màn: đường tín hiệu 751,99 ₫, MACD 808,21 ₫, histogram DƯƠNG 56,22 ₫, tức MACD đang nằm TRÊN đường tín hiệu. Kết luận 'histogram âm sâu' (đà nghiêng xuống) ngược với ví dụ thật ngay dưới. Câu được viết ở lượt rà 11–13/09 khi ví dụ còn là chuỗi 40 phiên; khối Ví dụ bị thay bằng số FPT ngày 15–16/09 nhưng câu này không được cập nhật.
- **Bằng chứng:** dump example.engine: value 751,9887 ₫; extras.macd 808,2088 ₫; extras.histogram 56,2201 ₫. Probe 'Signal vi du' (đầu vào ví dụ) → 751,9887 ₫. Tính độc lập (EMA12/EMA26 mồi SMA, EMA9 trên chuỗi MACD) cho MACD 808,2088, signal 751,9887, histogram 56,2201. Số 25,07 là expected 25,0651 của tests 'bộ 12/26/9 trên chuỗi 40 phiên' (technical-trend.ts dòng 811–815, GIA_40_PHIEN), không hiện trên màn; REVIEW.md dòng 496–497 ghi đúng nguồn gốc này.
- **Sửa (vi):** Đường tín hiệu là một con số tính bằng đồng, chỉ có nghĩa khi đọc kèm đường MACD: MACD nằm trên đường tín hiệu là đà đang nghiêng lên, nằm dưới là đang nghiêng xuống. Hiệu của hai đường chính là cột histogram trả kèm ở phần kết quả phụ. Trong ví dụ 12/26/9 trên màn, đường tín hiệu 751,99 ₫ còn MACD 808,21 ₫, nên histogram dương 56,22 ₫, tức MACD vẫn nằm trên đường tín hiệu.
- **Sửa (en):** The signal line is a figure in dong that only means something read next to the MACD line: MACD above the signal line means momentum is leaning up, below it means leaning down. The gap between the two is the familiar histogram bar, returned in the extra results. In the 12/26/9 example on screen the signal line is 751.99 VND while MACD is 808.21 VND, so the histogram is a positive 56.22 VND, meaning MACD is still above the signal line.

#### `rsi-wilder` — RSI 14 phiên (Wilder)

**D2 · S2 · câu sai** — `example.note` (src/core/formulas/technical-trend.ts:973)

- **Trích:** Bản Wilder làm mượt theo hệ số 1/14 chứ không lấy trung bình cộng thuần — lập trình nhầm sang trung bình cộng thì kết quả lệch dần theo chiều dài chuỗi
- **Vấn đề:** Đảo ngược cơ chế. Trung bình cộng thuần của 14 thay đổi giá cuối chỉ phụ thuộc 15 giá cuối nên KHÔNG đổi theo chiều dài chuỗi; chính bản Wilder mà màn này tính mới mang theo phần chuỗi phía trước và đổi số khi nạp chuỗi dài ngắn khác nhau, đúng điều mô tả ô Số phiên trên cùng màn đã nói ('Cách làm mượt của Wilder còn kéo theo cả phần chuỗi phía trước'). Mức đổi cũng không 'dần' theo chiều dài mà lên xuống. Kết luận sai cụ thể: người dùng thấy RSI đổi khi nạp thêm phiên sẽ tưởng mình (hoặc bảng giá) đang dùng nhầm trung bình cộng, trong khi đó là hành vi đúng của Wilder.
- **Bằng chứng:** Probe rsi-wilder period 14 trên FPT_57_PHIEN, cắt n phiên cuối: 15 → 53,0435; 16 → 60,6502; 18 → 61,9921; 20 → 63,1829; 25 → 53,8699; 30 → 58,2386; 40 → 56,4928; 50 → 54,8524; 57 → 55,8734 điểm. Trung bình cộng thuần của 14 thay đổi cuối (tổng tăng 6.100 ₫, tổng giảm 5.400 ₫) = 53,0435 điểm với mọi độ dài chuỗi (tính độc lập; trùng giá trị Wilder khi chỉ nạp 15 giá, như tests 'chuỗi 15 giá cho đúng 14 lợi suất, chưa có bước làm mượt nào'). calc wilderAverages dòng 225–250: mồi bằng trung bình `period` thay đổi đầu rồi làm mượt qua toàn bộ phần còn lại của chuỗi.
- **Sửa (vi):** Chỉ số chạy từ 0 đến 100 với hai ngưỡng quy ước: dưới 30 là quá bán, trên 70 là quá mua. Bản Wilder làm mượt theo hệ số 1/14 chứ không lấy trung bình cộng thuần của 14 phiên cuối, nên nó còn mang theo phần chuỗi phía trước: cùng dữ liệu FPT, nạp 15 phiên cuối cho 53,04 điểm, nạp 20 phiên cho 63,18 điểm, nạp đủ 57 phiên cho 55,87 điểm, còn trung bình cộng thuần đứng yên ở 53,04 điểm dù nạp bao nhiêu phiên. Trong xu hướng mạnh, chỉ số nằm trên 70 hàng chục phiên liền là chuyện bình thường.
- **Sửa (en):** The index runs from 0 to 100 with two conventional thresholds: below 30 is oversold, above 70 is overbought. Wilder's version smooths with a 1/14 factor rather than taking a plain average of the last 14 sessions, so it also carries the earlier part of the series: on the same FPT data, loading the last 15 sessions gives 53.04 points, 20 sessions gives 63.18 points and all 57 sessions gives 55.87 points, while the plain average stays at 53.04 points however many sessions are loaded. In a strong trend, the index staying above 70 for dozens of sessions is perfectly normal.

**D3 · S3 · gây hiểu sai** — `explanation.howToRead` (src/core/formulas/technical-trend.ts:956)

- **Trích:** Không phiên nào giảm thì RSI chạm đúng trần 100, đó là giá trị thật chứ không phải lỗi.
- **Vấn đề:** Chỉ đúng khi CẢ chuỗi đã nạp không có phiên giảm. Mục 'Công thức này nói lên điều gì' ngay trên nói RSI đo 'trong N phiên gần nhất', nên người đọc hiểu 'không phiên nào giảm trong 14 phiên gần nhất thì RSI = 100'. Nhưng làm mượt Wilder giữ lại một phần mọi phiên giảm trước đó, nên 14 phiên cuối đều tăng vẫn có thể cho RSI xa 100. Kết luận sai cụ thể: thấy RSI dưới 100 thì cho rằng trong 14 phiên gần nhất phải có phiên giảm.
- **Bằng chứng:** Probe rsi-wilder period 14 trên chuỗi tự dựng 29 giá: 15 giá đầu răng cưa (7 phiên giảm 500 ₫, 7 phiên tăng 300 ₫) rồi 14 phiên tăng đều 100 ₫ → 57,0608 điểm; cùng chuỗi chỉ lấy 15 giá cuối (14 phiên đều tăng) → 100 điểm. calc dòng 1052 chỉ trả 100 khi avgLoss === 0, mà avgLoss Wilder chỉ bằng 0 khi không có thay đổi âm nào trong cả chuỗi.
- **Sửa (vi):** Trên 70 là vùng quá mua, dưới 30 là vùng quá bán, quanh 50 là cân bằng. RSI chỉ chạm đúng trần 100 khi cả chuỗi đã nạp không có phiên nào giảm, đó là giá trị thật chứ không phải lỗi; riêng 14 phiên gần nhất đều tăng thì RSI vẫn có thể thấp hơn 100 khá xa.
- **Sửa (en):** Above 70 is the overbought zone, below 30 is the oversold zone, and around 50 is balance. RSI only hits the ceiling of exactly 100 when no session in the whole loaded series declined, and that is a genuine value, not an error; the last 14 sessions all rising can still leave RSI well below 100.

**D4 · S3 · cảnh báo** — `calc: cảnh báo MEANINGLESS khi giá đứng yên (message + fix)` (src/core/formulas/technical-trend.ts:1043)

- **Trích:** Giá đóng cửa không đổi suốt cả kỳ nên không có đà tăng hay đà giảm nào để so sánh. | Chọn chuỗi giá có biến động, hoặc kéo dài số phiên để bao được nhịp giá gần nhất.
- **Vấn đề:** Điều kiện kích hoạt (dòng 1034: avgGain === 0 && avgLoss === 0) chỉ xảy ra khi MỌI giá trong cả chuỗi đã nạp bằng nhau, vì làm mượt Wilder dùng toàn bộ chuỗi bất kể Số phiên. Vì vậy gợi ý 'kéo dài số phiên' không bao giờ gỡ được cảnh báo: số phiên nào hợp lệ cũng vẫn báo, vượt độ dài chuỗi thì chuyển sang thiếu chuỗi. Ngược lại, giá đứng yên suốt N phiên gần nhất (đúng nghĩa 'suốt cả kỳ') thì KHÔNG báo mà ra một con số.
- **Bằng chứng:** Probe chuỗi 30 giá cùng 25.000 ₫: period 14 → MEANINGLESS; period 28 → MEANINGLESS; period 29 → MEANINGLESS. Chuỗi 10 phiên dao động rồi 20 phiên đứng yên ở 25.600 ₫, period 14 → 71,4286 điểm, không cảnh báo, dù 14 phiên gần nhất không đổi giá.
- **Sửa (vi):** Thông điệp: 'Mọi giá đóng cửa trong chuỗi đã nạp đều bằng nhau nên không có đà tăng hay đà giảm nào để so sánh.' Gợi ý sửa: 'Nạp chuỗi giá có ít nhất một phiên đổi giá; đổi số phiên không giúp được vì cách làm mượt của Wilder đã dùng toàn bộ chuỗi.'
- **Sửa (en):** Message: 'Every closing price in the loaded series is the same, so there is no upward or downward momentum to compare.' Fix: 'Load a price series in which at least one session changes price; changing the number of periods does not help, because Wilder's smoothing already uses the whole series.'

#### `ema-n-phien` — Trung bình động luỹ thừa (EMA)

**D5 · S3 · ví dụ** — `example.title` (src/core/formulas/technical-trend.ts:501)

- **Trích:** EMA 12 phiên của FPT sau cú sụt tháng 7/2026
- **Vấn đề:** Tiêu đề là chỗ duy nhất trong khối Ví dụ nói ví dụ đo ở thời điểm nào, và nó chỉ vào quãng ngay sau cú sụt tháng 7 (đáy 62.200 ₫ ngày 27/07). Nhưng chuỗi ví dụ chạy tới 15/09/2026 và kết quả 72.388,84 ₫ là EMA tại phiên 15/09, sau cả nhịp hồi tháng 8. Ngay sau cú sụt, EMA 12 chỉ quanh 66.000 ₫. Người đọc sẽ tưởng EMA sau cú sụt nằm ở 72.389 ₫.
- **Bằng chứng:** Probe ema-n-phien period 12: seriesSlice [0,24] (tới 27/07/2026) → 66.069,24 ₫; [0,28] (tới 31/07) → 65.956,15 ₫; cả chuỗi (tới 15/09) → 72.388,84 ₫ = kết quả ví dụ. Cú sụt 07/07 73.200 ₫ → 27/07 62.200 ₫ (−15,03%); nhịp hồi 14/08 68.300 ₫ → 28/08 73.200 ₫ (+7,17%). Source cùng khối ghi '57 phiên 24/06–15/09/2026'; ví dụ ROC và Động lượng cùng file ghi 'chốt phiên 15/09/2026'.
- **Sửa (vi):** EMA 12 phiên của FPT, chốt phiên 15/09/2026
- **Sửa (en):** 12-session EMA for FPT as of the 2026-09-15 session

**D6 · S3 · gây hiểu sai** — `example.note` (src/core/formulas/technical-trend.ts:508)

- **Trích:** Trọng số giảm dần theo hàm mũ về quá khứ nên đường bám giá sát hơn SMA cùng kỳ: hệ số làm mượt 2/(12+1) ≈ 0,1538, tức mỗi phiên mới đóng góp khoảng 15,4% giá trị đường.
- **Vấn đề:** Câu trình bày 'bám giá sát hơn SMA cùng kỳ' như hệ quả tất yếu, nhưng ngay trên ví dụ này EMA 12 lại nằm XA giá đóng cửa hơn SMA 12: 12 phiên cuối đi ngang, còn EMA vẫn dành khoảng 13,5% trọng số cho các phiên cũ hơn, lúc giá phần lớn thấp hơn. Tính chất đúng là EMA quay đầu sớm hơn khi giá đổi chiều, không phải lúc nào cũng nằm sát giá hơn. Kết luận sai cụ thể: chọn EMA thay SMA vì tin nó luôn gần giá hiện tại hơn. (Hai số 0,1538 và 15,4% đúng.)
- **Bằng chứng:** Probe phiên 15/09/2026 trên chuỗi ví dụ: ema-n-phien period 12 → 72.388,84 ₫; sma-n-phien period 12 → 72.691,67 ₫; giá đóng cửa 72.700 ₫. EMA cách giá 311,16 ₫, SMA 12 cách 8,33 ₫. Tổng trọng số EMA 12 dành cho phần trước 12 phiên cuối = (11/13)^12 = 0,1347 (tính tay); 2/13 = 0,153846.
- **Sửa (vi):** Trọng số giảm dần theo hàm mũ về quá khứ nên EMA quay đầu sớm hơn SMA cùng kỳ khi giá đổi chiều, nhưng không phải lúc nào cũng nằm sát giá hơn: phiên 15/09/2026, EMA 12 là 72.388,84 ₫ còn SMA 12 là 72.691,67 ₫ và giá đóng cửa 72.700 ₫, vì EMA vẫn dành khoảng 13,5% trọng số cho các phiên cũ hơn 12 phiên, lúc giá phần lớn thấp hơn. Hệ số làm mượt 2/(12+1) ≈ 0,1538, tức mỗi phiên mới đóng góp khoảng 15,4% giá trị đường.
- **Sửa (en):** Weights decay exponentially into the past, so the EMA turns sooner than an SMA of the same period when price changes direction, but it does not always sit closer to price: on the 2026-09-15 session the 12-session EMA is 72,388.84 VND while the 12-session SMA is 72,691.67 VND and the close is 72,700 VND, because the EMA still gives about 13.5% of its weight to sessions older than 12, when price was mostly lower. The smoothing factor of 2/(12+1) ≈ 0.1538 means each new session contributes about 15.4% of the line.

**D7 · S3 · câu sai** — `example.note` (src/core/formulas/technical-trend.ts:508)

- **Trích:** Đổi lại là nhiễu và tín hiệu giả nhiều hơn — đó là lý do MACD dùng EMA còn dải Bollinger dùng SMA.
- **Vấn đề:** Lý do gán cho dải Bollinger sai nguồn: Bollinger dùng SMA không phải để tránh nhiễu của EMA mà vì độ lệch chuẩn của dải được tính quanh trung bình cộng đơn giản, nên đường giữa phải là SMA cho nhất quán. Bollinger nêu đích danh lý do này.
- **Bằng chứng:** John Bollinger, các quy tắc dải Bollinger (bollingerbands.com; cùng nội dung với Bollinger on Bollinger Bands, nguồn SOURCE_BOLLINGER của repo), quy tắc 12: 'Bollinger Bands are based upon a simple moving average. This is because a simple moving average is used in the standard deviation calculation and we wish to be logically consistent.' Trong repo, bollingerParts() (technical-volatility.ts dòng 218) cũng lấy middle = mean(window) và độ lệch chuẩn quanh chính trung bình đó.
- **Sửa (vi):** Đổi lại là nhiễu và tín hiệu giả nhiều hơn. Dải Bollinger vẫn dùng SMA vì độ lệch chuẩn của dải cũng tính quanh trung bình cộng đơn giản, Bollinger chọn vậy cho nhất quán.
- **Sửa (en):** The trade-off is more noise and more false signals. Bollinger bands still use an SMA because the band's standard deviation is also measured around a simple average, and Bollinger chose it for consistency.

#### `khoang-cach-gia-so-sma` — Khoảng cách giá so với SMA

**D8 · S2 · gây hiểu sai** — `example.note` (src/core/formulas/technical-trend.ts:1466)

- **Trích:** Vì tính bằng phần trăm nên khoảng cách so sánh được giữa các mã và giữa các thời điểm; ý tưởng nền là giá có xu hướng quay về trung bình, giãn càng rộng thì xác suất bị kéo ngược càng cao.
- **Vấn đề:** Câu hứa một quy luật hồi về trung bình mà con số này không nói gì tới, và mâu thuẫn với 'Sai lầm thường gặp' cùng màn ('Mã biến động mạnh thường xuyên lệch 15–20% mà chưa có gì bất thường'). Đây chính là mệnh đề đã bị xác nhận gây hiểu nhầm và gỡ khỏi whenToUse ở lượt rà 11–13/09 ('thường có nhịp co về'), nay quay lại trong khối Ví dụ khi thay số thật 15–16/09. Kết luận sai cụ thể: thấy khoảng cách rộng thì đặt cược giá sắp bị kéo về.
- **Bằng chứng:** Probe khoang-cach-gia-so-sma period 20 trên chuỗi tự dựng 80 phiên tăng đều 1%/phiên: phiên 20, 30, 40, 60 và 80 đều ra 9,7333%, khoảng cách đứng yên chứ không co về. commonMistakes cùng màn ở dòng 1453. REVIEW.md dòng 471–477 (khoang-cach-gia-so-sma, whenToUse, 171/171 phản ví dụ, đã áp).
- **Sửa (vi):** Vì tính bằng phần trăm nên khoảng cách so sánh được giữa các mã và giữa các thời điểm, nhưng khoảng cách rộng tự nó không báo giá sắp bị kéo về: trong một xu hướng tăng đều, giá có thể đứng cách đường trung bình cùng một khoảng suốt nhiều phiên.
- **Sửa (en):** Being a percentage, the gap is comparable across tickers and across dates, but a wide gap does not by itself signal that price is about to be pulled back: in a steady uptrend, price can stay the same distance above the average for many sessions.

**D9 · S3 · ví dụ** — `example.note` (src/core/formulas/technical-trend.ts:1466)

- **Trích:** Ngay trong chuỗi này, cú rơi 5% về 66.800 ₫ giữa tháng 7/2026 đẩy khoảng cách xuống âm sâu.
- **Vấn đề:** Với chu kỳ 20 của chính ví dụ, ngày 15/07 chuỗi mới có 16 phiên nên chưa có SMA 20 để tính khoảng cách; phiên đầu tiên tính được là 21/07 (−7,85%). Mức âm sâu nhất của cả chuỗi (−9,71%) rơi vào 27/07, sau khi giá rơi tiếp 6,9% từ 66.800 ₫ xuống 62.200 ₫. Câu gán mức âm sâu cho riêng cú rơi 15/07, điều không thể thấy trên chuỗi và chu kỳ của chính ví dụ.
- **Bằng chứng:** Probe khoang-cach-gia-so-sma period 20: seriesSlice [0,16] (tới 15/07) → MISSING_SERIES; [0,20] (21/07) → −7,8498%; [0,24] (27/07) → −9,7111%, thấp nhất trong 38 phiên tính được (end 20..57). Giá 14/07 70.300 ₫ → 15/07 66.800 ₫ = −4,979%; 15/07 66.800 ₫ → 27/07 62.200 ₫ = −6,886%.
- **Sửa (vi):** Ngay trong chuỗi này, nhịp giảm tháng 7/2026 (rơi 5% về 66.800 ₫ ngày 15/07 rồi xuống 62.200 ₫ ngày 27/07) kéo khoảng cách so với SMA 20 xuống thấp nhất −9,71% vào ngày 27/07; riêng ngày 15/07 chuỗi mới có 16 phiên nên chưa có SMA 20 để so.
- **Sửa (en):** Within this very series, the July 2026 slide (a 5% drop to 66,800 VND on July 15, then down to 62,200 VND on July 27) took the gap to the 20-session SMA to its low of −9.71% on July 27; on July 15 itself the series has only 16 sessions, so there is no 20-session SMA to compare against yet.

### `technical-volatility.ts`

#### `dai-bollinger-tren` — Dải Bollinger trên

**D10 · S1 · toán** — `variables.k.description (BOLLINGER_K dùng chung cho dai-bollinger-tren, dai-bollinger-duoi, do-rong-dai-bollinger, phan-tram-b-bollinger) + explanation.commonMistakes của dai-bollinger-tren (dòng 354)` (src/core/formulas/technical-volatility.ts:197)

- **Trích:** Bollinger dùng 2. Độ lệch chuẩn ở đây là độ lệch chuẩn MẪU (chia cho n−1); bảng giá nào chia cho n sẽ ra dải hẹp hơn một chút. | (commonMistakes) Ngoài ra độ lệch chuẩn ở đây chia cho n−1, một số bảng giá chia cho n nên dải của họ hẹp hơn chút ít.
- **Vấn đề:** Định nghĩa của chính Bollinger (nguồn SOURCE_BOLLINGER của nhóm) dùng độ lệch chuẩn TỔNG THỂ, chia cho n. Calc cả bốn công thức Bollinger chia n−1, và chữ trên màn trình bày n−1 như cách chuẩn, gán cách chia n cho 'bảng giá nào'/'một số bảng giá'. Bảng ký hiệu cạnh hình còn ghi 'Bollinger dùng 20 phiên', 'Bollinger dùng hệ số 2', nên người đọc tin dải n−1 là dải Bollinger gốc và khi đối chiếu bảng giá theo đúng định nghĩa sẽ đổ lỗi cho bảng giá. Lệch đổi số của cả bốn màn: khoảng cách từ đường giữa tới dải lớn hơn √(20/19) ≈ 1,026 lần ở chu kỳ 20. Hai hướng sửa: (1) đổi calc sang chia n cho khớp Bollinger, sửa expression dòng 295/442 và ký hiệu σ dòng 330/477 từ 'mẫu' sang 'tổng thể', tính lại expected của 4 ví dụ và tests; (2) giữ n−1 nhưng nói đúng trên màn rằng Bollinger chia n. Câu sửa dưới đây theo hướng (2).
- **Bằng chứng:** series-utils.ts dòng 113: sampleStdDev chia (values.length − 1); technical-volatility.ts dòng 218: bollingerParts dùng sampleStdDev. Bollinger (bollingerbands.com; Wikipedia 'Bollinger Bands' trích lại): 'Bollinger Bands use the population method of calculating standard deviation, thus the proper divisor for the sigma calculation is n, not n − 1.' Tính độc lập trên ví dụ FPT 20 phiên, k = 2 — chia n−1 (màn hiện tại, khớp engine): σ 1.714,15 ₫; dải trên 74.988,30 ₫; dải dưới 68.131,70 ₫; độ rộng 9,5816%; %B 66,6263%. Chia n (định nghĩa Bollinger): σ 1.670,75 ₫; dải trên 74.901,50 ₫; dải dưới 68.218,50 ₫; độ rộng 9,3390%; %B 67,0582%. Số phiên đóng cửa ngoài dải trên chuỗi FPT như nhau ở hai cách (2/38), nên ghi chú ví dụ của dải trên/dưới không phải sửa.
- **Sửa (vi):** Mô tả ô k: 'Bollinger dùng 2. Bollinger tính độ lệch chuẩn tổng thể (chia cho n), còn công thức ở đây dùng độ lệch chuẩn MẪU (chia cho n−1), nên dải trên màn rộng hơn dải theo đúng định nghĩa của Bollinger một chút: với chu kỳ 20, khoảng cách từ đường giữa tới mỗi dải lớn hơn khoảng 2,6%.' Câu cuối commonMistakes của dai-bollinger-tren: 'Ngoài ra Bollinger tính độ lệch chuẩn chia cho n, còn ở đây chia cho n−1, nên bảng giá tính đúng theo Bollinger cho dải hẹp hơn dải trên màn này chút ít.'
- **Sửa (en):** k field description: 'Bollinger uses 2. Bollinger computes the population standard deviation (divided by n), while this formula uses the SAMPLE standard deviation (divided by n−1), so the bands on screen sit slightly wider than under Bollinger's own definition: at period 20 the distance from the middle line to each band is about 2.6% larger.' Last sentence of dai-bollinger-tren commonMistakes: 'Also, Bollinger divides by n when computing the standard deviation while this screen divides by n−1, so price tables that follow Bollinger's definition show slightly narrower bands than this one.'

#### `stochastic-k` — Stochastic %K

**D11 · S3 · cảnh báo** — `calc: cảnh báo DIVIDE_BY_ZERO khi biên độ n phiên bằng 0 (gợi ý sửa)` (src/core/formulas/technical-volatility.ts:1294)

- **Trích:** Giá cao nhất đang bằng giá thấp nhất — chuỗi toàn phiên kịch trần hoặc kịch sàn, chọn chu kỳ dài hơn.
- **Vấn đề:** Nguyên nhân nêu ra không khớp điều kiện kích hoạt (dòng 1287: đỉnh cao nhất − đáy thấp nhất của cửa sổ n phiên === 0). Chuỗi phiên kịch trần liên tiếp có giá trần phiên sau cao hơn phiên trước, nên đỉnh n phiên vẫn lớn hơn đáy và công thức ra 100% chứ không báo lỗi. Cảnh báo chỉ bật khi mọi phiên trong cửa sổ khớp ở đúng một mức giá như nhau (giá đứng im), nên người gặp nó sẽ đi tìm một chuỗi kịch trần không tồn tại.
- **Bằng chứng:** Probe stochastic-k, 5 phiên H = L = C kịch trần liên tiếp 20.000 → 21.400 → 22.850 → 24.450 → 26.150 ₫: period 5 → 100%, không cảnh báo. 5 phiên H = L = C cùng 20.000 ₫: period 5 → DIVIDE_BY_ZERO. Ca kiểm 'năm phiên kịch trần' (BARS_KICH_TRAN, dòng 266–272) thực ra là 5 phiên cùng giá 100, không phải chuỗi kịch trần.
- **Sửa (vi):** Giá cao nhất đang bằng giá thấp nhất suốt các phiên đang chọn, tức giá đứng yên ở đúng một mức; chọn chu kỳ dài hơn hoặc nạp chuỗi có giá thay đổi.
- **Sửa (en):** The highest price equals the lowest price across the selected sessions, meaning price stayed at one single level; choose a longer period or load a series in which price moves.

#### `do-bien-dong-lich-su` — Độ biến động lịch sử năm hoá

**D12 · S3 · gây hiểu sai** — `example.note` (src/core/formulas/technical-volatility.ts:1616)

- **Trích:** Chỉ báo này dùng quy ước 252 phiên một năm theo thông lệ quốc tế, khác nhóm rủi ro vốn dùng 250 phiên: chênh lệch nhỏ, nhưng nếu hai màn hình không thống nhất thì cùng một mã sẽ hiện ra hai con số.
- **Vấn đề:** Câu quy chênh lệch giữa hai màn về đúng một nguyên nhân (252 so với 250), nhưng công thức anh em bên nhóm rủi ro (do-bien-dong-nam-hoa) còn dùng lợi suất ĐƠN, còn màn này dùng lợi suất LOG. Trên chính 55 phiên FPT mà cả hai ví dụ dùng, màn này ra số THẤP hơn màn rủi ro, ngược với điều người đọc suy ra từ câu (252 lớn hơn 250 thì số phải cao hơn khoảng 0,4%).
- **Bằng chứng:** Probe cùng FPT_57_PHIEN, 55 phiên cuối: do-bien-dong-lich-su (log) tradingDays 252 → 30,3652%/năm, 250 → 30,2445%/năm; do-bien-dong-nam-hoa (lợi suất đơn, ví dụ nhóm rủi ro) 250 → 30,4376%/năm, 252 → 30,5591%/năm. Tính độc lập khớp cả bốn số. Nếu chỉ khác 252 với 250 thì màn này phải ra 30,5591 (cao hơn màn rủi ro); thực tế 30,3652 (thấp hơn). risk-volatility.ts dòng 427 dùng simpleReturns; technical-volatility.ts dòng 1692 dùng Math.log.
- **Sửa (vi):** Chỉ báo này dùng lợi suất log và quy ước 252 phiên một năm theo thông lệ quốc tế, còn công thức Độ biến động năm hoá của nhóm rủi ro dùng lợi suất đơn và 250 phiên: cùng 55 phiên FPT này, màn kia ra 30,44%/năm còn màn này ra 30,37%/năm. Chênh lệch nhỏ, nhưng hai màn không cùng quy ước thì cùng một mã sẽ hiện ra hai con số. (Giữ nguyên câu Black-Scholes phía sau.)
- **Sửa (en):** This indicator uses log returns and the international convention of 252 sessions per year, while the Annualized volatility formula in the risk group uses simple returns and 250 sessions: on these same 55 FPT sessions that screen shows 30.44%/year and this one 30.37%/year. The gap is small, but when two screens follow different conventions the same stock shows two different numbers. (Keep the Black-Scholes sentence that follows.)

**D13 · S3 · ví dụ** — `example.title + example.inputs.sample so với variables.sample.description` (src/core/formulas/technical-volatility.ts:1612)

- **Trích:** Độ biến động năm hoá của FPT, lấy mẫu 55 phiên cuối trong chuỗi 24/06–15/09/2026 | (mô tả ô Số phiên giá lấy mẫu) Giáo trình khuyên lấy ít nhất 60 phiên
- **Vấn đề:** Ví dụ lấy mẫu 55 phiên, dưới mức 'ít nhất 60 phiên' mà mô tả ô Số phiên giá lấy mẫu trên cùng màn khuyên (và dưới mặc định 60 của chính ô đó), mà khối Ví dụ không nói gì. Lý do là chuỗi FPT chỉ có 57 phiên. Người mới sẽ coi 55 phiên là mẫu đủ chuẩn, trong khi con số còn nhạy với cách chọn mẫu. Title khớp đúng inputs và chuỗi (55 phiên cuối của 57 phiên tới 15/09), lỗi là ví dụ đi ngược khuyến nghị của chính màn mà không nói ra.
- **Bằng chứng:** Probe do-bien-dong-lich-su trên FPT_57_PHIEN: sample 55 → 30,3652%/năm (ví dụ); sample 57 → 29,8206%/năm; sample 60 (mặc định) → MISSING_SERIES 'Cần ít nhất 60 phiên giá, hiện mới có 57.' Mô tả ô dòng 1568; defaultValue 60 dòng 1562.
- **Sửa (vi):** Thêm vào note, sau câu về quy ước số phiên: 'Mẫu 55 phiên ở đây ngắn hơn mức 60 phiên mà ô Số phiên giá lấy mẫu khuyên, vì chuỗi FPT chỉ có 57 phiên; lấy đủ 57 phiên thì con số là 29,82%/năm.'
- **Sửa (en):** Add to the note, after the sentence on the sessions-per-year convention: 'The 55-session sample here is shorter than the 60 sessions the Sample sessions field recommends, because the FPT series has only 57 sessions; using all 57 sessions gives 29.82%/year.'

**D14 · S3 · toán** — `variables.sample.description so với symbols N` (src/core/formulas/technical-volatility.ts:1568)

- **Trích:** N phiên giá cho N−1 lợi suất. | (bảng ký hiệu, dòng 1534) N: số phiên giao dịch một năm, thông lệ 252
- **Vấn đề:** Cùng một màn dùng chữ N cho hai đại lượng: bảng ký hiệu cạnh hình định nghĩa N là số phiên giao dịch một năm (nằm trong √N của hình), còn mô tả ô Số phiên giá lấy mẫu dùng N cho độ dài mẫu. Ghép hai chỗ, người đọc dễ quy năm bằng căn của số phiên lấy mẫu (√55) thay vì √252, đúng loại sai lầm quy năm mà 'Sai lầm thường gặp' cảnh báo.
- **Bằng chứng:** Latex dòng 1483 '\sqrt{N}'; bảng ký hiệu N dòng 1534; mô tả ô sample dòng 1568; calc dòng 1696 nhân Math.sqrt(days) với days = tradingDays chứ không phải sample. Tính tay: nhân nhầm √55 thay √252 trên ví dụ cho 30,3652 × √(55/252) ≈ 14,19%/năm thay vì 30,37%/năm.
- **Sửa (vi):** Số phiên giá luôn nhiều hơn số lợi suất một phiên, ví dụ 55 phiên giá cho 54 lợi suất. Giáo trình khuyên lấy ít nhất 60 phiên; dưới 20 phiên con số nhảy rất mạnh theo vài phiên cá biệt.
- **Sửa (en):** The number of price sessions is always one more than the number of returns, for example 55 price sessions give 54 returns. Textbooks recommend at least 60 sessions; below 20 sessions the number swings wildly based on a handful of outlier sessions.

### `risk-ratios.ts`

#### `ty-so-treynor` — Tỷ số Treynor

**E1 · S1 · ví dụ** — `example.title / example.inputs.beta / example.note / example.source` (src/core/formulas/risk-ratios.ts:966)

- **Trích:** title (dòng 959): 'VN-Index 71 phiên tới 15/09/2026, beta 0,9043 và lãi suất phi rủi ro 4,57%/năm' · note (dòng 966): 'Beta ở đây là mức hồi quy được của FPT theo VN-Index, tính ngoài app vì chuỗi FPT chưa đủ 60 phiên. Con số âm vì lợi suất giai đoạn này thấp hơn lãi suất phi rủi ro: mỗi đơn vị rủi ro hệ thống đang lỗ chứ không sinh lời.' · source (dòng 970): '...; beta FPT theo VN-Index, 55 phiên 24/06/2026 → 11/09/2026.'
- **Vấn đề:** Tỷ số Treynor (r̄_p − r_f) × m ÷ β_p đòi tử số và beta của CÙNG một danh mục. Ví dụ lấy lợi suất của VN-Index (series = VNINDEX_71_PHIEN) làm tử số nhưng chia cho beta của FPT, nên −7,6147 %/năm không phải Treynor của danh mục nào. Của VN-Index thì beta đúng bằng 1 (ví dụ của chính công thức Beta ra 1), tỷ số là −6,886. Còn nếu đọc beta là của FPT như note dẫn dắt thì trên đúng cửa sổ ước lượng beta, FPT vượt lãi suất phi rủi ro khoảng +12,3%/năm, Treynor khoảng +13,6: NGƯỢC DẤU với câu 'mỗi đơn vị rủi ro hệ thống đang lỗ'. Thêm hai mâu thuẫn trên cùng màn: beta ước lượng trên 55 phiên, dưới mức 'mỗi chuỗi tối thiểu 60 phiên' mà mô tả ô beta của màn này đòi (dòng 933) và đúng sai lầm 'lấy beta của vài chục phiên' mà công thức Beta cảnh báo; nếu hiểu là FPT thì đó là danh mục một mã, đúng ca 'Dùng Treynor cho một danh mục chỉ có vài mã' ở commonMistakes của Treynor.
- **Bằng chứng:** Bản tính độc lập (probes/E/indep.mjs): beta FPT theo VN-Index, 55 giá 24/06→11/09 khớp ngày (54 cặp lợi suất) = 0,9043, tức source ghi đúng gốc con số (cửa sổ 57 phiên cho 0,8892). Probe T0 (ví dụ) = −7,614744654651788; probe T1 (beta 1) = −6,886013591201612 (= extras.excessReturn); probe T2 beta VN-Index theo chính nó 71 phiên = 1. FPT 24/06→11/09: lợi suất bình quân 0,06707%/phiên, lãi phi rủi ro phiên (1,0457)^(1/250) − 1 = 0,017876% → vượt × 250 = +12,30%/năm → ÷ 0,9043 = +13,60 (tính tay; app không chạy được vì FPT dưới 60 phiên). calc: risk-ratios.ts dòng 1051–1053.
- **Sửa (vi):** Đổi ví dụ cho nhất quán: inputs.beta = 1, expected = −6,886. title: 'VN-Index 71 phiên tới 15/09/2026, beta 1 và lãi suất phi rủi ro 4,57%/năm'. note: 'Danh mục ở đây là chính VN-Index nên beta đúng bằng 1, như ví dụ của công thức Beta, và tỷ số trùng với lợi suất vượt lãi suất phi rủi ro quy năm. Con số âm vì lợi suất giai đoạn này thấp hơn lãi suất phi rủi ro: mỗi đơn vị rủi ro hệ thống đang lỗ chứ không sinh lời. Tử số và beta phải của cùng một danh mục, nên không ghép beta của FPT vào chuỗi VN-Index được.' source: bỏ vế '; beta FPT theo VN-Index, 55 phiên 24/06/2026 → 11/09/2026'.
- **Sửa (en):** Make the example consistent: inputs.beta = 1, expected = −6.886. title: 'The VN-Index over 71 sessions to 2026-09-15, beta 1 and risk-free rate 4.57%/year'. note: 'The portfolio here is the VN-Index itself, so its beta is exactly 1, as in the Beta formula's example, and the ratio equals the annualized return above the risk-free rate. The figure is negative because the return over this period trailed the risk-free rate: each unit of systematic risk lost money rather than earning any. The numerator and the beta must belong to the same portfolio, so FPT's beta cannot be paired with the VN-Index series.' source: drop '; FPT beta against the VN-Index over 55 sessions 2026-06-24 → 2026-09-11'.

**E6 · S3 · gây hiểu sai** — `variables.beta.description` (src/core/formulas/risk-ratios.ts:933)

- **Trích:** Beta 1 nghĩa là biến động ngang thị trường.
- **Vấn đề:** Cùng gốc với phát hiện howToRead của beta: beta 1 nghĩa là lên xuống theo nhịp thị trường, không phải có độ biến động bằng thị trường. Một danh mục beta 1 mà tương quan với VN-Index dưới 1 thì độ biến động lớn hơn thị trường; ngay FPT beta 0,90 đã dao động 30,42%/năm so với 18,45%/năm của VN-Index.
- **Bằng chứng:** Probe V1/V2; bản tính độc lập beta 0,9043, tương quan 0,5485, cửa sổ 24/06→11/09.
- **Sửa (vi):** Thay câu cuối bằng: 'Beta 1 nghĩa là danh mục thường lên xuống đúng theo nhịp thị trường.'
- **Sửa (en):** Replace the last sentence with: 'A beta of 1 means the portfolio tends to move in step with the market.'

#### `ty-so-thong-tin` — Tỷ số thông tin

**E2 · S2 · ví dụ** — `example.title / example.note` (src/core/formulas/risk-ratios.ts:1173)

- **Trích:** title (dòng 1166): 'VN-Index 71 phiên tới 15/09/2026 so với chuẩn gửi tiết kiệm 6,8%/năm' · note (dòng 1173): 'Chỉ số gần như đi ngang nên phần vượt chuẩn là số âm: nắm theo thị trường giai đoạn này còn thua một sổ tiết kiệm 12 tháng. Nhớ rằng chuẩn nhập bằng một con số cả năm, nên mẫu số là độ lệch chuẩn lợi suất của chính danh mục chứ không phải sai số bám chuẩn từng phiên.'
- **Vấn đề:** Chuẩn của ví dụ là lãi tiết kiệm, một mức lãi cố định kiểu phi rủi ro, nên calc ra ĐÚNG tỷ số Sharpe của cùng chuỗi với lãi suất phi rủi ro 6,8%/năm. Ví dụ phạm đúng điều commonMistakes của chính nó dặn (dòng 1156: 'Sharpe so với lãi suất phi rủi ro, tỷ số thông tin so với chuẩn thị trường'), trái với mô tả ô nhập (dòng 1135: 'Mức tăng cả năm của chuẩn dùng để so, ví dụ VN-Index') và whenToUse ('so với VN-Index'). Người mới học từ ví dụ này sẽ lấy lãi tiết kiệm làm chuẩn cho tỷ số thông tin, tức đang tính lại Sharpe. Câu thứ hai của note còn sai riêng cho ví dụ này: chuẩn là lãi cố định thì phần chuẩn không dao động, sai số bám chuẩn từng phiên ĐÚNG BẰNG độ lệch chuẩn lợi suất của danh mục, nên vế 'chứ không phải sai số bám chuẩn từng phiên' nói ngược.
- **Bằng chứng:** Probe I0 (ví dụ) = −0,5031012766587957; probe I1 ty-so-sharpe cùng chuỗi VNINDEX_71_PHIEN, riskFree 6,8 = −0,5031012766587957, trùng tới chữ số cuối. calc risk-ratios.ts dòng 1230–1235 là đúng biểu thức Sharpe dòng 651–656, chỉ thay perSessionRate(riskFree) bằng perSessionRate(benchmarkReturn). Với c hằng số, độ lệch chuẩn của (r_p − c) bằng độ lệch chuẩn của r_p.
- **Sửa (vi):** title: 'VN-Index 71 phiên tới 15/09/2026 so với lãi tiết kiệm cố định 6,8%/năm'. note: 'Chuẩn ở đây là lãi tiết kiệm, một mức lãi cố định chứ không phải một chỉ số, nên con số trùng đúng tỷ số Sharpe của cùng chuỗi với lãi suất phi rủi ro 6,8%/năm: ví dụ chỉ minh hoạ phép tính, còn cách dùng đúng của tỷ số thông tin là so với một chuẩn thị trường như VN-Index. Phần vượt chuẩn âm vì chỉ số gần như đi ngang: nắm theo thị trường giai đoạn này còn thua một sổ tiết kiệm 12 tháng.' (Hoặc chủ dự án thay bằng một chuẩn thị trường có số liệu thật.)
- **Sửa (en):** title: 'The VN-Index over 71 sessions to 2026-09-15 against a fixed 6.8%/year savings rate'. note: 'The benchmark here is a savings rate, a fixed rate rather than an index, so the figure equals the Sharpe ratio of the same series at a 6.8%/year risk-free rate: the example only illustrates the arithmetic, while the information ratio is meant to be measured against a market benchmark such as the VN-Index. The return above the benchmark is negative because the index barely moved: holding the market over this stretch trailed a 12-month savings deposit.'

**E3 · S3 · toán** — `note / explanation.howToRead` (src/core/formulas/risk-ratios.ts:1161)

- **Trích:** note (dòng 1161): 'Bản rút gọn: chuẩn so sánh nhập bằng MỘT con số %/năm thay vì cả chuỗi, nên sai số theo dõi ở mẫu số chính là độ lệch chuẩn lợi suất của danh mục. ...' · howToRead (dòng 1152): 'Hãy so với mốc 0 và với chính danh mục ở kỳ trước, nhập theo cùng một cách.'
- **Vấn đề:** Đầu mối 'danh mục = chuẩn'. Màn chỉ công bố lối tắt ở MẪU SỐ; lối tắt ở TỬ SỐ thì không nói. Tử số lấy bình quân CỘNG lợi suất phiên của danh mục trừ mức chuẩn năm quy về phiên theo LÃI KÉP, tức coi chuẩn tăng đều không dao động. Chuẩn thật như VN-Index có dao động nên bình quân cộng lợi suất phiên của nó cao hơn mức lãi kép khoảng σ²/2 mỗi phiên; mọi danh mục vì thế được cộng sẵn một phần 'thắng chuẩn' ảo. Danh mục đi y hệt chuẩn (sai số theo dõi thật bằng 0, tỷ số đúng nghĩa không xác định) vẫn ra số DƯƠNG, và howToRead dặn so với mốc 0, nên người đọc kết luận quỹ bám chỉ số đã thắng chỉ số.
- **Bằng chứng:** Probe I2: chuỗi VNINDEX_71_PHIEN, benchmarkReturn = −3,9212620547 (lợi suất năm hoá kép của chính chuỗi, lấy từ extras.annualisedReturn của ty-so-calmar) → +0,0885 (trackingError vẫn báo 17,88%/năm). Probe I4: chuỗi dựng từ lợi suất VN-Index × 1,7 (độ biến động 30,40%/năm, probe I5), chuẩn = lợi suất năm hoá kép của chính nó −8,3324%/năm → +0,151. Bản tính độc lập: bình quân cộng −0,009668%/phiên so với mức lãi kép −0,016000%/phiên, chênh 0,006332%/phiên × 250 = 1,58%/năm ≈ σ²/2 × 250 = 1,60%/năm. Grinold & Kahn: lợi suất chủ động là bình quân của (r_p − r_b) từng kỳ, danh mục trùng chuẩn thì bằng 0. calc dòng 1234.
- **Sửa (vi):** Thêm vào cuối note: 'Chuẩn nhập dạng một con số năm được coi như tăng đều từng phiên, còn lợi suất danh mục là bình quân cộng của những phiên có dao động, nên một danh mục đi y hệt chuẩn vẫn ra tỷ số hơi dương chứ không bằng 0: chuỗi VN-Index 71 phiên tới 15/09/2026 so với chính lợi suất năm hoá kép −3,92%/năm của nó ra khoảng +0,09.' Và ở howToRead, ngay sau câu 'Hãy so với mốc 0…': 'Số dương nhỏ chưa chắc là thắng chuẩn, vì danh mục đi y hệt chuẩn cũng ra số hơi dương.'
- **Sửa (en):** Append to note: 'A benchmark entered as one annual figure is treated as growing smoothly every session, while the portfolio return is the arithmetic average of sessions that swing, so a portfolio that tracks the benchmark exactly still shows a slightly positive ratio instead of 0: the VN-Index series of 71 sessions to 2026-09-15 measured against its own compounded annual return of −3.92%/year gives about +0.09.' And in howToRead, right after 'Compare it against 0…': 'A small positive value does not necessarily mean the benchmark was beaten, since a portfolio that tracks it exactly also comes out slightly positive.'

#### `beta` — Beta — hệ số rủi ro hệ thống

**E4 · S2 · gây hiểu sai** — `explanation.howToRead` (src/core/formulas/risk-ratios.ts:381)

- **Trích:** Beta trên 1 là biến động mạnh hơn thị trường, giữa 0 và 1 là yếu hơn
- **Vấn đề:** Beta = hệ số tương quan × σ cổ phiếu ÷ σ thị trường: nó đo phần biến động ĐI CÙNG thị trường (độ nhạy), không đo tổng mức dao động. Câu này dạy người mới một kết luận cụ thể: cổ phiếu beta dưới 1 dao động ít hơn VN-Index. Số liệu của chính thư viện bác kết luận đó: FPT có beta 0,9043 (con số màn Treynor dùng, đã kiểm lại) nhưng trên cùng cửa sổ, độ biến động năm hoá của FPT là 30,42%/năm so với 18,45%/năm của VN-Index, tức dao động mạnh gấp 1,65 lần. Ai dựa vào câu này để chọn mã 'ít dao động' hay đặt cỡ lệnh sẽ đánh giá thấp rủi ro. Màn Treynor phân biệt đúng ('Treynor chỉ chia cho phần biến động đi cùng thị trường'), nên hai màn đang nói hai ý khác nhau về beta.
- **Bằng chứng:** Probe V1: do-bien-dong-nam-hoa, FPT_57_PHIEN cắt [0,55] (24/06→11/09), sessions 55, tradingDays 250 → 30,423465654444716 %/năm. Probe V2: VNINDEX_71_PHIEN cắt [14,69] (cùng 24/06→11/09) → 18,45442663418118 %/năm. Bản tính độc lập cùng cửa sổ: beta 0,9043, hệ số tương quan 0,5485 (0,5485 × 30,42 ÷ 18,45 = 0,904). Nguồn: giáo trình CFA Institute (beta đo rủi ro HỆ THỐNG, không phải tổng rủi ro); Damodaran phân biệt beta với độ lệch chuẩn.
- **Sửa (vi):** Beta đo mức cổ phiếu nhạy theo nhịp VN-Index chứ không đo tổng mức dao động: trên 1 là cổ phiếu thường khuếch đại nhịp lên xuống của thị trường, giữa 0 và 1 là theo nhịp nhưng ít hơn, vùng của các ngành phòng thủ như điện, nước hay hàng thiết yếu: VN-Index giảm 10% thì một cổ phiếu beta 0,5 thường giảm khoảng 5%, chỉ giảm ít hơn chứ không đi ngược. Beta dưới 1 chưa chắc là cổ phiếu ít dao động, vì phần biến động riêng của doanh nghiệp không nằm trong beta; muốn biết tổng mức dao động thì xem độ biến động năm hoá. Beta âm, tức cổ phiếu tăng khi thị trường giảm, rất hiếm; gặp beta âm trên một cửa sổ ngắn thì hãy kéo dài cửa sổ trước khi tin.
- **Sửa (en):** Beta measures how sensitive a stock is to the VN-Index's moves, not how much it swings in total: above 1, the stock tends to amplify the market's ups and downs; between 0 and 1, it moves with the market but less, which is where defensive sectors such as utilities and staples sit: if the VN-Index drops 10%, a beta-0.5 stock typically drops about 5%, it simply drops less rather than moving the other way. A beta below 1 does not mean a calm stock, because company-specific swings are not captured by beta; to gauge the total swing, look at annualized volatility. A negative beta, where the stock rises as the market falls, is genuinely rare; if a short window produces one, extend the window before trusting it.

**E5 · S3 · gây hiểu sai** — `description / symbols[\beta_i].meaning` (src/core/formulas/risk-ratios.ts:307)

- **Trích:** description (dòng 307): 'Mức một cổ phiếu biến động mạnh hay yếu hơn thị trường chung, đo bằng VN-Index.' · ký hiệu β_i (dòng 319): 'hệ số beta của cổ phiếu i, đo biên độ so với thị trường, lần'
- **Vấn đề:** Cùng gốc với phát hiện howToRead của beta: thẻ công thức và bảng ký hiệu gọi beta là thước đo biên độ/mức biến động mạnh hay yếu so với thị trường, trong khi beta chỉ đo độ nhạy theo nhịp thị trường. FPT beta 0,9043 nhưng dao động 30,42%/năm so với 18,45%/năm của VN-Index cùng cửa sổ.
- **Bằng chứng:** Probe V1/V2 và bản tính độc lập như phát hiện howToRead của beta (beta 0,9043, tương quan 0,5485).
- **Sửa (vi):** description: 'Mức một cổ phiếu nhạy theo nhịp lên xuống của thị trường chung, đo bằng VN-Index.' · β_i: 'hệ số beta của cổ phiếu i, đo độ nhạy theo nhịp thị trường, lần'
- **Sửa (en):** description: 'How strongly a stock tends to move with the broader market's ups and downs, measured against the VN-Index.' · β_i: 'beta of stock i, its sensitivity to market moves, times'

#### `ty-so-sharpe` — Tỷ số Sharpe

**E7 · S3 · ví dụ** — `example.source (cùng lỗi ở ty-so-sortino dòng 783, ty-so-treynor dòng 970) so với variables.riskFree.description (dòng 126)` (src/core/formulas/risk-ratios.ts:593)

- **Trích:** ô nhập (dòng 126): 'Mức sinh lời coi như chắc chắn, thường lấy lợi suất trái phiếu chính phủ kỳ hạn 1 năm.' · source (dòng 593): 'Chuỗi VN-Index 71 phiên 04/06/2026 → 15/09/2026; lợi suất trái phiếu chính phủ kỳ hạn 10 năm, chốt 15/09/2026.'
- **Vấn đề:** Trên cùng một màn, ô nhập dặn lấy lợi suất trái phiếu chính phủ kỳ hạn 1 năm, còn ví dụ nhập 4,57% là lợi suất kỳ hạn 10 năm. Con số được chép từ ví dụ CAPM (valuation-dcf.ts, nơi ô nhập đúng là 'kỳ hạn 10 năm'), không khớp hướng dẫn của ba màn Sharpe, Sortino, Treynor. Người mới không biết nên theo ô nhập hay theo ví dụ, và hai kỳ hạn cho ra tỷ số khác nhau.
- **Bằng chứng:** risk-ratios.ts dòng 126 (RISK_FREE_VAR dùng chung cho Sharpe, Sortino, Treynor) so với source dòng 593, 783, 970. valuation-dcf.ts dòng 663: 'Thường lấy lợi suất trái phiếu Chính phủ kỳ hạn 10 năm.'; dòng 712: 'FPT — lợi suất TPCP 10 năm 4,57%, beta 0,9043, ...'.
- **Sửa (vi):** Chọn một trong hai: (a) thay 4,57% bằng lợi suất trái phiếu chính phủ kỳ hạn 1 năm chốt 15/09/2026 cho đúng mô tả ô nhập, sửa source và expected theo; hoặc (b) giữ số 10 năm nhưng source nói rõ: 'lợi suất trái phiếu chính phủ kỳ hạn 10 năm, chốt 15/09/2026, cùng số dùng cho CAPM; ô nhập gợi ý kỳ hạn 1 năm'. Áp cho cả source của ty-so-sortino và ty-so-treynor.
- **Sửa (en):** Pick one: (a) replace 4.57% with the 1-year government bond yield as of 2026-09-15 to match the input description, updating source and expected; or (b) keep the 10-year figure but say so in the source: '10-year government bond yield, locked in 2026-09-15, the same figure used for CAPM; the input suggests a 1-year tenor'. Apply to the ty-so-sortino and ty-so-treynor sources as well.

#### `ty-so-sortino` — Tỷ số Sortino

**E8 · S3 · gây hiểu sai** — `explanation.howToRead (và example.note dòng 779)` (src/core/formulas/risk-ratios.ts:762)

- **Trích:** howToRead: 'nhưng khi lợi suất tụt dưới ngưỡng thì chính mẫu số nhỏ ấy kéo tỷ số xuống THẤP hơn Sharpe.' · note (dòng 779): 'Mẫu số chỉ đếm các phiên rơi dưới ngưỡng nên nhỏ hơn độ lệch chuẩn toàn phần.'
- **Vấn đề:** Câu khẳng định không điều kiện: cứ lợi suất dưới ngưỡng là mẫu số Sortino nhỏ hơn độ lệch chuẩn và Sortino thấp hơn Sharpe. Sai khi chuỗi rất ít dao động mà thua ngưỡng rõ rệt (quỹ trái phiếu, quỹ tiền tệ, danh mục hưu trí mà whenToUse nhắc tới): mẫu số đo khoảng cách tới NGƯỠNG chứ không tới bình quân, nên lớn hơn độ lệch chuẩn và Sortino lại CAO hơn Sharpe. Note của ví dụ dùng cùng suy luận 'nên nhỏ hơn' như một hệ quả tất yếu, dù chỉ đúng với chuỗi VN-Index này (13,62 so với 17,88%/năm).
- **Bằng chứng:** Probe S5/S6: chuỗi 71 giá, lợi suất xen kẽ +0,0269% và −0,0111% mỗi phiên (lãi khoảng 2%/năm, độ biến động 0,30%/năm theo probe S7), rf 4,5%, 250 phiên: Sharpe −8,021125415831424, Sortino −7,561724320331609, tức Sortino CAO hơn Sharpe dù lợi suất dưới ngưỡng. Ví dụ màn (S3/S4): Sharpe −0,3851, Sortino −0,5055, đúng chiều câu vì chuỗi dao động mạnh.
- **Sửa (vi):** howToRead, thay vế cuối: 'nhưng khi lợi suất tụt dưới ngưỡng thì mẫu số ấy thường vẫn nhỏ hơn độ lệch chuẩn nên kéo tỷ số xuống THẤP hơn Sharpe; riêng chuỗi rất ít dao động mà vẫn thua ngưỡng rõ rệt thì mẫu số lớn hơn độ lệch chuẩn và Sortino lại cao hơn Sharpe.' · note, câu đầu: 'Ở chuỗi này mẫu số chỉ đếm các phiên rơi dưới ngưỡng nên nhỏ hơn độ lệch chuẩn toàn phần.'
- **Sửa (en):** howToRead, replace the last clause: 'but once the return drops below the threshold, that denominator is usually still smaller than the standard deviation and drags the ratio LOWER than Sharpe; only a very smooth series that clearly trails the threshold has a denominator larger than the standard deviation, and there Sortino sits above Sharpe.' · note, first sentence: 'In this series the denominator counts only sessions falling below the threshold, so it is smaller than the full standard deviation.'

### `risk-volatility.ts`

#### `do-lech-chuan-loi-suat-phien` — Độ lệch chuẩn lợi suất theo phiên

**E9 · S3 · câu sai** — `example.note` (src/core/formulas/risk-volatility.ts:224)

- **Trích:** Theo quy tắc kinh nghiệm, khoảng 68% số phiên có lợi suất nằm trong ±1 độ lệch chuẩn quanh mức bình quân. Đây cũng là con số gốc mà độ biến động năm hoá và các tỷ số đo hiệu quả đều dựng lên từ đó.
- **Vấn đề:** (1) Note bỏ mất điều kiện 'phân phối chuẩn' mà howToRead của chính màn còn giữ, rồi đặt con số 68% cạnh ví dụ FPT: chuỗi thật của ví dụ có 76% số lợi suất nằm trong ±1 độ lệch chuẩn, lệch 8 điểm phần trăm (vượt ngưỡng làm tròn). (2) 'các tỷ số đo hiệu quả đều dựng lên từ đó' sai trong chính thư viện: Sortino dùng độ lệch chuẩn phần giảm, Treynor dùng beta, Calmar dùng mức sụt giảm sâu nhất, tỷ số thắng/thua dùng mức lãi/lỗ bình quân; chỉ Sharpe và tỷ số thông tin chia cho độ lệch chuẩn này.
- **Bằng chứng:** Bản tính độc lập (probes/E/check3.mjs), cửa sổ 55 giá 26/06→15/09 như example.inputs: 54 lợi suất, bình quân 0,06709%, độ lệch chuẩn 1,9250% (khớp engine 1,9250445), 41/54 = 75,9% nằm trong bình quân ±1σ (dùng ≤ hay < đều 41); có phiên +6,855% (03/08) lệch hơn 3σ. calc risk-ratios.ts: Sortino dòng 835 downsideDeviation, Treynor dòng 1053 chia beta, Calmar dòng 1365 maxDrawdown, thắng/thua dòng 1581.
- **Sửa (vi):** Với phân phối chuẩn, khoảng 68% số phiên nằm trong ±1 độ lệch chuẩn quanh mức bình quân; chuỗi FPT thật không theo đúng phân phối chuẩn: 41 trên 54 lợi suất, khoảng 76%, nằm trong khoảng ấy. Đây cũng là con số gốc mà độ biến động năm hoá, tỷ số Sharpe và tỷ số thông tin dựng lên từ đó.
- **Sửa (en):** Under a normal distribution about 68% of sessions fall within ±1 standard deviation of the average; the real FPT series is not normal: 41 of its 54 returns, about 76%, fall within that band. It is also the base figure that annualized volatility, the Sharpe ratio and the information ratio are built on.

#### `do-lech-chuan-ban-phan` — Độ lệch chuẩn bán phần

**E10 · S2 · câu sai** — `example.note (câu đầu)` (src/core/formulas/risk-volatility.ts:549)

- **Trích:** Chỉ những phiên có lợi suất dưới ngưỡng mới được đưa vào, nên kết quả luôn nhỏ hơn độ lệch chuẩn đầy đủ; hai con số càng sát nhau thì rủi ro càng dồn về chiều giảm.
- **Vấn đề:** 'luôn nhỏ hơn' sai, và mâu thuẫn với howToRead ngay trên cùng màn (dòng 532: 'có thể VƯỢT QUA độ lệch chuẩn đầy đủ'). Mẫu số đo khoảng cách tới NGƯỠNG: nâng ngưỡng (ô nhập cho tới 5%) hoặc gặp chuỗi có lợi suất bình quân âm thì kết quả lớn hơn độ lệch chuẩn. Chỉ bảo đảm nhỏ hơn khi ngưỡng 0% và lợi suất bình quân không âm, đúng trường hợp của ví dụ. Người đổi ngưỡng trên chính chuỗi ví dụ sẽ thấy số vượt độ lệch chuẩn và tưởng máy tính sai.
- **Bằng chứng:** Probe D2/D5 (chuỗi ví dụ FPT, 55 phiên): ngưỡng 0% → 1,1988700753893542 so với σ 1,9250445296734988. Probe D3 ngưỡng 1% → 1,841218451395159; probe D4 ngưỡng 2% → 2,627662150763203, lớn hơn σ. Probe D6/D7: chuỗi 56 giá giảm đều xen kẽ −0,3%/−0,7%, ngưỡng 0% → 0,5400617248673227 so với σ 0,20180999164380614. Chứng minh ngưỡng 0: với r < 0 và bình quân ≥ 0 thì r² ≤ (r − bình quân)², nên kết quả ≤ σ; bình quân âm thì hết bảo đảm.
- **Sửa (vi):** Chỉ những phiên có lợi suất dưới ngưỡng mới được đưa vào; với ngưỡng 0% và lợi suất bình quân dương như chuỗi này, kết quả nhỏ hơn độ lệch chuẩn đầy đủ (1,20% so với 1,93% mỗi phiên), còn nâng ngưỡng lên thì có thể vượt qua; hai con số càng sát nhau thì rủi ro càng dồn về chiều giảm.
- **Sửa (en):** Only sessions with a return below the threshold are counted; with a 0% threshold and a positive average return, as in this series, the result is smaller than the full standard deviation (1.20% versus 1.93% per session), while a higher threshold can push it above; the closer the two figures sit, the more the risk leans to the downside.

**E11 · S3 · toán** — `example.note (câu cuối); cùng ý ở explanation.whenToUse dòng 528` (src/core/formulas/risk-volatility.ts:549)

- **Trích:** Đây cũng là mẫu số của tỷ số Sortino.
- **Vấn đề:** Đầu mối 'Sortino chia n hay n − 1'. Công thức này chia cho n − 1 (hình, bảng ký hiệu, calc đều ghi; đúng target semideviation của CFA), còn tỷ số Sortino của cùng thư viện chia cho n (hình Sortino ghi 1/n; risk-ratios.ts dòng 192) và lấy ngưỡng là lãi suất phi rủi ro một phiên chứ không phải 0% như ví dụ này. Người làm theo whenToUse ('khi cần mẫu số cho tỷ số Sortino') và note sẽ không ra đúng mẫu số mà màn Sortino dùng: dù đặt ngưỡng đúng bằng lãi phi rủi ro một phiên, hai con số vẫn lệch √(n ÷ (n − 1)).
- **Bằng chứng:** Probe D1: do-lech-chuan-ban-phan trên VNINDEX_71_PHIEN, sessions 71, ngưỡng 0,0178762% (= (1,0457)^(1/250) − 1) → 0,8677518061563956 %/phiên. Sortino ví dụ cùng chuỗi: extras.downsideDeviation 13,622005647251486 %/năm ÷ √250 = 0,86153 %/phiên. Tỷ số 1,00722 = √(70/69). risk-volatility.ts dòng 602 (÷ (n − 1)) so với risk-ratios.ts dòng 192 (÷ n).
- **Sửa (vi):** Thay câu cuối bằng: 'Cùng ý với mẫu số của tỷ số Sortino, nhưng tỷ số Sortino trong thư viện chia cho tổng số lợi suất n thay vì n − 1 và lấy ngưỡng là lãi suất phi rủi ro một phiên, nên hai con số lệch nhau đôi chút.' (Hoặc thống nhất một quy ước chia cho hai calc.)
- **Sửa (en):** Replace the last sentence with: 'It is the same idea as the Sortino ratio's denominator, but this library's Sortino ratio divides by the total number of returns n rather than n − 1 and uses the per-session risk-free rate as its threshold, so the two figures differ slightly.' (Or unify the divisor across the two calcs.)

#### `bien-do-dao-dong-lon-nhat` — Biên độ dao động lớn nhất trong kỳ

**E14 · S3 · cảnh báo** — `cảnh báo MISSING_SERIES từ windowCloses (áp chung 6 công thức của risk-volatility.ts: do-lech-chuan-loi-suat-phien, do-bien-dong-nam-hoa, do-lech-chuan-ban-phan, he-so-bien-thien, bien-do-dao-dong-lon-nhat, chuoi-phien-giam-dai-nhat)` (src/core/formulas/risk-volatility.ts:53)

- **Trích:** cảnh báo: 'Cần ít nhất 60 phiên giá, hiện mới có 57.' + gợi ý 'Nạp bộ số liệu mẫu hoặc dán chuỗi giá từ Excel.' · mô tả ô nhập (dòng 820): 'Lấy bao nhiêu phiên gần nhất để tìm đỉnh và đáy. Tối thiểu 10 phiên.'
- **Vấn đề:** windowCloses() đòi số phiên ≥ CỬA SỔ đang chọn chứ không phải ≥ sàn của công thức, nên chuỗi đủ sàn nhưng ngắn hơn thanh trượt bị báo 'Cần ít nhất 60 phiên' trong khi ô nhập ghi tối thiểu 10 (hay 30) phiên, và gợi ý bảo nạp thêm dữ liệu thay vì kéo thanh trượt xuống. Xảy ra đúng với chuỗi FPT 57 phiên của ví dụ: để mặc định 60 hoặc kéo quá 57 là ra cảnh báo, dù chuỗi thừa sức tính. Nhóm sụt giảm cùng chuỗi thì tính bình thường trên số phiên đang có. Beta có cùng khuôn (requireCloses(ctx, sessions), risk-ratios.ts dòng 459): cửa sổ 72 trên chuỗi 71 báo 'Cần ít nhất 72 phiên' dù sàn là 60.
- **Bằng chứng:** Dump defaults.engineWithExampleSeries của cả 6 công thức risk-volatility.ts (sessions mặc định 60, chuỗi FPT_57_PHIEN): MISSING_SERIES 'Cần ít nhất 60 phiên giá, hiện mới có 57.', trong khi với sessions 55 cùng chuỗi đều ra số (ví dụ bien-do 19,7749%). sut-giam-sau-nhat lookback mặc định 250 trên cùng chuỗi → 15,0273%, extras.barsUsed 57. Code: risk-volatility.ts dòng 53–57 so với risk-drawdown.ts dòng 66–70; warnings.ts dòng 76–89 (câu gợi ý cố định).
- **Sửa (vi):** Hoặc (a) như nhóm sụt giảm: chỉ đòi đủ sàn của công thức rồi tính trên min(cửa sổ, số phiên đang có) và trả số phiên đã dùng; hoặc (b) khi chuỗi đủ sàn mà ngắn hơn cửa sổ thì báo đúng nguyên nhân: 'Cửa sổ đang chọn dài hơn chuỗi giá hiện có ({n} phiên).' kèm gợi ý 'Kéo ô số phiên xuống bằng hoặc dưới {n} phiên, hoặc nạp chuỗi giá dài hơn.'
- **Sửa (en):** Either (a) follow the drawdown group: require only the formula's floor, compute on min(window, sessions available) and report the sessions used; or (b) when the series clears the floor but is shorter than the chosen window, state the real cause: 'The selected window is longer than the price series on hand ({n} sessions).' with the suggestion 'Lower the session slider to {n} or fewer, or load a longer price series.'

### `risk-drawdown.ts`

#### `sut-giam-sau-nhat` — Mức sụt giảm sâu nhất

**E12 · S3 · ví dụ** — `example.title` (src/core/formulas/risk-drawdown.ts:370)

- **Trích:** Mua đúng đỉnh FPT trong 55 phiên tính tới 15/09/2026 thì lỗ sâu nhất tới đâu
- **Vấn đề:** Đỉnh của 55 phiên là 74.500 ₫ (10/09); mua đúng đỉnh ấy thì giá đóng cửa thấp nhất sau đó là 72.400 ₫, lỗ sâu nhất 2,82%, không phải 15,03%. Con số 15,03% đo từ đỉnh chạy 73.200 ₫ (07/07) xuống 62.200 ₫ (27/07), đúng như note tả, tức đỉnh XẤU NHẤT chứ không phải đỉnh của cả kỳ. Màn sut-giam-hien-tai kế bên dùng chính cụm 'đỉnh của 55 phiên gần nhất' để chỉ 74.500 ₫, nên hai tiêu đề gọi hai đỉnh khác nhau bằng một tên.
- **Bằng chứng:** Bản tính độc lập (probes/E/indep.mjs), cửa sổ 55 giá 26/06→15/09: MDD 15,0273% từ 73.200 (07/07) xuống 62.200 (27/07); giá cao nhất cửa sổ 74.500 (10/09), đáy sau đó 72.400 → 2,8188%. Probe M3 = 15,027322404371585; probe M4 sut-giam-hien-tai extras.peak = 74500.
- **Sửa (vi):** Nếu mua FPT đúng đỉnh xấu nhất trong 55 phiên tính tới 15/09/2026 thì lỗ sâu nhất tới đâu
- **Sửa (en):** How deep the loss runs if you bought FPT at the worst-timed peak within the 55 sessions through 2026-09-15

#### `sut-giam-hien-tai` — Mức sụt giảm hiện tại

**E13 · S3 · câu sai** — `explanation.commonMistakes` (src/core/formulas/risk-drawdown.ts:494)

- **Trích:** còn sụt giảm sâu nhất thì đã ghi vào lịch sử và không bao giờ giảm.
- **Vấn đề:** Cả hai công thức tính trên cửa sổ TRƯỢT gồm 'Số phiên gần nhất đưa vào tính'. Khi có phiên mới, cửa sổ trượt đi và nhịp rơi cũ rơi ra ngoài, nên mức sụt giảm sâu nhất trên màn có thể giảm mạnh. Đúng ra: nó không giảm khi giá HỒI, nhưng giảm khi cửa sổ trượt qua nhịp rơi cũ.
- **Bằng chứng:** Probe M1: sut-giam-sau-nhat, FPT tới 18/08 (seriesSlice [0,40]), lookback 30 → 13,730929264909847%. Probe M2: FPT tới 15/09, lookback 30 → 4,874651810584958%. Cùng cổ phiếu, cùng cửa sổ 30 phiên, chỉ lùi thời điểm xem 4 tuần. Code risk-drawdown.ts dòng 66–70 (windowOf lấy closes.slice(-size)) và dòng 418.
- **Sửa (vi):** Nhầm sang mức sụt giảm sâu nhất: chỉ số này đo đúng khoảng cách tới đỉnh HIỆN TẠI, giá hồi lên là nó giảm ngay, còn sụt giảm sâu nhất không giảm khi giá hồi; nó chỉ nhỏ lại khi cửa sổ quan sát trượt qua khỏi nhịp rơi cũ.
- **Sửa (en):** Confusing it with maximum drawdown: this indicator measures the distance to the CURRENT peak, so it shrinks the moment price recovers, whereas maximum drawdown does not shrink when price recovers; it only gets smaller once the observation window slides past the old fall.

### `performance.ts`

#### `thoi-gian-nhan-doi` — Thời gian nhân đôi vốn

**F2 · S2 · câu sai** — `explanation.howToRead` (src/core/formulas/performance.ts:1197)

- **Trích:** Kết quả chính là công thức chính xác ln(2) ÷ ln(1 + r); số phụ kèm theo là ước lượng 72 chia lợi suất — hai con số gần nhau ở mức lãi 5–12%.
- **Vấn đề:** Màn chi tiết không hiện 'số phụ' nào. calc có trả extras.rule72 (performance.ts:1270) nhưng không component nào đọc extras: ResultBlock.tsx chỉ in value + đơn vị, DerivedNote chỉ bày chặng breakdown (công thức này không khai), và công thức không có thân riêng (DetailBody.tsx:28 chỉ gồm loi-nhuan-rong, lich-tra-no, xirr). Người đọc được bảo so hai con số trong khi màn chỉ có một.
- **Bằng chứng:** Grep 'extras' trong src/ui, src/app, src/application (trừ test): 0 kết quả; 'rule72' chỉ xuất hiện ở performance.ts:1270. Probe ví dụ 6,8%: value 10,5361 năm, extras.rule72 = 10,5882 — có trong output nhưng không được render. Hướng sửa thay thế: cho màn hiện extras.rule72 thì câu cũ thành đúng.
- **Sửa (vi):** Con số là số năm để vốn thành gấp đôi nếu lợi suất giữ nguyên và lãi nhập gốc: ở mức 8%/năm là khoảng 9 năm. Màn chỉ hiện kết quả theo công thức chính xác; muốn nhẩm nhanh thì lấy 72 chia lợi suất (%), hai cách cho số gần nhau ở mức lãi từ 5% tới 12%.
- **Sửa (en):** The figure is the number of years for the capital to double if the return holds steady and interest is reinvested: at 8%/year that is about 9 years. The screen shows only the exact formula; for a quick mental check divide 72 by the rate (%), and the two agree closely for rates between 5% and 12%.

#### `irr-nien-kim` — IRR của dòng tiền đều (niên kim)

**F3 · S2 · gây hiểu sai** — `example.note` (src/core/formulas/performance.ts:986)

- **Trích:** Quy theo cách ngân hàng niêm yết (nhân 12 kỳ) thì tương đương 9,52%/năm, cao hơn mức ưu đãi 8%/năm được chào — con số đưa vào đây là khoản người vay báo trả thực tế, không phải khoản suy ra từ lãi ưu đãi. IRR chính là chỗ bóc tách được khoảng cách đó.
- **Vấn đề:** Câu cuối dẫn người mới tới kết luận: chi phí thật của khoản vay là 9,52%/năm, ngân hàng 'giấu' 1,52 điểm so với mức 8%. Kết luận đó dựa trên giả định không nói ra là 28 triệu ₫ được trả đều suốt 240 tháng, mà hai ví dụ anh em dẫn cùng bài VietnamFinance 28/03/2026 phủ định: lich-tra-no ghi khoản vay thật 'chỉ được ưu đãi 24 tháng rồi thả nổi 14–15%/năm' (khoản trả phải đổi sau tháng 24), còn tra-gop-nien-kim gọi 28 triệu là 'Mức ngân hàng báo cho người vay — khoảng 28 triệu ₫/tháng … không trùng hẳn phương thức nào', trái với 'khoản người vay báo trả thực tế' ở đây và 'mỗi tháng thực trả 28 triệu ₫' ở tiêu đề (dòng 980, nên sửa cùng). Trong 24 tháng ưu đãi, lãi tính 8% trên dư nợ nên trả hơn 25,09 triệu chỉ là trả gốc nhanh hơn, không phải lãi cao hơn; sau đó thả nổi thì chi phí cả kỳ vượt xa 9,52%. Con số 9,52% không bóc tách được khoảng cách nào của khoản vay thật.
- **Bằng chứng:** Probe irr-nien-kim: ví dụ → 0,79320%/kỳ × 12 = 9,52%/năm; payment 25.093.202 ₫ (kết quả ví dụ tra-gop-nien-kim, niên kim 8%) → đúng 0,66667%/kỳ = 8%/năm; payment 32.500.000 ₫ (kỳ đầu gốc đều) → 0,9787%/kỳ. personal.ts:180 (tra-gop-nien-kim example.note), personal.ts:484 (lich-tra-no example.note). Tính độc lập probes/F/irr-float.cjs: 24 tháng niên kim 8% rồi dư nợ 2,868 tỷ trả niên kim theo 14% hoặc 15% trong 216 tháng → kỳ 25–240 trả 36,43–38,48 triệu, IRR cả kỳ 12,33–13,01%/năm (nhân 12).
- **Sửa (vi):** Quy theo cách ngân hàng niêm yết (nhân 12 kỳ) thì tương đương 9,52%/năm, cao hơn mức ưu đãi 8%/năm. Con số này chỉ đúng nếu người vay trả đều 28 triệu ₫ suốt 240 tháng; khoản vay thật chỉ ưu đãi 24 tháng rồi thả nổi nên khoản trả sẽ đổi, và 9,52% chỉ là lãi suất ngầm của dòng trả đều giả định ấy, không phải chi phí thật của khoản vay.
- **Sửa (en):** Quoted the way banks do it (twelve periods a year) this is 9.52%/year, above the 8%/year promotional rate. That figure only holds if the borrower pays a flat 28 million ₫ for all 240 months; the actual loan is discounted for just 24 months and then floats, so the payment will change, and 9.52% is only the rate implied by that assumed level payment, not the loan's true cost.

#### `loi-suat-trung-binh-hinh-hoc` — Lợi suất trung bình hình học

**F4 · S2 · ví dụ** — `example.title + example.note` (src/core/formulas/performance.ts:803)

- **Trích:** VN-Index ba kỳ liền: +12,1% năm 2024, +40,87% năm 2025, +2,67% tám tháng đầu 2026 | Trung bình cộng của ba kỳ là 18,55%, cao hơn khoảng 1,07 điểm phần trăm. Khoảng cách này luôn lệch về một phía và càng rộng khi biến động càng mạnh; chỉ trung bình hình học mới nhân dồn ra đúng giá trị cuối kỳ.
- **Vấn đề:** Trung bình hình học mỗi kỳ chỉ đọc được như một tốc độ khi các kỳ dài bằng nhau, và whenToUse của chính công thức ghi 'mỗi năm một con số' (dòng 789). Ví dụ trộn hai kỳ 12 tháng với một kỳ 8 tháng, nên 17,48% 'mỗi kỳ' không ứng với đơn vị thời gian nào, và note (dòng 809) không nói điều đó. Người mới đọc 17,48% là mức tăng bình quân mỗi năm của VN-Index từ đầu 2024 tới 8/2026; quy đúng theo 32 tháng thì mức đó là 19,87%/năm, cao hơn 2,39 điểm.
- **Bằng chứng:** Probe ví dụ → 17,4778%/kỳ. Tích (1,121 × 1,4087 × 1,0267) = 1,621316; probe cagr {start 1.000.000; end 1.621.316,08; years 2,6667} → 19,8672%/năm. Mốc lấy từ chính example.source: chốt 2024 1.266,78, chốt 2025 1.784,49 (+40,87%), chốt 8/2026 1.832,12 (+2,67% trong 8 tháng). Chuẩn: CFA Level I, Quantitative Methods, geometric mean return tính trên các kỳ cùng độ dài. Phương án thay ví dụ: chỉ lấy hai năm đủ 2024 và 2025 → probe periods 2 ra 25,6643%/năm.
- **Sửa (vi):** Trung bình cộng của ba kỳ là 18,55%, cao hơn khoảng 1,07 điểm phần trăm, và khoảng cách ấy luôn lệch về một phía. Lưu ý kỳ thứ ba chỉ dài 8 tháng nên 17,48% là mức đều cho mỗi kỳ chứ không phải mỗi năm; quy theo đủ 32 tháng thì chỉ số tăng khoảng 19,87%/năm.
- **Sửa (en):** The arithmetic average of the three periods is 18.55%, about 1.07 percentage points higher, and that gap always leans the same way. Note that the third period lasts only 8 months, so 17.48% is a steady rate per period, not per year; spread over the full 32 months the index grew about 19.87%/year.

#### `tong-loi-suat-tai-dau-tu` — Tổng lợi suất có tái đầu tư cổ tức

**F5 · S2 · gây hiểu sai** — `example.title` (src/core/formulas/performance.ts:616)

- **Trích:** Giữ 5 năm: giá tăng 19,29%/năm, cổ tức 2,75%/năm đem mua thêm cổ phiếu
- **Vấn đề:** Tiêu đề kể như một khoản đã giữ 5 năm thật, trong khi example.source (dòng 626) cho biết mức tăng giá chỉ đo trên VN-Index khoảng 2 năm (9/2024–8/2026) và cổ tức lấy của một mã khác (FPT). Không trường nào nói nhịp tăng 2 năm ấy được GIẢ ĐỊNH kéo dài đủ 5 năm; chữ 'minh hoạ' ở nguồn chỉ nói hai nguồn được ghép. Người mới đọc 176,65% như kết quả có số liệu thật đứng sau của 5 năm giữ cổ phiếu và tái đầu tư, trong khi phần có số liệu (2 năm) chỉ ứng với 50,24%.
- **Bằng chứng:** Probe tong-loi-suat-tai-dau-tu: ví dụ (5 năm) → 176,6492%; cùng bộ số với years 2 → 50,2352%; years 2 và cổ tức 0 → 42,3010%. Xem thêm phát hiện về con số 19,29% ngay dưới.
- **Sửa (vi):** Giả định giá tăng 19,29%/năm như VN-Index hai năm qua và giữ nhịp đó đủ 5 năm, cổ tức 2,75%/năm đem mua thêm cổ phiếu
- **Sửa (en):** Assuming the VN-Index's 19.29%/year pace of the past two years holds for five full years, with a 2.75%/year dividend buying more shares

**F9 · S3 · câu sai** — `example.source (kèm ô priceGrowth và tiêu đề)` (src/core/formulas/performance.ts:626)

- **Trích:** Mức tăng giá lấy theo VN-Index giai đoạn 9/2024–8/2026, tỷ suất cổ tức lấy theo FPT tại thị giá 11/09/2026 — hai nguồn ghép lại để minh hoạ tác động tái đầu tư.
- **Vấn đề:** 19,29%/năm (ô priceGrowth dòng 619 và tiêu đề dòng 616) không tái lập được từ giai đoạn nêu. Với mốc của bảng tính gốc 1.287,94 → 1.832,12 điểm (1.832,12 là mức chốt 8/2026 in ở nguồn của loi-suat-nam-hoa và loi-suat-trung-binh-hinh-hoc), tính tròn 2 năm ra 19,27%/năm, tính đúng 23 tháng (cuối 9/2024 tới cuối 8/2026) ra 20,19%/năm; không cách đếm nào ra 19,29%.
- **Bằng chứng:** probes/F/calc-check.cjs: (1.832,12 ÷ 1.287,94)^(1/2) − 1 = 19,2694%; ^(12/23) − 1 = 20,1867%. Engine (cổ tức 2,75, 5 năm): priceGrowth 19,27 → 176,4173%; 20,19 → 187,2439%; ví dụ hiện tại 19,29 → 176,6492%. Mốc đầu 1.287,94 lấy từ bảng tính đối chiếu, không có trong repo.
- **Sửa (vi):** Mức tăng giá là tăng trưởng kép của VN-Index từ 1.287,94 điểm cuối 9/2024 lên 1.832,12 điểm cuối 8/2026, tức 23 tháng; tỷ suất cổ tức lấy theo FPT tại thị giá 11/09/2026. Hai nguồn ghép lại để minh hoạ tác động tái đầu tư. (Đổi kèm ô priceGrowth và tiêu đề sang 20,19, expected 187,2439; nếu muốn giữ cách tính tròn 2 năm thì dùng 19,27, expected 176,4173 và sửa nguồn thành 'hai năm'.)
- **Sửa (en):** Price growth is the VN-Index's compound growth from 1,287.94 points at the end of 9/2024 to 1,832.12 points at the end of 8/2026, a 23-month span; the dividend yield is FPT's at its 2026-09-11 price. The two sources are combined to illustrate the reinvestment effect.

**F10 · S3 · ví dụ** — `example.note` (src/core/formulas/performance.ts:622)

- **Trích:** Phần vượt lên trên mức tăng giá đơn thuần chính là lãi kép của cổ tức: cổ tức mua thêm cổ phiếu, rồi số cổ phiếu mới đó lại nhận cổ tức. Điều kiện là phải thực sự mua lại, và ở Việt Nam còn phải trừ 5% thuế cổ tức trước khi tái đầu tư.
- **Vấn đề:** Ô Tỷ suất cổ tức của ví dụ là 2,75% (cổ tức gộp 2.000 ₫ ÷ 72.700 ₫, chưa trừ thuế), nên 176,65% chính là con số mà commonMistakes của công thức cảnh báo ('quên rằng cổ tức thực nhận đã bị khấu trừ thuế nên con số thực tế thấp hơn', dòng 610). Note nhắc thuế 5% như một điều kiện nhưng không nói kết quả trên màn CHƯA trừ, nên người đọc dễ tưởng 176,65% đã tính thuế.
- **Bằng chứng:** Probe: dividendYield 2,6125 (= 2,75 × 0,95) → 174,8030%; 2,61 → 174,7696%; thấp hơn ví dụ khoảng 1,85 điểm. Thuế cổ tức 5%: schedules.ts key tax.dividend.cash.
- **Sửa (vi):** Phần vượt lên trên mức tăng giá đơn thuần chính là lãi kép của cổ tức: cổ tức mua thêm cổ phiếu, rồi số cổ phiếu mới đó lại nhận cổ tức. Con số trên màn dùng tỷ suất cổ tức trước thuế; trừ 5% thuế cổ tức thì phần đem tái đầu tư còn 2,61%/năm và tổng lợi suất còn khoảng 174,8%, với điều kiện phải thực sự mua lại.
- **Sửa (en):** Everything above the price-growth-only figure is dividends compounding: the payout buys more shares, and those new shares collect dividends in turn. The figure on screen uses the pre-tax dividend yield; after the 5% dividend tax the reinvested yield drops to 2.61%/year and the total return to about 174.8%, and only if the shares are genuinely repurchased.

#### `loi-suat-quy-nam-theo-ngay` — Lợi suất quy năm theo số ngày

**F11 · S3 · ví dụ** — `example.note` (src/core/formulas/performance.ts:1360)

- **Trích:** Lãi thực của thương vụ chỉ là 15,58%; con số quy năm dùng để xếp cạnh các khoản có kỳ hạn khác nhau tại cùng một thời điểm, không phải mức kỳ vọng. Mẫu số ở đây là 365 ngày lịch chứ không phải 250 phiên như cách quy năm bên nhóm rủi ro.
- **Vấn đề:** 'Lãi thực' gọi mức tăng giá 15,58% (chưa trừ phí và thuế) là lãi thật của thương vụ, đúng sai lầm mà commonMistakes của chính công thức cảnh báo ('quên trừ phí với thuế', dòng 1348). Ví dụ roi-rong dùng đúng thương vụ này (1.000 CP, 62.900 → 72.700 ₫, 24/07 → 11/09/2026) ra lãi sau phí và thuế 15,12%, và note của nó gọi 15,58% là 'tỷ suất tính trên giá thuần'. Bản en ('The trade itself gained just 15.58%') không mắc lỗi này, nên vi và en còn nói khác nhau.
- **Bằng chứng:** Probe roi-rong ví dụ → 15,1177% (months 0 → 15,1187%); probe loi-suat-quy-nam-theo-ngay ví dụ → 194,0491%, lợi suất giá 15,5803%. fees.ts:1018: 'Tỷ suất tính trên giá thuần là 15,58%; phần chênh 0,46 điểm phần trăm chính là phí và thuế.'
- **Sửa (vi):** Bản thân thương vụ tăng 15,58% theo giá, chưa trừ phí và thuế; con số quy năm dùng để xếp cạnh các khoản có kỳ hạn khác nhau tại cùng một thời điểm, không phải mức kỳ vọng. Mẫu số ở đây là 365 ngày lịch chứ không phải 250 phiên như cách quy năm bên nhóm rủi ro.
- **Sửa (en):** The trade itself gained 15.58% on price alone, before fees and taxes; the annualized figure exists to line up investments of different lengths at one moment in time, not to set an expectation. The denominator here is 365 calendar days, not the 250 trading sessions used for annualizing in the risk group.

#### `loi-suat-thuc` — Lợi suất thực sau lạm phát

**F12 · S3 · gây hiểu sai** — `example.note (cùng ý ở explanation.commonMistakes dòng 282)` (src/core/formulas/performance.ts:294)

- **Trích:** Lấy hai con số trừ thẳng cho nhau ra 2,35%, cao hơn kết quả đúng — càng lạm phát cao thì chênh càng rộng. | commonMistakes: '… trong khi con số đúng là 5,77% — lệch càng lớn khi lạm phát càng cao.'
- **Vấn đề:** Phần lệch của phép trừ thẳng đúng bằng lợi suất thực × lạm phát, nên chỉ rộng ra theo lạm phát khi lợi suất THỰC giữ nguyên. Người dùng giữ lãi gửi của ví dụ rồi kéo ô lạm phát lên sẽ thấy phần lệch HẸP lại, về 0 khi lạm phát bằng lãi danh nghĩa, rồi đổi chiều (phép trừ ra số thấp hơn số đúng), trái với câu. Kết luận sai rút ra: lạm phát càng cao thì phép trừ thẳng càng sai, bất kể lãi suất.
- **Bằng chứng:** Probe loi-suat-thuc: 6,8/4,45 → 2,2499 (trừ thẳng 2,35, lệch 0,10); 6,8/6 → 0,7547 (trừ thẳng 0,80, lệch 0,05); 6,8/8 → −1,1111 (trừ thẳng −1,20, thấp hơn số đúng); 10/4 → 5,7692 (lệch 0,23); 10/8 → 1,8519 (lệch 0,15). Lệch = r_thực × π: 2,2499% × 4,45% = 0,1001 điểm. Bodie, Kane & Marcus ch.5 nói ở dạng tỷ lệ: phép trừ phóng đại lợi suất thực theo hệ số (1 + π).
- **Sửa (vi):** Gửi 1 tỷ đồng, sau một năm sổ ghi 1,068 tỷ nhưng sức mua chỉ tương đương 1,0225 tỷ của hôm nay. Lấy hai con số trừ thẳng cho nhau ra 2,35%, cao hơn kết quả đúng; phần lệch bằng lợi suất thực nhân lạm phát, nên với cùng một lợi suất thực, lạm phát càng cao thì lệch càng rộng. (commonMistakes sửa cùng ý: '… trong khi con số đúng là 5,77%; phần lệch bằng lợi suất thực nhân lạm phát nên với cùng một lợi suất thực, lạm phát càng cao lệch càng lớn.')
- **Sửa (en):** Deposit 1 billion đồng and a year later the passbook says 1.068 billion, yet its purchasing power equals only 1.0225 billion of today. Subtracting the two figures directly gives 2.35%, above the correct answer; the gap equals the real return times inflation, so for the same real return it widens as inflation rises.

**F13 · S3 · câu sai** — `explanation.howToRead` (src/core/formulas/performance.ts:278)

- **Trích:** Kết quả âm nghĩa là tiền vẫn tăng trên sổ nhưng sức mua đang giảm. Lấy lợi suất trừ thẳng lạm phát chỉ là xấp xỉ; phép chia ở trên mới cho con số đúng.
- **Vấn đề:** Vế 'tiền vẫn tăng trên sổ' chỉ đúng khi lợi suất danh nghĩa dương. Ô 'Lợi suất danh nghĩa / năm' cho nhập tới −100%, và kết quả âm cũng ra khi khoản đầu tư lỗ danh nghĩa; lúc đó tiền trên sổ giảm chứ không tăng.
- **Bằng chứng:** Probe loi-suat-thuc nominal −5, inflation 4 → −8,6538%: kết quả âm trong khi số dư danh nghĩa giảm 5%. Biến nominal khai min −100 (performance.ts:251).
- **Sửa (vi):** Kết quả âm nghĩa là sức mua đang giảm, kể cả khi số tiền trên sổ vẫn tăng. Lấy lợi suất trừ thẳng lạm phát chỉ là xấp xỉ; phép chia ở trên mới cho con số đúng.
- **Sửa (en):** A negative result means purchasing power is shrinking, even when the balance still grows on paper. Simply subtracting inflation from the return is only an approximation; the division above gives the correct figure.

**F14 · S3 · cảnh báo** — `calc warning (inflation < −100 → belowTotalLoss)` (src/core/formulas/performance.ts:347)

- **Trích:** Lạm phát dưới −100% nghĩa là mất nhiều hơn số vốn bỏ ra — không xảy ra với vị thế mua thông thường. ↳ Kiểm tra lại ô Lạm phát: mất sạch vốn thì nhập đúng −100.
- **Vấn đề:** belowTotalLoss() viết cho ô lợi suất nhưng được dùng cho ô Lạm phát: lạm phát dưới −100% không phải 'mất nhiều hơn số vốn', và gợi ý 'nhập đúng −100' dẫn thẳng sang lỗi DIVIDE_BY_ZERO có gợi ý ngược lại 'Nhập lạm phát khác −100%.' (dòng 339). Hiện ra được trên màn: ô số đẩy giá trị chưa kẹp lên calc ngay lúc gõ (NumberInput.tsx:190–191), chỉ kẹp về min −50 khi rời ô.
- **Bằng chứng:** Probe inflation −120 → MEANINGLESS với đúng hai câu trên; inflation −100 → DIVIDE_BY_ZERO 'Chưa tính được lợi suất thực vì tổng (1 + Lạm phát) bằng 0.' / 'Nhập lạm phát khác −100%.'. Mẫu câu: performance.ts:36 và 40.
- **Sửa (vi):** Lạm phát dưới −100% nghĩa là mặt bằng giá rơi xuống dưới 0, điều không thể xảy ra. ↳ Nhập lạm phát trong khoảng −50% tới 100%.
- **Sửa (en):** Inflation below −100% would mean prices falling below zero, which cannot happen. ↳ Enter an inflation rate between −50% and 100%.

### `returns.ts`

#### `hpr` — HPR — lợi suất kỳ nắm giữ

**F1 · S2 · ví dụ** — `explanation.howToRead` (src/core/formulas/returns.ts:206)

- **Trích:** Cao hơn tỷ suất tính trên giá thuần — tức (Giá cuối kỳ − Giá đầu kỳ) ÷ Giá đầu kỳ — đúng bằng phần cổ tức chia cho giá đầu kỳ: ví dụ trên màn ra 20,51%, còn bỏ cổ tức đi chỉ còn 17,95%.
- **Vấn đề:** Câu neo vào 'ví dụ trên màn' nhưng 20,51% / 17,95% là của bộ ví dụ CŨ (78.000 → 92.000 ₫, cổ tức 2.000 ₫), nay chỉ còn là giá trị mặc định của ô nhập. Khối Ví dụ hiện tại là FPT 62.900 → 72.700 ₫, tiêu đề ghi 'trong kỳ không có cổ tức', dòng 'Ví dụ gốc' là 15,58%: không có cổ tức nào để 'bỏ đi', và bấm 'Về số của ví dụ' là 20,51% biến mất. Người đọc đối chiếu với khối Ví dụ không tìm ra hai con số được nhắc (bản en còn nói 'the example above').
- **Bằng chứng:** Probe hpr: example.inputs {62.900; 72.700; 0} → 15,5803% (= example.expected); bộ mặc định {78.000; 92.000; 2.000} → 20,5128%, cùng bộ bỏ cổ tức → 17,9487%. REVIEW.md dòng 820 ghi ví dụ lúc rà 11–13/09 là '78.000 → 92.000, cổ tức 2.000', tức câu này viết cho ví dụ đã bị thay ngày 15–16/09. ExampleBlock.tsx: dòng '→' hiện kết quả của ô đang nhập, dòng 'Ví dụ gốc' hiện example.expected.
- **Sửa (vi):** Cao hơn tỷ suất tính trên giá thuần, tức (Giá cuối kỳ − Giá đầu kỳ) ÷ Giá đầu kỳ, đúng bằng phần cổ tức chia cho giá đầu kỳ: mua 78.000 ₫, cuối kỳ 92.000 ₫, nhận 2.000 ₫ cổ tức thì HPR là 20,51%, bỏ cổ tức đi chỉ còn 17,95%.
- **Sửa (en):** It exceeds the price-only return, (Ending price − Starting price) ÷ Starting price, by exactly the dividend divided by the starting price: buying at 78,000 ₫, ending at 92,000 ₫ and collecting a 2,000 ₫ dividend gives an HPR of 20.51%, while dropping the dividend leaves 17.95%.

**F6 · S2 · gây hiểu sai** — `example.note` (src/core/formulas/returns.ts:222)

- **Trích:** Cổ tức bằng 0 nên HPR trùng khít ROI — hai bên chỉ tách nhau khi trong kỳ có đợt chốt quyền. Nắm qua một đợt cổ tức 1.000 ₫/CP thì HPR lên 17,17% trong khi lợi suất chỉ theo giá vẫn giữ nguyên.
- **Vấn đề:** Câu thứ hai giữ nguyên giá cuối 72.700 ₫ khi thêm cổ tức rồi khẳng định lợi suất theo giá 'vẫn giữ nguyên' khi nắm qua đợt cổ tức. Thực tế vào ngày giao dịch không hưởng quyền, giá bị điều chỉnh giảm đúng phần cổ tức tiền mặt, nên nắm qua đợt cổ tức thì lợi suất theo giá giảm khoảng 1,59 điểm và HPR gần như không đổi. Người mới rút ra kết luận sai quen thuộc: mua trước ngày chốt quyền là 'ăn thêm' cổ tức không mất gì.
- **Bằng chứng:** Probe hpr: cổ tức 1.000, giá cuối 72.700 → 17,1701% (đúng như câu); cổ tức 1.000, giá cuối đã trừ cổ tức 71.700 → 15,5803% (bằng HPR không cổ tức); cổ tức 0, giá cuối 71.700 → 13,9905%, tức lợi suất theo giá thấp hơn 15,5803% đúng 1,59 điểm (= 1.000 ÷ 62.900). Chuẩn: nguyên lý ngày không hưởng quyền, giá giảm xấp xỉ bằng cổ tức (Brealey, Myers & Allen, Principles of Corporate Finance, chương chính sách chi trả); HOSE điều chỉnh giá tham chiếu ngày giao dịch không hưởng quyền khi trả cổ tức bằng tiền.
- **Sửa (vi):** Cổ tức bằng 0 nên HPR trùng khít ROI; hai bên chỉ tách nhau khi trong kỳ có cổ tức. Giữ nguyên giá đầu và giá cuối như trên mà thêm cổ tức 1.000 ₫/CP thì HPR là 17,17%, nhưng đó không phải phần lãi cho không: ngày giao dịch không hưởng quyền, giá tham chiếu bị trừ đúng phần cổ tức, nên nắm qua một đợt chia cổ tức thì HPR thường gần như không đổi.
- **Sửa (en):** With a zero dividend, HPR lands exactly on ROI; the two only part ways when a dividend falls inside the period. Keeping the same start and end prices and adding a 1,000 ₫/share dividend gives an HPR of 17.17%, but that is not free extra return: on the ex-dividend date the reference price is cut by the dividend amount, so holding through a payout usually leaves HPR roughly unchanged.

#### `xirr` — XIRR — suất sinh lợi nội tại theo ngày thực

**F7 · S2 · ví dụ** — `example.cashflows + example.note (khối Ví dụ trên màn)` (src/core/formulas/returns.ts:782)

- **Trích:** FPT — ba lần mua trong tháng 7 và 8/2026, bán hết 300 CP ngày 11/09/2026 (khối Ví dụ in ngay dưới: 'XIRR — suất sinh lợi nội tại theo ngày thực ≈ \_ \_ %/năm')
- **Vấn đề:** Trên màn, bốn dòng tiền của ví dụ (returns.ts:782–785) không hiện ở đâu và không nạp được: bảng dòng tiền khởi tạo 2 dòng trống (FormulaDetail.tsx:532–535), ExampleBlock chỉ bày example.inputs (chỉ có guess), nút 'Xem ví dụ minh hoạ' chỉ có khi ví dụ khai series/bars (FormulaDetail.tsx:2385), XirrBody không có lối nạp nào. Vì guess mặc định trùng guess của ví dụ (10) nên dòng 'Ví dụ gốc 96,55%' cũng không hiện (ExampleBlock.tsx:73, 141). Khối Ví dụ vì vậy kể chuyện ba lần mua FPT rồi in '≈ \_ \_ %/năm': người mới hiểu là ví dụ này không tính được, và không kiểm được 96,55% hay câu về số ngày nắm giữ.
- **Bằng chứng:** Probe xirr bảng trống → INCOMPLETE*INPUT 'Còn thiếu: ít nhất 2 dòng tiền.'; NO_VALUE = '* \_' (format.ts:47); probe với example.cashflows → 96,5541%/năm. Giá đóng cửa trong FPT_57_BARS: 15/07 66.800, 24/07 62.900, 21/08 72.000, 11/09 72.700 ₫, khớp 100 CP mỗi lần mua (6.680.000; 6.290.000; 7.200.000 ₫) và 300 CP khi bán (21.810.000 ₫). Sửa gốc nên ở màn (nạp example.cashflows vào bảng); câu sửa dưới là mức tối thiểu bằng chữ, đã gộp luôn sửa '21 tới 58 ngày' của phát hiện kế tiếp.
- **Sửa (vi):** Ba lần mua, mỗi lần 100 CP: 15/07 giá 66.800 ₫, 24/07 giá 62.900 ₫, 21/08 giá 72.000 ₫; bán cả 300 CP ngày 11/09 giá 72.700 ₫, thu 21.810.000 ₫. Nhập bốn dòng tiền đó vào bảng thì XIRR ra 96,55%/năm, gộp cả ba lần mua theo đúng số ngày thực của từng dòng tiền, việc mà ROI và CAGR không làm được. Kỳ nắm giữ chỉ từ 21 tới 58 ngày nên con số quy năm bị phóng đại rất mạnh, đọc như một thước so sánh chứ không phải mức kỳ vọng.
- **Sửa (en):** Three purchases of 100 shares each: 66,800 ₫ on July 15, 62,900 ₫ on July 24 and 72,000 ₫ on August 21; all 300 shares sold at 72,700 ₫ on September 11 for 21,810,000 ₫. Entering those four cash flows in the table gives an XIRR of 96.55%/year, combining all three purchases on the actual days behind each cash flow, something ROI and CAGR cannot do. The holding periods run only 21 to 58 days, so the annualized figure is heavily magnified; read it as a yardstick, not an expectation.

**F8 · S3 · toán** — `example.note` (src/core/formulas/returns.ts:789)

- **Trích:** Kỳ nắm giữ chỉ 22–58 ngày nên con số quy năm bị phóng đại rất mạnh, đọc như một thước so sánh chứ không phải mức kỳ vọng.
- **Vấn đề:** Hai đầu khoảng dùng hai cách đếm ngày. calc lấy hiệu ngày (chênh Date.parse ÷ 86.400.000 ÷ 365, returns.ts:589): lô 15/07 giữ 58 ngày, lô 24/07 giữ 49 ngày, lô 21/08 giữ 21 ngày. '22' chỉ ra được khi đếm gồm cả hai đầu, mà đếm như vậy thì đầu kia phải là 59.
- **Bằng chứng:** probes/F/calc-check.cjs: 15/07→11/09 = 58, 24/07→11/09 = 49, 21/08→11/09 = 21 ngày (đếm gồm hai đầu: 22 và 59). Giải độc lập phương trình XIRR với d = 0/9/37/58 ra 96,5541% = engine; nếu lô cuối giữ 22 ngày (mua 20/08) engine ra 95,4909%.
- **Sửa (vi):** Kỳ nắm giữ chỉ từ 21 tới 58 ngày nên con số quy năm bị phóng đại rất mạnh, đọc như một thước so sánh chứ không phải mức kỳ vọng.
- **Sửa (en):** The holding periods run only 21 to 58 days, so the annualized figure is heavily magnified; read it as a yardstick, not an expectation.

### `fees.ts`

#### `phi-giao-dich-mua` — Phí giao dịch mua

**G1 · S2 · câu sai** — `example.note` (src/core/formulas/fees.ts:178)

- **Trích:** Đổi biểu phí ở màn Cài đặt rồi tính lại nếu tài khoản của bạn dùng mức khác.
- **Vấn đề:** Câu bảo người dùng sang Cài đặt đổi biểu phí để tính theo mức phí của mình, nhưng sản phẩm chỉ có đúng MỘT biểu phí (Mặc định HOSE 2026, môi giới 0,15%) và không có ô nào sửa tỷ lệ phí. Người có tài khoản 0,03% vào Cài đặt chỉ thấy một lựa chọn duy nhất, tức là không làm được việc câu này hứa, trong khi ngay câu trước nhấn mạnh các công ty thu chênh nhau cả chục lần. (Nếu muốn giữ câu cũ thì phải thêm biểu phí hoặc ô sửa mức phí vào MarketConfig trước.)
- **Bằng chứng:** src/core/market/schedules.ts:169 `schedules: [HOSE_2026]` là biểu phí duy nhất; ô 'Biểu phí giao dịch' ở src/app/cai-dat/SettingsScreen.tsx:409–426 dựng từ đúng danh sách đó; src/ui/screens/FeeScheduleField.tsx:17 tự ghi 'Hiện MarketConfig mới khai một biểu phí'; grep 'brokerage' trong src/app, src/ui, src/application không ra ô nhập tỷ lệ phí nào. Probe G/g1: phi-giao-dich-mua ví dụ → 94.350 ₫, luôn theo 0,15%.
- **Sửa (vi):** Mức 0,15% ở đây là bậc phí trực tuyến phổ biến chứ không phải mức luật định: cùng một lệnh, nơi thu 0,03% nơi thu 0,35%, chênh nhau cả chục lần. Ứng dụng hiện chỉ có biểu phí này, nên nếu tài khoản của bạn dùng mức khác thì nhân giá trị lệnh với mức phí của bạn để ra số đúng.
- **Sửa (en):** The 0.15% here is a common online tier, not a statutory rate: the same order costs 0.03% at one broker and 0.35% at another, more than a tenfold spread. The app currently has only this schedule, so if your account uses a different rate, multiply the order value by your own rate to get the right figure.

**G3 · S3 · ví dụ** — `explanation.howToRead` (src/core/formulas/fees.ts:162)

- **Trích:** ví dụ trên màn, lệnh 92.000.000 ₫ mất 138.000 ₫, tức mỗi cổ phiếu đắt thêm 138 ₫ so với giá khớp
- **Vấn đề:** Câu neo vào 'ví dụ trên màn' nhưng số là bộ mặc định WF-08 (1.000 CP × 92.000 ₫), không phải khối Ví dụ hiện tại: tiêu đề ví dụ là 'mua 1.000 CP giá 62.900 ₫ phiên 24/07/2026' và dòng 'Ví dụ gốc cho:' hiện 94.350 ₫. Bấm 'Về số của ví dụ' xong thì khối Ví dụ ra lệnh 62.900.000 ₫ mất 94.350 ₫, trái với câu này. Câu đúng khi ví dụ còn là WF-08, lệch từ khi ví dụ đổi sang số thật FPT.
- **Bằng chứng:** example.inputs {quantity: 1000, buyPrice: 62900} (fees.ts:175), expected 94.350. Probe G/g1: 'mua ví dụ' → 94.350 ₫; 'mua mặc định' → 138.000 ₫. FormulaDetail.tsx:286 khởi tạo ô bằng defaultInputs; ExampleBlock.tsx:141–145 hiện 'Ví dụ gốc cho: 94.350 ₫' kèm nút quay về.
- **Sửa (vi):** Kết quả là số tiền bị trừ thêm ngoài tiền mua: ví dụ trên màn, lệnh 62.900.000 ₫ mất 94.350 ₫, tức mỗi cổ phiếu đắt thêm 94,35 ₫ so với giá khớp. Cộng số này vào giá vốn trước khi tính lãi.
- **Sửa (en):** The result is the amount deducted on top of the purchase money: in the example on this page, a 62,900,000 ₫ order costs 94,350 ₫, meaning each share is 94.35 ₫ more expensive than the matched price. Add it to your cost basis before computing any profit.

#### `phi-giao-dich-ban` — Phí giao dịch bán

**G2 · S2 · câu sai** — `MarketConstant.note của fee.brokerage.buy và fee.brokerage.sell (khối hằng số ConstantsNote)` (src/core/market/schedules.ts:46)

- **Trích:** Mức phổ biến trên thị trường, không phải mức luật định. Sửa được ở màn Cài đặt.
- **Vấn đề:** Ghi chú này nằm ở hai bản ghi (schedules.ts:46–47 và 61–62) và hiện nguyên văn trong khối hằng số dưới ô nhập của 5 màn: phi-giao-dich-mua, phi-giao-dich-ban, gia-hoa-von, loi-nhuan-rong, roi-rong. Vế 'Sửa được ở màn Cài đặt' sai: màn Cài đặt chỉ có ô chọn biểu phí với đúng một lựa chọn, không có chỗ nào sửa mức 0,15%. Người dùng tin câu này sẽ đi tìm một ô không tồn tại, hoặc tưởng kết quả trên màn đã tính theo mức phí của tài khoản mình.
- **Bằng chứng:** ConstantsNote.tsx:65–67 in `constant.note` khi bản ghi có; FormulaDetail.tsx:2476 dựng ConstantsNote không điều kiện chế độ. Chỉ một biểu phí: schedules.ts:169; ô chọn: SettingsScreen.tsx:409–426; không có ô nhập tỷ lệ phí nào trong src/app, src/ui (grep). Docblock schedules.ts:24 cũng ghi 'người dùng sửa được ở màn Cài đặt', cùng một giả định chưa thành sự thật.
- **Sửa (vi):** Mức phổ biến trên thị trường, không phải mức luật định. Ứng dụng chưa cho sửa mức này; công ty chứng khoán của bạn có thể thu mức khác.
- **Sửa (en):** A common market rate, not a statutory rate. The app does not let you change it yet; your broker may charge a different rate.

#### `thue-co-tuc` — Thuế cổ tức tiền mặt

**G4 · S3 · câu sai** — `example.source` (src/core/formulas/fees.ts:478)

- **Trích:** Cổ tức tiền mặt CTCP FPT (mã FPT) đợt chốt quyền 02/12/2025; thuế suất theo Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 12.
- **Vấn đề:** Đợt cổ tức chốt quyền 02/12/2025, nhưng nguồn trích thuế suất theo Luật 109/2025/QH15, luật chỉ được thông qua 10/12/2025 và có hiệu lực từ 01/07/2026. Khoản khấu trừ của đợt này thuộc Luật Thuế thu nhập cá nhân 04/2007/QH12 (sửa đổi). Mức 5% trùng nhau nên con số 50.000 ₫ không sai, nhưng căn cứ pháp lý gắn cho sự kiện sai thời điểm, ngược đúng lời hứa 'tính lại giao dịch cũ theo biểu phí thời điểm đó' của resolve.ts.
- **Bằng chứng:** schedules.ts:105–130 có hai bản ghi tax.dividend.cash: 04/2007/QH12 từ 2009-01-01 và 109/2025/QH15 từ 2026-07-01; resolveConstant() (resolve.ts:18–32) chọn theo asOf. src/core/market/README.md:49–51: Luật 109/2025/QH15 thông qua 10/12/2025, hiệu lực 01/07/2026. Probe G/g3: thue-co-tuc ví dụ với asOf 2025-12-15 → 50.000 ₫, tức tra ra bản ghi luật cũ.
- **Sửa (vi):** Cổ tức tiền mặt CTCP FPT (mã FPT) đợt chốt quyền 02/12/2025; thuế suất 5% theo Luật Thuế thu nhập cá nhân 04/2007/QH12 (sửa đổi) áp dụng cho đợt này, mức giữ nguyên ở Luật 109/2025/QH15, Điều 12 từ 01/07/2026.
- **Sửa (en):** FPT Corp’s (ticker FPT) cash dividend with a 2025-12-02 record date; the 5% rate comes from Personal Income Tax Law 04/2007/QH12 (as amended), which governed this payment, and carries over unchanged into Law 109/2025/QH15, Article 12 from 2026-07-01.

**G5 · S3 · câu sai** — `variables[quantity].description` (src/core/formulas/fees.ts:57)

- **Trích:** Số cổ phiếu mua vào rồi bán ra.
- **Vấn đề:** Biến `quantity` khai một lần cho cả nhóm nên màn thuế cổ tức mô tả ô Khối lượng là 'số cổ phiếu mua vào rồi bán ra', trong khi bảng ký hiệu cùng màn ghi Q là 'khối lượng cổ phiếu nhận cổ tức'. Cổ tức tính trên số cổ phiếu đang nắm vào ngày chốt quyền, không liên quan việc bán ra; người mới đọc mô tả này dễ nhập cả số cổ phiếu đã bán trước ngày chốt quyền. Cùng lệch ở phi-luu-ky (bảng ký hiệu ghi 'khối lượng cổ phiếu nắm giữ', phí thu dù không bán).
- **Bằng chứng:** fees.ts:53–60 khai quantity, dùng lại ở thue-co-tuc (fees.ts:447) và phi-luu-ky (fees.ts:553). Bảng ký hiệu thue-co-tuc: fees.ts:420–426. calc thue-co-tuc chỉ nhân quantity × dividendPerShare × thuế suất (fees.ts:505), không có vế bán.
- **Sửa (vi):** Khai riêng cho thue-co-tuc (giữ key quantity): 'Số cổ phiếu đang nắm giữ vào ngày chốt quyền nhận cổ tức.' Cho phi-luu-ky: 'Số cổ phiếu nằm trong tài khoản lưu ký.'
- **Sửa (en):** Declare a separate description for thue-co-tuc (same key quantity): 'Number of shares held on the dividend record date.' For phi-luu-ky: 'Number of shares held in the custody account.'

**G6 · S3 · gây hiểu sai** — `explanation.howToRead` (src/core/formulas/fees.ts:458)

- **Trích:** Lấy số thực nhận này mới ra đúng tỷ suất cổ tức.
- **Vấn đề:** Câu nói tỷ suất cổ tức chỉ 'đúng' khi lấy số sau thuế. Tỷ suất cổ tức theo định nghĩa chuẩn (CFA: cổ tức mỗi cổ phiếu ÷ giá) và theo chính công thức ty-suat-co-tuc của sản phẩm tính trên cổ tức công bố, trước thuế. Kết luận sai cụ thể: người mới cho rằng con số 2,75% ở màn Tỷ suất cổ tức (FPT 2.000 ₫ trên 72.700 ₫) là sai và tự trừ 5% trước khi so với tỷ suất công bố của mã khác. Mục Sai lầm thường gặp cùng màn đã dùng đúng chữ 'tỷ suất cổ tức thực nhận'.
- **Bằng chứng:** returns.ts:443 `DY = D/P × 100`, D là 'cổ tức tiền mặt cả năm'; returns.ts:485 howToRead '... 2.170 ₫ tiền mặt, trước thuế'. Probe G/g2: ty-suat-co-tuc ví dụ → 2,751%. commonMistakes thue-co-tuc (fees.ts:462): 'tỷ suất cổ tức thực nhận'.
- **Sửa (vi):** Kết quả là phần cổ tức bị giữ lại: 1.000 CP × 2.000 ₫ là 2.000.000 ₫ công bố, nộp 100.000 ₫, còn 1.900.000 ₫ về tài khoản. Tỷ suất cổ tức thường công bố tính trên số trước thuế; muốn biết tỷ suất thực nhận thì dùng số còn lại này.
- **Sửa (en):** The result is the slice of the dividend held back: 1,000 shares × 2,000 ₫ is 2,000,000 ₫ announced, 100,000 ₫ withheld, 1,900,000 ₫ reaching the account. Quoted dividend yields use the pre-tax amount; use this net figure for the yield you actually receive.

**X1 · S3 · câu sai** — `example.note` (src/core/formulas/fees.ts:474)

- **Trích:** Công ty chứng khoán khấu trừ ngay tại nguồn, nhà đầu tư nhận về 950.000 ₫ mà không phải tự kê khai.
- **Vấn đề:** Thuế thu nhập cá nhân trên cổ tức tiền mặt do tổ chức TRẢ cổ tức (doanh nghiệp phát hành) khấu trừ trước khi chuyển tiền, không phải công ty chứng khoán. Cùng lỗi với H6 ở planning.ts:1110.
- **Bằng chứng:** Thông tư 111/2013/TT-BTC Điều 25 khoản 1: tổ chức, cá nhân trả thu nhập từ đầu tư vốn khấu trừ thuế trước khi trả. Phát hiện bởi lô H, lô G không ghi.
- **Sửa (vi):** Doanh nghiệp trả cổ tức khấu trừ thuế trước khi chuyển tiền, nhà đầu tư nhận về 950.000 ₫ mà không phải tự kê khai.
- **Sửa (en):** The paying company withholds the tax before transferring the dividend, so 950,000 ₫ reaches the investor with nothing to file.

#### `phi-luu-ky` — Phí lưu ký

**G7 · S2 · ví dụ** — `example.title (kèm example.note)` (src/core/formulas/fees.ts:574)

- **Trích:** FPT — 1.000 CP nằm trong tài khoản 2 tháng, 24/07 đến 11/09/2026
- **Vấn đề:** 24/07/2026 đến 11/09/2026 là 49 ngày, khoảng 1,6 tháng, không phải 2 tháng; tính cả T+2 (cổ phiếu về 28/07, rời tài khoản 15/09) vẫn đúng 49 ngày. Ô months = 2 nên kết quả 540 ₫ cao hơn khoảng 24% so với phí theo thời gian thật (khoảng 435 ₫, cách các công ty chứng khoán thường phân bổ theo số ngày lưu ký). Calc không đếm ngày, chỉ nhân số tháng nhập vào; ca kiểm 'bán ngay trong tháng đầu vẫn tính một tháng' cho thấy ý định làm tròn lên, nhưng trên màn không câu nào nói ra, nên tiêu đề khẳng định sai rằng cổ phiếu nằm đủ 2 tháng và người tính tay theo ngày không ra 540 ₫. loi-nhuan-rong và roi-rong dùng cùng months = 2 với cùng khoảng ngày (phát hiện riêng).
- **Bằng chứng:** Đếm ngày: 24/07→11/09/2026 = 49 ngày = 1,61 tháng (365/12 ngày mỗi tháng). calc: quantity × months × 0,27 (fees.ts:607). Ca kiểm fees.ts:595. Probe G/g1: months 2 → 540 ₫; months 1,6109589 (49 ngày) → 434,96 ₫. Probe G/g2: months 1,6 → 432 ₫.
- **Sửa (vi):** Tiêu đề: 'FPT — 1.000 CP giữ 49 ngày, 24/07 đến 11/09/2026, làm tròn lên 2 tháng'. Thêm vào cuối note: 'Công thức nhân theo số tháng nhập vào, nên 49 ngày làm tròn lên 2 tháng cho 540 ₫; tính đúng theo ngày thì chỉ khoảng 435 ₫.' (Cách khác: đổi months thành 1,6 ở cả bốn ví dụ phi-luu-ky, gia-hoa-von, loi-nhuan-rong, roi-rong và cập nhật expected.)
- **Sửa (en):** Title: 'FPT — 1,000 shares held 49 days, 2026-07-24 to 2026-09-11, rounded up to 2 months'. Append to the note: 'The formula multiplies by the months you enter, so 49 days rounded up to 2 months gives 540 ₫; counted by actual days it is only about 435 ₫.'

**G8 · S3 · câu sai** — `example.source` (src/core/formulas/fees.ts:584)

- **Trích:** Quyết định 1541/QĐ-BTC về giá dịch vụ lưu ký, hiệu lực 07/05/2025; thời gian nắm giữ 24/07 đến 11/09/2026.
- **Vấn đề:** Cùng mức 0,27 ₫/CP/tháng, trên cùng một màn, hai chỗ trích hai căn cứ khác nhau: khối Ví dụ ghi Quyết định 1541/QĐ-BTC của Bộ Tài chính, hiệu lực 07/05/2025; khối hằng số dưới ô nhập ghi 'Biểu giá kèm Thông tư 101/2021/TT-BTC (nay biểu giá do VSDC ban hành theo cơ chế Thông tư 83/2024/TT-BTC, mức 0,27 ₫ vẫn giữ)', từ 01/01/2022; khối Nguồn ghi 'Biểu phí dịch vụ của VSDC'. Hai câu mâu thuẫn cả về cơ quan ban hành lẫn ngày hiệu lực, nên ít nhất một câu sai. Hồ sơ đối chiếu 5.1.1 (chủ dự án duyệt 17/08/2026) không hề nhắc Quyết định 1541.
- **Bằng chứng:** schedules.ts:131–141 (fee.custody: effectiveFrom 2022-01-01, legalBasis 101/2021 + 83/2024); ConstantsNote.tsx:61–64 in cả ngày hiệu lực và căn cứ; formulas/shared.ts:118–123 SOURCE_VSD; src/core/market/README.md:65–75 (mục 4) chỉ nêu 101/2021 và 83/2024.
- **Sửa (vi):** Biểu giá dịch vụ lưu ký của VSDC, mức 0,27 ₫/CP/tháng giữ nguyên từ biểu giá kèm Thông tư 101/2021/TT-BTC; thời gian nắm giữ 24/07 đến 11/09/2026. (Nếu tra lại thấy Quyết định 1541/QĐ-BTC mới là văn bản hiện hành thì giữ câu ví dụ và sửa legalBasis, effectiveFrom của fee.custody trong schedules.ts cho khớp.)
- **Sửa (en):** VSDC’s custody service price schedule, 0.27 ₫/share/month, unchanged since the schedule attached to Circular 101/2021/TT-BTC; holding period 2026-07-24 to 2026-09-11.

#### `loi-nhuan-rong` — Lợi nhuận ròng sau phí & thuế

**G9 · S3 · ví dụ** — `example.title / example.inputs.months` (src/core/formulas/fees.ts:879)

- **Trích:** FPT — mua 1.000 CP giá 62.900 ₫ ngày 24/07/2026, bán 72.700 ₫ ngày 11/09/2026
- **Vấn đề:** Tiêu đề cho kỳ giữ 49 ngày (khoảng 1,6 tháng) nhưng khối Ví dụ hiện 'Thời gian nắm giữ 2 tháng' (fees.ts:882) và phí lưu ký trong tổng 276.640 ₫ của note tính cho 2 tháng; không câu nào nói số tháng đã làm tròn lên. Lệch về tiền nhỏ (khoảng 105 ₫) nhưng người tính tay theo ngày trong tiêu đề không ra đúng tổng chi phí của note. roi-rong dùng đúng bộ đầu vào và khoảng ngày này (fees.ts:1012, 1015). Cùng gốc với phát hiện example.title của phi-luu-ky.
- **Bằng chứng:** Probe G/g1: loi-nhuan-rong months 2 → 9.523.360 ₫, totalCost 276.640; months 1,6109589 (49 ngày) → 9.523.465 ₫, totalCost 276.535. roi-rong months 2 → 15,1177%; 49 ngày → 15,1179% (hiển thị vẫn 15,12%).
- **Sửa (vi):** loi-nhuan-rong: 'FPT — mua 1.000 CP giá 62.900 ₫ ngày 24/07/2026, bán 72.700 ₫ ngày 11/09/2026, phí lưu ký làm tròn lên 2 tháng'. roi-rong: 'FPT — vòng mua 62.900 ₫ ngày 24/07/2026, bán 72.700 ₫ ngày 11/09/2026, phí lưu ký làm tròn lên 2 tháng'.
- **Sửa (en):** loi-nhuan-rong: 'FPT — buy 1,000 shares at 62,900 ₫ on 2026-07-24, sell at 72,700 ₫ on 2026-09-11, custody fee rounded up to 2 months'. roi-rong: 'FPT — a round trip bought at 62,900 ₫ on 2026-07-24 and sold at 72,700 ₫ on 2026-09-11, custody fee rounded up to 2 months'.

#### `roi-rong` — ROI ròng sau phí & thuế

**G10 · S3 · gây hiểu sai** — `example.note` (src/core/formulas/fees.ts:1018)

- **Trích:** Tỷ suất tính trên giá thuần là 15,58%; phần chênh 0,46 điểm phần trăm chính là phí và thuế.
- **Vấn đề:** Đọc theo chữ (bản en còn 'is exactly'), 0,46 điểm phần trăm là phí và thuế quy ra phần trăm vốn. Thực ra phí và thuế của vòng này (276.640 ₫) chỉ bằng 0,44% tiền mua; 0,02 điểm còn lại đến từ việc mẫu số cộng thêm phí mua và phí lưu ký. Kết luận sai cụ thể: lấy 0,46% × 62.994.890 ₫ ≈ 289.777 ₫ làm tổng phí và thuế, lệch 13.137 ₫ so với 276.640 ₫ mà màn loi-nhuan-rong công bố cho cùng giao dịch.
- **Bằng chứng:** Từ probe G/g1 roi-rong ví dụ (netProfit 9.523.360, costBasis 62.994.890): tỷ suất giá thuần 9.800.000 ÷ 62.900.000 = 15,5803%; lãi ròng ÷ tiền mua = 15,1405% (hiệu 0,4398 điểm = 276.640 ÷ 62.900.000); lãi ròng ÷ vốn thực = 15,1177% (hiệu thêm 0,0228 điểm); tổng 0,4626 điểm.
- **Sửa (vi):** Tỷ suất tính trên giá thuần là 15,58%; phần chênh 0,46 điểm phần trăm do phí và thuế gây ra: 0,44 điểm vì chúng bị trừ khỏi lãi, 0,02 điểm vì phí mua và phí lưu ký làm vốn thực bỏ ra lớn hơn tiền mua.
- **Sửa (en):** The rate on the raw prices alone is 15.58%; the 0.46 percentage-point gap comes from the fees and tax: 0.44 points because they come out of the profit, and 0.02 points because the buy fee and custody fee make the capital actually deployed larger than the purchase money.

### `derivatives.ts`

#### `gia-ly-thuyet-vn30f` — Giá lý thuyết hợp đồng tương lai

**G11 · S3 · gây hiểu sai** — `variables[days].description` (src/core/formulas/derivatives.ts:187)

- **Trích:** Đếm từ hôm nay tới ngày đáo hạn của hợp đồng — thứ Năm tuần thứ ba của tháng.
- **Vấn đề:** Bản vi nói 'thứ Năm tuần thứ ba', bản en (và quy ước đáo hạn VN30F) là 'thứ Năm thứ ba' của tháng đáo hạn. Ở tháng bắt đầu từ thứ Sáu đến Chủ nhật, đọc theo hàng tuần trên lịch (tuần bắt đầu thứ Hai, tuần 1 chứa ngày mùng 1) thì hai cách lệch nhau đúng 7 ngày: tháng 8/2026 'thứ Năm tuần thứ ba' là 13/08 trong khi hợp đồng đáo hạn 20/08. Người nhập số ngày theo câu vi sẽ đếm hụt một tuần.
- **Bằng chứng:** Lịch 2026 (script): thứ Năm thứ ba / thứ Năm của tuần thứ ba lệch ở tháng 2 (19 / 12), 3 (19 / 12), 5 (21 / 14), 8 (20 / 13), 11 (19 / 12). Ví dụ của chính công thức theo 'thứ Năm thứ ba': 14/09/2026 + 3 ngày = 17/09/2026. Probe G/g3 với bộ mặc định: 30 ngày → 1.282,84 điểm, 23 ngày → 1.282,18 điểm.
- **Sửa (vi):** Đếm từ hôm nay tới ngày đáo hạn của hợp đồng, là ngày thứ Năm thứ ba trong tháng đáo hạn.
- **Sửa (en):** Counted from today to the contract expiry date, which is the third Thursday of the expiry month.

#### `lai-lo-vi-the-long` — Lãi/lỗ vị thế Long

**G12 · S3 · gây hiểu sai** — `explanation.meaning` (src/core/formulas/derivatives.ts:518)

- **Trích:** Mỗi điểm chỉ số tăng lên đem về cho vị thế mua một khoản bằng hệ số nhân, nhân với số hợp đồng đang giữ.
- **Vấn đề:** Công thức và hai ô nhập tính trên điểm của HỢP ĐỒNG VN30F, không phải điểm chỉ số VN30; hai thứ lệch nhau đúng bằng basis. Chính ví dụ trên màn là phản ví dụ: vị thế Long mở ở 864 điểm lỗ 48,45 điểm vì phần giá phái sinh cao hơn chỉ số bị xoá khi thanh toán theo chỉ số 815,55, chứ không phải vì chỉ số giảm 48,45 điểm. Kết luận sai cụ thể: 'chỉ số VN30 không giảm thì vị thế Long không lỗ'.
- **Bằng chứng:** calc: points = exitPoints − entryPoints (derivatives.ts:602); mô tả ô 'Giá VN30F lúc mở vị thế mua' / 'Giá VN30F lúc đóng vị thế' (derivatives.ts:502, 510); example.note (derivatives.ts:542) 'toàn bộ phần giá phái sinh cao hơn chỉ số bị xoá sạch'. Probe G/g1: long ví dụ → −4.845.000 ₫, pointsGained −48,45.
- **Sửa (vi):** Mỗi điểm giá hợp đồng VN30F tăng lên đem về cho vị thế mua một khoản bằng hệ số nhân, nhân với số hợp đồng đang giữ.
- **Sửa (en):** Each point the VN30F contract price rises earns the long position an amount equal to the multiplier, times the number of contracts held.

#### `lai-lo-vi-the-short` — Lãi/lỗ vị thế Short

**G13 · S3 · gây hiểu sai** — `explanation.meaning` (src/core/formulas/derivatives.ts:681)

- **Trích:** Vị thế bán kiếm lời khi chỉ số giảm: mỗi điểm giảm đem về một khoản bằng hệ số nhân, nhân với số hợp đồng.
- **Vấn đề:** Cùng lỗi với lai-lo-vi-the-long: calc tính trên điểm hợp đồng VN30F. Ví dụ trên màn (phiên đáo hạn 21/05/2020) cho Short lãi 48,45 điểm nhờ giá hợp đồng hội tụ về chỉ số lúc thanh toán, không cần chỉ số giảm. Kết luận sai cụ thể: 'chỉ số VN30 đứng yên thì Short không lãi lỗ gì'.
- **Bằng chứng:** calc: points = entryPoints − exitPoints (derivatives.ts:760); mô tả ô 'Giá VN30F lúc mở vị thế bán' (derivatives.ts:665); example.note derivatives.ts:705. Probe G/g1: short ví dụ → +4.845.000 ₫, pointsGained 48,45.
- **Sửa (vi):** Vị thế bán kiếm lời khi giá hợp đồng VN30F giảm: mỗi điểm giảm đem về một khoản bằng hệ số nhân, nhân với số hợp đồng.
- **Sửa (en):** A short position profits when the VN30F contract price falls: each point of decline earns an amount equal to the multiplier, times the number of contracts.

#### `co-vi-the-phai-sinh` — Cỡ vị thế phái sinh theo % rủi ro

**G14 · S2 · gây hiểu sai** — `explanation.howToRead` (src/core/formulas/derivatives.ts:1088)

- **Trích:** Kết quả làm tròn xuống số nguyên hợp đồng, nên rủi ro thực luôn nhỏ hơn hoặc bằng mức đã định.
- **Vấn đề:** Làm tròn xuống chỉ bảo đảm khoản lỗ TÍNH TẠI ĐÚNG điểm cắt lỗ không vượt ngân sách. Chữ 'rủi ro thực luôn' khiến người mới tin lỗ thật không thể vượt 2% vốn, trong khi giá có thể nhảy qua điểm cắt lỗ. Phản ví dụ nằm ngay trong nhóm: phiên đáo hạn 21/05/2020 (ví dụ của lai-lo-vi-the-long) giá đi 48,45 điểm trong một đợt khớp ATC.
- **Bằng chứng:** Probe G/g2: co-vi-the-phai-sinh ví dụ → 6 HĐ (riskAmount 10.000.000 ₫); lai-lo-vi-the-long 6 HĐ trượt đúng 15 điểm → −9.000.000 ₫ (đúng là ≤ 10 triệu); 6 HĐ với khoảng 864 → 815,55 → −29.070.000 ₫ = 5,81% của 500 triệu, gần gấp ba mức 2%.
- **Sửa (vi):** Kết quả làm tròn xuống số nguyên hợp đồng, nên khoản lỗ tính tại đúng điểm cắt lỗ luôn nhỏ hơn hoặc bằng mức đã định; giá nhảy qua điểm cắt lỗ thì lỗ thật vẫn có thể vượt mức này. Ra 0 nghĩa là mức cắt lỗ này quá rộng cho số vốn hiện có.
- **Sửa (en):** The result is rounded down to a whole number of contracts, so the loss measured exactly at the stop level is always less than or equal to the defined risk; if the price jumps past the stop, the real loss can still exceed it. A result of 0 means this stop-loss distance is too wide for the available capital.

#### `don-bay-hieu-dung` — Tỷ lệ đòn bẩy hiệu dụng

**G15 · S3 · câu sai** — `example.note` (src/core/formulas/derivatives.ts:1285)

- **Trích:** VN-Index từng có phiên giảm 3,58% ngày 22/07/2026, đủ để cuốn đi gần một phần năm tài khoản chỉ trong một phiên.
- **Vấn đề:** 3,58% × 5,7927 lần = 20,76%, tức HƠN một phần năm; 'gần một phần năm' / 'almost a fifth' làm tròn sai hướng. Câu còn áp đòn bẩy của hợp đồng VN30F thẳng lên mức giảm của VN-Index mà không nói đó là giả định (VN30F bám VN30, không bám VN-Index). Mức 3,58% ngày 22/07/2026 thì khớp chuỗi thật.
- **Bằng chứng:** VNINDEX_71_PHIEN (market-series-2026.ts:41–49), phần tử 33 và 34 ứng 21/07 và 22/07 (suy ngày từ FPT_57_BARS cùng lịch, 14 phiên 04/06→23/06 đứng trước): 1.730,56 → 1.668,53 = −3,5844%. Probe G/g1: don-bay-hieu-dung ví dụ → 5,7927 lần; 3,5844 × 5,7927 = 20,763%.
- **Sửa (vi):** Con số này nói chỉ số nhúc nhích 1% thì tài khoản biến động gần 5,8% theo cả hai chiều. VN-Index từng có phiên giảm 3,58% ngày 22/07/2026; nếu VN30F giảm đúng mức đó thì tài khoản mất khoảng 20,8%, hơn một phần năm, chỉ trong một phiên.
- **Sửa (en):** It says a 1% move in the index swings the account by nearly 5.8% in either direction. The VN-Index fell 3.58% in a single session on 2026-07-22; had VN30F fallen by the same amount, the account would have lost about 20.8%, more than a fifth, in one day.

### `personal.ts`

#### `lai-tien-gui` — Lãi tiền gửi có kỳ hạn

**H1 · S2 · câu sai** — `example.note` (src/core/formulas/personal.ts:928)

- **Trích:** Công thức quy ước mỗi tháng 30 ngày nên cao hơn cách ngân hàng tính theo số ngày thực (180/365) chừng 600 nghìn ₫ — đủ để lệch với sổ tiết kiệm thật.
- **Vấn đề:** Sai cả nguyên nhân, chiều lẫn độ lớn. (1) 180 ngày không phải số ngày thực của kỳ 6 tháng: 6 tháng dương lịch luôn dài 181 tới 184 ngày. (2) Quy ước 30 ngày/tháng làm công thức đếm ÍT ngày hơn thực tế, tức kéo kết quả xuống chứ không lên; phần chênh +554.795 ₫ của phép 180/365 đến hoàn toàn từ mẫu năm 360 so với 365, không từ quy ước 30 ngày. (3) Với số ngày thực, lãi ngân hàng lệch công thức trong khoảng ±332.877 ₫ và đổi chiều tuỳ tháng bắt đầu, không bao giờ là cao hơn chừng 600 nghìn. Người đọc sẽ kết luận sai rằng sổ thật luôn ít hơn con số này khoảng 600 nghìn. Bản en (dòng 929) sai y hệt.
- **Bằng chứng:** Probe lai-tien-gui ví dụ: 40.500.000 ₫ (= P × r × 6/12, tương đương 180 ngày trên năm 360). Tính theo số ngày thực trên năm 365 (chính giả định của note; Thông tư 14/2017/TT-NHNN quy đổi năm tính lãi 365 ngày): 180 ngày → 39.945.205 (chênh +554.795); nhưng đếm mọi kỳ 6 tháng bắt đầu ngày 1 trong 2026–2027 chỉ ra 181, 182, 183, 184 ngày → 40.167.123 (công thức cao hơn 332.877), 40.389.041 (+110.959), 40.610.959 (công thức thấp hơn 110.959), 40.832.877 (thấp hơn 332.877).
- **Sửa (vi):** Công thức coi mỗi tháng đúng bằng 1/12 năm, còn ngân hàng tính theo số ngày gửi thực trên năm 365 ngày. Kỳ 6 tháng dài 181 tới 184 ngày tuỳ tháng bắt đầu, nên lãi thật có thể thấp hơn hoặc cao hơn con số này tới khoảng 333 nghìn ₫, không khớp từng đồng với sổ tiết kiệm. Tiền lãi tiết kiệm được miễn thuế thu nhập cá nhân, khác cổ tức tiền mặt vốn chịu thuế suất 5%.
- **Sửa (en):** The formula treats each month as exactly 1/12 of a year, while banks count the actual days held over a 365-day year. A 6-month term runs 181 to 184 days depending on the starting month, so the real interest can come in up to about 333 thousand VND below or above this figure and will not match a savings book to the dong. Savings interest is exempt from personal income tax, unlike cash dividends, which are taxed at 5%.

#### `tiet-kiem-muc-tieu` — Tiết kiệm theo mục tiêu

**H4 · S3 · gây hiểu sai** — `explanation.commonMistakes` (src/core/formulas/personal.ts:1045)

- **Trích:** Lấy mục tiêu chia đều cho số tháng rồi coi là đủ — cách đó bỏ qua phần tiền lãi tích luỹ.
- **Vấn đề:** Câu cảnh báo theo kiểu chia đều rồi tưởng là đủ (en nói thẳng assuming that is enough), nên người mới hiểu rằng chia đều sẽ THIẾU tiền. Thực tế ngược lại: với mọi lãi suất kỳ vọng từ 0% trở lên (dải ô nhập là 0–20), mục tiêu chia đều cho số tháng luôn lớn hơn hoặc bằng khoản gửi đúng, tức chia đều là gửi THỪA. Sai lầm thật là gửi nhiều hơn mức cần, không phải thiếu. Note của chính ví dụ nói đúng chiều (chia đều cần 20,83 triệu, tiền lãi gánh 127 triệu).
- **Bằng chứng:** Probe tiet-kiem-muc-tieu: 6,8%/48 tháng → 18.186.897 ₫/tháng so với chia đều 20.833.333 ₫; 0% → 20.833.333 ₫ (bằng nhau). Phần mục tiêu do tiền lãi gánh (1 − n × PMT ÷ mục tiêu) ở 6,8%: 12 tháng 3,08%; 48 tháng 12,70%; 120 tháng 29,90%; 360 tháng 69,31%.
- **Sửa (vi):** Lấy mục tiêu chia đều cho số tháng rồi coi đó là khoản phải gửi. Cách đó bỏ qua phần tiền lãi tích luỹ nên đòi gửi nhiều hơn mức cần (bằng nhau khi lãi suất kỳ vọng là 0%), và thời gian càng dài thì phần mục tiêu do tiền lãi gánh càng lớn.
- **Sửa (en):** Dividing the goal evenly by the number of months and treating that as the required deposit. This ignores the interest that accumulates, so it asks for more than is needed (the same when the expected rate is 0%), and the longer the horizon, the larger the share of the goal the interest carries.

**H10 · S3 · gây hiểu sai** — `explanation.howToRead` (src/core/formulas/personal.ts:1041)

- **Trích:** Kéo dài thời gian làm khoản gửi hằng tháng nhẹ đi rất nhanh, mạnh hơn là nâng lãi suất kỳ vọng.
- **Vấn đề:** Câu phát biểu vô điều kiện nhưng chỉ đúng ở kế hoạch ngắn. Ở kế hoạch dài vẫn trong dải thanh trượt (tới 360 tháng), thêm một năm hạ khoản gửi khoảng 7%, còn thêm 1 điểm lãi suất hạ 14–17%: người lập kế hoạch 25–30 năm sẽ kết luận sai rằng kéo dài thời gian là đòn bẩy mạnh hơn. Ngoài ra câu chỉ nói độ nhạy theo đầu vào, không dạy đọc con số khoản gửi (đúng lỗi REVIEW.md lô 11 đã sửa ở howToRead của lai-tien-gui).
- **Bằng chứng:** Probe tiet-kiem-muc-tieu (mục tiêu 1 tỷ): ở ví dụ 6,8%/48 tháng = 18.186.897; +12 tháng → 14.040.308 (−22,8%); +1 điểm → 17.819.151 (−2,0%), câu đúng. 6%/348 tháng = 1.070.046; +12 tháng → 995.505 (−7,0%); 7% → 887.967 (−17,0%). 6%/300 tháng = 1.443.014; +12 tháng → 1.336.770 (−7,4%); 7% → 1.234.459 (−14,5%).
- **Sửa (vi):** Đây là khoản phải gửi vào cuối mỗi tháng để chạm mục tiêu đúng hạn, với điều kiện lãi suất kỳ vọng thành hiện thực. So nó với số tiền bạn để dành được mỗi tháng: vượt sức thì phải kéo dài thời gian hoặc hạ mục tiêu. Con số càng thấp hơn mục tiêu chia đều cho số tháng thì tiền lãi gánh hộ càng nhiều.
- **Sửa (en):** This is the amount to deposit at the end of every month to reach the goal on time, provided the expected rate actually materializes. Compare it with what you can set aside each month: if it is out of reach, extend the time or lower the goal. The further it sits below the goal divided evenly by the months, the more of the goal the interest is carrying.

#### `tra-gop-nien-kim` — Trả góp niên kim

**H12 · S3 · câu sai** — `example.note` (src/core/formulas/personal.ts:180)

- **Trích:** đổi lại những năm đầu gần như chỉ trả lãi, gốc giảm rất chậm.
- **Vấn đề:** Nói quá: tỷ trọng lãi cao nhất là ở kỳ 1 và chỉ khoảng 80%, năm năm đầu khoảng 75%, không phải gần như chỉ có lãi. Vế gốc giảm rất chậm thì đúng. Phần còn lại của note (240 kỳ, 32,5 triệu ₫, mức 28 triệu nằm giữa hai phương thức) khớp engine. Bản en (dòng 181) cùng lỗi.
- **Bằng chứng:** Chạy buildAmortisation() của engine (3 tỷ ₫, 8%, 20 năm, niên kim): kỳ 1 lãi 20.000.000 / khoản trả 25.093.202 = 79,70%; năm đầu 78,94%; ba năm đầu 77,15%; năm năm đầu 75,14%; dư nợ sau 5 năm 2.625.767.524 = 87,53% gốc. Probe tra-gop-nien-kim ví dụ 25.093.202 ₫; tra-gop-goc-deu kỳ đầu 32.500.000 ₫.
- **Sửa (vi):** Khoản trả giữ nguyên suốt 240 kỳ nên dễ lập kế hoạch chi tiêu, đổi lại phần lãi chiếm gần 80% khoản trả ở kỳ đầu và gốc giảm rất chậm: sau 5 năm dư nợ vẫn còn gần 88% số đã vay. Mức ngân hàng báo cho người vay, khoảng 28 triệu ₫/tháng, nằm giữa con số niên kim này và kỳ đầu của cách trả gốc đều (32,5 triệu ₫), nên không trùng hẳn phương thức nào.
- **Sửa (en):** The payment stays the same across all 240 periods, which makes budgeting easy, but interest takes nearly 80% of the first payment and the principal falls very slowly: after 5 years the balance is still almost 88% of the amount borrowed. The roughly 28 million VND a month the bank quoted sits between this annuity figure and the first equal-principal period (32.5 million VND), so it matches neither method exactly.

### `planning.ts`

#### `gui-quay-vong` — Gửi quay vòng kỳ ngắn hay gửi kỳ dài

**H2 · S2 · câu sai** — `example.note` (src/core/formulas/planning.ts:423)

- **Trích:** Kết quả âm nên sổ kỳ dài thắng, nhưng chỉ hơn chừng 911 nghìn ₫ trên 1 tỷ: lãi kép của hai vòng sáu tháng gần như bù hết 0,2 điểm phần trăm chênh lệch lãi suất năm.
- **Vấn đề:** Lãi kép của hai vòng chỉ bù được 54% thiệt hại của 0,2 điểm chênh lệch lãi suất, không phải gần như bù hết. Người đọc sẽ tưởng hai phương án gần như ngang nhau về lãi suất hiệu dụng, trong khi phần còn lại (911 nghìn) gần bằng phần đã bù (1,09 triệu). Các số đầu vào và nhãn ô (shortRate là %/năm) đều khớp calc; chỉ câu định lượng này sai. Bản en (dòng 424) sai y hệt.
- **Bằng chứng:** Probe gui-quay-vong: ví dụ −911.000 ₫ (finalShort 1.067.089.000, finalLong 1.068.000.000). Tách hai hiệu ứng: cho kỳ dài cùng 6,6% (longRate 6,6) → +1.089.000 ₫ = lợi thuần của lãi kép hai vòng; cho kỳ ngắn 12 tháng, không quay vòng (shortMonths 12) → −2.000.000 ₫ = thiệt thuần của 0,2 điểm lãi suất. Tỷ lệ bù 1.089.000 / 2.000.000 = 54,45%.
- **Sửa (vi):** Kết quả âm nên sổ kỳ dài thắng, hơn chừng 911 nghìn ₫ trên 1 tỷ. Chênh 0,2 điểm phần trăm lãi suất năm đáng 2 triệu ₫, còn lãi kép của hai vòng sáu tháng chỉ bù lại khoảng 1,09 triệu ₫, tức hơn một nửa, và chỉ khi vòng hai vẫn được 6,6%/năm. Khoảng cách ấy là cái giá của việc giữ được quyền lấy tiền ra trước 12 tháng.
- **Sửa (en):** The negative result means the long-term book wins, by about 911 thousand VND on 1 billion. The 0.2 percentage-point gap in annual rates is worth 2 million VND, while two rounds of six-month compounding win back only about 1.09 million VND of it, just over half, and only if the second round still earns 6.6%/year. That margin is the price of keeping the freedom to take the money out before 12 months.

#### `gia-von-trung-binh-dca` — Giá vốn trung bình khi mua DCA

**H3 · S2 · gây hiểu sai** — `explanation.commonMistakes` (src/core/formulas/planning.ts:671)

- **Trích:** Cộng các mức giá rồi chia ba, coi đó là giá vốn. Cách tính này bỏ qua số tiền khác nhau ở mỗi đợt, nên có thể lệch khá xa so với giá vốn thực — lệch theo hướng nào còn tuỳ đợt nào được rót nhiều tiền hơn.
- **Vấn đề:** Câu quy toàn bộ sai lệch cho việc số tiền mỗi đợt khác nhau, nên người mới kết luận sai cụ thể: mua DCA đúng nghĩa (mỗi đợt cùng số tiền) thì cộng giá chia ba vẫn ra đúng giá vốn. Thực tế sai lệch vẫn còn khi tiền bằng nhau (vì mỗi đợt mua được số cổ phiếu khác nhau), và khi tiền bằng nhau thì chiều lệch cố định (trung bình cộng luôn cao hơn hoặc bằng), trái với ý lệch theo hướng nào còn tuỳ đợt nào được rót nhiều tiền hơn. Chính ví dụ của công thức (ba đợt đều 10 triệu ₫) phản bác câu này, và note ví dụ giải thích đúng bằng số cổ phiếu. Câu cũ trước đợt sửa 11–13/09 nói đúng cơ chế (bỏ qua việc mỗi đợt mua được số cổ phiếu khác nhau); lần sửa chiều đã đổi luôn cơ chế.
- **Bằng chứng:** calc = Σ Cᵢ / Σ(Cᵢ/Pᵢ), trung bình điều hoà trọng số theo tiền. Probe: ví dụ (3 × 10 triệu ₫ ở 66.800/62.900/72.000) → 67.028 ₫, trung bình cộng 67.233 ₫; bộ mặc định (3 × 10 triệu ₫ ở 50.000/40.000/25.000) → 35.294 ₫, trung bình cộng 38.333 ₫, cao hơn 8,6%. Tiền bằng nhau thì AM ≥ HM nên chiều không đổi. Chỉ khi tiền khác nhau mới đổi chiều: amount3 = 50 triệu ở 72.000 → 69.782 ₫ (trên 67.233); amount2 = 50 triệu ở 62.900 → 64.605 ₫ (dưới 67.233).
- **Sửa (vi):** Cộng các mức giá rồi chia ba, coi đó là giá vốn. Cách này bỏ qua việc mỗi đợt mua được số cổ phiếu khác nhau: kể cả khi mỗi đợt rót cùng số tiền, đợt giá rẻ mua được nhiều cổ phiếu hơn nên giá vốn thực thấp hơn trung bình cộng, trừ khi các mức giá bằng nhau. Khi số tiền mỗi đợt khác nhau, sai lệch có thể theo cả hai hướng, tuỳ đợt nào được rót nhiều tiền hơn.
- **Sửa (en):** Adding up the prices and dividing by three, treating that as the cost basis. This ignores that each round buys a different number of shares: even when every round invests the same amount, the cheaper round buys more shares, so the real cost basis sits below the simple average unless all prices are equal. When the amounts differ, the error can go either way, depending on which round received more money.

**H11 · S3 · gây hiểu sai** — `explanation.whenToUse` (src/core/formulas/planning.ts:663)

- **Trích:** Sau vài đợt mua rải, để biết cổ phiếu phải về giá nào thì hoà vốn và đợt mua tiếp theo nên chờ vùng giá nào.
- **Vấn đề:** Giá vốn trung bình chưa gồm phí mua, phí bán và thuế bán, nên không phải giá hoà vốn. Người mới kết luận sai: bán đúng bằng giá vốn trung bình là không lỗ; thực tế vẫn lỗ khoảng 0,4%. Chính thư viện có công thức Giá hoà vốn thực mà commonMistakes gọi đúng niềm tin này là sai lầm. Bản en (dòng 664) cùng lỗi.
- **Bằng chứng:** Probe gia-hoa-von (quantity 1.000, months 0, buyPrice 67.028 = giá vốn ví dụ) → 67.296,78 ₫, cao hơn 268,8 ₫ (≈ 0,40%) do phí mua 0,15%, phí bán 0,15%, thuế bán 0,1%. fees.ts:701 (commonMistakes của gia-hoa-von): 'Lấy đúng giá mua làm mốc hoà vốn. Bán bằng giá mua là đã lỗ đúng bằng tổng chi phí.'
- **Sửa (vi):** Sau vài đợt mua rải, để biết giá bình quân đã trả cho mỗi cổ phiếu, làm mốc so với thị giá, và đợt mua tiếp theo nên chờ vùng giá nào. Muốn biết giá bán hoà vốn thật thì còn phải cộng phí mua, phí bán và thuế bán, xem công thức Giá hoà vốn thực.
- **Sửa (en):** After several staggered purchases, to know the average price paid per share as a mark against the market price, and what price range to wait for on the next purchase. The true break-even sell price also has to cover the buy fee, sell fee and sell tax; see the True break-even price formula.

#### `thue-tncn-dau-tu` — Thuế TNCN một giao dịch đầu tư trong năm

**H5 · S3 · câu sai** — `example.note` (src/core/formulas/planning.ts:1110)

- **Trích:** Thuế chuyển nhượng đánh trên giá bán nên vẫn phải nộp cả khi bán lỗ, còn thuế cổ tức chỉ đánh trên khoản thực nhận.
- **Vấn đề:** Thuế cổ tức tính trên số cổ tức công bố TRƯỚC thuế, không trên khoản thực nhận. Trong chính sản phẩm, thực nhận là số sau thuế (tiền về tài khoản), nên câu nói sai cơ sở tính thuế và mâu thuẫn bảng ký hiệu ngay cạnh hình (D trước thuế, r_ct tính trên số cổ tức công bố). Người đọc tính lại theo câu này sẽ ra 47.500 ₫ thay vì 50.000 ₫. Bản en (dòng 1111) cùng lỗi.
- **Bằng chứng:** calc planning.ts:1155 và 1175: dividendTax = quantity × dividendPerShare × 5%, với dividendPerShare là cổ tức trước thuế (mô tả ô dòng 1079; ký hiệu D dòng 1029; r_ct dòng 1036). Ví dụ: 5% × 1.000 CP × 1.000 ₫ = 50.000 ₫ (probe, extras.dividendTax); nếu tính trên khoản thực nhận 950.000 ₫ thì ra 47.500 ₫. Nghĩa thực nhận = sau thuế trong repo: fees.ts:459 (1,900,000 ₫ reaching the account sau khi trừ 100.000 ₫ thuế), returns.ts:489, performance.ts:610.
- **Sửa (vi):** Thuế chuyển nhượng đánh trên giá bán nên vẫn phải nộp cả khi bán lỗ, còn thuế cổ tức chỉ phát sinh khi có cổ tức và tính trên số cổ tức công bố, trước thuế.
- **Sửa (en):** Transfer tax is charged on the sale value and so applies even on a losing sale, while dividend tax arises only when a dividend is paid and is charged on the announced amount before tax.

**H6 · S3 · câu sai** — `example.note` (src/core/formulas/planning.ts:1110)

- **Trích:** Gồm 72.700 ₫ thuế chuyển nhượng và 50.000 ₫ thuế cổ tức, cả hai đều do công ty chứng khoán khấu trừ tại nguồn nên cá nhân không phải tự kê khai.
- **Vấn đề:** Chỉ thuế chuyển nhượng do công ty chứng khoán khấu trừ. Thuế cổ tức tiền mặt do bên TRẢ thu nhập (doanh nghiệp chi trả cổ tức, ở đây FPT) khấu trừ trước khi chuyển tiền cổ tức qua VSDC về tài khoản. Hai con số và kết luận không phải tự kê khai vẫn đúng; sai ở chủ thể khấu trừ. Bản en (dòng 1111) cùng lỗi.
- **Bằng chứng:** Thông tư 111/2013/TT-BTC Điều 25 khoản 1: thu nhập từ đầu tư vốn do tổ chức, cá nhân trả thu nhập khấu trừ trước khi trả; thu nhập chuyển nhượng chứng khoán do công ty chứng khoán, ngân hàng lưu ký, công ty quản lý quỹ khấu trừ 0,1% giá chuyển nhượng từng lần. Chưa đối chiếu văn bản hướng dẫn Luật 109/2025/QH15; nguyên tắc bên trả thu nhập khấu trừ tại nguồn không thấy lý do đổi. Cùng câu sai nằm ở fees.ts:474 (thue-co-tuc, ngoài lô H).
- **Sửa (vi):** Gồm 72.700 ₫ thuế chuyển nhượng do công ty chứng khoán khấu trừ khi lệnh bán khớp và 50.000 ₫ thuế cổ tức do doanh nghiệp trả cổ tức khấu trừ trước khi chuyển tiền, nên cá nhân không phải tự kê khai.
- **Sửa (en):** It combines 72,700 ₫ of transfer tax, withheld by the broker when the sell order matches, and 50,000 ₫ of dividend tax, withheld by the paying company before the money is transferred, so an individual files nothing.

**H7 · S3 · câu sai** — `explanation.howToRead` (src/core/formulas/planning.ts:1094)

- **Trích:** Biểu đồ bóc tách bên dưới tách riêng phần đến từ bán và phần đến từ cổ tức.
- **Vấn đề:** Trên màn đang chạy không có biểu đồ bóc tách nào bên dưới mục này. (1) Công thức khai chartType stackedBar nên biểu đồ MẶC ĐỊNH là đường quét; bóc tách chỉ là mục “Bóc tách” trong ô chọn trục, phải bấm mới thấy. (2) Dưới 1280px khối Biểu đồ đứng TRÊN khối Giải thích; từ 1280px Giải thích ở cột trái, Biểu đồ ở cột phải. Người đọc cuộn xuống sẽ gặp Bảng biến và Ví dụ, không có biểu đồ bóc tách. Bản en (dòng 1095) cùng lỗi.
- **Bằng chứng:** src/core/chart/build.ts:575: breakdownFirst = breakdownReady && spec.chartType === 'waterfall', nên stackedBar vẽ đường quét trước; nhãn mục src/core/chart/breakdown.ts:20 ('Bóc tách'), nhãn ô chọn src/application/i18n/vi.ts:443 ('Xem kết quả đổi theo'). Thứ tự khối: src/app/cong-thuc/[id]/FormulaDetail.module.css:803 (Số liệu → Kết quả → Biểu đồ → Giải thích ở khổ hẹp, qua order dòng 827–831) và dòng 846–850 (khổ 1280: Giải thích cột trái, Biểu đồ cột phải).
- **Sửa (vi):** So tổng thuế này với phần lãi hoặc lỗ thực tế từ giao dịch, để thấy thuế chiếm bao nhiêu trong khoản tiền nhận về. Ở khối Biểu đồ, chọn “Bóc tách” trong ô “Xem kết quả đổi theo” để tách riêng phần đến từ bán và phần đến từ cổ tức.
- **Sửa (en):** Compare this total tax with the actual gain or loss from the transaction, to see how much of the money you receive it takes up. In the Chart block, choose “Breakdown” under “See how the result changes with” to separate the portion from the sale from the portion from the dividend.

**H8 · S3 · ví dụ** — `example.title, example.source` (src/core/formulas/planning.ts:1104)

- **Trích:** 1.000 CP FPT: nhận cổ tức 1.000 ₫/CP trong năm rồi bán giá 72.700 ₫ — quyết toán 2026 | Luật Thuế TNCN 2025 số 109/2025/QH15 hiệu lực 01/07/2026; giá FPT phiên 11/09/2026 và cổ tức đợt 02/12/2025.
- **Vấn đề:** Kỳ của ví dụ lệch nhau. Tiêu đề (dòng 1104) và description công thức nói cổ tức nhận trong năm, quyết toán 2026; nguồn (dòng 1114) lại ghi cổ tức đợt 02/12/2025, tức năm 2025 và trước ngày Luật 109/2025/QH15 mà chính nguồn dẫn làm căn cứ có hiệu lực. Con số không đổi vì luật cũ cũng 5%, nhưng ví dụ đang cộng thuế của hai năm khác nhau vào một tổng trong năm. Phụ: tiêu đề en ghi 2026 filing trong khi note nói an individual files nothing.
- **Bằng chứng:** Chuỗi FPT_57_BARS xác nhận giá bán: 11/09/2026 đóng cửa 72.700 ₫ (market-series-2026.ts:118). Probe thue-tncn-dau-tu với asOf 2025-12-02 → 122.700 ₫ như ví dụ, tra bản ghi tiền nhiệm Luật 04/2007/QH12 (schedules.ts:106–115), không phải Luật 109/2025/QH15.
- **Sửa (vi):** Tiêu đề: 1.000 CP FPT: nhận cổ tức 1.000 ₫/CP rồi bán giá 72.700 ₫, cả hai trong năm 2026. Nguồn: Luật Thuế TNCN 2025 số 109/2025/QH15 hiệu lực 01/07/2026; giá FPT phiên 11/09/2026; mức cổ tức lấy theo đợt trả 02/12/2025, giả định năm 2026 trả mức tương tự.
- **Sửa (en):** Title: 1,000 FPT shares: receiving a 1,000 ₫/share dividend then selling at 72,700 ₫, both within 2026. Source: Personal Income Tax Law 2025 No. 109/2025/QH15, effective 2026-07-01; FPT’s price on 2026-09-11; the dividend amount follows the 2025-12-02 payment, assuming a similar payment in 2026.

**H9 · S3 · cảnh báo** — `calc warning (MEANINGLESS).fix` (src/core/formulas/planning.ts:1167)

- **Trích:** Nhập giá bán hoặc cổ tức lớn hơn 0.
- **Vấn đề:** Cảnh báo kích hoạt khi giá trị bán và giá trị cổ tức cùng bằng 0, mà điều đó xảy ra cả khi Khối lượng = 0 (ô có min 0). Lúc ấy giá bán và cổ tức đã lớn hơn 0 sẵn, nên lời khuyên chỉ người dùng tới hai ô không có lỗi và bỏ qua đúng ô gây lỗi.
- **Bằng chứng:** planning.ts:1153–1157: sellValue = q × sellPrice, dividendValue = q × dividendPerShare, điều kiện sellValue === 0 && dividendValue === 0. Probe quantity 0 (giá bán 72.700, cổ tức 1.000) → MEANINGLESS, fix 'Nhập giá bán hoặc cổ tức lớn hơn 0.'
- **Sửa (vi):** Nhập khối lượng lớn hơn 0, cùng giá bán hoặc cổ tức lớn hơn 0.
- **Sửa (en):** Enter a quantity greater than 0, together with a sale price or dividend greater than 0.
