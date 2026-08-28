// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ORIGIN_KEY, ORIGIN_PREV_KEY, ORIGIN_RESTORE_KEY } from '@/application';

import { BackLink } from './BackLink';

/** Ghi một màn gốc vào `sessionStorage` đúng dạng `OriginTracker` vẫn ghi. */
function nho(url: string, scrollY = 0): void {
  window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url, scrollY }));
}

/** Ghi ô nhớ thứ hai — màn gốc liền TRƯỚC màn gốc đang nhớ. */
function nhoTruoc(url: string, scrollY = 0): void {
  window.sessionStorage.setItem(ORIGIN_PREV_KEY, JSON.stringify({ url, scrollY }));
}

/** Đặt URL giả cho jsdom. `window.location` không gán trực tiếp được nên đi qua history. */
function dungO(url: string): void {
  window.history.replaceState(null, '', url);
}

afterEach(cleanup);
beforeEach(() => {
  window.sessionStorage.clear();
  /*
   * Mặc định đứng ở một trang chi tiết, vì đó là màn `BackLink` có mặt nhiều nhất — và vì nút này
   * không bao giờ trỏ về chính màn đang đứng (quyết định 5), nên màn đang đứng là một phần của
   * phép đo chứ không phải chi tiết bỏ qua được. Để jsdom ở `/` mặc định là vô tình dựng ca
   * "màn gốc trùng màn đang đứng" cho mọi ca kiểm dùng `nho('/')`.
   */
  dungO('/cong-thuc/pe/');
});

/**
 * `href` của link, đã bỏ dấu `/` ngay trước `?` hoặc ở cuối.
 *
 * `next/link` trong jsdom không đọc `trailingSlash: true` của `next.config.mjs` nên nó cắt dấu
 * `/` cuối; bản build thật thì giữ (đã kiểm: `out/cong-thuc/pe/index.html` có
 * `href="/cong-thuc/"`). Đây là chuyện của môi trường test, không phải của component — nên
 * chuẩn hoá đi để ca kiểm đo đúng thứ nó muốn đo là ĐƯỜNG DẪN và BỘ LỌC.
 */
function hrefOf(name?: string): string {
  const link = name === undefined ? screen.getByRole('link') : screen.getByRole('link', { name });
  const href = link.getAttribute('href') ?? '';
  // Giữ nguyên '/' trơn — cắt nó đi thì còn chuỗi rỗng, chẳng đo được gì.
  return href === '/' ? href : href.replace(/\/(?=\?|$)/, '');
}

describe('BackLink — đường ra của các màn trong', () => {
  it('là một link THẬT, không phải nút — mở tab mới được và chạy cả khi chưa có JS', () => {
    render(<BackLink />);

    const link = screen.getByRole('link');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).not.toBeNull();
  });

  it('có chữ chứ không chỉ mỗi mũi tên — chính cái mũi tên trơn là thứ người dùng tìm không ra', () => {
    render(<BackLink />);

    expect(screen.getByRole('link', { name: 'Danh sách công thức' })).not.toBeNull();
  });

  it('chưa nhớ gì thì về danh sách trơn', () => {
    render(<BackLink />);

    expect(hrefOf()).toBe('/cong-thuc');
  });

  it('nhớ được thì về ĐÚNG bộ lọc vừa rời đi', () => {
    nho('/cong-thuc/?q=rui+ro&category=risk');
    render(<BackLink />);

    expect(hrefOf()).toBe('/cong-thuc?q=rui+ro&category=risk');
  });

  /*
   * Đây là ca của chính lỗi đã báo: vào công thức TỪ TRANG CHỦ rồi bấm quay ra thì phải về trang
   * chủ, không về danh sách. Trước đợt này màn gốc chỉ nhận URL `/cong-thuc/...` nên trang chủ
   * không bao giờ được nhớ, và nút quay lại ném người dùng sang một màn họ chưa từng đứng.
   */
  it('vào từ trang chủ thì quay về TRANG CHỦ, và nhãn nói đúng đích', () => {
    nho('/');
    render(<BackLink />);

    expect(hrefOf('Trang chủ')).toBe('/');
  });

  it('vào từ danh mục thì quay về danh mục', () => {
    nho('/danh-muc/');
    render(<BackLink />);

    expect(hrefOf('Danh mục')).toBe('/danh-muc');
  });

  /*
   * Nhãn phải ĐI THEO đích. Một nút ghi "Danh sách công thức" mà bấm vào ra trang chủ còn tệ hơn
   * mũi tên trơn: nó nói sai chứ không phải không nói.
   */
  it('nhãn đổi theo màn gốc, không đứng yên ở "Danh sách công thức"', () => {
    nho('/');
    render(<BackLink />);

    expect(screen.queryByRole('link', { name: 'Danh sách công thức' })).toBeNull();
  });

  /*
   * `sessionStorage` sửa được bằng tay và giá trị của nó đi thẳng vào `href`. Ranh giới an toàn
   * nằm ở `parseOrigin()` và có test riêng; ở đây kiểm rằng component THẬT SỰ đi qua nó.
   */
  it('không để rác trong sessionStorage lọt vào href', () => {
    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify({ url: 'javascript:alert(1)' }));
    render(<BackLink />);

    expect(hrefOf()).toBe('/cong-thuc');
  });

  it('chuỗi không phải JSON cũng không làm hỏng gì', () => {
    window.sessionStorage.setItem(ORIGIN_KEY, 'khong-phai-json');
    render(<BackLink />);

    expect(hrefOf()).toBe('/cong-thuc');
  });

  /*
   * Trang chi tiết KHÔNG được làm màn gốc — chủ dự án chốt: từ công thức này mở sang công thức
   * khác thì quay lại vẫn về màn gốc ban đầu, không đi ngược từng bước.
   */
  it('trang chi tiết không được nhận làm màn gốc', () => {
    nho('/cong-thuc/pe/');
    render(<BackLink />);

    expect(hrefOf()).toBe('/cong-thuc');
  });

  it('tắt `rememberOrigin` thì bỏ qua chỗ đã nhớ và dùng đường dẫn dự phòng', () => {
    nho('/cong-thuc/?category=risk');
    render(<BackLink rememberOrigin={false} fallbackHref="/" labelKey="nav.home" />);

    expect(hrefOf('Trang chủ')).toBe('/');
  });

  /*
   * Cờ quay lại chỉ được đặt khi NGƯỜI DÙNG BẤM, không phải khi component có mặt trên màn: thiếu
   * phân biệt đó thì mọi lần mở trang chủ đều nhảy cuộn về chỗ cũ.
   */
  it('chỉ đặt cờ quay lại khi thật sự bấm', () => {
    nho('/', 640);
    render(<BackLink />);

    expect(window.sessionStorage.getItem(ORIGIN_RESTORE_KEY)).toBeNull();

    fireEvent.click(screen.getByRole('link'));
    expect(window.sessionStorage.getItem(ORIGIN_RESTORE_KEY)).toBe('/');
  });

  it('mũi tên ẩn với trình đọc màn hình — chữ mới là tên của link', () => {
    const { container } = render(<BackLink />);

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});

