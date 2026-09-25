# Đánh giá wireframe câu hỏi & ngân hàng câu hỏi 111 công thức

**Ngày:** 23/09/2026
**Kèm theo:** `NGAN HANG CAU HOI - 111 cong thuc.xlsx` (206 câu, 177 nguồn) ·
`WF-19D-kieu-danh-gia-bo-sung.svg`

---

## 1. Kết luận

Wireframe WF-19 dựng đúng về mặt giao diện nhưng **khuôn nội dung của nó không sống được với
tư liệu thật**. Khuôn đó quy định mỗi công thức có 5 câu chia sẵn: 1 định nghĩa, 2 cách tính,
2 điều kiện áp dụng. Khi đi tìm nguồn thật cho cả 111 công thức, phân bố ra thế này:

| Số câu tìm được | Số công thức |
| --------------- | ------------ |
| 0 câu           | 1            |
| 1 câu           | 49           |
| 2 câu           | 38           |
| 3 câu           | 15           |
| 4 câu           | 4            |
| 5 câu           | 4            |

**88 trên 111 công thức chỉ có một hoặc hai chỗ mà người dùng thật sự hay hiểu sai.** Ép đủ 5
câu cho từng công thức nghĩa là phải bịa ra 3–4 câu cho mỗi công thức trong số đó — đúng thứ
cần tránh. Khuôn 5 câu phải bỏ; số câu đi theo tư liệu.

---

## 2. Wireframe hiện tại — giữ gì, sửa gì

### Giữ nguyên

Bộ trạng thái tương tác (nghỉ, đang làm, đúng, sai, tổng kết, rỗng), token màu, nút cao 44,
quy tắc khoá lựa chọn sau khi trả lời, và cách hộp giải thích khi sai dùng bộ cảnh báo của
WF-15. Phần này không có vấn đề gì.

### Ba chỗ phải sửa

**a. Khuôn 5 câu cố định** — lý do ở mục 1. Thay bằng: số câu theo số nguồn tìm được, và thêm
trạng thái cho công thức chỉ có 1–2 câu (WF-19D · S18). Ẩn thanh tiến độ 5 vạch khi dưới 3 câu.

**b. Nhãn nhóm câu không phủ hết** — nhãn cũ (Định nghĩa · Cách tính · Điều kiện áp dụng)
không mô tả nổi hai loại câu chiếm **65 trên 206 câu**:

- **31 câu quy định thị trường VN**: thuế 0,1% trên giá bán, phí lưu ký theo số lượng cổ
  phiếu, giới hạn 5.000 hợp đồng phái sinh với cá nhân, lãi suất rút trước hạn. Những câu này
  không có "ngộ nhận để bác bỏ" — chỉ có biết hoặc không biết.
- **34 câu hậu quả bằng tiền**: hiểu sai thì mất bao nhiêu. Ví dụ rõ nhất là phiên đáo hạn
  21/05/2020: mua giá trần 864 điểm, thanh toán về VN30 815,55 điểm, lỗ 4,845 triệu đồng một
  hợp đồng ngay trong ngày.

**c. Hộp giải thích không có chỗ trích nguồn** — đây là chỗ hỏng nặng nhất. Toàn bộ 206 câu
đều xuất phát từ một nguồn cụ thể; nếu app chỉ nói "đáp án C đúng vì..." mà không cho thấy ai
nói thế, người học không kiểm chứng được và đội nội dung sẽ dần soạn câu theo cảm tính.
WF-19D · S14 bổ sung khối trích nguồn: câu trích nguyên văn, đường dẫn, và chip loại nguồn.

---

## 3. Năm kiểu đánh giá thay cho khuôn cũ

Mỗi công thức cần kiểm tra một năng lực khác nhau, và tư liệu thật cho thấy rõ năng lực đó là
gì. Năm kiểu, phân bố trong 206 câu:

