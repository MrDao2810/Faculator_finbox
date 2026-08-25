import { describe, expect, it } from 'vitest';

import {
  MAX_USAGE_COUNT,
  MAX_USAGE_ENTRIES,
  PERSONAL_SLOTS,
  USAGE_HALF_LIFE_MS,
  parseFormulaUsage,
  rankFeaturedIds,
  recordFormulaUsage,
  sameOrder,
  serializeFormulaUsage,
  usageScore,
} from './formula-usage';
import type { FormulaUsage } from './formula-usage';

/** Mốc cố định cho mọi ca — không ca nào được gọi `Date.now()`. */
const NOW = 1_760_000_000_000;
const NGAY = 24 * 60 * 60 * 1000;

function entry(id: string, count: number, ageMs = 0): FormulaUsage {
  return { id, count, at: NOW - ageMs };
}

describe('parseFormulaUsage() — chịu được mọi thứ trong localStorage', () => {
  it('đọc được danh sách bình thường', () => {
    const raw = JSON.stringify([{ id: 'pe', count: 3, at: NOW }]);
    expect(parseFormulaUsage(raw)).toEqual([{ id: 'pe', count: 3, at: NOW }]);
  });

  it('chưa có gì thì trả mảng rỗng', () => {
    expect(parseFormulaUsage(null)).toEqual([]);
    expect(parseFormulaUsage(undefined)).toEqual([]);
    expect(parseFormulaUsage('')).toEqual([]);
    expect(parseFormulaUsage('   ')).toEqual([]);
  });

  it('JSON hỏng thì trả rỗng chứ không ném lỗi', () => {
    expect(parseFormulaUsage('[{"id":"pe"')).toEqual([]);
  });

  it('không phải mảng thì bỏ qua', () => {
    expect(parseFormulaUsage('{"a":1}')).toEqual([]);
    expect(parseFormulaUsage('"chuoi don"')).toEqual([]);
    expect(parseFormulaUsage('42')).toEqual([]);
  });

  it('bỏ phần tử không phải object, giữ phần còn lại', () => {
    const raw = JSON.stringify([42, null, 'pe', ['pb'], { id: 'roi', count: 2, at: NOW }]);
    expect(parseFormulaUsage(raw)).toEqual([{ id: 'roi', count: 2, at: NOW }]);
  });

  it('bỏ phần tử thiếu id', () => {
    expect(parseFormulaUsage(JSON.stringify([{ count: 2, at: NOW }]))).toEqual([]);
  });

  it('bỏ id sai dạng slug', () => {
    const raw = JSON.stringify([
      { id: 'PE', count: 2, at: NOW },
      { id: 'p e', count: 2, at: NOW },
      { id: '__proto__', count: 2, at: NOW },
      { id: 'x'.repeat(100), count: 2, at: NOW },
      { id: '', count: 2, at: NOW },
      { id: 'pe', count: 2, at: NOW },
    ]);
    expect(parseFormulaUsage(raw)).toEqual([{ id: 'pe', count: 2, at: NOW }]);
  });

  it('bỏ hẳn phần tử có số lượt vô nghĩa', () => {
    const raw = JSON.stringify([
      { id: 'pe', count: -3, at: NOW },
      { id: 'pb', count: 0, at: NOW },
      { id: 'roi', count: 1.5, at: NOW },
      { id: 'cagr', count: null, at: NOW },
      { id: 'wacc', count: 'nhieu', at: NOW },
    ]);
    expect(parseFormulaUsage(raw)).toEqual([]);
  });

  it('NaN và Infinity trong số lượt cũng bị bỏ (JSON đưa chúng về null)', () => {
    const raw = '[{"id":"pe","count":null,"at":1},{"id":"pb","count":1e999,"at":1}]';
    expect(parseFormulaUsage(raw)).toEqual([]);
  });

  it('số lượt vượt trần thì KẸP chứ không bỏ — nó vẫn nói đúng "hay dùng"', () => {
    const raw = JSON.stringify([{ id: 'pe', count: 10_000_000, at: NOW }]);
    expect(parseFormulaUsage(raw)).toEqual([{ id: 'pe', count: MAX_USAGE_COUNT, at: NOW }]);
  });

  it('bỏ phần tử có mốc thời gian vô nghĩa', () => {
    const raw = JSON.stringify([
      { id: 'pe', count: 2, at: 0 },
      { id: 'pb', count: 2, at: -5 },
      { id: 'roi', count: 2, at: 'hom qua' },
      { id: 'cagr', count: 2, at: null },
    ]);
    expect(parseFormulaUsage(raw)).toEqual([]);
  });

  it('bản cũ ghi trùng thì vẫn lọc trùng lúc đọc, giữ bản đầu', () => {
    const raw = JSON.stringify([
      { id: 'pe', count: 5, at: NOW },
      { id: 'pe', count: 1, at: NOW - NGAY },
    ]);
    expect(parseFormulaUsage(raw)).toEqual([{ id: 'pe', count: 5, at: NOW }]);
  });

  it('không bao giờ trả quá số mục tối đa', () => {
    const many = JSON.stringify(
      Array.from({ length: 50 }, (_, i) => ({ id: `cong-thuc-${i}`, count: 2, at: NOW })),
    );
    expect(parseFormulaUsage(many)).toHaveLength(MAX_USAGE_ENTRIES);
  });

  it('lờ đi field lạ chứ không vì thế mà bỏ cả phần tử', () => {
    const raw = JSON.stringify([{ id: 'pe', count: 2, at: NOW, ghiChu: 'rác của bản sau' }]);
    expect(parseFormulaUsage(raw)).toEqual([{ id: 'pe', count: 2, at: NOW }]);
  });
});

