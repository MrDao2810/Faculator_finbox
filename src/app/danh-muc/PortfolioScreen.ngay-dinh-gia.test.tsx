// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PORTFOLIO_KEY, PREFERENCES_STORAGE_KEY } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { PortfolioScreen } from './PortfolioScreen';

/**
 * Hai lỗi của màn Danh mục tìm được ở đợt rà 29/10/2026, cùng một nhà vì cùng cần dựng cả màn:
 *   · ngày định giá `asOf` chỉ được đặt MỘT lần lúc gắn màn, nên tab mở qua nửa đêm báo "ngày mua nằm
 *     sau ngày định giá" cho mã mua "hôm nay";
 *   · mở Sửa rồi Lưu mà không đụng ô giá vốn vẫn làm tròn giá vốn trong kho về 2 chữ số lẻ.
 */

const feed = vi.hoisted(() => ({
  listTickers: vi.fn(),
  snapshots: vi.fn(),
}));

vi.mock('@/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data')>();
  return { ...actual, MARKET_FEED: feed };
});

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

function snap(code: string, priceVnd: number) {
  return {
    code,
    name: code,
    priceVnd,
    asOfDate: '2026-10-28',
    floor: 'HOSE',
    industry: null,
    fundamentals: null,
  };
}

async function oThongKe(nhan: string): Promise<HTMLElement> {
  const nhanEl = await screen.findByText(nhan, { selector: 'span' });
  const o = nhanEl.parentElement;
  if (o === null) throw new Error('thiếu ô cha của nhãn thống kê');
  return o;
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
  router.push.mockReset();
  feed.listTickers.mockReset();
  feed.snapshots.mockReset();
  feed.listTickers.mockResolvedValue([
    { code: 'FPT', name: 'FPT Corp' },
    { code: 'HPG', name: 'Hoa Phat' },
  ]);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Danh mục — ngày định giá theo ngày hôm nay, không đóng băng lúc gắn màn', () => {
  it('tab mở qua nửa đêm: thêm mã mua hôm nay thì XIRR không báo "ngày mua nằm sau ngày định giá"', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 28, 23, 58, 0));

    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ mode: 'advanced' }));
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: 1 },
      ]),
    );
    feed.snapshots.mockImplementation(
      async (codes: string[]) =>
        new Map(codes.map((c) => [c, snap(c, c === 'FPT' ? 71_400 : 26_000)])),
    );

    render(
      <PreferencesProvider>
        <PortfolioScreen />
      </PreferencesProvider>,
    );
    await screen.findByText('Beta danh mục');
    await waitFor(async () => {
      expect((await oThongKe('Tổng giá trị')).textContent).toContain('7.140.000');
    });

    // Qua nửa đêm, tab vẫn mở (không tải lại trang).
    vi.setSystemTime(new Date(2026, 9, 29, 0, 3, 0));

    await userEvent.click(screen.getByRole('button', { name: 'Thêm mới' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const tam = (await screen.findAllByRole('dialog')).filter((t) => t.hasAttribute('open'));
    const sheet = tam[tam.length - 1] as HTMLElement;
    const dong = within(sheet)
      .getAllByRole('listitem')
      .find((item) => item.textContent?.startsWith('HPG') === true) as HTMLElement;
    await userEvent.click(within(dong).getByRole('button'));

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '1000');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '25000');
    await userEvent.type(screen.getByLabelText('Ngày mua'), '29/10/2026');
    await userEvent.type(screen.getByLabelText('Beta'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    await waitFor(async () => {
      expect((await oThongKe('Tổng giá trị')).textContent).toContain('33.140.000');
    });
    await userEvent.click(screen.getByRole('link', { name: 'Hướng dẫn: XIRR toàn danh mục' }));
    const khung = await screen.findByRole('dialog', { name: 'XIRR toàn danh mục' });
    expect(khung.textContent).not.toMatch(/nằm sau ngày định giá/);
  });
});

describe('Danh mục — Sửa rồi Lưu không đụng ô giá vốn thì giá vốn trong kho giữ nguyên', () => {
  it('giá vốn bình quân có nhiều chữ số lẻ không bị làm tròn về 2 số lẻ', async () => {
    const giaVon = 9_625_000 / 150;
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([{ code: 'FPT', quantity: 150, costPrice: giaVon, buyDate: '', beta: null }]),
    );
    feed.snapshots.mockResolvedValue(new Map([['FPT', snap('FPT', 71_400)]]));

    render(<PortfolioScreen />);
    await waitFor(async () => {
      expect((await oThongKe('Tổng giá trị')).textContent).toContain('10.710.000');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Sửa FPT' }));
    await userEvent.type(screen.getByLabelText('Ngày mua'), '02/01/2026');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    const kho = JSON.parse(window.localStorage.getItem(PORTFOLIO_KEY) ?? '[]') as Array<{
      costPrice: number;
      quantity: number;
    }>;
    expect(kho[0]?.costPrice).toBe(giaVon);
    expect(kho[0]?.quantity).toBe(150);
  });
});
