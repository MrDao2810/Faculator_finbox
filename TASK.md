# TASK — WBS 1.1 → 1.3.3 (Nền tảng kỹ thuật)

Trạng thái chung: **đang chờ xác nhận**. Toàn bộ gói trong phạm vi đã code xong, `npm run check`
và `npm run build` đều xanh. Còn hai việc phải người quyết, ghi ở mục "Việc còn lại".

## Phạm vi và trạng thái từng gói

| Gói   | Nội dung                                    | Giờ WBS | Trạng thái                                       |
| ----- | ------------------------------------------- | ------- | ------------------------------------------------ |
| 1.1.1 | Repo + toolchain                            | 3h00    | Đã có từ trước                                   |
| 1.1.2 | CI/CD + hosting tĩnh                        | 3h30    | Đã có từ trước                                   |
| 1.2.1 | Design token & primitive                    | 10h00   | Xong                                             |
| 1.3.1 | FormulaRegistry: schema, bộ sinh, validator | 7h00    | Xong                                             |
| 1.3.2 | MarketConfig thuế & phí                     | 3h30    | Xong phần code — **số liệu chờ người đối chiếu** |
| 1.3.3 | Chuẩn CalcOutput & hệ cảnh báo              | 4h00    | Xong                                             |

## Đã đổi file nào, vì sao

### 1.3.3 — CalcOutput & hệ cảnh báo

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

### 1.3.1 — FormulaRegistry

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

### 1.3.2 — MarketConfig

- **`src/core/market/types.ts`** (mới) — `MarketConstantKey` là union chứ không phải string tự do,
  nên công thức gõ sai khoá là hỏng lúc typecheck. `FeeSchedule` để WF-08/WF-13 có ô chọn biểu phí.
- **`src/core/market/schedules.ts`** (mới) — biểu phí "Mặc định HOSE 2026", 7 hằng số, mỗi hằng số
  có `effectiveFrom` + `legalBasis` (LDR-03, CON-10).
- **`src/core/market/resolve.ts`** (mới) — `resolveConstant(schedule, key, asOf)` lấy bản ghi mới
  nhất còn hiệu lực; `resolveRate()` đổi phần trăm sang hệ số theo CON-05; `validateMarketConfig()`.
  `asOf` là tham số bắt buộc, Domain không tự lấy ngày hệ thống (NFR-REL-03).
- **`src/core/market/index.ts`**, **`src/core/market/market.test.ts`** (mới) — 17 ca.

### 1.2.1 — Design token & primitive

- **`src/app/globals.css`** — mở rộng từ 6 biến lên hệ token đầy đủ: màu, thang chữ, khoảng cách,
  bo góc, đổ bóng, vòng focus, vùng chạm 44px, `@media (prefers-reduced-motion)`, `.visually-hidden`.
- **`src/ui/contrast.ts`** + **`src/ui/contrast.test.ts`** (mới) — công cụ tính tương phản WCAG 2.1.
  Test **đọc thẳng `globals.css`** rồi kiểm từng cặp màu, nên đổi màu mà tụt dưới AA là CI đỏ ngay,
  không phải chép màu sang file TS rồi để hai nơi lệch nhau (NFR-USA-06).
- **`src/ui/primitives/`** (mới) — `Button`, `Input`, `Card`, `Chip`, `Table` kèm CSS Module.
  `Table` có vùng cuộn ngang riêng theo NFR-USA-02. Trạng thái phân biệt bằng viền + nhãn chữ,
  không chỉ bằng màu.
- **`src/ui/README.md`** — ghi lại đã có gì, nhánh 2 dựng tiếp trên đó.

### Nối tầng

- **`src/application/index.ts`** — mở cửa cho registry, market và catalog cảnh báo. Vẫn là barrel
  chọn lọc, không `export *`.
- **`src/app/page.tsx`** — trang smoke test cập nhật để chứng minh cả ba gói chạy: hiện 12 nhóm,
  bảng biểu phí tra theo ngày, và bộ primitive. Gói 3.1.1 sẽ thay bằng WF-01 thật.

## Kết quả kiểm tra

```
npm run lint       ✔ No ESLint warnings or errors
npm run typecheck  ✔ không lỗi
npm test           ✔ 104 test / 5 file, tất cả xanh
npm run build      ✔ static export, First Load JS 107 kB (ngưỡng NFR-PER-04 là 200 kB)
```

## Việc còn lại — cần người quyết

1. **Số liệu thuế & phí trong `src/core/market/schedules.ts` là BẢN THẢO.** Gói WBS 5.1.1 ghi rõ
   người phải đối chiếu văn bản gốc. Cần kiểm: mức phí môi giới mặc định 0,15% (đang để là mức phổ
   biến trên thị trường, không phải mức luật định), thuế chuyển nhượng 0,1%, thuế cổ tức 5%, phí lưu
   ký 0,27 ₫/CP/tháng, và toàn bộ ngày `effectiveFrom`. Chưa kiểm xong thì chưa phát hành v0.1.
2. **Chốt Next.js hay Vite.** SRS và bảng Estimate ghi toolchain Vite + React; repo đang là Next.js
   App Router với `output: 'export'`. Kết quả bàn giao như nhau (web tĩnh), nhưng tài liệu và code
   đang nói hai chuyện — nên sửa một trong hai.

## Ghi nhận baseline (không thuộc phạm vi task này)

- `npm install` báo `next@15.1.6` có lỗ hổng bảo mật đã được vá ở bản sau (CVE-2025-66478), cùng
  6 cảnh báo `npm audit`. Chưa nâng vì nâng dependency phải hỏi trước.
- `prettier --check .` báo `CLAUDE.md` và `README.md` sai định dạng từ trước. Chưa động vào để khỏi
  lẫn với diff của task này.
