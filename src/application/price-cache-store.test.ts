import { describe, expect, it } from 'vitest';

import {
  PRICE_CACHE_TTL_MS,
  isPriceCacheFresh,
  oldestAsOf,
  parseCachedPrices,
  serializeCachedPrices,
} from './price-cache-store';
import type { CachedQuote } from './price-cache-store';

const NOW = 1_800_000_000_000;

function quote(patch: Partial<CachedQuote> = {}): CachedQuote {
  return { code: 'FPT', name: 'FPT Corp', priceVnd: 71_400, asOfDate: '2026-08-21', ...patch };
}

describe('parseCachedPrices', () => {
  it('đi trọn một vòng ghi rồi đọc', () => {
    const cached = parseCachedPrices(serializeCachedPrices([quote()], NOW));

    expect(cached?.fetchedAt).toBe(NOW);
    expect(cached?.items[0]?.priceVnd).toBe(71_400);
    expect(cached?.items[0]?.asOfDate).toBe('2026-08-21');
  });

  it('chuỗi rác, null, rỗng, hay mảng trần đều ra null chứ không ném', () => {
    for (const raw of [null, undefined, '', '   ', '{', '[]', 'null', '{"items":[]}']) {
      expect(parseCachedPrices(raw)).toBeNull();
    }
  });

  it('thiếu hoặc sai mốc thời gian thì bỏ cả bản cache', () => {
    expect(parseCachedPrices(JSON.stringify({ items: [quote()] }))).toBeNull();
    expect(parseCachedPrices(JSON.stringify({ fetchedAt: 0, items: [quote()] }))).toBeNull();
    expect(
      parseCachedPrices(JSON.stringify({ fetchedAt: 'hôm qua', items: [quote()] })),
    ).toBeNull();
  });

  /*
   * Mục giá 0 hoặc âm phải bị BỎ HẲN, không phải giữ lại rồi để nơi gọi tự lo.
   *
   * Một mục giá 0 lọt vào kho sẽ định giá mã đó bằng 0 ₫ trên màn Danh mục — đúng thứ FR-06 cấm,
   * mà lần này còn cấm ở chỗ người dùng không thể thấy nguyên nhân, vì nó đến từ localStorage
   * chứ không từ một lời gọi mạng nào đang hiện trạng thái.
   */
  it('bỏ mục giá không dương thay vì để nó định giá bằng 0', () => {
    const raw = JSON.stringify({
      fetchedAt: NOW,
      items: [quote({ code: 'A', priceVnd: 0 }), quote({ code: 'B', priceVnd: -5 }), quote()],
    });

    expect(parseCachedPrices(raw)?.items.map((item) => item.code)).toEqual(['FPT']);
  });

  it('ngày phiên sai dạng thì về null, phần còn lại của mục vẫn dùng được', () => {
    const raw = JSON.stringify({ fetchedAt: NOW, items: [quote({ asOfDate: '21/08/2026' })] });
    const cached = parseCachedPrices(raw);

    expect(cached?.items[0]?.asOfDate).toBeNull();
    expect(cached?.items[0]?.priceVnd).toBe(71_400);
  });

  it('thiếu tên thì lấy mã làm tên', () => {
    const raw = JSON.stringify({ fetchedAt: NOW, items: [{ code: 'FPT', priceVnd: 71_400 }] });
    expect(parseCachedPrices(raw)?.items[0]?.name).toBe('FPT');
  });
});

describe('isPriceCacheFresh', () => {
  it('trong hạn thì dùng được, quá hạn thì không', () => {
    const cached = parseCachedPrices(serializeCachedPrices([quote()], NOW));

    expect(isPriceCacheFresh(cached, NOW + 60_000)).toBe(true);
    expect(isPriceCacheFresh(cached, NOW + PRICE_CACHE_TTL_MS - 1)).toBe(true);
    expect(isPriceCacheFresh(cached, NOW + PRICE_CACHE_TTL_MS)).toBe(false);
  });

  /*
   * Mốc ở TƯƠNG LAI cũng coi là hết hạn: máy người dùng chỉnh sai giờ rồi chỉnh lại sẽ để lại
   * một bản cache "của tuần sau" mà không cách nào tự hết hạn — cùng luật `isTickerListFresh`.
   */
  it('mốc thời gian ở tương lai coi như hết hạn', () => {
    const cached = parseCachedPrices(serializeCachedPrices([quote()], NOW));
    expect(isPriceCacheFresh(cached, NOW - 1)).toBe(false);
  });

  it('không có cache thì không bao giờ tươi', () => {
    expect(isPriceCacheFresh(null, NOW)).toBe(false);
  });
});

describe('oldestAsOf', () => {
  /*
   * Lấy phiên CŨ NHẤT, không phải mới nhất. Câu "Giá phiên 20/08" trên màn phải đúng với MỌI con
   * số đang hiện; lấy ngày mới nhất thì một mã lỡ nhịp sẽ nấp sau ngày đẹp của mã khác, và người
   * dùng tin rằng cả danh mục đang tính theo phiên hôm qua.
   */
  it('trả phiên cũ nhất trong nhóm', () => {
    expect(
      oldestAsOf([{ asOfDate: '2026-08-25' }, { asOfDate: '2026-08-20' }, { asOfDate: null }]),
    ).toBe('2026-08-20');
  });

  it('không mã nào có ngày thì trả null', () => {
    expect(oldestAsOf([{ asOfDate: null }])).toBeNull();
    expect(oldestAsOf([])).toBeNull();
  });
});
