/**
 * Tầng DOMAIN — nối một Ô NHẬP với dòng của nó trong bảng ký hiệu (`spec.symbols`).
 *
 * Nhãn ô mang ký hiệu của hình ở cuối từ 19/10/2026 ('Vốn chủ sở hữu (E)', 'Giá mua (Pmua)'), viết LIỀN
 * như hình vẽ: `P_{mua}` thành 'Pmua', `\Delta B` thành 'ΔB'. Ô nào đã khớp với ký hiệu nào thì
 * `formulas/input-symbols.test.ts` ghim bằng bảng tay; ở đây chỉ đọc ngược lại cái nhãn đã ghim ấy để
 * tìm dòng bảng ký hiệu có cùng chữ phẳng.
 *
 * Dùng cho khung "Lấy số liệu ở đâu" (26/10/2026, chủ dự án: _"Khi hover vào biến trong popup này thì
 * cũng sẽ được highlight vàng như bên kia"_): rê vào một ô trong khung thì ký hiệu của ô ấy sáng lên ở
 * thẻ Công thức.
 */

import type { FormulaSpec } from './registry/types';

const HY_LAP: Readonly<Record<string, string>> = {
  Delta: 'Δ',
  alpha: 'α',
  beta: 'β',
  pi: 'π',
  sigma: 'σ',
};

/** Hình công thức viết thành chữ phẳng, để dò ký hiệu: `P_{mua}` thành 'Pmua', `\Delta B` thành 'ΔB'. */
export function chuPhang(latex: string): string {
  return latex
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\(Delta|alpha|beta|pi|sigma)\s*/g, (_, ten: string) => HY_LAP[ten] ?? ten)
    .replace(/\\,/g, ' ')
    .replace(/[_{}^]/g, '');
}

/** Nhãn mang ký hiệu ở cuối '… (X)', hoặc mở đầu bằng nó 'X — …'. */
export function kyHieuCuaNhan(nhan: string): string | null {
  return (/ \(([^()]+)\)$/.exec(nhan) ?? /^(\S+) — /.exec(nhan))?.[1] ?? null;
}

/**
 * Số thứ tự dòng bảng ký hiệu của ô `key`, hoặc `null` khi ô không ứng với dòng nào.
 *
 * Ba cách khớp, theo thứ tự: ký hiệu ở cuối nhãn ('(E)' với dòng `E`); cả nhãn khi hình viết bằng chữ
 * ('Vốn chủ sở hữu' với dòng `\text{Vốn chủ sở hữu}`, 'EBITDA' với dòng `EBITDA`); và ô của nhóm lặp,
 * mang số thứ tự ('(C1)') trong khi hình vẽ chỉ số chạy (`C_i`). Ô không khớp cách nào — ký hiệu tính
 * ra từ ô chứ không phải chính số trong ô, xem luật ở `input-symbols.test.ts` — thì không sáng gì.
 */
export function kyHieuCuaO(spec: FormulaSpec, key: string): number | null {
  const o = spec.variables.find((v) => v.key === key);
  const symbols = spec.symbols ?? [];
  if (o === undefined || symbols.length === 0) return null;

  const phang = symbols.map((s) => chuPhang(s.latex).trim());
  const tim = (chu: string): number => phang.findIndex((p) => p === chu);

  const kyHieu = kyHieuCuaNhan(o.label.vi);
  if (kyHieu !== null) {
    const dung = tim(kyHieu);
    if (dung >= 0) return dung;
    const goc = /^(.+?)\d+$/.exec(kyHieu)?.[1];
    if (goc !== undefined) {
      /* Chỉ số chạy là MỘT chữ thường (`C_i` thành 'Ci', `r_k` thành 'rk'); 'rG' của `r_{G}` thì không. */
      const chay = phang.findIndex(
        (p) => p.length === goc.length + 1 && p.startsWith(goc) && /[a-z]$/.test(p),
      );
      if (chay >= 0) return chay;
    }
    return null;
  }

  const caNhan = tim(o.label.vi.trim());
  return caNhan >= 0 ? caNhan : null;
}
