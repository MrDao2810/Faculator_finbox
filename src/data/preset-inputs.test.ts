import { describe, expect, it } from 'vitest';

import { runFormula } from '@/core/calc';
import { FORMULA_MODULES, findFormulaModule } from '@/core/formulas';
import { MARKET_CONFIG, scheduleOrDefault } from '@/core/market';
import { defaultInputs } from '@/core/registry';
import type { FormulaModule } from '@/core/calc';

import { presetFillableKeys, presetInputs } from './preset-inputs';
import { SAMPLE_PRESETS } from './samples';

const CTX = { asOf: '2026-08-04', schedule: scheduleOrDefault(MARKET_CONFIG) };

function moduleOf(id: string): FormulaModule {
  const found = findFormulaModule(id);
  if (found === undefined) throw new Error(`Registry thiếu công thức '${id}'.`);
  return found;
}

const FPT = SAMPLE_PRESETS[0];
if (FPT === undefined) throw new Error('Bộ mẫu trống.');

const FIRST_CLOSE = FPT.bars[0]?.close ?? 0;
const LAST_CLOSE = FPT.bars[FPT.bars.length - 1]?.close ?? 0;

describe('presetInputs — điền đúng ô, đúng đơn vị', () => {
  it('chỉ trả khoá mà công thức thật sự có', () => {
    const filled = presetInputs(FPT, moduleOf('pe').spec);

    expect(Object.keys(filled).sort()).toEqual(['eps', 'price']);
    expect(filled.eps).toBe(FPT.fundamentals.eps);
    expect(filled.price).toBe(LAST_CLOSE);
  });

  it('công thức không liên quan tới mã nào thì trả rỗng — đó là câu trả lời đúng', () => {
    // Lãi kép nhận vốn và lãi suất của chính người dùng; không mã nào có thay họ được.
    expect(presetInputs(FPT, moduleOf('lai-kep').spec)).toEqual({});
    expect(presetInputs(FPT, moduleOf('cagr').spec)).toEqual({});
  });

  it('preset chỉ có MỘT phiên thì bỏ trống chân giá vào, không điền bằng chính phiên đó', () => {
    /*
     * Ca của preset dựng lúc chạy từ API Finbox — chỉ có thị giá hôm nay, không có lịch sử.
     * Điền cả hai chân bằng cùng một giá thì HPR ra đúng 0%: "mua và bán cùng một giá", một
     * tình huống vô nghĩa mà trông như đã nạp xong.
     */
    const motPhien = { ...FPT, bars: FPT.bars.slice(-1) };
    const filled = presetInputs(motPhien, moduleOf('hpr').spec);

    expect(filled.startPrice).toBeUndefined();
    expect(filled.endPrice).toBe(LAST_CLOSE);
  });

  it('chân giá vào lấy phiên ĐẦU, chân giá hiện tại lấy phiên CUỐI', () => {
    const filled = presetInputs(FPT, moduleOf('hpr').spec);

    expect(filled.startPrice).toBe(FIRST_CLOSE);
    expect(filled.endPrice).toBe(LAST_CLOSE);
    /*
     * Hai chân phải KHÁC nhau. Cùng lấy phiên cuối thì mọi công thức lãi lỗ nạp mẫu xong ra đúng
     * 0% — mua và bán cùng một giá — tức bộ mẫu bày ra một ca vô nghĩa.
     */
    expect(filled.startPrice).not.toBe(filled.endPrice);
  });
});

/*
 * ── Ca hồi quy của lỗi vốn hoá ────────────────────────────────────────────────────────────────
 *
 * Registry có HAI khoá cho số cổ phiếu, hai đơn vị khác nhau: `shares` tính bằng triệu CP (nhóm
 * Định giá), `sharesOutstanding` tính bằng CP (nhóm Chỉ số doanh nghiệp). Bảng ánh xạ cũ trong
 * `FormulaDetail.tsx` không điền khoá nào trong hai khoá đó, nên nạp FPT cho công thức vốn hoá ra
 * "giá FPT × 118 triệu CP mặc định" — sai hơn 12 lần, và trên màn không có gì nói là đã sai.
 */