describe('usageScore() — suy giảm một nửa sau mỗi 30 ngày', () => {
  it('mới dùng xong thì điểm đúng bằng số lượt', () => {
    expect(usageScore(entry('pe', 4), NOW)).toBe(4);
  });

  it('đúng một chu kỳ bán rã thì còn một nửa', () => {
    expect(usageScore(entry('pe', 4, USAGE_HALF_LIFE_MS), NOW)).toBeCloseTo(2, 10);
  });

  it('hai chu kỳ thì còn một phần tư', () => {
    expect(usageScore(entry('pe', 4, 2 * USAGE_HALF_LIFE_MS), NOW)).toBeCloseTo(1, 10);
  });

  it('mốc ở tương lai (đồng hồ máy chạy trước) thì kẹp tuổi về 0, điểm không nổ', () => {
    expect(usageScore({ id: 'pe', count: 4, at: NOW + 400 * NGAY }, NOW)).toBe(4);
  });
});

describe('recordFormulaUsage()', () => {
  it('id mới thì vào danh sách với một lượt', () => {
    expect(recordFormulaUsage([], 'pe', NOW)).toEqual([{ id: 'pe', count: 1, at: NOW }]);
  });

  it('id đã có thì cộng lượt và cập nhật mốc', () => {
    const truoc = [entry('pe', 3, 5 * NGAY)];
    expect(recordFormulaUsage(truoc, 'pe', NOW)).toEqual([{ id: 'pe', count: 4, at: NOW }]);
  });

  it('đồng hồ máy bị chỉnh lùi thì mốc không đi ngược', () => {
    const truoc = [{ id: 'pe', count: 3, at: NOW }];
    const sau = recordFormulaUsage(truoc, 'pe', NOW - 10 * NGAY);
    expect(sau).toEqual([{ id: 'pe', count: 4, at: NOW }]);
  });

  it('mốc thời gian vô nghĩa thì giữ nguyên danh sách', () => {
    const truoc = [entry('pe', 3)];
    expect(recordFormulaUsage(truoc, 'pb', Number.NaN)).toEqual(truoc);
    expect(recordFormulaUsage(truoc, 'pb', Number.POSITIVE_INFINITY)).toEqual(truoc);
    expect(recordFormulaUsage(truoc, 'pb', 0)).toEqual(truoc);
    expect(recordFormulaUsage(truoc, 'pb', -1)).toEqual(truoc);
  });

  it('id sai dạng thì giữ nguyên danh sách', () => {
    const truoc = [entry('pe', 3)];
    expect(recordFormulaUsage(truoc, 'P/E', NOW)).toEqual(truoc);
    expect(recordFormulaUsage(truoc, '', NOW)).toEqual(truoc);
  });

  it('không đột biến mảng gốc', () => {
    const truoc = [entry('pe', 3)];
    recordFormulaUsage(truoc, 'pb', NOW);
    expect(truoc).toHaveLength(1);
  });

  it('chạm trần số lượt thì dừng ở trần', () => {
    const truoc = [{ id: 'pe', count: MAX_USAGE_COUNT, at: NOW }];
    expect(recordFormulaUsage(truoc, 'pe', NOW)[0]?.count).toBe(MAX_USAGE_COUNT);
  });

  it('trả về mảng đã sắp theo điểm giảm dần', () => {
    const truoc = [entry('pe', 1), entry('pb', 9)];
    expect(recordFormulaUsage(truoc, 'roi', NOW).map((e) => e.id)).toEqual(['pb', 'roi', 'pe']);
  });

  it('đầy chỗ thì đuổi mục ĐIỂM THẤP NHẤT, không phải mục cũ nhất', () => {
    // 'cu-nhung-nhieu' cũ hơn hẳn nhưng điểm còn ~10; 'moi-nhung-it' mới tinh mà chỉ 1 điểm.
    const day: FormulaUsage[] = [
      entry('cu-nhung-nhieu', 40, 2 * USAGE_HALF_LIFE_MS),
      entry('moi-nhung-it', 1),
      ...Array.from({ length: MAX_USAGE_ENTRIES - 2 }, (_, i) => entry(`day-${i}`, 5)),
    ];
    const sau = recordFormulaUsage(day, 'nguoi-moi', NOW);
    const ids = sau.map((e) => e.id);

    expect(sau).toHaveLength(MAX_USAGE_ENTRIES);
    expect(ids).toContain('nguoi-moi');
    expect(ids).toContain('cu-nhung-nhieu');
    expect(ids).not.toContain('moi-nhung-it');
  });
});

