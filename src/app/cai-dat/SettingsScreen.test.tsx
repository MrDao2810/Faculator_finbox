// @vitest-environment jsdom

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FORMULAS,
  FORMULA_USAGE_KEY,
  LEGACY_HOME_RECENT_SEARCHES_KEY,
  MARKET_CONFIG,
  PORTFOLIO_KEY,
  PREFERENCES_STORAGE_KEY,
  PRICE_CACHE_KEY,
  PRICE_SERIES_KEY,
  RECENT_SEARCHES_KEY,
  SAVED_CALCS_KEY,
  TICKER_LIST_KEY,
} from '@/application';
import { readPreferences } from '@/application/preferences';
import { PreferencesProvider } from '@/application/preferences-context';

import { HIEN_KHOI_DU_LIEU, STORAGE_ITEMS, SettingsScreen } from './SettingsScreen';

function open() {
  render(
    <PreferencesProvider>
      <SettingsScreen />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('WF-13 — bốn khối đúng thứ tự wireframe', () => {
  /*
   * VẪN đủ bốn, kể cả khi bản kiểm kê chín kho đang ẩn (`HIEN_KHOI_DU_LIEU`, 14/09/2026): khối 3
   * lúc ấy rút xuống còn tiêu đề và một nút xoá sạch chứ không biến mất. Danh sách này vì thế
   * không đọc theo cờ — nó là thứ bắt được lỗi "ẩn nhầm cả khối", đúng lỗi làm mất quyền xoá dữ
   * liệu của LDR-04.
   */
  const KHOI = ['Chế độ hiển thị', 'Đơn vị & biểu thị', 'Dữ liệu của bạn', 'Về sản phẩm'];

  it('dựng đủ bốn khối, đúng thứ tự', () => {
    open();

    const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titles).toEqual(KHOI);
  });

  /*
   * Ca cũ đòi màn có ĐÚNG MỘT `<h1>`. Từ 09/09/2026 tiêu đề "Cài đặt" do thanh trên dựng
   * (`HeaderIdentity` + `headerTitleKey()`), nên thân màn không được có `<h1>` nào — hai chỗ cùng
   * dựng thì trang có hai tiêu đề cấp một và trình đọc màn hình đọc tên màn hai lần.
   *
   * Vế "trang vẫn có một `<h1>`" nay do `AppHeader.test.tsx` gác. Chia đôi như vậy vì file này
   * dựng `SettingsScreen` trần, không có `AppShell` bọc ngoài.
   */
  it('thân màn KHÔNG dựng <h1> — tiêu đề đã chuyển lên thanh trên', () => {
    open();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });

  it('vẫn còn tiêu đề cấp hai cho từng khối — thứ bậc không sập một nấc', () => {
    open();
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBe(KHOI.length);
  });
});

describe('đơn vị & biểu phí — cài đặt ghi được và nhớ được (SW-02)', () => {
  it('đổi bậc đơn vị thì ghi xuống localStorage', async () => {
    open();

    await userEvent.click(screen.getByRole('button', { name: 'tỷ ₫' }));

    const stored = readPreferences(window.localStorage.getItem(PREFERENCES_STORAGE_KEY));
    expect(stored.unitScale).toBe('billion');
  });

  /*
   * MarketConfig hiện chỉ có MỘT biểu phí, nên chưa đổi sang cái khác được — ca kiểm này chốt
   * rằng ô chọn dựng từ cấu hình chứ không viết cứng, để ngày thêm biểu phí thứ hai thì màn
   * tự có nó. Việc "ô chọn một lựa chọn" đã ghi vào TASK.md.
   */
  it('ô chọn biểu phí dựng từ MarketConfig, đánh dấu cái mặc định', () => {
    open();

    const select = screen.getByLabelText(/Biểu phí giao dịch/) as HTMLSelectElement;
    expect(select.options).toHaveLength(MARKET_CONFIG.schedules.length);

    for (const schedule of MARKET_CONFIG.schedules) {
      const option = [...select.options].find((o) => o.value === schedule.id);
      expect(option, schedule.id).toBeDefined();
      expect(option?.textContent).toBe(schedule.name.vi);
    }

    // Biểu phí đang dùng phải là cái đang được chọn sẵn.
    expect(select.value).toBe(MARKET_CONFIG.defaultScheduleId);
  });

  /*
   * Ca cũ đòi màn NÓI RA rằng đổi bậc đơn vị không đổi cách đọc ô nhập. Dòng phụ ấy đã bỏ — chủ dự
   * án chốt 09/09/2026, cùng đợt với năm dòng phụ khác ở hai màn.
   *
   * Điều nó nói vẫn đúng trong mã: bậc đơn vị chỉ đổi cách BÀY con số ở bảng, phép tính vẫn chạy
   * bằng đồng. Thứ mất đi là lời nói ra. Ghim lại chiều ngược để không ai dựng lại mà không đọc
   * đoạn này — cùng khuôn `DataTableScreen.test.tsx` đã dùng cho một lượt bỏ tương tự.
   */
  it('không còn dòng phụ nào dưới hàng đơn vị', () => {
    open();
    expect(screen.queryByText(/quy ước Việt Nam/)).toBeNull();
  });
});

/*
 * ── Khối "Dữ liệu trên máy" đang TẠM ẨN ───────────────────────────────────────────────────────
 *
 * Chủ dự án chốt 14/09/2026 (`HIEN_KHOI_DU_LIEU` ở `SettingsScreen.tsx`). Cả cụm ca kiểm dựng màn
 * dưới đây BỎ QUA chứ không xoá: bật cờ lại là chúng chạy lại y nguyên, không ai phải viết lại.
 *
 * Cửa gác "mọi kho đều xoá được" thì KHÔNG bỏ qua — nó đã dời ra ngoài cụm này và nay đọc thẳng
 * `STORAGE_ITEMS` thay vì đọc màn. Lý do ở docblock của cờ: bản kiểm kê mà mục ra trong lúc khối
 * ngủ thì lúc bật lại nó thiếu, mà thiếu một dòng ở đó đúng là con bọ đã xảy ra hai lần.
 */
/** Hàng của một kho, dò theo `data-key` — khoá không còn là chữ trên màn. */
function dong(key: string): HTMLElement {
  const row = screen.getAllByRole('listitem').find((li) => li.getAttribute('data-key') === key);
  expect(row, key).toBeDefined();
  return row as HTMLElement;
}

describe.skipIf(!HIEN_KHOI_DU_LIEU)('dữ liệu trên máy — LDR-04, NFR-SEC-01', () => {
  it('liệt kê đủ các khoá app đang dùng', () => {
    open();

    for (const key of [
      PREFERENCES_STORAGE_KEY,
      RECENT_SEARCHES_KEY,
      FORMULA_USAGE_KEY,
      PRICE_SERIES_KEY,
      PORTFOLIO_KEY,
      SAVED_CALCS_KEY,
      TICKER_LIST_KEY,
      PRICE_CACHE_KEY,
    ]) {
      expect(dong(key), key).toBeDefined();
    }
  });

  /*
   * ── Dòng phụ phải nói được cho NGƯỜI DÙNG, không cho người viết mã ─────────────────────────
   *
   * Chủ dự án khoanh đúng dòng `ffb.prefs.v1 · 98 ký tự` và nói *"đang không hiểu vùng khoanh
   * tròn biểu thị cho cái gì. không có nghĩa"*. Hai ca dưới ghim cả hai vế của phép chữa: thứ
   * biến mất (tên khoá, số ký tự) và thứ thay vào (một câu nói trong kho có gì).
   */
  it('không hàng nào in tên khoá hay số ký tự ra màn', () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi","pe"]');
    open();

    for (const row of screen.getAllByRole('listitem')) {
      const key = row.getAttribute('data-key');
      if (key === null) continue;
      expect(row.textContent ?? '', key).not.toContain(key);
      expect(row.textContent ?? '', key).not.toContain('ký tự');
    }
  });

  it('mỗi kho có một câu nói trong đó là gì', () => {
    open();

    expect(dong(PREFERENCES_STORAGE_KEY).textContent).toContain('ngôn ngữ');
    expect(dong(PRICE_SERIES_KEY).textContent).toContain('Bảng dữ liệu');
    expect(dong(PORTFOLIO_KEY).textContent).toContain('giá vốn');
  });
});

