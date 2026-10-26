'use client';

import { useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { linearScale, pointerToViewBox } from '@/application';
import type { ChartTick, ColumnChart as ColumnModel, SeriesTone } from '@/application';
import { usePick, useT } from '@/application/preferences-context';
import { useLabelText } from '@/ui/i18n/units';

import styles from './chart.module.css';
import { textWidth } from './ticks';
import { useChartSize } from './use-chart-size';
import type { ChartSize } from './use-chart-size';

/**
 * Hình CỘT THEO KỲ — mục "Trả nợ từng năm", "Số dư từng năm", "Từng đợt mua"… của ô "Xem theo"
 * (23/10/2026).
 *
 * Cùng ba luật với các hình khác: không tính gì (cột, tổng, nhãn, trục đã xong ở
 * `buildColumnsModel()`), `viewBox` cố định không đo DOM, và **không gọi `useId()`** — cả thư mục
 * nằm sau ranh giới `next/dynamic`.
 *
 * Mỗi kỳ một cột đứng trên mốc 0. Nhiều chuỗi thì chồng lên nhau theo thứ tự khai (khúc đầu nằm dưới
 * cùng); một chuỗi thì giá trị âm đi xuống dưới mốc 0. Chú giải nằm TRONG `<svg>` như vành khuyên: đường
 * xuất PDF / PNG chép đúng thẻ `<svg>`, và một hình cột chồng xuất ra mà không biết màu nào là gốc,
 * màu nào là lãi thì chỉ còn hai mảng màu.
 *
 * Rê chuột / chạm vào một cột thì các cột khác mờ đi và một ô nhỏ hiện tên kỳ cùng từng số — đúng dòng
 * của bảng số, chỉ nhanh hơn. Ô ấy mang `data-testid` hậu tố `-hover` nên `chart-snapshot` bỏ nó khỏi
 * file xuất, cùng vùng bắt con trỏ `-hover-capture`.
 */

const SIZES = {
  compact: { W: 320, H: 240 },
  wide: { W: 640, H: 400 },
} as const;

/** Lề: trên cho tên trục đứng (và dòng chú giải), dưới cho nhãn kỳ và tên trục ngang. */
const PAD = { top: 18, right: 10, bottom: 34, leftMin: 24, leftMax: 60 } as const;

/** Chiều cao dòng chú giải trên đầu hình, khi có. */
const LEGEND_H = 16;

const TICK_FONT_SIZE = 10;
const TICK_GAP = 5;

/** Cột chiếm bấy nhiêu phần bề ngang của kỳ, và không rộng quá bấy nhiêu đơn vị viewBox. */
const COT_PHAN = 0.68;
const COT_TOI_DA = 44;

/** Số nhãn giữ lại trên mỗi trục, theo khổ khung — cùng lẽ với `HistogramChart`. */
const LABEL_BUDGET = {
  compact: { x: 8, y: 4 },
  wide: { x: 16, y: 5 },
} as const;

/** Ô dò: cỡ chữ dòng tên, dòng số, nhịp dòng và lề trong. */
const TIP = { title: 11, text: 10, line: 14, pad: 6 } as const;

const TONE_CLASS: Readonly<Record<SeriesTone, string>> = {
  primary: styles.tonePrimary ?? '',
  teal: styles.toneSeriesTeal ?? '',
  violet: styles.toneSeriesViolet ?? '',
  muted: styles.toneSeriesMuted ?? '',
};

/**
 * Thưa nhãn trục giá trị, đếm TỪ MỐC 0 với bước đều — mốc 0 luôn có nhãn. `thin()` của trục số giữ
 * vạch đầu, cứ k vạch một, rồi vạch cuối: với cột âm (lợi suất từng kỳ) nó in −5, 5, 15, 20 và bỏ
 * mất 0 — chính mốc mà cột lỗ và cột lãi cùng đứng (đo 23/10/2026).
 */
function thuaTuKhong(ticks: ReadonlyArray<ChartTick>, keep: number): ReadonlyArray<ChartTick> {
  if (ticks.length <= keep) return ticks;
  const buoc = Math.ceil(ticks.length / keep);
  const goc = Math.max(
    0,
    ticks.findIndex((tick) => tick.value === 0),
  );
  return ticks.filter((_, index) => Math.abs(index - goc) % buoc === 0);
}

export interface ColumnChartProps {
  model: ColumnModel;
  /** Gốc để ghép `data-chart-svg` — bắt buộc, cùng lý do với `LineChart`. */
  idBase: string;
  /** Choán hết chỗ được cấp — màn phóng to. */
  fill?: boolean;
  size?: ChartSize;
}

export function ColumnChart({ model, idBase, fill = false, size: sizeProp }: ColumnChartProps) {
  const pick = usePick();
  const t = useT();
  const labelText = useLabelText();
  const sizeTuDo = useChartSize();
  const size = sizeProp ?? sizeTuDo;
  const { W, H } = SIZES[size];
  const svgRef = useRef<SVGSVGElement>(null);

  /** Chỉ số kỳ đang dò, `null` khi không dò. */
  const [hover, setHover] = useState<number | null>(null);

  const lines = useMemo(() => model.lines ?? [], [model.lines]);
  /* Chú giải chỉ khi có từ hai thứ để phân biệt: hai chuỗi, hoặc một chuỗi cạnh vạch ngang. */
  const coChuGiai = model.series.length + lines.length >= 2;

  const { plot, sy, cols, xLabels, yLabels, legend, lineLabelY } = useMemo(() => {
    const budget = LABEL_BUDGET[size];
    const nhanY = thuaTuKhong(model.y.ticks, budget.y);
    const rongNhat = Math.max(0, ...nhanY.map((tick) => textWidth(tick.label, TICK_FONT_SIZE)));
    const x0 = Math.min(PAD.leftMax, Math.max(PAD.leftMin, Math.ceil(rongNhat) + TICK_GAP + 2));
    const x1 = W - PAD.right;

    /*
     * Chú giải: các chuỗi rồi các vạch ngang, xếp từ mép trái vùng vẽ, xuống hàng khi tràn. Xếp TRƯỚC
     * khi đặt vùng vẽ, vì số hàng quyết định vùng vẽ bắt đầu ở đâu — ở 390px ba mục xuống hai hàng, và
     * bản đầu chỉ chừa một hàng nên hàng thứ hai đè lên tên trục (đo 23/10/2026).
     */
    const muc: Array<{
      key: string;
      x: number;
      y: number;
      text: string;
      kieu: 'o' | 'vach' | 'vachDut';
      tone?: SeriesTone;
    }> = [];
    let lx = x0;
    let ly = PAD.top - 4;
    const them = (key: string, text: string, kieu: 'o' | 'vach' | 'vachDut', tone?: SeriesTone) => {
      const rongMuc = 14 + textWidth(text, TICK_FONT_SIZE) * 1.1 + 12;
      if (lx + rongMuc > x1 && lx > x0) {
        lx = x0;
        ly += LEGEND_H;
      }
      muc.push({ key, x: lx, y: ly, text, kieu, ...(tone === undefined ? {} : { tone }) });
      lx += rongMuc;
    };
    if (coChuGiai) {
      for (const series of model.series)
        them(`s-${series.key}`, pick(series.label), 'o', series.tone);
      lines.forEach((line, index) =>
        them(`l-${String(index)}`, pick(line.label), line.dash === true ? 'vachDut' : 'vach'),
      );
    }
    const soHang = muc.length === 0 ? 0 : (ly - (PAD.top - 4)) / LEGEND_H + 1;

    const top = PAD.top + soHang * LEGEND_H;
    const box = { x0, x1, y0: top, y1: H - PAD.bottom } as const;

    const scaleY = linearScale(model.y.domain, [box.y1, box.y0]);
    const chanY = Math.min(Math.max(scaleY(0), box.y0), box.y1);
    const n = model.groups.length;
    const band = (box.x1 - box.x0) / Math.max(1, n);
    const rong = Math.min(COT_TOI_DA, band * COT_PHAN);

    const cot = model.groups.map((group, index) => {
      const cx = box.x0 + band * (index + 0.5);
      let duoi = 0;
      const khuc = group.values.map((value, chuoi) => {
        const tu = model.stacked ? duoi : 0;
        const toi = tu + value;
        duoi = toi;
        const yA = scaleY(tu);
        const yB = scaleY(toi);
        return {
          chuoi,
          y: Math.min(yA, yB),
          h: Math.abs(yA - yB),
        };
      });
      /* Đỉnh cột: chỗ đặt ô dò. Cột đi xuống (một chuỗi âm) thì lấy mốc 0. */
      const dinh = Math.min(chanY, ...khuc.map((part) => part.y));
      return { cx, x: cx - rong / 2, w: rong, khuc, dinh, band };
    });

    /*
     * Nhãn kỳ dưới trục: thưa ra khi nhiều kỳ, luôn giữ kỳ đầu và kỳ cuối. Không dùng `thin()` như
     * trục số: nó giữ kỳ cuối ngay cạnh nhãn trước ("19 20" dính nhau ở 390px, đo 23/10/2026), nên ở
     * đây nhãn trước kỳ cuối bị bỏ khi nó đứng quá gần kỳ cuối.
     *
     * "Quá gần" đo bằng BỀ NGANG nhãn, không bằng số kỳ: nhãn ngày '13/08' rộng gấp mấy nhãn năm '7',
     * và đếm theo kỳ thì '11/09' với '15/09' chạm nhau dưới 21 cột ở 390px (đo 23/10/2026). Một nhãn
     * cần bề ngang của nhãn dài nhất (ước như chú giải, nhân 1,1) cộng 6 đơn vị hở.
     */
    const canMotNhan =
      Math.max(0, ...model.groups.map((group) => textWidth(group.tick, TICK_FONT_SIZE) * 1.1)) + 6;
    const buoc = Math.max(1, Math.ceil(n / budget.x), Math.ceil(canMotNhan / band));
    const giu: number[] = [];
    for (let index = 0; index < n; index += buoc) giu.push(index);
    const cuoi = n - 1;
    const truocCuoi = giu[giu.length - 1];
    if (truocCuoi !== undefined && truocCuoi !== cuoi) {
      if ((cuoi - truocCuoi) * band < canMotNhan && giu.length > 1) giu.pop();
      giu.push(cuoi);
    }
    const nhanX = giu.map((index) => ({ value: index, label: model.groups[index]?.tick ?? '' }));

    /*
     * Nhãn số của vạch ngang, ở mép phải: vạch CAO HƠN đặt nhãn trên vạch, vạch thấp hơn đặt nhãn dưới
     * vạch — hai nhãn tách xa nhau thay vì cùng chen vào khe giữa hai vạch. Bản đầu đặt theo thứ tự
     * khai (vạch đầu trên, vạch sau dưới) và hai nhãn đè nhau khi vạch sau nằm cao hơn: giá vốn 35,3 và
     * trung bình cộng 38,3 nghìn ₫ của DCA (đo 23/10/2026). Kẹp trong vùng vẽ.
     */
    const caoNhat = Math.max(...lines.map((line) => line.value));
    const nhanVach = lines.map((line) => {
      const y = scaleY(line.value);
      const tren = lines.length < 2 || line.value === caoNhat;
      return Math.min(Math.max(tren ? y - 4 : y + 11, box.y0 + 9), box.y1 - 2);
    });

    return {
      plot: box,
      sy: scaleY,
      cols: cot,
      xLabels: nhanX,
      yLabels: nhanY,
      legend: muc,
      lineLabelY: nhanVach,
    };
  }, [model, lines, coChuGiai, size, W, H, pick]);

  function handlePointerMove(event: ReactPointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (svg === null) return;
    const rect = svg.getBoundingClientRect();
    const viewPoint = pointerToViewBox(rect, event.clientX, event.clientY, W, H);
    if (viewPoint === null) return;
    const index = cols.findIndex(
      (col) => Math.abs(viewPoint.x - col.cx) <= Math.max(col.w / 2, col.band / 2),
    );
    setHover(index < 0 ? null : index);
  }

  function handlePointerLeave(event: ReactPointerEvent<SVGRectElement>) {
    if (event.pointerType === 'touch') return;
    setHover(null);
  }

  /* Ô dò: tên kỳ, từng chuỗi, tổng (khi chồng), các cột phụ của bảng số. */
  const hoverGroup = hover === null ? undefined : model.groups[hover];
  const hoverCol = hover === null ? undefined : cols[hover];
  const dongDo: string[] =
    hoverGroup === undefined
      ? []
      : [
          ...model.series.map(
            (series, index) =>
              `${pick(series.label)}: ${labelText(
                hoverGroup.shortValueLabels?.[index] ?? hoverGroup.valueLabels[index] ?? '',
              )}`,
          ),
          ...(hoverGroup.totalLabel === undefined
            ? []
            : [
                `${t('chart.columnsTotal')}: ${labelText(
                  hoverGroup.shortTotalLabel ?? hoverGroup.totalLabel,
                )}`,
              ]),
          /* Cột phụ: tên không kèm đơn vị, số theo luật chữ của hình — không trộn '10.000.000 ₫'. */
          ...(hoverGroup.shortExtraLabels ?? hoverGroup.extraLabels ?? []).map((text, index) => {
            const ten = model.extraColumns?.[index];
            return `${ten === undefined ? '' : `${pick(ten)}: `}${labelText(text)}`;
          }),
        ];
  const tieuDeDo = hoverGroup === undefined ? '' : pick(hoverGroup.label);
  const oDo =
    hoverCol === undefined
      ? null
      : (() => {
          const rong =
            Math.max(
              textWidth(tieuDeDo, TIP.title) * 1.1,
              ...dongDo.map((line) => textWidth(line, TIP.text) * 1.08),
            ) +
            TIP.pad * 2;
          const cao = TIP.pad * 2 + TIP.line * (dongDo.length + 1) - 4;
          /* Bên phải cột nếu còn chỗ, không thì bên trái; dọc thì ngang đỉnh cột, kẹp trong vùng vẽ. */
          const phai = hoverCol.cx + hoverCol.w / 2 + 6;
          const x =
            phai + rong <= plot.x1
              ? phai
              : Math.max(plot.x0, hoverCol.cx - hoverCol.w / 2 - 6 - rong);
          const y = Math.min(Math.max(plot.y0, hoverCol.dinh - cao / 2), plot.y1 - cao);
          return { x, y, rong, cao };
        })();

  return (
    <div className={fill ? `${styles.plot} ${styles.plotFill}` : styles.plot}>
      <svg
        ref={svgRef}
        className={fill ? `${styles.svg} ${styles.svgFill}` : styles.svg}
        data-chart-svg={idBase}
        data-columns=""
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

        <line className={styles.axis} x1={plot.x0} y1={plot.y0} x2={plot.x0} y2={plot.y1} />

        {cols.map((col, index) => (
          <g
            key={`cot-${String(index)}`}
            className={hover !== null && hover !== index ? styles.columnDim : undefined}
            data-nhom={index}
          >
            {col.khuc.map((part) => {
              const series = model.series[part.chuoi];
              return (
                <rect
                  key={`khuc-${String(part.chuoi)}`}
                  className={`${String(styles.columnSeg)} ${series === undefined ? '' : TONE_CLASS[series.tone]}`}
                  x={col.x}
                  y={part.y}
                  width={col.w}
                  height={part.h}
                  data-chuoi={series?.key}
                  data-gia-tri={model.groups[index]?.values[part.chuoi]}
                />
              );
            })}
          </g>
        ))}

        {/* Mốc 0 vẽ SAU cột, để cột âm (một chuỗi) và cột dương cùng đứng trên một vạch rõ. */}
        <line className={styles.axis} x1={plot.x0} y1={sy(0)} x2={plot.x1} y2={sy(0)} />

        {lines.map((line, index) => {
          const y = sy(line.value);
          const dash = line.dash === true;
          return (
            <g key={`vach-${String(index)}`} data-vach-value={line.value}>
              <line
                className={dash ? styles.columnLineDash : styles.columnLine}
                x1={plot.x0}
                y1={y}
                x2={plot.x1}
                y2={y}
              />
              <text
                className={dash ? styles.columnLineLabelDash : styles.columnLineLabel}
                x={plot.x1 - 2}
                y={lineLabelY[index] ?? y - 4}
                textAnchor="end"
              >
                {labelText(line.shortValueLabel ?? line.valueLabel)}
              </text>
            </g>
          );
        })}

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

        {xLabels.map((tick) => {
          const col = cols[tick.value];
          if (col === undefined) return null;
          /*
           * Nhãn kỳ dài hơn bề cột (ngày '13/08' dưới 21 cột ở 390px) thì không thò qua mép trái vùng
           * vẽ, nơi nhãn 0 của trục dọc đứng cùng hàng (đo 23/10/2026: hai nhãn đè nhau), cũng không
           * thò qua mép phải khung. Bề ngang ước như chú giải, nhân 1,1.
           */
          const nua = (textWidth(tick.label, TICK_FONT_SIZE) * 1.1) / 2;
          const x = Math.min(Math.max(col.cx, plot.x0 + nua + 1), W - 2 - nua);
          return (
            <text
              key={`x-${String(tick.value)}`}
              className={styles.tick}
              x={x}
              y={plot.y1 + 13}
              textAnchor="middle"
            >
              {tick.label}
            </text>
          );
        })}

        <text className={styles.axisTitle} x={plot.x0 - 2} y={plot.y0 - 4}>
          {pick(model.y.title)}
        </text>
        <text
          className={styles.axisTitle}
          x={(plot.x0 + plot.x1) / 2}
          y={H - 6}
          textAnchor="middle"
        >
          {pick(model.xTitle)}
        </text>

        {legend.map((item) => (
          <g
            key={item.key}
            className={item.tone === undefined ? undefined : TONE_CLASS[item.tone]}
            data-chu-giai=""
          >
            {item.kieu === 'o' ? (
              <rect
                className={styles.columnSwatch}
                x={item.x}
                y={item.y - 8}
                width={9}
                height={9}
                rx={2}
              />
            ) : (
              <line
                className={item.kieu === 'vachDut' ? styles.columnLineDash : styles.columnLine}
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
          className={`${String(styles.hoverCapture)} ${String(styles.hoverCapturePhan)}`}
          data-testid={`${idBase}-hover-capture`}
          x={plot.x0}
          y={plot.y0}
          width={plot.x1 - plot.x0}
          height={plot.y1 - plot.y0}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        />

        {oDo !== null && (
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
              {tieuDeDo}
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
