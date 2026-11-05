/**
 * Tầng DOMAIN — màn tính của một công thức dựng được NHỮNG HÌNH NÀO, tên gì.
 *
 * Hàm thuần của Registry và bộ dựng biểu đồ: nó không đọc một dòng chữ nào của kho, và không tin
 * `spec.chartType`. Nó GỌI `buildChartModel()` — chính hàm màn tính gọi — rồi đọc lại kết quả. Đó
 * là điểm của cả thư mục: bài chỉ được nói về hình mà hàm này thấy.
 *
 * Bộ số dùng để hỏi là `defaultInputs()`, đúng bộ số màn tính mở ra. Hai thứ đo được từ bộ số ấy mà
 * người dùng đổi được bằng cách gõ số khác — chiều đi của đường và chỗ đường đứt — nên chữ trong kho
 * tả HÌNH MỞ RA, không tả mọi hình có thể.
 *
 * Từ đợt hai (13/10/2026) hàm đi qua MỌI ô nhập đứng được trên trục ngang, không riêng ô mặc định:
 * khung "?" nói về đúng hình đang hiện, nên mục nào của ô chọn "Xem kết quả đổi theo" cũng phải có
 * kế hoạch của nó. Lấy ở cấp Nâng cao vì tập ô của cấp ấy chứa tập của Cơ bản.
 */

import { runFormula } from '../../calc/run';
import type { CalcContext, CalcInputs, FormulaModule } from '../../calc/types';
import { BREAKDOWN_KEY, canDrawBreakdown } from '../../chart/breakdown';
import {
  TIME_AXIS_NAME,
  axisLabel,
  buildChartModel,
  chartName,
  lineChartTitle,
} from '../../chart/build';
import { compositionBars } from '../../chart/composition';
import { dangVeCuaHinh, laDonViDem } from '../../chart/dang-ve';
import type { DangVe } from '../../chart/dang-ve';
import { CLOSE_PRICE_LABEL, HISTORY_KEY, historyPlan } from '../../chart/history';
import { isFlatSpan } from '../../chart/scale';
import { sweepCandidates, sweepDomain } from '../../chart/sweep';
import type { ChartModel } from '../../chart/types';
import { FPT_BARS, STB_BARS, VNINDEX_BARS, VNINDEX_PHIEN } from '../../formulas/market-series-2026';
import { simpleReturns } from '../../formulas/series-utils';
import type { SeriesRow } from '../../price-series';
import { defaultInputs } from '../../registry/build';
import { repeatKey } from '../../registry/repeat';
import type { CalcOutput, Level, VariableSpec } from '../../types';
import type { DangCoThe, HinhDoDuoc, KeHoachBieuDo, KeHoachBocTach, KeHoachTruc } from './types';

/** Sai số khi nhận ra dải "một nửa đến gấp rưỡi": bám bước (`step`) làm hai đầu lệch tới một bước. */
const SAI_SO_DAI = 0.13;

/**
 * Số đo của một đường theo một ô nhập; `undefined` khi mô hình không phải đường của đúng ô ấy —
 * tức chưa nạp chuỗi giá thì trục này chưa vẽ được.
 */
export function doHinh(model: ChartModel, khoa: string): HinhDoDuoc | undefined {
  if (model.kind !== 'line' || model.sweepKey !== khoa) return undefined;

  const ys = model.points.map((point) => point.y);
  const co = ys.filter((y): y is number => y !== null);
  const dau = co[0];
  const cuoi = co[co.length - 1];
  if (dau === undefined || cuoi === undefined) return undefined;

  /*
   * "Nằm ngang" hỏi bằng đúng điều kiện màn dùng để vẽ một vạch phẳng, không bằng `max === min`:
   * khối lượng rút gọn ở cả tử lẫn mẫu của `gia-hoa-von` vẫn để lại nhiễu ở chữ số thứ mười hai.
   */
  const phang = isFlatSpan(Math.min(...co), Math.max(...co));

  return {
    chieu: phang ? 'ngang' : cuoi >= dau ? 'len' : 'xuong',
    coQuangTrong: ys.some((y) => y === null),
    catKhong: co.some((y) => y < 0) && co.some((y) => y > 0),
  };
}

