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
 * (`page.tsx`), `StaticFormulaList` (fallback trước hydrate), file PDF/PNG xuất ra
 * (`draw-card.ts`, `ExportSheet.tsx` — tài liệu xuất luôn là văn bản tiếng Việt trọn vẹn, kể cả
 * câu miễn trừ đính kèm vẫn lấy `DISCLAIMER_VI`), và tên công ty mẫu trong `samples.ts`.
 *
 * Bẫy số ít/số nhiều: nhiều khoá đứng ngay sau một con số ghép ở call site ("12 kết quả"),
 * mà từ điển phẳng không phân nhánh theo số được. Khoá nào con số có thể bằng 1 thì dùng
 * dạng "(s)"; khoá nào con số luôn ≥ 2 (loan.condensed, home.browse.unit) thì để số nhiều trơn.
 */

import type { vi } from './vi';

export const en: Partial<Record<keyof typeof vi, string>> = {
  'app.name': 'Faculator Finbox',
  'app.brand': 'Faculator',

  'nav.primary': 'Primary navigation',
  'nav.skipToContent': 'Skip navigation, go to content',
  'nav.home': 'Home',
  'nav.formulas': 'Formulas',
  'nav.portfolio': 'Portfolio',
  'nav.settings': 'Settings',
  /* Cố ý khác `nav.formulas` — cùng lý do bản tiếng Việt: màn chi tiết đã có khối "Formula". */
  'nav.backToList': 'Formula list',
  'nav.backToFormula': 'Back to formula',

  'mode.label': 'Display mode',
  'mode.basic': 'Basic',
  'mode.advanced': 'Advanced',

  'lang.vi': 'VI',
  'lang.en': 'EN',
  'lang.switchToEn': 'Switch to English',
  'lang.switchToVi': 'Switch to Vietnamese',
  'lang.enPartial':
    'The English version is a work in progress — untranslated text stays in Vietnamese',

  'offline.title': 'Working offline',
  'offline.detail':
    'No internet connection. Every calculation still runs because the calculator lives on your device.',

  // Miễn trừ trên MÀN theo locale (FR-24, DisclaimerBar.tsx dùng lá <T>). Câu đính vào file
  // xuất KHÔNG đọc khoá này — nó luôn lấy DISCLAIMER_VI thẳng, vì tài liệu xuất ra cố ý luôn
  // tiếng Việt (xem docblock đầu file). Hai câu diễn cùng một ý, không phải bản dịch từng chữ
  // của nhau, nên không có ca kiểm nào neo chúng lại với nhau.
  'disclaimer.text': 'Results are for reference only, not investment advice.',

  'search.label': 'Find a formula',
  'search.placeholder': 'Formula name, e.g. P/E or dinh gia',
  'search.hint':
    'Typing without Vietnamese accents still works: “dinh gia” finds “Định giá”, “p e” finds “P/E”.',
  'search.clear': 'Clear the search box',

  'search.recent.title': 'Recent searches',
  'search.recent.clear': 'Clear history',
  'search.tip': 'Type a formula name, an abbreviation, or the thing you want to calculate.',
  'search.matchNote': 'Accent-insensitive match for',
  'search.resultCount': 'result(s)',
  'search.noMatch': 'Nothing found for',
  'search.suggest.title': 'You might need',
  'search.seeAll': 'Clear search · view all',
  'search.hot.title': 'Hot categories',

  'filter.segment.label': 'Segment',
  'filter.segment.all': 'All',
  'filter.segment.stock': 'Stocks',
  'filter.segment.personal': 'Personal',
  'filter.category.label': 'Formula group',
  'filter.category.all': 'All groups',
  'filter.reset': 'Clear filters',
  'sort.label': 'Sort',
  'sort.featured': 'Most practical first',
  'sort.az': 'Name A → Z',
  'sort.za': 'Name Z → A',

  'level.basic': 'Basic',
  'level.advanced': 'Advanced',

  'list.label': 'Formula list',
  'list.count': 'formula(s)',
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
  'input.sliderMin': 'min',
  'input.sliderMax': 'max',
  'input.sliderStep': 'step',
  'input.unitLabel': 'Display unit',
  'unit.scale.billion': 'billion ₫',
  'unit.scale.million': 'million ₫',
  'unit.scale.dong': '₫',
  'input.override': 'Override',
  'input.revert': 'Undo',
  'input.overridden': 'overridden',
  'input.openUpstream': 'Open the source formula',
  'input.autoFrom': 'Auto-filled from',

  'result.eyebrow': 'RESULT',
  'result.live': 'updates as you type',
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
  'example.editHint': 'Edit right here — swap in the real numbers of the stock you follow.',
  'example.original': 'Original example gives:',
  'example.reset': 'Back to example numbers',
  'source.title': 'References',
  'flow.title': 'Calculation flow',
  'flow.cyclicWarning': 'A circular dependency prevents ordering these steps:',
  'flow.branch': 'another branch',
  'flow.stepError': 'error',

  'chain.title': 'Formula chain',
  'chain.intro':
    'Each step feeds its result straight into the next. Change a number upstream and the whole chain recomputes.',
  'chain.upstreamHeading': 'Steps before — supply numbers to this formula',
  'chain.downstreamHeading': "Steps after — use this formula's result",
  'chain.openStep': "Open this step's own screen",
  'stat.eyebrow': 'METRIC',

  'detail.loadPreset': 'Load sample',
  'detail.preset': 'Loaded',
  'detail.jumpToExample': 'See the worked example ↓',
  'detail.fundamentalsSource':
    "This ticker's fundamentals (EPS, book value, shares, dividend…) come from real Finbox_v2 data, checked on",
  'detail.tickerLoading': 'fetching live data for this ticker…',
  'detail.tickerFailed':
    'could not fetch data for this ticker — enter values by hand, or tap "Load sample" to use the bundled dataset.',
  'detail.export': '↓ Export',
  'detail.meaning': 'Meaning',
  'detail.formula': 'Formula',
  'detail.inputs': 'Inputs',
  'detail.hiddenInBasic': 'advanced variable(s) hidden — switch mode to see them',
  'detail.constantSource': 'Market Config · CON-10',
  'detail.constantsInUse': 'Calculated at these rates',
  'detail.constantSince': 'in effect since',
  'detail.pasteSeries': 'Paste a price series from Excel',
  'detail.loadExample': 'View illustrative example',
  'detail.exampleLoaded': 'Illustrative example loaded ✓',
  'detail.exampleSeriesNote':
    "This is a purpose-built illustrative series, not a real stock's price history.",
  'detail.exampleSeriesLabel': 'the illustrative example',
  'detail.applyToTable': 'Apply to the data table',
  'detail.appliedToTable': 'Applied ✓',
  'detail.seriesLoaded': 'Price sessions loaded:',
  'detail.openDataTable': 'Open the data table →',
  'detail.chart': 'Chart',
  'chart.sweepLabel': 'See how the result changes with',
  'chart.showData': 'View the numbers',
  'chart.tableCaption': 'Data',
  'chart.applyHintTimeAxis':
    'The axis is time, so clicking won\'t write anything — switch "See how the result changes with" above to a variable to apply a clicked value.',
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
  'loan.schedule': 'Repayment schedule',
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
  'preset.subtitle': 'Static sample data via DataProvider · no real-time prices in this version',
  'preset.searchLabel': 'Find a ticker',
  'preset.searchPlaceholder': 'Find a ticker…',
  'preset.load': 'Load',
  'preset.noMatch': 'No ticker matches. Try a shorter code, e.g. “fpt”.',
  'preset.editableAfterLoad': 'After loading, every field can still be edited one by one.',
  'preset.draftTag': 'draft data',
  'preset.draftTitle': 'Fabricated numbers, not yet checked against real statements.',
  'preset.draftDetail': 'For trying the feature out only. Do not base decisions on the results.',
  'preset.draftExport':
    'Input numbers come from a fabricated sample dataset, not yet checked against real statements.',

  'portfolio.title': 'My portfolio',
  'portfolio.subtitle': 'Stored on this device · no sign-in needed',
  'portfolio.totalValue': 'Total value',
  'portfolio.beta': 'Portfolio beta',
  'portfolio.xirr': 'Portfolio XIRR',
  'portfolio.count': 'Tickers',
  'portfolio.holdings': 'Holdings',
  'portfolio.shares': 'sh',
  'portfolio.costPrice': 'cost',
  'portfolio.weight': 'weight',
  'portfolio.add': 'Add a ticker',
  'portfolio.remove': 'Remove',
  'portfolio.empty': 'Nothing here yet. Add your first ticker to see total value and weights.',
  'portfolio.localTag': 'LOCAL',
  'portfolio.localOnly':
    'Quantities and cost prices stay on this device only (localStorage). Only the ticker codes are sent to Finbox to look up market prices.',
  'portfolio.formCode': 'Ticker',
  'portfolio.formQuantity': 'Shares held',
  'portfolio.formCostPrice': 'Cost per share (₫)',
  'portfolio.formBuyDate': 'Purchase date',
  'portfolio.formBeta': 'Beta (leave blank if unknown)',
  'portfolio.formSubmit': 'Add to portfolio',
  'portfolio.formCancel': 'Cancel',
  'portfolio.betaHint':
    'Beta cannot be computed automatically yet — it needs return series for both the stock and the market index. Enter it by hand if you already have it.',
  'portfolio.priceNote': 'Market prices come from Finbox at the latest session, not live quotes.',
  'portfolio.pickCode': 'Pick a ticker',
  'portfolio.priceLoading': 'Fetching market prices…',
  'portfolio.priceFailed': 'Could not fetch market prices from Finbox.',
  'portfolio.priceRetry': 'Try again',

  'portfolio.totalCost': 'Invested',
  'portfolio.gain': 'Gain / loss',

  'portfolio.cellQuantity': 'Quantity',
  'portfolio.marketPrice': 'Market price',
  'portfolio.priceMissing': 'no price yet',
  'portfolio.betaShort': 'beta',
  'portfolio.edit': 'Edit',
  'portfolio.editHint':
    'Change the quantity, cost price, purchase date or beta. To change the ticker itself, remove it and add it again.',
  'portfolio.formSave': 'Save changes',
  'portfolio.mergeNote':
    'This ticker is already in the portfolio. Adding again will add up the quantity and recalculate the average cost price — it will not create a second row. To correct the existing numbers instead, cancel this form and tap the ticker in the list.',
  'portfolio.formMerge': 'Add to the existing holding',

  'portfolio.errCode': 'Pick a ticker first.',
  'portfolio.errQuantity': 'Enter the number of shares held, above 0.',
  'portfolio.errCostPrice': 'Enter the cost per share, above 0.',
  'portfolio.errBeta': 'Beta must be a number, e.g. 1.1 — or leave it blank if unknown.',
  'portfolio.errFull': 'The portfolio is full at 50 holdings. Remove one before adding another.',

  'portfolio.priceSession': 'Session of',
  'portfolio.priceRefresh': 'Refresh',
  'portfolio.priceStale': 'Could not refresh market prices — showing saved ones.',
  'portfolio.formulas': 'Run a formula',
  'portfolio.formulasTitle': 'Formulas this ticker can fill',
  'portfolio.formulasSubtitle': 'Open a formula with this ticker’s data already filled in',
  'portfolio.formulasFilled': 'fields prefilled',
  'portfolio.formulasNoPrice':
    'No market price for this ticker, so formulas that need one are dropped or prefill fewer fields.',

  'ticker.title': 'Pick a ticker',
  'ticker.subtitle': 'Every tradable ticker, from Finbox',
  'ticker.searchLabel': 'Search by code or company name',
  'ticker.searchPlaceholder': 'FPT, Hoa Phat…',
  'ticker.pick': 'Pick',
  'ticker.held': 'already held',
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
  'series.localOnly':
    'Price series are stored on this device only (localStorage). Nothing is sent to a server.',
  'series.localTag': 'LOCAL',
  'series.needMore':
    'Beta and Sharpe need at least 60 sessions to mean anything statistically. Not enough yet — results will report missing data.',

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
  'paste.subtitle': 'OHLC price series pasted straight from Excel or a CSV file',
  'paste.areaLabel': 'Paste your data here',
  'paste.placeholder': '15/07\t25.10\t25.60\t24.90\t25.40',
  'paste.assignColumns': 'Assign columns',
  'paste.column': 'Column',
  'paste.col.date': 'Date',
  'paste.col.open': 'Open',
  'paste.col.high': 'High',
  'paste.col.low': 'Low',
  'paste.col.close': 'Close',
  'paste.col.volume': 'Vol',
  'paste.col.ignore': 'Skip',
  'paste.previewLabel': 'Preview',
  'paste.previewCaption': 'First few sessions parsed from the pasted data',
  'paste.previewMore': 'more row(s) not shown here, but they will still be imported.',
  'paste.validRows': 'valid row(s), ready to import',
  'paste.skippedRows': 'row(s) skipped',
  'paste.truncated': 'Trimmed the part above the cap:',
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
  'export.chartPending': 'The chart will be added in a later release.',
  'export.withDetails': 'Include variables & explanation',
  'export.withDetailsHint': 'What each variable means, plus the plain-language explanation',
  'export.disclaimerLocked': 'Disclaimer attached automatically',
  'export.disclaimerLockedDetail':
    'Cannot be turned off — every exported file carries the disclaimer.',
  'export.doPdf': 'Export PDF',
  'export.doPng': 'Export PNG',
  'export.failed': 'Could not export the file. Your browser may be blocking downloads.',

  'switch.on': 'On',
  'switch.off': 'Off',

  'home.h1': 'Vietnamese stock and personal-finance formula library',
  'home.search.resultsHeading': 'Search results',
  'home.search.seeAll': 'View all',
  'home.search.results': 'result(s)',
  'home.search.dropFilter': 'Drop the filter',
  'home.featured.title': 'Everyday formulas',
  'home.browse.title': 'Browse by group',
  'home.browse.unit': 'formulas',
  'home.segment.stock': 'Stocks',
  'home.segment.personal': 'Personal finance',
  'home.progress': 'The library is filling in step by step — now at',
  'home.tools.title': 'Tools',
  'home.tools.data': 'Data table',
  'home.tools.dataHint': 'Enter or paste OHLCV price series used for Beta, Sharpe, VaR',

  'settings.mode.title': 'Display mode',
  'settings.mode.label': 'Basic or Advanced',
  'settings.mode.hint': 'Basic mode hides advanced variables and keeps the explanation open.',
  'settings.units.title': 'Units & display',
  'settings.units.scale': 'Money unit in tables',
  'settings.units.scaleHint':
    'Only changes how numbers are shown in tables. The maths still runs in đồng, and input fields keep the Vietnamese convention.',
  'settings.units.schedule': 'Trading fee schedule',
  'settings.units.scheduleHint': 'Used by the net-profit-after-fees screen. Source: Market Config.',
  'settings.data.title': 'Data on this device',
  'settings.data.note': 'Everything below lives in your browser and is never sent anywhere.',
  'settings.about.title': 'About',

  'data.prefs': 'Display preferences',
  'data.recent': 'Search history',
  'data.series': 'Entered price series',
  'data.portfolio': 'Personal portfolio',
  'data.empty': 'nothing saved',
  'data.chars': 'characters',
  'data.remove': 'Delete',
  'data.clearAll': 'Delete all data on this device',
  'data.clearConfirm':
    'Delete all data saved on this device? Preferences, search history, price series and the portfolio will all be gone. This cannot be undone.',

  'about.formulas': 'Formulas ready to use',
  /* Con số ghép vào là SỐ biểu phí đã nạp, không phải biểu phí đang áp — xem SettingsScreen. */
  'about.schedule': 'Fee schedules loaded',
  'about.offline': 'Works offline',
  'about.offlineValue': 'yes',

  'page.formulas.title': 'Formulas',
  'page.settings.title': 'Settings',

  'notFound.title': 'Page not found',
  'notFound.reason': 'The address may be mistyped, or the page has moved.',
  'notFound.suggest':
    'Try finding the formula by name — typing without Vietnamese accents still works.',
  'notFound.search': 'Find a formula',
  'notFound.home': 'Back to the home page',
};
