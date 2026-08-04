# TASK — Nền tảng kỹ thuật & khung điều hướng

Theo dõi tiến độ theo bảng Estimate WBS v7. Mỗi đợt một mục.

| Gói   | Nội dung                                            | Giờ WBS | Trạng thái                                  |
| ----- | --------------------------------------------------- | ------- | ------------------------------------------- |
| 1.1.1 | Repo + toolchain                                    | 3h00    | Xong (từ trước)                             |
| 1.1.2 | CI/CD + hosting tĩnh                                | 3h30    | Xong (từ trước)                             |
| 1.2.1 | Design token & primitive                            | 10h00   | Xong — đợt 1                                |
| 1.3.1 | FormulaRegistry: schema, bộ sinh, validator         | 7h00    | Xong — đợt 1                                |
| 1.3.2 | MarketConfig thuế & phí                             | 3h30    | Code xong — **số liệu chờ người đối chiếu** |
| 1.3.3 | Chuẩn CalcOutput & hệ cảnh báo                      | 4h00    | Xong — đợt 1                                |
| 1.4.1 | Routing, URL state & khung i18n                     | 5h30    | Xong — đợt 2, **trừ route động**            |
| 1.4.2 | App shell & layout                                  | 2h00    | Xong — đợt 2                                |
| 2.1.1 | AppHeader · OfflineBanner · ModeToggle · LangSwitch | 10h00   | Xong — đợt 2                                |
| 2.1.2 | BottomTabBar                                        | 2h30    | Xong — đợt 2                                |
| 2.1.3 | DisclaimerBar                                       | 2h00    | Xong — đợt 2                                |
| 2.2.1 | SearchBox bỏ dấu                                    | 5h00    | Xong — đợt 3                                |
| 2.2.2 | CategoryFilter                                      | 3h30    | Xong — đợt 3                                |
| 2.2.3 | FormulaCard                                         | 3h00    | Xong — đợt 3                                |
| 2.3.1 | NumberInput — 5 trạng thái WF-16                    | 8h00    | Xong — đợt 5                                |
| 2.3.2 | SliderInput · ButtonGroup · RadioGroup              | 6h00    | Xong — đợt 5                                |
| 2.3.3 | SelectInput · Toggle · UnitSwitcher                 | 4h00    | Xong — đợt 5                                |
| 2.3.4 | LinkedInput                                         | 12h00   | Xong — đợt 5                                |
| 2.4.1 | ResultBlock                                         | 5h00    | Xong — đợt 5                                |
| 2.4.2 | ErrorState · InlineWarning                          | 5h00    | Xong — đợt 5                                |
| 2.4.3 | FormulaLatex (KaTeX)                                | 3h00    | **Hoãn** — chủ dự án chốt chưa thêm KaTeX   |
| 2.4.4 | ExplanationAccordion                                | 3h00    | Xong — đợt 5                                |
| 2.4.5 | VariableTable · ExampleBlock · SourceBlock          | 4h30    | Xong — đợt 5                                |
| 2.4.6 | FlowChain                                           | 6h00    | Xong — đợt 5                                |
| 2.4.7 | StatTile                                            | 2h00    | Xong — đợt 5 (WBS xếp "sau v0.2")           |

Cộng dồn: **120,5 giờ** trên tổng 623 giờ của bảng Estimate (65 + 55,5 của đợt 5;
gói 2.4.3 ba giờ chưa tính vì đang hoãn).

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
