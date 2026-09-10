// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ROUTES, formulaPath } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { FooterDisclaimer } from './FooterDisclaimer';

/**
 * Dải miễn trừ ở chân trang — FR-24 · UI-04.
 *
 * Luật "màn nào" đã có ca kiểm riêng ở `routes.test.ts` (`showsFooterDisclaimer()`); file này gác
 * phần còn lại, thứ mà một hàm thuần không nói được: lá client có thật sự HỎI luật ấy không, hay
 * đang dựng vô điều kiện như trước.
 */

const duongDan = vi.hoisted(() => ({ hienTai: '/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => duongDan.hienTai,
}));

function dung(path: string) {
  duongDan.hienTai = path;
  return render(
    <PreferencesProvider>
      <FooterDisclaimer />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  duongDan.hienTai = ROUTES.home;
});

afterEach(cleanup);

describe('FooterDisclaimer', () => {
  it('dựng ở trang chủ', () => {
    dung(ROUTES.home);

    expect(screen.getByRole('note').textContent).toContain('tham khảo');
  });

  /*
   * Nửa quan trọng của FR-24: bỏ ở màn chi tiết là một NGOẠI LỆ, không phải một cách làm mới. Màn
   * danh sách không có ô vàng đầu trang nào, nên chân trang là chỗ duy nhất câu ấy còn xuất hiện.
   */
  it('vẫn dựng ở màn danh sách công thức', () => {
    dung(ROUTES.formulas);

    expect(screen.queryByRole('note')).not.toBeNull();
  });

  /*
   * Trang chi tiết tự dựng `DisclaimerBar variant="notice"` ngay dòng đầu thân màn. Không dựng gì
   * ở đây chứ không phải dựng rồi ẩn bằng CSS: một dải `display: none` vẫn nằm trong HTML tĩnh và
   * vẫn là câu thứ hai với trình đọc màn hình nếu ai đó lỡ đổi luật ẩn.
   */
  it('KHÔNG dựng gì ở trang chi tiết công thức', () => {
    const { container } = dung(formulaPath('capm'));

    expect(screen.queryByRole('note')).toBeNull();
    expect(container.innerHTML).toBe('');
  });
});
