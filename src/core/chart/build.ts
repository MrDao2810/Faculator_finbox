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

import type { CalcContext, CalcInputs, ColumnData, ColumnView, FormulaModule } from '../calc/types';
import {
  COMPACT_PREFIXES,
  NO_VALUE,
  formatNumber,
  formatValueWithUnit,
  labelInEnglish,
  unitLabel,
  withScalePrefix,
} from '../format';
import type { Bilingual, CalcOutput, Level } from '../types';
import { WARNING_LABELS, meaningless } from '../warnings';
import {
  BREAKDOWN_KEY,
  BREAKDOWN_LABEL,
  breakdownBars,
  breakdownExtent,
  canDrawBreakdown,
} from './breakdown';
import { COLUMNS_KEY, columnData, columnsOption } from './columns';
import { COMPOSITION_KEY, compositionBars, compositionOption } from './composition';
import { GAUGE_KEY, GAUGE_LABEL, buildGaugeModel, gaugeReady } from './gauge';
import {
  HISTORY_KEY,
  HISTORY_LABEL,
  canDrawHistory,
  closePriceSeries,
  historyPoints,
  sessionCandles,
  sessionTicks,
} from './history';
import { decimalsOf, extentOf, niceAxis } from './scale';
import {
  buildDistributionModel,
  buildDrawdownModel,
  seriesViewOption,
  seriesWindow,
} from './series-view';
import type { NiceAxis } from './scale';
import { usableOverlays } from './series';
import { pickSweepVariable, sweepCandidates, sweepPoints } from './sweep';
import { condensePoints } from './table';
import type { CompositionSpec, FormulaSpec, PriceOverlaySpec } from '../registry/types';
import type {
  BreakdownBar,
  ChartAxis,
  ChartModel,
  ChartPoint,
  ChartSeries,
  ChartTable,
  ChartTick,
  ColumnGroup,
  ColumnLine,
  SweepOption,
} from './types';

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
  /**
   * Ép trục giá trị CHỨA mốc 0. Bật khi màn đang vẽ CỘT thay vì đường.
   *
   * Không phải một tuỳ chọn thẩm mỹ, mà là điều kiện để hình cột không nói dối. Cột đứng trên đáy
   * vùng vẽ, nên chiều cao của nó chỉ đọc được thành "lớn gấp mấy lần" khi đáy ấy LÀ số 0. Trục
   * chạy từ 11 tới 33 triệu vẽ thành cột thì cột 33 cao gấp… vô cùng lần cột 11, vì cột 11 cao 0 —
   * mắt đọc ra một chênh lệch không có thật. Đường thì không mắc lỗi ấy: nó nói về ĐỘ DỐC, thứ
   * không cần gốc toạ độ.
   *
   * Đây đúng là bất biến mà biểu đồ thác nước đã giữ từ trước ("trục giá trị phải chứa 0, vì cột
   * cần chỗ để đứng"). Vẽ cột trên một trục không chứa 0 là mở lại đúng cái lỗ ấy ở chỗ khác.
   *
   * Chỉ nới MIỀN, không đụng dữ liệu: `niceAxis()` vẫn tự chia vạch trên miền đã nới, nên nhãn vạch
   * và đường vẽ vẫn do một nguồn sinh ra.
   */
  zeroBaseline?: boolean;
  /**
   * Nới trục giá trị ôm GIÁ CAO NHẤT và THẤP NHẤT của mọi phiên. Bật khi màn đang vẽ NẾN.
   *
   * Cùng lẽ với `zeroBaseline`: bấc nến vẽ tới giá cao và giá thấp của phiên, mà miền dựng theo
   * đường kết quả (và đường giá đóng cửa) thì hẹp hơn — bấc chạy ra ngoài vùng vẽ. Nới ở đây, lúc
   * dựng mô hình, để nhãn vạch và hình do một nguồn sinh ra. Chỉ có tác dụng khi mô hình thật sự
   * mang `candles`; xin ở một hình không có nến là vô hại.
   */
  candleRange?: boolean;
  /**
   * Chuỗi PHỤ do NƠI GỌI truyền vào — mối nối còn để ngỏ, hiện chưa ai dùng.
   *
   * Đọc kỹ trước khi nối một công thức mới vào đây, vì có HAI lối và lối này không phải lối mặc
   * định. Đợt mở đường cho nhiều chuỗi đoán rằng chuỗi phụ nào cũng phải nhận từ nơi gọi (lý lẽ:
   * nó phải TÍNH từ `ctx`, khác hằng số tĩnh như `referenceLines`). Đợt nối SMA cho thấy lý lẽ ấy
   * chỉ đúng một nửa, và chọn ngược lại:
   *
   *   - **Khai trong Registry, tính trong Domain** — `spec.priceOverlay` cho đường giá đóng cửa
   *     (`closePriceSeries()` bên dưới). Lối này đúng khi chuỗi phụ suy được từ mỗi `ctx`; nó giữ
   *     phép tính ở Domain và giữ khai báo cạnh chính công thức, đúng nếp `referenceLines`.
   *   - **Truyền từ nơi gọi** — chính trường này. Chỉ dùng khi chuỗi phụ cần thứ mà `buildChartModel()`
   *     không có: kết quả của một công thức KHÁC chẳng hạn. Nhớ rằng nơi gọi là `ChartBody`, tức
   *     tầng GIAO DIỆN — nhét phép tính tài chính vào đó là phá đúng lời hứa ở đầu `chart/types.ts`.
   *     Ba dải Bollinger và đường Signal của MACD nhiều khả năng vẫn nên đi lối thứ nhất, mở rộng
   *     khai báo thay vì tính ở `ChartBody`.
   *
   * Chuỗi lệch lưới x, trùng khoá, hoặc lấy khoá của chuỗi chính đều bị LOẠI — xem `usableOverlays()`.
   */
  overlays?: ReadonlyArray<ChartSeries>;
}

/**
 * Phần trước dấu gạch dài của một nhãn, áp cho cả hai vế độc lập.
 *
 * 'EPS — lợi nhuận trên mỗi cổ phiếu' thành 'EPS'. Tên đầy đủ hợp cho bảng biến và tiêu đề màn,
 * nhưng nhãn trục ở khổ 360px thì phải gọn. Chỉ cắt ở gạch dài có khoảng trắng hai bên nên không
 * chạm tới dấu nối trong từ. Từ 19/10/2026 tên tiếng Anh giữ ký hiệu đúng như tên tiếng Việt
 * ('P/E — price to earnings ratio'), nên hai vế cắt ra cùng một ký hiệu và tiêu đề biểu đồ hai ngôn
 * ngữ khớp nhau ('P/E theo …' / 'P/E vs …'). Tên không có gạch dài thì vế ấy giữ nguyên cả câu.
 */
function shortLabel(text: Bilingual): Bilingual {
  const [headVi] = text.vi.split(/\s[—–]\s/);
  const [headEn] = text.en.split(/\s[—–]\s/);
  return { vi: (headVi ?? text.vi).trim(), en: (headEn ?? text.en).trim() };
}

/*
 * ── TÊN của biểu đồ — một nguồn cho cả màn tính lẫn bài hướng dẫn ───────────────────────────────
 *
 * Bốn thứ dưới đây tách khỏi thân `buildChartModel()` ngày 13/10/2026 mà KHÔNG đổi một ký tự nào của
 * tiêu đề: mục "Đọc biểu đồ" của bài hướng dẫn phải gọi biểu đồ bằng ĐÚNG cái tên màn tính đang in
 * dưới hình (chủ dự án: "biểu đồ tên là gì thì ghi vào đó"). Bài dựng lúc build, chưa có chuỗi giá
 * nào để gọi cả `buildChartModel()` cho nhánh thời gian — nên nó gọi thẳng các hàm này, và hai nơi
 * không thể viết hai kiểu tên. `src/core/huong-dan/bieu-do/` là nơi dùng thứ hai.
 */

