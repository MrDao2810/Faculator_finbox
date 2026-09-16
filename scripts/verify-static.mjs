/**
 * Kiểm bản build tĩnh — chạy SAU `npm run build`.
 *
 * Vì sao cần một script riêng thay vì một ca vitest: thứ phải kiểm ở đây là NỘI DUNG CỦA FILE
 * HTML XUẤT RA, mà file đó chỉ tồn tại sau khi build. `npm run check` chạy vitest trước build
 * nên không thấy nó.
 *
 * Vì sao phải kiểm: với `output: 'export'`, chỉ cần một component trong cây gọi
 * `useSearchParams()` là Next dựng ranh giới `<Suspense>` và **bỏ toàn bộ cây đó khỏi HTML
 * tĩnh**, thay bằng một marker bailout. Build VẪN XANH. `/cong-thuc/` từng dính đúng lỗi đó
 * (fallback={null} → 14,6 kB, không một link công thức nào).
 *
 * ── Từ 15/09/2026: trang chủ gộp vào màn Công thức ──────────────────────────────────────────
 *
 * `/cong-thuc/` là màn MỞ ĐẦU, URL priority 1.0 của sitemap, trang Google thật sự cần đọc. Màn này
 * được phép có đúng MỘT ranh giới bailout — của `ListUrlSync`, component rỗng đọc URL — còn kệ
 * "Công thức dùng hằng ngày" và cả danh sách phải nằm NGOÀI nó, trong HTML. Nếu người sau "sửa cho
 * nhất quán" bằng cách cho màn dùng `useListParams()`, cả màn lặng lẽ mất khỏi HTML tĩnh mà không
 * test nào đỏ. Script này là chỗ chặn cứng.
 *
 * `/` chỉ còn chuyển hướng về `/cong-thuc/`: 301 qua `_redirects` ở bản triển khai, meta refresh ở
 * bản tĩnh. Nó phải KHÔNG mang nội dung công thức nào (FR-25: một nội dung, một URL).
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

/** Marker Next chèn vào chỗ cây bị loại khỏi HTML tĩnh. */
const BAILOUT = 'BAILOUT_TO_CLIENT_SIDE_RENDERING';

/**
 * Ngưỡng kích thước màn Công thức. Đặt thấp hơn hẳn số thật (kệ 16 thẻ + danh sách 111 thẻ, cỡ trăm
 * kB) để không phải sửa mỗi lần thêm bớt một công thức, nhưng vẫn cao hơn hẳn một trang chỉ còn vỏ
 * AppShell (~14 kB).
 */
const MIN_LIST_BYTES = 25_000;

const checks = [];

