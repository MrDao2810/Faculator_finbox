'use client';

import { useState } from 'react';

import { linearScale } from '@/application';
import type { WaterfallChart as WaterfallModel } from '@/application';
import { usePick } from '@/application/preferences-context';

import styles from './chart.module.css';
import { thin, tickAnchor } from './ticks';

/**
 * Biểu đồ bóc tách dạng thác nước — WF-17, gói 5.2.3.
 *
 * Cùng ba luật với `LineChart`, không có ngoại lệ nào: không tính gì (Domain đã dựng xong cột,
 * miền và nhãn), `viewBox` cố định không đo DOM, và **không gọi `useId()`** — cả thư mục này nằm
 * dưới ranh giới `next/dynamic`, chỗ mà id React sinh ra lệch nhau giữa HTML tĩnh và lượt hydrate.
 *
 * ── Nằm NGANG, không đứng ────────────────────────────────────────────────────────────────────
 *
 * Thác nước sách giáo khoa vẽ cột đứng. Ở đây cột nằm ngang, vì một lý do đo được: nhãn chặng là
 * tiếng Việt ("Tiền và tương đương tiền", "Tăng vốn lưu động ròng") dài gấp ba tới năm lần bề
 * ngang một cột đứng trong khung 320 đơn vị. Cột đứng thì chỉ còn ba lối — xoay nhãn 45 độ, cắt
 * cụt, hoặc rút gọn tới mức mất nghĩa — và cả ba đều tệ hơn việc quay cả hình đi 90 độ, chỗ mà
 * nhãn chạy ngang thoải mái theo đúng chiều đọc.
 *
 * Đổi lại, "trục Y" của mô hình nằm ngang trên hình. Tên trường giữ nguyên theo Domain: nó là
 * TRỤC GIÁ TRỊ, còn vẽ ra chiều nào là việc của renderer.
 *
 * ── Hover từng cột ──────────────────────────────────────────────────────────────────────────
 *
 * Không dùng cơ chế dò điểm liên tục như `LineChart` (không có "điểm giữa hai cột" để snap —
 * cột rời rạc). Thay vào đó, trỏ/chạm vào MỘT cột thì viền cột đó đậm lên và hiện `valueLabel`
 * ngay trên hình — vốn trước giờ chỉ có trong bảng số dưới `<details>`, phải mở ra mới tra được.
 */

/* Khung vẽ theo đơn vị viewBox. Lề trái rộng cho nhãn chặng đọc ngang. */
const W = 320;
const ROW = 26;
const PAD = { top: 8, right: 12, bottom: 26, left: 96 } as const;

const BAR_HEIGHT = 14;

/** Số nhãn vạch giữ lại trên trục giá trị. Vạch KẺ vẫn vẽ hết — xem `thin()`. */
const VALUE_LABELS = 4;

/**
 * Nửa bề ngang dự phòng cho nhãn giá trị vẽ đè lên cột, tính bằng đơn vị viewBox.
 *
 * Nhãn ấy canh giữa tại tâm cột, nên nửa chữ thò ra mỗi bên. Chữ 9px, nhãn đã rút gọn dài chừng 9–11
 * ký tự (`1,79 tỷ ₫`) ≈ 44 đơn vị, tức nửa chừng 22. Cột nào có tâm gần mép hơn thế thì ghim nhãn vào
 * mép và lật anchor vào trong — đúng cách hai nhãn mép của trục X đường quét đang làm.
 */
const VALUE_LABEL_HALF = 22;

export interface WaterfallChartProps {
  model: WaterfallModel;
  /** Gốc để ghép `id`. Bắt buộc — xem docblock của `LineChart`. */
  idBase: string;
  /** Bản trong màn phóng to: chiếm trọn chiều cao thay vì giữ tỉ lệ. */
  fill?: boolean;
}

