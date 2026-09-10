'use client';

import { useMemo } from 'react';

import { CANDLE_RANGE_SESSIONS, buildCandleModel, formatNumber, linearScale } from '@/application';
import type { CandleRange, MessageKey, SeriesRow } from '@/application';
import { useT } from '@/application/preferences-context';
import { useChartSize, type ChartSize } from '@/ui/charts/use-chart-size';

import styles from './CandleChart.module.css';

export interface CandleChartProps {
  /** Bảng theo thứ tự THỜI GIAN (cũ → mới) — xem `sortRowsByDate()`. */
  rows: ReadonlyArray<SeriesRow>;
  /** Mã cổ phiếu đang xem. Rỗng thì đầu thẻ không có huy hiệu mã. */
  code: string;
  range: CandleRange;
  onRangeChange: (range: CandleRange) => void;
}

/*
 * HAI khổ khung vẽ, không phải một — dùng lại nguyên lý và nguyên cả hook của `LineChart`.
 *
 * Chữ trong SVG đo bằng ĐƠN VỊ VIEWBOX nên nó phóng y hệt hình: một `viewBox` duy nhất thì hoặc
 * chữ to như tiêu đề trên PC, hoặc bé không đọc nổi trên điện thoại. Đo được ở 360px với khung
 * 960 đơn vị: chữ trục hiện ra **3,2px**. Docblock `use-chart-size.ts` ghi đủ vì sao không chữa
 * bằng media query cỡ chữ — mọi khoảng cách quanh chữ trong file này đều tính theo chữ 10 đơn vị.
 *
 * `wide` 960×300 chứ không 640×400 như biểu đồ công thức: hình này bày 248 cây nến cạnh nhau nên
 * nó cần BỀ NGANG chứ không cần chiều cao. Ở khung rộng 1263px trên màn thật, chữ hiện ra 13,2px.
 * `compact` 360×240 cho chữ 8,6px ở khổ điện thoại 310px — nhỏ nhưng đọc được, và vùng vẽ vẫn còn
 * 296 đơn vị, tức 1,2 đơn vị mỗi phiên khi bảng đầy 248 dòng.
 */
const SIZES = {
  compact: { W: 360, H: 240 },
  wide: { W: 960, H: 300 },
} as const;

/*
 * Lề PHẢI rộng, lề TRÁI hẹp — bản vẽ đặt nhãn giá ở bên PHẢI, đúng thói quen của bảng giá chứng
 * khoán: mắt dò giá mới nhất, mà giá mới nhất nằm ở mép phải của hình.
 *
 * 56 đơn vị cho nhãn giá: `formatNumber` cho ra tối đa dạng '1.234.567' (9 ký tự), ước lượng
 * 4,9 đơn vị mỗi ký tự ở cỡ chữ 10 là 44, cộng khe 6 và thẻ giá cuối cùng nhô ra.
 *
 * GIỮ NGUYÊN ở cả hai khổ — đây là hằng số tính theo CHỮ, mà chữ không đổi. Thu nó theo khung là
 * đúng cái sai mà `use-chart-size.ts` cảnh báo.
 */
const PAD = { top: 10, right: 56, bottom: 26, left: 8 } as const;

/** Dải khối lượng chiếm phần đáy vùng vẽ. Giá chiếm phần trên. */
const VOLUME_SHARE = 0.22;
/** Khe giữa hai dải, để cột khối lượng không dính đáy nến. */
const BAND_GAP = 8;

/** Bề ngang thân nến so với một bậc. Phần dư là khe — cùng lý do đã ghi ở `LineChart`. */
const BODY_SHARE = 0.68;
/** Thân nến hẹp nhất còn nhìn ra là một hình khối, tính bằng đơn vị viewBox. */
const MIN_BODY = 0.8;

