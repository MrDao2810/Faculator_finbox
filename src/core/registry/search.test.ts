import { describe, expect, it } from 'vitest';

import {
  countByCategoryFor,
  countBySegmentFor,
  normalizeVi,
  scoreFormula,
  searchFormulas,
  selectFormulas,
  tokenize,
} from './search';
import type { FormulaQuery, FormulaSpec } from './types';

/** Fixture tối thiểu — chỉ điền đủ trường mà tìm kiếm dùng tới. */
function make(patch: Partial<FormulaSpec> & Pick<FormulaSpec, 'id' | 'categoryId'>): FormulaSpec {
  return {
    name: { vi: patch.id, en: patch.id },
    description: '',
    latex: 'x',
    chartType: 'none',
    level: 'basic',
    tags: [],
    resultUnit: 'lần',
    variables: [],
    explanation: { meaning: 'x', whenToUse: 'x', howToRead: 'x', commonMistakes: 'x' },
    example: { title: 'x', inputs: {}, expected: 1 },
    tests: [],
    source: [],
    ...patch,
  };
}

const PE = make({
  id: 'pe',
  categoryId: 'valuation',
  name: { vi: 'Tỷ số giá trên lợi nhuận (P/E)', en: 'Price to Earnings' },
  description: 'Trả bao nhiêu đồng cho mỗi đồng lợi nhuận.',
  tags: ['boi so', 'dinh gia'],
  isFeatured: true,
});

const WACC = make({
  id: 'wacc',
  categoryId: 'valuation',
  name: { vi: 'Chi phí vốn bình quân (WACC)', en: 'Weighted Average Cost of Capital' },
  description: 'Lãi suất chiết khấu dùng cho dòng tiền doanh nghiệp.',
  tags: ['chiet khau'],
  level: 'advanced',
});

const EMI = make({
  id: 'emi',
  categoryId: 'loans',
  name: { vi: 'Trả góp niên kim', en: 'Equated Monthly Instalment' },
  description: 'Số tiền phải trả đều mỗi kỳ.',
  tags: ['vay no'],
});

const HOA_VON = make({
  id: 'gia-hoa-von',
  categoryId: 'fees-tax',
  name: { vi: 'Giá hoà vốn thực', en: 'Real break-even price' },
  description: 'Giá bán tối thiểu để không lỗ sau phí và thuế.',
  tags: ['phi', 'thue'],
  isFeatured: true,
});

const ALL = [PE, WACC, EMI, HOA_VON];

const BASE_QUERY: FormulaQuery = { q: '', segment: 'all', categoryId: null, sort: 'featured' };

describe('normalizeVi()', () => {
  it('bỏ hết dấu thanh và dấu mũ', () => {
    expect(normalizeVi('Định giá')).toBe('dinh gia');
    expect(normalizeVi('Tỷ suất cổ tức')).toBe('ty suat co tuc');
    expect(normalizeVi('Giá hoà vốn thực')).toBe('gia hoa von thuc');
  });

  it('đổi được chữ đ — NFD không tách được chữ này', () => {
    expect(normalizeVi('đòn bẩy')).toBe('don bay');
    expect(normalizeVi('Đầu tư')).toBe('dau tu');
  });

  it('giữ nguyên chuỗi vốn đã không dấu', () => {
    expect(normalizeVi('WACC')).toBe('wacc');
    expect(normalizeVi('P/E')).toBe('p/e');
  });
});

describe('tokenize()', () => {
  it('coi mọi ký tự không phải chữ số là dấu ngăn — nhờ đó "p e" khớp "P/E"', () => {
    expect(tokenize('P/E')).toEqual(['p', 'e']);
    expect(tokenize('p e')).toEqual(['p', 'e']);
    expect(tokenize('  EV/EBITDA  ')).toEqual(['ev', 'ebitda']);
  });

  it('chuỗi rỗng hay toàn dấu thì không ra từ nào', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   //  ')).toEqual([]);
  });
});

describe('searchFormulas() — NFR-USA-03, gõ không dấu vẫn ra đúng', () => {
  it('gõ không dấu ra công thức có dấu', () => {
    expect(searchFormulas(ALL, 'dinh gia').map((f) => f.id)).toContain('pe');
    expect(searchFormulas(ALL, 'gia hoa von').map((f) => f.id)).toEqual(['gia-hoa-von']);
  });

  it('gõ có dấu vẫn ra đúng', () => {
    expect(searchFormulas(ALL, 'hoà vốn').map((f) => f.id)).toEqual(['gia-hoa-von']);
  });

  it('gõ "p e" ra P/E — ca nêu đích danh trong bảng WBS', () => {
    expect(searchFormulas(ALL, 'p e')[0]?.id).toBe('pe');
  });

  it('khớp theo tiền tố nên gõ dở chừng đã có gợi ý', () => {
    expect(searchFormulas(ALL, 'nien').map((f) => f.id)).toEqual(['emi']);
    expect(searchFormulas(ALL, 'wa').map((f) => f.id)).toEqual(['wacc']);
  });

  it('tìm được cả theo tên tiếng Anh và theo từ khoá', () => {
    expect(searchFormulas(ALL, 'earnings').map((f) => f.id)).toEqual(['pe']);
    expect(searchFormulas(ALL, 'chiet khau').map((f) => f.id)).toEqual(['wacc']);
  });

  it('thiếu một từ khoá là loại — không trả kết quả nửa vời', () => {
    expect(searchFormulas(ALL, 'dinh gia khong-co-tu-nay')).toEqual([]);
  });

  it('chuỗi rỗng trả về mảng rỗng, để nơi gọi tự quyết hiện gì', () => {
    expect(searchFormulas(ALL, '')).toEqual([]);
    expect(searchFormulas(ALL, '   ')).toEqual([]);
  });

  it('khớp trọn cả từ được xếp trên khớp tiền tố', () => {
    expect(searchFormulas(ALL, 'wacc')[0]?.id).toBe('wacc');
  });

  it('cùng đầu vào luôn cho cùng thứ tự (NFR-REL-03)', () => {
    const a = searchFormulas(ALL, 'gia').map((f) => f.id);
    const b = searchFormulas(ALL, 'gia').map((f) => f.id);
    expect(a).toEqual(b);
  });
});

