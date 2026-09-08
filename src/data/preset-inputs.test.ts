import { describe, expect, it } from 'vitest';

import { runFormula } from '@/core/calc';
import { FORMULA_MODULES, findFormulaModule } from '@/core/formulas';
import { MARKET_CONFIG, scheduleOrDefault } from '@/core/market';
import { defaultInputs } from '@/core/registry';
import type { FormulaModule } from '@/core/calc';

import {
  presetFillableKeys,
  presetFillableUnits,
  presetInputs,
  presetRealKeys,
} from './preset-inputs';
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

  /*
   * ── Cửa đơn vị: khoá trùng tên, khác nghĩa ────────────────────────────────────────────────
   *
   * `equity` là "vốn chủ sở hữu doanh nghiệp" (tỷ ₫) ở `bvps`/`roe`/`no-tren-von-chu`/`wacc`,
   * nhưng ở `don-bay-hieu-dung` nó là "Vốn thực có trong TÀI KHOẢN" (₫). Trước cửa đơn vị, nạp
   * FPT vào công thức đòn bẩy đổ 39.851,2 vào ô tính bằng đồng — sai một tỷ lần, mà con số ấy vẫn
   * nằm gọn trong miền `0…100 tỷ` nên không cảnh báo nào bật. Người dùng nhận một mức đòn bẩy
   * trông hoàn toàn bình thường.
   */
  it('khoá trùng tên khác ĐƠN VỊ thì không điền — vốn chủ 39.851,2 tỷ ₫ không được rơi vào ô ₫', () => {
    const donBay = moduleOf('don-bay-hieu-dung');

    expect(donBay.spec.variables.find((v) => v.key === 'equity')?.unit).toBe('₫');
    expect(presetInputs(FPT, donBay.spec)).toEqual({});
  });

  it('cùng khoá, đúng đơn vị thì vẫn điền — cửa đơn vị không chặn nhầm ca hợp lệ', () => {
    expect(presetInputs(FPT, moduleOf('roe').spec).equity).toBe(FPT.fundamentals.equity);
    expect(presetInputs(FPT, moduleOf('wacc').spec).equity).toBe(FPT.fundamentals.equity);
  });

  /*
   * ── Chân giá VÀO của bộ mẫu là giá DỰNG, không phải giá mã ấy từng có ──────────────────────
   *
   * Chủ dự án bắt được ca này trên màn: nạp VIC cho `loi-nhuan-rong` thì ô "Giá mua" hiện 318.750 ₫
   * kèm dấu "↳ VIC", trong khi thị giá thật của VIC là 243.500 ₫. `makeBars()` neo chuỗi ở phiên
   * CUỐI, nên `bars[0].close` là một phiên PRNG — 318.750 là mức giá VIC chưa từng có, mà màn lại
   * khẳng định nó là số của VIC. Đúng loại sai FR-06 chặn, chỉ khác là nằm ở nhãn chứ không ở số.
   *
   * `presetInputs()` VẪN điền (bộ mẫu bày ra tình huống "mua đầu kỳ, bán phiên gần nhất"),
   * `presetRealKeys()` thì không — và giao diện chỉ được gắn nhãn theo cái thứ hai.
   */
  it('bộ mẫu bản thảo: chân giá vào ĐƯỢC điền nhưng KHÔNG tính là số thật của mã', () => {
    const hpr = moduleOf('hpr').spec;

    expect(FPT.isDraft).toBe(true);
    // Vẫn có số để tính — ô không bị bỏ trống.
    expect(presetInputs(FPT, hpr).startPrice).toBe(FIRST_CLOSE);

    const real = presetRealKeys(FPT, hpr);
    expect(real.has('startPrice')).toBe(false);
    // Chân giá HIỆN TẠI thì thật: `makeBars()` neo đúng phiên cuối vào thị giá thật.
    expect(real.has('endPrice')).toBe(true);
    expect(real.has('dividend')).toBe(true);
  });

  it('preset LIVE (1 phiên, không phải bản thảo) thì mọi ô điền được đều là số thật', () => {
    // Cắt còn một phiên là đúng hình dạng preset dựng từ API — nó không có chân giá vào để mà dựng.
    const live = { ...FPT, bars: FPT.bars.slice(-1), isDraft: false };
    const hpr = moduleOf('hpr').spec;

    expect(Object.keys(presetInputs(live, hpr)).sort()).toEqual(
      [...presetRealKeys(live, hpr)].sort(),
    );
  });

  /*
   * Quét toàn Registry để con số này không lặng lẽ phình ra: mỗi công thức lọt vào đây là một màn
   * hình có ô mang số dựng, và giao diện phải kể tên ô ấy trong dải "điền được N/M ô".
   */
  it('đúng 7 công thức có ô nhận giá dựng — ghim lại để không ai thêm âm thầm', () => {
    const bip = FORMULA_MODULES.filter((formula) => {
      const dien = Object.keys(presetInputs(FPT, formula.spec));
      const that = presetRealKeys(FPT, formula.spec);
      return dien.some((key) => !that.has(key));
    }).map((formula) => formula.spec.id);

    expect(bip.sort()).toEqual([
      'co-lenh-rui-ro',
      'gia-hoa-von',
      'hpr',
      'loi-nhuan-rong',
      'loi-suat-quy-nam-theo-ngay',
      'phi-giao-dich-mua',
      'roi-rong',
    ]);
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

      /*
       * Ngưỡng TƯƠNG ĐỐI, không tuyệt đối.
       *
       * `equity` sinh ra làm tròn 1 chữ số thập phân (tỷ ₫) trong `gen-live-fundamentals.mjs`,
       * nên đi vòng qua rồi chia lại luôn lệch một chút. Phần lệch ấy tỉ lệ với chính BVPS: bốn
       * mã đầu lệch 0,01-0,02 ₫, còn BMP lệch 0,57 ₫ — vẫn là 0,0016%, cùng một hiện tượng.
       * Ngưỡng tuyệt đối ±0,05 ₫ vì thế nghiêm với mã giá cao và lỏng với mã giá thấp, tức đo
       * sai thứ nó định đo. 0,01% có biên rộng cho phép làm tròn mà vẫn bắt được lỗi đơn vị
       * (lệch đơn vị là sai gấp 1.000 lần, không phải 0,002%).
       */
      expectCloseRelative(
        runFormula(bvps, inputs, CTX).value ?? 0,
        preset.fundamentals.bookValuePerShare,
        0.0001,
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
   * Song sinh của ca trên, cho cột đơn vị. Cửa đơn vị trong `presetInputs()` khớp `variable.unit`
   * theo chuỗi, nên một đơn vị gõ sai (`'tỷ đ'` thay vì `'tỷ ₫'`) không làm gì đỏ cả — nó chỉ
   * lặng lẽ thôi điền, và bộ mẫu nghèo đi mà không ai biết. Ca này bắt đúng ca đó.
   */
  it('không có đơn vị chết — mọi đơn vị bộ mẫu khai đều tồn tại trong Registry', () => {
    const known = new Set(
      FORMULA_MODULES.flatMap((formula) => formula.spec.variables.map((v) => v.unit)),
    );
    const orphans = presetFillableUnits(FPT).filter((unit) => !known.has(unit));

    expect(
      orphans,
      'đơn vị này không biến nào khai — gõ sai, hoặc Registry đã đổi cách viết',
    ).toEqual([]);
  });

  /*
   * Phủ thật của bộ mẫu, khoá lại bằng số để không ai tưởng nó rộng hơn thực tế.
   *
   * Ba mức, và khoảng cách giữa chúng chính là phần còn thiếu:
   *
   *   53 công thức nhóm Cơ bản có biểu đồ
   *   23 điền được ÍT NHẤT một ô          ← trước đợt mở rộng là 22
   *   14 điền được TRỌN mọi ô             ← trước đợt mở rộng là 9; nạp mã là ra ngay số của mã
   *
   * Mức "trọn" nhảy từ 9 lên 14 nhờ năm trường mở rộng của `Fundamentals` cộng hai alias trong
   * `candidates()`: `roa` và `vong-quay-tong-tai-san` có `totalAssets`, `bien-loi-nhuan-rong` và
   * `ps` có `revenue`/`salesPerShare`, `no-tren-von-chu` có `totalLiabilities`. Cả năm trước đây
   * đều đứng ở mức "một phần" — tức nạp mã xong màn vẫn trộn một ô số mặc định vào mà không nói gì.
   *
   * Hai chuyển động NGƯỢC chiều ở đợt tách khoá, và cả hai đều đúng: `diem-hoa-von` rời khỏi mức
   * "một phần" vì ô `price` của nó tên đầy đủ là "Giá bán một sản phẩm" — thị giá cổ phiếu rơi vào
   * đó là con số vô nghĩa đội lốt dữ liệu thật; `don-bay-hieu-dung` rụng khỏi `LIVE_PRESET_FORMULAS`
   * vì ô `equity` của nó tính bằng ₫ chứ không phải tỷ ₫ (xem ca "khoá trùng tên khác ĐƠN VỊ"), tuy
   * nó không thuộc nhóm `sensitivity`+`basic` nên không đổi con số ở đây.
   *
   * `gia-muc-tieu` là ví dụ rõ nhất của mức "một phần" còn lại: `eps` điền được từ báo cáo, nhưng
   * `targetPe` là một lựa chọn của người dùng — không báo cáo tài chính nào có sẵn P/E MỤC TIÊU.
   * Tám công thức một phần kia thì phần thiếu hoặc là dòng bảng cân đối / lưu chuyển tiền tệ mà API
   * Finbox không có (`cash`, `currentAssets`, `preferredDividend`), hoặc là ô thuộc quyết định của
   * người dùng (số lượng mua, số tháng giữ, giá cắt lỗ). Số còn lại thì không mã nào điền thay
   * được, vì đầu vào là tiền và giả định của chính người dùng.
   */
  it('phủ của bộ mẫu trên 53 công thức có biểu đồ: 23 điền một phần, 14 điền trọn', () => {
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
    expect(some).toHaveLength(23);
    expect(all).toHaveLength(14);
  });

  /*
   * Ba trường mở rộng đắt giá nhất, ghim bằng ĐÚNG ô mà chúng lấp — không ghim bằng con số tổng.
   *
   * Con số tổng ở ca trên nói "14 công thức nạp trọn" nhưng không nói *nhờ đâu*; nếu sau này ai gỡ
   * `revenue` khỏi `Fundamentals` mà đồng thời một công thức khác vừa lên trọn, con số vẫn 14 và
   * không gì đỏ. Ca này ghim quan hệ thật: khoá nào của công thức nào được điền từ trường nào.
   */
  it('ba dòng báo cáo mới lấp đúng ô của chúng', () => {
    expect(Object.keys(presetInputs(FPT, moduleOf('roa').spec)).sort()).toEqual([
      'netIncome',
      'totalAssets',
    ]);
    expect(Object.keys(presetInputs(FPT, moduleOf('bien-loi-nhuan-rong').spec)).sort()).toEqual([
      'netIncome',
      'revenue',
    ]);
    expect(Object.keys(presetInputs(FPT, moduleOf('no-tren-von-chu').spec)).sort()).toEqual([
      'equity',
      'totalLiabilities',
    ]);
  });

  it('hai alias lấp nốt ô mà dữ liệu đã nằm sẵn trong tay', () => {
    // `so-graham` gọi giá trị sổ sách là `bvps`, `pb` gọi là `bookValuePerShare` — cùng một số.
    const graham = presetInputs(FPT, moduleOf('so-graham').spec);
    expect(graham.bvps).toBe(FPT.fundamentals.bookValuePerShare);
    expect(Object.keys(graham).sort()).toEqual(['bvps', 'eps']);

    // `salesPerShare` suy từ doanh thu, không lưu thành trường riêng — xem `candidates()`.
    const ps = presetInputs(FPT, moduleOf('ps').spec);
    expect(ps.salesPerShare).toBeCloseTo(
      ((FPT.fundamentals.revenue ?? 0) * 1e9) / FPT.fundamentals.sharesOutstanding,
      6,
    );
  });

  /*
   * `ev` có khoá `totalDebt` nghĩa "Nợ vay" — hẹp hơn hẳn tổng nợ phải trả mà bộ mẫu đang cầm, và
   * cùng đơn vị tỷ ₫ nên cửa đơn vị không tách được. Ô ấy phải để trống cho người dùng tự nhập;
   * đổ tổng nợ vào là giá trị doanh nghiệp thổi phồng đúng bằng phần nợ chiếm dụng.
   */
  it('KHÔNG đổ tổng nợ phải trả vào ô "Nợ vay" của giá trị doanh nghiệp', () => {
    const ev = presetInputs(FPT, moduleOf('ev').spec);

    expect(ev.totalDebt).toBeUndefined();
    expect(Object.keys(ev)).toEqual(['marketCap']);
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
