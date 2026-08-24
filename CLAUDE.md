# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Faculator Finbox — a Vietnamese financial/stock-formula library delivered as a **static site**:
no backend, no database (`next.config.mjs` sets `output: 'export'`, build artifact is `out/`).

**All 111 formulas** are implemented and registered in `src/core/formulas/` (17 group files
spread into `FORMULA_MODULES`); **all 12 categories sit exactly at their `expectedCount`**, so there
is no free slot anywhere. Two vitest cases hold that line — `formulas.test.ts` ("không nhóm nào vượt
số công thức dự kiến") and `registry.test.ts`, which hard-codes 98 / 13 / 111; the Registry validator
only downgrades an under-full category to a `warning`. Read that directory's README before adding
anything: a 112th formula is a product-scope decision, not a free addition. The jump from 107 to
108 (valuation 18 → 19, for `gia-tri-noi-tai-fcff`) was signed off by the project owner in package
5.2.3; three more "deliberately unregistered" formulas (`gia-muc-tieu`, `beta`, `xirr`) then closed
out 108 → 111 — full history in `src/core/registry/categories.ts`'s docblock. **The SRS table in
section 3.8 still says 94 / 13 / 107 and has to be corrected to 98 / 13 / 111.**

WBS branches 1 (foundation), 2 (component library), 3 (screens) and 4 (charts) are done, as are
packages 2.4.3 (maths notation) and **3.2.2 + 5.2.3** (the valuation chain and the WF-04 advanced
screen). Charts cover **100 of 111** formulas; the other 11 declare `chartType: 'none'` deliberately —
their output is a monotone function of one input, so a chart would say nothing.

The remaining work plan lives in the external "WBS v7" estimate and the SRS, referenced throughout
the code by requirement IDs (FR-xx, NFR-xx, CON-xx, LDR-xx, WF-xx wireframe screens). Progress log:
`TASK.md` — newest entry first.

**What blocks v0.1 is content, not code**, and two items remain: `src/data/samples.ts` is
fabricated (seeded PRNG, `isDraft: true` — never remove those draft markers while the numbers are
invented; three tests pin the flag), and the 111 explanations have not been peer-reviewed. The
third item is closed — the 7 tax/fee constants were checked against the source legal texts and
signed off on 17/08/2026, so `schedules.ts` no longer carries a draft label; `src/core/market/README.md`
keeps the evidence trail and names the three constants most likely to expire next.

**All prose is Vietnamese** — comments, JSDoc, commit-adjacent docs, test names, UI copy, and every
user-facing warning message. Write new code the same way.

## Commands

```bash
npm run dev            # dev server on :3000
npm run build          # static export to out/ (prebuild refuses to run while dev holds :3000)
npm run preview        # serve the built out/ on :4173 — never :3000, see package.json//preview
npm run lint           # ESLint — also enforces the layer boundaries (CON-02/CON-03)
npm run typecheck      # tsc --noEmit
npm test               # vitest run
npm run format         # prettier --write .
npm run format:check   # prettier --check .
npm run check          # lint + typecheck + format:check + test — run before pushing
npm run verify:static  # 24 assertions against a built out/ — run after build
npm run check:chrome   # 18 assertions in a real headless Chrome at 360×780 — needs out/ + Chrome
npm run size           # measures out/, gates First Load JS at 180 kB (NFR-PER-04 budget is 200 kB)
npm run gen:summaries  # regenerates src/core/formulas/summaries.generated.ts
npm run gen:icons      # regenerates the PWA PNGs from the icon geometry
```

Single test file / single case:

```bash
npx vitest run src/core/calc-output.test.ts
npx vitest run -t 'chặn Infinity'
```

One test is deliberately **not** colocated: `src/application/prose-audit.test.ts` guards the 432
explanation passages of the 111 formulas against contradicting their own `spec`/`calc` — it lives in
the Application layer because one of its seven checks reads `@/data/samples.ts`, which CON-02 forbids
`src/core` from importing. Read its docblock before adding a check to it: three earlier checks were
removed for producing 169 false positives between them, and the reasons are recorded there so nobody
rebuilds them.

Tests are `src/**/*.test.ts` and `*.test.tsx`, colocated next to the module under test. The default
environment is `node` (`vitest.config.ts`); a file that needs a DOM opts in with a
`// @vitest-environment jsdom` comment on line 1 rather than a global config — `environmentMatchGlobs`
is deprecated. CI (`.github/workflows/ci.yml`) runs lint → typecheck → format:check → test → build →
verify:static → size, then re-runs `gen:summaries` and fails if the committed generated file drifts.
A husky pre-commit hook runs lint-staged (eslint --fix + prettier).

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

**FR-15 runs for real since package 5.2.3.** All six `dependsOn` edges live in `valuation-dcf.ts`
and form two branches:

```text
capm ──► mo-hinh-gordon.requiredReturn ──► bien-an-toan.intrinsic
capm ──► wacc.costEquity ──► gia-tri-noi-tai-fcff.wacc ◄── fcff.fcff   ·   fcff ──► fcfe.fcff
```

The second branch converges — two upstreams into two _different_ variables of one formula.
`runChain()` also handles two upstreams into the _same_ variable (it takes the first source that
yields a number and only inherits when every source for that variable fails), though no Registry
edge exercises that yet. `runChain()` in `src/core/calc/run-chain.ts` is the
only caller of `inherited()` and the only writer of `ctx.upstream`; it deliberately does **not**
go through `runFormula()` when an upstream is broken, because that gate reports a blank linked
field as `INCOMPLETE_INPUT` — the wrong cause for a field the user never left blank. Two warnings
coexist on purpose: the input keeps the upstream's original code (`resolveLinked()`), the
downstream result gets `INHERITED`.

On screen this is the WF-04 half of package 3.2.2: `FormulaDetail` renders the chain block only
in **advanced mode** and only for formulas that `chainFor()` places in a chain — that is 7 of them
(`capm`, `wacc`, `mo-hinh-gordon`, `bien-an-toan`, `fcff`, `fcfe`, `gia-tri-noi-tai-fcff`), so 104
of 111 get nothing, and basic mode behaves exactly as before — which is why the four sweeps over
all 111 detail screens in `FormulaDetail.test.tsx` needed no changes. `src/ui/screens/ChainPanel.tsx` is
the `next/dynamic` boundary (same pattern as `FormulaChart`/`DetailBody`); never export
`ChainBody` from the `@/ui/screens` barrel or its cost lands on all 111 detail pages.

## Chart kinds

`ChartModel` is a three-way union: `line` (sensitivity sweep or time axis), `waterfall`
(breakdown), and `unavailable`. `ChartFrame` and `ChartFullscreen` take `DrawableChart` — the
union minus `unavailable` — so a fourth kind only needs a branch in `ChartBody`.

A formula gets a waterfall by declaring `spec.breakdown` (ordered stages, each with a `sign` and
an optional `shortLabel`, keyed to an input variable **or** to a key in the result's `extras`).
**All ten** formulas tagged `waterfall`/`stackedBar` now declare stages — nothing is left waiting.

`chartType` decides whether the breakdown is the _default_ view or merely an entry in the picker,
and across all ten the split is not arbitrary: the four `waterfall` ones (`ev`, `fcff`, `fcfe`,
`ncav-tren-co-phieu`) each have a **straight-line** sweep — slopes 1, 1−t, 1 and 1000/N — which is
exactly what `chartType: 'none'` exists to reject, so for them the breakdown _is_ the chart. The
six `stackedBar` ones keep the sweep as the default because it still says something: total interest
against term is a convex curve, and it is precisely what `lich-tra-no`'s own `commonMistakes` warns
about. Never promote a `stackedBar` formula to breakdown-by-default without checking what its sweep
would lose. Current split: 60 sweeps + 4 waterfalls + 34 waiting on a price series.

Two invariants hold it honest: the stages must sum to the formula's own result — a registry-wide
sweep in `chart.test.ts` enforces this for **every** formula that declares stages, and pins the
list of ids so a new one can't slip in unexamined — and the value axis must contain zero, because
bars need somewhere to stand. `lich-tra-no` shows the trap: the obvious "principal + interest"
stack sums to the total _paid_, while the formula's result is the interest alone, so the honest
decomposition inverts it (`total paid − principal borrowed = total interest`). Optional
`spec.breakdownTotal` names the total bar and the value axis, for formulas whose name is a _job_
rather than a _quantity_ ('Lịch trả nợ vay' labelling a bar that holds total interest).

Breakdown is an _entry in the axis picker_ (`BREAKDOWN_KEY`), exactly like the time axis, not a
separate screen, so `SweepPicker` and `ChartBody` stay unaware of it.

Other domain conventions already established: input controls are generated entirely from
`VariableSpec` rather than hard-coded (FR-05); user input is bounded with `clampToSpec()`, which
never throws and never returns NaN; tax/fee constants belong in `MarketConstant` records carrying
`effectiveFrom` + `legalBasis`, kept out of formula bodies (LDR-03, CON-10).

A formula whose `calc` reads a market constant must also **declare the key** in
`spec.usesConstants` — 13 of them do, across `derivatives.ts` (5), `fees.ts` (7) and `planning.ts`
(1). The declaration is what `ConstantsNote` reads to print the label, value, unit, effective date
and legal basis at the end of the Số liệu block; before it existed, `phi-giao-dich-mua` showed
138.000 ₫ without the 0,15% rate appearing anywhere on the page. Declare the **key only** — the
value keeps flowing from `schedules.ts`, so a rate change moves the screen with it, whereas a
number copied into prose rots silently and lint cannot see it. `constants-gate.test.ts` holds both
directions: a source scan catches an undeclared call site, and pulling each declared key out of the
schedule must break the formula, which catches a declaration the calc never uses.

## Notes

- TypeScript is strict with `noUncheckedIndexedAccess` — indexing an array yields `T | undefined`.
- Every formula is a `FormulaModule` — `spec` (metadata) and `calc` (the maths) in one object, so
  a spec without a calculator is a typecheck error. `runFormula()` in `src/core/calc/` is the only
  way to call one; it turns a blank field into an "incomplete input" warning rather than a zero,
  and catches throws. The `tests[]` each spec declares are executed by `formulas.test.ts`.
- **KaTeX runs at build time only.** `src/app/cong-thuc/[id]/latex-html.ts` is imported solely by
  `page.tsx`, which is a server component, so with `output: 'export'` the maths notation is baked
  into the static HTML of all 111 pages and the browser downloads **zero** bytes of KaTeX
  (the library is ~280 kB — importing it from a client component blows the 180 kB gate instantly).
  Output mode is `mathml`, not the default `htmlAndMathml`: measured on this repo's own formulas it
  is 6 kB gzip instead of 20 kB, needs no `katex.min.css` and no font files at all, and — the
  deciding factor — KaTeX's HTML builder has no character metrics for Vietnamese diacritics, which
  every formula uses inside `\text{}`. `verify-static.mjs` asserts `<math` is present in
  `out/cong-thuc/pe/index.html` and that no `katex-html` class or font reference came with it;
  that is the only check that can tell build-time rendering from client-time rendering.
- **Nothing under `src/ui/charts/` may call `useId()`.** That whole directory sits behind the
  `next/dynamic` boundary in `FormulaChart.tsx`, where React's generated ids differ between the
  static HTML and the client hydration pass — measured as 5 hydration warnings per chart page. Every
  id there is derived from `formula.spec.id` and threaded down as an `idBase` prop, with a `-full`
  suffix for the fullscreen copy so the two `<pattern>` nodes that coexist stay unique. This includes
  shared primitives: `SweepPicker` passes an explicit `id` to `Select` instead of letting it generate
  one. `charts.test.tsx` fails if any id in the chart subtree matches React's `:r…:` / `«…»` shape.
- **On-screen text goes through `useT()`** (client components) or the client leaf `<T k="…">`
  from `src/ui/i18n/T.tsx` — the leaf is what server components use (home page, AppShell), and
  also what a component rendered on _both_ sides must use (`FormulaCard` is reached from both
  `FormulaBrowser` and the server-rendered `StaticFormulaList`, so a hook would crash the server
  pass). The static `t()` import from `@/application` is frozen to Vietnamese at build time, so
  a gate in `i18n.test.ts` scans **all of `src/ui` + `src/app`** and fails any file importing it
  that is not on a four-entry allowlist, each entry carrying its reason: `layout.tsx` metadata,
  the SEO fallback `StaticFormulaList`, and the print/PNG regions of `ExportSheet`/`draw-card`
  (exported files are all-Vietnamese documents, including the disclaimer they carry — see next
  point). The gate scans by directory on purpose: an earlier version keyed off the `'use client'`
  directive and missed three shared modules that carry no directive but land in the client bundle
  anyway. A second case fails any allowlist entry that no longer needs to be there.
- The English dictionary is complete (`missingKeys('en')` is empty) — `disclaimer.text` (FR-24)
  was the last holdout and is now translated too, read through `DisclaimerBar.tsx`'s `<T>` leaf.
  It stays a deliberate paraphrase, not a literal translation pair: `buildExportContent()` never
  reads this i18n key — every export (PDF/PNG) always attaches `DISCLAIMER_VI` verbatim regardless
  of the on-screen locale, because exported files are intentionally all-Vietnamese documents (see
  next point). So the on-screen disclaimer now follows locale like everything else, while the one
  inside an exported file stays fixed in Vietnamese — the same split every other piece of content
  already has between the live UI and a downloaded document.
- Display labels that the Domain also owns (`UNIT_SCALES[].label`, `COLUMN_LABELS`) are duplicated
  as i18n keys, with a test tying the Vietnamese side to the Domain string verbatim — CON-02 keeps
  `src/core` from reading i18n, so the copy is deliberate and the anchor test is what keeps the two
  from drifting. Chart axis titles are the remaining exception: `build.ts` bakes
  `${name} (${scale.label})` into `ChartModel`, and since that string also carries the formula
  name, it waits for the content-translation pass.
- The product name is **Faculator Finbox** — no `l`. An earlier misspelling "Falculator" was
  scrubbed from the whole repo; if it reappears in UI copy, in an export filename (`faculator-<id>`),
  or in the `pages.dev` fallback in `src/app/site-url.ts`, that is the typo coming back. The npm
  package and the Cloudflare Pages project are `faculator-finbox`; the local directory and the
  GitHub repo are still named `Faculator_finbox`, which is fine — neither is user-visible.
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
