/**
 * Cửa gác NỘI DUNG — đối chiếu 432 đoạn diễn giải của 108 công thức với chính `spec`, `calc` và
 * bộ số liệu mẫu.
 *
 * ## Nó gác cái gì, và vì sao không cửa nào khác gác được
 *
 * Mọi cửa kiểm còn lại của dự án đều gác CON SỐ: `formulas.test.ts` chạy `spec.tests`, `chart.test.ts`
 * chốt tổng các chặng, `registry.test.ts` đếm nhóm. Không cái nào đọc câu chữ. Mà lỗi trong câu chữ
 * thì không bao giờ tự lộ: mỗi câu đều là tiếng Việt hợp lệ, và người duyệt đọc tuần tự 108 công
 * thức sẽ không nhớ nổi công thức thứ 12 đã nói gì để mà thấy công thức thứ 87 mâu thuẫn.
 *
 * Tiền lệ có thật, cả ba đều đã lên sản phẩm: mô tả nhóm Rủi ro từng kể tên "Beta" — một công thức
 * KHÔNG TỒN TẠI — và mô tả ô beta ở `capm` với `ty-so-treynor` từng trỏ người dùng sang chính cái
 * tên ấy. Không cửa kiểm nào đỏ, phải mắt người mới bắt được, và bắt được là do tình cờ.
 *
 * ## Nó KHÔNG gác cái gì
 *
 * Nó không biết một câu giải thích tài chính có ĐÚNG hay không, có dễ hiểu với người mới hay không.
 * Đó vẫn là việc của người rà nội dung (gói chặn v0.1 thứ ba). Cửa này chỉ dọn sạch nhóm lỗi cơ học
 * để người ấy khỏi mất thời gian vào chúng.
 *
 * ## Vì sao đặt ở tầng Application chứ không ở `src/core`
 *
 * Phép kiểm H đối chiếu prose với `@/data/samples.ts`, mà CON-02 cấm `src/core` gọi ngược lên tầng
 * Data. Application được phép chạm cả hai.
 *
 * ## Ba phép kiểm ĐÃ THỬ RỒI BỎ — đừng dựng lại
 *
 * Bản đầu có bảy phép và ra 189 báo động, trong đó dưới 5 cái là thật. Ba phép sau bị bỏ vì tiền đề
 * của chúng sai, không phải vì khó sửa:
 *
 * - *"mọi số trong `example.title` phải là một giá trị đầu vào"* — 50 báo động, gần như tất cả sai:
 *   "10 năm", "250 phiên", "biểu phí HOSE 2026" đều là bối cảnh hợp lệ.
 * - *"đơn vị nêu trong prose phải là đơn vị của công thức"* — 53 báo động, tất cả sai: tiêu đề mô tả
 *   Ô NHẬP (`92.000 ₫/CP`) chứ không mô tả kết quả (`lần`).
 * - *"mọi số trong `example.note` phải dẫn ra được từ ví dụ"* — 66 báo động, gần như tất cả sai:
 *   "quy tắc 72", "ngưỡng RSI 70", "giá thị trường 92.000" là đối chiếu bên ngoài, đúng chỗ.
 *
 * Một lỗi kỹ thuật đáng nhớ từ bản ấy: dải regex `[A-ZÀ-Ỹ]` trong Unicode chứa **cả chữ thường**
 * tiếng Việt, nên nó nuốt "công thức đầu tiên…" thành một danh từ riêng.
 */

import { describe, expect, it } from 'vitest';

import { SAMPLE_PRESETS } from '@/data/samples';

import { runFormula } from '../core/calc/run';
import type { CalcContext } from '../core/calc/types';
import { buildChartModel } from '../core/chart/build';
import { sweepCandidates } from '../core/chart/sweep';
import { FORMULA_MODULES } from '../core/formulas';
import { MARKET_CONFIG } from '../core/market';
import { scheduleOrDefault } from '../core/market/resolve';
import { defaultInputs } from '../core/registry/build';
import { CATEGORIES } from '../core/registry/categories';
import type { FormulaSpec } from '../core/registry/types';