describe('scoreFormula()', () => {
  it('không khớp thì 0 điểm', () => {
    expect(scoreFormula(PE, tokenize('vay no'))).toBe(0);
  });

  it('từ khoá rỗng thì 0 điểm', () => {
    expect(scoreFormula(PE, [])).toBe(0);
  });

  it('công thức nổi bật được cộng điểm (FR-20)', () => {
    const featured = scoreFormula(HOA_VON, tokenize('gia'));
    const plain = scoreFormula(make({ ...HOA_VON, isFeatured: false }), tokenize('gia'));
    expect(featured).toBeGreaterThan(plain);
  });
});

describe('selectFormulas()', () => {
  it('lọc theo mảng', () => {
    const ids = selectFormulas(ALL, { ...BASE_QUERY, segment: 'personal' }).map((f) => f.id);
    expect(ids).toEqual(['emi']);
  });

  it('lọc theo nhóm', () => {
    const ids = selectFormulas(ALL, { ...BASE_QUERY, categoryId: 'valuation' }).map((f) => f.id);
    expect(ids.sort()).toEqual(['pe', 'wacc']);
  });

  it('chưa tìm gì thì công thức nổi bật lên trước, rồi tới thứ tự chữ cái', () => {
    const ids = selectFormulas(ALL, BASE_QUERY).map((f) => f.id);
    expect(ids.slice(0, 2).sort()).toEqual(['gia-hoa-von', 'pe']);
  });

  it('chọn A–Z thì thứ tự chữ cái được ưu tiên hơn độ liên quan', () => {
    const ids = selectFormulas(ALL, { ...BASE_QUERY, sort: 'az' }).map((f) => f.name.vi);
    expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b, 'vi')));
  });

  it('Z–A là đảo ngược của A–Z', () => {
    const az = selectFormulas(ALL, { ...BASE_QUERY, sort: 'az' }).map((f) => f.id);
    const za = selectFormulas(ALL, { ...BASE_QUERY, sort: 'za' }).map((f) => f.id);
    expect(za).toEqual([...az].reverse());
  });

  it('gộp được cả lọc lẫn tìm', () => {
    const ids = selectFormulas(ALL, {
      ...BASE_QUERY,
      segment: 'stock',
      q: 'gia',
    }).map((f) => f.id);
    expect(ids).not.toContain('emi');
    expect(ids).toContain('gia-hoa-von');
  });

  it('không khớp gì thì trả mảng rỗng chứ không trả cả danh sách', () => {
    expect(selectFormulas(ALL, { ...BASE_QUERY, q: 'tien ma hoa' })).toEqual([]);
  });
});

describe('countByCategoryFor()', () => {
  it('đếm đủ 12 nhóm, nhóm không có công thức thì bằng 0', () => {
    const counts = countByCategoryFor(ALL, BASE_QUERY);
    expect(counts.size).toBe(12);
    expect(counts.get('valuation')).toBe(2);
    expect(counts.get('loans')).toBe(1);
    expect(counts.get('technical')).toBe(0);
  });

  it('KHÔNG áp nhóm đang chọn — để người dùng thấy chọn nhóm khác còn bao nhiêu', () => {
    const counts = countByCategoryFor(ALL, { ...BASE_QUERY, categoryId: 'loans' });
    expect(counts.get('valuation')).toBe(2);
  });

  it('có áp mảng và chuỗi tìm kiếm', () => {
    const counts = countByCategoryFor(ALL, { ...BASE_QUERY, segment: 'personal' });
    expect(counts.get('valuation')).toBe(0);
    expect(counts.get('loans')).toBe(1);
  });
});

describe('countBySegmentFor()', () => {
  it('đếm cho ba chip Tất cả · Chứng khoán · Cá nhân', () => {
    expect(countBySegmentFor(ALL, BASE_QUERY)).toEqual({ all: 4, stock: 3, personal: 1 });
  });

  it('số đếm phản ánh chuỗi tìm kiếm đang gõ', () => {
    expect(countBySegmentFor(ALL, { ...BASE_QUERY, q: 'nien kim' })).toEqual({
      all: 1,
      stock: 0,
      personal: 1,
    });
  });
});
