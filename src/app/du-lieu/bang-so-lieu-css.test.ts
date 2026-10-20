import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Bảng số liệu của màn Chuỗi giá OHLCV theo khuôn lưới "Bảng dữ liệu" (20/10/2026). Chủ dự án: _"thay
 * đổi tương tự với bảng số liệu của phần Chuỗi giá OHLCV"_. Test React không chạy CSS Module, nên các
 * ca dưới đọc thẳng hai file CSS — và so chúng với nhau: hai bảng là một khuôn, lệch một bên là lại
 * thành "hai chỗ hai lối".
 */

function doc(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8');
}

const bo = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');
const BANG = bo(doc('./DataTableScreen.module.css'));
const LUOI = bo(doc('../../ui/sheets/PasteImportSheet.module.css'));
const BANG_TSX = doc('./DataTableScreen.tsx');
const LUOI_TSX = doc('../../ui/sheets/PasteImportSheet.tsx');

/** Thân của luật đầu tiên có đúng bộ chọn ấy, hoặc chuỗi rỗng. */
function luat(boChon: string, css = BANG): string {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'm').exec(css)?.[1] ?? '';
}

/** Các khai báo của một thân luật, gọn khoảng trắng, theo thứ tự chữ cái — để so hai file. */
function khaiBao(than: string): string[] {
  return than
    .split(';')
    .map((dong) => dong.trim().replace(/\s+/g, ' '))
    .filter((dong) => dong !== '')
    .sort();
}

describe('bảng số liệu /du-lieu/ — khuôn lưới "Bảng dữ liệu"', () => {
  /*
   * Cuộn sang cột Khối lượng mà không còn thấy ngày là không biết con số ấy của phiên nào. Cột Ngày
   * dính ngay sau cột số thứ tự, nên chỗ nó dính (`left`) phải bằng ĐÚNG bề ngang cột ấy.
   */
  it('cột số thứ tự và cột Ngày đứng yên khi cuộn ngang, cột Ngày dính sát sau cột số thứ tự', () => {
    const soDong = luat('.table thead th.lineHead,\n.table tbody th');
    expect(soDong).toMatch(/position:\s*sticky/);
    expect(soDong).toMatch(/left:\s*0/);

    const ngay = luat('.table thead th.thDate,\n.table tbody td.tdDate');
    expect(ngay).toMatch(/position:\s*sticky/);
    const lech = /left:\s*([^;]+);/.exec(ngay)?.[1]?.trim();
    const rongCotSo = /width:\s*([^;]+);/.exec(luat('.colLine,\n.colRemove'))?.[1]?.trim();
    expect(lech).toBeDefined();
    expect(lech).toBe(rongCotSo);
    expect(luat('.tableWrap')).toMatch(/overflow-x:\s*auto/);
  });

  /* Cùng bẫy đã đo ở lưới popup: thiếu `.table` ở đầu thì `.table tbody td` thắng và sọc biến mất. */
  it('luật dòng sọc và dòng lỗi đủ độ ưu tiên, và dòng lỗi khai sau dòng sọc', () => {
    expect(luat('.table tbody th,\n.table tbody td')).toMatch(/background:/);
    expect(luat('.table .rowStripe > th,\n.table .rowStripe > td')).toMatch(/background:/);
    expect(luat('.table .badRow > th,\n.table .badRow > td')).toMatch(/--color-warning-soft/);
    expect(BANG.indexOf('.table .badRow > th')).toBeGreaterThan(
      BANG.indexOf('.table .rowStripe > th'),
    );
  });

  it('một chiều cao dòng cho cả hai bảng, 32px', () => {
    const bang = Number(/const ROW_H = (\d+);/.exec(BANG_TSX)?.[1]);
    const luoi = Number(/const ROW_H = (\d+);/.exec(LUOI_TSX)?.[1]);
    expect(bang).toBe(32);
    expect(bang).toBe(luoi);
  });

  /*
   * Phần NHÌN của khuôn: đầu bảng, nền dòng, sọc, tên cột, ô nhập, màu ngày và khối lượng, màu cột
   * Đóng. Đổi ở một bảng mà quên bảng kia thì ca này đỏ.
   */
  it('các luật nhìn thấy giống hệt lưới popup', () => {
    const cap: ReadonlyArray<readonly [bang: string, luoi: string]> = [
      ['.table thead th', '.grid thead th'],
      ['.table tbody th,\n.table tbody td', '.grid tbody th,\n.grid tbody td'],
      [
        '.table .rowStripe > th,\n.table .rowStripe > td',
        '.grid .rowStripe > th,\n.grid .rowStripe > td',
      ],
      /* Tên lớp `.colHead`: `.head` ở file màn này là khối tiêu đề đầu màn (xem docblock luật ấy). */
      ['.colHead', '.head'],
      ['.colHeadOn,\n.colHeadOn:hover', '.headOn,\n.headOn:hover'],
      ['.sortIcon', '.sortIcon'],
      ['.lineHead,\n.lineNo', '.lineHead,\n.lineNo'],
      // Số dòng lỗi: đậm và đỏ, không viên tròn (chủ dự án bỏ viên vàng ngày 20/10/2026).
      ['.lineNoBad', '.lineNoBad'],
      ['.cell:focus', '.cell:focus'],
      ['.tdDate .cell', '.tdDate .cell'],
      ['.tdSoft .cell', '.tdSoft .cell'],
      ["td[data-xu-huong='tang'] .cell", "td[data-xu-huong='tang'] .cell"],
      ["td[data-xu-huong='giam'] .cell", "td[data-xu-huong='giam'] .cell"],
      ['.yearNote', '.yearNote'],
    ];
    for (const [a, b] of cap) {
      const ben = khaiBao(luat(a));
      expect(ben.length, a).toBeGreaterThan(0);
      // Hai bảng đặt hai tên biến khác nhau cho chiều cao dòng — so phần còn lại.
      const doiTen = (dong: string): string => dong.replace('--bang-dong-h', '--paste-row-h');
      /*
       * Khác có chủ ý, và chỉ chừng này: đầu lưới popup DÍNH khi cuộn dọc trong khung cao cố định
       * (`position`, `top`, `z-index`), còn bảng này nằm cả trong trang nên đầu bảng không dính.
       */
      const boDinh = (dong: string): boolean => !/^(position|top|z-index):/.test(dong);
      expect(ben.map(doiTen), a).toEqual(khaiBao(luat(b, LUOI)).filter(boDinh));
    }
    // `.cell` khác đúng một chỗ: tên biến chiều cao dòng.
    expect(khaiBao(luat('.cell')).map((d) => d.replace('--bang-dong-h', '--paste-row-h'))).toEqual(
      khaiBao(luat('.cell', LUOI)),
    );
  });

  /* Ca đảo chiều: ô từng là hộp có viền và cờ "!" từng có cột riêng. */
  it('không còn ô hộp có viền, cũng không còn cột cờ "!" riêng', () => {
    expect(luat('.cell')).toMatch(/border:\s*0/);
    for (const lop of ['.flagCol', '.flag ', '.dateCell']) {
      expect(BANG.includes(lop), lop).toBe(false);
    }
  });
});
