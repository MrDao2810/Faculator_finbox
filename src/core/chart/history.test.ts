import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext, FormulaModule } from '../calc/types';
import { FORMULA_MODULES, findFormulaModule } from '../formulas';
import { MARKET_CONFIG, scheduleOrDefault } from '../market';
import type { SeriesRow } from '../price-series';
import { defaultInputs } from '../registry/build';
import type { Bilingual } from '../types';
import { buildChartModel } from './build';
import {
  HISTORY_KEY,
  canDrawHistory,
  formatSessionDate,
  formatSessionMonth,
  historyPlan,
  historyPoints,
  sessionTicks,
} from './history';

const ASOF = '2026-08-04';
const BASE: CalcContext = { asOf: ASOF, schedule: scheduleOrDefault(MARKET_CONFIG) };

const SESSIONS = 248;

/**
 * Chuỗi phiên tự dựng ngay trong test, KHÔNG lấy từ `src/data`.
 *
 * Hai lý do, và cả hai đều đáng ghi lại. Thứ nhất là ranh giới tầng: ESLint chặn `src/core` gọi lên
 * `@/data` (CON-02), và chặn đúng — bộ máy biểu đồ không được biết bộ số liệu mẫu tồn tại. Thứ hai
 * là độ bền của chính ca kiểm: bộ mẫu hiện mang `isDraft: true` và sẽ bị thay bằng báo cáo thật, lúc
 * đó mọi ca bám vào con số của nó sẽ đỏ vì một lý do chẳng liên quan gì tới biểu đồ.
 *
 * Đường sin cho cả phiên tăng lẫn phiên giảm — điều kiện cần để RSI có gì mà tính — và hoàn toàn
 * xác định, không `Math.random()`, nên chạy lại luôn ra một chuỗi.
 */
function makeBars(count = SESSIONS): ReadonlyArray<SeriesRow> {
  const start = Date.UTC(2025, 0, 2);

  return Array.from({ length: count }, (_, i) => {
    const day = new Date(start + i * 86_400_000);
    const close = Math.round((90_000 + 8_000 * Math.sin(i / 9) + 12 * i) / 10) * 10;

    return {
      date: day.toISOString().slice(0, 10),
      open: close - 100,
      high: close + 400,
      low: close - 400,
      close,
      volume: 1_000_000 + ((i * 7_919) % 900_000),
    };
  });
}

const BARS = makeBars();

/**
 * Chuỗi VN-Index tự dựng riêng cho ca kiểm này — cùng lý do với `makeBars()`: không import từ
 * `@/data` (CON-02), và không phụ thuộc bộ mẫu bản thảo sẽ bị thay. Đường sin lệch pha với
 * `makeBars()` để phương sai khác 0, đủ cho `beta` hồi quy ra một số hữu hạn.
 */
function makeMarketCloses(count = SESSIONS): number[] {
  return Array.from(
    { length: count },
    (_, i) => Math.round((1_000 + 80 * Math.sin(i / 7) + 2 * i) / 10) * 10,
  );
}

const WITH_BARS: CalcContext = {
  ...BASE,
  bars: BARS,
  series: BARS.map((bar) => bar.close).filter((c): c is number => typeof c === 'number' && c > 0),
  marketSeries: makeMarketCloses(),
};

function moduleOf(id: string): FormulaModule {
  const found = findFormulaModule(id);
  if (found === undefined) throw new Error(`Registry thiếu công thức '${id}'.`);
  return found;
}

function pointsOf(id: string, ctx: CalcContext = WITH_BARS) {
  const formula = moduleOf(id);
  return historyPoints(formula, defaultInputs(formula.spec), ctx);
}

