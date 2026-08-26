'use client';

import { useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import {
  areaPath,
  gapsOf,
  linePath,
  linearScale,
  nearestPointByX,
  pointerToViewBox,
  seriesOf,
} from '@/application';
import type { ChartPoint, ChartTick, LineChart as LineChartModel, SeriesTone } from '@/application';
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
 * Lề phải khi có trục Y thứ hai — đủ chỗ cho nhãn vạch của nó.
 *
 * Nới lề CHỈ khi thật sự có trục phải, không nới sẵn: 100 biểu đồ hiện có không có trục ấy, và nới
 * sẵn là bóp vùng vẽ của cả trăm hình để chừa chỗ cho thứ chúng không dùng.
 */
const PAD_RIGHT_AXIS = 40;

/** Khung vẽ ứng với việc có hay không có trục Y phải. */
function plotOf(hasRightAxis: boolean) {
  if (!hasRightAxis) return PLOT;
  return { x0: PAD.left, x1: W - PAD_RIGHT_AXIS, y0: PAD.top, y1: H - PAD.bottom } as const;
}

/**
 * Lớp CSS của một tông chuỗi.
 *
 * Lớp tông chỉ đặt `color`; nét, dải chuyển màu và mẫu trong legend đều đọc `currentColor` — nhờ
 * vậy MỘT lớp mỗi tông là đủ cho cả ba, thay vì ba lớp nhân bốn tông. Ánh xạ tay để tên lớp băm
 * của CSS Module không bị gọi động (cùng nếp `toneClass()` của `CategoryIcon`).
 */
const TONE_CLASS: Readonly<Record<SeriesTone, string>> = {
  primary: styles.tonePrimary ?? '',
  teal: styles.toneSeriesTeal ?? '',
  violet: styles.toneSeriesViolet ?? '',
  muted: styles.toneSeriesMuted ?? '',
};

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

/**
 * Chiều cao đặt nhãn của một mốc tham chiếu, tính từ chiều cao của chính đường ấy.
 *
 * Bình thường nhãn nằm ngay TRÊN đường — mắt đọc "chữ rồi tới đường" tự nhiên hơn chiều ngược
 * lại. Nhưng mốc sát mép trên (RSI 70 khi miền Y dừng ở 72 chẳng hạn) thì nhãn ở trên sẽ tràn ra
 * ngoài vùng vẽ và bị cắt cụt, nên lật xuống dưới đường. Ngưỡng 9 là chiều cao một dòng chữ 9px.
 */
function labelYFor(y: number): number {
  return y - 4 < PLOT.y0 + 9 ? y + 11 : y - 4;
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
  const areaId = `${idBase}-area`;
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
  const {
    plot,
    sx,
    sy,
    syRight,
    lines,
    drawOrder,
    gaps,
    marked,
    refs,
    xLabels,
    yLabels,
    yRightLabels,
  } = useMemo(() => {
    const box = plotOf(model.yRight !== undefined);
    const scaleX = linearScale(model.x.domain, [box.x0, box.x1]);
    // Trục Y lật chiều: toạ độ SVG đi xuống, giá trị đi lên.
    const scaleY = linearScale(model.y.domain, [box.y1, box.y0]);
    const scaleYRight =
      model.yRight === undefined ? null : linearScale(model.yRight.domain, [box.y1, box.y0]);

    /*
     * MỘT danh sách đường, không phải "đường chính rồi mấy đường phụ".
     *
     * `seriesOf()` bên Domain là chỗ duy nhất biết ghép chuỗi chính (`model.points`) với chuỗi phụ
     * (`model.overlays`); ở đây chỉ lặp. Biểu đồ một chuỗi vẫn ra đúng một phần tử, đi qua đúng
     * `linePath`/`areaPath` như trước — không có nhánh riêng nào cho "trường hợp cũ".
     */
    const drawn = seriesOf(model).map((series, index) => {
      const toY = series.axis === 'right' && scaleYRight !== null ? scaleYRight : scaleY;
      return {
        key: series.key,
        label: series.label,
        tone: series.tone,
        dash: series.dash === true,
        width: series.width ?? 2,
        /* Bất biến của `seriesOf()`: phần tử đầu LÀ chuỗi chính. */
        primary: index === 0,
        onRight: series.axis === 'right' && scaleYRight !== null,
        d: linePath(series.points, scaleX, toY),
        area: series.area === true ? areaPath(series.points, scaleX, toY, box.y1) : '',
      };
    });

    return {
      plot: box,
      sx: scaleX,
      sy: scaleY,
      syRight: scaleYRight,
      lines: drawn,
      /*
       * Thứ tự VẼ, khác thứ tự đọc: chuỗi chính vẽ SAU CÙNG nên nó nằm trên mọi chuỗi phụ.
       *
       * Không phải chuyện thẩm mỹ — chuỗi chính là đầu ra của công thức, còn chuỗi phụ là bối
       * cảnh; để đường giá cắt ngang đè lên đúng đường SMA mà trang đang giải thích là lấy nền
       * che mất hình.
       *
       * `lines` giữ nguyên thứ tự chính-trước, và có HAI chỗ đọc nó theo thứ tự ấy: legend (nơi
       * chuỗi chính phải đứng đầu, khớp cột bảng số mà Domain đã xếp chính-trước), và khối
       * `<defs>` dựng dải chuyển màu cho chuỗi phụ bằng `lines.slice(1)` — phép cắt ấy NGẦM dựa
       * vào bất biến "phần tử đầu là chuỗi chính" của `seriesOf()`. Đảo thứ tự `lines` là đụng cả
       * hai chỗ, không riêng legend.
       *
       * Biểu đồ MỘT chuỗi: cả hai mảng có đúng một phần tử giống nhau, nên DOM không đổi.
       */
      drawOrder: [...drawn.slice(1), ...drawn.slice(0, 1)],
      /* Gạch chéo và dấu "giá trị hiện tại" bám CHUỖI CHÍNH, không bám chuỗi phụ nào. */
      gaps: gapsOf(model.points, scaleX),
      marked: model.points.find((point) => point.marked === true),
      /*
       * Mốc tham chiếu — chỉ CHIẾU toạ độ, không lọc gì.
       *
       * Việc hỏi "mốc này có nằm trong khung không" đã xong ở `buildChartModel()`; mảng tới đây
       * chỉ còn những mốc chắc chắn lọt. Lọc lại lần nữa ở đây là dựng lên nguồn sự thật thứ hai
       * cho cùng một câu hỏi, và hai nguồn ấy sẽ lệch nhau vào ngày ai đó đổi quy tắc ở một chỗ.
       *
       * Nhãn đặt TRÊN đường một nhịp, trừ khi đường sát mép trên đến mức nhãn bị cắt — lúc đó
       * lật xuống dưới. Không có phép đo DOM nào ở đây: cả hai số đều suy từ `viewBox`.
       */
      refs: (model.referenceLines ?? []).map((line) => {
        const yPos = scaleY(line.value);
        return { value: line.value, label: line.label, y: yPos, labelY: labelYFor(yPos) };
      }),
      /*
       * Chỉ hai nhãn đầu–cuối trên trục X, đúng bản thiết kế đợt 12. Bốn nhãn là đủ để đọc, nhưng
       * bản vẽ mới bỏ nền và viền của vùng vẽ, nên hàng nhãn dày trở thành thứ nặng nhất còn lại
       * dưới hình. `thin()` luôn giữ vạch đầu và vạch cuối, nên hai đầu miền vẫn đọc được.
       */
      xLabels: thin(model.x.ticks, 2),
      yLabels: thin(model.y.ticks, 5),
      /* Trục Y phải: cùng số nhãn với trục trái để hai bên đọc ngang hàng nhau. */
      yRightLabels: model.yRight === undefined ? [] : thin(model.yRight.ticks, 5),
    };
  }, [model]);

  function handlePointerMove(event: ReactPointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (svg === null) return;

    // Đọc DOM ở ĐÂY, trong handler — hợp lệ, xem quyết định 2 ở docblock đầu file.
    const rect = svg.getBoundingClientRect();
    const viewPoint = pointerToViewBox(rect, event.clientX, event.clientY, W, H);
    if (viewPoint === null) return;

    const clampedX = Math.min(Math.max(viewPoint.x, plot.x0), plot.x1);
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
  const hoverOnRight = hoverX !== null && hoverX > (plot.x0 + plot.x1) / 2;

  /*
   * Legend — CHỈ khi có từ hai chuỗi trở lên.
   *
   * Trả về `null` khi một chuỗi, và cả khối dưới bọc trong `<>…</>`: một fragment chứa `null` dựng
   * ra ĐÚNG cùng DOM như trả về một mình thẻ `<div>`, nên 100 biểu đồ hiện có không mọc thêm một
   * node nào. Đó là điều kiện của cả đợt này.
   *
   * Dựng ở đây chứ không ở `ChartFrame`: `ChartFullscreen` dựng `LineChart` thẳng, không đi qua
   * `ChartFrame` — đặt ở đây thì bản phóng to có legend miễn phí, đặt ở kia thì nó câm.
   *
   * Mỗi mục có MẪU NÉT thật (cùng lớp tông, cùng nét đứt, cùng độ dày) chứ không phải một ô màu:
   * màu không được là dấu hiệu duy nhất (NFR-USA-06), và mẫu nét nói luôn cả kiểu nét lẫn độ dày.
   */
  const legend =
    lines.length < 2 ? null : (
      <ul className={styles.legend}>
        {lines.map((series) => (
          <li
            key={`leg-${series.key}`}
            className={`${styles.legendItem} ${TONE_CLASS[series.tone]}`}
          >
            <svg
              className={styles.legendSwatch}
              width="18"
              height="8"
              viewBox="0 0 18 8"
              aria-hidden="true"
            >
              <line
                className={`${styles.seriesLine}${series.dash ? ` ${String(styles.seriesDashed)}` : ''}`}
                x1="0"
                y1="4"
                x2="18"
                y2="4"
                strokeWidth={series.width}
              />
            </svg>
            <span className={styles.legendLabel}>{pick(series.label)}</span>
            {/*
              Chuỗi nào đọc trục nào — chỉ nói khi thật sự có hai trục. Không có nó thì hai thang
              lệch hẳn nhau nằm chồng lên nhau mà người đọc không có cách nào biết đường nào đo theo
              mép nào.
            */}
            {model.yRight !== undefined && (
              <span className={styles.legendAxis}>{series.onRight ? '→' : '←'}</span>
            )}
          </li>
        ))}
      </ul>
    );

  return (
    <>
      {legend}
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

            {/*
            Dải chuyển màu của vùng dưới đường. `id` suy từ `idBase` y như `<pattern>` ở trên và
            vì đúng một lý do: bản trên trang và bản trong màn phóng to cùng nằm trong DOM khi lớp
            phủ đang mở, trùng `id` là bản sau trỏ nhầm vào node của bản trước. Tuyệt đối KHÔNG
            dùng `useId()` — cả thư mục này nằm sau ranh giới `next/dynamic`, nơi id React sinh ra
            khác nhau giữa HTML tĩnh và lượt hydrate.
          */}
            <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
              <stop className={styles.areaTop} offset="0" />
              <stop className={styles.areaBottom} offset="1" />
            </linearGradient>

            {/*
            Dải chuyển màu riêng cho từng chuỗi PHỤ có xin tô vùng.

            Lớp tông đặt trên chính thẻ `<linearGradient>` chứ không trên `<path>`: hai `<stop>` bên
            trong đọc `stop-color: var(--series-ink)`, mà biến ấy thừa kế theo cây DOM của CHÍNH
            gradient, không theo hình đang tham chiếu tới nó. Đặt nhầm chỗ là cả dải tô rơi về giá
            trị mặc định của khe.

            `id` ghép thêm `key` của chuỗi vì `idBase` đã phân biệt bản trên trang với bản phóng to,
            còn `key` phân biệt các chuỗi trong cùng một bản.
          */}
            {lines.slice(1).map((series) =>
              series.area === '' ? null : (
                <linearGradient
                  key={`grad-${series.key}`}
                  id={`${areaId}-${series.key}`}
                  className={TONE_CLASS[series.tone]}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop className={styles.seriesAreaTop} offset="0" />
                  <stop className={styles.seriesAreaBottom} offset="1" />
                </linearGradient>
              ),
            )}
          </defs>

          {/* Lưới ngang: đủ để đọc độ cao, không kẻ dọc cho khỏi rối. */}
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

          {/* Vùng không tính được, vẽ TRƯỚC đường để không che nét. */}
          {gaps.map((gap) => (
            <rect
              key={`gap-${String(gap.fromX)}`}
              className={styles.gap}
              x={Math.min(gap.fromX, gap.toX)}
              y={plot.y0}
              width={Math.abs(gap.toX - gap.fromX)}
              height={plot.y1 - plot.y0}
              fill={`url(#${hatchId})`}
            />
          ))}

          {/* Hai trục. */}
          <line className={styles.axis} x1={plot.x0} y1={plot.y1} x2={plot.x1} y2={plot.y1} />
          <line className={styles.axis} x1={plot.x0} y1={plot.y0} x2={plot.x0} y2={plot.y1} />

          {/* Trục Y thứ hai — chỉ có khi một chuỗi phụ thật sự xin nó. */}
          {model.yRight !== undefined && (
            <line className={styles.axis} x1={plot.x1} y1={plot.y0} x2={plot.x1} y2={plot.y1} />
          )}

          {/*
          Mốc tham chiếu — ngưỡng cố định của chỉ báo, ví dụ 30 và 70 của RSI.

          Vẽ Ở ĐÂY, sau hai trục và TRƯỚC vùng tô lẫn đường quét: SVG xếp lớp theo thứ tự thẻ, nên
          đây là chỗ duy nhất mốc nằm dưới đường dữ liệu. Nó là nền để đọc, không phải thứ đáng
          che mất đường.

          Nhãn bám mép TRÁI, không phải mép phải: trên trục thời gian, dấu "giá trị hiện tại" luôn
          rơi vào phiên cuối, nên nhãn của nó neo bên phải — hai nhãn cùng dồn về đó là chồng lên
          nhau. Quầng nền sau chữ (`.refLabel`) lo nốt những lần đường quét đi ngang qua.

          Khoá theo `value` an toàn: hai mốc trùng giá trị là hai mốc trùng nhau.
        */}
          {refs.map((ref) => (
            <g key={`ref-${String(ref.value)}`} data-ref-value={ref.value}>
              <line className={styles.refRule} x1={plot.x0} y1={ref.y} x2={plot.x1} y2={ref.y} />
              <text className={styles.refLabel} x={plot.x0 + 4} y={ref.labelY} textAnchor="start">
                {pick(ref.label)}
              </text>
            </g>
          ))}

          {/*
          Các chuỗi dữ liệu. Vùng tô của MỌI chuỗi vẽ trước, rồi mới tới nét của mọi chuỗi — nếu
          vẽ xen kẽ (tô rồi nét, tô rồi nét) thì dải tô của chuỗi sau phủ mờ lên nét của chuỗi trước.

          Cả hai vòng chạy trên `drawOrder` (chuỗi phụ trước, chuỗi CHÍNH sau cùng), không phải
          `lines` — xem lý do ở chỗ dựng `drawOrder`. Chuỗi chính dùng đúng lớp `.line` và `.area`
          cũ với `id` dải chuyển màu cũ, nên biểu đồ một chuỗi ra đúng cùng chuỗi HTML như trước
          khi mở đường cho nhiều chuỗi. Chuỗi phụ đi lối `.seriesLine`, màu theo lớp tông.
        */}
          {drawOrder.map((series) =>
            series.area === '' ? null : (
              <path
                key={`area-${series.key}`}
                className={series.primary ? styles.area : styles.seriesArea}
                d={series.area}
                fill={`url(#${series.primary ? areaId : `${areaId}-${series.key}`})`}
              />
            ),
          )}

          {drawOrder.map((series) =>
            series.d === '' ? null : series.primary ? (
              <path
                key={`line-${series.key}`}
                className={styles.line}
                d={series.d}
                data-points={model.points.length}
              />
            ) : (
              <path
                key={`line-${series.key}`}
                className={`${styles.seriesLine} ${TONE_CLASS[series.tone]}${
                  series.dash ? ` ${String(styles.seriesDashed)}` : ''
                }`}
                d={series.d}
                strokeWidth={series.width}
                data-series={series.key}
              />
            ),
          )}

          {/* Nhãn trục Y, canh phải sát trục. */}
          {yLabels.map((tick) => (
            <text
              key={`y-${String(tick.value)}`}
              className={styles.tick}
              x={plot.x0 - 5}
              y={sy(tick.value) + 3}
              textAnchor="end"
            >
              {tick.label}
            </text>
          ))}

          {/* Nhãn trục Y phải, canh trái sát trục — đối xứng với nhãn trục trái. */}
          {syRight !== null &&
            yRightLabels.map((tick) => (
              <text
                key={`yr-${String(tick.value)}`}
                className={styles.tick}
                x={plot.x1 + 5}
                y={syRight(tick.value) + 3}
                textAnchor="start"
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
              y={plot.y1 + 13}
              textAnchor="middle"
            >
              {tick.label}
            </text>
          ))}

          {/*
          Tên hai trục bằng chữ, không xoay dọc: chữ xoay 90 độ ở khổ 360 vừa khó đọc vừa ăn thêm
          lề trái. Tên trục Y đặt trên góc trái, tên trục X ở giữa đáy — đúng lối các báo cáo in.
        */}
          <text className={styles.axisTitle} x={plot.x0 - 2} y={plot.y0 - 2}>
            {pick(model.y.title)}
          </text>

          {/*
            Tên trục Y PHẢI — góc trên bên phải, canh mép phải.

            Bắt buộc chứ không phải trang trí: hai trục mang hai đơn vị khác hẳn nhau (₫ cạnh điểm),
            nên một trục không nói tên mình là người đọc không biết đường nào đo theo thang nào —
            đúng thứ mà cả trục thứ hai sinh ra để giải quyết.

            Canh `end` ở mép viewBox chứ không đặt ngay sau `plot.x1`: chỗ còn lại bên phải chỉ 40
            đơn vị, không đủ cho một tên trục. Đặt ở y trên mép khung vẽ nên nó không đè lên hình,
            cùng cách tên trục trái đang làm.
          */}
          {model.yRight !== undefined && (
            <text className={styles.axisTitle} x={W - 2} y={plot.y0 - 2} textAnchor="end">
              {pick(model.yRight.title)}
            </text>
          )}

          <text
            className={styles.axisTitle}
            x={(plot.x0 + plot.x1) / 2}
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
            /*
            Con trỏ NÓI RA trạng thái: bàn tay khi bấm ghi được giá trị, chữ thập khi chỉ dò đọc.
            Trước đợt này lúc nào cũng là chữ thập, kể cả trên trục thời gian nơi bấm không làm gì
            — tức dấu hiệu duy nhất mà con trỏ đưa ra là một dấu hiệu sai.
          */
            className={
              onApplyPoint === undefined
                ? styles.hoverCapture
                : `${styles.hoverCapture} ${styles.hoverCaptureReady}`
            }
            data-testid={`${idBase}-hover-capture`}
            x={plot.x0}
            y={plot.y0}
            width={plot.x1 - plot.x0}
            height={plot.y1 - plot.y0}
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
              <line
                className={styles.hoverLine}
                x1={hoverX}
                y1={plot.y0}
                x2={hoverX}
                y2={plot.y1}
              />
              {hover.y !== null && (
                <circle className={styles.hoverDot} cx={hoverX} cy={sy(hover.y)} r="3.5" />
              )}
              <text
                className={styles.hoverLabel}
                x={hoverOnRight ? hoverX - 6 : hoverX + 6}
                y={plot.y0 + 22}
                textAnchor={hoverOnRight ? 'end' : 'start'}
              >
                {hover.label} · {hover.valueLabel}
              </text>
            </g>
          )}

          {/*
          Dấu "giá trị hiện tại": vạch dọc nét đứt + chấm + nhãn chữ (FR-08).

          Vẽ SAU vạch dò, và đó là chủ ý chứ không phải tiện tay. Vạch dò đi theo con trỏ nên nó
          quét qua đúng vị trí của dấu này mỗi lần người dùng rê ngang; ở thứ tự cũ (dấu vẽ trước,
          vạch dò vẽ sau) thì chấm rỗng của vạch dò đè lên chấm đặc của dấu, và người dùng mất chỗ
          neo ngay lúc họ đang so "giá trị hiện tại" với điểm sắp bấm — tức đúng lúc cần nó nhất.

          Đổi lại phải có `pointer-events: none` (lớp `.marker`): nó nay nằm TRÊN vùng bắt sự kiện,
          nên thiếu dòng đó thì rê chuột ngang qua chính cái dấu này sẽ mất luôn vạch dò.
        */}
          {marked !== undefined && (
            <g className={styles.marker} data-testid="chart-marker">
              <line
                className={styles.markerLine}
                x1={sx(marked.x)}
                y1={plot.y0}
                x2={sx(marked.x)}
                y2={plot.y1}
              />
              {marked.y !== null && (
                <circle className={styles.markerDot} cx={sx(marked.x)} cy={sy(marked.y)} r="4" />
              )}
              <text
                className={styles.markerLabel}
                x={sx(marked.x) > (plot.x0 + plot.x1) / 2 ? sx(marked.x) - 6 : sx(marked.x) + 6}
                y={plot.y0 + 10}
                textAnchor={sx(marked.x) > (plot.x0 + plot.x1) / 2 ? 'end' : 'start'}
              >
                {marked.valueLabel}
              </text>
            </g>
          )}
        </svg>
      </div>
    </>
  );
}

/** Dùng cho test và cho bản in — cùng một hình học, không đoán lại. */
export const CHART_GEOMETRY = { W, H, PLOT } as const;
