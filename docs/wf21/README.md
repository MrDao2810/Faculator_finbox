# WF-21 — Hướng dẫn sử dụng riêng cho từng công thức

Bản vẽ của đợt thiết kế ngày 02/10/2026. **Chưa dựng một dòng mã nào** — thư mục này là thứ phải
duyệt trước, đúng nếp `docs/wf19/` (vẽ 20/09 → dựng 23/09) và `docs/wf20/`.

| File                                      | Nội dung                                                              |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `HD-04-panel-tai-cho.svg`                 | Panel "?" mở tại chỗ trên màn công thức · năm lối vào · ba luật       |
| `HD-05-trang-day-du.svg`                  | Trang `/huong-dan/cong-thuc/<id>/` hai cột · sáu mục của một bài      |
| `HD-06-neo-hai-chieu-va-bon-bien-the.svg` | Bảng `GUIDE_ANCHORS` · nhảy sang màn thật rồi quay lại · bốn biến thể |

Mỗi `.svg` có một `.png` đi kèm để xem nhanh. SVG là bản gốc; sửa SVG thì dựng lại PNG.

## Quan hệ với `docs/wf20/`

`docs/wf20/` (25/09/2026) vẽ **hướng dẫn chung của sản phẩm**: các bài theo tác vụ
(`/huong-dan/nap-so-lieu/`, `/huong-dan/doi-don-vi/`…). Bộ đó cũng chưa dựng.

WF-21 là **bài riêng của từng công thức**, đi trước, vì câu người dùng vướng là câu của chính công
thức đang mở ("EPS lấy ở đâu?", "chuỗi giá cần mấy phiên?") — một bài chung không trả lời được.
Hai bộ dùng chung cơ chế (panel, neo, mục lục) nên đường dẫn tách một bậc: bài công thức ở
`/huong-dan/cong-thuc/<id>/`, bài chung giữ `/huong-dan/<slug>/`.

## Mục đích — đọc ra từ đúng một câu yêu cầu

> "Ai muốn xem lúc nào thì bấm vào là xem được, trong hướng dẫn sử dụng có link để bấm vào các
> phần luôn là đẹp nhất." — chủ dự án

Câu này không mô tả một trang tài liệu. Nó mô tả **chỗ tra cứu tại chỗ lúc đang vướng**:

| Vế                         | Thành luật thiết kế                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------- |
| "ai muốn xem **lúc nào**"  | Không ép ai đọc: không lớp phủ lần đầu, không chấm đỏ, không tour tự chạy             |
| "**bấm vào** là xem được"  | Một cú bấm, ngay chỗ đang đứng — "?" ở thanh trên, và "?" cạnh đúng thứ gây vướng     |
| "là **xem được**"          | Mở ra thấy ngay bài của ĐÚNG công thức đang xem, và không mất việc đang làm           |
| "có **link** vào các phần" | Mỗi mục một neo `#`, mục lục bấm được, neo hiện trên URL khi cuộn tới → copy gửi được |

**Gọn một câu:** hướng dẫn trả lời _"giờ tôi phải làm gì / số này lấy ở đâu / sao ô kết quả trống"_
ngay tại màn đang làm dở, rồi đóng lại làm tiếp.

Hai hệ quả quyết định toàn bộ thiết kế:

1. Đơn vị nội dung là **"một câu hỏi vướng — một mục có neo"**, không phải "một bài 5 phút".
2. "Các phần" chạy **hai chiều**: mục lục trong bài, _và_ bấm từ bài vào đúng khối trên màn thật
   rồi quay lại được (HD-06). Thiếu chiều thứ hai thì hướng dẫn chỉ tả chứ không chỉ được.

### Nó KHÔNG phải cái gì

- **Không dạy lại tài chính.** Ý nghĩa · Khi nào dùng · Cách đọc kết quả · Sai lầm thường gặp đã
  nằm trên màn chi tiết. Hướng dẫn trả lời "làm thế nào", không trả lời "là gì".
- **Không phải chỗ đổ thêm chữ.** Các đợt 29/09 → 02/10 đều là cắt chữ thừa khỏi màn chi tiết
  (`quiz.lead`, `quiz.notTranslated`, `tile.editHint`, dòng đếm ô, hai câu trạng thái rỗng). Một
  màn hướng dẫn đẻ ra 111 đoạn văn mới là đi ngược đúng các đợt đó.

### Vì sao đây là chỗ ĐÚNG cho chữ thao tác

