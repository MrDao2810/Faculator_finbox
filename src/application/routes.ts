/**
 * Tầng APPLICATION — bản đồ đường dẫn (gói WBS 1.4.1).
 *
 * WF-18 chốt luồng: các mục ở thanh nav, mỗi công thức một URL riêng — xem `NAV_ITEMS`.
 * Đây là nguồn duy nhất của đường dẫn — thanh nav, sitemap và mọi link đều đọc từ đây,
 * để đổi slug là sửa một chỗ.
 *
 * ── Không còn trang chủ riêng (15/09/2026) ────────────────────────────────────────────────────
 *
 * Chủ dự án chốt gộp trang chủ vào màn Công thức: kệ "Công thức dùng hằng ngày" lên đầu màn danh
 * sách, mục "Trang chủ" rời thanh nav. URL chính của màn gộp là `/cong-thuc/`; đường dẫn `/` chỉ
 * còn chuyển hướng về đó (`public/_redirects` ở bản triển khai, `src/app/page.tsx` ở máy chạy thử)
 * nên nó KHÔNG có mặt trong bảng dưới — không link nào trong sản phẩm được trỏ vào một trang chỉ
 * để chuyển hướng.
 *
 * Slug tiếng Việt vì đường dẫn là phần Google đọc (FR-25). Đuôi '/' là bắt buộc:
 * next.config.mjs đặt `trailingSlash: true` cho hợp static hosting.
 */

import type { MessageKey } from './i18n';
import { listParamsToQuery, type ListParams } from './url-state';

