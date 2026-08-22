'use client';

import Link from 'next/link';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

import {
  FORMULA_MODULES,
  MARKET_CONFIG,
  PRICE_SERIES_KEY,
  ROUTES,
  SAMPLE_DATA,
  cashflowsOf,
  chainFor,
  constantsUsedBy,
  defaultInputs,
  emptyCashflowRow,
  findFormulaModule,
  formatCalcOutput,
  formatIsoDate,
  hasDraftData,
  needsPriceSeries,
  parseStoredSeries,
  presetInputs,
  runChain,
  runFormula,
  scheduleOrDefault,
  serializeStoredSeries,
  variablesForLevel,
} from '@/application';
import type {
  CalcContext,
  CalcInputs,
  CalcOutput,
  CashflowRow,
  ChainInputs,
  ChainOverrides,
  FormulaModule,
  FormulaSpec,
  Preset,
  SeriesRow,
} from '@/application';
import { usePick, usePreferences, useT } from '@/application/preferences-context';
import { LinkedInput, VariableField, isWideControl } from '@/ui/inputs';
import { Button } from '@/ui/primitives';
import {
  ConstantsNote,
  ErrorState,
  ExampleBlock,
  ExplanationAccordion,
  ResultBlock,
  SourceBlock,
  VariableTable,
} from '@/ui/result';
import { FormulaChart, hasChart } from '@/ui/charts';
import { BackLink, DisclaimerBar } from '@/ui/navigation';
import { ExportSheet, PasteImportSheet, PresetSheet } from '@/ui/sheets';
import {
  ChainPanel,
  DetailBody,
  DetailConfig,
  hasConfigBlock,
  hasCustomBody,
  ownsResult,
} from '@/ui/screens';

import styles from './FormulaDetail.module.css';

/**
 * Spec của cả thư viện, dựng một lần ngoài component — `chainFor()` cần nhìn toàn Registry để
 * biết công thức nào cấp số liệu cho công thức nào.
 *
 * Đọc từ `FORMULA_MODULES` chứ không từ `FORMULAS`: màn này vốn đã kéo `FORMULA_MODULES` vào gói
 * qua `findFormulaModule()`, nên đây là 0 byte thêm.
 */
const ALL_SPECS = FORMULA_MODULES.map((module) => module.spec);

/**
 * Chuỗi giá đóng cửa VN-Index — tính MỘT LẦN ngoài component, giống `ALL_SPECS`.
 *
 * Khác `bars`/`series` vốn phụ thuộc trạng thái người dùng (đã dán chuỗi hay chưa, đang xem mã
 * nào), đây là một chuỗi CỐ ĐỊNH (FR-17) nên luôn có mặt trong `ctx` — công thức Beta không cần
 * người dùng làm gì thêm để có `ctx.marketSeries`.
 */
const VN_INDEX_CLOSES = SAMPLE_DATA.vnIndex()
  .map((bar) => bar.close)
  .filter((close): close is number => typeof close === 'number' && close > 0);

/*
 * Danh sách điều khiển chiếm trọn hàng từng nằm ở đây; nay dùng chung tại
 * `isWideControl()` trong `@/ui/inputs` vì khối chuỗi WF-04 cũng cần đúng luật ấy và đã bỏ sót
 * nó một lần — xem docblock của hàm.
 */

export interface FormulaDetailProps {
  spec: FormulaSpec;
  /**
   * Ngày tra hằng số thuế & phí, cố định lúc build.
   * Tầng Domain không tự lấy ngày hệ thống (NFR-REL-03), và nếu lấy `new Date()` ở đây thì
   * HTML sinh lúc build khác HTML sinh lúc chạy — lệch hydration.
   */
  asOf: string;
  /**
   * Ký hiệu toán học đã dựng sẵn lúc build — chuỗi MathML, xem `latex-html.ts`.
   *
   * Nhận qua prop chứ không tự dựng ở đây: component này có `'use client'`, nên gọi `katex` trong
   * nó là kéo ~280 kB thư viện vào gói của trình duyệt. Dựng ở `page.tsx` thì HTML vào thẳng file
   * tĩnh và phía máy khách tốn 0 byte JS.
   */
  latexHtml: string;
}

type SheetKind = 'preset' | 'paste' | 'export';

/**
 * Màn WF-03 Chi tiết công thức — gói WBS 3.2.1.
 *
 * Chín khối đúng thứ tự wireframe. Đây là màn dùng nhiều nhất và là khuôn cho cả 108 công
 * thức, nên **không có gì viết cứng cho một công thức cụ thể**: ô nhập sinh từ `VariableSpec`
 * (FR-05), kết quả đi qua `runFormula()`, diễn giải và nguồn đọc từ Registry.
 *
 * Hai công thức có khối kết quả riêng (WF-08 phí & thuế, WF-14 lịch trả nợ) được nạp qua
 * `DetailBody`, tải trễ theo id — đúng chữ "tải trễ khối nặng" của gói 3.2.1.
 */
