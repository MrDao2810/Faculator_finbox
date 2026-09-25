# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Faculator Finbox — a Vietnamese financial/stock-formula library delivered as a **static site**:
no backend of its own, no database (`next.config.mjs` sets `output: 'export'`, build artifact is
`out/`). It does make **one** outbound call at runtime — the browser fetches ticker lists and market
prices from `dcs.finbox.vn` for the portfolio tab; see "The one network call" below before adding
any other.

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
screen). Charts cover **102 of 111** formulas; the other 9 declare `chartType: 'none'` deliberately.
The test is **"is the sweep a straight line"**, not "is the formula simple": the 9 are all a product
or a difference of their inputs, so the sweep is a line through the origin that the `expression`
line above it already tells you. An audit re-derived this from the Registry and moved two formulas
out of that group — `so-hop-dong-toi-da` (a floor division, so the sweep is a **staircase**) and
`gia-von-trung-binh-dca` (the unknown sits in the denominator, so the sweep is a **curve**). Each of
the 9 now carries its reason at the declaration; the shared one for the five fee/tax formulas is in
`fees.ts`'s file docblock.

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
#                        ...and the hazard runs BOTH ways: `next build` and `next dev` share
#                        `.next`, so a build writes production artifacts there and the next
#                        `npm run dev` reads them and dies with `Cannot find module './NNN.js'`
#                        from `.next/server/webpack-runtime.js`. The guard only covers one
#                        direction. Cure: delete `.next` (and `out/`) with no server running.
npm run preview        # serve the built out/ on :4173 — never :3000, see package.json//preview
npm run lint           # ESLint — also enforces the layer boundaries (CON-02/CON-03)
npm run typecheck      # tsc --noEmit
npm test               # vitest run
npm run format         # prettier --write .
npm run format:check   # prettier --check .
npm run check          # lint + typecheck + format:check + test — run before pushing
npm run verify:static  # 42 assertions against a built out/ — run after build
npm run check:chrome   # 147 assertions in a real headless Chrome (360×780, 560 and 1440) — needs out/ + Chrome
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
src/data/         DATA          DataProvider (static samples) + MarketFeed (live Finbox calls)
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
in **advanced mode** and only for formulas that `chainFor()` places in a chain — **5 of them**
(`wacc`, `mo-hinh-gordon`, `bien-an-toan`, `fcfe`, `gia-tri-noi-tai-fcff`), so 106 of 111 get
nothing, and basic mode behaves exactly as before — which is why the four sweeps over
all 111 detail screens in `FormulaDetail.test.tsx` needed no changes. `src/ui/screens/ChainPanel.tsx` is
the `next/dynamic` boundary (same pattern as `FormulaChart`/`DetailBody`); never export
`ChainBody` from the `@/ui/screens` barrel or its cost lands on all 111 detail pages.

**The block shows upstream steps only, and has no diagram** — both cuts made 16/09/2026 by the
project owner, who read the block three times and could not tell what it was for. `chainFor()`
stops at ancestors, so `capm` and `fcff` (which feed others but take nothing) now render no block
at all. The removed pieces were a `FlowChainStrip`/`FlowChainTree` picture of the dependency graph
(every fact it drew was already on the step cards below it), the "Bước sau" half (it only answered
"where does this number go"), the group headings and the intro line (three rewrites, each one
explaining the picture). Do not rebuild any of them: what makes the block legible is its own
title — "Số liệu lấy từ công thức khác" — plus the source label `LinkedInput` prints under the
field that receives the number.

**Each step card is titled by the number it supplies, not by the formula that computes it**
(17/09/2026). The summary row reads `Giá trị nội tại ước tính (V) … 25.925,93 ₫`, the receiving
field's label word for word, over a muted second line `kết quả của Mô hình Gordon (DDM một giai
đoạn), dùng cho Biên an toàn` (`chain.resultOf` / `chain.usedFor`). The owner circled the bare
`17 %` beside "CAPM — chi phí vốn chủ sở hữu" and said users could not tell where it came from:
the number had no name, nothing on the card said where it went, and on PC the block sits under
"Ví dụ thực tế", far from the field it feeds, so the cards read as part of the example. The owner
chose this over keeping the formula name plus a caption, and kept the block's PC position. The
second line follows the static `dependsOn` edge, not override state; `LinkedInput` shows that at
the field. `ChainBody.test.tsx` sweeps every chain page for it.

## The one network call — `MarketFeed`

**The site now calls one external server at runtime**, and that reverses a constraint the repo used
to state absolutely. Until the "Danh mục dùng số liệu thật" package, `public/_headers` locked
`connect-src 'self'` with the comment _"sản phẩm không gọi máy chủ nào"_. It now reads
`connect-src 'self' https://dcs.finbox.vn`. One origin, no wildcard, signed off by the project
owner. Any new outbound call needs the same sign-off — do not widen this quietly.

`src/data/finbox/` is the **second** data port, deliberately separate from `DataProvider`:

|         | `DataProvider` (`src/data/types.ts`) | `MarketFeed` (`src/data/finbox/types.ts`)      |
| ------- | ------------------------------------ | ---------------------------------------------- |
| Shape   | synchronous                          | `Promise` + `AbortSignal`                      |
| Serves  | 4 WF-10 presets, full 248-bar series | ~1.649 tickers, price for the last 10 sessions |
| Used by | "Nạp mẫu" on all 111 detail screens  | `/danh-muc/`, and `?ma=` on a detail screen    |

`DataProvider` stays synchronous exactly as its docblock promises — a `Preset` requires bars _and_
fundamentals, which a ticker list has neither of, so folding the two together would mean inventing
fields. `presetFromSnapshot()` in `src/data/live-preset.ts` bridges back the other way, so
`presetInputs()` serves both sources.

Four things that are easy to break here:

- **Only ticker codes leave the device.** Quantities, cost prices and buy dates never enter a
  request — `client.ts` sends `{symbols}` and `{ticker}`, nothing else, and a case in
  `PortfolioScreen.test.tsx` asserts the seeded quantity, cost price and buy date appear in no
  call. **The product no longer says this on screen, anywhere.** `portfolio.localOnly` (the
  "CỤC BỘ" strip) and `settings.data.note` went on 09/09/2026, and `quiz.localOnly` ("Kết quả
  lưu trên máy bạn, không gửi đi đâu…") followed on 24/09/2026 — three removals, all at the
  project owner's request, all the same call: **drop the sentence, keep the behaviour**. So
  COM-03 here and LDR-04 · NFR-SEC-01 in the quiz block now rest on behaviour and on
  `public/_headers`, not on any sentence a user can read. That was deliberate, not a dropped
  gate; the reasoning sits in `vi.ts` beside each removed key. Do not rebuild any of the three
  without asking — a missing privacy sentence reads like an oversight, and it isn't.
- **`LIVE_PRESET_FORMULAS` is pinned data, not a computation.** Deriving it needs `spec.variables`
  for all 111 formulas, i.e. the whole Registry in `/danh-muc/`'s bundle (measured elsewhere:
  131 kB → 217 kB against a 180 kB gate). `live-preset.test.ts` recomputes it from the real
  Registry and compares line by line, so it cannot drift silently.
- **`MarketFeed.priceHistory()` is per-ticker, so only the detail screen may call it.** Its source,
  `POST /v1/getTickerDetail`, takes one ticker per request (`{ticker}`, not `{symbol}` — the latter
  returns HTTP 400), so wiring it into `/danh-muc/` would turn one request for a 12-holding
  portfolio into thirteen. It returns `tendays` — 10 sessions, and note the shape trap: the field is
  a **JSON string**, not an array, ordered newest-first. Those 10 sessions clear `MIN_SESSIONS = 5`,
  so a real ticker finally draws a time axis (9 formulas measured) — but they do **not** clear
  RSI-14 / SMA-20, which must keep saying they are short of sessions. It is best-effort: a failure
  there degrades to the old one-session behaviour and must never take the fundamentals down with it
  (`priceHistoryOrEmpty()` in `live-preset-loader.ts`, pinned by tests). And `presetFromSnapshot()`
  takes the history as an **optional** third argument on purpose — `LIVE_PRESET_FORMULAS` is
  computed without it, because that pinned table is a promise made to a screen that never fetches it.
- **`FormulaDetail` reads `?ma=` from `window.location.search` inside an effect, never
  `useSearchParams()`.** With `output: 'export'` that hook forces the subtree into `<Suspense>` and
  Next drops it from the static HTML — all 111 detail pages would lose their build-time MathML and
  `verify:static` fails on the `<math` assertion in `out/cong-thuc/pe/index.html`.

The service worker does not touch these calls at all: `handles()` in `public/sw.js` rejects
cross-origin and non-GET. Offline behaviour is therefore hand-rolled, with **two** caches and one
rule that governs the second:

- The ticker list, in `localStorage` with a 24 h TTL (`ticker-list-store.ts`).
- Market prices, in `localStorage` with a 7-day TTL (`price-cache-store.ts`). This one used to be
  forbidden — `ticker-list-store.ts` carried the reason in writing: showing a stale price without
  saying it is stale is exactly the "wrong number that looks right" FR-06 exists to stop. That
  reason still stands; what changed is that `TickerSnapshot` now carries `asOfDate` (from Finbox's
  `date` field, cross-checked against `GET /v1/getMarketDates` to confirm it is a real **trading
  session**, not today echoed back). So the cache is allowed **only** because the screen can name
  the session it is quoting. `PriceState` gained a third value `'stale'` for this, and
  `PortfolioScreen.test.tsx` pins that the session date renders whenever it is in effect. Do not
  loosen that pairing.

`summarisePortfolio(…)` treats `'stale'` and `'failed'` alike for the _missing price_ warning —
both mean "could not reach the source", so the advice is "retry", never "remove the ticker".
Never let a network failure produce a `0` (FR-06).

The 4 portfolio tiles are now **6**: total value, invested, gain/loss (with the percentage as its
`note`), beta, XIRR, holdings count. `totalCost` is deliberately independent of market price — it
is the one real number that survives an outage, which is why the header does not go blank offline.
`gain` **inherits** rather than computing: `total` sums `row.value ?? 0`, so subtracting cost from
it directly would invent a loss exactly the size of an unpriced holding's cost basis.

**The holdings list is ONE `<table>` that takes three shapes** (22/09/2026, from a design the owner
supplied). At ≥1024px it is an eight-column table — code, company, quantity, avg cost, market
price, value, gain/loss (amount over percentage), weight (number plus a bar) — plus a ninth column
carrying the chevron. From 560px to 1023px it is the same table minus its two widest columns,
company and value: both `<th>` and `<td>` go `display: none`, so the column stops existing rather
than standing empty, and the `:nth-child` alignment rules keep working because `:nth-child` counts
hidden cells too. Below 560px CSS drops it back to the three-column compact row of wireframe WF-06,
which reverses the 09/2026 decision that had moved market price, gain percentage, buy date, beta
and the company name _down_ into the expanded block; only buy date and beta stay there now.

