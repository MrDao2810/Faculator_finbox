// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TabBar, tabId } from './TabBar';

afterEach(cleanup);

const MANG = [
  { value: 'all' as const, label: 'Tất cả', count: 111 },
  { value: 'stock' as const, label: 'Chứng khoán', count: 98 },
  { value: 'personal' as const, label: 'Cá nhân', count: 13 },
];

/** Dựng cụm tab với một mảng đang chọn, trả về hàm nhận thay đổi để soi. */
function dung(value: 'all' | 'stock' | 'personal' = 'all') {
  const onChange = vi.fn();
  render(
    <TabBar
      items={MANG}
      value={value}
      onChange={onChange}
      label="Mảng"
      idBase="mang"
      panelId="danh-sach"
    />,
  );
  return onChange;
}

describe('TabBar — cụm chọn một trong nhiều', () => {
  /*
   * Vế NGỮ NGHĨA, và là lý do đợt này tồn tại.
   *
   * Ba mảng trước đây là ba `Chip`, tức ba nút mang `aria-pressed`. Trình đọc màn hình đọc ra
   * "nút bật/tắt" ba lần, không đọc ra "1 trong 3" — trong khi chúng loại trừ nhau và mỗi lần
   * bấm là thay hẳn danh sách bên dưới.
   */
  it('là tablist thật: mỗi mục một tab, đúng một tab được chọn', () => {
    dung('stock');

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true')).toHaveLength(1);
    expect(screen.getByRole('tab', { selected: true }).textContent).toContain('Chứng khoán');

    // Và KHÔNG còn `aria-pressed` của khuôn chip.
    expect(tabs.every((tab) => tab.getAttribute('aria-pressed') === null)).toBe(true);
  });

  it('cụm có tên, và mỗi tab trỏ tới vùng nội dung nó điều khiển', () => {
    dung();

    expect(screen.getByRole('tablist', { name: 'Mảng' })).not.toBeNull();
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab.getAttribute('aria-controls')).toBe('danh-sach');
    }
  });

  /*
   * id phải ĐOÁN ĐƯỢC từ bên ngoài: vùng nội dung nằm ở component khác và cần `aria-labelledby`
   * trỏ ngược về tab đang chọn. Ghim luôn `tabId()` để hai bên không tự dựng chuỗi riêng.
   */
  it('id của tab dựng từ `tabId()`, không phải chuỗi ngẫu nhiên', () => {
    dung();
    expect(screen.getByRole('tab', { name: /Tất cả/ }).id).toBe(tabId('mang', 'all'));
    // Không dính khuôn id React sinh (`:r0:` / `«r0»`) — bản build là HTML tĩnh.
    expect(screen.getByRole('tab', { name: /Cá nhân/ }).id).not.toMatch(/^[:«]/);
  });

  /*
   * Roving tabindex — thứ hàng chip cũ không có.
   *
   * Cả cụm chỉ chiếm MỘT nấc Tab; đi trong cụm bằng phím mũi tên. Không có nó thì người dùng bàn
   * phím phải bấm Tab ba lần chỉ để đi qua một bộ lọc.
   */
  it('chỉ tab đang chọn nhận được Tab từ bàn phím', () => {
    dung('personal');

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
  });

  it('phím mũi tên chạy giữa các tab, và chạy vòng ở hai đầu', async () => {
    const onChange = dung('all');
    const dau = screen.getByRole('tab', { name: /Tất cả/ });
    dau.focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('stock');

    // Vòng về cuối khi đang ở tab đầu — cụm ba mục thì đi ngược một nhịp nhanh hơn đi xuôi hai.
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('personal');
  });

  it('Home và End nhảy về hai đầu', async () => {
    const onChange = dung('stock');
    screen.getByRole('tab', { name: /Chứng khoán/ }).focus();

    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('personal');

    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('all');
  });

  it('bấm chuột vẫn báo đúng mảng vừa chọn', async () => {
    const onChange = dung('all');
    await userEvent.click(screen.getByRole('tab', { name: /Cá nhân/ }));
    expect(onChange).toHaveBeenCalledWith('personal');
  });

  /*
   * Số đếm nằm TRONG tên khả truy cập, không tách ra thành một nút riêng: người dùng trình đọc
   * màn hình cũng cần biết mảng kia còn bao nhiêu công thức trước khi bấm sang.
   */
  it('số đếm đọc được cùng nhãn', () => {
    dung();
    expect(screen.getByRole('tab', { name: 'Tất cả 111' })).not.toBeNull();
  });
});
