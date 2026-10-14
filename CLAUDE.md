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
screen). Charts cover **103 of 111** formulas; the other 8 declare `chartType: 'none'` deliberately.
The test is **"is the sweep a straight line"**, not "is the formula simple": the 8 are all a product
or a difference of their inputs, so the sweep is a line through the origin that the `expression`
line above it already tells you. A ninth left the group on 06/10/2026 — `rut-truoc-han` became a
`waterfall`, because a straight-line sweep is exactly the criterion for drawing the breakdown
instead. An audit re-derived this from the Registry and moved two formulas
out of that group — `so-hop-dong-toi-da` (a floor division, so the sweep is a **staircase**) and
`gia-von-trung-binh-dca` (the unknown sits in the denominator, so the sweep is a **curve**). Each of
the 8 now carries its reason at the declaration; the shared one for the five fee/tax formulas is in
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
npm run verify:static  # 51 assertions against a built out/ — run after build
npm run check:chrome   # 204 assertions in a real headless Chrome (360×780, 560 and 1440) — needs out/ + Chrome
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

**"Khi nào dùng" (`explanation.whenToUse`) is ONE sentence that opens "Dùng khi bạn …" / "Use it
when you …"** (30/09/2026). The owner found the old section "quá khó hiểu". Measured on the old texts,
4 of 111 spoke to the reader and 11 described the formula as an input to another one. The owner chose
one templated sentence per formula with no "Không hợp khi …" line. All 111 were rewritten (a
10-agent draft plus adversarial pass against `calc`). `src/core/when-to-use-rules.ts` holds the rules:
the prefix, one sentence, a length cap, no long dash, no "đầu vào / mẫu số / suất chiết khấu", no
other formula's acronym, no `%` or threshold, and no buy/sell phrasing. `when-to-use-rules.test.ts`
runs those rules over all 111 and also checks that two formulas never share a sentence. The rules
cannot see a sentence promising a use `calc` does not support, such as describing monthly deposits
for a lump-sum formula, so a new sentence must still be read against `calc`.

