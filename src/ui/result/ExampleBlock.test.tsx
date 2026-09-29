// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FORMULAS, clampToSpec, t } from '@/application';
import type { FormulaSpec, ViDuGiai } from '@/application';
import { viDuGiaiFor } from '@/application/vi-du';

import { ExampleBlock } from './ExampleBlock';

afterEach(cleanup);

function specOf(id: string): FormulaSpec {
  const found = FORMULAS.find((spec) => spec.id === id);
  if (found === undefined) throw new Error(`Registry thiếu công thức '${id}'.`);
  return found;
}

/** Lời giải mẫu của P/E — cùng hình dữ liệu `src/core/vi-du/` mang, dựng tại chỗ cho ca kiểm. */
const GIAI_PE: ViDuGiai = {
  tinh: { vi: 'hệ số P/E của FPT phiên 11/09/2026', en: "FPT's P/E on the 2026-09-11 session" },
  gan: [
    {
      kyHieu: 'P',
      moTa: {
        vi: 'là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫',
        en: "is FPT's close on the 2026-09-11 session: 72700 ₫",
      },
    },
    { kyHieu: 'EPS', giaTri: { vi: '5.867', en: '5867' } },
  ],
  thaySo: { vi: '72.700 ÷ 5.867', en: '72700 ÷ 5867' },
  nguon: [
    {
      url: 'https://cafef.vn/du-lieu/lich-su-gia-fpt',
      nhan: { vi: 'Giá FPT phiên 11/09/2026', en: 'FPT price, 2026-09-11' },
    },
    {
      url: 'https://fpt.com.vn/bao-cao-tai-chinh-q2-2026',
      nhan: { vi: 'EPS bốn quý gần nhất', en: 'Trailing EPS' },
    },
  ],
};

const HINH = <span data-testid="hinh">P/E = P / EPS</span>;

