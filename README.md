# Falculator Finbox

Thư viện công thức tài chính và chứng khoán Việt Nam — tra cứu, tính toán, giải thích.
Web tĩnh, không backend, không cơ sở dữ liệu (SRS v2.0 mục 2.1 và 6.1).

> **Trạng thái:** xong nhánh 1 (nền tảng), nhánh 2 (thư viện giao diện) và **nhánh 3.1 + 3.2**
> (màn hình), trừ hai gói đang hoãn là 2.4.3 và 3.2.2. Sản phẩm đã **dùng thử được từ đầu đến
> cuối**: mở trang chủ → chọn nhóm → mở công thức → đổi số → xem kết quả → xuất file.
>
> **107 trên 107 công thức** đã có và đã qua kiểm chứng số học độc lập. Nhánh 5 xong phần
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
| `/cong-thuc/pe/`             | WF-03 — khuôn chi tiết dùng chung cho cả 107 công thức       |
| `/cong-thuc/loi-nhuan-rong/` | WF-08 — bóc tách phí & thuế, giá hoà vốn thực, ROI ròng      |
| `/cong-thuc/lich-tra-no/`    | WF-14 — ba thanh trượt và lịch trả nợ 240 kỳ có rút gọn      |
| `/tim-kiem/?q=bitcoin`       | WF-09 trạng thái B — nói rõ phạm vi sản phẩm, gợi ý thay thế |

## Các lệnh

| Lệnh                | Việc                                                                  |
| ------------------- | --------------------------------------------------------------------- |
| `npm run dev`       | Chạy máy chủ phát triển, sửa file là tự nạp lại                       |
| `npm run build`     | Build ra thư mục `out/` — toàn HTML tĩnh, đem đi host ở đâu cũng được |
| `npm run preview`   | Xem thử bản build tĩnh                                                |
| `npm run lint`      | ESLint, **bao gồm cả ràng buộc ranh giới tầng CON-02 / CON-03**       |
| `npm run typecheck` | Kiểm kiểu TypeScript, không sinh file                                 |
| `npm test`          | Unit test bằng Vitest                                                 |
| `npm run check`     | Chạy cả ba: lint + typecheck + test. Dùng trước khi push              |
| `npm run format`    | Prettier định dạng lại toàn bộ                                        |

---

## Kiến trúc bốn tầng

