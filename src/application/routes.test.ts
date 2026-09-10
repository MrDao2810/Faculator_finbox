import { describe, expect, it } from 'vitest';

import { FORMULA_SUMMARIES } from '@/core/registry';

import {
  NAV_ITEMS,
  ROUTES,
  activeRouteKey,
  backLinkFor,
  formulaListPath,
  formulaPath,
  headerTitleKey,
  showsFooterDisclaimer,
  showsModeToggle,
} from './routes';
import { DEFAULT_LIST_PARAMS, parseListParams } from './url-state';

describe('bản đồ đường dẫn (WF-18)', () => {
  it('thanh nav dưới có đúng bốn mục', () => {
    expect(NAV_ITEMS).toHaveLength(4);
    expect(NAV_ITEMS.map((i) => i.key)).toEqual(['home', 'formulas', 'portfolio', 'settings']);
  });

  it('mọi đường dẫn kết thúc bằng "/" cho hợp trailingSlash', () => {
    for (const href of Object.values(ROUTES)) {
      expect(href.endsWith('/')).toBe(true);
    }
    expect(formulaPath('wacc')).toBe('/cong-thuc/wacc/');
  });
});

describe('showsModeToggle()', () => {
  it('chỉ bật ở màn danh sách công thức', () => {
    expect(showsModeToggle(ROUTES.formulas)).toBe(true);
  });

  /*
   * Cả năm màn còn lại đều tắt, và mỗi màn tắt vì một lý do khác nhau — liệt kê hết chứ không
   * kiểm mỗi trang chủ, vì luật này sinh ra chính từ chỗ "màn nào cũng bày nút".
   */
  it('tắt ở mọi màn khác', () => {
    expect(showsModeToggle(ROUTES.home), 'trang chủ lúc nhàn không đổi một ký tự nào').toBe(false);
    expect(showsModeToggle(ROUTES.portfolio), 'Danh mục đã có dòng "2 ô nâng cao đang ẩn"').toBe(
      false,
    );
    expect(showsModeToggle(ROUTES.settings), 'Cài đặt đã có hàng "Chế độ hiển thị" riêng').toBe(
      false,
    );
    expect(showsModeToggle(ROUTES.search)).toBe(false);
    expect(showsModeToggle(ROUTES.data)).toBe(false);
  });

  /*
   * Đây là ca dễ hỏng nhất nếu ai đó đổi sang `startsWith()` cho "gọn": 94 trong 111 trang chi
   * tiết bấm nút không đổi gì, tức đúng cái cớ sinh ra luật này. Trang chi tiết KHÔNG phải trang
   * danh sách.
   */
  it('KHÔNG lan xuống 111 trang chi tiết', () => {
    expect(showsModeToggle(formulaPath('wacc'))).toBe(false);
    expect(showsModeToggle(formulaPath('pe'))).toBe(false);
  });

  it('chấp nhận đường dẫn thiếu dấu "/" ở cuối', () => {
    expect(showsModeToggle('/cong-thuc')).toBe(true);
  });

  /*
   * Danh sách đã lọc sẵn vẫn là màn danh sách — link từ lưới nhóm ở trang chủ mang theo `?category=`,
   * và `usePathname()` trả về phần đường dẫn KHÔNG kèm query, nên ca này gác đúng chỗ đó.
   */
  it('danh sách đã lọc sẵn vẫn được coi là màn danh sách', () => {
    const url = formulaListPath({ ...DEFAULT_LIST_PARAMS, categoryId: 'returns' });
    const [duongDan] = url.split('?');

    expect(url, 'ví dụ phải thật sự có query, nếu không ca kiểm này rỗng nghĩa').toContain('?');
    expect(showsModeToggle(String(duongDan))).toBe(true);
  });
});

/*
 * FR-24 · UI-04 nói câu miễn trừ phải có ở MỌI màn, nên hàm này bị kiểm theo chiều nghiêm hơn
 * chiều còn lại: mặc định phải là "có", và danh sách trừ phải ngắn, có lý do, không tự lan.
 *
 * Cùng cách chia như `showsModeToggle()`: ở đây gác cái LUẬT, còn việc lá `FooterDisclaimer` có
 * thật sự hỏi luật ấy thì `FooterDisclaimer.test.tsx` gác.
 */
