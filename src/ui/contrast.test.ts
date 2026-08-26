import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  AA_NON_TEXT,
  AA_TEXT,
  contrastRatio,
  extractColorTokens,
  meetsContrast,
  parseHex,
  relativeLuminance,
} from './contrast';

const css = readFileSync(fileURLToPath(new URL('../app/globals.css', import.meta.url)), 'utf8');

/** Bộ chọn bật bảng tối. Cùng chuỗi với globals.css và với script chặn nháy ở layout.tsx. */
const DARK_SELECTOR = "[data-theme='dark']";

const LIGHT = extractColorTokens(css);
/*
 * Trộn chồng lên bảng sáng thay vì đọc riêng khối tối — đó mới là thứ trình duyệt thực sự thấy.
 * Token nào bảng tối cố ý không đè (`--color-brand-*`) vẫn giữ giá trị gốc, đúng như cascade.
 */
const DARK = { ...LIGHT, ...extractColorTokens(css, DARK_SELECTOR) };

const PALETTES = [
  ['sáng', LIGHT],
  ['tối', DARK],
] as const;

function reader(tokens: Record<string, string>, palette: string) {
  return (name: string): string => {
    const value = tokens[name];
    if (value === undefined) throw new Error(`bảng ${palette} thiếu token ${name}`);
    return value;
  };
}

describe('công cụ tương phản', () => {
  it('đọc được cả dạng #rgb và #rrggbb', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('#33322e')).toEqual({ r: 51, g: 50, b: 46 });
  });

  it('chuỗi màu hỏng thì trả null chứ không đoán', () => {
    expect(parseHex('xanh')).toBeNull();
    expect(parseHex('#12345')).toBeNull();
    expect(contrastRatio('xanh', '#ffffff')).toBe(0);
  });

  it('tính đúng hai mốc chuẩn của WCAG', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 2);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });
});

/*
 * Chạy TRỌN bộ phép kiểm trên CẢ HAI bảng màu.
 *
 * Bảng tối không được là ngoại lệ của NFR-USA-06: nó phải chịu đúng những ngưỡng mà bảng sáng
 * chịu, không thêm không bớt. Vòng lặp này là thứ giữ điều đó — thêm một bảng thứ ba về sau chỉ
 * cần thêm một dòng vào `PALETTES`.
 */