/**
 * Một lưới THƯA những giá trị người dùng gõ được vào một ô — để hỏi "gõ số khác thì đường có đi
 * ngược lại không".
 *
 * Ô chọn thì lấy mọi lựa chọn. Ô số thì lấy hai đầu `min` / `max`, số 0, vài bội của con số mặc
 * định (kể cả số đối của nó: lỗ thay cho lãi là ca đảo chiều hay gặp nhất), và vài bước quanh nó.
 * Giá trị nằm ngoài `[min, max]` bị loại: `clampToSpec()` không cho ai gõ tới đó.
 *
 * Lưới thưa nên đây là phép DÒ chứ không phải phép chứng minh: nó thấy mọi ca đảo chiều do đổi dấu
 * hay đổi cỡ một ô, và không thấy ca phải đổi hai ô cùng lúc.
 */
export function luoiGoDuoc(bien: VariableSpec): ReadonlyArray<number> {
  const goc = bien.defaultValue;
  if (bien.options !== undefined) {
    return bien.options.map((option) => option.value).filter((value) => value !== goc);
  }

  const buoc = bien.step !== undefined && bien.step > 0 ? bien.step : Math.abs(goc) * 0.1 || 1;
  const ung = [
    bien.min,
    bien.max,
    0,
    ...[0.1, 0.25, 0.5, 0.75, 1.5, 2, 4, 10, -0.5, -1, -2].map((heSo) => goc * heSo),
    ...[1, -1, 5, -5].map((soBuoc) => goc + soBuoc * buoc),
    ...[1, -1, 5, -5].map((soBuoc) => soBuoc * buoc),
  ];

  const trong = ung.filter(
    (value): value is number =>
      value !== undefined &&
      Number.isFinite(value) &&
      (bien.min === undefined || value >= bien.min) &&
      (bien.max === undefined || value <= bien.max),
  );
  // `toPrecision` gộp những số chỉ khác nhau ở nhiễu dấu phẩy động (0,30000000000000004 với 0,3).
  return [...new Set(trong.map((value) => Number(value.toPrecision(12))))].filter(
    (value) => value !== goc,
  );
}

/** Những dạng ô "Loại biểu đồ" mời cho một mô hình — rỗng khi mô hình không vẽ được. */
function dangCua(model: ChartModel, formula: FormulaModule): ReadonlySet<DangVe> {
  return model.kind === 'unavailable' ? new Set() : new Set(dangVeCuaHinh(model, formula.spec));
}

/**
 * Ba chuỗi giá THẬT (250 phiên, 12/09/2025 → 15/09/2026) để dò những dạng chỉ hiện khi đã có chuỗi:
 * FPT đi xuống cả năm, STB đi lên, VN-Index đi lên rồi dao động. Không chuỗi nào tự chế — đúng những
 * bảng `market-series-2026.ts` mà nút "Xem ví dụ minh hoạ" nạp. Chuỗi VN-Index luôn đi kèm làm
 * `marketSeries`, như màn chi tiết luôn kèm: thiếu nó thì Beta không vẽ được hình nào.
 */
const CHUOI_THAT: ReadonlyArray<ReadonlyArray<SeriesRow>> = [FPT_BARS, STB_BARS, VNINDEX_BARS];

/**
 * Chuỗi RIÊNG cho `beta`, dò thêm NGOÀI `CHUOI_THAT` (04/11/2026).
 *
 * Chủ dự án chụp màn "Beta theo Số phiên lấy để hồi quy" ở dạng Lãi/lỗ trên một mã thật, Beta đổi
 * dấu rõ trên trục, và hỏi vì sao nút "?" không hiện. Đo lại bằng `runFormula` thật: FPT giữ beta
 * 0,71–0,82 và STB giữ 0,35–0,44 suốt dải 60–90 phiên của trục ấy — ba chuỗi của `CHUOI_THAT` cộng
 * ví dụ riêng của `beta` (cũng là FPT) không chuỗi nào đổi dấu, nên kế hoạch luôn ghi `laiLo: false`
 * ở CẢ hai trục của Beta dù một mã thật biến động mạnh — tương quan đổi chiều giữa phiên cũ và phiên
 * mới — hoàn toàn cho ra đúng hình chủ dự án chụp được.
 *
 * Dựng bằng chính phép đại số `betaScaledCloses()` của `risk-ratios.ts` (`Cov(k·R_m, R_m) /
 * Var(R_m) = k` với MỌI chuỗi `R_m` có phương sai khác 0): 190 phiên đầu (cũ) đi NGƯỢC VN-Index với
 * hệ số −3, 59 phiên cuối (mới) đi CÙNG chiều với hệ số 0,3. Ở `sessions = 60` (mặc định của ô) cửa
 * sổ chỉ chạm khối "mới" nên beta ≈ 0,3; mở rộng cửa sổ thì khối "cũ" lấn dần, beta đổi dấu trước
 * `sessions = 72` và giữ âm tới 90 — đã kiểm bằng `runFormula` thật trên cả dải, không chỉ tính tay
 * (`ke-hoach.test.ts`). Giữ ngày của `VNINDEX_BARS` để trục thời gian đọc được ngày thật.
 */
