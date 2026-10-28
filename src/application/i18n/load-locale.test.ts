import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import { en } from './en';

/**
 * Từ điển tiếng Anh nạp động (28/10/2026). `src/test-setup.ts` nạp sẵn nó cho cả bộ test, nên ca
 * dưới dựng lại module bằng `vi.resetModules()` để thấy đúng trạng thái của một lượt mở trang:
 * chưa có `en`, `t()` rơi về tiếng Việt, nạp xong mới ra tiếng Anh.
 */
describe('nạp động từ điển tiếng Anh', () => {
  it('trước khi nạp thì rơi về tiếng Việt; nạp xong thì ra tiếng Anh; nạp lần hai không tải lại', async () => {
    vi.resetModules();
    const i18n = await import('./index');
    expect(i18n.isLocaleLoaded('vi')).toBe(true);
    expect(i18n.isLocaleLoaded('en')).toBe(false);
    expect(i18n.t('nav.settings', 'en')).toBe(i18n.t('nav.settings', 'vi'));

    const lanDau = i18n.loadLocale('en');
    expect(i18n.loadLocale('en')).toBe(lanDau);
    await lanDau;
    expect(i18n.isLocaleLoaded('en')).toBe(true);
    expect(i18n.t('nav.settings', 'en')).toBe(en['nav.settings']);
    expect(i18n.t('nav.settings', 'en')).not.toBe(i18n.t('nav.settings', 'vi'));
  });

  it('index.ts không nhập tĩnh ./en — một dòng nhập tĩnh là từ điển quay về chunk chung', () => {
    const src = readFileSync(fileURLToPath(new URL('./index.ts', import.meta.url)), 'utf8');
    const ma = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(ma).not.toMatch(/from '\.\/en'/);
    expect(ma).toMatch(/import\('\.\/en'\)/);
  });
});
