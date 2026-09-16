import { describe, expect, it } from 'vitest';

import { FORMULA_SUMMARIES } from '@/core/registry';

import {
  FORMULA_LIST_ANCHOR,
  NAV_ITEMS,
  ROUTES,
  activeRouteKey,
  backLinkFor,
  formulaListPath,
  formulaPath,
  headerTitleKey,
  showsFooterDisclaimer,
} from './routes';
import { DEFAULT_LIST_PARAMS, parseListParams } from './url-state';

describe('bản đồ đường dẫn (WF-18)', () => {
  /*
   * Bốn mục từ 15/09/2026: "Trang chủ" rời thanh khi trang chủ gộp vào màn Công thức, nên "Công
   * thức" vừa là mục đầu vừa là màn mở đầu. Ca này từng ghim năm mục với "home" đứng đầu.
   */
  it('thanh nav có đúng bốn mục, "Công thức" đứng đầu, "Về chúng tôi" đứng cuối', () => {
    expect(NAV_ITEMS).toHaveLength(4);
    expect(NAV_ITEMS.map((i) => i.key)).toEqual(['formulas', 'portfolio', 'settings', 'about']);
  });

  /*
   * Nhãn ngắn là một phép tính hình học, không phải sở thích — xem `NavItem.shortLabelKey`. Ghim
   * lại rằng CHỈ mục "Về chúng tôi" có nó: thêm nhãn ngắn cho một mục vừa chỗ là mở đường cho thanh
   * tab và thanh trên gọi cùng một màn bằng hai cái tên mà không ai để ý.
   */
  it('chỉ mục Về chúng tôi có nhãn ngắn riêng cho thanh tab', () => {
    const coNhanNgan = NAV_ITEMS.filter((i) => i.shortLabelKey !== undefined).map((i) => i.key);
    expect(coNhanNgan).toEqual(['about']);
  });

  it('mọi đường dẫn kết thúc bằng "/" cho hợp trailingSlash', () => {
    for (const href of Object.values(ROUTES)) {
      expect(href.endsWith('/')).toBe(true);
    }
    expect(formulaPath('wacc')).toBe('/cong-thuc/wacc/');
  });

  /*
   * `/` chỉ còn là trang chuyển hướng về `/cong-thuc/`. Không mục nav hay route nào được trỏ vào nó
   * — bấm một link mà phải đi vòng qua một cú chuyển hướng là chậm đi vô cớ, và là một URL thứ hai
   * mang cùng nội dung (FR-25).
   */
  it('không route nào là "/" — trang chủ riêng đã gộp vào màn Công thức', () => {
    expect(Object.values(ROUTES)).not.toContain('/');
    expect(NAV_ITEMS.some((i) => i.href === '/')).toBe(false);
  });

  it('neo khối danh sách công thức là một id hợp lệ, không mang dấu #', () => {
    expect(FORMULA_LIST_ANCHOR).toMatch(/^[a-z][a-z0-9-]*$/);
  });
});

/*
 * FR-24 · UI-04 nói câu miễn trừ phải có ở MỌI màn, nên hàm này bị kiểm theo chiều nghiêm hơn
 * chiều còn lại: mặc định phải là "có", và danh sách trừ phải ngắn, có lý do, không tự lan.
 *
 * Ở đây gác cái LUẬT, còn việc lá `FooterDisclaimer` có thật sự hỏi luật ấy thì
 * `FooterDisclaimer.test.tsx` gác.
 */
describe('showsFooterDisclaimer()', () => {
  it('mặc định là CÓ — một màn mới không phải nhớ thêm gì', () => {
    expect(showsFooterDisclaimer(ROUTES.about)).toBe(true);
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
 * gác — cùng cách chia với `showsFooterDisclaimer()`, và cùng lý do: sửa một bên mà quên bên kia
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
    for (const path of ['/', ROUTES.search, ROUTES.data, '/cong-thuc/pe/']) {
      expect(headerTitleKey(path), path).toBeNull();
    }
  });

  /*
   * '/ve-chung-toi/' đứng ngoài bảng dù nó CÓ mục riêng ở thanh nav — ngoại lệ có lý do, không
   * phải chỗ bị bỏ sót. Màn ấy mở bằng một dải giới thiệu mang `<h1>` của riêng nó; đẩy tiêu đề
   * lên thanh trên thì từ 1024px nó thành `position: absolute` và trang giới thiệu mất hẳn tiêu
   * đề nhìn thấy được trên desktop.
   *
   * Ghim riêng chứ không gộp vào ca trên: ai đó "dọn cho nhất quán" bằng cách thêm một dòng vào
   * HEADER_TITLES sẽ làm màn ấy có HAI `<h1>`, và đây là chỗ họ đọc được vì sao đừng làm thế.
   */
  it('Về chúng tôi cố ý đứng ngoài bảng — hero tự mang <h1>', () => {
    expect(headerTitleKey(ROUTES.about)).toBeNull();
  });
});

describe('activeRouteKey()', () => {
  it('màn Công thức sáng mục Công thức', () => {
    expect(activeRouteKey('/cong-thuc/')).toBe('formulas');
  });

  /*
   * `/` chỉ còn chuyển hướng — nó không sáng mục nào. Ca này cũng gác cái bẫy cũ: một mục mang
   * `href` '/' sẽ khớp tiền tố với MỌI đường dẫn, và vòng lặp từng phải bỏ qua nó bằng tay.
   */
  it('"/" không sáng mục nào', () => {
    expect(activeRouteKey('/')).toBeNull();
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

  it('màn giới thiệu sáng đúng mục của nó', () => {
    expect(activeRouteKey(ROUTES.about)).toBe('about');
    expect(activeRouteKey('/ve-chung-toi')).toBe('about');
  });

  it('đường dẫn lạ thì không mục nào sáng', () => {
    expect(activeRouteKey('/khong-co-trang-nay/')).toBeNull();
  });
});

/*
 * Màn giới thiệu nhận trọn phần MẶC ĐỊNH của mọi hàm trong file — không xin ngoại lệ nào. Ghim
 * lại vì đó chính là điều đáng giữ: dải miễn trừ ở chân trang (FR-24 · UI-04) chỉ được vắng khi
 * màn ấy đã tự bày câu miễn trừ ở chỗ tốt hơn, mà màn này thì không bày con số tiền nào.
 */
describe('màn Về chúng tôi dùng trọn hành vi mặc định', () => {
  it('không phải màn trong, có dải miễn trừ', () => {
    expect(backLinkFor(ROUTES.about)).toBeNull();
    expect(showsFooterDisclaimer(ROUTES.about)).toBe(true);
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
   * Các màn có mục riêng ở thanh nav KHÔNG phải màn trong — chúng bày tên màn hoặc tên sản phẩm.
   * Ba dạng danh tính loại trừ nhau, nên trùng ở đây là thanh trên có hai thứ cùng đòi chỗ.
   */
  it('mọi màn gốc KHÔNG có đường ra, và không trùng với bảng tên màn', () => {
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
