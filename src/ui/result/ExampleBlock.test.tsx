// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  FORMULAS,
  MARKET_CONFIG,
  clampToSpec,
  defaultInputs,
  findFormulaModule,
  runFormula,
  scheduleOrDefault,
} from '@/application';
import type { CalcInputs, FormulaSpec } from '@/application';

import { ExampleBlock } from './ExampleBlock';

afterEach(cleanup);

const CTX = { asOf: '2026-08-04', schedule: scheduleOrDefault(MARKET_CONFIG) };

function specOf(id: string): FormulaSpec {
  const found = FORMULAS.find((spec) => spec.id === id);
  if (found === undefined) throw new Error(`Registry thiếu công thức '${id}'.`);
  return found;
}

/** Dựng khối ở chế độ gõ được, với `inputs` do ca kiểm quyết. */
function draw(id: string, inputs?: CalcInputs) {
  const spec = specOf(id);
  const formula = findFormulaModule(id);
  if (formula === undefined) throw new Error(`Registry thiếu hàm tính '${id}'.`);

  const values = inputs ?? { ...defaultInputs(spec), ...spec.example.inputs };
  const onChange = vi.fn();

  const view = render(
    <ExampleBlock
      formula={spec}
      inputs={values}
      output={runFormula(formula, values, CTX)}
      onChange={onChange}
    />,
  );
  return { ...view, onChange, spec };
}

describe('ExampleBlock — chỉ để đọc khi màn không truyền giá trị vào', () => {
  it('không có inputs/onChange thì bày số của ví dụ dạng chữ, không có ô nào', () => {
    render(<ExampleBlock formula={specOf('pe')} />);

    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('Ví dụ thực tế')).not.toBeNull();
    // Vẫn phải đọc được con số của ví dụ.
    expect(screen.getByText('92.000 ₫')).not.toBeNull();
  });
});

describe('ExampleBlock — gõ được ngay tại dòng số của ví dụ', () => {
  it('mỗi dòng số thành một ô nhập, mang đúng nhãn của biến', () => {
    draw('pe');

    expect(screen.getByRole('textbox', { name: /Giá thị trường/ })).not.toBeNull();
    expect(screen.getByRole('textbox', { name: /EPS/ })).not.toBeNull();
  });

  it('gõ vào ô ở đây thì bắn onChange của màn — KHÔNG giữ state riêng', async () => {
    const { onChange } = draw('pe');

    const price = screen.getByRole('textbox', { name: /Giá thị trường/ });
    await userEvent.clear(price);
    await userEvent.type(price, '120000{Enter}');

    /*
     * Đây là chi tiết quan trọng nhất của khối: ô không tự giữ giá trị, nó bắn lên cho màn chi
     * tiết. Nhờ vậy ô ở đây và ô ở khối Số liệu là cùng một con số chứ không phải hai bản sao —
     * không có đường nào để hai chỗ nói hai kết quả.
     */
    expect(onChange).toHaveBeenCalledWith('price', 120_000);
  });

  it('gõ số lẻ cũng được, và miền vẫn kẹp', async () => {
    const { onChange } = draw('pe');

    const eps = screen.getByRole('textbox', { name: /EPS/ });
    await userEvent.clear(eps);
    await userEvent.type(eps, '6.050,75{Enter}');

    expect(onChange).toHaveBeenCalledWith('eps', 6_050.75);
  });

  it('dòng "→" nói đúng con số của khối Kết quả, không phải con số cứng của ví dụ', () => {
    const spec = specOf('pe');
    // Giá gấp đôi ví dụ thì P/E phải gấp đôi — nếu dòng này vẫn ghi 15,21 là nó đang bịa.
    draw('pe', { ...defaultInputs(spec), ...spec.example.inputs, price: 184_000 });

    expect(screen.getByText(/30,41/)).not.toBeNull();
  });
});