export function WaterfallChart({ model, idBase, fill = false }: WaterfallChartProps) {
  const pick = usePick();

  /** Cột đang trỏ/chạm — `null` là không cột nào. Cục bộ, không đồng bộ với bản phóng to. */
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  /*
   * Chiều cao theo SỐ CHẶNG, không phải tỉ lệ cố định như đường quét: ba chặng và tám chặng cần
   * hai khung khác nhau. `viewBox` vẫn là hằng số suy từ dữ liệu đã dựng sẵn ở Domain, nên không
   * có phép đo DOM nào — bản tĩnh và lượt hydrate ra cùng một con số.
   */
  const height = PAD.top + model.bars.length * ROW + PAD.bottom;
  const plotLeft = PAD.left;
  const plotRight = W - PAD.right;

  const toX = linearScale(model.y.domain, [plotLeft, plotRight]);
  const zeroX = toX(0);

  return (
    <div className={fill ? `${styles.plot} ${styles.plotFill}` : styles.plot}>
      <svg
        className={fill ? `${styles.svgStack} ${styles.svgFill}` : styles.svgStack}
        /* Dấu để đường xuất file tìm lại đúng hình này — xem chú thích cùng tên ở `LineChart`. */
        data-chart-svg={idBase}
        viewBox={`0 0 ${String(W)} ${String(height)}`}
        preserveAspectRatio="xMidYMid meet"
        /*
          Ẩn khỏi trình đọc màn hình đúng như `LineChart`: thông tin nằm trọn ở `<figcaption>` và
          bảng số do `ChartFrame` dựng — hai thứ đó đọc được thật, còn mấy thẻ `<rect>` thì không.
        */
        aria-hidden="true"
        focusable="false"
      >
        {/* Vạch chia dọc — cùng vai trò với lưới của đường quét. */}
        {model.y.ticks.map((tick) => (
          <line
            key={`${idBase}-tick-${String(tick.value)}`}
            className={styles.grid}
            x1={toX(tick.value)}
            x2={toX(tick.value)}
            y1={PAD.top}
            y2={height - PAD.bottom}
          />
        ))}

        {/* Đường số 0 — chỗ chân mọi cột đứng, nên vẽ đậm hơn vạch chia thường. */}
        <line className={styles.axis} x1={zeroX} x2={zeroX} y1={PAD.top} y2={height - PAD.bottom} />

        {model.bars.map((bar, index) => {
          const rowTop = PAD.top + index * ROW;
          const barTop = rowTop + (ROW - BAR_HEIGHT) / 2;

          // Cột thường chạy từ mức cộng dồn TRƯỚC nó; cột tổng chạy từ 0.
          const from = bar.isTotal === true ? 0 : bar.cumulative - bar.delta;
          const xFrom = toX(from);
          const xTo = toX(bar.cumulative);
          const left = Math.min(xFrom, xTo);
          const width = Math.max(Math.abs(xTo - xFrom), 1);

          const kindClass =
            bar.isTotal === true ? styles.barTotal : bar.delta < 0 ? styles.barDown : styles.barUp;
          const hovering = hoverIndex === index;

          return (
            <g key={`${idBase}-bar-${String(index)}`}>
              <text
                className={styles.barLabel}
                x={plotLeft - 6}
                y={rowTop + ROW / 2}
                textAnchor="end"
              >
                {pick(bar.label)}
              </text>

              <rect
                className={hovering ? `${kindClass} ${styles.barHover}` : kindClass}
                x={left}
                y={barTop}
                width={width}
                height={BAR_HEIGHT}
                onPointerEnter={() => {
                  setHoverIndex(index);
                }}
                onPointerLeave={() => {
                  setHoverIndex((current) => (current === index ? null : current));
                }}
                onPointerDown={() => {
                  setHoverIndex(index);
                }}
              />

              {/*
                Giá trị cột — chỉ hiện khi đang trỏ/chạm.

                Hai lớp chống tràn, cần cả hai:

                  1. **Bản rút gọn** do Domain dựng (`shortValueLabel`), ở đúng bậc mà trục ngay dưới
                     đang ghi. Trước đợt này chỗ này in thẳng `valueLabel` đầy đủ, nên `lich-tra-no`
                     hiện `1.789.700.000 ₫` ≈ 66 đơn vị — vừa dài hơn phần lớn cột, vừa nói một thang
                     khác với chính cái trục nó nằm trên.
                  2. **Kẹp biên.** Chú thích cũ ở đây khẳng định canh giữa cột thì "không bao giờ
                     tràn ra ngoài viewBox" — sai: canh giữa chỉ neo TÂM chữ, nửa còn lại vẫn thò ra,
                     nên mọi cột có tâm cách mép dưới `VALUE_LABEL_HALF` đều bị cắt cụt.
              */}
              {hovering &&
                (() => {
                  const mid = (xFrom + xTo) / 2;
                  const anchor =
                    mid - plotLeft < VALUE_LABEL_HALF
                      ? 'start'
                      : plotRight - mid < VALUE_LABEL_HALF
                        ? 'end'
                        : 'middle';
                  const at = anchor === 'start' ? plotLeft : anchor === 'end' ? plotRight : mid;

                  return (
                    <text
                      className={styles.barValueLabel}
                      x={at}
                      y={rowTop + ROW / 2}
                      textAnchor={anchor}
                    >
                      {bar.shortValueLabel ?? bar.valueLabel}
                    </text>
                  );
                })()}

              {/*
              Đường nối từ đỉnh cột này sang chân cột sau — thứ làm nên hình bậc thang. Không vẽ
              sau cột cuối, và không vẽ trước cột tổng vì cột tổng bắt đầu lại từ 0.
            */}
              {index < model.bars.length - 1 && model.bars[index + 1]?.isTotal !== true && (
                <line
                  className={styles.barStep}
                  x1={xTo}
                  x2={xTo}
                  y1={barTop + BAR_HEIGHT}
                  y2={rowTop + ROW + (ROW - BAR_HEIGHT) / 2}
                />
              )}
            </g>
          );
        })}

        {/*
          Nhãn trục giá trị, đặt dưới đáy hình — THƯA bớt như đường quét.

          Trước đợt này chỗ này in cả 12 vạch mà `niceAxis()` cho phép, trên 212 đơn vị bề ngang: một
          nhãn 5 ký tự đã ~28 đơn vị, nên chúng chồng lên nhau thành vệt đen. Vạch KẺ ở trên vẫn vẽ
          hết, đúng như `LineChart` — chỉ phần chữ mới thưa.

          `tickAnchor` lo nốt vạch cuối: nó nằm tại `plotRight = 308` trên khung 320, nên canh giữa
          ở đó là mất đuôi chữ — đo được trên `ev`, nhãn `15.000` chạy tới x = 322,6.
        */}
        {thin(model.y.ticks, VALUE_LABELS).map((tick) => (
          <text
            key={`${idBase}-ticklabel-${String(tick.value)}`}
            className={styles.tick}
            x={toX(tick.value)}
            y={height - PAD.bottom + 14}
            textAnchor={tickAnchor(toX(tick.value), W)}
          >
            {tick.label}
          </text>
        ))}

        <text className={styles.axisTitle} x={(plotLeft + plotRight) / 2} y={height - 4}>
          {pick(model.y.title)}
        </text>
      </svg>
    </div>
  );
}
