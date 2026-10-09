import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from './formulas';
import { meaningProblems } from './meaning-rules';
import type { YNghiaInput } from './meaning-rules';

/**
 * Mục "Ý nghĩa" của cả 111 công thức: nói công thức ĐO cái gì, không nêu một giá trị mẫu của kết
 * quả. Luật và lý do nằm ở docblock `meaning-rules.ts`.
 *
 * Ca kiểm này gác thứ máy thấy được — con số nào không phải hằng số của công thức. Thứ nó KHÔNG
 * thấy được là một câu khái quát nhưng sai về bản chất công thức; chỗ đó phải đọc cùng `calc`.
 */
describe('mục "Ý nghĩa" không nêu số liệu minh hoạ', () => {
  const items: YNghiaInput[] = FORMULA_MODULES.map(({ spec }) => ({
    id: spec.id,
    latex: spec.latex,
    meaning: spec.explanation.meaning,
  }));

  it('cả 111 đoạn đạt luật, cả bản Việt lẫn bản Anh', () => {
    expect(items).toHaveLength(111);
    expect(items.flatMap((item) => meaningProblems(item))).toEqual([]);
  });

  /*
   * Câu chủ dự án khoanh đỏ ngày 09/10/2026 — chép nguyên văn. Nới luật tới mức nó lọt qua là mở
   * cửa lại cho đúng lỗi này.
   */
  it('luật bắt được câu cũ của `don-bay-hieu-dung`', () => {
    const cu = meaningProblems({
      id: 'don-bay-hieu-dung',
      latex: 'L = \\frac{F \\times m \\times N}{E}',
      meaning: {
        vi: 'Mức khuếch đại thật của tài khoản: đòn bẩy 5 lần nghĩa là chỉ số nhúc nhích 1% thì vốn của bạn biến động khoảng 5%.',
        en: 'The true amplification of the account: 5x leverage means a 1% move in the index moves your equity by roughly 5%.',
      },
    });
    /*
     * Bốn chỗ: con số 5 xuất hiện HAI lần mỗi bản — "đòn bẩy 5 lần" rồi "biến động khoảng 5%" —
     * và đó đúng là hình dạng của lỗi: lần thứ hai không phải một lựa chọn, nó bằng 1% × 5 nên bị
     * con số thứ nhất ép ra. Riêng "1%" qua được vì 1 là mốc chung.
     */
    expect(cu.filter((l) => l.includes('"5"'))).toHaveLength(4);

    /* Bản viết lại không còn chữ số nào. */
    expect(
      meaningProblems({
        id: 'don-bay-hieu-dung',
        latex: 'L = \\frac{F \\times m \\times N}{E}',
        meaning: {
          vi: 'Mức khuếch đại thực tế của tài khoản: giá trị danh nghĩa của vị thế đang gấp bao nhiêu lần vốn thực có, nên tài khoản chịu lãi lỗ của một lượng tài sản lớn gấp chừng ấy lần so với số tiền thực tế đang có.',
          en: 'The true amplification of the account: the notional value of the position is that many times actual equity, so the account carries the gains and losses of a holding that many times larger than the money actually in it.',
        },
      }),
    ).toEqual([]);
  });

  /*
   * Vế (b) là phần đáng giá nhất của luật, và cũng là phần dễ dựng sai nhất: số trong hình phải
   * được công nhận, kể cả khi hình viết dấu thập phân kiểu KaTeX (`22{,}5`) còn bản `en` viết
   * `22.5`.
   */
  it('con số có trong hình thì qua, dù hai bên viết dấu thập phân khác nhau', () => {
    expect(
      meaningProblems({
        id: 'so-graham',
        latex: '\\text{Graham} = \\sqrt{22{,}5 \\times EPS \\times BVPS}',
        meaning: {
          vi: 'Trần giá gộp hai giới hạn Graham đặt ra: tích của chúng là 22,5.',
          en: 'A price ceiling combining two limits Graham set: their product is 22.5.',
        },
      }),
    ).toEqual([]);
  });

  it('hình không vẽ con số ấy thì không qua', () => {
    const loi = meaningProblems({
      id: 'so-graham',
      latex: '\\text{Graham} = \\sqrt{22{,}5 \\times EPS \\times BVPS}',
      meaning: {
        vi: 'Trần giá, ví dụ một cổ phiếu EPS 3.000 đồng.',
        en: 'A price ceiling, for instance a stock with EPS of 3,000 dong.',
      },
    });
    expect(loi).toHaveLength(2);
  });

  /*
   * Tên riêng mang chữ số không phải một con số phải giải trình, nếu không mọi câu nhắc VN-Index
   * hay VN30F1M đều đỏ.
   */
  it('tên riêng có chữ số không bị tính là con số', () => {
    expect(
      meaningProblems({
        id: 'beta',
        latex: '\\beta_i = \\frac{\\text{Cov}(R_i, R_m)}{\\text{Var}(R_m)}',
        meaning: {
          vi: 'Mức nhạy của cổ phiếu với nhịp chung của thị trường, đo theo lợi suất VN-Index.',
          en: "How sensitive the stock is to the market's own swings, measured against the VN-Index return.",
        },
      }),
    ).toEqual([]);
  });
});
