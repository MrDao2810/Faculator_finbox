/**
 * Kiểm một bản nháp câu điền số (JSON) bằng đúng các cửa gác của `quiz.test.ts` — dùng tạm cho
 * đợt "ví dụ tính trên mã thật", xoá sau khi chèn câu vào ngân hàng.
 *
 *   npx vite-node .tmp-draft-check.ts <đường-dẫn-bản-nháp.json> [...]
 */
import { readFileSync } from 'node:fs';
import { runFormula } from './src/core/calc/run';
import type { CalcContext } from './src/core/calc/types';
import { findFormulaModule } from './src/core/formulas/index';
import { MARKET_CONFIG } from './src/core/market';
import { scheduleOrDefault } from './src/core/market/resolve';
import {
  arithmeticOf,
  blanksOf,
  evaluateWorked,
  workedProblems,
} from './src/core/quiz/worked-line';
import { isAccepted, type QuizDienSo } from './src/core/quiz/types';

const CTX: CalcContext = { asOf: '2026-08-04', schedule: scheduleOrDefault(MARKET_CONFIG) };
const soTrong = (text: string): string[] => text.match(/\d[\d.,]*\d|\d/g) ?? [];
const ANH = [
  'amortis',
  'annualis',
  'capitalis',
  'normalis',
  'organis',
  'utilis',
  'behaviour',
  'colour',
  'favour',
  'labour',
  'centre',
  'licence',
  'modelling',
  'cancelled',
  'practise',
  'maths',
  'whilst',
];
const KIND = ['doc-ket-qua', 'dieu-kien', 'quy-uoc', 'dinh-che', 'hau-qua'];
const SRC = ['trai-nghiem', 'chuyen-gia', 'giao-khoa'];
const boTrich = (s: string) => s.replace(/“[^”]*”/g, '');

