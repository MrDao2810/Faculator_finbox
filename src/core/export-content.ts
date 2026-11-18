/**
 * Tầng DOMAIN — nội dung của file PDF xuất ra (gói WBS 2.5.3, viết lại 17/11/2026).
 *
 * FR-22: xuất kết quả kèm biểu đồ và bảng biến.
 * FR-24: **miễn trừ đính kèm là bắt buộc, KHÔNG có tuỳ chọn tắt.** `buildExportDocument()` là cổng
 * duy nhất dựng nội dung file, và nó luôn kết thúc bằng khối `disclaimer`. Không có tham số nào bỏ
 * được khối ấy — cùng cách nghĩ với `ok()` giữ FR-06.
 *
 * ── Vì sao viết lại (17/11/2026) ──
 * Bản cũ có hai đường: PDF bằng `window.print()` (trên iOS/Android mở hộp in của hệ điều hành, file
 * ra hỏng hoặc không lưu được) và thẻ PNG vẽ tay. Chủ dự án bỏ PNG và đòi một file `.pdf` thật, tải
 * thẳng xuống trên mọi máy, mang: tên công thức · ý nghĩa · công thức + chú thích · số liệu đã nhập
 * và kết quả · bảng biến · bảng riêng của công thức · chuỗi giá đã nạp · giải thích cho người mới ·
 * bài tập (đáp án ở cuối file). Mọi bảng vẽ sẵn khung.
 *
 * Ở đây chỉ dựng NỘI DUNG, thành một dãy khối thuần dữ liệu; việc dàn trang và vẽ thuộc
 * `src/ui/sheets/pdf/`, nạp trễ lúc bấm Xuất. Module này kéo theo hai file nhóm công thức (lịch trả
 * nợ, phí) và bộ đọc dòng điền số, nên CHỈ được nạp qua `@/application/export-document` từ chunk nạp
 * trễ ấy — barrel chỉ xuất kiểu.
 *
 * File luôn tiếng Việt, dù màn đang ở tiếng Anh: file xuất là một tài liệu đứng riêng (quy ước có từ
 * trước, xem `DisclaimerBar.tsx`).
 */

import type { CashflowRow } from './cashflow-series';
import type { CalcContext } from './calc/types';
import { DISCLAIMER_VI, DRAFT_DATA_NOTE_VI } from './disclaimer';
import { NO_VALUE, formatCalcOutput, formatIsoDate, formatNumber } from './format';
import { buildFeeBreakdown } from './formulas/fees';
import { amortisationFor } from './formulas/personal';
import { latexThanhChu } from './latex-chu';
import { displaySeriesDate, type SeriesRow } from './price-series';
import { QUIZ_CHOICE_KEYS, type QuizItem, type QuizText } from './quiz/types';
import { arithmeticOf } from './quiz/worked-line';
import { variablesForLevel } from './registry/build';
import { isLaterRepeatSlot } from './registry/repeat';
import type { FormulaSpec } from './registry/types';
import type { CalcOutput, Level, VariableSpec } from './types';

export { DISCLAIMER_VI };

export interface ExportOptions {
  /** Kèm biểu đồ (FR-22). Nơi gọi đã trừ trường hợp màn không vẽ hình nào. */
  includeChart: boolean;
  /** Kèm bảng biến và phần giải thích cho người mới. */
  includeDetails: boolean;
  /** Chế độ hiển thị — quyết định bảng số liệu và bảng biến kê những biến nào (FR-09). */
  mode?: Level;
  /**
   * Người dùng vừa nạp một bộ số liệu MẪU (bản thảo). File rời khỏi ứng dụng, người nhận không có
   * cách nào khác để biết, nên file phải tự nói. Nơi gọi đặt theo trạng thái thật.
   */
  fromDraftData?: boolean;
}

/** Số liệu ngoài `inputs` mà màn đang giữ — có thì file mới in được bảng tương ứng. */
export interface ExportData {
  /** Chuỗi giá đang dùng; chỉ truyền khi công thức ăn chuỗi giá. */
  bars?: ReadonlyArray<SeriesRow> | null;
  /** Bảng dòng tiền của `xirr`. */
  cashflows?: ReadonlyArray<CashflowRow> | null;
  /** Ngữ cảnh tính — bảng phí của `loi-nhuan-rong` cần biểu phí đang dùng. */
  ctx?: CalcContext | null;
  /** Câu hỏi của khối Bài tập. */
  quiz?: ReadonlyArray<QuizItem> | null;
}

