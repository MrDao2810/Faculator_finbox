/**
 * Tầng APPLICATION — bản đồ đường dẫn (gói WBS 1.4.1).
 *
 * WF-18 chốt luồng: bốn mục ở thanh nav dưới, mỗi công thức một URL riêng.
 * Đây là nguồn duy nhất của đường dẫn — thanh nav, sitemap và mọi link đều đọc từ đây,
 * để đổi slug là sửa một chỗ.
 *
 * Slug tiếng Việt vì đường dẫn là phần Google đọc (FR-25). Đuôi '/' là bắt buộc:
 * next.config.mjs đặt `trailingSlash: true` cho hợp static hosting.
 */

import type { MessageKey } from './i18n';
import { listParamsToQuery, type ListParams } from './url-state';

export const ROUTES = {
  home: '/',
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
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Bốn mục có mặt ở thanh nav dưới.
 * `search` và `data` là route thật nhưng không phải mục điều hướng — tách kiểu ra để component
 * thanh nav không phải bịa một icon cho chúng.
 */
export type NavKey = Exclude<RouteKey, 'search' | 'data'>;

/** Đường dẫn tới một công thức, ví dụ '/cong-thuc/wacc/'. */
export function formulaPath(id: string): string {
  return `${ROUTES.formulas}${id}/`;
}

/**
 * Đường dẫn tới màn danh sách ĐÃ LỌC SẴN, ví dụ '/cong-thuc/?q=roi&category=returns'.
 *
 * Một chỗ duy nhất dựng loại link này — lưới nhóm ở trang chủ và hàng "Xem tất cả" của ô tìm
 * đều gọi vào đây. Ghép chuỗi tay ở từng nơi thì tên tham số dễ lệch với `parseListParams()`
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
}

/** Bốn mục của thanh điều hướng dưới, đúng thứ tự WF-18. */
export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { key: 'home', href: ROUTES.home, labelKey: 'nav.home' },
  { key: 'formulas', href: ROUTES.formulas, labelKey: 'nav.formulas' },
  { key: 'portfolio', href: ROUTES.portfolio, labelKey: 'nav.portfolio' },
  { key: 'settings', href: ROUTES.settings, labelKey: 'nav.settings' },
];

/**
 * Thanh trên có bày cụm nút Cơ bản / Nâng cao ở đường dẫn này không.
 *
 * CHỈ màn danh sách công thức. Đây là số đo chứ không phải sở thích: đo trên Chrome ở khổ
 * 420×900, bấm đổi chế độ rồi so DOM từng ký tự, thì trang chủ lúc nhàn không đổi MỘT ký tự
 * nào; và trong 111 trang chi tiết chỉ 17 trang đổi gì đó (10 trang có biến `level: 'advanced'`
 * cộng 7 trang `chainFor()` xếp vào chuỗi phụ thuộc) — 94 trang còn lại bấm không thấy gì.
 *
 * Một nút bày thường trực ở thanh thương hiệu mà phần lớn lần bấm không trả lời gì sẽ dạy người
 * dùng đúng một điều, và điều đó sai: "nút này hỏng". Họ thôi bấm, và mất luôn 32 công thức mức
 * nâng cao mà họ không hề biết là có.
 *
 * Ở '/cong-thuc/' thì ngược hẳn: bấm xong con số ngay phía trên đổi từ 79 sang 111, cách chỗ
 * ngón tay vừa chạm chưa tới một dòng. Nguyên nhân dính liền kết quả nên nút tự giải thích, không
 * cần thêm câu thông báo nào.
 *
 * Những màn khác VẪN đổi theo chế độ — chỉ là không còn nút ở thanh trên. Lối vào của chúng là
 * `HiddenByLevelNote`: dòng "N thứ đang ẩn · Bật chế độ Nâng cao" đặt ngay cạnh chỗ bị thiếu và
 * chỉ hiện khi thật sự có thứ bị giấu. Đường về chế độ Cơ bản ở những màn ấy là hàng "Chế độ
 * hiển thị" trong màn Cài đặt.
 *
 * Khớp TUYỆT ĐỐI, cố ý không khớp trang con: '/cong-thuc/wacc/' là màn chi tiết chứ không phải
 * màn danh sách, và nó nằm trong nhóm 94 trang nói trên.
 */
export function showsModeToggle(pathname: string): boolean {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return path === ROUTES.formulas;
}

/**
 * Những màn mà thanh trên bày TÊN MÀN thay cho tên sản phẩm.
 *
 * Bảng chứ không phải một điều kiện: chủ dự án chốt màn danh sách công thức trước, rồi Danh mục và
 * Cài đặt ngay sau — mỗi lần chỉ thêm một dòng ở đây, không sửa component nào.
 *
 * Nay là ĐỦ BA màn có mục riêng ở thanh điều hướng (trừ trang chủ, nơi tên sản phẩm mới đúng là
 * tên màn). Vì thế bảng cũng thành lời hứa ngược lại: màn nào KHÔNG có ở đây thì thân màn phải tự
 * dựng `<h1>` của nó — xem `headerTitleKey()`.
 *
 * Khớp TUYỆT ĐỐI, cùng lẽ với `showsModeToggle()`: '/cong-thuc/wacc/' là màn chi tiết, nó có tên
 * riêng của công thức làm tiêu đề nên thanh trên phải trả lại chỗ cho tên sản phẩm.
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
 * Mục nào đang được chọn ứng với đường dẫn hiện tại.
 * Trang chủ phải khớp tuyệt đối, các mục khác khớp cả trang con
 * (ví dụ '/cong-thuc/wacc/' vẫn sáng mục Công thức).
 */
export function activeRouteKey(pathname: string): NavKey | null {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;

  if (path === ROUTES.home) return 'home';

  // Màn tìm kiếm WF-09 và bảng dữ liệu WF-05 không có mục riêng ở thanh nav. WF-18 xếp cả hai
  // trong luồng công thức, nên chúng sáng mục Công thức — tắt hết mọi mục sẽ khiến người dùng
  // tưởng bị lạc.
  if (path.startsWith(ROUTES.search) || path.startsWith(ROUTES.data)) return 'formulas';

  for (const item of NAV_ITEMS) {
    if (item.key === 'home') continue;
    if (path === item.href || path.startsWith(item.href)) return item.key;
  }

  return null;
}