describe('formatSessionDate — không đi qua new Date()', () => {
  it('ISO thành ngày/tháng/năm kiểu Việt', () => {
    expect(formatSessionDate('2025-12-31')).toBe('31/12/2025');
    expect(formatSessionMonth('2025-12-31')).toBe('12/2025');
  });

  /*
   * Cắt chuỗi chứ không `new Date()` là có lý do: `new Date('2025-12-31')` cho nửa đêm UTC, và
   * `getDate()` trên máy ở múi giờ âm trả về 30. Ngày lệch một hôm trên biểu đồ tài chính là lỗi
   * người dùng phát hiện được mà mình thì không, vì máy dev ở UTC+7 luôn ra đúng.
   */
  /*
   * Ngày của một phiên là chữ của ô Ngày ở bảng dữ liệu, mà ô ấy mang 'DD/MM/YYYY' khi người dùng
   * gõ (và là lối duy nhất bảng ghi từ 13/10/2026). Hàm cũ cắt theo dấu '-' nên chỉ hiểu ISO: vạch
   * trục của một chuỗi gõ tay in cả '03/10/2026' thay cho '10/2026'. Hai lối viết phải cho CÙNG nhãn.
   */
  it('ngày viết kiểu Việt cho đúng nhãn mà ngày ISO cho', () => {
    expect(formatSessionDate('03/10/2026')).toBe(formatSessionDate('2026-10-03'));
    expect(formatSessionMonth('03/10/2026')).toBe(formatSessionMonth('2026-10-03'));
    expect(formatSessionDate('2026-10-03')).toBe('03/10/2026');
    expect(formatSessionMonth('03/10/2026')).toBe('10/2026');
  });

  it('ngày thiếu năm và số thứ tự phiên in nguyên xi — không có năm để ghi', () => {
    expect(formatSessionMonth('15/07')).toBe('15/07');
    expect(formatSessionMonth('12')).toBe('12');
    expect(formatSessionDate('15/07')).toBe('15/07');
  });

  it('chuỗi lạ thì trả nguyên văn, không ném lỗi và không ra NaN', () => {
    expect(formatSessionDate('rác')).toBe('rác');
    expect(formatSessionMonth('')).toBe('');
    expect(formatSessionDate('2025-12-31')).not.toContain('NaN');
  });
});

describe('historyPlan — công thức nào vẽ theo thời gian được', () => {
  it('chân giá: thay ô giá hiện tại, GIỮ ô giá vào', () => {
    expect(historyPlan(moduleOf('pe'), ASOF)).toEqual({
      priceKeys: ['price'],
      truncateSeries: false,
    });

    // Lãi lỗ ròng có cả hai chân: chỉ giá bán chạy theo phiên, giá mua là giá người dùng đã mua.
    const profit = historyPlan(moduleOf('loi-nhuan-rong'), ASOF);
    expect(profit?.priceKeys).toEqual(['sellPrice']);
  });

  it('chỉ có chân giá VÀO thì tự loại mình — không có gì để chạy theo phiên', () => {
    expect(historyPlan(moduleOf('co-lenh-rui-ro'), ASOF)).toBeNull();
    expect(historyPlan(moduleOf('gia-hoa-von'), ASOF)).toBeNull();
  });

  it('chỉ báo cuộn thì đi lối cắt tiền tố', () => {
    expect(historyPlan(moduleOf('rsi-wilder'), ASOF)).toEqual({
      priceKeys: [],
      truncateSeries: true,
    });
  });

  it('công thức không liên quan tới giá thì không vẽ theo thời gian được', () => {
    expect(historyPlan(moduleOf('lai-kep'), ASOF)).toBeNull();
    expect(historyPlan(moduleOf('cagr'), ASOF)).toBeNull();
  });

  it('chưa nạp phiên nào thì chưa vẽ được, dù công thức có khả năng', () => {
    expect(canDrawHistory(moduleOf('pe'), BASE)).toBe(false);
    expect(canDrawHistory(moduleOf('pe'), WITH_BARS)).toBe(true);
    // Vài phiên lẻ không thành một đường thời gian.
    expect(canDrawHistory(moduleOf('pe'), { ...BASE, bars: BARS.slice(0, 3) })).toBe(false);
  });
});

