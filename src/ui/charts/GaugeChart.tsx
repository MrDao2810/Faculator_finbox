'use client';

import type { GaugeChart as GaugeModel, SeriesTone } from '@/application';
import { usePick } from '@/application/preferences-context';
import { useLabelText } from '@/ui/i18n/units';

import styles from './chart.module.css';
import { textWidth } from './ticks';
import { useChartSize } from './use-chart-size';
import type { ChartSize } from './use-chart-size';

/**
 * THANG ĐO — mục "Thang đo" của ô "Xem theo" (23/10/2026), kiểu hình mới thứ tư chủ dự án chọn.
 *
 * Nửa vòng cung từ đầu thang (trái) tới cuối thang (phải), chia đúng các vùng công thức khai —
 * RSI 30/70, Stochastic 20/80, %B ở hai dải. Vùng chứa kết quả đậm, các vùng khác mờ; kim chỉ kết
 * quả. Số nằm ngoài thang (%B vượt dải xa) thì kim nằm ở đầu thang còn chữ dưới kim vẫn in đúng số
 * thật — kim là VỊ TRÍ, chữ là CON SỐ.
 *
 * Cùng ba luật với các hình khác: không tính gì (vùng, khoảng, nhãn đã xong ở `buildGaugeModel()`),
 * `viewBox` cố định không đo DOM, không `useId()`. Chú giải các vùng nằm TRONG `<svg>`, để file xuất
 * PDF / PNG còn biết màu nào là vùng nào.
 */

/*
 * Hai khổ bày chú giải hai kiểu, cùng nếp vành khuyên: điện thoại xếp chú giải thành hàng dưới vòng
 * cung; PC đặt vòng cung bên trái và chú giải thành CỘT bên phải (tên vùng, rồi khoảng của nó) — một
 * vòng cung đứng giữa khung rộng để lại hai mảng trống, đúng thứ chủ dự án chê ở vành khuyên.
 * `valueGap` / `zoneGap`: chân dòng số và dòng tên vùng tính từ chốt kim; cách nhau đủ để hộp chữ của
 * số (cỡ lớn, đậm) không chạm dòng tên vùng (đo 23/10/2026: 26 / 40 ở điện thoại thì chạm).
 */
const KHO = {
  compact: { W: 320, R: 104, top: 16, value: 17, zone: 10, valueGap: 26, zoneGap: 44, cx: 160 },
  wide: { W: 640, R: 150, top: 20, value: 22, zone: 12, valueGap: 34, zoneGap: 56, cx: 210 },
} as const;

/** Cột chú giải của khổ PC: mép trái, nhịp giữa hai vùng, cỡ chữ tên và khoảng. */
const COT_PC = { x: 430, nhip: 42, ten: 13, khoang: 11 } as const;

/** Bán kính lỗ so với bán kính vòng. */
const TI_LE_LO = 0.6;

/** Chỗ cho nhãn mốc trên vòng cung. */
const NHAN_MOC = 14;

const LEGEND_H = 16;
const LEGEND_FONT = 10;

const TONE_CLASS: Readonly<Record<SeriesTone, string>> = {
  primary: styles.tonePrimary ?? '',
  teal: styles.toneSeriesTeal ?? '',
  violet: styles.toneSeriesViolet ?? '',
  muted: styles.toneSeriesMuted ?? '',
};

function f(value: number): string {
  return String(Number(value.toFixed(2)));
}

export interface GaugeChartProps {
  model: GaugeModel;
  /** Gốc để ghép `data-chart-svg` — bắt buộc, cùng lý do với `LineChart`. */
  idBase: string;
  /** Ép một khổ khung, như `LineChart.size`. */
  size?: ChartSize;
}

