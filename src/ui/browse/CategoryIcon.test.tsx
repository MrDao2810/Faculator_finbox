// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CATEGORIES, categoriesOf } from '@/application';

import { CategoryIcon, drawnCategoryIds, toneClass } from './CategoryIcon';

afterEach(cleanup);

/**
 * Bản đồ 12 nhóm → HÌNH icon.
 *
 * Kể từ đợt đổi màu Finbox, mọi nhóm dùng chung một tông xanh, nên hình icon và tên nhóm là
 * TOÀN BỘ những gì phân biệt 12 nhóm với nhau. Điều đó làm các ca dưới đây nặng ký hơn hẳn so
 * với lúc còn bảy tông: trước kia một hình trùng vẫn còn màu đỡ, nay thì không.
 *
 * Ba lời hứa được gác ở đây, cả ba đều hỏng lặng lẽ nếu không có test: nhóm mới thêm vào
 * Registry mà quên vẽ icon thì rơi về khối hộp dự phòng và trông y hệt mọi nhóm chưa vẽ khác;
 * nhóm bị đổi tên id thì mục cũ nằm lại vĩnh viễn không ai gọi tới; và hai nhóm trùng hình thì
 * không còn dấu hiệu nào tách chúng ra ngoài dòng chữ.
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
 * Ràng buộc THAY CHỖ ca "không trùng tông" của bản bảy tông.
 *
 * Lúc còn bảy tông, điều phải gác là hai nhóm cùng một lưới không được trùng MÀU. Nay đơn sắc,
 * câu hỏi ấy vô nghĩa — nhưng câu hỏi thật thì nặng hơn: hai nhóm không được trùng HÌNH, vì
 * hình là dấu hiệu thị giác duy nhất còn lại. So bằng chính chuỗi `d` mà component vẽ ra, không
 * bằng bản đồ nội bộ, nên nó bắt cả trường hợp hai mục khai khác nhau mà vẽ ra cùng một nét.
 */
describe('không hai nhóm nào trùng hình', () => {
  function netCua(id: string): string {
    const { container } = render(<CategoryIcon id={id} />);
    return [...container.querySelectorAll('path')].map((p) => p.getAttribute('d')).join('|');
  }

  for (const segment of ['stock', 'personal'] as const) {
    it(`mảng ${segment}`, () => {
      const nets = categoriesOf(segment).map((category) => netCua(category.id));

      expect(new Set(nets).size, `${segment}: có hai nhóm vẽ ra cùng một nét`).toBe(nets.length);
    });
  }

  it('cả 12 nhóm, không riêng trong từng mảng', () => {
    const nets = CATEGORIES.map((category) => netCua(category.id));

    expect(new Set(nets).size).toBe(nets.length);
  });
});

describe('nhóm lạ vẫn hiện ra được', () => {
  /*
   * Đơn sắc nghĩa là lớp tông KHÔNG còn phụ thuộc nhóm — nó không nhận tham số nữa. Ca này chốt
   * hai điều còn lại đáng gác: nó vẫn trả một lớp thật (chuỗi rỗng là CSS Module đổi tên lớp mà
   * không ai biết), và nó vẫn là MỘT lớp cho mọi nơi gọi.
   */
  it('lớp tông vẫn là một lớp thật, dùng chung cho mọi nhóm', () => {
    expect(toneClass()).not.toBe('');
    expect(toneClass()).toBe(toneClass());
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
