import { describe, expect, it } from 'vitest';

import { FORMULAS } from '@/application';

import { latexToMathml } from './latex-html';

/*
 * Gói 2.4.3 — ký hiệu toán học.
 *
 * Ca nặng nhất ở đây là ca đầu: nó chạy CẢ 111 chuỗi `latex` qua KaTeX. Trước gói này, trường
 * `latex` chưa bao giờ được đưa qua một bộ dựng nào — nó chỉ nằm trong metadata và không ai đọc,
 * nên một chuỗi sai cú pháp có thể đã nằm đó từ lâu mà không phép kiểm nào chạm tới.
 */

describe('latexToMathml() — dựng ký hiệu toán lúc build', () => {
  it('cả 111 công thức đều dựng được, không ném lỗi', () => {
    const hong: Array<{ id: string; message: string }> = [];

    for (const spec of FORMULAS) {
      try {
        const html = latexToMathml(spec.latex);
        if (!html.includes('<math')) hong.push({ id: spec.id, message: 'không có thẻ <math>' });
      } catch (error) {
        hong.push({
          id: spec.id,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    expect(FORMULAS).toHaveLength(111);
    expect(
      hong,
      `công thức dựng hỏng: ${hong.map((h) => `${h.id} (${h.message})`).join(' · ')}`,
    ).toEqual([]);
  });

  /*
   * `throwOnError` phải giữ nguyên là bật. Nếu ai đó tắt nó cho "đỡ phiền", một chuỗi latex hỏng
   * sẽ lặng lẽ thành một khối chữ đỏ in vào HTML tĩnh của người dùng thay vì làm đỏ `next build`.
   * Cùng tinh thần FR-06: thà hỏng ồn còn hơn hỏng im.
   */
  it('latex sai cú pháp thì NÉM, không trả về khối chữ đỏ', () => {
    expect(() => latexToMathml('\\frac{1}')).toThrow();
    expect(() => latexToMathml('\\khongCoLenhNay{x}')).toThrow();
  });

  /*
   * Nhánh MathML là thứ khiến gói này tốn 0 byte CSS và 0 file font. Nếu ai đó đổi sang `html` hay
   * `htmlAndMathml`, kết quả sẽ mang đầy `class="katex-html"` cùng các `<span>` định vị — mà không
   * có `katex.min.css` thì chúng hiện thành một đống ký tự chồng lên nhau.
   *
   * Kiểm bằng chính dấu hiệu ấy, không kiểm bằng cách đọc tuỳ chọn: nó chốt HỆ QUẢ, nên vẫn đúng
   * kể cả khi KaTeX đổi tên tuỳ chọn ở bản sau.
   */
  it('chỉ ra MathML — không kèm nhánh HTML vốn đòi CSS và font riêng', () => {
    const html = latexToMathml(String(FORMULAS[0]?.latex));

    expect(html).toContain('<math');
    expect(html).not.toContain('katex-html');
    expect(html).not.toContain('katex-mathml');
  });

  /*
   * `FormulaDetail.module.css` nâng cỡ chữ công thức bằng `.formula :global(.katex)` — tức nó bám
   * vào một class do KaTeX SINH RA, không do CSS module đặt tên. Ca kiểm ngay trên chỉ chốt sự
   * VẮNG MẶT của nhánh HTML; thiếu ca này thì một bản KaTeX sau bỏ lớp bọc ấy đi là cỡ chữ ký hiệu
   * toán tụt lặng lẽ mà cả bộ test vẫn xanh — không ai biết cho tới lúc nhìn màn hình.
   */
  it('giữ lớp bọc class="katex" mà CSS đang bám vào', () => {
    const html = latexToMathml(String(FORMULAS[0]?.latex));

    expect(html).toContain('class="katex"');
  });

  /*
   * Chữ tiếng Việt có dấu là lý do chọn nhánh MathML: bộ dựng HTML của KaTeX không có số đo bề
   * rộng cho chúng. Ở nhánh này chúng phải đi thẳng vào `<mtext>` để trình duyệt dàn trang bằng
   * font của chính trang.
   */
  it('giữ nguyên chữ tiếng Việt có dấu trong nội dung', () => {
    const html = latexToMathml('X = \\frac{\\text{Lợi nhuận}}{\\text{Vốn chủ sở hữu}}');

    expect(html).toContain('chủ sở hữu');
    expect(html).toContain('Lợi nhuận');
  });
});
