'use client';

import { useMemo } from 'react';

import { vanhKhuyen } from '@/application';
import type { SeriesTone, WaterfallChart as WaterfallModel } from '@/application';
import { usePick, useT } from '@/application/preferences-context';
import { useLabelText } from '@/ui/i18n/units';

import styles from './chart.module.css';
import { textWidth } from './ticks';
import { useChartSize } from './use-chart-size';
import type { ChartSize } from './use-chart-size';

/**
 * Hình bóc tách dạng VÀNH KHUYÊN — mỗi phần chiếm bao nhiêu trong tổng (21/10/2026).
 *
 * Là một DẠNG VẼ khác của cùng mô hình thác nước, không phải một biểu đồ khác: cùng các phần, cùng
 * giá trị, cùng bảng số dưới `<details>` của `ChartFrame`. Thanh ngang nói "phần này lớn bao nhiêu";
 * vành khuyên nói "phần này chiếm mấy phần của tổng" — câu mà người định giá DDM hai giai đoạn hỏi
 * đầu tiên (giá trị cuối kỳ chiếm bao nhiêu của giá cổ phiếu). Chỉ mời khi mọi phần đều cộng vào
 * tổng, xem `dangVeCuaHinh()`.
 *
 * Cùng luật với `LineChart` và `WaterfallChart`: không tính gì (phần trăm đã làm tròn sẵn ở Domain,
 * `vanhKhuyen()`), `viewBox` cố định theo khổ, không đo DOM, không `useId()`.
 *
 * Chú giải nằm TRONG `<svg>`, không phải một danh sách HTML bên cạnh: đường xuất PDF / PNG chép đúng
 * thẻ `<svg>` này (`data-chart-svg`), và một vành khuyên xuất ra mà không có tên phần thì chỉ còn
 * hai mảng màu. Trình đọc màn hình nhận phần trăm qua đoạn ẩn ngay dưới hình, vì `<svg>` bị
 * `aria-hidden` như mọi hình khác.
 */

/*
 * Khung theo khổ. Không ghim tỉ lệ như `.svg`: dùng `.svgStack` của thác nước, chiều cao suy từ
 * `viewBox`. Một vành khuyên cao 400 đơn vị như khung đường sẽ cao gần 600px trên PC cho hai múi.
 */
const SIZES = {
  compact: { W: 320, H: 170, R: 72, r: 44, gap: 16 },
  wide: { W: 640, H: 240, R: 104, r: 64, gap: 28 },
} as const;

/** Lề trái của vòng. */
const LEFT = 8;

/**
 * Nhịp dọc của chú giải, đơn vị viewBox. Mỗi múi ba dòng: tên (một hoặc hai dòng), giá trị, rồi
 * "chiếm …". Giá trị và phần trăm KHÔNG chung một dòng: với WACC cả hai đều là phần trăm, và
 * "7,86 % · 73,2 %" bắt người đọc đoán số nào là phần của tổng.
 */
const NHIP = { ten: 12, giaTri: 14, phan: 13, giuaHang: 16, le: 12 } as const;

/** Cỡ chữ (đơn vị viewBox) — khớp `.donutLabel` / `.donutValue` / `.donutTotal` trong CSS. */
const FONT = { label: 10, value: 11, total: 15 } as const;

const TONE_CLASS: Readonly<Record<SeriesTone, string>> = {
  primary: styles.tonePrimary ?? '',
  teal: styles.toneSeriesTeal ?? '',
  violet: styles.toneSeriesViolet ?? '',
  muted: styles.toneSeriesMuted ?? '',
};

function f(value: number): string {
  return String(Number(value.toFixed(2)));
}

/** Chuỗi `d` của một múi vành khuyên, từ góc `a0` tới `a1` (radian, theo chiều kim đồng hồ). */
function cungVanh(cx: number, cy: number, R: number, r: number, a0: number, a1: number): string {
  const lon = a1 - a0 > Math.PI ? 1 : 0;
  const diem = (ban: number, goc: number) =>
    `${f(cx + ban * Math.cos(goc))},${f(cy + ban * Math.sin(goc))}`;
  return [
    `M${diem(R, a0)}`,
    `A${f(R)},${f(R)} 0 ${String(lon)} 1 ${diem(R, a1)}`,
    `L${diem(r, a1)}`,
    `A${f(r)},${f(r)} 0 ${String(lon)} 0 ${diem(r, a0)}`,
    'Z',
  ].join(' ');
}

/** Ngắt một nhãn thành tối đa hai dòng vừa bề ngang `rong` (đơn vị viewBox). */
function haiDong(text: string, rong: number, size: number): [string, string?] {
  if (textWidth(text, size) <= rong) return [text];
  const words = text.split(' ');
  for (let cut = words.length - 1; cut > 0; cut--) {
    const head = words.slice(0, cut).join(' ');
    if (textWidth(head, size) <= rong) return [head, words.slice(cut).join(' ')];
  }
  return [text];
}

