import { describe, expect, it } from 'vitest';

import { fail, ok } from './calc-output';
import {
  DISCLAIMER_VI,
  O_TRONG_IN,
  buildExportDocument,
  dongDeBai,
  exportFileName,
  type ExportBlock,
  type ExportDocument,
  type ExportOptions,
} from './export-content';
import { DRAFT_DATA_NOTE_VI } from './disclaimer';
import { FORMULA_MODULES, amortisationFor, findFormulaModule } from './formulas';
import { quizFor } from './quiz';
import type { QuizItem } from './quiz/types';
import { defaultInputs } from './registry/build';
import { resolveRepeatSpec } from './registry/repeat';
import type { FormulaSpec } from './registry/types';
import { runFormula } from './calc/run';
import { divideByZero } from './warnings';

const PE: FormulaSpec = {
  id: 'pe',
  categoryId: 'fundamentals',
  name: { vi: 'Hệ số giá trên lợi nhuận (P/E)', en: 'Price to Earnings' },
  description: {
    vi: 'Trả bao nhiêu đồng cho mỗi đồng lợi nhuận.',
    en: 'How much you pay for each unit of earnings.',
  },
  latex: 'P/E = \\frac{P}{EPS}',
  expression: { vi: 'P/E = Giá thị trường ÷ EPS', en: 'P/E = Market price ÷ EPS' },
  symbols: [
    { latex: 'P', meaning: { vi: 'giá thị trường, ₫', en: 'market price, ₫' } },
    {
      latex: 'EPS',
      meaning: { vi: 'lợi nhuận trên mỗi cổ phiếu, ₫', en: 'earnings per share, ₫' },
    },
  ],
  chartType: 'sensitivity',
  level: 'basic',
  tags: [],
  resultUnit: 'lần',
  variables: [
    {
      key: 'price',
      label: { vi: 'Giá thị trường', en: 'Market price' },
      unit: '₫',
      type: 'number',
      defaultValue: 92_000,
      level: 'basic',
      description: { vi: 'Giá đóng cửa gần nhất.', en: 'Most recent closing price.' },
    },
    {
      key: 'g',
      label: { vi: 'Tăng trưởng g', en: 'Growth g' },
      unit: '%',
      type: 'number',
      defaultValue: 4,
      level: 'advanced',
    },
  ],
  explanation: {
    meaning: {
      vi: 'Số năm lợi nhuận cần có để hoàn lại giá đang mua.',
      en: 'Number of years of earnings needed to recoup the purchase price.',
    },
    whenToUse: {
      vi: 'So sánh hai doanh nghiệp cùng ngành.',
      en: 'Compare two companies in the same industry.',
    },
    howToRead: {
      vi: 'Càng cao thì kỳ vọng càng lớn.',
      en: 'The higher it is, the higher the expectation.',
    },
    commonMistakes: {
      vi: 'So giữa hai ngành khác nhau.',
      en: 'Comparing across different industries.',
    },
  },
  example: { title: { vi: 'x', en: 'x' }, inputs: { price: 92_000 }, expected: 15.2 },
  tests: [],
  source: [
    {
      label: {
        vi: 'Giáo trình phân tích đầu tư (CFA Institute)',
        en: 'Investment analysis textbook (CFA Institute)',
      },
    },
  ],
};

const INPUTS = { price: 92_000, g: 4 };

function options(patch: Partial<ExportOptions> = {}): ExportOptions {
  return { includeChart: true, includeDetails: true, ...patch };
}

function khoi<K extends ExportBlock['kind']>(
  doc: ExportDocument,
  kind: K,
): Array<Extract<ExportBlock, { kind: K }>> {
  return doc.blocks.filter((b): b is Extract<ExportBlock, { kind: K }> => b.kind === kind);
}

function tieuDe(doc: ExportDocument): string[] {
  return khoi(doc, 'heading').map((b) => b.text);
}

