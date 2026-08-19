# Hồ sơ đối chiếu thuế & phí — gói WBS 5.1.1

Trạng thái: **ĐÓNG — gói 5.1.1 hoàn tất ngày 17/08/2026.**

Hai vòng nối nhau: máy tra trên nguồn mở (14/08/2026, 6 lượt tra độc lập, 92 lần truy vấn) dựng
nên hồ sơ này và chủ dự án duyệt trọn Q1–Q7; sau đó **chủ dự án đối chiếu bản gốc có dấu và xác
nhận** — kể cả hai mốc hiệu lực của bản ghi thuế tiền nhiệm (01/01/2015 và 01/01/2009), thứ mà
vòng máy không tra được. Nhãn BẢN THẢO trên `schedules.ts` đã gỡ theo đó.

Hồ sơ giữ lại làm **dấu vết nguồn**, không phải việc còn tồn: nó là thứ trả lời "vì sao con số
này đáng tin" khi có người hỏi lại, và là điểm xuất phát cho lần rà sau — mỗi hằng số ở đây đều
sẽ hết hạn khi văn bản pháp luật đổi.

## Kết luận một dòng

**Cả 7 con số đều khớp nguồn. Nhưng 4/7 bản ghi sai ở phần căn cứ — ngày hiệu lực hoặc văn bản
pháp lý** — đúng loại lỗi mà LDR-03 sinh ra `legalBasis` để tránh.

| #   | Khoá                          | Giá trị        | Số đúng?                 | Ngày đúng?     | Căn cứ đúng?               |
| --- | ----------------------------- | -------------- | ------------------------ | -------------- | -------------------------- |
| 1   | `fee.brokerage.buy` / `.sell` | 0,15 %         | ✔ (mức tự chọn, hợp lệ) | ✔             | ✘ — thông tư đã bị thay    |
| 2   | `tax.transfer.sell`           | 0,1 %          | ✔                       | ✔             | ✔                         |
| 3   | `tax.dividend.cash`           | 5 %            | ✔                       | ✔             | ✔                         |
| 4   | `fee.custody`                 | 0,27 ₫/CP/th   | ✔                       | ✘ — 01/01/2022 | ✘ — thông tư đã bị thay    |
| 5   | `market.settlement.days`      | 2 ngày         | ✔                       | ✔             | ✘ — nhầm HOSE, đúng là VSD |
| 6   | `derivative.vn30f.multiplier` | 100.000 ₫/điểm | ✔                       | ✔             | ✘ — nhầm HOSE, đúng là HNX |

## Từng dòng

### 1. Phí môi giới 0,15% — số đúng, căn cứ đã hết hiệu lực

Ba khẳng định của code đều đúng với Thông tư 128/2018/TT-BTC: hiệu lực 15/02/2019, chỉ đặt **trần**
0,5% và bỏ mức sàn, không ấn định 0,15% (con số 0,15% trong thông tư ấy thuộc mục giám sát tài sản
quỹ, không liên quan). Chi tiết lịch sử đáng biết: 0,15% từng là mức **sàn** của Thông tư
242/2016 — nhiều khả năng là gốc của "mức phổ biến" mà thị trường quen dùng.

Nhưng **Thông tư 128/2018 đã bị thay** bởi **Thông tư 102/2021/TT-BTC** (Điều 4: hiệu lực
01/01/2022, thay thế 128/2018), và trần môi giới **giảm 0,5% → 0,45%**, vẫn không sàn. Câu
`legalBasis` đang trích một mức trần không còn tồn tại.

- Nguồn: toàn văn 128/2018 và 102/2021 trên luatvietnam.vn; antt.vn về việc bỏ sàn.
- Chưa xác minh: 102/2021 còn nguyên hiệu lực tới 2026 không (chưa tra tình trạng của chính nó).

### 2 & 3. Hai mức thuế — khớp trọn, kể cả luật rất mới

