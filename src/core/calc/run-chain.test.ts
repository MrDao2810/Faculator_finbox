/**
 * Chuỗi công thức nối nhau — vế thứ hai của FR-15 (gói WBS 5.2.3).
 *
 * Hai lớp ca kiểm, cố ý tách:
 *   · **chuỗi thật** trong Registry (CAPM → Mô hình Gordon → Biên an toàn) — chốt rằng cạnh khai
 *     trong `valuation-dcf.ts` chạy được, đơn vị khớp, và số ra đúng phép tính tay;
 *   · **fixture tự dựng** — chốt các nhánh mà chuỗi thật không có: đồ thị vòng, công thức đọc
 *     `ctx.upstream`, chuỗi rỗng.
 *
 * Con số kỳ vọng tính độc lập bằng dạng đóng trước khi viết, không chép từ kết quả hàm chạy ra.
 */

import { describe, expect, it } from 'vitest';

import { fail, ok } from '../calc-output';
import { meaningless } from '../warnings';
import { FORMULA_MODULES, findFormulaModule } from '../formulas';
import { defaultInputs } from '../registry/build';
import type { FormulaSpec } from '../registry/types';
import { runFormula } from './run';
import { chainFor, runChain } from './run-chain';
import type { ChainInputs } from './run-chain';
import type { CalcContext, FormulaModule } from './types';

const CTX: CalcContext = { asOf: '2026-08-04' };

const CAPM = requireModule('capm');
const GORDON = requireModule('mo-hinh-gordon');
const MOS = requireModule('bien-an-toan');

/** Chuỗi ba bước theo đúng thứ tự khai trong Registry. */
const CHUOI = [CAPM, GORDON, MOS];

function requireModule(id: string): FormulaModule {
  const found = findFormulaModule(id);
  if (found === undefined) throw new Error(`Registry thiếu công thức '${id}'.`);
  return found;
}

/** Bộ ô nhập mặc định cho cả chuỗi — đúng thứ người dùng thấy khi vừa mở màn. */
function inputsMacDinh(modules: ReadonlyArray<FormulaModule> = CHUOI): ChainInputs {
  return Object.fromEntries(modules.map((m) => [m.spec.id, defaultInputs(m.spec)]));
}

/** Bộ ô nhập của chuỗi, sửa vài ô của một công thức. */
function inputsVoi(id: string, sua: Readonly<Record<string, number>>): ChainInputs {
  const base = inputsMacDinh();
  return { ...base, [id]: { ...base[id], ...sua } };
}

/*
 * ── Chuỗi thật trong Registry ───────────────────────────────────────────────────────────────
 */