describe('số cổ phiếu — hai khoá, hai đơn vị', () => {
  it('khoá shares nhận TRIỆU cổ phiếu', () => {
    const filled = presetInputs(FPT, moduleOf('von-hoa-thi-truong').spec);

    expect(filled.shares).toBeCloseTo(FPT.fundamentals.sharesOutstanding / 1_000_000, 6);
    expect(filled.price).toBe(LAST_CLOSE);
  });

  it('khoá sharesOutstanding nhận nguyên số cổ phiếu', () => {
    const filled = presetInputs(FPT, moduleOf('bvps').spec);

    expect(filled.sharesOutstanding).toBe(FPT.fundamentals.sharesOutstanding);
  });

  it('đơn vị trong Registry bị khoá lại — đổi đơn vị mà quên sửa map thì test đỏ, không phải người dùng nhận số sai', () => {
    const unitOf = (id: string, key: string) =>
      moduleOf(id).spec.variables.find((variable) => variable.key === key)?.unit;

    expect(unitOf('von-hoa-thi-truong', 'shares')).toBe('triệu CP');
    expect(unitOf('bvps', 'sharesOutstanding')).toBe('CP');
    expect(unitOf('roe', 'netIncome')).toBe('tỷ ₫');
    expect(unitOf('roe', 'equity')).toBe('tỷ ₫');
    expect(unitOf('pe', 'eps')).toBe('₫');
  });

  it('vốn hoá nạp từ bộ mẫu ra đúng con số tính tay', () => {
    const cap = moduleOf('von-hoa-thi-truong');
    const inputs = { ...defaultInputs(cap.spec), ...presetInputs(FPT, cap.spec) };
    const out = runFormula(cap, inputs, CTX);

    // giá (₫/CP) × số CP ÷ một tỷ = tỷ ₫
    const expected = (LAST_CLOSE * FPT.fundamentals.sharesOutstanding) / 1_000_000_000;

    expect(out.value).not.toBeNull();
    expect(out.value ?? 0).toBeCloseTo(expected, 6);
  });
});

/**
 * So khớp TƯƠNG ĐỐI — dùng cho các ca ở dưới đọc `netIncome` thật (không còn khép vòng tuyệt đối
 * như số bịa cũ, xem docblock ngay dưới).
 */
function expectCloseRelative(actual: number, expected: number, tolerance: number): void {
  expect(Math.abs(actual - expected) / Math.abs(expected)).toBeLessThan(tolerance);
}

/*
 * ── Vòng tròn khép kín — equity vẫn suy ra, netIncome giờ là số thật độc lập (Finbox_v2) ────────
 *
 * `equity` suy ra bằng `bvps × số CP` (script `gen:live-fundamentals` làm y hệt `wholeCompany()`
 * cũ), nên nạp bộ mẫu vào `bvps` vẫn phải trả về ĐÚNG con số BVPS đã khai — không lệch một xu.
 *
 * `netIncome` từ đợt Finbox_v2 KHÔNG còn suy ra từ `eps × số CP` nữa — là lợi nhuận 12 tháng gần
 * nhất đọc thẳng từ báo cáo (xem `scripts/gen-live-fundamentals.mjs`), độc lập với EPS công bố
 * (EPS pha loãng tính theo số CP bình quân gia quyền TRONG KỲ, không phải số CP CUỐI KỲ dùng ở
 * đây). Vòng khép kín `eps-co-ban`/`roe` vì vậy chỉ còn XẤP XỈ đúng — lệch quan sát được từ gần 0%
 * tới ~0,2% (MWG). Ngưỡng 2% có biên an toàn nhưng vẫn bắt được lỗi kỳ báo cáo/đơn vị thật sự
 * (bài học TTM-vs-luỹ-kế-từ-đầu-năm từng vá — lệch tới 63%, vượt xa 2%).
 */
