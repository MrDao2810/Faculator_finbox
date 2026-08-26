// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CATEGORIES, categoriesOf } from '@/application';

import { CategoryIcon, drawnCategoryIds, toneClass, toneOf } from './CategoryIcon';

afterEach(cleanup);

/**
 * Bản đồ 12 nhóm → icon + tông màu.
 *
 * Ba lời hứa được gác ở đây, và cả ba đều hỏng lặng lẽ nếu không có test: nhóm mới thêm vào
 * Registry mà quên vẽ icon thì rơi về khối hộp trung tính và trông y hệt một nhóm khác cũng
 * chưa vẽ; nhóm bị đổi tên id thì mục cũ nằm lại vĩnh viễn không ai gọi tới; và hai nhóm cùng
 * một lưới trùng tông thì màu hết còn phân biệt được gì.
 */

describe('mọi nhóm trong Registry đều có hình riêng', () => {
  for (const category of CATEGORIES) {
    it(`${category.id} không rơi về hình dự phòng`, () => {
      expect(
        drawnCategoryIds(),
        `vẽ thêm một mục cho '${category.id}' trong VISUALS của CategoryIcon.tsx`,
      ).toContain(category.id);
    });
  }

  it('bản đồ không giữ id đã biến mất khỏi Registry', () => {
    const known = new Set(CATEGORIES.map((category) => category.id));
    const orphans = drawnCategoryIds().filter((id) => !known.has(id));

    expect(orphans, 'xoá mục thừa — nhóm này không còn trong Registry').toEqual([]);
  });
});

/*
 * Bảy tông đủ cho 12 nhóm CHỈ KHI hai lưới của trang chủ không có ô nào trùng màu trong cùng
 * một lưới. Đây là điều kiện đó, viết thành ràng buộc thật — thêm nhóm thứ 13 vào một mảng đã
 * dùng đủ bảy tông là ca này đỏ, và câu trả lời lúc ấy là thêm tông chứ không phải dùng lại.
 */
describe('trong cùng một mảng, không hai nhóm nào trùng tông', () => {
  for (const segment of ['stock', 'personal'] as const) {
    it(`mảng ${segment}`, () => {
      const tones = categoriesOf(segment).map((category) => toneOf(category.id));

      expect(new Set(tones).size, `tông đang dùng: ${tones.join(', ')}`).toBe(tones.length);
    });
  }
});

describe('nhóm lạ vẫn hiện ra được', () => {
  it('id chưa khai thì rơi về tông trung tính, không ném lỗi', () => {
    expect(toneOf('nhom-chua-co')).toBe('neutral');
    expect(toneOf(undefined)).toBe('neutral');
  });

  it('vẫn trả về một lớp tông thật, không phải chuỗi rỗng', () => {
    expect(toneClass('nhom-chua-co')).not.toBe('');
    expect(toneClass('valuation')).not.toBe(toneClass('risk'));
  });

  it('vẫn vẽ ra SVG', () => {
    const { container } = render(<CategoryIcon id="nhom-chua-co" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});

describe('icon là phần nhìn, không phải phần đọc', () => {
  /*
   * Icon lọt vào cây trợ năng là hỏng hai chỗ cùng lúc: trình đọc màn hình đọc thừa, và
   * `textContent` của thẻ chứa nó đổi — mà `SettingsScreen.test.tsx` cùng `CategoryGrid.test.tsx`
   * đang ghim đúng `textContent`.
   */
  it('luôn aria-hidden và không có chữ nào bên trong', () => {
    const { container } = render(<CategoryIcon id="valuation" />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(container.textContent).toBe('');
  });

  it('không đặt màu vào thuộc tính SVG — màu đi qua currentColor', () => {
    const { container } = render(<CategoryIcon id="risk" />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('stroke')).toBe('currentColor');
    expect(svg?.getAttribute('fill')).toBe('none');
  });

  it('kích thước đổi được, mặc định 18px', () => {
    const { container } = render(<CategoryIcon id="loans" size={28} />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('28');

    cleanup();
    const mac_dinh = render(<CategoryIcon id="loans" />);
    expect(mac_dinh.container.querySelector('svg')?.getAttribute('width')).toBe('18');
  });
});
