'use client';

import { gapsOf, linePath, linearScale } from '@/application';
import type { ChartTick, LineChart as LineChartModel } from '@/application';
import { usePick } from '@/application/preferences-context';

import styles from './chart.module.css';

/**
 * Đường quét độ nhạy — FR-08.
 *
 * Component này KHÔNG tính gì: miền, vạch chia, nhãn số và điểm đứt đã xong hết ở
 * `buildChartModel()` bên Domain. Ở đây chỉ còn chiếu toạ độ và xếp thẻ SVG.
 *
 * Ba quyết định đáng giải thích:
 *
 * 1. **`aria-hidden` trên `<svg>`.** Thông tin nằm trọn ở `<figcaption>` và bảng số do `ChartFrame`
 *    dựng. Nhét `<title>`/`<desc>` dài vào SVG được NVDA, JAWS và VoiceOver xử rất khác nhau, mà
 *    người dùng vẫn không có cách nào lần qua 42 điểm bằng tai. Ẩn hình, dựng lối đọc thật.
 * 2. **`viewBox` cố định, KHÔNG đo DOM.** Không `ResizeObserver`, không `useEffect`. Trang dựng sẵn
 *    lúc build phải khớp hệt lần render đầu ở máy khách, và mọi lần đo DOM là một đường lệch
 *    hydration.
 * 3. **Không tooltip.** Điện thoại không có hover, và 42 vùng chạm 44px trên khổ 320 là bất khả
 *    thi. Bảng số thay thế, đồng thời phục vụ luôn trình đọc màn hình.
 * 4. **`id` của `<pattern>` nhận từ ngoài, KHÔNG gọi `useId()`.** Xem docblock của `ChartBody`:
 *    cả thư mục này nằm dưới ranh giới `next/dynamic`, chỗ mà `useId()` sinh chuỗi lệch nhau giữa
 *    máy chủ và máy khách.
 */

/* Khung vẽ theo đơn vị viewBox. Trục Y chiếm lề trái cho nhãn số. */
const W = 320;
const H = 200;
const PAD = { top: 10, right: 10, bottom: 34, left: 46 } as const;

const PLOT = {
  x0: PAD.left,
  x1: W - PAD.right,
  y0: PAD.top,
  y1: H - PAD.bottom,
} as const;

/**
 * Giữ lại chừng `keep` nhãn, bỏ bớt phần còn lại.
 *
 * Vạch chia thì vẽ hết cho mắt bám, nhưng nhãn chữ thì không: 12 nhãn `120.000` cạnh nhau trên
 * 268 đơn vị bề ngang là chồng lên nhau thành vệt đen. Luôn giữ vạch đầu và vạch cuối.
 */
function thin(ticks: ReadonlyArray<ChartTick>, keep: number): ReadonlyArray<ChartTick> {
  if (ticks.length <= keep) return ticks;
  const stride = Math.ceil((ticks.length - 1) / (keep - 1));
  return ticks.filter((_, index) => index % stride === 0 || index === ticks.length - 1);
}

export interface LineChartProps {
  model: LineChartModel;
  /**
   * Gốc để ghép `id` của `<pattern>`.
   *
   * Bắt buộc, không có mặc định: `<pattern id>` phải duy nhất trong CẢ tài liệu, mà bản trên trang
   * và bản trong màn phóng to cùng nằm trong DOM khi lớp phủ đang mở. Một giá trị mặc định là hai
   * node trùng `id`, và trình duyệt lấy node đầu — tức vùng gạch chéo của màn phóng to trỏ nhầm.
   * Bắt người gọi truyền vào khiến chỗ phân biệt nằm ở `ChartBody`, nơi nhìn thấy cả hai bản.
   */
  idBase: string;
  /**
   * Cho hình CHOÁN HẾT chỗ được cấp thay vì giữ tỉ lệ 16/10 — dùng ở màn phóng to.
   *
   * Không đổi `viewBox`, chỉ đổi cách khung ngoài chiếm chỗ: `preserveAspectRatio` đã lo phần nội
   * dung không bị méo, nên hình lớn lên đúng tỉ lệ và tự căn giữa phần dư.
   */
  fill?: boolean;
}

