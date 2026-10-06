import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from './formulas';
import { howToReadDuplicates, howToReadProblems } from './how-to-read-rules';
import type { CachDocInput } from './how-to-read-rules';

/**
 * Mục "Cách đọc kết quả" của cả 111 công thức theo khuôn chủ dự án chốt 30/09/2026: mở đầu
 * "So với [mốc]:", nói cao hơn hay thấp hơn mốc nghĩa là gì, rồi tối đa một câu cho giá trị dễ đọc
 * sai. Luật và lý do nằm ở docblock `how-to-read-rules.ts`; công cụ soạn dùng đúng hàm ấy.
 *
 * Luật không thấy được giá trị đặc biệt nêu ra có thật do `calc` trả về hay không. Cả 111 đoạn đã
 * được đối chiếu với `calc` bằng mắt; đoạn mới thêm về sau cũng phải được đọc như vậy.
 */
describe('mục "Cách đọc kết quả" theo khuôn "So với [mốc]: …"', () => {
  const items: CachDocInput[] = FORMULA_MODULES.map(({ spec }) => ({
    id: spec.id,
    name: spec.name,
    howToRead: spec.explanation.howToRead,
  }));

  it('cả 111 đoạn đạt luật, cả bản Việt lẫn bản Anh', () => {
    expect(items).toHaveLength(111);
    expect(items.flatMap((item) => howToReadProblems(item))).toEqual([]);
  });

  it('không hai công thức nào dùng chung một đoạn', () => {
    expect(howToReadDuplicates(items)).toEqual([]);
  });

  /*
   * Luật phải bắt đúng ba kiểu đoạn cũ đã bị chỉ ra — chép nguyên văn. Nới một luật tới mức chúng
   * lọt qua là mở cửa lại cho số ví dụ cũ, đoạn không có mốc, và đoạn chỉ tả tính chất.
   */
  it('luật vẫn bắt được ba kiểu đoạn cũ', () => {
    const capmCu = howToReadProblems({
      id: 'capm',
      name: { vi: 'CAPM — chi phí vốn chủ sở hữu', en: 'CAPM — cost of equity' },
      howToRead: {
        vi: 'Con số là mức sinh lợi tối thiểu mỗi năm cổ đông nên đòi ở cổ phiếu này: ví dụ trên ra 13,1%/năm, cao hơn lãi suất phi rủi ro 3,5% gần mười điểm phần trăm — đó là phần bù cho rủi ro.',
        en: 'The figure is the minimum yearly return shareholders should demand: the example above gives 13.1% a year.',
      },
    });
    expect(capmCu.some((loi) => loi.includes('ví dụ'))).toBe(true);
    expect(capmCu.some((loi) => loi.includes('"13,1"'))).toBe(true);
    expect(capmCu.some((loi) => loi.includes('gạch ngang'))).toBe(true);

    const peCu = howToReadProblems({
      id: 'pe',
      name: { vi: 'P/E — hệ số giá trên lợi nhuận', en: 'Price to earnings ratio' },
      howToRead: {
        vi: 'P/E cao nghĩa là thị trường kỳ vọng tăng trưởng lớn, hoặc cổ phiếu đang đắt. Thấp thì rẻ, hoặc đang có rủi ro.',
        en: 'A high P/E means the market expects strong growth, or the share is expensive. A low P/E means it is cheap, or carries risk.',
      },
    });
    expect(peCu.some((loi) => loi.includes('pe.vi: phải mở đầu'))).toBe(true);
    expect(peCu.some((loi) => loi.includes('pe.vi: câu đầu phải có đúng một ":"'))).toBe(true);

    const varCu = howToReadProblems({
      id: 'var-lich-su',
      name: { vi: 'VaR lịch sử', en: 'Historical VaR' },
      howToRead: {
        vi: 'Kết quả là SỐ DƯƠNG và nghĩa là MẤT: 2,5 nghĩa là lỗ 2,5% trong phiên tệ. Đây là chỗ hay hiểu ngược dấu. Phần đó phải xem tiếp bằng CVaR.',
        en: 'The result is a positive number that means a loss.',
      },
    });
    expect(varCu.some((loi) => loi.includes('"MẤT"'))).toBe(true);
    expect(varCu.some((loi) => loi.includes('3 câu'))).toBe(true);
    expect(varCu.some((loi) => loi.includes('"CVaR"'))).toBe(true);
  });

  it('đoạn đúng khuôn thì không bị bắt oan', () => {
    expect(
      howToReadProblems({
        id: 'gia-hoa-von',
        name: { vi: 'Giá hoà vốn', en: 'Break-even price' },
        howToRead: {
          vi: 'So với giá thị trường hiện tại của mã: giá thị trường cao hơn con số này thì bán lúc này là có lãi sau mọi khoản phí và thuế, thấp hơn thì bán lúc này vẫn lỗ.',
          en: 'Compared with the current market price: if the market price is higher, selling now leaves a profit after every fee and tax, and if it is lower, selling now is still a loss.',
        },
      }),
    ).toEqual([]);
  });

  /*
   * Luật 9. Chủ dự án chụp màn `ty-so-calmar` ngày 05/10/2026: *"'so với 1: ..' nghĩa là gì?
   * '1:' là gì? trong công thức tôi chưa thấy có '1:'"*. Dấu hai chấm của khuôn dính vào con số
   * và đổi nghĩa thành ký hiệu tỷ lệ.
   */
  it('mốc là số trần thì bị bắt, có từ chỉ loại đứng trước thì không', () => {
    const calmarCu = howToReadProblems({
      id: 'ty-so-calmar',
      name: { vi: 'Tỷ số Calmar', en: 'Calmar ratio' },
      howToRead: {
        vi: 'So với 1: trên 1 nghĩa là lãi một năm đã lớn hơn cú sụt sâu nhất phải chịu, dưới 1 là cú sụt ấy còn lớn hơn phần lãi một năm.',
        en: "Compared with 1: above it means one year's return is larger than the deepest drop you had to sit through, below it means that drop is still bigger.",
      },
    });
    expect(calmarCu.some((loi) => loi.includes('ty-so-calmar.vi: mốc "1" là số trần'))).toBe(true);
    expect(calmarCu.some((loi) => loi.includes('ty-so-calmar.en: mốc "1" là số trần'))).toBe(true);

    /* Mốc 100% cũng vậy, và từ chỉ loại đứng trước thì qua. */
    expect(
      howToReadProblems({
        id: 'ty-le-chi-tra-co-tuc',
        name: { vi: 'Tỷ lệ chi trả cổ tức', en: 'Dividend payout ratio' },
        howToRead: {
          vi: 'So với 100%: dưới 100% nghĩa là công ty chia một phần lãi và giữ phần còn lại để tái đầu tư, trên 100% là chia nhiều hơn số lãi làm ra.',
          en: 'Compared with 100%: below 100% means the company pays out part of its profit and keeps the rest to reinvest, above 100% means it pays out more than it earned.',
        },
      }).filter((loi) => loi.includes('số trần')),
    ).toHaveLength(2);

    expect(
      howToReadProblems({
        id: 'ty-le-chi-tra-co-tuc',
        name: { vi: 'Tỷ lệ chi trả cổ tức', en: 'Dividend payout ratio' },
        howToRead: {
          vi: 'So với mốc 100%: dưới 100% nghĩa là công ty chia một phần lãi và giữ phần còn lại để tái đầu tư, trên 100% là chia nhiều hơn số lãi làm ra.',
          en: 'Compared with the 100% mark: below 100% means the company pays out part of its profit and keeps the rest to reinvest, above 100% means it pays out more than it earned.',
        },
      }),
    ).toEqual([]);
  });
});
