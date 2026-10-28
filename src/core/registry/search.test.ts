import { describe, expect, it } from 'vitest';

import {
  countByCategoryFor,
  countBySegmentFor,
  countHiddenByLevel,
  formulasForLevel,
  matchFormula,
  normalizeVi,
  searchFormulas,
  selectFormulas,
  tokenize,
} from './search';
import { FORMULA_MODULES } from '../formulas';
import { terms, type Term } from './phrase';
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

describe('matchFormula()', () => {
  it('không khớp thì tầng 0, điểm 0', () => {
    expect(matchFormula(PE, 'vay no')).toEqual({ tier: 0, score: 0 });
  });

  it('chuỗi rỗng hoặc toàn dấu ngăn thì không khớp', () => {
    expect(matchFormula(PE, '').tier).toBe(0);
    expect(matchFormula(PE, ' -- ').tier).toBe(0);
  });

  it('công thức nổi bật được cộng điểm (FR-20)', () => {
    const featured = matchFormula(HOA_VON, 'gia').score;
    const plain = matchFormula(make({ ...HOA_VON, isFeatured: false }), 'gia').score;
    expect(featured).toBeGreaterThan(plain);
  });

  /*
   * Chỉ mục mảnh (`FIELD_INDEX`, đợt 13) nhớ bộ mảnh đã cắt theo THAM CHIẾU object. Hai điều
   * phải đúng, và cả hai đều lặng lẽ nếu sai — kết quả vẫn ra số, chỉ là ra số sai hoặc mất hết
   * phần nhanh.
   */
  it('chấm cùng một công thức nhiều lần luôn ra cùng một điểm', () => {
    const lan1 = matchFormula(PE, 'dinh gia');
    const lan2 = matchFormula(PE, 'dinh gia');
    expect(lan2).toEqual(lan1);
    expect(lan1.tier).toBe(1);
  });

  it('hai công thức khác nhau không dùng chung chỉ mục của nhau', () => {
    // `vay no` chỉ khớp EMI. Nếu chỉ mục lẫn khoá thì PE cũng ra điểm.
    expect(matchFormula(EMI, 'vay').tier).toBe(1);
    expect(matchFormula(PE, 'vay').tier).toBe(0);
  });
});

/*
 * 16/10/2026: chủ dự án gõ "%b" ở màn Công thức và nhận 96 kết quả. Bản cũ vứt dấu "%", rồi cho
 * "b" khớp tiền tố của bất kỳ từ nào trong tên, thẻ hay MÔ TẢ, không cần đúng thứ tự — nên "bao
 * nhiêu", "bình quân", "biến động" đều là khớp. Các ca dưới đây chạy trên mẫu thu nhỏ của đúng
 * những công thức đã lọt vào.
 */
