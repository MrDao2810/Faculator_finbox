// @vitest-environment jsdom

/**
 * Khối "Câu hỏi thường gặp" (10/11/2026) — xem docblock `src/core/hoi-dap/types.ts`.
 *
 * Bốn điều chủ dự án chốt khi được hỏi, mỗi điều một ca: câu gập sẵn; 5 câu đầu hiện, phần còn lại
 * sau nút "Xem thêm N câu"; câu chưa có câu trả lời vẫn hiện và mở ra ghi "Chưa có trả lời"; mỗi câu
 * dẫn tới đúng chỗ nó được hỏi.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { t } from '@/application';
import type { CauHoiThuongGap } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { FAQ_HIEN_TRUOC, FaqBlock } from './FaqBlock';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function cau(n: number, them: Partial<CauHoiThuongGap> = {}): CauHoiThuongGap {
  return {
    hoi: { vi: `Câu hỏi số ${String(n)}?`, en: `Question number ${String(n)}?` },
    nguyenVan: `cau goc ${String(n)}`,
    nguon: {
      url: `https://example.com/threads/${String(n)}`,
      ten: 'F319',
      noi: 'dien-dan',
      vietnam: true,
    },
    traLoi: { vi: `Trả lời số ${String(n)}.`, en: `Answer number ${String(n)}.` },
    ...them,
  };
}

const BAY_CAU = Array.from({ length: 7 }, (_, i) => cau(i + 1));

describe('khối Câu hỏi thường gặp', () => {
  it('không có câu nào thì không dựng gì', () => {
    const { container } = render(<FaqBlock items={[]} formulaId="pe" />);
    expect(container.innerHTML).toBe('');
  });

  it('có tiêu đề cấp 2 và mọi câu gập sẵn', () => {
    render(<FaqBlock items={BAY_CAU} formulaId="pe" />);
    expect(screen.getByRole('heading', { level: 2, name: t('faq.title') })).not.toBeNull();
    const details = document.querySelectorAll('details');
    expect(details).toHaveLength(7);
    for (const d of details) expect(d.open).toBe(false);
  });

  it(`hiện ${String(FAQ_HIEN_TRUOC)} câu đầu, phần còn lại ẩn sau nút Xem thêm`, () => {
    render(<FaqBlock items={BAY_CAU} formulaId="pe" />);
    const details = [...document.querySelectorAll('details')];
    expect(details.map((d) => d.hidden)).toEqual([false, false, false, false, false, true, true]);

    const nut = screen.getByRole('button', { name: t('faq.more').replace('{n}', '2') });
    expect(nut.getAttribute('aria-expanded')).toBe('false');
    expect(nut.getAttribute('aria-controls')).toBe('faq-pe-list');

    fireEvent.click(nut);
    expect(details.every((d) => !d.hidden)).toBe(true);
    const thuGon = screen.getByRole('button', { name: t('faq.less') });
    expect(thuGon.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(thuGon);
    expect(details[6]?.hidden).toBe(true);
  });

  it('không quá 5 câu thì không có nút Xem thêm', () => {
    render(<FaqBlock items={BAY_CAU.slice(0, FAQ_HIEN_TRUOC)} formulaId="pe" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('câu chưa có câu trả lời vẫn hiện, mở ra ghi "Chưa có trả lời"', () => {
    const chuaTraLoi = cau(1);
    delete (chuaTraLoi as { traLoi?: unknown }).traLoi;
    render(<FaqBlock items={[chuaTraLoi]} formulaId="pe" />);
    expect(screen.getByText('Câu hỏi số 1?')).not.toBeNull();
    expect(screen.getByText(t('faq.noAnswer'))).not.toBeNull();
  });

  it('mỗi câu dẫn tới đúng chỗ nó được hỏi, mở tab mới', () => {
    render(<FaqBlock items={[cau(3)]} formulaId="pe" />);
    const link = screen.getByRole('link', { name: 'example.com/threads/3' });
    expect(link.getAttribute('href')).toBe('https://example.com/threads/3');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer');
  });

  it('nguồn trả lời trùng link câu hỏi thì không in lần hai, khác thì in', () => {
    const trung = cau(1, { nguonTraLoi: [{ url: 'https://example.com/threads/1', ten: 'F319' }] });
    const khac = cau(2, { nguonTraLoi: [{ url: 'https://example.org/faq#pe', ten: 'DNSE' }] });
    render(<FaqBlock items={[trung, khac]} formulaId="pe" />);
    expect(screen.getAllByText(t('faq.answerSource'))).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'example.org/faq#pe' })).not.toBeNull();
  });

  it('HTML tĩnh khớp lượt dựng đầu của máy khách (câu thứ 6 trở đi mang hidden)', () => {
    const html = renderToStaticMarkup(<FaqBlock items={BAY_CAU} formulaId="pe" />);
    const { container } = render(<FaqBlock items={BAY_CAU} formulaId="pe" />);
    expect(container.innerHTML).toBe(html);
    expect((html.match(/<details[^>]*hidden/g) ?? []).length).toBe(2);
  });

  it('chế độ tiếng Anh in câu hỏi và câu trả lời bản en', () => {
    window.localStorage.setItem('ffb.prefs.v1', JSON.stringify({ locale: 'en' }));
    render(
      <PreferencesProvider>
        <FaqBlock items={[cau(1)]} formulaId="pe" />
      </PreferencesProvider>,
    );
    expect(screen.getByText('Question number 1?')).not.toBeNull();
    expect(screen.getByText('Answer number 1.')).not.toBeNull();
    expect(screen.queryByText('Câu hỏi số 1?')).toBeNull();
  });

  it('CSS: câu bị ẩn không bị lớp nào của tác giả hiện lại', () => {
    const css = readFileSync(join(__dirname, 'FaqBlock.module.css'), 'utf8');
    expect(css).toMatch(/\.list > \.item\[hidden\]\s*\{\s*display: none;/);
  });
});
