import { describe, expect, it } from 'vitest';

import {
  INPUT_DRAFT_TTL_MS,
  MAX_DRAFTS,
  draftFor,
  parseInputDrafts,
  putDraft,
  removeDraft,
  serializeInputDrafts,
} from './input-draft-store';
import type { InputDraft } from './input-draft-store';

/** Mốc cố định cho mọi ca — không ca nào được gọi `Date.now()`. */
const NOW = 1_760_000_000_000;
const NGAY = 24 * 60 * 60 * 1000;

function draft(id: string, inputs: Record<string, number>, ageMs = 0, code: string | null = null) {
  return { id, inputs, code, at: NOW - ageMs };
}

describe('parseInputDrafts() — chịu được mọi thứ trong localStorage', () => {
  it('chuỗi rỗng, null, undefined đều ra mảng rỗng chứ không ném', () => {
    expect(parseInputDrafts(null, NOW)).toEqual([]);
    expect(parseInputDrafts(undefined, NOW)).toEqual([]);
    expect(parseInputDrafts('   ', NOW)).toEqual([]);
  });

  it('JSON hỏng hoặc không phải mảng thì ra mảng rỗng', () => {
    expect(parseInputDrafts('{{{', NOW)).toEqual([]);
    expect(parseInputDrafts('{"id":"pe"}', NOW)).toEqual([]);
    expect(parseInputDrafts('"pe"', NOW)).toEqual([]);
  });

  it('đọc lại đúng thứ vừa ghi ra', () => {
    const list = [draft('pe', { price: 92_000, eps: 6_050 }, 0, 'VCB')];
    expect(parseInputDrafts(serializeInputDrafts(list), NOW)).toEqual(list);
  });

  it('bỏ phần tử rác nhưng GIỮ phần tử lành trong cùng mảng', () => {
    const raw = JSON.stringify([
      null,
      'pe',
      { id: 'KHÔNG-PHẢI-SLUG', inputs: { a: 1 }, at: NOW },
      { id: 'pe', inputs: { price: 1 }, at: 0 },
      { id: 'wacc', inputs: { taxRate: 0.2 }, code: null, at: NOW },
    ]);
    expect(parseInputDrafts(raw, NOW).map((d) => d.id)).toEqual(['wacc']);
  });

  it('bỏ ô mang NaN hay Infinity — hai giá trị FR-06 cấm bày ra màn', () => {
    // JSON không mã hoá được chúng, nên chúng chỉ tới đây qua bàn tay sửa DevTools.
    const raw = '[{"id":"pe","inputs":{"price":1e999,"eps":6050},"code":null,"at":' + NOW + '}]';
    const [first] = parseInputDrafts(raw, NOW);
    expect(first?.inputs).toEqual({ eps: 6050 });
  });

  it('bộ ô rỗng sau khi làm sạch thì bỏ cả mục — nó không mang tin gì', () => {
    const raw = JSON.stringify([{ id: 'pe', inputs: { 'không-hợp-lệ': 1 }, at: NOW }]);
    expect(parseInputDrafts(raw, NOW)).toEqual([]);
  });

  it('mã sai dạng thì bỏ RIÊNG mã, giữ nguyên bộ số', () => {
    const raw = JSON.stringify([{ id: 'pe', inputs: { price: 1 }, code: 'mã bậy', at: NOW }]);
    const [first] = parseInputDrafts(raw, NOW);
    expect(first?.code).toBeNull();
    expect(first?.inputs).toEqual({ price: 1 });
  });

  it('bỏ mục quá hạn, giữ mục còn hạn', () => {
    const raw = serializeInputDrafts([
      draft('pe', { price: 1 }, 8 * NGAY),
      draft('wacc', { taxRate: 0.2 }, 6 * NGAY),
    ]);
    expect(parseInputDrafts(raw, NOW).map((d) => d.id)).toEqual(['wacc']);
  });

  it('đúng mốc hạn thì vẫn giữ; quá một mili giây là bỏ', () => {
    const vua = serializeInputDrafts([draft('pe', { price: 1 }, INPUT_DRAFT_TTL_MS)]);
    const qua = serializeInputDrafts([draft('pe', { price: 1 }, INPUT_DRAFT_TTL_MS + 1)]);
    expect(parseInputDrafts(vua, NOW)).toHaveLength(1);
    expect(parseInputDrafts(qua, NOW)).toHaveLength(0);
  });

  it('mốc ở tương lai (đồng hồ máy chạy trước) KHÔNG bị coi là quá hạn', () => {
    const raw = serializeInputDrafts([draft('pe', { price: 1 }, -400 * NGAY)]);
    expect(parseInputDrafts(raw, NOW)).toHaveLength(1);
  });

  it('chống trùng id, phòng bản cũ ghi lỗi', () => {
    const raw = JSON.stringify([
      { id: 'pe', inputs: { price: 1 }, code: null, at: NOW },
      { id: 'pe', inputs: { price: 2 }, code: null, at: NOW },
    ]);
    const list = parseInputDrafts(raw, NOW);
    expect(list).toHaveLength(1);
    expect(list[0]?.inputs).toEqual({ price: 1 });
  });
});