Đây là căn cứ rủi ro nhất (luật mới hơn một tháng so với hiện tại) nên được tra hai lượt độc lập,
lượt hai với đề bài "cố chứng minh lượt một sai". Cả hai cùng ra một kết quả:

- **Luật Thuế TNCN số 109/2025/QH15 có thật** — Quốc hội khoá XV, kỳ họp 10, thông qua 10/12/2025,
  thay Luật 04/2007/QH12. Nguồn: Cổng TTĐT Chính phủ, trang Bộ Tài chính (nief.mof.gov.vn).
- **Hiệu lực đúng 01/07/2026** (Điều 29). Ngoại lệ về kinh doanh/tiền lương không chạm phần app dùng.
- **Chuyển nhượng chứng khoán vẫn 0,1% trên giá bán từng lần** (Điều 13 khoản 2 — hai trang đăng
  lại luật trích trùng nhau từng chữ). Mức 20%-trên-lãi chỉ áp cho chuyển nhượng VỐN GÓP, không
  phải chứng khoán; đề xuất 20% cho cổ phần chưa niêm yết chỉ nằm ở dự thảo tháng 3/2026, bản
  Nghị định 253/2026/NĐ-CP chính thức không có.
- **Cổ tức tiền mặt vẫn 5%** (Điều 12).

Hai điểm mới của luật **chưa phản ánh trong app**, không sai nhưng nên cân nhắc cho phần diễn giải
của `thue-co-tuc` và `thue-tncn-dau-tu`: (a) giảm 50% thuế với lợi tức được chia từ quỹ đầu tư
chứng khoán/bất động sản; (b) miễn thuế chuyển nhượng chứng chỉ quỹ mở nắm giữ từ 2 năm.

- Chưa xác minh: bản gốc có dấu của luật (thuvienphapluat.vn chặn máy — 403); số điều trong Nghị
  định 253/2026/NĐ-CP và Thông tư 87/2026/TT-BTC.

### 4. Phí lưu ký — số đúng, NGÀY SAI, căn cứ đã bị thay

0,27 ₫/CP/tháng đúng (toàn văn Thông tư 101/2021 + biểu phí SSI thu hộ VSDC), đơn vị đúng, và đúng
là có phân biệt: trái phiếu doanh nghiệp 0,18 ₫ (trần 2 triệu/tháng/mã), công cụ nợ công 0,14 ₫
(trần 1,4 triệu) — app chỉ tính cổ phiếu nên không đụng.

**`effectiveFrom: '2022-02-27'` sai.** Thông tư 101/2021/TT-BTC hiệu lực **01/01/2022**; tìm thẳng
cụm "27/02/2022" + "101/2021/TT-BTC" không ra bất kỳ nguồn nào. Nghi vấn hợp lý nhất: ngày bị chép
lẫn từ chính con số **0,27**. Ngoài ra 101/2021 nay đã bị thay bởi **Thông tư 83/2024/TT-BTC**
(chuyển sang cơ chế VNX/VSDC tự ban hành biểu giá); biểu phí SSI hiện hành vẫn ghi 0,27 ₫ nhưng
chưa đối chiếu trực tiếp văn bản VSDC ban hành theo cơ chế mới.

### 5. Chu kỳ T+2 — số và ngày đúng, căn cứ nhầm cơ quan

T+2 từ **29/08/2022** đúng (Cổng TTĐT Chính phủ: hoàn tất thanh toán rút từ 16h00 về 11h30 ngày
T+2, tiền/chứng khoán về trước 13h). Nhưng văn bản đặt ra nó là **Quyết định 109/QĐ-VSD** — quy chế
bù trừ và thanh toán của **VSD** — không phải "Quy chế giao dịch của HOSE" như code ghi: quy chế
HOSE chỉ điều chỉnh khâu khớp lệnh. Văn bản hiện hành là Quyết định 39/QĐ-HĐTV 29/04/2025 của VSDC
(ban hành sau khi KRX vận hành 05/2025), vẫn ghi T+2 cho cổ phiếu. CCP dự kiến **quý I/2027** —
chưa có gì đổi sang T+1.