describe('khớp cụm — "%b" không còn ra 96 kết quả', () => {
  const PHAN_TRAM_B = make({
    id: 'phan-tram-b-bollinger',
    categoryId: 'technical',
    name: { vi: '%B — vị trí giá trong dải Bollinger', en: '%B — position in the Bollinger Bands' },
    description: {
      vi: 'Giá đóng cửa đang nằm ở đâu giữa hai dải: 0% là dải dưới, 100% là dải trên.',
      en: 'Where the close sits between the two bands: 0% is the lower band, 100% the upper.',
    },
    tags: ['bollinger', 'phan tram b'],
  });
  const PB = make({
    id: 'pb',
    categoryId: 'valuation',
    name: { vi: 'P/B — hệ số giá trên giá trị sổ sách', en: 'P/B — price to book' },
    description: { vi: 'Thị giá đang gấp bao nhiêu lần giá trị sổ sách của một cổ phiếu.', en: '' },
    tags: ['pb', 'p b'],
  });
  const BETA = make({
    id: 'beta',
    categoryId: 'risk',
    name: { vi: 'Beta — hệ số rủi ro hệ thống', en: 'Beta — systematic risk' },
    description: {
      vi: 'Mức một cổ phiếu biến động mạnh hay yếu hơn thị trường, 100% bám theo chỉ số khi bằng 1.',
      en: 'How strongly a stock moves against the market.',
    },
  });
  const MUC_TIEU = make({
    id: 'gia-muc-tieu',
    categoryId: 'valuation',
    name: { vi: 'Giá mục tiêu', en: 'Target price' },
    description: {
      vi: 'Mức giá kỳ vọng nếu thị trường định giá cổ phiếu theo đúng P/E mục tiêu đã chọn.',
      en: 'The expected price if the market values the stock at the chosen target P/E.',
    },
    tags: ['gia muc tieu'],
  });
  const CAGR = make({
    id: 'cagr',
    categoryId: 'returns',
    name: { vi: 'CAGR — tăng trưởng kép hằng năm', en: 'CAGR — compound annual growth rate' },
    tags: ['cagr', 'binh quan nam'],
  });
  const PEG = make({
    id: 'peg',
    categoryId: 'valuation',
    name: { vi: 'PEG — P/E trên tăng trưởng', en: 'PEG — P/E to growth' },
  });
  const BO = [PE, PB, PHAN_TRAM_B, BETA, MUC_TIEU, CAGR, PEG];
  const ids = (q: string, lang: 'vi' | 'en' = 'vi') => searchFormulas(BO, q, lang).map((f) => f.id);

  it('"%b" chỉ ra %B — dấu % là một phần của chuỗi tìm, không phải dấu ngăn', () => {
    expect(ids('%b')).toEqual(['phan-tram-b-bollinger']);
  });

  it('hai mảnh gõ liền nhau chỉ khớp hai mảnh cũng liền nhau: "%b" không khớp "100% bám"', () => {
    expect(matchFormula(BETA, '%b').tier).toBe(0);
  });

  it('ký hiệu đã gõ phải có mặt: "p/e" không khớp "P/B", "p/b" không khớp "P/E"', () => {
    expect(matchFormula(PB, 'p/e').tier).toBe(0);
    expect(ids('p/b')).toEqual(['pb']);
  });

  it('ký hiệu người dùng không gõ thì được bỏ qua: "p e" vẫn ra "P/E"', () => {
    expect(matchFormula(PE, 'p e').tier).toBe(1);
    expect(matchFormula(PE, 'p/e').tier).toBe(1);
  });

  it('khớp tên lên đầu, rồi tới công thức chỉ có cụm trong mô tả', () => {
    expect(ids('p/e')).toEqual(['pe', 'peg', 'gia-muc-tieu']);
    expect(matchFormula(PEG, 'p/e').tier).toBe(1);
    expect(matchFormula(MUC_TIEU, 'p/e').tier).toBe(2);
  });

  it('các từ phải đứng liền nhau, đúng thứ tự: "gia dinh" không khớp "Định giá"', () => {
    expect(matchFormula(PE, 'gia dinh').tier).toBe(0);
    expect(matchFormula(PE, 'dinh gia').tier).toBe(1);
  });

  it('một chữ cái không bao giờ dò mô tả — "m" không khớp "Mức giá kỳ vọng"', () => {
    expect(matchFormula(MUC_TIEU, 'm').tier).toBe(0);
  });

  it('chuỗi ngắn chỉ khớp dở ở đầu mã hoặc tên, không ở từ khoá ẩn', () => {
    // "binh quan nam" là từ khoá ẩn của CAGR: "b" làm CAGR lọt vào danh sách mà không thấy vì sao.
    expect(matchFormula(CAGR, 'b').tier).toBe(0);
    expect(matchFormula(BETA, 'b').tier).toBe(1);
    // Đủ ba ký tự thì từ khoá ẩn khớp dở như thường.
    expect(matchFormula(CAGR, 'bin').tier).toBe(1);
    // Khớp TRỌN từ thì ở đâu cũng được: "b" của "%B" và "P/B".
    expect(matchFormula(PB, 'b').tier).toBe(1);
  });

  it('ở mô tả, từ cuối chỉ khớp dở khi đã gõ từ 3 ký tự', () => {
    expect(matchFormula(MUC_TIEU, 'ky vo').tier).toBe(0);
    expect(matchFormula(MUC_TIEU, 'ky von').tier).toBe(2);
    expect(matchFormula(MUC_TIEU, 'ky vong').tier).toBe(2);
  });

  it('khớp phụ dò đúng mô tả của ngôn ngữ đang hiện', () => {
    expect(matchFormula(MUC_TIEU, 'expected price', 'en').tier).toBe(2);
    expect(matchFormula(MUC_TIEU, 'expected price', 'vi').tier).toBe(0);
    expect(matchFormula(MUC_TIEU, 'gia ky vong', 'vi').tier).toBe(2);
    expect(matchFormula(MUC_TIEU, 'gia ky vong', 'en').tier).toBe(0);
  });

  it('mô tả tiếng Anh rỗng thì dò tiếng Việt — đúng thứ màn in ra', () => {
    expect(matchFormula(PB, 'thi gia dang', 'en').tier).toBe(2);
  });

  it('trùng trọn mã đứng trên khớp phần đầu mã', () => {
    expect(ids('pe')[0]).toBe('pe');
  });

  it('A–Z chỉ sắp TRONG từng tầng: khớp phụ vẫn đứng dưới khớp chính', () => {
    // A–Z thuần thì "Giá mục tiêu" đứng trước "PEG" và "Tỷ số giá…".
    const ra = selectFormulas(BO, { ...BASE_QUERY, q: 'p/e', sort: 'az' }).map((f) => f.id);
    expect(ra).toEqual(['peg', 'pe', 'gia-muc-tieu']);
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
 * Sắp theo chữ cái của NGÔN NGỮ ĐANG HIỆN (17/10/2026). Chủ dự án báo: ở giao diện tiếng Anh, sắp xếp
 * vẫn ra thứ tự của tên tiếng Việt. Bộ bốn fixture có thứ tự Việt và Anh khác hẳn nhau
 * (Việt: Chi phí… · Giá hoà vốn… · Trả góp… · Tỷ số…; Anh: Equated… · Price… · Real… · Weighted…),
 * nên so `name.vi` ở chế độ tiếng Anh làm mọi ca dưới đây đỏ.
 */
describe('selectFormulas() — sắp theo tên của ngôn ngữ đang hiện', () => {
  const EN = { lang: 'en' } as const;
  const ids = (ra: ReadonlyArray<{ id: string }>) => ra.map((f) => f.id);

  it('tiếng Anh: A–Z theo tên tiếng Anh, khác thứ tự tiếng Việt', () => {
    const anh = ids(selectFormulas(ALL, { ...BASE_QUERY, sort: 'az' }, EN));
    expect(anh).toEqual(['emi', 'pe', 'gia-hoa-von', 'wacc']);
    expect(ids(selectFormulas(ALL, { ...BASE_QUERY, sort: 'az' }))).toEqual([
      'wacc',
      'gia-hoa-von',
      'emi',
      'pe',
    ]);
  });

  it('tiếng Anh: Z–A là đảo ngược của A–Z tiếng Anh', () => {
    const az = ids(selectFormulas(ALL, { ...BASE_QUERY, sort: 'az' }, EN));
    const za = ids(selectFormulas(ALL, { ...BASE_QUERY, sort: 'za' }, EN));
    expect(za).toEqual([...az].reverse());
  });

  it('tiếng Anh: mặc định vẫn đưa nổi bật lên trước, phá hoà theo tên tiếng Anh', () => {
    expect(ids(selectFormulas(ALL, BASE_QUERY, EN))).toEqual(['pe', 'gia-hoa-von', 'emi', 'wacc']);
  });

  it('tiếng Anh: “Cơ bản trước” sắp trong từng mức theo tên tiếng Anh', () => {
    expect(ids(selectFormulas(ALL, { ...BASE_QUERY, sort: 'basic' }, EN))).toEqual([
      'emi',
      'pe',
      'gia-hoa-von',
      'wacc',
    ]);
  });

  it('tiếng Anh: công thức chưa có điểm lịch sử rơi xuống theo thứ tự mặc định tiếng Anh', () => {
    const ra = selectFormulas(
      ALL,
      { ...BASE_QUERY, sort: 'used' },
      { ...EN, usageOrder: new Map([['wacc', 3]]) },
    );
    expect(ids(ra)).toEqual(['wacc', 'pe', 'gia-hoa-von', 'emi']);
  });

  it('tiếng Anh: tên tiếng Anh rỗng thì sắp theo tên tiếng Việt, đúng chữ màn đang in', () => {
    const chuaDich = make({ id: 'an-chia', categoryId: 'loans', name: { vi: 'Ăn chia', en: '' } });
    const ra = ids(selectFormulas([...ALL, chuaDich], { ...BASE_QUERY, sort: 'az' }, EN));
    expect(ra[0]).toBe('an-chia');
  });

  it('khi đang tìm, A–Z tiếng Anh sắp trong từng tầng theo tên tiếng Anh', () => {
    // Ba mô tả tiếng Anh mở đầu bằng "The" — cả ba là khớp phụ, cùng một tầng.
    const ra = ids(selectFormulas(ALL, { ...BASE_QUERY, q: 'the', sort: 'az' }, EN));
    expect(ra).toEqual(['emi', 'gia-hoa-von', 'wacc']);
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

/*
 * Lối tắt ASCII của `terms()` (28/10/2026): ký tự dưới 0x80 chỉ `toLowerCase`, không qua
 * `normalizeVi`. Ca này dựng lại đường cũ ngay tại chỗ (chuẩn hoá TỪNG ký tự) và đòi hai bên ra
 * đúng một dãy mảnh — chữ, ký hiệu, vị trí bắt đầu/kết thúc, cờ dính — trên mọi tên, mô tả và thẻ
 * của cả Registry, ở cả hai ngôn ngữ, cộng một chuỗi NFD có dấu thanh rời.
 */
describe('terms() — lối tắt ASCII ra đúng dãy mảnh như chuẩn hoá từng ký tự', () => {
  function termsCu(text: string): Term[] {
    const out: Term[] = [];
    let truocLaManh = false;
    let offset = 0;
    for (const char of text) {
      const piece = normalizeVi(char);
      const end = offset + char.length;
      const truoc = out[out.length - 1];
      if (piece === '' && truoc !== undefined && truocLaManh) truoc.end = end;
      for (const c of piece) {
        const last = out[out.length - 1];
        if (/[a-z0-9]/.test(c)) {
          if (last !== undefined && truocLaManh && !last.kyHieu) {
            last.text += c;
            last.end = end;
          } else {
            out.push({ text: c, kyHieu: false, dinh: truocLaManh, start: offset, end });
          }
          truocLaManh = true;
        } else if (/[%/&+×]/.test(c)) {
          out.push({ text: c, kyHieu: true, dinh: truocLaManh, start: offset, end });
          truocLaManh = true;
        } else {
          truocLaManh = false;
        }
      }
      offset = end;
    }
    return out;
  }

  it('trùng khít trên cả Registry và chuỗi NFD', () => {
    const chuoi = FORMULA_MODULES.flatMap(({ spec }) => [
      spec.name.vi,
      spec.name.en,
      spec.description.vi,
      spec.description.en,
      ...spec.tags,
    ]);
    chuoi.push('Đ%B — Lãi/lỗ P/E 1,5 × DOL'.normalize('NFD'), 'ROE ≥ 15% & EPS + 2');
    for (const text of chuoi) expect(terms(text), text).toEqual(termsCu(text));
  });
});
