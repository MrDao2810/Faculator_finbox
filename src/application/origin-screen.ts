/**
 * Tầng APPLICATION — nhớ MÀN người dùng vừa rời đi để mở một công thức, kèm chỗ họ đang đứng
 * trên màn ấy, để nút quay lại đưa họ về đúng chỗ đó.
 *
 * ## Vì sao rộng hơn "màn danh sách"
 *
 * Bản trước của file này tên là `last-list-url.ts` và chỉ nhận URL bắt đầu bằng `/cong-thuc/`.
 * Đúng cho một lối vào, sai cho bốn lối còn lại — mà bốn lối kia mới là lối thường đi:
 *
 *   - kệ "Công thức dùng hằng ngày" và ô tìm ngay tại **trang chủ** (18 thẻ + tối đa 8 kết quả);
 *   - màn **tìm kiếm** WF-09;
 *   - **danh mục** WF-06, cả link `?ma=` của sheet chọn công thức lẫn link `?luu=` của phép tính
 *     đã lưu.
 *
 * Vào từ những chỗ ấy thì không có gì được ghi, nên nút quay lại rơi về `/cong-thuc/` trơn — tức
 * ném người dùng sang một màn họ chưa từng đứng, và nếu trong phiên có lần nào ghé danh sách thì
 * còn tệ hơn: nó đưa họ về bộ lọc của lần ghé ấy. Chủ dự án báo đúng ca này.
 *
 * ## Vì sao nhớ cả vị trí cuộn
 *
 * Về đúng MÀN vẫn chưa phải về đúng CHỖ. Trang chủ có kệ 18 thẻ, hai lưới nhóm rồi khối công cụ;
 * bấm một thẻ ở kệ rồi quay ra mà đứng ở đỉnh trang thì vẫn phải cuộn đi tìm lại. Nhớ thêm một
 * con số là đủ, và nó rẻ hơn nhiều so với việc dựng anchor cho từng khối.
 *
 * ## Vì sao KHÔNG dùng `history.back()`
 *
 * Lý do cũ giữ nguyên: `history.back()` giữ được bộ lọc lẫn vị trí cuộn, nhưng mở thẳng
 * `/cong-thuc/pe/` từ Google hay từ link ai đó gửi thì lịch sử không có mục nào của site này, và
 * `back()` ném người dùng RA KHỎI sản phẩm. Trang chi tiết là trang được lập chỉ mục (FR-25) nên
 * vào thẳng là đường vào thường xuyên, không phải ngoại lệ.
 *
 * Nhớ URL rồi dựng một thẻ `<a>` thật thì luôn đi tới một chỗ có thật, chạy được cả khi
 * JavaScript chưa tải xong, và người dùng vẫn bấm chuột phải "mở tab mới" được.
 *
 * ## Vì sao `sessionStorage` chứ không `localStorage`
 *
 * Đây là ngữ cảnh của MỘT lượt duyệt, không phải tuỳ chọn của người dùng. Mở lại trình duyệt
 * ngày hôm sau mà nút quay lại vẫn nhớ bộ lọc của hôm qua thì mới là lạ.
 *
 * Phần thuần nằm ở đây, không import React — test được bằng Node. Phần chạm `sessionStorage` do
 * tầng giao diện gọi trong `useEffect`, cùng khuôn với `price-series-store.ts`.
 */

import type { MessageKey } from './i18n';
import { ROUTES } from './routes';

/**
 * Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới.
 *
 * `v1` ở đây là bản ghi JSON `{url, scrollY}`, khác hẳn chuỗi URL trần của `ffb.lastList.v1`.
 * Khoá cũ không được đọc lại và cũng không cần dọn: `sessionStorage` chết theo tab.
 */
export const ORIGIN_KEY = 'ffb.origin.v1';

/**
 * Cờ "lượt điều hướng này là một cú QUAY LẠI" — nút quay lại đặt, màn gốc đọc rồi xoá.
 *
 * Cần một cờ riêng chứ không suy từ việc URL khớp bản ghi: mọi lần mở trang chủ đều khớp, nên
 * thiếu cờ thì mỗi lần vào trang chủ là một cú nhảy cuộn không ai yêu cầu — kể cả lần đầu tiên
 * trong phiên, ngay sau khi bấm mục Trang chủ ở thanh dưới.
 */
export const ORIGIN_RESTORE_KEY = 'ffb.origin.restore.v1';

