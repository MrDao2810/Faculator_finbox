import { describe, expect, it } from 'vitest';

import type { HoldingValue } from '@/core/portfolio';

import {
  HOLDING_SORT_KEYS,
  effectiveHoldingSort,
  nextHoldingSort,
  parseHoldingSort,
  serializeHoldingSort,
  sortHoldingRows,
  sortPendingCodes,
  type HoldingSort,
} from './portfolio-sort';

/** Một dòng đủ trường; phần không nêu là `null`, tức ô `_ _` trên màn. */
function dong(
  code: string,
  holding: { quantity?: number; costPrice?: number; buyDate?: string },
  values: Partial<Omit<HoldingValue, 'holding'>> = {},
): HoldingValue {
  return {
    holding: {
      code,
      quantity: holding.quantity ?? 1,
      costPrice: holding.costPrice ?? 1,
      buyDate: holding.buyDate ?? '',
      beta: null,
    },
    marketPrice: null,
    value: null,
    weight: null,
    cost: null,
    gain: null,
    gainPercent: null,
    ...values,
  };
}

/** Thứ tự đã thêm vào: HPG, ACB, FPT. ACB không có giá, không có ngày mua. */
const ROWS: HoldingValue[] = [
  dong(
    'HPG',
    { quantity: 300, costPrice: 30_000, buyDate: '2026-03-05' },
    { marketPrice: 26_000, gain: -1_200_000, gainPercent: -13.33, weight: 52.2 },
  ),
  dong('ACB', { quantity: 50, costPrice: 25_000 }),
  dong(
    'FPT',
    { quantity: 100, costPrice: 60_000, buyDate: '2026-01-02' },
    { marketPrice: 71_400, gain: 1_140_000, gainPercent: 19, weight: 47.8 },
  ),
];

function ma(rows: ReadonlyArray<HoldingValue>): string[] {
  return rows.map((row) => row.holding.code);
}

describe('nextHoldingSort — vòng ba lần bấm của một tiêu đề cột', () => {
  it('Mã: A tới Z, rồi Z tới A, rồi về thứ tự đã thêm vào', () => {
    const lan1 = nextHoldingSort(null, 'code');
    expect(lan1).toEqual({ key: 'code', dir: 'asc' });
    const lan2 = nextHoldingSort(lan1, 'code');
    expect(lan2).toEqual({ key: 'code', dir: 'desc' });
    expect(nextHoldingSort(lan2, 'code')).toBeNull();
  });

  it.each(HOLDING_SORT_KEYS.filter((key) => key !== 'code'))(
    '%s: lớn (hoặc mới) trước, rồi đảo, rồi về thứ tự đã thêm vào',
    (key) => {
      const lan1 = nextHoldingSort(null, key);
      expect(lan1).toEqual({ key, dir: 'desc' });
      const lan2 = nextHoldingSort(lan1, key);
      expect(lan2).toEqual({ key, dir: 'asc' });
      expect(nextHoldingSort(lan2, key)).toBeNull();
    },
  );

  it('bấm sang cột khác thì bắt đầu lại từ chiều đầu của cột ấy', () => {
    expect(nextHoldingSort({ key: 'gain', dir: 'asc' }, 'code')).toEqual({
      key: 'code',
      dir: 'asc',
    });
    expect(nextHoldingSort({ key: 'code', dir: 'desc' }, 'weight')).toEqual({
      key: 'weight',
      dir: 'desc',
    });
  });
});

describe('sortHoldingRows — ô `_ _` luôn đứng cuối, hai dòng bằng nhau giữ thứ tự gốc', () => {
  it('không sắp thì trả đúng thứ tự gốc, và là một bản sao', () => {
    const out = sortHoldingRows(ROWS, null);
    expect(ma(out)).toEqual(['HPG', 'ACB', 'FPT']);
    expect(out).not.toBe(ROWS);
  });

  it('Mã theo cả hai chiều', () => {
    expect(ma(sortHoldingRows(ROWS, { key: 'code', dir: 'asc' }))).toEqual(['ACB', 'FPT', 'HPG']);
    expect(ma(sortHoldingRows(ROWS, { key: 'code', dir: 'desc' }))).toEqual(['HPG', 'FPT', 'ACB']);
  });

  it('Số CP và Giá vốn đọc từ chính dòng nắm giữ, có ở mọi dòng', () => {
    expect(ma(sortHoldingRows(ROWS, { key: 'quantity', dir: 'desc' }))).toEqual([
      'HPG',
      'FPT',
      'ACB',
    ]);
    expect(ma(sortHoldingRows(ROWS, { key: 'costPrice', dir: 'asc' }))).toEqual([
      'ACB',
      'HPG',
      'FPT',
    ]);
  });

  it.each(['marketPrice', 'gain', 'gainPercent', 'weight'] as const)(
    '%s: mã thiếu giá đứng cuối ở CẢ HAI chiều, không bị xếp như số 0 (FR-06)',
    (key) => {
      const giam = ma(sortHoldingRows(ROWS, { key, dir: 'desc' }));
      const tang = ma(sortHoldingRows(ROWS, { key, dir: 'asc' }));
      expect(giam[2]).toBe('ACB');
      expect(tang[2]).toBe('ACB');
      expect(giam.slice(0, 2)).toEqual([...tang.slice(0, 2)].reverse());
    },
  );

  it('lãi âm đứng dưới lãi dương khi xếp từ lớn tới nhỏ', () => {
    expect(ma(sortHoldingRows(ROWS, { key: 'gain', dir: 'desc' }))).toEqual(['FPT', 'HPG', 'ACB']);
  });

  it('Ngày mua: mới trước, và ngày không đúng dạng xếp như ô trống chứ không như một chuỗi', () => {
    const rows = [
      ...ROWS,
      dong('VNM', { buyDate: 'hôm qua' }),
      dong('MWG', { buyDate: '2025-12-31' }),
    ];
    expect(ma(sortHoldingRows(rows, { key: 'buyDate', dir: 'desc' }))).toEqual([
      'HPG',
      'FPT',
      'MWG',
      'ACB',
      'VNM',
    ]);
    expect(ma(sortHoldingRows(rows, { key: 'buyDate', dir: 'asc' }))).toEqual([
      'MWG',
      'FPT',
      'HPG',
      'ACB',
      'VNM',
    ]);
  });

  it('hai dòng bằng nhau giữ thứ tự đã thêm vào, ở cả hai chiều', () => {
    const rows = [
      dong('B', { quantity: 10 }),
      dong('A', { quantity: 10 }),
      dong('C', { quantity: 5 }),
    ];
    expect(ma(sortHoldingRows(rows, { key: 'quantity', dir: 'desc' }))).toEqual(['B', 'A', 'C']);
    expect(ma(sortHoldingRows(rows, { key: 'quantity', dir: 'asc' }))).toEqual(['C', 'B', 'A']);
  });
});

