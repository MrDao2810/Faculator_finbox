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
 * (fallback={null} → 14,6 kB, không một link công thức nào) cho tới khi đợt 14 thay fallback
 * bằng `StaticFormulaList` — và thêm cửa kiểm ở dưới để nó không tái diễn.
 *
 * Trang chủ là URL priority 1.0 của sitemap và là trang duy nhất Google thật sự cần đọc. Nếu
 * người sau "sửa cho nhất quán" bằng cách cho `HomeSearchPanel` dùng `useListParams()`, trang
 * chủ sẽ lặng lẽ mất 33 kB nội dung mà không test nào đỏ. Script này là chỗ chặn cứng.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

/** Marker Next chèn vào chỗ cây bị loại khỏi HTML tĩnh. */
const BAILOUT = 'BAILOUT_TO_CLIENT_SIDE_RENDERING';

/**
 * Ngưỡng kích thước trang chủ. Đặt thấp hơn hẳn số thật (khoảng 33 kB) để không phải sửa mỗi
 * lần thêm bớt một công thức, nhưng vẫn cao hơn hẳn một trang chỉ còn vỏ AppShell (~14 kB).
 */
const MIN_HOME_BYTES = 25_000;

const checks = [];

function check(name, pass, detail = '') {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${name}${detail === '' ? '' : ` — ${detail}`}`);
}

let html = '';
try {
  html = readFileSync('out/index.html', 'utf8');
} catch {
  console.error('Không đọc được out/index.html — chạy `npm run build` trước.');
  process.exit(1);
}

const bytes = statSync('out/index.html').size;

check(
  'trang chủ không rơi vào chế độ dựng ở máy khách',
  !html.includes(BAILOUT),
  html.includes(BAILOUT)
    ? 'có marker bailout — nhiều khả năng vừa có component dùng useSearchParams() trong cây trang chủ'
    : 'không có marker bailout',
);

check('khối "Công thức dùng hằng ngày" nằm trong HTML tĩnh', html.includes('id="home-featured"'));

/*
 * Đủ SỐ Ô ghim, không chỉ đủ cái tiêu đề.
 *
 * Cửa kiểm ngay trên chỉ tìm `id="home-featured"`, mà id đó nằm ở `<h2>` phía server nên nó còn
 * nguyên kể cả khi lưới bên dưới rỗng. Từ đợt cá nhân hoá, lưới do một client component dựng:
 * nếu người sau cho nó chờ một cờ `hydrated` rồi mới vẽ, 18 link công thức biến mất khỏi HTML
 * tĩnh mà cửa kiểm cũ vẫn xanh. Đây là chỗ chặn.
 *
 * Số ghim đọc THẲNG từ chỉ mục đã sinh chứ không viết cứng — thêm bớt một `isFeatured` không
 * được biến script này thành việc phải sửa tay.
 */
const soGhim = (
  readFileSync('src/core/formulas/summaries.generated.ts', 'utf8').match(/isFeatured: true/g) ?? []
).length;
const homeLinks = new Set(html.match(/href="\/cong-thuc\/[a-z0-9-]+\/"/g) ?? []);

check(
  `trang chủ dựng sẵn đủ ${String(soGhim)} link công thức ghim trong HTML tĩnh`,
  soGhim > 0 && homeLinks.size >= soGhim,
  `${String(homeLinks.size)} link duy nhất, cần ${String(soGhim)}`,
);

check('khối "Duyệt theo nhóm" nằm trong HTML tĩnh', html.includes('id="home-browse"'));

check(
  'trang chủ có đúng một <h1>',
  (html.match(/<h1[\s>]/g) ?? []).length === 1,
  `đếm được ${String((html.match(/<h1[\s>]/g) ?? []).length)}`,
);

/*
 * Dải mở đầu phải mang CẢ HAI con số, y như ba dòng tiêu đề bên dưới nó.
 *
 * Trước đây chỗ này in thẳng `REGISTRY.formulas.length` = 111, trong khi chế độ Cơ bản — mặc định
 * của người mở lần đầu — chỉ với tới 79. Hai con số nói về cùng một thư viện cãi nhau trong cùng
 * một màn hình, và bản build tĩnh là chỗ duy nhất thấy được điều đó: ca kiểm DOM không chạy trang
 * chủ, còn phép chọn thì nằm trong CSS theo `data-mode`.
 *
 * Khoanh vùng trong <header> chứ không quét cả trang: `countBasic` cũng có ở dòng tiêu đề khác,
 * nên một phép kiểm trần vẫn xanh sau khi hero quay về in cứng.
 */
const hero = html.match(/<header[^>]*hero[^>]*>[\s\S]*?<\/header>/);
check(
  'dải mở đầu đếm theo chế độ (Cơ bản / Nâng cao), không in cứng tổng số',
  hero !== null && hero[0].includes('countBasic') && hero[0].includes('countAdvanced'),
  hero === null ? 'không tìm thấy <header> hero' : 'thiếu một trong hai nhánh con số',
);

check('trang chủ có link tới trang công thức', /href="\/cong-thuc\/[a-z0-9-]+\/"/.test(html));

check(
  `trang chủ đủ nội dung (> ${String(MIN_HOME_BYTES)} B)`,
  bytes > MIN_HOME_BYTES,
  `${String(bytes)} B`,
);

/*
 * Hai màn KHÔNG có mục ở thanh dưới (WF-18 chốt đúng bốn mục), nên lối vào duy nhất của chúng
 * là hai link dưới đây. Trước đợt 12 cả hai màn đã dựng xong mà không có link nào trỏ tới —
 * chỉ gõ URL tay mới mở được, và không test nào đỏ. Đây là chỗ chặn việc đó tái diễn.
 */
check(
  'trang chủ có lối vào màn bảng dữ liệu /du-lieu/',
  html.includes('href="/du-lieu/"'),
  'khối "Công cụ"',
);

check(
  'thanh trên có lối vào màn tìm kiếm /tim-kiem/',
  html.includes('href="/tim-kiem/"'),
  'nút kính lúp',
);

/* ── /cong-thuc/ — URL chính danh của danh sách, sitemap khai priority 0.9 ── */

/*
 * Khác trang chủ, trang này ĐƯỢC PHÉP mang marker bailout: FormulaBrowser bên trong Suspense
 * vẫn dựng ở máy khách (nó cần useSearchParams). Thứ phải có là FALLBACK — bản danh sách tĩnh
 * nằm sẵn trong HTML. Vì vậy ở đây không kiểm marker, chỉ kiểm nội dung thật.
 */
let listHtml = '';
try {
  listHtml = readFileSync('out/cong-thuc/index.html', 'utf8');
} catch {
  // check dưới sẽ tự trượt vì chuỗi rỗng không chứa link nào.
}

const formulaLinks = new Set(
  [...listHtml.matchAll(/href="\/cong-thuc\/([a-z0-9-]+)\/"/g)].map((m) => m[1]),
);

/*
 * ĐỦ công thức, không phải "có là được".
 *
 * Từ đợt này chế độ Cơ bản lọc bớt danh sách theo cấp độ (FR-09), và mặc định của sản phẩm
 * LÀ chế độ Cơ bản — nghĩa là 32 công thức mức nâng cao không hiện trên màn khi mới vào. Việc
 * đó chỉ được phép xảy ra ở phía máy khách: `StaticFormulaList` là server component, không đọc
 * localStorage, nên HTML tĩnh phải luôn có đủ đường vào cho cả 111. Ai đó "sửa cho nhất quán"
 * bằng cách lọc luôn ở fallback là lặng lẽ giấu 32 URL khỏi Google, mà build vẫn xanh.
 */
const TONG_CONG_THUC = (
  readFileSync('src/core/formulas/summaries.generated.ts', 'utf8').match(/categoryId:/g) ?? []
).length;

check(
  '/cong-thuc/ có ĐỦ link công thức trong HTML tĩnh (fallback không lọc theo chế độ)',
  formulaLinks.size === TONG_CONG_THUC,
  `${String(formulaLinks.size)} / ${String(TONG_CONG_THUC)} link công thức khác nhau`,
);

check(
  '/cong-thuc/ có dòng đếm trong HTML tĩnh',
  / công thức</.test(listHtml),
  'dòng "N công thức"',
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
  html.includes('rel="manifest"') && existsSync('out/manifest.webmanifest'),
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
  console.error('\nBản build tĩnh không đạt. Trang chủ là URL priority 1.0 của sitemap.');
  process.exit(1);
}
