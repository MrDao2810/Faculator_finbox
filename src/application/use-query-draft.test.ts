// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useQueryDraft } from './use-query-draft';

/**
 * Bộ đếm giờ giả cho toàn bộ tệp: mọi ca ở đây đều nói về việc "hoãn ghi bao lâu", chạy giờ
 * thật thì test vừa chậm vừa hay lung lay.
 */
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

const DELAY = 250;

describe('useQueryDraft — bản nháp cho ô nhập được URL điều khiển', () => {
  it('hiện ngay ký tự vừa gõ, chưa ghi URL', () => {
    const commit = vi.fn();
    const { result } = renderHook(() => useQueryDraft('', commit, DELAY));

    act(() => {
      result.current.setDraft('r');
    });

    expect(result.current.draft).toBe('r');
    expect(commit).not.toHaveBeenCalled();
  });

  it('gõ nhanh nhiều ký tự chỉ ghi URL MỘT lần, bằng chuỗi cuối cùng', () => {
    const commit = vi.fn();
    const { result } = renderHook(() => useQueryDraft('', commit, DELAY));

    // Đây chính là kịch bản làm rơi ký tự khi ghi thẳng: ba phím trong cùng một nhịp.
    act(() => {
      result.current.setDraft('r');
      result.current.setDraft('ro');
      result.current.setDraft('roi');
    });

    expect(result.current.draft).toBe('roi');

    act(() => {
      vi.advanceTimersByTime(DELAY);
    });

    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith('roi');
  });

  it('không ghi URL trước khi hết thời gian hoãn', () => {
    const commit = vi.fn();
    const { result } = renderHook(() => useQueryDraft('', commit, DELAY));

    act(() => {
      result.current.setDraft('roi');
    });
    act(() => {
      vi.advanceTimersByTime(DELAY - 1);
    });

    expect(commit).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(commit).toHaveBeenCalledWith('roi');
  });

  it('URL đổi vì chính mình vừa ghi thì KHÔNG dội ngược lên bản nháp', () => {
    const commit = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useQueryDraft(value, commit, DELAY), {
      initialProps: { value: '' },
    });

    act(() => {
      result.current.setDraft('ro');
    });
    act(() => {
      vi.advanceTimersByTime(DELAY);
    });

    // Người dùng gõ tiếp TRONG LÚC URL còn đang cập nhật — đây là chỗ ký tự hay rơi nhất.
    act(() => {
      result.current.setDraft('roi');
    });

    // ...rồi URL mới về, mang giá trị CŨ 'ro'.
    rerender({ value: 'ro' });

    expect(result.current.draft).toBe('roi');
  });

  it('URL đổi từ bên ngoài (nút Lùi) thì nhận giá trị mới và huỷ lần ghi đang treo', () => {
    const commit = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useQueryDraft(value, commit, DELAY), {
      initialProps: { value: '' },
    });

    act(() => {
      result.current.setDraft('roi');
    });

    rerender({ value: 'pe' });

    expect(result.current.draft).toBe('pe');

    act(() => {
      vi.advanceTimersByTime(DELAY * 2);
    });

    // Lần ghi đang treo phải chết hẳn, nếu không nó dựng lại 'roi' sau khi đã bấm Lùi.
    expect(commit).not.toHaveBeenCalled();
  });

  it('commitDraft ghi ngay và huỷ lần ghi đang treo', () => {
    const commit = vi.fn();
    const { result } = renderHook(() => useQueryDraft('', commit, DELAY));

    act(() => {
      result.current.setDraft('ro');
      result.current.commitDraft('pe');
    });

    expect(result.current.draft).toBe('pe');
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith('pe');

    act(() => {
      vi.advanceTimersByTime(DELAY * 2);
    });

    // Chip "tìm gần đây" đè lên thứ đang gõ dở — thứ đang gõ dở không được sống lại.
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it('resetDraft xoá bản nháp và huỷ lần ghi đang treo, không tự ghi URL', () => {
    const commit = vi.fn();
    const { result } = renderHook(() => useQueryDraft('', commit, DELAY));

    act(() => {
      result.current.setDraft('roi');
      result.current.resetDraft();
    });

    expect(result.current.draft).toBe('');
    // Nơi gọi tự dọn URL bằng `reset()`, hook không được ghi thêm lần nữa.
    expect(commit).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(DELAY * 2);
    });

    expect(commit).not.toHaveBeenCalled();
  });

  it('khởi tạo bản nháp bằng giá trị sẵn có trên URL (mở link có ?q=)', () => {
    const commit = vi.fn();
    const { result } = renderHook(() => useQueryDraft('lãi kép', commit, DELAY));

    expect(result.current.draft).toBe('lãi kép');
    expect(commit).not.toHaveBeenCalled();
  });

  it('rời màn thì huỷ lần ghi đang treo, không ghi URL của trang vừa rời', () => {
    const commit = vi.fn();
    const { result, unmount } = renderHook(() => useQueryDraft('', commit, DELAY));

    act(() => {
      result.current.setDraft('roi');
    });
    unmount();

    act(() => {
      vi.advanceTimersByTime(DELAY * 2);
    });

    expect(commit).not.toHaveBeenCalled();
  });

  it('luôn gọi bản `commit` mới nhất, không phải bản lúc bắt đầu bấm giờ', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ commit }) => useQueryDraft('', commit, DELAY), {
      initialProps: { commit: first },
    });

    act(() => {
      result.current.setDraft('roi');
    });

    // `setParams` đổi định danh mỗi khi URL đổi vì nó đóng gói `params` hiện tại. Gọi bản cũ
    // là ghi đè lên bộ lọc mà người dùng vừa bấm trong lúc đang gõ.
    rerender({ commit: second });

    act(() => {
      vi.advanceTimersByTime(DELAY);
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('roi');
  });

  it('xoá sạch ô nhập vẫn ghi URL, không bỏ qua chuỗi rỗng', () => {
    const commit = vi.fn();
    const { result } = renderHook(() => useQueryDraft('roi', commit, DELAY));

    act(() => {
      result.current.setDraft('');
    });
    act(() => {
      vi.advanceTimersByTime(DELAY);
    });

    expect(result.current.draft).toBe('');
    expect(commit).toHaveBeenCalledWith('');
  });
});
