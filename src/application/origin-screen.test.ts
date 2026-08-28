import { describe, expect, it } from 'vitest';

import type { Origin } from './origin-screen';
import { backTarget, matchOrigin, originPath, originToStore, parseOrigin } from './origin-screen';

/** Chuỗi đúng dạng `OriginTracker` ghi vào `sessionStorage`. */
function ghi(url: string, scrollY = 0): string {
  return JSON.stringify({ url, scrollY });
}

/** Bản ghi đã đọc xong, dạng `backTarget()` nhận. */
function ban(url: string, scrollY = 0): Origin {
  return { url, scrollY };
}

describe('matchOrigin() — bốn màn được phép làm gốc', () => {
  it('nhận trang chủ, danh sách, tìm kiếm và danh mục', () => {
    expect(matchOrigin('/')?.labelKey).toBe('nav.home');
    expect(matchOrigin('/cong-thuc/')?.labelKey).toBe('nav.backToList');
    expect(matchOrigin('/tim-kiem/')?.labelKey).toBe('search.label');
    expect(matchOrigin('/danh-muc/')?.labelKey).toBe('nav.portfolio');
  });

  it('giữ nguyên truy vấn — bộ lọc là thứ đáng nhớ nhất của màn danh sách', () => {
    expect(matchOrigin('/cong-thuc/?q=rui+ro&category=risk')?.labelKey).toBe('nav.backToList');
  });

  it('thiếu dấu / cuối vẫn khớp — đường dẫn từ router không phải lúc nào cũng có', () => {
    expect(matchOrigin('/cong-thuc')?.labelKey).toBe('nav.backToList');
    expect(matchOrigin('/danh-muc?tab=formulas')?.labelKey).toBe('nav.portfolio');
  });

  /*
   * Chủ dự án chốt: từ công thức này mở sang công thức khác (khối chuỗi WF-04, ô nhập liên kết)
   * thì nút quay lại vẫn về màn gốc BAN ĐẦU. Điều kiện của việc đó là trang chi tiết không bao
   * giờ được ghi làm gốc.
   */
  it('trang chi tiết công thức KHÔNG phải màn gốc', () => {
    expect(matchOrigin('/cong-thuc/pe/')).toBeNull();
    expect(matchOrigin('/cong-thuc/wacc/?ma=FPT')).toBeNull();
  });

  it('màn không có link nào vào trang chi tiết thì cũng không phải màn gốc', () => {
    expect(matchOrigin('/du-lieu/')).toBeNull();
    expect(matchOrigin('/cai-dat/')).toBeNull();
  });

  /*
   * Ranh giới an toàn của cả module: nội dung `sessionStorage` người dùng sửa được, mà nó đi
   * thẳng vào thuộc tính `href`.
   */
  it('chặn mọi thứ dẫn ra ngoài sản phẩm', () => {
    expect(matchOrigin('javascript:alert(1)')).toBeNull();
    expect(matchOrigin('data:text/html,<script>')).toBeNull();
    expect(matchOrigin('https://ten-mien-khac.example/')).toBeNull();
    // '//' đầu chuỗi: trình duyệt hiểu là URL tuyệt đối theo giao thức hiện tại, vẫn ra ngoài.
    expect(matchOrigin('//ten-mien-khac.example/')).toBeNull();
  });

  it('chuỗi méo và chuỗi quá dài đều rớt', () => {
    expect(matchOrigin('')).toBeNull();
    expect(matchOrigin('/cong-thuc/?a=1?b=2')).toBeNull();
    expect(matchOrigin(`/cong-thuc/?q=${'x'.repeat(400)}`)).toBeNull();
  });
});

