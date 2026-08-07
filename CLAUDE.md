# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Falculator Finbox — a Vietnamese financial/stock-formula library delivered as a **static site**:
no backend, no database (`next.config.mjs` sets `output: 'export'`, build artifact is `out/`).
WBS branches 1 (foundation), 2 (component library) and 3.1–3.2 (screens) are done, minus packages
2.4.3 (KaTeX, deferred) and 3.2.2 (WF-04, deferred). **21 of 107 formulas** are implemented in
`src/core/formulas/` — see its README before adding more. The remaining work plan lives in the
external "WBS v7" estimate and the SRS, referenced throughout the code by requirement IDs
(FR-xx, NFR-xx, CON-xx, LDR-xx, WF-xx wireframe screens). Progress log: `TASK.md`.

**All prose is Vietnamese** — comments, JSDoc, commit-adjacent docs, test names, UI copy, and every
user-facing warning message. Write new code the same way.

## Commands

```bash
npm run dev          # dev server on :3000
npm run build        # static export to out/
npm run preview      # serve the built out/
npm run lint         # ESLint — also enforces the layer boundaries (CON-02/CON-03)
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run check        # lint + typecheck + test — run before pushing
npm run format       # prettier --write .
```

Single test file / single case:

```bash
npx vitest run src/core/calc-output.test.ts
npx vitest run -t 'chặn Infinity'
```

Tests are `src/**/*.test.ts` (Node environment, no jsdom — colocated next to the module under test).
CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build; a husky pre-commit hook runs
lint-staged (eslint --fix + prettier).

## Four-layer architecture

```
src/app/          PRESENTATION  Next.js App Router pages (one URL per formula)
src/ui/           PRESENTATION  shared components
src/application/  APPLICATION   the only door between UI and Domain
src/core/         DOMAIN        pure TypeScript, all financial logic
src/data/         DATA          DataProvider + static sample datasets (drafted, not real)
```

The boundaries are **enforced by ESLint**, not convention (`.eslintrc.json` per-directory
`no-restricted-imports` overrides):

| Layer               | May not import                                           |
| ------------------- | -------------------------------------------------------- |
| `src/core`          | `react`, `react-dom`, `next` · any layer above it        |
| `src/data`          | `react`, `next` · `@/ui`, `@/app`                        |
| `src/application`   | `@/ui`, `@/app`                                          |
| `src/app`, `src/ui` | `@/core/*`, `@/data/*` — must go through `@/application` |

Consequence: anything in `src/core` that the UI needs must be **re-exported from
`src/application/index.ts`**. That file is a deliberate curated barrel, not a wildcard re-export —
add each type/function explicitly. `@/*` maps to `./src/*` (tsconfig paths, mirrored in
`vitest.config.ts`).

## The core invariant — FR-06

**Never surface NaN, Infinity, or 0 in place of an error.**

Every calculation function returns `CalcOutput` (`src/core/types.ts`), constructed only via
`ok()`, `fail()`, or `inherited()` from `src/core/calc-output.ts`. No function may
`return someNumber` bare. `ok()` is the last safety net: a non-finite value is converted to a
`fail` automatically, so correctness doesn't depend on each formula author remembering to check.

`fail()` requires a `CalcWarning`, whose `code` must be one of the six `WarningCode` values fixed by
wireframe WF-15 (`DIVIDE_BY_ZERO`, `MEANINGLESS`, `MISSING_SERIES`, `MODEL_VIOLATION`, `INHERITED`,
`INCOMPLETE_INPUT`). Messages are plain-language Vietnamese explaining the cause, plus a one-line
`fix` suggestion (NFR-USA-04). Downstream formulas whose upstream failed must use `inherited()`
rather than silently producing a number (FR-15).

Other domain conventions already established: input controls are generated entirely from
`VariableSpec` rather than hard-coded (FR-05); user input is bounded with `clampToSpec()`, which
never throws and never returns NaN; tax/fee constants belong in `MarketConstant` records carrying
`effectiveFrom` + `legalBasis`, kept out of formula bodies (LDR-03, CON-10).

## Notes

- TypeScript is strict with `noUncheckedIndexedAccess` — indexing an array yields `T | undefined`.
- Every formula is a `FormulaModule` — `spec` (metadata) and `calc` (the maths) in one object, so
  a spec without a calculator is a typecheck error. `runFormula()` in `src/core/calc/` is the only
  way to call one; it turns a blank field into an "incomplete input" warning rather than a zero,
  and catches throws. The `tests[]` each spec declares are executed by `formulas.test.ts`.
- Naming is inconsistent upstream: the package/directory is `faculator-finbox`, the product name in
  README and page metadata is "Falculator Finbox". Match whichever context you are editing.
