/*
 * Service worker — gói WBS 3.6.2 (PWA), FR-23 · SW-06 · NFR-POR-03 "sau lần tải đầu, hoạt động
 * ngoại tuyến đầy đủ chức năng tính toán".
 *
 * (Trước đây bốn chỗ trong repo gán việc chạy ngoại tuyến cho NFR-REL-02. Mã ấy là "hệ thống phải
 * TỰ KIỂM TRA CHÉO tính nhất quán giữa các công thức liên quan" — một yêu cầu hoàn toàn khác và
 * hiện chưa có dòng code nào. Trích sai mã làm cả hai bên cùng mất dấu.)
 *
 * Viết tay, KHÔNG thêm thư viện. Lý do không dùng next-pwa / Workbox: sản phẩm là bản xuất
 * tĩnh không có backend, toàn bộ nhu cầu gói gọn trong "giữ lại thứ vừa tải và dùng lại khi
 * mất mạng" — chừng đó khoảng 80 dòng, còn Workbox thêm ~15 kB runtime cho những chiến lược
 * không dùng tới (NFR-PER-04, và chủ dự án đã chốt không thêm thư viện).
 *
 * Vì sao KHÔNG precache danh sách file: `output: 'export'` sinh tên chunk có băm, không biết
 * trước lúc viết file này, và không có bước build nào sinh manifest. Precache một danh sách
 * đoán mò thì cài đặt hỏng ngay lần đầu. Thay vào đó dùng cache-lúc-chạy: thứ gì người dùng
 * đã mở thì lần sau mở lại được, kể cả khi rớt mạng.
 *
 * File này nằm ở `public/` nên được chép nguyên vào `out/sw.js` — nó phải ở gốc thì phạm vi
 * kiểm soát mới phủ cả site.
 */

/* eslint-env serviceworker */

/**
 * Đổi số này mỗi lần đổi chiến lược bên dưới, HOẶC mỗi lần đổi nội dung một file giữ nguyên
 * tên. Kho cũ bị xoá ở bước activate, nên người dùng không mắc kẹt với bản cache hỏng.
 *
 * v3: biểu tượng được vẽ lại nhưng tên file không đổi (`icon-192.png`, `icon.svg`…). Không
 * nâng số ở đây thì người đã cài PWA vẫn thấy biểu tượng cũ lấy từ kho, có khi hàng tháng.
 *
 * v4: trang chủ gộp vào màn Công thức (15/09/2026). `/` chỉ còn chuyển hướng, nên khung ngoại tuyến
 * đổi sang `/cong-thuc/` — kho v3 đang giữ bản `/` CŨ, tức một trang chủ không còn tồn tại.
 *
 * v5: mất mạng mà trang xin không có trong kho thì CHUYỂN HƯỚNG sang khung, không trả HTML của khung
 * dưới URL lạ nữa — xem `handleNavigation()`. Kho không đổi nội dung, nhưng đây là đổi chiến lược.
 */
const CACHE = 'ffb-v5';

/**
 * Trang dựng sẵn để làm khung khi mở lúc mất mạng — màn Công thức, HTML tĩnh đầy đủ.
 *
 * KHÔNG được là `/`: ở bản triển khai `/` trả 301, và `cache.add()` sẽ cất một phản hồi đã chuyển
 * hướng làm khung — mở lúc mất mạng là nhận về một cú chuyển hướng không đi đâu được.
 */
const SHELL = '/cong-thuc/';

/**
 * Trần số mục trong kho.
 *
 * Không có trần thì kho phình theo số trang người dùng từng mở — với 108 công thức, mỗi trang
 * kéo theo HTML cộng vài chunk, đủ để chạm hạn mức lưu trữ của trình duyệt trên máy chật. Khi
 * đầy thì trình duyệt xoá SẠCH kho chứ không xoá bớt, tức là mất luôn khả năng chạy ngoại
 * tuyến. Tự cắt bớt theo lối vào trước ra trước thì mất vài mục cũ, giữ được phần còn lại.
 */
const MAX_ENTRIES = 160;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(SHELL))
      // Cài hỏng vì mạng thì KHÔNG được làm hỏng cả lượt truy cập: bỏ qua, lần sau cài lại.
      .catch(() => undefined)
      // Không chờ bản cũ đóng — bản đầu tiên cài xong là nên chạy ngay.
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

/**
 * Ghi vào kho rồi cắt bớt nếu vượt trần.
 *
 * `cache.keys()` trả đúng thứ tự chèn, nên phần đầu mảng là mục cũ nhất — xoá từ đầu là lối
 * vào trước ra trước. Không cố đoán mục nào "quan trọng": đoán sai còn tệ hơn xoá theo tuổi.
 */
