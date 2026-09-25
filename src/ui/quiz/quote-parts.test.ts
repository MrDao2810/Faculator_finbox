import { describe, expect, it } from 'vitest';

import { quoteParts } from './quote-parts';

describe('tách đoạn trích khỏi lời giải thích', () => {
  it('chữ thường không có ngoặc kép thì trả nguyên một mảnh', () => {
    expect(quoteParts('Không có trích dẫn nào.')).toEqual([
      { text: 'Không có trích dẫn nào.', quoted: false },
    ]);
  });

  it('tách đúng phần trong ngoặc kép', () => {
    expect(quoteParts('Damodaran nói: “book value is an opinion” — không phải sự thật.')).toEqual([
      { text: 'Damodaran nói: ', quoted: false },
      { text: 'book value is an opinion', quoted: true },
      { text: ' — không phải sự thật.', quoted: false },
    ]);
  });

  it('nhiều đoạn trích trong một câu', () => {
    const parts = quoteParts('A “một” B “hai” C');
    expect(parts.filter((p) => p.quoted).map((p) => p.text)).toEqual(['một', 'hai']);
  });

  it('ngoặc mở mà thiếu ngoặc đóng thì coi phần còn lại là chữ thường, không nuốt mất chữ', () => {
    const parts = quoteParts('Nguồn ghi “thiếu đóng ngoặc');
    expect(parts.map((p) => p.text).join('')).toBe('Nguồn ghi “thiếu đóng ngoặc');
    expect(parts.every((p) => !p.quoted)).toBe(true);
  });

  it('chuỗi rỗng cho mảng rỗng', () => {
    expect(quoteParts('')).toEqual([]);
  });
});
