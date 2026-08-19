/**
 * Bài test này là lưới an toàn của cả thư viện công thức.
 *
 * Nó KHÔNG liệt kê từng công thức: nó duyệt `FORMULA_MODULES` và chạy chính các ca kiểm thử
 * mà mỗi công thức tự khai trong `spec.tests`. Thêm công thức mới là ca của nó tự động vào đây,
 * không phải đăng ký ở đâu — đúng ý NFR-MNT-02, và không có chỗ nào để quên.
 */

import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import { formatFailures, runSpecTests } from '../calc/run-tests';
import type { CalcContext } from '../calc/types';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { createRegistry, defaultInputs } from '../registry/build';
import { errorsOnly, formatIssues } from '../registry/validate';
import { buildFeeBreakdown } from './fees';
import { ALL_FORMULAS, FORMULA_MODULES, findFormulaModule } from './index';
import {
  SCHEDULE_GAP,
  amortisationFor,
  buildAmortisation,
  condenseSchedule,
  condenseWithGaps,
} from './personal';
import { xirr } from './returns';

/** Ngày tra hằng số. Cố định để kết quả xác định (NFR-REL-03). */
const AS_OF = '2026-08-04';

const CTX: CalcContext = { asOf: AS_OF, schedule: scheduleOrDefault(MARKET_CONFIG) };

