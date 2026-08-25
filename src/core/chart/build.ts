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
 *
 * Mọi câu chữ ở đây tự viết CẢ HAI vế vi/en ngay tại chỗ (không import i18n, CON-02) — cùng cách
 * `warnings.ts` làm. Số và đơn vị (`formatNumber`, `formatValueWithUnit`, `resultUnit`) CHƯA nằm
 * trong đợt dịch này — chúng dùng chung một chuỗi cho cả hai vế, xem ghi chú ở `Bilingual` trong
 * `core/types.ts` và mục "Giới hạn đã biết" của kế hoạch.
 */

import type { CalcContext, CalcInputs, FormulaModule } from '../calc/types';
import { formatNumber, formatValueWithUnit } from '../format';
import type { Bilingual, CalcOutput, Level } from '../types';
import { WARNING_LABELS, meaningless } from '../warnings';
import {
  BREAKDOWN_KEY,
  BREAKDOWN_LABEL,
  breakdownBars,
  breakdownExtent,
  canDrawBreakdown,
} from './breakdown';
import { HISTORY_KEY, HISTORY_LABEL, canDrawHistory, historyPoints, sessionTicks } from './history';
import { decimalsOf, extentOf, niceAxis } from './scale';
import { pickSweepVariable, sweepCandidates, sweepPoints } from './sweep';
import { condensePoints } from './table';
import type { FormulaSpec } from '../registry/types';
import type { ChartAxis, ChartModel, ChartPoint, ChartTable, SweepOption } from './types';

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
 * Phần trước dấu gạch dài của một nhãn, áp cho cả hai vế độc lập.
 *
 * 'EPS — lợi nhuận trên mỗi cổ phiếu' thành 'EPS'. Tên đầy đủ hợp cho bảng biến và tiêu đề màn,
 * nhưng nhãn trục ở khổ 360px thì phải gọn. Chỉ cắt ở gạch dài có khoảng trắng hai bên nên không
 * chạm tới dấu nối trong từ. Tên tiếng Anh thường không có gạch dài đó nên vế `en` giữ nguyên cả
 * câu — chấp nhận được, đây chỉ là rút gọn cho vừa khổ, không phải chỗ đúng/sai.
 */
function shortLabel(text: Bilingual): Bilingual {
  const [headVi] = text.vi.split(/\s[—–]\s/);
  const [headEn] = text.en.split(/\s[—–]\s/);
  return { vi: (headVi ?? text.vi).trim(), en: (headEn ?? text.en).trim() };
}

/**
 * Bậc thang đơn vị cho nhãn trục tiền.
 *
 * Trục chạy tới 2.000.000.000 thì nhãn vạch dài 13 ký tự và ở khổ 360px chúng chồng lên nhau. Chia
 * bậc rồi ghi đơn vị vào TIÊU ĐỀ trục là cách các báo cáo tài chính vẫn làm, và nó dùng lại đúng
 * ba bậc `UNIT_SCALES` của `format.ts`.
 */
function axisUnit(unit: string, maxAbs: number): { factor: number; label: Bilingual } {
  if (unit === '₫' && maxAbs >= 1_000_000_000) {
    return { factor: 1_000_000_000, label: { vi: 'tỷ ₫', en: 'billion ₫' } };
  }
  if (unit === '₫' && maxAbs >= 1_000_000) {
    return { factor: 1_000_000, label: { vi: 'triệu ₫', en: 'million ₫' } };
  }
  return { factor: 1, label: { vi: unit, en: unit } };
}

/**
 * Mô hình thác nước — dựng xong ở đây, renderer chỉ còn chiếu toạ độ.
 *
 * Không dùng chung nhánh cuối của `buildChartModel()` vì hai thứ khác hẳn: thác nước không có
 * trục X kiểu số (trục ngang là các CHẶNG, không phải một đại lượng), và miền trục Y phải chứa 0.
 */