describe('chuỗi định giá CAPM → Gordon → Biên an toàn', () => {
  it('chạy đúng thứ tự topo suy từ dependsOn, không theo thứ tự mảng truyền vào', () => {
    // Truyền NGƯỢC thứ tự để chứng minh thứ tự đến từ đồ thị chứ không từ mảng.
    const chain = runChain({ modules: [MOS, GORDON, CAPM], inputs: inputsMacDinh(), ctx: CTX });

    expect(chain.steps.map((s) => s.formulaId)).toEqual(['capm', 'mo-hinh-gordon', 'bien-an-toan']);
    expect(chain.steps.map((s) => s.depth)).toEqual([0, 1, 2]);
    expect(chain.cyclic).toEqual([]);
  });

  it('kết quả CAPM chảy vào ô "Suất sinh lợi yêu cầu" của Gordon', () => {
    const chain = runChain({ modules: CHUOI, inputs: inputsMacDinh(), ctx: CTX });

    // 3,5 + 1,2 × 8 = 13,1%
    expect(chain.byId.get('capm')?.output.value).toBeCloseTo(13.1, 6);

    // 2.000 × 1,05 ÷ (0,131 − 0,05) = 2.100 ÷ 0,081 = 25.925,9259 ₫
    expect(chain.byId.get('mo-hinh-gordon')?.output.value).toBeCloseTo(25_925.9259, 3);

    // (25.925,9259 − 30.000) ÷ 25.925,9259 × 100 = −15,7142857%
    expect(chain.byId.get('bien-an-toan')?.output.value).toBeCloseTo(-15.7142857, 5);
  });

  it('ô móc nối mang đủ dữ liệu để giao diện dựng LinkedInput', () => {
    const chain = runChain({ modules: CHUOI, inputs: inputsMacDinh(), ctx: CTX });

    expect(chain.byId.get('capm')?.fields).toEqual([]);

    const field = chain.byId.get('mo-hinh-gordon')?.fields[0];
    expect(field?.spec.key).toBe('requiredReturn');
    expect(field?.upstream.formulaId).toBe('capm');
    expect(field?.upstream.label.vi).toBe(CAPM.spec.name.vi);
    expect(field?.linked.mode).toBe('linked');
    expect(field?.linked.value).toBeCloseTo(13.1, 6);
    expect(field?.override).toBeUndefined();
  });

  it('thượng nguồn lỗi thì bước dưới ra INHERITED, KHÔNG phải INCOMPLETE_INPUT', () => {
    // beta −1,5 kéo chi phí vốn chủ xuống âm → CAPM fail MEANINGLESS.
    const chain = runChain({
      modules: CHUOI,
      inputs: inputsVoi('capm', { riskFree: 2, beta: -1.5, erp: 8 }),
      ctx: CTX,
    });

    expect(chain.byId.get('capm')?.output.warning?.code).toBe('MEANINGLESS');

    const gordon = chain.byId.get('mo-hinh-gordon');
    expect(gordon?.output.value).toBeNull();
    // Đây là ca chống hồi quy quan trọng nhất của cả gói: đi thẳng vào runFormula() với ô móc
    // nối để trống sẽ ra INCOMPLETE_INPUT — báo sai nguyên nhân cho một ô người dùng không hề
    // bỏ trống. Mạch phải bị cắt trước đó.
    expect(gordon?.output.warning?.code).toBe('INHERITED');
  });

  it('câu cảnh báo kế thừa gọi đúng tên công thức nguồn và tên ô để ghi đè', () => {
    const chain = runChain({
      modules: CHUOI,
      inputs: inputsVoi('capm', { riskFree: 2, beta: -1.5, erp: 8 }),
      ctx: CTX,
    });
    const warning = chain.byId.get('mo-hinh-gordon')?.output.warning;

    expect(warning?.message.vi).toContain(CAPM.spec.name.vi);
    expect(warning?.fix?.vi).toContain(CAPM.spec.name.vi);
    expect(warning?.fix?.vi).toContain('Suất sinh lợi yêu cầu (r)');
  });

  it('lỗi lan qua hai tầng: CAPM hỏng thì cả Gordon lẫn Biên an toàn đều kế thừa', () => {
    const chain = runChain({
      modules: CHUOI,
      inputs: inputsVoi('capm', { riskFree: 2, beta: -1.5, erp: 8 }),
      ctx: CTX,
    });

    const mos = chain.byId.get('bien-an-toan');
    expect(mos?.output.value).toBeNull();
    expect(mos?.output.warning?.code).toBe('INHERITED');
    // Nói tên bước NGAY TRƯỚC nó, không phải tên gốc rễ — người dùng lần ngược từng bước một.
    expect(mos?.output.warning?.message.vi).toContain(GORDON.spec.name.vi);
  });

  it('ghi đè thắng cả khi thượng nguồn đang lỗi — đúng lối thoát WF-15 hứa', () => {
    const chain = runChain({
      modules: CHUOI,
      inputs: inputsVoi('capm', { riskFree: 2, beta: -1.5, erp: 8 }),
      overrides: { 'mo-hinh-gordon': { requiredReturn: 12 } },
      ctx: CTX,
    });

    // 2.000 × 1,05 ÷ 0,07 = 30.000 ₫ — chuỗi chạy tiếp dù CAPM vẫn đang hỏng.
    expect(chain.byId.get('mo-hinh-gordon')?.output.value).toBeCloseTo(30_000, 6);
    expect(chain.byId.get('mo-hinh-gordon')?.fields[0]?.linked.mode).toBe('overridden');

    // (30.000 − 30.000) ÷ 30.000 = 0% — bước cuối thoát khỏi cảnh báo kế thừa theo.
    expect(chain.byId.get('bien-an-toan')?.output.value).toBeCloseTo(0, 6);
  });

  it('ghi đè bằng 0 vẫn là ghi đè, không bị coi là chưa ghi đè', () => {
    const chain = runChain({
      modules: CHUOI,
      inputs: inputsMacDinh(),
      overrides: { 'bien-an-toan': { intrinsic: 0 } },
      ctx: CTX,
    });

    // Giá trị nội tại 0 thì biên an toàn chia cho 0 — đúng nhánh lỗi của chính công thức đó,
    // chứ không phải rơi về giá trị 25.925 ₫ mà Gordon đang cấp.
    expect(chain.byId.get('bien-an-toan')?.output.warning?.code).toBe('DIVIDE_BY_ZERO');
  });

  it('ghi đè bằng giá trị không hữu hạn thì bỏ qua, ô quay về nhận tự động', () => {
    const chain = runChain({
      modules: CHUOI,
      inputs: inputsMacDinh(),
      overrides: { 'mo-hinh-gordon': { requiredReturn: Number.NaN } },
      ctx: CTX,
    });

    expect(chain.byId.get('mo-hinh-gordon')?.fields[0]?.linked.mode).toBe('linked');
    expect(chain.byId.get('mo-hinh-gordon')?.output.value).toBeCloseTo(25_925.9259, 3);
  });

  it('giá trị thượng nguồn ngoài miền của ô nhận KHÔNG bị kẹp', () => {
    // Rf 10 + beta 4 × ERP 15 = 70%, trong khi thanh trượt "Suất sinh lợi yêu cầu" khai max 30.
    const chain = runChain({
      modules: CHUOI,
      inputs: inputsVoi('capm', { riskFree: 10, beta: 4, erp: 15 }),
      ctx: CTX,
    });

    expect(chain.byId.get('capm')?.output.value).toBeCloseTo(70, 6);
    // Không kẹp: 2.000 × 1,05 ÷ 0,65 = 3.230,7692 ₫.
    // Nếu kẹp về 30 thì sẽ ra 2.100 ÷ 0,25 = 8.400 ₫ — con số sai mà trông vẫn hợp lệ.
    expect(chain.byId.get('mo-hinh-gordon')?.output.value).toBeCloseTo(3_230.7692, 3);
  });

  it('bước không có cạnh nào cho ra đúng kết quả của runFormula() đơn lẻ', () => {
    const inputs = { riskFree: 4, beta: 0.8, erp: 7.5 };
    const chain = runChain({ modules: [CAPM], inputs: { capm: inputs }, ctx: CTX });

    expect(chain.byId.get('capm')?.output).toEqual(runFormula(CAPM, inputs, CTX));
  });
});