### 6. Hệ số nhân VN30F — số và ngày đúng, căn cứ nhầm sở

100.000 ₫/điểm đúng, áp từ phiên khai trương 10/08/2017 đúng. Nhưng hợp đồng tương lai VN30 niêm
yết tại **HNX** — cả ba nguồn (Báo Đầu tư, Cổng TTĐT Chính phủ, Tạp chí Ngân hàng) đều ghi thị
trường phái sinh vận hành tại Sở GDCK **Hà Nội**. HOSE chỉ là nơi tính chỉ số cơ sở VN30. Ghi
"Quy chế của HOSE" là chỉ nhầm cơ quan ban hành.

## Hai khoảng trống NỘI BỘ thấy khi soi code (không cần mạng)

- **Hai hằng số thuế không có bản ghi tiền nhiệm.** `resolveConstant()` loại bản ghi có
  `effectiveFrom > asOf`, mà `tax.transfer.sell` và `tax.dividend.cash` chỉ có đúng một bản từ
  01/07/2026 — đặt `asOf` trước ngày đó là công thức báo "thiếu hằng số". Hôm nay không sao vì
  `asOf` là ngày build (luôn sau 01/07/2026), nhưng docblock của `resolve.ts` hứa "người dùng phải
  tính lại được một giao dịch cũ theo đúng biểu phí thời điểm đó" — muốn giữ lời hứa ấy thì cần
  thêm bản ghi cũ (cùng 0,1% / 5%, căn cứ Luật 04/2007/QH12 sửa đổi).
- Cả 7 bản ghi qua được `validateMarketConfig()` — validator chỉ bắt thiếu trường, không bắt sai
  nội dung. Đúng vai: nội dung là việc của hồ sơ này.

## Cách tra và giới hạn

Sáu lượt tra độc lập chạy song song, mỗi văn bản một lượt; riêng luật thuế mới thêm một lượt phản
biện được giao đề bài "cố chứng minh kết quả kia sai". Luật chỉ nhận là KHỚP khi có nguồn nêu rõ
con số/ngày; không tìm được thì ghi "chưa xác minh" chứ không đoán. Nguồn ưu tiên: Cổng TTĐT Chính
phủ, trang Bộ Tài chính, luatvietnam.vn (toàn văn), VSD/VSDC, báo lớn. **thuvienphapluat.vn chặn
máy (403) trong mọi lượt**, nên không lượt máy nào đọc được bản gốc có dấu — chính vì thế vòng
người đọc bản gốc là bắt buộc, và nó đã chạy ngày 17/08/2026.

Mọi ghi chú "chưa xác minh" rải trong mục "Từng dòng" là ghi chú của **vòng máy**, giữ nguyên
làm dấu vết chứ không phải việc còn tồn — chúng nói cho lần tra sau biết chỗ nào vòng máy không
tới được.

Một sự cố phương pháp đáng ghi cho lần tra sau: một lượt đọc trang luatvietnam trả về kết luận
"Điều 11 áp 20% cho cả cổ tức lẫn chứng khoán" — đọc lại chính trang đó với yêu cầu chặt hơn thì
trang KHÔNG hề ghi vậy (các mức 5–35% trên trang thuộc biểu luỹ tiến tiền lương). Kết quả đọc máy
đơn lẻ mà trái với nhiều nguồn khác thì phải đọc lại trước khi tin.

## Bảng quyết định — duyệt trọn 14/08/2026, đã áp vào code, đóng 17/08/2026

