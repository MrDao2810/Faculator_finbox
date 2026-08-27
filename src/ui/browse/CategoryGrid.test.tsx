// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CATEGORIES, categoriesOf, parseListParams } from '@/application';

import { CategoryGrid } from './CategoryGrid';

afterEach(cleanup);

/**
 * Lưới nhóm của WF-01 — gói WBS 3.1.1, dựng lại theo bản thiết kế ở đợt 8.
 *
 * Ca quan trọng nhất là ca đọc ngược đường dẫn: đợt 7 từng ghép tay chuỗi `?nhom=<id>` trong
 * khi bộ đọc URL dùng tham số khác, link vẫn mở được trang nên trông như chạy đúng mà thật ra
 * không lọc gì. Ở đây dựng URL rồi đọc lại bằng chính `parseListParams()`.
 */

function queryOf(href: string): URLSearchParams {
  return new URLSearchParams(href.slice(href.indexOf('?')));
}

describe('CategoryGrid', () => {
  it('dựng đủ một ô cho mỗi nhóm được truyền vào', () => {
    render(<CategoryGrid categories={CATEGORIES} />);
    expect(screen.getAllByRole('link')).toHaveLength(12);
  });

  it('hiện tên rút gọn chứ không phải tên đầy đủ — chỗ hẹp 150px', () => {
    render(<CategoryGrid categories={categoriesOf('stock')} />);

    expect(screen.getByText('Phí & thuế VN')).not.toBeNull();
    expect(screen.queryByText('Phí & thuế thị trường VN')).toBeNull();
    expect(screen.getByText('Chỉ số DN')).not.toBeNull();
    expect(screen.getByText('Kỹ thuật')).not.toBeNull();
  });

  it('hiện số công thức dự kiến của SRS 3.8', () => {
    render(<CategoryGrid categories={categoriesOf('personal')} />);

    // Tiết kiệm 5 · Đầu tư 2 · Vay nợ 3 · Thuế TNCN 1 · Tài chính DN 2 = 13.
    const shown = screen.getAllByRole('link').map((a) => a.textContent);
    expect(shown).toEqual(['Tiết kiệm5', 'Đầu tư2', 'Vay nợ3', 'Thuế TNCN1', 'Tài chính DN2']);
  });

  it('không còn nhãn "sắp có" nào — chủ dự án chốt lấy hình của bản thiết kế', () => {
    render(<CategoryGrid categories={CATEGORIES} />);
    expect(screen.queryByText(/sắp có/i)).toBeNull();
  });

  it('mỗi ô trỏ sang màn danh sách đã lọc sẵn đúng nhóm đó', () => {
    render(<CategoryGrid categories={CATEGORIES} />);
    const links = screen.getAllByRole('link');

    CATEGORIES.forEach((category, index) => {
      const href = links[index]?.getAttribute('href') ?? '';
      // Không so chuỗi thô: đọc ngược bằng chính bộ đọc URL của tầng Application.
      expect(parseListParams(queryOf(href)).categoryId, category.id).toBe(category.id);
    });
  });

  it('danh sách rỗng thì không ném lỗi, chỉ ra lưới rỗng', () => {
    render(<CategoryGrid categories={[]} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});

/*
 * Con số đi theo chế độ hiển thị — FR-09, vế thứ ba.
 *
 * Trước gói này ô luôn in `expectedCount`, nên trang chủ khoe "111 công thức" cả khi người dùng
 * đang ở chế độ Cơ bản và chỉ với tới 79. Chủ dự án báo đúng chỗ này.
 *
 * ── Vì sao ca kiểm ở đây đọc TỪNG THẺ chứ không đọc `textContent` của cả ô ────────────────────
 *
 * Ô mang SẴN cả hai con số; `data-mode` trên `<html>` chọn con số nào hiện, và phép chọn ấy nằm
 * trong CSS Module. jsdom không áp CSS Module, nên `textContent` ở đây thấy CẢ HAI ('Tiết kiệm55')
 * — đúng DOM, nhưng không phải thứ người dùng thấy. Đọc từng thẻ mới nói được câu có nghĩa.
 *
 * Trên trình duyệt thật `display: none` gỡ luôn khỏi cây khả truy cập, nên trình đọc màn hình
 * cũng chỉ gặp một con số. Đây đúng là đánh đổi `ThemeSwitch` đã chọn và đã ghi lý do: giữ cả hai
 * nhánh trong DOM, để CSS quyết, vì lượt render đầu ở máy khách buộc phải khớp HTML tĩnh.
 */
describe('CategoryGrid — số đếm theo chế độ hiển thị', () => {
  const CA_NHAN = categoriesOf('personal');

  /** Chữ của hai badge trong một ô, theo thứ tự [Cơ bản, Nâng cao]. */
  function badgesOf(link: Element): string[] {
    return [...link.querySelectorAll('span')]
      .filter((span) => span.querySelector('span') === null && span.textContent !== '')
      .map((span) => span.textContent ?? '')
      .slice(-2);
  }

  it('có `basicCounts` thì ô mang CẢ HAI con số — Cơ bản trước, Nâng cao sau', () => {
    // Đúng bộ số của chế độ Cơ bản: Tài chính DN có 2/2 công thức đều mức nâng cao.
    const basicCounts = new Map([
      ['savings', 5],
      ['investing', 2],
      ['loans', 3],
      ['personal-tax', 1],
      ['corporate-finance', 0],
    ]);

    render(<CategoryGrid categories={CA_NHAN} basicCounts={basicCounts} />);

    const links = screen.getAllByRole('link');
    expect(badgesOf(links[0]!)).toEqual(['5', '5']);
    expect(badgesOf(links[1]!)).toEqual(['2', '2']);
    // Nhóm duy nhất hai vế lệch nhau: 0 ở Cơ bản, 2 ở Nâng cao.
    expect(badgesOf(links[4]!)).toEqual(['chỉ ở Nâng cao', '2']);
  });

  /*
   * Ca đáng giá nhất của khối này. In số `0` ở đây đọc ra là "nhóm này rỗng", trong khi sự thật
   * là "nhóm này chỉ có ở chế độ kia" — đúng lớp im lặng mà FR-06 sinh ra để chặn. Và ô vẫn
   * phải là LINK: màn danh sách phía sau đã có khối rỗng riêng kèm nút bật chế độ, nên chặn
   * đường vào ở đây là cắt mất lối đi duy nhất tới hai công thức ấy.
   */
  it('nhóm rỗng ở chế độ Cơ bản: nói "chỉ ở Nâng cao", KHÔNG in số 0, và vẫn bấm được', () => {
    render(<CategoryGrid categories={CA_NHAN} basicCounts={new Map([['corporate-finance', 0]])} />);

    const link = screen.getByRole('link', { name: /Tài chính DN/ });
    const [coBan, nangCao] = badgesOf(link);
    expect(coBan).toBe('chỉ ở Nâng cao');
    expect(coBan).not.toContain('0');
    expect(nangCao).toBe('2');
    expect(parseListParams(queryOf(link.getAttribute('href') ?? '')).categoryId).toBe(
      'corporate-finance',
    );
  });

  it('nhóm không có trong `basicCounts` thì chỉ in MỘT số — số dự kiến, không phải 0', () => {
    // Bảo vệ hợp đồng cũ: `basicCounts` là tuỳ chọn, và thiếu khoá nào thì ô ấy về dáng bản đầu.
    render(<CategoryGrid categories={CA_NHAN} basicCounts={new Map([['savings', 4]])} />);

    const links = screen.getAllByRole('link');
    expect(badgesOf(links[0]!)).toEqual(['4', '5']);
    // 'Đầu tư' không có khoá: đúng một badge, mang số dự kiến.
    expect(links[1]?.textContent).toBe('Đầu tư2');
  });

  it('không truyền `basicCounts` thì ô giữ nguyên dáng bản đầu — đúng một con số', () => {
    render(<CategoryGrid categories={CA_NHAN} />);

    const shown = screen.getAllByRole('link').map((a) => a.textContent);
    expect(shown).toEqual(['Tiết kiệm5', 'Đầu tư2', 'Vay nợ3', 'Thuế TNCN1', 'Tài chính DN2']);
  });
});

/*
 * Phép chọn nằm trong CSS nên ca kiểm DOM không với tới được — quét thẳng file.
 *
 * Điều dễ sai nhất và không ca nào khác bắt được: chiều của điều kiện. HTML tĩnh KHÔNG mang
 * `data-mode` (mặc định là Cơ bản, khớp `DEFAULT_PREFERENCES.mode`), nên luật phải viết theo
 * hướng `:not([data-mode='advanced'])`. Ai đó đổi thành `[data-mode='basic']` cho "đọc xuôi" là
 * `out/index.html` và mọi máy chặn localStorage mất sạch con số mà mọi ca kiểm khác vẫn xanh.
 */
describe('CategoryGrid.module.css — chiều của phép chọn theo chế độ', () => {
  /*
   * Đường dẫn dựng từ `process.cwd()` chứ không từ `import.meta.url`: file này chạy trong môi
   * trường jsdom (dòng 1), ở đó `import.meta.url` không mang scheme `file:` nên `fileURLToPath`
   * ném ngay lúc thu thập ca kiểm. Vitest chạy từ gốc dự án — cùng gốc với `vitest.config.ts`.
   */
  const raw = readFileSync(join(process.cwd(), 'src/ui/browse/CategoryGrid.module.css'), 'utf8');

  /*
   * Bỏ chú thích trước khi soi: luật ở đây nói về BỘ CHỌN, mà phần chú thích ngay trên chúng lại
   * phải nhắc tới `[data-mode='basic']` để giải thích vì sao KHÔNG dùng nó. Quét cả chú thích là
   * ca "không nhánh nào bám vào" đỏ vì chính câu văn cấm nó.
   */
  const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');

  it('mặc định (không có thuộc tính) là chế độ Cơ bản', () => {
    expect(css).toContain(":global(html:not([data-mode='advanced'])) .countBasic");
    expect(css).toContain(":global(html[data-mode='advanced']) .countAdvanced");
  });

  it('không nhánh nào bám vào data-mode="basic" — ca mặc định sẽ rơi mất', () => {
    expect(css).not.toContain("[data-mode='basic']");
  });

  it('cả hai badge cùng ẩn mặc định, để đúng một nhánh bật lên', () => {
    expect(css).toMatch(/\.countBasic,\s*\n\s*\.countAdvanced\s*\{\s*\n\s*display: none;/);
  });

  it('dáng mờ của nhóm rỗng chỉ áp ở chế độ Cơ bản', () => {
    expect(css).toContain(":global(html:not([data-mode='advanced'])) .basicEmpty");
  });
});