export function FormulaDetail({ spec, asOf, latexHtml }: FormulaDetailProps) {
  const { mode, feeScheduleId } = usePreferences();
  const t = useT();
  const pick = usePick();

  const [inputs, setInputs] = useState<Record<string, number>>(() => defaultInputs(spec));
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  /**
   * Ba bottom sheet chỉ được DỰNG khi người dùng mở lần đầu, rồi giữ lại.
   *
   * Trước đợt này cả ba luôn nằm trong DOM (chỉ đóng bằng thuộc tính `open` của `<dialog>`), nên
   * mỗi lần vào màn chi tiết là dựng thừa ~150 nút — riêng `ExportSheet` còn gọi
   * `buildExportContent()` ở MỖI lượt dựng, tức mỗi phím gõ, để dựng một tài liệu không ai xem.
   *
   * Giữ lại sau khi đã mở chứ không tháo lúc đóng: bên trong sheet có lựa chọn của người dùng
   * (định dạng xuất, các ô tick) mà tháo đi là mất.
   */
  const [mountedSheets, setMountedSheets] = useState<ReadonlySet<SheetKind>>(() => new Set());

  function openSheet(kind: SheetKind): void {
    setMountedSheets((current) => (current.has(kind) ? current : new Set(current).add(kind)));
    setSheet(kind);
  }
  const [loadedPreset, setLoadedPreset] = useState<string | null>(null);
  const [seriesCount, setSeriesCount] = useState<number | null>(null);
  const [bars, setBars] = useState<ReadonlyArray<SeriesRow> | null>(null);
  /**
   * Ghi đè `ctx.marketSeries` (VN-Index) — CHỈ khi người dùng vừa bấm "Xem ví dụ minh hoạ" trên
   * một công thức có khai `example.marketSeries` (hiện chỉ `beta`). `null` là trạng thái bình
   * thường của 107 công thức còn lại, dùng luôn `VN_INDEX_CLOSES` cố định như trước đợt này.
   *
   * Vì sao Beta cần thêm biến này mà 34 công thức chuỗi khác thì không: Beta đọc CẢ HAI chuỗi
   * (`ctx.series` của cổ phiếu và `ctx.marketSeries` của VN-Index) trong cùng một phép hồi quy.
   * Nạp đúng `example.series` (vế cổ phiếu) mà vẫn giữ `VN_INDEX_CLOSES` PRNG bịa (vế thị trường)
   * thì hồi quy KHÔNG ra được `example.expected` — hai vế phải cùng là số dựng tay mới khớp nhau.
   */
  const [marketSeriesOverride, setMarketSeriesOverride] = useState<ReadonlyArray<number> | null>(
    null,
  );
  /** Đang bày chuỗi minh hoạ (không phải bộ mẫu công ty thật, không phải chuỗi người dùng dán). */
  const [exampleLoaded, setExampleLoaded] = useState(false);
  /**
   * Đã ghi `bars` hiện tại vào bảng WF-05 (`/du-lieu/`) hay chưa — nhãn nút "Áp dụng vào bảng
   * dữ liệu" đổi thành "Đã áp dụng ✓" sau khi bấm, cùng nếp với `loadedPreset`. Đặt lại về false
   * mỗi khi `bars` đổi (nạp mẫu khác, dán chuỗi khác) — xem effect ngay dưới `applyToDataTable`.
   */
  const [appliedToTable, setAppliedToTable] = useState(false);

  /*
   * ── Trạng thái của chuỗi công thức — WF-04, FR-15 (gói 5.2.3) ───────────────────────────────
   *
   * Hai kho tách nhau, và tách có lý do:
   *   · `chainInputs` giữ ô nhập của các bước KHÁC (beta của CAPM, thị giá của Biên an toàn…).
   *     Ô của công thức đang xem vẫn nằm ở `inputs` phía trên — một con số một chỗ giữ.
   *   · `overrides` giữ riêng những ô móc nối mà người dùng bấm Ghi đè. Không trộn vào ô nhập
   *     thường: `resolveLinked()` phân biệt "chưa ghi đè" với "ghi đè đúng bằng giá trị tự động",
   *     và trộn hai kho lại là mất đúng sự phân biệt ấy — nút Hoàn tác sẽ không còn gì để hoàn.
   */
  const [chainInputs, setChainInputs] = useState<ChainInputs>({});
  const [overrides, setOverrides] = useState<ChainOverrides>({});

  /*
   * Bảng dòng tiền có ngày — riêng cho XIRR (`ctx.cashflows`). Sống ở ĐÂY, không trong thân
   * riêng `XirrBody`, vì cùng một lý do `bars` sống ở đây: `output` và chuỗi chữ ẩn dưới khối
   * Kết quả (dùng cho bộ kiểm) đều tính từ `ctx` của component này — để state ở con thì hai
   * nơi tính ra hai số khác nhau cho cùng một công thức, đúng loại lỗi "hai chỗ nói hai chuyện"
   * dự án đã né ở `historyPoints`/`ResultBlock`. Mặc định hai dòng trống — đúng số ít nhất
   * XIRR cần, để người dùng thấy ngay khuôn bảng thay vì một danh sách rỗng.
   */
  const [cashflowRows, setCashflowRows] = useState<ReadonlyArray<CashflowRow>>(() => [
    emptyCashflowRow(),
    emptyCashflowRow(),
  ]);

  /*
   * Chuỗi giá cho công thức nhóm Kỹ thuật / Rủi ro (FR-12) đọc từ bảng WF-05 trong
   * localStorage — trong effect chứ không lúc khởi tạo state, vì HTML build sẵn không có
   * localStorage và lần render đầu ở máy khách phải giống hệt lúc build (bài học đợt 2).
   */
  useEffect(() => {
    try {
      const stored = parseStoredSeries(window.localStorage.getItem(PRICE_SERIES_KEY));
      if (stored.rows.length > 0) setBars(stored.rows);
    } catch {
      // Trình duyệt chặn localStorage thì coi như chưa có chuỗi — công thức chuỗi sẽ tự
      // báo MISSING_SERIES, đúng đường FR-06.
    }
  }, []);

  const ctx = useMemo<CalcContext>(
    () => ({
      asOf,
      schedule: scheduleOrDefault(MARKET_CONFIG, feeScheduleId),
      marketSeries: marketSeriesOverride ?? VN_INDEX_CLOSES,
      cashflows: cashflowsOf(cashflowRows),
      ...(bars === null
        ? {}
        : {
            bars,
            series: bars
              .map((bar) => bar.close)
              .filter((close): close is number => typeof close === 'number' && close > 0),
          }),
    }),
    [asOf, feeScheduleId, bars, cashflowRows, marketSeriesOverride],
  );

  const formula = findFormulaModule(spec.id);
  const soloOutput: CalcOutput = useMemo(
    () =>
      formula === undefined
        ? { value: null, unit: spec.resultUnit, warning: MISSING_CALCULATOR }
        : runFormula(formula, inputs, ctx),
    [formula, inputs, ctx, spec.resultUnit],
  );

  /*
   * ── Chuỗi công thức: chỉ dựng ở chế độ Nâng cao, và chỉ với công thức có dính cạnh ──────────
   *
   * `chainFor()` trả mảng rỗng cho 101 trên 108 công thức, nên `inChain` tắt và toàn bộ phần dưới
   * là số không: không tính chuỗi, không dựng khối, không tải chunk nạp trễ. Ở chế độ Cơ bản thì
   * mọi công thức đều đi đường cũ y hệt trước đợt này — đó cũng là lý do 4 ca kiểm quét cả 108
   * màn không phải sửa một dòng nào.
   */
  const chainSpecs = useMemo(() => chainFor(ALL_SPECS, spec.id), [spec.id]);
  const inChain = mode === 'advanced' && chainSpecs.length > 0;

  const chainModules = useMemo(
    () =>
      chainSpecs
        .map((step) => findFormulaModule(step.id))
        .filter((found): found is FormulaModule => found !== undefined),
    [chainSpecs],
  );

  /** Ô nhập của cả chuỗi: bước đang xem lấy từ `inputs`, các bước khác lấy từ `chainInputs`. */
  const allChainInputs = useMemo<ChainInputs>(() => {
    const map: Record<string, CalcInputs> = {};
    for (const step of chainModules) {
      const id = step.spec.id;
      map[id] = id === spec.id ? inputs : (chainInputs[id] ?? defaultInputs(step.spec));
    }
    return map;
  }, [chainModules, chainInputs, inputs, spec.id]);

  const chain = useMemo(
    () =>
      inChain
        ? runChain({ modules: chainModules, inputs: allChainInputs, overrides, ctx })
        : undefined,
    [inChain, chainModules, allChainInputs, overrides, ctx],
  );

  const chainStep = chain?.byId.get(spec.id);

  /**
   * Kết quả bày ra màn.
   *
   * Trong chuỗi thì lấy kết quả CỦA CHUỖI, không phải kết quả chạy riêng: đó là chỗ duy nhất
   * biết thượng nguồn có lỗi hay không, và cũng là chỗ duy nhất trả về cảnh báo `INHERITED`
   * thay vì "Còn thiếu: …" cho một ô người dùng không hề bỏ trống (FR-15).
   */
  const output: CalcOutput = chainStep?.output ?? soloOutput;

  /** Giá trị mà các ô móc nối của công thức đang xem đang thật sự mang. */
  const linkedValues = useMemo<Record<string, number>>(() => {
    const values: Record<string, number> = {};
    for (const field of chainStep?.fields ?? []) {
      if (field.linked.value !== null) values[field.spec.key] = field.linked.value;
    }
    return values;
  }, [chainStep]);

  /** Bộ số thật sự đang dùng cho công thức đang xem — ô thường cộng ô móc nối đã giải xong. */
  const effectiveInputs = useMemo(() => ({ ...inputs, ...linkedValues }), [inputs, linkedValues]);

  /*
   * ── Biểu đồ chạy sau một nhịp, để lượt gõ không bị nghẽn ────────────────────────────────────
   *
   * Từ khi ô số đẩy giá trị lên theo TỪNG PHÍM (xem `NumberInput`), mỗi phím gõ là một lượt dựng
   * lại cả màn. Khối Kết quả rẻ tới mức không đáng bàn — `runFormula()` đo được 0,001–0,016 ms.
   * Biểu đồ thì không: `buildChartModel()` phải chạy công thức vài chục tới vài trăm lần để quét
   * đường độ nhạy, đo trên chính Registry này ra **7,5 ms (P/E) · 11,3 ms (lịch trả nợ) ·
   * 15,6 ms (WACC)**. Một khung hình 60 Hz chỉ có 16,7 ms, nên riêng nó đã đủ làm rớt khung —
   * cộng thêm phần React dựng lại SVG thì gõ nhanh là thấy khựng.
   *
   * `useDeferredValue` tách hai việc ấy ra hai mức ưu tiên: React dựng khối Kết quả bằng giá trị
   * mới ngay lập tức, còn biểu đồ vẫn giữ giá trị cũ ở lượt đó rồi bắt kịp ở lượt sau, và lượt sau
   * ấy bị NGẮT nếu người dùng gõ tiếp. Gõ liền tay thì biểu đồ chỉ vẽ lại một lần lúc ngừng, thay
   * vì vẽ lại sau mỗi phím.
   *
   * Vì sao KHÔNG debounce bằng `setTimeout`: debounce làm chậm mọi thứ đi một khoảng cố định do
   * mình đoán, kể cả khi máy thừa sức vẽ kịp. `useDeferredValue` để React tự đo — máy khoẻ thì
   * biểu đồ theo kịp gần như tức thì, máy yếu thì tự giãn ra. Không có con số ma nào phải chỉnh.
   *
   * `chartOutput` phải tính lại theo `chartInputs`, không dùng chung `output` ở trên: đưa kết quả
   * MỚI kèm số liệu CŨ vào cùng một lượt dựng là biểu đồ vẽ một đằng còn câu mô tả nói một nẻo.
   */
  /*
   * Biểu đồ quét trên `effectiveInputs` chứ không phải `inputs`: ô móc nối đang nhận 13,1% từ
   * CAPM mà biểu đồ vẫn vẽ theo 12% mặc định thì hình và số nói hai chuyện khác nhau. Thượng
   * nguồn lỗi thì ô móc nối không có số nào để góp, `effectiveInputs` rơi về đúng con số mà ô
   * nhập đang hiển thị — hình khớp với thứ người dùng thấy trong ô, còn câu "chưa tính được"
   * thì khối Kết quả nói, đó mới là chỗ FR-06 canh.
   */
  const chartInputs = useDeferredValue(effectiveInputs);
  const chartOutput: CalcOutput = useMemo(
    () =>
      formula === undefined
        ? { value: null, unit: spec.resultUnit, warning: MISSING_CALCULATOR }
        : runFormula(formula, chartInputs, ctx),
    [formula, chartInputs, ctx, spec.resultUnit],
  );

  /*
   * Công thức này có ăn chuỗi giá hay không — quyết định có hiện nút "Dán chuỗi giá" và lối vào
   * bảng WF-05. Trước đợt này chỗ này đọc `spec.chartType === 'candlestick'`, tức lấy loại BIỂU ĐỒ
   * làm cờ dữ liệu: 11 công thức có nút trong khi 34 công thức cần chuỗi. Nay hỏi thẳng Domain.
   *
   * Là thuộc tính TĨNH của công thức, không phải "hiện đang thiếu chuỗi": nút vẫn phải còn sau khi
   * người dùng nạp xong, để họ nạp lại chuỗi khác được.
   */
  const wantsSeries = useMemo(
    () => (formula === undefined ? false : needsPriceSeries(formula, asOf)),
    [formula, asOf],
  );

  /** Công thức này đã có biểu đồ thật, hay còn đứng ở khung chờ. */
  const showChart = hasChart(spec);

  /**
   * Tên nguồn chuỗi để câu mô tả biểu đồ nói rõ "của FPT" hay "của ví dụ minh hoạ" — ưu tiên mã
   * mẫu thật, vì `loadedPreset` luôn về `null` khi `loadIllustrativeExample()` chạy (xem hàm đó).
   */
  const chartSeriesLabel =
    loadedPreset ?? (exampleLoaded ? t('detail.exampleSeriesLabel') : undefined);

  /**
   * Ngày đối chiếu fundamentals của preset đang nạp — tra qua `SAMPLE_DATA` bằng mã thay vì giữ
   * một state riêng: `loadedPreset` đã là nguồn sự thật duy nhất cho "đang nạp mã nào", giữ thêm
   * một bản sao là mở đường cho hai chỗ lệch nhau. `undefined` (không rõ/không áp dụng) và preset
   * chưa nạp gì đều rơi về cùng `null` — khối JSX bên dưới không cần phân biệt hai lý do đó.
   */
  const loadedFundamentalsAsOf =
    loadedPreset === null ? null : (SAMPLE_DATA.byCode(loadedPreset)?.fundamentalsAsOf ?? null);

  const shown = variablesForLevel(spec, mode);
  const hiddenCount = spec.variables.length - shown.length;

  /** Ô nào của công thức đang xem đang nhận giá trị từ bước trước. */
  const linkedFields = new Map(chainStep?.fields.map((field) => [field.spec.key, field]) ?? []);

  /**
   * Đặt giá trị cho một ô của công thức đang xem.
   *
   * Ô móc nối đi đường KHÁC: gõ vào nó là **ghi đè**, không phải sửa ô nhập thường. Nếu ghi thẳng
   * vào `inputs` thì lượt dựng sau `linkedValues` lại đè lên bằng giá trị của bước trước — ô nhìn
   * như nuốt mất con số vừa gõ. Gom cả hai đường vào một hàm để khối Ví dụ thực tế (cũng gọi hàm
   * này) không phải biết ô nào là ô móc nối.
   */
  function setValue(key: string, value: number): void {
    if (linkedFields.has(key)) {
      setOverride(spec.id, key, value);
      return;
    }
    setInputs((current) => ({ ...current, [key]: value }));
  }

  /** Ghi đè một ô móc nối, hoặc `undefined` để hoàn tác về giá trị tự động. */
  function setOverride(formulaId: string, key: string, value: number | undefined): void {
    setOverrides((current) => {
      const forFormula = { ...current[formulaId] };
      if (value === undefined) delete forFormula[key];
      else forFormula[key] = value;
      return { ...current, [formulaId]: forFormula };
    });
  }

  /*
   * Nhả tay tại một điểm trên biểu đồ — ghi giá trị đó vào đúng ô Số liệu (qua `setValue()`, cùng
   * hàm `VariableField`/`ExampleBlock` đang dùng, nên ô móc nối vẫn tự chuyển thành Ghi đè đúng
   * cách). KHÔNG cuộn trang — biểu đồ tự vẽ lại quanh điểm mới ngay tại chỗ đang xem là đủ để thấy
   * đã đổi, cuộn lên khối Số liệu chỉ giật trang một cách không cần thiết.
   *
   * `onApplyPoint` xuyên qua `memo(FormulaChart)` — PHẢI giữ tham chiếu ổn định giữa các lượt
   * render (xem docblock `FormulaChartProps.onApplyPoint`), nhưng `setValue` đóng lấy
   * `linkedFields`/`spec.id` mới mỗi lượt nên bản thân nó KHÔNG ổn định. Ref giữ bản mới nhất,
   * `useCallback([])` dựng một vỏ bọc vĩnh viễn không đổi tham chiếu — component tự phòng thân,
   * không bắt `FormulaChart` phải tự lo (cùng tinh thần `closeRef` ở `ChartFullscreen.tsx`).
   */
  const applyChartPointRef = useRef(setValue);
  useEffect(() => {
    applyChartPointRef.current = setValue;
  });
  const onChartApplyPoint = useCallback((key: string, value: number) => {
    applyChartPointRef.current(key, value);
  }, []);

  /** Đặt giá trị cho ô nhập của MỘT BƯỚC KHÁC trong chuỗi. */
  function setChainValue(formulaId: string, key: string, value: number): void {
    const stepSpec = chainSpecs.find((candidate) => candidate.id === formulaId);
    if (stepSpec === undefined) return;

    setChainInputs((current) => ({
      ...current,
      [formulaId]: { ...(current[formulaId] ?? defaultInputs(stepSpec)), [key]: value },
    }));
  }

  /**
   * Nạp bộ số liệu mẫu vào các ô KHỚP TÊN. FR-10 hứa "nạp xong vẫn sửa được từng ô", nên
   * đây chỉ là đặt giá trị chứ không khoá gì cả.
   *
   * Bảng ánh xạ đã chuyển xuống `presetInputs()` ở tầng Data. Nó từng nằm ngay đây, và cái giá của
   * việc để tầng giao diện quyết định đơn vị đo lường thì đo được: bảng cũ bỏ sót số cổ phiếu, nên
   * nạp FPT cho công thức vốn hoá ra giá FPT nhân số cổ phiếu mặc định. Ở tầng Data thì một ca test
   * Node soi được cả 108 công thức, và đơn vị của từng khoá bị khoá lại bằng test.
   */
  function applyPreset(preset: Preset): void {
    const fromPreset = presetInputs(preset, spec);

    setInputs((current) => ({ ...current, ...fromPreset }));
    setLoadedPreset(preset.code);
    // Nạp mẫu công ty thật thì thôi ở trạng thái "ví dụ minh hoạ" — xem loadIllustrativeExample().
    setMarketSeriesOverride(null);
    setExampleLoaded(false);

    /*
     * Chuỗi phiên của bộ mẫu đi thẳng vào ctx.
     *
     * Trước đợt này hàm này chỉ đặt các ô VÔ HƯỚNG, nên nạp FPT cho một công thức chuỗi (Sharpe,
     * RSI, sụt giảm từ đỉnh…) vẫn ra "chưa đủ phiên giá" — nút "Nạp mẫu" nhìn như không làm gì,
     * đúng 34 công thức. Bộ mẫu có sẵn 248 phiên OHLCV, chỉ là chưa ai chuyển sang.
     *
     * `DailyBar` có `close: number`, hẹp hơn `SeriesRow` (`close: number | null`), nên gán vào
     * được mà không mất mát. Không TỰ ghi đè bảng WF-05 đã lưu ở localStorage: nạp mẫu là thao
     * tác thử nhanh, bảng là dữ liệu người dùng chủ động quản ở /du-lieu/ — cùng lối với sheet
     * dán. Muốn đưa đúng chuỗi này vào bảng thì bấm nút "Áp dụng vào bảng dữ liệu" riêng
     * (`applyToDataTable()`) — một hành động rõ ràng, không phải tác dụng phụ của "Nạp mẫu".
     */
    setBars(
      preset.bars.map(({ date, open, high, low, close, volume }) => ({
        date,
        open,
        high,
        low,
        close,
        volume,
      })),
    );
    setSeriesCount(preset.bars.length);

    /*
     * XIRR đọc `ctx.cashflows`, không `ctx.series` — đúng cái bẫy "Nạp mẫu nhìn như không làm
     * gì" đã gặp ở 34 công thức chuỗi trước đây (xem chú thích trên), lặp lại lần nữa vì bộ mẫu
     * không có khái niệm "dòng tiền đầu tư có ngày" để khớp tên. Dựng một kịch bản 2 dòng, có
     * ý nghĩa thật chứ không phải số bịa: đầu tư 100 triệu ₫ ở phiên ĐẦU bộ mẫu, giá trị hiện
     * tại ở phiên CUỐI tính đúng theo tỉ lệ giá tăng/giảm thật của mã đó — XIRR ra suất sinh lợi
     * nếu mua giữ nguyên suốt giai đoạn 248 phiên. Chỉ set cho đúng công thức XIRR, không đụng
     * `cashflowRows` của công thức khác (biến đó công thức khác không đọc tới, nhưng gọn hơn).
     */
    if (spec.id === 'xirr') {
      const first = preset.bars[0];
      const last = preset.bars[preset.bars.length - 1];
      if (first !== undefined && last !== undefined && first.close > 0) {
        const investment = 100_000_000;
        const currentValue = Math.round((investment * (last.close / first.close)) / 1_000) * 1_000;
        setCashflowRows([
          { date: first.date, amount: -investment },
          { date: last.date, amount: currentValue },
        ]);
      }
    }
    setAppliedToTable(false);
  }

  /**
   * Nạp chuỗi MINH HOẠ có sẵn trong `spec.example` — lối thứ ba cho người chưa hiểu bộ mẫu 4
   * công ty (PRNG bịa, không mang ý nghĩa gì cho công thức chuỗi) và cũng không có chuỗi giá thật
   * nào của riêng mình để dán. Khác hẳn "Nạp mẫu": số ở đây KHÔNG PHẢI giá cổ phiếu của công ty
   * nào — chỉ là chuỗi dựng tay để công thức ra ĐÚNG kết quả minh hoạ đã ghi ở `example.expected`
   * (vd Beta ra đúng 1,5, thay vì một số gần 0 vô nghĩa mà 4 preset PRNG độc lập cho ra — xem
   * docblock đầu `risk-ratios.ts`). Không bịa số liệu mới: dùng lại đúng hằng số mỗi công thức đã
   * tự khai trong `spec.example`/`spec.tests` để tự kiểm ở `formulas.test.ts`.
   *
   * `date` đặt bằng chỉ số phiên dạng chuỗi ('1', '2'…) chứ không phải ngày thật: biểu đồ vốn đã
   * vẽ theo CHỈ SỐ phiên chứ không theo mốc thời gian (xem docblock `historyPoints()`), và một
   * ngày ISO bịa ra dễ bị hiểu lầm là phiên giao dịch thật đã từng xảy ra.
   */
  function loadIllustrativeExample(): void {
    const rows =
      spec.example.bars ??
      spec.example.series?.map((close, index) => ({
        date: String(index + 1),
        open: null,
        high: null,
        low: null,
        close,
        volume: null,
      }));
    if (rows === undefined || rows.length === 0) return;

    setBars(rows);
    setSeriesCount(rows.length);
    setMarketSeriesOverride(spec.example.marketSeries ?? null);
    setLoadedPreset(null);
    setExampleLoaded(true);
    setAppliedToTable(false);
  }

  /**
   * Ghi `bars` hiện tại vào bảng WF-05 (`/du-lieu/`) — hành động RÕ RÀNG do người dùng chủ động
   * bấm, khác hẳn "Nạp mẫu"/"Dán chuỗi giá" vốn cố ý không tự ghi đè (xem docblock ở
   * `applyPreset()`). Mã đi kèm lấy từ `loadedPreset` nếu có; dán tay thì không có mã, để trống
   * — đúng quy ước `StoredSeries.code` rỗng nghĩa là "bảng tự nhập, chưa gắn mã nào".
   */
  function applyToDataTable(): void {
    if (bars === null) return;
    try {
      window.localStorage.setItem(
        PRICE_SERIES_KEY,
        serializeStoredSeries({ code: loadedPreset ?? '', rows: bars }),
      );
      setAppliedToTable(true);
    } catch {
      // localStorage bị chặn (chế độ riêng tư) — không chặn thao tác đang làm, chỉ là chưa lưu được.
    }
  }

  /**
   * Cuộn xuống khối "Ví dụ thực tế" ở cuối trang (mọi công thức đều có, không riêng nhóm chuỗi
   * giá) — lối cho người vừa vào màn, chưa hiểu công thức và cũng chưa có số liệu riêng, khỏi
   * phải tự đoán cuộn xuống đâu. Khối đó đã bày sẵn một bộ số minh hoạ đầy đủ, gõ được, kèm nút
   * quay về số gốc — không có gì mới để dựng, chỉ là đưa lối vào nó lên gần tầm mắt hơn.
   *
   * Cùng kỹ thuật cuộn với nút "Về số của ví dụ" trong `ExampleBlock` (kiểm `matchMedia` trước khi
   * gọi vì jsdom không cài đặt nó — xem docblock ở đó), chỉ đổi chiều: từ đầu trang xuống cuối.
   */
  function scrollToExample(): void {
    const target = document.getElementById('khoi-vi-du');
    if (target === null || typeof target.scrollIntoView !== 'function') return;
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  return (
    <div className={styles.detail}>
      {/*
        Miễn trừ đặt NGAY ĐẦU MÀN, không chỉ ở chân trang (FR-24 · UI-04).
        Đây là màn bày ra một con số tiền, nên câu "chỉ tham khảo" phải nằm cùng tầm mắt với
        con số ấy. Bản ở chân trang do AppShell dựng vẫn giữ, vì nó phủ mọi màn.
      */}
      <DisclaimerBar variant="notice" />

      {/* ── 1. Đầu màn: đường ra, tên, nhóm, ba nút hành động ────────────── */}
      <header className={styles.head}>
        {/*
          Đường ra khỏi màn này. Wireframe vẽ dấu `‹` ở hàng đầu của mọi màn trong; bản dựng
          bỏ sót, nên vào một công thức rồi là không có lối quay về danh sách để chọn cái khác.
        */}
        <BackLink />

        <div className={styles.titleRow}>
          <h1 className={styles.title}>{pick(spec.name)}</h1>
          <span className={styles.level}>
            {t(spec.level === 'basic' ? 'level.basic' : 'level.advanced')}
          </span>
        </div>
        <p className={styles.subtitle}>{pick(spec.description)}</p>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              openSheet('preset');
            }}
          >
            {loadedPreset === null
              ? t('detail.loadPreset')
              : `${t('detail.preset')} ${loadedPreset}`}
          </Button>

          {/*
            Lối tắt cho người vừa vào màn, chưa hiểu công thức và chưa có số liệu riêng — chung
            cho CẢ 108 công thức, không riêng nhóm chuỗi giá (xem docblock `scrollToExample()`).
            Chỉ CUỘN, không nạp gì cả — khác hẳn nút "Xem ví dụ minh hoạ" ở khối Số liệu của 35
            công thức chuỗi giá, vốn NẠP số liệu minh hoạ vào phép tính.
          */}
          <Button variant="secondary" size="sm" onClick={scrollToExample}>
            {t('detail.jumpToExample')}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              openSheet('export');
            }}
          >
            {t('detail.export')}
          </Button>
        </div>

        {/*
          Trả lời câu "số liệu mẫu bắt đầu từ đâu, như thế nào" — chỉ hiện khi đã nạp một preset
          CÓ mốc đối chiếu (bốn mã WF-10 hiện tại đều có, xem `samples.ts`). Không hiện cho
          "Xem ví dụ minh hoạ" hay dán tay: cả hai đều không phải số đối chiếu báo cáo thật.
        */}
        {loadedFundamentalsAsOf !== null && (
          <p className={styles.pendingNote}>
            {t('detail.fundamentalsSource')} {formatIsoDate(loadedFundamentalsAsOf.slice(0, 10))}
          </p>
        )}
      </header>

      {/* ── 2. Ý nghĩa ───────────────────────────────────────────────────── */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>{t('detail.meaning')}</h2>
        <p className={styles.prose}>{pick(spec.explanation.meaning)}</p>
      </section>

      {/* ── 3. Công thức — ký hiệu toán học (gói 2.4.3) rồi tới bản dạng chữ ─ */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>{t('detail.formula')}</h2>
        {/*
          `dangerouslySetInnerHTML` ở đây an toàn và không có đường nào khác: React không dựng
          được cây MathML từ chuỗi. Đầu vào là hằng số `spec.latex` trong repo, đi qua KaTeX với
          `trust: false`, và việc dựng xảy ra lúc BUILD chứ không lúc chạy — không có chỗ nào cho
          chữ người dùng gõ lọt vào. Xem `latex-html.ts`.

          `<div>` chứ không `<p>`: MathML là nội dung khối, nhét vào `<p>` là HTML sai cấu trúc.
        */}
        <div
          className={styles.formula}
          // eslint-disable-next-line react/no-danger -- xem chú thích ngay trên
          dangerouslySetInnerHTML={{ __html: latexHtml }}
        />
        {/*
          Bản dạng chữ GIỮ LẠI, không phải bản dự phòng: nó nói cùng công thức bằng tên đầy đủ
          tiếng Việt ("Lợi nhuận sau thuế ÷ Vốn chủ sở hữu"), thứ mà ký hiệu viết tắt phía trên
          không nói. Người mới đọc dòng này mới hiểu được ký hiệu kia. Tiện thể nó cũng là lối
          đọc còn lại nếu trình duyệt quá cũ không dựng được MathML.
        */}
        <p className={styles.expression}>
          {spec.expression === undefined ? spec.latex : pick(spec.expression)}
        </p>
      </section>

      {/* ── 4. Số liệu — ô nhập sinh từ VariableSpec (FR-05) ──────────────── */}
      {/*
        `aria-labelledby` biến khối này thành một VÙNG có tên.
        Cần từ khi khối Ví dụ thực tế cũng cho gõ số: hai chỗ bày CÙNG một giá trị nên chúng mang
        cùng một tên ô — đúng nghĩa, vì đó là một con số chứ không phải hai. Cái người dùng cần để
        không lẫn là biết mình đang ở vùng nào, và tên vùng làm đúng việc ấy: trình đọc màn hình
        đọc "Số liệu" hay "Ví dụ thực tế" khi bước vào, rồi mới tới tên ô.
      */}
      <section className={styles.block} aria-labelledby="khoi-so-lieu">
        <div className={styles.blockHead}>
          <h2 className={styles.blockTitle} id="khoi-so-lieu">
            {t('detail.inputs')}
          </h2>
          {hiddenCount > 0 && (
            <span className={styles.hiddenNote}>
              {hiddenCount} {t('detail.hiddenInBasic')}
            </span>
          )}
        </div>

        {/* Khối cấu hình riêng của công thức, ví dụ ô chọn biểu phí của WF-08. */}
        {hasConfigBlock(spec.id) && <DetailConfig id={spec.id} />}

        <div className={styles.fields}>
          {shown.map((variable) => {
            const linked = linkedFields.get(variable.key);
            // Ô móc nối mang thêm hàng nút Ghi đè / Hoàn tác nên luôn chiếm trọn hàng.
            const wide = linked !== undefined || isWideControl(variable.type);

            /*
              Điều khiển LÀ ô lưới, không bọc thêm một <div> quanh nó.
              Bọc thì nhãn / khung nhập / dòng phụ nằm sâu thêm một tầng, và `subgrid` — thứ giữ
              cho hai ô cùng hàng thẳng nhau khi một nhãn dài hơn — chỉ với tới con TRỰC TIẾP.
              Khối chuỗi WF-04 vốn đã dựng theo lối này, nên bỏ lớp bọc cũng là đưa hai màn về
              cùng một hình dạng DOM.
            */
            const className = wide ? styles.fieldWide : styles.field;

            return linked === undefined ? (
              <VariableField
                key={variable.key}
                spec={variable}
                value={inputs[variable.key] ?? variable.defaultValue}
                onChange={(value) => {
                  setValue(variable.key, value);
                }}
                mode={mode}
                sourceNote={variable.type === 'toggle' ? t('detail.constantSource') : undefined}
                className={className}
              />
            ) : (
              /*
                Ô nhận giá trị từ bước trước (FR-15). Dựng TẠI CHỖ trong lưới chứ không gom
                xuống khối chuỗi bên dưới: nó vẫn là một biến của công thức này, đứng đúng
                thứ tự của nó trong bảng biến. Gom xuống dưới là người dùng phải ghép hai
                danh sách ô nhập trong đầu mới biết công thức cần những gì.
              */
              <LinkedInput
                key={variable.key}
                spec={variable}
                upstream={linked.upstream}
                {...(linked.override === undefined ? {} : { override: linked.override })}
                onOverrideChange={(value) => {
                  setOverride(spec.id, variable.key, value);
                }}
                mode={mode}
                className={className}
              />
            );
          })}
        </div>

        {wantsSeries && (
          <div className={styles.actions}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                openSheet('paste');
              }}
            >
              {t('detail.pasteSeries')}
            </Button>

            {/*
              Lối thứ ba cho người chưa có chuỗi giá thật để dán VÀ không hiểu bộ mẫu 4 công ty —
              xem docblock `loadIllustrativeExample()`. Ẩn hẳn với công thức không khai
              `example.series`/`example.bars` thay vì hiện một nút bấm không ra gì.
            */}
            {(spec.example.series !== undefined || spec.example.bars !== undefined) && (
              <Button variant="secondary" size="sm" onClick={loadIllustrativeExample}>
                {exampleLoaded ? t('detail.exampleLoaded') : t('detail.loadExample')}
              </Button>
            )}

            {/*
              Chỉ hiện khi đã có gì để áp dụng — nút này ghi CHỦ Ý, khác "Nạp mẫu"/"Dán chuỗi
              giá" vốn cố ý không tự ghi đè bảng WF-05 (xem docblock `applyToDataTable()`).
              Chủ dự án báo mất dấu: nạp mẫu xong sang /du-lieu/ không thấy gì — đây là lối vá.
            */}
            {bars !== null && (
              <Button variant="secondary" size="sm" onClick={applyToDataTable}>
                {appliedToTable ? t('detail.appliedToTable') : t('detail.applyToTable')}
              </Button>
            )}

            {/*
              Lối vào bảng WF-05. Dán tại chỗ chỉ đọc được chuỗi vào công thức đang mở; muốn
              sửa từng phiên, xem dòng nào sai, hay giữ chuỗi lại thì phải sang bảng. Trước đợt
              này màn đó không có link nào trỏ tới từ bất kỳ đâu trong giao diện.

              Mang theo `?from=<id>` để nút quay lại ở /du-lieu/ biết đường về ĐÚNG công thức
              này thay vì về danh sách chung — chủ dự án báo mất dấu công thức đang thao tác.
            */}
            <Link className={styles.dataLink} href={`${ROUTES.data}?from=${spec.id}`}>
              {t('detail.openDataTable')}
            </Link>
          </div>
        )}

        {/* Chỉ công thức ăn chuỗi mới cần biết đã nạp bao nhiêu phiên; P/E thì đó là nhiễu. */}
        {wantsSeries && seriesCount !== null && (
          <p className={styles.pendingNote}>
            {t('detail.seriesLoaded')} {seriesCount}
          </p>
        )}

        {/* Chỉ hiện khi số đang bày LÀ chuỗi minh hoạ — đừng để người dùng tưởng nhầm là số thật. */}
        {wantsSeries && exampleLoaded && (
          <p className={styles.pendingNote}>{t('detail.exampleSeriesNote')}</p>
        )}

        {/*
          Hằng số thuế & phí đang áp — đặt CUỐI khối Số liệu, không tách thành khối riêng.
          Nó thuộc về đầu vào: cùng là thứ quyết định con số ở khối Kết quả, chỉ khác chỗ người
          dùng không gõ được. Tách ra thành khối số 5 thì nó rơi xuống dưới Kết quả, tức là người
          dùng đọc xong con số rồi mới biết nó tính theo mức nào — muộn.

          Tự trả về null khi công thức không tra hằng số nào, nên 95 trong 108 trang không thêm
          một nút DOM nào.
        */}
        <ConstantsNote constants={constantsUsedBy(spec, ctx)} />
      </section>

      {/* ── 4b. Chuỗi công thức — WF-04, FR-15 (gói 5.2.3) ────────────────── */}
      {/*
        Đặt NGAY SAU khối Số liệu và TRƯỚC khối Kết quả, đúng mạch đọc: người dùng vừa thấy một ô
        ghi "↳ nhận tự động từ CAPM" ở trên, câu hỏi kế tiếp là "CAPM đó là gì, sửa ở đâu" — khối
        này trả lời ngay tại đó, trước khi họ kịp cuộn đi tìm.

        Chỉ có mặt ở chế độ Nâng cao và chỉ với công thức nằm trong chuỗi. Đây cũng là payload
        nặng nhất của nút Cơ bản / Nâng cao mà đợt trước đã lắp trước màn mà nó mở.
      */}
      {chain !== undefined && (
        <ChainPanel
          formulas={chainSpecs}
          chain={chain}
          currentId={spec.id}
          inputs={allChainInputs}
          overrides={overrides}
          onInput={setChainValue}
          onOverride={setOverride}
          mode={mode}
        />
      )}

      {/* ── 5. Kết quả ───────────────────────────────────────────────────── */}
      {/* Thân riêng nào đã bày ra chính con số này thì bỏ khối chung, không hiện hai lần. */}
      {!ownsResult(spec.id) && <ResultBlock output={output} />}

      {/* Khối kết quả riêng của WF-08 và WF-14, nạp trễ theo id công thức. */}
      {hasCustomBody(spec.id) && (
        <DetailBody
          id={spec.id}
          inputs={inputs}
          ctx={ctx}
          output={output}
          cashflowRows={cashflowRows}
          onCashflowRowsChange={setCashflowRows}
        />
      )}

      {/* ── 6. Biểu đồ — FR-07, FR-08 ─────────────────────────────────────── */}
      {/*
        Khung nét đứt "sẽ có ở bản sau" đã bỏ hẳn: `hasChart()` nay phủ 98 trên 108 công thức, và 10
        công thức còn lại khai `chartType: 'none'` nên chúng KHÔNG dựng khối này chút nào — không có
        trạng thái thứ ba nào để bày.

        Công thức ăn chuỗi giá mà chưa nạp dữ liệu thì `ChartBody` hiện đúng câu cảnh báo khối Kết
        quả đang nói, kèm câu chỉ đường; nút "Nạp mẫu" và "Dán chuỗi giá" đã nằm ở khối Số liệu ngay
        trên đó, nên không bày lối vào lần hai.
      */}
      {showChart && formula !== undefined && (
        <section className={`${styles.block} ${styles.deferred}`}>
          <h2 className={styles.blockTitle}>{t('detail.chart')}</h2>
          <FormulaChart
            formula={formula}
            inputs={chartInputs}
            ctx={ctx}
            output={chartOutput}
            level={mode}
            {...(chartSeriesLabel === undefined ? {} : { seriesLabel: chartSeriesLabel })}
            // KHÔNG thay bằng closure viết trực tiếp ở đây — xem docblock `onApplyPoint` ở trên.
            onApplyPoint={onChartApplyPoint}
          />
        </section>
      )}

      {/* ── 7. Giải thích cho người mới — FR-03 ──────────────────────────── */}
      {/*
        LUÔN mở sẵn CẢ BỐN mục, không phụ thuộc chế độ — chủ dự án chốt.

        Bản đầu gập hết ở chế độ Nâng cao cho gọn màn (FR-09), bản sau chỉ mở mục đầu. Cả hai đều bắt
        người đọc phải bấm mới thấy phần giải thích, mà FR-03 bắt buộc bốn mục ấy có mặt chính là để
        đọc. Không truyền prop nào ở đây: mặc định của component ĐÃ là mở hết, nên chỗ này không có
        điều kiện nào để về sau lệch với nó.
      */}
      {/*
        Bốn khối cuối màn mang lớp `deferred` — xem chú thích trong `FormulaDetail.module.css`.
        Chúng luôn nằm dưới nếp gấp ở khổ điện thoại, nên bỏ qua phần dựng hình của chúng cho tới
        lúc cuộn tới là cắt được phần lớn lượt layout đầu tiên của màn.
      */}
      <ExplanationAccordion explanation={spec.explanation} className={styles.deferred} />

      {/* ── 8. Bảng biến ─────────────────────────────────────────────────── */}
      <VariableTable formula={spec} mode={mode} className={styles.deferred} />

      {/* ── 9. Ví dụ và nguồn — FR-02, FR-04 ─────────────────────────────── */}
      {/*
        Dòng số của ví dụ gõ được tại chỗ. Trước đây khối này là ngõ cụt: nó bày một bộ số hoàn
        chỉnh rồi để người đọc tự cuộn lên gõ lại từng ô.

        Truyền thẳng `inputs` với `setValue` chứ không dựng state riêng cho khối — nhờ vậy ô ở đây
        và ô ở khối Số liệu là CÙNG một con số, không phải hai bản sao có ngày lệch nhau. Kết quả
        cũng lấy đúng `output` mà khối Kết quả đang hiện.
      */}
      {/*
        `effectiveInputs` chứ không phải `inputs`: ô móc nối cũng xuất hiện ở đây, và nó phải bày
        đúng con số mà khối Số liệu đang bày. Gõ vào nó thì `setValue()` tự lái sang ghi đè.
      */}
      <ExampleBlock
        formula={spec}
        inputs={effectiveInputs}
        output={output}
        onChange={setValue}
        className={styles.deferred}
      />
      <SourceBlock sources={spec.source} className={styles.deferred} />

      {/* ── Ba bottom sheet của gói 2.5 — chỉ dựng từ lần mở đầu tiên ────── */}
      {mountedSheets.has('preset') && (
        <PresetSheet
          open={sheet === 'preset'}
          onClose={() => {
            setSheet(null);
          }}
          onLoad={applyPreset}
        />
      )}

      {mountedSheets.has('paste') && (
        <PasteImportSheet
          open={sheet === 'paste'}
          onClose={() => {
            setSheet(null);
          }}
          onImport={(result) => {
            setSeriesCount(result.rows.length);
            // Dán chuỗi thật của riêng mình thì thôi ở trạng thái "ví dụ minh hoạ" — người dùng
            // vừa đưa vào đúng thứ khối minh hoạ tồn tại để thay thế.
            setMarketSeriesOverride(null);
            setExampleLoaded(false);
            // Chuỗi vừa dán đi thẳng vào ctx để công thức chuỗi tính NGAY — không ghi đè bảng
            // WF-05 đã lưu: dán ở màn chi tiết là thao tác thử nhanh, bảng là dữ liệu người
            // dùng chủ động quản ở /du-lieu/.
            setBars(
              result.rows.map(({ date, open, high, low, close, volume }) => ({
                date,
                open,
                high,
                low,
                close,
                volume,
              })),
            );
            setAppliedToTable(false);
          }}
        />
      )}

      {mountedSheets.has('export') && (
        <ExportSheet
          open={sheet === 'export'}
          onClose={() => {
            setSheet(null);
          }}
          formula={spec}
          output={output}
          // Bản xuất phải mang con số thật sự đã dùng để tính, kể cả số chảy từ bước trước sang.
          inputs={effectiveInputs}
          mode={mode}
          // Người dùng vừa nạp bộ mẫu thì file xuất ra phải tự nói điều đó (bộ mẫu hiện toàn
          // là bản thảo — xem src/data/samples.ts).
          fromDraftData={loadedPreset !== null && hasDraftData()}
        />
      )}

      {/* Chuỗi kết quả dạng chữ, để bộ kiểm tự động soi được mà không phải đọc DOM lồng nhau. */}
      <span className="visually-hidden" data-testid="result-text">
        {formatCalcOutput(output)}
      </span>
    </div>
  );
}

/**
 * Chỉ xảy ra nếu ai đó thêm `FormulaSpec` vào Registry mà quên hàm tính. Cấu trúc
 * `FormulaModule` khiến chuyện này gần như không thể, nhưng vẫn phải có lối ra không ném lỗi.
 */
const MISSING_CALCULATOR = {
  code: 'INCOMPLETE_INPUT',
  message: {
    vi: 'Công thức này chưa có phần tính toán.',
    en: 'This formula has no calculator yet.',
  },
  fix: {
    vi: 'Đây là lỗi của chúng tôi, không phải của bạn. Vui lòng thử công thức khác.',
    en: 'This is our mistake, not yours. Please try another formula.',
  },
} as const;
