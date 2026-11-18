import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';

import { defaultInputs, findFormulaModule, runFormula, type ExportDocument } from '@/application';
import { buildExportDocument } from '@/application/export-document';
import { quizFor } from '@/application/quiz';

import { canFontToan, chuCuaTaiLieu, vePdf } from './ve-pdf';

const FONTS = join(process.cwd(), 'public', 'fonts');
const REGULAR = new Uint8Array(readFileSync(join(FONTS, 'NotoSans-Regular.ttf')));
const BOLD = new Uint8Array(readFileSync(join(FONTS, 'NotoSans-Bold.ttf')));
const MATH = new Uint8Array(readFileSync(join(FONTS, 'NotoSansMath-Regular.ttf')));

function taiLieu(id: string): ExportDocument {
  const mod = findFormulaModule(id);
  if (mod === undefined) throw new Error(id);
  const inputs = defaultInputs(mod.spec);
  const ctx = { asOf: '2026-11-17' };
  return buildExportDocument(
    mod.spec,
    runFormula(mod, inputs, ctx),
    inputs,
    { includeChart: false, includeDetails: true },
    { quiz: quizFor(id), ctx },
  );
}

async function soTrang(bytes: Uint8Array): Promise<number> {
  return (await PDFDocument.load(bytes)).getPageCount();
}

describe('vePdf — file PDF thật', () => {
  it('dựng được file mở lại được, bắt đầu bằng %PDF', async () => {
    const bytes = await vePdf(taiLieu('pe'), { regular: REGULAR, bold: BOLD, math: MATH });
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
    expect(await soTrang(bytes)).toBeGreaterThanOrEqual(1);
  });

  it('lịch trả nợ dài sang nhiều trang và không ném lỗi', async () => {
    const bytes = await vePdf(taiLieu('lich-tra-no'), { regular: REGULAR, bold: BOLD, math: MATH });
    expect(await soTrang(bytes)).toBeGreaterThan(2);
  });

  it('chữ có dấu và ký hiệu toán vẽ được, kể cả khi không có font toán', async () => {
    const doc: ExportDocument = {
      title: 'Thử ắằẳẵặ đơn',
      blocks: [
        { kind: 'paragraph', text: 'σ = √(Σ (r − r̄)² ÷ (n − 1)) ≈ 1,5 × β ≤ ⌊x⌋' },
        { kind: 'disclaimer', text: 'Miễn trừ' },
      ],
    };
    expect(canFontToan(doc, REGULAR)).toBe(true);
    await expect(vePdf(doc, { regular: REGULAR, bold: BOLD, math: MATH })).resolves.toBeInstanceOf(
      Uint8Array,
    );
    await expect(vePdf(doc, { regular: REGULAR, bold: BOLD })).resolves.toBeInstanceOf(Uint8Array);
  });

  it('tài liệu chỉ có chữ Việt thì không cần nạp font toán', () => {
    const doc: ExportDocument = {
      title: 'Đơn giản',
      blocks: [{ kind: 'paragraph', text: 'Lợi nhuận ròng ÷ vốn × 100' }],
    };
    expect(canFontToan(doc, REGULAR)).toBe(false);
    expect(chuCuaTaiLieu(doc)).toContain('Lợi nhuận');
  });

  it('tên hình của khối biểu đồ có trong chữ của tài liệu (để chọn font) và vẽ được', async () => {
    const doc: ExportDocument = {
      title: 'Thử',
      blocks: [
        { kind: 'heading', text: 'Biểu đồ' },
        { kind: 'chart', title: 'P/E theo Giá thị trường (P)' },
        { kind: 'disclaimer', text: 'Miễn trừ' },
      ],
    };
    expect(chuCuaTaiLieu(doc)).toContain('P/E theo Giá thị trường (P)');
    await expect(vePdf(doc, { regular: REGULAR, bold: BOLD })).resolves.toBeInstanceOf(Uint8Array);
  });

  /*
   * Một công thức đại diện cho mỗi kiểu nội dung (bảng phí, dòng tiền, nhóm lặp, công thức chuỗi,
   * hình nhiều dòng). Cả 111 thì `export-content.test.ts` dựng NỘI DUNG; ở đây vẽ thật mất ~0,5 s
   * mỗi file nên chỉ lấy mẫu.
   */
  it.each([
    'loi-nhuan-rong',
    'xirr',
    'gia-von-trung-binh-dca',
    'rsi-wilder',
    'gia-tri-noi-tai-fcff',
    'cvar-lich-su',
  ])('dựng được cho %s', async (id) => {
    const bytes = await vePdf(taiLieu(id), { regular: REGULAR, bold: BOLD, math: MATH });
    expect(await soTrang(bytes)).toBeGreaterThanOrEqual(1);
  });
});