function chuoiBetaDoiDau(): ReadonlyArray<SeriesRow> {
  const marketReturns = simpleReturns(VNINDEX_PHIEN);
  const closes: number[] = [100_000];
  let price = 100_000;
  marketReturns.forEach((r, i) => {
    price *= 1 + r * (i < 190 ? -3 : 0.3);
    closes.push(price);
  });
  return closes.map((close, index) => ({
    date: VNINDEX_BARS[index]?.date ?? String(index),
    open: close,
    high: close,
    low: close,
    close,
    volume: 0,
  }));
}

/** Một dòng = một công thức có chuỗi riêng ở trên; tra theo `spec.id`, rỗng cho mọi công thức khác. */
const CHUOI_RIENG: Readonly<Record<string, () => ReadonlyArray<SeriesRow>>> = {
  beta: chuoiBetaDoiDau,
};

/** Ngữ cảnh có chuỗi giá, dựng đúng cách `applyExample()` của màn chi tiết dựng. */
function voiChuoi(
  ctx: CalcContext,
  bars: ReadonlyArray<SeriesRow>,
  marketSeries: ReadonlyArray<number> = VNINDEX_PHIEN,
): CalcContext {
  return {
    ...ctx,
    bars,
    series: bars
      .map((bar) => bar.close)
      .filter((close): close is number => typeof close === 'number' && close > 0),
    marketSeries,
  };
}

/**
 * Những cặp (bộ số, chuỗi giá) dùng để dò hình CHỈ vẽ được khi có chuỗi: bộ số mặc định trên từng
 * chuỗi thật, cộng chính ví dụ của công thức (bộ số và chuỗi của nút "Xem ví dụ minh hoạ").
 */
function boDoChuoi(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
): ReadonlyArray<{ inputs: CalcInputs; ctx: CalcContext }> {
  const { example } = formula.spec;
  const theoVidu =
    example.dataset === undefined
      ? []
      : [
          {
            inputs: { ...inputs, ...example.inputs },
            ctx: voiChuoi(ctx, example.dataset.rows, example.marketSeries ?? VNINDEX_PHIEN),
          },
        ];
  const rieng = CHUOI_RIENG[formula.spec.id];
  const theoRieng = rieng === undefined ? [] : [{ inputs, ctx: voiChuoi(ctx, rieng()) }];
  return [
    ...CHUOI_THAT.map((bars) => ({ inputs, ctx: voiChuoi(ctx, bars) })),
    ...theoVidu,
    ...theoRieng,
  ];
}

/**
 * Dò một trục qua LƯỚI những bộ số gõ được: có bộ nào làm đường đi NGƯỢC chiều mặc định không, và
 * ô "Loại biểu đồ" có bao giờ mời Bậc thang hay Lãi/lỗ không.
 *
 * Đổi từng ô một — kể cả chính ô đang nằm trên trục, vì dải vẽ là ±50% quanh con số đang nhập.
 * "Ngược" là lên thành xuống hoặc xuống thành lên. Đường thành nằm ngang thì KHÔNG tính: gần như mọi
 * trục đều phẳng ra khi một thừa số bằng 0 (giá bằng 0, lãi suất bằng 0), và lúc ấy chính kết quả
 * bằng 0 trên màn đã nói đủ.
 *
 * Không dừng sớm ở ca đảo chiều đầu tiên như bản cũ (13/10/2026): hai dạng phụ thuộc số liệu cũng
 * cần đi hết lưới (03/11/2026).
 */