describe('historyPoints — chân giá', () => {
  it('một điểm mỗi phiên, x là chỉ số phiên, nhãn là ngày thật', () => {
    const points = pointsOf('pe');

    expect(points).toHaveLength(248);
    expect(points[0]?.x).toBe(0);
    expect(points[247]?.x).toBe(247);
    expect(points[0]?.label).toBe(formatSessionDate(BARS[0]?.date ?? ''));
  });

  it('P/E của FPT đổi theo từng phiên và mọi phiên đều tính được', () => {
    const points = pointsOf('pe');
    const ys = points.map((point) => point.y);

    expect(ys.every((y) => y !== null)).toBe(true);
    // Giá chạy thì P/E phải chạy — nếu phẳng nghĩa là ô giá không được thay theo phiên.
    expect(new Set(ys).size).toBeGreaterThan(100);
  });

  it('phiên gần nhất là điểm "hiện tại", và trùng con số khối Kết quả đang hiện', () => {
    const pe = moduleOf('pe');
    const inputs = defaultInputs(pe.spec);
    const points = historyPoints(pe, inputs, WITH_BARS);
    const last = points[points.length - 1];

    expect(points.filter((point) => point.marked === true)).toHaveLength(1);
    expect(last?.marked).toBe(true);

    /*
     * Ở phiên cuối, ô giá bị thay bằng giá đóng cửa phiên cuối — nên con số trên dấu phải bằng
     * đúng kết quả tính với chính giá ấy. Hai chỗ nói hai số về cùng một phép tính là lỗi nặng.
     */
    const lastClose = BARS[BARS.length - 1]?.close ?? 0;
    const expected = runFormula(pe, { ...inputs, price: lastClose }, WITH_BARS);
    expect(last?.y).toBe(expected.value);
  });

  it('giữ chân giá vào: lãi lỗ ròng vẽ theo giá bán, giá mua vẫn là giá người dùng nhập', () => {
    const profit = moduleOf('loi-nhuan-rong');
    const inputs = { ...defaultInputs(profit.spec), buyPrice: 50_000 };
    const points = historyPoints(profit, inputs, WITH_BARS);
    const ys = points.map((point) => point.y).filter((y): y is number => y !== null);

    expect(ys.length).toBeGreaterThan(200);
    /*
     * Mua ở 50.000 mà giá mẫu chạy quanh 90.000–110.000 thì đường lãi lỗ phải DƯƠNG hẳn. Nếu quy
     * tắc hai chân sai — thay cả giá mua theo phiên — thì mua bán cùng một giá, và đường này sẽ
     * phẳng quanh mức âm đúng bằng thuế phí. Đó là ca duy nhất phân biệt hai cách làm.
     */
    expect(Math.min(...ys)).toBeGreaterThan(0);
    expect(new Set(ys).size).toBeGreaterThan(100);
  });
});

describe('historyPoints — cắt tiền tố cho chỉ báo cuộn', () => {
  it('RSI vẽ được theo thời gian mà rsi-wilder không phải sửa một dòng nào', () => {
    const points = pointsOf('rsi-wilder');
    const ys = points.map((point) => point.y);
    const usable = ys.filter((y): y is number => y !== null);

    expect(points).toHaveLength(248);
    expect(usable.length).toBeGreaterThan(200);
    // RSI là chỉ số 0–100 theo định nghĩa; lọt ra ngoài nghĩa là cắt chuỗi sai chỗ.
    expect(Math.min(...usable)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...usable)).toBeLessThanOrEqual(100);
  });

  /*
   * Ca FR-06 của cả file: mấy phiên đầu ĐÚNG RA là không có RSI, vì chưa đủ phiên để tính. Đường
   * phải bắt đầu ở chỗ nó tồn tại. Một cái `?? 0` ở đâu đó sẽ vẽ RSI bằng 0 rồi vọt lên 50 — trông
   * như một cú sụp giá lịch sử chưa từng xảy ra.
   */
  it('phiên đầu chưa đủ dữ liệu thì y là null, KHÔNG phải 0', () => {
    const points = pointsOf('rsi-wilder');
    const head = points.slice(0, 10);

    expect(head.every((point) => point.y === null)).toBe(true);
    expect(head.every((point) => point.reason === 'MISSING_SERIES')).toBe(true);
    expect(points.some((point) => point.y === 0)).toBe(false);
  });

  it('cắt bars và series từ cùng một chỗ — hai bên không được lệch mốc thời gian', () => {
    // `stochastic-k` đọc `ctx.bars` (cần cao/thấp), `rsi-wilder` đọc `ctx.series`. Cả hai phải cùng
    // dừng ở phiên đang vẽ, nên số phiên tính được của hai bên phải cùng cỡ.
    const rsi = pointsOf('rsi-wilder').filter((point) => point.y !== null).length;
    const stoch = pointsOf('stochastic-k').filter((point) => point.y !== null).length;

    expect(Math.abs(rsi - stoch)).toBeLessThan(20);
  });

  /*
   * Beta đọc HAI chuỗi: cổ phiếu ở `ctx.series`, VN-Index ở `ctx.marketSeries`. Cắt tiền tố mà chỉ
   * cắt chuỗi cổ phiếu thì mọi điểm trừ điểm cuối ghép lợi suất cổ phiếu của quãng CŨ với lợi suất
   * chỉ số của quãng GẦN NHẤT — một con số trông như beta mà không là beta của quãng nào cả. Lỗi ấy
   * có thật tới 13/10/2026, và lộ ra khi soát chữ "Đọc biểu đồ" của chính công thức này.
   *
   * Cổ phiếu dựng ở đây có lợi suất mỗi phiên bằng đúng 1,5 lần lợi suất chỉ số, nên beta của MỌI
   * cửa sổ thẳng hàng là 1,5: đường theo thời gian phải nằm ngang ở mức ấy. Trước khi sửa nó chạy
   * từ quãng −0,5 lên 1,5 và chỉ điểm cuối đúng.
   */
  it('beta: chuỗi VN-Index bị cắt tới cùng phiên với chuỗi cổ phiếu', () => {
    const market = makeMarketCloses();
    const closes = [50_000];
    for (let i = 1; i < market.length; i += 1) {
      const marketReturn = (market[i] ?? 0) / (market[i - 1] ?? 1) - 1;
      closes.push((closes[i - 1] ?? 0) * (1 + 1.5 * marketReturn));
    }
    const bars = BARS.map((bar, i) => ({ ...bar, close: closes[i] ?? bar.close }));
    const betaOf = (ctx: CalcContext): number[] =>
      pointsOf('beta', ctx)
        .map((point) => point.y)
        .filter((y): y is number => y !== null);

    const thangHang = betaOf({ ...BASE, bars, series: closes, marketSeries: market });
    expect(thangHang.length).toBeGreaterThan(150);
    for (const y of thangHang) expect(y).toBeCloseTo(1.5, 6);

    /*
     * `calc` ghép hai chuỗi theo phiên CUỐI (`slice(-n)` ở cả hai), nên chuỗi chỉ số dài hơn chuỗi
     * cổ phiếu vẫn phải cho đúng kết quả ấy: cắt là bỏ cùng một số phiên ở ĐUÔI, không phải ép hai
     * chuỗi về cùng một độ dài tiền tố.
     */
    const daiHon = betaOf({
      ...BASE,
      bars,
      series: closes,
      marketSeries: [900, 910, 905, 920, 915, ...market],
    });
    expect(daiHon).toHaveLength(thangHang.length);
    for (const y of daiHon) expect(y).toBeCloseTo(1.5, 6);
  });
});