/** Bảng ngay sau tiêu đề mục `ten`. */
function bangSau(doc: ExportDocument, ten: string): Extract<ExportBlock, { kind: 'table' }> {
  const i = doc.blocks.findIndex((b) => b.kind === 'heading' && b.text.startsWith(ten));
  const bang = doc.blocks.slice(i + 1).find((b) => b.kind === 'table');
  if (i < 0 || bang === undefined || bang.kind !== 'table') throw new Error(`không có bảng ${ten}`);
  return bang;
}

describe('FR-24 — miễn trừ không thể tắt', () => {
  it('luôn là khối CUỐI ở mọi tổ hợp tuỳ chọn', () => {
    const combos: ExportOptions[] = [
      options(),
      options({ includeChart: false }),
      options({ includeDetails: false }),
      options({ includeChart: false, includeDetails: false, mode: 'basic' }),
      options({ fromDraftData: true }),
    ];
    for (const combo of combos) {
      const doc = buildExportDocument(PE, ok(15.2, 'lần'), INPUTS, combo);
      expect(doc.blocks.at(-1), JSON.stringify(combo)).toEqual({
        kind: 'disclaimer',
        text: DISCLAIMER_VI,
      });
    }
  });

  it('câu miễn trừ nói đúng hai ý bắt buộc', () => {
    expect(DISCLAIMER_VI).toContain('tham khảo');
    expect(DISCLAIMER_VI).toContain('không phải khuyến nghị đầu tư');
  });

  it('vẫn đính kèm cả khi phép tính đang lỗi', () => {
    const doc = buildExportDocument(
      PE,
      fail('lần', divideByZero({ vi: 'P/E', en: 'P/E' }, { vi: 'EPS', en: 'EPS' })),
      INPUTS,
      options(),
    );
    expect(khoi(doc, 'disclaimer')).toHaveLength(1);
  });

  it('số liệu bản thảo thì ghi rõ, ngay trên miễn trừ', () => {
    const doc = buildExportDocument(PE, ok(15.2, 'lần'), INPUTS, options({ fromDraftData: true }));
    expect(doc.blocks.at(-2)).toMatchObject({ kind: 'paragraph', text: DRAFT_DATA_NOTE_VI });
    const thuong = buildExportDocument(PE, ok(15.2, 'lần'), INPUTS, options());
    expect(JSON.stringify(thuong)).not.toContain(DRAFT_DATA_NOTE_VI);
  });
});

