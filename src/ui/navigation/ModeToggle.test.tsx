// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PREFERENCES_STORAGE_KEY } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { ModeToggle } from './ModeToggle';

/**
 * Cụm nút Cơ bản / Nâng cao — ở thanh trên của màn danh sách và ở màn Cài đặt.
 *
 * Thứ đáng gác ở đây KHÔNG phải "bấm có đổi state không", mà là **nút nào sáng thì do đâu quyết**.
 * Buổi test nội bộ báo lỗi #21: cụm này nhấp nháy mỗi lần tải trang. Nguyên nhân là lượt render
 * đầu bắt buộc chạy bằng `DEFAULT_PREFERENCES` (mode Cơ bản) để khớp HTML tĩnh, nên khi React
 * quyết ô sáng thì người dùng Nâng cao thấy ô sáng nhảy một nhịp sau hydrate.
 *
 * Nên ca kiểm đi theo đúng chỗ đã chữa: lớp CSS của hai nút phải KHÔNG phụ thuộc chế độ (React
 * thôi quyết), còn `data-mode` trên `<html>` mới là thứ chọn — và CSS phải đọc nó đúng chiều.
 */

function dungNut() {
  return render(
    <PreferencesProvider>
      <ModeToggle />
    </PreferencesProvider>,
  );
}

function nutCoBan(): HTMLElement {
  return screen.getByRole('button', { name: 'Cơ bản' });
}

function nutNangCao(): HTMLElement {
  return screen.getByRole('button', { name: 'Nâng cao' });
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-mode');
});

afterEach(cleanup);

describe('ModeToggle', () => {
  it('nói ra chế độ đang chọn bằng aria-pressed, không chỉ bằng màu (NFR-USA-06)', async () => {
    dungNut();

    expect(
      (await screen.findByRole('button', { name: 'Cơ bản' })).getAttribute('aria-pressed'),
    ).toBe('true');
    expect(nutNangCao().getAttribute('aria-pressed')).toBe('false');
  });

  it('bấm Nâng cao thì ghi data-mode lên <html> — thứ CSS thật sự đọc', async () => {
    dungNut();

    await userEvent.click(nutNangCao());

    expect(document.documentElement.dataset.mode).toBe('advanced');
    expect(nutNangCao().getAttribute('aria-pressed')).toBe('true');
  });

  it('bấm về Cơ bản thì GỠ thuộc tính, không ghi "basic" — CSS viết theo hướng :not()', async () => {
    dungNut();

    await userEvent.click(nutNangCao());
    await userEvent.click(nutCoBan());

    expect(document.documentElement.hasAttribute('data-mode')).toBe(false);
  });

  /*
   * Ca chặn đúng lỗi #21 tái phát.
   *
   * Hai lượt dựng, hai chế độ đã lưu khác nhau, nhưng lớp CSS của từng nút phải y hệt nhau: chừng
   * nào còn đúng thế thì lượt render đầu (luôn là Cơ bản) không thể vẽ ô sáng sai chỗ rồi nhảy.
   * Thêm một lớp kiểu `selected` do state quyết là ca này đỏ ngay.
   */
  it('lớp CSS của hai nút KHÔNG đổi theo chế độ — ô sáng không do React vẽ', async () => {
    dungNut();
    const macDinh = [nutCoBan().className, nutNangCao().className];
    cleanup();

    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ mode: 'advanced', locale: 'vi', theme: 'light' }),
    );
    dungNut();
    // Chờ đúng lượt render mà bản nháp trong kho đã vào state — trước đợt này, chính lượt ấy là
    // lúc ô sáng nhảy chỗ.
    await waitFor(() => {
      expect(nutNangCao().getAttribute('aria-pressed')).toBe('true');
    });

    expect([nutCoBan().className, nutNangCao().className]).toEqual(macDinh);
  });
});

/**
 * Nửa còn lại của phép chữa nằm trong file CSS, mà jsdom không đọc CSS Module thật (tên lớp chỉ
 * là chuỗi giả). Nên gác bằng cách đọc thẳng file — cùng cách `CategoryGrid.test.tsx` đang gác
 * đúng cơ chế `data-mode` này ở trang chủ.
 */
describe('ModeToggle.module.css — chiều của phép chọn theo chế độ', () => {
  const raw = readFileSync(join(process.cwd(), 'src/ui/navigation/ModeToggle.module.css'), 'utf8');
  /* Cắt chú thích trước khi soi: docblock ở đó có nhắc `[data-mode='basic']` để nói vì sao KHÔNG dùng. */
  const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');

  it('mặc định (không có thuộc tính) là chế độ Cơ bản', () => {
    expect(css).toContain(":global(html:not([data-mode='advanced'])) .optionBasic");
    expect(css).toContain(":global(html[data-mode='advanced']) .optionAdvanced");
  });

  it('không nhánh nào bám vào data-mode="basic" — ca mặc định sẽ rơi mất', () => {
    expect(css).not.toContain("[data-mode='basic']");
  });

  it('không còn lớp `selected` do React gắn — đó chính là chỗ sinh ra cái nháy', () => {
    expect(css).not.toContain('.selected');
  });
});
