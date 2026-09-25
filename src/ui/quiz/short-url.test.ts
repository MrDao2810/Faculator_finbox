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