/**
 * Màn gốc TRƯỚC màn gốc đang nhớ — ô nhớ thứ hai, và vì sao một ô là không đủ.
 *
 * `/tim-kiem/` mang hai vai cùng lúc: nó nằm trong `ORIGINS` (để từ một kết quả tìm mở vào trang
 * chi tiết thì nút quay lại ở đó biết đường về đúng kết quả ấy), nhưng bản thân nó cũng có một
 * `BackLink` và cần biết CHÍNH NÓ được mở từ đâu. Với một ô nhớ duy nhất thì vai thứ nhất đè chết
 * vai thứ hai: vào `/tim-kiem/` từ danh mục, `OriginTracker` ghi đè ngay `/danh-muc/` bằng
 * `/tim-kiem/`, nút quay lại đọc lên thấy chính trang đang đứng và bấm vào không đi đâu cả — đúng
 * lỗi chủ dự án báo.
 *
 * Ô này chỉ nhận bản cũ khi ĐƯỜNG DẪN đổi. Đổi mỗi truy vấn — gõ ô tìm, đổi chip lọc, cuộn — thì
 * nó đứng yên; nếu không, mỗi ký tự gõ ở màn tìm sẽ đẩy chính `/tim-kiem/` vào đây và ô thứ hai
 * hỏng y như ô thứ nhất.
 */
export const ORIGIN_PREV_KEY = 'ffb.origin.prev.v1';

/**
 * Trần độ dài URL. Dài hơn mức này là dấu hiệu có người nhét rác vào `sessionStorage`;
 * `parseOrigin()` bỏ qua thay vì dựng một link khổng lồ lên màn.
 */
const MAX_URL_LENGTH = 300;

/** Trần vị trí cuộn, chặn một con số vô lý biến nút quay lại thành cú nhảy xuống hư không. */
const MAX_SCROLL_Y = 500_000;

/** Màn người dùng đang đứng, kèm chỗ đứng trên màn ấy. */
export interface Origin {
  /** Đường dẫn nội bộ kèm truy vấn, ví dụ `/cong-thuc/?category=risk`. */
  url: string;
  /** `window.scrollY` lúc rời đi, làm tròn xuống số nguyên. */
  scrollY: number;
}

/**
 * Bốn màn được phép làm "gốc", và nhãn nút quay lại của mỗi màn.
 *
 * Danh sách ĐÓNG chứ không phải "mọi thứ không phải trang chi tiết", và đó là chỗ an toàn của cả
 * module: nội dung `sessionStorage` người dùng sửa được, mà nó đi thẳng vào thuộc tính `href`.
 * Đối chiếu với một danh sách có sẵn thì `javascript:`, `data:`, `//ten-mien-khac` và mọi đường
 * dẫn lạ đều rớt, không cần bắt từng mẫu một.
 *
 * Màn chi tiết công thức CỐ Ý không có mặt — chủ dự án chốt: từ công thức này mở sang công thức
 * khác (khối chuỗi WF-04, ô nhập liên kết) thì nút quay lại vẫn về màn gốc BAN ĐẦU, không đi
 * ngược từng bước. Bảng dữ liệu WF-05 cũng không có mặt: nó không có link nào vào trang chi tiết,
 * và nút quay lại của chính nó đã có đường riêng.
 */
const ORIGINS: ReadonlyArray<{ path: string; labelKey: MessageKey }> = [
  { path: ROUTES.home, labelKey: 'nav.home' },
  { path: ROUTES.formulas, labelKey: 'nav.backToList' },
  { path: ROUTES.search, labelKey: 'search.label' },
  { path: ROUTES.portfolio, labelKey: 'nav.portfolio' },
];

/**
 * Phần ĐƯỜNG DẪN của một URL nội bộ, luôn có dấu `/` ở cuối — bỏ truy vấn đi.
 *
 * Tách riêng vì hai chỗ cần đúng một cách chuẩn hoá: `matchOrigin()` để so với `ORIGINS`, và
 * `backTarget()` để trả lời "bản ghi này có phải chính màn đang đứng không". Hai bản chuẩn hoá
 * lệch nhau một dấu `/` là đủ để nút quay lại tự trỏ về chỗ cũ mà không ai nhìn ra vì sao.
 */
export function originPath(url: string): string {
  const rawPath = url.split('?')[0] ?? '';
  return rawPath.endsWith('/') ? rawPath : `${rawPath}/`;
}

/**
 * Màn gốc ứng với một URL, hoặc `null` nếu URL ấy không phải màn gốc nào.
 *
 * Ba phép loại, theo thứ tự:
 *
 * 1. `//` ở đầu — trình duyệt hiểu đó là URL tuyệt đối theo giao thức hiện tại, tức vẫn dẫn sang
 *    tên miền khác dù nhìn như đường dẫn nội bộ. Phải chặn TRƯỚC khi so khớp.
 * 2. Nhiều hơn một dấu `?` — chuỗi méo, không phải thứ `listParamsToQuery()` sinh ra. Kiểm trước
 *    khi chuẩn hoá, vì `originPath()` chỉ lấy phần đầu nên nó nuốt mất dấu hiệu ấy.
 * 3. Phần đường dẫn phải khớp TUYỆT ĐỐI một mục trong `ORIGINS`, nên `/cong-thuc/pe/` rớt (khác
 *    `/cong-thuc/`) còn `/cong-thuc/?category=risk` thì đạt.
 */
