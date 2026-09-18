// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RESULT_OPENED_KEY, URL_WRITE_DELAY_MS, useListUrlState } from './use-list-url-state';
import { DEFAULT_LIST_PARAMS } from './url-state';

/**
 * Trạng thái lọc của màn Công thức — state là nguồn của màn, URL là bản ghi của state.
 *
 * Bốn điều được gác, mỗi điều một lỗi thật từng có hoặc suýt có: không rơi ký tự khi gõ nhanh
 * (đợt 13), không ghi URL lúc gắn (đè vị trí cuộn của nút quay lại), lần ghi đang đợi phải kịp xả
 * trước cú bấm mở công thức, và link chia sẻ / bấm lại mục nav phải thật sự đổi màn.
 */

/** Đặt URL giả cho jsdom. `window.location` không gán trực tiếp được nên đi qua history. */
function dungO(url: string): void {
  window.history.replaceState(null, '', url);
}

beforeEach(() => {
  vi.useFakeTimers();
  window.sessionStorage.clear();
  dungO('/cong-thuc/');
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useListUrlState() — lúc gắn', () => {
  it('bắt đầu bằng trạng thái mặc định, dù URL đang mang bộ lọc', () => {
    dungO('/cong-thuc/?category=risk');
    const { result } = renderHook(() => useListUrlState());

    // HTML tĩnh dựng bằng mặc định — lượt đầu phải khớp nó; URL vào sau qua `applySearch`.
    expect(result.current.params).toEqual(DEFAULT_LIST_PARAMS);
  });

  /*
   * Ghi URL lúc gắn là gọi `onUrlWritten` → `rememberOrigin()` lúc gắn, tức đè `scrollY` đang chờ
   * khôi phục của nút quay lại bằng vị trí đầu trang — cú cuộn về chỗ cũ không còn gì để tới.
   */
  it('KHÔNG ghi URL và KHÔNG báo onUrlWritten chỉ vì gắn', () => {
    const spy = vi.spyOn(window.history, 'replaceState');
    const onUrlWritten = vi.fn();
    renderHook(() => useListUrlState({ onUrlWritten }));

    act(() => {
      vi.advanceTimersByTime(URL_WRITE_DELAY_MS * 3);
    });

    expect(spy).not.toHaveBeenCalled();
    expect(onUrlWritten).not.toHaveBeenCalled();
  });
});

describe('useListUrlState() — ghi URL', () => {
  it('bộ lọc ghi NGAY, kèm onUrlWritten sau khi URL đã đổi', () => {
    const daThay: string[] = [];
    const { result } = renderHook(() =>
      useListUrlState({
        onUrlWritten: () => {
          daThay.push(window.location.search);
        },
      }),
    );

    act(() => {
      result.current.setFilters({ categoryId: 'risk' });
    });

    expect(window.location.search).toBe('?category=risk');
    expect(daThay).toEqual(['?category=risk']);
  });

  it('chuỗi tìm đổi màn NGAY nhưng ghi URL sau một nhịp ngừng gõ', () => {
    const { result } = renderHook(() => useListUrlState());

    act(() => {
      result.current.setQuery('r');
    });
    act(() => {
      result.current.setQuery('ro');
    });
    act(() => {
      result.current.setQuery('roi');
    });

    expect(result.current.params.q).toBe('roi');
    expect(window.location.search).toBe('');

    act(() => {
      vi.advanceTimersByTime(URL_WRITE_DELAY_MS);
    });

    expect(window.location.search).toBe('?q=roi');
  });

  it('bấm chuột ở bất cứ đâu thì lần ghi đang đợi được xả ngay', () => {
    const { result } = renderHook(() => useListUrlState());

    act(() => {
      result.current.setQuery('wacc');
    });
    act(() => {
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });

    expect(window.location.search).toBe('?q=wacc');
  });

  it('không ghi lúc tháo — URL lúc ấy đã là của trang kế tiếp', () => {
    const { result, unmount } = renderHook(() => useListUrlState());

    act(() => {
      result.current.setQuery('wacc');
    });
    unmount();
    dungO('/cong-thuc/pe/');

    act(() => {
      vi.advanceTimersByTime(URL_WRITE_DELAY_MS * 3);
    });

    expect(window.location.pathname).toBe('/cong-thuc/pe/');
    expect(window.location.search).toBe('');
  });

  it('Safari chặn replaceState thì màn vẫn đúng, không ném lỗi', () => {
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {
      throw new DOMException('quá 100 lần', 'SecurityError');
    });
    const { result } = renderHook(() => useListUrlState());

    expect(() => {
      act(() => {
        result.current.setFilters({ sort: 'az' });
      });
    }).not.toThrow();
    expect(result.current.params.sort).toBe('az');
  });

  it('reset() về mặc định và gỡ sạch truy vấn khỏi URL', () => {
    const { result } = renderHook(() => useListUrlState());

    act(() => {
      result.current.setFilters({ categoryId: 'risk', sort: 'za' });
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.params).toEqual(DEFAULT_LIST_PARAMS);
    expect(window.location.search).toBe('');
  });
});