/*
 * Lỗi chủ dự án báo, nguyên văn đường đi: "đang ở trong phần Danh mục mà bấm vào search ở top rồi
 * sau đó back ra bằng button Tìm công thức nhưng không back được".
 *
 * `/tim-kiem/` vừa nằm trong `ORIGINS` (để trang chi tiết mở từ một kết quả biết đường về đúng
 * kết quả ấy) vừa mang chính nút này. `OriginTracker` ghi đè `/danh-muc/` bằng `/tim-kiem/` ngay
 * khi vào màn, nên nút đọc lên thấy chính trang đang mở: nhãn "Tìm công thức", bấm không đi đâu.
 */
describe('BackLink — ở màn tìm kiếm, nơi màn gốc có thể là chính nó', () => {
  it('vào màn tìm từ danh mục thì quay lại về DANH MỤC, không về chính màn tìm', () => {
    dungO('/tim-kiem/');
    nho('/tim-kiem/');
    nhoTruoc('/danh-muc/');
    render(<BackLink />);

    expect(hrefOf('Danh mục')).toBe('/danh-muc');
  });

  it('nhãn không được là "Tìm công thức" khi đang đứng ở chính màn tìm', () => {
    dungO('/tim-kiem/');
    nho('/tim-kiem/');
    nhoTruoc('/danh-muc/');
    render(<BackLink />);

    expect(screen.queryByRole('link', { name: 'Tìm công thức' })).toBeNull();
  });

  /*
   * Màn tìm tự đặt con trỏ vào ô nhập rồi người dùng gõ ngay, nên `keydown` ghi lại `/tim-kiem/`
   * kèm truy vấn mới. Khác mỗi truy vấn thì vẫn là màn ấy — nếu so bằng cả URL thay vì bằng đường
   * dẫn thì đúng lỗi cũ quay lại ngay khi gõ ký tự đầu tiên.
   */
  it('gõ vào ô tìm không làm nút quay lại trỏ về chính nó', () => {
    dungO('/tim-kiem/?q=roe');
    nho('/tim-kiem/?q=roe');
    nhoTruoc('/danh-muc/');
    render(<BackLink />);

    expect(hrefOf('Danh mục')).toBe('/danh-muc');
  });

  it('vào thẳng bằng URL — không có ô thứ hai thì về danh sách công thức', () => {
    dungO('/tim-kiem/');
    nho('/tim-kiem/');
    render(<BackLink />);

    expect(hrefOf('Danh sách công thức')).toBe('/cong-thuc');
  });

  /*
   * Không được sửa lỗi bằng cách loại `/tim-kiem/` khỏi `ORIGINS`: từ một kết quả tìm mở vào
   * trang chi tiết thì nút quay lại ở ĐÓ vẫn phải về đúng kết quả ấy.
   */
  it('nút ở trang chi tiết vẫn về đúng màn tìm — hành vi cũ không đổi', () => {
    dungO('/cong-thuc/roe/');
    nho('/tim-kiem/?q=roe');
    nhoTruoc('/danh-muc/');
    render(<BackLink />);

    expect(hrefOf('Tìm công thức')).toBe('/tim-kiem?q=roe');
  });
});