describe('nội dung file — đủ các mục chủ dự án kê, đúng thứ tự', () => {
  it('tên · ý nghĩa · công thức · số liệu · biểu đồ · bảng biến · giải thích · nguồn', () => {
    const doc = buildExportDocument(PE, ok(15.21, 'lần'), INPUTS, options());
    expect(doc.title).toBe('Hệ số giá trên lợi nhuận (P/E)');
    expect(khoi(doc, 'title')[0]?.text).toBe(doc.title);
    expect(tieuDe(doc)).toEqual([
      'Ý nghĩa',
      'Công thức',
      'Số liệu và kết quả',
      'Biểu đồ',
      'Bảng biến',
      'Giải thích cho người mới',
      'Nguồn tham khảo',
    ]);
  });

  it('công thức in dạng chữ dự phòng, dòng diễn giải và bảng chú thích ký hiệu', () => {
    const doc = buildExportDocument(PE, ok(15.2, 'lần'), INPUTS, options());
    expect(khoi(doc, 'formula')[0]).toEqual({
      kind: 'formula',
      fallback: 'P/E = P/EPS',
      expression: ['P/E = Giá thị trường ÷ EPS'],
    });
    expect(bangSau(doc, 'Công thức').rows).toEqual([
      ['P', 'giá thị trường, ₫'],
      ['EPS', 'lợi nhuận trên mỗi cổ phiếu, ₫'],
    ]);
  });

  it('kết quả định dạng kiểu Việt Nam; không tính được thì “_ _” kèm lý do (FR-06)', () => {
    const doc = buildExportDocument(PE, ok(15.21, 'lần'), INPUTS, options());
    expect(khoi(doc, 'result')[0]?.value).toBe('15,21 lần');

    const loi = buildExportDocument(
      PE,
      fail('lần', divideByZero({ vi: 'P/E', en: 'P/E' }, { vi: 'EPS', en: 'EPS' })),
      INPUTS,
      options(),
    );
    expect(khoi(loi, 'result')[0]?.value).toContain('_ _');
    expect(JSON.stringify(loi)).not.toContain('NaN');
  });

  it('bảng số liệu mang đơn vị; ô chưa nhập là “_ _” chứ không phải 0', () => {
    expect(
      bangSau(buildExportDocument(PE, ok(1, 'lần'), INPUTS, options()), 'Số liệu').rows,
    ).toEqual([
      ['Giá thị trường', '92.000 ₫'],
      ['Tăng trưởng g', '4 %'],
    ]);
    const thieu = buildExportDocument(PE, ok(1, 'lần'), { price: 92_000 }, options());
    expect(bangSau(thieu, 'Số liệu').rows[1]?.[1]).toContain('_ _');
  });

  it('biến kiểu chọn xuất ra NHÃN chứ không xuất con số', () => {
    const withChoice: FormulaSpec = {
      ...PE,
      variables: [
        {
          key: 'period',
          label: { vi: 'Kỳ số liệu', en: 'Period' },
          unit: '',
          type: 'buttonGroup',
          defaultValue: 2,
          level: 'basic',
          options: [
            { value: 1, label: { vi: 'Quý', en: 'Quarter' } },
            { value: 2, label: { vi: 'Năm', en: 'Year' } },
          ],
        },
      ],
    };
    const doc = buildExportDocument(withChoice, ok(1, 'lần'), { period: 2 }, options());
    expect(bangSau(doc, 'Số liệu').rows[0]).toEqual(['Kỳ số liệu', 'Năm']);
  });

  it('chế độ Cơ bản chỉ xuất biến cơ bản (FR-09)', () => {
    const doc = buildExportDocument(PE, ok(1, 'lần'), INPUTS, options({ mode: 'basic' }));
    expect(bangSau(doc, 'Số liệu').rows).toEqual([['Giá thị trường', '92.000 ₫']]);
  });

  it('giải thích cho người mới có đủ ba mục của màn', () => {
    const doc = buildExportDocument(PE, ok(1, 'lần'), INPUTS, options());
    expect(khoi(doc, 'subheading').map((b) => b.text)).toEqual(
      expect.arrayContaining(['Khi nào dùng', 'Cách đọc kết quả', 'Sai lầm thường gặp']),
    );
  });

  it('tắt "Kèm bảng biến & giải thích" thì bỏ hẳn hai mục đó, giữ bảng số liệu', () => {
    const doc = buildExportDocument(PE, ok(1, 'lần'), INPUTS, options({ includeDetails: false }));
    expect(tieuDe(doc)).not.toContain('Bảng biến');
    expect(tieuDe(doc)).not.toContain('Giải thích cho người mới');
    expect(tieuDe(doc)).toContain('Số liệu và kết quả');
  });

  it('không kèm biểu đồ khi tắt, hoặc khi công thức không có biểu đồ', () => {
    expect(
      khoi(
        buildExportDocument(PE, ok(1, 'lần'), INPUTS, options({ includeChart: false })),
        'chart',
      ),
    ).toEqual([]);
    const none: FormulaSpec = { ...PE, chartType: 'none' };
    expect(khoi(buildExportDocument(none, ok(1, 'lần'), INPUTS, options()), 'chart')).toEqual([]);
  });

  it('nhóm lặp: bảng biến chỉ mô tả đợt 1, bảng số liệu vẫn đủ mọi đợt', () => {
    const dca = findFormulaModule('gia-von-trung-binh-dca');
    if (dca === undefined) throw new Error('thiếu DCA');
    const inputs = { ...defaultInputs(dca.spec), lots: 4, amount4: 1_000_000, price4: 20_000 };
    const spec = resolveRepeatSpec(dca.spec, inputs);
    const doc = buildExportDocument(spec, ok(30_000, '₫'), inputs, options());

    expect(bangSau(doc, 'Số liệu').rows.map((r) => r[0])).toContain('Giá mua đợt 4 (P4)');
    const nhan = bangSau(doc, 'Bảng biến').rows.map((r) => r[0]);
    expect(nhan).toHaveLength(3);
    expect(nhan[1]).toMatch(/^Tiền mua đợt 1 \(C1\)/);
  });

  it('cả 111 công thức đều dựng được, không chữ NaN/undefined nào lọt vào file', () => {
    for (const mod of FORMULA_MODULES) {
      const inputs = defaultInputs(mod.spec);
      const ctx = { asOf: '2026-11-17' };
      const doc = buildExportDocument(mod.spec, runFormula(mod, inputs, ctx), inputs, options(), {
        quiz: quizFor(mod.spec.id),
        ctx,
      });
      // Trừ lời giải và câu trích của bài tập: nguồn của `so-graham` viết thật "an undefined result".
      const chu = JSON.stringify(
        doc.blocks.filter(
          (b) => !(b.kind === 'paragraph' && (b.tone === 'muted' || b.tone === 'quote')),
        ),
      );
      expect(chu, mod.spec.id).not.toMatch(/NaN|undefined|Infinity/);
      expect(doc.blocks.at(-1)?.kind, mod.spec.id).toBe('disclaimer');
    }
  });
});