describe('putDraft()', () => {
  it('id mới thì vào kho, đứng đầu', () => {
    const list = putDraft([], 'pe', { price: 92_000 }, null, NOW);
    expect(list).toEqual([{ id: 'pe', inputs: { price: 92_000 }, code: null, at: NOW }]);
  });

  it('ghi lại cùng id thì THAY chứ không thêm mục thứ hai', () => {
    const truoc = putDraft([], 'pe', { price: 1 }, null, NOW - 1000);
    const sau = putDraft(truoc, 'pe', { price: 2 }, null, NOW);
    expect(sau).toHaveLength(1);
    expect(sau[0]?.inputs).toEqual({ price: 2 });
    expect(sau[0]?.at).toBe(NOW);
  });

  it('giữ mã đang nạp lúc ghi — khoá để bản nháp thắng lại đường ?ma=', () => {
    expect(putDraft([], 'pe', { price: 1 }, 'VCB', NOW)[0]?.code).toBe('VCB');
  });

  it('mã sai dạng thì cất `null`, không cất chuỗi bậy', () => {
    expect(putDraft([], 'pe', { price: 1 }, 'vcb thường', NOW)[0]?.code).toBeNull();
  });

  it('đầu vào không dùng được thì trả kho nguyên vẹn, không ghi hỏng', () => {
    const goc: InputDraft[] = [draft('pe', { price: 1 })];
    expect(putDraft(goc, 'pe', { price: 2 }, null, Number.NaN)).toEqual(goc);
    expect(putDraft(goc, 'KHÔNG-PHẢI-SLUG', { price: 2 }, null, NOW)).toEqual(goc);
    // Bộ số rỗng: không có gì để cất, nhưng cũng không được xoá thứ đang có.
    expect(putDraft(goc, 'pe', {}, null, NOW)).toEqual(goc);
  });

  it('đầy kho thì đuổi mục CŨ NHẤT, không đuổi mục vừa ghi', () => {
    let list: InputDraft[] = [];
    for (let i = 0; i < MAX_DRAFTS; i += 1) {
      // Mục i càng lớn càng mới.
      list = putDraft(list, `ct-${String(i)}`, { a: i }, null, NOW - (MAX_DRAFTS - i) * 1000);
    }
    expect(list).toHaveLength(MAX_DRAFTS);

    const sau = putDraft(list, 'moi-tinh', { a: 999 }, null, NOW);
    expect(sau).toHaveLength(MAX_DRAFTS);
    expect(sau[0]?.id).toBe('moi-tinh');
    // 'ct-0' là mục cũ nhất — đúng mục phải rơi ra.
    expect(sau.some((d) => d.id === 'ct-0')).toBe(false);
  });
});

describe('draftFor() và removeDraft()', () => {
  const KHO = [draft('pe', { price: 1 }, 0, 'VCB'), draft('wacc', { taxRate: 0.2 })];

  it('tra được đúng công thức, kèm cả mã', () => {
    expect(draftFor(KHO, 'pe')?.inputs).toEqual({ price: 1 });
    expect(draftFor(KHO, 'pe')?.code).toBe('VCB');
  });

  it('công thức chưa có bản nháp thì trả null, không trả bộ rỗng', () => {
    expect(draftFor(KHO, 'roe')).toBeNull();
  });

  it('xoá đúng một mục, giữ nguyên phần còn lại', () => {
    expect(removeDraft(KHO, 'pe').map((d) => d.id)).toEqual(['wacc']);
  });

  it('xoá mục không tồn tại thì kho không đổi', () => {
    expect(removeDraft(KHO, 'roe')).toHaveLength(2);
  });
});

describe('serializeInputDrafts()', () => {
  it('cắt đúng trần khi kho quá dài', () => {
    const dai = Array.from({ length: MAX_DRAFTS + 10 }, (_, i) =>
      draft(`ct-${String(i)}`, { a: i }),
    );
    expect(JSON.parse(serializeInputDrafts(dai))).toHaveLength(MAX_DRAFTS);
  });

  it('đi vòng ghi → đọc giữ nguyên kho', () => {
    const kho = [draft('pe', { price: 92_000, eps: 6_050 }, 0, 'VCB'), draft('wacc', { t: 0.2 })];
    expect(parseInputDrafts(serializeInputDrafts(kho), NOW)).toEqual(kho);
  });
});
