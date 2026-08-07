import { describe, expect, it } from 'vitest';

import { backToListHref, listUrlToStore, parseListUrl } from './last-list-url';

describe('parseListUrl — chỉ nhận đường dẫn nội bộ trỏ vào màn danh sách', () => {
  it('nhận màn danh sách trơn', () => {
    expect(parseListUrl('/cong-thuc/')).toBe('/cong-thuc/');
  });

  it('nhận màn danh sách kèm bộ lọc — đây là cả lý do module này tồn tại', () => {
    expect(parseListUrl('/cong-thuc/?q=rui+ro&category=risk')).toBe(
      '/cong-thuc/?q=rui+ro&category=risk',
    );
  });

  it('bỏ qua khi chưa nhớ gì', () => {
    expect(parseListUrl(null)).toBeNull();
    expect(parseListUrl('')).toBeNull();
    expect(parseListUrl('   ')).toBeNull();
  });

  /*
   * Nội dung `sessionStorage` sửa được bằng tay và nó đi thẳng vào `href`, nên đây là ranh giới
   * an toàn thật chứ không phải phòng thủ cho vui.
   */
  it('chặn mọi thứ dẫn ra khỏi sản phẩm', () => {
    expect(parseListUrl('javascript:alert(1)')).toBeNull();
    expect(parseListUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(parseListUrl('https://vi.dụ.khac/cong-thuc/')).toBeNull();
    expect(parseListUrl('http://localhost:3000/cong-thuc/')).toBeNull();
  });

  it('chặn `//` — trình duyệt hiểu đó là tên miền khác chứ không phải đường dẫn nội bộ', () => {
    expect(parseListUrl('//vi-du-khac.com/cong-thuc/')).toBeNull();
    expect(parseListUrl('//cong-thuc/')).toBeNull();
  });

  it('chặn trang chi tiết — nó không phải màn danh sách', () => {
    expect(parseListUrl('/cong-thuc/pe/')).toBeNull();
    expect(parseListUrl('/cong-thuc/rsi-wilder/?x=1')).toBeNull();
  });

  it('chặn màn khác của chính sản phẩm', () => {
    expect(parseListUrl('/danh-muc/')).toBeNull();
    expect(parseListUrl('/cai-dat/')).toBeNull();
    expect(parseListUrl('/')).toBeNull();
  });

  it('chặn chuỗi méo và chuỗi rác quá dài', () => {
    expect(parseListUrl('/cong-thuc/?a=1?b=2')).toBeNull();
    expect(parseListUrl(`/cong-thuc/?q=${'x'.repeat(400)}`)).toBeNull();
  });
});

describe('backToListHref — luôn trả về một chỗ có thật', () => {
  it('dùng URL đã nhớ khi nó hợp lệ', () => {
    expect(backToListHref('/cong-thuc/?category=technical')).toBe('/cong-thuc/?category=technical');
  });

  it('lùi về danh sách trơn khi chưa nhớ gì hoặc nhớ phải rác', () => {
    expect(backToListHref(null)).toBe('/cong-thuc/');
    expect(backToListHref('javascript:alert(1)')).toBe('/cong-thuc/');
    expect(backToListHref('/cong-thuc/pe/')).toBe('/cong-thuc/');
  });
});

describe('listUrlToStore — chỉ nhớ khi đang đứng ở màn danh sách', () => {
  it('nhớ đường dẫn kèm tham số lọc', () => {
    expect(listUrlToStore('/cong-thuc/', '?q=roi')).toBe('/cong-thuc/?q=roi');
  });

  it('nhớ cả khi không có tham số nào', () => {
    expect(listUrlToStore('/cong-thuc/', '')).toBe('/cong-thuc/');
  });

  it('không nhớ khi đang ở màn khác', () => {
    expect(listUrlToStore('/cong-thuc/pe/', '')).toBeNull();
    expect(listUrlToStore('/tim-kiem/', '?q=roi')).toBeNull();
    expect(listUrlToStore('/', '')).toBeNull();
  });
});
