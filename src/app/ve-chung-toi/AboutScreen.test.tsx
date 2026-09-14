// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ROUTES } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { AboutScreen } from './AboutScreen';

/**
 * Màn "Về chúng tôi".
 *
 * Đây là màn tĩnh nhất của sản phẩm — không state, không mạng, không `localStorage` — nên ca kiểm
 * cố ý KHÔNG quét lại từng câu chữ (`i18n.test.ts` đã gác khoá mồ côi và bản dịch). Bốn thứ dưới
 * đây là những thứ dễ trôi mất trong một lần "dọn cho nhất quán", và mỗi thứ đều đã có lý do viết
 * ra ở chỗ nó được quyết định.
 */

function dungMan() {
  return render(
    <PreferencesProvider>
      <AboutScreen />
    </PreferencesProvider>,
  );
}

afterEach(cleanup);

describe('AboutScreen', () => {
  /*
   * Vế thứ hai của lời hứa ở `HEADER_TITLES`: màn nào không có tên trong bảng thì thân màn tự
   * dựng `<h1>`. Thêm '/ve-chung-toi/' vào bảng mà quên gỡ hero là trang có hai tiêu đề cấp một,
   * và trình đọc màn hình đọc tên màn hai lần liền nhau.
   */
  it('dựng đúng MỘT <h1>, và đó là tiêu đề của dải mở đầu', () => {
    dungMan();

    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]?.textContent).toBe('Công cụ tài chính thông minh cho nhà đầu tư hiện đại');
  });

  /*
   * Bản vẽ có HAI nút ("Truy cập ngay" và "Cài lên thiết bị"); chủ dự án bỏ nút thứ hai vì làm
   * thật thì phải bắt `beforeinstallprompt`, thứ Safari iOS không có nên nút sẽ chết câm trên
   * đúng nhóm máy cần nó nhất. Ca này chặn nút ấy quay lại lặng lẽ khi ai đó mở lại bản vẽ.
   */
  it('dải cuối có đúng một nút, trỏ về danh sách công thức', () => {
    dungMan();

    const nut = screen.getByRole('link', { name: 'Truy cập ngay' });
    expect(nut.getAttribute('href')?.replace(/\/$/, '')).toBe(ROUTES.formulas.replace(/\/$/, ''));
    expect(screen.queryByRole('link', { name: /Cài lên thiết bị/ })).toBeNull();
  });

  /*
   * Ảnh là thẻ <img> đầu tiên của repo. Hai thuộc tính kích thước là thứ chừa sẵn khung cho nó,
   * nên trang không giật khi ảnh về; `alt=""` là lựa chọn có chủ đích (ảnh trang trí, nội dung của
   * nó đã nằm trong đoạn chữ bên cạnh) chứ không phải chỗ bỏ sót — xem chú thích ở `AboutScreen`.
   */
  it('ảnh minh hoạ khai sẵn kích thước và không nằm trong cây trợ năng', () => {
    const { container } = dungMan();

    const anh = container.querySelector('img');
    expect(anh).not.toBeNull();
    expect(anh?.getAttribute('alt')).toBe('');
    expect(anh?.getAttribute('width')).toBe('1040');
    expect(anh?.getAttribute('height')).toBe('716');
    /* Ảnh nằm trên màn đầu và gần chắc là phần tử LCP — hoãn tải nó là tự làm chậm chính mình. */
    expect(anh?.getAttribute('loading')).toBeNull();
  });

  /*
   * Bản vẽ lặp nguyên văn thẻ thứ hai ở ô thứ ba — lỗi dựng ảnh, và là loại lỗi chép tay dễ đi
   * thẳng vào mã. Ca này so nội dung bốn thẻ với nhau thay vì ghim từng câu, nên nó vẫn gác được
   * khi câu chữ được viết lại.
   */
  it('khối "không phải là gì" có bốn mục KHÁC NHAU', () => {
    dungMan();

    const khoi = screen.getByRole('heading', { name: 'Faculator không phải là gì?' }).parentElement;
    expect(khoi).not.toBeNull();

    const muc = within(khoi as HTMLElement)
      .getAllByRole('listitem')
      .map((li) => li.textContent?.trim() ?? '');

    expect(muc).toHaveLength(4);
    expect(new Set(muc).size).toBe(4);
  });
});