describe('showsFooterDisclaimer()', () => {
  it('mặc định là CÓ — một màn mới không phải nhớ thêm gì', () => {
    expect(showsFooterDisclaimer(ROUTES.home)).toBe(true);
    expect(showsFooterDisclaimer(ROUTES.formulas), 'danh sách không bày con số tiền nào').toBe(
      true,
    );
    expect(showsFooterDisclaimer(ROUTES.search)).toBe(true);
    expect(showsFooterDisclaimer(ROUTES.data)).toBe(true);
    expect(showsFooterDisclaimer(ROUTES.settings)).toBe(true);
  });

  it('trừ đúng 111 trang chi tiết — nơi ô vàng đầu màn đã nói câu ấy', () => {
    expect(showsFooterDisclaimer(formulaPath('pe'))).toBe(false);
    expect(showsFooterDisclaimer(formulaPath('capm'))).toBe(false);
    // Không đuôi '/' vẫn phải nhận ra, cùng lẽ với mọi hàm khác trong file này.
    expect(showsFooterDisclaimer('/cong-thuc/pe')).toBe(false);
  });

  /*
   * Danh mục cũng dựng ô `notice` riêng nên nó vào danh sách trừ (09/09/2026, chủ dự án chốt).
   * Trước đó ca này khẳng định điều NGƯỢC LẠI, và lý do ghi kèm là "chủ dự án khoanh vùng đúng màn
   * chi tiết" — nay chính chủ dự án mở rộng vùng ấy, nên ca đổi chiều là đúng chứ không phải nới
   * cho hết đỏ. Điều kiện đi kèm — ô `notice` phải có ở CẢ HAI tab của màn — do
   * `PortfolioScreen.test.tsx` gác, vì `usePathname()` không nhìn thấy `?tab=`.
   */
  it('trừ Danh mục — ô vàng dưới cụm tab đã nói câu ấy', () => {
    expect(showsFooterDisclaimer(ROUTES.portfolio)).toBe(false);
    expect(showsFooterDisclaimer('/danh-muc')).toBe(false);
  });

  /*
   * Khớp tuyệt đối, không khớp trang con: hôm nay `/danh-muc/` không có trang con nào, và trang con
   * thêm sau này chưa chắc mang theo ô `notice` — mặc định "có dải" phải là thứ nó nhận được.
   */
  it('trang con của Danh mục KHÔNG được thừa hưởng ngoại lệ ấy', () => {
    expect(showsFooterDisclaimer(`${ROUTES.portfolio}bao-cao/`)).toBe(true);
  });
});

/*
 * Thanh trên bày TÊN MÀN thay tên sản phẩm ở đâu.
 *
 * Ca kiểm ở đây gác cái LUẬT; việc `AppHeader` có thật sự cắm luật ấy vào thì `AppHeader.test.tsx`
 * gác — cùng cách chia đã dùng cho `showsModeToggle()`, và cùng lý do: sửa một bên mà quên bên kia
 * thì bộ kiểm vẫn xanh.
 */
