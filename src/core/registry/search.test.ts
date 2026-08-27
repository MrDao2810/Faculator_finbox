import { describe, expect, it } from 'vitest';

import {
  countByCategoryFor,
  countBySegmentFor,
  countHiddenByLevel,
  formulasForLevel,
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
    description: { vi: '', en: '' },
    latex: 'x',
    chartType: 'none',
    level: 'basic',
    tags: [],
    resultUnit: 'lần',
    variables: [],
    explanation: {
      meaning: { vi: 'x', en: 'x' },
      whenToUse: { vi: 'x', en: 'x' },
      howToRead: { vi: 'x', en: 'x' },
      commonMistakes: { vi: 'x', en: 'x' },
    },
    example: { title: { vi: 'x', en: 'x' }, inputs: {}, expected: 1 },
    tests: [],
    source: [],
    ...patch,
  };
}

const PE = make({
  id: 'pe',
  categoryId: 'valuation',
  name: { vi: 'Tỷ số giá trên lợi nhuận (P/E)', en: 'Price to Earnings' },
  description: {
    vi: 'Trả bao nhiêu đồng cho mỗi đồng lợi nhuận.',
    en: 'How much is paid for each unit of earnings.',
  },
  tags: ['boi so', 'dinh gia'],
  isFeatured: true,
});

const WACC = make({
  id: 'wacc',
  categoryId: 'valuation',
  name: { vi: 'Chi phí vốn bình quân (WACC)', en: 'Weighted Average Cost of Capital' },
  description: {
    vi: 'Lãi suất chiết khấu dùng cho dòng tiền doanh nghiệp.',
    en: 'The discount rate used for corporate cash flows.',
  },
  tags: ['chiet khau'],
  level: 'advanced',
});

const EMI = make({
  id: 'emi',
  categoryId: 'loans',
  name: { vi: 'Trả góp niên kim', en: 'Equated Monthly Instalment' },
  description: {
    vi: 'Số tiền phải trả đều mỗi kỳ.',
    en: 'The amount to be paid equally each period.',
  },
  tags: ['vay no'],
});

const HOA_VON = make({
  id: 'gia-hoa-von',
  categoryId: 'fees-tax',
  name: { vi: 'Giá hoà vốn thực', en: 'Real break-even price' },
  description: {
    vi: 'Giá bán tối thiểu để không lỗ sau phí và thuế.',
    en: 'The minimum sale price to avoid a loss after fees and taxes.',
  },
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

  /*
   * Chỉ mục từ khoá (`FIELD_INDEX`, đợt 13) nhớ bộ từ đã cắt theo THAM CHIẾU object. Hai điều
   * phải đúng, và cả hai đều lặng lẽ nếu sai — kết quả vẫn ra số, chỉ là ra số sai hoặc mất hết
   * phần nhanh.
   */
  it('chấm cùng một công thức nhiều lần luôn ra cùng một điểm', () => {
    const lan1 = scoreFormula(PE, tokenize('dinh gia'));
    const lan2 = scoreFormula(PE, tokenize('dinh gia'));
    expect(lan2).toBe(lan1);
    expect(lan1).toBeGreaterThan(0);
  });

  it('hai công thức khác nhau không dùng chung chỉ mục của nhau', () => {
    // `vay no` chỉ khớp EMI. Nếu chỉ mục lẫn khoá thì PE cũng ra điểm.
    expect(scoreFormula(EMI, tokenize('vay'))).toBeGreaterThan(0);
    expect(scoreFormula(PE, tokenize('vay'))).toBe(0);
  });
});

/*
 * Điều kiện SỐNG CÒN của chỉ mục từ khoá: các hàm lọc phải trả về CHÍNH object công thức, không
 * phải bản sao. `WeakMap` khoá theo tham chiếu, nên một ngày nào đó ai đó viết
 * `.map(f => ({ ...f }))` cho tiện là chỉ mục trượt 100% — không ca kiểm nào khác thấy được, vì
 * kết quả tìm kiếm vẫn đúng từng chữ. Ca này là chỗ duy nhất bắt được.
 */