The middle shape was added the same day, after the owner photographed a narrow window: the compact
row is a **two-sided** layout, so every pixel of spare width drains into the gap between the left
text and the right numbers — at 900px that gap was over 400px wide ("ở giữa đang thừa quá nhiều
không gian… màn web và mobile phải khác nhau về giao diện"). 560 is the floor because that is where
`60.000 ₫` still fits its cell; the padding drops to `--space-2` there to buy the 48px that makes it
fit, and phones in portrait (up to 430px) never reach it. Five rules hold all of this together and
none of them is cosmetic:

- **One DOM, not two.** Rendering a table and a card list and hiding one would put every number in
  the document twice — screen readers read both, and `getByText` reports "multiple elements".
  Picking a tree from the viewport at runtime is also out: the first client render must equal the
  static HTML, which does not know the screen width. So `<table>`, `<tbody>` and `<caption>` all
  switch `display` together; leaving any of them at a `table-*` value inside a `display: block`
  table makes the browser generate an anonymous table box and every grid rule on `<tr>` dies
  silently, at exactly the width no gate measures. `chrome-check.mjs` counts distinct cell tops at
  360, at 560 and at 1440 for that reason — many at 360, exactly one at the other two.
- **The clickable thing stays an empty overlay `<button>`** anchored on the `<tr>` by
  `position: relative`. Wrapping the row in a button makes `aria-label` swallow every number in it
  — already broken twice, see the docblock in `PortfolioScreen.tsx`. A Chrome assertion measures
  the button's box against the row's.
- **The detail row's `<td>` switches `display` with the table, and the two halves are one rule.**
  In either _table_ shape it must stay `table-cell`: any other value makes the browser wrap it in
  an anonymous cell with `colspan=1`, which silently throws away `colSpan={9}` — the expanded
  content lands in column one, stretches it to the width of the button row, and shoves the other
  columns right, but only on the open row, so the whole table jumps on every click. In the compact
  shape it must become `block` for the mirror-image reason: the table itself is `display: block`
  there, so a lone `table-cell` is a stray table fragment, the browser wraps it in an anonymous
  table box, and that box **shrinks to fit** — the expanded block ends up only as wide as the
  Sửa/Bỏ mã buttons, hard against the left edge, with half the card empty beside it. Both were live
  bugs on 22/09/2026 and both now have a Chrome assertion. For the same family of reasons the table
  is `table-layout: fixed` with per-column widths, `text-align` is keyed to the column position so
  a `<th>` and its `<td>` cannot drift apart, and the action buttons are pushed right with
  `margin-left: auto` (most holdings have neither buy date nor beta, so `space-between` with a
  single child leaves them on the left).
- **Nothing optional renders an empty shell.** The expanded block's `<dl>` is built only when the
  holding actually has a buy date or a beta — an empty `<dl>` still eats a `gap` and still leaves
  `.actions`' top divider ruling off a blank strip, which is the _common_ case since both fields are
  optional. `.holdDetailInner > .actions:first-child` drops the divider to match. Same day, the
  compact row's gain cell was pinned to `grid-row: 2 / span 2`: auto-placement had been dropping it
  into row three (the cursor was already there after three stacked middle cells), leaving the right
  half of row two blank and letting the percentage hang below the row — the hole in the middle of
  the card the owner circled.
- **A ticker with no market price shows `_ _` in all four dependent cells**, never `0`. The owner
  chose that over repeating a sentence four times across one row; the reason and the way out live
  on the block's title line, which now carries `NẮM GIỮ · N mã · giá phiên <date>` **and** the
  refresh button — merged from the strip that used to sit above the list, because printing the
  session date twice would make two sources of truth for it. `portfolio.priceMissing` was deleted
  in that round (tombstone in `vi.ts`); the session-date pairing that `price-cache-store.ts`
  depends on is unchanged. **That title line has two shapes of its own**: below 1024px it is a
  two-column grid with the price strip on its own full-width row (`grid-column: 1 / -1`), above it
  a flex row of three. It used to be nested flex boxes relying on wrapping, and at phone width the
  price strip wrapped to a second line but kept its _content_ width — stopping mid-screen, forcing
  "Làm mới" onto a third line inside itself, with "+ Thêm mã" left hanging. A grid track is a
  promise about width; wrapping is only a measurement result.
- **The add/edit form is a centred modal**, `BottomSheet` with `placement="center"` — 720px wide,
  exactly half of the 1440 gate — and it only mounts while open, so its labelled fields cannot be
  found while it is closed. The ticker and formula sheets open _on top_ of it, so any test looking
  for "the sheet" must take the topmost `<dialog open>`, not the only one. The old
  `scrollIntoView` effect went with it: a modal has no distance to scroll. Two things about it are
  load-bearing rather than decorative. `.panelCenter` **must be declared after `.panel`** in
  `BottomSheet.module.css`: both are single-class selectors, so file order is the only tiebreak,
  and declaring it first let the bottom sheet's `border-radius: lg lg 0 0` win — square bottom
  corners on a floating dialog. And the two sheet-opening `<button>`s in the form copy every
  measurement from `Input.module.css` (label gap, label colour, 1.5px accent border, `--text-sm`,
  44px control); when they were styled independently the left column sat lower than the right and
  nothing in the grid lined up. Chrome assertions now measure the four corner radii, the six
  control heights and the per-row tops. **The ticker and formula sheets this form opens are
  centred too** — `placement="center"` is passed at the portfolio call sites only, because a
  bottom sheet sliding up over a dialog that floats mid-screen reads as two unrelated layers. The
  detail screen's ticker picker keeps the bottom sheet: it opens straight from the page, not from
  a dialog. The formula field is labelled **"Thêm công thức"**, not "Tính công thức" — it only
  attaches a formula, and the calculating happens after save, when the screen navigates. That
  label now shares a prefix with the submit button ("Thêm và mở công thức"), so any test matching
  it must anchor on "và mở".

**"Tỷ trọng" means three different things in this product**, so the portfolio column has to say
which one: a holding's share of total portfolio value (here), the equity and debt weights of
`wacc`, and the smoothing factor `k` of `ema-n-phien`. They never share a screen, so nothing needs
renaming — what was missing is the denominator, since a bare `6%` could plausibly be measured
against market value or against cost. A line under the table says it (`portfolio.weightNote`), the
same way `ConstantsNote` explains a block from its foot, because a column 10% of the width cannot
carry a clause. A second sentence appears only when some holding has no price:
`total` sums `row.value ?? 0`, so an unpriced holding drops out of the denominator and the
remaining weights add up to 100% while the portfolio does not.

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
would lose. Current split of the 102 that have a chart: **63 sweeps + 4 waterfalls that draw at
once, + 35 waiting on a price series** — and those 35 all draw the moment a series is loaded, which
`history.test.ts` pins. Plus the 9 `none` that makes 111.

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
`effectiveFrom` + `legalBasis`, kept out of formula bodies (LDR-03, CON-10). **Every formula
declares `spec.symbols`** — the "A: là gì" legend of its KaTeX line: one entry per symbol in
`latex` (`latex` copied verbatim, `meaning` a short bilingual phrase), rendered by the detail
screen as a `<dl>` to the **right** of the formula (below it under 1024px), each key set by KaTeX
at build time like the formula itself (`latexToInlineMathml`, `page.tsx`). `formulas.test.ts`
gates it three ways: every formula has a legend; every entry is a verbatim substring of `latex`;
and the entries' tokens cover every token `latexSymbolTokens()` (`src/core/latex-symbols.ts`)
extracts from `latex` — names, Greek letters, `\text{}` abbreviations, running indices (t, i, j,
k, s, n are split off; any other subscript makes the whole thing one symbol: `r_f`, `P_{mua}`,
`\sigma_p`) and numbers other than 0, 1, 2 (`100` included — see below). The owner asked for this after pointing at
`L = max{k : r_{t+1} < 0, …}` and saying "không hiểu các giá trị" (16/09/2026), and chose this
layout over two earlier attempts that put a paragraph or a term → meaning table _under_ the
expression line ("quê mùa"). Keep the legend a legend: phrases, not sentences; nothing narrates
the algorithm. **No dashes in a legend entry** (`—` or `–`): the only dash the legend may show is
the minus sign `−` of real arithmetic. On 17/09/2026 the owner read the em dash in `var-lich-su`'s
α row ("95% hay 99% — nên 1 − α …") as a second minus sign and asked why there was a long one and
a short one, the same complaint that had already removed dashes from the expression line. Join
with words and commas (", tức …", ", nên …", ranges as "từ 0 đến 100"), not with parentheses or
`/`, which are maths in that same table; a gate in `formulas.test.ts` rejects both characters in
`vi` and `en`. `FFB_SYMBOL_IDS=a,b` narrows the legend gates to a few ids while editing one group
file.

**The formula, its expression line and `calc` must describe the same arithmetic, constants
included.** On 17/09/2026 the owner caught `sut-giam-hien-tai` drawing `(P_max − P_t) / P_max`
while the line under it said "… × 100" ("tại sao trên công thức không có nhân với 100 mà bên
dưới lại nhân với 100?"). A fourth gate in `formulas.test.ts` now requires the set of numbers
other than 0, 1, 2 to be identical in `latex`, `expression.vi` and `expression.en`, and the
tokenizer stopped exempting `100`, so every `× 100` needs a legend row. A read-only sweep of all
111 against `calc` then found unit factors the picture had hidden — `× 10^9` (EPS, BVPS: tỷ ₫ →
₫), `× 1000` (NCAV), `÷ 1000` (market cap) — and those are now in the picture too, following the
`gia-tri-noi-tai-fcff` precedent: someone checking by hand must land on the number the screen
shows. The convention the fixes follow: an input typed in % (rates, margin ratio) is written as a
ratio in the picture with no `÷ 100` (`1 + r`, `r − g`); a result that is a ratio of two money or
price amounts read as a percentage carries `× 100` (ROE, ROI, drawdown, VaR). When the gate cannot
see a mismatch (how `calc` converts an annual rate to a per-session one, which returns a threshold
drops), the legend row has to say it.

**The expression line must read every half of the picture.** On 18/09/2026 the owner pointed at
`ty-so-sortino`, whose picture draws two equations (the ratio, then the downside deviation) under a
line that read only the first: "tại sao lại có 2 công thức mà bên dưới chỉ có giải thích cho 1 công
thức?" The numbers gate above could not see it — the forgotten half carried no unusual constant. A
fifth gate counts equations (`equationsInLatex` / `equationsInText` in `expression-rules.ts`, one
`=` per half, with `\text{…}` and sub/superscripts stripped first so the `=` inside a sum's limits
does not count) and requires the same count in `latex`, `expression.vi` and `expression.en`;
`how-to.test.ts` applies it to every step line too. The sweep it came from found two more:
`rsi-wilder` folded the `RS` half into the first line's parentheses, and `don-bay-tong-hop` dropped
the middle `DOL × DFL` of a chained equation. Six formulas have multi-part pictures — the other
three (`ema-n-phien`, `atr-dao-dong-thuc`, `diem-hoa-von`) already read both halves, joined with
", với …" or ";".

**Each half goes on its own line — the joiner was rejected the same day.** "cần xuống dòng giải
thích công thức thứ 2 thay vì dùng dấu phẩy khó nhìn như này. cần xử lý khoa học hơn". The break
lives in the data: one `\n` in `expression.vi`/`.en` per `\quad` / `\qquad` / `\\` in `latex`
(rule 6, `blocksInLatex` + `expressionLines` in `expression-rules.ts`; `expressionBlockProblems`
applies rules 1–3 to each line). Rules 5 and 6 measure different things and both stay:
`don-bay-tong-hop` is the chained `DTL = DOL × DFL = …`, two `=` inside **one** block, so it keeps
one line — splitting it would produce a line starting with `=`. The same rule governs how-to step
lines, and enforcing it found a live defect (`beta`'s covariance step drew two equations and read
them as one line). `notation-view` therefore hands the card `ExpressionSegment[][]` — one array per
line (`segmentExpressionLines`, which splits first and then requires each phrase to be found in
_some_ line). The card renders one `<span data-eq>` per line inside the single `<p data-lines>`,
with a real `\n` text node between them so `p.textContent` still equals the spec string verbatim
and a copy-paste keeps the break; never add `white-space: pre-line` to `.expression`, which would
turn that text node into a blank line. Multi-line blocks switch from per-line centering to a
centered one-column grid with left-aligned lines and a 1.5em hanging indent, so a wrapped line
cannot be mistaken for a new equation; the 106 single-line formulas match `[data-lines='1']` and
are untouched.

**Hovering or tapping a symbol opens a "how it is computed" panel** (17/09/2026). The owner pointed at
Sharpe's card and said users cannot tell how "Lợi suất bình quân một phiên" is computed. Hovering (mouse)
or tapping a symbol in the KaTeX picture, its phrase in the expression line, or its legend row opens a
floating panel with 1–3 steps (a small KaTeX picture plus an expression-style line) and, when the
library has one, a link to that quantity's own formula. The same symbol lights up in all three places.
The owner scoped it to **quantities that must be computed**. 112 panels across 61 formulas; 50 formulas
have none, and each records why in `whyNone`. Things that are easy to break:

- **The content lives in `src/core/how-to/`, NOT in `FormulaSpec`**, and only `page.tsx` reads it (via
  the build-only sub-path `@/application/how-to`, never the barrel). `FormulaDetail` imports the whole
  Registry, so anything in `spec` ships in every detail page's JS; `spec.symbols` once cost 185 → 198 kB.
  `notation-view.ts` builds everything at build time and passes one `notation` prop.
  `build-only-imports.test.ts` pins who may import `katex`, `latex-html`, `mathml-marks`,
  `notation-view` and the how-to data. `verify:static` fails if a step line shows up in any `out/` JS
  file.
- **Every legend row is classified**: a panel (`derived` = `calc` computes it, with `calcEvidence`
  snippets that must exist in the formula's `calc` block; `linked` = a typed input that is another
  library formula's result, same unit; `defined` = a standard metric with no library formula, pinned
  list) or a `skipped` reason. Classify by what `calc` does, not by the letter: `i` = annual ÷ 12 is
  `derived`. `how-to.test.ts` pins the `defined` list, the no-panel list and the totals.
- **KaTeX's MathML output ignores `\htmlData`**, so hotspots are marked AFTER KaTeX by
  `mathml-marks.ts`, which matches legend subtrees structurally and adds `data-sym="k"`.
  `unmarkSymbols()` must give back the exact KaTeX bytes, and `notation.test.ts` checks that for all 111.
  A symbol that only exists inside a longer named symbol (`D` in `D/E`) cannot carry a panel; the build
  throws.
- **React 19 compares `dangerouslySetInnerHTML` by object identity.** `FormulaNotationCard` builds the
  `{ __html }` objects once with `useMemo` and is `memo`'d. Inline literals would rebuild the MathML on
  every keystroke and swap the node under the pointer. Highlighting is pure CSS (`data-active` plus 12
  static selectors), so nothing ever writes into the MathML.
- **Keyboard users open panels from the legend buttons only.** There is no tab stop inside the MathML;
  that is deliberate. Step text follows the expression-line rules (`src/core/expression-rules.ts`, shared
  with `formulas.test.ts`).
- **On phones (<1024px) a small "Chú thích" button at the card's bottom-right hides and shows the
  legend** (17/09/2026). The owner circled `fcfe`'s eight-row legend pushing the inputs down, then
  renamed the button from "Ẩn ký hiệu"/"Hiện ký hiệu" to one label for both states, so the chevron and
  `aria-expanded` carry the state; do not bring the "Ẩn"/"Hiện" wording back. It starts shown
  and is not remembered across pages, so the static HTML and first render match. The desktop layout has
  no button, and the legend always shows there. `.legend` wraps `<dl>` and the button so the card still
  has two children. The hide rule needs `.legend > .legendHidden`: `.symbols { display: grid }` loads
  later at the same specificity and silently wins. While the legend is hidden, a panel opened from the
  picture renders outside the `<dl>`.

**A `spec.variables` entry can change the result while never appearing in the picture at all** — the
legend gates above only check that every _token already in `latex`_ has a row; nothing ever checked the
reverse. A read-only sweep of all 269 "Số liệu" inputs against every picture/legend/`calc` (18/09/2026,
triggered by the owner asking what "Ngưỡng bỏ qua phiên đi ngang" on `ty-so-thang-thua` actually did) found
32 inputs mentioned only in legend prose and 9 mentioned nowhere, all still changing `calc`.

**The first fix for that was wrong, and the picture is NOT where an input field gets named** (22/09/2026).
That sweep attached each parameter to the symbol it feeds as a parenthesized argument
(`EMA_{nhanh}` → `EMA_{nhanh}(n_{nhanh})`, `F_{lk}` → `F_{lk}(M)`, worst of all
`L_k` → `L_k(P, r, \text{PT})` on `lich-tra-no`), because a legend row must be a verbatim substring of
`latex`, so a field could only earn a caption line by appearing in the picture. The owner circled that
`L_k(P, r, \text{PT})` and rejected the whole shape: _"nếu là giải thích thì chỉ cần khi hover vào ký hiệu
rồi mới hiện… để như này dễ khiến người đọc hiểu nhầm công thức"_, and when told the one-argument cases read
as conventional notation, answered _"dân kỹ thuật đọc được nhưng người dùng hoặc người mới xem công thức làm
sao mà hiểu nổi… tôi hướng tới người dùng chứ không phải là dân kỹ thuật"_. **No `symbol(arg)` call notation
in any picture** — 20 pictures across 7 group files were reverted to their pre-sweep shape. What stays is a
paren that is real maths on its own terms: grouping (`Q\,(1 - r_{ban} - r_{thue})`), a genuine operator
(`\max(30, L)`), and the textbook forms whose argument is the DATA, not a knob — `\text{Cov}(R_i, R_m)`,
`Q_{1-\alpha}(r)`, `EMA_{tin hieu}(MACD)`. Subscript bounds that were already drawn stay too
(`\sum_{k=1}^{n}`, `\max_{t \le N}`, `\overline{r^{+}}_h`).

**Where the field name goes instead: the `meaning` of the symbol it feeds.** `F_{lk}` reads "phí lưu ký cả
kỳ, tính theo ô Thời gian nắm giữ, ₫"; `i` reads "lãi suất một kỳ tháng, bằng ô Lãi suất / năm chia 12".
That needs no picture change, costs no symbol, and fits the 90-char cap if the sentence is rewritten rather
than merely appended to. When it does not fit, the field is reached through the symbol's own how-to panel
and through the Bảng biến at the foot of the page — both already list it. A parameter therefore does **not**
need its own legend row, and adding a letter to the picture just to caption an input is the mistake this
paragraph records. The tokenizer detail that made the old pattern tempting is still worth knowing when
renaming any row: appending `(x)` after a symbol's closing brace never disturbs that symbol's own legend
row, because the tokenizer only extends the "whole" match past the brace for a trailing `_`/`^`, never for
`(`; a trailing `_h` after `\overline{...}` _does_ extend it, so the old bare row stops being a substring of
the new `latex` and must be renamed in lockstep everywhere it is referenced, including inside
`src/core/how-to/*.ts` step `latex` and `symbol` fields for that row. Four inputs stayed untouched on
purpose — `xirr`'s `guess` (a Newton–Raphson seed, not a term of the equation), `rut-truoc-han`'s
`termMonths` (a validity precondition, not a term) and `contractRate` (feeds only an `extras` field nothing
reads), and `roi-rong`'s `sellPrice` (already reachable through `L_{rong}`'s own how-to panel, so only its
legend _meaning_ grew a clause). The sweep also surfaced a gate the owner-facing docs above never named:
`how-to.test.ts` requires **every** `spec.symbols` row, not just derived ones, to be classified — either an
`entries[].symbol` or a `skipped` key — so a brand-new raw-input row needs a one-line
`skipped: { n: 'nhap-tho' }` addition even though it will never carry a panel.

A formula whose `calc` reads a market constant must also **declare the key** in
`spec.usesConstants` — 13 of them do, across `derivatives.ts` (5), `fees.ts` (7) and `planning.ts`
(1). The declaration is what `ConstantsNote` reads to print the label, value, unit, effective date
and legal basis at the end of the Số liệu block; before it existed, `phi-giao-dich-mua` showed
138.000 ₫ without the 0,15% rate appearing anywhere on the page. Declare the **key only** — the
value keeps flowing from `schedules.ts`, so a rate change moves the screen with it, whereas a
number copied into prose rots silently and lint cannot see it. `constants-gate.test.ts` holds both
directions: a source scan catches an undeclared call site, and pulling each declared key out of the
schedule must break the formula, which catches a declaration the calc never uses.

## The understanding-check block — WF-19

The bottom of every detail screen carries a multiple-choice block (23/09/2026, `src/core/quiz/`,
`src/application/quiz*.ts`, `src/ui/quiz/`). **411 questions, covering all 111 formulas.** The
first pass wrote 206 from a spreadsheet of 177 sources and left one formula empty; the expansion
round that followed (23/09/2026) closed that gap and kept pushing every formula toward five
questions in batches, and a calculation round (24/09/2026) added one worked question per formula
that computes from plain inputs — see the two notes below. The wireframes and that spreadsheet live
in `docs/wf19/` — the repo's first `docs/` directory and its first binary outside `public/`, both
deliberate and explained in that folder's README.

**Every question must come from a real source, and the bank is uneven because the material is.**
`QuizItem` requires `source.url`; `quiz.test.ts` re-checks it. The floor across the library is now
**2 questions**: 24 formulas have two, 27 have three, 23 have four, 32 have five and 5 have six.
The first wireframe's "5 questions per formula" template was dropped precisely because it would
have forced 3–4 invented questions onto 88 of 111 formulas. `tiet-kiem-muc-tieu`, the one formula
nobody could source at the first pass, has had questions since batch 1 — but **the empty-state
branch stays**, in `quizFor`'s docblock and in `QuizBody`: a new formula added to the Registry is
empty the moment it lands, and the owner chose that state over hiding the block. Four constants in
`quiz.test.ts` are tripwires against a number being hit by padding (`TONG_SO_CAU = 411`,
`SO_CAU_DIEN_GIAI = 5`, `SO_CAU_QUY_DINH_CHUA_CO_NGAY = 16`, and the 0/24 distribution).
**Never add a question to reach a number.**

**Twice now the distribution test's own claim stopped being true, and twice it was renamed rather
than just loosened.** After four batches "most formulas have only 1–2 questions" was false (55 of
111, 49.5%, down from 87), so the name changed from "phân bố vẫn lệch: phần lớn công thức chỉ có
một hoặc hai câu" to "phân bố đã cân bằng hơn…" and the bar moved from "more than half" to "more
than a third". After the calculation round no formula has one question at all, which made even
"more than a third" false (24 of 111), so the case is now "không công thức nào còn một câu, nhưng
ngân hàng vẫn chưa đều" and it pins the real numbers — `mot` is 0, `hai` is 24, and
`Math.min(...cover.values())` is 2 — instead of an inequality that keeps expiring. A test name is
a claim; when the claim stops holding, fix the claim, do not widen the bar.

**Raising a formula's count is allowed only with new INPUT, never a lower bar.** On 23/09/2026 the
owner asked to bring every formula toward five and allowed foreign-language sources. That is new
input, so the tripwires keep moving — but 5 stays a target, not a floor. Batch 1 (6 formulas, 23 of
25 drafts survived) had 2 killed by an adversarial pass that reopens every URL (one quoted verbatim
from a page that only _defined_ the formula; one was right per the page but wrong per current law).
Batch 2 lost its automated adversarial pass to a session-limit failure mid-run — 11 drafts had
already been written when it died, so they were re-verified by hand instead of discarded: every URL
reopened and diff'd against the quoted text, and one source that was a PDF (a study, whose
compressed text stream `WebFetch` couldn't decode) was downloaded and run through `pdftotext`
instead. All 11 held up. Batch 3 (17 formulas) ran the automated pass clean — 67 agents, 0
infrastructure failures — and it killed 9 of 51 drafts (verbatim mismatches, a wrong division, a
source that only defined the metric), the sharpest evidence yet that 5 is a target and not a floor.
Batch 4 (the remaining 12 `technical` formulas, closing that category out — every formula in it now
has 2+ questions) added a pre-filter for the spelling lesson below before drafts ever reach the
adversarial pass, and still killed 4 of 35 (two `chon-nhieu` answer sets the source didn't actually
support, two definition-only sources). Batch 5 (10 `valuation` multiples formulas) killed 2 of 34
(both definition-only) and surfaced a different failure mode: an agent tagged a news article
reporting a specific enforcement case as `source.kind: 'quy-dinh'` (legal text / published fee
schedule), which would have pushed `SO_CAU_QUY_DINH_CHUA_CO_NGAY` — a tripwire that may only ever
go down — up from 16 to 17. The fix was reclassifying that one question's `source.kind` to
`trai-nghiem` ("a real person's account, or the press reporting on an incident with real numbers"
— exactly what it is), not loosening the tripwire. A batch without either the automated pass or an
equivalent manual one has no business moving these numbers. The method that unstuck the formula
nobody could source is worth reusing: split it into its hidden assumptions and find a source for
each one.

**The bank's uniform-US-spelling gate (`i18n.test.ts`) applies to a quoted source's own English too,
and it can outrank quote fidelity.** A batch-3 quote from a UK site read "Annualised"; the gate
scans every `en:` string in `src/core` with no carve-out for text inside “…”. The fix asymmetric on
purpose: `explain.vi`'s embedded quote stays exactly as the source wrote it, because that copy
exists so a Vietnamese reader can verify it against the page — respelling it would defeat that. The
same quote inside `explain.en` gets Americanized, because that field is the product's English copy
and the project already normalizes British spelling there on sight (`risk-ratios.ts`'s "the
annualised result" got the same treatment earlier). The two fields end up one letter apart, on
purpose, with a comment at the site recording why.

**66 of the questions are CALCULATION questions, and their answers come from `calc`, not from
the author** (24/09/2026, `items/tinh-toan.ts`). The owner tried the quiz and found it was theory
only: measured, 306 of 345 questions carried no figures at all and just 3 multiple-choice questions
made the reader compute anything. Each new one prints a small table of inputs, asks for the result,
and offers four answers. The correctness gate is what makes them safe to ship: the item declares
`verify: { inputs, expected, tolerance }` and `quiz.test.ts` runs `runFormula` with that exact
input set. **A wrong answer here would teach the wrong arithmetic directly underneath the correct
formula, on the same screen, and no other gate can see it** — `calc` is still right, the prose
still reads well, only the number is off. So the authoring order is inverted: pick the inputs, run
`calc`, then write the question around the number it returned. The three wrong answers are real
mistakes (inverted ratio, billions not converted to dong, the ×100 forgotten, the tax shield
dropped, stopping at an intermediate step, rounding up where contracts round down) and the
explanation names each one, so a wrong pick still teaches something.

**All 66 are FILL-IN questions since 25/09/2026, not four-choice ones.** The owner, looking at the
DCA question's A/B/C/D: _"việc đưa ra các ô để nhập vào giống như tôi yêu cầu thì bạn chưa sửa,
vẫn để chọn các số liệu ABCD"_. Each now places the table's figures into slots of the page's own
formula (`CAU_DIEN_SO` +66), keeps `verify` (`QuizDienSo.verify`, so `calc` still checks the
answer) and a case fails if any question with `verify` still offers choices. Constants stay
visible (× 100, 10^9, the 0,15% fee, 100.000 ₫ a point); where the data would need more than five
slots one quantity is written in and the prompt says so (total capital 1.000 on WACC, the share
count on the FCFF valuation, the 1.000 shares on break-even, the 12 million per DCA purchase). The
explanations' "Đáp án X là…" became "Kết quả X là…" — the mistakes they name are still the real
ones. Q388 (IRR of an annuity) gives the IRR a calculator found and asks for the payment and the
count, so its `expected` is the outlay, not the IRR — the only one whose `expected` differs from
`verify.expected`. The 14 multiple-choice questions that draw ANOTHER formula stay
multiple-choice: that is the `CAU_DIEN_SO` invariant, and they declare no `verify`.

Two consequences worth knowing. **`evidence: 'tinh-toan'` had to be a third tier**, because two
gates key off that field and both are wrong for a calculation: the verbatim-quote case requires
every `ngo-nhan` item to carry a `“…”`, and the UI titles the explanation box from the tier, where
`quy-dinh` prints "Quy định hiện hành" — nonsense over an arithmetic answer. And **`verify` cannot
describe a formula that eats a price series**, because the series travels in `CalcContext` rather
than in `inputs`; those 35 formulas still have no calculation question and need a different route.

**A Vietnamese explanation must carry the meaning itself, with the quote as evidence — not be a
quote with a label in front of it.** The owner pressed Check and got an English paragraph back.
Measured: 64 of 345 `explain.vi` values were essentially one English quotation, the shape
`Nguồn: “…”.`, peaking at 96% English (Q081). The fix is **not** to drop the quote — verbatim text
is what lets a reader open the source and check — so all 64 were rewritten to the shape Q275
already had: the Vietnamese sentence states the point, then the original is quoted behind it.
`explain.en` was filled in for 93 first-pass questions at the same time, so switching the product's
language now switches the explanation too. A gate holds the line: any item whose `explain.vi`
contains an English quotation must keep **≥120 characters of Vietnamese outside the quote marks**.
That threshold is the measured floor after the fix and may only go up. It catches a floor, not
thin writing, but the floor is exactly where the defect was.

**No explanation labels itself "Nguồn:" / "Source:"** (25/09/2026). The explanation box already
ends with its own source row (`quiz.source` + the link), so an `explain` opening with
`Nguồn: “…”` printed the word twice in one box; the owner circled it and asked for the top one
gone. 87 labels were stripped from the data (68 `vi`, 19 `en`), quotes untouched, and a case in
`quiz.test.ts` rejects either word in `explain` — the same rule `FormulaExample.source` states
in `registry/types.ts`: the label is the UI's job. Stripping it dropped Q279 under the 120 floor
above (its only Vietnamese before the English quote WAS the label); it was rewritten Vietnamese-first,
not excused.

**The block keeps every answered question on screen** (24/09/2026). Pressing "Câu tiếp" used to
erase the question just read; the explanation was only reachable again from the summary at the very
end. Each answered question now collapses into one clickable row — verdict mark, step number,
prompt clipped to a line — stacked oldest-first directly above the live question, and opening one
re-renders it whole, explanation included. **Only one opens at a time**: several at once push the
live question off screen, which is the thing the strip exists to prevent. That forced a split:
`QuizQuestion.tsx` renders one question and `cham.ts` holds the scoring rules, because the same
question must render identically in both places and two copies of that JSX would diverge. The
`inputMode="decimal"` call site moved with it, so `numeric-gate.test.ts` now pins
`ui/quiz/QuizQuestion.tsx`.

**The header row carries everything that is not a question** (24/09/2026, rewritten three times in
one day). Idle it reads `BÀI TẬP · 5 câu ……… Bắt đầu kiểm tra »`; mid-quiz it reads
`BÀI TẬP · Câu 2 / 5 · ▬▬ ▭ ▭ ▭ ▭ ……… Thoát`. The progress line used to sit inside the question card,
one row under an `<h2>` that said the same thing, and the start button used to be a solid block on
a row of its own under a lead line — three stacked rows that existed only to get someone to press
one button. Four things there are load-bearing:

- **`.head` must NOT use `justify-content: space-between`.** The page frame runs to `--desktop-max`
  (1600px), so space-between throws the count to the far right edge, the better part of a screen
  away from the label it belongs to, and the two stop reading as one thing. Label and count sit
  together on the left; only the right-hand button pushes itself out, with `.headAction`
  (`margin-left: auto`). That one class serves BOTH buttons — "Bắt đầu kiểm tra" when idle,
  "Thoát" mid-quiz — because their occupying the same slot is what stops the row jumping when the
  phase changes, together with `.head`'s `min-height`.
- **The block has NO `max-width`.** It was capped at 60rem earlier the same day to close that
  space-between gap; the owner photographed the result and rejected it. Capping only moves the
  empty space OUTSIDE the block's right edge, where it no longer lines up with the Nguồn tham khảo
  block above it or the page's own end-buttons below — both of which run the full frame.
- **`.bars` is `flex: 0 1 14rem`, not `flex: 1`.** Stretched across the full frame it measured
  ~1.100px for five questions and read as a rule dividing the page rather than as progress.
- **`.label`, `.step` and `.count` are `white-space: nowrap`.** At 390px the bar's `flex-basis`
  holds its ground and the text is what gets squeezed instead: "BÀI TẬP" broke across two lines.
  Nowrap makes the bar — the only thing on the row that can shrink without losing meaning — absorb
  it.

The `»` is a sibling `<span aria-hidden>` rather than part of the string, because it has to follow
BOTH labels (`quiz.start` and `quiz.startFew`) and putting it in the dictionary would make four
places to remember instead of one — same shape as `GroupCard.tsx`. The button is `variant="ghost"`
on purpose: a solid block of colour beside a small uppercase label outweighs the content it leads
into. Idle, that row is the WHOLE block — 78px measured — because `quiz.lead` ("Không chấm điểm,
chỉ để bạn tự soát lại.") is gone: the owner deleted it that morning, had it restored that
afternoon, then deleted it again on sight, so its tombstone is the second one on that key and it
is final. `.intro` under the header renders only when there is something real to say — a quiz
under three questions, or a score from last time. `quiz.countUnit` survives for the "5 câu" beside
the label, and `quiz.step` ("Câu {n} / {total}") is new, saying "Câu" out loud because the count no
longer has a row of its own to explain what it counts. The block is titled
**`Bài tập` / `Practice`** — it was "Kiểm tra hiểu bài" / "Check your understanding" until the same
round.

**ALL THREE taxonomy chips are gone, for the same reason, on the same day** (24/09/2026), and a
question card now opens straight onto the prompt. `source.kind` ("Chuyên gia", "Tài liệu
chuẩn"…) described who was speaking rather than helping the reader decide, while occupying the
space beside the link they need to click. `kind` ("D1 · Đọc kết quả" … "D5 · Hậu quả bằng
tiền") classified which KIND OF UNDERSTANDING the question tests. `evidence` ("Ngộ nhận có ghi
chép", "Quy định hoặc chuẩn ngành", "Tự tính lại được") classified how strong the evidence
behind it is. All three are real signal **for the content team** — `kind` is how they see
coverage (fees & taxes is nearly all D4, valuation leans D1/D2) — and none of them is something
a reader does anything with. Twelve i18n keys deleted with tombstones; **all three fields stay
in the data** for all 411 questions.

`evidence` survived one round longer on a reason that turned out to be wrong: that the chip fed
the explanation-box title and two `quiz.test.ts` gates. It does not — **the FIELD feeds them**,
read straight off `item.evidence`, and the chip fed nothing. Keep that distinction when reading
the tombstone in `vi.ts`: `quiz.evidence.*` is dead, `item.evidence` is load-bearing. A case in
`QuizBody.test.tsx` asserts no `D1`–`D5` code and none of the three evidence labels survive
anywhere in the card — it spells the labels out rather than reading them through `t()`, because
the keys no longer exist. The four
choices sit in a **two-column grid whose breakpoint depends on how long the longest answer is**,
measured from the data and stamped as `data-hai-cot` — measuring at runtime would make the first
client render disagree with the static HTML, the hydration class of bug this whole directory
avoids. The attribute holds the NAME of the narrowest viewport that still fits every answer on one
line: `1024` (≤55 characters), `1280` (≤78), or `0`, and `khoHaiCot()` in `QuizQuestion.tsx` keeps
the measured table it comes from. It was a single ≤48 threshold until 24/09/2026, set while the
block was still capped at `max-width: 60rem`; once the block went full-frame that number was
roughly half of what a column actually holds, and the owner photographed a question with three
very short answers beside one 59-character answer, all four stacked in one column. Measured in
Chrome with the real font: a half-width cell fits 55 characters at 1024px, 77 at 1280, 86 at 1440
and 98 at 1600. Across the bank that moved two-column coverage from 149/389 to 173 from 1024px and
254 from 1280px. No third tier above 1280 on purpose: past ~78 characters two columns are two
dense blocks of text side by side, and one column reads better. And
the hint line under the buttons **had never once rendered**: its condition was `picked === null`
while `picked` became an array back in WF-19C. It now keys off "is the answer complete", so it
serves the numeric format too.

**A fill-in question asks WHERE EACH FIGURE GOES, not what the answer is** (24/09/2026, `worked` on
`QuizDienSo`, parser and rules in `core/quiz/worked-line.ts`). The owner rewrote this format three
times in one day, and the last rewrite inverted it: _"đoạn mô tả ví dụ sẽ có những thông số nào sẽ
được áp dụng trong công thức thì để trống trong công thức ra để người dùng điền vào ấy. điền đúng
chỗ số liệu vào công thức thì kiểm tra xem đúng chưa chứ không phải hỏi xem kết quả là như nào."_
So the blanks sit on the **input figures inside the formula**, and the check is placement:

```text
Beta điều chỉnh = ▢ × ▢ + ▢ × 1
```

The learner takes 0,67 / 1,50 / 0,33 from the "Số liệu" table above and puts each in its slot. The
earlier shape did the opposite — it printed the whole substituted arithmetic and blanked the
**result** — so it tested calculator skill, which is not what a formula library is for. The table
deliberately carries distractors (`he-so-bien-thien` lists the mean and the standard deviation of
**both** assets), so placing correctly is a real test. The computed result is no longer the
question: it is revealed after checking, as the payoff that closes the worked example.

**`[…]` marks a blank and CARRIES ITS OWN ANSWER**, so one string still does three jobs — draw the
picture, grade each slot, and (with the brackets stripped) get re-computed against `expected`. A
`latex` field or an `answers[]` array parallel to `worked` would be exactly the drift this design
exists to prevent.

**The formula is drawn with React + CSS, NOT MathML.** The earlier shape emitted MathML from the
AST; that died the moment the input moved inside the formula, because MathML accepts no `<input>`
anywhere in its tree, `<mtext>` included — and a slot in a fraction's numerator has nowhere else to
go. `CongThucDien.tsx` walks the AST instead: `font-family: math` (a CSS generic) keeps the typeface
the 111 KaTeX pictures use, and a fraction is a flex column with `border-top` on the denominator,
which is what the browser draws for `<mfrac>` anyway. KaTeX stays out of reach for the old reason:
build-time only, ~280 kB.

Four things there are load-bearing:

- **The AST arrives with parentheses already inserted.** `workedShape` runs `themNgoac` before
  handing the tree over, so no line of UI code knows the precedence table. A second copy of that
  table in the view layer would drift from the evaluator, and then the picture and the graded
  number would say different things. Division, square root and `|…|` insert no parens — the bar
  already separates the halves, which is where a drawn formula beats prose: `(2 + 3) ÷ 5` needs
  brackets as text and none as a fraction. **Only ONE level of fraction bars** (25/09/2026): a
  division inside a fraction's numerator or denominator, or inside an exponent, becomes
  `chiaDong` and is drawn on one line with "÷". The owner looked at the DCA line — three
  `12.000.000 / price` fractions stacked inside the denominator of a big one — and said "quá khó
  nhìn … đổi thiết kế sao cho vừa dễ hiểu vừa gọn". An inline division DOES need parens, so it takes
  the multiplication rules (`(12 − 4) ÷ 100`), and `chieuCao` counts it as one tier.
- **Bracket and radical heights come from `chieuCao()` on the tree, never from measuring at
  runtime.** Measuring would make the first client render disagree with the static HTML — the
  hydration class of bug this whole directory avoids. CSS stretches the glyph with
  `scaleY(var(--cao))`.
- **`.ctPhanSo` must NOT set `align-items: center`.** The horizontal axis is the cross axis of a
  column flex box, so `center` shrinks both tiers to their own content and the fraction bar — a
  `border-top` on the denominator — ends up only as wide as the DENOMINATOR. Measured on
  `so-graham`: a 345px numerator over a 26px bar. Leave it at `stretch` and centre the contents
  with `justify-content`.
- **The formula does not line-wrap** (a fraction split across lines is meaningless), so
  `.workedExpr` carries the `min-width: 0` + `overflow-x: auto` + `overflow-y: hidden` trio, the
  same one and for the same reason as `.formula` in `FormulaDetail.module.css`. At 390px
  `do-bien-dong-lich-su` is 862px wide inside a 316px block and scrolls; the page itself does not
  overflow. The label and `=` sit in the same flex row and wrap above the formula when it is tight.

**The action row carries two buttons and nothing else.** The owner first had "Bỏ qua câu này"
pushed to the right edge to line up with "Thoát" on the row above, then reversed it the same day:
at 1440px the two buttons sat most of a card apart and stopped reading as one pair. The hint line
under them ("Chọn một đáp án để mở nút Kiểm tra") is gone too — a greyed-out, unclickable button
already says that. Do not add a `margin-left: auto` to anything in that row.

**`quiz.test.ts` RE-COMPUTES the line rather than eyeballing it.** It strips the square brackets,
parses what follows the `=` (Vietnamese number notation, `+ − × ÷ ^ ( ) √ ln | |`) and requires the
result inside that question's own tolerance. The line prints the actual figures, so it is a promise:
swap one digit and a learner who places the data correctly is marked WRONG at that slot — and will
believe themselves wrong rather than the formula. Nothing else can see that failure; `expected` is
still right and the prose still reads well. Same reasoning as `QuizVerify`.

**The `DONG_GOI_Y_BANG_LOI` pinned list is GONE, and the rule got stricter.** Three questions used
to keep a worded hint because substituting numbers would delete the step being tested — rounding
free-float up to the next 5% (Q329), picking which ranked observation is the 99% VaR (Q248), and
choosing the rolling peak/trough pair rather than the highest peak with the lowest trough (Q244).
The new shape absorbs all three: that step **is** the blank now. So `workedProblems` rejects any
line it cannot parse, and every one of the 22 surviving fill-in lines draws. Adding `|…|` to the parser is what let
Q248 convert (`VaR 99% = |▢|`); it is real notation for that formula, not a workaround.

**A fill-in question may only ever draw ITS OWN page's formula, and `CAU_DIEN_SO` pins the 22 that
qualify.** This is the invariant the whole round turned on. Once the slots moved inside the formula,
whatever the block draws is a claim that the page contains that formula — and 14 questions were
drawing something else. The owner caught it on `beta`: the page draws `β = Cov(Rᵢ,Rₘ) ÷ Var(Rₘ)`
while the quiz drew `Beta điều chỉnh = 0,67 × β + 0,33 × 1`, Bloomberg's adjusted-beta convention,
properly sourced to Corporate Finance Institute but present nowhere on that page. _"công thức nào
thì chỉ làm bài tập của công thức đó thôi chứ."_

All 14 became `trac-nghiem` — prompt, `facts`, `explain` and `source` kept word for word, the three
wrong answers written as the real miscalculations the explanation already named (taking the raw beta
unadjusted, the arithmetic mean instead of the 0,67/0,33 weights, dropping the market-beta term).
They keep teaching their convention; they just stop drawing a foreign formula. Their `evidence`
moved to `tinh-toan` at the same time, because an arithmetic answer under a box titled "Quy định
hiện hành" is the exact defect that third tier was added to prevent.

The list of 14, with what each was drawing: `beta` Q268 (Bloomberg adjusted beta), `momentum` Q235
(the MetaStock ratio convention, where the page uses a difference), `sut-giam-hien-tai` Q247 (the
recovery gain, not the drawdown), `var-lich-su` Q248 and Q249 (observation ranking, and
square-root-of-time scaling), `do-lech-chuan-ban-phan` Q260 (annualizing), `ty-so-thang-thua` Q281
and Q282 (Profit Factor, and a single-order reward/risk), `ema-n-phien` Q285 (Wilder↔EMA period
conversion), `roc-toc-do-thay-doi` Q292 (picking a period, not a formula at all),
`atr-dao-dong-thuc` Q301 (an ATR-based stop-loss), `vwap` Q306 (the typical-price convention, which
that page's own `commonMistakes` explicitly calls a different number), `do-bien-dong-lich-su` Q309
(the log return, an input to the formula rather than the formula), `von-hoa-thi-truong` Q329
(free-float-adjusted cap).

**No machine can check this**, which is why the gate is a pinned list rather than a rule: comparing
`latex` against a `worked` line needs algebra, and the exemption list would be longer than the rule.
Adding a 23rd fill-in question turns the case red on purpose, so whoever adds it reads this first.
Expanding an input inside the page's own formula is still fine and is what most of the 22 do —
`gia-muc-tieu` Q344 writes EPS out as profit ÷ shares, `ev-ebitda` Q321 writes EV out as its
components, `so-graham` Q332 substitutes a three-year average EPS. The line is between _expanding a
variable of this formula_ and _drawing a different formula_.

**The PROMPT had to be rewritten too, and forgetting that is the obvious trap.** All 36 still ended
with "… là bao nhiêu?" after the slots moved, so the screen asked for a number while the formula
asked for a placement — the owner caught it immediately: _"tại sao câu hỏi vẫn hỏi Beta là bao nhiêu
khi bây giờ thay đổi cách điền công thức rồi."_ Each prompt now keeps its sourced scenario and its
convention clause (that is the part the question actually tests) and ends by naming the placement,
usually with the trap spelled out — "chú ý EMA phiên trước xuất hiện hai lần", "chú ý ô nào cộng
vào, ô nào trừ ra". No test can see this mismatch, so a new fill-in question needs the prompt read
against its own `worked` line by hand.

**Every slot must be a figure the `facts` table states LITERALLY**, because the learner copies it.
Four questions failed that and were fixed rather than excused: `profit-factor` wanted `0,4` while
the table said `40%` (formula rewritten to the percentage scale, `100 − p` instead of `1 − p`),
`von-hoa-thi-truong` wanted `0,60` for a rounded free float (rewritten to `× 60 ÷ 100`), and
`ncav-tren-co-phieu` / `gia-muc-tieu` wanted `250.000.000` and `100.000.000` while their tables said
"250 triệu CP" and "100 triệu cổ phiếu" (tables now spell the digits out). The one deliberate
exception is `von-hoa-thi-truong`'s `60`: rounding 56,19% up to the next 5% step **is** the step
being tested, so that figure must not appear in the table.

**Two authoring rules for choosing which figures to blank**, neither of which a test can enforce:
blank the DATA and leave structural constants visible (`× 100`, `(n − 1)`, `22,5`, `√252`, unit
factors — blanking those asks a different question); and when one quantity appears more than once,
blank **every** occurrence or none, because blanking one of two identical numbers reads as two
different quantities. `O_TRONG_TOI_DA = 5` in `quiz.test.ts` caps the count — past that the question
becomes a dictation exercise and the formula overflows a phone.

Details in the UI. Each slot is a bare `<input>`, not the `Input` primitive: `Input` puts a label
above the control, and a label in the middle of a formula destroys the formula — position is the
label, and screen readers get `aria-label` with the slot's 1-based index. Slot width comes from the
answer's character count (`beNgangO`, floored at 4 and capped at 13) so a 13-digit share count and a
2-digit rate do not get the same box. `.blankInput[data-ket-qua]` **must be declared after
`.blankInput:disabled`** (a graded input is both), the same single-specificity ordering trap as
`.panelCenter`. Grading is all-or-nothing, like `chon-nhieu`: three slots right out of four still
produces the wrong number, so partial credit would tell the learner they were close when the result
is not close at all. The revealed result prints through `formatNumber` — it used to interpolate the
raw JS number, so `beta` showed "1.335 lần", which a Vietnamese reader reads as one thousand three
hundred and thirty-five. The English `worked` line writes its numbers with NO thousands separator
(`37300`, not `37,300`): an English comma is a Vietnamese decimal point, so a reader who copies
`36,000` back into a slot gets graded as 36. Grading always reads the `vi` line, and `quiz.test.ts`
pins that both languages carry the same number of slots in the same order.

**The bank is read at build time only.** 411 questions is ~330 kB of prose; `page.tsx` slices each
formula's 1–5 and passes them down as a prop, exactly like `notation`. Three gates hold that:
`build-only-imports.test.ts` allows `@/application/quiz` in `quiz-view.ts` alone and `quiz-view` in
`page.tsx` alone; the barrel `@/application` re-exports the **types only** (`export type` is erased
at compile time, so it emits no runtime import); and `verify:static` fails if any question's prompt
turns up in an `out/` JS chunk, or if `pe`'s first question is missing from its own page's HTML or
present on another formula's. The import gate cannot see prose copied into a second module — that
is why the build-output gate exists beside it.

Four more things that are easy to break:

- **Nothing in `src/ui/quiz/` may call `useId()`** — same rule and same reason as `src/ui/charts/`.
  `QuizPanel` is the `next/dynamic` boundary, and the block's `<h2>` is in the static HTML of all
  110 pages whether or not the user starts the quiz, so a React-generated id would mismatch on
  every one of them. Ids derive from the `formulaId` prop (`quiz-<id>-title`), and two cases in
  `QuizBody.test.tsx` pin the shape. Never export `QuizBody` from the `@/ui/quiz` barrel, or its
  cost lands on all 111 detail pages.
- **The quoted passage lives inside `explain`, between `“…”` — there is no `quote` field.** The
  first build split it out so the source block could print it verbatim; run against all 206 of the first pass it
  failed twice over: 83 questions were left with an empty `explain` (the whole paragraph was the
  citation), and the rest got cut mid-sentence. `quote-parts.ts` finds the quoted run and the UI
  wraps it in `<q>`. `quiz.test.ts` requires every `ngo-nhan` question to carry a quoted run, with
  exactly 5 prose-only exceptions pinned.
- **"Ôn lại câu sai" replays a SUBSET, so it must not be recorded.** `recordQuizResult` overwrites
  by formula id, so writing a review round down turns a real 3/5 into a flattering 2/2 and loses
  `wrong[]`. `QuizBody` only calls `onFinish` when the round covered the whole set. Getting the
  whole bài wrong makes the subset equal the set, and recording that is correct.
- **The summary screen no longer says where the score is kept.** `quiz.localOnly` was removed on
  24/09/2026, the third such sentence to go — see "The one network call" above for the pattern.
  Nothing about the storage changed: `recordQuizResult` still writes only to `localStorage`, and
  there is no backend to send it to (SRS §3). A case in `QuizBody.test.tsx` was INVERTED rather
  than deleted, so the sentence coming back is a decision rather than a slip.
- **The "few questions" threshold lives at `QuizBody`'s `minForProgress` default, not in the
  Domain.** A constant in `src/core/quiz/` cannot reach the UI (CON-03, plus the build-only gate),
  so one there is just a second number nobody reads — it was removed for that reason.
- **Three answer formats, and no true/false.** `QuizItem` is a discriminated union on a
  **required** `format`: `trac-nghiem` (one of four), `chon-nhieu` (two or three of four, scored
  all-or-nothing) and `dien-so` (place each figure in its slot inside the formula, also scored
  all-or-nothing; needs `facts`, a finite `expected`, a per-question `tolerance`, a bilingual `unit`
  and a `worked` line — see the fill-in note above). WF-19C's true/false was dropped on the
  wireframe's own reasoning — a 50% guess floor. `hasChoices()` reaches the UI through the barrel
  from `@/core/quiz/types`, a **leaf** module; importing it from `@/core/quiz` would drag every
  question into the client bundle. `isAccepted()` rides along but no longer grades anything — from
  24/09/2026 `dien-so` is graded slot by slot by `blankAccepts` (via `@/application/quiz-math`), and
  `isAccepted` survives only for the gate that re-computes the `worked` line. The numeric field is the sixth `inputMode="decimal"` in the
  repo, so it carries the full filter trio (`keepViNumberChars` + `guardFilteredDelete` +
  `resetFilteredDelete`) and is pinned in `numeric-gate.test.ts`; a `chon-nhieu` question must
  render an overall verdict line, because per-choice badges say only whether _that_ choice was in
  the answer set.

**An answered question explains itself in ROWS, not a paragraph** (24/09/2026, `QuizGiai`
on `QuizBase.giai`). The owner rejected prose twice in one afternoon — first the original
paragraphs as "quá khó hiểu và trừu tượng", then a three-block rewrite that added "why each wrong
answer is wrong" as "rườm rà và quá dài dòng" — and specified the shape: what it computes → the
formula → the figures substituted → the result → the source, "không sáng tạo thêm hay thêm lời vô
nghĩa". A day later (25/09/2026) the owner fixed the ORDER and wording, pointing at "Thứ tự đúng:
42.500 · 33.850 · 42.500" and asking which figure was V and which was P: _"Công thức áp dụng … để
tính Biên an toàn. Thay [số] thì giải thích 42500 là gì tương ứng với ký hiệu nào … áp dụng vào
công thức"_. So a `giai` block renders as a `<dl>`:

```text
CÔNG THỨC ÁP DỤNG  MOS = (V − P)/V × 100%  để tính biên an toàn      ← picture + giai.tinh
THAY SỐ            V = 42.500   giá trị nội tại ước tính…, ₫        ← giai.gan
                   P = 33.850   thị giá hiện tại của cổ phiếu, ₫
ÁP VÀO CÔNG THỨC   (42.500 − 33.850) ÷ 42.500 × 100                  ← giai.thaySo
KẾT QUẢ            20,35 %
NGUỒN              24hmoney.vn/…
```

The owner kept the verdict line's "Thứ tự đúng" when asked. Do not rebuild the wrong-answer
commentary. Eight things are load-bearing:

- **The formula row is NOT stored in the question.** It is the page's own KaTeX PICTURE, built
  at build time from `spec.latex` like the formula card's. A copy per question would drift from
  that card.
  `giai.congThuc` may override it ONLY for a rule about the page's own quantity — Q088 asks for
  beta's confidence band, answered by `beta ± 2 × sai số chuẩn`, not by `β = Cov ÷ Var`. It must
  never be used to print another library formula; that is the `CAU_DIEN_SO` invariant, and the
  override is text, so no gate can see it.
- **Hovering a symbol in that picture opens the formula card's own "how it is computed" panel**
  (25/09/2026, `QuizFormulaPicture.tsx`). Three shapes died in two days before this one: bare
  meanings on hover over a words-only formula row ("không giống giải thích của công thức bên
  trên", and a text cursor), then a legend fixed to the right like the card's, which the owner
  rejected with a screenshot of the card's panel on `V`: _"hover vào ký tự thì nó ra như này.
  kiểu thế chứ không phải là kiểu giải thích ở bên phải kia"_. So it REUSES the card's machinery,
  not a copy of it: `useHowToPanel`, `HowToPanel`, the `.card` class (hand cursor, highlight,
  floating panel) and `usePanelPlacement`, which was extracted from `FormulaNotationCard` for the
  purpose. Do not rebuild the fixed legend or a text-only popover.
- **Every symbol opens a panel here, not just the 112 with steps.** The card can leave most
  symbols inert because its legend sits beside the picture; this row has no legend. A symbol with
  no steps (a raw input like `P`) opens a title-only panel — exactly its "ký hiệu: nghĩa" legend
  row — and its `aria-label` is the bare meaning, since calling it "Cách tính" would be false.
  That needs a picture with EVERY symbol marked, which is `NotationView.latexHtmlAllSymbols`, a
  second marking of the same MathML (546 of 554 rows found; the 8 misses are the names
  `mathml-marks.ts` already lists). It is a separate string rather than extra marks on
  `latexHtml` because the card gives every `[data-sym]` a hand cursor, and it is built only when
  `quiz-view.ts`'s `needsFormulaPicture` says the page has a question that prints the picture.
- **The picture node is built in `src/app` and handed to `src/ui` as a `ReactNode`**
  (`hinhCongThuc`). The whole panel mechanism lives in `src/app/cong-thuc/[id]/`, which
  `src/ui/quiz` must not import, so `FormulaDetail` builds `<QuizFormulaPicture>` once
  (`useMemo`) and the quiz only drops it into the Công thức cell. That cell must NOT carry
  `overflow`: the panel is absolutely positioned inside it, and a scrolling ancestor clips it —
  the picture scrolls in its own inner `.quizPictureMath` instead, the same split as the card's
  panel living outside `.formula`. For the same reason **the quiz section no longer carries
  `deferred`**: `content-visibility: auto` implies `contain: paint` even on screen, and the panel
  is clamped to the VIEWPORT edge, not the block's, so at narrow widths it poked out of the
  block's left side and was cut in half (the owner's screenshot showed `MOS`'s panel reading just
  "S"). `FormulaDetail.test.tsx` now pins five deferred blocks, not six, and asserts the quiz
  section is not one of them. A title-only panel carries `data-title-only` and shrinks to its text
  (`width: max-content`) instead of the 22rem the step pictures need. Keyboard users cannot open
  these panels yet: the card reaches them from its legend buttons, and this row has none.
- **The source row keeps the verbatim quote**, pulled out of `explain` by `quoteParts`. `explain`
  no longer renders when `giai` is present, but it must still exist: the `ngo-nhan` gate reads the
  quote there, and the quote is what lets a reader open the source and check it. One Nguồn row,
  link first, each quoted run on its own line — two quotes on one line glue together.
- **The Thay số row (`giai.gan`) names which SYMBOL takes which figure, and it is gated four
  ways** in `quiz.test.ts` ("Thay số — ký hiệu nào nhận con số nào"): every picture-bearing `giai`
  has one; every `kyHieu` is a `spec.symbols` latex OR a `\text{…}` fragment verbatim in
  `spec.latex` (many pictures spell words like `\text{Tài sản ngắn hạn}` with no legend row); every
  number in a `giaTri` appears verbatim in the facts, the prompt, the `worked` line or `thaySo`,
  in both languages; and in a fill-in question every blank is covered — compared with its minus
  sign stripped, since `blanksOf` keeps "−0,0246" while the number tokenizer does not. There is no
  meaning field: the UI reads the meaning from the page's legend (a `\text{…}` fragment prints
  bare, it reads itself). **A row is either `giaTri` ("V = 42.500" plus the legend's meaning) or a
  `moTa` sentence** printed right after the symbol with no "=" and WITHOUT the legend's meaning —
  149 of the 431 rows. The owner rejected both shapes that came before it the same afternoon:
  "C*i = 12.000.000 · 12.000.000 · 12.000.000" (the "·" is the multiplication dot of the very
  formulas on the page, and the list says nothing about which number is which purchase), and then
  one line per figure beside the legend's general meaning — *"tiền mua giá đợt i nghĩa là gì? …
  máy móc quá"\_. So a symbol that takes several figures, or whose legend meaning is abstract
  ("đợt i", "phiên t"), names a UI field ("theo ô Thời gian nắm giữ"), has the wrong unit for this
  question (tỷ ₫ where the question is in million USD, "per session" where the data are monthly),
  or lectures a convention ("12% thì g = 12"), gets a concrete sentence: "C_i là số tiền bỏ ra mỗi
  lần mua: cả 3 lần đều là 12.000.000 ₫". One row per symbol, exactly one of the two fields — a case
  enforces both. Numbers in a `moTa` fall under the same verbatim gate, which caught three derived
  figures on the way ("tức 1%" for 12% ÷ 12): write the derivation in words, not the result.
  **What no gate sees is swapping two same-unit figures** (V ↔ P), nor a sentence that reads
  mechanically: every row was read by hand, and new ones must be too.
- **`thaySo` is the `worked` line with its brackets stripped**, for every fill-in question, and a
  case requires it verbatim (both languages) — a hand-written line could print a different sum from
  the one the learner just filled.
  `giai.tinh` carries no `—`/`–` (a case enforces it; 15 had copied "FCFE — dòng tiền…" from the
  formula name, right beside the picture, where a long dash reads as minus), and the UI lowercases
  its first letter after "để tính" unless it opens with an abbreviation (`giuaCau`). Below 560px
  the labels stack above their values: "CÔNG THỨC ÁP DỤNG" is ~130px and ate half of a 390px row.
- **Rows share one column via `subgrid`**, not `display: contents` (which drops the `<div>` that
  groups each `dt`/`dd` pair from the accessibility tree in some browsers). A per-row grid made
  each label column as wide as its own label, so the four values started at four positions.
- **The picture is `display: math` (inline), and the text rows use the UI font.** KaTeX emits
  `<math display="block">`, which the browser centres; here it must hug the left edge like the
  rows around it (the attribute still keeps full-size fractions). The Áp vào công thức and Kết quả rows
  are words: `font-family: math` made Vietnamese diacritics look foreign next to the rest of the block.

When a distractor must be referred to in prose, cite it by LETTER — `quoteParts` wraps every
`“…”` in `<q>`, so a quoted wrong answer renders exactly like the source's own words.

**Coverage: 150 of 473 questions are fill-in with a Thay số row (plus Q088), and 109 of 111
formulas have at least one** (25/09/2026 — "áp dụng cho toàn bộ 111 công thức"). The two
without: `chuoi-phien-giam-dai-nhat` (a count then a max — no arithmetic to fill; the workflow
agent refused rather than draw another formula, and a multiple-choice question is the owner's
call) and `beta` (only Q088, which overrides the formula row, so it has no picture to map symbols
onto — it needs a sourced `β = Cov ÷ Var` fill-in question). The ~306 conceptual questions ("why
does EV subtract cash?") keep the paragraph: they have nothing to substitute, and a `giai` there
would be an invented sum.

**42 fill-in practice questions, Q412–Q453** (`items/thuc-hanh.ts`), raised practice coverage from
105/411. Q412 was written by hand as the template; the other 41 were drafted by agents that looked
for real worked examples online, then passed every machine gate in this file and a hand review of
each `worked` line against its page's `latex` and `calc`. The automated adversarial pass died to a
session limit, so its checks — reopen every URL, confirm the drawn formula — were done by hand; two
URLs that failed a bare `fetch` (a TLS error, an anti-bot 406) were reopened with a page reader and
matched the figures. **47 formulas still have no fill-in question.** Every `dien-so` question
derives its `giai` mechanically: `tinh` from the formula name, `thaySo` from `arithmeticOf(worked)`,
`ketQua` from `expected` and `unit` — so it cannot disagree with the line the learner just filled.

**20 more, Q454–Q473** (25/09/2026), for 20 of the 21 formulas that had no calculation question
at all — mostly series formulas (SMA, RSI, MACD, Bollinger, Sharpe, Sortino, VaR, CVaR, VWAP,
XIRR…). The fill-in gate never calls `calc`, only re-computes the line, so a short real series
(five ACB closes, ten VN-Index returns) is enough, as long as the line draws the page's own
formula. Workflow run the owner opted into: 7 drafting agents (three formulas each, real prices
from cophieu68 / Investing / broker notes) and 7 adversarial ones that reopened every URL,
re-computed with `worked-line.ts` and checked each `gan` by meaning; 14 agents, 0 infrastructure
failures, 20 kept. They fixed their own drafts where needed (long dashes in prompts, a CVaR
prompt that gave the wrong rule, a win/loss `gan` that lumped both sides onto `r`).

**A graded choice is marked by ONE thing each** (24/09/2026). A wrong pick gets its text struck
through and muted plus a `Sai` badge, and its red BACKGROUND FILL is gone — the strike already
says the option is out, so a filled red box under it was the third voice saying the same thing.
The red border stays, because it is the only thing left that says the user PICKED this one
rather than that it is merely wrong. The right answer says `Đúng` whether the user picked it or
not; `quiz.correctAnswer` ("Đáp án đúng") is retired, since the badge sits inside the option and
position already says which option it belongs to. `quiz.wrong` went from "Chưa đúng" to "Sai"
in the same round — a softened three-word label beside a strike-through reads as hesitation.
Note the deliberate asymmetry left behind: the explanation box below still titles itself
"Vì sao chưa đúng", because there it is addressing the reader's reasoning, not labelling a box.

The English side splits in two. The 40 UI strings are all translated; the questions are not — 205
of 411, counted out loud by a case in `quiz.test.ts`, because every question written from batch 1
onward is bilingual from the start while the 206 of the first pass were Vietnamese only (93 of them
now have `explain.en`, but not yet `prompt.en` or `choices.en`). `QuizBody` falls back to
Vietnamese and says so. The verbatim quote stays in its source's language in BOTH versions:
translating it away is what removes the reader's ability to check it.

## Notes

- **There are two colour palettes, and both live in `src/app/globals.css`.** The dark one is a
  second token block under `[data-theme='dark']`; the 67 CSS Modules were not touched, because
  `tokens.test.ts` had already forced every colour through a token. Three rules hold it together.
  (1) A new colour token must be declared in **both** blocks — `tokens.test.ts` fails otherwise,
  and its exemption list (`--color-brand-*`, the logo, deliberately theme-invariant) requires a
  written reason per entry. (2) `contrast.test.ts` runs the **whole** WCAG battery over both
  palettes, 27 assertions each; `extractColorTokens(css, selector)` is scope-aware precisely
  because the older flat version would have silently retargeted the light assertions at the dark
  values and stayed green. That is also why the `@media print` block sets `color-scheme` on `html`
  rather than `:root` — two blocks with the same selector name and the extractor cuts the wrong
  one. (3) Selector specificity stays at `[data-theme='dark']`, never `html[data-theme='dark']`:
  the token layer must not outrank component rules, and the `@media print` docblock records what
  that class of mistake costs. Theme is `Preferences.theme` inside the existing `ffb.prefs.v1`
  (two states, default light, no `prefers-color-scheme` anywhere — the project owner chose an
  explicit setting over an inferred one). `PreferencesProvider` writes `data-theme` after hydrate
  the same way it writes `lang`, and an inline `<head>` script in `layout.tsx` — the repo's first,
  CSP-legal under the existing `'unsafe-inline'`, paired with `suppressHydrationWarning` on
  `<html>` — sets it before first paint so dark users get no white flash. The control has **two
  shapes for one preference**: `ThemeSwitch`, a single icon button in the header — shown at **every**
  width since the search icon left the header and freed a slot; the `.themeControl` wrapper that
  used to hide it below 1024px is gone — and `ThemePicker`, the labelled two-option control in
  Settings. Settings is therefore no longer the _only_ way in on a phone, but that row still can't
  be dropped: it is the one place a user reads which theme is set instead of decoding an icon.
  Both read and write
  through `usePreferences`, so the state stays single-sourced; only the affordance differs, for the
  reason `ThemePicker`'s docblock records. `ThemeSwitch` keeps **both** icons in the DOM and lets
  CSS pick by `data-theme` rather than letting React pick one: first render is always `light` so
  that it matches the static HTML, so a React-picked icon would show a sun on a dark page until
  hydration — the exact flash the boot script exists to prevent.
- **Exported files stay light, always.** `draw-card.ts` used to read live tokens through
  `getComputedStyle` so the PNG matched the UI; with two palettes that turns every share card
  dark, disclaimer box included. It now pins `CARD_COLORS` to the light palette, and
  `draw-card.test.ts` both blocks `getComputedStyle` from returning and diffs all eight hex codes
  against `globals.css`. Same reasoning as exports always being Vietnamese while the UI can be
  English: an exported file is a standalone document. `@media print` already hard-coded
  `#000`/`#fff`, so PDF and PNG now agree.
- **Both export paths now carry the chart, and both do it by _copying the live `<svg>`_** — never by
  rebuilding one. `src/ui/sheets/chart-snapshot.ts` finds it via the `data-chart-svg={idBase}`
  attribute that `LineChart`/`WaterfallChart` stamp on their `<svg>` (keyed to `idBase`, so it can
  never grab the `-full` copy the fullscreen overlay renders), strips the pointer-capture rect and
  hover trace, and suffixes every `id` with `-xuat` because the copy is the **third** instance in one
  document and `url(#…)` resolves to the first match. It is loaded through a bare `import()`, exactly
  like `draw-card` and for the same reason — measured: 0 HTML pages reference its chunk, so First
  Load JS is untouched. Rebuilding the chart instead would mean importing `@/core/chart` from
  `ExportSheet`, which `FormulaDetail` imports **statically** — that is the invariant `FormulaChart.tsx`
  states in capitals. Keeping both copies light follows the bullet above but by two different routes:
  PDF leans on a 15-token light copy declared on `.print-region` in `globals.css` (pinned by four
  cases in `tokens.test.ts`, one of which fails when `chart.module.css` starts using a colour the copy
  lacks), while PNG is light _by construction_ — `chartSvgUrl()` harvests rules from
  `document.styleSheets` and only ever takes `:root`, never `[data-theme='dark']`. It has to inline
  them at all because an SVG loaded through `<img>` is a separate document that cannot see the page's
  stylesheet. Four assertions in `check:chrome` hold the whole chain, and two of them exist because
  the naive measurement lies: `content-visibility` lets Chrome skip style recalc for the below-the-fold
  chart (so `getComputedStyle` returns a fresh custom property beside a stale `stroke` — scroll it into
  view first), and Chrome under `print` media reports the light palette even for the on-page chart.
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
- **There is no separate home page any more — `/cong-thuc/` is the landing screen.** On 15/09/2026
  the owner merged WF-01 (home) into WF-02 (formula list): `FormulaListScreen` stacks a typeable
  search box, the "Công thức dùng hằng ngày" shelf and the full list (a "Mức độ" Basic/Advanced
  toggle and a sort select in its title row, a horizontally scrolling `CategoryChips` radio row, and a
  "Hiển thị · N công thức" line). `/` is only a redirect: `public/_redirects` returns 301 in
  production, and `src/app/page.tsx` carries a `noindex` `<meta http-equiv="refresh">` for dev,
  preview and `check:chrome`, whose servers ignore `_redirects`. There is no `ROUTES.home`, no "Trang
  chủ" nav item (4 items), no header mode toggle (`showsModeToggle`/`HeaderModeToggle` are gone), and
  the sitemap gives `/cong-thuc/` priority 1. `manifest.webmanifest` keeps `"id": "/"` while
  `start_url` moved, so installed PWAs keep their identity; `sw.js` uses `/cong-thuc/` as its
  offline shell (never `/`, which is a 301 in production). **Offline, the service worker never
  serves that shell under another URL**: a navigation that fails and has no cached copy gets a
  302 to `/cong-thuc/` (query kept for `/`, mirroring `_redirects`), and only that URL gets the
  shell HTML. The v4 worker served the shell's HTML for `/` directly, and on a phone that opened
  the app before the radio was up that meant a React hydration error (#418), a header showing the
  logo instead of the screen name and a stale-looking page at `/` until the next reload — the
  "old screen, then it reloads into /cong-thuc/" the owner reported on 16/09/2026. Two cases at
  the end of `chrome-check.mjs` hold this with a real service worker and a server that drops
  connections (CDP network emulation does not reach fetches made inside a worker). Three rules
  keep the screen's static HTML whole, and `verify-static.mjs` checks all three against
  `out/cong-thuc/index.html`.
  - **(1) Never call `useSearchParams()`/`useListParams()` in the screen.** Filter state lives in
    `useState` (`use-list-url-state.ts`) and is _written_ to the URL with
    `history.replaceState(null, …)`, debounced for typing and flushed on `pointerdown`/Enter. The
    URL is _read_ only by `ListUrlSync` (`list-url-sync.tsx`), an empty component inside its own
    `<Suspense>`. The one bailout boundary is therefore empty, and the shelf and all 111 list cards
    stay in the HTML. `applySearch()` drops echoes of the hook's own writes, including late echoes
    that no longer match `location.search`; that check is what stops typed characters from being
    dropped. A legacy `?segment=` is ignored: the segment tabs are gone, and applying it would be an
    invisible filter.
  - **(2) The first client render must equal the static HTML.** Before `hydrated` the list renders
    all 111 cards, and advanced ones carry `advancedPreHydrate`, which CSS hides under
    `html:not([data-mode='advanced'])`, so Basic users never see the list shrink. Chip counts and the
    count line render both numbers and let CSS pick by `data-mode`. Never call `rememberOrigin()` on
    mount: the screen's effect runs before `OriginTracker`'s and would overwrite the scroll position
    the back button is about to restore. The one exception is **returning from a search result**
    (owner's request, 18/09/2026): opening a result in the same tab while a query is typed marks the
    tab (`markResultOpened()`, `RESULT_OPENED_KEY` in `sessionStorage`; Ctrl/⌘-clicks don't), and the
    first URL read after the next mount drops `q` (category and sort stay), scrolls to the top and
    calls `cancelScrollRestore()`, because the saved position belongs to the dropped result list. The
    q-less URL is written through `queueMicrotask`, never inline: under `next dev` `ListUrlSync`
    hydrates before the Router effect that patches `replaceState`, and a native `replaceState(null)`
    there strips `__NA`, after which Next ignores Back to that entry.
  - **(3) The shelf is server-built.** `DailyShelf` (server) renders the 16 tiles of
    `DAILY_SHELF_IDS` (`daily-shelf.ts`, all `isFeatured`; the first 8 in mockup order, the next 8
    cover the featured categories the first 8 miss) plus the `<h2>`, and passes them into the client
    screen via the `shelf` prop. `FeaturedFormulas.tsx` **reorders** them from `ffb.usage.v1` (score
    halves every 30 days; `PERSONAL_SLOTS = 4`) and owns the "Xem tất cả" / "Thu gọn" button: a
    `<button aria-expanded>` that shows only the first `DAILY_SHELF_PREVIEW = 8` tiles until clicked.
    The rest stay in the HTML with the `hidden` attribute, cut by **position after reordering**, so
    personalised tiles are always in the visible part. The open state is remembered per tab in
    `sessionStorage` (`DAILY_SHELF_OPEN_KEY`) and re-applied in a `useLayoutEffect`, so the page is
    already full height when `OriginTracker`'s back-button scroll restore runs. The shelf is always exactly `pinnedIds.length`
    tiles with no repeats (`rankFeaturedIds()` guarantees it). `FeaturedFormulas.test.tsx` compares
    `renderToStaticMarkup()` against the mounted DOM. Never make the shelf wait on a `hydrated` flag:
    it holds the LCP candidate. While a query is typed the shelf is hidden with the `hidden`
    attribute, not unmounted, so the personalised order survives. The shelf carries no secondary
    text: the owner removed the "moved to the front" note and the Data table link on 15/09/2026, so
    `/du-lieu/` is now reached from the detail screens of price-series formulas only. A usage entry
    is written once per page view, after 8 s of visible dwell **or** the first edit to an input —
    never on mount, since `?ma=` fills the fields by itself.
  - Search history is **one** store again (`ffb.recent.v1`), shared with `/tim-kiem/`, because both
    boxes now search the whole library. The old `ffb.recent.home.v1` is merged in once on first open,
    then deleted, and "Xoá toàn bộ" still sweeps it (`LEGACY_STORAGE_KEYS`).
- **Nothing under `src/ui/charts/` may call `useId()`.** That whole directory sits behind the
  `next/dynamic` boundary in `FormulaChart.tsx`, where React's generated ids differ between the
  static HTML and the client hydration pass — measured as 5 hydration warnings per chart page. Every
  id there is derived from `formula.spec.id` and threaded down as an `idBase` prop, with a `-full`
  suffix for the fullscreen copy so the two `<pattern>` nodes that coexist stay unique. This includes
  shared primitives: `SweepPicker` passes an explicit `id` to `Select` instead of letting it generate
  one. `charts.test.tsx` fails if any id in the chart subtree matches React's `:r…:` / `«…»` shape.
- **On-screen text goes through `useT()`** (client components) or the client leaf `<T k="…">`
  from `src/ui/i18n/T.tsx` — the leaf is what server components use (`DailyShelf`, AppShell), and
  also what a component rendered on _both_ sides must use (`FormulaCard` is reached from both the
  client `FormulaListScreen` and the server-rendered `DailyShelf`, so a hook would crash the server
  pass). The static `t()` import from `@/application` is frozen to Vietnamese at build time, so
  a gate in `i18n.test.ts` scans **all of `src/ui` + `src/app`** and fails any file importing it
  that is not on a three-entry allowlist, each entry carrying its reason: `layout.tsx` metadata,
  and the print/PNG regions of `ExportSheet`/`draw-card`
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
