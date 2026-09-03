import { describe, expect, it } from 'vitest';

import { PRESET_CONTRACT_VERSION } from '@/data';

import { isTickerCode, parseActiveTicker, serializeActiveTicker } from './active-ticker';
import type { ActiveTicker } from './active-ticker';

function active(patch: Record<string, unknown> = {}): ActiveTicker {
  return {
    code: 'HPG',
    preset: {
      version: PRESET_CONTRACT_VERSION,
      code: 'HPG',
      name: 'Tập đoàn Hoà Phát',
      meta: 'BCTC Q2/2026 · thị giá phiên gần nhất',
      fundamentals: {
        eps: 2_000,
        bookValuePerShare: 18_000,
        sharesOutstanding: 6_400_000_000,
        dividendPerShare: 500,
        netIncome: 12_800,
        equity: 115_200,
        period: 'BCTC Q2/2026',
      },
      bars: [
        { date: '2026-08-21', open: null, high: null, low: null, close: 25_000, volume: null },
      ],
      isDraft: false,
      fundamentalsAsOf: '2026-08-21',
      ...patch,
    },
  };
}

describe('isTickerCode', () => {
  it('nhận mã thật, kể cả mã 8 ký tự của quỹ ETF', () => {
    expect(isTickerCode('HPG')).toBe(true);
    expect(isTickerCode('e1vfvn30')).toBe(true);
  });

  it('từ chối thứ không phải mã — chặn trước khi đem đi gọi mạng', () => {
    expect(isTickerCode('')).toBe(false);
    expect(isTickerCode('AB')).toBe(false);
    expect(isTickerCode('HPG; DROP')).toBe(false);
    expect(isTickerCode('../../etc')).toBe(false);
  });
});

describe('parseActiveTicker', () => {
  it('đọc lại đúng thứ đã ghi', () => {
    const stored = active();
    expect(parseActiveTicker(serializeActiveTicker(stored))).toEqual(stored);
  });

  it('chưa có gì hoặc chuỗi hỏng thì trả null, không ném', () => {
    expect(parseActiveTicker(null)).toBeNull();
    expect(parseActiveTicker(undefined)).toBeNull();
    expect(parseActiveTicker('  ')).toBeNull();
    expect(parseActiveTicker('{[')).toBeNull();
    expect(parseActiveTicker('[]')).toBeNull();
    expect(parseActiveTicker('{"code":"HPG"}')).toBeNull();
  });

  it('mã sai dạng thì bỏ cả bản cất', () => {
    const raw = JSON.stringify({ ...active(), code: 'không phải mã' });
    expect(parseActiveTicker(raw)).toBeNull();
  });

  it('viết hoa mã gõ thường', () => {
    const stored = active({ code: 'hpg' });
    const raw = JSON.stringify({ code: 'hpg', preset: stored.preset });
    expect(parseActiveTicker(raw)?.code).toBe('HPG');
  });

  /*
   * Hai mã lệch nhau là bản cất đã hỏng. Nạp vào sẽ điền số của mã này dưới tên mã kia — sai
   * kiểu tệ nhất, vì mọi con số trên màn vẫn trông hoàn toàn hợp lý.
   */
  it('mã ngoài và mã trong preset lệch nhau thì bỏ', () => {
    const raw = JSON.stringify({ code: 'FPT', preset: active().preset });
    expect(parseActiveTicker(raw)).toBeNull();
  });

  it('thiếu một trường số liệu cơ bản thì bỏ cả bản cất, KHÔNG điền 0 (FR-06)', () => {
    for (const missing of [
      'eps',
      'bookValuePerShare',
      'sharesOutstanding',
      'dividendPerShare',
      'netIncome',
      'equity',
    ]) {
      const stored = active();
      const fundamentals: Record<string, unknown> = { ...stored.preset.fundamentals };
      delete fundamentals[missing];

      const raw = JSON.stringify({ code: 'HPG', preset: { ...stored.preset, fundamentals } });
      expect(parseActiveTicker(raw), `thiếu ${missing}`).toBeNull();
    }
  });

  it('không có số liệu cơ bản thì bỏ — preset ấy không điền được ô nào', () => {
    const raw = JSON.stringify({ code: 'HPG', preset: { ...active().preset, fundamentals: null } });
    expect(parseActiveTicker(raw)).toBeNull();
  });

  it('bỏ phiên thiếu giá đóng thay vì để giá 0 lọt vào phép chia', () => {
    const raw = JSON.stringify({
      code: 'HPG',
      preset: {
        ...active().preset,
        bars: [
          { date: '2026-08-20', close: 0 },
          { date: '2026-08-21', close: 25_000 },
          { date: '2026-08-22', close: 'nhiều' },
        ],
      },
    });

    const parsed = parseActiveTicker(raw);
    expect(parsed?.preset.bars).toHaveLength(1);
    expect(parsed?.preset.bars[0]?.close).toBe(25_000);
  });

  it('giữ nguyên null ở mở/cao/thấp/khối lượng — API chỉ trả giá đóng', () => {
    const parsed = parseActiveTicker(serializeActiveTicker(active()));
    expect(parsed?.preset.bars[0]?.open).toBeNull();
    expect(parsed?.preset.bars[0]?.volume).toBeNull();
  });

  /* Nhãn BẢN THẢO được phép thừa ra chứ không được phép thiếu. */
  it('giữ cờ bản thảo khi bản cất có, và mặc định là false', () => {
    const draft = JSON.stringify({ code: 'HPG', preset: { ...active().preset, isDraft: true } });
    expect(parseActiveTicker(draft)?.preset.isDraft).toBe(true);

    const noFlag = JSON.stringify({ code: 'HPG', preset: { ...active().preset, isDraft: 'ừ' } });
    expect(parseActiveTicker(noFlag)?.preset.isDraft).toBe(false);
  });

  it('không có ngày đối chiếu thì bỏ hẳn trường, không để chuỗi rỗng', () => {
    const raw = JSON.stringify({
      code: 'HPG',
      preset: { ...active().preset, fundamentalsAsOf: '   ' },
    });
    expect(parseActiveTicker(raw)?.preset).not.toHaveProperty('fundamentalsAsOf');
  });
});
