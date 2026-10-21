// @vitest-environment jsdom

import { cleanup, fireEvent, render } from '@testing-library/react';
import Link from 'next/link';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ORIGIN_HOLD_KEY,
  ORIGIN_KEY,
  ORIGIN_PREV_KEY,
  ORIGIN_RESTORE_KEY,
  parseOrigin,
} from '@/application';

import { OriginTracker, cancelScrollRestore, holdOriginThrough } from './OriginTracker';

/**
 * `usePathname()` chỉ để effect chạy lại khi đổi màn; nội dung thật lấy từ `window.location`,
 * đúng như component làm (xem docblock của nó về việc vì sao không dùng `useSearchParams`).
 */
const pathname = vi.hoisted(() => ({ value: '/cong-thuc/' }));
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
  dungO('/cong-thuc/');
  window.scrollY = 0;
});

describe('OriginTracker — ghi màn gốc', () => {
  it('ghi ngay khi gắn, để một màn vừa mở đã bấm vào công thức vẫn được nhớ', () => {
    dungO('/cong-thuc/');
    render(<OriginTracker />);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))).toEqual({
      url: '/cong-thuc/',
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
    dungO('/cong-thuc/');
    render(<OriginTracker />);

    window.scrollY = 640;
    fireEvent.pointerDown(document.body);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))?.scrollY).toBe(640);
  });

  it('người dùng bàn phím cũng được nhớ — họ không sinh ra pointerdown nào', () => {
    dungO('/cong-thuc/');
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
    dungO('/cong-thuc/');
    const first = render(<OriginTracker />);
    first.unmount();

    dungO('/cong-thuc/pe/');
    window.scrollY = 900;
    render(<OriginTracker />);
    fireEvent.pointerDown(document.body);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))?.url).toBe('/cong-thuc/');
  });

  /*
   * Đợt tối ưu hiệu năng 21/09/2026.
   *
   * `rememberOrigin` gắn vào `keydown` bắt buộc ở `document` của MỌI màn, nên nó chạy mỗi phím
   * người dùng gõ — kể cả khi đang gõ số ở trang chi tiết. Đọc `window.scrollY` là ép trình duyệt
   * dàn trang ngay lúc ấy, tức gánh nốt phần layout mà lượt render của phím trước còn treo. Ở trang
   * chi tiết thì cả lần đọc ấy là thừa, vì hàm chắc chắn bỏ cuộc ngay sau đó.
   *
   * jsdom không dàn trang nên không đo được mili giây ở đây; thứ đo được, và cũng là thứ quyết
   * định, là CÓ ĐỌC hay không.
   */
  it('trang chi tiết: không đọc scrollY nữa — lần đọc ấy ép trình duyệt dàn trang', () => {
    const goc = Object.getOwnPropertyDescriptor(window, 'scrollY');
    const doc = vi.fn(() => 0);
    Object.defineProperty(window, 'scrollY', { configurable: true, get: doc });

    try {
      dungO('/cong-thuc/pe/');
      render(<OriginTracker />);
      doc.mockClear();

      fireEvent.keyDown(document.body, { key: '1' });
      expect(doc).not.toHaveBeenCalled();

      // Còn ở màn gốc thì vẫn phải đọc — đó là cả lý do hàm này tồn tại.
      dungO('/cong-thuc/');
      render(<OriginTracker />);
      doc.mockClear();
      fireEvent.keyDown(document.body, { key: '1' });
      expect(doc).toHaveBeenCalled();
    } finally {
      if (goc === undefined) Reflect.deleteProperty(window, 'scrollY');
      else Object.defineProperty(window, 'scrollY', goc);
    }
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
    dungO('/cong-thuc/');
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

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/cong-thuc/', scrollY: 640 }));
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/cong-thuc/');
    dungO('/cong-thuc/');
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).toHaveBeenCalledWith({ top: 640, behavior: 'auto' });
    scrollTo.mockRestore();
  });

  /*
   * Ca giữ cho tính năng không thành phiền toái: mọi lần mở màn Công thức trơn đều KHỚP bản ghi, nên
   * nếu suy "quay lại" từ việc URL khớp thì bấm mục Công thức ở thanh điều hướng cũng nhảy cuộn.
   */
  it('KHÔNG cuộn khi vào màn theo lối thường — chỉ cú bấm quay lại mới đặt cờ', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/cong-thuc/', scrollY: 640 }));
    dungO('/cong-thuc/');
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  it('cờ dùng xong là hết hiệu lực, không dội sang lượt điều hướng sau', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/cong-thuc/', scrollY: 640 }));
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/cong-thuc/');
    dungO('/cong-thuc/');
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

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/cong-thuc/', scrollY: 640 }));
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/danh-muc/');
    dungO('/cong-thuc/');
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

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/cong-thuc/', scrollY: 640 }));
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/cong-thuc/');
    dungO('/cong-thuc/');
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).toHaveBeenCalledWith({ top: 640, behavior: 'auto' });
    scrollTo.mockRestore();
  });

  /*
   * Màn Công thức huỷ cú cuộn khi nó bỏ chuỗi tìm lúc quay về từ một kết quả tìm: chỗ đã nhớ là chỗ
   * trong danh sách KẾT QUẢ, không ứng với chỗ nào trên danh sách đầy đủ. Màn gọi trước effect của
   * component này, đúng thứ tự ca dưới dựng lại.
   */
  it('cancelScrollRestore() trước lượt gắn thì cú bấm quay lại không cuộn nữa', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: '/cong-thuc/', scrollY: 640 }));
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/cong-thuc/');
    dungO('/cong-thuc/');
    cancelScrollRestore();
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(ORIGIN_RESTORE_KEY)).toBeNull();
    scrollTo.mockRestore();
  });
});