function check(name, pass, detail = '') {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${name}${detail === '' ? '' : ` — ${detail}`}`);
}

/* ── /cong-thuc/ — màn mở đầu (trang chủ + danh sách gộp làm một) ─────────── */

let listHtml = '';
try {
  listHtml = readFileSync('out/cong-thuc/index.html', 'utf8');
} catch {
  console.error('Không đọc được out/cong-thuc/index.html — chạy `npm run build` trước.');
  process.exit(1);
}

const listBytes = statSync('out/cong-thuc/index.html').size;
const summaries = readFileSync('src/core/formulas/summaries.generated.ts', 'utf8');

/* Số đọc THẲNG từ chỉ mục đã sinh — thêm bớt một công thức không biến script này thành việc sửa tay. */
const TONG_CONG_THUC = (summaries.match(/categoryId:/g) ?? []).length;
const SO_NANG_CAO = (summaries.match(/level: 'advanced'/g) ?? []).length;

/*
 * Đúng MỘT ranh giới bailout, không phải "không có": `ListUrlSync` cố ý gọi `useSearchParams()` trong
 * `<Suspense>` riêng và không dựng ra gì. Hai ranh giới trở lên nghĩa là có thêm một cây NỮA bị đẩy
 * ra khỏi HTML — gần như chắc là ai đó vừa cho màn đọc URL bằng hook. Các phép kiểm nội dung bên
 * dưới mới là thứ chứng minh không mất gì; phép này chỉ báo sớm.
 */
const soBailout = listHtml.split(BAILOUT).length - 1;
check(
  'màn Công thức có tối đa MỘT ranh giới dựng ở máy khách (của ListUrlSync)',
  soBailout <= 1,
  `${String(soBailout)} marker bailout`,
);

/*
 * Kệ "Công thức dùng hằng ngày" đủ ô, ĐÚNG THỨ TỰ bản vẽ.
 *
 * Tìm id của tiêu đề thôi là chưa đủ: id nằm ở `<h2>` do server dựng nên nó còn nguyên kể cả khi
 * lưới bên dưới rỗng. Từ đợt cá nhân hoá, lưới do một client component dựng — nếu người sau cho nó
 * chờ một cờ `hydrated` rồi mới vẽ, link của kệ biến mất khỏi HTML tĩnh mà phép kiểm id vẫn xanh.
 *
 * Danh sách ô đọc THẲNG từ `daily-shelf.ts` (docblock ở đó dặn giữ dạng mảng chuỗi nháy đơn).
 */
const shelfSource = readFileSync('src/application/daily-shelf.ts', 'utf8');
const shelfIds = [
  ...(/\bDAILY_SHELF_IDS = \[([\s\S]*?)\] as const/
    .exec(shelfSource)?.[1]
    ?.matchAll(/'([a-z0-9-]+)'/g) ?? []),
].map((m) => m[1]);

const shelfBlock =
  /<section[^>]*aria-labelledby="cong-thuc-hang-ngay"[\s\S]*?<\/section>/.exec(listHtml)?.[0] ?? '';
const shelfLinks = [...shelfBlock.matchAll(/href="\/cong-thuc\/([a-z0-9-]+)\/"/g)].map((m) => m[1]);

check(
  `kệ "Công thức dùng hằng ngày" dựng sẵn đủ ${String(shelfIds.length)} ô, đúng thứ tự trong HTML tĩnh`,
  shelfIds.length > 0 && JSON.stringify(shelfLinks) === JSON.stringify(shelfIds),
  shelfBlock === ''
    ? 'không thấy khối có aria-labelledby="cong-thuc-hang-ngay"'
    : `${shelfLinks.join(', ')}`,
);

/*
 * Kệ bày trước `DAILY_SHELF_PREVIEW` ô, phần còn lại nằm SẴN trong HTML nhưng mang `hidden` — bấm
 * "Xem tất cả" chỉ gỡ thuộc tính. Ai đó đổi sang "chỉ dựng phần còn lại sau khi bấm" thì phép đếm
 * link ở trên đã đỏ; phép này bắt chiều ngược lại: quên `hidden` thì kệ bày đủ 16 ô ngay từ đầu.
 */
const shelfPreview = Number(/\bDAILY_SHELF_PREVIEW = (\d+)/.exec(shelfSource)?.[1] ?? NaN);
const soOAn = (shelfBlock.match(/<li hidden=""/g) ?? []).length;
check(
  `kệ bày trước ${String(shelfPreview)} ô, ${String(shelfIds.length - shelfPreview)} ô còn lại mang hidden`,
  Number.isInteger(shelfPreview) && shelfPreview > 0 && soOAn === shelfIds.length - shelfPreview,
  `${String(soOAn)} ô ẩn`,
);

check(
  'kệ có nút "Xem tất cả" (aria-expanded="false") điều khiển đúng lưới ô',
  /<button[^>]*aria-expanded="false"[^>]*aria-controls="cong-thuc-hang-ngay-luoi"/.test(
    shelfBlock,
  ) && shelfBlock.includes('id="cong-thuc-hang-ngay-luoi"'),
);

/*
 * ĐỦ công thức trong khối danh sách, không phải "có là được".
 *
 * Chế độ Cơ bản lọc bớt danh sách theo cấp độ (FR-09), và mặc định của sản phẩm LÀ chế độ Cơ bản.
 * Việc lọc ấy chỉ được phép xảy ra ở phía máy khách: HTML tĩnh phải luôn có đủ đường vào cho cả
 * thư viện. Ai đó "sửa cho nhất quán" bằng cách lọc luôn lúc dựng tĩnh là lặng lẽ giấu mọi công
 * thức Nâng cao khỏi Google, mà build vẫn xanh.
 *
 * Đếm TRONG khối danh sách chứ không cả trang: kệ phía trên cũng mang link công thức.
 */
const listBlock =
  /<section[^>]*id="danh-sach-cong-thuc"[\s\S]*?<\/section>/.exec(listHtml)?.[0] ?? '';
const listLinks = new Set(
  [...listBlock.matchAll(/href="\/cong-thuc\/([a-z0-9-]+)\/"/g)].map((m) => m[1]),
);

check(
  'khối danh sách có ĐỦ link công thức trong HTML tĩnh (không lọc theo chế độ lúc dựng)',
  listLinks.size === TONG_CONG_THUC,
  `${String(listLinks.size)} / ${String(TONG_CONG_THUC)} link công thức khác nhau`,
);

/*
 * Thẻ Nâng cao mang lớp `advancedPreHydrate` để CSS giấu trước hydrate — người dùng Cơ bản không
 * thấy danh sách co 111 → 79 lúc tải trang. Đếm đúng bằng số công thức Nâng cao: thiếu là có thẻ
 * lộ ra rồi biến mất, thừa là giấu nhầm thẻ Cơ bản.
 */
const soLopAn = (listBlock.match(/advancedPreHydrate/g) ?? []).length;
check(
  'mọi thẻ Nâng cao (và chỉ thẻ Nâng cao) mang lớp giấu trước hydrate',
  soLopAn === SO_NANG_CAO,
  `${String(soLopAn)} / ${String(SO_NANG_CAO)}`,
);

/*
 * React chèn `<!-- -->` giữa hai text node liền nhau khi dựng ở server. Gỡ marker trước rồi mới đối
 * chiếu: chuỗi cần kiểm là chuỗi NGƯỜI ĐỌC thấy, không phải chuỗi byte.
 *
 * Dòng "Hiển thị · N công thức" phải mang CẢ HAI con số (Cơ bản / cả thư viện) để CSS chọn theo
 * `data-mode` — in cứng một số là hai con số về cùng một thư viện cãi nhau trên cùng màn hình.
 */
const dongDem = /<p[^>]*>(?:(?!<\/p>)[\s\S])*?Hiển thị[\s\S]*?<\/p>/.exec(listBlock)?.[0] ?? '';
check(
  'dòng "Hiển thị · N công thức" đếm theo cả hai chế độ, không in cứng một con số',
  dongDem.includes('countBasic') &&
    dongDem.includes('countAdvanced') &&
    / công thức</.test(dongDem.replaceAll('<!-- -->', '')),
  dongDem === '' ? 'không thấy dòng "Hiển thị"' : 'mang cả hai nhánh',
);

check(
  'hàng chip nhóm dựng sẵn 13 lựa chọn radio',
  (listBlock.match(/name="nhom-cong-thuc"/g) ?? []).length === 13,
  `${String((listBlock.match(/name="nhom-cong-thuc"/g) ?? []).length)} radio`,
);

check(
  'màn Công thức có đúng một <h1> (ở thanh trên)',
  (listHtml.match(/<h1[\s>]/g) ?? []).length === 1,
  `đếm được ${String((listHtml.match(/<h1[\s>]/g) ?? []).length)}`,
);

check(
  `màn Công thức đủ nội dung (> ${String(MIN_LIST_BYTES)} B)`,
  listBytes > MIN_LIST_BYTES,
  `${String(listBytes)} B`,
);

/* ── / — chỉ còn chuyển hướng ────────────────────────────────────────────── */

const rootHtml = existsSync('out/index.html') ? readFileSync('out/index.html', 'utf8') : '';

check(
  '/ tự chuyển về /cong-thuc/ và đặt noindex',
  /<meta[^>]+http-equiv="refresh"[^>]+content="0;url=\/cong-thuc\/"/.test(rootHtml) &&
    /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(rootHtml),
  rootHtml === '' ? 'thiếu out/index.html' : '',
);

check(
  '/ không mang nội dung công thức nào — một nội dung, một URL (FR-25)',
  rootHtml !== '' && !/href="\/cong-thuc\/[a-z0-9-]+\/"/.test(rootHtml),
);

/*
 * `_redirects` là lớp chuyển hướng CHÍNH ở bản triển khai (301 — bộ máy tìm kiếm hiểu là dời hẳn).
 * Máy chạy thử không đọc nó nên không phép kiểm nào khác thấy nó hỏng.
 */
const redirects = existsSync('out/_redirects') ? readFileSync('out/_redirects', 'utf8') : '';
check(
  'out/_redirects chuyển / về /cong-thuc/ bằng 301',
  /^\/\s+\/cong-thuc\/\s+301\s*$/m.test(redirects),
  redirects === '' ? 'thiếu out/_redirects' : '',
);

/* Đọc từng `<url>` của sitemap thành cặp (đường dẫn, priority) — so đường dẫn, không so chuỗi thô. */
const sitemapUrls = [
  ...(existsSync('out/sitemap.xml') ? readFileSync('out/sitemap.xml', 'utf8') : '').matchAll(
    /<url>([\s\S]*?)<\/url>/g,
  ),
].map((m) => ({
  path: (() => {
    const loc = /<loc>\s*([^<\s]+)\s*<\/loc>/.exec(m[1])?.[1] ?? '';
    try {
      return new URL(loc).pathname;
    } catch {
      return loc;
    }
  })(),
  priority: /<priority>\s*([^<\s]+)\s*<\/priority>/.exec(m[1])?.[1] ?? '',
}));

check(
  'sitemap không khai URL gốc "/", và /cong-thuc/ mang priority 1',
  sitemapUrls.length > 0 &&
    !sitemapUrls.some((u) => u.path === '/') &&
    sitemapUrls.some((u) => u.path === '/cong-thuc/' && Number(u.priority) === 1),
  `${String(sitemapUrls.length)} URL`,
);

const manifestGoc = existsSync('out/manifest.webmanifest')
  ? JSON.parse(readFileSync('out/manifest.webmanifest', 'utf8'))
  : {};
/*
 * `id` giữ nguyên "/" dù `start_url` đổi: Chrome lấy `start_url` làm danh tính app khi thiếu `id`,
 * nên đổi `start_url` mà không có `id` là người đã cài PWA thấy nó như một app khác.
 */
check(
  'manifest mở vào /cong-thuc/ mà vẫn giữ danh tính app cũ (id "/")',
  manifestGoc.start_url === '/cong-thuc/' && manifestGoc.id === '/',
  `start_url ${String(manifestGoc.start_url)} · id ${String(manifestGoc.id)}`,
);

/*
 * Khung ngoại tuyến của service worker không được là "/": ở bản triển khai "/" trả 301, và
 * `cache.add()` sẽ cất một phản hồi chuyển hướng làm khung.
 */
check(
  'service worker lấy /cong-thuc/ làm khung ngoại tuyến, không lấy trang chuyển hướng',
  existsSync('out/sw.js') &&
    /const SHELL = '\/cong-thuc\/';/.test(readFileSync('out/sw.js', 'utf8')),
);

/* ── Ký hiệu toán học trong HTML tĩnh — gói 2.4.3 ────────────────────────── */

/*
 * Cả gói 2.4.3 đứng trên MỘT tính chất: `katex` chạy trong server component nên ký hiệu toán được
 * nướng vào HTML lúc build, và phía máy khách tốn 0 byte JS. Tính chất ấy vô hình với mọi phép
 * kiểm khác — unit test dựng bằng jsdom thì `<math>` nào cũng có, kể cả khi nó do JS máy khách
 * sinh ra lúc chạy. Chỉ đọc thẳng file HTML trong `out/` mới phân biệt được hai chuyện đó.
 *
 * Ngày ai đó chuyển `latexToMathml()` vào một client component, mọi test khác vẫn xanh và chỉ
 * phép kiểm này đỏ.
 */
let detailHtml = '';
try {
  detailHtml = readFileSync('out/cong-thuc/pe/index.html', 'utf8');
} catch {
  // Ba check dưới tự trượt vì chuỗi rỗng.
}

check(
  'trang chi tiết có ký hiệu toán DỰNG SẴN trong HTML tĩnh',
  detailHtml.includes('<math'),
  '<math> của KaTeX, dựng lúc build',
);

/*
 * Nhánh MathML không cần một dòng CSS nào của KaTeX. Nếu ai đó đổi sang `output: 'html'` thì HTML
 * sẽ mang `class="katex-html"`, mà không nạp `katex.min.css` thì nó hiện thành một đống ký tự
 * chồng lên nhau — trông vẫn "có công thức" nếu chỉ kiểm `<math`.
 */
check(
  'ký hiệu toán KHÔNG kéo theo nhánh HTML của KaTeX (vốn đòi CSS + font riêng)',
  detailHtml !== '' && !detailHtml.includes('katex-html'),
  'chỉ MathML',
);

check(
  'không nạp katex.min.css hay font của KaTeX',
  detailHtml !== '' && !detailHtml.includes('katex.min.css') && !detailHtml.includes('KaTeX_Main'),
  '0 tài sản kèm theo',
);

/* ── Màn "Về chúng tôi" ──────────────────────────────────────────────────── */

let aboutHtml = '';
try {
  aboutHtml = readFileSync('out/ve-chung-toi/index.html', 'utf8');
} catch {
  // check dưới tự trượt.
}

/*
 * Màn này là SERVER component có chủ đích: toàn bộ prose phải nằm sẵn trong HTML tĩnh, vì đó là
 * thứ bộ máy tìm kiếm đọc và cũng là thứ hiện ra khi JavaScript chưa tải. Kiểm hai đoạn chữ ở hai
 * đầu trang chứ không chỉ một, để "trang có dựng" và "trang dựng ĐỦ" là hai điều khác nhau.
 */
check(
  'màn Về chúng tôi dựng sẵn prose trong HTML tĩnh, không phải đảo client',
  aboutHtml !== '' &&
    !aboutHtml.includes(BAILOUT) &&
    aboutHtml.includes('đồ thị phụ thuộc') &&
    aboutHtml.includes('Faculator không phải là gì'),
);

/*
 * Đúng MỘT `<h1>`. Màn này cố ý đứng ngoài `HEADER_TITLES` để dải mở đầu tự mang tiêu đề — thêm
 * nó vào bảng mà quên gỡ hero là trang có hai tiêu đề cấp một. Xem `routes.ts`.
 */
check(
  'màn Về chúng tôi có đúng một <h1> — hero tự mang tiêu đề',
  (aboutHtml.match(/<h1[\s>]/g) ?? []).length === 1,
  `${String((aboutHtml.match(/<h1[\s>]/g) ?? []).length)} thẻ h1`,
);

/*
 * Bản vẽ có hai nút; chủ dự án bỏ nút "Cài lên thiết bị" vì làm thật thì phải bắt
 * `beforeinstallprompt`, thứ Safari iOS không có. Cửa này chặn nút ấy quay lại khi ai đó mở lại
 * bản vẽ, và chặn luôn chiều ngược lại — nút CTA biến mất thì trang mất đường ra duy nhất.
 */
check(
  'dải kêu gọi có đúng một nút, trỏ về /cong-thuc/',
  (aboutHtml.match(/class="[^"]*ctaAction/g) ?? []).length === 1,
);

/*
 * Ảnh minh hoạ là tài sản do người dựng chép tay vào `public/`, không phải thứ build sinh ra —
 * nên quên chép thì mọi thứ vẫn xanh và chỉ có một ô vỡ giữa trang. Kiểm cả kích thước khai trong
 * thẻ: đó là thứ chừa sẵn khung cho ảnh, thiếu là trang giật khi ảnh về.
 */
check(
  'ảnh minh hoạ có trong out/ và thẻ khai sẵn kích thước',
  existsSync('out/about-hero.png') && /<img[^>]+width="1040"[^>]+height="716"/.test(aboutHtml),
  existsSync('out/about-hero.png') ? '' : 'thiếu public/about-hero.png',
);

/* ── Trang 404 (đợt 14) ──────────────────────────────────────────────────── */

let notFoundHtml = '';
try {
  notFoundHtml = readFileSync('out/404.html', 'utf8');
} catch {
  // check dưới tự trượt.
}

check(
  'trang 404 là bản tiếng Việt, nằm trong AppShell',
  notFoundHtml.includes('Không tìm thấy trang này') && notFoundHtml.includes('href="/tim-kiem/"'),
  'trước đợt 14 là bản mặc định tiếng Anh của Next, không thanh điều hướng',
);

/* ── PWA (gói 3.6.2) ─────────────────────────────────────────────────────── */

check(
  'manifest được khai trong HTML và có mặt trong out/',
  listHtml.includes('rel="manifest"') && existsSync('out/manifest.webmanifest'),
);

check(
  'service worker có mặt ở gốc out/ — phải ở gốc thì phạm vi mới phủ cả site',
  existsSync('out/sw.js'),
);

/*
 * PNG là thứ QUYẾT ĐỊNH việc cài được hay không: Chrome từ chối biểu tượng SVG trong manifest
 * và iOS không đọc SVG cho apple-touch-icon. Trước đợt 15 manifest chỉ khai SVG nên PWA không
 * cài được ở nền tảng nào — build vẫn xanh. Cửa kiểm này chặn việc đó tái diễn.
 */
check(
  'biểu tượng PNG có đủ: 192, 512, maskable 512 và apple-touch 180',
  ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'].every((name) =>
    existsSync(`out/${name}`),
  ),
);

const manifest = existsSync('out/manifest.webmanifest')
  ? readFileSync('out/manifest.webmanifest', 'utf8')
  : '';

check(
  'manifest khai biểu tượng PNG chứ không chỉ SVG',
  manifest.includes('image/png') && manifest.includes('maskable'),
);

check('biểu tượng SVG vẫn còn cho tab trình duyệt', existsSync('out/icon.svg'));

/*
 * SVG phải là XML HỢP LỆ, không chỉ là "file có tồn tại".
 *
 * Lỗi thật đã gặp: comment trong `icon.svg` viết tên biến CSS đầy đủ (hai dấu gạch ở đầu).
 * Đặc tả XML cấm chuỗi hai gạch ngang bên trong comment, nên trình duyệt TỪ CHỐI dựng cả
 * file — favicon và mục SVG của manifest hỏng im lặng, không lỗi nào hiện ra ở đâu, và
 * `existsSync` vẫn xanh vì file vẫn nằm đó. Bắt được bằng cách nạp thử vào <img> trong
 * Chrome; ở đây gác lại bằng chính điều kiện gây lỗi.
 */
const svgFiles = ['out/icon.svg', 'out/icon-maskable.svg'].filter((f) => existsSync(f));
const badSvg = svgFiles.filter((file) =>
  [...readFileSync(file, 'utf8').matchAll(/<!--([\s\S]*?)-->/g)].some((m) => m[1].includes('--')),
);

check(
  'SVG là XML hợp lệ — không có "--" trong comment',
  svgFiles.length > 0 && badSvg.length === 0,
  badSvg.length > 0
    ? `${badSvg.join(', ')} — trình duyệt sẽ từ chối dựng, favicon hỏng im lặng`
    : `${String(svgFiles.length)} file`,
);

/*
 * Đường ra khỏi trang chi tiết.
 *
 * Chủ dự án báo: vào một công thức rồi thì không có lối quay về danh sách để chọn cái khác.
 * Kiểm trên HTML TĨNH chứ không chỉ ở test jsdom — nút này phải là thẻ `<a>` thật, có mặt từ
 * lượt tải đầu, chạy được cả khi JavaScript chưa tải xong. Dựng bằng `<button>` + router là
 * lọt test mà hỏng đúng lúc mạng chậm.
 */
/*
 * Hai chuỗi phải nằm trong CÙNG MỘT thẻ <a>, không phải hai lần `includes` rời nhau.
 *
 * Bản trước kiểm rời và vì thế không gác được gì: vế `href="/cong-thuc/"` luôn đúng trên mọi
 * trang nhờ thanh điều hướng dưới (BottomTabBar render sẵn link ấy vào HTML tĩnh), nên thay
 * BackLink bằng `<button onClick={router.push}>Danh sách công thức</button>` thì chữ vẫn được
 * dựng vào HTML, href vẫn có từ thanh dưới — hai vế đều đạt, cửa xanh, mà nút quay về chết
 * đúng lúc mạng chậm. Chính là regression mà comment phía trên nói phép kiểm này tồn tại để chặn.
 *
 * Lookahead phủ định chặn không cho vắt qua `</a>`, nên chữ phải thật sự nằm trong thẻ neo đó.
 */
const BACK_LINK = /<a[^>]*href="\/cong-thuc\/"[^>]*>(?:(?!<\/a>)[\s\S])*?Danh sách công thức/;
const detailPages = ['out/cong-thuc/pe/index.html', 'out/cong-thuc/rsi-wilder/index.html'];
const withBackLink = detailPages.filter((page) => {
  if (!existsSync(page)) return false;
  return BACK_LINK.test(readFileSync(page, 'utf8'));
});

check(
  'trang chi tiết có link quay về danh sách NGAY trong HTML tĩnh',
  withBackLink.length === detailPages.length,
  `${String(withBackLink.length)}/${String(detailPages.length)} trang`,
);

/*
 * Khối chuỗi công thức (WF-04, gói 5.2.3) — hai tính chất chỉ nhìn thấy được trên bản build.
 *
 * 1. Khối KHÔNG được có trong HTML tĩnh. Nó chỉ hiện ở chế độ Nâng cao, mà chế độ đọc từ
 *    localStorage sau hydrate; HTML build sẵn luôn là chế độ Cơ bản mặc định. Nếu id
 *    `khoi-chuoi` xuất hiện trong HTML tĩnh nghĩa là ai đó đã đổi mặc định sang Nâng cao —
 *    một thay đổi sản phẩm phải là quyết định, không phải tai nạn — hoặc điều kiện dựng khối
 *    bị nới. Cả hai đều đáng chặn ở đây vì không ca vitest nào nhìn thấy HTML xuất ra.
 *
 * 2. Thân khối (`ChainBody`) phải nằm trong một chunk NẠP TRỄ: có mặt trên đĩa nhưng không
 *    một file HTML nào tham chiếu bằng thẻ <script>. Đây đúng lời hứa của `ChainPanel` —
 *    111 trang chi tiết không trả tiền cho một khối chỉ 7 công thức dùng. Dò bằng tên class
 *    CSS module (`stepFailed`) chứ không bằng chữ tiếng Việt: chuỗi tiếng Việt trong bundle
 *    bị escape unicode tuỳ chỗ, so sánh thô sẽ âm tính giả.
 */
const waccPath = 'out/cong-thuc/wacc/index.html';
const waccHtml = existsSync(waccPath) ? readFileSync(waccPath, 'utf8') : '';

check(
  'khối chuỗi WF-04 không rò vào HTML tĩnh (mặc định vẫn là chế độ Cơ bản)',
  waccHtml !== '' && !waccHtml.includes('id="khoi-chuoi"'),
  waccHtml === '' ? `thiếu ${waccPath}` : 'HTML tĩnh của trang trong chuỗi không mang khối',
);

const chunkDir = 'out/_next/static/chunks';
const chainChunks = readdirSync(chunkDir)
  .filter((name) => name.endsWith('.js'))
  .filter((name) => readFileSync(`${chunkDir}/${name}`, 'utf8').includes('stepFailed'));

/** Mọi file HTML trong out/ — một trang bất kỳ tham chiếu chunk là ranh giới đã thủng. */
function htmlFilesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return entry.name === '_next' ? [] : htmlFilesUnder(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const chainChunkReferenced =
  chainChunks.length > 0 &&
  htmlFilesUnder('out').some((page) => {
    const pageHtml = readFileSync(page, 'utf8');
    return chainChunks.some((name) => pageHtml.includes(name));
  });

check(
  'thân khối chuỗi nằm trong chunk nạp trễ — không trang nào tải sẵn',
  chainChunks.length > 0 && !chainChunkReferenced,
  chainChunks.length === 0
    ? 'không tìm thấy chunk nào mang ChainBody — khối biến mất khỏi bản build?'
    : chainChunkReferenced
      ? `chunk ${chainChunks.join(', ')} bị tham chiếu tĩnh — ranh giới next/dynamic thủng`
      : `${chainChunks.join(', ')} chỉ nạp khi cần`,
);

/*
 * robots.txt và sitemap.xml phải nói CÙNG một tên miền.
 *
 * Hai file này từng có hai nguồn: `sitemap.ts` đọc `NEXT_PUBLIC_SITE_URL`, còn
 * `public/robots.txt` ghi cứng `pages.dev` kèm một dòng chú thích dặn nhớ sửa cùng lúc. Quên
 * sửa thì bot đọc robots.txt rồi đi tìm sitemap ở tên miền cũ — 404, và không phép kiểm nào đỏ
 * vì bản thân mỗi file đều hợp lệ. Nay cả hai sinh từ `src/app/site-url.ts`; cửa kiểm này gác
 * chuyện ai đó tách chúng ra lần nữa.
 *
 * Kiểm trên bản BUILD chứ không trên mã nguồn: biến môi trường chỉ có giá trị thật lúc build,
 * nên đây là chỗ duy nhất thấy được tên miền mà người dùng sẽ nhận.
 */
const robotsPath = 'out/robots.txt';
const sitemapPath = 'out/sitemap.xml';

if (existsSync(robotsPath) && existsSync(sitemapPath)) {
  const robotsTxt = readFileSync(robotsPath, 'utf8');
  const sitemapXml = readFileSync(sitemapPath, 'utf8');

  const robotsHost = /Sitemap:\s*(https?:\/\/[^/\s]+)/i.exec(robotsTxt)?.[1];
  const sitemapHost = /<loc>\s*(https?:\/\/[^/\s]+)/i.exec(sitemapXml)?.[1];

  check(
    'robots.txt và sitemap.xml trỏ cùng một tên miền',
    robotsHost !== undefined && robotsHost === sitemapHost,
    robotsHost === sitemapHost
      ? robotsHost
      : `robots.txt: ${robotsHost ?? 'không thấy dòng Sitemap:'} · sitemap.xml: ${sitemapHost ?? 'không thấy <loc>'}`,
  );
} else {
  check(
    'robots.txt và sitemap.xml trỏ cùng một tên miền',
    false,
    `thiếu file: ${[robotsPath, sitemapPath].filter((f) => !existsSync(f)).join(', ')}`,
  );
}

const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ${String(checks.length - failed.length)}/${String(checks.length)} đạt ===`);

if (failed.length > 0) {
  console.error(
    '\nBản build tĩnh không đạt. Màn Công thức là màn mở đầu, URL priority 1.0 của sitemap.',
  );
  process.exit(1);
}
