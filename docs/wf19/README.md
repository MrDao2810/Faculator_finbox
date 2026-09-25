# WF-19 — Khối "Kiểm tra hiểu bài"

Tài liệu của gói triển khai ngày 23/09/2026. Mã nguồn nằm ở `src/core/quiz/`,
`src/application/quiz*.ts` và `src/ui/quiz/`.

## Vì sao có thư mục `docs/` — tiền lệ mới, cố ý

Mọi tài liệu khác của kho nằm CẠNH mã nguồn nó nói về (`src/core/formulas/README.md`,
`REVIEW.md`, `src/core/market/README.md`), và ngoài `public/` thì kho không có file nhị phân nào.
Thư mục này phá cả hai nếp, vì tư liệu ở đây không mô tả mã nguồn mà là **thứ mã nguồn được rút ra
từ đó**: bản vẽ của người thiết kế và bảng tính 206 câu đợt đầu kèm 177 đường dẫn nguồn. Mất nó thì không
ai kiểm chứng được câu hỏi, cũng không ai biết vì sao khuôn "5 câu mỗi công thức" bị bỏ.

Đặt chúng trong `src/` thì lẫn với mã, còn để ngoài kho thì lần sau không ai tìm thấy. Chủ dự án
chốt commit vào kho ngày 23/09/2026.

| File                                         | Nội dung                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| `WF-19-kiem-tra-hieu-bai-luong-chinh.svg`    | Luồng chính: nghỉ, đang làm, đúng, sai                                   |
| `WF-19B-bien-the-va-tong-ket.svg`            | Biến thể đề bài có khối số liệu, tổng kết, trạng thái rỗng               |
| `WF-19C-dang-mo-rong-v02.svg`                | Dạng điền số — **đã dựng 23/09/2026**, thêm dạng chọn nhiều; Đúng/Sai bỏ |
| `WF-19D-kieu-danh-gia-bo-sung.svg`           | Khối trích nguồn, câu quy định, câu hậu quả bằng tiền, khối ít câu       |
| `NGAN HANG CAU HOI - 111 cong thuc.xlsx`     | 206 câu của đợt đầu, 177 nguồn, có cột URL và tầng bằng chứng            |
| `DANH-GIA-wireframe-va-ngan-hang-cau-hoi.md` | Vì sao bỏ khuôn 5 câu, và những gì KHÔNG có                              |

## Ba điều cần biết trước khi sửa

**Mỗi câu hỏi phải có nguồn thật.** `QuizItem` bắt buộc `source.url` và `quiz.test.ts` kiểm lại.
Câu hỏi không được nghĩ ra cho đủ số — đó là lý do cả thư mục này tồn tại.

**Ngân hàng câu hỏi không đều, và không thể đều.** 21 công thức chỉ có một câu, 24 có hai, 32 công
thức có đủ năm. Khuôn "5 câu mỗi công thức" của bản wireframe đầu đã bị bỏ vì nó buộc phải bịa 3–4
câu cho 88 trên 111 công thức. Sau năm lô, 45/111 công thức (40,5%) chỉ có 1–2 câu — không còn là
đa số; ca kiểm "phân bố" trong `quiz.test.ts` đã đổi tên và ngưỡng để nói đúng điều đó thay vì hạ
ngưỡng cho qua âm thầm.

**Nâng số câu của một công thức chỉ được phép khi có ĐẦU VÀO MỚI, không bao giờ bằng cách hạ
chuẩn.** Ngày 23/09/2026 chủ dự án yêu cầu đưa mọi công thức tiến tới năm câu và cho phép dùng
nguồn nước ngoài — đó là đầu vào mới, nên các con số ghim trong `quiz.test.ts` được đổi. Nhưng 5
vẫn là ĐÍCH NHẮM chứ không phải sàn: lô 1 soạn ra 25 câu và bị vòng phản biện loại 2, vì phản biện
mở lại từng URL đối chiếu nguyên văn. Lô nào không có vòng đối chiếu ấy — dù bằng agent hay tự làm
tay — thì không được đụng vào các con số này.

**Ngân hàng chỉ đọc lúc build.** 345 câu là khoảng 240 kB chữ; `page.tsx` cắt phần của từng công
thức rồi truyền xuống bằng prop. Đừng import `@/application/quiz` từ client component —
`build-only-imports.test.ts` sẽ đỏ.

## Lịch sử mở rộng

| Lô  | Ngày       | Việc                                                                  | Số câu    |
| --- | ---------- | --------------------------------------------------------------------- | --------- |
| Đầu | 23/09/2026 | Soạn từ bảng tính 206 câu / 177 nguồn, phủ 110/111                    | 206       |
| 1   | 23/09/2026 | 6 công thức, có nguồn nước ngoài, song ngữ — phủ đủ **111/111**       | +23 = 229 |
| 2   | 23/09/2026 | 3/15 công thức kỹ thuật xong (12 còn dở do hết hạn mức phiên)         | +11 = 240 |
| 3   | 23/09/2026 | 17/17 công thức rủi ro xong — 67 agent, 0 lỗi, loại 9/51 câu soạn     | +42 = 282 |
| 4   | 23/09/2026 | 12/12 công thức kỹ thuật còn lại — **đóng trọn nhóm `technical`**     | +31 = 313 |
| 5   | 24/09/2026 | 10/10 công thức bội số định giá — 44 agent, 0 lỗi, loại 2/34 câu soạn | +32 = 345 |