export type CanhLe = 'left' | 'right';

export interface ExportColumn {
  title: string;
  align: CanhLe;
  /** Tỷ lệ bề ngang tương đối giữa các cột. */
  weight: number;
}

export type ExportBlock =
  | { kind: 'title'; text: string }
  | { kind: 'subtitle'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'paragraph'; text: string; tone?: 'strong' | 'muted' | 'quote' }
  /** Hình công thức chính. Bộ vẽ chèn ảnh chụp nếu có; `fallback` là dòng chữ thay thế. */
  | { kind: 'formula'; fallback: string; expression: ReadonlyArray<string> }
  /** Kết quả, in nổi bật. */
  | { kind: 'result'; label: string; value: string }
  | {
      kind: 'table';
      columns: ReadonlyArray<ExportColumn>;
      rows: ReadonlyArray<ReadonlyArray<string>>;
      /** Số dòng cuối in đậm (dòng tổng). */
      boldLast?: number;
    }
  /**
   * Chỗ chèn ảnh biểu đồ. `title` là tên hình ĐANG hiện trên màn ("P/E theo Giá thị trường") — chỉ
   * trình duyệt biết người dùng đang chọn mục "Xem theo" nào, nên nó được điền lúc chụp, không phải ở đây.
   */
  | { kind: 'chart'; title?: string }
  /** Lựa chọn của câu hỏi, thụt lề. */
  | { kind: 'choice'; key: string; text: string }
  | { kind: 'disclaimer'; text: string };

export interface ExportDocument {
  /** Tên công thức — cũng là tiêu đề metadata của file PDF. */
  title: string;
  blocks: ReadonlyArray<ExportBlock>;
}

/** Ô trống của câu điền số trong file in. */
export const O_TRONG_IN = '______';

const MO_TA_GIAI_THICH: ReadonlyArray<{
  key: 'whenToUse' | 'howToRead' | 'commonMistakes';
  label: string;
}> = [
  { key: 'whenToUse', label: 'Khi nào dùng' },
  { key: 'howToRead', label: 'Cách đọc kết quả' },
  { key: 'commonMistakes', label: 'Sai lầm thường gặp' },
];

/**
 * Dựng nội dung file PDF.
 *
 * @param inputs giá trị đang dùng để tính, khoá là `VariableSpec.key` (kể cả số chảy từ bước trước)
 */