**"Cách đọc kết quả" (`explanation.howToRead`) follows "So với [mốc]: …" / "Compared with [anchor]:
…"** (30/09/2026), the owner's follow-up question on the same screen: "cần đọc như nào cho hợp lý".
Measured on the old texts: 5 quoted the OLD worked example's own numbers (CAPM said "13.1%/year",
the screen now shows 11.92%), 5 for the fee/tax formulas baked in a number computed from the current
fee schedule, 13 carried no reading rule at all — only a property or sensitivity of the formula — and
about 20 gave no comparison anchor ("a high P/E means…" high compared with what?). The fix: one
sentence naming an anchor the reader actually has (the market price, 0, 1, 100%, a savings rate for
the same term, a peer company, the same stock's own prior period, the loss you can tolerate…) plus
AT MOST one more sentence for a value `calc` genuinely returns that reads as wrong at first glance
(negative, zero, past 100%, rounded, a sign convention). Nothing that fell outside that shape was
moved anywhere — the owner chose to drop it, not relocate it. `src/core/how-to-read-rules.ts` holds
the rules (shares its acronym list and buy/sell patterns with `when-to-use-rules.ts`): the opening
words, an anchor named before the colon, a length cap, no long dash, no pointing at the worked
example or the chart, no "numerator/denominator", no other formula's acronym, and numbers restricted
to 0/1/100 plus a **per-formula, written-reason** allowlist (`QUY_UOC`) for a few named market
conventions (RSI's 70/30/50, Stochastic's 80/20) — an ad-hoc threshold like "ROE above 15%" is not
allowed even though the old text had ones like it. **The anchor may not END in a digit**
(05/10/2026, corrected 08/10/2026): the owner read `ty-so-calmar`'s "So với 1: …" and asked what
"1:" was, because the template's colon lands against the digit and the pair reads as ratio
notation. **The first fix was wrong and the way it was wrong is the point.** It read the defect as
"the anchor is a bare number" and treated a noun in front of it as the cure, so `pb`, `peg` and 13
others were rewritten to "So với mốc 1:" — which prints the very pair the owner had circled. They
came back on 08/10 with `don-bay-tong-hop`: _"vẫn còn lỗi '1:' ? tôi có yêu cầu là nói rõ ràng cách
sửa rồi mà"_. A noun BEFORE the number does nothing about the two characters AFTER it. The cure is
a unit or noun **after** the number, which is what the English side had been doing all along ("the
1 mark", "the usual 70 and 30 marks") — measured 08/10: 111 of 111 `en` anchors already ended in a
letter while 15 `vi` anchors ended in a digit, and all 15 were rewritten ("mốc 1 lần", "mốc 0 đồng",
"mốc 1 của thị trường", "70 và 30 điểm"). `%` is deliberately **not** blocked: `100%:` does not read
as ratio notation because the sign closes the number, so `ty-le-chi-tra-co-tuc`, `phan-tram-b-bollinger`
and `don-bay-hieu-dung` keep their `%` anchors. Same 10-agent draft-plus-adversarial-pass shape as
the sentence above; `how-to-read-rules.test.ts` gates all 111. One real `calc` defect surfaced while
writing prose, not fixed here: `mo-hinh-gordon` guards `dividend === 0` with `fail(MEANINGLESS)` and
documents exactly why (FR-06 — a silent `ok(0 ₫)` reads as a real share price), but the sibling
`ddm-hai-giai-doan` takes the same `dividend` input with no such guard.

**"Ý nghĩa" (`explanation.meaning`) states what the formula MEASURES and may carry no sample
figure** (09/10/2026). This is the fourth FR-03 section and the last to get a rule, which is
exactly why it still held the defect the other two had been swept for: `don-bay-hieu-dung` read
_"đòn bẩy 5 lần nghĩa là chỉ số nhúc nhích 1% thì vốn của bạn biến động khoảng 5%"_. The owner:
_"ý nghĩa thì làm gì có chuyện có số liệu cụ thể trong đó, nếu cho vào để dễ hiểu thì nó lại là ví
dụ thực tế hoặc bài tập rồi"_. The 5 came from nowhere — not the `latex` (which has no digit), not
a market constant, and not the example, which returns 5,7927 today and returned 4,27 on the day the
sentence was written, so it never matched even once. `L = (F × m × N) / E`, so a 1% index move
moves equity by `L%`; freezing `L = 5` forces the 5% and leaves a sentence true only of an account
levered exactly 5 times. **The first rewrite was wrong in an instructive way**: it spelled the
digits out ("một phần trăm", "gấp đúng bấy nhiêu lần") and the owner rejected that immediately —
_"bạn chuyển số liệu thành text để đối phó với tôi"_. The defect is the SCENARIO, not the
spelling; a meaning sentence names the quantity and why it matters, and the illustration lives in
the worked example or the quiz. Six passages were rewritten (`don-bay-hieu-dung`, `beta`,
`lai-suat-hieu-dung`, `ty-so-thong-tin`, `var-lich-su`, `do-rong-dai-bollinger`), all bilingual.
`src/core/meaning-rules.ts` gates the machine-visible half over all 111 × 2: a number is allowed
only if it is 0/1/100 (the same three `how-to-read-rules.ts` allows), appears verbatim in that
formula's own `latex` — a self-maintaining test, since changing the picture changes the allowed set
— or sits in `QUY_UOC` with a written reason (two entries: `so-graham`'s 15 and 1,5, whose product
is the 22,5 the picture does draw, and `phan-tram-b-bollinger`'s 50, the midpoint of the 0–100
scale). Nine other passages keep their numbers because they pass the owner's own test — a figure
that holds for every use: Graham's constants, the 365-day base, the 0–100 scales, the 0 and 1
pivots, ROE's "per 100 units". `portfolio.betaHint` deliberately keeps its "1,5": it sits under an
input the user must type a beta into, where a magnitude is doing real work, and the i18n canary
that used to anchor both places on that shared number was re-anchored on "VN-Index" instead.

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

- The ticker list, in `localStorage` with a 24 h TTL (`ticker-list-store.ts`). Expired and the
  refresh fails, the old list is shown with **no note**: the owner removed "Đang hiện danh sách của
  lần tải trước, có thể đã cũ." on 29/09/2026 (tombstone `ticker.stale` in `vi.ts`). That is safe
  only because the list holds codes and names, no number. It is not a precedent for the price cache
  below.
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

**`/danh-muc/` is TWO COLUMNS since 12/10/2026** (the owner's new design, desktop only): a left
column with a "Danh mục" label, a vertical tab card and a summary card, and the table of the open tab on
the right. It replaced, in one move, the six `StatTile`s, the strip above the list, the expanding rows and
the three-shape table (dòng gọn / 560px / 1024px) of 22/09/2026. What was decided, and what it cost:

- **The summary card is `PortfolioSummary.tsx`.** Hero "Tổng giá trị", a gain line (`+3.950.000 ₫ ↑ +2,02%`,
  built only when `gain` is calculable — its reason is already printed under the hero), then "Vốn đã bỏ ra" ·
  Beta · XIRR rows. Everything is still a `CalcOutput` printed through `useCalcText()`: not calculable →
  `_ _` plus the reason, never `0` (FR-06). `totalCost` is deliberately independent of market price — it is
  the one real number that survives an outage. `gain` **inherits** rather than computing: `total` sums
  `row.value ?? 0`, so subtracting cost from it directly would invent a loss exactly the size of an unpriced
  holding's cost basis. Beta and XIRR print `_ _` with **no reason line** (owner, 29/09/2026: a new user sees
  both at `_ _` almost always, so the reason had become a fixed paragraph listing every ticker) and exist only
  in **advanced** mode (FR-09); in Basic the card ends with the "N ô nâng cao đang ẩn" note. The "Số mã" tile is
  gone — the count sits on the tab **only**. The design also drew "5 / 50" beside the holdings title and a bare
  count beside the saved title; the owner circled both and had them deleted the same day, so each `<h2>` stands alone
  in its row (a case pins it) and the 50-holding cap is now stated only by `portfolio.errFull`, when it is
  hit. Rows print **bare numbers** (`1,04`,
  `14,2 %`, `195.750.000`) because the design does; only the hero and the gain line carry ₫. Labels and values
  are sibling `<span>`s so the `oThongKe` test helper (`findByText(label).parentElement`) keeps working.
- **A long number still must not break the card** (29/09/2026, "866.777.778.513.713.70…" ran out of its tile).
  The hero sets `--ky-tu` and shrinks with `clamp(…, 100cqi / (n × 0.56), 26px)` (0.56em is a measured
  0.50–0.51em for bold money on Windows plus room for macOS); every value gets a `<wbr>` after each thousands
  dot (`coChoNgat`, now in `ui/result/number-breaks.tsx`, shared). `check:chrome` measures the "Vốn đã bỏ ra"
  row at 1440 and 360 — it needs no network. The hero needs a price, and the script has no Finbox, so only the
  vitest case ("số dài") pins its `--ky-tu` and `<wbr>`. **`StatTile` has no caller any more.** It stays
  (its tests and CSS pins still pass) rather than being deleted inside a redesign diff; delete it, with its
  pins, when someone decides to.
- **The holdings table is one `<table>`, eight columns**: code (plain text, see the next bullet), shares, avg
  cost, market price (bold), gain, "Lãi/lỗ %" (arrow + number; the header was a bare "%" until the owner asked
  for the full label on 12/10/2026), weight (bar + number), and **buy date** (`dd/mm/yyyy`, `_ _` when the
  holding has none or the stored string is not an ISO day).
  **No company column, no value column, no expanding row, no overlay button.** Beta is visible **only in the
  edit dialog**; the buy date was too for one day (12/10), until the owner gave it the last column. `Xoá` is
  **one tap, no confirmation, no undo** — as designed. Percentages print one decimal fixed
  (`+11,0%`, `15,6%`), the gain line two. A ticker with no market price shows `_ _` in all four dependent
  cells (price, gain, %, weight), never `0`. `text-align` is keyed to column position on `<th>` and `<td>`
  together so they cannot drift apart, and `table-layout: fixed` with per-column widths. Below 1280px the weight
  bar is hidden and the cell padding and `min-width` shrink: the left column is ~300px, so at 1024px the table
  only has ~600px and Tỷ trọng plus the date column would sit off-screen.
- **The code is plain text, the whole row opens the edit dialog, and a red X shows only on hover**
  (13/10/2026). The owner redrew the row on a screenshot: _"bỏ bo viền ngoài xanh xanh của tên ticker … chỉ để
  hiển thị tên ticker thôi. bỏ 2 icon edit và xóa đi. thay vào đó … khi hover chuột vào một mã bất kỳ thì icon
  xóa sẽ hiển thị chỗ đó … nếu người dùng muốn sửa hoặc xem mã đó thì bấm luôn vào mã … thay thế chỗ trước kia
  của 2 icon Sửa và Xóa thành hiển thị ngày"_. That reverses the two icon buttons of 12/10 (the pencil is gone,
  the delete button moved from the row's end to right after the code) and the chip. The row divider stays
  `--color-hairline` although rows are click targets again; `hairline.test.ts` records why `.holdRow` did not
  return to its `--color-border` list.

  **The first build was corrected twice the same day, and both corrections are rules now.** It shipped a
  trash can that grew a soft red box on hover, and it left the Công thức table alone because the request and
  the screenshot covered the Mã table only; the reply asked whether to sync. The owner: _"khi nào hover vào mã
  đó thì hiển thị icon X chứ không phải là icon xóa. thêm nữa là không cần border đỏ xung quanh icon X chỉ cần
  icon ĐỎ X thôi. đồng bộ cả bên Công thức nữa chứ không phải mỗi bên mã"_. So: the delete control is an **X**
  (`TILE_ICONS.close`), red from the moment it appears, with **no background and no border in any state**
  (`.rowActionDanger:hover` is gone; `.rowRemove:hover` re-declares the colour and a transparent background so
  `.rowAction:hover` cannot paint its grey box). And **both tables of this screen share one row design** — a
  change to one is a change to the other; do not leave them apart and ask. A third note followed within the
  hour, on the "one red in every state" build: _"di chuột vào icon X đó thì icon X đó cần đậm màu hơn thể hiện
  là đang hover vào icon X đó"_. With the pointer **on the X itself** it is now a deeper colour and a slightly
  heavier stroke (1.7 → 2.3), still with no background and no border. The colour is
  `color-mix(in srgb, var(--color-danger) 62%, var(--color-ink))`, not a new token: ink is dark in the light
  palette and light in the dark one, so the X deepens in one and brightens in the other — the same direction
  `--color-accent-strong` takes in each palette. Computed, that colour reads `color(srgb …)` with 0–1
  channels, not `rgb(…)`; `check:chrome` converts before comparing. Five things are easy to break:

  - **The code is a `<button>`, not bare text.** A `<tr>` cannot take focus, so the row click never reaches a
    keyboard or screen-reader user; the code button is the same action with a name. It keeps the names every
    test and `check:chrome` anchor on — `Sửa FPT` on a held row, `Nhập số liệu HPG` on a pending one — and both
    buttons in the cell stop propagation, or the X would delete the ticker **and** open the dialog for it.
  - **The X hides with `opacity`, inside `@media (hover: hover)` only** (`.rowRemove`). Not `display`: it
    must stay in the Tab order and appear on `:focus-within`. And not outside the media query: a touch screen
    has no hover, so a transparent button there is an **invisible one-tap delete** beside every code.
  - **`.rowRemove` must be declared after `.rowAction` and `.rowAction:hover`** in
    `PortfolioScreen.module.css` — one class each, so file order decides: declared first, the box stays 36px
    and hovering the X paints the grey box back (the `.panelCenter` trap again).
  - **`.holdWeightCell` is `display: flex`, not `inline-flex`.** An inline box sizes to its content, so the bar
    kept its 88px in a 130px cell and pushed the percentage into the next cell. Nobody saw it while that cell
    held two icon buttons; with a date there, "100,0%" ran into the day at 1280px.
  - **Column widths are a budget, measured, not taste**: seven percentage columns plus a fixed-pixel date
    column (87% + 104px from 1280px; 85% + 90px below, which is exactly the 600px `min-width`). One more
    percentage point and `.tableWrap` grows a horizontal scrollbar. Two `check:chrome` assertions (1440 and 1024) hold the hover reveal, the X's position, the date cell, "no sideways scroll", and — **with the
    pointer on the X** — a colour that is still red but deeper than at rest, a heavier stroke, and a
    transparent background with no border.

- **The search box and the action button are ONE pair shared by both tabs: "Tìm kiếm" and "Thêm mới"**
  (12/10/2026). They were "Tìm mã" + "Thêm mã" on one tab and "Tìm công thức hoặc mã" + "Tính công thức mới" on
  the other, each tab with its own query; the two buttons had different widths, so the search box jumped on
  every tab switch. The owner: _"đồng bộ 2 chức năng này để khi đổi tab thì vẫn giữ nguyên … khi search ở tab
  nào thì tab đó hiển thị tương ứng, tương tự với button Thêm mới"_. So `headTools` is built once in
  `PortfolioScreen.tsx` and dropped into both title rows — measured: identical rectangles on both tabs at 1440
  and 1024. Same words, different job by open tab. **There is one `query`**, it survives a tab switch and
  filters whichever table is open (both match by ticker). "Thêm mới" is a `<button>` that opens the add form
  on the Mã tab and a `<Link>` to the formula list on the Công thức tab, because a saved calculation is only
  ever created from a formula's detail screen. The search box is now **always** rendered, empty tab included —
  hiding it when there was nothing to filter would give the two tabs different title rows again; a case that
  pinned the opposite was inverted. `portfolio.add` ("Thêm mã") survives only as the add dialog's title, so
  **tests find the opener by `{ name: 'Thêm mới' }`** and the dialog by its "Thêm mã" heading. The cost, known:
  the two generic words say less than the four they replaced, and the title to their left carries the context.
- **On the Mã tab the search hides rows only.** Weight is still measured against the whole portfolio — a ticker
  alone on screen must not read "100%". It matches code and company name through `normalizeVi()`, like the
  ticker picker; the company name comes from the holding or, failing that, from `quotes`.
- **The Mã table sorts by clicking a column header, at every width, and remembers it** (14/10/2026). The
  owner asked for sorting on PC and phone and chose all three things: header click (no sort select), the
  choice kept on the device (`ffb.portfolio.sort.v1`, a row in `STORAGE_ITEMS`), and the Mã table only — a
  scope the owner widened the same afternoon (see the next bullet). The rules are pure, in
  `src/application/portfolio-sort.ts`: a click cycles first direction →
  reverse → the order added (Mã starts A→Z, numbers and Ngày mua start largest/newest); a `_ _` cell sorts
  LAST in both directions (sorting it as 0 would invent a figure, FR-06); pending rows stay after the
  holdings and sort only by Mã or Thị giá; ties keep the order added. Below 1024px Lãi/lỗ, % and Tỷ trọng
  have no header, so a stored sort on one of them (set on PC, then a tablet rotated) shows the order added
  while the store keeps it — `effectiveHoldingSort()`, fed by a `matchMedia` listener (`khoPC`), not by
  `laKhoPC()`, which only reads at click time. The store is written in the click handler, never in an
  effect on `sort` (that effect would also run on the load and write back what was just read), and the
  key is removed on the third click. Each `<th>` holds a `<button>` named exactly the column label (so
  `columnheader` names did not change) and carries `aria-sort` only while it is the sorted column; the
  button's `::after` covers the whole cell, which is why `.holdHead th` is `position: relative`. **The
  arrow's position is measured, not taste**: below 1024px it sits inline after the label (the auto-layout
  table widens that column 1–4px; no sideways scroll at 360 or 390); from 1024px it is absolute, BEFORE
  the label in the cell's own left padding (6px arrow + 2px gap = the 8px padding of the 1024–1279 band),
  and after the label only in the Mã column, whose left is the table edge. Inline at 1024px it pushed
  five labels 6–12px; absolute after the label it fell into the next cell under "Giá vốn" and "Tỷ trọng"
  (both labels already reach their cell's right edge at 1024px) and that cell's background painted over
  it. Measured in Chrome at 1440, 1280, 1024, 390 and 360: no label moves when the arrow appears. No
  `check:chrome` assertion holds this yet.
- **The Công thức table sorts by clicking a column header too** (14/10/2026, the owner: _"trong phần công
  thức đang chưa có chức năng sort. thêm chức năng này cho tôi"_). Same `SortHeader`, same arrow CSS (the
  first column, Công thức, takes the arrow after its label like Mã), its own store `ffb.saved.sort.v1` (a row
  in `STORAGE_ITEMS`, after the drafts row, because the drafts row must sit right after the saved-calcs row).
  The owner chose two things when asked: **Kết quả does not sort** (one column mixes ₫, %, lần, so any order
  would rank 1,08 lần against 4.318 ₫; its `<th>` is plain text), and **Ngày lưu carries the arrow from the
  start**, because the table is already newest-first. So unlike the Mã table there is no "unsorted" state:
  the default IS `{ savedAt, desc }` (`DEFAULT_SAVED_SORT`), Công thức and Mã cycle A→Z → Z→A → default,
  Ngày lưu toggles oldest-first ↔ default, and the key is removed whenever the default comes back. Rules
  in `src/application/saved-calc-sort.ts`: the name sorts by the title ON SCREEN (`row.title`, not the
  stored name) through `Intl.Collator('vi', { numeric: true })` — code-point order would put "Biên" before
  "Ảnh" and "Định"; a row without a code sorts last in both directions; ties stay newest-first. Measured in
  Chrome at 360–1440: no sideways scroll in any state (at 360px with "67.520.669,9 ₫" the name column
  still fits its header plus the arrow), and from 1024px no label moves. `check:chrome` taps the Công
  thức header with a real mouse at 360 and 560.
- **The price strip moved into the summary card's footer** and is still ONE `<p role="status|alert">` carrying
  the loading / failed / stale / none spans and the refresh button. The session date is printed **once on the
  whole screen**: a stale price is only allowed because the screen names its session (`price-cache-store.ts`),
  and tests find the date with a single `getByText`.
- **While prices load, every number that lives on the price is a loading bar** (`KhungCho.tsx`, 14/10/2026).
  The owner pressed "Làm mới" and saw nothing reload but the date line: _"chức năng làm mới đang không làm cho
  tôi cảm thấy dữ liệu đang được tải lại … thêm loading cho bảng dữ liệu bên dưới sao cho hợp lý khi tải
  lại"_. Finbox answers in ~0.2 s, so the old strip text flashed for one frame. Now, while `priceLoading`:
  the holdings `<table>` is `aria-busy`; Thị giá, Lãi/lỗ, Lãi/lỗ %, Tỷ trọng (and the phone detail row's three
  figures, and a pending row's price) become a bar; the summary's Tổng giá trị and gain line do too, and the
  reason under the hero is hidden ("missing price" while a price is on its way is false). Số CP, Giá vốn,
  Ngày mua and Vốn đã bỏ ra do not depend on the price and stay put. The refresh/retry button is disabled with
  a spinner, label unchanged (below 1024px the header's refresh icon spins instead — see the phone bullet). **A user-pressed refresh holds that state for `MIN_REFRESH_MS` (600 ms)** —
  deliberate, the `SEARCH_DELAY_MS` precedent of `TickerPickerSheet`; the first load is never stretched.
  Easy to break: the bar keeps the old text INSIDE it, hidden with `visibility` (the `::after` turns itself
  back to `visible`), so a cell keeps its width and the auto-layout phone table does not jump; not
  `color: transparent`, which `tokens.test.ts` forbids. When not loading, `KhungCho` returns its children
  bare, so the DOM is exactly as before. Under reduced motion (the owner's machine) the bar breathes in place
  instead of sweeping, an override on purpose for the same reason as the picker's spinner.
- **Below 1024px the screen follows the owner's phone design of 14/10/2026** (the first small-screen design;
  until then it was "tính sau" and the columns just stacked). One breakpoint, 1024px, for everything below it.
  Everything is CSS in the `@media (max-width: 1023.98px)` block at the **end** of `PortfolioScreen.module.css`
  (it must beat the table rules above it, the 1279.98px block included), except two things: what a click on
  a Mã-table ROW does, and where the Công thức table's red X sits (see below). `laKhoPC()` reads
  `matchMedia('(min-width: 1024px)')` **at click time** (never during render, the static HTML does not know
  the width); no `matchMedia` (jsdom) means PC, which is what every older test pins. The X uses `khoPC`, a
  `matchMedia` listener state that starts as PC for the same reason.
  **Every colour and size in that block is MEASURED on the owner's image, not chosen.** The first build swapped
  the drawing's colours for the product's existing ones (light-blue selected tab and add button with navy text,
  the primitive's default tab look) and the owner answered: _"màu của button thêm mới như nào, màu của tabbar
  khi chọn là như nào ? đừng tự sửa thiết kế của tôi và đừng bịa thiết kế"_. The fix read the PNG's pixels
  (390×844 at 2×) and a screenshot of the screen at the same size, region by region, until every colour matched
  by hex and every offset was within 1–2px. Where the drawing had a colour no token held, a token was added
  rather than rounding to the nearest one: `--color-cta` / `--color-on-cta` (#2563eb, white — the same in both
  palettes, because the dark palette's `--color-selected` is deliberately light blue), `--color-danger-line`
  (#6b3b42 dark) and `--color-chevron` (#5a6880 dark). Sizes from the drawing: 10px side margins (the screen
  widens past `--gutter` by 6px a side), 13px table text, 15px codes, 49px rows, 34px header row, 46px add
  button, 38px detail buttons (44px tap overlay). Each rule carries its measured value in a comment. A new
  phone design for this screen is checked the same way — measure it, do not eyeball it. **The owner later
  overrode two of those measurements themselves** (14/10/2026): _"đồng bộ về 1 loại màu cho tôi chứ không
  được để khác màu, kể cả ở bên Mã cũng thế. ngoại trừ tên mã tên công thức thì vẫn để là size to hơn 1 px
  và in đậm"_. So below 1024px, in BOTH tables, every figure on a row is 13px, regular and `--color-ink`
  (the same colour as the row's name), and the name — the code in the Mã table, the calculation name in
  the Công thức table — is 14px and bold. That retires the drawing's 15px code, the old "quantity, cost
  and buy date paler (`.holdMuted`), market price bold (`.holdPrice`)" pair, and the paler Tỷ trọng and
  medium-weight gain figures of the detail row. Two colours remain on purpose: `_ _` (`.holdMissing`, the
  FR-06 "no figure yet" signal) and the green/red of the gain figures in the detail row, which back up
  the +/− sign. PC is unchanged. `check:chrome` compares computed size, weight and colour at 360 and 560.
  What the design changed, and what is easy to break:
  - **The header says "Danh mục" (`portfolio.title`, was "Danh mục của tôi") and carries TWO icons, Tìm kiếm
    then Làm mới giá to its right, instead of Sáng/Tối and VI.** The owner: _"cứ làm theo thiết kế. còn button
    sáng tối thì để người dùng thay đổi ở màn home"_ — the two buttons stay on every other screen.
    `HeaderControls` (client) renders an empty slot `HEADER_ACTIONS_ID`; the screen `createPortal`s into it
    after mount; `headerHasScreenActions()` in `routes.ts` (pathname-based, so the static HTML already hides
    Sáng/Tối and VI below 1024px — no flash) lists the screens that do this, today only `/danh-muc/`. The slot
    is `display: contents`, or an empty flex item adds a 4px gap on every screen. **The refresh icon went and
    came back the same day** (14/10/2026): crossed out on a screenshot (_"bỏ icon refect ở đầu đi chỉ để lại
    icon search"_), then restored (_"thêm lại icon refresh lên để ở bên phải của icon search đồng thời xóa
    ngày và tên button tải lại ở tab mã đi. khi bấm vào tải lại thì cả ở màn Mã và công thức đều có hiệu ứng
    tải lại như của màn Mã"_). So, below 1024px: the icon sits where the first design measured it (centres
    52px apart, 30px from the right edge), spins and locks while loading (`aria-busy`), and calls `lamMoi()` —
    prices for the Mã tab AND a re-read of the saved-calc and series stores for the Công thức tab, whose
    Kết quả column and count become loading bars for `MIN_REFRESH_MS` (`savedLoading`). The summary card's
    footer on the Mã tab is gone at this width — date and "Làm mới" button both (`.footPrice` in
    `PortfolioSummary.module.css`, `.priceButton` here) — **except when the price is stale or failed**: that
    strip still shows (without its button), because FR-06 lets a cached price stand only beside its session
    date. From 1024px nothing changed: no header icon there, so the footer button is still the only refresh,
    and the Công thức tab has no refresh control on PC.
  - **The search box opens IN THE HEADER**, between the screen title and the right edge, the icon at its end
    (the owner circled that spot on a screenshot, 14/10/2026: _"khi bấm vào icon search thì có thêm một popup
    search ở chỗ rôi khoanh đỏ"_; before, it opened above the table). It is still ONE `SearchBox`, rendered
    in ONE of two places: `searchInHeader` (phone width by `khoPC`, slot found, open or holding text) moves it
    into the portal, inside `.headerSearch`, a frame that wraps the box AND the icon button, so the icon is
    the same element open and closed and focus does not drop. Two boxes with CSS hiding one would be two
    `searchbox`es. `SearchBox` gained `bare` (no border, no leading magnifier, no clear × — the frame and the
    end button belong to the caller). **While open, the icon is an X, not the magnifier.** The first build
    kept the magnifier in both states and the owner opened the box and could not close it: _"bật ô search lên
    được rồi nhưng không có cách nào tắt đi được ? lỗi nghiêm trọng"_ — the magnifier did close it, but at
    the end of a search field it reads as "search". The button keeps the name "Tìm kiếm" (state is
    `aria-expanded`); `bare` drops the clear × because two X's side by side would do two different things.
    Closing — the X or Esc — **clears the query**: a hidden search box with a live filter is a table missing
    rows for no reason on screen; Esc also returns focus to the icon. **A tap outside closes the box only
    while it is EMPTY** (a `pointerdown` listener on `document`): with text, the table below is the result
    list and tapping a row is what the user came to do — closing there would clear the query and the row
    would run away. Easy to
    break: `.controlsScreen` (`AppHeader.module.css`) grows with `flex: 1 1 0` so the box has room, and its
    `min-width` is one icon, NOT `auto` — an `<input>` has a ~20-character natural width, so with `auto`
    the open box demanded ~230px at 360px (~267px once the × appeared) and squeezed the title to "Danh m…".
    The frame is 36px tall, like the circled box (measured on the screenshot, 1:1); its look is the product's
    search box, because the red stroke marks a place, not a drawing of a field. **While the box is open the
    refresh icon is not rendered** (owner, 14/10/2026: _"sau khi bật search lên thì phải ẩn icon refresh đi
    cho đến khi không sử dụng chức năng search"_): "open" includes holding text, so it comes back only on
    close, which clears the query. The frame takes its room and ends at the gutter (`margin-right: 0`).
    Removed from the DOM, not hidden by CSS, so it is no Tab stop while it cannot be seen; `check:chrome`
    checks it is gone in all three open states and back after each close.
  - **One "Thêm mới", not two.** Below 1024px the same `headTools` button is `position: fixed` above the
    bottom tab bar, its edges aligned to the CONTENT column (`.content` is capped at `--content-max` and
    centred, so at 768px edge-aligned would be 24px wider than the table). A second button would break every
    `getByRole('button', { name: 'Thêm mới' })`. `.screen` pads its bottom by the button's height.
  - **Tabs: `TabBar orientation="responsive"`** — horizontal below 1024px, the vertical card from 1024px. It
    answers both arrow pairs and declares no `aria-orientation`, since the markup cannot know which one CSS
    drew. Below 1024px it is NOT the primitive's default horizontal look: sunken tray with a `--color-border`
    outline, 40px tabs, solid `--color-cta` selected tab, no icons — all from the drawing — and **no count**:
    the drawing had "Mã 6 · Công thức 7", and the owner circled both numbers the same day (_"bỏ các text số
    nằm trong tab"_). Hidden by CSS (`.responsive .count`), not by dropping `count`: from 1024px the vertical
    card still prints it, the only place the holdings count appears on PC. `check:chrome` reads the tabs'
    visible text at 360 and 560 and fails on a digit. It sits in
    `.tabBand`, a surface-coloured strip flush under the header, full width, with a `--color-border` rule under
    it (pinned in `hairline.test.ts`).
  - **The summary card collapses to one row** ("Tổng giá trị · value · % · chevron"). Hidden by CSS, never
    removed: the price strip must stay the screen's ONE `role="status"`. The gain line moved INSIDE `.hero` so
    the percent can sit on that row. Exception, and it is FR-06: when the price is `'stale'` or `'failed'`
    the footer (`data-luon-hien`) shows even collapsed — a cached price may only stand on screen beside its
    session date. In normal state the date is behind the chevron; that reverses "always shown", by design.
    **The card has NO bottom rule**, though the drawing has one (owner, 14/10/2026: _"xóa đường viền thừa
    ra … nằm ngay bên trên bảng và xát với bảng"_): it ran the full screen width flush on top of the table
    frame's border, so it read as a double line and stuck out past the frame's two rounded corners. The
    table frame's own top border is the divider; `check:chrome` asserts the rule stays 0px at 360 and 560.
    **The Công thức tab's card has NO chevron** (14/10/2026): it first copied the Mã card and opened three
    counts (Trên số mã, Công thức khác nhau, Cần nạp lại chuỗi) plus the last save date; the owner
    photographed those rows and said _"bỏ poup như ảnh sau ở màn công thức đi"_. `SavedSummary` never sets
    `data-mo`, so the existing `.card:not([data-mo]) .more` rule keeps them hidden below 1024px, and the
    card is the single "Đã lưu N phép tính" row. From 1024px nothing changed — `.more` is
    `display: contents` there and the rows stand in the card as before.
  - **The Mã table shows five columns (Mã · Số CP · Giá vốn · Thị giá · Ngày mua).** A row click toggles a
    detail row under it (`openRow`, ONE open at a time — two open rows mean two red Xoá buttons on one
    phone screen): Lãi/lỗ, Lãi/lỗ %, Tỷ trọng, then "Sửa" · "Xoá" (the owner renamed the design's "Bỏ mã";
    pending rows get "Nhập số liệu" · "Xoá" and no figures). The column headers stay "Giá vốn", not the
    design's "Giá mua" — the owner's call. The three figures are printed by `GainValue` /
    `GainPercentValue` / `WeightValue`, shared with the PC cells. The detail row is rendered **only when
    open** (else every gain figure exists twice in the DOM) and is `display: none` from 1024px.
  - **The Công thức table has NO detail row at this width** (14/10/2026, second round). It first copied
    the Mã table (three columns, a row tap opened Ngày lưu and "Mở"/"Nạp" · "Xoá"); the owner redrew it:
    _"không có popup đổ xuống khi bấm vào mã nữa, chuyển date lên cùng hàng với cái số liệu kia giống như
    bên Mã. bây giờ bấm vào công thức thì là vào phần sửa luôn, tạo thêm Icon xóa ở góc bên phải như ở
    web"_. So below 1024px it keeps all four PC columns, a row tap opens the calculation exactly as on PC
    (`router.push`, the name link included), and the red X sits at the END of the Ngày lưu cell, always
    visible (`opacity: 1` re-declared, so a narrow desktop window shows it too). **Its spacing is
    measured** (owner, same day: _"giãn cách icon X để dễ dàng thao tác hơn"_): the first build put a 20px
    box 2px after the date with a 44px overlay anchored right, so the overlay covered the date's last
    digits — a tap on the date deleted. Now a 28px box, an 8px gap, and the 44px overlay centred, so its
    left edge stops exactly at the date and its right edge stops exactly at the table edge (the cell's
    8px right padding). The room came from the Ngày lưu column's left padding (6 → 4px, header and cells
    together): at 360px the name column's minimum is its nowrap HEADER "Công thức" (78px), and with a long
    result like "67.520.669,9 ₫" the last cell has 35–36px for gap plus box; 12px + 28px overflowed the
    table by 5px. `check:chrome` asserts the overlay does not reach the date. **The three figures of a row
    — code, result, save date — are ONE size, 13px, below the name's 14px** (owner, same day: _"đồng bộ
    size text của các số liệu … đảm bảo size đó nhỏ hơn size của tên công thức"_). Measured before: code
    and result 14px bold, date 13px, so two of them matched the name's size and outweighed it. 13px is the
    table-figure size of the phone drawing. **And ONE weight, regular**: the first pass left the weights
    alone (code and result 700, date 400) and the owner came straight back: _"cùng size rồi nhưng sao chỗ
    thì in đậm chỗ thì không vậy. đồng bộ để không in đậm. ngoại trừ tên công thức thì mới in đậm"_. The
    name (`--weight-medium`) is now the only bold thing on the row. PC is unchanged (all 14px, code and
    result bold). **And ONE colour**, the name's: the save date was paler (`--color-ink-soft`) until the
    owner's next message extended the rule to both tables (see the phone-design paragraph above).
    `check:chrome` compares the computed sizes, weights and colours. **It is ONE button that moves** — after the name on PC, in the
    last cell on a phone — chosen by `khoPC` (a `matchMedia` listener), not two buttons with one hidden by
    CSS: two "Xoá …" buttons are two targets for a screen reader and break every test that finds the X by
    name. That is the screen's second JS-chosen difference between widths; it is safe because this
    table's rows only exist after the store is read in an effect, so there is no static HTML to mismatch,
    and the width effect runs in the same commit as the load. The Kết quả cell is `nowrap` here: with the
    fourth column back, "67.520.669,9 ₫" broke its unit onto a line of its own at 390px. Cost, measured:
    at 360px the name column is ~91px, so most names take two lines. The Mã table was deliberately NOT
    changed with it — its detail row carries three figures that have no room on the row, and it is the
    owner's drawing.
  - **The chevron lives INSIDE the last visible cell** (Ngày mua), not in a
    ninth column: a column that exists at one width is an empty header at the other, and the tests that
    count cells per row stay valid. Its 44px tap overlay is anchored to the button's RIGHT edge — a centred
    overlay poked 10px past the table and gave `.tableWrap` a 2px sideways scrollbar at every width. The
    button is 20px wide because 24px made the table 4px wider than a 360px screen. Very long numbers (a
    million-share holding at 360px) still scroll inside `.tableWrap`; the page never does.
  - **Touching the code toggles the row too**: `.codeOpen` is `pointer-events: none` below 1024px, but
    stays in the Tab order with its name ("Sửa FPT") for keyboards. The red X of the Mã table is
    `display: none` there; Xoá lives in the detail row. (`.savedOpen` left that rule with the Công thức
    table's detail row: a tap on the name now does what the row does.)
    `.tableWrap` **must** still be `position: relative`: the `visually-hidden` labels in the table are
    `position: absolute`, and a scroller only clips an absolute descendant when it is that descendant's
    containing block — without it they sat at their static position (one at x=520) and widened the whole page to
    569px on a 345px screen. `check:chrome` measures all of the above at 360 and 560 with a real mouse.
- **The block titles here are the one exception to `section-title.test.ts`.** "Mã" and "Công thức" are 26px
  sentence case (`.mainTitle`), level with the "Danh mục" label, because on this screen they act
  as page titles and the design makes them a pair. `PortfolioScreen.module.css` left that test's list with a
  tombstone saying why. The header still owns the `<h1>` ("Danh mục"), so the left-column label is
  a plain `<p>`, not a heading.
- **The tab card and the table start at the same height, and that is why the search box and the add button
  are 36px here** (12/10/2026). Both columns are "a title row + a `--space-3` gap + a card", so they were off by
  exactly the difference between the two title rows: text only on the left (~31px), a 44px search box and
  button on the right. The owner circled the 12px step and named the cure — shrink the two controls. Both
  title rows now carry `min-height: 36px`, the button drops to 36px with a 44px `::after` tap area, and
  `SearchBox` gained a `compact` prop for the same. **All of it sits inside `@media (min-width: 1024px)`**:
  below that the columns stack (nothing to align), touch needs 44px, and iOS zooms the page on an input under
  16px. `.search` takes a `width`, not a `flex-basis`: `.headTools` shrink-wraps, a non-growing item's
  contribution is capped at its max-content (~180px for a bare `<input>`), so a 13.5rem basis made the tray
  narrower than its two items and `flex-wrap` dropped the button to a second line — an 80px title row.

Two rules about the form and the picker, unchanged by the redesign:

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
  detail screen's ticker picker keeps the bottom sheet **below 1024px only**: from 1024px every
  sheet floats mid-screen (13/10/2026, see the next bullet), so the prop now matters on phones
  alone. The formula field is labelled **"Thêm công thức"**, not "Tính công thức" — it only
  attaches a formula, and the calculating happens after save, when the screen navigates. That
  label now shares a prefix with the submit button ("Thêm và mở công thức"), so any test matching
  it must anchor on "và mở".
- **From 1024px every bottom sheet is a centred popup; below it nothing changed** (13/10/2026).
  The owner: _"chuyển đổi toàn bộ dialog bottom ở màn web thành popup ở giữa màn hình rồi tự căn
  chỉnh cho phù hợp hơn. còn ở màn mobile thì giữ nguyên dialog bottom"_. Four sheets were still
  docked on desktop (`PresetSheet`, `ExportSheet`, `SaveCalcSheet`, and the detail screen's
  `TickerPickerSheet`); the change lives entirely in one `@media screen and (min-width: 1024px)`
  block at the **end** of `BottomSheet.module.css`, so no call site passes anything to move. 1024 is the
  breakpoint table's "nav goes to the top bar" mark. It is CSS and not `matchMedia` because
  `/du-lieu/` has its `<dialog>` in the static HTML: reading the viewport during render mismatches
  on hydrate, and reading it in an effect makes the sheet jump from the bottom to the middle. Five
  things are easy to break, and one was left alone:
  - **`screen and` is load-bearing.** `ExportSheet`'s `.print-region` sits inside this `<dialog>`
    and is positioned against it, and under print media the query's width is the PAPER's: A4
    landscape is 1123px. Measured with `Page.printToPDF`: without `screen` the landscape PDF changes
    outright (73 kB to 172 kB, print region 720px to 560px and relocated) while portrait does not.
    With it every paper size prints byte for byte as before. The test pins the word.
  - **The block is a COPY of `.sheetCenter` / `.panelCenter`** and its four descendant rules. "From
    1024px" lives in `@media` and `placement="center"` lives in a class name, and CSS cannot write
    one rule for both; merging them means inverting the file (centre as the base, docked inside
    `max-width: 1023px`), i.e. rewriting exactly the rules the request said to leave alone.
    `BottomSheet.test.ts` compares the two copies declaration by declaration and requires the block
    to be the last thing in the file, since `.header` / `.body` / `.footer` / `.title` share its
    specificity and only order decides.
  - **`width="narrow"` (560px) is for sheets with a few controls** — Export and Save. Sheets that
    hold a LIST keep 720px: the ticker picker so it matches itself on the portfolio screen, and
    the preset sheet because "Tìm mã khác" swaps the two back and forth. The prop does nothing
    below 1024px.
  - **`.sheetCenter` is `overflow: visible` and `.panelCenter` is `overflow: hidden`, and both are
    fixes for defects that had been on the portfolio dialog since 22/09/2026.** The `<dialog>`'s
    `hidden` clipped the panel's own `--shadow-modal` into a dark square behind each rounded corner;
    and a sheet with no footer ends in the scrolling body, whose scrollbar is a rectangle painted
    over the bottom-right corner — the radius read 16px while the corner on screen was square. The
    radius assertion could not see either, because it reads the declared number. Do not "improve"
    the new assertion with `elementFromPoint` at the corner: Chrome's hit test ignores an ancestor's
    rounded clip, so it returns the body while a 4× screenshot shows the corner round.
  - **The preset sheet is 586px against a 600px cap.** One wrapped line and its body grows a
    scrollbar to scroll ten pixels; `check:chrome` measures that it does not.
  - **`PasteImportSheet` is untouched** and still falls back to docked at 768px, not 1024px, so in
    the 768–1023 band it floats while the other four dock. Nobody designed that band.
- **A ticker already in the portfolio cannot be added again** (10/10/2026). `TickerPickerSheet`
  locks the "Chọn" button of every code in `heldCodes` and the "đã có" label beside it is the
  button's `aria-describedby`; the second lock reason (no fundamentals, 06/10) stacks, so the
  attribute is a **list** of ids. This reverses the earlier fix for the same complaint, and the
  reversal is the point: re-adding a held code made `addHolding()` **merge** quantities and
  recompute the average cost — correct behaviour ("buying more"), but it used to happen silently,
  so the screen explained it in words instead (a note under the ticker field, plus "Cộng thêm"
  labels on the sheet row and the submit button). The owner: _"mã nào đã thêm rồi thì không cho
  thêm nữa chứ không phải hiển button 'Cộng thêm' làm gì"_. So the cure moved from prose to a
  closed door, and `portfolio.mergeNote`, `portfolio.formMerge`, `portfolio.formMergeOpen` and
  `ticker.pickHeld` are all gone (tombstones in `vi.ts`), as is `mergingInto` — `submitLabel`'s
  table is 2×2 now. `addHolding()` still merges and is now the only place that does, so bringing a
  held code back into the add form means rebuilding the submit label in the same round. Two knock-on
  facts: changing a held holding's numbers is reachable **only** through the row's Sửa button, and
  the add form's code never has a quote (`quotes` holds held codes only), so `hasPrice` reads a
  missing quote as "don't know" rather than "no price" — otherwise every add would hide 8 formulas
  under a sentence claiming a lookup that never happened.

**Tickers brought in from a Finbox watchlist are "pending" rows of the Mã table, kept in a SECOND store**
(13/10/2026). The owner wants the tickers a user saved in their Finbox account to land in `/danh-muc/`, and
decided three things: the source is the Finbox watchlist; _"với những mã đó thì sẽ vẫn sẽ được phân loại vào danh
mục nhưng sẽ có màu tượng trưng riêng để khi người dùng bấm vào sẽ hiển thị bảng nhập thêm thông số đang thiếu"_;
and the source _"sẽ có một đường link hoặc API"_, shape undecided. Measured the same day: a watchlist holds
**codes only** (`options.values[]` where `header == 'ticker'`), it lives on `api2.finbox.vn`
(`POST /watchlists/list`), not on `dcs.finbox.vn`, it needs a JWT (401 without one), and CORS is `*`.

- **A second store, not nullable fields on `Holding`.** `ffb.portfolio.pending.v1` is an array of codes
  (`portfolio-pending-store.ts`). `summarisePortfolio()` already has a branch that turns "Vốn đã bỏ ra" and the
  gain of the WHOLE portfolio into `_ _` while one row lacks a quantity or cost, so importing ten codes into the
  same list would wipe two real numbers; letting the sums skip such rows is the "count it as 0" FR-06 forbids. A
  pending code never reaches a sum. `summarisePortfolio()` gained an optional `pendingCount`, used ONLY to word
  the empty-portfolio reason ("Chưa mã nào có số lượng và giá vốn."), because a card saying "Danh mục chưa có mã
  nào" beside a table with rows is false.
- **One door: `importCodes(pending, heldCodes, incoming)`.** It drops, silently, anything that is not a code
  (`/^[A-Z0-9]{1,12}$/` — dropped, never truncated into a different code), codes already held and codes already
  pending, so re-opening the same link never doubles a row. `MAX_HOLDINGS` caps the TABLE, both stores together.
  Codes that did not fit come back by name and print under the table (`portfolio.importFull`) as a plain `<p>`:
  the screen keeps exactly one `status`/`alert`, the price strip.
- **The first adapter is a link, `/danh-muc/?nhap=FPT,HPG`** (`IMPORT_PARAM`; the name is provisional until
  Finbox fixes its link). It is read from `window.location.search` in the load effect, and **stripped in a
  separate effect declared after the pending-store write**. Stripping inside the load effect loses the import
  under React Strict Mode, which runs that effect twice before anything is persisted.
- **On screen** a pending row comes after the holdings, carries `.holdRowPending` (the SAME
  `--color-warning-soft` as `.savedRowWarn`: one colour, one meaning, "this row still needs one thing"), prints
  the real market price and `_ _` in the other six cells (the buy date included). The whole row opens the
  dialog; the code itself, a button named "Nhập số liệu FPT", is the keyboard path (it was a pencil-with-a-plus
  icon at the row's end until 13/10/2026), and both buttons stop propagation. The
  dialog has a third mode, `completing`: code locked, numbers empty, submit goes through `addHolding()` and then
  removes the code from the pending store, labelled "Lưu số liệu". The tab count is rows, held plus pending.
  `codesKey`, `priceAsOf` and the price strip all include pending codes — a pending row shows a price, and a
  stale price must still name its session. The picker locks pending codes like held ones, so `quotes` now holds
  every code that has a row, and tests find a pending row by `{ name: 'Nhập số liệu HPG' }`.
- **Not built: login plus the API adapter — the owner's stated next step, deliberately deferred** (13/10/2026):
  _"sau này sau khi dự án ổn định thì sẽ bắt đầu bước tiếp theo là sử dụng api từ finbox về, tức là sẽ có chức
  năng đăng nhập rồi mới call api từ finbox về đây"_. So the real source is an authenticated call, and the link
  above is the door that works without an account. Do not start it unprompted. The adapter will be its own port
  (`WatchlistFeed`), separate from `MarketFeed` so that port's "only codes leave the device" stays checkable,
  and it only has to call `importCodes()`; the receiving side needs no change. Seven things must be settled
  first and are listed in `TASK.md`: `api2.finbox.vn` in `connect-src` (a second origin, the owner's sign-off
  like `dcs.finbox.vn`, and it retires "no account, no backend"); which login methods (email and password work
  through `/auth/login`, Google and Apple accounts have no password); where the token lives while the CSP still
  allows `'unsafe-inline'` scripts; whether a login from here consumes one of the account's device slots
  (`/devices/*`, NOT measured); which watchlist of several; one-way flow only, quantities and cost prices never
  go up; and whether `?nhap=` stays once the API exists.

**The two tabs are a VERTICAL card, "Mã · Công thức"** (tabs back 10/10/2026, vertical 12/10/2026). The
labels were "Mã nắm giữ" and "Phép tính đã lưu" for a few hours on 12/10, as the design drew them; the owner cut
both back the same afternoon, for the tab and the `<h2>` alike. Three knock-ons: each label now also equals a
column header of its own table and "Công thức" equals a nav item, so nothing may look them up by text;
`save.done` and `save.nameHint` name this place and moved with it ("Danh mục › Công thức"); and the EN labels are
"Tickers" / "Formulas", which `chrome-check.mjs` matches inside `[role="tab"]` only.
The owner asked on 10/10 for the screen to be split into two dedicated parts and chose tabs when told it
reverses their own 14/09/2026 call (_"bỏ tabbar đi"_). History worth keeping straight: the tab cluster was
removed 14/09; the saved-calculations list came back 15/09 as a second block under Nắm giữ because "save, then
see nothing" was reported as a bug; it is now the second tab. `TabBar` gained `orientation="vertical"` for it
(`aria-orientation`, ↑/↓ instead of ←/→, a white bordered card with the count pushed right); since 14/10/2026 the
screen passes `"responsive"` instead (vertical from 1024px, horizontal below — see the phone-design bullet above),
so `"vertical"` has no caller left. The tab labels are the block titles themselves (`portfolio.holdings`, `portfolio.savedTitle`; the
one-word `tabHoldings`/`tabSaved` keys are gone), so in tests the `<h2>` is found by **role** (`tieuDeNamGiu()`),
never by text, which now matches the tab too. The Công thức tab is **always built** when open, empty
state included (the person chose the tab). The two lessons of 14–15/09 stay load-bearing: both tabs show their
count on the bar even while closed (from 1024px only since 14/10/2026 — the owner removed the count below it, see
the phone bullet), and the anchor `#phep-tinh-da-luu` (`savedCalcsPath()`, the Save button's
destination) opens the saved tab.

**The saved tab is a table with a RESULT column** (12/10/2026), reversing the 10/2026 rule that the list shows
no figure ("số liệu thì khi mở lại thì mới thấy được"). The condition that makes it honest is in `SavedRowView`:
a row whose series no longer matches **prints `_ _` instead of the saved number**. "Matches" is the exact rule
`FormulaDetail` uses for `seriesMismatch` and reads the same store (`ffb.series.v1`): `needsSeries &&
rowsInStore !== (seriesCount ?? 0)` — by session COUNT, not by "is there a series", so one session off still
flags. Such a row gets a warm background, the line "Cần nạp lại chuỗi giá" under its name (the design put this
in a "Số liệu dùng" column the owner then dropped, so the chip moved), and "Nạp" instead of "Mở"; both go to the
same `?luu=` URL. **Its rows follow the Mã table's row design since 13/10/2026** (_"đồng bộ cả bên Công thức
nữa chứ không phải mỗi bên mã"_), which retires the two end-of-row icon buttons of 12/10 (the box-with-arrow
Mở / circular-arrow Nạp link and the trash) and the chip. The table has **four columns** and ends on the save
date; the hidden "Thao tác" column and `portfolio.colActions` are gone (tombstone in `vi.ts`). Clicking
anywhere on a row calls `router.push()` to the `?luu=` URL. **The name in the first cell is a real `<Link>`**
to the same URL, styled as plain text (`.savedOpen`, no underline, no accent colour): a `<tr>` cannot take
focus and cannot be opened in a new tab, so the link is the keyboard, screen-reader and middle-click path. It
carries the names the old icon had — `aria-label` "Mở HPG · P/E" or "Nạp FPT · Beta…", `title` "Mở" / "Nạp" —
so tests still find a row by `{ name: 'Mở HPG · P/E' }`. The red X (`{ name: 'Xoá HPG · P/E' }`, the same
`.rowRemove` as the Mã table) sits right after the name and shows on row hover. Both the link and the X stop
propagation: without it a click on the name navigates twice and a click on the X deletes the calculation
**and** opens it. The code is a plain `<span class="savedCode">` in the Mã table's font. A row that needs its
series reloaded keeps its warm background under the pointer, like a pending row. Two `check:chrome`
assertions (1440 and 1024) hold all of this with a real pointer, including the row click landing on
`/cong-thuc/pe/?luu=pe-a`. The date column of both tables is the same fixed width (104px, 90px below 1280px),
because the two tables swap in place when the tab changes.
The name cell shows only the formula name when the stored name is an auto-generated
suggestion (detected by rebuilding `suggestCalcNames()`, as `displayCalcName()` does — code and date have their
own columns), and a hand-typed name with the formula name beneath it otherwise. **Only a search box sits above
the table; the order is newest-first until a column header is clicked** (header sorting since 14/10/2026, see
the Mã-table sorting bullets above). The design also drew a row of ticker chips ("Tất cả 7 · BHN 1
· AAA 1") and a sort select; both shipped for a few hours and the owner had the whole row deleted the same day
(_"xóa cái này đi"_) — the search box already matches by ticker and the store holds at most 30 entries. A case
in `PortfolioScreen.test.tsx` pins their absence, and the four keys carry a tombstone in `vi.ts`; ask before
rebuilding them. The summary counts the WHOLE store, not the rows the search leaves. Dropped on request:
the "Tính lại theo giá mới" button (recomputing needs the whole Registry in this route's bundle — measured
131 kB → 217 kB against a 180 kB gate, the reason the tab has never recomputed anything), the "Số liệu dùng"
column, and the footer sentences "N trong 50 mã · còn M chỗ" and "N phép tính trên M mã · lưu trên máy này".
Things that are easy to break: the tab is read from `?tab=cong-thuc` or that hash **inside an effect** (never
`useSearchParams()`, same static-export reason as `?ma=`), the first render is always the holdings tab so it
equals the static HTML, `switchTab` uses `replaceState` and passes the existing `history.state` through (a bare
`null` strips Next's `__NA`), and only ONE tabpanel is in the DOM so every tab's `aria-controls` points at the
single `portfolio-panel` id. Prices, the ticker list and the saved store live in the screen's state, not in a
panel, so switching tabs never refetches. In tests, never match a tab by `/^Mã\b/` — JS does not count "ã" as a
word character, so `\b` never fires there (use `tenTab()`).

**"Tỷ trọng" means three different things in this product**, so the portfolio column has to say
which one: a holding's share of total portfolio value (here), the equity and debt weights of
`wacc`, and the smoothing factor `k` of `ema-n-phien`. They never share a screen, so nothing needs
renaming — what was missing is the denominator, since a bare `6%` could plausibly be measured
against market value or against cost. A line under the table says it (`portfolio.weightNote`), the
same way `ConstantsNote` explains a block from its foot, because a column 10% of the width cannot
carry a clause. A second sentence appears only when some holding has no price:
`total` sums `row.value ?? 0`, so an unpriced holding drops out of the denominator and the
remaining weights add up to 100% while the portfolio does not.

## Dates — one written form on screen, day/month/year

**Every date the product shows or accepts is written `DD/MM/YYYY`, and no date control may be drawn by the
browser** (13/10/2026). The owner photographed `/danh-muc/`: the "Ngày mua" column read `03/10/2026`, and the
edit dialog opened from that row read `10/03/2026` — _"kiểm tra lại toàn bộ logic và sửa lại sao cho đồng bộ
những kiểu lỗi này"_. One date, two orders. The column is printed by `formatIsoDate()`; the dialog's field was
an `<input type="date">`, which the **browser** draws in the browser's own UI language (English Chrome:
month/day/year). No attribute changes that order — not `lang`, not CSS — so the only way to make the two
places agree is to stop using the browser's control. `formatIsoDate()` is locale-agnostic, so the English UI
shows day/month/year too.

The sweep found the same class of defect in four more places, all fixed in the same round:

- **`DateField` / `DateCell` (`src/ui/inputs/DateInput.tsx`) replace both native date inputs** — the portfolio
  dialog's "Ngày mua" and the XIRR cash-flow table. A text field, numeric keyboard, placeholder `dd/mm/yyyy`.
  Its `value` is ISO `YYYY-MM-DD` when it holds a real date and **the raw text being typed** otherwise
  (`src/core/date-text.ts`), so the caller must never treat a non-ISO value as "empty": the portfolio form
  re-parses with `parseDateText()` at submit (Enter submits before blur) and reports `portfolio.errBuyDateFormat`,
  and `checkCashflowRow()` reports `INVALID_DATE`. Stored and computed form stays ISO — `xirr()` and
  `summarisePortfolio()` depend on it. Three typing rules, the same as the WF-05 date cell: letters are
  filtered at `onChange` (`keepSeriesDateChars` + `guardFilteredDelete`); **nothing is inserted or rewritten
  while typing** — the value becomes ISO only when the text is already exactly `DD/MM/YYYY`, otherwise React
  rewrites the field and the caret jumps; everything else (`3/10/2026`, `03-10-2026`, `2026-10-03`, the eight
  digits `03102026` a phone keypad produces) is normalised on blur.
- **`parseDateText()` rejects dates that are not on the calendar** (`31/02`, 29 February in a common year).
  The native control could not produce them; a text field can, and V8 reads `2026-02-31` as 3 March instead
  of failing, so XIRR would silently compute on a different day (FR-06).
- **The calendar button keeps the picker.** It calls `showPicker()` on an `<input type="date">` that is
  invisible (`opacity: 0`, not `display: none` — the picker needs a box to anchor to), out of the Tab order
  and `aria-hidden`. That hidden input is the **only** `type="date"` allowed in `src/ui` + `src/app`; a
  second gate in `numeric-gate.test.ts` scans for it, because jsdom draws no date control and no behavioural
  test can see the defect.
- **The WF-05 data table writes every full date as `DD/MM/YYYY`** (`displaySeriesDate()` in `price-series.ts`).
  Presets and Finbox carry ISO, users type the Vietnamese order, so one column could print two forms and the
  same session read `2026-09-08` there but `08/09/2026` on the detail chart's axis. `DataTableScreen`
  normalises at its four entry points (storage load, preset, paste, blur — never while typing). It does not
  guess: a year-less `15/07` and a session number stay as typed. **The duplicate-date check now compares
  parsed dates, not strings** — before, `08/09/2026` typed next to a preset's `2026-09-08` was a repeated
  session the check column said nothing about. `formatSessionDate()` / `formatSessionMonth()` in
  `chart/history.ts` parse instead of splitting on `-`, so a hand-typed series gets the same axis labels as a
  preset.
- **Two places printed the raw ISO string from data**: the quiz source line ("Hiệu lực từ 2026-07-01", on the
  same page where `ConstantsNote` prints `01/07/2026`) and XIRR's duplicate-date message.

`check:chrome` holds the reported bug itself: it opens the edit dialog with a real mouse click and requires the
field's text to equal the row's date cell, on a date (`02/01`) where swapping day and month still gives a
real date — a swap on the 25th exposes itself as month 25, a swap on the 2nd does not.

Not changed, on purpose: `toCsv()` still writes whatever the date cell holds, so a table loaded from a preset
now exports `DD/MM/YYYY` where it used to export ISO (the file matches the screen); and the paste sheet's
preview cells still show pasted text as pasted — only its "từ … đến …" line and the grid pre-filled from a
series in use are normalised.

## The paste sheet ("Dán dữ liệu") — six fixed columns, no "Không dùng"

**The grid of `PasteImportSheet` always holds the six columns of a price series, and its column picker offers
exactly those six** (13/10/2026). The owner circled a select reading "Cột 6 · Không dùng": _"tạo ô không dùng là
cái gì … tạo đủ dữ liệu của 6 cột là thôi không cần tạo gì nữa và cũng không thể tạo được thêm nữa. nếu khách nạp
thừa thêm 1 cột dữ liệu chưa rõ tên thì cứ tạo thêm 1 cột thừa ra đó"_, and in the same message: _"sau khi nạp dữ
liệu mẫu vào có một số cột sau khi nạp không thấy số liệu trên table"_. "Không dùng" had been two things at
once: a seventh option of the role select, and the label of any column the reader could not guess. Picking it
for a column meant that column's numbers were silently not imported. Both are gone (`paste.col.ignore` and, with
it, `paste.needClose`; tombstone in `vi.ts`), and `COLUMN_LABELS` in the Domain has six entries. Do not bring
back a "drop this column" choice under another word.

- **`'ignore'` still exists in `ColumnKind`, but it now means "an extra column" and has no label.**
  `fitToSeriesColumns()` (`src/core/paste-import.ts`) puts a pasted table into the grid's shape: the six
  `SERIES_COLUMNS` first, in the grid's own order whatever the file's order was, each one present even when the
  data has nothing for it; then every column that matched no role, at the end, under **its own name** from the
  pasted header row (`PasteTable.header` → `FittedTable.names`), or "Cột 7" when there is no header. An extra
  column with no data at all is not built. Extra columns are shown and never imported: a session has six fields.
- **Picking a role SWAPS two columns** (`setColumnKind`), so all six roles are always in the grid and no
  operation can leave a data column out of the import. An extra column keeps a select, showing its own name as
  a disabled entry; giving it a role turns the column that held that role into the extra one, and if that one is
  blank and nameless it is removed. That select is the only way to rescue a column whose header the reader does
  not know ("KLGD").
- **A date column that is blank on EVERY row is read as "no date column"** (`parseCells()`), because the grid
  now always has a date column and a closes-only series (what FR-12 needs for Beta, Sharpe, VaR) must still
  import, with the "session order unknown" note. One dated row brings the old rule back: a row missing its date
  is flagged at that cell.
- **A file and a paste that carries a header row REPLACE the grid.** Both used to be overlaid at the caret, and
  since the sheet opens pre-filled with the series in use, a two-column "Ngày · Đóng" file dropped its closes
  into "Giá mở cửa", left the old closes and the old rows below in place, and still offered "Nạp 57 dòng"
  (FR-06). A headerless block is still pasted at the caret like a spreadsheet; when it is shorter than the series
  already there, the old rows below it survive and are imported. **That is a known hazard, not decided yet.**
- **Column widths are computed, not fixed.** The old `3rem + 11rem + 5 × 9.5rem` = 984px never fit the widest
  popup's 966px scroller, so every screen had a horizontal scrollbar and at a 1025px window the Volume column
  was mostly hidden, with the scrollbar itself below the popup's edge. Number columns now share the frame
  (`table-layout: fixed`, no width), with a floor from `--paste-cols` (set inline; 8.25rem a column, measured on
  a nine-digit volume). Six columns fit from a ~985px window; an extra column widens the floor instead of
  squeezing the six.

**Four causes of "empty columns after loading" were found, all reproduced**: the role set to "Không dùng"; the
clipped Volume column; the overlaid file; and the **VN-Index example dataset, which carried closes only**, so
loading the example on the nine formulas that use it (`beta`, the six ratios in `risk-ratios.ts`, `var-lich-su`,
`cvar-lich-su`) filled two of six columns. The VN-Index dataset got open, high, low and volume from VNDirect's
`dchart` API that day, taken only after its 71 closes matched the owner's table exactly; since 14/10/2026 every
example dataset is a full 250-session OHLCV table (see "The example datasets" below), and each `*_PHIEN` array is
the close column of its own `*_BARS`, so the two cannot drift. A case in `formulas.test.ts` scans every
`example.dataset` for a blank column. Not fixable here: a ticker loaded from
Finbox (`?ma=`) still shows four blank columns, because `tendays` returns a close and nothing else.

## A formula visit — re-entering a formula resets it to defaults

**Opening a formula always starts from its defaults, unless the user is still inside the same visit**
(13/10/2026). The owner reported it as a serious bug: after adding a ticker to the portfolio and opening
a formula, after saving a formula that carries a ticker, or after merely loading a ticker without saving,
_"vào lại hoặc search lại công thức đó thì lại đang lưu lại mã cũ trong công thức đó … phải reset lại
công thức về mặc định"_. The cause was in `FormulaDetail`, not in the portfolio: the screen keeps state
in three stores (`ffb.activeTicker.v1` and `ffb.workingSeries.v1` in `sessionStorage`, `ffb.draft.v1` in
`localStorage`) and restored all three on **every** mount, because none of them could tell "came back
from the data table" from "came in again from the list".

A **visit** to formula X lasts while the user stands on X's detail screen, on `/du-lieu/`, or on X's own
guide page. Inside a visit (a reload, "Mở bảng dữ liệu →" and back, the guide and back) everything is
kept exactly as before; that round trip is an older owner-reported bug and must not regress. Any other
screen ends the visit — the list, search, the portfolio, settings, a **different** formula — and the next
open starts clean. `?ma=`, `?luu=` and `?so=` still load what the URL asks for, onto a clean screen.

The owner was asked one question and chose "reset everything", typed numbers included. That **reverses
two earlier decisions**, so do not rebuild either without asking: the ticker no longer follows the user
to other formulas (the "mã dính theo lượt duyệt" feature of `active-ticker.ts`), and an input draft no
longer survives closing the tab (the owner's own earlier choice of `localStorage` in
`input-draft-store.ts`). Both stores stay, serving the visit only.

How it works, and what is easy to break:

- **`ffb.visit.v1` in `sessionStorage` holds the id of the formula being visited**
  (`src/application/formula-visit.ts`, pure). `FormulaDetail` compares it **on mount**: a different id,
  or no readable marker, means a new visit, and `clearVisitStores()` wipes the three stores before any
  restore effect reads them. It is checked at the door rather than cleaned up on unmount, because a
  closed tab, a reload and a hard navigation run no cleanup, and the draft in `localStorage` would come
  back in the next tab.
- **The gate effect must be declared ABOVE the three restore effects.** React runs a component's effects
  in declaration order and all three read their store synchronously on mount; a gate below them clears
  the stores after the old numbers are already on screen. The restore effects themselves were not
  changed by a single line.
- **`FormulaVisitTracker` (a client leaf in `AppShell`, beside `OriginTracker`) removes the marker when
  the pathname leaves the visit.** Without it, `pe` → list → `pe` still finds the `pe` marker. The order
  of its effect against the screen's does not matter, on purpose: the screen decides by comparing its own
  id, the leaf only handles screens that are not a detail screen. `visitContinuesAt()` compares the
  **whole** path, never a prefix — `/cong-thuc/` and `/cong-thuc/peg/` are not the `pe` visit.
- **An unreadable marker counts as a new visit**, not as "restore to be safe": the safe side of this bug
  is the default numbers. `clearVisitStores()` uses two separate `try` blocks so a blocked
  `sessionStorage` still deletes the draft.
- **In tests, `cleanup()` + `render()` is a reload, not a re-entry.** jsdom runs no router and the test
  wrapper has no `AppShell`, so the marker survives between the two renders. `sangManKhac()` in
  `FormulaDetail.test.tsx` removes it, standing in for the tracker; the "giữ số đã gõ khi rời màn rồi
  quay lại" block and the "vào lại công thức thì về mặc định" block differ by that one line.
  `seedActiveTicker(id)` seeds the marker together with the ticker, because a ticker seeded without one
  is wiped before the screen reads it and the case passes while proving nothing. Two `check:chrome`
  assertions run the two halves together through a real client-side navigation.

Known consequences, accepted: typing numbers on `wacc`, following a chain link to `capm` and coming
back resets `wacc`; so does the browser's Back button after any other screen. The WF-05 data table
(`ffb.series.v1`) is untouched — it is data the user manages on `/du-lieu/`.

## Repeat groups — inputs the user adds and removes

**Two formulas let the user add input rows: `gia-von-trung-binh-dca` (purchase rounds) and
`loi-suat-trung-binh-hinh-hoc` (periods)** (13/10/2026). The owner pointed at the three hard-coded
rounds of the DCA formula: _"người dùng muốn test mà muốn nhập thêm 4 5 6 ,.... đợt nữa thì sao ? …
cần thêm một button nữa dùng để tạo thêm ô nhập … tương tự với các công thức tương tự"_, then: _"vì
giao diện có thay đổi nên bạn cần thêm chức năng để giao diện thay đổi tương ứng"_. Measured on the
Registry: exactly those two had numbered slots (`calc` looping over `[1, 2, 3]`, and a "2 kỳ / 3 kỳ"
button group). `xirr` already had its own cash-flow table and is not part of this; `ddm-hai-giai-doan`
sums over years but takes the year count as ONE input, so it has nothing to repeat. A pinned list in
`registry/repeat.test.ts` holds the two ids.

The declaration is `FormulaSpec.repeat` (`RepeatGroup` in `registry/types.ts`); the machinery is
`src/core/registry/repeat.ts`. Both ends: 1 to 12 rounds, 2 to 12 periods.

- **The group count is a declared VARIABLE, not screen state** (`repeat.countKey`: `lots`, `periods`).
  It therefore travels inside `inputs` through every store that already exists (draft, saved
  calculation, `?so=` link) with none of them knowing about repeat groups, and `calc` reads it with
  `v()`. The screen builds **no field** for it: the two buttons at the end of the Số liệu block
  ("+ Thêm đợt mua", "Bỏ đợt 4") are its control. It still has a row in the Bảng biến and in exports.
  `sweepCandidates()` excludes it from the chart axes: sweeping it would demand fields of groups that
  do not exist. `periods` kept its key and meaning on purpose, so links and saved calculations
  written by the old button group (`periods` 2 or 3) still open on the same number.
- **`spec.variables` still declares the DEFAULT groups (three), and groups beyond them come from the
  template** (`repeat.fields`, `key` is a prefix, labels carry `{n}`). That is what kept every
  registry-wide gate valid for the screen as it opens: the 248 chart axes, the guide texts, the
  example, the quiz `verify` inputs. `resolveRepeatSpec(spec, inputs)` returns the spec whose
  `variables` are exactly the fields in use. It returns the base spec itself when the count equals
  the declared count, and the SAME object for the same count (a `WeakMap`), because the result goes
  into `useMemo` deps and through `memo(FormulaChart)`.
- **`runFormula()` resolves the group itself**, at the one door every caller goes through, so a count
  of 4 with no `amount4` is `INCOMPLETE_INPUT` naming the field, never a silent 0 (FR-06). `calc`
  must clamp the count with the same `clampRepeatCount()`, or it loops over a group nobody checked.
- **In `FormulaDetail`, `activeSpec` vs `spec` is a rule, written at the declaration**: `activeSpec`
  for anything about fields ON SCREEN (the grid, Bảng biến, share link, export, the chart's locked
  keys; `formula` — the resolved module — goes to the chart so the axis picker lists the new round);
  `spec` for everything static and for "the defaults". `defaultInputs(spec)` must stay three rounds,
  because re-entering a formula resets it (the visit rule above).
- **A new group opens at 0, because the number field has no empty state.** The plan offered "leave
  the new fields blank" and that was wrong: `NumberInput` never pushes a blank value up, the draft
  store drops non-finite numbers, and `VariableSpec.defaultValue` exists so that no field starts
  empty. For DCA 0/0 is the existing "this round did not happen" convention, so the result holds
  still until the user types, and money without a price gives `DIVIDE_BY_ZERO` naming that round's
  price field. For the geometric mean 0% is a REAL period, so the result changes on the click; the 0
  is visible in the field that just appeared.
- **Removing deletes the group's keys; adding overwrites them.** Remove then add gives a round at 0,
  not the old numbers back.
- **A group of two or more fields takes one ROW per group** (`.fieldsRepeat`, column count from the
  inline `--o-moi-nhom`). The normal grid is three columns at 1024px, so a round's amount and price
  landed on different rows; unreadable by the fifth round. That rule must stay at the END of
  `FormulaDetail.module.css`: it has to beat `.fields.tileGrid`, same specificity, so only file
  order decides (the `.panelCenter` trap again). A one-field group (periods) does not take the
  class. Three `check:chrome` assertions (360, 1024, 1440) measure row alignment, the button under
  the last round, no sideways overflow, and an unchanged result.
- **The draft store's key cap went from 24 to 40.** Twelve rounds are 24 fields plus the counter, 25
  keys; at 24 the last price was dropped on write and a reload inside the visit reported a field
  the user had typed as missing.
- **`?so=` is decoded in two passes** in `FormulaDetail`: the field list depends on the counter that
  is inside the link itself.
- **The "?" chart popover has a TEMPLATE text per template field** (`BieuDoRieng.trucLap`, keyed by
  prefix: `amount`, `price`, `r`; six paragraphs, outside the 600). Without it, picking "Giá mua
  đợt 4" fell back to the first block, i.e. text about another chart. `khoiDangXem()` fills `{n}`.
  The gate (`loiTrucLap` in `kiem.ts`) cannot measure a group that does not exist at build time, so
  it requires what holds for every added group: the field named with `{n}`, both axis cases (half
  to one-and-a-half times once the field holds a number, and the 0 state a new group opens in), and
  a direction. A paragraph that promises one direction is tried on a fourth group with real numbers.
  The full guide page does not list these blocks; it describes the screen as it opens.

Three texts here were written with the code and are NOT from the owner's `guide-111.json`: the
"lấy số ở đâu" sentence of `lots`, and the reworded `periods` / `r3` sentences (the old ones described
the removed button group). Each carries a comment at the site; they need the owner's read like any
unreviewed content. Cost, measured against the same tree without this package: detail pages 433,1 →
435,5 kB First Load JS, `/danh-muc/` 189,1 → 189,2 kB. The size gate was already red before it.

## Chart kinds

`ChartModel` is a three-way union: `line` (sensitivity sweep or time axis), `waterfall`
(breakdown), and `unavailable`. `ChartFrame` and `ChartFullscreen` take `DrawableChart` — the
union minus `unavailable` — so a fourth kind only needs a branch in `ChartBody`.

**The chart's description sentence (`model.summary`) is not shown on screen** (14/10/2026). It sat under the
chart's name, two or three small lines; the owner quoted the one on `ev-ebitda` — _"Quét Giá trị doanh nghiệp
(EV) từ 5.750 tỷ ₫ tới 17.250 tỷ ₫ qua 41 mức. EV/EBITDA chạy trong khoảng 3,97 lần tới 11,9 lần. Ở giá trị
hiện tại 11.500 tỷ ₫, kết quả là 7,93 lần. Mọi mức đều tính được."_ — and had captions of that kind removed
_"để tối ưu không gian"_. Measured on that page: the chart card is 42px shorter at 1440 and 76px at 390. The
sentence is **still in the `<figcaption>`, under the global `visually-hidden` class**, and that half must stay:
the `<svg>` is `aria-hidden`, so for a screen reader this sentence and the data table are the whole chart
(RSI's 30 and 70 marks, an overlay series, "the first 19 sessions have no data yet" are only _said_ there).
`ChartFullscreen` keeps a hidden copy for the same reason, since a modal dialog makes the page behind it inert.
The costs, known: nothing a sighted user reads now says why a time line starts late (the hatching does), and
the "?" popover is the only on-screen text about the chart. A source scan in `charts.test.tsx` requires every
`pick(model.summary)` to sit on a `visually-hidden` element and forbids the two old CSS classes, because the
fullscreen overlay is switched off (`PHONG_TO_BAT`) and no rendering test can reach it. `model.note` (the
`role="note"` line under the plot) is a different thing and was not touched.

A formula gets a waterfall by declaring `spec.breakdown` (ordered stages, each with a `sign` and
an optional `shortLabel`, keyed to an input variable **or** to a key in the result's `extras`).
**All eleven** formulas tagged `waterfall`/`stackedBar` declare stages — nothing is left waiting.
The eleventh is `rut-truoc-han`, which spent one day declaring stages while still `none`; the reason
that stopped working is in its own docblock.

`chartType` decides whether the breakdown is the _default_ view or merely an entry in the picker,
and across all eleven the split is not arbitrary: the five `waterfall` ones (`ev`, `fcff`, `fcfe`,
`ncav-tren-co-phieu`, `rut-truoc-han`) each have a **straight-line** sweep — slopes 1, 1−t, 1,
1000/N and a product of three inputs — which is exactly what `chartType: 'none'` exists to reject,
so for them the breakdown _is_ the chart. The
six `stackedBar` ones keep the sweep as the default because it still says something: total interest
against term is a convex curve, and it is precisely what `lich-tra-no`'s own `commonMistakes` warns
about. Never promote a `stackedBar` formula to breakdown-by-default without checking what its sweep
would lose. Current split of the 103 that have a chart: **63 sweeps + 5 waterfalls that draw at
once, + 35 waiting on a price series** — and those 35 all draw the moment a series is loaded, which
`history.test.ts` pins. Plus the 8 `none` that makes 111.

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

**The expression line is a TRANSLITERATION of the picture, not a paraphrase** (06/10/2026). The
owner circled two boxes on `gia-hoa-von`: the picture's `Q \cdot P_{mua}` and the words "Tiền mua"
under it — _"'Tiền mua' là cái gì? … 'Q.P mua' bên trên ký hiệu ra sao thì bên dưới giải thích y
nguyên. tôi có cần bạn ăn bớt vậy đâu?"_ Two symbols the legend names ("khối lượng cổ phiếu mua rồi
bán", "giá mua một cổ phiếu") had been replaced by one invented noun that appears in no legend row,
no field label and nowhere else on the page — while the same `Q` was spelled out as "Khối lượng" in
the denominator of that same line, so the line named one symbol two different ways. Rule 7 in
`expression-rules.ts` (`thieuPhepToan`) is the gate: every arithmetic operator the picture draws must
survive into the line, **minus** the ones sitting inside a compound `spec.symbols` row. That
subtraction is the whole rule — collapsing a group into one noun is right when the page names the
group and wrong when it does not. `roi-rong` writes "Vốn thực bỏ ra" for `Q·P_mua + F_mua + F_lk` and
`loi-nhuan-rong` writes "Tổng chi phí" for `F_mua + F_ban + T + F_lk`, and both declare that exact
sub-expression as a legend row, so hovering the group in the picture gives the noun back;
`gia-hoa-von` declared no such row. `\,` and `\;` count as multiplication, because an implicit
product in a picture has to become an explicit `×` in words — and that detail is what lets the gate
see this bug at all: the line carried exactly one `×`, enough to cover the `\cdot` in the numerator,
so without counting the denominator's `Q\,(…)` it stayed green. The sweep over all 111 found three,
with no false positive: `gia-hoa-von`, `wacc` (`E/(E+D)` and `D/(E+D)` written as "Tỷ trọng vốn chủ" /
"Tỷ trọng nợ", with legend rows for `E`, `D` and `E+D` but none for either weight) and
`ddm-hai-giai-doan`, whose line named none of its seven legend symbols and is now written out in
full, two fractions and six plus signs included. Rules 4 and 5 are blind to this: a swallowed group
carries no unusual constant, and swallowing symbols leaves the `=` count intact.

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
purpose — `xirr`'s `guess` (a Newton–Raphson seed, not a term of the equation; **the input is gone
since 06/10/2026**, see the next paragraph), `rut-truoc-han`'s
`termMonths` (a validity precondition, not a term) and `contractRate` (which fed only an `extras` field
nothing read — **the screen reads it since 06/10/2026**, see below), and `roi-rong`'s `sellPrice` (already reachable through `L_{rong}`'s own how-to panel, so only its
legend _meaning_ grew a clause). The sweep also surfaced a gate the owner-facing docs above never named:
`how-to.test.ts` requires **every** `spec.symbols` row, not just derived ones, to be classified — either an
`entries[].symbol` or a `skipped` key — so a brand-new raw-input row needs a one-line
`skipped: { n: 'nhap-tho' }` addition even though it will never carry a panel.

**No input may be a control that cannot change anything** (06/10/2026). The owner dragged `xirr`'s
"Suất sinh lợi khởi điểm" slider and asked why nothing around it moved. A sweep of all 269 inputs —
each varied across its range, comparing **the rounded figure the Kết quả block prints**, not the raw
value, because a difference in the twelfth decimal is a motionless number to whoever is dragging —
found exactly two. One was that slider, dead by construction: `xirr()` falls back to `bisectXirr`
over −0.9999…10, a range wider than the slider itself, so the seed changes the iteration count and
never the answer, and the field's own "adjust it only if the formula reports it could not find a
rate" was a promise of a rescue that does not exist. It was deleted, the seed became a constant, and
`xirr` is now the only formula declaring `variables: []` — which needed a named exception in
`validate.ts` (`NHAP_NGOAI_BANG_BIEN`) and a guard in `FormulaDetail` so an empty "SỐ LIỆU" box never
renders; its real input is the cash-flow table in `XirrBody`. The other,
`sut-giam-hien-tai`'s `lookback`, was **alive** and pinned with its evidence: it was inert only on that
example's 57-bar series, whose peak happened to sit inside the 30-bar floor. The gate lives in
`formulas.test.ts` ("không ô nhập nào là một điều khiển chết") and checks both directions, so a pinned name
that comes back to life must be removed from the list — which is exactly what happened on 14/10/2026, when the
example series grew to 250 sessions: the gate reported the slider alive and the pinned list is now empty.

**That first sweep was wrong, and the way it was wrong is the lesson.** It counted a change in ANY
`extras` key as a visible change, so it cleared `rut-truoc-han`'s "Lãi suất hợp đồng / năm" — which
the owner photographed hours later with the same question. `extras` reach the screen by exactly two
routes: a key declared in `spec.breakdown` (which the waterfall's columns and its data table read),
or one of the three `CUSTOM_BODIES` formulas that render their own. `ResultBlock` prints `value` and
the unit, nothing else — `REVIEW-2.md` had already written that down. Everything else `calc` computes
is invisible, so counting it is counting a number nobody can see. **A measurement about the screen
compares what the screen shows.** The fix there was the opposite of `xirr`'s: the contract rate is
not inert, it decides `lostInterest` — what early withdrawal costs you, the whole point of the
formula — so the cure was to publish the number, not delete the control. `rut-truoc-han` declares
two `breakdown` stages (`interestAtContractRate` +, `lostInterest` −, summing to the result) and
**became a `waterfall`** so they draw; it spent one day declaring stages while still `none`, for a
reason that stopped holding the same day (below). The registry-wide sum gate in `chart.test.ts` was
rewritten to read `breakdownBars()` instead of going through `buildChartModel`, because the
invariant belongs to the stages, not to the picture.

**`DerivedNote` — the "Từ các ô trên, công thức tính ra" block — is GONE (06/10/2026), and the way
it went is worth more than the block was.** It existed from 16/09/2026 to name a quantity the
breakdown chart drew but nothing on the page could explain: `fcfe`'s "Lãi vay sau thuế" column at
48 tỷ ₫, with only "Chi phí lãi vay" 60 and "Thuế suất" 20% in the Số liệu block beside it. On
05/10/2026 it gained a substituted formula per row, to answer "and how is it worked out". Then the
owner, having asked three times on `tra-gop-nien-kim` what it was for, set a condition rather than
an order: _"xác định trước nó có quan trọng không? nếu không thì ở 9 công thức bỏ đi"_. The
measurement that answers it, run across all nine formulas that had the block: **eight of the nine
already drew those exact stages as breakdown columns**, with the same label and the same formatted
value, plus a 3–5 row data table under the chart — the block was a second copy. The ninth,
`rut-truoc-han`, was the only one with no chart to copy, and it became a `waterfall` in the same
round rather than keeping a block for one page. Going with it: `derivedStages()`,
`FormulaSpec.derivedSubstitution`, `derivedShape()`, four helpers in `substitution-cay.ts`, the
`detail.derivedInUse` key and four gates. Every removal site carries a tombstone pointing at the one
in `vi.ts`, which holds the full measurement. **If the 16/09 hole reappears** — a column with a name
and a number that traces back to no field — the fix is NOT to rebuild this block: the chart already
says the name and the value, so what is missing is "how", and that is what the hover panel on a
symbol (`src/core/how-to/`) is for.

**Before that, three rounds went into balancing the merged card, and the lesson survives the
deletion** (06/10/2026). In the merged card the Kết quả block is ~100px tall in the left column
while the Số liệu column on the right carried the appendix too, so the left half of a 260–300px
band was empty: _"không gian bên trái đang thừa thãi rất nhiều … có thể căn chỉnh hoặc **giàn số
liệu ngang hàng sang 2 bên**"_, and an hour later, on `gia-hoa-von`, _"tại sao vẫn còn những phần
mà để thừa không gian như này"_. Round 1 moved the block out of the Số liệu `<section>` into its own
full-width row of the card (`.cuoiSoLieu`, `grid-column: 1 / -1`, auto-placed into row 2) and laid
each row out as three columns — name · derivation · value. Rejected: with the value right-aligned to
the card edge the hole only **moved**, to the ~630px between the end of a formula and its own
number. Round 2 split the rows into two columns, which is `ConstantsNote`'s own cure from
02/10/2026 — and that is the durable lesson: **splitting into columns lowers a block but does not
move it**, so `ConstantsNote` had had its empty rectangle merely shortened, and it came back a month
later. The pair is what works: move it to full width **and** keep two columns, which then measure
~615px instead of ~340px. Round 3 moved the number to the tail of its own substituted line behind an
`aria-hidden` "=" — _"để đáp án trơ trọi 1 mình thì không hợp lý"_ — and that shape died with the
block, but the first two rounds are exactly what `ConstantsNote` now does. The sweep that settles
the rest of the card: measured across all merged formulas, **none needs a price series and none has
a config block**, so `.actions`, `.seriesFoot` and `DetailConfig` can never appear there; the right
column holds only its heading and the input tiles, and nothing else can stretch it. `rut-truoc-han`
left `hasMergedCard()` in the same round (65 → 64) because that list excludes every `waterfall`
formula, and the gate recomputes the list from its four criteria rather than trusting it.

**In the merged card the "name + number" group is centred on the input tiles, both ways**
(13/10/2026). The owner circled the tile row of `ev-ebitda`: _"đang bị lệch. cần căn giữa. điều chỉnh
tương tự với toàn bộ công thức khác"_. Measured before the fix: the group hugged the top of the card,
so the name sat level with the "?" button and the number level with the TOP edge of the tiles
(427–477px beside tiles at 434–513px). Three things are easy to break:

- **Vertical is `.merged .result` in `FormulaDetail.module.css`: `align-self: stretch` +
  `justify-content: center` + a `padding-top` of `--space-6` + `--space-2`.** Not
  `align-self: center`: the right column opens with the "?" row (24px + an 8px gap), so the middle of
  the whole column is 16px above the middle of the tiles. The padding reserves exactly that row, and
  `.merged .blockHead` pins it with the same token (`min-height: var(--space-6)`, the size
  `GuideHint.module.css` declares).
- **The two repeat-group formulas have a button row UNDER the tiles**, reserved by
  `.merged:has(.repeatActions) .result` with a literal `36px` copied from `Button.module.css`'s
  `.sm`. There is no token for it; forget it and the number drops 20px.
- **Horizontal is `.block.flat` in `ResultBlock.module.css`, and it was an accident until that day**:
  the group was centred only because `align-items: center` leaked down from the plain card's grid
  rule, while `.figure` said `flex-start`. It is now declared on the variant.

The older `check:chrome` assertion "cùng mép trên" cannot see any of this: it measures the result
section's box, which spans the whole grid row in both states. Two assertions measure the group itself
(`pe`, and `gia-von-trung-binh-dca` with five rounds), and `merged-card-css.test.ts` pins the
declarations. Swept over all 64 merged formulas at 1440 and 1280: 0px off on both axes. When the
left side is taller than the tiles (the WF-15 error card), it grows the row and its top lines up with
the top of the tiles.

A formula whose `calc` reads a market constant must also **declare the key** in
`spec.usesConstants` — 14 of them do, across `derivatives.ts` (5), `fees.ts` (8) and `planning.ts`
(1); 13 use the merged card and only `loi-nhuan-rong` does not, because it has a custom body. The declaration is what `ConstantsNote` reads to print the label, value, unit, effective date
and legal basis at the end of the Số liệu block; before it existed, `phi-giao-dich-mua` showed
138.000 ₫ without the 0,15% rate appearing anywhere on the page. Declare the **key only** — the
value keeps flowing from `schedules.ts`, so a rate change moves the screen with it, whereas a
number copied into prose rots silently and lint cannot see it. `constants-gate.test.ts` holds both
directions: a source scan catches an undeclared call site, and pulling each declared key out of the
schedule must break the formula, which catches a declaration the calc never uses.

**The substitution strip under the result ("dải thay số", `spec.substitution`) reaches market
constants by KEY too** (13/10/2026). The strip is the drawn line at the foot of the merged card,
`(200.000.000 ÷ 100.000.000)^(1 ÷ 5) − 1) × 100 = 14,87` on `cagr`: the tree is parsed at build time
(`substitutionShape`, `page.tsx` only) and the browser just places numbers into its leaves
(`datSoThaySo`). From 01/10 to 13/10/2026 a gate forbade any formula with `usesConstants` from
declaring a template, because a template could only reach input fields, and 12 templates had copied
`× 0,15 ÷ 100` straight in — right for the default schedule, wrong the moment the rate changes. The
owner opened `roi-rong`, saw that it had no strip while `cagr` did, and asked for it. So a
placeholder may now be a constant key written verbatim with its dots, `{fee.brokerage.buy}`
(`laKhoaHangSo()` tells it from an input key, which never has a dot), and `substitutionConstants()`
resolves it through the same `ctx` that `calc` receives. **61 of 111 formulas have a strip**; 13 of
the 14 constant-reading formulas got one, and `loi-nhuan-rong` deliberately did not, because the
strip lives only in the merged card and that formula has a custom body. Three things to keep:

- **A percent constant enters the picture as a RATIO** (0,15% → 0,0015), the same convention as
  every rate the user types (`r = {rate} ÷ 100` in 21 templates). The "Đang tính theo các mức sau"
  block right above the strip still prints `0,15 %`. Changing one of the two conventions means
  changing all 61 strips at once, not these 13.
- **Three gates in `formulas.test.ts` replaced the ban**: a constant key in a template must be in
  `usesConstants`; every `usesConstants` key must be referenced by the template; and with every
  rate of the schedule doubled, the strip must still re-compute to what `calc` returns _and_ differ
  from the default-schedule result. The last one is what makes a hand-copied number go red.
  `MARKET_CONFIG` has a single schedule today, which is why that test builds its own.
- **`roi-rong` and `gia-hoa-von` substitute at symbol level**, so their strips show derived
  figures that sit in no input field (`4.618.150 ÷ (1.000 × 92.000 + 138.000 + 1.350) × 100`:
  the first, third and fourth numbers are `L_rong`, `F_mua`, `F_lk`), and on `roi-rong` the Giá bán
  and Thời gian nắm giữ inputs do not appear in the strip at all. The owner was told this before
  the work and chose the strip over reusing the WF-08 breakdown table. The hover panel on those
  three symbols in the picture is where each number is explained.

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
re-renders it whole, explanation included — except a SKIPPED question, which reopens locked but
ungraded: no verdict badges, no revealed answer, no explanation (29/09/2026; the owner skipped one,
reopened it and found the answer and the explanation on show — _"chỉ khi người dùng chọn đáp án và
click vào button Kiểm tra thì mới có giải thích"_). `QuizQuestion` gets `readOnly` without
`answered` for that case. **Only one opens at a time**: several at once push the
live question off screen, which is the thing the strip exists to prevent. That forced a split:
`QuizQuestion.tsx` renders one question and `cham.ts` holds the scoring rules, because the same
question must render identically in both places and two copies of that JSX would diverge. The
`inputMode="decimal"` call site moved with it, so `numeric-gate.test.ts` now pins
`ui/quiz/QuizQuestion.tsx`.

**The header row carries everything that is not a question** (24/09/2026, rewritten three times in
one day). Idle it reads `BÀI TẬP ……… Bắt đầu kiểm tra »`; mid-quiz it reads
`BÀI TẬP · Câu 2 / 5 · ▬▬ ▭ ▭ ▭ ▭ ……… Thoát`. The progress line used to sit inside the question card,
one row under an `<h2>` that said the same thing, and the start button used to be a solid block on
a row of its own under a lead line — three stacked rows that existed only to get someone to press
one button. The idle row carried a question count too (`BÀI TẬP · 4 câu`) until 29/09/2026, when the
owner photographed it and said _"không cần hiển thị số câu ở ngoài"_: the count now appears only
once the quiz starts, as `Câu 2 / 5`, and a case in `QuizBody.test.tsx` rejects any "N câu" in the
idle block. Four things there are load-bearing:

- **`.head` must NOT use `justify-content: space-between`.** The page frame runs to `--desktop-max`
  (1600px), so space-between throws the progress cluster to the far right edge, the better part of a
  screen away from the label it belongs to, and the two stop reading as one thing. Label and progress
  sit together on the left; only the right-hand button pushes itself out, with `.headAction`
  (`margin-left: auto`). That one class serves BOTH buttons — "Bắt đầu kiểm tra" when idle,
  "Thoát" mid-quiz — because their occupying the same slot is what stops the row jumping when the
  phase changes, together with `.head`'s `min-height`.
- **The block has NO `max-width`.** It was capped at 60rem earlier the same day to close that
  space-between gap; the owner photographed the result and rejected it. Capping only moves the
  empty space OUTSIDE the block's right edge, where it no longer lines up with the Nguồn tham khảo
  block above it or the page's own end-buttons below — both of which run the full frame.
- **`.bars` is `flex: 0 1 14rem`, not `flex: 1`.** Stretched across the full frame it measured
  ~1.100px for five questions and read as a rule dividing the page rather than as progress.
- **`.label` and `.step` are `white-space: nowrap`.** At 390px the bar's `flex-basis`
  holds its ground and the text is what gets squeezed instead: "BÀI TẬP" broke across two lines.
  Nowrap makes the bar — the only thing on the row that can shrink without losing meaning — absorb
  it.

The `»` is a sibling `<span aria-hidden>` rather than part of the string, because it is decoration,
not part of the label — same shape as `GroupCard.tsx`. The button is `variant="ghost"`
on purpose: a solid block of colour beside a small uppercase label outweighs the content it leads
into. Idle, that row is the WHOLE block — 78px measured — because `quiz.lead` ("Không chấm điểm,
chỉ để bạn tự soát lại.") is gone: the owner deleted it that morning, had it restored that
afternoon, then deleted it again on sight, so its tombstone is the second one on that key and it
is final. `.intro` under the header renders only when there is something real to say — a score
from last time. **There is no "few questions" state any more** (29/09/2026): a quiz under three
questions used to say "Làm thử" instead of "Bắt đầu kiểm tra", hide the progress bar and print
"Công thức này mới có ít câu, vì tư liệu thật chỉ có thế…"; the owner had the button unified, the
sentence dropped as filler, and pointed at the progress bar the short quizzes were missing. Every
quiz now renders the same shape; `minForProgress`, `quiz.startFew` and `quiz.few.body` are gone
(tombstones in `vi.ts`). `quiz.countUnit` is gone (tombstone in `vi.ts`),
and `quiz.step` ("Câu {n} / {total}") is new, saying "Câu" out loud because the count no
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
parses what follows the `=` (Vietnamese number notation, `+ − × ÷ ^ ( ) √ ln | | ⌊ ⌋ ⌈ ⌉`) and requires the
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
  "S"). `FormulaDetail.test.tsx` now pins FOUR deferred blocks (the example block left on
  29/09/2026 for the same reason — see "The worked example block" below) and asserts neither the
  quiz section nor the example block is one of them. A title-only panel carries `data-title-only` and shrinks to its text
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

**The correct answer is spread across the four letters, and a case holds it there** (29/09/2026).
The owner noticed every correct answer was B: measured, 259 of 305 multiple-choice answers and 12
of 18 multi-select sets (A and B) — authors, and agents drafting in batches, put the right answer
right after one decoy, so a reader could guess the pattern within a few questions. They were
reshuffled through the TypeScript syntax tree, not by regex: questions sorted by a hash of their
id and assigned a, b, c, d round-robin (77/76/76/76), the three wrong answers keeping their
relative order; multi-select sets rotated. Seven explanations that name a choice by letter were
remapped (Q208, Q236, Q243, Q259, Q267, Q284, Q338; three more kept their letters), and a check
confirmed every question kept the same correct text and the same four choices. `quiz.test.ts`
now requires each letter to hold 20–30% of the multiple-choice answers and no multi-select set to
exceed a third — so **a new question must not default to B**, and one whose explanation cites a
letter must be checked against its own `choices`.

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
Vietnamese **silently** — it said so out loud (`quiz.notTranslated`) until the owner called that
sentence one more "meaningless explanation line" and had it dropped (30/09/2026, same reasoning
and same shape as `quiz.lead`/`quiz.few.body`): the fallback itself is unchanged, only the
announcement of it is gone. `QuizBody.test.tsx` pins the inverted case — the sentence never
renders, even for a formula whose bank is still Vietnamese-only — so anyone who reads it coming
back knows that is a decision, not a slip. The verbatim quote stays in its source's language in
BOTH versions: translating it away is what removes the reader's ability to check it.

## The worked example block ("Ví dụ thực tế") — same shape as a quiz solution

**Since 29/09/2026 the example block renders the quiz's structured solution, with the SAME
component** (`src/ui/result/LoiGiai.tsx`, its CSS moved out of `QuizBody.module.css`). The owner put a
screenshot of the old block — a paragraph, a plain-text source line, a table of numbers — beside one of
a quiz solution and said: _"điều chỉnh lại cách giải thích cho phần Ví dụ thực tế cho giống với cách giải
thích trong phần bài tập. thêm nữa nguồn của phần ví dụ thực tế nên đưa về kiểu link để người dùng click
vào về trang nguồn"_. The rows are the quiz's — Công thức áp dụng (the page's picture, hover panels and
all) · Thay số · Áp vào công thức · Kết quả — plus **Đọc kết quả** (the example's `note`, kept as the last
row at the owner's choice) and **Nguồn**, which prints one link per source (each with a `nhan` saying
which figure it backs) above the old source name. One component, not two copies of the JSX: "looks like
the quiz" would otherwise be a promise that drifts. Seven things are load-bearing:

- **The block is no longer editable.** From 10/09/2026 its figures were inputs wired to the page's
  state; the owner dropped that with the new shape — _"không cho gõ được vào ví dụ thực tế nữa"_. A worked
  example must hold still: "Áp vào công thức" prints the example's own figures, and an input above it
  would make that line lie. `ExampleBlock` no longer takes `inputs`/`output`/`onChange`; four
  `FormulaDetail.test.tsx` cases that typed into it were replaced by one that pins the opposite.
  `InlineNumber` stays — `SliderInput` uses it.
- **The presentation data is build-only, the figures are not duplicated.** `src/core/vi-du/` holds, per
  formula, only `tinh` / `gan` / `thaySo` / `nguon` (`ViDuGiai`). The numbers, result, note and source
  name stay in `spec.example`, which `formulas.test.ts` already checks against `calc`. The new text is
  read ONLY by `page.tsx` through `@/application/vi-du` and passed down as a prop — anything in `spec`
  ships in all 111 pages' JS. `build-only-imports.test.ts` pins both import sites (the barrel may
  re-export TYPES from the leaf `@/core/vi-du/types` only), and `verify:static` fails if a Thay số
  sentence turns up in any `out/` JS chunk or if `pe`'s appears on `roe`'s page.
- **The rules live in ONE function, `viDuProblems()` in `src/core/vi-du/kiem.ts`.** `vi-du.test.ts`
  runs it over every entry, and the drafting run used the same function on every draft, so the gate
  and the authoring tool cannot disagree. It re-computes "Áp vào công thức" with `evaluateWorked` and
  requires it within 0.5% of what `calc` returns for the example's inputs and series; checks every
  `kyHieu` against `spec.symbols`/`	ext{…}`; requires every number in a Thay số row to appear in the
  example (title, note, source, inputs, series and its dates) or in the arithmetic line; bans long
  dashes; requires `en` everywhere (no thousands separators in the `en` line); requires https links and
  a `nhan` on each when there are two or more. What it cannot see is two same-unit figures swapped
  (price into EPS) — every row was read by meaning in the adversarial pass, and new ones must be too.
- **Series formulas do not spell out 20–250 closes.** Their Thay số row describes the session window in
  words and the arithmetic line uses the aggregates `calc` itself computes (`extras`: RSI's average gain
  and loss, SMA's sum…), rounded to ≥4 significant figures so the 0.5% gate still holds.
- **Links point at pages that hold the exact figure, and session prices are date-pinned.** Prices go to
  CafeF's price-history endpoint with `StartDate`/`EndDate` (20 rows a page; `GiaDongCua` is the
  unadjusted close the examples use, `GiaDieuChinh` the bonus-adjusted one) — never a "latest" page,
  which scrolls the example's session away within weeks. An empty `nguon` is allowed when no reachable
  page holds the figure: the row then prints only the source name. A made-up link is worse than none.
- **No `deferred` class on the block**, for the quiz's reason: `contain: paint` clips the hover panel.
- **Two formula pictures per page** (example + quiz), each its own `QuizFormulaPicture` with its own
  panel state; the `idPrefix` prop (`vi-du` / default `bai-tap`) keeps two open panels from sharing an
  `id`. `page.tsx` now builds `latexHtmlAllSymbols` whenever the example has a solution, not only when a
  quiz question needs it.

**The "Áp vào công thức" row is DRAWN, not printed** (29/09/2026), in the quiz and the example alike.
Printed as text, a radical was just "√(76,18 ÷ (54 − 1))" with no bar over it and a power was
"^(9 ÷ 365)"; the owner screenshotted it as broken. The row now goes through the fill-in formula's
own renderer, `CongThucDien` (radical with a bar, stacked fractions, raised exponents, `themNgoac`'s
parentheses), wrapped in `role="math"` with the text form as `aria-label` so screen readers still get
"÷" and "√". Four details hold it together:

- **The example's tree is built at BUILD time** (`page.tsx` → `expressionShape()` → `viDuCay` prop), and
  the renderer imports only the leaf `@/core/quiz/nut` (the `Nut` type and `chieuCao`) through
  `@/application/quiz-cay`. The example block is in every detail page's First Load JS; importing via
  `@/application/quiz-math` would drag the whole parser there. The quiz builds its trees at runtime, as
  before — the parser is already in `QuizPanel`'s lazy chunk. `worked-line.ts` re-exports both, so no
  existing import changed.
- **The renderer's CSS moved to `CongThucDien.module.css`** — importing the whole `QuizBody.module.css`
  into the example block would put the quiz's CSS on every page.
- **Solutions set `xuongDong`**: the top-level +/− chain is flattened into sibling terms so the line
  wraps BEFORE an operator, each fraction staying whole. XIRR's four fractions are ~900px; without it
  the last term was clipped at the column edge. `duoi` puts the implicit equation's "≈ 0 ₫" inside the
  same box so it follows the last term instead of dropping onto a line of its own. The quiz's fill-in
  formula sets neither.
- **`viDuProblems()` requires both the `vi` and `en` line to parse into a tree** — a line that doesn't
  would silently fall back to the old text.

**Three shapes don't fit "the arithmetic line equals the result", and each has a PINNED escape hatch**
in `kiem.ts` rather than a looser rule:

- **Rounding.** `so-hop-dong-toi-da` draws `⌊V ÷ (F × m × k)⌋` and `so-ky-dca` `⌈…⌉`. The shared parser
  (`worked-line.ts`) learned `⌊…⌋` and `⌈…⌉` (nodes `san`/`tran`, drawn by `CongThucDien` like `|…|`), so
  the line keeps the picture's rounding and evaluates to 6 / 45 instead of 6,09 / 44,15.
- **Implicit equations** (`PHUONG_TRINH_AN`: `xirr`, `irr-nien-kim`). The result is a root found by
  search, so the line keeps the page's picture and evaluates to `thaySoRa` — XIRR's discounted cash
  flows ≈ 0 ₫, the annuity's right-hand side ≈ the 3.000.000.000 ₫ loan — and the block appends
  "≈ <that>" to the line. The first drafts rearranged the annuity to isolate IRR, i.e. drew a
  different formula; that is what the hatch exists to avoid.
- **No arithmetic at all** (`KHONG_CO_PHEP_TINH`: `chuoi-phien-giam-dai-nhat`, a count then a max). The
  row is omitted (`thaySo` absent) — "4" there would only repeat the Kết quả row below it — and the
  Thay số row is allowed to state the result.

**What the drafting run found wrong in the EXAMPLES themselves** (not fixed — the figures are
`spec.example`, checked against `calc` and quoted in prose; changing them is the owner's call, listed in
TASK.md 29/09/2026): the FPT 57-session dataset's VOLUME column matched no source (`vwap` and
`ty-le-khoi-luong` could not be reproduced from any page — fixed 14/10/2026, when the whole column was replaced
by VNDirect's matched volume and `vwap` got its link back, emptying the "no link" pin); several
inputs of `fcff`/`fcfe` don't match the named source; ~37 source names say Investing.com, which blocks
every automated read, so their links go to CafeF/VNDirect pages that carry the same closes; CafeF's
VN-Index history mangles 11 sessions (links use VNDirect's API) and its Q1–Q2/2026 statement tables
are shifted one row (links avoid the misaligned lines or use stockanalysis).

## The example datasets — 250 real sessions, so "Xem ví dụ minh hoạ" draws a full chart (14/10/2026)

The 35 series formulas' "Xem ví dụ minh hoạ" button loads `example.dataset` onto the time chart. Until this
date that was FPT 57 sessions and VN-Index 71 — enough for the example's number, not for the picture: with
the examples' own 55–71-session windows, seven formulas drew 3/57 sessions, Beta 1/71, the eight risk ratios
12/71, and the rest of the frame was hatching. The owner photographed `chuoi-phien-giam-dai-nhat` (a hatched
frame and a sliver at the right edge): _"số liệu lấy thực tế trên mạng về và có thể vẽ biểu đồ luôn, ví dụ
minh hoạ phải nhiều để không bị lỗi chút ít ở góc phải … áp dụng cho toàn bộ công thức có biểu đồ"_. When
offered to keep the Coefficient of variation's hatching because it is true: _"đúng sự thật nhưng người dùng
đâu có hiểu? … cái gạch gạch ấy có thao tác được đâu"_. **The measure is the part of the chart a user can
hover, not the final number.**

- **`market-series-2026.ts` holds three 250-session OHLCV tables, 12/09/2025 → 15/09/2026**: FPT, VN-Index and
  STB, downloaded from VNDirect (`api-finfo` unadjusted prices for the two stocks, `dchart` for the index)
  and checked by machine first: the last 57 FPT sessions equal the old table on open/high/low/close, the last
  71 VN-Index sessions on all five columns (`market-series-2026.test.ts` keeps the owner's old closes as a
  fixture and compares the tail); the three share the same 250 dates (Beta regresses by position); no split
  or bonus issue inside the year. Volume is the source's **matched** volume (`nmVolume`), replacing the old
  FPT column that matched no source. Each `*_PHIEN` is the close column of its `*_BARS`, never a copy.
- **The last session stayed 15/09/2026**, so every example that reads only its last N ≤ 71 sessions kept its
  number to the digit (20 of 35). Fifteen were rewritten — `expected`, title, note, source and the
  `src/core/vi-du/` solution: the six whole-series ratios (Sharpe, Sortino, Treynor, information ratio, Calmar,
  win/loss — all flipped from negative to positive over the year), the five smoothed from the first session
  (EMA's quoted value, MACD, signal line, RSI, ATR), the two that use volume (VWAP, volume ratio), Beta and
  the Coefficient of variation (below).
- **Beta is a real beta now**: FPT against the VN-Index, 60 sessions, 0,8126. It used to regress the index on
  itself (always 1) with a note blaming the 57-session FPT series, which stopped being true.
- **`he-so-bien-thien` uses STB with a 90-session window.** CV = s / r̄ is `MEANINGLESS` whenever the mean
  return ≤ 0, so on FPT (−28% over the year) only 44/250 sessions drew, and on the VN-Index the last session
  failed. Measured across 47 large HOSE tickers, adjusted and unadjusted: only STB (+37%, no corporate action,
  adjusted = unadjusted) with a 90-session window draws a gap-free line; smaller windows hit a mean near 0 and
  the line jumps to the thousands. A new example must be checked on the CHART, not just on its last number.
- **`src/core/chart/example-history.test.ts` is the gate**: it rebuilds exactly what `applyExample()` puts on
  screen and requires, for all 35, one continuous line (no hatching after the first computable session; the
  warm-up at the left is allowed) covering ≥ 60% of the axis. Measured: CV 64%, Beta 76%, the 55-window group
  78%, every technical indicator ≥ 87%. It also pins the count of 35.
- **Cost, measured with esbuild**: the data module went from 2,95 kB to 12,8 kB gzip, and it ships in every
  detail page because `FormulaDetail` imports the whole Registry. The size gate was already red. The cure, not
  done: load `example.dataset` with a dynamic `import()` on the button click.
- `kiem.ts` builds its `Intl.NumberFormat` once: per call it pushed `vi-du.test.ts` past Vitest's 5 s timeout
  under the full suite (2.664 ms alone → 160 ms).

## Numbers in the usage guide's field notes follow the field (14/10/2026)

The owner photographed the "?" popover of the Số liệu block on `bien-do-dao-dong-lon-nhat`: the slider
read 55 sessions (set by "Xem ví dụ minh hoạ") under the note "60 phiên là khoảng ba tháng." — a sentence
written around the field's DEFAULT. Then: _"khi người dùng sửa đổi thông số hoặc nạp mẫu gì đó từ ticker
vào thì 60 phiên đổi thành 55 phiên … thì trong phần hướng dẫn sử dụng cũng cần thay đổi tương ứng theo"_.

So a field note (`oNhap.layODau` / `luuY` in `src/core/huong-dan/noi-dung/items.ts`) may carry
placeholders, filled by `dienCau()` (`noi-dung/cho-trong.ts`): `{key}` (the number in the field),
`{key|thoiGian}` (sessions → calendar time at 250 sessions a year, rounded to half a unit: 55 → "2,5
tháng"), `{key|coPhieu}` (shares in millions → "1,47 tỷ"), `{key|min}` / `{key|max}` (the field's
`VariableSpec` bounds, so they follow the CODE, not the user). The popover passes `effectiveInputs` (typed
numbers, ticker fills and chain values); the full guide page has no fields and fills with defaults, as
does a field that is empty, 0 or non-finite. `dienCau` reaches the client through the leaf
`@/core/huong-dan/types`, the one path `build-only-imports.test.ts` allows.

**Not every number may follow.** "12 là mặc định phổ biến" under MACD's fast period is a convention the
default was chosen BY; letting it follow the field would print "10 là mặc định phổ biến", a false
sentence. `noi-dung.test.ts` pins the 17 templated notes and makes every OTHER number that equals its own
field's default sit in one of three named lists (convention · fact · how-to-enter, 43 entries); a 44th
turns the case red, and whoever adds it must choose. Only the `#nhap-so` and `#doc-bieu-do` sections open
in a popover; `docKetQua` / `deSai` live on the full page only, where there is no field to follow.

## The usage guide's "Đọc biểu đồ" section — one text per REAL chart

Every formula has a usage guide (WF-21, `/huong-dan/cong-thuc/<id>/`, built by `src/core/huong-dan/`, read
only at build through `@/application/huong-dan`); the "?" button beside the chart block on the detail screen
opens its "Đọc biểu đồ" section in a popover (`GuideHintPanel`). Three of the guide's four sections carry
only text the owner supplied in `guide-111.json` (05/10/2026: _"chỉ để lại những câu đã tạo trong file tôi
gửi thôi"_). **The chart section is the exception since 13/10/2026**, and what it replaced is the lesson.

Until then the section printed ONE shared paragraph chosen by `spec.chartType`, under a heading naming the
type: "Biểu đồ quét độ nhạy", "Biểu đồ nến"… The owner read the first one on screen and asked four
questions in a row — _"nghĩa là sao? đây là biểu đồ về cái gì? đang hướng dẫn sử dụng biểu đồ gì? biểu đồ
đang là dạng gì?"_ — then: _"biểu đồ tên là gì thì ghi vào đó chứ không phải là 'Biểu đồ quét độ nhạy' vì nó
vô nghĩa … nói rõ là ở dạng đường thì đường cong đi từ đâu đến đâu và xu thế của thị trường hay xu thế của
biểu đồ đang ám chỉ cái gì. còn dạng cột thì làm sao đó tương tự. sửa lại ở tất cả công thức, không được làm
đối phó."_

**`chartType` is a label, not what the screen draws.** Running `buildChartModel()` — the function the detail
screen calls — over all 111 formulas: the screen builds exactly THREE shapes (`ChartModel`: a line of the
result against one input, a line over time, horizontal breakdown bars). 63 formulas open on a line against
an input (57 tagged `sensitivity`, 6 `stackedBar`); 35 draw nothing until a price series is loaded, then a
line over time; 5 open on breakdown bars; 8 have no chart block. So text chosen by the label described
charts that do not exist: 26 guides talked about candles, distribution columns, drawdown curves and
regression dots (`candlestick`/`histogram`/`underwater`/`scatter` have no renderer), 6 about "stacked bars"
over a line, and the 5 breakdown guides said "the last column stands on 0" while the bars lie
**horizontally**. Every chart already has a NAME on the detail screen — the `<figcaption>` title, "P/E theo
Giá thị trường" — and that is the heading now.

How it is built, in `src/core/huong-dan/bieu-do/`:

- **`keHoachBieuDo()` asks the chart engine, never `chartType`.** With `defaultInputs()` and a context that
  carries no price series (the state the screen opens in), it reads back EVERY entry the "Xem kết quả đổi
  theo" picker can offer and what each chart is called: `truc`, one plan per input that can sit on the
  horizontal axis, taken at the Advanced level because that set contains the Basic one (**248 axes** across
  the 103 formulas, 10 of them Advanced-only); `thoiGian` (47 formulas — `historyPlan() !== null`); `bocTach`
  (5 default, 6 as a picker entry); and `moRa`, the key of the chart the screen opens on (an input for 63,
  the breakdown for 5, the time chart for the 35 that wait on a series). Names are built with
  `lineChartTitle()`, extracted from `build.ts` for this, because the time chart and 51 of the 248 axes draw
  nothing until a series is loaded, so at build time there is no model to read a title from; a test loads a
  synthetic series and compares every name against the real model.
- **Measuring all 248 axes, not just the default one, turned up three things the first version could not
  see.** 197 axes draw at once and carry `hinh` (direction, gaps, sign change); the 51 series-only axes carry
  none, because their shape belongs to whatever series the user loads. **Four axes are FLAT** — `gia-hoa-von`
  and `roi-rong` against Khối lượng (quantity cancels in numerator and denominator), `rut-truoc-han` against
  the contract rate and the contract term — so the direction has a third value, `'ngang'`. It is asked with
  `isFlatSpan()`, extracted from `niceAxis()` in `scale.ts`: that is the exact condition the screen uses to
  draw a level line, and `max === min` is wrong there (the 41 points differ in the twelfth digit). And the
  ±50% test compares the smaller and larger RATIO, not the left and right end, because a negative default
  (`loi-suat-trung-binh-hinh-hoc`'s `r2` = −5) flips the two ends.
- **`noi-dung/*.ts` holds the text: 600 paragraphs, Vietnamese AND English** (the owner asked for a proper
  English version when approving — unlike the other guide sections, where `en` is optional and falls back).
  One "Dạng Đường" and one "Dạng Cột" paragraph per line chart — the two buttons of the "Loại biểu đồ" row —
  and a single paragraph for a breakdown, which has bars only. Line charts against an input sit under
  `truc`, keyed by the input's own `VariableSpec.key`, not by role ("default", "advanced") as the first
  version had it: a role is something the engine picks and can change, and text tied to a role silently
  moves under a different chart the day a default axis changes. The English says **"bars", not "columns"**,
  because the button is `chart.kindBar` = "Bars".
- **`bieuDoProblems()` in `kiem.ts` is the one rule set**, run over all 111 by `bieu-do.test.ts`: a paragraph
  exists if and only if the screen has that chart — per picker entry now, so a mistyped key shows up on both
  sides at once — and `sma-n-phien`, whose time chart carries the closing-price overlay and therefore no
  Line/Bars toggle, must have NO bar paragraph for it. A line paragraph must name the axis field verbatim ("ô
  Giá thị trường"), say "một nửa … gấp rưỡi" exactly when the axis is the ±50% sweep, and say "không phải
  diễn biến thị trường". Where the line is measured, the FIRST direction it mentions ("đi lên"/"đi xuống")
  must match `sweepPoints()`, a flat line must be called "nằm ngang", "gạch chéo" appears iff the curve has an
  uncomputable stretch and "vạch 0" iff the result changes sign. A series-only axis must say the chart is
  computed on the series "đã nạp" and must say what rising or falling means; a time paragraph must say oldest
  → most recent session, explain both directions, and quote every `spec.referenceLines` value; a breakdown
  paragraph must quote every bar label. No long dash, no "quét"/"độ nhạy", and **no digits** except 0 and the
  formula's own reference lines — the ends of a sweep move with whatever the user types, so a figure in the
  text is wrong at the first keystroke. A pinned distribution (248 axes · 51 series-only · 4 flat · 26
  reversible · 10 Advanced · 6 with an odd range · 47 time charts · 63 / 5 / 35 by opening chart · 8 without
  a block) turns red when a formula changes shape, and no two paragraphs in the store may be identical.
- **26 axes can be REVERSED by a number the user is allowed to type, and their text must say both
  directions.** The measured direction belongs to the DEFAULT inputs, but the popover opens beside the chart
  of whatever is typed: enter a loss and "ROE theo Vốn chủ" stops falling and rises, under a paragraph that
  said "Đường đi xuống". `keHoachBieuDo()` therefore probes every measured axis (`KeHoachTruc.daoChieu`):
  one input at a time, the axis's own included, over a sparse grid of typeable values (`min`/`max`, 0, a few
  multiples of the default and its negative, every option of a selector). Only up↔down counts; a line that
  merely goes FLAT when a factor hits 0 (P/E against EPS at price 0) does not — dozens of axes do that, and
  the 0 on screen already says it. For the 26 the gate requires the Đường paragraph to contain both "đi lên" and
  "đi xuống", and the Cột paragraph to describe either no bar direction or at least two of "cao dần · thấp
  dần · dài dần · ngắn dần" (EN: "grow taller · shrink · grow longer · get shorter"). The Cột rule is
  separate on purpose: the popover prints ONE form, so a hedge in the line paragraph does not cover the bars.
  Write the condition in the formula's own terms ("Khi doanh nghiệp có lãi … đang lỗ thì đường đi lên"),
  **never "với bộ số đang nhập"**: that phrase asserts something about the numbers on screen, which is
  exactly what a build-time text cannot know. The probe changes one input at a time, so it is a detector,
  not a proof.
- **A series-only paragraph that mentions ONE direction is making a promise, and the promise is tested.**
  Sharpe against the risk-free rate falls on any series; SMA against its period rises or falls with the data.
  `chieuDuyNhat()` reads a paragraph that names only one direction as "every series gives this", and
  `bieu-do.test.ts` tries that claim on four deliberately different synthetic series (up, down, sideways,
  V-shaped; 400 sessions so the 370-session lookbacks have data) — none may run the other way. A paragraph
  that explains both directions promises nothing and is skipped. The English side has two substring traps
  the gate will catch you on: "flattens" contains "flat" (so it reads as a flat-line claim — write "levels
  off"), and "one and a half times" contains "half" (so an axis that is NOT the ±50% sweep cannot use the
  phrase at all — write "fifty percent more").
- **What no gate sees is whether "what the trend means" is true of the formula.** That is the part the owner
  asked for, and the answer differs by family, which each paragraph says outright: a sweep is a what-if,
  **not** market history; a time line of SMA / EMA / VWAP / the Bollinger bands moves WITH the price, so its
  trend is the price trend; a time line of RSI, MACD, ROC, ATR, drawdown, VaR, Sharpe… measures something
  else, so rising does not mean the price rose; and earnings yield, dividend yield and margin of safety move
  AGAINST the price. Every paragraph was read against `calc`; new ones must be too.
- **That reading was done adversarially on 13/10/2026 — four read-only agents, all 600 paragraphs against
  `calc` and the real engine — and it changed about 150 of them.** Five kinds of defect, none of which the
  gate could see at the time, and each a rule for new text:
  - _Calling the loaded series "real"._ Seventeen time paragraphs said "Đây là diễn biến thật của mã bạn
    nạp". A sample preset's price path is 247 fabricated sessions and one real one (`samples.ts`), so the
    sentence was false for every "Nạp mẫu". They now say the chart follows "chuỗi giá bạn đã nạp" and claim
    nothing about where it came from. They do **not** add a sentence saying samples are fabricated: the owner
    removed that block from the sheet on purpose (`preset.draftTitle` tombstone), and putting it back in 17
    places is their call. The sheet's last such sentence, `preset.seriesOnlyNote` (the lead line for
    series-only formulas), went the same way later on 13/10/2026, so no on-screen text says it any more;
    the `isDraft` flag in `samples.ts` and `preset.draftExport` in exported files still do.
  - _A direction or a "why" that only holds for the defaults_ — the 26 axes above, plus claims such as
    "luôn nằm cao hơn lãi suất danh nghĩa" (not with yearly compounding) or "càng lúc càng dốc" on
    `lich-tra-no` (straight under "Gốc đều", a Basic-level button).
  - _Describing how steep a line LOOKS._ In line form the value axis hugs the data, so every straight line
    runs corner to corner: "rất thoải" was true of the number and false of the picture (WACC against the tax
    rate fills 72% of the frame). Say it in values ("không tăng một đổi một", "các mức ghi trên trục dọc cho
    thấy cả đường chỉ hạ một khoảng hẹp") or leave it to the bars, whose axis contains 0.
  - _A mechanism that is not the formula's._ Bollinger bandwidth "rising means the past was more volatile"
    (the bands use the deviation of price LEVELS, which grows with the window by itself); "the reward for
    reinvesting" on a chart where every bar already reinvests; `he-so-bien-thien` bars "below the zero
    line" when `calc` fails on a negative average and the screen draws hatching there.
  - _The chart itself being wrong._ Reading `beta`'s time paragraph against `calc` showed the paragraph was
    right and the ENGINE was not: `historyPoints()` cut `bars` and `series` to each session but left
    `ctx.marketSeries` whole, so every point but the last regressed an old stretch of the share against the
    latest stretch of the index (a share built with beta 1.5 in every window drew a line from −0,37 to 1,5).
    Fixed in `history.ts` by dropping the same number of sessions from the END of the index series; a case
    in `history.test.ts` pins it. Text review is also a chart review.

**The "?" popover prints ONE chart: the one on screen, in the form being drawn** (second round, the same
13/10/2026). The first version printed every chart of the formula at once, two forms each, and closed with
two sentences pointing at the "Xem kết quả đổi theo" and "Loại biểu đồ" rows. The owner: _"không cần đoạn
text sau … ô hướng dẫn sử dụng đang rất dài, sửa logic như sau: sau khi lựa chọn một select mới từ đường thì
mới hiển thị xem biểu đồ dạng đường, tương tự khi click vào xem biểu đồ dạng cột. hoặc khi đổi dạng Xem theo
thời gian, Khối lượng, thời gian nắm giữ,... với tất cả các loại biểu đồ của tất cả công thức"_. That is two
requests, and the second is the expensive one: a popover that follows the picker needs text for EVERY picker
entry, and the first version had written 64 of the 248 axes — the default ones. The other 184 were written
in this round; without them, picking "Khối lượng" would show either nothing or the text of a different chart.

- **`ChartBody` reports what it is showing** through `onViewChange` → `HinhDangXem { khoa, dang, daVe }`:
  the picker entry (`ChartModel.sweepKey`), the form actually drawn, and whether a chart is drawn at all.
  The state lives behind the chart's lazy boundary, and it cannot be lifted to `FormulaDetail`: the DEFAULT
  axis is chosen by `buildChartModel()`, which the detail screen must not import (the invariant in
  `FormulaChart.tsx`). The prop goes through `memo(FormulaChart)`, so `FormulaDetail` passes the `useState`
  setter itself, never a closure; the effect depends on three primitives, so it fires when the chart
  changes, not on every keystroke. `dang` is the EFFECTIVE form, not the button's wish: SMA's time chart has
  an overlay and no bars, so with the button left on Cột the screen draws a line and the popover must too.
- **While nothing is drawn and the user has picked nothing, `khoa` is `null`.** An `unavailable` model still
  carries a `sweepKey` — the first input the engine tried — but for the 35 formulas waiting on a series the
  chart that will appear is the time chart, not that input's. `khoiDangXem()` in `GuideBody.tsx` falls back
  to the first block (`moRa`) for `null`, for "not reported yet" and for a key with no text.
- **One condition line is left: `guide.chart.when.seriesOnly`**, printed only when the chart being described
  needs a series AND is not on screen. `guide.chart.switchAxis`, `switchKind`, `when.advanced`, `when.series`
  and `when.breakdown` are gone (tombstone in `vi.ts`), and with the first three went the last `guide.*`
  values that quoted an on-screen label — so the i18n canary "có ít nhất một đoạn bài đang trích nhãn màn
  hình" was retired with a tombstone; the scan itself stays and currently has nothing to scan.
- **The full page (`/huong-dan/cong-thuc/<id>/`) has no chart on screen to filter by**, so it lists every
  chart as a `<details>`, name in the `<summary>` (still an `<h3>`), the opening chart open, an "Nâng cao"
  tag on Advanced-only entries. Printing them all flat would rebuild the long box the owner had just
  rejected, only longer — up to six charts a formula now.
- Clicking the picker or the Line/Bars buttons closes the popover first (outside click), so the usual path
  is pick → reopen. A keyboard user can change the chart with the popover open; the placement effect lists
  `hinh` as a dependency for that, because new text is a new height.

`check:chrome` measures the one thing vitest cannot — that the popover does not scroll inside itself — on
`pe` at 1440, opened as a line and again after pressing Cột. The 18 `guide.chartKind.*` keys are gone
(tombstone in `vi.ts`), as is `BaiHuongDan.kieuBieuDo`. `types.ts` of `src/core/huong-dan` re-exports the
view types because `build-only-imports.test.ts` lets the `@/application` barrel reach that directory through
that one leaf file only. Do not rebuild a "chart type → paragraph" table, and do not rebuild the two pointer
sentences: to know what the screen draws, call `keHoachBieuDo()`; when a picker entry has no text, write
its text.

Five things this surfaced and did not fix, all outside the guide text: `eps-co-ban` in Advanced mode opens on
"EPS cơ bản theo Cổ tức ưu đãi" swept across the field's whole 0 – 100.000 tỷ ₫ range (the default is 0, so
there is no ±50% around it) and ends tens of thousands of dong below zero — a legal but odd default chart;
the detail screen's own `<figcaption>` opened "Quét … từ … tới … qua 41 mức", the same jargon the owner
rejected in the guide (off screen since 14/10/2026, see "Chart kinds"); **a line chart whose computable points are isolated draws no stroke at all** —
`gui-quay-vong` against "Tổng thời gian" is computable only at multiples of the short term, `linePath()`
emits five `M` and no `L`, and the line form shows hatching edge to edge plus the marker dot (its paragraph
now says so and sends the reader to Cột; the cure is a dot per lone point in `LineChart`);
`sweepDomain()` only snaps to the step grid below 41 steps, so a 30–90 axis prints "31,5 phiên" for a value
`calc` rounds to 32; and `ddm-hai-giai-doan`'s example note says one point of perpetual growth moves the
result more than FIVE points of first-stage growth, which `calc` contradicts on the example's own inputs
(+5.991 ₫ against +9.460 ₫ — it is true against ONE point, +1.770 ₫).

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