- Deployment target is Cloudflare Pages (framework preset "Next.js (Static HTML Export)", build
  output `out`, `NODE_VERSION=20`); keep the build compatible with pure static hosting —
  `trailingSlash: true` and unoptimized images are set for that reason.

# Quy tắc riêng của tôi (Đào)

> Phần này là quy tắc cá nhân, áp dụng cho mọi dự án. Paste vào cuối `CLAUDE.md` của từng dự án. Khi có xung đột, quy tắc trong phần chính của dự án (phía trên) được ưu tiên hơn.

## Ngôn ngữ & giao tiếp

- Luôn trả lời bằng **tiếng Việt**. Giữ nguyên tên hàm, biến, thuật ngữ tiếng Anh (không dịch `provider`, `state`, `repository`, `interceptor`...).
- Ngắn gọn, đi thẳng vào việc; hạn chế giải thích thừa. Với đoạn phức tạp thì giải thích ngắn kèm ví dụ.
- Không dùng emoji nếu tôi không yêu cầu.
- Cuối mỗi task: tóm tắt ngắn **đã đổi file nào và vì sao**.
- Nếu cách làm có rủi ro (breaking change, ảnh hưởng bảo mật, mất dữ liệu, sửa API dùng chung), phải **nói rõ trước khi làm**.

## Cách làm việc

- Với task lớn hoặc yêu cầu mơ hồ: **trình bày kế hoạch và chờ tôi duyệt** trước khi sửa code. Task nhỏ, rõ ràng thì làm luôn.
- **Đọc code liên quan trước khi sửa** — hiểu convention hiện có của dự án rồi mới viết, không đoán. Bám theo style của file đang sửa.
- Chia thành **thay đổi nhỏ, từng bước**; tránh sửa lan man nhiều file cùng lúc khi không cần.
- TODO tiến độ phải nằm trong task log/spec theo quy trình của dự án (xem mục dưới). Chỉ thêm `// TODO:` vào source khi đó là việc kỹ thuật thực sự chưa thể hoàn thành; không dùng comment TODO để đánh dấu mọi chỗ vừa sửa.

## Ghi chú tiến độ (task log)

- Mỗi task duy trì **một file ghi chú riêng**: mặc định `TASK.md` ở thư mục làm việc; nếu dự án theo quy trình `.kiro` thì dùng `.kiro/specs/<task-slug>/TASK.md`.
- Sau mỗi lần sửa, ghi lại vào file này: **đã đổi file nào**, **sửa gì / vì sao**, **trạng thái** (done / đang làm / còn lỗi), và **việc còn lại** nếu có.
- Nếu review vẫn còn lỗi: cập nhật mục còn-lại trong task log, đánh dấu phần đó là "chưa xong" rồi tôi mô tả lại lỗi để sửa tiếp. Chỉ chuyển task sang **done** khi tôi xác nhận đã ổn.
- Task log là nơi theo dõi tiến độ; **không** rải `// TODO:` khắp source để thay cho việc này.

## Chất lượng & kiểm chứng

- **Không tự ý thêm dependency/thư viện mới** khi chưa hỏi. Ưu tiên dùng thứ dự án đã có.
- Sau khi sửa: chạy **lint/format** phù hợp với phạm vi thay đổi và sửa hết lỗi/cảnh báo mới do task tạo ra. Nếu baseline đã có lỗi, ghi lại bằng chứng và không tự mở rộng scope để sửa lan man.
- Thêm/cập nhật **test** cho code mới; chạy test hiện có để chắc không làm hỏng chỗ khác.
- Trước khi báo xong: **tự review lại diff**, kiểm tra logic và edge case (null, rỗng, lỗi mạng, giá trị biên).
- Không sửa file sinh tự động bằng tay (`*.g.dart`, `*.freezed.dart`, `*.gr.dart`, snapshot, build output...); sinh lại bằng lệnh của dự án.

## Commit

- **Không tự chạy `git commit`.** Sau khi code xong, chỉ **đề xuất commit message** để tôi tự commit.
- Message theo chuẩn **Conventional Commits**, viết bằng **tiếng Anh**: `type(scope): mô tả ngắn`.
  - `type` thường dùng: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`.
  - `scope` là tên feature/module liên quan (vd `feat(watchlist): ...`, `fix(auth): ...`); bỏ qua nếu không rõ.
  - Dòng đầu ngắn gọn (~50 ký tự, không dấu chấm cuối, dùng thể mệnh lệnh: "add", "fix", không phải "added"/"fixes").
- **Commit nhỏ, mỗi commit một ý** (một thay đổi logic). Nếu task chạm nhiều việc, đề xuất tách thành nhiều commit với message riêng cho từng phần.
- Chỉ commit file cần thiết; tôn trọng `.gitignore`, không đưa file build/generated không cần vào commit.