export function buildExportDocument(
  formula: FormulaSpec,
  output: CalcOutput,
  inputs: Readonly<Record<string, number>>,
  options: ExportOptions,
  data: ExportData = {},
  interpretation?: string,
): ExportDocument {
  const mode = options.mode ?? 'advanced';
  const shown = variablesForLevel(formula, mode);
  const blocks: ExportBlock[] = [];

  /* 1. Tên + mô tả ngắn. */
  blocks.push({ kind: 'title', text: formula.name.vi });
  blocks.push({ kind: 'subtitle', text: formula.description.vi });

  /* 2. Ý nghĩa. */
  blocks.push({ kind: 'heading', text: 'Ý nghĩa' });
  blocks.push({ kind: 'paragraph', text: formula.explanation.meaning.vi });

  /* 3. Công thức + chú thích ký hiệu. */
  blocks.push({ kind: 'heading', text: 'Công thức' });
  blocks.push({
    kind: 'formula',
    fallback: latexThanhChu(formula.latex),
    expression: (formula.expression?.vi ?? '').split('\n').filter((d) => d.trim().length > 0),
  });
  const symbols = formula.symbols ?? [];
  if (symbols.length > 0) {
    blocks.push({ kind: 'subheading', text: 'Chú thích ký hiệu' });
    blocks.push({
      kind: 'table',
      columns: [
        { title: 'Ký hiệu', align: 'left', weight: 1 },
        { title: 'Ý nghĩa', align: 'left', weight: 3 },
      ],
      rows: symbols.map((s) => [latexThanhChu(s.latex), s.meaning.vi]),
    });
  }

  /* 4. Số liệu đã nhập + kết quả. */
  blocks.push({ kind: 'heading', text: 'Số liệu và kết quả' });
  if (shown.length > 0) {
    blocks.push({
      kind: 'table',
      columns: [
        { title: 'Số liệu', align: 'left', weight: 3 },
        { title: 'Giá trị', align: 'right', weight: 2 },
      ],
      rows: shown.map((v) => [v.label.vi, describeInput(inputs[v.key], v)]),
    });
  }
  blocks.push({ kind: 'result', label: 'Kết quả', value: formatCalcOutput(output) });
  if (output.value === null && output.warning !== undefined) {
    blocks.push({ kind: 'paragraph', text: output.warning.message.vi, tone: 'muted' });
  }
  if (interpretation !== undefined && interpretation.trim().length > 0) {
    blocks.push({ kind: 'paragraph', text: interpretation });
  }

  /* 5. Biểu đồ. */
  if (options.includeChart && formula.chartType !== 'none') {
    blocks.push({ kind: 'heading', text: 'Biểu đồ' });
    blocks.push({ kind: 'chart' });
  }

  /* 6. Bảng riêng của công thức. */
  blocks.push(...bangRieng(formula, inputs, data));

  /* 7. Chuỗi giá đã nạp. */
  blocks.push(...bangChuoiGia(data.bars));

  /* 8–9. Bảng biến + giải thích cho người mới. */
  if (options.includeDetails) {
    /*
     * Bảng biến chỉ mô tả nhóm 1 của nhóm lặp, như Bảng biến trên màn (20/10/2026): đợt 2, 3, 4… lặp
     * lại đúng câu của đợt 1. Bảng số liệu ở trên thì giữ mọi đợt — đó là con số người dùng đã nhập.
     */
    const bien = shown.filter((v) => !isLaterRepeatSlot(formula, v.key));
    if (bien.length > 0) {
      blocks.push({ kind: 'heading', text: 'Bảng biến' });
      blocks.push({
        kind: 'table',
        columns: [
          { title: 'Biến', align: 'left', weight: 3 },
          { title: 'Đơn vị', align: 'left', weight: 1 },
          { title: 'Mô tả', align: 'left', weight: 4 },
        ],
        rows: bien.map((v) => [
          v.label.vi,
          v.unit.length > 0 ? v.unit : '-',
          // Gạch NGANG, không phải `NO_VALUE`: ô chữ trống chứ không phải con số còn thiếu.
          v.description?.vi ?? '-',
        ]),
      });
    }

    blocks.push({ kind: 'heading', text: 'Giải thích cho người mới' });
    for (const muc of MO_TA_GIAI_THICH) {
      blocks.push({ kind: 'subheading', text: muc.label });
      blocks.push({ kind: 'paragraph', text: formula.explanation[muc.key].vi });
    }
  }

  /* 10–11. Bài tập + đáp án. */
  blocks.push(...baiTap(data.quiz));

  /* 12. Nguồn, bản thảo, miễn trừ. */
  if (formula.source.length > 0) {
    blocks.push({ kind: 'heading', text: 'Nguồn tham khảo' });
    for (const source of formula.source) {
      blocks.push({ kind: 'paragraph', text: `• ${source.label.vi}` });
    }
  }
  if (options.fromDraftData === true) {
    blocks.push({ kind: 'paragraph', text: DRAFT_DATA_NOTE_VI, tone: 'muted' });
  }
  // KHÔNG nhận từ tham số, KHÔNG có nhánh nào bỏ qua. Đây chính là FR-24.
  blocks.push({ kind: 'disclaimer', text: DISCLAIMER_VI });

  return { title: formula.name.vi, blocks };
}

