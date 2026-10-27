import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Hai luật hình dáng của màn Cài đặt (27/10/2026) mà jsdom không đo được — test React không chạy
 * CSS Module, nên các ca dưới đọc thẳng file. Đã đo trên Chrome ở 1440, 390, 360 và 320px.
 *
 * 1. Nút đơn vị rộng ít nhất bằng nút "tỷ ₫": chủ dự án, khi viên chọn của "₫" thành hình bầu dục
 *    đứng (33 × 44px): _"bo khi chọn vào đ thì rất xấu, sửa lại cho thẩm mỹ hơn"_.
 * 2. Tên biểu phí sát mép phải, cùng hàng với nhãn — cùng lượt: _"đoạn text được khoanh đỏ bên dưới
 *    cần chuyển sang bên phải như tôi chỉ, áp dụng cho màn web mobile và web pc"_.
 */

function doc(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

const DON_VI = doc('../../ui/inputs/UnitSwitcher.module.css');
const BIEU_PHI = doc('../../ui/screens/FeeScheduleField.module.css');

function luat(css: string, boChon: string): string {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'm').exec(css)?.[1] ?? '';
}

describe('nút đơn vị không còn viên chọn hình bầu dục đứng', () => {
  it('bản thường: rộng ít nhất 48px, hơn chiều cao 44px', () => {
    expect(luat(DON_VI, '.option')).toMatch(/min-width:\s*48px;/);
    expect(luat(DON_VI, '.option')).toMatch(/min-height:\s*var\(--tap-min\);/);
  });

  it('bản gọn dưới 560px: rộng ít nhất 36px, hơn chiều cao 28px', () => {
    const gon = luat(DON_VI, '.compact > .option');
    expect(gon).toMatch(/min-width:\s*36px;/);
    expect(gon).toMatch(/min-height:\s*28px;/);
  });
});

describe('hàng biểu phí ở màn Cài đặt: tên biểu phí sát mép phải', () => {
  it('biến thể inline là một hàng ngang bẻ dòng được, tên đẩy về phải', () => {
    const hang = luat(BIEU_PHI, '.inline');
    expect(hang).toMatch(/flex-direction:\s*row;/);
    expect(hang).toMatch(/flex-wrap:\s*wrap;/);
    const ten = luat(BIEU_PHI, '.inline > .value');
    expect(ten).toMatch(/margin-left:\s*auto;/);
    expect(ten).toMatch(/text-align:\s*right;/);
  });

  it('màn Cài đặt bật inline, màn lợi nhuận ròng thì không', () => {
    const caiDat = readFileSync(
      fileURLToPath(new URL('./SettingsScreen.tsx', import.meta.url)),
      'utf8',
    );
    expect(caiDat).toMatch(/<FeeScheduleField[^>]*\binline\b[^>]*\/>/);
    const chiTiet = readFileSync(
      fileURLToPath(new URL('../../ui/screens/DetailBody.tsx', import.meta.url)),
      'utf8',
    );
    expect(chiTiet).toMatch(/return <FeeScheduleField \/>;/);
  });
});
