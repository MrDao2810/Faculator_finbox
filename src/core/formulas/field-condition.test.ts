/**
 * Mọi lần kết quả hỏng vì số người dùng NHẬP VÀO phải chỉ ra ô cần sửa (18/11/2026).
 *
 * Chủ dự án chụp điểm hoà vốn với giá bán 1.222 ₫ dưới biến phí 30.000 ₫: thẻ kết quả báo lỗi, còn
 * ô vừa gõ thì không có gì — _"cần thông báo đỏ ở bên dưới ô nhập là 'Giá bán phải lớn hơn Biến phí
 * một sản phẩm'. sửa tương tự với những công thức"_. Câu dưới ô đến từ `CalcWarning.field`, do chính
 * nhánh lỗi của `calc` gắn qua `atField()` — xem docblock ở `warnings.ts`.
 *
 * Gác bằng ĐO chứ không bằng danh sách: với từng công thức, đổi lần lượt từng ô sang một loạt giá
 * trị ô ấy cho phép gõ (trong miền, đúng số nguyên), quanh số mặc định và quanh số của ví dụ thực
 * tế, rồi chạy `runFormula`. Lần nào hỏng mà không phải vì chuỗi giá, vì thiếu ô hay vì bước trước
 * thì cảnh báo phải có `field`. Thêm một công thức mới, hay một nhánh lỗi mới, là tự vào lưới này.
 *
 * Phép đo chỉ đổi MỘT ô mỗi lần, nên nó là máy dò, không phải chứng minh: nhánh lỗi chỉ tới được khi
 * đổi hai ô cùng lúc vẫn cần đọc tay lúc viết.
 */

import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext } from '../calc/types';
import { isOutOfRange } from '../input-state';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { defaultInputs } from '../registry/build';
import type { FormulaSpec } from '../registry/types';
import type { CalcOutput } from '../types';
import { FORMULA_MODULES } from './index';

const CTX: CalcContext = { asOf: '2026-08-04', schedule: scheduleOrDefault(MARKET_CONFIG) };

function ctxCuaViDu(spec: FormulaSpec): CalcContext {
  const ex = spec.example;
  return {
    ...CTX,
    series: ex.series,
    bars: ex.bars,
    marketSeries: ex.marketSeries,
    cashflows: ex.cashflows,
  };
}

/** Lỗi không do một ô nhập: chuỗi giá, ô còn trống, bước trước hỏng. */
const KHONG_DO_O = new Set(['MISSING_SERIES', 'INCOMPLETE_INPUT', 'INHERITED']);

/**
 * Nhánh lỗi do số nhập vào mà KHÔNG gắn được cho một ô nào — mỗi dòng một lý do. Khoá là
 * `<id>|<đầu câu nguyên nhân tiếng Việt>`.
 */
const NGOAI_LE: Readonly<Record<string, string>> = {
  'irr-nien-kim|Không tìm được IRR':
    'bộ giải không có nghiệm trong dải −99% tới 1.000% mỗi kỳ; điều kiện phụ thuộc cùng lúc tỉ lệ dòng thu trên vốn và số kỳ, không viết đúng được thành điều kiện trên một hay hai ô',
  'ty-so-thang-thua|Số liệu Trung bình mức giảm':
    'không còn phiên giảm nào vượt ngưỡng là chuyện của chuỗi giá đã nạp; ô Ngưỡng chỉ góp phần',
  'gia-tri-noi-tai-fcff|Nợ vay trừ số tiền':
    'giá trị doanh nghiệp là đại lượng tính ra từ FCFF, g và WACC, nên "nợ vay ròng lớn hơn giá trị doanh nghiệp" không viết đúng được thành điều kiện trên các ô',
};