describe('useListUrlState() — nhận thay đổi từ URL', () => {
  it('link chia sẻ có bộ lọc thì màn áp đúng bộ lọc ấy', () => {
    dungO('/cong-thuc/?q=p%2Fe&category=fundamentals');
    const { result } = renderHook(() => useListUrlState());

    act(() => {
      result.current.applySearch('q=p%2Fe&category=fundamentals');
    });

    expect(result.current.params).toMatchObject({ q: 'p/e', categoryId: 'fundamentals' });
  });

  /*
   * Link dán tay viết `/` và `%20` thô, còn `useSearchParams().toString()` trả `%2F` và `+`. So chuỗi
   * thô là coi link ấy như tiếng dội và không lọc gì.
   */
  it('cùng một truy vấn viết hai kiểu mã hoá vẫn nhận ra là thay đổi thật', () => {
    dungO('/cong-thuc/?q=gia%20hoa%20von');
    const { result } = renderHook(() => useListUrlState());

    act(() => {
      result.current.applySearch('q=gia+hoa+von');
    });

    expect(result.current.params.q).toBe('gia hoa von');
  });

  it('bấm lại mục "Công thức" khi đang lọc thì màn về mặc định', () => {
    const { result } = renderHook(() => useListUrlState());

    act(() => {
      result.current.setFilters({ categoryId: 'risk' });
    });
    // Next đẩy '/cong-thuc/' lên lịch sử rồi `useSearchParams` báo chuỗi rỗng.
    dungO('/cong-thuc/');
    act(() => {
      result.current.applySearch('');
    });

    expect(result.current.params).toEqual(DEFAULT_LIST_PARAMS);
  });

  it('link cũ mang ?segment= không thành bộ lọc vô hình', () => {
    dungO('/cong-thuc/?segment=personal');
    const { result } = renderHook(() => useListUrlState());

    act(() => {
      result.current.applySearch('segment=personal');
    });

    expect(result.current.params.segment).toBe('all');
  });

  /*
   * Ca của lỗi rơi ký tự. Router cập nhật trong `startTransition`, nên tiếng dội của lần ghi `q=ro`
   * có thể tới SAU khi màn đã ghi `q=roi`. Áp nó là kéo ô tìm lùi về "ro" giữa lúc người dùng gõ.
   */
  it('tiếng dội TRỄ của một lần ghi cũ không kéo ô tìm lùi lại', () => {
    const { result } = renderHook(() => useListUrlState());

    act(() => {
      result.current.setQuery('ro');
    });
    act(() => {
      vi.advanceTimersByTime(URL_WRITE_DELAY_MS);
    });
    act(() => {
      result.current.setQuery('roi');
    });
    act(() => {
      vi.advanceTimersByTime(URL_WRITE_DELAY_MS);
    });
    expect(window.location.search).toBe('?q=roi');

    act(() => {
      result.current.applySearch('q=ro');
    });

    expect(result.current.params.q).toBe('roi');
  });

  it('tiếng dội đúng lần ghi vừa rồi thì bỏ qua, không dựng lại gì', () => {
    const { result } = renderHook(() => useListUrlState());

    act(() => {
      result.current.setFilters({ categoryId: 'risk' });
    });
    const truoc = result.current.params;
    act(() => {
      result.current.applySearch('category=risk');
    });

    expect(result.current.params).toBe(truoc);
  });

  it('URL đổi từ bên ngoài thì huỷ lần ghi chuỗi tìm đang đợi', () => {
    const { result } = renderHook(() => useListUrlState());

    act(() => {
      result.current.setQuery('wacc');
    });
    dungO('/cong-thuc/?category=loans');
    act(() => {
      result.current.applySearch('category=loans');
    });
    act(() => {
      vi.advanceTimersByTime(URL_WRITE_DELAY_MS * 3);
    });

    expect(result.current.params).toMatchObject({ q: '', categoryId: 'loans' });
    expect(window.location.search).toBe('?category=loans');
  });
});