Lô 1 gỡ được `tiet-kiem-muc-tieu` — công thức đợt đầu không tìm ra nguồn nào — bằng cách **tách
công thức thành bốn giả định ngầm rồi tìm nguồn cho từng giả định**: lãi suất giữ nguyên suốt n kỳ,
khoản gửi rơi vào cuối kỳ, lãi suất điền vào là lãi suất sản phẩm gửi góp thật, số tiền mục tiêu
đứng yên. Cách này đáng dùng lại cho công thức nào khác cũng bí nguồn.

Lô 2 nhắm 15 công thức kỹ thuật (và một lô song song nhắm 17 công thức rủi ro), nhưng cả hai
workflow chết giữa chừng vì **hết hạn mức phiên**, không phải lỗi nội dung. Lô rủi ro mất trắng.
Lô kỹ thuật cứu được 11 câu của 3 công thức đã kịp soạn xong trước khi agent phản biện chết —
vòng đối chiếu được làm lại **thủ công**: mở lại cả 7 URL, so nguyên văn; một nguồn là PDF mà
`WebFetch` không bóc được luồng nén thì tải về và bóc bằng `pdftotext`. Cả 11 câu đạt.

Lô 3 chạy lại đúng lô rủi ro đã mất trắng, lần này trọn vẹn: 67 agent, 0 lỗi hạ tầng. Vòng phản
biện loại **9 trên 51 câu soạn ra** — trích sai, tính sai, nguồn chỉ định nghĩa chứ không bàn ngộ
nhận — tỷ lệ loại gần 1/6 là bằng chứng rõ nhất từ trước tới nay rằng 5 câu là đích nhắm chứ không
phải sàn. Một câu trích từ nguồn tiếng Anh (`quantt.co.uk`, trang Anh) viết "Annualised" mà cửa
gác chính tả Anh-Mỹ của sản phẩm đòi "Annualized" — xử lý bằng cách giữ nguyên bản `vi` (câu trích
tồn tại để đối chiếu nguồn) và chỉ chuẩn hoá bản `en` (bản tiếng Anh của sản phẩm), đúng tiền lệ đã
áp cho `risk-ratios.ts`.

Lô 4 đóng nốt 12 công thức kỹ thuật còn lại — **cả nhóm `technical` giờ không còn công thức nào ở
mức 1 câu**. Workflow lần này tự lọc trước lỗi chính tả Anh-Mỹ đã gặp ở lô 3 (bóc phần trong `"…"`
ra khỏi `explainEn` rồi soi phần còn lại), nên không câu nào bị đỏ vì lý do ấy nữa. 47 agent, 0 lỗi
hạ tầng, loại 4/35 câu soạn ra (hai câu chọn nhiều sai thực chất, hai nguồn chỉ định nghĩa). Sau
bốn lô, phân bố đổi hẳn: 55/111 công thức (49,5%) chỉ còn 1–2 câu — **lần đầu tiên không còn là đa
số** (từng 87/111 ở đợt đầu). Ca kiểm "phân bố" trong `quiz.test.ts` được đổi tên và hạ ngưỡng so
sánh để nói đúng điều đó, không phải nới cho qua.

Lô 5 mở nhóm **định giá** — nhóm lớn nhất còn lại (20 công thức) — bắt đầu với 10 công thức bội số
(`valuation-multiples.ts`). 44 agent, 0 lỗi hạ tầng, loại 2/34 câu soạn (nguồn chỉ định nghĩa). Một
câu bị agent gắn nhầm `source.kind: 'quy-dinh'` cho một **bài báo thuật lại vụ việc** (xử phạt ITP
vì đăng giá mục tiêu chưa cấp phép) — đúng ra phải là `trai-nghiem`, vì `quy-dinh` chỉ dành cho văn
bản pháp luật hay biểu phí công bố. Nếu để nguyên thì `SO_CAU_QUY_DINH_CHUA_CO_NGAY` — một tripwire
**chỉ được phép đi xuống** — sẽ tăng 16 → 17. Sửa nguồn chứ không phá tripwire.

## Còn treo

- **Lô 6 — 10 công thức DCF** (`mo-hinh-gordon`, `ddm-hai-giai-doan`, `capm`, `wacc`, `fcff`,
  `fcfe`, `gia-tri-noi-tai-fcff`, `gia-tri-hien-tai`, `gia-tri-tuong-lai`, `bien-an-toan`) đóng
  trọn nhóm định giá.
- **Các nhóm khác chưa chạm**: lợi suất (14 công thức, ~48 câu để chạm đích), chỉ số DN (11, ~32),
  phí & thuế (7, ~22), phái sinh (7, ~15), tiết kiệm (4 còn lại, ~10), vay/DCA/tài chính DN/thuế cá
  nhân (~25). Rủi ro còn 9 công thức dưới 5 câu (~16).
- **206 câu của đợt đầu chưa có bản tiếng Anh** (FR-08). Câu từ lô 1 trở đi soạn song ngữ ngay từ
  đầu, nên `quiz.test.ts` đang đếm 139 trên 345.
- Các câu trích trong cột Giải thích của **đợt đầu** nên mở lại URL đối chiếu trước khi phát hành.
  Câu của lô 1 trở đi đã qua vòng phản biện (agent hoặc thủ công) nên không cần.
- **16 câu dẫn văn bản quy định chưa có ngày hiệu lực**, có ca kiểm ghim và danh sách trong
  `TASK.md` mục "Đợt 3". Không điền từ trí nhớ: một ngày sai trông y hệt một ngày đúng.