const CTX: CalcContext = { asOf: '2026-08-04', schedule: scheduleOrDefault(MARKET_CONFIG) };

/** Ngắn hơn thế này thì là mẩu cụt chứ không phải câu gọn. */
const TOI_THIEU = 40;

interface Finding {
  id: string;
  truong: string;
  chiTiet: string;
}

/**
 * Bốn mục diễn giải bắt buộc của FR-03.
 *
 * Mỗi mục nay là `Bilingual` (gói dịch tiếng Anh) — cửa gác này soi phần tiếng Việt vì đó là nội
 * dung đã được rà soát nội dung / là nguồn sự thật (xem docblock đầu file); nó KHÔNG mở rộng sang
 * kiểm câu tiếng Anh.
 */
function dienGiai(spec: FormulaSpec): Array<readonly [string, string]> {
  return [
    ['explanation.meaning', spec.explanation.meaning.vi],
    ['explanation.whenToUse', spec.explanation.whenToUse.vi],
    ['explanation.howToRead', spec.explanation.howToRead.vi],
    ['explanation.commonMistakes', spec.explanation.commonMistakes.vi],
  ];
}

/** Mọi đoạn prose người dùng đọc được trên màn chi tiết — luôn đọc `.vi`, lý do xem `dienGiai()`. */
function proseOf(spec: FormulaSpec): Array<readonly [string, string]> {
  const out: Array<readonly [string, string]> = [
    ['description', spec.description.vi],
    ...dienGiai(spec),
    ['example.title', spec.example.title.vi],
  ];
  if (spec.example.note !== undefined) out.push(['example.note', spec.example.note.vi]);
  if (spec.note !== undefined) out.push(['note', spec.note.vi]);
  for (const v of spec.variables) {
    if (v.description !== undefined) {
      out.push([`variables.${v.key}.description`, v.description.vi]);
    }
  }
  return out;
}

const moduleOf = (id: string) => FORMULA_MODULES.find((f) => f.spec.id === id);

/** Chạy ví dụ của một công thức đúng như màn chi tiết chạy nó. */
function ketQuaViDu(spec: FormulaSpec) {
  const formula = moduleOf(spec.id);
  if (formula === undefined) return null;
  const inputs = { ...defaultInputs(spec), ...spec.example.inputs };
  const output = runFormula(formula, inputs, {
    ...CTX,
    ...(spec.example.series === undefined ? {} : { series: spec.example.series }),
    ...(spec.example.bars === undefined ? {} : { bars: spec.example.bars }),
  });
  return { inputs, output };
}

/** Dựng câu báo lỗi liệt kê từng chỗ — đỏ mà không nói ở đâu thì cửa gác vô dụng. */
function moTa(list: ReadonlyArray<Finding>): string {
  return `\n${list.map((f) => `  · ${f.id} — ${f.truong}: ${f.chiTiet}`).join('\n')}\n`;
}

/* ── A ─────────────────────────────────────────────────────────────────────── */

/**
 * Chỉ bắt danh từ riêng THẬT: chuỗi bắt đầu bằng chữ hoa. Câu như "công thức này" hay "công thức
 * trên" có chữ thường nên không lọt vào.
 */
const HOA = 'A-ZÀ-ÞĂĐĨŨƠƯẠ-Ỹ';
const TRO_SANG = new RegExp(
  `(?:công thức|chỉ báo|chỉ số|mô hình)\\s+([${HOA}][\\w${HOA}/]*(?:\\s+[${HOA}][\\w${HOA}/]*)?)`,
  'g',
);