export const ROUTES = {
  /** Màn Công thức — màn mở đầu của sản phẩm từ khi trang chủ gộp vào nó. */
  formulas: '/cong-thuc/',
  /**
   * Màn tìm kiếm WF-09. KHÔNG có trong `NAV_ITEMS` và KHÔNG có trong `sitemap.xml`:
   * đây là giao diện nhập truy vấn chứ không phải nội dung, và để Google lập chỉ mục nó
   * thì trùng nội dung với `/cong-thuc/` (FR-25). Trang tự đặt `robots: noindex`.
   */
  search: '/tim-kiem/',
  /**
   * Bảng dữ liệu WF-05. Cũng KHÔNG có trong `NAV_ITEMS` và KHÔNG vào `sitemap.xml`: đây là
   * chỗ nhập liệu của người dùng, không phải nội dung để Google lập chỉ mục (FR-25).
   * WF-18 xếp nó trong chặng "Tính toán" nên nó sáng mục Công thức, giống màn tìm kiếm.
   */
  data: '/du-lieu/',
  portfolio: '/danh-muc/',
  settings: '/cai-dat/',
  /**
   * Màn giới thiệu sản phẩm. CÓ trong `NAV_ITEMS` và CÓ trong `sitemap.xml`: khác `/tim-kiem/`
   * và `/du-lieu/`, đây là nội dung thật sự để đọc, không trùng nội dung với màn nào khác.
   */
  about: '/ve-chung-toi/',
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Bốn mục có mặt ở thanh nav.
 * `search` và `data` là route thật nhưng không phải mục điều hướng — tách kiểu ra để component
 * thanh nav không phải bịa một icon cho chúng.
 */
export type NavKey = Exclude<RouteKey, 'search' | 'data'>;

/**
 * `id` của khối "Danh sách công thức" trên màn Công thức, dùng làm neo `#…`.
 *
 * Khai ở đây vì nó là một phần hợp đồng URL — cùng lẽ với `SAVED_CALCS_ANCHOR` ngay dưới — và vì
 * `verify-static.mjs` / `chrome-check.mjs` tìm khối danh sách qua chính chuỗi này. Từng là đích cuộn
 * của link "Xem tất cả" trên kệ; từ 15/09/2026 nút ấy mở rộng kệ tại chỗ, không cuộn tới đây nữa.
 */
export const FORMULA_LIST_ANCHOR = 'danh-sach-cong-thuc';

/**
 * `id` của khối "Phép tính đã lưu" ở màn Danh mục, dùng làm neo `#…` trên URL.
 *
 * Khai ở đây chứ không ở từng màn vì nó là HỢP ĐỒNG giữa hai màn: màn chi tiết công thức điều
 * hướng tới neo này ngay sau khi lưu, còn màn Danh mục đặt nó lên khối và cuộn tới khi thấy nó
 * trên URL. Hai bên tự gõ chuỗi thì lệch một chữ là lưu xong rơi xuống đầu trang mà không ai biết.
 */
export const SAVED_CALCS_ANCHOR = 'phep-tinh-da-luu';

/** Đường dẫn tới khối "Phép tính đã lưu", ví dụ '/danh-muc/#phep-tinh-da-luu'. */
export function savedCalcsPath(): string {
  return `${ROUTES.portfolio}#${SAVED_CALCS_ANCHOR}`;
}

/** Đường dẫn tới một công thức, ví dụ '/cong-thuc/wacc/'. */
export function formulaPath(id: string): string {
  return `${ROUTES.formulas}${id}/`;
}

/**
 * Đường dẫn tới màn danh sách ĐÃ LỌC SẴN, ví dụ '/cong-thuc/?q=roi&category=returns'.
 *
 * Một chỗ duy nhất dựng loại link này — thẻ nhóm và khối "Danh mục hot" của màn tìm kiếm đều gọi
 * vào đây. Ghép chuỗi tay ở từng nơi thì tên tham số dễ lệch với `parseListParams()`
 * mà không ai biết, và link mở ra một danh sách chưa lọc gì; đợt 7 đã dính đúng lỗi đó.
 *
 * Tham số mặc định được `listParamsToQuery()` lược bỏ, nên `DEFAULT_LIST_PARAMS` cho ra
 * '/cong-thuc/' trơn chứ không phải '/cong-thuc/?segment=all&sort=featured'.
 */
export function formulaListPath(params: ListParams): string {
  return `${ROUTES.formulas}${listParamsToQuery(params)}`;
}

export interface NavItem {
  key: NavKey;
  href: string;
  labelKey: MessageKey;
  /**
   * Nhãn NGẮN, chỉ dùng cho thanh tab dưới — bỏ trống thì tab dùng luôn `labelKey`.
   *
   * Sinh ra từ một phép tính hình học khi thanh dưới có NĂM mục: mỗi tab còn 72px ở khổ 360, và
   * "Về chúng tôi" ở 12px đậm đo được ~72px, tức xuống dòng — mà `.link` khai `min-height` chứ
   * không `height`, nên một nhãn hai dòng đội CẢ thanh lên và ăn chỗ của mọi màn.
   *
   * Từ 15/09/2026 thanh còn bốn mục (mục "Trang chủ" đi theo trang chủ), mỗi tab về lại ~90px nên
   * tiền đề ấy yếu đi. Nhãn ngắn vẫn giữ: đổi chữ trên thanh dưới là một quyết định hiển thị riêng,
   * chưa ai đo lại để chốt — và giữ thì không hỏng gì.
   *
   * Rút nhãn cho cả hai thanh thì mất chữ đúng ở chỗ có thừa chỗ: thanh trên desktop là hàng chữ
   * trần, ở đó "Về chúng tôi" vừa thoải mái và là tên màn người dùng sẽ thấy trong thẻ trình
   * duyệt. Nên chỗ chật có nhãn riêng, chỗ rộng giữ tên đầy đủ.
   */
  shortLabelKey?: MessageKey;
}

/**
 * Bốn mục của thanh điều hướng.
 *
 * Ba mục đầu theo đúng thứ tự WF-18 — chúng là một LUỒNG TÁC VỤ: xem & tính → giữ → chỉnh. Mục
 * "Trang chủ" từng đứng đầu hàng; nó rời thanh ngày 15/09/2026 khi trang chủ gộp vào màn Công thức,
 * nên "Công thức" nay vừa là mục đầu vừa là màn mở đầu.
 *
 * "Về chúng tôi" không nằm trong luồng ấy nên đứng cuối, sau `settings`: chen nó vào giữa là đẩy
 * Cài đặt khỏi chỗ quen bấm.
 */
export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { key: 'formulas', href: ROUTES.formulas, labelKey: 'nav.formulas' },
  { key: 'portfolio', href: ROUTES.portfolio, labelKey: 'nav.portfolio' },
  { key: 'settings', href: ROUTES.settings, labelKey: 'nav.settings' },
  {
    key: 'about',
    href: ROUTES.about,
    labelKey: 'nav.about',
    shortLabelKey: 'nav.aboutShort',
  },
];

