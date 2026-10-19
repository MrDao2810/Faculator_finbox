// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PREFERENCES_STORAGE_KEY } from '@/application';
import { readPreferences } from '@/application/preferences';
import { PreferencesProvider } from '@/application/preferences-context';

import { HiddenByLevelNote } from './HiddenByLevelNote';

function mo(count: number) {
  render(
    <PreferencesProvider>
      <HiddenByLevelNote count={count} />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('HiddenByLevelNote — FR-09', () => {
  it('nói ra bằng SỐ chứ không chỉ "một vài ô đang ẩn"', () => {
    mo(29);

    const note = screen.getByText(/ô nâng cao đang ẩn/);
    expect(note.textContent).toContain('29');
  });

  /*
   * Bản thiết kế mobile đợt 13 thêm ổ khoá. Icon phải KHÔNG đóng góp chữ nào: `getByText` ở ca
   * ngay trên dò đúng phần tử chứa con số, và một `<title>` lọt vào SVG là câu đó vỡ làm hai.
   */
  it('có ổ khoá, và ổ khoá không mang theo chữ nào', () => {
    const { container } = render(
      <PreferencesProvider>
        <HiddenByLevelNote count={29} />
      </PreferencesProvider>,
    );

    const icon = container.querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon?.textContent).toBe('');
    expect(
      icon?.getAttribute('aria-hidden') ?? icon?.parentElement?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  /*
   * Màn Danh mục ẩn Ô SỐ LIỆU chứ không ẩn công thức. Từ 19/10/2026 đây là nơi duy nhất còn dùng
   * khối này (danh sách và Tìm kiếm đã bỏ dòng "N công thức nâng cao đang ẩn"), nên câu phải nói
   * về ô, không bao giờ về công thức.
   */
  it('nói về Ô số liệu, không nói về CÔNG THỨC', () => {
    mo(2);

    expect(screen.getByText(/ô nâng cao đang ẩn/).textContent).toContain('2');
    expect(screen.queryByText(/công thức nâng cao đang ẩn/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Bật chế độ Nâng cao' })).toBeTruthy();
  });

  /*
   * Không ẩn gì thì không được để lại ô trống: thẻ tóm tắt xếp theo flex có `gap`, nên một thẻ
   * <p> rỗng vẫn ăn một khoảng trắng lửng dưới các dòng số.
   */
  it('không ẩn ô nào thì không dựng gì cả', () => {
    const { container } = render(
      <PreferencesProvider>
        <HiddenByLevelNote count={0} />
      </PreferencesProvider>,
    );
    expect(container.innerHTML).toBe('');
  });

  it('số âm cũng không dựng gì — không bao giờ hiện "-1 ô"', () => {
    const { container } = render(
      <PreferencesProvider>
        <HiddenByLevelNote count={-3} />
      </PreferencesProvider>,
    );
    expect(container.innerHTML).toBe('');
  });

  /*
   * Đây là lý do khối này tồn tại: danh sách ngắn đi mà không có đường bật lại thì người dùng
   * phải tự đoán ra rằng thủ phạm là cái nút ở thanh trên.
   */
  it('bấm nút là chuyển sang chế độ Nâng cao VÀ ghi nhớ lại', async () => {
    const user = userEvent.setup();
    mo(29);

    await user.click(screen.getByRole('button', { name: 'Bật chế độ Nâng cao' }));

    expect(readPreferences(window.localStorage.getItem(PREFERENCES_STORAGE_KEY)).mode).toBe(
      'advanced',
    );
  });

  it('là <button> thật chứ không phải link — nó đổi cài đặt, không đi đâu cả', () => {
    mo(5);

    const nut = screen.getByRole('button', { name: 'Bật chế độ Nâng cao' });
    expect(nut.tagName).toBe('BUTTON');
    expect(nut.getAttribute('type')).toBe('button');
  });
});