/*
 * ── Fixture tự dựng cho các nhánh chuỗi thật không có ───────────────────────────────────────
 */

describe('runChain — các nhánh biên', () => {
  it('chuỗi rỗng không ném lỗi', () => {
    const chain = runChain({ modules: [], inputs: {}, ctx: CTX });

    expect(chain.steps).toEqual([]);
    expect(chain.cyclic).toEqual([]);
  });

  it('ghi kết quả thượng nguồn vào ctx.upstream, khoá là formulaId', () => {
    const a = fixture('a', { calc: (v) => ok(v('x') * 10, 'lần') });
    const b = fixture('b', {
      dependsOn: [{ formulaId: 'a', variableKey: 'x' }],
      // Cộng 1.000 để phân biệt với giá trị chảy qua ô nhập — nếu hàm đọc nhầm ô nhập thì ra 20.
      calc: (_v, ctx) => ok((ctx.upstream?.['a']?.value ?? -1) + 1_000, 'lần'),
    });

    const chain = runChain({ modules: [a, b], inputs: { a: { x: 2 }, b: { x: 0 } }, ctx: CTX });

    expect(chain.byId.get('a')?.output.value).toBe(20);
    expect(chain.byId.get('b')?.output.value).toBe(1_020);
  });

  it('đồ thị có vòng thì trả về phần kẹt, không treo vòng lặp', () => {
    const a = fixture('a', { dependsOn: [{ formulaId: 'b', variableKey: 'x' }] });
    const b = fixture('b', { dependsOn: [{ formulaId: 'a', variableKey: 'x' }] });

    const chain = runChain({ modules: [a, b], inputs: { a: { x: 1 }, b: { x: 1 } }, ctx: CTX });

    expect(chain.steps).toEqual([]);
    expect(chain.cyclic).toEqual(['a', 'b']);
  });

  /*
   * Một ô, hai nguồn. Registry hôm nay chưa có ca nào như vậy — nhưng nó nằm đúng trên đường đi
   * của mắt xích định giá kế tiếp (giá trị nội tại đến từ Gordon HOẶC từ chiết khấu FCFF), và
   * bản đầu của runChain() sai cả hai chiều ở đúng chỗ này.
   */
  it('hai nguồn cùng đổ vào một ô: nguồn hỏng KHÔNG chặn được nguồn còn cấp được số', () => {
    const hong = fixture('hong', {
      calc: () => fail('lần', meaningless({ vi: 'hỏng có chủ đích', en: 'deliberately broken' })),
    });
    const lanh = fixture('lanh', { calc: () => ok(42, 'lần') });
    const duoi = fixture('duoi', {
      // Nguồn hỏng khai TRƯỚC — bản đầu chặn ngay tại đây dù `lanh` đang có số dùng được.
      dependsOn: [
        { formulaId: 'hong', variableKey: 'x' },
        { formulaId: 'lanh', variableKey: 'x' },
      ],
      calc: (v) => ok(v('x'), 'lần'),
    });

    const chain = runChain({
      modules: [hong, lanh, duoi],
      inputs: { hong: { x: 1 }, lanh: { x: 1 }, duoi: { x: 0 } },
      ctx: CTX,
    });

    expect(chain.byId.get('duoi')?.output.value).toBe(42);
    // Ô bày ra nguồn ĐANG CẤP SỐ, không bày nguồn hỏng.
    expect(chain.byId.get('duoi')?.fields).toHaveLength(1);
    expect(chain.byId.get('duoi')?.fields[0]?.upstream.formulaId).toBe('lanh');
  });

  it('hai nguồn cùng đổ vào một ô: MỌI nguồn hỏng thì mới kế thừa lỗi', () => {
    const hongA = fixture('hong-a', {
      calc: () => fail('lần', meaningless({ vi: 'hỏng A', en: 'broken A' })),
    });
    const hongB = fixture('hong-b', {
      calc: () => fail('lần', meaningless({ vi: 'hỏng B', en: 'broken B' })),
    });
    const duoi = fixture('duoi', {
      dependsOn: [
        { formulaId: 'hong-a', variableKey: 'x' },
        { formulaId: 'hong-b', variableKey: 'x' },
      ],
    });

    const chain = runChain({
      modules: [hongA, hongB, duoi],
      inputs: { 'hong-a': { x: 1 }, 'hong-b': { x: 1 }, duoi: { x: 0 } },
      ctx: CTX,
    });

    expect(chain.byId.get('duoi')?.output.warning?.code).toBe('INHERITED');
    // Nêu tên nguồn hỏng ĐẦU TIÊN theo thứ tự khai — tất định, không theo thứ tự duyệt Map.
    expect(chain.byId.get('duoi')?.output.warning?.message.vi).toContain('Công thức hong-a');
    expect(chain.byId.get('duoi')?.fields).toHaveLength(1);
  });

  it('hai nguồn cùng đổ vào một ô: ghi đè thắng cả hai', () => {
    const hong = fixture('hong', {
      calc: () => fail('lần', meaningless({ vi: 'hỏng có chủ đích', en: 'deliberately broken' })),
    });
    const lanh = fixture('lanh', { calc: () => ok(42, 'lần') });
    const duoi = fixture('duoi', {
      dependsOn: [
        { formulaId: 'hong', variableKey: 'x' },
        { formulaId: 'lanh', variableKey: 'x' },
      ],
      calc: (v) => ok(v('x'), 'lần'),
    });

    const chain = runChain({
      modules: [hong, lanh, duoi],
      inputs: { hong: { x: 1 }, lanh: { x: 1 }, duoi: { x: 0 } },
      overrides: { duoi: { x: 7 } },
      ctx: CTX,
    });

    expect(chain.byId.get('duoi')?.output.value).toBe(7);
    expect(chain.byId.get('duoi')?.fields[0]?.linked.mode).toBe('overridden');
  });

  it('cạnh trỏ ra ngoài chuỗi bị bỏ qua, bước vẫn tính bằng ô nhập của chính nó', () => {
    const b = fixture('b', {
      dependsOn: [{ formulaId: 'khong-ton-tai', variableKey: 'x' }],
      calc: (v) => ok(v('x'), 'lần'),
    });

    const chain = runChain({ modules: [b], inputs: { b: { x: 7 } }, ctx: CTX });

    expect(chain.byId.get('b')?.output.value).toBe(7);
    expect(chain.byId.get('b')?.fields).toEqual([]);
  });
});

