/**
 * Tầng APPLICATION — từ điển tiếng Anh (gói WBS 3.6.3, phần khoá giao diện — đợt 7).
 *
 * Đợt 7 dịch toàn bộ khoá giao diện; LangSwitch đã gắn vào AppHeader từ đợt 14. Nội dung công
 * thức (tên, 4 mục diễn giải — 432 đoạn, ví dụ, biến số, nguồn, cảnh báo runtime) đã dịch toàn
 * bộ ở đợt sau đó, lưu ngay trong spec ở tầng Domain dưới dạng `Bilingual {vi, en}` — xem
 * `Bilingual` ở `src/core/types.ts` và `pick()`/`usePick()` ở tầng Application, KHÔNG nằm
 * trong từ điển này. `disclaimer.text` (FR-24) dịch ở đợt kế tiếp — xem `DisclaimerBar.tsx`.
 *
 * Từ điển này (và mọi field `Bilingual` ở Domain) nay đã dịch **đủ**: `missingKeys('en')` rỗng.
 * Vài khối vẫn cố định tiếng Việt theo thiết kế, KHÔNG phải nợ dịch: metadata SEO build-time
 * (`page.tsx`), file PDF/PNG xuất ra (`draw-card.ts`, `ExportSheet.tsx` — tài liệu xuất luôn là
 * văn bản tiếng Việt trọn vẹn, kể cả câu miễn trừ đính kèm vẫn lấy `DISCLAIMER_VI`), và tên công
 * ty mẫu trong `samples.ts`.
 *
 * Bẫy số ít/số nhiều: nhiều khoá đứng ngay sau một con số ghép ở call site ("12 kết quả"),
 * mà từ điển phẳng không phân nhánh theo số được. Khoá nào con số có thể bằng 1 thì dùng
 * dạng "(s)"; khoá nào con số luôn ≥ 2 (loan.condensed) thì để số nhiều trơn.
 */

import type { vi } from './vi';