/**
 * Số nhãn vạch trục X giữ lại, theo khổ khung.
 *
 * Bản vẽ đếm được 12 mốc tháng trên chuỗi 248 phiên — đó là khổ `wide`. Khổ `compact` chỉ có 296
 * đơn vị vùng vẽ, mà mỗi nhãn 'MM/YY' rộng ~24,5, nên 12 nhãn chiếm 294 đơn vị và dính liền nhau
 * thành một vệt. Bốn nhãn là hai đầu cộng hai mốc giữa: rẻ nhất mà vẫn đọc được.
 */
const X_LABELS = { compact: 4, wide: 12 } as const;

/**
 * Nửa bề ngang dự phòng của một nhãn trục X, tính bằng đơn vị viewBox.
 *
 * Nhãn ở đây luôn dạng 'MM/YY' — 5 ký tự, cỡ chữ 10 đơn vị. Theo mốc 4,9 đơn vị mỗi ký tự mà
 * `ticks.ts` đo được trên Chrome thật thì cả nhãn rộng ~24,5, nửa là ~13. Lấy 16 cho rộng tay:
 * một nhãn bị đẩy vào trong sớm hơn cần thiết thì không ai nhận ra, một nhãn bị cắt cụt thì mất chữ.
 */
const HALF_LABEL = 16;

/** Vùng vẽ và hai mốc chia dải, suy từ khổ khung. */
function khungOf(size: ChartSize) {
  const { W, H } = SIZES[size];
  const y0 = PAD.top;
  const y1 = H - PAD.bottom;
  return {
    W,
    H,
    x0: PAD.left,
    x1: W - PAD.right,
    y0,
    y1,
    priceBottom: y1 - (y1 - y0) * VOLUME_SHARE - BAND_GAP,
    volumeTop: y1 - (y1 - y0) * VOLUME_SHARE,
  } as const;
}

/**
 * Nhãn trục X: rút gọn ngày thành 'MM/YY' khi đọc được, còn lại giữ nguyên chữ người dùng gõ.
 *
 * Không gọi `parseSeriesDate()`: nhãn chỉ cần một chuỗi ngắn, và ô ngày có thể là số thứ tự phiên
 * ('1', '2', …) — thứ không phải ngày nhưng vẫn là mốc hợp lệ để bày trên trục.
 */
function nhanTruc(date: string): string {
  const iso = /^(\d{4})-(\d{1,2})-\d{1,2}$/.exec(date.trim());
  if (iso !== null) return `${(iso[2] ?? '').padStart(2, '0')}/${(iso[1] ?? '').slice(2)}`;

  const dmy = /^\d{1,2}[-/.](\d{1,2})[-/.](\d{4})$/.exec(date.trim());
  if (dmy !== null) return `${(dmy[1] ?? '').padStart(2, '0')}/${(dmy[2] ?? '').slice(2)}`;

  return date.trim().slice(0, 8);
}

/** Bốn nút của thanh chọn khoảng, đúng thứ tự bản vẽ. */
const RANGES: ReadonlyArray<{ value: CandleRange; labelKey: MessageKey }> = [
  { value: '1m', labelKey: 'series.range.1m' },
  { value: '3m', labelKey: 'series.range.3m' },
  { value: '6m', labelKey: 'series.range.6m' },
  { value: 'all', labelKey: 'series.range.all' },
];

