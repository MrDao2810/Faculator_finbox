import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * Chuỗi TIẾNG ANH của mọi cặp song ngữ không mang chữ Việt (05/11/2026).
 *
 * Chủ dự án chuyển sang tiếng Anh và gọi từng chỗ còn chữ Việt là "lỗi nghiêm trọng", rồi đòi bản dịch
 * _"xát nghĩa nhất có thể để người dùng công thức hiểu được. vì họ là người nước ngoài thì sao"_. Từ
 * điển giao diện đã có cửa ("câu tiếng Anh không sót chữ có dấu" ở `i18n.test.ts`), nhưng chữ của 111
 * công thức (tên, bảng ký hiệu, nguồn, lời giải, câu hỏi…) thì không: đo ngày ấy, 37 chuỗi `en` còn
 * dấu tiếng Việt, trong đó bảng ký hiệu IRR ghi "today's value of 1 đồng".
 *
 * Luật: trong mọi object có cả `vi` lẫn `en` (kiểu `Bilingual`, và `{ vi: [...], en: [...] }` của cụm
 * chữ), chuỗi `en` không có chữ cái mang dấu tiếng Việt. Một miễn trừ: phần nằm giữa “…” là câu TRÍCH
 * NGUYÊN VĂN của nguồn (hoặc tên dòng, tên cột in trên trang nguồn tiếng Việt), giữ đúng chữ gốc để
 * người đọc mở trang đối chiếu được, kèm lời dịch bên cạnh. Tên người, tên báo viết không dấu như báo
 * chí quốc tế ("Nguyen Tuan Anh"), số hiệu văn bản theo lối trích tiếng Anh ("Decision 1541/QD-BTC"),
 * đơn vị tiền viết "dong".
 *
 * Soi bằng bộ phân tích của TypeScript trên MÃ NGUỒN, không nạp module: cửa bắt cả chuỗi chỉ dựng ra
 * khi một hàm chạy, và không phải giữ danh sách module dữ liệu.
 */

const SRC = fileURLToPath(new URL('../..', import.meta.url));

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else if (extname(path) === '.ts' || extname(path) === '.tsx') out.push(path);
  }
  return out;
}

const DAU_VIET = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

/** Chữ của một nút chuỗi (chuỗi thường, template không biến, hoặc các khúc chữ của template có biến). */
function chuCua(node: ts.Expression): string[] {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [node.text];
  if (ts.isTemplateExpression(node)) {
    return [node.head.text, ...node.templateSpans.map((span) => span.literal.text)];
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.flatMap((el) => (ts.isExpression(el) ? chuCua(el) : []));
  }
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)) return chuCua(node.expression);
  return [];
}

function tenThuocTinh(p: ts.ObjectLiteralElementLike, sf: ts.SourceFile): string | null {
  if (!ts.isPropertyAssignment(p)) return null;
  const ten = p.name;
  if (ts.isIdentifier(ten) || ts.isStringLiteral(ten)) return ten.text;
  return ten.getText(sf);
}

/** Chuỗi `en` còn chữ Việt (ngoài “…”) trong một file, kèm số dòng. */
function chuVietTrongEn(path: string, text: string): string[] {
  const sf = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const loi: string[] = [];
  const soi = (node: ts.Node): void => {
    if (ts.isObjectLiteralExpression(node)) {
      const thuocTinh = node.properties;
      const coVi = thuocTinh.some((p) => tenThuocTinh(p, sf) === 'vi');
      const en = thuocTinh.find((p) => tenThuocTinh(p, sf) === 'en');
      if (coVi && en !== undefined && ts.isPropertyAssignment(en)) {
        for (const chu of chuCua(en.initializer)) {
          if (DAU_VIET.test(chu.replace(/“[^”]*”/g, ''))) {
            const dong = sf.getLineAndCharacterOfPosition(en.getStart(sf)).line + 1;
            loi.push(`${String(dong)}: ${chu.slice(0, 120)}`);
          }
        }
      }
    }
    ts.forEachChild(node, soi);
  };
  soi(sf);
  return loi;
}

describe('chuỗi tiếng Anh của cặp song ngữ không mang chữ Việt', () => {
  it('máy dò bắt chuỗi, template và mảng cụm chữ; bỏ qua câu trích “…”, chuỗi vi và object không phải cặp', () => {
    const loi = (text: string): number => chuVietTrongEn('a.ts', text).length;
    expect(loi("const a = { vi: 'Giá', en: 'Giá' };")).toBe(1);
    expect(loi("const a = { vi: 'x', en: `1 đồng ${'y'}` };")).toBe(1);
    expect(loi("const a = { vi: ['x'], en: ['ok', 'Quý 2'] };")).toBe(1);
    expect(loi("const a = { vi: 'x', en: 'the “Quý 2- 2026” (Q2 2026) column' };")).toBe(0);
    expect(loi("const a = { vi: 'Giá', en: 'Price' };")).toBe(0);
    // Không có `vi` bên cạnh thì không phải cặp song ngữ (bảng dịch khoá Việt → chữ Anh chẳng hạn).
    expect(loi("const a = { en: 'Giá', khac: 1 };")).toBe(0);
  });

  it('mọi cặp song ngữ trong src/core, src/application, src/ui, src/app, src/data', () => {
    const files = ['core', 'application', 'ui', 'app', 'data']
      .flatMap((tang) => walk(join(SRC, tang)))
      .filter((path) => !path.includes('.test.'));
    // Đường dẫn hỏng thì `files` rỗng và ca đỗ vì không có gì để soi — chặn kiểu đỗ giả đó.
    expect(files.length, `không quét được src từ ${SRC}`).toBeGreaterThan(100);

    const viPham = files.flatMap((path) =>
      chuVietTrongEn(path, readFileSync(path, 'utf8')).map(
        (cho) => `${path.slice(SRC.length)}:${cho}`,
      ),
    );
    expect(viPham, viPham.join('\n')).toEqual([]);
  }, 30_000);
});