function buildBreakdownModel(
  spec: FormulaSpec,
  inputs: CalcInputs,
  output: CalcOutput,
  name: Bilingual,
  options: ReadonlyArray<SweepOption>,
): ChartModel {
  const bars = breakdownBars(spec, inputs, output);
  const extent = breakdownExtent(bars);

  if (bars.length === 0 || extent === null) {
    return {
      kind: 'unavailable',
      title: name,
      warning: output.warning ?? NOTHING_TO_DRAW,
      options,
      sweepKey: BREAKDOWN_KEY,
    };
  }

  /*
   * Trục giá trị mang tên ĐẠI LƯỢNG, không mang tên công thức — cùng lý do với nhãn cột tổng.
   * Trục của `lich-tra-no` đo tổng lãi; gắn 'Lịch trả nợ vay (tỷ ₫)' vào đó là đặt tên một công
   * việc cho một số tiền. Công thức không khai `breakdownTotal` thì giữ nguyên nếp cũ của mọi
   * biểu đồ khác, nên thay đổi này chỉ chạm đúng những cái vừa khai.
   */
  const y = buildAxis(extent[0], extent[1], spec.breakdownTotal ?? name, spec.resultUnit);
  const total = bars[bars.length - 1];

  const stages = bars.filter((bar) => bar.isTotal !== true);
  const cong = stages.filter((bar) => bar.delta >= 0).length;
  const tru = stages.length - cong;

  const stageListVi = stages.map((bar) => bar.label.vi).join(' · ');
  const stageListEn = stages.map((bar) => bar.label.en).join(' · ');

  const sentencesVi = [
    `${name.vi} bóc thành ${String(stages.length)} phần: ${stageListVi}.`,
    cong > 0 && tru > 0
      ? `${String(cong)} phần cộng vào, ${String(tru)} phần trừ ra.`
      : `Mọi phần đều ${cong > 0 ? 'cộng vào' : 'trừ ra'}.`,
    total === undefined ? '' : `Cộng lại được ${total.valueLabel}.`,
  ];
  const sentencesEn = [
    `${name.en} breaks down into ${String(stages.length)} parts: ${stageListEn}.`,
    cong > 0 && tru > 0
      ? `${String(cong)} parts add, ${String(tru)} parts subtract.`
      : `Every part ${cong > 0 ? 'adds in' : 'subtracts out'}.`,
    total === undefined ? '' : `Together they total ${total.valueLabel}.`,
  ];

  return {
    kind: 'waterfall',
    title: { vi: `${name.vi} — bóc tách`, en: `${name.en} — breakdown` },
    summary: {
      vi: sentencesVi.filter((sentence) => sentence !== '').join(' '),
      en: sentencesEn.filter((sentence) => sentence !== '').join(' '),
    },
    y,
    bars,
    table: {
      columns: [{ vi: 'Thành phần', en: 'Component' }, y.title],
      rows: bars.map((bar) => [bar.label, bar.valueLabel] as const),
    },
    options,
    sweepKey: BREAKDOWN_KEY,
  };
}

function buildAxis(lo: number, hi: number, name: Bilingual, unit: string): ChartAxis {
  const nice = niceAxis(lo, hi);
  const maxAbs = Math.max(Math.abs(nice.domain[0]), Math.abs(nice.domain[1]));
  const scale = axisUnit(unit, maxAbs);
  const decimals = decimalsOf(nice.step / scale.factor);

  return {
    title: {
      vi: scale.label.vi === '' ? name.vi : `${name.vi} (${scale.label.vi})`,
      en: scale.label.en === '' ? name.en : `${name.en} (${scale.label.en})`,
    },
    domain: nice.domain,
    ticks: nice.ticks.map((value) => ({
      value,
      label: formatNumber(value / scale.factor, { maxDecimals: decimals }),
    })),
  };
}