/**
 * Cửa gác: kho mới mà quên dòng ở bản kiểm kê thì đỏ ngay, không đợi ai đó tình cờ nhận ra.
 *
 * Đã thủng hai lần thật — `ffb.tickers.v1` và `ffb.prices.v1` ghi vào máy người dùng từ gói
 * "Danh mục dùng số liệu thật" mà không có nút xoá nào, cho tới đợt cá nhân hoá trang chủ mới
 * được vá. Quét file thay vì liệt kê tay vì chính việc liệt kê tay là thứ đã bỏ sót.
 *
 * Đứng NGOÀI cụm bị bỏ qua, và đọc `STORAGE_ITEMS` chứ không đọc màn: khối đang tạm ẩn
 * (`HIEN_KHOI_DU_LIEU`), mà bản kiểm kê thì không được mục trong lúc ngủ. Đọc mảng cũng đúng vai
 * hơn — thứ phải đủ là BẢN KIỂM KÊ; việc nó dựng ra thành hàng trên màn đã có cụm ca kiểm trên lo.
 */
describe('bản kiểm kê kho — gác cả khi khối đang ẩn', () => {
  it('mọi kho localStorage khai trong src/application đều có dòng trong STORAGE_ITEMS', () => {
    // `process.cwd()` chứ không `import.meta.url`: file này chạy ở môi trường jsdom, nơi
    // `import.meta.url` là một URL http chứ không phải file:// nên `fileURLToPath` ném lỗi.
    const dir = join(process.cwd(), 'src', 'application');
    const files = readdirSync(dir).filter(
      (name) => name.endsWith('.ts') && !name.includes('.test.'),
    );
    // Đường dẫn hỏng thì không có gì để soi và ca kiểm đỗ giả — chặn kiểu đỗ đó.
    expect(files.length, `không quét được ${dir}`).toBeGreaterThan(5);

    /** Kho KHÔNG cần nút xoá, kèm lý do. Danh sách này phải luôn có lý do, không được để trống. */
    const CO_Y: ReadonlyArray<{ key: string; viSao: string }> = [
      {
        key: 'ffb.origin.v1',
        viSao:
          'sessionStorage — màn vừa rời đi và chỗ đang đứng trên đó, tự hết khi đóng tab. Không sống qua phiên nên không có gì để xoá',
      },
      {
        key: 'ffb.origin.prev.v1',
        viSao:
          'sessionStorage — màn gốc liền trước, cùng vòng đời và cùng lý do với ffb.origin.v1. Tách ô thứ hai vì màn tìm kiếm vừa là màn gốc vừa có nút quay lại của chính nó',
      },
      {
        key: 'ffb.origin.restore.v1',
        viSao:
          'sessionStorage — cờ sống đúng MỘT lượt điều hướng: nút quay lại đặt, màn đích đọc rồi xoá ngay. Một nút xoá cho nó là nút không bao giờ có gì để xoá',
      },
      {
        key: 'ffb.list.resultOpened.v1',
        viSao:
          'sessionStorage — dấu "vừa mở một kết quả tìm" của màn Công thức, sống đúng MỘT lần quay về: lần gắn kế tiếp của màn đọc rồi xoá ngay, khớp hay không. Chỉ mang chuỗi truy vấn vốn đã nằm trên URL, và tự hết khi đóng tab',
      },
      {
        key: 'ffb.shelf.open.v1',
        viSao:
          'sessionStorage — kệ "Công thức dùng hằng ngày" đang mở đủ hay thu gọn, để nút quay lại cuộn đúng chỗ. Trạng thái giao diện của một tab, không phải dữ liệu người dùng, tự hết khi đóng tab',
      },
      {
        key: 'ffb.activeTicker.v1',
        viSao:
          'sessionStorage — mã dính theo lượt duyệt, tự hết khi đóng tab. Lối xoá nằm ngay tại chỗ nó có tác dụng: nút "Bỏ mã" trên thanh của màn chi tiết công thức',
      },
      {
        key: 'ffb.workingSeries.v1',
        viSao:
          'sessionStorage — chuỗi giá vừa dán tại chỗ hoặc chuỗi minh hoạ của công thức đang mở, giữ để nó sống sót cú "Mở bảng dữ liệu → Back", tự hết khi đóng tab. Hai lối xoá đều nằm ngay tại chỗ nó có tác dụng: nút "Huỷ và thoát" ở màn chi tiết, và chính việc sửa bảng dữ liệu (thao tác gần nhất thắng). Chuỗi muốn ở lại lâu dài thì đã có bảng WF-05, vốn có sẵn dòng xoá riêng',
      },
      {
        key: 'ffb.recent.home.v1',
        viSao:
          'kho CŨ của ô tìm trang chủ — trang chủ đã gộp vào màn Công thức (15/09/2026) nên không còn ai ghi. Màn Công thức gộp nó vào ffb.recent.v1 rồi xoá ở lần mở đầu tiên; nút "Xoá toàn bộ" vẫn quét nó qua LEGACY_STORAGE_KEYS. Không cho một dòng riêng: "lịch sử tìm ở trang chủ" khi không còn trang chủ nào là câu nói sai',
      },
      {
        key: 'ffb.formulaOrigin.v1',
        viSao:
          'sessionStorage — TÊN công thức vừa mở bảng dữ liệu, chỉ để nút quay lại gọi đúng tên nó. Không quyết định đường đi (đích do ?from= trên URL định), không mang gì riêng tư hơn một cái tên công thức có sẵn trong Registry công khai, và tự hết khi đóng tab',
      },
    ];

    const khai = new Set<string>();
    for (const name of files) {
      const src = readFileSync(join(dir, name), 'utf8');
      for (const match of src.matchAll(/'(ffb\.[a-z.]+v\d+)'/gi)) {
        const key = match[1];
        if (key !== undefined) khai.add(key);
      }
    }
    expect(
      khai.size,
      'không tìm thấy khoá ffb.* nào — biểu thức quét có thể đã hỏng',
    ).toBeGreaterThan(4);

    const kiem_ke = new Set(STORAGE_ITEMS.map((item) => item.key));

    const thieu = [...khai].filter(
      (key) => !kiem_ke.has(key) && !CO_Y.some((mien) => mien.key === key),
    );
    expect(
      thieu,
      `kho nằm trên máy người dùng mà không có nút xoá: ${thieu.join(', ')} — thêm dòng vào STORAGE_ITEMS`,
    ).toEqual([]);
  });
});

