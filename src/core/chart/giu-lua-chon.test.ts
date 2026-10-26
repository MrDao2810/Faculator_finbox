import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext, CalcInputs, FormulaModule } from '../calc/types';
import { FORMULA_MODULES } from '../formulas';
import { FPT_BARS } from '../formulas/market-series-2026';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { defaultInputs } from '../registry/build';
import type { Level } from '../types';
import { buildChartModel } from './build';
import type { ChartModel } from './types';

/**
 * Ô "Xem theo" giữ đúng lựa chọn của người dùng — quét cả Registry (23/10/2026).
 *
 * Chủ dự án đang xem Thang đo của %B, kéo Chu kỳ quá số phiên đang có, và hình tự thành "Chu kỳ dải
 * Bollinger · Đường": _"select là để phân biệt dạng biểu đồ chứ không như hiện tại đang sai logic
 * hiển thị biểu đồ"_. Ca ở `charts.test.tsx` giữ đúng ảnh ấy; ở đây là cả lớp lỗi, với mọi công thức
 * có biểu đồ, hai cấp độ, ba trạng thái chuỗi (chưa nạp, 10 phiên như một mã Finbox, 250 phiên):
 *
 * 1. Bấm mục nào trong ô thì hình (hay câu báo) là của ĐÚNG mục ấy — không bao giờ mục khác.
 * 2. Mục nào ô chọn bày ra thì bấm vào là có hình, trừ đúng mục đang chọn.
 * 3. Hình MẶC ĐỊNH không vẽ được — kể cả khi người dùng bấm lại đúng mục mặc định — thì không ô chọn.
 * 4. Câu báo kèm ô chọn chỉ khi người dùng đã chọn một mục KHÁC mục mặc định, mục ấy hỏng, và còn mục
 *    khác vẽ được; câu ấy nêu tên mục.
 */

const CTX: CalcContext = { asOf: '2026-09-15', schedule: scheduleOrDefault(MARKET_CONFIG) };

function ctxVoi(soPhien: number): CalcContext {
  const bars = FPT_BARS.slice(-soPhien);
  return {
    ...CTX,
    bars,
    series: bars
      .map((bar) => bar.close)
      .filter((close): close is number => typeof close === 'number' && close > 0),
  };
}

const TRANG_THAI: ReadonlyArray<readonly [string, CalcContext]> = [
  ['chưa nạp chuỗi', CTX],
  ['10 phiên', ctxVoi(10)],
  ['250 phiên', ctxVoi(250)],
];

function ve(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
  level: Level,
  sweepKey?: string,
): ChartModel {
  return buildChartModel({
    formula,
    inputs,
    ctx,
    output: runFormula(formula, inputs, ctx),
    level,
    ...(sweepKey === undefined ? {} : { sweepKey }),
  });
}

const CO_BIEU_DO = FORMULA_MODULES.filter((formula) => formula.spec.chartType !== 'none');