/** Bảng mà màn chi tiết của chính công thức ấy đang bày (lịch trả nợ, phí, dòng tiền). */
function bangRieng(
  formula: FormulaSpec,
  inputs: Readonly<Record<string, number>>,
  data: ExportData,
): ExportBlock[] {
  if (formula.id === 'lich-tra-no') {
    const rows = amortisationFor(inputs);
    if (rows === null || rows.length === 0) return [];
    const tien = (n: number): string => formatNumber(n, { maxDecimals: 0 });
    return [
      { kind: 'heading', text: 'Lịch trả nợ (đơn vị: ₫)' },
      {
        kind: 'table',
        columns: [
          { title: 'Kỳ', align: 'right', weight: 1 },
          { title: 'Phải trả', align: 'right', weight: 3 },
          { title: 'Gốc', align: 'right', weight: 3 },
          { title: 'Lãi', align: 'right', weight: 3 },
          { title: 'Còn lại', align: 'right', weight: 3 },
        ],
        rows: rows.map((r) => [
          String(r.period),
          tien(r.payment),
          tien(r.principal),
          tien(r.interest),
          tien(r.balance),
        ]),
      },
    ];
  }

  if (formula.id === 'loi-nhuan-rong' && data.ctx !== undefined && data.ctx !== null) {
    const b = buildFeeBreakdown(inputs, data.ctx);
    const tien = (out: CalcOutput): string => formatCalcOutput(out, { maxDecimals: 0 });
    return [
      { kind: 'heading', text: 'Bóc tách chi phí' },
      {
        kind: 'table',
        columns: [
          { title: 'Khoản', align: 'left', weight: 3 },
          { title: 'Cách tính', align: 'left', weight: 4 },
          { title: 'Số tiền', align: 'right', weight: 2 },
        ],
        rows: [
          ...b.rows.map((r) => [r.label.vi, r.formula.vi, tien(r.output)]),
          ['Tổng chi phí', '', tien(b.totalCost)],
          ['Giá hoà vốn thực', '', tien(b.breakEven)],
          ['Lãi gộp', '', tien(b.grossProfit)],
          ['Lợi nhuận ròng', '', tien(b.netProfit)],
          ['ROI ròng', '', formatCalcOutput(b.netRoi, { minDecimals: 2, maxDecimals: 2 })],
        ],
        boldLast: 5,
      },
    ];
  }

  if (formula.id === 'xirr' && data.cashflows !== undefined && data.cashflows !== null) {
    const rows = data.cashflows.filter((r) => r.date.trim().length > 0 || r.amount !== null);
    if (rows.length === 0) return [];
    return [
      { kind: 'heading', text: 'Dòng tiền' },
      {
        kind: 'table',
        columns: [
          { title: 'Ngày', align: 'left', weight: 1 },
          { title: 'Số tiền (₫)', align: 'right', weight: 2 },
        ],
        rows: rows.map((r) => [
          /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? formatIsoDate(r.date) : r.date.trim() || NO_VALUE,
          r.amount === null ? NO_VALUE : formatNumber(r.amount, { maxDecimals: 2 }),
        ]),
      },
    ];
  }

  return [];
}

/** Chuỗi giá đang dùng, phiên mới nhất trước — thứ tự mặc định của bảng dữ liệu trên màn. */
function bangChuoiGia(bars: ReadonlyArray<SeriesRow> | null | undefined): ExportBlock[] {
  if (bars === undefined || bars === null || bars.length === 0) return [];
  const gia = (n: number | null): string =>
    n === null || !Number.isFinite(n) ? NO_VALUE : formatNumber(n, { maxDecimals: 2 });
  const kl = (n: number | null): string =>
    n === null || !Number.isFinite(n) ? NO_VALUE : formatNumber(n, { maxDecimals: 0 });
  return [
    { kind: 'heading', text: `Chuỗi giá đã nạp (${formatNumber(bars.length)} phiên)` },
    {
      kind: 'table',
      columns: [
        { title: 'Ngày', align: 'left', weight: 3 },
        { title: 'Mở cửa', align: 'right', weight: 2 },
        { title: 'Cao nhất', align: 'right', weight: 2 },
        { title: 'Thấp nhất', align: 'right', weight: 2 },
        { title: 'Đóng cửa', align: 'right', weight: 2 },
        { title: 'Khối lượng', align: 'right', weight: 3 },
      ],
      rows: [...bars]
        .reverse()
        .map((r) => [
          r.date.trim().length > 0 ? displaySeriesDate(r.date) : NO_VALUE,
          gia(r.open),
          gia(r.high),
          gia(r.low),
          gia(r.close),
          kl(r.volume),
        ]),
    },
  ];
}

/** Dòng `worked` với mỗi `[…]` thay bằng một ô trống để người đọc tự điền. */
export function dongDeBai(worked: string): string {
  return worked.replace(/\[[^\]]*\]/g, O_TRONG_IN);
}

function chuDeBai(text: QuizText): string {
  return text.vi;
}