export function GaugeChart({ model, idBase, size: sizeProp }: GaugeChartProps) {
  const pick = usePick();
  const labelText = useLabelText();
  const sizeTuDo = useChartSize();
  const size = sizeProp ?? sizeTuDo;
  const kho = KHO[size];
  const { W, R } = kho;
  const r = R * TI_LE_LO;
  const cx = kho.cx;
  const wide = size === 'wide';
  const cy = kho.top + NHAN_MOC + R;

  const span = model.max - model.min;
  /* Góc của một giá trị: đầu thang ở bên trái (π), cuối thang ở bên phải (0). */
  const goc = (value: number): number => {
    const kep = Math.min(Math.max(value, model.min), model.max);
    return Math.PI - ((kep - model.min) / (span > 0 ? span : 1)) * Math.PI;
  };
  const diem = (ban: number, theta: number) => ({
    x: cx + ban * Math.cos(theta),
    y: cy - ban * Math.sin(theta),
  });

  const vung = model.zones.map((zone, index) => {
    const a0 = goc(zone.from);
    const a1 = goc(zone.to);
    const o0 = diem(R, a0);
    const o1 = diem(R, a1);
    const i1 = diem(r, a1);
    const i0 = diem(r, a0);
    const d = [
      `M${f(o0.x)},${f(o0.y)}`,
      `A${f(R)},${f(R)} 0 0 1 ${f(o1.x)},${f(o1.y)}`,
      `L${f(i1.x)},${f(i1.y)}`,
      `A${f(r)},${f(r)} 0 0 0 ${f(i0.x)},${f(i0.y)}`,
      'Z',
    ].join(' ');
    return { zone, index, d };
  });

  /* Nhãn mốc tại các ranh giới giữa hai vùng, ngay ngoài vòng cung. */
  const moc = model.zones.slice(0, -1).map((zone) => {
    const theta = goc(zone.to);
    const p = diem(R + 6, theta);
    const cos = Math.cos(theta);
    return {
      key: zone.to,
      x: p.x,
      y: p.y - 2,
      text: zone.toLabel,
      anchor: cos < -0.2 ? ('end' as const) : cos > 0.2 ? ('start' as const) : ('middle' as const),
    };
  });

  const kim = diem(R - 6, goc(model.value));
  const active = model.zones[model.activeZone];

  /*
   * Chú giải, điện thoại: mỗi vùng một mục "■ Tên < 30 điểm" dưới vòng cung, xuống hàng khi tràn, mỗi
   * hàng căn giữa. Khổ PC không dùng khối này — xem `cotPC` ngay dưới.
   */
  const day = cy + kho.zoneGap + 22;
  const muc: Array<{ key: number; x: number; y: number; text: string; tone: SeriesTone }> = [];
  let lx = 8;
  let ly = day;
  if (!wide) {
    for (const [index, zone] of model.zones.entries()) {
      const text = `${pick(zone.label)} ${labelText(zone.rangeLabel)}`;
      const rong = 14 + textWidth(text, LEGEND_FONT) * 1.1 + 14;
      if (lx + rong > W - 8 && lx > 8) {
        lx = 8;
        ly += LEGEND_H;
      }
      muc.push({ key: index, x: lx, y: ly, text, tone: zone.tone });
      lx += rong;
    }
  }
  const hang = new Map<number, number>();
  for (const item of muc) {
    const rong = 14 + textWidth(item.text, LEGEND_FONT) * 1.1;
    hang.set(item.y, Math.max(hang.get(item.y) ?? 0, item.x + rong));
  }
  const chuGiai = muc.map((item) => ({
    ...item,
    x: item.x + Math.max(0, (W - 8 - (hang.get(item.y) ?? W)) / 2),
  }));

  /*
   * Chú giải, PC: cột bên phải vòng cung, mỗi vùng hai dòng — ô màu và tên (đậm khi vùng chứa kết quả),
   * rồi khoảng của vùng. Cả cột đứng giữa theo chiều cao của vòng cung.
   */
  const giuaCot = cy - R * 0.45;
  const cotPC = wide
    ? model.zones.map((zone, index) => ({
        key: index,
        tone: zone.tone,
        y: giuaCot - ((model.zones.length - 1) * COT_PC.nhip) / 2 + index * COT_PC.nhip,
        ten: pick(zone.label),
        khoang: labelText(zone.rangeLabel),
        dangChua: index === model.activeZone,
      }))
    : [];

  const H = wide ? cy + kho.zoneGap + 14 : ly + 10;

  return (
    <div className={styles.plot}>
      <svg
        className={styles.svgStack}
        data-chart-svg={idBase}
        data-gauge=""
        viewBox={`0 0 ${String(W)} ${f(H)}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {vung.map(({ zone, index, d }) => (
          <path
            key={`vung-${String(index)}`}
            className={`${String(styles.gaugeZone)} ${TONE_CLASS[zone.tone]}${
              index === model.activeZone ? '' : ` ${String(styles.gaugeZoneMo)}`
            }`}
            d={d}
            data-vung={index}
          />
        ))}

        <text className={styles.tick} x={f(cx - (R + r) / 2)} y={f(cy + 13)} textAnchor="middle">
          {model.minLabel}
        </text>
        <text className={styles.tick} x={f(cx + (R + r) / 2)} y={f(cy + 13)} textAnchor="middle">
          {model.maxLabel}
        </text>
        {moc.map((item) => (
          <text
            key={`moc-${String(item.key)}`}
            className={styles.tick}
            x={f(item.x)}
            y={f(item.y)}
            textAnchor={item.anchor}
          >
            {labelText(item.text)}
          </text>
        ))}

        <line
          className={styles.gaugeNeedle}
          x1={f(cx)}
          y1={f(cy)}
          x2={f(kim.x)}
          y2={f(kim.y)}
          data-kim={model.value}
        />
        <circle className={styles.gaugePivot} cx={f(cx)} cy={f(cy)} r={5} />

        <text
          className={styles.gaugeValue}
          x={f(cx)}
          y={f(cy + kho.valueGap)}
          textAnchor="middle"
          fontSize={kho.value}
        >
          {labelText(model.valueLabel)}
        </text>
        {active !== undefined && (
          <text
            className={styles.gaugeZoneName}
            x={f(cx)}
            y={f(cy + kho.zoneGap)}
            textAnchor="middle"
            fontSize={kho.zone}
          >
            {pick(active.label)}
          </text>
        )}

        {cotPC.map((item) => (
          <g key={`cot-${String(item.key)}`} className={TONE_CLASS[item.tone]} data-chu-giai="">
            <rect
              className={styles.columnSwatch}
              x={COT_PC.x}
              y={f(item.y - 10)}
              width={11}
              height={11}
              rx={2}
            />
            <text
              className={item.dangChua ? styles.gaugeLegendActive : styles.gaugeLegendName}
              x={COT_PC.x + 19}
              y={f(item.y)}
              fontSize={COT_PC.ten}
            >
              {item.ten}
            </text>
            <text
              className={styles.gaugeLegendRange}
              x={COT_PC.x + 19}
              y={f(item.y + 16)}
              fontSize={COT_PC.khoang}
            >
              {item.khoang}
            </text>
          </g>
        ))}

        {chuGiai.map((item) => (
          <g key={`cg-${String(item.key)}`} className={TONE_CLASS[item.tone]} data-chu-giai="">
            <rect
              className={styles.columnSwatch}
              x={f(item.x)}
              y={f(item.y - 8)}
              width={9}
              height={9}
              rx={2}
            />
            <text className={styles.columnLegendText} x={f(item.x + 14)} y={f(item.y)}>
              {item.text}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