/*
 * Chủ dự án yêu cầu 18/09/2026: tìm, bấm một kết quả xem chi tiết, quay lại thì ô tìm phải TRỐNG.
 * Lối về nào (nút ‹, "Huỷ", nút Lùi) cũng gắn lại màn ở đúng URL có `?q=`, nên các ca dưới dựng lại
 * đúng cảnh ấy: đánh dấu, tháo màn, gắn lại ở URL cũ rồi cho `ListUrlSync` đọc URL lần đầu.
 *
 * `vi.useFakeTimers()` của vitest KHÔNG giả `queueMicrotask`, nên lần ghi URL chạy thật ở lần `await`
 * đầu tiên.
 */
describe('useListUrlState() — quay về từ một kết quả tìm', () => {
  /** Người dùng đứng ở `url`, mở một kết quả tìm, rồi `<Link>` đưa họ sang trang chi tiết. */
  function moKetQuaRoiRoiMan(url: string): void {
    dungO(url);
    const { result, unmount } = renderHook(() => useListUrlState());
    act(() => {
      result.current.markResultOpened();
    });
    unmount();
  }

  /** Cho microtask ghi URL chạy. */
  async function choGhiUrl(): Promise<void> {
    await act(async () => {
      await Promise.resolve();
    });
  }

  it('về đúng URL lúc mở kết quả thì bỏ chuỗi tìm, giữ nhóm, rồi ghi lại URL không còn q', async () => {
    moKetQuaRoiRoiMan('/cong-thuc/?q=roe&category=risk');

    const onQueryDropped = vi.fn();
    const onUrlWritten = vi.fn();
    const { result } = renderHook(() => useListUrlState({ onQueryDropped, onUrlWritten }));
    act(() => {
      result.current.applySearch('q=roe&category=risk');
    });

    expect(result.current.params).toMatchObject({ q: '', categoryId: 'risk' });
    expect(onQueryDropped).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(RESULT_OPENED_KEY)).toBeNull();
    // Chưa ghi NGAY trong lượt đọc: ở `next dev` lúc ấy bản vá `replaceState` của Next chưa cài.
    expect(window.location.search).toBe('?q=roe&category=risk');

    await choGhiUrl();

    expect(window.location.search).toBe('?category=risk');
    expect(onUrlWritten).toHaveBeenCalledTimes(1);
  });

  it('không có dấu, tức link chia sẻ `?q=`, thì vẫn lọc như thường và không ghi gì', async () => {
    dungO('/cong-thuc/?q=roe');
    const replaceState = vi.spyOn(window.history, 'replaceState');
    const onQueryDropped = vi.fn();
    const { result } = renderHook(() => useListUrlState({ onQueryDropped }));

    act(() => {
      result.current.applySearch('q=roe');
    });
    await choGhiUrl();

    expect(result.current.params.q).toBe('roe');
    expect(onQueryDropped).not.toHaveBeenCalled();
    expect(replaceState).not.toHaveBeenCalled();
  });

  it('dấu của một chuỗi tìm KHÁC thì giữ chuỗi của URL đang mở, và dấu vẫn bị xoá', () => {
    moKetQuaRoiRoiMan('/cong-thuc/?q=roe');

    dungO('/cong-thuc/?q=pe');
    const { result } = renderHook(() => useListUrlState());
    act(() => {
      result.current.applySearch('q=pe');
    });

    expect(result.current.params.q).toBe('pe');
    expect(window.sessionStorage.getItem(RESULT_OPENED_KEY)).toBeNull();
  });

  it('dấu chỉ sống tới lượt về ĐẦU TIÊN: về trang trơn, gõ lại đúng chữ cũ rồi tải lại vẫn giữ chữ', () => {
    moKetQuaRoiRoiMan('/cong-thuc/?q=roe');

    // Về bằng mục "Công thức" ở thanh điều hướng: URL trơn, dấu bị lấy đi mà không có gì để bỏ.
    dungO('/cong-thuc/');
    const lanVe = renderHook(() => useListUrlState());
    act(() => {
      lanVe.result.current.applySearch('');
    });
    lanVe.unmount();

    dungO('/cong-thuc/?q=roe');
    const taiLai = renderHook(() => useListUrlState());
    act(() => {
      taiLai.result.current.applySearch('q=roe');
    });

    expect(taiLai.result.current.params.q).toBe('roe');
  });

  it('màn tháo trước khi kịp ghi thì không ghi lên URL của trang kế tiếp', async () => {
    moKetQuaRoiRoiMan('/cong-thuc/?q=roe');

    const { result, unmount } = renderHook(() => useListUrlState());
    act(() => {
      result.current.applySearch('q=roe');
    });
    unmount();
    dungO('/cong-thuc/pe/');
    const replaceState = vi.spyOn(window.history, 'replaceState');

    await choGhiUrl();

    expect(replaceState).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/cong-thuc/pe/');
  });
});