describe('lọc không được sao chép công thức — điều kiện của chỉ mục từ khoá', () => {
  it('selectFormulas trả về đúng object đã truyền vào', () => {
    const ra = selectFormulas(ALL, BASE_QUERY);
    for (const formula of ra) {
      expect(
        ALL.some((goc) => goc === formula),
        formula.id,
      ).toBe(true);
    }
  });

  it('mọi cách sắp xếp cũng vậy — kể cả hai cách chấm điểm từ lịch sử', () => {
    const order = new Map([
      ['pe', 9],
      ['wacc', 3],
    ]);

    for (const sort of ['featured', 'az', 'za', 'basic', 'recent', 'used'] as const) {
      const ra = selectFormulas(ALL, { ...BASE_QUERY, sort }, { usageOrder: order });
      expect(ra.length, sort).toBe(ALL.length);
      for (const formula of ra) {
        expect(
          ALL.some((goc) => goc === formula),
          `${sort} · ${formula.id}`,
        ).toBe(true);
      }
    }
  });

  it('formulasForLevel cũng vậy', () => {
    for (const formula of formulasForLevel(ALL, 'basic')) {
      expect(
        ALL.some((goc) => goc === formula),
        formula.id,
      ).toBe(true);
    }
  });

  it('searchFormulas cũng vậy', () => {
    const ra = searchFormulas(ALL, 'gia');
    expect(ra.length).toBeGreaterThan(0);
    for (const formula of ra) {
      expect(
        ALL.some((goc) => goc === formula),
        formula.id,
      ).toBe(true);
    }
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

  it('“Cơ bản trước” xếp hết mức cơ bản lên trên, trong mỗi mức vẫn theo chữ cái', () => {
    const ra = selectFormulas(ALL, { ...BASE_QUERY, sort: 'basic' });

    // Không có mức nâng cao nào chen lên trước một mức cơ bản.
    const dauTienNangCao = ra.findIndex((f) => f.level === 'advanced');
    const cuoiCungCoBan = ra.map((f) => f.level).lastIndexOf('basic');
    expect(dauTienNangCao).toBeGreaterThan(cuoiCungCoBan);

    // Trong mức cơ bản, thứ tự trùng khít A–Z đã lọc lại — nổi bật KHÔNG được chen ngang.
    const az = selectFormulas(ALL, { ...BASE_QUERY, sort: 'az' });
    expect(ra.filter((f) => f.level === 'basic').map((f) => f.id)).toEqual(
      az.filter((f) => f.level === 'basic').map((f) => f.id),
    );
  });
});

/*
 * Hai cách sắp dựa trên lịch sử dùng. Điểm do tầng Application chấm rồi đưa xuống, nên ở đây
 * chỉ cần một `Map` dựng tay — chính vì vậy chúng test được bằng Node mà không đụng localStorage.
 */
describe('selectFormulas() — sắp theo lịch sử dùng', () => {
  /** Thứ tự mặc định, dùng làm mốc so cho mọi ca dưới đây. */
  const MAC_DINH = selectFormulas(ALL, BASE_QUERY).map((f) => f.id);

  it('công thức có điểm lên trước, điểm cao đứng trên', () => {
    const order = new Map([
      ['emi', 10],
      ['wacc', 30],
    ]);
    const ids = selectFormulas(ALL, { ...BASE_QUERY, sort: 'recent' }, { usageOrder: order }).map(
      (f) => f.id,
    );
    expect(ids.slice(0, 2)).toEqual(['wacc', 'emi']);
  });

  it('công thức chưa mở bao giờ rơi xuống dưới theo ĐÚNG thứ tự mặc định', () => {
    const order = new Map([['emi', 10]]);
    const ids = selectFormulas(ALL, { ...BASE_QUERY, sort: 'used' }, { usageOrder: order }).map(
      (f) => f.id,
    );
    expect(ids[0]).toBe('emi');
    expect(ids.slice(1)).toEqual(MAC_DINH.filter((id) => id !== 'emi'));
  });

  it('không có lịch sử thì trùng khít thứ tự mặc định — khách mới không thấy màn lạ', () => {
    for (const sort of ['recent', 'used'] as const) {
      // Cả ba đường vào đều phải ra cùng một kết quả: thiếu options, thiếu map, và map rỗng.
      expect(selectFormulas(ALL, { ...BASE_QUERY, sort }).map((f) => f.id)).toEqual(MAC_DINH);
      expect(selectFormulas(ALL, { ...BASE_QUERY, sort }, {}).map((f) => f.id)).toEqual(MAC_DINH);
      expect(
        selectFormulas(ALL, { ...BASE_QUERY, sort }, { usageOrder: new Map() }).map((f) => f.id),
      ).toEqual(MAC_DINH);
    }
  });

  it('điểm lịch sử ĐÈ độ liên quan, y như A–Z', () => {
    // 'gia' khớp thẳng vào TÊN của 'Giá hoà vốn thực' nên nó liên quan hơn 'pe' (chỉ khớp thẻ).
    const theoLienQuan = selectFormulas(ALL, { ...BASE_QUERY, q: 'gia' }).map((f) => f.id);
    expect(theoLienQuan).toEqual(['gia-hoa-von', 'pe']);

    // Người dùng vừa tự tay chọn cách sắp này sau khi đã gõ xong, nên lịch sử phải thắng.
    const order = new Map([['pe', 99]]);
    const ids = selectFormulas(
      ALL,
      { ...BASE_QUERY, q: 'gia', sort: 'recent' },
      { usageOrder: order },
    ).map((f) => f.id);
    expect(ids).toEqual(['pe', 'gia-hoa-von']);
  });

  it('điểm của công thức bị bộ lọc loại ra không kéo nó quay lại', () => {
    const order = new Map([['emi', 99]]);
    const ids = selectFormulas(
      ALL,
      { ...BASE_QUERY, segment: 'stock', sort: 'used' },
      { usageOrder: order },
    ).map((f) => f.id);
    expect(ids).not.toContain('emi');
  });

  it('cùng đầu vào luôn cho cùng thứ tự (NFR-REL-03)', () => {
    const order = new Map([
      ['pe', 5],
      ['emi', 5],
    ]);
    const lan1 = selectFormulas(ALL, { ...BASE_QUERY, sort: 'used' }, { usageOrder: order });
    const lan2 = selectFormulas(ALL, { ...BASE_QUERY, sort: 'used' }, { usageOrder: order });
    expect(lan1.map((f) => f.id)).toEqual(lan2.map((f) => f.id));
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

describe('formulasForLevel() — vế "công thức phức tạp" của FR-09', () => {
  it('chế độ Nâng cao trả nguyên bộ, không bỏ sót cái nào', () => {
    expect(formulasForLevel(ALL, 'advanced')).toHaveLength(ALL.length);
  });

  it('chế độ Cơ bản bỏ công thức mức nâng cao', () => {
    const ids = formulasForLevel(ALL, 'basic').map((f) => f.id);
    expect(ids).not.toContain('wacc');
    expect(ids).toEqual(['pe', 'emi', 'gia-hoa-von']);
  });

  it('giữ nguyên thứ tự đầu vào — sắp xếp là việc của selectFormulas()', () => {
    const ids = formulasForLevel([WACC, PE, EMI], 'basic').map((f) => f.id);
    expect(ids).toEqual(['pe', 'emi']);
  });

  it('không sửa mảng gốc', () => {
    const truoc = [...ALL];
    formulasForLevel(ALL, 'basic');
    expect(ALL).toEqual(truoc);
  });

  it('bộ rỗng vẫn chạy, không ném lỗi', () => {
    expect(formulasForLevel([], 'basic')).toEqual([]);
  });
});

describe('countHiddenByLevel()', () => {
  it('chế độ Nâng cao không giấu gì nên luôn là 0', () => {
    expect(countHiddenByLevel(ALL, BASE_QUERY, 'advanced')).toBe(0);
  });

  it('đếm đúng số công thức chế độ Cơ bản đang giấu', () => {
    expect(countHiddenByLevel(ALL, BASE_QUERY, 'basic')).toBe(1);
  });

  /*
   * Con số này hiện thành câu "N công thức nâng cao đang ẩn" ngay cạnh danh sách, nên nó phải
   * đếm trong PHẠM VI bộ lọc hiện tại. Đếm tổng số công thức nâng cao của cả Registry là hứa
   * với người dùng những mục mà bật Nâng cao lên cũng không thấy.
   */
  it('chỉ đếm trong phạm vi bộ lọc đang áp, không đếm cả Registry', () => {
    // Nhóm 'loans' chỉ có EMI mức cơ bản — không giấu gì, dù WACC nâng cao vẫn nằm đâu đó.
    expect(countHiddenByLevel(ALL, { ...BASE_QUERY, categoryId: 'loans' }, 'basic')).toBe(0);
    expect(countHiddenByLevel(ALL, { ...BASE_QUERY, categoryId: 'valuation' }, 'basic')).toBe(1);
  });

  it('có tính cả chuỗi tìm kiếm đang gõ', () => {
    expect(countHiddenByLevel(ALL, { ...BASE_QUERY, q: 'chiet khau' }, 'basic')).toBe(1);
    expect(countHiddenByLevel(ALL, { ...BASE_QUERY, q: 'nien kim' }, 'basic')).toBe(0);
  });

  /* Bất biến quan trọng nhất: con số nói ra và danh sách bày ra phải cộng lại bằng nhau. */
  it('số ẩn + số hiện = số của chế độ Nâng cao, ở mọi bộ lọc', () => {
    const queries: FormulaQuery[] = [
      BASE_QUERY,
      { ...BASE_QUERY, categoryId: 'valuation' },
      { ...BASE_QUERY, segment: 'stock' },
      { ...BASE_QUERY, q: 'dinh gia' },
    ];

    for (const query of queries) {
      const hien = selectFormulas(formulasForLevel(ALL, 'basic'), query).length;
      const an = countHiddenByLevel(ALL, query, 'basic');
      expect(hien + an, JSON.stringify(query)).toBe(selectFormulas(ALL, query).length);
    }
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