/*
 * Về đúng THẺ đã bấm, không chỉ đúng độ cuộn (21/10/2026). Chủ dự án: _"quay lại màn danh sách công thức
 * và đúng chỗ vừa click vào công thức trước đó"_. jsdom không dàn trang, nên hộp của thẻ được giả lập:
 * mép trên trong TRANG cố định, mép trên trên MÀN = mép trong trang − `scrollY`, như trình duyệt thật.
 */
describe('OriginTracker — neo theo thẻ vừa bấm', () => {
  function giaHop(the: Element, docTop: () => number): void {
    the.getBoundingClientRect = () =>
      ({ top: docTop() - window.scrollY, bottom: 0, left: 0, right: 0 }) as DOMRect;
    the.getClientRects = () => [{}] as unknown as DOMRectList;
  }

  async function haiKhungHinh(): Promise<void> {
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  }

  /**
   * Chờ lần kiểm lại sau 250ms chạy xong. Ca nào có neo cũng phải chờ: hẹn giờ ấy chạy sau khi file
   * test đã gỡ môi trường jsdom thì `window` không còn, và vitest báo một lỗi lẻ không thuộc ca nào.
   */
  async function choKiemLai(): Promise<void> {
    await new Promise((done) => setTimeout(done, 300));
  }

  /**
   * Dựng một thẻ công thức trong `<main>` rồi trả nó cùng `href` ĐÚNG NHƯ ĐÃ DỰNG. `Link` của Next trong
   * vitest không đọc `trailingSlash` nên bỏ dấu `/` cuối; neo luôn so `href` của thẻ với chính nó, nên
   * ca kiểm lấy chuỗi từ DOM thay vì gõ cứng.
   */
  function dungThe(): { the: HTMLAnchorElement; href: string } {
    const { getByText } = render(
      <main>
        <Link href="/cong-thuc/pe/">
          <span>P/E</span>
        </Link>
      </main>,
    );
    const the = getByText('P/E').closest('a') as HTMLAnchorElement;
    return { the, href: the.getAttribute('href') ?? '' };
  }

  it('bấm vào một thẻ trong nội dung màn thì nhớ href và chỗ của nó trên màn', () => {
    dungO('/cong-thuc/');
    const { the, href } = dungThe();
    render(<OriginTracker />);
    window.scrollY = 1200;
    giaHop(the, () => 1640);

    // Trúng thẻ con bên trong link — `closest` vẫn phải tìm ra thẻ `<a>`.
    fireEvent.pointerDown(the.firstElementChild as Element);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))).toEqual({
      url: '/cong-thuc/',
      scrollY: 1200,
      anchor: { href, top: 440 },
    });
  });

  /* Thanh tab dưới, đầu trang cũng là `<a>`, nhưng không phải "chỗ đang đứng trong danh sách". */
  it('link ngoài <main> không thành neo', () => {
    dungO('/cong-thuc/');
    const { getByText } = render(
      <>
        <nav>
          <Link href="/danh-muc/">Danh mục</Link>
        </nav>
        <OriginTracker />
      </>,
    );
    fireEvent.pointerDown(getByText('Danh mục'));

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))).not.toHaveProperty('anchor');
  });

  it('quay lại thì cuộn sao cho thẻ ấy đứng lại đúng chỗ cũ, dù nó đã dời trong trang', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation((tuyChon) => {
      window.scrollY = (tuyChon as ScrollToOptions).top ?? 0;
    });

    dungO('/cong-thuc/?sort=recent');
    const { the, href } = dungThe();
    // "Vừa xem gần đây" đưa P/E lên đầu: trong trang nó còn ở 631 chứ không phải 1640.
    giaHop(the, () => 631);
    window.sessionStorage.setItem(
      ORIGIN_KEY,
      JSON.stringify({ url: '/cong-thuc/?sort=recent', scrollY: 1200, anchor: { href, top: 440 } }),
    );
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/cong-thuc/?sort=recent');
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).toHaveBeenCalledWith({ top: 191, behavior: 'auto' });
    await choKiemLai();
    expect(scrollTo).toHaveBeenCalledTimes(1);
    scrollTo.mockRestore();
  });

  /*
   * Thẻ ngoài khung nhìn mang `content-visibility: auto`, nên chiều cao là ước lượng cho tới khi được
   * vẽ: vẽ xong, thẻ neo trượt. Kiểm lại một lần — nhưng không kéo giật người đang tự cuộn.
   */
  it('thẻ trượt sau khi trang lắng thì chỉnh lại một lần', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation((tuyChon) => {
      window.scrollY = (tuyChon as ScrollToOptions).top ?? 0;
    });

    dungO('/cong-thuc/');
    const { the, href } = dungThe();
    let docTop = 1858;
    giaHop(the, () => docTop);
    window.sessionStorage.setItem(
      ORIGIN_KEY,
      JSON.stringify({ url: '/cong-thuc/', scrollY: 1500, anchor: { href, top: 358 } }),
    );
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/cong-thuc/');
    render(<OriginTracker />);
    await haiKhungHinh();
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 1500, behavior: 'auto' });

    docTop = 1898;
    await new Promise((done) => setTimeout(done, 300));
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 1540, behavior: 'auto' });
    expect(scrollTo).toHaveBeenCalledTimes(2);
    scrollTo.mockRestore();
  });

  it('không còn thẻ nào khớp neo thì rơi về độ cuộn đã nhớ', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    window.sessionStorage.setItem(
      ORIGIN_KEY,
      JSON.stringify({
        url: '/cong-thuc/',
        scrollY: 640,
        anchor: { href: '/cong-thuc/pe/', top: 300 },
      }),
    );
    window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, '/cong-thuc/');
    dungO('/cong-thuc/');
    render(<OriginTracker />);
    await haiKhungHinh();

    expect(scrollTo).toHaveBeenCalledWith({ top: 640, behavior: 'auto' });
    await choKiemLai();
    scrollTo.mockRestore();
  });
});