let tongLoi = 0;
for (const duong of process.argv.slice(2)) {
  const loi: string[] = [];
  const canh: string[] = [];
  let q: QuizDienSo;
  try {
    q = JSON.parse(readFileSync(duong, 'utf8')) as QuizDienSo;
  } catch (e) {
    console.log(`✗ ${duong}: JSON hỏng — ${(e as Error).message}`);
    tongLoi += 1;
    continue;
  }
  const f = findFormulaModule(q.formulaId);
  if (f === undefined) loi.push(`formulaId "${q.formulaId}" không có trong Registry`);
  if (q.format !== 'dien-so') loi.push('format phải là "dien-so"');
  if (q.evidence !== 'tinh-toan') loi.push('evidence phải là "tinh-toan"');
  if (!KIND.includes(q.kind)) loi.push(`kind "${q.kind}" không hợp lệ`);
  if (!/^https:\/\/[^\s]+$/.test(q.source?.url ?? ''))
    loi.push('source.url phải là https, không khoảng trắng');
  if (!SRC.includes(q.source?.kind)) loi.push(`source.kind phải là một trong ${SRC.join(', ')}`);
  if (typeof q.source?.vietnam !== 'boolean') loi.push('source.vietnam phải là true/false');
  if (q.source?.effectiveFrom !== undefined) loi.push('không khai source.effectiveFrom');

  // Đủ hai ngôn ngữ.
  const chu: Array<[string, { vi?: string; en?: string } | undefined]> = [
    ['prompt', q.prompt],
    ['explain', q.explain],
    ['unit', q.unit],
    ['worked', q.worked],
    ['giai.tinh', q.giai?.tinh],
    ['giai.thaySo', q.giai?.thaySo],
    ['giai.ketQua', q.giai?.ketQua],
    ...(q.facts ?? []).flatMap(
      (x, i): Array<[string, { vi?: string; en?: string }]> => [
        [`facts[${i}].label`, x.label],
        [`facts[${i}].value`, x.value],
      ],
    ),
    ...(q.giai?.gan ?? []).map((g): [string, { vi?: string; en?: string } | undefined] => [
      `gan "${g.kyHieu}"`,
      g.giaTri ?? g.moTa,
    ]),
  ];
  for (const [ten, t] of chu) {
    if (!t?.vi?.trim()) loi.push(`${ten}: thiếu bản vi`);
    if (!t?.en?.trim()) loi.push(`${ten}: thiếu bản en`);
    for (const g of ANH)
      if (new RegExp(`\\b\\w*${g}\\w*\\b`, 'i').test(t?.en ?? ''))
        loi.push(`${ten}: chính tả Anh-Anh "${g}…" — dùng bản Mỹ`);
  }
  if ((q.facts ?? []).length === 0) loi.push('facts rỗng');

  // Gạch ngang dài: cấm ở mọi chữ cạnh công thức, ngoài đoạn trích “…”.
  for (const [ten, t] of chu) {
    if (ten === 'explain') continue;
    for (const ngon of ['vi', 'en'] as const)
      if (/[—–]/.test(boTrich(t?.[ngon] ?? '')))
        loi.push(`${ten}.${ngon}: có gạch ngang dài — hoặc –`);
  }
  for (const ngon of ['vi', 'en'] as const)
    if (/[—–]/.test(boTrich(q.explain?.[ngon] ?? '')))
      canh.push(`explain.${ngon} có gạch ngang dài ngoài đoạn trích`);

  // Lời giải: có đoạn trích nguyên văn, không nhãn Nguồn, sàn 120 ký tự tiếng Việt.
  if (!/“[^”]+”/.test(q.explain?.vi ?? ''))
    loi.push('explain.vi phải trích NGUYÊN VĂN phép tính của bài nguồn trong “…”');
  if ([q.explain?.vi ?? '', q.explain?.en ?? ''].some((s) => /(?:Nguồn|Source):/.test(s)))
    loi.push('explain không được tự ghi nhãn "Nguồn:"/"Source:"');
  const CO_DAU = /[àáảãạăâđèéẻẽẹêìíỉĩịòóỏõọôơùúủũụỳýỷỹỵ]/i;
  const trichAnh = [...(q.explain?.vi ?? '').matchAll(/“([^”]*)”/g)].some(
    (m) => (m[1] ?? '').length > 25 && !CO_DAU.test(m[1] ?? ''),
  );
  if (trichAnh && boTrich(q.explain.vi).trim().length < 120)
    loi.push('explain.vi trích tiếng Anh thì phần tiếng Việt ngoài ngoặc kép phải ≥ 120 ký tự');

  // Dòng công thức.
  const wv = q.worked?.vi ?? '';
  const we = q.worked?.en ?? '';
  const pv = workedProblems(wv);
  if (pv.length) loi.push(`worked.vi: ${pv.join('; ')}`);
  const pe = workedProblems(we);
  if (pe.length) loi.push(`worked.en: ${pe.join('; ')}`);
  const ov = blanksOf(wv);
  if (ov.length > 5) loi.push(`quá 5 ô trống (${ov.length})`);
  if (blanksOf(we).length !== ov.length) loi.push('số ô trống hai bản lệch nhau');
  if (/\d,\d/.test(we)) loi.push('worked.en còn dấu ngăn nghìn (viết liền: 37300)');
  const dem = (s: string) => (s.match(/[0-9]/g) ?? []).length;
  if (dem(we) !== dem(wv)) loi.push(`số chữ số hai bản worked lệch nhau (${dem(wv)} / ${dem(we)})`);
  if (!Number.isFinite(q.expected)) loi.push('expected phải là số hữu hạn');
  if (!(q.tolerance?.value > 0) || !['tuyet-doi', 'tuong-doi'].includes(q.tolerance?.kind))
    loi.push('tolerance phải là {kind: tuyet-doi|tuong-doi, value > 0}');
  else if (!isAccepted(q, q.expected)) loi.push('chính expected không được chấp nhận');
  for (const [ngon, dong] of [
    ['vi', wv],
    ['en', we],
  ] as const) {
    const bt = arithmeticOf(dong);
    const gia = bt === null ? null : evaluateWorked(bt);
    if (gia === null) loi.push(`worked.${ngon}: bóc ngoặc ra không tính lại được`);
    else if (Number.isFinite(q.expected) && q.tolerance && !isAccepted(q, gia))
      loi.push(`worked.${ngon} tính ra ${gia}, expected khai ${q.expected}`);
    else console.log(`  worked.${ngon} tính ra ${gia}`);
  }

  // Ô trống phải là con số bảng Số liệu ghi NGUYÊN VĂN.
  for (const [ngon, dong] of [
    ['vi', wv],
    ['en', we],
  ] as const) {
    const bang = new Set((q.facts ?? []).flatMap((x) => soTrong(x.value?.[ngon] ?? '')));
    for (const o of blanksOf(dong)) {
      const so = o.replace(/^[−-]/, '');
      if (!bang.has(so))
        loi.push(`ô [${o}] (${ngon}) không có nguyên văn trong cột giá trị của facts`);
    }
  }

  // verify.
  const chuoi =
    f?.spec.tests.some((t) => t.series || t.bars || t.marketSeries || t.cashflows) ?? false;
  if (q.verify === undefined) {
    if (!chuoi)
      loi.push(
        'công thức tính từ ô nhập: phải khai verify {inputs, expected, tolerance} để calc đối chiếu',
      );
  } else if (f) {
    if (chuoi) canh.push('công thức ăn chuỗi giá: verify không tả đủ đề bài, cân nhắc bỏ');
    const out = runFormula(f, q.verify.inputs, CTX);
    if (out.warning) loi.push(`verify: calc báo ${out.warning.code} — ${out.warning.message.vi}`);
    else if (out.value === null) loi.push('verify: calc không ra số');
    else {
      console.log(`  calc ra ${out.value}`);
      if (Math.abs(out.value - q.verify.expected) > q.verify.tolerance)
        loi.push(`verify: calc ra ${out.value}, verify.expected khai ${q.verify.expected}`);
      if (!isAccepted(q, out.value))
        canh.push(
          `calc ra ${out.value} nằm ngoài tolerance quanh expected ${q.expected} — chỉ đúng khi cố ý (vd IRR)`,
        );
    }
  }

  // Lời giải có cấu trúc.
  const g = q.giai;
  if (g === undefined) loi.push('thiếu giai');
  else {
    if (g.congThuc !== undefined) loi.push('không dùng giai.congThuc');
    for (const ngon of ['vi', 'en'] as const) {
      const dong = q.worked?.[ngon];
      if (dong && g.thaySo?.[ngon] !== arithmeticOf(dong))
        loi.push(
          `giai.thaySo.${ngon} phải ĐÚNG BẰNG worked.${ngon} bóc ngoặc: "${arithmeticOf(dong)}"`,
        );
    }
    const gan = g.gan ?? [];
    if (gan.length === 0) loi.push('giai.gan rỗng');
    const spec = f?.spec;
    for (const [i, d] of gan.entries()) {
      if (gan.findIndex((x) => x.kyHieu === d.kyHieu) !== i)
        loi.push(`gan: "${d.kyHieu}" khai hai lần`);
      if ((d.giaTri === undefined) === (d.moTa === undefined))
        loi.push(`gan "${d.kyHieu}": đúng một trong giaTri/moTa`);
      const hopLe =
        (spec?.symbols ?? []).some((r) => r.latex === d.kyHieu) ||
        (/^\\text\{[^{}]+\}$/.test(d.kyHieu) && (spec?.latex ?? '').includes(d.kyHieu));
      if (!hopLe)
        loi.push(`gan: ký hiệu "${d.kyHieu}" không có trong bảng ký hiệu / \\text{} của latex`);
    }
    for (const ngon of ['vi', 'en'] as const) {
      const nguon = [
        ...(q.facts ?? []).flatMap((x) => [x.value?.[ngon] ?? '', x.label?.[ngon] ?? '']),
        q.prompt?.[ngon] ?? '',
        q.worked?.[ngon] ?? '',
        g.thaySo?.[ngon] ?? '',
      ];
      const co = new Set(nguon.flatMap(soTrong));
      for (const d of gan)
        for (const so of soTrong((d.giaTri ?? d.moTa)?.[ngon] ?? ''))
          if (!co.has(so))
            loi.push(
              `gan "${d.kyHieu}" [${ngon}]: số "${so}" không có nguyên văn trong đề (facts/prompt/worked)`,
            );
    }
    const daGan = new Set(gan.flatMap((d) => soTrong((d.giaTri ?? d.moTa)?.vi ?? '')));
    for (const o of new Set(blanksOf(wv)))
      if (!daGan.has(o.replace(/^[−-]/, ''))) loi.push(`ô [${o}] chưa có ký hiệu nào ở giai.gan`);
  }

  tongLoi += loi.length;
  console.log(
    loi.length ? `✗ ${duong}\n${loi.map((x) => `  - ${x}`).join('\n')}` : `✓ ĐẠT ${duong}`,
  );
  for (const x of canh) console.log(`  ! ${x}`);
}
process.exit(tongLoi ? 1 : 0);
