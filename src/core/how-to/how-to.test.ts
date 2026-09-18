/**
 * Cửa gác nội dung của khung "cách tính" — luật ở docblock `types.ts`.
 *
 * Gác phần DỮ LIỆU, không cần KaTeX: đủ 111 công thức, mỗi dòng bảng ký hiệu thuộc đúng một chỗ,
 * liên kết có thật, dòng chữ của từng bước theo đúng luật dòng công thức, và mỗi khung "tự tính"
 * chỉ ra được mẩu mã `calc` mà nó tả. Phần dựng (điểm chạm trong hình, cụm chữ) gác ở
 * `src/app/cong-thuc/[id]/notation.test.ts`.
 *
 * `FFB_HOWTO_IDS=id1,id2` thu các ca về vài công thức — cho người đang viết khung của MỘT file nhóm
 * chạy cửa gác mà không bị công thức chưa viết che mất kết quả. CI không đặt biến này, và mấy ca
 * ghim danh sách chỉ chạy khi không lọc.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  DASHES,
  blocksInLatex,
  equationsInLatex,
  equationsInText,
  expressionBlockProblems,
  expressionLines,
  numbersInLatex,
  numbersInText,
} from '../expression-rules';
import { ALL_FORMULAS } from '../formulas';
import type { FormulaSpec } from '../registry/types';
import { HOW_TO, HOW_TO_BY_FILE } from './index';
import type { FormulaHowTo, HowToEntry, HowToStep } from './types';

const FORMULAS_DIR = fileURLToPath(new URL('../formulas/', import.meta.url));

const chiKiem = process.env.FFB_HOWTO_IDS?.split(',')
  .map((id) => id.trim())
  .filter((id) => id !== '');
const dangLoc = chiKiem !== undefined;
const canKiem: ReadonlyArray<FormulaSpec> = dangLoc
  ? ALL_FORMULAS.filter((spec) => chiKiem.includes(spec.id))
  : ALL_FORMULAS;

const byId = new Map(ALL_FORMULAS.map((spec) => [spec.id, spec]));

/** Mọi khung của các công thức đang kiểm, kèm spec và dữ liệu cách tính. */
function moiKhung(): Array<{ spec: FormulaSpec; howTo: FormulaHowTo; entry: HowToEntry }> {
  return canKiem.flatMap((spec) => {
    const howTo = HOW_TO[spec.id];
    return howTo === undefined ? [] : howTo.entries.map((entry) => ({ spec, howTo, entry }));
  });
}

