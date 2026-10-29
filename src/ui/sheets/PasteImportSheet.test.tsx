// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { PasteResult } from '@/application';

import { PasteImportSheet } from './PasteImportSheet';

/**
 * Tấm "Bảng dữ liệu" — ca kiểm HÀNH VI đầu tiên của nó (28/10/2026). Trước đó chỉ có ca kiểm CSS, nên
 * cách mẩu dán rơi vào lưới chưa từng được ghim.
 *
 * Lỗi tester báo, chủ dự án giao sửa: "Dán dữ liệu chuỗi OHLC không check ngày đã tồn tại (không đồng
 * nhất với thao tác Thêm dòng)". Đo trên Chrome trước khi sửa, với bảng sáu phiên 08–15/09/2026:
 *   · dán một dòng 15/09 vào dòng 1 → số của 15/09 bị thay, không câu nào nói;
 *   · dán một dòng 16/09 vào dòng 1 → phiên 15/09 biến mất, bảng vẫn "Không dòng nào đang lỗi";
 *   · dán một dòng 11/09 (đã có ở dòng 3) → tấm chỉ nói "không đọc được thứ tự phiên", phiên lặp
 *     chỉ lộ ra sau khi bấm Nạp.
 * Mỗi ca dưới dựng lại đúng một cảnh ấy.
 */

/** jsdom chưa cài đặt <dialog>.showModal() — cùng bản vá của `SaveCalcSheet.test.tsx`. */
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

afterEach(cleanup);

type Phien = NonNullable<Parameters<typeof PasteImportSheet>[0]['initialRows']>[number];

/** Sáu phiên, cũ → mới, như bảng WF-05 đưa sang. Lưới bày ngược lại: 15/09 là dòng 1. */
const SAU_PHIEN: ReadonlyArray<Phien> = [
  { date: '08/09/2026', open: 100, high: 105, low: 95, close: 102, volume: 1000 },
  { date: '09/09/2026', open: 102, high: 106, low: 100, close: 104, volume: 1100 },
  { date: '10/09/2026', open: 104, high: 108, low: 103, close: 107, volume: 1200 },
  { date: '11/09/2026', open: 107, high: 109, low: 104, close: 105, volume: 1300 },
  { date: '14/09/2026', open: 105, high: 110, low: 104, close: 109, volume: 1400 },
  { date: '15/09/2026', open: 109, high: 112, low: 108, close: 111, volume: 1500 },
];

/** Một dòng chép từ Excel: đủ sáu cột, ngăn bằng Tab, không dòng tiêu đề. */
const dong = (ngay: string): string => `${ngay}\t200\t210\t190\t205\t9999`;

function moTam(initialRows: ReadonlyArray<Phien> = SAU_PHIEN) {
  const onImport = vi.fn<(result: PasteResult) => void>();
  render(
    <PasteImportSheet
      open
      onClose={() => undefined}
      onImport={onImport}
      initialRows={initialRows}
    />,
  );
  return onImport;
}

/** Dán vào một ô như Ctrl + V: trình duyệt đưa chữ qua `clipboardData`. */
function dan(nhan: string, text: string): void {
  fireEvent.paste(screen.getByLabelText(nhan), { clipboardData: { getData: () => text } });
}

function giaTri(nhan: string): string {
  return (screen.getByLabelText(nhan) as HTMLInputElement).value;
}

function nutNap(soDong: number): HTMLButtonElement {
  return screen.getByRole('button', { name: `Nạp ${String(soDong)} dòng` }) as HTMLButtonElement;
}

/** Các phiên tấm gửi ra khi bấm Nạp, gọn thành ngày · giá đóng cửa. */
function daNap(onImport: ReturnType<typeof moTam>): string[] {
  const result = onImport.mock.calls[0]?.[0];
  return (result?.rows ?? []).map((row) => `${row.date} · ${String(row.close)}`);
}

