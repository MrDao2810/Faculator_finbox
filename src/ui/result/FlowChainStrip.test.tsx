// @vitest-environment jsdom

/**
 * Dải luồng móc nối — gói WBS 2.4.6, nối dây thật ở gói 5.2.3.
 *
 * Component dựng xong từ đợt 5 mà **chưa có ca kiểm nào** vì chưa màn nào dùng tới. Đợt này nó
 * lên màn, nên phần bất biến của nó phải được khoá lại — đặc biệt là luật mũi tên: dải bày ra
 * quan hệ phụ thuộc, mà bày sai quan hệ thì nó nói dối về chính thứ nó sinh ra để nói.
 */

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { t } from '@/application';
import type { FormulaSpec } from '@/application';

import { FlowChainStrip } from './FlowChainStrip';

afterEach(cleanup);

/** Spec tối thiểu — dải chỉ đọc `id`, `name.vi` và `dependsOn`. */
function spec(id: string, name: string, dependsOn?: ReadonlyArray<string>): FormulaSpec {
  return {
    id,
    categoryId: 'valuation',
    name: { vi: name, en: id },
    description: { vi: '', en: '' },
    latex: '',
    chartType: 'none',
    level: 'advanced',
    tags: [],
    resultUnit: '%',
    variables: [],
    explanation: {
      meaning: { vi: '', en: '' },
      whenToUse: { vi: '', en: '' },
      howToRead: { vi: '', en: '' },
      commonMistakes: { vi: '', en: '' },
    },
    example: { title: { vi: '', en: '' }, inputs: {}, expected: 0 },
    tests: [],
    source: [],
    ...(dependsOn === undefined
      ? {}
      : { dependsOn: dependsOn.map((formulaId) => ({ formulaId, variableKey: 'x' })) }),
  };
}

/** Chuỗi thẳng ba bước: A → B → C. */
const THANG = [spec('a', 'CAPM'), spec('b', 'Gordon', ['a']), spec('c', 'Biên an toàn', ['b'])];

/** Đồ thị rẽ nhánh: A cấp cho cả B lẫn C, B và C không liên quan gì nhau. */
const RE_NHANH = [spec('a', 'CAPM'), spec('b', 'WACC', ['a']), spec('c', 'Gordon', ['a'])];

function cacBuoc(): ReadonlyArray<string> {
  return screen.getAllByRole('listitem').map((li) => li.textContent ?? '');
}

describe('thứ tự và nội dung dải', () => {
  it('vẽ đủ các bước theo thứ tự topo, không theo thứ tự mảng truyền vào', () => {
    render(<FlowChainStrip formulas={[THANG[2]!, THANG[0]!, THANG[1]!]} />);

    expect(cacBuoc().map((text) => text.replace(/[→·]/g, '').trim())).toEqual([
      'CAPM',
      'Gordon',
      'Biên an toàn',
    ]);
  });

  it('không có bước nào thì không dựng gì cả', () => {
    const { container } = render(<FlowChainStrip formulas={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('đánh dấu bước đang xem bằng aria-current, không chỉ bằng màu', () => {
    render(<FlowChainStrip formulas={THANG} currentId="b" />);

    const danhDau = screen
      .getAllByRole('listitem')
      .filter((li) => li.querySelector('[aria-current="step"]') !== null);

    expect(danhDau).toHaveLength(1);
    expect(danhDau[0]?.textContent).toContain('Gordon');
  });
});

describe('mũi tên chỉ vẽ khi có quan hệ phụ thuộc thật', () => {
  it('chuỗi thẳng thì hai mũi tên nối ba bước', () => {
    render(<FlowChainStrip formulas={THANG} />);

    expect(screen.getAllByRole('list')[0]?.textContent).toContain('→');
    expect(cacBuoc()[1]).toContain('→');
    expect(cacBuoc()[2]).toContain('→');
  });

  it('hai nhánh song song KHÔNG bị nối bằng mũi tên', () => {
    // WACC và Gordon cùng nhận từ CAPM. Sắp topo xong chúng đứng cạnh nhau, nhưng WACC không
    // cấp gì cho Gordon — vẽ mũi tên giữa chúng là bịa ra một quan hệ không tồn tại.
    render(<FlowChainStrip formulas={RE_NHANH} />);

    const buoc = cacBuoc();
    expect(buoc[1]).toContain('→'); // CAPM → WACC: có thật
    expect(buoc[2]).not.toContain('→'); // WACC · Gordon: không có thật
    expect(buoc[2]).toContain(t('flow.branch'));
  });
});

describe('trạng thái từng bước', () => {
  it('bước đang lỗi mang nhãn chữ, không chỉ đổi màu (NFR-USA-06)', () => {
    render(<FlowChainStrip formulas={THANG} statuses={{ b: 'error', a: 'ok' }} />);

    const buoc = screen.getAllByRole('listitem');
    expect(within(buoc[1]!).getByText(t('flow.stepError'))).toBeDefined();
    expect(buoc[0]?.textContent).not.toContain(t('flow.stepError'));
  });

  it('không truyền statuses thì không bước nào mang nhãn lỗi', () => {
    render(<FlowChainStrip formulas={THANG} />);

    expect(screen.queryByText(t('flow.stepError'))).toBeNull();
  });
});

describe('đồ thị khai sai', () => {
  it('có vòng thì vẫn vẽ phần lành và nói rõ phần kẹt', () => {
    const vong = [spec('a', 'A', ['b']), spec('b', 'B', ['a']), spec('c', 'C')];
    render(<FlowChainStrip formulas={vong} />);

    // C không dính vòng nên vẫn có mặt.
    expect(cacBuoc().some((text) => text.includes('C'))).toBe(true);

    const bao = screen.getByRole('status');
    expect(bao.textContent).toContain(t('flow.cyclicWarning'));
    expect(bao.textContent).toContain('a, b');
  });
});