function stepsOf(entry: HowToEntry): ReadonlyArray<HowToStep> {
  return entry.kind === 'linked' ? [] : entry.steps;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const gonKhoangTrang = (text: string) => text.replace(/\s+/g, ' ');

/**
 * Mã nguồn MỘT công thức cộng mọi hàm cục bộ nó gọi (bắc cầu) — cùng cách cắt với
 * `constants-gate.test.ts`: chữ trong khối `FormulaModule` là thứ `calc` thật sự chạy.
 */
function maCuaCongThuc(file: string, id: string): string | undefined {
  const noiDung = readFileSync(FORMULAS_DIR + file, 'utf8');

  const hamCucBo = new Map<string, string>();
  for (const m of noiDung.matchAll(/^(?:export )?function (\w+)\(/gm)) {
    const from = m.index ?? 0;
    const den = noiDung.indexOf('\n}', from);
    hamCucBo.set(m[1] as string, noiDung.slice(from, den === -1 ? undefined : den));
  }

  const khoi = noiDung
    .split(/export const \w+: FormulaModule = \{/)
    .slice(1)
    .map((nguyen) => {
      const cat = nguyen.search(/^(?:function |export )/m);
      return cat === -1 ? nguyen : nguyen.slice(0, cat);
    })
    .find((phan) => new RegExp(`id: '${escapeRegExp(id)}'`).test(phan));
  if (khoi === undefined) return undefined;

  const daGom = new Set<string>();
  let ma = khoi;
  let them = true;
  while (them) {
    them = false;
    for (const [ten, than] of hamCucBo) {
      if (daGom.has(ten) || !new RegExp(`\\b${ten}\\(`).test(ma)) continue;
      daGom.add(ten);
      ma += `\n${than}`;
      them = true;
    }
  }
  return gonKhoangTrang(ma);
}

describe('khung cách tính — phủ đủ và khai đúng chỗ', () => {
  it('mỗi công thức khai ở đúng một file nhóm, cùng tên với file nhóm của nó', () => {
    const sai: string[] = [];
    const daThay = new Map<string, string>();
    for (const [file, ban] of Object.entries(HOW_TO_BY_FILE)) {
      const noiDung = readFileSync(FORMULAS_DIR + file, 'utf8');
      for (const id of Object.keys(ban)) {
        if (!byId.has(id)) sai.push(`${file}: "${id}" không phải công thức nào`);
        if (!new RegExp(`id: '${escapeRegExp(id)}'`).test(noiDung)) {
          sai.push(`${file}: "${id}" không nằm trong src/core/formulas/${file}`);
        }
        const truoc = daThay.get(id);
        if (truoc !== undefined) sai.push(`"${id}" khai ở cả ${truoc} và ${file}`);
        daThay.set(id, file);
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  it.skipIf(dangLoc)('cả 111 công thức đều đã khai khung cách tính', () => {
    const thieu = ALL_FORMULAS.filter((spec) => HOW_TO[spec.id] === undefined).map((s) => s.id);
    expect(thieu, `chưa khai: ${thieu.join(', ')}`).toEqual([]);
  });

  it('mỗi dòng bảng ký hiệu thuộc đúng một chỗ: một khung, hoặc một lý do bỏ qua', () => {
    const sai: string[] = [];
    for (const spec of canKiem) {
      const howTo = HOW_TO[spec.id];
      if (howTo === undefined) {
        sai.push(`${spec.id}: chưa khai khung cách tính`);
        continue;
      }
      const bang = (spec.symbols ?? []).map((s) => s.latex);
      const coKhung = howTo.entries.map((e) => e.symbol);
      const boQua = Object.keys(howTo.skipped);

      for (const symbol of [...coKhung, ...boQua]) {
        if (!bang.includes(symbol)) sai.push(`${spec.id}: "${symbol}" không có trong bảng ký hiệu`);
      }
      for (const symbol of bang) {
        const soCho = coKhung.filter((s) => s === symbol).length + (boQua.includes(symbol) ? 1 : 0);
        if (soCho === 0) sai.push(`${spec.id}: dòng "${symbol}" chưa được phân loại`);
        if (soCho > 1) sai.push(`${spec.id}: dòng "${symbol}" nằm ở ${String(soCho)} chỗ`);
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  /*
   * Ba danh sách GHIM — đổi nội dung khung là phải sửa ở đây, cố ý: chúng là những quyết định chủ dự
   * án cần soi, không phải thứ nên trôi theo từng lần viết thêm.
   *
   * - `defined`: khung không có mã nào để đối chiếu (ô gõ tay là một chỉ số thư viện chưa có công
   *   thức), nên chỉ mắt người kiểm được định nghĩa.
   * - Công thức KHÔNG có khung: mọi dòng bảng ký hiệu đều là kết quả, số gõ thẳng, hằng số hay phép
   *   tính đã hiện trọn trong hình. Chủ dự án chốt "chỉ làm cho đại lượng phải tính" (17/09/2026),
   *   nên danh sách này dài là đúng, nhưng thêm một tên vào đây phải là quyết định có lý do (`whyNone`).
   */
  it.skipIf(dangLoc)('danh sách khung "defined" đúng như đã duyệt', () => {
    const defined = ALL_FORMULAS.flatMap((spec) =>
      (HOW_TO[spec.id]?.entries ?? [])
        .filter((entry) => entry.kind === 'defined')
        .map((entry) => `${spec.id} · ${entry.symbol}`),
    );
    expect(defined.sort()).toEqual(
      [
        'capm · ERP',
        'ev-ebitda · EBITDA',
        'fcfe · \\Delta B',
        'fcff · EBIT',
        'fcff · \\Delta NWC',
        'gia-tri-noi-tai-fcff · D_{\\text{ròng}}',
        'ps · S_{ps}',
      ].sort(),
    );
  });

  it.skipIf(dangLoc)('danh sách công thức không có khung nào đúng như đã duyệt', () => {
    const khongKhung = ALL_FORMULAS.filter((spec) => HOW_TO[spec.id]?.entries.length === 0).map(
      (spec) => spec.id,
    );
    expect(khongKhung.sort()).toEqual(
      [
        'basis-vn30f',
        'bien-loi-nhuan-gop',
        'bien-loi-nhuan-rong',
        'bvps',
        'cagr',
        'co-lenh-rui-ro',
        'co-vi-the-phai-sinh',
        'diem-hoa-von',
        'don-bay-hieu-dung',
        'dong-luong-momentum',
        'eps-co-ban',
        'gia-ly-thuyet-vn30f',
        'gia-tri-hien-tai',
        'gia-tri-tuong-lai',
        'gia-von-trung-binh-dca',
        'hpr',
        'irr-nien-kim',
        'lai-kep',
        'lai-lo-vi-the-long',
        'lai-lo-vi-the-short',
        'lai-suat-hieu-dung',
        'lai-tien-gui',
        'loi-suat-nam-hoa',
        'loi-suat-quy-nam-theo-ngay',
        'loi-suat-thuc',
        'loi-suat-trung-binh-hinh-hoc',
        'loi-suat-vuot-chuan',
        'ncav-tren-co-phieu',
        'no-tren-von-chu',
        'phi-giao-dich-ban',
        'phi-giao-dich-mua',
        'phi-luu-ky',
        'roa',
        'roc-toc-do-thay-doi',
        'roe',
        'roi',
        'rut-truoc-han',
        'sma-n-phien',
        'so-hop-dong-toi-da',
        'thanh-toan-hien-hanh',
        'thanh-toan-nhanh',
        'thoi-gian-nhan-doi',
        'thue-chuyen-nhuong',
        'thue-co-tuc',
        'thue-tncn-dau-tu',
        'ty-le-khoi-luong',
        'ty-suat-co-tuc',
        'von-hoa-thi-truong',
        'vong-quay-tong-tai-san',
        'vwap',
      ].sort(),
    );
  });

  it.skipIf(dangLoc)('tổng số khung: 112 — 82 derived, 23 linked, 7 defined', () => {
    const dem = { derived: 0, linked: 0, defined: 0 };
    for (const spec of ALL_FORMULAS) {
      for (const entry of HOW_TO[spec.id]?.entries ?? []) dem[entry.kind] += 1;
    }
    expect(dem).toEqual({ derived: 82, linked: 23, defined: 7 });
  });

  it('công thức không có khung nào phải ghi lý do — và có khung thì không ghi', () => {
    const sai: string[] = [];
    for (const spec of canKiem) {
      const howTo = HOW_TO[spec.id];
      if (howTo === undefined) continue;
      const coLyDo = (howTo.whyNone ?? '').trim() !== '';
      if (howTo.entries.length === 0 && !coLyDo)
        sai.push(`${spec.id}: không có khung mà thiếu whyNone`);
      if (howTo.entries.length > 0 && coLyDo) sai.push(`${spec.id}: có khung mà vẫn ghi whyNone`);
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });
});

describe('khung cách tính — liên kết', () => {
  it('liên kết tới công thức có thật, không trỏ về chính nó', () => {
    const sai: string[] = [];
    for (const { spec, entry } of moiKhung()) {
      const formulaId = entry.kind === 'defined' ? undefined : entry.formulaId;
      if (formulaId === undefined) continue;
      if (!byId.has(formulaId))
        sai.push(`${spec.id} · ${entry.symbol}: "${formulaId}" không tồn tại`);
      if (formulaId === spec.id) sai.push(`${spec.id} · ${entry.symbol}: liên kết về chính nó`);
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  it('khung "linked" trỏ vào một ô nhập có thật, cùng đơn vị với kết quả công thức đích', () => {
    const sai: string[] = [];
    for (const { spec, entry } of moiKhung()) {
      if (entry.kind !== 'linked') continue;
      const variable = spec.variables.find((v) => v.key === entry.variableKey);
      const dich = byId.get(entry.formulaId);
      if (variable === undefined) {
        sai.push(`${spec.id} · ${entry.symbol}: không có ô "${entry.variableKey}"`);
      } else if (dich !== undefined && variable.unit !== dich.resultUnit) {
        sai.push(
          `${spec.id} · ${entry.symbol}: ô tính bằng "${variable.unit}" mà ${dich.id} ra "${dich.resultUnit}"`,
        );
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  it('mỗi cạnh dependsOn có một khung "linked" trên đúng ô nhận, trỏ đúng công thức cấp số', () => {
    const sai: string[] = [];
    for (const spec of canKiem) {
      for (const dependency of spec.dependsOn ?? []) {
        const coKhung = (HOW_TO[spec.id]?.entries ?? []).some(
          (entry) =>
            entry.kind === 'linked' &&
            entry.variableKey === dependency.variableKey &&
            entry.formulaId === dependency.formulaId,
        );
        if (!coKhung) {
          sai.push(
            `${spec.id}.${dependency.variableKey} ← ${dependency.formulaId}: thiếu khung linked`,
          );
        }
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });
});

describe('khung cách tính — các bước', () => {
  it('số bước đúng khuôn, và bước cuối bắt đầu bằng chính ký hiệu rồi dấu bằng', () => {
    const sai: string[] = [];
    for (const { spec, entry } of moiKhung()) {
      if (entry.kind === 'linked') continue;
      const toiDa = entry.kind === 'derived' ? 3 : 2;
      const noi = `${spec.id} · ${entry.symbol}`;
      if (entry.steps.length < 1 || entry.steps.length > toiDa) {
        sai.push(`${noi}: ${String(entry.steps.length)} bước, được 1 tới ${String(toiDa)}`);
        continue;
      }
      const cuoi = entry.steps[entry.steps.length - 1]?.latex ?? '';
      if (!new RegExp(`^\\s*${escapeRegExp(entry.symbol)}\\s*=`).test(cuoi)) {
        sai.push(`${noi}: bước cuối "${cuoi}" không bắt đầu bằng "${entry.symbol} ="`);
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  it('dòng chữ của mỗi bước theo đúng luật dòng công thức, ở cả hai ngôn ngữ', () => {
    const sai: string[] = [];
    for (const { spec, entry } of moiKhung()) {
      for (const [i, step] of stepsOf(entry).entries()) {
        const hinh = numbersInLatex(step.latex);
        const veHinh = equationsInLatex(step.latex);
        const khoiHinh = blocksInLatex(step.latex);
        for (const ngon of ['vi', 'en'] as const) {
          /*
           * KHÔNG `.trim()`: khung cách tính `split('\n')` đúng chuỗi này, nên cắt hai đầu trước khi
           * đo là bịt mắt chính hai phép kiểm "dòng rỗng" và "thừa khoảng trắng" của luật 6 — một
           * `\n` thừa ở cuối sẽ lọt cửa gác mà vẫn đẻ ra một khối chữ rỗng trên khung.
           */
          const chu = step.expression[ngon];
          const noi = `${spec.id} · ${entry.symbol} · bước ${String(i + 1)} · ${ngon}`;
          for (const loi of expressionBlockProblems(chu)) sai.push(`${noi}: ${loi}`);
          // Luật 6 cho bước: hình của bước ngắt ở `\quad` thì chữ của bước cũng xuống dòng ở đó.
          const soDong = expressionLines(chu).length;
          if (soDong !== khoiHinh) {
            sai.push(`${noi}: hình ${String(khoiHinh)} khối, chữ ${String(soDong)} dòng`);
          }
          if (/\.$/.test(chu)) sai.push(`${noi}: kết bằng dấu chấm`);
          if (chu.length > 200) sai.push(`${noi}: dài ${String(chu.length)} ký tự, quá 200`);
          const soChu = numbersInText(chu, ngon);
          if (JSON.stringify(soChu) !== JSON.stringify(hinh)) {
            sai.push(
              `${noi}: hằng số trong chữ [${soChu.join(', ')}] khác trong hình [${hinh.join(', ')}]`,
            );
          }
          // Luật 5, y như dòng chữ dưới hình chính: hình mấy vế thì chữ mấy vế.
          const veChu = equationsInText(chu);
          if (veChu !== veHinh) {
            sai.push(`${noi}: hình ${String(veHinh)} vế, chữ ${String(veChu)} vế`);
          }
        }
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  it('cụm chữ: có ở cả hai ngôn ngữ hoặc không ở ngôn ngữ nào, và chép nguyên văn dòng chữ', () => {
    const sai: string[] = [];
    for (const { spec, entry } of moiKhung()) {
      const noi = `${spec.id} · ${entry.symbol}`;
      const vi = entry.phrases?.vi ?? [];
      const en = entry.phrases?.en ?? [];
      if ((vi.length === 0) !== (en.length === 0)) {
        sai.push(`${noi}: có cụm ở một ngôn ngữ mà không có ở ngôn ngữ kia`);
      }
      for (const [ngon, cum] of [
        ['vi', vi],
        ['en', en],
      ] as const) {
        const dong = spec.expression?.[ngon] ?? '';
        for (const phrase of cum) {
          if (!dong.includes(phrase))
            sai.push(`${noi} · ${ngon}: "${phrase}" không có trong dòng chữ`);
          /*
           * Cụm phải nằm gọn trong MỘT dòng: tầng dựng cắt dòng chữ theo `\n` rồi mới tìm cụm trong
           * từng dòng, nên một cụm vắt qua chỗ ngắt sẽ không khớp ở đâu cả và làm đỏ `next build`.
           * Bắt ở đây thì lỗi chỉ đúng tên file dữ liệu phải sửa.
           */
          if (expressionLines(phrase).length > 1)
            sai.push(`${noi} · ${ngon}: "${phrase}" vắt qua hai dòng`);
        }
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  it('không chữ nào của khung dùng gạch ngang — đứng cạnh dấu trừ là đọc nhầm', () => {
    const sai: string[] = [];
    for (const { spec, entry } of moiKhung()) {
      const chu = [
        ...stepsOf(entry).flatMap((s) => [s.expression.vi, s.expression.en]),
        ...(entry.phrases?.vi ?? []),
        ...(entry.phrases?.en ?? []),
      ];
      for (const text of chu) {
        if (DASHES.test(text)) sai.push(`${spec.id} · ${entry.symbol}: "${text}"`);
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  it('khung "derived" chỉ ra được mẩu mã calc mà nó tả', () => {
    const sai: string[] = [];
    const fileOf = new Map<string, string>();
    for (const [file, ban] of Object.entries(HOW_TO_BY_FILE)) {
      for (const id of Object.keys(ban)) fileOf.set(id, file);
    }
    for (const { spec, entry } of moiKhung()) {
      if (entry.kind !== 'derived') continue;
      const noi = `${spec.id} · ${entry.symbol}`;
      if (entry.calcEvidence.length === 0) {
        sai.push(`${noi}: thiếu calcEvidence`);
        continue;
      }
      const file = fileOf.get(spec.id);
      const ma = file === undefined ? undefined : maCuaCongThuc(file, spec.id);
      if (ma === undefined) {
        sai.push(`${noi}: không đọc được mã của công thức`);
        continue;
      }
      for (const manh of entry.calcEvidence) {
        if (!ma.includes(gonKhoangTrang(manh))) sai.push(`${noi}: mã calc không có "${manh}"`);
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });
});