describe('sortPendingCodes — dòng chờ chỉ có Mã và Thị giá để so', () => {
  const gia = new Map([
    ['VNM', 62_000],
    ['BID', 45_000],
  ]);
  const priceOf = (code: string): number | null => gia.get(code) ?? null;

  it('theo Mã và theo Thị giá; mã không có giá đứng cuối', () => {
    const codes = ['VNM', 'SSI', 'BID'];
    expect(sortPendingCodes(codes, { key: 'code', dir: 'asc' }, priceOf)).toEqual([
      'BID',
      'SSI',
      'VNM',
    ]);
    expect(sortPendingCodes(codes, { key: 'marketPrice', dir: 'desc' }, priceOf)).toEqual([
      'VNM',
      'BID',
      'SSI',
    ]);
    expect(sortPendingCodes(codes, { key: 'marketPrice', dir: 'asc' }, priceOf)).toEqual([
      'BID',
      'VNM',
      'SSI',
    ]);
  });

  it('cột dòng chờ không có (lãi/lỗ, ngày mua…) thì giữ thứ tự nhập', () => {
    const codes = ['VNM', 'SSI', 'BID'];
    for (const key of ['quantity', 'gain', 'weight', 'buyDate'] as const) {
      expect(sortPendingCodes(codes, { key, dir: 'desc' }, priceOf), key).toEqual(codes);
    }
    expect(sortPendingCodes(codes, null, priceOf)).toEqual(codes);
  });
});

describe('effectiveHoldingSort — khổ điện thoại không có tiêu đề Lãi/lỗ, % và Tỷ trọng', () => {
  it.each(['gain', 'gainPercent', 'weight'] as const)(
    '%s: PC sắp, điện thoại về thứ tự đã thêm vào',
    (key) => {
      const sort: HoldingSort = { key, dir: 'desc' };
      expect(effectiveHoldingSort(sort, true)).toBe(sort);
      expect(effectiveHoldingSort(sort, false)).toBeNull();
    },
  );

  it.each(['code', 'quantity', 'costPrice', 'marketPrice', 'buyDate'] as const)(
    '%s: có trên hàng tiêu đề ở cả hai khổ',
    (key) => {
      const sort: HoldingSort = { key, dir: 'asc' };
      expect(effectiveHoldingSort(sort, false)).toBe(sort);
    },
  );
});

describe('parseHoldingSort — đọc từ máy người dùng, không tin gì cả', () => {
  it('đọc lại đúng thứ đã ghi, ở mọi cột và mọi chiều', () => {
    for (const key of HOLDING_SORT_KEYS) {
      for (const dir of ['asc', 'desc'] as const) {
        expect(parseHoldingSort(serializeHoldingSort({ key, dir }))).toEqual({ key, dir });
      }
    }
  });

  it.each([
    null,
    undefined,
    '',
    '   ',
    'không phải JSON',
    'null',
    '[]',
    '"code"',
    '{"key":"code"}',
    '{"key":"code","dir":"up"}',
    '{"key":"value","dir":"asc"}',
    '{"key":"__proto__","dir":"asc"}',
  ])('%s → về thứ tự đã thêm vào, không ném lỗi', (raw) => {
    expect(parseHoldingSort(raw)).toBeNull();
  });

  it('bỏ trường lạ khi ghi lại', () => {
    const parsed = parseHoldingSort('{"key":"gain","dir":"asc","thua":1}');
    expect(parsed).toEqual({ key: 'gain', dir: 'asc' });
    expect(serializeHoldingSort(parsed as HoldingSort)).toBe('{"key":"gain","dir":"asc"}');
  });
});