/*
 * ── chainFor: chọn đúng nhánh để bày ra ─────────────────────────────────────────────────────
 */

describe('chainFor', () => {
  const SPECS = FORMULA_MODULES.map((m) => m.spec);

  it('lấy cả tổ tiên lẫn hậu duệ của công thức đang xem', () => {
    expect(ids(chainFor(SPECS, 'mo-hinh-gordon'))).toEqual([
      'mo-hinh-gordon',
      'capm',
      'bien-an-toan',
    ]);
  });

  it('đi ngược hết chuỗi từ bước cuối', () => {
    expect(ids(chainFor(SPECS, 'bien-an-toan'))).toEqual([
      'mo-hinh-gordon',
      'capm',
      'bien-an-toan',
    ]);
  });

  it('KHÔNG kéo nhánh song song chỉ vì chung một tổ tiên', () => {
    // WACC cũng nhận từ CAPM, nhưng nó không nằm trên đường đi của Gordon — gộp vào là dải luồng
    // sẽ vẽ mũi tên Gordon → WACC, một quan hệ không có thật.
    expect(ids(chainFor(SPECS, 'mo-hinh-gordon'))).not.toContain('wacc');
  });

  it('công thức không dính cạnh nào thì không có chuỗi để bày', () => {
    expect(chainFor(SPECS, 'pe')).toEqual([]);
  });

  it('id không có trong Registry cũng không ném lỗi', () => {
    expect(chainFor(SPECS, 'khong-ton-tai')).toEqual([]);
  });
});

