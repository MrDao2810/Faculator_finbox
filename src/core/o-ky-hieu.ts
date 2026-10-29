/**
 * Tầng DOMAIN — nối một Ô NHẬP với dòng của nó trong bảng ký hiệu (`spec.symbols`).
 *
 * Nhãn ô mang ký hiệu của hình ở cuối từ 19/10/2026 ('Vốn chủ sở hữu (E)', 'Giá mua (Pmua)'), viết LIỀN
 * như hình vẽ: `P_{mua}` thành 'Pmua', `\Delta B` thành 'ΔB'. Ô nào đã khớp với ký hiệu nào thì
 * `formulas/input-symbols.test.ts` ghim bằng bảng tay; ở đây chỉ đọc ngược lại cái nhãn đã ghim ấy để
 * tìm dòng bảng ký hiệu có cùng chữ phẳng.
 *
 * Dùng cho khung "Lấy số liệu ở đâu" (28/10/2026, chủ dự án: _"Khi hover vào biến trong popup này thì
 * cũng sẽ được highlight vàng như bên kia"_). Bản đầu làm ký hiệu của ô ấy sáng lên ở thẻ Công thức,
 * và bị bác cùng ngày: _"khi hover vào thì cần chuyển con trỏ chuột thành bàn tay và hiện thêm popup
 * mới chú thích chứ không phải sáng phần trước"_. Nay phần ký hiệu NGAY TRONG tên ô ('(TSNH)') là
 * điểm chạm, mở khung chú thích của đúng dòng bảng ấy — `nhanCoKyHieu()` cắt tên ô quanh phần đó.
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

/** Một tên ô cắt làm ba khúc quanh phần mang ký hiệu; ghép `truoc + kyHieu + sau` ra đúng tên gốc. */
export interface KhucNhan {
  truoc: string;
  kyHieu: string;
  sau: string;
}

/** Ô có dòng trong bảng ký hiệu: dòng nào, và tên ô ở mỗi ngôn ngữ cắt quanh phần ký hiệu ra sao. */
export interface NhanCoKyHieu {
  sym: number;
  vi: KhucNhan;
  en: KhucNhan;
}

/** Cắt theo đúng hai dạng `kyHieuCuaNhan()` đọc; nhãn không mang ký hiệu thì cả nhãn là ký hiệu. */
function chiaNhan(nhan: string): KhucNhan {
  const cuoi = / \(([^()]+)\)$/.exec(nhan);
  if (cuoi !== null) {
    return { truoc: nhan.slice(0, cuoi.index + 1), kyHieu: nhan.slice(cuoi.index + 1), sau: '' };
  }
  const dau = /^(\S+) — /.exec(nhan)?.[1];
  if (dau !== undefined) return { truoc: '', kyHieu: dau, sau: nhan.slice(dau.length) };
  return { truoc: '', kyHieu: nhan, sau: '' };
}

/**
 * Phần nào của tên ô `key` là ký hiệu của hình — chỗ đặt điểm chạm trong khung "Lấy số liệu ở đâu":
 * '(TSNH)' của 'Tài sản ngắn hạn (TSNH)', 'EPS' của 'EPS — lợi nhuận trên mỗi cổ phiếu', và CẢ tên khi
 * hình viết bằng chữ ('Vốn chủ sở hữu' với dòng `\text{Vốn chủ sở hữu}`). `null` khi ô không ứng với
 * dòng nào — cùng luật `kyHieuCuaO()`, nên ô nào không có dòng thì tên ô in trơn.
 *
 * Bản tiếng Anh mang đúng ký hiệu ấy ở đúng chỗ ấy (`formulas/input-symbols.test.ts` ghim); tên ô
 * khớp cả cụm chữ thì tên tiếng Anh ("Equity") cũng là điểm chạm cả cụm.
 */
export function nhanCoKyHieu(spec: FormulaSpec, key: string): NhanCoKyHieu | null {
  const sym = kyHieuCuaO(spec, key);
  const o = spec.variables.find((v) => v.key === key);
  if (sym === null || o === undefined) return null;

  const vi = chiaNhan(o.label.vi);
  const caCum = vi.kyHieu === o.label.vi;
  return {
    sym,
    vi,
    en: caCum ? { truoc: '', kyHieu: o.label.en, sau: '' } : chiaNhan(o.label.en),
  };
}