function doQuaLuoi(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
  bien: VariableSpec,
  chieu: HinhDoDuoc['chieu'],
): { daoChieu: boolean } & DangCoThe {
  let daoChieu = false;
  let bac = false;
  let laiLo = false;

  for (const o of formula.spec.variables) {
    for (const value of luoiGoDuoc(o)) {
      const thu = { ...inputs, [o.key]: value };
      const model = buildChartModel({
        formula,
        inputs: thu,
        ctx,
        output: runFormula(formula, thu, ctx),
        level: 'advanced',
        sweepKey: bien.key,
      });
      const dang = dangCua(model, formula);
      bac ||= dang.has('step');
      laiLo ||= dang.has('signArea');

      const hinh = doHinh(model, bien.key);
      if (
        chieu !== 'ngang' &&
        hinh !== undefined &&
        hinh.chieu !== 'ngang' &&
        hinh.chieu !== chieu
      ) {
        daoChieu = true;
      }
    }
  }
  return { daoChieu, bac, laiLo };
}

/**
 * Hai dạng phụ thuộc số liệu của một trục CHỈ vẽ được trên chuỗi giá (51 trục): dò trên các chuỗi
 * thật với bộ số mặc định và trên ví dụ của công thức. Không đổi từng ô như `doQuaLuoi()`: mỗi lần
 * dựng là 41 lần tính trên 250 phiên, nhân cả lưới thì việc dựng trang chậm hẳn mà không thêm gì —
 * Bậc thang của những trục này đã có luật tĩnh (ô đếm phiên), còn Lãi/lỗ do chuỗi quyết.
 */
function doTrenChuoi(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
  sweepKey: string,
): DangCoThe {
  let bac = false;
  let laiLo = false;
  for (const bo of boDoChuoi(formula, inputs, ctx)) {
    const model = buildChartModel({
      formula,
      inputs: bo.inputs,
      ctx: bo.ctx,
      output: runFormula(formula, bo.inputs, bo.ctx),
      level: 'advanced',
      sweepKey,
    });
    const dang = dangCua(model, formula);
    bac ||= dang.has('step');
    laiLo ||= dang.has('signArea');
  }
  return { bac, laiLo };
}

/** Kế hoạch của một ô nhập khi nó nằm trên trục ngang. */
function trucTu(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
  bien: VariableSpec,
  model: ChartModel,
): KeHoachTruc {
  const goc = inputs[bien.key] ?? bien.defaultValue;
  const dai = sweepDomain(bien, goc);
  /*
   * So theo TỈ SỐ nhỏ và lớn chứ không theo "đầu trái" và "đầu phải": con số âm thì phép nhân đảo
   * hai đầu (`r2` của `loi-suat-trung-binh-hinh-hoc` mặc định -5, dải chạy từ -7,5 tới -2,5), mà
   * dải ấy vẫn đúng là từ một nửa đến gấp rưỡi con số đang nhập.
   */
  const tiSo = dai === null || goc === 0 ? null : [dai.lo / goc, dai.hi / goc];
  const nuaGapRuoi =
    tiSo !== null &&
    Math.abs(Math.min(...tiSo) - 0.5) < SAI_SO_DAI &&
    Math.abs(Math.max(...tiSo) - 1.5) < SAI_SO_DAI;

  const truc = axisLabel(bien.label);
  const hinh = doHinh(model, bien.key);

  /*
   * Hai dạng phụ thuộc số liệu: dạng của chính bộ số mặc định, cộng mọi bộ số dò được. Bậc thang còn
   * có luật tĩnh — ô ĐẾM kỳ (năm, tháng, kỳ, phiên, ngày) mời Bậc thang mỗi khi dải trên trục đủ hẹp
   * để các mức cách nhau đúng một bước, mà người dùng gõ một con số nhỏ là dải hẹp lại.
   */
  const dangGoc = dangCua(model, formula);
  const dem = laDonViDem(bien.unit);
  const qua =
    hinh === undefined
      ? { daoChieu: false, ...doTrenChuoi(formula, inputs, ctx, bien.key) }
      : doQuaLuoi(formula, inputs, ctx, bien, hinh.chieu);

  return {
    khoa: bien.key,
    // Dựng bằng chính hàm màn tính dùng, vì trục cần chuỗi giá thì chưa có mô hình nào để đọc tên.
    ten: lineChartTitle(chartName(formula.spec), truc, false),
    truc,
    nangCao: bien.level === 'advanced',
    dai: nuaGapRuoi ? 'nua-gap-ruoi' : 'khac',
    ...(hinh === undefined ? {} : { hinh }),
    daoChieu: qua.daoChieu,
    bac: dem || dangGoc.has('step') || qua.bac,
    laiLo: dangGoc.has('signArea') || qua.laiLo,
  };
}