function ids(specs: ReadonlyArray<FormulaSpec>): ReadonlyArray<string> {
  return specs.map((spec) => spec.id);
}

/** Công thức giả tối thiểu — chỉ đủ trường để `runFormula()` và Registry chạy được. */
function fixture(
  id: string,
  parts: Partial<FormulaSpec> & Partial<Pick<FormulaModule, 'calc'>> = {},
): FormulaModule {
  const { calc, ...specParts } = parts;

  return {
    spec: {
      id,
      categoryId: 'valuation',
      name: { vi: `Công thức ${id}`, en: id },
      description: {
        vi: `Công thức giả ${id} dùng cho ca kiểm.`,
        en: `Fake formula ${id} for tests.`,
      },
      latex: 'y = x',
      expression: { vi: 'y = x', en: 'y = x' },
      chartType: 'none',
      level: 'advanced',
      tags: [],
      resultUnit: 'lần',
      variables: [
        {
          key: 'x',
          label: { vi: `Ô x của ${id}`, en: `Field x of ${id}` },
          unit: 'lần',
          type: 'number',
          defaultValue: 1,
          level: 'basic',
        },
      ],
      explanation: {
        meaning: { vi: 'giả', en: 'fake' },
        whenToUse: { vi: 'giả', en: 'fake' },
        howToRead: { vi: 'giả', en: 'fake' },
        commonMistakes: { vi: 'giả', en: 'fake' },
      },
      example: { title: { vi: 'giả', en: 'fake' }, inputs: { x: 1 }, expected: 1 },
      tests: [{ name: 'giả', inputs: { x: 1 }, expected: 1 }],
      source: [{ label: { vi: 'giả', en: 'fake' } }],
      ...specParts,
    },
    calc: calc ?? ((v) => ok(v('x'), 'lần')),
  };
}