/** Tên GỌN của công thức — nửa đầu của mọi tiêu đề biểu đồ ('P/E', không phải 'P/E — hệ số giá…'). */
export function chartName(spec: FormulaSpec): Bilingual {
  return shortLabel(spec.name);
}

/** Tên GỌN của một ô nhập khi nó nằm trên trục X — cũng là chữ trong ô chọn "Xem kết quả đổi theo". */
export function axisLabel(label: Bilingual): Bilingual {
  return shortLabel(label);
}

/** Tên trục X của đường theo thời gian, viết thường vì nó đứng sau chữ "theo". */
export const TIME_AXIS_NAME: Bilingual = { vi: 'thời gian', en: 'time' };

/** Tiêu đề của biểu đồ ĐƯỜNG: 'P/E theo Giá thị trường', 'P/E theo thời gian'. */
export function lineChartTitle(name: Bilingual, axisName: Bilingual, onTime: boolean): Bilingual {
  return {
    vi: `${name.vi} theo ${axisName.vi}`,
    en: onTime ? `${name.en} over ${axisName.en}` : `${name.en} vs ${axisName.en}`,
  };
}

/** Tiêu đề của biểu đồ BÓC TÁCH: 'EV — bóc tách'. */
export function breakdownTitle(name: Bilingual): Bilingual {
  return { vi: `${name.vi} — bóc tách`, en: `${name.en} — breakdown` };
}

/**
 * Bề ngang tối đa của một nhãn vạch, tính bằng KÝ TỰ — hai con số vì hai trục có hai chỗ đứng khác
 * hẳn nhau, và gộp chúng làm một là hoặc để trục Y tràn, hoặc chia bậc trục X khi không cần.
 *
 *   - **Trục Y** đứng trong lề trái rộng 31 đơn vị viewBox (`PAD.left = 36` trừ 5 đơn vị hở), chữ
 *     `font-size: 10px` → vừa đúng ~6 ký tự. Đây là chỗ CHẬT NHẤT của cả hình, và cũng là chỗ hỏng
 *     đã báo: `1.000.000` (9 ký tự) tràn qua mép trái `x = 0` rồi bị `<svg>` cắt cụt IM LẶNG.
 *   - **Trục X** nằm ngang dưới đáy và đã thưa còn ĐÚNG HAI nhãn (`thin(x.ticks, 2)`), nên mỗi nhãn
 *     có nửa bề ngang vùng vẽ — chừng 134 đơn vị, tức ~23 ký tự. Ngân sách 10 giữ nhãn dưới ~57 đơn
 *     vị, còn thừa chỗ ở giữa, mà vẫn cắt được `100.000.000.000 ₫` của `lai-kep`.
 *
 * Đổi `PAD.left`, cỡ chữ `.tick`, hay số nhãn giữ lại ở `thin()` thì phải xem lại hai con số này.
 *
 * NGÂN SÁCH ƯU TIÊN, không phải trần cứng — khác với bản đầu. Ở đầu NHỎ của thang, mọi bậc hiển
 * thị đều làm nhãn co về `'0'` (xem `pickScale()`), nên một trần cứng ở đây có nghĩa là chọn nhãn
 * ngắn mà sai. Nay nhãn phải phân biệt được trước đã; không bậc nào vừa cả hai thì nhãn được phép
 * dài hơn, và `plotOf()` bên `ui/charts/LineChart.tsx` nới lề trái theo bề ngang nhãn thật.
 */
const MAX_TICK_CHARS_Y = 6;
const MAX_TICK_CHARS_X = 10;

/**
 * ── Tiền và số lượng từ 1.000 trở lên LUÔN viết bằng chữ trên hình (15/10/2026) ───────────────────
 *
 * Chủ dự án chụp vạch dò của `gia-hoa-von` theo Giá mua: _"60.277,25 ₫ · 60,5 nghìn ₫"_ — _"bên trái
 * là số mà bên phải lại là chữ ? đồng bộ hết về chữ cho tôi"_, rồi _"kiểm tra lại toàn bộ biểu đồ"_.
 * Mỗi trục tự chọn bậc theo ngân sách ký tự của CHÍNH nó (trục Y 6, trục X 10), nên `120.000` vừa
 * trục X mà tràn trục Y: một trục ra `(₫)`, trục kia ra `(nghìn ₫)`.
 *
 * Lượt đầu chỉ đổi khi trên hình ĐÃ có chữ (74 hình ở 19 công thức lệch kiểu ấy), nên hình toàn số
 * vẫn giữ số. Chủ dự án chuyển sang trục khác của biểu đồ và thấy ngay: _"vẫn chưa chuyển thành nghìn
 * hoặc tỷ hoặc triệu"_ — đo lại, 141 hình ở 33 công thức còn in `46.000 ₫`, `4.000.000 ₫`, `72.750 ₫`.
 * Nên luật nay không hỏi hình có chữ chưa: trục tiền hay số lượng nào có số từ 1.000 trở lên thì đi
 * thẳng sang bậc chữ (`pickScale()`), ở mọi trục, mọi hình, mọi dạng. Nó đảo luật cũ "không bao giờ
 * đổi `1.200 ₫` thành `1,2 nghìn ₫`" — với tiền và số lượng; đơn vị khác vẫn theo luật cũ.
 *
 * Chỉ tiền và số lượng, vì chỉ ở đó "nghìn" là cách người ta viết thật. `'điểm'` cố ý KHÔNG có mặt:
 * chỉ số VN30 viết `1.024 điểm`, và ở bậc nghìn `1.024` với `1.030,4` cùng thành `1,0x nghìn điểm` —
 * mất đúng khoảng chênh mà lãi/lỗ vị thế phái sinh tính trên đó. `%` và `lần` có lúc vượt 1.000
 * (`2.129,58 %` quy năm của một kỳ ngắn) nhưng `nghìn %` không phải một đơn vị.
 */
const DON_VI_DOI_CHU: ReadonlySet<string> = new Set([
  '₫',
  'tỷ ₫',
  '₫/CP',
  '₫/tháng',
  '₫/điểm',
  '₫/CP/tháng',
  'CP',
  'triệu CP',
  'sản phẩm',
  'HĐ',
]);

/** Bậc hiển thị đã chọn cho một trục, kèm đơn vị đã ghép tiền tố. */
interface AxisScale {
  factor: number;
  /** Đơn vị hiện ở tiêu đề trục, ví dụ `'nghìn tỷ ₫'`. */
  unit: Bilingual;
}