/*
 * `showsModeToggle()` — luật "thanh trên chỉ bày cụm Cơ bản / Nâng cao ở màn danh sách" — đã BỎ
 * ngày 15/09/2026. Cụm nút không rời màn danh sách mà dời XUỐNG thân màn, ngay cạnh con số nó làm
 * đổi (hàng tiêu đề "Danh sách công thức", nhãn "Mức độ"), nên thanh trên không còn màn nào cần
 * bày nó. Số đo gốc của luật ấy — trang chủ không đổi một ký tự, 94/111 trang chi tiết bấm không
 * thấy gì — chuyển sang docblock `FormulaListScreen`, nơi nó vẫn là lý do nút đứng ở đó.
 */

/**
 * Những màn mà thanh trên bày TÊN MÀN thay cho tên sản phẩm.
 *
 * Bảng chứ không phải một điều kiện: chủ dự án chốt màn danh sách công thức trước, rồi Danh mục và
 * Cài đặt ngay sau — mỗi lần chỉ thêm một dòng ở đây, không sửa component nào.
 *
 * Ba màn, và bảng cũng là lời hứa ngược lại: màn nào KHÔNG có ở đây thì thân màn phải tự dựng
 * `<h1>` của nó — xem `headerTitleKey()`.
 *
 * '/ve-chung-toi/' cố ý ĐỨNG NGOÀI bảng dù có mục điều hướng riêng: màn này mở bằng một dải giới
 * thiệu có tiêu đề lớn của riêng nó, và tiêu đề ấy là thứ người đọc nhìn thấy đầu tiên. Đẩy `<h1>`
 * lên thanh trên thì từ 1024px nó thành `position: absolute` (xem `HeaderIdentity.module.css`) —
 * tức trang giới thiệu mất hẳn tiêu đề nhìn thấy được trên desktop, đúng chỗ nó cần nhất.
 *
 * (Trang chủ từng là mục thứ hai đứng ngoài bảng, vì ở đó tên sản phẩm mới là tên màn. Trang chủ đã
 * gộp vào '/cong-thuc/' ngày 15/09/2026; màn gộp giữ nguyên dòng của nó trong bảng — dưới 1024px
 * thanh trên vẫn nói "Công thức", từ 1024px vẫn bày logo + tên sản phẩm như mọi màn có tên.)
 *
 * Khớp TUYỆT ĐỐI: '/cong-thuc/wacc/' là màn chi tiết, nó có tên riêng của công thức làm tiêu đề nên
 * thanh trên không được bày thêm tên màn danh sách.
 */
const HEADER_TITLES: ReadonlyArray<{ path: string; key: MessageKey }> = [
  { path: ROUTES.formulas, key: 'page.formulas.title' },
  /* 'Danh mục của tôi', không phải 'Danh mục' của thanh nav: đây là tiêu đề trang, và chữ "của
     tôi" là thứ nói ra rằng kho này nằm trên máy người dùng. */
  { path: ROUTES.portfolio, key: 'portfolio.title' },
  { path: ROUTES.settings, key: 'page.settings.title' },
];

/**
 * Khoá chữ mà thanh trên bày thay cho tên sản phẩm, hoặc `null` nếu thanh giữ tên sản phẩm.
 *
 * ── Vì sao thanh trên đổi danh tính theo màn ─────────────────────────────────────────────────
 *
 * Trước đây phần đầu mọi màn là HAI hàng: thanh dính trên mang khối hộp + "Faculator", rồi ngay
 * dưới là `<h1>` tên màn. Ở khổ 360px hai hàng ấy ăn ~105px trước khi tới thứ đầu tiên bấm được,
 * mà hàng DÍNH trên — thứ luôn ở đó khi cuộn — lại mang chữ không bao giờ đổi, còn chữ có đổi thì
 * cuộn đi mất. Bản thiết kế cũ dựng đúng một hàng, và nó trả lời câu "tôi đang ở đâu".
 *
 * Màn nào có tên trong bảng thì `<h1>` chuyển hẳn LÊN thanh trên; thân màn thôi dựng tiêu đề. Một
 * trang vẫn đúng một `<h1>`, chỉ đổi chỗ — nếu để cả hai thì trang có hai tiêu đề cấp một, và
 * trình đọc màn hình đọc tên màn hai lần liền nhau.
 */
export function headerTitleKey(pathname: string): MessageKey | null {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return HEADER_TITLES.find((entry) => entry.path === path)?.key ?? null;
}

/** Chỗ quay về mà thanh trên bày cho một màn TRONG — đúng bộ prop của `BackLink`. */
export interface HeaderBackLink {
  fallbackHref: string;
  labelKey: MessageKey;
  rememberOrigin: boolean;
}

