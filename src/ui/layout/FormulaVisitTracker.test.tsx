// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FORMULA_VISIT_KEY } from '@/application';

import { FormulaVisitTracker } from './FormulaVisitTracker';

/** Cùng khuôn `OriginTracker.test.tsx`: `usePathname()` là thứ duy nhất component đọc về route. */
const pathname = vi.hoisted(() => ({ value: '/cong-thuc/' }));
vi.mock('next/navigation', () => ({
  usePathname: () => pathname.value,
}));

/** Dấu đang nằm trong kho phiên, hoặc `null`. */
function dau(): string | null {
  return window.sessionStorage.getItem(FORMULA_VISIT_KEY);
}

afterEach(cleanup);
beforeEach(() => {
  window.sessionStorage.clear();
  pathname.value = '/cong-thuc/';
});

describe('FormulaVisitTracker — sang màn khác là hết lượt xem', () => {
  /*
   * Đúng lỗi chủ dự án báo: rời công thức về danh sách hay màn tìm kiếm rồi mở lại mà vẫn thấy mã
   * cũ. Dấu phải mất ngay ở màn giữa, không thì lần gắn sau của màn chi tiết tưởng mình đang tiếp tục.
   */
  it('xoá dấu ở danh sách, tìm kiếm, Danh mục và Cài đặt', () => {
    for (const path of ['/cong-thuc/', '/tim-kiem/', '/danh-muc/', '/cai-dat/']) {
      window.sessionStorage.setItem(FORMULA_VISIT_KEY, 'pe');
      pathname.value = path;
      render(<FormulaVisitTracker />);

      expect(dau(), path).toBeNull();
      cleanup();
    }
  });

  it('xoá dấu khi đang đứng ở bài hướng dẫn của công thức KHÁC', () => {
    window.sessionStorage.setItem(FORMULA_VISIT_KEY, 'pe');
    pathname.value = '/huong-dan/cong-thuc/pb/';
    render(<FormulaVisitTracker />);

    expect(dau()).toBeNull();
  });

  /* Vế phải GIỮ: lỗi cũ "Mở bảng dữ liệu → quay lại là mất số" không được hỏng lại. */
  it('giữ dấu ở chính công thức, bảng dữ liệu và bài hướng dẫn của nó', () => {
    for (const path of ['/cong-thuc/pe/', '/du-lieu/', '/huong-dan/cong-thuc/pe/']) {
      window.sessionStorage.setItem(FORMULA_VISIT_KEY, 'pe');
      pathname.value = path;
      render(<FormulaVisitTracker />);

      expect(dau(), path).toBe('pe');
      cleanup();
    }
  });

  it('đổi đường dẫn giữa chừng thì effect chạy lại', () => {
    window.sessionStorage.setItem(FORMULA_VISIT_KEY, 'pe');
    pathname.value = '/cong-thuc/pe/';
    const { rerender } = render(<FormulaVisitTracker />);
    expect(dau()).toBe('pe');

    pathname.value = '/du-lieu/';
    rerender(<FormulaVisitTracker />);
    expect(dau()).toBe('pe');

    pathname.value = '/danh-muc/';
    rerender(<FormulaVisitTracker />);
    expect(dau()).toBeNull();
  });

  it('dấu rác trong kho thì để yên, không ném lỗi', () => {
    window.sessionStorage.setItem(FORMULA_VISIT_KEY, '../danh-muc');
    pathname.value = '/danh-muc/';

    expect(() => render(<FormulaVisitTracker />)).not.toThrow();
  });

  it('chưa có dấu thì không ghi gì cả', () => {
    pathname.value = '/cong-thuc/pe/';
    render(<FormulaVisitTracker />);

    expect(dau()).toBeNull();
  });
});
