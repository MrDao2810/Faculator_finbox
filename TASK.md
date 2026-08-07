# TASK — Nền tảng kỹ thuật & khung điều hướng

Theo dõi tiến độ theo bảng Estimate WBS v7. Mỗi đợt một mục.

| Gói   | Nội dung                                            | Giờ WBS | Trạng thái                                   |
| ----- | --------------------------------------------------- | ------- | -------------------------------------------- |
| 1.1.1 | Repo + toolchain                                    | 3h00    | Xong (từ trước)                              |
| 1.1.2 | CI/CD + hosting tĩnh                                | 3h30    | Xong (từ trước)                              |
| 1.2.1 | Design token & primitive                            | 10h00   | Xong — đợt 1                                 |
| 1.3.1 | FormulaRegistry: schema, bộ sinh, validator         | 7h00    | Xong — đợt 1                                 |
| 1.3.2 | MarketConfig thuế & phí                             | 3h30    | Code xong — **số liệu chờ người đối chiếu**  |
| 1.3.3 | Chuẩn CalcOutput & hệ cảnh báo                      | 4h00    | Xong — đợt 1                                 |
| 1.4.1 | Routing, URL state & khung i18n                     | 5h30    | Xong — đợt 2, **trừ route động**             |
| 1.4.2 | App shell & layout                                  | 2h00    | Xong — đợt 2                                 |
| 2.1.1 | AppHeader · OfflineBanner · ModeToggle · LangSwitch | 10h00   | Xong — đợt 2                                 |
| 2.1.2 | BottomTabBar                                        | 2h30    | Xong — đợt 2                                 |
| 2.1.3 | DisclaimerBar                                       | 2h00    | Xong — đợt 2                                 |
| 2.2.1 | SearchBox bỏ dấu                                    | 5h00    | Xong — đợt 3                                 |
| 2.2.2 | CategoryFilter                                      | 3h30    | Xong — đợt 3                                 |
| 2.2.3 | FormulaCard                                         | 3h00    | Xong — đợt 3                                 |
| 2.3.1 | NumberInput — 5 trạng thái WF-16                    | 8h00    | Xong — đợt 5                                 |
| 2.3.2 | SliderInput · ButtonGroup · RadioGroup              | 6h00    | Xong — đợt 5                                 |
| 2.3.3 | SelectInput · Toggle · UnitSwitcher                 | 4h00    | Xong — đợt 5                                 |
| 2.3.4 | LinkedInput                                         | 12h00   | Xong — đợt 5                                 |
| 2.4.1 | ResultBlock                                         | 5h00    | Xong — đợt 5                                 |
| 2.4.2 | ErrorState · InlineWarning                          | 5h00    | Xong — đợt 5                                 |
| 2.4.3 | FormulaLatex (KaTeX)                                | 3h00    | **Hoãn** — chủ dự án chốt làm thật, chưa xếp |
| 2.4.4 | ExplanationAccordion                                | 3h00    | Xong — đợt 5                                 |
| 2.4.5 | VariableTable · ExampleBlock · SourceBlock          | 4h30    | Xong — đợt 5                                 |
| 2.4.6 | FlowChain                                           | 6h00    | Xong — đợt 5                                 |
| 2.4.7 | StatTile                                            | 2h00    | Xong — đợt 5 (WBS xếp "sau v0.2")            |
| 2.5.1 | PresetSheet                                         | 6h00    | Xong — đợt 6, **số liệu mẫu là bản thảo**    |
| 2.5.2 | PasteImportSheet                                    | 10h00   | Xong — đợt 6                                 |
| 2.5.3 | ExportSheet                                         | 12h00   | Xong — đợt 6                                 |
| 3.1.1 | HomePage — WF-01                                    | 6h00    | Xong — đợt 7                                 |
| 3.1.2 | FormulaListPage — WF-02, có ảo hoá                  | 8h00    | Xong — đợt 7                                 |
| 3.1.3 | SearchPage — WF-09 hai trạng thái                   | 7h00    | Xong — đợt 7                                 |
| 3.2.1 | FormulaDetailBasic — WF-03                          | 7h00    | Xong — đợt 7                                 |
| 3.2.2 | FormulaDetailAdvanced — WF-04                       | 10h00   | **Hoãn** — chờ chuỗi định giá gói 5.2.3      |
| 3.2.3 | FeeTaxCalculator — WF-08                            | 9h00    | Xong — đợt 7                                 |
| 3.2.4 | LoanScheduleScreen — WF-14                          | 8h00    | Xong — đợt 7                                 |
| 5.1.2 | `fees.*` — 8 công thức phí & thuế                   | 11h12   | Xong — đợt 7 (kéo về sớm)                    |
| 5.1.3 | `returns.*` — 4 / 13 công thức                      | ~3h30   | Một phần — đợt 7                             |
| 5.1.4 | `personal.*` — 6 / 8 công thức                      | ~6h00   | Gần xong — đợt 7                             |
| 5.2.2 | `valuation.multiples.*` — P/E, P/B                  | ~2h00   | Một phần — đợt 7 (kéo về sớm)                |
| —     | Dựng lại WF-01 theo bản thiết kế hi-fi              | —       | Xong — đợt 8 (chủ dự án yêu cầu)             |
| 3.3.1 | DataTableScreen — WF-05 bảng chuỗi giá OHLCV        | ~8h     | Xong — đợt 9                                 |
| 3.4.1 | PortfolioScreen — WF-06 danh mục cá nhân            | ~8h     | Xong — đợt 9                                 |
| —     | Dựng lại WF-08 và WF-14 theo bản thiết kế hi-fi     | —       | Xong — đợt 10 (chủ dự án yêu cầu)            |
| —     | Tìm kiếm & lọc tại chỗ ở trang chủ                  | —       | Xong — đợt 11a (chủ dự án yêu cầu)           |
| —     | Dựng lại ba bottom sheet theo hi-fi                 | —       | Xong — đợt 12 (chủ dự án yêu cầu)            |
| 3.1.3 | SearchPage — thêm tô sáng khớp + Danh mục hot       | —       | Xong — đợt 12                                |
| 3.6.1 | SettingsScreen — WF-13                              | ~6h     | Xong — đợt 12                                |
| 3.6.2 | PWA — manifest + service worker                     | ~4h     | Xong — đợt 12, **biểu tượng PNG còn thiếu**  |
| —     | Ô tìm không rơi ký tự khi gõ nhanh                  | —       | Xong — đợt 13                                |
| —     | Dọn khoá i18n mồ côi + ca kiểm chặn tái phát        | —       | Xong — đợt 13                                |
| —     | Tách chỉ mục nhẹ khỏi Registry (NFR-PER-04)         | —       | Xong — đợt 13                                |
| —     | Dọn chất lượng phát hành sau kiểm kê                | —       | Xong — đợt 14                                |
| 3.1.2 | /cong-thuc/ có HTML tĩnh thật cho Google            | —       | Xong — đợt 14                                |
| —     | Sửa lỗi không bấm chuyển tab được (chỉ lúc dev)     | —       | Xong — xem mục ngay dưới                     |
| 5.x   | Nối nốt 34 công thức chuỗi giá — **đủ 107/107**     | —       | Xong — xem mục "Đủ 107 công thức"            |
| —     | Cửa gác chặn build khi dev server đang chạy         | —       | Xong — xem mục "lỗi khi click vào xem…"      |
| 2.1.x | Nút quay lại cho ba màn trong (WF-03/05/09)         | —       | Xong — xem mục "Thêm đường ra khỏi màn…"     |
| —     | Nút Cơ bản / Nâng cao lọc danh sách (FR-09 vế 2)    | —       | Xong — xem mục "Nút Nâng cao không đổi gì"   |
| —     | Vẽ lại biểu tượng theo ảnh chủ dự án + dải màu      | —       | Xong — xem mục "Biểu tượng mới"              |

Cộng dồn: **231,7 giờ** trên tổng 623 giờ của bảng Estimate
(148,5 + 45 nhánh 3 + ~24,2 phần nhánh 5 kéo về sớm + 10 nhánh 3.6 + 4 đợt 13).
**Nhánh 3.1 xong trọn**; nhánh 3.2 xong ba trên bốn gói; nhánh 3.6 xong 3.6.1 và 3.6.2.

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
