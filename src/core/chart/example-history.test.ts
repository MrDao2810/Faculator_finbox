import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext } from '../calc/types';
import { FORMULA_MODULES } from '../formulas';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { defaultInputs } from '../registry/build';
import { buildChartModel } from './build';
import { HISTORY_KEY } from './history';

/*
 * ── Nút "Xem ví dụ minh hoạ" phải nạp một hình ĐỌC ĐƯỢC ──────────────────────────────────────
 *
 * Chủ dự án chụp màn `chuoi-phien-giam-dai-nhat` sau khi bấm nút ấy (14/10/2026): cả khung gạch
 * chéo, một mẩu đường ở mép phải. Ví dụ nạp chuỗi FPT 57 phiên mà cửa sổ của chính ví dụ là 55
 * phiên, nên chỉ 3/57 phiên có số; Beta còn 1/71, tám tỷ số rủi ro 12/71. *"ví dụ minh hoạ phải
 * nhiều để không bị lỗi chút ít ở góc phải"*, rồi *"cái gạch gạch ấy có thao tác được đâu"*.
 *
 * Ca này dựng đúng hình mà màn chi tiết dựng sau cú bấm — `applyExample()` ở `FormulaDetail`:
 * bảng nến `example.dataset.rows` vào `ctx.bars`, cột đóng cửa vào `ctx.series`,
 * `example.marketSeries` (nếu có) vào `ctx.marketSeries`, ô nhập là mặc định đè bằng
 * `example.inputs`, trục là thời gian. Rồi đòi hai điều:
 *
 *   · Đường LIỀN: sau phiên có số đầu tiên không còn phiên gạch chéo nào. Phần gạch chéo được
 *     phép ở đầu trục — đó là những phiên chưa đủ cửa sổ, công thức nào có cửa sổ cũng có — nhưng
 *     không được chen vào giữa hình, chỗ người dùng đang rê chuột đọc.
 *   · Phủ ít nhất `PHU_TOI_THIEU` trục. Đo ngày 14/10/2026 trên chuỗi 250 phiên: thấp nhất là
 *     `he-so-bien-thien` 64% (STB, cửa sổ 90 phiên), rồi Beta 76%, nhóm cửa sổ 55 phiên 78%; mọi
 *     chỉ báo kỹ thuật từ 87% trở lên. Hạ ngưỡng này là quay về đúng ảnh chủ dự án đã chụp.
 */
const PHU_TOI_THIEU = 0.6;

const CO_CHUOI = FORMULA_MODULES.filter((m) => m.spec.example.dataset !== undefined);

function hinhSauKhiBam(id: string) {
  const formula = CO_CHUOI.find((m) => m.spec.id === id);
  if (formula === undefined) throw new Error(`Không có ví dụ chuỗi '${id}'.`);
  const { example } = formula.spec;
  const rows = example.dataset?.rows ?? [];
  const ctx: CalcContext = {
    asOf: '2026-09-15',
    schedule: scheduleOrDefault(MARKET_CONFIG),
    bars: rows,
    series: rows
      .map((row) => row.close)
      .filter((close): close is number => typeof close === 'number' && close > 0),
    ...(example.marketSeries === undefined ? {} : { marketSeries: example.marketSeries }),
  };
  const inputs = { ...defaultInputs(formula.spec), ...example.inputs };
  return buildChartModel({
    formula,
    inputs,
    ctx,
    output: runFormula(formula, inputs, ctx),
    level: 'advanced',
    sweepKey: HISTORY_KEY,
  });
}

describe('hình theo thời gian ngay sau khi bấm "Xem ví dụ minh hoạ"', () => {
  it('đủ 35 công thức có chuỗi ví dụ — thêm hay bớt một cái thì đọc lại ca này', () => {
    expect(CO_CHUOI).toHaveLength(35);
  });

  it.each(CO_CHUOI.map((m) => m.spec.id))('%s vẽ một đường liền, phủ phần lớn trục', (id) => {
    const model = hinhSauKhiBam(id);
    if (model.kind !== 'line') throw new Error(`${id}: hình không vẽ được (${model.kind}).`);

    const coSo = model.points.map((point) => point.y !== null);
    const dau = coSo.indexOf(true);
    expect(dau, `${id}: không phiên nào có số`).toBeGreaterThanOrEqual(0);

    const gachGiua = coSo.slice(dau).filter((co) => !co).length;
    expect(gachGiua, `${id}: phiên gạch chéo chen giữa hình`).toBe(0);

    const phu = coSo.filter(Boolean).length / coSo.length;
    expect(phu, `${id}: chỉ ${String(Math.round(phu * 100))}% trục có số`).toBeGreaterThanOrEqual(
      PHU_TOI_THIEU,
    );
  });
});
