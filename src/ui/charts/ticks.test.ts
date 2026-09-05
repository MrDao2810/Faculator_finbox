/**
 * Hai phép xử lý nhãn vạch dùng chung cho `LineChart` và `WaterfallChart`.
 *
 * Test ở môi trường `node` chứ không `jsdom`, và đó là chủ ý: cả `ticks.ts` lẫn file này thuần số
 * học trên hằng số `viewBox`, không đọc DOM. Đây cũng là lý do phải có nó — jsdom trả `0` cho
 * `getBBox()`, nên bề ngang chữ THẬT chỉ đo được ở `npm run check:chrome`; ở đây chốt phần luật
 * đặt nhãn, thứ duy nhất chạy được trên CI.
 */

import { describe, expect, it } from 'vitest';

import { floatingLabel, textWidth, thin, tickAnchor } from './ticks';

/** Khung của `LineChart`, chép sang để ca kiểm đọc ra cùng những con số như lúc vẽ. */
const W = 320;
/** Cỡ chữ của `.hoverLabel` / `.markerLabel`. */
const FONT = 11;

describe('textWidth()', () => {
  it('khớp mốc đo Chrome đứng sau HALF_LABEL — 4,9 đơn vị mỗi ký tự ở cỡ 10px', () => {
    expect(textWidth('15.000', 10)).toBeCloseTo(29.4, 5);
  });

  it('chuỗi rỗng không chiếm chỗ', () => {
    expect(textWidth('', FONT)).toBe(0);
  });
});

describe('tickAnchor()', () => {
  it('lật nhãn vào trong ở hai mép, giữ canh giữa ở khoảng giữa', () => {
    expect(tickAnchor(2, W)).toBe('start');
    expect(tickAnchor(160, W)).toBe('middle');
    expect(tickAnchor(310, W)).toBe('end');
  });
});

describe('thin()', () => {
  const ticks = Array.from({ length: 9 }, (_, i) => ({ value: i, label: String(i) }));

  it('luôn giữ vạch đầu và vạch cuối', () => {
    const kept = thin(ticks, 3);

    expect(kept[0]?.value).toBe(0);
    expect(kept[kept.length - 1]?.value).toBe(8);
  });

  it('ít hơn ngưỡng thì trả nguyên, không cắt oan', () => {
    expect(thin(ticks.slice(0, 2), 5)).toHaveLength(2);
  });
});

describe('floatingLabel()', () => {
  /** Mép trái thật của nhãn, theo đúng cách trình duyệt diễn giải `text-anchor`. */
  function mepTrai(place: { x: number; anchor: 'start' | 'end' }, text: string): number {
    return place.anchor === 'end' ? place.x - textWidth(text, FONT) : place.x;
  }

  it('nhãn vừa chỗ thì KHÔNG xê dịch — luật cũ giữ nguyên từng đơn vị', () => {
    expect(floatingLabel(250, 'end', '0 lần', FONT, W)).toEqual({ x: 244, anchor: 'end' });
    expect(floatingLabel(70, 'start', '0 lần', FONT, W)).toEqual({ x: 76, anchor: 'start' });
  });

  /*
   * Chỗ hỏng đã báo: nhãn vạch dò ghép hai chuỗi đã kèm đơn vị, canh `end` ở nửa phải hình, nên
   * phần ĐẦU chạy qua mép trái rồi bị `<svg>` cắt — trên màn chỉ còn đúng một mẩu `'ần'`.
   */
  it('nhãn dài canh phải không được thò qua mép trái', () => {
    const text = '16.000.000.000.000 ₫ · 0,000001 lần';
    const place = floatingLabel(170, 'end', text, FONT, W);

    expect(mepTrai(place, text)).toBeGreaterThanOrEqual(0);
    expect(mepTrai(place, text) + textWidth(text, FONT)).toBeLessThanOrEqual(W);
  });

  it('nhãn dài canh trái không được thò qua mép phải', () => {
    const text = '16.000.000.000.000 ₫ · 0,000001 lần';
    const place = floatingLabel(150, 'start', text, FONT, W);

    expect(mepTrai(place, text)).toBeGreaterThanOrEqual(0);
    expect(mepTrai(place, text) + textWidth(text, FONT)).toBeLessThanOrEqual(W);
  });

  it('lật sang bên kia trước khi kẹp — nhãn vẫn dính vạch nếu bên đó còn chỗ', () => {
    const text = '1.234.567.890 ₫ · 12,34 lần';
    // Vạch sát mép phải: bên phải hết chỗ, bên trái vẫn thừa.
    expect(floatingLabel(300, 'start', text, FONT, W).anchor).toBe('end');
    // Vạch sát mép trái: ngược lại.
    expect(floatingLabel(20, 'end', text, FONT, W).anchor).toBe('start');
  });

  it('chuỗi dài hơn cả khung thì giữ ĐẦU chuỗi — mất đuôi còn đọc được, mất đầu thì không', () => {
    const text = 'x'.repeat(200);

    expect(floatingLabel(250, 'end', text, FONT, W)).toEqual({ x: 0, anchor: 'start' });
  });
});
