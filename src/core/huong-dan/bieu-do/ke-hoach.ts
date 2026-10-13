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
import { CLOSE_PRICE_LABEL, HISTORY_KEY, historyPlan } from '../../chart/history';
import { isFlatSpan } from '../../chart/scale';
import { sweepCandidates, sweepDomain } from '../../chart/sweep';
import type { ChartModel } from '../../chart/types';
import { defaultInputs } from '../../registry/build';
import type { Level, VariableSpec } from '../../types';
import type { HinhDoDuoc, KeHoachBieuDo, KeHoachBocTach, KeHoachTruc } from './types';

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
function luoiGoDuoc(bien: VariableSpec): ReadonlyArray<number> {
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

/**
 * Có bộ số gõ được nào làm đường theo ô `bien` đi NGƯỢC chiều nó đang đi với bộ số mặc định không.
 *
 * Đổi từng ô một — kể cả chính ô đang nằm trên trục, vì dải vẽ là ±50% quanh con số đang nhập.
 * "Ngược" là lên thành xuống hoặc xuống thành lên. Đường thành nằm ngang thì KHÔNG tính: gần như mọi
 * trục đều phẳng ra khi một thừa số bằng 0 (giá bằng 0, lãi suất bằng 0), và lúc ấy chính kết quả
 * bằng 0 trên màn đã nói đủ.
 */
function daoChieuDuoc(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
  bien: VariableSpec,
  chieu: HinhDoDuoc['chieu'],
): boolean {
  if (chieu === 'ngang') return false;

  for (const o of formula.spec.variables) {
    for (const value of luoiGoDuoc(o)) {
      const thu = { ...inputs, [o.key]: value };
      const hinh = doHinh(
        buildChartModel({
          formula,
          inputs: thu,
          ctx,
          output: runFormula(formula, thu, ctx),
          level: 'advanced',
          sweepKey: bien.key,
        }),
        bien.key,
      );
      if (hinh !== undefined && hinh.chieu !== 'ngang' && hinh.chieu !== chieu) return true;
    }
  }
  return false;
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

  return {
    khoa: bien.key,
    // Dựng bằng chính hàm màn tính dùng, vì trục cần chuỗi giá thì chưa có mô hình nào để đọc tên.
    ten: lineChartTitle(chartName(formula.spec), truc, false),
    truc,
    nangCao: bien.level === 'advanced',
    dai: nuaGapRuoi ? 'nua-gap-ruoi' : 'khac',
    ...(hinh === undefined ? {} : { hinh }),
    daoChieu: hinh !== undefined && daoChieuDuoc(formula, inputs, ctx, bien, hinh.chieu),
  };
}

function bocTachTu(model: ChartModel, macDinh: boolean): KeHoachBocTach | undefined {
  if (model.kind !== 'waterfall') return undefined;

  const tong = model.bars.find((bar) => bar.isTotal === true);
  if (tong === undefined) return undefined;

  return {
    ten: model.title,
    chang: model.bars.filter((bar) => bar.isTotal !== true).map((bar) => bar.label),
    tong: tong.label,
    macDinh,
  };
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
  const bocTach =
    bocTachTu(macDinh, true) ??
    (coBocTach ? bocTachTu(ve(capThap, BREAKDOWN_KEY), false) : undefined);

  const coThoiGian = historyPlan(formula, ctx.asOf) !== null;
  const thoiGian = coThoiGian
    ? {
        ten: lineChartTitle(chartName(spec), TIME_AXIS_NAME, true),
        coCot: spec.priceOverlay === undefined,
        moc: (spec.referenceLines ?? []).map((line) => ({ label: line.label, value: line.value })),
        chuoiPhu: spec.priceOverlay === undefined ? [] : [CLOSE_PRICE_LABEL],
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

  return {
    truc,
    ...(thoiGian === undefined ? {} : { thoiGian }),
    ...(bocTach === undefined ? {} : { bocTach }),
    moRa,
  };
}