| Mã  | Kiểu                   | Kiểm tra điều gì                  | Số câu |
| --- | ---------------------- | --------------------------------- | ------ |
| D1  | Đọc kết quả            | con số này nói gì và KHÔNG nói gì | 43     |
| D2  | Điều kiện áp dụng      | trường hợp nào không dùng được    | 49     |
| D3  | Quy ước tính toán      | tham số, thứ tự, đơn vị dễ sai    | 49     |
| D4  | Quy định thị trường VN | luật, phí, giới hạn               | 31     |
| D5  | Hậu quả bằng tiền      | quyết định sai mất bao nhiêu      | 34     |

Điểm quan trọng: **mỗi nhóm công thức nghiêng hẳn về một hai kiểu**, chứ không rải đều.

- **Phí & thuế** (9 công thức, 19 câu): gần như toàn bộ là D4. Hỏi "định nghĩa phí lưu ký" là
  vô nghĩa; phải hỏi "phí lưu ký tính trên số lượng hay giá trị" — vì đó là chỗ lập trình sai
  và người dùng hiểu sai.
- **Định giá** (22 công thức, 46 câu): nghiêng về D1 và D2. Cách tính P/E đơn giản tới mức
  không đáng hỏi hai câu; cái khó là điều kiện áp dụng và cách đọc kết quả.
- **Phái sinh** (7 công thức, 20 câu): nghiêng về D5 và D4. Đây là nhóm mà hiểu sai mất tiền
  nhanh nhất, và cũng là nhóm có nhiều quy định cứng nhất.
- **Phân tích kỹ thuật** (18 công thức, 29 câu): nghiêng về D1 và D3. Tư liệu rất dày về việc
  đọc sai tín hiệu (RSI trên 70, chạm dải Bollinger) và tính sai tham số (làm mượt Wilder).
- **Rủi ro** (18 công thức, 28 câu): nghiêng về D2 và D3 — điều kiện áp dụng và quy ước tính.

---

## 4. Ngân hàng câu hỏi — cách làm và những gì có được

**206 câu, 177 nguồn riêng biệt, phủ 110/111 công thức.**

Quy tắc soạn: mỗi câu phải xuất phát từ một ngộ nhận hoặc quy định **đọc được trong nguồn
thật**. Không câu nào được nghĩ ra cho đủ số.

Hai tầng bằng chứng, ghi rõ trong file:

- **Tầng A — ngộ nhận có ghi chép thật** (174 câu): có người viết ra rằng người ta hiểu sai thế
  nào. Ví dụ: bài CafeF về nghịch lý P/E thấp của cổ phiếu thép dẫn số thật HPG 3,41 lần sau khi
  giá đã giảm 59%; AZFin phân tích GMD 2018 có P/E 4,42 trong khi P/E cốt lõi khoảng 17 lần vì
  1.350 trên 1.830 tỷ lợi nhuận đến từ bán tài sản.
- **Tầng B — quy định hoặc chuẩn chuyên môn** (32 câu): không phải ngộ nhận quan sát được,
  nhưng là kiến thức bắt buộc đúng. Ví dụ: Luật Thuế TNCN số 109/2025/QH15 Điều 13 khoản 2 giữ
  mức 0,1% trên giá chuyển nhượng cho chứng khoán niêm yết.

Theo loại nguồn: 97 câu từ chuyên gia, 73 từ tài liệu giáo khoa, 20 từ văn bản quy định và
biểu phí công bố, 16 từ người thật kể lại hoặc báo chí vụ việc. **107 trên 206 câu có bối cảnh
Việt Nam trực tiếp.**

Vài nguồn đắt giá nhất:

- Phiên đáo hạn phái sinh 21/05/2020 — có đủ số liệu đối chiếu (864 so với 815,55 điểm;
  4,845 triệu so với 0,805 triệu mỗi hợp đồng; gần 17,5 tỷ chuyển từ bên mua sang bên bán).
- Nhà sáng lập FinPeace kể lại việc cháy tài khoản mất khoảng 1 triệu USD vì "all in full
  margin" — dùng cho câu về cỡ lệnh rủi ro.
- Phóng sự CafeF và Tuổi Trẻ về vay tiêu dùng tính lãi trên dư nợ gốc ban đầu: lãi suất thực
  gần gấp đôi con số hợp đồng, có trường hợp quy đổi lên 49,68%/năm.