/**
 * Bậc hiển thị của một trục — chọn theo ĐỘ DÀI NHÃN, không theo một mốc thập phân cố định.
 *
 * Đây là chỗ đáng đọc kỹ nhất của cả phép rút gọn, vì cách chọn quyết định luật có cần ngoại lệ hay
 * không. Bản trước hỏi "đơn vị có phải `'₫'` không, và có vượt một tỷ không" — hai câu hỏi sai đích:
 * nó bỏ sót `'₫/tháng'`, `'CP'`, `'sản phẩm'`, `'tỷ ₫'` (bốn công thức, vốn hoá FPT là 136.160 ở
 * thang ấy), đồng thời vẫn nổ ở những chỗ nhãn vốn đã vừa.
 *
 * Luật ở đây hỏi thẳng ràng buộc thật — **nhãn có vừa lề trái không** — rồi mới hỏi bậc nào đọc
 * xuôi nhất trong số những bậc vừa. Hai bước, theo đúng thứ tự đó:
 *
 *   0. **Tiền và số lượng từ 1.000 trở lên đi thẳng sang bậc chữ** (15/10/2026, xem
 *      `DON_VI_DOI_CHU`): bậc chữ LỚN NHẤT mà giá trị lớn nhất còn ≥ 1, ưu tiên bậc vừa ngân sách.
 *      Không bậc chữ nào đọc xuôi (miền dưới 1.000, hay `'triệu CP'` không ghép thêm được bậc nào)
 *      thì xuống bước 1.
 *   1. **Bậc 1 vừa ngân sách thì dừng luôn**, không chia gì. Đây là bước giữ cho luật im lặng ở
 *      `'%'`, `'lần'`, `'điểm'` mà không cần một ngoại lệ nào viết ra. Trước bước 0 nó còn giữ `ev`
 *      ở `12.000 tỷ ₫` và `1.200 ₫` không thành `1,2 nghìn ₫`; nay hai chỗ ấy thuộc bước 0.
 *   2. Phải chia rồi thì lấy bậc **LỚN NHẤT** vẫn vừa ngân sách mà giá trị lớn nhất còn ≥ 1. Không
 *      lấy bậc nhỏ nhất vừa đủ: `lai-kep` chạy tới 35 triệu ₫, bậc nghìn đã vừa 6 ký tự nên bậc nhỏ
 *      nhất dừng ở đó và cho ra `'22.196 nghìn ₫'` — đúng số, nhưng không ai viết tiền kiểu ấy. Điều
 *      kiện `≥ 1` là thứ chặn chiều ngược lại, kẻo cả trục thành `0,03` ở bậc tỷ.
 *
 * Số chữ số thập phân suy từ BƯỚC chia đã đổi bậc, nên nhãn không mọc đuôi lẻ: bước 20.000 chia cho
 * 1.000 ra 20, vẫn không có số lẻ nào.
 *
 * Không bậc nào đạt (miền trải quá rộng để ngân sách ôm hết) thì lấy bậc lớn nhất — vẫn là bản ngắn
 * nhất có thể, và tuyệt đối không trả `undefined` để nơi gọi phải đoán.
 */
function pickScale(
  nice: NiceAxis,
  unit: string,
  maxChars: number,
): AxisScale & { ticks: ChartTick[] } {
  const maxAbs = Math.max(Math.abs(nice.domain[0]), Math.abs(nice.domain[1]));

  /*
   * Bậc nào ghép ra một đơn vị KHÔNG CÓ THẬT thì loại thẳng khỏi danh sách, không phải sửa nhãn sau.
   * `resultUnit` của bốn công thức là `'tỷ ₫'` và biến `shares` là `'triệu CP'`, nên ghép mù cho ra
   * `'tỷ tỷ ₫'` — xem `withScalePrefix()`.
   *
   * Dựng thẳng ra `ChartTick` chứ không trả riêng một mảng chuỗi để nơi gọi ghép lại theo chỉ số:
   * ghép theo chỉ số thì `noUncheckedIndexedAccess` bắt phải có một nhánh dự phòng, mà nhánh ấy vừa
   * không bao giờ chạy vừa định dạng số theo một kiểu khác — đúng loại chữ chết chỉ chờ ngày sai.
   */
  const candidates = COMPACT_PREFIXES.flatMap(({ factor, prefix }) => {
    const scaledUnit = withScalePrefix(unit, prefix);
    if (scaledUnit === null) return [];

    const decimals = decimalsOf(nice.step / factor);
    return [
      {
        factor,
        unit: scaledUnit,
        ticks: nice.ticks.map((value) => ({
          value,
          label: formatNumber(value / factor, { maxDecimals: decimals }),
        })),
      },
    ];
  });

  /*
   * Điều kiện ĐỨNG TRƯỚC ngân sách độ dài: nhãn phải PHÂN BIỆT được nhau.
   *
   * `niceAxis()` đã bảo đảm các vạch khác nhau về giá trị, nên hai vạch in ra cùng một chuỗi chỉ có
   * một nghĩa: bậc này làm mất thông tin. Thiếu câu hỏi ấy, luật chọn theo độ dài tự lật ngược ở
   * đầu nhỏ của thang — `COMPACT_PREFIXES` chỉ có bậc PHÓNG TO (1 / nghìn / triệu / tỷ), nên đem
   * chia một giá trị vốn đã siêu nhỏ thì mọi nhãn co về `'0'`, dài đúng 1 ký tự, tức LUÔN "vừa"
   * ngân sách và luôn thắng. Đó là chỗ hỏng đã báo: `EV/EBITDA` với EV = 0,002 tỷ ₫ ra trục
   * `'(nghìn lần)'` — một đơn vị không có thật — với ba nhãn `'0'` giống hệt nhau.
   */
  const phanBiet = candidates.filter(
    (item) => new Set(item.ticks.map((tick) => tick.label)).size === item.ticks.length,
  );

  const vua = phanBiet.filter((item) => item.ticks.every((tick) => tick.label.length <= maxChars));

  // Bước 0: tiền và số lượng từ 1.000 trở lên viết bằng chữ — xem `DON_VI_DOI_CHU`.
  if (DON_VI_DOI_CHU.has(unit)) {
    const bangChu = phanBiet.filter((item) => item.factor > 1 && maxAbs / item.factor >= 1);
    const trongNganSach = bangChu.filter((item) => vua.includes(item));
    const chon = trongNganSach[trongNganSach.length - 1] ?? bangChu[bangChu.length - 1];
    if (chon !== undefined) return chon;
  }

  // Bậc 1 luôn đứng đầu `COMPACT_PREFIXES`; nó vừa thì không có lý do gì phải chia.
  const khongChia = vua[0];
  if (khongChia?.factor === 1) return khongChia;

  const docXuoi = vua.filter((item) => maxAbs / item.factor >= 1);

  /*
   * Không bậc nào vừa ngân sách thì thà NHÃN DÀI còn hơn nhãn sai: lấy bậc phân biệt được có nhãn
   * ngắn nhất. Ngân sách 6 ký tự vốn là ước lượng bi quan (4,9 đơn vị/ký tự, trong khi chữ số thật
   * đo được ~2,9), nên một nhãn 8–9 ký tự vẫn nằm trong lề trái 31 đơn vị — đổi lại là trục nói
   * đúng con số thay vì một cột `'0'`.
   */
  const ngonNhat = [...phanBiet].sort(
    (a, b) =>
      Math.max(...a.ticks.map((t) => t.label.length)) -
      Math.max(...b.ticks.map((t) => t.label.length)),
  )[0];

  return (
    docXuoi[docXuoi.length - 1] ??
    vua[0] ??
    ngonNhat ??
    candidates[candidates.length - 1] ?? {
      factor: 1,
      unit: { vi: unit, en: unit },
      ticks: [],
    }
  );
}

/**
 * Số chữ số thập phân của một giá trị viết ở bậc trục — giữ khoảng BA CHỮ SỐ CÓ NGHĨA.
 *
 * KHÔNG lấy theo bước chia như nhãn vạch: bước của một trục chạy tới hai tỷ là 500 triệu, tức 0 chữ
 * số lẻ ở bậc tỷ, và `1.789.700.000 ₫` sẽ thành `2 tỷ ₫` — sai lệch 12% ngay trên con số người dùng
 * đang đọc. Ở đây `1,79 tỷ ₫`.
 *
 * Nhánh dưới 1 có từ 16/09/2026, khi nhãn trên hình thôi so độ dài và luôn nói theo bậc trục (xem
 * `labelAtAxisScale()`): một điểm nhỏ hơn đơn vị trục — 578.636 ₫ trên trục `(triệu ₫)` — mà vẫn
 * chốt 2 chữ số lẻ thì ra `0,58 triệu ₫`, tức mất một chữ số có nghĩa đúng ở chỗ còn ít nhất. Trần
 * `MAX_SCALED_DECIMALS` chặn chiều ngược lại: giá trị nhỏ hơn bậc trục cả triệu lần không được kéo
 * nhãn dài vô hạn — chỗ ấy `labelAtAxisScale()` giữ bản đầy đủ.
 */
const MAX_SCALED_DECIMALS = 6;

function scaledDecimals(magnitude: number): number {
  if (magnitude >= 100) return 0;
  if (magnitude >= 10) return 1;
  if (magnitude >= 1 || magnitude === 0) return 2;
  return Math.min(MAX_SCALED_DECIMALS, 2 - Math.floor(Math.log10(magnitude)));
}

