'use client';

import { useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { linearScale, pointerToViewBox } from '@/application';
import type { HistogramChart as HistogramModel } from '@/application';
import { usePick } from '@/application/preferences-context';
import { useLabelText } from '@/ui/i18n/units';

import styles from './chart.module.css';
import { floatingLabel, textWidth, thin, tickAnchor } from './ticks';
import { useChartSize } from './use-chart-size';
import type { ChartSize } from './use-chart-size';

/**
 * Histogram lợi suất phiên — mục "Phân phối lợi suất" của ô "Xem theo" (21/10/2026).
 *
 * Cùng ba luật với `LineChart` và `WaterfallChart`: không tính gì (khoảng, số đếm, trục và vạch đã
 * xong ở `buildDistributionModel()`), `viewBox` cố định không đo DOM, và **không gọi `useId()`** —
 * cả thư mục nằm sau ranh giới `next/dynamic`.
 *
 * Mỗi khoảng là một cột đứng từ mốc 0 (trục Y là SỐ PHIÊN, luôn chứa 0 nên cột có chỗ đứng — cùng
 * bất biến với lối Cột của đường quét). Vạch dọc đứt nét đánh dấu lợi suất bình quân và, với VaR /
 * CVaR, ngưỡng lỗ mà công thức vừa tính — cùng lớp `.markerLine` của dấu "giá trị hiện tại", vì nó
 * cũng là "con số đang hiện ở khối Kết quả, đặt lên hình".
 *
 * Rê chuột / chạm vào một khoảng thì cột ấy đậm lên và hiện "khoảng · số phiên" — đúng dòng của
 * bảng số, chỉ nhanh hơn. Bắt sự kiện bằng MỘT `<rect>` trong suốt phủ cả vùng vẽ, lý do đầy đủ ở
 * docblock `WaterfallChart`.
 */

const SIZES = {
  compact: { W: 320, H: 240 },
  wide: { W: 640, H: 400 },
} as const;

/** Lề: trên cho nhãn vạch dọc, dưới cho nhãn trục X và tên trục, trái co theo nhãn trục Y. */
const PAD = { top: 18, right: 10, bottom: 34, leftMin: 24, leftMax: 60 } as const;

const TICK_FONT_SIZE = 10;
const TICK_GAP = 5;
const FLOAT_LABEL_SIZE = 11;

/** Cách dòng giữa các nhãn vạch dọc — cũng là phần sàn nhãn dò phải hạ thêm để không đè lên chúng. */
const HANG_NHAN = 12;

/** Khe giữa hai cột, đơn vị viewBox — cột dính liền thì không đếm được từng khoảng. */
const BIN_GAP = 1;

/** Số nhãn giữ lại trên mỗi trục, theo khổ khung — cùng lẽ với `LABEL_BUDGET` của `LineChart`. */
const LABEL_BUDGET = {
  compact: { x: 5, y: 4 },
  wide: { x: 8, y: 5 },
} as const;

export interface HistogramChartProps {
  model: HistogramModel;
  /** Gốc để ghép `data-chart-svg` — bắt buộc, cùng lý do với `LineChart`. */
  idBase: string;
  /** Choán hết chỗ được cấp — màn phóng to. */
  fill?: boolean;
  size?: ChartSize;
}

export function HistogramChart({
  model,
  idBase,
  fill = false,
  size: sizeProp,
}: HistogramChartProps) {
  const pick = usePick();
  const labelText = useLabelText();
  const sizeTuDo = useChartSize();
  const size = sizeProp ?? sizeTuDo;
  const { W, H } = SIZES[size];
  const svgRef = useRef<SVGSVGElement>(null);

  /** Chỉ số khoảng đang dò, `null` khi không dò. */
  const [hover, setHover] = useState<number | null>(null);

  const { plot, sx, sy, bars, xLabels, yLabels, markers } = useMemo(() => {
    const budget = LABEL_BUDGET[size];
    const nhanY = thin(model.y.ticks, budget.y);
    const rongNhat = Math.max(0, ...nhanY.map((tick) => textWidth(tick.label, TICK_FONT_SIZE)));
    const x0 = Math.min(PAD.leftMax, Math.max(PAD.leftMin, Math.ceil(rongNhat) + TICK_GAP + 2));
    const box = { x0, x1: W - PAD.right, y0: PAD.top, y1: H - PAD.bottom } as const;

    const scaleX = linearScale(model.x.domain, [box.x0, box.x1]);
    const scaleY = linearScale(model.y.domain, [box.y1, box.y0]);
    const chanY = Math.min(Math.max(scaleY(0), box.y0), box.y1);

    return {
      plot: box,
      sx: scaleX,
      sy: scaleY,
      bars: model.bins.map((bin, index) => {
        const left = scaleX(bin.from);
        const right = scaleX(bin.to);
        const dinhY = scaleY(bin.count);
        return {
          key: index,
          x: left + BIN_GAP / 2,
          w: Math.max(0.5, right - left - BIN_GAP),
          y: Math.min(dinhY, chanY),
          /* Khoảng trống thì cột cao 0 — đúng số, không có vệt 1 đơn vị như lối Cột của đường quét. */
          h: Math.max(0, chanY - dinhY),
        };
      }),
      xLabels: thin(model.x.ticks, budget.x),
      yLabels: nhanY,
      /*
       * Vạch dọc: nhãn đặt ở mép trên vùng vẽ, lật sang trái khi vạch ở nửa phải để không tràn khung.
       * Vạch thứ hai (ngưỡng lỗ của VaR / CVaR) luôn hạ xuống một dòng, vào trong vùng vẽ.
       */
      markers: model.markers.map((marker, index) => {
        const x = scaleX(marker.value);
        const text = `${pick(marker.label)} ${labelText(marker.valueLabel)}`;
        const cho = floatingLabel(
          x,
          x > (box.x0 + box.x1) / 2 ? 'end' : 'start',
          text,
          FLOAT_LABEL_SIZE,
          W,
        );
        return {
          key: index,
          x,
          text,
          labelX: cho.x,
          anchor: cho.anchor,
          labelY: box.y0 - 4 + index * HANG_NHAN,
        };
      }),
    };
  }, [model, size, W, H, pick, labelText]);

  function handlePointerMove(event: ReactPointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (svg === null) return;
    const rect = svg.getBoundingClientRect();
    const viewPoint = pointerToViewBox(rect, event.clientX, event.clientY, W, H);
    if (viewPoint === null) return;
    const index = bars.findIndex(
      (bar) => viewPoint.x >= bar.x - BIN_GAP && viewPoint.x <= bar.x + bar.w + BIN_GAP,
    );
    setHover(index < 0 ? null : index);
  }

  function handlePointerLeave(event: ReactPointerEvent<SVGRectElement>) {
    if (event.pointerType === 'touch') return;
    setHover(null);
  }

  const hoverBin = hover === null ? undefined : model.bins[hover];
  const hoverBar = hover === null ? undefined : bars[hover];
  const hoverText =
    hoverBin === undefined ? '' : `${pick(hoverBin.label)} · ${labelText(hoverBin.countLabel)}`;
  const hoverPlace =
    hoverBar === undefined
      ? null
      : floatingLabel(
          hoverBar.x + hoverBar.w / 2,
          hoverBar.x + hoverBar.w / 2 > (plot.x0 + plot.x1) / 2 ? 'end' : 'start',
          hoverText,
          FLOAT_LABEL_SIZE,
          W,
        );

  return (
    <div className={fill ? `${styles.plot} ${styles.plotFill}` : styles.plot}>
      <svg
        ref={svgRef}
        className={fill ? `${styles.svg} ${styles.svgFill}` : styles.svg}
        data-chart-svg={idBase}
        data-histogram=""
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {model.y.ticks.map((tick) => (
          <line
            key={`grid-${String(tick.value)}`}
            className={styles.grid}
            x1={plot.x0}
            y1={sy(tick.value)}
            x2={plot.x1}
            y2={sy(tick.value)}
          />
        ))}

        <line className={styles.axis} x1={plot.x0} y1={plot.y1} x2={plot.x1} y2={plot.y1} />
        <line className={styles.axis} x1={plot.x0} y1={plot.y0} x2={plot.x0} y2={plot.y1} />

        {bars.map((bar, index) => (
          <rect
            key={`bin-${String(bar.key)}`}
            className={
              hover === index ? `${String(styles.bar)} ${String(styles.barMarked)}` : styles.bar
            }
            x={bar.x}
            y={bar.y}
            width={bar.w}
            height={bar.h}
            data-bin-count={model.bins[index]?.count}
            data-dang-do={hover === index ? '' : undefined}
          />
        ))}

        {markers.map((marker) => (
          <g
            key={`marker-${String(marker.key)}`}
            className={styles.marker}
            data-marker-value={marker.x}
          >
            <line
              className={styles.markerLine}
              x1={marker.x}
              y1={plot.y0}
              x2={marker.x}
              y2={plot.y1}
            />
            <text
              className={styles.markerLabel}
              x={marker.labelX}
              y={marker.labelY}
              textAnchor={marker.anchor}
            >
              {marker.text}
            </text>
          </g>
        ))}

        {yLabels.map((tick) => (
          <text
            key={`y-${String(tick.value)}`}
            className={styles.tick}
            x={plot.x0 - TICK_GAP}
            y={sy(tick.value) + 3}
            textAnchor="end"
          >
            {tick.label}
          </text>
        ))}

        {xLabels.map((tick) => (
          <text
            key={`x-${String(tick.value)}`}
            className={styles.tick}
            x={sx(tick.value)}
            y={plot.y1 + 13}
            textAnchor={tickAnchor(sx(tick.value), W)}
          >
            {tick.label}
          </text>
        ))}

        <text className={styles.axisTitle} x={plot.x0 - 2} y={plot.y0 - 4}>
          {pick(model.y.title)}
        </text>
        <text
          className={styles.axisTitle}
          x={(plot.x0 + plot.x1) / 2}
          y={H - 6}
          textAnchor="middle"
        >
          {pick(model.x.title)}
        </text>

        {/*
          Vùng bắt con trỏ và nhãn dò mang đúng hai `data-testid` của `LineChart`: `chart-snapshot`
          bỏ hai thứ ấy khỏi bản chép khi xuất PDF/PNG, và nó nhận diện bằng hậu tố ấy.
        */}
        <rect
          className={styles.hoverCapture}
          data-testid={`${idBase}-hover-capture`}
          x={plot.x0}
          y={plot.y0}
          width={plot.x1 - plot.x0}
          height={plot.y1 - plot.y0}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        />

        {hoverPlace !== null && hoverBar !== undefined && (
          <g className={styles.hoverOverlay} data-testid={`${idBase}-hover`}>
            <text
              className={styles.hoverLabel}
              x={hoverPlace.x}
              y={Math.max(plot.y0 + 10 + HANG_NHAN * (markers.length - 1), hoverBar.y - 4)}
              textAnchor={hoverPlace.anchor}
            >
              {hoverText}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