async function putCapped(request, response) {
  const cache = await caches.open(CACHE);
  await cache.put(request, response);

  const keys = await cache.keys();
  if (keys.length <= MAX_ENTRIES) return;

  for (const key of keys.slice(0, keys.length - MAX_ENTRIES)) {
    // Không bao giờ vứt khung ngoại tuyến — mất nó là mất luôn màn dự phòng lúc ngoại tuyến.
    if (new URL(key.url).pathname !== SHELL) await cache.delete(key);
  }
}

/** Chỉ đụng tới tài nguyên của chính site này, và chỉ với GET. */
function handles(request) {
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  // Bỏ qua chính service worker và manifest: hai file này phải luôn lấy bản mới nhất,
  // nếu không thì không bao giờ cập nhật được sang phiên bản sau.
  if (url.pathname === '/sw.js' || url.pathname === '/manifest.webmanifest') return false;

  return true;
}

/**
 * Điều hướng trang: mạng trước, cache sau.
 *
 * Ngược với tài nguyên tĩnh bên dưới, vì HTML là thứ hay đổi nhất — thêm một công thức là
 * đổi trang. Mất mạng thì lấy đúng trang ấy trong kho, không có nữa thì đưa người dùng về khung
 * màn Công thức để họ vẫn còn chỗ đứng chứ không gặp trang lỗi của trình duyệt.
 *
 * ── Không có trong kho thì CHUYỂN HƯỚNG sang khung, không trả HTML của khung dưới URL lạ ──
 *
 * Bản v4 trả thẳng HTML của `/cong-thuc/` cho bất kỳ URL nào vắng kho. Đo trên Chrome thật với
 * URL `/` (đường vào của link chia sẻ và của app đã cài trước 15/09/2026) lúc mất mạng: React ném
 * lỗi hydration #418 vì HTML dựng cho `/cong-thuc/` mà router đứng ở `/`, header hiện logo thay vì
 * tên màn, URL trên thanh địa chỉ sai — nhìn y như trang chủ CŨ, và chỉ hết khi tải lại. Đó là
 * "vào một màn cũ rồi mới load lại vào màn Công thức" chủ dự án báo ngày 16/09/2026.
 *
 * Trả một phản hồi chuyển hướng thì trình duyệt đi tiếp sang `/cong-thuc/`, request ấy lại qua đây
 * và lấy đúng khung dưới đúng URL của nó. Với `/` giữ nguyên truy vấn (`/?ma=FPT`), y hệt luật trong
 * `public/_redirects`; URL khác thì bỏ truy vấn vì nó thuộc về trang kia. Mã 302, không 301: đây là
 * câu trả lời tạm của lúc mất mạng, không phải của máy chủ.
 */
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    // CHỈ giữ phản hồi lành — nhánh tài nguyên bên dưới đã kiểm `ok`, nhánh này thì trước đợt
    // 15 thì không: một lần 404 hay 5xx là trang lỗi nằm luôn trong kho và được trả về mãi
    // cho URL đó, kể cả khi mạng đã tốt trở lại.
    if (response.ok) await putCapped(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached !== undefined) return cached;

    const url = new URL(request.url);
    if (url.pathname !== SHELL) {
      const target = new URL(SHELL, self.location.origin);
      if (url.pathname === '/') target.search = url.search;
      return Response.redirect(target.href, 302);
    }

    const shell = await caches.match(SHELL);
    if (shell !== undefined) return shell;

    // Không có gì trong kho — để trình duyệt tự báo lỗi mạng, đừng bịa ra một trang trắng.
    throw new Error('offline');
  }
}

/**
 * Tài nguyên tĩnh: trả bản trong kho ngay, đồng thời tải bản mới về cho lần sau.
 *
 * Hợp với chunk JS/CSS có băm trong tên: tên đổi nghĩa là nội dung đổi, nên bản trong kho
 * không bao giờ cũ so với tên đang xin.
 */
async function handleAsset(request) {
  const cached = await caches.match(request);

  const network = fetch(request)
    .then((response) => {
      // Chỉ giữ lại phản hồi lành. Cache một trang 404 là lần sau vẫn ra 404 dù mạng đã tốt.
      if (response.ok) void putCapped(request, response.clone());
      return response;
    })
    .catch(() => undefined);

  if (cached !== undefined) return cached;

  const response = await network;
  if (response !== undefined) return response;

  throw new Error('offline');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!handles(request)) return;

  event.respondWith(request.mode === 'navigate' ? handleNavigation(request) : handleAsset(request));
});
