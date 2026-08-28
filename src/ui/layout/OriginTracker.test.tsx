// @vitest-environment jsdom

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ORIGIN_KEY, ORIGIN_PREV_KEY, ORIGIN_RESTORE_KEY, parseOrigin } from '@/application';

import { OriginTracker } from './OriginTracker';

/**
 * `usePathname()` chỉ để effect chạy lại khi đổi màn; nội dung thật lấy từ `window.location`,
 * đúng như component làm (xem docblock của nó về việc vì sao không dùng `useSearchParams`).
 */
const pathname = vi.hoisted(() => ({ value: '/' }));
vi.mock('next/navigation', () => ({
  usePathname: () => pathname.value,
}));

/** Đặt URL giả cho jsdom. `window.location` không gán trực tiếp được nên đi qua history. */
function dungO(url: string): void {
  pathname.value = url.split('?')[0] ?? '/';
  window.history.replaceState(null, '', url);
}

afterEach(cleanup);
beforeEach(() => {
  window.sessionStorage.clear();
  dungO('/');
  window.scrollY = 0;
});

describe('OriginTracker — ghi màn gốc', () => {
  it('ghi ngay khi gắn, để một màn vừa mở đã bấm vào công thức vẫn được nhớ', () => {
    dungO('/');
    render(<OriginTracker />);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))).toEqual({
      url: '/',
      scrollY: 0,
    });
  });

  it('nhớ cả truy vấn của màn danh sách', () => {
    dungO('/cong-thuc/?category=risk');
    render(<OriginTracker />);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))?.url).toBe(
      '/cong-thuc/?category=risk',
    );
  });

  /*
   * Cú bấm mở một công thức bắt đầu bằng `pointerdown`, lúc URL và `scrollY` còn là của màn gốc.
   * Đây cũng là chỗ bắt được vị trí cuộn mới nhất mà không phải ghi mỗi khung hình.
   */
  it('bấm chuột thì ghi lại vị trí cuộn ngay tại thời điểm ấy', () => {
    dungO('/');
    render(<OriginTracker />);

    window.scrollY = 640;
    fireEvent.pointerDown(document.body);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))?.scrollY).toBe(640);
  });

  it('người dùng bàn phím cũng được nhớ — họ không sinh ra pointerdown nào', () => {
    dungO('/');
    render(<OriginTracker />);

    window.scrollY = 320;
    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))?.scrollY).toBe(320);
  });

  /*
   * Trả `null` ở trang chi tiết nghĩa là "đừng ghi", KHÔNG phải "hãy xoá": xoá là chính nút quay
   * lại của trang đang đứng mất đích.
   */
  it('ở trang chi tiết thì không ghi đè, cũng không xoá bản ghi cũ', () => {
    dungO('/');
    const first = render(<OriginTracker />);
    first.unmount();

    dungO('/cong-thuc/pe/');
    window.scrollY = 900;
    render(<OriginTracker />);
    fireEvent.pointerDown(document.body);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))?.url).toBe('/');
  });

  /** Mở một màn rồi rời đi, đúng cách `usePathname()` làm effect chạy lại. */
  function ghePhai(url: string): void {
    dungO(url);
    render(<OriginTracker />).unmount();
  }

  /*
   * Ô nhớ thứ hai có mặt vì `/tim-kiem/` vừa là màn gốc của trang chi tiết vừa mang nút quay lại
   * của chính nó — xem `ORIGIN_PREV_KEY`. Không có nó thì nút ấy tự trỏ về trang đang mở.
   */
  it('đổi màn thì màn gốc cũ lùi xuống ô thứ hai chứ không mất', () => {
    ghePhai('/danh-muc/');

    dungO('/tim-kiem/');
    render(<OriginTracker />);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))?.url).toBe('/tim-kiem/');
    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_PREV_KEY))?.url).toBe('/danh-muc/');
  });

  /*
   * Đổi mỗi truy vấn là VẪN ĐỨNG NGUYÊN một màn: đổi chip lọc, gõ ô tìm, cuộn. Đẩy nó xuống ô thứ
   * hai là biến ô ấy thành bản sao của ô thứ nhất — màn tìm tự đặt con trỏ vào ô nhập nên chỉ cần
   * một ký tự là hỏng.
   */
  it('đổi mỗi truy vấn thì ô thứ hai đứng yên', () => {
    ghePhai('/danh-muc/');
    ghePhai('/cong-thuc/');

    dungO('/cong-thuc/?category=risk');
    render(<OriginTracker />);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))?.url).toBe(
      '/cong-thuc/?category=risk',
    );
    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_PREV_KEY))?.url).toBe('/danh-muc/');
  });

  /*
   * Ghé trang chi tiết rồi quay lại màn tìm là đường đi thật: `/danh-muc/` phải sống sót qua cả
   * hai chặng, nếu không thì lần quay lại thứ hai lại rơi về danh sách trơn.
   */
  it('ghé trang chi tiết rồi quay lại màn tìm thì ô thứ hai vẫn giữ màn gốc ban đầu', () => {
    ghePhai('/danh-muc/');
    ghePhai('/tim-kiem/');
    ghePhai('/cong-thuc/pe/');

    dungO('/tim-kiem/');
    render(<OriginTracker />);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_PREV_KEY))?.url).toBe('/danh-muc/');
  });

  it('gỡ hết listener khi rời màn — không để lại cái nào ghi tiếp', () => {
    dungO('/');
    const { unmount } = render(<OriginTracker />);
    unmount();

    window.sessionStorage.clear();
    fireEvent.pointerDown(document.body);

    expect(window.sessionStorage.getItem(ORIGIN_KEY)).toBeNull();
  });
});