Ghi chú khi áp: Q5 dùng hai mốc `2015-01-01` (Luật 71/2014/QH13 — thời điểm 0,1%/lần thành cách
tính duy nhất) và `2009-01-01` (Luật 04/2007/QH12 hiệu lực — cổ tức 5%). Hai mốc này KHÔNG nằm
trong 7 con số máy tra được — chúng do người viết điền từ kiến thức nền, và **chủ dự án đã kiểm
lại trên bản gốc ở vòng rà 17/08/2026, xác nhận đúng cả hai**. Trước hai mốc ấy app cố ý báo
"thiếu hằng số": giai đoạn 2009–2014 tồn tại song song hai cách tính thuế chuyển nhượng nên
không mô hình bằng một con số được.

| #   | Đề xuất sửa trong `schedules.ts`                                                                                                                                    | Quyết |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Q1  | Hai dòng môi giới: `legalBasis` → "Thông tư 102/2021/TT-BTC — mức trần phí môi giới 0,45%", `effectiveFrom` → `2022-01-01`. Giá trị 0,15% giữ nguyên                | ☑    |
| Q2  | `fee.custody`: `effectiveFrom` → `2022-01-01`; `legalBasis` thêm vế "được giữ trong biểu giá VSDC theo cơ chế Thông tư 83/2024/TT-BTC" sau khi đối chiếu trang VSDC | ☑    |
| Q3  | `market.settlement.days`: `legalBasis` → "Quy chế bù trừ và thanh toán của VSD — Quyết định 109/QĐ-VSD 19/08/2022 (hiện hành: Quyết định 39/QĐ-HĐTV 2025 của VSDC)" | ☑    |
| Q4  | `derivative.vn30f.multiplier`: `legalBasis` đổi HOSE → **HNX** (mẫu hợp đồng do HNX xây dựng, UBCKNN chấp thuận)                                                    | ☑    |
| Q5  | Thêm bản ghi tiền nhiệm cho hai hằng số thuế (0,1% / 5%, căn cứ Luật 04/2007/QH12 sửa đổi, `effectiveFrom` ngày cũ) để tra được giao dịch trước 01/07/2026          | ☑    |
| Q6  | Ghi chú hai ưu đãi mới của Luật 109/2025 (giảm 50% quỹ đầu tư, miễn CCQ mở ≥ 2 năm) vào diễn giải `thue-co-tuc` / `thue-tncn-dau-tu` — hoặc chốt là ngoài phạm vi   | ☑    |
| Q7  | Gỡ nhãn "BẢN THẢO" trên đầu `schedules.ts` — chỉ khi người rà đã đối chiếu bản gốc có dấu (vbpl.vn / Công báo), vì hồ sơ này toàn nguồn thứ cấp                     | ☑    |

Cả bảy dòng đã duyệt và áp. Q1–Q6 áp ngày 14/08/2026; Q7 gỡ ngày 17/08/2026 sau khi chủ dự án
đối chiếu bản gốc.

## Lần rà sau bắt đầu từ đâu

Hồ sơ này đóng, nhưng hằng số thì không đứng yên. Ba chỗ đã biết là sẽ phải tra lại:

- **Thông tư 102/2021** — hồ sơ chưa tra tình trạng hiệu lực của chính nó (mục 1 ghi rõ). Nếu có
  văn bản thay nó thì trần phí môi giới đổi, và `SOURCE_FEE_CIRCULAR` ở `formulas/shared.ts` phải
  đổi theo — một ca kiểm trong `market.test.ts` bắt hai nơi trích cùng số thông tư.
- **Biểu giá VSDC** — phí lưu ký 0,27 ₫ nay do VSDC ban hành theo cơ chế Thông tư 83/2024, tức là
  đổi được mà không cần sửa luật.
- **Chu kỳ thanh toán** — T+2 là quy chế của VSDC, không phải luật; thị trường đang bàn T+1.

Cách làm lần sau: đọc mục "Từng dòng" để biết nguồn nào đã tra và tra bằng cách nào, rồi chỉ tra
lại phần đã đổi. Đừng bỏ vòng người đọc bản gốc — vòng máy chỉ tới được nguồn thứ cấp.
