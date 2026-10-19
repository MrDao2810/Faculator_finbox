import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Lời giải ở khổ điện thoại — ba dòng ngắn đứng cạnh nhãn khi vừa (19/10/2026).
 *
 * Chủ dự án: _"đối với công thức nếu ngắn và gọn thì có thể để sang bên phải như tôi chỉ, bên dưới áp
 * vào công thức và đáp án cũng tương tự. nếu quá dài thì mới xuống dòng"_. Toàn bộ là CSS, mà test
 * React không chạy CSS Module, nên ca dưới đọc thẳng file: đủ luật, và đúng ba dòng mang lớp.
 */

function doc(ten: string): string {
  return readFileSync(fileURLToPath(new URL(`./${ten}`, import.meta.url)), 'utf8');
}

const CSS = doc('LoiGiai.module.css').replace(/\/\*[\s\S]*?\*\//g, '');
const DIEN_THOAI = /@media \(max-width: 559\.98px\)\s*\{([\s\S]*?)\n\}/.exec(CSS)?.[1] ?? '';

function luat(boChon: string): string {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${thoat}\\s*\\{([^}]*)\\}`).exec(DIEN_THOAI)?.[1] ?? '';
}

/** Khoá i18n của nhãn mỗi dòng mang lớp `lop` trong `LoiGiai.tsx`. */
function dongMangLop(lop: string): string[] {
  const tsx = doc('LoiGiai.tsx');
  return [
    ...tsx.matchAll(new RegExp(`styles\\.${lop}\\}\`\\}>\\s*<dt>\\{t\\('([^']+)'\\)\\}`, 'g')),
  ].map((k) => k[1] ?? '');
}

describe('LoiGiai dưới 560px — dòng ngắn đứng cạnh nhãn', () => {
  it('Áp dụng công thức và Kết quả: hàng flex xuống dòng, nội dung dạt phải, không rộng quá khối', () => {
    expect(dongMangLop('giaiNgang')).toEqual(['quiz.giai.apVao', 'quiz.giai.ketQua']);
    expect(luat('.giaiHang.giaiNgang')).toMatch(/display:\s*flex;/);
    expect(luat('.giaiHang.giaiNgang')).toMatch(/flex-wrap:\s*wrap;/);
    expect(luat('.giaiHang.giaiNgang > dd')).toMatch(/margin-left:\s*auto;/);
    expect(luat('.giaiHang.giaiNgang > dd')).toMatch(/max-width:\s*100%;/);
  });

  /*
   * Dòng Công thức: chỉ HÌNH sang phải; câu "để tính …" căn TRÁI, chạy hết bề ngang dưới cả nhãn.
   * Bản đầu cho câu ấy canh phải trong phần bề ngang cạnh nhãn, và chủ dự án gọi đúng tên nó: _"máy
   * móc … căn phải theo nhìn rất xấu"_. Ca này giữ: nhãn trôi trái, hình trôi phải, câu đuôi dọn
   * cả hai float — và không ai đặt lại `text-align: right` cho câu đuôi.
   */
  it('Công thức áp dụng: hình trôi phải, câu "để tính …" xuống dòng riêng, căn trái', () => {
    expect(dongMangLop('giaiNgangHinh')).toEqual(['quiz.giai.congThuc']);
    expect(luat('.giaiHang.giaiNgangHinh')).toMatch(/display:\s*flow-root;/);
    expect(luat('.giaiNgangHinh > dt')).toMatch(/float:\s*left;/);
    expect(luat('.giaiNgangHinh .giaiHinh,\n  .giaiNgangHinh .giaiGhiDe')).toMatch(
      /float:\s*right;[\s\S]*max-width:\s*100%;/,
    );

    const duoi = luat('.giaiNgangHinh .giaiDeTinh');
    expect(duoi).toMatch(/clear:\s*both;/);
    expect(DIEN_THOAI).not.toMatch(/text-align:\s*right;/);
  });
});
