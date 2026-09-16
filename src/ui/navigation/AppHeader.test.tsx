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
 * Đường dẫn giả, đổi được giữa các ca kiểm: danh tính đầu thanh dựng ra KHÁC NHAU tuỳ route, nên
 * một hằng số cố định không kiểm được luật ấy.
 */
const duongDan = vi.hoisted(() => ({ hienTai: '/ve-chung-toi/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => duongDan.hienTai,
}));

function dungThanh(path: string = ROUTES.about) {
  duongDan.hienTai = path;
  return render(
    <PreferencesProvider>
      <AppHeader />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  duongDan.hienTai = ROUTES.about;
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
 * Cụm Cơ bản / Nâng cao KHÔNG còn ở thanh trên, ở bất cứ màn nào.
 *
 * Nó từng chỉ hiện ở màn danh sách công thức (`showsModeToggle()`); ngày 15/09/2026 trang chủ gộp
 * vào màn ấy và cụm nút dời xuống hàng tiêu đề "Danh sách công thức" — `FormulaListScreen.test.tsx`
 * gác vế đó. Ca dưới gác vế còn lại: không màn nào có HAI cụm nút cùng lúc, và thanh trên không
 * lặng lẽ mọc lại một cụm chỉ vì ai đó khôi phục `HeaderModeToggle`.
 */
describe('AppHeader — không còn cụm nút chế độ', () => {
  it.each([ROUTES.formulas, ROUTES.portfolio, ROUTES.settings, '/cong-thuc/wacc/'])(
    'thanh trên ở %s không có nhóm "Chế độ hiển thị"',
    async (path) => {
      dungThanh(path);

      // Chờ thanh dựng xong đã, rồi mới khẳng định vắng mặt: `queryBy` ngay lập tức thì ca này
      // xanh cả khi thanh chưa render gì, tức là xanh vì lý do sai.
      await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' });
      expect(screen.queryByRole('group', { name: 'Chế độ hiển thị' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Nâng cao' })).toBeNull();
    },
  );
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
  /*
   * Màn giới thiệu đứng ngoài bảng tên màn — hero của nó tự mang `<h1>`. Ca này từng dùng trang chủ
   * làm ví dụ; trang chủ đã gộp vào màn Công thức (15/09/2026).
   *
   * Logo trỏ về màn Công thức, không về `/`: `/` chỉ còn chuyển hướng, bấm logo mà đi vòng qua một
   * cú chuyển hướng là chậm đi vô cớ.
   */
  it('màn Về chúng tôi bày tên sản phẩm trỏ về /cong-thuc/, không có tiêu đề màn', () => {
    dungThanh(ROUTES.about);

    const logo = screen.getByRole('link', { name: 'Faculator' });
    expect((logo.getAttribute('href') ?? '').replace(/\/$/, '')).toBe('/cong-thuc');
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
