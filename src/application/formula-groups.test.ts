import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { FORMULA_GROUPS, FORMULA_MODULES, chainFor, groupOfFormula } from '@/application';
import type { FormulaGroupKey } from '@/application';

/**
 * Nạp Registry theo NHÓM ở màn chi tiết (28/10/2026). Mỗi trang chi tiết chỉ chở một file nhóm,
 * qua ba chỗ phải khớp nhau: bảng `FORMULA_GROUPS` (Domain), 17 file cửa
 * `src/application/formula-groups/<khoá>.ts`, và 17 dòng `dynamic()` của `FormulaDetailHost.tsx`.
 * Lệch một chỗ thì trang của nhóm ấy hỏng lúc build hoặc chở nhầm nhóm — các ca dưới gác cả ba.
 */

const KHOA = Object.keys(FORMULA_GROUPS) as FormulaGroupKey[];

const THU_MUC_CUA = fileURLToPath(new URL('./formula-groups/', import.meta.url));
const VO = readFileSync(
  fileURLToPath(new URL('../app/cong-thuc/[id]/FormulaDetailHost.tsx', import.meta.url)),
  'utf8',
);

describe('nạp Registry theo nhóm', () => {
  it('đủ 17 nhóm, mỗi công thức thuộc đúng một nhóm', () => {
    expect(KHOA).toHaveLength(17);
    const dem = new Map<string, number>();
    for (const key of KHOA) {
      for (const m of FORMULA_GROUPS[key]) dem.set(m.spec.id, (dem.get(m.spec.id) ?? 0) + 1);
    }
    expect(dem.size).toBe(FORMULA_MODULES.length);
    for (const m of FORMULA_MODULES) expect(dem.get(m.spec.id), m.spec.id).toBe(1);
  });

  it('groupOfFormula trả đúng nhóm, id lạ thì undefined', () => {
    for (const key of KHOA) {
      for (const m of FORMULA_GROUPS[key]) expect(groupOfFormula(m.spec.id)).toBe(key);
    }
    expect(groupOfFormula('khong-co-cong-thuc-nay')).toBeUndefined();
  });

  it('mỗi khoá có đúng một file cửa cùng tên, và file ấy xuất đúng mảng của nhóm', async () => {
    const cua = readdirSync(THU_MUC_CUA)
      .filter((f) => f.endsWith('.ts'))
      .map((f) => f.replace(/\.ts$/, ''))
      .sort();
    expect(cua).toEqual([...KHOA].sort());
    for (const key of KHOA) {
      const mod = (await import(`./formula-groups/${key}.ts`)) as { GROUP_MODULES: unknown };
      expect(mod.GROUP_MODULES, key).toBe(FORMULA_GROUPS[key]);
    }
  });

  it('vỏ FormulaDetailHost có đúng một import() tĩnh cho mỗi nhóm, không thừa', () => {
    const nap = [...VO.matchAll(/import\('@\/application\/formula-groups\/([a-z-]+)'\)/g)].map(
      (m) => m[1],
    );
    expect([...nap].sort()).toEqual([...KHOA].sort());
    // Vỏ không được nhập bảng nhóm hay cả Registry — đó đúng là thứ cần tránh. Bỏ chú thích trước.
    const ma = VO.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(ma).not.toMatch(/\bFORMULA_GROUPS\b|\bFORMULA_MODULES\b|findFormulaModule/);
  });

  /*
   * `FormulaDetail` chỉ thấy nhóm của mình, nên `chainFor()` chạy trên nhóm ấy phải cho ĐÚNG chuỗi
   * như khi chạy trên cả Registry. Hôm nay cả 7 công thức của chuỗi FR-15 nằm trong `valuation-dcf`;
   * một cạnh `dependsOn` mới trỏ sang nhóm khác sẽ làm ca này đỏ thay vì lặng lẽ mất một bước.
   */
  it('chuỗi FR-15 của mọi công thức nằm gọn trong nhóm của nó', () => {
    const tatCa = FORMULA_MODULES.map((m) => m.spec);
    let soCoChuoi = 0;
    for (const key of KHOA) {
      const nhom = FORMULA_GROUPS[key].map((m) => m.spec);
      for (const spec of nhom) {
        const day = chainFor(tatCa, spec.id).map((s) => s.id);
        if (day.length > 0) soCoChuoi += 1;
        expect(
          chainFor(nhom, spec.id).map((s) => s.id),
          spec.id,
        ).toEqual(day);
      }
    }
    expect(soCoChuoi).toBeGreaterThan(0);
  });
});
