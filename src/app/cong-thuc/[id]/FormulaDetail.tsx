'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import {
  MARKET_CONFIG,
  PRICE_SERIES_KEY,
  ROUTES,
  defaultInputs,
  findFormulaModule,
  formatCalcOutput,
  hasDraftData,
  needsPriceSeries,
  parseStoredSeries,
  presetInputs,
  runFormula,
  scheduleOrDefault,
  t,
  variablesForLevel,
} from '@/application';
import type { CalcContext, CalcOutput, FormulaSpec, Preset, SeriesRow } from '@/application';
import { usePreferences } from '@/application/preferences-context';
import { VariableField } from '@/ui/inputs';
import { Button } from '@/ui/primitives';
import {
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
import { DetailBody, DetailConfig, hasConfigBlock, hasCustomBody, ownsResult } from '@/ui/screens';

import styles from './FormulaDetail.module.css';

/**
 * Điều khiển chiếm trọn bề ngang của lưới ô nhập.
 *
 * Ô số và danh sách chọn xếp hai cột được ở 360px; thanh trượt, nhóm nút và công tắc thì không —
 * chúng cần cả chiều ngang cho nhãn, giá trị và hai mốc min/max. Bản thiết kế hi-fi vẽ đúng
 * như vậy: WF-08 bốn ô số thành lưới 2×2, WF-14 ba thanh trượt xếp dọc.
 */
const WIDE_CONTROLS: ReadonlyArray<string> = ['slider', 'buttonGroup', 'radio', 'toggle'];

export interface FormulaDetailProps {
  spec: FormulaSpec;
  /**
   * Ngày tra hằng số thuế & phí, cố định lúc build.
   * Tầng Domain không tự lấy ngày hệ thống (NFR-REL-03), và nếu lấy `new Date()` ở đây thì
   * HTML sinh lúc build khác HTML sinh lúc chạy — lệch hydration.
   */
  asOf: string;
}

type SheetKind = 'preset' | 'paste' | 'export';

/**
 * Màn WF-03 Chi tiết công thức — gói WBS 3.2.1.
 *
 * Chín khối đúng thứ tự wireframe. Đây là màn dùng nhiều nhất và là khuôn cho cả 107 công
 * thức, nên **không có gì viết cứng cho một công thức cụ thể**: ô nhập sinh từ `VariableSpec`
 * (FR-05), kết quả đi qua `runFormula()`, diễn giải và nguồn đọc từ Registry.
 *
 * Hai công thức có khối kết quả riêng (WF-08 phí & thuế, WF-14 lịch trả nợ) được nạp qua
 * `DetailBody`, tải trễ theo id — đúng chữ "tải trễ khối nặng" của gói 3.2.1.
 */
export function FormulaDetail({ spec, asOf }: FormulaDetailProps) {
  const { mode, feeScheduleId } = usePreferences();

  const [inputs, setInputs] = useState<Record<string, number>>(() => defaultInputs(spec));
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [loadedPreset, setLoadedPreset] = useState<string | null>(null);
  const [seriesCount, setSeriesCount] = useState<number | null>(null);
  const [bars, setBars] = useState<ReadonlyArray<SeriesRow> | null>(null);

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
      ...(bars === null
        ? {}
        : {
            bars,
            series: bars
              .map((bar) => bar.close)
              .filter((close): close is number => typeof close === 'number' && close > 0),
          }),
    }),
    [asOf, feeScheduleId, bars],
  );

  const formula = findFormulaModule(spec.id);
  const output: CalcOutput = useMemo(
    () =>
      formula === undefined
        ? { value: null, unit: spec.resultUnit, warning: MISSING_CALCULATOR }
        : runFormula(formula, inputs, ctx),
    [formula, inputs, ctx, spec.resultUnit],
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

  const shown = variablesForLevel(spec, mode);
  const hiddenCount = spec.variables.length - shown.length;

  function setValue(key: string, value: number): void {
    setInputs((current) => ({ ...current, [key]: value }));
  }

  /**
   * Nạp bộ số liệu mẫu vào các ô KHỚP TÊN. FR-10 hứa "nạp xong vẫn sửa được từng ô", nên
   * đây chỉ là đặt giá trị chứ không khoá gì cả.
   *
   * Bảng ánh xạ đã chuyển xuống `presetInputs()` ở tầng Data. Nó từng nằm ngay đây, và cái giá của
   * việc để tầng giao diện quyết định đơn vị đo lường thì đo được: bảng cũ bỏ sót số cổ phiếu, nên
   * nạp FPT cho công thức vốn hoá ra giá FPT nhân số cổ phiếu mặc định. Ở tầng Data thì một ca test
   * Node soi được cả 107 công thức, và đơn vị của từng khoá bị khoá lại bằng test.
   */
  function applyPreset(preset: Preset): void {
    const fromPreset = presetInputs(preset, spec);

    setInputs((current) => ({ ...current, ...fromPreset }));
    setLoadedPreset(preset.code);

    /*
     * Chuỗi phiên của bộ mẫu đi thẳng vào ctx.
     *
     * Trước đợt này hàm này chỉ đặt các ô VÔ HƯỚNG, nên nạp FPT cho một công thức chuỗi (Sharpe,
     * RSI, sụt giảm từ đỉnh…) vẫn ra "chưa đủ phiên giá" — nút "Nạp mẫu" nhìn như không làm gì,
     * đúng 34 công thức. Bộ mẫu có sẵn 248 phiên OHLCV, chỉ là chưa ai chuyển sang.
     *
     * `DailyBar` có `close: number`, hẹp hơn `SeriesRow` (`close: number | null`), nên gán vào
     * được mà không mất mát. Không ghi đè bảng WF-05 đã lưu ở localStorage: nạp mẫu là thao tác
     * thử nhanh, bảng là dữ liệu người dùng chủ động quản ở /du-lieu/ — cùng lối với sheet dán.
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
  }

  return (
    <div className={styles.detail}>
      {/*
        Miễn trừ đặt NGAY ĐẦU MÀN, không chỉ ở chân trang (FR-24 · UI-04).
        Đây là màn bày ra một con số tiền, nên câu "chỉ tham khảo" phải nằm cùng tầm mắt với
        con số ấy. Bản ở chân trang do AppShell dựng vẫn giữ, vì nó phủ mọi màn.
      */}
      <DisclaimerBar variant="notice" />

      {/* ── 1. Đầu màn: đường ra, tên, nhóm, hai nút hành động ────────────── */}
      <header className={styles.head}>
        {/*
          Đường ra khỏi màn này. Wireframe vẽ dấu `‹` ở hàng đầu của mọi màn trong; bản dựng
          bỏ sót, nên vào một công thức rồi là không có lối quay về danh sách để chọn cái khác.
        */}
        <BackLink />

        <div className={styles.titleRow}>
          <h1 className={styles.title}>{spec.name.vi}</h1>
          <span className={styles.level}>
            {t(spec.level === 'basic' ? 'level.basic' : 'level.advanced')}
          </span>
        </div>
        <p className={styles.subtitle}>{spec.description}</p>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSheet('preset');
            }}
          >
            {loadedPreset === null
              ? t('detail.loadPreset')
              : `${t('detail.preset')} ${loadedPreset}`}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSheet('export');
            }}
          >
            {t('detail.export')}
          </Button>
        </div>
      </header>

      {/* ── 2. Ý nghĩa ───────────────────────────────────────────────────── */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>{t('detail.meaning')}</h2>
        <p className={styles.prose}>{spec.explanation.meaning}</p>
      </section>

      {/* ── 3. Công thức — chỗ dành cho KaTeX, gói 2.4.3 đang hoãn ────────── */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>{t('detail.formula')}</h2>
        <p className={styles.expression}>{spec.expression ?? spec.latex}</p>
        <p className={styles.pendingNote}>{t('detail.latexPending')}</p>
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
          {shown.map((variable) => (
            <div
              key={variable.key}
              className={WIDE_CONTROLS.includes(variable.type) ? styles.fieldWide : styles.field}
            >
              <VariableField
                spec={variable}
                value={inputs[variable.key] ?? variable.defaultValue}
                onChange={(value) => {
                  setValue(variable.key, value);
                }}
                mode={mode}
                sourceNote={variable.type === 'toggle' ? t('detail.constantSource') : undefined}
              />
            </div>
          ))}
        </div>

        {wantsSeries && (
          <div className={styles.actions}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSheet('paste');
              }}
            >
              {t('detail.pasteSeries')}
            </Button>

            {/*
              Lối vào bảng WF-05. Dán tại chỗ chỉ đọc được chuỗi vào công thức đang mở; muốn
              sửa từng phiên, xem dòng nào sai, hay giữ chuỗi lại thì phải sang bảng. Trước đợt
              này màn đó không có link nào trỏ tới từ bất kỳ đâu trong giao diện.
            */}
            <Link className={styles.dataLink} href={ROUTES.data}>
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
      </section>

      {/* ── 5. Kết quả ───────────────────────────────────────────────────── */}
      {/* Thân riêng nào đã bày ra chính con số này thì bỏ khối chung, không hiện hai lần. */}
      {!ownsResult(spec.id) && <ResultBlock output={output} />}

      {/* Khối kết quả riêng của WF-08 và WF-14, nạp trễ theo id công thức. */}
      {hasCustomBody(spec.id) && <DetailBody id={spec.id} inputs={inputs} ctx={ctx} />}

      {/* ── 6. Biểu đồ — FR-07, FR-08 ─────────────────────────────────────── */}
      {/*
        Khung nét đứt "sẽ có ở bản sau" đã bỏ hẳn: `hasChart()` nay phủ 97 trên 107 công thức, và 10
        công thức còn lại khai `chartType: 'none'` nên chúng KHÔNG dựng khối này chút nào — không có
        trạng thái thứ ba nào để bày.

        Công thức ăn chuỗi giá mà chưa nạp dữ liệu thì `ChartBody` hiện đúng câu cảnh báo khối Kết
        quả đang nói, kèm câu chỉ đường; nút "Nạp mẫu" và "Dán chuỗi giá" đã nằm ở khối Số liệu ngay
        trên đó, nên không bày lối vào lần hai.
      */}
      {showChart && formula !== undefined && (
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>{t('detail.chart')}</h2>
          <FormulaChart
            formula={formula}
            inputs={inputs}
            ctx={ctx}
            output={output}
            level={mode}
            {...(loadedPreset === null ? {} : { seriesLabel: loadedPreset })}
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
      <ExplanationAccordion explanation={spec.explanation} />

      {/* ── 8. Bảng biến ─────────────────────────────────────────────────── */}
      <VariableTable formula={spec} mode={mode} />

      {/* ── 9. Ví dụ và nguồn — FR-02, FR-04 ─────────────────────────────── */}
      {/*
        Dòng số của ví dụ gõ được tại chỗ. Trước đây khối này là ngõ cụt: nó bày một bộ số hoàn
        chỉnh rồi để người đọc tự cuộn lên gõ lại từng ô.

        Truyền thẳng `inputs` với `setValue` chứ không dựng state riêng cho khối — nhờ vậy ô ở đây
        và ô ở khối Số liệu là CÙNG một con số, không phải hai bản sao có ngày lệch nhau. Kết quả
        cũng lấy đúng `output` mà khối Kết quả đang hiện.
      */}
      <ExampleBlock formula={spec} inputs={inputs} output={output} onChange={setValue} />
      <SourceBlock sources={spec.source} />

      {/* ── Ba bottom sheet của gói 2.5 ──────────────────────────────────── */}
      <PresetSheet
        open={sheet === 'preset'}
        onClose={() => {
          setSheet(null);
        }}
        onLoad={applyPreset}
      />

      <PasteImportSheet
        open={sheet === 'paste'}
        onClose={() => {
          setSheet(null);
        }}
        onImport={(result) => {
          setSeriesCount(result.rows.length);
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
        }}
      />

      <ExportSheet
        open={sheet === 'export'}
        onClose={() => {
          setSheet(null);
        }}
        formula={spec}
        output={output}
        inputs={inputs}
        mode={mode}
        // Người dùng vừa nạp bộ mẫu thì file xuất ra phải tự nói điều đó (bộ mẫu hiện toàn
        // là bản thảo — xem src/data/samples.ts).
        fromDraftData={loadedPreset !== null && hasDraftData()}
      />

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
  message: 'Công thức này chưa có phần tính toán.',
  fix: 'Đây là lỗi của chúng tôi, không phải của bạn. Vui lòng thử công thức khác.',
} as const;