/**
 * Biểu đồ nến của màn bảng chuỗi giá WF-05 — bản vẽ "Chuỗi giá OHLCV" của chủ dự án.
 *
 * Vẽ chính cái bảng đang gõ ở dưới, nên nó là một tấm gương chứ không phải một phép tính: sửa một
 * ô là hình đổi theo ngay, và **phiên nào đang lỗi thì không được vẽ**. Con số phiên lỗi hiện ở
 * hàng chú thích — hình thiếu phiên mà không nói ra là đúng loại im lặng FR-06 sinh ra để chặn.
 *
 * ── Ba điều KHÔNG làm ở đây ────────────────────────────────────────────────────────────────────
 *
 * 1. **Không `useId()`.** Cùng luật với `src/ui/charts/`: id sinh ra ở máy chủ khác ở máy khách.
 *    Ở đây id được suy từ một hằng số, và cả màn chỉ có một hình nên không có chuyện trùng.
 * 2. **Không đo DOM.** `viewBox` cố định, `preserveAspectRatio` lo phần phóng theo khung ngoài.
 * 3. **Không tự tính lại chuỗi.** Mọi phép chọn đoạn, lọc lỗi và chia vạch nằm ở
 *    `buildCandleModel()` bên Domain, test được bằng Node.
 */