/**
 * Danh từ riêng hợp lệ trong văn nói tài chính mà KHÔNG phải công thức của sản phẩm.
 *
 * Thêm tên mới vào đây là một quyết định có ý thức, và đó là điểm của danh sách này: nếu prose nhắc
 * một cái tên chưa ai duyệt, cửa gác bắt bạn dừng lại một nhịp để hỏi "cái đó có trong sản phẩm
 * không, hay mình đang chỉ người dùng đi tìm thứ không tồn tại".
 */
const TEN_RIENG_CHO_PHEP = new Set([
  'vn30',
  'vn-index',
  'vnindex',
  'hose',
  'hnx',
  'upcom',
  'vsd',
  'graham',
  'wilder',
  'bollinger',
  'sharpe',
  'sortino',
  'treynor',
  'calmar',
  'gordon',
  'capm',
  'dcf',
  'ddm',
  'macd',
  'rsi',
  'ema',
  'sma',
  'atr',
  'var',
  'cvar',
  /*
   * 'beta' TỪNG nằm đây và đó là một lỗ hổng, không phải một quyết định: nó làm câm đúng tiền
   * lệ sáng lập của phép kiểm này (xem docblock đầu file) — "công thức Beta" đi lọt trong khi
   * sản phẩm không có công thức nào tên vậy. Gỡ ở đợt 9; grep toàn repo xác nhận không đoạn
   * prose hợp lệ nào cần nó. Biến `beta` của CAPM/Treynor không bị ảnh hưởng: TRO_SANG chỉ bắt
   * cụm có từ dẫn ("công thức|chỉ báo|chỉ số|mô hình" + Tên), còn "hệ số beta" thì không khớp.
   */
]);

