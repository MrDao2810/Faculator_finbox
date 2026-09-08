// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  HOME_RECENT_SEARCHES_KEY,
  MAX_RECENT_SEARCHES,
  RECENT_SEARCHES_KEY,
  parseRecentSearches,
} from './recent-searches';
import { useRecentSearches } from './use-recent-searches';

/**
 * Hook một-kho dùng chung cho hai ô tìm.
 *
 * Phần thuần (lọc trùng, cắt bớt, chịu được dữ liệu hỏng) đã có 25 ca ở `recent-searches.test.ts`
 * — ở đây chỉ gác phần hook: đọc đúng lúc, ghi đúng khoá, và **hai khoá không đụng nhau**, vốn là
 * cả lý do hook nhận khoá làm tham số.
 */

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

const doc = (key: string): ReadonlyArray<string> =>
  parseRecentSearches(window.localStorage.getItem(key));

describe('useRecentSearches() — đọc kho', () => {
  /*
   * Bản build là HTML tĩnh: lượt render đầu ở máy khách phải giống hệt lúc build, nên kho chỉ
   * được đọc trong effect. Ca này gác đúng thứ tự đó — dữ liệu có sẵn vẫn phải vào sau.
   */
  it('lượt render đầu luôn rỗng, dù kho đã có sẵn dữ liệu', () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['P/E']));

    let luotDau: ReadonlyArray<string> | undefined;
    renderHook(() => {
      const kq = useRecentSearches(RECENT_SEARCHES_KEY);
      luotDau ??= kq.terms;
      return kq;
    });

    expect(luotDau).toEqual([]);
  });

  it('sau khi mount thì có đúng nội dung kho', () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['P/E', 'WACC']));

    const { result } = renderHook(() => useRecentSearches(RECENT_SEARCHES_KEY));

    expect(result.current.terms).toEqual(['P/E', 'WACC']);
  });

  it('kho hỏng thì coi như chưa tìm gì, không ném lỗi', () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '{ không phải JSON');

    const { result } = renderHook(() => useRecentSearches(RECENT_SEARCHES_KEY));

    expect(result.current.terms).toEqual([]);
  });
});

describe('useRecentSearches() — ghi và xoá đúng khoá được truyền', () => {
  it('remember() ghi lên đầu, cả trên màn lẫn trong kho', () => {
    const { result } = renderHook(() => useRecentSearches(RECENT_SEARCHES_KEY));

    act(() => {
      result.current.remember('P/E');
    });
    act(() => {
      result.current.remember('WACC');
    });

    expect(result.current.terms).toEqual(['WACC', 'P/E']);
    expect(doc(RECENT_SEARCHES_KEY)).toEqual(['WACC', 'P/E']);
  });

  /*
   * Hai lần bấm sát nhau trong cùng một lượt render: đọc `terms` từ closure thì lần sau thấy
   * danh sách cũ và đè mất lần trước. Đây là lý do `remember` dùng dạng cập nhật hàm.
   */
  it('hai lần ghi liền trong một lượt thì không lần nào bị đè mất', () => {
    const { result } = renderHook(() => useRecentSearches(RECENT_SEARCHES_KEY));

    act(() => {
      result.current.remember('P/E');
      result.current.remember('WACC');
    });

    expect(result.current.terms).toEqual(['WACC', 'P/E']);
    expect(doc(RECENT_SEARCHES_KEY)).toEqual(['WACC', 'P/E']);
  });

  it('không bao giờ ghi quá số mục tối đa', () => {
    const { result } = renderHook(() => useRecentSearches(RECENT_SEARCHES_KEY));

    act(() => {
      for (let i = 0; i < MAX_RECENT_SEARCHES + 3; i += 1) {
        result.current.remember(`Công thức ${String(i)}`);
      }
    });

    expect(result.current.terms.length).toBe(MAX_RECENT_SEARCHES);
    expect(doc(RECENT_SEARCHES_KEY).length).toBe(MAX_RECENT_SEARCHES);
  });

  it('clear() dọn cả màn lẫn kho', () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['P/E']));
    const { result } = renderHook(() => useRecentSearches(RECENT_SEARCHES_KEY));

    act(() => {
      result.current.clear();
    });

    expect(result.current.terms).toEqual([]);
    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
  });
});

/**
 * Cả lý do hook nhận khoá làm THAM SỐ thay vì viết cứng một khoá bên trong.
 *
 * Trước đợt này hai ô tìm dùng chung `ffb.recent.v1`, nên chip sinh ra ở màn tìm lại hiện ở trang
 * chủ — nó nói với người dùng rằng họ đã tìm thứ đó ở đây, trong khi không phải.
 */
describe('useRecentSearches() — hai kho không đụng vào nhau', () => {
  it('ghi vào kho này thì kho kia vẫn nguyên và vẫn rỗng', () => {
    const nhaTim = renderHook(() => useRecentSearches(RECENT_SEARCHES_KEY));
    const nhaChu = renderHook(() => useRecentSearches(HOME_RECENT_SEARCHES_KEY));

    act(() => {
      nhaTim.result.current.remember('Beta');
    });

    expect(doc(RECENT_SEARCHES_KEY)).toEqual(['Beta']);
    expect(window.localStorage.getItem(HOME_RECENT_SEARCHES_KEY)).toBeNull();
    expect(nhaChu.result.current.terms).toEqual([]);
  });

  it('xoá kho này thì kho kia còn nguyên', () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['Beta']));
    window.localStorage.setItem(HOME_RECENT_SEARCHES_KEY, JSON.stringify(['P/E']));

    const nhaTim = renderHook(() => useRecentSearches(RECENT_SEARCHES_KEY));

    act(() => {
      nhaTim.result.current.clear();
    });

    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
    expect(doc(HOME_RECENT_SEARCHES_KEY)).toEqual(['P/E']);
  });

  it('đổi khoá thì đọc lại kho mới, không giữ danh sách cũ trên màn', () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['Beta']));
    window.localStorage.setItem(HOME_RECENT_SEARCHES_KEY, JSON.stringify(['P/E']));

    const { result, rerender } = renderHook(({ key }) => useRecentSearches(key), {
      initialProps: { key: RECENT_SEARCHES_KEY },
    });
    expect(result.current.terms).toEqual(['Beta']);

    rerender({ key: HOME_RECENT_SEARCHES_KEY });

    expect(result.current.terms).toEqual(['P/E']);
  });
});