describe('ExampleBlock — lời giải có cấu trúc, cùng hình lời giải bài tập (29/09/2026)', () => {
  function veLoiGiai() {
    return render(<ExampleBlock formula={specOf('pe')} giai={GIAI_PE} hinhCongThuc={HINH} />);
  }

  /*
   * Thứ tự dòng của lời giải bài tập, cộng dòng "Đọc kết quả" — chủ dự án giữ câu diễn giải của ví
   * dụ thành dòng cuối, ngay trước Nguồn.
   */
  it('sáu dòng theo đúng thứ tự: công thức · thay số · áp vào · kết quả · đọc kết quả · nguồn', () => {
    const { container } = veLoiGiai();
    const nhan = [...container.querySelectorAll('dl > div > dt')].map((dt) => dt.textContent);
    expect(nhan).toEqual([
      t('quiz.giai.congThuc'),
      t('quiz.giai.thaySo'),
      t('quiz.giai.apVao'),
      t('quiz.giai.ketQua'),
      t('example.docKetQua'),
      t('quiz.source'),
    ]);
  });

  it('dòng công thức đặt hình của trang kèm đuôi "để tính …", dòng áp vào in đúng phép tính', () => {
    veLoiGiai();
    expect(screen.getByTestId('hinh')).toBeTruthy();
    expect(screen.getByText(/để tính hệ số P\/E của FPT phiên 11\/09\/2026/)).toBeTruthy();
    expect(screen.getByText('72.700 ÷ 5.867')).toBeTruthy();
  });

  it('kết quả lấy từ ví dụ của Registry, câu diễn giải của ví dụ thành dòng Đọc kết quả', () => {
    const spec = specOf('pe');
    veLoiGiai();
    expect(screen.getByText(/12,39/)).toBeTruthy();
    expect(screen.getByText(spec.example.note?.vi ?? '∅')).toBeTruthy();
  });

  /*
   * "nguồn của phần ví dụ thực tế nên đưa về kiểu link để người dùng click vào về trang nguồn" — mỗi
   * link là một `<a>` thật mở tab mới, có nhãn nói nó cho con số nào; tên nguồn cũ vẫn đứng dưới.
   */
  it('nguồn là link bấm được, mở tab mới, mỗi link có nhãn; tên nguồn cũ vẫn còn', () => {
    const spec = specOf('pe');
    veLoiGiai();
    const links = screen.getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(GIAI_PE.nguon.map((n) => n.url));
    for (const a of links) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
    }
    expect(screen.getByText(/Giá FPT phiên 11\/09\/2026/)).toBeTruthy();
    expect(screen.getByText(spec.example.source?.vi ?? '∅')).toBeTruthy();
  });

  /* Chủ dự án 29/09/2026: "không cho gõ được vào ví dụ thực tế nữa". */
  it('không còn ô nhập nào — lời giải mẫu đứng yên', () => {
    const { container } = veLoiGiai();
    expect(container.querySelector('input')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});

describe('ExampleBlock — chưa có lời giải thì lùi về hình chỉ-để-đọc', () => {
  it('bày số của ví dụ dạng chữ, không có ô nào, vẫn có dòng kết quả', () => {
    const { container } = render(<ExampleBlock formula={specOf('pe')} />);
    expect(container.querySelector('input')).toBeNull();
    expect(screen.getByText('Ví dụ thực tế')).toBeTruthy();
    expect(screen.getByText('72.700 ₫')).toBeTruthy();
    expect(screen.getByText(/12,39/)).toBeTruthy();
  });
});

/*
 * ── Ca rẻ mà đắt giá ──────────────────────────────────────────────────────────────────────────
 *
 * Khối này tra nhãn của từng số theo khoá của `example.inputs`. Chỉ cần MỘT công thức khai lệch khoá
 * là chỗ đó không tra ra `VariableSpec` và in thẳng khoá thô. Một vòng lặp chặn được chuyện đó cho cả
 * 111 công thức.
 */
describe('ExampleBlock — hợp đồng với Registry, quét cả 111 công thức', () => {
  it('mọi example.inputs đều khớp khoá biến và nằm trong miền hợp lệ', () => {
    for (const spec of FORMULAS) {
      const keys = Object.keys(spec.example.inputs);
      expect(keys.length, spec.id).toBeGreaterThan(0);

      for (const [key, value] of Object.entries(spec.example.inputs)) {
        const variable = spec.variables.find((v) => v.key === key);
        expect(
          variable,
          `${spec.id}: example khai khoá '${key}' mà không có biến nào tên vậy`,
        ).not.toBeUndefined();
        if (variable === undefined) continue;

        expect(Number.isFinite(value), `${spec.id}.${key}`).toBe(true);
        /*
         * Phải nằm sẵn trong miền, chứ không trông vào việc `clampToSpec` sẽ sửa hộ: "Xem ví dụ
         * minh hoạ" nạp bộ số này vào khối Số liệu, và một số ngoài miền sẽ bị kẹp — ô nhập và lời
         * giải của ví dụ khi ấy nói hai số về cùng một ví dụ.
         */
        expect(clampToSpec(value, variable), `${spec.id}.${key} ngoài miền`).toBe(value);
      }
    }
  });

  it('ví dụ điền TRỌN mọi biến của công thức', () => {
    const thieu = FORMULAS.filter(
      (spec) => Object.keys(spec.example.inputs).length < spec.variables.length,
    ).map((spec) => spec.id);

    expect(thieu, 'ví dụ của những công thức này khai thiếu ô').toEqual([]);
  });

  it('cả 111 khối dựng được với lời giải thật của mình, và không khối nào có ô nhập', () => {
    for (const spec of FORMULAS) {
      const giai = viDuGiaiFor(spec.id);
      const { container, unmount } = render(
        <ExampleBlock
          formula={spec}
          {...(giai === undefined ? {} : { giai })}
          hinhCongThuc={HINH}
        />,
      );
      expect(container.querySelector('input'), spec.id).toBeNull();
      if (giai !== undefined) {
        const nguon = within(container).queryAllByRole('link');
        expect(nguon.length, spec.id).toBe(giai.nguon.length);
      }
      unmount();
    }
  });
});