/** Tên công thức Registry đang có, gom mọi cách gọi. */
function tenCongThuc(): Set<string> {
  const ten = new Set<string>();
  for (const { spec } of FORMULA_MODULES) {
    ten.add(spec.name.vi.toLowerCase());
    ten.add(spec.name.en.toLowerCase());
    ten.add((spec.name.vi.split(/\s[—–(]/)[0] ?? '').trim().toLowerCase());
    ten.add(spec.id.replace(/-/g, ' '));
  }
  return ten;
}

function troSangThuKhongCo(): Finding[] {
  const ten = tenCongThuc();

  const nguon: Array<readonly [string, string, string]> = [
    ...FORMULA_MODULES.flatMap(({ spec }) =>
      proseOf(spec).map(([truong, text]) => [spec.id, truong, text] as const),
    ),
    /*
     * Mô tả 12 nhóm ở trang chủ cũng là prose người dùng đọc — và chính nó là nơi tiền lệ sáng
     * lập xảy ra (nhóm Rủi ro kể tên Beta). Trước đợt 9 hàm này chỉ quét FormulaSpec, nên nơi
     * duy nhất từng hỏng lại là nơi duy nhất không được soi.
     */
    ...CATEGORIES.map((c) => [`nhóm ${c.id}`, 'description', c.description.vi] as const),
  ];

  const out: Finding[] = [];
  for (const [id, truong, text] of nguon) {
    for (const m of text.matchAll(TRO_SANG)) {
      const goi = (m[1] ?? '').trim();
      const thap = goi.toLowerCase();
      const dau = thap.split(/\s+/)[0] ?? '';
      if (ten.has(thap) || ten.has(dau) || TEN_RIENG_CHO_PHEP.has(thap)) continue;
      if (TEN_RIENG_CHO_PHEP.has(dau)) continue;
      out.push({ id, truong, chiTiet: `nhắc "${goi}" — không có công thức nào tên vậy` });
    }
  }
  return out;
}

/**
 * Tên bị kể ra như thể đã có, trong khi công thức chưa tồn tại.
 *
 * Danh sách này phải NGẮN DẦN chứ không dài ra. 'Beta' từng là tiền lệ sáng lập ở đây — mô tả
 * nhóm Rủi ro liệt kê nó giữa Sharpe/Sortino/VaR trong khi hồi quy Beta còn kẹt vì thiếu chuỗi
 * VN-Index — và đã tự hết hạn đúng như thiết kế: công thức `beta` lên sóng, ca kiểm dưới đỏ,
 * xoá tên khỏi danh sách. Rỗng là trạng thái ĐÚNG, không phải bỏ quên.
 *
 * Vì sao cần phép kiểm riêng chứ không dựa vào TRO_SANG: trong một câu liệt kê
 * ("Đo biến động và rủi ro: Sharpe, Sortino, …") cái tên đứng TRẦN, không có từ dẫn nào phía
 * trước, nên regex kia không với tới. Chỉ soi mô tả nhóm — ở đó một cái tên là một lời hứa
 * "nhóm này có nó"; còn trong prose công thức thì "beta" thường là tên một BIẾN, hợp lệ.
 */
const CHUA_CO: ReadonlyArray<string> = [];

function keTenThuChuaCo(): Finding[] {
  const out: Finding[] = [];
  for (const c of CATEGORIES) {
    for (const chua of CHUA_CO) {
      if (!new RegExp(`\\b${chua}\\b`).test(c.description.vi)) continue;
      out.push({
        id: `nhóm ${c.id}`,
        truong: 'description',
        chiTiet: `kể "${chua}" nhưng chưa có công thức nào tên vậy`,
      });
    }
  }
  return out;
}

/* ── B ─────────────────────────────────────────────────────────────────────── */

function trungNguyenVan(): Finding[] {
  const theoNoiDung = new Map<string, string[]>();
  for (const { spec } of FORMULA_MODULES) {
    for (const [truong, text] of [
      ...dienGiai(spec),
      ['description', spec.description.vi] as const,
    ]) {
      const khoa = `${truong}|${text.trim().toLowerCase()}`;
      theoNoiDung.set(khoa, [...(theoNoiDung.get(khoa) ?? []), spec.id]);
    }
  }

  const out: Finding[] = [];
  for (const [khoa, ids] of theoNoiDung) {
    if (ids.length < 2) continue;
    out.push({
      id: ids.join(' + '),
      truong: khoa.split('|')[0] ?? '',
      chiTiet: `chép nguyên văn: "${(khoa.split('|')[1] ?? '').slice(0, 70)}…"`,
    });
  }
  return out;
}

/* ── E ─────────────────────────────────────────────────────────────────────── */

const HUA_CANH_BAO = /(báo lỗi|không tính được|báo “?[Kk]hông có ý nghĩa)/;

function huaCanhBaoMaKhongKiem(): Finding[] {
  const out: Finding[] = [];
  for (const { spec } of FORMULA_MODULES) {
    if (spec.tests.some((t) => t.expected === null)) continue;
    for (const [truong, text] of proseOf(spec)) {
      const hit = HUA_CANH_BAO.exec(text);
      if (hit === null) continue;
      out.push({
        id: spec.id,
        truong,
        chiTiet: `hứa "${hit[0]}" nhưng spec.tests không có ca nào expected: null`,
      });
    }
  }
  return out;
}

/* ── F ─────────────────────────────────────────────────────────────────────── */

function mucDienGiaiCut(): Finding[] {
  const out: Finding[] = [];
  for (const { spec } of FORMULA_MODULES) {
    for (const [truong, text] of dienGiai(spec)) {
      if (text.trim().length >= TOI_THIEU) continue;
      out.push({
        id: spec.id,
        truong,
        chiTiet: `${String(text.trim().length)} ký tự — "${text.trim()}"`,
      });
    }
  }
  return out;
}

/* ── H ─────────────────────────────────────────────────────────────────────── */

function khangDinhKhopMauMaKhongKhop(): Finding[] {
  const soMau = new Set<number>();
  for (const preset of SAMPLE_PRESETS) {
    for (const giaTri of Object.values(preset as unknown as Record<string, unknown>)) {
      if (typeof giaTri === 'number') soMau.add(giaTri);
      else if (giaTri !== null && typeof giaTri === 'object') {
        for (const x of Object.values(giaTri as Record<string, unknown>)) {
          if (typeof x === 'number') soMau.add(x);
        }
      }
    }
  }

  const out: Finding[] = [];
  for (const { spec } of FORMULA_MODULES) {
    for (const [truong, text] of proseOf(spec)) {
      if (!/số liệu mẫu/.test(text)) continue;
      for (const m of text.matchAll(/\d[\d.]*/g)) {
        const so = Number((m[0] ?? '').replace(/\./g, ''));
        // Dưới 100 thường là số thứ tự hay tỷ lệ trong câu, không phải con số của bộ mẫu.
        if (!Number.isFinite(so) || so < 100 || soMau.has(so)) continue;
        out.push({
          id: spec.id,
          truong,
          chiTiet: `nói khớp bộ mẫu nhưng ${m[0]} không có trong SAMPLE_PRESETS`,
        });
      }
    }
  }
  return out;
}

/* ── I ─────────────────────────────────────────────────────────────────────── */

function gapNLanMaKhongGap(): Finding[] {
  const out: Finding[] = [];
  for (const { spec } of FORMULA_MODULES) {
    const chay = ketQuaViDu(spec);
    if (chay === null || chay.output.value === null) continue;
    const ketQua = chay.output.value;

    for (const [truong, text] of proseOf(spec)) {
      for (const m of text.matchAll(/[Gg]ấp\s+(?:hơn\s+|khoảng\s+|gần\s+)?([\d.,]+)\s*lần/g)) {
        const boi = Number((m[1] ?? '').replace(/\./g, '').replace(',', '.'));
        if (!Number.isFinite(boi) || boi <= 0) continue;
        // Prose không nói rõ gấp so với cái gì, nên chấp nhận nếu khớp BẤT KỲ ô nhập nào (±35%).
        const khop = Object.values(chay.inputs).some(
          (x) => x !== 0 && Math.abs(Math.abs(ketQua / x) - boi) / boi < 0.35,
        );
        if (khop) continue;
        out.push({
          id: spec.id,
          truong,
          chiTiet: `nói gấp ${String(boi)} lần — kết quả ví dụ là ${String(Number(ketQua.toPrecision(6)))}`,
        });
      }
    }
  }
  return out;
}

/* ── N ─────────────────────────────────────────────────────────────────────── */

const NGUONG = /(?:trên|dưới|vượt|quá|từ)\s+(-?\d+(?:,\d+)?)\s*(?:là|thì|trở|nghĩa)/g;

function nguongNgoaiVungVeDuoc(): Finding[] {
  const out: Finding[] = [];
  for (const { spec } of FORMULA_MODULES) {
    // Chỉ xét đơn vị không phải tiền: với công thức tiền tệ, "trên 2" trong câu gần như luôn là
    // chuyện khác (số kỳ, số lần), không phải ngưỡng đọc kết quả.
    if (!['lần', '%', 'điểm'].includes(spec.resultUnit)) continue;

    const nguongs: number[] = [];
    for (const [, text] of dienGiai(spec)) {
      for (const m of text.matchAll(NGUONG)) {
        const x = Number((m[1] ?? '').replace(',', '.'));
        if (Number.isFinite(x)) nguongs.push(x);
      }
    }
    if (nguongs.length === 0) continue;

    const formula = moduleOf(spec.id);
    if (formula === undefined) continue;
    const inputs = defaultInputs(spec);
    const output = runFormula(formula, inputs, CTX);

    let lo = Number.POSITIVE_INFINITY;
    let hi = Number.NEGATIVE_INFINITY;
    for (const bien of sweepCandidates(spec, 'advanced')) {
      const model = buildChartModel({
        formula,
        inputs,
        ctx: CTX,
        output,
        level: 'advanced',
        sweepKey: bien.key,
      });
      if (model.kind !== 'line') continue;
      for (const p of model.points) {
        if (p.y === null) continue;
        lo = Math.min(lo, p.y);
        hi = Math.max(hi, p.y);
      }
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) continue;

    for (const nguong of nguongs) {
      if (nguong >= lo && nguong <= hi) continue;
      out.push({
        id: spec.id,
        truong: 'explanation',
        chiTiet: `chốt ngưỡng ${String(nguong)} ${spec.resultUnit} mà quét mọi biến chỉ ra ${lo.toFixed(2)} … ${hi.toFixed(2)}`,
      });
    }
  }
  return out;
}

/* ── Cửa gác ───────────────────────────────────────────────────────────────── */

describe('diễn giải phải nhất quán với chính công thức (FR-02, FR-03)', () => {
  it('không câu nào trỏ người dùng sang một công thức KHÔNG tồn tại', () => {
    const found = troSangThuKhongCo();
    expect(found, moTa(found)).toHaveLength(0);
  });

  it('mô tả nhóm không kể tên công thức chưa tồn tại', () => {
    // Danh sách CHUA_CO phải tự hết hạn: công thức lên sóng thì dòng dưới đỏ và nhắc xoá tên
    // khỏi danh sách — không để một cái tên đã có thật nằm mãi trong danh sách "chưa có".
    const ten = tenCongThuc();
    for (const chua of CHUA_CO) {
      expect(
        ten.has(chua.toLowerCase()),
        `"${chua}" nay đã có công thức thật — xoá khỏi CHUA_CO`,
      ).toBe(false);
    }

    const found = keTenThuChuaCo();
    expect(found, moTa(found)).toHaveLength(0);
  });

  /*
   * 432 đoạn văn soạn liên tục thì chép nhầm gần như là chuyện phải xảy ra — vậy mà không có chỗ
   * nào. Ca này giữ nguyên trạng thái ấy: chép một đoạn sang công thức mới là đỏ ngay.
   */
  it('không đoạn diễn giải nào bị chép nguyên văn sang công thức khác', () => {
    const found = trungNguyenVan();
    expect(found, moTa(found)).toHaveLength(0);
  });

  it('câu nào hứa "báo lỗi" thì công thức phải có ca kiểm ra cảnh báo', () => {
    const found = huaCanhBaoMaKhongKiem();
    expect(found, moTa(found)).toHaveLength(0);
  });

  it(`bốn mục diễn giải bắt buộc đều dài hơn ${String(TOI_THIEU)} ký tự`, () => {
    const found = mucDienGiaiCut();
    expect(found, moTa(found)).toHaveLength(0);
  });

  /*
   * Loại khẳng định thối rữa êm nhất trong cả repo: `samples.ts` đổi một con số thì hai câu "khớp
   * EPS 6.050 ₫ / BVPS 24.800 ₫ trong bộ số liệu mẫu" thành lời nói dối, mà cả hai bên vẫn hợp lệ
   * nên không cửa nào khác đỏ. Và `samples.ts` CHẮC CHẮN sẽ đổi — nó đang là số bản thảo.
   */
  it('câu nào nói "khớp bộ số liệu mẫu" thì phải khớp thật', () => {
    const found = khangDinhKhopMauMaKhongKhop();
    expect(found, moTa(found)).toHaveLength(0);
  });

  it('câu nào nói "gấp N lần" thì con số ví dụ phải gấp đúng chừng ấy', () => {
    const found = gapNLanMaKhongGap();
    expect(found, moTa(found)).toHaveLength(0);
  });

  /*
   * "Trên 2 là tốt", "dưới 30 là quá bán" — ngưỡng nào đường quét không bao giờ chạm tới thì người
   * đọc không có cách nào tự nhìn thấy nó trên hình. Không sai về toán, nhưng là chỗ prose và sản
   * phẩm rời nhau.
   */
  it('ngưỡng nêu trong diễn giải đều nằm trong vùng biểu đồ tới được', () => {
    const found = nguongNgoaiVungVeDuoc();
    expect(found, moTa(found)).toHaveLength(0);
  });
});
