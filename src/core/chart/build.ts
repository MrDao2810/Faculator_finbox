/**
 * Tầng DOMAIN — cổng DUY NHẤT dựng mô hình biểu đồ.
 *
 * Hai lời hứa của hàm này, và cả hai đều là lý do nó tồn tại:
 *
 *   1. **Không bao giờ ném lỗi.** Mọi lối ra là một `ChartModel` hợp lệ, kể cả khi không vẽ được —
 *      lúc đó là nhánh `unavailable` mang theo `CalcWarning`. Tầng giao diện không cần `try`.
 *   2. **Không bao giờ nhả `NaN` hay `Infinity`** vào bất cứ số nào của mô hình. Chrome bỏ qua
 *      `<path>` chứa `NaN` nên biểu đồ biến mất im lặng; lưới an toàn đặt ở đây, tại chỗ đi qua
 *      bắt buộc, đúng cách nghĩ đã chọn cho `ok()`.
 *
 * Nhãn số cũng định dạng SẴN ở đây. Nếu để renderer tự gọi `formatNumber` thì mỗi renderer tự
 * quyết số chữ số thập phân, và bảng số, nhãn trục, câu mô tả, bản in với tấm PNG sẽ nói bốn kiểu
 * khác nhau về cùng một con số.
 */

import type { CalcContext, CalcInputs, FormulaModule } from '../calc/types';
import { formatNumber, formatValueWithUnit } from '../format';
import type { CalcOutput, Level } from '../types';
import { WARNING_LABELS, meaningless } from '../warnings';
import { HISTORY_KEY, HISTORY_LABEL, canDrawHistory, historyPoints, sessionTicks } from './history';
import { decimalsOf, extentOf, niceAxis } from './scale';
import { pickSweepVariable, sweepCandidates, sweepPoints } from './sweep';
import { condensePoints } from './table';
import type { ChartAxis, ChartModel, ChartPoint, ChartTable } from './types';

export interface ChartArgs {
  formula: FormulaModule;
  inputs: CalcInputs;
  ctx: CalcContext;
  /** Kết quả đang hiện ở khối Kết quả — dùng để biểu đồ nói đúng câu ấy khi không vẽ được. */
  output: CalcOutput;
  level: Level;
  /**
   * Trục X người dùng chọn: khoá một biến, hoặc `HISTORY_KEY` cho đường theo thời gian.
   * Không hợp lệ — kể cả xin đường thời gian khi chưa nạp dữ liệu — thì rơi về lựa chọn mặc định.
   */
  sweepKey?: string;
  span?: number;
  /**
   * Tên nguồn chuỗi phiên, ví dụ `'FPT'`. Chỉ để viết câu mô tả cho đúng: một biểu đồ nói "qua 248
   * phiên" mà không nói phiên của mã nào là biểu đồ người đọc không kiểm chứng được.
   */
  seriesLabel?: string;
}

/**
 * Phần trước dấu gạch dài của một nhãn.
 *
 * 'EPS — lợi nhuận trên mỗi cổ phiếu' thành 'EPS'. Tên đầy đủ hợp cho bảng biến và tiêu đề màn,
 * nhưng nhãn trục ở khổ 360px thì phải gọn. Chỉ cắt ở gạch dài có khoảng trắng hai bên nên không
 * chạm tới dấu nối trong từ.
 */
function shortLabel(text: string): string {
  const [head] = text.split(/\s[—–]\s/);
  return (head ?? text).trim();
}

/**
 * Bậc thang đơn vị cho nhãn trục tiền.
 *
 * Trục chạy tới 2.000.000.000 thì nhãn vạch dài 13 ký tự và ở khổ 360px chúng chồng lên nhau. Chia
 * bậc rồi ghi đơn vị vào TIÊU ĐỀ trục là cách các báo cáo tài chính vẫn làm, và nó dùng lại đúng
 * ba bậc `UNIT_SCALES` của `format.ts`.
 */
function axisUnit(unit: string, maxAbs: number): { factor: number; label: string } {
  if (unit === '₫' && maxAbs >= 1_000_000_000) return { factor: 1_000_000_000, label: 'tỷ ₫' };
  if (unit === '₫' && maxAbs >= 1_000_000) return { factor: 1_000_000, label: 'triệu ₫' };
  return { factor: 1, label: unit };
}

function buildAxis(lo: number, hi: number, name: string, unit: string): ChartAxis {
  const nice = niceAxis(lo, hi);
  const maxAbs = Math.max(Math.abs(nice.domain[0]), Math.abs(nice.domain[1]));
  const scale = axisUnit(unit, maxAbs);
  const decimals = decimalsOf(nice.step / scale.factor);

  return {
    title: scale.label === '' ? name : `${name} (${scale.label})`,
    domain: nice.domain,
    ticks: nice.ticks.map((value) => ({
      value,
      label: formatNumber(value / scale.factor, { maxDecimals: decimals }),
    })),
  };
}