describe('PasteImportSheet — dòng dán mang ngày là phiên MỚI, ngày đã có thì báo trùng', () => {
  it('dán một dòng cùng ngày vào chính dòng của ngày ấy: không đè, dòng mới bị báo trùng ngày', async () => {
    const onImport = moTam();
    dan('Ngày, Dòng 1', dong('15/09/2026'));

    // Phiên đã có giữ nguyên số; dòng vừa dán đứng ngay dưới nó.
    expect(giaTri('Giá đóng cửa, Dòng 1')).toBe('111');
    expect(giaTri('Giá đóng cửa, Dòng 2')).toBe('205');
    expect(giaTri('Ngày, Dòng 2')).toBe('15/09');

    // Báo ngay trong tấm, trước khi Nạp — như cột kiểm tra của bảng WF-05 báo khi "Thêm dòng".
    expect(screen.getByText('1 dòng trùng ngày')).toBeTruthy();
    expect(screen.getByText(/trùng ngày với một dòng khác \(dòng 2\)/)).toBeTruthy();
    expect(nutNap(6).disabled).toBe(true);

    // Bỏ dòng lỗi là một quyết định: tích rồi mới nạp, và phiên được nạp là phiên ĐÃ CÓ.
    await userEvent.click(screen.getByRole('checkbox', { name: /Bỏ qua 1 dòng lỗi/ }));
    await userEvent.click(nutNap(6));
    expect(daNap(onImport)).toEqual([
      '08/09/2026 · 102',
      '09/09/2026 · 104',
      '10/09/2026 · 107',
      '11/09/2026 · 105',
      '14/09/2026 · 109',
      '15/09/2026 · 111',
    ]);
  });

  it('dán một dòng ngày MỚI vào dòng 1: phiên đang ở đó còn nguyên, phiên mới được thêm', async () => {
    const onImport = moTam();
    dan('Ngày, Dòng 1', dong('16/09/2026'));

    // Bày mới trước: 16/09 lên đầu, 15/09 xuống dòng 2 với đúng số cũ.
    expect(giaTri('Ngày, Dòng 1')).toBe('16/09');
    expect(giaTri('Ngày, Dòng 2')).toBe('15/09');
    expect(giaTri('Giá đóng cửa, Dòng 2')).toBe('111');
    expect(screen.queryByText(/dòng trùng ngày/)).toBeNull();

    await userEvent.click(nutNap(7));
    expect(daNap(onImport)).toEqual([
      '08/09/2026 · 102',
      '09/09/2026 · 104',
      '10/09/2026 · 107',
      '11/09/2026 · 105',
      '14/09/2026 · 109',
      '15/09/2026 · 111',
      '16/09/2026 · 205',
    ]);
  });

  it('dán vào dòng 1 một ngày đã có ở dòng khác: dòng 1 còn nguyên, ngày lặp bị báo', () => {
    moTam();
    dan('Ngày, Dòng 1', dong('11/09/2026'));

    expect(giaTri('Ngày, Dòng 1')).toBe('15/09');
    expect(giaTri('Giá đóng cửa, Dòng 1')).toBe('111');
    expect(screen.getByText('1 dòng trùng ngày')).toBeTruthy();
    // Không còn câu "không đọc được thứ tự phiên", vốn chỉ sai nguyên nhân.
    expect(screen.queryByText(/Không đọc được thứ tự phiên/)).toBeNull();
    expect(nutNap(6).disabled).toBe(true);
  });

  it('dán nhiều phiên một lúc: phiên mới vào đúng ngày, phiên đã có chỉ bị báo, không phiên nào mất', async () => {
    const onImport = moTam();
    dan('Ngày, Dòng 1', [dong('16/09/2026'), dong('15/09/2026'), dong('12/09/2026')].join('\n'));

    expect(screen.getByText('1 dòng trùng ngày')).toBeTruthy();
    await userEvent.click(screen.getByRole('checkbox', { name: /Bỏ qua 1 dòng lỗi/ }));
    await userEvent.click(nutNap(8));
    expect(daNap(onImport)).toEqual([
      '08/09/2026 · 102',
      '09/09/2026 · 104',
      '10/09/2026 · 107',
      '11/09/2026 · 105',
      '12/09/2026 · 205',
      '14/09/2026 · 109',
      '15/09/2026 · 111',
      '16/09/2026 · 205',
    ]);
  });
});

describe('PasteImportSheet — mẩu dán không mang ngày vẫn điền theo ô như bảng tính', () => {
  it('dán một cột giá vào cột Giá đóng cửa thì sửa giá của các phiên đang có, ngày không đổi', async () => {
    const onImport = moTam();
    dan('Giá đóng cửa, Dòng 1', '205\n206');

    expect(giaTri('Giá đóng cửa, Dòng 1')).toBe('205');
    expect(giaTri('Giá đóng cửa, Dòng 2')).toBe('206');
    expect(giaTri('Ngày, Dòng 1')).toBe('15/09');
    expect(giaTri('Ngày, Dòng 2')).toBe('14/09');

    await userEvent.click(nutNap(6));
    expect(daNap(onImport).slice(-2)).toEqual(['14/09/2026 · 206', '15/09/2026 · 205']);
  });

  it('dán ngày vào chuỗi chỉ có giá đóng cửa thì gắn ngày cho đúng phiên ấy, không thêm dòng', async () => {
    const onImport = moTam([
      { date: '', open: null, high: null, low: null, close: 100, volume: null },
      { date: '', open: null, high: null, low: null, close: 101, volume: null },
    ]);
    dan('Ngày, Dòng 1', '14/09/2026\n15/09/2026');

    await userEvent.click(nutNap(2));
    expect(daNap(onImport)).toEqual(['14/09/2026 · 100', '15/09/2026 · 101']);
  });
});