describe('ExampleBlock — giữ được con số gốc của ví dụ (FR-02)', () => {
  it('đang đúng bộ của ví dụ thì chỉ nhắc là sửa được, không bày nút quay về', () => {
    draw('pe');

    expect(screen.getByText(/Sửa được ngay tại đây/)).not.toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  /*
   * 17 trên 108 công thức có ví dụ cố ý dùng chu kỳ ngắn hơn giá trị mặc định để tính tay kiểm
   * được. Với chúng, mở màn ra là số đang nhập ĐÃ lệch khỏi ví dụ — nên phải nói ra con số gốc
   * ngay, chứ không để người đọc tưởng dòng "→" là kết quả của ví dụ.
   */
  it('số đang nhập lệch khỏi ví dụ thì hiện con số gốc kèm nút quay về', () => {
    const spec = specOf('pe');
    draw('pe', { ...defaultInputs(spec), ...spec.example.inputs, price: 50_000 });

    expect(screen.getByText(/Ví dụ gốc cho:/)).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Về số của ví dụ' })).not.toBeNull();
  });

  it('bấm quay về thì đặt lại TRỌN bộ số của ví dụ, không riêng ô vừa sửa', async () => {
    const spec = specOf('pe');
    const { onChange } = draw('pe', {
      ...defaultInputs(spec),
      price: 50_000,
      eps: 1_000,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Về số của ví dụ' }));

    expect(onChange).toHaveBeenCalledWith('price', spec.example.inputs.price);
    expect(onChange).toHaveBeenCalledWith('eps', spec.example.inputs.eps);
    expect(onChange).toHaveBeenCalledTimes(Object.keys(spec.example.inputs).length);
  });
});

/*
 * ── Ca rẻ mà đắt giá ──────────────────────────────────────────────────────────────────────────
 *
 * Khối này dựng ô nhập theo khoá của `example.inputs`. Chỉ cần MỘT công thức khai lệch khoá là chỗ
 * đó không tra ra `VariableSpec`, ô im lặng rơi về chữ chỉ để đọc — không lỗi, không hiện gì, người
 * dùng chỉ thấy một dòng không gõ được. Một vòng lặp chặn được chuyện đó cho cả 111 công thức.
 */
describe('ExampleBlock — hợp đồng với Registry, quét cả 111 công thức', () => {
  it('mọi example.inputs đều khớp khoá biến và nằm trong miền hợp lệ', () => {
    for (const spec of FORMULAS) {
      const keys = Object.keys(spec.example.inputs);
      expect(keys.length, spec.id).toBeGreaterThan(0);

      for (const [key, value] of Object.entries(spec.example.inputs)) {
        const variable = spec.variables.find((v) => v.key === key);
        expect(
          variable,
          `${spec.id}: example khai khoá '${key}' mà không có biến nào tên vậy`,
        ).not.toBeUndefined();
        if (variable === undefined) continue;

        expect(Number.isFinite(value), `${spec.id}.${key}`).toBe(true);
        /*
         * Phải nằm sẵn trong miền, chứ không trông vào việc `clampToSpec` sẽ sửa hộ: nếu ví dụ
         * khai một số ngoài miền thì con số hiện trong khối ví dụ khác con số chảy vào ô nhập, và
         * hai chỗ trên cùng một màn nói hai số về cùng một ví dụ.
         */
        expect(clampToSpec(value, variable), `${spec.id}.${key} ngoài miền`).toBe(value);
      }
    }
  });

  it('ví dụ điền TRỌN mọi biến của công thức — gõ ở đây là đủ để tính', () => {
    const thieu = FORMULAS.filter(
      (spec) => Object.keys(spec.example.inputs).length < spec.variables.length,
    ).map((spec) => spec.id);

    expect(thieu, 'ví dụ của những công thức này khai thiếu ô').toEqual([]);
  });

  it('mọi công thức đều dựng đủ ô gõ được, không sót dòng nào thành chữ chết', () => {
    for (const spec of FORMULAS) {
      const formula = findFormulaModule(spec.id);
      if (formula === undefined) throw new Error(`thiếu hàm tính ${spec.id}`);

      const values = { ...defaultInputs(spec), ...spec.example.inputs };
      const { unmount } = render(
        <ExampleBlock
          formula={spec}
          inputs={values}
          output={runFormula(formula, values, CTX)}
          onChange={vi.fn()}
        />,
      );

      expect(screen.getAllByRole('textbox'), spec.id).toHaveLength(
        Object.keys(spec.example.inputs).length,
      );
      unmount();
    }
  });
});
