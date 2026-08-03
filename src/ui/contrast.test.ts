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
const tokens = extractColorTokens(css);

function color(name: string): string {
  const value = tokens[name];
  if (value === undefined) throw new Error(`globals.css thiếu token ${name}`);
  return value;
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

describe('bảng màu blueprint đạt WCAG 2.1 AA (NFR-USA-06)', () => {
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

  it('chữ trên nền nhấn đạt AA — nút chính', () => {
    expect(meetsContrast(color('--color-on-accent'), color('--color-accent'))).toBe(true);
  });

  it('chữ cảnh báo đọc được trên nền cảnh báo nhạt', () => {
    expect(meetsContrast(color('--color-warning'), color('--color-warning-soft'))).toBe(true);
    expect(meetsContrast(color('--color-danger'), color('--color-danger-soft'))).toBe(true);
  });

  it('chữ chính đọc được trên vùng chìm — ô khoá ở chế độ Cơ bản (WF-16)', () => {
    expect(meetsContrast(color('--color-ink'), color('--color-sunken'))).toBe(true);
    expect(meetsContrast(color('--color-muted'), color('--color-sunken'))).toBe(true);
  });

  it('chip đang chọn vẫn đọc được', () => {
    expect(meetsContrast(color('--color-accent'), color('--color-accent-soft'))).toBe(true);
  });
});

describe('globals.css khai báo đủ token màu', () => {
  it('có mọi token mà primitive đang dùng', () => {
    const required = [
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
      '--color-on-accent',
      '--color-danger',
      '--color-danger-soft',
      '--color-success',
      '--color-warning',
      '--color-warning-line',
      '--color-warning-soft',
      '--color-focus',
    ];
    for (const name of required) {
      expect(tokens, `thiếu ${name}`).toHaveProperty(name);
    }
  });
});
