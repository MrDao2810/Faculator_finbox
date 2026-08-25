'use client';

import { useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { gapsOf, linePath, linearScale, nearestPointByX, pointerToViewBox } from '@/application';
import type { ChartPoint, ChartTick, LineChart as LineChartModel } from '@/application';
import { usePick } from '@/application/preferences-context';

import styles from './chart.module.css';

/**
 * Đường quét độ nhạy — FR-08.
 *
 * Component này KHÔNG tính gì: miền, vạch chia, nhãn số và điểm đứt đã xong hết ở
 * `buildChartModel()` bên Domain. Ở đây chỉ còn chiếu toạ độ và xếp thẻ SVG.
 *
 * Năm quyết định đáng giải thích:
 *
 * 1. **`aria-hidden` trên `<svg>`.** Thông tin nằm trọn ở `<figcaption>` và bảng số do `ChartFrame`
 *    dựng. Nhét `<title>`/`<desc>` dài vào SVG được NVDA, JAWS và VoiceOver xử rất khác nhau, mà
 *    người dùng vẫn không có cách nào lần qua 42 điểm bằng tai. Ẩn hình, dựng lối đọc thật.
 * 2. **`viewBox` cố định, KHÔNG đo DOM LÚC DỰNG.** Không `ResizeObserver`, không đo trong thân
 *    component hay `useEffect` chạy vô điều kiện lúc mount. Trang dựng sẵn lúc build phải khớp
 *    hệt lần render đầu ở máy khách, và mọi lần đo DOM ở ĐÓ là một đường lệch hydration.
 *    `handlePointerMove` bên dưới VẪN gọi `getBoundingClientRect()` — an toàn vì nó chỉ chạy SAU
 *    một sự kiện con trỏ thật của người dùng, tức luôn sau khi hydrate đã xong và khớp; không có
 *    "lần đầu" nào mà phép đo chạy trước khi hai bên so khớp.
 * 3. **Bảng số vẫn là lối đọc CHÍNH — lớp dò điểm không thay nó.** Quyết định gốc "không tooltip"
 *    (42 vùng chạm 44px trên khổ 320 là bất khả thi) vẫn đúng CHO TRÌNH ĐỌC MÀN HÌNH: SVG vẫn
 *    `aria-hidden`, bảng số dưới `<details>` của `ChartFrame` vẫn là nguồn duy nhất họ đọc được —
 *    điều đó không đổi. Điều đổi: thêm một lớp tương tác cho người có chuột/ngón tay — rê chuột
 *    hoặc chạm-kéo hiện vạch dò SNAP vào đúng điểm dữ liệu gần nhất trong `model.points` (không
 *    nội suy, xem `nearestPointByX`), vẽ bằng `.hover*`, tách hẳn khỏi `.marker*` (dành riêng cho
 *    ĐÚNG MỘT điểm cố định: giá trị người dùng đang nhập). Không hiện gì mà bảng số không nói được
 *    — chỉ hiện NHANH HƠN, đúng con số bảng đã liệt kê. Nhả tay (không phải rê/chạm suông) tại
 *    điểm đang dò còn ghi giá trị X của điểm đó ngược vào ô Số liệu tương ứng (`onApplyPoint`) —
 *    dò xong thấy đúng ý thì áp dụng luôn, không phải gõ lại bằng tay. Hai trường hợp nhả tay KHÔNG
 *    ghi gì: trục hiện không áp dụng được (`onApplyPoint` vắng mặt, ví dụ đang xem theo thời gian),
 *    và điểm vừa bấm không tính được (`y === null`, phần vẽ gạch chéo). Cả hai giữ vệt dò lại thay
 *    vì tắt ngay — xem quyết định 5.
 * 4. **`id` của `<pattern>` nhận từ ngoài, KHÔNG gọi `useId()`.** Xem docblock của `ChartBody`:
 *    cả thư mục này nằm dưới ranh giới `next/dynamic`, chỗ mà `useId()` sinh chuỗi lệch nhau giữa
 *    máy chủ và máy khách.
 * 5. **`pointerup` và `pointercancel` KHÔNG dùng chung một hàm**, dù cả hai đều "kết thúc cử chỉ".
 *    Nhả tay tại điểm đang dò là một lượt CHỌN thật — gọi `onApplyPoint()` (nếu có) để ghi giá trị
 *    đó ngược vào ô Số liệu tương ứng, đúng lời yêu cầu "bấm vào biểu đồ để lưu lại giá trị". Còn
 *    `pointercancel` là trình duyệt TỰ HUỶ cử chỉ (ví dụ nhận nhầm thành cuộn trang) — không phải
 *    một lượt chọn của người dùng, ghi giá trị lúc đó là ghi nhầm ý. `handlePointerUp` còn phân
 *    biệt thêm một lần nữa BÊN TRONG: ghi được thì ẩn vệt dò ngay (chuột — dấu "giá trị hiện tại"
 *    đã tự nhảy tới đúng chỗ, không cần chồng thêm vệt dò); ghi KHÔNG được (trục đang là thời gian,
 *    hoặc điểm không tính được) thì GIỮ vệt dò lại — nếu tắt ngay như ghi được, cú bấm trên một biểu
 *    đồ không áp dụng được sẽ trông như không có chuyện gì xảy ra, dù người dùng vừa bấm thật.
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
  /**
   * Nhả tay tại một điểm đang dò thì gọi hàm này với `(khoá biến trên trục X, giá trị X của điểm)`
   * — nơi gọi (`ChartBody`) tự quyết định có truyền hay không: `undefined` khi trục X hiện không
   * phải một biến input thật (ví dụ đang xem theo thời gian), lúc đó nhả tay chỉ tắt vệt dò như
   * cũ, không ghi gì.
   */
  onApplyPoint?: (key: string, value: number) => void;
}

