import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Ba nút anh em trên thanh trên — icon Cài đặt, Sáng/Tối, VI — chung MỘT khung, chép tay ở ba file
 * CSS Module (28/10/2026, khi icon Cài đặt thêm vào cạnh nút Sáng/Tối thay cho mục Cài đặt của thanh
 * nav).
 *
 * Ba bản chép là cái giá của CSS Module (một module không với được lớp của module khác). Docblock của
 * `LangSwitch.module.css` đã dặn "hai nút phải đổi cùng nhau, lệch một cái là thanh trên có hai kiểu
 * nút" — nay là ba nút, và lời dặn cần một cửa gác: ca dưới so từng khai báo của khung, lớp phủ vùng
 * chạm và luật rê chuột ở ba file. Mỗi file được thêm khai báo RIÊNG của nó (chữ của VI, bỏ gạch chân
 * của link), nhưng không được khác ở những khai báo chung.
 */

function docCss(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

/** Các khai báo của luật có đúng bộ chọn `boChon` — `{ thuộc tính: giá trị }`. */
function khaiBao(css: string, boChon: string): Record<string, string> {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const khop = new RegExp(`(?:^|[\\n}])\\s*${thoat}\\s*\\{([^}]*)\\}`).exec(css);
  if (khop === null) throw new Error(`Không thấy luật ${boChon}`);
  const ketQua: Record<string, string> = {};
  for (const dong of (khop[1] ?? '').split(';')) {
    const hai = dong.indexOf(':');
    if (hai < 0) continue;
    ketQua[dong.slice(0, hai).trim()] = dong
      .slice(hai + 1)
      .trim()
      .replace(/\s+/g, ' ');
  }
  return ketQua;
}

const FILE = {
  caiDat: docCss('./SettingsLink.module.css'),
  sangToi: docCss('./ThemeSwitch.module.css'),
  ngonNgu: docCss('./LangSwitch.module.css'),
};

/** Khai báo của khung mà cả ba phải giống hệt — lấy theo bản gốc `ThemeSwitch`. */
const KHUNG_CHUNG = [
  'position',
  'display',
  'align-items',
  'justify-content',
  'min-width',
  'min-height',
  'padding',
  'color',
  'background',
  'border',
  'border-radius',
  'cursor',
];

describe('ba nút của thanh trên chung một khung', () => {
  const goc = khaiBao(FILE.sangToi, '.button');

  it.each(Object.entries(FILE))(
    'khung %s khớp khung Sáng/Tối ở mọi khai báo chung',
    (_ten, css) => {
      const nut = khaiBao(css, '.button');
      for (const thuocTinh of KHUNG_CHUNG) {
        expect(goc[thuocTinh], `Sáng/Tối thiếu ${thuocTinh}`).toBeDefined();
        expect(nut[thuocTinh], thuocTinh).toBe(goc[thuocTinh]);
      }
    },
  );

  it.each(Object.entries(FILE))('lớp phủ vùng chạm 44px của %s giống hệt', (_ten, css) => {
    expect(khaiBao(css, '.button::after')).toEqual(khaiBao(FILE.sangToi, '.button::after'));
  });

  it.each(Object.entries(FILE))('luật rê chuột của %s giống hệt', (_ten, css) => {
    expect(khaiBao(css, '.button:hover')).toEqual(khaiBao(FILE.sangToi, '.button:hover'));
  });

  it('icon Cài đặt là link nên bỏ gạch chân', () => {
    expect(khaiBao(FILE.caiDat, '.button')['text-decoration']).toBe('none');
  });
});

/*
 * Trạng thái "đang ở màn Cài đặt": viền 2px, đệm ngang bớt đúng 1px để khung vẫn 36 × 32px — không
 * thì icon nở ra 2px khi vào màn Cài đặt và đẩy hai nút bên phải đi. Không tô nền: bản Figma đã bỏ
 * mảng xanh nhạt khỏi các nút của thanh trên (docblock `ThemeSwitch.module.css`).
 */
describe('icon Cài đặt khi đang ở màn Cài đặt', () => {
  const dangMo = khaiBao(FILE.caiDat, ".button[aria-current='page']");

  it('viền accent dày 2px, đệm ngang bớt 1px để khung không đổi cỡ', () => {
    expect(dangMo['border-width']).toBe('2px');
    expect(dangMo['border-color']).toBe('var(--color-accent)');
    expect(dangMo.padding).toBe('0 calc(var(--space-2) - 1px)');
    expect(khaiBao(FILE.caiDat, '.button').padding).toBe('0 var(--space-2)');
  });

  it('không tô nền', () => {
    expect(dangMo.background).toBeUndefined();
    expect(dangMo['background-color']).toBeUndefined();
  });
});
