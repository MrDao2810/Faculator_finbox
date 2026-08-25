// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PRICE_SERIES_KEY, serializeStoredSeries } from '@/application';
import type { SeriesRow } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { DataTableScreen } from './DataTableScreen';

/**
 * Màn WF-05 Bảng dữ liệu — ca kiểm đầu tiên của màn này.
 *
 * Màn dựng từ đợt 6 mà chưa từng có file test, và đó chính là lý do chủ dự án phải tự phát hiện
 * ra rằng bảng "quá mờ nhạt … không biết là có thể nhập liệu được vào đó": không có gì ghim lại
 * rằng từng ô của bảng là một ô NHẬP chứ không phải chữ chỉ để đọc.
 *
 * Hình thức (viền, nền) thì jsdom không đo được — CSS Module ở đây chỉ là tên lớp giả. Nên phần
 * ghim được là phần ngữ nghĩa: ô phải là `<input>` sửa được, và ô số chưa điền phải có dấu gạch
 * chờ thay vì trắng trơn.
 */

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
}));

/** Hai sheet WF-10/WF-11 dựng sẵn trong cây; jsdom chưa cài đặt <dialog>.showModal(). */
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

/**
 * Đúng hình dạng chuỗi mà chủ dự án gặp: chỉ có giá đóng cửa, cột ngày là chỉ số phiên, bốn cột
 * Mở/Cao/Thấp/Khối lượng bỏ trống — do "Xem ví dụ minh hoạ" của trang công thức Beta đổ sang.
 */
const CHI_CO_GIA_DONG: ReadonlyArray<SeriesRow> = [
  { date: '1', open: null, high: null, low: null, close: 100, volume: null },
  { date: '2', open: null, high: null, low: null, close: 100.44999999999997, volume: null },
];

function napBang(rows: ReadonlyArray<SeriesRow> = CHI_CO_GIA_DONG): void {
  window.localStorage.setItem(PRICE_SERIES_KEY, serializeStoredSeries({ code: 'VNM', rows }));
}

function moMan() {
  return render(
    <PreferencesProvider>
      <DataTableScreen />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

describe('DataTableScreen — bảng phải đọc ra là bảng nhập được', () => {
  it('mỗi ô của bảng là một <input> sửa được, không phải chữ chỉ để đọc', async () => {
    napBang();
    moMan();

    // Sáu cột × hai dòng. Lấy theo nhãn trợ năng chứ không theo tên lớp CSS.
    const oDong = await screen.findByLabelText('Dòng 2 · Đóng');

    expect(oDong.tagName).toBe('INPUT');
    expect((oDong as HTMLInputElement).readOnly).toBe(false);
    expect((oDong as HTMLInputElement).disabled).toBe(false);
  });

  it('ô số chưa điền hiện dấu gạch chờ, ô ngày thì không', async () => {
    napBang();
    moMan();

    const oMo = await screen.findByLabelText('Dòng 1 · Mở');
    const oNgay = await screen.findByLabelText('Dòng 1 · Ngày');

    // Trắng trơn thì đọc ra là ô khoá — đúng thứ chủ dự án báo là "quá mờ nhạt".
    expect(oMo.getAttribute('placeholder')).toBe('—');
    expect(oNgay.getAttribute('placeholder')).toBeNull();
  });

  it('bàn phím số của điện thoại mở đúng loại cho từng cột', async () => {
    napBang();
    moMan();

    expect((await screen.findByLabelText('Dòng 1 · Đóng')).getAttribute('inputmode')).toBe(
      'decimal',
    );
    expect((await screen.findByLabelText('Dòng 1 · Ngày')).getAttribute('inputmode')).toBe('text');
  });
});

/*
 * Dòng ghi chú "Chuỗi giá chỉ lưu trên thiết bị này (localStorage). Không gửi lên máy chủ." bị bỏ
 * ngày 25/08/2026 theo yêu cầu của chủ dự án — người dùng không cần đọc nó.
 *
 * Ghim lại vì câu ấy trước đó được docblock của màn viện dẫn NFR-SEC-01/COM-03, nên rất dễ bị
 * dựng lại "cho đúng yêu cầu". Bỏ được là vì màn này KHÔNG gọi mạng lần nào; chỗ thật sự cần
 * cảnh báo là màn Danh mục, nơi mã cổ phiếu có rời máy — `portfolio.localOnly` vẫn còn nguyên và
 * có ca kiểm riêng ghim nguyên văn.
 */
describe('DataTableScreen — không còn dòng ghi chú localStorage', () => {
  it('bảng có số liệu: không nhắc localStorage, cũng không nhắc "máy chủ"', async () => {
    napBang();
    const { container } = moMan();

    await screen.findByLabelText('Dòng 1 · Đóng');

    expect(container.textContent).not.toContain('localStorage');
    expect(container.textContent).not.toContain('máy chủ');
    expect(screen.queryByText('CỤC BỘ')).toBeNull();
  });

  it('bảng trống cũng vậy — dòng ghi chú trước đây đứng ngoài khối bảng', async () => {
    const { container } = moMan();

    await screen.findByText(/Bảng đang trống/);

    expect(container.textContent).not.toContain('localStorage');
    expect(screen.queryByText('CỤC BỘ')).toBeNull();
  });
});