describe('serializeFormulaUsage()', () => {
  it('đi một vòng rồi về vẫn nguyên', () => {
    const list = [entry('pe', 3), entry('pb', 1, NGAY)];
    expect(parseFormulaUsage(serializeFormulaUsage(list))).toEqual(list);
  });

  it('cắt đúng số mục tối đa lúc ghi', () => {
    const many = Array.from({ length: 50 }, (_, i) => entry(`cong-thuc-${i}`, 2));
    expect(JSON.parse(serializeFormulaUsage(many))).toHaveLength(MAX_USAGE_ENTRIES);
  });
});

describe('rankFeaturedIds()', () => {
  /** Mười tám ô như trên trang chủ thật, để mọi ca nói đúng bài toán thật. */
  const GHIM = Array.from({ length: 18 }, (_, i) => `ghim-${i}`);
  const NGOAI_GHIM = ['xirr', 'beta', 'gia-muc-tieu'];
  const KNOWN = new Set([...GHIM, ...NGOAI_GHIM]);

  function xep(usage: ReadonlyArray<FormulaUsage>, slots?: number): string[] {
    return rankFeaturedIds({ pinnedIds: GHIM, usage, knownIds: KNOWN, now: NOW, slots });
  }

  it('chưa có lịch sử thì trùng khít thứ tự ghim', () => {
    expect(xep([])).toEqual([...GHIM]);
  });

  it('mọi mục dưới ngưỡng thì cũng trùng khít — bấm nhầm một lần không xáo trang chủ', () => {
    expect(xep([entry('ghim-9', 1), entry('xirr', 1)])).toEqual([...GHIM]);
  });

  it('một ghim dùng nhiều thì lên đầu, khối vẫn đủ 18 và không trùng id', () => {
    const ket = xep([entry('ghim-9', 5)]);
    expect(ket[0]).toBe('ghim-9');
    expect(ket).toHaveLength(GHIM.length);
    expect(new Set(ket).size).toBe(ket.length);
    // Chỉ đổi chỗ trong nội bộ 18, không đẩy ai ra.
    expect([...ket].sort()).toEqual([...GHIM].sort());
  });

  it('một công thức NGOÀI ghim dùng nhiều thì chèn lên đầu và ghim cuối rơi ra', () => {
    const ket = xep([entry('xirr', 5)]);
    expect(ket[0]).toBe('xirr');
    expect(ket).toHaveLength(GHIM.length);
    expect(ket).not.toContain('ghim-17');
    expect(ket).toContain('ghim-16');
  });

  it('nhiều ứng viên hơn số suất thì chỉ lấy đủ suất, phần ghim còn nguyên', () => {
    const usage = Array.from({ length: 8 }, (_, i) => entry(`ghim-${i}`, 9 - i));
    const ket = xep(usage);
    expect(ket.slice(0, PERSONAL_SLOTS)).toEqual([
      'ghim-0',
      'ghim-1',
      'ghim-2',
      'ghim-3',
      'ghim-4',
      'ghim-5',
    ]);
    expect(ket).toHaveLength(GHIM.length);
  });

  it('xấu nhất — cả 6 suất đều ngoài ghim thì vẫn còn 12 ghim tay', () => {
    const usage = [
      ...NGOAI_GHIM.map((id) => entry(id, 9)),
      ...NGOAI_GHIM.map((id) => entry(`${id}-2`, 9)),
    ];
    const rong = new Set([...KNOWN, ...NGOAI_GHIM.map((id) => `${id}-2`)]);
    const ket = rankFeaturedIds({ pinnedIds: GHIM, usage, knownIds: rong, now: NOW });
    expect(ket).toHaveLength(GHIM.length);
    expect(ket.filter((id) => GHIM.includes(id))).toHaveLength(GHIM.length - PERSONAL_SLOTS);
  });

  it('id không có trong Registry thì bỏ qua, thứ tự giữ nguyên', () => {
    expect(xep([entry('cong-thuc-da-xoa', 50)])).toEqual([...GHIM]);
  });

  it('hoà điểm thì phá hoà tất định: mốc gần hơn trước, rồi tới thứ tự ghim', () => {
    const usage = [entry('ghim-5', 4), entry('ghim-2', 4, NGAY), entry('ghim-8', 4, NGAY)];
    expect(xep(usage).slice(0, 3)).toEqual(['ghim-5', 'ghim-2', 'ghim-8']);
  });

  it('danh sách ghim rỗng thì trả rỗng', () => {
    expect(
      rankFeaturedIds({ pinnedIds: [], usage: [entry('xirr', 9)], knownIds: KNOWN, now: NOW }),
    ).toEqual([]);
  });

  it('bất biến: mọi tổ hợp đầu vào đều cho đúng 18 ô, đôi một khác nhau', () => {
    const ung_vien = [...GHIM, ...NGOAI_GHIM, 'khong-co-that'];
    // Quét tất định (không random): mỗi vòng lấy một lát khác nhau của tập ứng viên.
    for (let i = 0; i < ung_vien.length; i += 1) {
      const usage = ung_vien
        .slice(i)
        .map((id, j) => entry(id, ((i + j) % 9) + 1, (j % 4) * USAGE_HALF_LIFE_MS));
      const ket = xep(usage);
      expect(ket).toHaveLength(GHIM.length);
      expect(new Set(ket).size).toBe(ket.length);
    }
  });
});

describe('sameOrder()', () => {
  it('trùng khít thì đúng', () => {
    expect(sameOrder(['a', 'b'], ['a', 'b'])).toBe(true);
  });

  it('khác thứ tự hoặc khác độ dài thì sai', () => {
    expect(sameOrder(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(sameOrder(['a'], ['a', 'b'])).toBe(false);
  });
});