/**
 * Hình bóc tách có bao giờ vẽ được thành vành khuyên không: ở bộ số mặc định, hoặc ở một bộ số đổi
 * từng ô một (cùng lưới `luoiGoDuoc`). Một phần TRỪ chỉ cho vành khuyên khi nó bằng đúng 0.
 */
function coVanhKhuyen(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
  level: Level,
): boolean {
  const thuBo = (bo: CalcInputs): boolean =>
    dangCua(
      buildChartModel({
        formula,
        inputs: bo,
        ctx,
        output: runFormula(formula, bo, ctx),
        level,
        sweepKey: BREAKDOWN_KEY,
      }),
      formula,
    ).has('donut');

  if (thuBo(inputs)) return true;
  return formula.spec.variables.some((o) =>
    luoiGoDuoc(o).some((value) => thuBo({ ...inputs, [o.key]: value })),
  );
}

function bocTachTu(
  model: ChartModel,
  macDinh: boolean,
  vanhKhuyen: boolean,
): KeHoachBocTach | undefined {
  if (model.kind !== 'waterfall') return undefined;

  const tong = model.bars.find((bar) => bar.isTotal === true);
  if (tong === undefined) return undefined;

  return {
    ten: model.title,
    chang: model.bars.filter((bar) => bar.isTotal !== true).map((bar) => bar.label),
    tong: tong.label,
    macDinh,
    vanhKhuyen,
  };
}

/**
 * Kế hoạch của hình CƠ CẤU — xem `BieuDoRieng.coCau`. `undefined` khi công thức không khai
 * `spec.composition` hoặc không vẽ được ở bộ số mặc định (`compositionBars()` trả `null`: một phần
 * tra không ra số, một phần âm, hoặc tổng không dương — cùng điều kiện màn tính dùng để quyết mục
 * "Cơ cấu …" có mặt trong ô "Xem theo" hay không).
 *
 * `vanhKhuyen` luôn `true`: `compositionBars()` đã bảo đảm 2–4 phần không âm và tổng dương, đúng
 * hệt điều kiện `phanCong()` ở tầng biểu đồ cần để mời Vành khuyên — không cần dò lại bằng số.
 */
function coCauTu(
  formula: FormulaModule,
  inputs: CalcInputs,
  output: CalcOutput,
): KeHoachBocTach | undefined {
  const view = formula.spec.composition;
  if (view === undefined) return undefined;

  const bars = compositionBars(formula.spec, inputs, output);
  if (bars === null) return undefined;

  return {
    ten: view.title,
    chang: bars.filter((bar) => bar.isTotal !== true).map((bar) => bar.label),
    tong: view.total,
    macDinh: false,
    vanhKhuyen: true,
  };
}

/**
 * Hình theo thời gian có bao giờ mời dạng Lãi/lỗ không: dò trên các chuỗi thật và trên ví dụ của
 * công thức. P/E dọc một năm giữ nguyên dấu của EPS nên không có; ROC, MACD đổi dấu ngay.
 */
function thoiGianCoLaiLo(formula: FormulaModule, inputs: CalcInputs, ctx: CalcContext): boolean {
  return boDoChuoi(formula, inputs, ctx).some((bo) =>
    dangCua(
      buildChartModel({
        formula,
        inputs: bo.inputs,
        ctx: bo.ctx,
        output: runFormula(formula, bo.inputs, bo.ctx),
        level: 'advanced',
        sweepKey: HISTORY_KEY,
      }),
      formula,
    ).has('signArea'),
  );
}

/**
 * Những hình màn tính của công thức này dựng được; `undefined` khi nó không có khối biểu đồ.
 *
 * `ctx` KHÔNG mang chuỗi giá: đó đúng là trạng thái màn mở ra. Hình theo thời gian thì hỏi bằng
 * `historyPlan()` — thuộc tính tĩnh của công thức — chứ không dựng thử, vì dựng thử cần một chuỗi
 * giá mà tầng Domain không được tự chế ra (`CalcContext.series`).
 */