export function CandleChart({ rows, code, range, onRangeChange }: CandleChartProps) {
  const t = useT();
  /*
   * Hook của thư mục `charts`, nhập THẲNG từ file chứ không qua barrel `@/ui/charts`: barrel ấy chỉ
   * mở `FormulaChart`/`hasChart`, và đi qua nó là kéo cả thư mục biểu đồ công thức vào gói của màn
   * này. File hook chỉ có React và `matchMedia`, không kéo theo gì.
   */
  const size = useChartSize();
  const K = useMemo(() => khungOf(size), [size]);

  const model = useMemo(() => buildCandleModel(rows, range), [rows, range]);

  const { bars, priceAxis, volumeMax } = model;

  const toY = useMemo(
    () => linearScale(priceAxis.domain, [K.priceBottom, K.y0]),
    [priceAxis.domain, K],
  );
  const toVolY = useMemo(
    () => linearScale([0, volumeMax === 0 ? 1 : volumeMax], [K.y1, K.volumeTop]),
    [volumeMax, K],
  );

  const step = bars.length === 0 ? 0 : (K.x1 - K.x0) / bars.length;
  const bodyW = Math.max(MIN_BODY, step * BODY_SHARE);
  const xOf = (position: number) => K.x0 + step * (position + 0.5);

  /*
   * Giữ chừng 12 nhãn trục X — cùng phép `thin()` của biểu đồ công thức, thêm một luật.
   *
   * Luật thêm: **không in hai nhãn giống hệt nhau liền kề**. Nhãn ở đây rút về 'MM/YY', nên hai
   * mốc cách nhau vài phiên thường rơi vào cùng một tháng — đo được trên chuỗi 246 phiên: hai mốc
   * cuối ở vị trí 231 và 245 cùng in ra '12/25', và trục hiện ra hai nhãn giống nhau cạnh nhau.
   * Đọc ra là một lỗi chứ không ra hai mốc.
   *
   * Lọc theo CHỮ chứ không theo khoảng cách: nguyên nhân là hai phiên cùng tháng, không phải hai
   * phiên gần nhau — một chuỗi thưa (tuần một phiên) thì hai mốc cách 14 phiên lại khác tháng thật
   * và đáng in cả hai.
   */
  const xTicks = useMemo(() => {
    if (bars.length === 0) return [];
    const stride = Math.max(1, Math.ceil(bars.length / X_LABELS[size]));
    const chon = bars
      .map((bar, position) => ({ bar, position, label: nhanTruc(bar.date) }))
      .filter((entry) => entry.position % stride === 0 || entry.position === bars.length - 1);

    return chon.filter((entry, i) => i === 0 || chon[i - 1]?.label !== entry.label);
  }, [bars, size]);

  const lastY = model.last === null ? null : toY(model.last);

  const doiChieu =
    model.changePct === null
      ? ''
      : `${model.changePct >= 0 ? '+' : '−'}${formatNumber(Math.abs(model.changePct), { maxDecimals: 1 })}%`;

  return (
    <figure className={styles.card}>
      <div className={styles.head}>
        <div className={styles.identity}>
          {code !== '' && <span className={styles.code}>{code}</span>}
          <span className={styles.meta}>
            {formatNumber(model.drawnCount)} {t('series.sessions')}
            {model.firstDate === '' ? '' : ` · ${model.firstDate} → ${model.lastDate}`}
          </span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>
            {model.last === null ? '—' : formatNumber(model.last, { maxDecimals: 2 })}
          </span>
          {model.changePct !== null && (
            <span className={model.changePct >= 0 ? styles.changeUp : styles.changeDown}>
              {doiChieu} {t('series.overPeriod')}
            </span>
          )}
        </div>
      </div>

      {/* Thanh chọn khoảng. `role="group"` chứ không phải tablist: nó không đổi vùng nội dung nào,
          nó chỉ thu hẹp đoạn đang vẽ — cùng vai với nhóm Đường/Cột của biểu đồ công thức. */}
      <div className={styles.ranges} role="group" aria-label={t('series.rangeLabel')}>
        {RANGES.map((item) => {
          const sessions = CANDLE_RANGE_SESSIONS[item.value];
          return (
            <button
              key={item.value}
              type="button"
              className={styles.range}
              aria-pressed={range === item.value}
              /* Nút ghi "1T" nhưng cắt theo SỐ PHIÊN — nói ra chỗ đó, đừng để người dùng tự đoán. */
              title={
                sessions === null
                  ? t('series.rangeAllHint')
                  : `${t('series.rangeHint')} ${String(sessions)}`
              }
              onClick={() => {
                onRangeChange(item.value);
              }}
            >
              {t(item.labelKey)}
            </button>
          );
        })}
      </div>

      {bars.length === 0 ? (
        <p className={styles.blank}>{t('series.chartBlank')}</p>
      ) : (
        <svg
          className={styles.svg}
          data-size={size}
          viewBox={`0 0 ${String(K.W)} ${String(K.H)}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${t('series.chartLabel')} — ${formatNumber(model.drawnCount)} ${t('series.sessions')}`}
        >
          {/* Đường lưới ngang cộng nhãn giá bên phải. */}
          {priceAxis.ticks.map((value) => {
            const y = toY(value);
            return (
              <g key={value}>
                <line className={styles.grid} x1={K.x0} x2={K.x1} y1={y} y2={y} />
                <text className={styles.tick} x={K.x1 + 6} y={y + 3} textAnchor="start">
                  {formatNumber(value, { maxDecimals: priceAxis.decimals })}
                </text>
              </g>
            );
          })}

          {/* Vệt vàng đánh dấu phiên lỗi: nó nằm trong đoạn đang xem nhưng KHÔNG được vẽ nến. Bản
              vẽ để hai vệt ấy ở mép trái, đúng chỗ hai phiên hỏng của bộ mẫu. */}
          {model.skippedIndices.map((index) => {
            /* Chèn vào đúng khe giữa hai phiên vẽ được gần nó nhất, tính theo vị trí trong bảng. */
            const truoc = bars.filter((bar) => bar.index < index).length;
            return (
              <rect
                key={index}
                className={styles.badBand}
                x={K.x0 + step * truoc - bodyW / 2}
                y={K.y0}
                width={Math.max(bodyW, 2)}
                height={K.priceBottom - K.y0}
              />
            );
          })}

          {/* Cột khối lượng. Vẽ TRƯỚC nến để nến nằm trên khi hai dải chạm nhau. */}
          {volumeMax > 0 &&
            bars.map((bar, position) => {
              if (bar.volume === null || !Number.isFinite(bar.volume) || bar.volume <= 0) {
                return null;
              }
              const y = toVolY(bar.volume);
              return (
                <rect
                  key={`v${String(bar.index)}`}
                  className={styles.volume}
                  x={xOf(position) - bodyW / 2}
                  y={y}
                  width={bodyW}
                  height={Math.max(0.5, K.y1 - y)}
                />
              );
            })}

          {/* Nến: bấc từ giá thấp tới giá cao, thân từ giá mở tới giá đóng. */}
          {bars.map((bar, position) => {
            const x = xOf(position);
            const cao = bar.high ?? Math.max(bar.open ?? bar.close, bar.close);
            const thap = bar.low ?? Math.min(bar.open ?? bar.close, bar.close);
            const mo = bar.open ?? bar.close;

            const yCao = toY(cao);
            const yThap = toY(thap);
            const yMo = toY(mo);
            const yDong = toY(bar.close);

            const top = Math.min(yMo, yDong);
            /* Phiên đứng giá cho thân cao 0 — nới lên 1 đơn vị, nếu không cây nến biến mất hẳn. */
            const cao2 = Math.max(1, Math.abs(yDong - yMo));
            const tone = bar.up ? styles.up : styles.down;

            return (
              <g key={bar.index} className={tone}>
                <line className={styles.wick} x1={x} x2={x} y1={yCao} y2={yThap} />
                <rect
                  className={styles.body}
                  x={x - bodyW / 2}
                  y={top}
                  width={bodyW}
                  height={cao2}
                />
              </g>
            );
          })}

          {/* Mốc giá đóng cửa gần nhất — đường đứt chạy hết bề ngang cộng thẻ giá ở mép phải. */}
          {lastY !== null && model.last !== null && (
            <g>
              <line className={styles.lastLine} x1={K.x0} x2={K.x1} y1={lastY} y2={lastY} />
              <rect
                className={styles.lastTag}
                x={K.x1 + 2}
                y={lastY - 8}
                width={52}
                height={16}
                rx={3}
              />
              <text className={styles.lastText} x={K.x1 + 28} y={lastY + 4} textAnchor="middle">
                {formatNumber(model.last, { maxDecimals: priceAxis.decimals })}
              </text>
            </g>
          )}

          {/*
            Nhãn trục X. Hai nhãn ngoài cùng ĐỔI CÁCH CANH thay vì canh giữa: `<svg>` cắt mọi thứ
            vượt qua `x = 0`, nên nhãn đầu canh giữa tại x = 8 mất luôn chữ số đầu — đo được trên
            Chrome, '01/25' hiện ra thành ')1/25'. Cùng bài học mà `tickAnchor()` bên `ticks.ts`
            ghi lại cho biểu đồ công thức; chép luật chứ không import, vì file kia cố ý không xuất
            ra ngoài thư mục `charts`.
          */}
          {xTicks.map((entry) => {
            const x = xOf(entry.position);
            const anchor = x < HALF_LABEL ? 'start' : K.W - x < HALF_LABEL ? 'end' : 'middle';
            return (
              <text
                key={entry.bar.index}
                className={styles.tick}
                x={anchor === 'start' ? 0 : anchor === 'end' ? K.W : x}
                y={K.y1 + 16}
                textAnchor={anchor}
              >
                {entry.label}
              </text>
            );
          })}
        </svg>
      )}

      {/*
        Chú thích. Mỗi mục có một chấm màu VÀ một chữ — dấu hiệu không được chỉ nằm ở màu
        (NFR-USA-06), và với biểu đồ nến thì màu đỏ/xanh là thứ đầu tiên người mù màu mất.
      */}
      <figcaption className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotUp}`} aria-hidden="true" />
          {t('series.legendUp')}
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotDown}`} aria-hidden="true" />
          {t('series.legendDown')}
        </span>
        {volumeMax > 0 && (
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotVolume}`} aria-hidden="true" />
            {t('series.colVolume')}
          </span>
        )}
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotLast}`} aria-hidden="true" />
          {t('series.legendLast')}
        </span>
        {model.skippedCount > 0 && (
          <span className={`${styles.legendItem} ${styles.legendBad}`}>
            <span className={`${styles.dot} ${styles.dotBad}`} aria-hidden="true" />
            {formatNumber(model.skippedCount)} {t('series.legendSkipped')}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
