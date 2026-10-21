import { describe, expect, it } from 'vitest';

import { shortUrl } from './short-url';

describe('rút gọn đường dẫn nguồn làm chữ của link', () => {
  it('bỏ giao thức, `www.` và dấu gạch chéo cuối', () => {
    expect(shortUrl('https://www.phs.vn/san-pham/')).toBe('phs.vn/san-pham');
    expect(shortUrl('http://cafef.vn/')).toBe('cafef.vn');
  });

  it('đường dẫn ngắn giữ nguyên, không thêm dấu ba chấm', () => {
    expect(shortUrl('https://azfin.vn/p-e-thap-can-than-voi-bay-gia-tri/')).toBe(
      'azfin.vn/p-e-thap-can-than-voi-bay-gia-tri',
    );
  });

  /*
   * Mặc định không cắt (15/10/2026): chỗ in link tự cắt "…" bằng CSS đúng ở mép chỗ trống thật. Con
   * số cố định 48 từng cắt `tradingeconomics.com/vietnam/government-bond-yi…` khi còn nửa dòng trống.
   */
  it('không truyền `max` thì không cắt, chỉ bỏ giao thức và `www.`', () => {
    const dai =
      'https://cafef.vn/chuyen-nguoc-doi-nhung-co-that-p-e-thap-khong-phai-la-diem-hap-dan-188260716134057667.chn';
    expect(shortUrl(dai)).toBe(dai.replace('https://', ''));
    expect(shortUrl(dai)).not.toContain('…');
  });

  /* Link giá phiên của CafeF viết `start%44ate` (xem `src/core/source-link.ts`); chữ hiện ra phải đọc được. */
  it('giải mã %xx trong chữ hiện ra, giữ nguyên dấu / ? & =', () => {
    expect(
      shortUrl(
        'https://cafef.vn/du-lieu/lich-su-giao-dich-fpt-1.chn?start%44ate=11/09/2026&end%44ate=11/09/2026',
      ),
    ).toBe('cafef.vn/du-lieu/lich-su-giao-dich-fpt-1.chn?startDate=11/09/2026&endDate=11/09/2026');
    expect(shortUrl('https://vi.wikipedia.org/wiki/Ch%E1%BB%89_s%E1%BB%91')).toBe(
      'vi.wikipedia.org/wiki/Chỉ_số',
    );
    expect(shortUrl('https://a.vn/x%2Fy?q=%26')).toBe('a.vn/x%2Fy?q=%26');
    expect(shortUrl('https://a.vn/hong%E0%A4')).toBe('a.vn/hong%E0%A4');
  });

  it('đường dẫn dài cắt đúng `max` ký tự kể cả dấu ba chấm', () => {
    const dai =
      'https://cafef.vn/chuyen-nguoc-doi-nhung-co-that-p-e-thap-khong-phai-la-diem-hap-dan.chn';
    const ngan = shortUrl(dai, 40);
    expect(ngan).toHaveLength(40);
    expect(ngan.endsWith('…')).toBe(true);
    expect(ngan.startsWith('cafef.vn/chuyen-nguoc-doi')).toBe(true);
  });

  it('không bao giờ cắt vào host — mất host là mất phần nhận diện', () => {
    expect(shortUrl('https://mot-ten-mien-rat-dai-cua-cong-ty.com.vn/bai', 20)).toBe(
      'mot-ten-mien-rat-dai-cua-cong-ty.com.vn',
    );
  });

  it('chuỗi không phải URL thì trả lại chứ không ném lỗi', () => {
    expect(shortUrl('không phải url')).toBe('không phải url');
  });
});
