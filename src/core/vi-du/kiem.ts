import { runFormula } from '../calc/run';
import type { CalcContext, FormulaModule } from '../calc/types';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { evaluateWorked, expressionShape } from '../quiz/worked-line';
import type { ViDuGiai } from './types';

/**
 * Luật của lời giải khối Ví dụ — MỘT chỗ, cho cả ca kiểm lẫn công cụ soát bản nháp lúc soạn.
 *
 * Trả mảng rỗng là đạt. Mỗi lỗi là một câu nói rõ chỗ sai, để người soạn sửa được ngay mà không phải
 * đọc lại luật. Cùng tinh thần các cửa gác Thay số của bài tập (`quiz.test.ts`), và cùng giới hạn
 * của chúng: máy KHÔNG thấy được việc gán nhầm hai con số cùng đơn vị (giá vào EPS, EPS vào giá), nên
 * mỗi dòng `gan` vẫn phải có người đọc theo nghĩa.
 */

/** Ngày tra hằng số — cùng mốc `formulas.test.ts` dùng để đối chiếu ví dụ với `calc`. */
const CTX: CalcContext = { asOf: '2026-08-04', schedule: scheduleOrDefault(MARKET_CONFIG) };

/** Mọi con số trong một chuỗi, giữ nguyên cách viết: "72.700", "0,15", "11", "2026". */
export const soTrong = (text: string): string[] => text.match(/\d[\d.,]*\d|\d/g) ?? [];

const GACH_DAI = /[—–]/;

/**
 * Công thức mà hình KHÔNG có phép tính nào để đặt số vào — được phép bỏ dòng "Áp vào công thức".
 * `chuoi-phien-giam-dai-nhat` là `L = max{k : r_{t+1} < 0, …}`: đếm rồi lấy lớn nhất. Viết "4" vào
 * dòng ấy chỉ lặp lại dòng Kết quả ngay dưới; dòng Thay số đã tả hai chuỗi giảm bằng lời. GHIM: thêm
 * một id là mở thêm một chỗ lời giải không có phép tính, nên phải có lý do như trên.
 */
export const KHONG_CO_PHEP_TINH: ReadonlySet<string> = new Set(['chuoi-phien-giam-dai-nhat']);

/**
 * Công thức mà hình là PHƯƠNG TRÌNH ẨN — kết quả của ví dụ là nghiệm phải dò, nên dòng "Áp vào công
 * thức" giữ đúng hình và ra `thaySoRa` chứ không ra kết quả (xem docblock `ViDuGiai.thaySoRa`). XIRR:
 * tổng dòng tiền quy về hôm nay ≈ 0. IRR niên kim: vế phải ra đúng khoản vay P. GHIM, cùng lý do.
 */
export const PHUONG_TRINH_AN: ReadonlySet<string> = new Set(['xirr', 'irr-nien-kim']);

/** Kết quả `calc` cho đúng bộ số của ví dụ, kèm các đại lượng trung gian (`extras`). */
export function chayViDu(formula: FormulaModule) {
  const { example } = formula.spec;
  const coChuoi =
    example.series !== undefined ||
    example.bars !== undefined ||
    example.marketSeries !== undefined ||
    example.cashflows !== undefined;
  const ctx: CalcContext = coChuoi
    ? {
        ...CTX,
        series: example.series,
        bars: example.bars,
        marketSeries: example.marketSeries,
        cashflows: example.cashflows,
      }
    : CTX;
  return runFormula(formula, example.inputs, ctx);
}

/** Cách viết một số theo kiểu Việt ("72.700", "6,8") và kiểu Anh viết liền ("72700", "6.8"). */
function haiCachViet(value: number): string[] {
  const vi = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 10 }).format(value);
  return [vi, String(value), vi.replace(/^-/, ''), String(Math.abs(value))];
}

/**
 * Tập con số được phép xuất hiện trong dòng Thay số: những gì ví dụ ĐÃ nói ra — tiêu đề, câu diễn
 * giải, tên nguồn, bộ số nhập, chuỗi giá và ngày của nó — cộng dòng "Áp vào công thức". Một con số
 * ngoài tập này là con số người soạn tự suy ra; viết phép suy bằng lời, hoặc đưa nó vào dòng tính.
 */