/** Phần Bài tập (đề) rồi phần Đáp án ở cuối. */
function baiTap(items: ReadonlyArray<QuizItem> | null | undefined): ExportBlock[] {
  if (items === undefined || items === null || items.length === 0) return [];
  const de: ExportBlock[] = [{ kind: 'heading', text: 'Bài tập' }];
  const dapAn: ExportBlock[] = [{ kind: 'heading', text: 'Đáp án' }];

  items.forEach((item, i) => {
    const so = i + 1;
    de.push({ kind: 'subheading', text: `Câu ${so}` });
    de.push({ kind: 'paragraph', text: chuDeBai(item.prompt) });
    if (item.facts !== undefined && item.facts.length > 0) {
      de.push({
        kind: 'table',
        columns: [
          { title: 'Số liệu', align: 'left', weight: 3 },
          { title: 'Giá trị', align: 'right', weight: 2 },
        ],
        rows: item.facts.map((f) => [f.label.vi, f.value.vi]),
      });
    }

    dapAn.push({ kind: 'subheading', text: `Câu ${so}` });

    if (item.format === 'dien-so') {
      de.push({ kind: 'paragraph', text: dongDeBai(item.worked.vi), tone: 'strong' });
      const phepTinh = arithmeticOf(item.worked.vi);
      const nhan = item.worked.vi.split('=')[0]?.trim() ?? '';
      const ketQua =
        item.giai?.ketQua.vi ??
        `${formatNumber(item.expected, { maxDecimals: 4 })} ${item.unit.vi}`.trim();
      dapAn.push({
        kind: 'paragraph',
        text: `${nhan} = ${phepTinh ?? ''} = ${ketQua}`.replace(/\s+/g, ' '),
        tone: 'strong',
      });
    } else {
      for (const key of QUIZ_CHOICE_KEYS) {
        de.push({ kind: 'choice', key, text: item.choices[key].vi });
      }
      const dung = item.format === 'trac-nghiem' ? [item.answer] : [...item.answers];
      for (const key of dung) {
        dapAn.push({ kind: 'paragraph', text: `${key}) ${item.choices[key].vi}`, tone: 'strong' });
      }
    }

    dapAn.push(...loiGiai(item));
  });

  return [...de, ...dapAn];
}

/** Lời giải: dòng có cấu trúc khi câu có `giai`, không thì đoạn giải thích. */
function loiGiai(item: QuizItem): ExportBlock[] {
  const giai = item.giai;
  if (giai === undefined) {
    return [{ kind: 'paragraph', text: item.explain.vi, tone: 'muted' }];
  }
  const out: ExportBlock[] = [];
  const gan = (giai.gan ?? [])
    .map((g) => {
      const kyHieu = latexThanhChu(g.kyHieu);
      if (g.giaTri !== undefined) return `${kyHieu} = ${g.giaTri.vi}`;
      if (g.moTa !== undefined) return `${kyHieu} ${g.moTa.vi}`;
      return null;
    })
    .filter((d): d is string => d !== null);
  if (gan.length > 0)
    out.push({ kind: 'paragraph', text: `Thay số: ${gan.join('; ')}.`, tone: 'muted' });
  out.push({
    kind: 'paragraph',
    text: `Áp dụng công thức: ${giai.thaySo.vi} = ${giai.ketQua.vi}`,
    tone: 'muted',
  });
  /* Câu trích nguyên văn của nguồn: thứ cho người đọc mở nguồn ra đối chiếu. */
  for (const trich of item.explain.vi.match(/“[^”]+”/g) ?? []) {
    out.push({ kind: 'paragraph', text: trich, tone: 'quote' });
  }
  out.push({ kind: 'paragraph', text: `Nguồn: ${item.source.url}`, tone: 'muted' });
  return out;
}

/**
 * Chuỗi mô tả một giá trị đầu vào. Biến kiểu chọn hiện NHÃN chứ không hiện con số: "Kỳ số liệu:
 * Năm" thì người nhận file hiểu, "Kỳ số liệu: 2" thì không (LDR-02).
 */
function describeInput(value: number | undefined, spec: VariableSpec): string {
  if (value === undefined || !Number.isFinite(value)) {
    return formatCalcOutput({ value: null, unit: spec.unit });
  }
  const option = spec.options?.find((item) => item.value === value);
  if (option !== undefined) return option.label.vi;
  return formatCalcOutput({ value, unit: spec.unit });
}

/** Tên file gợi ý. Chỉ dùng ký tự an toàn cho mọi hệ điều hành. */
export function exportFileName(formula: Pick<FormulaSpec, 'id'>): string {
  const slug = formula.id.replace(/[^a-z0-9.-]/gi, '-').toLowerCase();
  return `faculator-${slug}.pdf`;
}