describe('parseOrigin() — đọc bản ghi trong sessionStorage', () => {
  it('đọc được bản ghi hợp lệ', () => {
    expect(parseOrigin(ghi('/', 640))).toEqual({ url: '/', scrollY: 640 });
  });

  it('chưa có gì thì trả null chứ không ném', () => {
    expect(parseOrigin(null)).toBeNull();
  });

  it('không phải JSON thì trả null chứ không ném — đây là dữ liệu người dùng sửa được', () => {
    expect(parseOrigin('khong-phai-json')).toBeNull();
    expect(parseOrigin('{"url":')).toBeNull();
  });

  it('sai hình dạng thì rớt', () => {
    expect(parseOrigin('"chuoi-tran"')).toBeNull();
    expect(parseOrigin('null')).toBeNull();
    expect(parseOrigin(JSON.stringify({ url: '/' }))).toBeNull();
    expect(parseOrigin(JSON.stringify({ url: '/', scrollY: 'cao' }))).toBeNull();
    expect(parseOrigin(JSON.stringify({ url: '/', scrollY: Number.NaN }))).toBeNull();
  });

  it('URL không phải màn gốc thì rớt, dù bản ghi đúng hình dạng', () => {
    expect(parseOrigin(ghi('/cong-thuc/pe/', 10))).toBeNull();
    expect(parseOrigin(ghi('javascript:alert(1)', 0))).toBeNull();
  });

  it('vị trí cuộn âm hay vô lý bị kẹp về khoảng dùng được', () => {
    expect(parseOrigin(ghi('/', -50))?.scrollY).toBe(0);
    expect(parseOrigin(ghi('/', 9_999_999))?.scrollY).toBe(500_000);
    expect(parseOrigin(ghi('/', 640.7))?.scrollY).toBe(640);
  });
});

describe('originToStore() — có đáng ghi không', () => {
  it('ghép đường dẫn với truy vấn', () => {
    expect(originToStore('/cong-thuc/', '?category=risk', 120)).toEqual({
      url: '/cong-thuc/?category=risk',
      scrollY: 120,
    });
  });

  it('không có truy vấn thì không để lại dấu ? thừa', () => {
    expect(originToStore('/', '', 0)).toEqual({ url: '/', scrollY: 0 });
  });

  /*
   * Trả `null` nghĩa là "đừng ghi", KHÔNG phải "hãy xoá". Đứng ở trang chi tiết mà xoá bản ghi cũ
   * thì chính nút quay lại của trang ấy mất đích.
   */
  it('đứng ở trang chi tiết thì không có gì để ghi', () => {
    expect(originToStore('/cong-thuc/pe/', '', 300)).toBeNull();
  });

  it('scrollY không hữu hạn thì về 0 chứ không lọt NaN vào JSON', () => {
    expect(originToStore('/', '', Number.NaN)?.scrollY).toBe(0);
  });
});

describe('originPath() — một cách chuẩn hoá duy nhất', () => {
  it('bỏ truy vấn, giữ đường dẫn', () => {
    expect(originPath('/danh-muc/?tab=cong-thuc')).toBe('/danh-muc/');
    expect(originPath('/cong-thuc/?q=rui+ro&category=risk')).toBe('/cong-thuc/');
  });

  it('thiếu dấu / cuối thì thêm vào — router không phải lúc nào cũng đưa nó', () => {
    expect(originPath('/danh-muc')).toBe('/danh-muc/');
    expect(originPath('/danh-muc?tab=cong-thuc')).toBe('/danh-muc/');
  });

  it('trang chủ giữ nguyên một dấu /', () => {
    expect(originPath('/')).toBe('/');
  });
});