/*
 * Nút Lưu tự chuyển sang Danh mục (21/10/2026). Danh mục mở ra vì sản phẩm đưa tới, nên nó không được
 * thành màn gốc chỉ vì đã gắn: Back về công thức thì nút "‹" vẫn là "Danh sách công thức".
 */
describe('OriginTracker — giữ màn gốc qua cú chuyển của nút Lưu', () => {
  const DANH_SACH = { url: '/cong-thuc/', scrollY: 1500 };

  it('holdOriginThrough() bỏ neo # và chuẩn hoá đường dẫn', () => {
    holdOriginThrough('/danh-muc/#phep-tinh-da-luu');
    expect(window.sessionStorage.getItem(ORIGIN_HOLD_KEY)).toBe('/danh-muc/');
  });

  it('màn bị giữ gắn vào và cuộn thì KHÔNG ghi đè màn gốc cũ', async () => {
    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(DANH_SACH));
    holdOriginThrough('/danh-muc/#phep-tinh-da-luu');
    dungO('/danh-muc/');
    render(<OriginTracker />);
    fireEvent.scroll(window);
    await new Promise((done) => setTimeout(done, 200));

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))).toEqual(DANH_SACH);
    expect(window.sessionStorage.getItem(ORIGIN_PREV_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(ORIGIN_HOLD_KEY)).toBe('/danh-muc/');
  });

  /* Người dùng đã dùng Danh mục thật: từ đó nó LÀ màn gốc, như mọi lần mở Danh mục khác. */
  it('cú chạm đầu tiên trên màn bị giữ gỡ cờ rồi ghi như thường', () => {
    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(DANH_SACH));
    holdOriginThrough('/danh-muc/');
    dungO('/danh-muc/');
    render(<OriginTracker />);
    fireEvent.pointerDown(document.body);

    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))?.url).toBe('/danh-muc/');
    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_PREV_KEY))).toEqual(DANH_SACH);
    expect(window.sessionStorage.getItem(ORIGIN_HOLD_KEY)).toBeNull();
  });

  it('tới một màn gốc KHÁC thì cờ hết hiệu lực', () => {
    holdOriginThrough('/danh-muc/');
    dungO('/cong-thuc/');
    render(<OriginTracker />);

    expect(window.sessionStorage.getItem(ORIGIN_HOLD_KEY)).toBeNull();
    expect(parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY))?.url).toBe('/cong-thuc/');
  });
});
