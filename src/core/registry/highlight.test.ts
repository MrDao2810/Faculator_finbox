import { describe, expect, it } from 'vitest';

import { descriptionHitParts, highlightParts, highlightRanges } from './highlight';
import type { FormulaSummary } from './types';

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

  it('tô CẢ CỤM đã gõ, không tô từng từ rời', () => {
    expect(hits('ROI — tỷ suất lợi nhuận', 'ty suat')).toBe('tỷ suất');
    // Hai từ không đứng liền nhau trong chuỗi thì không phải cụm — cùng luật với matchFormula.
    expect(hits('ROI — tỷ suất lợi nhuận', 'ty loi')).toBe('');
  });

  it('cụm xuất hiện nhiều lần thì tô từng lần, đúng thứ tự', () => {
    expect(hits('Chênh lệch giữa SMA ngắn hạn và SMA dài hạn', 'sma')).toBe('SMA|SMA');
  });

  it('từ cuối dài từ 3 ký tự thì khớp dở, tô đúng phần đã gõ chứ không tô cả từ', () => {
    expect(hits('Dải Bollinger trên', 'bolli')).toBe('Bolli');
    // Ngắn hơn thì phải khớp trọn từ: "gi" không tô "giá".
    expect(hits('Định giá', 'gi')).toBe('');
  });

  it('ký hiệu đã gõ phải có mặt và dính liền như lúc gõ', () => {
    expect(hits('%B — vị trí giá trong dải Bollinger', '%b')).toBe('%B');
    expect(hits('0% là dải dưới, 100% bám dải trên', '%b')).toBe('');
  });

  it('chữ đ hoa và thường đều ra chữ d', () => {
    expect(hits('Đòn bẩy tài chính', 'don')).toBe('Đòn');
  });

  it('KHÔNG tô khi từ khoá nằm giữa từ — cùng luật với matchFormula', () => {
    // 'oi' nằm giữa 'ROI' nên không phải tiền tố của từ nào.
    expect(highlightRanges('ROI', 'oi')).toEqual([]);
  });

  it('ký hiệu không gõ thì bước qua, nên "p e" tô trọn "P/E"', () => {
    expect(hits('P/E — hệ số giá trên lợi nhuận', 'p e')).toBe('P/E');
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
    const ranges = highlightRanges('phí mua, phí bán và phí lưu ký', 'phi');
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

describe('descriptionHitParts — chỉ khớp phụ mới tô vàng mô tả', () => {
  const MUC_TIEU: FormulaSummary = {
    id: 'gia-muc-tieu',
    categoryId: 'valuation',
    name: { vi: 'Giá mục tiêu', en: 'Target price' },
    description: {
      vi: 'Mức giá kỳ vọng nếu thị trường định giá cổ phiếu theo đúng P/E mục tiêu đã chọn.',
      en: 'The expected price if the market values the stock at the chosen target P/E.',
    },
    level: 'basic',
    tags: ['gia muc tieu'],
  };

  it('khớp phụ: trả các mẩu, tô đúng cụm trong mô tả', () => {
    const parts = descriptionHitParts(MUC_TIEU, 'p/e', 'vi');
    expect(parts?.filter((part) => part.hit).map((part) => part.text)).toEqual(['P/E']);
    expect(parts?.map((part) => part.text).join('')).toBe(MUC_TIEU.description.vi);
  });

  it('khớp chính thì KHÔNG tô gì, kể cả khi mô tả cũng có cụm ấy', () => {
    expect(descriptionHitParts(MUC_TIEU, 'muc tieu', 'vi')).toBeNull();
  });

  it('không khớp thì không tô', () => {
    expect(descriptionHitParts(MUC_TIEU, 'lai kep', 'vi')).toBeNull();
  });

  it('tô theo mô tả của ngôn ngữ đang hiện', () => {
    const parts = descriptionHitParts(MUC_TIEU, 'expected price', 'en');
    expect(parts?.filter((part) => part.hit).map((part) => part.text)).toEqual(['expected price']);
    expect(descriptionHitParts(MUC_TIEU, 'expected price', 'vi')).toBeNull();
  });
});