describe('backTarget() — đích và nhãn không được rời nhau', () => {
  /** Màn đang đứng mặc định là trang chi tiết: nơi nút quay lại vốn hay có mặt nhất. */
  const O_CHI_TIET = '/cong-thuc/pe/';

  it('chưa nhớ gì thì dùng đường dẫn dự phòng kèm nhãn dự phòng', () => {
    expect(
      backTarget({ origin: null, prev: null, here: O_CHI_TIET }, '/cong-thuc/', 'nav.backToList'),
    ).toEqual({ href: '/cong-thuc/', labelKey: 'nav.backToList' });
  });

  it('nhớ được thì nhãn ĐI THEO màn gốc, không giữ nhãn dự phòng', () => {
    expect(
      backTarget(
        { origin: ban('/'), prev: null, here: O_CHI_TIET },
        '/cong-thuc/',
        'nav.backToList',
      ),
    ).toEqual({ href: '/', labelKey: 'nav.home' });
  });

  it('màn gốc là danh sách đã lọc thì giữ nguyên bộ lọc trong href', () => {
    const target = backTarget(
      { origin: ban('/cong-thuc/?category=risk'), prev: null, here: O_CHI_TIET },
      '/cong-thuc/',
      'nav.backToList',
    );
    expect(target.href).toBe('/cong-thuc/?category=risk');
  });

  it('ô thứ hai chỉ là dự bị — còn dùng được ô thứ nhất thì không đụng tới nó', () => {
    const target = backTarget(
      { origin: ban('/danh-muc/'), prev: ban('/'), here: O_CHI_TIET },
      '/cong-thuc/',
      'nav.backToList',
    );
    expect(target).toEqual({ href: '/danh-muc/', labelKey: 'nav.portfolio' });
  });
});

/*
 * Đúng lỗi chủ dự án báo: đứng ở Danh mục, bấm kính lúp sang màn tìm, rồi bấm quay lại thì không
 * đi đâu cả. `/tim-kiem/` vừa là màn gốc của trang chi tiết vừa mang nút quay lại của chính nó,
 * nên `ORIGIN_KEY` lúc ấy giữ chính nó và nút tự trỏ về trang đang mở.
 */
describe('backTarget() — không bao giờ trỏ về chính màn đang đứng', () => {
  it('màn gốc CHÍNH LÀ màn đang đứng thì lùi sang ô thứ hai', () => {
    expect(
      backTarget(
        { origin: ban('/tim-kiem/'), prev: ban('/danh-muc/'), here: '/tim-kiem/' },
        '/cong-thuc/',
        'nav.backToList',
      ),
    ).toEqual({ href: '/danh-muc/', labelKey: 'nav.portfolio' });
  });

  it('so bằng ĐƯỜNG DẪN — khác mỗi truy vấn thì vẫn là màn ấy, không phải đường ra', () => {
    const target = backTarget(
      { origin: ban('/tim-kiem/?q=roe'), prev: ban('/'), here: '/tim-kiem/' },
      '/cong-thuc/',
      'nav.backToList',
    );
    expect(target).toEqual({ href: '/', labelKey: 'nav.home' });
  });

  it('thiếu dấu / cuối ở màn đang đứng vẫn nhận ra là trùng', () => {
    const target = backTarget(
      { origin: ban('/tim-kiem/'), prev: ban('/danh-muc/'), here: '/tim-kiem' },
      '/cong-thuc/',
      'nav.backToList',
    );
    expect(target.href).toBe('/danh-muc/');
  });

  it('cả hai ô đều trùng màn đang đứng thì rơi về dự phòng', () => {
    expect(
      backTarget(
        { origin: ban('/tim-kiem/?q=roe'), prev: ban('/tim-kiem/'), here: '/tim-kiem/' },
        '/cong-thuc/',
        'nav.backToList',
      ),
    ).toEqual({ href: '/cong-thuc/', labelKey: 'nav.backToList' });
  });

  it('vào thẳng màn tìm bằng URL — chưa có ô thứ hai thì cũng rơi về dự phòng', () => {
    expect(
      backTarget(
        { origin: ban('/tim-kiem/'), prev: null, here: '/tim-kiem/' },
        '/cong-thuc/',
        'nav.backToList',
      ),
    ).toEqual({ href: '/cong-thuc/', labelKey: 'nav.backToList' });
  });

  it('ô thứ hai chứa rác thì bỏ qua nó chứ không dựng href từ rác', () => {
    expect(
      backTarget(
        { origin: ban('/tim-kiem/'), prev: ban('/cong-thuc/pe/'), here: '/tim-kiem/' },
        '/cong-thuc/',
        'nav.backToList',
      ),
    ).toEqual({ href: '/cong-thuc/', labelKey: 'nav.backToList' });
  });
});
