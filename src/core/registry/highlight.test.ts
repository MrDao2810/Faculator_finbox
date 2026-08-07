import { describe, expect, it } from 'vitest';

import { highlightParts, highlightRanges } from './highlight';

/** Ghép các mẩu đã cắt lại — dùng để chắc không mẩu chữ nào rơi mất. */
function rejoin(text: string, query: string): string {
  return highlightParts(text, query)
    .map((part) => part.text)
    .join('');
}

/** Riêng phần được tô, nối bằng '|' cho dễ đọc kỳ vọng. */
function hits(text: string, query: string): string {
  return highlightParts(text, query)
    .filter((part) => part.hit)
    .map((part) => part.text)
    .join('|');
}

describe('highlightRanges — tô đúng đoạn khớp trên chuỗi GỐC', () => {
  it('gõ không dấu vẫn tô đúng chữ có dấu', () => {
    expect(hits('Định giá', 'dinh')).toBe('Định');
  });

  it('chỉ số trả về đúng của chuỗi gốc, không phải của chuỗi đã bỏ dấu', () => {
    // 'Định giá' — 'Định' là 4 ký tự gốc dù bỏ dấu cũng vẫn 4; ca thật nằm ở chữ sau khoảng trắng.
    expect(highlightRanges('Định giá', 'gia')).toEqual([{ start: 5, end: 8 }]);
    expect('Định giá'.slice(5, 8)).toBe('giá');
  });

  it('nhiều từ khoá thì tô nhiều đoạn, đúng thứ tự trong chuỗi', () => {
    expect(hits('ROI — tỷ suất lợi nhuận', 'ty loi')).toBe('tỷ|lợi');
  });

  it('khớp theo tiền tố, tô đúng phần tiền tố chứ không tô cả từ', () => {
    expect(hits('Định giá', 'gi')).toBe('gi');
  });

  it('hai từ khoá cùng khớp một từ thì lấy đoạn dài nhất', () => {
    expect(hits('Định giá', 'd dinh')).toBe('Định');
  });

  it('chữ đ hoa và thường đều ra chữ d', () => {
    expect(hits('Đòn bẩy tài chính', 'don')).toBe('Đòn');
  });

  it('KHÔNG tô khi từ khoá nằm giữa từ — cùng luật với scoreFormula', () => {
    // 'oi' nằm giữa 'ROI' nên không phải tiền tố của từ nào.
    expect(highlightRanges('ROI', 'oi')).toEqual([]);
  });

  it('dấu ngăn cắt từ giống tokenize, nên "p e" tô được cả hai vế của "P/E"', () => {
    expect(hits('P/E — hệ số giá trên lợi nhuận', 'p e')).toBe('P|E');
  });

  it('chuỗi rỗng hoặc từ khoá rỗng thì không tô gì, không ném lỗi', () => {
    expect(highlightRanges('', 'roi')).toEqual([]);
    expect(highlightRanges('ROI', '')).toEqual([]);
    expect(highlightRanges('ROI', '   ')).toEqual([]);
    expect(highlightRanges('ROI', '///')).toEqual([]);
  });

  it('từ khoá dài hơn cả từ đích thì không tô, không cắt lố chuỗi', () => {
    expect(highlightRanges('ROI', 'roinhuan')).toEqual([]);
  });

  it('đoạn trả về luôn tăng dần và không chồng nhau', () => {
    const ranges = highlightRanges('lợi nhuận ròng sau phí và thuế', 'l n r s p v t');
    for (let i = 1; i < ranges.length; i += 1) {
      const previous = ranges[i - 1];
      const current = ranges[i];
      expect(previous).toBeDefined();
      expect(current).toBeDefined();
      expect(current?.start).toBeGreaterThan(previous?.end ?? 0);
    }
  });
});

describe('highlightParts — cắt chuỗi cho giao diện', () => {
  it('ghép các mẩu lại phải ra đúng chuỗi ban đầu', () => {
    const cases: ReadonlyArray<[string, string]> = [
      ['Định giá', 'dinh'],
      ['P/E — hệ số giá trên lợi nhuận', 'p e'],
      ['ROI — tỷ suất lợi nhuận', 'ty loi'],
      ['Lãi kép', 'khong khop gi'],
      ['Đòn bẩy tài chính', 'don bay tai chinh'],
    ];

    for (const [text, query] of cases) {
      expect(rejoin(text, query), `${text} / ${query}`).toBe(text);
    }
  });

  it('không khớp gì thì trả đúng một mẩu không tô', () => {
    expect(highlightParts('Lãi kép', 'roi')).toEqual([{ text: 'Lãi kép', hit: false }]);
  });

  it('chuỗi rỗng trả mảng rỗng chứ không phải một mẩu rỗng', () => {
    expect(highlightParts('', 'roi')).toEqual([]);
  });

  it('khớp ngay từ đầu chuỗi thì không sinh mẩu rỗng ở trước', () => {
    const parts = highlightParts('Định giá', 'dinh');
    expect(parts[0]).toEqual({ text: 'Định', hit: true });
    expect(parts.every((part) => part.text !== '')).toBe(true);
  });
});