function soDuocPhep(formula: FormulaModule, giai: ViDuGiai, ngon: 'vi' | 'en'): Set<string> {
  const { example } = formula.spec;
  const chu = [
    example.title[ngon],
    example.note?.[ngon] ?? '',
    example.source?.[ngon] ?? '',
    giai.thaySo?.[ngon] ?? '',
  ];
  const so: number[] = [
    /*
     * Công thức không có phép tính (đếm rồi lấy lớn nhất): con số của kết quả CHÍNH LÀ thứ dòng Thay số
     * phải nói ra ("hai chuỗi cùng dài 4 phiên"), vì không còn dòng "Áp vào công thức" nào mang nó.
     */
    ...(KHONG_CO_PHEP_TINH.has(formula.spec.id) ? [example.expected] : []),
    ...Object.values(example.inputs),
    ...(example.series ?? []),
    ...(example.marketSeries ?? []),
    ...(example.bars ?? []).flatMap((r) => [r.open, r.high, r.low, r.close, r.volume ?? 0]),
    ...(example.cashflows ?? []).map((c) => c.amount),
    ...(example.dataset?.rows ?? []).flatMap((r) => [
      r.open,
      r.high,
      r.low,
      r.close,
      r.volume ?? 0,
    ]),
  ].filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  const ngay = [
    ...(example.dataset?.rows ?? []).map((r) => r.date),
    ...(example.bars ?? []).map((r) => r.date),
    ...(example.cashflows ?? []).map((c) => c.date),
  ].filter((d): d is string => typeof d === 'string');
  const tap = new Set<string>();
  for (const s of chu) for (const t of soTrong(s)) tap.add(t);
  for (const x of so) for (const s of haiCachViet(x)) for (const t of soTrong(s)) tap.add(t);
  for (const d of ngay) for (const t of soTrong(d)) tap.add(t);
  return tap;
}