describe('OriginTracker — khôi phục vị trí cuộn', () => {
  /** Chạy hai khung hình mà `restoreScroll()` chờ trước khi cuộn. */
  async function haiKhungHinh(): Promise<void> {
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  }

  it('bấm quay lại rồi về đúng màn thì cuộn về chỗ cũ', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/', scrollY: 640 }));
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/');
    dungO('/');
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).toHaveBeenCalledWith({ top: 640, behavior: 'auto' });
    scrollTo.mockRestore();
  });

  /*
   * Ca giữ cho tính năng không thành phiền toái: mọi lần mở trang chủ đều KHỚP bản ghi, nên nếu
   * suy "quay lại" từ việc URL khớp thì bấm mục Trang chủ ở thanh dưới cũng nhảy cuộn.
   */
  it('KHÔNG cuộn khi vào màn theo lối thường — chỉ cú bấm quay lại mới đặt cờ', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/', scrollY: 640 }));
    dungO('/');
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  it('cờ dùng xong là hết hiệu lực, không dội sang lượt điều hướng sau', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/', scrollY: 640 }));
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/');
    dungO('/');
    const { unmount } = render(<OriginTracker />);
    await haiKhungHinh();
    unmount();

    scrollTo.mockClear();
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  /*
   * Quay lại TỪ màn tìm kiếm: `ORIGIN_KEY` lúc ấy đang giữ `/tim-kiem/`, còn chỗ cuộn cần tìm nằm
   * ở ô thứ hai. Chỉ đọc ô thứ nhất thì về đúng màn nhưng đứng ở đỉnh trang — mất đúng thứ
   * `Origin.scrollY` sinh ra để giữ.
   */
  it('chỗ cuộn nằm ở ô thứ hai thì vẫn khôi phục được', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/tim-kiem/', scrollY: 0 }));
    window.sessionStorage.setItem(
      ORIGIN_PREV_KEY,
      JSON.stringify({ url: '/danh-muc/', scrollY: 900 }),
    );
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/danh-muc/');
    dungO('/danh-muc/');
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).toHaveBeenCalledWith({ top: 900, behavior: 'auto' });
    scrollTo.mockRestore();
  });

  it('cờ trỏ một màn khác thì không cuộn — người dùng đã đi chỗ khác giữa chừng', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/', scrollY: 640 }));
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/danh-muc/');
    dungO('/');
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  /*
   * Khôi phục phải chạy TRƯỚC lần ghi lúc gắn, không thì `scrollY = 0` của trang vừa mở đè mất
   * con số đang nhớ và cú cuộn ngay sau đó không còn chỗ nào để tới.
   */
  it('lần ghi lúc gắn không được xoá mất vị trí đang chờ khôi phục', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/', scrollY: 640 }));
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/');
    dungO('/');
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).toHaveBeenCalledWith({ top: 640, behavior: 'auto' });
    scrollTo.mockRestore();
  });
});