/** Một giá trị đơn lẻ viết ở bậc của trục nó nằm trên — dùng cho chữ VẼ TRÊN HÌNH. */
function scaledValueLabel(value: number, scale: AxisScale): string {
  const scaled = value / scale.factor;
  return formatValueWithUnit(scaled, scale.unit.vi, {
    maxDecimals: scaledDecimals(Math.abs(scaled)),
  });
}

/**
 * Nhãn của một giá trị ở bậc trục — hoặc `undefined` khi trục KHÔNG chia bậc.
 *
 * ── Vì sao thôi so độ dài chuỗi (16/09/2026) ─────────────────────────────────────────────────
 *
 * Bản trước hỏi "bản rút gọn có NGẮN HƠN bản đầy đủ không", từng điểm một. Câu hỏi ấy sai đích và
 * chủ dự án báo đúng hệ quả: trên một biểu đồ `(triệu ₫)`, dấu "giá trị hiện tại" ghi `2,27 triệu ₫`
 * còn vạch dò ghi `578.636,11 ₫` — hai đơn vị khác nhau trên cùng một hình, vì `0,58 triệu ₫` dài
 * đúng bằng bản đầy đủ nên luật cũ bỏ nó. Người đọc phải tự quy đổi giữa hai thang để so hai con số
 * nằm cách nhau vài xăng-ti-mét, mà trục thì chỉ ghi một thang.
 *
 * Bậc hiển thị là thuộc tính của TRỤC, nên câu hỏi đúng cũng phải hỏi một lần cho cả trục: trục có
 * chia bậc thì mọi chữ vẽ trên hình nói theo bậc ấy, không thì không chữ nào nói. Độ dài thôi là
 * tiêu chí — nhãn nổi đã có `floatingLabel()` lo chỗ đứng, còn nhãn cột thác nước vốn đã ngắn đi.
 *
 * Ngoại lệ duy nhất là FR-06: giá trị KHÁC 0 mà làm tròn ở bậc trục ra `0` thì giữ bản đầy đủ. Một
 * `0 triệu ₫` cạnh một điểm có thật là con số sai đội lốt con số đúng — đúng thứ FR-06 tồn tại để
 * chặn. Chỗ này chỉ chạm tới điểm nhỏ hơn bậc trục hơn một triệu lần, tức điểm nằm sát mép 0 của
 * hình.
 *
 * Trả `undefined` chứ không trả lại chính chuỗi cũ, vì nơi gọi bỏ hẳn trường khi không dùng: bất biến
 * "công thức một chuỗi dựng ra ĐÚNG mô hình như trước" kiểm bằng `toEqual`, mà một trường thừa mang
 * giá trị trùng cũng đủ làm nó đỏ.
 */