/** Công thức không có biến vô hướng nào quét được — hiếm, nhưng phải nói ra chứ không vẽ khung rỗng. */
const NO_SWEEP_VARIABLE = meaningless(
  'Công thức này không có ô số nào quét được để dựng đường độ nhạy.',
  'Xem bảng biến bên dưới để biết công thức phụ thuộc những gì.',
);

/** Quét xong mà không mức nào ra số — thường vì còn một ô khác đang để trống. */
const NOTHING_TO_DRAW = meaningless(
  'Chưa mức nào tính ra kết quả nên chưa vẽ được đường.',
  'Kiểm tra lại các ô đầu vào, hoặc nạp bộ số liệu mẫu để so sánh.',
);

/**
 * Số phiên `null` nằm liền một dải ở ĐẦU chuỗi, khi mọi phiên không tính được đều nằm trong dải ấy.
 *
 * Phân biệt hai chuyện rất khác nhau mà cùng cho `y === null`:
 *
 *   - **Khởi động** — chỉ báo cuộn chưa đủ phiên để tồn tại. SMA-20 không có giá trị ở phiên thứ 5,
 *     RSI-14 không có ở phiên thứ 3, VaR lịch sử đòi 60 quan sát. Đường đúng ra BẮT ĐẦU MUỘN, chứ
 *     không phải bị ngắt; gọi nó là "ngắt ở 59 phiên" là đẩy người đọc đi tìm một chỗ hỏng không
 *     tồn tại.
 *   - **Ngắt giữa** — công thức sụp ở một quãng nằm trong vùng đã có dữ liệu, như `he-so-bien-thien`
 *     khi lợi suất trung bình đi qua 0. Đây mới là chỗ FR-06 có điều đáng cảnh báo.
 *
 * Đo trên bộ mẫu 248 phiên của FPT: **33 công thức thuộc loại đầu, đúng 1 công thức có ngắt giữa
 * thật.** Nên gộp hai loại vào một câu là nói sai cho phần lớn biểu đồ của nhóm Kỹ thuật và Rủi ro.
 *
 * @returns 0 khi không phải dải khởi động thuần, tức có phiên `null` nằm sau một phiên đã ra số.
 */
function warmUpLength(points: ReadonlyArray<ChartPoint>): number {
  let lead = 0;
  while (lead < points.length && points[lead]?.y === null) lead += 1;
  if (lead === 0) return 0;
  return points.slice(lead).every((point) => point.y !== null) ? lead : 0;
}

/**
 * Dựng mô hình biểu đồ cho một công thức.
 *
 * Thứ tự kiểm có ý nghĩa: **chỉ bỏ vẽ khi thiếu chuỗi giá**, chứ không bỏ vẽ khi kết quả hiện tại
 * đang lỗi. Người dùng gõ EPS = 0 thì khối Kết quả báo chia cho 0, nhưng đường quét vẫn rất đáng
 * xem — nó cho thấy đúng chỗ công thức sụp, và đó là minh hoạ FR-06 rõ nhất trên toàn ứng dụng.
 */
