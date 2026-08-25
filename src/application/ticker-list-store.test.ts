import { describe, expect, it } from 'vitest';

import {
  TICKER_LIST_TTL_MS,
  isTickerListFresh,
  parseCachedTickers,
  serializeCachedTickers,
} from './ticker-list-store';

const NOW = Date.UTC(2026, 7, 24, 9, 0, 0);
const ITEMS = [
  { code: 'FPT', name: 'FPT Corp' },
  { code: 'MWG', name: 'Thế giới Di động' },
];

describe('cache danh sách mã', () => {
  it('ghi rồi đọc lại ra đúng thứ đã ghi', () => {
    const cached = parseCachedTickers(serializeCachedTickers(ITEMS, NOW));

    expect(cached?.fetchedAt).toBe(NOW);
    expect(cached?.items).toEqual(ITEMS);
  });

  it('viết hoa mã và bỏ mục thiếu mã hoặc thiếu tên', () => {
    const raw = JSON.stringify({
      fetchedAt: NOW,
      items: [
        { code: 'fpt', name: 'FPT Corp' },
        { code: 'HPG' },
        { code: '', name: 'Trống' },
        'không phải object',
      ],
    });

    expect(parseCachedTickers(raw)?.items).toEqual([{ code: 'FPT', name: 'FPT Corp' }]);
  });

  it('chuỗi hỏng hay thiếu mốc thời gian thì coi như chưa có cache', () => {
    expect(parseCachedTickers('{ không phải json')).toBeNull();
    expect(parseCachedTickers(null)).toBeNull();
    expect(parseCachedTickers('')).toBeNull();
    expect(parseCachedTickers(JSON.stringify({ items: ITEMS }))).toBeNull();
    expect(parseCachedTickers(JSON.stringify({ fetchedAt: NOW }))).toBeNull();
  });

  it('cache rỗng không được coi là cache', () => {
    // Ngược lại thì một lần ghi hỏng sẽ khoá ô chọn mã ở trạng thái trống suốt 24 giờ.
    expect(parseCachedTickers(serializeCachedTickers([], NOW))).toBeNull();
  });
});

describe('hạn dùng của cache', () => {
  const cached = { fetchedAt: NOW, items: ITEMS };

  it('còn hạn khi chưa quá TTL', () => {
    expect(isTickerListFresh(cached, NOW)).toBe(true);
    expect(isTickerListFresh(cached, NOW + TICKER_LIST_TTL_MS - 1)).toBe(true);
  });

  it('hết hạn đúng mốc TTL', () => {
    expect(isTickerListFresh(cached, NOW + TICKER_LIST_TTL_MS)).toBe(false);
  });

  it('chưa có cache thì không còn hạn', () => {
    expect(isTickerListFresh(null, NOW)).toBe(false);
  });

  it('mốc thời gian ở tương lai cũng coi là hết hạn', () => {
    // Máy chỉnh sai giờ rồi chỉnh lại: nếu không chặn, bản cache "của ngày mai" sẽ không bao
    // giờ tự làm mới nữa.
    expect(isTickerListFresh(cached, NOW - 1000)).toBe(false);
  });
});
