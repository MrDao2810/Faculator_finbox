import { describe, expect, it } from 'vitest';

import { buildFlowChain, flowDepth } from './flow-chain';
import type { FormulaDependency, FormulaSpec } from './registry/types';

/** Fixture tối thiểu — chỉ điền đủ trường mà dải luồng dùng tới. */
function make(id: string, vi: string, dependsOn: ReadonlyArray<string> = []): FormulaSpec {
  const edges: FormulaDependency[] = dependsOn.map((formulaId) => ({
    formulaId,
    variableKey: formulaId,
  }));

  return {
    id,
    categoryId: 'valuation',
    name: { vi, en: id },
    description: '',
    latex: 'x',
    chartType: 'none',
    level: 'basic',
    tags: [],
    resultUnit: 'lần',
    variables: [],
    explanation: { meaning: 'x', whenToUse: 'x', howToRead: 'x', commonMistakes: 'x' },
    example: { title: 'x', inputs: {}, expected: 1 },
    tests: [],
    source: [],
    dependsOn: edges.length > 0 ? edges : undefined,
  };
}

/** Đúng dải của WF-04, cố ý xáo trộn thứ tự khai báo để chứng minh thứ tự do cạnh quyết định. */
const WF04 = [
  make('gia-muc-tieu', 'Giá mục tiêu', ['ev']),
  make('wacc', 'WACC', ['capm']),
  make('beta', 'Beta'),
  make('bien-an-toan', 'Biên an toàn', ['gia-muc-tieu']),
  make('capm', 'CAPM · Re', ['beta']),
  make('ev', 'EV', ['fcff']),
  make('fcff', 'FCFF · PV', ['wacc']),
];

describe('sắp thứ tự dải luồng (WF-04)', () => {
  it('ra đúng thứ tự Beta → CAPM → WACC → FCFF → EV → Giá mục tiêu → Biên AT', () => {
    const chain = buildFlowChain(WF04);

    expect(chain.steps.map((s) => s.formulaId)).toEqual([
      'beta',
      'capm',
      'wacc',
      'fcff',
      'ev',
      'gia-muc-tieu',
      'bien-an-toan',
    ]);
  });

  it('lấy nhãn tiếng Việt từ Registry, không phải id', () => {
    const chain = buildFlowChain(WF04);
    expect(chain.steps[0]?.label).toBe('Beta');
    expect(chain.steps[1]?.label).toBe('CAPM · Re');
  });

  it('đánh đúng bậc để bản dọc desktop biết xếp cột', () => {
    const chain = buildFlowChain(WF04);
    const depths = Object.fromEntries(chain.steps.map((s) => [s.formulaId, s.depth]));

    expect(depths.beta).toBe(0);
    expect(depths.capm).toBe(1);
    expect(depths['bien-an-toan']).toBe(6);
    expect(flowDepth(chain)).toBe(6);
  });

  it('dải lành thì không có công thức nào kẹt trong vòng', () => {
    expect(buildFlowChain(WF04).cyclic).toEqual([]);
  });
});

describe('tính xác định (NFR-REL-03)', () => {
  it('cùng đầu vào luôn ra cùng thứ tự', () => {
    const lan1 = buildFlowChain(WF04).steps.map((s) => s.formulaId);
    const lan2 = buildFlowChain(WF04).steps.map((s) => s.formulaId);
    expect(lan1).toEqual(lan2);
  });

  it('nhiều bước cùng sẵn sàng thì giữ đúng thứ tự khai báo', () => {
    const chain = buildFlowChain([make('c', 'C'), make('a', 'A'), make('b', 'B')]);
    expect(chain.steps.map((s) => s.formulaId)).toEqual(['c', 'a', 'b']);
  });
});

describe('đồ thị khai sai không được làm hỏng màn', () => {
  it('có chu trình thì trả về phần kẹt chứ KHÔNG lặp vô hạn', () => {
    const chain = buildFlowChain([make('a', 'A', ['b']), make('b', 'B', ['a'])]);

    expect(chain.steps).toEqual([]);
    expect(chain.cyclic).toEqual(['a', 'b']);
  });

  it('vẫn vẽ được phần lành khi chỉ một nhánh bị vòng', () => {
    const chain = buildFlowChain([
      make('beta', 'Beta'),
      make('x', 'X', ['y']),
      make('y', 'Y', ['x']),
    ]);

    expect(chain.steps.map((s) => s.formulaId)).toEqual(['beta']);
    expect(chain.cyclic).toEqual(['x', 'y']);
  });

  it('công thức tự phụ thuộc chính nó thì bỏ cạnh đó đi, không tự khoá', () => {
    const chain = buildFlowChain([make('a', 'A', ['a'])]);
    expect(chain.steps.map((s) => s.formulaId)).toEqual(['a']);
    expect(chain.cyclic).toEqual([]);
  });

  it('cạnh trỏ ra ngoài danh sách thì bỏ qua — dải chỉ vẽ một nhánh của Registry', () => {
    const chain = buildFlowChain([make('wacc', 'WACC', ['khong-co-trong-dai'])]);
    expect(chain.steps.map((s) => s.formulaId)).toEqual(['wacc']);
    expect(chain.steps[0]?.depth).toBe(0);
  });

  it('cạnh trùng lặp chỉ tính một lần', () => {
    const chain = buildFlowChain([make('beta', 'Beta'), make('capm', 'CAPM', ['beta', 'beta'])]);
    expect(chain.steps[1]?.dependsOn).toEqual(['beta']);
  });

  it('danh sách rỗng thì trả dải rỗng, không ném lỗi', () => {
    expect(buildFlowChain([])).toEqual({ steps: [], cyclic: [] });
    expect(flowDepth({ steps: [], cyclic: [] })).toBe(0);
  });
});