export interface DonutChartProps {
  model: WaterfallModel;
  /** Gốc của `data-chart-svg` — cùng lý do với `LineChart`. */
  idBase: string;
  /** Ép một khổ khung, như `LineChart.size`. */
  size?: ChartSize;
}

export function DonutChart({ model, idBase, size: sizeProp }: DonutChartProps) {
  const t = useT();
  const pick = usePick();
  const labelText = useLabelText();
  const sizeTuDo = useChartSize();
  const size = sizeProp ?? sizeTuDo;
  const { W, R, r, gap } = SIZES[size];

  const vanh = useMemo(() => vanhKhuyen(model), [model]);

  if (vanh === null) return null;

  const cx = LEFT + R;
  const legendX = cx + R + gap;
  const legendW = W - legendX - 6;

  /*
   * Hàng chú giải, xếp sẵn toạ độ. Khung cao theo chú giải khi chú giải cao hơn vòng (bốn múi, tên
   * dài xuống hai dòng): `.svgStack` suy chiều cao từ `viewBox`, nên nới `H` là đủ.
   */
  const hangTho = vanh.parts.map((part) => {
    const dong = haiDong(pick(part.label), legendW - 16, FONT.label);
    const themDong = dong[1] === undefined ? 0 : NHIP.ten;
    return {
      part,
      dong,
      themDong,
      cao: themDong + NHIP.giaTri + NHIP.phan + NHIP.giuaHang,
      giaTri: labelText(part.shortValueLabel ?? part.valueLabel),
      phan: t('chart.donutShare').replace('{p}', part.shareLabel),
    };
  });
  const caoChuGiai = hangTho.reduce((sum, row) => sum + row.cao, 0) - NHIP.giuaHang + 10;
  const H = Math.max(SIZES[size].H, caoChuGiai + 2 * NHIP.le);
  const cy = H / 2;
  const hang = hangTho.map((row, index) => ({
    ...row,
    top:
      cy - caoChuGiai / 2 + 10 + hangTho.slice(0, index).reduce((sum, prev) => sum + prev.cao, 0),
  }));

  let goc = -Math.PI / 2;
  const mui = vanh.parts.map((part) => {
    const a0 = goc;
    const a1 = goc + part.share * 2 * Math.PI;
    goc = a1;
    return { part, d: cungVanh(cx, cy, R, r, a0, a1) };
  });

  const totalValue = labelText(vanh.totalValueLabel);
  const totalLabel = pick(vanh.totalLabel);
  const lot = 2 * r * 0.86;
  const coTen = textWidth(totalLabel, FONT.label) <= lot;
  const coTong = Math.min(
    FONT.total,
    (FONT.total * lot) / Math.max(1, textWidth(totalValue, FONT.total)),
  );

  return (
    <div className={styles.plot}>
      <svg
        className={styles.svgStack}
        data-chart-svg={idBase}
        data-donut=""
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {mui.map(({ part, d }) => (
          <path
            key={`mui-${part.label.vi}`}
            className={`${String(styles.donutSlice)} ${TONE_CLASS[part.tone]}`}
            d={d}
          />
        ))}

        {coTen && (
          <text className={styles.donutTotalLabel} x={cx} y={cy - 6} textAnchor="middle">
            {totalLabel}
          </text>
        )}
        <text
          className={styles.donutTotal}
          x={cx}
          y={coTen ? cy + 12 : cy + 5}
          textAnchor="middle"
          fontSize={f(coTong)}
        >
          {totalValue}
        </text>

        {hang.map(({ part, dong, themDong, giaTri, phan, top }) => (
          <g key={`ghi-${part.label.vi}`} className={TONE_CLASS[part.tone]}>
            <rect
              className={styles.donutSwatch}
              x={legendX}
              y={top - 9}
              width="10"
              height="10"
              rx="2"
            />
            <text className={styles.donutLabel} x={legendX + 16} y={top}>
              {dong[0]}
              {dong[1] !== undefined && (
                <tspan x={legendX + 16} dy="12">
                  {dong[1]}
                </tspan>
              )}
            </text>
            <text className={styles.donutValue} x={legendX + 16} y={top + themDong + NHIP.giaTri}>
              {giaTri}
            </text>
            <text
              className={styles.donutLabel}
              x={legendX + 16}
              y={top + themDong + NHIP.giaTri + NHIP.phan}
            >
              {phan}
            </text>
          </g>
        ))}
      </svg>
      <p className="visually-hidden">
        {hang.map((row) => `${pick(row.part.label)}: ${row.giaTri}, ${row.phan}`).join('; ')}
      </p>
    </div>
  );
}