describe('bảng riêng của công thức', () => {
  function docCua(
    id: string,
    data: Parameters<typeof buildExportDocument>[4] = {},
  ): ExportDocument {
    const mod = findFormulaModule(id);
    if (mod === undefined) throw new Error(id);
    const inputs = defaultInputs(mod.spec);
    const ctx = { asOf: '2026-11-17' };
    return buildExportDocument(mod.spec, runFormula(mod, inputs, ctx), inputs, options(), {
      ctx,
      ...data,
    });
  }

  it('lịch trả nợ in ĐỦ mọi kỳ, không bỏ bớt kỳ giữa như trên màn', () => {
    const mod = findFormulaModule('lich-tra-no');
    if (mod === undefined) throw new Error('lich-tra-no');
    const rows = amortisationFor(defaultInputs(mod.spec)) ?? [];
    const bang = bangSau(docCua('lich-tra-no'), 'Lịch trả nợ');
    expect(bang.rows).toHaveLength(rows.length);
    expect(bang.rows[0]?.[0]).toBe('1');
    expect(bang.columns.map((c) => c.title)).toEqual(['Kỳ', 'Phải trả', 'Gốc', 'Lãi', 'Còn lại']);
  });

  it('lợi nhuận ròng in bảng bóc tách chi phí, dòng tổng in đậm', () => {
    const bang = bangSau(docCua('loi-nhuan-rong'), 'Bóc tách chi phí');
    expect(bang.rows.map((r) => r[0])).toContain('Tổng chi phí');
    expect(bang.boldLast).toBe(5);
  });

  it('XIRR in bảng dòng tiền, ngày theo dd/mm/yyyy, ô trống là “_ _”', () => {
    const doc = docCua('xirr', {
      cashflows: [
        { date: '2026-01-15', amount: -100_000_000 },
        { date: '2026-12-15', amount: null },
        { date: '', amount: null },
      ],
    });
    expect(bangSau(doc, 'Dòng tiền').rows).toEqual([
      ['15/01/2026', '-100.000.000'],
      ['15/12/2026', '_ _'],
    ]);
  });

  it('xirr không khai ô nhập: mục số liệu không có bảng rỗng, đi thẳng vào kết quả', () => {
    const doc = docCua('xirr');
    const i = doc.blocks.findIndex((b) => b.kind === 'heading' && b.text === 'Số liệu và kết quả');
    expect(doc.blocks[i + 1]?.kind).toBe('result');
  });

  it('chuỗi giá đã nạp in đủ sáu cột, phiên mới nhất trước', () => {
    const doc = docCua('rsi-wilder', {
      bars: [
        { date: '2026-09-14', open: 1, high: 2, low: 0.5, close: 1.5, volume: 1000 },
        { date: '2026-09-15', open: 1.5, high: 2, low: 1, close: null, volume: null },
      ],
    });
    const bang = bangSau(doc, 'Chuỗi giá đã nạp');
    expect(bang.columns).toHaveLength(6);
    expect(bang.rows[0]).toEqual(['15/09/2026', '1,5', '2', '1', '_ _', '_ _']);
    expect(bang.rows[1]?.[0]).toBe('14/09/2026');
  });

  it('chưa nạp chuỗi thì không có mục chuỗi giá', () => {
    expect(tieuDe(docCua('rsi-wilder', { bars: null })).join()).not.toContain('Chuỗi giá');
  });
});