describe('ô "Xem theo" giữ đúng lựa chọn, ở mọi công thức', () => {
  it('bấm mục nào thì hình là của đúng mục ấy, và mục nào được bày ra cũng vẽ được', () => {
    const loi: string[] = [];

    for (const formula of CO_BIEU_DO) {
      const inputs = defaultInputs(formula.spec);
      for (const [tenTrangThai, ctx] of TRANG_THAI) {
        for (const level of ['basic', 'advanced'] as const) {
          const noi = `${formula.spec.id} · ${tenTrangThai} · ${level}`;
          const moRa = ve(formula, inputs, ctx, level);
          const muc = moRa.options ?? [];

          for (const option of muc) {
            const hinh = ve(formula, inputs, ctx, level, option.key);
            if (hinh.kind === 'unavailable') {
              /* Chỉ mục đang mở mới được phép chưa vẽ được — mục nào khác bày ra cũng phải có hình. */
              if (moRa.kind !== 'unavailable' || moRa.sweepKey !== option.key) {
                loi.push(`${noi}: mục ${option.key} được bày ra mà bấm vào không có hình`);
              }
              continue;
            }
            if (hinh.sweepKey !== option.key) {
              loi.push(`${noi}: bấm ${option.key} mà ra hình ${hinh.sweepKey}`);
            }
          }
        }
      }
    }

    expect(loi).toEqual([]);
  });

  it('hình mặc định không vẽ được thì không bày ô chọn, dù còn mục khác vẽ được', () => {
    const loi: string[] = [];

    for (const formula of CO_BIEU_DO) {
      const inputs = defaultInputs(formula.spec);
      for (const [tenTrangThai, ctx] of TRANG_THAI) {
        for (const level of ['basic', 'advanced'] as const) {
          const hinh = ve(formula, inputs, ctx, level);
          if (hinh.kind === 'unavailable' && hinh.options !== undefined) {
            loi.push(
              `${formula.spec.id} · ${tenTrangThai} · ${level}: bày ô chọn cho hình mặc định`,
            );
          }
        }
      }
    }

    expect(loi).toEqual([]);
  });

  /*
   * 10 phiên: mục mặc định của công thức có đường thời gian là "Thời gian". Bấm lại đúng nó (sau khi
   * sang mục khác) để lại `sweepKey` trong state; màn ấy phải giống hệt màn chưa bấm gì.
   */
  it('bấm lại đúng mục mặc định thì như chưa chọn: hỏng là không ô chọn', () => {
    const loi: string[] = [];
    let soCa = 0;

    for (const formula of CO_BIEU_DO) {
      const inputs = defaultInputs(formula.spec);
      const ctx = ctxVoi(10);
      for (const level of ['basic', 'advanced'] as const) {
        const moRa = ve(formula, inputs, ctx, level);
        if (moRa.kind !== 'unavailable') continue;
        const bamLai = ve(formula, inputs, ctx, level, '__time');
        if (bamLai.kind !== 'unavailable') continue;
        soCa += 1;
        if (bamLai.options !== undefined) {
          loi.push(`${formula.spec.id} · ${level}: bấm lại Thời gian thì bày ô chọn`);
        }
      }
    }

    expect(loi).toEqual([]);
    expect(soCa).toBeGreaterThan(0);
  });

  /*
   * Chọn một mục khi chuỗi đủ 250 phiên, rồi chuỗi chỉ còn 10 phiên (như nạp một mã Finbox): đúng
   * kiểu "số liệu đổi dưới chân một lựa chọn" chủ dự án gặp ở Thang đo.
   */
  it('mục đã tự chọn hết vẽ được: ô giữ mục ấy, câu báo nêu tên nó; ô chỉ còn khi có mục khác vẽ được', () => {
    const loi: string[] = [];
    let soCa = 0;

    for (const formula of CO_BIEU_DO) {
      const inputs = defaultInputs(formula.spec);
      for (const level of ['basic', 'advanced'] as const) {
        const day = ve(formula, inputs, ctxVoi(250), level);
        for (const option of day.options ?? []) {
          const hinh = ve(formula, inputs, ctxVoi(10), level, option.key);
          const noi = `${formula.spec.id} · ${level} · ${option.key}`;
          if (hinh.kind !== 'unavailable') {
            if (hinh.sweepKey !== option.key) loi.push(`${noi}: ra hình ${hinh.sweepKey}`);
            continue;
          }
          if (hinh.options === undefined) continue;
          soCa += 1;
          const khac = hinh.options.filter((muc) => muc.key !== option.key);
          if (hinh.sweepKey !== option.key) loi.push(`${noi}: ô chọn chỉ sang ${hinh.sweepKey}`);
          if (khac.length === 0) loi.push(`${noi}: ô chọn không còn mục nào khác`);
          if (!hinh.warning.message.vi.includes(`“${option.label.vi}”`)) {
            loi.push(`${noi}: câu báo không nêu tên mục "${option.label.vi}"`);
          }
        }
      }
    }

    expect(loi).toEqual([]);
    // Ca thật có tồn tại: Thời gian, Thang đo, phân phối… của các chỉ báo chu kỳ dài.
    expect(soCa).toBeGreaterThan(0);
  });
});