export function buildChartModel(args: ChartArgs): ChartModel {
  const { formula, inputs, ctx, output, level, sweepKey, span, seriesLabel } = args;
  const { spec } = formula;
  const name = shortLabel(spec.name.vi);

  if (output.warning?.code === 'MISSING_SERIES') {
    return { kind: 'unavailable', title: name, warning: output.warning };
  }

  const candidates = sweepCandidates(spec, level);

  /*
   * Đường thời gian là MỘT MỤC trong cùng ô chọn trục X, không phải một loại biểu đồ riêng.
   *
   * Nhờ đặt thế, `ChartBody` và `SweepPicker` không phải sửa một dòng nào: chúng vẫn chỉ giữ một
   * chuỗi `sweepKey` rồi bắn lên. Chỗ duy nhất biết có hai lối sinh điểm là hàm này.
   */
  const historyReady = canDrawHistory(formula, ctx);
  const options = [
    ...(historyReady ? [{ key: HISTORY_KEY, label: HISTORY_LABEL }] : []),
    ...candidates.map((variable) => ({ key: variable.key, label: shortLabel(variable.label) })),
  ];

  /*
   * Có dữ liệu thật thì MẶC ĐỊNH vẽ theo dữ liệu thật.
   *
   * Người dùng vừa nạp mã FPT thì thứ họ chờ thấy là số liệu của FPT, không phải một đường giả định
   * ±50%. Họ vẫn đổi lại được bằng ô chọn ngay trên hình, và lựa chọn ấy được giữ — `sweepKey` có
   * giá trị nghĩa là người dùng đã tự quyết, lúc đó không giành lái.
   */
  const onTime = historyReady && (sweepKey === undefined || sweepKey === HISTORY_KEY);

  let points: ReadonlyArray<ChartPoint>;
  let x: ChartAxis;
  let activeKey: string;
  let axisName: string;

  if (onTime) {
    points = historyPoints(formula, inputs, ctx);
    x = {
      title: 'Ngày',
      domain: [0, Math.max(1, points.length - 1)],
      ticks: sessionTicks(ctx.bars ?? []),
    };
    activeKey = HISTORY_KEY;
    axisName = 'thời gian';
  } else {
    const chosen =
      candidates.find((variable) => variable.key === sweepKey) ??
      pickSweepVariable(formula, ctx, level);

    if (chosen === null) {
      return { kind: 'unavailable', title: name, warning: NO_SWEEP_VARIABLE };
    }

    points = sweepPoints(formula, inputs, ctx, chosen.key, span);
    const xExtent = extentOf(points.map((point) => point.x));
    if (xExtent === null) {
      return { kind: 'unavailable', title: name, warning: output.warning ?? NOTHING_TO_DRAW };
    }

    axisName = shortLabel(chosen.label);
    x = buildAxis(xExtent[0], xExtent[1], axisName, chosen.unit);
    activeKey = chosen.key;
  }

  const yExtent = extentOf(points.map((point) => point.y));
  if (yExtent === null) {
    return { kind: 'unavailable', title: name, warning: output.warning ?? NOTHING_TO_DRAW };
  }

  const y = buildAxis(yExtent[0], yExtent[1], name, spec.resultUnit);

  const table: ChartTable = {
    columns: [x.title, y.title],
    rows: condensePoints(points).map((point) =>
      point === null ? null : ([point.label, point.valueLabel] as const),
    ),
  };

  const missing = points.filter((point) => point.y === null).length;
  const marked = points.find((point) => point.marked === true);
  const first = points[0];
  const last = points[points.length - 1];
  const unit = onTime ? 'phiên' : 'mức';

  /*
   * Chỉ hỏi "khởi động" trên trục thời gian.
   *
   * Trên đường quét, một dải null ở đầu KHÔNG phải khởi động — nó là quãng công thức không có nghĩa,
   * như `co-lenh-rui-ro` với 18 mức đầu. Bảo người đọc "18 mức đầu chưa đủ dữ liệu" ở đó là nói sai
   * nguyên nhân, nên phép hỏi giới hạn đúng vào chỗ khái niệm này có thật.
   */
  const warmUp = onTime ? warmUpLength(points) : 0;
  const firstReal = points[warmUp];

  const sentences = [
    first === undefined || last === undefined
      ? ''
      : onTime
        ? `${name}${seriesLabel === undefined ? '' : ` của ${seriesLabel}`} qua ${String(points.length)} phiên, từ ${first.label} tới ${last.label}.`
        : `Quét ${axisName} từ ${first.label} tới ${last.label} qua ${String(points.length)} mức.`,
    `${name} chạy trong khoảng ${formatValueWithUnit(yExtent[0], spec.resultUnit)} tới ${formatValueWithUnit(yExtent[1], spec.resultUnit)}.`,
    marked === undefined
      ? ''
      : onTime
        ? `Phiên gần nhất ${marked.label} cho ${marked.valueLabel}.`
        : `Ở giá trị hiện tại ${marked.label}, kết quả là ${marked.valueLabel}.`,
    missing === 0
      ? `Mọi ${unit} đều tính được.`
      : warmUp > 0 && firstReal !== undefined
        ? `${String(warmUp)} phiên đầu chưa đủ dữ liệu để tính, nên đường bắt đầu từ ${firstReal.label}.`
        : `${String(missing)} trên ${String(points.length)} ${unit} không tính được.`,
  ];

  const reason = points.find((point) => point.y === null && point.reason !== undefined)?.reason;

  return {
    kind: 'line',
    title: `${name} theo ${axisName}`,
    summary: sentences.filter((sentence) => sentence !== '').join(' '),
    x,
    y,
    points,
    table,
    sweepKey: activeKey,
    options,
    /*
     * Ghi chú chỉ dành cho NGẮT GIỮA. Dải khởi động đã được câu mô tả nói đúng bản chất ngay trên
     * đó rồi, và nó không phải điều đáng cảnh báo — thêm một dòng "đường ngắt" nữa là dựng lên một
     * vấn đề không có.
     */
    ...(missing === 0 || warmUp > 0
      ? {}
      : {
          note: `Đường ngắt ở ${String(missing)} ${unit} không tính được${
            reason === undefined ? '' : ` — ${WARNING_LABELS[reason].toLowerCase()}`
          }.`,
        }),
  };
}