export function viDuProblems(formula: FormulaModule, giai: ViDuGiai): string[] {
  const loi: string[] = [];
  const { spec } = formula;

  // Đủ hai ngôn ngữ, không gạch ngang dài cạnh công thức.
  const chuCanh: Array<[string, { vi?: string; en?: string } | undefined]> = [
    ['tinh', giai.tinh],
    ...(giai.thaySo === undefined
      ? []
      : [['thaySo', giai.thaySo] as [string, { vi?: string; en?: string }]]),
    ...giai.gan.map((d): [string, { vi?: string; en?: string } | undefined] => [
      `gan "${d.kyHieu}"`,
      d.giaTri ?? d.moTa,
    ]),
    ...giai.nguon.map((n, i): [string, { vi?: string; en?: string } | undefined] => [
      `nguon[${i}].nhan`,
      n.nhan ?? { vi: '-', en: '-' },
    ]),
  ];
  for (const [ten, t] of chuCanh) {
    for (const ngon of ['vi', 'en'] as const) {
      const s = t?.[ngon];
      if (s === undefined || s.trim() === '') loi.push(`${ten}: thiếu bản ${ngon}`);
      else if (GACH_DAI.test(s)) loi.push(`${ten}.${ngon}: có gạch ngang dài — hoặc –`);
    }
  }

  // Dòng "Áp vào công thức" tính lại phải ra đúng kết quả calc của ví dụ.
  const out = chayViDu(formula);
  if (out.value === null) loi.push(`calc không ra số cho ví dụ: ${out.warning?.message.vi ?? ''}`);
  const thaySo = giai.thaySo;
  if (thaySo === undefined) {
    if (!KHONG_CO_PHEP_TINH.has(spec.id))
      loi.push(
        'thiếu thaySo — chỉ công thức trong KHONG_CO_PHEP_TINH được bỏ dòng Áp vào công thức',
      );
  } else {
    const gia = evaluateWorked(thaySo.vi);
    const ra = giai.thaySoRa;
    if (ra !== undefined && !PHUONG_TRINH_AN.has(spec.id))
      loi.push('thaySoRa chỉ dành cho phương trình ẩn trong PHUONG_TRINH_AN');
    if (gia === null) loi.push(`thaySo.vi không tính lại được: "${thaySo.vi}"`);
    else if (ra !== undefined) {
      /*
       * Phương trình ẩn: dòng tính ra `thaySoRa`. Vế bằng 0 (XIRR) thì không có sai số tương đối để
       * so — lấy 0,5% của con số lớn nhất trong dòng làm thước: tổng 21,8 triệu ₫ lệch vài chục đồng vì
       * nghiệm đã làm tròn là đúng, lệch vài trăm nghìn là sai.
       */
      const thuoc =
        ra.giaTri === 0
          ? 0.005 * Math.max(...soTrong(thaySo.vi).map((x) => Math.abs(evaluateWorked(x) ?? 0)))
          : 0.005 * Math.abs(ra.giaTri);
      if (Math.abs(gia - ra.giaTri) > thuoc)
        loi.push(`thaySo.vi tính ra ${gia}, phương trình ẩn phải ra ${ra.giaTri}`);
    } else if (out.value !== null) {
      const lech = Math.abs(gia - out.value);
      if (lech > Math.max(0.005 * Math.abs(out.value), 0.01))
        loi.push(`thaySo.vi tính ra ${gia}, calc của ví dụ ra ${out.value}`);
    }
    if (/d,d/.test(thaySo.en)) loi.push('thaySo.en còn dấu ngăn nghìn (viết liền: 72700)');
    /*
     * Dòng này được VẼ bằng `CongThucDien` (căn có vạch, phân số xếp tầng) từ cây dựng lúc build; bản
     * nào không dựng được cây thì âm thầm lùi về chữ trơn "√(…)" — đúng thứ chủ dự án gọi là lỗi.
     */
    for (const ngon of ['vi', 'en'] as const)
      if (expressionShape(thaySo[ngon]) === null)
        loi.push(`thaySo.${ngon} không dựng được cây để vẽ`);
    const dem = (x: string) => (x.match(/[0-9]/g) ?? []).length;
    if (dem(thaySo.en) !== dem(thaySo.vi))
      loi.push(`thaySo: số chữ số hai bản lệch nhau (${dem(thaySo.vi)} / ${dem(thaySo.en)})`);
  }
  if (PHUONG_TRINH_AN.has(spec.id) && giai.thaySoRa === undefined)
    loi.push('công thức là phương trình ẩn: phải khai thaySoRa');

  // Dòng Thay số: ký hiệu có thật, mỗi ký hiệu một dòng, đúng một trong giá trị / câu mô tả.
  if (giai.gan.length === 0) loi.push('gan rỗng');
  for (const [i, d] of giai.gan.entries()) {
    if (giai.gan.findIndex((x) => x.kyHieu === d.kyHieu) !== i)
      loi.push(`gan: "${d.kyHieu}" khai hai lần`);
    if ((d.giaTri === undefined) === (d.moTa === undefined))
      loi.push(`gan "${d.kyHieu}": đúng một trong giaTri/moTa`);
    const hopLe =
      (spec.symbols ?? []).some((r) => r.latex === d.kyHieu) ||
      (/^\\text\{[^{}]+\}$/.test(d.kyHieu) && spec.latex.includes(d.kyHieu));
    if (!hopLe)
      loi.push(`gan: ký hiệu "${d.kyHieu}" không có trong bảng ký hiệu / \\text{} của latex`);
  }
  for (const ngon of ['vi', 'en'] as const) {
    const co = soDuocPhep(formula, giai, ngon);
    for (const d of giai.gan)
      for (const so of soTrong((d.giaTri ?? d.moTa)?.[ngon] ?? ''))
        if (!co.has(so))
          loi.push(`gan "${d.kyHieu}" [${ngon}]: số "${so}" không có trong ví dụ hay dòng Áp vào`);
  }

  // Link nguồn.
  for (const n of giai.nguon)
    if (!/^https:\/\/[^\s]+$/.test(n.url))
      loi.push(`nguon: "${n.url}" phải là https, không khoảng trắng`);
  if (giai.nguon.length > 1 && giai.nguon.some((n) => n.nhan === undefined))
    loi.push('nguon: có từ hai link thì mỗi link phải có nhan nói nó cho con số nào');

  return loi;
}
