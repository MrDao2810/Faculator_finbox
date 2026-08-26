# Faculator Finbox

Thư viện công thức tài chính và chứng khoán Việt Nam — tra cứu, tính toán, giải thích.
Web tĩnh, không backend riêng, không cơ sở dữ liệu (SRS v2.0 mục 2.1 và 6.1). Ngoại lệ duy nhất:
tab **Danh mục** gọi thẳng API Finbox (`dcs.finbox.vn`) từ trình duyệt để lấy danh sách mã và thị
giá — xem mục [Một lời gọi ra ngoài](#một-lời-gọi-ra-ngoài).

> **Trạng thái:** xong nhánh 1 (nền tảng), nhánh 2 (thư viện giao diện), **nhánh 3.1 + 3.2**
> (màn hình) và nhánh 4 (biểu đồ) — hai gói từng hoãn là 2.4.3 và 3.2.2 nay đã đóng. Sản phẩm đã
> **dùng thử được từ đầu đến cuối**: mở trang chủ → chọn nhóm → mở công thức → đổi số → xem kết
> quả → xuất file.
>
> **111 trên 111 công thức** đã có và đã qua kiểm chứng số học độc lập. Nhánh 5 xong phần
> công thức; xem [TASK.md](TASK.md) để biết phần nào còn lại.

---

## Chạy thử

```bash
npm install         # cài dependency, lần đầu mất 1–2 phút
npm run dev         # mở http://localhost:3000
```

Vài chỗ đáng xem trước:

| Đường dẫn                    | Màn                                                          |
| ---------------------------- | ------------------------------------------------------------ |
| `/`                          | WF-01 — công thức dùng hằng ngày, 12 nhóm chia hai mảng      |
| `/cong-thuc/pe/`             | WF-03 — khuôn chi tiết dùng chung cho cả 111 công thức       |
| `/cong-thuc/loi-nhuan-rong/` | WF-08 — bóc tách phí & thuế, giá hoà vốn thực, ROI ròng      |
| `/cong-thuc/lich-tra-no/`    | WF-14 — ba thanh trượt và lịch trả nợ 240 kỳ có rút gọn      |
| `/tim-kiem/?q=bitcoin`       | WF-09 trạng thái B — nói rõ phạm vi sản phẩm, gợi ý thay thế |

## Các lệnh

| Lệnh                   | Việc                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| `npm run dev`          | Chạy máy chủ phát triển, sửa file là tự nạp lại                       |
| `npm run build`        | Build ra thư mục `out/` — toàn HTML tĩnh, đem đi host ở đâu cũng được |
| `npm run preview`      | Xem thử bản build tĩnh                                                |
| `npm run lint`         | ESLint, **bao gồm cả ràng buộc ranh giới tầng CON-02 / CON-03**       |
| `npm run typecheck`    | Kiểm kiểu TypeScript, không sinh file                                 |
| `npm test`             | Unit test bằng Vitest                                                 |
| `npm run check`        | lint + typecheck + format:check + test. Dùng trước khi push           |
| `npm run format`       | Prettier định dạng lại toàn bộ                                        |
| `npm run check:chrome` | 20 phép kiểm trên Chrome thật ở khổ 360×780 — cần `out/` dựng sẵn     |

---

## Kiến trúc bốn tầng

```text
src/
├── app/            PRESENTATION  — trang Next.js (App Router), mỗi công thức một URL
├── ui/             PRESENTATION  — component dùng chung (nhánh 2 trong WBS)
├── application/    APPLICATION   — cửa duy nhất giữa giao diện và Domain
├── core/           DOMAIN        — TypeScript thuần, toàn bộ logic tài chính
└── data/           DATA          — DataProvider (bộ mẫu tĩnh) + MarketFeed (gọi API Finbox)
```

### Luật ranh giới — ESLint chặn thật, không phải quy ước suông

| Tầng                | Không được import                                    |
| ------------------- | ---------------------------------------------------- |
| `src/core`          | `react`, `react-dom`, `next` · và mọi tầng bên trên  |
| `src/data`          | `react`, `next` · `@/ui`, `@/app`                    |
| `src/application`   | `@/ui`, `@/app`                                      |
| `src/app`, `src/ui` | `@/core/*`, `@/data/*` — phải đi qua `@/application` |

Thử nghiệm cho vui: thêm `import { useState } from 'react';` vào đầu
`src/core/calc-output.ts` rồi chạy `npm run lint`. Nó sẽ báo lỗi kèm mã ràng buộc CON-02.

Đây là thứ duy nhất ngăn logic tài chính rò rỉ dần vào component React. Đặt ở ngày đầu
gần như miễn phí; để sau mới gỡ thì rất đau.

`@/application` là **barrel chọn lọc**, không phải `export *` — muốn dùng gì ở Domain thì mở
cửa ra đó từng thứ một. Riêng phần React của tầng Application có đường dẫn riêng, để trang chạy
phía máy chủ như `sitemap.ts` không phải kéo theo React:

```ts
import { usePreferences } from '@/application/preferences-context';
import { useOnlineStatus } from '@/application/use-online-status';
import { useListParams } from '@/application/use-list-params';
```

---

## Bất biến quan trọng nhất — FR-06

**Không bao giờ hiển thị NaN, Infinity, hay 0 thay cho lỗi.**

Cách giữ: mọi hàm tính đều trả về `CalcOutput`, và chỉ được tạo ra qua `ok()` hoặc `fail()`.
Không hàm nào được `return someNumber` trần.

```ts
import { divideByZero, fail, ok } from '@/application';

export function pe(price: number, eps: number) {
  if (eps === 0) return fail('lần', divideByZero('P/E', 'EPS'));
  return ok(price / eps, 'lần');
}
```

`ok()` còn có lưới an toàn cuối: giá trị lọt vào `NaN` hay `Infinity` thì tự chuyển thành `fail`,
không phụ thuộc việc người viết công thức có nhớ kiểm tra hay không.

Sáu loại cảnh báo chuẩn lấy đúng từ màn **WF-15** của wireframe, mỗi loại một hàm dựng thông điệp
trong `src/core/warnings.ts` — công thức không tự chế câu chữ, để cả 111 công thức nói cùng giọng.

## Cùng cách nghĩ đó, áp cho những chỗ khác

| Bất biến                                | Cách giữ                                            | Hỏng thì biết ngay ở đâu              |
| --------------------------------------- | --------------------------------------------------- | ------------------------------------- |
| Không hiện NaN / ∞ (FR-06)              | `ok()` tự chuyển thành `fail`                       | `src/core/calc-output.test.ts`        |
| Lỗi hiện `— , —`, không hiện 0 (FR-06)  | `ResultBlock` giao hẳn cho `ErrorState`, một khuôn  | `src/ui/result/ErrorState.test.tsx`   |
| Chuỗi người gõ không thành NaN          | `parseViNumber()` trả `null` chứ không trả NaN      | `src/core/format.test.ts`             |
| Ghi đè thắng cả khi thượng nguồn lỗi    | `resolveLinked()` xét `override` trước cảnh báo     | `src/core/linked-input.test.ts`       |
| File xuất luôn có miễn trừ (FR-24)      | `buildExportContent()` không nhận cờ tắt            | `src/core/export-content.test.ts`     |
| Dán hỏng vài dòng không mất cả bộ       | `parsePaste()` không ném lỗi, trả `skipped[]`       | `src/core/paste-import.test.ts`       |
| Màu đạt AA ở CẢ HAI bảng (NFR-USA-06)   | Test đọc `globals.css`, chấm bảng sáng và bảng tối  | `src/ui/contrast.test.ts`             |
| Màu chỉ đi qua token                    | Test quét mọi `*.module.css` tìm mã màu viết thẳng  | `src/ui/tokens.test.ts`               |
| `var(--…)` gọi tới biến có thật         | Đối chiếu biến CSS Module dùng với `:root`          | `src/ui/tokens.test.ts`               |
| Bảng tối đè đủ token của bảng sáng      | Đối chiếu hai khối, danh sách miễn phải ghi lý do   | `src/ui/tokens.test.ts`               |
| File xuất luôn nền sáng                 | `draw-card.ts` ghim bảng sáng, không đọc token sống | `src/ui/sheets/draw-card.test.ts`     |
| Miễn trừ hiện ở mọi màn (FR-24)         | Đặt trong `AppShell`, không đặt ở từng màn          | `src/ui/layout/AppShell.tsx`          |
| Hằng số thuế/phí có căn cứ (LDR-03)     | `validateMarketConfig()` bắt bản ghi thiếu          | `src/core/market/market.test.ts`      |
| Công thức có đủ metadata (FR-03, FR-04) | Validator của Registry                              | `src/core/registry/registry.test.ts`  |
| Ca kiểm thử khai ra thì phải CHẠY THẬT  | `runSpecTests()` duyệt `spec.tests` của mọi CT      | `src/core/formulas/formulas.test.ts`  |
| Diễn giải không tự mâu thuẫn với spec   | 7 phép đối chiếu prose với `spec`, `calc`, bộ mẫu   | `src/application/prose-audit.test.ts` |
| Ô để trống ≠ số 0 (NFR-REL-01)          | `runFormula()` chặn trước khi gọi hàm tính          | `src/core/calc/calc.test.ts`          |
| Công thức luôn có hàm tính              | `FormulaModule` gộp spec và calc làm một            | typecheck                             |
| Link lọc nhóm đọc lại được              | Dựng URL bằng `listParamsToQuery()`, không ghép tay | `src/application/url-state.test.ts`   |
| Ký hiệu toán không tốn JS máy khách     | `katex` chỉ chạy trong server component lúc build   | `scripts/verify-static.mjs`           |
| `id` biểu đồ không do React sinh        | Ghép từ `spec.id`, không `useId()` dưới nạp trễ     | `src/ui/charts/charts.test.tsx`       |

---

## Một lời gọi ra ngoài

Sản phẩm gọi đúng **một** máy chủ ngoài, và chỉ ở tab Danh mục:

| Endpoint                          | Dùng để                                     | Khi nào                                                   |
| --------------------------------- | ------------------------------------------- | --------------------------------------------------------- |
| `GET dcs.finbox.vn/bp/codes`      | ~1.649 mã đang giao dịch, cho ô chọn mã     | khi mở ô chọn mã; cache localStorage 24 giờ               |
| `POST dcs.finbox.vn/data/symbols` | thị giá + số liệu cơ bản, nhiều mã một lượt | khi mở tab Danh mục, và khi mở `/cong-thuc/<id>/?ma=<MÃ>` |

Ba điều đi kèm, đừng nới ra khi chưa hỏi chủ dự án:

- `public/_headers` mở **đúng một origin** trong `connect-src`. Trước gói này nó khoá `'self'` và
  ghi rõ "sản phẩm không gọi máy chủ nào" — câu đó nay không còn đúng, và việc nới đã được chủ dự
  án chốt.
- Thứ rời khỏi máy người dùng chỉ là **mã cổ phiếu**. Số lượng nắm giữ, giá vốn, ngày mua vẫn nằm
  nguyên trong `localStorage` và không bao giờ đi vào tham số của lời gọi nào.
- Mất mạng thì không ô nào được hiện `0`. Danh sách mã rơi về bản cache 24 giờ; thị giá rơi về bản
  cache 7 ngày và màn **phải** ghi rõ đang dùng giá phiên nào — đó là điều kiện để được phép giữ
  giá cũ. Không còn giá nào dùng được thì các ô hiện "—" kèm lời khuyên **thử lại** (không phải
  "bỏ mã khỏi danh mục"). Riêng ô **Vốn đã bỏ ra** vẫn ra số vì nó không cần thị giá.

Chi tiết kỹ thuật: [`src/data/README.md`](src/data/README.md).

---

## Đưa lên mạng — Cloudflare Pages

Phần này cần tài khoản của bạn, tôi không tạo thay được.

1. Đẩy repo lên GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Điền đúng ba ô này:

   | Ô                      | Giá trị                        |
   | ---------------------- | ------------------------------ |
   | Framework preset       | `Next.js (Static HTML Export)` |
   | Build command          | `npm run build`                |
   | Build output directory | `out`                          |

4. Environment variables: `NODE_VERSION` = `20`, và `NEXT_PUBLIC_SITE_URL` = tên miền thật.

   Cả `sitemap.xml` lẫn `robots.txt` sinh ra từ biến này (FR-25) — không còn file tĩnh nào ghi
   cứng tên miền, nên chỉ có một chỗ để điền. Không đặt biến thì rơi về `*.pages.dev`, vẫn chạy;
   đó cũng là đường mà bản xem thử của mỗi Pull Request đi. `npm run verify:static` có một phép
   kiểm bắt hai file lệch tên miền nhau.

Xong bước này thì mỗi lần push lên `main` là tự deploy, mỗi Pull Request có một URL preview riêng.

GitHub Actions ở `.github/workflows/ci.yml` chạy độc lập với Cloudflare: lint → typecheck →
test → build. Hỏng ở bước nào thì chặn merge ở bước đó.

---

## Việc tiếp theo theo WBS

- **3.2.2 + 5.2.3 đã xong** — chuỗi `CAPM → Mô hình Gordon → Biên an toàn` chạy thật, và màn nâng
  cao WF-04 là một khối mọc thêm trên trang chi tiết khi bật chế độ Nâng cao (không thêm URL nào).
  `LinkedInput` và `FlowChainStrip` nay có nơi dùng. Chuỗi có **sáu cạnh `dependsOn`** thành hai
  nhánh: `CAPM → Gordon → Biên an toàn`, và `CAPM → WACC → Giá trị nội tại FCFF ← FCFF → FCFE`.
  Mắt xích khép nhánh FCFF chính là công thức thứ **108** — nhóm Định giá nâng 18 → 19. Sau đó ba
  công thức "cố ý chưa đăng ký" (`gia-muc-tieu`, `beta`, `xirr`) khép nốt 108 → 111 — chi tiết ở
  docblock `src/core/registry/categories.ts`, nên **bảng SRS mục 3.8 ngoài repo phải sửa
  94 / 13 / 107 thành 98 / 13 / 111**.
- **Nhánh 4** biểu đồ — xong, phủ 100/111, kèm thác nước bóc tách cho **đủ 10** công thức khai
  `waterfall`/`stackedBar`; không còn cái nào chờ. Bốn cái bày bóc tách ngay khi mở màn (đường quét
  của chúng là đường thẳng), sáu cái còn lại giữ đường quét làm mặc định và bóc tách nằm trong ô
  chọn trục. Việc còn của nhánh: nhiều đường trên một hình cho nhóm chỉ báo kỹ thuật.

**Về dung lượng — cửa kiểm từng xanh giả.** Hồi 21 công thức, metadata đi thẳng vào gói JS của
màn danh sách và phép ngoại suy cho ra "107 công thức sẽ vượt ngưỡng 200 kB của NFR-PER-04". Đợt
13 tách chỉ mục nhẹ khỏi Registry và khai `sideEffects` trong `package.json` để webpack rung được
cây qua barrel — nhưng `scripts/size-report.mjs` từ đó luôn so khớp asset đọc từ HTML (Next mã
hoá route động thành `%5Bid%5D`) với bảng tra dựng từ đĩa (giữ nguyên `[id]`), nên **chunk nặng
nhất của MỌI trang chi tiết bị lặng lẽ vứt khỏi phép đo** — script báo "an toàn" nhiều đợt liền.
Đã vá lỗi so khớp; số đo thật hiện tại: cả 111/111 trang chi tiết đều nặng **308–319 kB** First
Load JS — vượt cả cửa kiểm 180 kB lẫn ngân sách NFR-PER-04 (200 kB). Xem `TASK.md` để biết hướng
xử lý đã chọn. Chạy `npm run size` để xem lại bất cứ lúc nào.

Còn **hai việc** chặn phát hành v0.1, đều là **nội dung chờ người đối chiếu**, không phải code:

1. **Bộ số liệu mẫu** trong `src/data/samples.ts` một phần vẫn là số tôi tự dựng — giả định A1
   và rủi ro R-01 của SRS vẫn còn mở. Fundamentals (EPS, BVPS, số CP, lợi nhuận ròng, cổ tức) của
   4 mã FPT/HPG/VNM/MWG nay lấy thật từ API Finbox_v2 (`npm run gen:live-fundamentals`), nhưng
   chuỗi giá (`bars`, `VN_INDEX_BARS`) vẫn PRNG bịa — API chỉ có 10-21 phiên, không đủ cho ~248
   phiên mà Beta và các công thức kỹ thuật cần. Mọi `Preset` vẫn mang `isDraft: true` và giao diện
   nói rõ điều đó ở bốn chỗ; **đừng gỡ mấy nhãn ấy chừng nào chuỗi giá còn là số bịa**.
2. **Diễn giải của 111 công thức** do tôi soạn theo giáo trình, chưa ai rà lại. Phần toán thì
   đã có ví dụ số kiểm chứng độc lập cho từng công thức.

Việc thứ ba đã xong: **thuế & phí** trong `src/core/market/schedules.ts` (gói WBS 5.1.1) qua hai
vòng đối chiếu — máy tra nguồn mở, rồi chủ dự án đọc bản gốc có dấu — và đóng ngày 17/08/2026.
Hồ sơ nguồn giữ ở [src/core/market/README.md](src/core/market/README.md), kèm ba hằng số nhiều
khả năng phải tra lại sớm nhất.