/**
 * Màn TRONG nào bày nút quay lại ở thanh trên, và quay về đâu — `null` nếu màn ấy không phải màn
 * trong.
 *
 * ── Danh tính thanh trên nay có BA dạng, không phải hai ──────────────────────────────────────
 *
 * `headerTitleKey()` ngay trên chia màn làm hai: bày tên sản phẩm, hoặc bày tên màn. Chủ dự án
 * chốt thêm dạng thứ ba cho MÀN TRONG: *"thay vì bên trên hiển thị icon và faculator thì đổi
 * thành button back kèm chỉ dẫn về màn trước"*. Ba dạng loại trừ nhau và `HeaderIdentity` hỏi
 * hàm này TRƯỚC, vì một màn trong không bao giờ nên bày tên sản phẩm.
 *
 * Điều đó lật lại đúng một câu lý lẽ ghi ở `headerTitleKey()` — *"màn chi tiết… nên thanh trên
 * phải trả lại chỗ cho tên sản phẩm"*. Câu ấy đúng khi chỉ có hai dạng: giữa "tên sản phẩm" và
 * "tên màn" thì màn chi tiết chọn tên sản phẩm, vì tên công thức đã là `<h1>` trong thân. Nay có
 * dạng thứ ba tốt hơn cả hai: hàng dính trên mang thứ DUY NHẤT người dùng cần ở đó — đường ra.
 *
 * ── Vì sao nhận cả `search`, không chỉ `pathname` ────────────────────────────────────────────
 *
 * Bảng dữ liệu WF-05 có một ngoại lệ thật: vào từ nút "Mở bảng dữ liệu" của một trang công thức
 * (`?from=<id>`) thì đường ra phải về ĐÚNG trang đó, không phải về danh sách. Đó là hành vi đã
 * dựng có chủ đích, không phải chi tiết vụn — bỏ đi là người dùng mất chỗ đang tính dở.
 *
 * Hàm THUẦN, nhận chuỗi truy vấn làm tham số chứ không tự đọc `window`: nơi gọi mới là chỗ quyết
 * định đọc nó lúc nào cho an toàn. Xem `HeaderIdentity` — ở đó nó đọc trong effect, vì
 * `useSearchParams()` trong thanh trên sẽ kéo `<Suspense>` vào layout gốc và thổi bay HTML tĩnh
 * của MỌI trang (cùng cái bẫy `FormulaDetail` đã ghi cho `?ma=`).
 */
export function backLinkFor(pathname: string, search = ''): HeaderBackLink | null {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;

  /* Trang chi tiết một công thức — KHỚP TRANG CON, khác hẳn hai hàm trên. '/cong-thuc/' trơn là
     màn danh sách, nó có mục riêng ở thanh nav nên không phải màn trong. */
  if (path.startsWith(ROUTES.formulas) && path !== ROUTES.formulas) {
    return { fallbackHref: ROUTES.formulas, labelKey: 'nav.backToList', rememberOrigin: true };
  }

  if (path === ROUTES.search) {
    return { fallbackHref: ROUTES.formulas, labelKey: 'nav.backToList', rememberOrigin: true };
  }

  if (path === ROUTES.data) {
    const from = (new URLSearchParams(search).get('from') ?? '').trim();
    /*
     * Kiểm DẠNG slug, không kiểm sự tồn tại — và đó là một bước lùi có tính toán.
     *
     * Bản cũ ở `DataTableScreen` đối chiếu `?from=` với `FORMULA_SUMMARIES` để một tham số gõ bậy
     * không dựng ra link trỏ vào trang không có. Không làm lại được ở đây: hàm này chạy trong
     * `HeaderIdentity`, thứ nằm ở layout GỐC, nên mọi thứ `routes.ts` import sẽ rơi vào gói của
     * MỌI trang. Chỉ mục 111 công thức là cái giá quá đắt cho một phép kiểm chỉ có nghĩa khi người
     * dùng tự gõ sai URL.
     *
     * Đổi lại là một biểu thức chặn đúng phần nguy hiểm: chuỗi lạ không còn ghép được thành đường
     * dẫn khác (`../`, khoảng trắng, dấu chấm hỏi). Cái còn sót là `?from=khong-co-that` cho ra
     * link 404 — người dùng phải tự sửa URL mới gặp, và họ vẫn còn thanh nav dưới để đi tiếp.
     */
    if (!/^[a-z0-9-]+$/.test(from)) {
      return { fallbackHref: ROUTES.formulas, labelKey: 'nav.backToList', rememberOrigin: true };
    }
    /*
     * `rememberOrigin: false` — giữ nguyên lý lẽ đã ghi ở `DataTableScreen`: lúc này không còn là
     * "về màn gốc" nữa, đọc sessionStorage rồi ghi đè bằng href công thức chỉ tổ nhấp nháy một
     * nhịp trước khi đúng.
     */
    return {
      fallbackHref: formulaPath(from),
      labelKey: 'nav.backToFormula',
      rememberOrigin: false,
    };
  }

  return null;
}