describe('sessionTicks — vạch trục là ngày thật', () => {
  it('bốn vạch chia đều, luôn có phiên đầu và phiên cuối', () => {
    const ticks = sessionTicks(BARS);

    expect(ticks).toHaveLength(4);
    expect(ticks[0]?.value).toBe(0);
    expect(ticks[3]?.value).toBe(247);
    expect(ticks[0]?.label).toBe(formatSessionMonth(BARS[0]?.date ?? ''));
  });

  it('không sinh vạch ở phiên không tồn tại', () => {
    for (const count of [1, 2, 5, 7, 60, 248]) {
      const ticks = sessionTicks(BARS.slice(0, count));

      for (const tick of ticks) {
        expect(tick.value, `${String(count)} phiên`).toBeLessThan(count);
        expect(tick.value).toBeGreaterThanOrEqual(0);
        expect(tick.label).not.toContain('undefined');
      }
      // Vạch phải tăng dần nghiêm ngặt, không trùng nhau sau khi làm tròn.
      const values = ticks.map((tick) => tick.value);
      expect([...new Set(values)]).toEqual(values);
    }
  });
});

describe('buildChartModel — trục thời gian nối vào ô chọn đã có', () => {
  function model(id: string, ctx: CalcContext, sweepKey?: string) {
    const formula = moduleOf(id);
    const inputs = defaultInputs(formula.spec);
    return buildChartModel({
      formula,
      inputs,
      ctx,
      output: runFormula(formula, inputs, ctx),
      level: 'basic',
      seriesLabel: 'FPT',
      ...(sweepKey === undefined ? {} : { sweepKey }),
    });
  }

  it('có phiên giá thì "Thời gian" là mục ĐẦU và là mặc định', () => {
    const built = model('pe', WITH_BARS);
    if (built.kind !== 'line') throw new Error('phải vẽ được');

    expect(built.options[0]).toEqual({
      key: HISTORY_KEY,
      label: { vi: 'Thời gian', en: 'Over time' },
    });
    expect(built.sweepKey).toBe(HISTORY_KEY);
    expect(built.title.vi).toBe('P/E theo thời gian');
    expect(built.summary.vi).toContain('P/E của FPT qua 248 phiên');
  });

  it('chưa nạp phiên nào thì không bày mục đó ra, và mặc định vẫn là đường quét', () => {
    const built = model('pe', BASE);
    if (built.kind !== 'line') throw new Error('phải vẽ được');

    expect(built.options.map((option) => option.key)).toEqual(['price', 'eps']);
    expect(built.sweepKey).toBe('price');
    expect(built.title.vi).toBe('P/E theo Giá thị trường (P)');
  });

  it('người dùng chọn một biến thì tôn trọng lựa chọn ấy, không giành lái', () => {
    const built = model('pe', WITH_BARS, 'eps');
    if (built.kind !== 'line') throw new Error('phải vẽ được');

    expect(built.sweepKey).toBe('eps');
    expect(built.title.vi).toBe('P/E theo EPS');
  });

  /*
   * ĐẢO ngày 23/10/2026: trước đây ca này đòi rơi về đường quét theo Giá. Chủ dự án không muốn hình
   * tự đổi sang dạng khác thay cho mục đã chọn (_"select là để phân biệt dạng biểu đồ"_), nên mục
   * Thời gian ở lại trong ô chọn và câu báo nói thiếu chuỗi; các trục quét vẫn ở đó để tự đổi sang.
   */
  it('xin đường thời gian khi dữ liệu đã mất thì báo chưa vẽ được, ô chọn giữ mục và còn đường quét', () => {
    const built = model('pe', BASE, HISTORY_KEY);
    if (built.kind !== 'unavailable') throw new Error('không được vẽ hình khác thay cho Thời gian');

    expect(built.sweepKey).toBe(HISTORY_KEY);
    expect(built.options?.map((option) => option.key)).toEqual([HISTORY_KEY, 'price', 'eps']);
    expect(built.warning.code).toBe('MISSING_SERIES');
    expect(built.warning.message.vi).toContain('Chưa vẽ được “Thời gian”');
  });

  /*
   * Cái chặn đường thời gian là CHUỖI. Một lỗi khác của kết quả (EPS bằng 0) không được đứng tên lý
   * do: sửa EPS xong hình vẫn chưa vẽ được (vòng soát 23/10/2026).
   */
  it('chưa có chuỗi mà EPS bằng 0: câu báo của "Thời gian" nói thiếu chuỗi, không nói EPS', () => {
    const formula = moduleOf('pe');
    const inputs = { ...defaultInputs(formula.spec), eps: 0 };
    const built = buildChartModel({
      formula,
      inputs,
      ctx: BASE,
      output: runFormula(formula, inputs, BASE),
      level: 'basic',
      sweepKey: HISTORY_KEY,
    });
    if (built.kind !== 'unavailable') throw new Error('không được vẽ hình khác thay cho Thời gian');

    expect(built.warning.code).toBe('MISSING_SERIES');
    expect(built.warning.message.vi).toContain('Chưa có chuỗi giá đủ phiên');
    expect(built.warning.message.vi).not.toContain('EPS');
  });

  it('trục X là cột "Ngày" trong bảng số, giá trị là ngày thật', () => {
    const built = model('pe', WITH_BARS);
    if (built.kind !== 'line') throw new Error('phải vẽ được');

    expect(built.table.columns[0].vi).toBe('Ngày');
    const firstRow = built.table.rows.find((row) => row !== null);
    expect(firstRow?.[0].vi).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('bảng số của RSI không bị 14 dòng trống dồn lên đầu', () => {
    const built = model('rsi-wilder', WITH_BARS);
    if (built.kind !== 'line') throw new Error('phải vẽ được');

    const rows = built.table.rows.filter(
      (row): row is readonly [Bilingual, string] => row !== null,
    );
    // `valueLabel` mang cả đơn vị — '— điểm' — nên so bằng `includes`, không so bằng dấu bằng.
    const blanks = rows.filter((row) => row[1].includes('_ _'));

    // Quãng đứt vẫn nói ra được, nhưng chỉ bằng hai đầu của nó.
    expect(blanks.length).toBeGreaterThan(0);
    expect(blanks.length).toBeLessThanOrEqual(2);
    // Và phần có số thật phải chiếm phần lớn bảng.
    expect(rows.length - blanks.length).toBeGreaterThanOrEqual(6);
  });
});

/*
 * Dải khởi động ≠ đường ngắt.
 *
 * RSI-14 không tồn tại ở phiên thứ 3, SMA-20 không tồn tại ở phiên thứ 5, VaR lịch sử đòi 60 quan
 * sát. Cả ba đều cho `y === null` ở mấy phiên đầu, nhưng đó là CÁCH chỉ báo cuộn hoạt động chứ không
 * phải chỗ công thức sụp. Bản trước gọi hết là "đường ngắt ở N phiên không tính được", đẩy người đọc
 * đi tìm một sự cố không tồn tại — trên bộ mẫu 248 phiên thì 33 công thức bị nói sai như thế.
 *
 * Phép phân biệt hẹp có chủ đích: chỉ khi MỌI điểm null nằm liền một dải ở đầu chuỗi. Một điểm null
 * nằm sau một phiên đã ra số là ngắt thật, và ghi chú phải còn.
 */
describe('dải khởi động của chỉ báo cuộn', () => {
  function lineOf(id: string, level: 'basic' | 'advanced' = 'basic') {
    const formula = moduleOf(id);
    const inputs = defaultInputs(formula.spec);
    const built = buildChartModel({
      formula,
      inputs,
      ctx: WITH_BARS,
      output: runFormula(formula, inputs, WITH_BARS),
      level,
      seriesLabel: 'FPT',
    });
    if (built.kind !== 'line') throw new Error(`${id}: phải vẽ được theo thời gian`);
    return built;
  }

  it('nói "phiên đầu chưa đủ dữ liệu" và chỉ ra phiên đường bắt đầu, KHÔNG có ghi chú ngắt', () => {
    const built = lineOf('rsi-wilder');

    expect(built.summary.vi).toContain('phiên đầu chưa đủ dữ liệu để tính');
    expect(built.summary.vi).toContain('đường bắt đầu từ');
    expect(built.note).toBeUndefined();
  });

  it('số phiên nêu trong câu đúng bằng số điểm null, và điểm ngay sau đó có số thật', () => {
    const built = lineOf('rsi-wilder');
    const nulls = built.points.filter((p) => p.y === null).length;

    expect(built.summary.vi).toContain(`${String(nulls)} phiên đầu`);
    expect(built.points[nulls]?.y).not.toBeNull();
    // Nhãn trong câu là NGÀY của đúng phiên ấy, không phải chỉ số phiên.
    expect(built.summary.vi).toContain(built.points[nulls]?.label ?? '@@');
  });

  it('ngắt GIỮA vùng có dữ liệu thì ghi chú vẫn còn — không gộp hai chuyện làm một', () => {
    const built = lineOf('he-so-bien-thien', 'advanced');
    const nulls = built.points.map((p, i) => (p.y === null ? i : -1)).filter((i) => i >= 0);

    // Chốt tiền đề của ca kiểm: công thức này thật sự có null nằm sau một phiên đã ra số.
    expect(nulls.some((i, k) => i !== k)).toBe(true);
    expect(built.note?.vi).toContain('không tính được');
    expect(built.summary.vi).not.toContain('phiên đầu chưa đủ dữ liệu');
  });

  /*
   * Trên ĐƯỜNG QUÉT thì không hỏi khởi động, dù dải null vẫn nằm ở đầu chuỗi. `co-lenh-rui-ro` có 18
   * mức đầu không ra số vì công thức không có nghĩa ở dải đó, chứ không vì thiếu phiên — bảo người
   * đọc "18 mức đầu chưa đủ dữ liệu" là nói sai nguyên nhân.
   */
  it('đường quét vẫn dùng cách nói cũ — khởi động là khái niệm của trục thời gian', () => {
    const formula = moduleOf('co-lenh-rui-ro');
    const inputs = defaultInputs(formula.spec);
    const built = buildChartModel({
      formula,
      inputs,
      ctx: BASE,
      output: runFormula(formula, inputs, BASE),
      level: 'basic',
    });
    if (built.kind !== 'line') throw new Error('phải ra đường quét');

    expect(built.points.some((p) => p.y === null)).toBe(true);
    expect(built.summary.vi).not.toContain('chưa đủ dữ liệu');
    expect(built.summary.vi).toContain('không tính được');
    expect(built.note?.vi).toContain('mức không tính được');
  });
});

describe('trục thời gian — quét toàn Registry', () => {
  it('không công thức nào lọt NaN, Infinity hay nhãn rỗng vào mô hình', () => {
    for (const formula of FORMULA_MODULES) {
      if (!canDrawHistory(formula, WITH_BARS)) continue;

      const inputs = defaultInputs(formula.spec);
      const built = buildChartModel({
        formula,
        inputs,
        ctx: WITH_BARS,
        output: runFormula(formula, inputs, WITH_BARS),
        level: 'basic',
      });
      if (built.kind !== 'line') continue;

      const id = formula.spec.id;
      for (const value of [...built.x.domain, ...built.y.domain]) {
        expect(Number.isFinite(value), `${id} · miền trục`).toBe(true);
      }
      expect(built.x.domain[0], id).toBeLessThan(built.x.domain[1]);
      expect(built.y.domain[0], id).toBeLessThan(built.y.domain[1]);

      for (const point of built.points) {
        expect(point.y === null || Number.isFinite(point.y), `${id} · y`).toBe(true);
        expect(point.label, id).not.toContain('NaN');
        expect(point.valueLabel, id).not.toContain('NaN');
        expect(point.valueLabel, id).not.toContain('undefined');
      }

      expect(JSON.stringify(built), id).not.toContain('NaN');
      expect(built.summary.vi, id).not.toContain('undefined');
    }
  });

  /*
   * Ca chốt phạm vi của cả nhánh: **có chuỗi giá thì KHÔNG công thức nào lọt.**
   *
   * `hasChart()` ở tầng giao diện mở cho mọi công thức không khai `chartType: 'none'`, và lời hứa ấy
   * chỉ giữ được nếu Domain thật sự dựng nổi mô hình cho tất cả. Quét cả hai chế độ vì chế độ Cơ bản
   * ẩn biến nâng cao khỏi ô chọn trục X (FR-09) — một công thức mà mọi biến đều là nâng cao sẽ không
   * còn ứng viên nào ở chế độ Cơ bản, và đó đúng là kiểu hụt mà ca này canh.
   */
  it('nạp chuỗi giá rồi thì CẢ 103 công thức đều dựng được mô hình, ở cả hai chế độ', () => {
    const wanted = FORMULA_MODULES.filter((formula) => formula.spec.chartType !== 'none');
    expect(wanted).toHaveLength(103);

    for (const level of ['basic', 'advanced'] as const) {
      for (const formula of wanted) {
        const inputs = defaultInputs(formula.spec);
        const built = buildChartModel({
          formula,
          inputs,
          ctx: WITH_BARS,
          output: runFormula(formula, inputs, WITH_BARS),
          level,
        });

        // 'waterfall' cũng là dựng ĐƯỢC: công thức khai `breakdown` bày bóc tách thay cho đường
        // quét, và đó là lựa chọn có chủ đích chứ không phải một nhánh hụt.
        expect(['line', 'waterfall'], `${formula.spec.id} · ${level}`).toContain(built.kind);
      }
    }
  });

  /*
   * Con số toàn Registry TỤT từ 50 xuống 49 ở đợt tách khoá `unitPrice`, và tụt là đúng.
   *
   * `historyPlan()` nhận diện "công thức ăn thị giá" bằng cách tìm khoá trong `CURRENT_LEG`. Khi
   * `diem-hoa-von` còn đặt tên ô "Giá bán một sản phẩm" là `price`, nó lọt vào danh sách này — tức
   * màn từng vẽ được một đường "điểm hoà vốn doanh nghiệp qua 248 phiên", dựng bằng cách thay giá
   * bán sản phẩm bằng THỊ GIÁ CỔ PHIẾU từng phiên. Một đường hoàn toàn vô nghĩa, mà lại trông
   * thuyết phục vì nó có trục thời gian thật.
   *
   * Cùng gốc với lỗi bộ mẫu đổ thị giá vào ô ấy (xem `preset-inputs.ts`), chỉ khác nơi phát tác —
   * bằng chứng rằng khoá trùng tên khác nghĩa rò ra nhiều chỗ, không riêng một chỗ.
   */
  it('vẽ theo thời gian được cho 18 công thức nhóm Cơ bản, 49 trên toàn Registry', () => {
    const able = FORMULA_MODULES.filter((formula) => canDrawHistory(formula, WITH_BARS));
    const basicChart = able.filter(
      (formula) => formula.spec.chartType === 'sensitivity' && formula.spec.level === 'basic',
    );

    expect(basicChart).toHaveLength(18);
    expect(able).toHaveLength(49);
    expect(able.map((formula) => formula.spec.id)).not.toContain('diem-hoa-von');
  });

  it('dựng hai lần ra kết quả y hệt — không có nguồn ngẫu nhiên nào trong đường vẽ', () => {
    const pe = moduleOf('pe');
    const inputs = defaultInputs(pe.spec);
    const once = historyPoints(pe, inputs, WITH_BARS);
    const twice = historyPoints(pe, inputs, WITH_BARS);

    expect(JSON.stringify(once)).toBe(JSON.stringify(twice));
  });
});

/*
 * Từ 28/10/2026 mỗi phiên không còn tự cắt rồi lọc lại cả tiền tố: giá dùng được lọc MỘT lần cho cả
 * chuỗi (`bangCua` trong `history.ts`), mỗi phiên chỉ còn một `slice`. Ca này dựng lại đúng cách cũ
 * ngay tại chỗ và đòi từng điểm của mọi công thức theo chuỗi trùng khít — trên một chuỗi có cả phiên
 * trống và phiên giá 0, đúng chỗ hai cách đếm "phiên dùng được" có thể lệch nhau.
 */
describe('mỗi phiên dùng đúng chuỗi giá của tiền tố, kể cả khi có phiên hỏng', () => {
  it('lọc một lần cho cả chuỗi ra đúng từng điểm như cắt rồi lọc lại từng tiền tố', () => {
    const coLo: ReadonlyArray<SeriesRow> = BARS.map((bar, i) =>
      i % 17 === 3 ? { ...bar, close: null } : i % 23 === 5 ? { ...bar, close: 0 } : bar,
    );
    const dung = (rows: ReadonlyArray<SeriesRow>): number[] =>
      rows
        .map((row) => row.close)
        .filter((value): value is number => typeof value === 'number' && value > 0);
    const ctx: CalcContext = { ...WITH_BARS, bars: coLo, series: dung(coLo) };
    const last = coLo.length - 1;

    let soCongThuc = 0;
    for (const formula of FORMULA_MODULES) {
      const plan = historyPlan(formula, ASOF);
      if (plan === null || !plan.truncateSeries) continue;
      soCongThuc += 1;
      const inputs = defaultInputs(formula.spec);
      const points = historyPoints(formula, inputs, ctx);
      coLo.forEach((bar, i) => {
        const close = bar.close;
        // Phiên không có close dương thì ô giá là NaN (29/10/2026), không phải giá người dùng đang gõ.
        const gia = close !== null && Number.isFinite(close) && close > 0 ? close : Number.NaN;
        const sessionInputs =
          plan.priceKeys.length === 0
            ? inputs
            : { ...inputs, ...Object.fromEntries(plan.priceKeys.map((key) => [key, gia])) };
        const cachCu: CalcContext = {
          ...ctx,
          bars: coLo.slice(0, i + 1),
          series: dung(coLo.slice(0, i + 1)),
          ...(ctx.marketSeries === undefined
            ? {}
            : {
                marketSeries: ctx.marketSeries.slice(
                  0,
                  Math.max(0, ctx.marketSeries.length - (last - i)),
                ),
              }),
        };
        expect(points[i]?.y, `${formula.spec.id} · phiên ${String(i)}`).toBe(
          runFormula(formula, sessionInputs, cachCu).value,
        );
      });
    }
    expect(soCongThuc).toBeGreaterThan(30);
  });

  it('phiên có Đóng cửa trống hoặc 0 thì không vẽ số (không dùng giá đang gõ, không thế giá 0)', () => {
    const hong = BARS.map((bar, i) =>
      i === 20 ? { ...bar, close: null } : i === 30 ? { ...bar, close: 0 } : bar,
    );
    const ctx: CalcContext = {
      ...WITH_BARS,
      bars: hong,
      series: hong
        .map((row) => row.close)
        .filter((value): value is number => typeof value === 'number' && value > 0),
    };
    let soCongThuc = 0;
    for (const id of ['pe', 'bien-an-toan', 'hpr', 'roi-rong']) {
      const formula = moduleOf(id);
      const plan = historyPlan(formula, ASOF);
      if (plan === null || plan.priceKeys.length === 0) continue;
      soCongThuc += 1;
      const points = historyPoints(formula, defaultInputs(formula.spec), ctx);
      expect(points[19]?.y, `${id} · phiên liền trước`).not.toBeNull();
      expect(points[20]?.y, `${id} · close trống`).toBeNull();
      expect(points[30]?.y, `${id} · close 0`).toBeNull();
      expect(points[31]?.y, `${id} · phiên liền sau`).not.toBeNull();
    }
    expect(soCongThuc).toBeGreaterThanOrEqual(2);
  });
});