/** Hệ số và giá trị đem thử cho mỗi ô, quanh một số gốc `d`. */
function giaTriThu(d: number, min: number | undefined, max: number | undefined): number[] {
  const thu = new Set<number>();
  const heSo = [
    0, 0.001, 0.01, 0.1, 0.5, 0.9, 0.99, 1.01, 1.1, 2, 5, 10, 100, 1000, -0.01, -0.1, -1, -2, -10,
  ];
  for (const h of heSo) thu.add(d * h);
  for (const x of [0, 1, -1, 2, 10, 100, 1000, 1e6, -100, -1e6, 0.5, -0.5, d + 1, d - 1]) {
    thu.add(x);
  }
  if (min !== undefined) thu.add(min);
  if (max !== undefined) thu.add(max);
  return [...thu].filter((x) => Number.isFinite(x) && x !== d);
}

interface LanHong {
  id: string;
  key: string;
  value: number;
  out: CalcOutput;
}

/** Mọi lần hỏng do số nhập vào, của mọi công thức. */
function quet(): LanHong[] {
  const ra: LanHong[] = [];
  for (const formula of FORMULA_MODULES) {
    const spec = formula.spec;
    const ctx = ctxCuaViDu(spec);
    const goc = defaultInputs(spec);
    const bo = [goc, { ...goc, ...spec.example.inputs }];
    for (const base of bo) {
      for (const variable of spec.variables) {
        const d = base[variable.key] ?? 0;
        const thu =
          variable.options === undefined
            ? giaTriThu(d, variable.min, variable.max)
            : variable.options.map((o) => o.value).filter((x) => x !== d);
        for (const value of thu) {
          if (isOutOfRange(value, variable)) continue;
          const out = runFormula(formula, { ...base, [variable.key]: value }, ctx);
          const w = out.warning;
          if (out.value !== null || w === undefined || KHONG_DO_O.has(w.code)) continue;
          ra.push({ id: spec.id, key: variable.key, value, out });
        }
      }
    }
  }
  return ra;
}

const LAN_HONG = quet();

/** Hỏng thì in ĐỦ danh sách — phép so mảng của vitest cắt bớt dòng khi dài. */
function khongCo(danhSach: readonly string[]): void {
  if (danhSach.length > 0) throw new Error(`${danhSach.length} chỗ:\n${danhSach.join('\n')}`);
}

function khoaNgoaiLe(id: string, vi: string): string | undefined {
  return Object.keys(NGOAI_LE).find((k) => {
    const [kid, dau] = k.split('|');
    return kid === id && dau !== undefined && vi.startsWith(dau);
  });
}