export function matchOrigin(url: string): { path: string; labelKey: MessageKey } | null {
  if (url === '' || url.length > MAX_URL_LENGTH) return null;
  if (url.startsWith('//') || !url.startsWith('/')) return null;
  if (url.split('?').length > 2) return null;

  const path = originPath(url);
  return ORIGINS.find((origin) => origin.path === path) ?? null;
}

/**
 * Đọc bản ghi đã nhớ. `null` khi chưa có, khi chuỗi hỏng, hoặc khi URL không phải màn gốc hợp lệ.
 *
 * `JSON.parse` bọc trong `try` vì đây là dữ liệu người dùng sửa được: một chuỗi méo phải ra `null`
 * chứ không được ném lỗi lên tận component quay lại.
 */
export function parseOrigin(raw: string | null): Origin | null {
  if (raw === null || raw.length > MAX_URL_LENGTH * 2) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== 'object' || data === null) return null;
  const { url, scrollY } = data as { url?: unknown; scrollY?: unknown };

  if (typeof url !== 'string' || matchOrigin(url) === null) return null;
  if (typeof scrollY !== 'number' || !Number.isFinite(scrollY)) return null;

  return { url, scrollY: Math.min(MAX_SCROLL_Y, Math.max(0, Math.floor(scrollY))) };
}

/**
 * Bản ghi để đưa vào `sessionStorage` khi đang đứng ở một màn gốc.
 * Trả `null` nghĩa là màn hiện tại không đáng nhớ — nơi gọi đừng ghi gì cả, và nhất là đừng XOÁ
 * bản ghi cũ: đứng ở trang chi tiết mà xoá thì chính nút quay lại của trang ấy mất đích.
 */
export function originToStore(pathname: string, search: string, scrollY: number): Origin | null {
  // `search` gồm cả dấu '?' khi có tham số, và là chuỗi rỗng khi không.
  const url = `${pathname}${search}`;
  if (matchOrigin(url) === null) return null;

  return { url, scrollY: Number.isFinite(scrollY) ? Math.max(0, Math.floor(scrollY)) : 0 };
}

/** Những gì nút quay lại biết được về lượt duyệt hiện tại, gom lại để không lẫn hai tham số chuỗi. */
export interface BackContext {
  /** Bản ghi trong `ORIGIN_KEY` — màn gốc mới nhất. */
  origin: Origin | null;
  /** Bản ghi trong `ORIGIN_PREV_KEY` — màn gốc liền trước, dùng khi `origin` chính là màn đang đứng. */
  prev: Origin | null;
  /** Đường dẫn màn đang đứng, tức `window.location.pathname`. Truy vấn không cần và không dùng. */
  here: string;
}

/**
 * Đích của nút quay lại: màn đã nhớ nếu có, không thì đường dẫn dự phòng nơi gọi đưa vào.
 *
 * Trả cả `labelKey` chứ không riêng `href`, vì nhãn phải NÓI ĐÚNG đích — đó là quyết định số 2
 * trong docblock của `BackLink` ("có chữ chứ không chỉ mỗi mũi tên"), và một nút ghi "Danh sách
 * công thức" mà bấm vào ra trang chủ thì còn tệ hơn mũi tên trơn.
 *
 * ## Vì sao phải loại bản ghi trùng màn đang đứng
 *
 * Một màn gốc có thể có nút quay lại của chính nó — `/tim-kiem/` là đúng ca ấy, xem
 * `ORIGIN_PREV_KEY`. Lúc đó `ORIGIN_KEY` đang giữ chính nó, và trả nó ra là dựng một cái link
 * trỏ về trang đang mở: bấm vào không đi đâu, mà nhãn thì vẫn hứa hẹn một đường ra. Nên hai ô nhớ
 * được thử lần lượt, ô nào trỏ ra khỏi màn này thì ô ấy thắng; hết cả hai mới rơi về dự phòng.
 *
 * So bằng ĐƯỜNG DẪN chứ không bằng cả URL: `/tim-kiem/?q=roe` và `/tim-kiem/` là cùng một màn,
 * và một cái link đổi mỗi truy vấn thì vẫn không phải đường ra.
 */
export function backTarget(
  context: BackContext,
  fallbackHref: string,
  fallbackLabelKey: MessageKey,
): { href: string; labelKey: MessageKey } {
  const herePath = originPath(context.here);

  for (const candidate of [context.origin, context.prev]) {
    if (candidate === null) continue;

    const matched = matchOrigin(candidate.url);
    if (matched === null || matched.path === herePath) continue;

    return { href: candidate.url, labelKey: matched.labelKey };
  }

  return { href: fallbackHref, labelKey: fallbackLabelKey };
}