/**
 * Chân trang có dựng dải miễn trừ ở đường dẫn này không.
 *
 * Mặc định là CÓ, và đó là điểm quan trọng nhất của hàm: FR-24 · UI-04 đòi câu miễn trừ có mặt ở
 * mọi màn, nên `AppShell` vẫn dựng nó cho mọi màn và một màn mới không phải nhớ thêm gì. Hàm này
 * chỉ liệt kê ngoại lệ, và ngoại lệ chỉ hợp lệ khi màn ấy đã tự bày câu miễn trừ ở CHỖ TỐT HƠN.
 *
 * Hai ngoại lệ, cùng một lý do — màn ấy đã dựng `DisclaimerBar variant="notice"`, ô vàng nằm cùng
 * tầm mắt với con số tiền, nên dải xám ở chân trang là lần thứ hai nói cùng một câu trong cùng một
 * trang:
 *
 *   1. Trang chi tiết công thức. Chủ dự án: *"đoạn này ở chi tiết công thức đang có ở trên cùng
 *      rồi nên xóa ở dưới cùng đi"*.
 *   2. `/danh-muc/`. Màn này trước đây CỐ Ý đứng ngoài danh sách trừ, và docblock cũ ghi thẳng
 *      "muốn thêm thì thêm một dòng ở đây" — 09/09/2026 chủ dự án chốt thêm, cùng câu chữ:
 *      *"bên trên đã có"*.
 *
 * Điều kiện để một ngoại lệ hợp lệ: ô `notice` phải có ở MỌI trạng thái của màn, không riêng
 * trạng thái mặc định. `/danh-muc/` suýt vi phạm — ô ấy vốn nằm trong tab Mã nên tab Công thức
 * sẽ trắng câu miễn trừ ngay khi dòng này thêm vào; nó đã được nâng ra ngoài cả hai tab đúng lúc
 * ấy, xem docblock cạnh nó trong `PortfolioScreen.tsx`.
 *
 * Khớp TRANG CON ở màn chi tiết, cùng lẽ với `backLinkFor()`: '/cong-thuc/' trơn là màn danh sách,
 * nó không bày con số tiền nào và không có ô `notice`, nên chân trang vẫn phải nói. Danh mục thì
 * khớp TUYỆT ĐỐI — hôm nay nó không có trang con, và một trang con thêm sau này chưa chắc mang
 * theo ô `notice`, nên mặc định "có dải" phải là thứ nó nhận được.
 */
export function showsFooterDisclaimer(pathname: string): boolean {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const laTrangChiTiet = path.startsWith(ROUTES.formulas) && path !== ROUTES.formulas;
  const laDanhMuc = path === ROUTES.portfolio;
  return !laTrangChiTiet && !laDanhMuc;
}

/**
 * Mục nào đang được chọn ứng với đường dẫn hiện tại. Mọi mục khớp cả trang con
 * (ví dụ '/cong-thuc/wacc/' vẫn sáng mục Công thức).
 *
 * Nhánh riêng cho '/' đã bỏ cùng mục "Trang chủ": '/' chỉ còn là trang chuyển hướng, nó không sáng
 * mục nào — và vòng lặp dưới không cần bước bỏ qua nữa, vì không còn mục nào mang `href` '/' để
 * khớp tiền tố với MỌI đường dẫn.
 */
export function activeRouteKey(pathname: string): NavKey | null {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;

  // Màn tìm kiếm WF-09 và bảng dữ liệu WF-05 không có mục riêng ở thanh nav. WF-18 xếp cả hai
  // trong luồng công thức, nên chúng sáng mục Công thức — tắt hết mọi mục sẽ khiến người dùng
  // tưởng bị lạc.
  if (path.startsWith(ROUTES.search) || path.startsWith(ROUTES.data)) return 'formulas';

  for (const item of NAV_ITEMS) {
    if (path === item.href || path.startsWith(item.href)) return item.key;
  }

  return null;
}