export function keHoachBieuDo(formula: FormulaModule, ctx: CalcContext): KeHoachBieuDo | undefined {
  const { spec } = formula;
  if (spec.chartType === 'none') return undefined;

  // Công thức Nâng cao không hiện ở chế độ Cơ bản, nên "hình mở ra" của nó là hình Nâng cao.
  const capThap: Level = spec.level === 'advanced' ? 'advanced' : 'basic';
  const inputs = defaultInputs(spec);
  const output = runFormula(formula, inputs, ctx);
  const ve = (level: Level, sweepKey?: string): ChartModel =>
    buildChartModel({
      formula,
      inputs,
      ctx,
      output,
      level,
      ...(sweepKey === undefined ? {} : { sweepKey }),
    });

  const truc = sweepCandidates(spec, 'advanced').map((bien) =>
    trucTu(formula, inputs, ctx, bien, ve('advanced', bien.key)),
  );

  const macDinh = ve(capThap);
  const coBocTach = canDrawBreakdown(spec, inputs, output);
  const vanhKhuyen =
    (macDinh.kind === 'waterfall' || coBocTach) && coVanhKhuyen(formula, inputs, ctx, capThap);
  const bocTach =
    bocTachTu(macDinh, true, vanhKhuyen) ??
    (coBocTach ? bocTachTu(ve(capThap, BREAKDOWN_KEY), false, vanhKhuyen) : undefined);

  const coThoiGian = historyPlan(formula, ctx.asOf) !== null;
  const thoiGian = coThoiGian
    ? {
        ten: lineChartTitle(chartName(spec), TIME_AXIS_NAME, true),
        coCot: spec.priceOverlay === undefined,
        moc: (spec.referenceLines ?? []).map((line) => ({ label: line.label, value: line.value })),
        chuoiPhu: spec.priceOverlay === undefined ? [] : [CLOSE_PRICE_LABEL],
        // Lãi/lỗ đòi một chuỗi: hình có giá đóng cửa vẽ kèm thì không bao giờ mời (`dangVeCuaHinh`).
        laiLo: spec.priceOverlay === undefined && thoiGianCoLaiLo(formula, inputs, ctx),
        nen: spec.priceLevel === true,
      }
    : undefined;

  /*
   * Hình màn mở ra. Mô hình `unavailable` nghĩa là công thức đang chờ chuỗi giá: hình đầu tiên người
   * dùng thấy sẽ là hình theo thời gian, vì bộ dựng tự chọn nó ngay khi có chuỗi.
   */
  const moRa =
    macDinh.kind === 'waterfall'
      ? BREAKDOWN_KEY
      : macDinh.kind === 'line'
        ? macDinh.sweepKey
        : coThoiGian
          ? HISTORY_KEY
          : (truc[0]?.khoa ?? BREAKDOWN_KEY);

  /*
   * Ô mẫu của nhóm lặp (đợt mua thứ tư trở đi). Chúng không nằm trong `spec.variables` nên không có
   * mặt ở `truc`, nhưng người dùng thêm một nhóm là ô chọn trục có ngay mục của chúng — và mục ấy
   * cần chữ. Lọc bằng đúng điều kiện `sweepCandidates()` dùng cho một ô thật.
   */
  const trucLap = (spec.repeat?.fields ?? [])
    .filter(
      (mau) =>
        (mau.type === 'number' || mau.type === 'slider') &&
        sweepDomain(mau, mau.defaultValue) !== null,
    )
    .map((mau) => {
      const tenTruc = axisLabel(mau.label);
      // Ô cùng mẫu của nhóm đầu — xem `KeHoachTrucLap.bac`.
      const nhomDau = truc.find((mot) => mot.khoa === repeatKey(mau.key, 1));
      return {
        tienTo: mau.key,
        ten: lineChartTitle(chartName(spec), tenTruc, false),
        truc: tenTruc,
        bac: nhomDau?.bac ?? laDonViDem(mau.unit),
        laiLo: nhomDau?.laiLo ?? false,
      };
    });

  const coCau = coCauTu(formula, inputs, output);

  return {
    truc,
    trucLap,
    ...(thoiGian === undefined ? {} : { thoiGian }),
    ...(bocTach === undefined ? {} : { bocTach }),
    ...(coCau === undefined ? {} : { coCau }),
    moRa,
  };
}
