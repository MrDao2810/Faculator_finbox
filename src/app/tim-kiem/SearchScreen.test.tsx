// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FORMULA_SUMMARIES, RECENT_SEARCHES_KEY } from '@/application';
import type { FormulaSummary } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { SearchScreen } from './SearchScreen';

/**
 * Lỗi được báo: gõ "Giá" ra kết quả rồi KHÔNG bấm gì, "Tìm gần đây" vẫn ghi lại đúng chữ "Giá"
 * đã gõ. Đáng lẽ chỉ được ghi khi bấm vào một kết quả, và phải ghi TÊN công thức đã chọn chứ
 * không phải chuỗi đã gõ — xem docblock mới của `onSelectResult` trong `SearchScreen.tsx`.
 *
 * `useListParams()` (màn này gọi trực tiếp) cần cả ba hook điều hướng của App Router; thiếu
 * bản giả này ném lỗi "invariant expected app router to be mounted", cùng lý do
 * `PortfolioScreen.test.tsx` đã ghi cho `useRouter()`. `usePathname`/`useSearchParams` không tự
 * ném lỗi nhưng phải có mặt vì `useListParams()` gọi cả ba.
 */
const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/tim-kiem/',
  useSearchParams: () => new URLSearchParams(''),
}));

/**
 * Công thức dùng xuyên suốt file: tên tiếng Việt có "P/E", dễ gõ và chắc chắn khớp.
 *
 * Gán lại qua một biến có kiểu tường minh (không phải `FormulaSummary | undefined`) để các
 * closure của `it(...)` bên dưới không bị TypeScript coi là "có thể undefined".
 */
const foundPe = FORMULA_SUMMARIES.find((f) => f.id === 'pe');
if (foundPe === undefined) {
  throw new Error('Cần công thức "pe" có mặt trong Registry cho ca kiểm này — kiểm tra lại.');
}
const PE: FormulaSummary = foundPe;

function moMan() {
  return render(
    <PreferencesProvider>
      <SearchScreen />
    </PreferencesProvider>,
  );
}

/** Ô nhập của WF-09 — cùng nhãn `t('search.label')` với ô tìm ở màn Công thức. */
const oTim = (): HTMLElement => screen.getByLabelText('Tìm công thức');

/**
 * Dòng kết quả dẫn tới một công thức trong cây vừa dựng.
 *
 * Chấp nhận cả hai dạng có / không gạch chéo cuối: `next/link` dưới jsdom cắt gạch chéo cuối dù
 * bản build thật giữ lại (`trailingSlash: true`).
 */
function dongKetQua(id: string): HTMLElement {
  const link = screen.getAllByRole('link').find((a) => {
    const href = a.getAttribute('href') ?? '';
    return href === `/cong-thuc/${id}` || href === `/cong-thuc/${id}/`;
  });
  if (link === undefined) {
    throw new Error(`Không thấy dòng kết quả cho "${id}" — ca kiểm cần xem lại.`);
  }
  return link;
}

beforeEach(() => {
  window.localStorage.clear();
  router.replace.mockClear();
  router.push.mockClear();
});

afterEach(cleanup);

describe('SearchScreen — "Tìm gần đây" chỉ ghi khi CHỌN kết quả, không ghi khi mới gõ', () => {
  it('gõ ra kết quả mà chưa bấm gì thì không ghi gì vào localStorage', () => {
    vi.useFakeTimers();
    try {
      moMan();

      fireEvent.change(oTim(), { target: { value: 'P/E' } });

      // Kết quả phải thật sự hiện ra, nếu không ca kiểm này rỗng nghĩa.
      expect(dongKetQua(PE.id)).not.toBeUndefined();

      // Đợi qua cả mốc debounce 900ms của bản lỗi cũ — hành vi mới không còn hẹn giờ nào để ghi.
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('bấm vào một kết quả thì ghi đúng TÊN công thức đã chọn, không phải chữ đã gõ', () => {
    moMan();

    fireEvent.change(oTim(), { target: { value: 'P/E' } });
    fireEvent.click(dongKetQua(PE.id));

    const luuLai = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    expect(luuLai).not.toBeNull();
    expect(JSON.parse(luuLai ?? '[]')).toEqual([PE.name.vi]);
  });

  it('sau khi chọn, quay lại ô tìm rỗng thì thấy chip "Tìm gần đây" mang đúng tên công thức', () => {
    moMan();

    fireEvent.change(oTim(), { target: { value: 'P/E' } });
    fireEvent.click(dongKetQua(PE.id));

    // Xoá chữ trong ô để quay về trạng thái nhàn — nơi khối "Tìm gần đây" hiện ra.
    fireEvent.change(oTim(), { target: { value: '' } });

    expect(screen.getByRole('button', { name: PE.name.vi })).not.toBeNull();
  });
});

/**
 * Kho CHUNG với ô tìm ở màn Công thức.
 *
 * Từng là kho RIÊNG, và ba ca ở đây từng gác đúng điều ngược lại — khi ô tìm trang chủ chỉ lọc kệ
 * 18 ô thì chip của nó hiện ở màn này là nói sai. Trang chủ gộp vào màn Công thức ngày 15/09/2026 và
 * ô tìm ở đó lọc cả thư viện, đúng phạm vi của màn này, nên hai ô dùng chung `RECENT_SEARCHES_KEY`.
 * Ca dưới gác vế còn lại của lời hứa ấy: thứ người dùng chọn ở màn Công thức hiện ra ở đây.
 */
describe('SearchScreen — lịch sử dùng chung với màn Công thức', () => {
  it('chip ghi vào kho chung hiện ở màn tìm', () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([PE.name.vi]));

    moMan();

    expect(screen.getByRole('button', { name: PE.name.vi })).not.toBeNull();
  });
});