function labelAtAxisScale(value: number, scale: AxisScale): string | undefined {
  if (scale.factor === 1 || !Number.isFinite(value)) return undefined;

  const magnitude = Math.abs(value / scale.factor);
  if (value !== 0 && magnitude < 0.5 * 10 ** -scaledDecimals(magnitude)) return undefined;

  return scaledValueLabel(value, scale);
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
  const rawBars = breakdownBars(spec, inputs, output);
  const extent = breakdownExtent(rawBars);

  if (rawBars.length === 0 || extent === null) {
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
  const {
    axis: y,
    scale,
    tableTitle,
  } = buildAxis(extent[0], extent[1], spec.breakdownTotal ?? name, spec.resultUnit);

  /*
   * Nhãn giá trị VẼ TRÊN CỘT nói cùng thang với trục ngay dưới nó.
   *
   * Trước đợt này hai chỗ nói hai kiểu: trục `lich-tra-no` ghi '(tỷ ₫)' còn nhãn cột ghi
   * `1.789.700.000 ₫` — vừa dài quá bề ngang cột, vừa bắt người đọc tự quy đổi giữa hai thang trên
   * cùng một hình. Bảng số dưới `<details>` KHÔNG đi qua đây: nó vẫn đọc `valueLabel` đầy đủ, vì đó
   * là chỗ tra con số chính xác.
   */
  const bars = rawBars.map((bar) => {
    const short = labelAtAxisScale(bar.delta, scale);
    return short === undefined ? bar : { ...bar, shortValueLabel: short };
  });
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
  /*
   * Bản tiếng Anh chia số ít/số nhiều ("1 part subtracts") và đổi đơn vị của tổng sang tiếng Anh —
   * đo 15/10/2026 trên `fcfe` ở EN, câu đọc "2 parts add, 1 parts subtract … total 282 tỷ ₫".
   */
  const parts = (n: number, verb: string): string =>
    n === 1 ? `1 part ${verb}s` : `${String(n)} parts ${verb}`;
  const sentencesEn = [
    `${name.en} breaks down into ${String(stages.length)} parts: ${stageListEn}.`,
    cong > 0 && tru > 0
      ? `${parts(cong, 'add')}, ${parts(tru, 'subtract')}.`
      : `Every part ${cong > 0 ? 'adds in' : 'subtracts out'}.`,
    total === undefined ? '' : `Together they total ${labelInEnglish(total.valueLabel)}.`,
  ];

  return {
    kind: 'waterfall',
    title: breakdownTitle(name),
    summary: {
      vi: sentencesVi.filter((sentence) => sentence !== '').join(' '),
      en: sentencesEn.filter((sentence) => sentence !== '').join(' '),
    },
    y,
    bars,
    table: {
      // Tên cột theo đơn vị GỐC, khớp ô in số đầy đủ — xem `withUnit()`.
      columns: [{ vi: 'Thành phần', en: 'Component' }, tableTitle],
      rows: bars.map((bar) => [bar.label, bar.valueLabel] as const),
    },
    options,
    sweepKey: BREAKDOWN_KEY,
  };
}

/**
 * Mô hình của hình CƠ CẤU (vành khuyên) — cùng kiểu thác nước để dạng "Thanh ngang" và bảng số dùng
 * lại nguyên, nhưng mang `sweepKey = COMPOSITION_KEY`, nhờ đó `dangVeCuaHinh()` biết mở bằng vành
 * khuyên. Các phần đã tra và kiểm ở `compositionBars()`: không âm, tổng dương.
 *
 * Trục giá trị chạy từ 0 tới tổng (mọi phần cộng vào), mang tên của TỔNG, không tên công thức: trục
 * của D/E đo nguồn vốn bằng tỷ ₫, gắn chữ 'D/E' vào đó là đặt tên một tỷ số cho một số tiền.
 */
function buildCompositionModel(
  view: CompositionSpec,
  rawBars: ReadonlyArray<BreakdownBar>,
  options: ReadonlyArray<SweepOption>,
): ChartModel {
  const total = rawBars[rawBars.length - 1];
  const {
    axis: y,
    scale,
    tableTitle,
  } = buildAxis(0, total?.cumulative ?? 1, view.total, view.unit);

  /* Nhãn vẽ trên hình nói cùng thang với trục, như thác nước; bảng số vẫn in số đầy đủ. */
  const bars = rawBars.map((bar) => {
    const short = labelAtAxisScale(bar.delta, scale);
    return short === undefined ? bar : { ...bar, shortValueLabel: short };
  });
  const parts = bars.filter((bar) => bar.isTotal !== true);

  const listVi = parts.map((bar) => `${bar.label.vi} ${bar.valueLabel}`).join(', ');
  const listEn = parts.map((bar) => `${bar.label.en} ${labelInEnglish(bar.valueLabel)}`).join(', ');
  const totalVi = total === undefined ? '' : ` ${total.valueLabel}`;
  const totalEn = total === undefined ? '' : ` ${labelInEnglish(total.valueLabel)}`;

  return {
    kind: 'waterfall',
    title: view.title,
    summary: {
      vi: `${view.total.vi}${totalVi} gồm ${String(parts.length)} phần: ${listVi}.`,
      en: `${view.total.en}${totalEn} is made of ${String(parts.length)} parts: ${listEn}.`,
    },
    y,
    bars,
    table: {
      columns: [{ vi: 'Thành phần', en: 'Component' }, tableTitle],
      rows: bars.map((bar) => [bar.label, bar.valueLabel] as const),
    },
    options,
    sweepKey: COMPOSITION_KEY,
  };
}

/** Tên cột tổng của bảng số khi các chuỗi chồng lên nhau. */
const TONG_COT: Bilingual = { vi: 'Cộng', en: 'Total' };

/**
 * Mô hình của hình CỘT THEO KỲ (23/10/2026) — dựng từ số đã kiểm ở `columnData()`.
 *
 * Trục giá trị chứa 0 (cột cần chỗ đứng) và ôm cả đỉnh cột chồng lẫn mọi vạch ngang. Nhãn vẽ trên
 * hình nói cùng bậc với trục, bảng số in số đầy đủ — cùng luật thác nước.
 */
function buildColumnsModel(
  view: ColumnView,
  data: ColumnData,
  options: ReadonlyArray<SweepOption>,
): ChartModel {
  const chong = view.series.length >= 2;
  const tongNhom = (values: ReadonlyArray<number>): number =>
    values.reduce((sum, value) => sum + value, 0);
  const muc = data.groups.flatMap((group) =>
    chong ? [tongNhom(group.values)] : [...group.values],
  );
  const vach = data.lines ?? [];
  const ys = [0, ...muc, ...vach.map((line) => line.value)];
  const { axis: y, scale } = buildAxis(Math.min(...ys), Math.max(...ys), view.value, view.unit);

  const viet = (value: number): string => formatValueWithUnit(value, view.unit);
  const vietPhu = (value: number, index: number): string =>
    formatValueWithUnit(value, view.extraColumns?.[index]?.unit ?? '');
  /*
   * Bậc chữ của từng cột phụ, chọn theo số lớn nhất của chính cột ấy — cùng `pickScale()` với trục —
   * để ô dò viết '10 triệu ₫' cạnh '50 nghìn ₫' chứ không '10.000.000 ₫' (luật chữ của hình, 15/10/2026).
   */
  const bacPhu = (view.extraColumns ?? []).map((column, index) => {
    const lon = Math.max(0, ...data.groups.map((group) => Math.abs(group.extras?.[index] ?? 0)));
    return buildAxis(0, lon > 0 ? lon : 1, column.label, column.unit).scale;
  });
  const vietPhuNgan = (value: number, index: number): string => {
    const bac = bacPhu[index];
    return (bac === undefined ? undefined : labelAtAxisScale(value, bac)) ?? vietPhu(value, index);
  };

  const groups: ColumnGroup[] = data.groups.map((group) => {
    const ngan = group.values.map((value) => labelAtAxisScale(value, scale));
    const tong = tongNhom(group.values);
    const tongNgan = labelAtAxisScale(tong, scale);
    return {
      label: group.label,
      tick: group.tick,
      values: group.values,
      valueLabels: group.values.map(viet),
      /* Trục chia bậc thì mọi số đều có bản ngắn, không chia thì không số nào có — xem `ChartPoint`. */
      ...(ngan.every((label) => label !== undefined) ? { shortValueLabels: ngan } : {}),
      ...(chong
        ? {
            totalLabel: viet(tong),
            ...(tongNgan === undefined ? {} : { shortTotalLabel: tongNgan }),
          }
        : {}),
      ...(group.extras === undefined
        ? {}
        : {
            extraLabels: group.extras.map(vietPhu),
            shortExtraLabels: group.extras.map(vietPhuNgan),
          }),
    };
  });

  const lines: ColumnLine[] = vach.map((line) => {
    const ngan = labelAtAxisScale(line.value, scale);
    return {
      value: line.value,
      label: line.label,
      valueLabel: viet(line.value),
      ...(ngan === undefined ? {} : { shortValueLabel: ngan }),
      ...(line.dash === true ? { dash: true } : {}),
    };
  });

  /* Một nhóm kể bằng chữ: các chuỗi và (nếu chồng) tổng của cả cột. */
  const keNhom = (group: ColumnGroup, lang: 'vi' | 'en'): string => {
    const doc = (text: string): string => (lang === 'vi' ? text : labelInEnglish(text));
    const phan = view.series
      .map((series, index) => `${series.label[lang]} ${doc(group.valueLabels[index] ?? '')}`)
      .join(', ');
    const tong =
      group.totalLabel === undefined
        ? ''
        : `, ${lang === 'vi' ? 'cộng' : 'total'} ${doc(group.totalLabel)}`;
    return `${group.label[lang]}: ${phan}${tong}.`;
  };
  const dau = groups[0];
  const cuoi = groups[groups.length - 1];
  const keVach = (lang: 'vi' | 'en'): string =>
    lines
      .map(
        (line) =>
          `${line.label[lang]} ${lang === 'vi' ? line.valueLabel : labelInEnglish(line.valueLabel)}.`,
      )
      .join(' ');
  const cau = (lang: 'vi' | 'en'): string =>
    [
      `${view.title[lang]}, ${String(groups.length)} ${view.category[lang].toLowerCase()}.`,
      dau === undefined ? '' : keNhom(dau, lang),
      cuoi === undefined || cuoi === dau ? '' : keNhom(cuoi, lang),
      keVach(lang),
    ]
      .filter((sentence) => sentence !== '')
      .join(' ');

  const donVi = unitLabel(view.unit);
  return {
    kind: 'columns',
    title: view.title,
    summary: { vi: cau('vi'), en: cau('en') },
    xTitle: view.category,
    y,
    series: view.series,
    groups,
    stacked: chong,
    ...(lines.length === 0 ? {} : { lines }),
    ...(view.extraColumns === undefined
      ? {}
      : { extraColumns: view.extraColumns.map((column) => column.label) }),
    table: {
      columns: [
        view.category,
        ...view.series.map((series) => withUnit(series.label, donVi)),
        ...(chong ? [withUnit(TONG_COT, donVi)] : []),
        ...(view.extraColumns ?? []).map((column) =>
          withUnit(column.label, unitLabel(column.unit)),
        ),
      ],
      rows: groups.map(
        (group) =>
          [
            group.label,
            ...group.valueLabels,
            ...(group.totalLabel === undefined ? [] : [group.totalLabel]),
            ...(group.extraLabels ?? []),
          ] as const,
      ),
    },
    options,
    sweepKey: COLUMNS_KEY,
  };
}

/**
 * Trục đã chia vạch, KÈM bậc hiển thị đã chọn.
 *
 * Trả cả hai trong một hàm vì bậc còn dùng ở chỗ thứ hai: nhãn giá trị vẽ trên hình phải nói cùng
 * một thang với trục nó đứng cạnh. Tính lại bậc ở nơi thứ hai là dựng lên hai nguồn sự thật cho cùng
 * một câu hỏi, và chúng sẽ lệch nhau vào ngày ai đó đổi `MAX_TICK_CHARS`.
 */
function buildAxis(
  lo: number,
  hi: number,
  name: Bilingual,
  unit: string,
  maxChars = MAX_TICK_CHARS_Y,
): { axis: ChartAxis; scale: AxisScale; tableTitle: Bilingual } {
  const nice = niceAxis(lo, hi);
  const scale = pickScale(nice, unit, maxChars);

  return {
    axis: {
      title: withUnit(name, scale.unit),
      domain: nice.domain,
      ticks: scale.ticks,
    },
    scale: { factor: scale.factor, unit: scale.unit },
    tableTitle: withUnit(name, unitLabel(unit)),
  };
}

/**
 * Tên kèm đơn vị trong ngoặc — `'Vốn hoá thị trường (tỷ ₫)'`; đơn vị rỗng thì chỉ tên.
 *
 * Dùng cho HAI chỗ khác thang (23/10/2026): tiêu đề trục mang đơn vị ĐÃ ĐỔI BẬC (`'nghìn tỷ ₫'`, vì
 * vạch trục viết 7,5 · 8), còn tên cột của bảng số mang đơn vị GỐC (`'tỷ ₫'`), vì ô của bảng in số
 * đầy đủ `7.826,94 tỷ ₫`. Chủ dự án chụp bảng số của `von-hoa-thi-truong`, cột ghi "(nghìn tỷ ₫)" mà
 * ô ghi "tỷ ₫": _"note một đằng nhưng số liệu hiện một nẻo"_ — bảng từng mượn nguyên `axis.title`.
 */
function withUnit(name: Bilingual, unit: Bilingual): Bilingual {
  return {
    vi: unit.vi === '' ? name.vi : `${name.vi} (${unit.vi})`,
    en: unit.en === '' ? name.en : `${name.en} (${unit.en})`,
  };
}

/**
 * Nhãn legend của chuỗi CHÍNH khi có đường giá vẽ kèm — 'SMA 20 phiên', theo đúng số phiên đang
 * nhập nên đổi slider là legend đổi theo, và người đọc biết ngay đường đậm là SMA của chu kỳ nào.
 *
 * Ô số phiên đang trống (khoá không có trong `inputs`) hoặc mang giá trị chưa hợp lệ thì rơi về
 * tên ngắn trần — không bao giờ ghép 'NaN phiên' vào một nhãn (FR-06 áp cho cả chữ, không riêng số).
 */
function overlayPrimaryLabel(declared: PriceOverlaySpec, inputs: CalcInputs): Bilingual {
  const raw = declared.periodKey === undefined ? undefined : inputs[declared.periodKey];
  if (raw === undefined || !Number.isFinite(raw) || raw < 1) return declared.shortName;

  const n = String(Math.round(raw));
  return {
    vi: `${declared.shortName.vi} ${n} phiên`,
    en: `${n}-period ${declared.shortName.en}`,
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
  const { formula, inputs, ctx, output, level, sweepKey, span, seriesLabel, overlays } = args;
  const zeroBaseline = args.zeroBaseline === true;
  const candleRange = args.candleRange === true;
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
  /*
   * Hình theo chuỗi giá (phân phối lợi suất / đường sụt giảm, 21/10/2026) — cũng là MỘT MỤC của ô
   * chọn, đứng ngay sau "Thời gian", chỉ có khi chuỗi đã nạp đủ phiên cho cửa sổ `calc` dùng.
   */
  const seriesView = spec.seriesView;
  const cuaSoChuoi = seriesView === undefined ? null : seriesWindow(seriesView, inputs, ctx);
  const seriesViewReady = seriesView !== undefined && cuaSoChuoi !== null;
  /*
   * Hình cơ cấu (vành khuyên, 22/10/2026) — MỘT MỤC của ô chọn, chỉ có khi mọi phần ra số không âm.
   * Không bao giờ là hình mặc định: hình màn mở ra của công thức giữ nguyên như trước.
   */
  const coCau = spec.composition;
  const phanCoCau = coCau === undefined ? null : compositionBars(spec, inputs, output);
  const compositionReady = coCau !== undefined && phanCoCau !== null;
  /*
   * Hình cột theo kỳ (23/10/2026) — MỘT MỤC của ô chọn, đứng sau hình cơ cấu, chỉ có khi công thức
   * khai `FormulaModule.columns` và số sinh ra qua được `columnData()`. Không bao giờ là hình mặc định.
   */
  const soCot = columnData(formula, inputs, ctx, output);
  const mucCot = soCot === null ? null : columnsOption(formula);
  const thangDoReady = gaugeReady(spec, output);
  const options: SweepOption[] = [
    ...(breakdownReady ? [{ key: BREAKDOWN_KEY, label: BREAKDOWN_LABEL }] : []),
    ...(historyReady ? [{ key: HISTORY_KEY, label: HISTORY_LABEL }] : []),
    ...(seriesViewReady ? [seriesViewOption(seriesView)] : []),
    ...(compositionReady ? [compositionOption(coCau)] : []),
    ...(mucCot === null ? [] : [mucCot]),
    /* Thang đo (23/10/2026) — chỉ khi công thức khai `gauge` và kết quả đã tính được. */
    ...(thangDoReady ? [{ key: GAUGE_KEY, label: GAUGE_LABEL }] : []),
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

  if (compositionReady && sweepKey === COMPOSITION_KEY) {
    return buildCompositionModel(coCau, phanCoCau, options);
  }

  if (soCot !== null && formula.columns !== undefined && sweepKey === COLUMNS_KEY) {
    return buildColumnsModel(formula.columns, soCot, options);
  }

  if (thangDoReady && sweepKey === GAUGE_KEY) {
    return buildGaugeModel(spec, output, name, options);
  }

  if (seriesViewReady && sweepKey === seriesViewOption(seriesView).key) {
    return seriesView.kind === 'distribution'
      ? buildDistributionModel(seriesView, cuaSoChuoi, output, name, options, seriesLabel)
      : buildDrawdownModel(seriesView, cuaSoChuoi, name, options, seriesLabel);
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
  /*
   * Bậc hiển thị của trục X — `null` trên trục thời gian, nơi nhãn là ngày tháng chứ không phải một
   * đại lượng, nên không có gì để chia bậc.
   */
  let xScale: AxisScale | null = null;
  /* Tên cột trục X của bảng số — đơn vị gốc, không phải bậc của trục; xem `withUnit()`. */
  let xTableTitle: Bilingual;

  if (onTime) {
    points = historyPoints(formula, inputs, ctx);
    x = {
      title: { vi: 'Ngày', en: 'Date' },
      domain: [0, Math.max(1, points.length - 1)],
      ticks: sessionTicks(ctx.bars ?? []),
    };
    xTableTitle = x.title;
    activeKey = HISTORY_KEY;
    axisName = TIME_AXIS_NAME;
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
    const built = buildAxis(xExtent[0], xExtent[1], axisName, chosen.unit, MAX_TICK_CHARS_X);
    x = built.axis;
    xScale = built.scale;
    xTableTitle = built.tableTitle;
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

  /*
   * ── Chuỗi phụ ──────────────────────────────────────────────────────────────
   *
   * Lọc TRƯỚC khi dựng bất cứ thứ gì bám theo chúng (miền trục trái, trục phải, cột bảng): chuỗi
   * lệch lưới bị loại ở đây thì không có chỗ nào phía sau phải hỏi lại "chuỗi này có dùng được
   * không".
   *
   * `companion` là đường giá đóng cửa của công thức khai `spec.priceOverlay` — CHỈ dựng trong
   * nhánh thời gian: trên đường quét, mỗi điểm là một mức giả định chứ không phải một phiên, nên
   * "giá đóng cửa tại điểm đó" không tồn tại. Nhờ cái cổng này, đổi trục X sang một biến số là
   * đường giá tự ẩn và mô hình trở về đúng hình một chuỗi như trước.
   */
  const companion = onTime && spec.priceOverlay !== undefined ? closePriceSeries(ctx) : null;
  const requested = companion === null ? (overlays ?? []) : [companion, ...(overlays ?? [])];
  const extra = requested.length === 0 ? [] : usableOverlays(requested, points);

  /*
   * Nến của từng phiên — chỉ trên trục thời gian của công thức có kết quả là một mức giá, và chỉ
   * khi số phiên khớp đúng số điểm (cùng `sessionsOf(ctx)` nên luôn khớp; phép so là lưới an toàn
   * cho bất biến "phần tử thứ i là phiên x = i" mà renderer dựa vào).
   */
  const candlesRaw = onTime && spec.priceLevel === true ? sessionCandles(ctx) : null;
  const candles = candlesRaw !== null && candlesRaw.length === points.length ? candlesRaw : null;
  const drawCandles = candleRange && candles !== null;

  /*
   * Miền trục TRÁI ôm mọi chuỗi đọc trục trái, không riêng chuỗi chính.
   *
   * Renderer chiếu toạ độ bằng thang tuyến tính và KHÔNG cắt hình ngoài khung, nên một chuỗi phụ
   * vượt miền sẽ vẽ tràn ra ngoài vùng vẽ — với SMA thì chắc chắn xảy ra: giá thô dao động rộng
   * hơn chính đường trung bình làm mượt nó. Khi không có chuỗi phụ trục trái, `yFull` LÀ `yExtent`
   * — cùng một giá trị, không phải "tương đương" — nên 100 biểu đồ một chuỗi giữ nguyên miền cũ.
   * Câu mô tả bên dưới vẫn đọc `yExtent`: khoảng chạy của CHÍNH công thức là điều câu ấy nói.
   */
  const leftOverlayYs = extra
    .filter((series) => series.axis !== 'right')
    .flatMap((series) => series.points.map((point) => point.y));
  const yLines =
    leftOverlayYs.length === 0
      ? yExtent
      : (extentOf([...points.map((point) => point.y), ...leftOverlayYs]) ?? yExtent);
  /*
   * Dạng Nến: ôm thêm giá cao và giá thấp của mọi phiên — xem `ChartArgs.candleRange`. Không bật
   * thì `yFull` LÀ `yLines`, cùng một giá trị, nên dạng Đường giữ đúng miền cũ.
   */
  const yFull =
    !drawCandles || candles === null
      ? yLines
      : (extentOf([yLines[0], yLines[1], ...candles.flatMap((c) => [c.low, c.high])]) ?? yLines);

  /*
   * Nới miền để chứa 0 khi màn đang vẽ cột — xem `ChartArgs.zeroBaseline` về lý do.
   *
   * Nới cả hai đầu chứ không riêng đầu dưới: chuỗi toàn số ÂM (lỗ, dòng tiền ra) cần mốc 0 ở đầu
   * TRÊN thì cột mới có chỗ treo xuống.
   */
  /*
   * Hình có đường kèm (SMA + giá đóng cửa…) không mời Cột (`dangVeCuaHinh()`), nên màn vẽ đường và
   * không có cột nào cần chỗ đứng: cờ vẫn tới đây vì `kind` sống qua mọi lần đổi trục, và nới tới 0 ở
   * đó chỉ ép đường vào một phần ba khung. Gác ở Domain, như `drawCandles` với `candleRange`.
   */
  const yBase: readonly [number, number] =
    zeroBaseline && extra.length === 0 ? [Math.min(0, yFull[0]), Math.max(0, yFull[1])] : yFull;

  const {
    axis: y,
    scale: yScale,
    tableTitle: yTableTitle,
  } = buildAxis(yBase[0], yBase[1], name, spec.resultUnit);

  /*
   * Nhãn RÚT GỌN của từng điểm, cho chữ vẽ trên hình: vạch dò khi rê chuột và dấu "giá trị hiện tại".
   *
   * Gắn ở ĐÂY chứ không ở `sweepPoints()`/`historyPoints()` vì bậc hiển thị là thuộc tính của TRỤC,
   * mà trục chỉ dựng xong ở dòng ngay trên — nơi sinh điểm không biết miền cuối cùng sẽ là gì.
   *
   * Mảng mới này thay hẳn `points` từ đây trở xuống, không dùng song song với mảng cũ: bảng số tra
   * `points.indexOf(point)` bằng THAM CHIẾU, nên hai mảng cùng tồn tại là bảng tra trượt toàn bộ
   * chuỗi phụ. Trục nào không chia bậc thì điểm giữ NGUYÊN object cũ, nên biểu đồ đơn vị 'lần' hay
   * '%' dựng ra đúng cùng những object như trước.
   */
  points = points.map((point) => {
    const shortX = xScale === null ? undefined : labelAtAxisScale(point.x, xScale);
    const shortY = point.y === null ? undefined : labelAtAxisScale(point.y, yScale);
    if (shortX === undefined && shortY === undefined) return point;
    return {
      ...point,
      ...(shortX === undefined ? {} : { shortLabel: shortX }),
      ...(shortY === undefined ? {} : { shortValueLabel: shortY }),
    };
  });

  /*
   * Mốc tham chiếu — lọc theo miền Y ĐANG hiện, không nới trục ra ôm lấy chúng.
   *
   * Đây là chỗ quyết định cả tính năng, nên nói rõ vì sao lọc chứ không giãn: miền Y bám sát dữ
   * liệu thật, và đó là thứ làm cho một đường quét đọc được. RSI theo "Số phiên" chạy trong khoảng
   * 52–56 điểm; kéo trục ra 30–70 để hai mốc có chỗ đứng thì đường 4 điểm ấy dẹt thành một vạch
   * ngang — mất đúng thứ người dùng vừa đổi trục để xem, đổi lấy hai đường kẻ không liên quan tới
   * miền đang xem. Ngoài khung thì ẩn; câu mô tả bên dưới cũng chỉ nhắc mốc còn hiện.
   *
   * `Number.isFinite` là lưới an toàn của chính file này (lời hứa số 2 ở docblock đầu file): một
   * `NaN` lọt tới renderer thành `y1="NaN"`, và Chrome bỏ qua cả thẻ trong im lặng.
   */
  const referenceLines = (spec.referenceLines ?? []).filter(
    (line) => Number.isFinite(line.value) && line.value >= y.domain[0] && line.value <= y.domain[1],
  );

  /*
   * Nhãn legend gọn cho chuỗi chính — CHỈ khi đường giá thật sự được vẽ: legend chỉ hiện từ hai
   * chuỗi trở lên, nên gắn nhãn lúc chuỗi phụ bị loại là gắn một trường không ai đọc mà vẫn làm
   * lệch bất biến "mô hình một chuỗi y hệt trước".
   */
  /*
   * Hình dựng cho dạng Nến luôn có legend (đường kết quả cạnh hai mẫu nến), nên nó cần tên gọn của
   * đường cả khi không có chuỗi phụ: tên công thức đã cắt phần sau gạch dài — 'VWAP', 'Dải Bollinger
   * trên'. Công thức có đường giá kèm thì giữ nhãn có số phiên của nó ('SMA 20 phiên').
   */
  const primaryLabel =
    companion !== null && extra.includes(companion) && spec.priceOverlay !== undefined
      ? overlayPrimaryLabel(spec.priceOverlay, inputs)
      : drawCandles
        ? name
        : undefined;

  /*
   * Trục Y phải — chỉ dựng khi thật sự có chuỗi xin nó.
   *
   * Miền lấy trên TẤT CẢ chuỗi đọc trục phải gộp lại (ba dải Bollinger phải nằm chung một thang,
   * không thì hình nói dối về khoảng cách giữa chúng), còn tên và đơn vị lấy của chuỗi ĐẦU TIÊN —
   * các chuỗi cùng đọc một trục thì phải cùng đơn vị, và chuỗi đầu là cái đại diện đọc được nhất.
   */
  const rightSeries = extra.filter((series) => series.axis === 'right');
  const rightExtent =
    rightSeries.length === 0
      ? null
      : extentOf(rightSeries.flatMap((series) => series.points.map((point) => point.y)));
  const rightHead = rightSeries[0];
  const yRight =
    rightExtent === null || rightHead === undefined
      ? undefined
      : buildAxis(rightExtent[0], rightExtent[1], rightHead.label, rightHead.unit ?? '').axis;

  /*
   * Bảng số — thêm một cột cho mỗi chuỗi phụ.
   *
   * Rút gọn vẫn chạy trên CHUỖI CHÍNH, không đổi một dòng: `condensePoints()` giữ điểm đầu, điểm
   * cuối, điểm "giá trị hiện tại" và hai đầu mỗi quãng đứt — bốn thứ ấy là thuộc tính của chuỗi
   * chính, và chuỗi phụ không có quyền kéo bảng đi chỗ khác.
   *
   * Chuỗi phụ lấy giá trị theo CHỈ SỐ của điểm đã giữ; `usableOverlays()` đã bảo đảm cùng lưới x
   * nên chỉ số ấy trỏ đúng phiên/mức. Nhánh `extra.length === 0` giữ nguyên đúng biểu thức cũ, để
   * 100 biểu đồ một chuỗi dựng ra đúng cùng một mảng như trước — không phải "tương đương", mà là
   * cùng một biểu thức.
   */
  const table: ChartTable = {
    // Tên cột theo đơn vị GỐC: ô in số đầy đủ (`7.826,94 tỷ ₫`), trục in số đã đổi bậc.
    columns: [xTableTitle, yTableTitle, ...extra.map((series) => series.label)],
    rows: condensePoints(points).map((point) => {
      if (point === null) return null;
      const label = { vi: point.label, en: point.label };
      if (extra.length === 0) return [label, point.valueLabel] as const;

      const index = points.indexOf(point);
      return [
        label,
        point.valueLabel,
        ...extra.map((series) =>
          index < 0 ? NO_VALUE : (series.points[index]?.valueLabel ?? NO_VALUE),
        ),
      ] as const;
    }),
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

  /*
   * Khoảng chạy của từng chuỗi phụ, cho câu mô tả. Cùng lẽ với câu về mốc tham chiếu ngay dưới:
   * `<svg>` mang `aria-hidden`, nên một đường không được nói ra bằng chữ là một đường không tồn
   * tại với trình đọc màn hình — và câu này cũng đi thẳng vào bản in PDF lẫn tấm PNG.
   */
  const overlayRanges = extra.flatMap((series) => {
    const ext = extentOf(series.points.map((point) => point.y));
    return ext === null
      ? []
      : [{ label: series.label, lo: ext[0], hi: ext[1], unit: series.unit ?? spec.resultUnit }];
  });

  /*
   * Dạng Nến cũng phải NÓI RA BẰNG CHỮ — cùng lẽ với câu về chuỗi phụ ngay trên: `<svg>` mang
   * `aria-hidden`, nên với trình đọc màn hình một lớp nến không được nói ra là không tồn tại.
   */
  const candleSpan =
    drawCandles && candles !== null
      ? extentOf(candles.flatMap((candle) => [candle.low, candle.high]))
      : null;

  const sentencesVi = [
    first === undefined || last === undefined
      ? ''
      : onTime
        ? `${name.vi}${seriesLabel === undefined ? '' : ` của ${seriesLabel}`} qua ${String(points.length)} phiên, từ ${first.label} tới ${last.label}.`
        : `Quét ${axisName.vi} từ ${first.label} tới ${last.label} qua ${String(points.length)} mức.`,
    `${name.vi} chạy trong khoảng ${formatValueWithUnit(yExtent[0], spec.resultUnit)} tới ${formatValueWithUnit(yExtent[1], spec.resultUnit)}.`,
    overlayRanges.length === 0
      ? ''
      : `Vẽ kèm: ${overlayRanges
          .map(
            (range) =>
              `${range.label.vi} ${formatValueWithUnit(range.lo, range.unit)} tới ${formatValueWithUnit(range.hi, range.unit)}`,
          )
          .join(' · ')}.`,
    candleSpan === null
      ? ''
      : `Vẽ kèm nến của từng phiên, giá thấp nhất ${formatValueWithUnit(candleSpan[0], '₫')}, cao nhất ${formatValueWithUnit(candleSpan[1], '₫')}.`,
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
    /*
     * Mốc tham chiếu cũng phải NÓI RA BẰNG CHỮ, không chỉ vẽ.
     *
     * `<svg>` mang `aria-hidden` (xem docblock `LineChart`), nên với trình đọc màn hình thì hai
     * đường kẻ 30 và 70 đơn giản là không tồn tại. Câu mô tả này và bảng số là toàn bộ những gì họ
     * đọc được — bỏ qua chỗ này là làm đúng cái việc tính năng sinh ra để sửa, chỉ khác đối tượng.
     * Nó cũng đi thẳng vào bản in PDF và tấm PNG chia sẻ, hai chỗ không có màu nào để dựa vào.
     */
    referenceLines.length === 0
      ? ''
      : `Mốc tham chiếu: ${referenceLines
          .map((line) => `${line.label.vi} ${formatValueWithUnit(line.value, spec.resultUnit)}`)
          .join(' · ')}.`,
  ];

  const sentencesEn = [
    first === undefined || last === undefined
      ? ''
      : onTime
        ? `${name.en}${seriesLabel === undefined ? '' : ` for ${seriesLabel}`} over ${String(points.length)} sessions, from ${first.label} to ${last.label}.`
        : `Sweeping ${axisName.en} from ${labelInEnglish(first.label)} to ${labelInEnglish(last.label)} across ${String(points.length)} levels.`,
    `${name.en} ranges from ${formatValueWithUnit(yExtent[0], unitLabel(spec.resultUnit).en)} to ${formatValueWithUnit(yExtent[1], unitLabel(spec.resultUnit).en)}.`,
    overlayRanges.length === 0
      ? ''
      : `Also drawn: ${overlayRanges
          .map(
            (range) =>
              `${range.label.en} ${formatValueWithUnit(range.lo, unitLabel(range.unit).en)} to ${formatValueWithUnit(range.hi, unitLabel(range.unit).en)}`,
          )
          .join(' · ')}.`,
    candleSpan === null
      ? ''
      : `Also drawn: a candle for each session, lowest price ${formatValueWithUnit(candleSpan[0], '₫')}, highest ${formatValueWithUnit(candleSpan[1], '₫')}.`,
    marked === undefined
      ? ''
      : onTime
        ? `The most recent session ${marked.label} gives ${labelInEnglish(marked.valueLabel)}.`
        : `At the current value ${labelInEnglish(marked.label)}, the result is ${labelInEnglish(marked.valueLabel)}.`,
    missing === 0
      ? `Every ${unit.en} produced a result.`
      : warmUp > 0 && firstReal !== undefined
        ? `The first ${String(warmUp)} sessions don't have enough data to calculate yet, so the line starts at ${labelInEnglish(firstReal.label)}.`
        : `${String(missing)} of ${String(points.length)} ${unit.en} could not be calculated.`,
    referenceLines.length === 0
      ? ''
      : `Reference levels: ${referenceLines
          .map(
            (line) =>
              `${line.label.en} ${formatValueWithUnit(line.value, unitLabel(spec.resultUnit).en)}`,
          )
          .join(' · ')}.`,
  ];

  const reason = points.find((point) => point.y === null && point.reason !== undefined)?.reason;

  return {
    kind: 'line',
    title: lineChartTitle(name, axisName, onTime),
    summary: {
      vi: sentencesVi.filter((sentence) => sentence !== '').join(' '),
      en: sentencesEn.filter((sentence) => sentence !== '').join(' '),
    },
    x,
    y,
    points,
    /*
     * Cả hai trường của nhiều-chuỗi đều VẮNG MẶT khi không dùng, không phải mảng rỗng / undefined
     * ghi rõ — cùng nếp `note` và `referenceLines`. Đó là điều kiện để bất biến "công thức một
     * chuỗi dựng ra đúng mô hình như trước" kiểm được bằng `toEqual`.
     */
    ...(extra.length === 0 ? {} : { overlays: extra }),
    ...(primaryLabel === undefined ? {} : { primaryLabel }),
    ...(yRight === undefined ? {} : { yRight }),
    ...(candles === null ? {} : { candles }),
    table,
    sweepKey: activeKey,
    options,
    /*
     * Vắng mặt hẳn khi không mốc nào lọt khung — không phải mảng rỗng.
     *
     * Có chủ đích: "công thức không khai mốc thì mô hình y hệt như trước" là một bất biến kiểm
     * được bằng `toEqual`, mà một `referenceLines: []` thừa ra đã đủ làm nó đỏ. Cùng nếp với
     * `note` ngay dưới đây.
     */
    ...(referenceLines.length === 0 ? {} : { referenceLines }),
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
