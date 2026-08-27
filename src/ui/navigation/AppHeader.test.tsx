// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ROUTES } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { AppHeader } from './AppHeader';

/**
 * Thành phần của thanh trên.
 *
 * Phép kiểm ở đây KHÔNG lặp lại hành vi của từng nút — mỗi nút đã có file kiểm riêng. Nó gác
 * đúng một thứ: nút đổi giao diện phải nằm trong thanh, và phải nằm trong LỚP BỌC ẩn nó ở khổ
 * hẹp. Gỡ lớp bọc đi thì cụm nút "Sáng | Tối" hiện ra ở 360px, nơi thanh trên vốn đã hết chỗ —
 * mà đó là kiểu hỏng chỉ nhìn tận mắt mới thấy, vì jsdom không áp media query.
 */

/**
 * Đường dẫn giả, đổi được giữa các ca kiểm: từ đợt "nút chế độ chỉ ở màn danh sách", thanh trên
 * dựng ra KHÁC NHAU tuỳ route, nên một hằng số cố định không kiểm được luật ấy nữa.
 */
const duongDan = vi.hoisted(() => ({ hienTai: '/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => duongDan.hienTai,
}));

function dungThanh(path: string = ROUTES.home) {
  duongDan.hienTai = path;
  return render(
    <PreferencesProvider>
      <AppHeader />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  duongDan.hienTai = ROUTES.home;
});

afterEach(cleanup);

describe('AppHeader', () => {
  it('có nút icon đổi giao diện, dạng một nút bấm-là-đổi', async () => {
    dungThanh();

    const nut = await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' });
    expect(nut.textContent, 'là nút icon nên không mang chữ nào').toBe('');
  });

  it('nút đổi giao diện nằm trong lớp bọc chỉ hiện ở màn PC', async () => {
    dungThanh();

    const nut = await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' });
    const boc = nut.parentElement;

    expect(boc, 'nút phải có thẻ bọc riêng').not.toBeNull();
    expect(
      String(boc?.className),
      'thẻ bọc phải mang lớp themeControl — đó là chỗ ẩn nút dưới 1024px',
    ).toMatch(/themeControl/);
  });

  /*
   * Thanh trên KHÔNG được dùng bản có chữ: hai ô "Sáng | Tối" rộng gấp ba nút icon, và ở 1024px
   * cụm nút phải chỉ còn dư 16px.
   */
  it('dùng bản icon, không phải cụm hai ô có chữ của màn Cài đặt', async () => {
    dungThanh();

    await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' });
    expect(screen.queryByRole('group', { name: 'Giao diện' })).toBeNull();
  });

  it('vẫn giữ nguyên hai điều khiển có mặt ở mọi màn', async () => {
    dungThanh();

    await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' });
    expect(screen.getByRole('button', { name: 'Chuyển sang tiếng Anh' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Tìm công thức' })).toBeTruthy();
  });
});

/*
 * Nút chế độ chỉ bày ở màn danh sách — luật nằm ở `showsModeToggle()`, đây là chỗ kiểm rằng thanh
 * trên THẬT SỰ theo luật ấy.
 *
 * Kiểm ở đây chứ không chỉ ở `routes.test.ts` vì hai thứ khác nhau: kia gác cái hàm trả đúng
 * true/false, còn ca dưới gác việc `AppHeader` có thật sự cắm hàm ấy vào hay không. Bản trước
 * dựng `<ModeToggle />` thẳng, và ca "vẫn giữ nguyên ba điều khiển cũ" ở trên đã khoá đúng hành vi
 * cũ — nên nếu chỉ sửa `routes.ts` mà quên thanh trên thì bộ kiểm vẫn xanh.
 */
describe('AppHeader — nút chế độ theo màn', () => {
  const TEN_NHOM = 'Chế độ hiển thị';

  it('bày nút ở màn danh sách công thức', async () => {
    dungThanh(ROUTES.formulas);

    expect(await screen.findByRole('group', { name: TEN_NHOM })).toBeTruthy();
  });

  it('không bày ở trang chủ — nơi bấm xong không đổi một ký tự nào', async () => {
    dungThanh(ROUTES.home);

    // Chờ thanh dựng xong đã, rồi mới khẳng định vắng mặt: `queryBy` ngay lập tức thì ca này
    // xanh cả khi thanh chưa render gì, tức là xanh vì lý do sai.
    await screen.findByRole('link', { name: 'Tìm công thức' });
    expect(screen.queryByRole('group', { name: TEN_NHOM })).toBeNull();
  });

  it('không bày ở trang chi tiết — 94 trong 111 trang bấm không đổi gì', async () => {
    dungThanh('/cong-thuc/wacc/');

    await screen.findByRole('link', { name: 'Tìm công thức' });
    expect(screen.queryByRole('group', { name: TEN_NHOM })).toBeNull();
  });

  /*
   * Màn Cài đặt là đường về chế độ Cơ bản cho những màn không còn nút, nên nó phải có nút — chỉ
   * là do CHÍNH MÀN ẤY dựng (hàng "Chế độ hiển thị"), không phải do thanh trên. Ca này gác vế
   * thanh trên; vế màn Cài đặt do `SettingsScreen.test.tsx` gác.
   */
  it('không bày ở màn Cài đặt — màn ấy tự có hàng riêng', async () => {
    dungThanh(ROUTES.settings);

    await screen.findByRole('link', { name: 'Tìm công thức' });
    expect(screen.queryByRole('group', { name: TEN_NHOM })).toBeNull();
  });
});