describe.skipIf(!HIEN_KHOI_DU_LIEU)('dữ liệu trên máy — từng hàng và nút xoá', () => {
  it('chưa có gì thì nói "Chưa có gì" và khoá nút xoá của dòng đó', () => {
    open();

    expect(screen.getAllByText('Chưa có gì').length).toBeGreaterThan(0);
    for (const button of screen.getAllByRole('button', { name: 'Xoá' })) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it('có dữ liệu thì thôi nhãn "Chưa có gì", và xoá được đúng dòng đó', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi","pe"]');
    window.localStorage.setItem(PORTFOLIO_KEY, '[]');
    open();

    const recentRow = dong(RECENT_SEARCHES_KEY);

    /*
     * Nhãn trạng thái là thứ DUY NHẤT phân biệt kho rỗng với kho có dữ liệu trên màn (con số cỡ
     * kho đã bỏ), nên nó phải tắt đúng lúc — để lại là nó nói dối ngay cạnh một nút bấm được.
     */
    expect(recentRow.textContent).not.toContain('Chưa có gì');
    expect(dong(PORTFOLIO_KEY).textContent).not.toContain('Chưa có gì');

    const button = recentRow.querySelector('button');
    expect((button as HTMLButtonElement).disabled).toBe(false);
    await userEvent.click(button as HTMLElement);

    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
    // Chỉ xoá đúng dòng vừa bấm, không đụng mục khác.
    expect(window.localStorage.getItem(PORTFOLIO_KEY)).toBe('[]');
  });

  /*
   * ⚠ Ca cũ ở đây tên là "nói thẳng dữ liệu không rời khỏi máy (COM-03)" và nó ghim câu
   * `settings.data.note`. Câu ấy đã bỏ — chủ dự án chốt 09/09/2026, cùng đợt với dải "CỤC BỘ" ở
   * màn Danh mục.
   *
   * Sau hai lượt ấy, **COM-03 không còn cửa gác nào ở tầng giao diện**: sản phẩm không còn câu nào
   * trên màn nói về dữ liệu rời máy hay ở lại máy. Phần LÕI của yêu cầu thì vẫn đứng và vẫn có
   * cửa — dữ liệu thật sự nằm trong `localStorage` (bốn store ở `src/application/` đều ghi
   * COM-03 trong docblock), `public/_headers` khoá `connect-src` về đúng một origin, và ca kiểm ở
   * `PortfolioScreen.test.tsx` gác việc số lượng / giá vốn / ngày mua không vào request.
   *
   * Ghi ra để lần soát tuân thủ sau không phải đoán: đây là quyết định của chủ dự án, không phải
   * một cửa bị rơi mất.
   */
  it('không còn dòng cam kết nào ở khối dữ liệu', () => {
    open();
    expect(screen.queryByText(/không được gửi đi đâu/)).toBeNull();
  });
});

/**
 * Nút "Xoá toàn bộ" — KHÔNG bỏ qua, vì nó có ở cả hai hình dạng của khối.
 *
 * Đây là lý do khối 3 rút gọn thay vì ẩn hẳn: LDR-04 · NFR-SEC-01 cho người dùng quyền xoá dữ
 * liệu app giữ trên máy họ, mà sản phẩm không có tài khoản nào để đăng xuất và không màn nào khác
 * bày kho ra — nên nút này là lối DUY NHẤT. Ẩn nó đi là cắt mất quyền ấy, nên ba ca dưới chạy bất
 * kể `HIEN_KHOI_DU_LIEU` bật hay tắt.
 */
describe('xoá toàn bộ dữ liệu — lối duy nhất, phải luôn có', () => {
  it('luôn dựng khối thứ ba với nút xoá sạch, dù bản kiểm kê đang ẩn', () => {
    open();

    expect(screen.getByRole('heading', { level: 2, name: /Dữ liệu của bạn/ })).not.toBeNull();
    expect(screen.getByRole('button', { name: /Xoá toàn bộ/ })).not.toBeNull();
  });

  it('hỏi lại trước, và huỷ thì KHÔNG xoá gì', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi"]');
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    open();

    await userEvent.click(screen.getByRole('button', { name: /Xoá toàn bộ/ }));

    expect(window.confirm).toHaveBeenCalled();
    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBe('["roi"]');
  });

  it('chưa lưu gì thì nút bị khoá', () => {
    open();

    const button = screen.getByRole('button', { name: /Xoá toàn bộ/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  /*
   * Xoá THẬT, và xoá đủ cả bản kiểm kê — ở bản rút gọn thì không còn nút từng dòng nào để bù cho
   * một kho bị sót. Ghim hai kho ở hai đầu danh sách chứ không chỉ một: `removeAll()` duyệt
   * `STORAGE_ITEMS`, nên ca này cũng bắt được lỗi vòng lặp dừng sớm.
   */
  it('đồng ý thì xoá sạch mọi kho trong bản kiểm kê', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi"]');
    window.localStorage.setItem(PRICE_CACHE_KEY, '{}');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    /*
     * ⚠ Ca này in ra stderr một dòng "Not implemented: navigation to another Document". ĐÚNG như
     * vậy, không phải lỗi: `removeAll()` gọi `location.reload()` ở cuối — cần thật, để mọi màn đọc
     * lại tuỳ chọn mặc định thay vì giữ bộ cũ trong bộ nhớ — mà jsdom không điều hướng được.
     *
     * Không dập bằng `vi.spyOn(window.location, 'reload')`: jsdom khai `reload` không cấu hình
     * lại được, spy ném `TypeError: Cannot redefine property`. Ghi ra đây để người sau khỏi thử lại.
     */
    open();

    await userEvent.click(screen.getByRole('button', { name: /Xoá toàn bộ/ }));

    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
    expect(window.localStorage.getItem(PRICE_CACHE_KEY)).toBeNull();
  });

  /*
   * Kho cũ không có dòng trong bản kiểm kê — nên nó là đúng loại kho mà một vòng lặp chỉ duyệt
   * `STORAGE_ITEMS` sẽ bỏ sót. "Xoá toàn bộ" phải xoá THẬT toàn bộ (LDR-04).
   */
  it('đồng ý thì xoá luôn kho cũ của ô tìm trang chủ, dù nó không có dòng riêng', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi"]');
    window.localStorage.setItem(LEGACY_HOME_RECENT_SEARCHES_KEY, '["P/E"]');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    open();

    await userEvent.click(screen.getByRole('button', { name: /Xoá toàn bộ/ }));

    expect(window.localStorage.getItem(LEGACY_HOME_RECENT_SEARCHES_KEY)).toBeNull();
  });
});

/**
 * Thanh HOÀN TÁC — đợt 13.
 *
 * Chủ dự án báo: bấm nút xoá xong "không thấy có gì thay đổi". Bốn ca dưới gác đúng bốn thứ đã
 * hứa: có thanh, hoàn tác được nguyên vẹn, thanh tự tắt sau 5 giây, và rời màn giữa chừng không
 * để lại bộ đếm chạy tiếp.
 *
 * `beforeEach` chung của file gọi `localStorage.clear()`, nên mọi ca ở đây phải TỰ ghi dữ liệu:
 * kho rỗng thì nút xoá bị khoá và không có gì để hoàn tác.
 *
 * Bỏ qua trong lúc khối "Dữ liệu trên máy" tạm ẩn — không có nút xoá nào để mà hoàn tác.
 */
describe.skipIf(!HIEN_KHOI_DU_LIEU)('hoàn tác sau khi xoá một kho', () => {
  /** Bấm nút thùng rác của dòng chứa `key`. Trả về đúng nút ấy để ca kiểm soi tiếp nếu cần. */
  /** Dò theo `data-key`: khoá kho không còn là chữ trên màn từ 14/09/2026. */
  async function xoaDong(key: string): Promise<HTMLButtonElement> {
    const row = screen.getAllByRole('listitem').find((li) => li.getAttribute('data-key') === key);
    expect(row, key).toBeDefined();
    const button = row?.querySelector('button') as HTMLButtonElement;
    await userEvent.click(button);
    return button;
  }

  it('xoá xong thì hiện thanh nói rõ kho nào vừa mất, kèm số giây đếm ngược', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi","pe"]');
    open();

    await xoaDong(RECENT_SEARCHES_KEY);

    const bar = screen.getByRole('status');
    // Tên kho phải có trong câu: xoá xong mà chỉ báo "Đã xoá" thì không neo vào đâu cả.
    expect(bar.textContent).toContain('Từ khoá đã tìm');
    expect(bar.textContent).toContain('5');
    expect(screen.getByRole('button', { name: 'Hoàn tác' })).not.toBeNull();
  });

  /*
   * Xoá phải là XOÁ THẬT ngay (ca "có dữ liệu thì hiện cỡ thật…" ở trên chốt điều đó), nên hoàn
   * tác là GHI LẠI. Chuỗi ghi lại phải khớp từng ký tự — ghi lại một chuỗi "tương đương" là làm
   * hỏng đúng thứ người dùng vừa xin giữ.
   */
  it('bấm Hoàn tác thì kho trở lại nguyên chuỗi cũ, và thanh tắt đi', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi","pe"]');
    open();

    await xoaDong(RECENT_SEARCHES_KEY);
    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Hoàn tác' }));

    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBe('["roi","pe"]');
    expect(screen.queryByRole('button', { name: 'Hoàn tác' })).toBeNull();

    /*
     * Hàng phải trở lại trạng thái "có dữ liệu" NGAY, không đợi lần mở màn sau: nhãn "Chưa có gì"
     * tắt đi và nút xoá bấm được trở lại. (Trước đợt bỏ con số cỡ kho, ca này soi chuỗi "12 ký tự".)
     */
    const row = screen
      .getAllByRole('listitem')
      .find((li) => li.getAttribute('data-key') === RECENT_SEARCHES_KEY);
    expect(row?.textContent).not.toContain('Chưa có gì');
    expect((row?.querySelector('button') as HTMLButtonElement).disabled).toBe(false);
  });

  /*
   * Hai ca dưới dùng ĐỒNG HỒ GIẢ, và cố ý bấm bằng `fireEvent` chứ không `userEvent`:
   * `userEvent` tự chờ giữa các bước bằng timer, nên chạy chung với đồng hồ giả là nó treo cho
   * tới khi vitest cắt ở 5 giây — đã thử và đúng như vậy. Ở đây chỉ cần một cú bấm trơn, không
   * cần chuỗi trỏ/gõ mà `userEvent` dựng ra.
   */
  it('quá 5 giây thì thanh tự tắt và dữ liệu vẫn ở trạng thái đã xoá', () => {
    vi.useFakeTimers();
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi"]');
      open();

      const row = screen
        .getAllByRole('listitem')
        .find((li) => li.getAttribute('data-key') === RECENT_SEARCHES_KEY);
      fireEvent.click(row?.querySelector('button') as HTMLElement);
      expect(screen.getByRole('button', { name: 'Hoàn tác' })).not.toBeNull();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByRole('button', { name: 'Hoàn tác' })).toBeNull();
      expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  /*
   * `setInterval` là cái đầu tiên trong repo. Bộ đếm sống sót qua unmount sẽ gọi `setState` trên
   * một cây đã tháo — trong vitest nó ra cảnh báo, trên máy người dùng nó là rò rỉ. Ca này bắt
   * đúng chỗ đó: rời màn rồi tua gấp đôi cửa sổ 5 giây mà console vẫn sạch.
   */
  it('rời màn giữa chừng thì bộ đếm dừng hẳn, không kêu ca gì', () => {
    vi.useFakeTimers();
    const noise = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi"]');
      const { unmount } = render(
        <PreferencesProvider>
          <SettingsScreen />
        </PreferencesProvider>,
      );

      const row = screen
        .getAllByRole('listitem')
        .find((li) => li.getAttribute('data-key') === RECENT_SEARCHES_KEY);
      fireEvent.click(row?.querySelector('button') as HTMLElement);

      unmount();
      act(() => {
        vi.advanceTimersByTime(10_000);
      });

      expect(noise).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('về sản phẩm', () => {
  it('nói đúng số công thức đang dùng được, không phải số dự kiến của SRS', () => {
    open();

    const about = screen.getByText('Công thức đang dùng được').nextElementSibling;
    expect(about?.textContent).toBe(String(FORMULAS.length));
  });

  /*
   * KHÔNG lặp câu miễn trừ ở màn này: `AppShell` đã đặt nó ở chân mọi trang. Ca kiểm chốt
   * chiều ngược lại, để lần sau ai đó thêm vào thì thấy ngay là có chủ đích chứ không phải quên.
   */
  it('không lặp lại câu miễn trừ — bản ở chân trang do AppShell lo', () => {
    open();
    expect(screen.queryByText(/chỉ mang tính tham khảo/)).toBeNull();
  });

  it('không lọt NaN / Infinity / undefined ra màn — FR-06', () => {
    window.localStorage.setItem(PRICE_SERIES_KEY, '{"code":"FPT","rows":[]}');
    const { container } = render(
      <PreferencesProvider>
        <SettingsScreen />
      </PreferencesProvider>,
    );

    for (const word of ['NaN', 'Infinity', 'undefined']) {
      expect(container.textContent, word).not.toContain(word);
    }
  });
});
