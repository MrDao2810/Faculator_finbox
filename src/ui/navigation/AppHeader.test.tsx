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
 * đúng một thứ: nút đổi giao diện phải có mặt trong thanh, ở đúng chỗ nút tìm kiếm cũ từng đứng —
 * kể từ đợt đổi icon tìm kiếm thành icon đổi theme, nút này hiện ở MỌI khổ màn, không còn bị ẩn
 * dưới 1024px.
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
  });
});

/*
 * Nút chế độ chỉ bày ở màn danh sách — luật nằm ở `showsModeToggle()`, đây là chỗ kiểm rằng thanh
 * trên THẬT SỰ theo luật ấy.
 *
 * Kiểm ở đây chứ không chỉ ở `routes.test.ts` vì hai thứ khác nhau: kia gác cái hàm trả đúng
 * true/false, còn ca dưới gác việc `AppHeader` có thật sự cắm hàm ấy vào hay không. Bản trước
 * dựng `<ModeToggle />` thẳng, và ca "vẫn giữ nguyên hai điều khiển cũ" ở trên đã khoá đúng hành vi
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
    await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' });
    expect(screen.queryByRole('group', { name: TEN_NHOM })).toBeNull();
  });

  it('không bày ở trang chi tiết — 94 trong 111 trang bấm không đổi gì', async () => {
    dungThanh('/cong-thuc/wacc/');

    await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' });
    expect(screen.queryByRole('group', { name: TEN_NHOM })).toBeNull();
  });

  /*
   * Màn Cài đặt là đường về chế độ Cơ bản cho những màn không còn nút, nên nó phải có nút — chỉ
   * là do CHÍNH MÀN ẤY dựng (hàng "Chế độ hiển thị"), không phải do thanh trên. Ca này gác vế
   * thanh trên; vế màn Cài đặt do `SettingsScreen.test.tsx` gác.
   */
  it('không bày ở màn Cài đặt — màn ấy tự có hàng riêng', async () => {
    dungThanh(ROUTES.settings);

    await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' });
    expect(screen.queryByRole('group', { name: TEN_NHOM })).toBeNull();
  });
});

/*
 * Danh tính đầu thanh đổi theo màn — luật ở `headerTitleKey()`, đây là chỗ gác việc thanh trên
 * thật sự theo luật ấy.
 *
 * Ba ca dưới cùng bảo vệ MỘT bất biến: chỗ đứng ấy có đúng một thứ. Kiểm cả hai vế (thứ phải có
 * VÀ thứ phải vắng) chứ không chỉ vế đầu — bày cả tên sản phẩm lẫn tên màn thì hai ca "phải có"
 * vẫn xanh, mà đó chính là hỏng.
 */
describe('AppHeader — danh tính đổi theo màn', () => {
  it('trang chủ bày tên sản phẩm, không có tiêu đề màn', async () => {
    dungThanh(ROUTES.home);

    expect(screen.getByRole('link', { name: 'Faculator' })).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });

  /*
   * ── Vế "KHÔNG có tên sản phẩm" đã rời ca này, và đó là đổi ý có chủ đích ────────────────────
   *
   * Chủ dự án chốt 10/09/2026: từ khổ có thanh điều hướng (1024px), màn có tên quay về bày icon +
   * "Faculator" như trang chủ — tên màn ở đầu thanh là nói lần thứ hai điều mà mục nav đang gạch
   * chân đã nói. Dưới 1024px thì tên màn ở lại y như cũ.
   *
   * Thanh trên được dựng sẵn vào HTML tĩnh nên phép chọn PHẢI là CSS, không thể là `matchMedia`
   * lúc render (lệch hydration — xem `HeaderIdentity`). Hệ quả: cả hai dạng cùng nằm trong DOM.
   * Bất biến cũ "chỗ đứng ấy có đúng một thứ" vì thế thành "có đúng một thứ HIỆN RA" — mà jsdom
   * không áp CSS Module nên nó không đo được ở đây. Hai phép kiểm ở `check:chrome` (khổ 1440 và
   * 360) là chỗ gác vế ấy từ nay.
   *
   * Thứ ca này VẪN gác, và vẫn là phần nặng ký nhất: `<h1>` phải có mặt ở mọi khổ. Nó là tiêu đề
   * cấp một duy nhất của trang vì thân màn không dựng cái nào — ẩn khỏi mắt thì được, gỡ khỏi DOM
   * thì trang mất tiêu đề.
   */
  it('màn danh sách công thức luôn có <h1> tên màn ở thanh trên', async () => {
    dungThanh(ROUTES.formulas);

    const tieuDe = await screen.findByRole('heading', { level: 1, name: 'Công thức' });
    expect(tieuDe).toBeTruthy();
  });

  /*
   * Màn TRONG bày ĐƯỜNG RA, không bày tên sản phẩm — dạng thứ ba của danh tính thanh trên.
   *
   * Ca này từng ghim điều ngược lại ("trang chi tiết giữ tên sản phẩm"), và lý lẽ khi ấy đúng
   * trong thế giới chỉ có hai dạng: giữa "tên sản phẩm" và "tên màn" thì trang chi tiết chọn tên
   * sản phẩm, vì tên công thức đã là `<h1>` trong thân. Chủ dự án chốt dạng thứ ba tốt hơn cả hai:
   * hàng dính trên mang thứ duy nhất người dùng cần ở đó — lối quay về.
   *
   * Vế `<h1>` thì GIỮ NGUYÊN, và nó vẫn là phần nặng ký nhất của ca này: thanh trên tuyệt đối
   * không được dựng thêm một tiêu đề cấp một khi thân màn đã có tên công thức.
   */
  it('trang chi tiết bày đường ra, KHÔNG bày tên sản phẩm và không thêm h1', async () => {
    dungThanh('/cong-thuc/wacc/');

    expect(await screen.findByRole('link', { name: /Danh sách công thức/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Faculator' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });

  /* Màn tìm kiếm và bảng dữ liệu cũng là màn trong — cùng dạng, không phải ngoại lệ nào. */
  it('màn tìm kiếm và bảng dữ liệu cũng bày đường ra', async () => {
    dungThanh(ROUTES.search);
    expect(await screen.findByRole('link', { name: /Danh sách công thức/ })).toBeTruthy();

    cleanup();
    dungThanh(ROUTES.data);
    expect(await screen.findByRole('link', { name: /Danh sách công thức/ })).toBeTruthy();
  });
});
