# Falculator Finbox

Thư viện công thức tài chính và chứng khoán Việt Nam — tra cứu, tính toán, giải thích.
Web tĩnh, không backend, không cơ sở dữ liệu (SRS v2.0 mục 2.1 và 6.1).

> **Trạng thái:** xong nhánh 1 của WBS (nền tảng kỹ thuật) và gần trọn nhánh 2 (thư viện giao
> diện) — còn gói 2.4.3 đang hoãn và gói 2.5 chưa làm. Bộ khung chạy được, bốn tab chuyển qua
> lại, bộ nhập liệu và bộ hiển thị kết quả đã đủ, nhưng **chưa có công thức nào** — nhánh 5 mới
> là chỗ đổ 107 công thức vào. Tiến độ chi tiết xem [TASK.md](TASK.md).
>
> Muốn xem thư viện component chạy thật thì mở `/thu-nghiem/` — màn tạm, gói 3.2.1 sẽ thay
> bằng màn WF-03 thật.

---

## Chạy thử

```bash
npm install         # cài dependency, lần đầu mất 1–2 phút
npm run dev         # mở http://localhost:3000
```

Trang chủ tạm hiện ba thẻ chứng minh ba tầng đã nối đúng: con số **15,2 lần** đi từ `src/core`
qua `src/application` rồi mới tới giao diện, 12 nhóm công thức đọc từ Registry, và bảng biểu phí
tra theo ngày từ MarketConfig.

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

| Bất biến                                | Cách giữ                                           | Hỏng thì biết ngay ở đâu             |
| --------------------------------------- | -------------------------------------------------- | ------------------------------------ |
| Không hiện NaN / ∞ (FR-06)              | `ok()` tự chuyển thành `fail`                      | `src/core/calc-output.test.ts`       |
| Lỗi hiện `— , —`, không hiện 0 (FR-06)  | `ResultBlock` giao hẳn cho `ErrorState`, một khuôn | `src/ui/result/ErrorState.test.tsx`  |
| Chuỗi người gõ không thành NaN          | `parseViNumber()` trả `null` chứ không trả NaN     | `src/core/format.test.ts`            |
| Ghi đè thắng cả khi thượng nguồn lỗi    | `resolveLinked()` xét `override` trước cảnh báo    | `src/core/linked-input.test.ts`      |
| Màu đạt tương phản AA (NFR-USA-06)      | Test đọc thẳng `globals.css` rồi tính tỉ số        | `src/ui/contrast.test.ts`            |
| Màu chỉ đi qua token                    | Test quét mọi `*.module.css` tìm mã màu viết thẳng | `src/ui/tokens.test.ts`              |
| Miễn trừ hiện ở mọi màn (FR-24)         | Đặt trong `AppShell`, không đặt ở từng màn         | `src/ui/layout/AppShell.tsx`         |
| Hằng số thuế/phí có căn cứ (LDR-03)     | `validateMarketConfig()` bắt bản ghi thiếu         | `src/core/market/market.test.ts`     |
| Công thức có đủ metadata (FR-03, FR-04) | Validator của Registry                             | `src/core/registry/registry.test.ts` |

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

- **2.5** Bottom sheet — PresetSheet (WF-10), PasteImportSheet (WF-11), ExportSheet (WF-12) (28h)
- **2.4.3** FormulaLatex — đang hoãn, cần quyết có thêm KaTeX hay không (3h)
- **3.1** Màn hình thật — WF-01 trang chủ, WF-02 danh sách có ảo hoá (nhánh 3, 130h)

Một việc chặn còn lại:

- **Số liệu thuế & phí** trong `src/core/market/schedules.ts` còn là bản thảo, cần người đối
  chiếu văn bản gốc (gói WBS 5.1.1). Chưa xong thì chưa phát hành v0.1.

Việc chặn "wireframe gốc không đọc được" đã gỡ: file HTML **đọc được**, nội dung nằm trong
chuỗi JS escape chứ không phải base64. Cách giải mã ghi ở [TASK.md](TASK.md), mục đợt 5.