for (const [palette, tokens] of PALETTES) {
  const color = reader(tokens, palette);

  describe(`bảng màu ${palette} đạt WCAG 2.1 AA (NFR-USA-06)`, () => {
    const backgrounds = [
      ['nền trang', '--color-paper'],
      ['nền thẻ', '--color-surface'],
    ] as const;

    const textTokens = [
      '--color-ink',
      '--color-ink-soft',
      '--color-muted',
      '--color-accent',
      '--color-danger',
      '--color-success',
      '--color-warning',
    ];

    for (const [bgLabel, bgToken] of backgrounds) {
      for (const fgToken of textTokens) {
        it(`${fgToken} trên ${bgLabel} đạt ${AA_TEXT}:1`, () => {
          const ratio = contrastRatio(color(fgToken), color(bgToken));
          expect(ratio, `tỉ số hiện tại ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXT);
        });
      }
    }

    const nonTextTokens = ['--color-border-strong', '--color-focus'];

    for (const [bgLabel, bgToken] of backgrounds) {
      for (const fgToken of nonTextTokens) {
        it(`${fgToken} trên ${bgLabel} đạt ${AA_NON_TEXT}:1 cho ranh giới điều khiển`, () => {
          const ratio = contrastRatio(color(fgToken), color(bgToken));
          expect(ratio, `tỉ số hiện tại ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NON_TEXT);
        });
      }
    }

    /*
     * Xanh rực không phải màu chữ — nó chỉ cần đủ 3:1 để nhìn thấy vạch chỉ báo trên nền trang.
     * Việc chặn dùng nó làm màu chữ nằm ở src/ui/tokens.test.ts.
     */
    for (const [bgLabel, bgToken] of backgrounds) {
      it(`--color-accent-vivid trên ${bgLabel} đạt ${AA_NON_TEXT}:1 cho mảng màu`, () => {
        const ratio = contrastRatio(color('--color-accent-vivid'), color(bgToken));
        expect(ratio, `tỉ số hiện tại ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NON_TEXT);
      });
    }

    it('chữ trên nền nhấn đạt AA — nút chính', () => {
      expect(meetsContrast(color('--color-on-accent'), color('--color-accent'))).toBe(true);
    });

    it('chữ cảnh báo đọc được trên nền cảnh báo nhạt', () => {
      expect(meetsContrast(color('--color-warning'), color('--color-warning-soft'))).toBe(true);
      expect(meetsContrast(color('--color-danger'), color('--color-danger-soft'))).toBe(true);
    });

    it('chữ báo thành công đọc được trên nền xanh lá nhạt — khối báo cáo WF-11', () => {
      expect(meetsContrast(color('--color-success'), color('--color-success-soft'))).toBe(true);
    });

    it('chữ chính đọc được trên vùng chìm — ô khoá ở chế độ Cơ bản (WF-16)', () => {
      expect(meetsContrast(color('--color-ink'), color('--color-sunken'))).toBe(true);
      expect(meetsContrast(color('--color-muted'), color('--color-sunken'))).toBe(true);
    });

    it('chip đang chọn vẫn đọc được', () => {
      expect(meetsContrast(color('--color-accent'), color('--color-accent-soft'))).toBe(true);
    });
  });
}

/** Mọi token màu mà primitive đang dùng. Không kể `--color-brand-*` (mảng màu của logo). */
const REQUIRED_TOKENS = [
  '--color-paper',
  '--color-surface',
  '--color-sunken',
  '--color-ink',
  '--color-ink-soft',
  '--color-muted',
  '--color-border',
  '--color-border-strong',
  '--color-accent',
  '--color-accent-strong',
  '--color-accent-soft',
  '--color-accent-vivid',
  '--color-on-accent',
  '--color-danger',
  '--color-danger-soft',
  '--color-success',
  '--color-success-soft',
  '--color-success-line',
  '--color-warning',
  '--color-warning-line',
  '--color-warning-soft',
  '--color-focus',
];

describe('globals.css khai báo đủ token màu', () => {
  for (const [palette, tokens] of PALETTES) {
    it(`bảng ${palette} có mọi token mà primitive đang dùng`, () => {
      for (const name of REQUIRED_TOKENS) {
        expect(tokens, `thiếu ${name}`).toHaveProperty(name);
      }
    });
  }

  /*
   * Bóc theo bộ chọn phải thật sự CẮT, không phải quét cả file rồi trả về mọi thứ.
   * Nếu `findBlock` hỏng và trả về toàn bộ nội dung, `LIGHT` sẽ dính giá trị của bảng tối và
   * cả 27 phép kiểm phía trên biến thành trò vô nghĩa mà vẫn xanh — ca này chặn đúng chỗ đó.
   */
  it('bóc token theo đúng khối, không lẫn giữa hai bảng', () => {
    const darkOnly = extractColorTokens(css, DARK_SELECTOR);

    expect(LIGHT['--color-paper']).toBe('#f4f6fa');
    expect(darkOnly['--color-paper']).toBe('#111827');
    expect(DARK['--color-paper']).toBe('#111827');

    // Khối tối cố ý không khai màu logo, nên bản trộn phải rơi về giá trị của bảng sáng.
    expect(darkOnly).not.toHaveProperty('--color-brand-from');
    expect(DARK['--color-brand-from']).toBe(LIGHT['--color-brand-from']);

    expect(extractColorTokens(css, "[data-theme='khong-co']")).toEqual({});
  });
});