Dự án đã nhiều lần gỡ chữ hướng dẫn thao tác **ra khỏi màn làm việc** và ghi lý do lại:
`example.editHint` bỏ 10/09/2026 (_"câu hướng dẫn cách dùng đứng ở đúng chỗ người dùng đã tự làm
được việc ấy"_, `vi.ts:286-290`), `tile.editHint` bỏ 01/10/2026, và luật ở `vi.ts:791`: _"Nhãn của
một ô nhập nên gọi tên thứ nó nhận, không mang theo hướng dẫn."_

Chữ thao tác không bị cấm — nó bị cấm **đứng chắn giữa việc đang làm**. Một chỗ người dùng tự bấm
mở ra là nơi duy nhất nó được chào đón.

## Một bài gồm sáu mục, và không mục nào đòi câu prose mới

| Mục (neo)         | Lấy từ đâu                                                                                                   | Phủ          |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | ------------ |
| `#dung-de-lam-gi` | `spec.description` + `explanation.whenToUse`                                                                 | 111/111      |
| `#can-so-gi`      | `variables[]`: nhãn · đơn vị · `description` · `min`/`max` · mức Cơ bản/Nâng cao. Thêm dòng theo cờ          | xem bên dưới |
| `#nap-so`         | Các đường nạp số, **chọn theo cờ**: Nạp mẫu · theo mã `?ma=` · gõ tay · Dán từ Excel (chỉ nhóm chuỗi giá)    | 111/111      |
| `#doc-ket-qua`    | `resultUnit` + `explanation.howToRead` + link sang khối Ví dụ thực tế của chính màn                          | 111/111      |
| `#ket-qua-trong`  | **Chạy thật lúc build**: `spec.tests[]` có `expectedWarning` → `runFormula` → in nguyên câu cảnh báo + `fix` | **100/111**  |
| `#sai-lam`        | `explanation.commonMistakes` + link sang khối Bài tập                                                        | 111/111      |

Chữ thao tác của `#nap-so` là **chuỗi i18n dùng chung, chọn theo cờ** — không phải trường mới trong
`FormulaSpec`. Registry cố ý không có và không nên có trường "hướng dẫn thao tác".

### Ba dòng điều kiện của `#can-so-gi`, sinh theo cờ

| Cờ                       | Dòng thêm vào bài                                                               | Số công thức |
| ------------------------ | ------------------------------------------------------------------------------- | -----------: |
| `needsPriceSeries`       | Cần chuỗi giá ≥ N phiên (RSI-14 / SMA-20 cần nhiều hơn)                         |           35 |
| `dependsOn` / `chainFor` | "Số này là kết quả của \<công thức\> ↗", và khối chuỗi chỉ hiện ở mức Nâng cao |            5 |
| `usesConstants`          | Hằng số sản phẩm tự lấy + ngày hiệu lực + căn cứ pháp lý + lối sang Cài đặt     |           14 |

## Bốn biến thể — rời nhau, phủ đủ 111

**57 (cơ bản) + 35 (chuỗi giá) + 5 (nhận số công thức khác) + 14 (hằng số) = 111.** Không công thức
nào rơi vào hai nhóm, không công thức nào không có bài.

## Hai ô trống phải nhận là ô trống

1. **Mô tả ô nhập là trường TUỲ CHỌN, chưa phủ hết.** Đếm trên các ô khai thẳng trong
   `variables: [...]`: **158/178 ô có `description`**; **11 công thức còn ô thiếu** (`pb`, `hpr`,
   `cagr`, `ty-suat-co-tuc`, `lai-tien-gui`, `irr-nien-kim`…). Con số thật của cả thư viện cao hơn
   178 vì nhóm chuỗi giá dùng mảng biến chung khai ở đầu file — phải đếm lại từ Registry thật lúc
   dựng. Bảng biến hiện in `—` cho ô thiếu; bài hướng dẫn cũng **để trống chứ không bịa**, và một
   cửa gác nên in ra danh sách ô trống để bù dần.
2. **11 công thức không có mục `#ket-qua-trong`** (`phi-giao-dich-mua`, `phi-giao-dich-ban`,
   `thue-chuyen-nhuong`, `thue-co-tuc`, `phi-luu-ky`, `loi-nhuan-rong`, `tra-gop-nien-kim`,
   `tra-gop-goc-deu`…): chúng không khai ca hỏng nào vì gần như không hỏng được. **Thiếu mục là
   đúng, bịa mới là sai.**

Nhân tiện, một thứ đang vô hình mà mục `#can-so-gi` là chỗ đúng của nó: `spec.note` của 3 công thức
**chưa bao giờ hiện ở đâu** (ghi ở `src/core/formulas/REVIEW.md:944`) — giới hạn phạm vi duy nhất
của `thue-co-tuc` nằm trong đó và người dùng không đọc được.

## Đếm lại mọi con số trong tài liệu này

Các con số ở trên đọc thẳng từ `src/core/formulas/` nên đếm lại được:

```bash
# 111 công thức · 100 có ca cảnh báo khai sẵn · 14 dùng hằng số · 5 có dependsOn
node -e "const fs=require('fs'),p='src/core/formulas/';let n=0,w=0,u=0,d=0;
for(const f of fs.readdirSync(p).filter(x=>x.endsWith('.ts')&&!x.includes('.test.')&&x!=='summaries.generated.ts')){
const s=fs.readFileSync(p+f,'utf8');const re=/\n    id: '[a-z0-9-]+',\n    categoryId:/g;let m,a=[];
while((m=re.exec(s)))a.push(m.index);
a.forEach((at,i)=>{const b=s.slice(at,i+1<a.length?a[i+1]:s.length);n++;
if(/expectedWarning/.test(b))w++;if(/usesConstants:/.test(b))u++;if(/dependsOn:/.test(b))d++;});}
console.log(n,w,u,d)"
```

35 công thức cần chuỗi giá = toàn bộ 5 file `technical-trend` (9), `technical-volatility` (9),
`risk-volatility` (6), `risk-ratios` (7), `risk-drawdown` (4). `needsPriceSeries()`
(`src/core/calc/run.ts:97`) tính bằng cách CHẠY `runFormula` rồi xem cảnh báo có phải
`MISSING_SERIES` không, nên không đếm được bằng grep.

> Ghi chú: `CLAUDE.md` đang ghi "13 công thức khai `usesConstants`"; đếm thật là **14**
> (`fees.ts` có 8 chứ không phải 7 — `roi-rong` nằm trong đó). Cần sửa lại câu ấy khi có dịp.

## Những chỗ dễ làm hỏng khi dựng

- **Chữ bài không được lọt vào gói JS.** 473 câu hỏi và 112 khung how-to đã phải học bài này: đọc
  CHỈ lúc build (`src/core/huong-dan/` + `src/application/huong-dan.ts`), gác bằng
  `build-only-imports.test.ts` và hai assert mới trong `verify-static.mjs` (HTML phải có chữ, gói
  JS phải không có).
- **Nút "?" không được nhét vào `BottomTabBar`.** Bốn tab đang chia đều; thêm tab thứ năm là bóp cả
  bốn xuống dưới ngưỡng dễ bấm. Nó ở thanh trên, cạnh VI và nút sáng/tối.
- **Neo phải cuộn được trên trang tĩnh.** `output: 'export'` nên không có router phía máy chủ: đọc
  hash trong effect và cuộn tay, **đừng** dùng `useSearchParams` — nó ép cả nhánh vào `<Suspense>`
  và bay mất HTML tĩnh (đúng cái bẫy `FormulaDetail` đã ghi cho `?ma=`).
- **Mục lục sáng theo cuộn cần `IntersectionObserver`**, không nghe sự kiện `scroll`; và mục đang
  sáng ghi vào URL bằng `history.replaceState`, **không** `push`, nếu không nút Back thành bãi rác.
- **Tô sáng khối đích phải tự tắt** sau hai giây. Tô mãi thì lần sau vào thẳng màn ấy người ta
  tưởng có lỗi.
- **`GUIDE_ANCHORS` là MỘT bảng, cả hai bên đọc chung** — cùng lẽ với `SAVED_CALCS_ANCHOR` trong
  `routes.ts`. Hai bên tự gõ chuỗi neo thì lệch một chữ là bấm xong rơi xuống đầu trang.
- **Panel là `BottomSheet` với `placement: 'right'`**, không phải modal thứ hai: primitive hiện có
  đã lo bẫy tiêu điểm, Esc, `inert` và khoá cuộn.

## Dựng lại PNG từ SVG

Hai script sinh ra thư mục này nằm ngoài kho (thư mục tạm của phiên làm việc): một script vẽ SVG,
một script chụp PNG bằng chính Chrome mà `scripts/chrome-check.mjs` dùng (CDP, headless, chỉ tắt
đúng tiến trình nó bật — **không bao giờ diệt Chrome theo tên**). Không thêm dependency nào.
Sửa bản vẽ thì sửa SVG rồi chụp lại PNG cùng kích thước.
