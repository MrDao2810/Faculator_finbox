import { describe, expect, it } from 'vitest';

import { segmentExpression, segmentExpressionLines } from './expression-segments';

/** Luật tách dòng chữ thành điểm chạm — xem docblock `expression-segments.ts`. */
describe('segmentExpression()', () => {
  const SHARPE =
    'Tỷ số Sharpe = (Lợi suất bình quân một phiên − Lãi suất phi rủi ro một phiên) ÷ Độ lệch chuẩn lợi suất phiên × căn bậc hai của Số phiên trong một năm';

  it('đánh dấu đúng cụm, và ghép các đoạn lại ra nguyên dòng chữ', () => {
    const doan = segmentExpression(SHARPE, [
      { sym: 1, phrase: 'Lợi suất bình quân một phiên' },
      { sym: 3, phrase: 'Độ lệch chuẩn lợi suất phiên' },
    ]);
    expect(doan.map((d) => d.text).join('')).toBe(SHARPE);
    expect(doan.filter((d) => d.sym !== undefined)).toEqual([
      { text: 'Lợi suất bình quân một phiên', sym: 1 },
      { text: 'Độ lệch chuẩn lợi suất phiên', sym: 3 },
    ]);
  });

  it('không có cụm nào thì trả một đoạn chữ thường', () => {
    expect(segmentExpression(SHARPE, [])).toEqual([{ text: SHARPE }]);
  });

  it('mọi chỗ xuất hiện của cụm đều thành điểm chạm', () => {
    const doan = segmentExpression('A = P × i + P', [{ sym: 1, phrase: 'P' }]);
    expect(doan.filter((d) => d.sym === 1)).toHaveLength(2);
  });

  it('chỉ khớp ở ranh giới từ — chữ có dấu tiếng Việt cũng là chữ', () => {
    // "phiên" nằm trong "phiênđ" (không có ranh giới) thì không khớp.
    expect(() => segmentExpression('x = phiênđ', [{ sym: 1, phrase: 'phiên' }])).toThrow(
      /không thấy/,
    );
    expect(segmentExpression('x = phiên đ', [{ sym: 1, phrase: 'phiên' }])).toHaveLength(3);
  });

  it('cụm không có trong dòng chữ thì ném lỗi, không lặng lẽ bỏ qua', () => {
    expect(() => segmentExpression(SHARPE, [{ sym: 2, phrase: 'Beta' }])).toThrow(/không thấy/);
  });

  it('cụm của hai ký hiệu chồng lên nhau thì ném lỗi', () => {
    expect(() =>
      segmentExpression(SHARPE, [
        { sym: 4, phrase: 'căn bậc hai của Số phiên trong một năm' },
        { sym: 5, phrase: 'Số phiên trong một năm' },
      ]),
    ).toThrow(/chồng/);
  });
});

/**
 * Hình nhiều vế thì dòng chữ nhiều dòng (luật 6, 18/09/2026) — cắt dòng trước, tìm cụm sau.
 */
describe('segmentExpressionLines()', () => {
  const HAI_VE = 'A = B ÷ C\nC = D × E';

  it('cắt đúng số dòng, ghép lại ra nguyên khối chữ ban đầu', () => {
    const dong = segmentExpressionLines(HAI_VE, [{ sym: 1, phrase: 'D' }]);
    expect(dong).toHaveLength(2);
    expect(dong.map((d) => d.map((s) => s.text).join('')).join('\n')).toBe(HAI_VE);
  });

  it('cụm chỉ có ở dòng sau vẫn tính là tìm thấy — không đòi đủ cụm ở MỖI dòng', () => {
    const dong = segmentExpressionLines(HAI_VE, [{ sym: 2, phrase: 'E' }]);
    expect(dong[0]?.some((s) => s.sym !== undefined)).toBe(false);
    expect(dong[1]?.filter((s) => s.sym === 2)).toHaveLength(1);
  });

  it('cụm không có ở dòng nào thì vẫn ném lỗi', () => {
    expect(() => segmentExpressionLines(HAI_VE, [{ sym: 3, phrase: 'Beta' }])).toThrow(
      /không thấy/,
    );
  });

  it('không đoạn nào mang ký tự xuống dòng — chỗ ngắt do cấu trúc mảng giữ', () => {
    const dong = segmentExpressionLines(HAI_VE, []);
    expect(dong.flat().every((s) => !s.text.includes('\n'))).toBe(true);
  });
});
