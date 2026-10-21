/**
 * Rút gọn đường dẫn nguồn để in làm chữ của link (WF-19D · S14).
 *
 * Bản vẽ in `cafef.vn/chuyen-nguoc-doi-...` thay vì một chữ "Nguồn": người đọc biết mình sắp đi
 * đâu trước khi bấm, và hai câu cùng dẫn một trang thì nhìn ra ngay. Bỏ giao thức và `www.` vì
 * chúng không giúp nhận ra trang; host giữ NGUYÊN — cắt vào host là mất đúng phần nhận diện — còn
 * phần đường dẫn phía sau cắt ở `max` ký tự và thêm `…`. `href` vẫn là đường dẫn đầy đủ; hàm này
 * chỉ lo phần chữ.
 *
 * Mặc định KHÔNG cắt (15/10/2026). Trước đó mặc định là 48 ký tự, và chủ dự án chụp
 * `tradingeconomics.com/vietnam/government-bond-yi…` với nửa dòng trống bên phải: _"tại sao đủ
 * không gian để hiển thị đầy đủ link mà lại phải ... như ảnh?"_. Một con số cố định không biết màn
 * còn bao nhiêu chỗ; CSS thì biết — các chỗ in link (`.giaiNguon a`, `.source a`) mang
 * `text-overflow: ellipsis` và tự cắt đúng ở mép chỗ trống thật.
 *
 * Không ném lỗi với chuỗi không phải URL: `quiz.test.ts` đã gác `source.url` phải là https, và
 * một chuỗi lạ hiện ra còn hơn một link trống.
 *
 * Chữ hiện ra đã GIẢI MÃ `%xx` (21/10/2026): link giá phiên của CafeF viết `start%44ate` để lách
 * việc CafeF hạ URL xuống chữ thường (`src/core/source-link.ts`), và người đọc phải thấy
 * `startDate=11/09/2026`, không thấy `%44`. `decodeURI` giữ nguyên các ký tự dành riêng (`/ ? & =`);
 * chuỗi mã hoá hỏng thì in như cũ.
 */
export function shortUrl(url: string, max = Number.POSITIVE_INFINITY): string {
  const stripped = giaiMa(url)
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '');
  if (stripped.length <= max) return stripped;

  const slash = stripped.indexOf('/');
  const host = slash === -1 ? stripped : stripped.slice(0, slash);
  if (host.length >= max - 1) return host;

  return `${stripped.slice(0, max - 1)}…`;
}

function giaiMa(url: string): string {
  try {
    return decodeURI(url);
  } catch {
    return url;
  }
}