describe('headerTitleKey()', () => {
  it('màn danh sách công thức bày tên màn', () => {
    expect(headerTitleKey(ROUTES.formulas)).toBe('page.formulas.title');
  });

  it('chấp nhận đường dẫn thiếu gạch chéo cuối', () => {
    expect(headerTitleKey('/cong-thuc')).toBe('page.formulas.title');
  });

  /*
   * Trang chi tiết đã có tên công thức làm tiêu đề trong thân màn, nên thanh trên phải trả chỗ về
   * cho tên sản phẩm — nếu không, 111 trang chi tiết đều mất `<h1>` mà không có gì thay thế.
   */
  it('trang chi tiết công thức KHÔNG đổi — khớp tuyệt đối, không khớp trang con', () => {
    expect(headerTitleKey('/cong-thuc/wacc/')).toBeNull();
  });

  it('trang chủ giữ tên sản phẩm', () => {
    expect(headerTitleKey(ROUTES.home)).toBeNull();
  });

  /*
   * Danh mục và Cài đặt đổi ngay đợt sau (09/09/2026). Bản trước của ca này ghim chiều NGƯỢC lại —
   * "hai màn ấy chưa nằm trong bảng" — và nó đỏ đúng lúc phải đỏ: mở rộng bảng là một quyết định,
   * không phải một cú trượt, nên nó phải đi qua chỗ này.
   */
  it('Danh mục và Cài đặt cũng bày tên màn', () => {
    expect(headerTitleKey(ROUTES.portfolio)).toBe('portfolio.title');
    expect(headerTitleKey(ROUTES.settings)).toBe('page.settings.title');
  });

  /*
   * Ba màn có tên, và ĐÚNG ba: mọi màn khác giữ tên sản phẩm. Đây là vế thứ hai của lời hứa —
   * màn nào không có ở đây thì thân màn phải tự dựng `<h1>`, nên thêm một dòng vào bảng mà quên
   * gỡ `<h1>` bên thân là dựng ra hai tiêu đề cấp một.
   */
  it('những màn còn lại giữ tên sản phẩm', () => {
    for (const path of [ROUTES.home, ROUTES.search, ROUTES.data, '/cong-thuc/pe/']) {
      expect(headerTitleKey(path), path).toBeNull();
    }
  });
});

describe('activeRouteKey()', () => {
  it('trang chủ chỉ sáng khi ở đúng trang chủ', () => {
    expect(activeRouteKey('/')).toBe('home');
    expect(activeRouteKey('/cong-thuc/')).not.toBe('home');
  });

  it('trang con vẫn sáng mục cha', () => {
    expect(activeRouteKey('/cong-thuc/wacc/')).toBe('formulas');
    expect(activeRouteKey('/cai-dat/')).toBe('settings');
  });

  it('chấp nhận đường dẫn thiếu dấu "/" ở cuối', () => {
    expect(activeRouteKey('/danh-muc')).toBe('portfolio');
  });

  it('màn tìm kiếm sáng mục Công thức, không để trống cả thanh nav', () => {
    expect(activeRouteKey(ROUTES.search)).toBe('formulas');
  });

  it('bảng dữ liệu WF-05 cũng sáng mục Công thức', () => {
    expect(activeRouteKey(ROUTES.data)).toBe('formulas');
    expect(activeRouteKey('/du-lieu')).toBe('formulas');
  });

  it('đường dẫn lạ thì không mục nào sáng', () => {
    expect(activeRouteKey('/khong-co-trang-nay/')).toBeNull();
  });
});

describe('formulaListPath() — một chỗ duy nhất dựng link tới danh sách đã lọc', () => {
  it('tham số mặc định cho ra đường dẫn trơn, không kèm đuôi thừa', () => {
    expect(formulaListPath(DEFAULT_LIST_PARAMS)).toBe('/cong-thuc/');
  });

  it('có từ khoá và nhóm thì cả hai lên đường dẫn', () => {
    const path = formulaListPath({ ...DEFAULT_LIST_PARAMS, q: 'roi', categoryId: 'returns' });

    expect(path.startsWith('/cong-thuc/?')).toBe(true);
    expect(path).toContain('roi');
    expect(path).toContain('returns');
  });

  /*
   * Ca chặn đúng lỗi thật của đợt 7: ghép chuỗi tay thì tên tham số ở nơi DỰNG và nơi ĐỌC lệch
   * nhau mà lint lẫn typecheck đều không thấy. Đi trọn một vòng dựng → đọc lại mới bắt được.
   */
  it('đọc ngược đường dẫn phải ra lại đúng tham số ban đầu', () => {
    for (const params of [
      DEFAULT_LIST_PARAMS,
      { ...DEFAULT_LIST_PARAMS, q: 'gia hoa von' },
      { ...DEFAULT_LIST_PARAMS, categoryId: 'fees-tax', segment: 'stock' as const },
      { ...DEFAULT_LIST_PARAMS, q: 'p/e', sort: 'az' as const },
    ]) {
      const query = formulaListPath(params).slice('/cong-thuc/'.length);
      expect(parseListParams(new URLSearchParams(query)), JSON.stringify(params)).toEqual(params);
    }
  });
});

