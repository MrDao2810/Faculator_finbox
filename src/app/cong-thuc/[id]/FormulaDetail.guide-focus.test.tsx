// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';

import { FORMULAS, FORMULA_GROUPS, groupOfFormula } from '@/application';
import type { BaiHuongDan, FormulaSpec } from '@/application';
import { baiHuongDanFor } from '@/application/huong-dan';
import { substitutionShape } from '@/application/thay-so';

import { FormulaDetail } from './FormulaDetail';
import { buildNotationView } from './notation-view';

/**
 * Tiêu điểm khi đóng khung "Lấy số liệu ở đâu" bằng Esc (29/10/2026). Từ 28/10 tên ô trong khung có
 * `<button>` ký hiệu, nên tiêu điểm có thể nằm TRONG khung lúc nó bị tháo khỏi DOM; ghi chú cũ trong
 * `FormulaDetail` ("khung này không có gì nhận tiêu điểm") hết đúng. Esc lần hai phải trả tiêu điểm về
 * nút "?" đã mở khung, không thả nó xuống `<body>`.
 */
const feed = vi.hoisted(() => ({
  listTickers: vi.fn(),
  snapshots: vi.fn(),
  priceHistory: vi.fn(async () => []),
}));
vi.mock('@/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data')>();
  return { ...actual, MARKET_FEED: feed };
});
const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});
afterEach(() => {
  cleanup();
});

const AS_OF = '2026-08-04';

function Man({ spec, bai }: { spec: FormulaSpec; bai?: BaiHuongDan }) {
  const notation = buildNotationView(spec);
  const thaySoCay = substitutionShape(spec);
  return (
    <FormulaDetail
      spec={spec}
      modules={FORMULA_GROUPS[groupOfFormula(spec.id)!]}
      asOf={AS_OF}
      notation={notation}
      {...(thaySoCay === null ? {} : { thaySoCay })}
      {...(bai === undefined ? {} : { bai })}
    />
  );
}

it('Esc lần hai đóng khung "?" khi tiêu điểm đang ở nút ký hiệu bên trong: tiêu điểm về nút "?"', async () => {
  const user = userEvent.setup();
  const spec = FORMULAS.find((f) => f.id === 'ncav-tren-co-phieu')!;
  render(<Man spec={spec} bai={baiHuongDanFor(spec.id, AS_OF)} />);

  const nutHoi = screen.getByRole('link', { name: /Hướng dẫn: lấy số liệu ở đâu/ });
  await user.click(nutHoi);
  const khung = await screen.findByRole('dialog');
  await user.click(within(khung).getByRole('button', { name: '(N)' }));

  await user.keyboard('{Escape}'); // đóng khung chú thích, tiêu điểm về nút "(N)"
  expect(screen.queryByRole('dialog')).not.toBeNull();
  await user.keyboard('{Escape}'); // đóng khung "?"
  expect(screen.queryByRole('dialog')).toBeNull();

  expect(document.activeElement).toBe(nutHoi);
});