```text
src/
├── app/            PRESENTATION  — trang Next.js (App Router), mỗi công thức một URL
├── ui/             PRESENTATION  — component dùng chung (nhánh 2 trong WBS)
├── application/    APPLICATION   — cửa duy nhất giữa giao diện và Domain
├── core/           DOMAIN        — TypeScript thuần, toàn bộ logic tài chính
└── data/           DATA          — DataProvider, bộ số liệu mẫu tĩnh
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
trong `src/core/warnings.ts` — công thức không tự chế câu chữ, để cả 107 công thức nói cùng giọng.

## Cùng cách nghĩ đó, áp cho những chỗ khác

| Bất biến                                | Cách giữ                                            | Hỏng thì biết ngay ở đâu             |
| --------------------------------------- | --------------------------------------------------- | ------------------------------------ |
| Không hiện NaN / ∞ (FR-06)              | `ok()` tự chuyển thành `fail`                       | `src/core/calc-output.test.ts`       |
| Lỗi hiện `— , —`, không hiện 0 (FR-06)  | `ResultBlock` giao hẳn cho `ErrorState`, một khuôn  | `src/ui/result/ErrorState.test.tsx`  |
| Chuỗi người gõ không thành NaN          | `parseViNumber()` trả `null` chứ không trả NaN      | `src/core/format.test.ts`            |
| Ghi đè thắng cả khi thượng nguồn lỗi    | `resolveLinked()` xét `override` trước cảnh báo     | `src/core/linked-input.test.ts`      |
| File xuất luôn có miễn trừ (FR-24)      | `buildExportContent()` không nhận cờ tắt            | `src/core/export-content.test.ts`    |
| Dán hỏng vài dòng không mất cả bộ       | `parsePaste()` không ném lỗi, trả `skipped[]`       | `src/core/paste-import.test.ts`      |
| Màu đạt tương phản AA (NFR-USA-06)      | Test đọc thẳng `globals.css` rồi tính tỉ số         | `src/ui/contrast.test.ts`            |
| Màu chỉ đi qua token                    | Test quét mọi `*.module.css` tìm mã màu viết thẳng  | `src/ui/tokens.test.ts`              |
| Miễn trừ hiện ở mọi màn (FR-24)         | Đặt trong `AppShell`, không đặt ở từng màn          | `src/ui/layout/AppShell.tsx`         |
| Hằng số thuế/phí có căn cứ (LDR-03)     | `validateMarketConfig()` bắt bản ghi thiếu          | `src/core/market/market.test.ts`     |
| Công thức có đủ metadata (FR-03, FR-04) | Validator của Registry                              | `src/core/registry/registry.test.ts` |
| Ca kiểm thử khai ra thì phải CHẠY THẬT  | `runSpecTests()` duyệt `spec.tests` của mọi CT      | `src/core/formulas/formulas.test.ts` |
| Ô để trống ≠ số 0 (NFR-REL-01)          | `runFormula()` chặn trước khi gọi hàm tính          | `src/core/calc/calc.test.ts`         |
| Công thức luôn có hàm tính              | `FormulaModule` gộp spec và calc làm một            | typecheck                            |
| Link lọc nhóm đọc lại được              | Dựng URL bằng `listParamsToQuery()`, không ghép tay | `src/application/url-state.test.ts`  |

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

4. Environment variables: `NODE_VERSION` = `20`, và `NEXT_PUBLIC_SITE_URL` = tên miền thật
   (sitemap.xml lấy từ biến này — FR-25).

Xong bước này thì mỗi lần push lên `main` là tự deploy, mỗi Pull Request có một URL preview riêng.

GitHub Actions ở `.github/workflows/ci.yml` chạy độc lập với Cloudflare: lint → typecheck →
test → build. Hỏng ở bước nào thì chặn merge ở bước đó.

---

## Việc tiếp theo theo WBS

- **5.1 và 5.2** — 86 công thức còn lại. Cách thêm một công thức ghi ở
  [`src/core/formulas/README.md`](src/core/formulas/README.md).
- **3.2.2** WF-04 màn nâng cao — hoãn, làm cùng lúc với chuỗi định giá của gói 5.2.3.
- **Nhánh 4** biểu đồ — WF-03, WF-08 và WF-14 đang chừa sẵn chỗ.
- **2.4.3** FormulaLatex — hoãn, cần quyết có thêm KaTeX hay không (3h).

**Về dung lượng — nỗi lo cũ đã khép lại bằng số đo.** Hồi 21 công thức, metadata đi thẳng vào
gói JS của màn danh sách và phép ngoại suy cho ra "107 công thức sẽ vượt ngưỡng 200 kB của
NFR-PER-04". Đợt 13 tách chỉ mục nhẹ khỏi Registry và khai `sideEffects` trong `package.json`
để webpack rung được cây qua barrel. Kết quả đo ở mốc 107 thật: **chỉ mục nhẹ 9,5 kB nén cho
cả 107 công thức** (0,1 kB mỗi công thức), trang nặng nhất **148,7 kB** First Load JS — dưới cả
cửa kiểm 170 kB. Chạy `npm run size` để xem lại bất cứ lúc nào.

Ba việc chặn phát hành v0.1, đều là **nội dung chờ người đối chiếu**, không phải code:

1. **Thuế & phí** trong `src/core/market/schedules.ts` còn là bản thảo (gói WBS 5.1.1).
2. **Bộ số liệu mẫu** trong `src/data/samples.ts` là số tôi tự dựng, không phải BCTC thật —
   giả định A1 và rủi ro R-01 của SRS vẫn còn mở.
3. **Diễn giải của 107 công thức** do tôi soạn theo giáo trình, chưa ai rà lại. Phần toán thì
   đã có ví dụ số kiểm chứng độc lập cho từng công thức.

Và một việc nội dung mới lộ ra khi đủ 107: **thiếu công thức Beta** — xem
[src/core/formulas/README.md](src/core/formulas/README.md), mục "Còn thiếu".
