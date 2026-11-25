// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { formatNumber, ok } from '@/application';

import { ResultBlock } from './ResultBlock';

afterEach(cleanup);

const CSS = readFileSync(join(__dirname, 'ResultBlock.module.css'), 'utf8');

describe('ResultBlock — số khổng lồ không làm vỡ thẻ', () => {
  it('số rất dài có chỗ ngắt sau dấu chấm và --ky-tu bằng độ dài chuỗi, textContent giữ nguyên', () => {
    const value = 1.15698809225256e60;
    const text = formatNumber(value);
    const { container } = render(<ResultBlock output={ok(value, 'VND')} />);
    const so = container.querySelector('p span') as HTMLElement;
    expect(so.textContent).toBe(text);
    expect(so.querySelectorAll('wbr').length).toBeGreaterThan(3);
    expect(so.style.getPropertyValue('--ky-tu')).toBe(String(text.length));
  });

  it('số bình thường cũng mang --ky-tu và không đổi chữ', () => {
    const { container } = render(<ResultBlock output={ok(22196402.35, 'VND')} />);
    const so = container.querySelector('p span') as HTMLElement;
    expect(so.textContent).toBe(formatNumber(22196402.35));
    expect(so.style.getPropertyValue('--ky-tu')).toBe(String(so.textContent?.length));
  });

  it('CSS: co cỡ theo bề ngang thẻ trong @supports, có min-width: 0 và overflow-wrap', () => {
    expect(CSS).toMatch(/@supports \(width: 1cqi\)/);
    expect(CSS).toMatch(/container-type: inline-size/);
    expect(CSS).toMatch(/var\(--ky-tu, 1\)/);
    expect(CSS).toMatch(/\.block,\s*\.figure\s*\{\s*min-width: 0;/);
    expect(CSS).toMatch(/overflow-wrap: anywhere/);
    // Khối co cỡ phải nằm SAU mọi @media cỡ chữ của .value (cùng độ ưu tiên, thứ tự quyết định).
    expect(CSS.lastIndexOf('@supports (width: 1cqi)')).toBeGreaterThan(
      CSS.lastIndexOf('font-size: var(--text-xl)'),
    );
  });
});