describe('màn nhập liệu nằm ngoài điều hướng và ngoài sitemap (FR-25)', () => {
  it('không có mục nav nào trỏ tới /tim-kiem/ hay /du-lieu/', () => {
    expect(NAV_ITEMS.some((i) => i.href === ROUTES.search)).toBe(false);
    expect(NAV_ITEMS.some((i) => i.href === ROUTES.data)).toBe(false);
  });
});

/*
 * ── Đường ra của MÀN TRONG ────────────────────────────────────────────────────────────────────
 *
 * Lời hứa gác ở đây từng nằm ở `FormulaDetail.test.tsx` dưới dạng một vòng lặp dựng cả 111 màn.
 * Nó ra đời từ một lỗ hổng chủ dự án báo: vào một công thức rồi thì không có lối quay về danh sách
 * để chọn cái khác. Từ khi `<BackLink>` chuyển lên thanh trên, luật thành thuần hàm — nên nó về
 * đây, và gác chặt hơn: chạy trong vài mili giây, và đúng cho cả đường dẫn công thức chưa tồn tại.
 */
describe('backLinkFor() — màn trong nào cũng có đường ra', () => {
  it('cả 111 trang công thức đều có đường ra về danh sách', () => {
    for (const summary of FORMULA_SUMMARIES) {
      const back = backLinkFor(formulaPath(summary.id));

      expect(back, summary.id).not.toBeNull();
      expect(back?.fallbackHref, summary.id).toBe(ROUTES.formulas);
      expect(back?.labelKey, summary.id).toBe('nav.backToList');
    }
  });

  it('màn tìm kiếm và bảng dữ liệu cũng là màn trong', () => {
    expect(backLinkFor(ROUTES.search)).not.toBeNull();
    expect(backLinkFor(ROUTES.data)).not.toBeNull();
  });

  /*
   * Bốn màn có mục riêng ở thanh nav KHÔNG phải màn trong — chúng bày tên màn hoặc tên sản phẩm.
   * Ba dạng danh tính loại trừ nhau, nên trùng ở đây là thanh trên có hai thứ cùng đòi chỗ.
   */
  it('bốn màn gốc KHÔNG có đường ra, và không trùng với bảng tên màn', () => {
    for (const item of NAV_ITEMS) {
      expect(backLinkFor(item.href), item.href).toBeNull();
    }
    expect(backLinkFor(ROUTES.formulas)).toBeNull();
    expect(headerTitleKey(ROUTES.formulas)).not.toBeNull();
  });

  /*
   * Ngoại lệ THẬT của bảng dữ liệu: vào từ nút "Mở bảng dữ liệu" của một trang công thức thì
   * đường ra phải về ĐÚNG trang đó. Hành vi này dựng có chủ đích và từng sống trong
   * `DataTableScreen`; nó đi theo `?from=` sang đây, không được rơi rụng.
   */
  it('bảng dữ liệu vào từ một công thức thì quay về đúng công thức ấy', () => {
    const back = backLinkFor(ROUTES.data, '?from=pe');

    expect(back?.fallbackHref).toBe(formulaPath('pe'));
    expect(back?.labelKey).toBe('nav.backToFormula');
    /* Không đọc màn gốc đã nhớ: đọc rồi ghi đè bằng href công thức chỉ tổ nhấp nháy một nhịp. */
    expect(back?.rememberOrigin).toBe(false);
  });

  /*
   * `?from=` đến từ URL, tức từ người lạ. Bản cũ đối chiếu nó với danh sách công thức; ở đây không
   * làm được (kéo chỉ mục vào layout gốc là quá đắt — xem chú thích trong `routes.ts`), nên phải
   * chặn bằng dạng slug. Ca này gác đúng phần nguy hiểm: chuỗi lạ không ghép được thành đường dẫn
   * khác, mà rơi về đường ra mặc định.
   */
  it('?from= dạng lạ thì rơi về danh sách, không ghép thành đường dẫn khác', () => {
    for (const bad of ['../../cai-dat', 'pe/../../x', 'a b', 'PE', '']) {
      const back = backLinkFor(ROUTES.data, `?from=${encodeURIComponent(bad)}`);

      expect(back?.fallbackHref, bad).toBe(ROUTES.formulas);
    }
  });
});