export function LineChart({ model, idBase, fill = false, onApplyPoint }: LineChartProps) {
  const pick = usePick();
  const hatchId = `${idBase}-hatch`;
  const svgRef = useRef<SVGSVGElement>(null);

  /*
   * Điểm đang dò (rê chuột / chạm-kéo) — `null` là không đang dò. Cục bộ trong component: bản
   * trên trang và bản trong `ChartFullscreen` là hai instance riêng, không có lý do phải đồng bộ
   * vệt dò giữa chúng.
   */
  const [hover, setHover] = useState<ChartPoint | null>(null);

  /*
   * Vệt dò vừa GIỮ LẠI vì nhả tay không ghi được gì (xem `handlePointerUp`) — `true` thì
   * `handlePointerLeave` không được xoá `hover`, vì di chuột đi sau khi bấm là chuyện đương nhiên
   * (đọc kết quả xong, đưa tay đi làm việc khác), không phải một lượt "rê chuột suông" mới cần tắt
   * ngay. Đặt lại `false` ở đầu MỖI cử chỉ mới (`pointerdown`) và khi cử chỉ bị huỷ
   * (`pointercancel`) — chỉ giữ đúng một lượt bấm, không giữ mãi qua các lần dò tiếp theo.
   */
  const [pinned, setPinned] = useState(false);

  /*
   * Gom mọi phần TÍNH TOÁN từ `model` vào một `useMemo` duy nhất, khoá theo `[model]`.
   *
   * Bắt buộc từ khi thêm dò điểm: `hover` đổi theo mỗi `pointermove` (hàng chục lần/giây khi rê),
   * mỗi lần đổi là một lượt re-render — thiếu `useMemo` thì `linePath()` (~1,76ms cho chuỗi 248
   * điểm, theo số đo ở docblock `ChartBody`) và `gapsOf()` chạy lại vô ích mỗi lần, dù `model`
   * không hề đổi. `model` là tham chiếu ổn định giữa các lần re-render do hover (nó đến từ
   * `useMemo` ở `ChartBody`, chỉ đổi khi input/kết quả/trục thật sự đổi).
   */
  const { sx, sy, d, gaps, marked, xLabels, yLabels } = useMemo(() => {
    const scaleX = linearScale(model.x.domain, [PLOT.x0, PLOT.x1]);
    // Trục Y lật chiều: toạ độ SVG đi xuống, giá trị đi lên.
    const scaleY = linearScale(model.y.domain, [PLOT.y1, PLOT.y0]);

    return {
      sx: scaleX,
      sy: scaleY,
      d: linePath(model.points, scaleX, scaleY),
      gaps: gapsOf(model.points, scaleX),
      marked: model.points.find((point) => point.marked === true),
      xLabels: thin(model.x.ticks, 4),
      yLabels: thin(model.y.ticks, 5),
    };
  }, [model]);

  function handlePointerMove(event: ReactPointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (svg === null) return;

    // Đọc DOM ở ĐÂY, trong handler — hợp lệ, xem quyết định 2 ở docblock đầu file.
    const rect = svg.getBoundingClientRect();
    const viewPoint = pointerToViewBox(rect, event.clientX, event.clientY, W, H);
    if (viewPoint === null) return;

    const clampedX = Math.min(Math.max(viewPoint.x, PLOT.x0), PLOT.x1);
    setHover(nearestPointByX(model.points, clampedX, sx) ?? null);
  }

  function handlePointerDown(event: ReactPointerEvent<SVGRectElement>) {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Trình duyệt cũ hoặc jsdom không có API này — bỏ qua an toàn, cùng nếp `ChartFullscreen`.
    }
    // Cử chỉ MỚI bắt đầu — vệt dò của lượt bấm trước (nếu có) hết hạn từ đây.
    setPinned(false);
    handlePointerMove(event);
  }

  function handlePointerUp(event: ReactPointerEvent<SVGRectElement>) {
    /*
     * Nhả tay tại điểm đang dò — một lượt CHỌN thật, ghi giá trị đó vào ô Số liệu (nếu cho phép).
     *
     * KHÔNG ghi điểm `y === null` — phần đường vẽ gạch chéo, tức mức mà chính biểu đồ đang nói là
     * không tính được. Ghi nó vào ô Số liệu là lấy đúng thứ hình vừa từ chối làm giá trị mới, và nó
     * từng tạo ra một ngõ cụt thật: mỗi cú bấm trong vùng chết đẩy giá trị hiện tại lên cao hơn, mà
     * miền quét luôn bám quanh giá trị hiện tại, nên chỉ vài cú là cả miền trôi ra khỏi vùng còn dữ
     * liệu — lúc ấy không trục nào vẽ được nữa. Chặn ngay từ cú bấm là chặn tận gốc, thay vì chữa
     * hậu quả ở `buildChartModel`.
     */
    const ghiDuoc = hover !== null && hover.y !== null && onApplyPoint !== undefined;
    if (ghiDuoc) onApplyPoint(model.sweepKey, hover.x);

    // Chạm: giữ lại vệt dò sau khi nhấc ngón tay — ngón tay vừa che mất đúng chỗ cần đọc.
    if (event.pointerType === 'touch') return;

    /*
     * Cú bấm KHÔNG ghi được gì — trục hiện không áp dụng được (`onApplyPoint` vắng mặt, xem guard ở
     * `ChartBody`), hoặc điểm vừa bấm nằm trong vùng không tính được. Người dùng vẫn vừa bấm thật,
     * nên GHIM vệt dò lại làm phản hồi DUY NHẤT của cú bấm đó — `pinned=true` khiến
     * `handlePointerLeave` bên dưới bỏ qua, vì đưa chuột đi sau khi bấm là chuyện đương nhiên, không
     * phải lúc để xoá. Ghi được rồi thì khác hẳn: dấu "giá trị hiện tại" đã tự nhảy tới đúng chỗ vừa
     * bấm, vệt dò xong việc, ẩn ngay để khỏi chồng lên dấu đó.
     */
    if (hover !== null && !ghiDuoc) {
      setPinned(true);
      return;
    }
    setHover(null);
  }

  /*
   * Huỷ cử chỉ (ví dụ trình duyệt nhận nhầm thành cuộn trang) KHÔNG phải một lượt chọn — chỉ tắt
   * vệt dò như `pointerup` từng làm trước khi có `onApplyPoint`, không gọi callback ghi giá trị.
   */
  function handlePointerCancel(event: ReactPointerEvent<SVGRectElement>) {
    if (event.pointerType === 'touch') return;
    setPinned(false);
    setHover(null);
  }

  function handlePointerLeave(event: ReactPointerEvent<SVGRectElement>) {
    // Chạm: `pointerup` đã lo; `pointerleave` do cuộn trang không được xoá vệt dò oan.
    if (event.pointerType === 'touch') return;
    // Vừa GHIM ở `pointerup` (nhả tay không ghi được gì) — đưa chuột đi không được xoá mất phản hồi.
    if (pinned) return;
    setHover(null);
  }

  const hoverX = hover !== null ? sx(hover.x) : null;
  const hoverOnRight = hoverX !== null && hoverX > (PLOT.x0 + PLOT.x1) / 2;

  return (
    <div className={fill ? `${styles.plot} ${styles.plotFill}` : styles.plot}>
      <svg
        ref={svgRef}
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

        {/*
          Vùng bắt sự kiện dò điểm — trong suốt, phủ đúng vùng vẽ, đặt SAU mọi thẻ khác (trừ
          overlay dò điểm ngay dưới) để luôn là đích nhận pointer event, bất kể chữ/nét nào đè
          lên nó (`pointer-events: all` trong CSS giữ nguyên vùng bắt dù `fill: transparent`).
        */}
        <rect
          className={styles.hoverCapture}
          data-testid={`${idBase}-hover-capture`}
          x={PLOT.x0}
          y={PLOT.y0}
          width={PLOT.x1 - PLOT.x0}
          height={PLOT.y1 - PLOT.y0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerLeave}
        />

        {/*
          Vạch dò: vẽ SAU vùng bắt sự kiện nên luôn nổi trên cùng, nhưng `pointer-events: none`
          (CSS) để không tự chặn mất pointer event của chính vùng bắt bên trên nó.
        */}
        {hover !== null && hoverX !== null && (
          <g className={styles.hoverOverlay} data-testid={`${idBase}-hover`}>
            <line className={styles.hoverLine} x1={hoverX} y1={PLOT.y0} x2={hoverX} y2={PLOT.y1} />
            {hover.y !== null && (
              <circle className={styles.hoverDot} cx={hoverX} cy={sy(hover.y)} r="3.5" />
            )}
            <text
              className={styles.hoverLabel}
              x={hoverOnRight ? hoverX - 6 : hoverX + 6}
              y={PLOT.y0 + 22}
              textAnchor={hoverOnRight ? 'end' : 'start'}
            >
              {hover.label} · {hover.valueLabel}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

/** Dùng cho test và cho bản in — cùng một hình học, không đoán lại. */
export const CHART_GEOMETRY = { W, H, PLOT } as const;
