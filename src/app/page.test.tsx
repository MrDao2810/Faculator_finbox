import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import RootRedirect, { metadata } from './page';

/*
 * `/` chỉ còn chuyển hướng về `/cong-thuc/` — trang chủ riêng đã gộp vào màn Công thức.
 *
 * Lớp chuyển hướng chính là `public/_redirects` ở bản triển khai; `verify-static.mjs` gác file ấy.
 * Ở đây gác lớp dự phòng cho máy chạy thử, nơi `_redirects` không được đọc.
 */
describe('trang / — chuyển hướng về màn Công thức', () => {
  const html = renderToStaticMarkup(<RootRedirect />);

  it('tự chuyển ngay bằng meta refresh, không cần JavaScript', () => {
    expect(html).toMatch(/<meta http-equiv="refresh" content="0;url=\/cong-thuc\/"/);
  });

  it('có link bấm tay dẫn đúng /cong-thuc/', () => {
    expect(html).toMatch(/href="\/cong-thuc\/?"/);
  });

  /*
   * Trang này không được mang nội dung công thức nào: có là `/` và `/cong-thuc/` bày cùng một thứ
   * — đúng điều FR-25 cấm, và đúng lý do bản cũ phải tách phạm vi ô tìm của trang chủ.
   */
  it('không mang link công thức nào', () => {
    expect(html).not.toMatch(/href="\/cong-thuc\/[a-z0-9-]+\/?"/);
  });

  it('đặt noindex nhưng vẫn follow', () => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
