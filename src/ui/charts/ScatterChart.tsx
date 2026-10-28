'use client';

import { useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { linearScale, pointerToViewBox } from '@/application';
import type { ScatterChart as ScatterModel } from '@/application';
import { usePick } from '@/application/preferences-context';
import { useLabelText } from '@/ui/i18n/units';

import styles from './chart.module.css';
import { CHAN, xepChuGiaiDuoi } from './chu-giai-duoi';
import { textWidth, thin, tickAnchor } from './ticks';
import { useChartSize } from './use-chart-size';
import type { ChartSize } from './use-chart-size';

/**
 * Hình phân tán lợi suất — mục "Phân tán lợi suất" của ô "Xem theo", riêng cho Beta (26/10/2026).
 *
 * Cùng ba luật với các hình khác: không tính gì (lợi suất, trục, đường hồi quy đã xong ở
 * `buildScatterModel()`), `viewBox` cố định không đo DOM, và **không gọi `useId()`** — cả thư mục
 * nằm sau ranh giới `next/dynamic`.
 *
 * Mỗi phiên một chấm hơi trong, để chỗ nhiều phiên chồng lên nhau đậm hơn. Hai vạch 0 chia bốn góc:
 * trên phải là phiên cả hai cùng tăng, dưới trái cùng giảm. Đường hồi quy màu của "con số ở khối Kết
 * quả" (như vạch VaR của histogram), vì độ dốc của nó CHÍNH LÀ Beta. Chú giải nằm TRONG `<svg>` như
 * hình cột: file xuất PDF / PNG chép đúng thẻ `<svg>`. Nó đứng ở ĐÁY hình, dưới tên trục ngang, từ
 * 28/10/2026 (`chu-giai-duoi.ts`); trước đó nó ở đầu hình, sát trên tên trục đứng.
 *
 * Rê chuột / chạm thì chấm gần nhất đậm lên và một ô nhỏ hiện ngày cùng hai lợi suất — đúng dòng của
 * bảng số. Ô ấy mang hậu tố `-hover`, vùng bắt con trỏ hậu tố `-hover-capture`, nên `chart-snapshot`
 * bỏ cả hai khỏi file xuất.
 */

const SIZES = {
  compact: { W: 320, H: 260 },
  wide: { W: 640, H: 400 },
} as const;

/**
 * Lề: trên cho tên trục đứng, dưới cho nhãn trục ngang và tên trục ngang. Chú giải ở đáy lấy thêm chỗ
 * dưới cùng (`xepChuGiaiDuoi()`), không nằm trong `bottom`.
 */
const PAD = { top: 18, right: 10, bottom: 34, leftMin: 24, leftMax: 60 } as const;

const TICK_FONT_SIZE = 10;
const TICK_GAP = 5;

/** Bán kính chấm, theo khổ khung — 250 chấm ở 320 đơn vị bề ngang mà to quá thì thành một mảng. */
const DOT_R = { compact: 2.4, wide: 3.2 } as const;

/** Con trỏ cách chấm gần nhất quá chừng này đơn vị viewBox thì không dò chấm nào. */
const DO_TOI_DA = 16;

const LABEL_BUDGET = {
  compact: { x: 5, y: 4 },
  wide: { x: 8, y: 5 },
} as const;

/** Ô dò: cỡ chữ dòng ngày, dòng số, nhịp dòng và lề trong — cùng số với ô dò của hình cột. */
const TIP = { title: 11, text: 10, line: 14, pad: 6 } as const;

/**
 * Đoạn của đường `y = a + b·x` nằm trong hộp — cắt theo cả bốn cạnh, trong hệ SỐ LIỆU. Không cắt
 * thì đường dốc chạy thò ra ngoài vùng vẽ, đè lên nhãn trục; dùng `clipPath` thì phải đặt `id`, mà
 * bản xuất là bản chép thứ ba của cùng hình trong một tài liệu.
 */
function doanTrongHop(
  a: number,
  b: number,
  [x0, x1]: readonly [number, number],
  [y0, y1]: readonly [number, number],
): readonly [readonly [number, number], readonly [number, number]] | null {
  let lo = x0;
  let hi = x1;
  if (b !== 0) {
    const tA = (y0 - a) / b;
    const tB = (y1 - a) / b;
    lo = Math.max(lo, Math.min(tA, tB));
    hi = Math.min(hi, Math.max(tA, tB));
  } else if (a < y0 || a > y1) {
    return null;
  }
  if (!(hi > lo)) return null;
  return [
    [lo, a + b * lo],
    [hi, a + b * hi],
  ];
}

export interface ScatterChartProps {
  model: ScatterModel;
  /** Gốc để ghép `data-chart-svg` — bắt buộc, cùng lý do với `LineChart`. */
  idBase: string;
  /** Choán hết chỗ được cấp — màn phóng to. */
  fill?: boolean;
  size?: ChartSize;
}

export function ScatterChart({ model, idBase, fill = false, size: sizeProp }: ScatterChartProps) {
  const pick = usePick();
  const labelText = useLabelText();
  const sizeTuDo = useChartSize();
  const size = sizeProp ?? sizeTuDo;
  const { W, H } = SIZES[size];
  const svgRef = useRef<SVGSVGElement>(null);

  /** Chỉ số chấm đang dò, `null` khi không dò. */
  const [hover, setHover] = useState<number | null>(null);

  const { plot, sx, sy, dots, xLabels, yLabels, legend, xTitleY, fitLine } = useMemo(() => {
    const budget = LABEL_BUDGET[size];
    const nhanY = thin(model.y.ticks, budget.y);
    const rongNhat = Math.max(0, ...nhanY.map((tick) => textWidth(tick.label, TICK_FONT_SIZE)));
    const x0 = Math.min(PAD.leftMax, Math.max(PAD.leftMin, Math.ceil(rongNhat) + TICK_GAP + 2));
    const x1 = W - PAD.right;

    /*
     * Chú giải: chấm rồi đường hồi quy, ở ĐÁY hình dưới tên trục ngang (28/10/2026, xem
     * `chu-giai-duoi.ts`) — xếp TRƯỚC khi đặt vùng vẽ, vì số hàng quyết định đáy vùng vẽ ở đâu.
     */
    const { muc, cao } = xepChuGiaiDuoi<{ key: string; text: string; kieu: 'cham' | 'vach' }>(
      [
        { key: 'cham', text: pick(model.pointLabel), kieu: 'cham' },
        ...(model.fit === undefined
          ? []
          : [{ key: 'vach', text: pick(model.fit.label), kieu: 'vach' as const }]),
      ],
      x0,
      x1,
      W,
      H,
    );

    const box = { x0, x1, y0: PAD.top, y1: H - PAD.bottom - cao } as const;
    const scaleX = linearScale(model.x.domain, [box.x0, box.x1]);
    const scaleY = linearScale(model.y.domain, [box.y1, box.y0]);

    const fit = model.fit;
    const doan =
      fit === undefined
        ? null
        : doanTrongHop(fit.intercept, fit.slope, model.x.domain, model.y.domain);

    return {
      plot: box,
      sx: scaleX,
      sy: scaleY,
      dots: model.points.map((point) => ({ cx: scaleX(point.x), cy: scaleY(point.y) })),
      xLabels: thin(model.x.ticks, budget.x),
      yLabels: nhanY,
      legend: muc,
      xTitleY: H - CHAN - cao,
      fitLine:
        doan === null
          ? null
          : {
              x1: scaleX(doan[0][0]),
              y1: scaleY(doan[0][1]),
              x2: scaleX(doan[1][0]),
              y2: scaleY(doan[1][1]),
            },
    };
  }, [model, size, W, H, pick]);

  const r = DOT_R[size];

  function handlePointerMove(event: ReactPointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (svg === null) return;
    const rect = svg.getBoundingClientRect();
    const viewPoint = pointerToViewBox(rect, event.clientX, event.clientY, W, H);
    if (viewPoint === null) return;
    let gan = -1;
    let khoang = DO_TOI_DA;
    dots.forEach((dot, index) => {
      const d = Math.hypot(dot.cx - viewPoint.x, dot.cy - viewPoint.y);
      if (d <= khoang) {
        khoang = d;
        gan = index;
      }
    });
    setHover(gan < 0 ? null : gan);
  }

  function handlePointerLeave(event: ReactPointerEvent<SVGRectElement>) {
    if (event.pointerType === 'touch') return;
    setHover(null);
  }

  /* Ô dò: ngày phiên, rồi lợi suất VN-Index và lợi suất cổ phiếu — tên lấy từ tên trục, bỏ "(%)". */
  const hoverPoint = hover === null ? undefined : model.points[hover];
  const hoverDot = hover === null ? undefined : dots[hover];
  const tenTruc = (title: string) => title.replace(/\s*\(%\)\s*$/, '');
  const dongDo =
    hoverPoint === undefined
      ? []
      : [
          `${tenTruc(pick(model.x.title))}: ${labelText(hoverPoint.xLabel)}`,
          `${tenTruc(pick(model.y.title))}: ${labelText(hoverPoint.yLabel)}`,
        ];
  const oDo =
    hoverPoint === undefined || hoverDot === undefined
      ? null
      : (() => {
          const rong =
            Math.max(
              textWidth(hoverPoint.label, TIP.title) * 1.1,
              ...dongDo.map((line) => textWidth(line, TIP.text) * 1.08),
            ) +
            TIP.pad * 2;
          const cao = TIP.pad * 2 + TIP.line * (dongDo.length + 1) - 4;
          /* Bên phải chấm nếu còn chỗ, không thì bên trái; dọc thì ngang chấm, kẹp trong vùng vẽ. */
          const phai = hoverDot.cx + 8;
          const x = phai + rong <= plot.x1 ? phai : Math.max(plot.x0, hoverDot.cx - 8 - rong);
          const y = Math.min(Math.max(plot.y0, hoverDot.cy - cao / 2), plot.y1 - cao);
          return { x, y, rong, cao };
        })();

  return (
    <div className={fill ? `${styles.plot} ${styles.plotFill}` : styles.plot}>
      <svg
        ref={svgRef}
        className={fill ? `${styles.svg} ${styles.svgFill}` : styles.svg}
        data-chart-svg={idBase}
        data-scatter=""
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {model.y.ticks.map((tick) => (
          <line
            key={`grid-y-${String(tick.value)}`}
            className={styles.grid}
            x1={plot.x0}
            y1={sy(tick.value)}
            x2={plot.x1}
            y2={sy(tick.value)}
          />
        ))}
        {model.x.ticks.map((tick) => (
          <line
            key={`grid-x-${String(tick.value)}`}
            className={styles.grid}
            x1={sx(tick.value)}
            y1={plot.y0}
            x2={sx(tick.value)}
            y2={plot.y1}
          />
        ))}

        <line className={styles.axis} x1={plot.x0} y1={plot.y1} x2={plot.x1} y2={plot.y1} />
        <line className={styles.axis} x1={plot.x0} y1={plot.y0} x2={plot.x0} y2={plot.y1} />

        {/* Hai vạch 0 — miền của hai trục luôn chứa 0 (`buildScatterModel()`), nên luôn kẻ được. */}
        <line
          className={styles.zeroRule}
          data-vach-khong="x"
          x1={sx(0)}
          y1={plot.y0}
          x2={sx(0)}
          y2={plot.y1}
        />
        <line
          className={styles.zeroRule}
          data-vach-khong="y"
          x1={plot.x0}
          y1={sy(0)}
          x2={plot.x1}
          y2={sy(0)}
        />

        {dots.map((dot, index) => (
          <circle
            key={`cham-${String(index)}`}
            className={
              hover === index
                ? `${String(styles.scatterDot)} ${String(styles.scatterDotMarked)}`
                : styles.scatterDot
            }
            cx={dot.cx}
            cy={dot.cy}
            r={hover === index ? r + 1.5 : r}
            data-dang-do={hover === index ? '' : undefined}
          />
        ))}

        {fitLine !== null && (
          <line
            className={styles.scatterFit}
            data-duong-hoi-quy={model.fit?.slope}
            x1={fitLine.x1}
            y1={fitLine.y1}
            x2={fitLine.x2}
            y2={fitLine.y2}
          />
        )}

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
          y={xTitleY}
          textAnchor="middle"
        >
          {pick(model.x.title)}
        </text>

        {legend.map((item) => (
          <g key={item.key} data-chu-giai="">
            {item.kieu === 'cham' ? (
              <circle className={styles.scatterDot} cx={item.x + 4.5} cy={item.y - 3.5} r={3.2} />
            ) : (
              <line
                className={styles.scatterFit}
                x1={item.x}
                y1={item.y - 3.5}
                x2={item.x + 10}
                y2={item.y - 3.5}
              />
            )}
            <text className={styles.columnLegendText} x={item.x + 14} y={item.y}>
              {item.text}
            </text>
          </g>
        ))}

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

        {oDo !== null && hoverPoint !== undefined && (
          <g className={styles.hoverOverlay} data-testid={`${idBase}-hover`}>
            <rect
              className={styles.columnTipBox}
              x={oDo.x}
              y={oDo.y}
              width={oDo.rong}
              height={oDo.cao}
              rx={4}
            />
            <text className={styles.columnTipTitle} x={oDo.x + TIP.pad} y={oDo.y + TIP.pad + 9}>
              {hoverPoint.label}
            </text>
            {dongDo.map((line, index) => (
              <text
                key={`do-${String(index)}`}
                className={styles.columnTipText}
                x={oDo.x + TIP.pad}
                y={oDo.y + TIP.pad + 9 + TIP.line * (index + 1)}
              >
                {line}
              </text>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
