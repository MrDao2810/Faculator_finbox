# Falculator Finbox

Thư viện công thức tài chính và chứng khoán Việt Nam — tra cứu, tính toán, giải thích.
Web tĩnh, không backend, không cơ sở dữ liệu (SRS v2.0 mục 2.1 và 6.1).

> **Trạng thái:** mới xong bộ khung — gói WBS **1.1.1 Repo + toolchain** và **1.1.2 Pipeline + hosting**.
> Chưa có tính năng nào. 80 gói còn lại xem file estimate WBS v7.

---

## Chạy thử

```bash
npm install         # cài dependency, lần đầu mất 1–2 phút
npm run dev         # mở http://localhost:3000
```

Trang chủ tạm sẽ hiện con số **15,2 lần**. Con số đó đi từ `src/core` qua `src/application`
rồi mới tới giao diện — nếu nó hiện ra thì bốn tầng đã nối đúng.

## Các lệnh

| Lệnh | Việc |
| --- | --- |
| `npm run dev` | Chạy máy chủ phát triển, sửa file là tự nạp lại |
| `npm run build` | Build ra thư mục `out/` — toàn HTML tĩnh, đem đi host ở đâu cũng được |
| `npm run preview` | Xem thử bản build tĩnh |
| `npm run lint` | ESLint, **bao gồm cả ràng buộc ranh giới tầng CON-02 / CON-03** |
| `npm run typecheck` | Kiểm kiểu TypeScript, không sinh file |
| `npm test` | Unit test bằng Vitest |
| `npm run check` | Chạy cả ba: lint + typecheck + test. Dùng trước khi push |
| `npm run format` | Prettier định dạng lại toàn bộ |

---

## Kiến trúc bốn tầng

```
src/
├── app/            PRESENTATION  — trang Next.js (App Router), mỗi công thức một URL
├── ui/             PRESENTATION  — component dùng chung (nhánh 2 trong WBS)
├── application/    APPLICATION   — cửa duy nhất giữa giao diện và Domain
├── core/           DOMAIN        — TypeScript thuần, toàn bộ logic tài chính
└── data/           DATA          — DataProvider, bộ số liệu mẫu tĩnh
```

### Luật ranh giới — ESLint chặn thật, không phải quy ước suông

| Tầng | Không được import |
| --- | --- |
| `src/core` | `react`, `react-dom`, `next` · và mọi tầng bên trên |
| `src/data` | `react`, `next` · `@/ui`, `@/app` |
| `src/application` | `@/ui`, `@/app` |
| `src/app`, `src/ui` | `@/core/*`, `@/data/*` — phải đi qua `@/application` |

Thử nghiệm cho vui: thêm `import { useState } from 'react';` vào đầu
`src/core/calc-output.ts` rồi chạy `npm run lint`. Nó sẽ báo lỗi kèm mã ràng buộc CON-02.

Đây là thứ duy nhất ngăn logic tài chính rò rỉ dần vào component React. Đặt ở ngày đầu
gần như miễn phí; để sau mới gỡ thì rất đau.

---

## Bất biến quan trọng nhất — FR-06

**Không bao giờ hiển thị NaN, Infinity, hay 0 thay cho lỗi.**

Cách giữ: mọi hàm tính đều trả về `CalcOutput`, và chỉ được tạo ra qua `ok()` hoặc `fail()`.
Không hàm nào được `return someNumber` trần.

```ts
import { ok, fail } from '@/application';

export function pe(price: number, eps: number) {
  if (eps === 0) {
    return fail('lần', {
      code: 'DIVIDE_BY_ZERO',
      message: 'Chưa tính được P/E vì EPS bằng 0. Doanh nghiệp không có lợi nhuận trên mỗi cổ phiếu ở kỳ này.',
      fix: 'Nhập EPS khác 0 hoặc chọn kỳ khác',
    });
  }
  return ok(price / eps, 'lần');
}
```

`ok()` còn có lưới an toàn cuối: giá trị lọt vào `NaN` hay `Infinity` thì tự chuyển thành `fail`,
không phụ thuộc việc người viết công thức có nhớ kiểm tra hay không.

Sáu loại cảnh báo chuẩn (`WarningCode` trong `src/core/types.ts`) lấy đúng từ màn **WF-15**
của wireframe. Mỗi loại có thông điệp tiếng Việt và một dòng gợi ý sửa.

---

## Đưa lên mạng — Cloudflare Pages

Phần này cần tài khoản của bạn, tôi không tạo thay được.

1. Đẩy repo lên GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Điền đúng ba ô này:

   | Ô | Giá trị |
   | --- | --- |
   | Framework preset | `Next.js (Static HTML Export)` |
   | Build command | `npm run build` |
   | Build output directory | `out` |

4. Environment variables: `NODE_VERSION` = `20`.

Xong bước này thì mỗi lần push lên `main` là tự deploy, mỗi Pull Request có một URL preview riêng.

GitHub Actions ở `.github/workflows/ci.yml` chạy độc lập với Cloudflare: lint → typecheck →
test → build. Hỏng ở bước nào thì chặn merge ở bước đó.

---

## Việc tiếp theo theo WBS

Ba gói kế tiếp, theo đúng thứ tự phụ thuộc:

- **1.3.1** Schema Registry & bộ sinh — kiểu dữ liệu một công thức, validator, bộ sinh JSON
- **1.3.3** Hoàn thiện CalcOutput — hiện `src/core/calc-output.ts` mới là khung tối thiểu để CI có cái mà chạy
- **1.3.2** MarketConfig — hằng số thuế và phí có `effectiveFrom` + `legalBasis`

Nhưng trước cả ba, khuyến nghị làm **bản mẫu đồ thị phụ thuộc** (gói 5.3.1 → 5.3.3) với đúng
ba công thức Beta → CAPM → WACC. Nếu mô hình đó sai thì mọi thứ dựng trên nó phải làm lại.

---

## Đã kiểm chứng tới đâu

Máy ảo dựng dự án này không vào được registry npm, nên **chưa chạy được `npm install`**.
Những gì đã kiểm thật:

- ✅ `package.json`, `tsconfig.json`, `.eslintrc.json`, `.prettierrc` — JSON hợp lệ
- ✅ `.github/workflows/ci.yml` — YAML hợp lệ
- ✅ Cú pháp TypeScript của cả 4 file trong `src/core` và `src/application`
- ✅ Logic tầng Domain chạy thật: 12/12 khẳng định đúng (chặn NaN, chặn Infinity, kẹp min/max, cảnh báo kế thừa)
- ⬜ `npm install` → `npm run check` → `npm run build`: **bạn chạy trên máy mình**

Nếu bước cài có trục trặc phiên bản, sửa trong `package.json` rồi chạy lại — phần mã nguồn
trong `src/` không phụ thuộc phiên bản cụ thể.