export const en: Partial<Record<keyof typeof vi, string>> = {
  'app.name': 'Faculator Finbox',
  'app.brand': 'Faculator',

  'nav.primary': 'Primary navigation',
  'nav.skipToContent': 'Skip navigation, go to content',
  'nav.formulas': 'Formulas',
  'nav.portfolio': 'Portfolio',
  'nav.settings': 'Settings',
  'nav.about': 'About us',
  /* Bản tiếng Anh không chật như tiếng Việt, nhưng vẫn giữ đôi nhãn cho hai thanh khớp nhau. */
  'nav.aboutShort': 'About',
  /* Cố ý khác `nav.formulas` — cùng lý do bản tiếng Việt: màn chi tiết đã có khối "Formula". */
  'nav.backToList': 'Formula list',
  'nav.backToFormula': 'Back to formula',

  'mode.label': 'Display mode',
  'mode.basic': 'Basic',
  'mode.advanced': 'Advanced',

  'theme.label': 'Appearance',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.switchToDark': 'Switch to dark appearance',
  'theme.switchToLight': 'Switch to light appearance',

  'lang.vi': 'VI',
  'lang.en': 'EN',
  'lang.switchToEn': 'Switch to English',
  'lang.switchToVi': 'Switch to Vietnamese',

  'offline.title': 'Working offline',
  'offline.detail':
    'No internet connection. Every calculation still runs because the calculator lives on your device.',

  // Miễn trừ trên MÀN theo locale (FR-24, DisclaimerBar.tsx dùng lá <T>). Câu đính vào file
  // xuất KHÔNG đọc khoá này — nó luôn lấy DISCLAIMER_VI thẳng, vì tài liệu xuất ra cố ý luôn
  // tiếng Việt (xem docblock đầu file). Hai câu diễn cùng một ý, không phải bản dịch từng chữ
  // của nhau, nên không có ca kiểm nào neo chúng lại với nhau.
  'disclaimer.text': 'Results are for reference only, not investment advice.',

  'search.label': 'Find a formula',
  /* Ví dụ phải là chữ tìm ĐƯỢC ở bản EN: `search.ts` chấm cả `name.en`, và "Sharpe" trúng
     'Sharpe ratio'. Để nguyên "định giá" thì ô gợi ý ở màn tiếng Anh lại là tiếng Việt. */
  'search.placeholder': 'Formula name, e.g. P/E or Sharpe',
  'search.clear': 'Clear the search box',

  'search.recent.title': 'Recent searches',
  'search.recent.clear': 'Clear history',
  'search.tip': 'Type a formula name, an abbreviation, or the thing you want to calculate.',
  'search.matchNote': 'Accent-insensitive match for',
  'search.resultCount': 'result(s)',
  'search.noMatch': 'Nothing found for',
  'search.suggest.title': 'You might need',
  'search.hot.title': 'Hot categories',
  'search.folder.seeAll': 'See all',
  'search.folder.open': 'Open group',
  'search.noneIn': 'No results in:',

  'filter.category.label': 'Formula group',
  'filter.category.all': 'All groups',
  'filter.category.advancedOnly': 'Advanced only',
  'filter.category.scrollPrev': 'Previous groups',
  'filter.category.scrollNext': 'More groups',
  'filter.reset': 'Clear filters',
  'sort.label': 'Sort',
  'sort.featured': 'Most practical first',
  'sort.recent': 'Recently viewed',
  'sort.used': 'Most used',
  'sort.basic': 'Basic first',
  'sort.az': 'Name A → Z',
  'sort.za': 'Name Z → A',

  'level.basic': 'Basic',
  'level.advanced': 'Advanced',

  'list.label': 'Formula list',
  'list.count': 'formula(s)',
  'list.showing': 'Showing',
  'list.levelLabel': 'Level',
  'list.empty.registry.title': 'No formulas yet',
  'list.empty.registry.hint': 'The library is being filled in step by step.',
  'list.empty.noMatch.title': 'No formula found',
  'list.empty.noMatch.scope':
    'This product only covers Vietnamese stocks and personal finance — no crypto.',
  'list.empty.noMatch.hint':
    'Try fewer keywords, or clear the filters to see the whole list again.',
  'list.hiddenByLevel': 'advanced formula(s) hidden',
  'list.showAdvanced': 'Turn on Advanced mode',
  'list.empty.basicOnly.title': 'Only advanced formulas here',
  'list.empty.basicOnly.hint':
    'You are in Basic mode, so this list is empty. Turn on Advanced to see everything.',

  'input.lockedBadge': 'advanced',
  'input.lockedHint': 'Switch to Advanced mode to edit this field.',
  // Chung danh từ 'data': ô mở ghép TRƯỚC tên mã ('data from VHM'), ô khoá đứng một mình
  // ('sample data'). Xem docblock ở `vi.ts` — đổi một vế là phải soi lại vế kia.
  'input.fromTicker': 'data from',
  'input.sampleData': 'sample data',
  'input.sliderMin': 'min',
  'input.sliderMax': 'max',
  'input.sliderStep': 'step',
  'input.unitLabel': 'Display unit',
  'unit.scale.billion': 'billion ₫',
  'unit.scale.million': 'million ₫',
  'unit.scale.dong': '₫',
  /* Không phải "Undo": nút trả ô về giá trị tự điền từ công thức trên, không phải lùi một thao tác. */
  'input.revert': 'Reset',
  'input.overridden': 'overridden',
  'input.autoFrom': 'Auto-filled from',

  'result.eyebrow': 'RESULT',
  /* Tiêu đề ẩn của khối Kết quả — vì sao tách khoá, xem chú thích ở `vi.ts`. */
  'result.heading': 'Result',
  /* `result.live` đã bỏ cùng bản tiếng Việt — xem lý do ở `vi.ts`. */
  'result.unavailable': 'Cannot compute yet',
  'result.fixPrefix': '↳',
  'explain.title': 'Plain-language explanation',
  'explain.meaning': 'What this formula tells you',
  'explain.whenToUse': 'When to use it',
  'explain.howToRead': 'How to read the result',
  'explain.commonMistakes': 'Common mistakes',
  'variable.tableCaption': 'Input variables',
  'variable.colName': 'VARIABLE',
  'variable.colUnit': 'UNIT',
  'variable.colDescription': 'DESCRIPTION',
  'variable.noDescription': '—',
  'example.title': 'Worked example',
  /* `example.editHint` đã bỏ cùng bản tiếng Việt — xem lý do ở `vi.ts`. */
  'example.original': 'Original example gives:',
  'example.reset': 'Back to example numbers',
  /* Label before `example.source` — see `vi.ts`. */
  'example.source': 'Source:',
  'source.title': 'References',
  /* Cả nhóm `flow.*` và `chain.intro` đã bỏ cùng hình vẽ chuỗi — xem lý do ở `vi.ts`. */

  'chain.title': 'Numbers taken from other formulas',
  /* Hai khoá `*Heading` bỏ cùng nửa "Bước sau" — xem lý do ở `vi.ts`. */
  'chain.openStep': "Open this step's own screen",
  /* Dòng phụ dưới tên con số trong thẻ bước: "result of <formula>, used in <formula>". */
  'chain.resultOf': 'result of',
  'chain.usedFor': 'used in',
  'stat.eyebrow': 'METRIC',

  'detail.loadPreset': 'Load sample',
  /* `detail.preset` bỏ cùng bản tiếng Việt — xem lý do ở `vi.ts`. */
  'detail.jumpToExample': 'See the worked example ↓',
  /* `detail.fundamentalsSource` bỏ 14/09/2026 cùng `detail.tickerSticky` — xem `vi.ts`. */
  'detail.tickerLoading': 'fetching live data for this ticker…',
  'detail.tickerFailed':
    'could not fetch data for this ticker — enter values by hand, or tap "Load sample" to use the bundled dataset.',
  'detail.tickerNoData':
    'this ticker has no usable fundamentals yet (its reports lack four consecutive quarters, or the ' +
    'figures do not agree). Retrying will not help — pick another ticker, or enter values by hand.',
  'detail.download': 'Download',
  'detail.shareLink': 'Share',
  'detail.shareCopied': 'Link copied',
  'detail.shareNoSeries':
    'The link carries the numbers in the fields; the price series has to be loaded by the recipient.',
  /* `detail.tickerSticky` bỏ 14/09/2026 — xem `vi.ts`. */
  'detail.tickerChange': 'Change ticker',
  'detail.tickerClear': 'Clear ticker',
  'detail.saveToPortfolio': '☆ Save to portfolio',
  /* Rút gọn theo bản tiếng Việt (24/09/2026) — lý do đầy đủ ghi ở vi.ts. */
  'detail.cancel': 'Leave',
  'detail.presetNoData': 'This formula uses no data from ticker',
  'detail.presetNoDataFix':
    'It runs on your own numbers — type them into the fields above, or tap "See the worked ' +
    'example" for a ready-made set.',
  'detail.restoredNote': 'saved calculation from',
  'detail.restoredMissing':
    'saved calculation not found — it may have been deleted on this device.',
  'detail.restoredNeedsSeries':
    'This calculation uses a price series, and the series on this device no longer matches the one used when it was saved — the result shown may differ from the saved number. Reload the price series before reading it.',
  'detail.meaning': 'Meaning',
  'detail.formula': 'Formula',
  'detail.symbols': 'Symbols in the formula',
  'detail.howTo.label': 'How it is computed',
  'detail.howTo.open': 'See formula:',
  'detail.symbols.toggle': 'Legend',
  'detail.inputs': 'Inputs',
  'detail.hiddenInBasic': 'advanced variable(s) hidden — switch mode to see them',
  'detail.constantSource': 'Market Config · CON-10',
  'detail.constantsInUse': 'Calculated at these rates',
  'detail.constantSince': 'in effect since',
  'detail.derivedInUse': 'From the inputs above, the formula works out',
  'detail.pasteSeries': 'Paste a price series from Excel',
  'detail.loadExample': 'View illustrative example',
  'detail.exampleLoaded': 'Illustrative example loaded ✓',
  /* `detail.exampleSeriesNote` đã bỏ cùng bản tiếng Việt — câu ấy nói sai về số liệu thật đứng
     cạnh nó; lý do đầy đủ ghi ở `FormulaDetail.tsx`. */
  'detail.exampleSeriesLabel': 'the illustrative example',
  /* `detail.applyToTable` / `detail.appliedToTable` đã bỏ cùng bản tiếng Việt — xem lý do ở `vi.ts`. */
  'detail.seriesLoaded': 'Price sessions loaded:',
  'detail.liveSeriesShort':
    'This ticker has a single price session — the live source provides no long history. This ' +
    'formula needs many sessions: paste a price series, or tap “Load sample” and pick one of ' +
    'the four sample tickers.',
  /* Rút gọn theo bản tiếng Việt (23/09/2026) — lý do đầy đủ ghi ở `vi.ts`. */
  'detail.draftMarketSeries': 'These figures are illustrative only, not for real-world use.',
  'detail.openDataTable': 'Open the data table →',
  'detail.chart': 'Chart',
  'chart.sweepLabel': 'See how the result changes with',
  /* Đi theo bản tiếng Việt: 'Shape' là bản dịch của 'Kiểu hình' cũ, đã bỏ — xem `vi.ts`. */
  'chart.kindLabel': 'Chart type',
  'chart.kindLine': 'Line',
  'chart.kindBar': 'Bars',
  'chart.showData': 'View the numbers',
  'chart.tableCaption': 'Data',
  /* `chart.applyHintTimeAxis` và `chart.applyHintReady` đã bỏ cùng bản tiếng Việt — xem `vi.ts`. */
  'chart.zoom': 'Expand',
  'chart.exit': 'Exit full screen',
  'chart.rotate': 'Turn your phone sideways for a wider chart.',
  'chart.rotateUnlock': 'If rotation is locked, open Quick Settings and turn on Auto-rotate.',

  'fee.schedule': 'Fee schedule',
  'fee.scheduleNote': 'Constants come from Market Config — change them once, applied everywhere.',
  'fee.breakdown': 'Cost breakdown',
  'fee.totalCost': 'Total cost',
  'fee.breakEven': 'True break-even price',
  'fee.breakEvenNote': 'selling below this price is a loss',
  'fee.netProfit': 'Net profit',
  'fee.grossProfit': 'gross profit',
  'fee.netRoi': 'Net ROI',

  'loan.monthly': 'Monthly payment',
  'loan.totalInterest': 'Total interest',
  'loan.totalPaid': 'Total paid',
  /* Cùng khái niệm với tên công thức `lich-tra-no` — hai chỗ phải gọi đúng một tên. */
  'loan.schedule': 'Amortization schedule',
  'loan.tableUnit': 'Unit:',
  'loan.gapRow': 'periods in between omitted',
  'loan.colPeriod': 'PERIOD',
  'loan.colPrincipal': 'PRINCIPAL',
  'loan.colInterest': 'INTEREST',
  'loan.colBalance': 'BALANCE',
  /* Ghép "… showing 26/240 periods: …" — số bên trái luôn ≥ 13 nên số nhiều trơn là an toàn. */
  'loan.condensed.before': 'Condensed table — showing',
  'loan.condensed.after': 'periods: the first 12, each year-end, and the last one.',

  'preset.title': 'Load a sample dataset',
  /* Sáu khoá của sheet này đã bỏ cùng bản tiếng Việt — xem `vi.ts` để biết khoá nào và vì sao. */
  'preset.load': 'Load',
  'preset.topPicks': 'Top picks — the four tickers best suited to trying this formula',
  'preset.seriesOnlyNote':
    'This formula runs on a price series. Only the latest session is a real price; the path ' +
    'before it is fabricated, so read the four numbers below as examples, not as a market ' +
    'comparison.',
  'preset.noTickerNote':
    'None of the four tickers below changes a field of this formula — it runs on your own ' +
    'numbers. Loading one here only carries it over to the formulas that do use a ticker.',
  'preset.cannotCompute': 'no result with this ticker',
  'preset.lastPrice': 'Latest session price',
  'preset.browseMarket': 'Find another ticker across the market →',
  'preset.draftTag': 'fabricated price history',
  'preset.draftExport':
    'Input numbers come from a fabricated sample dataset, not yet checked against real statements.',

  'portfolio.title': 'My portfolio',
  'portfolio.totalValue': 'Total value',
  'portfolio.beta': 'Portfolio beta',
  'portfolio.xirr': 'Portfolio XIRR',
  'portfolio.count': 'Tickers',
  'portfolio.hiddenByLevel': 'advanced tile(s) hidden',
  'portfolio.holdings': 'Holdings',
  'portfolio.shares': 'sh',
  'portfolio.costPrice': 'avg cost',
  'portfolio.weight': 'weight',
  /* Tiêu đề cột của bảng Nắm giữ — xem `vi.ts` để biết vì sao không dùng lại bốn khoá ngay trên. */
  'portfolio.colCode': 'Ticker',
  'portfolio.colName': 'Company',
  'portfolio.colQuantity': 'Quantity',
  'portfolio.colCostPrice': 'Avg cost',
  'portfolio.colValue': 'Value',
  'portfolio.colWeight': 'Weight',
  /* Câu nói rõ MẪU SỐ của tỷ trọng — xem lý do ở `vi.ts`. */
  'portfolio.weightNote':
    'Weight is a holding’s share of total portfolio value, measured at market prices rather than at cost.',
  'portfolio.weightPartial':
    'Holdings with no market price yet are left out of the total, so weights are measured against the priced part of the portfolio.',
  'portfolio.tableCaption': 'Tickers you hold',
  'portfolio.tickerUnit': 'tickers',
  'portfolio.add': 'Add ticker',
  'portfolio.remove': 'Remove',
  'portfolio.empty': 'Nothing here yet. Add your first ticker to see total value and weights.',
  /* `portfolio.localTag` và `portfolio.localOnly` đã xoá cùng lúc với bản Việt — xem docblock ở
     `vi.ts`, chỗ ghi vì sao lượt xoá này khác một lượt dọn chú thích thường. */
  'portfolio.formCode': 'Ticker',
  'portfolio.formQuantity': 'Shares held',
  'portfolio.formCostPrice': 'Cost per share (₫)',
  'portfolio.formBuyDate': 'Purchase date',
  /* Nhãn trần, bỏ "(leave blank if unknown)" cùng bản tiếng Việt — xem lý do ở `vi.ts`. */
  'portfolio.formBeta': 'Beta',
  'portfolio.formSubmit': 'Add to portfolio',
  'portfolio.formCancel': 'Cancel',
  /* Vế "beta là gì" thêm cùng bản tiếng Việt — xem lý do ở `vi.ts`. */
  'portfolio.betaHint':
    'Beta measures how much harder or softer this stock swings than the VN-Index — a beta of 1.5 ' +
    'means the index moving 1% usually moves this stock about 1.5%, and under 1 is milder than the ' +
    'market. It cannot be computed automatically yet because that needs return series for both the ' +
    'stock and the index; enter it by hand if you already have it.',
  /* `portfolio.priceNote` đã bỏ cùng bản tiếng Việt — xem lý do ở `vi.ts`. */
  'portfolio.pickCode': 'Pick a ticker',
  'portfolio.priceLoading': 'Fetching market prices…',
  'portfolio.priceFailed': 'Could not fetch market prices from Finbox.',
  'portfolio.priceRetry': 'Try again',

  'portfolio.totalCost': 'Invested',
  'portfolio.gain': 'Gain/loss',

  'portfolio.marketPrice': 'Market price',
  /* `portfolio.priceMissing` ('no price yet') đã xoá cùng bản Việt — xem bia mộ ở `vi.ts`. */
  'portfolio.betaShort': 'beta',
  'portfolio.edit': 'Edit',
  'portfolio.details': 'Details',
  /* `portfolio.editHint` đã xoá cùng bản Việt (14/09/2026) — xem lý do ở `vi.ts`. */
  'portfolio.formSave': 'Save changes',
  'portfolio.mergeNote':
    'This ticker is already in the portfolio. Adding again will add up the quantity and recalculate the average cost price — it will not create a second row. To correct the existing numbers instead, cancel this form, tap the ticker in the list, then tap Edit.',
  'portfolio.formMerge': 'Add to the existing holding',
  'portfolio.formMergeOpen': 'Add to it and open the formula',

  'portfolio.errCode': 'Pick a ticker first.',
  'portfolio.errQuantity': 'Enter the number of shares held, above 0.',
  'portfolio.errCostPrice': 'Enter the cost per share, above 0.',
  'portfolio.errBeta': 'Beta must be a number, e.g. 1.1 — or leave it blank if unknown.',
  'portfolio.errFull': 'The portfolio is full at 50 holdings. Remove one before adding another.',

  /* Ghép ngay trước ngày phiên: "Prices as of 03/09/2026". */
  /* Viết thường vì nay là mảnh giữa câu ở dòng tiêu đề khối — xem `vi.ts`. */
  'portfolio.priceSession': 'prices as of',
  'portfolio.priceRefresh': 'Refresh',
  'portfolio.priceStale': 'Could not refresh market prices — showing saved ones.',
  'portfolio.priceNone': 'No market price found for any ticker yet.',
  /* "Add", không phải "Run": ô này CHỌN công thức để đính kèm, việc tính xảy ra sau khi lưu. */
  'portfolio.formulas': 'Add a formula',
  'portfolio.pickFormula': 'Pick a formula',
  /* `portfolio.formulaHint` đã xoá cùng bản Việt (14/09/2026) — xem lý do ở `vi.ts`. */
  'portfolio.pickCodeFirst': 'Pick a ticker first',
  /* `portfolio.formulaNeedsCode` đã xoá cùng bản Việt (22/09/2026) — xem bia mộ ở `vi.ts`. */
  'portfolio.formulaClear': 'Clear the formula',
  'portfolio.formSubmitOpen': 'Add and open the formula',
  'portfolio.formSaveOpen': 'Save and open the formula',
  'portfolio.formulasTitle': 'Formulas this ticker can fill',
  /* `portfolio.formulasSubtitle` đã xoá cùng bản Việt (14/09/2026) — xem lý do ở `vi.ts`. */
  'portfolio.formulasFilled': 'fields prefilled',
  'portfolio.formulasNoPrice':
    'No market price for this ticker, so formulas that need one are dropped or prefill fewer fields.',

  /* Khối "Phép tính đã lưu" quay lại, không tab — lý do và ba khoá tab đã xoá ghi ở `vi.ts`. */
  'portfolio.savedTitle': 'Saved calculations',
  'portfolio.savedOpen': 'View',
  'portfolio.savedRemove': 'Delete',
  'portfolio.savedAt': 'saved',
  'portfolio.savedNeedsSeries': 'Needs price series',

  'ticker.title': 'Pick a ticker',
  /* `ticker.subtitle` đã xoá cùng bản Việt (22/09/2026) — xem bia mộ ở `vi.ts`. */
  'ticker.searchLabel': 'Search by code or company name',
  'ticker.searchPlaceholder': 'FPT, Hoa Phat…',
  'ticker.pick': 'Pick',
  'ticker.held': 'already held',
  'ticker.noData': 'no fundamentals',
  'ticker.noDataStale': 'may lack fundamentals',
  'ticker.pickHeld': 'Add more',
  'ticker.loading': 'Loading the ticker list…',
  'ticker.noMatch': 'No ticker matches. Try a shorter code, e.g. “fpt”.',
  'ticker.capped': 'tickers · type more to narrow the list',
  'ticker.retry': 'Try again',
  'ticker.errorNetwork': 'Could not load the ticker list. Check your connection and try again.',
  'ticker.errorSource':
    'The data source returned something unreadable. Try again in a few minutes.',
  'ticker.stale': 'Showing the list from a previous load — it may be out of date.',

  'series.title': 'OHLCV price series',
  'series.subtitle': 'used for Beta / Sharpe / VaR',
  'series.codeLabel': 'Ticker',
  'series.loadPreset': 'Load sample',
  'series.addRow': 'Add row',
  'series.paste': 'Paste Excel/CSV',
  'series.downloadCsv': 'Download CSV',
  'series.clear': 'Clear',
  'series.clearConfirm': 'Clear the whole table? This cannot be undone.',
  'series.removeRow': 'Delete row',
  'series.colDate': 'Date',
  'series.colOpen': 'Open',
  'series.colHigh': 'High',
  'series.colLow': 'Low',
  'series.colClose': 'Close',
  'series.colVolume': 'Volume',
  /* Nhắc đúng nhãn nút đã dịch ở `series.addRow` — có ca kiểm giữ hai khoá này khớp nhau. */
  'series.empty':
    'The table is empty. Press “Add row” to type numbers in, or load a sample dataset.',
  /* Luôn đứng dạng "X / Y usable sessions" nên số nhiều trơn đọc thuận hơn "(s)". */
  'series.usable': 'usable sessions',
  'series.rowLabel': 'Row',
  /* Không còn `series.localOnly` / `series.localTag`: màn bảng dữ liệu bỏ dòng ghi chú
     localStorage (25/08/2026). Câu tương đương ở màn Danh mục (`portfolio.localOnly`) cũng đã bỏ
     ngày 09/09/2026 — nay không màn nào còn dòng cam kết dữ liệu. */
  'series.needMore':
    'Beta and Sharpe need at least 60 sessions to mean anything statistically. Not enough yet — results will report missing data.',

  'series.chartLabel': 'Candlestick chart of the price series',
  'series.chartBlank':
    'No session can be drawn yet. Fill in a close price, or fix the flagged rows.',
  'series.sessions': 'sessions',
  'series.overPeriod': 'over the period',
  'series.rangeLabel': 'Time range',
  /* Chữ tắt tháng: bản Việt dùng "T" (tháng), bản Anh dùng "M" (month). */
  'series.range.1m': '1M',
  'series.range.3m': '3M',
  'series.range.6m': '6M',
  'series.range.all': 'All',
  'series.rangeHint': 'Most recent sessions:',
  'series.rangeAllHint': 'Every session in the table',
  'series.legendUp': 'Up session',
  'series.legendDown': 'Down session',
  'series.legendLast': 'Latest close',
  'series.legendSkipped': 'flagged sessions — not drawn, fix them in the table below',

  'series.tableTitle': 'Data table',
  'series.tableHint': 'Newest → oldest · edit straight in the cell',
  'series.checkTitle': 'Data check',
  'series.checkFloor': 'Beta, Sharpe',
  'series.checkCap': 'max',
  'series.goToRow': 'Go to row',
  'series.allGood': 'No row is flagged.',

  'xirr.tableTitle': 'Cash flows',
  'xirr.hint':
    'Negative is money out, positive is money in — the last row is usually the current value.',
  'xirr.addRow': 'Add row',
  'xirr.removeRow': 'Delete row',
  'xirr.colDate': 'Date',
  'xirr.colAmount': 'Amount (₫)',
  'xirr.rowLabel': 'Row',
  'xirr.usable': 'usable cash flows',

  'paste.title': 'Paste data',
  'paste.subtitle': 'Type into the grid, or paste from Excel with Ctrl + V',
  'paste.sample': 'Sample data',
  'paste.loadCsv': 'Load a CSV file',
  'paste.columnsBtn': 'Columns',
  'paste.clear': 'Clear all',
  'paste.viewing': 'Showing row',
  'paste.inTotal': 'of',
  'paste.badRows': 'bad row(s)',
  'paste.seeBad': 'Show',
  'paste.skipBad': 'Skip',
  'paste.emptyCell': '– –',
  'paste.gridCaption':
    'Price series grid: one session per row, the head of each column says what that column is',
  'paste.rowNo': 'Row',
  // Ví dụ giữ nguyên quy ước số Việt Nam ở cả hai bản — đây là hình dạng dữ liệu người dùng dán.
  'paste.egDate': '15/07/2026',
  'paste.egPrice': '25,4',
  'paste.egVolume': '1.000.000',
  'paste.column': 'Column',
  'paste.col.date': 'Date',
  'paste.col.open': 'Open price',
  'paste.col.high': 'High price',
  'paste.col.low': 'Low price',
  'paste.col.close': 'Close price',
  'paste.col.volume': 'Volume',
  'paste.col.ignore': 'Unused',
  'paste.validRows': 'session(s) read',
  'paste.rangeFrom': 'from',
  'paste.rangeTo': 'to',
  'paste.needClose':
    'No column is set as Close price. Tap a column name at the head of the grid and pick it.',
  'paste.reordered':
    'The data is newest first. It has been flipped so the series runs oldest to newest.',
  'paste.orderUnknown':
    'The session order could not be read. Make sure the oldest session is at the top, or the result will be wrong.',
  'paste.styleAsk': 'How should this number be read?',
  'paste.preamble': 'Dropped the leading lines that are not data:',
  'paste.skippedRows': 'row(s) skipped',
  'paste.truncated': 'Only the most recent part is kept, dropped:',
  'paste.rows': 'row(s)',
  'paste.cancel': 'Cancel',
  'paste.import': 'Import',

  'export.title': 'Export the result',
  'export.formatLabel': 'File format',
  'export.pdf': 'PDF A4',
  'export.pdfHint': 'printable',
  'export.png': 'PNG',
  'export.pngHint': 'quick to share',
  'export.withChart': 'Include the chart',
  'export.withChartHint': "An image of the formula's chart, if it has one",
  'export.chartNone': 'This formula has no chart.',
  'export.withDetails': 'Include variables & explanation',
  'export.withDetailsHint': 'What each variable means, plus the plain-language explanation',
  'export.disclaimerLocked': 'Disclaimer attached automatically',
  'export.disclaimerLockedDetail':
    'Cannot be turned off — every exported file carries the disclaimer.',
  'export.doPdf': 'Export PDF',
  'export.doPng': 'Export PNG',
  'export.failed': 'Could not export the file. Your browser may be blocking downloads.',

  'save.title': 'Save to portfolio',
  'save.subtitle': 'Keep these inputs and this result to reopen later',
  'save.nameLabel': 'Name this calculation',
  'save.nameHint': 'The name appears under Saved calculations on the Portfolio screen.',
  'save.suggestions': 'Suggested names',
  'save.submit': 'Save to portfolio',
  'save.done': 'Saved to Portfolio › Saved calculations.',
  'save.goToPortfolio': 'View in portfolio',
  'save.errEmpty': 'Give it a name first — an unnamed entry is one you will never find again.',
  'save.errDuplicate':
    'A saved calculation already uses this name. Pick another so the two do not blur together.',
  'save.errFull':
    'You already have 30 saved calculations. Delete one in the portfolio before saving another.',
  'save.errNoResult':
    'The result is currently an error, so there is nothing to save. Fix the inputs until a result appears, then save.',
  'save.failed': 'Could not save. Your browser may be blocking local storage, or it is full.',

  'switch.on': 'On',
  'switch.off': 'Off',

  'shelf.title': 'Everyday formulas',
  'shelf.seeAll': 'See all',
  'shelf.collapse': 'Show less',

  'settings.mode.title': 'Display mode',
  'settings.mode.label': 'Basic or Advanced',
  'settings.mode.hint':
    'Advanced mode adds the complex formulas, every advanced variable, the valuation chain, and the Beta / XIRR tiles in Portfolio.',
  'settings.theme.label': 'Light or Dark',
  'settings.units.title': 'Units & display',
  'settings.units.scale': 'Currency unit in tables',
  /* `settings.theme.hint` và `settings.units.scaleHint` đã xoá cùng lúc với bản Việt. */
  'settings.units.schedule': 'Trading fee schedule',
  'settings.units.scheduleHint': 'Used by the net-profit-after-fees screen. Source: Market Config.',
  'settings.data.title': 'Your data',
  'settings.about.title': 'About',

  'data.prefs': 'Display preferences',
  'data.prefs.note':
    'The display mode, language, light or dark theme, units and fee schedule you picked.',
  'data.recent': 'Search history',
  'data.recent.note':
    'Formula names you picked while searching on the Formulas or Search screen, kept so you can tap them again.',
  'data.series': 'Entered price series',
  'data.series.note':
    'The session-by-session price table you typed, pasted or loaded on the Data table screen.',
  'data.portfolio': 'Personal portfolio',
  'data.portfolio.note':
    'The tickers you added to your portfolio, with quantity, cost price and buy date.',
  'data.saved': 'Saved calculations',
  'data.saved.note':
    'The calculations you saved from a formula screen, under the names you gave them.',
  'data.drafts': 'Unsaved inputs',
  'data.drafts.note':
    'Numbers you were typing on a formula screen, kept so you need not start over after leaving.',
  'data.usage': 'Formulas you opened',
  'data.usage.note': 'Which formulas you open most, used to reorder the Everyday formulas block.',
  'data.quiz': 'Understanding check results',
  'data.quiz.note':
    'How many you got right, and which questions you missed, in the check block at the end of a formula screen.',
  'data.tickers': 'Ticker list',
  'data.tickers.note':
    'The exchange ticker list, downloaded once so ticker search is fast and works offline.',
  'data.prices': 'Cached prices',
  'data.prices.note':
    'The latest session price for the tickers in your portfolio, kept so they still show offline.',
  'data.empty': 'Nothing yet',
  'data.remove': 'Delete',
  'data.clearAll': 'Delete all data on this device',
  'data.removed': 'Deleted',
  'data.undo': 'Undo',
  'data.undoIn': 'in',
  'data.seconds': 's',
  'data.clearConfirm':
    'Delete all data saved on this device? Preferences, search history, price series and the portfolio will all be gone. This cannot be undone.',

  'about.formulas': 'Formulas ready to use',
  /* Con số ghép vào là SỐ biểu phí đã nạp, không phải biểu phí đang áp — xem SettingsScreen. */
  'about.schedule': 'Fee schedules loaded',
  'about.offline': 'Works offline',
  'about.offlineValue': 'yes',

  /* Màn "Về chúng tôi" — lý do chọn tiền tố `aboutUs.` và hai luật viết nằm ở bản tiếng Việt. */
  'aboutUs.eyebrow': 'About Faculator Finbox',
  'aboutUs.title': 'Smart financial tools for the modern investor',
  'aboutUs.lead':
    'Faculator Finbox is a web app for looking up, computing and visualizing formulas for the Vietnamese market. The core difference: formulas do not stand alone but connect into a dependency graph — the output of one step flows straight into the input of the next.',
  'aboutUs.stat.full': 'Complete',
  'aboutUs.stat.fullNote': 'Financial tools',
  'aboutUs.stat.fresh': 'Fresh data',
  'aboutUs.stat.freshNote': 'To the latest session',
  'aboutUs.stat.simple': 'Simple interface',
  'aboutUs.stat.simpleNote': 'Easy to use',

  'aboutUs.can.title': 'What the product does',
  'aboutUs.can.lookup': 'Lookup with explanation',
  'aboutUs.can.lookupNote':
    'Every formula ships with its meaning, when to use it, how to read the result and the common mistakes.',
  'aboutUs.can.instant': 'Instant calculation',
  'aboutUs.can.instantNote':
    'Results and charts change as you type; there is no Calculate button to press.',
  'aboutUs.can.chain': 'Controlled chaining',
  'aboutUs.can.chainNote':
    'The output of one formula feeds straight into the input of the next, and you can still override it with your own number.',
  'aboutUs.can.fees': 'Vietnamese market fees and taxes',
  'aboutUs.can.feesNote':
    'Trading fees, income tax and dividend tax follow the domestic rules, declared in one place in Market Config.',
  'aboutUs.can.data': 'Sample data and flexible input',
  'aboutUs.can.dataNote':
    'Load a sample data set by ticker, or type and paste your own price table.',
  'aboutUs.can.portfolio': 'A personal portfolio on your device',
  'aboutUs.can.portfolioNote':
    'Track the tickers you hold and their cost basis, with XIRR and related measures, without having to sign in.',

  'aboutUs.arch.title': 'Client-only architecture (zero backend)',
  'aboutUs.arch.ui': 'Presentation layer',
  'aboutUs.arch.uiNote': 'An SPA/PWA running in the browser, designed mobile-first.',
  'aboutUs.arch.calc': 'Calculation layer',
  'aboutUs.arch.calcNote': 'The formula engine and the dependency graph between steps.',
  'aboutUs.arch.registry': 'Formula Registry',
  'aboutUs.arch.registryNote': 'Definitions of formulas, variables, units and explanatory content.',
  'aboutUs.arch.provider': 'DataProvider',
  'aboutUs.arch.providerNote':
    'Supplies price series and sample data, isolating the data source from the three layers above.',

  'aboutUs.yourData.title': 'Your data',
  'aboutUs.yourData.noAccount': 'No account, no server',
  'aboutUs.yourData.noAccountNote':
    'The app runs entirely in the browser: there is no sign-up step and no account server. Your portfolio and display preferences live in the localStorage of this device, so clearing browser data or switching machines leaves them behind.',
  'aboutUs.yourData.sources': 'Public reference sources',
  'aboutUs.yourData.sourcesNote':
    'Every formula names its source — a textbook, an accounting standard or a legal document — so you can check it. Fee and tax constants come from Market Config: change them in one place and the whole system follows.',

  'aboutUs.not.title': 'What Faculator is not',
  'aboutUs.not.broker': 'Not a brokerage',
  'aboutUs.not.brokerNote': 'It places no orders and connects to no securities account.',
  'aboutUs.not.realtime': 'Not a real-time price board',
  'aboutUs.not.realtimeNote':
    'The market price on the Portfolio tab is the latest session price, pulled from a data provider and always stamped with its session date. It is not a live order-book feed.',
  'aboutUs.not.history': 'Not a historical data warehouse',
  'aboutUs.not.historyNote':
    'The bundled sample data is only enough to show how a formula runs. To compute on a real, long price series you enter or paste it into the Data table yourself.',
  'aboutUs.not.advice': 'Not an investment advisory tool',
  'aboutUs.not.adviceNote':
    'Every number on screen is a calculation for reference, not a buy or sell recommendation.',

  'aboutUs.cta.eyebrow': 'Start today',
  'aboutUs.cta.title': 'Master the market with Faculator Finbox',
  'aboutUs.cta.note':
    'No sign-up needed. Open a formula, load a sample data set by ticker and watch the result update instantly — fully working offline too.',
  'aboutUs.cta.action': 'Open it now',

  'page.formulas.title': 'Formulas',
  'page.settings.title': 'Settings',

  'notFound.title': 'Page not found',
  'notFound.reason': 'The address may be mistyped, or the page has moved.',
  'notFound.suggest':
    'Try finding the formula by name — typing without Vietnamese accents still works.',
  'notFound.search': 'Find a formula',
  'notFound.formulas': 'Go to the formula list',

  /* ── Understanding check block (WF-19) ────────────────────────────────────────────────── */
  'quiz.title': 'Practice',
  /* Mộ chí: `quiz.lead` bỏ hẳn 24/09/2026 — lý do ghi ở `vi.ts`. */
  'quiz.countUnit': 'question(s)',
  'quiz.step': 'Question {n} / {total}',
  'quiz.start': 'Start the check',
  'quiz.startFew': 'Try a question',
  'quiz.check': 'Check',
  'quiz.exit': 'Exit',
  'quiz.skip': 'Skip this question',
  'quiz.skippedNote': 'A ? marks a question you skipped — unanswered, so it counts as not known.',
  'quiz.next': 'Next question',
  'quiz.seeResult': 'See result',
  'quiz.retry': 'Start over',
  'quiz.reviewWrong': 'Review what you missed',
  'quiz.pickAll': 'This one has more than one right answer — pick them all.',
  'quiz.slotLabel': 'Slot {n} in the formula',
  'quiz.workedResult': 'Result',
  'quiz.correctSlots': 'Correct order',
  /* Mộ chí: `quiz.numberPlaceholder` bỏ 24/09/2026 — lý do ghi ở `vi.ts`. */
  /* Mộ chí: `quiz.chooseFirst`, `quiz.enterFirst`, `quiz.decimalHint` bỏ 24/09/2026 — lý do ở `vi.ts`. */
  /* Mộ chí: `quiz.yourAnswer`, `quiz.tolerance` bỏ 24/09/2026 — lý do ghi ở `vi.ts`. */
  'quiz.right': 'Correct',
  'quiz.wrong': 'Wrong',
  /* Mộ chí: `quiz.correctAnswer` bỏ 24/09/2026 — lý do ghi ở `vi.ts`. */
  'quiz.whyRight': 'Why this is right',
  'quiz.whyWrong': 'Why this is wrong',
  'quiz.rule': 'The rule in force',
  /* Mộ chí: `quiz.evidence.*` (3 khoá) bỏ 24/09/2026 — lý do ghi ở `vi.ts`. */
  'quiz.giai.tinh': 'Computes',
  'quiz.giai.congThuc': 'Formula',
  'quiz.giai.thaySo': 'Substituting',
  'quiz.giai.ketQua': 'Result',
  'quiz.source': 'Source',
  'quiz.effectiveFrom': 'In force since',
  'quiz.result': 'Your result',
  /* Mộ chí: `quiz.localOnly` bỏ 24/09/2026 — lý do ghi ở `vi.ts`. */
  'quiz.lastTime': 'Last attempt',
  'quiz.empty.title': 'No questions for this formula yet',
  'quiz.empty.body':
    'We only write a question when a real source records where people misread the formula. This one has none yet.',
  'quiz.few.body':
    'Only a few questions here, because that is all the sourced material there is — we do not pad it out.',
  'quiz.notTranslated': 'These questions are not translated yet — showing the Vietnamese text.',
  /* Mộ chí: `quiz.sourceKind.*` bị bỏ 24/09/2026 — lý do ghi ở `vi.ts`. */
  /* Mộ chí: `quiz.kind.*` (5 khoá) bỏ 24/09/2026 — lý do ghi ở `vi.ts`. */
};