describe('bài tập — đề trước, đáp án ở cuối file', () => {
  const items = quizFor('capm');
  const mod = findFormulaModule('capm');
  if (mod === undefined) throw new Error('capm');
  const doc = buildExportDocument(mod.spec, ok(13.1, '%'), defaultInputs(mod.spec), options(), {
    quiz: items,
  });

  it('mục Bài tập rồi mục Đáp án, cả hai trước Nguồn tham khảo', () => {
    const t = tieuDe(doc);
    expect(t.indexOf('Bài tập')).toBeGreaterThan(-1);
    expect(t.indexOf('Đáp án')).toBe(t.indexOf('Bài tập') + 1);
    expect(t.indexOf('Nguồn tham khảo')).toBe(t.indexOf('Đáp án') + 1);
  });

  it('mỗi câu một tiêu đề "Câu n" ở cả đề lẫn đáp án', () => {
    const cau = khoi(doc, 'subheading').filter((b) => /^Câu \d+$/.test(b.text));
    expect(cau).toHaveLength(items.length * 2);
  });

  it('câu trắc nghiệm in đủ bốn lựa chọn, đáp án ghi đúng chữ cái', () => {
    const tn = items.find(
      (q): q is Extract<QuizItem, { format: 'trac-nghiem' }> => q.format === 'trac-nghiem',
    );
    if (tn === undefined) throw new Error('capm thiếu câu trắc nghiệm');
    expect(khoi(doc, 'choice').filter((c) => c.text === tn.choices.a.vi)).toHaveLength(1);
    expect(JSON.stringify(doc)).toContain(`${tn.answer}) ${tn.choices[tn.answer].vi}`);
  });

  it('câu điền số in ô trống thay cho đáp án trong ngoặc vuông', () => {
    const ds = items.find(
      (q): q is Extract<QuizItem, { format: 'dien-so' }> => q.format === 'dien-so',
    );
    if (ds === undefined) throw new Error('capm thiếu câu điền số');
    const de = dongDeBai(ds.worked.vi);
    expect(de).not.toMatch(/\[|\]/);
    expect(de).toContain(O_TRONG_IN);
    expect(khoi(doc, 'paragraph').some((p) => p.text === de)).toBe(true);
  });

  it('không có câu hỏi thì không có hai mục ấy', () => {
    const rong = buildExportDocument(PE, ok(1, 'lần'), INPUTS, options(), { quiz: [] });
    expect(tieuDe(rong)).not.toContain('Bài tập');
    expect(tieuDe(rong)).not.toContain('Đáp án');
  });
});

describe('exportFileName()', () => {
  it('ghép tên theo id công thức, đuôi .pdf', () => {
    expect(exportFileName(PE)).toBe('faculator-pe.pdf');
  });

  it('bỏ ký tự lạ để tên file an toàn trên mọi hệ điều hành', () => {
    expect(exportFileName({ id: 'p/e ratio' })).toBe('faculator-p-e-ratio.pdf');
  });
});