export function LineChart({ model, idBase, fill = false }: LineChartProps) {
  const pick = usePick();
  const hatchId = `${idBase}-hatch`;

  const sx = linearScale(model.x.domain, [PLOT.x0, PLOT.x1]);
  // Trục Y lật chiều: toạ độ SVG đi xuống, giá trị đi lên.
  const sy = linearScale(model.y.domain, [PLOT.y1, PLOT.y0]);

  const d = linePath(model.points, sx, sy);
  const gaps = gapsOf(model.points, sx);
  const marked = model.points.find((point) => point.marked === true);

  const xLabels = thin(model.x.ticks, 4);
  const yLabels = thin(model.y.ticks, 5);

  return (
    <div className={fill ? `${styles.plot} ${styles.plotFill}` : styles.plot}>
      <svg
        className={fill ? `${styles.svg} ${styles.svgFill}` : styles.svg}
        viewBox={`0 0 ${String(W)} ${String(H)}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* Gạch chéo cho vùng không tính được — dấu hiệu thứ hai bên cạnh khoảng hở của đường. */}
          <pattern
            id={hatchId}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line className={styles.gapHatch} x1="0" y1="0" x2="0" y2="6" />
          </pattern>
        </defs>

        {/* Lưới ngang: đủ để đọc độ cao, không kẻ dọc cho khỏi rối. */}
        {model.y.ticks.map((tick) => (
          <line
            key={`grid-${String(tick.value)}`}
            className={styles.grid}
            x1={PLOT.x0}
            y1={sy(tick.value)}
            x2={PLOT.x1}
            y2={sy(tick.value)}
          />
        ))}

        {/* Vùng không tính được, vẽ TRƯỚC đường để không che nét. */}
        {gaps.map((gap) => (
          <rect
            key={`gap-${String(gap.fromX)}`}
            className={styles.gap}
            x={Math.min(gap.fromX, gap.toX)}
            y={PLOT.y0}
            width={Math.abs(gap.toX - gap.fromX)}
            height={PLOT.y1 - PLOT.y0}
            fill={`url(#${hatchId})`}
          />
        ))}

        {/* Hai trục. */}
        <line className={styles.axis} x1={PLOT.x0} y1={PLOT.y1} x2={PLOT.x1} y2={PLOT.y1} />
        <line className={styles.axis} x1={PLOT.x0} y1={PLOT.y0} x2={PLOT.x0} y2={PLOT.y1} />

        {/* Đường quét. Chuỗi rỗng nghĩa là không mức nào vẽ được — bỏ hẳn thẻ. */}
        {d !== '' && <path className={styles.line} d={d} data-points={model.points.length} />}

        {/* Dấu "giá trị hiện tại": vạch dọc nét đứt + chấm + nhãn chữ (FR-08). */}
        {marked !== undefined && (
          <g data-testid="chart-marker">
            <line
              className={styles.markerLine}
              x1={sx(marked.x)}
              y1={PLOT.y0}
              x2={sx(marked.x)}
              y2={PLOT.y1}
            />
            {marked.y !== null && (
              <circle className={styles.markerDot} cx={sx(marked.x)} cy={sy(marked.y)} r="4" />
            )}
            <text
              className={styles.markerLabel}
              x={sx(marked.x) > (PLOT.x0 + PLOT.x1) / 2 ? sx(marked.x) - 6 : sx(marked.x) + 6}
              y={PLOT.y0 + 10}
              textAnchor={sx(marked.x) > (PLOT.x0 + PLOT.x1) / 2 ? 'end' : 'start'}
            >
              {marked.valueLabel}
            </text>
          </g>
        )}

        {/* Nhãn trục Y, canh phải sát trục. */}
        {yLabels.map((tick) => (
          <text
            key={`y-${String(tick.value)}`}
            className={styles.tick}
            x={PLOT.x0 - 5}
            y={sy(tick.value) + 3}
            textAnchor="end"
          >
            {tick.label}
          </text>
        ))}

        {/* Nhãn trục X. */}
        {xLabels.map((tick) => (
          <text
            key={`x-${String(tick.value)}`}
            className={styles.tick}
            x={sx(tick.value)}
            y={PLOT.y1 + 13}
            textAnchor="middle"
          >
            {tick.label}
          </text>
        ))}

        {/*
          Tên hai trục bằng chữ, không xoay dọc: chữ xoay 90 độ ở khổ 360 vừa khó đọc vừa ăn thêm
          lề trái. Tên trục Y đặt trên góc trái, tên trục X ở giữa đáy — đúng lối các báo cáo in.
        */}
        <text className={styles.axisTitle} x={PLOT.x0 - 2} y={PLOT.y0 - 2}>
          {pick(model.y.title)}
        </text>
        <text
          className={styles.axisTitle}
          x={(PLOT.x0 + PLOT.x1) / 2}
          y={H - 6}
          textAnchor="middle"
        >
          {pick(model.x.title)}
        </text>
      </svg>
    </div>
  );
}

/** Dùng cho test và cho bản in — cùng một hình học, không đoán lại. */
export const CHART_GEOMETRY = { W, H, PLOT } as const;
