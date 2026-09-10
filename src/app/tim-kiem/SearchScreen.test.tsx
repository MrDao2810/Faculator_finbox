// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FORMULA_SUMMARIES, HOME_RECENT_SEARCHES_KEY, RECENT_SEARCHES_KEY } from '@/application';
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

/** Ô nhập của WF-09 — cùng nhãn `t('search.label')` mà `HomeSearchPanel.test.tsx` đã dùng. */
const oTim = (): HTMLElement => screen.getByLabelText('Tìm công thức');

/**
 * Dòng kết quả dẫn tới một công thức trong cây vừa dựng.
 *
 * Chấp nhận cả hai dạng có / không gạch chéo cuối — cùng lý do `HomeSearchPanel.test.tsx` đã
 * ghi: `next/link` dưới jsdom cắt gạch chéo cuối dù bản build thật giữ lại
 * (`trailingSlash: true`).
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
 * Vế đối xứng của ca gác ở `HomeSearchPanel.test.tsx`: hai ô tìm có hai kho riêng, và không kho
 * nào nhìn thấy kho kia. Trước đợt sửa cả hai đọc chung `ffb.recent.v1` nên cả hai ca đều đỏ.
 */
describe('SearchScreen — lịch sử là kho RIÊNG của màn tìm', () => {
  it('lịch sử ghi ở trang chủ KHÔNG hiện ở màn tìm', () => {
    window.localStorage.setItem(HOME_RECENT_SEARCHES_KEY, JSON.stringify(['Beta', 'WACC']));

    moMan();

    // Vào màn là ô tìm đang rỗng, tức đúng trạng thái khối "Tìm gần đây" hiện ra — nếu có gì.
    expect(screen.queryByRole('button', { name: 'Beta' })).toBeNull();
    /*
     * Tên vùng lấy từ `search.recent.title` — "Tìm gần đây". Ca này từng ghim chữ của bản trước
     * ("Lịch sử tìm kiếm"), tức nó XANH cả khi khối hiện ra, vì cái tên ấy không còn tồn tại ở
     * đâu. Một ca `queryBy…toBeNull()` ghim sai chữ là ca không gác gì cả.
     */
    expect(screen.queryByRole('region', { name: 'Tìm gần đây' })).toBeNull();
  });

  it('chọn kết quả ở đây thì chỉ kho của màn này đổi, kho trang chủ vẫn nguyên', () => {
    window.localStorage.setItem(HOME_RECENT_SEARCHES_KEY, JSON.stringify(['Beta']));

    moMan();
    fireEvent.change(oTim(), { target: { value: 'P/E' } });
    fireEvent.click(dongKetQua(PE.id));

    expect(JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]')).toEqual([
      PE.name.vi,
    ]);
    expect(JSON.parse(window.localStorage.getItem(HOME_RECENT_SEARCHES_KEY) ?? '[]')).toEqual([
      'Beta',
    ]);
  });

  it('xoá lịch sử ở đây thì kho trang chủ không bị đụng', () => {
    window.localStorage.setItem(HOME_RECENT_SEARCHES_KEY, JSON.stringify(['Beta']));
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['P/E']));

    moMan();
    fireEvent.click(screen.getByRole('button', { name: 'Xoá lịch sử' }));

    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(HOME_RECENT_SEARCHES_KEY) ?? '[]')).toEqual([
      'Beta',
    ]);
  });
});