- Quy tắc số 6 trong bộ 22 quy tắc chính thức của John Bollinger: chạm dải trên **không** phải
  tín hiệu bán — nguồn gốc, không phải diễn giải lại.

---

## 5. Những gì KHÔNG có — ghi ra để không ai tưởng là đủ

- **`tiet-kiem-muc-tieu` không có câu nào.** Không tìm được nguồn nào bàn về việc người dùng
  hiểu sai công thức tiết kiệm theo mục tiêu. Để trống, dùng trạng thái rỗng.
- **49 công thức chỉ có 1 câu.** Không phải vì làm ẩu mà vì tư liệu chỉ có thế. Cần thêm thì
  phải tìm thêm nguồn, không phải nghĩ thêm câu.
- **f319.com và voz.vn không truy cập được** trong đợt này. Phần "người thật kể lại" thay thế
  bằng báo chí vụ việc (CafeF, Tuổi Trẻ, VietnamFinance, TinnhanhChungkhoan) và diễn đàn
  TraderViet. Nếu muốn thêm chất liệu diễn đàn, cần cách tiếp cận khác.
- **Các câu trích trong cột Giải thích cần kiểm chứng lại.** Chúng được lấy qua công cụ đọc
  trang; phần lớn là nguyên văn nhưng một số ít có thể đã bị diễn đạt lại. Trước khi in vào sản
  phẩm, mở lại URL đối chiếu từng câu. File đã ghi cảnh báo này ở sheet Hướng dẫn.
- **Ba chỗ tư liệu mỏng, nên dùng ở dạng câu kiến thức thay vì câu bác bỏ ngộ nhận:**
  `bien-do-dao-dong-lon-nhat` (chỉ có nguồn mô tả quy định biên độ, không nguồn nào gọi việc so
  biên độ xuyên sàn là sai lầm), `ev-sales` và `ncav-tren-co-phieu` (mỗi cái một nguồn, không có
  bối cảnh VN).

---

## 6. Hai rủi ro sản phẩm phát hiện được trong lúc soạn

**a. Quy ước dấu của basis.** Tài liệu giáo khoa quốc tế dùng `Basis = Spot − Futures`, còn bản
tin phái sinh trong nước dùng `basis = giá HĐTL − chỉ số cơ sở`. Hai quy ước ngược dấu nhau. App
phải nêu rõ mình dùng quy ước nào, nếu không người dùng đọc "basis âm" sẽ hiểu ngược trạng thái
thị trường.

**b. Câu hỏi quy định có hạn dùng.** 31 câu D4 gắn với văn bản cụ thể. Luật Thuế TNCN
109/2025/QH15 hiệu lực 01/7/2026; đề xuất đánh 20% trên lãi cổ phiếu chưa niêm yết vẫn đang là
dự thảo; tỷ lệ ký quỹ phái sinh dao động 13–20% theo thời điểm. Những câu này cần trường "ngày
hiệu lực" và quy trình rà lại, không thể soạn một lần rồi để đó.

---

## 7. Việc cần chốt

1. **Bỏ khuôn 5 câu cố định**, chấp nhận ngân hàng câu hỏi không đều giữa các công thức.
2. **Khối trích nguồn có bắt buộc hiện không** — đề xuất là có, vì nó vừa để người học kiểm
   chứng vừa giữ kỷ luật cho đội nội dung.
3. **Thứ tự phát hành.** Đề xuất theo độ dày tư liệu chứ không theo thứ tự nhóm: định giá và
   phân tích kỹ thuật trước (dày nhất, cũng là nơi người dùng vào nhiều nhất), phí & thuế và
   phái sinh sau (ít câu hơn nhưng giá trị cao vì gắn tiền thật).
4. **Ai rà câu quy định và bao lâu một lần.**
5. **Bản tiếng Anh (FR-08).** 206 câu × 4 lựa chọn × phần giải thích — khối lượng dịch lớn, và
   phần lớn nguồn là tiếng Việt nên không dịch máy được phần trích dẫn.