describe('vòng khép kín equity, netIncome xấp xỉ EPS thật (Finbox_v2)', () => {
  for (const preset of SAMPLE_PRESETS) {
    it(`${preset.code}: nạp vào bvps ra lại đúng BVPS đã khai`, () => {
      const bvps = moduleOf('bvps');
      const inputs = { ...defaultInputs(bvps.spec), ...presetInputs(preset, bvps.spec) };

      // Độ chính xác 1 (không phải 6 như trước): `equity` sinh ra làm tròn 1 chữ số thập phân
      // (tỷ ₫) trong gen-live-fundamentals.mjs, nên đi vòng qua rồi chia lại lệch cỡ 0,01-0,02 ₫
      // trên số hàng chục nghìn — làm tròn hiển thị, không phải số bịa thêm.
      expect(runFormula(bvps, inputs, CTX).value ?? 0).toBeCloseTo(
        preset.fundamentals.bookValuePerShare,
        1,
      );
    });

    it(`${preset.code}: nạp vào eps-co-ban ra lại XẤP XỈ EPS đã khai`, () => {
      const eps = moduleOf('eps-co-ban');
      const inputs = { ...defaultInputs(eps.spec), ...presetInputs(preset, eps.spec) };

      expectCloseRelative(runFormula(eps, inputs, CTX).value ?? 0, preset.fundamentals.eps, 0.02);
    });

    it(`${preset.code}: ROE XẤP XỈ EPS chia BVPS`, () => {
      const roe = moduleOf('roe');
      const inputs = { ...defaultInputs(roe.spec), ...presetInputs(preset, roe.spec) };
      const { eps, bookValuePerShare } = preset.fundamentals;

      // ROE = LNST/VCSH; nếu netIncome khớp hệt eps×CP thì bằng eps/bvps — nay chỉ còn xấp xỉ.
      expectCloseRelative(
        runFormula(roe, inputs, CTX).value ?? 0,
        (eps / bookValuePerShare) * 100,
        0.02,
      );
    });
  }
});

describe('bảng ánh xạ không có khoá chết', () => {
  it('mọi khoá bộ mẫu điền được đều tồn tại trong Registry — chặn lỗi gõ sai tên', () => {
    const known = new Set(
      FORMULA_MODULES.flatMap((formula) => formula.spec.variables.map((v) => v.key)),
    );
    const orphans = presetFillableKeys(FPT).filter((key) => !known.has(key));

    expect(orphans, 'khoá này không công thức nào có — gõ sai tên hoặc biến đã bị xoá').toEqual([]);
  });

  /*
   * Phủ thật của bộ mẫu, khoá lại bằng số để không ai tưởng nó rộng hơn thực tế.
   *
   * Ba mức, và khoảng cách giữa chúng chính là phần còn thiếu:
   *
   *   51 công thức nhóm Cơ bản có biểu đồ
   *   22 điền được ÍT NHẤT một ô          ← trước đợt này là 14
   *    9 điền được TRỌN mọi ô             ← trước đợt này là 6; nạp mã là ra ngay số của mã
   *
   * Ba cái vừa thêm vào mức "trọn" là `bvps`, `roe` và `von-hoa-thi-truong` — hai cái đầu nhờ hai
   * trường suy ra, cái thứ ba là lỗ số cổ phiếu vừa bịt. `gia-muc-tieu` (công thức 109) đẩy mức
   * "một phần" lên 22: `eps` điền được từ báo cáo, nhưng `targetPe` là một lựa chọn của người
   * dùng — không báo cáo tài chính nào có sẵn P/E MỤC TIÊU. Mười hai công thức khác điền được một
   * phần thì phần thiếu đều là dòng báo cáo không suy ra được (doanh thu, tổng tài sản, tổng nợ)
   * hoặc ô thuộc quyết định của người dùng (số lượng mua, số tháng giữ, giá cắt lỗ). 25 công thức
   * cuối thì không mã nào điền thay được, vì đầu vào là tiền và giả định của chính người dùng.
   */
  it('phủ của bộ mẫu trên 53 công thức có biểu đồ: 22 điền một phần, 9 điền trọn', () => {
    const withChart = FORMULA_MODULES.filter(
      (formula) => formula.spec.chartType === 'sensitivity' && formula.spec.level === 'basic',
    );
    const some = withChart.filter(
      (formula) => Object.keys(presetInputs(FPT, formula.spec)).length > 0,
    );
    const all = withChart.filter(
      (formula) =>
        Object.keys(presetInputs(FPT, formula.spec)).length === formula.spec.variables.length,
    );

    expect(withChart).toHaveLength(53);
    expect(some).toHaveLength(22);
    expect(all).toHaveLength(9);
  });

  it('mọi giá trị điền ra đều là số hữu hạn — không NaN, không undefined (FR-06)', () => {
    for (const preset of SAMPLE_PRESETS) {
      for (const formula of FORMULA_MODULES) {
        for (const [key, value] of Object.entries(presetInputs(preset, formula.spec))) {
          expect(Number.isFinite(value), `${preset.code} · ${formula.spec.id} · ${key}`).toBe(true);
        }
      }
    }
  });
});
