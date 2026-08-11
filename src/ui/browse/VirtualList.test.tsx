// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { VIRTUALIZE_THRESHOLD } from '@/application';

import { VirtualList } from './VirtualList';

afterEach(cleanup);

interface Muc {
  id: string;
  ten: string;
}

const muc = (n: number): Muc[] =>
  Array.from({ length: n }, (_, i) => ({ id: `m${String(i)}`, ten: `Mục ${String(i)}` }));

/**
 * Số mục vừa đủ để bật nhánh ảo hoá.
 *
 * Trước đây các ca dưới viết cứng 107 — số công thức của thư viện — vì hồi ngưỡng còn là 40 thì
 * 107 đi qua nhánh ảo hoá. Ngưỡng nay là 1000 nên 107 KHÔNG còn bật nó, và cả nhóm ca hoá đỏ dù
 * component vẫn đúng. Bám vào ngưỡng thay vì vào một con số rời: đổi ngưỡng thì ca kiểm đi theo,
 * và không ca nào lại đỏ vì một lý do chẳng liên quan tới thứ nó đang gác.
 */
const VUOT_NGUONG = VIRTUALIZE_THRESHOLD + 1;

function mo(items: ReadonlyArray<Muc>) {
  return render(
    <VirtualList items={items} itemKey={(m) => m.id} label="Danh sách">
      {(m) => <a href={`/x/${m.id}/`}>{m.ten}</a>}
    </VirtualList>,
  );
}

/** Dòng nội dung: có `aria-posinset`. Khối đệm thì không — nó mang `aria-hidden`. */
function dongNoiDung(container: HTMLElement): HTMLLIElement[] {
  return [...container.querySelectorAll('li[aria-posinset]')] as HTMLLIElement[];
}

function khoiDem(container: HTMLElement): HTMLLIElement[] {
  return [...container.querySelectorAll('li[aria-hidden]')] as HTMLLIElement[];
}

describe('VirtualList — danh sách ngắn thì dựng thẳng', () => {
  it(`đúng ngưỡng ${String(VIRTUALIZE_THRESHOLD)} mục vẫn chưa ảo hoá`, () => {
    const { container } = mo(muc(VIRTUALIZE_THRESHOLD));

    expect(container.querySelectorAll('li')).toHaveLength(VIRTUALIZE_THRESHOLD);
    expect(khoiDem(container)).toHaveLength(0);
  });

  it('mọi mục đều có mặt, không mục nào bị bỏ', () => {
    mo(muc(12));
    expect(screen.getByText('Mục 0')).not.toBeNull();
    expect(screen.getByText('Mục 11')).not.toBeNull();
  });
});

describe('VirtualList — vượt ngưỡng thì ảo hoá', () => {
  it('chỉ dựng một phần danh sách, phần còn lại thay bằng khối đệm', () => {
    const { container } = mo(muc(VUOT_NGUONG));

    const dong = dongNoiDung(container);
    expect(dong.length).toBeGreaterThan(0);
    expect(dong.length).toBeLessThan(VUOT_NGUONG);
    expect(khoiDem(container).length).toBeGreaterThan(0);
  });

  it('nói cho trình đọc màn hình biết tổng thật, không phải số dòng đang dựng', () => {
    const { container } = mo(muc(VUOT_NGUONG));
    const dong = dongNoiDung(container);

    expect(dong[0]?.getAttribute('aria-setsize')).toBe(String(VUOT_NGUONG));
    expect(dong[0]?.getAttribute('aria-posinset')).toBe('1');
  });

  it('số thứ tự chạy liên tục, không nhảy cóc', () => {
    const { container } = mo(muc(VUOT_NGUONG));
    const so = dongNoiDung(container).map((li) => Number(li.getAttribute('aria-posinset')));

    expect(so).toEqual(so.map((_, i) => (so[0] ?? 0) + i));
  });
});

/*
 * Nhóm ca kiểm gác đúng lỗi đã gặp trên màn thật.
 *
 * Hai bản trước đều ÉP chiều cao cho mọi dòng — bản đầu viết cứng 84px, bản sau lấy số đo của
 * một dòng dò rồi áp cho cả danh sách — kèm `overflow: hidden`. Với thư viện thật, thẻ công
 * thức có sáu chiều cao khác nhau (102 tới 194px), nên thẻ cao bị cắt mất tới 72px và chữ tràn
 * đè lên thẻ bên cạnh.
 *
 * jsdom không có bố cục nên không đo được chiều cao thật; nhưng CƠ CHẾ gây lỗi thì kiểm được
 * và nó là thứ duy nhất cần chặn: dòng nội dung không được mang chiều cao ép sẵn.
 */
describe('VirtualList — không được ép chiều cao dòng nội dung', () => {
  it('dòng nội dung KHÔNG có style height — ép là cắt cụt thẻ cao', () => {
    const { container } = mo(muc(VUOT_NGUONG));

    for (const li of dongNoiDung(container)) {
      expect(li.style.height, `dòng ${li.getAttribute('aria-posinset') ?? '?'}`).toBe('');
    }
  });

  it('chỉ KHỐI ĐỆM mới có chiều cao đặt sẵn — đó là việc của nó', () => {
    const { container } = mo(muc(VUOT_NGUONG));
    const dem = khoiDem(container);

    expect(dem.length).toBeGreaterThan(0);
    expect(dem.every((li) => li.style.height !== '')).toBe(true);
  });

  it('dòng nội dung không bọc gì che nội dung tràn', () => {
    const { container } = mo(muc(VUOT_NGUONG));

    for (const li of dongNoiDung(container)) {
      expect(li.style.overflow).toBe('');
    }
  });
});

describe('VirtualList — đổi danh sách thì không vỡ', () => {
  it('lọc từ trên ngưỡng xuống dưới ngưỡng thì quay về dựng thẳng', () => {
    const { container, rerender } = mo(muc(VUOT_NGUONG));
    expect(khoiDem(container).length).toBeGreaterThan(0);

    rerender(
      <VirtualList items={muc(5)} itemKey={(m) => m.id} label="Danh sách">
        {(m) => <a href={`/x/${m.id}/`}>{m.ten}</a>}
      </VirtualList>,
    );

    expect(container.querySelectorAll('li')).toHaveLength(5);
    expect(khoiDem(container)).toHaveLength(0);
  });

  it('danh sách rỗng không ném lỗi và không dựng dòng nào', () => {
    const { container } = mo([]);
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });
});