describe('lỗi do số nhập vào chỉ ra ô cần sửa (atField, 18/11/2026)', () => {
  it('phép đo có tìm thấy lỗi — lưới không rỗng', () => {
    expect(LAN_HONG.length).toBeGreaterThan(50);
  });

  it('mọi lần hỏng do số nhập vào đều gắn một ô, trừ ngoại lệ đã ghi lý do', () => {
    const thieu = new Map<string, string>();
    for (const lan of LAN_HONG) {
      const w = lan.out.warning;
      if (w === undefined || w.field !== undefined) continue;
      if (khoaNgoaiLe(lan.id, w.message.vi) !== undefined) continue;
      thieu.set(`${lan.id} · ${w.code} · ${w.message.vi.slice(0, 70)}`, `${lan.key}=${lan.value}`);
    }
    khongCo([...thieu].map(([k, v]) => `${k} (vd ${v})`));
  });

  it('ô được gắn là một ô SỐ có thật của chính công thức', () => {
    const sai: string[] = [];
    for (const lan of LAN_HONG) {
      const field = lan.out.warning?.field;
      if (field === undefined) continue;
      const spec = FORMULA_MODULES.find((f) => f.spec.id === lan.id)?.spec;
      const variable = spec?.variables.find((v) => v.key === field.key);
      if (variable === undefined || variable.type !== 'number') {
        sai.push(`${lan.id}: ${field.key} (${variable?.type ?? 'không có'})`);
      }
    }
    khongCo([...new Set(sai)]);
  });

  it('câu dưới ô: đủ hai thứ tiếng, một câu ngắn, không gạch, không lẫn câu nguyên nhân', () => {
    const sai = new Set<string>();
    for (const lan of LAN_HONG) {
      const w = lan.out.warning;
      const field = w?.field;
      if (w === undefined || field === undefined) continue;
      for (const lang of ['vi', 'en'] as const) {
        const cau = field.message[lang];
        const loi: string[] = [];
        if (cau.trim() === '') loi.push('rỗng');
        if (!cau.endsWith('.')) loi.push('không kết thúc bằng dấu chấm');
        if (cau.length > 90) loi.push(`dài ${cau.length} ký tự`);
        if (/[—–]| - /.test(cau)) loi.push('có gạch');
        if ((cau.match(/\. /g) ?? []).length > 0) loi.push('quá một câu');
        if (cau === w.message[lang]) loi.push('trùng câu nguyên nhân của thẻ');
        if (loi.length > 0) sai.add(`${lan.id} [${lang}] "${cau}": ${loi.join(', ')}`);
      }
    }
    khongCo([...sai]);
  });

  /*
   * Câu gọi đúng ô mà nó đứng dưới. Tên ô là nhãn bỏ ký hiệu trong ngoặc ở cuối, như câu báo miền
   * (`tenTrongCau()` ở `mien-nhap.ts`). Câu được mở đầu bằng cả tên ấy ("Vốn hoá thị trường và Nợ vay
   * không được cùng bằng 0."), hoặc bằng một đoạn đầu của nó ("Giá bán phải lớn hơn …", câu chủ dự án
   * viết cho ô "Giá bán một sản phẩm"). Tiếng Anh so không phân biệt hoa thường.
   */
  it('câu mở đầu bằng tên của chính ô ấy', () => {
    const VI_TU_NOI = / (lớn hơn|phải|không được|nhỏ hơn)\b/;
    const EN_TU_NOI = / (must|cannot)\b/;
    const boKyHieu = (nhan: string): string => nhan.replace(/\s*\([^()]*\)\s*$/, '').trim();
    const goiDung = (cau: string, nhan: string, tuNoi: RegExp, thuong: boolean): boolean => {
      const c = thuong ? cau.toLowerCase() : cau;
      const ten = thuong ? boKyHieu(nhan).toLowerCase() : boKyHieu(nhan);
      const chuNgu = c.split(tuNoi)[0] ?? '';
      return c.startsWith(ten) || (chuNgu.length > 0 && ten.startsWith(chuNgu));
    };
    const sai = new Set<string>();
    for (const lan of LAN_HONG) {
      const field = lan.out.warning?.field;
      if (field === undefined) continue;
      const spec = FORMULA_MODULES.find((f) => f.spec.id === lan.id)?.spec;
      const nhan = spec?.variables.find((v) => v.key === field.key)?.label;
      if (nhan === undefined) continue;
      if (!goiDung(field.message.vi, nhan.vi, VI_TU_NOI, false)) {
        sai.add(`${lan.id} [vi] "${field.message.vi}" — ô "${nhan.vi}"`);
      }
      if (!goiDung(field.message.en, nhan.en, EN_TU_NOI, true)) {
        sai.add(`${lan.id} [en] "${field.message.en}" — ô "${nhan.en}"`);
      }
    }
    khongCo([...sai]);
  });

  it('mỗi ngoại lệ còn khớp ít nhất một lần hỏng thật', () => {
    const chet = Object.keys(NGOAI_LE).filter(
      (k) => !LAN_HONG.some((lan) => khoaNgoaiLe(lan.id, lan.out.warning?.message.vi ?? '') === k),
    );
    khongCo(chet);
  });

  it('điểm hoà vốn: câu đúng như chủ dự án viết, dưới ô Giá bán', () => {
    const f = FORMULA_MODULES.find((m) => m.spec.id === 'diem-hoa-von');
    if (f === undefined) throw new Error('thiếu diem-hoa-von');
    const out = runFormula(
      f,
      { fixedCost: 1_111_211_111_222, unitPrice: 1_222, variableCost: 30_000 },
      CTX,
    );
    expect(out.warning?.field).toEqual({
      key: 'unitPrice',
      message: {
        vi: 'Giá bán phải lớn hơn Biến phí một sản phẩm.',
        en: 'Selling price must be greater than variable cost per unit.',
      },
    });
  });
});
