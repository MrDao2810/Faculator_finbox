// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  LEGACY_HOME_RECENT_SEARCHES_KEY,
  MAX_RECENT_SEARCHES,
  RECENT_SEARCHES_KEY,
  parseRecentSearches,
} from './recent-searches';
import { useRecentSearches } from './use-recent-searches';

/**
 * Hook một-kho dùng chung cho hai ô tìm.
 *
 * Phần thuần (lọc trùng, cắt bớt, chịu được dữ liệu hỏng) đã có ca riêng ở `recent-searches.test.ts`
 * — ở đây chỉ gác phần hook: đọc đúng lúc, ghi đúng khoá, hai khoá không đụng nhau, và phép gộp
 * một lần kho cũ của trang chủ.
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
 * Hook nhận khoá làm THAM SỐ thay vì viết cứng một khoá bên trong.
 *
 * Hai ô tìm hiện dùng chung một kho, nhưng hook không được giả định điều đó — từng có một đợt hai ô
 * phải dùng hai kho riêng, và cái giá của một khoá viết cứng là sửa hook mỗi lần quyết định ấy đổi.
 * Khoá thứ hai dưới đây là khoá giả chỉ để kiểm, không phải kho nào của sản phẩm.
 */
const KHO_KHAC = 'ffb.recent.kiem-thu.v1';

describe('useRecentSearches() — hai kho không đụng vào nhau', () => {
  it('ghi vào kho này thì kho kia vẫn nguyên và vẫn rỗng', () => {
    const khoChinh = renderHook(() => useRecentSearches(RECENT_SEARCHES_KEY));
    const khoKia = renderHook(() => useRecentSearches(KHO_KHAC));

    act(() => {
      khoChinh.result.current.remember('Beta');
    });

    expect(doc(RECENT_SEARCHES_KEY)).toEqual(['Beta']);
    expect(window.localStorage.getItem(KHO_KHAC)).toBeNull();
    expect(khoKia.result.current.terms).toEqual([]);
  });

  it('xoá kho này thì kho kia còn nguyên', () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['Beta']));
    window.localStorage.setItem(KHO_KHAC, JSON.stringify(['P/E']));

    const khoChinh = renderHook(() => useRecentSearches(RECENT_SEARCHES_KEY));

    act(() => {
      khoChinh.result.current.clear();
    });

    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
    expect(doc(KHO_KHAC)).toEqual(['P/E']);
  });

  it('đổi khoá thì đọc lại kho mới, không giữ danh sách cũ trên màn', () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['Beta']));
    window.localStorage.setItem(KHO_KHAC, JSON.stringify(['P/E']));

    const { result, rerender } = renderHook(({ key }) => useRecentSearches(key), {
      initialProps: { key: RECENT_SEARCHES_KEY },
    });
    expect(result.current.terms).toEqual(['Beta']);

    rerender({ key: KHO_KHAC });

    expect(result.current.terms).toEqual(['P/E']);
  });
});

/**
 * Gộp một lần kho cũ của ô tìm trang chủ (`absorbKey`) — trang chủ gộp vào màn Công thức ngày
 * 15/09/2026 nên kho riêng của nó hết người ghi, nhưng lịch sử đã có trong đó không được mất.
 */
describe('useRecentSearches() — gộp kho cũ', () => {
  const moKhoChung = () =>
    renderHook(() =>
      useRecentSearches(RECENT_SEARCHES_KEY, { absorbKey: LEGACY_HOME_RECENT_SEARCHES_KEY }),
    );

  it('kho chung đứng trước, kho cũ nối sau, bỏ trùng — rồi kho cũ bị xoá', () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['Beta', 'P/E']));
    window.localStorage.setItem(LEGACY_HOME_RECENT_SEARCHES_KEY, JSON.stringify(['p/e', 'ROI']));

    const { result } = moKhoChung();

    expect(result.current.terms).toEqual(['Beta', 'P/E', 'ROI']);
    expect(doc(RECENT_SEARCHES_KEY)).toEqual(['Beta', 'P/E', 'ROI']);
    expect(window.localStorage.getItem(LEGACY_HOME_RECENT_SEARCHES_KEY)).toBeNull();
  });

  it('gộp không được vượt trần số mục', () => {
    const nhieu = (tien: string) =>
      Array.from({ length: MAX_RECENT_SEARCHES }, (_, i) => `${tien} ${String(i)}`);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nhieu('Mới')));
    window.localStorage.setItem(LEGACY_HOME_RECENT_SEARCHES_KEY, JSON.stringify(nhieu('Cũ')));

    const { result } = moKhoChung();

    expect(result.current.terms).toHaveLength(MAX_RECENT_SEARCHES);
    expect(result.current.terms[0]).toBe('Mới 0');
  });

  /*
   * Gộp xong mà không xoá kho cũ thì lần mở sau gộp lại — và mục người dùng vừa xoá khỏi kho chung
   * sống lại từ kho cũ. Ca này gác đúng chuyện ấy.
   */
  it('mục đã xoá khỏi kho chung không sống lại ở lần mở sau', () => {
    window.localStorage.setItem(LEGACY_HOME_RECENT_SEARCHES_KEY, JSON.stringify(['ROI']));

    const lanDau = moKhoChung();
    act(() => {
      lanDau.result.current.clear();
    });
    lanDau.unmount();

    const lanSau = moKhoChung();
    expect(lanSau.result.current.terms).toEqual([]);
  });

  it('không có kho cũ thì chỉ đọc, không ghi gì', () => {
    const { result } = moKhoChung();

    expect(result.current.terms).toEqual([]);
    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
  });
});