describe('mọi ca kiểm thử khai trong Registry đều phải đạt (NFR-MNT-02)', () => {
  for (const formula of FORMULA_MODULES) {
    it(`${formula.spec.id} — ${formula.spec.name.vi}`, () => {
      const failures = runSpecTests(formula, CTX);
      expect(formatFailures(failures)).toBe('');
    });
  }

  it('không công thức nào thiếu hàm tính, và tổng khớp tổng của 12 nhóm', () => {
    // KHÔNG viết cứng một con số: nhánh 5 đổ công thức theo từng đợt, con số cứng chỉ tạo ra
    // một chỗ phải sửa tay mỗi lần. Thứ đáng khoá là các BẤT BIẾN — spec luôn đi liền hàm
    // tính, và tổng không vượt trần SRS (ca riêng ở dưới).
    expect(FORMULA_MODULES.length).toBeGreaterThan(0);
    expect(ALL_FORMULAS).toHaveLength(FORMULA_MODULES.length);

    for (const spec of ALL_FORMULAS) {
      expect(findFormulaModule(spec.id), spec.id).toBeDefined();
    }
  });

  it('không trùng id — id đi thẳng vào URL nên trùng là hỏng route (FR-25)', () => {
    const ids = ALL_FORMULAS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Registry với toàn bộ công thức thật', () => {
  it('không còn lỗi nghiêm trọng nào', () => {
    const registry = createRegistry(ALL_FORMULAS);
    expect(formatIssues(errorsOnly(registry.issues))).toBe('');
  });

  it('mọi công thức đều có ít nhất một ca kiểm thử', () => {
    for (const spec of ALL_FORMULAS) {
      expect(spec.tests.length, spec.id).toBeGreaterThan(0);
    }
  });

  it('ví dụ trên màn chi tiết khớp đúng kết quả hàm tính (FR-02)', () => {
    for (const formula of FORMULA_MODULES) {
      const { id, example } = formula.spec;
      // Ví dụ của công thức chuỗi mang theo chuỗi giá riêng — bơm vào ctx thì mới kiểm được.
      const ctx: typeof CTX =
        example.series === undefined &&
        example.bars === undefined &&
        example.marketSeries === undefined &&
        example.cashflows === undefined
          ? CTX
          : {
              ...CTX,
              series: example.series,
              bars: example.bars,
              marketSeries: example.marketSeries,
              cashflows: example.cashflows,
            };
      const out = runFormula(formula, example.inputs, ctx);

      expect(out.value, `${id} — ví dụ phải tính được`).not.toBeNull();
      expect(Math.abs((out.value ?? 0) - example.expected), id).toBeLessThanOrEqual(1);
    }
  });

  /*
   * Lỗi thật đã gặp: bốn công thức thiếu `expression` nên màn chi tiết rơi về hiện LaTeX THÔ —
   * người dùng nhìn thấy `L_{rong} = Q\,(P_{ban} - P_{mua})`. Chỉ lộ ra khi mở màn ra nhìn,
   * không test nào bắt được. Hai ca dưới đây khoá lại.
   */
  it('mọi công thức có dòng công thức viết bằng chữ để hiện khi KaTeX còn hoãn', () => {
    for (const spec of ALL_FORMULAS) {
      expect(spec.expression?.trim(), spec.id).toBeTruthy();
    }
  });

  it('dòng đó phải đọc được — không lẫn ký hiệu LaTeX', () => {
    for (const spec of ALL_FORMULAS) {
      const expression = spec.expression ?? '';

      expect(expression, `${spec.id} còn dấu gạch chéo ngược của LaTeX`).not.toMatch(/\\/);
      expect(expression, `${spec.id} còn ngoặc nhọn của LaTeX`).not.toMatch(/[{}]/);
      // Dấu bằng bảo đảm đây là một công thức chứ không phải mẩu biểu thức rời.
      expect(expression, `${spec.id} thiếu dấu bằng`).toContain('=');
    }
  });

  /*
   * Cửa gác của chuỗi phụ thuộc (FR-15).
   *
   * `validate.ts` đã kiểm cạnh trỏ tới công thức có thật và biến có thật. Thứ nó KHÔNG kiểm được
   * là đơn vị: khai `fcff ──► gia-tri-hien-tai.futureValue` thì validator cho qua, mà chuỗi sẽ
   * đổ con số "300" đơn vị **tỷ ₫** vào một ô đơn vị **₫** — sai 9 chữ số, không cảnh báo nào,
   * không ca kiểm nào đỏ. Đúng loại lỗi mà FR-06 sinh ra để chặn, chỉ khác là nó ra một con số
   * trông hợp lệ thay vì NaN.
   */
  it('mọi cạnh dependsOn nối hai đầu CÙNG đơn vị (FR-15)', () => {
    const byId = new Map(ALL_FORMULAS.map((spec) => [spec.id, spec]));

    for (const spec of ALL_FORMULAS) {
      for (const dependency of spec.dependsOn ?? []) {
        const upstream = byId.get(dependency.formulaId);
        const variable = spec.variables.find((v) => v.key === dependency.variableKey);
        const canh = `${dependency.formulaId} → ${spec.id}.${dependency.variableKey}`;

        expect(upstream, `${canh}: không có công thức thượng nguồn`).toBeDefined();
        expect(variable, `${canh}: không có biến nhận`).toBeDefined();
        expect(variable?.unit, `${canh}: lệch đơn vị`).toBe(upstream?.resultUnit);
      }
    }
  });

  it('giá trị mặc định của thượng nguồn nằm trong miền của ô nhận', () => {
    // Không phải luật cứng — chuỗi cố ý KHÔNG kẹp giá trị thượng nguồn (xem `run-chain.ts`).
    // Nhưng nếu ngay bộ số mặc định đã lọt ra ngoài miền thì người dùng gặp ô đỏ ở lượt mở màn
    // đầu tiên, tức cạnh khai sai chỗ chứ không phải người dùng nhập sai.
    for (const formula of FORMULA_MODULES) {
      for (const dependency of formula.spec.dependsOn ?? []) {
        const upstream = findFormulaModule(dependency.formulaId);
        const variable = formula.spec.variables.find((v) => v.key === dependency.variableKey);
        if (upstream === undefined || variable === undefined) continue;

        const out = runFormula(upstream, defaultInputs(upstream.spec), CTX);
        const canh = `${dependency.formulaId} → ${formula.spec.id}.${dependency.variableKey}`;

        expect(out.value, `${canh}: thượng nguồn không tính được với số mặc định`).not.toBeNull();
        if (variable.min !== undefined) {
          expect(out.value ?? 0, `${canh}: dưới min`).toBeGreaterThanOrEqual(variable.min);
        }
        if (variable.max !== undefined) {
          expect(out.value ?? 0, `${canh}: trên max`).toBeLessThanOrEqual(variable.max);
        }
      }
    }
  });

  it('không nhóm nào vượt số công thức dự kiến của SRS 3.8', () => {
    const registry = createRegistry(ALL_FORMULAS);
    for (const category of registry.categories) {
      const count = registry.byCategory.get(category.id)?.length ?? 0;
      expect(count, category.name).toBeLessThanOrEqual(category.expectedCount);
    }
  });
});

describe('WF-08 — bảng bóc tách phí & thuế khớp từng đồng với wireframe', () => {
  const WF08 = { quantity: 1_000, months: 5, buyPrice: 92_000, sellPrice: 97_000 };

  it('bốn dòng chi phí đúng bằng con số wireframe dựng sẵn', () => {
    const { rows } = buildFeeBreakdown(WF08, CTX);

    expect(rows.map((r) => r.output.value)).toEqual([138_000, 145_500, 97_000, 1_350]);
  });

  it('chuỗi công thức hiện trong dòng đúng khuôn WF-08', () => {
    const { rows } = buildFeeBreakdown(WF08, CTX);

    expect(rows[0]?.formula).toBe('0,15% × 92.000.000 ₫');
    expect(rows[2]?.formula).toBe('0,10% × 97.000.000 ₫');
    expect(rows[3]?.formula).toContain('0,27 ₫/CP/tháng × 1.000 × 5');
  });

  it('tổng chi phí, giá hoà vốn, lãi ròng và ROI ròng đều khớp', () => {
    const b = buildFeeBreakdown(WF08, CTX);

    expect(b.totalCost.value).toBe(381_850);
    expect(b.breakEven.value).toBeCloseTo(92_370.28, 1);
    expect(b.grossProfit.value).toBe(5_000_000);
    expect(b.netProfit.value).toBe(4_618_150);
    expect(b.netRoi.value).toBeCloseTo(5.01, 2);
  });

  it('thiếu giá bán thì chỉ dòng liên quan báo thiếu, các dòng khác vẫn tính', () => {
    // Đúng câu WF-15: “Nhập giá bán để xem lợi nhuận ròng. Các ô còn lại đã đủ.”
    const b = buildFeeBreakdown({ quantity: 1_000, months: 5, buyPrice: 92_000 }, CTX);

    expect(b.rows[0]?.output.value).toBe(138_000);
    expect(b.rows[3]?.output.value).toBe(1_350);
    expect(b.rows[1]?.output.warning?.code).toBe('INCOMPLETE_INPUT');
    expect(b.netProfit.warning?.code).toBe('INCOMPLETE_INPUT');
    expect(b.netProfit.warning?.message).toContain('Giá bán');
  });

  it('giá hoà vốn không cần giá bán — mốc này phải hiện được trước khi bán', () => {
    const b = buildFeeBreakdown({ quantity: 1_000, months: 5, buyPrice: 92_000 }, CTX);
    expect(b.breakEven.value).toBeCloseTo(92_370.28, 1);
  });

  it('không có biểu phí thì báo lỗi chứ không lặng lẽ tính bằng 0', () => {
    const b = buildFeeBreakdown(WF08, { asOf: AS_OF });

    expect(b.rows.every((r) => r.output.value === null)).toBe(true);
    expect(b.totalCost.value).toBeNull();
  });
});

describe('WF-14 — lịch trả nợ', () => {
  const WF14 = { amount: 800_000_000, rate: 9.5, years: 20, method: 1 };

  it('dư nợ kỳ cuối về đúng 0, không để lại vài đồng lẻ', () => {
    const rows = amortisationFor(WF14) ?? [];

    expect(rows).toHaveLength(240);
    expect(rows[rows.length - 1]?.balance).toBe(0);
  });

  it('tổng gốc đã trả đúng bằng số tiền vay', () => {
    const rows = amortisationFor(WF14) ?? [];
    const principal = rows.reduce((s, r) => s + r.principal, 0);

    expect(principal).toBeCloseTo(800_000_000, 2);
  });

  it('niên kim trả đều nhau ở mọi kỳ trừ kỳ cuối', () => {
    const rows = amortisationFor(WF14) ?? [];
    const first = rows[0]?.payment ?? 0;

    for (const row of rows.slice(0, -1)) {
      expect(Math.abs(row.payment - first)).toBeLessThan(0.01);
    }
  });

  it('gốc đều thì phần gốc bằng nhau và khoản trả giảm dần', () => {
    const rows = buildAmortisation(800_000_000, 9.5, 20, 'equalPrincipal') ?? [];

    expect(rows[0]?.principal).toBeCloseTo(rows[100]?.principal ?? 0, 6);
    expect(rows[0]?.payment ?? 0).toBeGreaterThan(rows[239]?.payment ?? 0);
  });

  it('gốc đều tổng lãi thấp hơn niên kim ở cùng kỳ hạn', () => {
    const sumInterest = (m: 'annuity' | 'equalPrincipal'): number =>
      (buildAmortisation(800_000_000, 9.5, 20, m) ?? []).reduce((s, r) => s + r.interest, 0);

    expect(sumInterest('equalPrincipal')).toBeLessThan(sumInterest('annuity'));
  });

  it('kỳ hạn 0 thì trả null chứ không lặp vô hạn', () => {
    expect(buildAmortisation(800_000_000, 9.5, 0, 'annuity')).toBeNull();
  });

  it('rút gọn giữ 12 kỳ đầu, mốc cuối mỗi năm và kỳ cuối', () => {
    const rows = amortisationFor(WF14) ?? [];
    const shown = condenseSchedule(rows);
    const periods = shown.map((r) => r.period);

    expect(periods.slice(0, 12)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(periods).toContain(24);
    expect(periods).toContain(240);
    expect(shown.length).toBeLessThan(rows.length);
  });

  it('lịch ngắn hơn số kỳ giữ lại thì không rút gọn gì', () => {
    const rows = buildAmortisation(100_000_000, 8, 1, 'annuity') ?? [];
    expect(condenseSchedule(rows, 12)).toHaveLength(12);
  });

  it('đánh dấu ĐÚNG những chỗ đã bỏ bớt kỳ, không đánh dấu chỗ liền mạch', () => {
    const rows = amortisationFor(WF14) ?? [];
    const cells = condenseWithGaps(rows);

    // 12 kỳ đầu liền mạch nên không được chèn dấu nào vào giữa.
    expect(cells.slice(0, 12).every((cell) => cell !== SCHEDULE_GAP)).toBe(true);

    // Giữa kỳ 12 và kỳ 24 có 11 kỳ bị bỏ — phải đúng một dấu ở đó.
    expect(cells[12]).toBe(SCHEDULE_GAP);
    expect(cells[13]).toMatchObject({ period: 24 });

    // Số kỳ thật giữ nguyên như bản không có dấu; dấu chỉ là thứ thêm vào để hiện.
    const real = cells.filter((cell) => cell !== SCHEDULE_GAP);
    expect(real).toHaveLength(condenseSchedule(rows).length);
  });

  it('lịch không bị rút gọn thì không có dấu bỏ bớt nào', () => {
    const rows = buildAmortisation(100_000_000, 8, 1, 'annuity') ?? [];
    expect(condenseWithGaps(rows, 12)).not.toContain(SCHEDULE_GAP);
  });

  it('lịch rỗng thì trả mảng rỗng chứ không trả một dấu bơ vơ', () => {
    expect(condenseWithGaps([])).toEqual([]);
  });
});

describe('xirr() — phần toán đã xong, chờ bảng dòng tiền của gói 3.3.1', () => {
  it('một khoản chi và một khoản thu sau đúng một năm', () => {
    const rate = xirr([
      { date: '2025-01-01', amount: -100_000_000 },
      { date: '2026-01-01', amount: 110_000_000 },
    ]);

    expect(rate).not.toBeNull();
    expect((rate ?? 0) * 100).toBeCloseTo(10, 1);
  });

  it('chuỗi góp đều rồi rút một lần', () => {
    const rate = xirr([
      { date: '2025-01-01', amount: -10_000_000 },
      { date: '2025-04-01', amount: -10_000_000 },
      { date: '2025-07-01', amount: -10_000_000 },
      { date: '2026-01-01', amount: 32_000_000 },
    ]);

    expect(rate).not.toBeNull();
    expect(rate ?? 0).toBeGreaterThan(0);
  });

  it('lỗ thì suất sinh lợi âm', () => {
    const rate = xirr([
      { date: '2025-01-01', amount: -100_000_000 },
      { date: '2026-01-01', amount: 80_000_000 },
    ]);

    expect(rate ?? 0).toBeLessThan(0);
  });

  it('toàn dòng tiền cùng dấu thì không có nghiệm — trả null chứ không trả 0', () => {
    expect(
      xirr([
        { date: '2025-01-01', amount: 100_000 },
        { date: '2026-01-01', amount: 200_000 },
      ]),
    ).toBeNull();
  });

  it('dưới hai dòng tiền thì không tính được', () => {
    expect(xirr([{ date: '2025-01-01', amount: -100_000 }])).toBeNull();
  });

  it('ngày sai định dạng thì trả null, không ném lỗi', () => {
    expect(
      xirr([
        { date: 'hôm qua', amount: -100_000 },
        { date: '2026-01-01', amount: 200_000 },
      ]),
    ).toBeNull();
  });

  it('không phụ thuộc thứ tự dòng tiền truyền vào', () => {
    const flows = [
      { date: '2026-01-01', amount: 110_000_000 },
      { date: '2025-01-01', amount: -100_000_000 },
    ];
    expect((xirr(flows) ?? 0) * 100).toBeCloseTo(10, 1);
  });
});
