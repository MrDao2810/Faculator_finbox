import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Nút tên cột của bảng chuỗi giá: chữ và dấu ˅ trên MỘT hàng, dấu bên phải (20/10/2026).
 *
 * Lỗi thật: nút từng mang lớp `.head`, trùng tên với khối tiêu đề đầu màn. CSS Module băm hai luật
 * cùng tên thành MỘT lớp, nên nút thừa hưởng `flex-direction: column` của khối tiêu đề — dấu ˅ rơi
 * xuống dưới chữ, chữ canh giữa cột. Chủ dự án: _"giao diện quá xấu, title sắp xếp xấu. icon sort
 * chuyển sang bên phải chứ không phải bên dưới"_. Không test React nào thấy được (jsdom không dàn
 * trang), nên ca dưới đọc thẳng hai file.
 */

function doc(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8');
}

const CSS = doc('./DataTableScreen.module.css').replace(/\/\*[\s\S]*?\*\//g, '');
const TSX = doc('./DataTableScreen.tsx');

describe('nút tên cột của bảng chuỗi giá', () => {
  it('xếp chữ và dấu ˅ theo hàng ngang, khai thẳng chứ không thừa hưởng', () => {
    const than = /^\.colHead\s*\{([^}]*)\}/m.exec(CSS)?.[1] ?? '';
    expect(than).toMatch(/display:\s*flex;/);
    expect(than).toMatch(/flex-direction:\s*row;/);
  });

  it('nút dùng lớp riêng, lớp `.head` chỉ còn cho khối tiêu đề đầu màn', () => {
    expect(TSX).toMatch(/styles\.colHead\b/);
    expect(TSX.match(/styles\.head\b/g) ?? []).toHaveLength(1);
    expect(TSX).toMatch(/<header className=\{styles\.head\}>/);
  });

  it('cột Ngày dạt trái, các cột số dạt phải', () => {
    expect(/^\.colHead\s*\{([^}]*)\}/m.exec(CSS)?.[1]).toMatch(/justify-content:\s*flex-end;/);
    expect(/^\.thDate \.colHead\s*\{([^}]*)\}/m.exec(CSS)?.[1]).toMatch(
      /justify-content:\s*flex-start;/,
    );
  });
});