/** Công thức không có biến vô hướng nào quét được — hiếm, nhưng phải nói ra chứ không vẽ khung rỗng. */
const NO_SWEEP_VARIABLE = meaningless(
  {
    vi: 'Công thức này không có ô số nào quét được để dựng đường độ nhạy.',
    en: 'This formula has no numeric field that can be swept to draw a sensitivity line.',
  },
  {
    vi: 'Xem bảng biến bên dưới để biết công thức phụ thuộc những gì.',
    en: 'See the variable table below to see what the formula depends on.',
  },
);

/** Quét xong mà không mức nào ra số — thường vì còn một ô khác đang để trống. */
const NOTHING_TO_DRAW = meaningless(
  {
    vi: 'Chưa mức nào tính ra kết quả nên chưa vẽ được đường.',
    en: 'No level produced a result yet, so the line cannot be drawn.',
  },
  {
    vi: 'Kiểm tra lại các ô đầu vào, hoặc nạp bộ số liệu mẫu để so sánh.',
    en: 'Double-check the input fields, or load a sample dataset to compare.',
  },
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
 * **Không bỏ vẽ chỉ vì KẾT QUẢ HIỆN TẠI đang lỗi** — kể cả lỗi thiếu chuỗi giá. Người dùng gõ
 * EPS = 0 thì khối Kết quả báo chia cho 0, nhưng đường quét vẫn rất đáng xem: nó cho thấy đúng chỗ
 * công thức sụp, và đó là minh hoạ FR-06 rõ nhất trên toàn ứng dụng.
 *
 * Trước đợt này có một cửa chặn sớm bỏ vẽ ngay khi `output.warning` là `MISSING_SERIES`, mâu thuẫn
 * với chính câu trên và tạo ra một **ngõ cụt thật**: đường quét theo số phiên VẼ CẢ vùng vượt quá
 * chuỗi đang có (`sweepPoints` giữ nguyên các điểm `y === null`, vẽ thành vệt gạch chéo), nên nhả
 * tay trong vùng ấy ghi ngược một N quá lớn vào ô Số liệu → kết quả lỗi `MISSING_SERIES` → biểu đồ
 * biến mất cùng với ô chọn trục → không còn chỗ nào để bấm lại, phải rời màn rồi vào lại. Chủ dự án
 * báo đúng ca này.
 *
 * Nay câu hỏi "có vẽ được không" do CHÍNH DỮ LIỆU trả lời, ở các cửa `extent === null` bên dưới:
 * chuỗi chưa nạp thì mọi điểm quét đều `null` → `yExtent` rỗng → vẫn trả `unavailable` mang đúng
 * `output.warning` như cũ; còn chuỗi đã nạp mà chỉ hụt so với N hiện tại thì phần N nhỏ hơn vẫn ra
 * số thật → hình vẫn vẽ, người dùng bấm lại điểm khác ngay tại chỗ.
 */
export function buildChartModel(args: ChartArgs): ChartModel {
  const { formula, inputs, ctx, output, level, sweepKey, span, seriesLabel } = args;
  const { spec } = formula;
  const name = shortLabel(spec.name);

  const candidates = sweepCandidates(spec, level);

  /*
   * Đường thời gian là MỘT MỤC trong cùng ô chọn trục X, không phải một loại biểu đồ riêng.
   *
   * Nhờ đặt thế, `ChartBody` và `SweepPicker` không phải sửa một dòng nào: chúng vẫn chỉ giữ một
   * chuỗi `sweepKey` rồi bắn lên. Chỗ duy nhất biết có hai lối sinh điểm là hàm này.
   */
  const historyReady = canDrawHistory(formula, ctx);
  const breakdownReady = canDrawBreakdown(spec, inputs, output);
  const options: SweepOption[] = [
    ...(breakdownReady ? [{ key: BREAKDOWN_KEY, label: BREAKDOWN_LABEL }] : []),
    ...(historyReady ? [{ key: HISTORY_KEY, label: HISTORY_LABEL }] : []),
    ...candidates.map((variable) => ({ key: variable.key, label: shortLabel(variable.label) })),
  ];

  /*
   * Bóc tách MẶC ĐỊNH hay chỉ là một mục trong ô chọn — quyết bằng `chartType`, không bằng việc
   * công thức có khai `breakdown` hay không.
   *
   * `waterfall` nghĩa là bóc tách CHÍNH LÀ biểu đồ của công thức đó. Thứ đáng xem nhất của EV
   * không phải "vốn hoá tăng thì EV tăng bao nhiêu" — đường ấy là một đường thẳng hệ số góc bằng
   * 1, đúng loại hình mà chính dự án viết luật `chartType: 'none'` để loại.
   *
   * `stackedBar` thì khác hẳn, và ba công thức vay là ví dụ: đường quét tổng lãi theo kỳ hạn là
   * một đường cong lồi, và nó chính là điều `commonMistakes` của `lich-tra-no` cảnh báo ("kéo dài
   * kỳ hạn làm khoản trả hằng tháng nhẹ đi nhưng tổng lãi tăng mạnh"). Bày bóc tách đè lên nó là
   * lấy một hình tốt thay bằng một hình tốt khác — không được lợi gì mà mất cái đang có. Nên ở
   * nhóm này bóc tách đứng sẵn trong ô chọn, người dùng bấm một lần là thấy.
   */
  const breakdownFirst = breakdownReady && spec.chartType === 'waterfall';
  if (
    breakdownReady &&
    (sweepKey === BREAKDOWN_KEY || (sweepKey === undefined && breakdownFirst))
  ) {
    return buildBreakdownModel(spec, inputs, output, name, options);
  }

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
  let axisName: Bilingual;

  if (onTime) {
    points = historyPoints(formula, inputs, ctx);
    x = {
      title: { vi: 'Ngày', en: 'Date' },
      domain: [0, Math.max(1, points.length - 1)],
      ticks: sessionTicks(ctx.bars ?? []),
    };
    activeKey = HISTORY_KEY;
    axisName = { vi: 'thời gian', en: 'time' };
  } else {
    const chosen =
      candidates.find((variable) => variable.key === sweepKey) ??
      pickSweepVariable(formula, ctx, level);

    if (chosen === null) {
      return { kind: 'unavailable', title: name, warning: NO_SWEEP_VARIABLE, options };
    }

    points = sweepPoints(formula, inputs, ctx, chosen.key, span);
    const xExtent = extentOf(points.map((point) => point.x));
    if (xExtent === null) {
      return {
        kind: 'unavailable',
        title: name,
        warning: output.warning ?? NOTHING_TO_DRAW,
        options,
        sweepKey: chosen.key,
      };
    }

    axisName = shortLabel(chosen.label);
    x = buildAxis(xExtent[0], xExtent[1], axisName, chosen.unit);
    activeKey = chosen.key;
  }

  const yExtent = extentOf(points.map((point) => point.y));
  if (yExtent === null) {
    return {
      kind: 'unavailable',
      title: name,
      warning: output.warning ?? NOTHING_TO_DRAW,
      options,
      sweepKey: activeKey,
    };
  }

  const y = buildAxis(yExtent[0], yExtent[1], name, spec.resultUnit);

  const table: ChartTable = {
    columns: [x.title, y.title],
    rows: condensePoints(points).map((point) =>
      point === null ? null : ([{ vi: point.label, en: point.label }, point.valueLabel] as const),
    ),
  };

  const missing = points.filter((point) => point.y === null).length;
  const marked = points.find((point) => point.marked === true);
  const first = points[0];
  const last = points[points.length - 1];
  const unit = onTime ? { vi: 'phiên', en: 'sessions' } : { vi: 'mức', en: 'levels' };

  /*
   * Chỉ hỏi "khởi động" trên trục thời gian.
   *
   * Trên đường quét, một dải null ở đầu KHÔNG phải khởi động — nó là quãng công thức không có nghĩa,
   * như `co-lenh-rui-ro` với 18 mức đầu. Bảo người đọc "18 mức đầu chưa đủ dữ liệu" ở đó là nói sai
   * nguyên nhân, nên phép hỏi giới hạn đúng vào chỗ khái niệm này có thật.
   */
  const warmUp = onTime ? warmUpLength(points) : 0;
  const firstReal = points[warmUp];

  const sentencesVi = [
    first === undefined || last === undefined
      ? ''
      : onTime
        ? `${name.vi}${seriesLabel === undefined ? '' : ` của ${seriesLabel}`} qua ${String(points.length)} phiên, từ ${first.label} tới ${last.label}.`
        : `Quét ${axisName.vi} từ ${first.label} tới ${last.label} qua ${String(points.length)} mức.`,
    `${name.vi} chạy trong khoảng ${formatValueWithUnit(yExtent[0], spec.resultUnit)} tới ${formatValueWithUnit(yExtent[1], spec.resultUnit)}.`,
    marked === undefined
      ? ''
      : onTime
        ? `Phiên gần nhất ${marked.label} cho ${marked.valueLabel}.`
        : `Ở giá trị hiện tại ${marked.label}, kết quả là ${marked.valueLabel}.`,
    missing === 0
      ? `Mọi ${unit.vi} đều tính được.`
      : warmUp > 0 && firstReal !== undefined
        ? `${String(warmUp)} phiên đầu chưa đủ dữ liệu để tính, nên đường bắt đầu từ ${firstReal.label}.`
        : `${String(missing)} trên ${String(points.length)} ${unit.vi} không tính được.`,
  ];

  const sentencesEn = [
    first === undefined || last === undefined
      ? ''
      : onTime
        ? `${name.en}${seriesLabel === undefined ? '' : ` for ${seriesLabel}`} over ${String(points.length)} sessions, from ${first.label} to ${last.label}.`
        : `Sweeping ${axisName.en} from ${first.label} to ${last.label} across ${String(points.length)} levels.`,
    `${name.en} ranges from ${formatValueWithUnit(yExtent[0], spec.resultUnit)} to ${formatValueWithUnit(yExtent[1], spec.resultUnit)}.`,
    marked === undefined
      ? ''
      : onTime
        ? `The most recent session ${marked.label} gives ${marked.valueLabel}.`
        : `At the current value ${marked.label}, the result is ${marked.valueLabel}.`,
    missing === 0
      ? `Every ${unit.en} produced a result.`
      : warmUp > 0 && firstReal !== undefined
        ? `The first ${String(warmUp)} sessions don't have enough data to calculate yet, so the line starts at ${firstReal.label}.`
        : `${String(missing)} of ${String(points.length)} ${unit.en} could not be calculated.`,
  ];

  const reason = points.find((point) => point.y === null && point.reason !== undefined)?.reason;

  return {
    kind: 'line',
    title: {
      vi: `${name.vi} theo ${axisName.vi}`,
      en: onTime ? `${name.en} over ${axisName.en}` : `${name.en} vs ${axisName.en}`,
    },
    summary: {
      vi: sentencesVi.filter((sentence) => sentence !== '').join(' '),
      en: sentencesEn.filter((sentence) => sentence !== '').join(' '),
    },
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
          note: {
            vi: `Đường ngắt ở ${String(missing)} ${unit.vi} không tính được${
              reason === undefined ? '' : ` — ${WARNING_LABELS[reason].vi.toLowerCase()}`
            }.`,
            en: `The line breaks at ${String(missing)} ${unit.en} that could not be calculated${
              reason === undefined ? '' : ` — ${WARNING_LABELS[reason].en.toLowerCase()}`
            }.`,
          },
        }),
  };
}
